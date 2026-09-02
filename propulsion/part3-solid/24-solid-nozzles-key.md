# Module 24 — Solid Rocket Nozzles — Answer Key
Part III · Key to `24-solid-nozzles.md`

Standing constants: $g_0 = 9.80665$ m/s², $R_u = 8314.46$ J/(kmol·K).
Generic booster where used: $n=0.35$, $\rho_p = 1770$ kg/m³, $c^*=1550$ m/s,
$\gamma=1.18$, $a = 4.243\times10^{-5}$ m·s⁻¹·Pa⁻⁰·³⁵. Numerical results were
recomputed with `tools/rocket.py`; the reruns are in
`tools/examples/24.py`.

---

## K1. Problem solutions

### Conceptual

**C1.** Two independent reasons, and the exception.

*Reason 1 — there is no cold fluid.* Regenerative cooling works because the
coolant is at 100–300 K and is going into the chamber anyway, so the heat is
recycled. A head-end gas bleed in a solid motor is *combustion product at the
flame temperature*, 3400 K. It cannot cool a 2800 K wall; it would heat it.
There is no cold reservoir anywhere in a solid motor after ignition.

*Reason 2 — the mass is charged twice.* Any gas dumped overboard is
propellant that has produced $c^*$ but no useful $C_F$; it is a direct
specific-impulse loss on top of the plumbing and valve mass. In a liquid
engine the coolant returns to the chamber and is not lost.

*The exception that works:* a sacrificial mass flow generated **inside the
wall**, at wall temperature, moving outward into the boundary layer. That is
exactly what a charring ablator does (pyrolysis-gas blowing, §3.2 item 2) and
what silver-infiltrated tungsten did (the silver boils out). The distinction
is that the coolant is *created cold by decomposition at the point of use*,
not routed from a hot reservoir. Credit an answer that identifies
ablation/transpiration as the working version of the idea.

**C2.** In a LOX/LH₂ engine the exhaust is H₂O and H₂ — participating gases,
but at modest partial pressures and with band-limited emission, so the cloud
is optically thin over the chamber dimension and radiation is a few percent
of the throat flux. In a metallized solid, roughly a third of the exhaust mass
(§5.2) is condensed Al₂O₃ droplets at 3000–3400 K. Solid and liquid particles
radiate as a continuum, not in bands, and at a few tens of grams per cubic
metre of droplets the cloud is optically thick over centimetres, so it behaves
as a grey body with $\epsilon_r\approx0.3$–0.9 (Eq. 3.4). At 3400 K that is
2–5 MW/m², which is 20–45 % of the total throat flux.

*Where the fraction is largest:* the **subsonic entrance region and the
submerged-nozzle cavity**. The radiative flux depends on $T^4$ and hardly at
all on velocity, while the convective flux falls with the local $(A_t/A)^{0.9}$
factor of Bartz. Upstream of the throat the gas is still at flame temperature
but slow, so radiation dominates. It is precisely why the submerged cavity —
where almost nothing is moving — is still a severe thermal environment.

**C3.** **Self-limiting, weakly, but it does not change the transport
control.** Both reactions consume heat at the surface (+131 and +172 kJ/mol),
so the surface energy balance is
$q_{conv}+q_{rad} = q_{cond,in} + \dot m'' \Delta H_{rxn} + q_{rerad}$: part
of the arriving heat is spent on the reaction rather than on raising the
surface temperature. This depresses the surface temperature relative to an
inert wall, which would slow a kinetics-controlled reaction.

But the diffusion-limited regime does not care about surface temperature to
first order — the rate is set by how fast H₂O and CO₂ can cross the boundary
layer, and that is a transport quantity. So the endothermicity gives a modest
negative feedback and a cooler surface without changing the $p_c^{0.8}$
scaling. The honest caveat, worth full marks: if the endothermic cooling is
strong enough to pull the surface *below* ~2500 K, the process reverts to
kinetics control and the pressure dependence weakens sharply. Argue either
outcome with the mechanism and you have the answer; assert "self-limiting so
erosion stops" without the transport argument and you do not.

**C4.** Because the nozzle designer owns $A_t$, and $n$ sets how loudly an
error in $A_t$ is heard in $p_c$. From Eq. 3.10, at constant $A_b$,

$$\frac{\Delta p_c}{p_c} = -\frac{1}{1-n}\frac{\Delta A_t}{A_t}$$

At $n=0.35$ the amplification is 1.54; at $n=0.6$ it is 2.5. Since
$\Delta A_t/A_t \approx 2\Delta r_t/r_t$, the full statement is
$\Delta p_c/p_c = -\frac{2}{1-n}\Delta r_t/r_t$ — a factor of about 3 at
$n=0.35$. So both the *machining tolerance* on the as-built throat and the
*erosion allowance* are amplified by $1/(1-n)$, and a high-$n$ propellant
demands a tighter throat tolerance and a lower-erosion insert for the same
delivered-performance dispersion.

**C5.** Three technical arguments for C/C:

1. **Flatter pressure trace.** 2–5× lower recession means the Eq. 3.11 decay is
   2–5× smaller, so the delivered thrust trace stays inside a tighter box —
   which matters directly if the vehicle's max-Q or loads case is set by it.
2. **Less margin, therefore less mass.** A lower and better-characterised
   $\dot s$ lets the liner stack-up (§5.3) shrink; on a booster that is tens
   of kilograms, repeated over every unit of a production run.
3. **Predictability and dispersion.** C/C erosion is more uniform and less
   lot-sensitive than an ablative throat, which narrows the delivered-impulse
   dispersion — often worth more to the guidance and trajectory people than
   the mean performance gain.

*When the ablative wins:* a short burn (10–30 s) where total recession is a
millimetre or two anyway and the pressure decay is negligible; or a
high-rate, cost-driven programme (tactical motors, sounding rockets) where
unit cost and a six-month lead time dominate and the performance is
adequate. Credit also: a programme with no qualified C/C supplier, where the
supply-chain risk (VV22) genuinely exceeds the performance benefit.

**C6.** *Fixed long nozzle:* trades **stowed length and mass** for
**expansion ratio**. Everything is static; there is no new failure mode. If
the vehicle can accommodate the length, this is strictly better than an EEC of
the same deployed $\varepsilon$, because it is lighter and simpler.

