using System;
using Godot;

namespace Strata;

public struct RayHit
{
    public bool Hit;
    public int X, Y, Z;          // the block hit
    public int Face;             // Dir of the face entered, or -1
    public Vector3 Point;
    public float Distance;
    public ushort Id;

    public Vector3I Cell => new(X, Y, Z);
    /// <summary>The cell in front of the hit face, where a placed block goes.</summary>
    public Vector3I Adjacent => Face < 0 ? Cell : new Vector3I(X + Dir.DX[Face], Y + Dir.DY[Face], Z + Dir.DZ[Face]);
}

/// <summary>
/// Grid traversal (Amanatides and Woo): steps from cell to cell along the ray,
/// always into the nearest boundary, so no cell the ray passes through is
/// skipped. Blocks smaller than a cell are tested against their own box.
/// </summary>
public static class VoxelRay
{
    public static RayHit Cast(World w, Vector3 origin, Vector3 dir, float maxDist, bool hitLiquids = false)
    {
        var hit = new RayHit { Face = -1 };
        dir = dir.Normalized();
        int x = V.FloorToInt(origin.X), y = V.FloorToInt(origin.Y), z = V.FloorToInt(origin.Z);
        int sx = dir.X > 0 ? 1 : -1, sy = dir.Y > 0 ? 1 : -1, sz = dir.Z > 0 ? 1 : -1;
        float tdx = dir.X != 0 ? MathF.Abs(1f / dir.X) : float.PositiveInfinity;
        float tdy = dir.Y != 0 ? MathF.Abs(1f / dir.Y) : float.PositiveInfinity;
        float tdz = dir.Z != 0 ? MathF.Abs(1f / dir.Z) : float.PositiveInfinity;
        float tmx = dir.X != 0 ? ((sx > 0 ? x + 1 - origin.X : origin.X - x) * tdx) : float.PositiveInfinity;
        float tmy = dir.Y != 0 ? ((sy > 0 ? y + 1 - origin.Y : origin.Y - y) * tdy) : float.PositiveInfinity;
        float tmz = dir.Z != 0 ? ((sz > 0 ? z + 1 - origin.Z : origin.Z - z) * tdz) : float.PositiveInfinity;
        int face = -1;
        float t = 0;

        for (int i = 0; i < 256 && t <= maxDist; i++)
        {
            ushort id = w.GetBlock(x, y, z);
            if (id != 0)
            {
                var d = Blocks.ById[id];
                bool target = d.Selectable || (hitLiquids && d.Liquid);
                if (target)
                {
                    var box = SelectionBox(d);
                    if (box == null)
                    {
                        hit.Hit = true; hit.X = x; hit.Y = y; hit.Z = z; hit.Face = face; hit.Id = id;
                        hit.Distance = t; hit.Point = origin + dir * t;
                        return hit;
                    }
                    var b = box.Value;
                    var bmin = new Vector3(x, y, z) + b.Position;
                    if (RayBox(origin, dir, bmin, bmin + b.Size, out float tn, out int bf) && tn <= maxDist)
                    {
                        hit.Hit = true; hit.X = x; hit.Y = y; hit.Z = z; hit.Face = bf; hit.Id = id;
                        hit.Distance = tn; hit.Point = origin + dir * tn;
                        return hit;
                    }
                }
            }
            if (tmx < tmy && tmx < tmz) { x += sx; t = tmx; tmx += tdx; face = sx > 0 ? Dir.NX : Dir.PX; }
            else if (tmy < tmz) { y += sy; t = tmy; tmy += tdy; face = sy > 0 ? Dir.NY : Dir.PY; }
            else { z += sz; t = tmz; tmz += tdz; face = sz > 0 ? Dir.NZ : Dir.PZ; }
        }
        return hit;
    }

    /// <summary>The box you aim at: null for full cubes, otherwise a tighter shape.</summary>
    public static Aabb? SelectionBox(BlockDef d)
    {
        switch (d.Render)
        {
            case RenderKind.Cube: return d.Box;
            case RenderKind.Cross: return new Aabb(new Vector3(0.15f, 0, 0.15f), new Vector3(0.7f, 0.8f, 0.7f));
            case RenderKind.Crop: return new Aabb(new Vector3(0, 0, 0), new Vector3(1, 0.25f + 0.2f * d.Variant, 1));
            case RenderKind.Torch:
                if (d.SupportDir < 0) return new Aabb(new Vector3(0.38f, 0, 0.38f), new Vector3(0.24f, 0.65f, 0.24f));
                var o = new Vector3(Dir.DX[d.SupportDir], 0, Dir.DZ[d.SupportDir]) * 0.3f;
                return new Aabb(new Vector3(0.35f, 0.2f, 0.35f) + o, new Vector3(0.3f, 0.65f, 0.3f));
            case RenderKind.Ladder:
            {
                const float t = 0.125f;
                return d.SupportDir switch
                {
                    Dir.PX => new Aabb(new Vector3(1 - t, 0, 0), new Vector3(t, 1, 1)),
                    Dir.NX => new Aabb(new Vector3(0, 0, 0), new Vector3(t, 1, 1)),
                    Dir.PZ => new Aabb(new Vector3(0, 0, 1 - t), new Vector3(1, 1, t)),
                    _ => new Aabb(new Vector3(0, 0, 0), new Vector3(1, 1, t)),
                };
            }
            case RenderKind.Door:
            case RenderKind.Low:
                return d.Box;
            default: return null;
        }
    }

    /// <summary>Slab test; returns the entry distance and the face entered.</summary>
    public static bool RayBox(Vector3 o, Vector3 d, Vector3 bmin, Vector3 bmax, out float tNear, out int face)
    {
        tNear = float.NegativeInfinity;
        float tFar = float.PositiveInfinity;
        face = -1;
        for (int a = 0; a < 3; a++)
        {
            float oa = o[a], da = d[a], lo = bmin[a], hi = bmax[a];
            if (MathF.Abs(da) < 1e-8f)
            {
                if (oa < lo || oa > hi) return false;
                continue;
            }
            float t1 = (lo - oa) / da, t2 = (hi - oa) / da;
            int f1 = a * 2 + 1, f2 = a * 2;   // entering the low side means crossing the -axis face
            if (t1 > t2) { (t1, t2) = (t2, t1); (f1, f2) = (f2, f1); }
            if (t1 > tNear) { tNear = t1; face = f1; }
            tFar = Math.Min(tFar, t2);
            if (tNear > tFar) return false;
        }
        if (tFar < 0) return false;
        if (tNear < 0) tNear = 0;
        // Face indices above were axis*2 + (0 for +, 1 for -); map to Dir order (+X -X +Y -Y +Z -Z) which matches.
        return true;
    }
}
