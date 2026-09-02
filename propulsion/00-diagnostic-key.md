# Diagnostic Entrance Exam — Answer Key

Key for [`00-diagnostic-exam.md`](00-diagnostic-exam.md). Contains full
worked solutions, the reasoning a grader wants to see, why each wrong
multiple-choice option is wrong, a section-by-section scoring guide, and the
mapping from score to study plan.

Constants used throughout: $g_0 = 9.80665\ \mathrm{m/s^2}$,
$R_u = 8314.46\ \mathrm{J/(kmol\,K)}$, $p_{amb,SL} = 101325\ \mathrm{Pa}$.

Working gas for Sections A–C and E3:
$\gamma = 1.2$, $\mathcal{M} = 22\ \mathrm{kg/kmol}$,
$T_0 = 3400\ \mathrm{K}$, $p_c = 7\ \mathrm{MPa}$.

Numbers are carried at full precision internally and reported to 4
significant figures; small last-digit differences from your own arithmetic
are not errors.

---

## Section A — Thermodynamics (15 points)

### A1 (2 pts) — **(c)** $378\ \mathrm{J/(kg\,K)}$

$$R = \frac{R_u}{\mathcal{M}} = \frac{8314.46\ \mathrm{J/(kmol\,K)}}{22\ \mathrm{kg/kmol}} = 377.9\ \mathrm{J/(kg\,K)}$$

**Why the others are wrong.**
(a) $8.314\ \mathrm{J/(kg\,K)}$ is $R_u$ with its units mangled — a factor
of $1000\mathcal{M}$ out; it is the universal constant in $\mathrm{kJ}$
units read as a specific one.
(b) $37.8$ is a decimal-place slip (dividing 8314 by 220).
(d) $287\ \mathrm{J/(kg\,K)}$ is air. Rocket exhaust has a *lower* molar
mass than air ($\mathcal{M}_{air} \approx 29$), so its $R$ must be
*higher*, not lower. Picking (d) is the classic reflex answer and it is
diagnostic: it means you reached for a memorised number instead of
$R_u/\mathcal{M}$. [F]

### A2 (2 pts) — **(a)** $T_0$ constant, $p_0$ falls, $s$ rises

This is Fanno flow. Adiabatic and no shaft work ⇒ the steady-flow energy
equation gives $h_0 = h + V^2/2 = \mathrm{const}$, so $T_0$ is constant for
a calorically perfect gas. Friction is irreversible, so $s$ rises. For an
adiabatic process, $s$ and $p_0$ are linked by
$$s_2 - s_1 = -R\ln\frac{p_{0,2}}{p_{0,1}}$$
so $s\uparrow \Leftrightarrow p_0\downarrow$. **Stagnation pressure loss is
the currency of irreversibility in adiabatic flow.** [F]

(b) violates the energy equation. (c) contradicts the identity above — you
cannot have $s$ rise adiabatically without losing $p_0$. (d) would require
heat addition or work input.

### A3 (4 pts)

**(a) (2 pts)**

$$c_p = \frac{\gamma R}{\gamma - 1} = \frac{1.2 \times 377.93\ \mathrm{J/(kg\,K)}}{0.2} = 2268\ \mathrm{J/(kg\,K)}$$

$$c_v = \frac{R}{\gamma - 1} = \frac{377.93\ \mathrm{J/(kg\,K)}}{0.2} = 1890\ \mathrm{J/(kg\,K)}$$

Check: $c_p - c_v = 2267.6 - 1889.7 = 377.9\ \mathrm{J/(kg\,K)} = R$ ✓.

*Sanity check:* $c_p$ for this exhaust is more than double air's
$1005\ \mathrm{J/(kg\,K)}$, which is exactly why a low-molar-mass, high-$c_p$
exhaust carries so much enthalpy per kilogram. [F]

**(b) (2 pts)** Adiabatic, no work ⇒ $h_0 = h + V^2/2$ is conserved:

$$V = \sqrt{2c_p(T_0 - T)} = \sqrt{2 \times 2267.58\ \tfrac{\mathrm{J}}{\mathrm{kg\,K}} \times (3400 - 2100)\ \mathrm{K}}$$
$$V = \sqrt{5.896\times10^{6}\ \mathrm{J/kg}} = 2428\ \mathrm{m/s}$$

**Assumption required (1 of the 2 marks):** the flow is **adiabatic** and
**calorically perfect** ($c_p$ constant between 2100 K and 3400 K) with no
shaft work. Note that it need *not* be isentropic — the energy equation
holds across friction and even across a shock. Students who wrote
"isentropic" get the mark but should note the distinction; students who
wrote nothing lose it.

*Watch the units:* $\mathrm{J/kg} = \mathrm{m^2/s^2}$. If you did not see
that, you cannot take the square root confidently.

### A4 (4 pts)

**(a) (2 pts)** For a calorically perfect gas between any two states:

$$s_e - s_0 = c_p \ln\frac{T_e}{T_0} - R\ln\frac{p_e}{p_c}$$

$$= 2267.58\ln\!\left(\frac{1450}{3400}\right) - 377.93\ln\!\left(\frac{26630}{7\times10^{6}}\right)$$

$$= 2267.58 \times (-0.8522) - 377.93 \times (-5.5717)$$

$$= -1932\ \mathrm{J/(kg\,K)} + 2106\ \mathrm{J/(kg\,K)} = +173.2\ \mathrm{J/(kg\,K)}$$

Positive, as the second law requires for an adiabatic device. Roughly 7.6 %
of $c_p$.

**(b) (2 pts)** Isentropic expansion to the same $p_e$:

$$T_{e,s} = T_0\left(\frac{p_e}{p_c}\right)^{\frac{\gamma-1}{\gamma}} = 3400 \times \left(\frac{26630}{7\times10^{6}}\right)^{0.1667}$$

$$\frac{p_e}{p_c} = 3.804\times10^{-3}; \quad (3.804\times10^{-3})^{0.16667} = 0.3951$$

$$T_{e,s} = 3400\ \mathrm{K} \times 0.3951 = 1343\ \mathrm{K}$$

$$\eta_n = \frac{T_0 - T_e}{T_0 - T_{e,s}} = \frac{3400 - 1450}{3400 - 1343.4} = \frac{1950}{2056.6} = 0.948$$

**94.8 %** — a realistic nozzle efficiency. [E] The real exit is *hotter*
than the isentropic exit: the enthalpy that friction and non-equilibrium
chemistry did not convert to kinetic energy stayed in the gas as heat.

### A5 (3 pts) — model answer

