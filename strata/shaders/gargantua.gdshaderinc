// Gargantua: a black hole in the sky, drawn by tracing every ray of light that
// passes near it along a null geodesic of the Schwarzschild spacetime.
//
// Included by sky.gdshader after sky_air() and sky_space(). The same
// integrator lives in src/Beyond/Gargantua.cs, where the unit tests check it:
// the shadow's rim at an impact parameter of 3√3 M, weak-field bending 4M/b.
//
// In the hole's own units (lengths in M = GM/c²), a photon's path obeys
//     x'' = -3 h² x / r⁵,   h = |x × x'| (conserved),
// which reproduces the exact Schwarzschild orbit equation u'' + u = 3u².
// The ray is stepped with velocity Verlet, in steps proportional to r.
// Light that reaches r = 2M (the horizon) is lost: that is the shadow.
// Light that leaves the 30M sphere again carries the colour of the sky
// (sun, moon, stars) from the direction it finally travels in.
//
// The disk is thin and lies in the plane through the centre at right angles to
// bh_normal, from 4M to 15M. Like the film's renders, the colours ignore the
// Doppler and gravitational shifts that would make one side blue-white and
// the other dim red; it is lensed, but painted as it would look at rest.

global uniform float bh_on;
global uniform vec3 bh_centre;    // world position, blocks
global uniform float bh_m;        // M in blocks
global uniform vec3 bh_normal;    // the disk's axis
global uniform vec3 bh_u;         // two directions in the disk's plane
global uniform vec3 bh_v;

const float BH_HORIZON = 2.0;
const float BH_DISK_IN = 4.0;
const float BH_DISK_OUT = 15.0;
const float BH_REACH = 30.0;
const int BH_STEPS = 220;

float bh_step(float r) {
    return clamp(0.07 * r * clamp((r - 2.2) * 0.6 + 0.35, 0.35, 1.0), 0.02, 2.5);
}

// The disk's temperature against its hottest ring: a thin disk's T ∝ r^-3/4 (1 - √(r_in/r))^1/4,
// which peaks at r = 49/36 r_in.
float disk_temp(float r) {
    float f = pow(r / BH_DISK_IN, -0.75) * pow(max(1.0 - sqrt(BH_DISK_IN / r), 0.0), 0.25);
    return f / 0.488;
}

// Hot gas from white-gold at the inner edge to deep orange at the rim.
vec3 disk_colour(float t) {
    vec3 c = mix(vec3(0.95, 0.28, 0.05), vec3(1.0, 0.62, 0.25), smoothstep(0.15, 0.55, t));
    c = mix(c, vec3(1.0, 0.86, 0.62), smoothstep(0.55, 0.85, t));
    return mix(c, vec3(1.0, 0.97, 0.9), smoothstep(0.88, 1.0, t));
}

// Streaky turbulence that turns with the gas. Each ring turns at its own
// Keplerian rate, so the pattern winds into fine spirals; to stop it winding
// forever, two copies half a cycle apart are cross-faded as each grows old.
float disk_pattern(float r, float phi) {
    const float CYCLE = 50.0;
    float omega = 1.25 * pow(r, -1.5);          // rad/s: about 40 s per turn at the inner edge
    float lr = log(r);
    float acc = 0.0;
    for (int k = 0; k < 2; k++) {
        float age = fract(TIME / CYCLE + 0.5 * float(k));
        float w = 1.0 - abs(2.0 * age - 1.0);
        float a = phi - omega * age * CYCLE + float(k) * 2.1;
        vec3 p = vec3(cos(a) * 2.2, sin(a) * 2.2, lr * 11.0);
        float n = fbm(p + float(k) * 7.31) * 0.65 + vnoise(vec3(cos(a) * 9.0, sin(a) * 9.0, lr * 40.0)) * 0.35;
        acc += n * w;
    }
    return acc;
}

