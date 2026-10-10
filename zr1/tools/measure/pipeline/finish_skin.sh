#!/bin/bash
# The last steps after a skin fit (run_psfit.py): write the cage and its
# displacement to data/body_cage.json, gate the skin in the Rust crate,
# re-trace the material regions on it and rebuild the splitter outline.
#   ZR1_WORK=<work dir> PY=<python> finish_skin.sh <fit name, e.g. ps_g>
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
CRATE=$(cd "$HERE/../../.." && pwd)
cd "${ZR1_WORK:-.}"
S=$1
${PY:-python3} "$HERE/../export_cage.py" cn_d_r.pkl "$CRATE/data/body_cage.json" --detail $S.ply 2>&1 | grep -v -i warn
(cd "$CRATE" && ./target/release/zr1 skin 3)
${PY:-python3} -u "$HERE/run_regions2.py" $S.ply project 1025 165 2>&1 | grep -v -i warn | grep -v "dm2 c"
${PY:-python3} "$HERE/splitter_skin.py" $S.ply 30 2>&1 | grep -v -i warn
${PY:-python3} "$HERE/write_addons.py" splitter_skin
