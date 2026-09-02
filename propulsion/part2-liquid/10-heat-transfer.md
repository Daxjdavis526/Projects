# Module 10 — Heat Transfer
Part II · Prerequisites: modules 02, 03, 06, 09 · Estimated time: 8 h

A thrust chamber is a pressure vessel whose inside surface is 1500 K hotter
than the melting point of anything you can afford to build it from, separated
from a liquid at 100–300 K by a wall about as thick as a credit card. Nothing
else in the engine is that close to the edge. The turbopump can be redesigned;
the injector can be re-drilled; the wall temperature is set by a heat flux you
did not choose and cannot switch off, and if you get it wrong the first
indication is a burn-through 3.2 seconds into a test that was supposed to run
for 300. Worse, the number that decides everything — the gas-side heat-transfer
coefficient — comes from a three-page 1957 paper whose author called it a
*rapid estimate* and who would be startled to learn that seventy years later it
is still the first line of every cooling analysis on Earth. This module is
about where that number comes from, how wrong it is, in which direction, and
what you do about the wall once you have it.

---

## 1. Learning objectives

After this module you should be able to:

1. Rank the three heat-transfer modes in a thrust chamber by magnitude, for
   both a sooting hydrocarbon engine and a hydrogen engine, and justify the
   ranking with a number.
2. Derive the adiabatic wall (recovery) temperature $T_{aw}$ from the recovery
   factor, and explain why the driving potential for wall heat flux is
   $T_{aw}-T_{wg}$ and not $T_c-T_{wg}$.
3. Derive the Bartz correlation from the Colburn/Dittus–Boelter pipe-flow
   analogy, showing where every factor — including the leading 0.026 — comes
   from.
4. Derive the Bartz property-correction factor $\sigma$ from a reference-
   temperature argument, and evaluate it.
5. Compute $h_g$ and $q''$ at the chamber, throat and a supersonic station for
   a given engine, and state the accuracy of the result and its sign.
6. State four operating regimes in which Bartz is known to be wrong, and say
   which way it errs in each.
7. Set up and solve the steady 1-D thermal resistance chain gas → wall →
   coolant, identify which resistance dominates, and compute $T_{wg}$,
   $T_{wc}$ and $\Delta T_{wall}$.
8. Explain quantitatively why a thin, high-conductivity wall wins, and compute
   the maximum heat flux a given wall material and thickness can survive.
9. Derive the constrained-wall thermal stress $\sigma_{th}=E\alpha\Delta T/
   [2(1-\nu)]$, compare it to yield for copper and nickel alloys, and explain
   the low-cycle-fatigue "dog-house" failure mode.
10. Compute the survival time of an uncooled heat-sink chamber from the
    semi-infinite-solid solution, and check the assumption.
11. Estimate gas radiation from a Hottel-type emissivity and decide whether it
    matters for a given propellant combination.

---

## 2. Terminology

| term | symbol | SI unit | definition |
|---|---|---|---|
| Heat flux (wall) | $q''$ | W/m² | heat entering the wall per unit area, normal to it |
| Total heat load | $Q$ | W | $\int q''\,dA$ over a surface |
| Gas-side film coefficient | $h_g$ | W/(m²·K) | $q''/(T_{aw}-T_{wg})$ |
| Coolant-side film coefficient | $h_c$ | W/(m²·K) | $q''/(T_{wc}-T_{co})$ |
| Adiabatic wall temperature | $T_{aw}$ | K | wall temperature an insulated wall would reach in the local flow |
| Recovery factor | $r$ | — | $(T_{aw}-T_\infty)/(T_0-T_\infty)$ |
| Chamber stagnation temperature | $T_0$ ($T_c$) | K | combustion stagnation temperature |
| Local static temperature | $T_\infty$ | K | free-stream static temperature at a station |
| Gas-side wall temperature | $T_{wg}$ | K | hot-face temperature of the liner |
| Coolant-side wall temperature | $T_{wc}$ | K | cold-face temperature of the liner |
| Coolant bulk temperature | $T_{co}$ | K | mixed-mean coolant temperature at a station |
| Wall thickness | $t_w$ | m | hot-wall (liner) thickness, gas face to coolant face |
| Thermal conductivity | $k$ | W/(m·K) | Fourier conduction coefficient |
| Thermal diffusivity | $\alpha_d$ | m²/s | $k/(\rho c)$ |
| Density (solid) | $\rho_s$ | kg/m³ | wall material density |
| Specific heat (solid) | $c_s$ | J/(kg·K) | wall material specific heat |
| Dynamic viscosity | $\mu$ | Pa·s | gas viscosity; $\mu_0$ at stagnation conditions |
| Gas specific heat | $c_p$ | J/(kg·K) | frozen or equilibrium $c_p$ of the products |
| Prandtl number | $\mathrm{Pr}$ | — | $\mu c_p/k_g$ |
| Reynolds number | $\mathrm{Re}$ | — | $\rho u D/\mu$ |
| Nusselt number | $\mathrm{Nu}$ | — | $hD/k_g$ |
| Stanton number | $\mathrm{St}$ | — | $h/(\rho u c_p)$ |
| Gas thermal conductivity | $k_g$ | W/(m·K) | of the combustion products |
| Throat diameter | $D_t$ | m | $2\sqrt{A_t/\pi}$ |
| Local area ratio | $A/A_t$ | — | local flow area over throat area |
| Throat wall radius of curvature | $R_u$ | m | upstream wall radius of curvature at the throat |
| Bartz property factor | $\sigma$ | — | boundary-layer property-variation correction |
| Characteristic velocity | $c^*$ | m/s | $p_c A_t/\dot m$ |
| Thermal resistance (per unit area) | $R''$ | m²·K/W | $1/h$ or $t/k$ |
| Stefan–Boltzmann constant | $\sigma_{SB}$ | W/(m²·K⁴) | $5.670374\times10^{-8}$ |
| Gas emissivity | $\varepsilon_g$ | — | effective emissivity of the radiating gas volume |
| Partial pressure | $p_i$ | Pa | of a radiating species (H₂O, CO₂) |
| Mean beam length | $L_b$ | m | equivalent radiating path length of a gas volume |
| Young's modulus | $E$ | Pa | of the wall material at temperature |
| Thermal expansion coefficient | $\alpha$ | 1/K | linear, of the wall material |
| Poisson's ratio | $\nu$ | — | of the wall material |
| Thermal stress | $\sigma_{th}$ | Pa | stress from a constrained temperature gradient |
| Yield strength | $\sigma_y$ | Pa | 0.2 % offset yield at temperature |
| Biot number | $\mathrm{Bi}$ | — | $h t_w/k$ |
| Fourier number | $\mathrm{Fo}$ | — | $\alpha_d t/L^2$ |

---

## 3. Theory

### 3.1 The three modes, and their sizes

Heat reaches the wall of a thrust chamber by three routes, and a working
engineer needs to know their relative size before doing any arithmetic at all,
because two of the three can usually be neglected and the neglect must be
defended.

**Convection.** Hot gas moving at 100–1000 m/s past a cold wall drags a
turbulent thermal boundary layer along the surface. This is the dominant mode
everywhere in every liquid engine, and it supplies **75–95 %** of the wall heat
load. Everything else in this module is a refinement of how to compute it.

**Radiation.** The combustion products are not transparent. H₂O and CO₂ are
strong band radiators; soot particles in a fuel-rich hydrocarbon flame radiate
as a grey continuum. Radiation is **5–25 % of the chamber-section flux for
kerosene/LOX** [E], falls to a few percent at the throat (the gas is cooler and
the convective flux has trebled), and is **under 1 % for LOX/LH₂**, whose
products are H₂O and H₂ with no carbon at all. Radiation from the *plume* back
onto a nozzle extension is a separate and sometimes dominant problem for
radiation-cooled skirts — that belongs to Module 11.

**Conduction.** No heat is generated in the wall, so conduction does not *add*
to the load; it *transmits* it. Conduction through the liner sets the
temperature drop $\Delta T_{wall}$ between hot and cold faces, and that
gradient — not the heat flux itself — is what cracks the liner. Axial and
circumferential conduction in the wall smear out local hot spots and are the
reason a copper liner tolerates injector streaking that would destroy a steel
one; a 1-D analysis ignores them and is conservative on peak temperature by
typically 5–15 % for copper [J].

The organising statement:

> **[F]** In a liquid rocket thrust chamber, convection sets the magnitude of
> the heat load, radiation is a correction (large for soot, negligible for
> hydrogen), and conduction sets the temperature gradient and therefore the
> stress. Design against convection; check radiation; fail by conduction.

### 3.2 Boundary layers in an accelerating flow

Module 02 treated the nozzle as inviscid and one-dimensional. It is not. At the
wall the no-slip condition forces $u=0$, and viscosity spreads that condition
into the flow over a thickness $\delta$. Simultaneously the wall is far colder
than the gas, so a thermal boundary layer of thickness $\delta_T$ develops.
For $\mathrm{Pr}\approx0.8$ (typical of combustion products) the two are of
similar thickness, $\delta_T/\delta \approx \mathrm{Pr}^{-1/3} \approx 1.08$.

Three features distinguish the rocket-nozzle boundary layer from the flat-plate
case that most heat-transfer courses teach:

1. **It is turbulent essentially everywhere.** Chamber Reynolds numbers based
   on diameter are $10^6$–$10^8$. Even at the injector face, the flow is
   turbulent within a few millimetres. Laminar-boundary-layer correlations
   have no place in a main chamber. (They matter for very small thrusters:
   below roughly 100 N, throat Reynolds numbers can drop into the transitional
   range and Bartz over-predicts.)

2. **It is thin, and gets thinner through the throat.** The convergent section
   imposes a strong favourable pressure gradient, $dp/dx<0$, which accelerates
   the near-wall fluid and *thins* the boundary layer. Thin boundary layer,
   steep near-wall temperature gradient, large heat flux. This is the physical
   reason the throat is the hottest place in the engine — not because the gas
   is hottest there (it is not; it is 300–400 K cooler than in the chamber) but
   because the boundary layer is thinnest and the mass flux per unit area is
   highest.

3. **Relaminarisation and lag.** In a strongly accelerated flow the turbulence
   can partially collapse (the acceleration parameter $K=(\nu/u^2)\,du/dx$
   exceeding $\sim3\times10^{-6}$ is the classical criterion), and the boundary
   layer does not respond instantly to the changing free-stream conditions.
   The consequence for us is practical: the *measured* peak flux does not sit
   exactly at the geometric throat.

### 3.3 Recovery temperature: the correct driving potential

Consider an insulated (adiabatic) wall placed in a high-speed flow. Fluid
brought to rest at the wall converts kinetic energy to internal energy, so the
wall runs hotter than the free-stream static temperature $T_\infty$. If the
stagnation were perfect and adiabatic, the wall would sit at $T_0$. It does
not, because heat diffuses out of the stagnated fluid faster (or slower) than
momentum diffuses in — the ratio of those diffusivities is exactly the Prandtl
number. Define the **recovery factor**

$$r \equiv \frac{T_{aw}-T_\infty}{T_0-T_\infty}$$

> **Eq. 3.1** — variables: $r$ [—], $T_{aw}$ adiabatic wall temperature [K],
> $T_\infty$ local free-stream static temperature [K], $T_0$ local stagnation
> temperature [K]. Meaning: the fraction of the free-stream kinetic energy that
> is actually recovered as temperature rise at an insulated wall. Assumes: a
> boundary layer in local equilibrium, constant $\mathrm{Pr}$. Fails when: the
> gas is chemically reacting inside the boundary layer with a different
> effective $\mathrm{Pr}$ (which it is, mildly, in a rocket), or when the
> boundary layer is separated.

Blasius/Crocco analysis of the laminar boundary layer gives $r=\mathrm{Pr}^{1/2}$;
for the turbulent boundary layer, $r=\mathrm{Pr}^{1/3}$ [F, from the
Crocco–Busemann energy integral; see [Bergman] Ch. 6 and [ZH] Ch. 16]. With
$\mathrm{Pr}\approx0.80$–$0.85$ for rocket combustion products,

$$r = \mathrm{Pr}^{1/3} \approx 0.93 \quad(\text{turbulent}),\qquad
r = \mathrm{Pr}^{1/2} \approx 0.90 \quad(\text{laminar})$$

Convention in rocket practice, and the value used by [Bartz57] and [HH §4.3],
is $r=0.90$ for the turbulent nozzle boundary layer. The difference between
0.90 and 0.93 changes $T_{aw}$ by under 1 % in the chamber and about 2 % at
$\varepsilon=10$; it is not where your error lives.

Now substitute the isentropic relation $T_0/T_\infty = 1+\frac{\gamma-1}{2}M^2$
into Eq. 3.1 and solve for $T_{aw}$:

$$T_{aw} = T_\infty\left[1 + r\frac{\gamma-1}{2}M^2\right]
= T_0\,\frac{1+r\frac{\gamma-1}{2}M^2}{1+\frac{\gamma-1}{2}M^2}$$

