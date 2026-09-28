using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// Runs every vehicle in the world and connects them to the rest of the
/// game: steps their physics, draws them, lets the player climb in and out
/// and fly them, turns the pilot's keys into commands, points the camera,
/// plays the countdown, the roar and the bang, blows a crater and throws
/// wreckage when something is destroyed, burns whatever stands in an exhaust,
/// lights the ground with the flame, and saves it all with the world.
/// </summary>
public sealed partial class VehicleManager : Node3D
{
    public Game Game;
    public readonly List<Vehicle> All = new();
    private readonly Dictionary<Vehicle, Node3D> _views = new();
    public Exhaust Exhaust;

    public enum CamMode { Chase, Cockpit, Tower }
    public CamMode Cam = CamMode.Chase;
    private float _camDist = 70f;
    public Rocket HatchTarget { get; private set; }
    public Rocket Riding => Game?.Player?.Riding as Rocket;

    private readonly List<AudioStreamPlayer3D> _big = new();
    private int _nextBig;
    private float _flash, _flashMax, _flashReach;
    private Vector3 _flashPos;
    private float _shake, _exhaustTick;
    private readonly Random _rng = new();

    /// <summary>Where a rocket stands on the pad (its reference point), if this world has one.</summary>
    public Vector3? Pad => Game?.World?.Gen.Landmarks is LandmarkSite s ? s.PadWorld : null;

    public override void _Ready()
    {
        Exhaust = new Exhaust { Name = "Exhaust", World = Game.World };
        AddChild(Exhaust);
        for (int i = 0; i < 6; i++)
        {
            var p = new AudioStreamPlayer3D { UnitSize = 60f, MaxDistance = 3000f, AttenuationModel = AudioStreamPlayer3D.AttenuationModelEnum.InverseDistance, Bus = "Master" };
            AddChild(p);
            _big.Add(p);
        }
    }

    /// <summary>A sound heard a long way off: an engine lighting, clamps letting go, an explosion.</summary>
    private void PlayBig(string name, Vector3 at, float volume, float pitch = 1f)
    {
        var s = SoundBank.Get(name);
        if (s == null) return;
        var p = _big[_nextBig];
        _nextBig = (_nextBig + 1) % _big.Count;
        p.Stream = s;
        p.GlobalPosition = at;
        p.VolumeDb = Mathf.LinearToDb(Math.Max(0.0001f, volume * (Sfx.I?.Volume ?? 1f)));
        p.PitchScale = pitch;
        p.Play();
    }

    // --- the fleet --------------------------------------------------------------------------

    public T Add<T>(T v) where T : Vehicle
    {
        All.Add(v);
        Node3D view = v switch
        {
            Rocket r => new RocketView { Rocket = r, Name = "Rocket" },
            Wreck w => new WreckView { Wreck = w, Name = "Wreck" },
            _ => null,
        };
        if (view != null) { AddChild(view); _views[v] = view; }
        return v;
    }

    private void Remove(Vehicle v)
    {
        All.Remove(v);
        if (_views.TryGetValue(v, out var view)) { view.QueueFree(); _views.Remove(v); }
    }

    /// <summary>A fresh rocket on the pad, clamped down and fuelled.</summary>
    public Rocket RollOut()
    {
        if (Pad is not Vector3 pad) return null;
        var r = new Rocket();
        r.Place(pad, Quaternion.Identity);
        r.Clamps.Engage(r);
        Add(r);
        if (Game.Meta != null) Game.Meta.RocketRolledOut = true;
        return r;
    }

    /// <summary>The rocket standing on the pad (clamped, or at least close to where it should stand).</summary>
    public Rocket OnPad()
    {
        if (Pad is not Vector3 pad) return null;
        foreach (var v in All)
            if (v is Rocket r && !r.Destroyed && (r.Origin - pad).Length() < 6f) return r;
        return null;
    }

