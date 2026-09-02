# Module 17 — Manufacturing — Answer Key
Part II · Key to `17-manufacturing.md`

Standing constants: $g_0 = 9.80665$ m/s², $F = 96{,}485$ C/mol. Property values are the
module's §4 typical values unless a problem states otherwise, and they are **process
capability figures, not guarantees**: every one of them is a statement about today's
machines and today's shops, and the module's own instruction is to treat the physics as
durable and the capability numbers as perishable [GradlAM]. Real-engine numbers come from
`reference/engine-database.md` and `reference/_verify-liquid.md` and carry their caveats.
Numerical results were recomputed with `tools/rocket.py`; the registered reruns and the
by-hand cases are in `tools/examples/17.py`.

Equations referenced: **3.1** $\delta_{tip}=F_cL^3/(3EI)$; **3.2**
$\delta\dot m/\dot m = \delta C_d/C_d + 2\,\delta d/d$; **3.3**
$\Delta p_{cap}=2\sigma\cos\theta/\delta$; **3.4** $s = Mj t\eta_c/(nF\rho)$; **3.5**
$t_f=t_0\sin\alpha$; **3.6** $E_v=P_\ell/(v_sh_st_\ell)$; **3.7** Colebrook; **3.8**
Norris, $\mathrm{Nu}/\mathrm{Nu}_s=(f/f_s)^{0.68\mathrm{Pr}^{0.215}}$.

There is **no Colebrook solver in `rocket.py`**. Every friction factor below was obtained
by iterating Eq. 3.7 as $f \leftarrow [-2\log_{10}(\,(k_s/D_h)/3.7 + 2.51/(\mathrm{Re}\sqrt f)\,)]^{-2}$,
which converges from $f=0.02$ in about ten passes. Students who used a Haaland or
Swamee–Jain explicit fit instead will land within 1–2 % and should not be penalised;
students who used the Blasius smooth-pipe law for the *rough* case have made a physics
error, not an arithmetic one (see K4).

**One correction to the module text.** WE4 Step 6 prints
$\sigma_{\dot m_o}/\dot m_o = \sqrt{2.242^2+3^2} = 3.83\ \%$ and hence
$\sigma_{MR}/MR = 5.78\ \%$ and "2.33 times worse". The radical is 3.745 %, so the correct
figures are **3.75 %**, **5.73 %** and **2.31×**. The conclusion — printed metering
orifices are roughly 2.3× worse than drilled ones and should be finish-machined — is
untouched. Accept either number from a student; give credit for noticing.

---

## K1. Problem solutions

### Conceptual

**P1 — braze clearance, both failure directions, and which one X-ray sees.**

*Too wide.* Eq. 3.3 gives $\Delta p_{cap} = 2\sigma\cos\theta/\delta$: capillary driving
pressure falls as $1/\delta$, so a wide gap is filled weakly or not at all, and molten
filler that does enter runs out under gravity before it freezes. Two separate penalties
follow. First, incomplete fill — voids. Second, and less obvious, even a *fully filled*
wide joint is weak, because its strength is then the strength of the **bulk filler alloy**.
A properly thin joint is stronger than bulk filler: the filler layer is constrained
between two much stiffer, much thicker base-metal faces, so it cannot contract laterally
when it is pulled, which puts it in triaxial tension and raises its effective yield
strength well above its uniaxial value. Thickness is what creates the constraint; lose the
thinness and you lose the strength mechanism. In a nickel-filler joint you also lose
**isothermal solidification**: the B/Si melting-point depressant diffuses out of a thin
layer into the base metal in a reasonable hold time, but a thick layer retains its
depressant, stays low-melting, and remelts in service.

*Too narrow.* Capillary pressure is enormous, but so is viscous resistance. Poiseuille
flow between parallel plates gives a fill velocity $\propto \delta^2\Delta p/(\mu L)$, and
with $\Delta p \propto 1/\delta$ the fill rate goes as $\delta$, so the joint fills more
slowly as the gap closes and eventually does not fill within the hold time. Worse, an
oxide film of a few micrometres — which the furnace atmosphere is supposed to reduce — is
a large fraction of a 10 µm gap and physically blocks it, and any trapped gas has nowhere
to vent. The result is the same word, "void", by a different mechanism.

*Which does X-ray catch?* Both are voids, and radiography sees voids in a braze well
because the filler is significantly denser than the base metal, so a filled land and an
unfilled land differ in attenuation. The one X-ray does **not** catch is the *wide but
filled* joint: it is radiographically perfect and mechanically inferior. That defect is
found by dimensional control of fit-up before brazing, by destructive sectioning of
process-control coupons, and — sometimes, too late — by a proof test. So: the fill
failures (both the too-wide and the too-narrow variety) are the X-ray-detectable ones;
the strength failure of an over-wide filled joint is invisible to X-ray and must be
prevented by process control rather than detected by inspection.

**P2 — three objections to brazing a nickel jacket over the lands instead of
electroforming.** Any three of the following, each tied to a mechanism:

1. **390 (or however many) simultaneous capillary joints with a clearance you cannot
   hold.** The clearance that matters is the clearance *at brazing temperature*
   (§3.5.1), and this joint is between a copper alloy ($\alpha \approx 17\times10^{-6}$/K)
   and a nickel alloy ($\approx 13\times10^{-6}$/K) over a contoured surface. Heating to
   ~1,200 K opens a differential of order $\Delta\alpha \cdot \Delta T \cdot R$ — on a
   140 mm radius and a 900 K rise that is roughly 0.5 mm of radial mismatch, an order of
   magnitude outside the 0.025–0.125 mm capillary window. You are asking for a
   uniformly-filled joint under a fit-up you cannot control.
2. **The braze thermal cycle anneals the liner.** Copper alloys are strengthened by cold
   work and by precipitation (Ag and Zr in NARloy-Z, Cr₂Nb in GRCop); a nickel-filler
   braze cycle at 1,300–1,450 K is above the useful ageing and recrystallisation range for
   the liner and will soften it. A low-temperature silver filler avoids that but then has
   no high-temperature strength and, in a hot-wall structure, is the wrong filler
   (§3.5.2). There is no filler that is simultaneously low enough not to hurt the copper
   and capable enough to serve.
3. **Nickel-filler base-metal erosion of a thin copper hot wall.** Ni–Cr–B–Si fillers
   dissolve the base metal; boron in particular diffuses fast and forms brittle borides.
   A 0.9–1.0 mm copper hot wall with a land width of a millimetre has very little material
   to give up, and the erosion is exactly at the land root — the fatigue-critical corner.
4. **You have replaced zero joints with hundreds of leak paths.** The electroform is a
   metallurgically continuous deposit onto the lands; there is no filler, no clearance and
   no capillary requirement, so there is nothing to X-ray for fill (§3.6.2). A brazed
   jacket puts the tube-wall inspection burden of §3.5.4 back into an architecture that
   had eliminated it, and every unfilled land is a land that carries no hoop load, so the
   channel next to it bulges.

Note honestly that the proposal is not *absurd* — the Energomash tradition closes out
milled/corrugated liners by furnace brazing at very large scale (§6.3, tagged [H] from the
open literature, not from the course engine file). The objection is that it requires a
national-scale investment in brazing process capability, which is precisely what the
programme choosing between the two does not have.

**P3 — why 718 dominates.**

718's room-temperature strength (typically 1,100–1,300 MPa UTS aged) is good but not
exceptional; Waspaloy and René 41 are comparable or better hot. What makes 718 the default
is a **processing** property: it can be welded and then aged without cracking, and it
prints without cracking, and those two facts remove the manufacturing constraint from
almost every structural part in an engine.

The two mechanisms:

- **Solidification (hot) cracking**, in the fusion zone. The last liquid to freeze between
  dendrites is a low-melting film; solidification and thermal contraction pull the
  mushy zone apart and the film tears if liquid cannot feed the gap. 718 **does not**
  avoid this — it is a textbook sufferer, because Nb segregates hard to the interdendritic
  liquid and forms a γ/Laves eutectic near 1,150 °C. It is controlled, not escaped: low
  heat input and low dilution (EB and laser rather than TIG), controlled base-metal
  segregation, post-weld homogenisation.
- **Strain-age cracking**, on post-weld heat treatment. Heating a welded
  precipitation-hardened superalloy starts a race between creep relaxation of weld
  residual stress and precipitation of the strengthening phase. If precipitation wins, the
  stress cannot relax and instead tears embrittled HAZ grain boundaries. **This is the one
  718 avoids**, because γ″ (Ni₃Nb) precipitation is *sluggish* — it takes hours at the
  ageing temperature — so the residual stress has relaxed by the time the alloy hardens.
  γ′-strengthened alloys such as Waspaloy and René 41 precipitate fast on heat-up and
  crack.

The corollary a strong answer states: the property is only yours if you keep the right
thermal path. Weld 718 and then choose the wrong post-weld sequence — or age it before
welding, or skip the homogenisation after a high-dilution weld — and you have paid for the
alloy and thrown away the reason you bought it.

**P4 — horizontal rectangular channel in a build.**

The roof of a rectangular channel whose axis is horizontal is a **0° overhang**: a
flat, downward-facing, unsupported span melted directly over loose powder. Two things
go wrong at once. Thermally, powder has perhaps 1 % of solid conductivity, so the melt
pool has nowhere to dump its heat, grows, penetrates deeper than intended, and drags a
large volume of partly sintered powder up with it. Mechanically, the liquid bridge has
no support and surface tension cannot hold a 2 mm flat span, so the roof sags into the
channel — "dross" on the downskin, roughness of 15–40 µm at best (§3.10.3), a droop that
reduces flow area, and in the worst case a collapse that closes the channel. Supports
would fix it and **cannot be removed from inside a closed passage**, so they are not an
option. Below about 40–45° from horizontal you are outside the self-supporting envelope.

