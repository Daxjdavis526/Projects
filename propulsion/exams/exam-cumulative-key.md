# Cumulative Exam — Answer Key (Parts I–V, Modules 01–36)

Key for [`exam-cumulative.md`](exam-cumulative.md). Contains full worked
solutions with units, the reasoning a grader wants to see, why each wrong
candidate in the diagnosis questions is wrong, a rubric for every part, a
section scoring guide, and the common wrong answers this paper is built to
catch.

All arithmetic is carried at full precision in
[`../tools/examples/exam-cumulative.py`](../tools/examples/exam-cumulative.py)
and recomputed by `python3 tools/check_examples.py`. Numbers are reported to
four or five significant figures; last-digit differences from your own
arithmetic are not errors.

**Constants.** $g_0 = 9.80665\ \mathrm{m/s^2}$,
$R_u = 8314.46\ \mathrm{J/(kmol\,K)}$, $p_a = 101\,325$ Pa.

---

## Section scoring guide

| section | points | a strong script | a passing script |
|---|---|---|---|
| 1 — RE-1000 | 18 | closes the sizing chain twice, gets the self-consistent wall solution, and states the infeasibility verdict without being told | sizes the chamber and gets $q''$ from Bartz with the given wall temperature |
| 2 — solid booster | 17 | gets the case comparison and the erosion coupling, and diagnoses (e) from the invariant | gets the ballistics and the netting sizing |
| 3 — cold gas | 15 | notices that mass is not the deciding criterion | sizes both systems correctly |
| 4 — diagnosis | 15 | spots that $\eta_{c^*}$ moved the *wrong way* and reads it correctly | computes the efficiencies and names film-cooling loss |
| 5 — selection | 15 | screens on constraints before scoring, and reports the sweep honestly | sizes all four and picks a defensible winner |
| 6 — short answer | 20 | precise, quantitative, no padding | 6–7 of 10 substantially right |

**Grade bands** follow the course README: 90–100 interview mastery, 75–89
working engineering knowledge, 60–74 familiarity, < 60 re-study.

---

# Problem 1 — RE-1000 (18 points)

## Derived once, used throughout

$$R = \frac{R_u}{\mathcal{M}} = \frac{8314.46}{23.3} = 356.84\ \mathrm{J/(kg\,K)}$$

$$\Gamma(\gamma) = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}
= \sqrt{1.21}\,(0.904977)^{5.2619} = 0.650466$$

$$c^*_{ideal} = \frac{\sqrt{RT_0}}{\Gamma} = \frac{\sqrt{356.84\times3600}}{0.650466}
= \frac{1133.4}{0.650466} = 1742.5\ \mathrm{m/s}$$

$$c^*_{del} = 0.960\times1742.5 = \mathbf{1672.8\ m/s}$$

## (a) (4 points) — Thrust-chamber sizing

**Thrust coefficients.** At $\varepsilon = 16.0$, $\gamma = 1.21$:
$M_e = 3.6419$, $p_e/p_c = 1/p_{0}/p_e \Rightarrow p_e = 65\,607$ Pa
($p_e/p_a = 0.6475$ — underexpanded criterion satisfied, see §6.1 method).

$$C_{f,SL}^{ideal} = 1.6275,\qquad C_{f,vac}^{ideal} = 1.7896$$

$$C_{f,SL}^{del} = 0.980\times1.6275 = \mathbf{1.5949},\qquad
C_{f,vac}^{del} = 0.980\times1.7896 = \mathbf{1.7538}$$

**Specific impulse.**

$$I_{sp,SL} = \frac{c^*_{del}C_{f,SL}^{del}}{g_0}
= \frac{1672.8\times1.5949}{9.80665} = \mathbf{272.1\ s},\qquad
I_{sp,vac} = \mathbf{299.2\ s}$$

**Throat and exit.**

$$A_t = \frac{F_{SL}}{p_cC_{f,SL}^{del}} = \frac{1.000\times10^{6}}{100\times10^{5}\times1.5949}
= \mathbf{6.2699\times10^{-2}\ m^2}\;\Rightarrow\;D_t = \mathbf{0.28254\ m}$$

$$A_e = 16.0\,A_t = \mathbf{1.00318\ m^2}\;\Rightarrow\;D_e = \mathbf{1.1302\ m}$$

**Flows.**

$$\dot m = \frac{p_cA_t}{c^*_{del}} = \frac{100\times10^{5}\times6.2699\times10^{-2}}{1672.8}
= \mathbf{374.82\ kg/s}$$

$$\dot m_o = \frac{r}{1+r}\dot m = \frac{2.35}{3.35}\times374.82 = \mathbf{262.93\ kg/s},\qquad
\dot m_f = \mathbf{111.89\ kg/s}$$

**Second route to $A_t$** (the required cross-check):
$A_t = \dot m c^*_{del}/p_c = 374.82\times1672.8/10^{7}
= 6.2699\times10^{-2}\ \mathrm{m^2}$ — identical, as it must be, because
$F = \dot m I_{sp}g_0$ and $C_f = F/(p_cA_t)$ are the same statement.
Closure: $\dot m I_{sp,SL}g_0 = 374.82\times272.1\times9.80665 = 1.000$ MN ✓.

