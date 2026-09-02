# Part I Exam — Foundations: Answer Key and Grading Rubric

Full worked solutions for [`exam-part1.md`](exam-part1.md). Every step carries
units. Every multiple-choice distractor is explained. Every question carries a
rubric.

All numbers below were computed with `tools/rocket.py` and are registered in
`tools/examples/exam-part1.py`; run `python3 tools/check_examples.py` to
recompute them.

**Constants.** $g_0 = 9.80665\ \mathrm{m/s^2}$,
$R_u = 8314.46\ \mathrm{J/(kmol\,K)}$, $p_a = 101\,325$ Pa at sea level.

**General grading rule** (course README): calculation questions are graded on
method first. A correct setup with an arithmetic slip loses at most 30 % of the
marks for that part. A correct number obtained from a wrong setup scores zero.
Missing units cost 1 mark per question, once, not per line.

---

# Section A — Thermodynamics (20 points)

## A1 — Multiple choice (4 points)

**Answer: (b).**

At the injector face the gas is essentially at rest, so a tap flush with the
face reads the *stagnation* pressure directly. Moving downstream, combustion
adds heat, the gas accelerates to the Mach number set by the contraction ratio,
and because that acceleration is driven by heat addition — a Rayleigh-line
process — the **stagnation** pressure falls with it. That is Module 01 §3.8,
whose momentum balance on a constant-area chamber gives

$$\frac{p_{0,2}}{p_{inj}} = \frac{\left(1+\frac{\gamma-1}{2}M_2^2\right)^{\frac{\gamma}{\gamma-1}}}{1+\gamma M_2^2}$$

**Check against the stated 4 %.** At $\varepsilon_c = 2.2$ and $\gamma = 1.20$
the subsonic root of the area relation gives $M_2 = 0.281$, so

$$\frac{p_{0,2}}{p_{inj}} = \frac{(1+0.10\times0.07896)^{6}}{1+1.20\times0.07896}
= \frac{1.04832}{1.09475} = 0.9576$$

a loss of **4.2 %** — which is the 4 % the question describes, from this
mechanism alone. The loss scales as roughly $\gamma M_2^2$, which is why it is
5 % at $\varepsilon_c = 2$, 2.3 % at $\varepsilon_c = 3$, and under 1 % at
$\varepsilon_c \geq 4$; it is also why contraction ratios below about 2 are a
design error.

**Which reading belongs in $\eta_{c^*}$:** the **nozzle stagnation pressure**,
because $c^* \equiv p_0 A_t/\dot m$ is defined on the stagnation state that
feeds the choked throat. Using the injector-face value inflates $c^*_{meas}$ and
therefore inflates $\eta_{c^*}$ by the same few per cent — the single most common
way a test report overstates combustion efficiency.

**Why each distractor is wrong.**

- **(a) wall friction.** Fanno-line friction does drop stagnation pressure in
  the same direction, but a rocket chamber is short (an $L^*$ of ~1 m over a
  contraction-ratio-2.2 duct is a length-to-diameter ratio of order 1–2), the
  velocity is low, and the wall is smooth. Friction contributes a fraction of a
  per cent here, an order of magnitude below the heat-addition term. It is the
  right *kind* of mechanism and the wrong *size*, which is why it is the
  attractive wrong answer.
- **(c) the injector pressure drop.** The injector $\Delta p$ is between the
  **manifold** and the chamber, i.e. upstream of the injector face. A transducer
  flush with the injector face reads chamber gas, not manifold liquid. This
  distractor catches students who have memorised "injector stiffness is 15–20 %
  of $p_c$" and attached it to the wrong station. If it were the explanation,
  the discrepancy would be 15–20 %, not 4 %.
- **(d) dissociation.** Dissociation is an energy sink that lowers $T_0$ and
  therefore $c^*$; it does not create a *stagnation-pressure* gradient along the
  chamber, and in any case it is already inside the CEA prediction being
  compared against. It confuses a thermochemical effect with a gas-dynamic one.

### Rubric (4)

| | |
|---|---|
| 2 | correct choice (b) |
| 1 | justification naming heat addition / Rayleigh, or the finite chamber Mach number, as the mechanism |
| 1 | identifies the nozzle stagnation pressure as the correct denominator for $\eta_{c^*}$ |
| −1 | choosing (b) with a justification that is actually the argument for (a) or (c) |

---

## A2 — Mixture properties of a storable product gas (8 points)

### (a) Molar mass and gas constant (2)

Mole-fraction weighting: $\mathcal{M} = \sum_i x_i \mathcal{M}_i$.

| species | $x_i$ | $\mathcal{M}_i$ | $x_i\mathcal{M}_i$ |
|---|---|---|---|
| H$_2$O | 0.310 | 18.0153 | 5.5847 |
| N$_2$ | 0.245 | 28.0134 | 6.8633 |
| CO | 0.130 | 28.010 | 3.6413 |
| CO$_2$ | 0.075 | 44.009 | 3.3007 |
| H$_2$ | 0.155 | 2.0159 | 0.3125 |
| OH | 0.030 | 17.0073 | 0.5102 |
| H | 0.040 | 1.008 | 0.0403 |
| NO | 0.015 | 30.006 | 0.4501 |
| **sum** | **1.000** | | **20.7031** |

$$\mathcal{M} = 20.70\ \mathrm{kg/kmol}$$

$$R = \frac{R_u}{\mathcal{M}} = \frac{8314.46\ \mathrm{J/(kmol\,K)}}{20.7031\ \mathrm{kg/kmol}} = 401.6\ \mathrm{J/(kg\,K)}$$

### (b) Mass fractions (2)

$Y_i = x_i \mathcal{M}_i/\mathcal{M}$:

$$Y_{\mathrm{H_2O}} = \frac{5.5847}{20.7031} = 0.2698, \qquad
Y_{\mathrm{H_2}} = \frac{0.3125}{20.7031} = 0.01509$$

Note the lesson: H$_2$ is 15.5 % of the moles and 1.5 % of the mass. Mole and
mass fractions are not interchangeable and the light species is where they
diverge most.

### (c) Specific heats and $\gamma$ (2)

$$\sum_i x_i \bar c_{p,i} = 0.310(55.5)+0.245(37.0)+0.130(36.0)+0.075(60.0)
+0.155(37.5)+0.030(37.0)+0.040(20.786)+0.015(37.5)$$
$$= 17.205+9.065+4.680+4.500+5.8125+1.110+0.83144+0.5625 = 43.766\ \mathrm{J/(mol\,K)}$$

Per unit mass (note the factor 1000 converting mol to kmol):

$$c_p = \frac{1000 \times 43.766\ \mathrm{J/(kmol\,K)}}{20.7031\ \mathrm{kg/kmol}} = 2114\ \mathrm{J/(kg\,K)}$$

$$c_v = c_p - R = 2114.0 - 401.6 = 1712\ \mathrm{J/(kg\,K)}$$

$$\gamma = \frac{c_p}{c_v} = \frac{2114.0}{1712.4} = 1.2345$$

### (d) Characteristic velocity (2)

$$\Gamma(\gamma) = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}} = 0.6552$$

$$c^* = \frac{\sqrt{R\,T_0}}{\Gamma} = \frac{\sqrt{401.60 \times 3100}}{0.6552}
= \frac{1115.8\ \mathrm{m/s}}{0.6552} = 1703\ \mathrm{m/s}$$

**Sanity check.** Flying N$_2$O$_4$/MMH engines deliver $c^*$ in the
1650–1750 m/s band (the R-4D and Aestus classes); 1703 m/s ideal is squarely
inside it, and a delivered value of ~1620–1660 m/s after $\eta_{c^*}$ would be
expected. Compare LOX/LH$_2$ at 2320–2380 m/s.

**What is doing the damage:** the molar mass, 20.7 versus 13.6 kg/kmol for
LOX/LH$_2$. The flame temperature (3100 K vs 3600 K) is only 14 % lower, but
$\mathcal{M}$ is 52 % higher, and $c^* \propto \sqrt{T_0/\mathcal{M}}$. The
nitrogen is the culprit: 24.5 % of the moles, chemically inert, contributing
nothing to the heat release and 33 % of the mass. That is the permanent price
of a hydrazine-family fuel and a nitrogen-bearing oxidiser.

### Rubric (8)

