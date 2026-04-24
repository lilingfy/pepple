#!/bin/bash
#
# Pebble 项目停止脚本
# 功能：停止 Next.js 开发服务器和 Supabase 本地环境
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 端口配置
SUPABASE_PORT=54321
NEXTJS_PORT=3020

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

# 停止进程（通过端口）
stop_process_by_port() {
    local port=$1
    local name=$2

    local pid=$(lsof -Pi :"$port" -sTCP:LISTEN -t 2>/dev/null || true)
    if [ -n "$pid" ]; then
        log_info "停止 $name (PID: $pid, 端口: $port)..."
        kill "$pid" 2>/dev/null || true
        sleep 1

        # 强制终止如果还在运行
        if kill -0 "$pid" 2>/dev/null; then
            log_warn "$name 未响应，强制终止..."
            kill -9 "$pid" 2>/dev/null || true
        fi
        log_success "$name 已停止"
    else
        log_warn "$name 未在运行 (端口: $port)"
    fi
}

# 停止 Next.js
stop_nextjs() {
    log_info "检查 Next.js 进程..."

    # 尝试通过端口停止
    stop_process_by_port "$NEXTJS_PORT" "Next.js"

    # 清理 PID 文件
    if [ -f /tmp/pebble-nextjs.pid ]; then
        rm -f /tmp/pebble-nextjs.pid
    fi

    # 清理日志文件
    if [ -f /tmp/pebble-nextjs.log ]; then
        rm -f /tmp/pebble-nextjs.log
    fi
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

# 停止 Supabase
stop_supabase() {
    log_info "检查 Supabase..."

    # 检查 Supabase 是否在运行
    if lsof -Pi :"$SUPABASE_PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_info "停止 Supabase..."
        $SUPABASE_CMD stop
        log_success "Supabase 已停止"
    else
        log_warn "Supabase 未在运行"
    fi
}

# 显示状态
show_status() {
    log_info "========== 服务状态 =========="

    # 检查 Next.js
    if lsof -Pi :"$NEXTJS_PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warn "Next.js 仍在运行 (端口: $NEXTJS_PORT)"
    else
        log_success "Next.js 已停止"
    fi

    # 检查 Supabase
    if lsof -Pi :"$SUPABASE_PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warn "Supabase 仍在运行 (端口: $SUPABASE_PORT)"
    else
        log_success "Supabase 已停止"
    fi
}

# 主流程
main() {
    log_info "========== Pebble 项目停止 =========="

    # 停止 Next.js
    stop_nextjs

    # 停止 Supabase
    stop_supabase

    # 显示最终状态
    show_status

    log_success "========== 所有服务已停止 =========="
}

# 捕获中断信号
trap 'log_warn "收到中断信号"; exit 1' INT TERM

main "$@"