*EEC:* trades **a one-shot deployment mechanism, its mass and its reliability**
for the ability to have a high deployed $\varepsilon$ while occupying a short
stowed length. It only makes sense when stowed length is a hard constraint
(silo, submarine tube, payload bay, interstage).

*Why the reliability argument applies only to the EEC:* the deployment is in
series with the mission and cannot be tested on the flight article. A fixed
nozzle either works or was found broken before flight; an EEC introduces a
mechanism that must actuate once, correctly, in flight, after launch loads and
possibly years of storage — a new single-point failure. That is the entire
objection, and it is why EECs appear only where the length constraint is
genuinely binding.

**C7.** *Why slag collects:* the submerged nozzle creates an annular cavity
between the nozzle's outer surface and the aft dome. Alumina droplets have
$\mathrm{Stk}\gtrsim1$ where the flow turns into the nozzle (Eq. 3.5), so they
fail to follow the streamlines, impinge on cavity surfaces, coalesce into a
liquid film, and — with no fast flow to sweep the cavity, and with the vehicle
acceleration and any spin pushing the liquid outward and aft — pool there.

Three degradations: (i) **inert mass** carried for the whole burn and often
through separation, directly reducing $\lambda_m$ and $\Delta v$;
(ii) **unpredictable mass and mass distribution**, which corrupts the
propellant-mass bookkeeping, the tail-off prediction and the c.g., and shows
up as flight-to-flight dispersion; (iii) **transients** — sloshing or ejection
of retained slag produces thrust and pressure spikes, and a slug leaving
through the throat can locally damage the insert. Credit also the thermal
argument: a pool of 2300 K liquid alumina sitting against the aft dome
insulation is a heat load that the gas-phase analysis does not contain.

**C8.** **The longer one delivers higher $I_{sp}$**, because of two-phase
flow. Friction and divergence arguments say "shorter is better" for a gas, and
for a pure gas the shorter nozzle would indeed win slightly. But a third of the
exhaust mass is condensed alumina that can only be accelerated by drag, and
drag needs *residence time*: from §5.2, the exit velocity lag is
$\Delta u \approx \tau_v\,du_g/dt$, and $du_g/dt$ scales as $1/L$ at fixed
velocity change. Shortening the nozzle from 1.6 m to 0.6 m roughly triples the
acceleration and therefore roughly triples the lag; the §5.2 sensitivity table
shows the total two-phase loss rising from about 1 % to about 3 % for a 0.4 m
nozzle at 5 µm. That is far larger than any friction difference (a few tenths
of a percent). The correct one-line answer: **in a metallized solid, nozzle
length buys particle acceleration, and that buys more than friction costs.**

### Calculation

**N1.** $x \equiv 1 + \dot s t/r_{t0} = 1 + (1.5\times10^{-4})(90)/0.150
= 1.090$.

- Throat area growth: $x^2 = 1.1881$, i.e. **+18.8 %**. (Large — a small
  throat eroding fast.)
- Pressure: $p_c(90)/p_c(0) = x^{-2/(1-n)} = 1.090^{-3.0769} = \mathbf{0.767}$,
  a **23.3 % loss**.
- Thrust: $F(90)/F(0) = x^{-2n/(1-n)} = 1.090^{-1.0769} = \mathbf{0.911}$, an
  **8.9 % loss**.
- Recovery: the fractional thrust loss is $8.9/23.3 = 38$ % of the fractional
  pressure loss, i.e. **the growing throat gives back 62 % of the pressure
  loss**. For small erosion the two expansions are
  $1-p_c\text{ ratio}\to 2\epsilon/(1-n)$ and
  $1-F\text{ ratio}\to 2n\epsilon/(1-n)$ with $\epsilon = \dot s t/r_{t0}$,
  so the ratio tends to $n$ itself (0.35 here); at 9 % erosion it has drifted
  to 0.38 because the relation is only linear for small $\epsilon$. Full marks
  for either the numeric 38 % or the observation that the limit is $n$.

**N2.** Require $p_c(90)/p_c(0) \ge 0.95$:

$$x^{-2/(1-n)} = 0.95 \;\Rightarrow\; x = 0.95^{-(1-n)/2} = 0.95^{-0.325} = 1.01681$$

$$\Delta r_t = (x-1)r_{t0} = 0.01681 \times 0.150 = 2.52\ \mathrm{mm}$$
$$\dot s = \frac{2.52\ \mathrm{mm}}{90\ \mathrm{s}} = \mathbf{0.028\ mm/s}$$

That is **below the bottom of the 3D/4D carbon–carbon band (0.02–0.10 mm/s)**
and far below any ablative. So: you must specify a 3D or 4D C/C insert, *and*
you are asking it to perform at the best end of its published range, which
means you cannot meet this requirement by material selection alone with any
confidence. The engineering answer is that a 5 % pressure-decay requirement on
a 0.150 m throat for 90 s is aggressive and should be renegotiated, or the
throat made larger (the recession is absolute, so $\dot s t/r_{t0}$ falls as
$r_{t0}$ grows — doubling the throat radius halves the pressure decay for the
same insert). Full marks require noticing that last point.

**N3.** Condensed fraction:

$$X = 0.20\times\frac{101.96}{2(26.98)} = 0.20\times1.8896 = \mathbf{0.378}$$

Kinematics: $\tau_{v,Stokes} = \rho_p d_p^2/(18\mu) =
3000(8\times10^{-6})^2/(18\times8.5\times10^{-5}) = 1.255\times10^{-4}$ s.
$u_{mean} = 1825$ m/s, $t_{res} = 1.2/1825 = 6.58\times10^{-4}$ s,
$du_g/dt = 1550/6.58\times10^{-4} = 2.357\times10^{6}$ m/s².

Stokes alone would give $\Delta u = 296$ m/s and hence
$\mathrm{Re}_p = \rho_g\Delta u\,d_p/\mu = 69.6$ — **Stokes drag is badly
invalid** (it requires $\mathrm{Re}_p \lesssim 1$). Apply
$\tau_v = \tau_{v,Stokes}/(1+0.15\mathrm{Re}_p^{0.687})$ and iterate to
convergence:

$$\Delta u = 119\ \mathrm{m/s},\quad \mathrm{Re}_p = 28.0,\quad
\text{correction } 2.48,\quad \tau_v = 5.06\times10^{-5}\ \mathrm{s}$$

$$\frac{\Delta u}{u_e} = 4.58\ \%,\qquad
\frac{\Delta I_{sp}}{I_{sp}}\bigg|_{vel} = X\frac{\Delta u}{u_e}
= 0.378\times0.0458 = \mathbf{1.73\ \%}$$

Marking: the required statement is that Stokes is invalid at
$\mathrm{Re}_p\approx28$–70 and that a drag correction (Schiller–Naumann or
equivalent) must be applied and iterated. A student who reports 296 m/s and
4.4 % loss without checking $\mathrm{Re}_p$ has made the standard error and
loses half the marks. Note also that $\Delta u/u_e = 4.6$ % is pushing the
quasi-steady-lag assumption, so this answer should be quoted as an estimate
with a stated direction of error (the true lag is somewhat smaller because the
particle does not start from rest at the throat with zero lag).

**N4.** Stack-up.

- Recession: $t_{rec} = 1.4\times(1.2\times10^{-4})\times95 = 15.96$ mm.
- Insulation: $(420-290)/(900-290) = 0.2131 = \mathrm{erfc}(\eta)
  \Rightarrow \eta = 0.8804$. $t = 95+90 = 185$ s,
  $\sqrt{\alpha t} = \sqrt{(2.0\times10^{-7})(185)} = 6.083$ mm, so
  $\delta_{th} = 2(0.8804)(6.083) = 10.71$ mm.
- Structural: 2.00 mm.

$$t_{liner} = 15.96 + 10.71 + 2.00 = 28.67\ \mathrm{mm} \Rightarrow
\textbf{specify 29 mm}$$

Comment worth marks: silica's higher diffusivity ($2.0\times10^{-7}$ vs
$1.3\times10^{-7}$ for CCP) makes the *thermal* term worse, not better, per
unit thickness — silica-phenolic's advantage is cost and the lower flux at an
aft station, not a magic insulating property. Here recession is 56 % of the
total and insulation 37 %.

**N5.** $T_{aw} = 3400\times(1+0.9\times0.09\times1)/(1+0.09) = 3372$ K.

At $p_c = 6.0$ MPa: $h_g = 1.190\times10^{4}$ W/(m²·K),
$q_{conv} = 1.190\times10^{4}(3372-2800) = 6.81$ MW/m².
At $p_c = 12.0$ MPa: $h_g = 2.072\times10^{4}$, $q_{conv} = 11.85$ MW/m².
Ratio of convective terms $= 1.741 = 2^{0.8}$ exactly, as Bartz requires.

Radiative term (both pressures):
$q_{rad} = 0.5\times5.670\times10^{-8}(3400^4-2800^4) = 2.05$ MW/m².

| $p_c$ | $q_{conv}$ | $q_{rad}$ | total |
|---|---|---|---|
| 6.0 MPa | 6.81 | 2.05 | **8.85 MW/m²** |
| 12.0 MPa | 11.85 | 2.05 | **13.90 MW/m²** |

Total flux ratio $= 13.90/8.85 = \mathbf{1.57}$, **not** $2^{0.8}=1.74$. The
reason: **the radiative term does not scale with pressure.** Eq. 3.4 depends
on temperature and cloud emissivity, and the flame temperature and composition
of a given propellant are almost pressure-independent over this range, so
$q_{rad}$ is a fixed additive term that dilutes the convective scaling. Its
share falls from 23 % to 15 % as pressure doubles. Marks are for identifying
that a constant additive term breaks a power law, not for the arithmetic.

**N6.** $C_{F,vac}(\varepsilon = 70.4,\gamma=1.18) = 1.9538$.

$$c^*_{implied} = \frac{I_{sp}g_0}{C_F} = \frac{292.2\times9.80665}{1.9538}
= \mathbf{1467\ m/s}$$

An AP/Al/HTPB propellant has a *theoretical* $c^*$ of roughly 1550–1620 m/s,
and a delivered $c^*$ efficiency of 0.95–0.98 gives 1480–1590 m/s. The implied
1467 m/s is at or slightly below the bottom of that range. The interpretation:
the real $C_F$ must be **below** the ideal one-dimensional value, so the real
$c^*$ needed to make 292.2 s is higher than 1467 m/s. Backing out, if the
$C_F$ efficiency is 0.96 (two-phase ~1–2 %, divergence ~1 %, boundary
layer ~0.5 %), the implied $c^*$ becomes $1467/0.96 = 1528$ m/s — squarely
plausible. So the comparison quantifies the combined nozzle losses at roughly
**4 %** for this motor, which is the right order for a metallized solid at
high area ratio. Full marks require the recognition that the discrepancy *is*
the loss measurement, not an error.

**N7.** $\delta_{max} = M_{act}/k_s$:

- +25 °C: $6.0\times10^{4}/2.4\times10^{5} = 0.250$ rad $= \mathbf{14.3°}$.
- −20 °C: $6.0\times10^{4}/4.1\times10^{5} = 0.1463$ rad $= \mathbf{8.38°}$.

The ±8° requirement is **met at both temperatures — but with only 4.8 % margin
at −20 °C**, against a spring rate that is itself a measured quantity with
scatter, and neglecting damping ($c\dot\delta$, which matters at the required
slew rate) and the pressure-dependent offset torque $M_{offset}$ of Eq. 3.17.
[J] A responsible answer states that this design does **not** close: once
damping and offset are included, the cold case will not make 8°.

Two fixes that are not "a bigger actuator": (i) **change the elastomer** to
one with a lower glass-transition temperature so $k_s(-20°C)$ falls — this is
the standard solution and it is a materials, not a mechanism, change;
(ii) **control the motor's temperature** — a thermal blanket, a conditioned
launcher, or a narrowed operational temperature limit, which is how many
stored systems actually meet their TVC requirement. Credit also: reduce the
bearing's shear stiffness by changing the shim/elastomer layer count and
thickness ratio (more, thinner elastomer layers lowers shear stiffness at
constant compressive stiffness), or reduce the deflection requirement by
adding aerodynamic or reaction-control authority elsewhere.

