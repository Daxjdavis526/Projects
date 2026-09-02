# Part III Exam — Answer Key

Key for [`exam-part3.md`](exam-part3.md). Contains full worked solutions
with units, why each wrong multiple-choice option is wrong, a rubric for
every question, a section scoring guide, and the common wrong answers this
paper is designed to catch.

**Exam propellant** (generic, not a real formulation):
$r_{\mathrm{ref}} = 9.00$ mm/s at $7.50$ MPa, $n = 0.30$,
$\rho_p = 1800\ \mathrm{kg/m^3}$, $c^* = 1520$ m/s,
$\sigma_p = 0.0024\ \mathrm{K^{-1}}$, $\gamma = 1.17$.

Derived once and used throughout:

$$a = \frac{r_{\mathrm{ref}}}{p_{\mathrm{ref}}^{\,n}}
= \frac{9.00\times10^{-3}}{(7.50\times10^{6})^{0.30}}
= 7.7933\times10^{-5}\ \mathrm{m\,s^{-1}Pa^{-0.30}}$$

$$\frac{1}{1-n} = 1.42857,\qquad
a\rho_pc^* = 7.7933\times10^{-5}\times1800\times1520 = 213.23,\qquad
\pi_K = \frac{\sigma_p}{1-n} = 3.4286\times10^{-3}\ \mathrm{K^{-1}}$$

All arithmetic is carried at full precision in
[`../tools/examples/exam-part3.py`](../tools/examples/exam-part3.py) and
recomputed by `python3 tools/check_examples.py`. Numbers are reported to
4–5 significant figures; last-digit differences from your own arithmetic
are not errors.

---

## Section A — Propellant fundamentals and burn rate (25 points)

### A1 (3 pts) — **(b)** $a' = 4.92$, $a = 7.79\times10^{-5}$

$$a' = \frac{9.00}{7.50^{0.30}} = \frac{9.00}{1.8303} = 4.9173
\ \mathrm{(mm/s)\,MPa^{-0.30}}$$

$$a = a'\times10^{-3}\times\left(10^{-6}\right)^{0.30}
= 4.9173\times10^{-3}\times1.5849\times10^{-2}
= 7.7933\times10^{-5}\ \mathrm{m\,s^{-1}Pa^{-0.30}}$$

**The rule:** $a$ carries the units of $r$ divided by the units of $p$
**raised to the power $n$**, so a pressure-unit conversion must itself be
raised to $n$ — here $(10^{-6})^{0.30} = 10^{-1.8}$, not $10^{-6}$.

**Why the others are wrong.**
- **(a)** converts only the length unit ($\mathrm{mm\to m}$) and leaves the
  pressure unit alone. It is out by $10^{1.8} = 63.1$.
- **(c)** $1.20$ is $9.00/7.50$ — dividing by the pressure instead of by
  $p^{n}$, i.e. silently assuming $n = 1$.
- **(d)** applies the full $10^{-6}$ instead of $(10^{-6})^{0.30}$. This is
  the single most common unit error in solid internal ballistics and it is
  out by a factor of $10^{4.2} = 1.6\times10^{4}$; it produces burn rates of
  microns per second and a "motor" that never lights.

**Rubric.** 2 pts for (b); 1 pt for the stated rule. No credit for the rule
if the option chosen contradicts it.

### A2 (12 pts)

**(a) (2 pts)**

$$A_t = \frac{\pi}{4}(0.180)^2 = 2.5447\times10^{-2}\ \mathrm{m^2},\qquad
A_b = K_nA_t = 260\times2.5447\times10^{-2} = 6.6162\ \mathrm{m^2}$$

**(b) (3 pts)**

$$p_c = \left(a\rho_pc^*K_n\right)^{\frac{1}{1-n}}
= \left(213.23\times260\right)^{1.42857}
= (5.5440\times10^{4})^{1.42857} = 5.9824\times10^{6}\ \mathrm{Pa}$$

$$= \mathbf{5.982\ MPa}$$

$$r = a\,p_c^{\,n} = 7.7933\times10^{-5}(5.9824\times10^{6})^{0.30}
= 8.4098\times10^{-3}\ \mathrm{m/s} = \mathbf{8.410\ mm/s}$$

Closure check:

$$\dot m_{gen} = \rho_pA_br = 1800\times6.6162\times8.4098\times10^{-3}
= 100.15\ \mathrm{kg/s}$$
$$\dot m_{noz} = \frac{p_cA_t}{c^*}
= \frac{5.9824\times10^{6}\times2.5447\times10^{-2}}{1520}
= 100.15\ \mathrm{kg/s}\quad\checkmark$$

**(c) (3 pts)** With $\gamma = 1.17$, $\varepsilon = 12.0$, $p_a = 0$:

$$C_{F,\mathrm{vac}} = 1.7850$$

$$F = C_Fp_cA_t = 1.7850\times5.9824\times10^{6}\times2.5447\times10^{-2}
= 2.7174\times10^{5}\ \mathrm{N} = \mathbf{271.7\ kN}$$

$$I_{sp,\mathrm{vac}} = \frac{c^*C_F}{g_0} = \frac{1520\times1.7850}{9.80665}
= \mathbf{276.7\ s}$$

*Sanity:* 277 s vacuum at $\varepsilon = 12$ for an aluminised composite is
right — the GEM family sits at 274–280 s at comparable expansion.

**(d) (2 pts)**

$$\pi_K = \frac{\sigma_p}{1-n} = \frac{0.0024}{0.70}
= 3.4286\times10^{-3}\ \mathrm{K^{-1}} = \mathbf{0.343\ \%\ per\ kelvin}$$

**(e) (2 pts)** $\Delta T = +35$ K:

$$\frac{p_{c,\mathrm{hot}}}{p_{c,21^\circ\mathrm{C}}} = e^{\pi_K\Delta T}
= e^{0.12} = 1.1275 \;\Rightarrow\;
p_{c,\mathrm{hot}} = 1.1275\times5.982 = \mathbf{6.745\ MPa}$$

$\Delta T = -35$ K: $e^{-0.12} = 0.88692 \Rightarrow 5.306$ MPa. Band ratio:

