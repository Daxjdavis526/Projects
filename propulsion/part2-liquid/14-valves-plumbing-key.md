# Module 14 — Answer Key
Valves, Plumbing, and Engine Hardware

*Do not open this file until you have attempted the problems and the quiz in
`14-valves-plumbing.md`.*

All arithmetic here is reproduced in `tools/examples/14.py`, either as a
registered library call or as a documented closed-form expression.

Standing properties, as given in the problem set: LOX at 90 K —
$\rho = 1140$ kg/m³, $p_v = 1.0$ bar, $K_f = 0.94$ GPa. RP-1 —
$\rho = 810$ kg/m³, $K_f = 1.3$ GPa. Helium — $\gamma = 1.667$,
$\mathcal{M} = 4.0026$ kg/kmol, so $R = 2077.26$ J/(kg·K) and
$\Gamma(1.667) = 0.72623$. 304L — $E = 200$ GPa,
$\bar\alpha = 1.40\times10^{-5}$/K over 293→90 K, yield 340 MPa at 90 K.

---

## K1. Problem solutions

### Conceptual

**P1 — poppet MOV on a 300 mm LOX line.**

Three quantitative objections:

1. **Pressure drop.** A poppet has $K \approx 2$–$10$ referred to line velocity, versus $0.05$–$0.10$ for a full-bore ball valve — a factor of 20 to 200. At a typical 15 m/s LOX line velocity the dynamic head is $\tfrac12\rho v^2 = 128$ kPa, so a poppet at $K = 5$ drops 6.4 bar while a ball valve drops 0.09 bar. On a 100 bar engine that is 6.4 % of $p_c$ handed to the pump, and it must be paid for in turbine power for the whole burn.
2. **Actuation force.** A poppet's seating force scales as $p \times A_{seat}$. At 300 mm and 45 bar line pressure that is $45\times10^5 \times \tfrac{\pi}{4}(0.30)^2 = 318$ kN — a 32-tonne actuator, before any seating margin. A ball valve's actuation is a *torque* set by seal friction and bearing friction, essentially independent of line pressure to first order, and is two orders of magnitude smaller in energy terms.
3. **Mass and envelope.** The valve body must contain that force, so poppet body mass grows roughly as $D^3$ at fixed pressure. Nothing in a flight engine tolerates that at 300 mm.

The condition under which the proposal is correct: **when the valve must throttle and seal simultaneously and the line is small**. A poppet's near-linear lift characteristic and direct seat load are exactly what a preburner oxidiser valve or a small thruster valve needs. Change "300 mm main line" to "30 mm preburner feed" and the poppet is the right answer. A second, weaker condition is a valve whose leakage requirement is so severe (long dormant storage) that only a directly loaded seat will do — but then the better answer is usually a pyrotechnic barrier.

**P2 — why the throttle valve is in the preburner oxidiser line.**

In a staged-combustion cycle, all of the propellant passes through the main chamber, but the *power* that drives the pumps is set in the preburner. Turbine power sets pump speed, pump speed sets discharge pressure and flow, and chamber pressure follows. Throttling the main propellant line would simply insert a resistance that the pump must overcome, dissipating pressure the pump just made and changing chamber pressure only weakly and inefficiently. Metering oxidiser into the preburner instead changes preburner gas temperature and mass flow, hence turbine power, hence the whole engine operating point — a small valve with enormous leverage.

The implication is that the engine's control inputs are the preburner oxidiser valves, one per preburner. With two preburners (RS-25) you have two effectors, and you need two of them because thrust and mixture ratio are two independent outputs that must both be held. That is a genuine 2×2 (in practice larger, once the chamber coolant valve is included) **multivariable** control problem with strong cross-coupling: FPOV moves thrust but also perturbs MR, and OPOV moves MR but also perturbs thrust. A single-preburner staged-combustion engine or a gas-generator engine has essentially one effector and one loop, which is why those engines can be throttled open-loop from a schedule.

**P3 — nonlinear characteristic and the effective closure time.**

Equation 3.9 is derived by assuming the *flow* is brought to zero linearly over $t_c$, so that the whole liquid column decelerates at a constant $\Delta v / t_c$. What matters physically is $dv/dt$, not the actuator's stroke rate. If 80 % of the flow change occurs in the last 20 % of travel, then the deceleration during that final phase is roughly $0.8\,\Delta v / (0.2\,t_{stroke})$ — four times the average. Using the mechanical stroke time in Eq. 3.9 therefore underestimates the surge by about a factor of four, which is why it is non-conservative.

The conservative effective closure time is the time over which the flow actually changes:

$$t_{c,eff} \approx \frac{0.2\,t_{stroke}}{0.8} = 0.25\,t_{stroke} = 0.25\times200 = 50\ \mathrm{ms}$$

Use 50 ms. A better practice is to integrate the actual flow-versus-time from the measured $C_v$-versus-stroke curve and the system resistance, but 50 ms is the right first cut and the right number to defend in a review.

**P4 — why cryogenic lines need the post-peak analysis.**

The first peak is followed by a reflected rarefaction that swings the pressure *below* the initial line pressure by roughly the same magnitude. In an ambient hydraulic line the fluid's vapour pressure is a few pascals, so the trough is simply a low pressure and nothing happens. In a cryogenic line the liquid is at or near saturation: LOX at 90 K has $p_v = 1$ bar, and a feed line running at 4–45 bar has only that much margin. As soon as the trough reaches $p_v$ the pressure cannot fall further; the liquid column separates from the valve face and a vapour cavity forms. When the column comes back and the cavity collapses, the two liquid faces meet at a velocity that is not limited by the original line velocity, and the resulting pressure spike can exceed the original Joukowsky peak. So the governing load case is often the *second* event, not the first, and it does not appear at all in an analysis that stops at the first peak.

**P5 — droop is not an accuracy specification.**

Droop is a *systematic, flow-dependent* deviation, not a random tolerance. The regulator delivers its highest outlet pressure at zero flow (lockup) and its lowest at rated flow, and the difference is the droop. Given 2 % droop and a 20 bar nominal set point, the outlet will sit near 20.4 bar at zero flow and fall monotonically to about 20.0 bar at rated flow (or, if the set point is defined at rated flow, from 20.0 up to 20.4 as flow falls to zero — which convention is used must be stated, and often is not).

Consequences the system engineer must handle: (a) tank pressure varies with engine flow, so blowdown-corrected propellant bookkeeping must account for it; (b) the *maximum* pressure the tank sees is the lockup value plus creep plus temperature effects, and that is what sets MEOP, not the nominal set point; (c) an accuracy budget must add droop, supply-pressure effect, temperature sensitivity and set-point tolerance, and the total is what the downstream hardware sees. Treating "2 % droop" as "±2 % accuracy" both understates the peak (because lockup and creep sit on top of it) and misrepresents its nature (it is repeatable and predictable, so it can be compensated).

**P6 — check-valve chatter, and why oversizing causes it.**

The poppet is a mass on a spring. The steady lift is set by the balance between spring force and the fluid force, and the fluid force is a non-monotonic function of lift: as the poppet rises the flow area increases, the local velocity falls, the static pressure under the poppet recovers, and the opening force *decreases*. That negative slope of force with respect to lift is negative damping in the poppet's own degree of freedom, so any small disturbance grows into a limit cycle at the poppet's natural frequency, typically a few hundred hertz, and the poppet hammers its seat.

