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
