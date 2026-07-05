# 项目快速参考

## 📦 应用列表

| 应用 | 框架 | React | Node | 端口 | 说明 |
|------|------|-------|------|------|------|
| **activities** | Vite 5 | 18.3 | 20 | 3001 | 活动管理应用 |
| **admin-system-1** | UmiJS 4 | 18.3 | 20 | 3002 | 后台管理系统 1 |
| **admin-system-3** | UmiJS 4 | 18.3 | 20 | 3003 | 后台管理系统 3 (新) ✨ |
| **dapp** | Next.js 15 | 19 | 20 | 3004 | Web3 DApp |

---

## 🚀 快速开始

### 安装依赖
```bash
# 根目录安装所有依赖
pnpm install
```

### 开发
```bash
# Activities
cd apps/activities && pnpm dev

# Admin System 1
cd apps/admin-system-1 && pnpm dev

# Admin System 3 (新)
cd apps/admin-system-3 && pnpm dev

# DApp
cd apps/dapp && pnpm dev
```

### 构建
```bash
# 在各应用目录
pnpm build              # 生产环境
pnpm build:test         # 测试环境
pnpm build:dev          # 开发环境
```

---

## 🐳 Docker 快速命令

### 构建
```bash
# 构建单个应用
./build-docker.sh activities
./build-docker.sh admin-system-3

# 构建所有应用
./build-docker.sh all

# 使用 docker-compose
docker-compose build
```

### 运行
```bash
# 启动所有应用
docker-compose up -d

# 启动单个应用
docker-compose up -d admin-system-3

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

### 访问地址
- Activities: http://localhost:3001
- Admin System 1: http://localhost:3002
- Admin System 3: http://localhost:3003
- DApp: http://localhost:3004

---

## 📁 项目结构

```
puff-monorepo/
├── apps/                          # 应用目录
│   ├── activities/                # Vite + React 18.3
│   ├── admin-system-1/            # UmiJS 4 + React 18.3
│   ├── admin-system-3/            # UmiJS 4 + React 18.3 (新) ✨
│   └── dapp/                      # Next.js 15 + React 19
├── packages/                      # 共享包
├── docs/                          # 文档
│   ├── ADMIN_SYSTEM_3_REBUILD.md        # Admin 3 重建说明
│   ├── UNIVERSAL_DOCKERFILE_GUIDE.md    # Docker 指南
│   ├── DOCKER_CLEANUP_SUMMARY.md        # Docker 清理
│   ├── NODE_VERSION_CONFIG.md           # Node 版本配置
│   └── ENV_CONFIG_COMPARISON.md         # 环境配置对比
├── Dockerfile.universal           # 通用 Dockerfile
├── build-docker.sh                # 智能构建脚本
├── docker-compose.yml             # Docker Compose 配置
├── Jenkinsfile                    # Jenkins Pipeline
├── QUICK_START_DOCKER.md          # Docker 快速开始
└── package.json                   # Monorepo 配置
```

---

## 🔧 环境变量

### 位置
每个应用的环境变量在各自目录下：
```
apps/{app-name}/.env.development   # 开发环境
apps/{app-name}/.env.test          # 测试环境
apps/{app-name}/.env.production    # 生产环境
```

### 配置内容
```env
# API 配置
API_BASE_URL=https://api.example.com

# Web3 配置
WEB3_CHAIN_ID=1
WEB3_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
WEB3_CHAIN_NAME=Ethereum
WEB3_EXPLORER_URL=https://etherscan.io
```

### 环境前缀
- **activities** (Vite): `VITE_`
- **admin-system-1** (UmiJS): 无前缀
- **admin-system-3** (UmiJS): 无前缀
- **dapp** (Next.js): `NEXT_PUBLIC_`

---

## 🎯 常用命令速查

### Monorepo 操作
```bash
# 安装依赖
pnpm install

# 清理
pnpm clean

# 构建所有
pnpm build