Oversizing makes it worse because an oversized valve, at the system's actual flow, sits at a small fractional lift — in the middle of the region where the force–lift slope is unfavourable and where the poppet has room to oscillate in both directions. A correctly sized (or deliberately undersized) valve is driven hard against its full-open stop at the design flow, and a poppet resting on a stop cannot oscillate. The design rule is: size the check valve so it is fully open at *minimum* system flow, and accept the resulting higher pressure drop at maximum flow.

**P7 — titanium in oxygen, and the check-valve argument.**

Titanium ignites on mechanical impact in liquid or gaseous oxygen essentially every time it is tested; the oxide layer is thin, the fresh metal is extremely reactive, and the combustion is self-sustaining, so a titanium component in an oxygen system is a candidate ignition site whenever there is impact, friction, particle impingement or adiabatic compression. The same prohibition applies to titanium with nitrogen tetroxide, where stress-corrosion cracking adds a second mechanism.

"It is on the helium side of a check valve" fails as a justification for three reasons. First, a check valve has a leak rate, not a zero: over months of dormancy, seat leakage integrates into a real quantity of oxidiser upstream of the valve. Second, a single check valve is a single-fault-intolerant barrier; a particle under the seat defeats it entirely, and nothing tells you it has happened. Third, the hazard is not merely presence but *impact*, and pressurisation transients through a partly filled line are exactly the mechanism that turns migrated liquid into a high-velocity slug. That combination is what destroyed a Crew Dragon on a test stand in April 2019 [_verify-liquid]. The correct rule is a materials rule, applied to the whole system: no titanium anywhere it could credibly contact the oxidiser, with credibility judged assuming the seat leaks.

**P8 — before accepting "1.5 kHz combustion instability".**

Three measurements, and what each rules out:

1. **A second, flush-mounted high-bandwidth transducer at a different chamber station.** If the 1.5 kHz appears on the flush sensor with the expected mode shape (amplitude varying with azimuthal or axial position), it is a chamber acoustic mode. If it appears only on the recessed/tapped channel, it is the sensing line. This rules in or out the port itself.
2. **The Helmholtz/organ-pipe frequency of the sense line and cavity (Eq. 3.18), computed from as-built dimensions and the gas properties in the line.** If $f_H$ lands near 1.5 kHz, the null hypothesis is instrumentation until proven otherwise. Also check whether the same frequency appears on *every* channel plumbed from the same manifold — that is diagnostic of the plumbing, not the chamber.
3. **The predicted chamber acoustic mode frequencies**, $f = \alpha_{mn} c/(\pi D)$ for transverse modes, using the actual sound speed of the combustion gas. If 1.5 kHz does not correspond to any 1T, 1L, 1R or combination mode within a reasonable uncertainty on $c$, the "acoustic mode" claim has no mechanism.

Supporting evidence worth having: does the frequency shift with chamber pressure or mixture ratio (chamber modes do, in proportion to $\sqrt{T_c}$; a sense-line resonance in a gas-filled line does much less, and one in a liquid-filled line does not at all)? Does it appear before ignition? A tone present during the chill or purge phase is unambiguously not combustion.

### Calculation

**P9 — valve sizing, 60 kg/s LOX at 0.20 bar.**

$$Q = \frac{60}{1140} = 0.052632\ \mathrm{m^3/s} = 189.47\ \mathrm{m^3/h} = 834.2\ \mathrm{US\ gpm}$$

$SG = 1140/999 = 1.1411$; $\Delta p = 0.20$ bar $= 2.9007$ psi.

$$C_v = 834.2\sqrt{\frac{1.1411}{2.9007}} = 834.2\times0.6272 = \mathbf{523}$$

$$K_v = 189.47\sqrt{\frac{1.1411}{0.20}} = 189.47\times2.3886 = \mathbf{453}$$

Check: $523/453 = 1.155$ ✓ (exact 1.156).

$$C_dA = \frac{60}{\sqrt{2\times1140\times20\,000}} = \frac{60}{6752.8} = 8.885\times10^{-3}\ \mathrm{m^2} = \mathbf{88.85\ cm^2}$$

Cross-check with Eq. 3.4: $1.698\times10^{-5}\times523 = 8.88\times10^{-3}$ m². ✓

Line: $A = Q/v = 0.052632/12 = 4.386\times10^{-3}$ m² → $D = 74.7$ mm, so **take 75 mm ID**, giving $A = 4.418\times10^{-3}$ m² and $v = 11.91$ m/s.

$$\tfrac12\rho v^2 = \tfrac12\times1140\times11.91^2 = 80.90\ \mathrm{kPa}
\quad\Rightarrow\quad
K_{req} = \frac{20\,000}{80\,900} = \mathbf{0.247}$$

A full-bore ball valve at $K = 0.07$ clears this with a 3.5× margin (actual drop 5.7 kPa = 0.057 bar). A butterfly valve at $K = 0.4$ would *not* clear it. That is the useful conclusion: the requirement is a real discriminator between valve types even though it looks generous.

**P10 — wave speed and surge, 75 mm × 2 mm 304L, 4.5 m.**

$$a_f = \sqrt{\frac{0.94\times10^9}{1140}} = 908.05\ \mathrm{m/s}, \qquad
\frac{K_f D}{Et} = \frac{0.94\times10^9\times0.075}{200\times10^9\times0.002} = 0.17625$$

$$a = \frac{908.05}{\sqrt{1.17625}} = \mathbf{837.3\ m/s}$$

(Note the smaller diameter makes the pipe stiffer and the wave *faster* than the 100 mm case in WE2 — 837 versus 817 m/s.)

$$\frac{2L}{a} = \frac{9.0}{837.3} = 0.01075\ \mathrm{s} = \mathbf{10.75\ ms}$$

$$\Delta p_J = \rho a v_0 = 1140\times837.3\times11.91 = 1.137\times10^7\ \mathrm{Pa} = \mathbf{113.7\ bar}$$

For a 15 bar cap, since $15 \ll 113.7$ the closure is certainly slow, so use Eq. 3.9:

$$t_c = \frac{2\rho L\Delta v}{\Delta p} = \frac{2\times1140\times4.5\times11.91}{15\times10^5} = 0.0815\ \mathrm{s} = \mathbf{81.5\ ms}$$

Verify $t_c > 2L/a$: 81.5 ms > 10.75 ms ✓, so Eq. 3.9 was the right branch. And remember P3: **81.5 ms is the effective flow-closure time**, so if the valve's characteristic is ball-like, the mechanical stroke must be roughly 4× that — of order 300 ms.

**P11 — RP-1 in the same geometry at the same volumetric flow.**

Same $Q$, same $D$, so the same velocity, 11.91 m/s. Mass flow is now $0.052632\times810 = 42.6$ kg/s.

$$a_f = \sqrt{\frac{1.3\times10^9}{810}} = 1266.9\ \mathrm{m/s}, \qquad
\frac{K_fD}{Et} = \frac{1.3\times10^9\times0.075}{4\times10^8} = 0.24375$$

$$a = \frac{1266.9}{\sqrt{1.24375}} = \mathbf{1136.0\ m/s}, \qquad \frac{2L}{a} = \mathbf{7.92\ ms}$$

$$\Delta p_J = 810\times1136.0\times11.91 = 1.096\times10^7 = \mathbf{109.6\ bar}$$

$$t_c\ \text{for 15 bar} = \frac{2\times810\times4.5\times11.91}{15\times10^5} = \mathbf{57.9\ ms}$$

**Which is larger, and why.** LOX gives the larger surge — 113.7 bar against 109.6 bar — but only by 4 %. The two competing effects are visible in $\rho a$:

- **Density.** LOX is 41 % denser, which raises the impedance.
- **Stiffness.** RP-1's bulk modulus is 38 % higher and its density lower, so its free acoustic speed is 40 % higher (1267 vs 908 m/s), which raises the impedance the other way.