| marks | for |
|---|---|
| 2 | (a) $\mathcal{M}$ by mole-fraction weighting **and** $R = R_u/\mathcal{M}$; 1 mark if the sum is set up right but arithmetic slips |
| 2 | (b) both mass fractions with $Y_i = x_i\mathcal{M}_i/\mathcal{M}$ |
| 2 | (c) $c_p$ (1, and the mol→kmol factor of 1000 must be right), $c_v$ and $\gamma$ (1) |
| 2 | (d) $\Gamma$ and $c^*$ (1.5); sanity check + naming $\mathcal{M}$/nitrogen as the driver (0.5) |
| −1 | using mass fractions to average $\bar c_{p,i}$, or mole fractions to average mass-basis $c_p$ |
| 0 for (d) | quoting $c^*$ without $\Gamma$, i.e. using $\sqrt{RT_0}$ alone |

---

## A3 — Stagnation state, and two ways to get it wrong (8 points)

### (a) The exact stagnation state (3)

$$R = \frac{8314.46}{22.0} = 377.9\ \mathrm{J/(kg\,K)}$$

$$a = \sqrt{\gamma R T} = \sqrt{1.20 \times 377.93 \times 3350} = 1233\ \mathrm{m/s}$$

$$V = M a = 0.350 \times 1232.59 = 431.4\ \mathrm{m/s}$$

$$\rho = \frac{p}{RT} = \frac{95.00\times10^5\ \mathrm{Pa}}{377.93 \times 3350} = 7.504\ \mathrm{kg/m^3}$$

$$\frac{T_0}{T} = 1 + \frac{\gamma-1}{2}M^2 = 1 + 0.10(0.350)^2 = 1.01225
\;\Rightarrow\; T_0 = 3350 \times 1.01225 = 3391\ \mathrm{K}$$

$$\frac{p_0}{p} = \left(\frac{T_0}{T}\right)^{\gamma/(\gamma-1)} = (1.01225)^{6} = 1.07579
\;\Rightarrow\; p_0 = 95.00 \times 1.07579 = 102.20\ \mathrm{bar}$$

### (b) The incompressible estimate (3)

$$\tfrac12\rho V^2 = 0.5 \times 7.5036 \times (431.41)^2 = 6.983\times10^5\ \mathrm{Pa} = 6.983\ \mathrm{bar}$$

$$p + \tfrac12\rho V^2 = 95.00 + 6.983 = 101.98\ \mathrm{bar}$$

Error as a fraction of $p_0$:

$$\frac{101.9825 - 102.1999}{102.1999} = -0.2127\ \%$$

Error as a fraction of what it is estimating, $(p_0 - p) = 7.200$ bar:

$$\frac{6.9825 - 7.1999}{7.1999} = -3.019\ \%$$

**Why the second is the honest one.** The 95 bar is *measured*; only the
$7.2$ bar difference is being *estimated*. Reporting "0.2 % error" flatters the
approximation by dividing the error by a number the model did not have to
predict. The compressible correction to the dynamic head is
$1 + M^2/4 + O(M^4) = 1.031$ at $M = 0.35$, which is exactly the 3 % found — the
error is in the part of the answer the model is responsible for.

### (c) The lossy diffuser (2)

For a calorically perfect gas between two states at the same stagnation
temperature (adiabatic, no shaft work, so $T_0$ is conserved):

$$\Delta s = c_p \ln\frac{T_{0,2}}{T_{0,1}} - R\ln\frac{p_{0,2}}{p_{0,1}}
= -R\ln\frac{p_{0,2}}{p_{0,1}}
\;\Rightarrow\;
p_{0,2} = p_{0,1}\exp\!\left(-\frac{\Delta s}{R}\right)$$

$$p_{0,2} = 102.1999 \times \exp\!\left(-\frac{12.0}{377.93}\right)
= 102.1999 \times 0.96875 = 99.01\ \mathrm{bar}$$

$$\text{loss} = 1 - 0.96875 = 3.125\ \%$$

**Assumption:** the deceleration is adiabatic and has no shaft work, so $h_0$
and hence $T_0$ are conserved; the gas is calorically perfect so $c_p$ and $R$
are constants. Only then does entropy generation appear purely as stagnation-
pressure loss. This is the Module 01 §3.6 statement that **nozzle and diffuser
losses are entropy, and stagnation pressure is the currency in which entropy is
billed**.

### Rubric (8)

| marks | for |
|---|---|
| 3 | (a): $R$ and $a$ (1), $V$ and $\rho$ (1), $T_0$ and $p_0$ with the correct exponent $\gamma/(\gamma-1) = 6$ (1) |
| 3 | (b): the estimate itself (1), **both** error definitions (1), the argument for which denominator is honest (1) |
| 2 | (c): $p_{0,2} = p_{0,1}e^{-\Delta s/R}$ derived or correctly quoted (1), number and stated assumptions (1) |
| −1 | using $\gamma/(\gamma-1)$ as 5 or 7, i.e. a $\gamma$ slip that survives into the answer |
| −1 | in (c), applying $\Delta s$ to static rather than stagnation pressure without saying so |

---

# Section B — Compressible flow and nozzles (25 points)

## B1 — Derivation: the area–Mach relation (10 points)

### (a) The derivation (6)

**Step 1 — write the mass flux at a general station in stagnation variables.**
From continuity, $\dot m = \rho V A$. Write $\rho$ and $V$ in terms of
stagnation quantities and $M$:

$$\rho = \rho_0\left(1+\frac{\gamma-1}{2}M^2\right)^{-\frac{1}{\gamma-1}},
\qquad
V = M a = M\sqrt{\gamma R T} = M\sqrt{\gamma R T_0}\left(1+\frac{\gamma-1}{2}M^2\right)^{-\frac12}$$

Therefore

$$\dot m = A\,\rho_0\sqrt{\gamma R T_0}\;M\left(1+\frac{\gamma-1}{2}M^2\right)^{-\frac{1}{\gamma-1}-\frac12}$$

Combine the exponents:

$$-\frac{1}{\gamma-1}-\frac12 = -\frac{2 + (\gamma-1)}{2(\gamma-1)} = -\frac{\gamma+1}{2(\gamma-1)}$$

so

$$\dot m = A\,\rho_0\sqrt{\gamma R T_0}\;M\left(1+\frac{\gamma-1}{2}M^2\right)^{-\frac{\gamma+1}{2(\gamma-1)}}
\tag{B1.1}$$

**Step 2 — apply the same expression at the sonic station.** At $A = A^{*}$ we
have $M = 1$, so the bracket becomes $\left(\frac{\gamma+1}{2}\right)$:

$$\dot m = A^{*}\rho_0\sqrt{\gamma R T_0}\left(\frac{\gamma+1}{2}\right)^{-\frac{\gamma+1}{2(\gamma-1)}}
\tag{B1.2}$$

**Step 3 — take the ratio.** The flow is steady and one-dimensional, so $\dot m$
is the same at both stations; the flow is isentropic, so $\rho_0$ and $T_0$ are
the same at both stations. Dividing (B1.1) into (B1.2), everything except the
areas and the Mach-number factors cancels:

$$\frac{A^{*}}{A} = M\left(1+\frac{\gamma-1}{2}M^2\right)^{-\frac{\gamma+1}{2(\gamma-1)}}
\left(\frac{\gamma+1}{2}\right)^{+\frac{\gamma+1}{2(\gamma-1)}}$$

Invert and collect the two bracketed factors under one exponent:

$$\boxed{\;\frac{A}{A^{*}} = \frac{1}{M}\left[\frac{2}{\gamma+1}\left(1+\frac{\gamma-1}{2}M^{2}\right)\right]^{\frac{\gamma+1}{2(\gamma-1)}}\;}$$

which is the required result. $\blacksquare$

Note what the derivation did **not** need: no momentum equation, no nozzle
contour, no statement about pressure. The area–Mach relation is continuity plus
isentropy and nothing else, which is why it holds for any smooth duct shape and
why $A^{*}$ exists as a reference area even at stations where the duct never
actually reaches sonic conditions.

### (b) Assumptions, and where it fails (2)

Assumptions used: **steady** flow; **quasi-one-dimensional** (one Mach number
per station, i.e. uniform properties across the area); **isentropic**
(constant $\rho_0$, $T_0$ — adiabatic *and* reversible); **calorically perfect**
gas (constant $\gamma$, constant $R$, $a = \sqrt{\gamma R T}$); and a single
choked reference station.

Two places it is quantitatively wrong in a real nozzle (any two of):

1. **Across a normal shock in an overexpanded nozzle.** The shock is not
   isentropic, so $p_0$ drops and $A^{*}$ *changes*. Downstream of the shock the
   relation still holds but with a different, larger $A^{*}_2$; using the
   upstream $A^{*}$ gives the wrong Mach number.
