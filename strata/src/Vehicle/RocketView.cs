using System;
using Godot;

namespace Strata;

/// <summary>
/// Draws a rocket and everything its engine throws out: the model, the flame
/// (two glowing cones that lengthen with thrust and spread in thin air), a
/// glow at the nozzle, fire and smoke puffs (which the pad and the flame
/// trench deflect), the light the flame casts on the ground around it, and
/// the roar. Reads the simulation; never changes it.
/// </summary>
public sealed partial class RocketView : Node3D
{
    public Rocket Rocket;
    private MeshInstance3D _body, _flame, _core, _glow;
    private ShaderMaterial _bodyMat, _flameMat, _coreMat, _glowMat;
    private AudioStreamPlayer3D _roar;
    private float _fireAcc, _smokeAcc;
    private readonly Random _rng = new();
    private static ArrayMesh _model, _cone;
    private static readonly float[] Probes = { 4f, 12f, 20f, 28f };

    public float Power => Rocket.Engine.Thrust / Rocket.Engine.MaxThrust;
    public float Thin => 1f - Rocket.Aero.Density / PhysicsWorld.SeaDensity;
    public Vector3 Nozzle => Rocket.PointWorld(new Vector3(0, 0.6f, 0));
    public Vector3 ExhaustDir => -Rocket.Body.DirToWorld(Rocket.Engine.Direction());

    public override void _Ready()
    {
        _model ??= RocketModel.Build();
        _cone ??= Cone();
        _bodyMat = new ShaderMaterial { Shader = GD.Load<Shader>("res://shaders/entity.gdshader") };
        _body = new MeshInstance3D { Mesh = _model, MaterialOverride = _bodyMat, CastShadow = GeometryInstance3D.ShadowCastingSetting.Off };
        AddChild(_body);

        var flameShader = GD.Load<Shader>("res://shaders/flame.gdshader");
        _flameMat = new ShaderMaterial { Shader = flameShader };
        _coreMat = new ShaderMaterial { Shader = flameShader };
        _coreMat.SetShaderParameter("core", 1f);
        _flame = new MeshInstance3D { Mesh = _cone, MaterialOverride = _flameMat, CastShadow = GeometryInstance3D.ShadowCastingSetting.Off, Visible = false };
        _core = new MeshInstance3D { Mesh = _cone, MaterialOverride = _coreMat, CastShadow = GeometryInstance3D.ShadowCastingSetting.Off, Visible = false };
        AddChild(_flame);
        AddChild(_core);
        _glowMat = new ShaderMaterial { Shader = GD.Load<Shader>("res://shaders/glow_sprite.gdshader") };
        _glow = new MeshInstance3D { Mesh = new QuadMesh { Size = Vector2.One }, MaterialOverride = _glowMat, CastShadow = GeometryInstance3D.ShadowCastingSetting.Off, Visible = false };
        AddChild(_glow);

        _roar = new AudioStreamPlayer3D
        {
            Stream = SoundBank.Get("rocket_roar"), UnitSize = 45f, MaxDistance = 2500f,
            AttenuationModel = AudioStreamPlayer3D.AttenuationModelEnum.InverseDistance, Bus = "Master",
        };
        AddChild(_roar);
    }

    /// <summary>A unit flame cone along -y with normals: full width at the nozzle, swelling, then closing to a point.</summary>
    private static ArrayMesh Cone()
    {
        var st = new SurfaceTool();
        st.Begin(Mesh.PrimitiveType.Triangles);
        float[] ys = { 0f, -0.08f, -0.3f, -0.6f, -0.85f, -1f };
        float[] rs = { 1f, 1.1f, 1.22f, 1.1f, 0.6f, 0.05f };
        const int seg = 20;
        for (int b = 0; b + 1 < ys.Length; b++)
            for (int s = 0; s < seg; s++)
            {
                float a0 = s * MathF.Tau / seg, a1 = (s + 1) * MathF.Tau / seg;
                Vector3 P(int i, float a) => new(MathF.Cos(a) * rs[i], ys[i], MathF.Sin(a) * rs[i]);
                Vector3 N(float a) => new(MathF.Cos(a), 0, MathF.Sin(a));
                var q = new[] { (P(b, a0), N(a0)), (P(b, a1), N(a1)), (P(b + 1, a1), N(a1)), (P(b + 1, a0), N(a0)) };
                foreach (int k in new[] { 0, 1, 2, 0, 2, 3 }) { st.SetNormal(q[k].Item2); st.AddVertex(q[k].Item1); }
            }
        return st.Commit();
    }