> **Eq. 3.2** — variables: $T_{aw}$ [K], $T_0$ chamber stagnation temperature
> [K], $\gamma$ [—], $M$ local Mach number [—], $r$ recovery factor [—].
> Meaning: the temperature the gas "presents" to the wall as a driving
> potential. Assumes: calorically perfect gas, adiabatic stagnation upstream,
> $r$ constant. Fails when: recombination in the boundary layer releases
> chemical energy at the wall (a real effect in H₂/O₂, worth up to a few
> percent), or when the free stream is not isentropic (after a shock in an
> over-expanded nozzle).

The wall heat flux is then

$$q'' = h_g\,(T_{aw}-T_{wg})$$

> **Eq. 3.3** — variables: $q''$ [W/m²], $h_g$ [W/(m²·K)], $T_{aw}$ [K],
> $T_{wg}$ gas-side wall temperature [K]. Meaning: definition of the gas-side
> film coefficient. Assumes: $h_g$ independent of $T_{wg}$ — which is *false*
> in a rocket, because $\sigma$ depends on $T_{wg}$; the equation therefore
> has to be solved iteratively with the wall model. Fails when: film cooling,
> a soot layer, or ablation puts something between the gas and the wall, in
> which case $h_g$ is no longer the resistance that matters.

Two consequences worth internalising:

- **[F] In the chamber, $T_{aw}\approx T_0$.** At $M=0.3$, $r=0.9$, $\gamma=1.2$,
  Eq. 3.2 gives $T_{aw}/T_0 = 0.9990$. The recovery correction is a tenth of a
  percent. Anyone who tells you the chamber wall "sees 3600 K" is right.
- **[F] Deep in a nozzle, $T_{aw}$ is still close to $T_0$ and far above
  $T_\infty$ — and this surprises people.** At $\varepsilon=16$, $\gamma=1.2$:
  $M=3.60$, $T_\infty/T_0=0.435$, but $T_{aw}/T_0 = \mathbf{0.944}$. With
  $T_0=3600$ K the free-stream gas is at 1566 K while the wall's driving
  potential is 3397 K. The recovery factor recovers 90 % of the *kinetic*
  energy, so the adiabatic wall temperature never falls far below the chamber
  stagnation temperature anywhere in the nozzle. **What saves a nozzle
  extension is not a low $T_{aw}$; it is a collapsed $h_g$.** Anyone who
  designs a skirt by assuming the wall "only sees the static temperature" will
  under-predict the flux by a factor of two.

### 3.4 Where the heat flux peaks, and why it is not at the throat

Take Eq. 3.3 and look at the two factors along the engine axis:

- $T_{aw}$ falls monotonically from the injector to the exit, and **slowly**:
  $T_{aw}/T_0 = 0.999$ at $M=0.3$, $0.991$ at $M=1$, $0.956$ at
  $\varepsilon=5$, $0.944$ at $\varepsilon=16$. Over the whole engine it moves
  by about 6 %.
- $h_g$ rises steeply through the convergent section, because it scales with
  local mass flux $\rho u = \dot m/A$, and $A$ collapses by the contraction
  ratio (typically 2–3) over a distance of a few throat radii.

The product therefore peaks near the throat. Quasi-1-D Bartz, which makes $h_g
\propto (A_t/A)^{0.9}$, puts the peak **exactly at** the geometric throat.
Measurement does not agree: calorimeter-chamber data and modern CFD both place
the peak **0.3–1.0 throat radii upstream of the geometric throat**, and put it
5–20 % above the throat value [E; [SP-8087 §2.2], [LRTC Ch. 9]]. Three reasons,
all of them boundary-layer effects that a quasi-1-D area rule cannot see:

1. **The sonic line is curved.** In a throat with a finite wall radius of
   curvature the sonic line is not a plane perpendicular to the axis; at the
   wall it lies upstream of the geometric minimum. The wall therefore reaches
   its maximum local mass flux before the axis does.
2. **Boundary-layer lag.** The layer thins in response to acceleration with a
   spatial lag of order $\delta/(dU/dx)\cdot U$; the thinnest layer — hence the
   steepest wall gradient — occurs slightly upstream of the point of maximum
   free-stream acceleration.
3. **Concave-wall Görtler vortices in the convergent section** augment mixing
   toward the wall upstream of the throat, adding locally to $h_g$.

**[J] Practical consequence:** never place the minimum coolant channel area, the
minimum wall thickness and the geometric throat at the same axial station and
then congratulate yourself. Put the peak-cooling capability half a throat
radius upstream of the throat, and carry a 20 % margin on the peak flux at that
station. That is where liners burn.

### 3.5 Deriving Bartz from the Colburn analogy

[Bartz57] is three pages long and contains no derivation. Here is one; it takes
half a page and it tells you exactly what the correlation assumes.

**Step 1 — start from a turbulent pipe.** The Colburn/Dittus–Boelter
correlation for fully developed turbulent flow in a smooth circular pipe is

$$\mathrm{Nu} = C\,\mathrm{Re}^{0.8}\,\mathrm{Pr}^{0.4}, \qquad C=0.023\text{–}0.026$$

Bartz used $C=0.026$, the upper end, which corresponds to the entrance-region /
rough-wall side of the data. Writing $\mathrm{Nu}=h D/k_g$ and eliminating the
gas conductivity with $k_g = \mu c_p/\mathrm{Pr}$:

$$h = C\,\frac{\mu c_p}{\mathrm{Pr}\,D}\,\mathrm{Re}^{0.8}\,\mathrm{Pr}^{0.4}
   = C\,\frac{\mu c_p}{\mathrm{Pr}^{0.6}}\,\frac{\mathrm{Re}^{0.8}}{D}$$

**Step 2 — put Re in terms of mass flow.** For a circular duct,
$\mathrm{Re}=\rho u D/\mu$ and $\rho u = \dot m/(\pi D^2/4)$, so

$$\mathrm{Re} = \frac{4\dot m}{\pi D \mu}
\qquad\Rightarrow\qquad
h = C\left(\frac{4}{\pi}\right)^{0.8}\frac{\mu^{0.2}c_p}{\mathrm{Pr}^{0.6}}\,
\frac{\dot m^{0.8}}{D^{1.8}}$$

**Step 3 — normalise on the throat.** Two substitutions. First, the choked
throat gives $\dot m = p_0 A_t/c^*$, so $\dot m^{0.8} = (p_0/c^*)^{0.8}A_t^{0.8}
= (p_0/c^*)^{0.8}(\pi D_t^2/4)^{0.8}$. Second, at a station of area $A$,
$D^{1.8} = D_t^{1.8}(D/D_t)^{1.8} = D_t^{1.8}(A/A_t)^{0.9}$. Substituting:

$$h = C\left(\frac{4}{\pi}\right)^{0.8}\left(\frac{\pi}{4}\right)^{0.8}
\frac{\mu^{0.2}c_p}{\mathrm{Pr}^{0.6}}\,
\frac{(p_0/c^*)^{0.8}\,D_t^{1.6}}{D_t^{1.8}\,(A/A_t)^{0.9}}$$

The two bracketed factors are exact reciprocals and cancel identically — which
is why the leading constant in Bartz's equation is *literally the pipe-flow
Colburn coefficient*, 0.026, and not some fitted rocket number. What remains is

$$h_g = \frac{0.026}{D_t^{0.2}}\left(\frac{\mu^{0.2}c_p}{\mathrm{Pr}^{0.6}}\right)_0
\left(\frac{p_0}{c^*}\right)^{0.8}\left(\frac{D_t}{R_u}\right)^{0.1}
\left(\frac{A_t}{A}\right)^{0.9}\sigma$$

> **Eq. 3.4 (Bartz)** — variables: $h_g$ [W/(m²·K)]; $D_t$ throat diameter [m];
> $\mu_0$ stagnation viscosity [Pa·s]; $c_{p0}$ stagnation specific heat
> [J/(kg·K)]; $\mathrm{Pr}_0$ stagnation Prandtl number [—]; $p_0$ chamber
> stagnation pressure [Pa]; $c^*$ characteristic velocity [m/s] — use the
> **delivered** value, because $p_0/c^*$ *is* the throat mass flux $\dot m/A_t$;
> $R_u$ throat upstream wall radius of curvature [m]; $A/A_t$ local area ratio
> [—]; $\sigma$ property correction [—]. Meaning: a fully developed turbulent
> pipe-flow heat-transfer coefficient, re-expressed in rocket variables and
> corrected for property variation and throat curvature. Assumes: attached
> turbulent boundary layer, smooth wall, quasi-1-D area distribution, no film
> cooling, no deposits, properties frozen at the stagnation composition.
> Fails when: any of those assumptions is broken — see §3.7.

The only term that is not derived above is $(D_t/R_u)^{0.1}$. Bartz added it
empirically to capture the effect of wall curvature on the throat boundary
layer: a tight throat radius (small $R_u$) accelerates the wall flow harder,
thins the layer further and raises $h_g$. The exponent is small, so the term is
weak — halving $R_u/R_t$ from 1.5 to 0.75 raises $h_g$ by only $2^{0.1}=7$ % —
but the *sign* is the useful thing: **sharp throats run hotter**. Module 06's
$R_u/R_t$ choice is therefore a heat-transfer decision as much as a
discharge-coefficient decision.

Two more forms of Eq. 3.4 are worth carrying:

- **Scaling.** $h_g \propto p_c^{0.8} D_t^{-0.2}$. Doubling chamber pressure
  raises the throat heat flux by 74 %; halving the engine size (at constant
  $p_c$) raises it by 15 %. **Small engines at high pressure are the hardest
  thermal problem in propulsion**, which is exactly why a 25 kN
  high-$p_c$ upper-stage engine is disproportionately harder to cool than a
  2000 kN booster engine at the same pressure.
- **Total heat load.** $Q=\int q''dA$. Since $q''\propto A^{-0.9}$ and
  $dA \propto D\,dx$, the integrand falls slowly; a real engine puts roughly
  40–60 % of its total heat load in the chamber barrel, 15–25 % in the throat
  region, and the rest in the divergent section, even though the *flux* is 3–5×
  higher at the throat.

### 3.6 The property correction $\sigma$

Eq. 3.4 evaluates $\mu$, $c_p$ and $\mathrm{Pr}$ at chamber stagnation
conditions. The boundary layer is nowhere near those conditions: it runs from
$T_{wg}\approx800$ K at the wall to $T_\infty$ in the free stream, and gas
density and viscosity change by a factor of several across it. The standard fix
is a **reference-temperature** method: re-evaluate the density and viscosity in
the Reynolds number at an arithmetic-mean film temperature

$$T_{am}=\tfrac{1}{2}\left(T_{wg}+T_\infty\right)$$

and form the ratio of the resulting coefficient to the stagnation-property one.
Since $h\propto \rho^{0.8}\mu^{0.2}$ from Step 2 above,

$$\sigma = \left(\frac{\rho_{am}}{\rho_\infty}\right)^{0.8}
\left(\frac{\mu_{am}}{\mu_0}\right)^{0.2}$$

At constant static pressure across the boundary layer, $\rho\propto1/T$, and for
combustion products over 1000–3600 K a power law $\mu\propto T^{0.6}$ fits well.
Write $B\equiv 1+\frac{\gamma-1}{2}M^2 = T_0/T_\infty$ and
$A\equiv T_{am}/T_\infty=\tfrac12\!\left(\frac{T_{wg}}{T_0}B+1\right)$. Then
$\rho_{am}/\rho_\infty = 1/A$ and $\mu_{am}/\mu_0=(T_{am}/T_0)^{0.6}=(A/B)^{0.6}$,
so

$$\sigma = A^{-0.8}\,A^{0.12}B^{-0.12} = \frac{1}{A^{0.68}\,B^{0.12}}$$

i.e.

$$\sigma = \left[\frac{1}{2}\frac{T_{wg}}{T_0}\left(1+\frac{\gamma-1}{2}M^2\right)
+\frac{1}{2}\right]^{-0.68}\left(1+\frac{\gamma-1}{2}M^2\right)^{-0.12}$$

> **Eq. 3.5** — variables: $\sigma$ [—], $T_{wg}$ gas-side wall temperature [K],
> $T_0$ [K], $\gamma$ [—], $M$ [—]. Meaning: corrects a stagnation-property
> coefficient for the real density and viscosity inside the boundary layer.
> Assumes: $\rho\propto T^{-1}$ at constant pressure, $\mu\propto T^{0.6}$,
> arithmetic-mean reference temperature. Fails when: the wall is hot enough
> that $T_{wg}/T_0 \to 1$ (then $\sigma\to1$ and the correction is pointless),
> or the gas composition changes across the layer (recombination), or the wall
> is transpiration-cooled.

Numbers to keep in your head: for a cold copper wall in a chamber
($T_{wg}/T_0\approx0.22$, $M\approx0.3$), $\sigma\approx1.39$; at the throat
($M=1$), $\sigma\approx1.37$; at $\varepsilon=5$ ($M\approx2.8$),
$\sigma\approx1.19$. **The correction is worth 20–40 %, always upward for a
cold wall, and it is not optional.** Note also that $\sigma$ depends on
$T_{wg}$, which depends on $q''$, which depends on $h_g$: Eq. 3.3–3.5 plus a
wall model form a small fixed-point problem that you iterate. Two or three
sweeps converge to better than 1 K.

### 3.7 How wrong is Bartz, and in which direction

