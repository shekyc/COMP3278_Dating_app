#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# Prefer the user's Node installation. The second path supports Codex's bundled runtime.
if command -v node >/dev/null 2>&1; then NODE="$(command -v node)";
elif [ -x "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" ]; then NODE="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node";
else echo 'Install Node.js 22 or newer, then run this script again.'; exit 1; fi
export PATH="$(dirname "$NODE"):$PATH"
if [ ! -f .env ]; then echo 'Copy .env.example to .env and configure your local MySQL account first. See README.md.'; exit 1; fi
if [ ! -d node_modules ]; then echo 'Run pnpm install first. See README.md.'; exit 1; fi
# This task's isolated MySQL runtime is optional; normal installations use .env directly.
TASK_RUNTIME="$ROOT/../../work/runtime"
if [ -x "$TASK_RUNTIME/mysql-8.4.11-macos15-arm64/bin/mysqld" ] && [ -d "$TASK_RUNTIME/mysql-demo-data" ]; then
 if ! "$TASK_RUNTIME/mysql-8.4.11-macos15-arm64/bin/mysqladmin" --no-defaults --socket="$TASK_RUNTIME/mysql.sock" -u root ping >/dev/null 2>&1; then
  "$TASK_RUNTIME/mysql-8.4.11-macos15-arm64/bin/mysqld" --no-defaults --basedir="$TASK_RUNTIME/mysql-8.4.11-macos15-arm64" --datadir="$TASK_RUNTIME/mysql-demo-data" --bind-address=127.0.0.1 --port=3307 --socket="$TASK_RUNTIME/mysql.sock" --mysqlx=OFF --log-error="$TASK_RUNTIME/mysql.log" --pid-file="$TASK_RUNTIME/mysql.pid" &
  for attempt in {1..30}; do
   if "$TASK_RUNTIME/mysql-8.4.11-macos15-arm64/bin/mysqladmin" --no-defaults --socket="$TASK_RUNTIME/mysql.sock" -u root ping >/dev/null 2>&1; then break; fi
   sleep 1
  done
 fi
fi
"$NODE" --import tsx scripts/ensure-db.ts
"$NODE" node_modules/vite/bin/vite.js build
printf '\nChemistry is ready at http://127.0.0.1:3000\nKeep this terminal open. Press Control-C to stop the web server.\n\n'
NODE_ENV=production "$NODE" --import tsx src/server/index.ts