    /// <summary>The launch console: roll out a rocket if the pad is empty, otherwise fuel and check the one there.</summary>
    public void UseConsole()
    {
        var hud = Game.Hud;
        var r = OnPad();
        if (r == null)
        {
            if (RollOut() == null) { hud.Toast("This console is not connected to a pad", UiStyle.Bad); return; }
            hud.Toast("A new rocket stands on the pad, fuelled and clamped.", UiStyle.Accent);
            hud.Toast("Climb the tower to the crew arm (24 m) and right-click the hatch to board.", UiStyle.TextDim);
            Sfx.Ui("beep_go", 0.5f);
            return;
        }
        if (r.Phase is FlightPhase.Countdown or FlightPhase.Flight) { hud.Toast("Not while it is " + (r.Phase == FlightPhase.Countdown ? "counting down" : "flying"), UiStyle.Bad); return; }
        if (!r.Clamped) { r.Place(Pad.Value, Quaternion.Identity); r.Clamps.Engage(r); }
        r.Refuel();
        r.Phase = FlightPhase.Safe;
        hud.Toast($"Rocket refuelled and checked: {r.Tank.Capacity / 1000:0} t of propellant, hull sound. Board from the crew arm.", UiStyle.Good);
        Sfx.Ui("beep", 0.5f);
    }

    // --- boarding ---------------------------------------------------------------------------

    public void Board(Rocket r)
    {
        var p = Game.Player;
        if (r.Seat.Occupant != null || p.Riding != null) return;
        r.Seat.Occupant = p;
        p.Riding = r;
        Cam = CamMode.Chase;
        // Look at the rocket from the side away from the tower (south-west of it), a little from above.
        p.Yaw = -60f;
        p.Pitch = -8f;
        Sfx.Play("door_close", p.EyePosition, 0.8f, 0.7f);
        var hud = Game.Hud;
        if (r.Clamped && r.Phase == FlightPhase.Safe)
        {
            hud.Toast("Aboard. R arms, G starts the countdown, B aborts. F to climb out.", UiStyle.Accent);
            hud.Toast("Shift/Ctrl throttle · W/S A/D steer · Q/E roll · T assist · V camera · H help", UiStyle.TextDim);
        }
        else hud.Toast("Aboard. Space lights the engine. H for the controls.", UiStyle.Accent);
    }

    /// <summary>Takes the player out of whatever they ride and gives them back their own camera.</summary>
    public void Unseat()
    {
        var p = Game.Player;
        if (p.Riding is Rocket r) { r.Seat.Occupant = null; r.Stick = Vector3.Zero; }
        p.Riding = null;
        p.Camera.Far = 2400f;
        p.Camera.Near = 0.05f;
        p.Camera.Fov = Game.Settings.Fov;
    }

    public void Exit()
    {
        var p = Game.Player;
        if (p.Riding is not Rocket r) return;
        Unseat();
        var at = r.PointWorld(r.Seat.Exit);
        // Out onto the crew arm if there is one; otherwise wherever there is room.
        var w = Game.World;
        for (int up = 0; up < 6; up++)
        {
            var c = at + new Vector3(0, up, 0);
            if (!w.GetDef(V.FloorToInt(c.X), V.FloorToInt(c.Y), V.FloorToInt(c.Z)).Solid && !w.GetDef(V.FloorToInt(c.X), V.FloorToInt(c.Y + 1), V.FloorToInt(c.Z)).Solid) { at = c; break; }
        }
        p.Teleport(at);
        p.Body.Vel = r.Body.PointVelocity(at);
        p.Yaw = 90f;                 // facing back toward the hatch
        p.Pitch = 0f;
        Sfx.Play("door_open", at, 0.8f, 0.7f);
    }

    /// <summary>The rocket whose hatch the player is looking at and within reach of.</summary>
    private Rocket FindHatch()
    {
        var p = Game.Player;
        if (p.Riding != null || p.Dead) return null;
        var eye = p.Camera.GlobalPosition;
        var fwd = p.Forward;
        Rocket best = null;
        float bestD = 5.2f;
        foreach (var v in All)
        {
            if (v is not Rocket r || r.Destroyed || r.Seat.Occupant != null) continue;
            var h = r.PointWorld(r.Seat.Hatch);
            var d = h - eye;
            float along = d.Dot(fwd);
            if (along < 0.3f || along > bestD) continue;
            float off = (d - fwd * along).Length();
            if (off > 1.6f) continue;
            if (p.Target.Hit && p.Target.Distance < along - 1.2f) continue;     // a wall in the way
            best = r; bestD = along;
        }
        return best;
    }

    // --- the frame --------------------------------------------------------------------------

