# Jenkins 多分支流水线配置指南

## 概述

本文档介绍如何配置 Jenkins 多分支流水线，实现三个分支（dev/test/main）对应三个环境的完整 CI/CD 流程。

## 架构说明

### 分支环境映射

| 分支 | 环境 | 部署方式 | 人工确认 |
|------|------|---------|---------|
| `dev` | development | 自动部署 | ❌ 否 |
| `test` | test | 自动部署 | ❌ 否 |
| `main` | production | 自动部署 | ✅ 是 |

### 应用端口映射

| 应用 | 容器端口 | 宿主机端口 |
|------|---------|-----------|
| activities | 80 | 3001 |
| admin-system-1 | 80 | 3002 |
| admin-system-3 | 80 | 3003 |
| dapp | 3000 | 3004 |

### 镜像命名规则

```
107.173.87.162:8001/puff/{app-name}:{branch}-{build-number}-{timestamp}
107.173.87.162:8001/puff/{app-name}:{branch}-latest
```

**示例：**
```
107.173.87.162:8001/puff/activities:dev-15-20260706-143022
107.173.87.162:8001/puff/activities:dev-latest
```

---

## 一、Jenkins 配置

### 1. 创建多分支流水线

1. 登录 Jenkins
2. 点击 "新建任务"
3. 输入任务名称：`puff-monorepo`
4. 选择 **"Multibranch Pipeline"**（多分支流水线）
5. 点击 "确定"

### 2. 配置 Git 仓库

在 **"Branch Sources"** 部分：

1. 点击 "Add source" → 选择 "Git"
2. 填写 **Project Repository**：你的 Git 仓库地址
3. 添加 **Credentials**（如果是私有仓库）
4. 在 **"Behaviours"** 中配置：
   - ✅ **Discover branches**: All branches
   - 可选：**Filter by name (include)**: `dev test main`（仅构建这三个分支）

### 3. 配置构建触发

在 **"Build Configuration"** 部分：

- **Mode**: by Jenkinsfile
- **Script Path**: `Jenkinsfile`（项目根目录的 Jenkinsfile）

### 4. 保存配置

点击 "保存"，Jenkins 会自动扫描仓库中的分支，并为每个包含 Jenkinsfile 的分支创建流水线。

---

## 二、Harbor 配置

### 1. 创建 Harbor 项目

1. 登录 Harbor: `http://107.173.87.162:8001`
2. 点击 **"New Project"**
3. 配置：
   - **Project Name**: `puff`
   - **Access Level**: Private（推荐）
   - **Storage Quota**: 根据需要设置（建议至少 10GB）

### 2. 创建 Robot Account（推荐）

**为什么使用 Robot Account？**
- 不依赖个人账号，更安全
- 可以设置过期时间
- 权限细粒度控制

**创建步骤：**

1. 进入 `puff` 项目
2. 点击 **"Robot Accounts"** → **"New Robot Account"**
3. 配置：
   - **Name**: `jenkins-ci`
   - **Expiration time**: 根据需要设置（建议 Never 或设置较长时间）
   - **Permissions**: 
     - ✅ Push artifact
     - ✅ Pull artifact
4. 点击 **"Add"**
5. **重要：复制生成的 Token**（只显示一次，妥善保存）

格式示例：
```
Username: robot$jenkins-ci
Token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. 配置 Jenkins Harbor 凭据

1. Jenkins 首页 → **Manage Jenkins** → **Credentials**
2. 选择合适的 Domain（通常是 **Global**）
3. 点击 **"Add Credentials"**
4. 配置：
   - **Kind**: Username with password
   - **Username**: `robot$jenkins-ci`（Robot Account 的用户名）
   - **Password**: 刚才复制的 Token
   - **ID**: `harbor-credentials`（⚠️ 必须与 Jenkinsfile 中一致）
   - **Description**: Harbor Registry Credentials
5. 点击 **"Create"**

### 4. 配置 Docker Insecure Registry（HTTP 访问）

如果 Harbor 使用 HTTP 而非 HTTPS，需要配置 Docker daemon。

**在 Jenkins 服务器（107.173.87.162）上执行：**

```bash
# 编辑 Docker daemon 配置
sudo vi /etc/docker/daemon.json
```

添加以下内容：

```json
{
  "insecure-registries": ["107.173.87.162:8001"]
}
```

重启 Docker：

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证配置
docker info | grep -A 1 "Insecure Registries"
```

**手动测试登录：**

```bash
docker login 107.173.87.162:8001 -u robot\$jenkins-ci
# 输入 Token 作为密码
```


---

## 三、流水线使用

### 流水线阶段说明

每次提交代码到 dev/test/main 分支，都会自动触发以下流程：