**The station assumption.** Taking nozzle-stagnation $= $ injector-face
pressure over-states $p_c$ by the Rayleigh loss of heat addition in a
finite-area chamber — for $\varepsilon_c = 2.0$ the chamber Mach number is
0.312 and the loss is a few per cent. It therefore *under*-states $A_t$ and
over-states $c^*$ and $I_{sp}$ by roughly the same few per cent [A].

**Sanity check.** The engine database gives **Merlin 1D (SL)** 845 kN SL /
981 kN vac, $\varepsilon = 16$, $I_{sp}$ 282 s SL / 311 s vac, with
$p_c = 97$ bar tagged `n.s.` and **claim**, confidence med-high on
$F/I_{sp}/\varepsilon$ and **med** on $p_c$. RE-1000 lands 3.5 % below Merlin
on sea-level $I_{sp}$ at a similar chamber pressure and the same expansion
ratio, which is what a conservative $\eta_{c^*} = 0.96$ against a mature
pintle injector should give. The comparison is a *plausibility* check only:
Merlin's $p_c$ is a company claim whose station is not stated.

> **Rubric (4).** 1 pt $R$, $\Gamma$, $c^*_{ideal}$, $c^*_{del}$. 1 pt both
> $C_f$ pairs and both $I_{sp}$. 1 pt $A_t$, $D_t$, $A_e$, $D_e$ and the
> second route. 1 pt flows plus the sanity check *with* the confidence tag.
> **Deduct the whole sanity-check mark** for quoting Merlin's 97 bar as fact.

## (b) (3 points) — Chamber and injector

$$V_c = L^*A_t = 1.10\times6.2699\times10^{-2} = \mathbf{6.8969\times10^{-2}\ m^3}
= 68.97\ \mathrm{L}$$

$$A_c = \varepsilon_cA_t = 0.125398\ \mathrm{m^2}\;\Rightarrow\;
D_c = \mathbf{0.39958\ m},\qquad
L_{cyl} = \frac{0.80\,V_c}{A_c} = \mathbf{0.4400\ m}$$

$$\rho_c = \frac{p_c}{RT_0} = \frac{10^{7}}{356.84\times3600} = 7.7843\ \mathrm{kg/m^3}$$

$$t_s = \frac{V_c\rho_c}{\dot m} = \frac{6.8969\times10^{-2}\times7.7843}{374.82}
= 1.4323\times10^{-3}\ \mathrm{s} = \mathbf{1.432\ ms}$$

**Comment.** 1.43 ms is at the *short* end for RP-1: $L^* = 1.10$ m is below
the 1.0–1.3 m band's midpoint for kerolox, and RP-1 droplet lifetimes at
100 bar run 1–2 ms. It is defensible only with a good injector; a
vaporisation-limited $\eta_{c^*}$ shortfall would be the symptom if it is not.

**Injector.** With $\dot m = C_dA\sqrt{2\rho\Delta p}$:

| | $\Delta p$ | $\rho$ | total $A$ | orifice $d$ | count | $V = C_d\sqrt{2\Delta p/\rho}$ |
|---|---|---|---|---|---|---|
| fuel | 20.0 bar | 810 | $2.5201\times10^{-3}\ \mathrm{m^2}$ | 1.40 mm | **1637** | **54.81 m/s** |
| ox | 15.0 bar | 1140 | $5.6201\times10^{-3}\ \mathrm{m^2}$ | 1.80 mm | **2209** | **41.04 m/s** |

$\Delta p_f/p_c = 0.200$ sits inside the **15–25 %** chug-stability band
(module 07 §3, module 15): the injector's hydraulic stiffness must dominate
the chamber's pressure feedback, and below ~15 % the low-frequency
chamber-fill/feed loop goes unstable. The oxidiser side at 0.150 is on the
lower edge and is the circuit that would chug first at throttle.

> **Rubric (3).** 1 pt $V_c$, $D_c$, $L_{cyl}$. 1 pt $\rho_c$ and $t_s$ in ms
> with a comment that engages with the number. 1 pt both orifice sets *and*
> the band statement. Counts within ±2 % accepted.

## (c) (2 points) — Cooling channels

Throat circumference $\pi D_t = 0.88764$ m; channel pitch
$2.00 + 1.50 = 3.50$ mm $\Rightarrow$ **253 channels** (253.6 rounded down).

$$\dot m_{ch} = \frac{111.89}{253} = \mathbf{0.44224\ kg/s},\qquad
A_{ch} = 9.00\times10^{-6}\ \mathrm{m^2}$$

$$V = \frac{\dot m_{ch}}{\rho A_{ch}} = \frac{0.44224}{780\times9.00\times10^{-6}}
= \mathbf{63.00\ m/s}$$

$$D_h = \frac{2wh}{w+h} = \frac{2(2.00)(4.50)}{6.50} = \mathbf{2.7692\ mm}$$

$$Re = \frac{\rho VD_h}{\mu} = \mathbf{3.4018\times10^{5}},\qquad
Pr = \frac{c_p\mu}{k} = \frac{2100\times4.00\times10^{-4}}{0.120} = \mathbf{7.000}$$