[Bartz57] itself claims agreement "within about 20 %" with the data Bartz had.
The modern consensus, from calorimeter chambers and from CFD validation
campaigns, is:

| region / condition | Bartz error | direction |
|---|---|---|
| Throat, clean wall, no film cooling | ±20–30 % | either |
| Chamber barrel near the injector | 30–100 % | **under**-predicts (injector-driven recirculation, streaking, jet impingement — the flow is not a developed pipe flow) |
| Chamber barrel with a fuel-rich wall layer | 50–90 % | **over**-predicts (the wall never sees core gas) |
| Divergent section beyond $\varepsilon\approx5$–10 | 30–50 % | **over**-predicts (the boundary layer is thick, growing, and no longer pipe-like; chemistry is frozen and $c_p$ is wrong) |
| Any film-cooled surface | factor 2–5 | **over**-predicts grossly (Bartz has no concept of a coolant film) |
| Sooting hydrocarbon after a few seconds | factor 1.5–3 | **over**-predicts (the carbon deposit is the dominant resistance — see §3.9) |
| $\gamma$ far from 1.2 (cold gas, monopropellant) | 20–40 % | under-predicts for high $\gamma$; the $\mathrm{Pr}$ and $c_p$ inputs are the culprit, not the form |

> **[J]** Bartz is a *sizing* tool. It tells you whether you need 90 or 180
> channels, whether the liner must be copper or can be steel, and how much
> coolant $\Delta p$ to budget. It does not tell you whether a specific engine
> will survive a specific 500-second run. Nobody has ever certified a thrust
> chamber on Bartz alone, and [Bartz57] does not claim you could.

**Modern alternatives, honestly rated:**

- **CFD (RANS with a low-Reynolds wall treatment, or wall-modelled LES).** The
  standard tool since the late 1990s. Gets the peak location and the effect of
  contour right; still needs the turbulent Prandtl number as an input, and
  $\mathrm{Pr}_t$ between 0.7 and 0.9 moves the throat flux by 15 %. Good CFD
  reproduces calorimeter data to 10–15 %; bad CFD reproduces it to 50 % and
  looks equally colourful [M].
- **Cinjarew (Ieвлев/Cinjarew family, Russian design practice).** A correlation
  of the same Colburn ancestry but with a different property grouping and an
  explicit dependence on the combustion-products composition rather than on
  $c^*$; widely used in Russian and Ukrainian engine houses and reproduced in
  [Zandbergen]. Tends to give 10–20 % lower throat fluxes than Bartz for
  hydrocarbon engines, which is one reason Russian and American published
  fluxes for comparable engines do not agree.
- **Ievlev's integral boundary-layer method.** Solves the compressible
  turbulent boundary-layer integral equations along the contour instead of
  assuming pipe flow. Physically better in the divergent section, where Bartz's
  developed-pipe assumption is worst; requires a contour, not just an area
  ratio.
- **Empirical scaling from your own test data.** The method that actually
  certifies engines. Fire a **calorimeter chamber** — a heavy-wall,
  water-cooled, axially segmented chamber with measured coolant flow and
  $\Delta T$ per segment — at the design point, back out $q''(x)$, and fit
  $h_g^{meas}/h_g^{Bartz}$ as a function of axial station. That correction
  factor, typically 0.6–0.9 in a film-cooled kerolox chamber and 1.0–1.3 in a
  clean hydrogen chamber, is then carried through the rest of the program
  [M, [SP-8087 §3.1]].

### 3.8 The wall: steady 1-D resistance chain

In steady state, the same heat flux passes through every layer between the gas
and the coolant. Treating each layer as a plane wall (valid when the wall is
thin compared with the local radius, which it always is: $t_w/R \sim 0.01$):

$$q'' = h_g(T_{aw}-T_{wg}) = \frac{k}{t_w}(T_{wg}-T_{wc}) = h_c(T_{wc}-T_{co})$$

Eliminating the two unknown wall temperatures gives the chain form

$$q'' = \frac{T_{aw}-T_{co}}{\dfrac{1}{h_g}+\dfrac{t_w}{k}+\dfrac{1}{h_c}}
\;=\;\frac{T_{aw}-T_{co}}{R''_{tot}}$$

> **Eq. 3.6** — variables: $q''$ [W/m²]; $T_{aw}$ [K]; $T_{co}$ coolant bulk
> temperature [K]; $h_g,h_c$ [W/(m²·K)]; $t_w$ [m]; $k$ [W/(m·K)]. Meaning:
> series thermal resistances add. Assumes: steady state, 1-D conduction, no
> internal heat generation, constant $k$, perfect contact between layers, and
> $h_c$ referenced to the *plain* wall area (a ribbed or finned channel needs a
> fin-efficiency multiplier — Module 11). Fails when: transient (start-up,
> throttle step), when there is a contact resistance at a braze or bond line,
> or when circumferential conduction into channel lands matters (it does; the
> 1-D answer is conservative).

Then, walking back down the chain,

$$T_{wg}=T_{aw}-\frac{q''}{h_g},\qquad
\Delta T_{wall}=\frac{q''t_w}{k},\qquad
T_{wc}=T_{wg}-\Delta T_{wall}$$

> **Eq. 3.7** — the recovery of the wall temperatures from the flux. Note the
> order of operations: you do **not** get to pick $T_{wg}$; it is an *output*
> of the chain. Assumes as Eq. 3.6.

**Where the wall temperature sits, and why the material matters.** Take a
representative high-pressure throat: $T_{aw}=3570$ K, $T_{co}=300$ K,
$h_g=2.0\times10^4$, $h_c=1.0\times10^5$ W/(m²·K), $t_w=1$ mm.

| material | $k$ [W/(m·K)] | $R''_{wall}$ [m²K/W] | share of $R''_{tot}$ | $\Delta T_{wall}$ at 50 MW/m² |
|---|---|---|---|---|
| NARloy-Z (Cu-Ag-Zr) | ~300 | $3.3\times10^{-6}$ | 4.7 % | 167 K |
| GRCop-42 (Cu-Cr-Nb) | ~290 | $3.4\times10^{-6}$ | 4.9 % | 172 K |
| Nickel (electroformed closeout) | ~70 | $1.4\times10^{-5}$ | 18 % | 714 K |
| Inconel 718 | ~25 | $4.0\times10^{-5}$ | 40 % | 2000 K (impossible) |
| 304 stainless | ~20 | $5.0\times10^{-5}$ | 45 % | 2500 K (impossible) |

Read the last column again. **At 50 MW/m², a 1 mm Inconel wall would need a
2000 K temperature drop across it.** There is no such wall: the hot face melts
first. The high-conductivity liner is not an optimisation, it is an
enabling requirement, and this single table explains why every high-$p_c$
regeneratively cooled chamber built since the 1960s has a copper-alloy liner.

Two corollaries [F]:

1. **Thin wins, linearly.** $\Delta T_{wall}\propto t_w$. Halving the liner
   thickness halves the gradient and therefore halves the thermal stress
   (§3.10). It also *raises* $q''$ slightly (the total resistance falls), which
   is a fair trade because the flux is carried away by the coolant while the
   gradient is carried by the metal. RS-25 and modern GRCop chambers run
   0.6–1.0 mm hot walls; the floor is set by manufacturing tolerance,
   erosion/blanching allowance and hoop-pressure capability, not by heat
   transfer.
2. **The gas-side and coolant-side films dominate the chain, not the metal.**
   In the copper row above, the wall is 5 % of the total resistance. If you want
   a lower $T_{wg}$, the lever is $h_c$ (channel velocity, hydraulic diameter,
   surface enhancement) or a barrier on the gas side (film cooling, a deposit,
   a thermal barrier coating) — not a thicker or better metal.

### 3.9 Heat flux levels by engine

Absolute numbers, so you have a scale. **A caution demanded by the house
style: the engine reference file `reference/_verify-liquid.md` carries
architecture, pressures, materials and cooling schemes for every engine below,
and those are what the engine-specific statements here rest on. It does not
carry wall heat-flux figures for any engine.** The fluxes quoted here therefore
come from the open heat-transfer literature ([SB §8], [HH §4], [SP-8087],
[Biggs89]) and from the Bartz calculations reproduced in §5, and should be
treated as **±30 % order-of-magnitude figures, not as engine data**.

| engine | propellants | $p_c$ [bar] | $D_t$ [m] | peak throat $q''$ [MW/m²] | note |
|---|---|---|---|---|---|
| V-2 | LOX/ethanol-water | 15 | ~0.4 | 1–2 | heavy film cooling; the water in the fuel is a thermal moderator [_verify-liquid] |
| RL10A-3-3A | LOX/LH₂ | 32.8 | ~0.13 | 8–15 | expander cycle: the heat load *is* the power source [_verify-liquid] |
| F-1 | LOX/RP-1 | ~70 | ~0.89 | 8–16 | Bartz alone predicts ~31; soot + film cooling roughly halve it |
| Merlin 1D | LOX/RP-1 | 97 | ~0.26 | 25–45 | milled channels, RP-1 cooled, film-cooled wall [_verify-liquid] |
| Vulcain 2 | LOX/LH₂ | 117 | ~0.29 | 40–70 | film cooling *added* to the lower nozzle vs Vulcain 1 because the richer 6.1 MR raised wall flux [_verify-liquid] |
| RS-25 | LOX/LH₂ | 206 | ~0.26 | **100–160** | the benchmark; NARloy-Z liner, 390 milled channels [_verify-liquid] |
| Raptor 2/3 | LOX/CH₄ | 300–330 **(company claim)** | not published | plausibly >160 | flux scales as $p_c^{0.8}$, so Raptor should exceed RS-25; **no public flux figure exists and SpaceX has published none** [_verify-liquid] |

The RS-25 figure is the one to memorise. **100–160 MW/m² is 10–16 kW per square
centimetre** — about 40 times the flux at the surface of the sun's photosphere,
sustained for 500 seconds, through a copper sheet one millimetre thick, and the
engine was designed to do it 55 times. The Bartz calculation in §5 lands on
136 MW/m² for the RS-25 throat, squarely inside the quoted band, which is the
single best argument that a 1957 pipe-flow analogy is not a bad first guess.

**Why the F-1 is so much cooler than a naive scaling suggests** is worth a
paragraph, because it is the mechanism behind half the hydrocarbon engines ever
built. RP-1 burned fuel-rich near the wall deposits a **carbon (coke) layer**
20–100 µm thick with a conductivity of roughly 0.5–1.5 W/(m·K) — three hundred
times worse than copper. A 50 µm deposit contributes $R''\approx5\times10^{-5}$
m²K/W, which is *larger than $1/h_g$*. Soot is therefore not a nuisance: it is a
thermal barrier coating that the engine grows for itself, and kerolox engines
are designed around its presence. It is also unreliable — it spalls, it varies
run to run, and an engine that depends on it has a heat flux that changes with
time. Methane does not coke appreciably, which is one of the underappreciated
reasons methalox chambers run hotter walls than kerolox chambers at the same
$p_c$ [J].

### 3.10 Thermal stress and the low-cycle-fatigue failure mode

Consider a flat plate of thickness $t_w$ with a linear through-thickness
temperature distribution, hot face at $T_{wg}$, cold face at $T_{wc}$, and the
in-plane dimensions fully constrained (the liner is attached to a much stiffer,
much cooler jacket and cannot expand in-plane). Take the mid-plane as the
reference temperature. A fibre at temperature $T$ wants to strain by
$\alpha(T-\bar T)$ and is prevented; in biaxial (plane) constraint the
resulting stress is

$$\sigma_{th} = \frac{E\,\alpha\,(T-\bar T)}{1-\nu}$$

The factor $1/(1-\nu)$ is the biaxial-constraint stiffening: both in-plane
directions are restrained, and each contributes a Poisson coupling into the
other. The extreme fibre is at $T-\bar T = \pm\Delta T_{wall}/2$, so the
peak magnitude is

$$\boxed{\;\sigma_{th}=\frac{E\,\alpha\,\Delta T_{wall}}{2(1-\nu)}
=\frac{E\,\alpha\,q''\,t_w}{2\,k\,(1-\nu)}\;}$$

> **Eq. 3.8** — variables: $\sigma_{th}$ [Pa]; $E$ Young's modulus at
> temperature [Pa]; $\alpha$ linear thermal expansion coefficient [1/K];
> $\Delta T_{wall}=q''t_w/k$ [K]; $\nu$ Poisson's ratio [—]. Meaning: the
> in-plane stress generated by a linear gradient in a fully constrained plate;
> compressive on the hot face, tensile on the cold face. Assumes: linear
> elasticity, linear temperature profile, full in-plane constraint, temperature-
> independent properties, no pressure or mechanical load superposed. Fails
> when: $\sigma_{th}>\sigma_y$ — which it always is for a rocket liner — after
> which the elastic answer is an *index*, not a stress, and you must do an
> elastic-plastic cyclic analysis.

The second form makes the design levers explicit: $\sigma_{th}\propto q''
t_w/k$ and $\propto E\alpha$. Copper alloys win on both groupings — high $k$,
low $E$ — despite a large $\alpha$. The material figure of merit for a cooled
liner is therefore

$$\mathrm{FoM} = \frac{k\,(1-\nu)\,\sigma_y}{E\,\alpha}$$

