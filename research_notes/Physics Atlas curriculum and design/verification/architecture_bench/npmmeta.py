import json, sys, urllib.request, datetime, os
outdir = sys.argv[1]
pkgs = sys.argv[2:]
cutoff = datetime.datetime(2026,10,13,tzinfo=datetime.timezone.utc)
def parse(t):
    return datetime.datetime.fromisoformat(t.replace('Z','+00:00'))
for p in pkgs:
    url = "https://registry.npmjs.org/" + p.replace('/','%2F')
    try:
        with urllib.request.urlopen(url, timeout=60) as r:
            d = json.load(r)
    except Exception as e:
        print(f"{p}: ERROR {e}"); continue
    tags = d.get('dist-tags',{})
    latest = tags.get('latest')
    times = d.get('time',{})
    v = d['versions'].get(latest,{})
    lic = v.get('license') or d.get('license')
    dist = v.get('dist',{})
    t = times.get(latest)
    # newest non-prerelease version older than cutoff
    stable = [(parse(times[k]),k) for k in d['versions'] if k in times and '-' not in k]
    stable.sort()
    older = [k for (tt,k) in stable if tt <= cutoff]
    last_old = older[-1] if older else None
    other_tags = {k:val for k,val in tags.items() if k!='latest'}
    print(f"{p}: latest={latest} ({t[:10] if t else '?'}) license={lic} unpacked={dist.get('unpackedSize')} files={dist.get('fileCount')} | newest-stable<=2026-10-13: {last_old} ({times.get(last_old,'')[:10]}) | other tags={json.dumps(other_tags)[:200]} | repo={(v.get('repository') or {}).get('url') if isinstance(v.get('repository'),dict) else v.get('repository')}")
    with open(os.path.join(outdir, p.replace('/','__')+'.json'),'w') as f:
        json.dump({'latest':latest,'tarball':dist.get('tarball'),'time':{k:times.get(k) for k in list(d['versions'])[-15:]}}, f)
