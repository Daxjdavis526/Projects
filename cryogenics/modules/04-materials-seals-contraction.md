# Module 04 — Materials, Seals, and Thermal Contraction

*Roughly 20 minutes. Prerequisite: Module 03.*

Cold does two things to hardware, and neither is obvious from a room temperature
datasheet. Everything gets shorter, and some things get brittle. The failures are
rarely dramatic at first — a flange that weeps, a braze that passes one cycle and
fails the twelfth. This module is about seeing, on the drawing, where the cold
will pull an assembly apart.

## What you'll be able to do

- Use integrated contraction ΔL/L from 293 K, and say why a room-temperature
  expansion coefficient misleads you.
- Estimate a pipe run's contraction, and the mismatch between two dissimilar
  runs, to the nearest millimetre.
- Explain why an O-ring that seals warm cannot seal at 77 K, and name what is
  used instead.
- Sort a materials list into "fine cold" and "will fracture" on crystal
  structure.
- Explain why frost is not a leak locator, and what is.

---

## 1. The number engineers actually use

Ask for a material's thermal expansion and you get α, measured near room
temperature: multiply by ΔT and you have your answer. Except you do not, because
α is not constant. It falls steeply on cooling, roughly as T³ at the bottom end,
so using α₂₉₃ over a 273 K drop assumes a constant that collapsed on you somewhere
in the middle.

Cryogenic practice therefore does not integrate α at all. It uses the
already-integrated result, tabulated directly:

> ΔL/L = (L₂₉₃ − L_T) / L₂₉₃, expressed as a percent.

NIST states the convention plainly: *"Most of the literature reports the
integrated linear thermal expansion as a percent change in length from some
original length generally measured at 293 K"* `[NIST-CMPD-PAPER]`; Ekin's
appendix tables use the identical definition `[EKIN-APPENDIX]`. Throughout,
**positive means contraction**.

<figure>
<svg viewBox="0 0 660 330" role="img" aria-label="Horizontal bar chart of integrated linear contraction from 293 K to 77 K for ten materials, from Invar 36 at 0.040 percent to PTFE at 1.944 percent">
  <g font-family="system-ui, sans-serif" font-size="13" fill="currentColor">
    <text x="0" y="14" font-size="13" fill="var(--muted)">ΔL/L from 293 K to 77 K  [% of length, positive = contraction]</text>

    <line x1="180" y1="26" x2="180" y2="300" stroke="var(--muted)" stroke-width="1"/>
    <line x1="280" y1="26" x2="280" y2="300" stroke="var(--muted)" stroke-width="0.5" stroke-dasharray="2 4"/>
    <line x1="380" y1="26" x2="380" y2="300" stroke="var(--muted)" stroke-width="0.5" stroke-dasharray="2 4"/>
    <line x1="480" y1="26" x2="480" y2="300" stroke="var(--muted)" stroke-width="0.5" stroke-dasharray="2 4"/>
    <line x1="580" y1="26" x2="580" y2="300" stroke="var(--muted)" stroke-width="0.5" stroke-dasharray="2 4"/>

    <text x="180" y="318" text-anchor="middle" fill="var(--muted)">0</text>
    <text x="280" y="318" text-anchor="middle" fill="var(--muted)">0.5</text>
    <text x="380" y="318" text-anchor="middle" fill="var(--muted)">1.0</text>
    <text x="480" y="318" text-anchor="middle" fill="var(--muted)">1.5</text>
    <text x="580" y="318" text-anchor="middle" fill="var(--muted)">2.0 %</text>

    <text x="174" y="46" text-anchor="end">Invar 36</text>
    <rect x="180" y="35" width="8" height="14" fill="var(--ok)"/>
    <text x="196" y="46">0.040</text>

    <text x="174" y="73" text-anchor="end">Ti-6Al-4V</text>
    <rect x="180" y="62" width="32" height="14" fill="currentColor"/>
    <text x="220" y="73">0.162</text>

    <text x="174" y="100" text-anchor="end">Carbon steel (Fe)</text>
    <rect x="180" y="89" width="38" height="14" fill="currentColor"/>
    <text x="226" y="100">0.190</text>

    <text x="174" y="127" text-anchor="end">G-10, warp</text>
    <rect x="180" y="116" width="43" height="14" fill="currentColor"/>
    <text x="231" y="127">0.214</text>

    <text x="174" y="154" text-anchor="end">SS 304 / 316</text>
    <rect x="180" y="143" width="56" height="14" fill="currentColor"/>
    <text x="244" y="154">0.280</text>

    <text x="174" y="181" text-anchor="end">Copper, OFHC</text>
    <rect x="180" y="170" width="60" height="14" fill="currentColor"/>
    <text x="248" y="181">0.302</text>

    <text x="174" y="208" text-anchor="end">Brass 65/35</text>
    <rect x="180" y="197" width="71" height="14" fill="currentColor"/>
    <text x="259" y="208">0.353</text>

    <text x="174" y="235" text-anchor="end">Al 6061 / 5083</text>
    <rect x="180" y="224" width="78" height="14" fill="currentColor"/>
    <text x="266" y="235">0.389</text>

    <text x="174" y="262" text-anchor="end">G-10, normal</text>
    <rect x="180" y="251" width="128" height="14" fill="currentColor"/>
    <text x="316" y="262">0.642</text>

    <text x="174" y="289" text-anchor="end">PTFE</text>
    <rect x="180" y="278" width="389" height="14" fill="var(--warn)"/>
    <text x="577" y="289" fill="var(--warn)">1.944</text>
  </g>