$$h_c = 0.023\frac{k}{D_h}Re^{0.8}Pr^{0.4}
= 0.023\times\frac{0.120}{2.7692\times10^{-3}}\times(3.4018\times10^{5})^{0.8}\times7^{0.4}
= \mathbf{5.7804\times10^{4}\ W/(m^2K)}$$

$$\Delta T_{bulk} = \frac{Q}{\dot m_fc_p} = \frac{25.0\times10^{6}}{111.89\times2100}
= \mathbf{106.4\ K}\;\Rightarrow\;T_{b,out} = \mathbf{406.4\ K}$$

*Sanity:* 63 m/s is at the top of the normal 30–70 m/s channel band, which is
what a 100 bar kerolox throat looks like; the jacket $\Delta p$ that follows
is why 45 bar was budgeted in (e).

> **Rubric (2).** 1 pt channel count, per-channel flow, velocity, $D_h$.
> 1 pt $Re$, $Pr$, $h_c$, $\Delta T_{bulk}$. Using $n = 0.3$ (cooling) instead
> of 0.4 (heating) loses half the second mark: the *coolant* is being heated.

## (d) (3 points) — Throat heat flux

**1. Bartz with an assumed wall temperature.**

$$T_{aw} = T_0\frac{1+r\frac{\gamma-1}{2}M^2}{1+\frac{\gamma-1}{2}M^2}
= 3600\times\frac{1+0.90(0.105)}{1.105} = \mathbf{3565.8\ K}$$

$$\sigma = \left[\tfrac12\tfrac{T_{wg}}{T_0}\left(1+\tfrac{\gamma-1}{2}M^2\right)+\tfrac12\right]^{-0.68}
\left(1+\tfrac{\gamma-1}{2}M^2\right)^{-0.12} = \mathbf{1.3635}\quad(T_{wg}=800\ \mathrm{K})$$

$$h_g = \frac{0.026}{D_t^{0.2}}\left(\frac{\mu_0^{0.2}c_{p,0}}{Pr_0^{0.6}}\right)
\left(\frac{p_c}{c^*}\right)^{0.8}\left(\frac{D_t}{r_c}\right)^{0.1}\sigma
= \mathbf{2.2048\times10^{4}\ W/(m^2K)}$$

$$q'' = h_g(T_{aw}-T_{wg}) = 2.2048\times10^{4}\times2765.8
= \mathbf{61.0\ MW/m^2}$$

**2. The self-consistent chain.** $T_{wg}$ is not free: it is whatever the
series resistance makes it. Iterating $\sigma \to h_g \to q'' \to T_{wg}$ to
convergence with $R_{tot} = 1/h_g + t/k_w + 1/h_c$:

| resistance | value (m²K/W) | share |
|---|---|---|
| gas side $1/h_g$ | $4.925\times10^{-5}$ | 71 % |
| wall $t/k_w$ | $2.812\times10^{-6}$ | 4 % |
| coolant side $1/h_c$ | $1.730\times10^{-5}$ | 25 % |

$$\boxed{q'' = 45.55\ \mathrm{MW/m^2},\quad T_{wg} = 1322\ \mathrm{K},\quad
T_{wc} = 1194\ \mathrm{K},\quad \Delta T_{wall} = 128.1\ \mathrm{K}}$$

$$\sigma_{th} = \frac{E\alpha\Delta T}{2(1-\nu)}
= \frac{98\times10^{9}\times17.0\times10^{-6}\times128.1}{2(0.67)} = \mathbf{159.3\ MPa}$$

**Verdict.** $T_{wg} = 1322$ K against an 800 K GRCop-42 limit and
$T_{wc} = 1194$ K against a ~600 K RP-1 coking limit: **the design as stated
does not close.** The 800 K assumption in part 1 was not conservative, it was
simply wrong, and it over-stated $q''$ by 34 % while hiding the fact that the
wall cannot be held there. The thermal stress exceeds the ~100 MPa hot yield
by 1.6×, so the liner yields in compression on every start and in tension on
every shutdown: **life is strain-controlled low-cycle fatigue, not a stress
margin.**

**3. Soot and film.** Adding the soot resistance in series and dropping the
driving temperature to 2600 K:

| case | $q''$ (MW/m²) | $T_{wg}$ (K) | $T_{wc}$ (K) |
|---|---|---|---|
| no film, no soot | 45.55 | 1322 | 1194 |
| no film, soot only | 30.46 | 1019 | 933 |
| film only, no soot | 32.53 | 1061 | 969 |
| **film + soot** | **21.80** | **845** | **783** |

Film-cooling $I_{sp}$ penalty: 6.0 % of the fuel is
$0.060\times111.89 = 6.713$ kg/s, contributing at 60 % of mainstream, so

$$\Delta I_{sp} = 0.40\times\frac{6.713}{374.82}\times272.1 = \mathbf{1.95\ s}$$

