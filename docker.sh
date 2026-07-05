#!/bin/bash

# Docker 快速构建和部署脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 显示使用说明
show_usage() {
    cat << EOF
使用方法: $0 [命令] [应用名称]

命令:
  build       构建 Docker 镜像
  run         运行容器
  stop        停止容器
  restart     重启容器
  logs        查看容器日志
  shell       进入容器 shell
  clean       清理未使用的镜像
  all         使用 docker-compose 管理所有应用

应用名称:
  activities       Activities 应用
  admin-system-1   Admin System 1
  admin-system-3   Admin System 3
  dapp            DApp (Next.js)

示例:
  $0 build activities         # 构建 Activities 镜像
  $0 run dapp                 # 运行 DApp 容器
  $0 logs activities          # 查看 Activities 日志
  $0 all build                # 使用 docker-compose 构建所有应用
  $0 all up                   # 使用 docker-compose 启动所有应用

EOF
}

# 检查参数
if [ $# -lt 1 ]; then
    show_usage
    exit 1
fi

COMMAND=$1
APP_NAME=$2

# Docker 镜像和容器配置
NAMESPACE="puff"
DOCKER_FILES=(
    "activities:docker/Dockerfile.activities:3001:80"
    "admin-system-1:docker/Dockerfile.admin-system-1:3002:80"
    "admin-system-3:docker/Dockerfile.admin-system-3:3003:80"
    "dapp:docker/Dockerfile.dapp:3004:3000"
)

# 获取应用配置
get_app_config() {
    local app=$1
    for config in "${DOCKER_FILES[@]}"; do
        IFS=':' read -r name dockerfile port container_port <<< "$config"
        if [ "$name" == "$app" ]; then
            echo "$dockerfile:$port:$container_port"
            return 0
        fi
    done
    return 1
}

# 构建镜像
build_image() {
    local app=$1
    print_message "构建 $app 镜像..."

    config=$(get_app_config "$app")
    if [ $? -ne 0 ]; then
        print_error "未知的应用: $app"
        exit 1
    fi

    IFS=':' read -r dockerfile _ _ <<< "$config"

    docker build \
        -f "$dockerfile" \
        -t "${NAMESPACE}/${app}:latest" \
        -t "${NAMESPACE}/${app}:$(date +%Y%m%d-%H%M%S)" \
        . || {
        print_error "构建失败"
        exit 1
    }

    print_message "✅ 构建完成: ${NAMESPACE}/${app}:latest"
}

# 运行容器
run_container() {
    local app=$1
    print_message "运行 $app 容器..."

    config=$(get_app_config "$app")
    if [ $? -ne 0 ]; then
        print_error "未知的应用: $app"
        exit 1
    fi

    IFS=':' read -r _ port container_port <<< "$config"

    # 停止并删除已存在的容器
    docker stop "$app" 2>/dev/null || true
    docker rm "$app" 2>/dev/null || true

    docker run -d \
        --name "$app" \
        -p "${port}:${container_port}" \
        --restart unless-stopped \
        "${NAMESPACE}/${app}:latest" || {
        print_error "运行失败"
        exit 1
    }

    print_message "✅ 容器已启动"
    print_message "访问地址: http://localhost:${port}"
    print_message "健康检查: curl http://localhost:${port}/health"
}

# 停止容器
stop_container() {
    local app=$1
    print_message "停止 $app 容器..."

    docker stop "$app" || {
        print_error "停止失败"
        exit 1
    }

    docker rm "$app" || {
        print_error "删除容器失败"
        exit 1
    }

    print_message "✅ 容器已停止并删除"
}

# 重启容器
restart_container() {
    local app=$1
    print_message "重启 $app 容器..."

    stop_container "$app"
    sleep 2
    run_container "$app"
}

# 查看日志
show_logs() {
    local app=$1
    print_message "查看 $app 日志..."

    docker logs -f "$app"
}

# 进入容器
enter_shell() {
    local app=$1
    print_message "进入 $app 容器..."

    docker exec -it "$app" sh
}

# 清理未使用的镜像
clean_images() {
    print_message "清理未使用的镜像..."

    docker image prune -f
    docker system prune -f

    print_message "✅ 清理完成"
}

# 使用 docker-compose
use_compose() {
    local compose_cmd=$1
    print_message "执行 docker-compose $compose_cmd..."

    case $compose_cmd in
        build)
            docker-compose build
            ;;
        up)
            docker-compose up -d
            ;;
        down)
            docker-compose down
            ;;
        ps)
            docker-compose ps
            ;;
        logs)
            docker-compose logs -f
            ;;
        *)
            print_error "未知的 docker-compose 命令: $compose_cmd"
            print_message "可用命令: build, up, down, ps, logs"
            exit 1
            ;;
    esac

    print_message "✅ 完成"
}

# 主逻辑
case $COMMAND in
    build)
        if [ -z "$APP_NAME" ]; then
            print_error "请指定应用名称"
            show_usage
            exit 1
        fi
        build_image "$APP_NAME"
        ;;
    run)
        if [ -z "$APP_NAME" ]; then
            print_error "请指定应用名称"
            show_usage
            exit 1
        fi
        run_container "$APP_NAME"
        ;;
    stop)
        if [ -z "$APP_NAME" ]; then
            print_error "请指定应用名称"
            show_usage
            exit 1
        fi
        stop_container "$APP_NAME"
        ;;
    restart)
        if [ -z "$APP_NAME" ]; then
            print_error "请指定应用名称"
            show_usage
            exit 1
        fi
        restart_container "$APP_NAME"
        ;;
    logs)
        if [ -z "$APP_NAME" ]; then
            print_error "请指定应用名称"
            show_usage
            exit 1
        fi
        show_logs "$APP_NAME"
        ;;
    shell)
        if [ -z "$APP_NAME" ]; then
            print_error "请指定应用名称"
            show_usage
            exit 1
        fi
        enter_shell "$APP_NAME"
        ;;
    clean)
        clean_images
        ;;
    all)
        if [ -z "$APP_NAME" ]; then
            print_error "请指定 docker-compose 命令"
            show_usage
            exit 1
        fi
        use_compose "$APP_NAME"
        ;;
    *)
        print_error "未知命令: $COMMAND"
        show_usage
        exit 1
        ;;
esac
