shader_type spatial;
render_mode unshaded, fog_disabled, cull_front, depth_draw_never, depth_test_disabled, shadows_disabled;

// The tesseract: what lies past Gargantua's horizon. Drawn on a sphere that
// follows the camera (like the sky), by marching each pixel's ray through a
// distance field.
//
// Everything here is a three-dimensional slice of a four-dimensional world.
// A point p of the space you fall through is the 4D point rot4 · (p, wpos):
// rot4 turns the slice through 4-space as time passes, and wpos moves it
// along the fourth axis (Q/E). The 4D world is a lattice of hypercube cells:
//   - beams: the slice through the cells' square faces (their 2-skeleton).
//     A plane in 4D meets a 3D slice in a line, so these are lines, but as
//     the slice turns they shear, split, cross and merge, which no 3D
//     lattice can do;
//   - sparks: where the cells' edges (lines in 4D) pierce the slice, points
//     that slide along the beams and wink in and out;
//   - in each cell a four-dimensional solid, turning on its own: a
//     tesseract (sliced, it is a cube only now and then, and otherwise
//     prisms and hexagons and shapes without names), a tesseract's frame, a
//     16-cell, a Clifford torus or a duocylinder. Different cells hold
//     different versions of the same few things, at different moments of
//     their turning; some of the solid tesseracts are painted like the
//     blocks of the world above, so a grass block tumbles through 4-space.
// Over it all hangs one great hypercube, projected rather than sliced, its
// inner cube turning out through its outer one around you; and threads of
// light run straight down through everything, the way you are falling.

uniform vec3 eye;
uniform float wpos;
uniform float t;
uniform float entry;       // 0 → 1: the fall through the horizon, then the lattice opening up
uniform float collapse;    // 0 → 1: the tesseract folding shut
uniform mat4 rot4;
uniform mat4 spin_a;
uniform mat4 spin_b;
uniform vec3 hero[16];
uniform float quality = 1.0;

const float L = 7.0;        // the lattice's period, in every direction of 4-space
const float RMAX = 1.75;    // no cell's solid reaches further than this from its centre

varying vec3 v_dir;

void vertex() {
    v_dir = (MODEL_MATRIX * vec4(VERTEX, 0.0)).xyz;
}

float hash41(vec4 p) {
    p = fract(p * vec4(0.1031, 0.1030, 0.0973, 0.1099));
    p += dot(p, p.wzxy + 33.33);
    return fract((p.x + p.y) * (p.z + p.w));
}

float hash31(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
}

// The four values in ascending order (a five-comparator sorting network).
vec4 sort4(vec4 e) {
    float a = min(e.x, e.y), b = max(e.x, e.y), c = min(e.z, e.w), d = max(e.z, e.w);
    float lo = min(a, c), x1 = max(a, c), x2 = min(b, d), hi = max(b, d);
    return vec4(lo, min(x1, x2), max(x1, x2), hi);
}

float max4(vec4 v) { return max(max(v.x, v.y), max(v.z, v.w)); }

// --- the four-dimensional solids, distances measured in 4-space ----------------------------

float sd_tesseract(vec4 g, float b) {
    vec4 a = abs(g) - b;
    return length(max(a, 0.0)) + min(max4(a), 0.0);
}

// A tesseract's frame: its square faces, the set where two coordinates sit on the surface.
float sd_tesseract_frame(vec4 g, float b, float th) {
    vec4 a = abs(g) - b;
    vec4 o = max(a, 0.0);
    vec4 c = sort4(vec4(a.x < 0.0 ? a.x * a.x : 0.0, a.y < 0.0 ? a.y * a.y : 0.0, a.z < 0.0 ? a.z * a.z : 0.0, a.w < 0.0 ? a.w * a.w : 0.0));
    return sqrt(dot(o, o) + c.x + c.y) - th;
}

float sd_16cell(vec4 g, float r) {
    return (abs(g.x) + abs(g.y) + abs(g.z) + abs(g.w) - r) * 0.5;
}

float sd_clifford(vec4 g, float r, float th) {
    return length(vec2(length(g.xy) - r, length(g.zw) - r)) - th;
}

float sd_duocylinder(vec4 g, float r) {
    return max(length(g.xy) - r, length(g.zw) - r);
}

// --- the scene --------------------------------------------------------------------------------

// What the solid in cell c is, and how it is turned: kind 0-4, a hash, and its local point.
float cell_kind(vec4 c, out float h) {
    h = hash41(c + 17.0);
    return floor(hash41(c * 1.7 + 3.1) * 5.0);
}

