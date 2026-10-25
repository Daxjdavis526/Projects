using System;
using Godot;

namespace Strata;

/// <summary>
/// What lies past Gargantua's event horizon: a place outside the world, built
/// out of four-dimensional space. Crossing the horizon (in a rocket, or
/// flying in creative) brings you here: a few seconds' fall through the
/// horizon, a white flash, then the tesseract — an endless lattice of
/// hypercube cells, seen as a slice that turns through the fourth dimension,
/// with four-dimensional solids tumbling in its cells and a great hypercube
/// turning itself inside out around you. You fall through it slowly, for as
/// long as you like.
///
/// Mouse looks round; WASD drift; Space and Shift rise and sink; Q and E (or
/// the mouse wheel) move you along the fourth axis, which changes everything
/// you see; F lets the tesseract fold shut, and it puts you back in the world
/// where you began — later: the tesseract stands outside time, and the
/// world's clock jumps on a minute for every second you spent in it.
///
/// The world itself is hidden from the camera meanwhile (its cull mask shows
/// only this node's sphere), and the player is frozen where they crossed.
/// </summary>
public sealed partial class Tesseract : Node3D
{
    public const uint Layer = 1u << 19;
    public const float EntrySeconds = 7f, CloseSeconds = 3.2f;
    /// <summary>Seconds that pass in the world for each second spent in here.</summary>
    public const float OutsideRate = 60f;

    public Game Game;
    public bool Active { get; private set; }
    public bool Closing { get; private set; }
    public float Time { get; private set; }               // seconds since crossing
    public Vector3 Eye;                                    // where you are in the tesseract's own space
    public float W;                                        // and along its fourth axis
    /// <summary>Show the key hints (screenshot tools turn them off).</summary>
    public bool Hints = true;

    private MeshInstance3D _dome;
    private ShaderMaterial _mat;
    private uint _savedMask;
    private Vector3 _vel, _hero;
    private float _wVel, _close, _veil, _tumble;
    private CanvasLayer _overlay;
    private ColorRect _white;
    private Label _hint;
    private float _hintTime;
    private AudioStreamPlayer _drone;
    private readonly Vector4[] _corners = Hyper.Corners();
    private readonly Vector3[] _projected = new Vector3[16];

    public override void _Ready()
    {
        _mat = new ShaderMaterial { Shader = GD.Load<Shader>("res://shaders/tesseract.gdshader") };
        _dome = new MeshInstance3D
        {
            Mesh = new SphereMesh { Radius = 40f, Height = 80f, RadialSegments = 32, Rings = 16, Material = _mat },
            CastShadow = GeometryInstance3D.ShadowCastingSetting.Off,
            ExtraCullMargin = 16384f,
            Layers = Layer,
            Visible = false,
        };
        AddChild(_dome);

        _overlay = new CanvasLayer { Layer = 8 };
        AddChild(_overlay);
        _white = new ColorRect { Color = new Color(1f, 0.97f, 0.92f, 0f), MouseFilter = Control.MouseFilterEnum.Ignore };
        _white.SetAnchorsPreset(Control.LayoutPreset.FullRect);
        _overlay.AddChild(_white);
        _hint = UiStyle.Label("", 17, new Color(1f, 0.93f, 0.8f), HorizontalAlignment.Center);
        _hint.SetAnchorsPreset(Control.LayoutPreset.BottomWide);
        _hint.OffsetTop = -96; _hint.OffsetBottom = -40;
        _hint.AutowrapMode = TextServer.AutowrapMode.WordSmart;
        _hint.MouseFilter = Control.MouseFilterEnum.Ignore;
        _overlay.AddChild(_hint);

        _drone = new AudioStreamPlayer { Stream = SoundBank.Get("tesseract_drone"), VolumeDb = -80f };
        AddChild(_drone);
    }

    // --- in and out ---------------------------------------------------------------------------

