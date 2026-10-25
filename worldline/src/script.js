// The film, as data: scene order, every caption, every equation on screen,
// and the parameters the animations and the score share. Pure — the tests
// import it without a browser.
//
// Each scene lists its narration in order. Captions are timed automatically:
// a caption stays up for at least 1 s per 14 characters (never less than
// 3.4 s), then a short gap. A number in the list is a pause, in seconds.
// The scene draws itself against those times (scene.at[i] is when caption i
// appears), so editing a line re-times the animation with it.
//
// eqs: { tex, from, to, x, y, size, align, box }
//   from / to are caption indices (the equation appears with caption `from`
//   and leaves when caption `to` appears), or 'end'; x, y are in the 1920 ×
//   1080 frame; size is the font size in frame pixels.

export const W = 1920, H = 1080;

const CPS = 15;          // reading speed, characters per second
const MIN = 3.4;         // shortest caption
const GAP = 0.5;         // between captions

export const SCENES = [
  {
    id: 'title', chapter: 'Worldline', lead: 0, tail: 0, fadeIn: 2.5, fadeOut: 2,
    lines: [],
    extra: 13,
    cards: [[2, 10, 'WORLDLINE', 'title', 'a short film about general relativity']],
  },

  // ─────────────────────────────── PROLOGUE ───────────────────────────────
  {
    id: 'newton', chapter: 'Prologue', label: 'Newton’s gravity', lead: 2, tail: 2,
    lines: [
      'In 1687 Isaac Newton gave gravity a law: every mass pulls on every other, with a force that weakens with the square of the distance.',
      'It explained falling apples and orbiting moons. But the pull acts instantly, across empty space — and nothing, we now know, outruns light.',
      'And Mercury misbehaves. The point of its orbit nearest the Sun creeps around 43 arcseconds per century more than Newton allows.',
      'Astronomers blamed an unseen planet, “Vulcan”. It was never found.',
      'In 1905 Albert Einstein rebuilt our ideas of space and time; in 1915, of gravity. Gravity, it turned out, is not a force in Newton’s sense but the curvature of spacetime.',
    ],
    eqs: [{ tex: String.raw`F = \frac{G\,m_1 m_2}{r^2}`, from: 0, to: 2, x: 1380, y: 300, size: 64, box: true }],
  },

  // ─────────────────────────── SPECIAL RELATIVITY ─────────────────────────
  {
    id: 'lightclock', chapter: 'Special relativity', label: '1 · Special relativity', lead: 2, tail: 3,
    lines: [
      'Einstein began with two rules. First: the laws of physics are the same for everyone moving steadily. No experiment in a smooth ride can reveal its motion.',
      'Second: light in a vacuum moves at the same speed, c, for every one of those observers, however fast they or the source are moving.',
      'Build a clock out of light: a pulse bouncing between two mirrors. Each round trip is one tick.',
      'Now let an identical clock fly past at 60% of the speed of light. Seen from the ground, its pulse must travel a longer, slanted path.',
      'Light cannot speed up to cover the extra distance. So each tick takes longer: the moving clock runs slow.',
      'Pythagoras on half a tick gives the Lorentz factor, γ. At 60% of light speed γ = 1.25: five ticks here for every four there.',
      'Every clock must slow the same way — atomic, chemical, biological — or comparing them would reveal your motion. This is time dilation.',
      'At everyday speeds γ is almost exactly 1. Near light speed it soars: at 99% of c, γ is about 7.1.',
    ],
    params: { P: 1.1, beta: 0.6 },
    eqs: [
      { tex: String.raw`\left(\frac{c\,\Delta t}{2}\right)^{2} = L^{2} + \left(\frac{v\,\Delta t}{2}\right)^{2} \;\Longrightarrow\; \Delta t = \gamma\,\Delta\tau, \qquad \gamma = \frac{1}{\sqrt{1 - v^{2}/c^{2}}}`, from: 5, to: 7, x: 960, y: 150, size: 46, box: true },
      { tex: String.raw`\gamma = \frac{1}{\sqrt{1 - v^{2}/c^{2}}}`, from: 7, to: 'end', x: 520, y: 260, size: 58, box: true },
    ],
  },
  {
    id: 'muons', lead: 1.5, tail: 2.5,
    lines: [
      'Muons are made by cosmic rays high in the atmosphere. At rest they decay in about 2.2 microseconds on average.',
      'In an experiment published in 1963, Frisch and Smith counted fast muons on top of Mount Washington, then how many still arrived near sea level, 1.9 km lower.',
      'At 99.5% of light speed the descent takes about 6.4 microseconds. Without time dilation, only about 5% should survive it.',
      'Far more did. The muons’ clocks had run slow by a factor of 8.8 ± 0.8, against relativity’s predicted 8.4 ± 2.',
      'From the muon’s point of view its clock is normal. Instead the mountain is shorter: length contraction.',
      'Different stories, same count. Observers disagree about time and length, but never about what actually happens.',
    ],
    eqs: [
      { tex: String.raw`e^{-6.4/2.2} \approx 0.05`, from: 2, to: 4, x: 1530, y: 110, size: 50, box: true },
      { tex: String.raw`L = \frac{L_0}{\gamma}`, from: 4, to: 'end', x: 960, y: 92, size: 44, box: true },
    ],
  },

  // ─────────────────────────────── SPACETIME ──────────────────────────────
  {
    id: 'train', chapter: 'Spacetime', label: '2 · Spacetime', lead: 2, tail: 3,
    lines: [
      'Lightning strikes both ends of a moving train. On the platform, halfway between the marks, the two flashes arrive together.',
      'A passenger at the middle of the train is moving toward the front flash, so it reaches her first.',
      'Light moves at c for her too, so she concludes the front strike happened first. Both observers are right: simultaneity is relative.',
      'To see how, draw time going up the page and space across it. This is a spacetime diagram.',
      'Each place-at-an-instant is an event: a point. Each object’s history is a line: its worldline. Light runs at 45 degrees.',
      'The passenger’s “now” is a tilted line. On it, the front strike has already happened; the back strike has not.',
      'The Lorentz transformations convert one observer’s coordinates of an event into another’s. The tilt comes from the vx/c² term.',
    ],
    params: { beta: 0.5 },
    eqs: [{ tex: String.raw`x' = \gamma\,(x - vt), \qquad t' = \gamma\left(t - \frac{vx}{c^{2}}\right)`, from: 6, to: 'end', x: 1440, y: 170, size: 46, box: true }],
  },
  {
    id: 'cones', lead: 1.5, tail: 3,
    lines: [
      'What every observer agrees on is the spacetime interval between two events.',
      'The light rays through an event form its light cone. Inside the upper cone lies its future: everything it can influence.',
      'Inside the lower cone is its past. Outside is “elsewhere”, reachable only faster than light — which would let effects come before their causes.',
      'A clock carried along a worldline records its proper time, the way a car’s odometer records the road actually driven.',
      'One twin stays home. The other flies to a star 4 light-years away at 80% of light speed, and back.',
      'Ten years pass at home. The traveller’s clock reads six. She turned around and felt it, so the two are not symmetric.',
      'Because of that minus sign, the straight, unaccelerated worldline between two events is the one with the most proper time.',
      'Hold on to that. It is the key to gravity.',
    ],
    params: { D: 4, beta: 0.8 },
    eqs: [
      { tex: String.raw`\Delta s^{2} = -(c\,\Delta t)^{2} + \Delta x^{2} + \Delta y^{2} + \Delta z^{2}`, from: 0, to: 3, x: 960, y: 130, size: 50, box: true },
      { tex: String.raw`\underbrace{\tau = \int \sqrt{1 - \frac{v^{2}}{c^{2}}}\;dt}_{\text{proper time}} \qquad \text{vs.} \qquad \underbrace{L = \int \sqrt{1 + \left(\frac{dy}{dx}\right)^{2}}\;dx}_{\text{arc length (Calc II)}}`, from: 3, to: 4, x: 960, y: 170, size: 44, box: true },
      { tex: String.raw`\tau = \int \sqrt{1 - \frac{v^{2}}{c^{2}}}\;dt`, from: 4, to: 'end', x: 1560, y: 170, size: 46, box: true },
    ],
  },

  // ──────────────────────────────── GRAVITY ───────────────────────────────
  {
    id: 'elevator', chapter: 'Gravity', label: '3 · Gravity', lead: 2, tail: 2.5,
    lines: [
      'Gravity accelerates everything identically. The MICROSCOPE satellite found titanium and platinum falling alike to a few parts in 10¹⁵.',
      'In 1907 Einstein had what he called “the happiest thought of my life”: a person falling freely does not feel their own weight.',
      'In a falling elevator, you, your keys and an apple fall together and float. Inside, gravity seems to vanish.',
      'In a rocket accelerating at 9.8 m/s² through deep space, a released apple keeps moving while the floor rushes up to meet it. It “falls” exactly as on Earth.',
      'In a small lab, over a short time, no experiment can tell gravity from acceleration. This is the equivalence principle.',
      'Shine a beam across the accelerating rocket. The floor speeds up while the light crosses, so the beam lands lower. Light must fall too.',
      'This argument gives only half the bending measured at the Sun. The curvature of space supplies the other half.',
      'So standing on Earth, you are the one accelerating: the floor pushes you off your natural free-fall path. Astronauts float because they are falling.',
    ],
  },
  {
    id: 'clocks', lead: 1.5, tail: 2.5,
    lines: [
      'Send a signal from the floor of the accelerating rocket to its ceiling. The ceiling speeds away while it travels, so the signal arrives at a lower frequency.',
      'By the equivalence principle the same must happen in a tower on Earth, where nothing moves. So the lower clock really ticks slower.',
      'Near Earth that is about one part in 10¹⁶ per metre of height. Optical clocks measured it across 33 cm in 2010, and across a millimetre-sized cloud of atoms in 2022.',
      'GPS satellites orbit about 26,600 km from Earth’s centre. Weaker gravity up there makes their clocks gain about 45.8 microseconds a day.',
      'Their orbital speed makes them lose about 7.2. Net: a gain of about 38.6 microseconds every day.',
      'So they are built to tick at 10.22999999543 MHz instead of 10.23 MHz, and read correctly from the ground.',
      'Light travels 11.6 km in 38.6 microseconds. Neil Ashby, who analysed GPS relativity, says a day of uncorrected clock errors would cause navigation errors of more than 11 km.',
    ],
    eqs: [{ tex: String.raw`\frac{\Delta\tau}{\tau} \approx \frac{g\,h}{c^{2}}`, from: 1, to: 3, x: 1450, y: 250, size: 66, box: true }],
  },

  // ─────────────────────────────── CURVATURE ──────────────────────────────
  {
    id: 'geodesics', chapter: 'Curvature', label: '4 · Curved spacetime', lead: 2, tail: 3,
    lines: [
      'Two travellers start on the equator and walk due north. Neither ever turns, yet their paths draw together and meet at the pole.',
      'Nothing pushes them. The curvature of the surface does it. Their paths are geodesics: the straightest lines the surface allows.',
      'Now release two balls side by side above Earth. Each falls toward Earth’s centre, so they drift together.',
      'Falling cancels the uniform pull, but no choice of frame cancels that squeeze. The leftover — the tide — is spacetime curvature.',
      'Einstein’s picture: matter and energy curve spacetime, and anything falling freely follows the straightest path that curved spacetime allows.',
      'As John Wheeler summed it up: spacetime tells matter how to move, and matter tells spacetime how to curve.',
      'For slow objects in weak gravity, almost all of everyday gravity is the warping of time: clocks ticking at different rates at different heights.',
      'A thrown ball moves a few metres through space in a second — but 300,000 km through time. On that scale its worldline is almost straight.',
      'Free bodies follow the worldline of greatest proper time. Because higher clocks run faster, the ball arcs up and back down — and Newton’s law falls out.',
      'The familiar rubber sheet gets one thing right — mass distorts its surroundings — but it uses gravity to explain gravity, and it leaves out time.',
    ],
  },
  {
    id: 'equations', chapter: 'Einstein’s equations', label: '5 · The mathematics', lead: 2, tail: 3,
    lines: [
      'To do this with mathematics you need the metric: a rule that turns small changes in coordinates into real distances and times.',
      'On a flat sheet, the rule is Pythagoras.',
      'On a sphere the coefficients change from place to place, and no choice of coordinates removes that. That is real curvature.',
      'Flat spacetime has one minus sign. That minus sign is all of special relativity.',
      'You can measure curvature without leaving the surface: a circle of radius 100 km drawn on Earth comes out 25.8 m shorter than 2πr.',
      'Then Einstein’s field equations: the curvature of spacetime on the left; the energy, momentum, pressure and stress of everything present on the right.',
      '8πG/c⁴ is about 2.1 × 10⁻⁴³ per newton. Spacetime is stiff: even inside water, its radius of curvature would be about 1.5 times the Earth–Sun distance.',
      'In plain English (Baez and Bunn): a small ball of free-falling particles, initially at rest, starts to shrink at a rate set by the energy density plus the pressures at its centre.',
      'In empty space the ball keeps its volume but changes shape — stretched one way, squeezed the other. That is how the Moon raises tides across a vacuum.',
      'Ten coupled, nonlinear equations. Exact solutions need high symmetry; colliding black holes need supercomputers.',
    ],
    eqs: [
      { tex: String.raw`ds^{2} = dx^{2} + dy^{2}`, from: 1, to: 2, x: 1400, y: 330, size: 60, box: true },
      { tex: String.raw`ds^{2} = R^{2}\left(d\theta^{2} + \sin^{2}\theta\, d\phi^{2}\right)`, from: 2, to: 3, x: 1400, y: 330, size: 56, box: true },
      { tex: String.raw`ds^{2} = -c^{2}\,dt^{2} + dx^{2} + dy^{2} + dz^{2}`, from: 3, to: 4, x: 1440, y: 250, size: 50, box: true },
      { tex: String.raw`C = 2\pi R \sin\!\left(\frac{r}{R}\right) \approx 2\pi r\left(1 - \frac{r^{2}}{6R^{2}}\right)`, from: 4, to: 5, x: 1400, y: 330, size: 50, box: true },
      { tex: String.raw`\underbrace{G_{\mu\nu} + \Lambda\, g_{\mu\nu}}_{\text{curvature of spacetime}} = \underbrace{\frac{8\pi G}{c^{4}}\, T_{\mu\nu}}_{\text{energy, momentum, pressure, stress}}`, from: 5, to: 6, x: 960, y: 420, size: 74 },
      { tex: String.raw`G_{\mu\nu} + \Lambda\, g_{\mu\nu} = \frac{8\pi G}{c^{4}}\, T_{\mu\nu}`, from: 6, to: 'end', x: 1450, y: 150, size: 46, box: true },
    ],
  },

  // ────────────────────────────── BLACK HOLES ─────────────────────────────
  {
    id: 'blackhole', chapter: 'Black holes', label: '6 · Black holes', lead: 2, tail: 3,
    lines: [
      'When a massive star’s core exhausts its fuel and is heavier than about 2 to 2.3 Suns, nothing known can stop it collapsing.',
      'In 1916 Karl Schwarzschild found the exact solution for spacetime outside a round, non-rotating mass.',
      'Squeeze a mass inside its Schwarzschild radius and that sphere becomes an event horizon: a one-way surface. For the Sun, 2.95 km. For Earth, 8.9 mm.',
      'A clock hovering near the hole ticks slower as seen from far away: 82% of the distant rate at three Schwarzschild radii, 30% at 1.1, falling toward zero just above the horizon — where nothing can hover. A clock falling in notices nothing special.',
      'Light passing nearby is bent. At 1.5 Schwarzschild radii, the photon sphere, light can circle the hole, unstably. These paths are computed from the geodesic equation.',
      'Rays aimed within about 2.6 Schwarzschild radii of the centre are captured.',
      'Close orbits don’t close: they precess. Inside three Schwarzschild radii — the innermost stable circular orbit — no circular orbit is stable, and gas spirals in and plunges.',
      'Infalling gas forms a hot accretion disk. It can radiate about 5.7% of its rest-mass energy around a non-spinning hole, and up to 42% around a maximally spinning one. Fusion manages 0.7%.',
      'Roy Kerr’s 1963 solution describes spinning black holes, which drag spacetime around with them. Gravity Probe B measured this frame dragging around Earth itself.',
      'In 2019 and 2022 the Event Horizon Telescope imaged rings of glowing gas around M87* and Sagittarius A*, with the sizes GR predicts.',
      'Black holes don’t suck. Swap the Sun for a one-solar-mass black hole and Earth’s orbit would not change.',
      'As r approaches 0, GR predicts curvature growing without limit — a singularity, where the theory predicts its own breakdown. Many physicists hope a quantum theory of gravity will replace it.',
    ],
    eqs: [
      { tex: String.raw`\begin{gathered} ds^{2} = -\left(1 - \frac{r_s}{r}\right)c^{2}\,dt^{2} + \frac{dr^{2}}{1 - r_s/r} + r^{2}\left(d\theta^{2} + \sin^{2}\theta\,d\phi^{2}\right) \\ r_s = \frac{2GM}{c^{2}} \end{gathered}`, from: 1, to: 3, x: 960, y: 190, size: 44, box: true },
      { tex: String.raw`\frac{d\tau}{dt} = \sqrt{1 - \frac{r_s}{r}}`, from: 3, to: 4, x: 1450, y: 150, size: 52, box: true },
      { tex: String.raw`\frac{d^{2}u}{d\phi^{2}} + u = \frac{3}{2}\,r_s\,u^{2}, \qquad u = \frac{1}{r}`, from: 4, to: 6, x: 1480, y: 150, size: 44, box: true },
    ],
  },

  // ─────────────────────────── GRAVITATIONAL WAVES ────────────────────────
  {
    id: 'waves', chapter: 'Gravitational waves', label: '7 · Gravitational waves', lead: 2, tail: 3,
    lines: [
      'Shake spacetime the right way and ripples spread out at the speed of light: gravitational waves.',
      'A passing wave stretches distances one way while squeezing them the other, then reverses. There are two patterns, “plus” and “cross”.',
      'Two black holes in orbit radiate these waves, lose energy, spiral closer and orbit faster. The signal rises in pitch and loudness: a chirp.',
      'On 14 September 2015 LIGO caught one: black holes of about 36 and 29 Suns merging, 1.3 billion light-years away, into one of 62.',
      'Three Suns’ worth of mass-energy left as gravitational waves. In about 0.2 seconds the signal swept from 35 to 250 Hz — the range of hearing.',
      'Here is a chirp with that sweep, as sound: the inspiral from the leading-order formula, the merger and ring-down sketched in.',
      2.5,
      'LIGO’s detectors are interferometers with 4 km arms. A passing wave lengthens one arm and shortens the other, and light leaks out to the detector.',
      'For that first detection the change in arm length was about 4 × 10⁻¹⁸ m — a few hundred times smaller than a proton.',
      'In 2017 merging neutron stars set off a gamma-ray burst 1.7 s after their waves arrived: gravity travels at the speed of light, to about one part in 10¹⁵.',
      'Models of that kilonova’s light show freshly forged heavy elements such as gold and platinum. By May 2026 the catalogue held 390 candidate signals.',
      'LISA, a gravitational-wave detector in space, is planned for launch in 2035, to hear supermassive black holes merge.',
    ],
    eqs: [{ tex: String.raw`h \approx \frac{2G}{c^{4}R}\,\frac{d^{2}I}{dt^{2}}`, from: 2, to: 3, x: 1500, y: 170, size: 52, box: true }],
  },

  // ───────────────────────────────── COSMOS ───────────────────────────────
  {
    id: 'cosmos', chapter: 'The universe', label: '8 · The universe', lead: 2, tail: 3,
    lines: [
      'On the largest scales the universe looks the same everywhere and in every direction. Then GR needs just one function: the scale factor, a(t).',
      'Every large distance grows in proportion to a(t). So from any galaxy, the others recede at speeds proportional to their distance.',
      'There is no centre, and nothing to expand into. The Big Bang happened everywhere.',
      'Light’s wavelength grows in step with the scale factor: 1 + z = a(now)/a(then). It is not simply a Doppler shift from a galaxy’s speed today; distant galaxies can even recede faster than light.',
      'The Friedmann equations set the expansion from what the universe contains. The second shows that pressure gravitates.',
      'Solved with the measured contents, they give this history: expansion slowing for billions of years, then speeding up.',
      'The speed-up was discovered in 1998, from unexpectedly dim distant supernovae. Its cause is called dark energy.',
      'The budget today: about 5% ordinary matter, 26% dark matter and 69% dark energy.',
      'The hot early universe still glows: the cosmic microwave background, now at 2.725 K. In this model the universe is 13.8 billion years old.',
      'Open questions: the Hubble tension — about 67 versus 73 km/s/Mpc — and hints, still short of discovery, that dark energy is changing.',
      'If dark energy is a true constant, expansion continues forever, into a cold “Big Freeze”.',
    ],
    eqs: [
      { tex: String.raw`v = H_0\, d`, from: 1, to: 3, x: 1580, y: 170, size: 64, box: true },
      { tex: String.raw`1 + z = \frac{a_{\text{now}}}{a_{\text{then}}}`, from: 3, to: 4, x: 1500, y: 180, size: 60, box: true },
      { tex: String.raw`\begin{aligned} \left(\frac{\dot a}{a}\right)^{2} &= \frac{8\pi G}{3}\,\rho - \frac{k\,c^{2}}{a^{2}} + \frac{\Lambda c^{2}}{3} \\ \frac{\ddot a}{a} &= -\frac{4\pi G}{3}\left(\rho + \frac{3p}{c^{2}}\right) + \frac{\Lambda c^{2}}{3} \end{aligned}`, from: 4, to: 5, x: 960, y: 420, size: 60, box: true },
    ],
  },

  // ─────────────────────────────── EVIDENCE ───────────────────────────────
  {
    id: 'evidence', chapter: 'Evidence', label: '9 · The evidence', lead: 2, tail: 3,
    lines: [
      'Galaxies bend the light of objects behind them into arcs, multiple images and Einstein rings: gravitational lensing.',
      'And the tests keep coming. Mercury’s 43 arcseconds. Starlight bent 1.75 arcseconds at the Sun’s edge. Radio signals delayed passing the Sun.',
      'Clocks in towers, aircraft and satellites. Gyroscopes in orbit twisted by Earth’s spin. A binary pulsar losing energy at the predicted rate, to within 0.2%.',
      'Gravitational waves. Black-hole shadows.',
      'In weak gravity GR is confirmed to parts in 100,000 or better. In strong gravity, no confirmed deviation has been found so far.',
    ],
  },

  // ─────────────────────────────── FRONTIERS ──────────────────────────────
  {
    id: 'frontiers', chapter: 'Frontiers', label: '10 · Frontiers', lead: 2, tail: 3,
    lines: [
      'GR treats spacetime as smooth and definite. Quantum mechanics says everything fluctuates. Near the Planck length, 1.6 × 10⁻³⁵ m, the two collide.',
      'Candidate theories — string theory, loop quantum gravity, asymptotic safety, causal sets — remain unconfirmed.',
      'Experiments are trying to show whether gravity alone can entangle two tiny masses. As of October 2026, none has.',
      'Does information escape evaporating black holes? Calculations since 2019 give an answer in simplified model universes. Real black holes remain open.',
      'Are realistic singularities always hidden inside horizons? “Cosmic censorship” is still an unproven conjecture.',
      'Numerical relativity — solving Einstein’s equations on supercomputers, possible since 2005 — is how we know what merging black holes look like.',
      'Traversable wormholes and warp drives are legitimate solutions on paper, but they need large amounts of negative energy, which quantum theory allows only in tiny, fleeting amounts. They remain science fiction.',
    ],
  },

  // ─────────────────────────────── YOUR PATH ──────────────────────────────
  {
    id: 'path', chapter: 'Your path', label: '11 · Your path', lead: 2, tail: 3,
    lines: [
      'You can understand GR’s ideas with the calculus you have now.',
      'To compute with it: multivariable calculus, linear algebra, differential equations and Lagrangian mechanics. To do research: partial differential equations and differential geometry.',
      'Where it is offered, undergraduate GR is usually a junior or senior elective, often taught from Hartle’s “Gravity”. Graduate GR follows, then research.',
      'Questions to bring a GR professor: What open question is your group working on? What does a typical week look like for your graduate students?',
      'And: what could an undergraduate realistically contribute — perhaps by reproducing a figure from one of your papers?',
    ],
  },

  // ───────────────────────────────── END ──────────────────────────────────
  {
    id: 'end', chapter: 'End', lead: 0, tail: 0, fadeIn: 2, fadeOut: 4,
    lines: [],
    extra: 30,
    cards: [
      [1.5, 7, 'Spacetime tells matter how to move. Matter tells spacetime how to curve.', 'card', 'after John Wheeler'],
      [9.5, 6, 'General relativity was completed in 1915. No test has yet found a confirmed deviation — and it predicts its own breakdown.', 'card'],
      [16.5, 12.5, 'WORLDLINE', 'credits'],
    ],
  },
];

