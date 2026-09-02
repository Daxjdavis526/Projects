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

---

# Problem 3 — Cold gas against a monopropellant (15 points)

## (a) (3 points) — Cold-gas performance

$$R = \frac{8314.46}{28.014} = \mathbf{296.80\ J/(kg\,K)},\qquad
\Gamma(1.400) = \mathbf{0.68473}$$

$$c^* = \frac{\sqrt{RT_0}}{\Gamma} = \frac{\sqrt{296.80\times293.15}}{0.68473}
= \frac{294.98}{0.68473} = \mathbf{430.78\ m/s}$$

$$C_{F,vac}(\varepsilon = 50) = \mathbf{1.7292}
\;\Rightarrow\;I_{sp}^{ideal} = \frac{430.78\times1.7292}{9.80665} = \mathbf{75.96\ s}$$

$$I_{sp}^{real} = 0.90\times75.96 = \mathbf{68.36\ s}\qquad(c = 670.4\ \mathrm{m/s})$$

**Against the database.** Part C of the engine database gives N₂ at
$\varepsilon = 50$ an ideal $I_{sp}$ of **76.8 s** — but at $T_0 = 300$ K.
Since $I_{sp}\propto\sqrt{T_0}$ for a frozen ideal expansion,
$76.8\sqrt{293.15/300} = 75.9$ s. The two agree to 0.1 %; **the whole
difference is the reference temperature**, which is exactly why the database
insists that a published cold-gas $I_{sp}$ without $T_0$ and $\varepsilon$ is
meaningless. The 0.90 factor is the database's own C.1.3 realization
discount, drawn from the ~0.91 measured/theoretical ratio across the
published cold-gas table.

**What the two assumptions cost.** *Isothermal blowdown* assumes the tank wall
and structure supply the expansion work; a fast continuous discharge is
nearer adiabatic, which would leave more gas in the tank at the cut-off
pressure and reduce the usable fraction (adiabatic:
$1-(p_f/p_i)^{1/\gamma} = 0.855$ against 0.920). At a 5 % duty cycle over
years the metal-walled tank is firmly in the isothermal limit, so the
assumption is good here. *Ideal gas* at 250 bar is worth several per cent in
stored mass; real N₂ near 250 bar is less dense than the ideal-gas value, so
the true loaded mass is **lower** than computed and the volume needed is
**larger**. Both are the database's own C.1.2 caveat.

> **Rubric (3).** 1 pt $R$, $\Gamma$, $c^*$. 1 pt $C_F$, both $I_{sp}$.
> 1 pt the database reconciliation *with* the $\sqrt{T_0}$ scaling and one
> honest sentence on each assumption.

## (b) (3 points) — Impulse budget

**Desaturation.** A pure couple of separation $d = 0.450$ m: torque
$= Fd$, so the stored momentum $H = 0.800$ N·m·s costs
$Ft = H/d = 1.7778$ N·s **per thruster**, and both thrusters fire, so the
propellant impulse is

$$I_{des,1} = \frac{2H}{d} = \frac{2\times0.800}{0.450} = \mathbf{3.5556\ N\cdot s}$$

$$N = 3\times52\times5.00 = 780\ \text{events}
\;\Rightarrow\;I_{des} = 780\times3.5556 = \mathbf{2773\ N\cdot s}$$

**Drag make-up.**

$$m_p = m_f\left(e^{\Delta v/(I_{sp}g_0)}-1\right)
= 165\left(e^{14.0/670.4}-1\right) = 165\times0.021103 = \mathbf{3.482\ kg}$$

$$I_{drag} = 3.482\times670.4 = \mathbf{2334\ N\cdot s}$$

**Total.**

$$I_{tot} = 2773 + 2334 + 200 = \mathbf{5308\ N\cdot s}
\;\Rightarrow\;m_{prop,usable} = \frac{5308}{670.4} = \mathbf{7.917\ kg}$$

*Comment:* the desaturation and drag terms are within 20 % of each other,
which is typical and is why an ACS propellant budget cannot be written from
$\Delta v$ alone.

> **Rubric (3).** 1 pt the factor of 2 for the couple — an answer of
> 1387 N·s (one thruster) is the single most common error and loses this
> mark, though the rest of the chain is then marked on its own terms.
> 1 pt the drag term via the rocket equation. 1 pt the total and the usable
> mass.

## (c) (3 points) — Tank and thruster

$$\phi_{iso} = 1-\frac{p_f}{p_i} = 1-\frac{20.0}{250} = \mathbf{0.9200}
\;\Rightarrow\;m_{load} = \frac{7.917}{0.920} = \mathbf{8.606\ kg}$$

$$V = \frac{m_{load}RT}{p_i} = \frac{8.606\times296.80\times293.15}{250\times10^{5}}
= \mathbf{2.995\times10^{-2}\ m^3} = \mathbf{29.95\ L}$$

$$m_{tank} = \frac{p_iV}{(PV/W)g_0} = \frac{250\times10^{5}\times2.995\times10^{-2}}{25.0\times10^{3}\times9.80665}
= \mathbf{3.054\ kg}$$

**Thruster.** Sizing on the *ideal* $C_F$ gives the ideal thrust; to deliver
50.0 mN with the 0.90 realization the throat must be 11 % larger:

$$A_t^{ideal} = \frac{F}{p_{plenum}C_F} = \frac{0.0500}{5.00\times10^{5}\times1.7292}
= 5.783\times10^{-8}\ \mathrm{m^2}\;(D_t = 0.2714\ \mathrm{mm})$$

$$A_t^{delivered} = \frac{A_t^{ideal}}{0.90} = \mathbf{6.426\times10^{-8}\ m^2}
\;\Rightarrow\;D_t = \mathbf{0.2860\ mm},\qquad
\dot m = \frac{\Gamma p_0A_t}{\sqrt{RT_0}} = \mathbf{7.458\times10^{-5}\ kg/s}$$

$$I_{bit} = F\left(t_{on}-\tfrac{t_r}{2}+\tfrac{t_f}{2}\right)
= 0.0500(0.00500-0.00200+0.00150) = \mathbf{2.25\times10^{-4}\ N\cdot s}
= \mathbf{0.225\ mN\cdot s}$$

**Requirement met** — 0.225 mN·s against a 1 mN·s ceiling, with a factor of
4.4 in hand. Caveat worth a mark: with a 4.0 ms rise on a 5.0 ms command the
valve barely reaches full lift, so the trapezoid is a *model*, not a
measurement; the real minimum bit and its scatter must be measured on a
micro-thrust balance, and in this regime the scatter, not the mean, is what
the ACS designer cares about.

