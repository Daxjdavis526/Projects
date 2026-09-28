using System;
using Godot;

namespace Strata;

/// <summary>
/// A rigid body in six degrees of freedom: position (double precision, like
/// everything else that moves through the world), velocity, orientation as a
/// quaternion, angular velocity, a mass and a principal moment of inertia.
/// Forces and torques are accumulated during a step and integrated
/// semi-implicitly (velocity first, then position), and the gyroscopic term
/// is kept so a spinning body behaves like one. Nothing here knows about
/// rockets: engines, wings, wheels and collisions all act on a body through
/// forces, torques and impulses.
/// </summary>
public sealed class RigidBody
{
    public double X, Y, Z;                    // the centre of mass, in the world
    public Vector3 Vel;                       // m/s
    public Quaternion Rot = Quaternion.Identity; // body to world
    public Vector3 AngVel;                    // rad/s, world frame
    public float Mass = 1f;                   // kg
    public Vector3 Inertia = Vector3.One;     // principal moments about body x, y, z (kg m^2)

    private Vector3 _force, _torque;
    public const float MaxSpin = 60f;             // rad/s: nothing in this world turns faster than this

    public Vector3 Position
    {
        get => new((float)X, (float)Y, (float)Z);
        set { X = value.X; Y = value.Y; Z = value.Z; }
    }

    public Basis Basis => new(Rot);
    public Vector3 Up => Rot * Vector3.Up;
    public Vector3 ToWorld(Vector3 local) => Position + Rot * local;
    public Vector3 DirToWorld(Vector3 local) => Rot * local;
    public Vector3 DirToLocal(Vector3 world) => Rot.Inverse() * world;

    /// <summary>The velocity of a point fixed to the body (world position).</summary>
    public Vector3 PointVelocity(Vector3 worldPoint) => Vel + AngVel.Cross(worldPoint - Position);

    public void AddForce(Vector3 f) => _force += f;
    public void AddTorque(Vector3 t) => _torque += t;

    /// <summary>A force applied at a point: pushes the body and, off the centre of mass, turns it.</summary>
    public void AddForceAt(Vector3 f, Vector3 worldPoint)
    {
        _force += f;
        _torque += (worldPoint - Position).Cross(f);
    }

    public Vector3 PendingForce => _force;
    public Vector3 PendingTorque => _torque;

    public bool Finite => double.IsFinite(X + Y + Z) && float.IsFinite(Vel.X + Vel.Y + Vel.Z) && float.IsFinite(AngVel.X + AngVel.Y + AngVel.Z)
        && float.IsFinite(Rot.X + Rot.Y + Rot.Z + Rot.W) && Rot.IsNormalized();

    /// <summary>The world-frame inverse inertia applied to a vector: R I^-1 R^T v.</summary>
    public Vector3 InvInertiaWorld(Vector3 v)
    {
        var l = Rot.Inverse() * v;
        l = new Vector3(l.X / Inertia.X, l.Y / Inertia.Y, l.Z / Inertia.Z);
        return Rot * l;
    }

    public Vector3 InertiaWorld(Vector3 v)
    {
        var l = Rot.Inverse() * v;
        l = new Vector3(l.X * Inertia.X, l.Y * Inertia.Y, l.Z * Inertia.Z);
        return Rot * l;
    }

    /// <summary>An instantaneous change of momentum at a point (collisions).</summary>
    public void ApplyImpulse(Vector3 j, Vector3 worldPoint)
    {
        Vel += j / Mass;
        AngVel += InvInertiaWorld((worldPoint - Position).Cross(j));
    }

    /// <summary>How much an impulse along n at r moves the point: the effective inverse mass there.</summary>
    public float InverseMassAt(Vector3 r, Vector3 n)
    {
        var rn = r.Cross(n);
        return 1f / Mass + n.Dot(InvInertiaWorld(rn).Cross(r));
    }

    /// <summary>Advances the body by dt under the forces and torques gathered since the last step.</summary>
    public void Integrate(float dt)
    {
        Vel += _force / Mass * dt;
        // Euler's equations in the world frame: I dw/dt = tau - w x (I w). The gyroscopic part
        // (w x Iw) only turns the spin, it never changes its energy; stepped naively it pumps
        // energy in and a small, flat, fast-spinning body blows up. So it is applied, and then
        // the spin is scaled back to the energy it had.
        var L = InertiaWorld(AngVel);
        float e0 = AngVel.Dot(L);
        var w1 = AngVel - InvInertiaWorld(AngVel.Cross(L)) * dt;
        float e1 = w1.Dot(InertiaWorld(w1));
        if (e1 > 1e-12f && e0 > 0f) w1 *= MathF.Sqrt(e0 / e1);
        AngVel = (w1 + InvInertiaWorld(_torque) * dt).LimitLength(MaxSpin);
        X += Vel.X * dt; Y += Vel.Y * dt; Z += Vel.Z * dt;
        var w = AngVel;
        var dq = new Quaternion(w.X, w.Y, w.Z, 0f) * Rot;
        Rot = new Quaternion(Rot.X + 0.5f * dq.X * dt, Rot.Y + 0.5f * dq.Y * dt, Rot.Z + 0.5f * dq.Z * dt, Rot.W + 0.5f * dq.W * dt).Normalized();
        _force = Vector3.Zero;
        _torque = Vector3.Zero;
    }

    public void ClearForces() { _force = Vector3.Zero; _torque = Vector3.Zero; }
}
