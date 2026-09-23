shader_type spatial;
render_mode unshaded, fog_disabled, cull_back, depth_draw_opaque;

#include "res://shaders/voxel_common.gdshaderinc"

// Creatures: vertex colours painted per box face, lit by the voxel light at
// the creature, flashed red when hurt.
uniform sampler2D skin : source_color, filter_nearest, repeat_enable;
uniform bool use_skin = false;
uniform vec4 tint : source_color = vec4(1.0);
instance uniform vec2 light_level = vec2(1.0, 0.0);
instance uniform float flash = 0.0;
instance uniform float glow = 0.0;
uniform float self_lit = 0.0;    // eyes and other parts that shine in the dark (up close only)

void vertex() {
    v_world = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
    vec3 base = COLOR.rgb;
    if (use_skin) base *= texture(skin, UV).rgb;
    // Vertex colours are sRGB; the tint uniform is already linear (source_color).
    vec3 col = srgb_to_linear(base) * tint.rgb * light_color(vec4(light_level, 1.0, 1.0), 2) * pow(COLOR.a, 2.2);
    // Eyes shine only within a few blocks: further off they were two stray pixels
    // wandering the dark, and read as blinking lights rather than as a creature.
    float near = 1.0 - smoothstep(8.0, 14.0, distance(v_world, CAMERA_POSITION_WORLD));
    col = mix(col, srgb_to_linear(base) * tint.rgb * 1.4, max(glow, self_lit * near));
    col = mix(col, vec3(1.0, 0.12, 0.08), flash * 0.65);
    ALBEDO = mix(col, fog_color.rgb, fog_amount(v_world, CAMERA_POSITION_WORLD));
}
