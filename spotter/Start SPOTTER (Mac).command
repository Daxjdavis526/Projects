#!/bin/bash
# Double-click to start SPOTTER on a Mac. Keep the window open while you use it.
cd "$(dirname "$0")" || exit 1
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  echo
  echo "  Node.js is not installed yet."
  echo "  Install the LTS version from https://nodejs.org, then double-click this file again."
  echo
  read -n 1 -s -r -p "  Press any key to close this window."
  exit 1
fi
node scripts/launch.mjs
echo
read -n 1 -s -r -p "  Press any key to close this window."
