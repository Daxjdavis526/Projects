# Module 29 — Cold-Gas Performance Modeling — Answer key

Constants: $g_0=9.80665$ m/s², $R_u=8314.46$ J/(kmol·K).
N₂: $\mathcal{M}=28.014$, $R=296.797$ J/(kg·K), $\gamma=1.400$,
$\Gamma=0.684731$.
He: $\mathcal{M}=4.003$, $R=2077.06$, $\gamma=1.667$.
Ar: $\mathcal{M}=39.948$, $R=208.132$, $\gamma=1.667$.
R-236fa: $\mathcal{M}=152.04$, $R=54.686$, $\gamma\approx1.08$.
n-butane: $\mathcal{M}=58.122$, $R=143.05$, $\gamma\approx1.09$.
Viscous model: $\eta_{visc}=1-b(\varepsilon)/\sqrt{Re_t}$,
$b(\varepsilon)=10\sqrt{\varepsilon/50}$, $\lambda=0.983$ (15° cone),
$\eta_I=\lambda\eta_{visc}$. Nitrogen $\mu_{293}=1.76\times10^{-5}$ Pa·s,
scaled as $T^{0.7}$ to the throat static temperature.
Every number is reproduced by `tools/examples/29.py`.

---

## K1. Problem solutions

### Conceptual

**C1.** Two different parcels of gas follow two different paths, and the
question conflates them. The gas that *leaves* is throttled across the
orifice: for it, $h$ is conserved and the process is irreversible. The gas
that *stays* never crosses the orifice. Draw a control surface around only
the gas that will still be in the tank at the end of the discharge: its
mass is constant, no heat crosses it (that is the adiabatic assumption),
and the only interaction is quasi-static boundary work as it expands
against the departing gas, which offers no dissipation of its own. Constant
mass + adiabatic + reversible = isentropic, hence $pv^\gamma=$ const. The
entropy generated in the throttle leaves with the gas that was throttled.

A grader should look for the phrase "the gas remaining in the tank is not
the gas that was throttled."

**C2.** (i) 76 s is the *ideal* value for nitrogen at $\varepsilon\approx50$
and 300 K; no real thruster delivers ideal, and the standard discount is
about 0.91 even for a large one. (ii) At 0.5 mN and 1.5 bar the throat is
tens of microns and $Re_t$ is of order $10^3$, where the viscous efficiency
is 0.7 or worse. Ideal times 0.7 times the divergence loss is ~52 s, not
76 s. **The first thing to ask for is the throat diameter** — with $F$ and
$p_0$ you have $\dot m$ and $A_t$, and with $D_t$ you have $Re_t$, which is
the single number that decides whether the claim is defensible. Second
would be whether the 76 s is predicted or measured, and on what stand.

**C3.** At fixed $F$ and fixed $I_{sp}$, $\dot m$ is fixed. Throat area
scales as $A_t=F/(C_Fp_0)\propto p_0^{-1}$, so $D_t\propto p_0^{-1/2}$.
Then $Re_t=4\dot m/(\pi D_t\mu^*)\propto p_0^{+1/2}$: **lowering plenum
pressure lowers the Reynolds number**, which lowers $\eta_{visc}$, which
lowers $I_{sp}$. Similarly at fixed $p_0$, $\dot m\propto F$ and
$D_t\propto\sqrt{F}$, so $Re_t\propto\sqrt{F}$. Both of the levers you
reach for to get a finer impulse bit — less thrust, less pressure — push
you into the viscous regime. The escape is to shorten the *pulse*, not the
thrust or the pressure.

**C4.** **Helium needs the larger tank.** At 300 bar and 300 K helium
stores at ~41 kg/m³ against ~290 kg/m³ for nitrogen — a factor of 7 in
density against a factor of 2.3 in $I_{sp}$, so helium needs about three
times the volume for the same total impulse. **Helium is also far more
likely to miss its end-of-life budget**, for two reasons: it leaks
through seals and even through metal lattices (permeation) at rates one to
two orders of magnitude above nitrogen's, and its lower molar mass means a
given volumetric leak carries less mass but a given *molar* leak path
passes far more of it. In molecular flow helium's throughput is
$\sqrt{28.014/4.003}=2.6\times$ nitrogen's through the same hole.

**C5.** (a) starts at $p_i$ and decays as $p_ie^{-t/\tau}$: concave-up
exponential, asymptotic to zero, with $\tau$ marked as the time to fall to
$p_i/e$ (or as the intercept of the initial tangent with the time axis).
(b) starts at $p_i$ and falls on a *straight line* of slope
$-\dot mRT_i/V$ until it reaches $p_{lock}$, at which point it kinks onto
an exponential of the same form as (a) with a much longer $\tau$ (because
$A_t$ is unchanged but $p$ is small). Mark $p_{lock}$ on the ordinate and
the kink. Full marks require the kink and the correct curvature on each
side.

**C6.** Both are consequences of the sign of the Joule–Thomson
coefficient, which is positive below the inversion temperature and negative
above it. Nitrogen's inversion temperature is ~620 K, so at 300 K
$\mu_{JT}>0$ (≈+0.15 K/bar averaged over a large drop) and the gas cools on
throttling — about 30 K over a 200→5 bar reduction. Helium's inversion
temperature is ~45 K, so at 300 K $\mu_{JT}<0$ (≈−0.06 K/bar) and the gas
*heats* — about +12 K over the same drop. Physically: below inversion the
attractive part of the intermolecular potential dominates and the gas must
spend internal energy to pull molecules apart; above it, the repulsive part
dominates and separating them releases energy.

Consequence: $I_{sp}\propto\sqrt{T_0}$, so the nitrogen plenum at 263 K
delivers $\sqrt{263/293}=0.948$ of the room-temperature $I_{sp}$ — a 5 %
loss — while the helium plenum at 305 K gains 1 %. In practice the
nitrogen loss is recovered by putting thermal mass and residence time
between the regulator and the thruster.

**C7.** From Eq. 3.20, $I_{bit}=F[t_{on}+(\tau_e-\tau_f)k]$ with
$k=1-e^{-t_{on}/\tau_f}$. If $\tau_e=\tau_f$ the bracket is $t_{on}$ for
every $t_{on}$: the impulse *lost* during the exponential rise,
$F\tau_f k$, is exactly the impulse *gained* in the exponential tail,
$F\tau_e k$. Physically, a linear first-order system's step response and
its decay have the same integral deficit and surplus when the constants
match.