$$\frac{p_{c,+35}}{p_{c,-35}} = e^{0.24} = \mathbf{1.271}$$

a 27 % spread on the same motor from conditioning alone.

**Rubric.** (a) 1 pt each. (b) 2 pts for $p_c$, 1 pt for a genuine closure
check (stating "they agree" without both numbers earns 0). (c) 1 pt each
for $C_F$, $F$, $I_{sp}$; full credit if $C_F$ is within 0.01 of 1.785.
(d) 1 pt value, 1 pt for the %/K statement. (e) 1 pt hot pressure, 1 pt
band ratio. **Deduct up to 30 % only** for arithmetic slips carried
consistently; a chain that uses $e^{\sigma_p\Delta T}$ in (e) instead of
$e^{\pi_K\Delta T}$ loses both marks in (e) — that is a setup error, not
arithmetic.

### A3 (6 pts) — Derivation

**(a) (3 pts)** Mass balance on the gas occupying the free port volume
$V_c$ [m³]:

$$\frac{d}{dt}\left(\rho_gV_c\right)
= \underbrace{\rho_pA_br}_{\text{generated}}
- \underbrace{\frac{p_cA_t}{c^*}}_{\text{discharged}}$$

Terms and units: $\rho_g$ [kg/m³] port gas density; $\rho_p$ [kg/m³] solid
propellant density; $A_b$ [m²] instantaneous burning area; $r$ [m/s] linear
regression rate; $p_c$ [Pa] port stagnation pressure; $A_t$ [m²] throat
area; $c^*$ [m/s] delivered characteristic velocity. Both sides are kg/s.

The four assumptions behind $\dot m_{noz} = p_cA_t/c^*$:

1. the **nozzle throat is choked**, so mass flow is set by stagnation
   conditions and $A_t$ alone and is independent of back pressure;
2. **$c^*$ is constant** — combustion is complete and at its equilibrium
   temperature and composition, and $\eta_{c^*}$ does not vary through the
   burn;
3. the chamber is **lumped**: one pressure, one temperature, no head-to-aft
   gradient, so $p_c$ is a single number;
4. **no mass is stored anywhere else** — no unvented crack, no igniter
   cavity filling, no condensed phase accumulating as slag.

**(b) (2 pts)** At equilibrium the accumulation term vanishes, and
substituting Vieille, $r = ap_c^{\,n}$:

$$\rho_pA_b\,a\,p_c^{\,n} = \frac{p_cA_t}{c^*}
\;\Longrightarrow\;
p_c^{\,1-n} = a\rho_pc^*\frac{A_b}{A_t}
\;\Longrightarrow\;
\boxed{\,p_c = \left(a\rho_pc^*K_n\right)^{\frac{1}{1-n}}\,}$$

**(c) (1 pt)** The generation term goes as $p^n$ and the discharge term goes
as $p^1$. For $n<1$ the generation curve is concave and crosses the straight
discharge line once **from above**: right of the crossing discharge exceeds
generation and pressure falls back; left of it generation wins and pressure
rises. The crossing is stable. For $n>1$ generation is convex, the crossing
is from below, and any excursion to higher pressure raises generation faster
than discharge — runaway to case burst. Equivalently: the exponent
$1/(1-n)$ is positive and finite only for $n<1$; it diverges at $n=1$ and
changes sign beyond.

**Rubric.** (a) 1 pt the balance written correctly, 1 pt all terms defined
with units, 1 pt for **at least three** of the four assumptions. (b) 1 pt
for substituting Vieille, 1 pt for the algebra. (c) 1 pt for either the
graphical or the sign-of-exponent argument; the graphical argument earns it
outright, the algebraic one only if the student says *why* the sign matters.
No credit anywhere for quoting the boxed result without deriving it.

### A4 (4 pts)

**(a) (2 pts)** $\sigma_p$ is measured **at constant pressure** — in a
strand burner the pressure is imposed from outside and the sample cannot
push back. In a motor the geometry, not the pressure, is fixed: the hotter
grain burns faster, which makes more gas, which raises the chamber pressure,
which raises the burn rate again. The measured motor sensitivity is
therefore $\pi_K = \sigma_p/(1-n) = 1.4286\,\sigma_p$, and
$e^{0.0034286\times35} = 1.1275$ — a **12.7 %** rise, exactly what was seen.
The colleague used the strand number ($e^{0.0024\times35} = 1.088$, 8.8 %)
where the motor number belonged.

**(b) (2 pts)** Two distinct reasons:

1. **Extrapolation outside the fitted range.** $r = ap^n$ is an empirical
   fit, not a law; composite propellants routinely change slope outside the
   fitted band (plateau and mesa behaviour), so $n$ measured over 3–11 MPa
   says nothing about 0.4 MPa. Below the fit the true rate is usually much
   lower than the extrapolation.
2. **The quasi-steady assumption fails, and so may combustion itself.**
   Tail-off is where $dp/dt$ is largest, so the surface thermal wave lags
   the pressure and Vieille's quasi-steady premise is void. Worse, 0.4 MPa
   is at or below the **deflagration limit** for AP composites (typically
   0.5–1.5 MPa), where the propellant may not sustain combustion at all —
   the equation predicts a burn rate for a surface that has gone out.

**Rubric.** (a) 1 pt for naming the constant-pressure vs constant-$K_n$
distinction, 1 pt for producing $\pi_K$ and matching 12.7 %. (b) 1 pt each,
and the two reasons must be genuinely distinct — "the fit is not valid" and
"you are outside the range" is one reason written twice.

---

## Section B — Grain geometry and internal ballistics (25 points)

### B1 (10 pts)

**(a) (2 pts)** $A_t = \tfrac{\pi}{4}(0.150)^2 = 1.76715\times10^{-2}\
\mathrm{m^2}$.

**(b), (c) (4 + 2 pts)** With $p_c = (213.23\,K_n)^{1.42857}$ and
$r = ap_c^{0.30}$:

