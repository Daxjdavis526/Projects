# SELENE — data sources

Every number, pixel and colour in SELENE comes from somewhere. This document
says exactly where, at what resolution, in which reference frame, and what it
is allowed to control. The rule the whole project is built on:

> **Real lunar geography is never altered to look better.** Procedural
> generation only adds detail *below* the resolution of the measured data that
> covers a point, and only in a physically plausible way.

The game labels every value it shows you:

| label | meaning |
|---|---|
| **MEASURED** | a measurement exists at (or essentially at) this point |
| **DERIVED** | computed from measurements (slope from a DEM, temperature vs local time) |
| **INTERPOLATED** | the source dataset filled this pixel between real measurements |
| **REGIONAL** | a real measurement, but of a much larger area than the point you are standing on |
| **PROCEDURAL** | synthesised below the source resolution — plausible, not real |
| **FICTIONAL** | the ship, the rover, the jetpack, the landing pad |

Press `V` in game for the SCIENCE overlay, which prints these live for the
ground under your feet.

## Reference frame and datum (all data normalised to this)

| item | value | source |
|---|---|---|
| Frame | Mean Earth / Polar Axis (**ME**) of DE421, planetocentric latitude, longitude positive east | LRO Project & LGCWG, *A Standardized Lunar Coordinate System for LRO*, Ver. 5, 2008 |
| Reference sphere | **1 737 400 m** (heights are radius − 1737.4 km) | LOLA GDR labels (`A_AXIS_RADIUS = 1737.4 <km>`) |
| ME vs Principal Axis (PA) | fixed rotation of 67.92″, 78.56″, 0.30″ about axes 3, 2, 1 → 0.0288473° ≈ **875 m** at the surface | NAIF `moon_080317.tf`; DE440's realisation (`moon_de440_250416.tf`) agrees with DE421 ME to ≈ 0.53 m over 2000–2040 |
| GM | 4902.80011526323 km³/s² | GRAIL GRGM1200A label |
| Surface gravity | ≈ 1.62 m/s² (game computes GM/r² radially) | derived |

Everything below is stored, sampled and displayed in that frame. Pre-LRO
coordinates (Clementine/ULCN2005 era) are never mixed in: they can differ from
LOLA-tied positions by a kilometre or more.

## Topography

| dataset | source | resolution | coverage | access | controls | limitations |
|---|---|---|---|---|---|---|
| **LOLA LDEM 16 ppd** | PDS Geosciences `lrolol_1xxx/data/lola_gdr/cylindrical/img/ldem_16.img` (V3.1, 2019) | 16 px/deg ≈ **1.9 km/px**, 0.5 m vertical quantum | global | **vendored** as a 16-bit PNG pyramid in `data/dem/lola16/` (≈ 18 MB) | the shape of the whole Moon: maria, basins, big craters, the globe you see from orbit and the terrain wherever nothing finer has loaded | inter-track gaps are GMT-`surface` interpolated with no missing-data flag; built in 45° latitude bands with possible edge artifacts |
| **LOLA LDEC 16 ppd counts** | same directory, `ldec_16.img` | 16 px/deg | global | **vendored** as a 1-bit mask, `data/dem/ldec16.png` | drives the MEASURED vs INTERPOLATED label in the overlay | count is per 1.9 km pixel; a "measured" pixel still contains unmeasured ground |
| **LOLA LDEM 256 ppd** | NASA Trek ImageServer `LRO_LOLA_DEM_Global_256ppd_v06` | 256 px/deg ≈ **118 m/px** | global | **streamed** (`exportImage`, float32 GeoTIFF, CORS `*`) | regional relief: crater walls, ridges, rilles, the terrain you actually drive over | same interpolation caveat as above; needs network |
| **LOLA polar DEMs** | Trek `LRO_LOLA_DEM_{S,N}Pole875_5mp_v04_EQ` (5 m), `…Pole75_30mp_v04_EQ` (30 m), `…Pole45_100mp_v04_EQ` (100 m) | 5 / 30 / 100 m/px | \|lat\| > 87.5° / 75° / 45° | **streamed** | polar terrain: Shackleton, the ridge, permanently shadowed floors | polar stereographic products resampled to lat/lon by the service; sparse coverage inside PSRs |

