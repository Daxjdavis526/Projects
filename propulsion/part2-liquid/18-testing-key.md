# Module 18 — Engine Testing and Instrumentation — Answer Key

Marks in brackets. Calculation questions are graded on method first: a right
setup with an arithmetic slip loses at most 30 % of the marks; a wrong setup
that lands on the right number by luck scores zero.

All numbers below are reproduced by `tools/examples/18.py` against
`tools/rocket.py`. Constants: $g_0 = 9.80665$ m/s², $R_u = 8314.46$ J/(kmol·K).

---

## K1. Problem solutions

### Conceptual

**C1 — three ways to manufacture an impossible efficiency.**

$\eta_{c^*} > 1$ is always a bookkeeping error, because $c^*_{ideal}$ from CEA
is the thermodynamic ceiling for that propellant, mixture ratio and pressure.
Three mechanisms, in descending order of frequency:

1. **Wrong chamber-pressure station.** $c^* = p_{c,ns}A_t/\dot m$, and the tap
   is at the injector face, where the pressure is 1–2 % higher (Eq. 3.10).
   Using $p_{c,inj}$ inflates $c^*$ by exactly that amount. *Ask for:* the
   chamber contraction ratio and a statement of which station the reduction
   used. A 1–2 % discrepancy that scales with $1/\varepsilon_c$ confirms it.
2. **Cold throat area.** $A_t$ measured on a bench is smaller than the hot
   throat by $\sim(1+\alpha\Delta T)^2$; a copper throat 650 K above the
   measurement temperature is 2.2 % larger in area. Using the cold area
   understates $c^*$ — so this one pushes the *other* way and can mask (1) —
   but for an ablative or graphite throat that has *eroded*, the hot area is
   larger still and using a pre-test measurement inflates nothing while using
   a post-test measurement deflates. *Ask for:* pre- and post-test throat
   measurements and the wall-temperature history.
3. **Under-counted mass flow.** Any propellant that enters the chamber but was
   not metered — a film-coolant circuit tapped downstream of the flow meter, a
   turbine exhaust dumped into the chamber (staged combustion), an igniter
   feed, a purge that is still flowing — makes $\dot m$ too small and $c^*$ too
   large. *Ask for:* the flow schematic with every metering station marked, and
   a mass balance closing tank level change against integrated meter flow.

[2 marks per mechanism, 1 per correct discriminating request; 9 total,
rounded to 10 with a mark for stating that $\eta>1$ is impossible rather than
"very good".]

**C2 — water, remotely, and when neither.**

The energy argument is Eq. 3.3. A gas at pressure $p$ in volume $V$ stores
$E = pV/(\gamma-1)\,[1-(p_a/p)^{(\gamma-1)/\gamma}]$; a liquid stores only its
compressive strain energy, roughly $p^2V/(2K)$ with $K \approx 2.2$ GPa for
water. At 30 MPa in 50 L: gas ≈ 3.7 MJ (≈0.8 kg TNT), water ≈ 10 kJ. Three
orders of magnitude. A hydrostatic rupture is a squirt because the stored
energy is exhausted after a few millimetres of expansion; a pneumatic rupture
accelerates fragments for as long as the gas keeps pushing. Hence hydrostatic
proof behind a splash shield, pneumatic proof remotely with the area cleared
to a quantity–distance radius.

Two component classes where water is forbidden:
- **Anything that will subsequently see LOX or another strong oxidiser.**
  Water leaves residue, promotes corrosion, and any organic film it carries in
  is an ignition source in oxygen service. LOX-clean hardware is proofed with
  clean, dry gas or with a compatible fluid, and remotely.
- **Anything with capillary or blind passages that cannot be verifiably
  dried** — injector manifolds, small-orifice elements, coolant channels,
  bellows convolutions. Trapped water freezes on the first cryogenic
  operation and can burst a passage; it also destroys any subsequent helium
  leak check.

[4 for the energy argument with numbers, 2 for the mechanism of why fragments
matter, 2 per component class.]

**C3 — the cost of filtering a redline.**

A single-pole low-pass at $f_c = 5$ Hz has group delay $\approx 1/(2\pi f_c) =
32$ ms in the passband; a 4-pole Butterworth at the same corner is roughly
four times that, ~127 ms. That delay adds directly to $t_{lat}$ (Eq. 3.23). At
a wall-temperature ramp of 400 K/s, 32 ms is 13 K and 127 ms is 51 K of extra
true-temperature overshoot — added on top of the thermocouple's own
$\dot R\tau$ lag, which for a sheathed TC is already the dominant term.

Two alternatives that do not buy latency:
1. **Fix the noise at the source.** Electrical noise on a thermocouple channel
   is almost always a ground loop, common-mode pickup, or routing next to a
   solenoid line. A single-point ground, a differential amplifier and 200 mm
   of separation cost nothing in time. Confirm with a powered pre-test zero:
   if the noise is present with the engine off, it is not physics.
2. **Use persistence voting instead of filtering, and account for it.**
   Require $N$ consecutive out-of-limit samples. At 1 kHz, $N = 5$ costs 5 ms
   rather than 32, and rejects impulsive noise better than a low-pass does.
   Or vote two-out-of-three across redundant sensors, which rejects
   independent noise entirely at the cost of one logic cycle.

A third acceptable answer: move the redline down by the computed lag, i.e.
accept the latency and pay for it in threshold rather than pretending it is
not there. [3 for the quantitative delay, 2 for translating it to kelvin,
2–3 per alternative.]

**C4 — what averaging does and does not do.**

Type A (random) uncertainty is estimated from the scatter of repeated
observations and falls as $s/\sqrt n$. Type B (systematic) uncertainty —
calibration bias, an installation effect, a wrong density model — is identical
on every sample and does not fall at all. Averaging $n$ samples reduces the
first by $\sqrt n$ and the second by exactly 1.

Concrete examples from a hot fire:
- *Type A:* the sample-to-sample scatter on the chamber-pressure channel from
  combustion roar, ±1.8 % of $p_c$ RMS. Averaging 2000 samples over a 2 s
  steady window reduces its contribution to the mean to 0.04 %.
- *Type B:* the oxidiser turbine meter's density model, which is 0.4 % wrong
  in one direction for the whole test because the temperature probe reads 2 K
  high. A million samples will not find it.

Consequence for A/B injector comparison: the systematic floor (here ≈0.4–0.5 %
on $I_{sp}$) is the resolution limit of an *absolute* comparison, and it does
not improve with repetition. But it largely **cancels in a difference** if both
injectors are run on the same stand, with the same instruments, the same
calibration, and ideally on the same day with interleaved runs (A, B, A, B) so
that any slow drift is common to both. The difference measurement can resolve
an effect an order of magnitude smaller than either absolute number's
uncertainty. That is why A/B testing is designed as a paired comparison and
not as two campaigns.

[3 for the Type A/B distinction with the $\sqrt n$ statement, 2 per example,
3 for the paired-comparison consequence.]

**C5 — why subscale stability does not transfer.**