| $w$ (mm) | $A_b$ (m²) | $K_n$ | $p_c$ (MPa) | $r$ (mm/s) | $\bar r$ (mm/s) | $\Delta t$ (s) | $t$ (s) |
|---|---|---|---|---|---|---|---|
| 0 | 4.20 | 237.7 | 5.262 | 8.092 | — | — | 0.00 |
| 20 | 4.55 | 257.5 | 5.900 | 8.375 | 8.234 | 2.429 | 2.43 |
| 40 | 4.72 | 267.1 | 6.217 | 8.507 | 8.441 | 2.369 | 4.80 |
| 60 | 4.70 | 266.0 | 6.179 | 8.492 | 8.500 | 2.353 | 7.15 |
| 80 | 4.40 | 249.0 | 5.624 | 8.255 | 8.374 | 2.388 | 9.54 |
| 100 | 3.60 | 203.7 | 4.222 | 7.575 | 7.915 | 2.527 | 12.07 |
| 115 | 2.10 | 118.8 | 1.955 | 6.013 | 6.794 | 2.208 | **14.27** |

Web burn-through at $t \approx \mathbf{14.3\ s}$.

**(d) (2 pts)** $0\to60$ mm: **progressive**, peaking near $w = 40$ mm.
$60\to115$ mm: **regressive**, and sharply so beyond 80 mm. Peak-to-initial
pressure ratio $= 6.217/5.262 = \mathbf{1.181}$.

The grain is **not** sliver-free. The evidence is the last row: at the web
station the burning area is still $2.10\ \mathrm{m^2}$ — half its initial
value — rather than falling to zero. A sliver-free grain reaches web
burnout with $A_b\to0$ and the pressure collapses; here a substantial
surface survives web burnout and will burn on at a rapidly falling,
poorly-predictable pressure. That is tail-off dispersion, and it is the
largest single contributor to total-impulse scatter in an otherwise
well-made motor.

**Rubric.** (a) 1 pt for $A_t$, 1 pt for a complete $K_n$ row. (b) 4 pts:
3 for the pressures (deduct 1 for up to two slips, 2 for three or more; a
single systematic error such as using $1/(1-n) = 1.30$ costs 3), 1 for
correct units and a sensible number of figures. (c) 1 pt for the burn
rates, 1 pt for the integration; accept 14.0–14.6 s. (d) 1 pt for the two
classifications and the ratio; 1 pt for the sliver call **with** the table
evidence — the call alone earns nothing.

### B2 (8 pts)

**(a) (3 pts)** $\beta = \pi/8 = 22.5^\circ$, $\beta+\theta = 32.5^\circ$.

$$s_0 = 0.280\frac{\sin22.5^\circ}{\sin32.5^\circ}
= 0.280\times\frac{0.38268}{0.53730} = 0.19943\ \mathrm{m}$$

$$P_0 = 2Ns_0 = 16\times0.19943 = 3.1908\ \mathrm{m}$$

$$\frac{dP}{du} = 16\left[\left(\tfrac{\pi}{2}-0.174533\right)
-\cot32.5^\circ\right]
= 16\left[1.39626 - 1.56969\right] = -2.7748\ \mathrm{m/m}$$

At $y = 0$, $u = f = 8.0$ mm: $P = 3.1908 - 2.7748(0.008) = 3.1686$ m,
$A_b = PL = \mathbf{5.0698\ m^2}$.
At $y = 60$ mm, $u = 68$ mm: $P = 3.0021$ m,
$A_b = \mathbf{4.8034\ m^2}$.

**(b) (2 pts)** $dP/du < 0$, so the grain is **regressive**.

$$\frac{A_b(60)}{A_b(0)} = \frac{4.8034}{5.0698} = 0.94746,\qquad
\frac{p_c(60)}{p_c(0)} = 0.94746^{1.42857} = \mathbf{0.9258}$$

A 5.3 % area loss becomes a **7.4 %** pressure loss — the $1/(1-n)$
amplification again.

**(c) (3 pts)** Verification at $\theta = 14.8067^\circ$,
$\beta+\theta = 37.3067^\circ$:

$$\frac{\pi}{2}-\theta = 1.570796 - 0.258426 = 1.312371,\qquad
\cot(37.3067^\circ) = 1.312369$$

Equal to six figures, so $dP/du = 0$ and the grain is exactly neutral.

**(i) Why no radii.** $R_p$ and $f$ enter $P(u)$ only through the
*intercept* $2Ns_0$ (and through where on the $u$-axis you start). The
*slope* comes entirely from the two corner rules: the star-tip arc grows at
$(\pi/2-\theta)$ per half-sector, the valley wedge erodes flank at
$\cot(\beta+\theta)$ per half-sector. Both are pure angles. Neutrality is
the statement that tip growth exactly cancels valley erosion, and that is an
angle balance. The radii set web, burn time and loading — not trace shape.

**(ii) Why the fillet cannot fix it.** A fillet **is** pre-burning: the
filleted grain's port is the sharp polygon offset by $f$, so the fillet only
shifts the starting point along the *same* line $P(u)$. It changes
$P(\text{start})$, never $dP/du$. Changing $f$ changes the initial pressure
and the web, and leaves the progressivity exactly as it was.

**(iii) What neutrality costs.** Moving $\theta$ from $10^\circ$ to
$14.81^\circ$ widens the star points. At the same $R_p$:
$R_i$ grows from $0.0905$ m to $0.1181$ m and the sharp-polygon port area
$A_0 = NR_pR_i\sin\beta$ grows from $0.0776\ \mathrm{m^2}$ to
$0.1012\ \mathrm{m^2}$ — **+30 % port area**, which is propellant not
loaded. The perimeter intercept also falls (3.191 m → 2.829 m), so the
initial burning area and hence the initial thrust drop by 11 % at the same
throat. Neutrality is bought with volumetric loading and with thrust level.

**Rubric.** (a) 1 pt $s_0$/$P_0$, 1 pt slope (sign required), 1 pt both
$A_b$ values. (b) 1 pt classification, 1 pt pressure ratio — using
$0.94746$ as the pressure ratio (forgetting the exponent) scores 0 for that
mark. (c) 1 pt the numerical verification, 2 pts across (i)–(iii): award
both only if (ii) is answered with the *offset/pre-burning* argument rather
than "the fillet is small."