Two fixes that preserve flow area:

1. **Change the section to a self-supporting one.** A teardrop (a rectangle capped with a
   ~60° apex) or a diamond/rhombus section has no surface below the critical angle
   anywhere on its perimeter; sized to the same $6\ \mathrm{mm^2}$ it has essentially the
   same $D_h$ and the same flow. This is the standard AM channel section and the reason
   printed chambers do not have rectangular channels.
2. **Reorient the part** so the channel axis runs steeply — near-axial channels in an
   axially built chamber — which makes the "roof" a near-vertical wall rather than a
   horizontal span. Combined with a helical or steeply inclined channel routing, this is
   how real printed chambers keep every internal surface above the critical angle.

(A third, weaker answer: keep the rectangle but split it into two smaller channels so the
unsupported span is shorter. It reduces the droop; it does not remove the 0° overhang, and
it doubles the land count. Half credit.)

**P5 — HIP on two defects.**

- **Investment casting, interdendritic shrinkage porosity 3 mm below the surface:**
  **closed.** The pore is internal and fully enclosed by metal, so the 100–200 MPa of
  argon acts on the part's exterior only; the pressure differential across the pore wall
  drives creep of the surrounding metal at 0.7–0.9 $T_m$, the void collapses, and the two
  now-touching internal surfaces diffusion-bond. Fatigue life rises substantially and, more
  valuably, its scatter falls.
- **L-PBF lack-of-fusion void intersecting an internal channel wall:** **not closed.** The
  void is surface-connected — the "surface" being the channel bore — so the argon simply
  pressurises the void from the inside and the pressure differential is zero. Worse, this
  is the dangerous defect class to begin with: lack-of-fusion voids are planar, crack-like,
  aligned with the layer or hatch geometry, and contain unmelted powder that would not
  bond even if the faces were pressed together.

*The one sentence:* **HIP works on a pressure differential across the void wall, so it
closes only voids that are sealed from the pressurising gas** — which is why the AM
acceptance chain is CT and process control first, HIP second, and never HIP as a cure.

**P6 — flow test versus CT for residual powder.**

Three reasons the flow test wins on this defect in a large part:

1. **CT resolution scales against part size.** Voxel size grows with the object's
   dimension and density; a 0.3 m-diameter chamber gives voxels of hundreds of
   micrometres (§3.12), so a thin sintered powder cake lining a channel wall — a
   200 µm rind that halves the flow area over a metre of run — is at or below resolution
   and is indistinguishable from the channel's own as-built roughness.
2. **The flow test measures the quantity you actually care about.** Residual powder does
   not matter because it is powder; it matters because it restricts coolant. $\dot m$
   versus $\Delta p$ per channel *is* the effective area, integrated over the whole run,
   with no interpretation step. A blocked or half-blocked channel shows up as a high
   $\Delta p$ at flow, immediately and unambiguously.
3. **Cost and coverage.** Every channel can be flowed, in an afternoon, on a bench that
   costs almost nothing. CT of a metre-class part is a specialist, slow, expensive scan
   that may not exist for the part size at all.

*What the flow test misses and CT catches:* anything that does not change the flow
resistance. The canonical example is **internal porosity or a lack-of-fusion plane in the
land or the jacket wall** — a structural defect, a fatigue initiation site and possibly a
future leak path, with zero effect on the $\Delta p$–$\dot m$ curve. Others accepted:
wall-thickness error on the *outside* of the channel; a crack that has not yet opened
through; geometry of a manifold that is oversized rather than blocked. This is exactly why
§3.12 says the plan is a *sequence* of methods, and why AM qualification leans on CT
*plus* witness coupons *plus* flow test rather than any one of them.

**P7 — F-1 film cooling and WE1 Step 6.**

WE1 Step 6 is the general result: at constant tube count and constant flow area, tube
width grows as the local circumference, i.e. as $\sqrt{\varepsilon}$, so tube depth falls
as $1/\sqrt{\varepsilon}$. At $\varepsilon = 16$ the RE-500 tube is a 13.2 mm wide,
0.67 mm deep ribbon behind a 0.3 mm wall — it cannot hold coolant pressure, cannot stay
flat between the lands, and cannot be formed. The regenerative circuit has no geometrically
valid form far down the bell. The F-1 has exactly this problem, at 6.7 MN and a nozzle
whose exit is metres across.

Its answer is the third of WE1's three fixes: **stop cooling regeneratively**. The
gas-generator exhaust — fuel-rich, and therefore relatively cool — is dumped through a
manifold into the nozzle extension as a **film-cooling curtain** on the gas side
[_verify-liquid, F-1 block]. Below that station the wall does not need a coolant circuit,
so the tubes never have to become ribbons, and the visible dark outer sheath of the F-1
plume is that curtain.

*What it would have had to do instead*, taking the alternatives in order:

- **Bifurcate**, splitting each tube where the circumference has doubled. Practically this
  means several hundred additional brazed transitions per chamber, at the worst possible
  place — a Y-joint in a thin-wall tube carrying full coolant pressure. It multiplies
  WE1 Step 8's void count and adds a stress concentration to every branch.
- **Let the coolant velocity fall** and accept a wide shallow tube. Thermally fine — the
  flux out there is two orders of magnitude below the throat — but structurally
  unbuildable at the F-1's scale, because the unsupported flat span between lands grows
  with the tube width.
- **Radiation-cool or ablatively cool the extension.** No refractory shell of that
  diameter existed in 1962, and an ablative liner for 165 s at that flux is very heavy.

So the film-cooled extension is not an efficiency trick; it is the manufacturing escape
from a geometric impossibility, bought with a small $I_{sp}$ loss on the dumped exhaust.
A strong answer also notes that the Merlin 1D Vacuum makes the same escape by a different
route — a radiatively cooled niobium extension [_verify-liquid, Merlin block] — which is
the modern version of the same admission.

**P8 — 2.5 % element spread and 0.1 % engine spread from one tolerance.**

They are answers to two different questions about the same random variable.

Each element's mixture ratio is a ratio of two *individual* orifice flows, so its scatter
is the full per-orifice scatter: 2.5 % (WE4), driven by the $\pm 0.025$ mm hole tolerance
doubled through $A\propto d^2$ (Eq. 3.2) and combined in quadrature with 1.5 % $C_d$
scatter. Nothing averages it. The engine's mixture ratio, by contrast, is a ratio of two
*circuit totals*, and a total of $N$ independent draws has a relative standard deviation
$\sigma/(\bar x\sqrt N)$ — the classic $\sqrt N$ reduction. With $N = 562$ that is
$2.479\%/\sqrt{562} = 0.105\%$. The individual errors have not gone away; they have
cancelled in the sum, which is exactly what "averaging" means.

*Design decisions:*

- **From the engine number (0.1 %):** propellant loading and residuals, and the size of the
  mixture-ratio trim. Since manufacturing contributes only a tenth of a percent, the
  engine-level MR error budget is dominated by other terms (feed-system resistance, valve
  position, pump characteristic, temperature) and the fix is a **trim orifice in the feed
  line set from acceptance-test data**, not tighter drilling. Equivalently: do not spend
  money tightening hole tolerance to improve $I_{sp}$; it will not.
- **From the element number (2.5 %):** wall compatibility and injector acceptance. A
  $\pm3\sigma$ population over 562 elements will contain elements at $MR = 2.48$, and one
  of them sitting in the outer row against a copper wall is an oxidiser-rich streak that
  erodes the liner in a handful of tests. The decisions are therefore **tighter tolerance
  and tighter $C_d$ control on the outer/wall-protection row specifically**, a
  fuel-biased outer row, and **100 % flow-bench acceptance per element or per circuit**
  rather than a statistical sample.

The failure mode of a careless engineer is stated in WE4 Step 5: quoting the
$\sqrt N$-reduced number when asked about wall compatibility.

---

### Calculation

**P9 — channel count and coolant flow at a 320 mm throat.**

Pitch = channel width + land = $1.8 + 1.2 = 3.0$ mm.

$$C_t = \pi D_t = \pi(0.320) = 1.00531\ \mathrm{m} = 1005.31\ \mathrm{mm}$$
$$N = \frac{1005.31}{3.0} = 335.10 \;\Rightarrow\; \mathbf{N = 335\ \text{channels}}$$

Take the floor: 336 channels would need 1008 mm of circumference and there is not that
much. The 0.31 mm left over is distributed into the lands (a 0.0009 mm land increment —
i.e. it disappears into the tolerance) or absorbed by one slightly wide land at the
seam. Reporting 335.1 as an answer is wrong; you cannot machine a tenth of a channel.

Per-channel and total flow area:
$$A_{ch} = 1.8 \times 3.5 = 6.30\ \mathrm{mm^2},\qquad
A_{tot} = 335 \times 6.30 = 2110.5\ \mathrm{mm^2} = 21.105\ \mathrm{cm^2}$$
$$\dot m = \rho V A_{tot} = 810 \times 28 \times 2.1105\times10^{-3}
= \mathbf{47.87\ kg/s}$$

*Sanity check.* 335 channels of 1.8 mm on a 320 mm throat sits between the module's
§4 range (100–450) and just below the RS-25's 390 on a smaller throat, which is the right
relationship: the RS-25 runs at more than twice the chamber pressure and needs a finer,
narrower channel (P15). 47.9 kg/s of RP-1 is a plausible fuel flow for a ~1 MN-class
engine at $MR \approx 2.3$.

**P10 — Reynolds, Prandtl and the two friction factors.**

