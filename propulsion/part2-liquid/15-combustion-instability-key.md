# Module 15 — Combustion Instability — Answer key

Solutions to the problems and quiz in
[`15-combustion-instability.md`](15-combustion-instability.md). Numbers were
computed with `tools/rocket.py` and are registered in
`tools/examples/15.py` where they map to a library function.

Constants: $R_u = 8314.46$ J/(kmol·K), $g_0 = 9.80665$ m/s².
Bessel roots of $J_m'(x)=0$: 1T 1.8412, 2T 3.0542, 3T 4.2012, 1R 3.8317,
4T 5.3176, 1T1R 5.3314. For non-integer order,
$\alpha_{\nu,1}\approx \nu + 0.8086\nu^{1/3} + 0.0725\nu^{-1/3} - 0.0510\nu^{-1}$.

---

## K1. Problem solutions

### Conceptual

**C1.** All three circumferential transducers in phase means there is **no
azimuthal variation**: $m = 0$. That rules out every tangential mode. The
candidates are a **radial mode (1R)** or a **longitudinal mode**. The lateral
accelerometer seeing nothing is consistent with both (an axisymmetric pressure
field exerts no net lateral force) and therefore does not discriminate — what it
*rules out* is a tangential mode, confirming the transducer phase result rather
than adding to it. To separate 1R from 1L you need either the computed
frequencies ($f_{1R} = 3.8317c/\pi D_c$ versus $f_{1L} = c/2L_{cyl}$) or
transducers at two *axial* stations: 1L reverses phase across the chamber
mid-plane, 1R does not.

A full-credit answer notes that 2.4 kHz is a plausible 1R frequency for a chamber
of $D_c \approx 0.6$ m at $c \approx 1200$ m/s, and that the correct next
measurement is axial, not circumferential.

**C2.** From Eq. 3.3 the driving integral is $\int p'q'\,dV$, weighted by the
*local* mode pressure amplitude. A closed-closed longitudinal mode has pressure
antinodes at both ends and a pressure *node* at mid-chamber. Heat release at the
face therefore sits at $|p'| = \hat p$ and contributes fully; the same heat
release at mid-chamber sits at $|p'| \approx 0$ and contributes nothing. That is
the first part.

For a *transverse* mode the axial dependence is flat (for $q=0$), so the argument
above does not apply — the face is not special on those grounds. It is special
for a different reason: **the transverse acoustic velocity is unattenuated at the
face**, and the face is where the liquid sprays are. Velocity coupling (§3.10)
acts on liquid, and all the liquid is at the face. Heat release moved downstream
is heat release occurring in already-gaseous, already-mixed flow, which responds
far less.

Full credit requires both mechanisms named separately: **pressure weighting** for
longitudinal, **velocity coupling on liquid** for transverse.

**C3.** Nothing will happen to the screech. Injector $\Delta p$ enters the
stability problem through the loop gain $k = p_c/2\Delta p$ of the *feed-system*
model (Eq. 3.5), which is a lumped model valid only where the acoustic wavelength
exceeds the chamber dimensions — i.e. below a few hundred hertz. A 3 kHz mode is
a chamber acoustic mode; the injector's hydraulic resistance is not in its
feedback loop at all.

There is a second-order effect worth mentioning for full marks: raising $\Delta p$
raises injection velocity, which shortens the atomization and vaporization lag
$\tau$ and moves the response peak $1/(2\tau)$ *up*. Whether that helps or hurts
depends on which side of 3 kHz the response peak currently sits — so the proposal
is not merely useless, it is of unknown sign.

The cost is certain: 10 % of $p_c$ of extra pump discharge pressure, hence extra
turbine power, hence (gas generator) more overboard flow or (staged combustion)
higher preburner temperature — 0.5–1.5 % of $I_{sp}$ on a typical booster, plus
the pump and line redesign.

**C4.** (i) Finer drops vaporize faster, so the combustion time lag shortens and
the heat release moves *toward* the injector face, where the transverse mode has
its full pressure amplitude and its full velocity coupling on the remaining
liquid. The driving term rises. (ii) Finer drops follow the oscillating gas more
closely, so the relative velocity between gas and droplets falls and the
**droplet drag damping** — one of the few significant natural damping terms in
the chamber — falls with it. Driving up, damping down: the Rayleigh balance moves
twice in the same direction. This is why $\eta_{c^*}$ improvements are treated
with suspicion by stability engineers.

**C5.** *Reveals it:* a **stability rating test** — bring the engine to steady
state and impose a finite-amplitude disturbance (bomb, pulse gun, directed gas
flow) of known magnitude, then measure the decay of the resulting oscillation.
Sweeping the pulse amplitude finds the threshold above which the disturbance
grows instead of decaying, which is the definition of nonlinear instability.

*Does not reveal it:* any duration of undisturbed steady-state running, however
long, and any amount of low-frequency instrumentation. A nonlinearly unstable
chamber is *stable* to the infinitesimal noise it generates itself; it will run
indefinitely until something triggers it.

*Why it structures the programme:* because the property to be demonstrated is a
response to a disturbance, the test must supply the disturbance. Everything
follows — the bomb, the requirement expressed as a recovery time, the repetition
across operating points, and the fact that "1,000 seconds of successful running"
is not evidence and is not accepted as such.

