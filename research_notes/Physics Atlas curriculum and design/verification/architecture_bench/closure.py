import os, re, sys, gzip
entry = sys.argv[1]; seen = {}; bare = set()
pat = re.compile(rb'''(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"']+)["']''')
def visit(p):
    p = os.path.normpath(p)
    if p in seen or not os.path.exists(p): return
    data = open(p, 'rb').read(); seen[p] = (len(data), len(gzip.compress(data, 9)))
    for m in pat.finditer(data):
        s = m.group(1).decode()
        if s.startswith('.'): visit(os.path.join(os.path.dirname(p), s))
        elif not s.startswith(('http', 'data:')) and len(s) < 80: bare.add(s)
visit(entry)
raw = sum(v[0] for v in seen.values()); gz = sum(v[1] for v in seen.values())
print(f"{entry.split('dl/')[1]}: {len(seen)} files, {raw/1e6:.2f} MB raw, {gz/1e6:.2f} MB gzip; bare specifiers: {sorted(bare)[:8]}")
