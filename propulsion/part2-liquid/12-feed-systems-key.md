# Module 12 — Feed Systems and Turbopumps — Answer Key

Constants: $g_0 = 9.80665$ m/s², $R_u = 8314.46$ J/(kmol·K),
$R_{\mathrm{He}} = 2\,077.3$ J/(kg·K), $R_{\mathrm{N_2}} = 296.8$ J/(kg·K).
All numbers reproduced by `tools/examples/12.py`.

---

## K1. Problem solutions

### Conceptual

**C1.** *(i) From Module 07:* the injector pressure drop is the loop gain that
decouples the chamber from the feed system. $\Delta p_{\text{inj}}$ is the
resistance that makes chamber-pressure perturbations feed back weakly to the
flow; below roughly 10 % of $p_c$ on a liquid circuit the combustion time lag
and the feed-line inertia close a low-frequency loop and the engine chugs.
Removing the drop entirely guarantees instability. *(ii) From this module:*
the drop is also what makes the flow *insensitive* to upstream pressure. With
$\dot m \propto \sqrt{\Delta p}$, a 25 % injector drop means a 1 % tank
pressure error moves flow by about 2 %; with a 2 % drop the same error moves
flow by 25 %. You would also lose all atomisation quality — injection velocity
scales as $\sqrt{\Delta p/\rho}$ — so $\eta_{c^*}$ collapses and you lose more
performance than the tank mass was worth. Bonus credit for noting that the
tank saving is illusory anyway: you would have to raise $p_c$ or accept lower
$c^*$, and the tank scales with $p_c$ either way.

**C2.** Euler: $H = u_2c_{u2}/g_0$ — head, not pressure, and no density
appears. The pressure rise is $\Delta p = \rho g_0 H$. To make the same
$\Delta p$ on LH₂ ($\rho = 70.8$) as on LOX ($\rho = 1\,140$) needs
**16.1 times the head**, hence $\sqrt{16.1} = 4.0$ times the tip speed
(since $u_2 = \sqrt{g_0H/\psi}$), and — through $N_s$ and the very different
volumetric flows — a much higher shaft speed. The two resolutions:
**(a) a gearbox** — one turbine, two shaft speeds: **RL10** (LH₂ pump
~31 000 rpm geared down to the LOX pump); **(b) two independent turbopumps** —
**J-2** (fuel 27 000 rpm, oxidiser 8 600 rpm) or **RS-25** (HPFTP 35 360 rpm,
HPOTP 28 120 rpm). Full credit requires naming both the equation and one
engine per architecture.

**C3.** **The helium tank at 2.5 bar almost certainly has more NPSH.** In the
autogenous saturated tank, $p_t = p_v$ by definition, so the pressure term of
Eq. 3.15 is $-\Delta p_{\text{line}}/(\rho g_0)$ — *negative*. All its NPSH
comes from $z\,a/g_0$. In the helium tank the term is
$(2.5\ \text{bar} - p_v - \Delta p_{\text{line}})/(\rho g_0)$, which is
positive provided the liquid is subcooled. **The information that settles it:
the liquid bulk temperature** (equivalently, its subcooling below saturation
at the local pressure), for both tanks. If the "helium" tank's liquid has
warmed to saturation at 2.5 bar, the two are equally bad. This is exactly why
propellant thermal conditioning is a feed-system requirement and not a
storage detail.

**C4.** They are doing different jobs. The **main impeller** is trying to
impart whirl — the head it makes is $u_2c_{u2}/g_0$, so it wants $c_{u2}$
large, which means a blade angle far from tangential (20–35°) and high blade
loading. The **inducer** is trying to survive cavitation while making a small
amount of head. A shallow blade angle (6–12° at the tip) means low incidence,
low blade loading, low suction-surface velocity peak, and a long thin passage
in which an attached sheet cavity can close before it blocks the throat. The
inducer is deliberately operated with a stable cavity; a highly loaded blade
cannot be, because its suction peak is far below the mean and the cavity
grows until it chokes.

**C5.** *(i) The pressure ratio is enormous.* With $\pi_t = 30$ the isentropic
spouting velocity $C_0 = \sqrt{2\Delta h_{is}}$ exceeds 1 500 m/s, so
$U/C_0 = 0.45$ would demand a blade speed of ~700 m/s, far beyond any
uncooled superalloy disc. *(ii) Mass.* Getting closer to optimum would require
more stages (velocity compounding beyond two rows) or a larger diameter, both
of which cost mass on a component whose whole purpose is to be light. So the
designer accepts $U/C_0 \approx 0.2$–$0.3$ and $\eta_t \approx 0.6$, and pays
for it in a slightly larger gas-generator flow. **A staged-combustion turbine
does not have the problem** because its exhaust goes into the main chamber, so
$\pi_t$ is only 1.3–2.0, $C_0$ is a few hundred m/s, and $U/C_0$ near optimum
is reachable at ordinary blade speeds — hence $\eta_t = 0.75$–$0.85$.

