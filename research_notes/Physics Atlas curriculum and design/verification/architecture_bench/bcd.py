import json, sys
def walk(node, path, want):
    for k, v in node.items():
        if k == '__compat':
            if any(w in path.lower() for w in want):
                s = v.get('support', {})
                def ver(b):
                    e = s.get(b); e = e[0] if isinstance(e, list) else e
                    if isinstance(e, str): return e
                    if not e: return '?'
                    va = e.get('version_added'); 
                    return f"{va}{' (flag)' if e.get('flags') else ''}{' (partial)' if e.get('partial_implementation') else ''}"
                print(f"{path}: chrome {ver('chrome')} | firefox {ver('firefox')} | safari {ver('safari')} | safari_ios {ver('safari_ios')}")
        elif isinstance(v, dict):
            walk(v, path + '.' + k if path else k, want)
for f, want in [('html_elements_script.json', ['importmap']), ('http_headers_Cross-Origin-Embedder-Policy.json', ['policy']), ('api_Worker.json', ['ecmascript_modules','worker.worker']), ('api_StorageManager.json', ['persist','estimate']), ('css_at-rules_media.json', ['prefers-reduced-motion']), ('javascript_builtins_SharedArrayBuffer.json', ['sharedarraybuffer.sharedarraybuffer'])]:
    try: walk(json.load(open(f)), '', want)
    except Exception as e: print(f, 'ERR', e)