**C6.** At $\omega\tau = 2\pi$ the lag is exactly one full period of the
oscillation. The $n$–$\tau$ law says the burning rate responds to the
*difference* between the pressure now and the pressure one lag ago — and if the
lag is a whole period, those two pressures are identical. The difference is zero
and the combustion does not respond at all. (At $\omega\tau = \pi$, half a
period, the two pressures are maximally different and the response is maximal.)

*Design action:* if the problematic mode is at frequency $f$, you want
$\tau \approx 1/f$ (or $2/f$, ...) rather than $\tau \approx 1/(2f)$. Since $\tau$
is set by element size, injection velocity and impingement distance, this is a
real design handle — and it is the argument for changing element size rather than
adding hardware, when the schedule permits. It also explains why an engine can be
*stabilised by making the combustion slower*, which is counter-intuitive until
you see the differencing operator.

**C7.** Any three of:
1. **Frequency versus chamber length.** An acoustic longitudinal mode scales as
   $c/2L_{cyl}$; an entropy mode scales as $\approx \bar u/L_{cyl}$ from the
   convective leg. Both move with $L$, but a *lengthening* changes them by
   different factors, and the entropy mode is far more sensitive because
   $\bar u \ll c$ makes the convective leg dominate.
2. **Frequency versus mixture ratio / chamber temperature.** Acoustic
   $\propto \sqrt{T_c}$ (weak); entropy $\propto \bar u \propto$ mass flux and
   temperature in a different combination, and it responds strongly to anything
   that changes gas velocity.
3. **Frequency versus mass flow at fixed geometry.** Throttle the engine: the
   convective leg changes with $\bar u$, so the entropy frequency tracks flow
   rate almost linearly. An acoustic mode barely moves.
4. **Axial phase.** A longitudinal acoustic mode has a standing-wave phase
   structure (0° or 180° between stations); a convected entropy wave shows a
   phase that increases *linearly with axial distance* at a rate corresponding
   to a propagation speed of $\bar u$, not $c$. This is the definitive test if
   you have two axial pressure or temperature probes.

**C8.** A standing mode has fixed pressure antinodes at two opposite wall
locations, so it scours two stripes and leaves the rest of the circumference
comparatively intact. A spinning mode carries its antinode around the
circumference, so **every point on the wall experiences the peak acoustic
velocity once per cycle**. The integrated heat load over a run is therefore
applied uniformly to the whole circumference rather than concentrated in two
stripes — but the more important point is that with a standing mode the wall
between the stripes is available to conduct heat away, whereas a spinning mode
overheats the entire circumference simultaneously and there is no cold material
to conduct into. There is also no "lucky" azimuth: with a standing mode, a
transducer or a film-cooling ring may sit on a node and be undamaged; with a
spinning mode nothing escapes.

### Calculation

**N1.** $R = 8314.46/13.0 = 639.6$ J/(kg·K);
$c = \sqrt{1.19 \times 639.6 \times 3500} = \sqrt{2.664\times10^6} =
\mathbf{1632\ m/s}$.
$\pi D_c = \pi \times 0.34 = 1.0681$ m.

| mode | formula | value |
|---|---|---|
| 1L | $c/2L_{cyl} = 1632/0.56$ | **2915 Hz** |
| 1T | $1.8412 \times 1632/1.0681$ | **2813 Hz** |
| 2T | $3.0542 \times 1632/1.0681$ | **4667 Hz** |
| 1R | $3.8317 \times 1632/1.0681$ | **5855 Hz** |
| 1T1L | $\sqrt{2813^2 + 2915^2}$ | **4051 Hz** |

Note that $f_{1T} < f_{1L}$ here, but only by 3.5 %. The crossover is at
$L_{cyl} = 0.853\,D_c = 0.290$ m (WE1 sanity check) and this chamber is at
$L_{cyl} = 0.28$ m, just below it. A short, fat hydrogen chamber therefore puts
1L and 1T within a few percent of each other, which makes them nearly impossible
to separate in a PSD and is the reason to instrument azimuthally: 1T reverses
phase across a diameter, 1L does not.

**N2.** $\Gamma(1.22) = \sqrt{1.22}(2/2.22)^{2.22/0.44} = 0.6524$.

$$\tau_c = \frac{L^*}{\Gamma^2 c^*} = \frac{0.90}{0.6524^2 \times 1780} = \frac{0.90}{757.6} = \mathbf{1.188\ ms}$$

Solve $\omega\tau + \arctan(\omega\tau_c) = \pi$ with $\tau = 1.0$ ms:
$\omega = 1973.9$ rad/s → $f = \mathbf{314\ Hz}$.
Check: $\omega\tau = 1.974$, $\arctan(1973.9\times1.188\times10^{-3}) =
\arctan(2.345) = 1.168$, sum $=3.142$ ✓.

$$k_{crit} = \sqrt{1+2.345^2} = 2.549, \qquad \left(\frac{\Delta p}{p_c}\right)_{min} = \frac{1}{2\times2.549} = \mathbf{19.6\ \%}$$