$$D_h = \frac{2ab}{a+b} = \frac{2(1.8)(3.5)}{1.8+3.5} = \frac{12.6}{5.3}
= \mathbf{2.3774\ mm}$$
$$\mathrm{Re} = \frac{\rho V D_h}{\mu}
= \frac{810 \times 28 \times 2.3774\times10^{-3}}{2.6\times10^{-4}}
= \mathbf{2.074\times10^{5}}$$
$$\mathrm{Pr} = \frac{\mu c_p}{k} = \frac{2.6\times10^{-4}\times 2400}{0.11}
= \mathbf{5.673}$$

Roughness, with $k_s = 5R_a$ [E][A]:

| surface | $R_a$ | $k_s$ | $k_s/D_h$ | $f$ (Colebrook) |
|---|---|---|---|---|
| machined | 1.0 µm | 5 µm | 0.002103 | **0.02457** |
| as-built L-PBF | 18 µm | 90 µm | 0.037857 | **0.06326** |

$$\frac{f_{AM}}{f_{mach}} = \frac{0.06326}{0.02457} = \mathbf{2.575}$$

Both cases are worth reading physically. The machined channel at $k_s/D_h = 0.0021$ is in
the transitional regime — Reynolds number still matters. The as-built channel at
$k_s/D_h = 0.038$ is effectively **fully rough**: the $2.51/(\mathrm{Re}\sqrt f)$ term is
about 5 % of the roughness term, so $f$ is nearly independent of Re, and the pressure drop
scales as $V^2$ with no Reynolds relief at all. That is the important qualitative
difference and a strong answer says so.

*Sanity check.* WE2's 2 mm channel at $R_a$ 0.8 → 12 µm gave a ratio of 2.32; this one is
rougher relative to its diameter and gives 2.58. Same physics, same order.

**P11 — pressure drop and the pump-power penalty.**

$$\frac{L}{D_h}\cdot\frac{\rho V^2}{2}
= \frac{1.1}{2.3774\times10^{-3}} \times \frac{810 \times 28^2}{2}
= 462.70 \times 317{,}520 = 1.46916\times10^{8}\ \mathrm{Pa}$$
$$\Delta p_{mach} = 0.02457 \times 1.46916\times10^{8} = 3.609\times10^{6}\ \mathrm{Pa}
= \mathbf{36.1\ bar}$$
$$\Delta p_{AM} = 0.06326 \times 1.46916\times10^{8} = 9.293\times10^{6}\ \mathrm{Pa}
= \mathbf{92.9\ bar}$$
$$\Delta(\Delta p) = \mathbf{56.8\ bar}$$

Additional pump power (`rocket.pump_power`), at the stated 60 kg/s and $\eta_p = 0.68$:
$$\Delta P = \frac{\dot m\,\Delta(\Delta p)}{\rho\,\eta_p}
= \frac{60 \times 56.84\times10^{5}}{810 \times 0.68}
= 6.19\times10^{5}\ \mathrm{W} = \mathbf{619\ kW}$$

Two remarks a grader should want:

- **The 60 kg/s is not the 47.87 kg/s of P9.** The problem states it, so use it, but note
  the inconsistency: at 60 kg/s through P9's 335 channels the velocity would be 35 m/s,
  not 28, and $\Delta p$ would rise by $(35/28)^2 = 1.56$. An engineer who silently mixes
  a flow rate from one part of the problem with a velocity from another has made the most
  common real-world error in the whole module. Either state the assumption (the 60 kg/s is
  the circuit flow, the 28 m/s the design velocity, so the geometry must differ from P9's)
  or carry both numbers.
- **93 bar of channel $\Delta p$ is not a design, it is a rejection.** On any engine whose
  chamber pressure is of the order of 100 bar, a 93 bar coolant drop puts pump discharge
  near 200 bar and consumes the cycle. This channel must be abrasive-flow-machined, or
  made larger, or the velocity reduced. Recognising that the as-built number is
  *inadmissible* rather than merely large is the point of the problem.

**P12 — Norris enhancement.**

$$n = 0.68\,\mathrm{Pr}^{0.215} = 0.68 \times 5.673^{0.215} = 0.68 \times 1.4523
= \mathbf{0.9876}$$
$$\frac{\mathrm{Nu}_{AM}}{\mathrm{Nu}_{smooth}} = \left(\frac{f_{AM}}{f_{mach}}\right)^{n}
= 2.575^{0.9876} = \mathbf{2.545}$$

Smooth-wall coefficient from Dittus–Boelter (`rocket.dittus_boelter`, heating, $n=0.4$):
$$h_{smooth} = 0.023\,\frac{k}{D_h}\mathrm{Re}^{0.8}\mathrm{Pr}^{0.4}
= 0.023 \times \frac{0.11}{2.3774\times10^{-3}} \times (2.074\times10^5)^{0.8}
\times 5.673^{0.4} = \mathbf{3.819\times10^{4}\ W/(m^2K)}$$
$$h_{AM} = 2.545 \times 3.819\times10^{4} = \mathbf{9.72\times10^{4}\ W/(m^2K)}$$

*Why it is optimistic* — any one of these earns the mark, two is a strong answer:

- **Eq. 3.8 is stated to hold for $f/f_{smooth} \le 3$ and the enhancement saturates
  beyond that**; at 2.58 we are near the top of the range, where the analogy already
  over-predicts because additional roughness adds form drag that raises $f$ and does
  essentially nothing for heat transfer.
- **AM roughness is not sand-grain roughness.** It is irregular, partly re-entrant, and
  includes attached partly-melted particles that are poor conductors welded to the wall by
  a small neck — they add drag but conduct badly, so they are worse than Nikuradse's
  grains at the job we are crediting them for.
- **The measured data disagrees with the analogy in a consistent direction.** §3.10.3:
  real AM channels typically show 1.3–1.8× heat-transfer enhancement while showing the
  *full* friction penalty. The module's design position is explicit — budget all of the
  $\Delta p$, credit at most half the $h$ — which here means using
  $h_{AM} \approx 1.5$–1.8 $\times 3.819\times10^4 \approx 5.7$–$6.9\times10^4$.
- Also acceptable: Dittus–Boelter itself is a ±20–25 % correlation, it assumes fully
  developed flow (a 1.1 m channel at $D_h = 2.4$ mm is 460 diameters, so that one is
  fine), and it ignores the strong property variation of hot RP-1 across the boundary
  layer.

**P13 — L-PBF build time, 8 lasers.**

Per-laser theoretical deposition rate:
$$\dot V_1 = t_\ell h_s v_s = (40\times10^{-6})(120\times10^{-6})(1.1)
= 5.28\times10^{-9}\ \mathrm{m^3/s} = 5.28\ \mathrm{mm^3/s} = 19.01\ \mathrm{cm^3/h}$$
$$\dot V_{8} = 8 \times 19.01 = 152.06\ \mathrm{cm^3/h}$$
$$t_{laser} = \frac{2800}{152.06} = \mathbf{18.41\ h}$$

Recoat:
$$N_{layers} = \frac{0.540}{40\times10^{-6}} = 13{,}500,\qquad
t_{recoat} = 13{,}500 \times 7\ \mathrm{s} = 94{,}500\ \mathrm{s} = \mathbf{26.25\ h}$$

$$T_{build} = 18.41 + 26.25 = \mathbf{44.66\ h}$$

**Recoat-limited**: recoating is 59 % of the build and exposure 41 %, a ratio of 1.43.

Doubling to 16 lasers:
$$t_{laser} = 9.21\ \mathrm{h} \;\Rightarrow\; T_{build} = 9.21 + 26.25
= \mathbf{35.46\ h}$$
a saving of 9.2 h, **21 %**, for twice the optics, twice the calibration burden and a new
set of stitching seams where two lasers meet in the same layer.

*The comment the problem is asking for.* Adding lasers attacks only the exposure term, and
Amdahl's law applies: with 59 % of the build in a term you cannot touch, the asymptotic
best case from infinite lasers is 26.25 h, i.e. a 41 % reduction, and you have already
collected half of that at 16. The levers that work on a recoat-limited build are
**layer thickness** (doubling $t_\ell$ to 80 µm halves the layer count *and* doubles
$\dot V_1$, so it cuts *both* terms — at the price of a coarser downskin, a deeper melt
pool and, by WE2/P11, a pressure-drop penalty in every internal channel), **recoater speed
and dwell**, and **nesting more parts per build** so the fixed recoat cost is amortised
over more volume. Contrast with WE3's 4-laser build, which was 57 % exposure and therefore
*was* worth more lasers. Computing the split first is the whole point.

**P14 — 400-element tolerance stack.**

$$\sigma_d = \frac{0.020}{3} = 0.006667\ \mathrm{mm}$$

Areas go as $d^2$, so relative area uncertainty is twice relative diameter uncertainty
(Eq. 3.2, `rocket.rel_unc_power(rel, 2)`):
$$\frac{\sigma_{A_f}}{A_f} = 2\times\frac{0.006667}{1.20} = 1.111\ \%,\qquad
\frac{\sigma_{A_o}}{A_o} = 2\times\frac{0.006667}{1.70} = 0.784\ \%$$

Quadrature with the 2 % ($1\sigma$) $C_d$ scatter, per circuit:
$$\frac{\sigma_{\dot m_f}}{\dot m_f} = \sqrt{1.111^2+2^2} = 2.288\ \%,\qquad
\frac{\sigma_{\dot m_o}}{\dot m_o} = \sqrt{0.784^2+2^2} = 2.148\ \%$$

Element mixture ratio ($MR = \dot m_o/\dot m_f$, independent numerator and denominator):
$$\boxed{\frac{\sigma_{MR}}{MR} = \sqrt{2.288^2+2.148^2} = \mathbf{3.138\ \%}}$$
$$\sigma_{MR} = 2.10 \times 0.03138 = \mathbf{0.0659}$$
$$\pm3\sigma\ \text{band}: \; 2.10 \pm 0.1977 \;\Rightarrow\; \mathbf{MR \in [1.902,\ 2.298]}$$

Engine level, $N = 400$:
$$\frac{\sigma_{MR,engine}}{MR} = \frac{3.138\ \%}{\sqrt{400}} = \mathbf{0.157\ \%}
\;\Rightarrow\; \sigma_{MR,engine} = \mathbf{0.0033}$$

*Reading.* The $C_d$ scatter, not the hole tolerance, dominates here: 2 % against 1.1 %
and 0.8 %, so it contributes about 77 % and 87 % of the two variances. Tightening the
drilling tolerance from ±0.020 to ±0.010 mm would take the element spread only from
3.14 % to 2.90 % — a 7 % improvement for a large cost increase. The productive attack is on
the **inlet edge condition** that sets $C_d$: a controlled chamfer or radius, a specified
$L/D$, deburring, and abrasive-flow finishing, plus flow-bench sorting. This is the
quantitative version of the module's "a tighter tolerance always gives a better engine"
misconception.

**P15 — RS-25 channel pitch, and which engine is harder.**

From the course engine file: the RS-25 MCC liner has **390 machined coolant channels**
[engine-database.md; _verify-liquid, RS-25 block]. The **262 mm throat diameter is given
by the problem, not by the course file** — the file publishes thrust, $p_c$, expansion
ratio (contested) and mass, not throat diameter — so it must be carried as a problem
datum, not cited as an engine fact.

$$C_t = \pi(0.262) = 0.82310\ \mathrm{m} = 823.10\ \mathrm{mm}$$
$$p = \frac{823.10}{390} = \mathbf{2.111\ mm}$$
$$w = 0.6p = \mathbf{1.267\ mm}\qquad (\text{land } 0.4p = 0.844\ \mathrm{mm})$$

Comparison with P9: 1.80 mm channels on a 3.00 mm pitch versus 1.27 mm on a 2.11 mm
pitch. **The RS-25 has the harder machining job**, and by more than the width ratio
suggests:

- The cutter is **30 % narrower**, and by Eq. 3.1 tool tip deflection goes as $L^3/d^4$.
  At equal depth the RS-25 cutter's slenderness ratio is 1.42× larger and its stiffness
  $1.42^4 = 4.1\times$ lower — so, for the same cutting force, four times the deflection
  and a far worse chatter margin.
- The **land is 0.84 mm**, and that land must survive as the structural connection to an
  electroformed jacket while the ligament between two channels is cycled to plasticity on
  every start (§3.6.4). Thin lands are both harder to machine and less forgiving.
- It is being cut in **NARloy-Z**, a precipitation-strengthened copper alloy — gummy,
  strongly built-up-edge-prone, and easy to smear rather than shear.
- And it is 390 slotting operations plus 390 finishing passes on a contour, not a
  cylinder: the channel depth and width vary axially to follow the heat-flux distribution
  (§3.6.2), so each pass is a 3D toolpath, not a groove.

The physical reason for all of it is $p_c$: 206 bar against whatever P9's engine runs at.
Higher chamber pressure means higher throat heat flux, which means more coolant-side
area per unit wall area, which means finer channels — and finer channels are what makes
the part expensive. Chamber pressure is the master variable for manufacturing difficulty
(§6.6).

**P16 — electroforming time.**

Eq. 3.4, thickness form:
$$\frac{s}{t} = \frac{M\,j\,\eta_c}{n\,F\,\rho}
= \frac{0.05869 \times 250 \times 0.96}{2 \times 96{,}485 \times 8900}
= \frac{14.086}{1.7174\times10^{9}} = 8.202\times10^{-9}\ \mathrm{m/s}$$
$$= 8.202\times10^{-9} \times 86{,}400 = 7.086\times10^{-4}\ \mathrm{m/day}
= \mathbf{0.709\ mm/day}$$
$$t = \frac{3.2}{0.709} = \mathbf{4.52\ days}$$

*Sanity check and the engineering caveat.* §4 gives 0.29–0.86 mm/day over 100–300 A/m²,
and 250 A/m² landing at 0.71 mm/day sits exactly where it should. But 4.52 days is a
**floor, not a schedule**. It assumes the whole cathode sees 250 A/m²; nickel's throwing
power is poor, so the average current density over a contoured, land-and-groove surface
is well below the nominal, and the real tank residence is a week or more (§3.6.1). Nor can
you buy your way out by raising $j$: deposit internal stress and nodule formation rise
with current density, and a high-stress deposit cracks or delaminates. The full-credit
answer gives 4.5 days **and** says it is optimistic and why.

---

### Engineering reasoning

**P17 — $\Delta p$ 18 % high, outlet temperature 40 K low.**

First, read the two observations together, because separately each has many causes and
jointly they have few. Coolant flow and inlet condition are stated identical. A higher
$\Delta p$ at the same flow means a **higher flow resistance**. A lower outlet temperature
at the same flow means **less heat picked up**, i.e. $Q = \dot m c_p \Delta T$ is down. So
the part is simultaneously harder to push through and taking in less heat.

Candidates, ranked:

1. **Reduced flow area — a partial blockage or an undersized channel (most likely).** A
   uniform area reduction raises $\Delta p$ (as $A^{-2}$ at fixed $\dot m$, before the
   friction factor even responds) and, if the *total* flow is held constant while some
   channels are blocked, redistributes flow into the open channels. The heat side is the
   tell: if flow has been diverted away from part of the wall, the fluid that does flow is
   moving faster through fewer channels, and although its local $h$ rises, the total wetted
   area actively cooled falls, and — critically — the *hot* fluid leaving a starved channel
   is a small mass fraction. Bulk mixed outlet temperature falls. Causes: residual sintered
   powder (§3.10.4), an unremoved sacrificial filler, a drooped downskin roof (P4), or a
   channel simply printed undersize. **This is the leading hypothesis and it is a
   burn-through risk**: a starved channel is a hot wall.
2. **A geometric error that is not a blockage: channels systematically undersized.** Same
   $\Delta p$ signature. Heat signature is more ambiguous — a smaller channel raises
   velocity and $h$ — so on its own this predicts $\Delta p$ up and outlet temperature
   *up*, which does not match. Ranks below (1) precisely because it fails the second
   observation.
3. **Roughness far above assumption everywhere.** Raises $f$ (and hence $\Delta p$) *and*
   raises $h$ by the Norris analogy — so it predicts a **higher** outlet temperature, not
   lower. It explains one observation and contradicts the other. Rank low; it is probably
   a contributor to the $\Delta p$ but not the explanation.
4. **The gas side is not what was predicted — a low heat flux.** Off-nominal $MR$, a
   wrong film-coolant split, or an injector producing less near-wall energy release would
   directly lower the outlet temperature. It does not explain the $\Delta p$ at all, so it
   requires a *second* independent fault. Rank low, but do not delete it: it is the one
   explanation under which the hardware is fine.
5. **Instrumentation.** A miscalibrated outlet RTD or a $\Delta p$ transducer referenced
   wrongly. Cheap to eliminate, so eliminate it first even though it ranks low.

**The single discriminating inspection: a per-channel (or per-sector) cold-flow test
against the CFD/empirical prediction, on the same hardware, before anything is
disassembled.** It measures effective area channel by channel and separates the three live
hypotheses in one afternoon: a *uniform* elevation of resistance across all channels means
roughness or systematic undersizing; a *few* channels far off with the rest nominal means
a blockage, and it tells you which ones; *all* channels nominal means the defect is not in
the coolant circuit at all and the problem is gas-side or instrumentation. Follow the flow
test with borescope and, where the section allows, CT of the identified channels.

**P18 — passes X-ray and proof, fails helium leak at $4\times10^{-4}$ std cm³/s.**

The three results are consistent, not contradictory, and the reason is that they are
three different physics.

- **X-ray** sees a *density* difference integrated along the beam. It finds a braze void
  because the filler is much denser than the base metal, so an unfilled land shows. It is
  poor at a **tight planar defect aligned with the beam**, and blind to anything whose
  through-thickness dimension is a small fraction of the section.
- **Proof pressure** demonstrates *structural adequacy at 1.2–1.5× MEOP*. It says nothing
  about whether the part is tight; a part can hold 1.5× MEOP for five minutes with a
  through-path of a few micrometres.
- **Helium mass spectrometry** sees molecular transport through a connected path. It
  resolves to $10^{-9}$ std cm³/s — a hole many orders of magnitude too small to see on
  X-ray, and irrelevant to strength.

So the defect is a **small, tight, through-thickness leak path with negligible volume and
no structural significance**. The realistic candidates, in order:

1. A **micro-crack or pinhole through a tube wall or a braze fillet**, e.g. at a tube-to-
   jacket land where the filler pulled a fine shrinkage crack on cooling, or a
   handling/fixture nick that opened under the proof cycle.
2. **A short unbrazed run in a land that happens to break through to both sides** — too
   small in volume to register radiographically against the surrounding filler.
3. A leak that is **not in the tube bundle at all**: a fitting, a boss weld, a manifold
   joint, an instrumentation port, a seal at the test fixture itself.
4. **Porosity in a weld or a casting in the pressure boundary** that has been connected by
   the proof cycle. Note the honest possibility that **the proof test made it**: proof
   testing a marginal part can turn a subcritical defect into a through-path (§3.12).
   Comparing a pre-proof leak check with this one immediately distinguishes "was there"
   from "we made it".

$4\times10^{-4}$ std cm³/s is a real hole, not a background artefact — three orders above
spec — so it is findable.

**How I would locate it, cheapest first:**

1. **Re-run the leak test with the fixture isolated** and with the He supply valved
   differently, to confirm the leak is in the article and not the test setup. Bag the
   candidate subassemblies separately if the geometry allows (envelope/hood test) to get a
   coarse partition of the leak between bundle, jacket, manifolds and fittings.
2. **Helium sniffer probe traverse** over the pressurised article: pressurise the coolant
   circuit with helium and traverse the outside with a sniffer on a fine grid, slowly —
   this localises a $10^{-4}$-class leak to a few centimetres. The inverse (evacuate the
   circuit, spray helium externally) is the more sensitive "spray probe" version and is
   the right one for a small leak.
3. **Bubble/immersion test** at proof-adjacent pressure with a suitable fluid, for a
   visual fix on the exact land — crude, but $4\times10^{-4}$ std cm³/s is usually
   visible.
4. Once localised: **local high-resolution radiography at several beam angles** (the tight
   planar defect the single production view missed appears when the beam lies in its
   plane), **fluorescent penetrant** on accessible external surfaces, and **borescope**
   inside.
5. Then the disposition: repair braze or weld repair to a qualified procedure, re-proof,
   re-leak-test — and, because a single tight leak in a 168 m-of-land assembly (WE1) is a
   *process* signal rather than a one-off, review the fixturing, atmosphere and cleanliness
   records for that furnace load and leak-check the sister assemblies from it.

**P19 — two suppliers for a 400 kN chamber.**

*The decision.* **Contract Supplier B for the development units, with Supplier A retained
as a funded parallel path through the first hot fire** — and switch the production award
to B only after the qualification gates below are met. If the programme cannot afford a
parallel path, the answer flips to A for the six development chambers and B for
production, because a 14-month lead on the first article is survivable once and fatal
forty times a year.

*The argument.* The decisive fact is the second sentence of the requirement: forty per
year. §3.13 and §6.4 are unambiguous that an electroformed closeout is a **process-rate**
limit, not a queue: at ~0.7 mm/day (P16) a 2–3 mm jacket is a week of tank residence per
part, before throwing-power derating, and you cannot buy your way out with a second shift.
Forty chambers a year through A's process means many parallel tanks, many baths held on
chemistry and stress, and a step change in A's capital and quality system. A's 14-month
lead is the same statement in schedule form. Supplier A is a good answer to "build six
excellent chambers"; it is a poor answer to "build forty a year", and picking a supplier
for the development article that cannot make the production article is how programmes end
up requalifying the chamber twice.

Against that, B's risk is real and specific: **B has never built a part this large**, and
the module is explicit that the qualification argument for large AM parts cannot be
purely part-based because **CT resolution degrades with part size** (§3.12) — a 400 kN
chamber is exactly the size where CT stops reaching. "Witness coupons plus partial CT" is
therefore not a hand-wave; it is genuinely the state of the art. But it is only credible
if the process argument behind it is real.

*What I would require of Supplier B before selection:*

1. **A locked parameter set on a named machine, with machine-to-machine and
   build-to-build data**, not a best-effort development recipe. Powder specification and
   **lot traceability**, with the reuse policy and the oxygen-pickup limit stated, and
   evidence of what happens at the reuse limit.
2. **Witness coupons in the orientations and locations that matter**, including the
   worst-case: a thin curved wall in the middle of a tall build, not just bars at the
   plate corners. Tensile *and* LCF, in the as-post-processed condition, with the
   part-to-part and location-in-build scatter quantified — the module names this as the
   known open issue [GradlAM].
3. **A destructive teardown of a full-size first article.** Sectioned, metallographically
   examined at the throat, the lands and the downskin roofs, with channel dimensions and
   wall thicknesses measured against the model. This is what buys the confidence that CT
   cannot deliver at this size, and it must be budgeted as an article that will be
   destroyed.
4. **A demonstrated powder-removal procedure with per-channel flow verification** against
   prediction on the full-size part, plus the CT that does reach (throat region, injector
   interface, any local feature small enough to resolve).
5. **A post-processing plan in the right order** (§3.10.8): stress relief on the plate,
   removal, powder removal *before* any sintering thermal cycle, HIP, solution/age,
   machining of every interface and the throat, internal finishing where reachable.
   Getting the powder-removal-before-HIP ordering wrong is disqualifying.
6. **Channel roughness measured, not assumed**, on a representative internal passage, with
   the coolant $\Delta p$ prediction re-run on the measured value. P11's arithmetic shows
   how fast an unbudgeted roughness assumption eats a cycle.
7. **A structured build-failure and scrap-rate history**, and a stated position on what
   happens to schedule when a build fails at layer 20,000.

*What retires the largest risk:* item 3, the destructive teardown, because it is the only
evidence that speaks directly to the thing nobody can inspect on the flight article.

**P20 — printed injector, 3 % lower $c^*$ efficiency, identical drawing geometry.**

$\eta_{c^*}$ is a mixing-and-vaporisation efficiency; 3 % is a large loss, well outside
measurement noise. Three distinct manufacturing mechanisms, each with a measurement:

1. **The as-printed orifices are not the drawing's orifices — diameter and $C_d$ scatter
   (§3.10.4, WE4).** As-printed diameter tolerance is ±0.05–0.10 mm against ±0.013–0.025
   drilled, and $C_d$ scatter roughly doubles because the inlet edge condition is
   whatever the melt pool left. WE4's arithmetic (with the correction above) gives a 5.7 %
   element $MR$ standard deviation against 2.5 % drilled. A wide element-to-element $MR$
   distribution is a direct $c^*$ loss even at perfect engine-level $MR$, because $c^*$ is
   concave in $MR$ near the optimum: averaging fuel-rich and oxidiser-rich elements
   produces less $c^*$ than the same propellant burned at uniform $MR$. Every element is
   also mixing at the wrong local ratio.
   **Measurement:** flow-bench every element individually, and build the histogram of
   element effective area ($C_dA$) for each circuit. Compare the standard deviation
   against the drilled injector's. Cut a sample of orifices and measure the actual bore
   and inlet radius metrologically; CT the element internals.
2. **Internal surface roughness has changed the element's internal flow, not just its
   area (§3.10.3).** An as-built $R_a$ of 10–30 µm inside a 1–2 mm orifice or post is a
   relative roughness of 2–5 % — enough to thicken boundary layers, alter the jet's exit
   velocity profile and turbulence level, suppress or trigger hydraulic flip, and degrade
   the jet's coherence and its impingement point. Two impinging jets that fan or
   destabilise early do not mix where the design says they mix, and mixing efficiency is
   most of $\eta_{c^*}$.
   **Measurement:** cold-flow the injector optically — spray-pattern photography, patternator
   collection of the mass distribution across the face, and impingement-point measurement
   against the drilled reference — plus internal $R_a$ measurement on a sectioned element
   and a $C_d$-versus-$\Delta p$ curve looking for a flip discontinuity that the drilled
   unit did not have.
3. **Residual powder or partial blockage in the manifolds, posts or face-cooling
   passages.** The classic printed-injector defect (§3.10.4): partly sintered cake that
   did not come out, or a support witness that was not removed. It reduces effective area
   in some circuits, shifts the circuit-to-circuit balance and the local $MR$
   distribution, and starves some region of the face. Note it also silently changes the
   film/face-coolant split, and film coolant that is not burned is a direct $c^*$ debit.
   **Measurement:** per-circuit *and* per-element flow test against prediction (a low
   effective area localised to a group of elements is diagnostic), CT of the injector —
   which at injector scale *does* resolve to tens of micrometres, unlike a metre-class
   chamber — and borescope of manifolds.

A fourth, worth a mention: **the recast/edge-condition difference if the printed unit's
orifices were EDM-finished** — a 25 µm micro-cracked recast layer changes both effective
diameter and inlet edge (§3.2.3), so an injector "finished to drawing" can still have the
wrong $C_d$. Measurement: metallographic section of a sample hole.

The discriminating logic to state explicitly: mechanism (1) shows up as *scatter* on the
flow bench with the correct mean; mechanism (3) shows up as a *biased mean* localised to
a group; mechanism (2) shows up as neither — the flow bench can be perfect and the spray
still wrong, which is why the optical cold flow is not optional.

---

## K2. Quiz answers with explanations

**Q1 (6) — (c).**
Thin tube walls are the *best* heat-transfer geometry in the module, not a limitation:
$\Delta T = qt/k$ falls with thickness, and a 0.3 mm tube wall gives the smallest
through-wall gradient and hence the smallest thermal stress of any construction here. The
F-1 and the RS-25 nozzle cool very high total heat loads through tube walls perfectly
well. So (c) is not a reason, and it is the answer.
*(a)* is a real reason and the dominant one — WE1 gives 168 m of braze land and ~3.4
expected first-pass voids per chamber, each needing X-ray, location, repair braze and
re-proof. *(b)* is real: a tube's section varies smoothly along its length and cannot be
made deep-and-narrow exactly at the throat and shallow-and-wide in the barrel the way a
milled or printed channel can, so the coolant geometry cannot follow the heat-flux
distribution locally. *(d)* is real: tube-bundle fit-up is hand work and does not scale to
hundreds of engines a year (§3.13, §6.6).

**Q2 (8).**
Two distinct degradations — any two of:

- **Fatigue initiation.** Recast is a resolidified, usually micro-cracked film with
  different composition and hardness from the parent, sitting on a heat-affected zone.
  In a pressure-cycled orifice, and especially in hydrogen (§3.7.2, module 16), those
  micro-cracks are ready-made initiation sites in a component nobody sized for crack
  growth.
- **It changes the flow.** Recast alters the effective diameter and, more importantly, the
  inlet edge condition, which sets $C_d$ and the onset of hydraulic flip (module 07). By
  Eq. 3.2 the flow error is $\delta C_d/C_d + 2\delta d/d$; a 20 µm layer on a 1 mm hole
  is a 4 % diameter change if it is uniform, and worse if it is not — and it is not.
- Also creditable: it is **not dimensionally stable** — recast can spall in service,
  changing $C_d$ mid-life and putting debris into the chamber; and it is metallurgically
  altered material of unknown corrosion/compatibility behaviour in a propellant-wetted
  passage.

Removal process (any one): **abrasive flow machining**, electropolishing, chemical
etching, or a low-energy "trim" EDM finishing pass that reduces rather than removes the
recast. A student who names only "trim settings" gets the mark but should be told the
module's position: leaving 25 µm of cracked recast in a hydrogen-wetted orifice is not an
option.

**Q3 (12).**
$D_h = 1.8$ mm, $\mathrm{Re} = 1.6\times10^5$.
$$k_s = 5\ \mu\mathrm{m}: \; k_s/D_h = 0.002778 \;\Rightarrow\; f = \mathbf{0.0265}$$
$$k_s = 70\ \mu\mathrm{m}: \; k_s/D_h = 0.038889 \;\Rightarrow\; f = \mathbf{0.0640}$$
$$\text{ratio} = \mathbf{2.42}$$
Iterate $f \leftarrow [-2\log_{10}((k_s/D_h)/3.7 + 2.51/(\mathrm{Re}\sqrt f))]^{-2}$ from
$f = 0.02$; three passes gets three figures. Haaland or Swamee–Jain give 0.0264/0.0640 and
are acceptable. Marks: 4 for each friction factor, 2 for the ratio, and deduct for
reporting more than three figures — the $k_s = 5R_a$ bridge is only good to a factor of 2,
so the third figure is already fictional.

**Q4 (8).**
$$\dot V_1 = t_\ell h_s v_s = (30\times10^{-6})(100\times10^{-6})(1.0) = 3.0\ \mathrm{mm^3/s}
= 10.8\ \mathrm{cm^3/h};\qquad \times 4 = 43.2\ \mathrm{cm^3/h}$$
$$t_{laser} = 1900/43.2 = \mathbf{43.98\ h}$$
$$N_{layers} = 0.310/30\times10^{-6} = 10{,}333;\qquad
t_{recoat} = 10{,}333\times 8\ \mathrm{s} = \mathbf{22.96\ h}$$
$$T_{build} = \mathbf{66.9\ h}$$
**Exposure-limited, by a factor of 1.92** (66 % exposure, 34 % recoat). The margin is the
answer the question wants, not just the label: this build *is* worth more lasers — going
to 8 would take it to 22.0 + 23.0 = 45.0 h, a 33 % saving — whereas P13's recoat-limited
build was not. Contrast is the point.

**Q5 (10).**
*Mechanism.* On heating a welded, precipitation-hardenable superalloy to its ageing
temperature, two processes compete. Weld residual stress (which is of yield magnitude) can
relax by creep, and the strengthening phase can precipitate, which raises the flow stress
and stops creep. If precipitation wins the race, the residual stress has nowhere to go and
is dumped into the HAZ grain boundaries — which have been simultaneously embrittled by the
weld thermal cycle (carbide/precipitate reversion and re-precipitation, and segregation of
impurities) — and they crack. The cracking is intergranular, in the HAZ, and appears on
post-weld heat treatment rather than during welding.

*Why 718 resists it (two sentences).* 718's strengthening phase is γ″ (Ni₃Nb), whose
precipitation kinetics are **sluggish** — hours at the ageing temperature rather than
minutes — so residual stress relaxes by creep before the alloy hardens. γ′-strengthened
alloys such as Waspaloy and René 41 precipitate rapidly during the heat-up ramp, harden
before the stress can relax, and crack.

Full marks require naming γ″/Ni₃Nb and the word "sluggish" (or its meaning), and the
race framing. A student who says only "718 is weldable" has not answered the question.

**Q6 (10).**
$$\sigma_d = 0.021/3 = 0.007\ \mathrm{mm};\qquad
\frac{\sigma_A}{A} = 2\times\frac{0.007}{1.4} = \mathbf{1.000\ \%}$$
$$\frac{\sigma_{\dot m}}{\dot m}\bigg|_{element} = \sqrt{1.000^2+1.8^2} = \mathbf{2.06\ \%}$$
$$\frac{\sigma_{\dot m}}{\dot m}\bigg|_{circuit} = \frac{2.06\ \%}{\sqrt{300}}
= \mathbf{0.119\ \%}$$
Marks: 3 for the factor of 2 on the area (Eq. 3.2 — this is the step people drop), 3 for
the quadrature combination, 3 for the $\sqrt N$, 1 for stating that the circuit number is
the one that matters for engine $MR$ and the element number the one that matters for wall
streaks. Note in passing that $C_d$ scatter dominates the element figure (1.8 % against
1.0 %), so this injector's improvement path is edge-condition control, not tighter
drilling.

**Q7 (8).**
**Computed tomography (CT).** It reconstructs a 3D attenuation map, so it is the only
method that sees *inside* a monolithic part with internal channels — measuring channel
dimensions, wall thickness, internal porosity, lack-of-fusion voids and residual powder in
a part that cannot be sectioned and has no accessible internal surface. Nothing else does
this: penetrant needs a surface it can reach and is useless on as-built AM roughness
anyway (the roughness holds penetrant everywhere and produces a solid false indication);
radiography gives one projection through a complex section; ultrasonics needs access,
couplant and a technique, and scatters in textured AM microstructures.

**Principal limitation on large parts: resolution scales with part size and density.**
Voxel size on a 0.3 m-diameter, dense metal part is hundreds of micrometres, so small
defects in large parts remain invisible — and the defects that matter (a lack-of-fusion
plane, a 200 µm powder rind) are exactly that size. The consequence, which a strong answer
states: for large AM parts the qualification argument must become a **process** argument —
locked parameter sets, machine qualification, powder-lot control, witness coupons built
alongside every part — supported by CT where CT reaches, rather than a purely part-based
one. This is an open problem in the field, not a solved one.

**Q8 (12).**
*Route.* **Spin or shear/flow form the shell from C-103 sheet or a preform over a
mandrel, in two or more passes with intermediate stress-relief anneals; trim, weld the
attachment flange (EB or laser), then coat.** A 1.8 m exit at 1.2 mm wall is a large,
thin, axisymmetric shell — the textbook forming part (§3.9). Forming gives thickness
control of a few percent, an axially aligned work-hardened grain structure, a surface good
enough to coat as-formed, low tooling cost, and a cycle time of hours. At 30 units a year
one mandrel and one spinning lathe carry the whole programme. (A welded-from-formed-gores
shell is the acceptable alternative if the diameter exceeds the available blank; it costs
you longitudinal welds in a part that will be coated, which is a coating-integrity risk at
every weld crown.)

*Coating.* A **disilicide diffusion coating** — R512E fused slurry silicide is the
classic — applied as a slurry and diffused at high temperature to form an adherent
(Nb,Ti,Cr)Si₂ layer that protects by growing a thin self-healing glassy silica scale.
Without it, C-103 oxidises catastrophically above ~700 K and would be consumed.

*Dominant failure mode.* **Pesting** — accelerated intergranular oxidation of the niobium
at intermediate temperatures (roughly 800–1,000 K) through a locally damaged or depleted
coating, which can destroy the part quickly. It is dangerous precisely because the coating
is brittle and easily damaged by handling and impact, and because its life is finite
(silicon depletes into the substrate), so a coated extension carries handling and
inspection requirements out of all proportion to how robust it looks. (Accept "spallation
/ coating damage leading to rapid local oxidation" as the same answer.)

*Why not print it.* Three reasons, any two for full marks:

- **It is the module's headline example of where AM is the wrong answer** (§3.10.9): a
  large, thin, geometrically simple shell with no internal passages has none of the
  features AM is good at. There is nothing to consolidate — the part is already one piece
  — so the part-count argument, which is the main AM benefit, pays nothing.
- **Build envelope.** 1.8 m is far outside any L-PBF machine; the frontier is ~1 m class.
  It would have to be segmented and joined, which *adds* joints to a part that had none.
- **Time, cost and properties.** A printed shell of that area would take weeks of machine
  time and cost far more than a spun one, and would come out with worse surface finish,
  worse and more anisotropic grain structure, substantial residual stress, and — for a
  refractory alloy — a printing process that is not mature. DED could deposit it faster
  but at coarse resolution requiring extensive machining of a 1.2 mm wall, which is
  self-defeating.

**Q9 (14).**
$$C_t = \pi(0.160) = 502.65\ \mathrm{mm};\qquad
A_{tot} = \frac{\dot m_f}{\rho V} = \frac{30}{810\times35} = 1.0582\times10^{-3}\
\mathrm{m^2} = 1058.2\ \mathrm{mm^2}$$
For $N$ tubes: pitch $= 502.65/N$, flow width $w = \text{pitch} - 2(0.28)$, tube area
$= 1058.2/N$, depth $h = \text{area}/w$, aspect $= h/w$.

| $N$ | pitch (mm) | $w$ (mm) | $A_{tube}$ (mm²) | $h$ (mm) | $h/w$ |
|---|---|---|---|---|---|
| 160 | 3.142 | 2.582 | 6.614 | 2.562 | 0.99 |
| **180** | **2.793** | **2.233** | **5.879** | **2.633** | **1.18** |
| 200 | 2.513 | 1.953 | 5.291 | 2.709 | 1.39 |
| 220 | 2.285 | 1.725 | 4.810 | 2.789 | 1.62 |

**Answer: $N = 180$ tubes; flow width 2.23 mm; depth 2.63 mm; aspect ratio 1.18.** Any
count from about 161 to 210 satisfies the stated 1.0–1.5 band and should be given full
credit provided the four numbers are self-consistent; 160 (0.99) and 220 (1.62) are
outside it.

Marks: 3 circumference and total area, 4 the pitch-minus-two-walls step (dropping the
$2t_w$ is the standard error and costs the width, the depth and the aspect ratio), 4 a
valid count with its three numbers, 3 for showing the search — a table, or the observation
that aspect ratio rises monotonically with $N$ because width falls faster than area.

*Sanity check to state:* 180 tubes on a 160 mm throat is a 2.8 mm pitch, closely
comparable to WE1's 3.44 mm pitch on a 197 mm throat and to the F-1's 178 tubes on a much
larger throat [_verify-liquid, F-1 block]. An aspect ratio near 1 at the throat is what
real tube-wall chambers show.

**Q10 (12).**
The three wrong components, with reason and alternative:

1. **The nozzle to $\varepsilon = 40$, 2.2 m exit diameter.** *Reason — physical and
   economic.* 2.2 m is far outside any L-PBF envelope (the frontier is ~1 m class,
   §3.10.5), so it must be segmented and joined, which destroys the part-count argument
   that motivated the whole proposal. Even if it fitted, a large thin shell is the
   canonical case where forming beats printing on time, cost, surface and grain structure
   (§3.10.9). *Instead:* spun or flow-formed shell if it is a plain radiation- or
   film-cooled nozzle; **blown-powder DED** as a bimetallic channel-wall nozzle if it must
   be regeneratively cooled (RAMPT, §3.10.6 — noting that RAMPT is an active technology
   programme, not a qualified production process [R]).
2. **The turbine blades.** *Reason — physical, and it does not move.* Turbine life at high
   homologous temperature is creep- and thermal-fatigue-governed, and the property that
   delivers it is the **absence of transverse grain boundaries** — directional
   solidification or single crystal. L-PBF's melt-pool solidification produces fine
   columnar-to-equiaxed grains with many boundaries; you cannot print a single crystal at
   any useful rate (§3.4.2, §3.10.9). *Instead:* **investment casting**, DS or SX with a
   pigtail grain selector, which is the process that *is* the property.
3. **The thrust structure.** *Reason — economic and structural.* Very large primary
   structure is dominated by cost per kilogram of load path, and a printed one is orders
   of magnitude more expensive with worse properties and large residual stress; there are
   no internal passages and no part-count prize worth the price. *Instead:* machined and
   **friction-stir-welded aluminium plate** (or a bolted/welded titanium or steel truss),
   which is cheaper and lighter (§3.7.1, §3.10.9).

The chamber is the one item in the list that *is* right for L-PBF — if it fits the
envelope; at $\varepsilon = 40$ and 2.2 m exit this is a large engine, so even the chamber
is likely to be a printed forward section plus a DED or formed aft section, which is the
module's actual conclusion: modern engines are **process-mixed by design**, and "print the
whole engine" is a slogan, not a plan. Marks: 3 per component (1 identification, 1 reason,
1 alternative), 3 for the framing sentence.

---

## K3. Trade-study reference solution (P21)

### The defensible recommendation: **Option C** — monolithic L-PBF GRCop-42 chamber to $\varepsilon = 4$, plus a DED bimetallic channel-wall nozzle to $\varepsilon = 25$

**The constraints do most of the work, and a strong answer says so before any analysis.**
Two of the four options are eliminated by the stated facts alone:

- **"No existing electroforming or brazing capability in-house."** That kills **A**
  outright: A requires *both* — an electroformed closeout *and* a brazed tube-wall
  nozzle — so it asks a programme with neither capability to stand up two of the most
  process-sensitive, longest-lead, highest-skill operations in the industry, in parallel,
  inside 30 months to first hot fire. Electroforming alone is not a machine you buy: it is
  a bath on continuous chemistry and stress control, a surface-activation process whose
  quality *is* the part (§3.6.2 step 4), and a rate ceiling of ~0.7 mm/day (P16) that no
  amount of money removes.
- **The 30-month schedule** kills A a second time. A 2–3 mm closeout is a week of tank
  residence *per part* at best; six development chambers plus scrap is months of tank time
  before you have learned anything, and every process excursion costs a chamber.

**B** survives the capability screen — a laser-welded superalloy jacket is closer to a
capability a modern shop can buy, and §3.7.1/§6.1's Vulcain 2.1 precedent (90 % fewer
parts, 40 % lower cost, 30 % faster production by laser-welded sandwich redesign
[_verify-liquid, Vulcain block]) shows the route is real. It is the correct **second
choice**. But it keeps a very large amount of machining: a 300 mm-throat GRCop liner with
several hundred contoured milled channels is the highest-touch-time part in the engine
(§3.2.2), and the nozzle is spun *and* channel-milled *and* closed out, on a 1.5 m
diameter part. At 40 engines a year that is a lot of five-axis spindle time and a lot of
welding on a bimetallic joint.