    public void Step(float dt)
    {
        var g = Game;
        var w = g.World;
        var player = g.Player;
        HatchTarget = FindHatch();

        if (Riding is Rocket ridden) Pilot(ridden, dt);

        for (int i = All.Count - 1; i >= 0; i--)
        {
            var v = All[i];
            v.Step(w, dt);
            if (v is Rocket r)
            {
                r.CheckDestroyed();
                HandleEvents(r);
                if (r.FrameImpact > 4f && !r.Destroyed) PlayBig("metal_crunch", r.PointWorld(Vector3.Zero), Math.Min(1f, r.FrameImpact / 15f), 0.7f);
                if (r.Destroyed) { Explode(r); continue; }
            }
            else if (v is Wreck wr)
            {
                wr.Age += dt;
                if (wr.FrameImpact > 6f) Sfx.Play("metal_crunch", wr.Body.Position, Math.Min(1f, wr.FrameImpact / 20f), 0.9f);
                if ((wr.Asleep && wr.Age > 60f && wr.Burning <= 0f) || wr.Body.Y < -40) { Remove(wr); continue; }
            }
        }
        // Wrecks beyond a sensible number go, oldest first.
        int wrecks = 0;
        for (int i = All.Count - 1; i >= 0; i--)
            if (All[i] is Wreck && ++wrecks > 48) Remove(All[i]);

        float vol = g.Settings.MasterVolume;
        foreach (var (v, view) in _views)
        {
            if (view is RocketView rv) rv.Sync(dt, w, Exhaust, vol);
            else if (view is WreckView wv) wv.Sync(dt, w, Exhaust);
        }

        if (_blasts.Count > 0) Craters();
        Burn(dt);
        Lights(dt);
        if (Riding is Rocket rr) Carry(rr, dt);
    }

    /// <summary>The pilot's hands: stick, throttle and switches, read each frame.</summary>
    private void Pilot(Rocket r, float dt)
    {
        var p = Game.Player;
        bool blocked = Game.InputBlocked || p.Dead;
        if (blocked) { r.Stick = Vector3.Zero; return; }
        // The stick is relative to the view: W pushes the nose away from you, D to your right.
        var up = r.Body.Up;
        var cam = p.Camera.GlobalTransform.Basis;
        var fwd = -cam.Z; fwd -= up * fwd.Dot(up);
        if (fwd.LengthSquared() < 1e-3f) fwd = r.Body.DirToWorld(Vector3.Right);
        fwd = fwd.Normalized();
        var right = fwd.Cross(up).Normalized();
        float pitch = Input.GetAxis("move_back", "move_forward");
        float yaw = Input.GetAxis("move_left", "move_right");
        float roll = (Input.IsPhysicalKeyPressed(Key.E) ? 1f : 0f) - (Input.IsPhysicalKeyPressed(Key.Q) ? 1f : 0f);
        r.Stick = up.Cross(fwd).Normalized() * pitch + up.Cross(right).Normalized() * yaw - up * roll;
        if (Input.IsActionPressed("sneak")) r.Throttle = Math.Min(1f, r.Throttle + dt * 0.6f);
        if (Input.IsActionPressed("sprint")) r.Throttle = Math.Max(0f, r.Throttle - dt * 0.6f);
    }

    public override void _UnhandledInput(InputEvent e)
    {
        if (Game == null || Riding is not Rocket r || Game.InputBlocked) return;
        if (e is InputEventMouseButton mb && mb.Pressed)
        {
            if (mb.ButtonIndex == MouseButton.WheelUp) _camDist = Math.Max(18f, _camDist * 0.88f);
            if (mb.ButtonIndex == MouseButton.WheelDown) _camDist = Math.Min(260f, _camDist * 1.14f);
        }
        if (e is not InputEventKey k || !k.Pressed || k.Echo) return;
        bool used = true;
        switch (k.PhysicalKeycode)
        {
            case Key.R: if (r.Phase == FlightPhase.Armed) r.Disarm(); else r.Arm(); break;
            case Key.G: r.Go(); break;
            case Key.B: r.Abort(); break;
            case Key.T: r.Sas = !r.Sas; Game.Hud.Toast(r.Sas ? "Stability assist on" : "Stability assist OFF: you are flying it by hand", r.Sas ? UiStyle.Text : UiStyle.Bad); break;
            case Key.V:
                Cam = (CamMode)(((int)Cam + 1) % 3);
                if (Cam == CamMode.Cockpit) { Game.Player.Yaw = -90f; Game.Player.Pitch = 10f; }
                Game.Hud.Toast(Cam switch { CamMode.Chase => "Chase camera", CamMode.Cockpit => "Capsule window", _ => "Pad camera" }, UiStyle.TextDim);
                break;
            case Key.F: Exit(); break;
            case Key.Space: r.ToggleEngine(); break;
            case Key.X: r.Throttle = 0f; if (!r.Clamped && r.Phase == FlightPhase.Flight) r.Abort(); break;
            case Key.Z: r.Throttle = 1f; break;
            case Key.H: FlightHud.ShowHelp = !FlightHud.ShowHelp; break;
            default: used = false; break;
        }
        if (used) GetViewport().SetInputAsHandled();
    }