1. **Environment Info**: 显示分支、环境、构建信息
2. **Checkout**: 拉取代码
3. **Show System Info**: 显示 Docker、Node.js 版本信息
4. **Build Docker Images**: 构建 Docker 镜像
5. **Push to Harbor**: 推送镜像到 Harbor 仓库
6. **Deploy**: 部署到对应环境（可选）
7. **Health Check**: 检查容器运行状态

### 构建参数

Jenkins 会为每个分支创建独立的流水线，每个流水线支持以下参数：

**APP_TO_BUILD:**
- `all`: 构建所有应用（activities, admin-system-1, admin-system-3, dapp）
- `activities`: 仅构建 activities
- `admin-system-1`: 仅构建 admin-system-1
- `admin-system-3`: 仅构建 admin-system-3
- `dapp`: 仅构建 dapp

**SKIP_DEPLOY:**
- `false`（默认）: 构建并部署
- `true`: 仅构建镜像推送到 Harbor，不部署

### 使用方式

#### 方式 1：自动触发（推荐）

```bash
# 1. 开发人员提交代码
git checkout dev
git add .
git commit -m "feat: add new feature"
git push origin dev

# 2. Jenkins 自动检测到代码变化并触发构建
# 3. 流水线自动执行所有阶段
# 4. 构建完成后自动部署
```

#### 方式 2：手动触发

1. 登录 Jenkins
2. 找到 `puff-monorepo` 多分支流水线
3. 选择要构建的分支（dev/test/main）
4. 点击 **"Build with Parameters"**
5. 选择参数：
   - **APP_TO_BUILD**: 选择要构建的应用
   - **SKIP_DEPLOY**: 是否跳过部署
6. 点击 **"Build"**

---

## 四、工作流程示例

### 开发环境（dev 分支）

```bash
# 1. 在本地开发新功能
git checkout dev
# 修改代码...
git add .
git commit -m "feat: add login feature"
git push origin dev

# 2. Jenkins 自动触发
# ✅ 构建镜像
# ✅ 推送到 Harbor: 107.173.87.162:8001/puff/activities:dev-15-20260706-143022
# ✅ 自动部署到开发环境

# 3. 访问应用验证
# http://107.173.87.162:3001  (activities)
# http://107.173.87.162:3002  (admin-system-1)
# http://107.173.87.162:3003  (admin-system-3)
# http://107.173.87.162:3004  (dapp)
```

### 测试环境（test 分支）

```bash
# 1. 开发完成后，合并到 test 分支
git checkout test
git merge dev
git push origin test

# 2. Jenkins 自动触发测试环境构建和部署
# ✅ 构建镜像并打标签: test-16-20260706-150000
# ✅ 自动部署到测试环境

# 3. 测试团队进行功能验证和回归测试
```

### 生产环境（main 分支）

```bash
# 1. 测试通过后，合并到 main 分支
git checkout main
git merge test
git push origin main

# 2. Jenkins 触发生产环境流水线
# ✅ 构建镜像: main-20-20260706-160000
# ✅ 推送到 Harbor
# ⏸️ 暂停，等待人工确认

# 3. 在 Jenkins 界面点击 "确认部署"
# ✅ 部署到生产环境

# 4. 验证生产环境
# http://107.173.87.162:3001-3004
```

---

## 五、常见问题排查

### 1. 构建失败：无法连接到 Harbor

**错误信息：**
```
Error response from daemon: Get "http://107.173.87.162:8001/v2/": dial tcp 107.173.87.162:8001: connect: connection refused
```

**排查步骤：**

1. 检查 Harbor 服务是否启动：
```bash
docker ps | grep harbor
```

2. 检查 Harbor 端口是否监听：
```bash
sudo netstat -tulpn | grep :8001
```

3. 检查防火墙：
```bash
sudo ufw status
# 如果端口被阻止，开放端口：
sudo ufw allow 8001/tcp
```

4. 验证 Docker insecure-registries 配置：
```bash
docker info | grep -A 1 "Insecure Registries"
```

### 2. 推送镜像失败：认证错误

**错误信息：**
```
unauthorized: unauthorized to access repository: puff/activities
```

**排查步骤：**

1. 检查 Jenkins 凭据是否正确：
   - Jenkins → Credentials → 查看 `harbor-credentials`
   - 确认 Username 和 Password 正确

2. 手动测试 Harbor 登录：
```bash
docker login 107.173.87.162:8001 -u robot\$jenkins-ci
# 输入 Token
```

3. 检查 Robot Account 权限：
   - Harbor → puff 项目 → Robot Accounts
   - 确认 `jenkins-ci` 具有 Push 和 Pull 权限

4. 检查项目是否存在：
   - Harbor → Projects
   - 确认 `puff` 项目已创建且为 Private

### 3. 部署失败：容器无法启动

**错误信息：**
```
Container exited with code 1
```

**排查步骤：**