**D** — one DED build for everything — is eliminated on **heat flux and resolution**. At
$p_c = 130$ bar with a 300 mm throat, the throat is the highest-heat-flux, tightest-tolerance,
most life-critical region in the engine, and the channel geometry there must be fine and
locally tailored. DED's bead width is millimetres and its surfaces need machining
(§3.10.6); it is the right tool for the big low-flux nozzle and the wrong one for the
throat. D also concentrates all the programme's risk in the least mature process at the
place where failure is least tolerable.

**C splits the job at the process boundary, which is the module's central lesson**
(§3.10.9, §6.2): put the highest-precision process where the flux is highest and the
cheapest large-scale process where it is lowest.

**Working the numbers the recommendation rests on:**

- **Size.** Throat 300 mm; to $\varepsilon = 4$ the exit diameter is
  $300\sqrt{4} = 600$ mm. That is exactly at the 600 mm-class L-PBF envelope — tight, and
  worth calling out as a risk rather than a comfortable fit. At $\varepsilon = 25$ the exit
  is 1.5 m, which is two and a half times any L-PBF envelope and settles the nozzle
  question without further argument.
- **Heat flux and alloy.** 130 bar LOX/methane needs a copper-alloy liner at the throat.
  GRCop-42 is the printable member of the family and the default for AM chambers
  [GRCop][GradlAM], and methane is a far kinder coolant than hydrogen for wall life.
