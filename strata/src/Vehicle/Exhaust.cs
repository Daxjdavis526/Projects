using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// Fire and smoke: soft round puffs that fly, slow in the air, rise if hot,
/// grow and fade. Puffs are stopped by blocks one axis at a time and the speed
/// they lose is turned sideways, so a plume that hits the pad spreads out
/// across it, and one that goes down the flame trench runs along the trench
/// and billows out of its open end. Fire is drawn additively (it glows and
/// sets off the bloom); smoke is drawn blended, back to front, and is lit by
/// the time of day and by the flame.
/// </summary>
public sealed partial class Exhaust : Node3D
{
    private struct Puff
    {
        public Vector3 Pos, Vel;
        public float Age, Life, Size0, Size1, Drag, Rise, Alpha;
        public Color Col;
    }

    private const int MaxFire = 1400, MaxSmoke = 1800;
    private readonly Puff[] _fire = new Puff[MaxFire], _smoke = new Puff[MaxSmoke];
    private int _nf, _ns;
    private MultiMeshInstance3D _fireMesh, _smokeMesh;
    private float[] _fireBuf = new float[MaxFire * 16], _smokeBuf = new float[MaxSmoke * 16];
    private readonly Random _rng = new();
    private readonly List<int> _order = new();
    private float[] _dist = new float[MaxSmoke];
    public World World;
    public float Density = 1f;
    public int Count => _nf + _ns;

    private const string Billboard = @"
void vertex() {
    float s = length(MODEL_MATRIX[0].xyz);
    MODELVIEW_MATRIX = VIEW_MATRIX * mat4(vec4(1,0,0,0), vec4(0,1,0,0), vec4(0,0,1,0), MODEL_MATRIX[3]);
    MODELVIEW_MATRIX = mat4(vec4(s,0,0,0), vec4(0,s,0,0), vec4(0,0,s,0), MODELVIEW_MATRIX[3]);
    v_world = MODEL_MATRIX[3].xyz;
    v_col = COLOR;
    v_seed = fract(MODEL_MATRIX[3].x * 0.137 + MODEL_MATRIX[3].z * 0.291);
}
";