**The remaining problem.** Even with both, $T_{wc} = 783$ K sits far above the
~600 K RP-1 coking limit, so the throat will lay down a coke deposit whose
growth is self-limiting only if the wall is allowed to run hotter still.
That is why **the F-1 ran at ~70 bar** (`inj`, contested — the database flags
1,015 psia as low confidence) with 178 brazed tubes *and* a heavy
gas-generator film curtain, rather than at 100 bar: a kerolox chamber
regeneratively cooled by its own fuel is coking-limited, not
strength-limited. The honest engineering answers are to drop $p_c$, raise the
film fraction, or stop using RP-1 as the throat coolant.

> **Rubric (3).** 1 pt part 1 including $T_{aw}$ and $\sigma$. 1 pt the
> converged chain with all three temperatures, the resistance split, and the
> verdict sentence. 1 pt the film+soot case, the film $I_{sp}$ penalty, and
> the F-1 statement. A script that reports the 61 MW/m² of part 1 as *the*
> answer and stops loses the second and third marks entirely — that is the
> point of the question.

## (e) (2 points) — Pumps

| | discharge | inlet | $\Delta p$ | $\rho$ | $H = \Delta p/(\rho g_0)$ | $\eta$ | $P = \dot m\Delta p/(\rho\eta)$ |
|---|---|---|---|---|---|---|---|
| fuel | $100+20+45+5 = 170$ bar | 4.00 bar | 166 bar | 810 | **2090 m** | 0.72 | **3.185 MW** |
| ox | $100+15+5 = 120$ bar | 4.00 bar | 116 bar | 1140 | **1038 m** | 0.74 | **3.615 MW** |

$$P_{pump,total} = \mathbf{6.800\ MW},\qquad
P_{turbine} = \frac{P_{pump}}{\eta_m} = \frac{6.800}{0.98} = \mathbf{6.939\ MW}$$

*Sanity:* the F-1 turbopump delivered 41 MW for 6.77 MN sea-level thrust —
6.0 kW/kN. RE-1000 needs 6.9 kW/kN at 1.4× the F-1's chamber pressure, which
is the right direction and the right size.

> **Rubric (2).** 1 pt both pressure budgets and both heads. 1 pt both shaft
> powers and the turbine power. Forgetting to divide by $\eta_m$ (or
> multiplying) loses half of the second mark.

*(Note: a script that reads the oxidiser injector drop as 20 bar rather than
15 bar gets $P_o = 3.771$ MW and $P_t = 7.098$ MW; accept with the working
shown, but the question states $\Delta p_o/p_c = 0.15$.)*

## (f) (2 points) — Gas generator and its price

Specific turbine work:

$$w_t = \eta_tc_pT_t\left[1-\pi_t^{-\frac{\gamma_t-1}{\gamma_t}}\right]
= 0.600\times2050\times1000\left[1-24.0^{-0.18033}\right]
= \mathbf{536.55\ kJ/kg}$$

$$\dot m_{gg} = \frac{P_{turbine}}{w_t} = \frac{6.939\times10^{6}}{5.3655\times10^{5}}
= \mathbf{12.93\ kg/s}$$

$$\frac{\dot m_{gg}}{\dot m + \dot m_{gg}} = \frac{12.93}{387.75} = \mathbf{3.335\ \%}$$

Engine-level performance:

$$F_{gg} = \dot m_{gg}I_{sp,gg}g_0 = 12.93\times95.0\times9.80665 = 12.05\ \mathrm{kN}$$

$$I_{sp,engine} = \frac{F + F_{gg}}{(\dot m+\dot m_{gg})g_0}
= \frac{1.01205\times10^{6}}{387.75\times9.80665} = \mathbf{266.2\ s}$$

$$\Delta I_{sp,cycle} = 272.1 - 266.2 = \mathbf{5.9\ s};\qquad
\text{with the film, } 5.9 + 1.95 = \mathbf{7.9\ s\ total}$$

**The F-1's answer.** It dumped the gas-generator exhaust into the nozzle
extension as a film-cooling curtain rather than overboard. That recovered part
of the exhaust momentum at the (high) area ratio of the extension *and*
removed the need for a separately cooled extension — one flow doing two jobs.
A modern engineer would still consider it; the price is a permanently
sooty, fuel-rich outer plume and an extension whose contour is set by the
curtain as much as by the gas dynamics.

> **Rubric (2).** 1 pt $w_t$ and $\dot m_{gg}$ with the correct exponent
> $(\gamma_t-1)/\gamma_t$. 1 pt the engine $I_{sp}$, the penalty in seconds,
> and the F-1 sentence. A penalty quoted as a *percentage of flow* rather
> than in seconds of $I_{sp}$ earns nothing: the question asks for the price
> in the currency the vehicle pays it in.

## (g) (2 points) — Materials and test plan

**1. Alloy families and the index that decides each.**