</svg>
<figcaption>Figure 4.1 — Integrated contraction at 77 K. The metals cluster inside a factor of two of each other. PTFE sits a factor of seven above stainless steel, and that single fact governs most of cryogenic sealing. Data: NIST curve fits and Ekin Appendix A6.4 <code>[NIST-CRYO-MATERIALS]</code> <code>[EKIN-APPENDIX]</code>.</figcaption>
</figure>

### The table

**ΔL/L from 293 K, percent. Positive = contraction.**

| Material | → 77 K [%] | → 20 K [%] |
|---|---:|---:|
| Invar 36 (Fe-36Ni) | 0.040 | 0.040 |
| Ti-6Al-4V | 0.162 | 0.174 |
| Iron / plain carbon steel | 0.190 | ≈0.197 |
| G-10CR, warp (∥ fibres) | 0.214 | 0.242 |
| SS 304 / 304L / 310 / 316 | 0.280 | 0.300 |
| Copper, OFHC | 0.302 | ≈0.323 |
| Brass (65Cu-35Zn) | 0.353 | ≈0.382 |
| Aluminium 6061-T6 / 5083-O | 0.389 | 0.415 |
| G-10CR, normal (through-thickness) | 0.642 | 0.708 |
| PTFE (Teflon) | 1.944 | 2.119 |

Four caveats travel with this table:

- **NIST fits one curve for the whole austenitic family** — 304, 304L, 310 and
  316. Ekin separates them at 0.281 and 0.279, a 0.7% difference well inside
  NIST's stated 5% curve-fit error. **Do not design around a contraction
  difference between 304 and 316.**
- **Likewise one fit for 3003, 5083 and 6061 aluminium.** The 5083 number is not
  independent of the 6061 number.
- **G-10 is strongly anisotropic** — 0.642% through-thickness against 0.214%
  in-plane. Always state the direction.

<div class="box remember"><span class="lbl">Remember this</span>
Structural metals contract roughly <strong>0.2 to 0.4 %</strong> on the way to 77 K.
Stainless is 0.28 %, aluminium 0.39 %. About <strong>93 %</strong> of the total
contraction all the way to 20 K has already happened by 77 K — so if a design
survives an LN₂ soak dimensionally, LH₂ adds very little more movement.
</div>

---

## 2. Four calculations worth being able to do in your head

**A. A 3 m stainless run cooled to LN₂.**

```
3000 mm × 0.00280 = 8.4 mm shorter
to 20 K:  3000 mm × 0.00300 = 9.0 mm
```