**(i) Sources of entropy generation** (1.5 pts, need at least three):
viscous dissipation in the boundary layer on the nozzle wall; heat transfer
across the finite temperature difference from core gas to the cooled wall
(an externally irreversible process from the gas's point of view); shock
waves and internal compression from non-ideal contour design; finite-rate
chemistry — recombination reactions (e.g. $\mathrm{OH + H \to H_2O}$)
proceeding irreversibly at a finite rate rather than in equilibrium, and in
the limit freezing out entirely; mixing of non-uniform streaks left by the
injector.

**(ii) What it costs** (1.5 pts): entropy generation shows up as
**stagnation pressure loss**, which reduces the effective expansion ratio
the gas actually sees, so **exit velocity $V_e$ goes down**, and therefore
**$I_{sp}$ and $C_F$ go down** while the exhaust temperature goes **up**.
Concretely, in A4 the flow left 106 K of enthalpy on the table
($T_e - T_{e,s}$), which is $c_p \times 106 \approx 2.4\times10^5\ \mathrm{J/kg}$
of kinetic energy never delivered — about 2.6 % of $V_e$, or roughly 9 s of
$I_{sp}$ on a 330 s engine.

**Full marks** require naming a specific performance quantity and its
direction. "It makes the engine less efficient" alone scores 1/3.

---

## Section B — Compressible flow (20 points)

### B1 (2 pts) — **(c)** $1180\ \mathrm{m/s}$

At the throat $M = 1$, so $T^{*} = T_0\dfrac{2}{\gamma+1} = 3400 \times \dfrac{2}{2.2} = 3091\ \mathrm{K}$.

$$a^{*} = \sqrt{\gamma R T^{*}} = \sqrt{1.2 \times 377.93 \times 3090.9} = \sqrt{1.4017\times10^{6}} = 1184\ \mathrm{m/s}$$

(a) is sea-level air at 288 K — the reflex answer again.
(b) $880\ \mathrm{m/s}$ is roughly what you get if you use air's
$R = 287$ and $\gamma = 1.4$ at ~1900 K, i.e. the right formula with the
wrong gas.
(d) $1750\ \mathrm{m/s}$ is close to this engine's $c^{*}$ (see C2a) — a
different quantity entirely, and a revealing confusion: $c^{*}$ is not a
speed of sound, and the throat gas does not move at $c^{*}$.

Accept full credit for using $T_0$ instead of $T^{*}$ only if the student
flags it; $a_0 = \sqrt{\gamma R T_0} = 1242\ \mathrm{m/s}$, still (c).

### B2 (5 pts) — derivation

**Assumptions (1 pt — must be stated):** steady; one-dimensional (properties
uniform on each cross-section); inviscid (no wall friction); adiabatic and
reversible, hence **isentropic**; no body forces; calorically perfect gas
with constant $\gamma$; no mass addition.

**Step 1 — continuity (0.5 pt).** $\dot m = \rho V A = \mathrm{const}$.
Take logs and differentiate:

$$\frac{d\rho}{\rho} + \frac{dV}{V} + \frac{dA}{A} = 0 \tag{1}$$

**Step 2 — momentum (0.5 pt).** Steady, inviscid, 1-D Euler:

$$dp + \rho V\,dV = 0 \quad\Longrightarrow\quad \frac{dp}{\rho} = -V\,dV \tag{2}$$

**Step 3 — speed of sound (0.5 pt).** For an isentropic process
$a^2 = (\partial p/\partial \rho)_s$, so along the flow $dp = a^2 d\rho$, i.e.

$$\frac{d\rho}{\rho} = \frac{dp}{a^{2}\rho} \tag{3}$$

**Step 4 — combine (1 pt).** Substitute (2) into (3):

$$\frac{d\rho}{\rho} = \frac{-V\,dV}{a^{2}} = -M^{2}\frac{dV}{V}$$

and put that into (1):

$$-M^{2}\frac{dV}{V} + \frac{dV}{V} + \frac{dA}{A} = 0
\quad\Longrightarrow\quad
\boxed{\ \frac{dA}{A} = (M^{2}-1)\frac{dV}{V}\ }$$

**Step 5 — the physical statement (0.5 pt).** For $M<1$, $(M^2-1)<0$: area
must **decrease** to accelerate the flow. For $M>1$ it must **increase**.
Acceleration through $M=1$ therefore requires $dA = 0$ at exactly $M = 1$ —
a minimum-area station, the **throat**. A purely converging duct can at best
reach $M=1$ at its exit (choking); a converging–diverging duct is
*geometrically necessary* for supersonic exhaust. The physics behind the sign
flip: above $M=1$ density falls faster than velocity rises, so the area must
grow to pass the same mass flow.

**Step 6 — integrated form (1 pt).** Mass flow is the same at any station
and at the sonic throat:

$$\rho V A = \rho^{*}a^{*}A^{*}
\quad\Longrightarrow\quad
\frac{A}{A^{*}} = \frac{\rho^{*}}{\rho}\cdot\frac{a^{*}}{V}
= \frac{\rho^{*}}{\rho_0}\cdot\frac{\rho_0}{\rho}\cdot\frac{a^{*}}{V}$$

Isentropic relations, with $\tau \equiv 1 + \frac{\gamma-1}{2}M^{2}$:

$$\frac{\rho_0}{\rho} = \tau^{\frac{1}{\gamma-1}},\qquad
\frac{\rho_0}{\rho^{*}} = \left(\frac{\gamma+1}{2}\right)^{\frac{1}{\gamma-1}},\qquad
\frac{T_0}{T} = \tau$$

and $V = M a = M\sqrt{\gamma R T} = M\sqrt{\gamma R T_0}\,\tau^{-1/2}$,
$a^{*} = \sqrt{\gamma R T_0}\left(\frac{2}{\gamma+1}\right)^{1/2}$, so
$\dfrac{a^{*}}{V} = \dfrac{1}{M}\left(\dfrac{2}{\gamma+1}\right)^{1/2}\tau^{1/2}$.

Assembling:

$$\frac{A}{A^{*}} = \left(\frac{2}{\gamma+1}\right)^{\frac{1}{\gamma-1}}\tau^{\frac{1}{\gamma-1}}\cdot\frac{1}{M}\left(\frac{2}{\gamma+1}\right)^{\frac{1}{2}}\tau^{\frac{1}{2}}
= \frac{1}{M}\left[\frac{2}{\gamma+1}\,\tau\right]^{\frac{\gamma+1}{2(\gamma-1)}}$$

which is the required result, since
$\frac{1}{\gamma-1}+\frac{1}{2} = \frac{\gamma+1}{2(\gamma-1)}$. ∎ [F]

**Marking note:** a student who quotes the integrated relation without
deriving it gets at most 1 of 5. The area–velocity result and the throat
argument are the load-bearing parts.

### B3 (5 pts)

**(a) (3 pts)** With $\gamma = 1.2$, the exponent is
$\dfrac{\gamma+1}{2(\gamma-1)} = \dfrac{2.2}{0.4} = 5.5$ and
$\dfrac{2}{\gamma+1} = 0.9091$. So

$$f(M) = \frac{1}{M}\left[0.9091\left(1 + 0.1M^{2}\right)\right]^{5.5} = 25$$

Iterate (bisection or simple trial):

| $M$ | $f(M)$ | comment |
|---|---|---|
| 3.00 | 6.735 | far too small |
| 3.50 | 13.76 | still low |
| 3.80 | 21.24 | closing |
| 3.90 | 24.54 | just under |
| 3.92 | 25.26 | just over |
| 3.913 | 25.01 | converged |

$$\boxed{M_e = 3.91}$$

Convergence criterion: $|f(M) - 25| < 0.05$, i.e. area ratio matched to
0.2 %. Note the **supersonic** root is wanted; $f(M) = 25$ also has a
subsonic root at $M \approx 0.0234$, which corresponds to a
venturi with a subsonic throat and is not the nozzle's operating branch.
Losing the mark for reporting the subsonic root is standard.

**(b) (2 pts)** With $\tau = 1 + 0.1M_e^{2} = 1 + 0.1(3.913)^2 = 2.531$:

$$p_e = \frac{p_c}{\tau^{\gamma/(\gamma-1)}} = \frac{7\times10^{6}\ \mathrm{Pa}}{2.531^{6}} = \frac{7\times10^{6}}{262.9} = 2.663\times10^{4}\ \mathrm{Pa} = 26.6\ \mathrm{kPa}$$

$$T_e = \frac{T_0}{\tau} = \frac{3400\ \mathrm{K}}{2.531} = 1343\ \mathrm{K}$$

$$V_e = M_e\sqrt{\gamma R T_e} = 3.913\sqrt{1.2\times377.93\times1343.3} = 3.913 \times 780.5 = 3054\ \mathrm{m/s}$$

*Cross-check by energy* (do this — it catches most errors):
$V_e = \sqrt{2c_p(T_0 - T_e)} = \sqrt{2\times2267.58\times2056.6} = 3054\ \mathrm{m/s}$ ✓.

*Sanity check:* $p_c/p_e = 263$ at $\varepsilon = 25$ — the right order for a
booster-class bell; a Merlin-1D-class sea-level nozzle sits near
$\varepsilon \approx 16$, an RS-25 at $\varepsilon \approx 69$ (both
approximate).

### B4 (4 pts)

**(a) (3 pts)** Throat area:

$$A_t = \frac{\pi D_t^{2}}{4} = \frac{\pi (0.200\ \mathrm{m})^{2}}{4} = 0.03142\ \mathrm{m^2}$$

Choked mass flow:

$$\dot m = \frac{p_c A_t}{\sqrt{R T_0}}\,\Gamma, \qquad
\Gamma \equiv \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}$$

$$\Gamma = \sqrt{1.2}\,(0.9091)^{5.5} = 1.0954 \times 0.5921 = 0.6485$$

$$\sqrt{R T_0} = \sqrt{377.93 \times 3400} = \sqrt{1.2850\times10^{6}} = 1133.6\ \mathrm{m/s}$$

