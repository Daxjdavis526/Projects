# Part II Exam A — Answer key and grading rubric

Full worked solutions for [`exam-part2a.md`](exam-part2a.md). Every step carries
units. Every multiple-choice distractor is explained. Every question carries a
rubric.

All numbers below were computed with `tools/rocket.py` and are registered in
`tools/examples/exam-part2a.py`; run `python3 tools/check_examples.py` to
recompute them.

**Constants.** $g_0 = 9.80665\ \mathrm{m/s^2}$,
$R_u = 8314.46\ \mathrm{J/(kmol\,K)}$,
$\sigma_{SB} = 5.670374\times10^{-8}\ \mathrm{W/(m^2\,K^4)}$,
$p_a = 101\,325$ Pa at sea level.

**General grading rule** (course README): calculation questions are graded on
method first. A correct setup with an arithmetic slip loses at most 30 % of the
marks for that part. A correct number obtained from a wrong setup scores zero.
Missing units cost 1 mark per question, once, not per line. Failing to state
the pressure station where the question demands it costs 1 mark per question,
once.

**Epistemic labels** are the course's: [F] fundamental, [E] empirical,
[A] approximation, [J] judgment, [H] historical, [M] modern practice.

---

# Section A — Propellants (15 points)

## A1 — Multiple choice (4 points)

**Answer: (b).**

Methane's specific impulse advantage over RP-1 on a consistent basis is about
5 s — 360 s against 355 s at $\varepsilon = 40$ in the Module 05 §4.3 table,
computed on one basis with no combustion, divergence or boundary-layer
efficiency in it. That is inside the uncertainty of a preliminary design and
inside the spread between two CEA runs with different $\gamma$ conventions. What
is *not* marginal is the coolant chemistry: RP-1 must hold its coolant-side wall
below roughly **560–590 K** for long life (up to ~700 K for short-duration
expendable hardware), while methane cracks only above roughly **900–950 K**.
That ~350 K is what decides whether a 200–300 bar chamber can be regeneratively
cooled and reflown at all (Module 11 §3.10, §3.11), and it is the reason every
clean-sheet reusable hydrocarbon engine designed since 2010 chose methane.

**Second strongest reason: cryogenic commonality with LOX.** Methane's normal
boiling point (111.67 K) is within 21 K of LOX's (90.19 K), which gives one
cryogenic temperature regime, a common-bulkhead option, and — decisively for
turnaround — **autogenous pressurisation of both tanks, deleting helium** and
the scrubs and supply constraints that come with it. It is second rather than
first because it is a *vehicle* and *ground-system* advantage: it makes the
programme cheaper and more reliable, but it does not change whether the engine
can be built.

**Why each distractor is wrong.**

- **(a)** is factually wrong in the stated direction. Methane's $I_{sp}$ is
  slightly **above** RP-1's, not below. The objection to the press release is
  that the advantage is too small to be the reason, not that it has the wrong
  sign. This distractor catches students who remember "kerosene is denser"
  and convert density into performance.
- **(c)** is also factually wrong: LOX/RP-1 has the higher density impulse
  (≈364,000 against ≈297,000 kg·s/m³ in the §4.3 table). Methane is worse on
  both volumetric metrics than kerosene, which is exactly why the case for it
  must be made on something other than performance.
- **(d)** inverts a real fact. Methane **can** be tapped and heated to
  pressurise its own tank autogenously — that is one of its advantages, and it
  is the second reason above. A student choosing (d) has the right topic and the
  wrong sign.

### Rubric (4)

| | |
|---|---|
| 2 | correct choice (b) |
| 1 | justification that quantifies the $I_{sp}$ gap as small **and** names the coking / wall-temperature limit as the deciding property |
| 1 | a defensible second reason (cryogenic commonality with LOX, autogenous pressurisation and no helium; or soot-free turbine and injector face for reuse) with a reason for its ranking |

Answering (b) with a justification that is only "methane is better for reuse"
scores 2 of 4: correct choice, no mechanism.

---

## A2 — Ranking a candidate LOX/methane pair (7 points)

### (a) Gas properties and $c^*$ (2)

$$R = \frac{R_u}{\mathcal{M}} = \frac{8314.46}{21.8} = \mathbf{381.4\ J/(kg\,K)}$$

$$\Gamma(\gamma) = \sqrt{\gamma}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{2(\gamma-1)}}
= \sqrt{1.15}\left(\frac{2}{2.15}\right)^{7.1667} = \mathbf{0.6386}$$

$$c^* = \frac{\sqrt{R T_0}}{\Gamma} = \frac{\sqrt{381.40\times3565}}{0.63864}
= \frac{1166.05\ \mathrm{m/s}}{0.63864} = \mathbf{1825.8\ m/s}$$

### (b) Nozzle and vacuum $I_{sp}$ (2)

Inverting the area–Mach relation at $\gamma = 1.15$, $\varepsilon = 35$ on the
supersonic branch gives

$$M_e = \mathbf{3.888}$$

and the vacuum thrust coefficient (Module 03) is

$$C_{F,vac}(\gamma = 1.15,\ \varepsilon = 35) = \mathbf{1.9278}$$

$$I_{sp,vac} = \frac{c^* C_{F,vac}}{g_0} = \frac{1825.8\times1.9278}{9.80665}
= \frac{3519.9\ \mathrm{m/s}}{9.80665} = \mathbf{358.9\ s}$$

### (c) Bulk density and density impulse at NBP (2)

$$\rho_b = \frac{1+r}{\dfrac{r}{\rho_{ox}}+\dfrac{1}{\rho_f}}
= \frac{4.60}{\dfrac{3.60}{1141}+\dfrac{1}{422}}
= \frac{4.60}{3.1551\times10^{-3}+2.3697\times10^{-3}}
= \frac{4.60}{5.5248\times10^{-3}} = \mathbf{832.6\ kg/m^3}$$

$$I_d = \rho_b I_{sp} = 832.6\times358.9 = \mathbf{2.988\times10^{5}\ kg\,s/m^3}$$

### (d) Densified loading (1)

$$\rho_b = \frac{4.60}{\dfrac{3.60}{1256}+\dfrac{1}{439}}
= \frac{4.60}{2.8662\times10^{-3}+2.2779\times10^{-3}} = \mathbf{894.2\ kg/m^3}$$

$$I_d = 894.2\times358.9 = \mathbf{3.210\times10^{5}\ kg\,s/m^3},
\qquad \text{gain } \frac{894.2}{832.6}-1 = \mathbf{+7.40\ \%}$$

Note that the gain is exactly the bulk-density gain: $I_{sp}$ is unchanged by
subcooling, so **all** of the density-impulse benefit is tank volume.

### Sanity check and the honest caveat

Module 05 §4.3 lists LOX/CH₄ at $I_d \approx 297{,}000$ kg·s/m³ and
$I_{sp} \approx 360$ s at $\varepsilon = 40$; 298,800 kg·s/m³ and 358.9 s at
$\varepsilon = 35$ is the same answer, which is the check.

**What the comparison does not tell you.** $I_d$ is a *volume* efficiency
metric. It assumes tank and structural mass scale with volume, which is true
for a first stage inside a fixed-diameter vehicle and false for a stage whose
mass is dominated by a fixed engine and avionics allocation. It contains no
engine thrust-to-weight, no stage length (hence no bending, drag or transport
cost), no boil-off, no ground infrastructure and no reuse economics. **Never
present a density-impulse ranking as a propellant decision** — and note also
that the densified case buys 7.4 % of tank volume at the cost of subcoolers on
the ground, a load that warms during a hold, and a narrower launch window.

### Rubric (7)

| | |
|---|---|
| 1 | $R$ and $\Gamma$ correct |
| 1 | $c^*$ correct with the $\sqrt{RT_0}/\Gamma$ form shown |
| 1 | $M_e$ from the area relation (supersonic root) |
| 1 | $C_{F,vac}$ and $I_{sp}$ |
| 1 | $\rho_b$ from the correct mixture-ratio-weighted form (**not** a mass average of the two densities) |
| 1 | $I_d$ at NBP and the densified pair |
| 1 | sanity check against §4.3 **and** a correct statement of what $I_d$ omits |

Common fatal error: computing $\rho_b$ as $(\rho_{ox}+\rho_f)/2$ or as a
mass-weighted mean. That is a wrong setup and scores zero for parts (c) and
(d) even if the arithmetic is clean.

---

## A3 — Coking station and its instrumentation (4 points)

### (a) Why $T_{wc}$, not $T_b$ (2)

Coking is a **surface** process. Thermal pyrolysis and catalytic/oxidative
deposition both occur in the thin fluid layer in contact with the metal, at the
metal's temperature, on a catalytically active surface (copper and nickel both
are, and trace sulfur accelerates it). The bulk fluid may be hundreds of kelvin
cooler than that layer and is not where the chemistry happens. Formally, from
Module 05 Eq. 3.6,

$$T_{wc} = T_b + \frac{q''}{h_c}$$

and in a high-flux throat the film drop $q''/h_c$ is the **larger** of the two
terms: in this exam's own D1, $T_b = 250$ K and $q''/h_{c,\mathrm{eff}} = 542$ K,
so $T_{wc} = 792$ K — the wall runs **more than twice** the bulk temperature.
A design checked against the bulk temperature alone would pass by a wide margin
and coke anyway. [F]

### (b) Instrumentation (2)

**Cheapest detector: the pressure transducers across the cooling jacket.** A
coke layer is a growing surface roughness *and* a flow-area restriction, so
**jacket $\Delta p$ rises run over run at constant coolant mass flow and
constant chamber pressure**. It is monotone, it appears before any thermal
symptom, and the instrument is already installed for other reasons. A 5–10 %
rise across a dozen firings is the classic signature (Module 05 §7.5, Module 11
§8).