1. 查看容器日志：
```bash
docker logs puff-activities-development
```

2. 检查镜像是否正确：
```bash
docker images | grep puff
docker inspect 107.173.87.162:8001/puff/activities:dev-latest
```

3. 手动启动容器测试：
```bash
docker run -it --rm \
  -p 3001:80 \
  107.173.87.162:8001/puff/activities:dev-latest \
  sh

# 在容器内检查文件
ls -la /usr/share/nginx/html/
```

4. 检查容器健康状态：
```bash
docker ps -a | grep puff
docker inspect puff-activities-development | grep -A 10 State
```

### 4. 端口冲突

**错误信息：**
```
Bind for 0.0.0.0:3001 failed: port is already allocated
```

**解决方案：**

1. 查找占用端口的进程：
```bash
sudo lsof -i :3001
# 或
sudo netstat -tulpn | grep :3001
```

2. 停止占用端口的容器：
```bash
docker ps | grep 3001
docker stop <container-id>
docker rm <container-id>
```

3. 或修改端口映射：
   编辑 `docker-compose.yml`，修改端口映射。

### 5. Jenkinsfile 语法错误

**错误信息：**
```
WorkflowScript: 15: unexpected token: } @ line 15, column 9.
```

**解决方案：**

1. 使用 Jenkins Pipeline Syntax 工具验证：
   - Jenkins → 项目 → Pipeline Syntax
   - 粘贴代码片段验证

2. 检查常见语法问题：
   - 缺少闭合括号 `}`
   - 字符串引号不匹配
   - Groovy 语法错误

3. 使用 Groovy 在线编辑器验证：
   - https://groovyconsole.appspot.com/

---

## 六、手动操作命令

### 手动构建镜像

```bash
# 登录 Harbor
docker login 107.173.87.162:8001 -u robot\$jenkins-ci

# 构建镜像（以 activities 为例）
docker build \
  --build-arg NODE_VERSION=20 \
  --build-arg APP_NAME=activities \
  --build-arg BUILD_ENV=production \
  --target production-static \
  -t 107.173.87.162:8001/puff/activities:manual-1 \
  -f Dockerfile.universal \
  .

# 推送镜像
docker push 107.173.87.162:8001/puff/activities:manual-1
```

### 手动部署

```bash
# 1. 拉取镜像
docker pull 107.173.87.162:8001/puff/activities:dev-latest

# 2. 停止旧容器
docker stop puff-activities-development || true
docker rm puff-activities-development || true

# 3. 启动新容器
docker run -d \
  --name puff-activities-development \
  -p 3001:80 \
  -e NODE_ENV=development \
  --restart unless-stopped \
  107.173.87.162:8001/puff/activities:dev-latest

# 4. 查看日志
docker logs -f puff-activities-development

# 5. 验证容器状态
docker ps | grep puff-activities
```

### 使用 docker-compose 部署

```bash
# 1. 创建 docker-compose.override.yml
cat > docker-compose.override.yml <<EOF
version: '3.8'
services:
  activities:
    image: 107.173.87.162:8001/puff/activities:dev-latest
    container_name: puff-activities-development
    environment:
      - NODE_ENV=development
EOF

# 2. 启动服务
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d activities

# 3. 查看状态
docker-compose ps

# 4. 查看日志
docker-compose logs -f activities
```

### 查看 Harbor 镜像信息

```bash
# 使用 API 查询镜像
curl -u robot\$jenkins-ci:<token> \
  http://107.173.87.162:8001/api/v2.0/projects/puff/repositories

# 查询特定应用的标签
curl -u robot\$jenkins-ci:<token> \
  http://107.173.87.162:8001/api/v2.0/projects/puff/repositories/activities/artifacts
```

### 清理资源

```bash
# 清理未使用的镜像
docker image prune -a -f

# 清理停止的容器
docker container prune -f

# 清理所有 puff 相关容器（谨慎使用）
docker ps -a | grep puff | awk '{print $1}' | xargs docker rm -f

# 清理 Harbor 旧镜像（在 Harbor UI 中操作）
# Harbor → puff → 选择仓库 → Artifacts → 选择旧标签 → Delete
```

---

## 七、最佳实践

### 1. 安全性

- ✅ 使用 Robot Account 而非个人账号
- ✅ 定期轮换 Harbor Token
- ✅ 生产环境使用 HTTPS 访问 Harbor
- ✅ 限制 Harbor 项目访问权限
- ✅ 定期更新 Harbor 和 Docker 版本
- ✅ 使用强密码策略

### 2. 镜像管理

- ✅ 使用语义化版本标签（如 `v1.2.3`）
- ✅ 保留关键版本的镜像，便于快速回滚
- ✅ 定期清理旧镜像，避免占用过多存储
- ✅ 为每个分支维护独立的 `latest` 标签
- ✅ 生产镜像使用不可变标签（含构建号和时间戳）