1. **Acoustic frequencies scale as $1/L$.** A quarter-scale chamber's 1T mode
   is at four times the full-scale frequency. The combustion response function
   — the sensitivity of heat release to a pressure perturbation — is a
   function of frequency (Crocco's $\tau$ and $n$; module 15), so at four
   times the frequency you are sampling a completely different part of the
   response curve. Stability at 8 kHz says nothing about 2 kHz.
2. **The element-to-chamber ratio changes.** A subscale chamber typically runs
   full-scale elements at reduced count, so the number of elements per acoustic
   wavelength, the distance from any element to the wall, and the
   element-to-element spacing relative to the mode shape are all different.
   Baffle and acoustic-cavity effectiveness in particular do not scale.
3. **The damping does not scale with the driving.** Acoustic losses through
   the nozzle, through the injector face, and in the boundary layer scale
   differently with size from the volumetric heat release that drives the
   mode, so the net growth rate at full scale can be positive where the
   subscale growth rate was negative.

Acceptable fourth: the subscale chamber's contraction ratio, $L^*$ and
residence time are usually not preserved, and the time lag $\tau$ is
residence-time dependent. [3 each, capped at 10.]

**C6 — "test like you fly" versus "test at flight conditions".**

"Test at flight conditions" is a statement about the *environment*: same
pressure, temperature, vibration, acceleration. "Test like you fly" is a
stronger statement about the *configuration and the operation*: the same
hardware, the same software, the same sequence, the same people-free
autonomous execution, with nothing substituted for convenience. You can be at
flight conditions and still not be testing like you fly — firing a flight
engine with a test-stand controller and a hand-tuned start sequence is the
canonical example.

- *Unavoidable for a first-stage engine:* ambient pressure. You cannot fire a
  sea-level-optimised booster engine in vacuum at reasonable cost, and you do
  not need to — $C_f$ at altitude is computed from the measured $c^*$, the
  measured $A_t$ and $\varepsilon$, with the pressure-thrust term evaluated at
  the flight $p_a$. *Closed by:* one-dimensional nozzle analysis validated
  against the sea-level $\eta_{C_f}$, plus separation-free operation verified
  at the sea-level condition.
- *Unavoidable for an upper-stage engine:* the vacuum thermal soak and the
  long coast before restart, which no altitude cell reproduces in full.
  *Closed by:* thermal-vacuum testing of the engine as a thermal article
  separately from the hot fire, plus an altitude-cell restart demonstration
  after a chilled hold.
- *Merely convenient:* firing horizontally rather than vertically, using
  facility-fed propellants rather than flight tanks, using a test-stand
  controller, omitting the gimbal. Each of these is a real deviation —
  horizontal firing changes turbopump bearing loading and propellant pooling
  in manifolds — and each is closed either by a dedicated test or, more
  honestly, by a documented rationale that a review board signs.

[3 for the distinction, 2 per deviation with its closure, 1 for the general
statement that every deviation must be enumerated.]

**C7 — the 4.2 kHz component.**

In the order a competent engineer checks them:

1. **The accelerometer's own mounted resonance.** A magnet mount resonates at
   2–7 kHz and an adhesive mount at 10–20 kHz. *Test:* stud-mount a second
   accelerometer adjacent to the first; if the feature moves in frequency or
   disappears, it was the mount. Also: tap-test the installed sensor with the
   engine off and look for a ring at 4.2 kHz.
2. **The bracket, not the pump.** A bracket is a cantilever with its own
   modes, typically 1–10 kHz. *Test:* modal tap test of the bracket in situ,
   and comparison against a sensor mounted directly on the housing.
3. **Blade pass.** Blade-pass frequency = (blade count) × (rpm/60). At 35,000
   rpm a 7-blade impeller gives 4083 Hz. *Test:* check the frequency's
   proportionality to shaft speed across a speed sweep. Blade pass tracks
   speed exactly; a structural resonance does not.
4. **A genuine chamber acoustic mode transmitted structurally.** *Test:*
   compare against the close-coupled dynamic pressure channel; a combustion
   mode appears there with much higher coherence than on a pump-mounted
   accelerometer.

The general principle: anything that tracks shaft speed is rotordynamic;
anything that stays at a fixed frequency as speed changes is structural or
acoustic; anything that moves when you change the sensor installation is the
sensor. [2.5 each.]

**C8 — the cavitating venturi.**

A plain venturi infers $\dot m$ from $\Delta p$, a discharge coefficient and a
density, and — crucially — it is a *passive* element: the flow it passes
depends on the pressure difference across it, so any fluctuation in engine
back-pressure (chug, a start transient, a chamber-pressure excursion)
propagates upstream into the feed system and changes the flow. A cavitating
venturi run above its critical pressure ratio has a vapour region at the
throat that fixes the throat pressure at the propellant's vapour pressure, so
$\dot m = C_d A_t\sqrt{2\rho(p_1 - p_v)}$ — a function of *upstream* conditions
only. It chokes the liquid.

That buys two things at once: a flow measurement that needs only an upstream
pressure and temperature, and acoustic isolation of the feed system from the
chamber, which removes the feed-coupled branch of chug from the test-stand
configuration.

What it costs: (a) a large permanent pressure loss — you must maintain the
critical pressure ratio, typically requiring $p_1 - p_2$ of order 20–40 % of
$p_1$, which the facility must supply; (b) it *removes* the feed coupling,
which means the stand no longer represents the flight feed system, so chug
margin measured on a cavitating-venturi stand is not the flight chug margin —
you have suppressed the very phenomenon a flight-representative test would
find; (c) cavitation erodes the venturi throat over time, so $C_d A$ drifts and
the device needs periodic recalibration.

[3 for the choking mechanism, 2 for the upstream-only flow relation, 2 for
isolation as a benefit, 3 for the costs — full marks require noticing that the
isolation is *also* a fidelity loss.]

---

### Calculation

**N1 — chamber-pressure station correction, $\gamma = 1.21$, $\varepsilon_c = 3.0$.**

Invert the subsonic branch of the area relation at $A/A^* = 3.0$:
$$M_c = 0.2016$$
Then Eq. 3.10:
$$\frac{p_{c,ns}}{p_{c,inj}} = \frac{\left(1 + \frac{0.21}{2}(0.2016)^2\right)^{1.21/0.21}}{1 + 1.21(0.2016)^2}
= \frac{(1.004267)^{5.7619}}{1.049176} = \frac{1.024847}{1.049176} = 0.97681$$
$$p_{c,ns} = 0.97681\times10.00\ \mathrm{MPa} = 9.768\ \mathrm{MPa}$$

Since $c^* \propto p_{c,ns}$, using the uncorrected injector-end pressure
inflates $c^*$ and hence $\eta_{c^*}$ by
$$\frac{1}{0.97681} - 1 = 0.0237 = \mathbf{2.37\ \%\ too\ high}$$

*Note the trend:* at $\varepsilon_c = 4$ (WE1) the correction was 1.31 %; at
$\varepsilon_c = 3$ it is 2.37 %; it grows rapidly as the chamber gets
narrower, because $M_c$ grows. Any engine with a contraction ratio below about
2.5 has a correction larger than its entire uncertainty budget.

[3 for $M_c$, 4 for the ratio, 3 for the percentage and the direction.]

**N2 — full reduction.**

$$\dot m = 63.5 + 27.6 = 91.1\ \mathrm{kg/s}, \qquad MR = \frac{63.5}{27.6} = 2.301$$
$$c^*_{meas} = \frac{p_{c,ns}A_t}{\dot m} = \frac{9.800\times10^6\times1.580\times10^{-2}}{91.1}
= \frac{154\,840}{91.1} = 1699.7\ \mathrm{m/s}$$
$$C_{f,meas} = \frac{F}{p_{c,ns}A_t} = \frac{245\,000}{154\,840} = 1.5823$$
$$I_{sp,meas} = \frac{245\,000}{91.1\times9.80665} = 274.2\ \mathrm{s}$$
Consistency check: $c^*C_f/g_0 = 1699.7\times1.5823/9.80665 = 274.2$ s ✓

Reference values, $R = 8314.46/23.0 = 361.50$ J/(kg·K):
$$c^*_{ideal} = \frac{\sqrt{361.50\times3700}}{0.64853} = \frac{1156.6}{0.64853} = 1783.3\ \mathrm{m/s}$$
$$C_{f,ideal}(\gamma = 1.20,\ \varepsilon = 16,\ p_0 = 9.800\ \mathrm{MPa},\ p_a = 101\,325\ \mathrm{Pa}) = 1.6317$$
(Exit check: $M_e = 3.604$, $p_e = 66.3$ kPa, $p_e/p_a = 0.655 > 0.4$, so the
nozzle runs full and the ideal $C_f$ is the correct comparison.)

$$\eta_{c^*} = \frac{1699.7}{1783.3} = \mathbf{0.9531}, \qquad
\eta_{C_f} = \frac{1.5823}{1.6317} = \mathbf{0.9697}$$
$$\eta_{overall} = 0.9243$$

**Which to attack first:** the $c^*$ shortfall is 4.7 % and the $C_f$ shortfall
is 3.0 %, so the combustion side is the bigger loss in absolute terms. It is
also the cheaper one to attack: injector modifications and $L^*$ changes are
weeks of hardware, while a nozzle contour change is a new nozzle. And the
$C_f$ number is partly *not* a defect — at $\varepsilon = 16$ against a
sea-level ambient the engine is overexpanded, and part of the 3 % is the
pressure-thrust term, which disappears in vacuum. So: **injector first.**

[2 for $\dot m$ and MR, 2 for $c^*$, 2 for $C_f$ and $I_{sp}$, 2 for the
efficiencies, 2 for the argument. Full marks on the argument require noticing
the overexpansion point.]

**N3 — uncertainty budget for N2.**

Mass flow (a sum — combine absolutes):
$$u_{\dot m_o} = 0.0045\times63.5 = 0.2858\ \mathrm{kg/s},\quad
u_{\dot m_f} = 0.0030\times27.6 = 0.0828\ \mathrm{kg/s}$$
$$u_{\dot m} = \sqrt{0.2858^2 + 0.0828^2} = 0.2975\ \mathrm{kg/s}
\Rightarrow \frac{u_{\dot m}}{\dot m} = \frac{0.2975}{91.1} = 0.3266\ \%$$

Specific impulse (Eq. 3.21):
$$\frac{u_{I_{sp}}}{I_{sp}} = \sqrt{0.00300^2 + 0.003266^2} = 0.004434 = 0.443\ \%$$
$$u_{I_{sp}} = 0.004434\times274.2 = 1.22\ \mathrm{s};\qquad
U_{95} = k u = 2\times1.22 = \mathbf{\pm 2.43\ s}$$

Throat area: $u_{A_t}/A_t = 2\times0.0008 = 0.160$ %.
Characteristic velocity:
$$\frac{u_{c^*}}{c^*} = \sqrt{0.00200^2 + 0.00160^2 + 0.003266^2} = 0.004150 = 0.415\ \%$$
$$u_{c^*} = 0.00415\times1699.7 = 7.05\ \mathrm{m/s}$$

**Best single upgrade.** Look at the contributions to $u_{I_{sp}}$ in
quadrature: thrust 0.300 %, flow 0.327 %, of which the oxidiser meter alone
supplies $0.2858/91.1 = 0.3137$ % and the fuel meter $0.0908$ %. The oxidiser
meter is the largest single term.
- Replacing it with a Coriolis meter at 0.20 % of reading:
  $u_{\dot m} = \sqrt{(0.0020\times63.5)^2+0.0828^2}/91.1 = 0.1664$ %, so
  $u_{I_{sp}}/I_{sp} = \sqrt{0.00300^2+0.001664^2} = 0.343$ %, i.e.
  0.443 → 0.343 %, and $u_{I_{sp}}$ falls from 1.22 s to 0.94 s.
- Rebuilding the thrust stand to 0.15 % instead:
  $\sqrt{0.00150^2+0.003266^2} = 0.359$ % — slightly worse.

So the oxidiser flow meter, and it also improves $c^*$ (0.415 → 0.288 %) and
the mixture-ratio measurement, neither of which the thrust upgrade touches.

[2 for the sum-versus-product distinction, 2 for $u_{I_{sp}}$, 1 for the
coverage factor, 2 for $u_{c^*}$ with the squared-diameter term, 3 for the
upgrade argument with numbers.]

**N4 — bare versus sheathed thermocouple.**

Ramp lag $= \dot R\tau$:
- bare bead, $\tau = 8$ ms: $250\times0.008 = \mathbf{2.0\ K}$
- sheathed, $\tau = 0.45$ s: $250\times0.45 = \mathbf{112.5\ K}$

At the moment each sensor *indicates* the 950 K redline, the true wall
temperature is $950 + \dot R\tau$:
- bare: 952 K; sheathed: 1062.5 K.

Adding the remaining 0.15 s of latency, the wall gains a further
$250\times0.15 = 37.5$ K:
- **bare: 989.5 K** at valve closure (310 K of margin to the 1300 K melt)
- **sheathed: 1100 K** at valve closure (200 K of margin)

Maximum tolerable ramp rate for the sheathed installation: the total effective
delay is $\tau + t_{lat} = 0.45 + 0.15 = 0.60$ s, so
$$950 + \dot R_{max}(0.60) \le 1300 \Rightarrow
\dot R_{max} = \frac{350}{0.60} = \mathbf{583\ K/s}$$
Above that rate the sheathed installation cannot save the liner no matter what
the redline says. (Strictly this uses the asymptotic ramp lag; solving the
exact exponential gives a slightly higher tolerable rate, because early in the
ramp the lag has not yet fully developed — but the asymptotic form is the
conservative one and is the one to design to.)

[2 for the lags, 3 for the two valve-closure temperatures, 3 for the maximum
rate, 2 for stating the design conclusion.]

**N5 — sense line, helium versus oxygen versus nitrogen.**

$$f_{1/4} = \frac{a}{4L}$$
- helium, $a = 1017$ m/s: $f_{1/4} = 1017/4.8 = \mathbf{211.9\ Hz}$
- gaseous oxygen, $a = 330$ m/s: $f_{1/4} = 330/4.8 = \mathbf{68.8\ Hz}$
- nitrogen, $a = 353$ m/s: $f_{1/4} = 353/4.8 = \mathbf{73.5\ Hz}$

Evaluating the claim: switching helium to nitrogen drops the line's first
resonance by a factor $1017/353 = 2.88$, from 212 Hz to 73.5 Hz, and drops the
usable bandwidth ($\approx f_{1/4}/3$) from about 71 Hz to about 25 Hz. The
claim is **false in any test where anything faster than about 25 Hz matters**:
the start transient, chug, and any feed-system oscillation. It is true for
steady chamber pressure and for slow throttle transients, which is what a
flight $p_c$ measurement mostly is. The correct statement is "it does not
affect the steady measurement and destroys the dynamic one" — and note the
line contents may not even be the purge gas, since the line will fill with
combustion products or propellant vapour if it is not continuously purged, at
which point $a$ is unknown and the resonance moves during the test.

[2 per frequency, 3 for the quantitative evaluation, 1 for the observation
about what actually fills the line.]

**N6 — chamber modes and sample rate.**

With $a_c = 1150$ m/s, $D_c = 0.42$ m, $L_c = 0.65$ m:
$$f_{1L} = \frac{a_c}{2L_c} = \frac{1150}{1.30} = \mathbf{885\ Hz}$$
$$f_{1T} = \frac{1.8412\,a_c}{\pi D_c} = \frac{1.8412\times1150}{1.3195} = \mathbf{1605\ Hz}$$
$$f_{1R} = \frac{3.8317\times1150}{1.3195} = \mathbf{3340\ Hz}$$
Second tangential, eigenvalue 3.0542:
$$f_{2T} = \frac{3.0542\times1150}{1.3195} = 2662\ \mathrm{Hz}$$

Minimum sample rate at 2.56× the highest frequency of interest:
$$f_s \ge 2.56\times2662 = 6815\ \mathrm{Hz}$$
In practice you specify a standard rate well above this — **$f_s = 20$ kHz**
per dynamic channel is the sensible choice, because (a) it leaves the 1R mode
at 3.3 kHz comfortably resolved, (b) 2.56× is a spectral-analysis minimum and
gives poor *waveform* fidelity, and (c) instability work needs to see harmonics
and combination tones above the fundamental of interest.

Anti-alias corner: set below $f_s/2 = 10$ kHz with enough roll-off that content
at 10 kHz is below the converter's noise floor. With an 8-pole filter (48
dB/octave) a corner at **6–8 kHz** puts 10 kHz down by 20–35 dB and 20 kHz down
by 70–80 dB, which is adequate for a 16-bit system (96 dB dynamic range).
Specify the corner, the order, and the attenuation at $f_s/2$ — a corner alone
is not a specification.

