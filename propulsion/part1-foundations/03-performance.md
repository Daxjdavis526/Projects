# Module 03 — Rocket Performance: Thrust, c\*, C_f, I_sp
Part I · Prerequisites: modules 01, 02 · Estimated time: 7 h

An engine either makes the thrust on the datasheet or it does not, and when it
does not, somebody has to say *why* by Friday. The whole apparatus in this
module exists to answer that question. Thrust is a single number that hides two
independent failures: the chamber can fail to convert chemical energy into hot
gas (a c\* problem — bad mixing, bad atomisation, wrong mixture ratio, a
plugged injector element), or the nozzle can fail to convert hot gas into
directed momentum (a C_f problem — separation, erosion, a leak, a bad contour).
These have completely different fixes, cost completely different amounts of
money, and live in different engineers' inboxes. If you only measure thrust you
cannot tell them apart. If you measure chamber pressure, throat area, mass flow
and thrust, you can — and that is exactly why every test stand in the world
measures those four things. This module builds the algebra that turns those
four measurements into a verdict, and then runs it backwards to size an engine
from a requirement.

---

## 1. Learning objectives

By the end of this module you should be able to:

1. Derive the thrust equation $F = \dot m u_e + (p_e - p_a)A_e$ from a momentum
   balance on a control volume, and say precisely where the pressure-thrust
   term comes from and what it is *not*.
2. Prove that thrust is maximised at $p_e = p_a$ for a fixed chamber and
   ambient pressure, and state what that proof assumes.
3. Convert freely between thrust, effective exhaust velocity $c$, and specific
   impulse in both the seconds convention and the N·s/kg convention, without
   ever wondering which $g_0$ to use.
4. Derive $c^* = \sqrt{RT_0}/\Gamma(\gamma)$ from the choked-throat mass-flow
   relation, and compute $\Gamma(\gamma)$ for any $\gamma$.
5. Derive the thrust coefficient $C_f$ and use $F = C_f p_c A_t$,
   $\dot m = p_c A_t / c^*$, and $I_{sp} = c^* C_f / g_0$ as a working set.
6. Sketch $C_f$ against expansion ratio $\varepsilon$ for several nozzle
   pressure ratios, locate the optimum, and mark the flow-separation limit.
7. Size a thrust chamber end to end: thrust → $p_c$ → $c^*$ → $\dot m$ → $A_t$
   → $\varepsilon$ → $A_e$ → chamber volume from $L^*$ and contraction ratio.
8. Reduce hot-fire data to $\eta_{c^*}$ and $\eta_{C_f}$, and name which
   physical loss each one contains.
9. Estimate the divergence loss $\lambda = (1+\cos\alpha)/2$ and place it
   correctly in the loss budget alongside kinetic, two-phase, boundary-layer
   and finite-rate losses.
10. Read a published engine datasheet ($p_c$, $\varepsilon$, $I_{sp}$) and back
    out the $c^*$ the engine must be achieving — then judge whether the
    datasheet is self-consistent.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| thrust | $F$ | N | axial reaction force on the vehicle from the engine |
| vacuum thrust | $F_{vac}$ | N | thrust with $p_a = 0$ |
| mass flow rate | $\dot m$ | kg/s | total propellant flow through the throat |
| chamber (stagnation) pressure | $p_c$, $p_0$ | Pa | stagnation pressure of the combustion gas; injector-end unless stated |
| chamber (stagnation) temperature | $T_c$, $T_0$ | K | adiabatic flame temperature at $p_c$ and the design mixture ratio |
| ambient pressure | $p_a$ | Pa | static pressure of the atmosphere at the nozzle exit plane |
| nozzle exit static pressure | $p_e$ | Pa | static pressure of the exhaust at the exit plane |
| exit velocity | $u_e$ | m/s | mass-averaged axial exhaust velocity at the exit plane |
| effective exhaust velocity | $c$ | m/s | $F/\dot m$; includes the pressure-thrust term |
| specific impulse | $I_{sp}$ | s | $F/(\dot m g_0) = c/g_0$ |
| specific impulse (mass basis) | $I_{sp,m}$ | N·s/kg = m/s | $F/\dot m = c$; numerically the effective exhaust velocity |
| characteristic velocity | $c^*$ | m/s | $p_c A_t/\dot m$; the chamber/propellant figure of merit |
| thrust coefficient | $C_f$ | — | $F/(p_c A_t)$; the nozzle figure of merit |
| throat area | $A_t$ | m² | minimum (sonic) cross-sectional area |
| exit area | $A_e$ | m² | nozzle exit-plane area |
| expansion (area) ratio | $\varepsilon$ | — | $A_e/A_t$ |
| contraction ratio | $\varepsilon_c$ | — | $A_c/A_t$, chamber cross-section over throat |
| nozzle pressure ratio | NPR | — | $p_c/p_a$ (sometimes $p_c/p_e$ — always say which) |
| ratio of specific heats | $\gamma$ | — | $c_p/c_v$ of the combustion gas |
| specific gas constant | $R$ | J/(kg·K) | $R_u/\mathcal{M}$ |
| molar mass | $\mathcal{M}$ | kg/kmol | mass-averaged molar mass of the combustion products |
| gamma function | $\Gamma(\gamma)$ | — | $\sqrt{\gamma}\,\bigl(\tfrac{2}{\gamma+1}\bigr)^{\frac{\gamma+1}{2(\gamma-1)}}$ |
| characteristic length | $L^*$ | m | $V_c/A_t$, an empirical residence-time proxy |
| chamber volume | $V_c$ | m³ | injector face to throat plane, including the convergent section |
| gas residence time | $t_s$ | s | mean time a gas parcel spends in the chamber |
| divergence (angle) loss | $\lambda$ | — | axial-momentum fraction of a divergent exit flow |
| c\* efficiency | $\eta_{c^*}$ | — | $c^*_{meas}/c^*_{ideal}$ |
| C_f efficiency | $\eta_{C_f}$ | — | $C_{f,meas}/C_{f,ideal}$ |
| overall (I_sp) efficiency | $\eta_{ov}$ | — | $\eta_{c^*}\eta_{C_f}$ |
| half-angle of a conical nozzle | $\alpha$ | rad or ° | half-angle of the divergent cone |
| mixture ratio | $MR$, $O/F$ | — | oxidiser mass flow / fuel mass flow |
| standard gravity | $g_0$ | m/s² | 9.80665, a **defined constant**, not a local gravity |

---

## 3. Theory

### 3.1 The control volume, and where thrust actually comes from

A rocket engine bolted to a test stand does not push against anything. It is
worth being blunt about this because the misconception survives into
adulthood: there is no air to push against, and the F-1 works better in vacuum
than at sea level. Thrust is the reaction to throwing mass overboard, plus a
pressure imbalance on the hardware. Both terms fall out of one momentum
balance, so let us do the balance properly rather than quoting the result.

Draw a control volume that encloses the entire engine: it wraps the outside of
the chamber and nozzle, cuts across the propellant feed lines upstream, and
cuts across the nozzle exit plane. Everywhere on this surface except the exit
plane and the feed-line cuts, the surface sits in ambient fluid at pressure
$p_a$. Steady flow, no body forces along the axis, and the engine is held by a
restraint that exerts an axial force $F$ on the control volume contents.

The steady integral momentum equation in the axial direction $x$ is

$$
\sum F_x \;=\; \oint_{CS} \rho\, u_x \,(\mathbf{u}\cdot \mathbf{\hat n})\, dA
$$

> **Eq. 3.1** — variables: $\rho$ gas density [kg/m³], $u_x$ axial velocity
> [m/s], $\mathbf{\hat n}$ outward unit normal, $dA$ area element [m²].
> Meaning: the net axial force on the control volume equals the net rate at
> which axial momentum leaves it. Assumes: steady state, a fixed
> (non-accelerating) control volume, negligible axial body force. Fails when
> the engine is starting, shutting down, or throttling fast enough that the
> chamber gas mass is changing appreciably — during a start transient the
> unsteady term $\partial/\partial t \int \rho u_x\, dV$ is not small, which is
> exactly why start-transient thrust traces overshoot and ring. [F]

The only outflow is at the exit plane, where the mass-averaged axial velocity
is $u_e$ and the mass flux is $\dot m$. Propellant enters through the feed
lines at essentially zero axial velocity relative to the engine (a few m/s
against a few km/s; the error is under 0.1 %), so the right-hand side is
$\dot m u_e$.

The forces are the restraint force plus the integral of pressure over the
control surface. The pressure integral is where the interesting term hides.
Over the exit plane the gas pushes out at static pressure $p_e$; over every
other part of the closed surface the ambient pushes in at $p_a$. Write the
ambient contribution as an integral of a *uniform* $p_a$ over the whole closed
surface — which is identically zero, because a uniform pressure over a closed
surface exerts no net force — and then subtract the part of that uniform
integral that we placed over the exit plane, since the exit plane is not
actually at $p_a$ but at $p_e$. That bookkeeping gives, for the axial
direction,

$$
F \;=\; \dot m\, u_e \;+\; (p_e - p_a)\,A_e
$$

> **Eq. 3.2 — the thrust equation** — variables: $F$ thrust [N], $\dot m$ mass
> flow [kg/s], $u_e$ mass-averaged axial exit velocity [m/s], $p_e$ exit static
> pressure [Pa], $p_a$ ambient static pressure [Pa], $A_e$ exit area [m²].
> Meaning: thrust is momentum flux out of the nozzle plus the pressure
> imbalance on the exit plane. Assumes: steady flow; one-dimensional, uniform
> exit conditions; propellant enters with negligible axial momentum; the entire
> external surface sees the same $p_a$. Fails when the exit profile is strongly
> non-uniform (short bells, plug nozzles), when the flow has separated inside
> the nozzle so that "$A_e$" is not the flowing area, and in a base-flow
> environment where recirculating exhaust makes the pressure on the outside of
> the nozzle differ from free-stream ambient. [F] [SB §2.1] [HP §11.2]

**Read the second term carefully.** $(p_e - p_a)A_e$ is *not* "the exhaust
pushing on the air". It is the residue of an internal pressure integral over
the engine's own wetted surfaces. If you re-derive the same result with a
control volume drawn *inside* the metal — integrating $p\,dA$ over the injector
face, the chamber wall, the convergent contour and the divergent contour — you
get exactly the same number, with no exit plane appearing anywhere. The two
derivations are different bookkeeping of the same physics. The exit-plane form
is used because $p_e$, $A_e$ and $u_e$ are easy to compute from one-dimensional
gas dynamics, while integrating pressure over a bell contour requires the
contour.

**Why pressure thrust exists at all.** A converging–diverging nozzle can only
expand the flow so far before the hardware runs out. If the nozzle stopped at
the throat, the exit pressure would be $0.564\,p_c$ for $\gamma = 1.2$ — an
enormous unrecovered pressure, and all that energy leaves as thermal and
pressure energy rather than as directed kinetic energy. Every metre of bell you
add converts more of it. But you can never add enough: reaching $p_e = 0$
requires $\varepsilon = \infty$. So the exhaust always leaves with some
residual static pressure, and if the outside world is at lower pressure than
that residual, there is a net outward push on the exit-plane control surface,
which shows up as extra thrust. Conversely if the outside world is at higher
pressure — an over-expanded nozzle at sea level — the term is negative and the
atmosphere is taking thrust away from you.

### 3.2 Optimum expansion

Fix the chamber ($p_c$, $T_c$, propellants, $A_t$) and fix the ambient $p_a$.
Now ask what expansion ratio maximises thrust. Consider adding a differential
ring of nozzle area $dA_e$ at the exit. Two things happen. The flow expands a
little further, so $u_e$ rises and the momentum term gains. And the exit
pressure falls, so the pressure term changes.

The momentum equation for the steady, inviscid, one-dimensional flow inside the
nozzle gives, for the incremental gain in momentum thrust from expanding
across the new ring, $\dot m\, du_e = -A\,dp$ (from $\rho u\,du = -dp$ and
$\dot m = \rho u A$). The incremental change in the pressure term is
$d[(p_e - p_a)A_e] = A_e\,dp_e + (p_e - p_a)\,dA_e$. Adding them at the exit
station ($A = A_e$) the $A_e\,dp_e$ terms cancel exactly, leaving

$$
\frac{dF}{dA_e} \;=\; p_e - p_a
$$

> **Eq. 3.3** — variables: as above. Meaning: the marginal thrust from the last
> ring of nozzle wall is the pressure difference acting on it. Assumes: steady,
> inviscid, isentropic, attached, one-dimensional flow; fixed $p_c$ and
> $\dot m$; massless nozzle extension. Fails when adding area causes separation
> (then $dF/dA_e$ is not merely negative, it is discontinuous), and it ignores
> the mass of the added structure, which for a real vehicle is the term that
> actually decides the answer. [F] [SB §3.3]