**N8.** $C_{F,SL}(\varepsilon=7.72, p_c=6.25$ MPa$, p_a=101.325$ kPa$,
\gamma=1.18) = 1.5937$.

$$A_t = \frac{F}{p_c C_F} = \frac{12.5\times10^{6}}{(6.25\times10^{6})(1.5937)}
= 1.255\ \mathrm{m^2} \Rightarrow D_t = 1.26\ \mathrm{m}$$
$$D_e = D_t\sqrt{\varepsilon} = 1.26\sqrt{7.72} = \mathbf{3.51\ m}$$

Two reasons not to quote this as "the RSRM throat diameter":

1. **The inputs are mismatched in provenance and qualifier.** The 12.5 MN
   figure is a *liftoff* sea-level thrust `/motor` (conf B) and the 6.25 MPa is
   a *nominal* chamber pressure (conf B), but the two are not necessarily
   simultaneous — the motor peaks near 14.7 MN and ~6.4 MPa at about t+20 s,
   which yields $A_t = 1.44$ m², $D_t = 1.35$ m instead. The answer moves 7 %
   depending on which published pair you use.
2. **$\varepsilon = 7.72$ is conf C**, and the derived $A_t$ is sensitive to it
   through $C_F$; the same source set also gives 7.16 for later motors.
   Building a "measurement" on a conf-C input and quoting it to three figures
   is exactly the error this course exists to prevent. It is a *consistency
   check*, not a datum. (Credit also: this is an ideal one-dimensional $C_F$
   with no two-phase, divergence, boundary-layer or submergence loss; the real
   $C_F$ is 3–5 % lower, so the real $A_t$ is 3–5 % larger.)

### Engineering reasoning

**R1.** *Diagnosis: throat erosion, thermochemically dominated, with an intact
insert — i.e. the design working as intended but at a higher rate than
predicted, or exactly as predicted if the prediction included it.*

The signature is the *ratio* of the two sags. Eq. 3.11 and 3.12 say pressure
falls as $x^{-2/(1-n)}$ and thrust as $x^{-2n/(1-n)}$, so for any $n<1$ the
thrust sag must be **smaller** than the pressure sag, in a ratio that
approaches $n$ for small erosion. Here $5/14 = 0.36$, consistent with an
$n\approx0.35$ propellant. The 4 s burn-time extension is the third leg of the
same story: $\dot m \propto p_cA_t$ falls, so the web takes longer. Nothing
about a propellant anomaly, an insulation failure or a grain-geometry error
produces that particular three-way signature — a low-burn-rate propellant lot
would lower pressure *and* thrust together and lengthen the burn much more.

*What to compute:* the **post-fire throat area** (CMM or bore gauge), and from
it $x = \sqrt{A_{t,post}/A_{t,pre}}$. Prediction: from
$p_c$ ratio $= 0.86 = x^{-2/0.65}$, $x = 1.0485$, so expect a **4.9 % increase
in throat radius, i.e. 9.9 % in throat area**. If the measured area growth is
close to 10 %, the diagnosis is confirmed and the erosion model needs
recalibration (or the prediction was right and the grain neutrality assumption
was not). If the measured growth is much less than 10 %, then something else
is lowering $p_c$ — a low burn-rate lot, a cooler propellant temperature, or a
leak — and you have a different problem.

**R2.** *What changed:* an insert lot with worse thermal-shock resistance
(coarser grain, higher porosity, a different billet orientation, or a cure/
graphitisation deviation), producing a **radial thermal-shock crack at
ignition**.

*Mechanism:* the ignition transient imposes a >2000 K gradient across a few
millimetres in tens of milliseconds; the resulting hoop stress exceeds the
tensile strength, and the insert cracks radially. The step at $t=2$ s is the
crack opening and instantaneously increasing the effective flow area (and/or
relieving a stress state that had the insert slightly undersized). The rougher
trace afterwards is flow through and around the crack, local hot-gas
penetration behind the insert, and progressive mechanical loss of material at
the crack faces.

*Fix:* a material with a better thermal-shock figure of merit
$\sigma k/(E\alpha_{th})$ — 3D C/C rather than bulk graphite is the direct
answer; failing that, a lower ignition pressurisation rate (igniter resizing),
a segmented insert with compliant interfaces so the hoop stress cannot build,
or a pre-heat. Lot-level acceptance testing on thermal-shock-relevant
properties, not just density and dimensions.

*Why it is more dangerous than R1 despite similar average pressures:* R1 is a
**smooth, predictable, bounded** process whose worst outcome is a
performance dispersion. R2 is a **crack**, and a crack is a path. Hot,
particle-laden 3400 K gas behind the insert attacks the backup insulation and
the structural shell, which is a **burn-through and case-failure** mode, not a
performance mode. It is also progressive and cannot be bounded by an erosion
model, and it is lot-dependent, so the next unit may be worse. Average
performance is a bad summary statistic for a failure whose consequence is
binary.

**R3.** *Case for A (16 % Al, $n=0.30$):*
- Lower $n$ means the erosion-to-pressure amplification $1/(1-n)$ is 1.43
  instead of 1.82 — a 21 % smaller pressure excursion for the same throat
  growth, and a smaller pressure response to every other perturbation
  (temperature, throat tolerance, grain dispersion) as well.
- Lower condensed fraction ($X = 0.302$ vs 0.378) means smaller two-phase
  losses, less slag, less impingement erosion at the nose and entrance.

*Case for B (20 % Al, $n=0.45$):*
- The higher aluminium loading scavenges more H₂O and CO₂, lowering
  $\chi_{ox}$ and therefore lowering the **thermochemical** recession rate of
  the ablative throat (Eq. 3.8) — directly attacking the problem, which
  matters most for an ablative throat.
- Higher density impulse, better volumetric loading.

*Recommendation: A.* [J] The decisive argument is that the two effects are not
symmetric in risk. The $n$ penalty of B is a *certain, calculable*
amplification of every pressure perturbation the motor will ever see, worth a
21 % larger pressure excursion for the same erosion, and it also degrades
combustion stability margin and temperature sensitivity
($\pi_K = \sigma_p/(1-n)$ from Module 20 goes up by the same factor). The
erosion benefit of B is *real but uncertain* — the $\chi_{ox}$ reduction from
16 % to 20 % Al is a modest change in exhaust composition, its effect on
$\dot s$ is empirical and motor-specific, and it is partly cancelled by
increased particle impingement on the same ablative throat and by larger
two-phase losses. Trading a certain amplification penalty for an uncertain
erosion benefit is the wrong direction.

