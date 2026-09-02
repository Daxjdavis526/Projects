# Part III Exam — Solid Rocket Motors

**PROPULSION — a rocket propulsion engineering course**
Covers modules 19–27 · **3 hours** · **100 points** · closed book,
calculator permitted

---

## Instructions

- **SI units throughout.** An answer without units, or with inconsistent
  units, loses marks even when the number is right.
- Constants: $g_0 = 9.80665\ \mathrm{m/s^2}$,
  $R_u = 8314.46\ \mathrm{J/(kmol\,K)}$,
  $p_{\mathrm{amb,SL}} = 101325\ \mathrm{Pa}$.
- **Show every step.** Grading is method-first: a correct setup with an
  arithmetic slip loses at most 30 % of that part's marks; a correct number
  from a wrong setup scores zero.
- Unless a question says otherwise, use the **exam propellant**, a generic
  aluminised AP/HTPB-class composite. It is **not** a real formulation and
  its coefficients are not any manufacturer's data:

  | property | symbol | value |
  |---|---|---|
  | burn rate at 7.50 MPa | $r_{\mathrm{ref}}$ | $9.00\ \mathrm{mm/s}$ |
  | pressure exponent | $n$ | $0.30$ |
  | density | $\rho_p$ | $1800\ \mathrm{kg/m^3}$ |
  | delivered characteristic velocity | $c^*$ | $1520\ \mathrm{m/s}$ |
  | temperature sensitivity of burn rate | $\sigma_p$ | $0.0024\ \mathrm{K^{-1}}$ |
  | exhaust ratio of specific heats | $\gamma$ | $1.17$ |

- Every motor, grain, case and factory in this paper is **generic or
  fictional**. Where a real motor is named, only publicly published,
  architecture-level figures are used, and the question says so.
- Where a question asks for a *judgment*, a defensible argument with its
  counter-argument earns more than an assertion.
- No answers appear anywhere in this file. Score yourself with
  [`exam-part3-key.md`](exam-part3-key.md) **after** you finish.

**Suggested time budget:** A 40 min · B 45 min · C 45 min · D 40 min ·
10 min review.

---

## Section A — Propellant fundamentals and burn rate (25 points)

### A1 — Multiple choice (3 pts)

A vendor sheet quotes the exam propellant's burn-rate law as
$r\ [\mathrm{mm/s}] = a'\,p^{0.30}$ with $p$ in **MPa**. The value of $a'$
that reproduces $9.00$ mm/s at $7.50$ MPa, and the corresponding SI
coefficient $a$ in $\mathrm{m\,s^{-1}Pa^{-0.30}}$, are closest to:

- **(a)** $a' = 4.92$, $a = 4.92\times10^{-3}$
- **(b)** $a' = 4.92$, $a = 7.79\times10^{-5}$
- **(c)** $a' = 1.20$, $a = 7.79\times10^{-5}$
- **(d)** $a' = 4.92$, $a = 4.92\times10^{-9}$

State in one sentence the rule that fixes the conversion.

### A2 — Calculation chain (12 pts)

A generic booster has a **fixed** throat of diameter $D_t = 0.180$ m and,
at the instant considered, a burning-surface-to-throat ratio
$K_n = 260$. The nozzle has $\varepsilon = A_e/A_t = 12.0$ and is flying in
vacuum. Grain conditioning temperature at qualification is $+21\ ^\circ$C.

**(a)** (2 pts) Compute $A_t$ and the instantaneous burning area $A_b$.

**(b)** (3 pts) Compute the equilibrium chamber pressure $p_c$ and the burn
rate $r$ at that pressure. Verify your answer by checking that mass
generated equals mass discharged.

**(c)** (3 pts) Compute the vacuum thrust coefficient $C_F$, the vacuum
thrust $F$, and the vacuum $I_{sp}$.

**(d)** (2 pts) Compute $\pi_K$ for this propellant. State the pressure
change per kelvin as a percentage.

**(e)** (2 pts) The motor is fired after soaking at $+56\ ^\circ$C instead
of $+21\ ^\circ$C. Compute the new equilibrium chamber pressure, and the
ratio of hot-soak to cold-soak ($-14\ ^\circ$C) chamber pressure across the
full $\pm 35$ K conditioning band.

### A3 — Derivation (6 pts)

Starting from a mass balance on the gas in the port, **derive**

$$p_c = \left(a\,\rho_p\,c^*\,K_n\right)^{\frac{1}{1-n}}$$

Your derivation must:

