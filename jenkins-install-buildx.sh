#!/bin/bash
# 在 Jenkins 容器内安装 Docker buildx 插件

echo "==================================="
echo "在 Jenkins 容器安装 Docker buildx"
echo "==================================="

docker exec -u root jenkins bash -c '
    echo "📋 当前 Docker 版本:"
    docker --version

    echo -e "\n📥 下载 Docker buildx..."

    # 创建 CLI 插件目录
    mkdir -p /usr/local/lib/docker/cli-plugins

    # 下载 buildx 插件（适用于 Linux x86_64）
    BUILDX_VERSION=$(curl -s https://api.github.com/repos/docker/buildx/releases/latest | grep "tag_name" | cut -d "\"" -f 4)
    echo "最新版本: ${BUILDX_VERSION}"

    curl -SL "https://github.com/docker/buildx/releases/download/${BUILDX_VERSION}/buildx-${BUILDX_VERSION}.linux-amd64" \
        -o /usr/local/lib/docker/cli-plugins/docker-buildx

    # 添加执行权限
    chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx

    # 验证安装
    echo -e "\n✅ 验证安装:"
    docker buildx version

    # 创建并使用新的 builder 实例
    echo -e "\n🔧 配置 buildx builder:"
    docker buildx create --name multiarch --driver docker-container --use || true
    docker buildx inspect --bootstrap

    echo -e "\n✅ buildx 已就绪！"
'

echo ""
echo "==================================="
echo "✅ Docker buildx 安装完成"
echo "==================================="
echo ""
echo "提示: 如果下载速度慢，可以手动下载后上传到服务器"
