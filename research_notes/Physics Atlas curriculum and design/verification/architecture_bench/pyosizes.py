import json, sys, urllib.request
lock = json.load(open(sys.argv[1])); base = sys.argv[2]
P = lock['packages']
def closure(names):
    seen = []; stack = list(names)
    while stack:
        n = stack.pop()
        if n in seen: continue
        seen.append(n); stack += P[n]['depends']
    return seen
cache = {}
def size(n):
    if n in cache: return cache[n]
    req = urllib.request.Request(base + P[n]['file_name'], method='HEAD')
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            cache[n] = int(r.headers.get('Content-Length', -1))
    except Exception as e:
        cache[n] = -1; print('ERR', n, e)
    return cache[n]
for group in (['numpy'], ['scipy'], ['matplotlib'], ['sympy'], ['numpy','scipy','matplotlib','sympy']):
    c = closure(group); tot = sum(size(n) for n in c)
    print(f"{'+'.join(group)}: {len(c)} pkgs, {tot/1e6:.2f} MB  -> " + ", ".join(f"{n} {P[n]['version']} ({size(n)/1e6:.2f} MB)" for n in c))
