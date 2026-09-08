#!/usr/bin/env python3
"""Build moon/data/streams.json: the registry of NASA Trek services the game
streams at runtime (all verified to send Access-Control-Allow-Origin: *).

Elevation comes from ArcGIS ImageServer `exportImage` (float32 GeoTIFF);
imagery from WMTS tiles; science layers from `identify`.  The registry stores,
for every elevation service, its lat/lon bounding box in degrees (taken from
the Trek product index, which is in degrees even when the service itself is
projected), the native pixel size in metres and the server it lives on.

Run:  python3 moon/tools/trek_registry.py
"""
import json, os, re, subprocess, sys

R_MOON = 1737400.0
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "streams.json")
SERVERS = ["trekarcgis", "trekarcgis2", "trekarcgis3"]


def get_json(url):
    r = subprocess.run(["curl", "-sS", "-L", "--max-time", "60", url], capture_output=True, text=True)
    return json.loads(r.stdout)


def norm(s):
    return re.sub(r"[^A-Za-z0-9]+", "_", s).strip("_").lower()


# Services that are not in the Trek DEM product index but were verified by hand.
EXTRA = [("trekarcgis", "LRO_LOLA_DEM_Global_256ppd_v06", "global", [-180, -90, 180, 90],
          "NASA Trek / LRO_LOLA_DEM_Global_256ppd_v06 (LOLA LDEM 256 ppd)")]

# Quality ranking used by the heightfield when several layers cover a point.
# Lower is better; LOLA and LROC NAC stereo beat Apollo-era metric camera DEMs.
def priority_of(name):
    n = name.lower()
    if "nac" in n or "sldem" in n or "kaguya" in n:
        return 0
    if "lola" in n:
        return 1
    if "metriccam" in n or "pancam" in n:
        return 3
    return 2


