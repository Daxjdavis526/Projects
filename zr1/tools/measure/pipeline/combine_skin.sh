#!/bin/bash
# The body skin as built since 2026-10-12: the first model's clean loft
# warped onto the measured shape, then the measured cage refitted to it
# (no displacement layer), the regions re-traced and the splitter rebuilt.
#   ZR1_WORK=<work dir> PY=<python> combine_skin.sh <first-model loft .stl> <measured skin .ply>
# The loft is `zr1 preview`'s out/body_loft.stl at commit bede119; the
# measured skin is run_psfit.py's fit (ps_g.ply) and cn_d_r.pkl its cage.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
CRATE=$(cd "$HERE/../../.." && pwd)
cd "${ZR1_WORK:-.}"
PY=${PY:-python3}
$PY "$HERE/ffd_warp.py" "$1" "$2" 20 9 8 0.1 warped.ply 2>&1 | grep -v -i warn
$PY "$HERE/cage_smooth.py" cn_d_r.pkl "$2" 3 combined.ply combined.pkl warped.ply 2>&1 | grep -v -i warn
$PY "$HERE/../export_cage.py" combined.pkl "$CRATE/data/body_cage.json" 2>&1 | grep -v -i warn
(cd "$CRATE" && ./target/release/zr1 skin 3)
$PY -u "$HERE/run_regions2.py" combined.ply project 1025 165 2>&1 | grep -v -i warn | grep -v "dm2 c"
$PY "$HERE/splitter_skin.py" combined.ply 30 2>&1 | grep -v -i warn
$PY "$HERE/write_addons.py" splitter_skin
