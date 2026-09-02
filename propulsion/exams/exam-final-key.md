# Final Comprehensive Examination — Answer Key

**PROPULSION — a rocket propulsion engineering course** · 100 points

Every arithmetic step below is registered in
[`tools/examples/exam-final.py`](../tools/examples/exam-final.py) and is
reproduced by `python3 tools/check_examples.py`. Where a step has no library
function (an iteration loop, a Pugh matrix, a leak conversion) the arithmetic
is written out in that file's docstring instead.

Numbers are quoted to more figures than an examinee should be asked to
produce; grade on the leading three significant figures unless a rubric line
says otherwise.

---

## How to score this paper

- **Method first.** A correct setup with an arithmetic slip loses at most
  30 % of that part's marks. A correct number from a wrong setup scores zero.
  This rule is the course README's and it is not negotiable on the final.
- **Units are part of the answer.** A number without units, or with
  inconsistent units, loses a mark inside the part, floored at zero for that
  part.
- **Assumptions are part of the answer** in Sections C and D. A diagnosis
  with no ruled-out alternative is a guess that happened to be right; award
  no more than half the marks for the sub-part.
- **Judgment parts are graded on the argument, not the conclusion.** Both
  answers to "would you fly it" can earn full marks. Neither earns anything
  without the counter-argument.

### Score bands and the README mastery levels

| score | README band | what it means on *this* paper |
|---|---|---|
| **90–100** | **Level 3 — interview mastery** | Section B essentially clean; both Section C diagnoses correct *with* the ruled-out alternatives named; Section D recommends a compliant architecture, prices the sensitivity, and identifies the parameter that would flip it. Could defend the paper to a senior propulsion engineer. |
| **75–89** | **Level 2 — working engineering knowledge** | Section A ≥ 15; Section B setups all correct with at most one chain broken by arithmetic; Section C diagnoses right but thin on the evidence that rules out alternatives; Section D sized correctly but the trade is asserted rather than weighted. Correct analysis, gaps in judgment. |
| **60–74** | **Level 1 → 2 — familiarity** | Concepts identified, equations written, but calculations incomplete: typically the coupled loop in B3, the closure check in B2(b), or the reconciliation in C2(d) is missing. Re-work Modules 13, 20 and 32 before the capstone. |
| **< 60** | **re-study** | Below this line the paper is not diagnostic of which module failed. Re-sit the Part exams for whichever section scored worst and return here. |

**Section-level diagnosis, for the student scoring themselves.** If your
losses concentrate in

- **Section A** → recall, not reasoning. Re-read Module 32's comparison table
  and the whiteboard drill's "numbers worth memorising"; this is a week's work.
- **B1/B2** → Modules 10, 11, 12, 13. The single most common failure is
  treating the heat-transfer chain as a formula instead of a series resistance.
- **B3/C2** → Modules 20, 21, 27. The failure is almost always evaluating the
  erosive term once instead of solving the loop.
- **B4** → Modules 28–30. Usually the isothermal/adiabatic bound confusion.
- **C1** → Module 18. You cannot reduce a hot-fire dataset without the
  injector-end to nozzle-stagnation correction.
- **D** → Modules 32, 33. Sizing without the closure condition, or a Pugh
  matrix with no weights, is the signature.

---

# Section A — Rapid items (20 points)

One mark each, no partial credit except where noted.

**A1 — (b) 0.6485.**
$\Gamma(1.20) = \sqrt{1.20}\,(2/2.20)^{2.20/0.40} = 0.648531$.
*Distractors:* (a) 0.6337 is $\Gamma(1.14)$-ish, the value for a
hydrogen-rich gas — a student who memorised one number for "combustion gas"
picks it. (c) 0.6584 is $\Gamma(1.25)$, a gas-generator gas. (d) 0.6847 is
$\Gamma(1.40)$ — cold-gas nitrogen. Picking (d) means confusing combustion
products with the working fluid of Part IV.

**A2 — ≈ 2,350 m/s ideal** (accept 2,300–2,400). LOX/RP-1 ≈ 1,800 ideal /
1,730 delivered; LOX/CH₄ ≈ 1,880. Award the mark only if the student says
*ideal*; "2,350 delivered" is wrong by the $\eta_{c^*}$ they will need in B1.

**A3 — (b) 1.92.** $C_{F,vac}(\gamma{=}1.20,\varepsilon{=}60) = 1.9164$.
*Distractors:* (a) 1.80 is $\varepsilon \approx 16$; (c) 2.00 is
$\varepsilon \approx 240$; (d) 2.12 exceeds the $\gamma = 1.20$ vacuum
asymptote and is unphysical for any finite $\varepsilon$ — a student who picks
(d) does not know $C_F$ is bounded.

**A4 — 0.15 to 0.25** ($\Delta p_{inj}/p_c$). Accept "15–25 %". Below ~0.10
expect chug. Half a mark for "about 20 %" with no band.

**A5 — (c) 0.8–1.3 m.** *Distractors:* (a) is a *contraction-ratio*-like
number or an $L^*$ quoted in metres when it was inches; (b) is hydrolox
under-sized; (d) is a monopropellant catalyst bed's residence requirement
misapplied.

**A6 — 100–160 MW/m²** at the throat at full power level. Accept "of order
10² MW/m²". "10 MW/m²" is the F-1 class, not the RS-25, and scores zero.

**A7 — (b).** Eq. 3.4 of Module 13: $f_{gg} \propto K p_c/(\bar\rho\,\eta\,
c_pT_t[1-\pi_t^{-\kappa}])$. The dumped fraction grows in direct proportion
to $p_c$, and the $I_{sp}$ penalty is roughly $0.7f_{gg}$. *Distractors:*
(a) is a real constraint but it caps $T_t$, not $p_c$; (c) is a pump design
constraint that scales with head, not with the cycle's ceiling; (d) is a
chamber/injector matter unrelated to the cycle.

**A8 — 900–1,200 K.** Accept 850–1,250 K. Below it the flow required becomes
prohibitive; above it the uncooled blade alloy and free oxygen in a
oxidiser-rich GG become the limit.

**A9 — (b).** Head breakdown with broadband noise and inlet-vane cavitation
damage. *Distractors:* (a) is backwards — cavitation *destroys* head;
(c) confuses cavitation with a seal failure mode; (d) is what happens to a
turbine if the pump *stalls*, one causal step further downstream.

**A10 — RP-1 ≈ 700 K coolant-side wall** (sources spread 600–800 K; RP-2 buys
50–100 K more). **Methane ≈ 1,000–1,100 K**, limited by pyrolysis rather than
coking. Half a mark for one of the two.

**A11 — (b) 0.2–0.5**; large boosters cluster at 0.25–0.40. *Distractors:*
(a) is a plateau/mesa double-base propellant; (c)–(d) would make the
equilibrium marginal or unstable — at $n \to 1$ the equilibrium in
$p_c = (a\rho_pc^*K_n)^{1/(1-n)}$ ceases to exist.

**A12 — $\pi_K = \sigma_p/(1-n)$**, the fractional change in equilibrium
chamber pressure per kelvin of grain conditioning temperature at constant
$K_n$. Value $= 0.0021/0.65 = 3.231\times10^{-3}\ \mathrm{K^{-1}}$, i.e.
**0.323 %/K**. Half a mark for the definition without the number.

**A13 — (b).** Erosive burning is an aft-end, early-time phenomenon; it decays
as the port opens and $G$ falls below threshold. *Distractors:* (a) is a
debond or an exposed-surface anomaly (Part III exam D2); (c) is throat
erosion; (d) is a sliver.

**A14 — $J < 1.5$** almost guarantees a visible hump; $J > 2$ is comfortable.
Accept either statement; accept the equivalent port-Mach form ($M_{port}
\gtrsim 0.2$–0.3).

**A15 — (b) 65–73 s.** Ideal frozen at $\varepsilon = 50$, 300 K is ≈ 77 s;
realisation is ~0.90. *Distractors:* (a) is a badly under-expanded or
low-$\varepsilon$ micro-thruster; (c) is a monopropellant hydrazine thruster —
this is the most common confusion in the whole of Part IV; (d) is a
bipropellant.

**A16 — 0.90.** Isothermal: $\phi = 1 - p_f/p_i = 1 - 0.1$. (Adiabatic would
be $1-(p_f/p_i)^{1/\gamma} = 0.807$; that answer scores zero here because the
question said isothermal.)

**A17 — (a) 0.378.** In molecular flow the throughput scales as
$1/\sqrt{M}$, so going *from* helium *to* the heavier nitrogen the rate falls
by $\sqrt{M_{He}/M_{N_2}} = \sqrt{4.003/28.014} = 0.3780$. *Distractors:*
(b) 2.645 is the reciprocal — the factor you use going from a nitrogen
requirement to the helium rate you must *measure*, and it is the single most
common sign error in leak-budget work; (c) is the viscous-regime intuition
applied to the wrong power; (d) is the *viscous* regime's rough behaviour, not
molecular.

**A18 — Aerojet Rocketdyne RL10B-2, 465.5 s vacuum.** The highest $I_{sp}$ of
any flown chemical rocket engine. Do **not** accept the RD-0146's 470 s or the
J-2S's 436 s: both are test-stand or paper figures for engines that never flew.
Half a mark for naming the engine without the number.

**A19 — Rocketdyne F-1.** Every clue is uniquely F-1: GG exhaust as a nozzle
film curtain, 178 brazed tubes, 13 baffle compartments, 5,488 rpm on a single
direct-drive shaft. A student answering "H-1" has the family right and the
scale wrong — no mark, but note it: the H-1 is geared and has no baffled
13-compartment face.

**A20 — (b) [E].** Bartz is an empirical correlation fitted to data, valid
inside a stated range and known to err by ±20–30 % at the throat and by a
factor of two against a film-cooled or soot-coated wall. It is not derivable
from conservation laws, which is what [F] would claim.

**Section A rubric.** 1 mark each, 20 total. No partial credit on
multiple-choice. Half marks are available only on A10, A12 and A18 as noted.
A student scoring below 12 here is below Level 2 on recall regardless of what
the rest of the paper says.

---

# Section B — Calculation (40 points)

## B1 — FX-250: performance chain into the heat-transfer chain (10 points)

### (a) Performance chain (3 pts)

$$R = \frac{R_u}{\mathcal{M}} = \frac{8314.46}{21.0} = 395.927\ \mathrm{J/(kg\,K)}$$

$$\Gamma(1.16) = \sqrt{1.16}\left(\frac{2}{2.16}\right)^{2.16/0.32} = 0.6406468$$

