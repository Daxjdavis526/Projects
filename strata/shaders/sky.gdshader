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
global uniform float moon_phase;
global uniform float underwater;
global uniform vec4 fog_color;

float hash3(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
}

vec3 stars(vec3 d) {
    // Stars on a fine lattice of directions, each cell holding at most one.
    vec3 g = d * 180.0;
    vec3 cell = floor(g);
    float h = hash3(cell);
    if (h < 0.965) return vec3(0.0);
    vec3 center = cell + 0.5 + (vec3(hash3(cell + 1.3), hash3(cell + 2.7), hash3(cell + 4.1)) - 0.5) * 0.6;
    float dist = length(g - center);
    float size = mix(0.12, 0.3, hash3(cell + 7.7));
    float twinkle = 0.75 + 0.25 * sin(TIME * (1.0 + h * 3.0) + h * 40.0);
    vec3 tint = mix(vec3(0.8, 0.85, 1.0), vec3(1.0, 0.9, 0.75), hash3(cell + 9.1));
    return tint * smoothstep(size, 0.0, dist) * twinkle * 2.2;
}

varying vec3 v_dir;

void vertex() {
    v_dir = (MODEL_MATRIX * vec4(VERTEX, 0.0)).xyz;
}

void fragment() {
    vec3 d = normalize(v_dir);
    float h = d.y;
    vec3 col = mix(sky_horizon.rgb, sky_top.rgb, smoothstep(-0.02, 0.55, h));
    // Below the horizon: the same haze, a little darker.
    col = mix(col, sky_horizon.rgb * 0.78, smoothstep(0.0, -0.25, h));

    // Glow around the sun, strongest when it is low.
    float sd = dot(d, sun_dir);
    float low = 1.0 - smoothstep(0.0, 0.5, abs(sun_dir.y));
    col += sun_glow.rgb * pow(max(sd, 0.0), 6.0) * (0.25 + 0.6 * low) * smoothstep(-0.35, 0.05, sun_dir.y);
    col += sun_glow.rgb * pow(max(sd, 0.0), 64.0) * 0.6;

    // The sun: a hot disc with a soft rim.
    float disc = smoothstep(0.99955, 0.99975, sd);
    col = mix(col, vec3(1.9, 1.75, 1.45), disc);

    // Stars, hidden by daylight and the moon's disc.
    vec3 st = stars(d) * star_alpha * smoothstep(-0.05, 0.15, h);

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
            col = mix(col, vec3(0.95, 0.95, 1.0) * crater * (0.18 + 0.9 * lit), smoothstep(1.0, 0.92, r2));
            st = vec3(0.0);
        }
    }
    col += pow(max(md, 0.0), 300.0) * vec3(0.25, 0.28, 0.35) * star_alpha;
    ALBEDO = underwater > 0.5 ? fog_color.rgb : col + st;
}