Real thrusters do not satisfy it because the fill and empty paths are not
the same path. The plenum fills through the valve seat area $A_v$ *in
parallel with* draining through the throat, so
$\tau_f\approx\tau_e/(1+A_v/A_t)$, and $A_v\gg A_t$ for any solenoid valve
feeding a sub-millimetre throat. Filling is fast, emptying is throat-
limited, $\tau_e>\tau_f$, and short pulses over-deliver.

**C8.** They measure different things. The 0.91 figure is the ratio of a
*steady-state, thrust-stand, large-nozzle* measurement to the frozen-ideal
prediction — it is essentially the viscous plus divergence loss of a
laboratory thruster at $Re_t\sim2\times10^4$, and Eq. 3.12/3.13 reproduce
it. SAFER's 40 s is a *mission-derived* number: total $\Delta v$ divided by
total propellant, over hundreds of short pulses from a system with valve
dead volume, plenum fill and dump losses on every pulse, a cold plenum
downstream of a large pressure drop, and gas spent on pulses that produced
torque rather than the measured translation. It also inherits the
uncertainty in the reference mass of a suited crew member.

The reconciliation: **steady-state nozzle efficiency and mission-average
$I_{sp}$ are different quantities and a factor of nearly two can separate
them.** A strong answer names at least three of the loss mechanisms and
says which is likely largest (per-pulse fill/dump losses, because SAFER
fires in short bursts through 24 thrusters).

---

### Calculation

**P1 — argon tank.**

$R = 8314.46/39.948 = 208.132$ J/(kg·K).

(a) Ideal:
$$m=\frac{pV}{RT}=\frac{2.50\times10^7\times7.50\times10^{-4}}{208.132\times288}
=\frac{18{,}750}{59{,}942}=\mathbf{0.3128\ kg}$$

