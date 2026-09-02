# Module 06 — Combustion Chambers — Answer Key

Companion to [`06-combustion-chambers.md`](06-combustion-chambers.md). Contains
sections K1–K4 only. Every number here was recomputed with
`tools/rocket.py`; the registered cases are in `tools/examples/06.py`.

Constants: $g_0 = 9.80665$ m/s², $R_u = 8314.46$ J/(kmol·K),
$\Gamma(1.20) = 0.648531$, $\Gamma^2(1.20) = 0.420593$,
$\Gamma(1.21) = 0.645963$, $\Gamma(1.16) = 0.656189$.

---

## K1. Problem solutions

### Conceptual

**C1.** *Residence time independent of $p_c$; why high-$p_c$ engines still use smaller $L^*$.*

Raising chamber pressure at fixed thrust and fixed $L^*$ does two things that
cancel exactly. It shrinks the throat ($A_t = F/(C_F p_c)$) and therefore the
chamber volume ($V_c = L^* A_t$), so there is less room for gas. But it raises
the chamber gas density in direct proportion ($\rho_c = p_c/RT_c$), so the *mass*
of gas resident in that smaller volume is unchanged relative to the mass flow.
Residence time is inventory over throughput; both scale as $p_c^{0}$ once you
divide. Algebraically this is Eq. 3.5, $t_s = L^*/(\Gamma^2 c^*)$, in which $p_c$
does not appear.

High-$p_c$ engines nevertheless use smaller $L^*$ because the *requirement* on
$t_s$ has fallen, not because $t_s$ has changed. The demand side of Eq. 3.1 is
$t_v + t_{mix}$, and both shorten with pressure: the evaporation constant rises
with gas density and pressure, and above the fuel's critical pressure the
droplet stops existing altogether and "vaporization" becomes turbulent mixing of
a dense fluid, which is far faster. A designer who keeps the 1960s $L^*$ at
250 bar is carrying volume, mass and cooled area they no longer need.

*Full marks require both halves.* An answer that only says "$p_c$ cancels" has
answered half the question.

**C2.** *$\varepsilon_c = 1.6$ versus $3.0$ at fixed $L^*$.*

| quantity | $\varepsilon_c = 1.6$ | $\varepsilon_c = 3.0$ | better |
|---|---|---|---|
| Barrel-exit Mach | ~0.40 | ~0.20 | 3.0 |
| Rayleigh stagnation loss | 7.7 % | 2.3 % | **3.0** |
| Barrel diameter (∝ $\sqrt{\varepsilon_c}$) | 1.0× | 1.37× | 1.6 |
| Cooled barrel area (∝ $\varepsilon_c^{-1/2}$ at fixed $V_c$ … see below) | smaller | larger | 1.6 |
| Barrel heat flux (Bartz $(A_t/A)^{0.9}$) | 0.65 rel. | 0.38 rel. | 3.0 |
| $f_{1T}$ (∝ $1/D_c$) | higher | 27 % lower | depends |
| Barrel mass | lower | higher | 1.6 |
| Injector face area available | smaller | larger | 3.0 |

On the cooled-area point: at fixed $V_c$, $L_{cyl} \propto 1/\varepsilon_c$ and
$D_c \propto \sqrt{\varepsilon_c}$, so lateral area $\propto D_c L_{cyl} \propto
\varepsilon_c^{-1/2}$ — the fatter chamber has *less* barrel surface, though the
larger diameter also means a larger injector face and dome to cool and a heavier
structure.

**Recommendation for a sea-level booster: $\varepsilon_c \approx 2.0$–$2.5$.**
The Rayleigh loss is the decisive term — 7.7 % of $p_{c,\mathrm{ns}}$ is 7.7 %
of thrust, which no amount of mass saving repays — but going all the way to 3.0
buys only another 1 % of pressure for a 37 % larger diameter, a heavier chamber
and an 18 % lower $f_{1T}$. The knee of the curve is around 2.0–2.5, and that is
where nearly every large engine sits.

**C3.** *Why H₂O₂/RP-1 needs the largest $L^*$.*

Hydrogen peroxide is not an oxidizer until it has decomposed. The chamber must
first drive $\mathrm{H_2O_2 \to H_2O + \tfrac12 O_2}$ — thermally, or over a
catalyst bed — before there is any free oxygen to react with the kerosene, and
only then can the normal atomize–vaporize–mix–react chain begin. The
decomposition length is real chamber volume that produces no thrust-relevant
heat release beyond the modest decomposition enthalpy.