So thrust increases with $\varepsilon$ while $p_e > p_a$, is stationary at
$p_e = p_a$, and *decreases* while $p_e < p_a$. **Optimum expansion is
$p_e = p_a$.** Note what is being maximised: thrust at one ambient pressure,
for a given chamber, ignoring nozzle mass. That is three assumptions, and real
vehicles violate all three.

- A first stage flies through a hundredfold change in $p_a$, so there is no
  single optimum. The usual answer is to optimise for a trajectory-averaged
  back-pressure, which lands you somewhere over-expanded at lift-off and
  under-expanded above ~10 km. [J]
- The mass of the bell is real. Past some $\varepsilon$ the extra kilograms of
  nozzle cost more $\Delta v$ than the extra $I_{sp}$ buys. Upper stages, where
  the mass penalty is levered hardest, still push to $\varepsilon = 165$
  (Merlin Vacuum) or 285 (RL10B-2), which tells you how steep the $I_{sp}$
  payoff is up there. [M]
- The bell has to fit in the interstage. The J-2 sat at $\varepsilon = 27.5$
  not because that was optimal but because the S-IVB interstage was that wide
  [SLPRE]. The RL10B-2's extendible carbon–carbon nozzle is the direct
  engineering answer to that constraint.

### 3.3 Effective exhaust velocity, and specific impulse

The thrust equation has two terms, which is inconvenient for bookkeeping.
Define a single velocity that reproduces the whole thing:

$$
c \;\equiv\; \frac{F}{\dot m} \;=\; u_e + \frac{(p_e - p_a)A_e}{\dot m}
$$

> **Eq. 3.4 — effective exhaust velocity** — variables: $c$ [m/s]. Meaning: the
> velocity at which the propellant would have to leave, with no pressure
> thrust, to produce the observed thrust. Assumes: nothing beyond Eq. 3.2.
> Fails: $c$ is *not* a physical velocity of any gas parcel; it is an
> equivalent. At sea level with an over-expanded nozzle $c < u_e$, and nothing
> is moving at $c$. [F]

Specific impulse is impulse per unit propellant *weight* in one convention and
per unit propellant *mass* in the other, and the two conventions are the
single most common unit error in this field.

$$
I_{sp} \;=\; \frac{F}{\dot m\, g_0} \;=\; \frac{c}{g_0} \quad [\mathrm{s}]
\qquad\qquad
I_{sp,m} \;=\; \frac{F}{\dot m} \;=\; c \quad [\mathrm{N\,s/kg} = \mathrm{m/s}]
$$

> **Eq. 3.5** — variables: $g_0 = 9.80665$ m/s² exactly, a *defined* constant.
> Meaning: how much impulse you get per unit of propellant consumed. Assumes:
> steady operation; for a real engine, quote the ambient condition (SL or vac)
> or the number is meaningless. Fails as a figure of merit whenever propellant
> *volume* or *density* is the binding constraint — see density impulse in
> Module 32. [F]

Three points that catch people out:

1. **$g_0$ here is not gravity.** It is a unit conversion constant, fixed by
   definition. Specific impulse in seconds does not change on Mars. The seconds
   convention exists because in US customary units, $F/(\dot w)$ with $F$ in
   lbf and $\dot w$ in lbf/s gives seconds directly, and the number is the same
   in both unit systems — which was genuinely useful in 1955 and is a
   historical accident now.
2. **N·s/kg and m/s are the same unit.** $I_{sp,m}$ in N·s/kg is numerically
   $c$ in m/s. European and academic literature often uses this; NASA and
   industry use seconds. Multiply seconds by 9.80665 to get m/s.
3. **The lbf·s/lbm form is also seconds.** $1\ \mathrm{lbf\,s/lbm}$ is
   $1\ \mathrm{s}$ of $I_{sp}$, because lbf and lbm are defined so that
   $1\ \mathrm{lbf} = 1\ \mathrm{lbm}\times g_0$. If a source quotes
   "290 lbf·s/lbm", that is 290 s.

The Tsiolkovsky equation, $\Delta v = I_{sp} g_0 \ln(m_0/m_f) = c\ln(m_0/m_f)$,
is why $I_{sp}$ matters more than thrust for anything that has to reach orbit:
thrust buys you the ability to leave the pad, $I_{sp}$ buys you the mission.

### 3.4 The ideal exit velocity (recap from Module 02)

From the energy equation for isentropic flow of a calorically perfect gas from
rest in the chamber to the exit,

$$
u_e \;=\; \sqrt{\frac{2\gamma}{\gamma-1}\,R\,T_0\left[1-\left(\frac{p_e}{p_0}\right)^{\frac{\gamma-1}{\gamma}}\right]}
$$

> **Eq. 3.6** — variables: $R = R_u/\mathcal{M}$ [J/(kg·K)], $T_0$ chamber
> stagnation temperature [K], $p_0 = p_c$ [Pa], $p_e$ [Pa]. Meaning: all of the
> thermal energy released between chamber and exit that is not still stored as
> enthalpy at the exit appears as directed kinetic energy. Assumes: adiabatic,
> reversible, one-dimensional, calorically perfect gas with constant $\gamma$,
> chemically frozen composition, negligible chamber velocity. Fails for
> two-phase flow, for chemically reacting flow where recombination releases
> heat downstream, and near the exit of a highly over-expanded nozzle where the
> flow is not isentropic. [F] [A] [SB §3.2]

The group $\sqrt{RT_0} = \sqrt{R_u T_0/\mathcal{M}}$ is the whole propellant
selection argument in one expression: **you want a hot chamber and, more
strongly, light exhaust products.** $\mathcal{M}$ appears under a square root
in the denominator, and hydrogen-rich exhaust ($\mathcal{M} \approx 13.5$
kg/kmol for LOX/LH2 at $MR = 6$) beats kerosene exhaust ($\mathcal{M}\approx
23$ kg/kmol) by $\sqrt{23/13.5} = 1.31$ on that factor alone, even though
kerolox burns *hotter*. That is why the RS-25 makes 452 s and the F-1 made
304 s.

### 3.5 Characteristic velocity $c^*$

Now the useful split. Module 02 gave the choked mass flow through a sonic
throat. Rebuild it here because $c^*$ is nothing but that relation rearranged.

At the throat, $M = 1$. The isentropic relations give
$T_t/T_0 = 2/(\gamma+1)$ and $p_t/p_0 = [2/(\gamma+1)]^{\gamma/(\gamma-1)}$.
Then $\rho_t = p_t/(RT_t)$ and $u_t = a_t = \sqrt{\gamma R T_t}$, so

$$
\dot m = \rho_t u_t A_t
= \frac{p_0}{RT_0}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma}{\gamma-1}}\!\!\left(\frac{\gamma+1}{2}\right)
\sqrt{\gamma R T_0 \frac{2}{\gamma+1}}\;A_t
$$

Collecting the powers of $2/(\gamma+1)$ — the exponents are
$\frac{\gamma}{\gamma-1} - 1 - \frac12 = \frac{\gamma+1}{2(\gamma-1)}$ — gives
the compact form

$$
\dot m \;=\; \frac{\Gamma(\gamma)\, p_0\, A_t}{\sqrt{R\,T_0}},
\qquad
\Gamma(\gamma) \;\equiv\; \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}
$$

> **Eq. 3.7 — choked mass flow and the Vandenkerckhove function** — variables:
> $\Gamma$ dimensionless, $p_0$ [Pa], $A_t$ [m²], $R$ [J/(kg·K)], $T_0$ [K],
> $\dot m$ [kg/s]. Meaning: once the throat is choked, mass flow is set by
> chamber conditions and throat area alone, and is completely independent of
> what happens downstream. Assumes: steady, isentropic, one-dimensional,
> calorically perfect gas, sonic throat, uniform throat profile. Fails if the
> nozzle is unchoked ($p_c/p_a$ below about 1.9), if the throat boundary layer
> is thick enough that the effective area differs from the geometric one
> (small thrusters, low Reynolds number), and if the throat is eroding. [F]
> [SB §3.3] [ZH §4]

$\Gamma(\gamma)$ is remarkably flat: 0.6486 at $\gamma = 1.20$, 0.6386 at
1.15, 0.6673 at 1.30, 0.6847 at 1.40. Over the entire range of real
combustion gases it moves by about 3 %. That flatness is why $c^*$ is
essentially a statement about $\sqrt{T_0/\mathcal{M}}$ and very little else.

Now define

$$
c^* \;\equiv\; \frac{p_c\, A_t}{\dot m} \;=\; \frac{\sqrt{R\,T_0}}{\Gamma(\gamma)}
$$

> **Eq. 3.8 — characteristic velocity** — variables: $c^*$ [m/s], $p_c$ chamber
> stagnation pressure [Pa], $A_t$ [m²], $\dot m$ [kg/s]. Meaning: a figure of
> merit for the chamber and the propellant combination — how much stagnation
> pressure a given mass flow can hold up behind a given throat. Assumes: the
> defining form (left) assumes only a choked throat and a measurable stagnation
> pressure; the *ideal* form (right) additionally assumes complete combustion
> to equilibrium at $T_0$, calorically perfect gas, and no heat loss. Fails as
> written if $p_c$ is measured somewhere other than the chamber stagnation
> station — this is the single largest source of $c^*$ disagreements between
> sources. [F] [SB §3.4]

Two things make $c^*$ the most useful diagnostic on a test stand:

**It contains no nozzle geometry downstream of the throat.** $\varepsilon$,
bell contour, exit conditions, ambient pressure — none of them appear. $c^*$ is
purely about how well the chamber turned propellant into hot, light gas.

**It is directly measurable from three instruments.** Chamber pressure
(a transducer at the injector end or a tapped port), throat area (measured
cold with a plug gauge or a CMM, then corrected for thermal growth and
erosion), and total mass flow (turbine or Coriolis meters on both propellant
lines). Nothing else. So $c^*_{meas} = p_c A_t/\dot m$ falls out of a test with
no assumptions about $\gamma$ or $T_0$ at all, and comparing it to the CEA
prediction (Module 04) gives you the combustion efficiency.

A subtlety worth having burned into you: **the $p_c$ in $c^*$ must be the
stagnation pressure at the *nozzle* stagnation condition**, which is not
identical to the injector-face static pressure that most transducers read. In a
chamber with contraction ratio $\varepsilon_c = 2$ the chamber Mach number is
about 0.2–0.3, and the injector-end stagnation pressure exceeds the
nozzle-stagnation pressure by a few per cent because of the Rayleigh-line
pressure drop from heat addition in a duct of finite area. American Apollo-era
practice quotes injector-end; Soviet and Russian practice quotes nozzle
stagnation [_verify-liquid, systemic item 18]. Comparing an RD-180's 267 bar to
an RS-25's 206 bar without saying so slightly overstates the gap. Always ask
which station, and if you are the one writing the datasheet, say.

### 3.6 The thrust coefficient $C_f$

Substitute Eq. 3.6 and Eq. 3.7 into Eq. 3.2 and divide by $p_c A_t$. The
mass-flow term:

$$
\frac{\dot m u_e}{p_c A_t} = \frac{\Gamma}{\sqrt{RT_0}}\cdot\sqrt{\frac{2\gamma}{\gamma-1}RT_0\left[1-\left(\frac{p_e}{p_c}\right)^{\frac{\gamma-1}{\gamma}}\right]}
= \Gamma\sqrt{\frac{2\gamma}{\gamma-1}\left[1-\left(\frac{p_e}{p_c}\right)^{\frac{\gamma-1}{\gamma}}\right]}
$$

$RT_0$ cancels completely — which is the whole point. Writing
$\Gamma^2 = \gamma\,[2/(\gamma+1)]^{(\gamma+1)/(\gamma-1)}$ and folding it in:

$$
C_f \;=\; \underbrace{\sqrt{\frac{2\gamma^2}{\gamma-1}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{\gamma-1}}\left[1-\left(\frac{p_e}{p_c}\right)^{\frac{\gamma-1}{\gamma}}\right]}}_{\text{momentum}}
\;+\; \underbrace{\frac{p_e-p_a}{p_c}\,\varepsilon}_{\text{pressure}}
$$

> **Eq. 3.9 — thrust coefficient** — variables: $C_f$ dimensionless,
> $\varepsilon = A_e/A_t$, $p_e$ from $\varepsilon$ and $\gamma$ by the
> isentropic area relation, $p_a$ ambient [Pa]. Meaning: the factor by which
> the nozzle amplifies the force that chamber pressure exerts on the throat
> area — a pure figure of merit for the nozzle. Assumes: isentropic, attached,
> one-dimensional, calorically perfect, chemically frozen flow; uniform axial
> exit velocity. Fails on separation (the real $C_f$ is then higher than this
> formula predicts, because the separated nozzle behaves as a shorter one),
> and it neglects divergence, boundary layer and finite-rate chemistry — all
> handled by $\eta_{C_f}$ in §3.11. [F] [SB §3.3] [HH §1-3]