(b) Interpolating Table 3.1 for argon between 240 bar ($Z=1.04$) and
300 bar ($Z=1.10$) gives $Z(250) = 1.04+0.06\times(10/60)=\mathbf{1.05}$:
$$m=\frac{0.3128}{1.05}=\mathbf{0.2979\ kg}$$
The ideal answer is 4.8 % high. (Argon's $Z$ dips *below* 1 near 100 bar
before rising, which is why its correction at 250 bar is smaller than
nitrogen's — worth noting, and a common source of confusion.)

(c) Ideal vacuum $I_{sp}$ at $\varepsilon=40$, $T_0=288$ K, $\gamma=1.667$:
$c^*=\sqrt{208.132\times288}/\Gamma$ with $\Gamma(1.667)=0.72623$, giving
$c^*=337.12$ m/s; $C_F(\varepsilon{=}40)=1.6037$;
$$I_{sp}=\frac{337.12\times1.6037}{9.80665}=\mathbf{55.13\ s}$$

(d) 5:1 isothermal blowdown: $\phi=1-1/5=0.800$, so
$m_{used}=0.800\times0.2979=0.2383$ kg, and with $\eta_I=0.90$:
$$I_{tot}=0.2383\times0.90\times55.13\times9.80665=\mathbf{116.0\ N\!\cdot\!s}$$

*Common slip:* using the ideal mass in (d) inflates this to 121.8 N·s.

---

**P2 — sizing a GN₂ system.**

1. **Thrust from the impulse-bit requirement.** With $\tau_e=\tau_f$ the
   impulse bit is exactly $Ft_{on}$ (Eq. 3.20), so
   $$F \le \frac{I_{bit}}{t_{on,min}}=\frac{1.0\times10^{-4}}{8\times10^{-3}}=\mathbf{12.5\ mN}$$
   Take $F=12.5$ mN. (Choosing less thrust would meet the bit requirement
   with margin but lengthens every manoeuvre and lowers $Re_t$.)

2. **Throat.** $C_F(\varepsilon{=}50,\text{vac},\gamma{=}1.4)=1.7292$.
   $$A_t=\frac{F}{C_Fp_0}=\frac{0.0125}{1.7292\times4.00\times10^5}
   =1.807\times10^{-8}\ \mathrm{m^2}\;\Rightarrow\;D_t=\mathbf{0.1517\ mm}$$

3. **Mass flow.**
   $\dot m=\Gamma p_0A_t/\sqrt{RT_0}=0.684731\times(4.00\times10^5\times1.807\times10^{-8})/294.96
   =\mathbf{1.678\times10^{-5}\ kg/s}$.

4. **Reynolds number.** $T^*=2T_0/2.4=244.29$ K,
   $\mu^*=1.76\times10^{-5}(244.29/293.15)^{0.7}=1.549\times10^{-5}$ Pa·s.
   $$Re_t=\frac{4\times1.678\times10^{-5}}{\pi\times1.517\times10^{-4}\times1.549\times10^{-5}}=\mathbf{9.09\times10^{3}}$$

5. **Efficiency and $I_{sp}$.** $\eta_{visc}=1-10/95.4=0.895$;
   $\eta_I=0.983\times0.895=\mathbf{0.880}$;
   $I_{sp}=0.880\times75.96=\mathbf{66.8\ s}$.

6. **Propellant.** $m_p=I_{tot}/(I_{sp}g_0)=50/(66.83\times9.80665)=\mathbf{76.3\ g}$.

7. **Tank.** $\rho=p_i/(ZRT)=2.00\times10^7/(1.10\times296.797\times293.15)
   =\mathbf{209.0\ kg/m^3}$. Usable fraction to the 5 bar lockup,
   isothermal: $\phi=1-5/200=0.975$. Loaded mass $=76.3/0.975=78.2$ g, so
   $$V=\frac{78.2\times10^{-3}}{209.0}=3.74\times10^{-4}\ \mathrm{m^3}=\mathbf{0.374\ L}$$

8. **Duty.** Accumulated on-time $=I_{tot}/F=50/0.0125=\mathbf{4000\ s}$
   (1.11 h). Number of minimum-size pulses
   $=50/1.0\times10^{-4}=\mathbf{5.0\times10^{5}}$.

**Sanity check.** 0.374 L at 200 bar in a 3U bus is a real but tight COPV;
50 N·s is between VACCO's Standard MiPS (44 N·s) and Micro MiPS (93 N·s),
both of which do it at 2.7 bar in a fraction of the volume. Half a million
firings is within the 880,000 quoted for the Standard MiPS, so the valve
cycle life is not the binding constraint — the volume is.

---

**P3 — blowdown $p(t)$, $F(t)$, and impulse.**

$A_t=\pi(2.00\times10^{-4})^2/4=3.1416\times10^{-8}$ m².

**Time constant.**
$$\tau=\frac{V}{\Gamma A_t\sqrt{RT_i}}
=\frac{2.50\times10^{-4}}{0.684731\times3.1416\times10^{-8}\times294.96}=\mathbf{39.40\ s}$$

**Initial state.**
$F_i=C_Fp_iA_t=1.7292\times2.5\times10^6\times3.1416\times10^{-8}=\mathbf{135.8\ mN}$;
$m_i=p_iV/(RT_i)=\mathbf{7.183\ g}$;
$\dot m_i=182.3$ mg/s (check: $m_i/\dot m_i=39.4$ s $=\tau$ ✓).

| $t$ (s) | $p_t$ (bar) | $F$ (mN) |
|---|---|---|
| 0 | 25.000 | 135.81 |
| 50 | 7.028 | 38.18 |
| 100 | 1.975 | 10.73 |
| 150 | 0.555 | 3.02 |
| 200 | 0.156 | 0.85 |

**Isothermal, down to 5 bar.**
$t=\tau\ln5=39.40\times1.6094=\mathbf{63.4\ s}$;
$\phi=0.800$, $m_{used}=5.747$ g;
$$I_{tot}=F_i\tau(1-p_f/p_i)=0.13581\times39.40\times0.80=\mathbf{4.281\ N\!\cdot\!s}$$
(equivalently $5.747\times10^{-3}\times75.96\times9.80665=4.281$ N·s ✓).

**Adiabatic, down to 5 bar.**
$x_f=(0.2)^{1/1.4}=0.3168$;
$$t=\frac{2\tau}{\gamma-1}\left(x_f^{-(\gamma-1)/2}-1\right)
=197.0\times(0.3168^{-0.2}-1)=197.0\times0.2585=\mathbf{50.9\ s}$$
$m_f=0.3168\times7.183=2.276$ g, $m_{used}=4.907$ g, $\phi=0.683$;
$$I_{tot}=C_Fc^*_im_i\frac{2}{\gamma+1}\left[1-\left(\frac{m_f}{m_i}\right)^{1.2}\right]
=1.7292\times430.78\times7.183\times10^{-3}\times0.8333\times0.7445=\mathbf{3.337\ N\!\cdot\!s}$$
$T_f=293.15\times0.2^{0.2857}=185.1$ K.

**Differences.** Time to 5 bar: **19.7 % shorter** adiabatically. Total
impulse: **22.1 % lower**. Both have the same cause — the retained gas
cools, so pressure falls faster per unit mass removed, more mass is
stranded at cutoff, and the mass that does leave carries a lower $c^*$.

---

**P4 — He vs N₂ vs R-236fa in 0.600 L.**

Tank mass, high pressure: $m_{tank}=1.5pV/(\sigma/\rho_m)$ with
$\sigma/\rho_m=500\times10^6/4430=1.129\times10^5$ m²/s²:
$$m_{tank}=\frac{1.5\times3.00\times10^7\times6.00\times10^{-4}}{1.129\times10^5}=\mathbf{0.239\ kg}$$
Low-pressure can: 0.100 kg by assumption (the stress-based number is 2 g;
minimum gauge and handling stiffness govern).

| | He | N₂ | R-236fa |
|---|---|---|---|
| $\rho$ stored (kg/m³) | $3.00\times10^7/(1.17\times2077.06\times293.15)=42.1$ | $3.00\times10^7/(1.19\times296.797\times293.15)=289.8$ | $1360\times0.90=1224$ |
| $m_{prop}$ | **25.3 g** | **173.9 g** | **734.4 g** |
| $I_{sp}$ ideal ($\varepsilon$=50, 293.15 K) | 176.01 s | 75.96 s | 42.75 s |
| $I_{sp}$ realized ($\eta_I=0.90$) | 158.41 s | 68.36 s | 38.47 s |
| $I_{tot}$ | **39.3 N·s** | **116.5 N·s** | **277.1 N·s** |
| $m_{tank}$ | 239 g | 239 g | 100 g |
| $I/V_{prop}$ (N·s/cm³) | 0.065 | 0.194 | **0.462** |
| $I/(m_{prop}+m_{tank})$ (N·s/kg) | 148 | 282 | **332** |

**Ranking: R-236fa > N₂ > He, on both figures of merit.** Helium loses
badly on both despite having 2.3× nitrogen's and 4.1× R-236fa's $I_{sp}$ —
its stored density is so low that the tank dominates everything.

**Comparison with MarCO.** The R-236fa column gives 332 N·s/kg against
MarCO's flight value of $755/3.49=\mathbf{216\ N\!\cdot\!s/kg}$. The
estimate is 54 % optimistic, which is the right kind of wrong: it excludes
eight thrusters, the valves, the electronics, the structure and the
mounting interface. Back out the difference and the non-tank dry mass of a
real module is roughly 0.8–0.9 kg — consistent with MarCO's 3.49 kg wet
carrying ~1.93 kg of propellant. **An estimate that lands within a factor
of 1.5 of flight while omitting all the dry hardware is behaving
correctly.**

---

**P5 — $I_{sp}$ penalty at $Re_t\approx1000$.**

$C_F=1.7292$, so
$$A_t=\frac{1.00\times10^{-3}}{1.7292\times6.00\times10^4}=9.639\times10^{-9}\ \mathrm{m^2}
\;\Rightarrow\;D_t=\mathbf{110.8\ \mu m}$$
$$\dot m=\Gamma\frac{p_0A_t}{\sqrt{RT_0}}
=0.684731\times\frac{6.00\times10^4\times9.639\times10^{-9}}{294.96}=\mathbf{1.343\times10^{-6}\ kg/s}$$
$T^*=244.29$ K, $\mu^*=1.549\times10^{-5}$ Pa·s,
$$Re_t=\frac{4\times1.343\times10^{-6}}{\pi\times1.108\times10^{-4}\times1.549\times10^{-5}}=\mathbf{996}$$

$\eta_{visc}=1-10/\sqrt{996}=1-0.3169=\mathbf{0.683}$;
$\lambda=0.983$; $\eta_I=\mathbf{0.672}$;
$$I_{sp}=0.672\times75.96=\mathbf{51.0\ s}$$
**Penalty: 25.0 s, or 32.8 % of ideal.**

**Validity.** $Re_t\approx1000$ is the bottom of the range where Eq. 3.12
means anything. Rothe's electron-beam measurements show the boundary layers
have merged by here, so there is no inviscid core and the $Re^{-1/2}$
displacement argument that motivates the correlation no longer strictly
applies `[Rothe71]`. The honest statement is "51 s ± 5 s, and the true
value is more likely below than above."

**What to do about $\varepsilon$.** Reduce it. At $\varepsilon=20$,
$b=6.32$, $D_t$ and $Re_t$ barely change, ideal $I_{sp}$ falls from 75.96
to 74.23 s but $\eta_{visc}$ rises to 0.80, giving $I_{sp}\approx58$ s —
**seven seconds better than the 50:1 nozzle.** Full marks require both the
number and the reason: at low $Re$ the divergent section is a friction
surface first and an expansion surface second.

---

**P6 — adiabatic blowdown 200 → 20 bar.**

$T_f=T_i(p_f/p_i)^{(\gamma-1)/\gamma}$, $\phi=1-(p_f/p_i)^{1/\gamma}$,
$p_f/p_i=0.10$, $T_i=293.15$ K. Isothermal $\phi$ would be 0.900 in all
three cases.

| gas | $\gamma$ | $T_f$ (K) | drop (K) | $\phi_{adiab}$ | $\phi$ shortfall |
|---|---|---|---|---|---|
| N₂ | 1.400 | **151.8** | 141.3 | **0.807** | −10.3 % |
| He | 1.667 | **116.7** | 176.5 | **0.749** | −16.8 % |
| R-236fa | 1.080 | **247.2** | 46.0 | **0.881** | −2.1 % |

**Helium suffers most**, and the reason is $\gamma$: a monatomic gas has no
internal modes to buffer the temperature change, so all of the expansion
work comes out of translational energy. R-236fa, with a dozen atoms and a
$\gamma$ close to 1, is nearly isothermal by construction — it behaves like
a gas with a very large heat capacity because it *has* one.

**Which result to trust least: R-236fa, by a wide margin.** Its $\gamma$ is
recorded at confidence C in the verification worksheet, it is a real gas
near saturation where $\gamma$ is strongly $p$- and $T$-dependent, and at
247 K a 2.7-bar-class refrigerant would be well into its two-phase region —
at which point the ideal-gas polytropic relation is simply the wrong model
and the tank pressure follows the saturation curve instead. The helium
number is the most trustworthy ($\gamma=1.667$ exactly for a monatomic
ideal gas), the nitrogen number next.

*(A student who notices that a 200 bar R-236fa tank is physically
impossible — the fluid is a liquid at 2.7 bar vapour pressure — should get
credit. The problem is a $\gamma$-sensitivity exercise, not a design.)*

---

**P7 — impulse bit, $\tau_f=2$ ms, $\tau_e=6$ ms, $F=25$ mN.**

$I_{bit}=F[t_{on}+(\tau_e-\tau_f)(1-e^{-t_{on}/\tau_f})]
=0.025[t_{on}+0.004k]$.

| $t_{on}$ (ms) | $k$ | $I_{bit}$ (μN·s) | $Ft_{on}$ (μN·s) | deviation |
|---|---|---|---|---|
| 3 | 0.7769 | **152.7** | 75.0 | **+103.6 %** |
| 6 | 0.9502 | **245.0** | 150.0 | +63.3 % |
| 12 | 0.9975 | **399.8** | 300.0 | +33.3 % |
| 40 | 1.0000 | **1100.0** | 1000.0 | +10.0 % |

**Sensitivity at $t_{on}=3$ ms.**
$$\frac{\partial I_{bit}}{\partial t_{on}}
=F\left[1+\frac{\tau_e-\tau_f}{\tau_f}e^{-t_{on}/\tau_f}\right]
=0.025\left[1+2\times0.2231\right]=0.0362\ \mathrm{N}$$
For $\pm0.3$ ms of jitter: $\Delta I_{bit}=\pm0.0362\times3\times10^{-4}
=\pm\mathbf{10.9\ \mu N\!\cdot\!s}$, i.e. $\pm7.1$ % of the 152.7 μN·s bit.

**The engineering point.** A 10 % timing error produces a 7.1 % impulse
error — the tail is insensitive to when the valve shut, so the asymmetry
*damps* jitter here. But the bit itself is twice the naive $Ft_{on}$, so a
pointing budget written against $Ft_{on}$ is wrong by a factor of two.
Calibrate the impulse bit; never compute it from thrust times pulse width.

---

**P8 — leakage over 7 years.**

$t=7\times365.25\times86400=2.209\times10^{8}$ s.
One std cm³ of N₂ $=101325\times10^{-6}/(296.797\times273.15)
=1.250\times10^{-6}$ kg.

(a) **Molecular flow.**
$Q_{N_2}=5\times10^{-5}\sqrt{4.003/28.014}=1.890\times10^{-5}$ std cm³/s.
$$m_{leak}=1.890\times10^{-5}\times2.209\times10^{8}\times1.250\times10^{-6}=\mathbf{5.22\ g}
=\mathbf{4.35\ \%}\ \text{of 120 g}$$

(b) **Viscous flow.** $Q_{N_2}=5\times10^{-5}\times1.10=5.50\times10^{-5}$
std cm³/s, giving $m_{leak}=\mathbf{15.2\ g}=\mathbf{12.7\ \%}$.

**The specification to write instead.** For a 1 % allowance,
$m_{allow}=1.20$ g, so the permitted nitrogen throughput is
$$Q_{N_2}=\frac{1.20\times10^{-3}}{2.209\times10^{8}\times1.250\times10^{-6}}
=4.35\times10^{-6}\ \text{std cm}^3\text{/s}$$
which is $1.15\times10^{-5}$ std cm³/s He under molecular scaling or
$3.95\times10^{-6}$ under viscous scaling.

**Write the specification in the service gas.** "Total external leakage
$\le4\times10^{-6}$ std cm³/s of GN₂ at 200 bar differential, measured by
pressure decay over 168 h" is unambiguous. A helium specification requires
the supplier and the customer to agree on a flow regime they cannot
observe, and the two answers differ by a factor of 2.9.

---

### Engineering reasoning

**R1.** The colleague's explanation is that at low $p_0$ the chamber cannot
hold below $p_e$, the nozzle over-expands and separates, and $C_F$ is
depressed — recovering as $p_0$ rises only because... no, that is the flaw.
**If the chamber pumping is the limit, $C_F$ gets *worse* as $p_0$ rises**,
because mass flow rises linearly with $p_0$ and the chamber pressure rises
with it while $p_e$ also rises linearly — but the chamber pressure rises
faster once the pumps saturate. The observed trend (rising $C_F$,
levelling off) is the **viscous signature**: $Re_t\propto p_0$ at fixed
geometry, so $\eta_{visc}=1-b/\sqrt{Re_t}$ rises steeply at low $p_0$ and
flattens as $Re_t$ passes $10^4$.

**The distinguishing measurement: the vacuum-chamber pressure recorded
simultaneously with each data point, at full flow.** If the chamber
pressure stays below ~$p_e/2$ throughout the sweep, pumping is not the
issue. A second, cheaper discriminator: plot $C_F$ against $Re_t^{-1/2}$ —
a viscous-limited nozzle gives a straight line with intercept
$\lambda C_{F,ideal}$; a pumping-limited one does not.

**I would bet on the viscous explanation**, because the reported shape
(monotonic rise, saturation above 4 bar) is exactly Eq. 3.12 and is the
wrong shape for separation, which produces a sharp knee, not a smooth
saturation. [J]

**R2.** Rate of pressure loss: $0.4$ bar / 7 days
$=4\times10^{4}/(6.048\times10^{5})=0.0661$ Pa/s.
$$\dot m = \frac{V}{RT}\frac{dp}{dt}=\frac{5.00\times10^{-4}\times0.0661}{296.797\times290}
=3.84\times10^{-10}\ \mathrm{kg/s}=0.033\ \mathrm{g/day}$$
$$Q_{N_2}=\frac{3.84\times10^{-10}}{1.250\times10^{-6}}=\mathbf{3.07\times10^{-4}\ std\ cm^3/s}$$
Helium equivalent under molecular scaling:
$3.07\times10^{-4}/0.378=\mathbf{8.13\times10^{-4}}$ std cm³/s — one to two
orders of magnitude above any sensible module specification.

Load: $m=180\times10^5\times5\times10^{-4}/(1.10\times296.797\times290)
=95.1$ g, so the tank empties in ~2,860 days (7.8 years). The mission dies
of leakage before it dies of use.

**Where to look first: the thruster valve seats, then the latch valve
seat.** Reasoning: the latch valve is commanded closed, so an *external*
leak upstream of it would be a tank or fitting leak — possible, but those
are proof-tested at qualification and are usually either far smaller or far
larger than this. A seat leak past the latch valve pressurises the
downstream manifold, and then any one of the thruster valves leaks it to
vacuum; the signature is exactly a slow, steady, temperature-independent
decay. **The confirming test on orbit is free:** command the latch valve
open and see whether the decay rate changes. If it does not, the leak is
upstream of the latch valve and it is the tank or a fitting.

**R3.** Three candidates, ranked:

1. **Partial throat blockage on the low-impulse thruster** (most likely).
   A particle lodged in a sub-millimetre throat reduces $A_t$ and hence
   thrust. On the ground you would measure $C_d$ *below* 1 by the same
   fraction as the thrust deficit, and $C_F=F/(p_0A_{t,\text{drawing}})$
   also low by that fraction; but $C_F$ computed on the *effective* area
   would be normal. The slow growth fits progressive particulate
   accumulation.
2. **Differential valve degradation** (seat wear or actuator drift
   changing $\tau_f$, $\tau_e$ or the dead time). At 6 ms pulses,
   Eq. 3.20 is steeply sensitive to $\tau_e$ — a 1 ms shift in $\tau_e$ on
   a 25 mN thruster moves the bit by 10 %. On the ground, steady-state
   $C_d$ and $C_F$ would both be **normal**; only a pulsed test would show
   it. That is the discriminator.
3. **Thermal asymmetry** — one thruster on the sun-facing side runs a
   warmer plenum, $I_{sp}\propto\sqrt{T_0}$. A 8 % impulse difference needs
   a 17 % temperature difference (50 K), which is large but not impossible
   on a small bus with poor conduction. Steady-state $C_d$ and $C_F$ on the
   ground would be normal, and the signature in flight is a *periodic*
   modulation with the orbit, not a monotonic growth.

**Ranking: 1 > 2 > 3**, because only (1) naturally produces monotonic
growth over a month, and the slow growth is the strongest clue in the
problem statement.

**R4.** **What is wrong:** $\phi=1-p_f/p_i$ is the isothermal result. A
single 300-second continuous burn is long compared with nothing and short
compared with the tank's thermal time constant (order 300 s for a small
COPV, longer for a well-isolated one), so the tank is at best polytropic
with $n\approx1.2$ and at worst adiabatic.