$$c^*_{ideal} = \frac{\sqrt{RT_0}}{\Gamma} = \frac{\sqrt{395.927\times3600}}{0.6406468}
= \frac{1193.9}{0.6406468} = 1863.55\ \mathrm{m/s}$$

$$c^*_{del} = 0.960\times1863.55 = \mathbf{1789.00\ m/s}$$

$$C_{F,vac}(\gamma{=}1.16,\ \varepsilon{=}40,\ p_a{=}0) = \mathbf{1.92942}$$

$$A_t = \frac{F}{C_Fp_c} = \frac{1.200\times10^{6}}{1.92942\times2.50\times10^{7}}
= \mathbf{2.48779\times10^{-2}\ m^2}
\;\Rightarrow\; D_t = 2\sqrt{A_t/\pi} = \mathbf{177.98\ mm}$$

$$\dot m = \frac{p_cA_t}{c^*_{del}} = \frac{2.50\times10^{7}\times2.48779\times10^{-2}}{1789.00}
= \mathbf{347.65\ kg/s}$$

$$\dot m_f = \frac{347.65}{1+3.40} = \mathbf{79.011\ kg/s},\qquad
\dot m_o = \mathbf{268.639\ kg/s}$$

$$I_{sp,vac} = \frac{c^*_{del}C_F}{g_0} = \frac{1789.00\times1.92942}{9.80665}
= \mathbf{351.98\ s}$$

(For reference, $A_e = \varepsilon A_t = 0.9951\ \mathrm{m^2}$,
$D_e = 1.1256$ m.)

**Which $c^*$.** The **delivered** one. $\dot m = p_cA_t/c^*$ is the
definition of $c^*$ rearranged, and $c^*$ is *defined* from the measured
mass flow: $c^* \equiv p_cA_t/\dot m$. Using $c^*_{ideal}$ understates the
mass flux by 4 % and therefore understates $h_g$ (which contains $p_0/c^*$,
the throat mass flux) by $0.96^{-0.8}-1 = 3.4$ %. This is the same
bookkeeping trap flagged in Module 10 §5.

> *Rubric (3):* 1 for $R$, $\Gamma$, $c^*$ chain; 1 for $C_F$, $A_t$, $D_t$;
> 1 for $\dot m$, split and $I_{sp}$. Deduct the whole third mark if
> $c^*_{ideal}$ is used in the mass-flow relation without comment.

### (b) Bartz at the throat (3 pts)

$$c_{p0} = \frac{\gamma R}{\gamma-1} = \frac{1.16\times395.927}{0.16}
= 2870.47\ \mathrm{J/(kg\,K)},\qquad
\mathrm{Pr}_0 = \frac{4\times1.16}{9\times1.16-5} = 0.85294$$

Property factor at $M=1$, $T_{wg}/T_0 = 800/3600 = 0.22222$:
$B = 1+\tfrac{\gamma-1}{2} = 1.08$, $A = \tfrac12(0.22222\times1.08)+\tfrac12
= 0.62$, $\sigma = A^{-0.68}B^{-0.12} = \mathbf{1.37140}$.

$$h_g = \frac{0.026}{D_t^{0.2}}\left(\frac{\mu_0^{0.2}c_{p0}}{\mathrm{Pr}_0^{0.6}}\right)
\left(\frac{p_c}{c^*}\right)^{0.8}\left(\frac{D_t}{R_u}\right)^{0.1}
\left(\frac{A_t}{A}\right)^{0.9}\sigma = \mathbf{5.318\times10^{4}\ W/(m^2K)}$$

$$T_{aw} = T_0\frac{1+r\frac{\gamma-1}{2}M^2}{1+\frac{\gamma-1}{2}M^2}
= 3600\times\frac{1.072}{1.080} = \mathbf{3573.3\ K}$$

$$q'' = h_g(T_{aw}-T_{wg}) = 5.3182\times10^{4}\times2773.3
= 1.4749\times10^{8}\ \mathrm{W/m^2} = \mathbf{147.5\ MW/m^2}$$

**Comparison with the RS-25.** Module 10's Bartz reconstruction of the RS-25
throat at 206.4 bar gives 136 MW/m². Pure pressure scaling
$(250/206.4)^{0.8} = 1.166$ would predict $136\times1.166 = 158.5$ MW/m². We
got 147.5, i.e. 7 % *below* the pressure-scaled figure. That is the right
sign and the right size: the FX-250's methalox products have a higher molar
mass and therefore a lower $c_{p0}$ (2,870 versus 3,857 J/(kg·K)) than
hydrolox, and $h_g \propto c_{p0}$. So the comparison is consistent.

> *Rubric (3):* 1 for $c_{p0}$, $\mathrm{Pr}_0$, $\sigma$; 1 for $h_g$ and
> $T_{aw}$; 1 for $q''$ **and** a comparison that names the $c_{p0}$
> difference. A comparison that says only "similar order" scores half.
> Using $T_0$ instead of $T_{aw}$ as the driving temperature: lose the third
> mark — the error is small here (0.7 %) but the concept is the module.

### (c) Wall chain (2 pts)

$$\Delta T_{wall} = \frac{q''t_w}{k} = \frac{1.4749\times10^{8}\times8.0\times10^{-4}}{290}
= \mathbf{406.9\ K}
\;\Rightarrow\; T_{wc} = 800 - 406.9 = \mathbf{393.1\ K}$$

$$h_c^{req} = \frac{q''}{T_{wc}-T_{co}} = \frac{1.4749\times10^{8}}{393.1-290}
= \mathbf{1.430\times10^{6}\ W/(m^2K)}$$

**Comment.** $1.43\times10^{6}$ W/(m²·K) is roughly an order of magnitude
beyond anything supercritical methane will deliver in a milled channel
(realistic ceiling $\sim1$–$1.5\times10^{5}$), and about four times what
liquid hydrogen achieves in the RS-25. **The design as posed does not close.**
Note also that the assumed $T_{wg}=800$ K is not an output but an input: the
honest statement is that no self-consistent solution exists with this $q''$,
this wall and this coolant.

> *Rubric (2):* 1 for $\Delta T_{wall}$ and $T_{wc}$; 1 for $h_c^{req}$ *with*
> the judgment that it is unattainable. A student who computes the number and
> reports it without comment gets half the second mark.

### (d) What actually closes the gap (2 pts)

$$q''_{max} = \frac{T_{wg}-T_{co}}{\dfrac{t_w}{k}+\dfrac{1}{h_c}}
= \frac{800-290}{\dfrac{8.0\times10^{-4}}{290}+\dfrac{1}{1.5\times10^{5}}}
= \frac{510}{2.7586\times10^{-6}+6.6667\times10^{-6}}
= \mathbf{54.11\ MW/m^2}$$

$$\frac{q''_{Bartz}}{q''_{max}} = \frac{147.49}{54.11} = \mathbf{2.726}$$

**The two effects that close the gap:**

1. **Film or curtain cooling of the throat region** — a fuel-rich layer
   injected at the wall lowers the gas-side driving temperature and the local
   $h_g$. This is a *design feature*: it is sized, it costs $I_{sp}$, and it
   can be verified in a hot-fire.
2. **Bartz's own over-prediction against a filmed or soot-coated wall** —
   Module 10's F-1 case shows Bartz high by a factor of two against a
   literature 8–16 MW/m², precisely because the correlation assumes clean
   core gas in contact with the wall.

**Which one you refuse to carry as margin: the second.** It is a *modelling
error*, not a physical margin. You cannot put "the correlation is probably
wrong in our favour" in a thermal margin stack and sign it. Effect 1 is
designed, budgeted and testable; effect 2 is a reason to distrust the number
in both directions and to instrument the wall in the first hot-fire.

> *Rubric (2):* 1 for $q''_{max}$ and the factor; 1 for naming both effects
> **and** correctly refusing the second with the reason. Naming only film
> cooling: half. Refusing film cooling instead: zero on the second mark —
> that is the wrong lesson.

---

## B2 — FX-250: turbopump and cycle balance (10 points)

### (a) Pressure budget and pump power (3 pts)

Fuel path: pump → jacket → preburner → turbine → main injector.

$$p_{d,f} = p_{pb} + \Delta p_{pb,inj} + \Delta p_j + \Delta p_{lines}
= 480+25+45+10 = \mathbf{560\ bar}$$
$$\Delta p_f = 560-8 = \mathbf{552\ bar}$$

Oxidiser path: pump → main injector.

$$p_{d,o} = p_c + \Delta p_{inj} + \Delta p_{lines} = 250+40+10 = \mathbf{300\ bar},
\qquad \Delta p_o = 300-6 = \mathbf{294\ bar}$$

Heads:
$$H_f = \frac{\Delta p_f}{\rho_fg_0} = \frac{5.52\times10^{7}}{422\times9.80665}
= \mathbf{13{,}338\ m},\qquad
H_o = \frac{2.94\times10^{7}}{1140\times9.80665} = \mathbf{2{,}630\ m}$$

Powers:
$$P_f = \frac{\dot m_f\Delta p_f}{\rho_f\eta_{p,f}}
= \frac{79.011\times5.52\times10^{7}}{422\times0.75} = \mathbf{13.780\ MW}$$
$$P_o = \frac{268.639\times2.94\times10^{7}}{1140\times0.78} = \mathbf{8.882\ MW}$$

$$P_{shaft} = \frac{P_f+P_o}{\eta_m} + P_{boost}
= \frac{22.662}{0.98} + 0.80 = \mathbf{23.925\ MW}$$

**Note the shape of the answer:** the fuel pump, moving 23 % of the mass,
absorbs 61 % of the power — because it is pushing a 422 kg/m³ fluid to
560 bar. Low fuel density is what makes staged combustion expensive.

> *Rubric (3):* 1 for both discharge pressures with the fuel path correctly
> routed through the preburner (a student who stops the fuel pump at
> $p_c+\Delta p_{inj}+\Delta p_j$ has built a gas-generator engine and loses
> this mark); 1 for the two powers; 1 for heads and the total including
> $\eta_m$ and the boost stage.

### (b) Does the cycle close? (3 pts)

$$R_t = \frac{8314.46}{14.0} = 593.89\ \mathrm{J/(kg\,K)},\qquad
c_{p,t} = \frac{1.32\times593.89}{0.32} = 2449.80\ \mathrm{J/(kg\,K)}$$

The turbine discharges into the main injector, so its exit pressure is
$p_c + \Delta p_{inj} = 290$ bar:

