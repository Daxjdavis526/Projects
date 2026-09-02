# Module 10 — Heat Transfer · Answer key

Solutions to the problems (§10) and quiz (§11) of
[`10-heat-transfer.md`](10-heat-transfer.md). Every number here was recomputed
with `tools/rocket.py`; the machine-checkable subset is registered in
`tools/examples/10.py`.

Reference engine RE-500 throughout: $p_0=1.00\times10^7$ Pa, $T_0=3600$ K,
$\gamma=1.20$, $R=377.93$ J/(kg·K), $A_t=0.030582$ m², $D_t=197.33$ mm,
$R_u=1.5R_t=0.148$ m, $c^*_{del}=1726.6$ m/s, $\mu_0=1.00\times10^{-4}$ Pa·s,
$c_{p0}=2267.6$ J/(kg·K), $\mathrm{Pr}_0=0.8276$. The station-independent
Bartz group is $K_0=1.5260\times10^{4}$, so $h_g=K_0(A_t/A)^{0.9}\sigma$.

---

## K1. Problem solutions

### Conceptual

**C1.** At $\varepsilon=25$, $\gamma=1.20$: $M=3.913$, $B=1+0.1M^2=2.531$.
$$T_{aw}=T_0\frac{1+0.09M^2}{B}=3500\times\frac{2.378}{2.531}=3288\ \mathrm{K}$$
Over-prediction factor
$$\frac{T_c-T_{wg}}{T_{aw}-T_{wg}}=\frac{3500-800}{3288-800}=\frac{2700}{2488}=\mathbf{1.085}$$
**The error is only 8.5 %** — smaller than the ±20–30 % uncertainty in $h_g$
itself. The physical error is real (the wall is driven by the recovered, not
the stagnation, enthalpy) but the *magnitude* is the lesson: because the
turbulent recovery factor is 0.90, $T_{aw}$ stays within 6 % of $T_0$
everywhere in a rocket nozzle. **The uncertainty in a nozzle heat-transfer
calculation lives almost entirely in $h_g$, not in the driving potential.** A
student who "fixes" the $T_{aw}$ term and then trusts the answer to 5 % has
mis-allocated their attention by a factor of four.
*Full marks require both the number and the observation that it is small.*

**C2.** Any two of:
(i) **Curved sonic line.** With a finite throat wall radius of curvature the
sonic surface is not a plane normal to the axis; at the wall it lies upstream
of the geometric minimum, so the wall reaches maximum local mass flux upstream
of the throat plane.
(ii) **Boundary-layer lag.** The layer thins in response to the favourable
pressure gradient with a spatial lag of order $\delta U/(dU/dx)$; the thinnest
layer, and hence the steepest wall temperature gradient, occurs upstream of the
point of maximum acceleration.
(iii) **Görtler vortices on the concave convergent wall** augment near-wall
mixing upstream of the throat.
The quasi-1-D $(A_t/A)^{0.9}$ factor is a function of area alone and is blind
to all three. Measured peaks sit 0.3–1.0 throat radii upstream and 5–20 % above
the throat value.

**C3.** Copper conducts twelve times better. The hot-face temperature is not
set by the melting point but by the resistance chain: at 130 MW/m² a 1 mm
Inconel wall would require $\Delta T = q''t_w/k = 5200$ K across it, which no
wall can sustain — the hot face melts before the cold face warms. A copper
liner at the same flux needs only ~430 K, which sits comfortably below copper's
melting point once the coolant holds the cold face near 500 K. **The relevant
property is $k$, not $T_m$**, and Inconel's higher melting point is irrelevant
because it never gets to use it.

**C4.** The **kerosene** engine has the *lower* wall heat flux after ten
seconds, and by a large margin. Two independent effects, both pushing the same
way:
(i) **A carbon (coke) deposit** 20–100 µm thick, $k\approx0.5$–1.5 W/(m·K),
adds a thermal resistance of order $5\times10^{-5}$ m²K/W — comparable to or
larger than $1/h_g$ — and roughly halves the flux.
(ii) **A fuel-rich wall layer** (film cooling, or simply the outer elements run
rich) means the wall never contacts core-temperature gas, lowering the
effective $T_{aw}$ and the effective $h_g$.
A third acceptable answer: hydrogen's much higher coolant-side $h_c$ pulls
$T_{wg}$ down, which *raises* the flux through the hydrogen wall (a bigger
$T_{aw}-T_{wg}$). Note this is the opposite of the naive answer "hydrogen burns
hotter" — the flame temperatures are comparable, and $\gamma$, $\mathcal{M}$
and $c_p$ were stipulated identical.

**C5.** $\Delta T_{wall}=q''t_w/k$ and $\sigma_{th}=E\alpha\Delta T_{wall}/
[2(1-\nu)]$, so **thermal stress is directly proportional to wall thickness**.
A thicker wall means a larger plastic strain range per thermal cycle, and life
under a Coffin–Manson law $\Delta\varepsilon_p N_f^{\,m}=C$ ($m\approx0.5$)
falls roughly as the square of the strain range. Life is governed by the
**through-wall temperature difference / plastic strain range**, not by peak
temperature — and the two are optimised in opposite directions on thickness.

