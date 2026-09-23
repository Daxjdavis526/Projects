shader_type spatial;
render_mode unshaded, fog_disabled, cull_back, depth_draw_opaque;

#include "res://shaders/voxel_common.gdshaderinc"

// Blocks held or dropped. COLOR.rgb carries a biome tint and COLOR.a the face
// shade; UV2 is (texture layer, tint mode). The light comes per instance from
// the voxel light where the thing is.
instance uniform vec2 light_level = vec2(1.0, 0.0);
instance uniform float flash = 0.0;
uniform bool viewmodel = false;

varying flat float v_mode;
varying float v_shade;
varying vec3 v_tint_c;

void vertex() {
    v_layer = UV2.x;
    v_mode = UV2.y;
    v_shade = COLOR.a;
    v_tint_c = srgb_to_linear(COLOR.rgb);
    v_world = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
    vec4 tex = texture(blocks, vec3(UV, v_layer));
    vec3 col = tex.rgb;
    if (v_mode > 0.5 && v_mode < 1.5) col = mix(col, col * v_tint_c * 2.1, 1.0 - tex.a);
    else if (v_mode > 1.5) col *= v_tint_c * 2.1;
    if (v_mode > 1.5 && tex.a < 0.5) discard;
    col *= light_color(vec4(light_level, 1.0, 1.0), 2) * pow(v_shade, 2.2);
    col = mix(col, vec3(1.0, 0.2, 0.15), flash * 0.6);
    ALBEDO = viewmodel ? col : mix(col, fog_color.rgb, fog_amount(v_world, CAMERA_POSITION_WORLD));
}
