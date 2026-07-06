# BuildKit Cache Mount vs Remote Cache 对比

## 结论：单机 Jenkins 只需要 BuildKit，不需要 Remote Cache

---

## 性能对比

| 方案               | 首次构建 | 第二次构建 | 网络延迟        | 配置复杂度 |
| ------------------ | -------- | ---------- | --------------- | ---------- |
| **BuildKit Cache** | ~4 分钟  | ~30 秒 ✅  | 无              | ⭐ 简单    |
| **Remote Cache**   | ~4 分钟  | ~40 秒     | 有（上传/下载） | ⭐⭐ 中等  |

对于单机 Jenkins，**BuildKit Cache 更快！**

---

## 何时需要 Remote Cache？

### ✅ 需要 Remote Cache

1. **多台 Jenkins 节点** - 多个构建服务器需要共享缓存
2. **团队协作** - 开发者本地 + Jenkins 共享缓存
3. **云端 CI** - GitHub Actions、GitLab CI 等
4. **异地部署** - 多个地区的构建服务器

### ❌ 不需要 Remote Cache

1. **单机 Jenkins** - 只有一台构建服务器（你的情况）
2. **本地缓存足够** - 磁盘空间充足
3. **无跨机器需求** - 所有构建在同一台机器

---

## 使用 BuildKit Cache Mount

### 修改后的构建命令

安装 BuildKit 后，修改 Jenkinsfile 的构建部分：

```groovy
stage('Build Docker Images') {
    steps {
        script {
            echo '=========================================='
            echo '🔨 开始构建 Docker 镜像...'
            echo '=========================================='

            // 创建共享的 Turbo 缓存目录
            sh 'mkdir -p ${WORKSPACE}/.turbo-cache'

            def apps = params.APP_TO_BUILD == 'all'
                ? ['activities', 'admin-system-1', 'admin-system-3', 'dapp']
                : [params.APP_TO_BUILD]

            apps.each { appName ->
                echo "构建应用: ${appName}"

                def nodeVersion = sh(
                    script: "cat apps/${appName}/.nvmrc 2>/dev/null || echo '20'",
                    returnStdout: true
                ).trim()

                def dockerfile = appName == 'dapp' ? 'Dockerfile.nextjs' : 'Dockerfile.static'
                def imageName = "${HARBOR_URL}/${HARBOR_PROJECT}/${appName}:${IMAGE_TAG}"
                def imageLatest = "${HARBOR_URL}/${HARBOR_PROJECT}/${appName}:${env.BRANCH_NAME}-latest"

                echo "使用 Dockerfile: ${dockerfile}"
                echo "镜像名称: ${imageName}"

                // 使用 BuildKit + Cache Mount
                sh """
                    DOCKER_BUILDKIT=1 docker build \\
                        --build-arg NODE_VERSION=${nodeVersion} \\
                        --build-arg APP_NAME=${appName} \\
                        --build-arg BUILD_ENV=${DEPLOY_ENV} \\
                        --cache-from type=local,src=${WORKSPACE}/.turbo-cache \\
                        --cache-to type=local,dest=${WORKSPACE}/.turbo-cache,mode=max \\
                        -t ${imageName} \\
                        -t ${imageLatest} \\
                        -f ${dockerfile} \\
                        .
                """

                echo "✅ ${appName} 镜像构建完成"
            }

            echo '=========================================='
            echo '✅ 所有镜像构建完成'
            echo '=========================================='
        }
    }
}
```

### 或者使用 bind mount（更简单）

```groovy
sh """
    DOCKER_BUILDKIT=1 docker build \\
        --build-arg APP_NAME=${appName} \\
        --mount=type=bind,source=${WORKSPACE}/.turbo,target=/app/.turbo \\
        -t ${imageName} \\
        -f ${dockerfile} \\
        .
"""
```

---

## 缓存效果验证

### 首次构建日志

```
packages/shared/ui build$ tsup
packages/shared/ui build: ✓ built in 2.5s
packages/shared/ui build: >>> TURBO
```

### 第二次构建日志（命中缓存）

```
packages/shared/ui build: cache hit, replaying logs
packages/shared/ui build: ✓ built in 0.1s
```

注意：没有 `[REMOTE]` 标记，表示使用本地缓存。

---

## 磁盘空间管理

### 查看缓存大小

```bash
du -sh ${WORKSPACE}/.turbo-cache
# 预计 ~450MB
```

### 清理缓存

```bash
# 在 Jenkins 中添加定期清理任务（可选）
rm -rf ${WORKSPACE}/.turbo-cache/*
```

或者在 Jenkinsfile 中添加清理逻辑：

```groovy
post {
    cleanup {
        script {
            // 如果缓存超过 1GB，清理旧缓存
            def cacheSize = sh(
                script: "du -sm ${WORKSPACE}/.turbo-cache 2>/dev/null | cut -f1 || echo 0",
                returnStdout: true
            ).trim().toInteger()

            if (cacheSize > 1024) {
                echo "缓存大小超过 1GB，清理旧缓存..."
                sh "find ${WORKSPACE}/.turbo-cache -type f -mtime +7 -delete"
            }
        }
    }
}
```

---

## 总结

### ✅ 推荐：只用 BuildKit（单机 Jenkins）

**优点：**

- 速度最快（本地缓存，无网络延迟）
- 配置简单（不需要额外服务）
- 运维成本低（不需要维护缓存服务）
- 磁盘占用可控（~450MB）

**缺点：**

- 无法跨机器共享（但你只有单机）

### 🔮 未来：考虑 Remote Cache

**场景：**

- 扩展到多台 Jenkins 节点
- 团队开发者本地也想复用缓存
- 使用云端 CI/CD 服务

**届时再部署：**

- 方案 B（Vercel） - 5 分钟配置
- 方案 C（自建） - 完全私有化

---

## 性能预估（BuildKit）

| 构建场景       | 当前耗时 | BuildKit 后耗时 | 改进            |
| -------------- | -------- | --------------- | --------------- |
| 首次构建       | ~4 分钟  | ~4 分钟         | -               |
| 无改动重复构建 | ~4 分钟  | ~30 秒          | **节省 87%** ✅ |
| 只改应用代码   | ~4 分钟  | ~1 分钟         | **节省 75%** ✅ |
| 只改 shared 包 | ~4 分钟  | ~1.5 分钟       | **节省 62%** ✅ |

**结论：BuildKit 足够！**