# 检查类型
pnpm type-check
```

### 应用操作
```bash
# 开发
pnpm dev
pnpm dev:test

# 构建
pnpm build
pnpm build:test
pnpm build:dev

# 预览
pnpm preview
```

### Docker 操作
```bash
# 构建
./build-docker.sh <app-name>
./build-docker.sh all

# Compose
docker-compose build
docker-compose up -d
docker-compose down
docker-compose logs -f

# 清理
docker system prune -a
```

### Git 操作
```bash
# 查看状态
git status

# 提交
git add .
git commit -m "feat: your message"

# 推送
git push
```

---

## 📚 重要文档

### Admin System 3 (新) ✨
- [ADMIN_SYSTEM_3_REBUILD.md](docs/ADMIN_SYSTEM_3_REBUILD.md) - 重建说明
- [apps/admin-system-3/README.md](apps/admin-system-3/README.md) - 项目文档

### Docker
- [QUICK_START_DOCKER.md](QUICK_START_DOCKER.md) - 快速开始
- [UNIVERSAL_DOCKERFILE_GUIDE.md](docs/UNIVERSAL_DOCKERFILE_GUIDE.md) - 完整指南
- [DOCKER_CLEANUP_SUMMARY.md](docs/DOCKER_CLEANUP_SUMMARY.md) - 清理总结

### 配置
- [NODE_VERSION_CONFIG.md](docs/NODE_VERSION_CONFIG.md) - Node 版本配置
- [ENV_CONFIG_COMPARISON.md](docs/ENV_CONFIG_COMPARISON.md) - 环境配置对比

---

## ✨ 最近更新

### 2024-07 - Admin System 3 重建
- ✅ 从 UmiJS v3 + React 17 + Node 16 升级
- ✅ 迁移到 UmiJS 4 + React 18.3 + Node 20
- ✅ 统一所有应用的 Node 版本为 20
- ✅ 实现完整的后台管理功能
- ✅ 更新所有相关文档

### 2024-07 - Docker 配置简化
- ✅ 创建通用 Dockerfile
- ✅ 实现智能构建脚本（自动读取 .nvmrc）
- ✅ 删除旧的独立 Dockerfile
- ✅ 统一 Jenkins Pipeline
- ✅ 文件数量减少 78%

---

## 🔍 故障排查

### 依赖安装失败
```bash
# 清理后重新安装
rm -rf node_modules
pnpm install
```

### Docker 构建失败
```bash
# 不使用缓存构建
./build-docker.sh <app-name> --no-cache

# 或
docker-compose build --no-cache
```

### 端口占用
```bash
# 查看端口占用
lsof -i :3001

# 杀死进程
kill -9 <PID>
```

### TypeScript 错误
```bash
# 安装依赖后错误会消失
cd apps/admin-system-3
pnpm install
```

---

## 💡 最佳实践

### 1. Node 版本管理
- 使用 `nvm use` 自动切换到正确版本
- `.nvmrc` 是唯一的版本配置源

### 2. 开发流程
1. 进入应用目录
2. `nvm use` 切换 Node 版本
3. `pnpm dev` 启动开发服务器
4. 开发完成后 `pnpm build` 验证构建

### 3. Docker 构建
- 优先使用 `./build-docker.sh`
- 本地测试使用 `docker-compose`
- CI/CD 使用 Jenkins Pipeline

### 4. 环境变量
- 开发环境使用 `.env.development`
- 测试环境使用 `.env.test`
- 生产环境使用 `.env.production`
- 不要提交 `.env.local`

---

## 🎉 总结

- ✅ 4 个应用统一使用 Node 20 LTS
- ✅ 统一的 Docker 配置
- ✅ 完整的环境变量配置
- ✅ 清晰的项目文档
- ✅ Admin System 3 已迁移到现代技术栈

**开始使用**:
```bash
pnpm install
cd apps/admin-system-3
pnpm dev
```

🚀 Happy Coding!
