#!/bin/bash
#
# Pebble 项目重启脚本
# 功能：先停止所有服务，然后重新启动，带自检
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助
show_help() {
    cat << EOF
Pebble 项目重启脚本

用法: ./restart.sh [选项]

选项:
  -h, --help       显示帮助信息
  -f, --fast       快速重启（不清除缓存）
  -c, --clean      清除缓存后重启（默认）
  --skip-supabase  跳过 Supabase 重启（只重启 Next.js）

示例:
  ./restart.sh           # 完整重启（清除缓存）
  ./restart.sh -f        # 快速重启
  ./restart.sh --clean   # 清除缓存并重启

EOF
}

# 解析参数
FAST_MODE=false
CLEAN_MODE=true
SKIP_SUPABASE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--fast)
            FAST_MODE=true
            CLEAN_MODE=false
            shift
            ;;
        -c|--clean)
            CLEAN_MODE=true
            shift
            ;;
        --skip-supabase)
            SKIP_SUPABASE=true
            shift
            ;;
        *)
            log_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
done

# 主流程
main() {
    log_info "========== Pebble 项目重启 =========="

    # 检查脚本是否存在
    if [ ! -f "$PROJECT_ROOT/stop.sh" ]; then
        log_error "stop.sh 不存在"
        exit 1
    fi

    if [ ! -f "$PROJECT_ROOT/start.sh" ]; then
        log_error "start.sh 不存在"
        exit 1
    fi

    # 步骤 1: 停止服务
    log_info "步骤 1/3: 停止当前服务..."
    cd "$PROJECT_ROOT"

    if [ "$SKIP_SUPABASE" = true ]; then
        log_info "跳过 Supabase，只停止 Next.js..."
        # 只停止 Next.js
        pid=$(lsof -Pi :3000 -sTCP:LISTEN -t 2>/dev/null || true)
        if [ -n "$pid" ]; then
            kill "$pid" 2>/dev/null || true
            sleep 1
            kill -9 "$pid" 2>/dev/null || true
        fi
    else
        ./stop.sh
    fi

    sleep 2

    # 步骤 2: 清除缓存（如果需要）
    if [ "$CLEAN_MODE" = true ]; then
        log_info "步骤 2/3: 清除缓存..."
        if [ -d "$PROJECT_ROOT/apps/web/.next" ]; then
            rm -rf "$PROJECT_ROOT/apps/web/.next"
            log_success "Next.js 缓存已清除"
        fi
        if [ -d "$PROJECT_ROOT/node_modules/.cache" ]; then
            rm -rf "$PROJECT_ROOT/node_modules/.cache"
            log_success "Node 缓存已清除"
        fi
    else
        log_info "步骤 2/3: 跳过缓存清除（快速模式）"
    fi

    sleep 1

    # 步骤 3: 启动服务
    log_info "步骤 3/3: 启动服务..."
    ./start.sh

    log_success "========== 重启完成 =========="
}

# 捕获中断信号
trap 'log_warn "收到中断信号"; exit 1' INT TERM

main "$@"