    public void Sync(float dt, World w, Exhaust ex, float volume)
    {
        var r = Rocket;
        var origin = r.Origin;
        Transform = new Transform3D(new Basis(r.Body.Rot), origin);

        // Light: the voxel light at the capsule (the body's shading is baked; the flame's light comes in through the shader).
        // (Sampled beside the body at a few heights, so floodlights on the tower reach it.)
        int sky = 0, blk = 0;
        foreach (float h in Probes)
        {
            var probe = r.PointWorld(new Vector3(2.2f, h, 0));
            byte l = w.GetLight(V.FloorToInt(probe.X), V.FloorToInt(probe.Y), V.FloorToInt(probe.Z));
            sky = Math.Max(sky, l >> 4); blk = Math.Max(blk, l & 15);
        }
        _bodyMat.SetShaderParameter("light_level", new Vector2(sky / 15f, blk / 15f));
        float hurt = 1f - r.Health / r.MaxHealth;
        _bodyMat.SetShaderParameter("flash", hurt > 0.5f ? (hurt - 0.5f) * 0.4f : 0f);

        float p = Power, thin = Thin;
        bool on = p > 0.005f && !r.Destroyed;
        _flame.Visible = _core.Visible = _glow.Visible = on;
        if (on)
        {
            // The flame points along the thrust, swung with the gimbal.
            var g = r.Engine.Gimbal;
            var local = Basis.FromEuler(new Vector3(g.X, 0, g.Y));
            float len = (7f + 15f * p) * (1f + 1.2f * thin);
            float rad = 1.2f * (1f + 1.6f * thin);
            _flame.Transform = new Transform3D(local.Scaled(new Vector3(rad, len, rad)), new Vector3(0, 0.6f, 0));
            _core.Transform = new Transform3D(local.Scaled(new Vector3(rad * 0.55f, len * 0.5f, rad * 0.55f)), new Vector3(0, 0.6f, 0));
            _flameMat.SetShaderParameter("power", Math.Min(1f, p * 1.2f));
            _flameMat.SetShaderParameter("thin", thin);
            _coreMat.SetShaderParameter("power", Math.Min(1f, p * 1.2f));
            _coreMat.SetShaderParameter("thin", thin);
            float gs = 16f + 18f * p;
            _glow.Transform = new Transform3D(Basis.Identity.Scaled(new Vector3(gs, gs, gs)), new Vector3(0, -2f - len * 0.15f, 0));
            _glowMat.SetShaderParameter("strength", 0.35f + 0.5f * p);
            Emit(dt, ex, p, thin, w);
        }

        // The roar: louder and a little higher with thrust.
        if (on)
        {
            if (!_roar.Playing) _roar.Play();
            _roar.GlobalPosition = Nozzle;
            _roar.VolumeDb = Mathf.LinearToDb(Math.Max(0.0001f, (0.25f + 0.75f * p) * volume));
            _roar.PitchScale = 0.8f + 0.3f * p;
        }
        else if (_roar.Playing) _roar.Stop();
    }

    private float R(float a, float b) => a + (float)_rng.NextDouble() * (b - a);

