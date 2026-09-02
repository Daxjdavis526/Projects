# Module 16 — Structures and Materials
Part II · Prerequisites: modules 10, 11, 12 · Estimated time: 8 h

Every other module in Part II hands you a number and lets you believe it. Module 10
gives you a heat flux, Module 11 gives you a wall temperature, Module 12 gives you a
pump discharge pressure. This module is where those numbers meet a piece of metal that
has a finite yield strength, a finite thermal conductivity, a finite number of cycles in
it, and a specific chemical relationship with whatever is flowing past it. The
uncomfortable truth of engine design is that the material almost always decides the
architecture, not the other way round: the RS-25 is a 206 bar engine because copper
conducts heat, the RD-180 exists because somebody in Khimki learned to keep steel from
burning in hot oxygen, and the Merlin Vacuum nozzle is niobium because nothing cheaper
survives 1,500 K in a plume while weighing that little. Get the material wrong and you
do not get a performance shortfall — you get a hole, a fire, or a crack that nobody
finds until the fourth flight. This module is about knowing, before you draw anything,
which of those three you are risking.

---

## 1. Learning objectives

After this module you should be able to:

1. Enumerate the load and environment set acting on each major engine component —
   pressure, through-thickness thermal gradient, thermal cycling, vibration and
   acoustics, hydrogen, oxygen, cryogenic temperature, oxidizer-rich hot gas — and say
   which one sizes which part.
2. Define yield and ultimate strength, elongation, modulus, creep rupture, LCF and HCF
   life, fracture toughness, thermal conductivity, CTE and density, state the SI units
   of each, and say how each varies with temperature for the main engine alloy families.
3. Compute the through-thickness temperature drop and the constrained thermal stress in
   a cooled liner, show that it exceeds the hot yield strength, and explain why liner
   life is therefore a strain-controlled (low-cycle fatigue) problem, not a
   stress-controlled one.
4. Estimate low-cycle fatigue life from a stated strain range using the
   Manson–Coffin–Basquin relation, and apply the standard design factor on cycles.
5. Use a Larson–Miller parameter to convert a creep-rupture requirement into an allowable
   wall temperature, and state why the answer is an upper bound rather than a permission.
6. Select an alloy family for a stated component from a short list, justifying the choice
   on the correct index (thermal-shock figure of merit for a liner, specific strength for
   a housing, hydrogen compatibility for a hydrogen-wetted part, oxygen compatibility for
   an oxidizer-rich part).
7. Explain the mechanism of hydrogen environment embrittlement, name the alloys that are
   susceptible and those that are not, rank Inconel 718 against A-286 and JBK-75, and
   describe the barrier-coating fixes used on the RS-25.
8. Explain why a metal burns in high-pressure oxygen, what governs the ignition
   temperature, and why oxidizer-rich staged combustion is a metallurgy problem before it
   is a thermodynamics problem.
9. State the LOX-compatibility screening logic (mechanical-impact testing, promoted
   ignition, system design guidance) and name the standards that define it.
10. Argue the manufacturability side of a material choice — weldability, printability,
    heat-treat response — and give a case where it overrode a better property set.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Tensile yield strength | $F_{ty}$ | Pa | stress at 0.2 % permanent strain |
| Tensile ultimate strength | $F_{tu}$ | Pa | maximum engineering stress before fracture |
| Elongation | $e$ | — (%) | plastic strain at fracture in a standard gauge length |
| Young's modulus | $E$ | Pa | elastic stress/strain slope |
| Poisson's ratio | $\nu$ | — | transverse contraction per unit axial extension |
| Density | $\rho$ | kg/m³ | mass per unit volume |
| Thermal conductivity | $k$ | W/(m·K) | Fourier proportionality between flux and gradient |
| Coefficient of thermal expansion | $\alpha$ | 1/K | fractional length change per kelvin |
| Specific heat | $c_p$ | J/(kg·K) | heat per unit mass per kelvin |
| Fracture toughness | $K_{Ic}$ | Pa·√m | plane-strain critical stress-intensity factor |
| Stress-intensity factor | $K$ | Pa·√m | crack-tip field amplitude, $K = Y\sigma\sqrt{\pi a}$ |
| Crack length | $a$ | m | surface or through-crack characteristic dimension |
| Stress range, amplitude | $\Delta\sigma$, $\sigma_a$ | Pa | max−min, and half that |
| Total strain range | $\Delta\varepsilon_t$ | — | elastic plus plastic strain excursion per cycle |
| Plastic strain range | $\Delta\varepsilon_p$ | — | plastic part of the above |
| Cycles to failure | $N_f$ | — | cycles (a *reversal* is $2N_f$) |
| Fatigue strength coefficient | $\sigma'_f$ | Pa | Basquin intercept |
| Fatigue strength exponent | $b$ | — | Basquin slope, typically −0.05 to −0.12 |
| Fatigue ductility coefficient | $\varepsilon'_f$ | — | Coffin–Manson intercept |
| Fatigue ductility exponent | $c$ | — | Coffin–Manson slope, typically −0.5 to −0.7 |
| Larson–Miller parameter | $P_{LM}$ | K (×10³ here) | $T(C + \log_{10} t_r)$, creep time–temperature trade |
| Rupture time | $t_r$ | h | time to creep rupture at stated stress and temperature |
| Gas-side wall temperature | $T_{wg}$ | K | hot-face metal temperature |
| Coolant-side wall temperature | $T_{wc}$ | K | cold-face metal temperature |
| Through-wall temperature drop | $\Delta T_w$ | K | $T_{wg} - T_{wc}$ |
| Heat flux | $q''$ | W/m² | heat per unit area through the wall |
| Wall thickness | $t$ | m | liner land thickness between gas and coolant |
| Thermal-shock figure of merit | $M_{ts}$ | W/m | $k F_{ty}(1-\nu)/(E\alpha)$ |
| Notched strength ratio | $NSR$ | — | notched tensile strength in H₂ ÷ same in He |
| Ductile–brittle transition temperature | $DBTT$ | K | temperature below which a BCC alloy fractures by cleavage |

---

## 3. Theory

### 3.1 The load set: what is actually acting on the hardware

A propulsion structure is not a structure that happens to get hot. It is a heat exchanger
that happens to hold pressure, and it is loaded simultaneously by things that a normal
structural analyst never sees together. The complete set, component by component:

**Pressure.** Steady internal pressure in the chamber (20–330 bar), pump housings
(often 1.5–2× chamber pressure — the RS-25 HPFTP discharges near 7,000 psi ≈ 480 bar
against a 206 bar chamber), preburner and gas-generator bodies, manifolds and lines.
Pressure loads are the easy ones: they are steady, they are known, and classical
thin- and thick-wall shell theory handles them. They are also almost never what fails.
Pressure sets the *wall thickness*; everything else in this list sets the *life*.

**Through-thickness thermal gradient.** A regeneratively cooled liner at 80 MW/m² with a
0.9 mm wall carries a 200–250 K drop across less than a millimetre of copper (WE1). If
the wall is restrained in-plane — and it is, by the surrounding cold structure — that
gradient is a stress. [F] It is also the only load in this list that has no equivalent in
airframe or gas-turbine practice at this magnitude.

**Thermal cycling.** Each engine start and shutdown takes the liner from ambient to
$T_{wg}$ and back, and the coolant channel from ambient to 40 K and back. The liner
yields on the way up and yields again on the way down, in the opposite direction. The
number of cycles is small — tens to a few hundred for a reusable engine, one for an
expendable — which places the problem squarely in **low-cycle fatigue**, where life is
governed by strain range and ductility, not by stress amplitude and strength.

**Vibration and acoustics.** Engine-mounted hardware sees random vibration in the tens of
g rms and acoustic overall levels of 160–165 dB near a large booster, over a
20–2,000 Hz band [SMC-S-016], [STD-7001]. Turbomachinery adds narrow-band excitation at
shaft order and at blade-passing frequency: the RS-25 HPFTP at 35,360 rpm has a shaft
order of 589 Hz and blade-passing harmonics into the tens of kilohertz
[_verify-liquid, RS-25 block]. This is **high-cycle fatigue** territory: 10⁷–10⁹ cycles
accumulate in a single 500 s burn, so the design criterion is an endurance limit or a
stress below the crack-growth threshold, not a life count.

