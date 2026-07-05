# 通用 Dockerfile 方案 - 简化配置

## 🎯 核心改进

### 之前的问题
- ❌ 需要 4 个独立的 Dockerfile
- ❌ 每次修改需要更新多个文件
- ❌ Node 版本硬编码在 Dockerfile 中
- ❌ 维护成本高

### 现在的方案
- ✅ **只需 1 个通用 Dockerfile**
- ✅ **自动从 .nvmrc 读取 Node 版本**
- ✅ 通过构建参数灵活配置
- ✅ 维护成本低

---

## 📁 新的文件结构

```
puff-monorepo/
├── Dockerfile.universal           # ⭐ 通用 Dockerfile（唯一需要的）
├── build-docker.sh                # 智能构建脚本（自动读取 .nvmrc）
├── docker-compose.yml             # 已更新使用通用 Dockerfile
├── Jenkinsfile                    # Jenkins Pipeline（支持通用 Dockerfile）
├── apps/
│   ├── activities/.nvmrc          # 20
│   ├── admin-system-1/.nvmrc      # 20
│   ├── admin-system-3/.nvmrc      # 16
│   └── dapp/.nvmrc                # 20
└── docker/                        # Nginx 配置目录
    └── nginx/
        ├── activities.conf
        ├── admin-system-1.conf
        ├── admin-system-3.conf
        └── dapp.conf
```

---

## 🚀 使用方法

### 方式 1: 智能构建脚本（推荐）⭐

脚本会自动从 .nvmrc 读取版本：