$$\pi_t = \frac{480}{290} = 1.65517,\qquad
\pi_t^{-\frac{\gamma_t-1}{\gamma_t}} = 1.65517^{-0.242424} = 0.88501$$

$$w_t = \eta_t\,c_{p,t}T_t\left[1-\pi_t^{-\kappa}\right]
= 0.78\times2449.80\times750\times0.11499 = \mathbf{1.648\times10^{5}\ J/kg}$$

Turbine flow = whole fuel flow + preburner oxidiser at $MR_{pb}=0.400$:

$$\dot m_t = \dot m_f(1+MR_{pb}) = 79.011\times1.40 = \mathbf{110.62\ kg/s}$$

$$P_{avail} = \dot m_tw_t = 110.62\times1.648\times10^{5} = \mathbf{18.229\ MW}$$

$$\boxed{P_{avail} = 18.23\ \mathrm{MW} < P_{req} = 23.92\ \mathrm{MW}}$$

**The cycle does not close** — it is short by 5.70 MW, i.e. 23.8 % of the
requirement. Since $w_t \propto T_t$ at fixed $\pi_t$:

$$T_{t,req} = 750\times\frac{23.925}{18.229} = \mathbf{984\ K}$$

**Consequences.** 984 K is above the 700–900 K band a fuel-rich methane
preburner normally runs and pushes an uncooled turbine blade into the region
where a nickel superalloy's creep-rupture allowable (Larson–Miller, Module 16)
falls fast with the required life. A methane-rich gas at 984 K also deposits
carbon on the blades. The three real options are: raise $p_{pb}$ (which raises
$p_{d,f}$ and the fuel pump power, so it pays for itself only partly — this is
the closed-cycle treadmill), split the load onto two shafts so each turbine
sees a smaller bill, or go **full-flow staged combustion**, where an
oxidiser-rich preburner drives the LOX pump independently and the fuel-rich
turbine only has to pay for the fuel pump. That last is precisely the argument
for FFSC on a methalox engine at this chamber pressure.

> *Rubric (3):* 1 for $R_t$, $c_{p,t}$, $\pi_t$ *with the turbine exit at
> $p_c+\Delta p_{inj}$, not at ambient* (using ambient is the classic error and
> costs this mark and the next); 1 for $w_t$, $\dot m_t$, $P_{avail}$ and the
> explicit statement that the cycle does not close; 1 for $T_{t,req}$ **and**
> a consequence that names either the blade material limit or FFSC. Award the
> third mark in full for any of the three escape routes argued properly.

### (c) The same chamber as an open gas generator (2 pts)

$$p_{d,f} = 250+40+45+10 = 345\ \mathrm{bar}\ \Rightarrow\ \Delta p_f = 337\ \mathrm{bar}$$

$$P_f = \frac{79.011\times3.37\times10^{7}}{422\times0.75} = 8.413\ \mathrm{MW},
\qquad P_o = 8.882\ \mathrm{MW},\qquad
P_{shaft} = \frac{17.295}{0.98} = \mathbf{17.648\ MW}$$

$$R_{gg} = \frac{8314.46}{14.5} = 573.41,\qquad c_{p,gg} = \frac{1.30\times573.41}{0.30} = 2484.78$$
$$\pi_t = \frac{300}{2.0} = 150,\qquad
w_t = 0.62\times2484.78\times900\times\left[1-150^{-0.23077}\right] = \mathbf{9.502\times10^{5}\ J/kg}$$

$$\dot m_t = \frac{17.648\times10^{6}}{9.502\times10^{5}} = \mathbf{18.57\ kg/s}
= \mathbf{5.34\ \%\ of\ \dot m}$$

$$I_{sp,eff} = \frac{\dot m\,I_{sp}+\dot m_tI_{sp,gg}}{\dot m+\dot m_t}
= \frac{347.65\times351.98 + 18.57\times110}{366.22} = \mathbf{339.71\ s}$$

**Loss = 12.27 s (3.5 %).** Compare Module 12's WE4, where the same
calculation for a 100 bar kerolox engine gave 2.75 % flow and 5.6 s. The
penalty has more than doubled because $f_{gg} \propto p_c/\bar\rho$ and this
engine is at 2.5× the chamber pressure with a much lighter fuel — which is
Eq. 3.4 of Module 13, and the entire reason nobody builds a 250 bar gas
generator.

> *Rubric (2):* 1 for the reduced pump power and $\dot m_t$; 1 for the flow
> fraction, $I_{sp,eff}$ and a sentence connecting it to the open-cycle
> ceiling. Forgetting that the GG's pump discharge is *lower* than the staged
> engine's costs half of the first mark.

### (d) NPSH on the LOX pump (2 pts)

$$\mathrm{NPSH}_a = \frac{p_{tank}-p_{vap}-\Delta p_{line}}{\rho g_0}
+ \frac{z\,a}{g_0}
= \frac{3.5\times10^{5}-1.5\times10^{5}-0.35\times10^{5}}{1140\times9.80665}
+ \frac{6.0\times1.35\,g_0}{g_0}$$
$$= \frac{1.65\times10^{5}}{11{,}179.6} + 6.0\times1.35
= 14.759 + 8.100 = \mathbf{22.86\ m}$$

At 11,500 rpm, $\omega = 1204.28$ rad/s, $Q_o = 268.639/1140 = 0.23565$ m³/s:

$$S_{ss} = \frac{\omega\sqrt{Q}}{(g_0\,\mathrm{NPSH})^{0.75}}
= \frac{1204.28\times0.48544}{(9.80665\times22.859)^{0.75}} = \mathbf{10.09}$$

**Interpretation.** A plain centrifugal impeller is usually good to
$S_{ss}\approx 3$–5 in these units; 10.1 is well beyond it, so **an inducer is
required** — as it is on essentially every flight LOX pump. If the inducer is
still not enough, the fixes in order of cost are: raise tank pressure (pays in
tank wall mass and pressurant, and Module 12 shows why this saturates), add a
**low-pressure boost pump** driven by its own small turbine (the RS-25's LPOTP
solution), or accept a lower shaft speed and a larger, heavier impeller.

> *Rubric (2):* 1 for $\mathrm{NPSH}_a$ with the acceleration head correctly
> included (omitting the $6.0\times1.35$ term is the common error and costs
> the mark); 1 for $S_{ss}$ and the inducer/boost-pump conclusion.

---

## B3 — Internal ballistics with erosive burning and $\sigma_p$ (10 points)

### (a) Coefficient, geometry, non-erosive equilibrium (2 pts)

$$a = \frac{r_{ref}}{p_{ref}^{\,n}} = \frac{7.20\times10^{-3}}{(6.00\times10^{6})^{0.35}}
= \frac{7.20\times10^{-3}}{235.69} = \mathbf{3.0548\times10^{-5}}\ \mathrm{m\,s^{-1}Pa^{-0.35}}$$

$$A_t = \frac{\pi}{4}(0.0740)^2 = \mathbf{4.30084\times10^{-3}\ m^2},\qquad
K_n = \frac{A_b}{A_t} = \frac{1.4451}{4.30084\times10^{-3}} = \mathbf{336.0}$$

$$p_c = \left(a\rho_pc^*K_n\right)^{\frac{1}{1-n}}
= \left(3.0548\times10^{-5}\times1770\times1545\times336.0\right)^{1/0.65}$$
$$= (28{,}071)^{1.53846} = \mathbf{6.973\ MPa}$$

$$r = ap_c^{\,n} = 3.0548\times10^{-5}\times(6.973\times10^{6})^{0.35}
= \mathbf{7.589\ mm/s}$$

$$\dot m = \frac{p_cA_t}{c^*} = \frac{6.973\times10^{6}\times4.30084\times10^{-3}}{1545}
= \mathbf{19.412\ kg/s}$$

*Check:* $\rho_pA_br = 1770\times1.4451\times7.589\times10^{-3} = 19.41$ kg/s. ✓

> *Rubric (2):* 1 for $a$ in correct SI units (a student who leaves $a$ in
> mm/s·MPa$^{-n}$ and then feeds pascals into it will be out by a factor of
> $10^{-3}\times(10^{6})^{0.35} = 0.236$ and loses this mark); 1 for $K_n$,
> $p_c$, $r$, $\dot m$ with the mass-balance check.

### (b) Port geometry and the erosive-burning screen (1 pt)

$$A_p = \frac{\pi}{4}(0.100)^2 = 7.854\times10^{-3}\ \mathrm{m^2},\qquad
J = \frac{A_p}{A_t} = \frac{7.854\times10^{-3}}{4.30084\times10^{-3}} = \mathbf{1.826}$$

$$G = \frac{\dot m}{A_p} = \frac{19.412}{7.854\times10^{-3}}
= \mathbf{2472\ kg\,m^{-2}s^{-1}}$$

$J = 1.83$ is below the comfortable $J>2$ line and $G$ is **2.15×** the
threshold flux. **Expect an erosive hump.** (Equivalently: treating the port
as a subsonic duct feeding a choked throat, $A/A^* = 1.83$ at $\gamma=1.18$
gives $M_{port}\approx0.34$, above the 0.2–0.3 onset band.)

> *Rubric (1):* all of $A_p$, $J$, $G$ and the conclusion. Half for the
> numbers with no conclusion.

### (c) The coupled erosive equilibrium (3 pts)

Solve simultaneously, with the aft 30 % of the surface augmented:

$$\bar r = ap_c^{\,n} + 0.30\,k\left\langle \frac{p_cA_t/c^*}{A_p}-G_{th}\right\rangle,
\qquad p_c = \frac{\rho_pA_b\bar r\,c^*}{A_t}$$

Successive substitution from the non-erosive pressure:

| it. | $p_c$ [MPa] | $G$ [kg m⁻²s⁻¹] | $r_0$ [mm/s] | $\Delta r$ [mm/s] | $\bar r$ [mm/s] | $p_c'$ [MPa] |
|---|---|---|---|---|---|---|
| 1 | 6.9733 | 2471.6 | 7.5890 | 2.1145 | 8.2233 | 7.5562 |
| 2 | 7.5562 | 2678.2 | 7.8052 | 2.4451 | 8.5388 | 7.8460 |
| 3 | 7.8460 | 2780.9 | 7.9087 | 2.6094 | 8.6916 | 7.9865 |
| 4 | 7.9865 | 2830.7 | 7.9580 | 2.6891 | 8.7647 | 8.0537 |
| 5 | 8.0537 | 2854.5 | 7.9814 | 2.7272 | 8.7995 | 8.0857 |
| … | | | | | | |
| conv. | **8.1145** | 2876.1 | 8.0024 | 2.7617 | 8.8309 | 8.1145 |