**Hydrogen.** Gaseous hydrogen, from cryogenic to 1,000 K, in contact with essentially
every structural surface of a hydrogen engine. It embrittles a specific and unfortunate
list of high-strength alloys (§3.4.1), and its worst effect is near room temperature —
not at 20 K.

**Oxygen.** Liquid oxygen at 90 K, gaseous oxygen at pressure, and in staged-combustion
engines *oxidizer-rich combustion products at 600–800 K and 300–500 bar*. Every metal is
a fuel in that environment; the only question is the ignition threshold (§3.4.2).

**Cryogenic temperature.** 90 K for LOX, 111 K for LCH₄, 20 K for LH₂. Face-centred-cubic
metals (austenitic stainless, aluminium, copper, nickel) get *stronger* and stay ductile.
Body-centred-cubic metals (ferritic and martensitic steels) go brittle (§3.4.5). This
single crystallographic fact removes most of the world's structural steel from the
candidate list.

**Oxidizer-rich hot gas.** The specific and hardest case: an ORSC preburner exhaust is
mostly oxygen at 500–800 K, moving at high velocity, at up to 500 bar, carrying whatever
particulate the system generated. It is simultaneously the most oxidising environment in
the engine and the most erosive.

**And the ones people forget:** start and shutdown transients (the largest thermal shock
in the duty cycle), water hammer on valve closure [SP-8097], differential contraction at
bolted joints during chilldown [SP-8119], gimbal side loads, nozzle separation side loads
during sea-level start [SP-8120], and — for reusable hardware — a corrosive Atlantic
seawater environment between flights.

> **Design consequence [J]:** write the load set down for each component *before*
> selecting a material. Roughly 80 % of propulsion material selections are decided by two
> or three entries from this list, and the entries are different for the liner, the
> jacket, the pump housing, the turbine blade and the nozzle extension. There is no
> "engine material".

### 3.2 The property set, and the equations that consume it

#### 3.2.1 Static strength, and what "allowable" means

$F_{ty}$, $F_{tu}$, $e$, $E$, $\nu$ and $\rho$ are the six numbers everyone quotes. Three
things about them matter more than the numbers:

**They are statistical, not deterministic.** A design allowable is a lower-tolerance-bound
on a population of test results. **A-basis** is the value exceeded by 99 % of the
population with 95 % confidence; **B-basis** is 90 %/95 %. A-basis is required where
failure of a single load path loses the structure; B-basis where load is redistributed.
The source of record for aerospace metals is the **MMPDS Handbook** [MMPDS], which
formally superseded MIL-HDBK-5 at MMPDS-12 (2017) — citing MIL-HDBK-5 for current design
is an error, though it remains the right reference for reading a 1970s stress report.
Typical-value tables (including the ones in §4 of this module) are for orientation and
trade studies only. **You cannot size a flight part from a typical value.** [M]

**They are temperature-dependent, and the derating is not small.** Inconel 718 loses
roughly 10 % of its room-temperature yield by 900 K and then falls off a cliff as the
γ″ (Ni₃Nb) strengthening phase overages. NARloy-Z loses over half its yield between
room temperature and 800 K. Aluminium 2219 is finished by 450 K. Conversely most
FCC alloys *gain* 20–50 % yield strength between 300 K and 90 K, which is why a
cryogenic tank is rarely strength-critical cold and often is warm.

**Design factors sit on top.** NASA-STD-5001 [STD-5001] sets the factors of safety for
spaceflight structure, with separate and higher treatment for pressurised hardware;
ANSI/AIAA S-080A [AIAA-S-080] governs metallic pressure vessels and pressurised
structures and adds damage tolerance and proof-test requirements. Both have been revised;
quoting a factor from memory is the classic way to invalidate a margin calculation —
check the current revision. [M]

#### 3.2.2 Thermal properties and the two derived numbers that matter

Fourier's law across a thin wall, with $q''$ approximately constant through the thickness:

$$\Delta T_w = T_{wg} - T_{wc} = \frac{q''\, t}{k}$$

> **Eq. 3.1** — variables: $\Delta T_w$ [K] through-wall temperature drop, $q''$ [W/m²]
> gas-side heat flux, $t$ [m] wall thickness, $k$ [W/(m·K)] thermal conductivity.
> Meaning: how much temperature difference the wall must carry to pass the flux.
> Assumes: one-dimensional conduction, constant $k$, no internal heat generation, thin
> wall relative to radius. Fails when: the land between channels is comparable in width
> to its thickness (two-dimensional fin effects, 10–30 % errors), when $k$ varies
> strongly across the gradient, or in a coating where contact resistance dominates.
> `rocket.py`: `wall_dT(q, t, k)`.

A wall restrained in-plane against a linear through-thickness gradient develops a
bending-like stress distribution, tensile on the cold face and compressive on the hot face
relative to the mean, with peak magnitude

$$\sigma_{th} = \frac{E\,\alpha\,\Delta T_w}{2\,(1-\nu)}$$

> **Eq. 3.2** — variables: $\sigma_{th}$ [Pa], $E$ [Pa] modulus at the local temperature,
> $\alpha$ [1/K] CTE, $\Delta T_w$ [K] from Eq. 3.1, $\nu$ [—]. Meaning: the in-plane
> stress produced purely by the temperature gradient in a fully restrained flat plate.
> Assumes: full biaxial in-plane restraint, linear gradient, elastic response,
> temperature-independent properties. **Fails, importantly, when the computed stress
> exceeds yield** — which for a copper liner it always does. It is then not a stress at
> all but an *indicator* that the wall is cycling plastically, and you must switch to a
> strain-based life method (§3.2.4). `rocket.py`: `thermal_stress_hoop(E, alpha, dT, nu)`.

Combining Eqs. 3.1 and 3.2 gives the reason copper exists in this business:

$$\sigma_{th} = \frac{E\,\alpha}{2(1-\nu)}\cdot\frac{q'' t}{k}$$

For a fixed flux and thickness, the thermal stress scales as $E\alpha/k$. That group,
inverted and multiplied by a strength, is the **thermal-shock figure of merit**:

$$M_{ts} = \frac{k\,F_{ty}\,(1-\nu)}{E\,\alpha}\qquad [\mathrm{W/m}]$$

> **Eq. 3.3** — variables as above; $M_{ts}$ [W/m] is proportional to the heat flux a
> restrained wall of unit thickness can carry before first yield. Meaning: a single
> number that ranks materials for cooled-wall service. Assumes: yield-limited, elastic
> up to yield, restrained plate. Fails when: the ranking is done at room temperature for
> a wall that runs at 800 K (evaluate it hot), when temperature capability rather than
> thermal stress is the limit (2219 aluminium scores brilliantly and melts at 900 K), or
> when the failure mode is oxidation, blanching or creep rather than yield. [E], [J]

Table of $M_{ts}$ at room temperature and at 800 K, computed from the §4 property tables:

| alloy | $M_{ts}$ at 300 K (kW/m) | $M_{ts}$ at 800 K (kW/m) | comment |
|---|---|---|---|
| CuCrZr | 29.6 | 5.8 | best cold, overages hot — the index lies |
| 2219-T87 aluminium | 19.4 | — | melts long before 800 K |
| GRCop-84 | 19.0 | 12.7 | the point of the alloy: it *keeps* the index hot |
| GRCop-42 | 18.4 | ~12 | slightly better $k$, slightly lower strength |
| NARloy-Z | 14.7 | 7.9 | the RS-25 liner |
| OFHC copper | 9.2 | ~2 | conductivity champion, no strength |
| C-103 niobium | 8.5 | ~7 | irrelevant — it is radiation cooled, no gradient |
| Ti-6Al-4V | 3.7 | — | and it is forbidden in oxygen anyway |
| Inconel 718 | 3.2 | 5.4 | improves hot because $k$ rises |
| A-286 | 1.8 | ~1.5 | |
| Inconel 625 | 1.1 | ~1.3 | |
| 316L stainless | 0.63 | 0.58 | 25× worse than GRCop-84 |
| Haynes 230 | 0.84 | ~1.0 | chosen for oxidation, not for flux |