**Size of the error, 6:1 nitrogen blowdown** ($p_f/p_i=0.1667$):
- isothermal: $\phi=0.833$
- polytropic $n=1.2$: $\phi=1-0.1667^{1/1.2}=0.775$
- adiabatic: $\phi=1-0.1667^{1/1.4}=0.722$

So the propellant shortfall is **7 % to 13 %**, and on top of that the
delivered $I_{sp}$ falls with $\sqrt{T_t}$ — a further 8 % on the mean for
the adiabatic case (Eq. 3.18 gives a $2/(\gamma+1)=0.833$ prefactor). **The
combined total-impulse error is 10–22 %.**

**What to ask the thermal analyst for:** the tank's thermal time constant
$\tau_{th}=m_wc_w/(hA)$ at flight conditions, i.e. the wall heat capacity
and a defensible internal heat-transfer coefficient for a gas in a tank in
microgravity with no forced convection. That single number, compared with
the 300 s burn duration, selects $n$. Ask also for the minimum predicted
tank temperature, because 100 K of adiabatic cooling is a seal and
composite-liner problem before it is a performance problem.

**R5.** From the sheet: $\dot m=F/(I_{sp}g_0)=0.010/(65\times9.80665)
=1.569\times10^{-5}$ kg/s. $C_F(\varepsilon{=}100)=1.7498$ and ideal
$I_{sp}=76.87$ s at 293.15 K, so $\eta_I$ must be $65/76.87=0.846$ and
$\eta_{visc}=0.846/0.983=0.860$. With $b(100)=14.14$, that requires
$Re_t=(14.14/0.140)^2=1.02\times10^4$.

