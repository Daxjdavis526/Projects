// Animations and phase-space plots — the mechanics of an animation (solve
// once, sample the solution at frame times; create artists once and move
// them with set_data; FuncAnimation's frames, interval, blit and save) and
// how to read a phase portrait (closed loops, spirals, separatrices, saddles,
// limit cycles, where a trajectory is fast or slow, turning points). The
// solvers themselves are prog.P11's; here they only produce what is drawn.
//
// The code lab returns each Matplotlib figure as one still PNG (src/lab:
// Agg backend, figures saved on return), so a FuncAnimation builds but never
// plays here; the lesson draws frame strips instead and says so. Printed
// numbers were copied from running the Explore code in the Atlas's Pyodide.
import { lesson, mcq, num, code } from '../../src/core/content.js';

const t = String.raw;

// ── the worked example: the ISS in a 15-second clip at 24 fps ──
const MU = 398600.4418, A_ISS = 6778, T_ISS = 2 * Math.PI * Math.sqrt(A_ISS ** 3 / MU);
const FR_ISS = 15 * 24;
// ── the turning-point item: x = e^{−γt}(cos ωt + (γ/ω) sin ωt), released at rest from x = 1 ──
const GAM = 0.15, OM = 1.5, X_TURN = -Math.exp((-GAM * Math.PI) / OM);
// ── the Schwarzschild radial portrait (M = 1, L = 4.2): circular orbits r = (L²/2)(1 ± √(1 − 12/L²)) ──
const L2 = 17.64, R_U = (L2 / 2) * (1 - Math.sqrt(1 - 12 / L2)), R_S = (L2 / 2) * (1 + Math.sqrt(1 - 12 / L2));
const VEFF = (r) => 0.5 * (1 - 2 / r) * (1 + L2 / r / r);
// ── the exercise's transfer orbit ──
const GTO_A = 24396, GTO_E = 0.7283;

const pendulumPortrait = { fx: 'y', fy: '-sin(x)', x: [-3.6, 3.6], y: [-3, 3], aspect: 'wide', equal: false, xlabel: 'θ (rad)', ylabel: 'ω (rad/s)', click: false, grid: 21,
  levels: { fn: 'y^2/2 - cos(x)', values: [-0.6, 0, 0.6, 1, 2.125], highlight: [1] } };