The impedances end up at $9.55\times10^5$ (LOX) and $9.20\times10^5$ (RP-1) Pa/(m/s), a ratio of 0.964. **The two effects very nearly cancel.** The practical lesson: for surge purposes, common rocket liquids in steel lines all sit within a factor of about 1.2 of $10^6$ Pa per (m/s), so "roughly 10 bar per m/s" is a serviceable mental model regardless of propellant, and the real design variables are velocity, length and closure time — not fluid choice.

**P12 — 9.0 m × 75 mm ID × 1.6 mm wall 304L between anchors.**

$$\Delta L = 1.40\times10^{-5}\times9.0\times203 = 0.02558\ \mathrm{m} = \mathbf{25.6\ mm}$$

$$\sigma_r = E\bar\alpha\Delta T = 200\times10^9\times2.842\times10^{-3} = \mathbf{568.4\ MPa}$$

Wall area at mean diameter $D_m = 0.0766$ m:

$$A_w = \pi\times0.0766\times0.0016 = 3.850\times10^{-4}\ \mathrm{m^2} = 3.85\ \mathrm{cm^2}$$

$$F_{elastic} = 568.4\times10^6\times3.850\times10^{-4} = \mathbf{218.9\ kN}$$

but the material yields first, at $340\times10^6\times3.850\times10^{-4} = \mathbf{130.9\ kN}$.

Buckling, with $D_o = 0.0782$ m, $D_i = 0.075$ m:

$$I = \frac{\pi}{64}(0.0782^4 - 0.075^4) = 2.825\times10^{-7}\ \mathrm{m^4}$$

$$P_{cr} = \frac{\pi^2\times200\times10^9\times2.825\times10^{-7}}{9.0^2} = \mathbf{6.9\ kN}$$

**Which fails first.** On chilldown the line is in *tension*, so buckling does not apply and the line yields in tension at 130.9 kN — but 130.9 kN is still a load that will destroy typical brackets and will overload the tank and engine attachment points. On the subsequent warm-up the line is in *compression*, and it buckles at 6.9 kN — a load reached almost immediately, at a strain of only $6.9/218.9 = 3.2$ % of the full thermal strain, i.e. a temperature change of about 6 K. **The line bows on the very first warm-up.** Buckling governs by a factor of nineteen against yield and thirty-two against the elastic load, and the longer, thinner line makes it far worse than the WE3 case.

**Fix.** An axial bellows or expansion joint in the run, with tie rods to react its pressure thrust, plus one anchor and lateral guides elsewhere; or, if a bellows is unacceptable (fatigue, cost, cleanliness), an out-of-plane expansion loop sized so the bending stress at the loop stays below the allowable — for 25.6 mm of movement in a 75 mm line that is a substantial loop, of order a metre of offset leg, which is usually why the bellows wins.

**P13 — bellows pressure thrust versus spring force.**

$$A_{eff} = \frac{\pi}{4}(0.158)^2 = 1.9607\times10^{-2}\ \mathrm{m^2}$$

$$F_p = pA_{eff} = 30\times10^5\times1.9607\times10^{-2} = \mathbf{58.8\ kN}$$

$$F_b = k\,\Delta L = 120\,000\times0.014 = \mathbf{1680\ N}$$

**Comment.** The pressure thrust is 35 times the spring force. Everything about the installation is therefore driven by the pressure thrust: it is what the tie rods, the gimbal ring or the balancing bellows must react, and it is what will tear the joint apart if the restraint is omitted or under-designed. The spring force — the thing the bellows was *installed* to reduce — is by comparison a rounding error against the 6.9–219 kN of a restrained hard line (P12), which is precisely why the bellows is worth having.

A second observation worth making in an exam answer: $F_p$ scales with $D^2$ while $F_b$ scales with $\Delta L$, so as line size grows the pressure thrust dominates ever more completely. On a 250 mm gimbal duct at 40 bar the thrust is about 200 kN, and no bellows survives that unrestrained.

**P14 — relief valve for a 12 mm² regulator failed open from 31 MPa.**

Choked flow through the failed regulator ($\Gamma = 0.72623$, $R = 2077.26$, $T_0 = 290$ K):

$$\dot m = \frac{0.72623\times1.2\times10^{-5}\times31\times10^6}{\sqrt{2077.26\times290}} = \frac{270.2}{776.2} = \mathbf{0.348\ kg/s}$$

Relieving condition: MEOP 15 bar, 10 % accumulation → full flow at $p_{rel} = 16.5$ bar; gas at 240 K.

$$C_dA_{relief} = \frac{\dot m\sqrt{RT}}{\Gamma p_0} = \frac{0.348\times\sqrt{2077.26\times240}}{0.72623\times16.5\times10^5} = \frac{0.348\times706.1}{1.1983\times10^6} = 2.051\times10^{-4}\ \mathrm{m^2}$$

$$= \mathbf{205\ mm^2} \quad\Rightarrow\quad A_{geom} = \frac{205}{0.85} = 241\ \mathrm{mm^2} \Rightarrow D = \mathbf{17.5\ mm}$$

Ratio check against Eq. 3.13:

$$\frac{205}{12} = 17.1 \qquad\text{vs}\qquad \frac{p_{supply}}{p_{relief}}\sqrt{\frac{T_{relief}}{T_{supply}}} = \frac{31\times10^6}{16.5\times10^5}\sqrt{\frac{240}{290}} = 18.79\times0.9096 = 17.1\ \checkmark$$

Note this case is *worse* than WE4 (ratio 17.1 versus 9.5) because the supply-to-relief pressure ratio is larger. A relief valve seventeen times the regulator's flow area is a very unattractive component, and it is the strongest possible argument for the series-redundant-regulator architecture of WE4 Step 5.

**P15 — manifold sizing for 1.5 % maldistribution.**

$$\sum A_{or} = 320\times\frac{\pi}{4}(0.0018)^2 = 320\times2.5447\times10^{-6} = 8.143\times10^{-4}\ \mathrm{m^2} = \mathbf{814.3\ mm^2}$$

From Eq. 3.14, $\delta\dot m/\dot m = C_d^2/(2AR^2)$, so

$$AR = C_d\sqrt{\frac{1}{2\,\delta}} = 0.80\sqrt{\frac{1}{2\times0.015}} = 0.80\times5.7735 = \mathbf{4.62}$$

$$A_m = 4.62\times814.3 = \mathbf{3761\ mm^2} = 37.6\ \mathrm{cm^2}$$

As an annulus on a 250 mm diameter dome, mean circumference $\pi\times0.250 = 0.7854$ m:

$$h = \frac{3.761\times10^{-3}}{0.7854} = 4.79\times10^{-3}\ \mathrm{m} = \mathbf{4.8\ mm}$$

**Comment.** Under 5 mm of annulus height is entirely buildable, which is the point: the manifold area rule is rarely the binding constraint on a well-laid-out dome. It becomes binding when the manifold must also route around igniter bosses, instrumentation ports and structural ribs — those obstructions reduce the *local* area and therefore the local $AR$, and the maldistribution is set by the worst section, not by the average.

**P16 — bellows shedding frequency.**

$$f_s = St\frac{v}{q} = St\times\frac{18}{0.012} = St\times1500\ \mathrm{Hz}$$

$$St = 0.2 \Rightarrow 300\ \mathrm{Hz}; \qquad St = 0.5 \Rightarrow 750\ \mathrm{Hz}$$

