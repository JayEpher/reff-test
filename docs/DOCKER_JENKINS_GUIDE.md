# Docker + Jenkins 完整配置指南

## 📁 项目结构

```
puff-monorepo/
├── Dockerfile                          # 多阶段构建（所有应用）
├── docker-compose.yml                  # Docker Compose 配置
├── .dockerignore                       # Docker 忽略文件
├── Jenkinsfile.docker                  # Jenkins Docker Pipeline
├── docker/
│   ├── Dockerfile.activities           # Activities 独立构建
│   ├── Dockerfile.admin-system-1       # Admin System 1 独立构建
│   ├── Dockerfile.admin-system-3       # Admin System 3 独立构建
│   ├── Dockerfile.dapp                 # DApp 独立构建
│   └── nginx/
│       ├── activities.conf             # Activities Nginx 配置
│       ├── admin-system-1.conf         # Admin System 1 Nginx 配置
│       └── admin-system-3.conf         # Admin System 3 Nginx 配置
└── apps/
    ├── activities/
    ├── admin-system-1/
    ├── admin-system-3/
    └── dapp/
```

---

## 🚀 快速开始

### 方式 1: 使用 Docker Compose（本地开发）

\`\`\`bash
# 构建所有应用
docker-compose build

# 启动所有应用
docker-compose up -d

# 查看运行状态
docker-compose ps

# 访问应用
# Activities:        http://localhost:3001
# Admin System 1:    http://localhost:3002
# Admin System 3:    http://localhost:3003
# DApp:              http://localhost:3004

# 停止所有应用
docker-compose down
\`\`\`

### 方式 2: 构建单个应用

\`\`\`bash
# 构建 Activities
docker build -f docker/Dockerfile.activities -t puff/activities:latest .

# 运行 Activities
docker run -d -p 3001:80 --name activities puff/activities:latest

# 构建 DApp
docker build -f docker/Dockerfile.dapp -t puff/dapp:latest .

# 运行 DApp
docker run -d -p 3004:3000 --name dapp puff/dapp:latest

# 查看日志
docker logs -f activities
docker logs -f dapp

# 停止容器
docker stop activities dapp

# 删除容器
docker rm activities dapp
\`\`\`

---

## 🔧 Jenkins 配置

### 步骤 1: 准备 Jenkins 环境

#### 1.1 安装 Docker 插件

1. 登录 Jenkins
2. Manage Jenkins → Manage Plugins
3. 搜索并安装以下插件：
   - Docker Pipeline
   - Docker
   - Docker Commons Plugin

#### 1.2 配置 Docker

确保 Jenkins 可以访问 Docker：

\`\`\`bash
# 将 jenkins 用户添加到 docker 组
sudo usermod -aG docker jenkins

# 重启 Jenkins
sudo systemctl restart jenkins
\`\`\`

#### 1.3 配置 Docker Hub 凭证（如果需要推送镜像）

1. Manage Jenkins → Manage Credentials
2. 添加 Credentials
3. 配置：
   \`\`\`
   Kind: Username with password
   ID: docker-hub-credentials
   Username: 你的 Docker Hub 用户名
   Password: 你的 Docker Hub 密码或 Access Token
   \`\`\`

### 步骤 2: 创建 Jenkins Pipeline

1. **新建项目**
   - Jenkins 首页 → 新建任务
   - 输入名称：\`puff-docker-pipeline\`
   - 选择 "Pipeline"
   - 点击 "确定"

2. **配置 Pipeline**
   - Definition: \`Pipeline script from SCM\`
   - SCM: \`Git\`
   - Repository URL: \`git@github.com:JayEpher/reff-test.git\`
   - Credentials: 选择 SSH 凭证
   - Branch: \`*/main\`
   - Script Path: \`Jenkinsfile.docker\`

3. **保存并构建**

### 步骤 3: 运行构建

点击 "Build with Parameters"，选择：
- **APP_TO_BUILD**: 选择要构建的应用
- **ENVIRONMENT**: 选择环境
- **PUSH_TO_REGISTRY**: 是否推送到镜像仓库

---

## 📦 Docker 镜像说明

### 镜像架构

每个应用使用**多阶段构建**优化镜像大小：

#### Vite/UmiJS 应用（Activities, Admin Systems）
\`\`\`
阶段 1: builder (node:18-alpine)
  ├── 安装 pnpm
  ├── 安装依赖
  ├── 复制源代码
  └── 构建应用

阶段 2: production (nginx:alpine)
  ├── 复制构建产物到 nginx
  └── 配置 nginx
\`\`\`

#### Next.js 应用（DApp）
\`\`\`
阶段 1: builder (node:18-alpine)
  ├── 安装 pnpm
  ├── 安装依赖
  ├── 复制源代码
  └── 构建应用

阶段 2: production (node:18-alpine)
  ├── 复制依赖和构建产物
  └── 运行 Next.js 服务器
\`\`\`

### 镜像大小优化

- ✅ 使用 Alpine Linux 基础镜像
- ✅ 多阶段构建，只保留生产文件
- ✅ .dockerignore 排除不必要的文件
- ✅ pnpm 减少依赖体积

预期镜像大小：
- Activities: ~30MB
- Admin Systems: ~35MB
- DApp: ~150MB（包含 Node.js 运行时）

---

## 🔄 Jenkins Pipeline 流程

\`\`\`
Checkout
   ↓
Show Info (检查 Docker 环境)
   ↓
Build Docker Images
   ├── 构建所有应用 (docker-compose build)
   └── 构建单个应用 (docker build)
   ↓
Test Images (验证镜像)
   ↓
Push to Registry (可选)
   ├── 登录 Docker Registry
   └── 推送镜像
   ↓
Deploy (生产环境)
   ├── 人工审批
   └── 部署容器
\`\`\`

---

## 🌐 Nginx 配置说明

每个静态应用（Activities, Admin Systems）使用 Nginx：

### 主要特性

1. **SPA 路由支持**
   \`\`\`nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   \`\`\`

2. **静态资源缓存**
   \`\`\`nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   \`\`\`

3. **Gzip 压缩**
   - 自动压缩 JS、CSS、JSON 等文件
   - 减少传输大小

4. **健康检查**
   \`\`\`bash
   curl http://localhost/health
   # 返回: healthy
   \`\`\`

---

## 🔐 环境变量配置

### 构建时环境变量

在 Dockerfile 中通过 ARG 传递：

\`\`\`dockerfile
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
\`\`\`

构建时指定：
\`\`\`bash
docker build --build-arg NODE_ENV=production -t app:latest .
\`\`\`

### 运行时环境变量

在 docker-compose.yml 中配置：

\`\`\`yaml
services:
  dapp:
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_BASE_URL=https://api.example.com
\`\`\`

或使用 .env 文件：

\`\`\`bash
# .env.production
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
\`\`\`

---

## 🚦 测试部署

### 本地测试

\`\`\`bash
# 1. 构建镜像
docker-compose build activities

# 2. 启动容器
docker-compose up -d activities

# 3. 检查容器状态
docker-compose ps

# 4. 检查日志
docker-compose logs -f activities

# 5. 访问应用
curl http://localhost:3001

# 6. 健康检查
curl http://localhost:3001/health

# 7. 停止容器
docker-compose down
\`\`\`

### Jenkins 测试

1. 在 Jenkins 中运行 Pipeline
2. 选择 \`APP_TO_BUILD: activities\`
3. 选择 \`ENVIRONMENT: test\`
4. 取消勾选 \`PUSH_TO_REGISTRY\`
5. 点击 "构建"

---

## 📊 监控和日志

### 查看容器日志

\`\`\`bash
# 查看所有容器日志
docker-compose logs

# 查看特定容器日志
docker-compose logs activities

# 实时查看日志
docker-compose logs -f activities

# 查看最近 100 行日志
docker-compose logs --tail=100 activities
\`\`\`

### 监控容器资源

\`\`\`bash
# 查看容器资源使用
docker stats

# 查看特定容器
docker stats activities
\`\`\`

### 进入容器调试

\`\`\`bash
# 进入容器 shell
docker exec -it activities sh

# 或使用 docker-compose
docker-compose exec activities sh
\`\`\`

---

## 🔄 生产部署流程

### 方式 1: Docker Compose

\`\`\`bash
# 1. 拉取最新代码
git pull origin main

# 2. 构建镜像
docker-compose build

# 3. 停止旧容器
docker-compose down

# 4. 启动新容器
docker-compose up -d

# 5. 检查状态
docker-compose ps
\`\`\`

### 方式 2: Docker Swarm

\`\`\`bash
# 初始化 Swarm
docker swarm init

# 部署 Stack
docker stack deploy -c docker-compose.yml puff

# 查看服务
docker service ls

# 扩容服务
docker service scale puff_activities=3

# 更新服务
docker service update --image puff/activities:v2 puff_activities
\`\`\`

### 方式 3: Kubernetes

参考 \`k8s/\` 目录下的 Kubernetes 配置文件。

---

## 🐛 常见问题

### 1. 构建失败：Cannot find module

**原因**：依赖安装不完整

**解决**：
\`\`\`bash
# 清理缓存
docker-compose build --no-cache

# 或删除 node_modules
rm -rf apps/*/node_modules packages/*/node_modules
\`\`\`

### 2. 容器启动失败

**检查步骤**：
\`\`\`bash
# 查看容器日志
docker-compose logs activities

# 查看容器状态
docker-compose ps

# 进入容器检查
docker-compose exec activities sh
\`\`\`

### 3. 镜像体积过大

**优化方法**：
1. 使用 .dockerignore 排除不必要文件
2. 使用多阶段构建
3. 清理构建缓存：\`RUN pnpm store prune\`

### 4. Jenkins 无法访问 Docker

**解决**：
\`\`\`bash
# 添加 jenkins 用户到 docker 组
sudo usermod -aG docker jenkins

# 重启 Jenkins
sudo systemctl restart jenkins

# 验证
docker ps
\`\`\`

---

## 📝 下一步

1. ✅ **本地测试**：使用 docker-compose 本地测试
2. ✅ **Jenkins 集成**：配置 Jenkins Pipeline
3. ⬜ **CI/CD 优化**：添加自动化测试
4. ⬜ **监控告警**：集成 Prometheus + Grafana
5. ⬜ **日志收集**：集成 ELK Stack
6. ⬜ **Kubernetes**：迁移到 K8s 集群

---

## 🔗 相关文档

- [Docker 官方文档](https://docs.docker.com/)
- [Jenkins Docker Plugin](https://plugins.jenkins.io/docker-plugin/)
- [Nginx 配置指南](https://nginx.org/en/docs/)
- [pnpm 文档](https://pnpm.io/)