$$\dot m = \frac{7\times10^{6}\ \mathrm{Pa} \times 0.03142\ \mathrm{m^2}}{1133.6\ \mathrm{m/s}} \times 0.6485 = 194.0 \times 0.6485 = \boxed{125.8\ \mathrm{kg/s}}$$

Equivalently $\dot m = p_c A_t / c^{*}$ with $c^{*} = 1748\ \mathrm{m/s}$
(C2a) — same number, and the definition of $c^{*}$.

**(b) (1 pt)** $\dot m \propto p_c$ at fixed $T_0$, $A_t$, and gas
properties, because $\Gamma$ and $\sqrt{RT_0}$ are unchanged and the throat
stays choked. $4.9/7.0 = 0.70$, so

$$\dot m = 0.70 \times 125.8 = 88.1\ \mathrm{kg/s}$$

**This proportionality is the whole basis of deep throttling in a
fixed-geometry engine** [F]: chamber pressure and mass flow are locked
together, which is why throttling a pump-fed engine is a turbopump and
injector-stiffness problem, not a nozzle problem.

### B5 (4 pts)

**(a) (1 pt) — (a)** $p\uparrow$, $p_0\downarrow$, $T_0$ constant,
$s\uparrow$. A normal shock is adiabatic (so $T_0$ is conserved) and
irreversible (so $s$ rises and $p_0$ drops); it is a compression, so static
pressure rises and $M$ drops below 1.
(b) is impossible — $s\uparrow$ with $p_0$ constant violates
$\Delta s = -R\ln(p_{0,2}/p_{0,1})$ for adiabatic flow.
(c) reverses the static pressure jump — that would be an expansion shock,
forbidden by the second law.
(d) has $T_0$ rising, which requires heat addition, and $s$ constant, which
contradicts the shock's irreversibility.

**(b) (1 pt)**

$$\frac{p_e}{p_{amb}} = \frac{26630\ \mathrm{Pa}}{101325\ \mathrm{Pa}} = 0.263$$

$p_e < p_{amb}$, so the nozzle is **over-expanded** at sea level — heavily
so, by nearly a factor of four.

**(c) (2 pts)** $0.263 < 0.3$–$0.4$, so the separation criterion is
**violated**: the flow would **not** fill the nozzle at sea level. A shock
system would stand inside the divergent section, the boundary layer would
separate somewhere upstream of the exit plane, and the flow downstream of
separation would be at roughly ambient pressure. In effect the nozzle
behaves as if it had a smaller effective $\varepsilon$ — which is why the
real sea-level thrust is usually *higher* than the naive fully-flowing
over-expanded calculation predicts.

**Hardware consequences** (any one for the mark): **side loads** —
asymmetric, unsteady separation exerts large lateral forces on the nozzle and
the gimbal actuators (this is a documented start-transient problem on
high-$\varepsilon$ engines such as the RS-25 and J-2, and it sized structure
on both); buffeting and vibration driving nozzle structural fatigue; local
heating where the separation shock impinges on the wall; unpredictable and
unsteady thrust and thrust-vector during the transient.

**Design conclusion a strong answer reaches unprompted:** $\varepsilon = 25$
at $p_c = 7\ \mathrm{MPa}$ is too large for a sea-level-start engine. Either
raise $p_c$, cut $\varepsilon$, or accept it as a vacuum-only stage.

---

## Section C — Rocket performance (20 points)

### C1 (2 pts) — **(b)**

$$F = \dot m V_e + (p_e - p_{amb})A_e$$

In vacuum, $p_{amb} = 0$, so $F = \dot m V_e + p_e A_e$. As
$\varepsilon\to\infty$: $V_e \to V_{e,\max} = \sqrt{2c_p T_0}$, a **finite
limit** set by the total available enthalpy (all thermal energy converted to
kinetic). Meanwhile $p_e \to 0$ faster than $A_e \to \infty$ — specifically
$p_e A_e \propto \varepsilon^{1 - \gamma/(\gamma-1)\cdot(\ldots)}$ decays —
so the pressure thrust vanishes. Total thrust approaches
$\dot m V_{e,\max}$.

(a) is wrong because momentum thrust is not constant — it *rises* toward its
limit. (c) is wrong because $V_e$ is bounded by the stagnation enthalpy; you
cannot get infinite thrust from finite chemical energy. (d) is wrong because
pressure thrust goes to zero, not to a finite non-zero value.

*For this engine:* $V_{e,\max} = \sqrt{2 \times 2267.58 \times 3400} = 3927\ \mathrm{m/s}$,
against $3054\ \mathrm{m/s}$ at $\varepsilon = 25$. Even an infinite nozzle
buys only 29 % more exhaust velocity — which is precisely why the
$I_{sp}$-vs-$\varepsilon$ curve flattens (see F2a).

### C2 (7 pts)

**(a) (2 pts)**

$$c^{*} = \frac{\sqrt{R T_0}}{\Gamma} = \frac{1133.6\ \mathrm{m/s}}{0.6485} = \boxed{1748\ \mathrm{m/s}}$$

*Sanity check:* LOX/RP-1 engines are typically $c^{*} \approx 1750$–$1820\ \mathrm{m/s}$,
LOX/LH₂ around $2300\ \mathrm{m/s}$ (both approximate). 1748 m/s is right for
a kerolox-class gas. [E]

**(b) (2 pts)** Ideal thrust coefficient:

$$C_F = \underbrace{\sqrt{\frac{2\gamma^{2}}{\gamma-1}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{\gamma-1}}\left[1 - \left(\frac{p_e}{p_c}\right)^{\frac{\gamma-1}{\gamma}}\right]}}_{\text{momentum}} + \underbrace{\varepsilon\,\frac{p_e - p_{amb}}{p_c}}_{\text{pressure}}$$

Momentum term, with $\gamma = 1.2$, $p_e/p_c = 3.804\times10^{-3}$:

- $\dfrac{2\gamma^2}{\gamma-1} = \dfrac{2(1.44)}{0.2} = 14.40$
- $\left(\dfrac{2}{\gamma+1}\right)^{\frac{\gamma+1}{\gamma-1}} = 0.9091^{11} = 0.3506$
- $1 - (3.804\times10^{-3})^{0.16667} = 1 - 0.3951 = 0.6049$
- product $= 14.40 \times 0.3506 \times 0.6049 = 3.0538$; $\sqrt{\ } = 1.7473$

Vacuum ($p_{amb} = 0$):

$$C_{F,vac} = 1.7473 + 25 \times \frac{26630}{7\times10^{6}} = 1.7473 + 0.0951 = \boxed{1.842}$$

Sea level:

$$C_{F,SL} = 1.7473 + 25 \times \frac{26630 - 101325}{7\times10^{6}} = 1.7473 - 0.2668 = \boxed{1.481}$$

*Sanity check:* $C_F$ lives between about 1.2 and 2.0 for chemical rockets;
the theoretical maximum for $\gamma = 1.2$ into vacuum with infinite
$\varepsilon$ is about 2.25. Both numbers are in range, and the 0.36
penalty from over-expansion at sea level is enormous — 20 % of the vacuum
value. [F]

**(c) (2 pts)** With $A_t = 0.03142\ \mathrm{m^2}$ and
$\dot m = 125.8\ \mathrm{kg/s}$ from B4:

$$F_{vac} = C_{F,vac}\,p_c A_t = 1.8424 \times 7\times10^{6}\ \mathrm{Pa} \times 0.03142\ \mathrm{m^2} = 4.052\times10^{5}\ \mathrm{N} = \boxed{405\ \mathrm{kN}}$$

$$F_{SL} = 1.4805 \times 7\times10^{6} \times 0.03142 = 3.256\times10^{5}\ \mathrm{N} = \boxed{326\ \mathrm{kN}}$$

$$I_{sp,vac} = \frac{F_{vac}}{\dot m g_0} = \frac{4.052\times10^{5}\ \mathrm{N}}{125.8\ \mathrm{kg/s} \times 9.80665\ \mathrm{m/s^2}} = \boxed{328.4\ \mathrm{s}}$$

$$I_{sp,SL} = \frac{3.256\times10^{5}}{125.8 \times 9.80665} = \boxed{263.9\ \mathrm{s}}$$

Equivalently $I_{sp} = C_F c^{*}/g_0$: $1.8424 \times 1747.9/9.80665 = 328.4$ s ✓.

