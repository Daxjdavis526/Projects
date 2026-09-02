# Module 09 — Nozzles
Part II · Prerequisites: modules 02, 03, 06 · Estimated time: 8 h

The nozzle is the only part of a rocket engine that a member of the public can
recognise, and it is the part engineers most often get wrong in the direction
that cannot be fixed later. Everything upstream of the throat — injector,
chamber, cooling circuit — determines $c^*$, and $c^*$ is worth a few per cent
either way. The nozzle determines $C_F$, and $C_F$ spans a factor of nearly
two between a sonic orifice and a 285:1 bell. Worse, the nozzle is the
component whose *geometry is frozen earliest*, because the throat diameter is
what everything else is sized around and the exit diameter is what the vehicle
interstage is built around. There is a specific, recurring failure in this
industry: a stage grows in mass during development, the trajectory people ask
for more vacuum $I_{sp}$, someone proposes a bigger nozzle, and the answer is
that the interstage was tooled eighteen months ago. There is a second, uglier
one: a nozzle is lengthened, nobody re-runs the separation analysis, and the
first sea-level start tears a strain-gauged skirt off its gimbal. This module
is about choosing the contour, defending the length, and knowing exactly what
the flow will do to the wall at every point on the trajectory.

---

## 1. Learning objectives

After this module you should be able to:

1. Size a throat from $\dot m$ and $c^*$, or from $F$, $p_c$ and $C_F$, and
   state which of the two routes you would trust with a contractual number and
   why.
2. Apply the `[SP-8120]`/`[HH]` radius-of-curvature rules upstream and
   downstream of the throat, and explain what each one is protecting — the
   discharge coefficient, the heat flux, or the contour that follows.
3. Choose a contraction ratio and a convergence half-angle for a given chamber
   and throat, and say what goes wrong at each end of the 20–45° band.
4. **Derive** the conical divergence efficiency $\lambda = (1+\cos\alpha)/2$
   and compute the length and wetted area of a conical nozzle of a given
   $\varepsilon$.
5. Explain what `[Rao58]` actually solved, construct a Rao parabolic contour
   `[Rao60]` from $\theta_n$, $\theta_e$ and a percentage bell length, and state
   the convention that "80 % bell" is measured against.
6. Build a nozzle efficiency budget — divergence, friction, kinetics, and (for
   solids) two-phase — and say which term dominates for a given engine class.
7. **Derive** the altitude at which a higher-$\varepsilon$ nozzle overtakes a
   lower-$\varepsilon$ one on the same engine, and use it to defend a
   first-stage expansion ratio.
8. Apply Summerfield and Schmucker separation criteria to a real contour, say
   where they disagree and by how much, and distinguish free shock separation
   from restricted shock separation and their very different side-load
   consequences.
9. Compare aerospike, expansion–deflection, dual-bell, extendable and plug
   nozzles on compensation range, inert mass, cooled area and demonstrated
   flight history, and say why none of the first three has flown at scale.
10. Match a nozzle construction method — tube-wall, milled channel, radiatively
    cooled refractory metal, carbon–carbon, ablative, dump/film-cooled — to a
    heat flux, a burn time, a production rate and a cost target, and name a
    flown engine for each.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Throat area | $A_t$ | m² | minimum flow area of the nozzle |
| Throat radius | $r_t$ | m | $\sqrt{A_t/\pi}$ for a circular throat |
| Exit area | $A_e$ | m² | area of the nozzle exit plane |
| Exit radius | $r_e$ | m | $\sqrt{A_e/\pi}$ |
| Expansion (area) ratio | $\varepsilon$ | — | $A_e/A_t$ |
| Contraction ratio | $\varepsilon_c$ | — | $A_c/A_t$, chamber cross-section over throat |
| Chamber pressure | $p_c$ | Pa | stagnation pressure at the injector face unless stated |
| Exit static pressure | $p_e$ | Pa | static pressure at the exit plane, attached isentropic flow |
| Ambient pressure | $p_a$ | Pa | atmospheric static pressure at the flight altitude |
| Exit Mach number | $M_e$ | — | Mach number at the exit plane |
| Thrust coefficient | $C_F$ | — | $F/(p_c A_t)$; the nozzle's figure of merit |
| Characteristic velocity | $c^*$ | m/s | $p_c A_t/\dot m$; the chamber's figure of merit |
| Mass flow | $\dot m$ | kg/s | total propellant flow through the throat |
| Ratio of specific heats | $\gamma$ | — | $c_p/c_v$ of the exhaust, taken frozen unless stated |
| Cone half-angle | $\alpha$ | rad or ° | divergence half-angle of a conical nozzle |
| Convergence half-angle | $\beta$ | rad or ° | half-angle of the converging section |
| Initial (inflection) wall angle | $\theta_n$ | ° | bell wall angle at the end of the downstream throat arc |
| Exit wall angle | $\theta_e$ | ° | bell wall angle at the exit plane |
| Upstream throat radius of curvature | $R_u$ | m | radius of the arc approaching the throat |
| Downstream throat radius of curvature | $R_d$ | m | radius of the arc leaving the throat |
| Nozzle (divergent) length | $L_n$ | m | throat plane to exit plane, along the axis |
| Percentage bell length | $L\%$ | — | $L_n$ divided by the length of a 15° cone of the same $\varepsilon$ and $r_t$ |
| Divergence (angularity) efficiency | $\lambda$ | — | axial fraction of the exit momentum flux |
| Friction (boundary-layer) efficiency | $\eta_f$ | — | thrust fraction surviving wall shear and displacement |
| Kinetic efficiency | $\eta_{kin}$ | — | thrust fraction surviving finite-rate chemistry |
| Overall nozzle efficiency | $\eta_n$ | — | $\lambda\,\eta_f\,\eta_{kin}\,(\eta_{2\phi})$ |
| Discharge coefficient | $C_d$ | — | actual choked flow over 1-D isentropic choked flow |
| Effective (sonic) throat area | $A_t^{\ast}$ | m² | $C_d A_t$; the area the flow behaves as if it had |
| Separation wall pressure | $p_{sep}$ | Pa | wall static pressure at the separation point |
| Separation Mach number | $M_{sep}$ | — | Mach number just upstream of separation |
| Side load | $F_{side}$ | N | net lateral force from a circumferentially asymmetric wall pressure |
| Wetted area | $S_w$ | m² | gas-side surface area of the divergent section |
| Nozzle pressure ratio | NPR | — | $p_c/p_a$ |

---

## 3. Theory

### 3.1 The division of labour, and why this module exists at all

Module 02 gave you the quasi-one-dimensional flow. Module 03 gave you the
factorisation $I_{sp} = c^{*}C_F/g_0$ and the shape of the $C_F$ surface. What
neither gave you is a *contour*: a curve $r(x)$ that a machinist can cut, a
cooling-jacket designer can route tubes along, and a structures engineer can
hang off a gimbal bearing. That curve is what this module produces, and the
whole subject can be organised around one sentence:

> **The nozzle converts the $c^*$ the chamber delivers into thrust, and the
> only questions are how much of the available $C_F$ it recovers, how much it
> weighs, and whether the flow stays on the wall.**

Those three questions are in direct conflict. Recovering more $C_F$ means more
area ratio, which means more length, which means more mass and more wetted
area (more friction loss, more coolant demand, more structure). And more area
ratio at fixed $p_c$ means a lower exit pressure, which is exactly what causes
the flow to leave the wall at sea level. Every decision in §3.4 through §3.13
is a position on that three-way trade.

A note on scope. Modules 02 and 03 already treated the isentropic station
relations, the $C_F$ map, the Summerfield and Schmucker criteria at
first-cut level, and the sea-level/vacuum $I_{sp}$ gap. They are prerequisites
and are not repeated. This module goes to the *geometry* — throat curvature,
contraction ratio, contour construction, percentage bell length — to the
*quantitative* loss budget, to side-load magnitude rather than side-load
existence, and to hardware: what a nozzle is actually built out of and why.

### 3.2 The throat, and why it is the boundary condition for everything

The throat is not a design choice in the way the exit is. It is fixed the
moment you choose thrust and chamber pressure, and everything else in the
engine is scaled from it: the chamber volume through $L^*$ (Module 06), the
injector face area through the contraction ratio, the coolant channel count,
the Bartz heat flux (Module 10) which goes as $D_t^{-0.2}(p_c/c^*)^{0.8}$.
Get the throat wrong and you do not have a slightly off-design engine; you
have a different engine.

There are two routes to the throat area and you should be fluent in both.

**Route 1 — from mass flow and $c^*$.** From the definition of characteristic
velocity,

$$A_t = \frac{\dot m\,c^*}{p_c}$$

> **Eq. 3.1** — variables: $A_t$ throat area [m²], $\dot m$ total propellant
> mass flow [kg/s], $c^*$ delivered characteristic velocity [m/s], $p_c$
> chamber stagnation pressure [Pa]. Meaning: the throat is the area that will
> pass the required flow at the required chamber pressure. Assumes: choked
> flow, $c^*$ referenced to the same pressure station as $p_c$, and the *same*
> $A_t$ definition (geometric, not effective — see §3.3). Fails when: the
> nozzle is unchoked (start-up, deep throttle at low $p_c$ against a
> significant back pressure), when $c^*$ was measured against a different
> pressure tap, or when the throat has eroded (a solid-motor problem, Module
> 24; in a liquid engine a throat that is changing size is a failure).
> `[SB §3.3]`, `[HH §4.4]`. [F]

**Route 2 — from thrust and $C_F$.**

$$A_t = \frac{F}{p_c\,C_F}$$

> **Eq. 3.2** — variables: $F$ thrust [N] at the stated ambient pressure,
> $C_F$ thrust coefficient at that ambient pressure [–]. Meaning: the throat
> is the area that turns the available chamber pressure into the required
> thrust, given how good the nozzle is. Assumes: $C_F$ and $F$ refer to the
> same $p_a$, and $C_F$ includes the nozzle efficiency you actually expect.
> Fails when: the flow is separated (the attached-flow $C_F$ is then wrong,
> §3.12), and, silently, when a vacuum $C_F$ is used with a sea-level thrust
> requirement. `[SB §3.4]`, `[HH §1.3]`. [F]

The two routes are algebraically identical — $F = \dot m c^* C_F$ — but they
fail differently and that is why you carry both. Route 1's uncertainty lives
in $c^*$, which for a given propellant combination and mixture ratio you know
to about ±1 % from CEA plus an $\eta_{c^*}$ judgement (Module 04). Route 2's
uncertainty lives in $C_F$, which for an unseparated nozzle you know to better
than ±1 % from geometry alone. [J] **Use Route 2 to size the hardware and
Route 1 to check it.** If they disagree by more than a couple of per cent, one
of $c^*$, $C_F$ or your mixture ratio is wrong, and you would rather find that
on paper than on a stand.

**The throat is also a pressure-measurement argument.** $p_c$ in Eq. 3.1 and
3.2 is the stagnation pressure the nozzle actually sees. Injector-end static
pressure is higher than nozzle-stagnation pressure by the chamber's momentum
pressure drop, which for a contraction ratio of 2 and $\gamma = 1.2$ is of
order 3–5 %. American Apollo-era practice quotes injector-end; much modern
and Soviet practice quotes nozzle stagnation [_verify-liquid, contested item
18]. A 4 % disagreement in $p_c$ is a 4 % disagreement in $A_t$ for the same
thrust, which is a 2 % disagreement in throat diameter — larger than the
machining tolerance. Always state the station.

### 3.3 Throat curvature: the rules, and what each one is protecting

A throat is not a corner. It is a pair of circular arcs — one approaching, one
leaving — chosen for reasons that have nothing to do with each other.

**Upstream: $R_u = 1.5\,r_t$ (range 0.5–2.0).** The upstream arc blends the
converging cone into the throat. Its radius controls how sharply the flow must
turn as it approaches sonic conditions, and therefore two things:

1. **The discharge coefficient.** In one-dimensional theory the sonic line is
   a flat disc at the geometric minimum area. It is not: it is a curved
   surface bulging downstream, and its curvature increases as $R_u/r_t$ falls.
   The consequence is that the *effective* choking area is smaller than the
   geometric throat area, $A_t^{\ast} = C_d A_t$ with $C_d < 1$. Practice
   `[SP-8120 §2.1]`, and the transonic analyses behind it `[ZH Vol. 2]`, put
   $C_d \approx 0.99$ for $R_u/r_t \approx 1.5$–2, falling towards 0.97 for
   $R_u/r_t \approx 0.5$. [E]
2. **The heat flux.** Bartz's correlation carries an explicit
   $(D_t/R_u)^{0.1}$ term (Module 10): a tighter upstream radius raises the
   throat heat flux. The exponent is small, but the throat is where the flux
   peaks and where you have the least margin.

**Downstream: $R_d = 0.382\,r_t$ for a bell; $R_d = 0.5$–$1.5\,r_t$ for a
cone.** The downstream arc is a completely different animal. It exists to get
the wall from an angle of zero at the throat up to the initial divergence
angle $\theta_n$ (§3.7) as *quickly* as the flow will tolerate, because every
millimetre spent turning is a millimetre of nozzle length that is not
expanding. The 0.382 figure is the `[HH §4.4]` / `[SP-8120]` convention for
thrust-optimised contours and it is close to universal in bell design. [E]/[M]

> **Eq. 3.3 (throat arc geometry)** — for a downstream arc of radius $R_d$
> turning from 0 to $\theta_n$:
> $$x_N = R_d\sin\theta_n,\qquad r_N = r_t + R_d\left(1-\cos\theta_n\right)$$
> variables: $(x_N, r_N)$ the coordinates of the arc's downstream end (the
> contour's inflection point) [m], measured from the throat plane on the axis.
> Meaning: where the bell contour proper begins. Assumes: a circular arc
> tangent to the throat plane. Fails when: the contour is defined by a full
> method-of-characteristics solution that does not use a circular arc, which
> some modern designs do not. `[Rao60]`, `[HH §4.4]`.

Why 0.382 and not something rounder? Because it is a compromise found by
experiment and by characteristics calculation between two failures. Too tight
an arc and the expansion immediately downstream of the throat is strong enough
to generate an internal shock that never fully cancels, costing $C_F$ and
producing exactly the shock structure that drives restricted shock separation
(§3.12). Too generous an arc and you have spent length turning instead of
expanding, which is the whole thing a bell is trying to avoid. [J] The number
is a convention with good physics behind it, not a derivation; do not defend
it as though it were one.

**A consequence you must internalise.** Because $C_d < 1$, "the throat area"
is at least three different quantities: the geometric minimum area, the
effective sonic area $C_d A_t$, and whatever area a particular performance
analysis divided the exit area by. Expansion ratio inherits that ambiguity.
This is not pedantry — it is the most plausible explanation for the RS-25's
69-versus-77.5 dispute (§6.2), and a 2 % difference in assumed throat area is
a 2 % difference in every reported $c^*$ from a test stand.

### 3.4 The converging section

The convergent is the cheap part of the nozzle and it is treated accordingly:
it is subsonic, so it is forgiving; a poor convergent costs a fraction of a
per cent, where a poor divergent costs several.

**Contraction ratio.** $\varepsilon_c = A_c/A_t$ is set in Module 06 by
chamber considerations, not nozzle ones, but the nozzle inherits it. The
governing physics is the chamber Mach number: the combustion gas must be slow
enough at the injector face that the pressure loss down the chamber (the
Rayleigh-line loss from heat addition in a duct of finite area) is small, and
slow enough that the injector sees a nearly uniform back pressure.

| $\varepsilon_c$ | chamber Mach (γ=1.2) | where you see it |
|---|---|---|
| 1.5 | ≈ 0.42 | very small thrusters; unacceptable $p_c$ loss in a large engine |
| 2.0 | ≈ 0.31 | large boosters, where chamber mass matters most |
| 2.5–3.0 | ≈ 0.24–0.20 | the common band for medium and large engines |
| 4–10 | < 0.15 | small engines and thrusters, where $A_t$ is tiny and the chamber is sized by the injector, not by the flow |

