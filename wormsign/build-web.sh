#!/usr/bin/env bash
# Build the browser version into dist/.
#
#   ./build-web.sh          release build (what gets published)
#   ./build-web.sh --dev    faster compile, slower game
#
# Needs: rustup target add wasm32-unknown-unknown
#        cargo install wasm-bindgen-cli --version <the wasm-bindgen in Cargo.lock>
# Optional: wasm-opt (binaryen) on PATH shrinks the output further.
set -euo pipefail
cd "$(dirname "$0")"

profile=release
flag=--release
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

if [[ "$profile" == release ]] && command -v wasm-opt >/dev/null; then
  wasm-opt -Oz --enable-bulk-memory --enable-nontrapping-float-to-int \
    --enable-sign-ext --enable-mutable-globals --enable-reference-types \
    dist/wormsign_bg.wasm -o dist/wormsign_bg.wasm || echo "wasm-opt failed; keeping unoptimised wasm" >&2
fi

cp web/index.html dist/
ls -la dist