**C6.** In a fuel-rich single-shaft engine the turbine gas is hot and
fuel-rich, and it sits on the same shaft as a liquid-oxygen impeller. The
interface must be a multi-element seal with a purged, drained cavity, because
a leak puts hot fuel-rich gas into liquid oxygen. In an **oxidiser-rich**
engine the turbine gas is oxygen-rich — chemically the same family as the
fluid the LOX pump is pumping — so a leak across that interface mixes oxygen
with oxygen. **The interpropellant hazard on the turbine end is removed by
construction**, which is what makes a single shaft viable at 267 bar. The
enabling technology is the **inert enamel coating applied to every metal
surface in the hot oxygen path** [_verify-liquid], without which the turbine,
manifolds and ducts would ignite. Credit for noting this transforms a
mechanical problem into a materials problem, and that BE-4 followed the same
route.

**C7.** *(i) Frequency ratio and its behaviour with speed.* Rotating
cavitation appears at roughly 1.1–1.3× shaft speed (super-synchronous) or in
the 0.5–0.9 band, but it **tracks NPSH**: change the inlet pressure at
constant speed and the line moves or disappears. Subsynchronous whirl sits
near a rotor natural frequency and therefore **does not track shaft speed**
proportionally; it appears above a **power** threshold and stays near the
rotor mode. *(ii) Location and correlated instrument.* Rotating cavitation
shows most strongly on the **pump inlet pressure transducer** and on inducer
blade strain, and correlates with inlet conditions; whirl shows on
**proximity probes at the bearings** as a growing orbit and correlates with
discharge pressure/power. Either observation alone is decent; both is a full
answer. A third acceptable discriminator: throttle the inlet valve at constant
speed and power — cavitation phenomena respond, whirl does not.

**C8.** Any three of: **(i) Reliability and failure-tree simplicity** — no
rotating machinery, no start transient, no bearings or seals to fail; *Apollo
SPS*, which had to work after a week in space with the crew's lives on it.
**(ii) Restart count and long duty cycles** — a pressure-fed engine restarts
by opening a valve; *Shuttle OMS*, certified for 1 000 starts and 15 h of
burn across 100 missions. **(iii) Development cost and schedule** — a
turbopump is the long pole in any engine programme; *Aestus*, whose pump-fed
successor RS-72 was built and never flew. **(iv) Deep throttling without a
pump to re-match** — *LMDE*, 10:1 chamber pressure turndown. **(v) The total
impulse is small enough that Eq. 3.10 favours pressure feeding anyway** —
*SuperDraco*, 1 388 kg of propellant and a 25 s burn.

---

### Calculation

**N1.**
Fuel: $10 + 0.22\times10 + 1.5 + 0.8 + 0.4 = \mathbf{14.9}$ bar,
$p_t/p_c = \mathbf{1.49}$.
Oxidiser: $10 + 2.2 + 0.8 + 0.4 = \mathbf{13.4}$ bar,
$p_t/p_c = \mathbf{1.34}$.
The 1.5 bar difference is the cooling jacket, and it is why one regulated
pressure plus an oxidiser-side trim orifice is the standard arrangement.

**N2.** $p_t = 14.9$ bar (regulate both tanks at the fuel-side value),
$V = 3.4$ m³.
(a) $m_{\mathrm{He,ideal}} = \dfrac{1.49\times10^6\times3.4}{2077.3\times300} = \mathbf{8.13\ kg}$
(b) $\times 1.4 = \mathbf{11.38\ kg}$
(c) nitrogen: $R = 296.8$, so $m = \mathbf{56.90}$ kg ideal, $\mathbf{79.65}$ kg
with the same collapse factor — **exactly 7.00× the helium**, the molar-mass
ratio.
(d) helium at 500 K: $m_{\text{ideal}} = \mathbf{4.88}$ kg,
$\times1.4 = \mathbf{6.83}$ kg — a **40 % saving** for the cost of a heat
exchanger. Note the collapse factor would in reality also change (hotter
incoming gas cools more, so $Z_c$ rises); using the same 1.4 is optimistic and
a strong answer says so.

**N3.** $BR = 2.5$, $n = 1$, $V_{\text{prop}} = 0.8$ m³.
$V_{u,i}/(V_{u,i}+V_{\text{prop}}) = 1/BR = 0.4$, so
$V_{u,i} = \dfrac{0.4}{0.6}\times0.8 = \mathbf{0.533\ m^3}$ and total tank
volume $= \mathbf{1.333\ m^3}$ — **67 % larger than the propellant**.
$p_i = 2.5\times14 = \mathbf{35\ bar}$.
$F_f/F_i \approx p_f/p_i = 1/2.5 = \mathbf{0.40}$: thrust falls by 60 % across
the burn. Full credit requires noting that the tank is designed for 35 bar and
1.33 m³, so its mass is $2.5\times1.67 = 4.2$ times that of a regulated tank
at 14 bar — which is the reason blowdown ratios above ~2.5 are rare.

**N4.** $\Delta p = (172-3.2)\times10^5 = 1.688\times10^7$ Pa.
$H = \dfrac{1.688\times10^7}{810\times9.80665} = \mathbf{2\,125\ m}$;
$Q = 42/810 = \mathbf{0.05185\ m^3/s}$;
$P = \dfrac{42\times1.688\times10^7}{810\times0.68} = \mathbf{1.287\ MW}$.
$\omega = 24\,000\times2\pi/60 = 2\,513.3$ rad/s;
$N_s = \dfrac{2513.3\sqrt{0.05185}}{(9.80665\times2125)^{3/4}} = \mathbf{0.330}$.
**One stage is marginal.** $N_s = 0.33$ is at the low edge of the usable
radial band; the impeller will be narrow ($\phi$ small), disc friction will be
a large fraction of the power, and 0.68 efficiency is about the best you
should expect. Splitting into two stages gives
$N_s = 0.330\times2^{3/4} = \mathbf{0.555}$, squarely in the efficient band —
recommend two stages unless mass or length forbids it.

