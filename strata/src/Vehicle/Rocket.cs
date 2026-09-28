using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

public enum FlightPhase : byte { Safe, Armed, Countdown, Flight, Landed, Destroyed }

/// <summary>
/// A single-stage liquid-fuelled rocket with a crew capsule: one gimballed
/// engine fed from one tank, reaction wheels, four fins, a seat, and the pad's
/// hold-down clamps. Everything it does comes from forces on its rigid body:
/// the engine's thrust (through the gimbal, at the nozzle), gravity on its
/// changing mass, drag and fin lift at the centre of pressure, the clamps, and
/// the ground.
///
/// The flight computer runs the launch sequence (safe, armed, countdown,
/// ignition, thrust check, clamp release) and a stability-assist loop that
/// turns the pilot's stick into rotation rates, and holds attitude when the
/// stick is let go, by swinging the engine and spinning the wheels. It can be
/// switched off, and flying with it off is much harder.
///
/// Numbers (in this world, gravity is 28 m/s^2, 2.9 times Earth's):
///   height 33.5 m, body radius 1.7 m, fin span 8.4 m
///   dry 26 t (structure 17, engine 3.5, capsule 5.5), propellant 32 t
///   thrust 2.1 MN, exhaust velocity 1300 m/s, burn 20 s at full throttle
///   thrust-to-weight 1.29 at lift-off, 2.9 at burn-out
///   delta-v 1070 m/s; straight up at full throttle it tops out near 5.5 km
///   (the thrust check and spool-up on the pad burn about 3 t of that).
/// </summary>
public sealed class Rocket : Vehicle
{
    public const float Height = 33.5f, Radius = 1.7f, FinSpan = 4.2f;
    public const float TankBottom = 5f, TankTop = 22f;
    public const float CountdownFrom = 10f, IgnitionAt = 3f;
    public const float AeroLimit = 15000f;       // Pa of q·sin(angle of attack) the structure takes before it starts to fail

    public readonly Thruster Engine;
    public readonly PropellantTank Tank;
    public readonly ReactionControl Wheels;
    public readonly AeroBody Aero;
    public new readonly Seat Seat;
    public new readonly HoldDown Clamps;

    public FlightPhase Phase = FlightPhase.Safe;
    public float T;                              // countdown: seconds to lift-off (negative after it)
    public float Throttle = 1f;                  // what the pilot has set, 0..1
    public bool Sas = true;
    public Vector3 Stick;                        // pilot's rotation command, world frame: axis × rate fraction (set each frame)
    public float MaxRate = 0.35f, MaxRoll = 0.7f;   // rad/s at full stick
    public float MissionTime;                    // seconds since lift-off
    public float MaxAltitude, MaxSpeed;
    public double LaunchY;

    /// <summary>What happened, for the cabin: sounds, callouts and warnings. The game drains it each frame.</summary>
    public readonly List<string> Events = new();
    public string Status = "Systems ready";

    private Quaternion _hold = Quaternion.Identity;
    private bool _holding;
    private float _beep;
    private float _lastAeroWarn;

    public Rocket()
    {
        Kind = "rocket";
        StructureMass = 17000f;
        StructureCentre = new Vector3(0, 12f, 0);
        Gyration = new Vector3(100f, 1.6f, 100f);
        MaxHealth = Health = 100f;
        SafeImpact = 10f;
        ImpactDamage = 0.9f;

        Engine = Add(new Thruster
        {
            Name = "engine", Local = new Vector3(0, 0.8f, 0), DryMass = 3500f,
            MaxThrust = 2.1e6f, ExhaustVelocity = 1300f, MinThrottle = 0.3f, SpoolUp = 1.6f, SpoolDown = 0.5f,
            GimbalRange = Mathf.DegToRad(5f),
        });
        Tank = Add(new PropellantTank { Name = "tank", Local = new Vector3(0, (TankBottom + TankTop) / 2, 0), Capacity = 32000f, Amount = 32000f });
        Engine.Feeds.Add(Tank);
        Wheels = Add(new ReactionControl { Name = "wheels", Local = new Vector3(0, 26f, 0), MaxTorque = new Vector3(4e5f, 6e4f, 4e5f) });
        Aero = Add(new AeroBody
        {
            Name = "aero", Local = new Vector3(0, 6f, 0),
            AxialArea = MathF.PI * Radius * Radius, AxialCd = 0.5f,
            SideArea = Height * Radius * 2f, SideCd = 0.9f,
            FinArea = 10f, FinLift = 2.5f,
        });
        Seat = Add(new Seat { Name = "seat", Local = new Vector3(0, 26.2f, 0), DryMass = 5500f, Hatch = new Vector3(1.5f, 25.2f, 0), Exit = new Vector3(3.0f, 24.05f, 0) });
        Clamps = Add(new HoldDown { Name = "clamps" });

        BuildHull();
        UpdateMass();
    }

