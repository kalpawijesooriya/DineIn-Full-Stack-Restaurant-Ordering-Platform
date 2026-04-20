#!/bin/bash

set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR" || exit 1

# ANSI colors for readable per-app log prefixes.
NC=$'\033[0m'
BLUE=$'\033[1;34m'
GREEN=$'\033[1;32m'
YELLOW=$'\033[1;33m'
MAGENTA=$'\033[1;35m'
CYAN=$'\033[1;36m'

PIDS=()
APP_NAMES=()
APP_PORTS=()

start_app() {
  local name="$1"
  local color="$2"
  local dir="$3"
  local cmd="$4"
  local port="$5"
  local prefix="${color}[${name}]${NC} "

  (
    cd "$dir" || exit 1
    bash -lc "$cmd" 2>&1 | sed -u "s/^/${prefix}/"
  ) &

  local pid=$!
  PIDS+=("$pid")
  APP_NAMES+=("$name")
  APP_PORTS+=("$port")

  echo -e "${color}Started ${name}${NC} (PID ${pid})"
}

cleanup() {
  echo
  echo "Stopping all apps..."

  trap - SIGINT SIGTERM

  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill -TERM "$pid" 2>/dev/null || true
    fi
  done

  sleep 1

  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" 2>/dev/null; then
      kill -KILL "$pid" 2>/dev/null || true
    fi
  done

  wait
  echo "All apps stopped."
  exit 0
}

trap cleanup SIGINT SIGTERM

echo "Starting DineIn platform apps from: $ROOT_DIR"

start_app "API" "$BLUE" "$ROOT_DIR/dine-in-api/src/DineIn.API" "dotnet run" "5038"
start_app "ADMIN" "$GREEN" "$ROOT_DIR/dine-in-admin" "npm run dev" "5174"
start_app "KITCHEN" "$YELLOW" "$ROOT_DIR/dine-in-kitchen" "npm run dev" "5173"
start_app "ORDER" "$MAGENTA" "$ROOT_DIR/dine-in-order" "npm run dev" "5175"
start_app "MOBILE" "$CYAN" "$ROOT_DIR/dine-in-app" "npm start" "~19000"

echo
echo "Running services:"
for i in "${!APP_NAMES[@]}"; do
  printf "- %-8s | Port: %-7s | PID: %s\n" "${APP_NAMES[$i]}" "${APP_PORTS[$i]}" "${PIDS[$i]}"
done
echo
echo "Press Ctrl+C to stop all services."

wait