*Sanity check:* an ideal 1-D kerolox-class engine at 328 s vacuum is
plausible — real LOX/RP-1 gas-generator engines land near 310–340 s vacuum
(Merlin Vacuum (MVac) $I_{sp} \approx 348\ \mathrm{s}$ with $\varepsilon\approx165$;
F-1 sea-level $I_{sp} \approx 263\ \mathrm{s}$ — both approximate). Note this
ideal calculation ignores $c^{*}$ efficiency (typically 0.92–0.98) and
divergence losses, so a real engine would come in a few percent below.

**(d) (1 pt)** The sea-level number is **not trustworthy**. B5(c) showed
$p_e/p_{amb} = 0.26$, below the separation threshold, so the nozzle would not
flow full; the fully-flowing over-expansion penalty of $-0.267$ in $C_F$ is
never actually paid in full because the flow separates and the downstream
wall sees roughly ambient pressure instead of 26.6 kPa. Real $F_{SL}$ would
be **higher** than 326 kN — but unsteady, with side loads. The vacuum number
is sound; the sea-level number is an academic bound, not a prediction.

### C3 (5 pts)

**(a) (3 pts)** Tsiolkovsky: $\Delta v = I_{sp}g_0\ln(m_0/m_f)$, applied
stage by stage. The upper stage's dry mass and the payload are *payload* for
the stage below.

**Stage 1:**
- $m_0 = 480{,}000\ \mathrm{kg}$ (everything)
- $m_f = 480{,}000 - 350{,}000 = 130{,}000\ \mathrm{kg}$
- mass ratio $= 3.692$

$$\Delta v_1 = 300\ \mathrm{s} \times 9.80665\ \mathrm{m/s^2} \times \ln(3.692) = 2942.0 \times 1.3062 = \boxed{3843\ \mathrm{m/s}}$$

**Stage 2** (stage-1 dry mass of 25,000 kg is jettisoned):
- $m_0 = 130{,}000 - 25{,}000 = 105{,}000\ \mathrm{kg}$
- $m_f = 105{,}000 - 90{,}000 = 15{,}000\ \mathrm{kg}$
- mass ratio $= 7.000$

$$\Delta v_2 = 350 \times 9.80665 \times \ln(7.000) = 3432.3 \times 1.9459 = \boxed{6679\ \mathrm{m/s}}$$

$$\Delta v_{total} = 3843 + 6679 = \boxed{10{,}522\ \mathrm{m/s}}$$

*Sanity check:* ~10.5 km/s ideal against a ~9.4 km/s LEO requirement
including gravity and drag losses — a credible small launch vehicle with
about 1 km/s of margin. Payload fraction $5000/480{,}000 = 1.04\ \%$, also
typical. [E]

**Common error worth 0 for stage 2:** forgetting to drop the 25 t of stage-1
dry mass, giving $m_0 = 130{,}000$ and $\Delta v_2 = 5460\ \mathrm{m/s}$ —
1.2 km/s of phantom loss. That jettison *is* the point of staging.

**(b) (2 pts)** Single stage: $m_0 = 480{,}000\ \mathrm{kg}$,
$m_f = 35{,}000 + 5{,}000 = 40{,}000\ \mathrm{kg}$, mass ratio $= 12.00$:

$$\Delta v = 350 \times 9.80665 \times \ln(12.00) = 3432.3 \times 2.4849 = \boxed{8529\ \mathrm{m/s}}$$

Nearly **2000 m/s worse** despite carrying the better $I_{sp}$ for the entire
burn.

**Explanation (1 pt).** $\Delta v$ depends on the mass ratio only through
$\ln(m_0/m_f)$ — logarithmically, with sharply diminishing returns — whereas
staging attacks $m_f$ *directly and multiplicatively*: the total is
$\sum I_{sp,i}g_0\ln(\mathrm{MR}_i)$, and the product of the stage mass
ratios ($3.692 \times 7.000 = 25.8$) exceeds the single-stage ratio (12.0)
because the dead structure of stage 1 is thrown away before stage 2 has to
accelerate it. You are buying $\ln$ of a product instead of $\ln$ of a
smaller single number. A strong answer says: **staging converts dry mass
that would otherwise be carried to burnout into mass you never have to
accelerate again.**

### C4 (3 pts)

**(a) (1 pt)**

$$\dot m = \frac{F_{vac}}{I_{sp,vac}\,g_0} = \frac{100{,}000\ \mathrm{N}}{340\ \mathrm{s} \times 9.80665\ \mathrm{m/s^2}} = \frac{100{,}000}{3334.3\ \mathrm{m/s}} = \boxed{29.99\ \mathrm{kg/s}}$$

**(b) (2 pts)** From the definition of $c^{*}$, $\dot m = p_c A_t/c^{*}$:

$$A_t = \frac{\dot m\,c^{*}}{p_c} = \frac{29.99\ \mathrm{kg/s} \times 1780\ \mathrm{m/s}}{5.5\times10^{6}\ \mathrm{Pa}} = \frac{53{,}385}{5.5\times10^{6}} = 9.706\times10^{-3}\ \mathrm{m^2}$$

$$D_t = \sqrt{\frac{4A_t}{\pi}} = \sqrt{\frac{4 \times 9.706\times10^{-3}}{\pi}} = \sqrt{1.2359\times10^{-2}} = 0.1112\ \mathrm{m} = \boxed{111\ \mathrm{mm}}$$

*Units check:* $[\mathrm{kg/s}][\mathrm{m/s}]/[\mathrm{Pa}] = (\mathrm{kg\,m/s^2})/(\mathrm{N/m^2}) = \mathrm{N}/(\mathrm{N/m^2}) = \mathrm{m^2}$ ✓.

*Sanity check:* a 100 kN vacuum engine with a 111 mm throat — comparable in
scale to an RL10-class throat (RL10 vacuum thrust ≈ 110 kN, approximate).

### C5 (3 pts)

**Definitions (1.5 pts, 0.5 each):**

- $c^{*}$ — **characteristic velocity**, $\mathrm{m/s}$:
  $c^{*} = p_c A_t/\dot m$. A measure of how much stagnation pressure the
  combustion process generates per unit of mass flow through a given throat.
  It depends **only on the propellants, mixture ratio, and combustion
  efficiency** — it contains no nozzle geometry beyond $A_t$.
- $C_F$ — **thrust coefficient**, dimensionless:
  $C_F = F/(p_c A_t)$. It measures how well the *nozzle* converts chamber
  pressure into thrust, and depends on $\gamma$, $\varepsilon$, and
  $p_{amb}/p_c$ — not on $T_0$ or $\mathcal{M}$.
- $c$ — **effective exhaust velocity**, $\mathrm{m/s}$:
  $c = F/\dot m = I_{sp}g_0$. The single velocity that, multiplied by mass
  flow, would give the actual thrust including the pressure term.

**Identity (0.5 pt):**

$$c = c^{*}C_F = I_{sp}\,g_0$$

**Why split it (1 pt).** The split is a **diagnostic decomposition**: it
separates the two independent things an engine does. $c^{*}$ isolates
**combustion** — injector mixing quality, residence time, propellant
vaporisation, mixture ratio, chamber $L^{*}$. $C_F$ isolates **expansion** —
nozzle contour, area ratio, divergence and separation, back pressure.
$I_{sp}$ alone mixes them together and tells you *that* the engine is
underperforming, not *where*.

A test engineer measures $p_c$, $\dot m$, $A_t$, and $F$ and computes both.
If $c^{*}$ efficiency is low but $C_F$ efficiency is fine, the fault is in
the injector or chamber — go change the injector element pattern or lengthen
the chamber. If $c^{*}$ is nominal but $C_F$ is low, the fault is in the
nozzle or the back-pressure environment — contour, erosion, or separation.
Because $C_F$ also varies with altitude while $c^{*}$ does not, the split is
what lets you correct sea-level test data to vacuum performance.

---

## Section D — Thermochemistry (15 points)

### D1 (4 pts)

**(a) (1 pt)** Balance $\mathrm{CH_{1.953}} + a\,\mathrm{O_2} \to \mathrm{CO_2} + b\,\mathrm{H_2O}$.

- C: 1 on each side ⇒ 1 $\mathrm{CO_2}$.
- H: $1.953 = 2b \Rightarrow b = 0.9765$.
- O: $2a = 2(1) + 0.9765 = 2.9765 \Rightarrow a = 1.48825$.

