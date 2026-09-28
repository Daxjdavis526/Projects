using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>The rules every moving thing in the world shares.</summary>
public static class PhysicsWorld
{
    /// <summary>Gravity, m/s^2. The player, creatures and vehicles all fall by the same rule.</summary>
    public const float Gravity = 28f;
    public const float SeaDensity = 1.2f;       // air at sea level, kg/m^3
    public const float ScaleHeight = 7000f;     // air thins by e every this many metres

    public static float AirDensity(double y) => SeaDensity * MathF.Exp(-(float)Math.Max(0, y - V.SeaLevel) / ScaleHeight);
}

/// <summary>
/// A component of a vehicle: something with mass at a place on it that may
/// push on it each step (an engine, a wing), hold something (a tank, a seat),
/// or restrain it (clamps). Positions are in the vehicle's body frame,
/// relative to its reference point (the design centre of mass).
/// </summary>
public abstract class VehiclePart
{
    public string Name = "";
    public Vector3 Local;
    public float DryMass;

    /// <summary>Called every physics sub-step before integration: apply forces here.</summary>
    public virtual void Step(Vehicle v, float dt) { }
}

/// <summary>Propellant (or any consumable by mass). Its contents count toward the vehicle's mass.</summary>
public sealed class PropellantTank : VehiclePart
{
    public float Capacity, Amount;
    public float Fraction => Capacity > 0 ? Amount / Capacity : 0f;

    /// <summary>Takes up to `kg` out of the tank and returns how much there was.</summary>
    public float Draw(float kg)
    {
        float got = Math.Min(kg, Amount);
        Amount -= got;
        return got;
    }
}

public enum EngineState : byte { Off, Starting, Running, Stopping, Failed }

/// <summary>
/// A rocket engine (a thruster): thrust along its axis, set by the throttle and limited by
/// how fast it can spool up or down; burns propellant at thrust / exhaust
/// velocity, and flames out when the tanks run dry. It can swing its nozzle a
/// few degrees (gimbal) to steer, which turns the vehicle because the thrust
/// then no longer passes through the centre of mass.
/// </summary>
public sealed class Thruster : VehiclePart
{
    public float MaxThrust = 1e5f;          // N
    public float MinThrottle = 0.4f;        // a running engine will not throttle below this
    public float ExhaustVelocity = 2700f;   // m/s: thrust per kg/s of propellant
    public float SpoolUp = 1.6f, SpoolDown = 0.6f;   // seconds to go from nothing to full, and back
    public Vector3 Axis = Vector3.Up;       // thrust direction in the body frame
    public float GimbalRange = 0.09f;       // radians each way
    public Vector2 GimbalCommand;           // -1..1 about body x and z
    public float Throttle = 1f;             // what the pilot asks for, 0..1
    public EngineState State;
    public float Thrust { get; private set; }            // N, right now
    public float MassFlow { get; private set; }          // kg/s, right now
    public string Fault = "";
    public List<PropellantTank> Feeds = new();
    public Vector2 Gimbal { get; private set; }          // actual angle, radians (it swings at a limited rate)

    public bool Burning => Thrust > MaxThrust * 0.02f;

    public bool Start()
    {
        if (State is EngineState.Running or EngineState.Starting) return false;
        if (Available() <= 0f) { Fault = "no propellant"; State = EngineState.Failed; return false; }
        State = EngineState.Starting;
        Fault = "";
        return true;
    }

    public void Stop()
    {
        if (State is EngineState.Running or EngineState.Starting) State = EngineState.Stopping;
    }

    private float Available()
    {
        float s = 0; foreach (var t in Feeds) s += t.Amount; return s;
    }

    /// <summary>The thrust vector in the body frame, with the gimbal applied.</summary>
    public Vector3 Direction()
    {
        var d = Axis;
        d = d.Rotated(Vector3.Right, Gimbal.X);
        d = d.Rotated(Vector3.Back, Gimbal.Y);
        return d.Normalized();
    }

    public override void Step(Vehicle v, float dt)
    {
        float target = State switch
        {
            EngineState.Starting or EngineState.Running => MaxThrust * Math.Max(MinThrottle, Math.Clamp(Throttle, 0f, 1f)),
            _ => 0f,
        };
        float rate = MaxThrust / (target > Thrust ? SpoolUp : SpoolDown);
        Thrust = Mathf.MoveToward(Thrust, target, rate * dt);
        if (State == EngineState.Starting && Thrust >= target * 0.98f) State = EngineState.Running;
        if (State == EngineState.Stopping && Thrust <= 0f) State = EngineState.Off;
        // The nozzle swings toward the command at a finite rate.
        var want = new Vector2(Math.Clamp(GimbalCommand.X, -1, 1), Math.Clamp(GimbalCommand.Y, -1, 1)) * GimbalRange;
        Gimbal = new Vector2(Mathf.MoveToward(Gimbal.X, want.X, 0.35f * dt), Mathf.MoveToward(Gimbal.Y, want.Y, 0.35f * dt));
        if (Thrust <= 0f) { MassFlow = 0f; return; }

        // Burn: the mass the thrust needs, drawn from the feeding tanks. Not enough left means flame-out.
        float need = Thrust / ExhaustVelocity * dt;
        float got = 0f;
        foreach (var t in Feeds) { if (got >= need) break; got += t.Draw(need - got); }
        if (got < need * 0.999f)
        {
            Thrust *= got / need;
            if (State != EngineState.Off) { State = EngineState.Off; Fault = "propellant exhausted"; }
        }
        MassFlow = got / dt;
        var b = v.Body;
        var dir = b.DirToWorld(Direction());
        b.AddForceAt(dir * Thrust, v.PointWorld(Local));
    }
}

