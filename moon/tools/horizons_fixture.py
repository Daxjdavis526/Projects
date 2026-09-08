#!/usr/bin/env python3
"""Generate ephemeris ground-truth fixtures from the JPL Horizons API.

For a grid of lunar surface sites and UTC epochs this asks Horizons for the
apparent azimuth/elevation of the Sun and the Earth as seen by an observer
standing on the Moon (Mean Earth/polar-axis body-fixed coordinates, airless),
the Earth's illuminated fraction and angular diameter, plus the sub-Earth and
sub-solar points of the Moon.  The result is committed as
moon/data/fixtures/horizons.json and moon/test/ephemeris.test.mjs compares the
in-browser ephemeris (Meeus/ELP truncated series + WGCCRE rotation) against it.

Horizons conventions worth remembering (from the API documentation):
  * SITE_COORD for a body-fixed observer is 'E-lon,lat,alt_km'.
  * For the Moon (like Earth and Sun) sub-observer / sub-solar longitudes are
    positive EAST.
  * APPARENT='AIRLESS' removes atmospheric refraction; the values still include
    light-time and stellar aberration (tens of arcseconds — far below the
    tolerances used by the tests).

Run:  python3 moon/tools/horizons_fixture.py
"""
import json, os, subprocess, sys, time, urllib.parse

API = "https://ssd.jpl.nasa.gov/api/horizons.api"
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "fixtures", "horizons.json")

SITES = {
    "tranquility": (0.67415, 23.47314),      # Apollo 11 LM (Wagner et al. 2012, ME frame)
    "taurus_littrow": (20.19108, 30.77220),  # Apollo 17 LM
    "shackleton_rim": (-89.67, 129.78),
    "north_pole": (89.90, 0.0),
    "change4": (-45.4446, 177.5991),         # far side
    "aristarchus": (23.73, -47.49),
    "tycho": (-43.30, -11.22),
    "copernicus": (9.62, -20.08),
    "orientale": (-19.87, -94.67),
    "tsiolkovskiy": (-20.38, 128.97),
}
EPOCHS = [
    "1969-07-20 20:17",   # Apollo 11 landing
    "1969-07-21 02:56",   # first step
    "1972-12-11 19:54",   # Apollo 17 landing
    "1990-05-05 05:05",
    "2000-01-01 12:00",
    "2013-12-14 13:11",   # Chang'e 3 landing
    "2024-01-19 15:20",   # SLIM landing
    "2026-09-08 00:00",
    "2026-09-22 12:00",
    "2027-03-15 06:00",
    "2030-06-30 18:00",
    "2045-01-01 00:00",
]


def horizons(params):
    q = urllib.parse.urlencode(params, quote_via=urllib.parse.quote)
    for attempt in range(4):
        r = subprocess.run(["curl", "-sS", "-L", "--max-time", "60", f"{API}?{q}"],
                           capture_output=True, text=True)
        if r.returncode == 0 and "$$SOE" in r.stdout:
            return r.stdout
        time.sleep(2 + 2 * attempt)
    raise RuntimeError("Horizons call failed: " + r.stdout[-500:] + r.stderr[-200:])


def rows(text):
    body = text.split("$$SOE")[1].split("$$EOE")[0].strip().splitlines()
    return [[c.strip() for c in line.split(",")] for line in body if line.strip()]


def header(text):
    # the CSV header is the last line before $$SOE that contains 'Date'
    pre = text.split("$$SOE")[0].splitlines()
    for line in reversed(pre):
        if "Date" in line and "," in line:
            return [c.strip() for c in line.split(",")]
    raise RuntimeError("no header")


def plus_one_minute(epoch):
    from datetime import datetime, timedelta
    t = datetime.strptime(epoch, "%Y-%m-%d %H:%M") + timedelta(minutes=1)
    return t.strftime("%Y-%m-%d %H:%M")


def observer_table(command, lat, lon, epoch):
    text = horizons({
        "format": "text", "COMMAND": f"'{command}'", "OBJ_DATA": "'NO'", "MAKE_EPHEM": "'YES'",
        "EPHEM_TYPE": "'OBSERVER'", "CENTER": "'coord@301'", "COORD_TYPE": "'GEODETIC'",
        "SITE_COORD": f"'{lon},{lat},0'", "START_TIME": f"'{epoch}'",
        "STOP_TIME": f"'{plus_one_minute(epoch)}'", "STEP_SIZE": "'1 m'",
        "QUANTITIES": "'4,10,13,20,24'", "APPARENT": "'AIRLESS'", "ANG_FORMAT": "'DEG'",
        "CSV_FORMAT": "'YES'", "TIME_DIGITS": "'MINUTES'",
    })
    h = header(text)
    r = rows(text)[0]
    d = dict(zip(h, r))
    def f(key_part):
        for k, v in d.items():
            if key_part in k:
                return float(v)
        raise KeyError(key_part + " in " + str(h))
    return {
        "az": f("Azi"), "el": f("Elev"), "illum": f("Illu"), "angdiam_arcsec": f("Ang-diam"),
        "range_km": f("delta"), "sto_deg": f("S-T-O"),
    }


def subpoints(epoch):
    text = horizons({
        "format": "text", "COMMAND": "'301'", "OBJ_DATA": "'NO'", "MAKE_EPHEM": "'YES'",
        "EPHEM_TYPE": "'OBSERVER'", "CENTER": "'500@399'", "START_TIME": f"'{epoch}'",
        "STOP_TIME": f"'{plus_one_minute(epoch)}'", "STEP_SIZE": "'1 m'",
        "QUANTITIES": "'14,15,20'", "ANG_FORMAT": "'DEG'", "CSV_FORMAT": "'YES'",
        "TIME_DIGITS": "'MINUTES'",
    })
    h = header(text)
    d = dict(zip(h, rows(text)[0]))
    def f(key_part):
        for k, v in d.items():
            if key_part in k:
                return float(v)
        raise KeyError(key_part + " in " + str(h))
    return {"subearth_lon": f("ObsSub-LON"), "subearth_lat": f("ObsSub-LAT"),
            "subsolar_lon": f("SunSub-LON"), "subsolar_lat": f("SunSub-LAT"),
            "range_km": f("delta")}


def main():
    fixture = {"generated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
               "source": "JPL Horizons API (ssd.jpl.nasa.gov/api/horizons.api), observer on Moon via CENTER=coord@301, APPARENT=AIRLESS",
               "sites": {k: {"lat": v[0], "lon": v[1]} for k, v in SITES.items()},
               "epochs": {}}
    n = 0
    for epoch in EPOCHS:
        e = {"subpoints": subpoints(epoch), "sites": {}}
        for name, (lat, lon) in SITES.items():
            e["sites"][name] = {"sun": observer_table("10", lat, lon, epoch),
                                "earth": observer_table("399", lat, lon, epoch)}
            n += 2
            print(f"{epoch} {name:15s} sun az/el {e['sites'][name]['sun']['az']:7.2f}/{e['sites'][name]['sun']['el']:6.2f}  earth az/el {e['sites'][name]['earth']['az']:7.2f}/{e['sites'][name]['earth']['el']:6.2f}", flush=True)
            time.sleep(0.15)
        fixture["epochs"][epoch] = e
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as fp:
        json.dump(fixture, fp, indent=1)
    print(f"wrote {OUT} ({n} observer tables)")


if __name__ == "__main__":
    main()