**Yes, there is a problem.** The band 300–750 Hz brackets the measured 480 Hz shell mode comfortably; the resonant velocity is $v = f q/St = 480\times0.012/St$, i.e. 11.5 m/s at $St = 0.5$ and 28.8 m/s at $St = 0.2$, so the bellows will pass through lock-in somewhere inside its operating flow range. This is the classic flow-induced-vibration setup, and the failure will occur in minutes of running, not in the gimbal-cycle count.

**What to change first: fit an internal flow liner.** A smooth sleeve inside the bellows removes the convolutions from the flow path entirely, so there is no periodic cavity array to shed off and Eq. 3.16 stops applying. It is cheap, it is standard practice for exactly this reason, and it does not require you to have got the Strouhal number right. Detuning (changing pitch or ply thickness to move the shell mode out of the band) is the second choice, and it is fragile because the $St$ range is wide and the mode frequency is not precisely predictable; reducing velocity by enlarging the duct is third, and it costs mass and envelope everywhere.

**P17 — RS-25 main oxidiser valve at 109 %.**

$$\dot m_{tot} = \frac{F_{vac}}{I_{sp}g_0} = \frac{2.279\times10^6}{452.3\times9.80665} = 513.8\ \mathrm{kg/s}$$

$$\dot m_{ox} = \frac{MR}{1+MR}\dot m_{tot} = \frac{6.03}{7.03}\times513.8 = \mathbf{440.7\ kg/s}, \qquad \dot m_f = 73.1\ \mathrm{kg/s}$$

$$Q = \frac{440.7}{1140} = 0.38659\ \mathrm{m^3/s} = 386.6\ \mathrm{L/s} = 1392\ \mathrm{m^3/h} = 6128\ \mathrm{US\ gpm}$$

At $\Delta p = 0.5$ bar (0.726 psi), $SG = 1.1411$:

$$C_v = 6128\sqrt{\frac{1.1411}{0.7256}} = 6128\times1.2540 = \mathbf{2431}, \qquad K_v = \mathbf{2103}$$

$$C_dA = \frac{440.7}{\sqrt{2\times1140\times50\,000}} = \frac{440.7}{10\,677} = 0.04128\ \mathrm{m^2} = \mathbf{412.8\ cm^2}$$

**Sanity check.** 412.8 cm² of effective area corresponds to a 229 mm equivalent orifice at $C_d = 1$; a full-bore ball valve achieving it needs a bore of roughly 200–230 mm, which is the right physical scale for a main oxidiser valve on a 2.3 MN engine. Note also that $\dot m_f = 73$ kg/s of hydrogen at roughly 70 kg/m³ is over 1 m³/s of volumetric flow — six times the LOX volume — which is why the hydrogen-side plumbing on this engine is so much larger than the oxygen side, and why the main fuel valve, not the main oxidiser valve, is the biggest valve on the engine.

### Engineering reasoning

**P18 — hard start on the twenty-first attempt, MFV 60 ms late.**

The physics first: a late main fuel valve on a fuel-lead start means the fuel arrives late relative to the oxidiser and the igniter. Sixty milliseconds is enough to let oxidiser accumulate in the chamber before fuel arrives, so ignition occurs in a much larger and more oxidiser-rich charge than designed. The energy release is the accumulated propellant, not the steady-state flow, hence the overpressure and the injector damage.

Three candidate mechanisms for the delay, with discriminating data:

1. **Galling or wear in the valve's stem/bearing interface, progressing with cycles.** *Distinguishing data*: the trend of stroke time across all twenty-one runs. Galling produces a monotonic creep, not a step. Also actuator pressure or motor current at the same commanded rate — a galling valve needs more force for the same motion. Teardown will show scoring on the stem and bearing.
2. **Moisture ice in the actuator or stem cavity.** *Distinguishing data*: ambient dew point and purge flow on the day; whether the valve frees itself on warm-up (ice does, galling does not); whether the delay correlates with hold time at cryogenic temperature rather than with cycle count. Also check the purge system's own history: a purge regulator that has drifted low will show as a small, unremarked pressure change days earlier.
3. **Pneumatic supply degradation** — a helium bottle drifting down, a regulator drooping under a changed duty cycle, or a leak in the actuator supply. *Distinguishing data*: actuator supply pressure at the moment of command, and the pilot solenoid's own response time. A supply problem lengthens the stroke uniformly and affects both valves; a mechanical problem affects one.

A fourth candidate worth naming: **a contamination particle**, which produces a one-off delay with no trend, and which would show on the upstream filter or on teardown.

**Which to investigate first: the stroke-time trend across all twenty-one runs**, because it is free (the data already exist), it is the fastest discriminator between the mechanisms — a monotonic creep points at galling, a step at ice or contamination, and a correlation with supply pressure at the pneumatics — and because it also tells you whether this was a foreseeable failure that the team failed to trend, which changes what you do about it going forward. [J] The corrective action is different in each case, but the *process* corrective action is the same in all of them: stroke time becomes a trended acceptance parameter with a redline, not a pass/fail check against a wide spec.

**P19 — bellows fails after 4 minutes of hot fire despite a 20 000-cycle qualification.**

**Diagnosis: flow-induced vibration.** The gimbal fatigue qualification counted gimbal cycles — of order 20 000 — accumulated at a few hertz. Flow past the convolutions sheds vortices at $St\,v/q$, which for typical numbers (15 m/s, 10 mm pitch, $St = 0.3$) is 450 Hz. Four minutes at 450 Hz is $450\times240 = 1.08\times10^5$ cycles, five times the entire qualification count, and at an amplitude set by resonant response rather than by a controlled deflection. If the shedding frequency locked onto a shell mode, the local strain per cycle can exceed the gimbal-qualification strain by a large factor. The failure is a fatigue crack at a convolution root — the same failure mode the qualification tested, arrived at by a loading path the qualification never applied.

Two alternatives should be considered and dismissed on evidence. *Squirm* would leave a permanently bowed bellows with crushed convolutions on one side, visible immediately; *thermal ratcheting* would show as a progressive length change and would not be time-correlated with flow. If the part is straight and the crack is a clean fatigue crack at a root, FIV is the diagnosis.

**The measurement that would have caught it:** accelerometers mounted on the duct during a flow test at maximum velocity, with a spectrum. FIV shows as a narrowband peak whose frequency scales linearly with velocity — that linear scaling is the signature, because a structural resonance excited by broadband turbulence would not move with velocity while the shedding tone does, up until lock-in, where it pins to the structural mode over a velocity band. Sweeping flow velocity and plotting peak frequency against velocity resolves the question in a single test. Strain gauges at a convolution root are better still if they can be attached.

**The design change: fit an internal flow liner**, sized so the annulus between liner and convolution roots is dead fluid, with the liner anchored at one end and free at the other so it does not itself become a restraint. Secondary changes if the liner is impossible: reduce velocity by increasing duct diameter; change convolution pitch to move the shedding band away from the shell modes; increase ply count at constant total thickness to raise damping and lower per-ply bending stress. Re-qualify with a flow test, not just a gimbal test — that is the real corrective action, because the qualification program, not the part, was what failed.

**P20 — relief valve versus series regulators plus burst disk.**

**Team A (single relief valve sized for regulator-failed-open).**
*Mass*: bad. By Eq. 3.13 the relief valve's flow area must exceed the regulator seat area by the supply-to-relief pressure ratio, which for a typical 250 bar supply into a 20 bar tank is a factor of ten, and for P14's numbers seventeen. That is a large, heavy valve plus a large vent duct plus a reaction load into the structure.
*Failure tolerance*: it is genuinely single-fault tolerant to the stated fault, and it is verifiable — you can flow-test the relief valve at rated capacity, which is a real advantage.
*When it operates*: the system is depressurised only to the reseat pressure and then recloses, so the mission may survive. That is the one thing a relief valve does that a disk cannot.
*Weakness*: a relief valve is a seat, so it leaks, and its leakage is a continuous propellant/pressurant loss over a long mission. It can also chatter.