/// <summary>Torque from inside the vehicle (reaction wheels, small thrusters): turns it without pushing it.</summary>
public sealed class ReactionControl : VehiclePart
{
    public Vector3 MaxTorque = new(1e4f, 1e4f, 1e4f);   // N m about body x, y, z
    public Vector3 Command;                              // -1..1 each axis

    public override void Step(Vehicle v, float dt)
    {
        var c = new Vector3(Math.Clamp(Command.X, -1, 1), Math.Clamp(Command.Y, -1, 1), Math.Clamp(Command.Z, -1, 1));
        v.Body.AddTorque(v.Body.DirToWorld(c * MaxTorque));
    }
}

/// <summary>
/// A long, slender aerodynamic body with fins: drag along and across its axis,
/// and a normal force that grows with angle of attack, all acting at the
/// centre of pressure. With the centre of pressure behind the centre of mass
/// the vehicle points into the wind by itself, as a finned rocket should.
/// </summary>
public sealed class AeroBody : VehiclePart
{
    public float AxialArea = 1f, AxialCd = 0.4f;       // along the axis
    public float SideArea = 10f, SideCd = 1.0f;        // across it
    public float FinArea = 4f, FinLift = 2f;           // normal-force slope per radian
    public Vector3 Axis = Vector3.Up;
    public float DynamicPressure { get; private set; } // Pa
    public float AngleOfAttack { get; private set; }   // radians
    public float Density { get; private set; }

    public override void Step(Vehicle v, float dt)
    {
        var b = v.Body;
        var cp = v.PointWorld(Local);
        var air = -b.PointVelocity(cp);                // the wind the body feels
        float speed = air.Length();
        Density = PhysicsWorld.AirDensity(cp.Y);
        DynamicPressure = 0.5f * Density * speed * speed;
        if (speed < 0.05f) { AngleOfAttack = 0f; return; }
        var axis = b.DirToWorld(Axis);
        var flow = air / speed;
        float along = flow.Dot(axis);                  // -1: wind from the nose
        var across = flow - axis * along;
        float acrossLen = across.Length();
        AngleOfAttack = MathF.Acos(Math.Clamp(-along, -1f, 1f));
        float q = DynamicPressure;
        // Drag along the axis and across it.
        var f = axis * along * q * AxialCd * AxialArea + (acrossLen > 1e-4f ? across / acrossLen * acrossLen * acrossLen * q * SideCd * SideArea : Vector3.Zero);
        // Fins: a normal force pushing the tail downwind, strongest at a moderate angle.
        if (acrossLen > 1e-4f)
        {
            float a = MathF.Min(AngleOfAttack, MathF.PI - AngleOfAttack);
            f += across / acrossLen * q * FinArea * FinLift * MathF.Sin(2f * a) * 0.5f;
        }
        b.AddForceAt(f, cp);
    }
}

/// <summary>Where somebody sits. The pilot's controls reach the vehicle through it.</summary>
public sealed class Seat : VehiclePart
{
    public Player Occupant;
    public Vector3 Exit;       // body frame: where you step out to
    public Vector3 Hatch;      // body frame: where you get in
}

/// <summary>
/// Clamps that hold a vehicle to a launch pad. While engaged the vehicle
/// cannot move: whatever the engines do, the clamps take it, and the load
/// they carry is measured. Released, they let go and the vehicle is on its own.
/// </summary>
public sealed class HoldDown : VehiclePart
{
    public bool Engaged;
    public Vector3 AnchorOrigin;                  // where the vehicle's reference point is held, in the world
    public Quaternion AnchorRot = Quaternion.Identity;
    public float Load { get; private set; }      // N the clamps are holding down (positive: the vehicle is pulling up)

    public void Engage(Vehicle v) { Engaged = true; AnchorOrigin = v.Origin; AnchorRot = v.Body.Rot; Load = 0; }

    public void Release() { Engaged = false; }

    /// <summary>After integration: put the vehicle back and note what it took to hold it.</summary>
    public void Restrain(Vehicle v, Vector3 netForce)
    {
        if (!Engaged) { Load = 0; return; }
        Load = netForce.Y;
        var b = v.Body;
        b.Rot = AnchorRot;
        b.Position = AnchorOrigin + AnchorRot * v.Com;
        b.Vel = Vector3.Zero;
        b.AngVel = Vector3.Zero;
    }
}