**N5.** $\psi = 0.52$:
$u_2 = \sqrt{9.80665\times2125/0.52} = \mathbf{200.2\ m/s}$,
$D_2 = 2u_2/\omega = \mathbf{159.3\ mm}$.
$c_{m2} = Q/(\pi D_2 b_2) = 0.05185/(\pi\times0.1593\times0.006) = \mathbf{17.27\ m/s}$,
so $\phi = 0.086$ — low, consistent with the low $N_s$.
$c_{u2} = 0.86\times200.2 - 17.27/\tan28° = 172.2 - 32.5 = \mathbf{139.7\ m/s}$.
$H_{\text{Euler}} = 200.2\times139.7/9.80665 = \mathbf{2\,852\ m}$, so
$\eta_h = 2125/2852 = \mathbf{0.745}$.
**Feasible, but poor.** A hydraulic efficiency of 0.745 against an overall
0.68 leaves only 0.91 for leakage and disc friction, which is tight but not
impossible. The design is telling you the same thing $N_s$ did: the passage is
too narrow. Widening $b_2$ raises $\phi$ and $\eta_h$ but lowers head; the real
fix is two stages.

**N6.** $\omega = 26\,000\times2\pi/60 = 2\,722.7$ rad/s.
$$\mathrm{NPSH_a} = \frac{3.2\times10^5-0.74\times10^5-0.30\times10^5}{1140\times9.80665} + 4.5\times2.0 = 19.32+9.00 = \mathbf{28.32\ m}$$
Required suction specific speed:
$$N_{ss} = \frac{2722.7\sqrt{0.085}}{(9.80665\times28.32)^{3/4}} = \mathbf{11.67}$$
**Not achievable.** A good rocket inducer reaches 7–10; 11.67 is above
anything reliably demonstrated on oxygen, and even if the *head-loss*
criterion could be met there the pump would be operating inside the
rotating-cavitation regime. Maximum shaft speed at a defensible $N_{ss} = 8$:
$$\omega_{\max} = \frac{8(9.80665\times28.32)^{3/4}}{\sqrt{0.085}} = 1\,866.8\ \mathrm{rad/s} = \mathbf{17\,827\ rpm}$$
(At an aggressive $N_{ss} = 10$: 22 283 rpm — still below 26 000.) The design
must slow down, raise tank pressure, or add a boost pump.

**N7.** $R = 8314.46/15.5 = 536.4$ J/(kg·K);
$c_p = 1.26\times536.4/0.26 = 2\,599.6$ J/(kg·K); $\pi_t = 55/2.2 = 25.0$;
$(\gamma-1)/\gamma = 0.2063$, $\pi_t^{-0.2063} = 0.5147$, so
$1-\pi_t^{-(\gamma-1)/\gamma} = 0.4853$.
$$\dot m_t = \frac{8.4\times10^6}{0.58\times2599.6\times1050\times0.4853} = \mathbf{10.93\ kg/s}$$
Fraction of engine flow: $10.93/320 = \mathbf{3.42\ \%}$. That is at the high
end of the 2–4 % gas-generator band, driven by the modest $\eta_t = 0.58$ and
the fairly high back pressure (2.2 bar). Dropping the exhaust to 1.2 bar would
raise the available work by about 10 % and save roughly 1 kg/s.

**N8.** $s = 1/3$ at constant $p_c$ and constant $N_s$, so $H$ is unchanged.
- Shaft speed: $\times s^{-1/2} = \times1.732$ → $\mathbf{41\,569\ rpm}$.
- Impeller diameter: $\times s^{1/2} = \times0.577$ → $159.3\to\mathbf{92.0\ mm}$.
- Tip speed: **unchanged**, 200.2 m/s (because $H$ and $\psi$ are unchanged).
- Shaft power: $\times s$ → $\mathbf{0.429\ MW}$.
- NPSH required: **unchanged**, because $\omega\sqrt Q$ is invariant
  ($1.732\times\sqrt{1/3} = 1.000$).
**Two are unchanged — tip speed and NPSHr — and both for the same reason:
they depend on head and on $\omega\sqrt Q$, neither of which this scaling
touches.** The practical consequence is that the small engine needs the same
tank pressure and the same suction hardware as the large one.

**N9.**
| engine | power | thrust (SL) | W/N |
|---|---|---|---|
| F-1 | 41 MW | 6 770 kN | **6.06** |
| RS-25 (HPFTP + HPOTP) | 53.05 + 17.34 = 70.4 MW | 1 860 kN | **37.8** |
| Merlin 1D | ~7.5 MW (company) | 845 kN | **8.88** |

