#!/bin/bash

# 智能 Docker 构建脚本
# 自动从 .nvmrc 读取 Node.js 版本并构建应用

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 显示使用说明
show_usage() {
    cat << EOF
智能 Docker 构建脚本 - 自动从 .nvmrc 读取 Node 版本

使用方法: $0 <应用名称> [选项]

应用名称:
  activities       - Activities 应用
  admin-system-1   - Admin System 1
  admin-system-3   - Admin System 3
  dapp            - DApp (Next.js)
  all             - 构建所有应用

选项:
  --push          推送镜像到仓库
  --no-cache      不使用缓存构建
  --env <env>     指定环境 (development/test/production)，默认: production

示例:
  $0 activities                    # 构建 Activities（自动读取 Node 版本）
  $0 admin-system-3                # 构建 Admin System 3（自动使用 Node 16）
  $0 dapp --env production         # 构建生产环境的 DApp
  $0 all                           # 构建所有应用
  $0 activities --push             # 构建并推送到仓库

EOF
}

# 检查参数
if [ $# -lt 1 ]; then
    show_usage
    exit 1
fi

APP_NAME=$1
shift

# 默认参数
PUSH_IMAGE=false
NO_CACHE=""
BUILD_ENV="production"
DOCKER_REGISTRY="puff"

# 解析选项
while [[ $# -gt 0 ]]; do
    case $1 in
        --push)
            PUSH_IMAGE=true
            shift
            ;;
        --no-cache)
            NO_CACHE="--no-cache"
            shift
            ;;
        --env)
            BUILD_ENV="$2"
            shift 2
            ;;
        *)
            print_error "未知选项: $1"
            show_usage
            exit 1
            ;;
    esac
done

# 应用配置
declare -A APP_TYPES=(
    ["activities"]="static"
    ["admin-system-1"]="static"
    ["admin-system-3"]="static"
    ["dapp"]="nextjs"
)

declare -A APP_PORTS=(
    ["activities"]="3001:80"
    ["admin-system-1"]="3002:80"
    ["admin-system-3"]="3003:80"
    ["dapp"]="3004:3000"
)

# 从 .nvmrc 读取 Node 版本
get_node_version() {
    local app=$1
    local nvmrc_file="apps/${app}/.nvmrc"

    if [ -f "$nvmrc_file" ]; then
        local version=$(cat "$nvmrc_file" | tr -d '[:space:]')
        echo "$version"
    else
        print_warning ".nvmrc not found for $app, using default version 20"
        echo "20"
    fi
}

# 构建单个应用
build_app() {
    local app=$1

    print_step "=========================================="
    print_step "构建应用: $app"
    print_step "=========================================="

    # 检查应用是否存在
    if [ ! -d "apps/${app}" ]; then
        print_error "应用目录不存在: apps/${app}"
        exit 1
    fi

    # 获取应用类型
    local app_type="${APP_TYPES[$app]}"
    if [ -z "$app_type" ]; then
        print_error "未知的应用: $app"
        exit 1
    fi

    # 读取 Node 版本
    local node_version=$(get_node_version "$app")
    print_info "Node.js 版本: $node_version (从 apps/${app}/.nvmrc 读取)"

    # 确定目标阶段
    local target_stage
    if [ "$app_type" == "static" ]; then
        target_stage="production-static"
    else
        target_stage="production-nextjs"
    fi

    print_info "应用类型: $app_type"
    print_info "构建环境: $BUILD_ENV"
    print_info "目标阶段: $target_stage"

    # 构建镜像
    local image_name="${DOCKER_REGISTRY}/${app}:latest"
    local image_tag="${DOCKER_REGISTRY}/${app}:$(date +%Y%m%d-%H%M%S)"

    print_step "开始构建镜像..."

    docker build \
        $NO_CACHE \
        --build-arg NODE_VERSION="$node_version" \
        --build-arg APP_NAME="$app" \
        --build-arg BUILD_ENV="$BUILD_ENV" \
        --target "$target_stage" \
        -t "$image_name" \
        -t "$image_tag" \
        -f Dockerfile.universal \
        . || {
        print_error "构建失败"
        exit 1
    }

    print_info "✅ 构建完成"
    print_info "镜像标签: $image_name"
    print_info "镜像标签: $image_tag"

    # 显示镜像信息
    docker images | grep "$app" | head -3

    # 推送镜像
    if [ "$PUSH_IMAGE" = true ]; then
        print_step "推送镜像到仓库..."
        docker push "$image_name" || {
            print_error "推送失败"
            exit 1
        }
        docker push "$image_tag" || {
            print_error "推送失败"
            exit 1
        }
        print_info "✅ 推送完成"
    fi

    # 显示运行命令
    local ports="${APP_PORTS[$app]}"
    print_info ""
    print_info "运行命令:"
    echo "  docker run -d -p $ports --name $app $image_name"
    print_info ""
}

# 构建所有应用
build_all() {
    print_step "=========================================="
    print_step "构建所有应用"
    print_step "=========================================="

    for app in "${!APP_TYPES[@]}"; do
        build_app "$app"
        echo ""
    done

    print_info "=========================================="
    print_info "✅ 所有应用构建完成"
    print_info "=========================================="

    # 显示所有镜像
    print_info "构建的镜像:"
    docker images | grep "puff/" | grep -E "activities|admin-system|dapp"
}

# 主逻辑
if [ "$APP_NAME" == "all" ]; then
    build_all
else
    build_app "$APP_NAME"
fi

print_info ""
print_info "🎉 完成！"
