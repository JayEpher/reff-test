# Jenkins Docker 配置

## 问题说明

Jenkins 运行在 Docker 容器中时，默认没有 Docker 命令，导致 Jenkinsfile 中的 `docker` 命令失败。

## 解决方案

### 方案 1：快速修复（推荐）

如果你已经有运行中的 Jenkins 容器，使用以下命令重新启动：

```bash
# 1. 停止并删除现有容器
docker stop jenkins
docker rm jenkins

# 2. 重新启动 Jenkins（挂载 Docker socket）
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --group-add $(stat -c '%g' /var/run/docker.sock) \
  --restart unless-stopped \
  jenkins/jenkins:lts

# 3. 进入容器安装 Docker CLI
docker exec -u root jenkins bash -c "
  apt-get update && \
  apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release && \
  curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
  echo 'deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \$(lsb_release -cs) stable' | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
  apt-get update && \
  apt-get install -y docker-ce-cli && \
  usermod -aG docker jenkins
"

# 4. 重启 Jenkins 容器使组权限生效
docker restart jenkins

# 5. 验证 Docker 是否可用
docker exec jenkins docker --version
```

### 方案 2：使用自定义镜像（推荐用于生产）

使用本目录提供的 Dockerfile 和 docker-compose.yml：

```bash
# 1. 进入 jenkins 目录
cd jenkins/

# 2. 构建并启动 Jenkins
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 验证 Docker 是否可用
docker exec jenkins docker --version
```

### 方案 3：在宿主机上直接安装 Jenkins

如果不想使用容器化的 Jenkins，可以直接在宿主机安装：

```bash
# Ubuntu/Debian
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt-get update
sudo apt-get install fontconfig openjdk-17-jre jenkins

# 启动 Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# 将 jenkins 用户添加到 docker 组
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

## 验证

在 Jenkins Pipeline 中添加测试阶段：

```groovy
stage('Verify Docker') {
    steps {
        sh 'docker --version'
        sh 'docker ps'
        sh 'docker images'
    }
}
```

## 配置 Docker insecure-registries

无论使用哪种方案，都需要配置 Docker 以支持 HTTP Harbor：

### 如果 Jenkins 在容器中

编辑**宿主机**的 Docker daemon 配置：

```bash
sudo vi /etc/docker/daemon.json
```

添加：

```json
{
  "insecure-registries": ["107.173.87.162:8001"]
}
```

重启 Docker：

```bash
sudo systemctl restart docker

# 重启 Jenkins 容器
docker restart jenkins
```

### 验证配置

```bash
# 在宿主机上
docker info | grep -A 1 "Insecure Registries"

# 在 Jenkins 容器中
docker exec jenkins docker info | grep -A 1 "Insecure Registries"
```

## 常见问题

### 1. 权限被拒绝

```
Got permission denied while trying to connect to the Docker daemon socket
```

**解决：**

```bash
# 将 jenkins 用户添加到 docker 组
docker exec -u root jenkins usermod -aG docker jenkins
docker restart jenkins
```

### 2. Docker socket 不存在

```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

**解决：**

检查挂载是否正确：

```bash
docker inspect jenkins | grep -A 10 Mounts
```

应该看到：

```json
"Source": "/var/run/docker.sock",
"Destination": "/var/run/docker.sock"
```

### 3. Docker 命令找不到

```
docker: not found
```

**解决：**

按照方案 1 的步骤 3 安装 Docker CLI。

## 推荐方案

对于你的场景，推荐使用**方案 1**：

1. **快速** - 不需要重新构建镜像
2. **简单** - 只需要几条命令
3. **灵活** - 可以随时调整配置

执行完方案 1 后，重新运行 Jenkins 流水线即可。