    private void HandleEvents(Rocket r)
    {
        if (r.Events.Count == 0) return;
        bool aboard = Riding == r;
        float near = aboard ? 1f : Math.Clamp(1f - (Game.Player.Body.Position - r.Origin).Length() / 250f, 0f, 1f);
        foreach (var ev in r.Events)
        {
            switch (ev)
            {
                case "beep": if (near > 0) Sfx.Ui("beep", 0.6f * near); break;
                case "countdown": if (near > 0) Sfx.Ui("beep", 0.6f * near); break;
                case "armed": if (aboard) Sfx.Ui("switch", 0.8f); break;
                case "safe": if (aboard) Sfx.Ui("switch", 0.8f, 0.8f); break;
                case "ignition": PlayBig("rocket_ignite", r.PointWorld(Vector3.Zero), 1f); break;
                case "liftoff":
                    PlayBig("clamp_release", r.PointWorld(new Vector3(0, 2, 0)), 1f);
                    if (near > 0) Sfx.Ui("beep_go", 0.6f * near);
                    break;
                case "abort":
                case "fault":
                case "overload":
                    if (aboard) Sfx.Ui("alarm", 0.7f);
                    break;
                case "flameout": if (aboard) { Sfx.Ui("alarm", 0.5f, 0.8f); Game.Hud.Toast("Flame-out: the tanks are dry", UiStyle.Bad); } break;
                case "landed":
                    Sfx.Play("slam", r.Origin, 0.9f);
                    if (aboard) Game.Hud.Toast(r.Status, UiStyle.Good);
                    break;
            }
        }
        r.Events.Clear();
    }

    // --- the camera ---------------------------------------------------------------------------

    /// <summary>The rider goes where the seat goes; the camera follows as the chosen view says.</summary>
    private void Carry(Rocket r, float dt)
    {
        var p = Game.Player;
        var seat = r.PointWorld(r.Seat.Local);
        p.Body.Position = seat - new Vector3(0, 1f, 0);
        p.Body.Vel = r.Body.Vel;
        p.Body.FallDistance = 0;
        p.Position = p.Body.Position;
        var cam = p.Camera;
        float agl = (float)(r.Origin.Y - Game.World.Gen.GroundY(V.FloorToInt(r.Origin.X), V.FloorToInt(r.Origin.Z)));
        cam.Far = Math.Max(2400f, agl * 3f + 800f);
        var look = Basis.FromEuler(new Vector3(Mathf.DegToRad(p.Pitch), Mathf.DegToRad(p.Yaw), 0), EulerOrder.Yxz);
        var centre = r.PointWorld(new Vector3(0, 14f, 0));
        Transform3D t;
        switch (Cam)
        {
            case CamMode.Cockpit:
            {
                var eye = r.PointWorld(r.Seat.Local + new Vector3(0.9f, 0.9f, 0));
                t = new Transform3D(r.Body.Basis * look, eye);
                cam.Near = 0.05f;
                cam.Fov = Game.Settings.Fov;
                break;
            }
            case CamMode.Tower:
            {
                // A camera on a post near the pad, tracking the rocket and zooming as it climbs away.
                var post = (Pad ?? r.Origin) + new Vector3(-38f, 6f, 46f);
                var d = centre - post;
                t = new Transform3D(Basis.LookingAt(d.Normalized(), Vector3.Up), post);
                cam.Near = 0.2f;
                cam.Fov = Math.Clamp(2f * Mathf.RadToDeg(MathF.Atan(30f / Math.Max(1f, d.Length()))), 2f, Game.Settings.Fov);
                break;
            }
            default:
            {
                var back = look.Z;          // behind the view direction
                var want = centre + back * _camDist;
                // Do not put the camera inside a hill or the tower.
                var dir = (want - centre).Normalized();
                var hit = VoxelRay.Cast(Game.World, centre, dir, _camDist);
                if (hit.Hit) want = centre + dir * Math.Max(4f, hit.Distance - 1.5f);
                t = new Transform3D(look, want);
                cam.Near = 0.2f;
                cam.Fov = Game.Settings.Fov;
                break;
            }
        }
        // Shaking: the engine's rumble near the ground, and blasts.
        float rumble = r.Engine.Thrust / r.Engine.MaxThrust * Math.Clamp(1f - agl / 200f, 0.15f, 1f) * (Cam == CamMode.Cockpit ? 0.12f : 0.05f);
        float s = rumble + _shake;
        if (s > 0f) t.Origin += new Vector3(R(-1, 1), R(-1, 1), R(-1, 1)) * s;
        cam.GlobalTransform = t;
    }