**N3.** $k = 1/(2\times0.22) = 2.273 < k_{crit} = 2.549$, so stable. Newton
iteration on $\tau_c s + 1 + ke^{-s\tau} = 0$ from $s = i\times1974$ gives

$$s = -85.6 + 1942.1\,i\ \mathrm{s^{-1}} \Rightarrow f = 309\ \mathrm{Hz},\ \alpha_d = 85.6\ \mathrm{s^{-1}}$$

$$t_{10} = \frac{\ln 10}{85.6} = \mathbf{26.9\ ms}$$

**26.9 ms < 30 ms, so it meets the requirement — with 10 % margin, which is
thin.** A grader should reward the observation that a design sitting 11 % below
$k_{crit}$ produces only 10 % margin on the recovery time: **the mapping from
gain margin to time margin is compressive**, and a 22 % design that looks
comfortable on the gain plot is marginal on the criterion that is actually
written into the specification.

**N4.** $c_{cav} = \sqrt{1.26 \times 600 \times T}$.

| $T_{cav}$ | $c_{cav}$ (m/s) | $L = c/4f$ (mm) |
|---|---|---|
| 1000 K | 869.5 | 106.0 |
| **1400 K (design)** | **1028.8** | **125.5** |
| 1800 K | 1166.5 | 142.3 |

Building the 125.5 mm cavity and running it at the extremes tunes it to
$869.5/(4\times0.1255) = 1733$ Hz and $1166.5/(4\times0.1255) = 2324$ Hz.
Relative to the 2050 Hz target that is **−15.5 % / +13.4 %**, i.e. a tuning error
of roughly $\pm 14\ \%$ — which follows directly from $f \propto \sqrt{T}$ and
$\sqrt{1800/1400} = 1.134$. Since a rocket absorber's useful band is roughly
$\pm 1/(2Q)$, an absorber with $Q > 4$ is outside its band at the extremes.
Practical response: multiple depths, and/or a deliberately lossy (low-$Q$)
design.

**N5.** $f_{1T} = 1.8412 \times 1150/(\pi\times0.62) = \mathbf{1087\ Hz}$.
Required eigenvalue: $\alpha \ge \pi D_c f/c = \pi\times0.62\times2600/1150 =
4.404$.

| $N$ | $\nu$ | $\alpha_{\nu,1}$ | $f$ (Hz) |
|---|---|---|---|
| 5 | 2.5 | 3.633 | 2145 |
| 6 | 3.0 | 4.201 | 2480 |
| **7** | **3.5** | **4.762** | **2812** |

**$N = 7$ compartments**, giving 2812 Hz, a factor $2812/1087 = \mathbf{2.59}$
above the unbaffled 1T.

**N6.** $I = \rho\ell/A = 1140\times18/0.038 = \mathbf{5.40\times10^{5}}$ kg/m⁴.

$$C = \frac{1}{(2\pi f)^2 I} = \frac{1}{(2\pi\times3.5)^2 \times 5.40\times10^5} = 3.83\times10^{-9}\ \mathrm{m^5/N}$$

$$V_g = C\,n\,p_g = 3.83\times10^{-9}\times1.4\times4\times10^{5} = 2.14\times10^{-3}\ \mathrm{m^3} = \mathbf{2.1\ L}$$

Comment expected for full marks: 3.5 Hz is a factor 2.6 below the 9 Hz structural
mode, which is adequate separation; and the answer is *litres*, which is why POGO
accumulators are small compared with everything else on a vehicle.

**N7.**

| $\varepsilon_c$ | $D_c = D_t\sqrt{\varepsilon_c}$ | $f_{1T}$ at $c=1250$ | $f_{1T}$ at $c=900$ |
|---|---|---|---|
| 1.50 | 1.091 m | 671 Hz | 483 Hz |
| 1.75 | 1.179 m | 622 Hz | 448 Hz |

**Spread: 448–671 Hz, a factor of 1.5, from two assumptions neither of which is
published.** The comment expected: the contraction ratio uncertainty contributes
only $\pm4\%$, while the sound-speed uncertainty contributes $\pm 20\%$ — the
dominant unknown is *what the gas is actually like where the mode is driven*, not
the geometry. That is why measured mode frequencies, not computed ones, are what
a programme designs its absorbers around, and why Eq. 3.9 is advertised as
±10–20 %.

**N8.** $\alpha_d = \ln(42/6.5)/0.012 = \ln(6.462)/0.012 = 1.866/0.012 =
\mathbf{155.5\ s^{-1}}$.

$$\zeta = \frac{\alpha_d}{2\pi f} = \frac{155.5}{2\pi \times 1350} = \mathbf{0.0183}, \qquad Q = \frac{1}{2\zeta} = \mathbf{27.3}$$

$$t_{10} = \frac{\ln 10}{155.5} = \mathbf{14.8\ ms}$$

**14.8 ms against a 45 ms requirement — it passes with a factor of 3 margin.**
A good answer notes that $\zeta = 0.018$ is a *lightly* damped resonator by any
normal engineering standard, and that "passes with margin" here still describes a
chamber that rings for about twenty cycles.

### Engineering reasoning

**R1. Diagnosis: chug**, brought on by throttling.