$C_f$ depends only on $\gamma$, $\varepsilon$ and $p_a/p_c$. **It contains no
propellant chemistry at all** — no $T_0$, no $\mathcal{M}$. That orthogonality
to $c^*$ is what makes the pair useful.

The vacuum, infinite-expansion limit ($p_e \to 0$, $\varepsilon\to\infty$)
gives the theoretical maximum

$$
C_{f,max} = \sqrt{\frac{2\gamma^2}{\gamma-1}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{\gamma-1}}}
$$

which is 2.2466 at $\gamma = 1.20$ and 1.8116 at $\gamma = 1.40$. Real engines
land between 1.5 and 2.0. Note the direction: **lower $\gamma$ gives a higher
achievable $C_f$**, because a gas with more internal modes has more energy
sitting in vibration and rotation available for the nozzle to extract. Real
rocket exhaust has $\gamma \approx 1.14$–1.26, which is fortunate.

### 3.7 The factorisation

The three working relations, and the reason this module exists:

$$
F = C_f\, p_c\, A_t
\qquad
\dot m = \frac{p_c A_t}{c^*}
\qquad
I_{sp} = \frac{c^* C_f}{g_0}
\qquad
c = c^* C_f
$$

> **Eq. 3.10 — the performance factorisation** — variables: all defined above.
> Meaning: $c^*$ is everything upstream of and including the throat (chamber,
> propellants, combustion); $C_f$ is everything downstream (nozzle expansion,
> ambient pressure). Assumes: the same $p_c$ station is used in both, and $A_t$
> is the same area in both. Fails as a *clean* split when throat erosion
> changes $A_t$ during the burn — then $A_t$ appears in both and the two
> efficiencies stop being independent. [F]

This is more than algebra. It is a **division of labour**:

- $c^*$ belongs to the injector designer, the combustion engineer and the
  propellant chemist. If $\eta_{c^*}$ is 0.92 when it should be 0.97, the
  answer is in the injector: element pattern, atomisation, mixing length,
  mixture-ratio maldistribution, or excessive film-cooling flow that is not
  burning.
- $C_f$ belongs to the nozzle aerodynamicist. If $\eta_{C_f}$ is low, the
  answer is contour, divergence angle, boundary-layer displacement, separation,
  or throat erosion having changed $\varepsilon$.
- $I_{sp}$ is the product, and by itself tells you nothing about which one
  failed.

Rearranged for design, the same equations give the sizing chain. $A_t$ follows
from thrust, chamber pressure and $C_f$:

$$
A_t = \frac{F}{C_f\, p_c}
$$

> **Eq. 3.11** — variables: as above. Meaning: throat area is the primary
> sizing dimension of the whole engine — everything else scales from it.
> Assumes: $C_f$ known, which requires $\varepsilon$, $\gamma$ and the design
> ambient pressure to be chosen first. Fails if the design point is not the
> point where you actually need the thrust; a first-stage engine sized on
> sea-level thrust will over-perform in vacuum by 8–12 %. [F]

### 3.8 $C_f$ against $\varepsilon$: the map you should be able to draw

You cannot memorise a chart, but you must be able to sketch this one, because
almost every nozzle argument reduces to a point on it.

Plot $C_f$ on the vertical axis, expansion ratio $\varepsilon$ on the
horizontal (log scale, 1 to 100). Draw one curve per nozzle pressure ratio
$p_c/p_a$. Here are computed values for $\gamma = 1.20$ [F]:

| $\varepsilon$ | $p_c/p_a = 50$ | $p_c/p_a = 100$ | $p_c/p_a = 200$ | vacuum |
|---|---|---|---|---|
| 2 | 1.426 | 1.446 | 1.456 | 1.466 |
| 4 | 1.527 | 1.567 | 1.587 | 1.607 |
| 6 | **1.553** | 1.613 | 1.643 | 1.673 |
| 8 | 1.553 | 1.633 | 1.673 | 1.713 |
| 10 | 1.542 | 1.642 | 1.692 | 1.742 |
| 12 | 1.525 | **1.645** | 1.705 | 1.765 |
| 16 | 1.477 | 1.637 | 1.717 | 1.797 |
| 20 | 1.421 | 1.621 | **1.721** | 1.821 |
| 25 | 1.342 | 1.592 | 1.717 | 1.842 |
| 30 | 1.259 | 1.559 | 1.709 | 1.859 |
| 40 | 1.084 | 1.484 | 1.684 | 1.884 |

Read the structure off it:

1. **Every finite-$p_a$ curve has a maximum**, marked in bold. The peak sits at
   the $\varepsilon$ where $p_e = p_a$: $\varepsilon^{opt} \approx 7.5$ for
   NPR 50, 11.8 for NPR 100, 20.6 for NPR 200. Higher chamber pressure buys
   you a bigger optimum nozzle — one of the two reasons chamber pressure is
   worth chasing (the other is thrust density).
2. **The peaks are flat.** Going from $\varepsilon = 8$ to 16 at NPR 100 costs
   0.4 % in $C_f$ but buys 9 % in vacuum $C_f$. This flatness is the entire
   licence for designing first stages over-expanded: the sea-level penalty is
   nearly free and the altitude gain is large. Merlin 1D at $\varepsilon = 16$
   and $p_c = 97$ bar sits almost exactly here.
3. **The vacuum curve never turns over.** It rises monotonically and
   asymptotically toward $C_{f,max} = 2.247$, with brutally diminishing
   returns: $\varepsilon$ 25→40 buys 2.3 %, 40→100 buys another 3 %. Upper
   stages ride this curve until mass or packaging stops them.
4. **Left of the optimum the curves bunch together; right of it they fan
   apart.** Under-expansion is cheap; over-expansion is expensive. An engine
   designed for vacuum and fired at sea level loses far more than one designed
   for sea level and fired in vacuum gains.
5. **The far right of the low-NPR curves is fiction.** The one-dimensional
   theory happily computes $C_f = 1.084$ for $\varepsilon = 40$ at NPR 50, but
   that flow will have separated from the wall long before the exit. Draw a
   **separation limit** line across the chart.

**The separation limit.** When the exit pressure falls far enough below
ambient, the adverse pressure gradient at the wall causes the boundary layer to
separate; a shock system forms inside the nozzle and the flow leaves at
roughly ambient pressure from a smaller effective area. The classic engineering
criterion is Summerfield's [E]:

$$
\frac{p_e}{p_a} \gtrsim 0.4 \quad\text{for attached flow}
$$

> **Eq. 3.12 — Summerfield separation criterion** — variables: $p_e$ ideal exit
> static pressure [Pa], $p_a$ ambient [Pa]. Meaning: a nozzle flowing with
> $p_e$ below about 40 % of ambient will separate. Assumes: conical or
> conventional bell, cold-wall, steady. Fails as a sharp rule — it is a fit,
> not a physical threshold; observed separation ratios range from 0.25 to 0.5
> depending on contour, wall temperature, and Reynolds number, and it is
> notably conservative for high-$p_c$ bells. [E] [SFS54]

A better correlation, and the one to use if you need a number rather than a
sanity check, is Schmucker's [E] [Schmucker73]:

$$
\frac{p_{sep}}{p_a} = (1.88\,M_e - 1)^{-0.64}
$$

> **Eq. 3.13** — variables: $M_e$ ideal exit Mach number, $p_{sep}$ the wall
> pressure at which separation occurs [Pa]. Meaning: separation is delayed to
> lower pressure ratios at higher exit Mach number, because the boundary layer
> is thinner and more energetic. Assumes: over-expanded conventional nozzles,
> free-shock separation (not restricted-shock). Fails for the
> restricted-shock-separation pattern seen in some thrust-optimised parabolic
> contours (the RS-25 and Vulcain 2 both exhibit it), where the separated flow
> reattaches and produces much larger side loads. [E] [OMK05] [Ostlund02]

Separation matters far beyond performance. The asymmetric, unsteady separation
line generates **side loads** — lateral forces of tens of kilonewtons on the
nozzle and gimbal bearing. The J-2S, RS-25 and Vulcain 2 all had side-load
issues during start transients. This is a structures problem caused by a gas
dynamics phenomenon, and it is why "just make $\varepsilon$ bigger" is not
free even before you count mass.

### 3.9 Expansion ratio, nozzle pressure ratio, and altitude

Two ratios, constantly confused:

- **Expansion ratio** $\varepsilon = A_e/A_t$ is *geometry*. It is fixed by
  the hardware (unless the nozzle extends, as on the RL10B-2).
- **Nozzle pressure ratio** NPR is *operation*. Some authors mean $p_c/p_a$
  (how hard the atmosphere is fighting you), some mean $p_c/p_e$ (how far the
  nozzle expands). $p_c/p_e$ is a function of $\varepsilon$ and $\gamma$ alone;
  $p_c/p_a$ changes every second of the ascent. Always state which.

For a fixed nozzle, $p_e/p_c$ is fixed by $\varepsilon$. From the isentropic
area–Mach relation of Module 02 you find $M_e$, then
$p_e/p_c = [1 + \frac{\gamma-1}{2}M_e^2]^{-\gamma/(\gamma-1)}$. The optimum
expansion ratio for a given ambient is the inverse problem: find $M_e$ from
$p_c/p_a$, then $\varepsilon$ from $M_e$.

At $p_c = 100$ bar, $\gamma = 1.20$ [F]:

| altitude | $p_a$ (Pa) | $\varepsilon^{opt}$ |
|---|---|---|
| sea level | 101 325 | 11.8 |
| 10 km | 26 500 | 33 |
| 20 km | 5 530 | 115 |
| 30 km | 1 200 | 393 |
| vacuum | → 0 | → ∞ |

No fixed-geometry nozzle can track that. The compromises actually flown:

- **Fixed, over-expanded first stage.** Everybody. Merlin 1D $\varepsilon=16$,
  F-1 $\varepsilon = 16$, RD-180 $\varepsilon = 36.9$ (helped by its 267 bar
  chamber, which pushes $\varepsilon^{opt}$ at sea level up near 30).
- **Separate vacuum variant.** Merlin 1D vs Merlin Vacuum ($\varepsilon = 16$
  vs 165) — same powerhead, different bell. Rutherford does the same.
- **Extendible nozzle.** RL10B-2: 77:1 stowed, 285:1 deployed, worth about
  30 s of $I_{sp}$, at the cost of a deployment mechanism with no abort mode.
- **Altitude-compensating geometry** (aerospike, dual-bell, expansion–
  deflection). Studied continuously since the 1960s, never flown
  operationally. Module 09 covers why. [R]

### 3.10 Sizing the chamber: $L^*$ and contraction ratio

The throat sets the engine's scale; the chamber upstream of it has to be big
enough that combustion actually finishes before the gas reaches the throat. No
closed-form theory gives you that volume — it depends on droplet size,
vaporisation rate, mixing, and chemical kinetics, all of which are
propellant-specific and injector-specific. The industry's answer is a crude
but durable empirical parameter:

$$
L^* \;\equiv\; \frac{V_c}{A_t}
$$

> **Eq. 3.14 — characteristic length** — variables: $V_c$ chamber volume from
> injector face to throat plane *including* the convergent section [m³], $A_t$
> [m²], $L^*$ [m]. Meaning: a proxy for gas residence time, since
> $t_s = V_c\rho_c/\dot m = L^* \rho_c c^*/p_c$ and $\rho_c c^*/p_c$ varies
> little across propellant combinations. Assumes: the chamber is the dominant
> combustion volume; geometry effects beyond volume are second order. Fails as
> a design rule outside the combination it was calibrated on — an $L^*$ from a
> LOX/LH2 coaxial-injector engine tells you nothing about a hypergolic
> pintle. [E] [SB §8.1] [HH §4]

Typical values [E] [SB Table 8-1] [HH]:

| propellants | $L^*$ (m) | $L^*$ (in) |
|---|---|---|
| LOX/LH2 | 0.56–1.02 | 22–40 |
| LOX/RP-1 | 1.02–1.27 | 40–50 |
| N2O4/hydrazine family | 0.76–0.89 | 30–35 |
| LOX/CH4 (modern) | 0.9–1.1 | 35–43 |
| solid motors (for comparison) | not applicable | — |

The trend is physical: hydrogen vaporises and burns fast, so it needs less
volume; RP-1 has to atomise, heat, vaporise and pyrolyse first, so it needs
more. The modern trend is downward across the board [M] — better injector
characterisation, CFD, and higher chamber pressures (which raise density and
therefore shorten the residence time needed for a given volume) have let
designers shave $L^*$ that older programmes needed. Shorter chamber is less
mass, less cooled surface area, and less heat load.