    private float R(float a, float b) => a + (float)_rng.NextDouble() * (b - a);

    // --- fire and light ---------------------------------------------------------------------

    /// <summary>Anything standing in an exhaust gets burned.</summary>
    private void Burn(float dt)
    {
        _exhaustTick -= dt;
        if (_exhaustTick > 0f) return;
        _exhaustTick = 0.25f;
        foreach (var (v, view) in _views)
        {
            if (view is not RocketView rv || rv.Power < 0.05f) continue;
            var n = rv.Nozzle; var d = rv.ExhaustDir;
            float len = 8f + 18f * rv.Power;
            bool In(Vector3 p)
            {
                var o = p - n;
                float along = o.Dot(d);
                return along > -1f && along < len && (o - d * along).Length() < 2.5f + along * 0.35f;
            }
            var pl = Game.Player;
            if (pl.Riding == null && !pl.Dead && In(pl.Body.Position + new Vector3(0, 0.9f, 0)))
                pl.Vitals.Damage(3f * rv.Power + 1f, DamageKind.Exhaust);
            foreach (var m in Game.Mobs.All)
                if (!m.Dead && In(m.Position)) m.Hurt(4f * rv.Power + 1f, n, 3f, null);
        }
    }

    /// <summary>The one moving light: the nearest burning engine, or a blast's flash.</summary>
    private void Lights(float dt)
    {
        _shake = Math.Max(0f, _shake - dt * 1.5f);
        Vector3 pos = Vector3.Zero; float reach = 0f; var col = Colors.Black;
        if (_flash > 0f)
        {
            _flash = Math.Max(0f, _flash - dt);
            float k = _flash / _flashMax;
            pos = _flashPos; reach = _flashReach * (0.6f + 0.4f * k);
            col = new Color(1f, 0.55f, 0.22f) * (4f * k * k);
        }
        else
        {
            var cam = Game.Player.Camera.GlobalPosition;
            float best = float.MaxValue;
            foreach (var (v, view) in _views)
            {
                if (view is not RocketView rv || rv.Power < 0.02f) continue;
                float d = (rv.Nozzle - cam).LengthSquared();
                if (d >= best) continue;
                best = d;
                float flick = 0.9f + 0.1f * MathF.Sin(Time.GetTicksMsec() / 23f) * MathF.Sin(Time.GetTicksMsec() / 37f);
                pos = rv.Nozzle + rv.ExhaustDir * 6f;
                reach = 38f + 30f * rv.Power;
                col = new Color(1f, 0.58f, 0.25f) * (2.2f * rv.Power * flick);
            }
        }
        RenderingServer.GlobalShaderParameterSet("dyn_light_pos", new Vector4(pos.X, pos.Y, pos.Z, reach));
        RenderingServer.GlobalShaderParameterSet("dyn_light_col", new Vector4(col.R, col.G, col.B, 1f));
    }

    // --- destruction ------------------------------------------------------------------------