$$\mathrm{CH_{1.953}} + 1.488\ \mathrm{O_2} \longrightarrow \mathrm{CO_2} + 0.9765\ \mathrm{H_2O}$$

Equivalently $a = 1 + x/4$ for $\mathrm{CH}_x$ — worth memorising.

**(b) (3 pts)** Molar masses:

$$\mathcal{M}_{fuel} = 12.011 + 1.953 \times 1.008 = 12.011 + 1.9686 = 13.980\ \mathrm{kg/kmol}$$
$$\mathcal{M}_{\mathrm{O_2}} = 2 \times 15.999 = 31.998\ \mathrm{kg/kmol}$$

$$(O/F)_{st} = \frac{1.48825\ \mathrm{kmol} \times 31.998\ \mathrm{kg/kmol}}{1\ \mathrm{kmol} \times 13.980\ \mathrm{kg/kmol}} = \frac{47.622\ \mathrm{kg}}{13.980\ \mathrm{kg}} = \boxed{3.406}$$

*Sanity check:* published stoichiometric O/F for LOX/RP-1 is about 3.4
(approximate; it varies slightly with the assumed H/C ratio of the specific
RP-1 batch, typically $\mathrm{CH_{1.94}}$–$\mathrm{CH_{2.0}}$). For
LOX/CH₄ the same method gives $(O/F)_{st} = 2\times31.998/16.043 = 3.99$;
for LOX/LH₂, $31.998/(2\times2.016) = 7.94$. [F]

### D2 (3 pts)

**(a) (2 pts)** The equivalence ratio is fuel-referenced:

$$\phi = \frac{(F/O)_{actual}}{(F/O)_{st}} = \frac{(O/F)_{st}}{(O/F)_{actual}} = \frac{3.406}{2.27} = \boxed{1.50}$$

$\phi > 1$ ⇒ **fuel-rich**, and substantially so: the F-1 ran at about 1.5
times the stoichiometric fuel loading. Approximate figure. [H]

**Common error:** inverting the definition and reporting 0.667. The check
that catches it: $O/F$ *below* stoichiometric means excess fuel, and excess
fuel must give $\phi > 1$ by construction.

**(b) (1 pt)** Per 1 kg of total propellant at $O/F = 2.27$:

$$m_{ox} = \frac{2.27}{3.27} = 0.6942\ \mathrm{kg}, \qquad m_{fuel} = \frac{1}{3.27} = 0.3058\ \mathrm{kg}$$

Fuel that 0.6942 kg of oxygen can fully burn:

$$m_{fuel,st} = \frac{0.6942\ \mathrm{kg}}{3.406} = 0.2038\ \mathrm{kg}$$

$$m_{fuel,excess} = 0.3058 - 0.2038 = \boxed{0.102\ \mathrm{kg\ per\ kg\ of\ propellant}}$$

About 10 % of the propellant mass is fuel that cannot be fully oxidised —
it leaves as CO, H₂, and unburned species, and that is deliberate.

### D3 (2 pts) — **(c)** modestly higher

Raising pressure shifts dissociation equilibria that increase the number of
moles (e.g. $\mathrm{CO_2 \rightleftharpoons CO + \tfrac12 O_2}$,
$\mathrm{H_2O \rightleftharpoons H_2 + \tfrac12 O_2}$) back toward the
associated side, by Le Chatelier. Less dissociation means less enthalpy is
locked up in broken bonds, so more of the heat of reaction stays as sensible
enthalpy: $T_{ad}$ rises. The effect is real but **modest** — typically tens
to a couple of hundred K over a $3\to20\ \mathrm{MPa}$ change for kerolox,
and it goes as roughly $\ln p_c$, not linearly.

(a) is wrong: flame temperature is a function of pressure as well as mixture
ratio, precisely because of dissociation. It would be right only for a
mixture cool enough not to dissociate.
(b) inverts the physics and confuses equilibrium with kinetics — reaction
*rates* rise with pressure, and in any case adiabatic flame temperature is
an equilibrium quantity, not a kinetic one.
(d) is far too strong; nothing in thermochemistry scales $T_{ad}$ with the
pressure ratio.

*A useful corollary:* the main reason high $p_c$ raises $I_{sp}$ is the
larger available expansion ratio $p_c/p_e$, not the small $T_{ad}$ gain. [F]

### D4 (6 pts)

**(a) (3 pts)** **What dissociation is (1 pt):** at high temperature the
equilibrium of the combustion products shifts away from fully oxidised,
strongly bonded molecules toward fragments —
$\mathrm{CO_2 \rightleftharpoons CO + \tfrac12 O_2}$,
$\mathrm{H_2O \rightleftharpoons OH + \tfrac12 H_2}$,
$\mathrm{H_2 \rightleftharpoons 2H}$ — because the entropy gain from
producing more, freer particles ($T\Delta S$) outweighs the enthalpy cost of
breaking bonds in the Gibbs free energy $\Delta G = \Delta H - T\Delta S$.
Above roughly 2800–3000 K it is no longer a small correction.

**What it does to chamber temperature (1 pt):** it is a heat sink. Energy
that would have appeared as sensible enthalpy is instead stored as chemical
potential energy in the dissociated species, so the actual adiabatic flame
temperature is well below the value you would compute assuming complete
combustion — for LOX/RP-1 the difference is several hundred kelvin. It also
*lowers the mean molar mass* of the gas, which partly compensates in $I_{sp}$
terms (see (b)).

**What happens in the nozzle (1 pt) — the part that separates a strong
answer:** as the gas expands, it cools and pressure drops, so equilibrium
shifts back toward recombination
($\mathrm{CO + \tfrac12 O_2 \to CO_2}$, $\mathrm{H + OH \to H_2O}$),
**releasing the stored dissociation energy back into the flow**. If
recombination keeps up with the expansion (**equilibrium** or **shifting**
flow), that energy is largely recovered as extra kinetic energy and $I_{sp}$
is close to the equilibrium prediction. But recombination is a three-body
process whose rate collapses as density falls, so at some station the
composition **freezes** and the remaining chemical energy is carried out the
nozzle unrecovered. Real engines lie between the frozen and equilibrium
limits, usually much nearer equilibrium; the frozen assumption is a
conservative $I_{sp}$ bound. [F][A]

**(b) (3 pts)** **Reason 1 — molar mass (1.5 pts).** Ideal exhaust velocity
goes as

$$V_e \propto \sqrt{\frac{T_0}{\mathcal{M}}}$$

Running fuel-rich leaves excess light species in the exhaust — H₂, H, CO
and unburned CH fragments instead of CO₂ and H₂O. That drops the mean molar
mass $\mathcal{M}$ faster than it drops $T_0$, so the ratio $T_0/\mathcal{M}$
peaks fuel-rich of stoichiometric. For LOX/LH₂ the effect is dramatic
(optimum near $O/F \approx 4$–$5$ against a stoichiometric 7.94, because
leftover H₂ has $\mathcal{M} = 2$); for LOX/RP-1 it is milder but still
moves the optimum from 3.4 to about 2.6–2.8 for $I_{sp}$.

**Reason 2 — dissociation (1.5 pts).** Peak temperature occurs at
stoichiometric, which is exactly where dissociation is worst. Moving off
stoichiometric drops $T_{ad}$, which suppresses dissociation, so a
disproportionate share of the temperature you "gave up" is recovered as
useful bond energy and lower $\mathcal{M}$-shifting losses. The result is a
$T_0$ curve that is much flatter near the peak than the naive
complete-combustion calculation predicts, so the molar-mass benefit wins
over a wide range.

*(These two are distinct: one is a property of the exhaust composition, the
other of the equilibrium. Answers that give only the molar-mass argument
score 1.5/3.)*

**Third, non-performance reason (must name one for the last marks in a
6/6 answer):** **thermal management.** Running further fuel-rich than the
$I_{sp}$ optimum lowers $T_0$ and the gas-side recovery temperature,
reducing heat flux and making the chamber and throat coolable. Historically
the F-1's $O/F \approx 2.27$ against an $I_{sp}$ optimum nearer 2.6–2.8 is
exactly this trade — a few seconds of $I_{sp}$ sacrificed for a wall that
survives. [H][J] Also acceptable: avoiding oxidiser-rich gas, which attacks
metals catastrophically (a real constraint for oxidiser-rich staged
combustion, solved in the Soviet/Russian tradition with specialised
coatings); soot-free operation for reusability; and turbine inlet
temperature limits in gas-generator and preburner circuits.