> **Eq. 3.4 (chamber Mach from contraction ratio)** — $\varepsilon_c$ is the
> subsonic root of the area–Mach relation (Module 02, Eq. 3.11):
> $$\varepsilon_c = \frac{1}{M_c}\left[\frac{2}{\gamma+1}\left(1+\frac{\gamma-1}{2}M_c^2\right)\right]^{\frac{\gamma+1}{2(\gamma-1)}}$$
> variables: $M_c$ chamber Mach number [–]. Meaning: how fast the gas is
> already moving when it reaches the injector-face end of the convergent.
> Assumes: isentropic, uniform, no heat addition *in the convergent* (heat
> addition happens upstream). Fails when: combustion is still occurring in the
> convergent — which it is in a short chamber, and which is why the real
> chamber pressure profile is not isentropic. [F]/[A]

The rule of thumb that survives: [E] **keep $M_c \lesssim 0.3$**, i.e.
$\varepsilon_c \gtrsim 2$, or the injector-face-to-throat pressure drop starts
to matter and the $p_c$ station argument of §3.2 gets worse.

**Convergence half-angle: 20–45°, and why that band.** The convergent's job is
to get from $A_c$ to $A_t$ in as little length as possible without separating
the (subsonic, favourably accelerated) boundary layer or introducing
non-uniformity into the flow arriving at the throat.

- **Below ~20°** you are simply wasting length and wetted area. A subsonic
  accelerating flow will not separate at 20°, so there is no benefit.
- **Above ~45°** two things go wrong. The flow arriving at the upstream throat
  arc has a strong radial component that the arc must remove, which distorts
  the sonic line further, drops $C_d$, and can produce a non-uniform Mach
  distribution entering the divergent that the contour was not designed for.
  And in a regeneratively cooled engine, a steep convergent means the coolant
  channels must turn sharply just where the heat flux is climbing towards its
  throat peak.
- **30° is the default** and is what most drawings show. `[HH §4.4]`,
  `[SP-8120 §3]`. [E]/[M]

The convergent contributes essentially nothing to thrust (the flow is subsonic
and the pressure forces largely cancel), so its length is pure parasitic mass
and pure parasitic heat load. Design it short.

### 3.5 The diverging section: expansion ratio and exit pressure

The divergent is where all the performance is, and it is parameterised by one
number, $\varepsilon$, plus a contour.

The exit pressure follows from $\varepsilon$ and $\gamma$ alone:

$$\frac{p_e}{p_c} = \left(1+\frac{\gamma-1}{2}M_e^2\right)^{-\frac{\gamma}{\gamma-1}},
\qquad
\varepsilon = \frac{1}{M_e}\left[\frac{2}{\gamma+1}\left(1+\frac{\gamma-1}{2}M_e^2\right)\right]^{\frac{\gamma+1}{2(\gamma-1)}}$$

> **Eq. 3.5** — variables: $M_e$ exit Mach number [–]. Meaning: fix the area
> ratio and you have fixed the exit pressure ratio; there is no other knob.
> Assumes: isentropic, calorically perfect, attached, one-dimensional flow.
> Fails when: the flow separates (then $p_e$ is *not* the wall pressure at the
> exit), when real-gas or finite-rate effects shift $\gamma$ along the nozzle
> (they do, by 0.02–0.05 in a hydrogen engine), and in the transonic region
> near the throat where the 1-D assumption is worst. `[SB §3.3]`, Module 02
> §3.7. [F]/[A]

Two consequences that people repeatedly get backwards:

1. **$p_e$ does not depend on $p_a$.** For attached flow, the exit pressure is
   whatever Eq. 3.5 says, whether the nozzle is in a vacuum chamber or at sea
   level. Ambient pressure enters the *thrust*, through the $(p_e-p_a)A_e$
   term, not the internal flow. The only way $p_a$ reaches inside the nozzle
   is by separating the boundary layer (§3.12).
2. **Vacuum $C_F$ is independent of chamber pressure.** Set $p_a=0$ in the
   $C_F$ expression and every term is a function of $\gamma$ and $\varepsilon$
   only. This is enormously useful: it means you can compute the *ratio* of
   vacuum $I_{sp}$ between two area ratios on the same engine without knowing
   $p_c$ at all — which is exactly what saves Worked Example 4, where the
   chamber pressure of the engine in question is not reliably published.

### 3.6 Conical nozzles

The conical nozzle is a straight-sided cone of half-angle $\alpha$ joined to
the throat by the downstream arc. It is the simplest nozzle to draw, to
machine, to wrap tubes around, and to analyse, and for those reasons it is
still what you find on small thrusters, on ablative chambers, and on anything
built in a hurry. Its cost is that the exit flow is not axial.

**Deriving the divergence efficiency.** Model the exit flow as a source flow:
uniform speed $v_e$, directed radially outward from a virtual apex, spread
over a spherical cap of half-angle $\alpha$. The axial momentum flux is the
integral of $\dot m\,v_e\cos\theta$ over the cap, divided by the total. With
solid-angle element $2\pi\sin\theta\,d\theta$,

$$\lambda = \frac{\displaystyle\int_0^{\alpha}\cos\theta\,\sin\theta\,d\theta}{\displaystyle\int_0^{\alpha}\sin\theta\,d\theta}
= \frac{\tfrac12\sin^2\alpha}{1-\cos\alpha}
= \frac{\tfrac12(1-\cos\alpha)(1+\cos\alpha)}{1-\cos\alpha}$$

$$\boxed{\lambda = \frac{1+\cos\alpha}{2}}$$

> **Eq. 3.6 (conical divergence efficiency)** — variables: $\alpha$ cone
> half-angle [rad]. Meaning: the fraction of the exit momentum flux that
> points along the axis; multiply the momentum term of $C_F$ by it. Assumes:
> conical nozzle, uniform speed on a spherical exit cap, source flow from a
> virtual apex, no boundary layer. Fails when: the contour is not conical (a
> bell's exit flow is not a uniform source flow and Eq. 3.6 is not a valid
> estimate for it), and it says nothing about friction or chemistry. Note it
> applies to the *momentum* term only; the pressure term $(p_e-p_a)A_e$ is
> already axial. `[SB §3.4]`, `[SP-8120 §3.2]`. [F]/[A]

| $\alpha$ | $\lambda$ | divergence loss | $L_n$ for $\varepsilon=16$, $r_t=99.7$ mm |
|---|---|---|---|
| 12° | 0.9891 | 1.09 % | 1.422 m |
| **15°** | **0.9830** | **1.70 %** | **1.136 m** |
| 18° | 0.9755 | 2.45 % | 0.944 m |
| 20° | 0.9698 | 3.02 % | 0.848 m |
| 25° | 0.9532 | 4.68 % | 0.674 m |

**Why 15° is the standard.** It is not an optimum of Eq. 3.6, which is
monotonic — smaller is always better for divergence. It is the point where the
divergence loss curve has flattened enough that further length buys almost
nothing, while the mass and friction penalties keep growing linearly. Going
from 15° to 12° buys 0.6 % of momentum and costs 25 % more length and wetted
area. Going from 15° to 18° saves 17 % of length and costs 0.75 %. [J] 15°
sits at the knee, and it has sat there since the 1950s.

**Conical length.**

$$L_n = \frac{r_t\left(\sqrt{\varepsilon}-1\right) + R_d\left(\sec\alpha - 1\right)}{\tan\alpha}$$

> **Eq. 3.7 (conical nozzle length)** — variables: $R_d$ downstream throat
> radius of curvature [m] (take $1.5\,r_t$ for the reference 15° cone).
> Meaning: axial distance from throat plane to exit plane. Assumes: circular
> throat arc tangent to a straight cone. Fails when: the contour is not
> conical. The first term dominates; the arc term is a few per cent.
> `[SB §3.4]`, `[HH §4.4]`. [F]

Note that $L_n \propto r_t\sqrt{\varepsilon}$: **nozzle length scales with the
exit radius, and therefore with the square root of the area ratio and the
square root of the thrust at fixed $p_c$.** Doubling $\varepsilon$ costs 41 %
more length, not 100 %. That single scaling is why high area ratios are
affordable at all.

### 3.7 Bell nozzles: what Rao actually did

The conical nozzle throws away 1.7 % of its momentum and is longer than it
needs to be. Both faults have the same cause: the wall angle is constant, so
the flow is being turned outward all the way to the exit and never turned back.

**The variational problem.** Rao `[Rao58]` posed it properly: *among all
axisymmetric wall contours of a given length, connecting a given throat to a
given exit area, which one maximises axial thrust?* The flow is treated as
steady, inviscid, adiabatic, chemically frozen, and supersonic downstream of
an assumed initial expansion; the governing equations are solved by the method
of characteristics `[ZH Vol. 2]`; and the optimality condition comes out as a
requirement on the flow properties along the last right-running characteristic
that reaches the exit lip — a control-surface condition, not a wall condition.

The answer has a characteristic shape that is worth understanding physically:

- **Immediately downstream of the throat, turn hard.** The wall angle rises
  quickly to $\theta_n$, which for a typical bell is 20–30° — well beyond the
  15° a cone would use. Expanding fast where the area is small is cheap,
  because the pressure is still high and the surface area is small.
- **Then turn back, continuously, to a small exit angle $\theta_e$ of 5–15°.**
  The contour is concave outward: it recompresses the flow gently towards
  axial. The recompression is *isentropic* if the contour is right — that is
  the whole trick — so the momentum recovered costs nothing in entropy.
- **The result is a nozzle that is 20–40 % shorter than a 15° cone of the same
  area ratio and delivers 1–1.5 % more thrust.** [F]/`[Rao58]`

**The parabolic approximation `[Rao60]`.** The full characteristics solution
is a table of points, and in 1960 that was not something a design office could
carry around. Rao's follow-up note showed that the optimum contour is
approximated to within a fraction of a per cent of thrust by a **parabola**
tangent to the throat arc at $\theta_n$ and to the exit at $\theta_e$. In
modern terms it is a quadratic Bézier curve: given the inflection point
$N=(x_N,r_N)$ from Eq. 3.3, the exit point $E=(L_n, r_e)$, and the two wall
angles, the control point $Q$ is the intersection of the two tangent lines, and

$$\begin{pmatrix}x(t)\\ r(t)\end{pmatrix} = (1-t)^2\begin{pmatrix}x_N\\ r_N\end{pmatrix} + 2(1-t)t\begin{pmatrix}x_Q\\ r_Q\end{pmatrix} + t^2\begin{pmatrix}L_n\\ r_e\end{pmatrix},\qquad t\in[0,1]$$

> **Eq. 3.8 (Rao parabolic contour)** — variables: $t$ curve parameter [–],
> $Q$ the tangent-intersection control point [m]. Meaning: a two-parameter
> ($\theta_n$, $\theta_e$) family that reproduces the method-of-characteristics
> optimum contour closely enough for hardware. Assumes: the $\theta_n$,
> $\theta_e$ pair is taken from the Rao charts for the intended $\varepsilon$
> and percentage length; the throat arc is $R_d = 0.382\,r_t$. Fails when: the
> nozzle is very short (below ~60 % bell, where the parabola departs
> noticeably from the optimum), at very high $\varepsilon$ where the exit-lip
> characteristic assumptions weaken, and always in the sense that the true
> optimum is a viscous, reacting, three-dimensional problem this does not
> touch. `[Rao60]`, `[SP-8120 §3.3]`. [E]/[M]

**The $\theta_n$, $\theta_e$ charts.** Rao's design charts plot the two wall
angles against $\varepsilon$ for a family of percentage bell lengths. They are
reproduced in `[SB §3.4]`, in `[HH §4.4]`, and in essentially every nozzle
design text — and the reproductions **disagree with each other by one to two
degrees**, because they have been redrawn and re-digitised from each other for
sixty years. Treat the following as an indicative read of the 80 % family, not
as data. [E]

| $\varepsilon$ | $\theta_n$ (80 % bell) | $\theta_e$ (80 % bell) |
|---|---|---|
| 5 | ≈ 20.5° | ≈ 14° |
| 10 | ≈ 22° | ≈ 12° |
| 15 | ≈ 22.5° | ≈ 11.5° |
| 20 | ≈ 23.5° | ≈ 10.5° |
| 25 | ≈ 24° | ≈ 10° |
| 40 | ≈ 25.5° | ≈ 8.5° |
| 50 | ≈ 26° | ≈ 8° |
| 100 | ≈ 28° | ≈ 6.5° |

The trends are the part to memorise, because the trends are robust and the
digits are not: **$\theta_n$ rises and $\theta_e$ falls as $\varepsilon$
increases**, and for a *shorter* bell (60 %) both angles are larger — you must
turn harder at the start and you have not finished turning back at the exit.

**The percentage bell convention, stated precisely, because it is the single
most abused term in nozzle work.** An "80 % bell" is a nozzle whose axial
length from throat plane to exit plane is 80 % of the axial length of a **15°
conical nozzle with the same throat radius and the same area ratio**, with the
cone measured using Eq. 3.7. It is *not* 80 % of a 15° cone with a sharp
throat, *not* 80 % of the full-length Rao optimum, and *not* a percentage of
the exit diameter. `[Rao60]`, `[SP-8120 §3.3]`. Different textbooks quietly use
the sharp-throat reference, which shifts the number by 1–2 points; when you
read a percentage bell length off a drawing, check what the denominator was.

**Why 80 %.** Because the thrust-versus-length curve is steep up to about 70 %
and nearly flat beyond about 85 %. At 80 % a bell recovers roughly 99 % of the
full-length optimum's thrust for 80 % of the cone's length and about 87 % of
its wetted area (computed in Worked Example 1). [J] 80 % is a convention that
sits at a knee, exactly like 15° for a cone, and like 15° it is defensible
rather than derived. Vacuum upper stages, which are less mass-sensitive per
unit $I_{sp}$, often go to 85–100 %; sea-level boosters, which are fighting
both mass and separation, often sit at 70–80 %.

### 3.8 Length, mass, and loss: the trade stated numerically

Three quantities vary with the length of a divergent section of fixed
$\varepsilon$:

1. **Divergence efficiency $\lambda$.** Increases with length (smaller exit
   angle, more axial flow), steeply at first, then flattening.
2. **Wetted area $S_w$, and therefore mass and friction loss.** For a cone,
   $S_w = \pi(r_t+r_e)\ell_{slant}$; for a parabola it must be integrated. It
   increases with length, roughly linearly once the contour is long.
3. **Coolant pressure drop and coolant heat pickup**, both roughly
   proportional to $S_w$ (Modules 10, 11). In a regeneratively cooled engine
   this is often the binding constraint, not mass.

For the 500 kN engine of Module 03 ($r_t = 99.7$ mm, $\varepsilon = 16$),
Worked Example 1 computes:

| contour | $L_n$ (m) | rel. length | $S_w$ (m²) | rel. wetted area |
|---|---|---|---|---|
| 15° cone | 1.136 | 1.000 | 1.809 | 1.000 |
| 60 % bell | 0.681 | 0.600 | 1.207 | 0.667 |
| 70 % bell | 0.795 | 0.700 | 1.350 | 0.747 |
| **80 % bell** | **0.908** | **0.800** | **1.570** | **0.868** |
| 90 % bell | 1.022 | 0.900 | 1.772 | 0.980 |
| 100 % bell | 1.136 | 1.000 | 1.956 | 1.081 |

Two things in that table repay attention. First, the wetted area of a bell
falls *less* than proportionally with length, because the bell bulges outward
relative to the cone — an 80 % bell is 80 % as long but 87 % as wet. If your
binding constraint is coolant heat pickup rather than mass, the bell buys you
less than the length suggests. Second, a **100 % bell has 8 % more wetted area
than the cone it is the same length as**, which is why "full-length bell" is
not automatically the right answer even in vacuum.

[J] The practical decision procedure, in the order it is actually argued:

1. Fix $\varepsilon$ from the mission (§3.11) and the separation limit (§3.12).
2. Take 80 % bell as the default.
3. Shorten it if the stage has a hard length or interstage-diameter budget, or
   if the engine is sea-level and side loads are marginal; lengthen it if the
   engine is a vacuum upper stage and the extra $I_{sp}$ is worth more than the
   mass at that stage's mass ratio.
4. Re-check the cooling: a longer nozzle picks up more heat into the same
   coolant flow, and on an expander-cycle engine that is a *feature*
   (Module 13), while on a regen booster it is a pressure-drop problem.