    /// <summary>Through the horizon: the world goes, the fall begins.</summary>
    public void Enter()
    {
        if (Active) return;
        var g = Game;
        var p = g.Player;
        Active = true;
        Closing = false;
        Time = 0f;
        _close = 0f;
        Eye = Vector3.Zero;
        W = 0f;
        _vel = new Vector3(0, -30f, 0);
        _wVel = 0f;
        _hero = new Vector3(0, -20f, 0);
        _tumble = 0f;
        g.CloseScreen();
        p.Flying = false;
        p.Frozen = true;
        p.Body.Vel = Vector3.Zero;
        p.Pitch = -35f;                                    // looking down the way you fall
        _savedMask = p.Camera.CullMask;
        p.Camera.CullMask = Layer;
        p.Camera.Near = 0.05f;
        p.Camera.Far = 400f;
        p.Camera.Fov = g.Settings.Fov;
        _dome.Visible = true;
        g.Hud.Visible = false;
        MusicPlayer.I?.Hold();
        Sfx.Ui("horizon", 0.9f);
        if (_drone.Stream != null) { _drone.VolumeDb = -40f; _drone.Play(); }
        _hint.Text = "";
        _hintTime = 0f;
        GD.Print("tesseract: entered");
    }

    /// <summary>F: the tesseract folds shut, and puts you back.</summary>
    public void Close()
    {
        if (!Active || Closing || Time < EntrySeconds) return;
        Closing = true;
        _close = 0f;
        Sfx.Ui("tesseract_fold", 0.9f);
    }

    private void Leave()
    {
        var g = Game;
        var p = g.Player;
        Active = false;
        Closing = false;
        _dome.Visible = false;
        p.Camera.CullMask = _savedMask;
        p.Camera.Far = 2400f;
        g.Hud.Visible = !g.HudHidden;
        _drone.Stop();
        _hint.Text = "";
        _veil = 1f;
        double outside = Time * OutsideRate;
        MusicPlayer.I?.Release(20f);
        GD.Print($"tesseract: left after {Time:0.0} s; {outside:0} s passed outside");
        g.ReturnFromTesseract(outside);
    }

    // --- each frame ---------------------------------------------------------------------------

