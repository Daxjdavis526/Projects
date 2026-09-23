using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// An axis-aligned box that moves through the voxel world. Movement is split
/// into its three axes and each is clipped against every solid box in the
/// swept volume, Y first, so the result is exact at any speed: nothing tunnels,
/// nothing sinks into a floor, and a wall stops only the axis that hit it (you
/// slide along it). Positions are doubles so standing on y = 64 stays exactly
/// 64 for hours instead of creeping into the floor and snagging on seams.
/// </summary>
public sealed class VoxelBody
{
    public double X, Y, Z;               // centre of the feet
    public Vector3 Vel;
    public float HalfWidth = 0.3f;
    public float Height = 1.8f;
    public float StepHeight = 0.6f;

    public bool OnGround, HitX, HitZ, HitCeiling;
    public bool InWater, InLava, HeadInWater, OnLadder;
    public float FallDistance;           // metres fallen since last support, for damage

    private const double Eps = 1e-5;
    private readonly List<Aabb> _boxes = new(64);

    public Vector3 Position
    {
        get => new((float)X, (float)Y, (float)Z);
        set { X = value.X; Y = value.Y; Z = value.Z; }
    }

    public (double x0, double y0, double z0, double x1, double y1, double z1) Box =>
        (X - HalfWidth, Y, Z - HalfWidth, X + HalfWidth, Y + Height, Z + HalfWidth);

    /// <summary>Collision boxes of solid blocks overlapping the given region.</summary>
    public static void Gather(World w, double x0, double y0, double z0, double x1, double y1, double z1, List<Aabb> into)
    {
        into.Clear();
        int ix0 = (int)Math.Floor(x0) - 1, iy0 = (int)Math.Floor(y0) - 1, iz0 = (int)Math.Floor(z0) - 1;
        int ix1 = (int)Math.Floor(x1) + 1, iy1 = (int)Math.Floor(y1) + 1, iz1 = (int)Math.Floor(z1) + 1;
        for (int y = iy0; y <= iy1; y++)
            for (int z = iz0; z <= iz1; z++)
                for (int x = ix0; x <= ix1; x++)
                {
                    ushort id = w.GetBlockSolidUnloaded(x, y, z);
                    var d = Blocks.ById[id];
                    if (!d.Solid) continue;
                    if (d.Box is Aabb b) into.Add(new Aabb(new Vector3(x, y, z) + b.Position, b.Size));
                    else into.Add(new Aabb(new Vector3(x, y, z), Vector3.One));
                }
    }

    /// <summary>Moves by (dx, dy, dz), clipping against the world. Returns the distance actually moved.</summary>
    public Vector3 Move(World w, double dx, double dy, double dz, bool sneakEdge = false)
    {
        double ox = X, oy = Y, oz = Z;
        var (x0, y0, z0, x1, y1, z1) = Box;
        Gather(w, Math.Min(x0, x0 + dx), Math.Min(y0, y0 + dy), Math.Min(z0, z0 + dz),
            Math.Max(x1, x1 + dx), Math.Max(y1, y1 + dy), Math.Max(z1, z1 + dz), _boxes);

        // Crouching at an edge: shorten horizontal moves that would leave nothing underfoot.
        if (sneakEdge && OnGround)
        {
            const double probe = 0.6;
            while (dx != 0 && !Supported(w, X + dx, Y - probe, Z)) dx = Shrink(dx);
            while (dz != 0 && !Supported(w, X, Y - probe, Z + dz)) dz = Shrink(dz);
            while (dx != 0 && dz != 0 && !Supported(w, X + dx, Y - probe, Z + dz)) { dx = Shrink(dx); dz = Shrink(dz); }
        }

        double wantX = dx, wantY = dy, wantZ = dz;
        double my = ClipY(dy);
        Y += my;
        double mx = ClipX(dx);
        X += mx;
        double mz = ClipZ(dz);
        Z += mz;

        HitX = Math.Abs(mx - wantX) > Eps;
        HitZ = Math.Abs(mz - wantZ) > Eps;
        bool hitY = Math.Abs(my - wantY) > Eps;
        HitCeiling = hitY && wantY > 0;
        bool landed = hitY && wantY < 0;

        // Step up onto low things (a bedroll, a door sill) without jumping.
        if ((HitX || HitZ) && (OnGround || landed) && StepHeight > 0)
        {
            double sx = X, sy = Y, sz = Z;
            X = ox; Y = oy; Z = oz;
            var (bx0, by0, bz0, bx1, by1, bz1) = Box;
            Gather(w, Math.Min(bx0, bx0 + dx) - 0.1, by0 - 0.1, Math.Min(bz0, bz0 + dz) - 0.1,
                Math.Max(bx1, bx1 + dx) + 0.1, by1 + StepHeight + 0.1, Math.Max(bz1, bz1 + dz) + 0.1, _boxes);
            double up = ClipY(StepHeight);
            Y += up;
            double sxm = ClipX(dx); X += sxm;
            double szm = ClipZ(dz); Z += szm;
            double down = ClipY(-up - Eps * 10);
            Y += down;
            double gained = sxm * sxm + szm * szm, before = mx * mx + mz * mz;
            if (gained > before + 1e-6 && down < 0)
            {
                HitX = Math.Abs(sxm - wantX) > Eps;
                HitZ = Math.Abs(szm - wantZ) > Eps;
                landed = true;
            }
            else { X = sx; Y = sy; Z = sz; }
        }

        if (HitX) Vel.X = 0;
        if (HitZ) Vel.Z = 0;
        if (hitY) Vel.Y = 0;
        OnGround = landed;
        return new Vector3((float)(X - ox), (float)(Y - oy), (float)(Z - oz));
    }