vec4 cell_local(vec4 f, float h) {
    return (h < 0.5 ? spin_a : spin_b) * (f * (h < 0.5 ? 1.0 : -1.0));
}

float cell_solid(vec4 g, float kind, float h) {
    float s = 0.85 + 0.45 * h;
    if (kind < 0.5) return sd_tesseract(g, s);
    if (kind < 1.5) return sd_tesseract_frame(g, s * 1.15, 0.07);
    if (kind < 2.5) return sd_16cell(g, s * 1.7);
    if (kind < 3.5) return sd_clifford(g, s * 0.95, 0.24);
    return sd_duocylinder(g, s * 0.9);
}

// Distance to the nearest surface from p, and what it is: 0 beam, 1 spark, 2 + kind for a cell's solid.
float map(vec3 p, out float mat, out vec4 q, out vec4 cell) {
    q = rot4 * vec4(p, wpos);
    cell = floor(q / L + 0.5);
    vec4 f = q - cell * L;
    vec4 e = sort4(vec4(L * 0.5) - abs(f));
    float beam = length(e.xy) - 0.09;
    float spark = length(e.xyz) - 0.2;
    float h;
    float kind = cell_kind(cell, h);
    float solid = cell_solid(cell_local(f, h), kind, h);
    solid = min(solid, e.x + L * 0.5 - RMAX);    // a neighbour's solid is at least this far
    float d = beam;
    mat = 0.0;
    if (spark < d) { d = spark; mat = 1.0; }
    if (solid < d) { d = solid; mat = 2.0 + kind; }
    return d;
}

float map_d(vec3 p) {
    float m;
    vec4 q, c;
    return map(p, m, q, c);
}

vec3 normal_at(vec3 p, float eps) {
    vec2 k = vec2(1.0, -1.0);
    return normalize(k.xyy * map_d(p + k.xyy * eps) + k.yyx * map_d(p + k.yyx * eps)
        + k.yxy * map_d(p + k.yxy * eps) + k.xxx * map_d(p + k.xxx * eps));
}

vec3 hsv(float h, float s, float v) {
    vec3 k = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return v * mix(vec3(1.0), k, s);
}

// The void between: warm near the beams' glow, deep blue-violet far off.
vec3 void_colour(vec3 d) {
    float up = d.y * 0.5 + 0.5;
    vec3 c = mix(vec3(0.02, 0.012, 0.05), vec3(0.09, 0.05, 0.03), up);
    c += vec3(0.25, 0.12, 0.04) * pow(max(0.0, -d.y), 6.0) * 0.4;      // a glow far below, where you are falling
    return c;
}

// A pixel-art face of a block of the world above, on the 4D cube: the face
// is chosen by which of the four coordinates is largest.
vec3 block_paint(vec4 g, float s, float h) {
    vec4 a = abs(g) / s;
    vec3 grass = vec3(0.36, 0.62, 0.22), dirt = vec3(0.46, 0.32, 0.2), stone = vec3(0.5, 0.5, 0.52), lumen = vec3(0.35, 0.9, 1.0);
    vec3 side;
    if (h < 0.3) side = dirt; else if (h < 0.55) side = stone; else if (h < 0.8) side = vec3(0.86, 0.66, 0.2); else side = lumen;
    vec3 top = h < 0.3 ? grass : side * 1.15;
    vec3 col = side;
    float big = max4(a);
    if (a.y >= big - 1e-4) col = g.y > 0.0 ? top : side * 0.8;
    // Sixteen pixels to a face, each a little lighter or darker.
    vec4 px = floor(g / s * 8.0);
    float n = hash41(px + h * 13.0);
    col *= 0.8 + 0.35 * n;
    // Grass hangs a little way over the sides.
    if (h < 0.3 && a.y < big - 1e-4 && g.y / s > 0.72 && n > 0.3) col = grass * (0.85 + 0.3 * n);
    return col;
}