which is high for NARloy-Z and GRCop and about **thirty times lower for
Inconel 718**. That single ratio is why copper.

**But copper does not survive elastically either.** Section 5, WE3, computes
$\sigma_{th}\approx230$ MPa for a 1 mm NARloy-Z wall at 50 MW/m². NARloy-Z's
0.2 % yield at 800 K is roughly 100–140 MPa [E, [GRCop]; [MMPDS] for the
generic Cu-alloy family]. The liner therefore **yields in compression on every
start** and **yields in tension on every shutdown**, when the gradient reverses
as the coolant continues to flow through a no-longer-heated wall. This is
classical **low-cycle fatigue**: a small number of large plastic strain
excursions, governed by a Coffin–Manson law $\Delta\varepsilon_p N_f^{\,m}=C$
with $m\approx0.5$–0.6, not by an endurance limit.

**The "dog-house" failure mode.** The observed consequence in the RS-25 main
combustion chamber, and in every copper-liner chamber tested to life, is
distinctive enough to have its own name. Over repeated thermal cycles the
channel land between two coolant channels ratchets: each cycle the hot face is
compressed plastically at temperature and stretched on cooldown, so the liner
between channels progressively thins and bulges *into the gas stream*, taking
the cross-sectional shape of a dog kennel — flat sides, arched roof. The
sequence is:

> **mechanism** cyclic plastic strain from the reversing through-thickness
> gradient → **symptom** progressive bulging and thinning of the hot wall over
> the channel, measurable as a change in channel cross-section and a local
> reduction in coolant flow → **evidence** post-test borescope and sectioning
> showing the characteristic dog-house channel profile, plus a rising liner
> temperature trend across the life of the unit → **fix** run a lower hot-wall
> $\Delta T$ (thinner liner, higher $h_c$), reduce the strain range (lower the
> start/shutdown gradient reversal by trimming the shutdown coolant flow), and
> accept a hard cycle-life limit with a mandatory liner replacement interval.

The RS-25 MCC liner life was in fact a life-limiting item across the Shuttle
program, driving inspection and replacement intervals [H, [Biggs89]; the
design-side treatment is [SP-8087 §3.5], which was written *because* of this
class of failure]. The general lesson [F]: **for a regeneratively cooled
liner, life is set by strain range, not by peak temperature**, and the two are
optimised differently. A design that lowers peak $T_{wg}$ by thickening the
wall makes the life *worse*.

Superposed on $\sigma_{th}$ is the hoop stress from the pressure difference
across the liner (the coolant is at 1.2–1.6 × $p_c$, so the liner is squeezed
*inward*), plus the mechanical restraint from the jacket. In a real analysis all
three are combined; Eq. 3.8 alone typically accounts for 70–85 % of the total
equivalent strain range in a copper liner [J].

### 3.11 Transient heating at start, and the heat-sink limit

At $t=0$ the wall is at ambient and the coolant may not yet be flowing at rated
conditions. For the first few tens of milliseconds the wall behaves as a solid
absorbing heat, not as a resistance passing it. The relevant solution is the
**semi-infinite solid with a step in surface heat flux**:

$$T_s(t)-T_i = \frac{2q''}{k}\sqrt{\frac{\alpha_d t}{\pi}},
\qquad \alpha_d=\frac{k}{\rho_s c_s}$$

> **Eq. 3.9** — variables: $T_s$ surface temperature [K]; $T_i$ initial uniform
> temperature [K]; $q''$ constant applied flux [W/m²]; $k$ [W/(m·K)];
> $\alpha_d$ thermal diffusivity [m²/s]; $t$ time [s]. Meaning: how fast an
> uncooled wall heats up under a fixed flux. Assumes: constant properties,
> constant flux, a body thick enough that the back face has not felt the pulse.
> Fails when: the thermal wave reaches the back face — i.e. when
> $2\sqrt{\alpha_d t} \gtrsim L$, after which the wall heats bodily and the
> temperature rise accelerates. Source: [Bergman §5.7].

Inverting for the time to reach an allowable surface temperature:

$$t_{surv} = \frac{\pi}{\alpha_d}\left(\frac{k\,\Delta T_{allow}}{2q''}\right)^2
= \frac{\pi\,\rho_s c_s k \,\Delta T_{allow}^2}{4\,q''^2}$$

> **Eq. 3.10** — the heat-sink survival time. Note the two scalings that matter:
> $t_{surv}\propto q''^{-2}$ (halving the flux quadruples the run time) and
> $t_{surv}\propto \rho_s c_s k$ — the **thermal effusivity squared** over
> $q''^2$. The material property group $\sqrt{\rho_s c_s k}$, not $k$ alone, is
> what makes a good heat sink. Copper is good at this for the same reason it is
> good at everything else thermal; so, surprisingly, is graphite.

Two characteristic times bound the transient:

- **Diffusion time through the wall**, $t_d = L^2/\alpha_d$. For 1 mm of copper
  ($\alpha_d\approx9.3\times10^{-5}$ m²/s), $t_d=11$ ms. For 1 mm of Inconel
  ($7.0\times10^{-6}$ m²/s), $t_d=143$ ms. **A copper liner reaches steady state
  in about ten milliseconds; a nickel-alloy one takes an eighth of a second.**
  That is why start transients are a copper-liner non-event and a nickel-alloy
  headache, and why the coolant must be flowing *before* the igniter fires.
- **Biot number**, $\mathrm{Bi}=h_g t_w/k$. For copper at $h_g=2\times10^4$,
  $t_w=1$ mm: $\mathrm{Bi}=0.067$ — the wall is nearly isothermal
  through-thickness on a transient timescale, so a lumped model works for
  start-up. For Inconel, $\mathrm{Bi}=0.8$ and it does not.

**[J] The practical start-up rule** is that fuel lead (fuel valve opens first)
and coolant priming exist precisely so the wall never experiences the steady
flux while the coolant channel is voided. The classic start failure is not
"the engine got too hot" but "a channel was still full of gaseous coolant when
the flux arrived", which drops $h_c$ by an order of magnitude for 50 ms and
melts a strip of liner the width of one channel.

### 3.12 Radiation from the combustion gases

Radiating species in rocket exhausts are **H₂O** and **CO₂** (band radiators,
vibration-rotation bands in the 1.4–20 µm range), **CO** and **OH** (weaker),
and **soot** (a grey continuum, dominant when present). Diatomic homonuclear
species — H₂, N₂, O₂ — do not radiate: no dipole moment, no bands. That fact
alone determines the answer for hydrogen engines.

The engineering method is Hottel's: the emissivity of an isothermal gas volume
is charted as $\varepsilon_g(T, p_iL_b)$, where $p_i$ is the partial pressure
of the radiating species and $L_b$ the **mean beam length**, an equivalent
path length that converts a three-dimensional volume into a one-dimensional
absorption problem. For a long cylinder radiating to its side wall,
$L_b\approx0.95\,D$; the general rule is $L_b\approx3.6V/A_s$. Hottel's charts
are read for H₂O and CO₂ separately and combined with a band-overlap correction
$\Delta\varepsilon$:

$$\varepsilon_g = \varepsilon_{H_2O}\,C_{H_2O} + \varepsilon_{CO_2}\,C_{CO_2}
- \Delta\varepsilon$$

The wall then receives

$$q''_{rad}=\varepsilon_w'\,\varepsilon_g\,\sigma_{SB}\left(T_g^4 - T_{wg}^4\right)$$

> **Eq. 3.11** — variables: $q''_{rad}$ [W/m²]; $\varepsilon_g$ gas emissivity
> [—]; $\varepsilon_w'$ effective wall emissivity factor, $\approx(\varepsilon_w+1)/2$
> for a grey wall in a gas-filled enclosure [—]; $\sigma_{SB}=5.670\times10^{-8}$
> W/(m²K⁴); $T_g$ gas temperature [K]; $T_{wg}$ [K]. Meaning: net radiant
> exchange between an isothermal grey gas and its bounding wall. Assumes:
> isothermal gas volume, grey gas, grey diffuse wall, no scattering. Fails
> when: the gas has a strong temperature gradient (it does in the nozzle — the
> chamber assumption is much better than the nozzle one), or when soot loading
> is high enough to make the medium optically thick and the "mean beam length"
> idea meaningless.

Since $T_{wg}\approx800$ K and $T_g\approx3600$ K, $T_{wg}^4/T_g^4=0.0024$: the
wall's back-radiation is negligible and $q''_{rad}\approx\varepsilon_g\sigma_{SB}T_g^4$.
Useful values at $T_g=3600$ K, where $\sigma_{SB}T_g^4 = 9.52$ MW/m²:

| combination | $\varepsilon_g$ (chamber, typical) | $q''_{rad}$ [MW/m²] | as % of chamber convective |
|---|---|---|---|
| LOX/RP-1, fuel-rich wall, sooty | 0.3–0.6 | 2.9–5.7 | **10–25 %** |
| LOX/RP-1, core stoichiometry, little soot | 0.10–0.20 | 1.0–1.9 | 5–10 % |
| LOX/CH₄ | 0.10–0.25 | 1.0–2.4 | 5–12 % |
| N₂O₄/MMH | 0.10–0.20 | 1.0–1.9 | 5–10 % |
| LOX/LH₂ (H₂O only, no carbon) | 0.05–0.10 | 0.5–1.0 | **<1 % at the throat** |

> **[J] When to include radiation.** Include it in the chamber barrel for any
> carbon-bearing propellant; you will change the answer by 10–20 %. Skip it at
> the throat of a hydrogen engine — you would be adding 0.5 MW/m² to 130, which
> is inside the noise of $h_g$ itself. Always include it for a
> radiation-cooled or ablative chamber, where it is a first-order term because
> the convective coefficient is low and the wall is hot. And never include it
> twice: if you have calibrated $h_g$ against calorimeter data, the measured
> flux already contains the radiation.

---

## 4. Typical engineering ranges

| quantity | typical range | low end | high end |
|---|---|---|---|
| Gas-side coefficient $h_g$, chamber | $3\times10^3$–$1.5\times10^4$ W/(m²·K) | low-$p_c$ storable thruster | RS-25 class |
| Gas-side coefficient $h_g$, throat | $8\times10^3$–$6\times10^4$ W/(m²·K) | RL10 at 33 bar | RS-25 at 206 bar (~4.9×10⁴) |
| Throat heat flux $q''$ | 1–160 MW/m² | V-2 (1–2) | RS-25 (100–160); Raptor claimed higher |
| Chamber-barrel flux / throat flux | 0.4–0.7 | — | — |
| Recovery factor $r$ (turbulent) | 0.89–0.93 | — | — |
| $T_{aw}$ / $T_c$, chamber | 0.998–1.000 | — | — |
| $T_{aw}$ / $T_c$, $\varepsilon=16$ exit | 0.93–0.95 | — | — |
| $T_\infty$ / $T_c$, $\varepsilon=16$ exit | 0.42–0.45 | — | — |
| Bartz $\sigma$ (cold wall) | 1.1–1.45 | supersonic, hot wall | chamber, cold copper wall |
| Gas-side wall temperature $T_{wg}$, copper liner | 700–900 K | conservative long-life design | short-life / expendable |
| $T_{wg}$, nickel-alloy tube wall | 900–1100 K | — | F-1 tube crown |
| $T_{wg}$, radiation-cooled niobium skirt | 1400–1650 K | — | MVac niobium (cherry-red is nominal) |
| Hot-wall thickness $t_w$ | 0.5–1.5 mm | AM GRCop liner | brazed tube wall |
| Liner conductivity $k$ | 20–350 W/(m·K) | stainless | pure Cu / GRCop / NARloy-Z |
| $\Delta T_{wall}$ across a copper liner | 100–250 K | — | — |
| Coolant-side coefficient $h_c$ | $1\times10^4$–$3\times10^5$ W/(m²·K) | RP-1, modest velocity | supercritical H₂ at high $G$ |
| Thermal stress $\sigma_{th}$, copper liner | 150–350 MPa | — | (yield is 100–140 MPa: plastic) |
| Copper-liner LCF life | 50–500 cycles | high-strain design | RS-25 MCC design intent |
| Soot deposit thickness (kerolox) | 20–100 µm | — | — |
| Soot deposit conductivity | 0.5–1.5 W/(m·K) | — | — |
| Gas emissivity $\varepsilon_g$ | 0.05–0.6 | LOX/LH₂ | sooty kerolox wall layer |
| Copper thermal diffusivity $\alpha_d$ | $\sim9.3\times10^{-5}$ m²/s | — | — |
| Wall diffusion time, 1 mm | 0.011 s (Cu) – 0.14 s (Inconel) | — | — |

Numbers for real engines are traceable to `reference/_verify-liquid.md` for
architecture, pressure and materials; the flux figures carry the caveat stated
in §3.9.

---

## 5. Worked examples

All four use the **Module 03 / 06 reference engine, RE-500**: LOX/RP-1,
$F_{SL}=500$ kN, $p_c=100$ bar $=1.00\times10^7$ Pa at the nozzle stagnation
station, $T_0=3600$ K, $\gamma=1.20$, $\mathcal{M}=22.0$ kg/kmol,
$R=377.93$ J/(kg·K), $\varepsilon=16$, $\varepsilon_c=2.0$,
$A_t=0.030582$ m², $D_t=197.33$ mm, $R_u/R_t=1.5$.