    private static double Shrink(double v)
    {
        const double step = 0.05;
        if (Math.Abs(v) < step) return 0;
        return v > 0 ? v - step : v + step;
    }

    private bool Supported(World w, double x, double y, double z)
    {
        var tmp = new List<Aabb>(8);
        Gather(w, x - HalfWidth, y, z - HalfWidth, x + HalfWidth, y + 0.6, z + HalfWidth, tmp);
        foreach (var b in tmp)
            if (Overlap(x - HalfWidth, x + HalfWidth, b.Position.X, b.End.X) &&
                Overlap(z - HalfWidth, z + HalfWidth, b.Position.Z, b.End.Z) &&
                Overlap(y, y + 0.6, b.Position.Y, b.End.Y)) return true;
        return false;
    }

    private static bool Overlap(double a0, double a1, double b0, double b1) => a1 > b0 + Eps && a0 < b1 - Eps;

    private double ClipY(double d)
    {
        if (d == 0) return 0;
        var (x0, y0, z0, x1, y1, z1) = Box;
        foreach (var b in _boxes)
        {
            if (!Overlap(x0, x1, b.Position.X, b.End.X) || !Overlap(z0, z1, b.Position.Z, b.End.Z)) continue;
            if (d > 0 && y1 <= b.Position.Y + Eps) d = Math.Min(d, b.Position.Y - y1);
            else if (d < 0 && y0 >= b.End.Y - Eps) d = Math.Max(d, b.End.Y - y0);
        }
        return d;
    }

    private double ClipX(double d)
    {
        if (d == 0) return 0;
        var (x0, y0, z0, x1, y1, z1) = Box;
        foreach (var b in _boxes)
        {
            if (!Overlap(y0, y1, b.Position.Y, b.End.Y) || !Overlap(z0, z1, b.Position.Z, b.End.Z)) continue;
            if (d > 0 && x1 <= b.Position.X + Eps) d = Math.Min(d, b.Position.X - x1);
            else if (d < 0 && x0 >= b.End.X - Eps) d = Math.Max(d, b.End.X - x0);
        }
        return d;
    }

    private double ClipZ(double d)
    {
        if (d == 0) return 0;
        var (x0, y0, z0, x1, y1, z1) = Box;
        foreach (var b in _boxes)
        {
            if (!Overlap(y0, y1, b.Position.Y, b.End.Y) || !Overlap(x0, x1, b.Position.X, b.End.X)) continue;
            if (d > 0 && z1 <= b.Position.Z + Eps) d = Math.Min(d, b.Position.Z - z1);
            else if (d < 0 && z0 >= b.End.Z - Eps) d = Math.Max(d, b.End.Z - z0);
        }
        return d;
    }

    /// <summary>True if the box currently overlaps any solid block (used to reject placements and unstick spawns).</summary>
    public bool Colliding(World w)
    {
        var (x0, y0, z0, x1, y1, z1) = Box;
        var tmp = new List<Aabb>(16);
        Gather(w, x0, y0, z0, x1, y1, z1, tmp);
        foreach (var b in tmp)
            if (Overlap(x0, x1, b.Position.X, b.End.X) && Overlap(y0, y1, b.Position.Y, b.End.Y) && Overlap(z0, z1, b.Position.Z, b.End.Z))
                return true;
        return false;
    }

    public bool Intersects(Aabb b)
    {
        var (x0, y0, z0, x1, y1, z1) = Box;
        return Overlap(x0, x1, b.Position.X, b.End.X) && Overlap(y0, y1, b.Position.Y, b.End.Y) && Overlap(z0, z1, b.Position.Z, b.End.Z);
    }

    /// <summary>Samples the fluids and ladders the box is in.</summary>
    public void SenseMedium(World w, float eyeHeight)
    {
        InWater = InLava = OnLadder = false;
        var (x0, y0, z0, x1, y1, z1) = Box;
        int ix0 = (int)Math.Floor(x0 + 0.001), ix1 = (int)Math.Floor(x1 - 0.001);
        int iz0 = (int)Math.Floor(z0 + 0.001), iz1 = (int)Math.Floor(z1 - 0.001);
        int iy0 = (int)Math.Floor(y0 + 0.001), iy1 = (int)Math.Floor(y1 - 0.001);
        for (int y = iy0; y <= iy1; y++)
            for (int z = iz0; z <= iz1; z++)
                for (int x = ix0; x <= ix1; x++)
                {
                    ushort id = w.GetBlock(x, y, z);
                    if (id == Blocks.Water) { if (y + 0.9 > y0 + 0.1) InWater = true; }
                    else if (id == Blocks.Lava) InLava = true;
                    else if (Blocks.ById[id].Climbable) OnLadder = true;
                }
        double ey = Y + eyeHeight;
        HeadInWater = w.GetBlock((int)Math.Floor(X), (int)Math.Floor(ey), (int)Math.Floor(Z)) == Blocks.Water
            && ey - Math.Floor(ey) < 0.88;
    }
}
