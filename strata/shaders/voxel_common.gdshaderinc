// Shared by the three voxel surfaces. Light is baked into the vertices by the
// mesher (sky and block level at each corner, plus ambient occlusion); these
// shaders turn those levels into colour and add daylight, biome tint and fog.

global uniform float daylight;      // 0 night .. 1 noon: scales the sky channel
global uniform vec4 sky_tint;       // colour of skylight (warm at dusk, blue at night)
global uniform vec4 torch_tint;     // colour of block light
global uniform vec4 fog_color;
global uniform float fog_start;
global uniform float fog_end;
global uniform float fog_vertical;  // how much height difference counts toward fog distance
global uniform float brightness;    // player setting
global uniform float underwater;    // 1 while the camera is submerged
global uniform vec4 dyn_light_pos;  // a moving light (a rocket's flame, a blast): xyz, and its reach in w (0: none)
global uniform vec4 dyn_light_col;  // its colour times its strength, linear

uniform sampler2DArray blocks : source_color, filter_nearest_mipmap, repeat_enable;

varying vec4 v_light;
varying flat float v_layer;
varying flat int v_flags;
varying vec3 v_tint;
varying vec3 v_world;

const int FLAG_SWAY = 8;
const int FLAG_EMISSIVE = 16;
const int FLAG_TINT = 32;
const int FLAG_LIQUID = 64;

vec3 srgb_to_linear(vec3 c) { return pow(c, vec3(2.2)); }

// Light levels are perceptual; the maths here is linear, so every factor that
// was designed on screen is raised to 2.2 before it multiplies a colour.
float level_to_linear(float l) {
    float perceptual = pow(0.8, (1.0 - clamp(l, 0.0, 1.0)) * 15.0);
    return pow(perceptual, 2.2);
}

float face_shade(int face) {
    // +X -X +Y -Y +Z -Z, then 6 = no face (plants).
    float s = face == 2 ? 1.0 : face == 3 ? 0.55 : face <= 1 ? 0.76 : face <= 5 ? 0.88 : 0.92;
    return pow(s, 2.2);
}

int unpack_flags(vec2 uv2) {
    return int(uv2.y + 0.5) & 255;
}

vec3 unpack_tint(vec2 uv2) {
    int t = (int(uv2.y + 0.5) >> 8) & 32767;
    return srgb_to_linear(vec3(float(t & 31), float((t >> 5) & 31), float((t >> 10) & 31)) / 31.0);
}

vec3 sway(vec3 world, float weight, float amount) {
    float t = TIME;
    float ph = world.x * 0.37 + world.z * 0.29;
    return vec3(sin(t * 1.9 + ph) + sin(t * 0.7 + ph * 1.7) * 0.5, 0.0, cos(t * 1.5 + ph * 1.3) * 0.7) * amount * weight;
}

// The baked light cannot move, so a rocket's flame or a blast lights what is
// near it through this: a single point light, by distance only.
vec3 dyn_light(vec3 p) {
    if (dyn_light_pos.w <= 0.0) return vec3(0.0);
    float f = clamp(1.0 - distance(p, dyn_light_pos.xyz) / dyn_light_pos.w, 0.0, 1.0);
    return dyn_light_col.rgb * f * f;
}

vec3 light_color(vec4 light, int flags) {
    if ((flags & FLAG_EMISSIVE) != 0) return vec3(1.35);
    float sky = level_to_linear(light.r * daylight);
    float blk = level_to_linear(light.g);
    vec3 c = max(sky * sky_tint.rgb, blk * torch_tint.rgb) + dyn_light(v_world);
    c = max(c, vec3(0.0035));
    float ao = pow(mix(0.42, 1.0, light.b), 2.2);
    return c * ao * face_shade(flags & 7) * brightness;
}

float fog_amount(vec3 world, vec3 cam) {
    vec3 d = world - cam;
    float dist = length(d.xz) + abs(d.y) * fog_vertical;
    float f = smoothstep(fog_start, fog_end, dist);
    // Haze lies low: things standing high above the land (a tower, a peak) show through it
    // better, while the edge of the loaded world, down at ground level, stays hidden.
    f *= 1.0 - 0.75 * smoothstep(110.0, 210.0, world.y);
    if (underwater > 0.5) f = max(f, 1.0 - exp(-length(d) * 0.085));
    return f;
}
