using System;
using Godot;

namespace Strata;

/// <summary>
/// Small square particles for breaking blocks, hits, splashes and smoke. One
/// MultiMesh draws them all; each is a camera-facing card whose colour is
/// sampled from the block it came from, so broken stone sheds grey chips and
/// broken grass green ones.
/// </summary>
public sealed partial class Particles : MultiMeshInstance3D
{
    private const int Max = 3000;
    private struct P
    {
        public Vector3 Pos, Vel;
        public float Life, Max, Size, Gravity, Drag;
        public Color Col;
        public bool Collide, Glow;
    }

    private readonly P[] _p = new P[Max];
    private int _n;
    private float[] _buf = new float[Max * 16];
    private readonly Random _rng = new();
    public World World;
    public float Density = 1f;          // lowered by the graphics setting

    public override void _Ready()
    {
        var shader = new Shader
        {
            Code = @"
shader_type spatial;
render_mode unshaded, fog_disabled, cull_disabled, depth_draw_opaque;
global uniform vec4 fog_color;
global uniform float fog_start;
global uniform float fog_end;
void vertex() {
    // Face the camera: rebuild the model-view with the instance scale only.
    float s = length(MODEL_MATRIX[0].xyz);
    MODELVIEW_MATRIX = VIEW_MATRIX * mat4(vec4(1,0,0,0), vec4(0,1,0,0), vec4(0,0,1,0), MODEL_MATRIX[3]);
    MODELVIEW_MATRIX = mat4(vec4(s,0,0,0), vec4(0,s,0,0), vec4(0,0,s,0), MODELVIEW_MATRIX[3]);
}
void fragment() {
    ALBEDO = pow(COLOR.rgb, vec3(2.2)) * (COLOR.a > 1.5 ? 1.6 : 1.0);
}
",
        };
        var mm = new MultiMesh
        {
            TransformFormat = MultiMesh.TransformFormatEnum.Transform3D,
            UseColors = true,
            InstanceCount = Max,
            VisibleInstanceCount = 0,
            Mesh = new QuadMesh { Size = Vector2.One },
        };
        Multimesh = mm;
        MaterialOverride = new ShaderMaterial { Shader = shader };
        CastShadow = ShadowCastingSetting.Off;
        ExtraCullMargin = 10000f;
    }

    private float R(float a, float b) => a + (float)_rng.NextDouble() * (b - a);

    public void Emit(Vector3 pos, Vector3 vel, Color col, float life, float size, float gravity = 14f, bool collide = true, float drag = 0.5f, bool glow = false)
    {
        if (_n >= Max) return;
        _p[_n++] = new P { Pos = pos, Vel = vel, Col = col, Life = life, Max = life, Size = size, Gravity = gravity, Collide = collide, Drag = drag, Glow = glow };
    }

    /// <summary>Linear light factor at a point, matching the voxel shader's curve closely enough for particles.</summary>
    private float LightAt(Vector3 p)
    {
        if (World == null) return 1f;
        byte l = World.GetLight(V.FloorToInt(p.X), V.FloorToInt(p.Y), V.FloorToInt(p.Z));
        float day = Atmosphere.CurrentDaylight;
        float sky = MathF.Pow(0.8f, 15f - (l >> 4) * day), blk = MathF.Pow(0.8f, 15f - (l & 15));
        return Math.Max(0.06f, Math.Max(sky, blk));
    }

    private Color TextureColor(BlockDef def)
    {
        int layer = def.Tex[_rng.Next(6)];
        var img = Textures.Layers?[layer];
        if (img == null) return def.Particle;
        for (int tries = 0; tries < 6; tries++)
        {
            var c = img.GetPixel(_rng.Next(16), _rng.Next(16));
            if (c.A > 0.5f || !Textures.CutoutLayers.Contains(layer))
            {
                string n = Tex.Names[layer];
                if (n is "grass_top" or "grass_side" or "tall_grass" or "fern" or "elm_leaves" or "ironwood_leaves" or "willow_leaves" or "pine_leaves")
                    c = new Color(c.R * 0.5f, c.G * 0.8f, c.B * 0.35f);
                c.A = 1f;
                return c;
            }
        }
        return def.Particle;
    }

