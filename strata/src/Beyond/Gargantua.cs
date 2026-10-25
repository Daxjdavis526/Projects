using System;
using Godot;

namespace Strata;

/// <summary>
/// Gargantua: a supermassive black hole hanging in the sky of a Gargantua
/// world, far above the launch complex, with a thin accretion disk round it.
/// It is drawn by the sky shader (<c>shaders/gargantua.gdshaderinc</c>), which
/// bends every ray of light that passes near it along a real null geodesic of
/// the Schwarzschild spacetime; this class holds the same geometry for the
/// game: where it is, how hard it pulls, how fast clocks run near it, where
/// its event horizon is (crossing it opens the tesseract), and a CPU copy of
/// the shader's ray tracer that the unit tests check against the textbook
/// numbers (the shadow's edge at an impact parameter of 3√3 M, the weak-field
/// deflection of 4M/b).
///
/// Lengths in the black hole's own units are multiples of M, the mass as a
/// length (GM/c²). Here M is 40 blocks, so the horizon (r = 2M) has a radius
/// of 80 blocks, and the disk runs from 4M to 15M (160 to 600 blocks).
/// </summary>
public sealed class Gargantua
{
    /// <summary>The mass as a length, in blocks: every radius below is a multiple of this.</summary>
    public const float M = 40f;
    public const float Horizon = 2f;             // the event horizon, r = 2M
    public const float PhotonSphere = 3f;        // light can circle here, unstably
    public static readonly float ShadowEdge = 3f * MathF.Sqrt(3f);   // impact parameter of the shadow's rim, 5.196 M
    public const float DiskInner = 4f, DiskOuter = 15f;
    /// <summary>Past this radius the tracer stops bending light and the pull is gone.</summary>
    public const float Reach = 30f;
    /// <summary>Pull at radius r (in M) is Strength / (r − 2)² blocks/s², faded out between 8M and <see cref="PullReach"/>.</summary>
    public const float Strength = 2400f;
    public const float PullReach = 16f;

    /// <summary>Where it hangs, relative to the launch pad: north of the complex, high above the clouds.</summary>
    public static readonly Vector3 FromPad = new(0f, 500f, -1050f);

    public readonly Vector3 Centre;
    /// <summary>The disk's axis, and two directions in its plane.</summary>
    public readonly Vector3 Normal, DiskU, DiskV;

    /// <param name="centre">Where the singularity is, in world blocks.</param>
    /// <param name="viewpoint">Where it is meant to be admired from: the disk is turned to be seen from there almost edge-on, from a little above.</param>
    public Gargantua(Vector3 centre, Vector3 viewpoint)
    {
        Centre = centre;
        var d = (centre - viewpoint).Normalized();               // the line of sight
        var across = d.Cross(Vector3.Up).Normalized();           // level, at right angles to it
        var n0 = across.Cross(d).Normalized();                   // the edge-on disk's axis, tipped back off vertical
        // Tilted 7° toward the viewer so the near side is seen from above, and rolled 4° so it is not quite level.
        float tilt = Mathf.DegToRad(7f), roll = Mathf.DegToRad(4f);
        var n = (n0 * MathF.Cos(tilt) - d * MathF.Sin(tilt)).Normalized();
        Normal = n.Rotated(d, roll).Normalized();
        DiskU = d.Cross(Normal).Normalized();
        DiskV = Normal.Cross(DiskU).Normalized();
    }

    /// <summary>For a world built round a launch site: the black hole north of its pad, seen from its spawn.</summary>
    public static Gargantua ForSite(LandmarkSite site) => new(site.PadWorld + FromPad, site.Spawn + new Vector3(0, 1.62f, 0));

    // --- where you are -------------------------------------------------------------------

    /// <summary>Distance from the centre, in M.</summary>
    public float R(Vector3 world) => (world - Centre).Length() / M;

    /// <summary>True once something is inside the event horizon.</summary>
    public bool Inside(Vector3 world) => R(world) < Horizon;

    /// <summary>
    /// The pull toward the hole at a point, blocks/s²: GM / (r − 2M)², the
    /// Paczyński–Wiita potential, the usual stand-in for a black hole's field
    /// in Newtonian mechanics. Unlike a plain inverse square it has an
    /// innermost stable orbit at 6M, and anything coming in from afar with
    /// less angular momentum than 4Mc is swallowed rather than slung round,
    /// both as in general relativity. Its strength is the game's own (it
    /// amounts to light at about 310 m/s), and it fades to nothing by
    /// <see cref="PullReach"/>, so the launch pad and the observatory feel
    /// none of it and the ground beneath it only a little. Within about 5M it
    /// is stronger than creative flight.
    /// </summary>
    public Vector3 Pull(Vector3 world)
    {
        var to = Centre - world;
        float rb = to.Length();
        float r = rb / M;
        if (r >= PullReach || rb < 1e-3f) return Vector3.Zero;
        float fade = 1f - Smooth.Step(8f, PullReach, r);
        float s = Math.Max(r - Horizon, 0.2f);
        return to / rb * (Strength / (s * s) * fade);
    }