### 3.9 Boundary layers and viscous loss

Everything to this point has been inviscid. The nozzle has a turbulent
boundary layer growing from the throat, and it costs thrust in two distinct
ways that are often conflated:

1. **Skin friction.** The wall shear stress integrated over the wetted area is
   a drag force directly opposing thrust.
2. **Displacement.** The boundary layer's displacement thickness reduces the
   effective flow area, so the core flow expands to a slightly lower area ratio
   than the geometry suggests. At the throat this shows up in $C_d$ (§3.3); in
   the divergent it slightly reduces $M_e$ and raises $p_e$.

The two partially offset — displacement raises the pressure term while
friction reduces the momentum term — which is why the net viscous loss is
smaller than a naive skin-friction estimate. For large liquid engines the net
is **0.5–1.5 %**, and 1–2 % is the honest band to quote across engine sizes.
`[SP-8120 §4]`, `[SB §3.5]`. [E]

The scaling is the useful part:

$$\eta_f \approx 1 - \frac{\bar\tau_w S_w}{F}$$

> **Eq. 3.9 (friction efficiency, order of magnitude)** — variables:
> $\bar\tau_w$ mean wall shear stress [Pa], $S_w$ wetted area of the divergent
> [m²], $F$ thrust [N]. Meaning: the friction loss is a drag force over a
> thrust. Assumes: shear can be represented by a mean value; ignores the
> displacement effect, so it *over*states the loss. Fails when: the flow is
> separated, when there is significant film or transpiration cooling (which
> thickens the layer and changes $\bar\tau_w$ substantially), and for very
> small nozzles where the boundary layer is a large fraction of the radius and
> may be laminar. Use for scaling arguments, not for a performance prediction —
> the real calculation is a boundary-layer code run on the actual contour,
> which is what `[CPIA-246]` requires. [A]/[E]

Since $F \propto r_t^2$ and $S_w \propto r_t^2$ for a geometrically similar
nozzle, the ratio is scale-invariant at first order — but $\bar\tau_w$ falls
slowly with Reynolds number, so **big engines lose less to friction than small
ones**. A 100 N thruster can lose 3–5 % to its boundary layer; an F-1 loses
well under 1 %. This is one of the two main reasons (the other being heat
loss) that small engines have poor $I_{sp}$ efficiency, and it is why you
cannot scale a thruster's measured $\eta_n$ up to a booster.

Film cooling interacts with this directly and badly. Injecting cool fuel along
the wall (Module 11) protects the wall but lowers the local exhaust velocity
and thickens the boundary layer. A 3 % film-cooling flow typically costs 1–2 %
of $I_{sp}$. [E] The F-1 accepted exactly this cost, dumping turbine exhaust
into its nozzle extension as a film-cooling curtain [_verify-liquid, F-1
block], which is why the F-1 plume has that dark outer sheath.

### 3.10 The nozzle efficiency budget

Assemble everything into the form that a performance engineer actually writes
down:

$$\eta_n = \lambda\;\eta_f\;\eta_{kin}\;\eta_{2\phi},
\qquad C_{F,\,delivered} = \eta_n\,C_{F,\,ideal}$$

> **Eq. 3.10 (nozzle efficiency budget)** — variables: $\lambda$ divergence,
> $\eta_f$ friction/boundary layer, $\eta_{kin}$ kinetic (finite-rate
> chemistry), $\eta_{2\phi}$ two-phase (condensed-phase lag; unity for a
> liquid engine with no condensed products). Meaning: the multiplicative loss
> chain from the ideal one-dimensional equilibrium nozzle to the real one.
> Assumes: the losses are independent enough to multiply, which is an
> approximation — film cooling couples $\eta_f$ and $\eta_{kin}$, and
> separation couples everything. Fails when: the flow separates, in which case
> the budget is meaningless and you need the separated $C_F$ directly. The
> rigorous version is the JANNAF simplified/standard methodology
> `[CPIA-246]`, which is what contracts are written against. [E]/[M]

| term | typical liquid-engine value | dominated by | grows when |
|---|---|---|---|
| $\lambda$ divergence | 0.985–0.995 (bell); 0.983 (15° cone) | exit wall angle, contour | the bell is shortened |
| $\eta_f$ friction | 0.985–0.995 | wetted area, Reynolds number, film cooling | the engine is small, long, or film-cooled |
| $\eta_{kin}$ kinetics | 0.97–0.995 | recombination rate vs residence time | $\varepsilon$ is large, $p_c$ is low, and the propellant has a lot of dissociation to recover (LOX/LH2) |
| $\eta_{2\phi}$ two-phase | 1.000 (liquid, no condensates) | condensed mass fraction, particle size | metallized solid propellant — Module 24 §3.6 |
| product $\eta_n$ | **0.96–0.98** | — | — |

**Kinetics deserves a sentence of mechanism, not a number.** In the chamber a
significant fraction of the enthalpy is stored in dissociated species — H, OH,
O in a hydrogen engine; CO and OH in a hydrocarbon one. As the gas expands and
cools, those species want to recombine and release that energy. Whether they
manage it depends on whether the three-body recombination rate can keep up
with the residence time in the expanding nozzle. Near the throat the density
is high and recombination is fast (near-equilibrium); far downstream the
density has fallen by orders of magnitude and the chemistry effectively
freezes. Real performance therefore lies between the frozen and
shifting-equilibrium bounds, closer to equilibrium at high $p_c$ and small
$\varepsilon$, closer to frozen at low $p_c$ and large $\varepsilon$. `[CEA]`
computes both bounds; the JANNAF method computes the finite-rate answer. [F]

For a solid motor with aluminium, $\eta_{2\phi}$ can be 0.95–0.98 and dominates
everything else in this table; that is the subject of Module 24 §3.6 and the
reason a metallized nozzle contour is not a Rao contour.

### 3.11 Altitude optimisation

**The statement of the problem.** Thrust at altitude is

$$F(h) = C_{F,vac}\,p_c A_t - p_a(h)\,A_e = p_c A_t\left[C_{F,vac} - \frac{p_a(h)}{p_c}\varepsilon\right]$$

> **Eq. 3.11 (thrust vs altitude at fixed geometry)** — variables: $p_a(h)$
> ambient pressure at altitude $h$ [Pa]. Meaning: a nozzle's thrust rises with
> altitude by exactly the ambient force on its exit area, and the vacuum term
> is a pure geometry constant. Assumes: attached flow at all altitudes of
> interest, fixed $p_c$ (i.e. the engine is not throttled). Fails when: the
> flow separates at low altitude, in which case the effective $A_e$ is the
> separated area, not the geometric one. [F]

This form makes the whole trade obvious. **Raising $\varepsilon$ raises
$C_{F,vac}$ and simultaneously raises the ambient penalty $p_a\varepsilon/p_c$
linearly.** The first effect saturates (the $C_F$ curve is flat at high
$\varepsilon$); the second does not. So there is always a break-even altitude
between two candidate expansion ratios, and it is trivially derivable.

**Deriving the break-even altitude.** Two nozzles on the same engine — same
$p_c$, same $A_t$, same $c^*$ — with area ratios $\varepsilon_1<\varepsilon_2$
produce equal thrust when

$$C_{F,vac}(\varepsilon_1) - \frac{p_a}{p_c}\varepsilon_1 = C_{F,vac}(\varepsilon_2) - \frac{p_a}{p_c}\varepsilon_2$$

$$\boxed{\;p_{a,\,BE} = p_c\,\frac{C_{F,vac}(\varepsilon_2)-C_{F,vac}(\varepsilon_1)}{\varepsilon_2-\varepsilon_1}\;}$$

> **Eq. 3.12 (break-even ambient pressure)** — variables: $C_{F,vac}$ vacuum
> thrust coefficient, a function of $\gamma$ and $\varepsilon$ only [–].
> Meaning: below this ambient pressure (above this altitude) the larger nozzle
> wins; above it the smaller one does. Assumes: same throat, same $p_c$,
> attached flow in both — check the larger nozzle against a separation
> criterion at sea level before believing the low-altitude end. Fails when: the
> comparison is at constant *thrust* rather than constant throat (then the
> throats differ and so does the whole engine), and when the larger nozzle
> separates. Convert $p_{a,BE}$ to altitude with a standard atmosphere. [F]

The result is that the break-even altitude for realistic first-stage
alternatives lands remarkably low — Worked Example 2 gets 5.5 km for
$\varepsilon = 16$ versus 25 on a 100 bar kerolox engine. A first stage spends
only the first tens of seconds below 5.5 km. That is the quantitative reason
first-stage nozzles are *always* overexpanded at lift-off: the sea-level thrust
loss is real but brief, and it is paid back over the rest of the burn.

**So why not go to $\varepsilon = 40$ on a booster?** Three reasons, in order
of how often they bind:

1. **Separation and side loads** (§3.12). This is the hard limit and it is a
   structural limit, not a performance one.
2. **Base area and vehicle packaging.** Nine Merlins in a 3.7 m octaweb, or
   five F-1s in a 10 m base, leave a fixed exit diameter per engine. This is
   frequently the *actual* constraint and it is geometric, not aerodynamic.
3. **Mass and length**, which for a first stage are worth much less per unit
   $I_{sp}$ than for an upper stage — the classic staging result that upper
   stage $I_{sp}$ is worth roughly three to five times first-stage $I_{sp}$ in
   payload terms.

**The three regimes, stated cleanly.** [M]

| stage | design rule | example |
|---|---|---|
| Sea-level first stage | $\varepsilon$ set by the separation limit, then checked against base area; typically $p_e/p_a \approx 0.35$–0.7 at lift-off | F-1 $\varepsilon = 16$; Merlin 1D $\varepsilon = 16$; RS-27A $\varepsilon = 12$ |
| Sustainer / core burning through the atmosphere | pushed past the naive separation limit because most of the burn is high; relies on a thrust-optimised contour tolerating sea-level operation | RS-25, $\varepsilon = 69$ (or 77.5), ideally expanded at ~12 km |
| Vacuum upper stage | $\varepsilon$ set by interstage diameter, mass, and cooling, not by aerodynamics | RL10B-2 285:1; Vinci 240:1; Merlin Vacuum 165:1 |

### 3.12 Flow separation and side loads

Module 02 §3.14–3.15 established the phenomenon, the Summerfield `[SFS54]` and
Schmucker `[Schmucker73]` criteria, and the FSS/RSS distinction from
`[OMK05]`/`[Ostlund02]`. This section takes it to the point where you can put a
number on the load and a piece of hardware in the load path.

**The criteria, restated with their disagreement made explicit.**

$$\text{Summerfield: } p_{sep} \approx 0.4\,p_a
\qquad\qquad
\text{Schmucker: } \frac{p_{sep}}{p_a} = \left(1.88\,M_{sep}-1\right)^{-0.64}$$

> **Eq. 3.13** — variables: $p_{sep}$ wall static pressure at separation [Pa],
> $M_{sep}$ local Mach number just upstream of separation [–]. Meaning: the
> wall pressure a turbulent boundary layer can survive before the adverse
> gradient from the ambient recompression pushes it off the wall. Assumes:
> conical or near-conical wall, turbulent attached layer, steady operation.
> Fails when: the contour is thrust-optimised and the separation is restricted
> (RSS), during start and shutdown transients, and outside the $M\approx2$–5
> fit range for Schmucker. The two criteria routinely disagree by 20–40 % in
> separation *area*, and in marginal cases they disagree about whether the
> nozzle separates at all — see Worked Example 2, where at $\varepsilon=25$
> Schmucker says attached and Summerfield says separated on the same hardware.
> [E]

**Free shock separation (FSS)** is the classical picture: the layer lifts off,
an oblique shock forms, the jet flows on as a free jet, ambient air recirculates
in the annulus between jet and wall, and the wall downstream of separation sits
at slightly *below* ambient. Wall-pressure traces show a sharp rise at
separation followed by a long flat plateau.

**Restricted shock separation (RSS)** occurs in thrust-optimised contours. The
internal shock that a Rao contour generates near the throat (an unavoidable
by-product of turning hard and then turning back) interacts with the separation
shock so that the separated shear layer **reattaches**, trapping a closed
recirculation bubble. Downstream of reattachment the wall pressure rises to
*above* ambient — typically 1.1–1.3 $p_a$. That is the crucial number for
loads, because it means the two topologies do not just differ in where the
pressure rises; they differ in *sign* relative to ambient.

**Why the transition is what hurts.** During start-up, $p_c$ climbs from zero
to full in a few hundred milliseconds. The separation point sweeps down the
nozzle, and at some point the pattern flips FSS → RSS. The flip does not happen
simultaneously around the circumference. For a few tens of milliseconds one
side of the nozzle is in RSS (wall pressure above ambient) and the other in FSS
(wall pressure below ambient), over a large fraction of the nozzle's downstream
area. That is the dominant side-load mechanism in large bell nozzles.
`[OMK05]`, `[Ostlund02]`. [F]/[M]

**Putting a number on the side load.** Take a wall band between axial stations
$x_1$ and $x_2$ over which the pressure is $p_A$ on one half of the
circumference ($0<\theta<\pi$) and $p_B$ on the other. The lateral force is the
integral of pressure against the wall normal:

$$F_{side} = \left|\oint\!\!\int p\,\hat n\cdot\hat y\;r\,d\theta\,dx\right|
= \left|-\int_{x_1}^{x_2}\!\! r\left[p_A\!\!\int_0^{\pi}\!\!\sin\theta\,d\theta + p_B\!\!\int_{\pi}^{2\pi}\!\!\sin\theta\,d\theta\right]dx\right|$$

$$\boxed{\;F_{side} = 2\,\Delta p\int_{x_1}^{x_2} r(x)\,dx \;\approx\; 2\,\Delta p\,\bar r\,\Delta x\;}$$

> **Eq. 3.14 (half-and-half side-load model)** — variables: $\Delta p =
> |p_A-p_B|$ the circumferential pressure difference [Pa], $\bar r$ mean wall
> radius over the band [m], $\Delta x$ axial extent of the asymmetry [m].
> Meaning: an asymmetric wall pressure over an area produces a lateral force
> equal to twice the pressure difference times the *projected* side area of
> the band. Assumes: a clean half-and-half circumferential split (the worst
> realistic case for a given $\Delta p$ and $\Delta x$), nearly cylindrical
> wall over the band, quasi-steady. Fails when: the asymmetry is a smoothly
> varying tilt rather than a step (then the answer is smaller by a factor of
> order 2), and it says nothing about the *frequency content*, which is what
> actually determines whether the nozzle's bending modes are excited. [F]/[A]

Eq. 3.14 is the model to argue with, because it separates the two things that
set side-load magnitude: **how big the pressure difference is** ($\Delta p$,
which is $\sim0.3\,p_a$ for separation-line wander within FSS but
$\sim0.9\,p_a$ for an FSS/RSS split) and **how much of the nozzle is
asymmetric** ($\Delta x$, which is centimetres for wander and of order a metre
for a topology flip). Worked Example 3 runs both cases for the RS-25 and shows
that only the second reaches the hundreds of kN that are actually measured.

**Mitigations, and what each one really costs.** [M]/[J]

1. **Start sequencing.** Ramp $p_c$ fast through the dangerous window. Cheapest
   fix, and the first one tried, but it fights against every other
   consideration in the start transient (chill-down, ignition margin,
   turbopump acceleration, Module 08).
2. **Stiffening rings** ("hat bands"): circumferential rings welded or brazed
   around the outside of the nozzle. They do nothing about the load; they raise
   the ovalisation and bending stiffness so that the shell does not buckle and
   the bending modes move away from the excitation. The RS-25 and Vulcain 2
   nozzles both carry them, and Vulcain's reinforcement was a direct response
   to measured start-transient loads [_verify-liquid, Vulcain block],
   `[Ostlund02]`.
3. **Truncate the contour.** Accept less $\varepsilon$. Always works, always
   costs vacuum $I_{sp}$, and is the reason booster engines cluster at
   $\varepsilon\lesssim25$–40.
4. **Contour choice.** A pure "truncated ideal contour" generates a weaker
   internal shock than an aggressive thrust-optimised parabolic contour and is
   less prone to RSS. This is a real design lever and it costs a few tenths of
   a per cent of $C_F$. `[OMK05]`