The evidence: (i) 480 Hz is in the chug/low band and far below any plausible
transverse acoustic mode for a 1.2 MN kerosene chamber (which would be 500–900
Hz — close enough to be worth checking, which is the point of the second
measurement below); (ii) the oscillation appears only at reduced thrust; (iii)
$\Delta p_{inj}/p_c$ has collapsed from $20/100 = 20\%$ to $8.5/65 = 13\%$, which
is the classic throttling collapse ($\Delta p \propto \dot m^2$, $p_c \propto
\dot m$, so $\Delta p/p_c \propto \dot m$). At 13 %, $k = 3.85$; the chamber's
$k_{crit}$ for a kerosene lag of 1.0–1.3 ms will be in the 2.2–3.0 range. It is
over the line.

Confirming measurements:
1. **Frequency versus operating point.** Sweep the throttle and plot the tone
   frequency. Chug frequency moves substantially with $\Delta p$ and $p_c$; a
   transverse acoustic mode is nearly fixed (it moves only as $\sqrt{T_c}$).
   This is the single most decisive test and costs one test point.
2. **Feed-line dynamic pressure.** Chug is a feed-system-coupled mode, so the
   oscillation appears in the injector manifold and the line at the same
   frequency and with a definite phase relative to $p_c$. A pure chamber acoustic
   mode does not show up in the line at comparable amplitude. Combine with
   azimuthal phase in the chamber: chug is $m=0$, in phase everywhere.

Fixes, with costs:
- **Cavitating venturis in both feed circuits.** Decouples the chamber from the
  feed system entirely ($k\to0$). Cost: a permanent pressure loss of typically
  10–20 % of the venturi upstream pressure, at all throttle settings, hence pump
  power and $I_{sp}$. Cheap in schedule, expensive in performance.
- **Dual-manifold or variable-area injector.** Holds $\Delta p/p_c$ up at low
  flow. Cost: a new injector, 3–6 months, and a new set of stability questions.
- **Restrict the throttle range.** Free, and it is what the LMDE effectively did
  by prohibiting the 60–100 % band for a different reason.
- **Raise the design-point $\Delta p$ so that 65 % thrust still gives 19–20 %.**
  Requires 20/0.65 ≈ 31 % at full thrust: a very expensive pump.

Recommended for a programme in test: **cavitating venturis**, because they work,
they are line hardware rather than injector hardware, and they can be fitted in
weeks.

**R2.** They will diverge because the mode frequencies differ by roughly a factor
of three.

Kerosene chamber, $D_c = 0.95$ m, $c \approx 1250$ m/s: $f_{1T} \approx 1.8412
\times1250/(\pi\times0.95) \approx 770$ Hz. A quarter-wave absorber for 770 Hz at
a cavity temperature of 1200 K ($c_{cav} \approx 740$ m/s) needs
$740/(4\times770) = 240$ mm of depth. There is nowhere to put that in an
injector. **This engine gets baffles**, and probably an element-size reduction to
move the response peak up.

Hydrogen chamber, $D_c = 0.40$ m, $c \approx 1620$ m/s: $f_{1T} \approx
1.8412\times1620/(\pi\times0.40) \approx 2370$ Hz. A cavity at 1200 K with a
hydrogen-rich gas ($c_{cav}$ 900–1100 m/s) needs 95–115 mm — which fits in an
injector face, and does not disturb the injection pattern. **This engine gets
acoustic cavities.** Baffles would additionally be a severe cooling problem in a
hydrogen chamber's flux environment and would disturb a coaxial pattern that is
carefully balanced for wall compatibility.

The general principle to state: **the absorber depth scales as $c_{cav}/4f$, and
$f$ scales as $c/D_c$, so absorber depth scales as $D_c \times
(c_{cav}/c)$ — absorbers get impractical exactly when chambers get big and cold,
and that is where baffles take over.**

**R3.** The 1,880 Hz peak is a **chamber acoustic mode** and the 3,760 Hz peak is
its **second harmonic** (exactly 2×, and a harmonic is the signature of a
non-sinusoidal limit cycle, i.e. a wave that has steepened — evidence that the
oscillation is at nonlinear amplitude, consistent with 28 dB above the floor).

The frequency shift: 1,915/1,880 = 1.0186, i.e. **+1.9 %** for an 8 % mixture
ratio change. An acoustic mode goes as $c = \sqrt{\gamma R T_c}$, so
$\delta f/f = \tfrac12 \delta T_c/T_c$ (plus small $\gamma$ and $M$ effects) —
1.9 % in frequency corresponds to about **3.8 % in chamber temperature**, which
is exactly the order of a real $T_c$ change for an 8 % mixture-ratio move near
the peak of the $T_c$ curve. **The mechanism is acoustic.**

What it rules out: chug (would move far more, and with $\Delta p$ rather than
$T_c$); an entropy mode (would move with gas velocity, a much larger change); a
pump-coupled mode (would track shaft speed, which did not change). The
identification of *which* acoustic mode requires the geometry: compute
$1.8412c/\pi D_c$ and $c/2L_{cyl}$ and see which lands at 1,880 Hz, then confirm
with azimuthal transducer phase.

**R4.** Halving element size at doubled count, at fixed total flow:

- **$\tau$ falls.** Smaller orifices give finer sprays; drop diameter scales
  roughly with orifice diameter, and vaporization time with $d^2$. Halving the
  element linear size can cut the vaporization lag by a factor approaching four.
  The response peak $1/(2\tau)$ therefore moves **up**, by up to the same factor.
  Whether this helps depends entirely on where the chamber's modes are: if the
  1T was above the old response peak, moving the peak up walks it *onto* the 1T.
  **This is the dominant risk and it must be computed, not assumed.**
- **Heat release moves toward the face**, raising $\int p'q'\,dV$ for every mode
  and raising the velocity-coupling exposure of the remaining liquid (§3.10).
- **Droplet damping falls** (§3.12) because fine drops follow the gas.
- **Element hydrodynamic frequency rises** as $v/d$, which moves *that* coupling
  out of the low band — the one genuinely favourable effect, and it is why small
  elements are the standard advice for large chambers.
- Net: **driving up, damping down, and the response peak moved by an uncertain
  amount in a known direction.**

Protective actions before first hot fire:
1. Compute the chamber modes and overlay the old and new estimated response
   peaks. If the new peak lands within ±30 % of the 1T, stop and change
   something.
2. Design the injector with **baffle or resonator provisions** — mounting bosses,
   coolant routing, face real estate — even if the first build omits them. This
   is the single highest-value insurance policy in injector design, because it
   converts a two-year problem into a three-month one.
3. Deliberately introduce a **spread of element sizes** (e.g. ±10 % across the
   face) so the $\tau$ distribution is broadened and the responses do not add in
   phase.
4. Plan the bomb test into the *first* test series, not the last, and instrument
   azimuthally from the first firing.

**R5.** Sequence: the blade overheated — most likely a coolant-passage blockage,
a braze defect, or simply a design margin that was adequate for stable operation
but not for the local flux — and eroded progressively. As it shortened and
finally breached, the compartment it bounded merged with its neighbour, so the
effective compartment angle doubled, the admissible azimuthal order dropped from
$N/2$ to about $N/4$, and the lowest supportable transverse frequency fell by
roughly a factor of two, back toward the driven band. The 1T amplitude rose from
1.5 % to 6 % as this happened, and the rise over the last 30 s is the *record of
the blade disappearing*, not an independent event.

Note the causality direction that a good answer gets right: **the blade damage
came first and the instability second.** A student who argues that the
instability burned the blade has the sequence backwards — the engine was stable
(1.5 %) for the first 90 s with the blade intact.

Changes: (i) instrument the baffle coolant circuit and inspect blades after every
test; (ii) increase blade tip thickness and coolant flow, accepting the
$\eta_{c^*}$ cost; (iii) re-examine whether the design depends on *every* blade —
if losing one blade returns the engine to instability, the design has no
redundancy and a compartment count with margin (or a resonator array as a
backstop) is warranted; (iv) treat rising 1T amplitude during a run as a
mandatory shutdown criterion on the test stand, because the next 30 s would have
been a burn-through.

### Mini trade study — see K3.

---

## K2. Quiz answers with explanations

**Q1 (8).** $\alpha = \mathbf{1.8412}$. It is **the first non-trivial root of
$J_1'(x) = 0$**, the derivative of the first-order Bessel function of the first
kind. It arises from the rigid-wall boundary condition $\partial p'/\partial r =
0$ at $r = R_c$ applied to the solution $p' \propto J_1(\alpha r/R_c)\cos\theta$.
(4 marks for the number, 4 for the condition. "First zero of $J_1$" scores zero —
that is 3.8317 and it is the *radial* mode.)

**Q2 (8).** **(b)**. Transverse frequencies go as $c/D_c$ and $c =
\sqrt{\gamma R T_c}$, so an under-estimated chamber temperature under-estimates
the frequencies; +30 % in frequency needs about +69 % in $T_c$, which is large
but the direction is right and no other listed option moves transverse modes at
all. (a) is wrong: chamber *length* does not enter a purely transverse mode.
(c) is wrong: injector $\Delta p$ has no role in chamber acoustics.
(d) is wrong and physically absurd — an unchoked throat means the engine is not
running.

*Grader's note:* the honest full answer is that a 30 % error is more likely to be
a wrong *diameter*, a strong temperature gradient, or a non-cylindrical chamber
than a 69 % temperature error; among the options offered, (b) is the only one
that can move a transverse mode at all.

**Q3 (12).** $\Gamma(1.21) = \sqrt{1.21}\,(2/2.21)^{2.21/0.42} = \mathbf{0.6505}$.

$$\tau_c = \frac{1.15}{0.6505^2\times1750} = \frac{1.15}{740.5} = \mathbf{1.553\ ms}$$

Solve $\omega(1.3\times10^{-3}) + \arctan(1.553\times10^{-3}\omega) = \pi$:
$\omega = 1517.1$ rad/s, $f = \mathbf{241\ Hz}$; $\omega\tau_c = 2.356$;

$$k_{crit} = \sqrt{1+2.356^2} = 2.560, \qquad \frac{\Delta p}{p_c} > \frac{1}{5.119} = \mathbf{19.5\ \%}$$