Ordering: F-1 < Merlin ≪ RS-25. Two effects. **Chamber pressure**: pump power
scales roughly as $\dot m\,\Delta p \propto p_c^2A_t$ while thrust scales as
$p_cA_t$, so W/N rises roughly linearly with $p_c$ — F-1 at ~70 bar, Merlin at
97 bar, RS-25 at 206 bar. **Cycle and propellant**: the RS-25 is staged
combustion, so the pumps must overcome the preburner and turbine pressure
drops on top of the chamber pressure, and it pumps hydrogen, whose low density
demands enormous head. Both push the same way. A good answer notes that the
ratio 37.8/6.06 = 6.2 is larger than the pressure ratio 206/70 = 2.9, and
attributes the remainder to hydrogen and to staged combustion.

---

### Engineering reasoning

**R1.** Shaft speed 21 600 rpm = 360 Hz. The 180 Hz line is exactly
**0.5× shaft speed**.
- **Mechanism A: rotating cavitation / cavitation auto-oscillation in the
  inducer.** Sub-synchronous rotating cavitation typically appears in the
  0.5–0.9× band; auto-oscillation (surge) is usually much lower frequency,
  so the 0.5× ratio points at the rotating form. It would show most strongly
  on the **inlet** pressure transducer — which is where it is being seen.
- **Mechanism B: subsynchronous rotor whirl.** Also sub-synchronous, also
  power-dependent, and 0.5× is a classic whirl ratio (half-frequency whirl in
  a fluid-film-supported or seal-dominated rotor).
Both are consistent with "amplitude scales with power level", which is why the
observation does not discriminate.
**The measurement that settles it: throttle the pump inlet valve at constant
speed and constant power to vary NPSH.** A cavitation phenomenon moves in
frequency and amplitude, and disappears at high NPSH. Whirl does not care.
(Equally acceptable: proximity probes at the bearings — whirl produces a large
growing shaft orbit at 180 Hz, rotating cavitation produces a pressure field
with comparatively little shaft displacement.) Full credit requires naming the
frequency ratio and a *discriminating* test, not just listing both mechanisms.

**R2.** $\dot m = 30\,000/(320\times9.80665) = 9.56$ kg/s. With
$\rho_{\text{bulk}} = 1\,158$ kg/m³, $C_p = 2.81\times10^{-5}$ kg/J,
$\Delta p_t = 15.5$ bar, $m_0 = 25$ kg, $k_{TP} = 2\times10^{-5}$ kg/W,
$\eta_p = 0.70$:
$$t_{b,\text{crit}} = \frac{1158\times25}{2.81\times10^{-5}\times1.55\times10^6\times9.56} + 1.0 = 69.5 + 1.0 \approx \mathbf{70\ s}$$
The vehicle burns **900 s**, thirteen times the crossover. Propellant volume
is $9.56\times900/1158 = 7.43$ m³, so the pressurisation penalty is
$C_p\Delta p_tV = \mathbf{324\ kg}$ against a turbopump of perhaps 40–70 kg.
**The mass case says pump-fed, by roughly a quarter of a tonne.**

The reliability case, honestly: eight restarts and 900 s of cumulative burn on
a turbopump means eight start transients, each of which is the highest-stress
event in the machine's life — thermal shock to the bearings and seals, passage
through any critical speed, and an ignition sequence that must be right every
time. A pressure-fed engine's restart is a valve opening. The failure tree of
a pressure-fed storable system fits on one page and contains no rotating
parts, no interpropellant seal and no start transient. **The argument the mass
case cannot address** is that mass buys payload linearly while a turbopump
failure costs the whole mission — the two are not commensurable, and the
programme's risk posture, not Eq. 3.10, decides. This is exactly the Aestus
decision, and ArianeGroup made it in favour of pressure feeding for
twenty-one years despite having built the pump-fed alternative.

A strong answer states both, and commits: for eight restarts across a long
mission with a storable propellant, **pressure-fed is defensible even at
+324 kg**, and the discriminator is whether that 324 kg is affordable in the
vehicle's mass budget. If it is not, buy the turbopump and buy the test
programme that goes with it.

**R3.** **Mechanism: thermodynamic suppression head.** In water at room
temperature the vapour density is very low and the latent heat large, so
forming a cavity removes negligible energy from the liquid and there is no
temperature depression: cavitation is essentially isothermal. In liquid
hydrogen the density ratio $\rho_l/\rho_v \approx 53$ and $c_p/h_{fg} \approx
0.022$ K⁻¹, so vaporising a small volume cools the surrounding liquid
measurably, its vapour pressure falls, and the cavity is suppressed. The pump
behaves as though it had extra NPSH.

Magnitude: the deficit is $24 - 11 = 13$ m of apparent NPSH. With
$\mathrm{TSH} \approx (dp_v/dT)\Delta T/(\rho_lg_0) = 10.5$ m per kelvin for
LH₂ at 20.3 K, the implied local temperature depression is
$13/10.5 \approx \mathbf{1.2\ K}$ — entirely plausible.

**Why you would not certify on 11 m.** (i) The 3 % head-loss criterion is not
the cavitation-free criterion; rotating cavitation and blade fatigue can occur
at NPSH well above the head-loss knee [Brennen-Pumps], and the LE-7 failure
was a blade failure, not a head-loss event. (ii) TSH depends on the *bulk*
liquid state, so a warmer, more nearly saturated tank, or a stratified one,
gives less credit than the test. (iii) Thermal equilibrium between cavity and
liquid is an assumption that degrades at higher speed and shorter residence
time; the test point may not represent the flight point. **Certify on
demonstrated margin at the flight inlet condition with blade strain
instrumented, and carry the TSH as a validated credit, not a design margin.**