### B3 (7 pts)

**(a) (3 pts)** $A_t = \tfrac{\pi}{4}(0.120)^2 = 1.13097\times10^{-2}\
\mathrm{m^2}$. $A_b = 2\pi R_iL$.

| station | $R_i$ (m) | $A_b$ (m²) | $K_n$ | $p_c$ (MPa) |
|---|---|---|---|---|
| $w=0$ | 0.110 | 1.7970 | 158.9 | **2.960** |
| web burnout, $w = 0.130$ m | 0.240 | 3.9207 | 346.7 | **9.023** |

**(b) (2 pts)** $p_{c,f}/p_{c,i} = 9.023/2.960 = \mathbf{3.048}$. It follows
from the radius ratio alone because $A_b \propto R_i$ at fixed $L$, and
$A_t$, $a$, $\rho_p$, $c^*$ all cancel in the ratio:

$$\frac{p_{c,f}}{p_{c,i}} = \left(\frac{R_o}{R_{i0}}\right)^{\frac{1}{1-n}}
= \left(\frac{0.240}{0.110}\right)^{1.42857} = 2.1818^{1.42857} = 3.048$$

**(c) (2 pts)**

$$A_p = \pi R_{i0}^2 = 3.8013\times10^{-2}\ \mathrm{m^2},\qquad
J = \frac{A_p}{A_t} = \mathbf{3.36}$$

$$\dot m = \frac{p_cA_t}{c^*}
= \frac{2.9603\times10^{6}\times1.13097\times10^{-2}}{1520}
= 22.03\ \mathrm{kg/s},\qquad
G = \frac{\dot m}{A_p} = \mathbf{579\ kg\,m^{-2}s^{-1}}$$

$G = 579 < G_{th} = 700$, and $J = 3.36$ is comfortably above the
$J \gtrsim 2$ rule, so **erosive burning is not a concern** even at the
smallest port.

The other problem is the trace itself. An unrestricted CP tube is
**violently progressive**: the case, the nozzle and the TVC must all be
sized for 9.0 MPa while the motor spends its first seconds at 3.0 MPa,
where $C_F$ and $c^*$ efficiency are poor, the low-pressure end is
uncomfortably close to the propellant's deflagration limit, and the thrust
is a third of its final value. That is why a plain CP tube is used only
where a progressive trace is wanted (or tolerated in a small, cheap motor)
and why every serious booster grain is slotted, starred, finocyl'd or
tapered.

**Rubric.** (a) 1 pt per correct $p_c$, 1 pt for the areas/$K_n$.
(b) 1 pt value, 1 pt for showing the cancellation explicitly. (c) 1 pt for
$J$ and $G$ with the erosive-burning verdict; 1 pt for naming
progressivity/case-sizing (not "the pressure is high", which is the
observation, not the problem).

---

## Section C — Cases, insulation, nozzles (25 points)

### C1 (9 pts)

**(a) (2 pts)**

$$k_T = e^{\pi_K\times30} = e^{0.0034286\times30} = e^{0.102857} = 1.1083$$

$$\mathrm{MEOP} = 7.00\times1.1083\times1.05\times1.06\times1.03
= \mathbf{8.894\ MPa}$$

$$p_b = 1.40\times8.894 = \mathbf{12.452\ MPa}$$

MEOP is 27 % above nominal, which is squarely in the 10–25 %-and-a-bit band
for a large booster.

**(b) (3 pts)** Hoop stress sizes the wall:

$$t = \frac{p_bR}{F_{tu}} = \frac{12.452\times10^{6}\times0.850}{1500\times10^{6}}
= 7.056\times10^{-3}\ \mathrm{m} = \mathbf{7.06\ mm}$$

$t/R = 0.0083 \ll 0.1$, so the membrane solution is good to well under 1 %
and the Lamé correction is far smaller than the material scatter. ✓

$$m_{cyl} = \rho\,2\pi Rt L_{cyl}
= 7830\times2\pi\times0.850\times7.056\times10^{-3}\times7.00 = 2065\ \mathrm{kg}$$

$$m_{case} = 1.25\times2065 = \mathbf{2582\ kg}$$

**(c) (2 pts)**

$$V = \pi R^2L_{cyl} = \pi(0.850)^2(7.00) = 15.889\ \mathrm{m^3},\qquad
m_p = \eta_V V\rho_p = 0.86\times15.889\times1800 = \mathbf{24{,}596\ kg}$$

$$m_{other} = 0.055\times24{,}596 = 1353\ \mathrm{kg}$$

$$\zeta = \frac{24{,}596}{24{,}596+2582+1353} = \mathbf{0.862}$$

**(d) (2 pts)** Netting:

$$t_L = \frac{1.5\,p_bR}{\sigma_fV_f}
= \frac{1.5\times12.452\times10^{6}\times0.850}{2550\times10^{6}\times0.60}
= 1.038\times10^{-2}\ \mathrm{m} = \mathbf{10.38\ mm}$$

Thicker, but far lighter:

$$m_{case} = 1.25\times1580\times2\pi\times0.850\times1.0376\times10^{-2}\times7.00
= \mathbf{766\ kg}$$

$$\zeta = \frac{24{,}596}{24{,}596+766+1353} = \mathbf{0.921}$$

Vessel indices:

$$\left.\frac{PV}{W}\right|_{\mathrm{steel}} = \frac{\sigma}{2\rho g_0}
= \frac{1500\times10^{6}}{2\times7830\times9.80665} = 9.77\ \mathrm{km}$$

$$\left.\frac{PV}{W}\right|_{\mathrm{netting}} = \frac{\sigma_fV_f}{3\rho g_0}
= \frac{2550\times10^{6}\times0.60}{3\times1580\times9.80665} = 32.9\ \mathrm{km}$$