(3 for $\Gamma$, 3 for $\tau_c$, 3 for $f$, 3 for the drop.)

**Q4 (10).** *Words:* an oscillation is driven when heat is added to the gas in
phase with the pressure oscillation, and damped when heat is added out of phase;
the mode grows if the net work done by the heat release over a cycle exceeds the
energy lost through the boundaries and to dissipation.

*Integral form:*
$$\frac{\gamma-1}{\gamma\bar p}\oint_T\!\!\int_V p'q'\,dV\,dt \;>\; \oint_T\!\!\oint_S p'\mathbf u'\!\cdot\!\mathbf n\,dS\,dt + \mathcal D$$

*Boundary:* $\theta = \pm 90°$ between $p'$ and $q'$ — the driving integral goes
as $\cos\theta$, so it is positive for $|\theta| < 90°$ and negative beyond.
(4 words, 4 integral, 2 phase.)

**Q5 (10).** **(b)**. A chamber can be linearly stable and nonlinearly unstable;
the first test simply contained no trigger of sufficient amplitude, the second
did (a start transient, a throttle step, debris). The 80 ms burn-through time is
itself diagnostic — it is the timescale of instability-driven heat-flux
multiplication, not of a cooling shortfall, which develops over seconds.
(a) is wrong: a wall defect gives a localised, azimuthally random burn-through,
not an 80 ms event correlated with nothing. (c) would show as a coolant
temperature and pressure signature and would take seconds. (d) is a distractor —
even a working static transducer would have shown little (see Q5's own lesson and
§7.5), which is precisely why it is not evidence either way.

**Q6 (12).** $c_{cav} = \sqrt{1.24\times380\times1100} = \sqrt{5.183\times10^5}
= \mathbf{719.9\ m/s}$.

$$L = \frac{c_{cav}}{4f} = \frac{719.9}{4\times1650} = 0.1091\ \mathrm{m} = \mathbf{109\ mm}$$

At 1600 K, $c = \sqrt{1.24\times380\times1600} = 868.3$ m/s, so the same hardware
resonates at $868.3/(4\times0.1091) = \mathbf{1990\ Hz}$ — **21 % high**, and no
longer useful against the 1650 Hz mode.
(4 for $c$, 4 for $L$, 4 for the mistuned frequency.)

**Q7 (10).** Because at $\omega\tau = \pi$ the lag is exactly half a period, so
the pressure "now" and the pressure "one lag ago" are as different as they can
possibly be — one is at the peak of the cycle when the other is at the trough.
The $n$–$\tau$ law makes the burning-rate perturbation proportional to the
*difference* of those two pressures, so the difference is maximised and the
response is maximised. At $\omega\tau = 2\pi$ the two pressures are identical and
the response vanishes; at $\omega\tau \to 0$ they are also identical and it
vanishes again. Physically: **the combustion is a differencing operator over the
lag, and a differencing operator is a bandpass filter centred on half-period
delays.**

Full credit does not require the algebra; it requires "the process compares now
with one lag ago, and half a period apart is maximally different."

**Q8 (10).** $f_{1T} = 1.8412\times1180/(\pi\times0.55) = \mathbf{1257\ Hz}$.
Required eigenvalue $\alpha \ge \pi\times0.55\times2800/1180 = \mathbf{4.100}$.
From $\alpha_{\nu,1}$ with $\nu = N/2$: $N=6$ gives $\alpha = 4.201$ →
**2869 Hz** ✓ (and $N = 5$ gives 3.633 → 2481 Hz ✗). **Six compartments.**
(3 for $f_{1T}$, 4 for the required eigenvalue, 3 for the count.)

**Q9 (10).** Any three of, with the correct coupling variable:

| mechanism | responds to |
|---|---|
| Atomization / sheet stripping by transverse cross-flow | **velocity** |
| Klystron velocity modulation and droplet bunching | **pressure** (at the face; it modulates injection velocity through $\Delta p$) |
| Droplet vaporization rate | **pressure** (gas density, saturation conditions) |
| Mixing / local mixture-ratio modulation by differential spray displacement | **velocity** |
| Hydrodynamic (fan-flapping) instability of impinging sheets locking to a mode | **velocity** primarily |
| Chemical kinetics | **pressure**, and negligible in practice at rocket conditions |

(2 for each correct mechanism, 1.33 for each correct coupling variable; award
full marks for any three correct pairs.)

**Q10 (10).** $\alpha_d = \ln 10/0.025 = \mathbf{92.1\ s^{-1}}$.
$\zeta = \alpha_d/(2\pi f) = 92.1/(2\pi\times900) = \mathbf{0.0163}$;
$Q = 1/2\zeta = \mathbf{30.7}$. That is a **lightly damped** system — for
comparison, a car suspension runs $\zeta \approx 0.3$ and a structure is called
lightly damped at $\zeta \approx 0.02$. The point to make: a "dynamically stable"
rocket chamber is a resonator with $Q \approx 30$ that happens to be net-stable,
which is why small changes in driving flip it.
(3 for $\alpha_d$, 3 for $\zeta$, 2 for $Q$, 2 for the judgment.)

---

## K3. Trade-study reference solution (T1)

### Baseline numbers (must be computed first)