**Team B (series regulators + small relief + burst disk).**
*Mass*: much better. The second regulator is a fraction of the mass saved on the relief valve, and the burst disk is very light per unit flow area.
*Failure tolerance*: "regulator failed open" now requires two independent failures, which for genuinely dissimilar or at least independently-sourced regulators is a defensible reduction in credibility. The residual single-fault cases — creep, thermal soak — are handled by the small relief valve. The burst disk covers everything else, including cases nobody enumerated.
*When it operates*: if the burst disk fires, the stage is vented and the mission is over, with no recovery.
*Weakness*: the argument rests on the two regulators failing independently. Common-cause failures — the same contamination source, the same lot of soft goods, the same thermal environment, the same design error — defeat series redundancy entirely, and this is the standard critique. Series regulators also stack their droop and their leakage.

**(a) Expendable upper stage: Team B.** Mass is the dominant currency, the mission is short so leakage integrated over time is small, and the burst disk's "mission over" consequence is acceptable against the probability of it ever firing. Insist that the two regulators be from different lots at minimum and, if the budget allows, of different design, and that the common-cause analysis be written down rather than asserted.

**(b) Crewed vehicle: it depends on what the vented system does to the crew, and the answer is usually a hybrid.** If venting the pressurant means losing a deorbit burn, the burst disk is not an acceptable primary protection and you want the relief valve's recoverability *as well as* the series regulators — accepting the mass. If the system is non-critical (an experiment feed), Team B is fine. The general crewed-vehicle rule is that you buy failure *tolerance* rather than failure *probability*, because the probabilistic argument for independence is exactly the argument that has historically been wrong; so the crewed answer leans toward architectures whose safety does not depend on estimating a correlation coefficient. [J]

**P21 — smooth 400 ms rise versus a 90 bar spike at 180 ms.**

**Explanation of the discrepancy.** The smooth trace comes through a pressure tap, a sense line and a transducer cavity. That assembly is a low-pass filter (and a resonator, Eq. 3.18): a 4 ms event has most of its energy above 250 Hz, and a long, small-bore, gas-filled sense line rolls off well below that. The transducer therefore reports the *time-averaged* pressure, and a 90 bar, 4 ms spike averaged over the filter's response time appears as a barely perceptible bump on a 400 ms ramp — or as nothing at all. The flush-mounted transducer has no cavity and a bandwidth of tens of kHz, so it reports the spike as it happened.

**Which trace to believe: the flush-mounted one**, unambiguously, for the transient. The tapped trace is still a valid steady-state measurement and is probably the more accurate one for slowly varying absolute pressure (a flush transducer in a hot section drifts thermally); the two instruments are answering different questions. The correct statement is not "one is wrong" but "the tapped channel has a bandwidth of a few tens of hertz and cannot be used to make a statement about a 4 ms event".

**What to change about the instrumentation.** Characterise the tapped channel's transfer function (compute $f_H$ from as-built dimensions, and confirm it with a shock-tube or step-response calibration) and publish the bandwidth alongside every trace, so nobody again writes "no overshoot observed" from a channel incapable of observing overshoot. Add at least one more flush-mounted high-bandwidth transducer at a different chamber station so the spike's spatial extent is measurable, and add one on the injector manifold to see whether the event is chamber-side or feed-side. Sample at least 20 kHz on the dynamic channels.

**What to change about the engine.** A 90 bar spike at 180 ms into the start is an ignition overpressure: propellant accumulated and then lit. Investigate the valve sequence around 180 ms — most likely the oxidiser valve is admitting flow before the igniter is established, or the fuel lead is too short. Corrective actions, in order: verify igniter light-off with its own dedicated instrumentation and gate the main valve opening on confirmed ignition; lengthen the fuel lead; slow the initial portion of the oxidiser valve ramp so less propellant accumulates per unit time. Then re-run and confirm on the flush channel — because the tapped channel will look identical either way, which is the whole point of the problem.

### Mini trade study

*(See K3 for the reference solution and rubric.)*

---

## K2. Quiz answers with explanations

**Q1 (8 pts).** From Eq. 3.4:

$$C_dA = 1.698\times10^{-5}\times400 = 6.792\times10^{-3}\ \mathrm{m^2} = \mathbf{67.9\ cm^2}$$

$$K_v = 0.865\times400 = \mathbf{346}$$

*(4 pts each. Full marks for the area only if the unit conversion to cm² is right; a common slip is $6.79\times10^{-3}$ cm².)* Sanity check: 67.9 cm² is a 93 mm equivalent orifice, so a $C_v$ of 400 belongs to a valve of roughly 100 mm bore or a smaller valve at partial lift.

**Q2 (8 pts).** **(c) substantially longer than 20 ms.**

Below $t_c = 2L/a$ the reflected relief wave has not returned and the surge is capped at the full Joukowsky value $\rho a\Delta v$; closing faster than that produces no further increase but also no reduction, so (a) is exactly backwards — it maximises the surge rather than minimising it. (b) sits at the boundary and is still at essentially the full Joukowsky value. (d) confuses the rapid-closure limit with the general case: Joukowsky *is* independent of $t_c$, but only in the regime where it applies, and Eq. 3.9 shows the surge falling as $1/t_c$ outside it.

**Q3 (12 pts).**

$$a_f = \sqrt{\frac{K_f}{\rho}} = \sqrt{\frac{0.94\times10^9}{1140}} = 908.05\ \mathrm{m/s}$$

$$\frac{K_fD}{Et} = \frac{0.94\times10^9\times0.080}{200\times10^9\times0.002} = 0.188
\quad\Rightarrow\quad
a = \frac{908.05}{\sqrt{1.188}} = \mathbf{837.3\ m/s}$$

$$\Delta p_J = \rho a\Delta v = 1140\times837.3\times11 = 1.0499\times10^7\ \mathrm{Pa} = \mathbf{105\ bar}$$

*(4 pts for $a_f$, 4 for the Korteweg correction, 4 for the surge. Omitting the wall-compliance correction gives 113.9 bar — an 8 % error and a partial credit answer; using the free-liquid speed and not saying so loses 4.)*

**Q4 (8 pts).** **(b)** the fall in outlet pressure between lockup and rated flow, caused by the loading spring being compressed as the poppet lifts.

(a) is seat leakage, which causes *creep*, not droop. (c) is creep. (d) is the body pressure loss, a separate and usually much smaller effect that does not depend on the feedback loop. The distinguishing feature of droop is that it is a *systematic function of flow* arising from the regulator's own force balance (Eq. 3.10), which is why replacing the spring with a gas dome nearly eliminates it.

**Q5 (12 pts).**

$$\Delta L = 1.40\times10^{-5}\times5.0\times203 = 0.01421\ \mathrm{m} = \mathbf{14.2\ mm}$$

$$\sigma_r = E\bar\alpha\Delta T = 200\times10^9\times(1.40\times10^{-5}\times203) = 200\times10^9\times2.842\times10^{-3} = \mathbf{568\ MPa}$$

**Does it yield?** Yes. 568 MPa exceeds the 340 MPa cryogenic yield strength by 67 %, so the line cannot develop the full elastic restraint force; it yields in tension on chilldown and work-hardens.

