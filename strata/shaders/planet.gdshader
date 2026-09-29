shader_type spatial;
render_mode unshaded, cull_disabled, depth_draw_opaque, fog_disabled, shadows_disabled;

#include "res://shaders/voxel_common.gdshaderinc"

// The far terrain (FarTerrain.cs): the world generator's ground, sampled
// coarsely, bent onto the round planet round the point under the camera, lit
// by the sky, hazed by the air along the line of sight, with the planet's own
// clouds painted on from high up. Holes are cut wherever finer detail is
// drawn: inside the next finer ring, and over every loaded block column.

global uniform vec3 sun_dir;
global uniform float cloud_cover;
global uniform vec4 cloud_shade;

uniform vec4 inner_rect;                        // centre x, z; half-size; 1 when there is a finer ring inside
uniform vec4 mask_rect;                         // corner x, z; size; 1 when the mask is in use
uniform sampler2D loaded_mask : filter_nearest, repeat_disable;

varying vec3 v_flat;
varying vec3 v_col;
varying vec3 v_nrm;

// A point on the flat map, where it lies on the planet: at arc distance s
// from the point under the camera it has turned s/R round the planet's
// centre, which lies straight below the camera one radius under the sea.
vec3 on_planet(vec3 p, vec3 cam) {
    vec2 d = p.xz - cam.xz;
    float s = length(d);
    if (s < 0.01) return p;
    float th = s / planet_radius;
    vec2 dir = d / s;
    float r = planet_radius + (p.y - SEA_LEVEL);
    return vec3(cam.x + dir.x * sin(th) * r, SEA_LEVEL - planet_radius + cos(th) * r, cam.z + dir.y * sin(th) * r);
}

float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
// Value noise that repeats every `period` cells, so the clouds, like the ground, come round
// again after a lap of the planet (CLOUD_CELLS of them fit exactly round it).
float vnoise_lap(vec2 p, float period) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    vec2 j = mod(i + 1.0, period);
    i = mod(i, period);
    return mix(mix(hash2(i), hash2(vec2(j.x, i.y)), f.x), mix(hash2(vec2(i.x, j.y)), hash2(j), f.x), f.y);
}
const float CLOUD_CELLS = 48.0;                  // cloud cells round the planet
float cloud_field(vec2 q) {
    return vnoise_lap(q, CLOUD_CELLS) * 0.55 + vnoise_lap(q * 2.0 + 7.0, CLOUD_CELLS * 2.0) * 0.3
         + vnoise_lap(q * 6.0 - 3.0, CLOUD_CELLS * 6.0) * 0.15;
}

void vertex() {
    vec3 w = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
    v_flat = w;
    vec3 b = on_planet(w, CAMERA_POSITION_WORLD);
    v_world = b;
    POSITION = PROJECTION_MATRIX * VIEW_MATRIX * vec4(b, 1.0);
    v_col = COLOR.rgb;
    v_nrm = NORMAL;
}

void fragment() {
    if (inner_rect.w > 0.5 && abs(v_flat.x - inner_rect.x) < inner_rect.z && abs(v_flat.z - inner_rect.y) < inner_rect.z) discard;
    if (mask_rect.w > 0.5) {
        vec2 m = (v_flat.xz - mask_rect.xy) / mask_rect.z;
        if (m.x >= 0.0 && m.y >= 0.0 && m.x < 1.0 && m.y < 1.0 && texture(loaded_mask, m).r > 0.5) discard;
    }
    vec3 base = srgb_to_linear(v_col);
    vec3 n = normalize(v_nrm);
    // Lit like a top face out under the open sky, with a little relief from the slope toward the sun.
    vec3 col = base * light_color(vec4(1.0, 0.0, 1.0, 1.0), 2);
    float slope = mix(0.78, 1.0, clamp(n.y, 0.0, 1.0));
    float sunward = mix(0.9, 1.1, clamp(dot(n, normalize(sun_dir)) * 0.5 + 0.5, 0.0, 1.0));
    col *= slope * sunward;

    // The planet's clouds, as seen from well above them: soft drifting fields casting a little
    // shadow. Painted on the ground they would pass for snow from low down, so they only come
    // in once the camera has climbed well clear of the cloud deck.
    float paint = fog_lift * smoothstep(1800.0, 5000.0, CAMERA_POSITION_WORLD.y - SEA_LEVEL);
    if (paint > 0.01) {
        float cell = 6.2831853 * planet_radius / CLOUD_CELLS;
        vec2 q = v_flat.xz / cell + vec2(0.004, 0.0015) * TIME;
        float cover = 1.0 - cloud_cover;
        float cl = smoothstep(cover - 0.04, cover + 0.22, cloud_field(q)) * paint;
        float day = smoothstep(-0.14, 0.28, sun_dir.y);
        vec3 lit = mix(vec3(0.03, 0.033, 0.045), vec3(1.0) * clamp(daylight * 1.1, 0.0, 1.0), day) * cloud_shade.rgb;
        float shade = smoothstep(cover - 0.05, cover + 0.2, cloud_field(q + vec2(0.03, 0.02)));
        col *= 1.0 - 0.22 * shade * paint;
        col = mix(col, lit, cl * 0.75);
    }
    ALBEDO = safe_color(mix(col, fog_color.rgb, fog_amount(v_world, CAMERA_POSITION_WORLD)), 1.0);
}
