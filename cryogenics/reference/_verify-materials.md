# Cryogenic materials behaviour — verified reference

Working verification file for the propulsion safety course. Every number here is
traced to a named source with a working URL. Confidence is labelled per row:

| Label | Meaning |
|---|---|
| **A** | Primary authoritative source, value read directly, **and** independently corroborated by a second primary source |
| **B** | Authoritative source but only one chain of evidence, or a value derived/interpolated here from authoritative inputs |
| **C** | Secondary, vendor, or otherwise uncorroborated — usable for narrative, not for design |

Nothing in this file is estimated from memory. Where a number could not be
sourced it appears in the [Could not confirm](#could-not-confirm) list at the end
rather than being filled in.

---

## 1. Thermal contraction data

### 1.1 How the number is defined

Cryogenic engineers do not use the room-temperature coefficient α. They use the
**integrated linear thermal contraction** between the assembly temperature and
the operating temperature, expressed as a percentage:

$$\frac{\Delta L}{L} = \frac{L_{293\,\mathrm{K}} - L_T}{L_{293\,\mathrm{K}}}$$

NIST states this explicitly: *"Most of the literature reports the integrated
linear thermal expansion as a percent change in length from some original length
generally measured at 293 K."*
— Marquardt, Le & Radebaugh, *Cryogenic Material Properties Database*, NIST,
[trc.nist.gov/cryogenics/Papers/Material_Properties/2000-Cryogenic_Material_Properties_Database.pdf](https://trc.nist.gov/cryogenics/Papers/Material_Properties/2000-Cryogenic_Material_Properties_Database.pdf)
(confidence **A**)

Ekin uses the identical definition, ΔL/L ≡ (L₍₂₉₃K₎ − L_T)/L₍₂₉₃K₎, in Appendix A6.4.
— J. W. Ekin, *Experimental Techniques for Low-Temperature Measurements*, Oxford
University Press (2006/2007/2011), appendix data tables published free by the
author at
[researchmeasurements.com/figures/ExpTechLTMeas_Apdx_English.pdf](https://www.researchmeasurements.com/figures/ExpTechLTMeas_Apdx_English.pdf)
(confidence **A**)

Throughout this file **positive = contraction**.

### 1.2 Two independent chains, cross-checked

Two independent sources were used and they agree to within ~0.5% relative:

**Chain 1 — NIST curve fits.** The NIST cryogenic material properties database
publishes, per material, a polynomial fit

```
y = a + bT + cT² + dT³ + eT⁴      for T > T_low
y = f                             for T < T_low
y  in units of  [(L − L₂₉₃)/L₂₉₃] × 10⁵
```

Index: [trc.nist.gov/cryogenics/materials/materialproperties.htm](https://trc.nist.gov/cryogenics/materials/materialproperties.htm)

The fits were evaluated at 77 K and 20 K for this file. **Validation:** the same
fits were also evaluated at 80 K and compared against NIST's *own* tabulated
values published in Bradley & Radebaugh, *Properties of Selected Materials at
Cryogenic Temperatures*, NIST
([tsapps.nist.gov/publication/get_pdf.cfm?pub_id=913059](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=913059)).
Every material matched to the last published digit:

| Material | computed @ 80 K | NIST published @ 80 K |
|---|---|---|
| SS 304 | −277.8 | −277.7 |
| Al 6061/5083 | −386.2 | −386.1 |
| G-10CR normal | −637.3 | −637.2 |
| G-10CR warp | −212.4 | −212.4 |
| Inconel 718 | −222.1 | −222.1 |
| Ti-6Al-4V | −161.1 | −161.1 |
| Teflon (PTFE) | −1930.6 | −1930 |

(units 10⁻⁵; the fit evaluation is therefore correct)

**Chain 2 — Ekin Appendix A6.4/A7.4**, which tabulates ΔL/L directly in percent
at 4, 40, 77, 100, 150, 200 and 250 K, sourced from Corruccini & Gniewek
(NBS Monograph 29), A. F. Clark (*Materials at Low Temperatures*, ASM 1983) and
the NIST database.

The two chains were built from partly different underlying measurements and land
in the same place at 77 K (SS 304: 0.280 vs 0.281; Al 6061: 0.389 vs 0.389;
PTFE: 1.944 vs 1.941; G-10 normal: 0.642 vs 0.642; Ti-6Al-4V: 0.162 vs 0.163).

### 1.3 The table

**ΔL/L from 293 K, in percent. Positive = contraction. Sortable by the 77 K column.**

| Material | ΔL/L → 77 K [%] | ΔL/L → 20 K [%] | Primary source | Conf |
|---|---:|---:|---|:--:|
| Invar 36 (Fe-36Ni) | **0.040** | **0.040** | NIST fit (a=−5.265E1…, T_low=80 K, f=−40); Ekin A6.4 gives 0.038 @77 K | A |
| Borosilicate glass (Pyrex) | **0.054** | ≈0.055 † | Ekin A6.4 (4 K 0.055, 40 K 0.057, 77 K 0.054) | B |
| Ti-6Al-4V | **0.162** | **0.174** | NIST fit; Ekin A6.4 0.163 @77 K, 0.173 @4 K | A |
| Fe-9Ni steel (A553 Type I) | **0.188** | ≈0.194 † | Ekin A6.4 (4 K 0.195, 40 K 0.193) | B |
| Iron / plain carbon steel | **0.190** | ≈0.197 † | Ekin A6.4 row "Fe" (4 K 0.198, 40 K 0.197). See caveat 1.5 | B |
| G-10CR, warp (in-plane, ∥ fibres) | **0.214** | **0.242** | NIST fit; Ekin A6.4 0.213 @77 K | A |
| Inconel 718 | **0.224** | **0.239** | NIST fit; Ekin A6.4 0.224 @77 K | A |
| SS 304 / 304L / 310 / 316 | **0.280** | **0.300** | NIST fit (one fit covers all four); Ekin A6.4 304 = 0.281, 316 = 0.279 @77 K | A |
| Beryllium copper (Cu-2%Be) | **0.296** | **0.317** | NIST fit; Ekin A6.4 0.298 @77 K | A |
| Copper, OFHC | **0.302** | ≈0.323 † | Ekin A6.4 & A7.4 (4 K 0.324, 40 K 0.322). NIST publishes only CTE for Cu, not integrated ΔL/L | A |
| Brass (65Cu-35Zn, yellow) | **0.353** | ≈0.382 † | Ekin A6.4 (4 K 0.384, 40 K 0.380). NIST has no brass expansion data | B |
| Aluminium 6061-T6 | **0.389** | **0.415** | NIST fit; Ekin A6.4 0.389 @77 K, 0.414 @4 K | A |
| Aluminium 5083-O | **0.389** | **0.415** | NIST fit — *identical fit to 6061*, see caveat 1.5 | B |
| Stycast 2850 FT (filled epoxy) | **0.40** | **0.441** | NIST tabulated values (−40.08 @80 K, −44.11 @20 K); Ekin A6.4 0.40 @77 K | A |
| Polyimide (Kapton) | **0.43** | ≈0.44 † | Ekin A6.4 (4 K 0.44, 40 K 0.44) | B |
| G-10CR, normal (through-thickness) | **0.642** | **0.708** | NIST fit; Ekin A6.4 0.642 @77 K | A |
| PVC | **0.825** | **0.987** | NIST fit (eq. range 4–280 K) | B |
| **PCTFE (Kel-F)** | **0.971** | ≈1.10 † | Ekin A6.4 row "CTFE (Teflon)" (4 K 1.135, 40 K 1.070) | B |
| Epoxy, unfilled | **1.028** | ≈1.13 † | Ekin A6.4 (4 K 1.16, 40 K 1.11) | B |
| PMMA (Plexiglas/acrylic) | **1.059** | ≈1.18 † | Ekin A6.4 (4 K 1.22, 40 K 1.16) | B |
| Polyamide (Nylon) | **1.256** | **1.381** | NIST fit; Ekin A6.4 1.256 @77 K | A |
| Polystyrene foam (51.4 kg/m³) | **1.419** | **1.685** | NIST fit — density-specific, see caveat 1.5 | B |
| **PTFE (Teflon, TFE)** | **1.944** | **2.119** | NIST fit; Ekin A6.4 1.941 @77 K, 2.14 @4 K, 2.06 @40 K | A |

† **20 K values marked "≈"** are not published at 20 K by the source. They are
bracketed here by that source's own 4 K and 40 K values, which differ by ≤0.05
percentage points because contraction is essentially complete below ~40 K
(α → 0 as T³). These are interpolations made in this file, not published numbers.
The un-marked 20 K values are direct evaluations of the NIST fits.

### 1.4 The PTFE teaching point — verified

The claim "PTFE contracts several times more than metals" is **correct, and the
factor is about 7 against stainless steel**:

| Comparison at 77 K | Ratio |
|---|---:|
| PTFE / SS 304 | 1.944 / 0.280 = **6.9×** |
| PTFE / Cu OFHC | 1.944 / 0.302 = **6.4×** |
| PTFE / Al 6061 | 1.944 / 0.389 = **5.0×** |
| PTFE / Invar 36 | 1.944 / 0.040 = **48.6×** |

PTFE's room-temperature coefficient of linear expansion is 250 × 10⁻⁶ K⁻¹
(Ekin A6.4) against 15.1 × 10⁻⁶ K⁻¹ for SS 304 — a factor of ~17 at room
temperature, which narrows to ~7 on the integrated basis because PTFE's
coefficient falls faster on cooling. **This is why the integrated form is the
one that matters: using α₂₉₃ alone overstates PTFE's differential by more than
2×.** Confidence **A**.

### 1.5 Caveats that must be carried into teaching

1. **NIST uses one fit for all austenitic stainless grades.** 304, 304L, 310 and
   316 share identical expansion coefficients in the NIST database and identical
   tabulated values in Bradley & Radebaugh. Ekin separates them slightly
   (0.281 / 0.279 at 77 K for 304 / 316) — a 0.7% relative difference, well
   inside NIST's stated 5% curve-fit error for this property. **Do not teach a
   meaningful contraction difference between 304 and 316.**
2. **NIST likewise uses one fit for 3003, 5083 and 6061 aluminium.** The 5083
   value in the table above is therefore not independent of 6061. Ekin gives
   6061-T6 = 0.389 @77 K and pure Al = 0.393 @77 K; the alloy spread is small.
3. **NIST's stated curve-fit error** (% relative to experimental data) for linear
   expansion: SS 304/316 **5%**, Al alloys **4%**, Invar **5%**, PTFE **2%**,
   Ti-6Al-4V **1.5%**, G-10CR normal **1.5%** / warp **2%**, Inconel 718 **1.1%**,
   BeCu **1.5%**, Nylon **1%**, PVC **1%**. Underlying experimental uncertainty is
   typically a further 2–5% (Bradley & Radebaugh).
4. **G-10 is strongly anisotropic**: 0.642% normal vs 0.214% warp at 77 K — a
   factor of 3 depending on which way the laminate is loaded. Always state the
   direction.
5. **Polystyrene value is for one foam density** (51.4 kg/m³). NIST publishes four
   different density fits with materially different values.
6. **Borosilicate is non-monotonic** below ~40 K in Ekin's table (0.055 @4 K,
   0.057 @40 K, 0.054 @77 K). This is a real low-temperature anomaly in silicate
   glasses (fused silica actually shows *negative* ΔL/L: −0.008% @4 K in the same
   table), not a transcription error.
7. **Provenance of the NIST fits** (from
   [trc.nist.gov/cryogenics/materials/references.htm](https://trc.nist.gov/cryogenics/materials/references.htm)):
   SS 304 expansion ← NBS Monograph 29 + *LNG Materials and Fluids* (Mann, ed.,
   NBS 1977); Teflon expansion ← NBS Monograph 29; Ti-6Al-4V ← Touloukian TPRC
   Vol. 12 (1970); Invar and G-10 ← *LNG Materials and Fluids*. So NIST and Ekin
   are **not fully independent** — both draw partly on Monograph 29. The
   agreement confirms correct evaluation and transcription; it is not two
   independent measurement campaigns.

---

## 2. What that means numerically — worked examples

All arithmetic in this section was executed and checked; see
[Worked examples verified](#worked-examples-verified) for the full working.
Values used: SS 304 0.280%, Al 6061 0.389%, Cu 0.302%, PTFE 1.944%,
Invar 0.040% (all 293 K → 77 K).

**A. A 3 m stainless run cooled to LN₂.**
3000 mm × 0.00280 = **8.4 mm shorter**. To 20 K it is 9.0 mm.
Note that 93% of the total contraction to 20 K has already happened by 77 K.

**B. A 10 m line.**
SS 304 → **28.0 mm**. Al 6061 → **38.9 mm**. Cu → 30.2 mm. Invar 36 → 4.0 mm.
An aluminium line and a stainless line of the same 10 m length, rigidly tied at
both ends, fight over **10.9 mm**. That is the number that sizes an expansion
loop or a bellows.

**C. A PTFE seal in a stainless gland.** Direction of the fit decides whether it
survives.
- *PTFE ring, 50.00 mm OD, in a 50.00 mm SS 304 bore* (seal must push outward):
  PTFE OD → 49.028 mm, bore → 49.860 mm. **Diametral gap 0.832 mm**
  (0.416 mm radial). The seal has walked away from the wall — it leaks.
- *Same ring, 50.00 mm ID, on a 50.00 mm SS 304 shaft* (seal grips inward):
  the same 0.832 mm becomes **interference**, and the seal grips harder.
- *Axial squeeze, 3.53 mm PTFE cord in a 2.90 mm deep SS gland*: squeeze falls
  from 0.630 mm to 0.570 mm, losing only **9.6%**, because the gland depth
  shrinks too and partly follows the seal.

The lesson is not "PTFE always loses squeeze" — it is that the differential is
1.66% of whatever dimension has to be spanned, and you must ask *which
dimension, and in which direction*.

**D. An aluminium flange bolted with stainless bolts.**
Al 6061 clamped stack, 40 mm grip, M10 SS 304 bolts (Aₛ = 58.0 mm²,
E = 200 GPa), preloaded to 20 kN.
- Bolt elastic stretch at preload: 20 000 / (58.0 × 200 000 / 40) = **0.0690 mm**
- Aluminium stack contracts 40 × 0.00389 = 0.1556 mm
- Steel bolt contracts 40 × 0.00280 = 0.1120 mm
- **Differential 0.0436 mm — 63% of the bolt's entire elastic stretch**

The members shrink *more* than the bolt, so the bolt unloads. Taking member
stiffness k_m = 4 k_b, preload loss ΔF = 0.0436 × k_b k_m/(k_b+k_m) =
**10.1 kN, i.e. about 51% of the preload gone**. (Range 47–53% for
k_m = 3–5 k_b.)

*Caveats on D, stated because they matter:* this is a first-order estimate. It
ignores that E of 304 rises ~7% between 293 K and 77 K (200 → 214 GPa, Ekin
A6.10), ignores the temperature dependence of member stiffness, ignores gasket
creep and embedment, and assumes the whole joint reaches 77 K uniformly. It is
the right order of magnitude and the right sign, not a design calculation.
Same-material bolting (SS bolts in an SS flange) gives zero differential and no
thermal preload loss — that is the design fix.

---

## 3. Ductile-to-brittle transition

### 3.1 The crystallographic statement

The cleanest citable statement is from the CERN Accelerator School:

> "Materials with a face-centred cubic (f.c.c.) crystal structure (such as Cu-Ni
> alloys, aluminium and its alloys, austenitic stainless steel, Ag, Pb, brass,
> Au, Pt, inconel) are ductile even at low temperatures. Thus, they are favoured
> in cryogenics applications, as ductility provides some safety margin from
> rupture. For materials with a body-centred cubic (b.c.c.) crystal structure
> (ferritic steels, carbon steel with Ni < 10%, Mo, Nb, Cr, NbTi), a
> ductile–brittle transition appears at low temperature: the plasticity capacity
> is wiped out."

— P. Duthil, *Material Properties at Low Temperature*, CAS–CERN Accelerator
School: Superconductivity for Accelerators, CERN-2014-005, §4.2.
[arxiv.org/pdf/1501.07100](https://arxiv.org/pdf/1501.07100)
(confidence **A**)

Duthil adds, on fracture toughness: *"the values of fracture toughness of
high-strength nickel and titanium b.c.c. alloys drop at low temperature, whereas
the value remains large for f.c.c. stainless steel 310."*

Note carefully: Duthil's list places **brass and Inconel in the f.c.c. ductile
group** — brass is not a "keep it warm" material on toughness grounds, even
though it contracts a lot. And it places **NbTi and Nb in the b.c.c. group**,
which surprises people.

### 3.2 Why, mechanistically

The mechanism is the temperature dependence of the Peierls–Nabarro lattice
friction. B.c.c. lattices have no close-packed slip plane, so dislocation motion
depends strongly on thermal activation; as T falls, the thermal energy available
to help dislocations past the lattice resistance disappears, yield strength rises
steeply, and at some temperature the stress needed to move dislocations exceeds
the stress needed to cleave — the material fractures before it yields. F.c.c.
lattices are close-packed with twelve slip systems and a weak temperature
dependence of lattice friction, so plastic flow remains available all the way
down. Duthil's Fig. 17 shows exactly this: normalised yield stress vs T/T_melt
for f.c.c. vs b.c.c., after M. F. Ashby, *Acta Metall.* **20** (1972) 887.
Confidence **A** for the general trend as published; **B** for the
Peierls–Nabarro framing as worded here (standard textbook physical metallurgy,
not quoted verbatim from a source fetched for this file).

### 3.3 Charpy impact data showing the transition

The best documented public dataset with real numbers is NIST's metallurgical
analysis of the *Titanic* hull steel, which used the standard **20 ft·lb (27 J)**
Charpy criterion:

| Steel | DBTT at 27 J criterion |
|---|---|
| Modern ASTM A36 mild steel | **−15 °C** (258 K) |
| *Titanic* hull steel, longitudinal | **+40 °C** (313 K) |
| *Titanic* hull steel, transverse | **+70 °C** (343 K) |

Sea water at the time of the collision was −2 °C.

— T. Foecke, *Metallurgy of the RMS Titanic*, NIST-IR 6118, NIST Metallurgy
Division.
[tsapps.nist.gov/publication/get_pdf.cfm?pub_id=852863](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=852863)
(confidence **A**)

The teaching value is blunt: **even a good modern structural steel is already
brittle at −15 °C.** LN₂ is at −196 °C and LH₂ at −253 °C. Carbon steel is not
marginally unsuitable for cryogenic service — it is ~180 K past its transition.

### 3.4 F.c.c. toughness data — the contrast

Fracture toughness K_IC of austenitic stainless steel **increases** on cooling:

| Alloy | 295 K | 77 K | 4 K |
|---|---:|---:|---:|
| AISI 310 | 150 | **220** | 210 |
| AISI 316 | 350 | **510** | 430 |

(MPa·m^0.5, Ekin Appendix A6.10, major data source H. I. McHenry (1983),
Ch. 11 in *Materials at Low Temperatures*, eds. Reed & Clark, ASM International)
(confidence **A**)

This is the single most persuasive pair of tables in the whole topic: put §3.3
and §3.4 side by side.

### 3.5 Historical framing

- ***Titanic* (1912)** — NIST-IR 6118 above attributes the brittle behaviour to a
  DBTT far above service temperature, caused by high sulphur, low manganese
  (Mn:C ratio 1.5–2 against a desirable 5) and coarse pearlite. Confidence **A**.
- **Liberty ships (WWII)** — the canonical mass-production example: brittle
  fractures initiating at welds. The Japanese Failure Knowledge Database entry
  states the fractures "were caused by low notch toughness at low temperature of
  steel at welded joints, which started at weld cracks or stress concentration
  points."
  [shippai.org/fkd/en/hfen/HB1011020.pdf](https://shippai.org/fkd/en/hfen/HB1011020.pdf)
  Confidence **C** — secondary source; the underlying primary reports were not
  retrieved for this file.

---

## 4. Materials that must not be used cold

### 4.1 Metals

| Material | Verdict | Basis |
|---|---|---|
| Plain carbon steel, ferritic steel | **Not for cryogenic service** | B.c.c., undergoes DBTT (Duthil, §3.1). Modern A36 is already brittle at −15 °C (NIST-IR 6118). Conf **A** |
| Cast iron | **Not for cryogenic service** | Not covered by the sources fetched for this file — see *Could not confirm*. Conf **—** |
| Ferritic/martensitic stainless (400 series) | **Not for cryogenic service** | B.c.c./b.c.t.; falls under Duthil's ferritic-steel statement. Conf **B** |
| Nickel steels | **Qualified only to a stated floor** | See table below. Conf **A** |
| Austenitic stainless (300 series), Al alloys, Cu, brass, Ni alloys, Inconel | **Suitable** | F.c.c. (Duthil, §3.1); toughness rises on cooling (§3.4). Conf **A** |
| Ti-6Al-4V | **Suitable but check the grade** | Widely used cryogenically; Duthil notes Ti alloys have no general trend and depend on interstitials. **ELI (extra-low interstitial) grade is the cryogenic one.** Conf **B** |

**Nickel steel minimum service temperatures** — this is the quantitative answer
to "how much nickel do I need to go how cold", and it shows how much alloying it
takes to drag a b.c.c. steel down:

| ASTM spec | Alloy | Minimum service temperature |
|---|---|---:|
| A203 Grade D / E | 3.5 Ni | **173 K** (−100 °C) |
| A645 | 5 Ni | **102 K** (−171 °C) |
| A645 | 5.5 Ni | **77 K** |
| A553 Type II | 8 Ni | **102 K** |
| A553 Type I | 9 Ni | **77 K** |

— Ekin Appendix A6.9, from H. I. McHenry (1983), Ch. 11 in *Materials at Low
Temperatures*, ASM International. Confidence **A**.

Note the ceiling: **even 9% nickel steel is qualified only to 77 K.** There is no
ferritic steel on this list rated for liquid hydrogen at 20 K. For LH₂ you are in
austenitic stainless, aluminium, or copper alloys.

### 4.2 Polymers and elastomers

Ordinary thermoplastics shatter cold, and the contraction table in §1.3 shows
why they also lose every fit and clearance: PVC 0.83%, PMMA 1.06%, nylon 1.26%,
polystyrene 1.42%, PTFE 1.94% at 77 K, against 0.28% for the stainless they are
mounted in.

**Elastomer low-temperature limits — manufacturer-published service ratings.**
These are Parker's own published compound ratings, converted here to °C and K:

| Family | Parker rating (°F) | °C | K | Example compounds |
|---|---:|---:|---:|---|
| Fluorocarbon (FKM / Viton) | −15 | −26 | **247** | V0763-60, V1164-75 |
| Neoprene (CR) | −35 to −60 | −37 to −51 | 236–222 | C0944-70, C1124-70 |
| Nitrile (NBR / Buna-N) | −40 to −55 | −40 to −48 | **233–225** | N0406-60, N0545-40, N0299-50 |
| EPDM | −70 | −57 | **216** | E0603-70, E1100-50 |
| Silicone (VMQ) | −75 | −59 | **214** | S0469-40 |
| Butyl (IIR) | −75 | −59 | 214 | B0612-70 |
| Fluorosilicone (FVMQ) | −100 | −73 | **200** | LM151-50, LM153-70 |
| Perfluoroelastomer | +5 | −15 | 258 | FF102-75, V1266-65 |

— Parker Hannifin, *O-Ring Material Offering Guide*, **ORD 5712**,
[parker.com/…/ORD-5712-Parker-O-Ring-Material-Offering-Guide.pdf](https://www.parker.com/content/dam/Parker-com/Literature/O-Ring-Division-Literature/ORD-5712-Parker-O-Ring-Material-Offering-Guide.pdf)
(confidence **A** — these are the manufacturer's own published ratings, read
directly from the document; they are *service limits*, not measured Tg)

**The scale of the problem, stated plainly.** The best conventional elastomer in
that list, fluorosilicone, stops at **200 K**. Liquid nitrogen is at **77 K** and
liquid hydrogen at **20 K**. Every one of these elastomers is between 120 K and
180 K below its own rating in cryogenic service. **There is no conventional
O-ring elastomer that is rated for LN₂, let alone LH₂.**

**Why below Tg an elastomer stops sealing.** An elastomer seals because it is a
lightly cross-linked network above its glass transition: the chains are mobile,
so the material is nearly incompressible but very low in shear modulus, and it
behaves hydrostatically — squeeze it and it pushes back against the gland faces
with a contact stress that follows the system pressure. Below Tg the chain
segments freeze. Shear modulus jumps by roughly three orders of magnitude, the
material becomes a glassy solid, and three things happen at once: it can no
longer conform to surface finish, it can no longer *rebound* to follow a gland
that is still moving, and stored elastic contact stress relaxes away. It is then
a hard ring sitting in a groove, not a seal. A vendor statement of the same
mechanism: *"Near the glass transition, elastomers stiffen and cannot rebound
after compression. Contact stress plummets, especially at startup, and micro-leak
paths open."*
— Canyon Components, *Low-Temperature Sealing*
[canyoncomponents.com/post/low-temperature-sealing-o-rings-and-materials-for-cryogenic-and-arctic-applications](https://www.canyoncomponents.com/post/low-temperature-sealing-o-rings-and-materials-for-cryogenic-and-arctic-applications)
(confidence **C** — vendor blog; the physical picture is standard polymer
science but the wording is not from a primary source)

**PTFE and PCTFE are not elastomers.** They are semi-crystalline thermoplastics.
They do not go rubbery-to-glassy the way a cross-linked elastomer does; they stay
usable to 4 K but they were never elastic to begin with, which is precisely why
they need external energisation (§5). Their handicap is contraction: 1.94% and
0.97% at 77 K.

Numeric Tg values for the individual elastomers are in
[Could not confirm](#could-not-confirm) — no primary polymer-property source was
retrieved, and quoting numbers from memory here would defeat the purpose of this
file.

---

## 5. Seals, and why cold joints leak

### 5.1 Why an O-ring that seals warm leaks cold

Four effects stack, and they are not independent:

1. **The elastomer goes glassy.** Every family in §4.2 is far below its rating at
   77 K. Once below Tg the ring cannot rebound to maintain contact stress. This
   is the dominant effect and it alone is disqualifying.
2. **The elastomer contracts away from the gland.** Polymers contract 3–7× more
   than the metal around them (§1.4). Where the seal has to span outward to a
   metal wall, that differential is a direct loss of interference — 0.832 mm
   diametral on a 50 mm PTFE-in-steel fit (§2C).
3. **The gland itself shrinks**, which sometimes helps and sometimes does not.
   In the axial-squeeze case (§2C third bullet) the gland shrinking *with* the
   seal recovers most of the loss — only 9.6% of squeeze is lost. In the radial
   bore case it does not help at all. **Direction of the fit determines the sign
   of the answer.**
4. **The rates differ, not just the endpoints.** Contraction is not linear in T;
   ~93% of the 293→20 K contraction has occurred by 77 K (§2A). During a
   cool-down transient, seal and gland are at different temperatures *and*
   different points on their own contraction curves, so the worst interference
   condition can occur mid-transient rather than at the final soak temperature.

### 5.2 Why spring-energised PTFE and metal seals are used instead

**Spring-energised PTFE.** A U- or V-section PTFE jacket with a corrosion-
resistant metal spring (stainless or Elgiloy) inside it. The spring, not the
polymer's own elasticity, supplies the contact load, so the seal keeps working
after the jacket has stopped behaving elastically, and the spring's travel takes
up the differential contraction. Ekin's cryostat-supplier appendix lists exactly
this class under "Dynamic seals: O-rings, spring-loaded PTFE" (Bal Seal
Engineering) — corroboration from an authoritative text that this is the standard
cryogenic answer. Confidence **A** for "this is the standard hardware";
**C** for detailed performance claims, which come from vendor literature such as
[advanced-emc.com/ptfe-seals-for-cryogenic-applications](https://advanced-emc.com/ptfe-seals-for-cryogenic-applications/).

**Metal seals — C-rings, metal gaskets, indium.** These seal by *plastic*
deformation of a soft metal into the surface finish, plus (for a C-ring or
Helicoflex) spring-back from the metal section itself. Because the sealing
element and the flanges are all metal, differential contraction is small and the
mechanism has no glass transition to fall through. Ekin lists Garlock/Helicoflex
and Nicholsons for metal seals, Indium Corp. for indium wire O-rings, and metal
O-rings as a distinct supplier category. Confidence **A** for the hardware
classes.

NASA quantified the demountable-fitting version of this with metal gaskets:
Swagelok VCR fittings with **stainless steel and silver-plated nickel** gaskets,
1/4", 1/2" and 1", tested with a calibrated helium mass spectrometer at 31 bar
(450 psig) through **four full 300 K → 20–30 K thermal cycles** with a launch
vibration profile in between.
— Tamasy et al., *Ground-based cryogenic leak test of fittings for cryogenic
fluid management*, NASA, CEC 2023,
[ntrs.nasa.gov/api/citations/20230009407/…](https://ntrs.nasa.gov/api/citations/20230009407/downloads/C3Or2A-06_Manuscript_CEC%202023_VCR%20Fittings_062223%20(002).pdf)
(confidence **A** for the test description). Note the framing NASA uses:
*"Mechanically connected fluid joints are virtually unavoidable in complex
cryogenic system designs"* — the goal is to qualify them, not pretend they are
not there.

### 5.3 Bolted joints and preload

The §2D arithmetic is the whole story: an aluminium flange on steel bolts loses
roughly half its preload at 77 K, because the clamped members contract 0.0436 mm
more than the bolt over a 40 mm grip and the bolt's entire elastic stretch at
20 kN is only 0.0690 mm.

**Material pairing rules that follow directly:**
- **Match the materials.** SS bolts in an SS flange, Al bolts in an Al flange →
  zero differential, zero thermal preload change. This is the first choice.
- **If you cannot match, the bolt must contract at least as much as the stack.**
  A bolt that shrinks *more* than the members gains preload (and may yield or
  crush the gasket); a bolt that shrinks *less* loses preload and the joint
  leaks. Steel bolts in aluminium is the losing direction and it is also the most
  common accidental combination.
- **Compensate with the stack.** Belleville washers add compliance so that the
  same differential displacement costs far less load (ΔF = Δ·k_eff, so lowering
  k_eff lowers ΔF proportionally). Invar sleeves or washers under the bolt head
  athermalise the grip.
- **Increase grip length / reduce bolt stiffness.** Δ scales with grip length but
  so does the bolt's elastic stretch, so a longer, more slender bolt at the same
  preload loses a smaller *fraction* of it.

Confidence **A** for the arithmetic and the sign; **B** for the design rules as
worded (they follow from the arithmetic, and the Belleville/Invar compensation
approach is corroborated by NASA work on cryogenic bolt preload relaxation, e.g.
*Investigation of Bolt Preload Relaxation for JWST*,
[ntrs.nasa.gov/api/citations/20180003004/…](https://ntrs.nasa.gov/api/citations/20180003004/downloads/20180003004.pdf)).

---

## 6. Thermal cycling and fatigue

**What repeated cycling does.** Every cool-down imposes a strain of the order of
0.3% (metals) to 2% (polymers) on every constrained dimension, plus a much larger
*local* strain wherever two materials with different contraction are joined. That
is low-cycle fatigue loading: the cycle count is small (tens to thousands) but
the strain per cycle is large, so the governing mode is strain-controlled crack
initiation at stress concentrations — weld toes, braze fillets, bellows
convolution roots, nozzle penetrations — not high-cycle endurance.

**Brazed joints are the classic casualty.** The mechanism is residual stress
built in at manufacture and then reloaded every cycle: as a brazed joint cools
from brazing temperature, differential contraction between filler and the two
base metals generates residual stress at the interface; the interface
microstructure changes as it cools, and the joint can crack and stop being
leak-tight. Brazing is specifically the technique used for **dissimilar
materials** — copper to steel — which is exactly the case with the largest
contraction mismatch. Confidence **B** (the mechanism is described in the CAS
cryostat-design literature and in accelerator-lab braze-joint papers; no single
quotable line was captured for this file).

The CAS cryostat reference notes a second, quieter braze failure path:
*"A proper cleaning after brazing is essential to eliminate flux residues, which
can provoke corrosion and possibly cause leaks in the base materials."*
— *Cryostat Design*, CAS–CERN Accelerator School,
[arxiv.org/pdf/1501.07154](https://arxiv.org/pdf/1501.07154) §6.4 (confidence **A**)

**Bellows.** Bellows exist to absorb exactly the mismatch computed in §2B, so they
are the component that eats the cycling by design and therefore the component
that fatigues. They are also dirt traps: debris in the convolutions causes
damage during thermal cycling.

**Thermal shock and cool-down rate.** Rapid cool-down puts a large temperature
gradient through a wall thickness or across a dissimilar-material joint. The
resulting stress is proportional to the *gradient*, not the final temperature, so
a slow descent to 20 K can be gentler than a fast one to 77 K. This is why
cool-down rate is a controlled parameter, not a convenience. The industry
standard says so directly: operating procedures shall include *"start up from
warm condition that includes cooling the enclosure at a rate that does not create
excessive thermal stresses."*
— EIGA Doc 170/21, *Safe Design and Operation of Cryogenic Enclosures*,
[eiga.eu/uploads/documents/DOC170.pdf](https://www.eiga.eu/uploads/documents/DOC170.pdf)
(confidence **A**)

A second cycling effect worth naming for a safety course: **thermal cycling of
polycrystalline materials whose crystallites are anisotropic produces internal
stresses, and in extreme cases plastic deformation** — observed in tin, cadmium,
zinc and graphite.
— Corruccini & Gniewek, *Thermal Expansion of Technical Solids at Low
Temperatures*, NBS Monograph 29 (1961), Introduction,
[archive.org/details/thermalexpansion29corr](https://archive.org/details/thermalexpansion29corr)
(confidence **A**). This is why "it passed once" is not evidence a joint will
pass fifty times.

---

## 7. Frost and leak detection

### 7.1 Why frost forms

Anything below the ambient dew point condenses water from the air; below 273 K it
deposits as frost. On a cryogenic surface the frost layer keeps growing because
it never gets warm enough to melt off, and — importantly for interpretation —
frost itself insulates, so a heavily frosted spot may no longer be the coldest
spot on the system.

Frost is also an *operational hazard* in its own right, not merely an indicator:
EIGA requires positive purge pressure throughout non-vacuum-insulated enclosures
specifically "to avoid moisture ingress into the enclosure leading to ice
formation and to prevent oxygen condensation", and warns that water "will
saturate the perlite or mineral wool and this liquid water will be very difficult
to remove from the granular insulation by purging alone". Confidence **A** (EIGA
Doc 170/21).

### 7.2 Why frost location does not reliably indicate the leak source

**Position for the course: this is engineering judgment, not a claim I could
attach to a single authoritative sentence.** Searching did not turn up a standard
or handbook that states it in that form. The reasoning, and the partial support
that does exist, is below — teach it as reasoning, not as a citation.

The reasoning:
- Frost marks **where a surface is cold and humid air can reach it**, which is a
  different question from where the leak is. Cold gas escaping a leak runs along
  the outside of pipework, tracks down supports and hangers, and pools in the
  lowest accessible place; the frost forms along that path.
- Inside insulation, a leak has an even longer path. Cold gas migrates through
  perlite, mineral wool or a vacuum annulus and emerges at whatever penetration,
  seam or low point it finds. The visible cold spot can be metres from the defect.
- Frost forms preferentially at **thermal shorts** — supports, brackets, valve
  stems, instrument penetrations — because those are the coldest external
  surfaces regardless of whether anything is leaking there. A frosted valve stem
  on a well-built system may be entirely normal.
- The frost layer's own insulating effect and local air movement decide *where*
  along a cold path deposition is heaviest.

**What authoritative sources do support:**

- Cold spots are a real but *unreliable* leak indicator, and instrumentation for
  them is known to be incomplete: *"It should be noted that cold spots can be
  very localised and the installed temperature elements might not detect all
  leaks, so they should not be seen as a replacement of regular visual checks for
  cold spots."* — EIGA Doc 170/21 §4.8. Confidence **A**. This is the closest
  citable statement to the frost caveat: it establishes that cold-spot evidence
  is patchy and cannot be trusted as complete.
- Once insulation is on, the leak becomes hard to find *at all*: *"Piping and
  equipment shall be pressure and leak tested before installing insulation. It is
  critical to find all leaks before insulation is installed because once
  insulation is installed it will be difficult to detect or fix the leak."*
  — EIGA Doc 170/21 §5. Confidence **A**.

Those two together justify the operational conclusion — *do not chase the frost,
and do not certify a system on the absence of frost* — even though neither says
the caveat in so many words.

### 7.3 What actually locates a cryogenic leak

- **Helium mass-spectrometer leak detection** — the reference method, and the one
  used when a real number is required. Helium is used because it is small,
  inert, and essentially absent from ambient air, so background is low. Two
  modes: *sniffer* (pressurise the article with helium, traverse the outside with
  a probe) and *vacuum/spray* (evacuate the article, spray helium at suspect
  joints and watch the spectrometer). EIGA: *"Helium leak tests are generally
  required during assembly to detect small leaks"* on vacuum-insulated
  enclosures. NASA's fitting qualification used *"a calibrated helium mass
  spectrometer"* to get quantified leak rates at 20–30 K. Confidence **A**.
- **Pressure decay / pressure hold** — measures total leakage of the whole
  boundary, gives no location. Useful as an acceptance gate and for detecting a
  gross change over time, and it is the only practical method for a large
  volume where a spectrometer cannot see everything.
- **Bubble testing at ambient** — soap solution on pressurised joints, at room
  temperature. Conceptually the crudest method and the least sensitive, but it
  localises and needs no instrument. EIGA endorses it with a specific practical
  caution: *"Small leaks might not be immediately observed; it is good practice
  to use leak detection fluid on joints and wait several minutes to ensure that
  any leaks are found."* Confidence **A**.
- **Cold-spot / temperature instrumentation** — genuinely used (EIGA describes
  temperature probes on enclosure floors alarming on internal leaks, and
  temperature detectors below cryogenic pumps), but explicitly *not* a
  replacement for inspection, per the quotation in §7.2.

The ordering to teach: **find leaks warm, before insulation, with helium; use
pressure decay as the acceptance gate; treat frost in service as a symptom that
something is wrong somewhere, and then go and find it properly.**

---

## 8. Welds, brazes and joint selection

**Welded is preferred, and the reason is leak paths.** A full-penetration butt
weld converts two parts into one continuous material with no interface to leak
through, no gasket to go glassy, and no preload to lose. Design guidance for
cryogenic piping is explicit that piping inside an insulation space should be
welded, with butt welds preferred because they can be fully radiographed, and
that mechanical joints — bolted flanges, threaded connections — shall be avoided
where feasible.
— BeaconMedaes, *Delivery systems for cryogenic liquids in laboratories* design
guidebook,
[beaconmedaes.com/…/BMed_Cryogenic_Design_Guide_Book_2021.pdf](https://www.beaconmedaes.com/content/dam/brands/beacon-medaes/documents/laboratory/guidebooks/BMed_Cryogenic_Design_Guide_%20Book_2021.pdf.coredownload.inline.pdf)
(confidence **B** — manufacturer design guide, not a standard)

The CAS cryostat reference frames the trade the same way: welding *"achieves two
basic and distinct functions: providing structural reinforcement in an assembly,
or ensuring leak-tight joining. The latter creates a non-dismountable assembly
and is chosen for permanent assemblies."* TIG is the preferred process for
leak-tight work, and it requires special precautions and strict QC.
— *Cryostat Design*, CAS–CERN, [arxiv.org/pdf/1501.07154](https://arxiv.org/pdf/1501.07154) §6.4
(confidence **A**)

**The cost of welding, which must be taught honestly:** a weld is a
non-dismountable joint, it is a metallurgical discontinuity and a stress
concentration, and it is where the Liberty ship fractures started (§3.5). Welding
does not remove the fracture problem, it relocates it into a heat-affected zone —
which is why the filler and procedure have to keep the joint austenitic, and why
weld NDE matters more cryogenically than it does at ambient.

**Why brazed joints fail from differential contraction.** Brazing is chosen
precisely for the joints that cannot be welded — dissimilar materials, copper to
stainless. That is the same population of joints with the worst contraction
mismatch (Cu 0.302% vs SS 304 0.280% is mild; Cu to G-10 normal, 0.302% vs
0.642%, is not). Residual stress is locked in during cool-down from brazing
temperature, before the part has ever seen service, and every subsequent thermal
cycle reloads it. Flux residues left in the joint add a corrosion path that can
produce leaks in the base material later (CAS §6.4, quoted in §6). Confidence
**B** for the contraction mechanism as reasoned here; **A** for the flux-residue
point.

**Why threaded and compression joints are used sparingly.**
- A threaded joint seals on thread interference or a sealant, and both are
  contraction-sensitive: the male and female members shrink at their own rates
  and the interference is not maintained. Tape and paste sealants embrittle.
- A compression fitting (ferrule type) seals by a cold-formed ferrule bite. It
  works cryogenically — this is a real, qualified technology — but it is a
  *mechanical* joint whose seal depends on a preload that differential
  contraction can relax, and it must be qualified by test through thermal cycles
  rather than assumed.
- The honest position is NASA's: mechanical joints are *"virtually unavoidable in
  complex cryogenic system designs"* and the answer is qualification, not
  avoidance. Their VCR programme ran four 300 K → 20–30 K cycles plus a launch
  vibration profile with helium mass-spec leak measurement at each step
  (NTRS 20230009407, §5.2). Confidence **A**.

**Ranking to teach:** welded (butt, radiographed) > brazed, only where dissimilar
materials force it and only with contraction analysed > metal-gasket demountable
fittings (VCR, C-ring, Conflat) where access is genuinely required > compression
fittings, qualified by cycle test > threaded > elastomer-sealed flanges (not for
cryogenic service).

---

## Worked examples verified

Arithmetic executed and checked. Inputs: SS 304 0.00280, Al 6061 0.00389,
Cu OFHC 0.00302, PTFE 0.01944, Invar 36 0.00040 (293 K → 77 K);
SS 304 0.00300, Al 6061 0.00415, PTFE 0.02119 (293 K → 20 K).

**1. 3 m stainless run → 77 K**
```
ΔL = 3000 mm × 0.00280 = 8.400 mm                    ✓
→ 20 K: 3000 × 0.00300 = 9.000 mm                    ✓
fraction complete at 77 K: 0.00280/0.00300 = 93.3 %  ✓
```

**2. 10 m lines → 77 K**
```
SS 304   : 10000 × 0.00280 = 28.00 mm                ✓
Al 6061  : 10000 × 0.00389 = 38.90 mm                ✓
Cu OFHC  : 10000 × 0.00302 = 30.20 mm                ✓
Invar 36 : 10000 × 0.00040 =  4.00 mm                ✓
Al-vs-SS : 10000 × (0.00389 − 0.00280)
         = 10000 × 0.00109 = 10.90 mm                ✓
```

**3a. PTFE ring 50.00 mm OD in SS 304 bore 50.00 mm → 77 K**
```
PTFE OD : 50.00 × (1 − 0.01944) = 49.0280 mm   (shrinks 0.9720 mm)   ✓
SS bore : 50.00 × (1 − 0.00280) = 49.8600 mm   (shrinks 0.1400 mm)   ✓
gap     : 49.8600 − 49.0280     =  0.8320 mm diametral               ✓
                                =  0.4160 mm radial                  ✓
cross-check: 50.00 × (0.01944 − 0.00280) = 50.00 × 0.01664 = 0.8320  ✓
```

**3b. Same ring, 50.00 mm ID, on a 50.00 mm SS 304 shaft → 77 K**
```
PTFE ID 49.0280 mm vs shaft OD 49.8600 mm
→ 0.8320 mm diametral INTERFERENCE (seal tightens, opposite sign)    ✓
```

**3c. Axial squeeze, 3.53 mm PTFE cord in 2.90 mm deep SS 304 gland → 77 K**
```
293 K squeeze : 3.530 − 2.900 = 0.630 mm  (17.8 % of cord)           ✓
 77 K cord    : 3.530 × (1 − 0.01944) = 3.4614 mm                    ✓
 77 K gland   : 2.900 × (1 − 0.00280) = 2.8919 mm                    ✓
 77 K squeeze : 3.4614 − 2.8919       = 0.5695 mm                    ✓
squeeze lost  : 0.630 − 0.5695 = 0.0605 mm = 9.6 % of original       ✓
```

**4. Al 6061 flange, SS 304 M10 bolts, 40 mm grip, 20 kN preload → 77 K**
```
Aₛ = 58.0 mm² (M10×1.5, ISO 898 tensile stress area), E = 200 GPa
k_b = Aₛ·E/L = 58.0 × 200000 / 40 = 290 000 N/mm                     ✓
bolt stretch δ_b = 20000 / 290000 = 0.06897 mm                       ✓
Al stack contracts : 40 × 0.00389 = 0.15560 mm                       ✓
SS bolt contracts  : 40 × 0.00280 = 0.11200 mm                       ✓
differential Δ     : 0.15560 − 0.11200 = 0.04360 mm                  ✓
Δ / δ_b            : 0.04360 / 0.06897 = 63.2 % of the bolt's stretch ✓

ΔF = Δ · k_b k_m/(k_b + k_m):
  k_m = 3 k_b : k_eff = 217 500 N/mm → ΔF =  9 483 N = 47 % of 20 kN ✓
  k_m = 4 k_b : k_eff = 232 000 N/mm → ΔF = 10 115 N = 51 % of 20 kN ✓
  k_m = 5 k_b : k_eff = 241 667 N/mm → ΔF = 10 537 N = 53 % of 20 kN ✓

same-material check: SS bolts in SS flange → Δ = 0.0000 mm, ΔF = 0   ✓
```

**5. PTFE / metal contraction ratios at 77 K**
```
PTFE / SS 304   = 0.01944 / 0.00280 =  6.9 ×                         ✓
PTFE / Cu OFHC  = 0.01944 / 0.00302 =  6.4 ×                         ✓
PTFE / Al 6061  = 0.01944 / 0.00389 =  5.0 ×                         ✓
PTFE / Invar 36 = 0.01944 / 0.00040 = 48.6 ×                         ✓
```

**6. Fraction of the 293→20 K contraction already reached at 77 K**
```
SS 304 93.3 %   Al 6061 93.7 %   Cu 93.2 %
Ti-6Al-4V 93.1 %   G-10 normal 90.7 %   PTFE 91.7 %                  ✓
```

**7. Temperature conversions used in §4.2**
```
−15 °F = −26.1 °C = 247.0 K       −70 °F = −56.7 °C = 216.5 K        ✓
−40 °F = −40.0 °C = 233.1 K       −75 °F = −59.4 °C = 213.7 K        ✓
−55 °F = −48.3 °C = 224.8 K      −100 °F = −73.3 °C = 199.8 K        ✓
LN₂ 77.36 K = −195.8 °C = −320.4 °F                                  ✓
LH₂ 20.28 K = −252.9 °C = −423.2 °F                                  ✓
```

---

## Could not confirm

Items deliberately left blank rather than filled from memory.

1. **Numeric glass transition temperatures (Tg) for NBR, FKM/Viton, EPDM and
   silicone/VMQ.** No primary polymer-property source was successfully
   retrieved. The Parker O-Ring Handbook (ORD 5700) is the obvious source but
   every mirror reachable in this session was either HTTP 403 (parker.com direct)
   or an encrypted/scanned PDF with no extractable text. Vendor pages quote
   ranges (NBR −25 to −40 °C, FKM −15 to −25 °C, silicone functioning to −70 to
   −100 °C) but these conflate Tg with service limits and are confidence **C** at
   best. **What is solid is the Parker service-rating table in §4.2 (confidence
   A), and that table already makes the teaching point** — every conventional
   elastomer is 120–180 K above cryogenic service temperature. *To close this:
   Parker O-Ring Handbook ORD 5700 Section II, or a polymer handbook (Brandrup,
   Immergut & Grulke) Tg table.*
2. **Tg for PTFE and PCTFE.** Not retrieved. Note these are semi-crystalline
   thermoplastics, so a single Tg is the wrong descriptor anyway — PTFE has
   well-known crystalline transitions near room temperature that are more
   relevant to seal dimensional stability than any Tg. *To close this: DuPont/
   Chemours Teflon PTFE properties handbook.*
3. **Integrated thermal contraction for elastomers** (nitrile, Viton, EPDM,
   silicone). NBS Monograph 29 Table 2.4 *does* cover "plastics and elastomers",
   but the Internet Archive OCR of that table interleaves columns so badly that
   individual cells cannot be attributed to materials with confidence. No value
   was transcribed. *To close this: a clean scan or reprint of Monograph 29
   Table 2.4, or Ekin's book body (Figs. 6.8/6.9) rather than the free appendix.*
4. **G-11 / G-11CR contraction.** Confirmed **absent** from the NIST database —
   the NIST references page lists G-11 for thermal conductivity only, with no
   linear-expansion entry. G-10CR values are in §1.3 and are the closest
   available proxy, but the substitution is not verified. *To close this: NIST
   Monograph 177 or the Reed & Clark ASM volume.*
5. **A contraction value for "carbon steel" as such.** The §1.3 row uses Ekin's
   pure-iron row (0.190% @77 K), with Fe-9Ni at 0.188% as a bracket. No source
   fetched gives a value labelled "carbon steel" or "mild steel". The two
   bracketing values are close enough that 0.19% is safe to teach, but it is an
   inference. *To close this: Monograph 29 Table 2.2 (alloys), clean scan.*
6. **Cast iron at cryogenic temperature.** No source fetched addresses cast iron
   specifically. It is excluded in §4.1 by inference from the b.c.c. ferritic
   matrix plus the notch effect of graphite flakes, not from a citation. *To
   close this: ASM Handbook Vol. 1, or a cryogenic-safety standard's prohibited-
   materials list.*
7. **A citable statement that frost location does not indicate leak location.**
   Searched for; not found. §7.2 states the position as engineering judgment and
   shows the two EIGA statements that partially support it. This should be taught
   as reasoning, not quoted as a standard.
8. **Charpy impact energy vs temperature curves for austenitic stainless.**
   Austenitic grades have no transition, so Charpy-vs-T curves are not the usual
   way their toughness is reported; §3.4 uses K_IC instead, which is the property
   actually tabulated. The Duthil paper's Figs. 16 and 18 show the b.c.c.
   transition curves and the f.c.c. contrast graphically, but the figures are
   images and no numeric values could be extracted from them.
9. **Independence of the two contraction chains.** Both NIST and Ekin draw partly
   on NBS Monograph 29 (see §1.5 caveat 7). The cross-check in §1.2 validates
   evaluation and transcription; it is **not** independent experimental
   confirmation. Do not describe it as such.

---

## Source list

| # | Source | URL | Used for |
|---|---|---|---|
| 1 | NIST Cryogenic Material Properties Database (material index + per-material fits) | [trc.nist.gov/cryogenics/materials/materialproperties.htm](https://trc.nist.gov/cryogenics/materials/materialproperties.htm) | §1 contraction fits |
| 2 | NIST material-property source references | [trc.nist.gov/cryogenics/materials/references.htm](https://trc.nist.gov/cryogenics/materials/references.htm) | §1.5 provenance |
| 3 | Bradley & Radebaugh, *Properties of Selected Materials at Cryogenic Temperatures*, NIST | [tsapps.nist.gov/publication/get_pdf.cfm?pub_id=913059](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=913059) | §1.2 validation table |
| 4 | Marquardt, Le & Radebaugh, *Cryogenic Material Properties Database*, NIST (2000) | [trc.nist.gov/cryogenics/Papers/Material_Properties/2000-Cryogenic_Material_Properties_Database.pdf](https://trc.nist.gov/cryogenics/Papers/Material_Properties/2000-Cryogenic_Material_Properties_Database.pdf) | §1.1 definition |
| 5 | Ekin, *Experimental Techniques for Low-Temperature Measurements*, OUP — free appendix tables (A6.4, A6.9, A6.10, A7.4, A7.6) | [researchmeasurements.com/figures/ExpTechLTMeas_Apdx_English.pdf](https://www.researchmeasurements.com/figures/ExpTechLTMeas_Apdx_English.pdf) | §1.3, §3.4, §4.1, §5.2 |
| 6 | Corruccini & Gniewek, *Thermal Expansion of Technical Solids at Low Temperatures*, NBS Monograph 29 (1961) | [archive.org/details/thermalexpansion29corr](https://archive.org/details/thermalexpansion29corr) | §6 anisotropy; underlying source for #1/#5 |
| 7 | Duthil, *Material Properties at Low Temperature*, CAS–CERN, CERN-2014-005 | [arxiv.org/pdf/1501.07100](https://arxiv.org/pdf/1501.07100) | §3.1, §3.2 |
| 8 | Foecke, *Metallurgy of the RMS Titanic*, NIST-IR 6118 | [tsapps.nist.gov/publication/get_pdf.cfm?pub_id=852863](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=852863) | §3.3, §3.5 Charpy/DBTT |
| 9 | *Cryostat Design*, CAS–CERN Accelerator School | [arxiv.org/pdf/1501.07154](https://arxiv.org/pdf/1501.07154) | §6, §8 welds and brazes |
| 10 | EIGA Doc 170/21, *Safe Design and Operation of Cryogenic Enclosures* | [eiga.eu/uploads/documents/DOC170.pdf](https://www.eiga.eu/uploads/documents/DOC170.pdf) | §6 cool-down rate; §7 frost, cold spots, leak testing |
| 11 | Tamasy et al., *Ground-based cryogenic leak test of fittings for cryogenic fluid management*, NASA, CEC 2023 | [ntrs.nasa.gov/api/citations/20230009407/…](https://ntrs.nasa.gov/api/citations/20230009407/downloads/C3Or2A-06_Manuscript_CEC%202023_VCR%20Fittings_062223%20(002).pdf) | §5.2, §8 fitting qualification |
| 12 | *Investigation of Bolt Preload Relaxation for JWST*, NASA | [ntrs.nasa.gov/api/citations/20180003004/…](https://ntrs.nasa.gov/api/citations/20180003004/downloads/20180003004.pdf) | §5.3 preload |
| 13 | Parker Hannifin, *O-Ring Material Offering Guide* ORD 5712 | [parker.com/…/ORD-5712-Parker-O-Ring-Material-Offering-Guide.pdf](https://www.parker.com/content/dam/Parker-com/Literature/O-Ring-Division-Literature/ORD-5712-Parker-O-Ring-Material-Offering-Guide.pdf) | §4.2 elastomer service limits |
| 14 | BeaconMedaes, *Delivery systems for cryogenic liquids in laboratories* | [beaconmedaes.com/…/BMed_Cryogenic_Design_Guide_Book_2021.pdf](https://www.beaconmedaes.com/content/dam/brands/beacon-medaes/documents/laboratory/guidebooks/BMed_Cryogenic_Design_Guide_%20Book_2021.pdf.coredownload.inline.pdf) | §8 welded-joint preference |
| 15 | Japanese Failure Knowledge Database, *Brittle fracture of Liberty Ships* | [shippai.org/fkd/en/hfen/HB1011020.pdf](https://shippai.org/fkd/en/hfen/HB1011020.pdf) | §3.5 (confidence C) |
| 16 | Canyon Components, *Low-Temperature Sealing* | [canyoncomponents.com/post/low-temperature-sealing-o-rings-and-materials-for-cryogenic-and-arctic-applications](https://www.canyoncomponents.com/post/low-temperature-sealing-o-rings-and-materials-for-cryogenic-and-arctic-applications) | §4.2 mechanism wording (confidence C) |
| 17 | Advanced EMC, *PTFE Seals for Cryogenic Applications* | [advanced-emc.com/ptfe-seals-for-cryogenic-applications](https://advanced-emc.com/ptfe-seals-for-cryogenic-applications/) | §5.2 spring-energised seals (confidence C) |
