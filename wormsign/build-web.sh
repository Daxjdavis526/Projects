#!/usr/bin/env bash
# Build the browser version into dist/.
#
#   ./build-web.sh          release build (what gets published)
#   ./build-web.sh --dev    faster compile, slower game
#
# Needs: rustup target add wasm32-unknown-unknown
#        cargo install wasm-bindgen-cli --version <the wasm-bindgen in Cargo.lock>
# Optional: wasm-opt (binaryen) 116 or newer shrinks the output a lot (50 MB
#   to about 20). Older versions break wasm-bindgen's reference table, so
#   they are skipped. Point WASM_OPT at a newer one if the system's is old.
set -euo pipefail
cd "$(dirname "$0")"

# The `web` profile is size-optimised (see Cargo.toml); --dev is quick.
profile=web
flag="--profile web"
if [[ "${1:-}" == "--dev" ]]; then profile=debug; flag=; fi

cargo build -p wormsign --target wasm32-unknown-unknown $flag

want=$(grep -A1 '^name = "wasm-bindgen"$' Cargo.lock | sed -n 's/version = "\(.*\)"/\1/p')
have=$(wasm-bindgen --version | awk '{print $2}')
if [[ "$want" != "$have" ]]; then
  echo "wasm-bindgen CLI is $have but Cargo.lock wants $want:" >&2
  echo "  cargo install wasm-bindgen-cli --version $want --locked" >&2
  exit 1
fi

rm -rf dist && mkdir -p dist
wasm-bindgen --target web --no-typescript --out-dir dist --out-name wormsign \
  "target/wasm32-unknown-unknown/$profile/wormsign.wasm"

WASM_OPT="${WASM_OPT:-wasm-opt}"
if [[ "$profile" == web ]] && command -v "$WASM_OPT" >/dev/null; then
  v=$("$WASM_OPT" --version | grep -o '[0-9]\+' | head -1)
  if (( v >= 116 )); then
    "$WASM_OPT" -Oz --all-features --strip-debug --strip-producers \
      dist/wormsign_bg.wasm -o dist/wormsign_bg.wasm || echo "wasm-opt failed; keeping unoptimised wasm" >&2
  else
    echo "wasm-opt $v is too old (need 116+); skipping. Set WASM_OPT to a newer one." >&2
  fi
fi

cp web/index.html dist/
ls -la dist