    public override void _Ready()
    {
        var fire = new Shader
        {
            Code = @"
shader_type spatial;
render_mode unshaded, blend_add, cull_disabled, depth_draw_never, fog_disabled, shadows_disabled;
#include ""res://shaders/voxel_common.gdshaderinc""
varying vec4 v_col;
varying float v_seed;
" + Billboard + @"
void fragment() {
    vec2 d = UV * 2.0 - 1.0;
    float r = dot(d, d);
    float a = smoothstep(1.0, 0.0, r);
    a *= a;
    // A hot core and a cooler rim.
    vec3 c = mix(v_col.rgb, v_col.rgb * vec3(1.0, 0.8, 0.6) + vec3(0.3, 0.25, 0.15), smoothstep(0.5, 0.0, r));
    float f = 1.0 - fog_amount(v_world, CAMERA_POSITION_WORLD);
    ALBEDO = safe_color(srgb_to_linear(c) * a * v_col.a * 2.2 * f, 4.0);
}
",
        };
        var smoke = new Shader
        {
            Code = @"
shader_type spatial;
render_mode unshaded, blend_mix, cull_disabled, depth_draw_never, fog_disabled, shadows_disabled;
#include ""res://shaders/voxel_common.gdshaderinc""
varying vec4 v_col;
varying float v_seed;
" + Billboard + @"
float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float n2(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y);
}
void fragment() {
    vec2 d = UV * 2.0 - 1.0;
    float r = length(d);
    // Lumpy edges, different for every puff.
    float lump = n2(d * 2.6 + v_seed * 31.0) * 0.55 + n2(d * 5.3 - v_seed * 17.0) * 0.25;
    float a = smoothstep(1.0, 0.35, r + (lump - 0.4) * 0.5);
    // Lit from above by the sky, from nearby by the flame; darker underneath.
    float sky = mix(0.18, 1.0, daylight) * mix(0.72, 1.0, smoothstep(0.6, -0.6, d.y));
    vec3 c = srgb_to_linear(v_col.rgb) * (sky_tint.rgb * sky + dyn_light(v_world) * 0.7) * brightness;
    ALBEDO = safe_color(mix(c, fog_color.rgb, fog_amount(v_world, CAMERA_POSITION_WORLD)), 1.0);
    ALPHA = a * v_col.a;
}
",
        };
        _fireMesh = Make(fire, MaxFire);
        _smokeMesh = Make(smoke, MaxSmoke);
    }

    private MultiMeshInstance3D Make(Shader shader, int max)
    {
        var mm = new MultiMesh
        {
            TransformFormat = MultiMesh.TransformFormatEnum.Transform3D,
            UseColors = true,
            InstanceCount = max,
            VisibleInstanceCount = 0,
            Mesh = new QuadMesh { Size = Vector2.One },
        };
        var mi = new MultiMeshInstance3D
        {
            Multimesh = mm,
            MaterialOverride = new ShaderMaterial { Shader = shader },
            CastShadow = GeometryInstance3D.ShadowCastingSetting.Off,
            ExtraCullMargin = 16000f,
        };
        AddChild(mi);
        return mi;
    }

    private float R(float a, float b) => a + (float)_rng.NextDouble() * (b - a);
    public Vector3 Jitter(float r) => new(R(-r, r), R(-r, r), R(-r, r));

    public void Fire(Vector3 pos, Vector3 vel, float life, float size0, float size1, Color col, float drag = 3f, float rise = 4f)
    {
        if (_nf >= MaxFire) return;
        _fire[_nf++] = new Puff { Pos = pos, Vel = vel, Life = life, Size0 = size0, Size1 = size1, Col = col, Drag = drag, Rise = rise, Alpha = 1f };
    }

    public void Smoke(Vector3 pos, Vector3 vel, float life, float size0, float size1, Color col, float alpha = 0.55f, float drag = 1.2f, float rise = 1.5f)
    {
        if (_ns >= MaxSmoke)
        {
            // Full: replace the oldest-looking puff rather than drop the new one.
            int k = _rng.Next(_ns);
            _smoke[k] = new Puff { Pos = pos, Vel = vel, Life = life, Size0 = size0, Size1 = size1, Col = col, Drag = drag, Rise = rise, Alpha = alpha };
            return;
        }
        _smoke[_ns++] = new Puff { Pos = pos, Vel = vel, Life = life, Size0 = size0, Size1 = size1, Col = col, Drag = drag, Rise = rise, Alpha = alpha };
    }

    /// <summary>A fireball and a dark column: what a blast of radius r looks like.</summary>
    public void Blast(Vector3 c, float r, Vector3 carry)
    {
        int nFire = (int)(90 * Density + r * 10);
        for (int i = 0; i < nFire; i++)
        {
            var d = new Vector3(R(-1, 1), R(-0.4f, 1), R(-1, 1)).Normalized();
            Fire(c + d * R(0, r * 0.5f), carry * 0.4f + d * R(r * 2f, r * 7f), R(0.6f, 1.6f), R(r * 0.4f, r * 0.8f), R(r * 1f, r * 2f),
                new Color(1f, R(0.5f, 0.85f), R(0.15f, 0.35f)), 2.5f, 6f);
        }
        int nSmoke = (int)(70 * Density + r * 8);
        for (int i = 0; i < nSmoke; i++)
        {
            var d = new Vector3(R(-1, 1), R(-0.2f, 1), R(-1, 1)).Normalized();
            float g = R(0.12f, 0.3f);
            Smoke(c + d * R(0, r), carry * 0.3f + d * R(r * 0.8f, r * 3f) + new Vector3(0, R(2, 8), 0), R(10f, 22f), R(r * 0.6f, r * 1.2f), R(r * 2.5f, r * 4.5f),
                new Color(g, g * 0.95f, g * 0.9f), R(0.55f, 0.85f), 0.9f, R(1.5f, 4f));
        }
    }

    public void Clear() { _nf = 0; _ns = 0; }

    public override void _Process(double delta)
    {
        float dt = Math.Min((float)delta, 0.1f);
        Step(_fire, ref _nf, dt);
        Step(_smoke, ref _ns, dt);
        Draw();
    }

    private void Step(Puff[] ps, ref int n, float dt)
    {
        int w = 0;
        for (int i = 0; i < n; i++)
        {
            var p = ps[i];
            p.Age += dt;
            if (p.Age >= p.Life) continue;
            p.Vel *= MathF.Exp(-p.Drag * dt);
            p.Vel.Y += p.Rise * dt;
            Move(ref p, dt);
            ps[w++] = p;
        }
        n = w;
    }

    private bool Solid(Vector3 p)
    {
        if (World == null) return false;
        var d = World.GetDef(V.FloorToInt(p.X), V.FloorToInt(p.Y), V.FloorToInt(p.Z));
        return d.Solid && d.Render == RenderKind.Cube;
    }

    /// <summary>Moves a puff an axis at a time; speed lost against a surface goes sideways along it.</summary>
    private void Move(ref Puff p, float dt)
    {
        var d = p.Vel * dt;
        float lost = 0f;
        var next = p.Pos;
        next.Y += d.Y;
        if (Solid(next)) { lost += MathF.Abs(p.Vel.Y); next.Y = p.Pos.Y; p.Vel.Y = -p.Vel.Y * 0.05f; }
        next.X += d.X;
        if (Solid(next)) { lost += MathF.Abs(p.Vel.X) * 0.6f; next.X = p.Pos.X; p.Vel.X = -p.Vel.X * 0.1f; }
        next.Z += d.Z;
        if (Solid(next)) { lost += MathF.Abs(p.Vel.Z) * 0.6f; next.Z = p.Pos.Z; p.Vel.Z = -p.Vel.Z * 0.1f; }
        if (lost > 0.5f)
        {
            // Spread out along whatever stopped it: the way it was already going, or anywhere.
            var h = new Vector3(p.Vel.X, 0, p.Vel.Z);
            float a = R(0, MathF.Tau);
            var dir = h.LengthSquared() > 0.5f ? h.Normalized() : new Vector3(MathF.Cos(a), 0, MathF.Sin(a));
            dir = (dir + new Vector3(R(-0.6f, 0.6f), 0, R(-0.6f, 0.6f))).Normalized();
            var gain = dir * lost * 0.75f;
            // Only push sideways where there is room to go.
            if (Solid(next + new Vector3(Math.Sign(gain.X), 0, 0))) gain.X = -gain.X * 0.3f;
            if (Solid(next + new Vector3(0, 0, Math.Sign(gain.Z)))) gain.Z = -gain.Z * 0.3f;
            p.Vel += gain + new Vector3(0, lost * 0.08f, 0);
        }
        p.Pos = next;
    }

    private void Draw()
    {
        var cam = GetViewport()?.GetCamera3D();
        var camPos = cam?.GlobalPosition ?? Vector3.Zero;
        for (int i = 0; i < _nf; i++)
        {
            var p = _fire[i];
            float t = p.Age / p.Life;
            float s = Mathf.Lerp(p.Size0, p.Size1, MathF.Sqrt(t));
            var c = p.Col.Lerp(new Color(0.9f, 0.25f, 0.05f), Smooth.Step(0.2f, 1f, t));
            Put(_fireBuf, i, p.Pos, s, c, p.Alpha * (1f - t) * (1f - t));
        }
        // Smoke back to front, so the nearer puffs cover the further ones.
        _order.Clear();
        for (int i = 0; i < _ns; i++) { _order.Add(i); _dist[i] = (_smoke[i].Pos - camPos).LengthSquared(); }
        _order.Sort((a, b) => _dist[b].CompareTo(_dist[a]));
        for (int k = 0; k < _order.Count; k++)
        {
            var p = _smoke[_order[k]];
            float t = p.Age / p.Life;
            float s = Mathf.Lerp(p.Size0, p.Size1, 1f - (1f - t) * (1f - t));
            float a = p.Alpha * Smooth.Step(0f, 0.06f, t) * (1f - Smooth.Step(0.45f, 1f, t));
            Put(_smokeBuf, k, p.Pos, s, p.Col, a);
        }
        Upload(_fireMesh, _fireBuf, _nf);
        Upload(_smokeMesh, _smokeBuf, _ns);
    }

    private static void Put(float[] buf, int i, Vector3 p, float s, Color c, float a)
    {
        int o = i * 16;
        buf[o] = s; buf[o + 1] = 0; buf[o + 2] = 0; buf[o + 3] = p.X;
        buf[o + 4] = 0; buf[o + 5] = s; buf[o + 6] = 0; buf[o + 7] = p.Y;
        buf[o + 8] = 0; buf[o + 9] = 0; buf[o + 10] = s; buf[o + 11] = p.Z;
        buf[o + 12] = c.R; buf[o + 13] = c.G; buf[o + 14] = c.B; buf[o + 15] = a;
    }

    private static void Upload(MultiMeshInstance3D mi, float[] buf, int n)
    {
        if (n > 0) mi.Multimesh.Buffer = buf;
        mi.Multimesh.VisibleInstanceCount = n;
    }
}