**R4.** Raising shaft speed 40 %:
- $N_s \propto \omega$ at fixed $H$ and $Q$: $0.19 \to \mathbf{0.266}$.
  Better, but still below the 0.3 threshold — the proposal does not actually
  solve the problem it was aimed at.
- $\mathrm{NPSH_r} \propto \omega^{4/3}$: $\times 1.4^{4/3} = \times\mathbf{1.57}$.
  A 57 % increase in suction requirement, which on almost any real design
  turns a marginal inducer into an inadequate one.
- $u_2$: head is unchanged, so $\psi = g_0H/u_2^2$ would fall by $1.4^2 = 1.96$
  if $D$ were held — meaning the impeller must **shrink** by $1/1.4$ to keep
  the same head, and the tip speed is **unchanged at 200 m/s**. If instead the
  diameter is held, head rises by 96 % and the engine's pressure schedule is
  wrong.
- **If the LOX pump is on the same shaft, it goes to 1.4× too**, and by
  Eq. 3.16 its own NPSHr rises 57 % — on the circuit that was already
  suction-critical (WE3). This is usually the killer.
**Alternative: split the fuel pump into two stages** at the *original* speed.
$N_s$ per stage rises by $2^{3/4} = 1.68$ to **0.32**, efficiency improves
several points, NPSHr is unchanged, tip speed per stage falls to
$1/\sqrt2 = 0.71$ of the original, and the LOX pump is untouched. The costs
are one more impeller, one more crossover passage and axial length. Recommend
staging. (Also acceptable: keep one stage and accept the efficiency, if the
extra 0.3 % of engine $I_{sp}$ is cheaper than the length and mass.)

**R5.** Chain of reasoning, quantitatively:
1. The inducer failed structurally under cavitation-driven loading (rotating
   cavitation produces a rotating pressure field that loads blades at a
   frequency unrelated to any designed-for excitation, driving high-cycle
   fatigue).
2. Cavitation severity is set by the **margin** $\mathrm{NPSH_a} -
   \mathrm{NPSH_r}$, with $\mathrm{NPSH_r} \propto (\omega\sqrt Q)^{4/3}$
   (Eq. 3.16).
3. Chamber pressure sets the pump discharge pressure and hence, at a chosen
   $\psi$ and $N_s$, the shaft speed: for a fixed pump geometry,
   $H \propto p_c$ and $\omega \propto \sqrt H \propto \sqrt{p_c}$.
   Simultaneously $Q \propto \dot m \propto p_c$.
4. Therefore $\mathrm{NPSH_r} \propto (\omega\sqrt Q)^{4/3} \propto
   (p_c^{1/2}\cdot p_c^{1/2})^{4/3} = p_c^{4/3}$.
5. Reducing $p_c$ from 12.7 to 12.0 MPa is a factor of 0.945, so
   $\mathrm{NPSH_r}$ falls by $0.945^{4/3} = 0.927$ — about **7 %** — while
   $\mathrm{NPSH_a}$ is essentially unchanged (the tank did not change).
   The *margin* therefore improves by more than 7 % in relative terms, and
   the cavity volume, blade loading and fatigue driver all fall with it.
6. The engine also gained margin from the redesigned inducer itself; the
   pressure reduction is the systems-level part of the fix, not the whole of
   it.
**The point of the case study** is that the programme accepted a permanent
performance reduction — the LE-7A makes less chamber pressure than its
predecessor — to buy turbopump margin, and published the reasoning. That is
rare and honest, and it is the correct response when the failure is a
*margin* failure rather than a defect.

---

## K2. Quiz answers

**Q1 (8).** $\Delta p = \rho g_0 H$.
(a) LH₂: $70.8\times9.80665\times1800 = 1.250\times10^6$ Pa = **12.50 bar**.
(b) LOX: $1140\times9.80665\times1800 = 2.012\times10^7$ Pa = **201.2 bar**.
Implication: **a single shaft carrying both impellers at one speed cannot
serve both propellants**, because the same head is worth 16 times more
pressure on oxygen than on hydrogen. Either the hydrogen pump is hopelessly
under-headed or the oxygen pump is grotesquely over-headed. Hence gearboxes
(RL10) or separate turbopumps (J-2, RS-25). *(4 pts for the two numbers,
4 for the implication.)*

**Q2 (8).** **(c).** NPSH is $(p_1 + \tfrac12\rho V_1^2 - p_v)/(\rho g_0)$.
With saturated vapour in the ullage, $p_t = p_v$ exactly, so the entire
pressure term of Eq. 3.15 reduces to $-\Delta p_{\text{line}}/(\rho g_0)$ —
negative — and all available NPSH comes from the $z\,a/g_0$ term.
(a) is wrong: chemical compatibility has nothing to do with cavitation.
(b) is wrong and is the central misconception of the module: NPSH depends on
$p_t - p_v$, not $p_t$. (d) is wrong: it is perfectly well defined, just
small.