Working the pressure that delivers it:

| $p_0$ | $D_t$ | $Re_t$ | $\eta_{visc}$ | predicted $I_{sp}$ |
|---|---|---|---|---|
| 1 bar | 270 μm | 4,780 | 0.795 | 60.1 s |
| 2 bar | 191 μm | 6,760 | 0.828 | 62.6 s |
| **5 bar** | **121 μm** | **10,700** | **0.863** | **65.2 s** |
| 20 bar | 60 μm | 21,400 | 0.903 | 68.2 s |

**Neither the $I_{sp}$ nor the $\varepsilon$ is impossible — the sheet is
incomplete rather than inconsistent.** 65 s at $\varepsilon=100$ closes
only at a plenum pressure of about **5 bar or above**; at 1–2 bar, which is
where a self-pressurising CubeSat system runs, it does not. **The missing
number is the plenum pressure**, and the answer to the question as asked is
"5 bar."

What *is* poor engineering on that sheet is the $\varepsilon$ itself: at
$Re_t\approx10^4$, dropping to $\varepsilon=20$ gives $b=6.32$,
$\eta_{visc}=0.938$ and $I_{sp}=68.5$ s — **3.3 s better with a fifth of
the nozzle length.** The 100:1 nozzle is a specification written by
somebody with liquid-engine instincts.