---

## Section E — Heat transfer, fluids, and structures (15 points)

### E1 (4 pts)

**(a) (2 pts)** Thin-wall pressure vessel ($r/t = 0.225/0.008 = 28 \gg 10$,
so thin-wall is valid):

$$\sigma_{hoop} = \frac{p\,r}{t} = \frac{7\times10^{6}\ \mathrm{Pa} \times 0.225\ \mathrm{m}}{0.0080\ \mathrm{m}} = 1.969\times10^{8}\ \mathrm{Pa} = \boxed{196.9\ \mathrm{MPa}}$$

$$\sigma_{long} = \frac{p\,r}{2t} = \boxed{98.4\ \mathrm{MPa}}$$

Hoop is twice longitudinal — which is why cylindrical pressure vessels split
along their length, and why filament-wound cases and welded chambers put
their reinforcement circumferentially.

**(b) (2 pts)**

$$\sigma_{allow} = \frac{\sigma_y}{\mathrm{FoS}} = \frac{1100\ \mathrm{MPa}}{1.5} = 733.3\ \mathrm{MPa}$$

$$t_{min} = \frac{p\,r}{\sigma_{allow}} = \frac{7\times10^{6}\ \mathrm{Pa} \times 0.225\ \mathrm{m}}{7.333\times10^{8}\ \mathrm{Pa}} = 2.148\times10^{-3}\ \mathrm{m} = \boxed{2.15\ \mathrm{mm}}$$

**Why the real wall is thicker (1 of the 2 marks — any one):**

- Pressure is not the only load: **thermal stress** from the through-wall
  gradient (E2, E4) is often larger than pressure stress in a cooled liner.
- The wall is not a plain cylinder — it carries **coolant channels**, so the
  land between channels and the closeout jacket must each be sized, and the
  channel roots are stress concentrations.
- **Yield at temperature** is well below room-temperature yield, and the
  quoted 1100 MPa may not apply at the local wall temperature.
- **Low-cycle fatigue and creep** over the required number of firings, plus
  thinning by erosion, oxidation, and machining tolerance.
- **Buckling** under external loads and gimbal/thrust-structure bending,
  plus proof and burst pressure requirements above operating $p_c$.
- Injector-face and throat regions carry **local dynamic loads** (start
  transients, combustion instability) far above steady $p_c$.

### E2 (5 pts)

**(a) (3 pts)** Series resistances per unit area, gas film then wall
conduction:

$$R''_{gas} = \frac{1}{h_g} = \frac{1}{25{,}000\ \mathrm{W/(m^2K)}} = 4.000\times10^{-5}\ \mathrm{m^2K/W}$$

$$R''_{wall} = \frac{t}{k} = \frac{9.0\times10^{-4}\ \mathrm{m}}{350\ \mathrm{W/(m\,K)}} = 2.571\times10^{-6}\ \mathrm{m^2K/W}$$

$$R''_{total} = 4.000\times10^{-5} + 2.571\times10^{-6} = 4.257\times10^{-5}\ \mathrm{m^2K/W}$$

$$q'' = \frac{T_{aw} - T_{wc}}{R''_{total}} = \frac{(3200 - 700)\ \mathrm{K}}{4.257\times10^{-5}\ \mathrm{m^2K/W}} = \frac{2500}{4.257\times10^{-5}} = 5.872\times10^{7}\ \mathrm{W/m^2}$$

$$\boxed{q'' = 58.7\ \mathrm{MW/m^2}}$$

*Sanity check:* regen-cooled throat heat fluxes run roughly
20–160 $\mathrm{MW/m^2}$; the RS-25 throat is often quoted near
$160\ \mathrm{MW/m^2}$ peak (approximate). 59 MW/m² is a plausible
high-pressure throat. [E]

**(b) (1 pt)**

$$T_{wg} = T_{aw} - q''R''_{gas} = 3200\ \mathrm{K} - 5.872\times10^{7} \times 4.000\times10^{-5} = 3200 - 2349 = \boxed{851\ \mathrm{K}}$$

$$\Delta T_{wall} = q''R''_{wall} = 5.872\times10^{7} \times 2.571\times10^{-6} = \boxed{151\ \mathrm{K}}$$

Check: $851 - 151 = 700\ \mathrm{K} = T_{wc}$ ✓.

**(c) (1 pt)** The **gas-side film resistance dominates** — it is
$4.00\times10^{-5}$ against $2.57\times10^{-6}\ \mathrm{m^2K/W}$, a factor of
15.6, i.e. 94 % of the total. The wall temperature is therefore set almost
entirely by the coolant side and the gas film, not by the wall material's
conductivity.

**The design lever:** because the wall is a small resistance, making it
**thinner and more conductive** barely changes $q''$ but directly lowers
$\Delta T_{wall}$ and hence $T_{wg}$ — which is why throats are lined with
thin copper alloys (NARloy-Z, GRCop-42/84) rather than thick superalloy.
Conversely, the way to actually *reduce* $q''$ is to attack the gas-side
film — film cooling, a boundary-layer coolant curtain, thermal barrier
coatings, or a fuel-rich near-wall zone from the outer injector ring — since
that is where 94 % of the resistance already lives, and it is the only
resistance you can add cheaply. [F][M]

### E3 (4 pts)

**(a) (1 pt)** At $O/F = 2.40$, the oxidiser fraction of total flow is
$\frac{O/F}{1 + O/F} = \frac{2.40}{3.40} = 0.7059$:

$$\dot m_{ox} = 0.7059 \times 125.8\ \mathrm{kg/s} = \boxed{88.8\ \mathrm{kg/s}}$$
(and $\dot m_{fuel} = 37.0\ \mathrm{kg/s}$; check $88.8/37.0 = 2.40$ ✓)

**(b) (3 pts)** Per orifice:

$$\dot m_{orifice} = \frac{88.8\ \mathrm{kg/s}}{300} = 0.2960\ \mathrm{kg/s}$$

Incompressible orifice (Bernoulli with a discharge coefficient):

$$\dot m = C_d A\sqrt{2\rho\,\Delta p} \quad\Longrightarrow\quad A = \frac{\dot m}{C_d\sqrt{2\rho\,\Delta p}}$$

$$\sqrt{2\rho\Delta p} = \sqrt{2 \times 1140\ \tfrac{\mathrm{kg}}{\mathrm{m^3}} \times 1.40\times10^{6}\ \mathrm{Pa}} = \sqrt{3.192\times10^{9}} = 5.650\times10^{4}\ \mathrm{kg/(m^2 s)}$$

$$A = \frac{0.2960\ \mathrm{kg/s}}{0.75 \times 5.650\times10^{4}\ \mathrm{kg/(m^2s)}} = \frac{0.2960}{4.237\times10^{4}} = 6.986\times10^{-6}\ \mathrm{m^2}$$

$$d = \sqrt{\frac{4A}{\pi}} = \sqrt{\frac{4 \times 6.986\times10^{-6}}{\pi}} = \sqrt{8.895\times10^{-6}} = 2.98\times10^{-3}\ \mathrm{m} = \boxed{2.98\ \mathrm{mm}}$$

*Units check:* $\sqrt{\mathrm{(kg/m^3)(N/m^2)}} = \sqrt{\mathrm{kg^2/(m^4s^2)}} = \mathrm{kg/(m^2 s)}$,
so $\dot m/(C_dU) $ has units of $\mathrm{m^2}$ ✓.

*Sanity checks:* an injection velocity of
$\dot m/(\rho A) = 0.296/(1140\times6.986\times10^{-6}) = 37.2\ \mathrm{m/s}$
is right for a LOX orifice (typically 20–50 m/s), and $\Delta p/p_c = 1.40/7.0 = 20\ \%$
is a textbook injector stiffness — chosen high enough to decouple the feed
system from chamber pressure oscillations and suppress low-frequency
(chug) instability. A 3 mm orifice is manufacturable and not so small that
contamination will plug it. [E][J]

### E4 (2 pts)

The through-wall temperature gradient makes the hot face want to expand more
than the cold face; the wall restrains itself, so the hot face goes into
**compression** and the cold face into tension. For a fully restrained flat
wall the peak thermal stress is