    /// <summary>
    /// How fast a clock held still at this point runs, against one far away:
    /// √(1 − 2M/r), the Schwarzschild result. 1 far off, 0 at the horizon.
    /// </summary>
    public float ClockRate(Vector3 world)
    {
        float r = R(world);
        return r <= Horizon ? 0f : MathF.Sqrt(1f - Horizon / r);
    }

    /// <summary>
    /// How much air there is near the hole, as a fraction of what the height
    /// alone would give: none within 14M, all of it past 22M. (A black hole's
    /// neighbourhood is a vacuum; letting the sky's air reach it would tear any
    /// rocket apart in the dive.)
    /// </summary>
    public float AirFactor(Vector3 world) => Smooth.Step(14f, 22f, R(world));

    // --- light ---------------------------------------------------------------------------

    public enum Fate { Escaped, Captured }

    public struct Ray
    {
        public Fate Fate;
        public Vector3 Out;        // the direction it leaves in, if it escapes
        public float DiskR;        // where it first crossed the disk (in M), or 0
        public int Steps;
        public float Closest;      // closest approach to the centre, in M
    }

    /// <summary>
    /// Follows a ray of light through the curved space round the hole, the way
    /// the sky shader does: in the hole's units, a photon's path obeys
    /// x'' = −3 h² x / r⁵ (h = |x × x'|, conserved), which is exactly the
    /// Schwarzschild null geodesic written in flat-looking coordinates. Velocity
    /// Verlet with steps proportional to r; starts from <paramref name="from"/>
    /// (in M, relative to the centre) or from where the ray enters the
    /// <paramref name="reach"/> sphere.
    /// </summary>
    public static Ray Trace(Vector3 from, Vector3 dir, float reach = Reach, int maxSteps = MaxSteps, Vector3? diskNormal = null)
    {
        var res = new Ray { Fate = Fate.Escaped, Out = dir, Closest = float.MaxValue };
        var x = from;
        var v = dir.Normalized();
        float c = x.Dot(x) - reach * reach;
        if (c > 0f)
        {
            float b = x.Dot(v);
            float disc = b * b - c;
            if (b > 0f || disc < 0f) { res.Closest = (x - v * b).Length(); return res; }   // never comes within reach
            x += v * (-b - MathF.Sqrt(disc));
        }
        float h2 = x.Cross(v).LengthSquared();
        var n = diskNormal ?? Vector3.Up;
        for (int i = 0; i < maxSteps; i++)
        {
            res.Steps = i + 1;
            float r2 = x.Dot(x), r = MathF.Sqrt(r2);
            res.Closest = Math.Min(res.Closest, r);
            if (r < Horizon) { res.Fate = Fate.Captured; return res; }
            if (r > reach && x.Dot(v) > 0f) { res.Out = v.Normalized(); return res; }
            float dt = StepSize(r);
            var a = x * (-3f * h2 / (r2 * r2 * r));
            var x1 = x + v * dt + a * (0.5f * dt * dt);
            float r1 = x1.Length();
            var a1 = x1 * (-3f * h2 / (r1 * r1 * r1 * r1 * r1));
            v += (a + a1) * (0.5f * dt);
            float s0 = x.Dot(n), s1 = x1.Dot(n);
            if (res.DiskR == 0f && (s0 > 0f) != (s1 > 0f))
            {
                float t = s0 / (s0 - s1);
                float rc = (x + (x1 - x) * t).Length();
                if (rc >= DiskInner && rc <= DiskOuter) res.DiskR = rc;
            }
            x = x1;
        }
        // Out of steps: still circling near the photon sphere, as good as captured.
        res.Fate = x.Length() < PhotonSphere * 1.5f ? Fate.Captured : Fate.Escaped;
        res.Out = v.Normalized();
        return res;
    }

    /// <summary>The shader's step rule: a fraction of the radius, finer just outside the photon sphere where paths wind.</summary>
    public static float StepSize(float r) => Math.Clamp(0.07f * r * Math.Clamp((r - 2.2f) * 0.6f + 0.35f, 0.35f, 1f), 0.02f, 2.5f);
    public const int MaxSteps = 220;

    // --- drawing -------------------------------------------------------------------------

    /// <summary>Hands the geometry to the sky shader (and switches it off with null).</summary>
    public static void Publish(Gargantua g)
    {
        RenderingServer.GlobalShaderParameterSet("bh_on", g != null ? 1f : 0f);
        if (g == null) return;
        RenderingServer.GlobalShaderParameterSet("bh_centre", g.Centre);
        RenderingServer.GlobalShaderParameterSet("bh_m", M);
        RenderingServer.GlobalShaderParameterSet("bh_normal", g.Normal);
        RenderingServer.GlobalShaderParameterSet("bh_u", g.DiskU);
        RenderingServer.GlobalShaderParameterSet("bh_v", g.DiskV);
    }
}
