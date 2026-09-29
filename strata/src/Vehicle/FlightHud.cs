using System;
using Godot;

namespace Strata;

/// <summary>
/// The instruments while flying: altitude, climb rate, speed, throttle and
/// engine state, propellant, mass and thrust-to-weight, g-load, dynamic
/// pressure, hull, clamps and assist; once free of the pad, the orbit (its
/// highest and lowest points, the sideways speed an orbit needs, the time a
/// lap takes); a tilt indicator that shows where the nose and the flight path
/// point; the countdown; and warnings. Out of the seat it only offers the
/// hatch. Everything shown is read straight from the simulation.
/// </summary>
public sealed partial class FlightHud : Control
{
    public Game Game;
    public static bool ShowHelp;
    private Font _font;
    private float _blink;

    private static readonly Color Ink = new(0.86f, 0.95f, 0.88f);
    private static readonly Color Dim = new(0.55f, 0.66f, 0.6f);
    private static readonly Color Warn = new(1f, 0.72f, 0.25f);
    private static readonly Color Alarm = new(1f, 0.3f, 0.25f);
    private static readonly Color Back = new(0.02f, 0.05f, 0.04f, 0.62f);

    public override void _Ready()
    {
        UiStyle.FillParent(this);
        MouseFilter = MouseFilterEnum.Ignore;
        Theme = UiStyle.Theme;
        _font = GetThemeFont("font", "Label") ?? ThemeDB.FallbackFont;
    }

    public override void _Process(double delta)
    {
        _blink += (float)delta;
        QueueRedraw();
    }

    private void Text(Vector2 at, string s, int size, Color c, HorizontalAlignment align = HorizontalAlignment.Left, float width = -1)
    {
        DrawString(_font, at + new Vector2(1.5f, 1.5f), s, align, width, size, new Color(0, 0, 0, 0.7f));
        DrawString(_font, at, s, align, width, size, c);
    }

    private void Bar(Vector2 at, float w, float frac, Color c)
    {
        DrawRect(new Rect2(at, new Vector2(w, 9)), new Color(1, 1, 1, 0.12f));
        DrawRect(new Rect2(at, new Vector2(w * Math.Clamp(frac, 0f, 1f), 9)), c);
    }

