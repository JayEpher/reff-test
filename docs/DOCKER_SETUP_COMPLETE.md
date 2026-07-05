# Docker + Jenkins 配置完成总结

## ✅ 已创建的文件

### Docker 相关文件

#### 1. Dockerfile
- **位置**: 项目根目录
- **用途**: 多阶段构建，可以构建所有应用
- **特点**: 使用目标选择器构建不同应用

#### 2. 单独的 Dockerfile
- `docker/Dockerfile.activities` - Activities 应用
- `docker/Dockerfile.admin-system-1` - Admin System 1
- `docker/Dockerfile.admin-system-3` - Admin System 3
- `docker/Dockerfile.dapp` - DApp (Next.js)

#### 3. Nginx 配置
- `docker/nginx/activities.conf`
- `docker/nginx/admin-system-1.conf`
- `docker/nginx/admin-system-3.conf`

**特性**:
- ✅ SPA 路由支持
- ✅ 静态资源缓存
- ✅ Gzip 压缩
- ✅ 健康检查端点

#### 4. Docker Compose
- **位置**: `docker-compose.yml`
- **用途**: 一键启动所有应用
- **端口映射**:
  - Activities: 3001 → 80
  - Admin System 1: 3002 → 80
  - Admin System 3: 3003 → 80
  - DApp: 3004 → 3000

#### 5. .dockerignore
- **位置**: 项目根目录
- **用途**: 排除不必要的文件，减小镜像体积

#### 6. docker.sh
- **位置**: 项目根目录
- **用途**: 快速构建和部署脚本
- **权限**: 已设置为可执行

### Jenkins 相关文件

#### 7. Jenkinsfile.docker
- **位置**: 项目根目录
- **用途**: Jenkins Docker Pipeline
- **功能**:
  - ✅ 参数化构建
  - ✅ 选择应用构建
  - ✅ 选择环境
  - ✅ 推送镜像到仓库
  - ✅ 生产环境部署审批

### 文档

#### 8. DOCKER_JENKINS_GUIDE.md
- **位置**: `docs/DOCKER_JENKINS_GUIDE.md`
- **内容**: 完整的配置和使用指南

---

## 🚀 快速开始

### 方式 1: 使用 Docker Compose（推荐）