def main():
    # 1. all ImageServers per server
    services = {}
    for srv in SERVERS:
        j = get_json(f"https://trek.nasa.gov/moon/{srv}/rest/services?f=json")
        for s in j.get("services", []):
            if s.get("type") == "ImageServer":
                services[norm(s["name"])] = (srv, s["name"])
    # 2. DEM products from the product index (bbox in degrees)
    idx = get_json("https://trek.nasa.gov/moon/TrekServices/ws/index/eq/searchItems?proj=eq&start=0&rows=400&facetKeys=productCat2&facetValues=DEM")
    docs = idx.get("response", {}).get("docs", idx.get("docs", []))
    elevation = []
    for d in docs:
        label = d.get("productLabel") or ""
        key = norm(label)
        if key not in services:
            continue
        srv, name = services[key]
        bbox = d.get("bbox") or d.get("trekBbox")
        if not bbox:
            continue
        w, s, e, n = [float(x) for x in bbox.split(",")]
        try:
            meta = get_json(f"https://trek.nasa.gov/moon/{srv}/rest/services/{name}/ImageServer?f=json")
        except Exception:
            continue
        px = meta.get("pixelSizeX")
        if not px:
            continue
        sr = (meta.get("extent") or {}).get("spatialReference") or {}
        wkt = sr.get("wkt", "")
        geographic = sr.get("wkid") == 104903 or wkt.startswith("GEOGCS")
        res_m = px * (R_MOON * 3.141592653589793 / 180.0) if geographic else px
        kind = ("polar" if "Pole" in name else "global" if "Global" in name else "site")
        elevation.append({
            "id": name, "server": srv, "kind": kind, "bbox": [w, s, e, n],
            "res_m": round(res_m, 3), "pixelType": meta.get("pixelType"),
            "priority": priority_of(name), "source": "NASA Trek / " + label,
        })
        print(f"{name:50s} {srv:12s} {kind:6s} res {res_m:8.2f} m  bbox {w:.3f},{s:.3f},{e:.3f},{n:.3f}")
    for srv, name, kind, bbox, source in EXTRA:
        if any(x["id"] == name for x in elevation):
            continue
        meta = get_json(f"https://trek.nasa.gov/moon/{srv}/rest/services/{name}/ImageServer?f=json")
        px = meta.get("pixelSizeX")
        if not px:
            print(f"EXTRA {name}: unavailable, skipped")
            continue
        res_m = px * (R_MOON * 3.141592653589793 / 180.0)
        elevation.append({"id": name, "server": srv, "kind": kind, "bbox": bbox,
                          "res_m": round(res_m, 3), "pixelType": meta.get("pixelType"),
                          "priority": priority_of(name), "source": source})
        print(f"{name:50s} {srv:12s} {kind:6s} res {res_m:8.2f} m  (extra)")
    # prefer known-good global/polar ids first, then finest site DEMs
    order = {"global": 0, "polar": 1, "site": 2}
    elevation.sort(key=lambda x: (order[x["kind"]], x["priority"], x["res_m"]))
    registry = {
        "note": "Runtime streaming registry. All endpoints send Access-Control-Allow-Origin: *. Elevation via exportImage F32 GeoTIFF; imagery via WMTS; science via identify.",
        "imageServerUrl": "https://trek.nasa.gov/moon/{server}/rest/services/{id}/ImageServer",
        "wmtsUrl": "https://trek.nasa.gov/tiles/Moon/EQ/{id}/1.0.0/default/default028mm/{z}/{row}/{col}.{ext}",
        "elevation": elevation,
        "imagery": [
            {"id": "LRO_WAC_Mosaic_Global_303ppd_v02", "ext": "jpg", "maxLevel": 8, "bbox": [-180, -90, 180, 90],
             "res_m": 83.0, "source": "LROC WAC global mosaic (303 ppd), NASA Trek WMTS"},
            {"id": "apollo11_26cm_mosaic_byte_geo_1_2_highContrast", "ext": "png", "maxLevel": 15,
             "bbox": [23.4484963, 0.1464532, 23.5396925, 1.1149077], "res_m": 0.65,
             "source": "LROC NAC Apollo 11 site mosaic (26 cm/px source, high-contrast), NASA Trek WMTS"},
        ],
        "science": {
            "geology": {"server": "trekarcgis3", "map": "Unified_Global_Geologic_Map_of_the_Moon_Geologic_Units",
                        "fields": {"unit": "FIRST_Unit", "period": "FIRST_Un_1", "name": "FIRST_Un_2"},
                        "source": "USGS Unified Geologic Map of the Moon 1:5M (Fortezzo et al. 2020)"},
            "diviner": {"server": "trekarcgis2", "max": "diviner_tbol_max", "min": "diviner_tbol_min",
                        "noon": "diviner_tbol_hour12", "midnight": "diviner_tbol_hour00", "res_deg": 0.5,
                        "source": "LRO Diviner bolometric brightness temperature (Williams et al. 2017), 0.5 deg"},
            "minerals": {"server": "trekarcgis", "res_deg": 0.25,
                         "FeO": "Lunar_Kaguya_MIMap_MineralDeconv_FeOWeightPercent_50N50S",
                         "olivine": "Lunar_Kaguya_MIMap_MineralDeconv_OlivinePercent_50N50S",
                         "cpx": "Lunar_Kaguya_MIMap_MineralDeconv_ClinopyroxenePercent_50N50S",
                         "opx": "Lunar_Kaguya_MIMap_MineralDeconv_OrthopyroxenePercent_50N50S",
                         "plagioclase": "Lunar_Kaguya_MIMap_MineralDeconv_PlagioclasePercent_50N50S",
                         "omat": "Lunar_Kaguya_MIMap_MineralDeconv_OpticalMaturityIndex_50N50S",
                         "source": "Kaguya Multiband Imager mineral deconvolution maps (Lemelin et al.), 50N-50S"},
            "gravity": {"server": "trekarcgis2", "freeair": "gggrx_1200a_anom_l180_eq", "bouguer": "gggrx_1200a_boug_l180_eq",
                        "res_deg": 0.0625, "source": "GRAIL GRGM1200A free-air / Bouguer anomaly (mGal), degree 180"},
            "lolacount": {"server": "trekarcgis", "id": "LRO_LOLA_Count_Global_128ppd_v04",
                          "source": "LOLA observation count per 128 ppd pixel (0 = interpolated)"},
            "nomenclature": {"server": "trekarcgis", "map": "CombinedNomenclature", "layer": 0,
                             "source": "IAU Gazetteer of Planetary Nomenclature + spacecraft sites (Trek combined layer)"},
        },
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as fp:
        json.dump(registry, fp, indent=1)
    print(f"wrote {OUT}: {len(elevation)} elevation services")


if __name__ == "__main__":
    main()