    private void BuildHull()
    {
        // Fins on the diagonals, clear of the crew arm on +x: their tips carry the rocket on the ground.
        for (int k = 0; k < 4; k++)
        {
            float a = MathF.PI / 4 + k * MathF.PI / 2;
            var d = new Vector3(MathF.Cos(a), 0, MathF.Sin(a));
            Hull.Add(d * FinSpan);
            Hull.Add(d * FinSpan + new Vector3(0, 3f, 0));
            Hull.Add(d * 2.2f + new Vector3(0, 7.1f, 0));
            Hull.Add(d * 1.25f + new Vector3(0, 0.6f, 0));          // the engine bell's rim
        }
        // The body and capsule: rings of points, so it lands on its side like a cylinder.
        foreach (float y in new[] { 4f, 10f, 16f, 22f })
            for (int k = 0; k < 8; k++)
            {
                float a = MathF.PI / 8 + k * MathF.PI / 4;
                Hull.Add(new Vector3(MathF.Cos(a) * Radius, y, MathF.Sin(a) * Radius));
            }
        for (int k = 0; k < 4; k++)
        {
            float a = MathF.PI / 4 + k * MathF.PI / 2;
            Hull.Add(new Vector3(MathF.Cos(a) * 1.2f, 27f, MathF.Sin(a) * 1.2f));
        }
        Hull.Add(new Vector3(0, Height, 0));
    }

    public float Altitude => (float)Origin.Y;
    public float Weight => Body.Mass * PhysicsWorld.Gravity;
    public float Twr => Engine.MaxThrust * Math.Max(Engine.MinThrottle, Throttle) / Weight;
    public bool Clamped => Clamps.Engaged;

    protected override bool Active => Engine.Thrust > 0f || Engine.State is EngineState.Starting or EngineState.Running;

    // --- the launch sequence ------------------------------------------------------------------

    private void Say(string status, string ev = null)
    {
        Status = status;
        if (ev != null) Events.Add(ev);
    }

    public bool Arm()
    {
        if (Phase != FlightPhase.Safe) return false;
        if (!Clamped) { Say("Arming is for the pad: in the field, ignite with Space"); return false; }
        if (Tank.Amount < Tank.Capacity * 0.05f) { Say("Cannot arm: tanks empty. Refuel at the launch console"); return false; }
        Phase = FlightPhase.Armed;
        Say("ARMED. Press G to start the countdown", "armed");
        return true;
    }

    public void Disarm()
    {
        if (Phase != FlightPhase.Armed) return;
        Phase = FlightPhase.Safe;
        Say("Safe", "safe");
    }

    public bool Go()
    {
        if (Phase != FlightPhase.Armed) { if (Phase == FlightPhase.Safe) Say("Arm first (R)"); return false; }
        Phase = FlightPhase.Countdown;
        T = CountdownFrom;
        _beep = 0f;
        Say($"T-{CountdownFrom:0}", "countdown");
        return true;
    }

    /// <summary>Stops a countdown, or shuts the engine down in flight.</summary>
    public void Abort(string why = "ABORT")
    {
        if (Phase == FlightPhase.Countdown)
        {
            Engine.Stop();
            Phase = FlightPhase.Safe;
            Say(why, "abort");
        }
        else if (Phase == FlightPhase.Flight && Engine.State is EngineState.Running or EngineState.Starting)
        {
            Engine.Stop();
            Say("Engine cut off", "cutoff");
        }
    }