### 3. 部署策略

- ✅ 开发和测试环境自动部署
- ✅ 生产环境需要人工确认
- ✅ 使用蓝绿部署或滚动更新
- ✅ 保留快速回滚机制
- ✅ 部署后进行健康检查

### 4. 监控和日志

- ✅ 集中收集容器日志（如使用 ELK）
- ✅ 监控容器资源使用情况
- ✅ 设置告警规则（CPU、内存、磁盘）
- ✅ 定期检查 Jenkins 构建日志
- ✅ 记录每次部署的版本信息

### 5. 备份和恢复

- ✅ 定期备份 Harbor 数据
- ✅ 备份 Jenkins 配置和凭据
- ✅ 备份 docker-compose.yml 和环境配置
- ✅ 文档化恢复流程
- ✅ 定期测试恢复流程

### 6. 性能优化

- ✅ 使用 Docker 多阶段构建
- ✅ 利用 Docker 缓存加速构建
- ✅ 并行构建独立的应用
- ✅ 使用 CDN 加速镜像拉取（如需要）
- ✅ 定期清理 Docker 构建缓存

---

## 八、故障恢复

### 场景 1：生产环境部署失败需要回滚

```bash
# 1. 查看上一个版本的镜像标签
# 在 Harbor UI 中查看，或使用 API 查询

# 2. 修改 docker-compose.override.yml
cat > docker-compose.override.yml <<EOF
version: '3.8'
services:
  activities:
    image: 107.173.87.162:8001/puff/activities:main-19-20260706-150000  # 上一个版本
EOF

# 3. 重新部署
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d activities

# 4. 验证服务
curl http://107.173.87.162:3001
docker logs puff-activities-production
```

### 场景 2：Harbor 服务异常

```bash
# 1. 检查 Harbor 容器状态
docker ps -a | grep harbor

# 2. 重启 Harbor
cd /path/to/harbor
docker-compose down
docker-compose up -d

# 3. 检查日志
docker-compose logs -f

# 4. 验证 Harbor UI
# 访问 http://107.173.87.162:8001
```

### 场景 3：Jenkins 构建卡住

```bash
# 1. 登录 Jenkins
# 2. 找到卡住的构建
# 3. 点击 "Console Output" 查看日志
# 4. 点击左侧 "Stop" 终止构建
# 5. 检查 Jenkins 服务器资源：
top
df -h
docker ps

# 6. 清理 Docker 资源
docker system prune -af

# 7. 重新触发构建
```

---

## 九、升级和维护

### Jenkins 升级

```bash
# 1. 备份 Jenkins 数据
sudo cp -r /var/lib/jenkins /var/lib/jenkins.backup

# 2. 停止 Jenkins
sudo systemctl stop jenkins

# 3. 升级 Jenkins
# 根据安装方式选择：
# - Docker: 拉取新镜像并重新创建容器
# - 包管理器: sudo apt-get update && sudo apt-get upgrade jenkins

# 4. 启动 Jenkins
sudo systemctl start jenkins

# 5. 验证
# 访问 Jenkins UI，检查版本号
```

### Harbor 升级

参考 Harbor 官方文档：
https://goharbor.io/docs/latest/administration/upgrade/

### Docker 升级

```bash
# 1. 检查当前版本
docker version

# 2. 升级 Docker
sudo apt-get update
sudo apt-get upgrade docker-ce docker-ce-cli containerd.io

# 3. 重启 Docker
sudo systemctl restart docker

# 4. 验证
docker version
docker ps  # 确保现有容器正常运行
```

---

## 十、参考资源

### 官方文档

- **Jenkins**: https://www.jenkins.io/doc/
- **Harbor**: https://goharbor.io/docs/
- **Docker**: https://docs.docker.com/
- **Docker Compose**: https://docs.docker.com/compose/

### 有用的命令速查

```bash
# Jenkins
# 查看 Jenkins 日志
sudo journalctl -u jenkins -f

# Harbor
# 查看 Harbor 所有容器
docker ps | grep harbor

# 重启 Harbor
cd /path/to/harbor && docker-compose restart

# Docker
# 查看所有容器（包括停止的）
docker ps -a

# 查看镜像
docker images

# 清理资源
docker system df  # 查看磁盘使用
docker system prune -a  # 清理所有未使用资源

# 容器操作
docker logs <container>  # 查看日志
docker exec -it <container> sh  # 进入容器
docker inspect <container>  # 查看详细信息
docker stats  # 查看资源使用情况
```

---

## 联系和支持

如遇到问题，请：

1. 查看 Jenkins Console Output 日志
2. 查看 Docker 容器日志
3. 检查 Harbor UI 中的镜像信息
4. 参考本文档的故障排查部分
5. 联系 DevOps 团队
