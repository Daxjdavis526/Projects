# Module 21 — Grain Geometry — Answer key

Everything below assumes propellant **P-1770** of §4 unless stated:
$\rho_p = 1770$ kg/m³, $r = 5.0\,(p_c/\mathrm{MPa})^{0.35}$ mm/s
($a = 3.9716\times10^{-5}$ m·s⁻¹·Pa⁻⁰·³⁵, $n = 0.35$), $c^* = 1580$ m/s,
$\sigma_p = 0.0022$ K⁻¹. Recurring constant:
$a\rho_p c^* = 111.07$ (SI), so $K_n = p_c^{\,0.65}/111.07$ with $p_c$ in Pa.
Every number here was recomputed with `tools/rocket.py`; the scripts are in
`tools/examples/21.py`.

---

## K1. Problem solutions

### Conceptual

**P1 — enlarging the throat to fix progressivity.**
It does not fix it at all. Enlarging $A_t$ divides the whole $K_n(w)$ curve by
a constant, so it lowers the pressure *level* everywhere by the same factor
$1/(1-n)$ in the exponent — it does not change the *shape*. The ratio
$p_{end}/p_{start}$ is unchanged, because that ratio depends only on
$A_{b,end}/A_{b,start}$. What it buys is margin: the peak is now further below
the case limit. What it costs is (i) lower average pressure, hence lower $c^*$
efficiency and a nozzle that must be re-optimised, (ii) a longer burn (rate
falls with pressure), (iii) an even lower start pressure, which can drop the
motor near or below its stable-combustion limit at cold temperature, and (iv)
delivered $I_{sp}$, because a large fraction of the impulse is now produced at
a pressure far from the nozzle's design point. The correct fix for a
progressive trace is geometric: slots, taper, end faces, or a different
family. A grader should award nothing for "it reduces the pressure" without
the observation that the *ratio* is untouched.

**P2 — corner rules and which dominates.**
A propellant spoke tip is a *re-entrant* corner of the port. Offsetting the
port outward, the two adjacent offset faces intersect each other and destroy
boundary; the apex retreats along its bisector at $r/\sin\psi$, which for a
half-angle $\psi$ of 30–60° is 1.15–2× the burn rate. It is gone quickly and
takes perimeter with it (a rate $-2\cot\psi$ per unit offset, per corner).
A star point tip is a *convex* corner of the port; the offset faces do not
meet, and the corner opens into an arc of radius $u$ spanning $\pi - 2\theta$.
It adds perimeter at rate $(\pi - 2\theta)$ per corner per unit offset, and it
never disappears — it only grows and eventually merges with its neighbours.

Which dominates: exactly the competition in Eq. 3.7. Per half-sector the tip
adds $(\pi/2 - \theta)$ and the valley subtracts $\cot(\beta+\theta)$. For
small $N$ (large $\beta$) the cotangent is small and the tip wins → progressive.
For large $N$ the cotangent is large and the valley wins → regressive. The
neutral $\theta$ is where they balance, Eq. 3.9. In *time*, the valley effect
terminates when the flanks vanish at $u_1$; after that only tip arcs remain,
so **the tip always wins eventually** and every star goes progressive in
Phase II.

**P3 — star versus end burner, same $A_t$, same initial $A_b$, same impulse.**

- *Burn time*: the end burner, by a large margin. Same $A_b$ and same $A_t$
  means the same $K_n$, hence the same $p_c$ and the same $r$; burn time is
  then web over rate. The star's web is a fraction of the case radius; the end
  burner's web is its whole length. For the same total impulse (same
  propellant mass) the end burner must be long and narrow, and its web is that
  length.
- *Case mass*: the same, or slightly favouring the end burner. Both run at the
  same pressure, but the star is progressive/near-neutral by design while the
  end burner is exactly neutral; if the star is deep and progressive its peak
  is higher and its case is heavier. If both are neutral, the case pressures
  are equal and the difference is length and diameter — the end burner's
  smaller diameter reduces hoop stress for the same pressure, so its case wall
  is thinner but longer. Net: close, slight edge to the end burner.
- *Insulation*: the end burner, decisively heavier. In a case-bonded star the
  case wall is covered by propellant until the local web burns through, so
  most of the wall is exposed only near the end of the burn. In an end burner
  the wall behind the receding face is exposed for the remainder of the burn,
  so the forward end sees gas for essentially the whole burn time. Insulation
  thickness scales with exposure duration; the end burner pays for a full-burn
  exposure over most of its length. This is the reason long end burners are
  used for low thrust and not for high impulse.

**P4 — why Eq. 3.9 has no radii.**
Because $P(u)$ is linear (Eq. 3.7) and the slope $P'$ is
$2N[(\pi/2-\theta) - \cot(\beta+\theta)]$: the radii enter only through the
intercept $2Ns_0$. Physically, the *rate* at which perimeter is created and
destroyed is a property of the corner angles — how much arc a corner opens
per unit offset, and how much flank a wedge eats per unit offset — and angles
are scale-free. Scaling the whole cross-section by a factor $\lambda$ scales
every length by $\lambda$ and leaves every angle alone, so $P(u)$ becomes
$\lambda P(u/\lambda)$: the same shape of curve, stretched. The radii control
$R_p$ (hence the web at the tip, hence burn time and where Phase II starts),
$R_i$ and $A_0$ (hence port area and volumetric loading), and $L$ (hence the
absolute $A_b$ and therefore $K_n$ and pressure). Shape of trace: angles.
Duration and magnitude: radii and length.

**P5 — which end of the temperature range sizes what.**
*Hot (+60 °C) sizes the case.* $\pi_K = \sigma_p/(1-n) > 0$: hot propellant
burns faster, chamber pressure rises, and the maximum expected operating
pressure is a hot-day number. With $\sigma_p = 0.0022$ K⁻¹, $n = 0.35$ and a
40 K excursion above nominal, that is a 15 % pressure margin the case must
carry.
*Cold (−40 °C) sizes the grain structure.* Propellant modulus rises and
strain capability falls as temperature drops toward $T_g$, while the
cure-shrinkage plus thermal-contraction strain at the bore is *largest* at
the coldest temperature (the grain has contracted furthest relative to the
case it is bonded to). Maximum imposed strain and minimum capability coincide
at the cold end. So the star tip at −40 °C is the structural design point and
the case membrane at +60 °C is the pressure design point. `[SP-8073]`

