# Module 13 — Engine Cycles — Answer Key

Constants: $g_0 = 9.80665$ m/s², $R_u = 8314.46$ J/(kmol·K).
Every number below is reproduced by `tools/examples/13.py` and recomputed by
`python3 tools/check_examples.py`. Real-engine figures come from
`reference/engine-database.md` and `reference/_verify-liquid.md`, with their
caveats carried; where a figure is a company claim it is said so, and where a
source does not publish a quantity the answer says "not published" rather than
inventing one.

The cycle equation used throughout is Eq. 3.3:

$$\eta_t\,\dot m_t\,c_p\,T_t\left[1-\pi_t^{-\frac{\gamma_t-1}{\gamma_t}}\right] \;=\; \frac{1}{\eta_m}\sum_j \frac{\dot m_{p,j}\,\Delta p_{p,j}}{\rho_j\,\eta_{p,j}}$$

---

## K1. Problem solutions

### Conceptual

**C1.** **No — it is still an open cycle**, and the distinction is where the
turbine exhaust joins the flow relative to the **throat**.

*What does not change.* The turbine still exhausts to a low pressure. At
$\varepsilon = 6$ the wall static pressure for $p_c = 100$ bar and
$\gamma \approx 1.2$ is of order 0.4–0.6 bar, so $\pi_t$ is still 100–200 if the
turbine inlet is at 60 bar — i.e. large, exactly as before. The power balance
(Eq. 3.3) is untouched, the drive flow $\dot m_t$ is untouched, and $f_{gg}$ is
untouched. The drive gas is still burned in its own combustor at its own
mixture ratio, still never sees the main injector, and still does not pass
through the throat, so it contributes nothing to $c^*$ and nothing to the main
chamber's expansion.

*What does change.* The dumped mass now expands from $\varepsilon = 6$ to the
nozzle exit instead of through a small dump nozzle, so its own $I_{sp}$ rises
from perhaps 100–150 s to 200–250 s. In WE1's arithmetic that moves the cycle
penalty from 8.7 s (no credit) toward 3–4 s. It also becomes a **film-cooling
curtain** for the divergent section, which is precisely what the F-1 did — the
dark outer sheath in the Saturn V photographs — and it let the F-1's nozzle
extension be built with no regenerative circuit at all [_verify-liquid].

*The two traps.* (i) **Thrust bookkeeping.** Turbine exhaust thrust is real and
measurable, and a quoted engine thrust may or may not include it: the Redstone
A-7's "78,000 lbf" is a 75,000 lbf nameplate plus roughly 3,000 lbf of
steam-generator exhaust [_verify-liquid §8]. (ii) **Back-pressure direction.**
At sea level, dumping into the divergent section at $\varepsilon = 6$ actually
*lowers* the turbine back pressure below ambient and helps; in vacuum, where a
plain overboard dump sees zero back pressure, it *raises* it and costs a little
turbine work. The trade is not one-signed across the trajectory.

**C2.** Take the bracket $\left[1-\pi_t^{-(\gamma_t-1)/\gamma_t}\right]$, with
$\kappa = (\gamma_t-1)/\gamma_t$.

- **Open (WE1):** the turbine exhausts to ~3 bar, so $\pi_t = 20$ and, at
  $\gamma_t = 1.25$ ($\kappa = 0.20$), the bracket is $1-20^{-0.20} = 0.451$.
- **Closed (WE3):** the turbine exhausts into the main injector at
  $p_c + \Delta p_{inj}$, so $\pi_t$ is a *ratio of two large and nearly equal
  numbers* — preburner pressure over injector-face pressure — and comes out at
  1.38. At $\gamma_t = 1.362$ ($\kappa = 0.266$) the bracket is
  $1-1.38^{-0.266} = 0.0805$.

The ratio is $0.451/0.0805 = 5.6$: **a factor of about five and a half in
specific work per kilogram of drive gas, not fifteen.** The factor of fifteen
in the question is the ratio of the *pressure ratios themselves*
($20/1.38 = 14.5$), and confusing those two is the point of the question —
credit an answer that catches it.

**The two factors on the left-hand side that must increase** are $\dot m_t$ and
$c_p T_t$:

| | GG (WE1) | FRSC (WE3) | ratio |
|---|---|---|---|
| $\dot m_t$ | 5.45 kg/s | 138.9 kg/s | ×25.5 |
| $c_p T_t$ | 2.10 MJ/kg | 8.15 MJ/kg | ×3.9 |
| bracket | 0.451 | 0.0805 | ÷5.6 |
| $\eta_t$ | 0.65 | 0.78 | ×1.2 |

The drive flow does the heavy lifting, and the closed cycle can afford it only
because the mass is not thrown away. $\eta_t$ is a genuine but third-order
help: a low-$\pi_t$ turbine has a low isentropic spouting velocity, so
$U/C_0$ near the 0.45 optimum is reachable at ordinary blade speeds, which is
why closed-cycle turbines run 0.75–0.85 and gas-generator turbines 0.55–0.70.

**C3.** Four reasons, and the first is decisive.

1. **You do not need the mass flow, so you have no reason to pay for it.** The
   reason ORSC goes oxidizer-rich is that on kerolox oxygen is ~72 % of the
   mass and, at $\pi_t \approx 1.5$, you need every kilogram you can get. An
   open cycle at $\pi_t = 20$ needs only 2–5 % of the total flow. The entire
   motivation for oxidizer-rich operation evaporates.
2. **Fuel-rich gas is a better working fluid.** Specific work goes as
   $c_p T_t$; a fuel-rich kerolox gas gives $c_p \approx 2{,}100$ J/(kg·K) and a
   hydrogen-rich gas 8,000+, against ~1,100 J/(kg·K) for oxygen-rich gas.
   Choosing ox-rich in an open cycle would *increase* the drive flow and hence
   the $I_{sp}$ penalty.
3. **The materials bill is the whole ORSC development programme.** Hot
   oxygen-rich gas ignites nickel and iron alloys; the answer is the inert
   passivating enamel on every wetted surface plus an oxygen-cleanliness
   discipline that is a manufacturing culture, not a coating spec
   [_verify-liquid]. Paying that bill to buy nothing is indefensible, and the
   open cycle exists because it is cheap.
4. **The exhaust plume.** A few per cent of the total flow dumped overboard as
   hot oxygen-rich gas, next to a vehicle base full of fuel lines, is a hazard
   a fuel-rich dump is not.

The standing exception to the whole discussion is the **monopropellant steam
gas generator** — hydrogen peroxide over a permanganate catalyst — which is
neither fuel-rich nor oxidizer-rich and sidesteps the temperature problem
entirely at the cost of a third fluid: V-2, Redstone A-7, and the RD-107A/108A
still flying on Soyuz [_verify-liquid].

**C4.** **BE-3PM is a tap-off engine; BE-3U is an expander bleed engine**
[_verify-liquid §19]. Blue Origin changed the power cycle for the vacuum
variant; the shared designation is a marketing artefact and the single most
common error in the secondary literature.

*What physically differs.* The **source of the turbine drive gas**.

- Tap-off (BE-3PM): the drive gas is **combustion gas bled from the main
  chamber** near the wall, at 1,000–1,300 K, at whatever the near-wall boundary
  layer happens to be doing, at main-chamber mixture ratio. There is no
  separate combustor of any kind.
- Expander bleed (BE-3U): the drive gas is **a portion of the fuel heated in
  the cooling jacket**, at a few hundred kelvin, at whatever mixture ratio you
  like, because it is pure hydrogen. There is no combustion in the drive
  circuit at all.

Both dump overboard, so both are open and both carry a small $I_{sp}$ penalty.

*Consequence for maximum thrust.* Neither has a hard power ceiling, and an
answer that claims one does should not get full credit. The real difference:

- The bleed's power is limited by **available wall heat**, which scales as
  $p_c^{0.8}D_t^{1.8}$ — but since $\pi_t$ is free (5–10, not 1.4), a few per
  cent of the fuel is enough, and the ceiling is far away. **The LE-9 makes
  1,471 kN on this cycle**, more than eight times the largest closed expander
  ever flown [_verify-liquid].
- The tap-off's power is limited by nothing thermodynamic — chamber gas is hot
  and $\pi_t$ is large — but by **controllability**: the tap temperature is set
  by three-dimensional mixing between a cool wall layer and 3,300–3,600 K core
  gas, which is hard to predict and *harder to scale*, and it feeds a direct
  positive-feedback path from chamber to pumps with no independent control
  element in between.

The honest summary: the bleed scales because its physics is a heat exchanger
you can design; the tap-off scales badly because its physics is a mixing
problem you can only test. Note also that BE-3PM's chamber pressure, $I_{sp}$,
$\varepsilon$ and dry mass are **not published**, and BE-3U's thrust appears
variously as 711.5 / 889.5 / 941.5 kN — quote ~710 kN as the design point and
note the uprate history [_verify-liquid].

**C5.** Ordered by how fast each one kills the design:

1. **Coking, within one test.** The closed expander needs the fuel to leave the
   jacket hot, because $T_t$ *is* the jacket exit temperature (Eq. 3.7). RP-1
   above roughly **550–600 K** pyrolyses and lays carbon down inside the
   channels. But the heat is there whether you want it or not: run the WE2
   model for a 100 kN kerolox chamber at $p_c = 40$ bar ($\dot m = 34.0$ kg/s,
   $\dot m_f = 9.44$ kg/s, $A_t = 0.0153$ m², $D_t = 0.140$ m,
   $q_t = 48.9$ MW/m², $Q = 11.5$ MW) and the unconstrained bulk rise at
   $c_p = 2{,}200$ J/(kg·K) is **555 K**, taking the kerosene to ~855 K. That
   is not a design point; that is a plugged jacket. You must dump the heat
   somewhere else, and now you have a partly film-cooled chamber and less
   power.
2. **The power balance does not close, even at the coking limit.** Cap
   $T_t$ at 550 K, take $\pi_t = 1.42$ ($p_{inj} = 48$ bar, $\Delta p_t = 20$
   bar), $\gamma_t = 1.10$, $\eta_t = 0.70$: the turbine delivers **249 kW**
   against a pump demand of **294 kW** (fuel 150 kW at 90 bar rise, ox 138 kW
   at 45 bar, over $\eta_m = 0.98$). **Ratio 0.85 — it fails by 15 %, and every
   fix makes it worse**: raising $\Delta p_t$ raises the pump demand faster
   than it raises turbine work at low $\pi_t$. (Registered as `13.C5a`–`13.C5c`.
   The heat model is borrowed from a hydrogen chamber and is good to about
   ±25 %, so read the 0.85 as "does not close" and not as a number.)
3. **The propellant is the wrong shape for the job.** Kerosene's
   $c_p \approx 2{,}000$–2,400 J/(kg·K) is **one seventh of hydrogen's**
   14,500, and at $MR = 2.6$ it is only ~28 % of the mass flow. The available
   power $\dot m_f c_p \Delta T$ is therefore short on all three factors at
   once, and the third factor is capped by (1).

A fourth, if the marker wants it: RP-1 is a poor high-flux coolant — no
supercritical régime at sensible pressures, a low thermal conductivity, and a
deposit-forming film side — so even the heat you *are* willing to take is
harder to take. This is the same reason there has never been a kerolox
fuel-rich staged-combustion engine (§3.11): the fuel cannot be the working
fluid.