    public void BlockBreak(int x, int y, int z, ushort id)
    {
        var def = Blocks.Get(id);
        var center = new Vector3(x + 0.5f, y + 0.5f, z + 0.5f);
        float light = def.Emissive ? 1f : LightAt(center + Vector3.Up);
        int n = (int)(28 * Density);
        for (int i = 0; i < n; i++)
        {
            var o = new Vector3(R(-0.4f, 0.4f), R(-0.4f, 0.4f), R(-0.4f, 0.4f));
            var c = TextureColor(def) * light; c.A = 1f;
            Emit(center + o, o * 4f + new Vector3(0, R(1f, 3f), 0), c, R(0.5f, 1.1f), R(0.06f, 0.13f));
        }
    }

    public void BlockHit(int x, int y, int z, ushort id, int face)
    {
        var def = Blocks.Get(id);
        var n = face >= 0 ? new Vector3(Dir.DX[face], Dir.DY[face], Dir.DZ[face]) : Vector3.Up;
        var p = new Vector3(x + 0.5f, y + 0.5f, z + 0.5f) + n * 0.52f;
        float light = LightAt(p);
        for (int i = 0; i < 3 * Density + 1; i++)
        {
            var o = new Vector3(R(-0.4f, 0.4f), R(-0.4f, 0.4f), R(-0.4f, 0.4f));
            o -= n * o.Dot(n);
            var c = TextureColor(def) * light; c.A = 1f;
            Emit(p + o, n * R(0.5f, 2f) + new Vector3(0, R(0.5f, 2f), 0), c, R(0.3f, 0.6f), R(0.05f, 0.09f));
        }
    }

    public void Burst(Vector3 p, Color col, int count, float speed, float size = 0.08f, float gravity = 10f, float life = 0.7f, bool glow = false)
    {
        float light = glow ? 1f : LightAt(p);
        for (int i = 0; i < count * Density + 1; i++)
        {
            var v = new Vector3(R(-1, 1), R(-0.3f, 1), R(-1, 1)).Normalized() * R(0.3f, 1f) * speed;
            var c = col * (0.8f + R(0, 0.4f)) * light; c.A = 1f;
            Emit(p, v, c, R(life * 0.6f, life * 1.3f), size * R(0.7f, 1.3f), gravity, true, 1.5f, glow);
        }
    }

    public void Smoke(Vector3 p, int count = 6)
    {
        for (int i = 0; i < count; i++)
            Emit(p + new Vector3(R(-0.3f, 0.3f), R(0, 0.3f), R(-0.3f, 0.3f)), new Vector3(R(-0.3f, 0.3f), R(0.6f, 1.4f), R(-0.3f, 0.3f)),
                new Color(0.4f, 0.4f, 0.42f) * LightAt(p), R(0.8f, 1.6f), R(0.12f, 0.24f), -0.5f, false, 1f);
    }

    public void Clear() { _n = 0; }

    public override void _Process(double delta)
    {
        float dt = (float)delta;
        int w = 0;
        for (int i = 0; i < _n; i++)
        {
            var p = _p[i];
            p.Life -= dt;
            if (p.Life <= 0) continue;
            p.Vel.Y -= p.Gravity * dt;
            p.Vel *= MathF.Exp(-p.Drag * dt);
            var next = p.Pos + p.Vel * dt;
            if (p.Collide && World != null)
            {
                var def = Blocks.Get(World.GetBlock(V.FloorToInt(next.X), V.FloorToInt(next.Y), V.FloorToInt(next.Z)));
                if (def.Solid && def.Render == RenderKind.Cube)
                {
                    // Settle on whatever it hit.
                    p.Vel = new Vector3(p.Vel.X * 0.3f, 0, p.Vel.Z * 0.3f);
                    next = p.Pos;
                }
            }
            p.Pos = next;
            _p[w++] = p;
        }
        _n = w;

        for (int i = 0; i < _n; i++)
        {
            var p = _p[i];
            float s = p.Size * Math.Min(1f, p.Life / p.Max * 3f);
            int o = i * 16;
            _buf[o] = s; _buf[o + 1] = 0; _buf[o + 2] = 0; _buf[o + 3] = p.Pos.X;
            _buf[o + 4] = 0; _buf[o + 5] = s; _buf[o + 6] = 0; _buf[o + 7] = p.Pos.Y;
            _buf[o + 8] = 0; _buf[o + 9] = 0; _buf[o + 10] = s; _buf[o + 11] = p.Pos.Z;
            var c = p.Glow ? p.Col * 1.6f : p.Col;
            _buf[o + 12] = c.R; _buf[o + 13] = c.G; _buf[o + 14] = c.B; _buf[o + 15] = 1f;
        }
        if (_n > 0) Multimesh.Buffer = _buf;
        Multimesh.VisibleInstanceCount = _n;
    }
}
