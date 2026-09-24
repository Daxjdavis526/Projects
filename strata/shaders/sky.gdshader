shader_type spatial;
render_mode unshaded, fog_disabled, cull_front, depth_draw_never, shadows_disabled;

// Drawn on a large sphere that follows the camera rather than as an engine sky,
// so no reflection probe is rebuilt every time the light changes.

// Every colour here comes from the day cycle in C#, which also sets the fog to
// the same horizon colour, so distant terrain fades into the sky exactly.
global uniform vec3 sun_dir;
global uniform vec3 moon_dir;
global uniform vec4 sky_top;
global uniform vec4 sky_horizon;
global uniform vec4 sun_glow;
global uniform float star_alpha;
global uniform float sky_spin;       // how far the heavens have turned, radians: the stars wheel with the sun and moon
global uniform float moon_phase;
global uniform float underwater;
global uniform vec4 fog_color;

float hash3(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
}

// Smooth value noise over directions, for the Milky Way's clouds and dust.
float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash3(i);
    float b = hash3(i + vec3(1.0, 0.0, 0.0));
    float c = hash3(i + vec3(0.0, 1.0, 0.0));
    float d = hash3(i + vec3(1.0, 1.0, 0.0));
    float e = hash3(i + vec3(0.0, 0.0, 1.0));
    float g = hash3(i + vec3(1.0, 0.0, 1.0));
    float h = hash3(i + vec3(0.0, 1.0, 1.0));
    float k = hash3(i + vec3(1.0, 1.0, 1.0));
    return mix(mix(mix(a, b, f.x), mix(c, d, f.x), f.y), mix(mix(e, g, f.x), mix(h, k, f.x), f.y), f.z);
}

float fbm(vec3 p) {
    float s = 0.0;
    float a = 0.5;
    for (int o = 0; o < 4; o++) {
        s += a * vnoise(p);
        p = p * 2.07 + vec3(3.1, 7.7, 1.3);
        a *= 0.5;
    }
    return s / 0.9375;
}

// One layer of stars. Directions are cut into cells 1/scale radians across
// and a star sits in `density` of them. `pix` is the size of a pixel in
// radians: no star is drawn smaller than about a pixel and a half, since a
// smaller one would wink in and out as the view turns, and one drawn wider
// than it is gets fainter to match, so turning or zooming never changes how
// bright the sky looks.
vec3 star_layer(vec3 d, float scale, float density, float peak, float seed, float pix) {
    vec3 g = d * scale;
    vec3 cell = floor(g);
    if (hash3(cell + seed) > density) return vec3(0.0);
    vec3 jitter = vec3(hash3(cell + seed + 1.3), hash3(cell + seed + 2.7), hash3(cell + seed + 4.1));
    vec3 c = normalize(cell + 0.3 + 0.4 * jitter) * scale;        // the star's place on the sky
    vec3 local = c - cell;
    // Only a star whose whole disc fits in its cell is drawn; the neighbours would cut it off.
    if (any(lessThan(local, vec3(0.3))) || any(greaterThan(local, vec3(0.7)))) return vec3(0.0);
    float m = hash3(cell + seed + 7.3);
    float r0 = 0.05 + 0.12 * m * m;                                    // brighter stars are a little larger
    float r = max(r0, pix * scale * 1.5);
    float b = peak * (0.18 + 0.82 * m * m * m) * (r0 * r0) / (r * r);  // most faint, a few bright
    float t = hash3(cell + seed + 9.1);
    vec3 tint = t < 0.15 ? vec3(0.72, 0.8, 1.0)                     // hot blue-white
        : t < 0.75 ? vec3(1.0, 0.97, 0.94)                            // white
        : t < 0.95 ? vec3(1.0, 0.88, 0.7)                             // yellow
        : vec3(1.0, 0.68, 0.5);                                       // orange
    // A slow, gentle shimmer; the air makes stars twinkle, it does not switch them on and off.
    float tw = 1.0 + 0.12 * sin(TIME * (0.9 + 1.7 * m) + t * 50.0) * sin(TIME * 0.31 + m * 13.0);
    float dist = length(g - c);
    return tint * b * tw * (1.0 - smoothstep(0.0, r, dist));
}

// Now and then a shooting star: a thin streak, brightest at its head, gone in under a second.
vec3 meteor(vec3 d, float pix) {
    const float SLOT = 12.0;
    float slot = floor(TIME / SLOT);
    if (hash3(vec3(slot, 3.7, 1.1)) > 0.3) return vec3(0.0);        // about one every forty seconds
    float age = (TIME - slot * SLOT - hash3(vec3(slot, 5.1, 2.9)) * (SLOT - 1.0)) / 0.8;
    if (age < 0.0 || age > 1.0) return vec3(0.0);
    float az = hash3(vec3(slot, 8.3, 4.4)) * 6.2832;
    float el = 0.45 + 0.6 * hash3(vec3(slot, 1.9, 6.6));
    vec3 p0 = vec3(cos(az) * cos(el), sin(el), sin(az) * cos(el));
    vec3 side = normalize(cross(p0, vec3(0.0, 1.0, 0.0)));
    vec3 down = cross(side, p0);
    float turn = (hash3(vec3(slot, 2.2, 9.5)) - 0.5) * 1.6;
    vec3 dir = normalize(side * cos(turn) + down * (0.35 + 0.5 * abs(sin(turn))));   // mostly sideways, falling a little
    vec3 head = normalize(p0 + dir * 0.32 * age);
    vec3 tail = normalize(p0 + dir * 0.32 * max(age - 0.3, 0.0));
    vec3 ab = head - tail;
    float s = clamp(dot(d - tail, ab) / max(dot(ab, ab), 1e-8), 0.0, 1.0);
    float dist = length(d - (tail + ab * s));
    float width = max(pix * 1.2, 0.0007);
    float line = 1.0 - smoothstep(0.0, width, dist);
    return vec3(0.92, 0.95, 1.0) * line * s * s * sin(age * 3.1416) * 1.4;
}