**C6.** **What the second shaft bought was controllability, not performance.**

*The RS-25's dual-shaft, dual-preburner arrangement.* Two preburners, each
with its own oxidizer valve, driving two independent turbopumps. That gives the
controller **two independent actuators**, so thrust and mixture ratio can be
commanded separately and held by closed loop: 67–109 % of rated power level with
mixture-ratio control tight enough to deplete both Shuttle tanks together. It
also lets each shaft run at its own speed (HPFTP 35,360 rpm, HPOTP 28,120 rpm)
without a gearbox, which matters because hydrogen and oxygen want a factor of
four in tip speed for the same $\Delta p$ [_verify-liquid].

*What it cost.* Two preburners, two augmented spark igniters plus the chamber's,
a hot-gas manifold that must merge two streams and is one of the most expensive
single parts of the engine, four pumps counting the low-pressure boost stages,
and the hardest start sequence in rocketry (~4.4 s, closed loop assuming
authority at ~90 % of rated $p_c$). The HPFTP was a recurring development
problem and the Block II change was, precisely, a new one.

*The RD-0120 counterexample.* 219 bar, 455 s, $\varepsilon = 85.7$ — **higher
$p_c$ and higher $I_{sp}$ than the RS-25** — from a **single-shaft turbopump
driving both pumps**. It also reportedly achieved combustion stability without
the acoustic resonance cavities the RS-25 requires. That comparative claim rests
on a single thin source and should be corroborated before it is leaned on
[_verify-liquid], but the architectural fact — one shaft, both pumps, 219 bar —
is solid.

*Verdict [J].* It was worth it **for the Shuttle's requirement set** and not
worth it as a general proposition. The Shuttle needed man-rated closed-loop
throttling across a 67–109 % range for max-q relief and 3 g limiting, with
propellant-depletion mixture-ratio control and a 55-flight life; the RD-0120 was
never asked to do any of that. Today you would buy the same controllability
with a simpler machine and better digital control, and the RS-25's own history
argues for it: the engine flies expendably on SLS, so the reuse premise that
justified much of the complexity did not survive contact with the accountants.

**C7.** The two loops differ in the **sign of the gain**, and the sign comes out
of two exponents.

*Expander — negative.* The turbine's power supply is the wall heat, and
$Q \propto p_c^{0.8}$ from Bartz, while the pump power demand is
$P \propto \dot m\,\Delta p_p \propto p_c^{2}$ at fixed geometry. Perturb the
engine downward — a fouled channel, a cold start, an off-nominal coolant inlet
— and $p_c$ falls. Demand falls as $p_c^2$; supply falls only as $p_c^{0.8}$.
**The ratio available/required improves as the engine slows down**, so the
excursion is self-limiting: the engine rolls back to a lower stable operating
point and sits there. Nothing runs away. This is why the closed expander is the
safest cycle to restart in flight and why the RL10's failure mode is "did not
make rated thrust" rather than "burst".

*Gas generator — positive.* During start, more GG flow gives more turbine
power, gives more pump speed, gives higher pump discharge, gives **more GG
flow**. The loop closes on itself with a gain that exceeds unity until something
chokes or the controller catches it. Left alone it overshoots: pump speed and
$p_c$ run past the set point and the failure is a turbine burst or a
containment failure. Every element of a gas-generator start sequence exists to
manage that gain — open-loop scheduled valve ramps, a hard speed limit, and a
ramp rate slow enough that an ignition delay cannot integrate into a slug of
unburned propellant that lights all at once.

*Implication.* The expander fails **soft** and is nearly self-governing; the gas
generator fails **hard** and must be governed. That is a large part of why an
expander needs no start energy source beyond residual metal heat while a gas
generator needs a cartridge, a start bottle, a ground cart or a head-pressure
start, and why more engines are lost in the first two seconds than in the
remaining two hundred.

**C8.** The two numbers measure different things at different places in the
chain.

- **~95 %** is $\eta_{inv}\eta_{mot}$: an *electrical-to-shaft conversion
  efficiency* of energy that has **already been paid for** and is sitting in
  the battery. It says nothing whatever about what the energy cost to carry.
- **~50 %** is $\eta_t$: a turbine's *isentropic efficiency*, the fraction of
  the available enthalpy drop across the turbine that becomes shaft work. It is
  also only one link in the gas generator's chain. If you insisted on a like-for-
  like conversion figure for the GG — chemical energy of the propellant burned
  in the generator, out to shaft work — it would be roughly **10–15 %**, not
  50 %, because the gas leaves the turbine hot and most of the chemical energy
  goes out the dump nozzle. Rocket Lab's comparison flatters the electric drive
  and, oddly, also flatters the turbine.

**The quantity that is comparable is mass**, because mass is what the rocket
equation charges for. Two forms of it:

$$\frac{m_{batt}}{m_{prop}} = \frac{\overline{\Delta p}}{\bar\rho\,\eta_p\eta_{inv}\eta_{mot}\,e_b} \qquad \text{versus} \qquad f_{gg} = \frac{K p_c}{\bar\rho\,\eta_t\eta_m\eta_p\,c_pT_t\left[1-\pi_t^{-\kappa}\right]}$$

and even that is not the final answer, because the battery's mass is **carried**
to burnout and sits in $m_f$, while the gas generator's is **consumed** and sits
only in $m_0$. The genuinely comparable quantity is **stage $\Delta v$ at fixed
payload**, computed both ways — which is exactly WE4 Part C: 5,926 m/s for the
gas generator against 5,426 m/s for the electric version of the same engine,
despite the electric version's 8.7 s better $I_{sp}$.

---

### Calculation

**N1.** *(All values registered as `13.N1a`–`13.N1c`.)*

**Step 1 — flows.** $\dot m = 300$ kg/s at $MR = 3.4$:

$$\dot m_f = \frac{300}{4.4} = 68.182\ \mathrm{kg/s},\qquad \dot m_{ox} = 231.818\ \mathrm{kg/s}$$

**Step 2 — pump pressure rises.** $\Delta p_{inj} = 0.2\times110 = 22$ bar.

- Fuel: $p_d = 110 + 22 + 20 + 5 = 157$ bar; less 4 bar inlet →
  $\Delta p_f = \mathbf{153\ bar}$.
- Oxidizer (no jacket): $p_d = 110 + 22 + 5 = 137$ bar; less 4 →
  $\Delta p_o = \mathbf{133\ bar}$.

**Step 3 — pump powers** (Eq. 3.2, $\eta_p = 0.72$):

$$P_f = \frac{68.182\times153\times10^5}{423\times0.72} = 3.425\ \mathrm{MW},\qquad P_o = \frac{231.818\times133\times10^5}{1141\times0.72} = 3.753\ \mathrm{MW}$$

$$P_{pump} = 7.178\ \mathrm{MW},\qquad P_{shaft} = \frac{7.178}{0.98} = \mathbf{7.325\ MW}$$

Note the split: **methane's low density (423 kg/m³) pushes the fuel pump to
48 % of the power on 23 % of the mass.** On kerolox (WE1) the fuel pump took
only 40 %. Density, not mixture ratio, sets which pump dominates.

**Step 4 — turbine specific work.** $\kappa = 0.26/1.26 = 0.20635$:

$$w_t = 0.66\times2400\times1050\left[1-18^{-0.20635}\right] = 1.6632\times10^6\times0.44921 = \mathbf{7.4715\times10^5\ J/kg}$$

**Step 5 — flow fraction.**

$$\dot m_t = \frac{7.325\times10^6}{7.4715\times10^5} = \mathbf{9.804\ kg/s},\qquad \dot m_{tot} = 309.80\ \mathrm{kg/s}$$

$$f_{gg} = \frac{9.804}{309.80} = \mathbf{3.16\,\%}$$

**Step 6 — $I_{sp}$ penalty.** With a dump nozzle worth 130 s:

$$I_{sp} = \frac{300\times340 + 9.804\times130}{309.80} = \mathbf{333.4\ s} \quad\Rightarrow\quad \Delta I_{sp} = \mathbf{6.7\ s}$$

(For reference, with no recovery at all: 329.2 s, a 10.8 s penalty.)

**Sanity check.** $f_{gg} = 3.2$ % is in the 2–5 % band, and 6.7 s is inside the
3–8 s literature range. The engine is a plausible Prometheus/Merlin-class
methalox gas generator — Prometheus targets 100 bar, and every flown GG engine
sits below the 100–130 bar line of Eq. 3.4 [_verify-liquid].

---

**N2.** *(Registered as `13.N2a`–`13.N2c`.)* Same engine, $p_c = 180$ bar,
$\Delta p_j$ scaled with $p_c$: $20\times180/110 = 32.73$ bar.
$\Delta p_{inj} = 36$ bar.