**(a)** (3 pts) write the unsteady mass balance, name every term and its
units, and state the four assumptions that let you write the nozzle
discharge term as $p_cA_t/c^*$;

**(b)** (2 pts) set the accumulation term to zero and obtain the boxed
result;

**(c)** (1 pt) state, from the form of the result alone, why the equilibrium
exists and is stable only for $n<1$.

### A4 — Short answer (4 pts)

**(a)** (2 pts) A colleague measures $\sigma_p = 0.0024\ \mathrm{K^{-1}}$ in
a strand burner and predicts that a $+35$ K soak will raise the motor's
chamber pressure by 8.8 %. The measured rise is 12.7 %. Explain the
discrepancy in two sentences, without algebra.

**(b)** (2 pts) The exam propellant is fitted over $3$–$11$ MPa. A designer
proposes using the same $a$ and $n$ to predict tail-off behaviour down to
0.4 MPa. Give the two distinct reasons this is unsound.

---

## Section B — Grain geometry and internal ballistics (25 points)

### B1 — Burn-back table to a pressure history (10 pts)

A prismatic, end-inhibited grain has been burned back numerically. The
burning area as a function of burned web $w$ is tabulated below. The
throat is $D_t = 0.150$ m and does **not** erode. Exam propellant.

| $w$ (mm) | 0 | 20 | 40 | 60 | 80 | 100 | 115 |
|---|---|---|---|---|---|---|---|
| $A_b$ (m²) | 4.20 | 4.55 | 4.72 | 4.70 | 4.40 | 3.60 | 2.10 |

**(a)** (2 pts) Compute $A_t$ and tabulate $K_n$ at each web station.

**(b)** (4 pts) Compute $p_c$ at each web station and tabulate it.

**(c)** (2 pts) Compute the burn rate at each station and, using the
trapezoidal rule on $\Delta t = \Delta w/\bar r$ over each interval,
estimate the time at which the web burns through.

**(d)** (2 pts) Classify the trace over $0 \le w \le 60$ mm and over
$60 \le w \le 115$ mm, and state the peak-to-initial pressure ratio. Is the
grain sliver-free? Say what evidence in the table supports your answer.

### B2 — Star grain and neutrality reasoning (8 pts)

An **8-point** star grain is proposed. Sharp-reference parameters: apex
radius $R_p = 0.280$ m, flank half-angle $\theta = 10.0^\circ$, star-tip
fillet radius $f = 8.0$ mm, prismatic grain length $L = 1.60$ m, ends
inhibited. Use the Module 21 results

$$s_0 = R_p\frac{\sin\beta}{\sin(\beta+\theta)},\qquad
P(u) = 2Ns_0 + 2N\left[\left(\frac{\pi}{2}-\theta\right)-\cot(\beta+\theta)\right]u,
\qquad \beta = \frac{\pi}{N},\quad u = f+y$$

**(a)** (3 pts) Compute $s_0$, the perimeter intercept $2Ns_0$, and the
perimeter slope $dP/du$. Compute $A_b$ at $y = 0$ and at $y = 60$ mm of
burned web.

**(b)** (2 pts) Classify the trace (progressive / neutral / regressive) and
compute the ratio $p_c(y{=}60\ \mathrm{mm})/p_c(y{=}0)$.

**(c)** (3 pts) The Module 21 table gives the exactly-neutral flank
half-angle for $N=8$ as $\theta = 14.81^\circ$. **Verify** that this value
satisfies the neutrality condition
$\tfrac{\pi}{2}-\theta = \cot(\beta+\theta)$, then answer, with reasons:
(i) why the neutrality condition contains no radii at all; (ii) why
changing the fillet radius $f$ cannot make a non-neutral star neutral;
(iii) what the designer gives up by moving from $\theta = 10^\circ$ to the
neutral $14.81^\circ$.

### B3 — Internal-burning tube and port flow (7 pts)

A case-bonded cylindrical-perforate (CP) grain has initial bore radius
$R_{i0} = 0.110$ m, outer radius $R_o = 0.240$ m, grain length
$L = 2.60$ m, ends inhibited, throat diameter $D_t = 0.120$ m,
non-eroding. Exam propellant.

**(a)** (3 pts) Compute $A_b$, $K_n$ and $p_c$ at $w = 0$ and at web
burnout.

**(b)** (2 pts) State the ratio $p_{c,\mathrm{final}}/p_{c,\mathrm{initial}}$
and show that it follows from the bore-radius ratio and $n$ alone.