    private void Explode(Rocket r)
    {
        var g = Game;
        var pl = g.Player;
        // Broken on the ground, it bursts where it hit; broken up in the air, where the tank is.
        var tank = r.PointWorld(r.Tank.Local);
        var c = r.FrameImpact > 0f ? r.FrameImpactPoint - new Vector3(0, 0.5f, 0) : tank;
        float radius = r.BlastRadius;
        bool aboard = pl.Riding == r;
        if (aboard) { Unseat(); pl.Teleport(r.PointWorld(r.Seat.Local)); }

        // The crater (later, if the ground there has not loaded yet).
        _blasts.Add((c, radius, (ulong)g.Clock.GetHashCode()));
        Craters();

        // Fire, smoke, sparks, light and noise.
        Exhaust.Blast(c, radius, r.Body.Vel);
        g.Particles.Burst(c, new Color(1f, 0.8f, 0.4f), 60, 30f, 0.18f, 10f, 1.4f, true);
        PlayBig("explosion", c, 1f, 0.9f + 0.2f * (float)_rng.NextDouble());
        _flash = _flashMax = 1.8f; _flashPos = c; _flashReach = 40f + radius * 8f;
        float camD = (pl.Camera.GlobalPosition - c).Length();
        _shake = Math.Max(_shake, Math.Clamp(1.2f - camD / 150f, 0f, 1.2f));

        // Everything nearby is hurt and thrown.
        float Hit(Vector3 at) => Explosions.Falloff((at - c).Length(), radius * 1.6f);
        if (!pl.Dead)
        {
            float k = Hit(pl.Body.Position + new Vector3(0, 0.9f, 0));
            if (k > 0f)
            {
                pl.Vitals.Damage(aboard ? 1000f : 34f * k, aboard ? DamageKind.Crash : DamageKind.Blast, ignoreInvuln: true);
                pl.Knockback(c, 22f * k);
            }
        }
        foreach (var m in g.Mobs.All)
        {
            float k = Hit(m.Position);
            if (k > 0f && !m.Dead) m.Hurt(40f * k, c, 20f * k, null);
        }
        foreach (var v in All)
        {
            if (v == r) continue;
            var o = v.Body.Position - c;
            float k = Hit(v.Body.Position);
            if (k <= 0f) continue;
            v.Impulse(o.Normalized() * v.Body.Mass * 30f * k, v.Body.Position + new Vector3(0, 0.3f, 0));
            if (v is Rocket other) other.Damage(90f * k, "caught in a blast");
        }

        // Wreckage: the rocket comes apart into its main pieces and a scatter of panels.
        var rot = r.Body.Rot;
        void Piece(string look, Vector3 size, float mass, Vector3 local, float speed)
        {
            var wr = new Wreck(look, size, mass);
            var at = r.PointWorld(local);
            wr.Place(at, rot * new Quaternion(new Vector3(R(-1, 1), R(-1, 1), R(-1, 1)).Normalized(), R(0f, 0.6f)));
            var o = (at - c); o = o.LengthSquared() < 0.01f ? Vector3.Up : o.Normalized();
            wr.Body.Vel = r.Body.Vel * 0.6f + (o + new Vector3(R(-0.5f, 0.5f), R(0.2f, 1f), R(-0.5f, 0.5f))).Normalized() * speed;
            wr.Body.AngVel = new Vector3(R(-3, 3), R(-3, 3), R(-3, 3));
            wr.Burning = R(6f, 22f);
            // Push it clear of the ground so it does not start inside a block.
            if (g.World.GetDef(V.FloorToInt(at.X), V.FloorToInt(at.Y), V.FloorToInt(at.Z)).Solid) wr.Body.Y += 1.5f;
            Add(wr);
        }
        float kick = 10f + radius * 3f;
        Piece("engine", new Vector3(2.6f, 2.8f, 2.6f), 3500f, new Vector3(0, 1.9f, 0), kick * 0.5f);
        Piece("tank_lower", new Vector3(3.4f, 5f, 3.4f), 3000f, new Vector3(0, 8f, 0), kick * 0.6f);
        Piece("tank_upper", new Vector3(3.4f, 4.5f, 3.4f), 2500f, new Vector3(0, 18f, 0), kick * 0.7f);
        Piece("capsule", new Vector3(3.4f, 5f, 3.4f), 5500f, new Vector3(0, 26.5f, 0), kick * 0.8f);
        for (int f = 0; f < 4; f++)
        {
            float a = MathF.PI / 4 + f * MathF.PI / 2;
            Piece("fin", new Vector3(2.8f, 5f, 0.3f), 400f, new Vector3(MathF.Cos(a) * 2.9f, 3f, MathF.Sin(a) * 2.9f), kick);
        }
        for (int i = 0; i < 8; i++)
            Piece(i % 3 == 0 ? "plate_dark" : "plate", new Vector3(R(0.8f, 1.6f), 0.18f, R(0.6f, 1.2f)), 120f, new Vector3(R(-1.5f, 1.5f), R(4f, 24f), R(-1.5f, 1.5f)), kick * 1.4f);

        if (aboard || camD < 300f)
            g.Hud.Toast(aboard ? $"The rocket {r.DestroyedBy}." : $"A rocket {r.DestroyedBy}.", UiStyle.Bad);
        Remove(r);
    }