5. **Cold-flow subscale testing** of the exact contour. Not a mitigation but
   the only way to know which regime you are in before hot fire.

### 3.13 Altitude-compensating nozzles

A fixed bell is optimal at exactly one altitude. The idea of a nozzle whose
effective area ratio adapts is as old as the field, and its history is a good
lesson in why "obviously better" and "flown" are different categories.

**Aerospike / plug nozzles.** Invert the geometry: instead of expanding the
flow inside a bell, run it along the *outside* of a central plug, with an
annular throat at the plug's base radius. The outer boundary of the flow is
then not a wall but the ambient air. At low altitude the higher ambient
pressure squeezes the plume in, the flow follows the plug at a lower effective
area ratio, and the nozzle is nearly ideally expanded. At altitude the plume
expands outward and the effective area ratio rises. Compensation is genuine and
continuous, and this is the only concept in this section that compensates over
the *entire* trajectory.

- **Annular (axisymmetric) aerospike**: a body of revolution. The **J-2T**
  programme in the late 1960s built toroidal-aerospike testbeds from J-2
  hardware; they ran, and the programme was cancelled with Apollo. [H]
- **Linear aerospike**: the plug is a wedge, the throat a pair of slots. The
  **XRS-2200** — two of them were built and hot-fired at Stennis in 2001,
  derived from J-2S turbomachinery — was the X-33 engine. X-33 was cancelled
  in 2001 over composite-tank failures, not engine problems, and the linear
  aerospike has never flown. [H]
- **Truncation and base bleed.** A full-length spike is long and heavy, so real
  designs truncate it to 20–30 % of ideal length. That leaves a blunt base
  whose pressure would otherwise be low and draggy; bleeding a small secondary
  flow (turbine exhaust, typically) into the base region raises base pressure
  and recovers most of the truncated thrust. Truncation plus base bleed is what
  makes an aerospike a plausible engine rather than a curiosity. [F]/[H]
- **Firefly Alpha** is described by its manufacturer as using a "tapered
  aerospike" nozzle on its Reaver first-stage engines. **This is a company
  claim** and the published imagery shows a conventional-looking bell; treat
  the aerospike characterisation as unverified marketing until a primary source
  says otherwise. [_verify-liquid conventions on company claims] [M]

**Why has no aerospike flown at scale?** Not because the aerodynamics fails —
the compensation is real and has been measured. Because of the thermal and mass
problem. A bell nozzle's expansion surface is cooled by being the *outside* of
a thin shell with coolant behind it, and its area grows as $\varepsilon$ grows
but so does the distance from the throat, so the flux falls fast. A plug's
expansion surface is a solid body sitting in the hottest, highest-pressure part
of the flow immediately downstream of the throat, it has a large wetted area at
high flux, and it must be actively cooled over essentially all of it. The
resulting cooled-surface area per unit thrust is far worse than a bell's, which
eats the mass and $I_{sp}$ benefit and adds a hard development problem. [J] That
is the honest answer, and it is why the concept keeps being re-proposed and
keeps not flying.

**Expansion–deflection (E–D).** Put a plug *inside* the nozzle, at the throat,
so the flow is deflected outward through an annular throat and then expands
against the bell wall on the outside and a free boundary on the inside. The
free inner boundary adjusts with ambient pressure, giving compensation with an
external shape that looks like a normal bell. Compensation range is narrower
than an aerospike's and the centre-body cooling problem is the same one in
miniature. Extensively studied, never flown. [R]

**Dual-bell.** The cheapest idea in the family: a single fixed nozzle with two
contour sections joined at a deliberate **wall inflection**. At sea level the
flow separates cleanly and repeatably *at the inflection*, so the nozzle
behaves as a small-$\varepsilon$ nozzle with a controlled, symmetric separation
(hence no side loads). Above a transition altitude the flow attaches to the
extension and the nozzle behaves as a large-$\varepsilon$ nozzle. Two operating
points instead of a continuum, no moving parts, small mass penalty.

The problems are real: the transition is hysteretic and can be unstable near
the transition altitude; there is a performance loss in the extension while in
sea-level mode; and the extension's heat load in attached mode must be handled.
European programmes (DLR and ArianeGroup, with **subscale and Vulcain-related
dual-bell testing** through the 2000s and 2010s) have taken this furthest.
Still not flown on an operational engine. [R] `[OMK05]`

**Extendable nozzles — the one that works.** If the constraint is *stowed
length* rather than altitude compensation, the answer is mechanical: fly with a
short nozzle and translate an extension into place after staging. This is not
altitude compensation at all — it is packaging — but it is the only member of
this section with a flight record, and it is a good one.

- **RL10B-2**: a NOVOLTEX/SEPCARB 3D carbon–carbon extension roughly 2.5 m
  (100 in) long with an exit diameter just over 2.1 m (84 in), translated into
  place after stage separation. It takes the engine from $\varepsilon = 77$
  retracted to $\varepsilon = 285$ deployed — the largest carbon–carbon
  extendible nozzle ever flown, and the reason the engine holds the flown
  $I_{sp}$ record at 465.5 s [_verify-liquid, RL10B-2 block]. (Some tables
  quote 280:1; that is a rounding — contested item 6.) [M]
- **Vinci**: $\varepsilon = 240$ with a deployable extension; the nozzle is
  about 70 % of the engine's ~550 kg mass, against 160 kg for the engine
  without it [_verify-liquid, Vinci block]. That single ratio is the best
  argument in the course for why nozzle mass is a first-order design variable
  on an upper stage. [M]
- Solid upper stages have used extendable exit cones for the same reason for
  longer (Module 24 §3.7).

The cost is a deployment mechanism that must work once, in vacuum, after
launch loads and thermal cycling, with no meaningful abort mode if it does not.
[J] It is a single-point failure that programmes accept because the $I_{sp}$ is
worth it; you should be able to argue both sides.

### 3.14 Nozzle construction

The contour is the easy half. The nozzle also has to survive a wall heat flux
of 1–20 MW/m² near the throat, carry the thrust load from the exit cone into
the gimbal bearing, and be manufacturable at the programme's production rate.
There are six architectures in the flown record and each is a different answer
to "what carries the heat away".

**1. Tube-wall (brazed tube bundle).** The nozzle wall is made of hundreds of
individually formed, tapered tubes laid side by side and brazed into a
continuous shell, with external bands and a jacket carrying the hoop load.
Coolant flows inside the tubes. The tapering is what makes it work: each tube
is drawn so its cross-section follows the local circumference, keeping the tube
count constant from throat to exit.

- **F-1**: 178 brazed tubes, RP-1 cooled, up-pass/down-pass routing
  [_verify-liquid, F-1 block].
- **J-2**, **RL10**, **RS-27A**, **Vulcain**: all tube-wall.
- **RS-25**: the *chamber* is milled-channel but the **nozzle is a 1,080-tube
  brazed tube-wall**, hydrogen-cooled [_verify-liquid, RS-25 block].

Why it dominated for forty years: a tube wall is the lightest possible
regeneratively cooled structure, because the tube itself is both the pressure
vessel for the coolant and the heat-transfer surface, with no redundant
material. Why it is dying: it is enormously labour-intensive. Hundreds of tubes
must be individually formed, fitted, and braze-joined without a single leak
path, and every braze joint is an inspection item. [H]/[M]

**2. Milled channel (channel-wall).** Machine axial coolant channels into the
outside of a thick liner, then close them out with an electroformed nickel
deposit, a brazed jacket, or (increasingly) a laser-welded or
additively-deposited shell. Heavier than tube-wall for the same cooling because
the liner carries material that is neither pressure vessel nor heat-transfer
surface, but vastly cheaper and more inspectable.

- **RS-25 main combustion chamber**: 390 milled channels in a NARloy-Z liner
  with electroformed-nickel closeout [_verify-liquid, RS-25 block].
- **Merlin 1D**: milled-channel chamber *and* nozzle, RP-1 cooled
  [_verify-liquid, Merlin block] — a deliberate manufacturing choice at
  hundreds of engines per year.
- **Vulcain 2.1**: a laser-welded sandwich nozzle with **90 % fewer parts, 40 %
  lower cost and 30 % faster production** than the Vulcain 2 tube-wall nozzle
  it replaced, at slightly *lower* engine thrust [_verify-liquid, Vulcain
  block]. This is the clearest documented case in the file of manufacturing
  driving a nozzle redesign. [M]

**3. Radiatively cooled refractory metal.** Above a certain area ratio the heat
flux has fallen far enough that a bare wall can reach radiative equilibrium at
a temperature a refractory alloy can hold. No coolant, no channels, no braze
joints — just a thin formed shell bolted to the regen section.

The material of choice is **niobium (columbium) alloy C-103** (Nb–10Hf–1Ti)
with a silicide oxidation-resistant coating, good to roughly 1,300–1,600 K in
service. The coating is the life-limiting item: niobium oxidises
catastrophically if the silicide is breached, so handling damage is a flight
risk and coated skirts are treated as delicate hardware.

- **Merlin 1D Vacuum**: radiatively cooled niobium-alloy extension taking the
  engine to $\varepsilon = 165$; it glows cherry-red in flight, which is the
  design intent and not a fault [_verify-liquid, Merlin block]. [M]
- **Apollo SPS**: ablative chamber with a radiatively cooled niobium/titanium
  extension (standard Apollo description; flagged medium-to-low confidence in
  the reference file). [H]
- Small storable thrusters (R-4D and its descendants) are almost universally
  radiation-cooled refractory metal. `[SP-8124]`

**4. Carbon–carbon.** Carbon fibre in a carbon matrix: it does not melt, its
strength *rises* with temperature to ~2,000 K, its density is ~1.8 g/cm³
against niobium's 8.6, and it radiates well. It is also brittle, expensive,
made by a densification process measured in weeks, and it oxidises in air, so
it needs an oxidation-protection coating for anything but a vacuum-only duty
cycle.

- **RL10B-2**: 3D-woven NOVOLTEX/SEPCARB carbon–carbon extension, ~2.5 m long,
  the largest ever flown [_verify-liquid, RL10B-2 block]. [M]

**5. Ablative.** Line the nozzle with silica- or carbon-phenolic. The resin
pyrolyses, the pyrolysis gas blows into the boundary layer and blocks part of
the convective flux, and a char layer insulates what remains. Thickness is
sized from a recession rate and a bond-line temperature limit (Module 24 §5.3
does the arithmetic for a solid motor; the method is identical). Single-use by
definition, and heavy, but it needs no coolant circuit at all, which is
decisive for a pressure-fed engine with no pump to raise coolant pressure.

- **LMDE**: ablative chamber with a radiatively cooled skirt, and the throat
  erosion limit is precisely why the **60–100 % throttle band was prohibited**
  in operation [_verify-liquid, LMDE block]. [H]
- **Apollo SPS**: ablative chamber. [H]
- **RS-68 / RS-68A**: regeneratively cooled main chamber with an **ablative
  nozzle** — a deliberate design-for-cost choice that also caps $\varepsilon$
  at 21.5, very low for a hydrogen engine, because ablative liner mass grows
  with wetted area. The ablated carbon burning in atmospheric oxygen is what
  makes the RS-68 plume orange [_verify-liquid, RS-68 block]. It also
  foreclosed any reuse path. [M]

**6. Dump and film cooling.** Route a coolant through or along the wall and
discharge it into the exhaust rather than returning it to the injector. Two
flavours in the flown record:

- **Turbine-exhaust film cooling.** The F-1 dumps gas-generator exhaust into
  its nozzle extension as a film-cooling curtain, which is why the extension
  needs no regen circuit; Vulcain 2 added turbine-exhaust film cooling to its
  lower nozzle when the higher $p_c$ and richer mixture ratio of the uprate
  raised the wall flux [_verify-liquid, F-1 and Vulcain blocks]. Cheap in
  hardware, expensive in $I_{sp}$ (§3.9). [H]/[M]
- **Coolant dump.** Pass hydrogen through the nozzle wall and dump it
  overboard or into the divergent instead of burning it. Studied heavily for
  1960s hydrogen upper stages; rare in flight because dumping unburnt fuel is
  an $I_{sp}$ loss you pay continuously.
- The contrast case is **RS-68**, which dumps its gas-generator exhaust through
  a *separate side duct* rather than into the nozzle — because the ablative
  nozzle needs no cooling, there is nothing to gain by routing it inside, and
  the duct is simpler [_verify-liquid, RS-68 block]. [M]

**Structural note.** Whatever the wall is made of, the exit cone must carry the
gimballed thrust load and survive side loads (§3.12). That means external
stiffening rings, a stiff throat-region attachment, and — on any engine that
starts at sea level with a high area ratio — a structural qualification against
a transient side load that is *larger than any steady load the nozzle ever
sees*.

---

## 4. Typical engineering ranges

| quantity | typical range | low end | high end |
|---|---|---|---|
| Expansion ratio $\varepsilon$, sea-level booster | 8–25 | RS-27 8:1 | Raptor SL ~34.3 (claim) |
| Expansion ratio $\varepsilon$, sustainer / core | 25–70 | Vulcain 1 45.1 | RS-25 69 (or 77.5) |
| Expansion ratio $\varepsilon$, vacuum upper stage | 40–285 | J-2 27.5 (interstage-limited) | RL10B-2 285 |
| Contraction ratio $\varepsilon_c$ | 1.5–10 | large boosters ≈ 2 | small thrusters > 5 |
| Convergence half-angle $\beta$ | 20–45° | — | 30° is the default |
| Divergence half-angle $\alpha$ (conical) | 12–20° | — | 15° is the default |
| $R_u/r_t$ (upstream) | 0.5–2.0 | — | 1.5 is the default |
| $R_d/r_t$ (downstream) | 0.382 (bell); 0.5–1.5 (cone) | — | — |
| Initial wall angle $\theta_n$ (80 % bell) | 20–30° | low $\varepsilon$ | high $\varepsilon$ |
| Exit wall angle $\theta_e$ (80 % bell) | 5–15° | high $\varepsilon$ | low $\varepsilon$ |
| Percentage bell length | 60–100 % | short booster nozzles | vacuum upper stages |
| Divergence efficiency $\lambda$ | 0.98–0.995 | 15° cone 0.983 | long bell ≈ 0.995 |
| Friction efficiency $\eta_f$ | 0.95–0.995 | small thrusters | large boosters |
| Kinetic efficiency $\eta_{kin}$ | 0.97–0.995 | high-$\varepsilon$ low-$p_c$ hydrogen | high-$p_c$ storable |
| Overall nozzle efficiency $\eta_n$ | 0.96–0.98 | — | — |
| Throat discharge coefficient $C_d$ | 0.97–0.995 | $R_u/r_t = 0.5$ | $R_u/r_t \ge 1.5$ |
| $p_e/p_a$ at lift-off, first stage | 0.3–0.8 | RS-25 0.18 (sustainer) | RS-27A ≈ 0.9 |
| Nozzle mass fraction of engine dry mass | 15–70 % | booster engines | Vinci ≈ 70 % |
| Start-transient side load, large bell | $10^1$–$10^2$ kN | small nozzles, FSS wander only | RS-25 / Vulcain FSS↔RSS flip |

### Real nozzle designs compared

All figures from `reference/_verify-liquid.md`; carry its confidence labels.
**Percentage bell length is almost never published** — programmes treat the
contour as proprietary — so that column is honest about what is and is not
known, and "bell" without a percentage means the contour type is documented but
the length ratio is not.

