#!/bin/bash
# macOS: double-click this file. Linux: run it from a terminal.
cd "$(dirname "$0")" || exit 1
echo "Starting PRIMEVAL... your browser will open in a moment."
echo "(Keep this window open while you play. Ctrl-C or close it when done.)"
( sleep 2
  if command -v open >/dev/null 2>&1; then open "http://localhost:8124"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "http://localhost:8124"
  else echo "Open http://localhost:8124 in your browser."
  fi ) &
if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server 8124
else
  echo
  echo "Python 3 was not found. Install it from https://www.python.org/downloads/"
  read -r -p "Press return to close. "
fi