The second chamber parameter is the **contraction ratio**
$\varepsilon_c = A_c/A_t$, where $A_c$ is the cylindrical chamber
cross-section. It is set by two competing requirements. Too small and the
chamber Mach number is high, which costs stagnation pressure (Rayleigh loss
with heat addition) and puts the injector face into a fast crossflow. Too large
and you carry unnecessary chamber mass and cooled surface. Practice [E]:

- Large engines ($A_t$ > 100 cm²): $\varepsilon_c = 1.5$–2.5. F-1 is about 1.6.
- Small engines and thrusters: $\varepsilon_c = 2.5$–5, because the boundary
  layer occupies a bigger fraction of a small chamber and because a small
  chamber's injector needs face area.
- A useful correlation [E]: $\varepsilon_c \approx 8\,D_t^{-0.6} + 1.25$ with
  $D_t$ in inches [HH §4]; treat as a starting point, not a rule.

Given $\varepsilon_c$ and $V_c$, the cylindrical chamber length follows from
$L_c \approx (V_c - V_{conv})/A_c$, where $V_{conv}$ is the convergent-section
volume. For a first pass, taking $V_c \approx L_c A_c$ and ignoring the
convergent volume overestimates $L_c$ by 10–20 %; state which you did.

### 3.11 Efficiencies and the loss budget

An ideal-gas, one-dimensional, frozen-composition, isentropic calculation
overpredicts real performance. The two efficiencies absorb the difference:

$$
\eta_{c^*} = \frac{c^*_{meas}}{c^*_{ideal}},
\qquad
\eta_{C_f} = \frac{C_{f,meas}}{C_{f,ideal}},
\qquad
\eta_{ov} = \frac{I_{sp,meas}}{I_{sp,ideal}} = \eta_{c^*}\,\eta_{C_f}
$$

> **Eq. 3.15** — variables: measured values from a hot fire, ideal values from
> a thermochemical code (Module 04) at the same $p_c$, $MR$, $\varepsilon$ and
> $p_a$. Meaning: the fraction of theoretical performance actually delivered,
> split by responsible subsystem. Assumes: the ideal calculation used the *same*
> assumptions the convention expects — usually shifting-equilibrium chamber,
> frozen or equilibrium nozzle, and this must be stated or the efficiency is
> meaningless. Fails to be comparable between organisations that use different
> ideal baselines; JANNAF standardised this precisely because everyone's
> "efficiency" meant something different [CPIA-246]. [F] [E]

Typical values [E]:

| quantity | typical range | who sits where |
|---|---|---|
| $\eta_{c^*}$ | 0.92–0.995 | 0.92 is a poorly mixed or heavily film-cooled chamber; ≥0.99 is a mature staged-combustion engine |
| $\eta_{C_f}$ | 0.92–0.99 | 0.92 is a short conical nozzle or one operating near separation; 0.98–0.99 is a well-designed bell in vacuum |
| $\eta_{ov}$ | 0.88–0.98 | |

**What lives inside $\eta_{c^*}$** (chamber losses):

- **Incomplete mixing / mixture-ratio maldistribution.** Different injector
  elements deliver slightly different $O/F$; since $c^*$ peaks at one $MR$, any
  spread costs performance even if every element burns completely. Usually the
  largest single term.
- **Incomplete vaporisation and combustion.** Droplets that reach the throat
  unburned carry away their chemical energy. Worse at low $p_c$, with cold
  propellants, and with coarse atomisation.
- **Heat loss to the walls.** Real chambers are not adiabatic. Regeneratively
  cooled engines return that heat to the cycle, so the loss is small; ablative
  and radiation-cooled chambers lose it outright.
- **Film and barrier cooling.** Fuel injected along the wall to protect it is
  deliberately burned at the wrong mixture ratio, or not burned at all. This is
  a *chosen* loss: 1–3 % of $c^*$ traded for a chamber that survives. Engines
  with heavy film cooling sit at the bottom of the $\eta_{c^*}$ range and their
  designers are not embarrassed about it.

**What lives inside $\eta_{C_f}$** (nozzle losses):

- **Divergence loss.** The exhaust at the exit plane is not purely axial; only
  the axial component makes thrust. For a conical nozzle of half-angle
  $\alpha$, integrating the axial component of a uniform radial-source flow
  over the exit sphere gives
  $$\lambda = \frac{1 + \cos\alpha}{2}$$
  > **Eq. 3.16 — conical divergence correction** — variables: $\alpha$ the
  > divergent half-angle [rad]. Meaning: the fraction of exit momentum that is
  > axial. Assumes: conical nozzle, source flow from the throat, uniform Mach
  > number on the exit spherical cap. Fails for bell nozzles, where the wall
  > turns the flow back toward axial and $\lambda$ is much closer to 1 — a bell
  > is *defined* by beating this. Fails also for very short bells with
  > significant exit-plane Mach non-uniformity. [F] [A] [SB §3.4] [Rao58]

  Values: $\lambda = 0.9924$ at 10°, 0.9891 at 12°, **0.9830 at 15°**, 0.9698
  at 20°, 0.9532 at 25°. The 15° cone is the historical reference point, and a
  1.7 % loss is why Rao's method [Rao58] [Rao60] and the bell nozzle exist — a
  well-designed 80 %-length bell recovers most of that 1.7 % while being
  *shorter* than the cone.
- **Boundary-layer / friction loss.** The viscous layer on the nozzle wall
  produces drag and a displacement thickness that slightly reduces effective
  area. Typically 0.5–1.5 %, larger for small nozzles (higher surface-to-volume
  ratio) and for long, high-$\varepsilon$ bells.
- **Finite-rate chemistry (kinetic) loss.** Real expansion is fast enough that
  dissociated species (H, OH, O, CO) do not fully recombine before leaving.
  Equilibrium expansion is the optimistic bound, frozen expansion the
  pessimistic one, and reality is in between. 0.5–3 %, largest for hot
  hydrogen–oxygen at high $\varepsilon$ where there is a lot of dissociation to
  recover.
- **Two-phase flow loss.** Condensed particles (Al2O3 in aluminised solids,
  soot in fuel-rich hydrocarbons) lag the gas in both velocity and temperature,
  so they neither reach exhaust velocity nor give up their heat. This is the
  dominant nozzle loss in solid motors — 1–4 % — and is negligible in clean
  liquid engines. Module 20 handles it properly.
- **Erosion.** In ablative and solid-motor nozzles, $A_t$ grows during the
  burn, which drops $p_c$, drops $\varepsilon$, and moves you along the $C_f$
  curve. Not a loss so much as a moving design point.

**A caution on the accounting.** These loss mechanisms are not independent and
do not simply multiply. JANNAF's standard performance methodology [CPIA-246]
exists because naïve multiplication of efficiency factors gave answers that
disagreed with test by more than the factors themselves. For preliminary design
the product of factors is fine and the error is a fraction of a per cent; for
contractual performance prediction, use the standard methodology. [J]

### 3.12 The design chain

Everything above assembles into one procedure. This is what you do on the first
day of a clean-sheet engine.

```
  requirement:  thrust F at a stated altitude
        |
        v
  [1] choose chamber pressure p_c
        |    (cycle limits, pump power, chamber cooling, mass)
        v
  [2] choose propellants and mixture ratio
        |
        v
  [3] thermochemistry (CEA, Module 04) --> T_0, M, gamma
        |
        v
  [4] c*_ideal = sqrt(R T_0)/Gamma(gamma);  apply eta_c*
        |
        v
  [5] choose design ambient p_a and expansion ratio eps
        |    (check separation:  p_e/p_a > ~0.4)
        v
  [6] C_f from gamma, eps, p_a/p_c;  apply eta_Cf (incl. divergence)
        |
        v
  [7] A_t = F / (C_f p_c)       --> throat diameter D_t
  [8] A_e = eps A_t             --> exit diameter D_e
  [9] mdot = p_c A_t / c*       --> propellant flows from MR
  [10] I_sp = c* C_f / g_0      --> check against requirement
        |
        v
  [11] V_c = L* A_t;  eps_c --> A_c, chamber diameter and length
        |
        v
  iterate: does it fit? does it cool? does the cycle close?
```

Steps 1 and 5 are the design decisions; everything else is arithmetic. Step 1
is the one that propagates furthest: chamber pressure sets thrust density (so
engine size and mass), sets the pump discharge pressure (so turbine power, so
cycle choice), sets the heat flux (roughly as $p_c^{0.8}$ via Bartz, Module
10), and raises $\varepsilon^{opt}$ at sea level. Raising $p_c$ improves
almost everything except the difficulty of building it, which is why the
history of the field is a slow climb from the V-2's 15 bar to the RD-180's
267 bar and Raptor's claimed ~300 bar.

---

## 4. Typical engineering ranges

| quantity | typical range | low end | high end |
|---|---|---|---|
| $c^*$, LOX/LH2 | 2 200–2 400 m/s | — | RS-25, RL10 |
| $c^*$, LOX/RP-1 | 1 700–1 830 m/s | F-1 (low $p_c$) | RD-180 (267 bar) |
| $c^*$, LOX/CH4 | 1 800–1 870 m/s | | |
| $c^*$, N2O4/MMH | 1 600–1 720 m/s | small RCS thrusters | large storable engines |
| $c^*$, cold gas (N2) | 400–450 m/s | | |
| $C_f$, sea level | 1.35–1.75 | over-expanded / near separation | RD-180 (high NPR) |
| $C_f$, vacuum | 1.75–2.05 | $\varepsilon\approx16$ | RL10B-2 ($\varepsilon = 285$) |
| $\varepsilon$, first stage | 8–40 | V-2 ≈ 3.5 | RD-180 36.9 |
| $\varepsilon$, upper stage / vacuum | 25–285 | J-2 27.5 (packaging-limited) | RL10B-2 285 |
| $p_c$ | 15–270 bar | V-2 ≈ 15 bar | RD-180 267 bar |
| $I_{sp}$ SL, kerolox | 255–315 s | V-2 ≈ 203 s | RD-180 311 s |
| $I_{sp}$ vac, kerolox | 300–350 s | F-1 304 s | MVac 348 s |
| $I_{sp}$ vac, LOX/LH2 | 420–466 s | J-2 421 s | RL10B-2 465.5 s |
| $\eta_{c^*}$ | 0.92–0.995 | heavy film cooling | mature SC engines |
| $\eta_{C_f}$ | 0.92–0.99 | short cone, near separation | long vacuum bell |
| $L^*$ | 0.56–1.30 m | LOX/LH2 | LOX/RP-1 |
| $\varepsilon_c$ | 1.5–5 | large boosters | small thrusters |
| divergence half-angle (cone) | 12–18° | | |
| $\lambda$ (cone) | 0.977–0.989 | 18° | 12° |

All real-engine figures are from `reference/_verify-liquid.md`; carry their
caveats. The RS-25 expansion ratio is contested (69:1 manufacturer vs 77.5:1
widely quoted); the F-1 chamber pressure is contested across 965–1 125 psia;
Merlin and Raptor figures are company claims.

---

## 5. Worked examples

### WE1 — Size a 500 kN sea-level LOX/RP-1 engine from scratch

**Requirement.** $F_{SL} = 500$ kN (112 400 lbf) at sea level, $p_a = 101 325$
Pa. Gas-generator cycle, so chamber pressure is limited by pump discharge and
turbine power.

**Step 1 — chamber pressure.** Choose $p_c = 100$ bar (10.0 MPa, 1 450 psia).
Justification [J]: Merlin 1D runs 97 bar on a GG cycle with kerosene cooling
and a single-shaft turbopump; 100 bar is proven territory for this
architecture. Going to 150 bar would need a staged-combustion cycle.

**Step 2–3 — propellants and thermochemistry.** LOX/RP-1 at $MR = 2.35$. From
a thermochemical calculation at 100 bar (Module 04): $T_0 = 3\,600$ K,
$\mathcal{M} = 23.0$ kg/kmol, $\gamma = 1.20$.

$$R = \frac{R_u}{\mathcal{M}} = \frac{8314.46}{23.0} = 361.5\ \mathrm{J/(kg\,K)}$$

**Step 4 — $c^*$.**

$$\Gamma(1.20) = \sqrt{1.20}\left(\frac{2}{2.20}\right)^{\frac{2.20}{0.40}} = 1.0954 \times (0.90909)^{5.5} = 0.6485$$

$$c^*_{ideal} = \frac{\sqrt{R T_0}}{\Gamma} = \frac{\sqrt{361.5 \times 3600}}{0.6485} = \frac{1140.8}{0.6485} = 1\,759\ \mathrm{m/s}$$

Apply $\eta_{c^*} = 0.96$ [J] — a GG-cycle kerolox engine with film cooling;
0.96 is mid-range and honest for a first pass.