- **Joint count.** C: **zero** joints inside the chamber, zero inside the nozzle, and
  **one** structural chamber-to-nozzle joint (a machined, bolted or EB-welded flange at
  $\varepsilon = 4$) plus its seal. A: hundreds of braze lands in the nozzle (WE1 scales:
  a 300 mm throat at a ~3.4 mm pitch is ~275 tubes, and to $\varepsilon = 25$ with
  bifurcations that is comfortably 300+ m of braze land per nozzle, i.e. ~6 expected voids
  per unit at WE1 Step 8's rate) plus 390-class electroformed lands in the chamber. C is a
  ten-fold reduction in the things that leak.
- **Rate.** 40/year = one every nine days. WE3's arithmetic scaled to this chamber gives a
  multi-day build, so **one machine is not enough and three to four are** — a capital
  purchase with a known lead time, which is a fundamentally different kind of problem from
  scaling a bath or hiring braze technicians. DED nozzle deposition at 0.5–10 kg/h is
  comfortably inside the rate. C is the only option whose rate scaling is "buy more
  machines".
- **Life.** 25 flights per engine is a low-cycle-fatigue requirement on the liner, not a
  manufacturing one — but it is where the AM risk actually bites, because printed GRCop-42
  LCF properties come from witness coupons, and coupons do not reproduce a thin curved
  wall in the middle of a tall build (§3.12).
- **Schedule.** 30 months to first hot fire. C's long pole is not the build; it is
  **qualification and post-processing** (§3.10.8), which typically exceeds the build in
  calendar time. Budget it explicitly.

### The largest risk, and how to retire it

**The largest risk in C is not the printing. It is that the printed GRCop-42 chamber's
channel geometry and wall life are not what the analysis assumed, and that the part is
too large for CT to prove it.** Two sub-risks, both from §3.10.3–§3.12:

- **Roughness and powder.** As-built $R_a$ of 15–40 µm on downskins takes the coolant
  $\Delta p$ up by a factor of ~2.3–2.6 (WE2, P10–P11), which on a 130 bar engine is a
  cycle-level problem, and residual sintered powder in a channel is a burn-through.
- **Properties and inspection.** A 600 mm-class part is at the size where CT stops
  resolving the defects that matter, so acceptance becomes a process argument.

*Retirement plan, in order:*

1. **Build a full-scale throat-section article early and destroy it.** Section it; measure
   every channel's dimensions, the downskin roof droop, land thickness and internal $R_a$
   against the model; metallography at the throat and the lands. This is the only evidence
   that reaches the thing CT cannot see on the flight part, and it must be scheduled
   inside the first six months, not after the first full build.
2. **Water-flow every channel** on that article and on every production part, against a
   CFD/empirical prediction, and lock the acceptance band. This is the cheapest and highest-
   value test in the module (§7.5) and it catches roughness-off-prediction, blockage,
   droop and undersizing in one measurement.
3. **Measure the roughness, then re-run the pressure budget on the measured value**, and
   qualify an **abrasive-flow-machining** step as a planned recovery: WE2's numbers show
   AFM from $R_a \approx 15$ to 5 µm recovers most of the penalty. Carry the AFM in the
   baseline plan and the schedule, not as a contingency.
4. **Hot-fire a calorimetric or heavily instrumented chamber** to get the real throat flux
   and the real coolant-side $h$ before committing the flight channel design — because the
   flux prediction, not the material, is usually the dominant uncertainty in wall life.
5. **Witness coupons in worst-case orientations and locations** on every build, tensile
   and LCF, with powder-lot and machine traceability; locked parameter set.
6. **Powder removal procedure verified by flow test, executed before any thermal cycle**
   that would sinter the cake in place (§3.10.8, and the ordering is disqualifying if
   wrong).

### The condition that flips the answer to B

**If the destructive teardown or the coupon data shows that printed GRCop-42 cannot meet
the 25-flight LCF requirement at the throat with acceptable margin — or if channel quality
at 600 mm build height proves unrepeatable build-to-build — switch to B.** B keeps a
*wrought or forged* GRCop liner with *machined* channels of known geometry and known
properties, and moves the process risk to a laser-welded jacket, which is a weld
qualification: a well-understood, inspectable, repairable problem with a flown precedent.
The cost is touch time and schedule, and B's nozzle route (spun and channel-milled) is
heavy machining on a 1.5 m part — but it is machining, and machining does not surprise you
in year three.

Two secondary flip conditions worth naming: if the **600 mm envelope cannot actually hold
the $\varepsilon = 4$ section with its manifolds and flanges** (and 600 mm exit diameter
plus manifolds is genuinely marginal), C must either move the split to a smaller
$\varepsilon$ or become B; and if **DED bimetallic channel-wall nozzles do not mature on
the programme's timescale** — they are progress snapshots from an active technology
programme, not a qualified production process [RAMPT][R] — the nozzle half of C has to
fall back to a formed-and-milled or welded-sandwich nozzle, i.e. to B's nozzle, while the
chamber stays printed. Recognising that C's two halves can be traded independently is a
mark of a strong answer.

### Rubric (/100)

**Must contain for a pass (60):**

- **A single clear recommendation**, not a survey.
- **Elimination of A on the stated in-house capability constraint**, explicitly tied to
  the electroforming *rate* (~0.7 mm/day, P16, a process rate that money cannot shorten)
  and/or the 30-month schedule — 10 marks.
- **Elimination of D on heat flux/resolution at the throat**, not merely on "DED is
  immature" — 10 marks.
- **At least three numbers computed, not asserted:** the exit diameter at
  $\varepsilon = 4$ (600 mm) against the 600 mm envelope; a joint-count or braze-land
  estimate for the nozzle options; a rate calculation (40/year → one per nine days → how
  many machines) — 15 marks.
- **A named largest risk with a specific, scheduled retirement action** — 15 marks.
- **A named flip condition to a specific second choice** — 10 marks.

**Strong answer (80+) adds:**

- Treats **C's two halves as independently tradeable**, and says so.
- Uses the **CT-resolution-versus-part-size argument** to explain *why* the qualification
  must be a process argument, rather than just asserting "AM is hard to qualify".
- Carries the **roughness penalty quantitatively** into the pressure budget and puts AFM
  in the baseline plan rather than in contingency.
- Distinguishes **capability you can buy (machines) from capability you must grow (a
  bath, a braze shop, a trained fit-up workforce)** — the real content of the "no in-house
  capability" constraint.
- Notes that **25 flights is an LCF requirement on the liner** and that manufacturing
  choice affects it only through wall geometry, roughness and defect population — i.e.
  connects module 17 to module 16 rather than treating them as separate.
- Labels **RAMPT/DED as a technology programme, not a product**, and carries the [R] tag.
- Observes that **$p_c = 130$ bar is itself a design variable**: if the trade will not
  close, the cheapest fix in the whole study is to buy margin by lowering chamber pressure
  (§6.6, the Merlin argument).

**Loses marks for:**

- Recommending **D** because "one build, zero joints" without confronting the throat flux
  and DED's resolution — this is the seductive wrong answer and should cost most of the
  marks for the recommendation.
- Recommending **A** on performance grounds. The RS-25 architecture is the highest-flux
  chamber ever flown, and a student who selects it here has ignored every stated
  constraint — capability, rate and schedule — in favour of a textbook memory.
- **Choosing on lead time alone**, in either direction.
- Any answer with **no arithmetic**: this is a trade study, and "AM is faster and has
  fewer parts" without a number is a slogan.
- Treating **"40 engines per year" as a purchasing problem** rather than an architectural
  one (§3.13's central claim).
- Proposing to **print the $\varepsilon = 25$ nozzle by L-PBF** — 1.5 m against a ~1 m
  frontier — or to segment it into printed rings without acknowledging that this
  reintroduces exactly the joints the choice was made to avoid.
- **Quoting RAMPT or any vendor AM capability as a qualified, available process**, or
  citing company performance claims for engines not in this course's verification file.
- Naming a risk with **no retirement action**, or a retirement action with no schedule
  position.

---

## K4. Common wrong answers

**"HIP will fix it."**
The single most common error in the AM half of this module. HIP works on a pressure
differential across a void wall, so it closes only *internal* porosity; a lack-of-fusion
plane that reaches a surface, residual powder, a geometric error, a drooped downskin and a
disbond are all untouched. The tell is a student who lists "HIP" as the disposition for
every AM defect in §7.2 without asking whether the defect is surface-connected. The deeper
error is treating post-processing as a repair queue rather than as a designed sequence
whose *order* is load-bearing (powder out before any sintering cycle).

**Using the $\sqrt N$-reduced mixture-ratio number to argue about wall compatibility.**
WE4 Step 5 and P8. The student computes 0.1 % correctly and concludes that hole tolerance
is a solved problem — and then cannot explain the oxidiser streak that ate the liner. It
reveals a failure to ask *what is the random variable and what question am I asking of
it*: the circuit total averages, an individual element does not, and no amount of
averaging protects the piece of wall behind the one hot element.

**Quoting the Blasius or smooth-pipe friction factor for an as-built AM channel.**
Reveals that the student has not noticed that at $k_s/D_h \approx 0.03$ the flow is
essentially fully rough and Reynolds number has stopped mattering. The error is not small:
it under-predicts $\Delta p$ by a factor of 2.3–2.6, which is the difference between a
closed cycle and an open one (P11's 93 bar).

**Taking the Norris heat-transfer credit in full.**
The mirror-image error, and more dangerous because it is optimistic in the direction of
wall temperature. Roughness adds form drag, which raises $f$ and does not raise $h$;
measured AM channels show 1.3–1.8× enhancement against a friction ratio of 2.3+. A
student who sizes a wall on $h_{AM} = 2.5 h_{smooth}$ has designed a chamber that runs
hotter than the analysis says. The module's position — full penalty, half credit — exists
precisely to break this habit.

**"Printed parts have no joints, therefore AM is always better."**
Reveals that the student has counted joints and not counted anything else: build envelope,
powder removal, overhang angle, surface roughness, qualification burden, and the fact that
lack-of-fusion voids are *worse* defects than braze voids because they are planar,
crack-like and aligned. §3.10.9's list exists to be memorised: large thin shells, SX
turbine blades, simple parts at rate, very large primary structure, and anything where the
qualification burden exceeds the design benefit.

**Confusing electroforming with plating.**
A plating is 5–50 µm and protective; an electroform is 1.5–5 mm and structural, takes a
week per part at a rate set by Faraday's law, and fails by internal stress, nodules and
throwing power. The tell is a student who treats the RS-25 closeout as a finishing
operation and is then baffled by the schedule argument in §6.2 and P16.

**Reporting 335.1 channels, or 4.516 days, or $f = 0.06326$ to four figures.**
Reveals no sense of where the numbers come from. You cannot machine a tenth of a channel;
the electroforming rate is derated by throwing power to something a shop measures, not
computes; and the $k_s = 5R_a$ bridge is good to a factor of two, so the third significant
figure in any friction factor here is decoration. This course's numbers are computed
precisely so that the *engineering* judgment about their precision can be made explicitly.

**Blaming the joining process for every chamber failure.**
§3.6.4 is the corrective: the RS-25 liner cracks are a thermal-fatigue and blanching
problem in the *copper*, and the electroformed closeout did its job. The fix was a
materials change (GRCop), not a process change. A student who sees a cracked chamber and
immediately audits the braze or the bond line has skipped the question "which part
actually failed, and under what load?"

**Treating the braze as the structural member.**
The jacket and bands carry hoop load; the braze seals and transfers shear over a large
area, and it is stronger than bulk filler only because it is thin and triaxially
constrained. A student who sizes a tube-wall chamber on filler-alloy shear strength has
both the load path and the metallurgy wrong, and will "improve" the design by making the
joint thicker — which makes it weaker.

**Designing rectangular cooling channels for a printed part.**
Reveals someone who has done the thermal analysis and not the manufacturing one — exactly
the failure the module's opening paragraph describes. The roof of a rectangular channel is
a 0° overhang; supports would fix it and cannot be removed from a closed passage. A
printable part is designed for printing from the first sketch, not adapted afterwards.

**Assuming "seven days to print a chamber" is the lead time.**
WE3 Step 8. Stress relief, plate removal, powder removal and verification, HIP,
solution/age, machining of every interface and the throat, internal finishing, CT, proof
and leak typically exceed the build in calendar time. A programme that budgets machine
hours and not the post-processing tail will be late, and the student who quotes only the
build time has repeated a marketing figure.

**Answering the trade study by ranking the options on lead time.**
Reveals that the student read the constraints as a list rather than as a system. The
30-month schedule, the 40-per-year rate and the absent in-house capability are three
statements of the *same* constraint, and they point at a process whose scaling lever is
buying machines rather than growing a skilled workforce and a chemistry-controlled bath.

**Citing company claims as engine facts.**
Prometheus's €1 M target and 50 % AM content, and every Raptor figure, are claims or
targets for engines that are not qualified in this course's verification file
[_verify-liquid]; Relativity, Launcher and Ursa Major numbers are not in the file at all,
which is why §3.13 quotes the *pattern* and not the numbers. Rutherford's 369 engines
across 47 flights by April 2024 and the RS-25's 390 channels and 1,080-tube nozzle *are*
in the file and can be cited. Knowing which is which is a graded skill in this course, not
a stylistic preference.