> **Rubric (3).** 1 pt $\phi$, $m_{load}$, $V$. 1 pt tank mass and both
> throat areas — the 1/0.90 correction is worth half of this mark. 1 pt the
> impulse bit, the verdict, and the caveat.

## (d) (3 points) — The monopropellant alternative

$$m_{drag} = 165\left(e^{14.0/(220\times9.80665)}-1\right) = \mathbf{1.074\ kg}$$

$$m_{des} = \frac{2773}{140\times9.80665} = \mathbf{2.020\ kg},\qquad
m_{det} = \frac{200}{1372.9} = \mathbf{0.146\ kg}$$

$$m_{prop} = \mathbf{3.240\ kg},\qquad
V = \frac{3.240}{1004}\times1.10 = \mathbf{3.550\ L}$$

**System-mass comparison** (the "everything else" column is the candidate's
own; these are defensible values and must be *stated*, not assumed silently):

| item | cold gas GN₂ | monopropellant N₂H₄ |
|---|---|---|
| propellant | 8.606 kg | 3.240 kg |
| tank | 3.054 kg (30 L COPV at 250 bar) | 1.40 kg (3.6 L Ti with a PMD, MEOP 24 bar) |
| regulator, latch valve, filter, transducers, lines | 1.50 kg | 1.00 kg |
| thrusters and valves | 0.80 kg (8 micro-solenoids) | 1.80 kg (4 thrusters with catalyst beds and heaters) |
| structure, brackets, harness | 1.20 kg | 1.20 kg |
| **dry** | **6.55 kg** | **5.40 kg** |
| **wet** | **15.16 kg** | **8.64 kg** |

**The monopropellant is 6.5 kg lighter — 43 % — on a 165 kg spacecraft.**
The cold-gas tank alone (3.05 kg for 30 litres of COPV) very nearly equals the
entire monopropellant propellant load, which is module 28's point restated:
*for a stored gas, the tank is the system*.

> **Rubric (3).** 1 pt the two-$I_{sp}$ split — using 220 s for the
> desaturation pulses is the trap and loses it. 1 pt propellant mass and
> volume. 1 pt a two-column table with stated, defended "everything else"
> numbers and a mass difference. A table with unstated assumptions caps at
> 2 of 3.

## (e) (3 points) — Leak budget and recommendation

$$m_{leak} = 0.020\times8.606 = 0.1721\ \mathrm{kg}\ \text{over}\ 5.00\ \mathrm{yr}
= 43\,800\ \mathrm{h}$$

$$\dot m_{leak} = \frac{0.1721}{43\,800} = 3.930\times10^{-6}\ \mathrm{kg/h}
= \mathbf{3.93\ mg/h}$$

$$\dot V_{std} = \frac{3.930\ \mathrm{mg/h}}{1.2504\times10^{-3}\ \mathrm{g/cm^3}}
= \mathbf{3.14\ scc/h\ GN_2}\ \text{(whole system)}$$

**Helium conversion, both limits.**

- **Molecular (Knudsen) flow**, rate $\propto 1/\sqrt{\mathcal{M}}$:
  $\dot V_{He} = 3.14\sqrt{28.014/4.003} = 3.14\times2.6455
  = \mathbf{8.31\ scc/h}$.
- **Viscous (laminar) flow**, rate $\propto 1/\mu$:
  $\dot V_{He} = 3.14\times(1.78/1.96) = \mathbf{2.85\ scc/h}$.

**Which goes in the procurement specification: 2.85 scc/h GHe.** You do not
know which regime a given leak path is in, and the two differ by a factor of
2.9 in opposite directions. Specifying the molecular number would pass a
viscous leak whose nitrogen rate is $8.31/0.908 = 9.15$ scc/h — nearly three
times the budget. **Always write the specification against the limit that
makes the acceptance test the hardest**, and say in the specification which
conversion was assumed, so a supplier cannot re-derive it the flattering way.

**Recommendation (≈190 words).**

> Fly the **cold-gas system**, and accept the 6.5 kg penalty.
>
> The criterion is **minimum impulse bit**, not mass. The ACS requires better
> than 1 mN·s; the cold-gas thruster delivers 0.225 mN·s and the hydrazine
> thruster 20 mN·s — a factor of 89. That is not a margin the ACS can trade
> against, because a 20 mN·s bit on this vehicle over-corrects the deadband
> and forces a limit cycle whose own propellant cost eats the mass saving,
> while leaving the residual-momentum trim uncontrollable at the required
> pointing. It is a requirement, not a preference, and it belongs in the
> screening step, not in a weighted score.
>
> Two supporting arguments. The payload is an imaging instrument: hydrazine
> exhaust deposits ammonia and decomposition products on cold optical
> surfaces, and 780 desaturation events over five years is a long
> contamination exposure. And 40 W of continuous catalyst-bed heater power on
> a 165 kg bus is a real power-budget line, whereas cold gas needs none.
>
> The counter-argument is honest: 30 litres of 250 bar COPV is a large,
> awkward, stored-energy item on an ESPA-class bus, and if the pointing
> requirement were relaxed to 20 mN·s the hydrazine system wins outright.

> **Rubric (3).** 1 pt mass, rate and the scc/h GN₂ figure. 1 pt both helium
> conversions **and** a reasoned choice between them. 1 pt a recommendation
> that names a non-mass criterion and defends it; a recommendation resting on
> mass contradicts the question and scores 0 for this mark.

---

# Problem 4 — Failure diagnosis (15 points)

## (a) (3 points) — Reduce the data

$$A_{t,meas} = \frac{\pi}{4}(0.2834)^2 = \mathbf{6.3080\times10^{-2}\ m^2},
\qquad \frac{A_{t,meas}}{A_{t,built}} = \frac{6.3080}{6.2699} = \mathbf{1.00607}$$

$$c^*_{meas} = \frac{p_cA_t}{\dot m} = \frac{101.2\times10^{5}\times6.3080\times10^{-2}}{374.8}
= \mathbf{1703.1\ m/s}$$

$$\eta_{c^*} = \frac{1703.1}{1742.5} = \mathbf{0.9774}\qquad(\text{design }0.960)$$

$$\varepsilon_{eff} = \frac{A_e}{A_{t,meas}} = \frac{16.0}{1.00607} = \mathbf{15.903}$$

$$C_{f,SL}^{ideal}(\varepsilon_{eff}, p_c = 101.2\ \mathrm{bar}) = \mathbf{1.6297}$$

$$C_{f,meas} = \frac{F}{p_cA_t} = \frac{1.008\times10^{6}}{101.2\times10^{5}\times6.3080\times10^{-2}}
= \mathbf{1.5790},\qquad \eta_{C_f} = \frac{1.5790}{1.6297} = \mathbf{0.9689}$$