**(c)** (2 pts) Compute the port-to-throat ratio $J$ and the port mass flux
$G$ at the aft end at $w=0$. Given a threshold flux
$G_{th} \approx 700\ \mathrm{kg\,m^{-2}s^{-1}}$, say whether erosive burning
is a concern at ignition, and name the *other* ballistic problem this
grain has at $w=0$.

---

## Section C — Cases, insulation, nozzles (25 points)

### C1 — Case wall and mass fraction (9 pts)

A generic monolithic booster: internal radius $R = 0.850$ m, cylindrical
length $L_{cyl} = 7.00$ m (treat the case as a plain cylinder for stress;
account for domes, skirts and bosses with a flat **1.25×** multiplier on the
membrane mass). Nominal chamber pressure $p_{c,\mathrm{nom}} = 7.00$ MPa.
Volumetric loading $\eta_V = 0.86$. Exam propellant. Non-propellant,
non-case hardware (nozzle, insulation, igniter, TVC) is 5.5 % of propellant
mass.

MEOP is built as $\mathrm{MEOP} = p_{c,\mathrm{nom}}\,k_T k_{\mathrm{ign}}
k_{\mathrm{mfg}} k_{\mathrm{stat}}$ with $k_T$ from a $+30$ K hot-day soak
using the exam propellant's $\pi_K$, $k_{\mathrm{ign}} = 1.05$,
$k_{\mathrm{mfg}} = 1.06$, $k_{\mathrm{stat}} = 1.03$. Burst factor
$j_b = 1.40$.

**(a)** (2 pts) Compute $k_T$, MEOP and the burst pressure $p_b$.

**(b)** (3 pts) For a high-strength steel with $F_{tu} = 1500$ MPa and
$\rho = 7830\ \mathrm{kg/m^3}$, size the membrane wall thickness at $p_b$.
Check that the thin-wall assumption holds. Compute the case mass.

**(c)** (2 pts) Compute the propellant mass and the motor's propellant mass
fraction $\zeta$.

**(d)** (2 pts) Repeat (b) and (c) for a filament-wound carbon/epoxy case
using netting theory, $t_L = 1.5\,p_bR/(\sigma_fV_f)$, with
$\sigma_f = 2550$ MPa, $V_f = 0.60$, laminate density $1580\ \mathrm{kg/m^3}$
and the same 1.25× multiplier. State both $PV/W$ values in km and say which
number in your answer is the one a programme manager should be shown.

### C2 — Insulation/liner defect: pressure-rise estimate (7 pts)

A motor with a cylindrical bore of diameter $D = 0.320$ m and grain length
$L_g = 4.50$ m sits in a case of internal radius $R_c = 0.600$ m. Ends are
inhibited. Nominal chamber pressure is 6.50 MPa; MEOP is
$1.50\times$ nominal; burst is $1.40\times$ MEOP. Exam propellant.

A propellant-to-liner debond opens at ignition along the case wall,
exposing the grain's outer cylindrical surface over an axial length $L_d$.

**(a)** (2 pts) Compute the design burning area $A_{b,1}$.

**(b)** (3 pts) For $L_d = 0.40$ m and for $L_d = 1.00$ m, compute the added
burning area, the area ratio, and the resulting equilibrium chamber
pressure. Compare each with MEOP and with burst.

**(c)** (2 pts) Compute the largest $L_d$ the case survives, i.e. the
debond length that puts $p_c$ exactly at burst. Then state, in two
sentences, why this number is an *upper bound* on what the motor tolerates
rather than a design allowable.

### C3 — Throat erosion and thrust decay (9 pts)

A neutral-grain motor has an initial throat radius $r_{t0} = 0.120$ m, a
fixed exit area giving $\varepsilon_0 = 16.0$, an initial chamber pressure
of 7.50 MPa, and a web time of 95 s. Exam propellant, $\gamma = 1.17$,
vacuum operation.

**(a)** (3 pts) With a qualified insert eroding at a constant
$\dot s = 0.060$ mm/s, compute the throat-area growth over the burn, the
end-of-burn chamber pressure ratio (use the closed form
$p_c(t)/p_c(0) = (1+\dot s t/r_{t0})^{-2/(1-n)}$) and the thrust ratio
from $F(t)/F(0) = (1+\dot s t/r_{t0})^{-2n/(1-n)}$.

**(b)** (3 pts) An insert from a substituted material lot erodes at
$\dot s = 0.130$ mm/s. Repeat (a). Then compute end-of-burn thrust the long
way — with the eroded $\varepsilon$ and the corresponding $C_{F,vac}$ — and
say how much of the discrepancy with the $-2n/(1-n)$ result is the
expansion-ratio loss. Report the $I_{sp}$ change.