**A note on $c^*$, which trips people up.** Module 03 computed
$c^*_{ideal}=1798.6$ m/s and assumed $\eta_{c^*}=0.96$, so
$c^*_{del}=1726.6$ m/s. Bartz's $(p_0/c^*)$ term **is the throat mass flux
$\dot m/A_t$**, so the *delivered* $c^*$ is the correct input; using
$c^*_{ideal}$ under-states the mass flux by 4 % and $h_g$ by 3.3 %. With
$c^*_{del}$, $\dot m = p_cA_t/c^*_{del} = 177.1$ kg/s (Module 06 quoted 170.0
kg/s on the ideal $c^*$; the 4 % difference is this same bookkeeping).

### WE1 — Bartz $h_g$ and heat flux at three stations

**Given.** Gas transport properties at chamber stagnation (from a CEA run,
Module 04, LOX/RP-1 at MR 2.35, 100 bar):
$\mu_0=1.00\times10^{-4}$ Pa·s. Take $c_{p0}=\gamma R/(\gamma-1)
= 1.20\times377.93/0.20 = 2267.6$ J/(kg·K) and
$\mathrm{Pr}_0 = 4\gamma/(9\gamma-5) = 4.80/5.80 = 0.8276$ (the standard
Eucken-type estimate for polyatomic combustion products; CEA's own value for
this mixture is 0.81–0.84, so this is inside the uncertainty).
Assume a first-guess hot-wall temperature $T_{wg}=800$ K.

**Step 1 — geometry.**
$$R_t=\sqrt{A_t/\pi}=\sqrt{0.030582/3.14159}=0.098663\ \mathrm{m},\qquad
D_t=0.197328\ \mathrm{m}$$
$$R_u = 1.5\,R_t = 0.147996\ \mathrm{m}
\quad\Rightarrow\quad \left(\frac{D_t}{R_u}\right)^{0.1}
=(1.3333)^{0.1}=1.02914$$

**Step 2 — the station-independent group.**
$$\frac{0.026}{D_t^{0.2}}=\frac{0.026}{0.197328^{0.2}}=\frac{0.026}{0.72386}=0.035919$$
$$\frac{\mu_0^{0.2}c_{p0}}{\mathrm{Pr}_0^{0.6}}
=\frac{(1.00\times10^{-4})^{0.2}\times 2267.6}{0.8276^{0.6}}
=\frac{0.158489\times2267.6}{0.89345}=402.28$$
$$\left(\frac{p_0}{c^*}\right)^{0.8}=\left(\frac{1.00\times10^{7}}{1726.6}\right)^{0.8}
=(5792.4)^{0.8}=1042.6$$

Product of the three, times the curvature factor:
$$K_0 = 0.035919\times402.28\times1042.6\times1.02914 = 1.5502\times10^{4}$$
so that $h_g = K_0 (A_t/A)^{0.9}\,\sigma$ in W/(m²·K).

**Step 3 — Mach numbers.** From Module 02's area relation at $\gamma=1.20$:
$A/A_t=2.0$ subsonic $\Rightarrow M=0.3122$; throat $M=1$;
$A/A_t=5.0$ supersonic $\Rightarrow M=2.7850$.

**Step 4 — $B$, $\sigma$, $T_{aw}$, $h_g$, $q''$ at each station.**
With $B=1+0.1M^2$, $A=\tfrac12(0.22222\,B)+\tfrac12$,
$\sigma=A^{-0.68}B^{-0.12}$, $T_{aw}=T_0(1+0.09M^2)/B$ (using $r=0.9$):

| station | $A/A_t$ | $M$ | $B$ | $\sigma$ | $(A_t/A)^{0.9}$ | $h_g$ [W/(m²K)] | $T_{aw}$ [K] | $q''$ [MW/m²] |
|---|---|---|---|---|---|---|---|---|
| chamber barrel | 2.0 | 0.3122 | 1.00975 | 1.3945 | 0.53589 | **11 400** | 3596.5 | **31.9** |
| throat | 1.0 | 1.0000 | 1.10000 | 1.3651 | 1.00000 | **20 830** | 3567.3 | **57.6** |
| $\varepsilon=5$ | 5.0 | 2.7850 | 1.77568 | 1.1928 | 0.23117 | **4 276** | 3442.7 | **11.3** |

Worked longhand for the throat, so the arithmetic is visible:
$B=1.10$; $A=\tfrac12(0.22222\times1.10)+\tfrac12 = 0.12222+0.5=0.62222$;
$A^{0.68}=e^{0.68\ln 0.62222}=e^{0.68\times(-0.47437)}=e^{-0.32257}=0.72427$;
$B^{0.12}=e^{0.12\times0.09531}=1.01150$;
$\sigma = 1/(0.72427\times1.01150)=1.3651$.
$h_g = 1.5502\times10^4\times1.0\times1.3651 = 2.0830\times10^4$ W/(m²·K).
$T_{aw}=3600\times(1+0.09)/1.10 = 3600\times0.99091=3567.3$ K.
$q''=2.0830\times10^4\times(3567.3-800)=5.764\times10^7$ W/m² $=57.6$ MW/m².

**Step 5 — add radiation in the chamber.** With a fuel-rich sooty wall layer,
$\varepsilon_g\approx0.35$: $q''_{rad}=0.35\times5.6704\times10^{-8}\times
(3600^4-800^4)=3.33$ MW/m². That is **9.5 %** of the chamber total
$(31.9+3.3)=35.2$ MW/m². At the throat the same 3.3 MW/m² would be 5.5 % of the
total, and the gas there is cooler and less sooty, so 3–4 % is the honest
figure.

> **Sanity check.** Repeat the whole calculation for the RS-25 throat
> ($p_c=206.4$ bar, $\gamma=1.19$, $\mathcal{M}=13.5$, $T_0=3600$ K,
> $c^*_{del}=2287$ m/s, $D_t=0.269$ m from $A_t=F_{vac}/(C_F p_c)$,
> $R_u=R_t$, $T_{wg}=800$ K): $c_{p0}=3857$ J/(kg·K), $\mathrm{Pr}_0=0.834$,
> $\sigma=1.3666$, $h_g=4.93\times10^4$ W/(m²·K), $T_{aw}=3568.8$ K,
> $q''=\mathbf{136\ MW/m^2}$ — inside the 100–160 MW/m² band quoted for the
> RS-25 in §3.9. Now repeat for the **F-1** ($p_c=70$ bar, $D_t=0.887$ m,
> $c^*=1690$ m/s, $R_u=0.75D_t$): Bartz gives $q''=31$ MW/m², against a
> literature figure of 8–16 MW/m². **Bartz over-predicts the F-1 by a factor of
> two**, and the reason is in §3.9: the F-1 wall is behind a fuel-rich film and
> a carbon deposit that Bartz knows nothing about. Two engines, same equation,
> one right and one wrong by 2×, and the difference is not the equation — it is
> whether the assumption of a clean wall in contact with core gas holds. That
> is the entire lesson of this module.

### WE2 — Wall-temperature chain for a 1 mm copper-alloy liner

**Given.** RE-500 throat. Hot wall: NARloy-Z or GRCop-42, $t_w=1.00$ mm,
$k=300$ W/(m·K) (hot value; room-temperature NARloy-Z is ~316). Coolant: RP-1
at bulk $T_{co}=300$ K with a coolant-side coefficient $h_c=5.0\times10^4$
W/(m²·K) — a realistic value for RP-1 in a milled channel at high velocity.
$T_{aw}=3567.3$ K from WE1.

**Step 1 — resistances (per unit area).**
$$R''_g=\frac{1}{h_g},\qquad R''_w=\frac{t_w}{k}=\frac{1.00\times10^{-3}}{300}
=3.333\times10^{-6},\qquad R''_c=\frac{1}{h_c}=2.000\times10^{-5}\ \mathrm{m^2K/W}$$

**Step 2 — iterate, because $\sigma$ depends on $T_{wg}$.** Start from
$T_{wg}=800$ K, $h_g=2.083\times10^4$, $R''_g=4.801\times10^{-5}$:
$$R''_{tot}=4.801\times10^{-5}+3.333\times10^{-6}+2.000\times10^{-5}
=7.134\times10^{-5}\ \mathrm{m^2K/W}$$
$$q''=\frac{3567.3-300}{7.134\times10^{-5}}=4.58\times10^{7}\ \mathrm{W/m^2}$$
$$T_{wg}=3567.3-\frac{4.58\times10^7}{2.083\times10^4}=3567.3-2199=1368\ \mathrm{K}$$
That is far from the 800 K assumed, so re-evaluate $\sigma$ at $T_{wg}=1368$ K
and repeat. Converged after three sweeps:

$$\sigma = 1.2595,\quad h_g=1.922\times10^4\ \mathrm{W/(m^2K)},\quad
q''=\mathbf{43.4\ MW/m^2}$$
$$T_{wg}=3567.3-\frac{4.335\times10^7}{1.922\times10^4}=\mathbf{1312\ K}$$
$$\Delta T_{wall}=\frac{q''t_w}{k}=\frac{4.335\times10^7\times10^{-3}}{300}
=\mathbf{145\ K}\quad\Rightarrow\quad T_{wc}=1167\ \mathrm{K}$$
$$T_{wc}-T_{co}=867\ \mathrm{K}\ \text{across the coolant film}$$

**Step 3 — read the answer.** 1312 K. Pure copper melts at 1358 K; NARloy-Z has
no useful strength above ~900 K. **This design fails.** Note where the
resistance is: gas film 67 %, coolant film 28 %, metal 5 %. The metal is not
the problem, and making it thinner or more conductive will not save it.

**Step 4 — what would fix it.** Require $T_{wg}=800$ K. Then
$\sigma=1.3651$, $h_g=2.083\times10^4$, and
$$q''=h_g(T_{aw}-T_{wg})=2.083\times10^4\times2767.3=57.6\ \mathrm{MW/m^2}$$
$$T_{wc}=800-\frac{5.764\times10^7\times10^{-3}}{300}=800-192=608\ \mathrm{K}$$
$$h_c^{req}=\frac{q''}{T_{wc}-T_{co}}=\frac{5.764\times10^7}{308}
=\mathbf{1.87\times10^{5}\ W/(m^2K)}$$
— **3.7 times the assumed value**, which for RP-1 is not reachable by channel
design alone. The real engine gets there by (a) film cooling, (b) letting a
carbon layer form, or (c) both.

**Step 5 — with a carbon deposit.** Insert a 50 µm coke layer,
$k_c=1.0$ W/(m·K), $R''_{soot}=5.0\times10^{-5}$ m²K/W — larger than the gas
film resistance. Re-solving the chain (with $h_c$ back at $5.0\times10^4$):
$$q''=\mathbf{24.9\ MW/m^2},\qquad T_{\text{soot surface}}=2123\ \mathrm{K},
\qquad T_{\text{metal hot face}}=\mathbf{880\ K}$$
The metal is now survivable, the flux has halved, and the engine works — on a
layer that grew itself, whose thickness nobody controls and whose spalling is a
transient thermal event. This is not a comfortable place to be, and it is
exactly where every kerolox engine lives.

> **Sanity check.** The RS-25 solves the same problem with hydrogen, whose
> $h_c$ in a milled channel reaches $2$–$4\times10^5$ W/(m²·K) — the value
> WE2 said RP-1 could not reach. Hydrogen's advantage as a coolant is not its
> heat capacity alone (though 14.3 kJ/(kg·K) helps); it is that supercritical
> H₂ at high mass flux gives a coolant-side film coefficient an order of
> magnitude above kerosene's. That is the real reason the RS-25 survives
> 136 MW/m² with a bare NARloy-Z wall and no soot.

### WE3 — Thermal stress versus yield: copper alloy against Inconel

**Given.** $q''=50$ MW/m² (a round number between WE1's 57.6 and WE2's 43.4),
$t_w=1.00$ mm. Properties at ~800 K:

| material | $k$ [W/(m·K)] | $E$ [GPa] | $\alpha$ [1/K] | $\nu$ | $\sigma_y$ [MPa] |
|---|---|---|---|---|---|
| NARloy-Z | 300 | 100 | $18\times10^{-6}$ | 0.34 | 100–140 |
| GRCop-42 | 290 | 110 | $17\times10^{-6}$ | 0.33 | 130–190 |
| Inconel 718 | 25 | 165 | $14.4\times10^{-6}$ | 0.29 | 850–1000 |

**Step 1 — NARloy-Z.**
$$\Delta T_{wall}=\frac{q''t_w}{k}=\frac{5.00\times10^7\times1.00\times10^{-3}}{300}
=166.7\ \mathrm{K}$$
$$\sigma_{th}=\frac{E\alpha\Delta T}{2(1-\nu)}
=\frac{100\times10^{9}\times18\times10^{-6}\times166.7}{2(1-0.34)}
=\frac{3.000\times10^{8}}{1.32}=\mathbf{227\ MPa}$$
Against a yield of 100–140 MPa, the elastic stress index is **1.6–2.3 × yield**.
The liner is plastic on the hot face every single start.