**C6.** In a closed expander cycle the only energy available to drive the
turbopumps is the enthalpy the hydrogen picks up in the chamber wall, so more
wall heat means more turbine power and more achievable pump discharge pressure.
The cap: heat pickup scales with **wetted area** ($\propto D^2$) and with
$q''\propto p_c^{0.8}$, while thrust scales with **throat area**. As the engine
is scaled up, the required pump power grows faster than the available heat
pickup, and the cycle closes at lower and lower $p_c$. Hence the RL10 sits at
32.8 bar and the "expander cycle thrust limit" of a few hundred kN
[_verify-liquid].

**C7.** Use the **near-wall value, 0.4**, or better a two-zone / non-grey
model. Radiation to the wall is dominated by the optically active gas within
roughly one mean beam length of the wall, and that is the fuel-rich, sooty
layer, not the core. A CFD radiation model that assumes a single well-mixed
emissivity will under-predict wall radiation in a film-cooled or
outer-rich chamber (using 0.15 instead of 0.4 loses a factor of 2.7 on
$q''_{rad}$, i.e. ~10 % of the total chamber flux) and over-predict radiation
*out* of the core. Radiation and mixture-ratio distribution are coupled; a
single-emissivity model cannot represent that coupling.

**C8.** Two of:
(i) **Integral measurements cannot localise.** The total jacket $\Delta T$ can
match the integrated prediction exactly while a single station runs at twice
the predicted flux and another at half. Burn-through is a local event.
(ii) **Compensating errors.** If Bartz over-predicts in the film-cooled barrel
and under-predicts near the injector, the integral can agree while both local
predictions are wrong.
(iii) **The test may not run long enough to reach steady state** in the
structure, or long enough for the soot layer or a coolant-side deposit to
develop, so it validates a condition the flight engine never operates in.
(iv) It measures heat *into the coolant*, not wall temperature or wall $\Delta T$,
and life is set by the latter.

### Calculation

**N1.** $\varepsilon=10$, supersonic, $\gamma=1.20$ $\Rightarrow M=3.2783$.
$$B=1+0.1M^2=2.0747,\qquad
A=\tfrac12\!\left(\frac{700}{3600}\times2.0747\right)+\tfrac12=0.70172$$
$$\sigma=A^{-0.68}B^{-0.12}=1.29275\times0.91485=1.16567$$
$$(A_t/A)^{0.9}=(0.1)^{0.9}=0.125893$$
$$h_g=1.5260\times10^{4}\times0.125893\times1.16567=\mathbf{2239\ W/(m^2K)}$$
$$T_{aw}=3600\times\frac{1+0.09\times10.747}{2.0747}=3600\times0.94820=\mathbf{3413.5\ K}$$
$$q''=2239.4\times(3413.5-700)=\mathbf{6.08\ MW/m^2}$$
Note this is 9.5× lower than the throat flux — the divergent section is a mild
thermal environment, which is why nozzle extensions can be tube-wall, dump-
cooled, film-cooled or radiation-cooled.

**N2.** Everything in Eq. 3.4 is unchanged except $(p_0/c^*)^{0.8}$:
$$h_g(200\ \mathrm{bar})=20\,830\times2^{0.8}=20\,830\times1.74110
=\mathbf{3.627\times10^{4}\ W/(m^2K)}$$
an increase of **74.1 %**, exactly the $p_c^{0.8}$ scaling
($2^{0.8}=1.7411$). At $T_{wg}=800$ K the flux rises from 57.6 to
**100.4 MW/m²** — a 100 bar kerolox engine is a difficult cooling problem and a
200 bar one is an RS-25-class problem. Full marks require noticing that
$\sigma$ is unchanged (it depends only on $T_{wg}/T_0$, $\gamma$ and $M$) and
that $T_{aw}$ is unchanged.

**N3.**
$$A_t=\frac{F}{C_F p_c}=\frac{25\,000}{1.85\times6.0\times10^{6}}
=2.2523\times10^{-3}\ \mathrm{m^2}\ \Rightarrow\ D_t=53.55\ \mathrm{mm}$$
$$R=\frac{8314.46}{13.0}=639.57\ \mathrm{J/(kg\,K)},\quad
c_{p0}=\frac{1.21\times639.57}{0.21}=3685.2,\quad
\mathrm{Pr}_0=\frac{4.84}{5.89}=0.82173$$
$$\sigma=1.36747\ (M=1,\ T_{wg}/T_0=0.21739),\qquad
\left(\frac{D_t}{R_u}\right)^{0.1}=2^{0.1}=1.07177$$
$$h_g=\frac{0.026}{0.05355^{0.2}}\times\frac{(10^{-4})^{0.2}\times3685.2}{0.82173^{0.6}}
\times\left(\frac{6.0\times10^{6}}{2250}\right)^{0.8}\times1.07177\times1.36747
=\mathbf{2.475\times10^{4}\ W/(m^2K)}$$
$$T_{aw}=3450\times\frac{1.09}{1.105}=\mathbf{3417.2\ K},\qquad
q''=24\,753\times2667.2=\mathbf{66.0\ MW/m^2}$$
**Comment.** 66 MW/m² at only 60 bar, against the RS-25's ~136 MW/m² at
206 bar. Scaling on pressure alone would have predicted
$136\times(60/206)^{0.8}=50$ MW/m². The extra 30 % is the $D_t^{-0.2}$ term:
this engine's throat is 5× smaller than the RS-25's, worth $5^{0.2}=1.38$.
**A small engine at modest pressure can be thermally harder than a big engine
at high pressure**, and this is the single most commonly missed scaling in
preliminary design.

