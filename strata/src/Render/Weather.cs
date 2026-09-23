using System;
using Godot;

namespace Strata;

/// <summary>
/// Clear, rain and storm, drifting from one to the next every few minutes.
/// What actually falls depends on where you stand: rain in temperate land,
/// snow in the cold, nothing over the dunes. Streaks are drawn in a column
/// around the camera and stop at the first roof above them.
/// </summary>
public sealed partial class Weather : MultiMeshInstance3D
{
    public int State;                      // 0 clear, 1 rain, 2 storm
    public float Timer = 240f;
    public float Intensity;                // eased 0..1
    public Precip Kind = Precip.Rain;
    private const int Count = 1400;
    private readonly Vector3[] _drops = new Vector3[Count];
    private readonly float[] _speed = new float[Count];
    private readonly float[] _buf = new float[Count * 16];
    private readonly Random _rng = new();
    private float _thunder, _lightning;
    public float Density = 1f;

    public override void _Ready()
    {
        var shader = new Shader
        {
            Code = @"
shader_type spatial;
render_mode unshaded, fog_disabled, cull_disabled, depth_draw_never, blend_mix, shadows_disabled;
global uniform float daylight;
void vertex() {
    // Keep each streak upright but turned toward the camera.
    vec3 c = MODEL_MATRIX[3].xyz;
    vec3 to = normalize(vec3(CAMERA_POSITION_WORLD.x - c.x, 0.0, CAMERA_POSITION_WORLD.z - c.z));
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), to));
    float sx = length(MODEL_MATRIX[0].xyz), sy = length(MODEL_MATRIX[1].xyz);
    vec3 world = c + right * VERTEX.x * sx + vec3(0.0, VERTEX.y * sy, 0.0);
    POSITION = PROJECTION_MATRIX * VIEW_MATRIX * vec4(world, 1.0);
}
void fragment() {
    float edge = 1.0 - abs(UV.x - 0.5) * 2.0;
    vec3 col = mix(vec3(0.55, 0.62, 0.72), vec3(0.95), COLOR.r) * (0.25 + 0.75 * daylight);
    ALBEDO = col;
    ALPHA = COLOR.a * edge;
}
",
        };
        Multimesh = new MultiMesh
        {
            TransformFormat = MultiMesh.TransformFormatEnum.Transform3D,
            UseColors = true,
            InstanceCount = Count,
            VisibleInstanceCount = 0,
            Mesh = new QuadMesh { Size = Vector2.One },
        };
        MaterialOverride = new ShaderMaterial { Shader = shader };
        CastShadow = ShadowCastingSetting.Off;
        ExtraCullMargin = 1000f;
        for (int i = 0; i < Count; i++) { _drops[i] = new Vector3(float.NaN, 0, 0); _speed[i] = 1f; }
    }

    public void Step(float dt, Game g)
    {
        Timer -= dt;
        if (Timer <= 0f)
        {
            double r = _rng.NextDouble();
            State = State switch
            {
                0 => r < 0.45 ? 1 : 0,
                1 => r < 0.25 ? 2 : r < 0.75 ? 0 : 1,
                _ => r < 0.7 ? 1 : 0,
            };
            Timer = State == 0 ? 300f + (float)r * 600f : 150f + (float)r * 300f;
        }
        var p = g.Player.Body.Position;
        var biome = Biomes.Get(g.World.Gen.BiomeAt(V.FloorToInt(p.X), V.FloorToInt(p.Z)));
        Kind = biome.Precip;
        if (p.Y > 150 && Kind == Precip.Rain) Kind = Precip.Snow;
        float target = State == 0 || Kind == Precip.None ? 0f : State == 2 ? 1f : 0.7f;
        Intensity = Mathf.MoveToward(Intensity, target, dt * 0.08f);
        g.View.Sky.Rain = Intensity;
        g.View.Sky.Storm = State == 2 && Kind != Precip.None ? Intensity : 0f;

        // Lightning in storms.
        if (State == 2 && Intensity > 0.6f && Kind == Precip.Rain)
        {
            _lightning -= dt;
            if (_lightning <= 0f)
            {
                _lightning = 8f + (float)_rng.NextDouble() * 20f;
                g.View.Sky.LightningFlash = 0.9f;
                _thunder = 0.6f + (float)_rng.NextDouble() * 2.5f;
            }
        }
        if (_thunder > 0f)
        {
            _thunder -= dt;
            if (_thunder <= 0f) Sfx.Ui("thunder", 0.9f, 0.8f + (float)_rng.NextDouble() * 0.3f);
        }

        Animate(dt, g);
    }

    private void Animate(float dt, Game g)
    {
        var cam = g.Player.Camera.GlobalPosition;
        bool snow = Kind == Precip.Snow;
        int active = (int)(Count * Intensity * Density);
        const float radius = 20f;
        for (int i = 0; i < active; i++)
        {
            var d = _drops[i];
            if (float.IsNaN(d.X) || d.Y < cam.Y - 14f || new Vector2(d.X - cam.X, d.Z - cam.Z).LengthSquared() > radius * radius)
            {
                float a = (float)_rng.NextDouble() * MathF.Tau, r = MathF.Sqrt((float)_rng.NextDouble()) * radius;
                d = new Vector3(cam.X + MathF.Cos(a) * r, cam.Y + 10f + (float)_rng.NextDouble() * 10f, cam.Z + MathF.Sin(a) * r);
                _speed[i] = snow ? 1.6f + (float)_rng.NextDouble() * 1.2f : 16f + (float)_rng.NextDouble() * 6f;
            }
            d.Y -= _speed[i] * dt;
            if (snow) { d.X += MathF.Sin(d.Y * 0.8f + i) * dt * 0.6f; d.Z += MathF.Cos(d.Y * 0.7f + i * 1.3f) * dt * 0.6f; }
            // Stop at the first thing overhead.
            int top = g.World.HeightAt(V.FloorToInt(d.X), V.FloorToInt(d.Z));
            if (d.Y < top)
            {
                if (!snow && _rng.NextDouble() < 0.02 * Density && Math.Abs(top - cam.Y) < 12)
                    g.Particles.Emit(new Vector3(d.X, top + 0.05f, d.Z), new Vector3(0, 1.2f, 0), new Color(0.7f, 0.78f, 0.9f), 0.2f, 0.05f, 10f, false);
                d = new Vector3(float.NaN, 0, 0);
            }
            _drops[i] = d;
            int o = i * 16;
            if (float.IsNaN(d.X))
            {
                for (int k = 0; k < 16; k++) _buf[o + k] = 0;
                continue;
            }
            float w = snow ? 0.09f : 0.03f, h = snow ? 0.09f : 0.75f;
            _buf[o] = w; _buf[o + 1] = 0; _buf[o + 2] = 0; _buf[o + 3] = d.X;
            _buf[o + 4] = 0; _buf[o + 5] = h; _buf[o + 6] = 0; _buf[o + 7] = d.Y;
            _buf[o + 8] = 0; _buf[o + 9] = 0; _buf[o + 10] = w; _buf[o + 11] = d.Z;
            _buf[o + 12] = snow ? 1f : 0f; _buf[o + 13] = 0; _buf[o + 14] = 0; _buf[o + 15] = snow ? 0.9f : 0.45f;
        }
        if (active > 0) Multimesh.Buffer = _buf;
        Multimesh.VisibleInstanceCount = active;
    }
}
