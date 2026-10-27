import os, sys, gzip, collections
root = sys.argv[1]; K = int(sys.argv[2]); filt = sys.argv[3] if len(sys.argv) > 3 else ''
EXT = ('.js','.mjs','.cjs','.css','.wasm','.zip','.woff2','.json','.tar','.py','.whl')
rows = []; woff = collections.Counter(); woffn = collections.Counter()
for dp, dn, fn in os.walk(root):
    for f in fn:
        p = os.path.join(dp, f); rel = os.path.relpath(p, root)
        if f.endswith(('.map','.d.ts','.d.mts','.d.cts')) or not f.endswith(EXT): continue
        if filt and filt not in rel: continue
        s = os.path.getsize(p)
        if f.endswith('.woff2'):
            woff[os.path.dirname(rel)] += s; woffn[os.path.dirname(rel)] += 1
        rows.append((s, rel, p))
rows.sort(reverse=True)
for s, rel, p in rows[:K]:
    with open(p,'rb') as fh: g = len(gzip.compress(fh.read(), 9))
    print(f"  {rel:70s} {s/1024:9.1f} KB  gz {g/1024:8.1f} KB")
for d,s in woff.most_common(4):
    print(f"  [woff2 total in {d}: {woffn[d]} files, {s/1024:.1f} KB]")
