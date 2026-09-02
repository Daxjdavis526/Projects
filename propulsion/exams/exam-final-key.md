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