Eight and a half millimetres on a three-metre run. It goes somewhere: a bellows,
an expansion loop, a sliding support, or into the anchors as load.

**B. A 10 m aluminium line beside a 10 m stainless line.**

```
SS 304 :  10 000 × 0.00280 = 28.0 mm
Al 6061:  10 000 × 0.00389 = 38.9 mm
mismatch: 10 000 × (0.00389 − 0.00280) = 10.9 mm
```

Tied rigidly at both ends, they fight over **10.9 mm**. That is the number that
sizes the bellows. (An Invar run of the same length moves 4.0 mm in total.)

**C. A PTFE ring in a stainless gland, 50.00 mm nominal.**

```
PTFE OD : 50.00 × (1 − 0.01944) = 49.028 mm
SS bore : 50.00 × (1 − 0.00280) = 49.860 mm
diametral gap = 0.832 mm  (0.416 mm radial)
```

The ring has walked 0.42 mm off the wall it was meant to seal against. Flip the
direction, though: the *same* ring with a 50.00 mm **ID** on a 50.00 mm stainless
**shaft** ends up 0.832 mm *interfering* — it grips harder cold. And a 3.53 mm
PTFE cord axially squeezed in a 2.90 mm deep stainless gland loses only 9.6% of
its squeeze (0.630 → 0.570 mm), because the gland depth shrinks with it. The
lesson is not "PTFE always loses squeeze": the differential is 1.66% of whatever
dimension must be spanned, and you must ask **which dimension, in which
direction**.

**D. An aluminium flange on stainless bolts.** 40 mm grip, M10 SS 304 bolts
(A_s = 58.0 mm², E = 200 GPa), preloaded to 20 kN.

```
bolt stiffness k_b = 58.0 × 200 000 / 40 = 290 000 N/mm
bolt stretch at preload = 20 000 / 290 000 = 0.0690 mm
Al stack contracts  = 40 × 0.00389 = 0.1556 mm
SS bolt contracts   = 40 × 0.00280 = 0.1120 mm
differential        =                0.0436 mm
                                     ─────────
0.0436 / 0.0690 = 63 % of the bolt's entire elastic stretch
```

The clamped members shrink *more* than the bolt, so the bolt unloads. Taking a
typical member stiffness k_m = 4 k_b, the load lost is
ΔF = 0.0436 × k_b·k_m/(k_b+k_m) ≈ **10.1 kN — about half the preload gone**
(47–53% across k_m = 3–5 k_b).

This is first-order — it ignores that E of 304 rises about 7% on cooling, and
contains no gasket creep or embedment — but the magnitude and sign are right. The
fix falls straight out of it: **stainless bolts in a stainless flange give zero
differential.**

<div class="box wcgw"><span class="lbl">What could go wrong?</span>
An aluminium valve body bolted with the stainless cap screws that happened to be
in the bin. It torques up beautifully, passes a room-temperature bubble test, and
arrives at 77 K with half its preload gone. Steel bolts in aluminium is the
losing direction, and it is also the most common accidental combination in a
workshop.
</div>

---

## 3. The PTFE lesson, and why α lies to you

PTFE contracts **1.944%** to 77 K, stainless **0.280%**:

```
0.01944 / 0.00280 = 6.9 ×
```

Now the same comparison with room-temperature coefficients. PTFE's α₂₉₃ is
250 × 10⁻⁶ K⁻¹, SS 304's is 15.1 × 10⁻⁶ K⁻¹ — a ratio of about **17×**.

Both are correct; they answer different questions. PTFE's coefficient falls much
faster on cooling than steel's, so the integrated difference is far smaller than
the room-temperature one suggests. Size a seal fit from α₂₉₃ and you overstate
PTFE's differential by more than a factor of two.

The other integrated ratios at 77 K: PTFE/copper 6.4×, PTFE/aluminium 5.0×,
PTFE/Invar 48.6×.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
Any time someone quotes a cryogenic dimensional change derived from a
room-temperature expansion coefficient, the number is wrong — usually
conservative for metal-on-metal, wildly wrong for polymer-on-metal. Ask for the
integrated ΔL/L, from 293 K, to the actual service temperature.
</div>