The impulse bit is self-consistent: 50 μN·s at 10 mN is $t_{on}=5$ ms,
a normal solenoid minimum, though (P7) the delivered bit will exceed
$Ft_{on}$ unless $\tau_e\approx\tau_f$.

---

## K2. Quiz answers

**Q1 (8).**
$$\Gamma=\sqrt{1.4}\left(\frac{2}{2.4}\right)^{\frac{2.4}{0.8}}
=1.18322\times(0.833333)^{3}=1.18322\times0.578704=\mathbf{0.6847}$$
$$c^*=\frac{\sqrt{296.797\times293.15}}{0.684731}=\frac{294.955}{0.684731}=\mathbf{430.8\ m/s}$$
Full marks require four significant figures and the units. A common error
is using $T=300$ K out of habit (gives 435.8 m/s).

**Q2 (8).** **(b), about 13 % high.** $Z\approx1.13$–1.15 for N₂ at 250 bar
and 300 K, and $m\propto1/Z$, so the ideal law over-predicts.
*(a) has the sign backwards — the error is optimistic, not pessimistic,
which is exactly why it survives review. (c) is the right sign but the
wrong magnitude, corresponding to about 100 bar. (d) is the standard
misconception that $Z\to1$ at high pressure; $Z\to1$ at **low** pressure,
and departs monotonically upward above the Boyle temperature.*

**Q3 (12).** $A_t=\pi(1.80\times10^{-4})^2/4=2.545\times10^{-8}$ m².
$$\tau=\frac{V}{\Gamma A_t\sqrt{RT_i}}
=\frac{3.00\times10^{-4}}{0.684731\times2.545\times10^{-8}\times294.96}=\mathbf{58.4\ s}$$
$$t = \tau\ln\frac{p_i}{p_f}=58.37\times\ln 3 = 58.37\times1.0986=\mathbf{64.1\ s}$$

**Q4 (8).** **(b).** At the same cutoff pressure the adiabatic tank is
colder, hence denser, hence holds more stranded mass:
$\phi_{adiab}=1-(p_f/p_i)^{1/\gamma}<1-p_f/p_i=\phi_{iso}$ for
$p_f<p_i$ and $\gamma>1$.
*(a) has the density argument right and the conclusion backwards — denser
residual means more mass left behind, not more expelled. (c) is true only
for the isothermal case; $\phi$ depends on $\gamma$ as well. (d) confuses
"more mass must be expelled to get the same impulse" (true) with "more mass
is available to expel" (false).*

**Q5 (12).** $C_F=1.7292$.
$A_t=2.0\times10^{-3}/(1.7292\times3.0\times10^5)=3.856\times10^{-9}$ m²,
$D_t=\mathbf{70.1\ \mu m}$.
$\dot m=0.684731\times(3.0\times10^5\times3.856\times10^{-9})/294.96
=\mathbf{2.685\times10^{-6}\ kg/s}$.
$T^*=244.29$ K, $\mu^*=1.549\times10^{-5}$ Pa·s,
$$Re_t=\frac{4\times2.685\times10^{-6}}{\pi\times7.01\times10^{-5}\times1.549\times10^{-5}}=\mathbf{3.15\times10^{3}}$$
$\eta_{visc}=1-10/56.1=0.822$, $\eta_I=0.983\times0.822=0.808$,
$$I_{sp}=0.808\times75.96=\mathbf{61.4\ s}$$

**Q6 (8).** **(b), less than $Ft_{on}$.** Here $\tau_f=4$ ms $>\tau_e=2$ ms,
so $(\tau_e-\tau_f)<0$ and Eq. 3.20 gives
$I_{bit}=F[t_{on}-0.002k]<Ft_{on}$. Numerically
$k=1-e^{-3/4}=0.528$, so $I_{bit}=F(3-1.06)\ \mathrm{ms}=0.65Ft_{on}$.
*(a) is the usual case for real thrusters but not this one — the question
deliberately inverts the constants. (c) holds only if $\tau_e=\tau_f$.
(d) is wrong: dead time shifts the pulse but, if it is symmetric, does not
change the impulse; and the question gives enough to answer.*

**Q7 (10).** Expect a **loss**, not a recovery. At 55 μm and CubeSat
plenum pressures $Re_t$ is of order $10^3$; going from $\varepsilon=30$ to
80 adds 1.5 s of ideal $I_{sp}$ (75.08 → 76.60 s) while $b(\varepsilon)$
rises from 7.75 to 12.65, dropping $\eta_{visc}$ at $Re_t=1500$ from 0.800
to 0.673 — delivered $I_{sp}$ falls from 59.0 s to 50.7 s, **a net loss of
8.3 s**. The added divergent length is a friction surface, not an
expansion surface, at this Reynolds number `[Grisnik87]`.