**Which number to show the manager: $\zeta$, not $PV/W$.** $PV/W$ is a
material-only index — it says the composite is 3.4× better, which is true
and useless, because it excludes domes, bosses, skirts, insulation, nozzle
and igniter. The motor-level answer is 0.862 → 0.921, i.e. the case mass
falls by 70 % but the *motor* inert mass only falls by 46 %, and it is the
motor number that turns into $\Delta v$. Quoting 3.4× to a manager is how
programmes acquire mass-growth problems.

*Sanity:* 0.862 and 0.921 bracket the published RSRM (≈0.85, segmented
steel) and P120C (≈0.924, monolithic composite) figures. The model is
behaving.

**Rubric.** (a) 1 pt $k_T$, 1 pt MEOP and $p_b$. (b) 1 pt thickness,
1 pt thin-wall check (a bare assertion earns 0 — the ratio is required),
1 pt case mass. (c) 1 pt $m_p$, 1 pt $\zeta$. (d) 1 pt composite $\zeta$,
1 pt the $PV/W$-vs-$\zeta$ judgment. Using $\sigma_\theta = pR/2t$ (the
axial stress) to size the wall is a setup error: 0 for (b) and carry the
error forward without further penalty.

### C2 (7 pts)

**(a) (2 pts)** $A_{b,1} = \pi D L_g = \pi(0.320)(4.50)
= \mathbf{4.5239\ m^2}$. MEOP $= 1.50\times6.50 = 9.75$ MPa;
burst $= 1.40\times9.75 = 13.65$ MPa.

**(b) (3 pts)** $\Delta A_b = 2\pi R_cL_d$, and
$p_2/p_1 = (A_{b,2}/A_{b,1})^{1/(1-n)} = (\cdot)^{1.42857}$:

| $L_d$ (m) | $\Delta A_b$ (m²) | $A_{b,2}$ (m²) | ratio | $p_2/p_1$ | $p_2$ (MPa) | verdict |
|---|---|---|---|---|---|---|
| 0.40 | 1.508 | 6.032 | 1.3333 | 1.5083 | **9.80** | above MEOP (9.75), below burst (13.65) — case survives, motor is out of family |
| 1.00 | 3.770 | 8.294 | 1.8333 | 2.3772 | **15.45** | **above burst** — the case ruptures |

**(c) (2 pts)** Set $p_2/p_1 = 13.65/6.50 = 2.1000$:

$$\frac{A_{b,2}}{A_{b,1}} = 2.1000^{\,1-n} = 2.1000^{0.70} = 1.6809$$
$$\Delta A_b = 0.6809\times4.5239 = 3.081\ \mathrm{m^2},\qquad
L_d = \frac{3.081}{2\pi(0.600)} = \mathbf{0.817\ m}$$

**Why this is an upper bound, not an allowable.** (1) It is an
*equilibrium* number, and a debond opening at ignition is not quasi-steady:
the transient overshoots the equilibrium pressure, so the case sees more
than 13.65 MPa before the equilibrium is reached. (2) The calculation only
counts **Path A**, added burning area. A debond is also **Path B** — a gas
path to the case wall. Gas at 3400 K running along a debonded case burns
through a steel wall in seconds at no overpressure whatsoever, and the
debond front propagates at hundreds of metres per second, so $L_d$ is not a
fixed number but an initial condition. The design allowable for interfacial
defects is therefore categorical (none permitted, location- and
orientation-based acceptance), not a length computed this way.

**Rubric.** (a) 1 pt area, 1 pt MEOP/burst. (b) 1 pt per row plus 1 pt for
comparing *both* rows against *both* thresholds. (c) 1 pt for 0.82 m,
1 pt for the caveats — one caveat earns half, and the answer must name
either the ignition transient or the Path-B/thermal mechanism to score.

### C3 (9 pts)

**(a) (3 pts)** $\dot s = 6.0\times10^{-5}$ m/s, $t = 95$ s:

$$x \equiv 1+\frac{\dot st}{r_{t0}} = 1+\frac{6.0\times10^{-5}\times95}{0.120}
= 1.0475$$

$$\frac{A_t(95)}{A_t(0)} = x^2 = 1.0973 \quad(\mathbf{+9.7\ \%})$$
$$\frac{p_c(95)}{p_c(0)} = x^{-2/(1-n)} = 1.0475^{-2.85714} = \mathbf{0.8758}$$
$$\frac{F(95)}{F(0)} = x^{-2n/(1-n)} = 1.0475^{-0.857143} = \mathbf{0.9610}$$

Pressure down 12.4 %, thrust down only 3.9 %.

**(b) (3 pts)** $\dot s = 1.3\times10^{-4}$ m/s:

$$x = 1+\frac{1.3\times10^{-4}\times95}{0.120} = 1.10292,\qquad
x^2 = 1.2164\quad(\mathbf{+21.6\ \%\ throat\ area})$$
$$\frac{p_c(95)}{p_c(0)} = 1.10292^{-2.85714} = \mathbf{0.7559}
\;\Rightarrow\; p_c(95) = 5.669\ \mathrm{MPa}$$
$$\frac{F(95)}{F(0)} = 1.10292^{-0.857143} = \mathbf{0.9195}$$

The long way. $A_{t0} = \pi(0.120)^2 = 4.5239\times10^{-2}\ \mathrm{m^2}$;
$A_e = 16.0\,A_{t0} = 0.72382\ \mathrm{m^2}$;
$A_t(95) = \pi(0.13235)^2 = 5.5030\times10^{-2}\ \mathrm{m^2}$;
$\varepsilon(95) = 0.72382/0.055030 = 13.15$.

$$C_{F,\mathrm{vac}}(\varepsilon = 16.0,\ 7.50\ \mathrm{MPa}) = 1.8207,\qquad
C_{F,\mathrm{vac}}(\varepsilon = 13.15,\ 5.669\ \mathrm{MPa}) = 1.7967$$

$$F(0) = 1.8207\times7.50\times10^{6}\times4.5239\times10^{-2} = 617.8\ \mathrm{kN}$$
$$F(95) = 1.7967\times5.669\times10^{6}\times5.5030\times10^{-2} = 560.5\ \mathrm{kN}$$
$$\frac{F(95)}{F(0)} = \mathbf{0.9074}$$