**Q3 (12).**
$$m_{\text{ideal}} = \frac{2.2\times10^6\times5.0}{2077.3\times320} = 16.55\ \mathrm{kg}
\quad\Rightarrow\quad m = 1.45\times16.55 = \mathbf{24.0\ kg}$$
Bottle, at 290 K with real-gas correction:
$$\frac{m}{V_b} = \frac{1}{R_gT}\left(\frac{27.5\times10^6}{1.15}-\frac{2.6\times10^6}{1.01}\right)
= \frac{2.391\times10^7 - 2.574\times10^6}{602\,417} = 35.42\ \mathrm{kg/m^3}$$
$$V_b = \frac{24.0}{35.42} = \mathbf{0.677\ m^3} = 677\ \mathrm{L}$$
*(6 pts for the helium mass with the collapse factor applied to the correct
temperature; 6 for the bottle with both $Z$ corrections. Deduct 3 for using
$Z = 1$; deduct 3 for forgetting the residual gas at lockup.)*

**Q4 (10).** **(b).** With $\pi_t$ of 20–40 the isentropic spouting velocity
is well over 1 500 m/s, so the optimum $U/C_0 \approx 0.45$ would need blade
speeds no disc material survives; rocket GG turbines therefore run at
$U/C_0 \approx 0.2$–$0.3$, well down the efficiency parabola.
(a) is a real but second-order loss. (c) is real *when* partial admission is
used, and is a legitimate partial-credit answer, but it is a consequence of
the same small-flow/high-$\pi_t$ regime rather than the root cause, and many
GG turbines are full-admission. (d) is a real modelling difficulty for
fuel-rich kerolox gas but is not an efficiency loss mechanism.

**Q5 (12).** $\omega = 32\,000\times2\pi/60 = 3\,351.0$ rad/s.
$$\mathrm{NPSH_a} = \frac{2.8\times10^5-1.05\times10^5-0.25\times10^5}{1140\times9.80665}+3.0\times1.4 = 13.42+4.20 = \mathbf{17.62\ m}$$
$$N_{ss,\text{req}} = \frac{3351.0\sqrt{0.062}}{(9.80665\times17.62)^{3/4}} = \mathbf{17.5}$$
**Not feasible.** 17.5 is roughly double the best demonstrated rocket-inducer
suction specific speed on oxygen. Options, with numbers: slow to
$N_{\max} = \mathbf{14\,620\ rpm}$ at $N_{ss}=8$; or hold 32 000 rpm and raise
tank pressure to $\mathbf{6.43\ bar}$ (since $\mathrm{NPSH_r} = 50.1$ m at
$N_{ss}=8$); or add a boost pump, which is the only option that keeps both the
speed and the tank pressure. *(4 pts NPSHa, 4 pts $N_{ss}$, 4 pts for a
correct feasibility verdict with at least one quantified fix.)*

**Q6 (10).** The RS-25's high-pressure pumps must run at 28 000–35 000 rpm to
make 206 bar chamber pressure on hydrogen and oxygen, and by **Eq. 3.16**
$\mathrm{NPSH_r} \propto (\omega\sqrt Q)^{4/3}$, which at those speeds far
exceeds anything the External Tank could supply at a tolerable ullage
pressure via **Eq. 3.15**. Interposing a slow boost stage (LPFTP 16 185 rpm,
LPOTP 5 150 rpm) raises the high-pressure pumps' inlet pressure so their
NPSHa is large, without pressurising the tank. The F-1 needs none because at
6 770 kN its flows are so large that **Eq. 3.14** gives an acceptable $N_s$ at
only 5 488 rpm; $\omega\sqrt Q$ is therefore low, $\mathrm{NPSH_r}$ is modest,
and a plain inducer plus ordinary tank pressure suffices. *(Full credit needs
the speed argument, the NPSHr scaling, and two equation numbers.)*

**Q7 (10).** $s = 200/800 = 0.25$ at constant $p_c$ and $N_s$.
| quantity | factor |
|---|---|
| shaft speed | $s^{-1/2} = \times\mathbf{2.0}$ |
| impeller diameter | $s^{1/2} = \times\mathbf{0.5}$ |
| tip speed | $\times\mathbf{1.0}$ (unchanged) |
| shaft power | $\times\mathbf{0.25}$ |
| NPSH required | $\times\mathbf{1.0}$ (unchanged) |
| required tank pressure | $\times\mathbf{1.0}$ (unchanged) |
*(1.5 pts each, 1 bonus for stating explicitly that the last three are
unchanged because $H$ and $\omega\sqrt Q$ are invariant under this scaling.)*

**Q8 (10).** **Subsynchronous whirl** (rotordynamic instability). Mechanism:
fluid cross-coupling forces in the seals and impeller act perpendicular to the
shaft's instantaneous displacement in the direction of whirl; above a power
threshold they exceed the available damping and the orbit grows at a
sub-synchronous frequency near a rotor natural frequency, ending in a rub.
Historical case: the **RS-25 (SSME) high-pressure fuel turbopump**, documented
in [Biggs89] and not fully retired until the Block II HPFTP first flown on
STS-104 in 2001. Fixes, any two: **damping (honeycomb or deliberately
roughened) seals** to convert cross-coupling into damping; **squeeze-film
dampers** at the bearing carriers; stiffer, better-aligned bearing supports;
reduced or re-profiled seal clearances; changing the operating speed range.
*(Naming "cavitation" loses the question: the 0.62× ratio with a power — not
inlet-pressure — dependence is the whirl signature.)*