*What would change the recommendation:* subscale erosion-motor data showing a
large (>30 %) recession reduction at 20 % Al for this specific propellant and
insert, combined with a stage design that is volume-limited rather than
mass-limited (making the density impulse decisive). Credit any answer that
recommends B **with** that evidentiary condition attached.

**R4.** *The pattern.* Three distinct observations, three different
mechanisms:

- **Uniform throat erosion** → **thermochemical**, diffusion-limited attack.
  It is axisymmetric because the boundary layer and the species transport are
  axisymmetric. This is the expected, designed-for wear.
- **One-sided deep gouging on the nose ring** → **particle impingement**. The
  nose ring is where the flow turns hardest into a submerged nozzle, so
  $\mathrm{Stk}\gtrsim1$ droplets fly straight and hit it (Eq. 3.5). The
  *one-sidedness* is the diagnostic: on a spin-stabilised stage the
  centrifugal field drives the condensed phase radially outward, and any
  small asymmetry — a grain-casting eccentricity, a cocked nozzle, a residual
  lateral acceleration — becomes a persistent preferential impingement
  direction in the rotating frame.
- **40 kg alumina deposit in the aft cavity** → **slag retention**, the same
  particle dynamics ending in a pool rather than on a wall; spin makes it much
  worse by holding the liquid film against the outer cavity wall where it
  cannot be swept out.

Note the erosion mechanisms are cleanly separable here precisely *because* the
throat is uniform: a thermochemical model alone would predict the throat
correctly and the nose ring not at all, which is the classic evidence that a
second mechanism is present.

*Two design changes:* (i) thicken and upgrade the nose ring — a 3D C/C or a
much thicker carbon-cloth-phenolic nose ring with the ply angle set for the
impingement direction — and soften the turning geometry so fewer particles
reach $\mathrm{Stk}>1$ at the wall; (ii) attack the cavity: reshape it so
liquid drains into the flow rather than pooling, reduce the submergence depth,
or reduce the spin rate. Credit also: reduce aluminium loading or shift the
particle size distribution downward (a combustion-side change), and
re-examine grain concentricity.

**R5.** Second-order consequences of swapping an ablative throat for 3D C/C at
constant everything else:

1. **Chamber pressure rises and stays higher through the burn.** Less throat
   growth means less pressure decay (Eq. 3.11). The *mean* operating pressure
   over the burn goes up by several percent even with the same initial
   $A_t$.
2. **The case sees a higher pressure–time integral**, and the burst-margin
   case must be re-checked. If the case was qualified against the old (sagging)
   trace, the new trace may exceed the qualification envelope.
3. **Burn time shortens.** Higher mean pressure means higher mean burn rate
   ($r_b = ap_c^n$), so the web burns faster and the thrust trace is shorter
   and taller — a different loads case for the vehicle, and a different
   trajectory.
4. **$\varepsilon$ stays higher for longer**, so mean $C_F$ and delivered
   $I_{sp}$ improve slightly (the reverse of the 1.4 s loss in §5.1).
5. **Thermal environment of the surrounding parts changes.** C/C conducts far
   better than a char layer and does not blow pyrolysis gas into the boundary
   layer; the backup insulation and the structural shell behind the insert
   therefore see a *higher* heat load and may need to be re-sized. This is the
   trap in "keep everything else identical".
6. **Interface and thermal-expansion mismatch.** A C/C insert has a different
   $\alpha_{th}$ and stiffness from the ablative it replaces; the retention
   scheme and the interfaces must be redesigned or they will gap or crush.
7. Programmatic: lead time, supplier qualification, and a full requalification
   because the throat is flight-critical.

*Which most likely forces a redesign elsewhere:* [J] **item 2/3 — the case and
the vehicle loads.** Raising the mean chamber pressure and shortening the burn
changes the thrust trace, which is a vehicle-level input (max-Q, structural
loads, staging, guidance). A qualified case has a burst margin against a
specific pressure history. Recovering "a bit of performance" from the nozzle
is very likely to force either a case requalification or a compensating
increase in the initial throat area — and if you enlarge $A_t$ to hold the old
pressure trace, you give back part of the performance you came for. That
circularity is the point of the question: **you cannot change the throat of a
qualified motor without changing the motor.**

---

## K2. Quiz answers with explanations

**Q1 (8 pts) — (c) −6.6 %** (computed: −6.4 %, the nearest option).
$x = 1.02$, exponent $-2/(1-n) = -2/0.6 = -3.333$, so
$1.02^{-3.333} = 0.936$.
(a) −2 % is the answer of someone applying the radius change directly with no
amplification. (b) −4 % is the *area* change with no $1/(1-n)$ amplification.
(d) −13 % doubles the exponent — a common slip from using $2/(1-n)$ on the
area rather than the radius, i.e. applying the factor twice.

**Q2 (8 pts) — (b).**
(a) is wrong because there is essentially no free O₂ in a fuel-rich
AP/Al/HTPB exhaust; the oxidising species are H₂O, CO₂ and OH.
(c) is wrong because above ~2500 K the surface kinetics outrun the transport,
so the process is transport- (diffusion-) limited and inherits Bartz's
$p_c^{0.8}$; the Arrhenius form applies only in the low-temperature
kinetics-limited regime.
(d) is wrong in both directions: aluminium loading changes the exhaust
composition (scavenging H₂O and CO₂, reducing $\chi_{ox}$ and thermochemical
erosion) and changes the condensed fraction (increasing impingement erosion).

**Q3 (10 pts).** Each Al atom (26.98 kg/kmol) becomes half a mole of Al₂O₃
(101.96 kg/kmol), so the mass multiplier is $101.96/(2\times26.98) = 1.8896$:

$$X = 0.160\times1.8896 = \mathbf{0.302}$$

Full marks require the factor of 2 in the denominator (two Al per Al₂O₃).
Writing $101.96/26.98 = 3.78$ is the standard error and gives a physically
impossible $X = 0.605$ — a student who does not notice that 60 % condensed
phase is absurd has stopped thinking. Assume complete combustion of the
aluminium; note in passing that a few percent of the aluminium typically does
not burn completely, which lowers $X$ slightly and shows up as an $I_{sp}$
efficiency loss, not as a nozzle effect.