// Light from the disk where a ray crosses it at p (hole units), travelling along dir.
// rgb: emitted colour; a: how much of what lies behind it the disk hides.
vec4 disk_sample(vec3 p, vec3 dir) {
    float r = length(p);
    if (r < BH_DISK_IN - 0.4 || r > BH_DISK_OUT) return vec4(0.0);
    float phi = atan(dot(p, bh_v), dot(p, bh_u));
    float temp = disk_temp(max(r, BH_DISK_IN + 0.01));
    float t = pow(temp, 2.2);                   // colour and brightness fall off faster than the temperature
    float n = disk_pattern(r, phi);
    float lanes = 0.3 + 0.7 * smoothstep(0.3, 0.72, n);
    float edge = smoothstep(BH_DISK_IN - 0.4, BH_DISK_IN + 0.5, r) * (1.0 - smoothstep(8.0, BH_DISK_OUT, r));
    float dens = edge * lanes;
    // Seen edge-on the light passes through more of the disk: a thin slab, not a sheet.
    float slant = max(abs(dot(dir, bh_normal)), 0.06);
    float alpha = 1.0 - pow(1.0 - clamp(dens * (0.45 + 0.5 * t), 0.0, 0.97), 1.0 / slant);
    vec3 col = disk_colour(t) * (0.22 + 1.25 * t * t) * (0.45 + 1.0 * n);
    return vec4(col, clamp(alpha, 0.0, 1.0));
}

// The sky seen along d from cam, with the hole in it. `air` is sky_air(d): the
// air is in front of the hole, so it is added over whatever the hole shows.
vec3 gargantua_sky(vec3 cam, vec3 d, vec3 air, float pix) {
    vec3 x = (cam - bh_centre) / bh_m;
    vec3 v = d;
    float c = dot(x, x) - BH_REACH * BH_REACH;
    if (c > 0.0) {
        float b = dot(x, v);
        float disc = b * b - c;
        if (b > 0.0 || disc < 0.0) {
            vec4 s = sky_space(d, d.y, pix);
            return air * (1.0 - s.a) + s.rgb;
        }
        x += v * (-b - sqrt(disc));
    }
    if (dot(x, x) < BH_HORIZON * BH_HORIZON) return air * 0.15;
    vec3 hv = cross(x, v);
    float h2 = dot(hv, hv);
    vec3 glow = vec3(0.0);
    float alpha = 0.0;
    bool lost = false;
    for (int i = 0; i < BH_STEPS; i++) {
        float r2 = dot(x, x);
        float r = sqrt(r2);
        if (r < BH_HORIZON) { lost = true; break; }
        if (r > BH_REACH && dot(x, v) > 0.0) break;
        float dt = bh_step(r);
        vec3 a = x * (-3.0 * h2 / (r2 * r2 * r));
        vec3 x1 = x + v * dt + a * (0.5 * dt * dt);
        float r1 = length(x1);
        vec3 a1 = x1 * (-3.0 * h2 / (r1 * r1 * r1 * r1 * r1));
        vec3 v1 = v + (a + a1) * (0.5 * dt);
        float s0 = dot(x, bh_normal);
        float s1 = dot(x1, bh_normal);
        if (s0 * s1 <= 0.0 && s0 != s1) {
            vec4 e = disk_sample(mix(x, x1, s0 / (s0 - s1)), normalize(v1));
            glow += (1.0 - alpha) * e.rgb * e.a;
            alpha += (1.0 - alpha) * e.a;
            if (alpha > 0.985) break;
        }
        x = x1;
        v = v1;
        if (i == BH_STEPS - 1 && length(x) < 4.5) lost = true;    // still circling the photon sphere
    }
    vec4 s = lost ? vec4(0.0) : sky_space(normalize(v), d.y, pix);
    // The disk and the shadow are far behind the air but bright or black enough to show
    // through it by day; the air over them is dimmed so the hole reads as a dark body, not a window.
    float body = max(alpha, lost ? 1.0 : s.a);
    vec3 front = air * (1.0 - 0.8 * body);
    return front + (1.0 - alpha) * s.rgb + glow;
}