$R = 8314.46/21.5 = 386.7$ J/(kg·K);
$c = \sqrt{1.19\times386.7\times3550} = \sqrt{1.634\times10^6} = 1278$ m/s.
$\pi D_c = \pi\times0.46 = 1.445$ m.

| mode | value |
|---|---|
| **1T** | $1.8412\times1278/1.445 = \mathbf{1629\ Hz}$ |
| 1L | $1278/(2\times0.42) = 1522$ Hz |
| 2T | $3.0542\times1278/1.445 = 2701$ Hz |
| 1R | $3.8317\times1278/1.445 = 3389$ Hz |

Required damping rate: $\alpha_d = \ln10/0.040 = 57.6$ s⁻¹. Achieved:
$\ln10/0.068 = 33.9$ s⁻¹. **The engine is short by a factor of 1.70 in damping
rate** — not marginal, not catastrophic. That number frames everything: the fix
must add roughly 24 s⁻¹ of net damping (or remove the equivalent driving), and
options should be judged on whether they plausibly deliver a factor of ~1.7.

Combustion response: a 350-element shear-coaxial methane face at 150 bar is
supercritical on both propellants, so the lag is mixing-controlled and short —
take $\tau \approx 0.4$–0.6 ms, putting the response peak $1/(2\tau)$ at
**830–1250 Hz**. The 1T at 1629 Hz sits on the upper shoulder of that peak. That
is the diagnosis: *the mode is above the response peak, but not far enough above*.

### The options

**Option D first, because it is a trap.** Raising $\varepsilon_c$ by 15 % raises
$D_c$ by $\sqrt{1.15} = 1.072$, to 0.493 m, and *lowers* $f_{1T}$ to
$1.8412\times1278/(\pi\times0.493) = \mathbf{1519\ Hz}$. Since the mode is
currently above the response peak, moving it **down** moves it **toward** the
peak. Option D makes the problem worse, and it costs a new chamber and 6 months
of requalification. **Reject.** (A candidate who computes this and rejects D on
the number, rather than on schedule alone, has understood the module. Moving
$\varepsilon_c$ the *other* way — smaller $D_c$ — would raise $f_{1T}$, but it
also raises the Rayleigh loss and the wall flux, and it is still a new chamber.)

**Option A — 5-compartment baffle.** $\nu = 2.5$, $\alpha = 3.633$, lowest
transverse mode $3.633\times1278/1.445 = \mathbf{3213\ Hz}$ — a factor 1.97 above
1T and far above the response band. This certainly works acoustically. Costs:
blades in a 150 bar methalox flux environment need cooling (the injector is
additively manufactured, so integral cooled blades are feasible but a redesign);
$\eta_{c^*}$ penalty 1–2 %, which is at or over the 1.5 % budget; and it is an
injector redesign, so 10 weeks of build plus design and test — call it 5–6 months.
Schedule: acceptable. Performance: **at the limit of the constraint**.

**Option B — Helmholtz resonators.** Target 1629 Hz. With a methane-rich purged
cavity at 1000–1800 K, $c_{cav} = 695$–933 m/s, so a quarter-wave depth of
107–143 mm, or a Helmholtz volume of order 100 cm³ per resonator. Practical.
Costs: face real estate and purge flow (a fraction of a percent of $\eta_{c^*}$,
well inside budget); no pattern disturbance; and because the injector is
*printed*, an array of multi-depth resonators is a modification to a model rather
than new tooling — 10 weeks of build. Risk: the tuning uncertainty computed in
WE3 and N4 is ±14–18 %, and the 1T at 1629 Hz is only 7 % above the 2T-free
region; a mistuned array delivers much less damping than the linear estimate.
Mitigate with three depths spanning ±20 % and with deliberately low $Q$.

**Option C — 600 smaller elements, +25 % $\Delta p$, more recess.** Smaller
elements shorten $\tau$, moving the response peak **up** from 830–1250 Hz toward
the 1T at 1629 Hz. That is the wrong direction for this engine. Increased recess
lengthens the effective lag and moves it back down, so the two changes partly
cancel and the net is genuinely uncertain without test data. The $\Delta p$
increase buys chug margin the engine does not need and costs cycle performance.
**High risk, unquantifiable before test, and a full injector redevelopment.**
Reject as a primary fix.

### Recommendation

**Option B as the primary fix, with the baffle provisions of Option A designed
into the same injector build but not fitted.**

Justification:
1. B attacks the mode that is actually 1.7× short of requirement, at a frequency
   where an absorber of practical depth exists — 107–143 mm, which fits.
2. It costs the least $\eta_{c^*}$ (purge flow only) and is the only option
   comfortably inside the 1.5 % budget.
3. It is the fastest: one printed injector build, 10 weeks, against 5–6 months
   for A and longer for C.
4. Its principal risk — tuning uncertainty — is mitigable by multi-depth arrays
   and is measurable *before* hot fire by cold-flow acoustic testing of the
   injector with an acoustic driver.
5. Designing in the baffle mounting and coolant provisions costs almost nothing
   in a printed part and converts the fallback from a 6-month problem into a
   6-week one. Given 14 months to flight, carrying a fallback is the decision a
   programme should make, and it is the part of the answer that separates a good
   response from a correct one.

