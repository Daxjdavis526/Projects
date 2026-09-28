using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// Anything that moves as one rigid piece under forces: a rocket, a wreck, a
/// cart, an aircraft. A vehicle is a rigid body plus the parts bolted to it
/// (engines, tanks, wings, seats, clamps) and a hull of points that touch the
/// world. Each frame it is stepped in small fixed sub-steps: its mass and
/// centre of mass are worked out again from its parts (tanks empty as they
/// burn, so both change), gravity pulls, every part adds its forces, the body
/// integrates, clamps hold it or the hull is resolved against the blocks, and
/// hard contacts, violent loads and overstress turn into damage.
///
/// This class knows nothing about rendering or input; it runs headless in the
/// unit tests. Positions of parts and hull points are in the vehicle's own
/// frame, measured from a fixed reference point (for a rocket, the ground
/// under its fins), not from the centre of mass, which moves.
/// </summary>
public abstract class Vehicle
{
    public const float SubStep = 1f / 120f;

    public readonly RigidBody Body = new();
    public readonly List<VehiclePart> Parts = new();
    public readonly List<Vector3> Hull = new();          // reference frame
    public string Kind = "vehicle";

    /// <summary>Mass of the structure itself (not counting parts), and where it is centred.</summary>
    public float StructureMass;
    public Vector3 StructureCentre;
    /// <summary>Squared radii of gyration about body x, y, z: inertia = mass × these. Fixed by the vehicle's shape.</summary>
    public Vector3 Gyration = new(1, 1, 1);

    public float MaxHealth = 100f, Health = 100f;
    public bool Destroyed;
    public string DestroyedBy = "";
    /// <summary>Closing speed a hull point can hit the ground at without harm, m/s.</summary>
    public float SafeImpact = 7f;
    public float ImpactDamage = 0.9f;                    // health per (m/s over the safe speed)^2
    public float Restitution = 0.12f, Friction = 0.7f;

    /// <summary>The centre of mass, in the reference frame. The body's position is this point in the world.</summary>
    public Vector3 Com { get; private set; }

    // What happened in the last Step, for effects, sounds and the instruments.
    public float FrameImpact;                            // hardest contact speed this frame
    public Vector3 FrameImpactPoint;
    public int Contacts;                                 // hull points touching at the end of the frame
    public bool Grounded => Contacts > 0;
    public Vector3 ProperAccel;                          // what an accelerometer aboard reads (m/s^2, world frame), smoothed
    public float GForce => ProperAccel.Length() / PhysicsWorld.Gravity;
    public bool Asleep;

    private readonly List<Vector3> _hullCom = new();
    private bool _reported;

    /// <summary>A one-line account of the parts' state, for diagnostics.</summary>
    protected virtual string Describe() => "";
    private float _still;
    private Vector3 _lastVel;

    public HoldDown Clamps => Find<HoldDown>();
    public Seat Seat => Find<Seat>();

    public T Find<T>() where T : VehiclePart
    {
        foreach (var p in Parts) if (p is T t) return t;
        return null;
    }

    public T Add<T>(T part) where T : VehiclePart { Parts.Add(part); return part; }

    // --- frames ---------------------------------------------------------------------------

    /// <summary>A point given in the reference frame, in the world.</summary>
    public Vector3 PointWorld(Vector3 reference) => Body.ToWorld(reference - Com);

    /// <summary>Where the reference point (the origin of the vehicle's own frame) is in the world.</summary>
    public Vector3 Origin => Body.ToWorld(-Com);

    /// <summary>Puts the vehicle's reference point at a place in the world with the given orientation.</summary>
    public void Place(Vector3 origin, Quaternion rot)
    {
        UpdateMass();
        Body.Rot = rot;
        Body.Position = origin + rot * Com;
        Body.Vel = Vector3.Zero;
        Body.AngVel = Vector3.Zero;
        _lastVel = Vector3.Zero;
    }

    // --- mass -----------------------------------------------------------------------------

    /// <summary>
    /// Adds up the structure and every part (with whatever is in the tanks)
    /// into a total mass and centre of mass. If the centre has moved, the body
    /// is shifted to match, so the vehicle itself does not jump.
    /// </summary>
    public void UpdateMass()
    {
        float m = StructureMass;
        var moment = StructureCentre * StructureMass;
        foreach (var p in Parts)
        {
            float pm = p.DryMass + (p is PropellantTank t ? t.Amount : 0f);
            m += pm;
            moment += p.Local * pm;
        }
        if (m <= 0f) m = 1f;
        var com = moment / m;
        if (com != Com)
        {
            // Keep the reference point fixed in the world while the centre of mass slides along the body.
            var shift = Body.DirToWorld(com - Com);
            Body.X += shift.X; Body.Y += shift.Y; Body.Z += shift.Z;
            Com = com;
        }
        Body.Mass = m;
        Body.Inertia = Gyration * m;
    }

    public float PropellantMass
    {
        get { float s = 0; foreach (var p in Parts) if (p is PropellantTank t) s += t.Amount; return s; }
    }

    public float PropellantCapacity
    {
        get { float s = 0; foreach (var p in Parts) if (p is PropellantTank t) s += t.Capacity; return s; }
    }

    // --- simulation -----------------------------------------------------------------------

    /// <summary>Called each sub-step before the parts: flight computers, pilots, anything that sets commands.</summary>
    protected virtual void Control(float dt) { }