$$\sigma_{th} \approx \frac{E\,\alpha\,\Delta T_{wall}}{2(1-\nu)}$$

The load-bearing point: **$\sigma_{th}$ scales with $\Delta T_{wall}$, and
$\Delta T_{wall} = q''t/k$.** So thermal stress scales as $t/k$. A thin,
high-conductivity copper liner gives $\Delta T_{wall} = 151\ \mathrm{K}$
(E2b); the same 0.9 mm in Inconel ($k \approx 25\ \mathrm{W/(m\,K)}$) would
give roughly $2100\ \mathrm{K}$ across the wall, which is thermally
impossible — the hot face would melt. Copper's lower strength is acceptable
**because the liner is not the primary pressure member**: the superalloy
jacket behind it carries the hoop load, and the liner's job is only to move
heat and survive the strain. The failure mode that actually limits liner
life is **low-cycle thermal fatigue** — the "doghouse" bulging and thinning
of channel walls after repeated start/shutdown cycles — which is driven by
that same $\Delta T$ each cycle.

Full marks require: thermal stress $\propto \Delta T \propto q''t/k$, and
the division of labour between liner (heat) and jacket (pressure).

---

## Section F — Propulsion literacy (15 points)

### F1 (4 pts, 1 each)

**(a) Gas-generator cycle** (open cycle). The tells: a *fraction* of both
propellants, burned very fuel-rich in a separate device, turbine exhaust
**dumped overboard** — that dump is the definition of an open cycle, and the
sooty fuel-rich exhaust is the visible dark plume (F-1, Merlin 1D, Vulcain 2,
RS-68 — approximate examples). "Chamber pressure limited by how much you're
willing to throw away" is the cycle's characteristic penalty: turbine flow
does not contribute full $I_{sp}$, so 1–5 % of propellant is spent on the
pumps.

**(b) Expander cycle** (closed). The tells: **no combustion upstream of the
turbine**, fuel heated by the chamber and nozzle walls, turbine exhaust
burned in the main chamber. The bound named — available heat-pickup surface
area — is the expander cycle's famous scaling limit: heat pickup goes as
surface area ($\propto D^2$) while required pump power goes as thrust
($\propto D^3$-ish), so the cycle does not scale to large thrust. RL10 is
the canonical example. If you answered "expander bleed", note that the
description says the turbine flow **is injected and burned in the chamber**,
which makes it closed; a bleed cycle dumps it.

**(c) Full-flow staged combustion.** The tells: **all** of both propellants
through **two** preburners, one fuel-rich and one oxidiser-rich, both turbine
exhausts into the main chamber, and the absence of an interpropellant seal —
because each turbopump is bathed in gas of its own propellant, so a seal leak
mixes like with like. SpaceX Raptor and the earlier RD-270 and Integrated
Powerhead Demonstrator are the examples; Raptor figures are company claims.

**(d) Pressure-fed.** The tells: no turbomachinery at all, tanks at above
chamber pressure, heavy tanks, restartable and simple. Correct application
domain named in the description: upper stages, RCS, landers (e.g. the Apollo
LM descent and ascent engines, and essentially all hypergolic RCS).

### F2 (4 pts)

**(a) (2 pts)** **The steep rise:** at low $\varepsilon$ the exhaust is still
at high pressure and temperature, so a lot of enthalpy remains unconverted;
each increment of area ratio drops $p_e$ a great deal and converts a large
slice of that residual enthalpy to kinetic energy.

**The flattening:** $V_e$ is bounded above by
$V_{e,\max} = \sqrt{2c_pT_0}$ — all the stagnation enthalpy converted. As
$\varepsilon$ rises, $p_e/p_c$ falls, but $V_e$ approaches its asymptote as
$\sqrt{1 - (p_e/p_c)^{(\gamma-1)/\gamma}}$; near the asymptote you are
extracting the last few percent of a bounded quantity, and the area ratio
required per unit of $V_e$ grows explosively. Concretely for this course's
gas: $\varepsilon = 25$ gives 3054 m/s and $\varepsilon = \infty$ gives only
3927 m/s.

**Why no maximum:** in **vacuum** there is no $-p_{amb}A_e$ term, so nothing
ever subtracts from thrust as the nozzle grows. Both the momentum term and
the (vanishing) pressure term are non-negative, so $I_{sp,vac}$ increases
monotonically forever and merely saturates. A maximum appears only at finite
back pressure, where the optimum is $p_e = p_{amb}$.

**What actually stops the designer (must be named for full marks — any
two):** nozzle **mass** — the added structure and its stage-level $\Delta v$
penalty eventually outweighs the seconds gained; **length and volume** —
fairing and stage-length limits, and interstage geometry; **cooling and
thermal** — a huge radiatively cooled skirt has its own mass and thermal
problems; **gimbal envelope and thrust-structure loads**; and for any engine
that must start in atmosphere, **flow separation and side loads** (B5c).
Extendible nozzles (RL10B-2, $\varepsilon \approx 280$, approximate) exist
precisely because the geometric constraint, not the physics, is binding.

**(b) (2 pts)** **Regressive** burn.

**Justification from the trace:** after the ignition transient, thrust falls
monotonically — 1.6 MN to 1.1 MN, about a 30 % decline over the burn. Since
$F \approx C_F p_c A_t$ and, for a solid, $p_c$ is set by the balance
$\rho_p A_b r = p_c A_t/c^{*}$ with $r = ap_c^{n}$, thrust tracks the
**burning surface area** $A_b$. A steadily falling thrust therefore means a
steadily **shrinking burn area** as the web is consumed — the definition of a
regressive grain. (A simple end-burner or an unslotted internal-burning tube
with an outward-growing port would instead be neutral or progressive; a
cylindrical grain burning on its outer surface inward, or a heavily slotted
grain whose fins burn out early, gives this shape.)

**The tail (must be explained):** the long concave tail after web burnout is
**sliver burning** plus **chamber blowdown**. Real grains do not reach the
case wall everywhere at once; the leftover propellant fragments ("slivers")
between star points or at the ends have small and rapidly shrinking surface
area, so they produce a low, decaying thrust. Simultaneously the chamber
free volume — now nearly the whole case — must depressurise through the
throat, and once $p_c$ falls below the propellant's deflagration limit
combustion extinguishes and the remaining gas simply blows down. The tail
carries real total impulse but is poorly repeatable, which is why
impulse-critical stages use thrust termination or a burnout-detection scheme
rather than trusting it. [F][E]

### F3 (3 pts, 0.5 each)

1. **Main oxidiser valve** (a prevalve or main propellant valve; accept
   "main LOX valve", "MOV"). The "opened once and never closed in flight"
   phrasing marks it as a main propellant valve on an expendable stage, not
   a throttle or a check valve.
2. **Turbopump** — specifically the **oxidiser turbopump**; on a common
   shaft it is part of a single turbopump assembly (TPA).
3. **Injector** (accept "injector plate", "injector head"). Metering *and*
   atomising is the injector's dual job; elements may be impinging,
   coaxial-swirl, or pintle.
