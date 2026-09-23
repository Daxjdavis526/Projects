shader_type spatial;
render_mode unshaded, fog_disabled, cull_disabled, depth_draw_never, blend_mix, shadows_disabled;

// A flat deck of blocky clouds: value noise sampled on a coarse grid so each
// cloud is built from square cells, drifting with the wind.
global uniform float daylight;
global uniform vec4 sky_horizon;
global uniform vec4 sky_top;
global uniform float cloud_cover;
global uniform vec4 cloud_shade;
global uniform float underwater;

uniform vec2 wind = vec2(1.6, 0.6);
uniform float cell = 12.0;

varying vec3 v_world;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}

void vertex() {
    v_world = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
    vec2 p = v_world.xz + wind * TIME;
    vec2 c = floor(p / cell);
    float n = vnoise(c * 0.23) * 0.65 + vnoise(c * 0.61 + 17.0) * 0.35;
    float cover = 1.0 - cloud_cover;
    if (n < cover) discard;
    float dist = length(v_world.xz - CAMERA_POSITION_WORLD.xz);
    float fade = 1.0 - smoothstep(260.0, 460.0, dist);
    // Cloud edges catch a little less light than their middles.
    float edge = smoothstep(cover, cover + 0.12, n);
    vec3 lit = mix(vec3(0.06, 0.07, 0.1), vec3(1.0), clamp(daylight * 1.1, 0.0, 1.0));
    vec3 col = mix(sky_horizon.rgb, lit * cloud_shade.rgb, 0.85) * (0.86 + 0.14 * edge);
    ALBEDO = col;
    ALPHA = 0.82 * fade * (underwater > 0.5 ? 0.0 : 1.0);
}