2. **In the boundary layer, and near the throat of a small thruster.** The
   displacement thickness makes the *effective* flow area smaller than the
   geometric area, so a geometric $\varepsilon$ over-predicts $M_e$. On a small
   cold-gas or ACS thruster with a throat of a few millimetres this is a
   several-per-cent effect, not a rounding.
3. Also acceptable: **shifting equilibrium**, where $\gamma$ falls from ~1.14 in
   the chamber to ~1.25 at the exit as the flow recombines, so no single
   constant $\gamma$ reproduces the CEA pressure history (Module 04 §5.4); or
   **strong radial gradients near the throat** of a high-curvature contour,
   where the one-dimensional assumption fails and the sonic line is not flat.

### (c) Numerical check (2)

$\gamma = 1.20$, $M = 3.000$. Exponent
$\frac{\gamma+1}{2(\gamma-1)} = \frac{2.20}{0.40} = 5.500$.

$$1 + \frac{0.20}{2}(9.000) = 1.9000, \qquad \frac{2}{2.20} = 0.90909$$

$$\frac{A}{A^{*}} = \frac{1}{3.000}\left[0.90909 \times 1.9000\right]^{5.500}
= \frac{1}{3}\,(1.72727)^{5.500} = \frac{20.206}{3} = 6.735$$

### Rubric (10)

| marks | for |
|---|---|
| 2 | writing $\rho$ **and** $V$ correctly in stagnation variables with $M$ |
| 1 | correctly combining the two exponents into $-\frac{\gamma+1}{2(\gamma-1)}$ |
| 1 | evaluating the same expression at $M=1$ |
| 2 | taking the ratio with an explicit statement of *why* $\dot m$, $\rho_0$, $T_0$ cancel, and reaching the boxed form |
| 1 | (b) assumptions: at least four of steady, quasi-1-D, isentropic, calorically perfect |
| 1 | (b) two distinct, correctly explained failure cases |
| 2 | (c) 6.735 to four significant figures |
| 0 for (a) | quoting the result and verifying it numerically instead of deriving it |
| −2 | any appearance of "it can be shown that" in place of an algebraic step (course rule) |

---

## B2 — A nozzle on a test stand (9 points)

### (a) Exit conditions (3)

$$R = \frac{8314.46}{13.8} = 602.5\ \mathrm{J/(kg\,K)}$$

Invert the area–Mach relation at $\varepsilon = 45.0$, $\gamma = 1.19$
(supersonic root):

$$M_e = 4.262$$

$$\frac{p_0}{p_e} = \left(1+\frac{\gamma-1}{2}M_e^2\right)^{\gamma/(\gamma-1)}
= (1+0.095\times18.169)^{6.263} = 534.3
\;\Rightarrow\; p_e = \frac{8.50\times10^6}{534.3} = 1.591\times10^4\ \mathrm{Pa}$$

$$p_e = 15.91\ \mathrm{kPa} = 0.1591\ \mathrm{bar}$$

$$T_e = \frac{T_0}{1+\frac{\gamma-1}{2}M_e^2} = \frac{3500}{2.7261} = 1284\ \mathrm{K}$$

Exit velocity from the energy equation:

$$V_e = \sqrt{\frac{2\gamma}{\gamma-1}RT_0\left[1-\left(\frac{p_e}{p_0}\right)^{\frac{\gamma-1}{\gamma}}\right]}
= \sqrt{\frac{2(1.19)}{0.19}(602.50)(3500)\left[1-(1.8716\times10^{-3})^{0.15966}\right]}$$
$$= 4090\ \mathrm{m/s}$$

**Second route:** $a_e = \sqrt{\gamma R T_e} = \sqrt{1.19 \times 602.50 \times 1283.92} = 959.4$ m/s, and

$$V_e = M_e a_e = 4.26247 \times 959.446 = 4089.6\ \mathrm{m/s} \quad\checkmark$$

The two agree to six figures, as they must: they are the same isentropic
relation rearranged.

### (b) Schmucker at the exit plane, sea level (2)

$$p_{sep} = p_a\,(1.88M_e - 1)^{-0.64} = 101325\,(1.88\times4.26247 - 1)^{-0.64}
= 101325\,(7.0134)^{-0.64} = 2.913\times10^4\ \mathrm{Pa}$$

$$p_{sep} = 29.13\ \mathrm{kPa} \;>\; p_e = 15.91\ \mathrm{kPa}$$

The wall pressure the nozzle would reach at the exit plane is **below** the
pressure at which the boundary layer can no longer negotiate the adverse
gradient. **The nozzle separates; it does not flow full at sea level.**

### (c) Locating the separation station (2)

Two equations in the two unknowns $M_{sep}$ and $p_{sep}$:

$$\text{(i) isentropic wall pressure:}\qquad
p_w(M) = p_0\left(1+\tfrac{\gamma-1}{2}M^2\right)^{-\gamma/(\gamma-1)}$$
$$\text{(ii) Schmucker:}\qquad p_{sep}(M) = p_a\,(1.88M-1)^{-0.64}$$

Separation occurs where the falling curve (i) meets the rising curve (ii).
Solving $p_w(M) = p_{sep}(M)$:

$$M_{sep} = 3.907, \qquad p_{sep} = p_w = 3.106\times10^4\ \mathrm{Pa} = 31.06\ \mathrm{kPa}$$

$$\left.\frac{A}{A_t}\right|_{sep} = \frac{1}{M_{sep}}\left[\frac{2}{\gamma+1}\left(1+\frac{\gamma-1}{2}M_{sep}^2\right)\right]^{\frac{\gamma+1}{2(\gamma-1)}} = 26.53$$

Fraction of the bell running separated, by area ratio:

$$\frac{45.0 - 26.53}{45.0} = 0.410 = 41.0\ \%$$

That is a large separated region: 41 % of the expansion, by area ratio, is
filled with recirculating ambient air rather than doing work. Note also that
$p_{sep}/p_a = 31.06/101.3 = 0.307$, i.e. this hardware would be predicted to
separate at about $0.31\,p_a$, not the $0.4\,p_a$ of Summerfield — the two
criteria disagree by roughly 25 % in pressure, which is the normal state of
affairs (Module 02 §3.14).

### (d) The maximum cell pressure for full flow (2)

Full flow to the exit plane requires $p_e \geq p_{sep}(p_a, M_e)$, i.e.

$$p_e \geq p_a(1.88M_e-1)^{-0.64} \;\Longrightarrow\;
p_{a,max} = p_e\,(1.88M_e-1)^{0.64} = 1.5909\times10^4 \times (7.0134)^{0.64}$$

$$p_{a,max} = 5.534\times10^4\ \mathrm{Pa} = 55.34\ \mathrm{kPa}$$

**Comment.** 55 kPa is about 0.55 atm — roughly the ambient pressure at 5 km
altitude. That is *not* a demanding requirement for an ejector-diffuser test
cell; facilities routinely reach 5–20 kPa for upper-stage testing, and this one
only needs to pull half an atmosphere. The useful observation is the size of the
gap between the separation limit (55 kPa) and ideal expansion (15.9 kPa): the
nozzle will flow full and be **overexpanded** across that whole band, delivering
less than its vacuum thrust but with the boundary layer attached. For reference,
$C_{f,vac} = 1.905$ and $C_f$ at 55.3 kPa is 1.612 — a 15 % thrust deficit at
the separation limit.

### Rubric (9)

| marks | for |
|---|---|
| 3 | (a): $R$ and $M_e$ (1), $p_e$ and $T_e$ (1), $V_e$ by both routes with agreement noted (1) |
| 2 | (b): correct Schmucker evaluation at $M_e$ (1), correct comparison and the conclusion "separates" (1) |
| 2 | (c): both equations written as a simultaneous system (1), correct $M_{sep}$, $p_{sep}$, $A/A_t$ and separated fraction (1) |
| 2 | (d): correct inversion to $p_{a,max}$ (1), number plus a defensible comment on facility difficulty (1) |
| −1 | applying Schmucker with the *chamber* pressure or with $p_e$ in place of $p_a$ |
| −1 | in (c), evaluating Schmucker at the exit Mach number rather than at the local Mach number (this is the single most common error and it moves the answer by several area ratios) |

---

## B3 — A normal shock at the exit plane (6 points)

### (a) Back pressure and downstream Mach number (3)