**Instead:** leave the nozzle alone and raise the plenum pressure (which
raises $Re_t$ as $\sqrt{p_0}$) or heat the plenum (which raises $I_{sp}$ as
$\sqrt{T_0}$ and is the first step to a warm-gas system). If neither is
available, requalifying a flight-proven thruster to lose 8 s is the worst
of the three options.

Marks: 4 for predicting a loss, 3 for the mechanism, 3 for a defensible
alternative.

**Q8 (12).** $t=6\times365.25\times86400=1.894\times10^{8}$ s.
$Q_{N_2}=2\times10^{-5}\times0.378=7.560\times10^{-6}$ std cm³/s.
$$m_{leak}=7.560\times10^{-6}\times1.894\times10^{8}\times1.250\times10^{-6}
=\mathbf{1.79\ g}=\mathbf{2.98\ \%}\ \text{of 60 g}$$
**The assumption that could change it by ~3×: the flow regime.** If the
leak is viscous rather than molecular, nitrogen leaks at ~1.10 times the
helium rate instead of 0.378, giving 5.21 g and 8.7 % — a factor of 2.9.
(Accept also: that the leak rate was measured at the service $\Delta p$;
a spec taken at 1 bar and applied at 200 bar is wrong by up to two orders
of magnitude for a viscous path.)

**Q9 (10).** The two questions:

1. **"What is the volume and mass allocation, and which one is binding?"**
   If volume binds, R-236fa wins by a factor of ~2.4 on impulse per unit
   propellant volume and by more once the COPV wall is counted. If mass
   binds and the volume is generous, nitrogen's 68 s against 38 s starts to
   matter and the GN₂ system can win.
2. **"What are the rideshare launch-safety constraints on stored energy,
   and what is the schedule for the pressure-vessel qualification?"** A
   200 bar COPV on a secondary payload is a qualification programme, a
   burst disc, a relief path and a safety review; a 2.7 bar welded can is
   a structure. On a schedule- or approval-constrained rideshare this
   frequently decides the architecture on its own, regardless of physics.

A third acceptable question: **"What is the minimum operating temperature
of the bus?"** A self-pressurising propellant's tank pressure *is* its
vapour pressure, so a cold-biased bus reduces thrust and $Re_t$ together;
a stored-gas system does not care.

**Q10 (12).** $\Delta T=\mu_{JT}\Delta p = 0.15\times(6-200)=-29.1$ K, so
the plenum sits at $293.15-29.1=\mathbf{264.0\ K}$.
$$\frac{I_{sp}(264)}{I_{sp}(293)}=\sqrt{\frac{264.0}{293.15}}=0.949
\quad\Rightarrow\quad \mathbf{-5.1\ \%}$$

**What to do:** interpose thermal mass and residence time between the
regulator and the thruster — a plenum volume bonded to the bus structure,
or simply a longer feed line with a good conductive path, so the gas
re-warms toward bus temperature before it reaches the throat. **What it
costs:** mass (tens of grams), a larger dead volume (which lengthens
$\tau_e$ and therefore raises the minimum impulse bit — see Eq. 3.20), and
a slower thermal transient at the start of a firing campaign. If the
minimum impulse bit is the binding requirement rather than $I_{sp}$, accept
the 5 % and keep the plenum small. [J]

---

## K3. Trade-study reference solution

### The numbers

Requirement: 220 N·s, $I_{bit}\le5\times10^{-4}$ N·s, $\le1.2$ kg wet,
$\le1.2$ L, rideshare preference against >10 bar stored energy.

Take $F=50$ mN in all four options (with a 5–10 ms valve this gives
$I_{bit}=2.5$–$5\times10^{-4}$ N·s, meeting the requirement without
needlessly shrinking $Re_t$). $\varepsilon=50$, 15° cone, $T_0=293.15$ K.
Assume 250 g of valves, manifold and electronics in every option.

| | **A** GN₂ 250 bar, regulated to 5 bar | **B** GN₂ 25 bar, blowdown to 5 bar | **C** R-236fa 2.7 bar | **D** n-butane 2.6 bar, heated |
|---|---|---|---|---|
| plenum $p_0$ | 5 bar | 15 bar (mean) | 2.7 bar | 2.6 bar |
| $D_t$ | 271 μm | 157 μm | 338 μm | 346 μm |
| $Re_t$ | 2.0×10⁴ | 3.5×10⁴ | 4.2×10⁴ | 3.8×10⁴ |
| $\eta_I$ | 0.914 | 0.931 | 0.935 | 0.932 |
| $I_{sp}$ delivered | 69.4 s | 70.7 s | 40.0 s | 63.7 s |
| $\phi$ | 0.967 | 0.80 | 0.90 | 0.90 |
| $m_{prop}$ loaded | 334 g | 397 g | 624 g | 391 g |
| stored density | 250 kg/m³ | 28.7 kg/m³ | 1224 kg/m³ | 513 kg/m³ |
| $V_{prop}$ | **1.34 L** | **13.8 L** | **0.51 L** | **0.76 L** |
| $m_{tank}$ | 444 g (Ti) | 459 g | 100 g | 100 g |
| regulator/heater | +250 g | — | — | +60 g, 2 W |
| **wet mass** | **1.28 kg** | 1.11 kg | **0.97 kg** | **0.80 kg** |
| **verdict** | fails volume **and** mass | fails volume by 11× | **passes** | **passes** |

### Recommendation

**Recommend D (n-butane, self-pressurising, with a heated vaporiser
plenum), with C (R-236fa) as the low-risk fallback.**

**Which constraint binds, per option.**
- **A** — *volume* binds first (1.34 L of propellant alone against a 1.2 L
  total allocation), and mass binds immediately after (1.28 kg, and that
  already excludes the relief valve and burst disc that a 250 bar system
  requires). The rideshare stored-energy preference is the third strike.
  A is not close; it fails by roughly 30 % on both.
- **B** — *volume*, catastrophically. Nitrogen at 25 bar stores at
  28.7 kg/m³, so 397 g needs 13.8 L. B is the option that shows why
  low-pressure *gas* storage is not an architecture. Its virtue is that it
  is the only option with no pressure-vessel qualification at all, and it
  is worth stating that this is the reason low-pressure blowdown is common
  in laboratory demonstrators and absent from flight.