**What you actually see on the stand.** Not a tension failure. On warm-up the yielded (now too short) line goes into compression, and a 5 m slender tube buckles at a small fraction of its yield load — Euler, not yield, governs the compressive case. **The expected symptom is a permanently bowed line with sheared or bent support clamps and damaged instrumentation leads**, appearing after the first thermal cycle, with no pressure event in the data to explain it.

*(3 pts contraction, 3 pts stress, 3 pts the yield judgment with the comparison stated, 3 pts naming buckling on warm-up. An answer that stops at "it yields" scores 9.)*

**Q6 (8 pts).** **(c)** to prevent flow-induced vibration by removing the convolutions from the flow path.

(a) is a real but incidental benefit and not the reason. (b) is a common and wrong belief — liners are not erosion shields, and a bellows in a properly filtered system does not see erosive particles. (d) is wrong and is the dangerous confusion: the pressure thrust is reacted by tie rods, a gimbal ring or a balancing bellows, and a liner carries none of it. Confusing the two leads to omitting the restraint, which is a joint-separation failure.

**Q7 (12 pts).** Failed regulator, choked ($\Gamma = 0.72623$, $R = 2077.26$ J/kg·K):

$$\dot m = \frac{\Gamma C_dA\,p_0}{\sqrt{RT_0}} = \frac{0.72623\times1.5\times10^{-5}\times28\times10^6}{\sqrt{2077.26\times300}} = \frac{305.0}{789.4} = \mathbf{0.386\ kg/s}$$

Relief valve at 30 bar, 260 K:

$$C_dA_{relief} = \frac{\dot m\sqrt{RT}}{\Gamma p_0} = \frac{0.386\times\sqrt{2077.26\times260}}{0.72623\times30\times10^5} = \frac{0.386\times734.9}{2.1787\times10^6} = 1.303\times10^{-4}\ \mathrm{m^2}$$

$$= \mathbf{130.3\ mm^2} \quad\Rightarrow\quad \text{at } C_d = 0.85,\ A = 153\ \mathrm{mm^2},\ D = 14.0\ \mathrm{mm}$$

Ratio check (Eq. 3.13): $130.3/15 = 8.69$ against $(28/3.0)\sqrt{260/300} = 9.333\times0.9309 = 8.69$ ✓

*(6 pts for the escaping flow, 6 for the relief area. Using 25 bar rather than the 30 bar relieving pressure is a 20 % error and loses 2; forgetting that the relief valve is choked and using an incompressible relation loses 6.)*

**Q8 (10 pts).** **Consequence:** for the last 30 ms of the shutdown the chamber runs oxidiser-rich, with oxidiser flowing into a chamber that is still at high temperature and whose walls have no fuel-film protection. Hot oxygen plus a hot metal injector face is an ignition condition; the symptom is a burned or eroded injector face, burned baffles, and streaking on the chamber wall, appearing gradually over many firings rather than all at once.

**Is it acceptable?** No, not as a design intent, and particularly not on a reusable engine where the damage accumulates. A brief fuel-rich *overrun* (oxidiser closing first) is the acceptable direction; a fuel-lead shutdown is the wrong direction. On a single-use engine with a short tail-off it may be tolerable if hot-fire inspection shows no damage — but that is a decision made on inspection evidence, not on analysis.

**What to change**, in order of preference: (1) **re-sequence** — command the oxidiser valve closed 50 ms *before* the fuel valve, so the closure order is inverted with margin; this is a software change and costs nothing. (2) If the actuators cannot be independently timed, retard the fuel valve mechanically (a smaller pilot orifice, a stiffer return spring on the oxidiser side) so the hardware enforces the order. (3) Add a **fuel-side purge** at shutdown that keeps the injector face covered while the oxidiser bleeds down. (4) Verify with high-rate position feedback on both valves over a statistically meaningful number of shutdowns, not one — the 30 ms is a mean, and the tail of the distribution is what burns hardware.

*(3 pts consequence with mechanism, 3 pts the judgment, 4 pts a concrete and ordered fix. "Close them at the same time" scores poorly: simultaneous closure has no margin, and the correct answer is a deliberate oxidiser lead in closure.)*

**Q9 (10 pts).** From Eq. 3.14:

$$\frac{\delta\dot m}{\dot m} = \frac{C_d^2}{2AR^2} = \frac{0.78^2}{2\times2.5^2} = \frac{0.6084}{12.5} = 0.0487 = \mathbf{4.9\ \%}$$

**Is the hot streak consistent?** Yes, and the location is the confirmation. The dead end of the manifold — the point diametrically opposite the inlet — is where the inlet dynamic head has been fully recovered as static pressure, so those orifices see the highest $\Delta p$ and pass the most flow. If those are oxidiser orifices, the local mixture ratio there rises toward oxidiser-rich, the local gas temperature rises, and the wall opposite the inlet runs hot. A 4.9 % flow excess is easily enough to produce a visible streak: a few percent local mixture-ratio shift moves the local flame temperature by tens to a couple of hundred kelvin, and wall heat flux scales strongly with it.

**Cheapest fix that does not enlarge the manifold: add a second inlet on the opposite side.** Two diametrically opposed inlets halve the flow path length and, more importantly, halve the flow each half-manifold carries, so $v_m$ halves and the dynamic head — which goes as $v_m^2$ — falls by four, taking the maldistribution from 4.9 % to about 1.2 %. It costs one tee and a short length of line, changes no machined part, and it is the standard fix. (Second-cheapest: taper or partially block the manifold near the dead end so the velocity does not decelerate as sharply; third: reduce the orifice $C_d$ or increase injector $\Delta p$, both of which cost real performance.)

*(4 pts for the number, 3 for the consistency argument including the *why* of the location, 3 for the twin-inlet fix with a reason. "Enlarge the manifold" scores zero on the last part because the question excludes it.)*

**Q10 (12 pts).** The requirement is four years of dormancy, a hypergolic oxidiser on one side and helium on the other, and a single burn.

- **(a) Two check valves in series.** *Leakage over four years:* poor. Two seats in series reduce but do not eliminate migration, and the failure is *cumulative* — four years is over $10^8$ seconds, so even $10^{-6}$ scc/s integrates to tens of standard cc of oxidiser upstream. This is the architecture that destroyed a Crew Dragon [_verify-liquid]. *Testability:* good; you can leak-check the flight article. *Fault tolerance:* nominally two-fault, but the failures are strongly common-cause (same contamination source, same seat material, same oxidiser). *Failure directions:* fails-to-seal gives migration; fails-to-open blocks pressurisation and loses the burn.
- **(b) Burst disk.** *Leakage:* essentially zero — it is a solid metal wall. *Testability:* lot-sample only; the flight article is never functionally tested, which is a genuine drawback. *Fault tolerance:* single-string, but the failure modes are few and well understood (bursts early → premature pressurisation; fails to burst → no pressurisation, no burn). *Failure directions:* both are mission-loss, neither is catastrophic in the way oxidiser migration is. A burst disk also cannot be re-closed, which for a single burn does not matter.
- **(c) Normally closed pyrotechnic valve.** *Leakage:* essentially zero, same argument as the disk. *Testability:* lot-sample plus, uniquely, an electrical continuity and bridgewire-resistance check on the flight article, so you get more confidence than a disk gives. *Fault tolerance:* single-string on the cartridge, mitigated by dual bridgewires with independent firing circuits, which is standard. *Failure directions:* fails to fire → no burn; fires early → premature pressurisation. *Extra property:* it is commanded, so the barrier is not breached until you choose, which for a four-year dormancy is exactly right.
- **(d) Latching solenoid valve.** *Leakage:* it is a seat, so the same objection as (a), though a good latching valve is far tighter than a check valve. *Testability:* excellent — the flight article can be cycled and leak-checked. *Fault tolerance:* single-string mechanically; can stick. *Failure directions:* leaks → migration; fails closed → no burn; fails open after latching → nothing, since it was going to be open anyway.

