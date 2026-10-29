import json, sys, urllib.request
for p in sys.argv[1:]:
    with urllib.request.urlopen("https://registry.npmjs.org/"+p.replace('/','%2F'), timeout=60) as r:
        d = json.load(r)
    t = d['time']
    vs = sorted([(t[k],k) for k in d['versions'] if k in t])
    print(p, "->", ", ".join(f"{k}@{tt[:10]}" for tt,k in vs[-12:]))
