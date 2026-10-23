// Sand: the standard lit material, with the surface detail real dunes have.
//
// - Wind ripples, two scales, crests across the wind, carried by the normal
//   so they catch the low sun. They fade on slip faces (avalanching sand is
//   smooth), on rock, and with distance before they could shimmer.
// - Colour: mottling at three scales, lighter crests and darker troughs
//   (curvature baked per vertex), and a red cast in the troughs.
// - Rock: bumpy, banded, no ripples.
// - Dune shadows beyond the reach of the shadow map, from the per-vertex sun
//   visibility baked when the tile was built (vertex colour alpha).
//
// Noise runs in true world coordinates. The floating origin is split on the
// CPU into exact integer and fractional parts per frequency (`n0..n3`,
// `ripple`), so the pattern never jumps when the origin moves.

#import bevy_pbr::{
    pbr_fragment::pbr_input_from_standard_material,
    forward_io::{VertexOutput, FragmentOutput},
    pbr_functions::{apply_pbr_lighting, main_pass_post_lighting_processing},
    mesh_view_bindings::view,
}

struct SandParams {
    // xyz: toward the sun. w: direct-to-ambient ratio, for baked shadow.
    sun: vec4<f32>,
    // xy: wind direction (x, z). zw: across it.
    wind: vec4<f32>,
    // x, y: origin phase along the wind for the two ripple scales.
    ripple: vec4<f32>,
    // Per noise frequency: fract(ox f), fract(oz f), floor(ox f), floor(oz f).
    n0: vec4<f32>,
    n1: vec4<f32>,
    n2: vec4<f32>,
    n3: vec4<f32>,
    // x..y: distance over which baked shadow fades in past the shadow map.
    fade: vec4<f32>,
}