**Confirming test.** Cold-flow acoustic sweep of the injector to verify resonator
tuning; then hot fire with bomb pulses at nominal, at the low-mixture-ratio
corner (where 14 % was seen), and at the throttle extremes, with at least three
azimuthal high-frequency transducers. Requirement: $\alpha_d \ge 57.6$ s⁻¹, i.e.
$t_{10} \le 40$ ms, at every corner, over repeated pulses.

**If it fails.** Fit the baffle (5 compartments, blades already provisioned),
accept the $\eta_{c^*}$ hit, and re-rate. If *that* fails, the problem is not the
1T and the diagnosis was wrong — go back to the frequency-versus-operating-point
data and look for a mode that tracks something other than $\sqrt{T_c}$.

### Rubric

| element | marks |
|---|---|
| Computes $c$ and the baseline mode set correctly (1T ≈ 1629 Hz) | 15 |
| Converts both the requirement and the achieved performance to damping rates and states the shortfall as a ratio | 15 |
| Estimates the combustion response peak and locates the 1T relative to it | 10 |
| Computes option D's new $f_{1T}$ and rejects D **because it moves the mode the wrong way** | 15 |
| Computes the baffled frequency for option A and the cavity depth for option B | 15 |
| Argues option C's effect on $\tau$ in both directions and identifies it as unquantifiable pre-test | 10 |
| Makes a single clear recommendation with schedule and $\eta_{c^*}$ accounting against the stated constraints | 10 |
| Specifies a confirming test **with pulses at the off-nominal corners**, not just nominal | 5 |
| Carries a fallback | 5 |

**What loses marks:** recommending D on schedule grounds without computing that
it moves the mode the wrong way (this is the discriminating item); recommending
C because "smaller elements are more stable" without noticing that this engine's
mode is *above* its response peak; quoting a $t_{10}$ requirement without
converting it to a damping rate; proposing any fix without a confirming pulse
test; and proposing to fix a 1T mode by raising injector $\Delta p$.

---

## K4. Common wrong answers

**Using the first zero of $J_1$ (3.8317) for the 1T mode.** The most common
single error in this material. 1T requires $J_1'(\alpha) = 0 \Rightarrow \alpha =
1.8412$; 3.8317 is the first zero of $J_1$ itself, which is the eigenvalue for
the first *radial* mode ($J_0' = -J_1$). Getting these backwards moves every
answer by a factor of 2.08 and, worse, mislabels the mode — which changes the
recommended fix.

**Treating $\Delta p_{inj}$ as a universal stability knob.** Students who have
absorbed Module 07 apply the chug criterion to a 3 kHz screech. The lumped model
behind Eq. 3.6 is only valid when the acoustic wavelength greatly exceeds the
chamber — it has no acoustics in it at all. Reveals that the student has learned
a formula without its domain of validity.

**Believing the $n$–$\tau$ model predicts amplitude.** It is a linear theory: it
gives a growth rate, not a limit cycle, and $n$ and $\tau$ were fitted to data
from a similar engine. A student who says "the model shows the engine will
oscillate at 12 %" has misunderstood what linear stability analysis produces.

**Assuming the acoustic cavity runs at chamber temperature.** Produces cavities
1.5–2× too deep and a resonator tuned an octave away from the mode. The cavity is
purged, and its gas temperature — which is uncertain — is the dominant design
input. This error also appears in reverse: assuming the purge holds the cavity at
the purge gas temperature, ignoring the hot gas that enters through the aperture
every cycle.

**Concluding stability from a smooth static $p_c$ trace.** A 25 % peak-to-peak
2 kHz oscillation appears as a couple of percent of ripple on a low-passed static
transducer. The student who "checks the chamber pressure trace" and declares
victory has reproduced a mistake that has cost real hardware.

**Assuming bigger is safer.** Intuition from structures — bigger means stiffer,
stronger, more forgiving — is exactly wrong here. $f_{1T} \propto 1/D_c$, so
bigger chambers have lower modes, closer to the combustion response peak, with a
lower surface-to-volume ratio and therefore less boundary-layer damping.

**Confusing driving with amount of heat release.** "The engine is unstable
because it is burning too fast / too hot / too rich." The Rayleigh criterion is
about *phase*, and unstable engines frequently show higher $c^*$ efficiency than
stable ones. A student who reaches for a mixture-ratio change as a first fix has
not internalised the criterion.

**Getting the causality backwards on hardware damage (R5).** Assuming an
instability burned the baffle blade, when the sequence was blade failure →
compartment merge → mode reappears. The tell is the timeline: 90 s of stable
running with 1.5 % amplitude.

**Reporting a recovery time without converting to a damping rate.** The
specification is in milliseconds and the analysis is in s⁻¹; students who never
connect the two cannot compare a computed decay rate with a test requirement, and
that connection (Eq. 3.15) is the single most practically useful line in the
module.

**Treating "the pintle is inherently stable" as a law.** It is a well-supported
empirical observation about *high-frequency transverse* modes, from a vendor
with a long service record. Pintle engines still chug, particularly when
throttled, and the LMDE's variable-area pintle exists precisely because of that.