| engine | $\varepsilon$ | contour | length % | cooling of the divergent | material |
|---|---|---|---|---|---|
| F-1 | 16 | bell + extension | not published | regen tube-wall to the extension joint; **GG-exhaust film cooling** of the extension | 178 brazed nickel-alloy tubes, Inconel jacket |
| J-2 | 27.5 | bell | not published | regenerative, fuel-cooled | brazed tube-wall |
| RS-25 | **69 geometric (L3Harris); 77.5 widely quoted** | thrust-optimised bell (RSS-prone) | not published | regenerative, hydrogen-cooled | **1,080-tube brazed tube-wall** (chamber is 390 milled channels, NARloy-Z) |
| RS-68A | 21.5 | bell | not published | **ablative** (chamber is regen) | silica/carbon-phenolic |
| RS-27A | 12 (RS-27: 8) | bell | not published | regenerative, fuel-cooled | tube-wall, H-1 heritage |
| Merlin 1D (SL) | 16 | bell | not published | regenerative, RP-1 cooled | **milled channel** |
| Merlin 1D Vacuum | 165 | bell + skirt | not published | regen to the joint, then **radiative** | milled-channel + **niobium-alloy skirt** |
| RL10A-3-3A | 61 | bell | not published | regenerative (the cooling circuit *is* the power cycle) | brazed stainless tube-wall |
| RL10B-2 | **285 deployed / 77 retracted** | bell + **extendable** extension | not published | regen tube-wall, then **uncooled radiative** | **3D carbon–carbon (NOVOLTEX/SEPCARB)** |
| RL10C-1 | 130 | bell, fixed | not published | regenerative | tube-wall |
| Vulcain 2 | 58.2 | bell | not published | regen tube-wall + **turbine-exhaust film cooling of the lower nozzle** | tube-wall |
| Vulcain 2.1 | not separately published | bell | not published | regenerative | **laser-welded sandwich**, 90 % fewer parts |
| Vinci | 240 | bell + **deployable** extension | not published | regen (milled channels) + extension | nozzle ≈ 70 % of the 550 kg engine mass |
| LE-5B / HM7B class upper stages | 110 / 83 class | bell | not published | see reference file | — |
| LMDE (Apollo LM descent) | 47.5 (Apollo ≤14) / 53.6 (≥15) | bell | not published | **ablative** chamber + radiative skirt | ablative + radiative skirt |
| Apollo SPS (AJ10-137) | 62.5 *(flagged: verify)* | bell, 3.882 m long, 2.501 m exit | not published | **ablative** chamber + radiative extension | ablative + niobium/titanium *(flagged)* |
| Raptor 2/3 (SL) | ~34.3 — **company claim** | bell | not published | regen, methane-cooled milled channels | milled channel |
| Raptor Vacuum | ~80 — **company claim** | bell | not published | regen + extension | not published |

Two observations to take from that table. First, **every flown high-$\varepsilon$
nozzle solves the cooling problem by ending the regenerative circuit partway
down and letting the rest run hot** — radiatively (Merlin Vac, RL10B-2),
ablatively (RS-68, LMDE, SPS), or with a dumped film (F-1, Vulcain 2). Nobody
regeneratively cools a 285:1 nozzle, because there is not enough coolant
enthalpy and not enough coolant pressure to push it through that much channel
length. Second, **the modern trend is unambiguously away from tube-wall**:
Merlin, Vinci and Vulcain 2.1 are all channel or sandwich constructions, and
the reason is production rate and part count, not performance.

---

## 5. Worked examples

Worked Examples 1 and 2 build directly on the 500 kN LOX/RP-1 engine sized in
Module 03 WE1; its parameters are repeated where used. The library calls are
registered in `tools/examples/09.py`.

### 5.1 Full nozzle geometry for the Module 03 500 kN engine

**Given** (Module 03 §5, WE1): $F_{SL} = 500$ kN, $p_c = 10.0$ MPa (100 bar),
LOX/RP-1 at $MR = 2.35$, $\gamma = 1.20$, $c^* = 1\,689$ m/s delivered,
$\dot m = 184.8$ kg/s, $\varepsilon = 16$, contraction ratio
$\varepsilon_c = 2.5$.

**Step 1 — throat area, both routes.**

Route 1 (Eq. 3.1):
$$A_t = \frac{\dot m\,c^*}{p_c} = \frac{184.8 \times 1689}{1.000\times10^{7}} = 0.031213\ \mathrm{m^2}$$

Route 2 (Eq. 3.2), with $C_F = 1.602$ at sea level from Module 03:
$$A_t = \frac{F}{p_c C_F} = \frac{500\,000}{1.602\times10^{7}} = 0.031206\ \mathrm{m^2}$$

The two agree to 0.02 %, which is the internal-consistency check of §3.2 and
tells us $c^*$, $C_F$ and $\dot m$ are mutually compatible. Take
$A_t = 0.031206$ m².

$$r_t = \sqrt{A_t/\pi} = \sqrt{0.031206/\pi} = 0.099665\ \mathrm{m}
\quad\Rightarrow\quad D_t = 199.3\ \mathrm{mm}\ (7.85\ \mathrm{in})$$

**Step 2 — exit.**
$$A_e = \varepsilon A_t = 16 \times 0.031206 = 0.49930\ \mathrm{m^2},\qquad
r_e = 0.39866\ \mathrm{m},\qquad D_e = 797.3\ \mathrm{mm}\ (31.4\ \mathrm{in})$$

**Step 3 — throat curvature (§3.3).**
$$R_u = 1.5\,r_t = 149.5\ \mathrm{mm},\qquad R_d = 0.382\,r_t = 38.07\ \mathrm{mm}$$

**Step 4 — the converging section.** With $\varepsilon_c = 2.5$,
$A_c = 0.078015$ m², $r_c = 157.6$ mm ($D_c = 315.2$ mm — matching Module 03's
chamber sizing). Take $\beta = 30°$. The convergent is the upstream throat arc
turning from $\beta$ to 0, plus a straight cone:

*Arc:* radial rise $R_u(1-\cos 30°) = 0.14950 \times 0.13397 = 20.03$ mm;
axial extent $R_u\sin 30° = 74.75$ mm; radius at the arc's upstream end
$= 99.67 + 20.03 = 119.69$ mm.

*Cone:* radial rise $157.6 - 119.7 = 37.83$ mm; axial extent
$37.83/\tan 30° = 65.53$ mm.

$$L_{conv} = 74.75 + 65.53 = 140.3\ \mathrm{mm}$$

The whole converging section is 140 mm against a divergent that will be 900+
mm. That ratio — roughly 1:6 — is typical and is why nobody optimises the
convergent.

**Step 5 — conical nozzle, 15° (Eq. 3.7).**
$$L_{cone} = \frac{r_t(\sqrt{\varepsilon}-1) + 1.5\,r_t(\sec 15° - 1)}{\tan 15°}
= \frac{0.099665(3) + 0.149498(0.035276)}{0.267949}$$
$$= \frac{0.298996 + 0.005274}{0.267949} = \boxed{1.1356\ \mathrm{m}}$$

Divergence efficiency, Eq. 3.6:
$$\lambda = \frac{1+\cos 15°}{2} = \frac{1+0.965926}{2} = \boxed{0.98296}$$
— the classic **1.70 % divergence loss**.

**Step 6 — 80 % bell length.** By the convention of §3.7:
$$L_{80} = 0.80 \times 1.1356 = \boxed{0.9084\ \mathrm{m}}$$

We have saved **227 mm of engine length** and, from the wetted-area table in
§3.8, **13 % of the divergent's surface area**.

**Step 7 — construct the contour (Eq. 3.3 and 3.8).** From the $\theta$ table
in §3.7 at $\varepsilon = 16$, 80 % bell: $\theta_n \approx 22°$,
$\theta_e \approx 11°$.

Inflection point (Eq. 3.3):
$$x_N = R_d\sin 22° = 0.038072 \times 0.374607 = 0.014262\ \mathrm{m}$$
$$r_N = r_t + R_d(1-\cos 22°) = 0.099665 + 0.038072(0.072763) = 0.102438\ \mathrm{m}$$

Exit point: $E = (0.90844,\ 0.398661)$ m. Slopes $\tan 22° = 0.404026$ and
$\tan 11° = 0.194380$. Intersecting the two tangent lines:
$$x_Q = \frac{(r_e - m_e L) - (r_N - m_n x_N)}{m_n - m_e}
= \frac{(0.398661 - 0.176555) - (0.102438 - 0.005762)}{0.404026-0.194380} = 0.59817\ \mathrm{m}$$
$$r_Q = r_N + m_n(x_Q - x_N) = 0.102438 + 0.404026(0.583908) = 0.33835\ \mathrm{m}$$

So the contour is the quadratic Bézier through
$N(0.01426,\,0.10244)$ — $Q(0.59817,\,0.33835)$ — $E(0.90844,\,0.39866)$, all
in metres from the throat plane. At the curve midpoint $t=0.5$ the contour is
at $x = 0.5298$ m, $r = 0.2944$ m, i.e. a **local area ratio of 8.7 at 58 % of
the length** — the bell has done more than half its expansion in the first
half of its length, which is the whole point of Rao's contour.

```
   r
0.40 |                                    ,-·-·-·-·-· E (0.908, 0.399)  θe=11°
     |                            ,-·-·''
0.30 |                    ,-·-·''
     |             ,-··''
0.20 |       ,-·''             (80 % bell, Rao parabola)
     |   ,·''
0.10 |_,N (0.014, 0.102)  θn=22°
     |( throat, r_t = 0.0997
     +------------------------------------------------- x
     0        0.2       0.4       0.6       0.8      0.91
```

**Step 8 — divergence efficiency of the bell.** Eq. 3.6 does **not** apply to a
bell (see its callout). A bound is available: if every streamline left at the
exit wall angle, $\lambda$ would be $(1+\cos 11°)/2 = 0.9908$; since the core
flow is very nearly axial and only the outer flow is turned, the true value is
higher. Design practice `[SB §3.4]`, `[SP-8120 §3.2]` puts an 80 % bell at
$\lambda \approx 0.99$, against 0.983 for the 15° cone. **The bell recovers
about 0.7 % of thrust while being 20 % shorter.** [E]

$$\Delta I_{sp} \approx 0.007 \times 276\ \mathrm{s} \approx 1.9\ \mathrm{s\ (sea\ level)},
\qquad \approx 0.007\times303 \approx 2.1\ \mathrm{s\ (vacuum)}$$

**Sanity check.** A 500 kN kerolox engine with a 199 mm throat, a 797 mm exit,
a 908 mm divergent and a 140 mm convergent is about 1.1 m from injector face to
exit plane with the chamber included. Merlin 1D — 845 kN, $p_c = 97$ bar,
$\varepsilon = 16$ — is a comparable machine, and this geometry scales to it by
$\sqrt{845/500} = 1.30$ in every linear dimension. Nothing here is the wrong
size. The 1.70 % conical divergence loss also reproduces the $\eta_{C_f} =
0.98$ that Module 03 assumed as a judgement call, which is the point of doing
the geometry: the assumption is now a calculation.

### 5.2 Break-even altitude: $\varepsilon = 16$ versus $\varepsilon = 25$

**The question.** Same 500 kN engine, same throat, same $p_c = 10$ MPa. Should
the first stage fly $\varepsilon = 16$ or $\varepsilon = 25$?

**Step 1 — exit conditions for both.** Invert the area–Mach relation
($\gamma = 1.20$) and apply Eq. 3.5:

| $\varepsilon$ | $M_e$ | $p_e$ (kPa) | $p_e/p_a$ at SL | $A_e$ (m²) | $C_{F,vac}$ | $C_{F,SL}$ |
|---|---|---|---|---|---|---|
| 16 | 3.6044 | 67.70 | 0.668 | 0.4993 | 1.7971 | 1.6350 |
| 25 | 3.9128 | 38.04 | 0.375 | 0.7802 | 1.8424 | 1.5891 |

**Step 2 — check separation before believing either column.** At
$\varepsilon = 25$, Schmucker (Eq. 3.13) at $M_e = 3.9128$ gives
$$p_{sep} = 101\,325\,(1.88\times3.9128 - 1)^{-0.64} = 31.0\ \mathrm{kPa}$$
and $p_e = 38.0$ kPa $> 31.0$ kPa, so Schmucker says **attached**, by a margin
of 23 %.

Summerfield gives $p_{sep} = 0.4 \times 101\,325 = 40.5$ kPa, and
$p_e = 38.0$ kPa $< 40.5$ kPa, so Summerfield says **separated**.

**The two criteria disagree about the answer, not merely about the number.**
For $\varepsilon = 16$ both agree it is attached ($p_e = 67.7$ kPa against
33.0 kPa Schmucker and 40.5 kPa Summerfield). [J] At $\varepsilon = 25$ you
would not proceed on either criterion alone: you would run the contour in a
cold-flow subscale test, or you would treat 25 as the upper bound and design to
20–22 with margin. This is the real reason booster expansion ratios cluster
where they do — not because 25 is impossible but because the criteria stop
being trustworthy right there.

**Step 3 — break-even ambient pressure (Eq. 3.12).**
$$p_{a,BE} = p_c\,\frac{C_{F,vac}(25)-C_{F,vac}(16)}{25-16}
= 1.000\times10^{7}\times\frac{1.8424 - 1.7971}{9} = 1.000\times10^{7}\times\frac{0.045303}{9}$$
$$p_{a,BE} = 50.34\ \mathrm{kPa}$$

**Step 4 — convert to altitude.** In the 1976 US Standard Atmosphere
troposphere ($T_0 = 288.15$ K, $L = 6.5$ K/km, $R_{air} = 287.05$ J/(kg K)):
$$h = \frac{T_0}{L}\left[1-\left(\frac{p_a}{p_0}\right)^{\frac{R_{air}L}{g_0}}\right]
= \frac{288.15}{0.0065}\left[1-\left(\frac{50\,337}{101\,325}\right)^{0.19026}\right]$$
$$\boxed{h_{BE} = 5.52\ \mathrm{km}}$$

**Step 5 — the thrust histories.**

| $h$ (km) | $p_a$ (kPa) | $F_{16}$ (kN) | $F_{25}$ (kN) | $F_{25}-F_{16}$ (kN) |
|---|---|---|---|---|
| 0 | 101.33 | 510.2 | 495.9 | **−14.3** |
| 2 | 79.50 | 521.1 | 512.9 | −8.2 |
| 4 | 61.64 | 530.0 | 526.9 | −3.2 |
| **5.52** | **50.34** | **532.8** | **532.8** | **0.0** |
| 8 | 35.60 | 543.0 | 547.2 | +4.1 |
| 12 | 19.33 | 551.2 | 559.9 | +8.7 |
| 20 | 5.47 | 558.1 | 570.7 | **+12.6** |

In $I_{sp}$ terms: $\varepsilon = 25$ gives **317.3 s vacuum against 309.5 s**
(+7.8 s) and **273.7 s sea level against 281.6 s** (−7.9 s).

**Step 6 — decide.** A kerolox first stage burning for ~160 s passes 5.5 km at
roughly T+70 s if it is a typical booster trajectory, so it spends about 40 %
of its burn below break-even and 60 % above. The integrated impulse gain is
therefore **positive but small**, and it is bought with 56 % more exit area
(0.780 m² against 0.499 m²), 25 % more divergent length, more nozzle mass, and
a separation margin that two respectable criteria disagree about.

[J] **Recommendation: $\varepsilon = 16$**, which is also what the F-1 and
Merlin 1D chose at the same $p_e/p_a$. The exception is a stage that separates
high — an Atlas-style sustainer, or a booster whose first stage burns to 70 km
— where the impulse integral swings decisively the other way. Note also that
the *vehicle* answer differs from the *engine* answer: if the stage is
thrust-limited off the pad (T/W barely above 1.2), the 14 kN per engine you
lose at lift-off costs gravity loss immediately, and that alone can settle it.

**Sanity check.** The RS-27 → RS-27A change is exactly this trade run in
reverse and in flight hardware: enlarging the nozzle from $\varepsilon = 8$ to
12 *lowered* sea-level thrust from 971 kN to 890 kN and sea-level $I_{sp}$ from
264 s to 255 s, while raising vacuum $I_{sp}$ from 295 s to 302 s
[_verify-liquid, RS-27A block]. Delta II flew the version with less sea-level
thrust on purpose. Our numbers say that is the right sign and the right
magnitude.

### 5.3 RS-25 at sea level: separation station and side-load magnitude

**Given** [_verify-liquid, RS-25 block]: $p_c = 20.64$ MPa (2,994 psia) at
109 % power level, $\varepsilon = 77.5$ (the aerodynamics-literature value; the
L3Harris geometric value is 69 — see §6.2, and Step 5 below repeats the
calculation there). Exit diameter taken as 2.4 m, so
$A_e = \pi(1.2)^2 = 4.524$ m² and $A_t = 4.524/77.5 = 0.05837$ m²
($D_t = 272.6$ mm). $\gamma = 1.20$, $p_a = 101.325$ kPa.