$$\boxed{p_{c,erosive} = 8.115\ \mathrm{MPa}},\qquad
\bar r = 8.831\ \mathrm{mm/s}$$

Aft-end local rate $= r_0+\Delta r = 8.0024+2.7617 = \mathbf{10.764\ mm/s}$;
**local augmentation ratio $= 1.345$**.

$$\frac{p_{c,erosive}}{p_{c,non-erosive}} - 1 = \frac{8.1145}{6.9733}-1
= \mathbf{+16.4\ \%}$$

**Why one pass is wrong.** The erosive term raises $\bar r$, which raises
$\dot m$, which (at a fixed throat) raises $p_c$, which raises $G$, which
raises the erosive term again. Evaluating $k\langle G-G_{th}\rangle$ once at
6.973 MPa gives $\Delta r = 2.11$ mm/s and a pressure of 7.56 MPa — it
under-predicts the converged answer by 7 %, and it under-predicts the local
augmentation by 24 %. The loop still converges because $n<1$ keeps the
discharge term winning, but it converges *above* the first pass, always.

> *Rubric (3):* 1 for writing the coupled pair correctly (including the 0.30
> weighting); 1 for at least three visible iterations converging to
> 8.11 ± 0.05 MPa; 1 for the local rate, augmentation ratio, percentage rise
> and the "why one pass is wrong" sentence. A single-pass answer of 7.56 MPa
> presented as the result: maximum 1 of 3.

### (d) Hot conditioning and the MEOP stack (2 pts)

$$\pi_K = \frac{\sigma_p}{1-n} = \frac{0.0021}{0.65}
= \mathbf{3.231\times10^{-3}\ K^{-1}} = 0.323\ \%/\mathrm{K}$$

$$a_{hot} = a\,e^{\sigma_p\Delta T} = 3.0548\times10^{-5}\times e^{0.0021\times30}
= 3.0548\times10^{-5}\times1.06503 = 3.2534\times10^{-5}$$

Hot **non-erosive**: $p_c = (a_{hot}\rho_pc^*K_n)^{1/0.65} = \mathbf{7.683\ MPa}$
(+10.2 % on nominal — and note $10.2\% \approx \pi_K\times30 = 9.7\%$, the
small difference being the exactness of the exponential versus the linearised
$\pi_K$).

Hot **erosive**, re-running the same loop with $a_{hot}$:

| it. | $p_c$ [MPa] | $G$ | $r_0$ [mm/s] | $\Delta r$ | $\bar r$ | $p_c'$ |
|---|---|---|---|---|---|---|
| 1 | 7.6830 | 2723.1 | 8.3614 | 2.5170 | 9.1165 | 8.3769 |
| 2 | 8.3769 | 2969.0 | 8.6182 | 2.9105 | 9.4914 | 8.7214 |
| 3 | 8.7214 | 3091.2 | 8.7407 | 3.1058 | 9.6724 | 8.8878 |
| conv. | **9.0382** | 3203.4 | 8.8505 | 3.2855 | 9.8362 | 9.0382 |

$$\boxed{p_{c,\ hot+erosive} = 9.038\ \mathrm{MPa}} = 1.296\times \text{nominal}$$

Against MEOP: $9.038/9.50 = 0.951$ — **4.9 % below MEOP**. Against burst
($1.40\times9.50 = 13.30$ MPa): $9.038/13.30 = 0.680$, a burst margin of 1.47.

**It passes, but only just, and the stack is not finished.** Three further
contributors that belong in it before the case is signed off:

1. **Ignition overshoot** — the igniter's own mass addition plus the
   filling transient, typically several percent above the equilibrium
   pressure and superimposed on exactly the same early-time window as the
   erosive hump.
2. **Lot-to-lot dispersion on $a$** (and on $\rho_p$ and $c^*$) — a
   statistical allowance, normally a 3σ upper bound on the burn-rate
   coefficient, is a separate multiplier from the temperature term.
3. **Throat-area tolerance and slag** — a throat 1 % small raises $K_n$ by
   1 % and $p_c$ by 1.54 %; partial slag blockage does the same thing
   transiently and is not a manufacturing tolerance you can inspect out.

(Also acceptable: grain-crack or debond exposure of extra surface, and
uncertainty in the erosive constants themselves, which are the least
trustworthy numbers in the whole calculation.)

> *Rubric (2):* 1 for $\pi_K$, $a_{hot}$, hot non-erosive; 1 for the hot
> erosive value, the MEOP/burst comparison **and** three named contributors.
> Two contributors: half. Applying $\pi_K$ to the *erosive* pressure directly
> (i.e. $8.115\times1.097$) is a defensible approximation that lands at
> 8.90 MPa — award the mark but note the 1.5 % error and its cause: $\pi_K$ is
> derived at constant $K_n$ with no erosive term.

### (e) When the hump dies (2 pts)

Once the erosive term shuts off the plateau returns to the non-erosive
$\dot m = 19.412$ kg/s. The term extinguishes when $G$ falls to $G_{th}$:

$$A_{p,ext} = \frac{\dot m}{G_{th}} = \frac{19.412}{1150}
= 1.6880\times10^{-2}\ \mathrm{m^2}
\ \Rightarrow\ D_{p,ext} = \mathbf{146.6\ mm}$$

$$w = \frac{146.6-100.0}{2} = \mathbf{23.3\ mm\ of\ web\ burned}$$

At the augmented mean rate of 8.83 mm/s this takes $23.3/8.83 = 2.64$ s; at
the plateau rate of 7.59 mm/s it would be 3.07 s. So the hump occupies
**roughly 2.6–3.1 s, i.e. 12–14 % of the 22 s web time** — and, since it
decays smoothly, the *visible* part of it is shorter still. (The estimate is a
lower bound on the duration in one sense and an upper bound in another: the
elevated pressure during the hump raises $\dot m$, which keeps $G$ above
threshold slightly longer, but it also burns the web faster.)

**Geometric fix and its cost.** Open the initial port — raise $J$ above 2 by
increasing the bore diameter (or, better for a finocyl, by deepening the
fins so the *flow area* grows without the burning area growing). Going from
$J=1.83$ to $J=2.2$ needs $A_p$ up 20 %, i.e. $D_p$ from 100 to 110 mm. **The
cost is volumetric loading**: the same case now holds less propellant, so
either the motor grows or the total impulse falls. That is the standard trade
and it is why tactical motors, which are volume-starved by the airframe,
live with erosive humps and size the case for them instead.

> *Rubric (2):* 1 for $D_{p,ext}$ and the web burned; 1 for the time fraction
> and a fix with its stated cost. "Use a slower propellant" is also
> acceptable for the fix (it lowers $\dot m$ and hence $G$) provided the cost —
> lower thrust for the same geometry — is stated.

---

## B4 — Cold-gas blowdown module (10 points)

Gas constants: $R_{N_2} = 8314.46/28.014 = 296.797$ J/(kg·K);
$R_{Ar} = 8314.46/39.948 = 208.132$ J/(kg·K).

### (a) Propellant, tank volume, tank size (3 pts)

$$I_{sp,ideal}(\gamma{=}1.400,\ R_{N_2},\ T_0{=}293.15,\ \varepsilon{=}60)
= \mathbf{76.223\ s}$$
$$I_{sp,del} = 0.90\times76.223 = \mathbf{68.601\ s}$$

$$m_{usable} = \frac{I_t}{g_0I_{sp}} = \frac{1150}{9.80665\times68.601}
= \mathbf{1.7094\ kg}$$

$$\phi_{iso} = 1-\frac{p_f}{p_i} = 1-\frac{20}{200} = \mathbf{0.900}$$

$$m_i = \frac{m_{usable}}{\phi} = \frac{1.7094}{0.900} = \mathbf{1.8994\ kg}$$

$$V = \frac{m_iZ_iRT}{p_i}
= \frac{1.8994\times1.05\times296.797\times293.15}{2.00\times10^{7}}
= 8.676\times10^{-3}\ \mathrm{m^3} = \mathbf{8.676\ L}$$

Tank internal volume at 95 % fill: $8.676/0.95 = 9.133$ L, so

$$r = \left(\frac{3V_{tank}}{4\pi}\right)^{1/3} = 0.12967\ \mathrm{m}
\ \Rightarrow\ D_{tank} = \mathbf{259.3\ mm}$$

*Sanity check:* $1.899$ kg of gas in a 9.1 L sphere at 200 bar on a 145 kg
spacecraft — 1.3 % of the vehicle mass as propellant for 7.9 m/s of $\Delta v$
(Tsiolkovsky at 68.6 s gives 7.98 m/s). That is the cold-gas bargain and its
limit in one line.

> *Rubric (3):* 1 for both $I_{sp}$ figures; 1 for $m_{usable}$, $\phi$, $m_i$;
> 1 for $V$ (with $Z$ applied) and $D_{tank}$. Omitting $Z$ gives
> $V = 8.26$ L — a 4.8 % error, and it is always in the unsafe direction. Lose
> half the third mark.

### (b) Thruster sizing (2 pts)

$$C_{F,vac}(1.400,\ \varepsilon{=}60) = \mathbf{1.73521}$$

$$A_t = \frac{F_{EOL}}{C_Fp_f} = \frac{0.350}{1.73521\times2.00\times10^{6}}
= \mathbf{1.00852\times10^{-7}\ m^2}
\ \Rightarrow\ D_t = \mathbf{358.3\ \mu m}$$

$$F_{BOL} = C_Fp_iA_t = 1.73521\times2.00\times10^{7}\times1.00852\times10^{-7}
= \mathbf{3.500\ N}$$

$$\dot m = \frac{\Gamma p_0A_t}{\sqrt{RT_0}}:\qquad
\dot m_{BOL} = \mathbf{4.682\times10^{-3}\ kg/s},\quad
\dot m_{EOL} = \mathbf{4.682\times10^{-4}\ kg/s}$$

**The control problem.** Thrust varies **10:1** over the mission, and so does
the impulse bit at a fixed valve on-time. A closed-loop attitude controller
tuned at 3.5 N is badly over-damped at 0.35 N and a duty cycle sized at
0.35 N saturates at 3.5 N; worse, the minimum impulse bit — set by valve
opening and closing time, not by the commanded pulse — also varies 10:1, so
the pointing dead-band is not constant over the mission.