$$c^* = 0.96 \times 1759 = 1\,689\ \mathrm{m/s}$$

**Step 5 — expansion ratio.** Optimum at sea level for $p_c/p_a = 98.7$ is
$\varepsilon^{opt} = 11.8$. But the engine flies to altitude, and §3.8 showed
the $C_f$ peak is flat. Choose $\varepsilon = 16$, matching first-stage
practice (Merlin 1D and F-1 both use 16).

Check separation. At $\varepsilon = 16$, $\gamma = 1.20$: $M_e = 3.604$,
$p_e/p_c = 6.770\times10^{-3}$, so $p_e = 67.7$ kPa and
$p_e/p_a = 0.668$. Summerfield needs > 0.4; Schmucker gives
$p_{sep} = 101\,325 (1.88\times3.604 - 1)^{-0.64} = 33.0$ kPa, and
$p_e = 67.7$ kPa is comfortably above it. **Attached.**

**Step 6 — $C_f$.**

$$C_{f,ideal} = \sqrt{\frac{2(1.2)^2}{0.2}\left(\frac{2}{2.2}\right)^{11}\left[1-(6.770\times10^{-3})^{1/6}\right]} + \frac{67\,703 - 101\,325}{10^7}\times 16 = 1.6888 - 0.0538 = 1.635$$

Apply $\eta_{C_f} = 0.98$ [J], which is roughly $\lambda = 0.983$ for an
equivalent 15° cone (a real bell does better) times ~1 % of boundary-layer and
kinetic loss:

$$C_f = 0.98 \times 1.635 = 1.602$$

**Step 7 — throat.**

$$A_t = \frac{F}{C_f p_c} = \frac{500\,000}{1.602 \times 10^7} = 0.031206\ \mathrm{m^2}
\quad\Rightarrow\quad
D_t = \sqrt{\frac{4 A_t}{\pi}} = 0.1993\ \mathrm{m}\ (199.3\ \mathrm{mm},\ 7.85\ \mathrm{in})$$

**Step 8 — exit.**

$$A_e = 16 \times 0.031206 = 0.4993\ \mathrm{m^2} \quad\Rightarrow\quad D_e = 0.797\ \mathrm{m}\ (31.4\ \mathrm{in})$$

**Step 9 — flows.**

$$\dot m = \frac{p_c A_t}{c^*} = \frac{10^7 \times 0.031206}{1689} = 184.8\ \mathrm{kg/s}$$

$$\dot m_{ox} = \frac{MR}{1+MR}\dot m = \frac{2.35}{3.35}\times184.8 = 129.6\ \mathrm{kg/s},
\qquad \dot m_{f} = 55.2\ \mathrm{kg/s}$$

**Step 10 — performance.**

$$c = c^* C_f = 1689 \times 1.602 = 2\,706\ \mathrm{m/s} \quad\Rightarrow\quad I_{sp,SL} = \frac{2706}{9.80665} = 275.9\ \mathrm{s}$$

Vacuum: $C_{f,vac,ideal} = 1.7971$, $C_{f,vac} = 1.761$, so
$I_{sp,vac} = 1689\times1.761/9.80665 = 303.3$ s and
$F_{vac} = \dot m c_{vac} = 184.8 \times 2974 = 549.6$ kN. Note the vacuum
thrust is 9.9 % above sea level, exactly $p_a A_e / F_{SL} = 101\,325\times
0.4993/500\,000 = 10.1$ % less the small $C_f$ bookkeeping — a good internal
check.

**Step 11 — chamber.** LOX/RP-1, take $L^* = 1.1$ m [E]:

$$V_c = L^* A_t = 1.1 \times 0.031206 = 0.03433\ \mathrm{m^3} = 34.3\ \mathrm{L}$$

With $\varepsilon_c = 2.5$: $A_c = 0.0780$ m², $D_c = 0.315$ m (12.4 in), and a
crude cylindrical length $L_c \approx V_c/A_c = 0.440$ m — an overestimate of
10–20 % because it charges the convergent-section volume to the cylinder.

**Sanity check.** The result — 500 kN SL, 199 mm throat, 797 mm exit,
185 kg/s, 276 s SL / 303 s vac — should be compared to Merlin 1D:
845 kN SL, $p_c = 97$ bar, $\varepsilon = 16$, 282 s SL / 311 s vac
[_verify-liquid]. Our engine is 59 % of Merlin's thrust and lands 6 s (2.1 %)
below it on $I_{sp}$, which is the right direction and the right magnitude for
a first-pass design that assumed $\eta_{c^*} = 0.96$ where SpaceX evidently
achieves about 0.965 and a better nozzle. Nothing here is embarrassing.

### WE2 — Reduce a hot-fire test to $\eta_{c^*}$ and $\eta_{C_f}$

**The test.** A LOX/RP-1 development chamber on a sea-level stand. Measured at
the 30 s steady-state slice:

| measurement | value |
|---|---|
| chamber pressure (injector end) | 6.895 MPa (1 000 psia) |
| throat diameter (cold, measured) | 90.0 mm |
| total propellant flow | 26.2 kg/s |
| axial thrust (load cell) | 68.0 kN |
| expansion ratio | 9.0 |
| ambient | 101 325 Pa |

Ideal reference from thermochemistry at this $p_c$ and $MR$: $\gamma = 1.20$,
$T_0 = 3\,600$ K, $\mathcal{M} = 23.0$ kg/kmol.

**Throat area.**
$$A_t = \frac{\pi}{4}(0.0900)^2 = 6.3617\times10^{-3}\ \mathrm{m^2}$$

**Measured $c^*$.** Straight from the definition — no gas model needed:
$$c^*_{meas} = \frac{p_c A_t}{\dot m} = \frac{6.895\times10^6 \times 6.3617\times10^{-3}}{26.2} = 1\,674\ \mathrm{m/s}$$

**Ideal $c^*$.** $R = 361.5$ J/(kg·K), $\Gamma = 0.6485$:
$$c^*_{ideal} = \frac{\sqrt{361.5\times3600}}{0.6485} = 1\,759\ \mathrm{m/s}$$

$$\boxed{\eta_{c^*} = \frac{1674}{1759} = 0.952}$$

**Measured $C_f$.**
$$C_{f,meas} = \frac{F}{p_c A_t} = \frac{68\,000}{6.895\times10^6\times6.3617\times10^{-3}} = 1.550$$

**Ideal $C_f$.** At $\varepsilon = 9$, $\gamma = 1.20$: $M_e = 3.205$,
$p_e = 99.4$ kPa (essentially perfectly expanded at sea level — a sensible
test-stand nozzle), so the pressure term is $-0.0025$ and
$C_{f,ideal} = 1.597$.

$$\boxed{\eta_{C_f} = \frac{1.550}{1.597} = 0.971}$$

$$\eta_{ov} = 0.952 \times 0.971 = 0.924,
\qquad I_{sp,meas} = \frac{68\,000}{26.2\times9.80665} = 264.7\ \mathrm{s}$$

against an ideal $I_{sp} = c^*_{ideal}C_{f,ideal}/g_0 = 286.4$ s.

**What the numbers say.** $\eta_{C_f} = 0.971$ is unremarkable for a
short conical development nozzle — divergence plus boundary layer accounts for
it. $\eta_{c^*} = 0.952$ is the problem: 4.8 % of the propellant's chemical
energy is not showing up as chamber stagnation pressure. That is an injector
finding, not a nozzle finding. The candidates, in the order you would chase
them: mixture-ratio maldistribution across the face, coarse atomisation of the
RP-1, excessive fuel film cooling, or a $p_c$ transducer reading the wrong
station. Note the last one — **before you redesign an injector, check whether
you measured chamber pressure at the injector face or through a long, gas-filled
sense line that is reading low.** More than one "combustion efficiency problem"
has turned out to be instrumentation.

**Sanity check.** $\eta_{ov} = 0.924$ and $I_{sp,SL} = 265$ s put this chamber
between the V-2 and the F-1. For a development article on its first few firings
that is a normal place to be; a flight-rated GG kerolox engine should reach
$\eta_{c^*} \approx 0.96$–0.97.

*(This example maps to `c_star` and `Cf` in `tools/rocket.py`; see
`tools/examples/03.py`.)*

### WE3 — Reconstruct the RS-25 vacuum $I_{sp}$ from first principles

**Given** [_verify-liquid, RS-25 block]: LOX/LH2 at $MR = 6.03$,
$p_c = 206.4$ bar (2 994 psia) at 109 % power level, geometric
$\varepsilon = 69$:1 per the L3Harris datasheet (the widely quoted 77.5:1 is
discussed below), published $I_{sp,vac} = 452.3$ s.

**Thermochemistry input** (Module 04, CEA at 206 bar, $MR = 6.03$):
$T_0 = 3\,600$ K, $\mathcal{M} = 13.5$ kg/kmol, $\gamma = 1.19$.

**Step 1 — $c^*$.**
$$R = \frac{8314.46}{13.5} = 615.9\ \mathrm{J/(kg\,K)}$$
$$\Gamma(1.19) = \sqrt{1.19}\,(2/2.19)^{2.19/0.38} = 0.64658$$
$$c^*_{ideal} = \frac{\sqrt{615.9\times3600}}{0.64658} = \frac{1488.9}{0.64658} = 2\,303\ \mathrm{m/s}$$

**Step 2 — $C_f$ in vacuum at $\varepsilon = 69$.** Inverting the area–Mach
relation gives $M_e = 4.553$, hence $p_e/p_c = 1.0947\times10^{-3}$ and
$p_e = 22.6$ kPa. With $p_a = 0$:
$$C_{f,vac} = \sqrt{\frac{2(1.19)^2}{0.19}\left(\frac{2}{2.19}\right)^{2.19/0.19}\left[1 - (1.0947\times10^{-3})^{0.19/1.19}\right]} + (1.0947\times10^{-3})(69) = 1.8638 + 0.0755 = 1.9393$$

**Step 3 — $I_{sp}$.**
$$I_{sp,vac,ideal} = \frac{c^* C_{f,vac}}{g_0} = \frac{2303 \times 1.9393}{9.80665} = 455.4\ \mathrm{s}$$

**Compare to published: 452.3 s.** The reconstruction is **+0.7 % high**.

**Why is it high, and why only by 0.7 %?** Two large errors are cancelling, and
you should be suspicious of the agreement rather than pleased by it.

- The ideal calculation ignores every real loss — divergence, boundary layer,
  finite-rate recombination, $\eta_{c^*} < 1$. Together those are worth 2–4 %
  in a real hydrogen engine, so the ideal number should be *well* above 452 s.
- But the constant-$\gamma$, calorically perfect, chemically frozen model
  *under*predicts the exhaust velocity of a real LOX/LH2 nozzle, because real
  expansion is closer to shifting equilibrium: dissociated H and OH recombine
  downstream and release heat that a frozen model throws away. At $\varepsilon
  = 69$ that recovery is worth several per cent.

The two errors are of similar size and opposite sign. This is the standard
trap: **a single-$\gamma$ model can land within 1 % of a real hydrogen engine
for entirely the wrong reasons.** Use it for sizing and for sanity checks,
never for contractual performance. That is what CEA and the JANNAF methodology
[CPIA-246] are for.

**The $\varepsilon$ caveat.** Repeat with $\varepsilon = 77.5$: $M_e = 4.633$,
$C_{f,vac} = 1.9479$, $I_{sp} = 457.4$ s. The 12 % change in area ratio moves
$I_{sp}$ by only 0.44 %, which tells you two useful things: the vacuum $C_f$
curve really is that flat out there, and the 69-vs-77.5 dispute in the
literature [_verify-liquid, contested item 2] cannot be settled by performance
data — both area ratios reproduce the published $I_{sp}$ within the model's own
error. It has to be settled with a tape measure.

**Sea-level check, and a warning.** The same model at $p_a = 101\,325$ Pa gives
$C_f = 1.601$ and $I_{sp,SL} = 375.9$ s against a published 366 s — now
2.7 % high, far worse than the vacuum case. The reason is visible in the
numbers: $p_e/p_a = 22.6/101.3 = 0.223$, well below Summerfield's 0.4.
Schmucker gives $p_{sep} = 27.8$ kPa, above the ideal $p_e$. The RS-25 at sea
level is operating right at the edge of flow separation, and the ideal attached
-flow $C_f$ formula does not describe it. This is not academic: the RS-25's
start-transient side loads are a documented design driver, and the nozzle
exhibits restricted-shock separation during start [OMK05] [Ostlund02].

### WE4 — Merlin 1D: $C_f$ sea level versus vacuum, checked against the datasheet