**Step 2 — GRCop-42.**
$$\Delta T=\frac{5.00\times10^7\times10^{-3}}{290}=172.4\ \mathrm{K},\qquad
\sigma_{th}=\frac{110\times10^9\times17\times10^{-6}\times172.4}{2(0.67)}
=\mathbf{241\ MPa}$$
Slightly *higher* elastic stress than NARloy-Z — but against a yield 30–40 %
higher, so the plastic strain range per cycle is smaller and the LCF life is
longer. **This is the whole case for GRCop over NARloy-Z**, and it is a
strength argument, not a conductivity argument [M, [GRCop]].

**Step 3 — Inconel 718 at the same flux.**
$$\Delta T=\frac{5.00\times10^7\times10^{-3}}{25}=\mathbf{2000\ K}$$
which is physically impossible — the hot face would be above the melting point
before the cold face left ambient. Formally,
$\sigma_{th}=165\times10^9\times14.4\times10^{-6}\times2000/(2\times0.71)
=3350$ MPa, four times yield, but the number is meaningless because the
temperature profile it assumes cannot exist.

**Step 4 — what flux can Inconel take?** Invert for an allowable
$\Delta T=300$ K at $t_w=0.5$ mm:
$$q''_{max}=\frac{k\,\Delta T}{t_w}=\frac{25\times300}{5.0\times10^{-4}}
=\mathbf{15\ MW/m^2}$$
Which is precisely the regime the **F-1's Inconel-X/Hastelloy tube wall**
operates in (8–16 MW/m², §3.9) — and the F-1 achieves it only with film
cooling and a soot layer. The material choice and the flux level are not
independent decisions; each implies the other.

> **Sanity check.** The ratio of allowable fluxes, copper to nickel alloy, is
> essentially $k_{Cu}/k_{Ni}\approx12$. Real engine practice spans 8–16 MW/m²
> for nickel-alloy tube walls and 100–160 MW/m² for copper liners — a ratio of
> 10. The simple conduction argument predicts the entire historical divide
> between tube-wall and channel-wall chamber technology.

### WE4 — Heat-sink chamber: how long before it melts

**Given.** An uncooled copper heat-sink development chamber for RE-500 barrel
testing: C18200 CuCr, $t_w=10$ mm, $k=320$ W/(m·K), $\rho_s=8900$ kg/m³,
$c_s=385$ J/(kg·K), initial $T_i=300$ K, allowable surface temperature
$T_{max}=800$ K so $\Delta T_{allow}=500$ K. Applied flux: the chamber-barrel
value from WE1, $q''=32$ MW/m² (radiation folded in would make it 35; use 32
and note the margin is thinner than it looks).

**Step 1 — diffusivity.**
$$\alpha_d=\frac{k}{\rho_s c_s}=\frac{320}{8900\times385}
=\frac{320}{3.4265\times10^{6}}=9.339\times10^{-5}\ \mathrm{m^2/s}$$

**Step 2 — survival time, Eq. 3.10.**
$$t_{surv}=\frac{\pi}{\alpha_d}\left(\frac{k\Delta T_{allow}}{2q''}\right)^2
=\frac{3.14159}{9.339\times10^{-5}}
\left(\frac{320\times500}{2\times3.20\times10^{7}}\right)^2$$
$$=3.3641\times10^{4}\times(2.500\times10^{-3})^2
=3.3641\times10^{4}\times6.250\times10^{-6}=\mathbf{0.210\ s}$$

**Step 3 — check the semi-infinite assumption.** The thermal penetration depth
at that time is
$$\delta_{th}\approx2\sqrt{\alpha_d t}=2\sqrt{9.339\times10^{-5}\times0.210}
=2\times4.43\times10^{-3}=8.9\ \mathrm{mm}$$
against a 10 mm wall. **Marginal — the assumption is just barely valid**, and
if the wall were 5 mm the back face would already be heating and the real
survival time would be shorter than 0.21 s. The diffusion time through the full
wall is $t_d=L^2/\alpha_d=(0.010)^2/9.339\times10^{-5}=1.07$ s, so at 0.21 s we
are at Fourier number $\mathrm{Fo}=0.20$: transient, but not deeply so.

**Step 4 — the same chamber in Inconel 718.**
$\alpha_d=25/(8190\times435)=7.017\times10^{-6}$ m²/s, and
$$t_{surv}=\frac{3.14159}{7.017\times10^{-6}}
\left(\frac{25\times500}{6.40\times10^{7}}\right)^2
=4.477\times10^{5}\times(1.953\times10^{-4})^2=\mathbf{0.017\ s}$$
Seventeen milliseconds. A nickel-alloy heat-sink chamber at 100 bar does not
exist as an engineering object.

**Step 5 — lower the pressure.** $q''\propto p_c^{0.8}$, and
$t_{surv}\propto q''^{-2}\propto p_c^{-1.6}$. At $p_c=20$ bar the barrel flux
falls to $32\times(0.2)^{0.8}=8.8$ MW/m² and
$$t_{surv}=0.210\times\left(\frac{32}{8.8}\right)^{2}=2.8\ \mathrm{s}$$
which is why heat-sink and "boiler-plate" chambers are a **low-pressure,
short-duration** technique: injector pattern checkouts, ignition-sequence
development, and mixture-ratio surveys of a few seconds, at a chamber pressure
well below the flight point.

> **Sanity check.** Copper heat-sink chambers are routinely used for 1–5 s
> injector characterisation runs at 20–50 bar, and they are never used at
> flight pressure for a full-duration test. The arithmetic above says exactly
> that, and the two independent scalings ($t\propto q''^{-2}$ and
> $q''\propto p_c^{0.8}$) are the reason the practice is so sharply bounded.

---

## 6. Real engines

### 6.1 RS-25 main combustion chamber — NARloy-Z, ~1 mm hot wall

**The choice.** A milled-channel NARloy-Z (Cu–3Ag–0.5Zr) liner with **390
channels machined into the chamber liner** and an electroformed-nickel
structural closeout, hydrogen-cooled, at $p_c=206.4$ bar; the nozzle is a
separate 1080-tube brazed tube wall [_verify-liquid]. Hot-wall thickness of
order 1 mm.

**The alternatives available in 1972.** Brazed tube wall (J-2, F-1, RL10
heritage — proven, but tube crowns are thick nickel alloy and could not have
survived 130 MW/m²); ablative (no — reusable engine); film cooling of the main
chamber (rejected because every kilogram of fuel diverted to the wall is a
kilogram not passed through the preburners, and in a staged-combustion cycle it
costs turbine power as well as $I_{sp}$).

**Why it made sense.** Section 3.8's table is the whole argument: at 130 MW/m²
a nickel-alloy wall would need a ~4000 K gradient. Only a copper alloy closes
the chain, and only a *milled channel* (not a tube) gets you a thin, uniform
hot wall with a stiff structural backing. Silver and zirconium are in NARloy-Z
to raise strength and creep resistance without wrecking conductivity — copper's
conductivity falls fast with most alloying additions, and Ag-Zr is one of the
few combinations that buys strength cheaply.

**What it cost.** Exactly the failure mode of §3.10: cyclic plastic strain,
progressive dog-house channel deformation and a hard cycle-life limit on the
liner. MCC life was a persistent programme issue [H, [Biggs89]].

**Would a modern engineer choose the same?** Same architecture, different alloy
and different process. **GRCop-42, additively manufactured**, gives 30–40 %
higher yield strength at temperature for ~95 % of the conductivity, prints the
channels rather than milling and brazing them, and demonstrably improves LCF
life — that is the explicit case NASA makes for it [M, [GRCop], [Gradl18],
[GradlAM]]. Nobody would go back to a brazed tube wall for a 200 bar chamber.

### 6.2 F-1 — 178 brazed nickel-alloy tubes, and cooling by soot

**The choice.** A regenerative **tube-wall** chamber: 178 brazed Inconel-X/
Hastelloy tubes in an Inconel jacket with steel bands, RP-1-cooled, up-pass and
down-pass; the nozzle extension is not regeneratively cooled at all but
film-cooled by **turbine exhaust dumped as a curtain** [_verify-liquid].