\`\`\`bash
# 构建所有应用
docker-compose build

# 启动所有应用
docker-compose up -d

# 访问应用
open http://localhost:3001  # Activities
open http://localhost:3002  # Admin System 1
open http://localhost:3003  # Admin System 3
open http://localhost:3004  # DApp
\`\`\`

### 方式 2: 使用快速脚本

\`\`\`bash
# 构建单个应用
./docker.sh build activities

# 运行应用
./docker.sh run activities

# 查看日志
./docker.sh logs activities

# 使用 docker-compose
./docker.sh all build
./docker.sh all up
\`\`\`

### 方式 3: 手动构建

\`\`\`bash
# 构建 Activities
docker build -f docker/Dockerfile.activities -t puff/activities:latest .

# 运行 Activities
docker run -d -p 3001:80 --name activities puff/activities:latest
\`\`\`

---

## 🔧 Jenkins 配置步骤

### 1. 安装 Jenkins 插件
- Docker Pipeline
- Docker
- Docker Commons Plugin

### 2. 配置 Docker 访问
\`\`\`bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
\`\`\`

### 3. 添加 Docker Hub 凭证
- Manage Jenkins → Manage Credentials
- 添加 Username with password
- ID: `docker-hub-credentials`

### 4. 创建 Pipeline 项目
- Pipeline script from SCM
- Repository: `git@github.com:JayEpher/reff-test.git`
- Script Path: `Jenkinsfile.docker`

### 5. 运行构建
- Build with Parameters
- 选择应用和环境
- 点击构建

---

## 📦 镜像架构

### 静态应用（Activities, Admin Systems）

\`\`\`
┌─────────────────────────────────────┐
│  阶段 1: builder (node:18-alpine)  │
│  ├── 安装 pnpm                      │
│  ├── 安装依赖 (pnpm install)      │
│  ├── 复制源代码                     │
│  └── 构建应用 (pnpm build)        │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  阶段 2: production (nginx:alpine) │
│  ├── 复制构建产物 (dist/)          │
│  ├── 配置 Nginx                     │
│  └── 暴露端口 80                    │
└─────────────────────────────────────┘

预期镜像大小: ~30-35MB
\`\`\`

### Next.js 应用（DApp）

\`\`\`
┌─────────────────────────────────────┐
│  阶段 1: builder (node:18-alpine)  │
│  ├── 安装 pnpm                      │
│  ├── 安装依赖                       │
│  ├── 复制源代码                     │
│  └── 构建 Next.js                  │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│  阶段 2: production (node:18-alpine)│
│  ├── 复制依赖和构建产物             │
│  ├── 配置 Next.js 服务器            │
│  └── 暴露端口 3000                  │
└─────────────────────────────────────┘

预期镜像大小: ~150MB
\`\`\`

---

## 🔄 Jenkins Pipeline 流程

\`\`\`
┌──────────────────┐
│   Checkout 代码  │
└────────┬─────────┘
         ↓
┌──────────────────┐
│  检查 Docker 环境│
└────────┬─────────┘
         ↓
┌──────────────────┐
│  构建 Docker 镜像│
│  ├─ 全部应用     │
│  └─ 单个应用     │
└────────┬─────────┘
         ↓
┌──────────────────┐
│   测试镜像       │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ 推送到镜像仓库   │
│   (可选)         │
└────────┬─────────┘
         ↓
┌──────────────────┐
│  部署到生产环境   │
│  (需要人工审批)  │
└──────────────────┘
\`\`\`

---

## 🌐 端口分配

| 应用 | 容器端口 | 宿主机端口 | 访问地址 |
|------|---------|-----------|----------|
| Activities | 80 | 3001 | http://localhost:3001 |
| Admin System 1 | 80 | 3002 | http://localhost:3002 |
| Admin System 3 | 80 | 3003 | http://localhost:3003 |
| DApp | 3000 | 3004 | http://localhost:3004 |

---

## 📝 常用命令

### Docker Compose

\`\`\`bash
# 构建
docker-compose build [service]

# 启动
docker-compose up -d

# 停止
docker-compose down

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f [service]

# 重启
docker-compose restart [service]
\`\`\`

### Docker

\`\`\`bash
# 构建镜像
docker build -f docker/Dockerfile.activities -t puff/activities:latest .

# 运行容器
docker run -d -p 3001:80 --name activities puff/activities:latest

# 停止容器
docker stop activities

# 删除容器
docker rm activities

# 查看日志
docker logs -f activities

# 进入容器
docker exec -it activities sh

# 清理
docker system prune -f
\`\`\`

### 快速脚本

\`\`\`bash
# 查看帮助
./docker.sh

# 构建应用
./docker.sh build activities

# 运行应用
./docker.sh run activities

# 查看日志
./docker.sh logs activities

# 停止应用
./docker.sh stop activities

# 重启应用
./docker.sh restart activities

# 进入容器
./docker.sh shell activities

# 清理镜像
./docker.sh clean

# Docker Compose 命令
./docker.sh all build
./docker.sh all up
./docker.sh all down
./docker.sh all ps
./docker.sh all logs
\`\`\`

---

## 🧪 测试清单

### 本地测试

- [ ] 构建所有镜像成功
- [ ] 启动所有容器成功
- [ ] 访问所有应用正常
- [ ] 健康检查端点响应正常
- [ ] 查看容器日志无错误
- [ ] 停止和重启容器正常

### Jenkins 测试

- [ ] Jenkins 可以访问 Docker
- [ ] SSH 凭证配置正确
- [ ] Docker Hub 凭证配置正确（如果需要）
- [ ] Pipeline 构建成功
- [ ] 镜像构建成功
- [ ] 参数化构建正常工作

---

## 🎯 优化建议

### 已实现的优化

- ✅ 多阶段构建减小镜像体积
- ✅ 使用 Alpine Linux 基础镜像
- ✅ .dockerignore 排除不必要文件
- ✅ Nginx 静态资源缓存
- ✅ Gzip 压缩
- ✅ 健康检查端点
- ✅ 容器自动重启策略

### 可以进一步优化

- ⬜ 添加 Docker 镜像扫描（安全）
- ⬜ 实现分层缓存优化构建速度
- ⬜ 添加 Docker 资源限制
- ⬜ 集成 Docker Registry 缓存
- ⬜ 添加容器监控（Prometheus）
- ⬜ 添加日志收集（ELK）
- ⬜ 实现蓝绿部署或金丝雀发布

---

## 📚 相关文档

- [DOCKER_JENKINS_GUIDE.md](DOCKER_JENKINS_GUIDE.md) - 完整配置指南
- [JENKINS_QUICK_START.md](JENKINS_QUICK_START.md) - Jenkins 快速开始
- [JENKINS_SETUP.md](JENKINS_SETUP.md) - Jenkins 详细配置

---

## ⚠️ 注意事项

1. **环境变量**: 确保在构建时或运行时正确配置环境变量
2. **端口冲突**: 确保宿主机端口未被占用
3. **磁盘空间**: 定期清理未使用的镜像和容器
4. **安全性**: 不要在镜像中包含敏感信息
5. **日志管理**: 定期清理容器日志避免磁盘占满

---

## 🆘 故障排除

### 构建失败

\`\`\`bash
# 清理缓存重新构建
docker-compose build --no-cache

# 查看详细日志
docker-compose build --progress=plain
\`\`\`

### 容器启动失败

\`\`\`bash
# 查看容器日志
docker logs [container-name]

# 进入容器检查
docker exec -it [container-name] sh
\`\`\`

### 端口冲突

\`\`\`bash
# 查看端口占用
lsof -i :3001

# 修改 docker-compose.yml 中的端口映射
\`\`\`

---

## 🎉 完成！

所有 Docker 和 Jenkins 配置文件已创建完成，您现在可以：

1. **本地测试**: 使用 \`docker-compose up\` 启动所有应用
2. **Jenkins 集成**: 配置 Jenkins Pipeline 自动构建
3. **生产部署**: 推送镜像到仓库并部署到服务器

如有问题，请查看 [DOCKER_JENKINS_GUIDE.md](DOCKER_JENKINS_GUIDE.md) 获取详细帮助。