**(c)** (3 pts) Explain why thrust falls so much less than chamber
pressure, why the burn takes *longer* than the rigid-throat prediction, and
why total impulse is nearly conserved while the trajectory is not. Name the
public flight failure that this calculation is the analytical picture of,
and say what the recorded proximate cause was.

---

## Section D — Manufacturing, history, requirements (25 points)

### D1 — Production throughput (8 pts)

A generic line builds a 26,000 kg-propellant strap-on. The plant has
vertical batch mixers with a 2,400 kg working batch and a 3.5 h mix cycle;
propellant working life after the curative goes in is 7.0 h; one casting
bay with a 7.0 h cast window and a 5.0 h changeover; eight cure pits, each
occupied 0.5 d to fill and transfer, 7.0 d to cure, 1.5 d to cool under
control, 0.5 d to strip the core and clear; and one computed-tomography
cell running 20 h/day at 12.0 h per motor. Line availability
$\eta_a = 0.80$.

**(a)** (2 pts) How many batches per motor, and how many mixers must run in
parallel to cast inside the working life?

**(b)** (3 pts) Compute each station's capacity in motors/day, identify the
binding station, and compute the line output in motors per 30-day month.

**(c)** (3 pts) The programme wants to double output. Compute how many cure
pits would be needed before a different station binds, what each added pit
is worth per month, and state two reasons the resulting number is optimistic
as a delivery forecast.

### D2 — Diagnose a pressure–time trace (8 pts)

A static firing of a well-characterised production motor produces the
following record. Predicted values are in brackets.

- Ignition normal; head-end pressure reaches 6.20 MPa at $t = 0.35$ s
  [6.20 MPa, 0.35 s].
- Trace flat within $\pm 0.5$ % from 0.4 s to 9.1 s [flat].
- At $t \approx 9.2$ s the pressure rises in a **single step over about
  150 ms** to 6.57 MPa, then runs flat and parallel to prediction until
  tail-off.
- Tail-off begins at $t = 41.0$ s [43.5 s].
- $\int p_c\,dt$ over the whole record is within 0.5 % of prediction.
- Post-fire: throat diameter within 1 % of predicted erosion; case, joints
  and insulation show no anomaly; nozzle entry clean.
- The propellant lot's strand data and the previous four motors from the
  same lot were nominal.

**(a)** (3 pts) Compute the fractional increase in burning area implied by
the pressure step, and show your working.

**(b)** (2 pts) Show that the shortened burn time is quantitatively
consistent with your answer to (a) and with the conserved
$\int p_c\,dt$.

**(c)** (3 pts) Give your diagnosis in one sentence. Then take these four
candidate explanations and say, for each, what evidence in the record rules
it out or in: (i) hot-conditioned grain; (ii) slag or debris partially
blocking the throat; (iii) erosive burning; (iv) an out-of-family
burn-rate lot.

### D3 — Why did they design it that way: RSRM versus P120C (9 pts)

Use only these published, architecture-level figures:

| | Space Shuttle RSRM | P120C |
|---|---|---|
| propellant | PBAN/AP/Al | HTPB/AP/Al |
| case | D6AC steel, segmented, 4 flight segments, 3 field joints | carbon-fibre filament-wound, **monolithic** |
| propellant mass | 500,000 kg | 141,400 kg |
| gross mass | 590,000 kg | 153,000 kg |
| $I_{sp}$ | 268 s vac | ≈ 280 s |
| where it was cast | Promontory, Utah; shipped by rail | Kourou / Colleferro, beside the launch site |
| first flight | 1981 (SRM) / 1988 (RSRM) | 2022 |

**(a)** (3 pts) Compute the propellant mass fraction $\zeta$ of each motor.
Then compute the ideal $\Delta v$ each would give a stage consisting of the
motor alone, and state the fraction of the difference that is attributable
to $\zeta$ rather than to $I_{sp}$.

**(b)** (2 pts) Compute the inert mass a P120C-class mass fraction would
give for the RSRM's propellant load, and the inert mass an RSRM-class mass
fraction would give for the P120C's propellant load.

**(c)** (4 pts) Answer the design question properly: **why was the RSRM
segmented steel and the P120C monolithic composite?** Structure your answer
around at least four distinct constraints, at least one of which must be a
manufacturing or logistics constraint rather than a materials one. Then
state whether a 1973 engineer with 2020s materials would have built the
Shuttle booster the P120C way, and what would have stopped them.

---

*End of paper. Total: 100 points.*