**Q4 (8 pts).** Lowest erosion first: **3D carbon–carbon (0.02–0.10 mm/s) <
bulk ATJ graphite (0.05–0.25) < carbon-cloth phenolic (0.10–0.30)**.

The property that makes C/C best is **its density and low open porosity
combined with a continuous fibre architecture with no delamination plane**:
the reaction is confined to the geometric surface rather than penetrating the
open pore network and removing grains volumetrically, and there is no
preferential path (interlaminar or grain-boundary) for the attack to run
along. Answers citing "higher melting point" get no marks — none of these
melt, and all three are carbon; the difference is microstructure, not
chemistry.

**Q5 (12 pts).** $x = 1 + (8\times10^{-5})(100)/0.20 = 1.040$.

(i) exponent $-2/(1-0.35) = -3.0769$: $p_c$ ratio $= 1.040^{-3.0769} =
\mathbf{0.886}$ (−11.4 %).
(ii) exponent $-2n/(1-n) = -0.70/0.65 = -1.0769$: $F$ ratio $=
1.040^{-1.0769} = \mathbf{0.959}$ (−4.1 %).

Marks: 4 for each exponent stated correctly, 2 for each number. A student who
gets (i) right and then writes $F$ ratio $=$ $p_c$ ratio has not understood
that $A_t$ appears in $F = C_Fp_cA_t$ and grows.

**Q6 (8 pts) — (d).** $\gamma$ does not limit the achievable area ratio; a low
$\gamma$ actually *raises* the $C_F$ available at a given $\varepsilon$ and
raises the optimum $\varepsilon$ for a given pressure ratio. (a), (b) and (c)
are all genuine reasons (§3.6). Credit an answer that also notes base geometry
and plume impingement as a fourth real reason not listed.

**Q7 (12 pts).**
At $f_r = 1.5$: $1.5\times0.10\times100 = 15.0$ mm recession, $+7 + 2 =
\mathbf{24.0\ mm}$.
At $f_r = 1.2$: $1.2\times0.10\times100 = 12.0$ mm, $+7+2 = \mathbf{21.0\ mm}$.
Mass saved at this station $= 3.0/24.0 = \mathbf{12.5\ \%}$ (thickness and
mass are proportional at fixed area and density).

What the reviewer must have shown: **subscale or full-scale erosion test data,
from the same material lot family and at representative $p_c$, $\chi_{ox}$ and
duration, with enough samples to bound the recession-rate scatter**, such that
1.2 still covers the upper tail (typically 3σ) of the measured $\dot s$
distribution. "The model looks conservative" is not evidence; a margin factor
is a statement about the dispersion of a measured quantity, and it can only be
reduced by measuring the dispersion. Credit also the observation that the
7 mm insulation term is untouched by this argument, so the *fractional* saving
is less than the fractional change in $f_r$ — 20 % off the margin factor buys
12.5 % of thickness.

**Q8 (10 pts).**

| concept | motor | biggest penalty |
|---|---|---|
| Flexseal gimbal | **RSRM** (±8° pitch and yaw, two hydraulic actuators per booster, conf B) | actuation torque, which rises steeply as the elastomer gets cold and sizes the actuator and its power supply on the cold day |
| Liquid injection | **Minuteman III third stage** ("a fixed nozzle with a liquid injection thrust vector control system", conf B) | the injectant, its tank, valves and residuals are dead mass carried through the whole burn whether or not you steer |
| Jet vanes | **V-2** | 2–3 % of $I_{sp}$ continuously, because the vanes sit in the exhaust whether or not you are steering — plus the vanes erode |

2 pts per correct match, 1.5 per correct penalty, rounded.

**Q9 (12 pts).** $C_{F,vac}(45) = 1.9167$, $C_{F,vac}(68) = 1.9511$; ratio
$= 1.01795$. From a 288 s baseline the ideal gain is
$288\times0.01795 = \mathbf{5.2\ s}$.

**The 7.5 s claim is not plausible** as a like-for-like fixed-nozzle
comparison: ideal one-dimensional flow — which is an *upper bound* for a given
pair of area ratios — gives 5.2 s, and every real loss reduces it.

What makes the real gain *smaller* than ideal: two-phase losses grow with area
ratio (the particles fall further behind the accelerating gas, §5.2);
divergence loss at the larger exit; a longer boundary layer; and the extra
ablative mass of the bigger cone, which does not appear in $I_{sp}$ at all but
does appear in stage $\Delta v$.

What could legitimately make it larger: the comparison is not like-for-like.
If the $\varepsilon=68$ nozzle also has a **better contour** (a properly
optimised bell against a conical or a poorly contoured baseline, worth 1–2 %),
or if the baseline 288 s was measured on a *different* motor build, or if the
"gain" is quoted between a sea-level-compromised nozzle and a vacuum-optimised
one, then 7.5 s can be real. The correct answer is to demand the two nozzles'
contours, the measurement conditions and the $c^*$ used before accepting the
number — which is exactly the discipline the Star 48B short/long pair teaches.

**Q10 (12 pts).**

*Motor A* (12 % pressure sag, 4 % thrust sag, 3 % long burn): **throat
erosion.** The ratio of the sags, $4/12 = 0.33 \approx n$, is the Eq. 3.12
signature, and the extended burn follows from the reduced mass flow. This is
the expected behaviour of a motor with an ablative or marginal throat, and it
is bounded and predictable.

*Motor B* (12 % pressure sag, **12 % thrust sag**, nominal burn time): **this
is not throat erosion.** If $A_t$ were growing, thrust could not fall as fast
as pressure. Thrust and pressure falling together at constant $A_t$ means
$\dot m$ is falling with $A_t$ fixed — i.e. the *burning surface area or the
burn rate* is falling. Candidate causes: the grain is not neutral (a
regressive geometry, a mis-cast or slumped grain, debonding that reduces
exposed surface), a low-burn-rate propellant lot, or a colder-than-nominal
propellant temperature. The nominal burn time argues against a simple slow
lot (that would lengthen the burn), which points at a **grain geometry or
grain integrity problem** — the surface area regressing faster than designed
while the web still burns through on schedule.