    /// <summary>Runs the fall (called by the game while it is not paused).</summary>
    public void Step(float dt)
    {
        if (!Active) return;
        Time += dt;
        var g = Game;
        var p = g.Player;
        bool blocked = g.InputBlocked;

        if (Closing)
        {
            _close += dt / CloseSeconds;
            if (_close >= 1f) { Leave(); return; }
        }

        // Drifting: the keys push you through the lattice relative to where you look, and you keep falling.
        var look = Basis.FromEuler(new Vector3(Mathf.DegToRad(p.Pitch), Mathf.DegToRad(p.Yaw), 0), EulerOrder.Yxz);
        var wish = Vector3.Zero;
        if (!blocked && Time > EntrySeconds)
        {
            var mv = Input.GetVector("move_left", "move_right", "move_forward", "move_back");
            wish = look * new Vector3(mv.X, 0, mv.Y) * 7f;
            if (Input.IsActionPressed("jump")) wish.Y += 5f;
            if (Input.IsActionPressed("sneak")) wish.Y -= 5f;
            float wIn = (Input.IsPhysicalKeyPressed(Key.E) ? 1f : 0f) - (Input.IsPhysicalKeyPressed(Key.Q) ? 1f : 0f);
            _wVel = Mathf.Lerp(_wVel, wIn * 1.6f, 1f - MathF.Exp(-dt * 3f));
        }
        else _wVel *= MathF.Exp(-dt * 3f);
        float fall = Time < EntrySeconds ? Mathf.Lerp(30f, 3.2f, Smooth.Step(0f, EntrySeconds, Time)) : 3.2f + 0.8f * MathF.Sin(Time * 0.21f);
        var target = wish + new Vector3(0, -fall, 0);
        _vel = _vel.Lerp(target, 1f - MathF.Exp(-dt * 1.8f));
        Eye += _vel * dt;
        W += (_wVel + 0.06f * MathF.Sin(Time * 0.09f)) * dt;

        // The great hypercube drifts after you, a little behind.
        _hero = _hero.Lerp(Eye + new Vector3(0, -6f, 0), 1f - MathF.Exp(-dt * 0.35f));
        var spin = Hyper.Double(Time, 0.23, 0.13);
        float size = 10f + 2f * MathF.Sin(Time * 0.17f);
        for (int i = 0; i < 16; i++) _projected[i] = _hero + Hyper.Project(spin.Apply(_corners[i]), 3.2f) * size;

        // The view: your own look, with a slow tumble, as there is no up in here.
        _tumble += dt;
        float roll = 0.22f * MathF.Sin(_tumble * 0.13f) + 0.1f * MathF.Sin(_tumble * 0.31f + 1f);
        var cam = p.Camera;
        cam.GlobalTransform = new Transform3D(look * new Basis(Vector3.Back, roll), cam.GlobalPosition);
        cam.Fov = g.Settings.Fov * (Time < EntrySeconds ? 1f + 0.35f * Smooth.Step(EntrySeconds * 0.3f, EntrySeconds * 0.62f, Time) * (1f - Smooth.Step(EntrySeconds * 0.62f, EntrySeconds, Time)) : 1f)
            * (1f + 0.25f * _close * _close);
        _dome.GlobalPosition = cam.GlobalPosition;

        _mat.SetShaderParameter("eye", Eye);
        _mat.SetShaderParameter("wpos", W);
        _mat.SetShaderParameter("t", Time);
        _mat.SetShaderParameter("entry", Math.Clamp(Time / EntrySeconds, 0f, 1f));
        _mat.SetShaderParameter("collapse", _close);
        _mat.SetShaderParameter("rot4", Hyper.Slice(Time + W * 0.6).ToProjection());
        _mat.SetShaderParameter("spin_a", Hyper.Double(Time, 0.41, 0.27).ToProjection());
        _mat.SetShaderParameter("spin_b", Hyper.Double(Time, -0.33, 0.52, 1.3).ToProjection());
        _mat.SetShaderParameter("hero", _projected);
        _mat.SetShaderParameter("quality", g.Settings.Graphics / 2f);

        // The drone swells in, and thins as it folds.
        if (_drone.Playing)
        {
            float v = Math.Min(1f, Time / 4f) * (1f - _close) * 0.75f * g.Settings.MasterVolume;
            _drone.VolumeDb = Mathf.LinearToDb(Math.Max(0.0001f, v));
        }

        // Hints, once the lattice has opened.
        if (Time > EntrySeconds + 1f && _hintTime < 1f)
        {
            _hintTime = 1f;
            _hint.Text = "Inside the tesseract.  Mouse: look  ·  WASD: drift  ·  Space / Shift: rise, sink  ·  Q / E: move through the fourth dimension  ·  F: let it fold shut";
        }
        if (_hintTime > 0f) { _hintTime += dt; _hint.Modulate = new Color(1, 1, 1, Math.Clamp(1f - (_hintTime - 14f) / 3f, 0f, 1f)); }
        _hint.Visible = Hints;
    }

    public override void _UnhandledInput(InputEvent e)
    {
        if (!Active || Game == null || Game.InputBlocked) return;
        if (e is InputEventKey k && k.Pressed && !k.Echo && k.PhysicalKeycode == Key.F) { Close(); GetViewport().SetInputAsHandled(); }
        if (e is InputEventMouseButton mb && mb.Pressed)
        {
            if (mb.ButtonIndex == MouseButton.WheelUp) W += 0.35f;
            if (mb.ButtonIndex == MouseButton.WheelDown) W -= 0.35f;
        }
    }

    public override void _Process(double delta)
    {
        float dt = (float)Math.Min(delta, 0.25);
        // The white of crossing over (and of coming back, held until the world is ready, then fading).
        float a;
        if (Active) a = Smooth.Step(0.8f, 1f, _close);          // the crossing's own flash is in the shader
        else
        {
            if (Game != null && Game.State == GameState.Loading && _veil > 0f) _veil = 1f;
            else _veil = Math.Max(0f, _veil - dt / 2.5f);
            a = _veil;
        }
        _white.Color = new Color(1f, 0.97f, 0.92f, a);
        _white.Visible = a > 0.001f;
    }
}