| component | family | deciding index |
|---|---|---|
| liner | copper alloy — GRCop-42/-84, NARloy-Z, CuCrZr | **thermal-shock figure of merit** $k\sigma_y(1-\nu)/(E\alpha)$, because the liner is strain-controlled; conductivity buys wall temperature directly |
| jacket / closeout | Ni-base superalloy (718, 625) or electroformed nickel | **specific strength at temperature** plus the ability to be joined to copper without embrittling it |
| turbine manifold | Ni-base superalloy, cast or wrought 718/Haynes 230 | **creep-rupture life at $T_t$** via Larson–Miller, not room-temperature strength |
| LOX pump housing | Inconel 718 or Monel; **not** titanium | **oxygen compatibility** — titanium is prohibited in oxygen service because it sustains a self-propagating burn once ignited by particle impact |

**2. What strain control changes.** A stress-margin qualification (prove
pressure, show a factor on yield) does not address the failure mode at all:
the liner *will* yield every cycle by design, and life is set by the plastic
strain range through Coffin–Manson, with the standard factor of 4 on cycles.
Qualification must therefore be a **cycle count**, not a load factor —
demonstrate the required starts plus margin on the article, and section a
liner at the end.

Mandatory on every development firing:

- **Measurement:** coolant-circuit **outlet bulk temperature and jacket
  $\Delta p$** on a fast channel. Together they are the integrated heat load
  and the channel flow area; the first drift in either is the earliest
  observable of a film-cooling or channel-blockage problem (this is exactly
  the fingerprint of Problem 4).
- **Inspection:** **borescope of the throat and barrel hot wall** with a
  channel-by-channel flow check against the as-built baseline, looking for
  blanching, doghouse bulging of the hot wall between lands, and a change in
  per-circuit flow resistance.

> **Rubric (2).** 1 pt for four components with four *indices* — naming the
> alloy alone earns nothing. 1 pt for the cycle-count argument plus one
> measurement and one inspection that actually detect the (d) mechanism.

---

# Problem 2 — Composite-cased solid booster (17 points)

## Derived once

$$a = \frac{r_{ref}}{p_{ref}^{\,n}} = \frac{7.20\times10^{-3}}{(6.00\times10^{6})^{0.350}}
= \mathbf{3.0548\times10^{-5}}\ \mathrm{m\,s^{-1}Pa^{-0.35}}$$

$$\frac{1}{1-n} = 1.53846,\qquad a\rho_pc^* = 3.0548\times10^{-5}\times1770\times1560 = 84.349,
\qquad \pi_K = \frac{\sigma_p}{1-n} = \mathbf{3.0769\times10^{-3}\ K^{-1}}$$

**The unit rule.** $a$ carries the units of $r$ divided by the units of $p$
**raised to $n$**. A conversion of the pressure unit must itself be raised to
$n$; applying the full decade is the single most common error in solid
internal ballistics and it is out by $10^{6(1-n)}$.

## (a) (3 points) — Internal ballistics

$$A_t = \frac{\pi}{4}(0.340)^2 = \mathbf{9.0792\times10^{-2}\ m^2},\qquad
K_n = \frac{A_b}{A_t} = \frac{28.30}{9.0792\times10^{-2}} = \mathbf{311.70}$$

$$p_c = (a\rho_pc^*K_n)^{\frac{1}{1-n}} = (84.349\times311.70)^{1.53846}
= (2.6291\times10^{4})^{1.53846} = \mathbf{6.3055\ MPa}$$

$$r = ap_c^{\,n} = 3.0548\times10^{-5}(6.3055\times10^{6})^{0.350}
= \mathbf{7.3262\ mm/s}$$

$$t_b = \frac{w_b}{r} = \frac{0.500}{7.3262\times10^{-3}} = \mathbf{68.25\ s}$$

$$V_p = A_bw_b = 28.30\times0.500 = 14.150\ \mathrm{m^3},\qquad
V_{case} = \pi R_c^2L_c = \pi(0.800)^2(8.00) = 16.085\ \mathrm{m^3}$$

$$\eta_V = \frac{14.150}{16.085} = \mathbf{0.8797},\qquad
m_p = \rho_pV_p = \mathbf{25\,046\ kg}$$

$$\dot m = \frac{p_cA_t}{c^*} = \frac{6.3055\times10^{6}\times9.0792\times10^{-2}}{1560}
= \mathbf{366.98\ kg/s}$$

**Closure:** $m_p/t_b = 25\,046/68.25 = 366.98$ kg/s ✓ — identical, because a
neutral grain burns at constant $\dot m$ by construction.

*Sanity:* 88 % volumetric loading and 6.3 MPa are exactly where flown
strap-ons sit; the P120C-class monolithic booster is the public architecture
this resembles.

> **Rubric (3).** 1 pt $a$ with the correct unit rule. 1 pt $K_n$, $p_c$, $r$,
> $t_b$. 1 pt $m_p$, $\eta_V$, $\dot m$ *and* the closure check (stating
> "they agree" without both numbers earns 0).

## (b) (3 points) — Delivered performance

At $\varepsilon = 11.0$, $\gamma = 1.15$, vacuum:

$$C_{F,vac} = \mathbf{1.7875},\qquad
F_{vac} = C_Fp_cA_t = \mathbf{1023.3\ kN}$$

$$I_{sp,vac} = \frac{c^*C_F}{g_0} = \frac{1560\times1.7875}{9.80665} = \mathbf{284.4\ s}$$