against 0.9195 from the constant-$C_F$ formula. The gap is
$1 - 0.9074/0.9195 = 1.32$ % of $F(0)$, and it is **exactly** the $C_F$
ratio $1.7967/1.8207 = 0.9868$ — i.e. all of the discrepancy is the
expansion ratio walking down from 16.0 to 13.2 as the throat opens.

$$I_{sp,\mathrm{vac}} = \frac{c^*C_F}{g_0}:\quad 282.2\ \mathrm{s}
\to 278.5\ \mathrm{s},\qquad \Delta I_{sp} = \mathbf{-3.7\ s}$$

**(c) (3 pts)**

*Why thrust falls less than pressure.* $F = C_Fp_cA_t$. The throat grows,
which multiplies $F$ by $x^2$, at the same time as the pressure falls by
$x^{-2/(1-n)}$. The exponents partly cancel and the survivor is
$-2n/(1-n) = -0.857$ against $-2.857$ for pressure. A hypothetical $n=0$
propellant would hold thrust perfectly constant under throat erosion.

*Why the burn takes longer.* $\dot m = p_cA_t/c^*$ tracks thrust, so mass
flow falls by 8 %; at fixed $A_b$ that means $r$ falls, and the same web
therefore takes longer to consume than the rigid-throat prediction.

*Why total impulse is nearly conserved but the trajectory is not.* The
propellant mass is what it is; total impulse is $m_pI_{sp}g_0$ and only the
small $I_{sp}$ change (here −3.7 s, −1.3 %) touches it. What changes is the
*shape*: a lower, flatter, longer trace. For a booster whose max-Q, staging
time and steering are designed around the thrust–time curve, that is the
entire problem — the guidance sees a different vehicle.

*The public failure.* **Vega-C flight VV22, 20 December 2022**: the
Zefiro 40 second-stage motor ran under-pressure and the vehicle was lost.
The independent enquiry attributed it to unexpected erosion of the
**carbon–carbon nozzle throat insert**, traced to a change of insert
material supplier. It is the modern reference case for "a materials
qualification decision in a subcomponent destroyed a launch vehicle."
*(Grader's note: the course's verification file records the
supplier-change attribution at confidence C — the enquiry press release
itself was not reachable. Accept the answer; a student who flags the
provenance caveat has earned the point twice over.)*

**Rubric.** (a) 1 pt each for area growth, pressure ratio, thrust ratio.
(b) 1 pt for the three ratios, 1 pt for the long-way thrust with the eroded
$\varepsilon$, 1 pt for attributing the gap to $C_F$ **and** giving
$\Delta I_{sp}$. (c) 1 pt for the exponent-cancellation argument, 1 pt for
burn time + total impulse vs trajectory, 1 pt for naming Vega-C VV22 /
Zefiro 40 with the throat-insert cause. Accept "a Vega-C second-stage
failure" with the correct mechanism for the full point; accept no other
flight.

---

## Section D — Manufacturing, history, requirements (25 points)

### D1 (8 pts)

**(a) (2 pts)**

$$N_b = \left\lceil\frac{26{,}000}{2{,}400}\right\rceil
= \lceil 10.83\rceil = \mathbf{11\ batches}$$

Each mixer can deliver $\lfloor 7.0/3.5\rfloor = 2$ batches inside the
propellant working life, so

$$N_{\mathrm{mixers}} \ge \left\lceil\frac{11}{2}\right\rceil
= \mathbf{6\ mixers}$$

running in parallel. Note this is a *hard* constraint, not a rate
constraint: with five mixers the eleventh batch arrives after the first has
passed its working life and the motor cannot be cast at all.

**(b) (3 pts)**

| station | occupancy | units | capacity (motors/day) |
|---|---|---|---|
| casting bay | $(7.0+5.0)/24 = 0.500$ d | 1 | 2.000 |
| **cure pits** | $0.5+7.0+1.5+0.5 = 9.5$ d | 8 | **0.8421** |
| CT cell | 12.0 h at 20 h/day | 1 | 1.6667 |

$$\dot N = \eta_a\min(2.000,\ 0.8421,\ 1.6667)
= 0.80\times0.8421 = 0.6737\ \mathrm{motors/day}$$

$$\times30 = \mathbf{20.2\ motors\ per\ 30\text{-}day\ month}$$

**The cure pits bind**, by 2.4× over the casting bay and 2.0× over CT.

**(c) (3 pts)** Target $2\times0.6737 = 1.3474$ motors/day.

Each added pit is worth $\eta_a/9.5 = 0.08421$ motors/day
$= \mathbf{2.53\ motors/month}$, and pits keep paying until the pit
capacity $N/9.5$ overtakes the next station. That is the CT cell at
$N = 1.6667\times9.5 = 15.8 \to \mathbf{16\ pits}$.

At 16 pits the line runs $0.80\times1.6667 = 1.3333$ motors/day
$= 40.0$ motors/month — against the 40.4 needed. **Pits alone do not quite
double the line**; the CT cell binds first. Completing the doubling needs
$1.3474/0.80\times12.0 = 20.2$ h/day of CT, i.e. a second cell or a
24-hour CT operation, on top of the eight extra pits.

Two reasons the 40 motors/month figure is optimistic as a *delivery*
forecast (any two):

- **Acceptance-lot static-test motors consume line capacity and deliver
  nothing.** Every lot owes at least one full-scale static firing, plus its
  stand scheduling, data review and disposition.
- **Rework loops after NDE findings** are not in the model: a CT indication
  sends a motor to disposition, and the pit and the CT slot are both spent.
- **Long-lead supply is invisible in this arithmetic.** Carbon-phenolic
  nozzles and their rayon-precursor supply chain, cases, and ammonium
  perchlorate — a single-source material for the whole US industry — set
  delivery long before pit count does.
- **Zero mixer redundancy**, from (a): six mixers are required and six is
  what it takes, so one mixer in maintenance stops casting entirely.
- Holidays, shift patterns, scheduled facility maintenance and the
  0.80 availability itself being optimistic for a line running flat out.