> **A defect worth knowing about.** Five of the six LOLA polar services hand
> back the raw stored counts rather than metres: the PDS product's
> `SCALING_FACTOR` of 0.5 m per count is never applied by the service. Measured
> against `LRO_LOLA_DEM_Global_256ppd_v06` over thousands of pixels at both
> poles, the ratio is 2.000. Without correcting it Shackleton's rim reads
> −5489 m instead of −2745 m, which is two and a half kilometres of error in
> exactly the region the product exists to improve. `data/streams.json` carries
> the factor and the measurement that established it, and
> `test/streams.test.mjs` checks that it is still there. The one exception is
> `LRO_LOLA_DEM_SPole75_30mp_v04_EQ`, which is already in metres.

| **LROC NAC DTM, Apollo 11** | PDS `NAC_DTM_APOLLO11.TIF` (v1.9, 2 m/px, LOLA RMS 1.81 m) | **2 m/px** | 0.3146–1.2365°N, 23.3723–23.5115°E | **vendored** window ±~2.5 km around the LM (`data/dem/apollo11_nac2m.png`) | the actual ground Armstrong and Aldrin walked on | stereo DTM; smooth below ~6 m; shadowed areas interpolated |
| **SLDEM2015** | PDS `sldem2015_512_00n_30n_000_045_float.img` (LOLA + Kaguya TC) | 512 ppd ≈ **59 m/px**, ~3–4 m vertical | ±60° lat (window vendored around Apollo 11) | **vendored** window; global version is 22.6 GB (streamable by range, v2) | mid-scale relief at Tranquility | ~1 % of source tiles are LOLA-only interpolation; seams remain, worst in South Pole–Aitken and western Orientale |
| **LROC NAC DTM sites** | Trek `NAC_DTM_APOLLO17`, ~50 `LRO_NAC_DEM_*` services | 1.5–5 m/px | ~50 patches (Apollo 17, Artemis candidate sites, SLIM, IM-1, …) | **streamed** where you happen to be | metre-scale real terrain at the places that have it | patchy; a missing tile means no coverage, not zero elevation |

Below the finest available raster the game adds **PROCEDURAL** micro-relief:
band-limited fractal roughness, a crater population following the observed
equilibrium size–frequency distribution (cumulative slope ≈ −1.83, Hartmann &
Gaskell), rims at ~0.04 D, ejecta falling off as r⁻³, and scattered rocks. It
is switched on only for wavelengths shorter than the source pixel, so it can
never move, erase or invent a real crater.

## Imagery and colour

| dataset | source | resolution | coverage | access | controls |
|---|---|---|---|---|---|
| **LROC WAC colour** | NASA SVS CGI Moon Kit `lroc_color_poles_8k.tif` | 8192×4096 ≈ 1.3 km/px | global | **vendored** JPEG (8k/4k/1k tiers) | base albedo everywhere: maria dark, highlands bright, Tycho's rays |
| **LROC WAC 303 ppd mosaic** | Trek WMTS `LRO_WAC_Mosaic_Global_303ppd_v02`, levels 0–8 | ~83 m/px at level 8 | global | **streamed** (CORS `*`) | ground-level albedo: real ejecta patterns, crater rays, dark mantle |
| **LROC NAC Apollo 11 mosaic** | Trek WMTS `apollo11_26cm_mosaic_byte_geo_1_2_highContrast`, levels 0–15 | **~0.65 m/px** | 23.4485–23.5397°E, 0.1465–1.1149°N | **streamed** | the Tranquility Base site as photographed from orbit — the descent stage's shadow, the darkened paths to the experiments and to Little West crater |

## Science layers (scanner, map overlays, SCIENCE panel)