**Step 1 — full-power separation station.** Solve Eq. 3.13 simultaneously with
the isentropic wall-pressure relation:
$$\frac{p_c}{\left(1+0.1\,M^2\right)^{6}} = p_a\left(1.88M-1\right)^{-0.64}$$
Bisection between $M = 1.05$ and $M_e = 4.7066$ gives
$$M_{sep} = 4.4762,\quad \frac{A_{sep}}{A_t} = 56.04,\quad
p_{wall} = 28.11\ \mathrm{kPa},\quad \frac{p_{sep}}{p_a} = 0.277$$
$$r_{sep} = r_t\sqrt{56.04} = 0.13631\times7.486 = 1.0204\ \mathrm{m},\qquad
\frac{r_{sep}}{r_e} = 0.850$$

**Step 2 — the start transient, which is where the trouble lives.** Repeat at
fractions of full chamber pressure:

| $p_c$ (% FPL) | $p_c$ (MPa) | $M_{sep}$ | $A_{sep}/A_t$ | $r_{sep}/r_e$ | $p_{wall}$ (kPa) | $p_a - p_{wall}$ (kPa) |
|---|---|---|---|---|---|---|
| 10 | 2.06 | 3.089 | 7.63 | 0.314 | 37.10 | 64.2 |
| 20 | 4.13 | 3.505 | 13.87 | 0.423 | 33.68 | 67.7 |
| 30 | 6.19 | 3.748 | 19.69 | 0.504 | 32.03 | 69.3 |
| 50 | 10.32 | 4.054 | 30.67 | 0.629 | 30.22 | 71.1 |
| 80 | 16.51 | 4.340 | 46.15 | 0.772 | 28.75 | 72.6 |
| 100 | 20.64 | 4.476 | 56.04 | 0.850 | 28.11 | 73.2 |

The separation point sweeps from 31 % to 85 % of the exit radius as the engine
comes up. **That sweep is the side-load problem**: a moving separation front
traverses most of the nozzle in a few hundred milliseconds.

**Step 3 — side load, case A: separation-line wander within FSS.** Cold-flow
measurements show the separation line is not a perfect circle; it wanders
axially by a few per cent of the local radius. Take an asymmetry extent
$\Delta x = 0.05\,r_{sep} = 51$ mm with $\Delta p = p_a - p_{wall} = 73.2$ kPa
and $\bar r = r_{sep} = 1.020$ m. Eq. 3.14:
$$F_{side} = 2 \times 73\,216 \times 1.020 \times 0.051 = \boxed{7.6\ \mathrm{kN}}$$

Even taking $\Delta x = 0.10\,r_{sep}$ this is only 15 kN — on a nozzle whose
axial thrust is 1.75 MN, under 1 %. **Wander alone does not explain the
observed loads.**

**Step 4 — side load, case B: an FSS/RSS split.** Now let one half of the
circumference be in RSS (wall pressure downstream of reattachment
$\approx 1.2\,p_a = 121.6$ kPa) and the other in FSS ($28.1$ kPa), over the
region from the separation station to the exit. Model that region as a
truncated cone from $r_{sep} = 1.020$ m to $r_e = 1.200$ m with a local wall
angle of 12°:
$$\Delta x = \frac{1.200-1.020}{\tan 12°} = \frac{0.180}{0.21256} = 0.847\ \mathrm{m},
\qquad \bar r = 1.110\ \mathrm{m}$$
$$\Delta p = 121\,590 - 28\,108 = 93.5\ \mathrm{kPa}$$
$$F_{side} = 2 \times 93\,482 \times 1.110 \times 0.847 = \boxed{176\ \mathrm{kN}}$$

**Step 5 — repeat with $\varepsilon = 69$.** The separation *station* is
identical in Mach number and wall pressure — Eq. 3.13 does not know the exit
area — but the throat is larger ($D_t = 288.9$ mm) so $A_{sep}/A_t = 56.04$
maps to $r_{sep} = 1.081$ m, i.e. $r_{sep}/r_e = 0.90$. The FSS wander case
rises to 8.6 kN and the FSS/RSS case falls slightly because the remaining band
is shorter. **The 69-versus-77.5 dispute moves the side-load estimate by under
10 %** — another reason it cannot be settled with performance or loads data
(§6.2).

**Step 6 — read the result.** Two orders of magnitude separate the two
mechanisms: **~8 kN for separation-line wander, ~180 kN for a topology flip.**
The measured start-transient side loads on large bell nozzles are in the
hundreds of kN `[OMK05]`, `[Ostlund02]`, which is case B, not case A.

The engineering conclusions follow immediately and are the reason to do this
calculation at all:

1. A separation *criterion* tells you where the flow leaves the wall. It tells
   you almost nothing about the load, because the load is set by the
   *topology*, which the criteria do not model.
2. Mitigation should target the FSS↔RSS transition — contour shaping, start
   sequencing to cross the window fast — not the separation point itself.
3. The nozzle must be structurally qualified against a transient load that is
   ~10 % of its own axial thrust and lasts tens of milliseconds. That is what
   the stiffening rings and the gimbal-bearing sizing are for.

**Sanity check, and an honest caveat.** Both criteria predict the RS-25 should
be separated at sea level at full power ($p_e = 18.7$ kPa against $p_{sep} =
28.1$ kPa), yet the engine is observed to flow full at mainstage. The
resolution, as Module 02 §5.3 says, is that both criteria were fitted to
conical nozzles in FSS and the RS-25 is a thrust-optimised contour operating in
RSS, where "separated" and "flowing full" are not exclusive. The criteria are
still telling you something true: this nozzle lives at the edge, and the
transient is where it bites. [J] Treat Eq. 3.14 as a way to compare mechanisms
and bracket magnitudes, not as a load specification — a real side-load
prediction needs unsteady CFD validated against subscale cold flow, which is
exactly what `[Ostlund02]` is about.

### 5.4 RL10B-2: what the extendable extension is worth

**The question.** The RL10B-2 deploys a carbon–carbon extension that takes it
from $\varepsilon = 77$ retracted to $\varepsilon = 285$ deployed
[_verify-liquid, RL10B-2 block]. How many seconds of $I_{sp}$ is that?

**Step 1 — note what we do not need to know.** The RL10B-2's chamber pressure
is **not reliably published**; the reference file gives ~44 bar from a
secondary source and explicitly says not to print it as fact. This would be
fatal for most performance questions. It is not fatal here, because of §3.5:
**vacuum $C_F$ depends only on $\gamma$ and $\varepsilon$.** Set $p_a = 0$ and
$p_c$ cancels out of the ratio entirely. Verify it numerically at the end.

**Step 2 — vacuum thrust coefficients.** With $\gamma = 1.20$
(LOX/LH2, frozen; see Step 5 for the sensitivity):

| $\varepsilon$ | $M_e$ | $p_e/p_c$ | $C_{F,vac}$ |
|---|---|---|---|
| 77 | 4.7020 | $9.12\times10^{-4}$ | 1.9345 |
| 85 | 4.7729 | $8.06\times10^{-4}$ | 1.9413 |
| 285 | 5.6696 | $1.784\times10^{-4}$ | 2.0129 |

**Step 3 — the ratio, and the $I_{sp}$ gain.** Anchor on the published
$I_{sp,vac} = 465.5$ s at $\varepsilon = 285$ — the highest of any flown
chemical engine — rather than trying to predict it, since Module 03 WE3 showed
a single-$\gamma$ model reproduces hydrogen $I_{sp}$ only by cancelling errors.

$$I_{sp}(\varepsilon_1) = I_{sp}(285)\,\frac{C_{F,vac}(\varepsilon_1)}{C_{F,vac}(285)}$$

$$I_{sp}(77) = 465.5\times\frac{1.9345}{2.0129} = 447.4\ \mathrm{s}
\quad\Rightarrow\quad \boxed{\Delta I_{sp} = +18.1\ \mathrm{s}}$$

$$I_{sp}(85) = 465.5\times\frac{1.9413}{2.0129} = 448.9\ \mathrm{s}
\quad\Rightarrow\quad \boxed{\Delta I_{sp} = +16.6\ \mathrm{s}}$$

(The 85:1 case is included because some secondary tables quote a retracted
ratio in the low 80s rather than the 77 the SEP/AIAA nozzle literature gives;
the answer moves by 1.5 s, which is smaller than the disagreement between
sources.)

**Step 4 — geometric cross-check.** The extension's published exit diameter is
just over 2.1 m [_verify-liquid]. At $\varepsilon = 285$ that implies
$$A_e = \pi(1.05)^2 = 3.464\ \mathrm{m^2},\qquad A_t = \frac{3.464}{285} = 0.012153\ \mathrm{m^2},
\qquad D_t = 124.4\ \mathrm{mm}$$
and a 15° cone to that area ratio would be
$L = [r_t(\sqrt{285}-1) + 1.5r_t(\sec15°-1)]/\tan 15° = 3.70$ m, of which an
80 % bell would be **2.96 m** — against a published extension length of ~2.5 m
sitting downstream of the fixed section. The numbers close. A 124 mm throat
passing 110.1 kN of thrust is also consistent: $C_{F,vac} = 2.013$ implies
$p_c = F/(C_F A_t) = 110\,100/(2.013\times0.012153) = 45.0$ bar, which lands on
top of the ~44 bar the reference file flags as low-confidence. **That is a
useful outcome: the geometry and thrust are self-consistent with ~45 bar, which
is corroboration, not a source.** Do not promote it to a published figure.

**Step 5 — sensitivity, honestly.** The one real weakness is $\gamma$:

| $\gamma$ | $\Delta I_{sp}$, 77 → 285 | $\Delta I_{sp}$, 85 → 285 |
|---|---|---|
| 1.14 | +23.2 s | +21.3 s |
| 1.18 | +19.7 s | +18.0 s |
| **1.20** | **+18.1 s** | **+16.6 s** |
| 1.25 | +14.7 s | +13.3 s |

**Step 6 — compare with the published record, and disagree with it.** The
reference file's RL10B-2 block states the extension "is worth ~30 s of Isp".
The gas dynamics does not support that at any plausible $\gamma$. The
manufacturer's own family table is the better check: RL10A-4-2 at 451.0 s
versus RL10B-2 at 465.5 s is a **14.5 s** step, and the nozzle is the dominant
difference between them [_verify-liquid, RL10C-1 block, L3Harris table].
**14.5 s measured, 16.6–18.1 s computed, "~30 s" asserted.** The first two
agree within the model's error; the third is an unsourced round number that has
propagated. [J] Quote 15–18 s.

**Sanity check — is 17 s worth a deployment mechanism?** Put it against the
mass it costs. The extension is a large share of a 301 kg engine, and Vinci's
nozzle is ~70 % of its engine mass [_verify-liquid], so call the extension plus
its mechanism 150 kg. Take an upper stage with 20,000 kg of propellant and
5,000 kg burnout mass including the deployed nozzle:

- **Deployed, $\varepsilon = 285$, $I_{sp} = 465.5$ s:**
  $\Delta v = 465.5\times9.80665\times\ln(25\,000/5\,000) = 7\,347$ m/s.
- **Fixed short nozzle, $\varepsilon = 77$, $I_{sp} = 448.9$ s, and 150 kg
  lighter:** $\Delta v = 448.9\times9.80665\times\ln(24\,850/4\,850) =
  7\,193$ m/s.

The extension wins by **154 m/s** even after paying for itself in mass — and it
wins by more on a stage with a higher mass ratio, which is where high-$\varepsilon$
upper stages live. That is why programmes accept a single-point-failure
mechanism with no abort mode.

---

## 6. Real engines: why did they design it that way?

### 6.1 Rocketdyne F-1 — $\varepsilon = 16$ on the largest engine ever flown [H]

**The choice.** A bell nozzle at $\varepsilon = 16$ including the nozzle
extension, with $p_c \approx 70$ bar (1,015 psia injector-end; the figure is
contested across 965–1,125 psia, contested item 1), giving 263 s SL / 304 s
vacuum and 6,770 kN / 7,770 kN [_verify-liquid, F-1 block].

**Why 16 and not more.** Three constraints, all binding at once:

1. **Separation.** At $p_c = 70$ bar and $\varepsilon = 16$, $p_e/p_a$ at
   lift-off is roughly 0.5 — comfortably attached by both criteria. Pushing to
   $\varepsilon = 25$ would have taken $p_e/p_a$ to about 0.28, into the region
   where §5.2 shows the criteria stop agreeing. In 1962, with no CFD and a
   nozzle 3.7 m across, that was not a risk anyone was going to take on the
   engine that had to work five times simultaneously.
2. **Base area.** Five F-1s in a 10 m stage base. The exit diameter is set by
   packaging as much as by aerodynamics, and enlarging it means either a bigger
   stage or engines that cannot be gimballed without colliding.
3. **The trajectory.** The S-IC staged at about 67 km but burned only 165 s,
   most of it at low altitude, and it is the stage whose $I_{sp}$ is worth the
   least in payload terms. Vacuum $I_{sp}$ was not what the F-1 was for.

**The alternatives available in 1962.** A longer bell (rejected on 1 and 2); a
conical nozzle (rejected — the bell was already standard practice after
`[Rao58]`); a higher $p_c$ to allow more $\varepsilon$ at the same $p_e$ (this
is the interesting one, and it was rejected because 70 bar was already
described as an "unprecedented chamber pressure" for the injector and cooling
technology of the day, and because pushing $p_c$ makes the combustion-stability
problem — which cost 2,000 tests and 210 injector designs — worse).

**Would a modern engineer choose the same?** [J] Yes on $\varepsilon$, no on
almost everything else. $\varepsilon = 16$ at 70 bar is still the right answer
for a sea-level kerolox booster; Merlin 1D picked exactly 16 fifty years later
at 97 bar. What a modern engineer would change is the *construction*: 178
brazed tubes and a separate GG-exhaust film-cooled extension would today be a
milled-channel or additively-manufactured wall, and the F-1's own limitation
statement — "$\varepsilon = 16$ and $p_c \approx 70$ bar are modest; the F-1 is
a *big* engine, not an efficient one" — is the reference file's own verdict and
it is fair.

### 6.2 RS-25 — $\varepsilon = 69$ or 77.5, and why the disagreement is the lesson [H]/[M]

**The dispute.** Three numbers circulate for the same nozzle
[_verify-liquid, contested item 2]:

| value | source |
|---|---|
| **69:1** | **L3Harris (manufacturer) datasheet, labelled "area ratio"**; Wikipedia infobox |
| 77.5:1 | NASA/Rocketdyne SSME training material; most of the nozzle-flow literature |
| 78:1 | Wikipedia body text |

**Use both, and here is what changes.** Module 03 WE3 worked the performance
side: at $\gamma = 1.19$, $\varepsilon = 69$ gives $C_{F,vac} = 1.9393$ and a
reconstructed 455.4 s; $\varepsilon = 77.5$ gives 1.9479 and 457.4 s. A **12 %
change in area ratio moves $I_{sp}$ by 0.44 %** — inside the model's own error
against the published 452.3 s. §5.3 showed the side-load estimate moves by
under 10 %. **No performance or loads measurement can distinguish them.**

What *does* distinguish them is geometry, and this is where §3.3 pays off. For
a fixed 2.4 m exit diameter, the two area ratios imply

$$D_t = \sqrt{\frac{4A_e}{\pi\varepsilon}}:\qquad
\varepsilon = 77.5 \Rightarrow D_t = 272.6\ \mathrm{mm};\qquad
\varepsilon = 69 \Rightarrow D_t = 288.9\ \mathrm{mm}$$

a **6 % difference in throat diameter**. A tape measure across the throat
settles in thirty seconds what sixty years of secondary sources have not.

**The most plausible explanation, and why it matters generally.** §3.3
established that "throat area" is at least three quantities: geometric minimum
area, effective sonic area $C_d A_t$, and whatever a given analysis used. A
$C_d$ of 0.99 is a 1 % area difference — not 12 %. So $C_d$ alone does not
explain it. The likelier story is that 69 is the *geometric* exit-to-throat
ratio of the bell as built, while the ~77.5 figures come from an analysis using
a different reference station (for instance, the area ratio of the
aerodynamic contour excluding a chamber-side reference, or a value carried over
from a design iteration). The reference file's recommendation, which this
course follows, is: **print 69:1 as the geometric area ratio citing L3Harris,
note that ~77.5:1 is widely quoted, and do not silently pick one.**

