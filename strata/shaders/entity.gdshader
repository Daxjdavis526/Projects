shader_type spatial;
render_mode unshaded, fog_disabled, cull_back, depth_draw_opaque;

#include "res://shaders/voxel_common.gdshaderinc"

// Creatures: vertex colours painted per box face, lit by the voxel light at
// the creature, flashed red when hurt.
//
// The light, flash and glow are ordinary material parameters, one material per
// creature, not per-instance ("instance uniform") parameters. Instance
// parameters reached the GPU wrong on some drivers: creatures came out black
// under one and as glowing white blobs under another. They are clamped here
// all the same, so a bad value can never make anything blaze.
uniform sampler2D skin : source_color, filter_nearest, repeat_enable;
uniform bool use_skin = false;
uniform vec4 tint : source_color = vec4(1.0);
uniform vec2 light_level = vec2(1.0, 0.0);
uniform float flash = 0.0;
uniform float glow = 0.0;
uniform float self_lit = 0.0;    // eyes and other parts that shine in the dark (up close only)

void vertex() {
    v_world = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
    vec3 base = COLOR.rgb;
    if (use_skin) base *= texture(skin, UV).rgb;
    // Vertex colours are sRGB; the tint uniform is already linear (source_color).
    vec3 col = srgb_to_linear(base) * tint.rgb * light_color(vec4(clamp(light_level, 0.0, 1.0), 1.0, 1.0), 2) * pow(COLOR.a, 2.2);
    // Eyes shine only within a few blocks: further off they were two stray pixels
    // wandering the dark, and read as blinking lights rather than as a creature.
    float near = 1.0 - smoothstep(8.0, 14.0, distance(v_world, CAMERA_POSITION_WORLD));
    col = mix(col, srgb_to_linear(base) * tint.rgb, clamp(max(glow, self_lit * near), 0.0, 1.0));
    col = mix(col, vec3(1.0, 0.12, 0.08), clamp(flash, 0.0, 1.0) * 0.65);
    col = mix(col, fog_color.rgb, fog_amount(v_world, CAMERA_POSITION_WORLD));
    // Never brighter than white and never not-a-number. The bloom picks out
    // anything brighter than white, and turns a not-a-number pixel into a
    // blaze of white around a black dot: exactly the glowing blobs with dark
    // eyes that were seen drifting over meadows. Nothing on a creature may
    // set it off; eyes shine by being full-bright, not by blooming.
    ALBEDO = any(isnan(col)) ? vec3(0.0) : clamp(col, 0.0, 1.0);
}