// Seconds a caption needs on screen.
export const holdFor = (text) => Math.max(MIN, text.length / CPS + 0.6);

// Lay the film out: time every caption, size every scene, place every
// equation. Pure and deterministic.
export function layout() {
  const out = [];
  let T = 0;
  for (const s of SCENES) {
    const captions = [];
    const at = [];
    let t = s.lead ?? 1.5;
    for (const item of s.lines) {
      if (typeof item === 'number') { t += item; continue; }
      const dur = holdFor(item);
      captions.push([t, dur, item, 'n']);
      at.push(t);
      t += dur + GAP;
    }
    const dur = (s.lines.length ? t - GAP + (s.tail ?? 2) : 0) + (s.extra || 0);
    const fadeOut = s.fadeOut ?? 1.2;
    const resolve = (k) => (k === 'end' ? dur - fadeOut : at[k]);
    const eqs = (s.eqs || []).map((e) => ({ align: 'c', ...e, t0: resolve(e.from), t1: resolve(e.to) }));
    const cards = (s.cards || []).map(([a, d, text, kind, who]) => [a, d, text, kind, who]);
    out.push({
      ...s, start: T, dur, end: T + dur, fadeIn: s.fadeIn ?? 1.2, fadeOut,
      captions: [...cards, ...captions], at, eqs,
    });
    T += dur;
  }
  return out;
}

export const TIMELINE = layout();
export const DURATION = TIMELINE[TIMELINE.length - 1].end;

export function sceneAt(T) {
  if (!(T > 0)) return TIMELINE[0];
  for (const s of TIMELINE) if (T < s.end) return s;
  return TIMELINE[TIMELINE.length - 1];
}
export const sceneById = (id) => TIMELINE.find((s) => s.id === id);
export function chapters() {
  const out = [];
  for (const s of TIMELINE) if (s.chapter) out.push({ title: s.chapter, start: s.start });
  return out;
}
