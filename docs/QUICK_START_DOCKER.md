# Docker 快速开始指南 ⚡

## 🎯 核心特性

✅ **通用 Dockerfile** - 一个文件支持所有应用  
✅ **自动读取 Node 版本** - 从 .nvmrc 自动获取  
✅ **智能构建脚本** - 零配置直接构建  
✅ **完整 CI/CD** - Jenkins Pipeline 支持

---

## 🚀 三种构建方式

### 方式 1: 智能构建脚本（最推荐）⭐

```bash
# 1. 赋予执行权限（首次）
chmod +x build-docker.sh

# 2. 构建单个应用（自动读取 Node 版本）
./build-docker.sh activities       # 自动使用 Node 20
./build-docker.sh admin-system-3   # 自动使用 Node 16

# 3. 构建所有应用
./build-docker.sh all

# 4. 构建并推送到仓库
./build-docker.sh activities --push
```

**为什么推荐这种方式？**
- 🎯 自动从 .nvmrc 读取版本
- 🎨 彩色输出和进度提示
- ✅ 自动检测应用类型
- 📝 构建完成后显示运行命令

---

### 方式 2: Docker Compose（本地开发）

```bash
# 1. 构建所有应用
docker-compose build

# 2. 启动所有应用
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 停止所有应用
docker-compose down
```

**访问应用：**
- Activities: http://localhost:3001
- Admin System 1: http://localhost:3002
- Admin System 3: http://localhost:3003
- DApp: http://localhost:3004

---

### 方式 3: 手动构建（完全控制）

```bash
# Activities（静态应用，Node 20）
docker build \
  --build-arg NODE_VERSION=20 \
  --build-arg APP_NAME=activities \
  --target production-static \
  -t puff/activities:latest \
  -f Dockerfile.universal \
  .

# Admin System 3（静态应用，Node 16）
docker build \
  --build-arg NODE_VERSION=16 \
  --build-arg APP_NAME=admin-system-3 \
  --target production-static \
  -t puff/admin-system-3:latest \
  -f Dockerfile.universal \
  .

# DApp（Next.js 应用，Node 20）
docker build \
  --build-arg NODE_VERSION=20 \
  --build-arg APP_NAME=dapp \
  --target production-nextjs \
  -t puff/dapp:latest \
  -f Dockerfile.universal \
  .
```

---

## 📦 快速测试

### 测试单个应用

```bash
# 1. 构建
./build-docker.sh activities

# 2. 运行
docker run -d -p 3001:80 --name test-activities puff/activities:latest

# 3. 测试
curl http://localhost:3001
# 或在浏览器打开: http://localhost:3001

# 4. 清理
docker stop test-activities
docker rm test-activities
```

### 测试所有应用

```bash
# 一键启动所有应用
docker-compose up -d

# 验证所有容器运行
docker-compose ps

# 测试各应用
curl http://localhost:3001  # Activities
curl http://localhost:3002  # Admin System 1
curl http://localhost:3003  # Admin System 3
curl http://localhost:3004  # DApp

# 清理
docker-compose down
```

---

## 🔧 Node 版本配置

所有应用的 Node 版本存储在各自的 `.nvmrc` 文件中：

```
apps/
├── activities/.nvmrc         → 20
├── admin-system-1/.nvmrc     → 20
├── admin-system-3/.nvmrc     → 16      ⚠️ 特殊（UmiJS v3 兼容性）
└── dapp/.nvmrc               → 20
```

**自动读取机制：**
1. `build-docker.sh` 自动读取 `.nvmrc`
2. Jenkins Pipeline 自动读取 `.nvmrc`
3. 本地开发使用 `nvm use`

**单一真实来源（Single Source of Truth）**：
- ✅ .nvmrc 是版本的唯一配置
- ✅ 所有工具从这里读取
- ✅ 保持一致性

---

## 🎨 智能构建脚本特性

### 彩色输出示例

```
[INFO] 构建应用: activities
[INFO] Node.js 版本: 20 (从 apps/activities/.nvmrc 读取)
[INFO] 应用类型: static
[INFO] 构建环境: production
[INFO] 目标阶段: production-static
[STEP] 开始构建镜像...
✅ 构建完成
镜像标签: puff/activities:latest
镜像标签: puff/activities:20260705-101530

运行命令:
  docker run -d -p 3001:80 --name activities puff/activities:latest
```

### 支持的选项

```bash
./build-docker.sh <应用名> [选项]

选项:
  --push         推送镜像到仓库
  --no-cache     不使用缓存构建
  --env <env>    指定环境 (development/test/production)

示例:
  ./build-docker.sh activities --env production
  ./build-docker.sh dapp --push --no-cache
  ./build-docker.sh all
```

---

## 🏗️ Jenkins CI/CD

### 配置 Jenkins

1. **创建 Pipeline 任务**
2. **配置 Pipeline Script from SCM**
   - Repository URL: `git@github.com:JayEpher/reff-test.git`
   - Script Path: `Jenkinsfile`