---

## 4. Ductile-to-brittle: it is the lattice

Contraction is a dimensional problem. Brittleness is a fracture problem, and it
sorts materials into two groups on crystal structure alone.

The CERN Accelerator School states it cleanly `[CERN-DUTHIL]`:

> *"Materials with a face-centred cubic (f.c.c.) crystal structure (such as Cu-Ni
> alloys, aluminium and its alloys, austenitic stainless steel, Ag, Pb, brass, Au,
> Pt, inconel) are ductile even at low temperatures. … For materials with a
> body-centred cubic (b.c.c.) crystal structure (ferritic steels, carbon steel
> with Ni < 10%, Mo, Nb, Cr, NbTi), a ductile–brittle transition appears: the
> plasticity capacity is wiped out."*

**Why.** An f.c.c. lattice is close-packed, with twelve slip systems and a lattice
friction barely dependent on temperature, so dislocations keep moving however cold
it gets and the material yields before it cracks. A b.c.c. lattice has no
close-packed slip plane, so dislocation motion leans on thermal activation. Cool
it and the energy that helped dislocations past the lattice resistance
disappears: yield strength climbs steeply until the stress needed to move a
dislocation exceeds the stress needed to cleave the crystal, and the material
fractures before it yields. That is the ductile-to-brittle transition.

**How far above cryogenic temperature the transition sits.** The best-documented
public dataset is NIST's work on *Titanic* hull steel, at the standard 27 J
Charpy criterion `[NIST-TITANIC]`:

| Steel | DBTT at the 27 J criterion |
|---|---|
| Modern ASTM A36 mild steel | **−15 °C** (258 K) |
| *Titanic* hull steel, longitudinal | **+40 °C** (313 K) |
| *Titanic* hull steel, transverse | **+70 °C** (343 K) |

The sea water that night was −2 °C: the *Titanic*'s steel was brittle in the water
it floated in. But read the first row again. **A good modern structural steel is
already brittle at −15 °C.** LN₂ is −196 °C, LH₂ −253 °C. Carbon steel is not
marginally unsuitable for cryogenic service; it is ~180 K past its transition.

Austenitic stainless goes the other way — fracture toughness K_IC, MPa·m^0.5
`[EKIN-APPENDIX]`:

| Alloy | 295 K | 77 K | 4 K |
|---|---:|---:|---:|
| AISI 310 | 150 | **220** | 210 |
| AISI 316 | 350 | **510** | 430 |

316 is roughly 45% tougher at LN₂ temperature than at room temperature. Those two
tables side by side are the whole argument for austenitic stainless.

<div class="box"><span class="lbl">Worth knowing</span>
Duthil's f.c.c. list includes <strong>brass and Inconel</strong>: brass is not a
"keep it warm" material on toughness grounds, even though Figure 4.1 shows it
contracting more than stainless. His b.c.c. list includes <strong>Nb and
NbTi</strong>. Structure, not reputation.
</div>

---

## 5. What must not go cold

**Metals.** Plain carbon and ferritic steels are out — b.c.c., past their
transition long before LN₂ — as are the 400-series ferritic and martensitic
stainlesses. Cast iron is excluded here by inference (b.c.c. matrix plus the notch
effect of graphite flakes), not from a citation; no source consulted for this
course addresses it directly.

Nickel steels show how much alloying it takes to drag a b.c.c. steel down
`[EKIN-APPENDIX]`: A203 Grade D/E (3.5 Ni) to 173 K, A645 (5.5 Ni) to 77 K, A553
Type I (9 Ni) to 77 K. Note the ceiling — **even 9% nickel steel stops at 77 K.**
For LH₂ you are in austenitic stainless, aluminium, or copper.

**Polymers and elastomers.** Ordinary thermoplastics shatter, and Figure 4.1
shows they also lose every fit and clearance they had. For elastomers, rather
than quoting glass-transition temperatures — widely misreported, and not
sourceable from a primary reference here — use the manufacturer's published
service ratings `[PARKER-ORD-5712]`:

| Family | Parker rating | K |
|---|---:|---:|
| Perfluoroelastomer | +5 °F | 258 |
| Fluorocarbon (FKM / Viton) | −15 °F | 247 |
| Nitrile (NBR) | −40 to −55 °F | 233–225 |
| Neoprene (CR) | −35 to −60 °F | 236–222 |
| EPDM | −70 °F | 216 |
| Silicone (VMQ), Butyl (IIR) | −75 °F | 214 |
| Fluorosilicone (FVMQ) | −100 °F | 200 |

Read the bottom row against the fluids. **The best conventional elastomer in the
catalogue stops at 200 K. LN₂ is 77 K. LH₂ is 20 K.** Every compound here would
be 120–180 K below its own rating in cryogenic service. This is not a marginal
call requiring judgment; it is off the end of the table.

PTFE and PCTFE are not elastomers but semi-crystalline thermoplastics. They stay
usable to 4 K — but they were never elastic to begin with, which is exactly why
they need external energising.

---

## 6. Why cold joints leak

An elastomer seals because it is a lightly cross-linked network *above* its glass
transition: chain segments are mobile, so it is nearly incompressible but very low
in shear modulus, and squeezing it makes it push back hydrostatically on both
gland faces. Below Tg the segments freeze and shear modulus jumps by about three
orders of magnitude. It can no longer conform to the surface finish, no longer
*rebound* to follow a gland that is still moving, and its stored contact stress
relaxes away. It is now a hard ring in a groove.

Four effects stack, and they are not independent:

1. **The elastomer goes glassy.** Dominant, and by itself disqualifying.
2. **It contracts away from the gland** — 0.832 mm diametral on the 50 mm fit.
3. **The gland shrinks too**, which sometimes helps: axially it recovered most of
   the loss, radially nothing. Direction of the fit sets the sign.
4. **The rates differ, not just the endpoints.** Mid-transient, seal and gland sit
   at different temperatures *and* different points on their own curves, so the
   worst condition can occur during cool-down rather than at soak.

<figure>
<svg viewBox="0 0 660 260" role="img" aria-label="Cross-section of a polymer seal in a stainless gland at 293 K and at 77 K, showing a diametral gap of 0.832 millimetres opening between the shrunken seal and the bore">
  <g font-family="system-ui, sans-serif" font-size="13" fill="currentColor">
    <text x="10" y="16" font-size="13" fill="var(--muted)">293 K — seal in contact</text>
    <text x="360" y="16" font-size="13" fill="var(--muted)">77 K — both shrink, at different rates</text>

    <rect x="10" y="30" width="300" height="26" fill="var(--side)" stroke="currentColor"/>
    <rect x="10" y="184" width="300" height="26" fill="var(--side)" stroke="currentColor"/>
    <text x="160" y="48" text-anchor="middle" font-size="13">SS 304 bore wall</text>
    <text x="160" y="202" text-anchor="middle" font-size="13">SS 304 bore wall</text>

    <rect x="70" y="56" width="180" height="128" fill="none" stroke="currentColor" stroke-width="2"/>
    <text x="160" y="118" text-anchor="middle" font-size="13">PTFE seal</text>
    <text x="160" y="138" text-anchor="middle" font-size="13" fill="var(--ok)">contact — sealing</text>
    <text x="160" y="238" text-anchor="middle" font-size="13" fill="var(--muted)">50.00 mm OD in 50.00 mm bore</text>

    <rect x="360" y="30" width="290" height="26" fill="var(--side)" stroke="currentColor"/>
    <rect x="360" y="184" width="290" height="26" fill="var(--side)" stroke="currentColor"/>
    <text x="505" y="48" text-anchor="middle" font-size="13">bore → 49.860 mm (−0.28 %)</text>
    <text x="505" y="202" text-anchor="middle" font-size="13">bore → 49.860 mm</text>

    <rect x="420" y="74" width="170" height="92" fill="none" stroke="var(--warn)" stroke-width="2"/>
    <text x="505" y="118" text-anchor="middle" font-size="13">PTFE → 49.028 mm</text>
    <text x="505" y="136" text-anchor="middle" font-size="13">(−1.94 %)</text>

    <line x1="505" y1="56" x2="505" y2="74" stroke="var(--warn)" stroke-width="1"/>
    <line x1="505" y1="166" x2="505" y2="184" stroke="var(--warn)" stroke-width="1"/>
    <text x="515" y="70" font-size="13" fill="var(--warn)">0.416 mm radial</text>
    <text x="515" y="180" font-size="13" fill="var(--warn)">0.416 mm radial</text>
    <text x="360" y="238" font-size="13" fill="var(--warn)">gap = 0.832 mm diametral — leak path</text>
  </g>