[1 per frequency (4), 3 for the sample rate with justification, 3 for the
anti-alias specification including order/attenuation.]

**N7 — ranging a channel.**

$q = \mathrm{FS}/2^{16} = \mathrm{FS}/65\,536$; RMS quantization noise
$= q/\sqrt{12}$.

| range | $q$ | RMS quantization noise | transducer 0.25 % FS |
|---|---|---|---|
| 0–20 MPa | 305.2 Pa | 88.1 Pa | 50.0 kPa |
| 0–4 MPa | 61.0 Pa | 17.6 Pa | 10.0 kPa |

On a 2.5 MPa reading, combining in quadrature:
- 20 MPa range: $\sqrt{50\,000^2 + 88^2} = 50\,000$ Pa $= \mathbf{2.00\ \%}$ of reading
- 4 MPa range: $\sqrt{10\,000^2 + 17.6^2} = 10\,000$ Pa $= \mathbf{0.40\ \%}$ of reading

**The lesson has two halves.** First, quantization is irrelevant in a 16-bit
system — 88 Pa against a 50 kPa transducer error is three orders of magnitude
down, so "more bits" is almost never the answer to a measurement problem.
Second, the dominant term is the transducer's **full-scale** error, which does
not shrink when the reading shrinks: a 20 MPa transducer used at 2.5 MPa
delivers 2 % of reading, five times worse than a properly ranged one. Range
the transducer to the signal, not to the worst case you can imagine; if you
need both, use two transducers on the same port with different ranges, which
is standard practice on development stands.

