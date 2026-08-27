/* =============================================================================
   MODALS — help, scientific assumptions, quality
   -----------------------------------------------------------------------------
   One open modal at a time; the modal stack owns Escape while anything is
   open (the camera rig is suspended so WASD and pointer lock cannot fight
   the overlay). Content is authored here as HTML strings — it is
   documentation, and keeping it beside the code that implements it makes
   drift harder.
   ========================================================================== */

import { QUALITY_ORDER } from '../config.js';

const HELP = `
<h3>Controls</h3>
<table>
<tr><td>drag</td><td>orbit the current focus</td></tr>
<tr><td>scroll</td><td>zoom (orbit) · speed trim (flight)</td></tr>
<tr><td>click canvas</td><td>enter free flight (pointer lock)</td></tr>
<tr><td>W A S D</td><td>fly · <b>Q / E</b> down / up · <b>shift</b> boost</td></tr>
<tr><td>esc</td><td>leave free flight</td></tr>
<tr><td>space</td><td>play / pause</td></tr>
<tr><td>Z</td><td>debug: show the raw asymmetry field ζ</td></tr>
<tr><td>H or ?</td><td>this panel</td></tr>
</table>
<p>Camera speed adapts to what you are near: approaching the neutron star
slows you to metres per second; leaving the remnant winds you up past light
speed. The speed readout keeps all three framings honest.</p>
<p class="note">Audio is cinematic. Sound does not propagate through vacuum.</p>`;

const ASSUMPTIONS = `
<h3>Scientific assumptions</h3>
<p>This is a <b>reduced-order model</b> built to preserve the major physical
stages, their timescales, and their real orders of magnitude. It is not a
research code, and pretending otherwise would be worse than the
simplifications themselves. What it actually does:</p>
<ul>
<li><b>Progenitor</b> — a representative 15 M☉ star: 600 R☉ red supergiant,
onion shells anchored to published shell masses and densities, smoothstepped
boundaries (burning shells are genuinely extended). The radial profile is a
piecewise fit, not a solution of the stellar-structure equations.</li>
<li><b>Collapse</b> — pressureless free-fall (exact cycloid) with an inner
homologous core; Ye(ρ) is an empirical deleptonization ramp frozen at
trapping density (2×10¹² g/cm³). No neutrino transport is solved.</li>
<li><b>Bounce</b> — triggered at nuclear saturation (2.7×10¹⁴ g/cm³), damped
ring-down prescribed; PNS contraction is an exponential fit (30 → 12 km).</li>
<li><b>Shock</b> — a radius ODE: relaxation toward a quasi-equilibrium set by
the heating/ram-pressure balance. Stall at 100–200 km emerges; revival is a
critical-luminosity criterion crossed when the Si/O interface accretes
through. The revival TIMING is calibrated, not derived.</li>
<li><b>Asymmetry</b> — SASI-like growth of spherical harmonics l ≤ 4 with
l=1 fastest, saturating, frozen at revival; finer structure is procedural
noise standing in for Rayleigh–Taylor growth. Real 3D turbulence is far
richer.</li>
<li><b>Explosion energetics</b> — E ramps to 10⁵¹ erg (1 foe). The four
energies in the panel — binding (~3×10⁵³ erg), neutrino (99% of that),
kinetic (10⁵¹), radiated (~10⁴⁹) — are tracked separately and never summed;
conflating them is the classic popular-account error.</li>
<li><b>Light curve</b> — breakout flash, recombination plateau, then the
exact ⁵⁶Ni → ⁵⁶Co → ⁵⁶Fe chain (τ = 8.8 d, 111.3 d). Diffusion is
approximated, so rise shapes are stylised; the tail slope is exact.</li>
<li><b>Remnant</b> — free expansion to Sedov–Taylor in the progenitor's own
r⁻² wind (R ∝ t²ᐟ³, not the uniform-medium t²ᐟ⁵); reverse-shock radius is a
parametrised fit. The neutron-star kick is momentum recoil against the
frozen dipole, 200–600 km/s.</li>
</ul>
<h3>Visual disclosures</h3>
<ul>
<li>The cutaway's radial axis is <b>mass coordinate</b>, as stellar-structure
diagrams have always drawn it — at true scale the iron core is 10⁻⁶ of the
stellar radius. Labelled on screen whenever active.</li>
<li>The neutron star renders at its true ~12 km. Nothing is inflated.</li>
<li>Temperatures beyond the visible blackbody locus are shown at the locus
limit (blue-white), with brightness carrying the excess.</li>
<li>A saturation compensation (documented in the source) counteracts ACES
tone-mapping's highlight desaturation; chromaticity relationships between
temperatures are preserved.</li>
<li>Sound is a score, not physics.</li>
</ul>`;

export class Modals {
  constructor(rig, renderer) {
    this.rig = rig;
    this.renderer = renderer;
    this.el = document.getElementById('modal');
    this.body = document.getElementById('modal-body');
    this.open = null;

    document.getElementById('modal-close').addEventListener('click', () => this.close());
    addEventListener('keydown', e => {
      if (e.code === 'Escape' && this.open) { e.stopImmediatePropagation(); this.close(); }
      if ((e.code === 'KeyH' || (e.key === '?' )) && !this.open) this.show('help');
    }, true);   // capture: the modal owns Escape before the rig sees it

    document.getElementById('btn-help')?.addEventListener('click', () => this.show('help'));
    document.getElementById('btn-assume')?.addEventListener('click', () => this.show('assumptions'));
    document.getElementById('btn-quality')?.addEventListener('click', () => this.show('quality'));
  }

  show(which) {
    this.open = which;
    if (which === 'help') this.body.innerHTML = HELP;
    else if (which === 'assumptions') this.body.innerHTML = ASSUMPTIONS;
    else if (which === 'quality') {
      const cur = localStorage.getItem('sn-quality') ?? this.renderer.quality;
      this.body.innerHTML = `
        <h3>Quality</h3>
        <p>Sets particle counts, shell tessellation and render scale.
        Applies on reload.</p>
        <div class="qrow">` +
        QUALITY_ORDER.map(q =>
          `<button class="tl-btn qbtn ${q === cur ? 'on' : ''}" data-q="${q}">${q}</button>`).join('') +
        `</div>`;
      this.body.querySelectorAll('.qbtn').forEach(b =>
        b.addEventListener('click', () => {
          localStorage.setItem('sn-quality', b.dataset.q);
          location.reload();
        }));
    }
    this.el.classList.add('open');
    this.rig.suspend(true);
  }

  close() {
    this.open = null;
    this.el.classList.remove('open');
    this.rig.suspend(false);
  }
}