$$I_{sp,SL} = \frac{F}{\dot mg_0} = \frac{1.008\times10^{6}}{374.8\times9.80665} = \mathbf{274.2\ s}$$

**The unexpected mover is $\eta_{c^*}$, and it moved *up*: 0.977 against a
design 0.960, +1.8 %.** $\eta_{C_f}$ is 0.969 against 0.980, down 1.1 %, which
is what a slightly enlarged throat and a slightly eroded contour do. An engine
that is *hurting itself* does not normally combust better. That single
inconsistency is the whole diagnosis: something has stopped diverting fuel
away from the core and put it into the flame.

> **Rubric (3).** 1 pt $A_t$ ratio and $c^*$/$\eta_{c^*}$. 1 pt
> $\varepsilon_{eff}$, both $C_f$, $\eta_{C_f}$, $I_{sp}$. 1 pt naming
> $\eta_{c^*}$ as the anomalous mover **and** saying which way it moved. A
> script that computes $\eta_{c^*}$ against the *as-built* throat area rather
> than the measured one gets 1691 m/s and loses half of the first mark.

## (b) (3 points) — Where the fuel went

The main injector's $C_dA$ is unchanged, so
$\dot m \propto \sqrt{\Delta p}$:

$$\frac{\dot m_{core,meas}}{\dot m_{core,design}} = \sqrt{\frac{22.4}{20.0}} = \mathbf{1.0583}$$

$$\dot m_{core,design} = 0.940\times111.89 = 105.17\ \mathrm{kg/s}
\;\Rightarrow\;\dot m_{core,meas} = 1.0583\times105.17 = \mathbf{111.30\ kg/s}$$

$$\dot m_{film} = 111.89-111.30 = 0.58\ \mathrm{kg/s}
\;\Rightarrow\;\text{film fraction} = \frac{0.58}{111.89} = \mathbf{0.52\ \%}$$

against a design 6.00 %. **Ninety-one per cent of the film-cooling flow has
stopped.** Note that the *total* fuel flow is nominal — the flow did not
disappear, it was re-routed into the core, which is exactly why $\eta_{c^*}$
rose.

> **Rubric (3).** 1 pt the $\sqrt{\Delta p}$ scaling with $C_dA$ held.
> 1 pt the core flow. 1 pt the film fraction to two decimals plus the
> observation that total fuel flow is conserved.

## (c) (3 points) — Heat load

$$Q_{meas} = \dot m_fc_p\Delta T_{bulk} = 111.89\times2100\times(441-300)
= \mathbf{33.13\ MW}$$

$$\frac{Q_{meas}}{Q_{pred}} = \frac{33.13}{25.0} = \mathbf{1.325}\quad(+32.5\ \%)$$

From Problem 1(d), removing **both** the film and the soot layer takes the
throat-local flux from 21.80 to 45.55 MW/m²:

$$\frac{q''_{no\ film,\ no\ soot}}{q''_{film+soot}} = \frac{45.55}{21.80} = \mathbf{2.089}$$

**Why the integrated number is much smaller, and why they are consistent.**
The 2.09× is a *point* ratio at the single hottest station. The jacket
integrates flux over the whole wetted surface — barrel, convergent, throat and
the divergent out to $\varepsilon = 16$ — and the film curtain is laid down at
the injector rim, so its protection is strongest in the barrel and has already
been largely consumed by mixing before the throat. Removing it therefore
multiplies the flux by ~2 over a small fraction of the area and by much less
over most of it. The post-test hardware confirms the geometry of the loss
directly: the barrel's *last* 150 mm and the convergent are bare and bright
(no film, no soot), while the upstream barrel still carries its deposit. A
33 % rise in the integrated load with a 2× rise at the throat is entirely
consistent, and the two together bracket the axial extent of the failure.

> **Rubric (3).** 1 pt $Q_{meas}$ and the ratio. 1 pt the throat-local ratio
> taken correctly from 1(d). 1 pt an explanation that distinguishes point flux
> from integrated load and uses the bare/dull boundary as evidence. Declaring
> the two ratios "inconsistent" and stopping loses the third mark.

## (d) (3 points) — Diagnosis

**Diagnosis (one sentence).** *The rim film-cooling manifold has partially
plugged — most plausibly by coke or by scale carried from the jacket outlet —
so 91 % of the film flow has been re-routed through the main injector, raising
combustion efficiency, stripping the protective soot and film layers from the
downstream barrel, convergent and throat, and driving the throat-local heat
flux and wall temperature past the liner's limit.*