**N4.** $k=290$, $E=110$ GPa, $\alpha=17\times10^{-6}$/K, $\nu=0.33$,
$q''=45$ MW/m².
(a) $t_w=0.7$ mm: $\Delta T=4.5\times10^{7}\times7\times10^{-4}/290=108.6$ K;
$$\sigma_{th}=\frac{110\times10^{9}\times17\times10^{-6}\times108.6}{2(0.67)}
=\mathbf{152\ MPa}$$
(b) $t_w=1.4$ mm: $\Delta T=217.2$ K, $\sigma_{th}=\mathbf{303\ MPa}$.
Ratio exactly **2.00** (both $\Delta T$ and $\sigma_{th}$ are linear in $t_w$).
**Implication.** With GRCop-42's yield at ~150–190 MPa at temperature, the
0.7 mm wall is at or just below yield and the 1.4 mm wall is at twice yield.
Under Coffin–Manson with $m\approx0.5$, doubling the plastic strain range cuts
cycle life by roughly a factor of four. Halving the wall thickness is the
single most effective life lever available, and it costs only erosion allowance
and a slightly higher flux.

**N5.**
(a) $38/55=\mathbf{0.691}$.
(b) $49/55=\mathbf{0.891}$.
**Is a single scalar correction defensible?** No. The correction factor moved
from 0.69 to 0.89 for a 30 % change in film-cooling flow, i.e. it is not a
property of the chamber, it is a property of the *film*. A scalar $K$ carried
forward from one test configuration to another is valid only if the
film-cooling fraction, injector pattern, mixture ratio and run duration (soot
build-up) are all held fixed. What *is* defensible is a correction factor as a
function of axial station **for a frozen configuration**, re-measured whenever
the wall boundary condition changes. Credit for saying that the two data points
also bracket a useful sensitivity: $\partial q''/\partial(\text{film }\%)
\approx-11$ MW/m² per 30 % of film flow removed, i.e. film cooling is buying
about 0.9 MW/m² per percent of fuel diverted here.

**N6.** $\alpha_d=k/(\rho_s c_s)=100/(1800\times1700)=3.268\times10^{-5}$ m²/s.
$\Delta T_{allow}=2500-300=2200$ K.
$$t_{surv}=\frac{\pi}{\alpha_d}\left(\frac{k\Delta T}{2q''}\right)^2
=\frac{3.14159}{3.268\times10^{-5}}\left(\frac{100\times2200}{4.0\times10^{7}}\right)^2
=9.613\times10^{4}\times(5.5\times10^{-3})^2=\mathbf{2.91\ s}$$
$$\delta_{th}=2\sqrt{\alpha_d t}=2\sqrt{3.268\times10^{-5}\times2.908}
=\mathbf{19.5\ mm}$$
So a graphite insert must be at least ~20 mm thick for the semi-infinite
solution to apply, and it survives about three seconds at 20 MW/m². Note
graphite does well here despite mediocre conductivity because $t_{surv}\propto
\rho_s c_s k$ and graphite's specific heat is huge — this is the effusivity
argument of Eq. 3.10, and it is why graphite and carbon–carbon are the standard
solid-motor throat materials.

**N7.** $\sigma_{SB}(3500^4-750^4)=5.6704\times10^{-8}\times(1.50063\times10^{14}
-3.164\times10^{11})=8.4914$ MW/m².
- LOX/CH₄, $\varepsilon_g=0.18$: $q''_{rad}=1.53$ MW/m², which is
  $1.53/28=\mathbf{5.5\%}$ of the convective flux. **Include it** — it is
  comparable to the difference between two plausible $\mathrm{Pr}_0$ values.
- LOX/LH₂, $\varepsilon_g=0.07$: $q''_{rad}=0.59$ MW/m², which is
  $0.59/60=\mathbf{0.99\%}$. **Skip it** — it is well inside the ±20–30 %
  uncertainty on $h_g$ and adding it creates false precision.