*Which is more worrying:* **Motor B.** A is a known, bounded, modelled
degradation whose worst consequence is a performance dispersion, and it can be
confirmed in ten minutes with a post-fire throat measurement. B means the
grain is not the grain you designed — which raises the possibility of a
cracked, debonded or slumped grain, and a grain defect can produce a burning
area *increase* just as easily as a decrease, i.e. an over-pressure and case
rupture on the next unit. A is a performance problem; B is a hint of a safety
problem, and it is not diagnosable from the nozzle at all.

---

## K3. Trade-study reference solution (T1)

### The defensible recommendation: **(c), the extendable exit cone**, with a stated condition under which the answer flips to (b)

**Step 1 — what the area ratios are worth.** Vacuum $C_F$ at $\gamma = 1.18$,
$p_c = 5.5$ MPa, and the implied $I_{sp}$ at a delivered $c^* = 1520$ m/s
($I_{sp} = c^*C_F/g_0$):

| $\varepsilon$ | $C_{F,vac}$ | ideal $I_{sp}$ (s) | vs $\varepsilon=30$ |
|---|---|---|---|
| 25 | 1.8611 | 288.5 | −2.8 s |
| 30 | 1.8792 | 291.3 | — |
| 45 | 1.9167 | 297.1 | +5.8 s |
| 60 | 1.9410 | 300.9 | +9.6 s |

(Compute these; do not quote them from memory. A candidate who does not
produce a table like this has not done the trade study.)

So the headline: **(c) flies at $\varepsilon=60$ and buys about 9.6 s over
(a)/(b) at $\varepsilon=30$, and about 3.8 s over (d) at $\varepsilon=45$** —
before two-phase and divergence losses, which will take perhaps 1–2 s of that
back at the higher area ratios and take *more* back from the deployed cone if
its contour is compromised by the deployment mechanism.

**Step 2 — does it fit in 0.55 m?** This is the question that eliminates
options, and a candidate who does not attempt the geometry has not answered.
The stage is small: from the propellant mass and a 65 s burn,
$\dot m \approx 3000/65 = 46$ kg/s, so
$A_t = \dot m c^*/p_c = 46\times1520/5.5\times10^{6} = 0.0127$ m², i.e.
$r_t = 0.064$ m. Then:

- $\varepsilon = 30 \Rightarrow r_e = 0.35$ m. A contoured cone at ~80 % of the
  15° conical length needs $0.8(0.35-0.064)/\tan15° \approx 0.85$ m. **Does
  not fit in 0.55 m** without submerging a substantial part of it.
- $\varepsilon = 45 \Rightarrow r_e = 0.43$ m, length ≈ 1.09 m. Worse.
- $\varepsilon = 25 \Rightarrow r_e = 0.32$ m, length ≈ 0.77 m stowed. Still
  over, but within reach of a submerged design.
- $\varepsilon = 60$ deployed $\Rightarrow r_e = 0.49$ m, cone length ≈ 1.28 m
  deployed — irrelevant to the stowed constraint, which is the point.

**The finding that should dominate the answer: none of the fixed options fit
comfortably, so the nozzle must be submerged, and the length constraint is
binding hard enough that the EEC is doing real work.** A candidate who
concludes "(b), simplest" without noticing that $\varepsilon = 30$ needs 0.85 m
of cone in a 0.55 m hole has failed the trade study, however good the rest of
the reasoning is.

**Step 3 — mass.** 55 kg of nozzle on a 240 kg inert budget is 23 % — at the
top of the normal band, so the budget is tight but not absurd. C/C throat
inserts at this scale are small (a 0.064 m throat insert is a few kilograms).
The EEC's cone, rails, actuators and redundancy are the risk item; on a stage
this size, budget 8–15 kg for the deployment hardware. That is 15–27 % of the
whole nozzle allowance and must be carried against the 7 s.

Check it with the rocket equation. Option (b): $I_{sp} = 291.3$ s,
$\Delta v = 291.3\times9.80665\times\ln(3240/240) = 7434$ m/s. Option (c)
with a 12 kg deployment-hardware penalty: $I_{sp} = 300.9$ s, inert 252 kg,
$\Delta v = 300.9\times9.80665\times\ln(3252/252) = 7546$ m/s. **Net gain
≈ +1.5 % $\Delta v$ (112 m/s)** — positive, but not overwhelming, and
entirely dependent on the deployment hardware coming in light. Repeat the
calculation at 25 kg and the gain falls to well under 1 %; at about 45 kg it
goes to zero. State this calculation; it is the whole trade.

**Step 4 — TVC against the storage requirement.** Five years, −30 °C to
+50 °C, ±5°:

- **Jet vanes (a):** 2–3 % $I_{sp}$ continuously — 6–9 s, which *cancels the
  entire area-ratio argument*. They also erode over a 65 s burn, and vane
  erosion degrades control authority late in the burn when the vehicle is
  lightest and most sensitive. Reject.
- **Flexseal + EMA (b, c):** the concern is the elastomer at −30 °C (Eq. 3.17;
  see N7 — a spring rate that nearly doubles over a 45 K drop). This is
  manageable and is exactly what the SLBM programmes qualified for, but it
  sizes the actuator and the battery, and it must be demonstrated by cold
  bench test on aged articles. The five-year storage adds elastomer ageing and
  compression set to the qualification, which is a real, testable, historically
  solved problem.
- **LITVC (d):** the classic answer for stored systems, and its reliability
  argument is genuine. But it costs an injectant tank, valves and residuals
  inside a 55 kg nozzle budget on a 240 kg stage, and the injectant is dead
  mass whether or not you steer. On a small third stage requiring only ±5°,
  the fixed mass of the injection system is a large fraction of the allowance.
  Also, the ±5° is a *sustained* requirement, not a transient one, which is
  where LITVC's injectant consumption is worst.

**Step 5 — the recommendation and the conditions.**

Recommend **(c): submerged nozzle, 3D C/C throat insert, flexseal with
electromechanical actuators, extendable exit cone 25 → 60.** Justification, in
order of weight: (i) the stowed-length constraint is binding and an EEC is the
only option that converts it into performance rather than accepting the loss;
(ii) at 65 s and 5.5 MPa the C/C insert holds the pressure trace nearly flat,
which matters more on a short-burn upper stage where a 10 % pressure sag would
show up directly in the burnout velocity dispersion; (iii) flexseal + EMA is
the modern storable answer and needs no consumable; (iv) the net $\Delta v$
gain is about +1 % after paying for the mechanism.