**Independent confirmation, without cutting the chamber open:** a **borescope
inspection of the channels** through the manifolds between firings — a
qualitative but decisive look at the deposit. Acceptable alternatives, each
worth full marks: back-side wall thermocouples trending upward at fixed
operating point (thermal confirmation of the same mechanism); or a
coolant-outlet bulk-temperature trend at fixed heat input, which rises as the
deposit insulates and pushes wall temperature up.

### Rubric (4)

| | |
|---|---|
| 1 | states that the deposition chemistry occurs at the wall surface, at the wall's temperature |
| 1 | quantifies the film drop $q''/h_c$ as the dominant term and gives a plausible size (hundreds of kelvin) |
| 1 | names jacket $\Delta p$ trending **up** run over run at constant flow |
| 1 | a genuinely independent second measurement (borescope, wall thermocouple trend, coolant outlet temperature trend) |

Answering "measure the coolant exit temperature" as the *primary* detector
scores at most 1 of the last 2 marks: it is an integral quantity and cannot
localise, and it is the very station part (a) says is the wrong one.

---

# Section B — Combustion chambers and injectors (30 points)

## B1 — Derivation: residence time and vent time constant (7 points)

### (a) Deriving $t_s = L^*/(\Gamma^2 c^*)$ (3)

**Step 1 — residence time as an inventory.** In steady state the mass of gas
held in the chamber is constant, so the mean time a gas element spends in $V_c$
is the inventory divided by the throughput:

$$t_s = \frac{m_{gas}}{\dot m} = \frac{\rho_c V_c}{\dot m}$$

**Step 2 — substitute the chamber gas density.** For a perfect gas at the
chamber stagnation state, $\rho_c = p_c/(R T_c)$.

**Step 3 — substitute the choked-throat mass-flow law.**
$\dot m = p_c A_t/c^*$.

$$t_s = \frac{p_c}{R T_c}\cdot V_c \cdot \frac{c^*}{p_c A_t}
= \frac{c^*}{R T_c}\cdot\frac{V_c}{A_t}$$

**Chamber pressure has cancelled**, and it cancelled because it appears once in
the numerator (through the density — a denser chamber holds more gas) and once
in the denominator (through the mass flow — a higher-pressure chamber passes
more gas through the same throat). Those two effects are exactly proportional,
so the resident mass *per unit of mass flow* is untouched.

**Step 4 — introduce $L^*$ and eliminate $RT_c$.** By definition
$L^* \equiv V_c/A_t$. And from $c^* = \sqrt{RT_c}/\Gamma$ we have
$R T_c = \Gamma^2 c^{*2}$, hence

$$\boxed{\;t_s = \frac{c^*}{\Gamma^2 c^{*2}}\,L^* = \frac{L^*}{\Gamma^2 c^*}\;}$$

Residence time is a property of $L^*$ and the propellant combination alone.

### (b) $\tau_e = t_s$ (1)

$$\tau_e \equiv \frac{V_c}{\Gamma^2 c^* A_t} = \frac{1}{\Gamma^2 c^*}\cdot\frac{V_c}{A_t}
= \frac{L^*}{\Gamma^2 c^*} = t_s \qquad\blacksquare$$

They are the same number because they are the same physics read in two
directions. $t_s$ is (gas inventory)/(gas throughput) in steady state; $\tau_e$
is the time constant of $dm/dt = -pA_t/c^*$, i.e. (gas inventory)/(gas
*efflux*), and at steady state efflux equals throughput. A chamber that holds
1.4 ms of flow will also empty itself through its own choked throat with a 1.4 ms
e-folding time. This is the bridge between the Module 06 chamber-sizing argument
and the Module 08 hard-start argument, and it is why $L^*$ appears in both.

### (c) Numerical evaluation for MX-450 (2)

$$R = \frac{8314.46}{21.8} = 381.40\ \mathrm{J/(kg\,K)}, \qquad
\Gamma(1.16) = \mathbf{0.6406},\qquad \Gamma^2 = 0.41043$$

$$c^*_{ideal} = \frac{\sqrt{381.40\times3560}}{0.64065}
= \frac{1165.24}{0.64065} = \mathbf{1818.8\ m/s}$$

$$c^*_{del} = \eta_{c^*} c^*_{ideal} = 0.970\times1818.8 = \mathbf{1764.3\ m/s}$$

$$C_{F,SL}(\gamma = 1.16,\ \varepsilon = 22,\ p_c = 130\ \mathrm{bar},\ p_a = 101{,}325\ \mathrm{Pa}) = \mathbf{1.6951}$$

$$A_t = \frac{F_{SL}}{p_{c,\mathrm{ns}} C_{F,SL}} = \frac{4.50\times10^{5}}{1.30\times10^{7}\times1.6951}
= \mathbf{0.020421\ m^2}
\quad\Rightarrow\quad D_t = 2\sqrt{A_t/\pi} = \mathbf{161.2\ mm}$$

$$\dot m = \frac{p_{c,\mathrm{ns}} A_t}{c^*_{del}}
= \frac{1.30\times10^{7}\times0.020421}{1764.3} = \mathbf{150.5\ kg/s}$$

$$V_c = L^* A_t = 1.05\times0.020421 = \mathbf{0.021442\ m^3} = 21.44\ \mathrm{L}$$

$$t_s = \frac{L^*}{\Gamma^2 c^*_{ideal}} = \frac{1.05}{0.41043\times1818.8}
= \frac{1.05}{746.5} = \mathbf{1.407\ ms}$$

### (d) The 3 % discrepancy (1)

$$\rho_c = \frac{p_c}{RT_c} = \frac{1.30\times10^{7}}{381.40\times3560} = 9.574\ \mathrm{kg/m^3}$$

$$\frac{\rho_c V_c}{\dot m} = \frac{9.574\times0.021442}{150.47} = \mathbf{1.364\ ms}$$

against 1.407 ms from the closed form: **a 3.0 % discrepancy, which is exactly
$1-\eta_{c^*}$.**

**Cause.** The identity $RT_c = \Gamma^2 c^{*2}$ holds only for the *ideal*
$c^*$. The real engine passes $\dot m = p_c A_t/c^*_{del}$, which is $1/0.97$
times the ideal flow through the same throat at the same pressure, so the
inventory is flushed 3 % faster than the closed form says.

**Which to carry: 1.364 ms**, the mass-flow-based value. The chug model is a
mass balance on the real chamber, and the quantity it needs is the real
inventory divided by the real throughput. Using 1.407 ms would overstate the
chamber's capacitance and hence overstate $k_{crit}$, i.e. it would flatter the
stability margin — an error in the dangerous direction. [J]

### Rubric (7)

| | |
|---|---|
| 1 | $t_s = \rho_c V_c/\dot m$ stated as an inventory/throughput identity |
| 1 | both substitutions ($\rho_c = p_c/RT_c$ and $\dot m = p_cA_t/c^*$) made and $p_c$ shown to cancel, with a physical reason for the cancellation |
| 1 | $RT_c = \Gamma^2c^{*2}$ used to reach the boxed form |
| 1 | $\tau_e = t_s$ proved **and** explained (fill time = blowdown time constant) |
| 1 | $\Gamma$, $c^*_{ideal}$, $c^*_{del}$, $C_{F,SL}$ correct |
| 1 | $A_t$, $D_t$, $\dot m$, $V_c$, $t_s$ correct |
| 1 | discrepancy identified as $\eta_{c^*}$ and the mass-flow value selected, **with the reason that the error is non-conservative** |

Writing "it can be shown that $t_s = L^*/(\Gamma^2c^*)$" scores zero for (a).

---

## B2 — Orifice sizing, injector stiffness and chug margin (13 points)

### (a) Flows (2)

$$\dot m = \mathbf{150.47\ kg/s}\ \text{(B1c)},\qquad
\dot m_f = \frac{\dot m}{1+\mathrm{MR}} = \frac{150.47}{4.45} = \mathbf{33.81\ kg/s}$$

$$\dot m_o = 150.47-33.81 = \mathbf{116.66\ kg/s},\qquad
\dot m_{f,el} = \frac{33.81}{400} = \mathbf{0.08454\ kg/s}$$

### (b) Fuel orifice (3)

$$\Delta p = 0.20\times1.30\times10^{7} = 2.60\times10^{6}\ \mathrm{Pa} = 26.0\ \mathrm{bar}$$

$$A = \frac{\dot m_{f,el}}{C_d\sqrt{2\rho\Delta p}}
= \frac{0.08454}{0.78\sqrt{2\times423\times2.60\times10^{6}}}
= \frac{0.08454}{0.78\times46{,}900} = \mathbf{2.311\times10^{-6}\ m^2}$$

$$d = \sqrt{\frac{4A}{\pi}} = \mathbf{1.715\ mm}$$

$$V_f = C_d\sqrt{\frac{2\Delta p}{\rho}} = 0.78\sqrt{\frac{5.20\times10^{6}}{423}}
= 0.78\times110.87 = \mathbf{86.48\ m/s}$$

$$L = 4d = \mathbf{6.86\ mm}\ \text{minimum faceplate thickness in the fuel circuit}$$

**Comment.** 1.72 mm sits mid-band in the 0.5–2.5 mm range that rocket injector
orifices cluster in, and 86 m/s is at the high end of the 20–60 m/s liquid band
— which is what a 130 bar chamber with a 20 % stiffness requirement forces, and
is a first hint that this face will be shear-dominated and erosion-sensitive.

### (c) Barrel Mach number and the injector-end pressure (2)

Subsonic root of the area–Mach relation at $\varepsilon_c = 2.2$,
$\gamma = 1.16$:

$$\mathrm{Ma}_2 = \mathbf{0.2822}$$

$$\frac{p_{c,\mathrm{ns}}}{p_{c,\mathrm{inj}}}
= \frac{\left(1+\frac{\gamma-1}{2}\mathrm{Ma}_2^2\right)^{\frac{\gamma}{\gamma-1}}}{1+\gamma\,\mathrm{Ma}_2^2}
= \frac{1.04713}{1+1.16\times0.079648} = \frac{1.04713}{1.09239} = 0.95856$$

