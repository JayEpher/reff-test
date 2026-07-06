# Dockerfile.universal 优化说明

## 修复的问题

### 1. pnpm 版本问题

**修复前：**
```dockerfile
RUN npm install -g pnpm@8
```

**问题：** 版本不精确，可能导致与 `package.json` 中指定的 `pnpm@8.15.1` 不一致。

**修复后：**
```dockerfile
RUN corepack enable && corepack prepare pnpm@8.15.1 --activate
```

**优势：**
- ✅ 使用 Node.js 自带的 `corepack` 管理包管理器版本
- ✅ 版本与 `package.json` 中的 `packageManager` 字段完全一致
- ✅ 更快的安装速度（无需通过 npm 下载）
- ✅ 更好的版本控制和一致性

### 2. packages 复制问题

**修复前：**
```dockerfile
COPY packages/*/package.json ./packages/*/
```

**问题：** 
- Docker COPY 指令不支持目标路径使用通配符
- 无法正确复制嵌套的 `packages/shared/*` 目录结构
- 导致 pnpm install 时找不到依赖的 package.json

**修复后：**
```dockerfile
# 复制整个 packages 目录
COPY packages ./packages

# 只保留 package.json 文件，删除其他文件
RUN find ./packages -type f ! -name 'package.json' -delete && \
    find ./packages -type d -empty -delete
```

**优势：**
- ✅ 正确处理嵌套目录结构（packages/shared/*）
- ✅ 利用 Docker 分层缓存机制
- ✅ 自动适应新增的 packages，无需修改 Dockerfile
- ✅ 只保留 package.json，不会增加不必要的层大小

### 3. .npmrc 复制问题

**修复前：**
```dockerfile
COPY .npmrc* ./
```

**问题：** 通配符可能导致未预期的行为

**修复后：**
```dockerfile
COPY .npmrc ./
```

**优势：**
- ✅ 明确指定文件名
- ✅ 如果文件不存在会直接报错，便于调试

## 构建测试

### 测试单个应用

```bash
# 测试 activities 应用
docker build \
  --build-arg NODE_VERSION=20 \
  --build-arg APP_NAME=activities \
  --build-arg BUILD_ENV=production \
  --target production-static \
  -t test/activities:latest \
  -f Dockerfile.universal \
  .

# 测试 dapp 应用（Next.js）
docker build \
  --build-arg NODE_VERSION=20 \
  --build-arg APP_NAME=dapp \
  --build-arg BUILD_ENV=production \
  --target production-nextjs \
  -t test/dapp:latest \
  -f Dockerfile.universal \
  .
```

### 验证 pnpm 版本

```bash
docker run --rm test/activities:latest pnpm --version
# 应该输出: 8.15.1
```

### 验证依赖安装

```bash
# 构建到 dependencies 阶段并检查
docker build \
  --build-arg APP_NAME=activities \
  --target dependencies \
  -t test-deps \
  -f Dockerfile.universal \
  . && \
docker run --rm test-deps ls -la /app/packages/
```

## 性能优化建议

### 1. 使用 BuildKit 缓存

```bash
# 启用 BuildKit
export DOCKER_BUILDKIT=1

# 使用缓存构建
docker build \
  --cache-from type=registry,ref=107.173.87.162:8001/puff/activities:cache \
  --cache-to type=inline \
  --build-arg APP_NAME=activities \
  -t 107.173.87.162:8001/puff/activities:latest \
  -f Dockerfile.universal \
  .
```

### 2. 多阶段构建优化

当前 Dockerfile 已经使用了多阶段构建：

1. **base** - 基础镜像 + pnpm
2. **dependencies** - 安装依赖（可缓存）
3. **builder** - 构建应用
4. **production-static** - Nginx 生产镜像（最小化）
5. **production-nextjs** - Next.js 生产镜像

这样设计的好处：
- ✅ 依赖层可以被缓存，只有代码变化时才重新构建
- ✅ 最终镜像只包含运行时需要的文件
- ✅ 静态应用使用 nginx:alpine（约 20MB）
- ✅ Next.js 应用也经过精简

### 3. 并行构建

Jenkins 可以并行构建多个应用：

```groovy
stage('Build All Images') {
    steps {
        parallel(
            'activities': {
                sh 'docker build --build-arg APP_NAME=activities ...'
            },
            'admin-system-1': {
                sh 'docker build --build-arg APP_NAME=admin-system-1 ...'
            },
            'admin-system-3': {
                sh 'docker build --build-arg APP_NAME=admin-system-3 ...'
            },
            'dapp': {
                sh 'docker build --build-arg APP_NAME=dapp ...'
            }
        )
    }
}
```

## 故障排查

### 问题 1: pnpm install 失败

```
ERR_PNPM_NO_MATCHING_VERSION  No matching version found for pnpm@8
```

**解决：**
- 检查 Node.js 版本是否 >= 16.13（corepack 要求）
- 尝试使用 `npm install -g pnpm@8.15.1` 作为后备方案

### 问题 2: 找不到 packages

```
ERR_PNPM_WORKSPACE_PKG_NOT_FOUND  Workspace package not found
```

**解决：**
- 检查 `pnpm-workspace.yaml` 配置
- 验证 packages 目录结构是否正确复制：
  ```bash
  docker run --rm --entrypoint sh test-deps -c "find /app/packages -name package.json"
  ```

### 问题 3: .npmrc 配置问题

如果使用私有 npm registry，确保 `.npmrc` 包含正确的配置：

```ini
# .npmrc
registry=https://registry.npmmirror.com/
# 或者使用私有 registry
# @puff:registry=https://your-private-registry.com/
```

**注意：** 不要在 `.npmrc` 中存储敏感信息（如 token），应该使用构建参数：

```dockerfile
ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc && \
    pnpm install --frozen-lockfile && \
    rm -f .npmrc
```

## 最佳实践总结

1. ✅ 使用 `corepack` 管理 pnpm 版本
2. ✅ 精确匹配 `package.json` 中的版本
3. ✅ 利用 Docker 分层缓存
4. ✅ 多阶段构建减小最终镜像大小
5. ✅ 只复制必要的文件到最终镜像
6. ✅ 使用 `--frozen-lockfile` 确保依赖一致性
7. ✅ 生产镜像使用最小化基础镜像（alpine）
8. ✅ 不在镜像中存储敏感信息

## 相关文件

- `Dockerfile.universal` - 通用 Dockerfile
- `pnpm-workspace.yaml` - Workspace 配置
- `.npmrc` - npm/pnpm 配置
- `docker-compose.yml` - 本地开发/测试配置
- `Jenkinsfile` - CI/CD 流水线配置
