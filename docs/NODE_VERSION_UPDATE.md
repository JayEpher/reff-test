# Node.js 版本更新总结

## ✅ 已完成的更新

### Dockerfile 更新

| 文件 | 原版本 | 新版本 | 状态 |
|------|--------|--------|------|
| `docker/Dockerfile.admin-system-3` | Node 18 | **Node 16** | ✅ 已更新 |
| `docker/Dockerfile.activities` | Node 18 | **Node 20** | ✅ 已更新 |
| `docker/Dockerfile.admin-system-1` | Node 18 | **Node 20** | ✅ 已更新 |
| `docker/Dockerfile.dapp` | Node 18 | **Node 20** | ✅ 已更新 |

### .nvmrc 文件（本地开发）

| 应用 | Node 版本 | 文件路径 | 状态 |
|------|----------|----------|------|
| Admin System 3 | 16 | `apps/admin-system-3/.nvmrc` | ✅ 已存在 |
| Activities | 20 | `apps/activities/.nvmrc` | ✅ 已创建 |
| Admin System 1 | 20 | `apps/admin-system-1/.nvmrc` | ✅ 已创建 |
| DApp | 20 | `apps/dapp/.nvmrc` | ✅ 已创建 |

---

## 🎯 版本配置总览

```
puff-monorepo/
├── apps/
│   ├── admin-system-3/     ← Node 16 (UmiJS v3 + React 17)
│   │   ├── .nvmrc (16)
│   │   └── Dockerfile → docker/Dockerfile.admin-system-3 (node:16-alpine)
│   │
│   ├── activities/         ← Node 20 (Vite 5 + React 18)
│   │   ├── .nvmrc (20)
│   │   └── Dockerfile → docker/Dockerfile.activities (node:20-alpine)
│   │
│   ├── admin-system-1/     ← Node 20 (UmiJS Max v4 + React 18)
│   │   ├── .nvmrc (20)
│   │   └── Dockerfile → docker/Dockerfile.admin-system-1 (node:20-alpine)
│   │
│   └── dapp/               ← Node 20 (Next.js 15 + React 19)
│       ├── .nvmrc (20)
│       └── Dockerfile → docker/Dockerfile.dapp (node:20-alpine)
```

---

## 🚀 使用方法

### Docker 构建（自动使用正确版本）

```bash
# 方式 1: 使用 docker-compose（推荐）
docker-compose build                  # 构建所有应用，自动使用正确版本
docker-compose build admin-system-3   # 只构建 Admin System 3 (Node 16)
docker-compose build activities       # 只构建 Activities (Node 20)

# 方式 2: 手动构建
docker build -f docker/Dockerfile.admin-system-3 -t puff/admin-system-3 .  # Node 16
docker build -f docker/Dockerfile.activities -t puff/activities .           # Node 20
docker build -f docker/Dockerfile.admin-system-1 -t puff/admin-system-1 .  # Node 20
docker build -f docker/Dockerfile.dapp -t puff/dapp .                       # Node 20

# 方式 3: 使用快速脚本
./docker.sh build admin-system-3  # 自动使用正确的 Dockerfile (Node 16)
./docker.sh build activities      # 自动使用正确的 Dockerfile (Node 20)
```

### 本地开发（使用 nvm）

```bash
# 进入 Admin System 3 目录
cd apps/admin-system-3
nvm use                    # 自动切换到 Node 16
node -v                    # 验证: v16.x.x

# 进入其他应用目录
cd ../activities
nvm use                    # 自动切换到 Node 20
node -v                    # 验证: v20.x.x
```

---

## 🔍 验证配置

### 验证 Dockerfile

```bash
# 检查 Admin System 3 使用 Node 16
grep "FROM node" docker/Dockerfile.admin-system-3
# 期望输出: FROM node:16-alpine AS builder

# 检查其他应用使用 Node 20
grep "FROM node" docker/Dockerfile.activities
# 期望输出: FROM node:20-alpine AS builder
```

### 验证 .nvmrc

