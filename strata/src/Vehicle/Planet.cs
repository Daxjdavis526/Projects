using System;
using Godot;

namespace Strata;

/// <summary>
/// The rules every moving thing in the world shares, and the planet they
/// share them on.
///
/// The world is a flat map, but it stands for a round planet 40 km in radius.
/// Up close that makes no difference: the ground curves away by less than a
/// metre over the distance you can see. High up and fast it is everything.
/// Gravity weakens with height, the air thins out and stops at 18 km, and
/// anything moving sideways fast enough finds the ground curving away beneath
/// it as quickly as it falls: that is an orbit. The flat map carries it as
/// two extra terms on a vehicle (see <see cref="Vehicle"/>): a lift of v²/r
/// from horizontal speed, and the drag of angular momentum, v·vy/r, that
/// slows a climbing orbit and speeds a falling one. With those, and ground
/// speed scaled by R/r, motion on the map is exactly motion around a sphere in
/// the plane of travel.
/// </summary>
public static class PhysicsWorld
{
    /// <summary>Gravity at the surface, m/s^2. The player, creatures and vehicles all fall by the same rule.</summary>
    public const float Gravity = 28f;
    public const float PlanetRadius = 40000f;                 // m, from the centre to sea level
    public const float Circumference = 2f * MathF.PI * PlanetRadius;   // one lap of the planet, 251 km
    public const double Mu = (double)Gravity * PlanetRadius * PlanetRadius;   // gravitational parameter, m^3/s^2

    public const float SeaDensity = 1.2f;       // air at sea level, kg/m^3
    public const float ScaleHeight = 2500f;     // air thins by e every this many metres
    public const float AirTop = 18000f;         // above this, no air at all: space
    public const float AirFade = 5000f;         // the last of it fades out over this much height

    /// <summary>Where the sky ends: above this altitude there is no air, and an orbit does not decay.</summary>
    public const float SpaceLine = AirTop;

    /// <summary>Height above sea level (never below it, for gravity and air).</summary>
    public static float Altitude(double y) => (float)Math.Max(0.0, y - V.SeaLevel);

    public static float GravityAt(double y)
    {
        double k = PlanetRadius / (PlanetRadius + Altitude(y));
        return (float)(Gravity * k * k);
    }

    public static float AirDensity(double y)
    {
        float h = Altitude(y);
        if (h >= AirTop) return 0f;
        float fade = 1f - Smooth.Step(AirTop - AirFade, AirTop, h);
        return SeaDensity * MathF.Exp(-h / ScaleHeight) * fade;
    }

    /// <summary>The speed of a circular orbit at this height.</summary>
    public static float CircularSpeed(double y) => (float)Math.Sqrt(Mu / (PlanetRadius + Altitude(y)));

    /// <summary>The speed that leaves the planet for good from this height.</summary>
    public static float EscapeSpeed(double y) => (float)Math.Sqrt(2.0 * Mu / (PlanetRadius + Altitude(y)));

    /// <summary>
    /// The map repeats every <see cref="Circumference"/> for anything in orbit,
    /// east–west and north–south, so a lap of the planet along either brings
    /// you back over where you started. Returns how far a position had to move
    /// to come back into the lap round the world origin (zero if it did not).
    /// </summary>
    public static Vector3 WrapShift(double x, double z)
    {
        double half = Circumference / 2.0;
        double dx = x > half ? -Circumference : x < -half ? Circumference : 0.0;
        double dz = z > half ? -Circumference : z < -half ? Circumference : 0.0;
        return new Vector3((float)dx, 0f, (float)dz);
    }
}

/// <summary>
/// The shape of the path a body is on, from its height and velocity: how high
/// it will climb and how low it will fall on its way round the planet, how
/// long a lap takes, and whether it is leaving for good. Worked in the plane
/// of travel (horizontal speed is the speed round the planet).
/// </summary>
public struct Orbit
{
    public float Apoapsis, Periapsis;      // highest and lowest altitude above sea level, m (Apoapsis is infinite when escaping)
    public float Eccentricity;
    public float Period;                   // s, for a closed orbit
    public float TimeToApoapsis;           // s, for a closed orbit
    public float CircularSpeed, EscapeSpeed;
    public bool Escaping;

    /// <summary>A closed orbit that never touches the air: it will go round and round.</summary>
    public bool Stable => !Escaping && Periapsis > PhysicsWorld.SpaceLine;

    public static Orbit Of(Vector3 vel, double y)
    {
        var o = new Orbit();
        double mu = PhysicsWorld.Mu, R = PhysicsWorld.PlanetRadius;
        double r = R + PhysicsWorld.Altitude(y);
        double vr = vel.Y, vt = Math.Sqrt(vel.X * (double)vel.X + vel.Z * (double)vel.Z);
        double v2 = vr * vr + vt * vt;
        double energy = v2 / 2 - mu / r;
        double L = r * vt;
        double e = Math.Sqrt(Math.Max(0.0, 1 + 2 * energy * L * L / (mu * mu)));
        o.Eccentricity = (float)e;
        o.CircularSpeed = (float)Math.Sqrt(mu / r);
        o.EscapeSpeed = (float)Math.Sqrt(2 * mu / r);
        double rp = L * L / (mu * (1 + e));                     // periapsis, closed or not
        o.Periapsis = (float)(rp - R);
        if (energy >= 0)
        {
            o.Escaping = true;
            o.Apoapsis = float.PositiveInfinity;
            return o;
        }
        double a = -mu / (2 * energy);
        o.Apoapsis = (float)(a * (1 + e) - R);
        o.Period = (float)(2 * Math.PI * Math.Sqrt(a * a * a / mu));
        // Where on the ellipse it is (its eccentric anomaly E, found from e·cos E and e·sin E, which
        // stay well defined even for a path that goes nearly straight up and down), and from that,
        // by Kepler's equation, the time to the top.
        if (e > 1e-6)
        {
            double ecosE = 1 - r / a, esinE = r * vr / Math.Sqrt(mu * a);
            double E = Math.Atan2(esinE, ecosE);
            if (E < 0) E += 2 * Math.PI;
            double M = E - esinE;
            double t = (Math.PI - M) / (2 * Math.PI) * o.Period;
            if (t < 0) t += o.Period;
            o.TimeToApoapsis = (float)t;
        }
        return o;
    }
}