**Q9 (10).** Any well-argued answer scores, but it must contain both sides and
a decision.
*For pressure feeding:* 40 restarts over five years of storage is 40 start
transients on a turbopump, each thermally shocking the bearings and seals and
passing through critical speeds, on a vehicle nobody can service. A
pressure-fed engine restarts by opening a valve; its failure tree contains no
rotating parts and no interpropellant seal. Five years of storage also means
five years of seal set and bearing preload relaxation on a pump, versus five
years of a helium bottle slowly leaking — a failure that is measurable and
budgetable.
*Against:* Eq. 3.10 gives $t_{b,\text{crit}}$ around 80–90 s at this scale, so
600 s of burn means a mass penalty in the low hundreds of kilograms; on a
servicing vehicle that is delivered $\Delta v$, i.e. missions. And the helium
system is not failure-free — it has a regulator, whose fail-open mode bursts a
tank and whose fail-closed mode ends the mission.
*Decision:* for **40 restarts across five years**, act on the reliability
argument and fly pressure-fed, with series-parallel regulators. The
discriminator that would change the answer is the $\Delta v$ budget: if the
mission cannot close with the extra tankage, the turbopump is not optional and
the answer becomes a test-programme question instead.

**Q10 (10).**
(a) The course requires that a contested figure be **presented with both
values and their provenance**, not silently reduced to one. Here:
"~170 MW in the article body, 192 MW in the specification table; the most
powerful rocket turbopump ever built either way, by roughly a factor of three
over the RS-25 HPFTP" [_verify-liquid §5].
(b) $170\times10^6/7.9\times10^6 = \mathbf{21.5\ W/N}$ (with 192 MW,
24.3 W/N). RE-500 from WE2: **6.34 W/N**.
(c) The ratio is about 3.4. Two causes, both large: **chamber pressure** —
the RD-170 runs 245 bar against RE-500's 100 bar, and pump power per unit
thrust rises roughly linearly with $p_c$ — and **cycle**: the RD-170 is
oxidiser-rich *staged combustion*, so the pumps must raise the propellant
above the preburner pressure *plus* the turbine pressure drop *plus* the main
injector drop, not merely above the chamber. A gas-generator engine's pumps
only have to beat the chamber; a staged-combustion engine's pumps have to beat
the whole hot-gas circuit. 100/245 accounts for a factor of 2.45; the
remaining 1.4 is the cycle.

---

## K3. Trade-study reference solution (T1)

**Recommendation: (B) — single-shaft oxidiser-rich staged combustion,
hydrostatic bearings, autogenous pressurisation with a helium start bottle.**

**Why, in order of weight.**

1. **The propellant density ratio permits a single shaft.** LOX (1 140) and
   LCH₄ (~423 kg/m³ at operating conditions) differ by ~2.7×, so the head
   requirements differ by the same factor and one shaft speed can serve both
   within a reasonable $\psi$ and $N_s$ range. This is the F-1/Merlin/BE-4
   situation, not the RL10/RS-25 situation. Ruling out the dual-shaft options
   on this ground alone is defensible.
2. **Oxidiser-rich removes the interpropellant seal from the turbine end**
   (§6.6), which matters enormously for a 50-flight life: the seal is
   otherwise the life-limiting item and the one whose failure is
   instantaneous.
3. **Hydrostatic bearings have no rolling contact and therefore no wear
   mechanism at speed** (§3.16). Their life is set by start/stop transients,
   which is exactly the right failure mode for a 50-flight engine, and it is
   why Blue Origin chose them for the BE-4. Rolling-element bearings in
   methane and oxygen at 150 bar over 50 flights would need an inspection
   regime the requirement forbids.
4. **Autogenous pressurisation deletes the helium system's mass and its
   regulator failure modes** on a booster that has abundant hot gas, and
   methalox is the one propellant combination where both tanks can be
   autogenously pressurised cleanly. A small helium bottle is still needed for
   start and for the landing restart, which is the honest caveat.
5. **150 bar is achievable oxidiser-rich with a five-year schedule** —
   BE-4 flies at 140 bar. It is *not* comfortably achievable full-flow in
   five years.

**Why not the others.**
- **(A)** Gas generator at 150 bar throws away 3–4 % of propellant on a
  booster whose whole economic case is reuse, and rolling-element bearings do
  not reach 50 flights without overhaul. It is the cheapest to develop and the
  worst against the stated life requirement.
- **(C)** Full-flow is the best answer on paper — no interpropellant seal on
  either shaft, coolest turbines, highest life — and the wrong answer against
  a five-year schedule. Two preburners and a two-loop start sequence is the
  hardest development problem in liquid propulsion; only one FFSC engine has
  ever flown and its development took roughly a decade.
- **(D)** Electric boost pumps are attractive (they decouple boost speed from
  the turbine entirely, as Rutherford shows) but on a 400 kN booster the
  battery mass for a full ascent burn is prohibitive, and it retains the
  gas-generator $I_{sp}$ penalty. A credible variant is (B) *with* an electric
  boost pump; award full credit for proposing it.