**Rubric.** (a) 1 pt batches, 1 pt mixers (ceiling arithmetic must be
shown; $11/2 = 5.5 \to 5$ scores 0). (b) 1 pt the three capacities, 1 pt
identifying the pits, 1 pt the monthly figure. (c) 1 pt for 16 pits **with**
the recognition that the CT cell then binds (16 pits alone, with no mention
of CT, earns half), 1 pt for 2.53 motors/month per pit, 1 pt for two
distinct optimism reasons. A student who answers "23.75 → 24 pits" has
compared against the casting bay and skipped the CT cell: half credit for
the method, no credit for the number.

### D2 (8 pts)

**(a) (3 pts)** At fixed $A_t$, $c^*$ and propellant,
$p_c \propto A_b^{1/(1-n)}$, so

$$\frac{A_{b,2}}{A_{b,1}} = \left(\frac{p_2}{p_1}\right)^{1-n}
= \left(\frac{6.57}{6.20}\right)^{0.70} = 1.05968^{0.70}
= \mathbf{1.0414}$$

A **4.14 %** increase in burning surface produced the 5.97 % pressure step.

**(b) (2 pts)** Mass flow $\dot m = p_cA_t/c^*$ rises in the same 5.97 %
proportion, so the propellant remaining at $t = 9.2$ s is consumed 5.97 %
faster. Predicted remaining burn was $43.5-9.2 = 34.3$ s:

$$t_{\mathrm{tail-off}} = 9.2 + \frac{34.3}{1.05968} = 9.2+32.37
= \mathbf{41.6\ s}$$

against 41.0 s observed — within 1.4 %, which is inside the precision of
reading "tail-off begins" off a trace. And because $\int p_c\,dt$ is
proportional to $m_pc^*/A_t$, a pure area change conserves it exactly:
higher pressure for proportionally less time. The record's conserved
$\int p_c\,dt$ is therefore *confirmation* of the diagnosis, not an
independent puzzle.

**(c) (3 pts)**

**Diagnosis.** A discrete, permanent addition of about 4 % burning surface
appearing 9 s into the burn — a grain crack opening, or a small
propellant/liner debond unzipping, in a region the ballistic design did not
count as burning.

| candidate | verdict | the evidence |
|---|---|---|
| **(i) hot-conditioned grain** | ruled **out** | A $\sigma_p$/$\pi_K$ effect is present from ignition. This trace was on prediction to $\pm0.5$ % for the first 9.1 s, including ignition peak and time-to-pressure. A conditioning error cannot switch on at $t = 9.2$ s. |
| **(ii) slag or throat blockage** | ruled **out** | A 5.97 % rise from blockage needs $A_t$ down by $(p_2/p_1)^{-(1-n)} = 0.960$, i.e. −4.0 % in area, −2.0 % in throat radius (≈1.5 mm on this motor). Post-fire the throat is within 1 % of predicted erosion, so the metal disagrees. Blockage also relaxes as debris clears or re-erodes; this step is flat and permanent. |
| **(iii) erosive burning** | ruled **out** | Erosive burning is largest where port mass flux is largest — at ignition, when the port is smallest — and *decays* as the port opens. It produces an early hump that dies away, the opposite of a step at 9 s onto a new plateau. |
| **(iv) out-of-family burn-rate lot** | ruled **out** | A high $a$ offsets the whole trace from $t=0$; here the first 9 s are nominal. It would also have shown in the strand data and in the four previous motors from the same lot, both of which were nominal. |

The only candidate consistent with *nominal until 9.2 s*, *step in 150 ms*,
*flat thereafter*, *shortened burn*, *conserved $\int p\,dt$*, and *clean
post-fire hardware* is a burning-surface defect that opened during the
burn.

**Rubric.** (a) 2 pts for the correct inversion of the $1/(1-n)$ law, 1 pt
for the number; quoting 6 % as the area change (forgetting the exponent
entirely) scores 0. (b) 1 pt for the burn-time prediction, 1 pt for
explaining why $\int p\,dt$ is conserved. (c) 1 pt for the diagnosis, 2 pts
across the four candidates — award both only if at least three are
dismissed with *evidence from this record* rather than with generalities,
and the throat-blockage dismissal must use either the post-fire throat
measurement or the −2 % radius arithmetic.

### D3 (9 pts)

**(a) (3 pts)**

$$\zeta_{\mathrm{RSRM}} = \frac{500{,}000}{590{,}000} = \mathbf{0.8475},
\qquad
\zeta_{\mathrm{P120C}} = \frac{141{,}400}{153{,}000} = \mathbf{0.9242}$$

Ideal $\Delta v$ for the motor alone,
$\Delta v = I_{sp}g_0\ln\!\left[1/(1-\zeta)\right]$:

$$\Delta v_{\mathrm{RSRM}} = 268\times9.80665\times\ln\frac{1}{0.15254}
= \mathbf{4942\ m/s}$$
$$\Delta v_{\mathrm{P120C}} = 280\times9.80665\times\ln\frac{1}{0.07582}
= \mathbf{7083\ m/s}$$

Splitting the 2141 m/s difference: hold $I_{sp}$ at 268 s and take only the
mass fraction to 0.9242, and $\Delta v$ goes to 6779 m/s.

$$\text{mass-fraction share} = \frac{6779-4942}{7083-4942}
= \frac{1837}{2141} = \mathbf{85.8\ \%}$$

$I_{sp}$ contributes the other 14.2 %. **The case, not the chemistry, is
where the performance is.** That is the single most useful number-pair in
Part III.

**(b) (2 pts)**

$$m_{\mathrm{inert}} = m_p\frac{1-\zeta}{\zeta}$$

- P120C-class $\zeta = 0.9242$ applied to 500,000 kg of propellant:
  $\mathbf{41{,}000\ kg}$ inert, against the RSRM's actual ≈ 90,000 kg —
  a **49,000 kg** saving per booster, 98 t per stack.
- RSRM-class $\zeta = 0.8475$ applied to 141,400 kg of propellant:
  $\mathbf{25{,}500\ kg}$ inert, against the P120C's actual ≈ 11,600 kg —
  the same motor would be **13,900 kg** heavier.