**The two standard fixes:** (i) put a **pressure regulator** downstream of the
tank and run the thruster at a fixed plenum pressure, accepting the regulator's
mass, its droop, and its failure modes (this is what almost every flight system
does); or (ii) keep the blowdown and **close the loop on measured thrust or on
tank pressure**, scaling commanded on-time as $1/p_{tank}$ in the flight
software, which costs nothing in mass but leaves the minimum impulse bit
uncontrolled at the low-pressure end.

> *Rubric (2):* 1 for $C_F$, $A_t$, $D_t$, $F_{BOL}$ and both flows; 1 for the
> control problem *and* two fixes. Naming only the regulator: half.

### (c) The adiabatic bound (3 pts)

$$\phi_{adiab} = 1-\left(\frac{p_f}{p_i}\right)^{1/\gamma}
= 1-(0.100)^{1/1.400} = 1-0.19307 = \mathbf{0.80693}$$

$$T_f = T_i\left(\frac{p_f}{p_i}\right)^{\frac{\gamma-1}{\gamma}}
= 293.15\times(0.100)^{0.285714} = \mathbf{151.84\ K}$$

$$m_{usable,adiab} = m_i\phi_{adiab} = 1.8994\times0.80693 = \mathbf{1.5326\ kg}$$

$$\text{shortfall} = 1-\frac{0.80693}{0.900} = \mathbf{10.34\ \%}$$

$$I_{sp}(\text{cut-off}) = I_{sp,del}\sqrt{\frac{T_f}{T_i}}
= 68.601\times\sqrt{\frac{151.84}{293.15}} = \mathbf{49.37\ s}$$

**Which bound the real tank sits nearer, and what decides it.** Nearer the
**isothermal** bound, and the deciding parameter is the ratio of the blowdown
time to the tank's thermal time constant $\tau_{th} \sim m_wc_w/(hA)$ — the
time for the tank wall (and, through it, the spacecraft structure) to
re-warm the gas. A cold-gas system that fires in short pulses separated by
minutes or hours is *quasi-isothermal*, because the wall re-heats the gas
between pulses; one that dumps its tank in a single continuous burn of
seconds is *adiabatic*. This module's duty cycle — 400+ discrete pulses over
years — is emphatically the first case, so size on isothermal and quote the
adiabatic number as the worst case for a single long burn.

> *Rubric (3):* 1 for $\phi_{adiab}$ and $T_f$; 1 for the usable mass,
> shortfall and cut-off $I_{sp}$; 1 for naming the thermal time constant (or
> equivalently the pulse spacing versus wall re-warm time) as the deciding
> parameter. "Real systems are in between" with no parameter named: zero on
> the third mark — that sentence is true of everything and predicts nothing.

### (d) Argon in the same tank (2 pts)

$$I_{sp,ideal}(\gamma{=}1.667,\ R_{Ar},\ 293.15,\ \varepsilon{=}60) = \mathbf{55.787\ s}
\ \Rightarrow\ I_{sp,del} = \mathbf{50.208\ s}$$

$$m_{i,Ar} = \frac{p_iV}{Z_iR_{Ar}T}
= \frac{2.00\times10^{7}\times8.676\times10^{-3}}{1.02\times208.132\times293.15}
= \mathbf{2.7881\ kg}$$

$$I_{t,Ar} = m_{i,Ar}\phi_{iso}\,g_0I_{sp,del}
= 2.7881\times0.900\times9.80665\times50.208 = \mathbf{1236\ N\,s}$$

against nitrogen's 1,150 N·s in the identical tank — **argon delivers 7.4 %
more impulse from the same volume at the same pressure**, despite an $I_{sp}$
27 % lower, because impulse density $\rho I_{sp}$ favours the heavier gas.

**Which would I fly, and on what criterion.** **Nitrogen**, on *system mass*.
Argon buys 86 N·s at the cost of 0.89 kg of extra loaded gas on a 145 kg
spacecraft — that is 0.6 % of vehicle mass spent to buy 7 % of a 1,150 N·s
requirement that is not mass-critical. Nitrogen also has the deeper flight
heritage in cold-gas systems and its material compatibility and cleanliness
practice is universal.

**What reverses it:** a **volume**-limited rather than mass-limited design. If
the tank cannot grow — a fixed CubeSat or ESPA envelope, a tank that must fit
between existing structure — then the criterion changes from N·s per kilogram
to N·s per litre, and argon (or a self-pressurising liquid such as R-236fa,
better still) wins outright. The same reversal happens if the requirement
grows: at some total impulse the nitrogen tank no longer fits.

> *Rubric (2):* 1 for both argon numbers and the total impulse; 1 for a
> *criterion-based* recommendation plus the condition that reverses it. An
> answer that recommends argon on impulse density and says a mass-limited bus
> reverses it earns full marks — the recommendation is not the graded object,
> the named criterion is.

---

# Section C — Diagnosis (20 points)

## C1 — TR-90 acceptance series (10 points)

### (a) Reduce both runs (3 pts)

$$p_{c,ns} = \frac{p_{c,inj}}{1.030}:\qquad
\text{run 1: }\mathbf{60.194\ bar},\qquad \text{run 5: }\mathbf{58.641\ bar}$$

$$c^*_{del} = \frac{p_{c,ns}A_t}{\dot m}:\qquad
\text{run 1: }\frac{6.0194\times10^{6}\times9.600\times10^{-3}}{33.50}
= \mathbf{1725.0\ m/s}$$
$$\text{run 5: }\mathbf{1680.5\ m/s}$$

$$\eta_{c^*} = \frac{c^*_{del}}{1798.6}:\qquad
\text{run 1: }\mathbf{0.9591},\qquad\text{run 5: }\mathbf{0.9343}
\qquad(\Delta = -2.58\ \%)$$

$$C_{F,meas} = \frac{F}{p_{c,ns}A_t}:\qquad
\text{run 1: }\frac{8.94\times10^{4}}{5.7786\times10^{4}} = \mathbf{1.5471},
\qquad\text{run 5: }\mathbf{1.5401}$$

Ideal $C_F$ at sea level ($\gamma=1.20$, $\varepsilon=14$, $p_a=101{,}325$ Pa)
is 1.54666 for run 1 and 1.54041 for run 5, so

$$\eta_{C_F} = \mathbf{1.0003}\ \text{(run 1)},\qquad \mathbf{0.9998}\ \text{(run 5)}$$

$$I_{sp} = \frac{F}{\dot mg_0}:\qquad \mathbf{272.1\ s}\ \text{(run 1)},
\qquad\mathbf{263.9\ s}\ \text{(run 5)}$$

**Decomposition of the 3.02 % thrust loss.** $F \propto c^*C_F$:
$c^*$ contributes $-2.58$ %, $C_F$ contributes $-0.40$ %, and
$(1-0.0258)(1-0.0040)-1 = -2.97$ %, which closes on the measured $-3.02$ %
to within reading error. **The nozzle is innocent**: $\eta_{C_F}$ is unity to
0.03 % in both runs, and the $-0.40$ % in $C_F$ is *itself* a consequence of
the $c^*$ loss — a lower $p_c$ makes the fixed-$\varepsilon$ nozzle more
over-expanded at sea level, worsening the pressure-thrust term. **Essentially
100 % of the loss is combustion, none of it is expansion.**