export default lesson({
  id: 'prog.P16.1',
  title: 'Animations and phase-space plots',
  minutes: 13, difficulty: 2,
  intro: t`An animation is a **sequence of still frames**, and every frame is the solution sampled at one moment. So the work splits in two. **Solve once**, as accurately as the physics needs; then **sample** that solution at the frame times $t_k = k/f$, where $f$ is the frame rate. The integrator's step is chosen for accuracy, the frame step for the viewer — never one for the other.

Drawing follows the same split: create the plotted objects (*artists*) **once**, then for each frame move them with \`set_data\`. Matplotlib's \`FuncAnimation(fig, update, frames, interval)\` calls your \`update(k)\` for frame $k$ and shows the result every \`interval\` milliseconds — in a window, or saved to a GIF or MP4. **This code lab hands back each figure as a single still image**, so an animation built here never plays; the lessons show a *frame strip* — the frames side by side — or a slider instead.

A **phase portrait** is the other way to see motion: plot velocity against position, so a whole history becomes one curve, traced in the direction time runs.`,
  symbols: [
    { tex: 't_k = k/f', text: 'the time of frame $k$ in the *video*; map it to simulated time by the ratio of simulated time to video length' },
    { tex: 'f', text: 'the frame rate in frames per second (fps): 24 for film, 30 or 60 for screens' },
    { tex: t`\texttt{interval}`, text: 'FuncAnimation’s pause between frames on screen, in milliseconds: $1000/f$' },
    { tex: t`(\theta, \omega)`, text: 'a phase-space point: the position (here an angle) and its rate of change; a trajectory is the curve these trace' },
  ],
  why: 'An animation or a phase portrait often shows in seconds what a table of numbers hides — a slow drift, a missing turning point, an orbit that should have closed.',
  visual: {
    type: 'code-runner',
    title: 'A pendulum, frame by frame',
    lead: t`Press **Run**. A pendulum released at rest from 150°, in units where $g/L = 1$, solved once and sampled at six frames over one swing. Top: the pendulum. Bottom: its phase portrait, $\omega$ against $\theta$, with the path so far in colour. The same \`init\` and \`update\` functions would drive \`FuncAnimation\` on your own computer (the comment at the end).`,
    tasks: [
      t`Set \`n_frames = 12\`. The solution is not recomputed: frames are samples of it, so a smoother animation costs nothing in accuracy.`,
      t`Look where successive dots land: crowded near $\theta = \pm150°$, where the bob slows to a stop, far apart near the bottom, where it is fastest. Equal times, unequal distances: the spacing of frames shows the speed along a phase curve.`,
      'Release it from 179° (set theta0). The period grows from 11.07 to 24.5 — four times the small-swing 2π — and the orbit hugs the curve through the upside-down position, where the pendulum lingers.',
    ],
    params: {
      rows: 24,
      code: t`import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import solve_ivp
from scipy.special import ellipk

# A pendulum released from rest at 150°, in units where g/L = 1 (small swings: period 2π).
theta0 = np.radians(150)
period = 4 * ellipk(np.sin(theta0 / 2)**2)          # the exact period at this amplitude

def pendulum(t, s):
    theta, omega = s
    return [omega, -np.sin(theta)]

# Solve ONCE, accurately, with dense output; frames are samples of that solution.
sol = solve_ivp(pendulum, (0, period), [theta0, 0.0], rtol=1e-10, atol=1e-10, dense_output=True)
n_frames = 6
t_frames = np.linspace(0, period, n_frames, endpoint=False)
t_fine = np.linspace(0, period, 600)
theta, omega = sol.sol(t_fine)

def init(ax_bob, ax_phase):
    """Create every artist once, empty, and return them."""
    ax_bob.set_xlim(-1.2, 1.2); ax_bob.set_ylim(-1.2, 1.2)
    ax_bob.set_aspect("equal"); ax_bob.axis("off")
    a = np.linspace(0, 2 * np.pi, 100)
    ax_bob.plot(np.cos(a), np.sin(a), color="0.35", lw=0.6)          # the bob's circle
    ax_bob.plot([0], [0], "o", color="0.6", ms=3)                     # the pivot
    ax_phase.plot(np.degrees(theta), omega, color="0.45", lw=0.8)     # the whole orbit, faint
    ax_phase.set_xlim(-180, 180); ax_phase.set_ylim(-2.3, 2.3)
    rod, = ax_bob.plot([], [], lw=2)
    bob, = ax_bob.plot([], [], "o", ms=9)
    trail, = ax_phase.plot([], [], lw=2)
    dot, = ax_phase.plot([], [], "o", ms=6)
    return rod, bob, trail, dot

def update(k, artists):
    """Move the artists to frame k with set_data: nothing new is plotted."""
    rod, bob, trail, dot = artists
    th, om = sol.sol(t_frames[k])
    x, y = np.sin(th), -np.cos(th)
    rod.set_data([0, x], [0, y])
    bob.set_data([x], [y])
    past = t_fine <= t_frames[k]
    trail.set_data(np.degrees(theta[past]), omega[past])
    dot.set_data([np.degrees(th)], [om])
    return artists

# This lab hands back still images, so lay the frames side by side: a frame strip.
fig, axes = plt.subplots(2, n_frames, figsize=(10, 3.8), height_ratios=[1, 1.3])
for k in range(n_frames):
    update(k, init(axes[0, k], axes[1, k]))
    axes[0, k].set_title(f"t = {t_frames[k]:.1f}", fontsize=9)
    if k:
        axes[1, k].set_yticklabels([])
axes[1, 0].set_ylabel("ω")
fig.supxlabel("θ (degrees)", fontsize=10)
print(f"period at {np.degrees(theta0):.0f}°: {period:.3f} (small swings: {2 * np.pi:.3f})")
plt.show()

# On your own computer the SAME two functions animate it, in a window or a file:
#   from matplotlib.animation import FuncAnimation
#   fig, (a, b) = plt.subplots(1, 2)
#   artists = init(a, b)
#   ani = FuncAnimation(fig, update, frames=n_frames, fargs=(artists,), interval=100)
#   ani.save("pendulum.gif", fps=10)        # or plt.show()`,
    },
    caption: 'A frictionless pendulum, solved with tight tolerances; time in units of √(L/g). The frame strip stands in for an animation: in this browser Matplotlib draws into memory and returns one still image per figure.',
  },
  example: {
    prompt: t`Plan a 15-second clip, at 24 frames per second, of one orbit of the International Space Station (circular, radius 6778 km): how many frames, how much simulated time per frame, and the code that draws them.`,
    visual: {
      type: 'graph',
      params: { x: [-8500, 8500], y: [-7500, 7500], equal: true, aspect: 'wide', axes: false, xlabel: '', ylabel: '', grid: false,
        curves: [{ param: [`${A_ISS}*cos(t)`, `${A_ISS}*sin(t)`], t: [0, 2 * Math.PI], color: 'ink4', width: 1.2 }, { param: ['6371*cos(t)', '6371*sin(t)'], t: [0, 2 * Math.PI], color: 'accent', width: 1.5 }],
        points: [...Array.from({ length: 12 }, (_, i) => ({ x: +(A_ISS * Math.cos((2 * Math.PI * i) / 12)).toFixed(1), y: +(A_ISS * Math.sin((2 * Math.PI * i) / 12)).toFixed(1), r: i ? 3.5 : 5.5, color: 'gold' })),
          { x: A_ISS, y: 0, r: 0, label: 'frame 0', labelDx: 10, labelDy: 4, color: 'gold' }, { x: 0, y: 0, r: 0, label: 'Earth', labelDx: -16, labelDy: 4, color: 'accent' }] },
      caption: 'Every 30th of the 360 frames: on a circular orbit the frames are evenly spaced. Earth and the orbit to scale; the ISS’s 400 km altitude is a thin ring outside the planet.',
    },
    steps: [
      { label: 'Count the frames', text: t`A 15 s clip at 24 fps is $15\times24 = ${FR_ISS}$ frames. One orbit takes $T = 2\pi\sqrt{a^3/\mu} = ${T_ISS.toFixed(0)}$ s, so each frame advances the simulation by $${T_ISS.toFixed(0)}/${FR_ISS} = ${(T_ISS / FR_ISS).toFixed(1)}$ s — the clip runs about ${Math.round(T_ISS / 15)} times faster than life.` },
      { label: 'Solve once, then sample', text: t`Integrate with whatever step accuracy demands, keep the interpolant, and evaluate it at the frame times:

\`\`\`python
sol = solve_ivp(kepler, (0, T), s0, rtol=1e-9, atol=1e-9, dense_output=True)
t_frames = np.linspace(0, T, 360, endpoint=False)
x, y = sol.sol(t_frames)[:2]              # one position per frame
\`\`\`

Changing the frame rate later changes only \`t_frames\`; the physics is untouched.` },
      { label: 'Create the artists once', text: t`\`\`\`python
fig, ax = plt.subplots()
ax.set_aspect("equal")
ax.add_patch(plt.Circle((0, 0), 6371))    # Earth
trail, = ax.plot([], [], lw=1)            # empty now, filled frame by frame
sat, = ax.plot([], [], "o")
\`\`\`

\`ax.plot\` returns a list of lines; the comma unpacks the one line.` },
      { label: 'Move them each frame', text: t`\`\`\`python
def update(k):
    trail.set_data(x[:k + 1], y[:k + 1])  # the path so far
    sat.set_data([x[k]], [y[k]])          # set_data wants sequences
    return trail, sat                     # what changed (needed for blit)
\`\`\`

\`update\` moves existing artists; it never calls \`plot\`.` },
      { label: 'Play or save', text: t`\`\`\`python
from matplotlib.animation import FuncAnimation
ani = FuncAnimation(fig, update, frames=360, interval=1000 / 24, blit=True)
ani.save("iss.gif", fps=24)               # an MP4 needs ffmpeg installed
\`\`\`

Keep \`ani\` in a variable: an animation with no name left pointing to it is deleted before it plays. Here in the lab the figure would come back as one still; on your own computer \`plt.show()\` plays it in a window.` },
    ],
    answer: t`${FR_ISS} frames, ${(T_ISS / FR_ISS).toFixed(1)} s of orbit per frame; solve once with dense output, sample at the frame times, create the artists once and move them with \`set_data\` in \`update\`.`,
  },
  practice: [
    num({
      id: 'per-frame', difficulty: 1,
      gen(r) {
        const [what, T] = r.pick([['three orbits of the ISS (5554 s each)', 3 * 5554], ['one sidereal day of a GPS satellite, two orbits', 86164], ['one 7.66-hour orbit of Phobos', 7.66 * 3600]]);
        const D = r.pick([10, 12, 20, 30]), F = r.pick([24, 30, 60]);
        const key = T / (D * F);
        return {
          prompt: t`You animate ${what} as a ${D}-second clip at ${F} fps:

\`\`\`python
t_frames = np.linspace(0, ${T}, ${D} * ${F}, endpoint=False)    # simulated seconds
\`\`\`

How many seconds of simulated time pass between one frame and the next?`,
          answer: key, units: 's', tol: { rel: 0.01 },
          errors: [{ value: T / D, feedback: t`That is the simulated time per second of *video*; each second holds ${F} frames.` }, { value: D * F, feedback: 'That is the number of frames. Divide the simulated time by it.' }],
          hints: [t`Frames = duration × frame rate = ${D} × ${F}.`, 'Divide the simulated time by the number of frames.'],
          teach: 'Frames = video length × frame rate; simulated time per frame = simulated span ÷ frames.',
          explain: t`${D} × ${F} = ${D * F} frames, so each advances ${T} s / ${D * F} = ${key.toPrecision(3)} s. These are the times at which to sample the solution, whatever step the integrator took.`,
        };
      },
    }),
    mcq({
      id: 'set-data', difficulty: 2,
      prompt: t`This \`update\` works at first, but after a few hundred frames the animation crawls, and every earlier position of the dot is still on screen. Why?

\`\`\`python
def update(k):
    ax.plot(x[:k + 1], y[:k + 1], color="C0")
    ax.plot([x[k]], [y[k]], "o", color="C1")
\`\`\``,
      choices: [
        'Each call adds two new line objects, so after 300 frames the axes hold 600 of them, all drawn every frame; create the artists once and move them with set_data',
        'The arrays are too long: plotting slows down as k grows because x[:k+1] gets longer',
        'FuncAnimation keeps a copy of every frame in memory',
        'The colours are fixed, so Matplotlib cannot tell the frames apart',
      ],
      answer: 0,
      why: {
        1: 'One line of 300 points draws in a blink; six hundred overlapping lines do not. The growth is in the number of artists, not their length.',
        2: 'It draws whatever artists the axes hold; the pile-up is made by update itself.',
        3: 'Colours have nothing to do with it; the old dots stay because nothing removes them.',
      },
      hints: ['What does ax.plot return, and where does that object go?', 'How many lines are in `ax.lines` after k frames?'],
      teach: 'An update function moves artists that already exist (set_data); calling plot in it adds new ones every frame.',
      explain: t`\`ax.plot\` creates a new \`Line2D\` and adds it to the axes every time. Make \`trail, = ax.plot([], [])\` and \`dot, = ax.plot([], [], "o")\` once, outside, and in \`update\` call \`trail.set_data(...)\` and \`dot.set_data(...)\`. The axes then hold two lines for ever, and the old dot disappears because the same dot moved.`,
    }),
    num({
      id: 'interval', difficulty: 2,
      gen(r) {
        const N = r.pick([240, 360, 480, 600]), I = r.pick([20, 25, 40, 50]);
        const key = (N * I) / 1000;
        return {
          prompt: t`How many seconds does this animation take to play once on screen?

\`\`\`python
ani = FuncAnimation(fig, update, frames=${N}, interval=${I})
\`\`\``,
          answer: key, units: 's', tol: { rel: 0.01 },
          errors: [{ value: N / I, feedback: t`\`interval\` is the pause between frames in milliseconds, not a frame rate: multiply.` }],
          hints: ['interval is the time between frames, in milliseconds.', `Total: ${N} × ${I} ms.`],
          teach: 'FuncAnimation’s interval is milliseconds per frame: playing time = frames × interval, and the frame rate is 1000/interval.',
          explain: t`${N} frames × ${I} ms $= ${N * I}$ ms $= ${key}$ s, at $1000/${I} = ${1000 / I}$ frames per second. (When saving, the file's rate is set separately, by \`ani.save(..., fps=...)\`.)`,
        };
      },
    }),
    mcq({
      id: 'sample', difficulty: 3,
      prompt: t`To make a 30 fps animation of a comet's orbit, a student integrates with Euler's method using one step per frame:

\`\`\`python
dt = T_orbit / n_frames          # one integration step per frame
for k in range(n_frames):
    s = s + dt * f(s)            # then draw frame k
\`\`\`

The comet spirals away from the Sun. What is the better design?`,
      choices: [
        'Solve with a step or tolerance chosen for accuracy (an adaptive solver, or many small steps per frame), then sample the solution at the frame times — the frame count must not set the time step',
        'Use more frames per second, so dt shrinks',
        'Keep one Euler step per frame but draw the comet smaller',
        'Use blit=True, which corrects the drift',
      ],
      answer: 0,
      why: {
        1: 'It would shrink the error, but now the frame rate, a choice about viewers, controls the physics — and the slow, error-prone method is still the bottleneck.',
        2: 'The drawing is not the problem; the orbit itself is wrong.',
        3: 'blit only redraws the artists that changed, for speed. It cannot change what was computed.',
      },
      hints: ['Who should decide the integration step: the physics or the video?', 'An eccentric orbit needs tiny steps at perihelion and big ones far out; frames are evenly spaced in time.'],
      teach: 'Decouple the integrator from the frame rate: solve accurately once, then interpolate the solution at the frame times.',
      explain: t`Euler with a few hundred steps per orbit gains energy and spirals outward (prog.P11.3). Solve with \`solve_ivp(..., dense_output=True)\` or a symplectic integrator with small steps, then evaluate at \`t_frames\`. An eccentric comet is the worst case: evenly spaced frames are far too coarse a step at perihelion.`,
    }),
    mcq({
      id: 'over-the-top', difficulty: 2,
      prompt: t`The pendulum's phase portrait ($g/L = 1$): curves of constant energy, traced in the direction of the arrows. One trajectory passes through $P$, at $\theta = 0$ with $\omega = 2.5$ rad/s. What does that pendulum do?`,
      visual: { type: 'de-plane', params: { ...pendulumPortrait, points: [{ x: 0, y: 2.5, label: 'P', color: 'gold', r: 5, labelDx: 8, labelDy: -8 }] }, caption: 'Level curves of the energy ½ω² − cos θ. Gold: the separatrix, through the upside-down position θ = ±π.' },
      choices: [
        'It goes over the top and keeps whirling round in the same direction: its curve never returns to ω = 0',
        'It swings back and forth between two turning angles',
        'It comes to rest balanced upside down',
        'It slows and spirals into the bottom position',
      ],
      answer: 0,
      why: {
        1: 'Swinging trajectories are the closed loops inside the gold curve; they cross ω = 0 at the turning angles. P’s curve runs above the gold one and never crosses ω = 0.',
        2: 'That is the gold separatrix itself, with exactly the energy to reach the top in infinite time. P has more.',
        3: 'A spiral needs friction; this pendulum has none, so its curves are closed or run off the edges.',
      },
      hints: ['Where does each kind of curve cross the θ axis (ω = 0)?', t`Compare P's energy, $\tfrac12(2.5)^2 - \cos 0$, with the energy needed to reach the top, $-\cos\pi = 1$.`],
      teach: 'In a phase portrait, closed loops are oscillations, curves that never cross ω = 0 are rotations, and the separatrix between them passes through the unstable equilibrium.',
      explain: t`P's energy is $\tfrac12(2.5)^2 - 1 = 2.125$, above the 1 needed to stand the pendulum upside down. Its $\omega$ dips to $\sqrt{2(2.125 - 1)} = 1.5$ rad/s at the top and never reaches zero: it whirls round for ever. Its curve is periodic in $\theta$ — the portrait at $\theta$ and $\theta + 2\pi$ is the same state.`,
    }),
    {
      type: 'point', id: 'turning-point', difficulty: 3,
      prompt: t`A damped oscillator is released at rest from $x = 1$ and its phase portrait spirals inward, clockwise. Drag the point to the state where the mass **first comes momentarily to rest** after release.`,
      visual: {
        type: 'graph',
        params: { x: [-1.3, 1.3], y: [-1.7, 1.7], aspect: 'wide', axesAt: 'edge', xlabel: 'position x (m)', ylabel: 'velocity v (m/s)',
          curves: [{ param: [`exp(-${GAM}*t)*(cos(${OM}*t) + ${GAM / OM}*sin(${OM}*t))`, `-exp(-${GAM}*t)*${OM + (GAM * GAM) / OM}*sin(${OM}*t)`], t: [0, 14], color: 'accent', width: 2 }],
          hlines: [{ y: 0, color: 'ink4' }], vlines: [{ x: 0, color: 'ink4' }],
          points: [{ x: 1, y: 0, color: 'good', r: 5, label: 'release', labelDx: -10, labelDy: -12, labelAlign: 'right' }],
          arrows: [{ from: [0.95, -0.35], to: [0.75, -0.75], color: 'accent', width: 2 }],
          drag: [{ key: 'p', x: 0.3, y: 1.0, snap: 0.01 }] },
      },
      answer: { x: X_TURN, y: 0 }, tol: { x: 0.08, y: 0.1 },
      instruction: 'Drag the point to the first turning point after release, then check.',
      hints: ['At rest means v = 0: the curve crosses the horizontal axis.', 'Follow the spiral clockwise from the release point: half a turn brings it back to v = 0 on the other side.'],
      teach: 'Turning points sit where a phase curve crosses v = 0; for an oscillator they alternate left and right of the origin, half a turn apart.',
      explain: t`Half a turn after release the curve crosses $v = 0$ at $x \approx ${X_TURN.toFixed(2)}$ m: the mass has swung to the far side and stopped for an instant. Damping shrank the amplitude from 1 to $e^{-\gamma\pi/\omega} = ${(-X_TURN).toFixed(2)}$ in that half period (here $\gamma = ${GAM}\ \text{s}^{-1}$, $\omega = ${OM}$ rad/s).`,
    },
    mcq({
      id: 'limit-cycle', difficulty: 3,
      prompt: t`Trajectories of the van der Pol oscillator, $\ddot x - \mu(1 - x^2)\dot x + x = 0$ with $\mu = 1$, a model of a self-excited oscillation. Started inside or outside, every trajectory approaches the same closed curve. What does that mean physically?`,
      visual: { type: 'de-plane', params: { fx: 'y', fy: '(1 - x^2)*y - x', x: [-4, 4], y: [-4, 4], aspect: 'wide', equal: false, xlabel: 'x', ylabel: 'ẋ', click: false, T: 25, grid: 19,
        seeds: [{ x: 0.1, y: 0, color: 'gold', dir: 'forward' }, { x: 3.6, y: 3.2, color: 'violet', dir: 'forward' }, { x: -3.8, y: -0.5, color: 'teal', dir: 'forward' }] }, caption: 'Three trajectories, from near the origin (gold) and from far outside it, run forward in time.' },
      choices: [
        'A self-sustained oscillation: whatever the start, it settles to the same amplitude and period — energy is pumped in at small amplitude and removed at large',
        'The oscillation dies away: all trajectories end at the origin',
        'Each start keeps its own amplitude, as in a frictionless pendulum',
        'The oscillator is unstable: trajectories run away to infinity',
      ],
      answer: 0,
      why: {
        1: 'The origin is where they leave from: the gold curve starts beside it and spirals outward.',
        2: 'In a conservative system each start keeps its own closed curve; here curves from different starts merge into one.',
        3: 'The outer curves spiral inward onto the loop, not outward.',
      },
      hints: ['Compare the curve that starts near the origin with those that start far away.', t`For $\lvert x\rvert < 1$ the term $-\mu(1 - x^2)\dot x$ acts as negative damping.`],
      teach: 'A limit cycle — an isolated closed curve that neighbouring trajectories approach — is an oscillation that chooses its own amplitude.',
      explain: t`For $\lvert x\rvert < 1$ the "damping" is negative and pumps energy in; for $\lvert x\rvert > 1$ it removes energy. Small oscillations grow and large ones shrink until they meet on the limit cycle, amplitude about 2. Heartbeats, violin strings and the combustion instabilities that rocket-engine designers fight are oscillations of this self-excited kind.`,
    }),
  ],
  checkpoint: [
    mcq({
      id: 'cp-libration', difficulty: 3, transfer: true,
      prompt: t`A long boom on a satellite in a circular orbit feels a gravity-gradient torque. Its pitch angle $\theta$ from the local vertical obeys $\ddot\theta = -\tfrac32 n^2 \sin 2\theta$, where $n$ is the orbital rate ($n = 1$ here). From its phase portrait, how many orientations can the boom rest in **stably**, and what does a trajectory that runs off the side of the picture mean?`,
      visual: { type: 'de-plane', params: { fx: 'y', fy: '-1.5*sin(2*x)', x: [-3.4, 3.4], y: [-2.6, 2.6], aspect: 'wide', equal: false, xlabel: 'θ (rad)', ylabel: 'θ̇ (per unit of 1/n)', click: false, grid: 21,
        levels: { fn: 'y^2/2 - 0.75*cos(2*x)', values: [-0.55, -0.2, 0.3, 0.75, 1.4], highlight: [0.75] } }, caption: 'Level curves of ½θ̇² − ¾ cos 2θ, which this motion conserves. Gold: the separatrix. Rigid boom, circular orbit, pitch only.' },
      choices: [
        'Two: toward the Earth (θ = 0) or away from it (θ = ±π); a curve that runs off the side is a boom tumbling end over end',
        'One: only pointing straight down at the Earth; a curve off the side is a boom swinging wider',
        'Four: wherever the trajectories cross the θ axis',
        'None: every trajectory eventually leaves the picture',
      ],
      answer: 0,
      why: {
        1: 'The portrait repeats every π, not 2π: the centre at θ = ±π looks exactly like the one at 0. A boom pointing away from Earth is just as stable — the torque depends on sin 2θ.',
        2: 'Curves cross the θ axis at turning points as well as at equilibria. The equilibria at ±π/2 are saddles, where the separatrices cross: unstable.',
        3: 'Only the curves outside the gold separatrix leave; the loops inside it oscillate for ever.',
      },
      hints: ['Centres (surrounded by closed loops) are stable; saddles (where separatrices cross) are not.', t`The force law has $\sin 2\theta$: by how much must $\theta$ change for the picture to repeat?`],
      teach: 'Read stability off a portrait: closed loops surround stable equilibria, separatrices cross at unstable ones, and curves outside the separatrix are a different motion — here, tumbling.',
      explain: t`Centres at $\theta = 0$ and $\pm\pi$ — boom down or boom up, both stable — and saddles at $\pm\pi/2$, boom horizontal. Small disturbances librate at $\sqrt3\,n$, a period of $1/\sqrt3$ of an orbit. With more energy than the separatrix's, the boom passes horizontal and tumbles. Gravity-gradient booms on early satellites used exactly this passive stability.`,
    }),
    mcq({
      id: 'cp-schwarzschild', difficulty: 3, transfer: true,
      prompt: t`Radial motion of a particle orbiting a Schwarzschild black hole of mass $M$ (units $G = c = 1$, $M = 1$), with angular momentum $L = 4.2$: each curve is one orbit's $dr/d\tau$ against $r$, where $\tau$ is the particle's proper time; the horizon is at $r = 2$. Which statement is right?`,
      visual: { type: 'de-plane', params: { fx: 'y', fy: `-(1/x^2 - ${L2}/x^3 + ${3 * L2}/x^4)`, x: [2.1, 30], y: [-0.45, 0.45], aspect: 'wide', equal: false, xlabel: 'r (units of M)', ylabel: 'dr/dτ', click: false, grid: 19,
        levels: { fn: `y^2/2 + 0.5*(1 - 2/x)*(1 + ${L2}/x^2)`, values: [0.4685, 0.47, 0.4725, 0.495, +VEFF(R_U).toFixed(6), 0.56], highlight: [+VEFF(R_U).toFixed(6)] },
        points: [{ x: +R_U.toFixed(3), y: 0, label: 'P', color: 'gold', r: 5, labelDx: 6, labelDy: -10 }] },
        caption: 'Level curves of ½(dr/dτ)² + ½(1 − 2M/r)(1 + L²/r²), conserved along each geodesic. Gold: the curve through P. Only the radial part of the motion is shown; the particle also circles the hole.' },
      choices: [
        'A closed loop is a bound orbit: r swings between periapsis and apoapsis, the two places where the loop crosses dr/dτ = 0',
        t`P, at $r \approx ${R_U.toFixed(1)}M$, is a stable circular orbit`,
        'A curve that leaves through the left edge escapes to infinity',
        'A closed loop is a particle hovering near one point in space',
      ],
      answer: 0,
      why: {
        1: t`P is a saddle: the gold curves cross there and nearby trajectories run away from it — an *unstable* circular orbit. The stable one is the centre of the loops, at $r \approx ${R_S.toFixed(1)}M$.`,
        2: 'The left edge is small r: such a particle plunges through the horizon at r = 2M.',
        3: 'Only r is plotted. While r oscillates the angle keeps growing, so the particle goes round and round the hole.',
      },
      hints: ['Where on a loop is dr/dτ zero, and what does that mean for the distance?', 'Is P surrounded by loops, or is it where curves cross?'],
      teach: 'A radial phase portrait turns orbits into curves: loops are bound orbits between periapsis and apoapsis, saddles are unstable circular orbits, curves to small r are plunges.',
      explain: t`Each loop is a bound, eccentric orbit: the particle falls in to periapsis and climbs out to apoapsis again and again. In general relativity the time to go round the loop is not the time to go once round the hole, so the periapsis advances each orbit — Mercury's precession, enormously magnified this close in. The saddle P at $r = ${R_U.toFixed(2)}M$ is the unstable circular orbit; the centre at $${R_S.toFixed(2)}M$ the stable one.`,
    }),
    code({
      id: 'cp-update', difficulty: 2,
      prompt: t`The positions of a satellite on a geostationary transfer orbit are sampled at 121 equally spaced **times** and the artists are made. Write \`update(k)\` for \`FuncAnimation\`: it must set \`trail\` to the path from frame 0 to frame $k$ inclusive, put \`sat\` at frame $k$, and **return** both artists (for \`blit=True\`) — without plotting anything new.`,
      starter: t`import numpy as np
import matplotlib.pyplot as plt

# One orbit of a geostationary transfer orbit, sampled at equal TIMES (km)
a, e = ${GTO_A}.0, ${GTO_E}
M = np.linspace(0, 2 * np.pi, 121)          # the mean anomaly grows uniformly in time
E = M.copy()
for _ in range(30):                          # Kepler's equation E − e sin E = M, by Newton
    E -= (E - e * np.sin(E) - M) / (1 - e * np.cos(E))
x, y = a * (np.cos(E) - e), a * np.sqrt(1 - e**2) * np.sin(E)

fig, ax = plt.subplots()
ax.set_aspect("equal")
ax.set_xlim(-45000, 12000)
ax.set_ylim(-22000, 22000)
ax.plot([0], [0], "o", ms=8)                 # Earth (not to scale)
trail, = ax.plot([], [], lw=1.5)
sat, = ax.plot([], [], "o", ms=6)

def update(k):
    pass

# a still of frame 60 (in this lab, figures come back as still images)
update(60)
`,
      answer: t`import numpy as np
import matplotlib.pyplot as plt

# One orbit of a geostationary transfer orbit, sampled at equal TIMES (km)
a, e = ${GTO_A}.0, ${GTO_E}
M = np.linspace(0, 2 * np.pi, 121)          # the mean anomaly grows uniformly in time
E = M.copy()
for _ in range(30):                          # Kepler's equation E − e sin E = M, by Newton
    E -= (E - e * np.sin(E) - M) / (1 - e * np.cos(E))
x, y = a * (np.cos(E) - e), a * np.sqrt(1 - e**2) * np.sin(E)

fig, ax = plt.subplots()
ax.set_aspect("equal")
ax.set_xlim(-45000, 12000)
ax.set_ylim(-22000, 22000)
ax.plot([0], [0], "o", ms=8)                 # Earth (not to scale)
trail, = ax.plot([], [], lw=1.5)
sat, = ax.plot([], [], "o", ms=6)

def update(k):
    trail.set_data(x[:k + 1], y[:k + 1])
    sat.set_data([x[k]], [y[k]])
    return trail, sat

# a still of frame 60 (in this lab, figures come back as still images)
update(60)`,
      tests: [
        { name: t`\`update(k)\` returns the two artists`, code: 'set(update(10) or ()) == {trail, sat}' },
        { name: 'the trail runs from frame 0 to frame k inclusive', code: '(update(10), np.allclose(trail.get_data()[0], x[:11]) and np.allclose(trail.get_data()[1], y[:11]))[1]' },
        { name: 'the satellite sits at frame k', code: '(update(37), np.allclose(sat.get_data()[0], [x[37]]) and np.allclose(sat.get_data()[1], [y[37]]))[1]' },
        { name: 'no new lines are added, however many frames are drawn', code: '(update(3), update(80), len(ax.lines) == 3)[2]' },
      ],
      hints: [t`\`trail.set_data(x[:k + 1], y[:k + 1])\` — the slice stops before its end, so \`k + 1\` includes frame $k$.`, t`\`sat.set_data([x[k]], [y[k]])\`: set_data wants sequences, even for one point.`, t`End with \`return trail, sat\`.`],
      teach: 'An update function sets the data of artists that already exist and returns the ones that changed.',
      explain: t`\`set_data\` replaces a line's points in place, so the axes keep their three lines however long the animation runs. On your machine, \`FuncAnimation(fig, update, frames=121, interval=50, blit=True)\` would play it. Watch the frames in a still or a strip: they crowd together near apogee, on the left, where the satellite is slowest — equal times, unequal distances, Kepler's second law.`,
    }),
  ],
  sources: [
    { label: 'Matplotlib documentation: matplotlib.animation.FuncAnimation', url: 'https://matplotlib.org/stable/api/_as_gen/matplotlib.animation.FuncAnimation.html' },
    { label: 'Strogatz, Nonlinear Dynamics and Chaos, 2nd ed. (2015), ch. 6–7: phase planes and limit cycles', url: 'https://doi.org/10.1201/9780429492563' },
    { label: 'Carroll, Spacetime and Geometry (2004), §5.4: orbits in Schwarzschild', url: 'https://doi.org/10.1017/9781108770385' },
  ],
});
