#!/bin/bash
# 在 Jenkins 容器内安装 docker-compose

echo "==================================="
echo "在 Jenkins 容器安装 docker-compose"
echo "==================================="

# 进入 Jenkins 容器
docker exec -u root jenkins bash -c "
    # 下载 docker-compose
    echo '📥 下载 docker-compose...'
    curl -L 'https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)' -o /usr/local/bin/docker-compose

    # 添加执行权限
    chmod +x /usr/local/bin/docker-compose

    # 创建软链接
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

    # 验证安装
    echo '✅ 验证安装:'
    docker-compose --version
"

echo ""
echo "==================================="
echo "✅ docker-compose 安装完成"
echo "==================================="
