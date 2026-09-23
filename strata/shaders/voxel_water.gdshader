shader_type spatial;
render_mode unshaded, fog_disabled, cull_disabled, blend_mix, depth_draw_never;

#include "res://shaders/voxel_common.gdshaderinc"

varying float v_top;

void vertex() {
    v_layer = UV2.x;
    v_flags = unpack_flags(UV2);
    v_tint = unpack_tint(UV2);
    v_light = COLOR;
    vec3 w = (MODEL_MATRIX * vec4(VERTEX, 1.0)).xyz;
    v_top = (v_flags & 7) == 2 ? 1.0 : 0.0;
    // No vertex waves: greedy quads share edges with T-junctions, and moving
    // vertices would open cracks along them. The surface moves in the texture.
    v_world = w;
}

void fragment() {
    vec2 uv = UV;
    uv += vec2(sin(TIME * 0.4 + UV.y * 3.0), cos(TIME * 0.33 + UV.x * 3.0)) * 0.03 + vec2(TIME * 0.015, TIME * 0.01);
    vec4 tex = texture(blocks, vec3(uv, v_layer));
    vec3 col = tex.rgb * light_color(v_light, v_flags);
    vec3 view = normalize(v_world - CAMERA_POSITION_WORLD);
    // Grazing angles reflect more sky, looking straight down shows the bed.
    float facing = v_top > 0.5 ? abs(view.y) : 0.6;
    float alpha = mix(0.92, 0.62, facing);
    vec3 skyc = fog_color.rgb * (0.35 + 0.65 * daylight);
    col = mix(col, skyc * 0.9, (1.0 - facing) * 0.35 * v_top);
    if (underwater > 0.5) alpha = 0.55;
    ALBEDO = mix(col, fog_color.rgb, fog_amount(v_world, CAMERA_POSITION_WORLD));
    ALPHA = alpha;
}