// Colour of a lit surface: 0 beam, 1 spark, 2-6 the solids.
vec3 shade(vec3 p, vec3 rd, float mat, vec4 q, vec4 cell, float dist) {
    vec3 n = normal_at(p, 0.002 + dist * 0.0006);
    vec3 key = normalize(vec3(0.4, 0.8, 0.3));
    float dif = max(dot(n, key), 0.0);
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    float pulse = 0.5 + 0.5 * sin(dot(q, vec4(1.0, 1.3, 0.7, 1.1)) * 0.9 - t * 2.2);
    if (mat < 0.5) {
        // The beams: dark bronze, with slats of light running along them.
        float slats = smoothstep(0.82, 0.96, fract(dot(q, vec4(1.0)) * 1.6));
        vec3 base = vec3(0.32, 0.2, 0.1);
        return base * (0.25 + 0.75 * dif) + vec3(1.0, 0.62, 0.28) * (rim * 0.7 + slats * (0.4 + 1.6 * pulse));
    }
    if (mat < 1.5) return vec3(1.6, 1.5, 1.9);                       // sparks burn white
    float kind = mat - 2.0;
    float h;
    cell_kind(cell, h);
    vec4 f = q - cell * L;
    vec4 g = cell_local(f, h);
    float s = 0.85 + 0.45 * h;
    if (kind < 0.5) {
        vec3 c = block_paint(g, s, fract(h * 7.31));
        float glow = fract(h * 7.31) > 0.8 ? 0.8 : 0.0;
        return c * (0.35 + 0.75 * dif) + c * glow + vec3(1.0, 0.8, 0.6) * rim * 0.25;
    }
    vec3 tint = hsv(fract(h * 3.7 + dot(cell, vec4(0.13)) + t * 0.01), 0.65, 1.0);
    if (kind < 1.5) return tint * (1.3 + 0.8 * pulse);               // glowing frames
    if (kind < 2.5) {
        // Crystal: dark inside, bright at the edges, like lumen.
        return tint * 0.15 + vec3(0.5, 0.95, 1.0) * rim * 1.4 + tint * dif * 0.3;
    }
    if (kind < 3.5) {
        // The Clifford torus shimmers through the spectrum with its surface's direction.
        vec3 iri = hsv(fract(dot(n, vec3(0.6, 0.3, 0.9)) * 1.5 + t * 0.05), 0.7, 1.0);
        return iri * (0.3 + 0.8 * dif) + iri * rim;
    }
    return vec3(0.9, 0.68, 0.3) * (0.2 + 0.9 * pow(dif, 2.0)) + vec3(1.0, 0.85, 0.6) * rim;   // gold
}

// The great hypercube: glowing edges, each the closest approach of the ray to one of 32 segments.
vec3 hero_glow(vec3 ro, vec3 rd, float tmax) {
    vec3 acc = vec3(0.0);
    for (int i = 0; i < 16; i++) {
        for (int k = 0; k < 4; k++) {
            int j = i ^ (1 << k);
            if (j < i) continue;
            vec3 a = hero[i];
            vec3 ba = hero[j] - a;
            vec3 w0 = ro - a;
            float b = dot(rd, ba), c = dot(ba, ba), dd = dot(rd, w0), e = dot(ba, w0);
            float den = max(c - b * b, 1e-5);
            float s = clamp((e - b * dd) / den, 0.0, 1.0);
            float tt = clamp(dot(a + ba * s - ro, rd), 0.0, tmax);
            s = clamp(dot(ro + rd * tt - a, ba) / c, 0.0, 1.0);
            float dist = length(ro + rd * tt - (a + ba * s));
            float width = 0.05 + tt * 0.004;
            float g = width * width / (width * width + dist * dist);
            vec3 col = k == 0 ? vec3(1.0, 0.6, 0.25) : k == 1 ? vec3(0.4, 0.8, 1.0) : k == 2 ? vec3(1.0, 0.4, 0.85) : vec3(1.0, 0.95, 0.75);
            acc += col * g * (0.9 + 0.5 * sin(s * 12.0 - t * 3.0 + float(i)));
        }
    }
    return acc;
}

// Threads of light straight down through the lattice, the way you are falling.
vec3 threads(vec3 ro, vec3 rd, float tmax) {
    vec3 acc = vec3(0.0);
    const float S = 9.0;
    for (int n = 0; n < 4; n++) {
        // Walk the ray's crossings of a coarse grid of vertical lines (in x and z), nearest first.
        float tt = 4.0 + float(n) * 9.0;
        if (tt > tmax) break;
        vec3 p = ro + rd * tt;
        vec2 cell = floor(p.xz / S);
        vec2 c = (cell + 0.5) * S + (vec2(hash31(vec3(cell, 1.0)), hash31(vec3(cell, 2.0))) - 0.5) * S * 0.6;
        // Closest approach of the ray to the vertical line through c.
        vec2 o = ro.xz - c;
        float a = dot(rd.xz, rd.xz);
        float tc = clamp(-dot(o, rd.xz) / max(a, 1e-4), 0.0, tmax);
        float dist = length(o + rd.xz * tc);
        float y = ro.y + rd.y * tc;
        float flow = 0.6 + 0.4 * sin(y * 0.8 + t * 6.0 + hash31(vec3(cell, 3.0)) * 6.28);
        float w = 0.025 + tc * 0.002;
        acc += vec3(1.0, 0.85, 0.6) * (w * w / (w * w + dist * dist)) * flow * 0.7 * exp(-tc * 0.02);
    }
    return acc;
}

