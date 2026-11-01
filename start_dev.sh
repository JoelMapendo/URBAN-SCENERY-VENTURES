#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

# Resolve a Python 3.10+ interpreter if .venv does not exist yet
if [ ! -x "$ROOT_DIR/.venv/bin/python" ]; then
  PYTHON_BIN=""
  for candidate in python3.13 python3.12 python3.11 python3.10 /opt/homebrew/bin/python3 /usr/local/bin/python3 python3; do
    if command -v "$candidate" >/dev/null 2>&1; then
      if "$candidate" -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)' 2>/dev/null; then
        PYTHON_BIN="$(command -v "$candidate")"
        break
      fi
    fi
  done

  if [ -z "$PYTHON_BIN" ]; then
    echo "Error: Python 3.10+ is required for FastAPI / SQLAlchemy 2.0." >&2
    exit 1
  fi

  echo "Creating virtual environment in .venv using $PYTHON_BIN ..."
  "$PYTHON_BIN" -m venv "$ROOT_DIR/.venv"
  "$ROOT_DIR/.venv/bin/pip" install --upgrade pip
  "$ROOT_DIR/.venv/bin/pip" install -r "$ROOT_DIR/requirements.txt"
fi

if [ ! -d "$ROOT_DIR/FrontEnd/node_modules" ]; then
  echo "Installing FrontEnd npm dependencies..."
  (cd "$ROOT_DIR/FrontEnd" && npm install)
fi

BACKEND_PID=""
FRONTEND_PID=""

cleanup() {
  echo ""
  echo "Stopping Urban Scenery Ventures services..."
  [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting FastAPI Backend on http://127.0.0.1:8000 ..."
"$ROOT_DIR/.venv/bin/uvicorn" main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

echo "Starting Vite Frontend on http://127.0.0.1:5173 ..."
(cd "$ROOT_DIR/FrontEnd" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "============================================================"
echo " Urban Scenery Ventures Full-Stack Dev Environment Ready"
echo "------------------------------------------------------------"
echo " Storefront UI : http://127.0.0.1:5173/"
echo " Seller Central: http://127.0.0.1:5173/seller.html"
echo " FastAPI Docs  : http://127.0.0.1:8000/docs"
echo "============================================================"
echo "Press Ctrl+C to stop both servers."

wait