    /// <summary>Space in flight: light the engine, or shut it down.</summary>
    public void ToggleEngine()
    {
        if (Clamped || Phase is FlightPhase.Countdown or FlightPhase.Destroyed) return;
        if (Engine.State is EngineState.Running or EngineState.Starting) { Engine.Stop(); Say("Engine cut off", "cutoff"); return; }
        if (Engine.Start())
        {
            if (Phase == FlightPhase.Landed || Phase == FlightPhase.Safe || Phase == FlightPhase.Armed) { Phase = FlightPhase.Flight; }
            Say("Ignition", "ignition");
            Wake();
        }
        else Say("No ignition: " + Engine.Fault, "fault");
    }

    public void Refuel()
    {
        Tank.Amount = Tank.Capacity;
        Health = MaxHealth;
        Engine.Fault = "";
        if (Engine.State == EngineState.Failed) Engine.State = EngineState.Off;
        UpdateMass();
        Say("Tanks full, systems green");
    }

    // --- the flight computer ------------------------------------------------------------------

    protected override void Control(float dt)
    {
        if (Destroyed) return;
        // Propellant settles to the bottom of the tank, so the tank's centre of mass sinks as it drains.
        Tank.Local = new Vector3(0, TankBottom + (TankTop - TankBottom) * Tank.Fraction * 0.5f, 0);
        Engine.Throttle = Throttle;

        switch (Phase)
        {
            case FlightPhase.Countdown:
            {
                float before = T;
                T -= dt;
                if (Math.Ceiling(before) != Math.Ceiling(T) && T > 0f)
                {
                    Status = $"T-{Math.Ceiling(T):0}";
                    Events.Add("beep");
                }
                if (before > IgnitionAt && T <= IgnitionAt)
                {
                    if (Engine.Start()) Say("Ignition sequence start", "ignition");
                    else { Abort("ABORT: no ignition (" + Engine.Fault + ")"); break; }
                }
                if (T <= 0f)
                {
                    // Thrust check: the clamps let go only if the engine can lift the rocket.
                    float lift = Engine.Thrust / Weight;
                    if (Engine.State == EngineState.Running && lift >= 1.05f)
                    {
                        Clamps.Release();
                        Phase = FlightPhase.Flight;
                        MissionTime = 0f;
                        LaunchY = Origin.Y;
                        _hold = Body.Rot; _holding = true;
                        Say("LIFT-OFF", "liftoff");
                        Wake();
                    }
                    else if (T < -1.5f || Engine.State is EngineState.Off or EngineState.Failed)
                        Abort($"HOLD: thrust only {lift * 100f:0}% of weight. Raise the throttle (Shift) and try again");
                }
                break;
            }
            case FlightPhase.Flight:
                MissionTime += dt;
                if (MissionTime > 5f && Status == "LIFT-OFF") Status = "";
                MaxAltitude = Math.Max(MaxAltitude, Altitude);
                MaxSpeed = Math.Max(MaxSpeed, Body.Vel.Length());
                if (Engine.Fault == "propellant exhausted" && Engine.State == EngineState.Off && Status != "Flame-out: propellant exhausted")
                    Say("Flame-out: propellant exhausted", "flameout");
                if (Asleep && Engine.Thrust <= 0f)
                {
                    Phase = FlightPhase.Landed;
                    Say(Health >= MaxHealth * 0.999f ? "Touchdown. Welcome back" : $"Down, damaged ({Health:0}% hull)", "landed");
                }
                break;
        }
        Steer(dt);
    }