// The fall through the horizon: the outside world drawn into streaks, rushing past.
vec3 tunnel(vec3 d) {
    vec3 axis = vec3(0.0, -1.0, 0.0);
    float along = dot(d, axis);
    vec3 side = normalize(d - axis * along + vec3(1e-4, 0.0, 0.0));
    float ang = atan(side.z, side.x);
    float lane = floor(ang * 40.0);
    float speed = 0.6 + 2.5 * hash31(vec3(lane, 1.0, 0.0));
    float phase = fract(hash31(vec3(lane, 2.0, 0.0)) - t * speed * 0.35 + along * 0.6);
    float streak = smoothstep(0.0, 0.05, phase) * (1.0 - smoothstep(0.05, 0.6, phase)) * (1.0 - abs(fract(ang * 40.0) - 0.5) * 2.0);
    vec3 warm = vec3(1.0, 0.55, 0.2), cold = vec3(0.6, 0.8, 1.0);
    vec3 col = mix(warm, cold, hash31(vec3(lane, 3.0, 0.0))) * streak * 1.6 * (0.3 + 0.7 * abs(along));
    // The ring of the photon sphere ahead, closing in.
    col += vec3(1.0, 0.8, 0.55) * exp(-pow((along - (0.75 + 0.2 * entry)) * 30.0, 2.0)) * 1.4;
    col += vec3(1.0, 0.9, 0.7) * pow(max(along, 0.0), 30.0) * 2.0;
    return col;
}

vec3 safe(vec3 c, float hi) {
    if (any(isnan(c)) || any(isinf(c))) return vec3(0.0);
    return clamp(c, vec3(0.0), vec3(hi));
}

void fragment() {
    vec3 rd = normalize(v_dir);
    // Folding shut: space contracts toward you.
    float squeeze = 1.0 + collapse * collapse * 9.0;
    vec3 ro = eye;

    vec3 col = vec3(0.0);
    float lattice = smoothstep(0.62, 1.0, entry);
    if (lattice > 0.0) {
        int steps = int(mix(60.0, 110.0, quality));
        float far = 70.0;
        float tt = 0.05;
        float mat = 0.0;
        vec4 q = vec4(0.0), cell = vec4(0.0);
        vec3 glow = vec3(0.0);
        bool hit = false;
        for (int i = 0; i < steps; i++) {
            vec3 p = ro + rd * tt;
            float m;
            vec4 qq, cc;
            float d = map(ro + (p - ro) * squeeze, m, qq, cc) / squeeze;
            // Light gathered passing close to the beams and sparks, whatever is hit in the end.
            if (m < 0.5) glow += vec3(1.0, 0.55, 0.22) * 0.0035 / (0.004 + d * d) * exp(-tt * 0.08);
            else if (m < 1.5) glow += vec3(0.7, 0.8, 1.0) * 0.006 / (0.006 + d * d) * exp(-tt * 0.06);
            if (d < 0.0015 * tt + 0.0008) { hit = true; mat = m; q = qq; cell = cc; break; }
            tt += d * 0.85;
            if (tt > far) break;
        }
        vec3 fogc = void_colour(rd);
        vec3 surf = fogc;
        if (hit) surf = shade(ro + (ro + rd * tt - ro) * squeeze, rd, mat, q, cell, tt);
        float fog = 1.0 - exp(-tt * 0.045);
        col = mix(surf, fogc, hit ? fog : 1.0);
        col += glow * 0.2;
        col += hero_glow(ro, rd, hit ? tt : far) * (1.1 + 0.4 * sin(t * 0.37));
        col += threads(ro, rd, hit ? tt : far);
        // Whiter and whiter as it folds.
        col = mix(col, vec3(1.6, 1.5, 1.4), collapse * collapse);
    }
    if (lattice < 1.0) col = mix(tunnel(rd), col, lattice);
    // The flash of crossing: everything goes white, and the lattice comes out of it.
    float flash = exp(-pow((entry - 0.62) * 9.0, 2.0));
    col = mix(col, vec3(1.8, 1.7, 1.55), flash);
    // A vignette, and a faint split of colour toward the edges, like an old lens.
    vec2 uv = SCREEN_UV - 0.5;
    float r2 = dot(uv, uv);
    col *= 1.0 - 0.7 * r2;
    col *= mix(vec3(1.0), vec3(1.05, 0.97, 1.08), smoothstep(0.05, 0.25, r2));
    ALBEDO = safe(col, 3.0);
}