$$I_{tot} = Ft_b = 1023.3\times10^{3}\times68.25 = \mathbf{6.984\times10^{7}\ N\cdot s}$$

$$\rho_pI_{sp}g_0 = 1770\times284.4\times9.80665 = 4.936\times10^{6}\ \mathrm{N\,s/m^3}
= \mathbf{4936\ N\cdot s/L}$$

**Comparison.** Module 32's master table gives solids **4.8–5.0 k N·s/L**;
4936 sits inside it. LOX/RP-1 at a bulk density near 1030 kg/m³ and 300 s
vacuum gives ≈ 3.0 k N·s/L, and LOX/LH₂ ≈ 1.6 k. **A strap-on is a
volume-limited, not a mass-limited, problem** — it hangs off the side of a
core whose diameter is fixed — so buying 60 % more impulse per litre than
kerolox is worth giving up 50–150 s of $I_{sp}$ for.

> **Rubric (3).** 1 pt $C_F$ and $F$ (accept $C_F$ within 0.01 of 1.788).
> 1 pt $I_{sp}$ and $I_{tot}$. 1 pt impulse density *with* the comparison and
> the volume-limited argument. A comparison that ranks on $I_{sp}$ alone and
> concludes solids lose earns 0 for the third mark.

## (c) (4 points) — Case, mass fraction, material argument

**1. Pressure stack.**

$$k_T = e^{\pi_K\Delta T} = e^{3.0769\times10^{-3}\times30} = \mathbf{1.0967}$$

$$\mathrm{MEOP} = 6.3055\times1.0967\times1.06\times1.05\times1.03 = \mathbf{7.9275\ MPa}$$

$$p_b = j_b\,\mathrm{MEOP} = 1.50\times7.9275 = \mathbf{11.891\ MPa}$$

**2. Carbon/epoxy by netting theory.**

$$t_L = \frac{1.5p_bR}{\sigma_fV_f}
= \frac{1.5\times11.891\times10^{6}\times0.800}{2550\times10^{6}\times0.600}
= \mathbf{9.327\ mm}$$

$t/R = 0.01166 \ll 0.1$, so the thin-wall membrane assumption holds
comfortably.

$$m_{case} = 1.25\,(2\pi R_ct_LL_c\rho_{lam})
= 1.25\times2\pi(0.800)(9.327\times10^{-3})(8.00)(1580) = \mathbf{740.7\ kg}$$

**3. D6AC-class steel.**

$$t = \frac{p_bR}{F_{tu}} = \frac{11.891\times10^{6}\times0.800}{1500\times10^{6}}
= \mathbf{6.342\ mm},\qquad m_{case} = 1.25\times2\pi(0.800)(6.342\times10^{-3})(8.00)(7830)
= \mathbf{2496\ kg}$$

**4. Mass fraction, $\Delta v$ and $PV/W$.** Other hardware
$= 0.060\times25\,046 = 1503$ kg.

| | composite | steel |
|---|---|---|
| case mass | 740.7 kg | 2496 kg |
| total inert | 2243 kg | 3999 kg |
| $\zeta = m_p/(m_p+m_{inert})$ | **0.9178** | **0.8623** |
| motor-alone $\Delta v = I_{sp}g_0\ln(1/(1-\zeta))$ | **6967 m/s** | **5529 m/s** |
| $PV/W = p_bV_{case}/(m_{case}g_0)$ | **26.3 km** | **7.81 km** |

**Which number to show a programme manager.** Not $PV/W$ — it is a materials
index that flatters composites by ignoring domes, joints, bosses, skirts,
insulation and the fact that a composite case is not a membrane at the
polar openings. Show **$\Delta v$**, or the payload it buys: 5.5 points of
propellant mass fraction is **1438 m/s** on this motor, and that is a number
a manager can trade against schedule and against the cost of qualifying a new
case. $PV/W$ is how you *choose*; $\Delta v$ is how you *justify*.

> **Rubric (4).** 1 pt $k_T$, MEOP, $p_b$. 1 pt netting thickness, thin-wall
> check, composite mass. 1 pt steel case and both $\zeta$. 1 pt both $\Delta v$
> and the argument about which number to present. Using MEOP rather than $p_b$
> in the netting formula loses the second mark.

## (d) (3 points) — Throat erosion

**1.**

$$\dot s = 0.100\left(\frac{6.3055}{6.00}\right)^{0.8} = \mathbf{0.10405\ mm/s}$$

**2.** With $r_{t0} = 0.170$ m and $t = t_b = 68.25$ s:

$$X \equiv 1+\frac{\dot st}{r_{t0}} = 1+\frac{0.10405\times10^{-3}\times68.25}{0.170}
= \mathbf{1.04177}$$

$$\frac{A_t(t_b)}{A_t(0)} = X^2 = \mathbf{1.0853}\quad(+8.53\ \%)$$

$$\frac{p_c(t_b)}{p_c(0)} = X^{-2/(1-n)} = 1.04177^{-3.0769} = \mathbf{0.88169}
\;\Rightarrow\;p_c(t_b) = \mathbf{5.559\ MPa}$$