**N8.** $q''=h_g(T_{aw}-T_{wg})=4.93\times10^{4}\times(3568.8-830)
=\mathbf{135.0\ MW/m^2}$.
$$\Delta T_{wall}=\frac{1.350\times10^{8}\times1.0\times10^{-3}}{300}=450.1\ \mathrm{K}
\ \Rightarrow\ T_{wc}=830-450=\mathbf{379.9\ K}$$
$$h_c^{req}=\frac{q''}{T_{wc}-T_{co}}=\frac{1.350\times10^{8}}{379.9-150}
=\frac{1.350\times10^{8}}{229.9}=\mathbf{5.87\times10^{5}\ W/(m^2K)}$$
**Comment.** Supercritical hydrogen in a high-aspect-ratio milled channel
reaches $2$–$4\times10^{5}$ W/(m²·K). $5.9\times10^{5}$ is **above** that band,
so 830 K is not holdable at a 1.0 mm wall by channel design alone. The real
engine closes the gap with the fin effect of the channel lands (which raises
the *effective* coolant-side coefficient referenced to the plain hot-wall area
by a factor of 1.5–3 — Module 11), and by accepting a somewhat higher $T_{wg}$.
Credit for noticing that the 1-D chain of Eq. 3.6 is conservative for exactly
this reason: it ignores the lands.

### Engineering reasoning

**R1.** **Diagnosis: injector-driven streaking.** A sharp, local, *near-field*
peak 20 mm from the face at nearly 3× the barrel average is not a boundary-
layer phenomenon — Bartz-type physics varies smoothly with area and cannot
produce it. It is a single element (or a small group) whose spray is impinging
on, or whose mixture ratio is locally oxidiser-rich at, the wall. Oxidiser-rich
streaks are the worst case: they raise the local flame temperature toward
stoichiometric *and* strip the protective fuel layer.
**Confirming measurement:** circumferential resolution. A calorimeter chamber
with segments split into circumferential sectors, or a ring of wall
thermocouples at that axial station, will show the peak confined to one or two
azimuthal positions if it is streaking, and uniform around the circumference if
it is a genuine axial flow feature (e.g. recirculation off the injector face).
Correlating the azimuth with the injector element map closes it.
**Fix:** in order of preference — re-orient or re-drill the offending outer
elements to bias them fuel-rich; add or increase a fuel-film ring at the
injector face; as a last resort, add local coolant capability. Do **not** fix it
by raising overall film cooling: that costs $I_{sp}$ everywhere to solve a
problem in one place.

**R2.** Two explanations:
(i) **Soot layer differences.** Build A's carbon deposit is spalling or failing
to re-form between runs, so its effective thermal barrier is degrading — flux
rises. Build B has a stable deposit. This is a wall-boundary-condition
explanation.
(ii) **Progressive geometric change.** Build A's throat is eroding or its
channel lands are deforming (early dog-house), reducing local coolant flow and
raising the measured wall temperature — which a calorimeter would read as
rising flux if the flux is inferred from wall temperature, or as a genuine flux
rise if the contour is sharpening.
**Discriminating data:** (a) borescope or profilometry of the throat contour
and of the wall deposit before and after the series — spalled soot is visible
and so is erosion; (b) the *axial distribution* of the change — a soot effect
appears over the whole barrel and throat, an erosion effect is localised at the
throat and shifts the peak; (c) coolant-side $\Delta p$ across the jacket —
land deformation changes it, soot does not; (d) whether the flux resets after a
cleaning or a long stand-down (soot) or does not (geometry).
**Which would I bet on?** Soot, at maybe 3:1 [J]. Eight cycles is far too few
for meaningful LCF land deformation in a properly designed liner, and a 15 %
rise is exactly the scale of a soot-layer effect (WE2: a 50 µm deposit changes
the flux by a factor of 1.7). Erosion at eight cycles would indicate something
badly wrong that would show up in other channels too. But (c) is a cheap
measurement and I would take it before betting.

**R3.** Rank, best benefit per unit of programme risk:
1. **(ii) NARloy-Z → GRCop-42.** Highest benefit-to-risk. It raises yield
   strength 30–40 % at essentially unchanged conductivity, which directly cuts
   the plastic strain range at the same $\Delta T_{wall}$; NASA's own data show
   an LCF-life improvement, and it also improves blanching resistance
   [GRCop]. Risk: a materials substitution requires re-qualification and the AM
   property database is thinner than NARloy-Z's — real, but bounded and
   testable on coupons.