Upstream of the shock the flow is the fully-expanded exit flow of B2(a):
$M_1 = M_e = 4.262$, $p_1 = p_e = 15.91$ kPa.

Normal-shock static-pressure ratio:

$$\frac{p_2}{p_1} = \frac{2\gamma M_1^2 - (\gamma-1)}{\gamma+1}
= \frac{2(1.19)(18.169) - 0.19}{2.19} = \frac{43.242 - 0.19}{2.19} = 19.66$$

$$p_b = p_2 = 19.658 \times 15.909\ \mathrm{kPa} = 312.7\ \mathrm{kPa}$$

Downstream Mach number:

$$M_2^2 = \frac{1 + \frac{\gamma-1}{2}M_1^2}{\gamma M_1^2 - \frac{\gamma-1}{2}}
= \frac{1 + 0.095(18.169)}{1.19(18.169) - 0.095} = \frac{2.72607}{21.5257} = 0.12664$$

$$M_2 = 0.3559$$

(As a check on the physics rather than the algebra: $T_2/T_1 = 2.694$, so the
gas leaves the shock at about 3459 K — the shock has thrown away almost all the
kinetic energy the nozzle built.)

### (b) The trace at $p_b = 164$ kPa (1)

Halfway between 312.7 kPa and 15.91 kPa is $p_b = 164.3$ kPa. This is **below**
the exit-plane-shock value, so **there is no shock inside the nozzle at all**.
The nozzle runs full and supersonic to the exit, the wall static pressure falls
**monotonically and smoothly** from 8.50 MPa at the throat to 15.91 kPa at the
exit with no rise anywhere along the contour, and the compression to 164 kPa
happens **outside** the nozzle, in an oblique shock train (a barrel shock and
Mach disc) in the plume. A normal shock migrates *into* the divergent section
only for back pressures **above** 312.7 kPa, moving upstream toward the throat
as $p_b$ rises further.

Students who describe a pressure rise inside the nozzle at this back pressure
have the direction of the shock-position dependence backwards.

### (c) Why it is never observed (2)

The inviscid analysis of (a) requires the boundary layer to stay attached
against a pressure rise of a factor of 19.7 at the exit plane. It cannot: from
B2(d), this nozzle detaches as soon as the cell pressure exceeds **55.3 kPa**,
which is a factor of **5.7 below** the 312.7 kPa the exit-plane shock condition
demands. Long before the back pressure gets anywhere near 313 kPa, the flow has
separated, the shock system has moved *inside* the bell as an oblique
shock/separation structure with a recirculation region behind it, and the exit
plane is no longer a station of uniform supersonic flow at all — so the premise
of the one-dimensional normal-shock calculation has already failed.

What is actually seen on a wall-pressure trace is the signature of Module 02
§3.14: a smooth isentropic fall to roughly $0.3\,p_a$, an abrupt rise over a few
throat diameters, and then a roughly flat plateau slightly below ambient out to
the exit — free-shock separation, with the attendant side loads.

### Rubric (6)

| marks | for |
|---|---|
| 3 | (a): correct $p_2/p_1$ relation and value (1.5), $p_b$ (0.5), correct $M_2$ (1) |
| 1 | (b): recognising that no shock stands inside the nozzle at this $p_b$ and that the compression is external |
| 2 | (c): quantitative comparison of 313 kPa against the 55 kPa separation limit (1), correct description of what is observed instead (1) |
| −1 | in (b), placing a shock inside the nozzle (backwards dependence) even if the rest is right |

---

# Section C — Rocket performance (30 points)

## C1 — Engine reconstruction: RL10A-3-3A (12 points)

**Caveats carried throughout** (from `reference/_verify-liquid.md`): thrust,
$p_c$, $\varepsilon$, $I_{sp}$ and $r$ are **medium-high** confidence, resting
on a manufacturer page and a search summary of two NTRS reports whose text could
not be extracted; the $I_{sp}$ is published as a **range**, 444–445 s; the
chamber pressure may be quoted injector-end or nozzle-stagnation (systemic item
18), and the file does not say which. Dry mass and turbopump speed are
**medium** confidence and are not used here.

### (a) Pressure and mass flows (2)

$$p_c = 475\ \mathrm{psia} \times 6894.757\ \mathrm{Pa/psi} = 3.275\times10^6\ \mathrm{Pa} = 32.75\ \mathrm{bar}$$

(The file's "32.8 bar" is this number rounded.)

$$\dot m = \frac{F_{vac}}{I_{sp}g_0} = \frac{73.4\times10^3\ \mathrm{N}}{444.5 \times 9.80665\ \mathrm{m/s}} = 16.84\ \mathrm{kg/s}$$

At $r = 5.0$, $\dot m_{ox} = \dot m \cdot r/(1+r)$ and $\dot m_f = \dot m/(1+r)$:

$$\dot m_{ox} = 16.8385 \times \frac{5}{6} = 14.03\ \mathrm{kg/s\ (LOX)},
\qquad \dot m_f = 16.8385 \times \frac{1}{6} = 2.806\ \mathrm{kg/s\ (LH_2)}$$

### (b) Ideal vacuum thrust coefficient (2)

At $\varepsilon = 61.0$, $\gamma = 1.17$: invert the area–Mach relation for
$M_e = 4.339$, giving $p_e/p_0 = 1.392\times10^{-3}$, i.e. $p_e = 4.559$ kPa.
Then

$$C_{f,vac} = \sqrt{\frac{2\gamma^2}{\gamma-1}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{\gamma-1}}\left[1-\left(\frac{p_e}{p_0}\right)^{\frac{\gamma-1}{\gamma}}\right]} + \frac{p_e}{p_0}\varepsilon$$

$$C_{f,vac} = 1.8703 + 0.0850 = 1.9553$$

### (c) The implied characteristic velocity (2)

$$c = I_{sp}g_0 = 444.5 \times 9.80665 = 4359\ \mathrm{m/s}$$

$$c^*_{implied} = \frac{c}{C_{f,vac}} = \frac{4359.06}{1.95534} = 2229\ \mathrm{m/s}$$

$$\frac{c^*_{implied}}{c^*_{ideal}} = \frac{2229.3}{2330} = 0.9568$$

### (d) What that ratio actually is (3)

It is **not** $\eta_{c^*}$. It is the **overall efficiency**
$\eta_{ov} = \eta_{c^*}\eta_{C_f}$.

Proof. The measured effective exhaust velocity factorises exactly:

$$c_{meas} = c^*_{meas}\,C_{f,meas}
= \left(\eta_{c^*}c^*_{ideal}\right)\left(\eta_{C_f}C_{f,ideal}\right)$$

Dividing by the **ideal** $C_f$ — which is what part (c) did, because we had no
measured $C_f$ —

$$\frac{c_{meas}}{C_{f,ideal}} = \eta_{c^*}\eta_{C_f}\,c^*_{ideal} = \eta_{ov}\,c^*_{ideal}$$

so the quantity computed in (c) is $\eta_{ov}c^*_{ideal}$ and the ratio is
$\eta_{ov} = 0.9568$. Every nozzle loss — divergence, boundary layer,
finite-rate chemistry — has been silently booked against the *chamber*.

**The one number that would separate them: the throat area** $A_t$ (equivalently,
a published $\dot m$ *together with* $A_t$, or a published $C_f$). With $A_t$
measured, $c^*_{meas} = p_c A_t/\dot m$ is available directly from three
instruments and no assumptions about $\gamma$ or $T_0$; then
$\eta_{c^*} = c^*_{meas}/c^*_{ideal}$ and $\eta_{C_f} = \eta_{ov}/\eta_{c^*}$
follow. `_verify-liquid.md` does **not** publish $A_t$ for this engine, which is
precisely why the reconstruction stops here.

Physically, 0.9568 is a very plausible $\eta_{ov}$ for an RL10: one would expect
$\eta_{c^*} \approx 0.98$–0.99 (a coaxial-shear injector on gaseous hydrogen and
liquid oxygen mixes extremely well) and $\eta_{C_f} \approx 0.97$–0.98 (a long
$\varepsilon = 61$ bell with a real boundary layer and some kinetic loss),
whose product is 0.95–0.97.

### (e) Geometry (2)

$$A_t = \frac{F_{vac}}{p_c\,C_{f,vac}} = \frac{73.4\times10^3}{3.27501\times10^6 \times 1.95534}
= 1.146\times10^{-2}\ \mathrm{m^2}$$

(Equivalently $A_t = \dot m\,c^*_{implied}/p_c$, which gives the same number —
worth doing as a check.)