$$\text{Rayleigh stagnation loss} = \mathbf{4.14\ \%},\qquad
p_{c,\mathrm{inj}} = \frac{130}{0.95856} = \mathbf{135.6\ bar}$$

That 5.6 bar is a pure loss: the pump pays for it and the nozzle never sees it.

### (d) Chug criterion (3)

With $t_s = 1.364$ ms (B1d) and $\tau = 0.80$ ms, solve

$$\omega\tau + \arctan(\omega t_s) = \pi$$

$$\omega = 2342.5\ \mathrm{rad/s} \quad\Rightarrow\quad
f = \frac{\omega}{2\pi} = \mathbf{372.8\ Hz}$$

*Check:* $\omega\tau = 1.8740$, $\arctan(2342.5\times1.364\times10^{-3})
= \arctan(3.1961) = 1.2676$, sum $= 3.1416 = \pi$ ✓

$$k_{crit} = \sqrt{1+(\omega t_s)^2} = \sqrt{1+10.215} = \mathbf{3.349}$$

$$\left.\frac{\Delta p}{p_c}\right|_{min} = \frac{1}{2k_{crit}} = \mathbf{14.93\ \%}$$

372.8 Hz sits squarely in the observed 50–500 Hz chug band, and a 15 % floor is
the bottom of the classical 15–25 % rule — both of which is the sanity check.

### (e) Which chamber pressure goes in the loop gain (2)

$$k = \frac{p_c}{2\Delta p}: \qquad
k\big|_{\mathrm{ns}} = \frac{130}{2\times26.0} = \mathbf{2.500}, \qquad
k\big|_{\mathrm{inj}} = \frac{135.6}{2\times26.0} = \mathbf{2.608}$$

**The injector-end value is correct.** The loop gain came from linearising the
orifice equation, $\partial\dot m_{in}/\partial p_c = -\dot m/(2\Delta p)$,
where $p_c$ is the *back pressure the orifice discharges into* — the static
pressure at the injector face, not the stagnation pressure of the fully burned
gas that the nozzle sees. The two differ by the Rayleigh loss of part (c).

$$\text{gain margin} = \frac{k_{crit}}{k}: \qquad
\frac{3.349}{2.500} = \mathbf{1.340} \quad\text{(wrong station)},\qquad
\frac{3.349}{2.608} = \mathbf{1.284} \quad\text{(correct)}$$

Using the nozzle-stagnation pressure flatters the margin by 4 %, in a quantity
where the honest margin is only 1.28 (about 2.2 dB) to begin with. This is the
same station error that makes test stands report $\eta_{c^*} > 1$, appearing in
a different equation.

### (f) Throttling to 55 % (1)

For a fixed-area injector $\Delta p \propto \dot m^2$ while $p_c \propto \dot m$,
so $\Delta p/p_c \propto \dot m$:

$$\left.\frac{\Delta p}{p_c}\right|_{55\%} = 0.20\times0.55 = \mathbf{11.0\ \%}$$

against a requirement of at least 14.93 % — **the engine chugs at 55 % thrust.**

**And the requirement is harder there, not easier.** At lower chamber pressure
and lower injection velocity the atomisation is coarser and the vaporisation
slower, so the combustion time lag $\tau$ *lengthens*. Redoing (d) at
$\tau = 1.10$ ms gives $f = 283.7$ Hz, $k_{crit} = 2.630$, and a required
$\Delta p/p_c$ of **19.0 %** — the requirement has risen while the delivered
stiffness has fallen by nearly half. This is the quantitative statement of why
deep throttling needs a variable-area injector, a dual manifold, or cavitating
venturis.

### Rubric (13)

| | |
|---|---|
| 1 | total and split flows |
| 1 | per-element fuel flow |
| 1 | orifice area from $\dot m = C_dA\sqrt{2\rho\Delta p}$ |
| 1 | diameter and jet velocity |
| 1 | faceplate thickness and a sane comment on the ranges |
| 1 | barrel Mach number from the **subsonic** root |
| 1 | Rayleigh loss and injector-end pressure |
| 1 | neutral frequency from the transcendental phase condition (with the check shown) |
| 1 | $k_{crit}$ |
| 1 | minimum $\Delta p/p_c$ |
| 1 | both loop gains computed |
| 1 | injector-end identified as correct, with the reason (the orifice discharges into the injector-face static pressure) |
| 1 | 11.0 % at 55 % thrust **and** the statement that $\tau$ lengthens so the requirement rises too |

Using the supersonic root in (c), or using $t_s = 1.407$ ms in (d) after
choosing 1.364 ms in B1(d), costs the method mark for that part.

---

## B3 — Rupe momentum balance (6 points)

### (a) Oxidiser side (2)

$$V_o = C_d\sqrt{\frac{2\Delta p}{\rho_o}} = 0.78\sqrt{\frac{5.20\times10^{6}}{1141}}
= 0.78\times67.51 = \mathbf{52.66\ m/s}$$

$$\dot m_{o,el} = \frac{116.66}{400} = \mathbf{0.2916\ kg/s}$$

$$A_o = \frac{\dot m_{o,el}}{\rho_o V_o} = \frac{0.2916}{1141\times52.66}
= \mathbf{4.854\times10^{-6}\ m^2} \quad\Rightarrow\quad d_o = \mathbf{2.486\ mm}$$

(The orifices run full, so $C_c \approx 1$ and the jet area is the geometric
area — this is the assumption stated in the engine block, and it is what makes
$A_o = \dot m/(\rho V)$ legitimate. In a short sharp-edged orifice that never
reattaches, the jet area would be $0.61A$ and the momentum would be 1.6× larger.)

### (b) Rupe parameter and TMR (2)

$$R_u = \frac{\rho_o V_o^2 d_o}{\rho_f V_f^2 d_f}
= \frac{1141\times(52.66)^2\times2.486\times10^{-3}}{423\times(86.48)^2\times1.715\times10^{-3}}
= \frac{7865}{5427} = \mathbf{1.449}$$

$$\mathrm{TMR} = \frac{\dot m_o V_o}{\dot m_f V_f}
= \frac{0.2916\times52.66}{0.08454\times86.48} = \frac{15.36}{7.311} = \mathbf{2.101}$$

**The oxidiser stream dominates**, by 45 % on the diameter-weighted Rupe
criterion and by 110 % on total momentum. The resultant of the two jet momenta
therefore does not lie on the element axis: the oxidiser punches through, the
liquid sheet is deflected toward the fuel side, and the fan carries a
mixture-ratio gradient across it. That is a mixing loss ($E_m$ falls, and with
it $\eta_{c^*}$), and — because the deflection is a *fixed* geometric bias — an
outer-row element deflected outward is a wall-streak mechanism.

This result is not an accident of the numbers, and the general case is worth
deriving in two lines. At equal $\Delta p$ and equal $C_d$ on both circuits,
$V = C_d\sqrt{2\Delta p/\rho}$, so the **momentum flux is the same on both
sides**:

$$\rho V^2 = 2C_d^2\Delta p \quad\text{(independent of }\rho\text{)}
\qquad\Longrightarrow\qquad R_u = \frac{d_o}{d_f}$$

and since $d \propto (\dot m/\rho V)^{1/2} \propto \dot m^{1/2}\rho^{-1/4}$,

$$\boxed{\;R_u = \sqrt{\mathrm{MR}}\left(\frac{\rho_f}{\rho_o}\right)^{1/4},
\qquad \mathrm{TMR} = \mathrm{MR}\left(\frac{\rho_f}{\rho_o}\right)^{1/2}\;}$$

Check: $\sqrt{3.45}\,(423/1141)^{1/4} = 1.857\times0.7803 = 1.449$ ✓ and
$3.45\times(0.3707)^{1/2} = 2.101$ ✓. **At equal pressure drop the Rupe
parameter depends on nothing but the mixture ratio and the density ratio**, and
for every LOX/hydrocarbon pair ($\mathrm{MR} > 1$ and $\rho_o > \rho_f$, but
with the mixture ratio winning because it enters as a square root against a
fourth root) the oxidiser carries the excess momentum. That is why the O–F–O
triplet is the naturally balanced arrangement for these propellants and F–O–F is
not — and, as Module 07 WE3 notes, F–O–F was nevertheless chosen historically
because a locally fuel-rich element is thermally forgiving and shields the
central oxidiser jet from the wall. The momentum criterion is a design *input*,
not a design *answer*.

### (c) The two fixes (2)

**(i) Rebalance by pressure drop.** At fixed $\dot m_o$, $d_o \propto V_o^{-1/2}$,
so $R_u \propto V_o^{2}\cdot V_o^{-1/2} = V_o^{3/2}$. The required velocity
factor is $1.449^{-2/3} = 0.7808$, so