**Recommendation: (c), the normally closed pyrotechnic valve**, with a burst disk as the acceptable alternative. Both are barriers rather than seats, which is the decisive property: over a four-year dormancy the integrated leakage of *any* seat is the dominant risk, and this is precisely the failure that has already destroyed hardware. The pyro valve is preferred over the disk because it is commanded (so the barrier's breach is scheduled, not pressure-triggered), because the flight article gets a real if partial check, and because dual bridgewires give genuine redundancy on the only active element. Pair it with a downstream check valve if you also need protection against a *later* reverse-flow transient — but the check valve is then a secondary refinement behind a barrier, not the barrier itself.

*(3 pts for treating leakage as an integral over four years rather than an instantaneous rate; 3 pts for distinguishing barriers from seats; 3 pts for a defensible recommendation with reasons; 3 pts for addressing failure in both directions for the chosen option. An answer recommending (a) can still score up to 9 if it explicitly confronts the integrated-leakage argument and the 2019 precedent and gives a reason to override them — but it should not score full marks, because the historical evidence is against it.)*

---

## K3. Trade-study reference solution

### P22 — main oxidiser valve, 1.2 MN LOX/methane staged-combustion engine

**Recommendation: Option B — full-bore ball valve with an electromechanical actuator and a spring-loaded fail-closed clutch.**

#### The numbers a strong answer produces first

**Line size and velocity.** $\dot m_{ox} = 280$ kg/s, $\rho_{LOX} = 1140$ kg/m³ →

$$Q = \frac{280}{1140} = 0.2456\ \mathrm{m^3/s}$$

At a target 15 m/s: $A = 0.01637$ m² → $D = 144$ mm. **Take a 150 mm ID line**, giving $A = 0.01767$ m² and $v = 13.90$ m/s.

**Full-open pressure drop.**

$$\tfrac12\rho v^2 = \tfrac12\times1140\times13.90^2 = 110.1\ \mathrm{kPa} = 1.10\ \mathrm{bar}$$

The 1.5 bar requirement therefore corresponds to $K \le 1.36$. Screening the options:

| option | $K$ | $\Delta p$ | verdict |
|---|---|---|---|
| A, B (full-bore ball) | 0.07 | 0.077 bar | 20× margin |
| C (visor) | 0.2 | 0.22 bar | 7× margin |
| D (butterfly) | 0.4 | 0.44 bar | 3× margin |

**All four pass**, which is the first useful finding: $\Delta p$ does not discriminate here, so the decision must be made on the other requirements. A candidate who stops at $\Delta p$ has not done the trade.

**Actuator sizing and how it scales with 380 bar.** This is where the options separate.

- A *ball or butterfly* valve is a rotary device: the actuator supplies torque against seal friction, bearing friction and (for the butterfly) hydrodynamic torque on the disc. Seal friction scales with seat contact load, which scales with $p\times A_{seal}$, so at 380 bar and a 150 mm seat the seat load is of order $380\times10^5\times\tfrac{\pi}{4}(0.15)^2 = 671$ kN pressing the ball into the downstream seat. Breakaway torque is that load times a friction coefficient times an effective radius: with $\mu = 0.15$ and $r_{eff} = 0.08$ m, roughly $671\,000\times0.15\times0.08 \approx 8$ kN·m. That is a serious actuator but a buildable one, and crucially it does **not** scale with the full pressure-times-bore *force*.
- A *visor/gate* valve translating across the bore faces the same 671 kN normal load in sliding friction, i.e. of order 100 kN of actuation force, in a linear stroke of at least 150 mm. That is a very large hydraulic cylinder and a large hydraulic supply.
- The **butterfly's specific problem** is hydrodynamic torque on the disc, which at 13.9 m/s and 380 bar is large, varies with angle and *reverses sign*, so the actuator must both drive and restrain, and any backlash lets the disc slam.

**Closure surge.** Assume a 4 m line from the pump discharge to the valve, 150 mm ID, 3 mm wall (needed for 380 bar: $\sigma_\theta = pD/2t = 380\times10^5\times0.15/0.006 = 950$ MPa — actually too high for 304L, so this line is Inconel 718 with $t \approx 4$ mm; a strong answer notices this).

$$\frac{K_fD}{Et} = \frac{0.94\times10^9\times0.15}{200\times10^9\times0.004} = 0.176 \Rightarrow a = \frac{908}{\sqrt{1.176}} = 837\ \mathrm{m/s}$$

$$\frac{2L}{a} = \frac{8.0}{837} = 9.6\ \mathrm{ms}, \qquad \Delta p_J = 1140\times837\times13.90 = 1.326\times10^7 = 133\ \mathrm{bar}$$

The abort requirement is closure within 150 ms. If the valve closes linearly in flow over 150 ms:

$$\Delta p = \frac{2\rho L\Delta v}{t_c} = \frac{2\times1140\times4.0\times13.90}{0.150} = 8.45\times10^5\ \mathrm{Pa} = 8.5\ \mathrm{bar}$$

on top of 380 bar — 2.2 %, entirely acceptable. **But** applying the P3 correction for a ball valve's nonlinear characteristic, the effective closure time is roughly $t_{stroke}/4$, so a 150 ms stroke gives $t_{c,eff} \approx 38$ ms and a surge of about 34 bar (9 % over line pressure). That is still acceptable against a 1.5 proof factor, but it must be *stated*, and it drives the closure schedule: **command a two-rate closure — fast through the first 60 % of stroke, deliberately slowed through the last 40 %** — which both meets the 150 ms abort requirement and holds the surge near the linear-closure value. This is exactly the capability that argues for an actuator with a programmable profile.

#### The decision

**Option A (pneumatic, spring return)** — the fail-closed mechanism is the best of the four: a compressed spring needs no power and no fluid, and it is the traditional answer. But three problems. First, the required torque is ~8 kN·m, and a pneumatic actuator delivering that at a workable helium pressure is large and heavy. Second, and decisive, **pneumatic actuation cannot execute a shaped closure profile**: the stroke rate is set by the pilot orifice, the supply pressure and the temperature, so the two-rate closure above cannot be reliably commanded, and the surge is whatever the hardware happens to do that day. Third, a second start after 30 minutes in space requires the helium supply to still be there and at temperature; that is achievable but adds a stored-gas budget and a whole failure domain.

**Option B (EMA, spring-loaded fail-closed clutch)** — meets the torque requirement with a ball screw or harmonic drive at reasonable mass; gives an **arbitrary programmable closure profile**, which is what the surge analysis needs and what the second-start requirement rewards (start ramps can be tuned between flights without re-plumbing); needs no working fluid at all, so nothing to run out of for the second start; and gives free health monitoring from motor current, which directly addresses the 50-flight reusability requirement by making galling visible as a current trend before it becomes a stuck valve (§7.2). The fail-closed clutch is the weak point and must be argued: it is a spring driving the valve closed through a normally-engaged clutch that releases the motor on loss of power. **If the clutch fails to release, the valve stays where it is** — so the clutch needs its own redundancy (dual release solenoids on independent circuits) and its own qualification, and this is the item to test first. That is a bounded, testable risk.

**Option C (visor + hydraulic HPU)** — the visor's clear bore is attractive and its $\Delta p$ is fine, but the ~100 kN linear actuation force over a 150 mm stroke demands a large hydraulic system, and a hydraulic power unit is a finite fluid inventory with a whole failure domain (§6.2 — running out of hydraulic fluid has ended flights). Visor valves are also slow, which fights the 150 ms abort requirement. Reject.

**Option D (butterfly + EMA + parallel pyro shutoff)** — the parallel pyro valve is a category error: a pyrotechnic valve in *parallel* with the main valve does not shut anything off; a pyro shutoff must be in *series* with the flow. Even reading the intent charitably as a series pyro valve, it is single-use, so it cannot serve an abort function on a vehicle that must fly 50 times and restart in space — every abort would consume a component that must then be replaced, and the flight article can never be tested. The butterfly's reversing hydrodynamic torque at 380 bar and 13.9 m/s is a further mark against it, and its disc sits in the flow for the whole burn. Reject.

#### What a strong answer must contain

- The line sizing computed, not assumed, from 280 kg/s and a stated velocity target, with the resulting $\Delta p$ for each option against the 1.5 bar requirement — **and the observation that all four pass, so $\Delta p$ is not the discriminator.**
- Actuation load scaling argued correctly: rotary valves need *torque* driven by seat friction, translating valves need *force* driven by $p\times A$; the 380 bar line pressure produces a ~670 kN seat load either way, and the difference between the options is what they do with it.
- A computed closure surge with an explicit statement of which branch of Eq. 3.7/3.9 applies, the pipe period, and **the P3 correction for the valve's nonlinear characteristic** — an answer that uses the 150 ms mechanical stroke in Eq. 3.9 without comment has made the module's headline error.
- A concrete closure schedule (two-rate, or an explicitly shaped profile) that reconciles the 150 ms abort requirement with the surge limit.
- The fail-closed mechanism named and its own failure mode addressed. For B this is the clutch; for A it is the spring plus the pneumatic supply; a candidate who says "fail-safe spring" without asking what happens if the spring's release mechanism sticks has not finished.
- Reusability and leakage: 50 flights at $<10^{-1}$ scc/s He needs a seat that survives cycling at cryogenic temperature, which means a polymer (PCTFE) or spring-energised seat with a filter upstream, plus a leak-rate trending plan (§7.2, §7.5).
- Materials: LOX service excludes titanium anywhere wetted; the body is Inconel 718 or 316L; the seat is PCTFE or Vespel; lubricants are fluorinated or absent; the whole assembly is precision-cleaned to a LOX specification.
- "What I would test first": the fail-closed function at temperature and pressure, and the closure-surge test with a flush-mounted transducer. Both are transient tests, per §7.5.

#### What loses marks

- Selecting on full-open $\Delta p$ alone (all options pass; this is a non-discriminator by construction).
- Using the mechanical stroke time in Eq. 3.9 with no effective-closure-time correction, and thereby reporting an 8.5 bar surge as if it were the answer.
- Choosing D without noticing that a parallel pyro valve does not shut off flow, or that a single-use device cannot serve a 50-flight abort function.
- Asserting "fail-safe" without naming the mechanism and its own failure mode.
- Any answer that puts titanium in the wetted path, or that omits cleanliness entirely.
- Ignoring the second-start-after-30-minutes requirement, which is what most strongly penalises Option A (stored gas budget and thermal state) and Option D (consumed component).

A defensible answer choosing **A** is possible and should score well if it argues that a proven pneumatic spring-return architecture with a demonstrated closure profile beats an unqualified clutch, accepts the mass, and proposes a fixed-orifice two-stage pneumatic damper to shape the closure. That is a real engineering position. An answer choosing **C** or **D** needs a much stronger case than the requirements support.

---

## K4. Common wrong answers and what they reveal

**"The main valve should be sized for minimum pressure drop, so make it as large as possible."** Reveals a missing feel for what the $\Delta p$ requirement actually binds. In WE1 the requirement demanded $C_dA$ *twice the line area*, which is physically impossible for a valve installed in that line and is the signal that the requirement is loose. Over-sizing a valve costs mass and makes it slower and harder to actuate, and the actual constraint is almost always the bore of the line it sits in. The right move on finding a loose requirement is to say so, not to design to it.

**Using the mechanical stroke time in the Michaud relation.** The single most common quantitative error in this material, and it is non-conservative by a factor of three to five for a rotary valve. It reveals treating Eq. 3.9 as a formula rather than as a statement about $dv/dt$. Every surge analysis should state, explicitly, what fraction of the flow change happens over what fraction of the stroke.

**Forgetting the Korteweg correction, or applying it to the wrong quantity.** Two variants. Using the free-liquid sound speed gives an 8–20 % overestimate of the surge, which is at least conservative and merits partial credit. Applying the correction to the *density* instead of the wave speed, or inverting it so that the pipe makes the wave faster, reveals that the derivation was never followed: a compliant wall adds compliance in series, so it can only slow the wave.

**Computing the fully restrained thermal force and stopping.** The 364 kN of WE3 and the 219 kN of P12 are numbers that never occur, because the material yields first and, on the compressive half of the cycle, the line buckles at a small fraction of either. Reporting the elastic force as "the load on the anchors" reveals a student who has not asked what the structure can actually deliver. The failure hierarchy is always: buckling (in compression), then yield, then the elastic value as an upper bound that is never reached.

**Treating a check valve as a barrier.** Reveals a component-level rather than system-level view. A check valve has a leak rate; a leak rate integrated over a mission duration is a quantity of fluid; and if that fluid is an oxidiser in a pressurant line, the quantity that matters is small. This is the mistake that destroyed a vehicle in 2019, and it is worth stating explicitly in an answer that the question is not "does it seal?" but "how much gets through in four years, and what happens to it then?"

**Sizing a relief valve to the same area as the regulator it protects.** Reveals a missing pressure-ratio argument. Both are choked orifices, but the relief valve is fed at the *tank* pressure while the regulator is fed at the *supply* pressure, so Eq. 3.13 demands an area ratio of order ten. Students who get this wrong usually wrote down a mass balance without asking what stagnation state each flow starts from.

**Confusing the flow liner with the pressure-thrust restraint.** Reveals memorisation of "bellows need liners" without the mechanism. The liner keeps flow out of the convolutions and defeats flow-induced vibration; it carries no axial load. The tie rods, gimbal ring or balancing bellows carry the pressure thrust. Omitting the restraint because "there's a liner" is a joint-separation failure.

**"The manifold rule is $AR \ge 4$"** stated with no derivation. It is a correct number and a useless answer, because it cannot be adapted. The relation is $\delta = C_d^2/(2AR^2)$, and once you have it you can size for 1.5 % (P15), explain a 4.9 % hot streak (Q9), and immediately see that twin inlets beat a bigger manifold. Rules of thumb quoted without their derivation are the main reason students cannot handle the variant question.

**Trusting the pressure trace.** Reveals never having been burned by instrumentation. In P21 the smooth trace is not wrong; it is *bandwidth-limited*, and reporting "no overshoot" from a channel with a 20 Hz bandwidth is a statement about the plumbing, not the engine. A good habit for the rest of your career: before quoting any transient measurement, state the channel's bandwidth and how you know it.

**Answering material-compatibility questions from intuition.** The pattern has no logic to it from first principles — Viton is fine with the oxidiser and unacceptable with the fuel; aluminium is the *best* hydrazine material and a marginal oxygen material; titanium is the best structural metal and is forbidden with both LOX and NTO; hydrogen embrittlement is *worse* warm than cold. These are test results, not deductions, and they must be memorised as such. Every wrong answer here is a real accident somewhere.