**What to test first to retire the largest uncertainty:** not the nozzle — the
**EEC deployment mechanism, at −30 °C, on an aged article, after vibration**.
That single mechanism carries essentially all the new risk in the design; the
performance is calculable but the deployment is binary. Second priority is a
subscale erosion motor to fix $\dot s$ for the chosen C/C lot at 5.5 MPa and
18 % Al.

**What would change the mind, explicitly:**
- If the deployment hardware cannot be built under ~45 kg, the net $\Delta v$
  gain goes to zero and **(b) wins** on simplicity and reliability. This is the
  most likely outcome on a stage this small, and a strong answer says so.
- If the mission is one-shot, high-value and reliability-dominated (a crewed
  abort motor, a planetary injection stage), the single-point deployment
  failure is unacceptable and **(b)** wins regardless of the mass.
- If a qualified flexseal for −30 °C does not exist in the programme's supply
  base and cannot be qualified in schedule, **(d)** returns as the storable
  fallback despite its mass.

### Rubric

| element | marks | what earns them |
|---|---|---|
| $C_F$ / $I_{sp}$ table across the four area ratios, computed | 20 | actual numbers at $\gamma=1.18$, not quoted ranges |
| Geometric fit check against 0.55 m, with $A_t$ derived from $\dot m$ | 25 | the discovery that the fixed options do not fit is the crux |
| Mass and $\Delta v$ closure of the EEC trade | 20 | rocket-equation comparison of the $I_{sp}$ gain against the mechanism mass |
| TVC assessment against storage and temperature, all four options | 20 | jet vanes eliminated quantitatively (2–3 % ≈ 6–9 s), flexseal cold spring rate named, LITVC dead mass named |
| Named first test and explicit mind-changing conditions | 15 | must identify the deployment mechanism, not the nozzle, as the risk |

**What loses marks:** recommending (b) without checking the length fit;
quoting $I_{sp}$ gains without computing $C_F$; treating jet vanes as a
low-cost option without the 2–3 % penalty; forgetting that the injectant on
(d) is carried whether or not it is used; asserting that an EEC "adds
reliability risk" without saying that it is a single-shot, untestable-on-the-
flight-article mechanism; and any answer that never mentions two-phase losses
when recommending a higher area ratio.

---

## K4. Common wrong answers and what they reveal

**1. "Thrust falls in proportion to chamber pressure."** By far the most
common error, and it reveals that the student has memorised Eq. 3.11 without
noticing that $F = C_Fp_cA_t$ contains the *same* $A_t$ that is growing. The
correct exponent is $-2n/(1-n)$, not $-2/(1-n)$, and the ratio of the two
sags is the field diagnostic for erosion (R1, Q10). A student who makes this
error will also misdiagnose Motor B in Q10, because they have no basis for
distinguishing a throat problem from a grain problem.

**2. Al → Al₂O₃ without the factor of 2.** Writing $X = Y_{Al}\times
101.96/26.98 = 3.78Y_{Al}$ gives $X = 0.60$ for a 16 % propellant. Two Al
atoms make one Al₂O₃. The deeper problem is not the stoichiometry but the
missing sanity check: 60 % condensed phase would mean the "gas" is mostly
liquid, and no nozzle would work at all.

**3. Using Stokes drag without checking $\mathrm{Re}_p$.** In N3 the Stokes
answer is 296 m/s of lag at $\mathrm{Re}_p = 70$, a factor of 2.5 too large.
This reveals a general habit: applying a low-Reynolds-number correlation
because it is the one in the notes, without evaluating the parameter that
bounds its validity. Every empirical relation in this course has such a
parameter, and the mark is for checking it, not for knowing the correction.

**4. Sizing an ablative liner from recession alone.** Students routinely
compute $f_r\dot s t_a$ and stop. §5.3 and N4 both show the thermal term is
comparable — 8.4 mm against 11.7 mm, 10.7 mm against 16.0 mm. This reveals a
mental model in which an ablator is a block that burns away, rather than a
three-zone system whose *job* is to keep the bond line cool. The failure this
error produces appears during post-burn soak, when the burn looked fine.

**5. "The throat melts."** Reveals no model of the mechanism at all. It also
blocks every downstream inference: if it were melting, erosion would not
depend on exhaust composition, aluminium loading would only ever be bad, and
the $p_c^{0.8}$ scaling would have no explanation.

**6. Quoting a real motor's $I_{sp}$ without the nozzle.** "The Star 48B has
an $I_{sp}$ of 286 s" — or 292 s, depending on which page the student read.
Both are right for different nozzles ($\varepsilon\approx47.7$ vs 54.8–70.4).
This reveals a failure to understand that $I_{sp} = c^*C_F/g_0$ and that the
nozzle owns $C_F$. The same student will quote thrust without `/motor` or
`/vehicle` and without `max` or `avg`.

**7. Treating the ideal $C_F$ difference as the achievable gain.** In Q9 and
in §6.3, the ideal one-dimensional calculation is an *upper bound*. Students
either quote it as the answer or, worse, accept a manufacturer's claim that
exceeds it without asking what is different about the two configurations. The
skill being tested is knowing which direction the real world moves the number
and by roughly how much.

**8. Recommending a design without checking whether it fits.** In T1 the
geometry eliminates options before any performance argument matters. The
error reveals a habit of optimising the interesting variable while ignoring
the binding constraint — which in real programmes is how a design gets to CDR
before someone measures the interstage.

**9. "The Trident aerospike is an aerospike nozzle."** Reveals reading a name
rather than a mechanism. It is a telescoping drag-reduction spike on the nose.

**10. Building a chain of inferences on a conf-C number.** N8 is designed to
catch this: the derived RSRM throat diameter is a consistency check, not a
measurement, because $\varepsilon = 7.72$ is conf C and the thrust and
pressure figures carry different qualifiers. A student who reports
"$D_t = 1.264$ m" to four figures has learned the arithmetic and not the
epistemics, and this course grades both.