```bash
# 检查所有 .nvmrc 文件
find apps -name ".nvmrc" -exec sh -c 'echo "{}:" && cat {}' \;

# 期望输出:
# apps/admin-system-3/.nvmrc: 16
# apps/activities/.nvmrc: 20
# apps/admin-system-1/.nvmrc: 20
# apps/dapp/.nvmrc: 20
```

### 验证构建后的容器

```bash
# 构建并验证 Admin System 3
docker build -f docker/Dockerfile.admin-system-3 -t test-admin-3 . 2>&1 | grep -i "node"

# 如果是 Next.js 应用，可以进入容器检查
docker run --rm test-admin-3 node --version
```

---

## ⚠️ 注意事项

### 1. Admin System 3 的特殊性

**为什么使用 Node 16？**
- UmiJS v3 + React 17 在 Node 18+ 可能有兼容性问题
- Node 16 是 LTS 版本，稳定性最好
- 避免构建时的警告和潜在错误

**如何升级到 Node 18+？**
1. 升级 UmiJS 到 v4
2. 升级 React 到 v18
3. 更新 package.json 中的依赖
4. 修改 Dockerfile 为 \`node:20-alpine\`
5. 全面测试

### 2. Docker 多阶段构建

所有 Dockerfile 都使用**多阶段构建**：

- **阶段 1 (builder)**: 使用 Node.js 构建应用
- **阶段 2 (production)**: 
  - 静态应用 → Nginx (无 Node.js)
  - Next.js → Node.js 运行时

因此，**生产镜像中的 Node 版本**：
- Activities, Admin Systems: 无 Node.js（使用 Nginx）
- DApp: Node 20

### 3. Jenkins 构建

Jenkins Pipeline 使用 Docker 构建，自动使用正确版本：

```groovy
// Jenkinsfile.docker 中
stage('Build Docker Images') {
    steps {
        script {
            // 每个应用的 Dockerfile 已指定正确的 Node 版本
            sh "docker build -f docker/Dockerfile.admin-system-3 ..."  // Node 16
            sh "docker build -f docker/Dockerfile.activities ..."      // Node 20
        }
    }
}
```

---

## 📊 性能影响

### Node 16 vs Node 20

| 特性 | Node 16 | Node 20 | 影响 |
|------|---------|---------|------|
| 性能 | 基准 | +10-15% | Node 20 更快 |
| ES 模块 | 支持 | 更好支持 | 构建速度提升 |
| 安全性 | LTS (EOL 2024-04) | LTS (EOL 2026-04) | Node 20 更安全 |
| 兼容性 | UmiJS v3 完美 | UmiJS v4 需要 | Admin System 3 保持 Node 16 |

**结论**: 
- Admin System 3 暂时保持 Node 16，等待框架升级
- 其他应用使用 Node 20，获得更好的性能和安全性

---

## 🔄 回滚方案

如果遇到问题，可以快速回滚：

### 回滚到 Node 18（统一版本）

```bash
# 修改所有 Dockerfile
find docker -name "Dockerfile.*" -exec sed -i '' 's/node:16-alpine/node:18-alpine/g' {} \;
find docker -name "Dockerfile.*" -exec sed -i '' 's/node:20-alpine/node:18-alpine/g' {} \;

# 重新构建
docker-compose build --no-cache
```

---

## 📚 相关文档

- [NODE_VERSION_CONFIG.md](NODE_VERSION_CONFIG.md) - 详细配置说明
- [DOCKER_JENKINS_GUIDE.md](DOCKER_JENKINS_GUIDE.md) - Docker + Jenkins 完整指南
- [Node.js Release Schedule](https://github.com/nodejs/release#release-schedule) - 官方版本支持计划

---

## ✅ 检查清单

部署前确认：

- [ ] Admin System 3 Dockerfile 使用 \`node:16-alpine\`
- [ ] 其他应用 Dockerfile 使用 \`node:20-alpine\`
- [ ] 所有 .nvmrc 文件创建正确
- [ ] docker-compose.yml 无需修改（自动使用各自的 Dockerfile）
- [ ] 本地测试 \`docker-compose build\` 成功
- [ ] Jenkins Pipeline 测试成功
- [ ] 所有应用可以正常访问

---

**更新日期**: 2026-07-05  
**更新内容**: 配置不同 Node.js 版本支持