[3 for the table, 3 for the two total uncertainties, 4 for the lesson — full
marks require both halves.]

**N8 — thrust-stand dynamics.**

$$f_n = \frac{1}{2\pi}\sqrt{\frac{k}{m}} = \frac{1}{2\pi}\sqrt{\frac{2.5\times10^7}{1800}}
= \frac{117.85}{6.2832} = \mathbf{18.8\ Hz}$$
Period $T = 53$ ms.

**Is the rise faithful?** No. Two equivalent comparisons:
- The stand's ringing period (53 ms) is comparable to the transient's rise
  time (60 ms). A second-order system excited by a ramp of comparable duration
  overshoots and rings; the recorded trace will show a rise to roughly
  1.3–1.6× steady thrust followed by a decaying 18.8 Hz oscillation that has
  nothing to do with the engine.
- A 60 ms rise contains significant content to roughly $0.35/t_r = 5.8$ Hz and
  meaningful content well above that. With the stand's resonance at only 3.2×
  that, the stand is not acting as a stiff link — it is a filter with gain.

**What to do.** In order of preference: (1) stiffen and lighten — a factor of
four in $k/m$ doubles $f_n$, and the moving mass usually includes stand
structure that can be removed from the load path; (2) *measure* the stand's
transfer function in situ (step-release calibration with a fusible link, or a
swept-sine shaker input) and deconvolve the recorded thrust with it, which is
the standard method and is why calibration includes a dynamic step; (3) use
chamber pressure as the fast thrust proxy — $F \approx C_f p_c A_t$ with $C_f$
taken from the steady portion — since the $p_c$ measurement's bandwidth is set
by the transducer, not by the stand; (4) accept that the steady-state value is
good and report the transient as "not resolved", which is honest and is often
the right answer.

[3 for $f_n$, 3 for the comparison of time scales with a stated consequence,
4 for the remedies — at least two, one of which must be the deconvolution or
the $p_c$ proxy.]

---

### Engineering reasoning

**R1 — the LOX/LH₂ degradation event.**

*Most probable single root cause:* **progressive degradation of the
high-pressure fuel turbopump** — an inducer or impeller mechanical failure, a
seal or bearing rub, or cavitation-driven inducer damage. The evidence chain:

- Fuel pump discharge pressure falls **and** fuel flow falls together. This is
  the diagnostic signature of a *pump* losing head. A downstream blockage would
  raise discharge pressure while lowering flow; an upstream restriction would
  lower both but would also show a fall in pump *inlet* pressure.
- HPFTP vibration in the 1–5 kHz band up by 2.4× — mechanical distress in the
  pump, not a combustion phenomenon (a combustion mode would appear on the
  dynamic $p_c$ channel with high coherence and would not be localised to the
  fuel pump).
- MR rises 5.95 → 6.27 (+5.4 %), which is the arithmetic consequence of losing
  5 % of the fuel flow at constant oxidiser flow.
- Turbine discharge temperature up 40 K: the preburner or gas generator is now
  running oxidiser-rich of its set point for the same reason, so the drive gas
  is hotter. This is the dangerous part of the chain.
- Coolant outlet temperature up 25 K: less hydrogen through the cooling
  circuit *and* a hotter core from the MR shift. Both push the same way.
- $p_c$ down 3.5 % and thrust down 3.8 %: consistent with the total flow loss
  (fuel is ~14 % of total mass flow at MR 6, so a 5 % fuel loss is a 0.7 %
  total flow loss) plus the $c^*$ loss from running 5 % off peak MR — the
  thrust falling slightly more than $p_c$ is consistent with a small $c^*$
  and $C_f$ degradation as well.

*Alternative 1: hydrogen cavitation at the pump inlet (NPSH loss).* Produces
the same head and flow loss and would also raise vibration. **Discriminator:
the pump inlet pressure and temperature channels** — a genuine NPSH shortfall
shows the inlet pressure approaching the local vapour pressure, whereas a
mechanical failure leaves the inlet condition unchanged. A tank-pressurisation
fault would show on the ullage pressure channel too.

*Alternative 2: turbine power loss (a preburner or GG feed problem reducing
turbine drive).* Also drops fuel pump head and flow. **Discriminator: shaft
speed.** A turbine power loss drops shaft speed markedly; a pump hydraulic
failure at roughly constant turbine power leaves speed near constant or even
*increases* it, because the pump is absorbing less torque. The rising turbine
discharge temperature argues against a turbine power loss, since a starved
preburner would run cooler.

*Which redline fires first?* Almost certainly **turbopump vibration RMS**,
because the vibration rose by 2.4× within the 900 ms window while the
temperature moved only 40 K and $p_c$ only 3.5 %, and vibration redlines are
typically set at 2–3× the nominal band level. Vibration also has the *fastest*
sensor — an accelerometer has microsecond response and the band-RMS
computation adds only its averaging window (typically 10–50 ms) — whereas the
turbine discharge thermocouple has a $\tau$ of hundreds of milliseconds and
will be reporting a temperature well behind the truth. So yes: the vibration
redline should fire before the turbine reaches a temperature limit, and that
ordering is not an accident — **it is why vibration redlines exist**, since
they are the only fast indicator of mechanical distress.

The caveat worth a mark: if the vibration redline band was set to exclude the
1–5 kHz region (some are set on overall RMS dominated by lower-frequency
synchronous content), the 2.4× rise may not trip anything, and the first
redline becomes turbine temperature — 300–500 ms late.

[Root cause with evidence 8; alternatives with discriminators 6; redline
argument with the latency reasoning 6; the band-selection caveat is worth a
bonus mark.]

**R2 — is B better?**

*Evaluating the conclusion:* the difference is
$(313.0 - 311.4)/311.4 = 0.51$ %. The stated uncertainty is 0.5 % on each
measurement, i.e. $\pm1.56$ s. If the two measurements were independent, the
uncertainty of the *difference* would be $\sqrt{2}\times1.56 = 2.2$ s, which is
larger than the 1.6 s difference observed. On that basis the conclusion is
**not supported**: the difference is not statistically resolved at one sigma,
let alone at $k=2$.

But that analysis is itself wrong in an important way, and a strong answer
says so. The 0.5 % is dominated by *systematic* terms (calibration, density
model, tare) that are largely **common** to two tests on the same stand a week
apart. Common systematics cancel in the difference. What does *not* cancel is
anything that changed between the two tests: recalibration, a different
propellant batch, ambient temperature affecting the density model, a
disturbed line routing changing the tare, and any drift. So the true
uncertainty of the difference is somewhere between $\sqrt2\times$ the random
part (small) and $\sqrt2\times$ the total (2.2 s), and *nobody knows where*
without a repeatability measurement. The manager's conclusion is not proven
wrong; it is unsupported by the data as presented.

*A sequence that resolves 0.5 %:*
1. Establish the stand's short-term repeatability by firing **the same
   injector** three to five times in one day without touching calibration.
   The scatter of those runs is the empirical uncertainty of a difference. If
   it is 0.15 %, a 0.5 % difference is resolvable; if it is 0.6 %, no design
   of experiment on this stand will resolve it.
2. Run an **interleaved paired sequence**: A, B, A, B, A, B on the same day,
   same calibration, same propellant lot, same ambient. Compare the paired
   differences, not the absolute means.
3. Analyse the mean difference against the standard error of the differences,
   $s_d/\sqrt{n}$, with a paired $t$-test. With $n = 3$ pairs and a
   repeatability of 0.15 %, the standard error of the mean difference is
   0.087 %, and a 0.5 % effect is resolved at better than 5 sigma.
4. Confirm the *mechanism*, not just the number: if B is really better it
   should show up as higher $\eta_{c^*}$ (not $\eta_{C_f}$, since the nozzle is
   unchanged), and the improvement should track with MR in the way the mixing
   hypothesis predicts. A performance gain with no mechanism is a measurement
   artefact until proven otherwise.

*Assumptions the sequence relies on:* that the systematic errors really are
common between the interleaved runs (no recalibration, no hardware change to
the stand, no propellant lot change); that thermal state does not accumulate
across runs in a way that biases later runs (check by comparing the first and
last A runs); and that the injectors themselves do not change during the
sequence — which for a development injector with erosion or coking is not
guaranteed and should be checked by borescope between runs.