    /// <summary>True while something is pushing (an engine burning): a sleeping vehicle wakes for it.</summary>
    protected virtual bool Active => false;

    /// <summary>Advances the vehicle by dt seconds of game time.</summary>
    public void Step(World w, float dt)
    {
        FrameImpact = 0f;
        if (Destroyed) return;
        int n = Math.Clamp((int)MathF.Ceiling(dt / SubStep), 1, 24);
        float h = dt / n;
        for (int i = 0; i < n && !Destroyed; i++) SubStepOnce(w, h);
    }

    private void SubStepOnce(World w, float h)
    {
        UpdateMass();
        var clamps = Clamps;
        Control(h);

        if (Asleep)
        {
            // Resting: nothing to integrate until something pushes it or the ground under it goes.
            foreach (var p in Parts) if (p is not HoldDown) p.Step(this, h);
            Body.ClearForces();
            _still += h;
            if (Active || (_still > 0.5f && !Supported(w))) { Asleep = false; _still = 0f; }
            else { ProperAccel = new Vector3(0, PhysicsWorld.Gravity, 0); return; }
        }

        Body.AddForce(new Vector3(0, -PhysicsWorld.Gravity * Body.Mass, 0));
        foreach (var p in Parts) p.Step(this, h);
        var net = Body.PendingForce;
        var v0 = Body.Vel;
        var before = (Body.X, Body.Y, Body.Z, Body.Rot, Body.AngVel, Body.Vel);
        var torque = Body.PendingTorque;
        Body.Integrate(h);
        if (!Body.Finite)
        {
            // Should never happen; if it does, say what led to it and put the body back as it was.
            if (!_reported)
            {
                _reported = true;
                GD.PrintErr($"{Kind}: state went non-finite. h {h} mass {Body.Mass} inertia {Body.Inertia} com {Com} force {net} torque {torque} " +
                    $"before: pos ({before.Item1:0.0},{before.Item2:0.0},{before.Item3:0.0}) rot {before.Item4} w {before.Item5} v {before.Item6} parts: {Describe()}");
            }
            (Body.X, Body.Y, Body.Z, Body.Rot, Body.AngVel, Body.Vel) = before;
            Body.AngVel = Vector3.Zero;
            if (!Body.Finite) { Body.Rot = Quaternion.Identity; Body.Vel = Vector3.Zero; }
        }

        if (clamps != null && clamps.Engaged)
        {
            clamps.Restrain(this, net);
            Contacts = 0;
            // Held: the accelerometer reads whatever the clamps and the ground push back with.
            ProperAccel = new Vector3(0, PhysicsWorld.Gravity, 0);
            _lastVel = Vector3.Zero;
            return;
        }

        _hullCom.Clear();
        foreach (var p in Hull) _hullCom.Add(p - Com);
        var rep = VoxelCollider.Resolve(w, Body, _hullCom, Restitution, Friction);
        Contacts = rep.Contacts;
        if (rep.ImpactSpeed > FrameImpact) { FrameImpact = rep.ImpactSpeed; FrameImpactPoint = rep.ImpactPoint; }
        if (rep.ImpactSpeed > SafeImpact)
        {
            float over = rep.ImpactSpeed - SafeImpact;
            Damage(over * over * ImpactDamage, "hit the ground at " + rep.ImpactSpeed.ToString("0") + " m/s");
        }

        // An accelerometer feels everything but gravity. Smoothed a little, as real ones are.
        var a = (Body.Vel - v0) / h + new Vector3(0, PhysicsWorld.Gravity, 0);
        if (a.Length() > PhysicsWorld.Gravity * 60f) a = a.Normalized() * PhysicsWorld.Gravity * 60f;   // one-step contact spikes
        ProperAccel = ProperAccel.Lerp(a, 1f - MathF.Exp(-h * 12f));
        _lastVel = Body.Vel;

        // Settle: a vehicle that has come to rest on the ground stops being simulated until disturbed.
        if (rep.Touching && Body.Vel.LengthSquared() < 0.04f && Body.AngVel.LengthSquared() < 0.002f && !Active) _still += h;
        else _still = 0f;
        if (_still > 1.0f)
        {
            Asleep = true;
            _still = 0f;
            Body.Vel = Vector3.Zero;
            Body.AngVel = Vector3.Zero;
        }
        AfterStep(h);
    }

    /// <summary>After each free sub-step: aerodynamic overstress, overheating and the like.</summary>
    protected virtual void AfterStep(float dt) { }

    /// <summary>True if some hull point is resting on something solid (checked just below it).</summary>
    public bool Supported(World w)
    {
        foreach (var p in Hull)
        {
            var q = PointWorld(p) - new Vector3(0, 0.08f, 0);
            if (VoxelCollider.SolidAt(w, V.FloorToInt(q.X), V.FloorToInt(q.Y), V.FloorToInt(q.Z), out var box)
                && q.Y <= box.End.Y + 0.01f && q.Y >= box.Position.Y) return true;
        }
        return false;
    }

    public void Wake() { Asleep = false; _still = 0f; }

    public void Damage(float amount, string cause)
    {
        if (Destroyed || amount <= 0f) return;
        Health -= amount;
        if (Health <= 0f)
        {
            Health = 0f;
            Destroyed = true;
            DestroyedBy = cause;
        }
    }

    /// <summary>Instantaneous push at a world point (a blast, a shove).</summary>
    public void Impulse(Vector3 j, Vector3 at)
    {
        Wake();
        Body.ApplyImpulse(j, at);
    }
}
