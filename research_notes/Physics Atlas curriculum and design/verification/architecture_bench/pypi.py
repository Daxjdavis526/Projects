import json, sys, urllib.request
for spec in sys.argv[1:]:
    name, ver = spec.split('==')
    try:
        d = json.load(urllib.request.urlopen(f"https://pypi.org/pypi/{name}/{ver}/json", timeout=60))
    except Exception as e:
        print(spec, 'ERR', e); continue
    files = d['urls']
    wasm = [f for f in files if any(k in f['filename'] for k in ('pyodide','emscripten','wasm32'))]
    pure = [f for f in files if f['filename'].endswith('none-any.whl')]
    lic = d['info'].get('license_expression') or (d['info'].get('license') or '')[:40]
    out = [f"{f['filename']} {f['size']/1e6:.2f}MB" for f in (wasm or pure)[:3]]
    print(f"{spec} [{lic}] -> {'; '.join(out) if out else 'no wasm/pure wheel on PyPI'}")