### 构建参数

| 参数 | 选项 | 说明 |
|------|------|------|
| APP_TO_BUILD | all, activities, admin-system-1, admin-system-3, dapp | 选择要构建的应用 |
| ENVIRONMENT | development, test, production | 构建环境 |
| PUSH_TO_REGISTRY | true/false | 是否推送到镜像仓库 |

### Pipeline 功能

- ✅ 自动从 .nvmrc 读取 Node 版本
- ✅ 显示所有 .nvmrc 配置
- ✅ 支持单个或所有应用构建
- ✅ 可选推送到镜像仓库
- ✅ 生产环境需人工确认
- ✅ 自动清理悬空镜像

---

## 📊 应用配置对照表

| 应用 | 框架 | Node 版本 | 目标阶段 | 端口 | 运行时 |
|------|------|----------|----------|------|--------|
| activities | Vite + React 18 | 20 | production-static | 3001 | Nginx |
| admin-system-1 | UmiJS Max v4 | 20 | production-static | 3002 | Nginx |
| admin-system-3 | UmiJS v3 | **16** | production-static | 3003 | Nginx |
| dapp | Next.js 15 | 20 | production-nextjs | 3004 | Node.js |

---

## ❓ 常见问题快速解决

### Q: 构建失败，提示找不到 .nvmrc？

```bash
# 检查 .nvmrc 文件是否存在
find apps -name ".nvmrc"

# 如果不存在，创建一个
echo "20" > apps/activities/.nvmrc
```

### Q: 构建很慢？

```bash
# 使用缓存构建（默认）
./build-docker.sh activities

# 如果需要强制重新构建
./build-docker.sh activities --no-cache
```

### Q: 如何查看镜像？

```bash
# 查看所有 puff 镜像
docker images | grep puff

# 查看镜像详细信息
docker inspect puff/activities:latest
```

### Q: 容器运行后访问不了？

```bash
# 1. 检查容器状态
docker ps -a

# 2. 查看容器日志
docker logs <container-name>

# 3. 进入容器调试
docker exec -it <container-name> sh

# 4. 检查端口占用
lsof -i :3001
```

### Q: 如何清理 Docker 资源？

```bash
# 停止所有容器
docker stop $(docker ps -aq)

# 删除所有容器
docker rm $(docker ps -aq)

# 清理悬空镜像
docker image prune -f

# 清理所有未使用资源（谨慎使用）
docker system prune -a
```

---

## 🎯 最佳实践

### 1. 本地开发流程

```bash
# 1. 使用 nvm 管理 Node 版本
cd apps/activities
nvm use              # 自动读取 .nvmrc

# 2. 本地开发
pnpm install
pnpm dev

# 3. 测试 Docker 构建
cd ../..
./build-docker.sh activities

# 4. 本地测试
docker run -d -p 3001:80 --name test puff/activities:latest
```

### 2. CI/CD 流程

```bash
# 开发环境
Jenkins → 选择 development → 自动构建 → 自动推送

# 测试环境
Jenkins → 选择 test → 自动构建 → 自动推送

# 生产环境
Jenkins → 选择 production → 自动构建 → 人工确认 → 推送 → 部署
```

### 3. 版本管理

```bash
# .nvmrc 作为单一真实来源
# 1. 本地开发: nvm use
# 2. Docker 构建: 自动读取
# 3. Jenkins: 自动读取

# 如需更新 Node 版本
echo "20" > apps/activities/.nvmrc  # 只需修改一处
```

---

## 📚 相关文档

- [UNIVERSAL_DOCKERFILE_GUIDE.md](docs/UNIVERSAL_DOCKERFILE_GUIDE.md) - 通用 Dockerfile 详细指南
- [DOCKER_JENKINS_GUIDE.md](docs/DOCKER_JENKINS_GUIDE.md) - Docker + Jenkins 完整指南
- [NODE_VERSION_CONFIG.md](docs/NODE_VERSION_CONFIG.md) - Node 版本配置详解
- [ENV_CONFIG_COMPARISON.md](docs/ENV_CONFIG_COMPARISON.md) - 环境变量配置对比

---

## 🎉 快速检查清单

在开始使用前，确认以下内容：

- [ ] 所有应用的 .nvmrc 文件存在且正确
- [ ] build-docker.sh 有执行权限
- [ ] Docker 和 Docker Compose 已安装
- [ ] pnpm 已安装（本地开发需要）
- [ ] Jenkins 凭证已配置（CI/CD 需要）

**验证命令：**
```bash
# 检查 .nvmrc
find apps -name ".nvmrc" -exec sh -c 'echo "{}:" && cat {}' \;

# 检查 Docker
docker --version
docker-compose --version

# 检查 pnpm
pnpm --version

# 测试构建
./build-docker.sh activities
```

---

## 🚀 现在就开始！

```bash
# 最快开始方式
./build-docker.sh all && docker-compose up -d
```

🎊 享受简化的 Docker 开发体验！