**P6 — more points, lower loading.**
From the §3.6 table, neutral $\theta$ rises monotonically with $N$: 14.8° at
$N=8$, 25.1° at $N=11$, 34.8° at $N=16$. A larger $\theta$ is a *wider* star
point — the port wedge subtends more angle. Simultaneously, Eq. 3.11 forces
$R_p$ outward as $N$ rises (the Phase-I limit $u_1/R_p$ shrinks with $N$, so
$R_p/R_o$ must grow to keep the burn inside Phase I). Wider points reaching
further out is more void: $A_{port}$ up, propellant down. Concretely, the
$N=8$ neutral star of WE 21.3 gives $V_L = 0.754$; the $N=10$ neutral star of
C3 gives $V_L = 0.656$ in a comparable case. Adding points to buy neutrality
costs loading roughly linearly.

**P7 — "the sliver burns, so ignore it".** Two independent reasons it is wrong:

1. *Efficiency.* The sliver burns on a collapsing surface, so $K_n$ falls, so
   $p_c$ falls, so both $c^*$ efficiency and $C_F$ fall — the nozzle is now
   badly overexpanded and, at sea level, may separate. The same mass delivers
   materially less impulse than it would have at design pressure. Impulse is
   not conserved just because mass is.
2. *Dispersion.* Tail-off is where motor-to-motor scatter lives. The sliver
   geometry is the part most sensitive to mandrel placement, bore roundness,
   liner thickness and local rate variation, and it burns at low pressure
   where $r$ is least well characterised and the extinction limit is nearest.
   A 14 % sliver is 14 % of the impulse delivered with the worst uncertainty
   in the motor. For a stage with a total-impulse specification, that alone
   can be disqualifying (see R5).

**P8 — igniter sized against surface and free volume.**
The igniter must (i) deposit enough energy per unit area on *every* burning
surface to bring it to ignition temperature within the specified interval, and
(ii) pressurise the free volume to the self-sustaining level. Neither is a
function of propellant mass. (i) scales with $A_b(0)$; (ii) scales with the
port volume divided by igniter mass flow. Propellant mass enters only
indirectly through geometry.
Order-of-magnitude example: a 100 kg end burner presents one case
cross-section — say 0.06 m² — and almost no free volume. A 100 kg wagon-wheel
grain of the same diameter presents several square metres of slot wall and
has a large port. Same mass, an order of magnitude difference in both the
surface to be lit and the volume to be filled, and therefore in the igniter.
`[SP-8051]`

---

### Calculation

**C1 — CP tube, $R_{i0}=0.200$, $R_o=0.320$, $L=4.00$ m, $p_{c0}=4.50$ MPa.**

(a) Web $= 0.320-0.200 = \mathbf{0.120}$ m. Web fraction $=0.120/0.320
= \mathbf{0.375}$.
$V_L = (0.320^2-0.200^2)/0.320^2 = (0.1024-0.0400)/0.1024 = \mathbf{0.609}$.

(b) $A_{b0} = 2\pi(0.200)(4.00) = \mathbf{5.0265}$ m².
$K_n = (4.50\times10^6)^{0.65}/111.07 = 21{,}114/111.07 = \mathbf{190.1}$.
$A_t = 5.0265/190.1 = \mathbf{0.026441}$ m² → $D_t = \mathbf{0.1835}$ m
(183.5 mm).

(c) $A_{bf} = 2\pi(0.320)(4.00) = \mathbf{8.0425}$ m²;
$K_{nf} = 8.0425/0.026441 = \mathbf{304.2}$;
$p_{cf} = (111.07\times304.2)^{1/0.65} = \mathbf{9.273}$ MPa.
Ratio $= 9.273/4.50 = \mathbf{2.061}$, and check:
$(R_o/R_{i0})^{1/(1-n)} = 1.6^{1.5385} = 2.061$. ✓

(d) $m_p = 1770\,\pi\,(0.1024-0.0400)(4.00) = \mathbf{1388}$ kg.

(e) $J_0 = \pi(0.200)^2/0.026441 = 0.12566/0.026441 = \mathbf{4.75}$.
Comfortable — no erosive-burning concern at ignition.

(f) $t_b = \int_0^{0.12} dw/r$ with $r = a\,p_c(w)^{0.35}$ and $p_c(w)$ from
Eq. 3.2. Midpoint rule, 40 001 intervals: $t_b = \mathbf{12.40}$ s.
Rate at ignition 8.46 mm/s, at burnout 10.90 mm/s. A crude check —
web divided by the rate at the arithmetic-mean pressure (6.89 MPa,
$r = 9.81$ mm/s) — gives 12.2 s, within 2 %. Full marks for any stated
numerical method landing in 12.2–12.6 s; no marks for $w/r_0 = 14.2$ s
without acknowledging that $r$ rises through the burn.

**C2 — end burner, $F=1.20$ kN, $t_b=200$ s, $C_F=1.60$, $p_c=3.00$ MPa.**

$r = 5.0(3.00)^{0.35} = \mathbf{7.3445}$ mm/s.
$L = r t_b = 0.0073445\times200 = \mathbf{1.4689}$ m.
$A_b = F/(C_F c^* \rho_p r) = 1200/(1.60\times1580\times1770\times0.0073445)
= \mathbf{0.036515}$ m² → $D = \mathbf{0.2156}$ m. $L/D = \mathbf{6.81}$.
$\dot m = F/(C_F c^*) = 1200/2528 = \mathbf{0.47468}$ kg/s.
$A_t = \dot m c^*/p_c = 0.47468\times1580/3.00\times10^6
= \mathbf{2.500\times10^{-4}}$ m² → $D_t = \mathbf{17.84}$ mm.
$K_n = 0.036515/2.500\times10^{-4} = \mathbf{146.1}$.
Check: `solid_equilibrium_pressure` returns 3.0000 MPa. ✓
$m_p = 1770\times0.036515\times1.4689 = \mathbf{94.94}$ kg.
$I_{tot} = 1200\times200 = \mathbf{240}$ kN·s.
$I_{sp} = C_F c^*/g_0 = 1.60\times1580/9.80665 = \mathbf{257.8}$ s
(equivalently $240{,}000/(94.94\times9.80665) = 257.8$ s ✓).

*Comment.* $L/D = 6.8$ is buildable but is at the edge. A slender case is
bending-critical, the grain slumps in horizontal storage, and the end-burner
coning problem grows with length. Ways out, in order of preference: accept a
higher $p_c$ (raises $r$, shortens $L$, at the cost of a heavier case and a
smaller throat), or split into two shorter grains burning in parallel from a
common chamber, or accept a lower thrust. A candidate who reports $L/D$
without comment loses marks; the number is the point of the problem.

**C3 — neutral 10-point star, $R_o = 0.250$ m, $L = 2.00$ m, $f = 6$ mm.**