**The general lesson, which is the reason this engine is in this module.**
"Expansion ratio" is not a single unambiguous quantity, and a table of engine
data that prints one value per engine to three significant figures is teaching
students something false. When you read $\varepsilon$ off a datasheet, ask:
exit area over *which* throat area, measured where, at what temperature (a
hydrogen-cooled throat is not the same diameter hot as cold), and by whom.

**Would a modern engineer choose 69?** [J] For a sustainer that burns 8.5
minutes and is ideally expanded at 12 km, yes — the ambient penalty is paid for
about a minute and the vacuum gain for seven. What they would do differently is
the *contour and the transient*: the RS-25's thrust-optimised contour is exactly
the class that produces restricted shock separation and the start-transient side
loads that drove nozzle stiffening. A modern design would trade a few tenths of
a per cent of $C_F$ for a contour with a weaker internal shock, precisely
because §5.3 shows the topology, not the contour's steady efficiency, is what
sizes the structure.

### 6.3 Merlin 1D Vacuum — a niobium skirt instead of a cooled nozzle [M]

**The choice.** MVac takes the same 97 bar gas-generator engine from
$\varepsilon = 16$ to $\varepsilon = 165$ by bolting on a **radiatively cooled
niobium-alloy extension**, reaching 348 s vacuum — the highest of any American
hydrocarbon engine flown [_verify-liquid, Merlin block]. The skirt glows
cherry-red in flight.

**The alternatives.** (a) Extend the regenerative circuit — impossible: the
RP-1 coolant flow and pressure budget will not push through five times the
channel length, and RP-1 cokes above roughly 700 K, so you cannot simply run it
hotter. (b) Ablative — heavy, and the MVac has to restart and burn for hundreds
of seconds. (c) Carbon–carbon — lighter and better, but expensive, long lead
time, and requiring oxidation protection. (d) Radiatively cooled niobium —
heavier than C–C, but cheap, formable, weldable, repeatable, and with a mature
supply chain.

**Why (d) won.** SpaceX's binding constraint is production rate and unit cost,
not $I_{sp}$; the whole Merlin is a gas-generator engine at 97 bar precisely
because it is optimised for cost, restart and reuse. At $\varepsilon = 165$ and
a kerolox flame temperature the far nozzle heat flux is low enough for
radiative equilibrium at a coated-niobium wall temperature, so the expensive
option buys nothing the mission needs.

**Would a modern engineer choose the same?** [J] Yes for an expendable upper
stage flown at high cadence. For a reusable upper stage, no: the coated-niobium
skirt's life limit is the silicide coating, which does not survive many
re-entries, and carbon–carbon or an actively cooled design becomes the argument
again.

### 6.4 RL10B-2 — the extendable carbon–carbon nozzle [M]

**The choice.** Fly with $\varepsilon = 77$ stowed and translate a 2.5 m 3D
carbon–carbon extension into place after stage separation, reaching
$\varepsilon = 285$ and 465.5 s — the flown $I_{sp}$ record
[_verify-liquid, RL10B-2 block].

**The constraint that produced it.** Not aerodynamics — packaging. A fixed
285:1 nozzle on a 110 kN engine is 2.1 m in diameter and around 3 m long
(§5.4 Step 4). The Delta III second stage's interstage would not hold it. The
choice was therefore between a fixed ~130:1 nozzle (which is what the RL10C-1
does, at 449.7 s) and a mechanism.

**What it costs.** §5.4: about 17 s of $I_{sp}$ gained, worth ~150 m/s on a
representative stage even after the mass. Against that: a deployment mechanism
that must work exactly once, in vacuum, after launch vibration and thermal
cycling, with **no abort mode** — the reference file names this as the engine's
major limitation, and it is right to. The RL10C-1 exists partly because
consolidating onto a fixed 130:1 nozzle removes that mechanism and one whole
production line, at a cost of ~16 s.

**Would a modern engineer choose the same?** [J] It depends entirely on whether
the interstage is already fixed. For a clean-sheet stage, size the interstage
for the nozzle and skip the mechanism. For an existing vehicle where the
interstage is tooled — which is the normal situation, and the failure described
in this module's opening paragraph — the extendable nozzle is the only way to
buy the $I_{sp}$, and that is why both the RL10B-2 and Vinci have one.

### 6.5 Raptor Vacuum — claims, and how to read them [M]

**What is claimed.** SpaceX quotes Raptor sea-level variants at $\varepsilon
\approx 34.3$ and a vacuum variant at $\varepsilon \approx 80$, with $p_c$ of
300 bar (Raptor 2) to 330 bar (Raptor 3) and $I_{sp}$ around 347–350 s SL
[_verify-liquid, Raptor block]. **Every one of those figures is a company
claim.** Independent corroboration exists only for thrust, and only indirectly
through FAA licensing documents and third-party telemetry analysis; there is no
independent verification of chamber pressure, $I_{sp}$, dry mass or T/W at all,
and several figures trace to social-media posts rather than any document.

**What the nozzle numbers imply, if true.** At $\gamma \approx 1.16$ (methalox)
and $\varepsilon = 34.3$, the exit Mach number is 3.926 and $p_e/p_c =
2.956\times10^{-3}$. At the claimed $p_c = 300$ bar that gives
$$p_e = 88.7\ \mathrm{kPa},\qquad \frac{p_e}{p_a} = 0.875$$
against a Schmucker separation pressure of 30.9 kPa — **a separation margin of
nearly a factor of three**, more comfortable than the F-1's at
$\varepsilon = 16$. A 34:1 sea-level nozzle is aerodynamically unremarkable
*provided* the chamber pressure is what is claimed.

**The high chamber pressure is what buys the high area ratio**, and that is the
general rule worth carrying away:
$$\frac{p_e}{p_a} = \frac{p_e}{p_c}\cdot\frac{p_c}{p_a}$$
The first factor is fixed by $\varepsilon$ and $\gamma$; the second is the
engine's chamber pressure over ambient. Tripling $p_c$ therefore triples the
separation margin at fixed $\varepsilon$, which is what lets a 300 bar engine
carry roughly twice the area ratio of a 100 bar engine at the same margin. That
conclusion does not depend on believing any specific Raptor number — it depends
only on the claim being *self-consistent*, which it is.

**What to say in an interview.** [J] "Raptor's sea-level area ratio of about 34
is unusually high for a booster engine, and the reason is the claimed 300 bar
chamber pressure: separation margin scales with $p_c/p_a$, so a
staged-combustion engine at 300 bar can carry twice the area ratio of a
gas-generator engine at 100 bar at the same $p_e/p_a$. I would want to see an
independent measurement of that chamber pressure before quoting the $I_{sp}$,
because the published figures are unaudited company statements." That answer
demonstrates the physics *and* the epistemic hygiene, and the second half is
what separates a good candidate from a fluent one.

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 The trade-offs as they are actually argued

| decision | argued between | what settles it |
|---|---|---|
| $\varepsilon$ | performance (trajectory office) vs structures (side loads) vs vehicle layout (base area) | usually **base area or interstage diameter**, which is a geometric fact nobody can argue with |
| percentage bell length | $I_{sp}$ vs mass vs cooling pressure drop | on a regen booster, the **coolant $\Delta p$ budget**; on a vacuum stage, mass |
| contour type (TOC vs truncated ideal) | steady $C_F$ vs start-transient side loads | subscale cold-flow test results |
| construction | performance/mass vs unit cost vs production rate | **production rate**, increasingly — Vulcain 2.1 accepted slightly lower thrust for 90 % fewer parts |
| where the regen circuit ends | coolant enthalpy budget vs skirt material cost | the coolant outlet temperature limit (RP-1 coking, hydrogen turbine inlet requirement) |
| fixed vs extendable | $I_{sp}$ vs a single-point-failure mechanism | whether the interstage is already tooled |

### 7.2 Failure modes

**Flow separation and side loads.** *Mechanism:* boundary layer separates under
the adverse gradient of an overexpanded plume; asymmetric or transitioning
separation produces a lateral force (§3.12, §5.3). *Symptom:* lateral
acceleration spikes during start and shutdown; nozzle shell strain; gimbal
actuator load spikes; in the worst case, buckling of the exit cone or failure
of the nozzle-to-chamber joint. *Evidence:* strain gauges around the nozzle
circumference, accelerometers on the gimbal block, wall static taps whose
pressure traces show the separation plateau sweeping downstream. *Fix:* start
sequencing, stiffening rings, contour change, or truncation.

**Coolant channel or tube burnout.** *Mechanism:* local loss of coolant flow (a
blocked tube, a braze void, a channel closed out by weld penetration) or a
local heat-flux spike (an injector streak impinging on the wall, Module 07).
*Symptom:* a hole, usually in the throat region, usually axially aligned with a
single injector element. *Evidence:* post-test borescope; a wall thermocouple
running hot in one circumferential position; a coolant outlet temperature
higher than predicted. *Fix:* injector rework, film-cooling addition, channel
geometry change — the nozzle is usually the victim, not the culprit.

**Braze joint failure in a tube-wall nozzle.** *Mechanism:* a void or an
incomplete fillet in one of hundreds of braze joints, opened by thermal
cycling. *Symptom:* a coolant leak into the exhaust, which on a hydrogen engine
is a fire and on a kerosene engine is a plume brightness change. *Evidence:*
proof and leak test before every acceptance; helium mass-spectrometer leak
check. *Fix:* this is a manufacturing problem, and it is a large part of why
tube-wall is being replaced (§3.14).

**Refractory-metal skirt coating breach.** *Mechanism:* handling damage or
thermal cycling cracks the silicide coating on a niobium extension; the exposed
niobium oxidises rapidly. *Symptom:* localised burn-through of a radiatively
cooled skirt on a subsequent firing. *Evidence:* visual and dye-penetrant
inspection; the failure is progressive and visible. *Fix:* handling procedures
and re-coat; this is why coated skirts ship in dedicated fixtures.

**Ablative liner over-recession.** *Mechanism:* char recession faster than
predicted, usually because the duty cycle exceeded the design (LMDE's forbidden
60–100 % throttle band is exactly this, and the reference file is explicit that
it was a *nozzle erosion* limit). *Symptom:* throat area growth and therefore
chamber pressure decay; in the extreme, bond-line temperature exceeded and
structural failure. *Evidence:* $p_c$ trace sag at constant commanded flow;
post-test throat measurement. *Fix:* thicker liner, duty-cycle restriction, or
a different cooling architecture.

**Deployment failure of an extendable nozzle.** *Mechanism:* mechanism jam from
thermal distortion, contamination, or launch loads. *Symptom:* the stage flies
at the retracted area ratio, losing ~17 s of $I_{sp}$ (§5.4) — usually mission
loss for a performance-marginal injection. *Evidence:* deployment
microswitches; the $I_{sp}$ shortfall is visible in the burn duration. *Fix:*
there is none in flight; this is a qualification-by-test problem.

### 7.3 Materials — why these, in one line each

- **Nickel-alloy tubing (Inconel X-750, Hastelloy)** — formable into tapered
  tubes, brazeable, strong hot, and compatible with both RP-1 and hydrogen.
- **NARloy-Z (Cu–Ag–Zr)** — very high thermal conductivity so the gas-side wall
  runs cool at high flux; used for the *chamber* liner, not the nozzle, because
  its strength at temperature does not justify the mass over a long nozzle.
- **Electroformed nickel** — a closeout that bonds metallurgically to a milled
  copper liner with no braze alloy and no joint, at the cost of a very slow
  deposition process.
- **Niobium alloy C-103 (Nb–10Hf–1Ti)** with silicide coating — the standard
  radiatively cooled skirt material: formable, weldable, good to ~1,300–1,600 K,
  and utterly dependent on its coating.
- **3D carbon–carbon (NOVOLTEX/SEPCARB class)** — strength rises with
  temperature, density ~1.8 g/cm³, radiates well; brittle, expensive, weeks of
  densification, and needs oxidation protection outside vacuum.
- **Silica- and carbon-phenolic ablatives** — no coolant circuit required at
  all, which is decisive for pressure-fed engines; single-use and heavy.

### 7.4 Manufacturing, and what it limits

**Tube-wall** limits you to a production rate set by how fast skilled people
can form, fit and braze hundreds of tubes per engine, with every joint an
inspection item. It gives the lightest regen wall and the worst unit cost.

**Milled channel** limits you by machining time on the liner and by the
closeout process — electroforming is slow, brazing needs a furnace cycle,
laser-welded sandwich construction is fast and is what Vulcain 2.1 moved to for
its 40 % cost reduction.

**Additive manufacturing** is changing this fastest at the chamber and
injector; for large nozzles the constraint is build volume, and the current
practice is directed-energy-deposition of the jacket over a machined liner
rather than printing the whole nozzle `[GradlAM]`, `[RAMPT]`.

**Carbon–carbon** limits you by densification time (weeks per part) and by the
fact that a 2.1 m diameter 3D preform is a specialist product from a very small
number of suppliers worldwide.

**Contour tolerance.** The contour must be held to a fraction of a per cent in
area, because $\varepsilon$ error propagates directly into $C_F$. In practice
the throat is the tight tolerance — a 0.5 % throat area error is a 0.5 % thrust
error at fixed $p_c$ — and the exit is comparatively loose because $C_F$ is
flat there.

### 7.5 Testing — what is measured and what a bad result looks like

- **Cold-flow subscale.** A scale model of the exact contour blown with air or
  nitrogen, with wall static taps and (usually) schlieren. What you are looking
  for is the wall-pressure plateau that marks separation and, crucially, the
  NPR at which the pattern flips FSS↔RSS. **This is the only way to find the
  RSS transition before hot fire**, and skipping it is how programmes discover
  side loads on a stand.
- **Wall static pressure taps** along the divergent on hot-fire development
  hardware. Healthy: pressure falls monotonically along the isentropic
  prediction to the exit. Separated: a sharp rise to a plateau at ~0.3–0.4
  $p_a$, with the rise station moving as $p_c$ changes. RSS: a rise *above*
  ambient downstream of reattachment — the diagnostic signature.
- **Circumferential strain gauges and nozzle accelerometers** for side loads.
  The signature of the FSS/RSS flip is a large, short, broadband lateral
  transient during start, at a level that does not recur at mainstage.
- **Throat diameter, cold, before and after.** In a liquid engine this should
  not change. If it does you have erosion, and you have a much bigger problem
  than nozzle performance.
- **$C_F$ reduction.** Measure $F$, $p_c$ and $A_t$; compute $C_F = F/(p_cA_t)$;
  compare to the ideal at the measured $\varepsilon$ and $\gamma$. Module 03 WE2
  does this. If $\eta_{C_f}$ comes out below ~0.95 on a nozzle that should be
  attached, suspect separation or a $p_c$ measurement-station error before you
  suspect the contour.

---

## 8. Misconceptions and what engineers actually care about

**"A bigger nozzle always gives more thrust."** Only in vacuum. At sea level,
Eq. 3.11 says thrust falls by $p_a A_e$, so a bigger exit *costs* thrust until
you get above the break-even altitude — 5.5 km in §5.2. The RS-27 → RS-27A
change lost 81 kN of sea-level thrust to gain 7 s of vacuum $I_{sp}$, in flight
hardware, deliberately.

**"The nozzle should be sized for optimum expansion at sea level."** Only if the
stage burns out at sea level, which nothing does. Optimum expansion at lift-off
throws away the vacuum performance of the remaining 80–90 % of the burn. Every
first stage flies overexpanded on purpose.

**"Exit pressure depends on ambient pressure."** For attached flow it does not.
$p_e$ is fixed by $\varepsilon$ and $\gamma$ (Eq. 3.5). The only mechanism by
which ambient pressure reaches inside the nozzle is separation.

**"The 15° cone angle is an optimum."** It is not an optimum of anything;
Eq. 3.6 is monotonic in $\alpha$. It is a knee in a trade between divergence
loss and length, and it has been a convention since the 1950s.

**"An 80 % bell is 80 % as long as the full-length optimum contour."** No — it
is 80 % as long as a **15° cone of the same $\varepsilon$ and $r_t$**. That is
the convention, and different books use slightly different cone references,
which shifts the number by a point or two.