</svg>
<figcaption>Figure 4.2 — The seal has to span outward to the wall, and it shrinks nearly seven times faster than the wall does. Flip the geometry — the same ring gripping <em>inward</em> on a shaft — and the identical 0.832 mm becomes interference instead.</figcaption>
</figure>

### What is used instead

**Spring-energised PTFE.** A U- or V-section PTFE jacket with a corrosion-
resistant metal spring inside. The *spring* supplies the contact load, not the
polymer's elasticity, so the seal keeps working after the jacket has stopped
behaving elastically, and the spring's travel absorbs the differential
contraction. This is the standard cryogenic dynamic seal `[EKIN-APPENDIX]`.

**Metal seals** — C-rings, Helicoflex, flat gaskets, indium wire — seal by plastic
deformation of a soft metal into the surface finish, plus spring-back from the
section. Element and flanges are all metal, so the differential is small and there
is no glass transition to fall through. NASA's qualification of Swagelok VCR
fittings with stainless and silver-plated nickel gaskets is the reference data
point: 31 bar, four full 300 K → 20–30 K cycles with a launch vibration profile
between them, helium mass spectrometry at each step `[NASA-VCR-FITTINGS]`.

**Bolted joints** lose preload, per §2D, and the rules follow: match materials
first; failing that, make the *bolt* contract at least as much as the stack; add
compliance with Belleville washers so the same displacement costs less load
(ΔF = Δ·k_eff); or athermalise the grip with Invar sleeves `[NASA-JWST-PRELOAD]`.

<figure>
<svg viewBox="0 0 660 250" role="img" aria-label="Diagram of an aluminium flange on a stainless steel bolt, comparing the bolt's elastic stretch of 0.069 millimetres with the 0.0436 millimetre differential contraction, showing about half the preload lost">
  <g font-family="system-ui, sans-serif" font-size="13" fill="currentColor">
    <rect x="30" y="60" width="150" height="30" fill="var(--side)" stroke="currentColor"/>
    <rect x="30" y="90" width="150" height="30" fill="var(--side)" stroke="currentColor"/>
    <text x="190" y="80" font-size="13">Al 6061 flanges</text>
    <text x="190" y="110" font-size="13">40 mm grip, 0.389 %</text>
    <rect x="95" y="44" width="20" height="16" fill="currentColor"/>
    <line x1="105" y1="60" x2="105" y2="136" stroke="currentColor" stroke-width="3"/>
    <rect x="95" y="120" width="20" height="16" fill="currentColor"/>
    <text x="30" y="160" font-size="13">SS 304 M10 bolt, 0.280 %</text>
    <text x="30" y="180" font-size="13" fill="var(--muted)">preloaded 20 kN at 293 K</text>

    <text x="360" y="30" font-size="13" fill="var(--muted)">displacement budget at 77 K</text>

    <rect x="360" y="46" width="270" height="20" fill="var(--ok)"/>
    <text x="360" y="82" font-size="13">bolt elastic stretch at 20 kN = 0.0690 mm</text>

    <rect x="360" y="104" width="170" height="20" fill="var(--warn)"/>
    <text x="360" y="140" font-size="13" fill="var(--warn)">differential contraction = 0.0436 mm</text>
    <text x="360" y="158" font-size="13" fill="var(--warn)">= 63 % of the stretch, taken back</text>

    <line x1="360" y1="176" x2="630" y2="176" stroke="var(--muted)" stroke-width="1"/>
    <text x="360" y="198" font-size="13">members shrink 0.1556 mm, bolt only 0.1120 mm</text>
    <text x="360" y="218" font-size="13">→ ΔF ≈ 10.1 kN lost, about half the preload</text>
    <text x="360" y="240" font-size="13" fill="var(--ok)">SS bolts in an SS flange: differential = 0</text>
  </g>