$$V_o' = 0.7808\times52.66 = 41.12\ \mathrm{m/s}, \qquad
\Delta p_o = \frac{\rho_o V_o'^2}{2C_d^2} = \frac{1141\times1690}{2\times0.6084}
= 1.585\times10^{6}\ \mathrm{Pa}$$

$$\Delta p_o = \mathbf{15.85\ bar} = \mathbf{12.19\ \%\ of\ }p_{c,\mathrm{ns}}$$

**Rejected.** B2(d) requires at least 14.93 % for chug margin on the correct
station, and this puts the oxidiser circuit at 12.2 % — below the floor, with
no margin at all. The mixing optimum and the stability requirement point in
opposite directions, and stability wins. [J]

**(ii) Split the oxidiser into an O–F–O triplet.** Two oxidiser orifices each
of $\dot m_{o,el}/2$ at unchanged $\Delta p$ have

$$d_o' = \frac{2.486}{\sqrt2} = \mathbf{1.758\ mm}, \qquad
R_u' = 1.449\times\frac{1.758}{2.486} = \mathbf{1.025}$$

**Accepted.** Balanced to within 3 % of unity, at 20 % stiffness on both
circuits, with no stability penalty — and the triplet's transverse momenta
cancel by symmetry, so the resultant is axial regardless of residual imbalance,
which makes it far less sensitive to throttling and to flow scatter than a
doublet.

**Recommendation: (ii).** The constraint that decides it is the chug floor of
B2(d): fix (i) buys mixing by spending exactly the stiffness the engine cannot
spare.

### Rubric (6)

| | |
|---|---|
| 1 | $V_o$ and $\dot m_{o,el}$ |
| 1 | $A_o$ and $d_o$ (with the $C_c\approx1$ assumption used consistently) |
| 1 | $R_u$ |
| 1 | TMR **and** a correct statement of the consequence for the spray fan |
| 1 | fix (i) quantified as a $\Delta p_o$ fraction and rejected **against the B2 chug floor** |
| 1 | fix (ii) quantified ($d_o'$ and $R_u'$) and recommended |

A student who reports $R_u$ and TMR as though they were the same quantity, or
who uses TMR in the Rupe correlation without noting the $d_f/d_o$ factor, loses
the third mark.

---

## B4 — Cold-flow data interpretation (4 points)

### (a) Discharge and cavitation numbers (2)

$$A = \frac{\pi d^2}{4} = \frac{\pi(1.715\times10^{-3})^2}{4} = 2.310\times10^{-6}\ \mathrm{m^2}$$

$$A\sqrt{2\rho\Delta p} = 2.310\times10^{-6}\sqrt{2\times998\times2.00\times10^{6}}
= 2.310\times10^{-6}\times63{,}182 = 0.14595\ \mathrm{kg/s}$$

| | $p_2 = 30$ bar | $p_2 = 2$ bar |
|---|---|---|
| $p_1 = p_2+\Delta p$ | 50.0 bar | 22.0 bar |
| $C_d = \dot m/A\sqrt{2\rho\Delta p}$ | $0.1139/0.14595 = \mathbf{0.780}$ | $0.0934/0.14595 = \mathbf{0.640}$ |
| $K = (p_1-p_v)/(p_1-p_2)$ | $(50.0-0.0234)/20.0 = \mathbf{2.499}$ | $(22.0-0.0234)/20.0 = \mathbf{1.099}$ |

### (b) The phenomenon (1)

**Orifice cavitation, running into hydraulic flip.** The whole data set is taken
at *constant* $\Delta p$, so a Bernoulli orifice would deliver constant flow;
the fact that flow falls as the back pressure is lowered proves the discharge is
no longer set by $\Delta p$ at all. In the cavitating regime the flow is set by
the *upstream-to-vapour* margin, $\dot m = C_c A\sqrt{2\rho(p_1-p_v)}$,
equivalently $C_d = C_c\sqrt K$ with $C_c \approx 0.61$ (Nurick).

**Critical cavitation number.** $C_d$ is flat at 0.780 down to $p_2 = 15$ bar
($K = 1.749$) and has departed by $p_2 = 12$ bar ($K = 1.599$), so the
transition lies between those two points. The correlation puts it exactly where
$C_c\sqrt K$ first falls below the non-cavitating value:

$$K_{crit} = \left(\frac{C_{d,\mathrm{non\text{-}cav}}}{C_c}\right)^2
= \left(\frac{0.780}{0.61}\right)^2 = \mathbf{1.635}$$

and every point below that is reproduced by $C_d = 0.61\sqrt K$ to three
figures — e.g. at $K = 1.099$, $0.61\sqrt{1.099} = 0.639$ against the measured
0.640.

**The glassy jet is hydraulic flip**: the vapour cavity has reached the orifice
exit, downstream gas is ingested up the cavity, and the jet has detached from
the bore entirely. $C_d$ has stepped to $\approx C_c = 0.61$ and, far more
important than the flow change, **atomisation collapses** — the frothy jet was
already partly disintegrated, the glassy column is not.

### (c) Can it happen in the engine? (1)

**Fuel circuit: no, at mainstage.** Methane is injected at 250 K, which is above
its critical temperature of **190.56 K**. Above $T_{crit}$ there is no
liquid–vapour interface and no vapour pressure, so there is nothing to flash and
the cavitation number is not even defined. This is one of the quiet advantages
of a supercritical coolant/injectant circuit.

**Oxidiser circuit: no, with wide margin.** The LOX manifold sits at
$p_{c,\mathrm{inj}} + \Delta p = 135.6+26.0 = 161.6$ bar and discharges into
135.6 bar, so

$$K = \frac{161.6\times10^{5}-2.54\times10^{5}}{26.0\times10^{5}} = \mathbf{6.12}$$

against a threshold of about 1.6 — a factor of four clear.

**Where the answer changes: the start transient (and deep throttle).** During
chilldown and priming the methane is at ~120 K and the manifold is far below
methane's 45.99 bar critical pressure, so the fuel circuit is genuinely
two-phase and can cavitate and flip; the LOX is near saturation and its manifold
pressure is a fraction of mainstage. Both circuits pass through the flip regime
on every start, one may flip while the other does not, and a mixture-ratio step
of several percent in milliseconds is exactly the precondition for a hard start.
The bench result is therefore not an artefact — it is a **start-transient**
datum being read at the wrong operating point.

### Rubric (4)

| | |
|---|---|
| 1 | both $C_d$ values, computed from the measured flow and the geometric area |
| 1 | both cavitation numbers, with $p_1 = p_2+\Delta p$ handled correctly |
| 1 | names cavitation/hydraulic flip, gives $K_{crit} \approx 1.6$, and identifies the glassy jet as flip with atomisation loss |
| 1 | correct "no at mainstage" for **both** circuits with a reason for each (methane supercritical; LOX $K = 6.1$) **and** identifies the start transient as the exception |

A student who concludes "the injector will cavitate in flight" from the bench
data alone, without checking the flight fluid states, scores zero for (c): the
whole point of the item is that a bench fluid at bench conditions is not the
flight fluid.

---

# Section C — Ignition and nozzles (25 points)

## C1 — Accumulated-propellant overpressure (10 points)

### (a) Engine geometry (2)

$$\dot m = \frac{F_{vac}}{I_{sp}g_0} = \frac{2.20\times10^{5}}{372\times9.80665}
= \frac{2.20\times10^{5}}{3648.1} = \mathbf{60.31\ kg/s}$$

$$A_t = \frac{\dot m\,c^*}{p_c} = \frac{60.31\times1830}{9.00\times10^{6}}
= \mathbf{0.012262\ m^2} \quad\Rightarrow\quad D_t = \mathbf{125.0\ mm}$$

$$V_c = L^* A_t = 1.00\times0.012262 = \mathbf{0.012262\ m^3} = 12.26\ \mathrm{L}$$

### (b) Accumulated mass (1)

$$\dot m_{st} = \phi\dot m = 0.10\times60.31 = 6.031\ \mathrm{kg/s}$$
$$m_{acc} = \dot m_{st}\tau_d = 6.031\times0.180 = \mathbf{1.086\ kg}$$

$$\frac{m_{acc}}{V_c} = \frac{1.086}{0.012262} = \mathbf{88.5\ kg/m^3}$$

A twelve-litre chamber holding a kilogram of propellant: at liquid densities of
400–1,100 kg/m³ that is roughly a tenth to a fifth of the chamber volume
occupied by liquid films and spray.

### (c) Constant-volume explosion (3)

$$R = \frac{8314.46}{21.0} = \mathbf{395.93\ J/(kg\,K)}$$

$$T_v = \frac{(\gamma-1)\Delta h_c}{R} = \frac{0.16\times1.02\times10^{7}}{395.93}
= \frac{1.632\times10^{6}}{395.93} = \mathbf{4122\ K}$$

$$p_{CV} = \frac{m_{acc}RT_v}{V_c}
= \frac{1.086\times395.93\times4122}{0.012262}
= \frac{1.7716\times10^{6}}{0.012262} = 1.445\times10^{8}\ \mathrm{Pa}$$

$$p_{CV} = \mathbf{1445\ bar} = \mathbf{16.05\times p_c}$$

**Sanity check on $T_v$.** The constant-*pressure* adiabatic flame temperature
for LOX/methane near this mixture ratio is about 3,500–3,560 K; constant-volume
combustion from a cold initial state adds the $pV$ work the gas is not allowed
to do, and should land several hundred kelvin higher. 4,122 K is credible, and
it is [A] — it inherits the accuracy of the single $\Delta h_c$ number and the
constant-$\gamma$ assumption, neither of which is better than ±10 %.

### (d) Venting correction (2)

$$\Gamma(1.16) = 0.6406,\qquad
c^*_v = \frac{\sqrt{RT_v}}{\Gamma} = \frac{\sqrt{395.93\times4122}}{0.6406}
= \frac{1277.5}{0.6406} = \mathbf{1994\ m/s}$$

$$\tau_e = \frac{V_c}{\Gamma^2 c^*_v A_t} = \frac{L^*}{\Gamma^2c^*_v}
= \frac{1.00}{0.41043\times1994} = \mathbf{1.222\ ms}$$

(Note that B1(b)'s identity is doing the work here: because $V_c/A_t = L^*$,
the vent time constant needs no geometry beyond $L^*$.)

$$\frac{t_b}{\tau_e} = \frac{4.00}{1.222} = 3.273, \qquad
e^{-3.273} = 0.03790$$

$$\frac{\tau_e}{t_b}\left(1-e^{-t_b/\tau_e}\right)
= 0.30548\times0.96210 = \mathbf{0.2939}$$

$$p_{peak} = 0.2939\times1445 = \mathbf{424.6\ bar} = \mathbf{4.72\times p_c}$$

Venting through the throat buys a factor of 3.4. It does not save the chamber.

### (e) The ignition-delay budget (2)

$$p_{lim} = 1.60\times90 = 144\ \mathrm{bar} = 1.44\times10^{7}\ \mathrm{Pa}$$

**Unvented (conservative):**

$$m_{acc,max} = \frac{p_{lim}V_c}{RT_v}
= \frac{1.44\times10^{7}\times0.012262}{395.93\times4122} = \frac{1.7657\times10^{5}}{1.6320\times10^{6}}
= 0.1082\ \mathrm{kg}$$

$$\tau_{d,max} = \frac{0.1082}{6.031} = \mathbf{17.9\ ms}$$

**With the $t_b = 4$ ms venting credit:** divide the allowable mass by 0.2939,

$$m_{acc,max} = 0.3681\ \mathrm{kg}, \qquad \tau_{d,max} = \mathbf{61.0\ ms}$$

**Which number goes in the requirement: 17.9 ms.** The venting credit is worth
a factor of 3.4 and rests entirely on $t_b$, which **nobody measures**. If the
accumulation transitions from deflagration to detonation the lumped model
collapses and the local pressure exceeds $p_{CV}$ through shock reflection, so
the credit is not merely optimistic, it can be qualitatively wrong. Write the
requirement at the unvented bound and treat the venting factor as margin, not as
budget. [J]

**Weakest assumption in the chain:** $t_b$, for the reason just given. Runners-up
worth full credit if argued: that all of $m_{acc}$ is at a burnable mixture
ratio (a large fraction is liquid film that burns slowly from its surface, which
would *reduce* the peak); and that $\phi$ is constant during the delay, when a
real start ramps.

**The design lesson.** The delay budget is 18 ms, and it is set by the
*structure*, not by the chemistry. Halving $\phi$ — a tank-head start, a
reduced-flow preliminary stage — doubles it. That is why every start sequence in
Module 08 admits propellant at the lowest flow the feed system will give and
demands a confirmed flame before the main valves move.

### Rubric (10)

| | |
|---|---|
| 1 | $\dot m$ from $F/(I_{sp}g_0)$ |
| 1 | $A_t$, $D_t$, $V_c$ |
| 1 | $m_{acc}$ and the loading |
| 1 | $R$ and $T_v = (\gamma-1)\Delta h_c/R$ |
| 1 | $p_{CV}$, in bar **and** as a multiple of $p_c$ |
| 1 | a real sanity check on $T_v$ against a constant-pressure flame temperature |
| 1 | $c^*_v$ and $\tau_e$ |
| 1 | venting factor and $p_{peak}$ |
| 1 | both $\tau_{d,max}$ values |
| 1 | selects the unvented bound **and** names $t_b$ (or detonation transition) as the weak link |

Computing $T_v$ from $\Delta h_c/c_p$ with a constant-pressure $c_p$ is a wrong
setup — it gives the constant-*pressure* temperature and understates $p_{CV}$ by
roughly $\gamma$. Zero for (c).

---

## C2 — Expansion ratio, separation and break-even altitude (11 points)

### (a) Exit conditions (3)

Inverting the area–Mach relation at $\gamma = 1.20$ and applying the isentropic
pressure ratio, with $p_c = 8.50\times10^{6}$ Pa:

| $\varepsilon$ | $M_e$ | $p_0/p_e$ | $p_e$ (kPa) | $p_e/p_a$ at SL |
|---|---|---|---|---|
| 14 | **3.512** | 124.12 | **68.48** | **0.6759** |
| 24 | **3.885** | 249.43 | **34.08** | **0.3363** |

### (b) The two separation criteria (2)

$$\text{Summerfield: } p_{sep} = 0.4\,p_a = \mathbf{40.53\ kPa}\ \text{(both nozzles)}$$

$$\text{Schmucker: } p_{sep} = p_a(1.88M_e-1)^{-0.64}$$
$$\varepsilon = 14:\ p_{sep} = \mathbf{33.63\ kPa};\qquad
\varepsilon = 24:\ p_{sep} = \mathbf{31.19\ kPa}$$

| $\varepsilon$ | $p_e$ | Summerfield | Schmucker | verdict |
|---|---|---|---|---|
| 14 | 68.48 kPa | 68.48 > 40.53 → **attached** | 68.48 > 33.63 → **attached** | they agree, with 69 % and 104 % margin |
| 24 | 34.08 kPa | 34.08 < 40.53 → **separated** | 34.08 > 31.19 → **attached** by 9.3 % | **they disagree about the answer, not the number** |

At $\varepsilon = 14$ the two criteria differ by 20 % in separation pressure and
it does not matter, because the nozzle is nowhere near either. At
$\varepsilon = 24$ the same 20 % straddles the operating point and the two
criteria return opposite verdicts on the same hardware. **You would not build
$\varepsilon = 24$ on either criterion alone**: you would cold-flow the actual
contour at subscale, or treat 24 as an upper bound and design to 20–22 with
margin. This is why booster expansion ratios cluster where they do — not because
larger ones are impossible, but because the criteria stop being trustworthy
right there. [E][J]

### (c) Thrust coefficients and sea-level thrust (2)

| $\varepsilon$ | $C_{F,vac}$ | $C_{F,SL}$ | $F_{SL} = C_F p_c A_t$ |
|---|---|---|---|
| 14 | **1.7823** | **1.6154** | **480.6 kN** |
| 24 | **1.8385** | **1.5524** | **461.8 kN** |

(These are attached-flow values. For $\varepsilon = 24$ they are only meaningful
if Schmucker is right; if Summerfield is right the nozzle is separated and the
$C_{F,SL}$ column is fiction — which is precisely the ambiguity part (b)
identified.)

### (d) Break-even altitude (3)

Two nozzles on the same throat and the same chamber pressure give equal thrust
when

$$C_{F,vac}(\varepsilon_1)-\frac{p_a}{p_c}\varepsilon_1
= C_{F,vac}(\varepsilon_2)-\frac{p_a}{p_c}\varepsilon_2
\quad\Longrightarrow\quad
p_{a,BE} = p_c\,\frac{C_{F,vac}(\varepsilon_2)-C_{F,vac}(\varepsilon_1)}{\varepsilon_2-\varepsilon_1}$$

$$p_{a,BE} = 8.50\times10^{6}\times\frac{1.8385-1.7823}{24-14}
= 8.50\times10^{6}\times5.6159\times10^{-3} = \mathbf{47.73\ kPa}$$

In the 1976 US Standard Atmosphere troposphere,

$$h = \frac{T_0}{L}\left[1-\left(\frac{p_a}{p_0}\right)^{\frac{R_{air}L}{g_0}}\right]
= \frac{288.15}{0.0065}\left[1-(0.47113)^{0.190263}\right]
= 44{,}331\times0.13342 = \mathbf{5.91\ km}$$

**Thrust difference.**

| station | $p_a$ | $F_{14}$ | $F_{24}$ | $F_{24}-F_{14}$ |
|---|---|---|---|---|
| sea level | 101.3 kPa | 480.6 kN | 461.8 kN | **−18.8 kN** |
| 5.91 km | 47.73 kPa | 506.9 kN | 506.9 kN | 0 (by construction) |
| 20 km | 5.475 kPa | 527.6 kN | 542.3 kN | **+14.8 kN** |

A first stage is below 5.9 km for the first thirty seconds or so of a burn that
lasts two to three minutes. The larger nozzle loses 18.8 kN for that brief
period and wins up to 14.8 kN for the rest, which is why **every first-stage
nozzle is deliberately overexpanded at lift-off** and why "optimise the nozzle
for sea level" is wrong.

### (e) The chamber pressure that would rescue $\varepsilon = 24$ (1)

$p_e/p_c$ is fixed by $\varepsilon$ and $\gamma$ alone: $1/249.43 =
4.009\times10^{-3}$. To satisfy Summerfield we need $p_e \ge 40.53$ kPa, so

$$p_c \ge \frac{40{,}530}{4.009\times10^{-3}} = 1.011\times10^{7}\ \mathrm{Pa}
= \mathbf{101.1\ bar}$$

— a 19 % increase over 85 bar. Generally $p_e/p_a = (p_e/p_c)(p_c/p_a)$, so at
fixed $\varepsilon$ the separation margin is **linear in chamber pressure**.
That is the whole reason a 300 bar staged-combustion engine can carry roughly
twice the sea-level area ratio of a 100 bar gas-generator engine at the same
margin, and it is the correct way to explain an unusually large booster
expansion ratio without having to believe any particular published $p_c$.

### Rubric (11)

| | |
|---|---|
| 1 | both exit Mach numbers (supersonic root) |
| 1 | both exit pressures |
| 1 | both $p_e/p_a$ |
| 1 | both criteria evaluated for both nozzles |
| 1 | explicitly states that the criteria **disagree in verdict** at $\varepsilon = 24$ and does not silently pick one |
| 1 | $C_{F,vac}$ and $C_{F,SL}$ for both |
| 1 | sea-level thrusts |
| 1 | break-even relation derived, not quoted |
| 1 | $p_{a,BE}$ evaluated |
| 1 | altitude conversion and both thrust differences |
| 1 | required $p_c$ in (e) and the linear-in-$p_c$ scaling stated |

Quoting a break-even *altitude* without deriving the break-even *pressure*
scores at most 1 of the 3 marks in (d).

---

## C3 — Ignition detection (4 points)

### (a) Two different measurements (2)

An igniter-chamber pressure switch, a spark-ionisation current or an igniter
exhaust thermocouple all confirm that **the igniter is operating**. None of them
observes the main chamber. Ignition of the *engine* is the establishment of a
self-sustaining flame in the main chamber, which additionally requires that main
propellant is arriving, that it is locally within its flammability limits where
the torch jet penetrates, and that the kernel is not blown downstream before it
grows.

**Plausible fault:** the igniter lights and reads perfectly, but a main
propellant valve fails to crack, or a manifold has not primed, or the torch is
mounted where its jet does not penetrate the main spray. The interlock sees a
good igniter signal, commands the main valves open into a chamber with no flame,
and every millisecond thereafter is accumulation (Section C1). Programmes have
opened main valves on exactly this signal.

An equally acceptable answer: a **plugged igniter throat**. Igniter chamber
pressure reads high — higher than nominal, in fact — while no hot gas is reaching
the main chamber at all.

### (b) Two dissimilar detectors for a vacuum start (2)

| detector | what it senses | the failure mode that fools it |
|---|---|---|
| **Main-chamber pressure rise rate $dp_c/dt$** above a threshold | the actual main-chamber event | at vacuum start the initial $p_c$ signal is tiny and the transducer is near its noise floor; and a **hard start also produces a large $dp_c/dt$**, so the sensor cannot distinguish "lit" from "detonating" |
| **Optical / UV flame detector** (OH\* or CH\* chemiluminescence through a sapphire window) | radiation from the flame front, sub-millisecond | window fouling by soot or deposits (progressive, so it fails late in life); view-factor problems that let it see the igniter torch rather than the main chamber; on a pad, solar false positives |

Other defensible pairs: spark ionisation current (senses flame only at the plug
gap) paired with main-chamber pressure; or igniter chamber pressure as the
*permissive* paired with main-chamber $dp_c/dt$ as the *commit*.

**The design statement worth a mark on its own:** the two must be
**dissimilar** and must sense **different stations**, because two identical
sensors on the same station fail identically. The fast sensor gates "may I open
the main valves"; a second, independent main-chamber confirmation gates
"proceed to mainstage."

### Rubric (4)

| | |
|---|---|
| 1 | states that igniter instrumentation observes the igniter, not the main chamber |
| 1 | a specific, physically plausible fault in which the igniter reads healthy and the engine is not lit |
| 1 | two **dissimilar** detectors named, appropriate to a vacuum start |
| 1 | a specific failure mode for each, not a generic "it could break" |

---

# Section D — Heat transfer and cooling (30 points)

## D1 — Bartz → wall temperature → coolant channel (16 points)

### (a) Gas properties and the Bartz group (3)

$$c_{p,0} = \frac{\gamma R}{\gamma-1} = \frac{1.16\times381.40}{0.16} = \mathbf{2765\ J/(kg\,K)}$$

$$\mathrm{Pr}_0 = \frac{4\gamma}{9\gamma-5} = \frac{4.64}{5.44} = \mathbf{0.8529}$$

$$\mu_0 = 1.184\times10^{-7}\times(21.8)^{0.5}\times(3560)^{0.6}
= 1.184\times10^{-7}\times4.669\times135.2 = \mathbf{7.472\times10^{-5}\ Pa\,s}$$

Assembling $K_0$ term by term, with $D_t = 0.16125$ m, $R_u = 1.5R_t = 0.75D_t$
and $c^*_{del} = 1764.3$ m/s:

$$\frac{0.026}{D_t^{0.2}} = \frac{0.026}{0.69426} = 0.037452$$

$$\frac{\mu_0^{0.2}c_{p,0}}{\mathrm{Pr}_0^{0.6}}
= \frac{0.14952\times2765.1}{0.90897} = 454.84$$

$$\left(\frac{p_c}{c^*}\right)^{0.8} = (7368.5)^{0.8} = 1241.4,
\qquad \left(\frac{D_t}{R_u}\right)^{0.1} = (1.3333)^{0.1} = 1.02919$$

$$K_0 = 0.037452\times454.84\times1241.4\times1.02919
= \mathbf{2.176\times10^{4}\ W/(m^2 K)}$$

so that $h_g = K_0(A_t/A)^{0.9}\sigma$, with $h_g = K_0\sigma$ at the throat.

### (b) Adiabatic wall temperature (1)

$$T_{aw} = T_0\frac{1+r\frac{\gamma-1}{2}M^2}{1+\frac{\gamma-1}{2}M^2}
= 3560\times\frac{1+0.9\times0.08}{1+0.08} = 3560\times\frac{1.072}{1.08}
= \mathbf{3534\ K}$$

It is not 3,560 K because an insulated wall in a moving gas recovers only
$r = 90$ % of the free-stream kinetic energy, not all of it — heat diffuses out
of the stagnated fluid slightly faster than momentum diffuses in
($r \approx \mathrm{Pr}^{1/3}$). The difference is small **at the throat**
because the Mach number is only 1 and the kinetic energy is a small fraction of
the total; deep in the nozzle the same recovery factor still leaves $T_{aw}$
near $T_0$, which is why a skirt is not saved by the gas being cold.

### (c) Channel geometry (2)

$$A_{ch} = 1.80\times4.50 = 8.10\ \mathrm{mm^2} = 8.10\times10^{-6}\ \mathrm{m^2}$$

$$D_h = \frac{4A_{ch}}{2(w+h_{ch})} = \frac{4\times8.10\times10^{-6}}{2\times6.30\times10^{-3}}
= \mathbf{2.571\ mm}$$

$$p_{ch} = \frac{\pi(D_t+2t_w)}{N_{ch}} = \frac{\pi(0.16125+0.0016)}{150}
= \frac{0.51160}{150} = \mathbf{3.411\ mm}$$

$$t_L = p_{ch}-w = 3.411-1.80 = \mathbf{1.611\ mm}, \qquad AR = \frac{4.50}{1.80} = \mathbf{2.5}$$

A 1.61 mm land at a 3.41 mm pitch is comfortably inside the 0.8–1.8 mm practice
band: millable, printable, and thick enough to braze or close out over. Note
what bounds the channel count — at 200 channels the pitch would be 2.56 mm and
the land 0.76 mm, at the manufacturing floor. **Channel count is limited by
throat circumference**, and that limit gets tighter as engines get smaller.

### (d) Coolant state and Dittus–Boelter (3)

$$\dot m_{ch} = \frac{33.81}{150} = \mathbf{0.2254\ kg/s}$$

$$V_c = \frac{\dot m_{ch}}{\rho A_{ch}} = \frac{0.2254}{190\times8.10\times10^{-6}}
= \frac{0.2254}{1.539\times10^{-3}} = \mathbf{146.5\ m/s}$$

$$Re_c = \frac{\rho V_c D_h}{\mu} = \frac{190\times146.5\times2.571\times10^{-3}}{2.6\times10^{-5}}
= \mathbf{2.752\times10^{6}}$$

$$Pr_c = \frac{c_p\mu}{k} = \frac{3050\times2.6\times10^{-5}}{0.070} = \mathbf{1.133}$$

$$h_c = 0.023\frac{k}{D_h}Re_c^{0.8}Pr_c^{0.4}
= 0.023\times\frac{0.070}{2.571\times10^{-3}}\times(2.752\times10^{6})^{0.8}\times(1.133)^{0.4}$$
$$= 0.023\times27.22\times1.4190\times10^{5}\times1.0512 = \mathbf{9.335\times10^{4}\ W/(m^2 K)}$$

146 m/s is at the top of the 60–180 m/s band that methane channels run in;
$Pr \approx 1.1$ is exactly the regime in which Dittus–Boelter behaves.

### (e) The land as a fin (2)

$$m = \sqrt{\frac{2h_c}{k_w t_L}} = \sqrt{\frac{2\times9.335\times10^{4}}{290\times1.611\times10^{-3}}}
= \sqrt{\frac{1.867\times10^{5}}{0.4671}} = \mathbf{632.2\ m^{-1}}$$

$$m h_{ch} = 632.2\times4.50\times10^{-3} = 2.845, \qquad
\eta_f = \frac{\tanh 2.845}{2.845} = \frac{0.99333}{2.845} = \mathbf{0.3491}$$

$$\Phi = \frac{w+2\eta_f h_{ch}}{p_{ch}} = \frac{1.80+2(0.3491)(4.50)}{3.411}
= \frac{4.942}{3.411} = \mathbf{1.449}$$

$$h_{c,\mathrm{eff}} = \Phi h_c = 1.449\times9.335\times10^{4}
= \mathbf{1.353\times10^{5}\ W/(m^2 K)}$$

The lands are contributing 75 % as much cooling area as the channel floor, at
35 % efficiency — which is the aspect-ratio trap in action: $AR = 2.5$ is
already tall enough that most of the land is barely conducting.

### (f) The resistance chain, iterated (3)

Start from $T_{wg} = 900$ K. With $\sigma = \left[\frac12\frac{T_{wg}}{T_0}
\left(1+\frac{\gamma-1}{2}M^2\right)+\frac12\right]^{-0.68}
\left(1+\frac{\gamma-1}{2}M^2\right)^{-0.12}$ at $M = 1$, and

$$q'' = \frac{T_{aw}-T_b}{\dfrac{1}{h_g}+\dfrac{t_w}{k_w}+\dfrac{1}{h_{c,\mathrm{eff}}}},
\qquad T_{wg} = T_{aw}-\frac{q''}{h_g}$$

three sweeps converge to

$$\sigma = \mathbf{1.327}, \qquad h_g = K_0\sigma = \mathbf{2.888\times10^{4}\ W/(m^2 K)}$$

| path | $R''$ (m²K/W) | share |
|---|---|---|
| gas side $1/h_g$ | $3.463\times10^{-5}$ | **77.3 %** |
| wall $t_w/k_w = 0.0008/290$ | $2.759\times10^{-6}$ | **6.2 %** |
| coolant $1/h_{c,\mathrm{eff}}$ | $7.393\times10^{-6}$ | **16.5 %** |
| total | $4.478\times10^{-5}$ | |

$$q'' = \frac{3534-250}{4.478\times10^{-5}} = \mathbf{73.3\ MW/m^2}$$

$$T_{wg} = 3534-\frac{7.333\times10^{7}}{2.888\times10^{4}} = 3534-2539 = \mathbf{994\ K}$$

$$\Delta T_{wall} = \frac{q''t_w}{k_w} = \frac{7.333\times10^{7}\times8.0\times10^{-4}}{290}
= \mathbf{202\ K}$$

$$T_{wc} = T_{wg}-\Delta T_{wall} = \mathbf{792\ K}
\qquad\left(\text{check: } T_b+\frac{q''}{h_{c,\mathrm{eff}}} = 250+542 = 792\ \mathrm{K}\ \checkmark\right)$$

### (g) Does it close? (2)

**Coolant side: passes.** $T_{wc} = 792$ K against a methane decomposition limit
of 900–950 K — **110 to 160 K of margin**. Note what that means: this engine
would be *impossible* on RP-1, whose limit is 560–590 K, by more than 200 K. The
propellant choice is doing the work, exactly as A1 argued.

**Hot wall: fails.** $T_{wg} = 994$ K against a design band of $\le 850$ K for a
long-life copper alloy. GRCop-42 retains useful strength further than NARloy-Z
does, but 994 K is a creep and low-cycle-fatigue temperature, not a design
point.

**Thermal stress:**

$$\sigma_{th} = \frac{E\alpha\Delta T_{wall}}{2(1-\nu)}
= \frac{110\times10^{9}\times17\times10^{-6}\times202.3}{2(1-0.33)}
= \frac{3.783\times10^{8}}{1.34} = \mathbf{282\ MPa}$$

against a 0.2 % yield of 130–190 MPa: an elastic stress index of
**1.5–2.2 × yield.**

**What that number does and does not tell you.** It tells you the liner is
**plastic on the hot face on every start and plastic in tension on every
shutdown**, when the gradient reverses as coolant keeps flowing through a wall
that is no longer heated. It therefore tells you that this is a **low-cycle
fatigue** problem governed by plastic *strain range* (Coffin–Manson), not a
stress problem governed by an endurance limit. What it does **not** tell you is
the life: once the elastic stress exceeds yield the number is an index, not a
stress, and predicting cycles requires an elastic–plastic cyclic analysis and
alloy-specific LCF data. It also omits the superposed hoop load from the
coolant-to-chamber pressure difference and the restraint from the closeout,
which together carry the remaining 15–30 % of the equivalent strain range.

**Verdict: the design does not close on the hot wall.** The fix is *not* a
thicker wall (that raises $\Delta T_{wall}$ and shortens life) and *not* a more
conductive alloy (the metal is only 6 % of the resistance). It is on the coolant
side or the gas side: narrow the channels at the throat to raise velocity, raise
the channel count if the circumference allows, go to a high-aspect-ratio channel
locally, or add fuel-film cooling upstream of the throat to knock $h_g$ down.
D2 examines a fourth possibility that the supplier is about to offer you.

### Rubric (16)

| | |
|---|---|
| 1 | $c_{p,0}$, $\mathrm{Pr}_0$ |
| 1 | $\mu_0$ |
| 1 | $K_0$ assembled correctly, using the **delivered** $c^*$ and $R_u = 0.75D_t$ |
| 1 | $T_{aw}$ with $r = 0.9$, and the reason it is not $T_0$ |
| 1 | $D_h$ and pitch |
| 1 | land width and aspect ratio, with a manufacturability comment |
| 1 | per-channel flow and velocity |
| 1 | $Re_c$, $Pr_c$ |
| 1 | $h_c$ |
| 1 | $m$ and $\eta_f$ |
| 1 | $\Phi$ and $h_{c,\mathrm{eff}}$ referred to **gas-side** area |
| 1 | iteration on $\sigma$ actually performed (not a single pass at 900 K) |
| 1 | $q''$ and the three resistance shares |
| 1 | $T_{wg}$, $\Delta T_{wall}$, $T_{wc}$ with the cross-check |
| 1 | both limit checks with the correct verdicts (coking passes, hot wall fails) |
| 1 | $\sigma_{th}$ **and** the statement that it is an index in the LCF regime, not a stress |

A single-pass calculation at $T_{wg} = 900$ K gives $\sigma = 1.343$,
$h_g = 2.92\times10^4$ and $q'' = 73.9$ MW/m² — close enough that a student who
does not iterate gets nearly the right number for the wrong reason. Award the
numerical marks but take the iteration mark: $\sigma$ is a function of the
answer, and the student must show they know it.

---

## D2 — Engineering judgment: the as-printed channel (8 points)

### (a) Friction and pressure gradient (3)

Smooth duct:
$$f = 0.184\,Re_c^{-0.2} = \frac{0.184}{(2.752\times10^{6})^{0.2}} = \frac{0.184}{19.41}
= \mathbf{9.481\times10^{-3}}$$

$$\frac{dp}{dx} = \frac{f}{D_h}\cdot\frac{\rho V_c^2}{2}
= \frac{9.481\times10^{-3}}{2.571\times10^{-3}}\times\frac{190\times(146.5)^2}{2}
= 3.687\times2.038\times10^{6} = \mathbf{75.2\ bar/m}$$

Haaland at $Re_c = 2.752\times10^6$:

| option | $\epsilon$ | $\epsilon/D_h$ | $f$ | $f/f_{smooth}$ | $dp/dx$ | over 0.18 m |
|---|---|---|---|---|---|---|
| smooth reference | — | 0 | 0.009481 | 1.00 | 75.2 bar/m | **13.5 bar** |
| **Q** (machined) | 3 µm | $1.17\times10^{-3}$ | **0.02052** | **2.16** | **162.7 bar/m** | **29.3 bar** |
| **P** (as printed) | 20 µm | $7.78\times10^{-3}$ | **0.03497** | **3.69** | **277.2 bar/m** | **49.9 bar** |

Read the second row before the third: **even the polished channel is more than
twice the smooth-duct friction factor**, because at this Reynolds number a 3 µm
roughness is already well into the transitional-rough regime. The choice is not
between "rough" and "smooth"; it is between rough and rougher.

### (b) The wall chain with roughness enhancement (2)

Applying $h_c\to h_c\times$enhancement and re-solving D1(e)–(f) — note that
$\eta_f$ *falls* as $h_c$ rises, so the enhancement in $h_{c,\mathrm{eff}}$ is
less than the enhancement in $h_c$:

| case | enhancement | $h_c$ (kW/m²K) | $\eta_f$ | $h_{c,\mathrm{eff}}$ (kW/m²K) | $q''$ (MW/m²) | $T_{wg}$ (K) | $T_{wc}$ (K) |
|---|---|---|---|---|---|---|---|
| D1 baseline (smooth $h_c$) | 1.000 | 93.3 | 0.349 | 135.3 | 73.3 | **994** | 792 |
| **P**, $(f_P/f_s)^{1/2}$ | **1.920** | 179.3 | 0.253 | 214.5 | 79.7 | **841** | 622 |
| **P**, measured 1.40 | 1.400 | 130.7 | 0.296 | 171.2 | 76.8 | **910** | 699 |
| **Q**, $(f_Q/f_s)^{1/2}$ | 1.471 | 137.3 | 0.289 | 177.3 | 77.3 | **899** | 686 |

Two facts jump out. First, **cooling harder increases the heat load**: $q''$
rises from 73.3 to 79.7 MW/m² as the coolant side improves, because a colder
wall opens a larger gas-side $\Delta T$. Second, and decisively, **only the
optimistic enhancement gets $T_{wg}$ under 850 K.** At the honest measured
enhancement of 1.40 the wall is at 910 K and the design still fails.

### (c) Recommendation (3)

**Recommend Q — and do not treat either option as the fix.**

**What changes and what does not.** The coking verdict never changes: $T_{wc}$
is 622–792 K in every case, comfortably inside methane's 900–950 K limit. The
hot-wall verdict is the only thing in play, and it changes **only if you believe
the $(f/f_s)^{1/2}$ enhancement at face value.** At the enhancement that rocket
channels actually measure — 1.3 to 1.6 — option P gives $T_{wg} = 899$–910 K
against an 850 K band. **Option P does not close the design; it only makes the
failure smaller.**

**The benefit, numerically.** Best case, P buys 153 K of hot-wall temperature
(994 → 841 K) over the smooth-channel baseline. Realistic case, it buys 84 K
(994 → 910 K) and still fails.

**The cost, numerically.** P costs 49.9 bar against Q's 29.3 bar *in the 0.18 m
throat zone alone* — 20.6 bar of extra pump discharge pressure over 7 % of the
circuit, on top of whatever the rest of the jacket costs, for the life of the
programme. At 33.8 kg/s of methane, $\rho = 190$ kg/m³ and $\eta_p = 0.70$ that
is $\dot m\Delta p/(\rho\eta_p) = 33.8\times20.6\times10^{5}/(190\times0.70)
\approx 0.52$ MW of additional fuel-pump shaft power — which in a staged
combustion cycle is preburner flow and turbine temperature, and in a
gas-generator cycle is propellant dumped overboard. Against that, Q costs 18 %
on the liner and five weeks.

**The argument that decides it.** *You do not buy thermal margin from an
uncontrolled manufacturing variable.* As-built internal roughness in a printed
channel varies with build orientation, powder lot, laser parameters and where in
the build volume the part sat. If the design closes only because $\epsilon =
20$ µm, then the wall temperature of every unit is a function of a number nobody
specifies, nobody measures on the flight article, and nobody can hold constant
between builds. That is not a design margin; it is an undeclared dependency of
exactly the same kind as a kerolox engine relying on its own soot layer — and
soot at least re-forms. Take the polished channel, take the lower and more
repeatable pressure drop, and fix the hot wall where D1 said it must be fixed:
on the channel schedule at the throat, or with film cooling. [J]

**The measurement I would demand before committing:** a **flow test and a
calorimeter test on representative printed channels** — measure $\Delta p$
versus flow on a real part to get $f$ (not Haaland), and measure the heat
transfer to get the *actual* enhancement rather than $(f/f_s)^{1/2}$. Both on
several parts from different builds, because the number that matters is the
scatter, not the mean.

**What would reverse the recommendation:** if the measured enhancement came back
at or above 1.9 **with part-to-part scatter under about ±10 %**, and the jacket
$\Delta p$ budget could absorb the extra ~21 bar without moving the cycle, then
P becomes defensible — it would be delivering 150 K of hot-wall margin
repeatably and for free. Absent that scatter data, P is a design that closes on
a hope.

### Rubric (8)

| | |
|---|---|
| 1 | smooth $f$ and $dp/dx$ |
| 1 | Haaland applied correctly for both roughnesses |
| 1 | pressure drop over the 0.18 m zone for all three cases |
| 1 | the chain re-solved at the full enhancement, with $\eta_f$ recomputed (not held at 0.349) |
| 1 | the chain re-solved at 1.40, and the observation that $q''$ **rises** as the coolant side improves |
| 1 | a clear recommendation with the D1 verdict that changes (hot wall) and the one that does not (coking) explicitly separated |
| 1 | both benefit and cost given as numbers, including the pump-power or pump-pressure consequence |
| 1 | names a specific confirming measurement **and** a specific result that would reverse the decision |

**Full marks are available for recommending P**, provided the answer
(i) acknowledges that the closure depends on an enhancement above what is
usually measured, (ii) prices the pressure drop, and (iii) proposes to control
roughness as a specified, inspected parameter rather than accepting it as
as-built. A recommendation of P that simply says "the wall is cooler and it is
cheaper" scores at most 4: it has taken the benefit at face value, ignored the
$\Delta p$, and made a repeatability problem into a design assumption.

An answer that recommends neither option and instead redesigns the channel
schedule scores full marks if it prices the redesign and still answers the
question actually asked (P or Q for the hardware in front of you).

---

## D3 — Where the regenerative circuit ends (6 points)

### (a) $\varepsilon = 30$ (3)

$$M_e(\gamma = 1.16,\ \varepsilon = 30) = \mathbf{3.844}$$

$$T_{aw} = 3560\times\frac{1+0.9\times0.08\times(3.844)^2}{1+0.08\times(3.844)^2}
= \mathbf{3367\ K}$$

$$\left(\frac{A_t}{A}\right)^{0.9} = (1/30)^{0.9} = 0.046837$$

Iterating $\sigma$ against the (very hot) wall temperature converges to
$\sigma = 0.8241$, so

$$h_g = K_0\left(\frac{A_t}{A}\right)^{0.9}\sigma
= 2.176\times10^{4}\times0.046837\times0.8241 = \mathbf{840\ W/(m^2 K)}$$

Solving $\varepsilon_{em}\sigma_{SB}T_w^4 = h_g(T_{aw}-T_w)$, i.e.
$0.85\times5.670374\times10^{-8}\,T_w^4 = 840(3367-T_w)$:

$$T_w = \mathbf{2147\ K}, \qquad q''_{rad} = 0.85\sigma_{SB}T_w^4 = \mathbf{1.02\ MW/m^2}$$

### (b) Further downstream (1)

| $\varepsilon$ | $M_e$ | $T_{aw}$ (K) | $(A_t/A)^{0.9}$ | $\sigma$ | $h_g$ (W/m²K) | $T_w$ (K) | $q''_{rad}$ (MW/m²) |
|---|---|---|---|---|---|---|---|
| 30 | 3.844 | 3367 | 0.046837 | 0.824 | **840** | **2147** | 1.02 |
| 60 | 4.266 | 3349 | 0.025099 | 0.812 | **444** | **1908** | 0.64 |
| 100 | 4.578 | 3337 | 0.015849 | 0.806 | **278** | **1742** | 0.44 |

Note the mechanism plainly: **$T_{aw}$ falls by 1 % between $\varepsilon = 30$
and 100 while $h_g$ falls by a factor of three.** What makes a skirt survivable
is the collapse of the gas-side coefficient, not any cooling of the gas.

### (c) Materials, and the Bartz correction (2)

**On raw Bartz:**

- **Carbon–carbon (≈2,000 K)** can begin at about $\varepsilon = 45$–50 — at
  $\varepsilon = 45$ the equilibrium is 2,006 K, and by $\varepsilon = 60$ it is
  a comfortable 1,908 K.
- **Silicide-coated C-103 niobium (≈1,600 K)** cannot begin anywhere on this
  nozzle: even at $\varepsilon = 100$ the equilibrium is 1,742 K, 142 K over the
  coating's service limit.

**With the Module 10 §3.7 correction.** Bartz over-predicts $h_g$ by 30–50 %
beyond $\varepsilon \approx 10$, because the boundary layer there is thick and
growing and no longer resembles developed pipe flow, and because the chemistry
is frozen so the stagnation $c_p$ is wrong. Taking $0.6h_g$:

$$\varepsilon = 60:\quad h_g = 276\ \mathrm{W/(m^2K)} \quad\Rightarrow\quad
T_w = \mathbf{1741\ K}\ (\text{from } 1908\ \mathrm{K})$$

$$\varepsilon = 100:\quad h_g = 173\ \mathrm{W/(m^2K)} \quad\Rightarrow\quad
T_w = \mathbf{1584\ K}\ (\text{from } 1742\ \mathrm{K})$$

The correction moves each station down by 160–170 K, i.e. it moves the *usable
start of a carbon–carbon skirt* from about $\varepsilon = 45$ to about
$\varepsilon = 30$, and it brings a niobium skirt inside its limit — but only
just, and only at $\varepsilon \approx 100$.

**What I would actually design to. [J]** End the regenerative circuit at
$\varepsilon \approx 40$–50 and run a carbon–carbon skirt from there, sized on
the *uncorrected* Bartz prediction so that the 30–50 % correction is margin
rather than budget. Do **not** put a coated-niobium skirt on this engine at any
station reachable on a 120:1 nozzle: the 1,600 K coating limit is a hard,
coating-integrity limit whose failure mode is catastrophic oxidation of the
substrate, and the whole prediction rests on a correlation that is admitted to
be 30–50 % wrong at these stations. And in either case the design number is not
the Bartz number: it is the **measured skirt temperature** from a hot fire with
thermocouples or a calibrated pyrometer on the outer wall, which is the only
station in the engine where the wall temperature is directly observable.

### Rubric (6)

| | |
|---|---|
| 1 | $M_e$ and $T_{aw}$ at $\varepsilon = 30$ |
| 1 | $h_g$ from $K_0(A_t/A)^{0.9}\sigma$ with the $\sigma$ iteration |
| 1 | equilibrium $T_w$ from a correctly posed radiation balance |
| 1 | the $\varepsilon = 60$ and 100 results |
| 1 | correct material verdicts, including that niobium does **not** fit on raw Bartz |
| 1 | the $0.6h_g$ recomputation **and** a stated design position that treats the correction as margin and defers to measurement |

Solving the radiation balance as $q''_{rad} = h_g T_{aw}$ (omitting the
$-T_w$) is a wrong setup and scores zero for the third mark; it over-predicts
$T_w$ badly because at these temperatures $T_w$ is a large fraction of $T_{aw}$.

---

# K4. Common wrong answers, and what they reveal

**Using nozzle-stagnation pressure everywhere.** The exam asks for the station
three times (B1, B2c/e, and implicitly in D1's Bartz input). The recurring error
is to carry 130 bar through the injector calculation, which flatters the chug
gain margin by 4 %, and to carry the injector-end value into $c^*$ or Bartz,
which inflates $\eta_{c^*}$ and $h_g$. Both errors run in the *optimistic*
direction, which is why the course insists on the station.

**Using ideal $c^*$ where delivered $c^*$ belongs.** Bartz's $(p_0/c^*)$ term
*is* the throat mass flux $\dot m/A_t$, so it takes the delivered value; using
the ideal value here understates $h_g$ by about 2.5 %. The same student usually
uses the delivered value in $t_s = L^*/(\Gamma^2c^*)$, where the ideal value
belongs because the identity $RT_c = \Gamma^2c^{*2}$ requires it. B1(d) exists
to force that distinction into the open.

**Treating $\eta_f$ as a constant when the coolant side changes.** In D2, raising
$h_c$ by 1.92 raises $h_{c,\mathrm{eff}}$ by only 1.59, because a better coolant
side makes the land a worse fin. Students who scale $h_{c,\mathrm{eff}}$
directly over-predict the benefit by 20 %.

**Concluding "the wall is too hot, use a thicker liner."** A thicker wall raises
$\Delta T_{wall}$, raises $\sigma_{th}$ and shortens LCF life. The wall is 6 % of
the resistance in D1; the metal is not the problem and never is in a copper-alloy
chamber.

**Believing one separation criterion.** In C2 the two criteria return opposite
verdicts on the same hardware. A student who picks one, reports "attached" or
"separated", and moves on has missed the entire point of the question — which is
that at that operating point the criteria are not decision-grade and the honest
output is a test requirement, not a number.

**Taking the venting credit in C1.** The factor of 3.4 rests on $t_b$, which is
never measured. Writing a 61 ms ignition-detect requirement on that basis is the
single most dangerous answer available in this paper.

**Quoting a company-claimed figure as measured.** Any answer that uses a Raptor
chamber pressure, thrust-to-weight or $I_{sp}$ without the attribution loses a
mark under the general grading rule, in any section.

---

## Score interpretation

| score | meaning |
|---|---|
| 90–100 | interview mastery: could defend this material to a senior propulsion engineer |
| 75–89 | working engineering knowledge: correct analysis, minor gaps in judgment |
| 60–74 | familiarity: concepts right, calculations or reasoning incomplete |
| < 60 | re-study modules 05–11 before sitting Part II Exam B |

Section-level diagnosis: a low Section A with a strong Section D means you can
run the machinery but have not internalised why the propellant was chosen; a
strong Section B with a weak Section C means you have the steady-state engine
and not the transient one, which is where hardware is actually lost.