    public override void _Draw()
    {
        var g = Game;
        if (g?.Vehicles == null || g.HudHidden) return;
        var vp = GetViewportRect().Size;
        var p = g.Player;
        if (p.Riding is not Rocket r)
        {
            if (g.Vehicles.HatchTarget is Rocket h && !g.InputBlocked)
                Text(new Vector2(0, vp.Y / 2 + 44), $"Right-click: board the rocket  ·  propellant {h.Tank.Fraction * 100:0}%  ·  hull {h.Health:0}%",
                    18, UiStyle.Accent, HorizontalAlignment.Center, vp.X);
            return;
        }
        if (g.InputBlocked && g.Paused) return;

        bool blinkOn = (_blink % 0.8f) < 0.5f;
        var b = r.Body;
        float alt = r.Altitude;
        float ground = g.World.Gen.GroundY(V.FloorToInt(r.Origin.X), V.FloorToInt(r.Origin.Z));
        var chunk = g.World.ChunkAt(V.FloorToInt(r.Origin.X), V.FloorToInt(r.Origin.Z));
        if (chunk != null && chunk.State >= ChunkState.Generated) ground = g.World.HeightAt(V.FloorToInt(r.Origin.X), V.FloorToInt(r.Origin.Z));
        float agl = alt - ground;
        float vs = b.Vel.Y;
        var e = r.Engine;

        // --- the left panel: numbers ---
        bool flying = r.Phase == FlightPhase.Flight && !r.Clamped;
        float x0 = 18, y = vp.Y * 0.16f, w = 350, line = 24;
        DrawRect(new Rect2(x0 - 10, y - 30, w, line * (flying ? 16 : 14) + 26), Back);
        Text(new Vector2(x0, y - 6), PhaseName(r), 21, r.Phase == FlightPhase.Destroyed ? Alarm : UiStyle.Accent);
        y += line;
        void Row(string label, string value, Color? c = null)
        {
            Text(new Vector2(x0, y), label, 16, Dim);
            Text(new Vector2(x0 + 86, y), value, 18, c ?? Ink);
            y += line;
        }
        Row("ALTITUDE", $"{Dist(alt - LaunchComplex.Deck)}   ({Dist(agl)} above ground)");
        Row("CLIMB", $"{(vs >= 0 ? "+" : "")}{vs:0.0} m/s", vs < -25 && agl < 400 ? Alarm : null);
        Row("SPEED", $"{b.Vel.Length():0} m/s");
        Text(new Vector2(x0, y), "THROTTLE", 16, Dim);
        Bar(new Vector2(x0 + 86, y - 11), 120, r.Throttle, UiStyle.Accent);
        Text(new Vector2(x0 + 214, y), $"{r.Throttle * 100:0}%", 18, Ink);
        y += line;
        Row("ENGINE", EngineText(r), e.State == EngineState.Failed || e.Fault.Length > 0 && e.State == EngineState.Off ? Warn : e.Burning ? UiStyle.Good : null);
        float fuel = r.Tank.Fraction;
        Text(new Vector2(x0, y), "FUEL", 16, Dim);
        Bar(new Vector2(x0 + 86, y - 11), 120, fuel, fuel < 0.15f ? Alarm : new Color(0.5f, 0.85f, 0.95f));
        float burnLeft = e.MassFlow > 1f ? r.Tank.Amount / e.MassFlow : r.Tank.Amount / (e.MaxThrust * Math.Max(e.MinThrottle, r.Throttle) / e.ExhaustVelocity);
        Text(new Vector2(x0 + 214, y), $"{r.Tank.Amount / 1000:0.0} t  {burnLeft:0}s", 18, Ink);
        y += line;
        Row("MASS", $"{b.Mass / 1000:0.0} t    TWR {(e.Thrust > 0 ? e.Thrust / r.Weight : r.Twr):0.00}{(e.Thrust > 0 ? "" : " max")}");
        Row("G-LOAD", $"{r.GForce:0.00} g", r.GForce > 4 ? Warn : null);
        Row("AIR", $"q {r.Aero.DynamicPressure / 1000:0.0} kPa   AoA {Mathf.RadToDeg(r.Aero.AngleOfAttack):0}°",
            r.Aero.DynamicPressure * MathF.Sin(Math.Min(r.Aero.AngleOfAttack, MathF.PI / 2)) > Rocket.AeroLimit * 0.6f ? Warn : null);
        Text(new Vector2(x0, y), "HULL", 16, Dim);
        Bar(new Vector2(x0 + 86, y - 11), 120, r.Health / r.MaxHealth, r.Health < 50 ? Alarm : UiStyle.Good);
        Text(new Vector2(x0 + 214, y), $"{r.Health:0}%", 18, Ink);
        y += line;
        if (flying) OrbitRows(r, x0, ref y, line);
        else Row("CLAMPS", r.Clamped ? $"HELD   load {r.Clamps.Load / 1000:+0;-0} kN" : "released");
        Row("ASSIST", !r.Sas ? "OFF" : r.Mode switch
        {
            SasMode.Prograde => "PROGRADE: nose along the path",
            SasMode.Retrograde => "RETROGRADE: nose against it",
            _ => "on: holding attitude",
        }, r.Sas ? null : Warn);
        Row("MISSION", r.Phase == FlightPhase.Flight || r.Phase == FlightPhase.Landed ? $"T+{Clock(r.MissionTime)}   best {Dist(r.MaxAltitude - LaunchComplex.Deck)}" : "--");

        // --- top centre: the count, or the status ---
        string big = r.Phase == FlightPhase.Countdown ? (r.T > 0 ? $"T-{Math.Ceiling(r.T):0}" : "T-0") : r.Phase == FlightPhase.Flight && r.MissionTime < 4f ? "LIFT-OFF" : "";
        float top = vp.Y * 0.16f + 20;
        if (big != "") Text(new Vector2(0, top + 40), big, 54, r.T <= 3 && r.Phase == FlightPhase.Countdown ? UiStyle.Accent : Ink, HorizontalAlignment.Center, vp.X);
        if (r.Status != big && !r.Status.StartsWith("T-")) Text(new Vector2(0, top + (big != "" ? 76 : 20)), r.Status, 20, Ink, HorizontalAlignment.Center, vp.X);

        // --- warnings ---
        string warn = null;
        float load = r.Aero.DynamicPressure * MathF.Sin(Math.Min(r.Aero.AngleOfAttack, MathF.PI / 2));
        if (load > Rocket.AeroLimit) warn = "STRUCTURAL OVERLOAD: STRAIGHTEN UP";
        else if (!r.Clamped && agl < 250 && vs < -12 && vs * -4f > agl) warn = "SINK RATE";
        else if (!r.Clamped && r.Body.Up.Y < 0.2f && agl < 400 && r.Phase == FlightPhase.Flight) warn = "ATTITUDE";
        else if (r.Heat > 0.35f) warn = "RE-ENTRY HEATING";
        else if (flying && r.Path.Escaping && alt - V.SeaLevel > PhysicsWorld.SpaceLine * 0.5f)
            warn = e.Burning ? "ESCAPE SPEED: CUT THE ENGINE" : "LEAVING THE PLANET: BURN RETROGRADE";
        else if (fuel < 0.1f && fuel > 0 && e.Burning) warn = "LOW FUEL";
        else if (r.Health < 40) warn = "HULL DAMAGE";
        if (warn != null && blinkOn) Text(new Vector2(0, vp.Y * 0.33f), warn, 30, Alarm, HorizontalAlignment.Center, vp.X);

        DrawTilt(r, new Vector2(vp.X - 130, vp.Y * 0.2f + 110), 92f);

        // --- help ---
        string help = ShowHelp
            ? "R arm / disarm   G countdown   B abort   Space engine on/off   X cut throttle   Z full\n" +
              "Shift / Ctrl throttle up / down   W S A D steer (relative to the view)   Q E roll\n" +
              "T stability assist   P assist mode (hold, prograde, retrograde)   V camera   mouse wheel zoom\n" +
              "F climb out   H hide help"
            : "H: controls";
        var lines = help.Split('\n');
        for (int i = 0; i < lines.Length; i++)
            Text(new Vector2(0, vp.Y - 110 - (lines.Length - 1 - i) * 24), lines[i], 17, ShowHelp ? Ink : Dim, HorizontalAlignment.Center, vp.X);
    }

