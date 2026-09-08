#!/usr/bin/env python3
"""Download the combined nomenclature layer from NASA Trek (IAU Gazetteer of
Planetary Nomenclature names plus spacecraft landing/impact points) into a
compact moon/data/names.json used for map labels, "nearest named feature",
the searchable location database and the site picker.

Record format (array of arrays to keep the file small):
  [name, type, lat, lon, diameter_km, origin, link]
Coordinates are planetocentric, +East, -180..180 (ME frame, LOLA 2011 control
network per the USGS gazetteer).

Run:  python3 moon/tools/fetch_names.py
"""
import json, os, subprocess, time, urllib.parse

OUT = os.path.join(os.path.dirname(__file__), "..", "data", "names.json")
URL = "https://trek.nasa.gov/moon/trekarcgis/rest/services/CombinedNomenclature/MapServer/0/query"
FIELDS = "FEATURE,type,center_lat,center_lon,diameter,origin,link,Spacecraft,Date,Lat_Y,Lon_X"


def page(lo, hi):
    """The service has maxRecordCount 1000 and does NOT support pagination, so
    walk the FID range in blocks instead."""
    where = urllib.parse.quote(f"FID>={lo} AND FID<{hi}")
    q = f"{URL}?where={where}&outFields={FIELDS}&returnGeometry=false&f=json"
    for attempt in range(3):
        r = subprocess.run(["curl", "-sS", "-L", "--max-time", "120", q], capture_output=True, text=True)
        try:
            return json.loads(r.stdout)
        except json.JSONDecodeError:
            time.sleep(2)
    return {"features": []}


def clean(s):
    if s is None:
        return ""
    s = str(s).replace("á", " ").replace("?", " ")
    return " ".join(s.split())


def main():
    # total feature count, then walk FID blocks of 500 (< maxRecordCount 1000)
    r = subprocess.run(["curl", "-sS", "-L", "--max-time", "60",
                        f"{URL}?where=1%3D1&returnCountOnly=true&f=json"], capture_output=True, text=True)
    total = json.loads(r.stdout).get("count", 0)
    print(f"{total} features in CombinedNomenclature")
    recs, lo, block, seen = [], 0, 500, 0
    while lo < total + block * 4:
        j = page(lo, lo + block)
        feats = j.get("features", [])
        seen += len(feats)
        lo += block
        if seen >= total and not feats:
            break
        for f in feats:
            a = f["attributes"]
            name = clean(a.get("FEATURE")) or clean(a.get("Spacecraft"))
            typ = clean(a.get("type"))
            lat = a.get("center_lat") if a.get("center_lat") not in (None, 0) else a.get("Lat_Y")
            lon = a.get("center_lon") if a.get("center_lon") not in (None, 0) else a.get("Lon_X")
            if not name or lat is None or lon is None:
                continue
            origin = clean(a.get("origin"))
            date = clean(a.get("Date"))
            if date and not origin:
                origin = date
            if len(origin) > 160:
                origin = origin[:157] + "..."
            link = clean(a.get("link"))
            link = link.replace("http://planetarynames.wr.usgs.gov/Feature/", "F").replace("https://planetarynames.wr.usgs.gov/Feature/", "F")
            lon = float(lon)
            if lon > 180:
                lon -= 360
            recs.append([name, typ, round(float(lat), 5), round(lon, 5), round(float(a.get("diameter") or 0), 3), origin, link])
        print(f"FID < {lo}: {seen} rows, {len(recs)} kept", flush=True)
    recs.sort(key=lambda r: (-r[4], r[0]))
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as fp:
        json.dump({"source": "NASA Trek CombinedNomenclature (IAU Gazetteer of Planetary Nomenclature, USGS; spacecraft sites NSSDC)",
                   "coords": "planetocentric, +East, -180..180, ME frame",
                   "fields": ["name", "type", "lat", "lon", "diameter_km", "origin", "link"],
                   "features": recs}, fp, separators=(",", ":"), ensure_ascii=False)
    print(f"wrote {OUT}: {len(recs)} features, {os.path.getsize(OUT)/1e6:.2f} MB")


if __name__ == "__main__":
    main()
