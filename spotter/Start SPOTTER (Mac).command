#!/bin/bash
# Double-click to start SPOTTER on a Mac. Keep the window open while you use it.
cd "$(dirname "$0")" || exit 1
# Use a Node.js that is new enough: the one on PATH, or where the nodejs.org installer and Homebrew put it.
NODE=""
for candidate in "$(command -v node)" /usr/local/bin/node /opt/homebrew/bin/node; do
  if [ -x "$candidate" ] && "$candidate" -e 'const [a, b] = process.versions.node.split(".").map(Number); process.exit(a > 22 || (a === 22 && b >= 12) ? 0 : 1)' 2>/dev/null; then
    NODE="$candidate"
    break
  fi
done
# None new enough: use whichever exists, so SPOTTER can say which version it found.
[ -z "$NODE" ] && NODE="$(command -v node || ls /usr/local/bin/node /opt/homebrew/bin/node 2>/dev/null | head -n 1)"
if [ -z "$NODE" ]; then
  echo
  echo "  Node.js is not installed yet."
  echo "  Install the LTS version from https://nodejs.org, then double-click this file again."
  echo
  read -n 1 -s -r -p "  Press any key to close this window."
  exit 1
fi
export PATH="$(dirname "$NODE"):$PATH"
"$NODE" scripts/launch.mjs
echo
read -n 1 -s -r -p "  Press any key to close this window."