**The question.** SpaceX publishes $I_{sp} = 282$ s SL and 311 s vacuum for the
sea-level Merlin 1D, with $p_c = 9.7$ MPa and $\varepsilon = 16$
[_verify-liquid; company figures, not independently verified]. Since $c^*$ and
$\dot m$ are identical in both conditions, the *ratio* of those two numbers
must equal the ratio of the two thrust coefficients — and $C_f$ depends on
nothing but $\gamma$, $\varepsilon$ and $p_a/p_c$. So the ratio is a check we
can perform without knowing anything about SpaceX's combustion.

**Compute.** $\gamma = 1.20$ (LOX/RP-1), $\varepsilon = 16$:
$M_e = 3.6044$, $p_e = 65.67$ kPa.

The momentum term (which is the same in both cases, since it depends only on
$\gamma$ and $p_e/p_c$) is 1.68875. Then:

$$C_{f,SL} = 1.68875 + \frac{65\,672 - 101\,325}{9.7\times10^6}\times16 = 1.68875 - 0.05881 = \mathbf{1.6299}$$
$$C_{f,vac} = 1.68875 + \frac{65\,672 - 0}{9.7\times10^6}\times16 = 1.68875 + 0.10833 = \mathbf{1.7971}$$

The difference between them is exactly $p_a\varepsilon/p_c = 101\,325\times16/9.7\times10^6
= 0.16714$, which is the check to run before trusting either number.

$$\frac{C_{f,vac}}{C_{f,SL}} = \frac{1.7971}{1.6299} = 1.1025$$

**Published ratio:** $311/282 = 1.1028$.

**Agreement to 0.03 %.** That is not luck. It is the statement that SpaceX's
two $I_{sp}$ figures are internally consistent with a single chamber and a
16:1 nozzle, and it lets us extract the implied characteristic velocity two
independent ways:

$$c^*_{SL} = \frac{I_{sp,SL}\,g_0}{C_{f,SL}} = \frac{282 \times 9.80665}{1.6299} = 1\,697\ \mathrm{m/s}$$
$$c^*_{vac} = \frac{311 \times 9.80665}{1.7971} = 1\,697\ \mathrm{m/s}$$

Both give 1 697 m/s. Against an ideal LOX/RP-1 $c^*$ of 1 759 m/s (WE1), that
implies $\eta_{c^*} = 1697/1759 = 0.965$ — a very believable number for a
mature gas-generator kerolox engine, and note that this efficiency also
silently absorbs $\eta_{C_f}$, since we used the ideal $C_f$. So 0.965 is
really $\eta_{ov}$, and the true $\eta_{c^*}$ is a little higher.

**Now the part that does not check out.** The same source gives Merlin 1D
thrust as 845 kN SL and **981 kN vacuum**. Thrust ratio $981/845 = 1.161$,
which is *not* 1.1025. Since $\dot m$ is the same in both conditions,
$F_{vac}/F_{SL}$ must equal $I_{sp,vac}/I_{sp,SL}$ exactly. It does not, by
5 %. Work it the other way: $F_{vac} - F_{SL} = p_a A_e$ requires
$A_e = 136\,000/101\,325 = 1.342$ m², i.e. $D_e = 1.31$ m, and with
$A_t = F_{SL}/(C_{f,SL}p_c) = 0.0534$ m² that implies $\varepsilon = 25$, not
16.

**Verdict.** The 981 kN "vacuum" figure quoted against the sea-level Merlin is
not self-consistent with its own 282/311 s pair. `_verify-liquid` flags exactly
this: the Merlin Vacuum engine is *also* rated 981 kN, and the coincidence "is
a known source of confusion". The consistent set is $F_{SL} = 845$ kN,
$I_{sp,SL} = 282$ s, $I_{sp,vac} = 311$ s, which gives
$F_{vac} = 845\times1.1028 = 932$ kN. **Use 932 kN, or state that the 981 kN
figure is unverified.** [J]

**Sanity check on the method.** This is the single most valuable habit in the
module: given $p_c$, $\varepsilon$ and $\gamma$, you can compute $C_f$ and then
test any published $(F, \dot m, I_{sp})$ triple for internal consistency. Most
datasheets pass. The ones that fail usually fail because two different engine
variants got mixed in one table.

---

## 6. Real engines — why did they design it that way?

### Rocketdyne F-1 (1967–1973, Saturn V S-IC) — [H]

$\varepsilon = 16$, $p_c \approx 70$ bar (contested, 965–1 125 psia across
sources), $I_{sp} = 263$ s SL / 304 s vac, 6 770 kN SL, $\dot m = 2\,577$ kg/s
[_verify-liquid].

Back out $c^*$: at $\gamma = 1.21$, $\varepsilon = 16$, $p_c = 70$ bar,
$C_{f,SL} = 1.558$, so $c^* = 263\times9.80665/1.558 = 1\,655$ m/s. That is
$\eta \approx 0.94$ against the ideal 1 759 m/s — low, and honestly so: the
F-1 dumped fuel-rich gas-generator exhaust into the nozzle extension as a film
curtain, ran a heavily film-cooled chamber, and operated at a modest chamber
pressure where vaporisation is slower.

**Why $\varepsilon = 16$?** Sea-level optimum at 70 bar is $\varepsilon = 8.8$,
so the F-1 was designed nearly *twice* over-expanded at lift-off. The
alternatives available in 1960 were to sit at 9 (better lift-off thrust, worse
everything above 5 km) or to push past 20 (better altitude performance, but the
S-IC's five-engine cluster had a fixed base diameter and the outboard engines
gimballed). The five-engine packaging constraint on a 10 m stage is the real
reason, and 16 was the compromise that fitted. Check the separation margin:
$p_e = 45.9$ kPa, $p_e/p_a = 0.45$ — just above Summerfield's 0.4. They went as
far as they dared.

**Would a modern engineer do the same?** No — they would raise $p_c$. At
250 bar the same $\varepsilon = 16$ nozzle would be under-expanded at sea level
and the engine would be a third the size for the same thrust. The F-1's
limitation was never its nozzle; it was that 1960s turbomachinery and
combustion stability could not be trusted above ~70 bar in a chamber that size.

### Rocketdyne J-2 (1966–1975, S-II and S-IVB) — [H]

$\varepsilon = 27.5$, $p_c = 52.6$ bar, $I_{sp,vac} = 421$ s
[_verify-liquid]. Reconstructing at $\gamma = 1.20$: $C_{f,vac} = 1.851$, so
$c^* = 421\times9.80665/1.851 = 2\,230$ m/s against an ideal ~2 300 —
$\eta_{ov} \approx 0.97$, excellent for 1965.

**Why only $\varepsilon = 27.5$ on a vacuum-only engine?** Because the S-IVB
interstage was that wide. The verification file is explicit: "$\varepsilon =
27.5$ is small for a vacuum engine because the S-IVB interstage constrained the
nozzle." Going to $\varepsilon = 60$ would have bought roughly 15 s. The
alternatives in 1962 were an extendible nozzle (unproven, and the deployment
mechanism is a single-point failure ahead of translunar injection — nobody was
going to sign that) or a wider interstage (structural mass on the second stage,
paid for at the worst possible mass ratio). They took the 15 s hit.

**Would a modern engineer do the same?** No. The RL10B-2 proved the extendible
carbon–carbon nozzle in 1998 and it is now routine on SLS's ICPS. The
technology did not exist in 1962.

### Aerojet Rocketdyne RS-25 (1981– , Shuttle and SLS) — [H][M]

$p_c = 206.4$ bar, $\varepsilon = 69$ (manufacturer) or 77.5 (widely quoted),
$I_{sp} = 366$ s SL / 452.3 s vac [_verify-liquid].

**Why a 69:1 nozzle on an engine that starts at sea level?** Because the
Shuttle's three main engines burned for 8.5 minutes and spent most of it above
30 km, where $\varepsilon^{opt}$ exceeds 300. The sea-level performance was
never the point; the SSME was effectively an upper-stage engine that happened
to be lit on the pad, with the SRBs providing lift-off thrust. WE3 showed the
consequence: at sea level $p_e/p_a = 0.22$, below every classical separation
criterion, and the engine lives with restricted-shock separation and
significant start-transient side loads. That was a *chosen* problem, mitigated
with structure and a carefully sequenced start, in exchange for 452 s in
vacuum.

**Would a modern engineer do the same?** Yes, given the same architecture —
and they did: SLS flies the identical engine expendably. The interesting modern
critique is not the nozzle but the cycle: the RS-25's reusable staged
combustion cost so much per flight that SLS throws it away, which
`_verify-liquid` calls "a fair verdict on the reusability premise".

### SpaceX Merlin 1D and Merlin Vacuum (2013– ) — [M]

$p_c = 97$ bar (company figure), $\varepsilon = 16$ SL / 165 MVac,
$I_{sp} = 282$/311 s SL engine, 348 s MVac [_verify-liquid; company claims].

**Why two nozzles instead of one compromise?** Because the two flight regimes
are 165× apart in ambient pressure and the same powerhead can serve both. The
MVac takes the identical turbopump and chamber, adds a radiatively cooled
niobium extension, and trades chamber-pressure headroom for nozzle area rather
than for thrust — which is why both engines quote nearly the same vacuum
thrust and why that coincidence has confused so many tables (WE4). The
alternative — one engine at, say, $\varepsilon = 40$ — would separate violently
at lift-off.

**Why $\varepsilon = 16$ and not 12 for the booster?** Falcon 9's first stage
now flies a boostback and re-entry burn at altitude, so the fleet-average
back-pressure over a mission is well below sea level. 16 is over-expanded on
the pad by design. Note Merlin 1C used 14.5 and Merlin 1D moved to 16
[_verify-liquid] — the direction of the change tells you which way the
trajectory-averaged optimum pointed.

**Would a modern engineer do the same?** They are; this is current practice.
The one thing a clean sheet would change is the cycle — GG at 97 bar caps
$I_{sp}$, and both Raptor and BE-4 went to closed cycles.

### NPO Energomash RD-180 (2000–2024, Atlas III/V) — [H][M]

$p_c = 267$ bar, $\varepsilon = 36.87$, $I_{sp} = 311$ s SL / 338 s vac,
$\dot m = 1\,250$ kg/s [_verify-liquid].

**Why can a booster engine carry $\varepsilon = 36.9$?** Because 267 bar moves
the sea-level optimum up to about $\varepsilon = 30$. High chamber pressure
does not merely raise thrust density; it *buys you nozzle area* at sea level.
Check: $p_e = 61.8$ kPa, $p_e/p_a = 0.61$ — comfortably attached, less
over-expanded than the F-1 at half the area ratio. This is the cleanest
demonstration in the whole engine database of why chamber pressure is worth
chasing.

Reconstructing $c^*$ at $\gamma = 1.20$: $C_{f,SL} = 1.7375$, so
$c^* = 311\times9.80665/1.7375 = 1\,755$ m/s — near the ideal 1 759 for
kerolox, meaning $\eta_{ov} \approx 0.998$ on this crude model, which is a
warning that the model's assumed $\gamma$ and $T_0$ are not right for an
oxidiser-rich staged-combustion engine at 267 bar. Take the lesson: when a
reconstruction returns an efficiency above about 0.99, your thermochemistry
inputs are wrong, not the engine.

**Would a modern engineer do the same?** Yes, and the West spent twenty years
trying. The blocker was never the nozzle or the cycle diagram — it was the
inert enamel coating on every surface touching hot oxygen-rich gas
[_verify-liquid]. BE-4 and Raptor took different routes (ORSC methane and
full-flow methane respectively) rather than reproduce it.

### Aerojet Rocketdyne RL10B-2 (1998– , Delta III/IV, SLS ICPS) — [M]

$\varepsilon = 285$ deployed / 77 stowed (contested; Wikipedia says 280),
$I_{sp,vac} = 465.5$ s — the highest of any flown chemical engine
[_verify-liquid]. $p_c$ is **not reliably published**; Encyclopedia
Astronautica's ~44 bar is low-confidence and should not be printed as fact.

**Why the extendible nozzle?** Look again at the vacuum $C_f$ curve: from
$\varepsilon = 77$ to 285 is worth roughly 3 % in $C_f$, about 30 s of
$I_{sp}$ — exactly what the verification file quotes. For an upper stage that
is an enormous payload gain. But a 285:1 nozzle at 110 kN thrust is 2.1 m
across and 2.5 m long, and no interstage was going to accommodate it stowed.
The 3D carbon–carbon extension solves the packaging problem and nothing else.
**The cost:** a deployment mechanism that is a single-point failure with no
meaningful abort mode. That is the trade, stated plainly.

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### Trade-offs

**Chamber pressure.** Up: smaller engine for the same thrust, higher
$\varepsilon^{opt}$ at sea level, better thrust-to-weight. Down: heat flux
scales roughly as $p_c^{0.8}$ (Bartz, Module 10), pump discharge pressure and
turbine power scale linearly or worse, and the cycle may not close. $c^*$
itself is nearly independent of $p_c$ — chamber pressure buys you *size and
$C_f$*, not chemical energy.