4. **Regenerative cooling channels** (accept "cooling jacket", "coolant
   passages", "milled channel liner").
5. **Regenerative cooling** — the cycle in which the coolant is the fuel and
   is subsequently burned, so the absorbed heat is not lost. Contrast with
   **dump cooling**, where the coolant is expelled.
6. **Throat** (the nozzle throat, station of minimum area and $M = 1$).

### F4 (4 pts)

**(a) (2 pts)** **Where the problem is: combustion — the injector and
chamber.** $c^{*}$ is the combustion figure of merit and it is 6 % down,
while $C_F$ at 98 % of ideal is entirely normal (divergence and boundary
layer alone account for 1–3 %). The nozzle is fine; the chamber is not
finishing the job.

**Two specific physical causes consistent with that signature (any two):**

- **Poor injector mixing** — locally non-uniform mixture ratio, so parts of
  the flow burn off-optimum and streaks of unburned fuel or oxidiser leave
  the chamber. The most common cause of low $c^{*}$ efficiency.
- **Incomplete vaporisation / insufficient residence time** — chamber $L^{*}$
  too short, or atomisation too coarse (injector $\Delta p$ too low, orifices
  too large), so droplets are still burning at the throat.
- **Actual mixture ratio off nominal** — a flowmeter or orifice calibration
  error means the engine is not running where you think it is; check this
  first because it is free.
- **Excessive film or barrier cooling** — a deliberately fuel-rich wall
  layer that does not participate in combustion is a direct $c^{*}$ hit; if
  the film fraction was increased for thermal margin, this is the answer and
  it is a design trade, not a defect.
- **Heat loss to the coolant** larger than assumed (a small effect, but real).

**What to change first (required for full marks):** verify the measurement
before touching hardware — confirm $\dot m$ calibration, $A_t$ (throat
erosion changes it), and that $p_c$ is being read at the injector face
rather than downstream. A 6 % $c^{*}$ shortfall is within the range that a
flowmeter or an eroded throat can fake. If instrumentation checks out, the
first hardware change is the **injector** — element pattern, orifice sizing
for higher $\Delta p$ and finer atomisation, or reduced film-cooling
fraction — because it dominates mixing; lengthening the chamber ($L^{*}$) is
the second lever and costs mass and residence-time-driven instability
margin.

**(b) (2 pts)** **Two strongest arguments against the LOX/LH₂ expander:**

1. **Cryogenic boil-off over the 18-hour coasts.** LH₂ boils at 20 K and has
   the worst mass-to-surface-area ratio of any propellant; over four coast
   periods you must either carry heavy multilayer insulation and a thermal
   control system, vent (losing propellant and imparting disturbance
   torques), or add active refrigeration. The 130 s $I_{sp}$ advantage is
   eaten from both ends — you lose propellant *and* gain dry mass.
2. **Restart complexity and reliability.** Four restarts of a pump-fed
   cryogenic engine demands chilldown of pumps and lines before each start,
   ullage settling burns, a start-transient sequence, spin-up energy, and
   thermal conditioning of the expander's heat-pickup circuit — every one an
   opportunity to fail. A pressure-fed storable, especially a hypergolic one,
   restarts by opening two valves and has no ignition system, no turbine,
   and no chilldown.

*(Also creditable: LH₂'s very low density means large, heavy tanks that can
erase the $I_{sp}$ gain at low mass fractions; and the expander cycle's
inherent thrust ceiling.)*

**Deciding information (required, and the discriminator between a 1-point
and 2-point answer) — any one, argued:**

- **The mission $\Delta v$.** The Tsiolkovsky exponential means $I_{sp}$ wins
  decisively at high $\Delta v$ and barely matters at low $\Delta v$. If this
  stage needs 4 km/s the 450 s option is probably worth the pain; if it needs
  600 m/s of station-keeping and phasing, the storable wins outright.
- **The propellant mass fraction achievable in each case** — i.e. actual tank
  and insulation mass estimates, since that is what converts $I_{sp}$ into
  delivered payload. Equivalently: run both options to a delivered-payload
  number rather than comparing $I_{sp}$.
- **The total mission duration and thermal environment** — 18 h coasts are
  survivable for LH₂; if the real requirement is a 30-day loiter the answer
  is decided without further analysis.

An answer that merely says "it depends" without naming the deciding quantity
scores 1/2.

---

## Scoring guide

Total the six sections. The course grading scale
(README → *Grading scale*) applies, but for a **diagnostic** the useful
output is not a grade — it is a study plan.

### Overall bands

| score | reading | what to do |
|---|---|---|
| **85–100** | You already have the Part I material at working-engineering level. | **Skim modules 01–04** — read §4 (typical ranges), §6 (real engines), §8 (misconceptions) and do the quizzes only. Sit the [Part I exam](exams/exam-part1.md) to confirm, then start at module **05**. If you score ≥ 85 on the Part I exam too, take the 12-week accelerated path. |
| **70–84** | Strong senior-undergraduate level. This is the expected score for a good aerospace senior; the exam is built so that 65–75 is a normal strong result. | **Skim the sections you scored well in, work the rest.** Use the section table below. Do every problem set in the modules you work. Standard 24-week path. |
| **55–69** | Familiarity. The concepts are there; the analysis is not yet reliable. | **Work modules 01–04 in full**, including every problem and both the module quizzes and the Part I exam. Do not skip the derivations. Standard 24-week path, and expect week 1–4 to take longer than budgeted. |
| **40–54** | Significant gaps in prerequisites, not just in propulsion. | Work **01–04 in full**, and before module 02 review undergraduate compressible flow from a gas-dynamics text (see `reference/sources.md` — Anderson is the standard). Budget 8–10 h per foundations module. 36-week path. |
| **< 40** | The prerequisites are not in place. | Do not start Part II. Spend 4–6 weeks on undergraduate thermodynamics and compressible flow first, then re-sit this exam. A propulsion course built on shaky $\gamma$, $M$, and control-volume reasoning will teach you vocabulary, not engineering. |

### Section-by-section mapping

Use this **regardless of your total** — a strong total can hide one bad
section, and Part II will find it.

| section | max | you may skim if | you must work if | module |
|---|---|---|---|---|
| **A** Thermodynamics | 15 | ≥ 12 | ≤ 10 | [01 — Thermodynamics for propulsion](part1-foundations/01-thermodynamics.md) |
| **B** Compressible flow | 20 | ≥ 16 | ≤ 13 | [02 — Compressible flow and nozzles](part1-foundations/02-compressible-flow.md) |
| **C** Rocket performance | 20 | ≥ 16 | ≤ 13 | [03 — Rocket performance](part1-foundations/03-performance.md) |
| **D** Thermochemistry | 15 | ≥ 12 | ≤ 10 | [04 — Thermochemistry and CEA](part1-foundations/04-thermochemistry-cea.md) |
| **E** HT / fluids / structures | 15 | ≥ 12 | ≤ 10 | Not a Part I module — feeds [10](part2-liquid/10-heat-transfer.md), [11](part2-liquid/11-cooling.md), [07](part2-liquid/07-injectors.md), [16](part2-liquid/16-materials.md). A weak E does not delay Part I but *will* hurt in Part II; review heat transfer and mechanics of materials alongside modules 05–06. |
| **F** Literacy | 15 | ≥ 12 | ≤ 10 | Breadth, not depth. Low F with high A–D means you can do the analysis but have not read enough hardware: work through [`reference/engine-database.md`](reference/engine-database.md) and [module 13 — engine cycles](part2-liquid/13-engine-cycles.md) early, out of order, and use [Part VI engine identification](part6-interview/engine-identification.md) as drill. |

Scores between the two thresholds mean: **read the module normally, but you
may skip its problem set if you are short of time.**

### Specific red flags, whatever the total

These individual items are load-bearing. Getting any of them wrong points at
a specific gap that will compound:

| you missed | what it means | fix before |
|---|---|---|
| **A1** or used $R = 287$ anywhere | You are not distinguishing $R_u/\mathcal{M}$ from air. Every rocket gas calculation will be wrong. | anything |
| **B2** (could not derive area–velocity) | You are memorising nozzle relations, not understanding them. This is the single most important derivation in Part I. | module 03 |
| **B4(b)** (did not see $\dot m \propto p_c$) | The choked-flow proportionality underlies throttling, sizing, and all solid-motor internal ballistics. | modules 03, 20 |
| **C3(a)** stage 2 (forgot to jettison stage-1 dry mass) | You can write Tsiolkovsky but not apply it. | any mission analysis |
| **C5** (could not say why $c^{*}$ and $C_F$ are split) | This is the diagnostic language of the entire field; every test report is written in it. | module 03 |
| **D2(a)** (inverted $\phi$) | Definitional, but it will invert every combustion argument you make. | module 04 |
| **D4(b)** (thought optimum O/F is stoichiometric) | The most consequential misconception in propellant selection. | module 04 |
| **E2(c)** (thought wall conductivity sets $q''$) | You will misdiagnose every cooling problem in Part II. | module 10 |
| **B5(c)** and **C2(d)** (accepted the sea-level number uncritically) | Ideal-equation answers without a physical validity check. This is the habit the course is trying to build. | anything |

### A note on the numbers

Every figure in this key was computed from the stated inputs at full double
precision; if your answer differs in the fourth significant figure, that is
rounding, not error. Real-engine figures (F-1, RS-25, Merlin, RL10) are
approximate, drawn from widely published sources, and appear only to set the
scale of an answer — the course's single source for engine numbers is
[`reference/engine-database.md`](reference/engine-database.md).
