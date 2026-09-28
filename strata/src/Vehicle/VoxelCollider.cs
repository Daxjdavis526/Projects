using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// Contact between a rigid body and the block world. The body's shape is a
/// set of points fixed to it (corners, rims, fin tips, a nose); each step
/// every point found inside a solid block is pushed out along the face it is
/// least deep behind, and an impulse at the point stops it going further in
/// (with a little bounce and Coulomb friction), which also sets the body
/// turning if the point is off-centre. The closing speed at the worst contact
/// is reported so the caller can turn a hard landing into damage.
///
/// Columns that are not loaded yet are treated as generated ground: below
/// the generator's surface height (reshaped where a landmark site lays its
/// own) is solid, so a fast vehicle cannot fall through terrain that has not
/// streamed in.
/// </summary>
public static class VoxelCollider
{
    public struct Report
    {
        public int Contacts;
        public float ImpactSpeed;      // the largest closing speed along a contact normal this step
        public Vector3 ImpactPoint;
        public bool Touching => Contacts > 0;
    }

    public static bool SolidAt(World w, int x, int y, int z, out Aabb box)
    {
        box = new Aabb(new Vector3(x, y, z), Vector3.One);
        if (y < 0) return true;
        if (y >= V.Height) return false;
        var c = w.ChunkAt(x, z);
        if (c == null || c.State < ChunkState.Generated) return y < w.Gen.GroundY(x, z);
        var d = Blocks.ById[c.Blocks[V.Index(x & V.Mask, y, z & V.Mask)]];
        if (!d.Solid) return false;
        if (d.Box is Aabb b) box = new Aabb(new Vector3(x, y, z) + b.Position, b.Size);
        return true;
    }

    private struct Contact
    {
        public Vector3 P, N;
        public float Depth, Vn0, Jn, K;
        public Vector3 Jt;
    }

    [ThreadStatic] private static List<Contact> _contacts;

    /// <summary>
    /// Resolves the body against the world. localPoints are the shape, relative
    /// to the centre of mass in body space. restitution 0..1, friction mu.
    /// The contacts are solved together (a few rounds of sequential impulses
    /// with accumulated, clamped totals), so a box resting on four corners
    /// settles instead of rocking from one to the next.
    /// </summary>
    public static Report Resolve(World w, RigidBody b, IReadOnlyList<Vector3> localPoints, float restitution = 0.15f, float mu = 0.6f)
    {
        var rep = new Report();
        var cs = _contacts ??= new List<Contact>();
        cs.Clear();
        foreach (var lp in localPoints)
        {
            var p = b.ToWorld(lp);
            int x = V.FloorToInt(p.X), y = V.FloorToInt(p.Y), z = V.FloorToInt(p.Z);
            if (!SolidAt(w, x, y, z, out var box)) continue;
            var lo = box.Position; var hi = box.End;
            if (p.X < lo.X || p.X > hi.X || p.Y < lo.Y || p.Y > hi.Y || p.Z < lo.Z || p.Z > hi.Z) continue;
            // The face to leave by: the least deep one that is not covered by another solid block.
            float best = float.MaxValue;
            Vector3 n = Vector3.Up;
            void Face(float depth, Vector3 dir, int nx, int ny, int nz)
            {
                if (depth >= best) return;
                if (SolidAt(w, x + nx, y + ny, z + nz, out var nb) && nb.Size == Vector3.One) return;
                best = depth; n = dir;
            }
            Face(hi.Y - p.Y, Vector3.Up, 0, 1, 0);
            Face(p.Y - lo.Y, Vector3.Down, 0, -1, 0);
            Face(hi.X - p.X, Vector3.Right, 1, 0, 0);
            Face(p.X - lo.X, Vector3.Left, -1, 0, 0);
            Face(hi.Z - p.Z, Vector3.Back, 0, 0, 1);
            Face(p.Z - lo.Z, Vector3.Forward, 0, 0, -1);
            if (best == float.MaxValue) { best = hi.Y - p.Y; n = Vector3.Up; }
            float vn = b.PointVelocity(p).Dot(n);
            if (-vn > rep.ImpactSpeed) { rep.ImpactSpeed = -vn; rep.ImpactPoint = p; }
            cs.Add(new Contact { P = p, N = n, Depth = best, Vn0 = vn, K = b.InverseMassAt(p - b.Position, n) });
        }
        rep.Contacts = cs.Count;
        if (cs.Count == 0) return rep;

        for (int iter = 0; iter < 6; iter++)
            for (int i = 0; i < cs.Count; i++)
            {
                var c = cs[i];
                var r = c.P - b.Position;
                float vn = b.PointVelocity(c.P).Dot(c.N);
                // Bounce only off a real hit; resting contact just stops.
                float target = c.Vn0 < -2f ? -restitution * c.Vn0 : 0f;
                float dj = (target - vn) / c.K;
                float jn = Math.Max(0f, c.Jn + dj);
                b.ApplyImpulse(c.N * (jn - c.Jn), c.P);
                c.Jn = jn;
                // Friction: whatever stops the sliding, up to mu times the normal impulse so far.
                var vt = b.PointVelocity(c.P);
                vt -= c.N * vt.Dot(c.N);
                float vts = vt.Length();
                if (vts > 1e-5f)
                {
                    var t = vt / vts;
                    float kt = b.InverseMassAt(r, t);
                    var jt = c.Jt - t * (vts / kt);
                    float max = mu * c.Jn;
                    if (jt.Length() > max) jt = jt.Normalized() * max;
                    b.ApplyImpulse(jt - c.Jt, c.P);
                    c.Jt = jt;
                }
                cs[i] = c;
            }

        // Out of the ground: the deepest push along each axis, not all at once if deep (that would launch it).
        Vector3 push = Vector3.Zero;
        foreach (var c in cs)
        {
            var want = c.N * Math.Max(0f, c.Depth - 0.002f);
            push = new Vector3(
                MathF.Abs(want.X) > MathF.Abs(push.X) ? want.X : push.X,
                MathF.Abs(want.Y) > MathF.Abs(push.Y) ? want.Y : push.Y,
                MathF.Abs(want.Z) > MathF.Abs(push.Z) ? want.Z : push.Z);
        }
        if (push != Vector3.Zero)
        {
            var step = push.LimitLength(0.5f) * 0.9f;
            b.X += step.X; b.Y += step.Y; b.Z += step.Z;
        }
        return rep;
    }
}
