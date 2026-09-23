shader_type spatial;
render_mode unshaded, fog_disabled, cull_disabled, depth_draw_opaque;

#include "res://shaders/voxel_common.gdshaderinc"

void vertex() {
    v_layer = UV2.x;
    v_flags = unpack_flags(UV2);
    v_tint = unpack_tint(UV2);
    v_light = COLOR;
    vec3 w = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
    if ((v_flags & FLAG_SWAY) != 0) {
        bool plant = (v_flags & 7) == 6;
        // Plants bend from the root; leaves drift as a whole.
        vec3 o = plant ? sway(w, 1.0 - UV.y, 0.07) : sway(w, 1.0, 0.025);
        VERTEX += o;
        w += o;
    }
    v_world = w;
}

void fragment() {
    vec4 tex = texture(blocks, vec3(UV, v_layer));
    vec3 col = tex.rgb;
    if ((v_flags & FLAG_TINT) != 0) col *= v_tint * 1.8;
    col *= light_color(v_light, v_flags);
    ALBEDO = mix(col, fog_color.rgb, fog_amount(v_world, CAMERA_POSITION_WORLD));
    ALPHA = tex.a;
    ALPHA_SCISSOR_THRESHOLD = 0.5;
}