[6 for the correct statistical criticism, 6 for recognising the
common-systematic cancellation, 6 for the sequence, 2 for the assumptions.]

**R3 — what acceptance testing structurally cannot catch.**

An acceptance test runs a short duration at nominal conditions on every unit.
By construction it cannot catch:

1. **Design deficiencies.** If every unit is built exactly to a drawing that is
   wrong, every unit passes. *Caught by:* qualification testing at envelope
   corners and extended duration.
2. **Duration- and cycle-dependent failures.** Coking, thermal fatigue
   cracking, erosion, creep, bearing wear — anything whose damage accumulates
   past the acceptance duration. A 40 s in-flight failure preceded by a 4 s
   $p_c$ decay is the signature of a *progressive* failure: burn-through,
   coolant channel blockage, or throat erosion. An acceptance firing of 20 s
   would not have reached it. *Caught by:* qualification life testing at
   $\ge1.2\times$ flight duration, and by a development calorimeter campaign
   establishing the wall-temperature margin.
3. **Environment-dependent failures.** Anything triggered by launch vibration,
   acoustics, shock or thermal cycling, none of which exist on a static stand.
   *Caught by:* component and stage-level environmental qualification per
   [SMC-S-016]/[STD-7001], and by a stage-level green run for the coupled
   dynamics.
4. **Interaction failures at the vehicle level.** POGO, feedline dynamics,
   base heating, engine-to-engine interaction, propellant-utilisation
   coupling. *Caught by:* stage-level testing (green run) and vehicle-level
   integrated analysis.
5. **Failures whose trigger is a flight-only condition** — vacuum start,
   restart after a cold coast, in-flight acceleration and slosh, gimbal
   excursion under load. *Caught by:* altitude-facility testing and
   thermal-vacuum testing.
6. **Latent workmanship escapes that a short nominal firing does not
   stress** — a marginal braze that survives one thermal cycle and fails on
   the fifth. *Caught by:* proof and leak testing at the component level,
   NDE, and process control rather than by any firing.

Given the described symptom — a 4 s progressive $p_c$ decay at 40 s — the two
strongest candidates are (2) and (6): a cooling-circuit or wall failure that
takes longer than the acceptance duration to develop. The test that would have
caught it is a **long-duration qualification firing at or beyond flight
duration with wall-temperature and coolant-$\Delta T$ instrumentation**, and
the process control that would have prevented it is component-level NDE of the
cooling circuit.

[3 per category up to five categories, 5 for correctly diagnosing which
category the described symptom belongs to and naming the specific test.]

**R4 — the "34 Hz instability".**

*What I believe is happening.* A 3.5 m sense line has
$f_{1/4} = a/(4L)$. For nitrogen at 300 K that is $353/14 = 25$ Hz; for a line
filled with warm combustion products or a propellant vapour it could easily be
30–40 Hz. **The reported 34 Hz feature is almost certainly the sense line
ringing**, not the engine. The "grows during the run" observation is
consistent: as the line's contents heat up and change composition during the
firing, $a$ rises, the resonance moves, and the damping falls — so the ringing
gets stronger and shifts. It is also consistent with the line being
progressively cleared of purge gas.

*Three measurements, and what each shows under each hypothesis:*

1. **Change the line length** (halve it to 1.75 m) and refire.
   - *Sense-line hypothesis:* the feature moves to ~68 Hz, i.e. exactly
     doubles. This is the decisive test.
   - *Real instability:* the feature stays at 34 Hz.
2. **Install a close-coupled dynamic transducer** in a chamber wall port and
   record both channels simultaneously.
   - *Sense-line hypothesis:* the 34 Hz feature appears on the sense-line
     channel and is absent (or 20–30 dB down) on the close-coupled channel.
   - *Real instability:* it appears on both, with comparable amplitude and
     high coherence.
3. **Instrument the feed lines** (fuel and oxidiser manifold pressures, and
   the flow channels) and compute coherence with $p_c$.
   - *Sense-line hypothesis:* no 34 Hz content on the feed or flow channels;
     coherence near zero.
   - *Real instability (chug, which is the only plausible real mechanism at
     34 Hz):* strong, coherent 34 Hz on the feed pressures and on both flow
     channels, with a definite phase relationship to $p_c$ — chug is by
     definition a feed-system-coupled mode and *must* show on the feed side.

A fourth, cheap, corroborating check: does the thrust channel show 34 Hz? If
the chamber pressure really is oscillating at ±X %, thrust must oscillate at
approximately the same fraction, subject to the thrust stand's own transfer
function at 34 Hz. If thrust is quiet, the chamber is quiet.

*Reporting.* Until at least measurement (1) or (2) is done, the correct
statement in the test report is "a 34 Hz feature is present on the chamber
pressure channel; its origin is not established and the installed measurement
cannot distinguish a sense-line resonance from a low-frequency combustion
instability." Writing "the engine has a 34 Hz instability" is a claim the
instrumentation cannot support.

[5 for the diagnosis with the frequency calculation, 4 per measurement with
both branches stated, 3 for the reporting discipline.]

**R5 — qualifying an $\varepsilon = 150$ engine on a constrained budget.**

*What can honestly be qualified at sea level with a truncated nozzle
(truncated to, say, $\varepsilon = 8$–10 so it runs full at sea level):*
- Injector and combustion performance: $c^*$ and $\eta_{c^*}$ — these depend
  on the chamber and injector, not the nozzle, and $c^* = p_{c,ns}A_t/\dot m$
  is measurable with a truncated nozzle exactly as with the full one.
- Chamber and throat heat transfer, cooling-circuit $\Delta p$ and $\Delta T$,
  and wall temperatures in the chamber and throat region.
- Combustion stability, including bomb or pulse-gun rating — the acoustic
  modes of interest are chamber modes, essentially unaffected by the
  downstream nozzle extension.
- Start and shutdown sequencing, ignition reliability, valve timing, and the
  lead/lag matrix (at ambient back-pressure).
- Turbopump performance, cycle balance, and the power-balance-derived
  quantities.
- Durability of the chamber, injector and turbomachinery in cycles and
  seconds — most of the life demonstration.
- Structural loads, vibration, and the engine's own dynamic environment.

*What cannot:*
- $C_f$ and $\eta_{C_f}$ at the flight area ratio — hence vacuum $I_{sp}$,
  which is the number the mission actually buys.
- Nozzle-extension structural and thermal behaviour: the extension's own
  cooling (radiative, dump, or regenerative), its thermal growth, and its
  start-transient loads.
- Nozzle start transient and separation behaviour during ignition and
  shutdown at low ambient pressure — the side loads that govern the
  extension's structural design.
- Vacuum ignition and restart after a cold coast.
- Plume-induced base heating and any plume–vehicle interaction.
- Extendible-nozzle deployment, if fitted.

*A programme that minimises altitude-facility time:*
1. **All development and most qualification at sea level with a truncated
   nozzle:** the full envelope map, the MR and $p_c$ excursions, the
   stability rating, and the bulk of the life accumulation. Target ≥80 % of
   total qualification seconds here.