2. **(i) Thin the wall 1.2 → 0.9 mm.** $\Delta T_{wall}$ and $\sigma_{th}$ fall
   by 25 % (N4's linearity), which under Coffin–Manson is worth roughly a
   factor of 1.8 on life. Risk: erosion allowance and hoop capability shrink,
   and manufacturing tolerance becomes a larger fraction of the wall. Cheap to
   analyse, moderate to qualify.
3. **(iv) 3 % fuel-film cooling at the throat.** Buys perhaps a 30–40 % flux
   reduction locally, hence a proportional $\Delta T$ and life gain. Risk: costs
   ~1 % $I_{sp}$, changes the wall boundary condition so every existing
   calorimeter correlation must be re-measured, and film injection hardware at
   the throat is awkward. Effective but expensive in performance and
   re-qualification.
4. **(iii) Reduce $p_c$ by 10 %.** Reduces flux by only $0.9^{0.8}=8.5$ %,
   hence life by maybe 20 %, while costing thrust, $I_{sp}$ and — in a staged
   combustion engine — a whole cycle rebalance. **Worst benefit per unit of
   programme disruption.** It is the option that looks safest and is not.
Best answer combines (i) and (ii): a 0.9 mm GRCop-42 liner should plausibly
close 100 cycles, and both changes are testable in a subscale calorimeter
chamber before committing.

**R4.** **Reasoning chain.** A visible cherry-red lower nozzle at roughly
1200–1500 K is a **radiation-cooled skirt** — a refractory metal (C-103
niobium) or carbon–carbon. A bright metallic upper chamber that is *not*
glowing is regeneratively cooled. A single fuel duct and no visible second
propellant manifold at the chamber implies the fuel is the coolant. Put
together: **a regeneratively cooled chamber with a radiation-cooled nozzle
extension**, which is the signature of an **upper-stage or in-space engine**
with a large area ratio — the MVac's niobium extension is the canonical modern
example [_verify-liquid], the RS-68's ablative nozzle is the counter-example.
**Flux at the joint.** Radiation cooling closes when the wall can radiate away
what arrives: $q''=\varepsilon_w\sigma_{SB}T_w^4$. At $T_w=1500$ K and
$\varepsilon_w=0.8$, that is $0.8\times5.67\times10^{-8}\times5.06\times10^{12}
=\mathbf{0.23\ MW/m^2}$ (double it if the skirt radiates from both faces to
space, ~0.46). So the transition sits where the incident flux has fallen to a
few tenths of a MW/m² — two to three orders of magnitude below the throat.
Full marks require noting that this is set by $h_g$ collapsing as
$(A_t/A)^{0.9}$, **not** by the gas cooling: $T_{aw}$ at $\varepsilon=40$ is
still ~3370 K for a 3600 K chamber.

---

## K2. Quiz answers

Total 100 points.

**Q1 (8).** **(b) $p_c^{0.8}D_t^{-0.2}$.** From Eq. 3.4: $(p_0/c^*)^{0.8}$
gives the pressure exponent and the leading $0.026/D_t^{0.2}$ gives the size
exponent. (a) has the wrong sign on diameter — it would mean big engines are
harder to cool, which is backwards. (c) and (d) are not any correlation in use.
The consequence worth stating: small high-pressure engines are the hardest
thermal problem.

**Q2 (8).** **(c) 0.94.** Turbulent recovery factor $r=\mathrm{Pr}^{1/3}
=0.82^{1/3}=0.936$. (a) confuses $r$ with $\mathrm{Pr}$. (b) is
$\mathrm{Pr}^{1/2}=0.906$, the *laminar* value — and also the number
conventionally used in rocket practice ([Bartz57], [HH]), so a student who
answers 0.90 and says "the laminar value, but it is the rocket convention"
earns full marks; a student who answers 0.90 with no justification earns 4.
(d) 1.00 would mean perfect recovery, i.e. $\mathrm{Pr}=1$.

**Q3 (10).** $R''_g=1/2\times10^{4}=5.00\times10^{-5}$;
$R''_w=10^{-3}/300=3.33\times10^{-6}$; $R''_c=1/10^{5}=1.00\times10^{-5}$;
total $6.33\times10^{-5}$ m²K/W.
$$\text{metal share}=\frac{3.33\times10^{-6}}{6.33\times10^{-5}}=\mathbf{5.3\%}$$
(gas film 79 %, coolant film 16 %). **Implication:** the metal is not the
resistance. Changing to a better-conducting alloy or a thinner wall barely
moves the heat flux or $T_{wg}$; what it moves is $\Delta T_{wall}$ and
therefore life. If you want a cooler wall, work on $h_c$ or put a barrier on
the gas side.

**Q4 (12).**
$$\Delta T_{wall}=\frac{6.0\times10^{7}\times1.0\times10^{-3}}{280}=\mathbf{214.3\ K}$$
$$\sigma_{th}=\frac{105\times10^{9}\times17.5\times10^{-6}\times214.3}{2(1-0.33)}
=\frac{3.938\times10^{8}}{1.34}=\mathbf{294\ MPa}$$
$294 > 150$ MPa, so the liner is **not elastic** — it yields in compression on
the hot face on every start and in tension on every shutdown. The elastic
number is a strain index, not a stress; life must be assessed by
elastic-plastic low-cycle-fatigue analysis. Full marks require the explicit
statement that the elastic answer is no longer a stress.

**Q5 (10).** **(b) a clean throat at 100 bar** is the one regime Bartz handles
well — that is precisely the case it was correlated against, and it is good to
±20–30 % there. (a) fails by a factor of 2–5: Bartz has no concept of a coolant
film. (c) fails by 30–50 % (over-predicts): the developed-pipe assumption is
worst where the boundary layer is thick and growing, and frozen chemistry makes
$c_p$ wrong. (d) fails by 30–100 % (under-predicts): 15 mm from the injector
face the flow is a set of impinging jets and recirculation zones, not a
developed pipe flow.

**Q6 (12).** Assumption: $h_g\propto p_c^{0.8}$ with everything else — $T_{aw}$,
$T_{wg}$, $\sigma$, geometry — held fixed.
$$q''_{new}=35\times\left(\frac{140}{80}\right)^{0.8}=35\times1.5647
=\mathbf{54.8\ MW/m^2}$$
Life: $\Delta T_{wall}\propto q''$, so the through-wall gradient and the
plastic strain range rise by 56 %. Under Coffin–Manson with $m\approx0.5$,
$N_f\propto\Delta\varepsilon_p^{-2}$, so life falls by a factor of about
$1.56^2\approx2.4$. **Direction: shorter. Magnitude: a factor of 2–4** — the
range reflects the fact that $\Delta\varepsilon_p$ is not simply proportional
to $\Delta T$ once the material is well into plasticity. Credit for stating the
assumption and for giving a range rather than a false-precision number.

**Q7 (10).** Two distinct reasons:
(i) **Propellant.** LOX/LH₂ products are H₂O and H₂. H₂ is homonuclear
diatomic and does not radiate at all; there is no carbon, hence no soot
continuum. Kerolox products contain CO₂, CO **and soot**, and soot is a grey
continuum radiator that dominates when present. $\varepsilon_g$ differs by a
factor of 4–8.
(ii) **Station.** Radiation scales as $\varepsilon_g\sigma_{SB}T_g^4$ and is
roughly *constant* along the engine (the gas cools slowly), while the
convective flux **triples or quadruples** from barrel to throat. The same
absolute radiant flux is therefore a much smaller *fraction* at the throat.
Half marks for one reason only.

**Q8 (12).** $\alpha_d=320/(8900\times385)=9.339\times10^{-5}$ m²/s,
$\Delta T=750-290=460$ K.
$$t_{surv}=\frac{\pi}{\alpha_d}\left(\frac{k\Delta T}{2q''}\right)^2
=3.3641\times10^{4}\times\left(\frac{320\times460}{2.4\times10^{7}}\right)^2
=3.3641\times10^{4}\times(6.133\times10^{-3})^2=\mathbf{1.27\ s}$$
$$\delta_{th}=2\sqrt{\alpha_d t}=2\sqrt{9.339\times10^{-5}\times1.265}
=\mathbf{21.7\ mm}$$
So the wall must be **at least ~22 mm thick** (and comfortably more, say 30 mm,
for the back-face effect to be genuinely negligible) for the semi-infinite
solution to be valid at that time. A thinner wall heats bodily and fails
sooner.

**Q9 (10).** **Failure mode: low-cycle-fatigue "dog-house" deformation** of the
channel lands — cyclic plastic ratcheting from the reversing through-thickness
gradient, with the hot wall bulging into the gas and thinning. No melting is
the diagnostic: this is a strain-driven, not a temperature-driven, failure.
**Governing property group:** $k(1-\nu)\sigma_y/(E\alpha)$ — high conductivity
and yield, low modulus and expansion. **Single most effective design change:**
**reduce the hot-wall thickness**, because $\sigma_{th}\propto t_w$ directly and
the change costs nothing in coolant capability. (Full credit also for "change
to a higher-yield copper alloy, GRCop-42", which is the same lever applied to
$\sigma_y$ instead of $\Delta T$. No credit for "lower the peak temperature" —
the liner did not melt, and peak temperature is not what governs life.)

**Q10 (8).** [J] — graded on the argument, not on a specific number.
A defensible answer: **design the cooling circuit to 85–105 MW/m², i.e. Bartz
+20 to +50 %.**
- *Upward margin* because Bartz is ±20–30 % even in its best regime, because
  injector streaking can put a local 1.5–2× peak somewhere you have not
  predicted, and because the peak sits upstream of the throat where a
  contour-based sizing may not have put the coolant capability.
- *Why not more* because over-cooling is not free: more coolant velocity means
  more jacket $\Delta p$, more pump power, a lower achievable $p_c$ for the
  cycle, and — if you buy the margin with film cooling — direct $I_{sp}$ loss.
  A 2× margin is a different, worse engine.
- Explicitly **do not** take credit for a soot layer at the design stage: it
  is uncontrolled, it varies run to run and it spalls. Treat it as unmodelled
  conservatism if it appears.
**The measurement that removes the margin:** a **segmented calorimeter chamber**
at the design point and design mixture ratio, giving $q''(x)$ with axial and
ideally circumferential resolution, from which the local $h_g^{meas}/h_g^{Bartz}$
correction factor is derived and carried through the rest of the programme.
Full marks require a number, a two-sided justification, and naming the
calorimeter chamber.

---

## K3. Trade-study reference solution (T1)

### The number that decides it

Estimate the throat flux first; everything else follows. LOX/CH₄ at MR ≈ 3.6
and 250 bar: $T_0\approx3550$ K, $\gamma\approx1.16$,
$\mathcal{M}\approx21.5$ kg/kmol $\Rightarrow R=386.7$ J/(kg·K),
$c_{p0}=2804$ J/(kg·K), $\mathrm{Pr}_0=0.853$, $c^*_{del}\approx1830$ m/s,
$\mu_0\approx1.0\times10^{-4}$ Pa·s, $D_t=0.21$ m, $R_u=R_t$, first-guess
$T_{wg}=800$ K:

$$\sigma=1.369,\qquad h_g=5.18\times10^{4}\ \mathrm{W/(m^2K)},\qquad
T_{aw}=3524\ \mathrm{K}$$
$$q''_{throat}\approx\mathbf{141\ MW/m^2}\ \text{(Bartz, clean wall)}$$

**This is an RS-25-class thermal problem** (100–160 MW/m²) at a smaller throat,
in a propellant that does not coke and therefore grows no protective deposit.
That single sentence eliminates two of the four options before any trade table
is drawn. Design to **150–170 MW/m²** at the peak station (Bartz +10–20 %, with
the peak placed half a throat radius upstream of the geometric throat).

### The options

**(D) Brazed Inconel-718 tube wall + 8 % film.** **Reject.** A 0.5 mm Inconel
wall at even 95 MW/m² (after film cooling) needs $\Delta T=1900$ K across it.
There is no such wall. Even at 15 MW/m² — the F-1's regime — Inconel is at its
limit, and getting from 141 to 15 MW/m² would take film-cooling fractions that
would wreck $c^*$ efficiency. Inconel tube walls belong to the 70-bar era.
*This option exists in the problem to be rejected on arithmetic, and a strong
answer rejects it in two lines.*

**(A) Milled NARloy-Z + electroformed nickel, no film.** Technically closes;
this is the RS-25 architecture at a higher flux. But: (i) at 141 MW/m² through
a 0.9 mm wall, $\Delta T_{wall}=q''t_w/k=438$ K and
$\sigma_{th}\approx610$ MPa against a NARloy-Z yield of 100–140 MPa — a plastic
strain range that will not give 100 cycles; (ii) electroforming is a long-lead,
low-throughput, expensive process poorly matched to a reusable-booster
production rate; (iii) NARloy-Z is the *lower*-strength of the two available
copper alloys, and strength is exactly what this design is short of.

**(B) AM GRCop-42 liner + DED Inconel 625 jacket, no film.** The right liner
material, the right process, and the right structural concept. At 141 MW/m²
through 0.9 mm, $\Delta T_{wall}=438$ K and $\sigma_{th}\approx610$ MPa —
still far above GRCop-42's ~150–190 MPa yield. **Without film cooling this does
not reach 100 cycles either.** The AM process buys the ability to make a
0.7–0.9 mm wall with optimised channel cross-sections and integral manifolds,
and GRCop buys 30–40 % more yield strength and better blanching resistance than
NARloy-Z, but neither closes a 610 MPa strain index.

**(C) (B) plus 4 % fuel-film cooling at the throat.** Film cooling at 4 %
should cut the local flux by roughly 35–45 % [E], to **80–95 MW/m²**. At
0.9 mm and 90 MW/m²: $\Delta T_{wall}=279$ K, $\sigma_{th}\approx390$ MPa —
still above yield, but the plastic strain range is roughly 40 % lower than
option B, which under Coffin–Manson is worth a factor of ~2.5–3 on life. Methane
is a good coolant (1.5–2× RP-1's $h_c$) and does not coke, so the coolant side
can be pushed hard. In a staged-combustion cycle the film fuel is not lost from
the power balance and the $I_{sp}$ cost is roughly 0.5–1 %.

### Recommendation

**Option (C): additively manufactured GRCop-42 liner, DED Inconel 625
structural jacket, methane-cooled, with 4 % fuel-film cooling at the throat,
and a hot-wall thickness of 0.8–0.9 mm.**

Reasoning, in priority order:
1. **The flux level forces a copper alloy** (Inconel eliminated by conduction
   arithmetic alone).
2. **The life requirement forces both the higher-strength alloy and film
   cooling.** GRCop-42 alone gets you a factor of ~1.5 on life over NARloy-Z;
   film cooling gets you another factor of ~2.5–3; neither alone gets to 100
   cycles at 250 bar and 0.21 m throat.
3. **The production rate and the six-year schedule favour AM** over
   electroforming; the GRCop-42 supply chain exists even if the qualification
   database is thin, and thin databases are closed by coupon and subscale
   testing, which fits inside six years.
4. **Methane's non-coking behaviour is a liability here, not an asset.** A
   kerolox engine at this flux would grow its own thermal barrier; a methalox
   engine will not. That is the specific reason film cooling is *not* optional
   in option (C) even though it would be arguable for kerosene.
5. The $I_{sp}$ cost (~0.5–1 %) is bought back many times over by not
   performing a 30-day liner replacement every 40 flights.

**What I would insist on measuring in a calorimeter chamber before committing:**
- $q''(x)$ at the design $p_c$ and MR, with **circumferential** resolution, to
  establish the local $h_g^{meas}/h_g^{Bartz}$ correction and to find streaks.
- The **film-cooling effectiveness decay** downstream of the injection station,
  as a function of film fraction — the 35–45 % number above is the single
  softest input in the whole recommendation.
- The **axial location of the peak** relative to the geometric throat, because
  the channel design must put its minimum flow area there.
- **Methane coolant-side $h_c$** at design mass flux, pressure and wall
  temperature, including any near-critical behaviour, since methane's
  pseudo-critical region can cause a local $h_c$ collapse.
- **GRCop-42 LCF data** at the actual $\Delta\varepsilon_p$ and temperature, on
  material from the actual AM process and build orientation.

### Rubric

**A strong answer must contain:**
- A quantitative throat-flux estimate (100–180 MW/m² band) with the inputs
  stated, and the recognition that it is RS-25-class.
- Elimination of option (D) by the conduction arithmetic ($\Delta T=q''t_w/k$),
  not by assertion.
- Recognition that **life, not peak temperature, is the binding constraint**,
  and use of $\sigma_{th}=E\alpha q''t_w/[2k(1-\nu)]$ compared against yield.
- Explicit treatment of the fact that **methane does not coke**, and therefore
  the "free" thermal barrier a kerolox engine enjoys is absent.
- A recommendation with a wall thickness, and a named list of measurements.

**Loses marks for:**
- Choosing (A) or (B) without showing that the strain index exceeds yield by
  3–4×, i.e. without noticing the life requirement is not met.
- Choosing (D) at all.
- Treating film cooling as free (it costs $I_{sp}$ and mixing quality) or as
  purely bad (it is the difference between 40 and 100 cycles here).
- Quoting a heat flux without an uncertainty, or claiming Bartz to better than
  ±20 %.
- Recommending "more CFD" as a substitute for a calorimeter chamber. CFD needs
  the same validation data.
- Any statement that a thicker wall would improve life.

---

## K4. Common wrong answers, and what they reveal

**"The wall sees $T_c$."** Using $T_c$ instead of $T_{aw}$. In the chamber it
is harmless (0.1 % error); in the nozzle it is an 8 % error at $\varepsilon=25$.
The revealing part is the students who then *over*-correct, assume $T_{aw}$
tracks the static temperature, and under-predict nozzle flux by a factor of two.
Both errors come from not having internalised that $r\approx0.9$ recovers
almost all of the stagnation enthalpy.

**Using the ideal $c^*$ in Bartz.** $(p_0/c^*)$ *is* the throat mass flux. Using
$c^*_{ideal}$ where $\eta_{c^*}=0.96$ under-states $h_g$ by 3.3 %. Small, but it
reveals that the student is pattern-matching symbols rather than tracking what
the group means physically.

**Forgetting $\sigma$, or applying it with the wrong sign.** $\sigma$ is worth
20–40 % and is always **greater than 1** for a cold wall. A student who omits it
under-predicts; a student who "corrects downward because the wall is cold"
has confused the property correction with the driving potential.

**Not iterating.** $\sigma$ depends on $T_{wg}$, which depends on $q''$, which
depends on $h_g$, which depends on $\sigma$. WE2's first pass gave
$T_{wg}=1368$ K and the converged answer was 1312 K. Students who take the
first pass as the answer are usually the same students who then declare the
design "close enough".

**Concluding that a better metal fixes a wall-temperature problem.** The metal
is 5 % of the resistance chain (Q3). Doubling $k$ changes $q''$ by 2 % and
$T_{wg}$ by almost nothing. It changes $\Delta T_{wall}$ by a factor of two,
which matters enormously — for *life*, not for temperature. Confusing these two
outcomes is the single most common conceptual error in this module.

**"Thicker is safer."** Reveals a structural intuition applied to a thermal
problem. Thicker walls carry more pressure and tolerate more erosion, and they
fail sooner in fatigue. Both are true; the design question is which one is
binding, and in a regeneratively cooled copper liner it is always fatigue.

**Quoting a heat flux to three significant figures.** WE1 gives 57.6 MW/m² and
the honest statement is "50–70 MW/m², probably". Students who carry Bartz's
output to three figures and then compare it to a literature value to three
figures have not read §3.7. The F-1 check — Bartz 31, reality 8–16 — is in the
module specifically to inoculate against this.

**Assuming radiation is always negligible, or always matters.** It is under 1 %
at a hydrogen throat and 10–25 % in a sooty kerolox barrel. A single blanket
rule is wrong in one direction or the other, and the deciding variables are the
presence of carbon and the station.

**Treating the soot layer as a design feature.** It halves the flux in a kerolox
engine and it is uncontrolled, variable and liable to spall. Designing to the
sooted flux and discovering that a cleaned chamber runs at twice the flux is a
real and repeated failure in development programmes.

**Using the semi-infinite solution without checking penetration depth.** N6 and
Q8 both turn on this: the answer is only valid if $2\sqrt{\alpha_d t}$ is less
than the wall thickness. Students who report a survival time without the check
have used a formula rather than a model.
