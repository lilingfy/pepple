#!/bin/bash
#
# Pebble 项目启动脚本
# 功能：启动 Supabase 本地环境 + Next.js 开发服务器，带健康自检
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
WEB_DIR="$PROJECT_ROOT/apps/web"

# 端口配置
SUPABASE_PORT=54321
NEXTJS_PORT=3020

# 启动后是否自动进入日志模式
FOLLOW_LOGS=${FOLLOW_LOGS:-true}

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

# Supabase CLI 命令（优先使用系统 supabase，否则回退到 bunx）
SUPABASE_CMD="supabase"
if ! command -v "$SUPABASE_CMD" &> /dev/null; then
    if command -v bun &> /dev/null; then
        SUPABASE_CMD="bunx supabase"
    elif command -v npx &> /dev/null; then
        SUPABASE_CMD="npx supabase"
    fi
fi

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 未安装，请先安装"
        exit 1
    fi
}

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :"$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# 等待服务就绪
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=${3:-30}
    local attempt=1

    log_info "等待 $name 就绪..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            log_success "$name 已就绪"
            return 0
        fi
        echo -n "."
        sleep 1
        ((attempt++))
    done
    echo ""
    log_error "$name 启动超时"
    return 1
}

# 自检函数
health_check() {
    log_info "========== 启动自检 =========="
    local has_error=0

    # 1. 检查 Supabase
    if curl -s http://127.0.0.1:$SUPABASE_PORT/rest/v1/ >/dev/null 2>&1; then
        log_success "Supabase API 运行正常 (端口: $SUPABASE_PORT)"
    else
        log_error "Supabase API 未响应"
        has_error=1
    fi

    # 2. 检查 Next.js
    if curl -s http://localhost:$NEXTJS_PORT/api/health >/dev/null 2>&1 || \
       curl -s http://localhost:$NEXTJS_PORT | grep -q "Pebble\|Next.js"; then
        log_success "Next.js 运行正常 (端口: $NEXTJS_PORT)"
    else
        log_error "Next.js 未响应"
        has_error=1
    fi

    # 3. 检查数据库连接
    if [ -f "$WEB_DIR/.env.local" ]; then
        if grep -q "DATABASE_URL=postgresql" "$WEB_DIR/.env.local"; then
            log_success "数据库配置正确 (PostgreSQL)"
        else
            log_warn "数据库配置可能不正确"
        fi
    fi

    # 4. 显示访问地址
    log_info "========== 访问地址 =========="
    echo -e "  ${GREEN}应用:${NC} http://localhost:$NEXTJS_PORT"
    echo -e "  ${GREEN}Supabase Studio:${NC} http://127.0.0.1:54323"
    echo -e "  ${GREEN}Supabase API:${NC} http://127.0.0.1:$SUPABASE_PORT"

    if [ $has_error -eq 0 ]; then
        log_success "========== 所有服务启动成功 =========="
        return 0
    else
        log_error "========== 部分服务异常，请检查日志 =========="
        return 1
    fi
}

# 进入 Next.js 日志模式
follow_nextjs_logs() {
    if [ "$FOLLOW_LOGS" != "true" ]; then
        return 0
    fi

    log_info "进入 Next.js 日志模式（Ctrl+C 退出）"
    tail -n 20 -f /tmp/pebble-nextjs.log
}

# 主流程
main() {
    log_info "========== Pebble 项目启动 =========="
    cd "$PROJECT_ROOT"

    # 前置检查
    log_info "检查依赖..."
    check_command "node"
    check_command "npm"
    check_command "lsof"

    # 检查 Supabase 是否已运行
    if check_port "$SUPABASE_PORT"; then
        log_warn "Supabase 已在运行 (端口: $SUPABASE_PORT)"
    else
        log_info "启动 Supabase..."
        # 排除 edge-runtime：当前环境下 Edge Runtime 容器健康检查持续失败
        # 会导致 supabase start 超时并回滚所有服务。如需 Edge Functions
        # 可设置 ENABLE_EDGE_RUNTIME=1 来启用。
        if [ "${ENABLE_EDGE_RUNTIME:-0}" = "1" ]; then
            $SUPABASE_CMD start
        else
            $SUPABASE_CMD start --exclude edge-runtime
        fi
        log_success "Supabase 启动完成"
    fi

    # 检查 Next.js 是否已运行
    if check_port "$NEXTJS_PORT"; then
        log_warn "Next.js 已在运行 (端口: $NEXTJS_PORT)，跳过启动"
        log_info "如需重启，请先运行 ./stop.sh"
    else
        log_info "启动 Next.js 开发服务器..."
        cd "$WEB_DIR"

        # 检查 .env.local
        if [ ! -f ".env.local" ]; then
            log_warn ".env.local 不存在，请配置环境变量"
        fi

        # 后台启动 Next.js
        npm run dev > /tmp/pebble-nextjs.log 2>&1 &
        NEXTJS_PID=$!
        log_info "Next.js 进程 PID: $NEXTJS_PID"

        # 等待 Next.js 启动
        if wait_for_service "http://localhost:$NEXTJS_PORT" "Next.js" 30; then
            log_success "Next.js 启动完成"
        else
            log_error "Next.js 启动失败，查看日志: /tmp/pebble-nextjs.log"
            exit 1
        fi
    fi

    # 执行自检
    sleep 2
    health_check

    # 保存 PID 供 stop.sh 使用
    echo "$NEXTJS_PID" > /tmp/pebble-nextjs.pid 2>/dev/null || true

    log_info ""
    log_info "使用 ./stop.sh 停止所有服务"
    log_info "使用 ./restart.sh 重启服务"

    # 可选：自动进入日志模式
    follow_nextjs_logs
}

# 捕获中断信号
trap 'log_warn "收到中断信号，退出日志模式..."; exit 1' INT TERM

main "$@"