The blunt version of the same argument: take $q'' = 80$ MW/m² and $t = 0.89$ mm and use
Eq. 3.1. NARloy-Z carries it on a 225 K gradient. Inconel 718 at its hot conductivity
(21 W/(m·K)) would need a 3,360 K gradient — i.e. to hold the same 225 K drop the 718
wall would have to be **0.060 mm** thick, which is a foil, not a structure. There is no
clever design that gets round this. [F] High-flux regenerative cooling *requires* a
high-conductivity liner, and in practice that means a copper alloy.

#### 3.2.3 Creep and the Larson–Miller parameter

Above roughly $0.4\,T_m$ (homologous temperature), metals deform continuously under
constant load. Turbine blades, preburner and gas-generator liners, hot-gas manifolds and
uncooled nozzle extensions all operate there. The engineering description is a
time-to-rupture at a given stress and temperature, and the standard way to collapse the
data is the Larson–Miller parameter:

$$P_{LM} = T\left(C + \log_{10} t_r\right)$$

> **Eq. 3.4** — variables: $T$ [K] absolute temperature, $t_r$ [h] time to rupture, $C$
> [—] a material constant, conventionally 20 for most superalloys. $P_{LM}$ has units of
> K; it is almost always quoted divided by 1,000. Meaning: rupture life at a given stress
> depends on temperature and time only through this combination, so one master curve of
> stress versus $P_{LM}$ replaces a family of stress–time curves. Assumes: a single
> dominant creep mechanism over the fitted range, and $C$ appropriate to the alloy
> (values from 15 to 25 are used; the fitted $C$ and the data must come from the same
> source). **Fails when:** extrapolated far outside the tested range — the classic error
> is to extrapolate an alloy past a microstructural instability, which for Inconel 718 is
> γ″ overaging above about 925 K. The equation cannot know that the alloy has changed.
> [E]

Two ways the parameter is used: forward (given $T$ and required $t_r$, read the allowable
stress off the master curve) and inverse (given a stress and a required life, solve for
the maximum allowable temperature). WE2 does the inverse case for Inconel 718 and
Haynes 230.

#### 3.2.4 Fatigue: the two regimes and the one equation that spans them

**High-cycle fatigue (HCF)** is stress-controlled, elastic, $N_f > 10^5$, and is described
by Basquin's relation between stress amplitude and reversals:

$$\sigma_a = \sigma'_f \,(2N_f)^{b}$$

> **Eq. 3.5** — variables: $\sigma_a$ [Pa] stress amplitude, $\sigma'_f$ [Pa] fatigue
> strength coefficient (roughly $F_{tu}$ for many alloys), $2N_f$ [—] reversals to
> failure, $b$ [—] the Basquin exponent, typically −0.05 to −0.12. Meaning: the elastic
> branch of the life curve. Assumes: fully reversed loading, no mean stress, no
> environment effect, smooth specimen. Fails when: there is a mean stress (use Goodman or
> Morrow), a notch (use $K_f$), or a hydrogen environment (which can remove the endurance
> limit entirely). [E]

**Low-cycle fatigue (LCF)** is strain-controlled, plastic, $N_f < 10^4$, and is described
by Coffin and Manson:

$$\frac{\Delta\varepsilon_p}{2} = \varepsilon'_f\,(2N_f)^{c}$$

> **Eq. 3.6** — variables: $\Delta\varepsilon_p$ [—] plastic strain range, $\varepsilon'_f$
> [—] fatigue ductility coefficient (of the order of the true fracture ductility), $c$
> [—] typically −0.5 to −0.7. Meaning: in the plastic regime, life is bought with
> ductility, not with strength. Assumes: isothermal, stable hysteresis loop, no
> environmental interaction, no creep hold time. Fails when: the cycle has a hold at
> temperature (creep–fatigue interaction shortens life, sometimes by 10×), when the
> temperature varies within the cycle (thermomechanical fatigue, worse still), or when
> oxidation attacks the crack tip. [E]

Adding them gives the **Manson–Coffin–Basquin** form used for the total strain range,
which is what a thermal-structural analysis actually reports:

$$\frac{\Delta\varepsilon_t}{2} = \frac{\sigma'_f}{E}\,(2N_f)^{b} \;+\; \varepsilon'_f\,(2N_f)^{c}$$

> **Eq. 3.7** — variables as Eqs. 3.5–3.6; $\Delta\varepsilon_t$ is the total (elastic plus
> plastic) strain range per cycle. Meaning: one curve from $10^0$ to $10^8$ cycles, with
> the plastic term dominating on the left and the elastic term on the right; they cross at
> the *transition life*, which for copper alloys is a few thousand reversals. Assumes:
> the four constants come from tests at the operating temperature, in the operating
> environment. **Fails when:** they do not — hydrogen, oxygen, hold time and mean stress
> each move the curve, and the constants are not transferable between temperatures.
> Solved for $N_f$ by iteration; there is no closed form. [E]

The design factor: propulsion practice applies a **factor of 4 on predicted cycles or 2
on strain range, whichever is more conservative**, to cover scatter and analysis
uncertainty [SP-8087]. Cumulative damage across a mixed duty cycle is summed with Miner's
rule, $\sum n_i/N_{f,i} \le 1$, with the usual caveat that Miner's rule is a bookkeeping
convention, not a physical law, and is routinely wrong by a factor of two in either
direction. [E]

**Ratcheting** deserves its own name. If a wall cycles plastically *and* carries a steady
pressure load, the plastic strain need not reverse fully each cycle; it can accumulate in
one direction. In a milled-channel liner this produces the classic **"doghouse"** failure:
the hot wall between the channel and the gas thins and bulges progressively into the gas
path over tens of cycles until it opens. It is a *deformation*-limited failure, not a
crack-limited one, and Coffin–Manson does not predict it. Ratcheting is the reason liner
life predictions are done with an elastic–plastic cyclic analysis rather than a strain
range plugged into Eq. 3.7. [M]

#### 3.2.5 Fracture toughness and damage tolerance

Every real part contains cracks; the question is whether they are big enough to matter.
The stress-intensity factor at a crack tip is

$$K = Y\,\sigma\,\sqrt{\pi a}$$

> **Eq. 3.8** — variables: $K$ [Pa·√m], $Y$ [—] a geometry factor of order 1 (1.12 for a
> surface flaw in a plate), $\sigma$ [Pa] remote stress, $a$ [m] crack depth. Meaning: the
> amplitude of the crack-tip stress field; the crack runs when $K$ reaches $K_{Ic}$.
> Assumes: linear-elastic behaviour, small-scale yielding (plastic zone small compared to
> $a$ and to the ligament), plane strain. Fails when: the material is very tough and thin
> (use $J$ or CTOD), or the plastic zone is large. [F]

Setting $K = K_{Ic}$ gives the critical flaw size $a_{cr} = (1/\pi)(K_{Ic}/Y\sigma)^2$.
This is the number that governs proof testing: a proof test to $1.1$–$1.5\times$ MEOP
either breaks the part or demonstrates that no flaw larger than $a_{cr}$ evaluated *at the
proof stress* is present, and the flight life is then the crack-growth life from that
size. Growth under cyclic loading follows Paris:

$$\frac{da}{dN} = C\,(\Delta K)^{m}$$

> **Eq. 3.9** — variables: $da/dN$ [m/cycle], $\Delta K$ [Pa·√m] stress-intensity range,
> $C$ and $m$ [—] material constants; $m \approx 3$ for steels and nickel alloys.
> Meaning: the middle, log-linear part of the crack-growth curve. Assumes: constant
> amplitude, $\Delta K$ above the threshold and below the fast-fracture regime, no
> environmental acceleration. **Fails, spectacularly, in hydrogen** — gaseous hydrogen can
> raise $da/dN$ by one to two orders of magnitude in susceptible alloys at the same
> $\Delta K$ (§3.4.7). [E]

Fracture control for propulsion pressurised hardware is a formal requirement, not an
optional analysis [AIAA-S-080]. It drives NDE sensitivity: if your inspection can only
find a 1.3 mm flaw, that is the flaw you must assume is there.

#### 3.2.6 The three temperature curves you should be able to sketch from memory

For every alloy family in §3.3, know the shape of:

1. **$F_{ty}$ versus $T$**, from 20 K to the service limit. FCC alloys rise going cold.
   Precipitation-hardened alloys have a shoulder and then a collapse at the overaging
   temperature. Solid-solution alloys decline gently and have no cliff.
2. **$k$ versus $T$.** Pure metals: conductivity *falls* with temperature. Alloys and
   superalloys: conductivity *rises* with temperature (phonon and electron scattering by
   solute already dominates, and the electronic term grows). Inconel 718 goes from
   11 W/(m·K) at 300 K to 21 W/(m·K) at 800 K; NARloy-Z goes the other way. This
   crossover is why the copper-versus-nickel gap narrows hot but never closes.
3. **$\alpha$ versus $T$.** Rises with temperature for everything, roughly 20–30 % between
   300 K and 800 K, and falls sharply below 100 K (which is why cryogenic differential
   contraction is dominated by the 300→100 K range, not the last 80 K).

---

### 3.3 The material families

#### 3.3.1 Copper alloys — the liner

The job: pass 20–160 MW/m² through a sub-millimetre wall without the hot face exceeding
about 800–850 K, for hundreds of thermal cycles. Nothing but copper does this
(§3.2.2, Eq. 3.3). The design problem is that pure copper is useless as a structure, so
the whole family history is a search for strength and creep resistance that costs the
least conductivity.

- **OFHC copper (C10100/C10200).** $k \approx 391$ W/(m·K), the benchmark. Yield
  70 MPa annealed, and it recrystallises and softens at brazing and operating
  temperatures. Used in experimental and short-duration hardware, calorimetric research
  chambers, and as the reference against which every alloy's conductivity is quoted.
- **NARloy-Z (Cu–3Ag–0.5Zr).** [H], [M] The RS-25 main combustion chamber liner: 390
  milled channels in a NARloy-Z liner with an electroformed-nickel closeout
  [_verify-liquid, RS-25 block]. Silver and zirconium give precipitation and
  solid-solution strengthening at a cost of roughly 20 % of the conductivity
  (~316 W/(m·K)). It has held the "standard textbook liner" position since 1975 and it
  works, but it has two weaknesses: it overages — the strengthening phases coarsen — above
  roughly 750 K, so its hot creep and LCF resistance fall with accumulated hot time; and
  it **blanches**.
- **Blanching** [M] is the surface degradation of a copper liner cycling in an environment
  that alternates between oxidising and reducing near the wall. Copper oxidises in the
  oxygen-rich part of the cycle and is reduced back by the hydrogen-rich boundary layer;
  the repeated oxide formation and reduction roughens and porosifies the surface. Two
  consequences, both bad: surface roughness rises, which raises the gas-side heat-transfer
  coefficient and hence the flux, which raises the wall temperature, which accelerates
  everything else; and the roughened, porous layer is a crack-initiation site that
  shortens LCF life. Blanching was one of the two explicit motivations for the GRCop
  programme [GRCop].
- **GRCop-84 (Cu–8 at.% Cr–4 at.% Nb).** [M] NASA Glenn's dispersion-strengthened alloy.
  The strengthening is by **Cr₂Nb** intermetallic particles, which are thermodynamically
  stable and do not dissolve or coarsen at liner temperatures — so unlike NARloy-Z it does
  *not* overage. It holds roughly 130 MPa yield at 800 K where NARloy-Z is near 70, with
  only a modest conductivity penalty (~310 W/(m·K)), far better creep resistance, better
  LCF life at equal strain range, and markedly better blanching resistance [GRCop].
- **GRCop-42 (Cu–4 at.% Cr–2 at.% Nb).** [M] Half the dispersoid loading. Slightly higher
  conductivity, slightly lower strength, and — the reason it now dominates — considerably
  better **printability** by laser powder-bed fusion: less reflected laser power, a wider
  process window, and less cracking. Most current AM chambers use GRCop-42
  [Gradl18], [GradlAM], [RAMPT]. Property data for -42 are still consolidating; treat
  GRCop-84 as the well-documented baseline [GRCop].
- **CuCrZr (C18150).** European and industrial workhorse (also the ITER first-wall alloy).
  Highest room-temperature strength of the group and good conductivity, but it is a
  conventional precipitation-hardened alloy and overages above roughly 700 K. Excellent
  for moderate-flux, moderate-temperature liners; wrong for a 206 bar hydrogen engine.

> **The copper trade in one line [J]:** conductivity, hot strength and creep resistance
> are the three corners, and the alloy history is a walk from the conductivity corner
> (OFHC) toward the hot-strength corner (GRCop) at the smallest conductivity cost anyone
> can arrange. The pressure load is *not* in this trade at all — the closeout jacket
> carries it.

#### 3.3.2 Nickel superalloys — everything hot that is not the liner

- **Inconel 718 (Ni–19Cr–18Fe–5Nb–3Mo–Ti–Al).** [M] The workhorse, and if you learn one
  alloy, learn this one. Pump housings, injector bodies and faceplates, nozzle jackets and
  structural closeouts, manifolds, ducts, printed chambers and printed injectors, turbine
  discs. Reasons it wins: very high strength (yield above 1,000 MPa aged), excellent
  cryogenic properties, adequate service to about 925 K, and — decisively — it is
  **weldable and printable**. 718's strengthening phase γ″ is sluggish to precipitate, so
  the alloy can be welded or printed in the solution-annealed condition and aged
  afterwards without cracking in the heat-affected zone. Almost every other high-strength
  superalloy suffers strain-age cracking on welding. Its two weaknesses: the γ″ overages
  above ~925 K, so it has no high-temperature future; and it is **badly embrittled by
  gaseous hydrogen** (§3.4.1), which is awkward in a hydrogen engine.
- **Inconel 625 (Ni–21Cr–9Mo–4Nb).** Solid-solution strengthened, not age-hardened. Much
  lower strength than 718 (yield 415–520 MPa), much better weldability still, excellent
  corrosion and oxidation resistance, and useful to about 1,250 K where its strength is
  low but its integrity is intact. Used for manifolds, bellows, ducting, liners of hot-gas
  paths, and as a weld filler. The 718-versus-625 choice is the cleanest illustration of
  strength traded for manufacturability and temperature (§3.5).
- **Waspaloy (Ni–19Cr–13Co–4Mo, γ′ strengthened).** Higher temperature capability than 718
  (to ~1,000 K) at comparable strength, used for turbine discs and fasteners. Weldable
  only with care — γ′ alloys are prone to strain-age cracking.
- **Haynes 230 (Ni–22Cr–14W–2Mo, solid solution + carbides).** Outstanding oxidation
  resistance and thermal stability to 1,400 K, low strength, excellent formability and
  weldability. This is a *sheet* alloy for combustor cans, hot-gas ducts and
  gas-generator liners where the load is thermal, not mechanical.
- **Haynes 282 (γ′ strengthened, deliberately low γ′ fraction).** A modern alloy designed
  to be weldable *and* strong to ~1,200 K, aimed exactly at the gap between 718's
  temperature limit and 230's strength limit. Increasingly used in AM hot-section work.
  [R]/[M]
- **René 41 (Ni–19Cr–11Co–10Mo, γ′).** High strength to ~1,150 K, historically used for
  turbine and hot structural parts; notoriously strain-age-crack-prone in welding, which
  is why it lost ground to 718 and 625.
- **MAR-M-246, MAR-M-247 and the cast blade alloys.** [H], [M] Turbine blades and nozzles
  are not wrought. They are investment-cast, and the casting is deliberately given a
  directional grain structure: **equiaxed → directionally solidified (DS) → single
  crystal (SX)**. Every step removes transverse grain boundaries. Grain boundaries are
  where creep cavitation nucleates, where hydrogen segregates and cracks intergranularly,
  and where the low-cycle thermal fatigue crack runs. A single-crystal blade has none, and
  it can also be given a lower melting point (no grain-boundary strengtheners needed),
  which allows a fuller solution heat treatment. The RS-25 HPFTP history in §6.2 is the
  case study.

#### 3.3.3 Stainless steels and the iron–nickel austenitics

- **304L, 316L, 321, 347.** [F], [M] Austenitic (FCC), so no DBTT: ductile and tough to
  20 K, which is why they are the default for cryogenic lines, flanges, bellows, filters
  and tanks [SP-8119], [SP-8123]. Low strength (yield ~170 MPa annealed), low conductivity
  (~16 W/(m·K)), high CTE. The "L" is low carbon, to prevent chromium carbide
  precipitation at grain boundaries during welding ("sensitisation"); 321 and 347 achieve
  the same by stabilising with Ti and Nb respectively, and 347 is the usual choice where
  the part will also be hot. Caveat: 304 has marginal austenite stability, and cold work
  at cryogenic temperature transforms some austenite to α′ martensite, which is brittle —
  for a cryogenic pressure boundary that will be strained, prefer 316L or a
  higher-stability grade. [E]
- **Tube-wall nozzles.** [H] The classic architecture: hundreds of individually formed,
  tapered tubes brazed side by side into a shell, each tube both a coolant channel and a
  structural member, with an outer jacket and bands taking hoop load. The F-1 used **178
  Inconel X-750 / Hastelloy tubes brazed into an Inconel jacket with steel bands**; the
  RS-25 nozzle is a **1,080-tube brazed tube wall**; the RL10 chamber is a **brazed
  stainless-steel tube wall** [_verify-liquid: F-1, RS-25, RL10 blocks]. Tube-wall
  construction scales to very large nozzles and tolerates modest flux beautifully; it
  loses to milled channels above roughly 100 bar because a round tube is a poor pressure
  vessel against a large external-to-internal pressure difference and because the braze is
  a defect population you cannot fully inspect.
- **21-6-9 (Nitronic 40, 21Cr–6Ni–9Mn).** [M] A nitrogen- and manganese-stabilised
  austenitic, roughly twice the yield strength of 316L, exceptionally stable austenite,
  excellent cryogenic toughness, and good resistance to hydrogen environment
  embrittlement. This is the standard alloy for **hydrogen lines, ducts and pressure
  components** in American hydrogen engines and test facilities [G-095].
- **A-286 (Fe–25Ni–15Cr, γ′ strengthened).** An iron-base austenitic superalloy with
  yield near 700 MPa, cryogenic capability, and — the reason it is here — **far better
  hydrogen resistance than any nickel-base age-hardened alloy**. Used for hydrogen-wetted
  fasteners, springs, and structural parts.
- **JBK-75.** [M] A modified A-286 developed for improved weldability and hydrogen
  service, with the boron and silicon adjusted to suppress hot cracking. Where A-286 would
  be right but the part must be welded, JBK-75 is the answer. Its existence is a good
  illustration that in hydrogen service the alloy list is short enough that programmes
  develop new members rather than compromise.

#### 3.3.4 Aluminium alloys

Not in hot sections, ever — the useful limit is about 450 K and the melting point is
about 900 K. Aluminium's place is tanks, structure, low-pressure pressure-fed hardware and
non-hot valve bodies, where specific strength and cryogenic toughness matter and
temperature does not.

- **2219 (Al–6.3Cu).** [H], [M] The propellant-tank alloy: weldable (unusually for a
  2xxx), stress-corrosion resistant, and it *gains* strength and toughness at cryogenic
  temperature. Shuttle External Tank, Saturn S-IVB, countless upper stages.
- **2195 (Al–Li–Cu).** [M] The Shuttle Super Lightweight Tank alloy — about 5 % less dense
  and 5 % stiffer than 2219 with substantially higher strength, at the price of anisotropy,
  thickness debits, and a much fussier weld process. The classic "the material was better
  and the manufacturing nearly killed it" case.
- **6061-T6.** Weldable, cheap, moderate strength, high conductivity. Pressure-fed
  hardware, cold-gas and monopropellant components, brackets, manifolds, test hardware.
- **7xxx series.** High strength, and a well-known stress-corrosion-cracking
  susceptibility in the short-transverse direction in the peak-aged tempers. Used in
  aerospace structure with controlled tempers (T73, T76); generally avoided for wetted
  propulsion pressure hardware.

#### 3.3.5 Titanium — superb, and forbidden on the oxidizer side

Ti-6Al-4V has an outstanding specific strength (yield ~830 MPa at $\rho = 4{,}430$ kg/m³),
which is why it is used for **turbopump impellers and inducers on the hydrogen side**, for
storable-propellant tanks, and for COPV liners and structure. Ti-5Al-2.5Sn ELI is the
cryogenic grade.

And it must **never** be used in contact with liquid or gaseous oxygen, or anywhere in an
oxidizer-rich flow path. [F] The reasons compound:

1. Titanium's heat of oxidation is enormous (about 19 MJ per kg of Ti to TiO₂) and its
   thermal conductivity is low (6.7 W/(m·K)), so heat released at a reacting spot cannot
   be conducted away — the spot runs away.
2. The oxide film is not protective at temperature and is easily removed mechanically; a
   fresh titanium surface exposed to oxygen ignites readily.
3. Consequently titanium fails LOX mechanical-impact testing at very low impact energies —
   it is one of the few structural metals that reliably ignites in the standard test
   (§3.4.8).

The failure is not theoretical. Titanium/LOX impact ignition is the reason the material is
categorically excluded by oxygen-system design guidance (ASTM G94, *Standard Guide for
Evaluating Metals for Oxygen Service*; ASTM G88, *Standard Guide for Designing Systems for
Oxygen Service*). And titanium has a second, separate incompatibility: **stress-corrosion
cracking in nitrogen tetroxide** (§3.4.6).

#### 3.3.6 Refractory metals

- **Niobium (columbium) alloy C-103 (Nb–10Hf–1Ti).** [M] The standard
  **radiation-cooled nozzle extension** material: formable, weldable, ductile at room
  temperature (unlike tungsten and molybdenum), density 8,850 kg/m³, useful to roughly
  1,600–1,700 K. Bare niobium oxidises catastrophically above about 800 K — Nb₂O₅ is
  non-protective, volatile and spalls, so the metal is consumed rather than passivated —
  so **C-103 is always used with a silicide coating** (the R512-type Si–Cr–Fe or Si–Cr–Ti
  coatings), and the coating, not the metal, sets the life. A coating chip is a hole.
  Applications: Merlin Vacuum's extension, the Apollo SPS nozzle extension, the Shuttle
  RCS R-40 and the R-4D family [_verify-liquid: Merlin, SPS, R-40, R-4D blocks].
- **Molybdenum and TZM.** Higher temperature capability than niobium, but MoO₃ is volatile
  above about 1,070 K, so uncoated molybdenum in oxygen simply evaporates; and it is
  brittle at room temperature above a transition, which makes handling and joining
  difficult. Historic use: the original R-4D chamber was a molybdenum alloy, replaced by
  coated niobium [_verify-liquid, R-4D block].
- **Rhenium, iridium-lined.** [M] Rhenium melts at 3,459 K, has no ductile–brittle
  transition, and is fabricated by chemical vapour deposition onto a mandrel; an iridium
  liner on the gas side provides the oxidation resistance rhenium lacks. Chambers run at
  2,200–2,500 K, which cuts the film-cooling fraction dramatically. The R-4D's technology
  history — **molybdenum → silicide-coated niobium → iridium-lined rhenium**, buying about
  10 s of $I_{sp}$ from 312 s to ~322 s — is the single best short case of a materials
  change delivering performance in this whole course [_verify-liquid, R-4D block].
  Rhenium is desperately expensive and the CVD process limits the size.

#### 3.3.7 Ablatives

A charring ablator is a designed-to-be-consumed material: a silica or carbon fabric in a
phenolic resin matrix. Under heating the resin pyrolyses, the pyrolysis gas percolates out
through the char and *blows* the boundary layer (reducing the convective coefficient), the
char layer radiates and insulates, and the surface recedes. There is no cooling circuit
and no pump-side pressure drop, and the whole thing is single-use.

Where it wins: pressure-fed, storable, short-duration or restart-limited engines. The
Apollo SPS used an **ablative chamber with a radiation-cooled niobium/titanium nozzle
extension**; the LM descent engine and the Shuttle OMS used ablative chambers; the RS-68
uses a regeneratively cooled chamber with an **ablative silica/carbon-phenolic nozzle**,
a deliberate cost choice on a high-thrust hydrogen engine [_verify-liquid: SPS, LMDE, OMS,
RS-68A blocks]. Where it loses: throat erosion changes $A_t$ and therefore $p_c$ and
mixture ratio through the burn, life is a single burn's worth of char depth, and long
burns need thick, heavy liners. Design method and material behaviour: [SP-8124] for
liquid self-cooled chambers, [SP-8115] for the solid-motor nozzle equivalent.

#### 3.3.8 Composites

- **Carbon–carbon.** [M] Carbon fibre in a carbon matrix — the only structural material
  that is *stronger* at 2,000 K than at room temperature, with density around
  1,700–2,000 kg/m³, i.e. a quarter of niobium's. Its flagship application is the
  **RL10B-2 extendible nozzle extension: NOVOLTEX/SEPCARB 3D carbon–carbon, about 2.5 m
  long with a 2.1 m exit diameter, deployed after stage separation, taking the expansion
  ratio from 77:1 to 285:1 and worth roughly 30 s of $I_{sp}$** — and giving the engine
  the highest specific impulse ever flown, 465.5 s [_verify-liquid, RL10B-2 block]. The
  catch is oxidation: carbon burns in an oxygen-bearing plume above roughly 700 K, so
  C–C in a rocket nozzle needs a SiC conversion or CVD coating and a fuel-rich boundary,
  and the cost per part is very high.
- **Carbon-fibre-reinforced polymer.** Thrust structures, engine frames, COPV overwraps,
  aerodynamic fairings, and the interstage hardware around the engine. Not in the hot gas
  path and not in contact with LOX.

#### 3.3.9 Ceramics and coatings

Ceramics are not used as load-bearing engine structure — they have no ductility, and
therefore no tolerance for the strain excursions of §3.2.4. They are used as **coatings**,
where the substrate carries load and the coating manages heat or chemistry.

- **Thermal barrier coatings (TBC).** Yttria-stabilised zirconia (7–8 wt % Y₂O₃–ZrO₂),
  plasma-sprayed or EB-PVD, onto an MCrAlY bond coat. Its point is a thermal conductivity
  of 1.0–1.5 W/(m·K) — a factor of 10 below the superalloy beneath it — so a
  0.2–0.4 mm layer drops the metal temperature by 100–200 K for the same gas temperature.
  Zirconia is chosen because its CTE (~10.5×10⁻⁶/K) is unusually close to that of a
  superalloy (~14×10⁻⁶/K); the residual mismatch is what eventually spalls the coating.
  Used on turbine blades and vanes and on gas-generator and preburner liners. [M]
- **Oxidation-protection coatings.** Silicide on niobium (§3.3.6), SiC on carbon–carbon,
  aluminide and MCrAlY on superalloys.
- **Barrier coatings against hydrogen.** Copper and gold plating on hydrogen-wetted
  Inconel 718 parts (§3.4.1, §6.2).
- **The Russian ORSC enamel.** [M] The RD-180 verification block is explicit: *"an inert
  enamel coating on every metal surface in contact with the hot oxygen-rich gas. This is
  the single technology that makes ORSC survivable and it is why the West could not simply
  copy the cycle"* [_verify-liquid, RD-180 block]. Note what kind of technology this is:
  not an alloy, a *process* — surface preparation, application, adhesion, inspection and
  repair, developed over decades of test experience. That is exactly the sort of knowledge
  that does not transfer with a drawing package.
- **The RS-25 nozzle tubes.** The RS-25 nozzle is a 1,080-tube brazed tube wall
  [_verify-liquid, RS-25 block]; the specific tube alloy and any hot-gas-side coating are
  **not stated in this course's verification file**, and are therefore not reliably
  published here. What can be said generally is that hydrogen-cooled tube-wall nozzles use
  austenitic alloys selected for hydrogen compatibility and brazeability rather than for
  strength, and that the tube-to-tube braze is the life-limiting feature.

### 3.4 Failure mechanisms

#### 3.4.1 Hydrogen embrittlement

Three distinct mechanisms travel under one name, and confusing them produces bad
engineering. [F]

**1. Hydrogen environment embrittlement (HEE).** The part is loaded while gaseous hydrogen
is present at its surface. Hydrogen adsorbs, dissociates, and diffuses into the intense
hydrostatic tensile field ahead of a crack tip or notch, where it accumulates. Two
sub-mechanisms are argued in the literature and both are probably operating:
**HEDE** (hydrogen-enhanced decohesion — dissolved hydrogen lowers the cohesive strength
of grain boundaries and cleavage planes) and **HELP** (hydrogen-enhanced localised
plasticity — hydrogen increases dislocation mobility, concentrating slip into narrow bands
that fail early). The field has not settled which dominates; say so rather than picking.
[R] The observable result is the same: notched tensile strength drops, elongation and
reduction-of-area drop, and the fracture surface changes from ductile microvoid
coalescence to intergranular or quasi-cleavage.

The environmental dependences are the practically important part:

- **Temperature.** Maximum susceptibility is near **200–300 K**. Below about 120 K
  hydrogen cannot diffuse fast enough to reach the crack tip within the loading time;
  above about 500 K it desorbs and the solubility/trap balance changes. **This is the
  single most counter-intuitive fact in the module: liquid hydrogen at 20 K is not the
  embrittling condition; warm gaseous hydrogen in a manifold, turbine or seal cavity is.**
- **Pressure.** Susceptibility increases with hydrogen fugacity — a 350 bar turbine
  environment is far worse than a 1 bar one.
- **Strain rate.** Slow loading is worse; the effect is diffusion-limited. An impact test
  can miss embrittlement that a slow-strain-rate test finds. This is why the standard
  screen is a **slow-strain-rate notched tensile test in high-pressure H₂, ratioed against
  the same test in helium** — the *notched strength ratio*, $NSR$.
- **Strength level.** Higher-strength conditions of the same alloy are more susceptible.
  Heat-treating 718 to a lower strength buys hydrogen resistance.

**2. Internal hydrogen embrittlement (IHE).** Hydrogen introduced during manufacture —
acid pickling, electroplating, welding with damp consumables, melting practice. The
part is embrittled with no hydrogen in service at all. The fix is process control plus a
post-plating bake-out (a low-temperature hold to diffuse hydrogen out), which is a
mandatory step on plated high-strength steel parts.

**3. Hydrogen reaction embrittlement.** Hydrogen reacts to form a new phase: hydrides in
titanium, zirconium, niobium and vanadium (brittle, and they grow with time and
temperature), or methane bubbles at carbides in steels at high temperature ("hydrogen
attack"). Irreversible.

**The alloy ranking** [E], from the body of NASA and industry hydrogen-compatibility
testing summarised in [G-095]. Approximate notched strength ratios in high-pressure
gaseous hydrogen at room temperature, which is the worst case — treat as indicative, since
$NSR$ depends strongly on notch severity, pressure, strain rate and heat treatment:

| class | alloys | approx. $NSR$ | verdict |
|---|---|---|---|
| Negligibly affected | aluminium alloys (2219, 6061), copper alloys (OFHC, NARloy-Z, GRCop), stable austenitics (310, 21-6-9), Cu–Be | 0.95–1.0 | use freely |
| Slightly affected | 316L, 347, Inconel 625 (annealed), pure nickel | 0.85–0.95 | acceptable, qualify |
| Severely affected | **Inconel 718**, Waspaloy, René 41, 17-4PH, martensitic and high-strength low-alloy steels (4340), Ti-6Al-4V | 0.3–0.6 | requires a barrier, a derate, or a different alloy |
| Intermediate, and the useful ones | **A-286**, **JBK-75** | 0.8–0.9 | the go-to when you need strength *and* hydrogen |

The ranking that matters for an interview: **JBK-75 ≈ A-286 ≫ Inconel 718** in gaseous
hydrogen, and it is the reverse of the ranking by strength and by ease of procurement. That
is the whole design tension.

**The fixes, in order of preference:**

1. **Choose a resistant alloy.** 21-6-9 for hydrogen lines and ducts, A-286/JBK-75 for
   hydrogen-wetted high-strength parts, copper alloys and aluminium wherever the load
   permits.
2. **Derate the strength.** A 718 part heat-treated to a lower yield is meaningfully less
   susceptible. You pay in mass.
3. **Coat it.** [H], [M] A metallic barrier layer that hydrogen does not readily permeate,
   applied to hydrogen-wetted 718 hardware. The RS-25 programme used **copper plating and
   gold plating** on hydrogen-exposed Inconel 718 components — gold in particular because
   it is inert, has very low hydrogen permeability, and can be plated thin and uniformly
   into complex geometry. The weakness of every barrier is that it must be continuous: a
   scratch, a pinhole, or a chip at an edge is a local entry point, and it is a plating and
   inspection problem, not a metallurgy one.
4. **Design around it.** Lower stress, larger radii, no notches, no residual tensile
   stress (shot peen to put the surface in compression), and keep the highest-strength
   material out of the hydrogen.

#### 3.4.2 Oxidation and oxidizer-rich burning: the metal fire

Ordinary high-temperature oxidation is a diffusion-limited scale growth. An alloy is
"oxidation resistant" when it forms a dense, adherent, slow-growing scale — Cr₂O₃ for
chromia formers up to about 1,300 K, Al₂O₃ for alumina formers above that. Above the
chromia stability limit Cr₂O₃ converts to volatile CrO₃ and the protection is lost, which
is the real upper temperature bound on most Cr-bearing superalloys.

**Burning is different in kind.** [F] Metal + oxygen is a combustion reaction with a large
heat release: iron to Fe₂O₃ releases about 7 MJ/kg of metal, titanium about 19 MJ/kg,
aluminium about 31 MJ/kg. If the heat released at a reacting site exceeds what conduction
and convection can remove, the site heats, the reaction rate rises, and the process runs
away. The controlling factors are therefore:

- **Whether the oxide is protective.** If the oxide melts below the metal's melting point,
  or is volatile, or is mechanically removed by flow or rubbing, fresh metal is
  continuously exposed and the reaction never becomes diffusion-limited.
- **Thermal conductivity and mass.** A high-conductivity, thick part sheds the heat; a
  thin, low-conductivity part does not. This is why the same alloy passes as a
  thick-wall body and burns as a thin fin or a small particle.
- **Oxygen pressure and velocity.** Ignition temperatures fall as oxygen pressure rises,
  and flow supplies unlimited oxidizer and removes the protective boundary layer.
- **An ignition source.** Particle impact (a chip of weld spatter at 100 m/s), rubbing
  contact (a seal or a bearing touchdown), adiabatic compression of gas at a fast-opening
  valve, resonance heating in a dead-end cavity, or a friction spark.

**Rank order for oxygen service** [E], from oxygen-systems practice (ASTM G94, ASTM G88):
Monel and nickel–copper alloys and copper alloys are the most resistant (their oxides are
protective and their heats of oxidation are low); nickel and Inconel 600/625 are good;
300-series stainless is marginal at high pressure; carbon steel is poor; aluminium is
poor; **titanium and magnesium are prohibited.**

**Why oxidizer-rich staged combustion is a metallurgy problem.** In an ORSC engine the
preburner burns nearly all the oxidizer with a little fuel, producing 500–800 K
oxygen-rich gas which then drives the turbine at 300–500 bar and passes through the main
injector. Every surface of the preburner, turbine manifold, turbine blades and injector
posts is a thin, hot, high-velocity part in high-pressure oxygen. The engineering solution
the Soviet programmes converged on has four parts, and none of them is "find a better
alloy":

1. **Keep the gas cool.** Run the preburner extremely oxidizer-rich so the gas is
   500–800 K, not 1,200 K. The turbine then has to be a high-mass-flow, low-temperature
   machine, which is why ORSC turbopumps are so large.
2. **Coat everything.** The inert enamel on every hot-oxygen-wetted surface
   [_verify-liquid, RD-180 block]. The coating's job is to be a chemically inert barrier
   between oxygen and a metal that would otherwise ignite.
3. **Eliminate particles and crevices.** Welded rather than bolted construction,
   obsessive cleanliness, filtration, no organic contamination, controlled surface finish.
   Most metal fires start at a particle impact.
4. **Test until you have seen every failure.** This is the part that cannot be shortcut,
   and it is the honest explanation for the timeline in §6.3.

**The Western experience.** [M] The BE-4 is the first US-designed ORSC engine to fly
(8 January 2024, Vulcan Cert-1) after development that began in 2011, was publicly
announced in 2014, first hot-fired in 2017, and ran roughly five years late, delaying two
launch vehicles [_verify-liquid, BE-4 block]. Blue Origin chose a chamber pressure of
**140 bar — deliberately low for an ORSC engine, against the RD-180's 267 bar — and has
been explicit that this is a life-and-reusability choice**. Read that as a materials
statement: oxygen partial pressure in the preburner and turbine scales with chamber
pressure, and ignition thresholds fall as it rises, so halving the pressure buys a very
large margin against metal fire and a very large gain in inspection intervals. Aerojet
Rocketdyne's AR-1, a competing ORSC LOX/RP-1 engine proposed as an RD-180 replacement, was
not selected and did not reach flight; this is publicly reported programme history and
there are no verified performance data for it in this course's reference file. The general
lesson stands: the West could read the RD-180's cycle diagram from the beginning. What it
could not read was the coating process sheet and the thirty years of test failures behind
it. [J]

#### 3.4.3 Creep

Time-dependent deformation under load above ~0.4 $T_m$. Three regimes: primary
(decelerating, work hardening), secondary (steady-state, the regime that is designed to),
and tertiary (accelerating, damage accumulation, then rupture). Where it bites in an
engine:

- **Turbine blades** — centrifugal stress at 1,000–1,200 K, and the deformation limit
  (tip clearance) is usually reached before rupture.
- **Uncooled and radiation-cooled nozzle extensions** — C-103 at 1,600 K under its own
  weight and the gimbal/side loads; creep sag is a real design case [SP-8120].
- **Copper liners** — at 800 K, copper alloys are at $0.6\,T_m$. Creep interacts with the
  LCF cycle: a hold at temperature during a long burn relaxes the thermal stress, which
  sounds good, but the relaxation is *creep strain* that must be reversed plastically on
  cooldown, which increases the effective strain range and shortens life. **Creep–fatigue
  interaction can reduce liner life by an order of magnitude relative to a pure-fatigue
  prediction.** [E]
- **Preburner and gas-generator liners** — long-duration hot parts under modest stress.

#### 3.4.4 Thermal fatigue: deriving the strain range

Take a liner wall of thickness $t$, in-plane restrained by cold surrounding structure,
carrying flux $q''$. Before the burn it is uniform at $T_0$ and unstressed. During the
burn Eq. 3.1 gives a linear gradient $\Delta T_w$ across it.

Decompose the temperature field into a mean and a linear gradient. The mean rise
$\bar{T}-T_0$ is reacted by the surrounding structure and produces a membrane stress;
the linear part, if the wall were free, would make it bend. Restrained, both are converted
to stress. For the gradient part alone the free-surface strain excursion relative to the
mid-plane is

$$\Delta\varepsilon_{grad} = \frac{\alpha\,\Delta T_w}{2\,(1-\nu)}$$

which is Eq. 3.2 divided by $E$. Substituting Eq. 3.1:

$$\Delta\varepsilon_{grad} = \frac{\alpha}{2(1-\nu)}\cdot\frac{q''\,t}{k}$$

> **Eq. 3.10** — variables as Eqs. 3.1–3.2. Meaning: the strain range delivered per cycle
> by the through-thickness gradient alone, in a fully restrained wall. Assumes: linear
> gradient, full restraint, elastic-equivalent kinematics (the *strain* is kinematic even
> though the stress is not elastic). **Fails as a complete answer** because it omits the
> mean-temperature term, the pressure-induced strain, the channel-geometry stress
> concentration, and any ratcheting. A real liner's total strain range is typically 1.5–3×
> this value, and it comes from a nonlinear thermal-structural finite-element analysis,
> not from this equation. [A]

Note what Eq. 3.10 tells you about design levers: strain range falls with thinner walls
and higher conductivity, and it does *not* depend on strength at all. A stronger liner
alloy does not reduce the strain range; it only raises the stress at which that strain is
delivered. **Liner life is bought with conductivity and ductility, not with strength** —
which is why the fatigue-ductility coefficient $\varepsilon'_f$ in Eq. 3.7 is the property
you should look up first for a liner alloy. [J]

Feeding the strain range into Eq. 3.7 gives the cycle life. WE1 does this end to end.

#### 3.4.5 Cryogenic ductile–brittle transition

In a body-centred-cubic metal the critical resolved shear stress for dislocation motion
rises steeply as temperature falls, because screw dislocation motion in BCC is
thermally activated. Below a transition temperature the stress required to move
dislocations exceeds the stress required to cleave the lattice, and the fracture mode
switches from ductile microvoid coalescence to transgranular cleavage — Charpy energy
falls by an order of magnitude over a few tens of kelvin. Face-centred-cubic metals have
no such transition: their slip systems are athermal, and they stay ductile to 4 K.

Consequences, and they are absolute: [F]

- **Out** for cryogenic pressure boundary: ferritic and martensitic steels, carbon steels,
  4130/4340, most tool steels, ferritic stainless (409, 430), and — with care — martensitic
  and PH grades.
- **In**: austenitic stainless (304L, 316L, 321, 347, 21-6-9, A-286), aluminium alloys,
  copper alloys, nickel alloys, and titanium alloys in ELI grades.
- **The trap**: 9 % nickel steel is a ferritic steel that is *qualified* to 77 K for LNG
  service by controlling the microstructure. It is a real exception and it does not
  generalise to 20 K.
- **The second trap**: 304 stainless is austenitic but only marginally stable; cold work
  at cryogenic temperature transforms austenite to α′ martensite, which is BCC and
  brittle. Prefer 316L or 21-6-9 for cryogenic parts that will see plastic strain.

#### 3.4.6 Stress-corrosion cracking

Sustained tensile stress plus a specific environment plus a susceptible alloy produces
crack growth at stresses far below yield. The propulsion cases you must know:

- **Titanium in nitrogen tetroxide.** [H] Ti-6Al-4V propellant tanks cracked in "green"
  N₂O₄ during the Apollo era. The cause was traced to the *absence* of nitric oxide;
  the fix was to specify a controlled NO content in the oxidizer (0.4–0.8 % NO, giving
  MON-1/MON-3), which passivates the titanium surface. This is the reason essentially all
  flight NTO is mixed-oxides-of-nitrogen rather than pure N₂O₄, and it is a beautiful
  example of fixing a materials problem by changing the propellant specification instead of
  the tank. [Clark] tells the story from the propellant side.
- **7xxx aluminium in the short-transverse direction**, in humid or marine environments,
  in peak-aged tempers. Controlled by overaged tempers (T73/T76) at a strength cost.
- **High-strength steels in hydrogen sulphide and in chlorides.** Mostly a ground-support
  and facility problem in propulsion, but it is the reason stainless line hardware near
  a coastal test stand is specified the way it is.
- **Austenitic stainless in hot chlorides.** Classic; keeps chlorinated solvents out of
  cleaning procedures for stainless propulsion hardware.

#### 3.4.7 Hydrogen-assisted fatigue

The interaction, and the one that catches people who have treated embrittlement and
fatigue as separate analyses. In susceptible alloys, gaseous hydrogen raises the
fatigue-crack-growth rate $da/dN$ at a given $\Delta K$ by **one to two orders of
magnitude**, lowers the threshold $\Delta K_{th}$, and can remove the HCF endurance limit
altogether. [E] The frequency dependence is diagnostic: because the mechanism is
diffusion-limited, the effect is largest at *low* frequency and long hold times, which is
the opposite of the frequency dependence of most environmental fatigue effects.

Practical consequence: a crack-growth life computed with air or vacuum Paris constants for
a hydrogen-wetted 718 part can be wrong by 100×, in the unconservative direction. Use
hydrogen-environment crack-growth data or do not claim a damage-tolerance life. This
combination — a high-strength, hydrogen-susceptible alloy, a turbine blade's HCF loading
and a 350 bar hydrogen environment — is exactly the RS-25 HPFTP blade-cracking problem in
§6.2.

#### 3.4.8 LOX compatibility testing

You cannot compute oxygen compatibility. It is determined by test, and the tests are
standardised because the results are configuration-sensitive.

- **Mechanical impact.** The primary screen: a striker of specified mass is dropped from a
  specified height onto a sample immersed in liquid oxygen (or in pressurised liquid or
  gaseous oxygen), and the number of ignitions in a set number of drops is recorded.
  Standardised as **ASTM G86**, *Standard Test Method for Determining Ignition Sensitivity
  of Materials to Mechanical Impact in Ambient Liquid Oxygen and Pressurized Liquid and
  Gaseous Oxygen Environments*; the NASA implementation is NASA-STD-6001 Test 13. The
  output is an accept/reject at a stated impact energy (98 J is the classic LOX threshold),
  not a material property. **Titanium alloys fail this test; that is the operative fact.**
- **Promoted ignition combustion.** **ASTM G124** burns a standard rod of the metal in
  pressurised oxygen with an igniter at one end and measures whether combustion
  self-propagates, and the *threshold pressure* at which it starts to. This is the test
  that ranks structural metals for high-pressure oxygen service and it is the relevant one
  for an ORSC preburner.
- **The guides that turn test data into design.** **ASTM G94**, *Standard Guide for
  Evaluating Metals for Oxygen Service*, and **ASTM G88**, *Standard Guide for Designing
  Systems for Oxygen Service*. G88 is the important one for a systems engineer: it codifies
  the design rules — limit velocity at impingement sites, avoid dead-end cavities that can
  resonance-heat, avoid rapid pressurisation (adiabatic compression), control particulate,
  eliminate thin sections and sharp edges in oxygen streams, avoid soft goods in the flow
  path, and specify cleanliness to a numbered level.
- **The systems-level truth [J]:** in oxygen service, cleanliness and geometry buy more
  safety than alloy selection does. Most oxygen fires are ignited by a particle, a
  contaminant, or an adiabatic compression event, not by the base metal spontaneously
  deciding to burn.

### 3.5 Manufacturability as a selection criterion

Property tables have no column for "can be built", and it is the column that decides most
real selections. [J]

**Weldability.** The discriminator among nickel superalloys is **strain-age cracking**: an
age-hardening alloy that precipitates its strengthening phase quickly will precipitate it
in the heat-affected zone during post-weld heat treatment, while the HAZ is still relaxing
residual stress — and it cracks. Inconel 718's γ″ (Ni₃Nb) is *sluggish*: it takes hours to
precipitate. That single kinetic fact means 718 can be welded solution-annealed and aged
afterwards without HAZ cracking, and it is the main reason 718 rather than Waspaloy or
René 41 became the universal engine alloy despite being outclassed on temperature.
Inconel 625 goes further — it is not age-hardening at all, so it can be welded in any
condition, which is why it is the manifold, bellows and weld-filler alloy even though its
strength is less than half of 718's. [M]

**Printability.** Laser powder-bed fusion has its own selection criteria, and they are not
the same as weldability even though the physics is related. High reflectivity and high
conductivity make copper hard to print — the laser energy goes into the powder bed and out
again — which is precisely why **GRCop-42, with half the dispersoid loading of GRCop-84,
displaced it** for AM chambers: a wider process window and less cracking, bought with a
little strength. On the nickel side, 718 and 625 print well and have qualified property
data; the crack-prone γ′ alloys (René 41, Waspaloy, MAR-M) do not, which is why AM has so
far reached the injector, chamber and manifold but not the turbine blade
[Gradl18], [GradlAM]. AM also creates a new defect population — lack-of-fusion porosity,
un-melted powder in closed channels, surface roughness that raises both heat transfer and
fatigue-crack initiation — and a new inspection problem, since you cannot inspect a channel
you cannot see into. [M], [R]

**Heat treatment.** A large printed or welded chamber must fit in a furnace, and the
furnace cycle must not distort it. Solution treatment plus double ageing for 718 means a
955–1,065 °C solution and two ageing holds; a bimetallic part (copper liner plus nickel
jacket) has to survive a cycle that suits both alloys, and generally does not — which is
why bimetallic builds are usually joined by a process (HIP bonding, explosive bonding,
electroforming, directed-energy deposition) that does not require a subsequent full heat
treatment of the copper.

**Brazing.** A tube-wall nozzle is 178 (F-1) to 1,080 (RS-25) tubes furnace-brazed in one
operation [_verify-liquid]. The alloy must be brazeable, the braze alloy must not
embrittle the parent, and the failure mode is a braze void that becomes a leak on the
fortieth cycle. Braze voids are the reason tube-wall construction lost to milled channels
at high pressure.

**Formability and joining of the exotics.** C-103 is used instead of better refractory
metals largely because it can be formed and welded at room temperature. Rhenium is CVD-
deposited on a mandrel because it cannot be conventionally worked at all — and that
process, not the material's temperature capability, sets the maximum chamber size.

---