@group(#{MATERIAL_BIND_GROUP}) @binding(100) var<uniform> sand: SandParams;

const F0: f32 = 0.476;   // 1 / 2.1 m
const F1: f32 = 0.0526;  // 1 / 19 m
const F2: f32 = 0.00435; // 1 / 230 m
const F3: f32 = 0.303;   // 1 / 3.3 m
const L1: f32 = 0.32;    // small ripples, metres
const L2: f32 = 1.9;     // large ripples
const TAU: f32 = 6.2831853;

fn hash(i: vec2<i32>) -> f32 {
    var h = u32(i.x) * 374761393u + u32(i.y) * 668265263u;
    h = (h ^ (h >> 13u)) * 1274126177u;
    h = h ^ (h >> 16u);
    return f32(h & 0xffffffu) / 16777216.0;
}

// Value noise at one of the four frequencies, in world space.
fn vnoise(xz: vec2<f32>, f: f32, o: vec4<f32>) -> f32 {
    let q = xz * f + o.xy;
    let fl = floor(q);
    let fr = q - fl;
    let base = vec2<i32>(fl) + vec2<i32>(o.zw);
    let u = fr * fr * (3.0 - 2.0 * fr);
    let a = hash(base);
    let b = hash(base + vec2<i32>(1, 0));
    let c = hash(base + vec2<i32>(0, 1));
    let d = hash(base + vec2<i32>(1, 1));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Gradient of the noise, by differences, in "per metre".
fn vgrad(xz: vec2<f32>, f: f32, o: vec4<f32>) -> vec2<f32> {
    let e = 0.35 / f;
    let c = vnoise(xz, f, o);
    return vec2<f32>(vnoise(xz + vec2<f32>(e, 0.0), f, o) - c, vnoise(xz + vec2<f32>(0.0, e), f, o) - c) / e;
}

// Ripple slope along the wind for phase t: a steep lee side and a long
// stoss side, like real ripples. Returns d(height)/d(phase), height in units
// of amplitude.
fn ripple_slope(t: f32) -> f32 {
    let x = t * TAU;
    return TAU * (cos(x) + 0.35 * cos(2.0 * x) * 2.0);
}

fn ripple_height(t: f32) -> f32 {
    let x = t * TAU;
    return sin(x) + 0.35 * sin(2.0 * x);
}

@fragment
fn fragment(in: VertexOutput, @builtin(front_facing) is_front: bool) -> FragmentOutput {
    var pbr_input = pbr_input_from_standard_material(in, is_front);

    let xz = in.world_position.xz;
    let dist = length(view.world_position.xyz - in.world_position.xyz);
    var n = normalize(pbr_input.world_normal);

#ifdef VERTEX_COLORS
    let sun_vis = in.color.a;
#else
    let sun_vis = 1.0;
#endif
#ifdef VERTEX_UVS_A
    let rock = clamp(in.uv.x, 0.0, 1.0);
    let curv = in.uv.y;
#else
    let rock = 0.0;
    let curv = 0.0;
#endif
    pbr_input.material.base_color.a = 1.0;

    let wind = sand.wind.xy;
    let steep = 1.0 - n.y;

    // --- ripples -----------------------------------------------------------
    let warp = (vnoise(xz, F3, sand.n3) - 0.5) * 1.4 + (vnoise(xz, F1, sand.n1) - 0.5) * 3.0;
    let along = dot(xz, wind);
    let t1 = along / L1 + sand.ripple.x + warp;
    let t2 = along / L2 + sand.ripple.y + warp * 0.35;
    // Fade each scale as it becomes smaller than a pixel or two.
    let fade1 = 1.0 - smoothstep(0.18, 0.45, fwidth(t1));
    let fade2 = 1.0 - smoothstep(0.18, 0.45, fwidth(t2));
    // Slip faces avalanche smooth; rock has none.
    let sandy = (1.0 - smoothstep(0.06, 0.2, steep)) * (1.0 - rock);
    // Ripple strength varies across the dune field, in patches.
    let patchy = 0.55 + 0.9 * vnoise(xz, F1, sand.n1);
    let a1 = 0.012 * fade1 * sandy * patchy;
    let a2 = 0.045 * fade2 * sandy * (1.6 - patchy * 0.7);
    let slope = wind * (ripple_slope(t1) * a1 / L1 + ripple_slope(t2) * a2 / L2);

    // Broad undulation at a few metres, and bumps on rock.
    var g = slope;
    g += vgrad(xz, F3, sand.n3) * (0.25 * (1.0 - rock) * sandy + 1.2 * rock) * (1.0 - smoothstep(60.0, 250.0, dist));
    g += vgrad(xz, F1, sand.n1) * (1.5 + 6.0 * rock);

    let gv = vec3<f32>(g.x, 0.0, g.y);
    n = normalize(n - (gv - n * dot(gv, n)));
    pbr_input.N = n;

    // --- colour ------------------------------------------------------------
    var col = pbr_input.material.base_color.rgb;
    let near = 1.0 - smoothstep(40.0, 160.0, dist);
    let m0 = vnoise(xz, F0, sand.n0);
    let m1 = vnoise(xz, F1, sand.n1);
    let m2 = vnoise(xz, F2, sand.n2);
    col *= 0.94 + 0.12 * m0 * near + 0.06 * (1.0 - near);
    col *= 0.9 + 0.2 * m1;
    // Large patches drift between paler and redder sand.
    col *= mix(vec3<f32>(1.04, 1.0, 0.95), vec3<f32>(1.02, 0.9, 0.8), smoothstep(0.35, 0.8, m2));
    // Crests catch light and are paler; troughs collect coarser, darker,
    // redder grains; ripple troughs are faintly darker.
    col *= 1.0 + clamp(curv, 0.0, 1.0) * 0.14 * (1.0 - rock);
    col *= mix(vec3<f32>(1.0), vec3<f32>(0.9, 0.82, 0.75), clamp(-curv, 0.0, 1.0) * (1.0 - rock));
    col *= 1.0 - 0.07 * (ripple_height(t1) * 0.5 + 0.5) * fade1 * sandy;
    // Rock: strata and grit.
    let strata = sin(in.world_position.y * 0.9 + (m1 - 0.5) * 6.0) * 0.5 + 0.5;
    col = mix(col, col * (0.8 + 0.35 * strata) * (0.85 + 0.3 * m0), rock);
    pbr_input.material.base_color = vec4<f32>(col, 1.0);

    var out: FragmentOutput;
    out.color = apply_pbr_lighting(pbr_input);

    // --- dune shadow beyond the shadow map ----------------------------------
    // Remove the sun's share of the light where the baked march says the sun
    // is hidden: lit = ambient + direct, shadow = ambient.
    let ndl = max(dot(n, sand.sun.xyz), 0.0);
    let shadowed = 1.0 / (1.0 + sand.sun.w * ndl);
    let far_enough = smoothstep(sand.fade.x, sand.fade.y, dist);
    out.color = vec4<f32>(out.color.rgb * mix(1.0, shadowed, (1.0 - sun_vis) * far_enough), out.color.a);

    // A few grains glint up close, facing the sun.
    let cell = vec2<i32>(floor(xz * 60.0));
    let glint = step(0.9985, hash(cell)) * (1.0 - smoothstep(4.0, 18.0, dist)) * sandy * sun_vis;
    let h = normalize(sand.sun.xyz + pbr_input.V);
    out.color = vec4<f32>(out.color.rgb + vec3<f32>(1.2, 1.1, 0.95) * glint * pow(max(dot(n, h), 0.0), 60.0), out.color.a);

    out.color = main_pass_post_lighting_processing(pbr_input, out.color);
    return out;
}