    private void Emit(float dt, Exhaust ex, float p, float thin, World w)
    {
        var r = Rocket;
        var n = Nozzle;
        var d = ExhaustDir;
        var side = d.Cross(Vector3.Up);
        if (side.LengthSquared() < 0.01f) side = d.Cross(Vector3.Right);
        side = side.Normalized();
        var side2 = d.Cross(side).Normalized();
        Vector3 Disc(float rad) { float a = R(0, MathF.Tau), k = MathF.Sqrt(R(0, 1)) * rad; return side * MathF.Cos(a) * k + side2 * MathF.Sin(a) * k; }
        var carry = r.Body.Vel;

        _fireAcc += dt * 110f * p * ex.Density;
        while (_fireAcc >= 1f)
        {
            _fireAcc -= 1f;
            float along = R(0.5f, 6f);
            ex.Fire(n + d * along + Disc(0.9f), carry + d * R(55f, 95f) + Disc(8f), R(0.25f, 0.5f), R(1.2f, 1.8f), R(3f, 5.5f) * (1f + thin),
                new Color(1f, R(0.6f, 0.85f), R(0.22f, 0.4f)), 2.2f, 3f);
        }
        // Smoke: thick, white and lingering near the ground (the pad's water turns to steam); a thin trail up high.
        float agl = (float)(n.Y - LaunchComplex.Deck);
        bool low = agl < 60f;
        _smokeAcc += dt * (low ? 48f : 22f) * p * ex.Density * (1f - 0.7f * thin);
        while (_smokeAcc >= 1f)
        {
            _smokeAcc -= 1f;
            float g = low ? R(0.82f, 0.95f) : R(0.62f, 0.75f);
            ex.Smoke(n + d * R(3f, 10f) + Disc(1.5f), carry * 0.7f + d * R(30f, 55f) + Disc(6f), low ? R(9f, 16f) : R(4f, 7f),
                R(2.5f, 4f), low ? R(12f, 22f) : R(6f, 10f), new Color(g, g, g * 0.98f), low ? 0.6f : 0.35f, 1.1f, R(1f, 3f));
        }
    }
}

/// <summary>A piece of wreckage: its mesh, and smoke while it burns.</summary>
public sealed partial class WreckView : Node3D
{
    public Wreck Wreck;
    private ShaderMaterial _mat;
    private float _acc;
    private readonly Random _rng = new();

    public override void _Ready()
    {
        _mat = new ShaderMaterial { Shader = GD.Load<Shader>("res://shaders/entity.gdshader") };
        AddChild(new MeshInstance3D { Mesh = RocketModel.Piece(Wreck.Look, Wreck.Size), MaterialOverride = _mat, CastShadow = GeometryInstance3D.ShadowCastingSetting.Off });
    }

    public void Sync(float dt, World w, Exhaust ex)
    {
        var b = Wreck.Body;
        Transform = new Transform3D(new Basis(b.Rot), b.Position);
        byte l = w.GetLight(V.FloorToInt(b.X), V.FloorToInt(b.Y + 0.5), V.FloorToInt(b.Z));
        _mat.SetShaderParameter("light_level", new Vector2((l >> 4) / 15f, (l & 15) / 15f));
        // Scorched: darker the longer it burned.
        _mat.SetShaderParameter("tint", new Color(0.55f, 0.52f, 0.5f));
        if (Wreck.Burning > 0f)
        {
            Wreck.Burning -= dt;
            _acc += dt * 7f * ex.Density;
            while (_acc >= 1f)
            {
                _acc -= 1f;
                float R(float a, float c) => a + (float)_rng.NextDouble() * (c - a);
                float g = R(0.1f, 0.22f);
                ex.Smoke(b.Position + ex.Jitter(0.6f), new Vector3(R(-1, 1), R(2, 4), R(-1, 1)), R(4f, 8f), R(1f, 1.6f), R(4f, 8f), new Color(g, g, g), 0.6f, 0.8f, 2f);
                if (_rng.NextDouble() < 0.5)
                    ex.Fire(b.Position + ex.Jitter(0.5f), new Vector3(R(-0.5f, 0.5f), R(1.5f, 3f), R(-0.5f, 0.5f)), R(0.3f, 0.6f), R(0.8f, 1.2f), R(1.5f, 2.2f),
                        new Color(1f, R(0.45f, 0.7f), 0.15f), 1f, 3f);
            }
        }
    }
}