- Fuel: $180+36+32.73+5-4 = \mathbf{249.73\ bar}$ → $P_f = 5.591$ MW
- Ox: $180+36+5-4 = \mathbf{217\ bar}$ → $P_o = 6.123$ MW
- $P_{shaft} = 11.715/0.98 = \mathbf{11.953\ MW}$ (a 63 % increase for a 64 %
  increase in $p_c$ — Eq. 3.4's linearity, confirmed)

$$\dot m_t = \frac{11.953\times10^6}{7.4715\times10^5} = \mathbf{16.00\ kg/s},\qquad f_{gg} = \frac{16.00}{316.00} = \mathbf{5.06\,\%}$$

**The verdict.** Main-chamber $I_{sp}$ rises from 340 s to 344 s. Delivered
$I_{sp}$ with the same 130 s dump credit:

$$I_{sp}(180\ \mathrm{bar}) = \frac{300\times344 + 16.00\times130}{316.00} = 333.17\ \mathrm{s}$$

against 333.35 s at 110 bar. **The uprate is a net loss of 0.19 s.** With no
dump credit it is worse: 326.58 s against 329.24 s, a loss of 2.66 s.

**Do not make the change** — at least not for $I_{sp}$. $f_{gg}$ grew by
1.90 points while the chamber gave back only 4 s on 340, i.e. 1.18 %. This is
Eq. 3.4 turning into a wall in front of you, and it is why every flown
gas-generator engine sits below ~120 bar: Merlin 1D 97 bar, RS-68A 102.6 bar,
Vulcain 2 117.3 bar [_verify-liquid]. A complete answer notes the two things
that *are* still bought by 180 bar — a throat area 39 % smaller, hence a larger
$\varepsilon$ inside the same envelope, and better thrust-to-weight — and says
that if either of those is the binding constraint the trade may still be worth
making. But on the stated criterion it is not.

---

**N3.** *(Registered as `13.N3a`–`13.N3c`.)*

**Step 1 — flows and geometry.** At $I_{sp} = 455$ s (the module's expander
band):

$$\dot m = \frac{150{,}000}{455\times9.80665} = 33.617\ \mathrm{kg/s},\quad \dot m_f = \frac{33.617}{6.8} = 4.944\ \mathrm{kg/s},\quad \dot m_{ox} = 28.673\ \mathrm{kg/s}$$

$$A_t = \frac{\dot m c^*}{p_c} = \frac{33.617\times2320}{55\times10^5} = \mathbf{0.014180\ m^2},\qquad D_t = \sqrt{4A_t/\pi} = \mathbf{0.1344\ m}$$

**Step 2 — heat pickup.**

$$q_t = 160\times\left(\tfrac{55}{206}\right)^{0.8}\left(\tfrac{0.262}{0.1344}\right)^{0.2} = 160\times0.34575\times1.14899 = \mathbf{63.58\ MW/m^2}$$

$$Q = 15.4\,A_t\,q_t = 15.4\times0.014180\times63.58\times10^6 = \mathbf{13.88\ MW}$$

**Step 3 — turbine inlet temperature** (Eq. 3.7, $c_{p,H_2} = 14{,}500$,
$T_{in} = 30$ K):

$$\Delta T = \frac{13.88\times10^6}{4.944\times14500} = 193.7\ \mathrm{K} \quad\Rightarrow\quad T_t = \mathbf{223.7\ K}$$

**Step 4 — the fixed point.** $p_{inj} = 1.2\times55 = 66$ bar. Sweep
$\Delta p_t$; the fuel pump must raise $66 + 35 + \Delta p_t - 3$ bar, the ox
pump $66-3 = 63$ bar, and the turbine sees
$\pi_t = (66+\Delta p_t)/66$:

| $\Delta p_t$ | $\pi_t$ | pumps (shaft) | turbine | closes? |
|---|---|---|---|---|
| 50 bar | 1.758 | 1.733 MW | 1.670 MW | no |
| **55 bar** | **1.833** | **1.784 MW** | **1.785 MW** | **yes** |
| 56 bar | 1.849 | 1.794 MW | 1.807 MW | yes, with margin |

$$\boxed{\Delta p_t = 55\ \mathrm{bar};\quad \pi_t = 1.833;\quad p_d = 66+35+55 = \mathbf{156\ bar}}$$

Pump powers at the closure point: fuel 1.522 MW, oxidizer 0.226 MW — **87 % of
the shaft power goes into the hydrogen pump**, which is the signature of every
hydrogen engine and the reason the hydrogen circuit is the one that binds.

**Sanity check.** 156 bar pump discharge for a 55 bar chamber is **2.8× $p_c$**.
Compare WE2: Case A (100 kN, 40 bar) closed at 2.6×, Case B (1 MN, 40 bar) at
6.2×. A 150 kN engine landing at 2.8× is right on the trend, and it is
**feasible but at the edge** — it is close to Vinci, the largest closed expander
ever flown at 180 kN and 60 bar, which took 26 years to develop
[_verify-liquid]. It also has essentially zero power margin against a heat model
good to ±25 %, so the honest engineering answer is "build it only with a
validated chamber thermal model, and design the jacket for margin".

---

**N4.** *(Registered as `13.N4a`–`13.N4c`.)*

**Step 1 — flows.** $\dot m = 1{,}250$ kg/s at $MR = 2.72$:

$$\dot m_f = \frac{1250}{3.72} = 336.02\ \mathrm{kg/s},\qquad \dot m_{ox} = 913.98\ \mathrm{kg/s}$$

**Step 2 — pump pressure rise.** $1.45\times267 = 387.15$ bar, less 4 bar inlet:
$\Delta p = \mathbf{383.15\ bar}$ on both circuits.

$$P_f = \frac{336.02\times383.15\times10^5}{810\times0.75} = 21.19\ \mathrm{MW},\qquad P_o = \frac{913.98\times383.15\times10^5}{1141\times0.75} = 40.92\ \mathrm{MW}$$

$$P_{pump} = 62.11\ \mathrm{MW},\qquad P_{shaft} = \frac{62.11}{0.98} = \mathbf{63.38\ MW}$$

**Step 3 — required pressure ratio.** All the oxidizer as drive flow,
$\kappa = 0.33/1.33 = 0.24812$:

$$63.38\times10^6 = 0.75\times913.98\times1100\times720\left[1-\pi_t^{-0.24812}\right]$$

$$1-\pi_t^{-0.24812} = \frac{63.38\times10^6}{5.4265\times10^8} = 0.11679 \quad\Rightarrow\quad \boxed{\pi_t = \mathbf{1.649}}$$

**Sanity check and the lesson.** $\pi_t = 1.65$ sits inside the module's
1.3–1.8 closed-cycle band. Now put the three worked cases side by side:

| | GG (WE1) | FRSC (WE3) | ORSC (N4) |
|---|---|---|---|
| drive flow | 5.45 kg/s (2.9 %) | 138.9 kg/s (27 %) | **914 kg/s (73 %)** |
| $c_pT_t$ | 2.10 MJ/kg | 8.15 MJ/kg | **0.79 MJ/kg** |
| $\pi_t$ | 20 | 1.38 | 1.65 |

**ORSC has the worst working fluid of the three and compensates entirely with
mass flow** — a factor of ten down on $c_pT_t$ against hydrogen-rich gas, made
up by putting nearly three times the mass fraction through the turbine. That is
the ORSC trade in one table: cold, heavy, chemically vicious gas in very large
quantity.

**A consistency check the best answers will spot.** $\pi_t = 1.649$ with a
turbine exhausting into the injector at $\approx 1.2 p_c = 320$ bar implies a
preburner at $320\times1.649 = 528$ bar — *above* the 387 bar pump discharge the
problem told you to assume. The problem's "$1.45p_c$" is a gas-generator rule of
thumb and it is **too low for a real ORSC engine**, where the pump must also
cover the turbine's own drop. The lesson is Eq. 3.1's callout in action: on a
closed cycle the turbine's pressure drop appears in the pump's bill, and any
$p_d = Kp_c$ shortcut hides it. Full credit for computing 1.649 as asked; bonus
credit for noticing that it does not close against the stated pump discharge and
saying which assumption must give.

The RD-180's real turbopump power is **not published as a single agreed
figure**; the RD-170's is quoted at 170 MW in one place and 192 MW in another
*within the same article*, so the 63 MW computed here for a half-RD-170 is
order-consistent with roughly half of a contested 170–190 MW but should not be
presented as a verification of anything [_verify-liquid §5].

---

**N5.** From WE4 Part B, the electric version of the module 03 engine needs

$$E = P_{elec}\,t_b = \frac{3.2874\times10^6}{0.95\times0.97}\times165 = \mathbf{588.6\ MJ}$$

The gas generator's payment is $\dot m_t t_b = 5.452\times165 = 899.6 \approx
900$ kg of propellant. Setting $m_{batt} = 900$ kg:

$$e_b = \frac{588.6\times10^6}{900} = \mathbf{6.54\times10^5\ J/kg} = \mathbf{182\ Wh/kg\ usable}$$

**Comment.** Usable is not the same as rated. The module takes usable
$e_b = 110$ Wh/kg from cells rated 180–250 Wh/kg — roughly **half**, once you
account for the discharge rate (a 165 s burn is a ~20 C discharge, which costs
capacity badly), depth-of-discharge limits, packaging, wiring, bus bars,
connectors and thermal management. So 182 Wh/kg usable implies roughly
**350–400 Wh/kg at the cell**. Current flight-qualified lithium-polymer is
180–250 Wh/kg; laboratory lithium-metal and lithium-sulfur cells reach
350–500 Wh/kg but not at 20 C discharge, not with cycle life, and not
flight-qualified. So: **no current chemistry reaches it, and near-term ones
reach the cell number but not the usable one.**

**And even then the electric version would still lose**, which is the point of
the question. At break-even on *mass paid*, the gas generator's 900 kg is
consumed during the burn and the battery's 900 kg is carried to burnout. In the
rocket equation consumed mass sits in $m_0$ and carried mass sits in $m_f$, and
$m_f$ is far more expensive. A student who reports 182 Wh/kg and stops has done
the arithmetic; a student who adds that break-even on mass is still a loss on
$\Delta v$ has understood the module.

---

**N6.** *(Registered as `13.N6a`–`13.N6c`.)*

**Step 1 — flows.**

$$\dot m = \frac{1.471\times10^6}{426\times9.80665} = 352.11\ \mathrm{kg/s},\quad \dot m_f = \frac{352.11}{6.9} = 51.03\ \mathrm{kg/s},\quad \dot m_{ox} = 301.08\ \mathrm{kg/s}$$

**Step 2 — pump power.** $\Delta p = 1.5\times100 - 3 = 147$ bar both sides:

$$P_f = \frac{51.03\times147\times10^5}{71\times0.72} = 14.674\ \mathrm{MW},\qquad P_o = \frac{301.08\times147\times10^5}{1141\times0.72} = 5.387\ \mathrm{MW}$$

$$P_{shaft} = \frac{20.062}{0.98} = \mathbf{20.47\ MW}$$

Again the hydrogen pump takes **73 % of the power on 14 % of the mass.**

**Step 3 — bleed flow.** $\kappa = 0.4/1.4 = 0.28571$:

$$w_t = 0.68\times15000\times400\left[1-8^{-0.28571}\right] = 4.08\times10^6\times0.44796 = \mathbf{1.8277\times10^6\ J/kg}$$

$$\dot m_b = \frac{20.47\times10^6}{1.8277\times10^6} = \mathbf{11.20\ kg/s}$$

**Step 4 — the fraction, stated two ways.**

$$f_b = \frac{11.20}{352.11} = \mathbf{3.18\,\%\ of\ total\ flow} \quad = \quad \frac{11.20}{51.03} = \mathbf{22.0\,\%\ of\ the\ fuel\ flow}$$

**This is the answer the module told you to look at before assuming "a bleed is
small".** Three per cent of the engine sounds trivial. **Nearly a quarter of the
hydrogen** does not, and it is the same number. On a hydrolox engine the fuel is
only 12–17 % of the mass, so any fraction quoted against total flow understates
what the fuel circuit is actually giving up — and the fuel circuit is where the
jacket, the injector and the mixture-ratio control all live.

**Step 5 — $I_{sp}$ penalty.** Main-chamber flow is $352.11-11.20 = 340.91$
kg/s. With the dumped warm hydrogen worth 180 s:

$$I_{sp} = \frac{340.91\times426 + 11.20\times180}{352.11} = \mathbf{418.2\ s}\quad\Rightarrow\quad \Delta I_{sp} = \mathbf{7.8\ s}$$

With no recovery at all: 412.5 s, a 13.6 s penalty.

**Sanity check.** The module quotes the expander-bleed penalty as roughly 1–3 %,
i.e. 5–15 s on a hydrogen engine; 7.8 s is 1.8 %, squarely inside. The LE-9's
published 426 s vacuum $I_{sp}$ at 100 bar and $\varepsilon = 37$ is *this*
engine's delivered figure, and the comparison the module draws — staged
combustion at that size would give 440+ — is the 14 s you can now see is mostly
cycle penalty plus the $p_c$ the cycle cannot reach [_verify-liquid]. Note also
that warm hydrogen is a genuinely good dump propellant (180–220 s), which is why
the bleed's penalty is so much smaller than a gas generator's for the same flow
fraction.

---

**N7.** *(Registered as `13.N7a`–`13.N7b`.)*

**Step 1 — flows.** $\dot m = 2{,}577$ kg/s at $MR = 2.27$:

$$\dot m_f = \frac{2577}{3.27} = 788.07\ \mathrm{kg/s},\qquad \dot m_{ox} = 1{,}788.93\ \mathrm{kg/s}$$

**Step 2 — pressure rise.** $1.45\times70 = 101.5$ bar, less 4 bar inlet:
$\Delta p = \mathbf{97.5\ bar}$.

**Step 3 — ideal (100 % efficient) hydraulic power.**

$$P_{ideal} = \frac{788.07\times97.5\times10^5}{810} + \frac{1788.93\times97.5\times10^5}{1141} = 9.486 + 15.287 = \mathbf{24.77\ MW}$$

**Step 4 — implied efficiency.** Shaft power available to the pumps is
$41\times0.98 = 40.18$ MW:

$$\bar\eta_p = \frac{24.77}{40.18} = \boxed{\mathbf{0.62}}$$

**Is that plausible?** **Yes — and it is a little low, which is itself
informative.** Modern rocket pumps run 0.65–0.85; the module's table puts small
pumps at 0.60 and the RS-25 HPFTP above 0.80. A 1960s single-stage centrifugal
pump of enormous physical size, direct-driven (no gearbox) at only 5,488 rpm,
would plausibly land at 0.65–0.75.

So 0.62 says one of the *assumptions* is slightly off, and a good answer says
which and in which direction:

- **The 41 MW almost certainly includes more than the two main pumps.** The F-1
  drove no separate machinery of note, but bearing coolant, balance-piston
  flow and the turbine's own losses come out of that number.
- **$1.45p_c$ may be too low for the F-1.** Its injector drop was large by
  modern standards and the fuel also fed the nozzle-extension film circuit; a
  factor of 1.55–1.6 would push $\bar\eta_p$ to 0.66–0.68.
- **$p_c \approx 70$ bar is itself contested** — 965 / 982 / 1,015 / 1,125 psia
  all circulate, a spread of 16 %, arising from measurement station and
  programme phase [_verify-liquid §1]. Taking the top figure alone moves
  $\bar\eta_p$ by about 4 points.

**That is the whole value of the exercise.** A first-order power balance does
not confirm a published number; it tells you which of your assumptions is wrong,
and roughly by how much. Compare WE3 step 2, where the same check on the RS-25
returned $\eta_p = 0.85$ — *too high* — and told us the discharge pressure or the
fuel flow was misstated. Same method, opposite direction, same conclusion.

---

### Engineering reasoning

**R1.** **Diagnosis: coking of the regenerative fuel circuit, with carbon
carried downstream into the fuel-side injector elements.**

*Why the three symptoms fit together.* A 17.6 % rise in jacket $\Delta p$ at
constant flow is a **geometry** change, not a fluid one: deposits reduce the
channel hydraulic diameter and raise the roughness, and $\Delta p$ goes as
$D_h^{-5}$ at fixed mass flow, so a few tens of microns of deposit does it. The
same pyrolysis products travel to the injector, partially block fuel orifices,
skew the element-to-element mixture ratio and coarsen atomisation — which shows
up as exactly the observed ~1.1-point drop in $\eta_{c^*}$. And **the constant
turbine inlet temperature is the discriminator**: $T_t$ is set by the gas
generator's own mixture ratio, which is upstream of the jacket and unaffected.

*What the constant $T_t$ rules out.* A drifting GG mixture ratio (would move
$T_t$ first), a failing GG oxidizer valve, and turbine degradation. Note also
that a monotonic trend across twelve tests rules out a discrete event — a
partly closed valve or a damaged orifice would be a step, not a ramp.

*Competing hypotheses and how to kill them.*

| hypothesis | predicts | observed? |
|---|---|---|
| Coking of channels + injector | $\Delta p_j\uparrow$, $\eta_{c^*}\downarrow$, $T_t$ flat | **all three** |
| $\Delta p$ transducer drift | $\Delta p_j\uparrow$ only | no, $c^*$ moved |
| Injector face erosion | $\eta_{c^*}\downarrow$ only | no, $\Delta p_j$ moved |
| Coolant flow reduced (leak/valve) | $\Delta p_j$ **down**, wall temps up | wrong sign |
| Chamber wall bulging (creep) | $\Delta p_j$ **down** | wrong sign |

*The confirming measurement.* **A cold-flow hydraulic resistance check of the
fuel circuit between tests**: measure $\Delta p$ at two or three flow rates with
inert fluid at known temperature and fit $K = \Delta p/\dot m^2$. A rising $K$
at fixed flow and fixed fluid properties is unambiguously a **geometry** change
and separates deposits from every thermophysical explanation. Then **borescope
the channels and the injector face**, and trend the **jacket outlet bulk fuel
temperature** — coking correlates with the film-side wall temperature and the
bulk exit temperature, so if the exit is above ~550–600 K you have found the
mechanism and its driver in one measurement.

*The design change.* In order of preference: **reduce the film-side coolant
temperature** at the hottest station — more channels (higher mass flux, lower
$\Delta T$ film-side), a locally increased hydraulic diameter, or a fuel film
cooling curtain to cut the gas-side flux; **cap the bulk exit temperature below
550 K** as a hard design rule; **post-run inert purge** of the jacket so
residual fuel does not bake in a hot chamber after shutdown. If the engine is
expendable and the burn is short, the legitimate fourth option is to **accept
it** and set an inspection/flush interval — that is what the F-1's gas generator
did for a decade [SP-8081].

**R2.** **The plateau and the spike are one event, not two.**

*The plateau (60 % speed, 0.6 s).* The bootstrap has stalled: turbine power in
equals pump power absorbed at a partial operating point. Two families of cause,
and you must say which you think it is.

- **Benign/intended:** many staged-combustion start schedules contain a
  deliberate hold at partial speed to let the LOX lines pack, the chamber
  prime and the preburners stabilise before the ramp. If the valve schedule
  commanded a hold here, the plateau is not a fault.
- **Unintended:** a two-phase pump inlet (incomplete chill-down, a warm pocket
  in a line), an oxidizer line still unpacking so the preburner is starved, or
  a preburner oxidizer valve hung on its seat. In all three the engine cannot
  find more power to accelerate on.

*"Chamber pressure lags speed throughout" is not a fault.* That is normal and
expected — the pumps must make pressure before the chamber can fill and light.
An answer that flags it as the anomaly has the causality backwards. (The
anomalous version is the opposite: $p_c$ **leading** pump speed, which means the
chamber lit on tank head before the pumps were up.)

*The spike (180 K at $t = 2.4$ s).* This is an **oxidizer-rich excursion in the
preburner** during the ramp off the plateau. During the hold, oxidizer
accumulates upstream of, or unburned in, the preburner while the fuel side is
still catching up; when the ramp resumes, the accumulated oxidizer meets the
gas and the mixture ratio goes momentarily rich in oxygen. The 180 K is the
signature: turbine inlet temperature is a *direct* function of preburner
mixture ratio, and from the WE3 chemistry table, moving $r_{pb}$ from 0.9 to
1.0 moves $T_t$ by 92 K — so 180 K is roughly a 0.2 excursion in $r_{pb}$, a
large one.

*Which is more dangerous: the spike, decisively.* The plateau costs start-time
repeatability and shutdown-impulse dispersion — real, but a performance
problem. The spike is 180 K on uncooled turbine blades where creep life is
exponential in temperature, and if the excursion is genuinely oxygen-rich rather
than merely hotter, the failure mode is not creep at all but **ignition of the
metal**, which is self-sustaining and consumes the part [_verify-liquid]. That
is why turbine inlet temperature is the one cycle measurement given redundant
thermocouples and **shutdown authority**, and why every start sequence carries a
fuel lead and every shutdown sequence closes the preburner oxidizer valve first.

*What to do.* Instrument the preburner oxidizer line for pressure and the
preburner for two independent $T_t$ measurements; re-shape the ramp so the fuel
side leads through the whole transition; if the plateau is unintended, fix the
chill-down or the line packing that causes it — **because fixing the plateau
almost certainly deletes the spike.**

**R3.** *(Supporting numbers registered as `13.R3a`–`13.R3c`.)*

**The case for the closed expander (45 bar, 462 s).**

Zero cycle penalty, seven seconds of $I_{sp}$ in hand, the fewest hot parts of
any pump-fed engine, no preburner and no igniter but the chamber's, tank-head
bootstrap restart, and a **negative** feedback loop so the failure mode is a
quiet roll-back rather than a runaway (C7). On an upper stage, where restart
count and benign failure behaviour are worth a great deal, that is a strong
hand. Seven seconds on 455 is 1.5 %, which on a high-energy upper stage is
several hundred kilograms of payload to GTO.

**The case against it — which is a feasibility case, not a preference.**

Run the WE2 machinery at 200 kN and 45 bar ($MR = 5.8$, $c^* = 2320$ m/s,
$I_{sp} = 462$ s): $\dot m = 44.14$ kg/s, $\dot m_f = 6.492$ kg/s,
$A_t = 0.02276$ m², $D_t = 0.1702$ m; $q_t = 51.7$ MW/m²; $Q = 18.10$ MW;
$\Delta T = 192$ K so $T_t = 222$ K; jacket drop scaled from WE2 Case A
($\Delta p_j \propto D_t$) is **39.7 bar**. The fixed point closes at
$\Delta p_t = 34$ bar, $\pi_t = 1.63$, with the turbine at **1.908 MW** against a
pump demand of **1.907 MW** — a margin of **0.05 %** — and a **pump discharge of
128 bar for a 45 bar chamber, 2.8× $p_c$.**

Three things follow. **(i)** 200 kN is above the largest closed expander ever
flown — Vinci, 180 kN at 60 bar, after a **26-year** development
[_verify-liquid]. **(ii)** A 0.05 % margin against a heat model good to ±25 % is
not a margin; it is a coin toss. **(iii)** The term carrying the uncertainty is
$\Delta p_j$, which is also the term that drifts over life (R1) — so the engine's
power balance is hostage to its fouling behaviour.

**The case for the expander bleed (90 bar, 455 s).**

The bleed unpins $\pi_t$ from 1.4 and thereby **deletes the fixed point
entirely**: the jacket no longer has to pass the whole fuel flow, so
$\Delta p_j$ decouples from the main circuit and thermal margin becomes a design
variable instead of a root of an equation. There is no thrust ceiling — the
LE-9 makes 1,471 kN on this cycle, eight times Vinci. And 90 bar halves the
throat: $A_t = 0.01155$ m² against 0.02276 m², $D_t = 0.121$ m against 0.170 m.
**In a fixed interstage diameter that is the decisive geometric argument.** With
a 2.15 m exit diameter the bleed engine reaches $\varepsilon \approx 314$ where
the closed expander reaches $\varepsilon \approx 160$ — and the 462 s / 455 s
figures quoted in the problem are stated at each engine's own area ratio, so
part of the 7 s is recoverable by the bleed engine simply by using the envelope
it has been given.

**The case against the bleed.** A real 2 % penalty; and the LE-9's development
found **combustion chamber wall cracks and turbine blade fatigue cracks** in
2020, delaying H3 by about two years [_verify-liquid] — a duty-rated jacket is a
heat exchanger with a specification, and specifications get missed.

**Recommendation [J]: the expander bleed at 90 bar.**

The seven seconds are worth buying certainty on. The closed expander at 200 kN
is an extrapolation past every flown data point, with a power balance that
closes only at 2.8× $p_c$ at the pump and no margin against the single most
uncertain quantity in the design. The bleed engine's risks — thermal fatigue in
the jacket, a small $I_{sp}$ loss — are risks you can *design against and test*;
the closed expander's risk is that the cycle does not close at all, discovered
late. The area-ratio argument in a fixed interstage then recovers a meaningful
part of the $I_{sp}$ difference, and the historical record is unambiguous about
what happens when you need a big expander: **the answer was not a bigger closed
expander, it was the LE-9.**

**What would change my answer.**

1. **A validated chamber thermal model with its uncertainty band.** If the
   closed expander closes with 25 % or more margin on a model good to ±10 %,
   take the 7 s. This is the single decisive item.
2. **The stage's $\partial(\text{payload})/\partial I_{sp}$ against
   $\partial(\text{payload})/\partial(\text{dry mass})$.** If the stage is
   $I_{sp}$-dominated, 7 s may outrank a 128 bar pump; if it is inert-mass
   dominated, the bigger pump and jacket structure kill the closed expander
   anyway.
3. **The restart and coast requirements.** Both cycles bootstrap from tank
   head, but a long coast changes the pre-start thermal conditioning problem,
   and the closed expander is *uniquely* sensitive to it (§3.7).
4. **Whether the interstage diameter is genuinely fixed, and at what value.**
   The entire area-ratio argument rests on it.

**R4.** **The engine is the AALPT YF-100, and the cycle is oxidizer-rich staged
combustion.**

*The reasoning chain, in the order it eliminates.*

1. **180 bar rules out every open cycle.** Eq. 3.4 makes $f_{gg}$ proportional
   to $p_c$; N2 is exactly this arithmetic on a comparable engine and shows the
   uprate to 180 bar turning into a *net $I_{sp}$ loss*. Empirically the same
   conclusion: **no gas-generator engine has ever flown above ~120 bar**
   (Vulcain 2.1 at 120.8 bar is the record) [_verify-liquid]. So this is a
   closed cycle.
2. **Kerosene rules out every expander.** The closed expander and the expander
   bleed both need the fuel to be the turbine working fluid; C5 shows kerosene
   fails on coking, on $c_p$, and on mass fraction, in that order. There has
   never been a kerolox expander of any kind.
3. **Kerosene rules out tap-off.** Tap-off gas is at main-chamber mixture
   ratio; on kerolox that is sooty and would foul the turbine. Tap-off is
   essentially a hydrogen-engine cycle (§3.9).
4. **So it is staged combustion — and on kerolox, staged combustion is
   oxidizer-rich, necessarily.** A fuel-rich kerosene preburner in a closed
   circuit cokes the turbine and then the injector, and kerosene is only ~27 %
   of the mass at $MR \approx 2.6$ so it cannot carry the power anyway (§3.11).
   Every flown kerolox staged-combustion engine in history is ox-rich.
5. **Cross-checks that confirm rather than merely permit.** 335 s vacuum
   $I_{sp}$ is right for kerolox at 180 bar with a modest area ratio (the YF-100
   is $\varepsilon = 35$:1); hydrogen would be 430+, and a gas generator at a
   feasible $p_c$ would be nearer 310–320. **65–105 % throttle** is ORSC's
   signature range (RD-191 27–105 %, NK-33 50–105 %, RD-180 47–100 %, BE-4
   40–100 %).

*Identification.* 1,200 kN SL / **1,340 kN vac**, **180 bar**, 300 s SL /
**335 s vac**, $\varepsilon = 35$:1, **65–105 % throttle**, LOX/RP-1, single
shaft with a single-stage oxygen pump and a two-stage kerosene pump — the
**YF-100** [engine-database]. China is the fourth entity to fly ORSC, ahead of
the United States.

*Why not the near neighbours.* RD-191: 258 bar, 27–105 %, single chamber
2,090 kN SL. RD-180: 267 bar, two chambers, 3,830 kN SL. NK-33: 148.3 bar,
1,510 kN SL, 50–105 %. None matches on all four of thrust, $p_c$, $I_{sp}$ and
throttle range. Note that the YF-100's **dry mass and thrust-to-weight are not
published** — a T/W of ~78–80 is widely rumoured and is *not* sourced, so do not
print it [engine-database].

**R5.** **The counter-argument: $I_{sp}$ is a term in the objective function,
not the objective function.**

*Concede the premise first, honestly.* The programme manager is right on the
narrow point. The cycle penalty really is zero for staged combustion and 3–8 s
for a gas generator, and closed cycles reach two to three times the chamber
pressure, which buys a smaller throat, a larger $\varepsilon$ in the same
envelope and another couple of seconds. **On performance alone, closed wins.**
An answer that disputes this is arguing with the module.

*Now the three counters.*

1. **Development cost and schedule, which is the one that kills programmes.**
   A factor of two to three between open and closed, and it is not a soft
   criterion. The **RS-68** was designed to an explicit minimum-cost brief and
   achieved roughly **80 % fewer parts than the RS-25** by choosing a gas
   generator and an ablative nozzle — and it is the largest hydrogen engine
   ever built [_verify-liquid]. The **BE-4** ran roughly **five years late** and
   delayed two launch vehicles. The **RS-25** itself: a 1971 contract, a 1977
   first complete engine test, a 1981 first flight, with a great deal of
   hardware destroyed in between [Biggs89]. Three to eight seconds does not buy
   back a two-year slip in a launch market.
2. **Recurring cost and rate, which decides the business.** Merlin 1D is a gas
   generator at 97 bar giving up perhaps 10 s to a hypothetical ORSC Merlin —
   and it has the highest thrust-to-weight of any flown orbital engine
   (184:1) and is built by the hundred [_verify-liquid]. SpaceX's design
   variable was engines per year, not seconds. Note the corollary: **T/W
   correlates with cycle only weakly.** The RS-68A is also a gas generator and
   sits at 47.4:1. Cycle sets the $p_c$ ceiling; design intent sets T/W.
3. **The binding constraint is frequently not $I_{sp}$ at all.** On a recovered
   first stage the performance is set by the recovery propellant reserve and
   the landing burn, not by 8 s of ascent $I_{sp}$. On an upper stage
   $\varepsilon$ dominates: HM7B is a **gas generator** and delivers **444.6 s**
   at 37 bar, more than most staged-combustion boosters, purely on area ratio
   [_verify-liquid].

*Programmes that decided each way — name them, this is where the marks are.*

| chose open (GG) | why | chose closed | why |
|---|---|---|---|
| RS-68 / Delta IV | explicit minimum-cost brief, 80 % fewer parts | RS-25 / Shuttle | reuse + sea-level-to-vacuum $I_{sp}$ on hydrogen |
| Merlin 1D / Falcon 9 | cost per engine, engines per year | RD-180 / Atlas V | thirty years of ORSC practice already paid for |
| Prometheus | ~1/10 Vulcain 2 cost, up to 50 % printed | Raptor / Starship | reuse: turbine temperature and no interpropellant seal |
| Vulcain 2 / Ariane 5 | schedule and European industrial base | BE-4 / Vulcan, New Glenn | reuse at de-rated 140 bar |

*The synthesis [J].* The right question is not "which cycle has better
$I_{sp}$" but "**what is this vehicle's objective function, and what is the
exchange rate between a second of $I_{sp}$ and a dollar or a year?**" For an
expendable heavy-lift vehicle flying twice a year on a fixed budget, the gas
generator has repeatedly been the right answer. For a booster flying dozens of
times, the closed cycle's real advantage is not $I_{sp}$ at all — it is turbine
temperature and life (§3.12). The PM's error is treating a 1–3 % term as the
decision variable.

---

## K2. Quiz answers with explanations

### Q1 (8 points)

| architecture | turbine drive gas | exhaust goes | flown engines |
|---|---|---|---|
| **Closed expander** | fuel heated in the cooling jacket | **into the main injector** — closed | RL10 (all variants), Vinci |
| **Expander bleed** | a *portion* of the fuel heated in the jacket | **overboard** — open | LE-5A, LE-5B, LE-9, BE-3U |
| **Tap-off** | hot gas bled from the **main chamber** near the wall | **overboard** — open | BE-3PM (J-2S tested 1965–72, never flown) |

*Marking: 2 points per architecture for the correct exhaust destination, 2 for
naming a correct engine for each.* The distinction is not pedantic: the closed
expander has **no** $I_{sp}$ penalty and a practical ceiling near 180 kN
(Vinci); the bleed has a 1–2 % penalty and **no** thrust ceiling (LE-9 at
1,471 kN, eight times Vinci); the tap-off has a GG-like penalty and a
controllability problem instead of a power problem.

**Deduct for**: naming RD-0146 or YF-75D as a *flown* closed expander —
RD-0146 was tested and never flew, and YF-75D's thrust and $I_{sp}$ are
unconfirmed in the course's source, so it may be named as a closed expander but
not quoted numerically. **Deduct heavily for** putting BE-3PM and BE-3U in the
same row; they share a name and not a power cycle [_verify-liquid §19].

### Q2 (8 points)

**(a)** A closed cycle's turbine exhausts **into the main injector**, so its
back pressure is $p_c + \Delta p_{inj}$ rather than ambient, and $\pi_t$ becomes
the ratio of two large and nearly equal pressures — preburner over injector
face — which is 1.3–1.6 rather than 15–40.

**(b)** Because turbine power is
$\eta_t \dot m_t c_p T_t\left[1-\pi_t^{-\kappa}\right]$, and the collapse of the
bracket (0.451 → 0.081, a factor of 5.6) is more than repaid by putting **the
entire flow of one propellant** through the turbine instead of 2–5 % of the
total — the RS-25 drives 138.9 kg/s of hydrogen-rich gas at
$c_p = 8{,}232$ J/(kg·K) where WE1's gas generator drives 5.45 kg/s at 2,100,
a factor of 25 in flow and 4 in specific heat.

*Full marks require the mechanism in (a) (**where the exhaust goes**, not "it is
closed") and a quantitative comparison in (b) — either the flow ratio or the
$\dot m_t c_p T_t$ product.*

### Q3 (12 points)

$$\kappa = \frac{\gamma_t - 1}{\gamma_t} = \frac{0.24}{1.24} = 0.193548$$

$$w_t = \eta_t c_p T_t\left[1-\pi_t^{-\kappa}\right] = 0.62\times2050\times1020\times\left[1-16^{-0.193548}\right]$$

$$= 1.29642\times10^6\times0.41528 = \mathbf{5.3838\times10^5\ J/kg}$$

$$P_{shaft} = \frac{4.8\times10^6}{0.98} = 4.898\times10^6\ \mathrm{W}$$

$$\dot m_t = \frac{4.898\times10^6}{5.3838\times10^5} = \mathbf{9.098\ kg/s}$$

$$\boxed{f_{gg} = \frac{9.098}{260} = \mathbf{3.50\,\%}}$$

Main-chamber flow is therefore $260 - 9.098 = 250.90$ kg/s.

*Marking:* 3 for $\kappa$ and the bracket; 3 for $w_t$; 2 for dividing by
$\eta_m$ **in the right direction** (shaft power required is *larger* than pump
power); 2 for $\dot m_t$; 2 for dividing by the stated **total** flow rather
than by the main-chamber flow. The question says total engine flow includes the
GG, so 260 kg/s is the denominator; using 260 as the main-chamber flow gives
3.38 % and costs 2 points.

### Q4 (10 points)

**No thrust recovery.** The GG flow contributes nothing:

$$I_{sp} = 312\times\frac{250.90}{260} = \mathbf{301.1\ s}\qquad \Delta I_{sp} = \mathbf{10.9\ s}$$

**With a 140 s dump nozzle:**

$$I_{sp} = \frac{250.90\times312 + 9.098\times140}{260} = \frac{78{,}280 + 1{,}273.7}{260} = \mathbf{306.0\ s}\qquad \Delta I_{sp} = \mathbf{6.0\ s}$$

*The lesson to state in the answer:* the same engine has a penalty of 10.9 s or
6.0 s depending entirely on what you assume about exhaust thrust recovery.
**The 3–8 s range quoted throughout the literature is this one calculation with
different assumptions**, not a spread across engines. Anyone quoting a cycle
penalty without stating the recovery assumption has quoted half a number.

*Marking:* 5 each. Deduct 2 for a mass-averaged $I_{sp}$ that divides by 250.90
instead of 260 in the second part — the dumped mass is part of the engine's
propellant consumption and must appear in the denominator.

### Q5 (8 points) — **(b)**

**(b) is right.** Two mechanisms, both necessary. **Mass flow:** at
$MR \approx 2.6$ oxygen is ~72 % of the engine's mass, so routing oxygen through
the turbine gives nearly three times the drive mass that routing the fuel would
— and at $\pi_t \approx 1.5$ the specific work per kilogram is so small that
mass flow is the only lever left (N4: 914 kg/s of drive gas at
$c_pT_t = 0.79$ MJ/kg). **Chemistry:** a fuel-rich kerosene preburner at
900–1,100 K pyrolyses, and in a *closed* circuit the soot and tar accumulate on
turbine blades and then plug main-injector elements — tolerable in an open gas
generator dumping overboard for 160 s, fatal in a closed cycle.

**(a) is wrong** — it inverts cause and effect. Oxygen-rich gas at 600–800 K
*is* cooler than a fuel-rich preburner's 900–1,100 K, but that is a
**consequence** of running at $r_{pb} = 25$–60 with a large diluent mass, not
the reason for choosing it; and if cool gas were the goal there are far easier
ways to get it than solving the hot-oxygen metallurgy problem.

**(c) is wrong, and backwards.** Oxygen-rich turbines are the *most* expensive
turbomachinery ever built: every wetted surface needs an inert passivating
enamel coating, and the whole assembly needs an oxygen-cleanliness discipline —
particulate control, no organic residues, controlled assembly environments —
that is a manufacturing culture rather than a process step [_verify-liquid].
That cost is precisely why the West did not follow the Soviets for thirty years
and why no American ORSC engine flew until the **BE-4 in January 2024**.

**(d) is wrong** — and is the answer of someone who has substituted history for
physics. The Soviets got there first (RD-253, 1965) *because the physics forced
it* on a kerolox closed cycle; American engineers who analysed the same problem
reached the same conclusion and published that ORSC was impossible for want of
the materials. Convergent design under identical constraints is not imitation.

### Q6 (12 points)

**Turbine inlet temperature.** The coolant bulk rise is
$\Delta T = Q/(\dot m_f c_p)$ with $Q \propto p_c^{0.8}D_t^{1.8}$ and
$\dot m \propto p_c D_t^{2}$, so at constant $p_c$:

$$\Delta T \propto D_t^{-0.2}$$

The original rise is $210 - 30 = 180$ K (hydrogen enters at ~30 K):

$$\Delta T_{new} = 180\times2^{-0.2} = 180\times0.87055 = 156.7\ \mathrm{K} \quad\Rightarrow\quad \boxed{T_t = 30 + 156.7 = \mathbf{186.7\ K}}$$

**Jacket pressure drop.** To hold the wall temperature you must hold the
coolant-side heat-transfer coefficient, hence the **channel mass flux $G$**,
roughly constant. Channel count then scales with $\dot m$, the per-unit-length
pressure drop stays put, and the circuit *length* scales with $D_t$:

$$\Delta p_j \propto D_t \quad\Rightarrow\quad \boxed{\Delta p_j = 32\times2 = \mathbf{64\ bar}}$$

**The consequence, which is the point of the question.** Required pump discharge
was $1.2\times50 + 32 = 92$ bar; it is now $60 + 64 = \mathbf{124\ bar}$ before
adding the turbine's own drop. **The chamber pressure did not change and the
pump got 35 % harder** — while the turbine inlet temperature, the thing paying
for the pump, went *down* by 23 K. That divergence, doubling in $D_t$ after
doubling in $D_t$, is the mechanism behind WE2's 248 bar pump on a 40 bar
chamber, and it is the real reason large closed expanders do not exist.

*Marking:* 4 for $T_t$ with the $D_t^{-0.2}$ law stated and derived (not merely
asserted); 4 for $\Delta p_j$ with the constant-mass-flux argument; 4 for
identifying the pump-discharge consequence. An answer that scales $\Delta T$
with $D_t^{-0.2}$ but applies it to 210 K instead of to the 180 K *rise* gets 2
of the first 4 — the 30 K inlet is not a temperature that scales.

### Q7 (10 points) — **(b)**

**(b) is right.** **Lower turbine inlet temperature at a given power**: every
gram of both propellants passes through a turbine, so $\dot m_t$ is maximal and
the required $T_t$ for a given $\dot m_t c_p T_t$ is minimal. Creep life is
exponential in temperature, so this is the reuse argument. **No interpropellant
seal**: in any single-shaft cycle one shaft carries a fuel pump and an oxidizer
pump with a purged, drained labyrinth package between them, a classic failure
site; in FFSC the fuel turbopump sees fuel and fuel-rich gas end to end and the
oxidizer turbopump sees oxygen and oxygen-rich gas end to end. **There is
nothing to keep apart.**

**(a) is wrong on both halves.** FFSC's $I_{sp}$ advantage is only *indirect*,
through the higher chamber pressure it permits — every staged-combustion cycle
already has a zero cycle penalty, so there is nothing left to recover. And part
count is **higher**, not lower: two preburners, two igniters, two turbopumps,
two hot-gas circuits.

**(c) is wrong and inverted.** Two shafts whose speeds must be coordinated to
hold main-chamber mixture ratio, with a preburner mixture ratio to schedule on
each side, is the **hardest** start and control problem in liquid propulsion.
Development is correspondingly the most expensive: the RD-270 (1960s) and the
IPD (2000s) both stopped at test, and Raptor is the only FFSC engine ever
flown.

**(d) is wrong.** Thrust-to-weight correlates with cycle only weakly — Merlin's
184:1 is a **gas generator** and the highest of any flown orbital engine, while
the RS-68A's 47.4:1 is also a gas generator. And throttling is not an FFSC
advantage: the deepest flown throttle ranges belong to a tap-off engine
(BE-3PM, 18–100 %) and an ORSC engine (RD-191, 27–105 %). Raptor's throttle
figures are company claims in any case [_verify-liquid §4].

*Marking:* 4 for the correct option, 2 for each of the three rejections
explained. An answer that picks (b) without explaining the seal is capped at 6.

### Q8 (12 points)

Use Eq. 3.9 directly. First convert the battery figure:
$115\ \mathrm{Wh/kg} = 115\times3600 = 4.14\times10^{5}$ J/kg **usable**.

$$\frac{m_{batt}}{m_{prop}} = \frac{\overline{\Delta p}}{\bar\rho\,\eta_p\,\eta_{inv}\eta_{mot}\,e_b} = \frac{62\times10^{5}}{1020\times0.68\times0.95\times0.96\times4.14\times10^{5}}$$

Denominator: $1020\times0.68 = 693.6$; $\times0.95\times0.96 = 632.6$;
$\times4.14\times10^{5} = 2.619\times10^{8}$.

$$\boxed{\frac{m_{batt}}{m_{prop}} = \frac{6.2\times10^{6}}{2.619\times10^{8}} = 0.02367 = \mathbf{2.37\,\%}}$$

$$m_{batt} = 0.02367\times4200 = \mathbf{99.4\ kg}$$

*Cross-check the energy.* Specific pump work is
$62\times10^5/(1020\times0.68) = 8{,}939$ J/kg of propellant; electrical
$8{,}939/(0.95\times0.96) = 9{,}801$ J/kg; total
$4200\times9801 = 41.17$ MJ $= 11.4$ kWh; $41.17\times10^6/4.14\times10^5 =
99.4$ kg. ✓ *(Registered as `13.Q8`.)*

*Sanity check to state:* 2.37 % is right on top of WE4's Rutherford figure of
2.29 %, which it should be — Eq. 3.9 is **scale-free**, so a stage burning
4,200 kg and a stage burning 1,257 kg per engine land in the same place if their
$\overline{\Delta p}/\bar\rho$ are similar. What differs between a Rutherford
and a booster is not the ratio but the *absolute* dead mass and how it
interacts with the stage mass fraction.

*Marking:* 4 for correct unit conversion of Wh/kg to J/kg (the single most
common failure on this question), 4 for the ratio, 2 for the mass, 2 for a
sanity check against WE4 or a statement that the ratio is scale-free. Deduct 3
for using a **rated** rather than a usable specific energy without comment.

### Q9 (10 points)

**The strongest argument that Blue Origin left performance on the table.**

267 bar and 140 bar are the same cycle on the same class of engine, so the
capability demonstrably exists — Energomash has flown it since the 1990s. From
Eq. 3.4 and the $p_c$ argument of §3.3, roughly doubling chamber pressure at
fixed thrust roughly halves the throat area, which allows a substantially larger
$\varepsilon$ inside the same envelope, worth several seconds of $I_{sp}$, and
shrinks the whole engine, improving thrust-to-weight. **The BE-4's ~46:1 T/W is
modest** against the RD-253's 156:1 and the NK-33's 137:1 — engines that are
decades older. On a two-stage vehicle those seconds and that engine mass are
real payload. And the schedule argument cuts the other way too: the BE-4 ran
roughly **five years late anyway**, so the conservatism did not buy schedule.

**The strongest argument that they did not.**

The objective function is not performance, it is **flights per engine**. Turbine
and chamber life are governed by creep and low-cycle fatigue, and creep rate is
exponential in temperature and strongly nonlinear in stress. Halving $p_c$ drops
gas-side heat flux (Bartz, $q \propto p_c^{0.8}$), wall temperature, turbine
inlet temperature and every pressure-driven stress in the engine at once. It
also reduces the oxygen partial pressure in the hot-gas circuit, which is what
sets the margin against **ignition of the metal** in an ox-rich turbine — a
failure mode that is not a degradation but a fire [_verify-liquid]. The rest of
the BE-4's design says the same thing in three other places: **hydrostatic
bearings** (no rolling elements to spall), **head-pressure start** (no cartridge,
no spin system, relight nearly free), and methane rather than kerosene (no
coking). These are not four independent choices; they are one choice made four
times. Rocket Lab reached the same conclusion independently for Archimedes,
citing the need to hold performance "through all the throttle points that a
reusable rocket needs."

**Which is more persuasive [J].** **The second, decisively — and the RD-180 is
the evidence.** The RD-180 is an outstanding engine and it was never asked to
fly twice. The correct comparison for a reusable booster is not "how much $p_c$
can this cycle reach" but "how many flights before overhaul at what $p_c$", and
on that axis nobody has data at 267 bar because nobody has tried. Note also the
$p_c$ convention trap: American practice quotes injector-end static pressure and
Russian practice quotes nozzle stagnation pressure, which is a few per cent
lower — so comparing 140 to 267 without that caveat already slightly overstates
the gap [_verify-liquid §18]. **Peak performance stopped being the objective
function; the BE-4 is what the new objective function produces.**

*Marking:* 3 for a genuine performance argument with a mechanism (not just "more
pressure is better"), 4 for a life argument that names creep/LCF **and** the
ox-rich ignition margin, 3 for a defended verdict. An answer that picks either
side and defends it well earns full marks; an answer with no verdict is capped
at 7.

### Q10 (10 points)

**(a) The cycle: a closed expander.** "Preburner-free" plus LOX/LH₂ plus a
turbopump implied by 59 bar rules out staged combustion in all three variants
(all have preburners), pressure feeding (59 bar with a hydrogen tank is
absurd — Eq. 3.6), and the gas generator (a GG *is* a combustor, and at 59 bar
its penalty would be visible in the number). Between the three "expander"
architectures: an expander bleed dumps overboard and would show a 1–3 % penalty,
and a tap-off taps the chamber and is not preburner-free in spirit; **470 s with
no penalty at all at 59 bar is the closed expander's signature.** The engine is
almost certainly the **RD-0146** (68.6 kN, 59 bar, 470 s, tested, never flown)
[_verify-liquid].

**(b) Two reasons the figure is plausible.**

1. **The cycle has no $I_{sp}$ penalty**, and the flown record is right
   underneath it: **RL10B-2 delivers 465.5 s**, the highest specific impulse of
   any flown chemical rocket engine, at a *lower* chamber pressure with a 285:1
   extendible carbon–carbon nozzle. 470 s is 1 % above a demonstrated value,
   not a leap.
2. **59 bar is high for an expander** (Vinci, the largest ever flown, is at
   60 bar), and at 68.6 kN a high $p_c$ gives a small throat, so a very large
   area ratio fits in a modest envelope. Vacuum $I_{sp}$ is dominated by
   $\varepsilon$, not by $p_c$ — HM7B gets 444.6 s at 37 bar on a *gas
   generator* — so the physics offers the number.

**(c) Two reasons not to print it beside flight-demonstrated values.**

1. **It is a test-stand or design figure for an engine that never flew.** Flight
   $I_{sp}$ includes the installed nozzle, real mixture-ratio control, real
   $c^*$ efficiency, real coast-thermal states and the whole delivered-versus-
   predicted gap. There is no delivered-performance record for RD-0146 at all,
   because there is no delivery. Putting it in a column headed by RL10B-2's
   465.5 s implies a comparison that has not been made
   [_verify-liquid §17].
2. **The provenance is not the same kind of thing.** A 1 % difference — 470 vs
   465.5 — is well inside the variation caused by *how the number was quoted*:
   at what area ratio, at what mixture ratio, with what $c^*$ efficiency
   assumed, and whether the figure is a specification, a best test point or a
   fleet average. Two numbers of different provenance in the same column read as
   two measurements of the same quantity, and they are not. This is the same
   discipline that applies to the Raptor row of §3.15, where **no independent
   verification of chamber pressure, $I_{sp}$, dry mass or thrust-to-weight
   exists at all** [_verify-liquid §4].

*A third reason, for credit:* the engine's programme status matters. An unflown
engine's figures never went through the ruthless filter of a flight anomaly
review, which is where optimistic numbers usually die.

*Marking:* 3 for the cycle with a stated elimination chain, 3 for two plausible
reasons (one may be the RL10B-2 comparison, one should be about $\varepsilon$),
4 for two provenance reasons. An answer that says "it's Russian so don't trust
it" gets zero for that part — the objection is unflown-versus-flown and
specification-versus-measurement, not nationality; the RD-0120's 455 s at 219
bar is a flight figure and is perfectly citable.

---

## K3. Trade-study reference solution (T1)

**Recommendation: (b) — oxidizer-rich staged combustion on methalox, single
shaft, single preburner, deliberately de-rated to $p_c \approx 150$ bar, with a
head-pressure start and hydrostatic bearings.**

### The power balance, where it matters

*The recommended cycle.* At 1 MN sea level, $I_{sp,SL} \approx 306$ s so
$\dot m \approx 333$ kg/s; at $MR = 3.6$ that is 72.5 kg/s of methane and
260.9 kg/s of LOX. Pumps delivering $1.45p_c$ from a 4 bar inlet must supply
$\Delta p = 213.5$ bar:

$$P_f = 4.877\ \mathrm{MW},\qquad P_o = 6.508\ \mathrm{MW},\qquad P_{shaft} = \frac{11.385}{0.98} = \mathbf{11.62\ MW}$$

Drive the turbine on **all the oxygen** (260.9 kg/s) at $T_t = 750$ K,
$c_p = 1{,}100$ J/(kg·K), $\gamma_t = 1.33$, $\eta_t = 0.75$, and Eq. 3.3 gives

$$\boxed{\pi_t = 1.35}$$

comfortably inside the 1.3–1.8 closed-cycle band. The turbine exhausts into the
injector at $\approx 1.2p_c = 180$ bar, so the preburner sits near
$180\times1.35 = 243$ bar and the pumps must clear that, not the 217.5 bar the
$1.45p_c$ shortcut gives — the same bookkeeping point as N4. *(Registered as
`13.T1d`–`13.T1f`.)* **There is real margin here** — that is what "de-rated"
means, and it is the whole recommendation in one number.

*The gas-generator alternative, costed.* Same engine at 120 bar (an already
generous $p_c$ for an open cycle, above Merlin's 97 bar and RS-68A's 102.6 bar):
$\Delta p_f = 166.8$ bar, $\Delta p_o = 145$ bar, $P_{shaft} = 8.87$ MW; with
the module's methalox GG gas ($T_t = 1{,}050$ K, $c_p = 2{,}400$, $\pi_t = 18$,
$\eta_t = 0.66$, $w_t = 7.47\times10^5$ J/kg) the drive flow is 11.88 kg/s,
$f_{gg} = \mathbf{3.44\,\%}$, and the $I_{sp}$ penalty with a 130 s dump is
**7.4 s**. *(Registered as `13.T1a`–`13.T1c`.)*

### Requirement by requirement

| requirement | ORSC at 150 bar | why it passes |
|---|---|---|
| **1.0 MN SL** | 11.6 MW shaft, $\pi_t = 1.35$ | mid-range; BE-4 is 2,460 kN in this cycle [claim] |
| **25 flights between overhauls** | de-rated $p_c$, hydrostatic bearings, methane | creep is exponential in $T$; 150 bar is where you buy life |
| **Throttle to 40 %** | flown precedent: BE-4 40–100 %, RD-191 **27–105 %** | ORSC has the best flown deep-throttle record after tap-off |
| **≥3 restarts per flight** | **head-pressure start** | tank pressure spins the turbine; no cartridge, no spin bottle, no per-restart consumable [_verify-liquid] |
| **9 engines per vehicle** | single shaft, single preburner | part count per engine is the cost driver ×9; also 9 engines means engine-out capability, which argues against exotic single-point cycles |
| **First flight in 6 years** | aggressive but precedented | BE-4 (first US ORSC) is the risk case: it ran ~5 years late |
| **≤1.5× Merlin recurring cost** | the binding constraint | one preburner, one shaft, one turbine, one igniter set — the cheapest closed cycle there is |

### Why not the others

**(a) Gas generator.** The cheapest and fastest to develop, and it is the wrong
answer against the *life* requirement, not the performance one. The 7.4 s
penalty computed above is survivable; what is not survivable is that an open
cycle at 120 bar puts you at the very top of the flown open-cycle band — where
Eq. 3.4 is already biting — while giving you no help at all on the thing the
requirement actually asks for. Reuse is governed by turbine and bearing life,
and a GG turbine runs at **1,050 K** where the ORSC turbine runs at **750 K**.
Twenty-five flights on an uncooled nickel-superalloy blade at 1,050 K is an
inspection regime, not an engine. **A candidate answer that recommends (a) can
still earn full marks** if it argues that 25 flights is achievable with a
generously de-rated GG (say 90 bar) plus scheduled turbine replacement, and
prices that inspection burden explicitly — but it must confront the burden, not
ignore it.

**(c) Full-flow staged combustion.** The best answer on paper and the wrong
answer against *this* schedule and *this* cost cap. FFSC's two structural
advantages are real and both are reuse arguments — lowest turbine temperature
for a given power, and no interpropellant seal — and methane genuinely enables
it, because methane does not coke at fuel-rich preburner temperatures where
kerosene does. But: two preburners, two igniters, two turbopumps, two hot-gas
circuits, **both** the oxygen-rich metallurgy of §3.11 *and* the fuel-rich
turbine metallurgy of §3.10 in the same engine, and a two-shaft speed-
coordination control problem. It is the most complex chemical rocket engine
architecture ever built. **Only one FFSC engine has ever flown**; the RD-270
(1960s) and the IPD (2000s) both stopped at test. Against a six-year schedule
and a 1.5× Merlin cost cap this is not a close call.

**(d) Expander bleed on methane.** The interesting rejection, because the naive
check *passes* and you have to know why that is not enough. Run the WE2 heat
model at 1 MN and $p_c = 60$ bar ($\dot m = 309$ kg/s, $\dot m_f = 67.2$ kg/s,
$A_t = 0.0942$ m², $D_t = 0.346$ m): $q_t = 56.4$ MW/m², $Q = 81.9$ MW, and at
$c_p \approx 3{,}500$ J/(kg·K) the bulk rise is ~348 K — plenty of enthalpy, and
far below methane's ~800 K coking limit. The cycle does not fail on heat
availability. It fails on four other things:

1. **The heat model does not transfer.** The 15.4 $A_t$ flux-weighted area came
   from a hydrogen upper-stage chamber at $\varepsilon_c = 3$ with a bell to
   $\varepsilon = 8$. A sea-level booster chamber in a nine-engine cluster has a
   different contraction ratio, a much shorter relative bell and, critically,
   film cooling — which is heat you deliberately do *not* put into the coolant.
2. **Methane's $c_p$ is not a constant near the pseudo-critical line.** For
   hydrogen above ~15 bar $c_p$ is well-behaved; for methane near its critical
   point it is not, and the excursion sits exactly where a 60 bar jacket
   operates. A power cycle whose gain is a strong function of an ill-conditioned
   property is a development programme, not a design.
3. **Jacket $\Delta p$.** Scaling from WE2 Case A ($\Delta p_j \propto D_t$,
   30 bar at $D_t = 0.129$ m) gives roughly **80 bar** at $D_t = 0.346$ m —
   pushing pump discharge past 150 bar for a **60 bar** chamber, i.e. the WE2
   Case B pathology arriving at a booster.
4. **60 bar is the wrong chamber pressure for a booster.** A big throat means a
   poor area ratio inside a nine-engine base, and the $I_{sp}$ deficit against
   150 bar is far larger than the 7.4 s the gas generator was rejected over.

Add that **no methane expander of any kind has ever flown**, and the published
analyses put methane closed-expander feasibility at 100–150 kN — an order of
magnitude below the requirement (§3.7).

### The strongest objection to the recommendation, and the answer

**Objection: the oxygen-rich hot-gas materials problem, over 25 thermal
cycles.** Hot, high-pressure, oxygen-rich gas *ignites* nickel and iron alloys —
not slow oxidation, ignition, self-sustaining, consuming the part. The defence
is an inert passivating enamel on every wetted surface plus an
oxygen-cleanliness discipline that is a manufacturing culture, and the West took
thirty years to reproduce it; the first US ORSC engine flew in **January 2024**.
Asking that coating system to survive 25 start/stop thermal cycles per overhaul
interval, where a coating spall is a fire rather than a degradation, is asking
it to do something for which no public life data exists.

**The answer, in three parts.** **(i)** Every closed cycle that meets the life
requirement needs this technology; FFSC needs it *plus* fuel-rich turbine
metallurgy. There is no closed-cycle path that avoids it, so the choice is
between solving it once and solving it twice. **(ii)** De-rating is exactly the
mitigation: 150 bar rather than 267 bar drops the oxygen partial pressure in the
hot-gas circuit and the turbine inlet temperature together, and the ignition
threshold falls sharply with oxygen partial pressure — so the de-rate is not
merely a life choice, it is a *safety-margin* choice against the specific
failure mode the objection names. **(iii)** BE-4 is the existence proof at
140 bar on methalox, in service.

### The one piece of information I would most want before freezing

**Demonstrated cycles-to-failure of the ox-rich coating system at the intended
turbine inlet temperature and oxygen partial pressure.** Everything else in this
trade can be estimated from published data or first principles; that number
cannot, it is the technology's crown jewel, and **the entire 25-flight business
case rests on it.** If it comes back at 8 cycles rather than 40, the
architecture collapses back to a de-rated gas generator with scheduled turbine
replacement, and I would rather learn that in year one than in year five.

*(An answer naming instead "the vehicle's $\partial(\$/\text{flight})/\partial
I_{sp}$ versus $\partial(\$/\text{flight})/\partial(\text{engine cost})$"
earns equal credit — it is the item that decides (a) versus (b), and a candidate
who can defend either choice of decisive unknown has understood the trade.)*

### Rubric — 100 points

| # | criterion | pts |
|---|---|---|
| 1 | **Recommendation stated unambiguously**, naming the cycle *and* a chamber pressure, with the de-rate identified as a deliberate life choice | 10 |
| 2 | **Quantitative power balance** for the recommended cycle (shaft power and $\pi_t$ or $f_{gg}$) *and* for at least one rejected candidate, with units | 20 |
| 3 | **Every requirement addressed explicitly**: life 5, throttle 4, restart 4, engine count/cluster 3, schedule 5, cost 4 | 25 |
| 4 | **Each of the three rejected candidates rejected on its own strongest ground** — not a generic "too complex" | 15 |
| 5 | **Strongest objection to the recommendation named and answered** with a mechanism, not a reassurance | 10 |
| 6 | **One decisive unknown named**, and it is genuinely decision-changing | 10 |
| 7 | **Epistemic hygiene**: BE-4/Raptor/Archimedes figures labelled as claims; no numbers quoted that the sources do not publish; $p_c$ convention or T/W-basis caveat noted where used | 10 |

**Loses marks for:**

- Recommending (c) on performance grounds without confronting the six-year
  schedule and the 1.5× cost cap — this is the single most common failure, and
  it caps the answer at 60.
- Recommending (a) without addressing 25-flight turbine life at 1,050 K.
- Rejecting (d) with "methane expanders don't work" and no arithmetic. The heat
  check *passes*; the answer must know why that is not sufficient.
- Any answer that quotes a chamber pressure, $I_{sp}$ or T/W for Raptor, BE-4 or
  Archimedes as though it were verified.
- Any answer with no named risk, or with a "risk" that is not specific to the
  recommended architecture.
- Treating $I_{sp}$ as the objective function. The word "reusable" appears in
  the requirement and 3–8 s does not.

**Full marks are available for a recommendation of (a) or (c)** provided the
answer confronts the requirement it is trading away and prices it: (a) with a
costed inspection and turbine-replacement regime, or (c) with an explicit
argument that FFSC's life advantage justifies the schedule risk plus a staged
mitigation — for example a single-preburner ORSC first block with an FFSC
upgrade path, which is a genuinely defensible programme structure. **(d) cannot
earn full marks** at 1 MN; the best it can earn is 70, for an answer that
identifies the jacket-$\Delta p$ and pseudo-critical-$c_p$ objections itself and
recommends it anyway with a demonstrator plan.

---

## K4. Common wrong answers, and what they reveal

**"Closing the cycle raises the turbine pressure ratio, because the pressures
are higher."** Almost every student says this once. Closing the cycle raises
both the turbine inlet *and* the turbine outlet pressure, and the outlet rises
from ~3 bar to $p_c + \Delta p_{inj}$ — a factor of fifty — while the inlet
rises only to a little above that. **$\pi_t$ is a ratio, and it collapses.**
Reveals that the student is tracking absolute pressures rather than the
quantity the equation actually contains.

**"The gas generator's loss is incomplete combustion."** No: the GG burns its
propellant perfectly well. The loss is that the products expand through a small
dump nozzle at $\varepsilon \approx 2$–6 instead of through the main nozzle, so
they deliver 100–200 s instead of 300–450 s. Students who believe the
combustion story then propose "fixing" it by running the GG closer to
stoichiometric — which raises $T_t$ past the blade limit and destroys the
turbine while changing the $I_{sp}$ penalty hardly at all.

**Quoting a cycle penalty without stating the exhaust-recovery assumption.**
Q4 makes this unmissable: the *same engine* loses 10.9 s or 6.0 s depending
only on whether the dump gets a nozzle. The "3–8 s" in every textbook is one
calculation with different assumptions, not a spread across engines. A number
without its assumption is not an answer.

**Dividing by the main-chamber flow instead of the total flow.** Both when
computing $f_{gg}$ and when computing delivered $I_{sp}$. It always flatters the
engine, by roughly the size of the effect being measured. Reveals that the
student has not internalised that the vehicle is charged for every kilogram
that leaves the tanks, whether or not it passes through the throat.

**"The expander cycle is limited to about 300 kN because heat pickup scales as
$D^2$ and thrust as $D^3$."** Wrong twice over, and repeated in a great deal of
secondary literature. **Thrust scales as $D_t^2$ at fixed $p_c$**, not $D^3$ —
it is proportional to throat area. And the actual scaling (Eq. 3.8) is a weak
$p_c^{-1.2}D_t^{-0.2}$: going from 100 kN to 1 MN costs only 21 % of margin on
that term alone. The real mechanism is the **jacket pressure drop's feedback
into pump discharge**, which is why WE2 has to be solved as a fixed point and
why the answer is a 248 bar pump on a 40 bar chamber. Reveals a student who has
memorised a conclusion instead of a mechanism — and the conclusion happens to
be roughly right, which is why the error survives.

**Treating turbine inlet temperature as a free parameter.** Students raise
$T_t$ to 1,500 K to shrink $f_{gg}$ and do not notice that rocket turbine blades
are **uncooled** — no film cooling, no thermal barrier coating in the classical
designs — so 900–1,200 K is a metallurgical fact, not a convention [SP-8110]. In
an expander the error is worse and the opposite: $T_t$ is not chosen *at all*,
it is **computed** from the heat balance (Eq. 3.7). A student who "chooses" an
expander's turbine inlet temperature has not understood which cycle they are
analysing.

**Putting BE-3PM and BE-3U in the same row of a table.** They share a
manufacturer, a designation and a propellant combination, and nothing in the
power cycle: **BE-3PM is tap-off, BE-3U is expander bleed** [_verify-liquid §19].
The same trap is set by YF-75 (gas generator) and YF-75D (closed expander), and
by LE-5A and LE-5B, which *are* the same cycle but with different heat circuits
(nozzle-and-chamber versus chamber only) worth ~5 s. Reveals a student
classifying by name rather than by where the turbine gets its gas.

**"Oxidizer-rich staged combustion is used because oxygen-rich gas burns
cooler."** A consequence mistaken for a reason. The reason is **mass flow** —
oxygen is 72 % of a kerolox engine's mass — reinforced by the fact that a
fuel-rich kerosene preburner would coke a closed circuit shut regardless. If
cool gas were the objective there are far cheaper routes than solving the
hot-oxygen metallurgy problem, which is the most expensive materials programme
in the history of liquid propulsion.

**"Electric pumps have no cycle penalty, so they are strictly better."** They
have no $I_{sp}$ penalty and a large *mass* penalty, and the rocket equation
charges very differently for the two: the gas generator's payment is **consumed**
and sits in $m_0$; the battery's is **carried** and sits in $m_f$. WE4 makes it
concrete — 4.9 % of propellant mass in batteries costs 500 m/s of stage
$\Delta v$ despite an 8.7 s better $I_{sp}$. Reveals a student comparing
efficiencies rather than masses, which is the same error as Rocket Lab's
"95 % versus 50 %" claim (C8).

**Comparing a component efficiency with a thermodynamic efficiency.** The
95 %/50 % comparison is the famous instance, but it recurs everywhere: pump
efficiency against turbine efficiency, $\eta_{c^*}$ against $\eta_t$, "engine
efficiency" against anything. Always ask what is in the numerator, what is in
the denominator, and whether the two quantities are even the same kind of
thing.

**Using a battery's *rated* specific energy.** 180–250 Wh/kg is a cell
datasheet number at a modest discharge rate. A 150-second rocket burn is a
~20 C discharge; add depth-of-discharge limits, packaging, wiring, bus bars,
connectors and thermal management and the *usable* figure is roughly half —
110 Wh/kg. A student who uses 220 Wh/kg gets a battery half the right size and
concludes that electric pumps scale, which is the wrong conclusion from the
right equation.

**Quoting an unflown or unverified engine figure alongside flight data.**
RD-0146's 470 s next to RL10B-2's 465.5 s; every Raptor number; BE-3U's thrust
quoted as a single value when 711.5 / 889.5 / 941.5 kN all circulate; the
RD-170's turbopump power quoted to two significant figures when the same
article gives 170 MW in one place and 192 MW in another; the F-1's chamber
pressure quoted as one number when four are in circulation. **There is no
independent verification of Raptor's chamber pressure, $I_{sp}$, dry mass or
thrust-to-weight at all** [_verify-liquid §4]. Presenting one number without its
provenance is the failure mode this course exists to prevent.

**Quoting a thrust record or a thrust-to-weight without saying which quantity.**
The **RD-170 produces more total thrust** (7,900 kN vacuum) across **four**
chambers; the **F-1 remains the highest-thrust single-chamber engine** ever
flown. Both statements are true and they are not the same statement
[_verify-liquid §20]. Likewise the RS-25 is 73.1:1 on a 7,004 lb bare mass and
~66:1 on the manufacturer's 7,775 lb installed mass, and Rutherford's 72.8:1
**excludes the batteries** — which, for the electric cycle, is the whole
criticism [_verify-liquid §3].

**Assuming the fuel pump dominates the power budget.** It does on hydrogen —
N3 has the LH₂ pump taking 87 % of the shaft power, N6 has it at 73 % — and it
does **not** on kerolox, where WE1's oxidizer pump takes 60 % because it moves
2.35 times the mass. On methalox (N1) it is nearly even, at 48 % fuel, because
methane's low density offsets its low mass fraction. **Density, not mixture
ratio, decides**, and the answer is different for every propellant combination.