</svg>
<figcaption>Figure 4.3 — The preload exists only as elastic stretch in the bolt. Differential contraction spends 63 % of that stretch before any pressure is applied.</figcaption>
</figure>

---

## 7. Cycling, shock, and cool-down rate

Every cool-down imposes 0.3% strain (metals) to 2% (polymers) on every
constrained dimension, and a much larger *local* strain wherever two materials of
different contraction are joined. That is low-cycle fatigue — few cycles, large
strain each — so the governing mode is strain-controlled crack initiation at
stress concentrations: weld toes, braze fillets, bellows convolution roots,
nozzle penetrations.

**Brazed joints are the classic casualty.** Brazing is chosen precisely for joints
that cannot be welded — dissimilar materials, copper to steel — the same
population with the worst contraction mismatch. Residual stress is locked in as
the joint cools from brazing temperature, before it has ever seen service, and
every cycle reloads it. CERN adds a quieter path: *"a proper cleaning after
brazing is essential to eliminate flux residues, which can provoke corrosion and
possibly cause leaks in the base materials"* `[CERN-CRYOSTAT-DESIGN]`. Welding relocates
the problem into a heat-affected zone, which is why filler and procedure must
keep the joint austenitic.

**Bellows** absorb the mismatch of §2B by design, so they are what fatigues. They
are also dirt traps; debris in the convolutions causes damage during cycling.

**Cool-down rate is a controlled parameter, not a convenience.** Thermal shock
stress goes with the *gradient* through a wall, not the final temperature, so a
slow descent to 20 K can be gentler than a fast one to 77 K. EIGA requires
operating procedures to include *"cooling the enclosure at a rate that does not
create excessive thermal stresses"* `[EIGA-170]`. Setting that rate for a given
facility is work for trained personnel with a written procedure and the
manufacturer's limits in hand.

Cycling also builds internal stress, and in extreme cases plastic deformation, in
polycrystalline materials with anisotropic crystallites — tin, cadmium, zinc,
graphite `[NBS-MONOGRAPH-29]`. **"It passed once" is not evidence a joint will
pass fifty times.**

---

## 8. Frost is not a leak locator

Anything below the ambient dew point condenses water; below 273 K it deposits as
frost, and on a cryogenic surface it keeps growing because it never gets warm
enough to melt off. The temptation is to read frost as a map of the leak. **Treat
that as unreliable — engineering judgment rather than a quotable standard, since
no source consulted here states the caveat in those words:**

- Frost marks where a surface is *cold and reachable by humid air*, which is a
  different question from where the leak is.
- Escaping cold gas runs along pipework, down supports and hangers, and pools at
  the lowest accessible point; frost forms along that path, not at its start.
  Inside insulation the path is longer still — gas migrates through perlite,
  mineral wool or a vacuum annulus and emerges at whatever seam or penetration it
  finds, metres from the defect.
- Frost forms preferentially at **thermal shorts** — supports, brackets, valve
  stems, instrument penetrations — because those are the coldest external surfaces
  whether or not anything is leaking there.
- Frost insulates, so a heavily frosted spot may no longer be the coldest spot.

Two EIGA statements support the conclusion without stating it outright. On
instrumentation: *"cold spots can be very localised and the installed temperature
elements might not detect all leaks, so they should not be seen as a replacement
of regular visual checks."* On sequence: *"It is critical to find all leaks before
insulation is installed because once insulation is installed it will be difficult
to detect or fix the leak."* `[EIGA-170]`

**What actually locates a leak**, conceptually:

- **Helium mass spectrometry** — the reference method, and the one that produces
  a number. Helium is small, inert and essentially absent from ambient air, so
  background is low. Sniffer mode (pressurise, traverse with a probe) or
  vacuum/spray mode (evacuate, spray helium at suspect joints).