**Why it made sense in 1959.** At $p_c\approx70$ bar and $D_t\approx0.89$ m,
Bartz gives 31 MW/m² — but the F-1 never sees that. The engine runs with a
fuel-rich boundary layer and grows a coke deposit, and the delivered flux is
8–16 MW/m². WE3 Step 4 showed that a 0.5 mm nickel-alloy wall handles ~15 MW/m²
at a 300 K gradient. **The tube wall works precisely because the film and the
soot bring the flux down into the range a nickel alloy can carry.** Copper
liners at that scale did not exist, brazing 178 tubes was a solved 1950s
process (Neu's patent, 1950), and a large-diameter engine is *thermally
easier* than a small one at the same pressure ($h_g\propto D_t^{-0.2}$).

**What it cost.** $I_{sp}$. Film cooling and a fuel-rich wall cost several
seconds of specific impulse, and $\eta_{c^*}$ suffers because the wall layer
never fully burns. The F-1 is a big engine, not an efficient one — and the
thermal design is one reason why.

**Would a modern engineer choose the same?** No. A modern 6.7 MN kerolox engine
would use a channel-wall copper-alloy liner and cut the film-cooling fraction
hard. But the F-1's answer was correct for its materials, its schedule and its
expendable mission.

### 6.3 Merlin 1D — milled channels, RP-1 coolant, and a niobium skirt

**The choice.** Regenerative milled-channel chamber and nozzle, RP-1-cooled,
$p_c=97$ bar, $D_t\approx0.26$ m; the MVac nozzle extension is
**radiation-cooled niobium alloy** and glows cherry-red in flight, which is
nominal [_verify-liquid].

**Why.** RP-1 is a mediocre coolant (WE2: $h_c\approx5\times10^4$ against
hydrogen's $2$–$4\times10^5$) and it cokes. Milled channels give the thin
uniform hot wall that a tube wall cannot; the flux at 97 bar and 0.26 m throat
is in the 25–45 MW/m² band, which a copper-alloy liner handles with margin and
some film cooling. The pintle injector helps: it produces a naturally
fuel-rich, well-organised outer flow that shields the wall, which is one of the
under-advertised virtues of the pintle and part of why SpaceX inherited it from
the TRW/LM-descent lineage.

**The niobium skirt** is the other half of the answer, and the arithmetic is
worth doing because it is counter-intuitive. $T_{aw}$ barely falls down the
nozzle (3443 K at $\varepsilon=5$, 3382 K at $\varepsilon=25$), so the wall's
driving potential is essentially undiminished. What collapses is $h_g$: with
$(A_t/A)^{0.9}$, Bartz gives $h_g\approx3.7\times10^{3}$ W/(m²·K) at
$\varepsilon=5$ and $7.4\times10^{2}$ at $\varepsilon=25$, so at a wall
temperature of 1500 K the flux falls from 7.1 to 1.4 MW/m². A C-103 niobium
skirt radiating from both faces at $\varepsilon_w\approx0.8$ balances only
0.23 MW/m² at 1500 K and 0.34 MW/m² at 1650 K. Bartz alone would therefore put
the radiation-cooling transition beyond $\varepsilon\approx60$ — but Bartz
over-predicts by 30–50 % that far downstream (§3.7), and the real transition on
flight hardware sits nearer $\varepsilon=25$–40. **This is a station where you
do not design on Bartz; you design on the measured skirt temperature.**
Radiation cooling becomes viable where $h_g$ has collapsed, not where the gas
has cooled.

**Modern verdict.** Yes — and this is now the default for a reusable kerolox
booster engine.

### 6.4 RL10 — where the heat load is the power supply

**The choice.** Brazed stainless-steel tube wall, hydrogen-cooled, $p_c$ only
32.8 bar, closed expander cycle: **the heat picked up in the chamber wall is
what drives the turbopump** [_verify-liquid].

**The inversion.** For every other engine in this module heat flux is a
liability to be minimised. For the RL10 it is the power source, and the design
problem runs backwards: you need *enough* heat into the hydrogen to generate
turbine enthalpy. Since the heat pickup scales with wetted area ($\propto D^2$)
while thrust scales with throat area, and $q''\propto p_c^{0.8}$, the expander
cycle has a hard chamber-pressure and thrust ceiling — the "expander cycle
thrust limit" [_verify-liquid]. That is why the RL10 sits at 33 bar while its
staged-combustion contemporaries sit at 200.

**Materials.** Stainless steel tubes, not copper — deliberately. At 33 bar with
$D_t\approx0.13$ m the throat flux is 8–15 MW/m², inside steel's range (WE3
Step 4), and steel is cheap, weldable and does not need an electroformed
closeout. A copper liner would be an expensive way to *reduce* the heat pickup
the cycle needs.

**Modern verdict.** Unchanged. Sixty years of production and the cooling scheme
is still right for the cycle.

### 6.5 Vulcain 2 — the mixture-ratio/heat-flux coupling

**The choice.** Regenerative tube-wall chamber, and — new for Vulcain 2 —
**film cooling of the lower nozzle using turbine exhaust**, added because the
uprate from MR 5.3 to 6.1 and from 100 to 117 bar **raised the wall heat flux**
[_verify-liquid].

**Why this is the instructive case.** Vulcain 2's mixture-ratio increase was a
vehicle-level optimisation: a richer mixture raises density impulse and thrust
even though it *lowers* engine $I_{sp}$ (431 s → 429 s). Nobody optimises
mixture ratio for heat transfer, but heat transfer sends the bill. Moving
toward stoichiometric raises $T_c$ and $\varepsilon_g$, raises $c_p$, and
raises $q''$ — and the fix was a film-cooling circuit that was not in the
Vulcain 1 design. **A thermal engineer who is not in the room when the mixture
ratio is chosen will be handed a problem they cannot solve.**

**Modern verdict.** The coupling is real and permanent; the modern answer is
the same (film-cool the region that got hotter) executed with better
prediction.

---

## 7. Design trade-offs, failure modes, materials, manufacturing, testing

### 7.1 The trade-offs that actually bind

- **Chamber pressure versus wall life.** $q''\propto p_c^{0.8}$ and thermal
  strain range $\propto q''$; life $\propto \Delta\varepsilon_p^{-1/m}$ with
  $m\approx0.5$. Doubling $p_c$ raises the flux 74 %, roughly doubles the
  plastic strain range and cuts LCF life by something like a factor of 3–4 [J].
  Every chamber-pressure decision in Module 06 is also a life decision.
- **Film cooling versus $I_{sp}$.** 2–10 % of the fuel dumped along the wall
  costs 1–3 % of $I_{sp}$ and buys a factor of 2 on the wall flux. Cheap,
  reliable, and the reason it is on nearly every hydrocarbon engine ever flown.
  Details in Module 11.
- **Wall thickness.** Thinner lowers $\Delta T$ (life) but raises $q''$
  (coolant $\Delta T$ and pump work) and reduces erosion allowance and hoop
  capability. There is a real optimum, usually 0.7–1.2 mm for copper.
- **Throat radius of curvature.** Tight $R_u$ shortens the engine and raises
  $C_d$, but raises $h_g$ by $(D_t/R_u)^{0.1}$ and — more importantly — puts
  the peak flux in a more sharply curved region where circumferential
  conduction helps least.
- **Coolant choice.** Hydrogen is the best coolant known and also the fuel with
  the worst density. Methane is a good coolant that does not coke. RP-1 is a
  poor coolant that cokes, and the coke helps. Hydrazine and MMH decompose
  catalytically on hot metal and cannot be run above ~600 K wall temperature.

### 7.2 Failure modes

| mode | mechanism | symptom | evidence | fix |
|---|---|---|---|---|
| **Burn-through** | local $q''$ exceeds what the local $h_c$ can carry; $T_{wg}$ reaches melting | sudden $p_c$ drop, coolant flow rise, plume anomaly, hole in the liner | melted-through channel with a rounded lip; often at a single axial station near the throat, or on a streak line from one injector element | raise $h_c$ locally, film-cool, fix the injector element causing the streak |
| **Dog-house / LCF cracking** | cyclic plastic strain from the reversing gradient | none in a single test; progressive channel deformation and rising wall temperature over cycles | sectioned liner showing bulged, thinned lands; hot-face cracks parallel to the channels | lower $\Delta T_{wall}$; higher-strength alloy (GRCop); cycle-life limit and replacement |
| **Blanching** | oxidation–reduction cycling of the copper surface in an alternately oxidising/reducing gas; surface roughens and loses conductivity | dull, pitted, "blanched" hot face; slowly rising wall temperature | metallography showing subsurface porosity | avoid oxidiser-rich wall conditions; GRCop is markedly more blanching-resistant [GRCop] |
| **Coolant-side coking/fouling** | fuel decomposition on the hot channel wall (RP-1 above ~560 K film temperature) | rising $\Delta p$ across the jacket, rising wall temperature, run-to-run drift | deposit in sectioned channels | cap the coolant-side wall temperature; use methane or hydrogen; add a sacrificial wall layer |
| **Start-transient channel voiding** | coolant is gaseous or two-phase in a channel at ignition; $h_c$ collapses | a single melted strip one channel wide, at the first station the flux arrives | the strip is aligned with a channel, not with an injector element | coolant pre-chill and priming; fuel lead; controlled ignition sequence |
| **Braze-joint failure (tube walls)** | thermal cycling of a dissimilar-metal joint with a contact resistance | local hot spot at the joint, tube split | separated braze at the tube crown | brazing process control; or move to channel-wall construction |

### 7.3 Materials

**Why copper alloys.** Section 3.10's figure of merit $k(1-\nu)\sigma_y/(E\alpha)$.
Pure copper has the conductivity but no strength above 500 K.
**NARloy-Z** (Cu–3Ag–0.5Zr) buys strength and creep resistance for ~5 % of the
conductivity; it is the RS-25 baseline and the textbook example.
**GRCop-84 / GRCop-42** (Cu–Cr–Nb, dispersion-strengthened by Cr₂Nb particles)
retain ~90–95 % of NARloy-Z's conductivity with substantially better strength,
creep and blanching resistance, and — decisively — GRCop-42 is designed for
laser powder-bed fusion [M, [GRCop]].
**Nickel alloys (Inconel 718, Inconel X-750, Hastelloy)** for tube walls, jackets
and structural closeouts: 12× worse conductivity, 8× better strength, and
therefore only usable where the flux is under ~15 MW/m².
**Refractory metals (C-103 niobium)** and **carbon–carbon** for radiation-cooled
skirts at 1400–1900 K, where the flux is under ~1 MW/m².
**Electroformed nickel** as the structural closeout over a milled-channel copper
liner: it is deposited, not fitted, so it makes an intimate bond with no braze
gap and no contact resistance.

### 7.4 Manufacturing, and what it limits

- **Brazed tube wall.** Tubes are tapered and formed, stacked, and furnace-brazed
  in a jacket. Limits: the tube crown thickness (0.3–0.6 mm) plus the braze
  fillet sets the minimum wall; braze voids are contact resistances and are the
  classic tube-wall defect. Cheap in 1960 tooling terms, and scalable to F-1
  size.
- **Milled channel + electroformed or brazed closeout.** Channels are milled
  into a forged copper liner, filled with a sacrificial mandrel, and closed out
  by electroforming nickel over the top. Limits: channel aspect ratio (about
  4:1 by milling), minimum land width, and a long, expensive electroforming
  cycle. Gives the thinnest, most uniform hot wall of the conventional
  processes — hence the RS-25.
- **Additive (L-PBF GRCop-42 liner, DED or wire-arc structural jacket).** Prints
  channels of arbitrary cross-section, variable-thickness hot walls, and
  integral manifolds in one piece. Limits: as-built surface roughness raises
  $h_c$ (helpful) and $\Delta p$ (not), powder removal from long channels,
  and property scatter that is still being characterised [M, [Gradl18],
  [GradlAM], [RAMPT]]. This is where the field is going and where the
  qualification data is thinnest.
- **Thermal barrier coatings** (zirconia over a bond coat) are used in gas
  turbines but rarely in liquid rocket chambers: the flux is so high that the
  coating surface temperature would exceed its own stability limit, and
  spallation into the throat is unacceptable. Occasional use on ablative and
  storable-propellant hardware [R].

### 7.5 Testing: how heat flux is actually measured

- **Calorimeter chamber.** A heavy-wall chamber divided into 10–30 axially
  short, individually water-cooled segments, each with measured coolant flow and
  inlet/outlet temperature. $q''_i = \dot m_i c_{p,w}\Delta T_i/A_i$. This is
  the gold standard and the source of every credible $q''(x)$ curve. It is
  expensive, it is not the flight geometry, and the segment joints perturb the
  boundary layer.
- **Thermocouples embedded at two depths in a thick wall.** Gives $q''$ from
  the local gradient. Cheap, but the thermocouple installation itself perturbs
  the conduction field, and response time limits it to steady state.
- **Coolant-side calorimetry on the flight article.** Total heat load from the
  jacket $\Delta T$ and flow: $Q=\dot m_c c_{p,c}\Delta T_c$. Integral only —
  it cannot localise a hot spot, but it is the one measurement you always have.
- **Thin-film gauges and coaxial thermocouples** for transient (start) flux in
  short-duration facilities.
- **What the data looks like when it is wrong.** A single segment reading 2×
  its neighbours means injector streaking — trace it back to an element.
  Coolant $\Delta T$ rising run-over-run at constant $p_c$ means the wall is
  fouling on the coolant side, or a soot layer is *not* forming as it did. A
  peak that has migrated downstream between builds means the throat contour or
  the sonic-line position has changed. And a wall thermocouple that goes quiet
  and then reads ambient has been consumed.

---

## 8. Misconceptions and what engineers actually care about

**"Deep in the nozzle the wall only sees the static temperature, so it is
cool."** No. The recovery factor recovers 90 % of the kinetic energy, so at
$\varepsilon=16$ the free stream is at $0.44T_0$ but $T_{aw}=0.944T_0$ — 3397 K
for a 3600 K chamber. Nozzle extensions survive because $h_g\propto(A_t/A)^{0.9}$
has collapsed by a factor of twenty, not because the driving potential has
fallen. Use $T_{aw}$, and get it from Eq. 3.2, not from a static-temperature
table.

**"The throat is hottest because the gas is hottest there."** The gas is
*coolest* along the flow path so far — 300–400 K below the chamber. The throat
is the hottest wall because the boundary layer is thinnest and the mass flux
highest, both of which raise $h_g$ faster than $T_{aw}$ falls.

**"Bartz gives the heat flux."** Bartz gives a gas-side coefficient for a clean,
attached, developed, film-free turbulent boundary layer. It is right to ±20–30 %
at a clean throat and wrong by a factor of 2–5 anywhere film cooling or a
deposit exists. Section 3.7 has the table; §5's F-1 check has the object lesson.

**"A thicker wall is safer."** A thicker wall has a *larger* temperature drop
across it, therefore larger thermal stress, therefore shorter fatigue life. It
also raises $T_{wg}$ slightly. Thick walls are safer against erosion and hoop
pressure and worse against everything thermal. Copper liners are thin on
purpose.

**"Copper is used because it has a high melting point."** Copper melts at
1358 K, *below* Inconel 718 (~1600 K) and far below niobium (2750 K). Copper is
used because it conducts, so the hot face never gets near its melting point.
The material property that matters is $k$, not $T_m$.

**"Radiation can be ignored."** For LOX/LH₂ at the throat, yes — under 1 %. For
a sooty kerolox chamber barrel, no: 10–25 %, which is larger than the accuracy
you are claiming for $h_g$. For an ablative or radiation-cooled chamber it can
be the dominant term.

**"The engine is in steady state a millisecond after ignition."** A 1 mm copper
liner reaches steady state in ~11 ms; a nickel alloy takes ~140 ms; a 10 mm
heat-sink wall takes over a second. Start transients kill hardware precisely in
the window where the coolant is not yet doing its job.

**"Soot is a contaminant."** In a kerolox engine the carbon deposit is a
thermal barrier coating worth a factor of two on wall flux, and engines are
designed knowing it will be there. It is also uncontrolled, variable, and
liable to spall — which makes it a design dependency, not a design feature.

### What engineers actually care about

1. **Peak wall temperature and where it occurs**, because it decides material
   and whether the design closes at all.
2. **The through-wall temperature difference**, because it, not the peak
   temperature, sets cycle life through Eq. 3.8.
3. **The coolant-side coefficient $h_c$ and the coolant pressure drop it costs**,
   because that is the only lever on the wall temperature they actually control
   (Module 11).
4. **The margin between the Bartz prediction and the calorimeter data for
   *this* chamber**, because that ratio is what every subsequent analysis will
   be scaled by.
5. **How many thermal cycles are left on this liner**, because on a reusable
   engine that number, not thrust or $I_{sp}$, is what schedules the hardware.

---

## 9. Mastery levels

**Level 1 — Familiarity.** You can say that convection dominates, that
radiation is 5–25 % for sooty hydrocarbons and negligible for hydrogen, and
that conduction sets the gradient. You know the throat is the hottest place and
can say why in one sentence. You can name the Bartz correlation, state that it
is a 1957 pipe-flow analogy accurate to ±20–30 %, and name copper alloys and
the RS-25 as the canonical high-flux example.

**Level 2 — Working engineering knowledge.** Given $p_c$, $T_0$, $\gamma$,
$\mathcal{M}$, $D_t$, $R_u$ and transport properties, you can compute $h_g$,
$\sigma$, $T_{aw}$ and $q''$ at any station, iterate the wall chain to
$T_{wg}$, $\Delta T_{wall}$ and $T_{wc}$, and compute the thermal stress and
compare it to yield. You can state Bartz's four failure regimes and their
directions from memory, estimate radiation from a gas emissivity, and compute a
heat-sink survival time and check the semi-infinite assumption. You can read a
calorimeter-chamber $q''(x)$ plot and say whether the peak is where it should
be.

**Level 3 — Interview mastery.** Given an unfamiliar engine — a photograph, a
cycle diagram and two numbers — you can estimate its throat heat flux to within
a factor of two, argue what its cooling scheme must be, and say what would
break first. Given a hot-fire anomaly you can distinguish injector streaking
from channel voiding from an LCF liner from a coolant-side fouling trend, and
say what measurement would settle it. You can argue both sides of the
copper-versus-nickel, thin-versus-thick, and film-cooling-versus-$I_{sp}$
trades with numbers, and you can name the programme that faced each — RS-25 MCC
liner life, the F-1's soot-and-film design point, Vulcain 2's mixture-ratio
uprate — and say what they did.

---

## 10. Problems

### Conceptual

**C1.** A colleague computes the wall heat flux in a nozzle at $\varepsilon=25$
using $q''=h_g(T_c-T_{wg})$ with $T_c=3500$ K and $T_{wg}=800$ K, instead of
using $T_{aw}$. For $\gamma=1.20$, compute the factor by which they have
over-predicted the flux. Is the error large? What does your answer say about
where the real uncertainty in a nozzle heat-transfer calculation lives?

**C2.** Why does the *measured* peak heat flux sit upstream of the geometric
throat when quasi-1-D Bartz places it exactly at the throat? Give two distinct
physical mechanisms.

**C3.** Copper melts at 1358 K; Inconel 718 melts near 1600 K. Explain, without
arithmetic, why copper is nevertheless the correct liner material at 130 MW/m²
and Inconel is not.

**C4.** A hydrogen engine and a kerosene engine have the same $p_c$, $T_0$,
$\gamma$, $\mathcal{M}$ and $D_t$. Which has the higher wall heat flux after
ten seconds of running, and why? Name two separate effects that push in the
same direction.

**C5.** Explain why increasing the liner thickness to gain erosion margin can
*shorten* the engine's life, and identify the quantity that governs life.

**C6.** The RL10 is an expander-cycle engine. Explain why its designers wanted
*more* chamber heat flux, and what physical scaling nevertheless caps the
engine's thrust.

**C7.** In a fuel-rich kerolox chamber the gas emissivity is 0.4 near the wall
and 0.15 in the core. Which value should be used in Eq. 3.11 and why? What does
that imply for a CFD radiation model that assumes a single well-mixed gas?

**C8.** A test engineer proposes to validate a new chamber design by measuring
the total coolant temperature rise across the jacket and comparing it to the
integrated Bartz prediction. State two ways this test can pass while the design
is nevertheless unsafe.

### Calculation

**N1.** For RE-500 ($D_t=197.33$ mm, $p_c=10.0$ MPa, $c^*_{del}=1726.6$ m/s,
$\mu_0=1.00\times10^{-4}$ Pa·s, $c_{p0}=2267.6$ J/(kg·K), $\mathrm{Pr}_0=0.8276$,
$R_u/R_t=1.5$), compute $h_g$ at $\varepsilon=10$ (supersonic) with
$T_{wg}=700$ K, and the corresponding $q''$.

**N2.** Recompute the RE-500 throat $h_g$ for a chamber pressure of 200 bar,
all else equal, and state the percentage increase. Verify it against the
$p_c^{0.8}$ scaling.

**N3.** A 25 kN upper-stage LOX/LH₂ engine runs at $p_c=60$ bar with
$T_0=3450$ K, $\gamma=1.21$, $\mathcal{M}=13.0$ kg/kmol, $C_{F,vac}=1.85$,
$c^*_{del}=2250$ m/s, $\mu_0=1.0\times10^{-4}$ Pa·s, $R_u=R_t$, $T_{wg}=750$ K.
Compute $A_t$, $D_t$, $h_g$ at the throat and $q''$. Compare the flux to the
RS-25 and comment on the $D_t^{-0.2}$ scaling.

**N4.** For the RE-500 throat at $q''=45$ MW/m², compute $\Delta T_{wall}$ and
$\sigma_{th}$ for (a) a 0.7 mm GRCop-42 wall and (b) a 1.4 mm GRCop-42 wall.
Use $k=290$ W/(m·K), $E=110$ GPa, $\alpha=17\times10^{-6}$/K, $\nu=0.33$. State
the ratio of the two stresses and what it implies for cycle life.

**N5.** A calorimeter chamber measures $q''=38$ MW/m² at the throat of an engine
for which Bartz predicts 55 MW/m². (a) What is the correction factor? (b) The
same engine is later re-tested with 30 % less film cooling and measures
49 MW/m². Estimate the correction factor for the reduced-film configuration and
comment on whether a single scalar correction is defensible.

**N6.** An uncooled graphite throat insert ($k=100$ W/(m·K), $\rho_s=1800$
kg/m³, $c_s=1700$ J/(kg·K)) is exposed to 20 MW/m². How long until the surface
reaches 2500 K from an initial 300 K? What is the thermal penetration depth at
that time?

**N7.** Compute the radiative flux from a LOX/CH₄ chamber at $T_g=3500$ K with
$\varepsilon_g=0.18$ onto a wall at 750 K, and express it as a percentage of a
convective flux of 28 MW/m². Then repeat for a LOX/LH₂ chamber at the same
$T_g$ with $\varepsilon_g=0.07$ and a convective flux of 60 MW/m².

**N8.** Take the RS-25 throat conditions from §5's sanity check
($T_{aw}=3568.8$ K, $h_g=4.93\times10^{4}$ W/(m²·K)), a 1.0 mm NARloy-Z wall
($k=300$), and hydrogen coolant at $T_{co}=150$ K. What coolant-side
coefficient $h_c$ is required to hold $T_{wg}=830$ K? Comment on whether that
is achievable with supercritical hydrogen.

### Engineering reasoning

**R1.** A calorimeter-chamber test of a new kerolox chamber gives a $q''(x)$
curve with a sharp local peak of 62 MW/m² at one axial station in the barrel,
20 mm from the injector face, against a barrel average of 22 MW/m². Downstream
of the peak the curve returns to the expected profile. Diagnose the cause,
state what additional measurement would confirm it, and give the fix.

**R2.** Two builds of the same engine, same contour, same injector. Build A
shows a throat flux of 41 MW/m² on test 1 rising to 47 MW/m² by test 8. Build B
shows 44 MW/m² on test 1, flat through test 8. Both engines are kerolox. Offer
two competing explanations, say what data would discriminate between them, and
say which you would bet on.

**R3.** An engine passes acceptance but the liner is sectioned after 40 cycles
and shows dog-house deformation with 0.4 mm of wall thinning over the channels.
The programme wants 100 cycles. Rank these four fixes by expected benefit per
unit of programme risk, with reasoning: (i) reduce hot-wall thickness from
1.2 mm to 0.9 mm; (ii) change alloy from NARloy-Z to GRCop-42; (iii) reduce
$p_c$ by 10 %; (iv) add 3 % fuel-film cooling at the throat.

**R4.** You are given only a photograph of an engine on a stand: a large
bell with a visible cherry-red lower section, a bright metallic upper chamber,
and a single fuel duct. Estimate the class of engine, the coolant, and the
approximate flux at the boundary between the two visible zones, and state your
reasoning chain.

### Mini trade study

**T1.** You must select the thrust-chamber cooling and liner architecture for a
new **1.2 MN, LOX/methane, staged-combustion, reusable booster engine at
$p_c=250$ bar**, target life 100 flights between liner replacements, first
flight in six years. $D_t$ works out to approximately 0.21 m. The candidates:

- **(A)** Milled-channel NARloy-Z liner with electroformed-nickel closeout,
  methane-cooled, no film cooling.
- **(B)** Additively manufactured GRCop-42 liner with a DED Inconel 625
  structural jacket, methane-cooled, no film cooling.
- **(C)** Same as (B) but with 4 % fuel-film cooling at the throat.
- **(D)** Brazed Inconel-718 tube wall, methane-cooled, with 8 % fuel-film
  cooling.

Constraints: methane's coolant-side coefficient is roughly 1.5–2× RP-1's and it
does not coke; the cycle is staged combustion so film-cooling fuel is not lost
to the turbine, but it does reduce main-chamber mixing quality; the AM supply
chain for GRCop-42 exists but the qualification database is thin; liner
replacement is a 30-day depot operation.

Estimate the throat heat flux, argue each option against life, $I_{sp}$,
qualification risk and cost, and recommend one with justification. State
explicitly which of your inputs you would insist on measuring in a calorimeter
chamber before committing.

---

## 11. Quiz

Ten questions, 100 points total. No calculators-in-anger required beyond a
scientific calculator; show working where a number is asked for.

**Q1 (8 pts).** The Bartz gas-side coefficient scales with chamber pressure and
throat diameter as:
(a) $p_c^{0.8}D_t^{0.2}$  (b) $p_c^{0.8}D_t^{-0.2}$  (c) $p_c^{0.5}D_t^{-0.5}$
(d) $p_c\,D_t^{-1}$

**Q2 (8 pts).** For a turbulent boundary layer in combustion products with
$\mathrm{Pr}=0.82$, the recovery factor is closest to:
(a) 0.82  (b) 0.90  (c) 0.94  (d) 1.00

**Q3 (10 pts).** In the steady 1-D chain for a 1 mm copper liner
($k=300$ W/(m·K)) with $h_g=2\times10^4$ and $h_c=1\times10^5$ W/(m²·K), what
fraction of the total thermal resistance is the metal? Give the number and one
sentence on what it implies for design.

**Q4 (12 pts).** A chamber runs $q''=60$ MW/m² through a 1.0 mm liner with
$k=280$ W/(m·K), $E=105$ GPa, $\alpha=17.5\times10^{-6}$/K, $\nu=0.33$.
Compute $\Delta T_{wall}$ and $\sigma_{th}$, and state whether the liner is
elastic if $\sigma_y=150$ MPa.

**Q5 (10 pts).** Which of these is **not** a regime in which the Bartz
correlation is known to fail badly, and why?
(a) a film-cooled chamber wall  (b) a clean throat at 100 bar
(c) the divergent section at $\varepsilon=20$  (d) the barrel 15 mm from the
injector face

**Q6 (12 pts).** An engine at $p_c=80$ bar has a throat flux of 35 MW/m². The
same engine is uprated to $p_c=140$ bar with no other change. Estimate the new
throat flux, state the assumption you used, and say by how much the copper
liner's LCF life is likely to change in direction and rough magnitude.

**Q7 (10 pts).** Gas radiation contributes about 15 % of the chamber-barrel heat
flux in a kerolox engine and under 1 % at the throat of a hydrogen engine. Give
the two distinct physical reasons for this difference (one for propellant, one
for station).

**Q8 (12 pts).** A copper heat-sink chamber ($k=320$ W/(m·K), $\rho_s=8900$,
$c_s=385$) is to be run at a flux of 12 MW/m² until its surface reaches 750 K
from 290 K. How long can it run? What minimum wall thickness makes the
semi-infinite assumption valid at that time?

**Q9 (10 pts).** A liner is sectioned after 60 cycles and shows lands that have
bulged toward the gas and thinned by 0.3 mm, with no melting anywhere. Name the
failure mode, name the governing material property group, and state which
single design change would most improve life.

**Q10 (8 pts).** [J] You have a Bartz prediction of 70 MW/m² at the
throat of a new kerolox engine and no test data. Your design must close before
a calorimeter chamber can be built. State the flux you would design the cooling
circuit to, justify the margin in both directions, and name the one measurement
that would let you remove the margin.

---

## 12. Further reading

- **[Bartz57]** — three pages; read the original, not a textbook restatement.
  Note what Bartz himself claims for accuracy and what he explicitly excludes.
  It is the primary source for Eq. 3.4 and Eq. 3.5.
- **[SP-8087]** *Liquid Rocket Engine Fluid-Cooled Combustion Chambers* — the
  design-practice counterpart to Bartz: wall temperature, coolant-side heat
  transfer, thermal stress, low-cycle-fatigue life, and the failure modes of
  §7.2. Free on NTRS. Read §2 and §3 in full before you size a cooling circuit.
- **[SB]** Sutton & Biblarz, the heat-transfer and cooling chapter — the
  standard textbook treatment, with the Bartz form, typical flux levels and a
  clean development of the resistance chain.
- **[HH]** Huzel & Huang, *Modern Engineering for Design of Liquid-Propellant
  Rocket Engines* — the practical design procedure, worked in engineering units,
  with real chamber geometries. Its §4 is the working engineer's version of this
  module. Note the unit warning in `reference/sources.md`.
- **[Bergman]** Incropera/Bergman — for the underlying convection correlations,
  the semi-infinite-solid solution (Eq. 3.9), the Hottel gas-emissivity method,
  and the fin analysis that Module 11 needs for channel lands.
- **[GRCop]** Ellis & Nathal on GRCop-84 — conductivity, strength, creep, LCF
  and blanching data for the Cu–Cr–Nb alloys, with direct comparison to
  NARloy-Z. This is the evidence base behind §7.3.
- **[Biggs89]** *Space Shuttle Main Engine: The First Ten Years* — what actually
  broke on the RS-25 and how often, including the main-combustion-chamber liner.
  The best available account of §3.10's failure mode in service.
- **[Gradl18]**, **[GradlAM]** — additively manufactured chambers and the
  GRCop-42 liner process, including channel geometry that milling cannot make
  and the property-scatter question that is still open.
- **[LRTC]** Yang, Habiballah, Hulka & Popp, *Liquid Rocket Thrust Chambers* —
  the modern research-level treatment of chamber heat transfer, including CFD
  validation against calorimeter data and the peak-location question of §3.4.
- **[SP-8124]** — for the self-cooled (ablative, radiation-cooled) alternative,
  which is where the radiation terms of §3.12 become first-order rather than a
  correction.