> *Rubric (3):* 1 for both $p_{c,ns}$ (a reduction with $p_{c,inj}$ used raw
> loses this mark — the 3 % correction is 3 % straight onto $c^*$ and it is
> Module 18's whole point); 1 for $c^*$, $\eta_{c^*}$ and $C_F$; 1 for the
> decomposition **with** the statement that the $C_F$ change is a consequence,
> not a cause.

### (b) Injector effective area (2 pts)

At constant $\dot m_f$ and $\rho$, $\dot m_f = C_dA\sqrt{2\rho\Delta p}$, so
$C_dA \propto \Delta p^{-1/2}$:

$$\frac{(C_dA)_5}{(C_dA)_1} = \sqrt{\frac{11.20}{9.10}} = \mathbf{1.1094}
\qquad (+10.94\ \%)$$

Run 1's absolute value, with $\dot m_f = 33.50/(1+2.35) = 10.00$ kg/s:

$$C_dA = \frac{10.00}{\sqrt{2\times810\times1.120\times10^{6}}}
= \frac{10.00}{42{,}596} = 2.3477\times10^{-4}\ \mathrm{m^2}$$
$$A = \frac{C_dA}{0.80} = 2.9346\times10^{-4}\ \mathrm{m^2}
\ \Rightarrow\ N = \frac{2.9346\times10^{-4}}{\frac{\pi}{4}(1.60\times10^{-3})^2}
= \mathbf{146\ orifices}$$

**Can six elements account for it?** No. A 10.94 % area increase on 146
orifices is **16.0 orifice-equivalents**. Spread over six orifices, each would
have to grow to 3.66 times its original area — a diameter of
$1.60\times1.91 = 3.06$ mm. Erosion that severe would be unmistakable, and it
would not produce six *streaks* on the face; it would produce six craters. The
honest conclusion is that the borescope is seeing the **downstream symptom**
on the face of a change distributed over many more orifices than six — a
general enlargement, a lost or eroded orifice insert, or an eroded
manifold-side entry radius that has raised $C_d$ rather than $A$. (Note the
measurement cannot separate $C_d$ from $A$: a rounded, cavitation-free entry
can raise $C_d$ from 0.65–0.70 toward 0.85 with no area change at all, and
that alone is a 20–30 % $C_dA$ shift.)

> *Rubric (2):* 1 for the 1.1094 ratio and $N = 146$; 1 for the "no" with a
> quantitative reason. A student who says "yes, six elements could do it"
> without computing the required per-orifice growth scores zero on the second
> mark. Full marks for spotting that $C_d$ and $A$ are not separable here.

### (c) Stability margin and the 220 Hz (2 pts)

$$\frac{\Delta p_{inj,f}}{p_{c,inj}}:\qquad
\text{run 1: }\frac{11.20}{62.00} = \mathbf{18.1\ \%},\qquad
\text{run 5: }\frac{9.10}{60.40} = \mathbf{15.1\ \%}$$

Run 1 sits comfortably inside the 15–25 % band; run 5 sits **on its lower
edge**. But the oscillation appears at **60 % throttle**, and that is where
the margin actually goes: injector $\Delta p$ falls roughly as $\dot m^2$
while $p_c$ falls roughly as $\dot m$, so

$$\left.\frac{\Delta p}{p_c}\right|_{60\%} \approx
\frac{\Delta p_{100\%}\times0.36}{p_{c,100\%}\times0.60}
= 0.60\left.\frac{\Delta p}{p_c}\right|_{100\%}$$

giving **10.8 %** for run 1 and **9.0 %** for run 5. Run 5 has crossed below
the ~10 % line at which chug is expected; run 1 was marginal and did not.

**Band and mechanism.** 220 Hz is in the **low-frequency (chug) band**
(10–500 Hz): chamber gas volume acting as a capacitance against the feed-line
fluid column, driven by the injector $\Delta p$ being modulated by $p_c$ with
a combustion time lag. It also overlaps the bottom of the buzz band
(200–1,000 Hz), so the discriminator matters: **chug** appears simultaneously
and in phase on the propellant-line pressure transducers and on $p_c$, and it
scales with feed-line length; **buzz** is a manifold/dome acoustic resonance
seen strongly on the dome transducer and hardly at all up the line. Check the
line transducers before naming it.

> *Rubric (2):* 1 for both ratios and the throttled values; 1 for naming chug,
> the coupling mechanism, and the discriminator against buzz. Naming chug with
> no mechanism: half. Naming screech: zero — 220 Hz is two orders below the
> acoustic band and this is a Level-1 error.

### (d) Diagnosis (3 pts)

**Diagnosis, one sentence.** The fuel injector's effective flow area has grown
by about 11 % over five runs, lowering the injector pressure drop from 18 % to
15 % of $p_c$; the coarser, less well mixed spray costs 2.6 % of $c^*$ (hence
3 % of thrust and 8 s of $I_{sp}$), streaks the face, drives a local hot spot,
and has eaten the chug margin, which is why 220 Hz appears at 60 % throttle.

**The four candidates:**

| candidate | verdict | the evidence that decides it |
|---|---|---|
| **(i) Throat erosion** | **ruled out** | $A_t$ measured within 0.3 % post-test. And the signature is wrong: an eroded throat lowers $p_c$ **at constant $\dot m$ while $c^*$ stays put**, because $c^* = p_cA_t/\dot m$ is area-corrected. Here $c^*$ itself fell. |
| **(ii) Drifting fuel flowmeter** | **ruled out, with a caveat** | If $\dot m$ were really higher than indicated, $c^*$ would be over-stated in *both* runs equally, not drifting. More decisively, a flow error cannot produce a $\Delta p$ change: at constant true flow through a constant orifice, $\Delta p$ is constant. The measured $\Delta p$ moved 19 %. Caveat: this argument assumes the $\Delta p$ transducers are good, so cross-check them. |
| **(iii) Injector face erosion / orifice enlargement** | **ruled in** | It is the only candidate that explains all four independent observations at once: $\Delta p$ down at constant flow, $c^*$ down, streaking on the fuel side, and one wall thermocouple 90 K hot while the others are unchanged (a maldistributed element throwing a fuel-lean streak at one azimuth). |
| **(iv) Mixture-ratio shift** | **ruled out** | $MR$ is reported as 2.35 in both runs and the oxidiser-side $\Delta p$ is unchanged (12.40 → 12.30 bar, within noise). A real $MR$ shift would move the ox $\Delta p$ or the flows, and would move $c^*$ *and* the wall temperatures globally, not at one azimuth. |

**The one measurement to add, and the instrument.** A **cold-flow calibration
of the fuel circuit between runs**: flow water (or the actual fuel) through the
assembled injector on a flow bench at several flow rates and measure
$\dot m$ against $\Delta p$ directly, giving $C_dA$ as a curve rather than a
single hot-fire point. That separates area growth from a $C_d$ change (the
curve's *shape* moves if the entry geometry changed; only its level moves if
area changed) and it is non-destructive. Second choice, if the engine cannot
come off the stand: add **high-response Kulite transducers in the fuel dome
and in the fuel line** so that the 220 Hz can be phase-correlated with $p_c$
and the chug/buzz question settled in the next run.

> *Rubric (3):* 1 for the one-sentence diagnosis naming injector area growth
> as the cause and the $c^*$ loss as the mechanism; 1 for four verdicts with
> evidence (¼ each; a verdict with no evidence scores nothing); 1 for a
> measurement **with** an instrument and a statement of what it discriminates.
> "Inspect the injector" is not a measurement.

---

## C2 — Solid motor qualification firing (10 points)

Throughout, the working relation is $p_c \propto K_n^{1/(1-n)}$ with
$1/(1-n) = 1/0.65 = 1.53846$, so a pressure ratio implies an area (or
burn-rate) ratio through the **inverse** exponent $1-n = 0.65$.

### (a) The early hump (2 pts)

$$\frac{p_{peak}}{p_{plateau}} = \frac{8.15}{6.98} = 1.16762$$

$$m_{mean} = \left(\frac{p_{peak}}{p_{plateau}}\right)^{1-n} = 1.16762^{0.65}
= \mathbf{1.1060}$$

so the *surface-averaged* burn rate at $t=0.25$ s is **10.6 % above** nominal.
If only the aft 30 % of the surface is augmented,

$$m_{local} = 1 + \frac{0.1060}{0.30} = \mathbf{1.353}$$

a **35 % local augmentation** — which is exactly the size B3's coupled
solution produced for a $J=1.83$ port.

**Phenomenon: erosive burning.** It decays because the erosive term is driven
by the port mass flux $G = \dot m/A_p$, and $A_p$ grows as the web burns back.
Once $G$ falls below $G_{th}$ the augmentation switches off entirely. The
3.4 s decay time is consistent with a port that opens ~20–25 mm of web in
that interval.

> *Rubric (2):* 1 for the mean multiplier with the correct $1-n$ exponent
> (using $1/(1-n)$ instead gives 1.271 and loses the mark — this inversion is
> the single most common error on solid-motor traces); 1 for the local value,
> the name, and the decay mechanism.

### (b) The late ramp (2 pts)

$$\frac{A_{b,24}}{A_{b,18}} = \left(\frac{7.60}{6.98}\right)^{0.65}
= 1.08883^{0.65} = \mathbf{1.0569}\qquad(+5.7\ \%)$$

**Two mechanisms that give a smooth ramp rather than a step:**

1. **Progressive burnback geometry** — a fin tip, a slot end or a star point
   burning out, so that the burning perimeter grows continuously as the web
   passes a geometric feature. This is *designed* behaviour if it is in the
   burnback prediction, and an *error in the burnback model* if it is not.
2. **Progressive exposure of new surface through a failing thermal barrier** —
   insulation or liner receding faster than predicted at the aft dome,
   uncovering propellant (or, in the limit, a propagating debond) at a rate
   set by the char rate rather than by a geometric feature.

**The aft-dome evidence supports the second.** Char depth twice predicted at
the aft dome is a direct statement that the insulator there ran far hotter or
far longer than the design case; a geometric burnback feature would leave the
insulation untouched. A step would indicate a debond opening at once (the
Part III exam's case); a *ramp* is consistent with progressive recession.

> *Rubric (2):* 1 for the +5.7 % area; 1 for two mechanisms and the correct
> attribution to the char evidence. One mechanism: half.

### (c) Throat growth and the $I_{sp}$ arithmetic (2 pts)

At fixed burning area, a 4.0 % larger throat is a 4.0 % smaller $K_n$:

$$\frac{p_c}{p_{c,0}} = \left(\frac{1}{1.040}\right)^{1.53846} = \mathbf{0.9414}
\qquad(-5.86\ \%)$$

Expansion ratio falls from 9.00 to $9.00/1.040 = 8.654$:

$$C_{F,vac}(1.18,\ 9.00) = 1.74035 \;\rightarrow\;
C_{F,vac}(1.18,\ 8.654) = 1.73495 \qquad(\mathbf{-0.310\ \%})$$

$$I_{sp} = \frac{c^*C_F}{g_0}:\quad 274.19\ \mathrm{s} \rightarrow 273.33\ \mathrm{s}
\qquad(\mathbf{-0.310\ \%})$$

**The $C_F$ term is 0.31 %, one tenth of the observed 3.1 % shortfall.** It
cannot be the explanation, and this is the physically important asymmetry: an
eroding throat costs chamber pressure heavily (−5.9 %) and specific impulse
barely (−0.3 %), because $C_F$ is a weak logarithmic-ish function of
$\varepsilon$ while $p_c$ goes as $K_n^{1.54}$. That is why an eroding throat
looks alarming on a pressure trace and benign on a thrust trace.

> *Rubric (2):* 1 for the $-5.86$ % pressure effect with the exponent right;
> 1 for the $C_F$/$I_{sp}$ effect and the explicit statement that it is an
> order of magnitude too small.

### (d) Reconciling $\int p_c\,dt$ with $I_t$ (2 pts)

$$I_t = \overline{C_F}\,\overline{A_t}\int p_c\,dt$$

Using the burn-averaged figures — $\int p_c\,dt$ up 1.5 %, $\overline{A_t}$
up 1.5 %, $\overline{C_F}$ down ~0.19 % (half the end-of-burn 0.31 %, since
the throat grows through the burn):

$$\frac{I_{t,pred\ from\ trace}}{I_{t,nominal}} = 1.015\times1.015\times0.9981
= \mathbf{1.0283}\qquad(+2.8\ \%)$$

The measured delivered $I_{sp}$ — and therefore, on the loaded propellant
mass, the measured $I_t$ — is **−3.1 %**. The unaccounted deficit is

$$1-\frac{0.969}{1.0283} = \mathbf{5.8\ \%\ of\ the\ expected\ total\ impulse}$$

**Why the two are not proportional.** $\int p_c\,dt$ measures **gas
generation** — how much propellant surface burned, at what pressure. $I_t$
measures **momentum actually leaving the nozzle**. In a metallised motor the
two decouple, because a fraction of the condensed-phase products
(molten Al₂O₃) is **retained as slag**, chiefly in the aft dome behind the
nozzle entry, and in the boundary layer. That mass was loaded, burned, and
raised the chamber pressure — but it never left, so it contributed to
$\int p_c\,dt$ and nothing to $I_t$. Two-phase lag adds to the same account:
particles that do leave do so below the gas velocity. The unburned sliver
(the long low tail) is the third contributor: propellant that is loaded, hence
in the denominator of $I_{sp}$, but that burns at a pressure too low to expand
usefully.

**The confirming measurement: post-fire weigh-back.** Weigh the motor before
and after, and weigh the slag recovered from the aft dome and the nozzle
separately. A 5–6 % impulse deficit should show up as a few percent of loaded
mass recovered as slag plus sliver residue. If the weigh-back closes, the
motor is behaving as a metallised motor with an aft-dome slag trap problem; if
it does not, the thrust-stand calibration is the next suspect.

> *Rubric (2):* 1 for the relation and the +2.8 % trace-predicted impulse;
> 1 for the deficit and the slag/two-phase/sliver explanation with a named
> post-fire measurement. A student who simply asserts "two-phase losses"
> without noting that $\int p_c\,dt$ and $I_t$ measure different things gets
> half.

### (e) Three diagnoses, one refusal (2 pts)

| anomaly | one-sentence diagnosis |
|---|---|
| **Early hump, 0.25–3.4 s** | Erosive burning at a low-$J$ aft port, decaying as the bore opens; benign, predictable, and it belongs in the MEOP stack, not in a failure report. |
| **Ramp, 18–24 s** | Aft-dome insulation receding faster than predicted and progressively exposing propellant (or an opening bond line), corroborated by doubled char depth. |
| **Long tail-off and the $I_{sp}$ shortfall** | Heavy slag retention plus an unburned sliver, with an asymmetric nozzle-entry gouge indicating slag or a liner fragment passing through — the gouge also implies a **side force** during the event. |

**The one I would refuse to certify around: the aft-dome insulation.** The
hump is understood and boundable; the slag and sliver cost impulse but are a
performance problem, and performance problems are traded, not feared. The
insulation is different: char depth twice predicted means the **margin to
burn-through of the case at the aft dome is unknown**, and the failure mode if
it is exceeded is not a performance shortfall but a case rupture. A motor
whose thermal-protection margin cannot be stated is not qualifiable at any
performance level. (The gouge is a close second and for the same reason: an
asymmetric nozzle entry is a side-force and a structural-margin question, not
a performance one.)

**Instrumentation for the next motor:**

- *Hump:* an **aft-end chamber-pressure transducer in addition to the head-end
  one**. The head-to-aft $\Delta p$ is the direct measurement of port flow and
  is the only way to see erosive burning as such rather than infer it.
- *Ramp:* **insulation thermocouples or breakwires embedded at known depths**
  in the aft dome, plus a bond-line strain or breakwire array, to timestamp
  recession and separate "insulation receded" from "bond opened".
- *Tail-off and slag:* **thrust-stand load cells with lateral axes** (to catch
  the side force from the gouge event), high-speed **plume video** for slag
  ejection, and post-fire weigh-back with slag recovery.

**Which anomaly is invisible on a head-end transducer:** the **asymmetric
nozzle gouge and its side force**. A uniform throat change moves $p_c$ and is
visible; an asymmetric gouge introduces a lateral force and a thrust
misalignment that the head-end pressure trace cannot see at all — which is
precisely why lateral load cells and post-fire nozzle metrology exist.

> *Rubric (2):* 1 for three diagnoses (⅓ each); 1 for the refusal with a
> safety-versus-performance argument, the instrumentation, and the invisible
> anomaly. Naming the insulation *or* the gouge as the refusal both earn full
> marks if argued on margin-unknown grounds; refusing on the erosive hump does
> not — it is the one anomaly that is fully explained.

---

# Section D — Design and trade: KESTREL-G (20 points)

## (a) The closure condition and architecture D (3 pts)

**Statement.** With $m_{inert} = k\,m_p$ and $c = I_{sp}g_0$, the rocket
equation gives $m_p = m_{final}\left(e^{\Delta v/c}-1\right)$ where
$m_{final}$ includes the inert mass. Substituting and solving, the stage
exists only if

$$\boxed{\;k\left(e^{\Delta v/c}-1\right) < 1\;}$$

**Physical meaning.** Every kilogram of propellant drags $k$ kilograms of tank,
structure and plumbing to burnout with it. As $\Delta v/c$ grows, the
propellant required per kilogram of payload grows exponentially — and so does
the inert mass it brings. When $k(e^{\Delta v/c}-1)$ reaches unity, the extra
inert mass exactly consumes the extra propellant's capability, and no finite
propellant load reaches the target $\Delta v$. The stage does not become
*heavy*; it becomes *impossible*, and no amount of engineering inside the
architecture rescues it.

**Architecture D against 1,570 m/s:**

$$c = 68\times9.80665 = 666.85\ \mathrm{m/s},\qquad
e^{1570/666.85}-1 = e^{2.3543}-1 = 9.5312$$
$$k\left(e^{\Delta v/c}-1\right) = 0.55\times9.5312 = \mathbf{5.24} \gg 1$$

**Architecture D is infeasible.** It is not "heavy" or "unattractive" — it does
not exist. Screen it out *before* sizing, and do not put it in the trade
matrix; an option that fails a hard screen contaminates a Pugh matrix by
scoring well on schedule and safety.

**D for R-2 alone (120 m/s), to make the point quantitatively:**
$k(e^{\Delta v/c}-1) = 0.55\times0.1971 = 0.108 < 1$, so it closes, and

$$m_p = \frac{(620+6)\times0.1971}{1-0.108} = \mathbf{138.4\ kg},
\qquad m_{inert} = \mathbf{82.1\ kg},\qquad \text{system} = \mathbf{220.6\ kg}$$

220 kg of propulsion to deliver 120 m/s to a 620 kg spacecraft — 36 % of the
dry mass — against 49 kg for the hydrazine system that does the same job. Cold
gas is a *sub-100 m/s, sub-1,000 N·s* technology and this shows why.

> *Rubric (3):* 1 for the condition stated and explained in terms of inert
> mass consuming capability; 1 for the arithmetic and the word *infeasible*;
> 1 for the R-2-only demonstration. A student who sizes D anyway and reports
> a negative or enormous mass without recognising the screen loses the third
> mark: the point of the condition is to save the sizing effort.

## (b) Sizing A, B and C (6 pts)

For each stage, $m_p = \dfrac{(m_{after}+m_{fixed})\left(e^{\Delta v/c}-1\right)}
{1-k\left(e^{\Delta v/c}-1\right)}$, sized **backwards** from the end of the
mission.

### Architecture A — solid kick + hydrazine monopropellant

*Monopropellant stage first* (it is the last to fire, so it carries only the
spacecraft):
$c = 225\times9.80665 = 2206.5$ m/s; $e^{120/2206.5}-1 = 0.055857$;
$k(e^{\Delta v/c}-1) = 0.28\times0.055857 = 0.01564 < 1$ ✓

$$m_{p,mono} = \frac{(620+4.0)\times0.055857}{1-0.01564} = \mathbf{35.43\ kg},
\qquad m_{inert,mono} = 4.0+0.28\times35.43 = \mathbf{13.92\ kg}$$

Mass the solid must accelerate at its own burnout:
$620+13.92+35.43 = \mathbf{669.35\ kg}$.

*Solid stage:* $c = 289\times9.80665 = 2834.1$ m/s;
$e^{1450/2834.1}-1 = 0.66790$; $k(\cdot) = 0.099\times0.66790 = 0.06612 < 1$ ✓

$$m_{p,solid} = \frac{(669.35+3.0)\times0.66790}{1-0.06612} = \mathbf{480.93\ kg},
\qquad m_{inert,solid} = 3.0+0.099\times480.93 = \mathbf{50.61\ kg}$$

$$\Sigma m_p = 516.36\ \mathrm{kg},\quad \Sigma m_{inert} = 64.53\ \mathrm{kg},
\quad \text{propulsion total} = 580.89\ \mathrm{kg}$$
$$\boxed{m_{wet,A} = 1200.9\ \mathrm{kg}}\qquad\text{R-3 (≤1,250 kg): PASS, 49 kg margin}$$

### Architecture B — pressure-fed NTO/MMH, both jobs

$c = 315\times9.80665 = 3089.1$ m/s; $\Delta v = 1570$ m/s;
$e^{1570/3089.1}-1 = 0.66234$; $k(\cdot) = 0.20\times0.66234 = 0.13247 < 1$ ✓

$$m_p = \frac{(620+14.0)\times0.66234}{1-0.13247} = \mathbf{484.06\ kg},
\qquad m_{inert} = 14.0+0.20\times484.06 = \mathbf{110.81\ kg}$$

$$\text{propulsion total} = 594.87\ \mathrm{kg},\qquad
\boxed{m_{wet,B} = 1214.9\ \mathrm{kg}}\qquad\text{R-3: PASS, 35 kg margin}$$

### Architecture C — electric-pump-fed NTO/MMH, both jobs

$c = 322\times9.80665 = 3157.7$ m/s; $e^{1570/3157.7}-1 = 0.64562$;
$k(\cdot) = 0.135\times0.64562 = 0.08716 < 1$ ✓

$$m_p = \frac{(620+26.0)\times0.64562}{1-0.08716} = \mathbf{455.71\ kg},
\qquad m_{inert} = 26.0+0.135\times455.71 = \mathbf{87.52\ kg}$$

$$\text{propulsion total} = 543.23\ \mathrm{kg},\qquad
\boxed{m_{wet,C} = 1163.2\ \mathrm{kg}}\qquad\text{R-3: PASS, 87 kg margin}$$

### Summary

| | $m_p$ (kg) | $m_{inert}$ (kg) | propulsion (kg) | wet (kg) | R-3 margin |
|---|---|---|---|---|---|
| **A** solid + monoprop | 516.4 | 64.5 | 580.9 | **1200.9** | 49.1 kg |
| **B** pressure-fed bipropellant | 484.1 | 110.8 | 594.9 | **1214.9** | 35.1 kg |
| **C** electric-pump bipropellant | 455.7 | 87.5 | 543.2 | **1163.2** | 86.8 kg |
| **D** cold gas | — | — | — | infeasible | — |

**The three feasible options span 52 kg, or 4.3 %.** Mass does **not** decide
this trade, and any answer that recommends on mass alone has missed the
problem.

> *Rubric (6):* 2 for architecture A sized in the right order (sizing the
> solid first, against 620 kg, is the classic error — it under-sizes the kick
> motor by the 49 kg of monopropellant system it must also accelerate; lose
> 1 of the 2); 2 for B and C (1 each); 1 for the closure check appearing on
> each; 1 for the summary table with R-3 checked. Losing the $m_{fixed}$ term
> in the numerator costs half a mark per architecture.

## (c) Pugh matrix, B as datum (4 pts)

**Screening first.** D is eliminated by (a) and does **not** enter the matrix.
Recording it as a screened row is good practice; scoring it is not, because it
would collect $+$s on schedule, cost and safety for an architecture that
cannot fly the mission.

**Weighting scheme (stated, as required).** Hard requirements are weighted 3;
the two programme risks that historically kill smallsat missions — schedule
and technology readiness — are weighted 2; wet mass is weighted 2 because R-3
has margin but not much; the remaining two are weighted 1. Total weight 17.

| criterion | wt | **B** (datum) | **A** | **C** | D |
|---|---|---|---|---|---|
| Wet mass against R-3 | 2 | 0 | $+$ (−14 kg) | $+$ (−52 kg) | screened |
| **R-1** three burns over 40 days | 3 | 0 | $-$ | 0 | screened |
| **R-2** ≥400 pulses, MIB ≤ 5 N·s | 3 | 0 | 0 | 0 | screened |
| **R-5** single-fault tolerance after burn 1 | 3 | 0 | $-$ | 0 | screened |
| **R-4** schedule, 26 months ATP to launch | 2 | 0 | $-$ | $-$ | screened |
| Technology readiness | 2 | 0 | $+$ | $-$ | screened |
| Ground handling and range safety | 1 | 0 | $-$ | 0 | screened |
| Recurring cost | 1 | 0 | 0 | $-$ | screened |
| **weighted total** | | **0** | **−5** | **−3** | — |

**The two rows that decide it.**

- **R-1 kills A.** A conventional solid kick motor fires **once**. The
  requirement is at least three burns spread over 40 days with a burn
  commanded after a 30-day coast. A dual-pulse motor buys two, not three, and
  a 30-day inter-pulse coast with a pyrotechnically separated barrier is not a
  qualified capability on this schedule. **A is non-compliant, not merely
  worse** — and a Pugh matrix is the wrong tool for a non-compliance; the
  honest treatment is to screen A out on R-1 and record the score only to show
  it would not have won anyway.
- **R-5 also penalises A.** After the first solid burn there is nothing left
  to be tolerant *with*: the failure of the single motor is loss of mission,
  and you cannot make a single-shot solid single-fault tolerant without flying
  two of them.
- **R-4 penalises C.** An electric-pump-fed storable system means new pumps,
  new motors, a battery with a 40-day-coast thermal and state-of-charge
  problem, and a qualification campaign, inside 26 months. That is the
  schedule risk that has actually killed comparable programmes.

> *Rubric (4):* 1 for at least eight criteria including all four requirement
> rows; 1 for a **stated** weighting scheme (an unweighted matrix scores half
> of the whole part, per the question); 1 for correct and defensible $+/0/-$
> assignments; 1 for identifying R-1 as a *compliance* failure for A rather
> than a scoring penalty. Any consistent weighting is acceptable — the graded
> object is that it is stated and applied, not its particular numbers.

## (d) Sensitivity (4 pts)

Recommended architecture: **B**. Base wet mass 1,214.9 kg.

| parameter | perturbation | wet mass (kg) | $\Delta$ (kg) | sensitivity |
|---|---|---|---|---|
| $\Delta v_1$ | $+100$ m/s | 1,270.9 | $+56.0$ | **$+0.56$ kg per m/s** |
| | $-100$ m/s | 1,162.0 | $-52.9$ | $-0.53$ kg per m/s |
| $k$ | $+0.03$ | 1,243.4 | $+28.5$ | **$+950$ kg per unit $k$** (9.5 kg per 0.01) |
| | $-0.03$ | 1,187.7 | $-27.2$ | $-907$ kg per unit $k$ |
| $I_{sp}$ | $-10$ s | 1,243.3 | $+28.4$ | **$-2.8$ kg per second of $I_{sp}$** |
| | $+10$ s | 1,189.0 | $-25.9$ | $-2.6$ kg per second |

**Ranked by the mass swing over the plausible uncertainty in each:**
$\Delta v_1$ ($\pm 53$–56 kg) $>$ $k$ ($\pm 27$–28 kg) $\approx$ $I_{sp}$
($\pm 26$–28 kg).

**Which one flips the recommendation, and to what.**

**$\Delta v_1$, and it flips to C.** B has only 35.1 kg of margin against the
1,250 kg allocation. Solving for the transfer $\Delta v$ at which B reaches
1,250 kg:

$$\Delta v_{total} = 1{,}633\ \mathrm{m/s} \quad\Rightarrow\quad
\Delta v_1 = 1{,}513\ \mathrm{m/s},\ \text{i.e. only}\ \mathbf{+63\ m/s}$$

A 63 m/s growth in the transfer $\Delta v$ — a routine outcome of a rideshare
drop-off dispersion, a longer-than-planned phasing, or a plane-change
allowance that nobody costed — **busts R-3 for architecture B**. The same
calculation for C gives 1,751 m/s total, i.e. **+181 m/s of headroom**. So the
recommendation is only robust if the mission analysis can commit to
$\Delta v_1$ within about $+60$ m/s; if it cannot, C is the correct answer
despite its schedule risk, and the schedule risk must then be bought down
with money and early long-lead procurement.

Neither of the other two flips it: $I_{sp}$ $-10$ s leaves B at 1,243 kg
(still compliant, 7 kg margin — uncomfortably thin but compliant), and
$k+0.03$ leaves it at 1,243 kg likewise. Note that these two *stack*: $-10$ s
**and** $k+0.03$ together bust R-3 on their own. The honest statement to the
programme is that B's 2.8 % mass margin is not enough to absorb the normal
first-year growth in any two of the three parameters.

> *Rubric (4):* 2 for the six perturbed masses with correct signs and
> per-unit sensitivities (⅓ each); 1 for the ranking; 1 for identifying
> $\Delta v_1$ with the break-even quantified and naming C as the alternative.
> A student who names $I_{sp}$ as the flipping parameter has not compared the
> swing against the *margin*, which is the entire skill being tested — no
> mark for that part.

## (e) The decision memo (3 pts)

A full-marks answer contains all six elements. Model:

> **Recommendation.** Adopt **Architecture B**, a single pressure-fed NTO/MMH
> bipropellant system sized for the full 1,570 m/s, for both the GEO transfer
> and eight years of station-keeping.
>
> **Two strongest reasons.** (1) It is the only candidate that meets every
> hard requirement without new development: multi-burn over 40 days,
> sub-5 N·s impulse bits from the same tanks, and a redundant thruster string
> that makes R-5 achievable. (2) Its technology readiness matches the 26-month
> schedule — every component is a catalogue item with GEO flight heritage,
> which is where the programme's real risk lies.
>
> **Strongest argument against.** It is the heaviest feasible option and it
> holds only 35 kg (2.8 %) of margin against the 1,250 kg rideshare
> allocation. A 63 m/s growth in transfer $\Delta v$, or any two of
> {$-10$ s $I_{sp}$, $+0.03$ in $k$, $+60$ m/s}, breaks R-3.
>
> **Evidence to get before freeze.** A committed transfer $\Delta v$ from
> mission analysis with its dispersion — specifically the 99th-percentile
> rideshare drop-off state and the phasing allowance — expressed as a single
> number with a stated confidence, not a nominal.
>
> **Decision date.** It must arrive before tank and propellant-load
> procurement is released, i.e. at PDR minus the tank long-lead time; on a
> 26-month programme that is roughly month 6. After that the tank volume is
> committed and a $\Delta v$ growth can only be paid for in payload.
>
> **A programme that chose the other way.** Many GEO comsat buses of the
> 1980s–2000s flew a **solid apogee kick motor** plus a separate hydrazine
> system — architecture A — and were right to, because their requirement was
> a *single* apogee burn at a fixed epoch, with no 40-day multi-burn
> constraint and no single-fault-tolerance requirement on the insertion. When
> the industry moved to bipropellant unified propulsion systems, the driver
> was exactly the requirement that decides this trade: the flexibility to
> re-plan the transfer in multiple burns and to use the same propellant for
> station-keeping.

> *Rubric (3):* ½ mark each for architecture, two reasons, counter-argument,
> evidence, decision date, historical comparison. A memo that omits the
> decision date, or gives a counter-argument that is not the one its own
> sensitivity analysis identified, cannot score above 2.

---

# Common wrong answers, and what they reveal

1. **Using $c^*_{ideal}$ in $\dot m = p_cA_t/c^*$ (B1a) and then in Bartz
   (B1b).** Reveals that $c^*$ is being treated as a propellant property
   rather than as a *measured* engine performance parameter defined by
   $c^* \equiv p_cA_t/\dot m$. The 4 % error propagates as 3.4 % into $h_g$
   and it is always in the optimistic direction.

2. **Expanding the staged-combustion turbine to ambient (B2b).** Gives
   $\pi_t \approx 240$ instead of 1.66 and a cycle with enormous false margin.
   Reveals that the student has memorised "staged combustion is better"
   without understanding *why* it is harder: the turbine back-pressure is the
   chamber.

3. **Evaluating the erosive term once (B3c).** Gives 7.56 MPa instead of
   8.11 MPa. Reveals that the feedback loop $r\uparrow \to \dot m\uparrow \to
   p_c\uparrow \to G\uparrow$ has not been internalised. It is the same error
   as computing a regeneratively cooled wall temperature without iterating on
   $\sigma$.

4. **Inverting the $p_c$–$K_n$ exponent (C2a).** Using $1/(1-n) = 1.538$ where
   $1-n = 0.65$ is required, or vice versa. Gives 1.271 instead of 1.106 for
   the hump multiplier. The check that catches it: a burning-area change must
   always produce a *larger* fractional pressure change, never smaller.

5. **Omitting $Z$ in the cold-gas tank (B4a).** A 4.8 % volume error at
   200 bar, always in the direction of an under-sized tank. Reveals that the
   ideal-gas law is being applied where the course explicitly says it fails.

6. **Confusing the isothermal and adiabatic usable fractions (B4a/c).** The
   two differ by 10 percentage points here. Reveals no physical picture of
   *why* the gas cools, and therefore no way to decide which bound a real
   system approaches.

7. **Sizing the solid before the monopropellant in D(b).** Under-sizes the
   kick motor because it does not carry the 49 kg station-keeping system to
   GEO. Reveals staging arithmetic done forwards instead of backwards.

8. **A Pugh matrix with no weights, or with a non-compliant option scored
   rather than screened.** Reveals trade-study process not understood: a
   requirement is a gate, not a criterion, and an unweighted matrix silently
   asserts that ground handling matters as much as mission success.

9. **Recommending on wet mass in Section D.** The three feasible options span
   4.3 %. Reveals the habit of optimising the quantity that is easiest to
   compute rather than the one that decides the programme.

10. **Diagnosing without ruling anything out (C1d, C2e).** An answer that
    names the right cause and no alternatives is indistinguishable from a
    guess, and it is graded as one.

---

*End of key. Every registered computation is in
`tools/examples/exam-final.py`; run `python3 tools/check_examples.py` to
verify.*