    /// <summary>
    /// The orbit, once off the pad: how high the path climbs and how low it
    /// comes down, and how close the sideways speed is to what an orbit at
    /// this height needs (a lap of the planet, once it is there).
    /// </summary>
    private void OrbitRows(Rocket r, float x0, ref float y, float line)
    {
        var o = r.Path;
        float vs = r.Body.Vel.Y;
        Text(new Vector2(x0, y), "HIGHEST", 16, Dim);
        if (o.Escaping) Text(new Vector2(x0 + 86, y), "none: leaving the planet", 18, Alarm);
        else
        {
            // (A circle has no highest point to wait for.)
            string when = o.Apoapsis - o.Periapsis < 200f ? "" : o.Stable || vs > 0f ? $"   in {Clock(o.TimeToApoapsis)}" : "   (passed)";
            Text(new Vector2(x0 + 86, y), $"{o.Apoapsis / 1000:0.0} km{when}", 18, Ink);
        }
        y += line;
        Text(new Vector2(x0, y), "LOWEST", 16, Dim);
        string low = o.Periapsis < 0f ? "under the ground: falls back"
            : o.Periapsis < PhysicsWorld.SpaceLine ? $"{o.Periapsis / 1000:0.0} km: in the air"
            : $"{o.Periapsis / 1000:0.0} km: clear of the air";
        Text(new Vector2(x0 + 86, y), low, 18, o.Periapsis >= PhysicsWorld.SpaceLine ? UiStyle.Good : o.Periapsis >= 0f ? Warn : Dim);
        y += line;
        Text(new Vector2(x0, y), "ORBIT", 16, Dim);
        float across = new Vector2(r.Body.Vel.X, r.Body.Vel.Z).Length();
        if (o.Stable)
        {
            Bar(new Vector2(x0 + 86, y - 11), 60, 1f, UiStyle.Good);
            Text(new Vector2(x0 + 154, y), $"lap {Clock(o.Period)}   done {r.Laps}", 18, UiStyle.Good);
        }
        else
        {
            Bar(new Vector2(x0 + 86, y - 11), 60, across / Math.Max(1f, o.CircularSpeed), o.Escaping ? Alarm : new Color(0.5f, 0.85f, 0.95f));
            Text(new Vector2(x0 + 154, y), $"{across:0} of {o.CircularSpeed:0} m/s level", 18, Ink);
        }
        y += line;
    }

    private static string Clock(float t) => $"{(int)(t / 60)}:{(int)(t % 60):00}";

    /// <summary>A height or distance: metres close to, kilometres further off.</summary>
    private static string Dist(float m) => MathF.Abs(m) >= 10000f ? $"{m / 1000:0.0} km" : $"{m:N0} m";

