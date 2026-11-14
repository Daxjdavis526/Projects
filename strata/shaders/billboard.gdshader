shader_type spatial;
render_mode unshaded, fog_disabled, cull_back, shadows_disabled;

// The photograph on the launch pad's billboard. Lit the way the voxel shaders
// light a block face open to the sky, never darker than its floodlights make
// it at night, and fogged with the terrain round it (see voxel_common.gdshaderinc).

global uniform float daylight;
global uniform vec4 sky_tint;
global uniform vec4 fog_color;
global uniform float fog_start;
global uniform float fog_end;
global uniform float fog_vertical;
global uniform float brightness;
global uniform float underwater;

uniform sampler2D photo : source_color, filter_nearest, repeat_disable;

varying vec3 v_world;

void vertex() {
    v_world = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

float fog_amount(vec3 world, vec3 cam) {
    vec3 d = world - cam;
    float dist = length(d.xz) + abs(d.y) * fog_vertical;
    float f = smoothstep(fog_start, fog_end, dist);
    f *= 1.0 - 0.75 * smoothstep(110.0, 210.0, world.y);
    if (underwater > 0.5) f = max(f, 1.0 - exp(-length(d) * 0.085));
    return f;
}

void fragment() {
    vec3 tex = texture(photo, UV).rgb;
    float sky = pow(pow(0.8, (1.0 - clamp(daylight, 0.0, 1.0)) * 15.0), 2.2);
    vec3 light = max(sky * sky_tint.rgb, vec3(0.5, 0.45, 0.38)) * pow(0.88, 2.2) * brightness;
    vec3 col = mix(min(tex * light, vec3(1.0)), fog_color.rgb, fog_amount(v_world, CAMERA_POSITION_WORLD));
    if (any(isnan(col)) || any(isinf(col))) col = vec3(0.0);
    ALBEDO = clamp(col, vec3(0.0), vec3(1.0));
}