$$D_t = 2\sqrt{A_t/\pi} = 2\sqrt{1.146201\times10^{-2}/\pi} = 0.1208\ \mathrm{m} = 120.8\ \mathrm{mm}$$

$$A_e = \varepsilon A_t = 61 \times 1.146201\times10^{-2} = 0.6992\ \mathrm{m^2},
\qquad D_e = 2\sqrt{A_e/\pi} = 0.9435\ \mathrm{m} = 943.5\ \mathrm{mm}$$

**Credibility.** A 0.94 m exit diameter is right for an RL10A-3-3A: the engine
fits inside the 3.05 m Centaur interstage with room for the second engine of a
dual-engine Centaur, and published RL10A-class exit diameters sit just under a
metre. A 121 mm throat on a 73 kN engine is also consistent with the low chamber
pressure — the whole point of the expander cycle's 32.8 bar is that the throat
is large and the chamber surface area is generous, which is what lets the wall
put enough heat into the hydrogen to drive the turbine. **The reconstruction is
credible.**

### (f) Which uncertainty dominates (1)

| source | range tested | implied $c^*$ | spread |
|---|---|---|---|
| published $I_{sp}$ | 444 → 445 s | 2226.8 → 2231.8 m/s | 5.0 m/s, **0.22 %** |
| assumed $\gamma$ | 1.14 → 1.20 | 2183.1 → 2273.2 m/s | 90.0 m/s, **4.0 %** |

**The assumed $\gamma$ dominates, by a factor of about 18.** The lesson: in a
reconstruction of this kind the published figures are not the limiting
uncertainty — *your own modelling assumption* is. Quoting
"$\eta_{ov} = 0.957$" to three figures is therefore dishonest; the defensible
statement is "$\eta_{ov} = 0.96 \pm 0.04$, dominated by the assumed $\gamma$,
and further uncertain by an unquantified few per cent because the file does not
say whether 475 psia is injector-end or nozzle-stagnation."

### Rubric (12)

| marks | for |
|---|---|
| 2 | (a) pressure conversion (0.5), $\dot m$ (0.5), correct $r/(1+r)$ split (1) |
| 2 | (b) correct $C_f$ including the pressure-thrust term $\varepsilon p_e/p_0$ |
| 2 | (c) $c = I_{sp}g_0$ (1), division by $C_f$ and the ratio (1) |
| 3 | (d) **identifying the ratio as $\eta_{ov}$, not $\eta_{c^*}$** (1), the algebraic proof from $c = c^*C_f$ (1), naming $A_t$ (or $A_t$ + $\dot m$) and saying how it separates them (1) |
| 2 | (e) $A_t$, $D_t$, $D_e$ (1.5); credibility argument against a real Centaur constraint (0.5) |
| 1 | (f) both sensitivities computed and the correct conclusion that $\gamma$ dominates |
| −2 | anywhere: quoting a published figure without its caveat, or treating 444–445 s as a single exact value without noting it is a range |
| −1 | failing to note the injector-end / nozzle-stagnation ambiguity in $p_c$ |
| full marks impossible | if (d) claims the ratio is $\eta_{c^*}$ — this is the question |

---

## C2 — Sizing an upper-stage engine (10 points)

### (a) $c^*$ (2)

$$R = \frac{8314.46}{13.5} = 615.9\ \mathrm{J/(kg\,K)}$$

$$\Gamma(1.22) = \sqrt{1.22}\left(\frac{2}{2.22}\right)^{\frac{2.22}{2(0.22)}}
= 1.10454 \times (0.90090)^{5.04545} = 0.6524$$

$$c^*_{ideal} = \frac{\sqrt{RT_0}}{\Gamma} = \frac{\sqrt{615.886\times3450}}{0.652386}
= \frac{1457.67}{0.652386} = 2234\ \mathrm{m/s}$$

$$c^*_{del} = \eta_{c^*}c^*_{ideal} = 0.980 \times 2234.37 = 2190\ \mathrm{m/s}$$

### (b) $C_f$ (2)

At $\varepsilon = 100$, $\gamma = 1.22$: $M_e = 5.057$, $p_e/p_0 = 5.982\times10^{-4}$,
$p_e = 3.589$ kPa.

$$C_{f,vac} = 1.8661 + \frac{p_e}{p_0}\varepsilon = 1.8661 + 0.05982 = 1.926$$

$$C_{f,del} = 0.985 \times 1.92591 = 1.897$$

### (c) Exhaust velocity and $I_{sp}$ (2)

$$c = c^*_{del}C_{f,del} = 2189.68 \times 1.89702 = 4154\ \mathrm{m/s}$$

$$I_{sp,vac} = \frac{c}{g_0} = \frac{4153.87}{9.80665} = 423.6\ \mathrm{s}$$

Ideal (both efficiencies set to 1):

$$I_{sp,ideal} = \frac{2234.37 \times 1.92591}{9.80665} = 438.8\ \mathrm{s}$$

The two efficiencies together cost **15.2 s**, i.e. 3.5 %. That is the number a
programme lives or dies by, and it is why $\eta$ assumptions must be stated
whenever an $I_{sp}$ is quoted.

### (d) Mass flows (1)

$$\dot m = \frac{F_{vac}}{c} = \frac{45.0\times10^3}{4153.87} = 10.83\ \mathrm{kg/s}$$

$$\dot m_{ox} = 10.8333\times\frac{5.5}{6.5} = 9.167\ \mathrm{kg/s},
\qquad \dot m_f = 10.8333\times\frac{1}{6.5} = 1.667\ \mathrm{kg/s}$$

### (e) Geometry, two ways (2)

$$A_t = \frac{F_{vac}}{p_c\,C_{f,del}} = \frac{45.0\times10^3}{60.0\times10^5 \times 1.897021}
= 3.954\times10^{-3}\ \mathrm{m^2}$$

$$D_t = 2\sqrt{A_t/\pi} = 70.95\ \mathrm{mm}$$

$$A_e = \varepsilon A_t = 100 \times 3.953568\times10^{-3} = 0.3954\ \mathrm{m^2},
\qquad D_e = 709.5\ \mathrm{mm}$$

**Check by the other route**, $\dot m = p_c A_t/c^*_{del}$ rearranged:

$$A_t = \frac{\dot m\, c^*_{del}}{p_c} = \frac{10.83327 \times 2189.681}{60.0\times10^5}
= 3.954\times10^{-3}\ \mathrm{m^2} \quad\checkmark$$

The two agree exactly, and they must: $F = c^*C_f\dot m$ and $F = p_cA_tC_f$ are
the same statement once $c^* \equiv p_cA_t/\dot m$.

### (f) Chamber volume (1)

$$V_c = L^{*}A_t = 0.900 \times 3.953568\times10^{-3} = 3.558\times10^{-3}\ \mathrm{m^3} = 3.558\ \mathrm{L}$$

$L^{*}$ is a stand-in for **residence time**: the time a propellant element
spends in the chamber before it reaches the throat,
$t_s = V_c\rho_c/\dot m$. It has to be long enough to atomise, vaporise, mix and
react. It is empirical rather than fundamental because the *required* residence
time depends on the propellant pair, the injector element type, the chamber
pressure and the degree of atomisation — none of which $L^{*}$ contains. It is a
first-cut number that gets replaced by a spray/combustion model or by test.

### Rubric (10)

| marks | for |
|---|---|
| 2 | (a) $R$ and $\Gamma$ (1), both $c^*$ values (1) |
| 2 | (b) ideal $C_f$ with the pressure term (1.5), delivered $C_f$ (0.5) |
| 2 | (c) $c$ and $I_{sp,vac}$ (1), ideal $I_{sp}$ and the stated cost of the efficiencies (1) |
| 1 | (d) $\dot m$ and a correct $r/(1+r)$ split |
| 2 | (e) $A_t$, $D_t$, $A_e$, $D_e$ (1); the independent check and a statement of why it must agree (1) |
| 1 | (f) $V_c$ (0.5); residence time named as the underlying quantity, with a reason for the empiricism (0.5) |
| −1 | applying $\eta_{C_f}$ to $C_f$ *and* separately to $I_{sp}$ (double counting) |
| −1 | computing $A_t$ from the *ideal* $C_f$, which undersizes the throat |

---

## C3 — Engineering judgment: where to spend 12 kilograms (8 points)

**There is no single correct answer.** The rubric marks the argument. A model
answer follows; two other answers can earn full marks if they are argued as
well.

### Model answer (≈ 380 words)