**"Aerospikes are better and industry is just conservative."** The
aerodynamics is genuinely better; the thermal problem is genuinely worse. A
plug's expansion surface sits in the hottest, highest-flux part of the flow and
must be cooled over essentially all of it, which is a far larger cooled area per
unit thrust than a bell's. That is why sixty years of programmes — J-2T,
XRS-2200/X-33 — have built and fired them and none has flown.

**"Flow separation is what causes side loads."** Separation is necessary but
not sufficient. §5.3 shows that separation-line wander within free shock
separation produces ~8 kN on an RS-25-class nozzle, two orders of magnitude
below the measured loads. The loads come from the **FSS↔RSS topology
transition**, which is a property of thrust-optimised contours specifically.

**"Expansion ratio is a single well-defined number."** It is exit area divided
by *a* throat area, and there are at least three defensible throat areas
(geometric, effective/sonic, and whatever an analysis assumed). The RS-25's
69-versus-77.5 dispute (§6.2) is what this looks like in the wild.

### What engineers in this area actually spend their day on

1. **Where the regenerative circuit ends, and what the skirt is made of.** This
   is the real nozzle design decision on most programmes, and it is a coolant
   enthalpy and pressure-drop argument (Modules 10, 11), not an aerodynamic one.
2. **The exit diameter against the vehicle interface.** Base area, interstage
   diameter, gimbal clearance, plume impingement on neighbouring engines. This
   is what actually caps $\varepsilon$ far more often than separation does.
3. **The start transient.** Chamber pressure ramp rate, the NPR window where
   FSS↔RSS lives, and whether the structure survives it. This is where nozzle
   engineers and start-sequence engineers argue.
4. **The loss budget, item by item, defended to a customer.** $\lambda$,
   $\eta_f$, $\eta_{kin}$, each with a basis, because the contractual $I_{sp}$
   is the product of them and a 0.5 % argument is worth real money.
5. **Manufacturability at rate.** Braze joints per engine, machining hours per
   liner, densification weeks per carbon–carbon part. Vulcain 2.1 is the
   documented case where this drove the entire redesign.

---

## 9. Mastery levels

**Level 1 — Familiarity.**
Explain in plain language why a nozzle has a converging and a diverging
section, what expansion ratio means, and why a first-stage nozzle is smaller
than an upper-stage one. Sketch the thrust-versus-altitude trend for two
different area ratios and identify the crossover. Name a conical, a bell, an
aerospike and an extendable nozzle, and name a real engine using each of the
first, second and fourth. State that a 15° cone loses about 1.7 % to divergence
and that a bell recovers most of it in less length.

**Level 2 — Working engineering knowledge.**
Size a throat from $\dot m$ and $c^*$ and cross-check it from $F$, $p_c$ and
$C_F$. Compute conical length, divergence efficiency, 80 % bell length, and
construct a Rao parabolic contour from $\theta_n$, $\theta_e$ and the throat
arc. Quote from memory: $R_u = 1.5\,r_t$, $R_d = 0.382\,r_t$, $\beta = 20$–45°,
$\alpha = 15°$, $\varepsilon_c = 2$–3 for large engines, $\eta_n = 0.96$–0.98.
Apply Summerfield and Schmucker to a real contour and state where they
disagree. Derive the break-even altitude between two area ratios. Build a loss
budget and say which term dominates for a given engine class. Read a wall-static
-pressure trace and identify separation, and read a $C_F$ reduction and say
whether the nozzle or the chamber is underperforming.

**Level 3 — Interview mastery.**
Given an unfamiliar engine and its stage, defend an expansion ratio from the
trajectory, the separation limit and the vehicle base area, and say which of
the three is binding. Argue both sides of an extendable versus fixed nozzle for
a stated interstage. Explain FSS versus RSS from the internal shock structure,
predict which contour class is at risk, and put an order-of-magnitude number on
the resulting side load with a stated model. Diagnose a nozzle from a described
data set (wall pressures, strain gauges, a $p_c$ trace, a post-test borescope)
and distinguish separation from a coolant failure from injector streaking.
Explain why the RS-25's expansion ratio is disputed, what measurement would
settle it, and why no performance data can. Argue why aerospikes have not
flown without either dismissing them or being credulous about them.

---

## 10. Problems

### Conceptual

**C1.** A nozzle is tested in a vacuum chamber and then on a sea-level stand at
the same chamber pressure. State which of the following change and which do
not, with a one-line reason each: $\dot m$, $c^*$, $p_e$, $M_e$, $C_F$, $I_{sp}$.

**C2.** Explain why the downstream throat radius of curvature is much smaller
than the upstream one, and what would go wrong if you swapped them.

**C3.** Two engines have the same $\varepsilon$ and the same $\gamma$, but one
runs at 100 bar and one at 300 bar. Which has more separation margin at sea
level, and why? Express the answer as a scaling.

**C4.** An 80 % bell has 80 % of the length of the reference cone but 87 % of
its wetted area. Explain geometrically why the wetted area does not fall in
proportion to the length, and say when this matters more than the mass saving.

**C5.** Why is $\lambda = (1+\cos\alpha)/2$ not a valid estimate of divergence
efficiency for a bell nozzle? What would you need in order to compute
$\lambda$ for a bell properly?

**C6.** A colleague proposes raising an upper-stage engine's area ratio from
130 to 285 by adding a fixed extension. List, in order of how likely each is to
be the blocking constraint, the four things you would check first.

**C7.** Explain the physical mechanism by which restricted shock separation
produces wall pressures *above* ambient, and why that sign matters more for
side loads than the magnitude of the separation pressure itself.

**C8.** Every flown nozzle above about $\varepsilon = 100$ ends its
regenerative circuit partway down. Explain why, in terms of coolant enthalpy
and coolant pressure drop, and name two different ways the remainder is handled
with a real engine for each.

### Calculation

**P1.** A LOX/LH2 upper-stage engine delivers $F_{vac} = 180$ kN with
$c^* = 2\,290$ m/s at $p_c = 60$ bar, $\gamma = 1.20$. Compute $A_t$, $D_t$,
and then $A_e$ and $D_e$ for $\varepsilon = 240$. Compute the length of a 15°
cone to that area ratio and of an 80 % bell.

**P2.** For the engine in P1, compute $C_{F,vac}$ and $I_{sp,vac}$ assuming
$\eta_n = 0.975$. Compare with the value in the engine database for the engine
this describes and comment on the difference.

**P3.** A sea-level kerolox engine runs $p_c = 70$ bar, $\gamma = 1.20$. Find
the largest $\varepsilon$ that keeps $p_e \ge 0.4\,p_a$ at sea level
(Summerfield), and the largest that satisfies Schmucker. State the two answers
and the percentage difference between them.

**P4.** Take the $\varepsilon = 16$ contour of §5.1 and rebuild it as a 60 %
bell. Using $\theta_n = 26°$ and $\theta_e = 16°$ (typical 60 % values),
compute the inflection point, the control point, and the resulting exit wall
angle check. Comment on whether the parabola remains well-behaved.

**P5.** An engine has $p_c = 100$ bar, $\gamma = 1.20$, $A_t = 0.02$ m². Compute
the break-even altitude between $\varepsilon = 20$ and $\varepsilon = 40$, and
the thrust difference at sea level and at 30 km.

**P6.** A 2.1 m exit-diameter nozzle experiences an FSS/RSS split over an axial
band of 0.6 m at a mean radius of 0.95 m, with $p_{RSS} = 1.15\,p_a$ and
$p_{FSS} = 0.30\,p_a$. Compute the side load. If the nozzle's first bending mode
is at 35 Hz and the transient lasts 40 ms, comment on whether resonant
amplification is a concern.

**P7.** Using the engine database, tabulate $\varepsilon$, $p_c$ and $p_e$ for
the F-1, Merlin 1D, RS-25 and RS-68A ($\gamma = 1.20$ throughout). Rank them by
$p_e/p_a$ at sea level and comment on which is closest to separation.

**P8.** An ablatively cooled nozzle recesses 0.4 mm at the throat over a 500 s
burn on a throat of initial radius 60 mm. Compute the change in $A_t$,
$\varepsilon$, $p_c$ (at constant $\dot m$) and $C_{F,vac}$. Is this a liquid
engine you would accept?

### Engineering reasoning

**R1.** A development engine shows $\eta_{C_f} = 0.93$ on a nozzle predicted to
be attached, while $\eta_{c^*}$ is a healthy 0.97. Wall static taps at 60 %, 80 %
and 95 % of the divergent length read 41, 39 and 40 kPa on a sea-level stand.
Diagnose, and state what you would do next.

**R2.** Two nozzles with identical contours are built, one by a supplier using
$R_u/r_t = 1.5$ and one using $R_u/r_t = 0.6$ because of a drawing
misinterpretation. Both are measured for throat *geometric* diameter and found
identical. Predict what the hot-fire data will show and how you would confirm
the cause.

**R3.** A programme proposes replacing a tube-wall nozzle with a laser-welded
sandwich nozzle at slightly lower engine thrust, citing 90 % fewer parts. Argue
for and against from the programme's point of view, and say what information
would settle it. (Vulcain 2 → 2.1 is the real case; do not just describe it,
argue it.)

**R4.** An upper stage's interstage diameter is fixed at 2.6 m. The engine
currently flies $\varepsilon = 130$ with a fixed nozzle. Marketing wants the
$I_{sp}$ of a 285:1 engine. Lay out the options, estimate the $I_{sp}$ of each,
and make a recommendation.

**R5.** During a sea-level start of a large bell engine, circumferential strain
gauges show a 180 kN equivalent lateral transient lasting 30 ms at 22 % of full
chamber pressure, which does not recur at mainstage and does not recur at all
on the next unit. Give three candidate explanations, say how you would
discriminate between them, and state which you would bet on.

### Mini trade study

**T1.** You are choosing the nozzle for a **methalox upper-stage engine**:
$F_{vac} = 250$ kN, $p_c = 120$ bar, $\gamma = 1.16$, $c^* = 1\,850$ m/s
delivered, restartable, up to 600 s cumulative burn. The stage's interstage
inner diameter is **2.2 m** and the available axial envelope below the tank dome
is **2.4 m**. The programme flies 12 times a year and unit cost matters.

Options:

- **A.** Fixed bell, $\varepsilon = 100$, regeneratively cooled to
  $\varepsilon = 25$ then radiatively cooled C-103 skirt.
- **B.** Fixed bell, $\varepsilon = 150$, regen to 25 then carbon–carbon skirt.
- **C.** Extendable, $\varepsilon = 90$ stowed / $\varepsilon = 260$ deployed,
  carbon–carbon extension on a translating mechanism.
- **D.** Fixed bell, $\varepsilon = 60$, fully regeneratively cooled, 70 % bell.

Compute the vacuum $I_{sp}$ of each (state your $\eta_n$ and justify it),
estimate the envelope each requires, and recommend one. Justify against the
stated constraints — including the 12 flights per year — and say what single
piece of missing information would most change your answer.

---

## 11. Quiz (100 points)

**Q1 (6).** An "80 % bell" nozzle is 80 % of the length of:
(a) the full-length Rao optimum contour of the same $\varepsilon$;
(b) a 15° conical nozzle of the same $\varepsilon$ and throat radius;
(c) a 15° conical nozzle of the same exit diameter;
(d) the chamber-to-exit length of the engine.

**Q2 (6).** The standard downstream throat radius of curvature for a bell
nozzle is:
(a) $0.382\,r_t$; (b) $1.5\,r_t$; (c) $0.5\,r_e$; (d) whatever makes the
contour tangent at $\theta_e$.

**Q3 (8).** For attached flow, which of the following changes when the same
nozzle is moved from sea level to vacuum? (Select all.)
(a) $M_e$; (b) $p_e$; (c) $C_F$; (d) $\dot m$; (e) $I_{sp}$; (f) $c^*$.

**Q4 (12, calculation).** A nozzle has $\gamma = 1.20$, $\varepsilon = 36$,
$p_c = 80$ bar. Compute $M_e$, $p_e$, $C_{F,vac}$, and the sea-level $C_F$.
State whether Summerfield predicts attached flow at sea level.

**Q5 (12, calculation).** Two nozzles on the same engine ($p_c = 90$ bar,
$\gamma = 1.20$) have $\varepsilon = 12$ and $\varepsilon = 22$. Compute the
break-even ambient pressure and the corresponding altitude in the 1976 US
Standard Atmosphere.

**Q6 (10, calculation).** A 15° conical nozzle has $r_t = 80$ mm and
$\varepsilon = 40$. Compute its length, its divergence efficiency, and the
length of a 75 % bell of the same area ratio.

**Q7 (10).** Explain in three or four sentences why the divergence efficiency
of a bell nozzle cannot be obtained from $(1+\cos\theta_e)/2$, and state whether
that expression is an upper or a lower bound on the true value, with a reason.

**Q8 (12, judgment).** A vacuum engine's expansion ratio is quoted as 285:1 in
one source and 280:1 in another, and its chamber pressure is not published at
all. You are asked for the engine's vacuum $I_{sp}$ at a *third* area ratio,
77:1. Explain how much of this you can answer and how much you cannot, and why.

**Q9 (12, judgment).** A booster engine's nozzle is being lengthened from 70 %
to 85 % bell at fixed $\varepsilon$ to recover $I_{sp}$. Name three things you
would insist on re-checking before approving the change, and for each say what
result would make you reject it.

**Q10 (12).** Two large bell nozzles of the same $\varepsilon$ are tested at sea
level. Nozzle A is a truncated ideal contour; nozzle B is an aggressive
thrust-optimised contour. B measures 0.4 % higher $C_F$ at mainstage but shows
a start-transient side load four times larger. Explain the mechanism behind
both observations, and say which you would fly on a first stage and why.

---

## 12. Further reading

- `[SP-8120]` *Liquid Rocket Engine Nozzles* (NASA SP-8120, 1976). **Read this
  one first.** It is the design-practice bridge between `[Rao58]` and the
  separation literature: contour design, the loss budget item by item,
  extension design, and separation/side-load considerations, all stated as
  recommended practice with the reasons attached.
- `[Rao58]` — the variational formulation and the method-of-characteristics
  solution for the maximum-thrust contour. Read it for what was actually
  optimised (thrust at fixed length and ambient pressure) and what was assumed
  away (viscosity, chemistry).
- `[Rao60]` — the one-page note that made `[Rao58]` usable. Read it for the
  parabolic approximation and, importantly, to see how thin the original
  statement of the "$\theta_n$, $\theta_e$, percentage length" method is
  compared to how confidently later textbooks reproduce it.
- `[SB §3.4]` — Sutton & Biblarz's nozzle chapter: the divergence factor, the
  bell/cone comparison, the $\theta_n$/$\theta_e$ charts, and worked geometry.
  The best single starting point if `[SP-8120]` is too dense.
- `[HH §4.4]` — Huzel & Huang on thrust-chamber geometry: the curvature
  conventions ($R_u = 1.5r_t$, $R_d = 0.382r_t$), contraction ratios,
  convergence angles, and the drawings a design office actually works from.
- `[OMK05]` — Östlund & Muhammad-Klingmann's review. Read it before choosing a
  separation criterion for real hardware: FSS versus RSS, the transition, side
  -load mechanisms, and a critical comparison of every criterion in circulation.
- `[Ostlund02]` — the full thesis behind the review, free and open access, with
  the experimental detail on start-transient side loads that the review
  compresses. The best single document on why overexpanded nozzles shake.
- `[Schmucker73]` — the survey of separation criteria with their scatter shown
  honestly. Read it to understand *why* Summerfield and Schmucker disagree, not
  just that they do.
- `[SFS54]` — Summerfield's original criterion. Two pages; read it for the
  historical baseline and to see how little it claimed.
- `[ZH Vol. 2]` — Zucrow & Hoffman on the method of characteristics for
  axisymmetric nozzles. This is what is actually underneath `[Rao58]`; go here
  when you need to build a contour rather than read one off a chart.
- `[SP-8124]` — self-cooled (ablative, radiation-cooled, refractory) chambers
  and nozzles: the architecture of nearly every small storable engine and every
  radiatively cooled skirt.