- **C** — nothing binds; 0.97 kg and roughly 0.8 L including hardware.
  Margin on both, more on volume than on mass.
- **D** — nothing binds; 0.80 kg and roughly 1.05 L including hardware.
  Margin on both, more on mass than on volume.

**Why D over C.** Butane's ideal $I_{sp}$ (68.4 s at $\varepsilon=50$,
293 K) is 60 % above R-236fa's, and its stored density of 0.51 g/cm³
(90 % fill) is still 18 times a 25 bar gas. Net: D needs 391 g of
propellant against C's 624 g, saving **233 g on a 1.2 kg budget** — nearly
20 % of the whole allocation. That is a large margin to hand back to the
payload.

**Why C is the defensible conservative answer.** Two reasons, and a good
student will name both. First, **thermal sensitivity**: the tank pressure
*is* the vapour pressure, and butane's falls faster with temperature than
R-236fa's. A bus that cold-soaks to 0 °C puts butane near 1 bar, which
drops thrust by a factor of 2.6 and $Re_t$ by 1.6, and drops the delivered
$I_{sp}$ with it — and the heated vaporiser that fixes this costs 2 W the
system may not have during eclipse. Second, **heritage**: R-236fa modules
have flown to Mars (`[MarCO]`) and on Artemis I; butane has flown on TW-1
and GOMX-4B, which is real but thinner heritage at this impulse level.

**The largest uncertainty and how to retire it.** For D it is the
delivered $I_{sp}$ over the flight temperature range, because it depends on
both the vapour-pressure curve and the Reynolds number, and both move with
tank temperature. **Retire it with a thermal-vacuum thrust-stand campaign
across the predicted tank temperature range (−10 °C to +40 °C), measuring
thrust, mass flow and impulse bit at each point** — not a single
room-temperature performance point. For C the largest uncertainty is the
$\gamma$ and vapour-pressure data for R-236fa near saturation, which the
verification worksheet marks confidence C; retire it with NIST/REFPROP
data at the actual operating states, or by direct measurement.

### Rubric

**A strong answer must contain:**
- Correct sizing arithmetic for all four options with units, including the
  distinction between propellant volume and module volume.
- The stored density of each propellant, and the recognition that it, not
  $I_{sp}$, drives the answer.
- A Reynolds-number estimate for each thruster and a delivered $I_{sp}$ that
  is *not* the ideal value.
- The correct usable fraction for each architecture (0.967 regulated,
  0.80 for a 5:1 blowdown, ~0.90 for a self-pressurising liquid) with a
  justification.
- An explicit statement of which constraint binds for each option.
- A recommendation with a named risk and a named test to retire it.

**Loses marks for:**
- Ranking by $I_{sp}$ (this is the trap; it selects option A or B, both of
  which fail by a factor).
- Using ideal $I_{sp}$ anywhere in the delivered-impulse calculation.
- Omitting the tank mass, or using the same tank mass for a 250 bar COPV
  and a 2.7 bar can.
- Applying $\phi=1-p_f/p_i$ to the regulated option (it is 0.967, set by
  the lockup pressure, not by a blowdown ratio).
- Recommending A or B without noting that they fail the stated constraints.
- Any answer that does not state which constraint binds.

**Either C or D earns full marks** if the numbers are right and the risk
argument is made. An answer that recommends D without mentioning the
vapour-pressure–temperature sensitivity loses the risk marks; an answer
that recommends C without noticing that D is 170 g lighter loses the
trade-space marks.

---

## K4. Common wrong answers

**Using $m=pV/RT$ for a 200–300 bar tank.** The single most common error in
this module, and the most consequential, because it is 10–15 % optimistic
and it is optimistic. Students who make it usually also believe $Z\to1$ at
high pressure. It reveals that they have never had to reconcile a
tank-loading procedure with a mass properties report.

**Getting the sign of $Z$ backwards.** Assuming the real gas is *denser*
than ideal, because "real molecules attract." True below the Boyle
temperature; false for every practical cold-gas propellant at room
temperature and COPV pressures, where repulsion dominates and $Z>1$.

**Applying the isentropic tank relation to the wrong parcel of gas.** Two
symmetric errors appear: using $pv^\gamma$ for the *departing* gas (which
was throttled and is isenthalpic), or using the isenthalpic relation for
the *retained* gas (which was not). Both come from not drawing a control
volume.

**Believing $\phi_{adiab}>\phi_{iso}$.** The reasoning is "the gas expands
more, so more comes out." It reveals a failure to hold the cutoff *pressure*
fixed. At fixed final pressure, colder means denser means more stranded.

**Quoting an ideal $I_{sp}$ for a small thruster.** Reproducing 76.8 s from
the gas table for a 60 μm throat and stopping there. It reveals that the
student has learned the nozzle equations without ever asking what sets the
efficiency, and it is the single fastest way to lose credibility in an
interview about small propulsion.

**Increasing $\varepsilon$ to "recover $I_{sp}$" on a micro-thruster.**
Correct instinct imported from chemical engines, wrong regime. Reveals no
mental model of where the losses live.

**Computing the impulse bit as $F\,t_{on}$ and stopping.** It is the right
answer only for $\tau_e=\tau_f$, and real thrusters over-deliver on short
pulses by tens of percent. Students who make this error also tend to quote
"minimum impulse bit" as though it were a repeatable quantity rather than a
distribution.

**Assuming short pulses under-deliver.** The commonest sign error in §3.10.
It comes from picturing a trapezoid with a slow rise and a fast cut-off,
which is the opposite of what a throat-limited plenum does.

**Converting a helium leak spec to the service gas without stating the flow
regime.** Answers that differ by a factor of 2.9 with no acknowledgement
that a choice was made. Reveals that the student treats a specification as
a number rather than as an agreement between two parties about a
measurement.

**Ignoring Joule–Thomson entirely, or applying nitrogen's sign to helium.**
The second is more interesting: it reveals that "gases cool when they
expand" has been learned as a fact rather than as a consequence of the
inversion temperature. Helium and hydrogen at room temperature heat on
throttling, and hydrogen's case has killed people in industrial settings.

**Reporting more significant figures than the inputs support.** Quoting a
delivered $I_{sp}$ to 0.01 s from a viscous correlation with ±0.05 on
$\eta_{visc}$. The arithmetic can be exact; the answer cannot be.