(a) $\beta = \pi/10 = 18.000°$. Solving
$\pi/2 - \theta = \cot(\beta+\theta)$ by bisection:
$\theta = \mathbf{22.200°} = 0.38747$ rad. (Check: LHS $=1.18333$;
$\cot(40.200°) = 1.18333$. ✓ $P' = 0$ to five significant figures.)

(b) $u_1/R_p = \sin\beta/\cos(\beta+\theta) = 0.309017/0.763718
= \mathbf{0.40458}$.
Setting $R_o - R_p = u_1$: $R_p = R_o/(1+0.40458) = 0.250/1.40458
= \mathbf{0.17799}$ m. Web at the tip $= 0.250-0.17799
= \mathbf{0.07201}$ m.

(c) $\sin(\beta+\theta) = \sin(40.200°) = 0.645562$.
$s_0 = R_p\sin\beta/\sin(\beta+\theta) = 0.17799\times0.309017/0.645562
= \mathbf{0.085213}$ m.
$R_i = R_p\sin\theta/\sin(\beta+\theta) = 0.17799\times0.377876/0.645562
= \mathbf{0.104193}$ m.
$P_0 = 2Ns_0 = 20\times0.085213 = \mathbf{1.704256}$ m.
$A_0 = N R_p R_i \sin\beta = 10\times0.17799\times0.104193\times0.309017
= \mathbf{0.057308}$ m².
Actual initial valley radius $= R_i + f/\sin(\beta+\theta)
= 0.104193 + 0.006/0.645562 = \mathbf{0.11349}$ m.
$A_{b0} = L(P_0 + P'f) = 2.00\times1.704256 = \mathbf{3.4085}$ m²
(the $P'f$ term vanishes at exact neutrality).
$A_{port}(f) = A_0 + P_0 f = 0.057308 + 0.010226 = \mathbf{0.067533}$ m².
Case bore area $=\pi(0.250)^2 = 0.196350$ m².

$$V_L = \frac{0.196350-0.067533}{0.196350} = \mathbf{0.656},
\qquad m_p = 1770\times0.128817\times2.00 = \mathbf{456.0\ kg}$$

Sliver: at $u = 0.07201$, $A_{port} = 0.057308+1.704256\times0.07201
= 0.180019$ m², so the remaining area is $0.196350-0.180019 = 0.016331$ m²,
i.e. $\mathbf{12.7\%}$ of the propellant.

(d) Available burn distance $= u_1 - f = 0.07201-0.006 = \mathbf{0.06601}$ m.

*Comment worth marks.* $V_L = 0.656$ against WE 21.3's 0.754 for $N=8$ in a
comparable case: this is P6 made numerical. Ten points bought a slightly
different neutrality with a 10-point loss in loading.

**C4 — amplification.**

(a) $n = 0.35$: $p_2/p_1 = 1.04^{1/0.65} = 1.04^{1.53846} = 1.0622$ →
$\mathbf{+6.22\%}$.
(b) $n = 0.55$: $1.04^{1/0.45} = 1.04^{2.2222} = 1.0911$ →
$\mathbf{+9.11\%}$.
(c) $\pi_K = \sigma_p/(1-n) = 0.0022/0.65 = \mathbf{3.385\times10^{-3}}$ K⁻¹.
$p_2/p_1 = \exp(3.385\times10^{-3}\times30) = \mathbf{1.1069}$, i.e.
$\mathbf{+10.7\%}$.
(d) Both: $1.0622\times1.1069 = \mathbf{1.1757}$, $+17.6$ %. So a nominal
6.0 MPa design runs at 7.05 MPa on a hot day with a fast lot — before any
allowance for $A_b$ tolerance, throat erosion or measurement uncertainty. The
maximum expected operating pressure must be built up from the *product* of
independent factors, and the case sized against that, which is why MEOP
routinely sits 25–40 % above nominal. A student who adds the percentages
(6.2 + 10.7 = 16.9 %) rather than multiplying is nearly right here and badly
wrong for larger excursions; note it but do not fail it.

**C5 — reading the trace backwards, $n = 0.30$.**

(a) $A_{b2}/A_{b1} = (6.9/5.2)^{1-n} = 1.32692^{0.70} = \mathbf{1.219}$,
i.e. $+21.9$ %.
(b) At constant $A_b$, $K_n \propto 1/A_t$, so $A_t$ must change by the
reciprocal factor: $A_{t2}/A_{t1} = 1/1.219 = 0.8203$, i.e.
$\mathbf{-18.0\%}$. Diameter falls as the square root:
$\sqrt{0.8203} = 0.9057$, so $D_{t2} = 0.9057\times184 = 166.6$ mm — a radial
change of 8.7 mm. **But note the sign:** throat *erosion* makes the throat
larger, which lowers $K_n$ and lowers pressure. A throat that has *shrunk* is
deposition — slag or aluminium-oxide accumulation, or a liner that has
swelled. So the honest statement is: an 18 % *reduction* in $A_t$ would
explain it, and the mechanism is throat blockage, not erosion. Full marks
require catching this; it is the point of the part.
(c) Third candidate: **a grain crack** exposing new burning surface.
Discriminator: a design or manufacturing error produces a *smooth* deviation
that *repeats* motor-to-motor; blockage correlates with post-fire throat
measurement and with propellant aluminium loading; a crack usually appears as
a knee or step rather than a smooth ramp, does not repeat, and correlates
with the individual motor's storage and thermal history. The three cheap
tests are: measure the throat after the firing, overlay the traces from the
lot, and X-ray/CT the remaining motors.

**C6 — fillet 8 mm → 14 mm on the WE 21.3 star.**

With $P_0 = 2.035743$ m, $P' = 0.092345$ m/m, $A_0 = 0.053321$ m²,
$L = 3.00$ m, $A_t = 0.0265904$ m², case bore area $0.282743$ m²:

| | $f = 8$ mm | $f = 14$ mm |
|---|---|---|
| $A_{b0} = L(P_0+P'f)$ | 6.10944 m² | 6.11110 m² |
| $K_n(0)$ | 229.76 | 229.82 |
| $p_c(0)$ | 6.0230 MPa | 6.0255 MPa |
| $A_{port}(0)$ | 0.069610 m² | 0.081831 m² |
| $V_L$ | 0.7538 | 0.7106 |
| propellant mass | 1131.7 kg | 1066.8 kg |
| available burn distance | 0.0896 m | 0.0836 m |

Burning area changes by $+0.027$ %, pressure by $\mathbf{+0.042\ \%}$ —
negligible. **The throat does not need re-sizing**; restoring exactly 6.000
MPa would take $D_t$ from 184.00 to 184.25 mm, which is inside machining and
erosion tolerance.

But that is not the whole answer. The fillet change is nearly free
*ballistically* because this grain is neutral — $P'$ is almost zero, so moving
along the burn-back family barely changes perimeter. It is expensive
*everywhere else*: port area up 17.6 %, volumetric loading down 4.3 points,
**propellant mass down 64.9 kg (5.7 %)**, and available burn distance down
6.7 %, so total impulse falls about 6 % and burn time about 7 %. The lesson:
in a neutral star the fillet is cheap in pressure and expensive in impulse; in
a progressive star ($P' \gg 0$ — the deep star of WE 21.3 Step 7 has
$P' = 4.478$) the same 6 mm would move $A_b$ by about 0.8 % and $p_c$ by
about 1.2 %. Which discipline should worry about a fillet change depends on
where the design sits on the neutrality curve.

**C7 — dual-thrust, ratio 7.5, $n = 0.35$.**

(a) At fixed $A_t$ and $C_F$, $F \propto p_c$ and $p_c \propto A_b^{1/(1-n)}$,
so $A_{b,\mathrm{boost}}/A_{b,\mathrm{sus}} = 7.5^{1-n} = 7.5^{0.65}
= \mathbf{3.705}$.
(b) $r \propto p_c^{\,n}$ at fixed propellant, so
$r_{\mathrm{boost}}/r_{\mathrm{sus}} = 7.5^{0.35} = \mathbf{2.024}$.
(c) Web consumed in each phase is $w = r t$. With $t_{sus} = 10\,t_{boost}$:

$$\frac{w_{sus}}{w_{boost}} = \frac{r_{sus}t_{sus}}{r_{boost}t_{boost}}
= \frac{10}{2.024} = \mathbf{4.94}$$

So the sustain phase consumes about five times as much web as the boost
phase; the boost geometry occupies only the innermost $1/5.94 = 17$ % of the
total web. **The boost features must live close to the bore** — shallow
slots, a shallow star or a short fin section near the port — and everything
outboard of them must be plain sustain geometry. A design that puts the boost
features deep into the web will not transition where it was meant to. This is
also why the transition time is temperature-sensitive: it occurs at a fixed
*web*, and the web-to-time conversion moves with $\pi_K$.

**C8 — RSRM mean burning area.**

From `_verify-solid-coldgas.md` §A.1: propellant mass $\approx 500{,}000$ kg
per motor (conf **B**), burn time $\approx 123$–124 s (conf **A**), case
diameter 3.71 m, $p_c \approx 6.25$ MPa nominal (conf **B**).

$$\dot m_{avg} = \frac{500{,}000}{123.5} = 4049\ \mathrm{kg/s},
\qquad A_b\,r = \frac{\dot m}{\rho_p} = \frac{4049}{1770} = 2.287\ \mathrm{m^3/s}$$

| assumed $r$ | implied mean $A_b$ |
|---|---|
| 8 mm/s | 286 m² |
| 10 mm/s | 229 m² |
| 12 mm/s | 191 m² |

**Assumptions, stated:** (i) PBAN/AP/Al density taken as 1770 kg/m³ — the
verification file does not publish it; (ii) burn rate 8–12 mm/s, a generic
composite range at ~6 MPa — **the verification file does not publish the RSRM
burn rate at all**; (iii) mass-averaged rather than instantaneous, so this is
a mean over a trace known to vary; (iv) all propellant burns within the action
time.

**Least trustworthy input: the burn rate**, by a wide margin. It is not
published, the answer is directly inversely proportional to it, and the
plausible range spans a factor of 1.5. So the answer is $A_b \approx 230$ m²
with a factor-of-1.5 uncertainty, and no more precision than that is
defensible. Density is second (±5 %). Propellant mass and burn time are the
trustworthy inputs.

*Sanity cross-check worth marks:* the case bore area is
$\pi(3.71)^2/4 = 10.8$ m², and the propellant column is roughly 35 m long.
A mean $A_b$ of 229 m² over 35 m implies a mean burning perimeter of
$\approx 6.5$ m, i.e. a mean port radius near 1.04 m against a case radius of
1.855 m. That is a sensible mid-burn port for a motor with a web fraction of
order 0.5, so the estimate closes. A student who produces a number without
this check has not finished.

---

### Engineering reasoning

**R1 — hot and cold firings.**

*The +12 % pressure and −11 % duration are one observation, not two.* Under a
temperature change the coefficient $a$ moves; $p_c \propto a^{1/(1-n)}$ and
$r = a p_c^{\,n} \propto a^{1/(1-n)}$, so **rate and pressure scale together
one-for-one** and $t_b \propto 1/p_c$. A 12 % pressure rise *must* come with a
$1 - 1/1.12 = 10.7$ % duration reduction, because total impulse is fixed by
propellant mass and $A_t$. Observed −11 %. **Expected and self-consistent.**
The product check $1.12\times0.89 = 0.997$ is the one-line version and should
be the first thing the candidate writes.

*Is the magnitude right?* An 80 K span giving 12 % requires
$\pi_K = \ln(1.12)/80 = 1.42\times10^{-3}$ K⁻¹, hence
$\sigma_p = \pi_K(1-n) \approx 9.2\times10^{-4}$ K⁻¹ at $n = 0.35$. That is at
the *insensitive* end of the published range for composites but not
implausible. Action: check it against the strand-burner temperature data for
the lot. If the strand data says $\sigma_p = 3\times10^{-3}$ K⁻¹, the firings
and the propellant characterisation disagree and one of them is wrong.

*The cold-only 2 MPa spike in the first 80 ms is the anomaly.* It is not a
temperature-sensitivity effect — those are smooth and scale the whole trace.
Candidates, in order:

1. **Cold-induced cracking or bore-surface damage**, most likely at the star
   tips or slot roots, where cure-shrinkage plus thermal-contraction strain
   peaks and where propellant capability is lowest. New surface → amplified
   pressure. It is *transient* because, per §3.4, burn-back rounds sharp
   features at radius $u$: a few millimetres of web and the crack has burned
   into a benign contour, and the trace rejoins prediction. That transience is
   the signature. `[SP-8073]`
2. **Igniter over-performance into a cold, dense free volume**, or a slower
   grain that lets igniter products accumulate before the main surface takes
   over. Would correlate with igniter lot, not with motor storage history.
3. A debonded liner strip lifting and exposing area — same early signature as
   (1), but it would not necessarily heal.

*What to inspect:* X-ray/CT of cold-conditioned motors **before** firing;
section a cold-conditioned motor and examine the bore at the star tips; review
the thermal conditioning profile (the rate of cool-down matters as much as the
soak temperature); overlay the first 200 ms of head-end pressure at high
sample rate across several cold firings to see whether the spike is repeatable
(design/geometry) or scattered (damage).

**R2 — head-to-aft $\Delta p$ decaying, aft web thinner.**

*Diagnosis: erosive burning at the aft end.* Mechanism: at ignition the port
is at its smallest, so the mass flux $G = \dot m/A_{port}$ is highest, and it
is highest at the *aft* end because the whole motor's gas passes there. Above
the propellant's threshold flux the local burn rate is augmented, so the aft
end burns faster — which is exactly the 6 mm of extra web consumed. It decays
because as the port opens $G$ falls below threshold; by 40 s the axial
$\Delta p$ is just ordinary friction and momentum pressure drop. The 8 %
head-to-aft $\Delta p$ is direct evidence of high port Mach number.

The consequences are not cosmetic: the aft web burns through early, exposing
insulation and case ahead of schedule; the trace shows a hump above prediction
early; and the burn-back code, which assumed uniform $r$, is now wrong
everywhere downstream of the anomaly.

*Two geometric fixes:*

1. **Taper the bore** — make the port conical, larger aft. This is the RSRM
   aft-segment solution (`[NASA-SRB]`: double-truncated-cone perforations in
   the aft segments) and it is the cleanest, because it puts port area exactly
   where the flux is. Loading penalty: the removed propellant is a cone shell;
   for a 10 % aft radius increase over the aft half of a grain with a 0.5 web
   fraction, expect 3–5 points of $V_L$.
2. **Add one or two circumferential slots near the aft end.** Cheaper in
   propellant (a slot is a thin disc of removed material) and it also adds
   burning surface, which offsets part of the trace loss. Loading penalty
   typically 1–2 points. The cost is two new stress concentrations at the slot
   terminations and a harder mandrel.

A third, non-geometric option — a propellant with a higher erosive threshold
— should be named and rejected: it needs re-qualification and does not address
the root cause, which is that $J$ is too low.

**R3 — fillet reduced from 12.7 mm to 6 mm.**

*Causal chain.* (i) The fillet is the notch radius at the star tip, and the
elastic stress-concentration factor at a notch scales roughly as
$1+2\sqrt{c/f}$: halving $f$ raises $K_t$ by about $\sqrt{2}$, i.e. ~40 % more
peak strain at the most highly strained point in the grain. (ii) That point is
already the design-critical location, because cure shrinkage plus cool-down
puts the grain into hoop tension with the maximum strain at the innermost
surface, and the maximum occurs at the coldest temperature, where the
propellant's strain capability is lowest. (iii) The margin that existed at
12.7 mm did not exist at 6 mm. (iv) Storage is a *cumulative damage* process:
thermal cycles dewet the binder from the filler, the modulus falls, and
microcracking accumulates. Two years of cycling then produced cracks large
enough to fail X-ray acceptance. The failure was seeded on the day of the
change and took two years to become visible — which is precisely why nobody
caught it in the ballistics review. (v) Note what the ballistics review saw:
a 1.5 % pressure reduction. It was correct. The change was reviewed against
the wrong discipline's criterion.

*What should have been required.* (1) A grain structural analysis to
`[SP-8073]` at the cold qualification temperature with the *new* fillet,
reporting margin against strain capability, not just stress. (2) Propellant
mechanical characterisation at the relevant temperature and strain rate —
modulus and strain-to-failure are strongly rate- and temperature-dependent,
so a room-temperature tensile test proves nothing. (3) Accelerated-ageing and
thermal-cycling coupons or subscale grains with the new geometry.
(4) An explicit statement that this is a *joint* structural and ballistic
change requiring both signatures — the process failure here is governance,
not analysis. (5) A disposition plan for motors already built to the old
drawing.

**R4 — segmented versus monolithic.**

| | segmented (4-segment) | monolithic |
|---|---|---|
| trace shaping | **Best.** Each segment gets its own perforation: a regressive star forward and tapered CP aft, as in the RSRM `[NASA-SRB]` | Shaping must be axial within one grain: fins, slots, taper. Fewer degrees of freedom, more analysis |
| mass fraction | **Worse.** RSRM ≈ 0.85 `[WP]` — joints, tang-and-clevis hardware, thicker joint regions | **Better.** P120C ≈ 0.924 `[WP]` — one filament-wound case, no joints |
| transport | **Better.** Segments ship by rail or road; casting can be far from the pad | Case and loaded motor must move in one piece; effectively forces casting near the launch site |
| inspection | Each segment inspected and rejected individually; but the assembled joints must then be inspected in the field | Whole motor inspected once; a defect condemns the whole article |
| failure modes | Field joints: the RSRM STS-51-L joint-rotation and O-ring failure is the canonical case `[Rogers Commission]`. Also joint insulation and propellant-to-propellant interfaces at segment faces | No joints. Failure modes concentrate in the case winding, the liner bond and the nozzle |

*Recommendation, 2,000 km overland:* **segmented.** The transport constraint
is binding and physical; you cannot argue it away. Accept the ~7-point mass
fraction penalty and the joint qualification burden, and *use* the freedom you
have paid for — give each segment its own perforation and shape the trace
properly, which is the compensation the architecture offers. Design the joints
with mechanical rotation limits and redundant seals from the start rather than
after an accident.

*Recommendation, assembled next to the casting facility:* **monolithic
filament-wound.** The mass-fraction gain is decisive and free, the worst
failure mode in the segmented architecture simply does not exist, and the
trace shaping — while harder — is a solved problem with fins, slots and taper.
This is the direction the industry has moved (Vega/Vega-C, P120C, GEM, Orion,
Castor 120), and the exceptions are exactly the motors that must be shipped.

*The reasoning that differs:* in the first case the binding constraint is
logistics and the grain freedom is a consolation prize; in the second the
binding constraint is mass fraction and the analysis burden is a price worth
paying. A candidate who says "monolithic is better" without engaging the
transport constraint has missed the historical point of the RSRM entirely.

**R5 — ±1.8 % total-impulse dispersion, traces diverging after 85 % web.**

*Most likely cause: sliver / tail-off dispersion.* The evidence points
straight at it. Traces that overlay for 85 % of the burn exclude the causes
that would show up early or throughout — burn-rate lot variation (shifts the
whole trace), throat area tolerance (shifts the whole trace), conditioning
temperature (shifts the whole trace and its duration together) and
mandrel/bore tolerance (shifts $A_b$ from $t=0$). What is left is the part of
the geometry that only participates at the end: the residual propellant near
the case, which burns at low and falling pressure on a collapsing surface, and
whose shape is set by the least well-controlled dimensions in the motor —
liner thickness, insulation thickness, local bore roundness, and the exact
place where the web first breaks through.

*Two design changes available:*

1. **Reduce the sliver geometrically.** Change the perforation so the web
   breaks through more nearly simultaneously around the circumference — move
   the star points outward (Eq. 3.11), add points, or move to a finocyl.
   Effective, and it also raises delivered $I_{sp}$ by delivering more of the
   impulse at design pressure.
2. **Terminate the tail deliberately.** Contour the liner and insulation so
   the residual burns out faster and more repeatably; in the limit, accept a
   shorter action time and specify total impulse to a defined cut-off pressure
   rather than to burnout.

*For a motor already in production:* neither is cheap. Option (1) means new
tooling, new burn-back qualification, new structural analysis and new static
firings — a year and several motors. The right answer for a production article
is usually a third option: **change the specification and the acceptance
method, not the motor.** Characterise the tail-off statistically across the
lot, measure it on every lot-acceptance motor, and if the vehicle can trim the
dispersion downstream (an upper stage almost always can, via burn-to-depletion
accounting or a downstream trim), buy the margin there. Recommend (1) only if
the dispersion is genuinely mission-critical and cannot be absorbed downstream
— and then recommend it for the *next* block, flying the current block on
characterised dispersion. State the reasoning explicitly: a 1.8 % impulse
dispersion is a systems problem before it is a grain problem, and a grain
change usually costs more than the dispersion does.

---

## K2. Quiz answers

**Q1 (8) — (c) 8.7 %.**
$1.05^{1/(1-0.42)} = 1.05^{1.7241} = 1.0878$, i.e. **+8.78 %**.
(a) 5.0 % is the answer for $n=0$ — no amplification; a student choosing it
has not internalised Eq. 3.4. (b) 7.2 % corresponds to $n\approx0.31$.
(d) 11.9 % corresponds to $n\approx0.57$.

**Q2 (8) — (c) end burner.**
$V_L \approx 0.90$–0.95: the only geometry with essentially no port.
(a) A neutral star is 0.65–0.80 — the perimeter costs port area.
(b) A wagon wheel is worse still, because the slots are deep voids and the
sliver is large.
(d) A CP tube can reach 0.85+ with a small bore, but then $J$ collapses and
the trace is savagely progressive; at a usable bore it is 0.60–0.80.
The common wrong answer is (b), from confusing "high $K_n$" with "high
loading" — they are opposites.

**Q3 (10) — (c), identical to the sharp grain's surface at burned distance
$y+f$.**
Because burning is a parallel offset (§3.4), the family of surfaces generated
by a sharp reference geometry is one-parameter, and a fillet of radius $f$ is
precisely that family evaluated at offset $f$. So the filleted grain starts at
$u=f$ and reaches $u=f+y$ after burning $y$. This is why the module
parameterises the star by $u = f+y$ and why a fillet change is a ballistic
change.

**Q4 (12).** $A_{b0} = 2\pi(0.10)(2.5) = 1.5708$ m²;
$K_{n0} = 1.5708/0.0090 = 174.5$;
$p_{c0} = (111.07\times174.5)^{1/0.65} = \mathbf{3.946}$ MPa.
$A_{bf} = 2\pi(0.25)(2.5) = 3.9270$ m²; $K_{nf} = 436.3$;
$p_{cf} = \mathbf{16.16}$ MPa.
Ratio $= \mathbf{4.095}$, and $= (0.25/0.10)^{1/0.65} = 2.5^{1.53846}$. ✓
Award full marks only if the ratio is also recognised as
$(R_o/R_{i0})^{1/(1-n)}$; that identity is the physics. Note in passing that a
16 MPa peak is not a flyable design — this is a demonstration of why the
inhibited CP tube is not used at this web fraction.

**Q5 (10) — (d).**
A pressure exponent near 1 is a *stability* problem (Module 20: the
equilibrium in Eq. 3.2 is unstable for $n \ge 1$), not a reason to want a
regressive trace, and a regressive grain does nothing about it.
(a) is valid — the RSRM's forward star exists for exactly this `[NASA-SRB]`.
(b) is valid — boost–sustain is a deliberately regressive trace.
(c) is valid — with a peak-pressure-limited case, front-loading the trace and
letting it decay uses less case for the same impulse than letting it rise to
the limit at the end.

**Q6 (12).** From the §3.6 table, $N = 9$ → $\theta = \mathbf{18.84°}$
(0.32882 rad; check $\pi/2-\theta = 1.24198$ and $\cot(20°+18.84°) = 1.24198$).
$\beta = 20.000°$; $u_1/R_p = \sin20°/\cos(38.84°) = 0.342020/0.778893
= 0.43911$.
$R_p = R_o/(1+0.43911) = 0.40/1.43911 = \mathbf{0.27795}$ m.
Web at the tip $= 0.40-0.27795 = \mathbf{0.12205}$ m.
$s_0 = R_p\sin\beta/\sin(\beta+\theta) = 0.27795\times0.342020/0.627145
= \mathbf{0.15158}$ m.
(For interest: $R_i = 0.14312$ m and $P_0 = 18\,s_0 = 2.7285$ m.)

**Q7 (10) — Yes, consistent, and both numbers must be checked.**
$\pi_K = 0.0022/0.65 = 3.385\times10^{-3}$ K⁻¹; $\Delta T = 12$ K, so
$p_2/p_1 = \exp(3.385\times10^{-3}\times12) = \mathbf{1.0415}$, i.e. +4.15 %
against the observed +4.1 %. ✓
Duration: under a temperature change $a$ moves, and since
$p_c \propto a^{1/(1-n)}$ and $r = a p_c^{\,n} \propto a^{1/(1-n)}$, rate and
pressure scale identically, so $t_b \propto 1/p_c$:
$1-1/1.0415 = \mathbf{3.99\ \%}$ shorter against the observed 3.9 %. ✓
Product check: $1.041\times0.961 = 1.000$ — total impulse conserved, as it must
be for the same propellant mass and throat. **Yes.**
The common error is to use $r \propto p_c^{\,n}$ and predict only 1.4 %
shorter; that scaling applies when $A_b$ changes at fixed $a$, not when
temperature changes $a$. Half marks for a correct pressure calculation carrying
that error into the duration.

**Q8 (10) — (b).**
(a) is wrong: in a case-bonded grain the sliver burns; nothing is expelled
unburnt. (c) is wrong: slivers are a property of the perforation, and
case-bonded stars are the classic sliver producers. (d) is wrong: sliver
fraction depends strongly on $N$, $\theta$ and $R_p$ — WE 21.3 gives 14.2 %
for one 8-point design and C3 gives 12.7 % for a 10-point design in a
different case.

**Q9 (10) — initially close to neutral; sharply regressive once the slot tips
have burned back past the slot depth.**
Reasoning from the corner rules: the slot *walls* are parallel straight
segments, and a parallel offset of a straight segment is a straight segment of
the same length — it translates without changing length, so it contributes
nothing to $dP/du$. The slot *tips* are already rounded and contribute a
growing arc, as does the bore between slots; against these, the re-entrant
corners where each slot meets the bore eat perimeter. In a well-proportioned
wagon wheel these balance early: near neutral. Once the offset exceeds the
slot depth the slots are gone — there are no walls left to translate, the
propellant spokes between them are narrow wedges being consumed from both
sides at $r/\sin\psi$, and the perimeter collapses toward a plain circle.
Sharply regressive, with a large sliver. Full marks require both halves and at
least one corner-rule justification; "wagon wheels are regressive" alone earns
half.

**Q10 (10) — 3⅓ marks each, round up.**
(a) *Pressure 6 % high, shape and time ratio correct.* A uniform scale factor
on $K_n$ or on $a$: most likely a propellant lot burning fast, a throat
machined small, or conditioning above nominal. **Discriminating measurement:
the throat diameter (before and after) together with the lot's strand
burn-rate data.** If both are nominal, check the conditioning record; if all
three are nominal, check $A_b$ by grain dimensional inspection.
(b) *Correct at start, 25 % high at the end, smooth ramp.* A progressive
geometry error, or throat blockage/slag accumulation, or an $A_b$ error that
grows with web (an off-centre mandrel: the thin side burns through and the
trace departs). **Discriminating measurement: post-fire throat inspection.**
A nominal throat points at geometry; then section a motor.
(c) *Correct for 30 s, then a 15 % step, no change in shape afterwards.* A
discrete new surface appearing at 30 s: a crack opening, a liner debond, or an
inhibitor failing and releasing a previously inert end face. **The step with
unchanged subsequent shape is the signature** — the new area is constant
thereafter. Discriminating measurement: X-ray/CT the remaining motors of the
lot, and inspect post-fire insulation and inhibitor remains for the debonded
region. Erosive burning does not do this (it decays) and temperature does not
do this (it scales the whole trace).

---

## K3. Trade-study reference solution (T1)

**Setup.** Fixed case: $L = 3.00$ m, $R_o = 0.300$ m (case bore area
$0.282743$ m²), P-1770, ends inhibited, MEOP 9.0 MPa. Constraints:
(i) $p_c \le 9.0$ MPa **hot**, (ii) $t_b \ge 12$ s, (iii) $J_0 \ge 2.0$.
Objective: maximum total impulse — at roughly constant $I_{sp}$, maximum
propellant mass.

**Step 0 — convert the hot constraint into a nominal constraint.**
Conditioning is +20 °C nominal, +50 °C hot, so $\Delta T = 30$ K.
$\pi_K = 0.0022/0.65 = 3.385\times10^{-3}$ K⁻¹; hot factor
$= \exp(3.385\times10^{-3}\times30) = 1.1069$.

$$p_{c,\mathrm{nom,max}} = \frac{9.0}{1.1069} = \mathbf{8.131\ \mathrm{MPa}}
\quad\Longrightarrow\quad
K_{n,\max} = \frac{(8.131\times10^{6})^{0.65}}{111.07} = \mathbf{279.3}$$

Any answer that sizes to 9.0 MPa nominal has already failed the problem.

**Option A — neutral 8-point star (WE 21.3 geometry).**
The geometry is fixed by the neutrality requirement, so $m_p = 1131.7$ kg and
the available burn distance is 0.0896 m whatever throat is chosen. The throat
is the only free variable, and it is trapped:

| $A_t$ chosen to give… | $A_t$ [m²] | $D_t$ [mm] | $p_c$ [MPa] | $t_b$ [s] | $J_0$ |
|---|---|---|---|---|---|
| $t_b = 12.0$ s | 0.040649 | 227.5 | 3.14 | 12.00 | **1.71** ✗ |
| $J_0 = 2.0$ | 0.034805 | 210.5 | 3.98 | **11.04** ✗ | 2.00 |

**Option A cannot satisfy (ii) and (iii) simultaneously.** Its web is 89.6 mm
— that is what neutrality bought — and 89.6 mm of P-1770 does not last 12 s at
any pressure that also keeps the port large relative to the throat. Reject.
*This is the most instructive result in the study: the neutral star's binding
constraint is not pressure, it is burn time, because Eq. 3.11 forced the points
outward and thinned the web.*

**Option B — deep 8-point star ($R_p = 0.140$ m, $\theta = 30°$, $f = 10$ mm).**
$P_0 = 1.08049$ m, $P' = 4.478$ m/m in Phase I, $u_1 = 0.0880$ m, tips reach
the liner at $u = 0.160$ m, so the last 45 % of the web is Phase II
(Eq. 3.10). $A_{port}(0) = 0.048846$ m², $V_L = 0.827$,
$m_p = \mathbf{1242.0}$ kg.
Peak $A_b$ occurs at web burnout, 5.638 m², so
$A_t = 5.638/279.3 = \mathbf{0.020191}$ m² ($D_t = 160.3$ mm).
Then $p_c$ runs 3.69 → 8.13 MPa, $\bar p_c = 5.56$ MPa,
$J_0 = 0.048846/0.020191 = \mathbf{2.42}$ ✓, $t_b = \mathbf{16.55}$ s ✓.
**All three constraints met.**

**Option C — CP tube, bore chosen by the analyst.**
The peak is always at burnout, $A_b = 2\pi R_o L = 5.655$ m², independent of
bore, so $A_t = 5.655/279.3 = \mathbf{0.020250}$ m² ($D_t = 160.6$ mm) for
every bore. The bore is then set by (iii):

$$J_0 = \frac{\pi R_{i0}^2}{A_t} \ge 2
\;\Longrightarrow\; R_{i0} \ge \sqrt{\frac{2\times0.020250}{\pi}}
= \mathbf{0.1135\ \mathrm{m}}$$

Take $R_{i0} = 0.1135$ m: $V_L = 0.857$, $m_p = \mathbf{1286.3}$ kg,
$t_b = \mathbf{22.56}$ s ✓, $p_c$ from 1.82 to 8.13 MPa,
$\bar p_c = 4.45$ MPa. **All three constraints met, and it carries the most
propellant.**

**Option D — slotted tube.** Slots *remove* propellant and *add* burning
surface. The peak $A_b$ is still $2\pi R_o L$ at burnout (the slots are long
gone by then), so $A_t$ is unchanged and slots cannot buy pressure headroom.
Modelling the slots as extra area at $t=0$ decaying linearly to zero at 40 %
web, with 10 mm slot width:

| extra $A_b$ at $t=0$ | $m_p$ [kg] | $p_c(0)$ [MPa] | $\bar p_c$ [MPa] | $t_b$ [s] |
|---|---|---|---|---|
| +10 % | 1284.4 | 2.11 | 4.55 | 22.32 |
| +20 % | 1282.5 | 2.41 | 4.64 | 22.11 |
| +30 % | 1280.6 | 2.73 | 4.73 | 21.91 |

Slots cost about 2 kg of propellant per 10 % of added initial area and buy
about 0.09 MPa of mass-averaged pressure. **They lose on the stated objective
and win on everything the objective does not state.**

**The recommendation.**

*On the objective as written:* **Option C**, the CP tube with
$R_{i0} = 0.1135$ m — 1286 kg against 1242 kg for B (+3.6 %) and 1132 kg for A
(+13.6 %), with all three constraints satisfied with margin.

*But the recommendation should not stop there,* and a strong answer does not.
Option C's trace runs from 1.82 to 8.13 MPa — a **4.5:1 thrust ratio** over
the burn. Its mass-averaged pressure is 4.45 MPa, so it spends most of the
burn at little more than half the pressure the case is built for, and the
nozzle can be optimised for only one point on that trace, so a large fraction
of the impulse is delivered at a badly off-design $C_F$. The 1286 kg advantage
is therefore *not* a 3.6 % impulse advantage over B in reality — B's
mass-averaged pressure is 5.56 MPa, 25 % higher, and its trace ratio is 2.2:1
rather than 4.5:1. Once $I_{sp}$ variation with pressure and expansion is
carried through, B and C are close, and B is far kinder to the vehicle.

**Therefore: recommend C only if the customer confirms there is genuinely no
constraint on thrust shape, acceleration, or delivered $I_{sp}$. Otherwise
recommend B.** And say so explicitly — the correct engineering response to a
requirement set whose optimum is a 4.5:1 thrust ratio is to go back and ask
what the vehicle actually needs, because a requirement set that says nothing
about thrust shape for a solid motor is almost certainly incomplete.

**Binding constraint for each rejected option:**

- **A**: constraints (ii) *and* (iii) together — no throat satisfies both.
  Root cause: the web is too thin, which is the price of exact neutrality.
- **C** (if rejected): no *stated* constraint binds; it is rejected on the
  unstated requirement (trace shape and delivered $I_{sp}$).
- **D**: the objective — slots remove propellant to buy trace quality that the
  stated objective does not reward.

### Rubric

**A strong answer must contain:**

1. The hot-day correction applied *first*, converting MEOP 9.0 MPa into a
   nominal 8.13 MPa limit. (Failing to do this loses a third of the marks; it
   is the difference between a motor and a bomb.)
2. Recognition that the *peak* $A_b$ — not the initial — sets $A_t$ for the
   progressive options.
3. Correct identification that Option A is infeasible, with the *reason*
   (thin web from the neutrality sizing rule), not merely the arithmetic.
4. Numbers for $m_p$, $t_b$, $J_0$ and the pressure range for at least B and C.
5. An explicit statement of which constraint binds for each rejected option.
6. Interrogation of the objective: naming trace shape and delivered $I_{sp}$
   as the missing requirements, and making the recommendation conditional.

**Loses marks for:** sizing the throat to 9.0 MPa nominal; sizing $A_t$ from
the *initial* $A_b$ on a progressive grain; treating "maximum total impulse"
as identical to "maximum propellant mass" without noting the $I_{sp}$
dependence; recommending A because it is neutral without checking $t_b$ and
$J$; proposing slots (D) as an impulse improvement; and reporting a single
winner with no sensitivity to the unstated requirements.

**Automatic fail:** any recommended design that exceeds 9.0 MPa at +50 °C.

---

## K4. Common wrong answers and what they reveal

**"$p_c$ is proportional to $A_b$."** Dropping the $1/(1-n)$ exponent is the
single most common error on this material, and it is not a small one: at
$n = 0.35$ it understates every pressure excursion by 54 %. It reveals a
student who has memorised $K_n = A_b/A_t$ without ever writing down the mass
balance that produced it. The cure is to re-derive Eq. 3.2 from Eq. 3.1 by
hand until it is automatic.

**Sizing the throat from the initial burning area on a progressive grain.**
Produces a motor that meets its pressure limit at $t=0$ and bursts at burnout.
It reveals someone thinking about a *state* rather than a *trajectory*. The
rule is: the throat is sized by the maximum of $K_n(w)$ over the whole burn,
at the hot conditioning temperature, with the fast-lot burn rate.

**Forgetting the hot-day and fast-lot factors.** The same failure on a
different axis. MEOP is a product of independent factors, not the nominal
number.

**Using $r \propto p_c^{\,n}$ for a temperature change.** Correct for an area
change at fixed propellant; wrong for a temperature change, where $a$ itself
moves and $r \propto p_c$ exactly. Students who make this error predict that a
hot motor runs hotter *and* delivers more impulse, which violates conservation
of propellant. The check is always $\bar p_c\,t_b = $ constant.

**Confusing $K_n$ with volumetric loading.** These pull in opposite directions
— high $K_n$ needs perimeter, perimeter needs port, port is propellant not
loaded — and a student who thinks a wagon wheel is "high performance" in both
senses has not internalised the trade. Ask them for the $V_L$ of the geometry
they just proposed.

**Believing the sliver is lost mass.** It reveals a mass-accounting mental
model where a propulsion mental model is needed. The mass burns; the *impulse*
is degraded and the *dispersion* is inflated.

**Treating the fillet radius as a structural detail.** The fillet is exactly an
offset along the burn-back family (Q3). A student who does not see this will,
in practice, be part of the R3 failure chain.

**Assuming a neutral grain gives a neutral motor.** Throat erosion, erosive
burning and grain temperature all move the trace. Neutrality is a property of
the motor as fired; it is measured, not designed.

**Quoting a solid motor's $I_{sp}$ without its expansion ratio.** The Star 48B
is 286.2 s at $\varepsilon\approx47.7$ and 292.2 s at
$\varepsilon\approx54.8$–70.4, and both figures are correct `[JM-LV]`, `[EA]`.
A student who reports "Star 48B $I_{sp}$ = 292 s" as a fact about the
propellant has confused a motor property with a chemistry property.

**Inventing a grain geometry for a real motor.** Public grain drawings are
rare. The verification file records an 11-point star and double-truncated-cone
segments for the RSRM `[NASA-SRB]`, and records the P120C grain only as
"monolithic, single cast" — nothing more. Saying "P120C uses a finocyl"
because it sounds right is exactly the failure mode this course's sourcing
discipline exists to prevent. "Not reliably published" is a complete and
correct answer.