It shows up in $L^*$ rather than elsewhere because $L^*$ is a *residence-time*
parameter and residence time is exactly what the extra step consumes. There is
nowhere else in the classical design vocabulary to put it: it is not an injector
parameter (the injector's job is unchanged), not a nozzle parameter, and not a
mixture-ratio parameter. The tabulated 1.52–1.78 m explicitly includes the
catalyst-bed or decomposition entrance length, which the source tables note.

**C4.** *$\eta_{c^*} = 1.03$.*

**Most likely:** chamber pressure was measured at the injector end and used
directly in $c^* = p_c A_t/\dot m$ without correcting to the nozzle stagnation
station. For typical contraction ratios that inflates $c^*$ by 2–8 %, and 3 % is
squarely in that band. The dome tap is the easiest and most robust place to put a
transducer, so this is the default error.

**Other candidates:**
1. **Throat area is wrong** — the hot, pressurised throat is larger than the cold
   drawing dimension by thermal expansion (a percent or so), and larger still if
   it has eroded during the run. $c^*\propto A_t$, so a 3 % area error is a 3 %
   $c^*$ error.
2. **Mass flow is under-measured** — a mis-calibrated turbine meter, an
   unaccounted film-cooling or purge flow, or a venturi used outside its
   calibrated range. $c^* \propto 1/\dot m$.
3. (Lower probability) the theoretical $c^*$ was computed at the wrong mixture
   ratio or the wrong chamber pressure, or with frozen rather than equilibrium
   composition.

**The measurement that distinguishes them:** put a second pressure tap at the end
of the barrel, immediately upstream of the convergent section, and compare. If
the two taps differ by the Rayleigh amount predicted from $\varepsilon_c$, the
station is your answer. If they agree and $\eta_{c^*}$ is still above 1.00, do a
pre- and post-test throat CMM and a flow-meter cross-check against tank level
decay.

**C5.** *Heat release downstream of the throat.*

Thrust comes from converting thermal energy into directed kinetic energy, and
that conversion requires the gas to be expanded through a favourable pressure
gradient. Upstream of the throat, energy added to the gas raises the stagnation
enthalpy and stagnation pressure of a subsonic stream that has the *entire*
nozzle left to expand through, so almost all of it is recoverable as exit
velocity. In the convergent section specifically, the flow is still subsonic and
still upstream of the choke point, so heat added there raises the stagnation
temperature of gas that has not yet been metered — it appears in $c^*$ almost in
full (with a small penalty because the local Mach number is no longer negligible
and the Rayleigh loss applies).

Downstream of the throat the flow is supersonic and the area is *increasing*.
Adding heat to a supersonic stream in a diverging duct *decelerates* it (Rayleigh
flow drives Mach toward 1 from both sides), raises static pressure and
temperature, and destroys stagnation pressure heavily. The added enthalpy is
mostly still thermal at the exit plane, where it leaves as hot gas rather than as
momentum. The energy was paid for in propellant and is not recovered.

**C6.** *V-2's two efficiency penalties.*

**Film cooling (~10 % of fuel):** this fuel is injected along the wall at
essentially zero local mixture ratio. It is counted in $\dot m$ in the
denominator of $c^*$, but it contributes little heat release — some of it burns
in the boundary layer at a very fuel-rich ratio well off the $c^*$ optimum, and
some leaves the throat as unreacted vapour. At 10 % of the fuel and O/F ≈ 1.18,
that is roughly 4.5 % of total flow injected off-ratio, worth perhaps 2 points of
$\eta_{c^*}$ at the module's rule of 0.5–1 % per 1 % of flow.

**Water dilution (25 % of the fuel stream):** this is a different mechanism and,
importantly, **it does not show up in $\eta_{c^*}$ at all.** Water lowers $T_c$
and therefore lowers the *theoretical* $c^*$ against which the engine is
measured. It is a large $I_{sp}$ penalty and a near-zero efficiency penalty. The
question is a trap and noticing that is the point.

The remaining shortfall to 0.94 is the 18-pot injector: pre-mixing pots produce
comparatively coarse sprays and an inherently non-uniform mixture-ratio field
across 18 discrete plumes, which is a mixing-limited loss on top of the
vaporization one.

**Which to remove first with a better jacket and nothing else:** the **film
cooling**, because it is a direct $\eta_{c^*}$ recovery of ~2 points and the
better jacket is precisely what makes it removable. Removing the water requires
no jacket improvement at all in principle — but it raises $T_c$ by several
hundred kelvin, which raises wall heat flux by more than the film cooling
removal saved, so removing the water *first* is the wrong order. Doing both at
once requires much more cooling capacity than "a better jacket".

**C7.** *Why contraction ratio is a stability parameter.*

Because $\varepsilon_c$ fixes the barrel diameter, and the barrel diameter fixes
the transverse acoustic mode frequencies:

$$f_{1T} = \frac{1.8412\,a}{\pi D_c}, \qquad D_c = 2\sqrt{\frac{\varepsilon_c A_t}{\pi}} \;\Rightarrow\; f_{1T} \propto \frac{1}{\sqrt{\varepsilon_c}}$$

High-frequency combustion instability is a coupling between the acoustic modes of
the chamber cavity and the combustion process's response to pressure
oscillations. The combustion response has a characteristic frequency band, set
roughly by the inverse of the vaporization and mixing times (order 1–5 kHz).
Choosing $\varepsilon_c$ for pressure-loss and packaging reasons therefore
silently chooses where the chamber's acoustic modes sit relative to that band —
and a mode that lands inside it is a stability problem that no amount of feed
system stiffness will fix.

### Calculation

**N1.** *Upper-stage LOX/LH₂, $F_{vac} = 180$ kN, $p_c = 60$ bar, $\varepsilon = 240$.*

$$R = \frac{8314.46}{13.8} = 602.50\ \mathrm{J/(kg\,K)}$$
$$c^* = \frac{\sqrt{R T_c}}{\Gamma} = \frac{\sqrt{602.50 \times 3450}}{0.648531} = \frac{1441.8}{0.648531} = \mathbf{2223.1\ m/s}$$
$$C_{F,vac}(\gamma=1.20,\ \varepsilon=240) = \mathbf{2.0040}$$
$$A_t = \frac{F}{C_F p_c} = \frac{180\times10^3}{2.0040 \times 60\times10^5} = \mathbf{0.014970\ m^2}, \qquad D_t = 2\sqrt{A_t/\pi} = \mathbf{138.1\ mm}$$
$$\dot m = \frac{p_c A_t}{c^*} = \frac{60\times10^5 \times 0.014970}{2223.1} = \mathbf{40.40\ kg/s}$$

Chamber, $L^* = 0.90$ m, $\varepsilon_c = 2.5$, $\theta_c = 30°$:

$$V_c = 0.90 \times 0.014970 = \mathbf{0.013473\ m^3} = 13.47\ \mathrm{L}$$
$$A_c = 2.5 \times 0.014970 = 0.037426\ \mathrm{m^2}, \qquad D_c = \mathbf{218.3\ mm}$$
$$R_t = 0.069030\ \mathrm{m}$$
$$V_{conv} = \frac{A_t}{3}R_t\cot\theta_c\left(\varepsilon_c^{3/2}-1\right) = \frac{0.014970}{3}(0.069030)(1.73205)(3.95285-1) = 1.762\times10^{-3}\ \mathrm{m^3}$$

(13.1 % of $V_c$ — larger than RE-500's 9.1 %, because a larger $\varepsilon_c$
makes the cone taller and fatter.)

$$L_{cyl} = \frac{0.013473-0.001762}{0.037426} = \mathbf{0.3129\ m}$$
$$h = \frac{0.109147-0.069030}{0.57735} = 0.06948\ \mathrm{m}, \qquad L_{inj\to throat} = \mathbf{0.3824\ m}$$

**Comparison with Vinci.** Ideal $I_{sp,vac} = c^* C_F/g_0 = 2223.1 \times
2.0040/9.80665 = 454.3$ s against Vinci's published **457.2 s**. The published
figure being 0.6 % *above* the ideal computed here is not an efficiency above
unity — it means the assumed CEA-like inputs ($T_c = 3450$ K, $\mathcal{M} = 13.8$,
$\gamma = 1.20$ frozen) are slightly conservative for a 6.1:1 LOX/LH₂ chamber at
60 bar, where equilibrium recombination in the nozzle recovers additional
performance. Thrust (180 kN) and chamber pressure (60 bar) match Vinci exactly
because they were taken from it. The chamber sizing is a plausible reconstruction,
**not** Vinci's actual geometry, which is not published.

*Marking:* an answer that reports $\eta > 1$ without noticing the frozen/
equilibrium issue loses marks for physical judgment, not arithmetic.

**N2.** *Residence time, two ways.*

$$\rho_c = \frac{p_c}{R T_c} = \frac{60\times10^5}{602.50\times3450} = \frac{60\times10^5}{2.0786\times10^6} = 2.8865\ \mathrm{kg/m^3}$$
$$t_s = \frac{\rho_c V_c}{\dot m} = \frac{2.8865 \times 0.013473}{40.404} = \frac{0.038890}{40.404} = 9.626\times10^{-4}\ \mathrm{s} = \mathbf{0.963\ ms}$$
$$t_s = \frac{L^*}{\Gamma^2 c^*} = \frac{0.90}{0.420593 \times 2223.1} = \frac{0.90}{935.0} = \mathbf{0.963\ ms}\ \checkmark$$

**Why shorter than RE-500's 1.52 ms:** the hydrogen engine has both a smaller
$L^*$ (0.90 vs 1.15 m) and a much larger $c^*$ (2223 vs 1799 m/s), and $t_s$ is
inversely proportional to $c^*$ — the same volume is swept out faster by a
lighter, faster gas. It gets away with it because with gaseous hydrogen there is
only one propellant to vaporize.

**N3.** *$\varepsilon_c = 1.8$, $\gamma = 1.21$.*

Subsonic root of Eq. 3.6 at $A/A^* = 1.8$: $\mathrm{Ma} = \mathbf{0.3516}$.

$$\frac{p_2}{p_1} = \frac{1}{1+\gamma \mathrm{Ma}^2} = \frac{1}{1+1.21(0.12361)} = \frac{1}{1.14957} = \mathbf{0.86989} \quad (\textbf{13.01 \% static loss})$$
$$\left(1+\tfrac{0.21}{2}(0.12361)\right)^{1.21/0.21} = (1.012979)^{5.7619} = 1.076889$$
$$\frac{p_{c,\mathrm{ns}}}{p_{c,\mathrm{inj}}} = \frac{1.076889}{1.14957} = \mathbf{0.93699} \quad (\textbf{6.30 \% stagnation loss})$$

**Range for "110 bar, station unstated":**
- If 110 bar is the **injector-end** value: $p_{c,\mathrm{ns}} = 110 \times
  0.93699 = \mathbf{103.1\ bar}$.
- If 110 bar is already the **nozzle stagnation** value: $p_{c,\mathrm{ns}} =
  \mathbf{110.0\ bar}$ (and the injector end is then $110/0.93699 = 117.4$ bar).

So the nozzle stagnation pressure lies somewhere in **103.1–110.0 bar**, a 6.3 %
band. Any thrust or $c^*$ derived from the quoted figure inherits that
uncertainty, which is why the station must be stated.

**N4.** *RE-500 re-optimised at 200 bar.*

$$C_{F,SL}(\gamma=1.20,\ \varepsilon=16,\ p_c=200\ \mathrm{bar}) = \mathbf{1.7160}$$
$$A_t = \frac{500\times10^3}{200\times10^5 \times 1.7160} = \mathbf{0.0145686\ m^2}, \qquad D_t = \mathbf{136.2\ mm}$$

(Against 0.030582 m² and 197.3 mm at 100 bar — the throat area has halved and the
diameter has fallen by 31 %.)

$$V_c = 1.00 \times 0.0145686 = \mathbf{0.0145686\ m^3} = 14.57\ \mathrm{L}$$

(Against 35.17 L — a **59 % reduction**, from halving $A_t$ and cutting $L^*$
from 1.15 to 1.00 m.)

$$A_c = 0.029137\ \mathrm{m^2},\quad D_c = \mathbf{192.6\ mm},\quad R_t = 0.068098\ \mathrm{m}$$
$$V_{conv} = \frac{0.0145686}{3}(0.068098)(1.73205)(1.82843) = 1.0473\times10^{-3}\ \mathrm{m^3}\ (7.19\%)$$
$$L_{cyl} = \frac{0.0145686-0.0010473}{0.029137} = \mathbf{0.4641\ m}, \qquad L_{inj\to throat} = 0.4641+0.0489 = \mathbf{0.5129\ m}$$

**Heat flux:** $q'' \propto p_c^{0.8}$, so $(200/100)^{0.8} = \mathbf{1.741\times}$.

**Barrel pressure-vessel mass:** Eq. 3.11, $m \propto p_c^{-1/2}$, so
$(200/100)^{-1/2} = \mathbf{0.707\times}$ — the barrel gets **29 % lighter**.

**Comment worth making:** the engine got smaller, lighter in the barrel, and 9 %
better in $I_{sp}$ (287.9 → 314.7 s ideal at $\varepsilon=16$), and paid for it
with 74 % more throat heat flux through a smaller throat, roughly double the pump
discharge pressure, and — at 200 bar with a gas-generator cycle — an overboard
dump that would eat most of the gain. This is why 200 bar means staged
combustion.

**N5.** *SMD = 160 μm.*

$$t_v = \frac{d_0^2}{K} = \frac{(160\times10^{-6})^2}{2.7\times10^{-5}} = \frac{2.56\times10^{-8}}{2.7\times10^{-5}} = 9.48\times10^{-4}\ \mathrm{s} = \mathbf{0.948\ ms}$$
$$t_s \ge 3 t_v = 2.844\ \mathrm{ms}$$
$$L^* = t_s\,\Gamma^2 c^* = 2.844\times10^{-3} \times 0.420593 \times 1798.6 = \mathbf{2.15\ m}$$

**Verdict: the injector is not acceptable.** The classical LOX/RP-1 range is
1.02–1.27 m; 2.15 m is 70 % above the top of it and would give a chamber roughly
twice the volume, twice the cooled area, and correspondingly more mass, jacket
pressure drop and (via a larger diameter or a longer barrel) a worse acoustic
environment. No programme would accept that to accommodate a coarse spray. The
correct response is to fix the injector: smaller orifices, higher injection
velocity (higher $\Delta p_{inj}$), or a different element type. A useful figure
to quote back: to fit within $L^* = 1.20$ m you need
$t_v \le 1.20/(3 \times 0.420593 \times 1798.6) = 0.529$ ms, i.e.
$d_0 \le \sqrt{K t_v} = \sqrt{2.7\times10^{-5}\times5.29\times10^{-4}} = 120$ μm.

*Caveat that a strong answer includes:* $K$ carries at least a factor-of-two
uncertainty, so the honest statement is "this injector is marginal to
unacceptable and the $L^*$ sweep will tell you which", not "$L^*$ must be
2.15 m".

**N6.** *$f_{1T}$ for $\varepsilon_c = 2.0$ and $3.0$.*

$$a = \sqrt{\gamma R T_c} = \sqrt{1.20 \times 377.93 \times 3600} = \sqrt{1.63266\times10^6} = \mathbf{1277.8\ m/s}$$

| $\varepsilon_c$ | $D_c$ | $f_{1T} = 1.8412a/(\pi D_c)$ |
|---|---|---|
| 2.0 | 0.27906 m | **2683 Hz** |
| 3.0 | 0.34178 m | **2191 Hz** |

Change: $-18.35$ % (exactly $1/\sqrt{1.5}-1$, as it must be).

**Why the direction matters.** Combustion response is strongest around the
inverse of the propellant preparation time — for this engine
$1/t_v \approx 1/0.37\ \mathrm{ms} \approx 2.7$ kHz for a 100 μm spray. The
$\varepsilon_c = 2.0$ chamber puts $f_{1T}$ at 2683 Hz, essentially *on top of*
that band: the acoustic mode and the combustion response are tuned to each other,
which is the classic recipe for a first-tangential instability. Dropping to
2191 Hz moves the mode off the peak of the response. A stability engineer will
therefore fight for the larger contraction ratio on exactly the grounds that the
performance engineer wants it for (Rayleigh loss) — and against the mass
engineer, who wants neither.

*This is a judgment question. Full marks require noticing that lower is not
automatically safer — it depends on where the combustion response peak sits, and
you have to estimate that.*

**N7.** *$\eta_{c^*}$ with and without the station correction.*

(a) **Naive**, using $p_{c,\mathrm{inj}}$:
$$c^*_{\mathrm{naive}} = \frac{p_{c,\mathrm{inj}} A_t}{\dot m} = \frac{105\times10^5 \times 0.0432}{250} = 1814.4\ \mathrm{m/s}$$
$$\eta_{c^*} = \frac{1814.4}{1810} = \mathbf{1.0024}$$

An efficiency above 1.00 — physically impossible, and the immediate signal that
something is wrong.

(b) **Correct**, with the station correction. At $\varepsilon_c = 2.2$,
$\gamma = 1.20$: $\mathrm{Ma} = 0.28100$, and
$$\frac{p_{c,\mathrm{ns}}}{p_{c,\mathrm{inj}}} = \frac{(1+0.1\times0.078961)^{6}}{1+1.20\times0.078961} = \frac{1.048258}{1.094753} = 0.957588$$
$$p_{c,\mathrm{ns}} = 105 \times 0.957588 = 100.55\ \mathrm{bar}$$
$$c^*_{\mathrm{del}} = \frac{100.547\times10^5 \times 0.0432}{250} = 1737.4\ \mathrm{m/s}, \qquad \eta_{c^*} = \frac{1737.4}{1810} = \mathbf{0.960}$$

(c) **Film-cooling credit.** Film flow is $12/250 = 4.8$ % of total. At
0.75 percentage points of $\eta_{c^*}$ per 1 % of flow, the film cooling is
costing $4.8 \times 0.0075 = 0.036$, so without it the engine would deliver
approximately

$$\eta_{c^*} \approx 0.960 + 0.036 = \mathbf{0.996}$$

**Interpretation.** The engine's combustion device is essentially perfect; all of
the apparent 4 % shortfall is bought deliberately at the wall. Anyone who reads
0.960 as "the injector needs work" has misdiagnosed a design choice as a defect.

*Caveat:* the 0.75 %/% rule is a crude linearisation valid over a few percent of
film flow; 0.996 should be read as "at or near the practical ceiling", not as a
prediction to three decimals.

**N8.** *97 bar to 267 bar, at each engine's sea-level-optimum area ratio.*

Using the LOX/RP-1 model of §3.6 ($\gamma = 1.20$, $c^*_{ideal} = 1798.6$ m/s):

| $p_c$ | SL-optimum $\varepsilon$ | $C_F$ | ideal $I_{sp,SL}$ |
|---|---|---|---|
| 97 bar | 11.48 | 1.6393 | 300.7 s |
| 267 bar | 25.05 | 1.7475 | 320.5 s |

$$\Delta I_{sp} = 320.5 - 300.7 = \mathbf{19.8\ s}, \qquad \frac{\Delta I_{sp}}{I_{sp}} = \mathbf{+6.6\ \%}$$

$$\frac{q''_{267}}{q''_{97}} = \left(\frac{267}{97}\right)^{0.8} = \mathbf{2.248}$$

**The trade expressed as asked:**
$$\frac{19.8\ \mathrm{s}}{2.248 - 1} = \mathbf{15.9\ s\ of\ I_{sp}\ per\ unit\ of\ relative\ heat\ flux}$$

**Is it a good deal?** It depends entirely on whether the cooling architecture can
absorb 2.25× the flux, and that is a step change in kind, not degree: it means
abandoning brazed tube walls for a copper-alloy milled-channel liner, and it
means a staged-combustion cycle because a gas generator cannot supply the pump
work at 267 bar without dumping enough propellant to erase the 19.8 s. For a
first-stage booster where 6.6 % of $I_{sp}$ is a large payload increment and the
vehicle flies often enough to amortise the development, yes. For an engine that
has to be cheap, or that must last 50 flights (where the flux increase attacks
low-cycle fatigue life directly), no — which is precisely the BE-4's stated
reasoning at 140 bar.

*A strong answer notes that the $C_F$ gain is only part of the picture: reduced
dissociation adds perhaps another 1–2 % on $c^*$, while cycle losses subtract
from it, and only a full cycle balance settles the sign.*

### Engineering reasoning

**R1.** *$L^*$ sweep: 0.938 / 0.967 / 0.971.*

**Diagnosis: transitioning from vaporization-limited to mixing-limited, with the
knee at about $L^* \approx 1.05$ m.** The first increment (0.75 → 1.05 m, +0.30 m)
buys 2.9 points of efficiency; the second, equal increment (1.05 → 1.35 m) buys
only 0.4 points. That is a saturating curve: below ~1.0 m residence time is
genuinely short and adding volume converts unvaporized liquid into hot gas; above
it, everything that is going to vaporize has vaporized and the remaining
2.9 points of deficit are not a function of chamber length.

**Recommendation for the flight chamber: $L^* \approx 1.10$ m.** Take the knee
plus a small margin for cold-start, off-nominal mixture ratio and injector
element wear — but do not take 1.35 m, which costs volume, cooled area, mass and
a lower $f_{1T}$ for 0.4 points.

**To reach 0.985 you must change the injector, not the chamber.** The residual
deficit is mixing-limited: a distribution of local mixture ratios across the face,
and $c^*(\mathrm{MR})$ being concave means any spread costs. Concretely:
increase element density (more, smaller elements), raise $\Delta p_{inj}$ to
raise injection velocity and improve atomization and momentum exchange, retune
the oxidizer/fuel momentum ratio, and check for a coarse outer row or a
fuel-rich barrier that is being counted as a mixing loss when it is really a
deliberate one. Also verify there is no film cooling in the flow accounting —
0.971 with 3 % film flow is a *very* different engine from 0.971 without.

**R2.** *267 bar versus 254 bar for the same engine.*

**Most likely explanation: the two figures are the same engine measured at two
different stations.** 254/267 = 0.9513, i.e. a 4.87 % stagnation pressure
difference, which is exactly the Rayleigh loss (Eq. 3.9) of a chamber whose
barrel-exit Mach number is 0.304 — corresponding to a contraction ratio of
**$\varepsilon_c \approx 2.05$**, an entirely ordinary value for a large engine.
The manufacturer's 267 bar is then the injector-end figure and the Western
summary's 254 bar the nozzle stagnation figure, or vice versa depending on each
source's convention.

This is exactly the systematic that [_verify-liquid §18] flags: American
Apollo-era practice quotes injector-end pressure, Soviet and Russian practice
quotes nozzle stagnation pressure, and cross-tradition comparisons inherit the
gap. It is the same mechanism behind the F-1's 965 / 982 / 1,015 / 1,125 psia
spread.

**Competing explanations to acknowledge:** the two figures could be different
throttle settings or power levels (the RS-25 is quoted at 100 %, 104.5 % and
109 % and the numbers differ by more than this), or different engine blocks, or
one could simply be a unit-conversion rounding.

**The single piece of information that settles it: the location of the pressure
tap** — stated explicitly, or inferred from a test schematic. Failing that, the
contraction ratio, since it lets you predict the gap and check whether 4.87 % is
consistent.

**R3.** *Coolant outlet $+40$ K, $c^*$ down 1.2 %, $p_c$ and $\dot m$ constant.*

Mechanism order:

1. **Something is putting more heat into the coolant than the design predicted,
   in a growing way.** A steady 200 s rise, not a step, means a progressive
   geometry or surface change, not a sudden event.
2. **The most probable cause is throat erosion or wall recession.** As the throat
   opens, $A_t$ grows. At constant $\dot m$ and constant $p_c$, $c^* = p_c
   A_t/\dot m$ would *rise*, not fall — so if $p_c$ is genuinely being held
   constant by the control system while $c^*$ falls, the $A_t$ growth is being
   compensated by a real combustion or pressure loss. Watch this carefully: the
   internally consistent reading is that $A_t$ has grown, the engine has
   back-pressured less, and the control system has opened valves to hold $p_c$,
   masking the change.
3. **The concurrent 1.2 % $c^*$ drop points at the wall, not the injector.** A
   growing hot streak or a locally failing film-cooling barrier increases the
   fraction of propellant burning at an off-optimum wall mixture ratio and
   increases heat lost to the coolant. Both effects appear together: more heat
   into the coolant (the +40 K), less energy into the gas (the −1.2 % $c^*$).
   That co-movement is the diagnostic signature.
4. **A less likely alternative** is coolant-side channel degradation — deposit
   formation (coking, in a hydrocarbon-cooled engine) reducing coolant-side heat
   transfer and driving the wall hotter, which then erodes. Coking would also
   show as a rising coolant $\Delta p$.

**What to inspect first after shutdown, in order:** (i) borescope and CMM the
throat for area growth and local recession; (ii) look for an axial hot streak and
correlate its azimuth with a specific injector element or film-cooling orifice;
(iii) measure coolant jacket $\Delta p$ against pre-test and look for channel
bulge or blockage; (iv) pull the injector and check for a plugged, eroded or
misdrilled orifice in that azimuth.

**R4.** *RL10 at 32.8 bar versus RS-25 at 206.4 bar.*

**The difference is entirely the cycle, and in the RL10's case the chamber
designer has essentially no freedom at all.**

The RL10 is a **closed expander**: the only energy source driving the turbopump
is heat picked up by hydrogen flowing through the chamber cooling jacket. The
turbine power available is therefore set by $Q = \int h_g (T_{aw}-T_{wg})\,dA$
over the cooled surface — it scales with **surface area**. The pump work
required scales with $\dot m \Delta p/\rho \propto A_t p_c$. Since $q'' \propto
p_c^{0.8}$ but the required pump work $\propto p_c^{1.0}$, and since scaling the
engine up grows $A_t$ and the cooled area at similar rates, the heat balance
closes only below a ceiling in both thrust and chamber pressure. The RL10 sits at
32.8 bar / 73.4 kN; Vinci, the highest-thrust closed expander ever flown, reaches
60 bar / 180 kN and is still bounded by the same balance. **The heat balance picks
$p_c$, not the designer.** The designer's remaining freedom is to *increase* heat
pickup — high-aspect-ratio channels, roughened or ribbed surfaces, longer
chambers, smooth-wall constructions that allow deeper channels — which is the
opposite of the compactness incentive every other engine has.

The RS-25 is **fuel-rich staged combustion**: the turbine is driven by preburner
gas at a pressure the pumps themselves set, so the cycle is not power-limited in
the same way. It can therefore chase $p_c$ up to whatever the materials, the
cooling and the pump discharge pressure will bear — 206.4 bar, ~480 bar pump
discharge, a copper-alloy milled-channel liner. **Here the chamber designer has
real freedom and real consequences**: they choose $p_c$ subject to what the
NARloy-Z liner and the low-cycle fatigue life will accept, and the constraint
that actually binds is heat flux and wall life, not power.

**Same country, same industrial base, factor of six** — because the cycle, not
the technology level, sets the ceiling. This is the single most useful thing to
be able to say about expander cycles in an interview.

**R5.** *Fixing 2 % $\eta_{c^*}$ by raising $L^*$ from 0.95 to 1.30 m.*

**The three questions:**

1. **"Have you run an $L^*$ sweep, and what is the slope?"** If $\eta_{c^*}$ is
   flat with respect to $L^*$ over the current range, the deficit is
   mixing-limited and 0.35 m of extra chamber buys nothing at all. This is the
   only question that actually decides the issue, and it must be answered with
   hardware, not CFD alone.
2. **"How much of the 2 % is film cooling, and is it in the flow accounting?"**
   If the engine dumps 2–3 % of flow at the wall, most or all of the "shortfall"
   is a design choice already made and correctly priced. Chasing it with chamber
   volume is chasing a number that is not a defect.
3. **"What is the spray SMD, and what does the vaporization estimate say?"** At
   LOX/methane conditions, run WE3's arithmetic: if $t_s/t_v$ is already above
   ~4 at $L^* = 0.95$ m, vaporization is not the limiter and lengthening the
   chamber is treating the wrong variable.

**And I would ask what it costs**, which is not a diagnostic question but a
decision one: +37 % $V_c$ means roughly +37 % cooled barrel area, a
correspondingly larger jacket pressure drop and coolant flow, added mass, a lower
$f_{1T}$ (if the diameter grows) or a longer barrel (if it does not), and — on a
methalox engine — more residence time for coking in the cooling channels.

**Data that would make me reject it outright:** a flat $\eta_{c^*}$-versus-$L^*$
curve; a measured SMD comfortably inside the vaporization budget; or evidence
that the deficit is a mixture-ratio maldistribution (for instance, a
circumferential $c^*$ or wall-temperature variation, or a difference between
measured and CEA-predicted exhaust composition). Any of the three says the
problem is on the injector face and the chamber is a bystander.

---

## K2. Quiz answers

**Q1 (8) — (c) chamber volume divided by throat area.**

- (a) wrong: that is $L_{cyl}$, which for a typical $\varepsilon_c = 2$ chamber is
  roughly half of $L^*$.
- (b) wrong: that is the total chamber length, also about half of $L^*$ for
  $\varepsilon_c = 2$.
- (d) wrong: $V_c/A_c = L^*/\varepsilon_c$ — this is very nearly the physical
  chamber length, which is the confusion the question is testing.

**Q2 (8) — 1.49 ms.**

$$t_s = \frac{L^*}{\Gamma^2 c^*} = \frac{1.10}{0.420593 \times 1750} = \frac{1.10}{736.04} = 1.4945\times10^{-3}\ \mathrm{s} = \mathbf{1.49\ ms}$$

Sanity: inside the universal 0.7–2.5 ms band. Full marks require $\Gamma^2$, not
$\Gamma$; using $\Gamma$ gives 0.97 ms and is the standard error.

**Q3 (10) — 99.6 bar.**

Step 1, barrel-exit Mach from the subsonic root of Eq. 3.6 at
$\varepsilon_c = 2.0$, $\gamma = 1.20$: $\mathrm{Ma} = 0.31224$.

Step 2, Eq. 3.9:
$$\frac{p_{c,\mathrm{ns}}}{p_{c,\mathrm{inj}}} = \frac{(1+0.1\times0.097494)^{6}}{1+1.20\times0.097494} = \frac{1.059226}{1.116993} = 0.948924$$
$$p_{c,\mathrm{ns}} = 105.0 \times 0.948924 = \mathbf{99.64\ bar}$$

The 5.1 % drop is the number to remember for $\varepsilon_c = 2$.

**Q4 (8) — (c) mean gas residence time.**

- (a) $A_t = F/(C_F p_c)$ roughly halves (it is not exactly a halving because
  $C_F$ also rises slightly).
- (b) $V_c = L^* A_t$ falls with $A_t$.
- (c) **unchanged** — Eq. 3.5, $t_s = L^*/(\Gamma^2 c^*)$, contains no $p_c$.
- (d) $q'' \propto p_c^{0.8}$ rises by $2^{0.8} = 1.74\times$.

**Q5 (12).**

- **Regime: mixing-limited.** Efficiency is flat across a 47 % increase in $L^*$,
  so residence time is not the constraint; the propellant is fully vaporized and
  the loss is mixture-ratio non-uniformity across the injector face (plus a small
  contribution from heat loss to the wall).
- **Fix: change the injector.** More elements of smaller size, higher injection
  velocity via a larger $\Delta p_{inj}$, retuned oxidizer/fuel momentum ratio,
  or an element type with better intrinsic mixing. Do **not** lengthen the
  chamber — the data has already shown it does nothing.
- **Alternative diagnosis to rule out first: a measurement or bookkeeping error,
  specifically the pressure station.** If $p_c$ is being taken at the injector
  end, the *true* $\eta_{c^*}$ is 2–8 % lower than 0.955 and the engine is worse
  than reported, not better; if the film-cooling flow (stated absent here, but
  verify it) or a purge flow is unaccounted, $\dot m$ is wrong. Confirm $A_t$
  hot-and-eroded versus cold, too. Diagnose the instrument before the hardware.

*Marking: 4 points regime, 4 fix, 4 alternative. An answer that says "mixing" but
prescribes a longer chamber gets 4 of 12.*

**Q6 (10) — GOX/GH₂ < N₂O₄/MMH < LOX/RP-1 < H₂O₂/RP-1.**

| rank | combination | $L^*$ (m) | reason |
|---|---|---|---|
| 1 | GOX/GH₂ | 0.56–0.66 | both propellants already gaseous — no atomization, no vaporization, mixing only |
| 2 | N₂O₄/MMH | 0.60–0.89 | liquid–liquid, but hypergolic (zero ignition delay contribution) and both components are volatile |
| 3 | LOX/RP-1 | 1.02–1.27 | kerosene is a heavy, multi-component, low-volatility fuel — the slowest common propellant to vaporize |
| 4 | H₂O₂/RP-1 | 1.52–1.78 | the peroxide must decompose before there is any oxidizer at all, and that decomposition length is inside the quoted $L^*$ |

**The ordering is a vaporization ordering, not a chemistry ordering.** Reaction
rates at 3000 K are microseconds for all four; what differs is how long it takes
to present the reactants to each other in the gas phase.

**Q7 (12).**

$$\frac{q''_{RS-25}}{q''_{F-1}} = \left(\frac{206.4}{70}\right)^{0.8} = (2.9486)^{0.8} = \mathbf{2.38}$$

- **F-1: brazed nickel-alloy tube wall**, 178 individually formed Inconel
  X-750/Hastelloy tubes, fuel-cooled, brazed into an Inconel jacket with steel
  bands.
- **RS-25: milled-channel copper-alloy liner**, 390 channels machined into a
  **NARloy-Z** (Cu–Ag–Zr) main-combustion-chamber liner with an
  electroformed-nickel closeout; the nozzle separately is a 1,080-tube brazed
  wall.

**Why the F-1's architecture cannot be used at 206 bar.** Two reasons, both
material and both decisive. First, thermal conductivity: nickel alloys run
10–25 W/(m·K) against NARloy-Z's 300–350 W/(m·K), so for the same wall thickness
and the same heat flux the nickel wall sustains an order of magnitude greater
temperature drop — at 2.38× the flux the hot-gas face would exceed the alloy's
usable temperature. Second, geometry: a tube wall's minimum wall thickness and
tube diameter are set by what can be formed and brazed, whereas milled channels
can be made narrow, deep and thin-walled exactly where the flux peaks, giving
much higher coolant-side velocity and heat-transfer coefficient at the throat.
The tube wall is the right answer for a big, low-$p_c$ chamber (it scales to the
F-1's near-metre throat); it is the wrong answer for a small, high-flux one.

*Marking: 4 for the ratio, 4 for naming both architectures correctly, 4 for the
conductivity-plus-geometry argument.*

**Q8 (12).**

$$A_t = \frac{F}{C_F p_c} = \frac{3.000\times10^6}{1.69 \times 150\times10^5} = \mathbf{0.11834\ m^2}$$
$$D_t = 2\sqrt{A_t/\pi} = 2\sqrt{0.037668} = \mathbf{0.3882\ m}$$
$$A_c = 1.9 \times 0.11834 = 0.22485\ \mathrm{m^2}, \qquad D_c = 2\sqrt{0.071570} = \mathbf{0.5351\ m}$$

Barrel-exit Mach, subsonic root at $A/A^* = 1.9$, $\gamma = 1.21$:
$\mathrm{Ma} = \mathbf{0.33047}$.

$$\frac{p_{c,\mathrm{ns}}}{p_{c,\mathrm{inj}}} = \frac{\left(1+0.105\times0.109211\right)^{5.7619}}{1+1.21\times0.109211} = \frac{1.068133}{1.132146} = 0.943256$$

**Stagnation pressure loss = 5.67 %.**

Sanity: a 3 MN engine with a 388 mm throat and a 535 mm barrel — the right size
for an RD-180-class chamber, which is reassuring since the RD-180 makes 3.83 MN
from two of them.

**Q9 (10).**

No — or at best it is half an argument stated as a whole one. Large $L^*$ affects
two distinct low-frequency instabilities and it makes **both worse**, not better.
**Chug**, the feed-system-coupled mode, uses the chamber volume as the
capacitance in the oscillator: a larger volume lowers the frequency and reduces
the damping the injector pressure drop provides, so large $L^*$ is
*destabilising* for chug, and the real fix is a larger $\Delta p_{inj}$.
**$L^*$ instability**, a separate low-frequency mode driven by coupling between
chamber volume and the vaporization rate rather than by the feed system, is by
name and by observation a large-$L^*$, low-$p_c$ phenomenon and is likewise made
worse. The place where more volume genuinely helps is *high-frequency* acoustic
stability, and even there it helps only indirectly and ambiguously, by moving
$f_{1T}$ down — which is beneficial only if it moves the mode away from the
combustion response band rather than into it.

*Full marks require naming both low-frequency modes and stating the direction for
each. An answer that says "no, use baffles" without the mechanism gets 4 of 10.*

**Q10 (10).**

The Russian-origin datasheet is almost certainly quoting **nozzle stagnation
pressure**, the standard Soviet and Russian convention, while the Western
comparison table is quoting or has converted to **injector-end pressure**, the
American Apollo-era convention. The 4 % gap is exactly the Rayleigh
heat-addition loss (Eq. 3.9) for a chamber with a barrel-exit Mach number near
0.27, i.e. a contraction ratio around 2.3 — an entirely ordinary value — so the
two figures are consistent with being the same engine measured at two stations
[_verify-liquid §18].

**What I would quote:** the manufacturer's figure, explicitly labelled
*"nozzle stagnation, per the manufacturer"*, with a footnote that the Western
figure of +4 % is consistent with the injector-end station and that comparisons
against engines of other national origin should not be read to better than about
5 % unless the station is stated for both.

---

## K3. Trade-study reference solution (T1)

### The numbers

Modelled as LOX/CH₄ at O/F ≈ 3.6 ($\gamma = 1.16$, $\mathcal{M} = 20.5$ kg/kmol,
$T_c = 3550$ K, ideal $c^* = 1873$ m/s), 2,000 kN sea-level thrust, each option
at approximately its sea-level-optimum area ratio, with a delivered efficiency
factor $\eta_{c^*}\eta_{C_F} = 0.97$:

| | A: 100 bar | B: 140 bar | C: 210 bar | D: 300 bar |
|---|---|---|---|---|
| Assumed $\varepsilon$ | 16 | 21 | 27 | 34 |
| $C_{F,SL}$ | 1.667 | 1.709 | 1.759 | 1.798 |
| Ideal $I_{sp,SL}$ | 318.4 s | 326.5 s | 335.9 s | 343.5 s |
| **Delivered $I_{sp,SL}$ (×0.97)** | **308.8 s** | **316.7 s** | **325.8 s** | **333.2 s** |
| Meets the 320 s floor? | **no** | **no** (−3.3 s) | yes (+5.8 s) | yes (+13.2 s) |
| $A_t$ | 0.1200 m² | 0.0836 m² | 0.0542 m² | 0.0371 m² |
| $D_t$ | 0.391 m | 0.326 m | 0.263 m | 0.217 m |
| Nozzle exit $D_e$ | 1.563 m | 1.495 m | 1.364 m | 1.267 m |
| Relative throat $q''$ ($p_c^{0.8}$) | 1.00 | 1.31 | 1.81 | 2.41 |
| $p_e/p_a$ at SL (separation check) | 0.76 | 0.75 | 0.83 | 0.89 |
| Cycle | GG | ORSC | ORSC/FFSC | FFSC |

**Packaging.** Seven engines on a 7 m base: a hexagonal pattern (one centre, six
around) needs the outer engines' exit planes to fit within the base, which allows
an exit diameter of roughly $7/3 = 2.33$ m before gimbal clearance. Every option
clears it comfortably. **Packaging is not the discriminator here** — a candidate
who declares option A "too big to fit" has not done the arithmetic.

**Separation.** All four have $p_e/p_a$ well above the Summerfield threshold of
~0.4, so none separates at sea level and the area ratios are all flyable.
**Separation is not the discriminator either.**

### The actual discriminators

1. **The 320 s payload closure eliminates A and B on the stated numbers.**
   B misses by 3.3 s.
2. **The 50-flight life requirement pushes hard against C and D.** Low-cycle
   fatigue life of the hot-gas wall is driven by the through-wall $\Delta T$,
   which tracks $q''$. Option C runs 1.81× and option D 2.41× option A's throat
   flux. This is the requirement that is genuinely in tension with the
   performance requirement, and a good answer says so explicitly.
3. **"Never flown staged combustion" plus "first flight in five years" is a
   schedule risk, not a technical one, and it is the largest risk in the
   problem.** The BE-4 — an ORSC methalox engine at 140 bar developed by an
   organisation with substantial resources — ran roughly five years late and
   delayed two launch vehicles. Assuming a first ORSC (option C) or a first FFSC
   (option D, which only one organisation has ever flown, and whose published
   parameters are unverified company claims) will be ready in five years is
   optimistic to the point of being a programme-level bet.

### Two defensible recommendations

**Recommendation 1 — Option C (210 bar, ORSC), with life mitigation.** Take the
only option that meets the stated payload requirement with margin and is not the
first-of-kind FFSC. Budget explicitly for the life problem: a GRCop-class
copper-alloy liner, generous barrier/film cooling accepting ~1 point of
$\eta_{c^*}$ (which the +5.8 s of margin can absorb), and a life-demonstration
test campaign starting in year two rather than year four. Accept that five years
for a first ORSC is aggressive and carry a schedule reserve or a fallback.

**Recommendation 2 — Option B (140 bar, ORSC), and renegotiate the 320 s
requirement.** The shortfall is 3.3 s, or 1 %, which is *inside the uncertainty
of the 0.97 efficiency factor used to generate the table.* Before committing a
first-time staged-combustion team to 210 bar, establish whether 320 s is a hard
payload closure or a padded requirement, and whether 3.3 s can be recovered at
the stage level — a slightly higher mixture ratio, a lighter structure, a
marginally larger nozzle at the cost of some sea-level performance. Option B has
a direct precedent at exactly this pressure and cycle (BE-4), 1.31× the reference
heat flux, and by far the best chance of 50 flights.

**Both are defensible. What is not defensible** is option D on the grounds that
"Raptor does it": every Raptor figure is an unverified company claim
[_verify-liquid §4], no organisation has developed an FFSC engine in five years,
and the marginal 7.4 s over option C costs another 33 % of throat heat flux
against a 50-flight requirement.

### Rubric

**A strong answer contains:**
- A quantitative $I_{sp}$ estimate for all four options, with the method stated
  (which $\gamma$, which $\mathcal{M}$, which efficiency factor) — 20 %.
- Relative heat flux via $p_c^{0.8}$ for all four — 10 %.
- An explicit statement that **low-cycle fatigue of the hot-gas wall, driven by
  through-wall $\Delta T$ and hence by $q''$, is what the 50-flight requirement
  actually constrains** — 15 %. Saying "reuse means lower pressure" without the
  mechanism is worth half.
- The packaging calculation, correctly concluding it is *not* binding — 10 %.
  (Credit for doing the arithmetic and reporting a negative result.)
- Identification of the cycle/schedule risk as the dominant programme risk,
  with the BE-4 precedent or equivalent — 15 %.
- A single clear recommendation with the trade stated in both directions — 15 %.
- A statement of what would change the recommendation — 10 %.
- Correct epistemic handling of the Raptor comparison if invoked — 5 %.

**Loses marks for:**
- Picking D because it has the highest $I_{sp}$, with no life or schedule
  analysis. (Caps the answer at ~40 %.)
- Quoting Raptor's 300 bar as an established engineering fact.
- Claiming a separation or packaging constraint without computing it.
- Treating the 320 s requirement as unquestionable *and* treating the five-year
  schedule as unquestionable, which makes the problem unsolvable — a good
  engineer notices when a requirement set is over-constrained and says so.
- Any $I_{sp}$ figure quoted without stating sea level or vacuum.

---

## K4. Common wrong answers and what they reveal

**Using $\Gamma$ instead of $\Gamma^2$ in Eq. 3.5.** Gives 0.97 ms instead of
1.49 ms in Q2 — a factor of 1.54. The student has memorised the formula rather
than derived it; anyone who has done the substitution $R T_c = \Gamma^2 c^{*2}$
cannot make this error.

**Treating $L^*$ as the physical chamber length.** Produces chambers twice as
long as they should be and, in sizing problems, a $V_c$ that is $\varepsilon_c$
times too large. The tell is a "chamber length" answer that equals the given
$L^*$ exactly. It reveals that the student has not internalised that $L^*$
normalises by *throat* area while the chamber has *chamber* area.

**Forgetting the convergent section in $V_c$.** Gives a barrel 8–13 % too long.
Not catastrophic, but it is a bookkeeping error that propagates into mass and
heat-load estimates, and reviewers notice it because the number is always long by
about a tenth.

**Reporting $\eta_{c^*} > 1$ without comment.** The single most revealing error
in this module. It means the student computed a number and did not ask whether it
was physically possible. Efficiency above unity is always a measurement or
station problem, and an engineer who does not stop at that boundary will not stop
at any other.

**Confusing the static and stagnation Rayleigh losses.** The static loss is
roughly twice the stagnation loss at these Mach numbers (4.6 % versus 2.3 % at
$\mathrm{Ma} = 0.2$). Using the static number overstates the injector-end
correction by a factor of two. The underlying confusion is between what the wall
feels (static) and what the nozzle can expand (stagnation).

**Believing the Rayleigh loss is a bookkeeping artefact rather than a real
loss.** It is a genuine entropy increase; the stagnation pressure is not
recoverable downstream. A student who thinks it is "just a different definition"
will not understand why anyone cares about contraction ratio.

**Prescribing a longer chamber for a mixing-limited engine.** The single most
expensive mistake in this module in real money. It reveals that the student has
learned $L^*$ as *the* combustion parameter rather than as *one* parameter with a
specific regime of validity, and it is why the $L^*$ sweep is worth teaching as a
procedure rather than as an idea.

**Attributing the whole $\eta_{c^*}$ deficit to the injector when film cooling is
present.** Confuses a deliberate design choice with a defect. The corollary error
is more dangerous: "fixing" it by removing film cooling and burning through the
throat.

**Claiming the V-2's water dilution hurt $\eta_{c^*}$.** It hurt $I_{sp}$ badly
and $\eta_{c^*}$ hardly at all, because it lowers the theoretical $c^*$ in the
denominator as much as the delivered $c^*$ in the numerator. This reveals a
student who has not internalised that efficiency is measured against the
*theoretical value for the propellant as actually mixed*.

**Comparing chamber pressures across national traditions to two significant
figures.** "The RD-180 at 267 bar beats the RS-25 at 206 bar by 30 %" is a
sentence that ignores a 2–8 % systematic in each figure, ignores that they burn
different propellants, and ignores that the two engines were designed to
different requirements two decades apart. The habit it reveals — treating
published numbers as exact — is the one this whole course is built to break.

**Quoting Raptor figures as established data.** Every Raptor thrust, chamber
pressure, $I_{sp}$, dry mass and thrust-to-weight number is a company claim, and
[_verify-liquid §4] records that **no independent verification of the chamber
pressure exists at all.** Using 300 or 330 bar as a benchmark without that
attribution is a sourcing failure, and in a design review it is the kind that
destroys credibility on everything else in the presentation.