**Expansion ratio.** Up: better $I_{sp}$ in vacuum, monotonically. Down: mass,
length, cooled surface area, separation risk at low altitude, and packaging.
The $C_f$ curve's flatness near its peak means the sea-level penalty for
over-expanding is small right up until separation, at which point it becomes a
structural problem rather than a performance one.

**Contraction ratio and $L^*$.** Up: better combustion efficiency, lower
chamber Mach number, lower stagnation-pressure loss. Down: mass, cooled area,
and residence time long enough to invite low-frequency combustion instability
(Module 15). The modern trend is toward shorter chambers as injector design has
improved.

**Divergence half-angle.** Up: shorter, lighter nozzle. Down: $\lambda$ falls
as $(1+\cos\alpha)/2$. The bell nozzle exists to break this trade: an 80 %
bell is shorter than a 15° cone *and* has better $\lambda$ [Rao58].

### Failure modes

**Flow separation → side loads.**
*Mechanism:* over-expanded operation drives the wall pressure below the
separation limit; the boundary layer detaches asymmetrically and unsteadily.
*Symptom:* lateral force and bending moment on the nozzle and gimbal, visible
in the plume as an asymmetric shock diamond pattern near the exit.
*Evidence:* strain gauges on the nozzle, gimbal-actuator load traces, high-speed
plume video, wall static taps showing a pressure plateau at ~$p_a$.
*Fix:* reduce $\varepsilon$, sequence the start to pass through the separation
regime quickly, stiffen the structure, or use a dual-bell contour that fixes
the separation line at a designed step. [OMK05]

**Throat erosion.**
*Mechanism:* thermal and chemical attack on the throat (ablatives, graphite,
solid-motor nozzles) enlarges $A_t$.
*Symptom:* $p_c$ falls through the burn at constant $\dot m$; $\varepsilon$ and
$C_f$ fall with it; measured $c^*$ appears to fall if you use the cold $A_t$.
*Evidence:* the $p_c$–time trace droops; post-test throat measurement.
*Fix:* better throat material, or design for it — solid motors routinely
predict erosion and accept the $p_c$ droop.

**$c^*$ shortfall from mixture-ratio maldistribution.**
*Mechanism:* injector elements deliver unequal $O/F$; local zones burn off-peak.
*Symptom:* $\eta_{c^*}$ 3–6 % low with a normal $\eta_{C_f}$; often accompanied
by wall streaking.
*Evidence:* $c^*$ reduction from $p_c A_t/\dot m$; cold-flow patternation of
the injector; post-test wall discoloration in a repeatable circumferential
pattern.
*Fix:* injector element resizing, orifice-diameter tolerance control, changing
the element pattern near the wall.

**Instrumentation error masquerading as a performance problem.**
*Mechanism:* a $p_c$ tap in the wrong location, a long gas-filled sense line, a
flowmeter with a two-phase inlet, or a load cell with an unaccounted line-force
tare.
*Symptom:* efficiencies that are impossible (over 1.0) or that change when
nothing about the hardware changed.
*Evidence:* redundant transducers disagreeing; a thrust measurement that does
not close against $\dot m \times c$; a $c^*$ that shifts with feed-line
pressure.
*Fix:* redundant instrumentation and a documented uncertainty budget
(Module 18). **Check this before touching hardware.**

### Materials

Nothing in this module is a materials problem except one thing: **$A_t$ must
not change.** The performance factorisation is only as good as the throat area,
so throat materials are selected for dimensional stability under heat flux
rather than for strength — copper alloys (NARloy-Z on the RS-25, GRCop-84 in
modern AM chambers [GRCop] [GradlAM]) because their conductivity keeps the wall
cool, or graphite/carbon–carbon in solid nozzles because they erode slowly and
predictably. The nozzle extension, which carries almost no heat load beyond
$\varepsilon\approx 10$, can be much cheaper: radiatively cooled niobium
(Merlin Vacuum), carbon–carbon (RL10B-2), or gas-generator-exhaust film cooling
(F-1).

### Manufacturing

Throat area tolerance is the tightest performance-driving dimension on the
engine. A 1 % error in $A_t$ is a 1 % error in thrust and in $\dot m$
simultaneously; at fixed feed system that shows up as a mixture-ratio shift
too. Throats are machined and inspected to a few thousandths of an inch and
measured again after every hot fire. Where the throat is a brazed tube-wall
assembly (F-1, J-2, RL10) rather than a milled-channel liner (RS-25, Merlin),
achieving that tolerance is a braze-fixturing problem, not a machining one.

### Testing

What is measured on every performance test, and with what:

| quantity | instrument | typical uncertainty [E] |
|---|---|---|
| thrust | load cell(s) in the thrust stand, calibrated in situ | 0.25–0.5 % |
| chamber pressure | multiple flush-mounted or short-tapped transducers | 0.3–0.5 % |
| propellant mass flow | turbine or Coriolis meters, both circuits | 0.5–1 % each |
| throat area | pre- and post-test dimensional inspection | 0.2–0.5 % |
| ambient pressure | barometer / cell pressure | negligible |

Propagating those through $c^* = p_c A_t/\dot m$ by root-sum-square gives about
0.8–1.2 % uncertainty on $c^*$ — which is the same size as the differences
engineers argue about. Module 18 does this properly. The practical consequence:
**a 1 % change in $\eta_{c^*}$ between two tests is not necessarily real**, and
programmes that chase it without an uncertainty budget waste a great deal of
money.

The characteristic shape of a good test trace: $p_c$ rises through the start
transient with a small overshoot, settles flat within 1–2 %, and the thrust
trace follows it with the same shape. If thrust and $p_c$ *diverge* during a
run — thrust falling while $p_c$ holds — you are watching $C_f$ degrade, which
means the nozzle: separation, erosion, or a leak. If both fall together, $A_t$
is growing or $\dot m$ is falling. **The two traces together diagnose the
engine; either one alone does not.**

---

## 8. Misconceptions and what engineers actually care about

**"Rockets push against the air."** No. The thrust equation contains $p_a$ only
as a *subtraction*. Removing the atmosphere increases thrust by $p_a A_e$ —
about 10 % for a typical booster. A rocket in vacuum works better, not worse.

**"Specific impulse in seconds depends on gravity."** No. $g_0$ in
$I_{sp} = F/(\dot m g_0)$ is a defined constant, 9.80665 m/s², not local
gravity. $I_{sp}$ is the same on Mars, in orbit, and on a test stand.

**"$c$ is the exhaust velocity."** Only when perfectly expanded. $c = F/\dot m$
is an *effective* velocity that folds in pressure thrust. In an over-expanded
nozzle at sea level, $c < u_e$ and no gas is moving at $c$.

**"Higher $\gamma$ means better performance."** Backwards. $C_{f,max}$ falls
with $\gamma$: 2.25 at $\gamma = 1.2$ versus 1.81 at $\gamma = 1.4$. A gas with
more internal energy modes has more energy the nozzle can convert. This is one
reason monatomic working fluids (helium cold gas, $\gamma = 1.67$) are poor
per unit mass despite their low molar mass.

**"$c^*$ depends on chamber pressure."** Only weakly and indirectly. $c^*$
depends on $\sqrt{T_0/\mathcal{M}}$ and $\Gamma(\gamma)$; $p_c$ enters only
through the mild pressure dependence of the equilibrium composition (higher
$p_c$ suppresses dissociation slightly, raising $T_0$ and $\mathcal{M}$
together). Raising $p_c$ from 70 to 200 bar buys perhaps 1–2 % of $c^*$. What
it really buys is a smaller engine and a bigger sea-level $\varepsilon^{opt}$.

**"Bigger expansion ratio is always better in vacuum."** True for $C_f$, false
for the vehicle. Beyond some $\varepsilon$ the nozzle's mass costs more
$\Delta v$ than its $I_{sp}$ gains, and the bell has to fit in the interstage.
The J-2 at $\varepsilon = 27.5$ is the canonical case of packaging winning.

**"$\eta_{c^*}$ near 1.0 means a great injector."** It might mean your ideal
reference is wrong. If a reconstruction returns $\eta > 0.99$, suspect the
assumed $\gamma$, $T_0$ or $\mathcal{M}$ before congratulating anyone (see the
RD-180 case in §6).

**"$L^*$ is a physical length in the chamber."** It is a volume divided by an
area and has units of length, but it is not the distance from anything to
anything. Two chambers with identical $L^*$ and very different shapes can
perform very differently.

### What engineers actually care about

1. **$\eta_{c^*}$ trend across a test series.** It is the single most sensitive
   indicator that something changed in the injector, the propellant conditions,
   or the instrumentation. Everybody plots it after every run.
2. **Whether the nozzle is separated at the current operating point.** Because
   separation is a structural and gimbal-load problem, not just a performance
   one, and because throttling moves you across the boundary.
3. **Throat area, now and after the run.** It sits in the denominator of $c^*$
   and the numerator of thrust. A programme that does not measure it after
   every firing does not know its own performance.
4. **Whether the datasheet is self-consistent.** Given $p_c$, $\varepsilon$,
   $F$ and $\dot m$, do $c^*$ and $C_f$ both land in believable ranges? This
   two-minute check catches most bad numbers in secondary sources, and it is
   the fastest way to look competent in a design review.
5. **The trajectory-averaged $I_{sp}$, not the sea-level or vacuum number.**
   For a first stage neither endpoint is what the vehicle actually experiences,
   and the nozzle is sized against the integral.

---

## 9. Mastery levels

**Level 1 — Familiarity.** You can state the thrust equation and explain both
terms in plain language; explain what $c^*$ and $C_f$ separately measure and
why splitting them is useful; say what optimum expansion means and why no
fixed nozzle achieves it over a whole ascent; quote that $I_{sp}$ is 250–320 s
for kerolox, 420–465 s for hydrolox; name the F-1 and the RS-25 as the
extremes of expansion-ratio philosophy.

**Level 2 — Working engineering knowledge.** You can compute $\Gamma(\gamma)$,
$c^*$, $C_f$, $A_t$, $\dot m$, $\varepsilon^{opt}$ and $I_{sp}$ from
$\gamma$, $T_0$, $\mathcal{M}$, $p_c$, $\varepsilon$ and $p_a$, with correct
units, without a chart; reduce hot-fire data to $\eta_{c^*}$ and $\eta_{C_f}$
and state which subsystem each implicates; check a nozzle for separation with
both Summerfield and Schmucker; size a chamber from $L^*$ and $\varepsilon_c$;
read a $C_f$-versus-$\varepsilon$ chart and place a given engine on it.

**Level 3 — Interview mastery.** Given an unfamiliar engine's datasheet, you
can back out its implied $c^*$ and $\eta_{ov}$, judge whether the numbers are
self-consistent, and say what you would measure to confirm it. Given a test
result that is 4 % below prediction, you can lay out the diagnostic tree —
which measurements distinguish a chamber problem from a nozzle problem from an
instrumentation problem, and in what order you would take them. You can argue
both sides of an expansion-ratio decision for a stated mission, quantify the
loss, and name a historical programme that faced the same choice and what they
did.

---

## 10. Problems

### Conceptual

**P1.** A test engine is fired first on a sea-level stand and then in an
altitude chamber at 5 kPa, with identical $p_c$, $\dot m$ and hardware.
Which of $c^*$, $C_f$, $I_{sp}$, $\dot m$ and $A_t$ change, and why? For each
one that changes, say whether it goes up or down.

**P2.** Explain, without writing the thrust equation, why the pressure-thrust
term is not "the exhaust pushing on the atmosphere". Describe an alternative
control volume that gives the same thrust with no exit-plane pressure term at
all, and say what you would have to know to evaluate it.

**P3.** Two engines have identical $I_{sp}$. Engine A has $\eta_{c^*} = 0.99$
and $\eta_{C_f} = 0.93$; engine B has $\eta_{c^*} = 0.93$ and
$\eta_{C_f} = 0.99$. You have a fixed budget to improve one of them by 2 % in
$I_{sp}$. Which engine do you choose and what do you change? Justify in terms
of what each efficiency contains.

**P4.** $\Gamma(\gamma)$ varies by only about 3 % across all realistic
combustion gases. Explain physically why $c^*$ is therefore essentially a
statement about $\sqrt{T_0/\mathcal{M}}$, and explain why a higher $T_0$ is
worth less than a proportionally lower $\mathcal{M}$.

**P5.** A colleague proposes doubling the expansion ratio of a first-stage
engine to gain vacuum $I_{sp}$, arguing that the sea-level $C_f$ penalty is
"only about 1 %". Give three separate reasons this may still be a bad idea,
at least one of which is not a performance argument.