    private static string PhaseName(Rocket r) => r.Phase switch
    {
        FlightPhase.Safe => r.Clamped ? "ON THE PAD · SAFE" : "SAFE",
        FlightPhase.Armed => "ARMED",
        FlightPhase.Countdown => "COUNTDOWN",
        FlightPhase.Flight => r.Path.Escaping && PhysicsWorld.Altitude(r.Body.Y) > PhysicsWorld.SpaceLine ? "ESCAPE TRAJECTORY"
            : r.Path.Stable ? (r.Engine.Burning ? "IN ORBIT · BURNING" : "IN ORBIT")
            : r.Engine.Burning ? "POWERED FLIGHT"
            : PhysicsWorld.Altitude(r.Body.Y) > PhysicsWorld.SpaceLine ? "COASTING IN SPACE" : "COASTING",
        FlightPhase.Landed => "LANDED",
        _ => "DESTROYED",
    };

    private static string EngineText(Rocket r)
    {
        var e = r.Engine;
        string s = e.State switch
        {
            EngineState.Off => e.Fault.Length > 0 ? "off: " + e.Fault : "off",
            EngineState.Starting => "starting",
            EngineState.Running => "running",
            EngineState.Stopping => "shutting down",
            _ => "FAILED: " + e.Fault,
        };
        if (e.Thrust > 0) s += $"  {e.Thrust / 1e6f:0.00} MN";
        return s;
    }

    /// <summary>
    /// Looking down the rocket's axis from above: the centre is straight up,
    /// the rings are 30 and 60 degrees of tilt, the edge is level. The nose
    /// is the solid marker and the flight path the hollow one, both turned so
    /// the top of the dial is the way the camera faces.
    /// </summary>
    private void DrawTilt(Rocket r, Vector2 c, float rad)
    {
        DrawCircle(c, rad + 8, Back);
        DrawArc(c, rad, 0, MathF.Tau, 48, Dim, 1.5f);
        DrawArc(c, rad * 2 / 3, 0, MathF.Tau, 40, new Color(Dim, 0.5f), 1f);
        DrawArc(c, rad / 3, 0, MathF.Tau, 32, new Color(Dim, 0.5f), 1f);
        DrawLine(c - new Vector2(rad, 0), c + new Vector2(rad, 0), new Color(Dim, 0.4f));
        DrawLine(c - new Vector2(0, rad), c + new Vector2(0, rad), new Color(Dim, 0.4f));
        var cam = Game.Player.Camera.GlobalTransform.Basis;
        var fwd = -cam.Z; fwd.Y = 0;
        if (fwd.LengthSquared() < 1e-4f) fwd = Vector3.Forward;
        fwd = fwd.Normalized();
        var right = new Vector3(-fwd.Z, 0, fwd.X);
        Vector2 Place(Vector3 d)
        {
            d = d.Normalized();
            float tilt = MathF.Acos(Math.Clamp(d.Y, -1f, 1f));          // 0 straight up, pi/2 level
            var h = new Vector2(d.Dot(right), -d.Dot(fwd));
            if (h.LengthSquared() < 1e-6f) return c;
            return c + h.Normalized() * Math.Min(tilt / (MathF.PI / 2), 1.15f) * rad;
        }
        var nose = r.Body.Up;
        var np = Place(nose);
        DrawCircle(np, 7, UiStyle.Accent);
        DrawLine(c, np, new Color(UiStyle.Accent, 0.6f), 2f);
        if (r.Body.Vel.Length() > 3f)
        {
            var vpnt = Place(r.Body.Vel);
            DrawArc(vpnt, 8, 0, MathF.Tau, 16, r.Body.Vel.Y >= 0 ? UiStyle.Good : Alarm, 2f);
        }
        float tiltDeg = Mathf.RadToDeg(MathF.Acos(Math.Clamp(nose.Y, -1f, 1f)));
        bool low = PhysicsWorld.Altitude(r.Body.Y) < 3000f;          // leaning far over is only a worry near the ground
        Text(new Vector2(c.X - rad, c.Y + rad + 30), $"TILT {tiltDeg:0}°", 17, tiltDeg > 60 && low ? Warn : Ink, HorizontalAlignment.Center, rad * 2);
        Text(new Vector2(c.X - rad, c.Y - rad - 14), "nose ●   path ○", 14, Dim, HorizontalAlignment.Center, rad * 2);
    }
}