**(c) (4 pts)** Four constraints, at least one non-materials:

1. **Materials and qualification maturity (1973).** Filament-wound
   composite cases at 3.7 m diameter and 500 t of propellant were not a
   qualified article. The Shuttle programme did pursue a filament-wound
   case booster and abandoned it; D6AC steel came with an established
   fracture-control practice, known allowables and a supply base. Choosing
   the unqualified case on the critical path of a crewed vehicle was not a
   defensible risk in 1973.
2. **Logistics — the constraint that actually decides it.** The RSRM was
   cast in Promontory, Utah and shipped to Kennedy Space Center **by rail**.
   Rail car length and tunnel/clearance envelopes cap what can be moved, so
   the motor *must* be delivered in segments, and a segmented motor needs
   field joints and needs a case that can be bolted, handled and stacked
   repeatedly. P120C is cast at Kourou and Colleferro, essentially beside
   the launch site, so its length is limited by the casting hall and the
   crane, not by a railroad. **A 2020s material does not move a factory.**
3. **Recovery and reuse.** The Shuttle booster was designed to be
   parachuted into salt water, recovered, disassembled, refurbished and
   reflown. That favours a tough, inspectable, repairable steel case that
   tolerates water impact and can be non-destructively re-qualified;
   composite is far less forgiving of impact damage and salt-water service.
   P120C is expended, which removes the requirement entirely.
4. **Manufacturing and handling infrastructure.** A monolithic 500 t grain
   requires a casting pit, a mandrel, a cure oven, an NDE capability and a
   crane that did not exist and, for that mass, arguably still do not. The
   segmented architecture lets the propellant be cast in manageable casting
   segments and assembled — the same reason LVM3's S200 and the Ariane 5
   EAP are segmented.

*(Also creditable: cost and schedule risk on a national programme; the
ability to replace one damaged segment rather than scrap a whole motor;
and the fact that PBAN was retained for the same conservatism reason and is
still flying on SLS.)*

**The counter-argument, which must appear for full marks.** Segmentation
bought the field joints, and a field joint is exactly what destroyed
*Challenger*: a tang-and-clevis joint that *rotated* open under ignition
pressure faster than a cold-stiffened O-ring could extrude into the gap.
The RSRM redesign — capture feature, third O-ring, joint heaters — is the
programme paying interest on the 1973 architecture decision. And the mass
fraction penalty is permanent: 0.8475 against 0.9242.

**Would a 1973 engineer with 2020s materials have built it the P120C way?**
Only partly. The composite case solves the material problem and buys 49 t
per booster, but it does **not** solve the two constraints that actually
forced segmentation: the motor still has to get from Utah to Florida, and
it still has to survive an Atlantic recovery. To go monolithic they would
have had to move the factory to the Cape *and* give up reuse — i.e. build a
different programme, not a different case. That is the honest answer, and
it is why P120C, which has neither constraint, is monolithic.

**Rubric.** (a) 1 pt the two $\zeta$, 1 pt the two $\Delta v$, 1 pt the
85.8 % / 14.2 % split (a split done by any defensible method scores; simply
asserting "mostly the case" without arithmetic scores 0). (b) 1 pt each
number. (c) 4 pts: 1 pt per constraint up to 3, of which **at least one
must be logistics/manufacturing** or the third mark is withheld; the 4th pt
requires *both* the field-joint counter-argument *and* a defended answer to
the 1973-with-modern-materials question. An answer that says only "steel
was all they had" caps at 1 pt for the whole part.

---

## Scoring guide

| section | points | what a good score means |
|---|---|---|
| A — propellant and burn rate | 25 | You can run the internal-ballistics chain end to end with correct units and know $\pi_K \ne \sigma_p$. |
| B — grain geometry | 25 | You can turn a burn-back table into a trace, and you understand neutrality as an angle property. |
| C — cases, insulation, nozzles | 25 | You can size a case from MEOP, price a defect, and separate pressure decay from thrust decay. |
| D — manufacturing, history, requirements | 25 | You can find a bottleneck, diagnose a trace against evidence, and argue an architecture from constraints. |

| total | verdict |
|---|---|
| 90–100 | Interview mastery of solid motors. You could defend this material to a senior motor designer. |
| 75–89 | Working engineering knowledge. Re-read the modules behind your weakest section. |
| 60–74 | Concepts present, execution incomplete. Redo every calculation in modules 20, 21, 24 before proceeding. |
| < 60 | Re-study Part III. Start with module 20 §3.5–3.7 and module 21 §3.4. |

## Common wrong answers, and what they reveal

1. **Converting $a$ with $10^{-6}$ instead of $(10^{-6})^n$** (A1). Reveals
   that the student has memorised the Vieille law as a formula rather than
   as a dimensional statement. It is the single most expensive unit error
   in this field.
2. **Using $e^{\sigma_p\Delta T}$ for a motor pressure shift** (A2e, A4a).
   Reveals a missing distinction between a constant-pressure measurement and
   a constant-$K_n$ motor. Every temperature question in Part III turns on
   this.
3. **Forgetting the $1/(1-n)$ exponent** (B2b, C2, D2a). It appears in
   *four* separate places in this paper — area errors, throat errors,
   temperature, defects — because it is the same mechanism each time.
   Missing it once is arithmetic; missing it in every section is a
   conceptual gap.
4. **Sizing a case wall with $pR/2t$.** That is the axial stress. The
   cylinder is twice as highly stressed circumferentially, which is why
   pressure vessels split longitudinally.
5. **Reporting throat erosion's effect on thrust as equal to its effect on
   pressure** (C3). Reveals that $F = C_Fp_cA_t$ has not been internalised:
   the throat is in the numerator too.
6. **Answering D3(c) with materials only.** Reveals the most common
   professional blind spot in this subject — treating an architecture as a
   materials choice when it was a railroad, a recovery ship and a casting
   pit that decided it.
7. **Quoting $PV/W$ as the answer to "how much lighter is composite"**
   (C1d). Reveals a material-level answer to a system-level question, and
   it is always optimistic.
