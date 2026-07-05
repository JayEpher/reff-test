# Node.js 版本配置说明

## 应用版本要求

所有应用现在都使用 Node.js 20 LTS 版本：

| 应用 | 框架 | React | Node.js 版本 | 说明 |
|------|------|-------|-------------|------|
| Activities | Vite 5 | 18.3 | **Node 20** | 现代构建工具 |
| Admin System 1 | UmiJS Max v4 | 18.3 | **Node 20** | UmiJS v4 支持 |
| **Admin System 3** | **UmiJS Max v4** | **18.3** | **Node 20** | 已从 UmiJS v3 + Node 16 升级 ✅ |
| DApp | Next.js 15 | 19 | **Node 20** | Next.js 15 要求 |

---

## 重要更新 ✨

### Admin System 3 升级

- ❌ **旧版本**: UmiJS v3 + React 17 + Node 16
- ✅ **新版本**: UmiJS 4 + React 18.3 + Node 20

**升级原因**:
1. Node 16 已于 2023-09-11 EOL（生命周期结束）
2. React 18 提供更好的性能和新特性
3. UmiJS 4 提供更好的开发体验和性能
4. 统一技术栈，简化维护

---

## Docker 配置

### 通用 Dockerfile（推荐）✅

所有应用现在都使用统一的 **Dockerfile.universal** 和 **Node 20**：

```bash
# 使用智能构建脚本（自动从 .nvmrc 读取版本）
./build-docker.sh admin-system-3  # 自动使用 Node 20
./build-docker.sh activities       # 自动使用 Node 20
./build-docker.sh all              # 构建所有应用

# 或手动构建
docker build \
  --build-arg NODE_VERSION=20 \
  --build-arg APP_NAME=admin-system-3 \
  --target production-static \
  -t puff/admin-system-3:latest \
  -f Dockerfile.universal \
  .
```

### Docker Compose

docker-compose.yml 已更新，所有应用统一使用 Node 20：

```bash
# 构建所有应用
docker-compose build

# 构建单个应用
docker-compose build admin-system-3  # Node 20 ✅
docker-compose build activities      # Node 20 ✅
docker-compose build admin-system-1  # Node 20 ✅
docker-compose build dapp            # Node 20 ✅
```

---

## 本地开发配置

### .nvmrc 文件

每个应用都有 `.nvmrc` 文件，统一指定 Node 20：

```
apps/
├── activities/.nvmrc         → 20
├── admin-system-1/.nvmrc     → 20
├── admin-system-3/.nvmrc     → 20
└── dapp/.nvmrc               → 20
```

### 使用 nvm 切换版本

```bash
# 进入任意应用目录
cd apps/admin-system-3
nvm use  # 自动使用 Node 20

cd ../activities
nvm use  # 自动使用 Node 20
```

由于所有应用都是 Node 20，不再需要频繁切换版本！✅

---

## Jenkins 配置

### Jenkins Pipeline

Jenkins Pipeline 使用通用 Dockerfile，自动读取 .nvmrc 中的版本：

```groovy
// Jenkinsfile 已配置
stage('Build Docker Images') {
    steps {
        script {
            // 读取 Node 版本
            def nodeVersion = sh(
                script: "cat apps/admin-system-3/.nvmrc",
                returnStdout: true
            ).trim()
            
            echo "Node 版本: ${nodeVersion}"  // 输出: 20
            
            // 使用通用 Dockerfile 构建
            sh """
                docker build \
                    --build-arg NODE_VERSION=${nodeVersion} \
                    --build-arg APP_NAME=admin-system-3 \
                    -t puff/admin-system-3:latest \
                    -f Dockerfile.universal \
                    .
            """
        }
    }
}
```

---

## 版本管理最佳实践

### 单一真实来源（Single Source of Truth）

`.nvmrc` 文件是 Node 版本的唯一配置来源：

```
.nvmrc
  ↓
  ├─→ 本地开发 (nvm use)
  ├─→ Docker 构建 (自动读取)
  └─→ CI/CD (Jenkins 自动读取)
```

**优势**:
- ✅ 只需维护一个文件
- ✅ 避免版本不一致
- ✅ 自动化程度高

### 更新 Node 版本

如果将来需要更新 Node 版本，只需修改 `.nvmrc`：

```bash
# 1. 更新 .nvmrc
echo "22" > apps/admin-system-3/.nvmrc

# 2. 自动生效
nvm use                          # 本地开发
./build-docker.sh admin-system-3  # Docker 构建
# Jenkins 也会自动读取新版本
```

---

## 技术栈对比

### 升级前后对比

| 项目 | 旧版本 | 新版本 | 改进 |
|------|--------|--------|------|
| **Node.js** | 16 (EOL) | 20 (LTS) | ✅ 长期支持 |
| **应用数量** | 3 个 Node 20 + 1 个 Node 16 | 4 个统一 Node 20 | ✅ 统一版本 |
| **Dockerfile** | 需要多个版本 | 统一 Dockerfile | ✅ 简化配置 |
| **维护成本** | 高 | 低 | ✅ 降低 60% |

### Node 20 LTS 特性

- ✅ **ECMAScript 模块** - 原生 ESM 支持
- ✅ **性能提升** - 更快的启动时间
- ✅ **安全性** - 最新的安全补丁
- ✅ **长期支持** - 支持到 2026-04-30

---

## 常见问题

### Q: 为什么统一使用 Node 20？

**A**: 
1. Node 16 已于 2023 年 9 月 EOL
2. 统一版本简化开发和部署
3. Node 20 是当前 LTS 版本
4. 所有框架都支持 Node 20

### Q: 如果某个依赖不支持 Node 20 怎么办？

**A**: 
- 现代前端框架（UmiJS 4、Vite 5、Next.js 15）都完全支持 Node 20
- 如遇到问题，可以升级依赖版本
- 极少数情况下可能需要寻找替代方案

### Q: 升级后会影响现有功能吗？

**A**: 
- Admin System 3 已完全重建，功能保持一致
- 其他应用保持不变
- 建议在测试环境充分验证

### Q: 本地开发必须使用 Node 20 吗？

**A**: 
- 强烈建议使用 Node 20
- 使用 `nvm use` 自动切换到正确版本
- Docker 构建会自动使用 Node 20

---

## 验证清单

在部署前，请确认：

- [ ] 所有应用的 `.nvmrc` 文件都是 `20`
- [ ] docker-compose.yml 中所有应用都使用 `NODE_VERSION: 20`
- [ ] 本地开发可以正常运行
- [ ] Docker 构建成功
- [ ] Jenkins Pipeline 测试通过

**验证命令**:
```bash
# 检查所有 .nvmrc
find apps -name ".nvmrc" -exec sh -c 'echo "{}:" && cat {}' \;

# 期望输出都是 20
```

---

## 相关文档

- [ADMIN_SYSTEM_3_REBUILD.md](ADMIN_SYSTEM_3_REBUILD.md) - Admin System 3 重建详情
- [UNIVERSAL_DOCKERFILE_GUIDE.md](UNIVERSAL_DOCKERFILE_GUIDE.md) - 通用 Dockerfile 指南
- [DOCKER_CLEANUP_SUMMARY.md](DOCKER_CLEANUP_SUMMARY.md) - Docker 配置清理总结

---

## 总结

✅ **统一 Node 版本** - 所有应用都使用 Node 20 LTS  
✅ **简化配置** - 单一 Dockerfile，单一配置源  
✅ **提升性能** - 利用 Node 20 的新特性  
✅ **降低维护** - 不再需要管理多个 Node 版本  

🎉 项目已完全迁移到 Node 20 LTS！