$$\frac{F(t_b)}{F(0)} = X^{-2n/(1-n)} = 1.04177^{-1.07692} = \mathbf{0.95689}
\;\Rightarrow\;F(t_b) = \mathbf{979.2\ kN}$$

**3.** The exit area is fixed, so

$$\varepsilon(t_b) = \frac{\varepsilon_0}{X^2} = \frac{11.0}{1.0853} = \mathbf{10.14}$$

$$C_{F,vac}(t_b) = \mathbf{1.7759}\;\Rightarrow\;
I_{sp,vac}(t_b) = \frac{1560\times1.7759}{9.80665} = \mathbf{282.5\ s},\qquad
\Delta I_{sp} = \mathbf{-1.85\ s}$$

**Which way the constant-$\dot s$ assumption errs.** $\dot s \propto p_c^{0.8}$
and $p_c$ *falls* as the throat opens, so the true erosion rate declines
through the burn. Holding $\dot s$ at its initial value therefore
**over-estimates** the throat growth, over-estimates the pressure decay and
over-estimates the thrust loss — it is conservative for performance and
non-conservative for nothing, which is why it is the standard first cut.

**Why thrust falls so much less than pressure, and impulse is conserved.**
$F = C_Fp_cA_t$, and $A_t$ grows by exactly the factor that $p_c$ falls to
the power $(1-n)/2$ — algebraically $F \propto p_c^{\,n/(1-n)\cdot(-1)}$
rather than $p_c^{-2/(1-n)}$, so the exponent is smaller by $1/n$. Physically:
the mass flow $\dot m = p_cA_t/c^*$ barely changes, because the propellant is
still burning at nearly the same rate over nearly the same area. The
**burn takes longer** ($r = ap_c^n$ falls with $p_c$), and total impulse
$I_{tot} = m_pI_{sp}g_0$ is nearly conserved because $m_p$ and $c^*$ are
fixed and only the small $C_F$ term moves. What is **not** conserved is the
thrust–time *shape*, and a launch trajectory is flown against a thrust
history, not against a total impulse — the vehicle arrives late, low and off
the nominal loft.

> **Rubric (3).** 1 pt $\dot s$ and $X$. 1 pt the three ratios and both
> absolute values. 1 pt the eroded $\varepsilon$/$C_F$/$I_{sp}$ **and** both
> arguments. Using $r_{t0} = D_{t0}$ instead of the radius is the classic
> error and costs the whole second mark.

## (e) (4 points) — The cold-conditioned firing

**1. Prediction for a $-30\ ^\circ$C soak** ($\Delta T = -51$ K from the
$+21\ ^\circ$C qualification datum):

$$k_T = e^{\pi_K\Delta T} = e^{-0.15692} = 0.85477
\;\Rightarrow\;p_{c,cold} = 6.3055\times0.85477 = \mathbf{5.3897\ MPa}$$

$$a_{cold} = a\,e^{\sigma_p\Delta T} = a\times0.90303
\;\Rightarrow\;r_{cold} = a_{cold}p_{c,cold}^{\,n} = \mathbf{6.2622\ mm/s}$$

$$t_{b,cold} = \frac{0.500}{6.2622\times10^{-3}} = \mathbf{79.84\ s}$$

**2. Against the record.**

$$\frac{p_{meas}}{p_{pred}} = \frac{5.95}{5.3897} = 1.1040\quad(+10.40\ \%),\qquad
\frac{t_{meas}}{t_{pred}} = \frac{72.3}{79.84} = 0.9056\quad(-9.44\ \%)$$

At fixed $a$, $A_t$ and $c^*$, $p_c \propto A_b^{1/(1-n)}$, so

