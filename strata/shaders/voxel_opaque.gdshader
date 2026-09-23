shader_type spatial;
render_mode unshaded, fog_disabled, cull_back, depth_draw_opaque;

#include "res://shaders/voxel_common.gdshaderinc"

void vertex() {
    v_layer = UV2.x;
    v_flags = unpack_flags(UV2);
    v_tint = unpack_tint(UV2);
    v_light = COLOR;
    v_world = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
    vec2 uv = UV;
    if ((v_flags & FLAG_LIQUID) != 0) uv += vec2(TIME * 0.02, TIME * 0.013);   // lava creeps
    vec4 tex = texture(blocks, vec3(uv, v_layer));
    vec3 col = tex.rgb;
    if ((v_flags & FLAG_TINT) != 0) col = mix(col, col * v_tint * 1.8, 1.0 - tex.a);
    col *= light_color(v_light, v_flags);
    ALBEDO = mix(col, fog_color.rgb, fog_amount(v_world, CAMERA_POSITION_WORLD));
}