*Objective.* For an upper stage the figure of merit is **payload delivered for
the required $\Delta v$**, not $I_{sp}$ and not dry mass. Both nozzle options
buy $I_{sp}$ by spending dry mass; Option 3 buys propellant mass fraction
directly. The right comparison is therefore the rocket equation with the mass
and $I_{sp}$ of each option, not a comparison of $I_{sp}$ alone.

*Quantitative argument 1 — how much $I_{sp}$ is on offer.* $C_f$ grows
logarithmically with $\varepsilon$ in vacuum. For a $\gamma \approx 1.22$ gas at
a typical upper-stage $p_c$, going 80 → 130 is worth roughly 1.5 % of $C_f$
(about 6 s on a 440 s engine); 80 → 200 is worth roughly 2.5 % (about 11 s).
The second increment costs more than twice the area ratio for less than twice
the gain — the classic diminishing return, and the reason nobody builds
$\varepsilon = 400$.

*Quantitative argument 2 — is that worth 12 kg?* For a stage with burnout mass
$m_f$ and $\Delta v = 3$ km/s at $I_{sp} = 440$ s, $\partial(\text{payload})$
from $+6$ s is roughly $m_f \cdot \Delta v \cdot \Delta I_{sp}/(I_{sp}^2 g_0)
\approx m_f \times 0.0095$ — i.e. about 1 % of burnout mass. If the stage's
burnout mass is 1500 kg, that is ~14 kg of payload against 11 kg of bell: a
marginal win. If it is 800 kg, Option 1 loses to Option 3. **The stage's
burnout mass decides this, and it is not given.**

*Reliability.* Option 2's failure mode is a single-point, non-abortable
deployment mechanism at the worst possible moment. The RL10B-2 flies exactly
this architecture — a 2.5 m NOVOLTEX carbon–carbon extension translating into
place after stage separation, worth ~30 s — and it works; but it is a mature
design from an organisation that has flown it since 1998. "Never flown by this
organisation" converts a performance question into a qualification-programme
question with its own cost and schedule.

*The one number I would want:* the **stage burnout mass excluding the nozzle**,
because it sets the exchange rate between dry mass and payload and therefore
decides between Options 1 and 3 outright.

*If the mission became LEO delivery with a short burn:* $\Delta v$ falls, the
$I_{sp}$ sensitivity falls with it, and dry mass dominates. **Recommend
Option 3** — spend the 12 kg on propellant (or give it back), keep the simple
fixed bell, and keep the interstage short.

*Recommendation as posed (high-energy escape):* **Option 1**, contingent on the
burnout-mass check; Option 2 only if the extendible nozzle is already qualified
elsewhere in the programme.

### Rubric (8)

| marks | for |
|---|---|
| 1 | states the objective as payload-for-$\Delta v$ (or an equally defensible objective) **and** justifies why |
| 2 | at least two quantitative arguments with explicit assumptions — one must connect $\varepsilon$ to $C_f$/$I_{sp}$, one must use the rocket equation or an equivalent exchange rate |
| 1 | recognises the diminishing return of $C_f$ with $\varepsilon$ (numerically or by the correct log-like trend) |
| 1.5 | addresses Option 2's specific failure mode (single-point, non-abortable deployment) **and** cites a real flown example (RL10B-2 expected; RL10C-3, Vinci or J-2X also acceptable) |
| 1 | names one decisive missing number with a reason (burnout mass, current $\eta_{C_f}$, interstage length margin, or the actual $\Delta v$ requirement all acceptable) |
| 1 | correctly reverses or re-argues the recommendation for the short-burn LEO case, with the reason (lower $\Delta v$ ⇒ lower $I_{sp}$ sensitivity ⇒ dry mass dominates) |
| 0.5 | within the word limit, with a clear single recommendation |
| −1 | recommending an option without any number attached |
| −1 | asserting Option 2 is "too risky" or Option 1 "obviously better" without an argument |
| — | **any** of the three options can earn 8/8 if the argument is complete; the mark is for the reasoning, not the choice |

---

# Section D — Thermochemistry and CEA (25 points)

## D1 — Multiple choice (4 points)

**Answer: (b).**

$c^*$ is *defined* as $p_0A_t/\dot m$. Both quantities in the numerator are
chamber/throat properties and $\dot m$ is fixed by the choked throat, so
$c^*$ has been fully determined by the time the flow reaches $M = 1$. CEA
reprints it in the exit column purely as a convenience; nothing downstream of
the throat — area ratio, contour, ambient pressure, even a shock — can alter it.

**Its use on a test stand:** because $c^*$ contains no nozzle geometry, it
isolates **combustion quality**. Measured from three instruments
($p_c$, $A_t$, $\dot m$) with no assumption about $\gamma$ or $T_0$, and
compared against the CEA value, it gives $\eta_{c^*}$ — the diagnostic that
points at the injector and the chamber, while $C_f$ points at the nozzle.

**Why each distractor is wrong.**

- **(a) "isentropic, so nothing changes downstream."** False on its own terms:
  plenty of things change downstream of the throat in an isentropic expansion —
  $p$, $T$, $\rho$, $M$, and in an equilibrium run the composition,
  $\mathcal{M}$ and $\gamma_s$ as well. The block itself shows `M, (1/n)` rising
  from 21.825 to 22.410. Isentropy is not why $c^*$ is constant; the
  **definition** of $c^*$ is. This is the most attractive distractor because its
  conclusion is right and its reasoning is wrong, and it would lead the student
  to expect $c^*$ to change in a *non*-isentropic nozzle — which it does not.
- **(c) "equilibrium mode, so composition is unchanged."** Doubly wrong.
  Equilibrium expansion is precisely the mode in which composition **does**
  change (that is the frozen-versus-equilibrium distinction), and the mole
  fraction rows in the block prove it: OH and H go from 0.040 and 0.025 to
  0.000. A **frozen** run would print the same `CSTAR` in both columns too.
- **(d) "same area ratio."** Factually false — the block prints `Ae/At` as
  1.0000 in the throat column and 40.000 in the exit column. A student who
  chooses this has not read the `Ae/At` row.

### Rubric (4)

| | |
|---|---|
| 2 | correct choice (b) |
| 1 | justification appealing to the **definition** $c^* = p_0A_t/\dot m$ and the choked throat, not to isentropy |
| 1 | correct statement of test-stand use (isolates combustion quality / gives $\eta_{c^*}$) |
| −1 | choosing (b) but justifying it with the reasoning of (a) |

---

## D2 — Reading a CEA output block (9 points)

### (a) Chamber density (2)

$$\rho = \frac{p\,\mathcal{M}}{R_u T} = \frac{(100\times10^5\ \mathrm{Pa})(21.346\ \mathrm{kg/kmol})}{(8314.46\ \mathrm{J/(kmol\,K)})(3550\ \mathrm{K})}
= \frac{2.1346\times10^8}{2.9516\times10^7} = 7.232\ \mathrm{kg/m^3}$$

The block prints `7.2318 0`, i.e. $7.2318\times10^{0}$ kg/m³. **Agreement to
five significant figures.** (Recall CEA's exponent notation: the trailing digit
after the space is the power of ten. `4.1713-2` in the exit column means
$4.1713\times10^{-2}$, not $4.1713 - 2$.)

### (b) Molar mass from the mole fractions (1)

$$\mathcal{M} = \sum x_i\mathcal{M}_i = 0.400(18.0153)+0.220(28.010)+0.150(44.009)+0.150(2.0159)$$
$$+\;0.040(17.0073)+0.025(1.008)+0.008(31.998)+0.007(15.999)$$
$$= 7.2061+6.1622+6.6014+0.3024+0.6803+0.0252+0.2560+0.1120 = 21.346\ \mathrm{kg/kmol}\ \checkmark$$

### (c) $c^*$ from the throat column (2)

$$c^* = \frac{p_0}{\rho^{*}a^{*}} = \frac{100\times10^5\ \mathrm{Pa}}{(4.5614\ \mathrm{kg/m^3})(1201.9\ \mathrm{m/s})}
= \frac{1.00\times10^7}{5482.9} = 1824\ \mathrm{m/s}$$

which is the printed `CSTAR, M/SEC = 1824.0`. ✓

(Why this works: $c^* = p_0A_t/\dot m$ and $\dot m = \rho^{*}a^{*}A_t$ at a
sonic throat, so the areas cancel.)

Closed form with the **chamber** $\gamma_s$ and $\mathcal{M}$:

$$R = \frac{8314.46}{21.346} = 389.5\ \mathrm{J/(kg\,K)},\qquad
\Gamma(1.1420) = 0.6370$$

$$c^*_{\text{closed form}} = \frac{\sqrt{389.518 \times 3550}}{0.63702} = \frac{1175.9}{0.63702} = 1846\ \mathrm{m/s}$$

That is **1.20 % high**. The reason: the closed form assumes a single constant
$\gamma$ and a single constant $\mathcal{M}$ from chamber to throat, but the
block shows $\gamma_s$ rising 1.1420 → 1.1440 and $\mathcal{M}$ rising
21.346 → 21.825 as the gas recombines through the throat. The real throat gas is
heavier than the chamber gas, so the real mass flux per unit $p_0$ is higher and
$c^*$ is lower. Use the CEA value; use the closed form only for trend work.

### (d) The two exit rows in seconds (2)

$$\frac{\texttt{Ivac}}{g_0} = \frac{3600.1\ \mathrm{m/s}}{9.80665} = 367.1\ \mathrm{s}$$

$$\frac{\texttt{Isp}}{g_0} = \frac{3408.7\ \mathrm{m/s}}{9.80665} = 347.6\ \mathrm{s}$$

**`Ivac` = 367.1 s is the vacuum specific impulse**: it is
$v_e + p_eA_e/\dot m$, i.e. momentum thrust plus the full pressure-thrust term
with $p_a = 0$.

**`Isp` = 347.6 s is not a specific impulse at any real altitude.** It is the
**momentum-only** effective exhaust velocity, $v_e$, divided by $g_0$. It equals
the true $I_{sp}$ only when the nozzle is perfectly expanded, $p_a = p_e =
0.2624$ bar — i.e. at about 10 km altitude for this nozzle. Quoting CEA's `Isp`
row as "the specific impulse" is a classic and expensive error: here it
understates the vacuum value by 19.5 s.

*(Check on the block: at the throat, `Isp, M/SEC` = 1201.9 = `SON VEL`, as it
must, since $v = a$ at $M = 1$.)*

### (e) Delivered $I_{sp}$ at 40 kPa (1)

$$I_{sp}(p_a) = \frac{1}{g_0}\left[\texttt{Ivac} - \frac{p_a\varepsilon c^*}{p_0}\right]
= \frac{1}{9.80665}\left[3600.1 - \frac{(40.0\times10^3)(40.0)(1824.0)}{100\times10^5}\right]$$

$$= \frac{3600.1 - 291.84}{9.80665} = \frac{3308.3}{9.80665} = 337.3\ \mathrm{s}$$

(The bracketed subtraction uses $A_e/\dot m = \varepsilon A_t/\dot m =
\varepsilon c^*/p_0$, which is why only printed rows are needed.)

Note the ordering: 367.1 s vacuum, 347.6 s at ideal expansion (26 kPa), 337.3 s
at 40 kPa. Ambient pressure costs this nozzle about 0.75 s per kPa.

### (f) Equilibrium or frozen (1)

**The `M, (1/n)` row.** It rises 21.346 → 21.825 → 22.410 down the nozzle. Molar
mass can only change if the composition changes, and composition can only change
if the chemistry is still running. **In a frozen run this row is constant at
21.346 in all three columns**, and the mole-fraction block would print the
chamber values (OH 0.04000, H 0.02500) unchanged at the exit instead of zeros.

*(The mole-fraction rows themselves, or the `(dLV/dLP)t` row relaxing to exactly
$-1.00000$ at the exit, are also acceptable answers if correctly explained.)*

### Rubric (9)

| marks | for |
|---|---|
| 2 | (a) correct ideal-gas evaluation with $R_u/\mathcal{M}$ (1.5); correctly reading CEA's exponent notation (0.5) |
| 1 | (b) $\mathcal{M} = 21.35$ from the mole fractions |
| 2 | (c) $c^*$ from $p_0/(\rho^*a^*)$ (1); closed-form value and a correct physical reason for the ~1 % gap (1) |
| 2 | (d) both conversions (1); **correctly identifying `Ivac` as the vacuum $I_{sp}$ and `Isp` as momentum-only $v_e$** (1) |
| 1 | (e) 337.3 s with the $\varepsilon c^*/p_0$ substitution |
| 1 | (f) names one valid row **and** says what it would look like frozen |
| −1 | reading `4.1713-2` as a subtraction |
| 0 for (d) | calling the `Isp` row "the sea-level specific impulse" |

---

## D3 — Reading an $I_{sp}$-versus-O/F plot (6 points)

### (a) Which curve is which (1)

**Curve X is vacuum $I_{sp}$; Curve Y is $c^*$.** Without the axis labels, two
features settle it:

1. **The magnitudes.** $c^*$ for LOX/LH$_2$ is 2200–2400 m/s and vacuum $I_{sp}$
   is 430–470 s; the two are separated by roughly a factor $C_f \approx 1.9$
   divided by $g_0$, and no other pair of performance quantities has those two
   ranges.
2. **The shape.** $c^*$ falls monotonically across almost the whole range with
   only a shallow maximum at the very fuel-rich end, because
   $c^* \propto \sqrt{T_0/\mathcal{M}}$ and $\mathcal{M}$ rises faster with $r$
   than $T_0$ does. $I_{sp}$ has a pronounced interior maximum well inside the
   range, because it also carries $C_f$, which improves with $r$.

### (b) Why the maxima differ (2)

The two curves differ by exactly one factor: $I_{sp} = c^{*}C_f/g_0$.

$c^*$ depends only on the chamber: $\sqrt{T_0/\mathcal{M}}$ times the nearly
constant $\Gamma(\gamma)$. Going fuel-rich lowers $\mathcal{M}$ faster than it
lowers $T_0$, so $c^*$ peaks far to the fuel-rich side, near $r \approx 3.5$.

$C_f$ depends on the nozzle and on $\gamma$: at a fixed large area ratio,
$C_f$ **rises** as the mixture moves toward stoichiometric, partly because
$\gamma$ falls (from 1.235 at $r = 3$ to 1.135 at $r = 8$ — a lower $\gamma$
gives a larger $C_f$ at fixed $\varepsilon$) and partly because the higher
$T_0$ produces a larger pressure ratio for the same expansion. **$C_f$ is the
quantity that separates the maxima, and it pushes the $I_{sp}$ optimum toward
higher $r$** — here from $r \approx 3.5$ to $r = 5.0$.

The corollary worth stating: "the optimum mixture ratio" is meaningless without
naming the objective ($c^*$? sea-level $I_{sp}$? vacuum $I_{sp}$ at what
$\varepsilon$?). A big vacuum nozzle pushes the optimum oxidiser-ward; a
sea-level nozzle pulls it back.

### (c) Moving $r = 5.0 \to 6.0$ (2)

From Curve Y: $c^*$ goes $2382 \to 2323$ m/s.

$$\frac{2323 - 2382}{2382} = -2.477\ \% \approx -2.5\ \%$$

From Curve X: $I_{sp}$ goes $466.1 \to 464.8$ s.

$$\Delta I_{sp} = -1.3\ \mathrm{s}, \qquad \frac{-1.3}{466.1} = -0.279\ \% \approx -0.28\ \%$$

**Why the two differ by a factor of nine.** $I_{sp} \propto c^{*}C_f$, and
across this step $C_f$ *rises* by very nearly as much as $c^*$ falls:

$$\frac{\Delta C_f}{C_f} \approx \frac{\Delta I_{sp}}{I_{sp}} - \frac{\Delta c^*}{c^*}
= -0.28\ \% - (-2.48\ \%) = +2.20\ \%$$

The chamber gets worse and the nozzle gets better, and the two nearly cancel.
This is exactly why the vehicle wins the mixture-ratio argument: the engine
gives up only 1.3 s, while the stage saves roughly 17 % of its hydrogen tank
volume — and on a hydrogen stage the tank dominates length, insulated area and
dry mass.

### (d) Why nobody flies $r = 3.5$ (1)

**Bulk density.** At $r = 3.5$ the propellant load is more than a fifth hydrogen
by mass, at 71 kg/m³ against LOX's 1141 kg/m³, so the hydrogen tank becomes
enormous — and its structure, insulation and boil-off are charged to stage dry
mass. And the move buys nothing in return: Curve X shows vacuum $I_{sp}$ at
$r = 3.5$ is roughly 447 s, some **19 s below** the 466.1 s peak at $r = 5.0$.
The $c^*$ optimum is dominated on both axes at once. The optimum for the
**vehicle** is not the optimum for the **engine**, and here it is not even the
optimum for the engine.