$$\frac{A_b'}{A_b} = \left(\frac{p_{meas}}{p_{pred}}\right)^{1-n} = 1.1040^{0.65}
= \mathbf{1.0664}\quad(\mathbf{+6.64\ \%}),\qquad A_b' = 30.18\ \mathrm{m^2}$$

Consistency with the burn time: with the propellant *mass* fixed, adding
burning area shortens the effective web in the same proportion, so
$t_b \propto A_b^{-1/(1-n)}$ and

$$\frac{t_b'}{t_b} = 1.0664^{-1.53846} = 0.9058\quad\text{against the measured }0.9056\ \checkmark$$

Equivalently, reading the area back out of the burn time,
$(79.84/72.3)^{0.65} = 1.0666$ — the two independent channels agree to
0.02 %. **That agreement is the finding**: one physical change explains both
numbers.

**3. The invariant.** For any motor that burns all of its propellant through a
fixed throat,

$$\int p_c\,\mathrm{d}t = \int \frac{\dot mc^*}{A_t}\,\mathrm{d}t
= \frac{c^*}{A_t}\int\dot m\,\mathrm{d}t = \boxed{\frac{m_pc^*}{A_t}}$$

$$= \frac{25\,046\times1560}{9.0792\times10^{-2}} = \mathbf{4.303\times10^{8}\ Pa\cdot s}$$

It contains **no** $a$, no $n$, no $A_b$, no soak temperature and no burn
time. Measured: $5.95\times10^{6}\times72.3 = 4.302\times10^{8}$ Pa·s, within
0.03 %. So the propellant mass is right, the delivered $c^*$ is right and the
throat area is right — the anomaly is **entirely in the burning-area/burn-rate
product**, and the pressure and time excursions must cancel in the integral.
Any diagnosis that changes $m_p$, $c^*$ or $A_t$ is refuted by this line
alone.

**4. Diagnosis — and the trap.** Before naming a cause, notice that
**two of the four candidates are algebraically degenerate in this data set.**
Write the equilibrium relation as $p_c = (a_T\rho_pc^*K_n)^{1/(1-n)}$: a
temperature shift enters only through $a_T = a\,e^{\sigma_p\Delta T}$, and an
area change enters only through $K_n$. They multiply. Both then give

$$p_c \propto \lambda^{\frac{1}{1-n}},\qquad t_b \propto \lambda^{-\frac{1}{1-n}}$$

— for a temperature shift because the web is fixed and $r$ scales, and for an
area change because the propellant *mass* is fixed so the effective web
shortens as $1/\lambda$ while $r$ rises as $\lambda^{n/(1-n)}$. **The pressure
and the burn time cannot separate them, and neither can $\int p_c\,dt$, which
is invariant under both.**

Quantitatively, against the $+21\ ^\circ$C nominal,
$p_{meas}/p_{nom} = 5.95/6.3055 = 0.94360$, so
$\lambda = 0.94360^{\,0.65} = 0.96297$. Read as pure temperature,
$\Delta T = \ln(0.96297)/\sigma_p = -18.9$ K — **a grain actually at about
$+2\ ^\circ$C, not $-30\ ^\circ$C**. Read as a genuine $-30\ ^\circ$C soak,
the same $\lambda$ requires $A_b$ up by 6.64 % as computed in step 2. Both
reproduce 5.95 MPa and 72.3 s exactly.

**Diagnosis (one sentence).** *Either the grain was not at the recorded soak
temperature, or it cracked under cold-soak bore strain and gained about 6.6 %
of burning surface; the ballistic record alone cannot separate the two, and
the conditioning-chamber and grain-core temperature records must be pulled
before the anomaly is written up.*

If the conditioning record is confirmed good, the answer is the cracked
grain, and the module 34 failure class is **operations / environment** — the
hardware met its specification and the environment took the case-bonded grain
outside the bore-strain envelope it could accept. (A script that argues
**design margin** instead, on the grounds that a motor qualified to
$-30\ ^\circ$C should have carried margin on cold bore strain, is accepted
with the argument made.) If the conditioning record is bad, the class is
**instrumentation / operations**, and the corrective action is a
configuration-controlled soak verification, not anything to do with the
grain.

The **40 Hz feature** is what tips the balance toward cracking, and it is
corroborating rather than decisive: a fresh crack presents a compliant,
growing surface whose area is not steady while the crack tip runs and the
flanks open, and it disappears once the flanks burn back into a smooth
contour. A mis-recorded soak temperature produces no such transient. It is
**not** a chamber acoustic mode — the 1L mode of an 8 m grain at a
~1000 m/s sound speed sits near 60 Hz and would persist for the whole burn,
not for 8 s.

**Candidate elimination.**

| candidate | verdict | evidence |
|---|---|---|
| (i) out-of-family burn-rate lot | **out** | three earlier motors from the same lot fired nominal at $+21\ ^\circ$C and the strand data were nominal. Note that a high-$a$ lot is the *third* member of the degenerate family — it enters through $a_T$ exactly as temperature does — so it is killed by lot history, not by ballistics. That is precisely why lot traceability exists. |
| (ii) insulation-to-propellant debond | **out** | a debond exposes the grain's *outer* cylindrical surface along the case wall, which shows as a **step** in the trace at the moment the flame reaches it, not as a flat offset from ignition, and it drives case-wall and insulation temperatures up. The record is steady from 0.5 s and char depths are nominal. |
| (iii) erosive burning | **out** | erosive burning is a port-mass-flux effect concentrated at the aft end early in the burn: it produces a decaying **hump** in the first seconds and a head-to-aft pressure difference. Neither is present, and a flat +10 % for the whole burn is the wrong shape. |
| (iv) mis-recorded soak temperature | **cannot be ruled out from this record** | it reproduces both numbers exactly, as shown above. Only the conditioning-chamber thermocouple record, the grain-core thermocouple if fitted, and post-fire CT or dissection of the residual grain can separate it from cracking. |

> **Rubric (4).** 1 pt the cold prediction — both $p_c$ and $t_b$; using
> $\sigma_p$ where $\pi_K$ belongs, or vice versa, loses it. 1 pt the area
> ratio from the pressure **and** the independent check from the burn time.
> 1 pt the invariant $\int p_c\,dt = m_pc^*/A_t$, derived and evaluated.
> 1 pt the diagnosis, the failure class and the candidate table. **Full marks
> require recognising that (i), (iv) and the cracked grain are degenerate in
> the ballistics** and that the tie is broken by lot history, the conditioning
> record and the 40 Hz transient — a script that declares "cracked grain,
> certain" caps at 3 of 4 however good the arithmetic.