\`\`\`bash
# 构建单个应用（自动读取 Node 版本）
./build-docker.sh activities          # 自动使用 Node 20
./build-docker.sh admin-system-3      # 自动使用 Node 16
./build-docker.sh dapp                # 自动使用 Node 20

# 构建所有应用
./build-docker.sh all

# 构建并推送
./build-docker.sh activities --push

# 不使用缓存构建
./build-docker.sh activities --no-cache

# 指定环境
./build-docker.sh activities --env production
\`\`\`

**工作原理**：
1. 读取 \`apps/{app-name}/.nvmrc\`
2. 自动传递正确的 \`NODE_VERSION\`
3. 选择正确的目标阶段（static/nextjs）

### 方式 2: Docker Compose

\`\`\`bash
# 构建所有应用
docker-compose build

# 构建单个应用
docker-compose build activities       # 使用 Node 20
docker-compose build admin-system-3   # 使用 Node 16

# 启动所有应用
docker-compose up -d
\`\`\`

**配置说明**：
- docker-compose.yml 中已指定每个应用的 Node 版本
- 使用统一的 \`Dockerfile.universal\`
- 通过 \`args\` 参数传递配置

### 方式 3: 手动构建

\`\`\`bash
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
\`\`\`

---

## 🔧 Dockerfile.universal 架构

### 构建参数

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| \`NODE_VERSION\` | Node.js 版本 | 20 | 16, 18, 20 |
| \`APP_NAME\` | 应用名称 | 必需 | activities, dapp |
| \`BUILD_ENV\` | 构建环境 | production | development, test |

### 目标阶段

| 阶段 | 用途 | 适用应用 |
|------|------|----------|
| \`base\` | 基础镜像 + pnpm | - |
| \`dependencies\` | 安装依赖 | - |
| \`builder\` | 构建应用 | - |
| \`production-static\` | 静态应用（Nginx） | activities, admin-system-* |
| \`production-nextjs\` | Next.js 应用 | dapp |

### 多阶段构建流程

\`\`\`
┌─────────────────────────────────┐
│  base (node:${NODE_VERSION})   │
│  ├─ 安装 pnpm                   │
│  └─ 设置工作目录                │
└─────────────┬───────────────────┘
              ↓
┌─────────────────────────────────┐
│  dependencies                   │
│  ├─ 复制 package.json           │
│  └─ 安装依赖 (pnpm install)    │
└─────────────┬───────────────────┘
              ↓
┌─────────────────────────────────┐
│  builder                        │
│  ├─ 复制源代码                  │
│  └─ 构建应用 (pnpm build)      │
└─────────────┬───────────────────┘
              ↓
        ┌─────┴─────┐
        ↓           ↓
┌──────────────┐  ┌──────────────┐
│ production-  │  │ production-  │
│   static     │  │   nextjs     │
│ (Nginx)      │  │ (Node.js)    │
└──────────────┘  └──────────────┘
\`\`\`

---

## 📊 对比：旧方案 vs 新方案

| 特性 | 旧方案（多个 Dockerfile） | 新方案（通用 Dockerfile） |
|------|-------------------------|-------------------------|
| **Dockerfile 数量** | 4 个独立文件 | 1 个通用文件 ⭐ |
| **Node 版本配置** | 硬编码在 FROM 中 | 通过参数传递 ⭐ |
| **维护成本** | 高（4 个文件） | 低（1 个文件） ⭐ |
| **版本来源** | 手动指定 | 从 .nvmrc 读取 ⭐ |
| **灵活性** | 低 | 高 ⭐ |
| **构建复杂度** | 简单 | 稍复杂（需要参数） |
| **学习曲线** | 低 | 中等 |

---

## 🎨 智能构建脚本特性

\`build-docker.sh\` 脚本的智能功能：

### 1. 自动读取 .nvmrc
\`\`\`bash
# 脚本会自动：
# 1. 读取 apps/{app}/.nvmrc
# 2. 如果不存在，使用默认版本 20
# 3. 传递给 Docker 构建
\`\`\`

### 2. 自动检测应用类型
\`\`\`bash
# 静态应用 → target: production-static
# Next.js 应用 → target: production-nextjs
\`\`\`

### 3. 彩色输出和进度显示
\`\`\`bash
[INFO] 构建应用: activities
[INFO] Node.js 版本: 20 (从 apps/activities/.nvmrc 读取)
[STEP] 开始构建镜像...
✅ 构建完成
\`\`\`

### 4. 构建后信息
\`\`\`bash
镜像标签: puff/activities:latest
镜像标签: puff/activities:20260705-143022

运行命令:
  docker run -d -p 3001:80 --name activities puff/activities:latest
\`\`\`

---

## 🔄 从旧方案迁移

### 步骤 1: 验证 .nvmrc 文件

\`\`\`bash
# 检查所有应用的 .nvmrc
find apps -name ".nvmrc" -exec sh -c 'echo "{}:" && cat {}' \\;

# 期望输出:
# apps/admin-system-3/.nvmrc: 16
# apps/activities/.nvmrc: 20
# apps/admin-system-1/.nvmrc: 20
# apps/dapp/.nvmrc: 20
\`\`\`

### 步骤 2: 测试构建

\`\`\`bash
# 使用新的构建脚本
./build-docker.sh activities

# 或使用 docker-compose
docker-compose build activities
\`\`\`

### 步骤 3: 验证镜像

\`\`\`bash
# 运行容器
docker run -d -p 3001:80 --name test-activities puff/activities:latest

# 访问应用
curl http://localhost:3001

# 清理
docker stop test-activities
docker rm test-activities
\`\`\`

### 步骤 4: 更新 Jenkins

```bash
# Jenkins Pipeline 已经是标准的 Jenkinsfile
# 只需在 Jenkins 中配置:
# - Repository URL: git@github.com:JayEpher/reff-test.git
# - Script Path: Jenkinsfile
```

### 步骤 5: 项目已清理完成 ✅

所有旧的 Dockerfile 已删除，现在项目结构简洁：
- ✅ 只有 1 个 `Dockerfile.universal`
- ✅ 只有 1 个 `Jenkinsfile`
- ✅ nginx 配置文件保留在 `docker/nginx/` 目录

---

## 🧪 测试清单

- [ ] 所有应用的 .nvmrc 文件存在且正确
- [ ] 使用 \`./build-docker.sh all\` 构建所有应用成功
- [ ] 使用 \`docker-compose build\` 构建成功
- [ ] 使用 \`docker-compose up -d\` 启动成功
- [ ] 访问所有应用正常
- [ ] 健康检查端点响应正常
- [ ] Jenkins Pipeline 测试成功

---

## 💡 最佳实践

### 1. .nvmrc 作为单一真实来源

\`\`\`bash
# .nvmrc 是 Node 版本的唯一配置来源
# - 本地开发：nvm use
# - Docker 构建：自动读取
# - CI/CD：自动读取
\`\`\`

### 2. 使用智能构建脚本

\`\`\`bash
# 推荐使用 build-docker.sh
# - 自动化程度高
# - 错误检查完善
# - 输出信息清晰
./build-docker.sh activities
\`\`\`

### 3. docker-compose 用于本地开发

\`\`\`bash
# 快速启动所有应用
docker-compose up -d

# 查看日志
docker-compose logs -f
\`\`\`

### 4. Jenkins 用于 CI/CD

```groovy
// 使用 Jenkinsfile（已重命名）
// 自动读取 .nvmrc
// 参数化构建
```

---

## ❓ 常见问题

### Q: 为什么还需要在 docker-compose.yml 中指定 NODE_VERSION？

**A**: 因为 docker-compose 不能直接读取文件内容。但如果你愿意，可以使用环境变量：

\`\`\`yaml
# .env 文件
NODE_VERSION_ADMIN_3=16
NODE_VERSION_DEFAULT=20

# docker-compose.yml
services:
  admin-system-3:
    build:
      args:
        NODE_VERSION: \${NODE_VERSION_ADMIN_3}
\`\`\`

### Q: 如果要添加新应用怎么办？

**A**: 只需：
1. 创建应用目录 \`apps/new-app/\`
2. 添加 \`.nvmrc\` 文件
3. 在 \`docker-compose.yml\` 中添加服务
4. 运行 \`./build-docker.sh new-app\`

### Q: 旧的 Dockerfile 已经删除了吗？

**A**: 是的，已经清理完成：
- ✅ 删除了 `docker/Dockerfile.activities`
- ✅ 删除了 `docker/Dockerfile.admin-system-1`
- ✅ 删除了 `docker/Dockerfile.admin-system-3`
- ✅ 删除了 `docker/Dockerfile.dapp`
- ✅ 删除了根目录的旧 `Dockerfile`
- ✅ 保留了 `docker/nginx/` 配置文件

### Q: build-docker.sh 在 Windows 上能用吗？

**A**: 不能直接用。Windows 用户可以：
1. 使用 WSL2
2. 使用 Git Bash
3. 直接使用 docker-compose

---

## 🎉 总结

### 优点
✅ **简化维护**：1 个 Dockerfile vs 4 个  
✅ **自动化**：自动从 .nvmrc 读取版本  
✅ **灵活性**：通过参数轻松配置  
✅ **统一**：所有应用使用相同的构建流程

### 注意事项
⚠️ 需要正确配置构建参数  
⚠️ .nvmrc 文件必须存在且正确  
⚠️ 需要理解多阶段构建和目标阶段

### 推荐使用场景
- ✅ 新项目或重构
- ✅ 需要支持多个 Node 版本
- ✅ 想要简化维护
- ⚠️ 如果团队不熟悉构建参数，可能需要培训

---

## 📚 相关文档

- [NODE_VERSION_CONFIG.md](NODE_VERSION_CONFIG.md) - Node 版本配置详解
- [DOCKER_JENKINS_GUIDE.md](DOCKER_JENKINS_GUIDE.md) - Docker + Jenkins 完整指南
- [Docker 多阶段构建](https://docs.docker.com/build/building/multi-stage/)
