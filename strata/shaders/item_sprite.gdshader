shader_type spatial;
render_mode unshaded, fog_disabled, cull_back, depth_draw_opaque;

#include "res://shaders/voxel_common.gdshaderinc"

// Flat items extruded to a sliver of thickness. COLOR.a is the face shade.
uniform sampler2D sprite : source_color, filter_nearest;
// Ordinary material parameters, one material per dropped or held item: see entity.gdshader.
uniform vec2 light_level = vec2(1.0, 0.0);
uniform float flash = 0.0;
uniform bool viewmodel = false;

varying float v_shade;

void vertex() {
    v_shade = COLOR.a;
    v_world = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
}

void fragment() {
    vec4 tex = texture(sprite, UV);
    if (tex.a < 0.5) discard;
    vec3 col = tex.rgb * light_color(vec4(clamp(light_level, 0.0, 1.0), 1.0, 1.0), 2) * pow(v_shade, 2.2);
    col = mix(col, vec3(1.0, 0.2, 0.15), clamp(flash, 0.0, 1.0) * 0.6);
    col = any(isnan(col)) ? vec3(0.0) : clamp(col, 0.0, 1.0);        // never sets off the bloom: see entity.gdshader
    ALBEDO = viewmodel ? col : mix(col, fog_color.rgb, fog_amount(v_world, CAMERA_POSITION_WORLD));
}