| candidate | verdict | evidence |
|---|---|---|
| (i) over-size main injector orifices | **out** | over-size orifices give a **lower** $\Delta p$ at the same flow. The measured $\Delta p_f$ went **up** by 12 %, and the total fuel flow is nominal. This candidate has the sign of the injector evidence backwards. |
| (ii) coke inside the cooling channels | **out as the primary cause** | a channel deposit would reduce flow area (jacket $\Delta p$ up ✓) but **insulate** the coolant from the gas, so the coolant would absorb *less* heat and run *cooler*, not 35 K hotter. The 13 % jacket $\Delta p$ rise is fully explained by the density drop of a hotter coolant ($\Delta p\propto\dot m^2/\rho$: an 8 % density fall gives ~8 %, with the balance from surface roughening). Coke is a *consequence* here, not a cause — and it is the likely plugging agent in the rim manifold. |
| (iii) **loss of film cooling through the rim manifold** | **in** | it is the only candidate that explains all five independent observations with one mechanism: $\eta_{c^*}$ **up**, main-injector $\Delta p$ **up** by exactly the $\sqrt{1.06^2}$ the re-routed flow demands, integrated heat load **up 33 %**, the bare/bright downstream barrel and convergent, the blanched band and throat growth — and the under-size rim orifices with grey scale found on inspection. |
| (iv) combustion instability driving the wall | **out** | the dynamic-pressure record shows broadband only, with no discrete tone and no chug. A wall-driving transverse mode leaves a *circumferentially periodic* damage pattern (streaks at the mode's pressure antinodes); the observed damage is an axially banded, circumferentially uniform pattern, which is a film/boundary-layer signature, not an acoustic one. |

> **Rubric (3).** 1 pt a single-sentence diagnosis naming film-cooling loss.
> 2 pts for the four candidates, ½ pt each, awarded only when the *evidence*
> is cited rather than the conclusion asserted. Ruling out (ii) on the ground
> that "coke would make things hotter" earns nothing — the sign of the coolant
> temperature is the argument.

## (e) (3 points) — Class, causes, confirmation, corrective action

**Failure class (module 34):** **manufacturing / process escape.** The design
was correct and the operating environment was nominal; a manufacturing or
process condition — contamination carried into the rim manifold, or a
cleanliness escape in the jacket circuit that fed it — produced hardware that
did not match the drawing. It is *not* a design-margin failure: the design
margin was adequate for the design flow, and it is not operations/environment:
nothing about the test was off-nominal.

**Proximate cause:** partial blockage of the rim film-cooling orifices, which
removed the film and the soot layer from the downstream chamber and throat and
raised the local wall temperature past the liner limit.

**Root cause:** the process that allowed a blocking agent into the film
circuit and the absence of a verification that would have caught it — a
missing or inadequate **rim-circuit flow acceptance test** and filtration
specification at the jacket-to-manifold interface. Note the distinction: the
proximate cause is a fact about *this* engine; the root cause is a fact about
the *process*, and only the second one generalises.

**One confirming measurement or inspection:** a **cold-flow test of the rim
manifold alone** against its as-built acceptance curve — flow versus
$\Delta p$, orifice by orifice — before and after cleaning, plus analysis of
the grey scale to identify whether it is RP-1 coke (implicating jacket
temperature) or a metallic or oxide particulate (implicating cleanliness and
filtration). That single test distinguishes the two root-cause branches, which
demand different fixes.

**Corrective action the class demands — which is not the fix for this
engine.** Fixing *this* engine means cleaning or replacing the manifold. What
the **manufacturing/process-escape** class demands is different and larger:
find every article built under the same process, determine whether the escape
is present in them, and add a *verifiable* screen — a per-circuit flow
acceptance test with a recorded curve, a filtration specification with a
stated micron rating at the manifold inlet, and a jacket-outlet temperature
redline that prevents the coking that produces the scale in the first place.
A process escape that is answered only by repairing the affected article will
recur, because nothing has changed about how the next one is built.

> **Rubric (3).** 1 pt the class with a justification that rejects at least
> one other class. 1 pt proximate versus root stated as two different *kinds*
> of statement, plus the confirming test. 1 pt the corrective action
> distinguishing article repair from process fix. Naming the class without
> argument earns 0.

---

# Problem 5 — Cross-system selection for a lunar kick stage (15 points)

## (a) (4 points) — Sizing with a $k$-model inert mass

**Derivation (three lines).** Let $m_{pl}$ be the payload, $m_p$ the
propellant, and $m_{inert} = km_p + m_{fixed}$. Then

$$m_f = m_{pl}+m_{fixed}+km_p,\qquad m_0 = m_f+m_p = \mu m_f
\ \ \text{with}\ \ \mu = e^{\Delta v/(I_{sp}g_0)}$$

$$\Rightarrow\ m_p = (\mu-1)m_f = (\mu-1)\left(m_{pl}+m_{fixed}+km_p\right)
\ \Rightarrow\ m_p\left[1-k(\mu-1)\right] = (\mu-1)(m_{pl}+m_{fixed})$$

$$\boxed{\,m_p = \frac{(\mu-1)(m_{pl}+m_{fixed})}{1-k(\mu-1)}\,}$$

**At $\Delta v = 1750$ m/s, $m_{pl} = 450$ kg:**

| | $I_{sp}$ | $\mu$ | $k(\mu-1)$ | $m_p$ (kg) | $m_{inert}$ (kg) | stage wet (kg) | $\zeta$ |
|---|---|---|---|---|---|---|---|
| **A** solid | 293 | 1.8387 | 0.1006 | **433.6** | **67.0** | **500.7** | 0.8661 |
| **B** storable PF | 322 | 1.7405 | 0.1777 | **436.8** | **139.8** | **576.6** | 0.7575 |
| **C** monoprop | 228 | 2.1873 | 0.3562 | **876.0** | **287.8** | **1163.8** | 0.7527 |
| **D** methalox pump | 365 | 1.6305 | 0.1261 | **368.0** | **133.6** | **501.6** | 0.7336 |

**Note that B, C and D must also deliver REQ-2's 40 m/s with the same
engine**, so their honest sizing is at $\Delta v = 1790$ m/s:

| | $\mu$ | $m_p$ (kg) | $m_{inert}$ (kg) | stage wet (kg) |
|---|---|---|---|---|
| **B** | 1.7627 | 452.8 | 143.7 | **596.5** |
| **C** | 2.2268 | 922.1 | 301.6 | **1223.7** |
| **D** | 1.6489 | 380.3 | 136.1 | **516.3** |

**What $k(\mu-1)\ge 1$ means.** The denominator vanishes: adding propellant
adds inert mass faster than it adds $\Delta v$, so **no finite stage of that
architecture can meet the requirement**, at any size. It is not a "heavy"
answer, it is an infeasible one, and it is worth checking before sizing
anything. C is at 0.356–0.368 — closer to the wall than the others by a
factor of two, which is the arithmetic behind the intuition that a
low-$I_{sp}$ architecture is punished twice.

> **Rubric (4).** 2 pts the derivation, shown, in the requested three steps.
> 1 pt the 1750 m/s table. 1 pt the $k(\mu-1)$ column with the infeasibility
> statement. **Bonus consideration, not extra marks:** a script that notices
> B/C/D must also cover REQ-2 and re-sizes at 1790 m/s is doing the
> engineering; note it in the margin and credit it in (b).

## (b) (3 points) — Screening against the requirements

**Constraints first, scores later.** REQ-4 is a *hard* mass cap, so it is a
screen, not a criterion.

| | REQ-1 (Δv) | REQ-2 (≥4 midcourse burns) | REQ-3 (6-month coast) | REQ-4 (≤1100 kg) | REQ-5 (rideshare) | survives? |
|---|---|---|---|---|---|---|
| **A** solid | ✓ | ✗ alone — no restart, no throttle; needs a separate RCS | ✓ (storage is a solid's strength; thermal conditioning needed) | ✓ once the RCS is added | ⚠ energetic mass, hazard classification, transport | **yes, with an added RCS** |
| **B** storable PF | ✓ | ✓ unlimited restarts | ✓ 10–20 yr storable | ✓ 596.5 kg | ⚠ hypergol loading at the pad | **yes** |
| **C** monoprop | ✓ | ✓ | ✓ | **✗ 1224 kg > 1100 kg** | ⚠ toxic loading | **no — eliminated by REQ-4** |
| **D** methalox pump | ✓ | ✓ | ⚠ boil-off and no flight heritage for a 6-month cryogenic coast + restart | ✓ 516.3 kg | ✓ non-toxic, but cryogenic loading on a rideshare is hard | **yes, with the highest risk** |

**C is eliminated by REQ-4** — and it fails at 1750 m/s too (1164 kg), so the
elimination does not depend on how REQ-2 is allocated. Nothing else is
screened out; D's cryogenic-coast problem is *risk*, not a violated
requirement as written, and it must therefore be scored, not screened. Saying
so explicitly is part of the answer: the commonest systems-engineering error
is to quietly kill an option in the screen because you dislike it.

**Sizing A's RCS module** ($\Delta v = 40$ m/s, $I_{sp} = 220$ s, $k = 0.35$,
$m_{fixed} = 8$ kg, acting on 450 kg payload + 67.0 kg spent motor inert):

$$\mu = e^{40/(220\times9.80665)} = 1.018717$$

$$m_p = \frac{0.018717\times(517.0+8)}{1-0.35\times0.018717} = \frac{9.8264}{0.993449}
= \mathbf{9.89\ kg},\qquad m_{inert} = 0.35\times9.89+8 = \mathbf{11.46\ kg}$$

$$m_{RCS} = \mathbf{21.35\ kg}\;\Rightarrow\;
\text{A stage wet} = 500.7+21.4 = \mathbf{522.1\ kg}$$

*(Strictly the RCS is carried through the main burn and therefore belongs in
the motor's payload; iterating gives motor propellant 453.5 kg, motor inert
69.4 kg, total 544.3 kg. The question's simplification is stated and is worth
about 4 %; a script that performs and reports the iteration should be
credited, not penalised.)*

> **Rubric (3).** 1 pt a screen table that treats REQ-4 as a constraint and
> eliminates C on it. 1 pt for **not** screening D out on REQ-3, with the
> reason. 1 pt the RCS sizing and A's revised wet mass.

## (c) (5 points) — Pugh matrix, datum B

Survivors: **A**, **B** (datum), **D**. Scores on $-2\ldots+2$:

| criterion | $w$ | **A** | **B** | **D** | one-line justification |
|---|---|---|---|---|---|
| performance / mass margin vs REQ-4 | 25 | **+1** | 0 | **+1** | A 522 kg and D 516 kg against B's 597 kg — both leave ~575 kg of margin against B's 503 kg; the difference is real but not decisive |
| development and schedule risk | 25 | **+1** | 0 | **−2** | A is a re-scale of a well-understood class; B has a qualified lineage; D is a new cryogenic pump-fed engine *and* a 6-month cryogenic coast with no flight precedent |
| long-coast and restart (REQ-2, REQ-3) | 20 | **−2** | 0 | **−1** | A has zero restarts and no midcourse authority of its own; D restarts freely but must survive 6 months of boil-off and then chill down and light |
| recurring cost | 15 | **+1** | 0 | **−1** | solid motors are cheap in production; a pump-fed cryogenic stage is not |
| ground / range ops, rideshare (REQ-5) | 10 | **−1** | 0 | **0** | A is an energetic article with a hazard classification and transport constraints; D trades hypergol toxicity for cryogenic loading on a rideshare manifest — roughly a wash against the datum |
| single-point-failure count | 5 | **+1** | 0 | **−2** | A: an igniter and a case. D: turbomachinery, two propellant circuits, an ignition system and a chill-down sequence |

$$S_A = 25(+1)+25(+1)+20(-2)+15(+1)+10(-1)+5(+1) = \mathbf{+20}$$
$$S_B = \mathbf{0}\ \text{(datum)},\qquad
S_D = 25(+1)+25(-2)+20(-1)+15(-1)+10(0)+5(-2) = \mathbf{-70}$$

**Ranking: A > B > D.**

**Weight sweep.** Let $w$ be the risk weight and scale the other five by
$(100-w)/75$ so the weights still sum to 100. The non-risk sums are
$-5$ for A and $-20$ for D, so

$$S_A(w) = w - 5\frac{100-w}{75} = 1.0667w - 6.667,\qquad
S_D(w) = -2w - 20\frac{100-w}{75} = -1.7333w - 26.667$$

| $w$ | 10 | 20 | 25 | 30 | 40 |
|---|---|---|---|---|---|
| $S_A$ | +4.0 | +14.7 | +20.0 | +25.3 | +36.0 |
| $S_B$ | 0 | 0 | 0 | 0 | 0 |
| $S_D$ | −44.0 | −61.3 | −70.0 | −78.7 | −96.0 |

**The ranking A > B > D survives the entire 10–40 sweep.** The A/B crossover
is at $S_A = 0$, i.e. $w = 500/80 = \mathbf{6.25}$ — *outside* the swept range.
So the recommendation is not an artefact of the weighting: only if
development risk were weighted below ~6 out of 100 would B overtake A, and
nobody weights schedule risk that low on a programme that has to buy a stage.
D never comes within 40 points of the datum at any weight in range.

> **Rubric (5).** 2 pts a completed matrix with **every** score justified in
> one line (unjustified scores earn nothing, however plausible). 1 pt correct
> weighted totals. 2 pts the sweep done algebraically or tabulated at ≥4
> weights, with an explicit statement of whether the ranking survives and
> where the crossover is. A sweep that only reports "the answer did not
> change" without a number caps at 1 of those 2.

## (d) (3 points) — Recommendation (≈240 words)

> **Recommend architecture A: a monolithic composite-cased solid kick motor
> with a small hydrazine RCS module. Runner-up: B, the storable pressure-fed
> stage.**
>
> The deciding number is **stage wet mass at separation, 522 kg against a
> 1100 kg cap — 578 kg of margin**, obtained while also being the lowest
> development risk and the lowest recurring cost of the three survivors. A
> beats B by 74 kg with a simpler, cheaper article; D beats B on mass by a
> comparable margin but buys that with a new cryogenic engine and an
> unprecedented six-month cryogenic coast, and the Pugh sweep shows it never
> approaches the datum at any defensible weighting.
>
> A's weakness is real and must be stated: it has **no restart and no thrust
> authority after ignition**, so all midcourse capability, all abort
> retargeting and all injection-error correction live in the 21 kg RCS
> module. If the mission's injection dispersion turns out to demand more than
> the 40 m/s allocated, A degrades badly while B absorbs it for free.
>
> **The one thing to obtain this quarter:** the actual **injection-accuracy
> dispersion** of the GTO drop-off, as a 3σ $\Delta v$. If it exceeds roughly
> 80 m/s, A's fixed impulse and growing RCS stop being competitive and the
> recommendation flips to B.
>
> **If REQ-3 relaxed from 6 months to 6 days:** the case against D collapses —
> boil-off and long-coast chill-down were most of its risk score. At a 6-day
> coast D is the lightest option with the highest $I_{sp}$ and full restart
> capability, and I would recommend **D**, with B as the low-risk fallback.

> **Rubric (3).** 1 pt winner and runner-up with the deciding number stated
> as a *number*. 1 pt the named information item **and the direction it would
> push** — "more data would help" earns nothing. 1 pt the REQ-3 counterfactual
> with a reason tied to the score that changes. Over 250 words: cap at 2 of 3.

---

# Problem 6 — Short answer (10 × 2 = 20 points)

## 6.1 (2 points) — Separation on the Problem 2 motor at sea level

At $\gamma = 1.15$, $\varepsilon = 11.0$:
$M_e = \mathbf{3.1972}$, and

$$p_e = \frac{p_c}{\left(1+\frac{\gamma-1}{2}M_e^2\right)^{\gamma/(\gamma-1)}}
= \frac{6.3055\times10^{6}}{78.49} = \mathbf{8.033\times10^{4}\ Pa} = 0.803\ \mathrm{bar}$$

- **Summerfield:** separation when $p_e < 0.4p_a = \mathbf{4.053\times10^{4}}$ Pa.
- **Schmucker:** $p_{sep} = p_a(1.88M_e-1)^{-0.64}
  = 101\,325\times(5.0108)^{-0.64} = \mathbf{3.612\times10^{4}}$ Pa.

$p_e = 80.3$ kPa exceeds both by a factor of ~2, so **the nozzle flows full**
at sea level with a large margin — as it must, since a strap-on ignites at
sea level and $\varepsilon = 11$ was chosen for exactly that. **Summerfield is
the conservative criterion here**: it predicts separation at the higher wall
pressure, i.e. sooner. The two disagree by
$(40\,530-36\,123)/36\,123 = \mathbf{12.2\ \%}$ in separation pressure, which
is the honest size of the disagreement in this literature and why a design
that depends on the difference is a design in trouble.

> **Rubric.** 1 pt $M_e$ and $p_e$. 1 pt both criteria, the verdict, which is
> conservative, and the percentage.

## 6.2 (2 points) — Frozen and equilibrium

**Equilibrium (shifting) bounds the delivered $I_{sp}$ from above; frozen
bounds it from below.** Equilibrium lets recombination reactions
($\mathrm{H+OH\to H_2O}$, $\mathrm{CO+\tfrac12O_2\to CO_2}$) release their
energy as the gas cools through the nozzle, converting chemical energy back
into directed kinetic energy; frozen forbids it entirely and carries the
dissociation energy out of the nozzle. The real nozzle sits between, because
recombination is finite-rate: fast near the throat where density is high,
effectively quenched in the far divergent where it is low.

**Gap sizes.** LOX/LH₂ ≈ **3–5 %** (10–20 s at 450 s) — a highly dissociated,
low-molar-mass exhaust with much to recombine. A metallised solid ≈
**1–2 %**, and it sits **nearer the frozen limit**, because a large fraction
of the exhaust enthalpy is carried by condensed Al₂O₃ particles. Those
particles do not chemically recombine, they lag the gas in both velocity and
temperature, and they set the two-phase flow loss instead — the same physical
feature that puts a solid near frozen also costs it 1–3 % in $I_{sp}$ on its
own account.

> **Rubric.** 1 pt the two bounds with the recombination mechanism. 1 pt both
> gap sizes and the condensed-phase argument. Reversing the bounds is a fatal
> error and scores 0.

## 6.3 (2 points) — The RP-1 coking limit

**Mechanism.** Above roughly **560–600 K wall temperature**, RP-1 in the
boundary layer of the channel pyrolyses and the heavy aromatics polymerise on
the hot surface, laying down a carbonaceous deposit. It is a *wall
temperature* phenomenon, not a bulk temperature phenomenon: the bulk can be
400 K while the film next to the wall is coking.

**Two things go wrong once a deposit forms, and they compound.** (1) The
deposit is a thermal resistance in series on the coolant side, so the wall
runs hotter for the same flux, which accelerates further deposition —
positive feedback. (2) It reduces the channel flow area and roughens it, so
the jacket pressure drop rises, which the pump must pay for, and the flow
distribution between channels drifts.

**Why it caps chamber pressure.** Gas-side flux scales as
$q''\propto p_c^{0.8}$ (Bartz), so the coolant-side wall temperature required
to reject it rises with $p_c$ while the coking limit does not move. The wall
therefore hits the coking limit long before the copper hits its strength or
creep limit — **the chemistry of the coolant, not the metallurgy of the wall,
is what caps $p_c$ for RP-1 regenerative cooling.** The **F-1** is the direct
consequence: ~70 bar (`inj`, contested — the database flags 1,015 psia as low
confidence), 178 brazed tubes, *and* a gas-generator film curtain over the
extension. The alternatives a modern programme takes are to burn methane,
which does not coke in this range, or to accept film cooling and its
$I_{sp}$ penalty.

> **Rubric.** 1 pt mechanism plus the temperature. 1 pt the two consequences
> and the $p_c$-cap argument with an engine named. An answer that says
> "RP-1 cannot cool a hot engine" without the wall-temperature number and the
> $p_c^{0.8}$ scaling caps at 1.

## 6.4 (2 points) — Fuel lead or oxidiser lead

**LOX/LH₂: fuel (hydrogen) lead.** Hydrogen has a very wide flammability
range and a very low minimum ignition energy, so a hydrogen-rich start lights
reliably and burns at a mixture ratio far off the wall-destroying optimum.
More importantly, a hydrogen lead guarantees the chamber and injector face
never see a LOX-rich environment while hot, which would attack a copper liner
and any organic seal. The cost is a brief unburnt-hydrogen accumulation, which
is why the sequence is purge → chilldown → igniter-verified → fuel lead →
main ox valve.

**LOX/RP-1: oxidiser lead is common, and is the right choice for a
hypergolically-started kerolox engine.** Kerosene is hard to ignite, and a
fuel-lead start pools liquid RP-1 in the chamber that then detonates when the
oxidiser arrives — the classic hard start. Leading the oxidiser means the
TEA-TEB slug or the torch meets an oxidising environment and lights
immediately, and any accumulation is of the *less* energetic constituent.
A kerolox chamber's copper is protected by the fuel film, not by the lead
order, so the wall argument that decides the hydrogen case does not bind here.

**The weakest assumption in the constant-volume hard-start calculation** is
that the accumulated propellant is **fully mixed at a burnable mixture ratio
and burns instantaneously at constant volume**. It is not: real accumulations
are stratified pools and films, only part of the mass participates, and the
burn takes long enough that the throat vents a significant fraction. The
calculation therefore *over*-predicts peak pressure, often by a large factor —
which is comfortable, until someone uses the same model to justify a longer
permissible ignition delay.

> **Rubric.** ½ pt each for the two leads *with* a reason, ½ pt for the
> wall/accumulation argument being different in the two cases, ½ pt for the
> assumption with its direction of error.

## 6.5 (2 points) — Water hammer in a LOX line

$$\Delta p_J = \rho a\Delta v = 1140\times1100\times8.00
= \mathbf{1.003\times10^{7}\ Pa} = \mathbf{100.3\ bar}$$

$$T_{pipe} = \frac{2L}{a} = \frac{2\times4.50}{1100} = \mathbf{8.18\ ms}$$

The closure takes 40 ms $> T_{pipe}$, so it is a **slow (gradual) closure**:
the reflected expansion wave returns to the valve before it is shut and
relieves part of the rise. To first order the surge developed is

$$\Delta p \approx \Delta p_J\frac{T_{pipe}}{t_c} = 100.3\times\frac{8.18}{40}
= \mathbf{20.5\ bar}$$

**What you would still check in a cryogenic line.** **Column separation.** If
the transient drops the local pressure to the propellant's vapour pressure —
which is close to the operating pressure for a saturated cryogen, unlike an
ambient hydraulic fluid — the liquid column tears and a vapour cavity forms.
Its collapse on the rebound produces a *second* peak that can exceed the
Joukowsky value, and the two-phase content changes the wave speed itself, so
the linear estimate above stops applying at exactly the moment it matters.

> **Rubric.** 1 pt both numbers with the classification. 1 pt the slow-closure
> estimate and column separation named with its mechanism. Answering "cavitation"
> without saying that the collapse can exceed the Joukowsky peak earns half.

## 6.6 (2 points) — Chamber acoustics

$$f_{1T} = \frac{\alpha_{1,1}c}{\pi D_c} = \frac{1.8412\times1150}{\pi\times0.39958}
= \mathbf{1687\ Hz}$$

**Who sees it.** A **flush-mounted, close-coupled high-frequency pressure
transducer** (piezoelectric or piezoresistive) on the chamber wall sees it,
and so does a chamber-mounted accelerometer at the same frequency. A
transducer on a **sense line** does not: the line's own quarter-wave or
Helmholtz resonance and its viscous attenuation sit far below 1.7 kHz, and the
line acts as a low-pass filter that both destroys the amplitude and adds phase
— which is why "we saw no instability" from a sense-line channel is not
evidence of anything.

**Digitisation.** Sample at **≥ 20 kHz** (≥ 10× the mode, not the Nyquist
minimum of 3.4 kHz — you need waveform shape and the harmonics, not just the
frequency), with an **anti-alias corner near 8–10 kHz** and at least 60 dB of
attenuation by the Nyquist frequency. State the filter's phase lag at 1.7 kHz
when you correlate this channel against another; a low-pass filter that is
flat in amplitude at 1.7 kHz is not flat in phase.

> **Rubric.** 1 pt the frequency. 1 pt sense-line versus flush-mounted, plus
> sample rate and anti-alias corner with a justification beyond Nyquist.

## 6.7 (2 points) — Uncertainty budget

$$I_{sp} = \frac{F}{\dot mg_0}\;\Rightarrow\;
\frac{\partial I_{sp}}{\partial F} = \frac{1}{\dot mg_0} = \frac{I_{sp}}{F},
\qquad
\frac{\partial I_{sp}}{\partial \dot m} = -\frac{F}{\dot m^2g_0} = -\frac{I_{sp}}{\dot m}$$

Both sensitivities are unity in *relative* terms, so

$$\frac{u_{I_{sp}}}{I_{sp}} = \sqrt{\left(\frac{u_F}{F}\right)^2+\left(\frac{u_{\dot m}}{\dot m}\right)^2}
= \sqrt{0.30^2+0.25^2} = \mathbf{0.3905\ \%}$$

$$u_{I_{sp}} = 0.003905\times272.1 = \mathbf{\pm1.06\ s}\ (1\sigma)$$

**Why averaging helps only part of it.** Averaging $n$ samples of a stationary
steady segment reduces the **random (precision)** component as $1/\sqrt n$ —
electrical noise, turbulence-driven fluctuation, quantisation. It does
**nothing** to the **systematic (bias)** component — calibration error of the
load cell, flowmeter calibration on a different fluid, thermal zero shift,
thrust-stand tare and tie-down restraint. Quoting "±0.30 % on thrust" without
splitting it into the two is the reason two organisations can report the same
engine's $I_{sp}$ 1.5 % apart with neither making an arithmetic error.

> **Rubric.** 1 pt the two derivatives and the RSS in per cent. 1 pt the value
> in seconds and the random/systematic split. An answer that says averaging
> reduces "the uncertainty" without the split caps at 1.

## 6.8 (2 points) — Insulation

- **Char rate** $\dot c$: the speed at which the pyrolysis front advances into
  virgin elastomer, converting it to char. It measures material *decomposition*.
- **Erosion rate** $\dot e$: the speed at which the char layer is mechanically
  and chemically removed by the gas — shear from the local mass flux and
  particle impingement from the condensed Al₂O₃.
- **Surface recession rate** $\dot s$: the net motion of the exposed surface,
  the sum of what the gas takes away. Char and erosion are *not* additive in
  general: the char layer that erosion removes is the same layer that
  insulates and slows charring.

**Sizing uses the char rate**, plus a residual-virgin-layer requirement and a
safety factor — because what matters is that the **bond line never sees
pyrolysis**, not that some thickness of char survives. A design that sizes on
recession alone can end the burn with a fully charred, structurally worthless
wall that has technically not receded.

**Why exposure time is a function of station.** A station is only exposed once
the grain has burned back past it. Under a case-bonded internal-burning grain
the aft end is exposed almost from ignition, while a station under a thick web
is not exposed until late in the burn — and the local mass flux and particle
loading also grow toward the aft end. **In the Problem 2 motor the aft end,
just upstream of the nozzle entry, sizes the insulation**: it has the longest
exposure, the highest mass flux and the heaviest particle impingement, and it
is where the taper must be thickest.

> **Rubric.** 1 pt the three definitions distinguished, with which one sizes.
> 1 pt the exposure-time argument and the correct station named.

## 6.9 (2 points) — Reading a published solid-motor figure

**Four tags required before that figure is usable:**

1. **`/motor` or `/vehicle`** — one motor, or all of them summed.
2. **`SL` or `vac`** — sea level or vacuum.
3. **`max` or `avg`** — peak or burn-averaged.
4. **the $p_c$ station or, for $I_{sp}$, the $\varepsilon$ and whether the
   figure is delivered or theoretical** — and, always, the confidence label
   and source.

**The factor-of-two arithmetic.** Suppose the 14.2 MN is per *vehicle* with
two boosters. Total impulse per motor is then
$\tfrac12\times14.2\times10^{6}\times128 = 9.09\times10^{8}$ N·s, and

$$m_p = \frac{I_{tot}}{I_{sp}g_0} = \frac{9.09\times10^{8}}{286\times9.80665}
= 3.24\times10^{5}\ \mathrm{kg}$$

Read as per-motor it is $6.49\times10^{5}$ kg — **exactly twice**, and a
booster sized on the wrong one is either half a vehicle or twice a factory.
(The database's `max`/`avg` warning bites the same way: the LVM3 S200 has
max/avg = 1.44, so a "thrust" used as an average when it is a peak
over-states total impulse by 44 %.)

**Case-material progression.** Steel → glass filament wound → Kevlar/epoxy →
carbon/epoxy bought roughly **six to ten points of propellant mass fraction**
end to end, each step raising $PV/W$ and so shrinking the case mass at fixed
burst pressure; on a kick stage that is hundreds of metres per second of
$\Delta v$. **Segmented steel persisted anyway** because the binding
constraints were not materials constraints: a 3.7 m, 500 t motor cannot be
cast in one piece at an inland plant and shipped by rail, steel is
inspectable, repairable and re-usable in a way a wound composite is not, and
the field-joint architecture that segmentation forces was — until 1986 —
believed to be a solved problem.

> **Rubric.** 1 pt all four tags. 1 pt the arithmetic shown *with a number*,
> plus the progression and at least one non-materials reason for segmentation.

## 6.10 (2 points) — Believing the CFD or believing Bartz

**Believe the CFD when:**
1. It has passed a **grid-convergence study** with a computed observed order
   of accuracy and a Richardson-extrapolated value, not three runs that
   "look converged".
2. It has been **validated on a calorimeter chamber of similar propellant,
   $p_c$ and contour**, with the comparison published, not merely verified
   against an analytical solution.
3. There is a **physical reason Bartz should fail here** — a soot or film
   layer, strong curvature, a non-attached boundary layer, a coolant-side
   coupling — and the CFD resolves the mechanism that Bartz's flat-plate pipe
   analogy cannot represent.

**Believe Bartz when:**
1. The CFD used a **wall function** on a mesh whose $y^+$ is outside that
   function's validity, or an unresolved near-wall layer.
2. Its **combustion model** is a flamelet/FGM formulation in a chamber that
   violates the fast-chemistry, thin-flame assumption — near the injector,
   or with a supercritical LOX jet.
3. It reports a **single deterministic number with no uncertainty**, and the
   35 % discrepancy is comfortably inside Bartz's own ±20–30 % *and* inside
   the propagated uncertainty of the CFD's own boundary conditions.

**On the NASA-STD-7009 ladder** the result as delivered is **verified at
best** — the code solves the equations it claims to solve. It becomes
**validated** only against experimental data from a relevantly similar
configuration with a stated comparison metric and uncertainty, and
**qualified** only when that validation covers the specific application domain
and is accepted for the decision being made. To move it one rung, you need a
**calorimeter-chamber hot fire** at this $p_c$ and contour with measured
segment heat fluxes, and a documented validation comparison — not more mesh.

> **Rubric.** 1 pt three-and-three, each a specific technical condition rather
> than "it looks right". 1 pt the correct rung with the reason and the named
> action that moves it. "Trust the CFD, it is newer" scores 0.

---

# Common wrong answers

These are the mistakes this paper is built to catch. Each one reveals
something.

1. **Assuming the wall temperature and reporting the flux that follows
   (1d).** $T_{wg}$ is an *output* of the resistance chain, not an input. A
   script that reports 61 MW/m² and moves on has learned Bartz as a formula
   rather than as one resistance in series with two others, and would sign off
   a chamber that cannot be cooled.
2. **Halving or doubling the couple (3b).** Computing $H/d$ instead of $2H/d$
   halves the desaturation budget and therefore the tank. The error reveals a
   habit of reaching for a formula before drawing the free body.
3. **Using one $I_{sp}$ for a monopropellant (3d).** Hydrazine's pulse-mode
   $I_{sp}$ is far below its steady value because the catalyst bed and the
   chamber are re-heated on every pulse. Using 220 s throughout under-sizes the
   propellant by 40 % and makes the wrong architecture look better.
4. **Reading $\eta_{c^*}$ up as good news (4a).** The efficiency moving in the
   *unexpected* direction is the diagnosis. A script that notes 0.977 > 0.960
   and congratulates the injector has stopped reading the data as a system.
5. **Ruling out coke in the channels because "coke makes things hotter"
   (4d).** It makes the *wall* hotter and the *coolant* cooler. Getting the
   sign of a thermal-resistance argument wrong is the commonest analysis error
   in cooling problems.
6. **Declaring the cracked grain certain (2e).** Temperature, burn-rate lot and
   burning area are degenerate in $p_c$ and $t_b$, and $\int p_c\,dt$ is
   invariant under all three. Certainty here is not confidence, it is a
   failure to check whether the data can support the claim — which is exactly
   the investigation pathology module 34 exists to teach.
7. **Using $r_{t0} = D_{t0}$ in the erosion formula (2d).** A factor of two in
   the erosion parameter. Always ask what the symbol is before using the
   number next to it.
8. **Scoring a hard constraint in the Pugh matrix (5b, 5c).** REQ-4 is a cap.
   An option that violates it does not get a $-2$; it gets eliminated. Mixing
   constraints into a weighted sum lets a high score on something else buy back
   an infeasible design — the single most damaging systems-engineering habit
   this course tries to break.
9. **Quoting a company claim as fact.** Merlin's 97 bar, Raptor's 300 bar and
   the F-1's 1,015 psia are all flagged in the engine database. Using them is
   fine; using them without the tag is not, and it costs marks in 1(a), 1(d)
   and 6.3.
10. **Applying a pressure-unit conversion without raising it to $n$ (2a).**
    $a$'s units are $r/p^n$. This error is out by $10^{6(1-n)}$ and produces a
    motor that never lights.
11. **Reporting a cycle penalty as a percentage of flow rather than in seconds
    (1f).** The vehicle pays in $I_{sp}$. A trade study denominated in the
    wrong currency cannot be compared with anything.
12. **Answering "more data would help" (5d).** Name the measurement, say which
    way it would push the answer, and say what threshold flips it. Anything
    else is not a recommendation.