    private readonly List<(Vector3 at, float r, ulong seed)> _blasts = new();
    /// <summary>Blocks blown away by all the blasts so far this session.</summary>
    public int BlocksBlasted { get; private set; }

    /// <summary>Digs the craters whose ground has loaded.</summary>
    private void Craters()
    {
        var w = Game.World;
        for (int i = _blasts.Count - 1; i >= 0; i--)
        {
            var (c, r, seed) = _blasts[i];
            bool ready = true;
            for (int z = V.FloorToInt(c.Z - r) - 1; z <= V.FloorToInt(c.Z + r) + 1 && ready; z += 4)
                for (int x = V.FloorToInt(c.X - r) - 1; x <= V.FloorToInt(c.X + r) + 1 && ready; x += 4)
                    ready = w.IsReady(x, z);
            if (!ready) continue;
            _blasts.RemoveAt(i);
            var res = Explosions.Blast(w, c, r, seed);
            BlocksBlasted += res.Removed.Count;
            int shown = 0;
            foreach (var (cell, id) in res.Removed)
                if ((shown++ & 7) == 0) Game.Particles.BlockBreak(cell.X, cell.Y, cell.Z, id);
        }
    }

    // --- saving -----------------------------------------------------------------------------

    public void Save(WorldMeta meta)
    {
        meta.Vehicles.Clear();
        foreach (var v in All)
        {
            var b = v.Body;
            var o = v.Origin;
            var s = new VehicleSave
            {
                Kind = v.Kind, X = o.X, Y = o.Y, Z = o.Z,
                Qx = b.Rot.X, Qy = b.Rot.Y, Qz = b.Rot.Z, Qw = b.Rot.W,
                Vx = b.Vel.X, Vy = b.Vel.Y, Vz = b.Vel.Z, Wx = b.AngVel.X, Wy = b.AngVel.Y, Wz = b.AngVel.Z,
                Health = v.Health,
            };
            if (v is Rocket r)
            {
                s.Fuel = r.Tank.Amount; s.Throttle = r.Throttle; s.Sas = r.Sas; s.Clamped = r.Clamped;
                s.Occupied = r.Seat.Occupant != null;
                // A countdown does not survive a reload: it comes back safe on the pad.
                s.Phase = (int)(r.Phase == FlightPhase.Countdown ? FlightPhase.Safe : r.Phase);
            }
            else if (v is Wreck w)
            {
                if (w.Age > 40f) continue;
                s.Look = w.Look; s.Sx = w.Size.X; s.Sy = w.Size.Y; s.Sz = w.Size.Z; s.Health = 0;
            }
            meta.Vehicles.Add(s);
        }
    }

    public void Load(WorldMeta meta)
    {
        foreach (var s in meta.Vehicles)
        {
            var rot = new Quaternion(s.Qx, s.Qy, s.Qz, s.Qw).Normalized();
            var origin = new Vector3((float)s.X, (float)s.Y, (float)s.Z);
            Vehicle v;
            if (s.Kind == "rocket")
            {
                var r = new Rocket();
                r.Tank.Amount = Math.Clamp(s.Fuel, 0f, r.Tank.Capacity);
                r.Place(origin, rot);
                r.Throttle = s.Throttle; r.Sas = s.Sas;
                r.Health = Math.Clamp(s.Health, 1f, r.MaxHealth);
                r.Phase = (FlightPhase)s.Phase;
                if (s.Clamped) r.Clamps.Engage(r); else r.Clamps.Release();
                v = r;
                Add(r);
                if (s.Occupied && Game.Player.Riding == null) Board(r);
            }
            else if (s.Kind == "wreck")
            {
                var w = new Wreck(s.Look ?? "plate", new Vector3(s.Sx, s.Sy, s.Sz), 500f);
                w.Place(origin, rot);
                v = w;
                Add(w);
            }
            else continue;
            v.Body.Vel = new Vector3(s.Vx, s.Vy, s.Vz);
            v.Body.AngVel = new Vector3(s.Wx, s.Wy, s.Wz);
        }
        // A showcase world starts with a rocket on the pad.
        if (!meta.RocketRolledOut && Pad != null) RollOut();
    }
}