- **Pressure decay** — total leakage of the boundary, no location at all. An
  acceptance gate, and often the only practical method for a large volume.
- **Bubble testing at ambient** — soap solution on pressurised joints, warm. Crude
  and least sensitive, but it localises and needs no instrument. EIGA's caution:
  small leaks may not show at once, so leave the fluid on for several minutes.

<div class="box takeaway"><span class="lbl">Rocket engineer takeaway</span>
Find leaks warm, before the insulation goes on, with helium. Use pressure decay
as the acceptance gate. In service, treat frost as a symptom that something is
wrong <em>somewhere</em> — then go and find it properly. Do not chase the frost,
and do not certify a system on the absence of it.
</div>

---

## Checkpoint quiz

<div class="quiz">

1. A colleague sizes a bellows for a 6 m stainless line going to LN₂ using
   α₂₉₃ = 15.1 × 10⁻⁶ K⁻¹ over ΔT = 216 K. Without multiplying, is the answer high
   or low, and why?

2. **Calculation.** A 12 m aluminium 6061 header runs beside a 12 m stainless 316
   header, both anchored at each end, both cooled to 77 K. How much do they fight
   over, in millimetres, and which one pulls harder?

3. Which of these is the *dominant* reason a nitrile O-ring fails to seal at
   77 K? (a) it contracts more than the gland; (b) it is far below its glass
   transition and cannot rebound to maintain contact stress; (c) the gland
   contracts; (d) the bolts lose preload.

4. A cryogenic valve drawing shows: 316 body, 6061 bonnet, carbon steel studs, a
   Viton bonnet seal, a bronze stem bushing. Identify the two most serious
   material problems and say what each will do.

5. During an LN₂ transfer a heavy frost collar appears at a pipe support bracket
   two metres downstream of a flange. What does that tell you, what does it not
   tell you, and what next?

</div>

<details>
<summary>Show answers</summary>

1. **High.** α falls steeply on cooling, so α₂₉₃ × ΔT overshoots: about 19.6 mm
   against the integrated 6000 × 0.00280 = 16.8 mm. The dangerous form of this
   error is not a single length but a *ratio* between two materials, where α₂₉₃
   overstates PTFE-versus-steel by more than 2× (17× against the true 6.9×).

2. **13.1 mm**, the **aluminium** pulling harder.
   Al 12 000 × 0.00389 = 46.68 mm; SS 316 12 000 × 0.00280 = 33.60 mm; difference
   12 000 × 0.00109 = **13.08 mm**. Note 316 uses the same 0.280% as 304 — NIST
   fits one curve for the whole austenitic family.

3. **(b).** All four are true at 77 K and (a) and (c) contribute, but the glass
   transition is disqualifying on its own: even with a perfect fit and zero
   differential, a glassy ring cannot rebound or conform. Nitrile is rated to
   233–225 K — some 150 K above 77 K. (d) is real but belongs to the bolted joint,
   not the seal element.

4. The **carbon steel studs** and the **Viton seal**. Carbon steel is b.c.c. and
   past its transition — A36 goes brittle at −15 °C, and this is −196 °C — so
   those are brittle fasteners in a pressure joint: a fracture hazard, not merely
   a leak. Viton is rated to 247 K and will sit 170 K below it: glassy, and it will
   not seal. Second tier: the **6061 bonnet on a 316 body** is exactly the §2D
   joint and will lose preload, and the **bronze bushing** will bind or loosen
   depending on the direction of the fit. Bronze is *not* a toughness problem —
   copper alloys are f.c.c. and stay ductile.

5. **It tells you** the bracket is a thermal short and the coldest reachable
   external surface nearby, and possibly that cold gas is escaping and tracking
   along the pipe to it. **It does not tell you the leak is at the bracket** — a
   frosted bracket on a well-built system may be entirely normal, and the suspect
   region includes the flange two metres upstream and everything between. Treat it
   as a symptom, secure the system per the facility's procedures, and locate the
   leak properly once warm: helium mass spectrometry on the joints, pressure decay
   to confirm the boundary.

</details>