| dataset | source | resolution | access | controls | label |
|---|---|---|---|---|---|
| **USGS Unified Geologic Map of the Moon** (Fortezzo, Spudis & Harrel 2020, 1:5 M) | Trek MapServer `Unified_Global_Geologic_Map_of_the_Moon_Geologic_Units` + vendored 4 ppd raster | 1:5 M vector | **streamed** `identify`, vendored fallback | geologic unit, period and name under you (Tranquility Base = `Im2`, Upper Mare Unit, Imbrian); tints regolith colour and roughness | REGIONAL |
| **Diviner bolometric temperature** (Williams et al. 2017) | Trek `diviner_tbol_max`, `_min`, `_hour12`, `_hour00` | 0.5° ≈ 15 km | **vendored** as four global rasters (1.1 MB), `data/temp/`; also streamed for a point query | surface temperature by location and local time (Tranquility: 395.6 K max, 95.2 K min, and 306 K at 02:56 UTC on 21 July 1969) | REGIONAL. What happens between noon and midnight is DERIVED: in sunlight the surface sits near radiative equilibrium so temperature follows the fourth root of the cosine of the solar incidence; at night it cools fast then slowly, with dusk about thirty kelvin above dawn. See `src/data/temperature.js` and its test. Half a degree is fifteen kilometres, so the shadowed side of the boulder next to you is far colder than this says. |
| **Kaguya Multiband Imager mineral maps** | Trek `Lunar_Kaguya_MIMap_MineralDeconv_*` | 0.25° ≈ 7.6 km, 50°N–50°S | **streamed** | FeO wt %, olivine, pyroxenes, plagioclase, optical maturity in the scanner | REGIONAL |
| **GRAIL GRGM1200A free-air / Bouguer anomaly** | Trek `gggrx_1200a_anom_l180_eq`, `_boug_l180_eq`; PDS `gggrx_1200a_anom_l180.img` | 16 ppd, degree 180 | **streamed** + vendored 4 ppd | local gravity anomaly readout (mascons reach ~+0.5 % of g — real, and far too small to feel) | MEASURED (regional) |
| **LOLA observation count** | Trek `LRO_LOLA_Count_Global_128ppd_v04` | 128 ppd | **streamed** | whether the elevation under you was measured or interpolated | — |
| **IAU nomenclature + spacecraft sites** | Trek `CombinedNomenclature` (IAU Gazetteer, USGS; spacecraft from NSSDC) | 9130 features | **vendored** `data/names.json` | map labels, nearest-feature readout, searchable location database | MEASURED |

## Sky

| dataset | source | access | controls |
|---|---|---|---|
| **JPL Horizons** | `ssd.jpl.nasa.gov/api/horizons.api`, observer on the Moon | **vendored fixtures** (`data/fixtures/horizons.json`) | ground truth the in-game ephemeris is tested against, at 10 sites × 12 epochs |
| **Ephemeris** | Meeus/ELP-2000-82 truncated lunar series, abridged VSOP87 solar series, IAU/WGCCRE 2009 lunar rotation (α₀, δ₀, W with E₁–E₁₃) | computed in game | Sun and Earth direction, Earth phase, illumination and orientation, sub-solar and sub-Earth points, star field rotation |
| **Yale Bright Star Catalogue (BSC5)** | `tdc-www.harvard.edu/catalogs/bsc5.dat.gz` | **vendored** `data/stars.bin` | the real sky: ~9000 stars at their real positions and magnitudes, with B−V colour |
| **Blue Marble / city lights / clouds** | NASA Earth Observatory | **vendored** | Earth's day side, night side and cloud deck, oriented by real rotation so the correct continents face you |

## What is fiction

The spacecraft, the rover, the jetpack, the suit's exact consumable
capacities and the flattened landing pad under the ship. All of them are
labelled FICTIONAL in the SCIENCE overlay. Nothing about the Moon is changed
to accommodate them.

## Deliberately not used (candidates for later)

- **Trek's WMTS "DEM" layers** — they are shaded 8-bit renders, not elevation.
- **Mini-RF CPR, Moon Mineralogy Mapper, Clementine UVVIS, LAMP** — nothing in
  the current game depends on them; adding them would be more overlay than
  experience.
- **SLDEM2015 global** (22.6 GB) — the USGS BigTIFF is uncompressed, one row
  per strip, on an S3 bucket that sends CORS `*` and supports range requests,
  so streaming 59 m/px elevation directly into the browser is possible. It is
  on the roadmap, not in v1.
- **LROC WAC Hapke parameter maps** (Sato et al. 2014) — the renderer uses
  fixed Hapke-like parameters labelled ESTIMATED rather than per-pixel maps.
- **Apollo metric-camera DEM mosaics** (`Apollo17_MetricCam_DEM_Global_1024ppd`,
  `ApolloZone_MetricCam_DEM_Global_1024ppd`) — these advertise 29.6 m/px over
  most of the near-equatorial Moon, but only hold the ground actually
  photographed from orbit, so the box is far larger than the measurements. The
  streamer ranks services by how much of their box they really cover before it
  ranks them by resolution, which puts these last; they are still requested
  where nothing better exists, and an answer that is mostly empty is discarded
  rather than interpolated into terrain.

## Accuracy honesty

The game never claims more than the data supports. Standing at Tranquility
Base you are within a few metres of where *Eagle* actually is, on 2 m/px
stereo topography, under 0.65 m/px orbital imagery — and the pebble by your
boot is invented. The overlay will tell you which is which.
