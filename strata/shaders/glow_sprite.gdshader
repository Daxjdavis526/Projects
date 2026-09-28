shader_type spatial;
render_mode unshaded, blend_add, cull_disabled, depth_draw_never, fog_disabled, shadows_disabled;

// A soft round glow that always faces the camera: the light of a flame or a
// blast seen through the air around it. Depth-tested like anything else, so
// a hill or the rocket's own body hides it.

uniform vec4 color : source_color = vec4(1.0, 0.6, 0.25, 1.0);
uniform float strength = 0.0;

void vertex() {
    MODELVIEW_MATRIX = VIEW_MATRIX * mat4(INV_VIEW_MATRIX[0], INV_VIEW_MATRIX[1], INV_VIEW_MATRIX[2], MODEL_MATRIX[3]);
    MODELVIEW_MATRIX = MODELVIEW_MATRIX * mat4(vec4(length(MODEL_MATRIX[0].xyz), 0, 0, 0), vec4(0, length(MODEL_MATRIX[1].xyz), 0, 0), vec4(0, 0, length(MODEL_MATRIX[2].xyz), 0), vec4(0, 0, 0, 1));
}

void fragment() {
    vec2 d = UV * 2.0 - 1.0;
    float r = dot(d, d);
    float a = exp(-r * 5.0) * 0.8 + exp(-r * 40.0) * 0.6;
    ALBEDO = color.rgb * a * strength;
}