**P6.** Why does the thrust coefficient contain no propellant chemistry, and
why does the characteristic velocity contain no nozzle geometry downstream of
the throat? What single assumption makes both statements true, and what would
break them?

**P7.** A solid motor and a liquid engine both quote $\eta_{C_f} = 0.94$. Name
the loss mechanism that is likely dominant in each case and explain why they
differ.

### Calculation

**P8.** For a combustion gas with $\gamma = 1.15$, $\mathcal{M} = 21.0$ kg/kmol
and $T_0 = 3\,450$ K: (a) compute $R$ and $\Gamma(\gamma)$; (b) compute
$c^*_{ideal}$; (c) for $p_c = 8.0$ MPa and a throat diameter of 120 mm,
compute the ideal $\dot m$; (d) repeat (c) with $\eta_{c^*} = 0.94$ and explain
why the real mass flow is *higher*, not lower, than the ideal.

**P9.** A vacuum engine uses $\gamma = 1.22$, $T_0 = 3\,300$ K,
$\mathcal{M} = 22.0$ kg/kmol, $p_c = 4.0$ MPa, $\varepsilon = 60$, and must
produce 100 kN in vacuum. Compute $c^*$, $M_e$, $p_e$, $C_{f,vac}$,
$I_{sp,vac}$, $A_t$, $D_t$, $A_e$, $D_e$ and $\dot m$. Assume ideal
performance.

**P10.** Using `reference/_verify-liquid.md`, read off $p_c$, $\varepsilon$ and
the appropriate $I_{sp}$ for **three** engines: the **F-1** (sea level), the
**RS-25** at 109 % (vacuum, using the manufacturer's geometric $\varepsilon$),
and the **RD-180** (sea level). Assuming $\gamma = 1.21$ for the F-1 and 1.20
for the RD-180 and 1.19 for the RS-25, compute $C_f$ for each and reconstruct
the implied $c^*$. Tabulate your three results, state which propellant
combination each belongs to, and comment on whether the two kerolox values are
consistent with each other. Carry every caveat the verification file attaches
to the numbers you used.

**P11.** For the RS-25, repeat the $c^*$ reconstruction of P10 using
$\varepsilon = 77.5$ instead of 69. By what percentage does the implied $c^*$
change? What does this tell you about using performance data to settle the
expansion-ratio dispute in the literature?

**P12.** An engine has $p_c = 70$ bar and $\gamma = 1.21$. (a) Compute the
sea-level optimum expansion ratio. (b) Compute $C_{f,SL}$ at that optimum and
at $\varepsilon = 16$. (c) Compute $C_{f,vac}$ at both. (d) The engine is a
first stage that spends 20 % of its burn near 5 km ($p_a = 54.0$ kPa) and 80 %
near 15 km ($p_a = 12.0$ kPa). Compute $C_f$ at both altitudes for both area
ratios, form the burn-time-weighted average, and recommend one. Also check
the separation margin of each at sea level.

**P13.** Continuing P8: with the throat from P8(c) and $L^* = 1.05$ m, compute
the chamber volume. Then with a contraction ratio of 2.5, compute the chamber
diameter and estimate the cylindrical chamber length, stating the assumption
your estimate makes and the direction of its error.

**P14.** A hot fire gives $p_c = 5.50$ MPa, $D_t = 75.0$ mm,
$\dot m = 14.6$ kg/s, $F = 36.5$ kN at sea level, $\varepsilon = 12$. The ideal
reference is $\gamma = 1.20$, $T_0 = 3\,500$ K, $\mathcal{M} = 22.5$ kg/kmol.
Compute $c^*_{meas}$, $c^*_{ideal}$, $\eta_{c^*}$, $C_{f,meas}$,
$C_{f,ideal}$, $\eta_{C_f}$, $\eta_{ov}$ and $I_{sp,meas}$. Then check the
nozzle for separation and say whether your $\eta_{C_f}$ is trustworthy.

**P15.** A conical nozzle has a 17.5° half-angle. (a) Compute $\lambda$.
(b) If the boundary-layer loss is 1.0 % and the kinetic loss is 1.5 %, and you
multiply the three factors, what is $\eta_{C_f}$? (c) A bell contour recovers
80 % of the divergence loss for the same length. What is the new $\eta_{C_f}$,
and how many seconds of $I_{sp}$ does that buy on an engine whose baseline
$I_{sp,vac}$ is 340 s?

### Engineering reasoning

**P16.** During a 60 s hot fire, the $p_c$ trace is flat to within 0.5 %, but
the thrust trace falls steadily by 3 % over the run. Propellant flows are
constant. Diagnose. Give at least three candidate mechanisms, say what each
would do to $c^*_{meas}$ and $C_{f,meas}$, and state the one additional
measurement that would discriminate between them.

**P17.** A second engine of the same design shows a $p_c$ trace that droops
4 % over the run while thrust falls 4 % and propellant flows hold constant.
Diagnose this one, and explain why it is a different fault from P16.

**P18.** You are handed a datasheet for an unfamiliar upper-stage engine:
$F_{vac} = 65$ kN, $I_{sp,vac} = 462$ s, $p_c = 60$ bar, $\varepsilon = 130$,
LOX/LH2. Without any thermochemistry code, determine whether these numbers are
mutually consistent. Show the check, state your assumed $\gamma$, and say what
range of implied $c^*$ you would accept before declaring the datasheet
suspect.

**P19.** An engine is throttled from 100 % to 40 % of rated thrust by reducing
$p_c$ at constant $A_t$ and constant mixture ratio. Describe qualitatively
what happens to $c^*$, $C_f$, $I_{sp}$ and $\varepsilon^{opt}$, and identify
the operating point at which you would start worrying about the nozzle.
Support the worry with a numerical separation check for
$p_{c,100\%} = 100$ bar, $\varepsilon = 25$, $\gamma = 1.20$.

**P20.** Two organisations report $I_{sp}$ for the same engine and disagree by
1.5 %. Neither has made an arithmetic error. List four distinct, legitimate
reasons the numbers can differ, and say what documentation you would ask for
to reconcile them.

### Mini trade study

**P21.** You are setting the expansion ratio for the single engine of a small
launcher's **second stage**.

*Engine constraints:* $p_c = 55$ bar, LOX/RP-1 with $\gamma = 1.21$,
$T_0 = 3\,550$ K, $\mathcal{M} = 23.0$ kg/kmol, $\eta_{c^*} = 0.96$, required
$F_{vac} = 120$ kN. The stage ignites at 65 km, so treat $p_a = 0$ throughout.

*Packaging constraints:* interstage inner diameter **1.45 m**; the length
available for the engine from the throat plane aft is **2.00 m** in the stowed
configuration.

*Mass model:* estimate the bell as a 15° cone frustum from throat to exit and
charge **18 kg/m²** of internal bell surface area. Ignore the mass of
everything upstream of the throat (it is identical in all options).

*Mission model:* the stage carries **4 500 kg** of propellant, has a burnout
mass of **800 kg excluding the nozzle**, and must deliver **$\Delta v = 3\,600$
m/s**. Payload is whatever mass the stage can carry while still closing that
$\Delta v$.

Options:
- **A:** $\varepsilon = 40$, fixed bell.
- **B:** $\varepsilon = 80$, fixed bell.
- **C:** $\varepsilon = 130$, fixed bell.
- **D:** $\varepsilon = 130$ deployed, stowed at $\varepsilon = 55$ via an
  extendible carbon–carbon extension, adding **22 kg** of mechanism. The
  stowed length is that of the $\varepsilon = 55$ bell; the deployed exit
  diameter is that of the $\varepsilon = 130$ bell.

For each option compute $C_{f,vac}$, $I_{sp,vac}$, $A_t$, $D_t$, $D_e$, bell
length, bell surface area, nozzle mass, whether it fits both packaging
constraints, and the payload it delivers. Then recommend one, quantify the
payload difference against the runner-up, state the reliability argument
explicitly, and say what single change to the constraints would flip your
recommendation.

---

## 11. Quiz (100 points)

**Q1 (8).** A rocket engine produces more thrust in vacuum than at sea level
because:
(a) there is no air resistance on the exhaust;
(b) the term $(p_e - p_a)A_e$ increases when $p_a$ falls;
(c) the exhaust velocity increases in vacuum;
(d) the mass flow increases in vacuum.
Choose one and justify in one sentence.

**Q2 (8).** Which of these changes affects $C_f$ but not $c^*$?
(a) raising the chamber temperature; (b) changing the mixture ratio;
(c) adding a nozzle extension; (d) improving injector atomisation.

**Q3 (10).** Compute $\Gamma(\gamma)$ for $\gamma = 1.25$ to four decimal
places, and state the physical meaning of the group $\Gamma p_0 A_t/\sqrt{RT_0}$.

**Q4 (12).** An engine has $p_c = 120$ bar, $\varepsilon = 22$,
$\gamma = 1.20$. Compute $C_f$ at sea level and in vacuum, and the percentage
by which thrust increases from sea level to vacuum.

**Q5 (12).** A test gives $p_c = 9.0$ MPa, $A_t = 0.0125$ m²,
$\dot m = 62.0$ kg/s, $F = 208$ kN in vacuum. Compute $c^*$, $C_f$ and
$I_{sp}$. If the ideal $c^*$ is 1 900 m/s and the ideal $C_f$ is 1.90, compute
all three efficiencies and say which subsystem you would investigate.

**Q6 (10).** True or false, with one sentence of justification each:
(a) $I_{sp}$ in seconds is smaller on the Moon.
(b) A nozzle at its optimum expansion ratio has the maximum possible $C_f$ for
its $\gamma$.
(c) Doubling $A_t$ at fixed $p_c$ doubles thrust.
(d) $c^*$ can be measured without knowing $\gamma$ or $T_0$.

**Q7 (10).** Explain in no more than four sentences why a first-stage engine is
deliberately designed over-expanded at sea level, and state the physical limit
that stops the designer going further.

**Q8 (10).** A 15° conical nozzle is replaced by an 80 %-length bell of the same
expansion ratio. State what happens to: nozzle length, nozzle mass,
divergence loss, and boundary-layer loss. Which of the four is most uncertain
and why?

**Q9 (10).** [Judgment] A programme reports that $\eta_{c^*}$ improved from
0.951 to 0.958 after an injector change, and declares the change a success.
Give two reasons to withhold that judgment, and say what you would require
before accepting it.

**Q10 (10).** [Judgment] You must choose the chamber pressure for a new
methalox booster engine: 80 bar with a gas-generator cycle, or 250 bar with
oxidiser-rich staged combustion. Argue the case for each in terms of the
quantities in this module — $c^*$, $C_f$, $\varepsilon^{opt}$, $A_t$, heat flux
— and state which additional information would decide it.

---

## 12. Further reading

- **[SB §2–3]** — Sutton & Biblarz, *Rocket Propulsion Elements*. The canonical
  treatment of the thrust equation, $c^*$, $C_f$ and the $C_f$ charts. Read §3.3
  and §3.4 alongside this module; the $C_f$-versus-$\varepsilon$ figures are the
  ones every engineer has seen.
- **[HH §1, §4]** — Huzel & Huang, *Modern Engineering for Design of
  Liquid-Propellant Rocket Engines*. The design chain in §1-3 and the
  chamber-sizing correlations ($L^*$, contraction ratio) in §4, written from
  the perspective of people who actually built the F-1 and J-2.
- **[SP-125]** — the 1967 NASA predecessor of Huzel & Huang. Read it for the
  sizing worksheets and for a sense of how the calculation was organised before
  computers; the $L^*$ tables are the original source most later books quote.
- **[HP §11]** — Hill & Peterson. A cleaner, more academic derivation of the
  thrust equation and nozzle performance than Sutton, with better attention to
  the control-volume argument. Read it if §3.1 here felt like sleight of hand.
- **[ZH §4]** — Zucrow & Hoffman, *Gas Dynamics*. The choked-flow and
  area–Mach relations underlying $\Gamma(\gamma)$, done properly.
- **[SFS54]** — Summerfield, Foster & Swan on flow separation. The origin of
  the 0.4 criterion; short, and worth reading to see how thin the empirical
  basis of a rule everybody quotes actually is.
- **[Schmucker73]** and **[OMK05]** — modern separation criteria and the
  free-shock versus restricted-shock distinction. Read [OMK05] before you argue
  about side loads.
- **[Rao58]**, **[Rao60]** — the bell-nozzle contour. The reason $\lambda$ is
  not $(1+\cos\alpha)/2$ on any engine built since 1960.
- **[CPIA-246]** — the JANNAF performance prediction and evaluation manual. The
  standard for how efficiencies are defined and combined; read it when someone
  disputes your $\eta_{c^*}$.
- **[CEA]**, **[RP-1311]** — Gordon & McBride. Where $T_0$, $\mathcal{M}$ and
  $\gamma$ come from, and the subject of Module 04.