*(Also acceptable, for full marks if argued: at $r = 3.5$ the vacuum $I_{sp}$ is
already below its peak, so the $c^*$ optimum buys nothing in $I_{sp}$ either —
it is dominated on both axes.)*

### Rubric (6)

| marks | for |
|---|---|
| 1 | (a) correct identification **plus** two independent discriminating features |
| 2 | (b) names $C_f$ as the separating factor (1); explains the mechanism via $\gamma$ and/or pressure ratio and states the direction of the push (1) |
| 2 | (c) both percentages and the 1.3 s (1); the $C_f$-cancellation explanation, ideally with the implied $+2.2$ % (1) |
| 1 | (d) bulk density / tank volume, argued at the vehicle level |
| −1 | reporting the $I_{sp}$ change as a percentage of the $c^*$ change, or mixing the two axes |

---

## D4 — Stoichiometry of a peroxide engine (6 points)

### (a) The fuel-oxygen balance (1)

$$\mathrm{CH_{1.95}} + 1.4875\,\mathrm{O_2} \longrightarrow \mathrm{CO_2} + 0.975\,\mathrm{H_2O}$$

The O$_2$ coefficient for CH$_x$ is $1 + x/4$: one O$_2$ to make CO$_2$, and
$x/4$ to make $x/2$ waters. Here $1 + 1.95/4 = 1.4875$.

$$\mathcal{M}(\mathrm{CH_{1.95}}) = 12.011 + 1.95(1.008) = 13.977\ \mathrm{kg/kmol}$$

### (b) Stoichiometric mixture ratio (3)

**The bookkeeping.** Peroxide is not an oxidiser in the way LOX is: each
H$_2$O$_2$ molecule yields only **half** an O$_2$, and drops a water molecule
into the exhaust while doing it.

$$\mathrm{H_2O_2} \to \mathrm{H_2O} + \tfrac12\,\mathrm{O_2}$$

Per kmol of CH$_{1.95}$ we need 1.4875 kmol O$_2$, hence

$$n_{\mathrm{H_2O_2}} = 2 \times 1.4875 = 2.975\ \mathrm{kmol}$$

$$\mathcal{M}(\mathrm{H_2O_2}) = 2(1.008) + 2(15.999) = 34.014\ \mathrm{kg/kmol}$$

$$m_{\mathrm{H_2O_2}} = 2.975 \times 34.014 = 101.19\ \mathrm{kg}$$

The propellant is only 85 % H$_2$O$_2$ by mass, so the mass of **85 % HTP** that
must be delivered is

$$m_{\mathrm{HTP}} = \frac{101.192}{0.85} = 119.05\ \mathrm{kg}$$

$$\boxed{\;r_{st} = \frac{119.049\ \mathrm{kg\ HTP}}{13.977\ \mathrm{kg\ CH_{1.95}}} = 8.518\;}$$

*(For comparison: on **pure** H$_2$O$_2$ it would be $101.19/13.977 = 7.240$.
The 15 % water dilution alone pushes $r_{st}$ up by 18 %.)*

### (c) Equivalence ratio, and what is unusual (1)

$$\phi = \frac{r_{st}}{r} = \frac{8.5177}{8.0} = 1.065$$

Every LOX and N$_2$O$_4$ engine in the Module 04 table runs at
$\phi = 1.08$–1.80 — i.e. 8 % to 80 % fuel-rich. **The Gamma runs at 6.5 %
fuel-rich, essentially at stoichiometric**, and closer to $\phi = 1$ than any
other flying bipropellant engine in the course. That is the unusual feature.

### (d) Why it is survivable, and what it costs (1)

**Why survivable.** The oxidiser stream arrives already carrying a great deal of
inert diluent. Of the 119 kg of HTP, 18 kg is water put in by the supplier and a
further ~54 kg is water produced by the decomposition itself; only ~48 kg is
oxygen. All of that water enters the chamber as a high-heat-capacity,
non-reacting thermal ballast, so the flame temperature is around 2500–2700 K
rather than the ~3600 K of a stoichiometric kerolox flame. The chamber is
therefore in a wall-heat-flux regime a regeneratively kerosene-cooled steel
chamber can live in, and there is no need to buy cooling with fuel-rich
operation the way a LOX engine must.

**The price** is written plainly in the data: $I_{sp}$ of **265 s vacuum /
251 s sea level**, against 300+ s for a LOX/RP-1 engine of the same era. You are
carrying and accelerating that water. It is dead mass in the tank and dead mass
in the exhaust.

*(Caveats to carry, per `_verify-liquid.md`: Gamma 8's expansion ratio and dry
mass are **not published**, so no $C_f$ or $c^*$ reconstruction of the kind done
in C1 is possible for this engine; and its sea-level thrust is **contested**,
234.8 kN (Wikipedia) versus 222.4 kN (Encyclopedia Astronautica), a 5 % spread.
An answer that reconstructs $c^*$ from an assumed $\varepsilon$ without saying
that $\varepsilon$ is unpublished loses a mark.)*

### Rubric (6)

| marks | for |
|---|---|
| 1 | (a) correct balance and the $1 + x/4$ coefficient |
| 3 | (b): factor of 2 from the half-O$_2$ decomposition (1), division by 0.85 for the dilution (1), correct $r_{st} = 8.52$ (1) |
| 1 | (c) $\phi = 1.06$ and the observation that it is near-stoichiometric, unlike every other engine in the table |
| 1 | (d) dilution-by-water mechanism with a temperature statement (0.5); names $I_{sp}$ as the price with the figure (0.5) |
| −1 | omitting the 0.85 dilution (gives 7.24 and a $\phi$ of 0.905, i.e. an *oxidiser-rich* main chamber — physically absurd and should be caught by the sanity check that no flying bipropellant runs oxidiser-rich) |
| −1 | quoting Gamma 8's $\varepsilon$ or dry mass as if published |

---

# Mark distribution and what a score means

| section | points | of which calculation |
|---|---|---|
| A — Thermodynamics | 20 | 16 |
| B — Compressible flow | 25 | 25 (10 of them derivation) |
| C — Performance | 30 | 22 |
| D — Thermochemistry and CEA | 25 | 19 |
| **total** | **100** | **82** |

Against the course grading scale (README):

| score | reading |
|---|---|
| 90–100 | interview mastery of the foundations. In practice this requires C1(d), D2(d) and B3(c) to all be right — the three questions that separate a student who can calculate from one who understands what the calculation means. |
| 75–89 | working engineering knowledge. Typical loss pattern: the calculations are right, but C1(d) books the nozzle losses against the chamber, or D2(d) calls CEA's `Isp` row the specific impulse. |
| 60–74 | familiarity. Usually the numbers come out but the judgment questions (A1's justification, C3, D3(b)) are thin, and caveats on published figures are missing. |
| < 60 | re-read Modules 01–04 before starting Part II. Look first at Module 03 §3.5–3.11 and Module 04 §3.9. |

## Common wrong answers on this paper

1. **Calling C1(c)'s ratio $\eta_{c^*}$.** It is $\eta_{ov}$. This is the single
   most instructive error on the paper: it reveals a student who can manipulate
   $c = c^*C_f$ but has not internalised that dividing by an *ideal* $C_f$
   leaves both efficiencies in the answer.
2. **Using CEA's `Isp` row as the specific impulse.** It is $v_e$, correct only
   at perfect expansion. Costs 19.5 s here.
3. **Evaluating Schmucker at the exit Mach number when locating the separation
   station** (B2(c)). The criterion is local; using $M_e$ moves the answer by
   several area ratios and always in the optimistic direction.
4. **Putting a shock inside the nozzle at $p_b$ below the exit-shock value**
   (B3(b)). The dependence runs the other way: shocks move *in* as back
   pressure rises.
5. **Forgetting the 0.85 dilution in D4.** Produces $\phi < 1$, an
   oxidiser-rich main chamber, and no alarm bells — a failure of the sanity
   check, not of the arithmetic.
6. **Averaging molar $c_p$ with mass fractions** (A2c), or forgetting the
   mol → kmol factor of 1000. Both give a $c_p$ wrong by a large factor and a
   $\gamma$ that is not physical; either should be caught by "is $\gamma$
   between 1.1 and 1.3?".
7. **Quoting a contested or medium-confidence engine figure without its
   caveat.** The verification file exists so that this does not happen; the
   paper penalises it explicitly in C1 and D4.