    /// <summary>
    /// Stability assist: the stick sets a turn rate about each axis; with the
    /// stick released the computer holds the attitude it had. The torque this
    /// needs comes from the gimbal (only while the engine pushes) and the rest
    /// from the reaction wheels.
    /// </summary>
    private void Steer(float dt)
    {
        var b = Body;
        if (Clamped) { Engine.GimbalCommand = Vector2.Zero; Wheels.Command = Vector3.Zero; _hold = b.Rot; return; }
        var w = b.DirToLocal(b.AngVel);                   // body rates
        var stick = b.DirToLocal(Stick);                  // body frame: x pitch, y roll, z yaw
        var want = w;
        bool any = stick.LengthSquared() > 1e-4f;
        if (any || !Sas) _holding = false;
        if (Sas && !any)
        {
            if (!_holding) { _hold = b.Rot; _holding = true; }
            // Attitude error as a small rotation vector, body frame.
            var qe = _hold * b.Rot.Inverse();
            if (qe.W < 0) qe = -qe;
            var e = b.DirToLocal(new Vector3(qe.X, qe.Y, qe.Z) * 2f);
            want = e * 1.6f;
            want = new Vector3(Math.Clamp(want.X, -MaxRate, MaxRate), Math.Clamp(want.Y, -MaxRoll, MaxRoll), Math.Clamp(want.Z, -MaxRate, MaxRate));
        }
        else if (any)
        {
            want = new Vector3(stick.X * MaxRate, stick.Y * MaxRoll, stick.Z * MaxRate);
            // Axes the pilot is not touching: with assist on, hold them still; off, leave them be.
            if (MathF.Abs(stick.X) < 0.05f && Sas) want.X = 0;
            if (MathF.Abs(stick.Y) < 0.05f && Sas) want.Y = 0;
            if (MathF.Abs(stick.Z) < 0.05f && Sas) want.Z = 0;
            if (!Sas)
            {
                if (MathF.Abs(stick.X) < 0.05f) want.X = w.X;
                if (MathF.Abs(stick.Y) < 0.05f) want.Y = w.Y;
                if (MathF.Abs(stick.Z) < 0.05f) want.Z = w.Z;
            }
        }
        var torque = (want - w) * 3f * b.Inertia;         // body frame

        // The engine's share: tilting the thrust by a small angle θ about body x gives torque -h·T·θ about x.
        float h = Com.Y - Engine.Local.Y;
        float ht = h * Engine.Thrust;
        var gimbal = Vector2.Zero;
        var fromEngine = Vector3.Zero;
        if (ht > 1f)
        {
            float gx = Math.Clamp(-torque.X / ht / Engine.GimbalRange, -1f, 1f);
            float gz = Math.Clamp(-torque.Z / ht / Engine.GimbalRange, -1f, 1f);
            gimbal = new Vector2(gx, gz);
            fromEngine = new Vector3(-gx * Engine.GimbalRange * ht, 0, -gz * Engine.GimbalRange * ht);
        }
        Engine.GimbalCommand = gimbal;
        var rest = torque - fromEngine;
        Wheels.Command = new Vector3(rest.X / Wheels.MaxTorque.X, rest.Y / Wheels.MaxTorque.Y, rest.Z / Wheels.MaxTorque.Z);
    }

    protected override void AfterStep(float dt)
    {
        _lastAeroWarn = Math.Max(0f, _lastAeroWarn - dt);
        float load = Aero.DynamicPressure * MathF.Sin(Math.Min(Aero.AngleOfAttack, MathF.PI / 2));
        if (load > AeroLimit)
        {
            float over = load / AeroLimit - 1f;
            Damage(dt * (20f + 120f * over), "tore apart in the airflow");
            if (_lastAeroWarn <= 0f) { Say("STRUCTURAL OVERLOAD", "overload"); _lastAeroWarn = 2f; }
        }
        if (Destroyed) Phase = FlightPhase.Destroyed;
    }

    /// <summary>Damage also ends a flight: the flight computer notices.</summary>
    public void CheckDestroyed()
    {
        if (Destroyed && Phase != FlightPhase.Destroyed)
        {
            Phase = FlightPhase.Destroyed;
            Engine.Stop();
        }
    }

    protected override string Describe() =>
        $"engine {Engine.State} thrust {Engine.Thrust:0} gimbal {Engine.Gimbal} cmd {Engine.GimbalCommand} wheels {Wheels.Command} aero q {Aero.DynamicPressure:0} aoa {Aero.AngleOfAttack:0.00} stick {Stick} sas {Sas} tank {Tank.Amount:0}";

    /// <summary>How big a bang: more propellant aboard, more bang.</summary>
    public float BlastRadius => 3.2f + 2.3f * Tank.Fraction;
}
