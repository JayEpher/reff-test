#!/bin/bash

set -e

echo "=================================================="
echo "🔧 修复 Jenkins Docker 问题"
echo "=================================================="

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用 root 权限运行此脚本"
    echo "   sudo bash fix-jenkins-docker.sh"
    exit 1
fi

# 获取 Jenkins 容器名称
JENKINS_CONTAINER=${1:-jenkins}

echo ""
echo "📋 步骤 1: 检查 Jenkins 容器是否存在"
if ! docker ps -a | grep -q "$JENKINS_CONTAINER"; then
    echo "❌ 找不到 Jenkins 容器: $JENKINS_CONTAINER"
    echo "   请确认容器名称或使用: $0 <容器名>"
    exit 1
fi

echo "✅ 找到 Jenkins 容器: $JENKINS_CONTAINER"

echo ""
echo "📋 步骤 2: 在容器中安装 Docker CLI"
docker exec -u root "$JENKINS_CONTAINER" bash -c "
    echo '更新软件包列表...'
    apt-get update -qq

    echo '安装必要的依赖...'
    apt-get install -y -qq \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release

    echo '添加 Docker GPG key...'
    curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    echo '添加 Docker 仓库...'
    echo \"deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian \$(lsb_release -cs) stable\" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    echo '更新软件包列表...'
    apt-get update -qq

    echo '安装 Docker CLI...'
    apt-get install -y -qq docker-ce-cli

    echo '将 jenkins 用户添加到 docker 组...'
    usermod -aG docker jenkins

    echo '✅ Docker CLI 安装完成'
"

echo ""
echo "📋 步骤 3: 检查 Docker socket 挂载"
if ! docker inspect "$JENKINS_CONTAINER" | grep -q "/var/run/docker.sock"; then
    echo "⚠️  警告: Docker socket 未挂载"
    echo "   需要重新创建容器并挂载 Docker socket"
    echo ""
    read -p "是否重新创建容器？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "停止容器..."
        docker stop "$JENKINS_CONTAINER"

        echo "删除容器..."
        docker rm "$JENKINS_CONTAINER"

        echo "重新创建容器（挂载 Docker socket）..."
        docker run -d \
            --name "$JENKINS_CONTAINER" \
            -p 8080:8080 \
            -p 50000:50000 \
            -v jenkins_home:/var/jenkins_home \
            -v /var/run/docker.sock:/var/run/docker.sock \
            --group-add $(stat -c '%g' /var/run/docker.sock) \
            --restart unless-stopped \
            jenkins/jenkins:lts

        echo "等待容器启动..."
        sleep 10

        echo "重新安装 Docker CLI..."
        bash "$0" "$JENKINS_CONTAINER"
        exit 0
    fi
else
    echo "✅ Docker socket 已正确挂载"
fi

echo ""
echo "📋 步骤 4: 重启 Jenkins 容器（使组权限生效）"
docker restart "$JENKINS_CONTAINER"

echo "等待 Jenkins 启动..."
sleep 15

echo ""
echo "📋 步骤 5: 验证 Docker 是否可用"
if docker exec "$JENKINS_CONTAINER" docker --version; then
    echo "✅ Docker 命令可用"
else
    echo "❌ Docker 命令不可用"
    exit 1
fi

echo ""
echo "📋 步骤 6: 测试 Docker 功能"
if docker exec "$JENKINS_CONTAINER" docker ps > /dev/null 2>&1; then
    echo "✅ Docker 功能正常"
else
    echo "❌ Docker 功能异常（可能是权限问题）"
    echo "   尝试手动修复："
    echo "   docker exec -u root $JENKINS_CONTAINER usermod -aG docker jenkins"
    echo "   docker restart $JENKINS_CONTAINER"
fi

echo ""
echo "📋 步骤 7: 配置 Harbor insecure-registries"
if ! grep -q "107.173.87.162:8001" /etc/docker/daemon.json 2>/dev/null; then
    echo "⚠️  警告: 未配置 Harbor insecure-registries"
    echo ""
    read -p "是否配置 Harbor insecure-registries？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # 备份现有配置
        if [ -f /etc/docker/daemon.json ]; then
            cp /etc/docker/daemon.json /etc/docker/daemon.json.backup
            echo "✅ 已备份现有配置到 /etc/docker/daemon.json.backup"
        fi

        # 创建或更新配置
        cat > /etc/docker/daemon.json <<EOF
{
  "insecure-registries": ["107.173.87.162:8001"]
}
EOF

        echo "✅ 已配置 Harbor insecure-registries"
        echo ""
        echo "重启 Docker daemon..."
        systemctl restart docker

        echo "重启 Jenkins 容器..."
        docker restart "$JENKINS_CONTAINER"

        echo "等待服务启动..."
        sleep 15
    fi
else
    echo "✅ Harbor insecure-registries 已配置"
fi

echo ""
echo "=================================================="
echo "✅ 修复完成！"
echo "=================================================="
echo ""
echo "📋 验证信息:"
docker exec "$JENKINS_CONTAINER" docker --version
docker exec "$JENKINS_CONTAINER" docker info | grep -A 1 "Insecure Registries"
echo ""
echo "🎉 现在可以在 Jenkins 中重新运行流水线了"
echo "   访问: http://$(hostname -I | awk '{print $1}'):8080"