2. **Nozzle extension qualified separately as a structure and as a thermal
   article:** thermal-vacuum testing of the extension alone to its predicted
   flight temperature profile; static structural test to the predicted start
   side loads (obtained by analysis validated against the sea-level truncated
   configuration's measured transient); vibration and acoustic qualification
   per the environmental standard.
3. **Analysis, anchored:** compute $C_f$ at $\varepsilon = 150$ using a method
   (method of characteristics plus a boundary-layer and divergence loss model)
   that has been anchored to the measured $\eta_{C_f}$ of the truncated
   nozzle at sea level. The anchoring is what makes the extrapolation
   defensible rather than a hope; state the residual uncertainty explicitly.
4. **A minimum altitude-facility campaign** — this is what you buy with the
   six-month queue slot, and it should be the shortest sequence that closes
   every remaining gap:
   - one full-duration firing at nominal for vacuum $I_{sp}$ and the anchored
     $C_f$ verification;
   - one firing at each envelope corner (MR high/low, $p_c$ high/low), short
     duration;
   - two vacuum starts, one of them a restart after a representative cold
     coast, to close the restart and thermal-soak gaps;
   - if extendible, at least one deployment-then-fire sequence.
   Four to six altitude firings, not forty.
5. **Explicitly document the residual risk** of the sea-level-to-vacuum
   extrapolation and the specific flight data that will retire it on the
   first flight.

*The gap this leaves, and it must be stated:* the coupled behaviour of a full
nozzle during a vacuum start transient is only partially covered by four to
six firings, and side-load statistics in particular need more samples than
that. If the extension is a new design rather than a heritage one, argue for
more altitude time; if it is heritage, the analysis anchor is much stronger
and the short campaign is defensible.

[6 for the "can" list, 6 for the "cannot" list, 6 for a programme that
actually minimises altitude time with a coherent argument, 2 for stating the
residual gap honestly.]

---

## K2. Quiz answers with explanations

**Q1** (10). $\gamma = 1.19$, $\varepsilon_c = 2.5$. Inverting the subsonic
area relation: $M_c = 0.2450$. From Eq. 3.10:
$$\frac{p_{c,ns}}{p_{c,inj}} = \frac{(1+0.095\times0.2450^2)^{1.19/0.19}}{1+1.19\times0.2450^2}
= \frac{1.03626}{1.07143} = 0.96718$$
$$p_{c,ns} = 0.96718\times8.00 = \mathbf{7.737\ MPa}$$
Using $p_{c,inj}$ makes $c^*$, and hence $\eta_{c^*}$, **too high** by
$1/0.96718 - 1 = \mathbf{3.39\ \%}$. Note this is larger than the WE1 and N1
cases because the contraction ratio is smaller; at $\varepsilon_c = 2.5$ the
correction exceeds any credible measurement uncertainty and cannot be ignored.

*[4 for $M_c$, 3 for the pressure, 3 for the direction and magnitude. Getting
the direction backwards loses all 3 — this is the whole point of the question.]*

**Q2** (10). **The answer is (d).** All three are true with their stated
caveats, and the question tests whether the student knows what "faithfully"
means for a first-order system.
- (a) is true: after $3\tau$ the error is $e^{-3} = 5$ % of the step, after
  $5\tau$ it is 0.7 %. The sensor gets there; it is only late.
- (b) is true and is the dangerous one: the sensor tracks the ramp's *slope*
  perfectly but with a permanent offset $\dot R\tau$. It never catches up, and
  nothing on the trace looks wrong — the line is straight and the slope is
  right. This is why ramps kill hardware and steps do not.
- (c) is true and is the definition of the corner frequency: at
  $\omega\tau = 1$, i.e. $f = 1/(2\pi\tau)$, the magnitude is $1/\sqrt2$
  (−3 dB) and the phase is $-45°$.

*[4 for choosing (d), 2 per correct justification of (a), (b), (c). An answer
of (b) alone with a good justification earns 5 — it is the most important one
— but it is not the right answer to the question asked.]*

**Q3** (10).
$$I_{sp} = \frac{88\,000}{31.5\times9.80665} = \mathbf{284.9\ s}$$
$$\frac{u_{I_{sp}}}{I_{sp}} = \sqrt{0.0035^2 + 0.0060^2} = 0.006946 = 0.695\ \%$$
$$u_{I_{sp}} = 0.006946\times284.9 = 1.98\ \mathrm{s};\qquad
U_{95} = 2\times1.98 = \mathbf{\pm3.96\ s}$$
Report as $I_{sp} = 284.9 \pm 4.0$ s ($k = 2$).

*[3 for $I_{sp}$, 4 for the RSS, 3 for applying the coverage factor and saying
so. Adding the two relative uncertainties linearly (0.95 %) loses 4; omitting
$k=2$ loses 3.]*

**Q4** (10). $f_{1/4} = 353/(4\times2.5) = \mathbf{35.3\ Hz}$.

The transducer will report **essentially nothing at 1850 Hz**. The line's
transmission at 52× its quarter-wave frequency is negligible, so a ±10 %
chamber oscillation appears as, at most, a fraction of a percent of ripple —
easily mistaken for ordinary combustion noise, or lost in it entirely. What
the channel *will* show is any low-frequency transient exciting the line's own
35 Hz resonance, which is a decaying oscillation manufactured by the plumbing
and not present in the chamber.

*[4 for the frequency, 3 for "cannot see the 1T mode" with a reason, 3 for
noting the line will ring at its own frequency. A common wrong answer — "it
will alias" — earns 0: aliasing is a sampling phenomenon, and this is an
acoustic transmission problem.]*

**Q5** (10). 2.5 marks each.

| redline | primarily catches | latency-dominating sensor |
|---|---|---|
| (i) turbine discharge temperature high | preburner/GG mixture-ratio excursion (oxidiser-rich drive gas), which destroys turbine blades in seconds | the **thermocouple**, $\tau$ 0.1–1 s in a gas stream with a sheath — by far the slowest element in any redline |
| (ii) $p_c$ low | failure to ignite, feed-system failure, or a chamber breach venting the pressure | the **pressure transducer plus its sense line**; if close-coupled, milliseconds — the fastest redline available, which is why $p_c$ redlines are used for the fast aborts |
| (iii) turbopump vibration RMS high | bearing or seal degradation, rubbing, rotordynamic instability, incipient mechanical failure | the **band-RMS averaging window** (10–50 ms), not the accelerometer, whose own response is microseconds |
| (iv) coolant $\Delta T$ high | loss of coolant flow, channel blockage, or a wall breach | the **outlet thermocouple** plus the transport delay of the coolant through the circuit — often 100+ ms of pure dead time before the sensor sees anything at all |

*[Full marks require identifying that (i) and (iv) are thermocouple-limited,
(ii) is fast, and (iii) is limited by the signal processing rather than the
sensor. Naming "the accelerometer" as the latency driver for (iii) loses the
mark — it is the averaging window.]*

**Q6** (10). With $f_s = 4$ kHz, $f_N = 2$ kHz. A 5.2 kHz component aliases to
$$|f - n f_s| = |5200 - 1\times4000| = \mathbf{1200\ Hz}$$
It appears in the data as a perfectly convincing 1.2 kHz tone.

**No post-processing can recover the truth.** Once sampled, the 5.2 kHz and
1.2 kHz components are mathematically identical sequences — the information
that distinguished them was destroyed at the converter, not obscured. The only
fixes are prospective: an analogue anti-alias filter ahead of the converter, or
a higher sample rate. The practical danger is that 1.2 kHz is a plausible
chamber frequency, so the team may spend months chasing an instability that
does not exist at that frequency.

*[4 for the alias frequency, 4 for "no, irrecoverable" with the reason, 2 for
the practical consequence.]*

**Q7** (10). 2.5 marks each.

**(a) False.** Proof testing screens gross defects and bounds the size of any
flaw present at the time of test. It does not address flaws that grow
subsequently (fatigue, stress corrosion), damage inflicted after the proof, or
a design whose failure mode is not pressure-driven. Proof testing is one leg
of a fracture-control programme, not a guarantee [AIAA-S-080].

**(b) False.** Acceptance testing runs at nominal conditions for a short
duration and demonstrates that *this article* matches the one that was
qualified. Margin is demonstrated by qualification testing, at envelope
corners and extended life, on different hardware.

**(c) True.** Patternator data measures mass-flux and local mixture-ratio
distribution, which is the direct physical input to mixing-limited combustion
efficiency and correlates usefully with $\eta_{c^*}$ [Rupe65]. It measures
nothing about the *dynamic* response of the combustion to a pressure
perturbation, so its predictive value for stability is near zero.

**(d) False.** Averaging reduces the *random* (Type A) component as $\sqrt n$;
$\sqrt{400} = 20$. It reduces a **calibration bias**, which is systematic
(Type B), by a factor of exactly **one**. The question is testing whether the
student read "bias".

*[2.5 each; a correct T/F with a wrong or absent justification earns 1.]*

**Q8** (10). Linear strain $= \alpha\Delta T = 17\times10^{-6}\times650 =
0.01105$. Area scales as the square:
$$\frac{A_{t,hot}}{A_{t,cold}} = (1.01105)^2 = 1.02222
\Rightarrow \mathbf{+2.22\ \%}$$

Using the cold area:
- $c^* = p_{c,ns}A_t/\dot m$ — $A_t$ appears in the numerator, so a
  2.22 % **under**estimate of $A_t$ gives a $c^*$ that is **2.22 % too low**,
  and an $\eta_{c^*}$ that is too low.
- $C_f = F/(p_{c,ns}A_t)$ — $A_t$ is in the denominator, so $C_f$ comes out
  **2.22 % too high**, and $\eta_{C_f}$ too high.
- $I_{sp} = F/(\dot m g_0)$ contains no $A_t$ and is unaffected, so the product
  $\eta_{c^*}\eta_{C_f}$ is also unaffected. The error moves performance
  between the two efficiencies without changing the total — exactly like the
  chamber-pressure-station error, and equally capable of sending a programme
  after the wrong problem.

*[3 for the area change with the squaring, 3 for the $c^*$ direction, 3 for the
$C_f$ direction, 1 for noting $I_{sp}$ is unaffected. Forgetting to square the
linear expansion — giving 1.11 % — loses 3.]*

**Q9** (10). A complete answer specifies five things:

- **Disturbance method:** a **bomb** (a small explosive charge in a burst-disc
  holder mounted in the chamber wall, detonated at steady state) is the
  standard for a chamber of this size, because it produces a large,
  well-characterised, broadband finite-amplitude disturbance that excites
  transverse modes. A **pulse gun** (a gas-driven shock through a wall port) is
  the alternative and is directional and more repeatable but less energetic. A
  directed-flow disturbance is the third option. Linear stability alone is not
  a demonstration — the engine must be shown to recover from a *finite*
  disturbance, because nonlinearly triggered instabilities exist in linearly
  stable chambers [SP-194][LRECI].
- **Pass criterion:** the induced oscillation must decay to within the
  pre-disturbance noise band within a specified time — historically ~40–50 ms
  (the F-1 required damping within 45 ms) — with no residual limit cycle, and
  the demonstration must be repeated at several charge sizes and several
  operating points including the envelope corners, since stability margin
  varies with $p_c$ and MR.
- **Transducer type:** **piezoresistive (silicon)** for its very high natural
  frequency and DC-coupled response, or piezoelectric if the environment is
  too hot for silicon. A strain-gauge transducer is not adequate.
- **Mounting:** **flush or shallow-recess, close-coupled** to the chamber
  wall, with a passage of a few millimetres at most, and preferably cooled.
  At least four circumferential ports so that mode shape can be identified
  from phase relationships. Any sense line disqualifies the measurement
  (Eqs. 3.12–3.13).
- **Minimum sample rate:** the 1T mode is at 2.4 kHz, but stability work must
  resolve at least 2T (≈4.0 kHz), 1R (≈4.4 kHz) and preferably 3T, plus the
  harmonics that indicate nonlinear steepening. Take the highest frequency of
  interest as ≈10 kHz and apply a waveform-fidelity factor of 5–10:
  **$f_s = 50$–100 kHz per dynamic channel**, with an analogue anti-alias
  filter at 20–30 kHz. Justifying only $2.56\times2.4 = 6.1$ kHz is a wrong
  answer: it resolves the fundamental's *frequency* and nothing about its
  waveform, growth rate, or higher modes, and growth rate is what the pass
  criterion is written on.

*[2 per element. The sample-rate justification is the discriminator between a
good and an excellent answer.]*

**Q10** (10). Either position can earn full marks; what is graded is the
argument and the falsifiability of the position.

*A model answer arguing FOR:* The novel content is precisely the coupled
content. Flight-proven engines, tanks and feedlines were each proven in a
*different* arrangement; what is new — the cluster geometry and the thrust
structure — is exactly what no lower level of the pyramid tests. Base heating
between adjacent nozzles, engine-to-engine plume interaction, thrust-structure
dynamic response to four correlated start transients, and the feedline
pressure history when four pumps prime simultaneously are all first-order
effects that exist only at stage level, and all four have caused real
failures. The heritage of the components is an argument for a *shorter* green
run, not for none. **Evidence that would change my position:** a demonstrated
dynamic model of the thrust structure and feed system, correlated to
measured data from the previous vehicle's cluster and shown to predict the new
arrangement's modes within a stated tolerance — plus a base-heating analysis
anchored on flight data from a geometrically similar cluster.

*A model answer arguing AGAINST:* A green run consumes a substantial fraction
of the flight article's certified life, risks damaging the only article, and
costs a year on the critical path. If the engines and feedlines are unchanged,
the new content is structural and thermal, and both are addressable by
analysis anchored to the previous vehicle plus a modal survey of the actual
thrust structure — which is cheap, non-destructive and directly measures the
new content. Spend the money on the modal test and the base-heating analysis.
**Evidence that would change my position:** a modal survey showing a structural
mode within the frequency range of the engine start transient or of a
plausible POGO coupling, or a base-heating analysis whose uncertainty band
exceeds the thermal-protection margin.

*[4 for a coherent position, 4 for identifying that the novel content is
coupled/structural rather than component-level, 2 for a genuinely falsifiable
piece of evidence. An answer that does not name a specific piece of evidence
capable of changing the position caps at 6, regardless of how well written.]*

---

## K3. Trade-study reference solution (T1)

### The quantitative part, first

Assume the engine runs at MR ≈ 3.4 (typical LOX/methane), so the oxidiser
carries 77.3 % and the fuel 22.7 % of the total flow.

**Baseline.** Combining the two circuits' contributions to the *total* flow
uncertainty (a sum: absolutes combine, then normalise):
$$\frac{u_{\dot m}}{\dot m} = \sqrt{(0.0055\times0.773)^2 + (0.0045\times0.227)^2}
= \sqrt{0.004250^2 + 0.001023^2} = 0.437\ \%$$
$$\frac{u_{I_{sp}}}{I_{sp}} = \sqrt{0.0045^2 + 0.00437^2} = \mathbf{0.627\ \%}$$

**Option (a), Coriolis meters.**
$$\frac{u_{\dot m}}{\dot m} = \sqrt{(0.0020\times0.773)^2+(0.0015\times0.227)^2} = 0.158\ \%$$
$$\frac{u_{I_{sp}}}{I_{sp}} = \sqrt{0.0045^2 + 0.00158^2} = \mathbf{0.477\ \%}$$

**Option (b), thrust-stand rebuild.**
$$\frac{u_{I_{sp}}}{I_{sp}} = \sqrt{0.0020^2 + 0.00437^2} = \mathbf{0.481\ \%}$$

The result that should stop the reader: **(a) and (b) are worth almost exactly
the same**, 0.63 % → 0.48 %, a 24 % reduction. Neither gets below 0.45 %,
because each leaves the other term untouched. Doing both would give 0.26 %,
but only one is affordable. And 0.48 % versus 0.63 % changes nothing about
whether the programme can measure $\eta_{c^*} \ge 0.96$: the reference $c^*$
from CEA carries its own 0.5–1 % uncertainty in the propellant thermochemistry
and the assumed $T_c$, so the *efficiency* uncertainty is dominated by the
reference, not by the instruments. This is the argument that kills (a) and (b)
as the top pick.

### The blindness argument

The programme's number-one risk is combustion instability in the team's first
methane engine. Ask what the current measurement system can see:

- Chamber pressure reaches the transducer through a **2.0 m sense line**:
  $f_{1/4} = 353/(4\times2.0) = 44$ Hz. Usable bandwidth ≈ 15 Hz.
- The data system samples at **5 kHz with no anti-alias filtering above
  2 kHz**, so any content between 2.5 and 5 kHz folds down into the band and
  masquerades as low-frequency signal.
- There is **no dynamic pressure instrumentation at all** and nothing on the
  propellant manifolds.

A typical 200 kN chamber will have a 1T mode somewhere near 2–4 kHz and a 1L
mode near 1 kHz. **The current system cannot detect either.** It cannot detect
chug reliably either (44 Hz line resonance against a 50–300 Hz phenomenon), and
worse, the line will *ring* at 44 Hz and produce a feature that looks like
chug and is not. Should an instability occur, the first indication would be
hardware damage — a burned injector face or a cracked liner — with no data
explaining it, and the team would be repeating tests blind.

That is a qualitatively different failure mode from a slightly worse $I_{sp}$
number. Options (a) and (b) improve a measurement the programme already has;
option (c) creates a measurement the programme does not have, addressing the
risk the programme itself ranked first.

### Recommendation

**Take option (c): close-coupled dynamic pressure on the chamber and both
manifolds, with a 100 kHz properly anti-aliased data system.**

The argument in one line: you cannot manage the risk you ranked first if you
cannot measure it, and a 24 % improvement in an $I_{sp}$ uncertainty that is
already dominated by the CEA reference does not change a single decision the
programme will make.

Supporting points:
- Four ports gives spatial information, which is what distinguishes a
  tangential mode from a longitudinal one from a chug: a 1T mode shows a
  definite phase relationship around the circumference (180° between opposed
  ports), a 1L mode is in phase circumferentially, and chug is in phase
  everywhere *and* coherent with the manifolds. One port cannot make that
  distinction; four can.
- The manifold channels are what make chug diagnosable and, incidentally, give
  the injector's dynamic $\Delta p$ — directly useful for the $\eta_{c^*}$ risk
  as well, since injector behaviour is the common cause.
- The 100 kHz system with proper anti-aliasing also fixes a latent defect: the
  existing 5 kHz/no-filter configuration is generating aliased data *right
  now*, on every channel, and nobody knows what is in it.

### What the recommendation does not address, and what to do about it

- **Risk 2, $\eta_{c^*} \ge 0.96$.** Partly helped (manifold dynamics inform
  injector behaviour) but not directly measured better. Mitigation without
  budget: (i) use **paired A/B testing** on the same stand and day, which
  resolves injector differences far below the absolute uncertainty and costs
  only scheduling discipline; (ii) do injector cold-flow patternator work,
  which is cheap and predicts mixing-limited $\eta_{c^*}$; (iii) reduce the
  *reference* uncertainty by fixing the thermochemistry inputs, which is
  analysis, not hardware.
- **Risk 3, 100-cycle chamber life.** Not addressed at all by (c). Mitigation:
  (i) measure the sheathed thermocouples' in-situ time constants and set wall
  redlines accordingly — free; (ii) instrument coolant $\Delta T$ and $\Delta p$
  well, which the programme presumably already has, and use $Q = \dot m c_p
  \Delta T$ as an integral heat-flux measurement; (iii) borescope and
  dye-penetrant between test series to track crack initiation, which is
  process, not instrumentation; (iv) accept that option (d) is the *right*
  answer to risk 3 and schedule it as the next upgrade.
- **Wall-thermocouple lag (option d's real value).** The 0.4 s time constant
  is a genuine safety issue, but it can be *partially* mitigated for free by
  computing the compensated temperature $T_i + \tau\,dT_i/dt$ in the reduction
  and by lowering the redline by $\dot R_{max}\tau$ for the worst credible
  ramp rate. That is judgment applied to a known deficiency, which is what you
  do when you cannot buy the fix.

### When the recommendation changes

- **If the injector is a heritage design with demonstrated stability in a
  similar chamber**, risk 1 drops and (d) becomes the answer, because chamber
  life at 100 cycles is then the binding risk and the current 0.4 s
  thermocouples cannot support a wall redline at all.
- **If the programme's deliverable is a performance guarantee to a customer**
  — a contractual $I_{sp}$ with a penalty — then the measurement uncertainty
  *is* the product, and (a) becomes the answer, with (b) a close second.
- **If the engine is a pintle or another inherently stable architecture**
  (module 07), risk 1 is overstated and the ranking should be revisited before
  spending on (c).
- **If the team can borrow dynamic instrumentation** from a partner or a
  facility for the first ten tests, buy (d) and rent (c). Always check whether
  the trade is actually forced before accepting its framing.

### Rubric

**A strong answer must contain:**
- Both quantitative $u_{I_{sp}}$ calculations, correctly treating the flow
  uncertainty as a *sum* of two circuits, and the observation that (a) and (b)
  are worth roughly the same.
- The observation that $\eta_{c^*}$ uncertainty is dominated by the CEA
  reference, so improving $u_{I_{sp}}$ from 0.63 % to 0.48 % changes no
  decision.
- The sense-line quarter-wave calculation (44 Hz) and the aliasing observation,
  used to establish that the system is *blind* to risk 1.
- A recommendation of (c) with the "cannot manage what you cannot measure"
  argument, or a defensible recommendation of (d) with an explicit argument
  that risk 1 is overstated.
- Concrete no-cost mitigations for the risks the choice does not address —
  paired A/B testing and thermocouple lag compensation are the two that must
  appear.
- At least two circumstances that would change the answer.

**Loses marks for:**
- Recommending (a) or (b) on the grounds that "measurement accuracy is
  fundamental", without computing that the improvement is 0.15 percentage
  points and without noticing the CEA reference floor.
- Treating the two flow uncertainties as though they combine as relative
  values (giving $\sqrt{0.55^2+0.45^2} = 0.71$ %), which is the standard error
  — they are a sum, so absolutes combine, and the oxidiser dominates because
  it carries three quarters of the flow.
- Recommending (c) without noticing that it does nothing for risks 2 and 3,
  or without proposing what to do about them.
- Any answer that does not compute the sense-line frequency. The whole
  trade turns on it.
- Recommending "do all four" — the constraint is stated and part of the
  exercise is accepting it.

---

## K4. Common wrong answers and what they reveal

**Adding relative uncertainties linearly.** Writing
$u_{I_{sp}}/I_{sp} = 0.35\% + 0.60\% = 0.95\%$ instead of RSS. It reveals that
the student has not internalised that independent errors are as likely to
cancel as to add, and it produces a number that is systematically ~40 % too
pessimistic. The linear sum is the *worst case* bound, not the uncertainty.

**Combining a sum's uncertainties as relative values.** Computing
$u_{\dot m}/\dot m = \sqrt{0.005^2+0.002^2}$ for
$\dot m = \dot m_o + \dot m_f$. This is the single most common error in this
module. For a sum, the *absolute* uncertainties combine; the relative
uncertainty of the total then depends on how the flow splits, and a very
accurate meter on a small stream contributes almost nothing. Students who make
this error also usually recommend upgrading the wrong meter.

**Reporting an efficiency above 1 and being pleased.** Every time this happens
it is a bookkeeping error, and the reflex should be to look for the wrong
pressure station, the cold throat area, or an uncounted flow — in that order.
A student who writes "$\eta_{c^*} = 1.02$, so the engine outperforms CEA" has
not understood that $c^*_{ideal}$ is a thermodynamic ceiling.

**Confusing the sensor's bandwidth with the measurement's bandwidth.**
"The Kulite is good to 500 kHz so we can see the 1T mode." The transducer is
one element in a chain that includes a passage, a cavity, a cable and a
sampler, and the slowest element governs. Students consistently underestimate
how completely a sense line destroys dynamic response.

**Believing Nyquist is sufficient.** "We sampled at 2.5× so we're fine."
Nyquist is a reconstruction theorem for a signal that is *already*
band-limited. Without an analogue anti-alias filter, sampling at any rate
produces corrupted data, and no rate is high enough if the filter is missing.
Related: choosing $2.56\times f_{max}$ for a waveform measurement when 2.56×
is a spectral-analysis convention and gives dreadful time-domain fidelity.

**Treating a redline as protection.** Students design redlines as though
detection were instantaneous, then are surprised by the concept of latency.
The chain is sensor → filter → sampler → persistence → logic → valve, and it
is 50–500 ms. A redline limits damage; margin and pre-test verification
prevent it.

**Believing the thermocouple.** Taking an indicated transient temperature at
face value, or quoting a catalogue time constant instead of the installed one.
$\tau$ depends on the bead, the sheath, the contact and the local heat-transfer
coefficient, and varies by two orders of magnitude between a bare fine wire
and a sheathed probe. A student who does not ask "what is $\tau$ in this
installation?" will misread every transient they ever see.

**Assuming cold flow settles stability.** "The patternator showed excellent
uniformity, so the injector is good." Cold flow at atmospheric back-pressure
with a non-vaporising liquid and no acoustic field predicts mixing-limited
$\eta_{c^*}$ and says nothing whatever about the combustion response function.
Programmes have been destroyed by this specific inference.

**Ignoring the reference in an efficiency.** Comparing your $\eta_{c^*}$
against a published one without checking whether both are against
one-dimensional equilibrium, frozen, or a kinetics-corrected reference. The
differences run to two or three percent, which is the entire quantity being
compared [CPIA-246].

**Confusing "test like you fly" with "test at flight conditions".** Students
treat the phrase as being about the environment. It is about configuration,
software, sequence and operation as well, and the deviations that hurt
programmes are usually configurational, not environmental.

**Attributing every frequency to combustion.** A peak in a PSD is guilty until
proven physical. Before calling anything an instability, check: does it track
shaft speed (turbopump)? Does it move when the sense line changes (plumbing)?
Does it move when the sample rate changes (aliasing)? Is it 50/60 Hz or a
harmonic (ground loop)? Does it appear on independent channels with
independent failure modes (real)? Skipping this checklist is how test
programmes lose months.