varying vec3 v_dir;

void vertex() {
    v_dir = (MODEL_MATRIX * vec4(VERTEX, 0.0)).xyz;
}

void fragment() {
    vec3 d = normalize(v_dir);
    float pix = max(length(fwidth(d)), 1e-5);   // radians per pixel, taken before anything branches
    float h = d.y;
    vec3 col = mix(sky_horizon.rgb, sky_top.rgb, smoothstep(-0.02, 0.55, h));
    // Below the horizon: the same haze, a little darker.
    col = mix(col, sky_horizon.rgb * 0.78, 1.0 - smoothstep(-0.25, 0.0, h));

    // Glow around the sun, strongest when it is low.
    float sd = dot(d, sun_dir);
    float low = 1.0 - smoothstep(0.0, 0.5, abs(sun_dir.y));
    col += sun_glow.rgb * pow(max(sd, 0.0), 6.0) * (0.25 + 0.6 * low) * smoothstep(-0.35, 0.05, sun_dir.y);
    col += sun_glow.rgb * pow(max(sd, 0.0), 64.0) * 0.6;

    // The sun: a hot disc with a soft rim.
    float disc = smoothstep(0.99955, 0.99975, sd);
    col = mix(col, vec3(1.9, 1.75, 1.45), disc);

    // The night sky, in its own frame, turning with the sun and moon.
    vec3 night = vec3(0.0);
    if (star_alpha > 0.001) {
        float cs = cos(sky_spin), sn = sin(sky_spin);
        vec3 s = vec3(cs * d.x + sn * d.y, -sn * d.x + cs * d.y, d.z);
        // Stars dim and redden toward the horizon, through more air.
        float air = smoothstep(-0.03, 0.35, h);
        vec3 redden = mix(vec3(1.0, 0.72, 0.55), vec3(1.0), air);

        // The Milky Way: a broad band of faint light round a great circle, broken
        // into clouds, with a dark rift of dust along the middle.
        // Its pole is set so that around midnight the band arches right overhead.
        vec3 pole = normalize(vec3(0.0, 0.5, 0.87));
        float lat = dot(s, pole);
        float band = exp(-lat * lat / 0.05);
        float core = exp(-lat * lat / 0.008);
        float clouds = fbm(s * 4.5);
        float grain = fbm(s * 15.0 + 5.0);
        float rift = smoothstep(0.48, 0.7, fbm(s * 6.5 + 11.0)) * exp(-(lat - 0.02) * (lat - 0.02) / 0.0025);
        float glow = band * (0.2 + 0.8 * clouds * clouds) * (0.65 + 0.35 * grain) * (1.0 - 0.85 * rift) + 0.45 * core * clouds;
        vec3 mw = mix(vec3(0.62, 0.7, 1.0), vec3(1.0, 0.9, 0.76), clamp(core * clouds * 1.4, 0.0, 1.0));
        night += mw * glow * 0.065;

        // Three layers of stars: a dust of faint ones, thickest along the Milky Way, then common ones, then a few bright.
        night += star_layer(s, 360.0, 0.2 + 0.8 * band, 1.2, 0.0, pix);
        night += star_layer(s, 150.0, 0.25, 0.7, 17.0, pix);
        night += star_layer(s, 55.0, 0.35, 2.0, 41.0, pix);
        night *= redden * air;
        night += meteor(d, pix) * smoothstep(0.05, 0.25, h);
        night *= star_alpha;
    }

    // The moon, with a terminator from its phase and a little surface texture.
    float md = dot(d, moon_dir);
    if (md > 0.9993) {
        vec3 right = normalize(cross(moon_dir, vec3(0.0, 1.0, 0.0)));
        vec3 up = cross(right, moon_dir);
        vec2 q = vec2(dot(d, right), dot(d, up)) / 0.0374;
        float r2 = dot(q, q);
        if (r2 < 1.0) {
            float z = sqrt(1.0 - r2);
            float lit = smoothstep(-0.08, 0.08, q.x * cos(moon_phase * 6.2832) + z * sin(moon_phase * 6.2832 - 1.5708) * -1.0);
            float crater = 0.85 + 0.15 * sin(q.x * 9.0 + 1.3) * sin(q.y * 7.0 - 0.4);
            float inside = 1.0 - smoothstep(0.92, 1.0, r2);
            col = mix(col, vec3(0.95, 0.95, 1.0) * crater * (0.18 + 0.9 * lit), inside);
            night *= 1.0 - inside;
        }
    }
    col += pow(max(md, 0.0), 300.0) * vec3(0.25, 0.28, 0.35) * star_alpha;
    ALBEDO = underwater > 0.5 ? fog_color.rgb : col + night;
}