**The three quantities I would compute first.**
1. **NPSHa vs NPSHr for the LOX circuit across the whole flight box**,
   including the landing restart at low tank level and low acceleration —
   this decides whether boost pumps are needed and therefore whether the
   "single shaft" architecture survives contact with the vehicle.
2. **Turbopump shaft power and the resulting bearing DN and tip speed**, to
   confirm the hydrostatic bearing supply pressure is available from the pump
   discharge and that $u_2$ is inside the material limit with a 50-flight
   low-cycle-fatigue knockdown.
3. **Preburner and turbine inlet temperature with its circumferential
   spread**, because oxidiser-rich turbine life at 150 bar is governed by the
   enamel coating's temperature limit, and the spread — not the mean — is what
   kills blades.

**The single risk most likely to defeat it: the oxidiser-rich hot-gas
materials problem.** The enamel/coating technology that makes ORSC survivable
is the thing the West took thirty years to reproduce, and a coating failure in
an oxygen-rich turbine is not a degradation, it is a fire. If the coating
process cannot be qualified for 50 thermal cycles inside the schedule, the
architecture collapses back to (A).

**Rubric.**
- *Must contain:* a density-ratio argument for or against single shaft; a
  life argument connecting bearings and seals to the 50-flight requirement;
  an explicit schedule argument against full-flow; at least three quantified
  or quantifiable discriminators; a named dominant risk.
- *Full marks* also connect the pressurisation choice to the restart
  requirement (autogenous does not work before the engine runs, so a start
  bottle is mandatory) and note that NPSH margin at the **landing restart**,
  not at liftoff, is the binding case.
- *Loses marks for:* choosing (C) on performance grounds without confronting
  the schedule; choosing (A) without addressing the 50-flight bearing life;
  asserting that pressure feeding is "more reliable" without noting that at
  400 kN it is not an option at all (Eq. 3.10 gives a crossover of a few
  seconds); any answer that does not name a risk.
- *An answer recommending (C) can still earn full marks* if it argues
  explicitly that the schedule risk is worth taking for a 50-flight engine and
  proposes a mitigation — e.g. a single-preburner ORSC first block with an
  FFSC upgrade path.

---

## K4. Common wrong answers, and what they reveal

**"A pump raises pressure, so a bigger pressure rise needs a bigger pump."**
Reveals that Euler's equation has not landed. A pump raises *head*; pressure
rise is $\rho g_0H$. The consequence students miss is that the *same* pump on
a lighter fluid makes proportionally less pressure — which is the entire
reason hydrogen turbomachinery looks different from everything else.

**Computing NPSH as $p_t/(\rho g_0)$ and forgetting $p_v$.** Extremely common,
and it makes every self-pressurised system look fine. Students who do this
also miss that vapour pressure depends on the *liquid's actual temperature*,
not on the tank pressure — so a warm tank of LOX at 3 bar can have less NPSH
than a cold one at 2 bar.

**Using the US-unit specific speed formula with SI inputs (or vice versa).**
Produces answers off by a factor of 2 733 and, worse, produces answers that
*look* plausible if the student has only ever seen one convention. Any
specific speed near 2 000 is US; near 1 is SI. Always state which.

**Sizing the helium bottle with $Z = 1$ and no residual.** Two independent
errors that both go the same way, and together they typically under-size the
bottle by 20–25 %. In flight this is an engine that shuts down early with
propellant in the tanks.

**Applying the collapse factor to the bottle instead of the ullage.** The
collapse factor describes gas *in the propellant tank* cooling against cold
liquid and cold walls. It has nothing to do with the storage bottle, which
has its own (opposite-signed) adiabatic-cooling problem.

**Assuming the affinity laws preserve efficiency when scaling down.** They do
not: tip clearance, surface roughness and Reynolds number do not scale, so a
small pump is 3–6 efficiency points worse than the affinity laws promise.
Students who miss this under-predict small-engine turbine flow and therefore
over-predict small-engine $I_{sp}$.

**Concluding from Eq. 3.10 that pressure-fed systems are simply obsolete.**
The equation is a *mass* comparison. Aestus flew for twenty-one years at
29.6 kN and 1 100 s with a pump-fed successor sitting on the shelf. A student
who cannot articulate why has understood the algebra and not the engineering.

**Confusing rotating cavitation with subsynchronous whirl** because both are
"non-synchronous vibration". The discriminator is what they respond to:
cavitation phenomena respond to inlet pressure, whirl responds to power and
sits near a rotor mode. Getting this wrong on a test stand means fixing the
wrong hardware for six months.

**Treating turbine inlet temperature as a free parameter.** Students raise it
to 1 600 K to save gas-generator flow and do not notice that rocket turbine
blades are uncooled, that the duty cycle offers no time to develop a cooling
scheme, and that a fuel-rich gas generator at that temperature is approaching
mixture ratios where free oxygen appears. The 900–1 200 K band is a
metallurgical fact, not a convention.

**Quoting a single value for a contested figure.** The RD-170's turbopump
power, the F-1's chamber pressure, the RS-25's expansion ratio and every
Raptor number are contested or unverified. Presenting one number without its
provenance is the failure mode this course exists to prevent.
