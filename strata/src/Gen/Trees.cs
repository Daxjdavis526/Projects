using System;
using System.Collections.Generic;

namespace Strata;

/// <summary>
/// Procedural trees. Each kind is a small program over a seeded random stream,
/// so a tree is re-derivable from its root position: the generator draws the
/// parts that fall inside a column, and a sapling grows the same shapes.
/// </summary>
public sealed class TreeGen
{
    private readonly WorldGen _gen;
    private const int Reach = 1;   // trees are narrower than a column, so neighbours suffice

    public TreeGen(WorldGen gen) { _gen = gen; }

    public readonly struct Part
    {
        public readonly int X, Y, Z;
        public readonly ushort Id;
        public readonly bool Log;
        public Part(int x, int y, int z, ushort id, bool log) { X = x; Y = y; Z = z; Id = id; Log = log; }
    }

    [ThreadStatic] private static List<Part> _parts;

    /// <summary>Draws every tree whose trunk stands within reach of this column.</summary>
    public void Place(Chunk ch)
    {
        _parts ??= new List<Part>(512);
        var parts = _parts;
        long seed = _gen.Seed;
        for (int oz = -Reach; oz <= Reach; oz++)
            for (int ox = -Reach; ox <= Reach; ox++)
            {
                int ccx = ch.X + ox, ccz = ch.Z + oz;
                for (int k = 0; k < 16; k++)
                {
                    ulong h = Hash.Of(seed ^ 0x7EE5, ccx, ccz, k);
                    int x = (ccx << 4) + (k & 3) * 4 + (int)(h & 3);
                    int z = (ccz << 4) + (k >> 2) * 4 + (int)((h >> 2) & 3);
                    float roll = Hash.Unit(Hash.Mix(h));
                    // Cheap early out before sampling climate: no biome is denser than this.
                    if (roll >= 0.45f) continue;
                    var col = _gen.Sample(x, z);
                    var bi = Biomes.Get(col.Biome);
                    if (roll >= bi.TreeDensity || bi.Trees.Length == 0) continue;
                    int y = _gen.SurfaceY(col, x, z);
                    if (y <= V.SeaLevel || y > 170) continue;
                    ushort ground = _gen.GroundBlock(col, x, y - 1, z);
                    if (!Blocks.IsSoilLike(ground) && ground != Blocks.Cinder && ground != Blocks.Ashstone) continue;
                    if (col.Biome == Biome.Peaks && ground != Blocks.Grass) continue;

                    var kind = Pick(bi.Trees, Hash.Unit(Hash.Mix(h ^ 0xABCDEF)));
                    var rng = new Rng(Hash.Of(seed, x, y, z));
                    parts.Clear();
                    Shape(kind, ref rng, parts);
                    Stamp(ch, x, y, z, parts);
                }
            }
    }

    private static TreeKind Pick((TreeKind kind, float weight)[] list, float u)
    {
        float total = 0;
        foreach (var t in list) total += t.weight;
        float at = u * total;
        foreach (var t in list)
        {
            if (at < t.weight) return t.kind;
            at -= t.weight;
        }
        return list[^1].kind;
    }

    private static void Stamp(Chunk ch, int x, int y, int z, List<Part> parts)
    {
        int wx0 = ch.WorldX, wz0 = ch.WorldZ;
        foreach (var p in parts)
        {
            int lx = x + p.X - wx0, lz = z + p.Z - wz0, yy = y + p.Y;
            if ((uint)lx > 15 || (uint)lz > 15 || (uint)yy >= V.Height) continue;
            int i = V.Index(lx, yy, lz);
            ushort cur = ch.Blocks[i];
            var cd = Blocks.ById[cur];
            if (p.Log)
            {
                if (cur == 0 || cd.Replaceable || Blocks.IsLeaves(cur) || cd.Render == RenderKind.Cross) ch.Blocks[i] = p.Id;
            }
            else if (cur == 0 || (cd.Replaceable && !cd.Liquid) || cd.Render == RenderKind.Cross)
            {
                ch.Blocks[i] = p.Id;
            }
        }
        // Soil under the trunk.
        int bx = x - wx0, bz = z - wz0;
        if ((uint)bx <= 15 && (uint)bz <= 15 && y > 0)
        {
            int i = V.Index(bx, y - 1, bz);
            if (Blocks.IsSoilLike(ch.Blocks[i])) ch.Blocks[i] = Blocks.Dirt;
        }
    }

    /// <summary>A sapling becomes a tree if there is room for its trunk.</summary>
    public bool GrowSapling(World w, int x, int y, int z, ushort sapling, ref Rng rng)
    {
        TreeKind kind = sapling == Blocks.IronwoodSapling ? TreeKind.Ironwood
            : sapling == Blocks.PineSapling ? (rng.Chance(0.3f) ? TreeKind.TallPine : TreeKind.Pine)
            : sapling == Blocks.WillowSapling ? TreeKind.Willow
            : TreeKind.Elm;
        var parts = new List<Part>(256);
        Shape(kind, ref rng, parts);
        foreach (var p in parts)
        {
            if (!p.Log) continue;
            int yy = y + p.Y;
            if (yy >= V.Height) return false;
            if (!w.IsReady(x + p.X, z + p.Z)) return false;
            if (p.X == 0 && p.Y == 0 && p.Z == 0) continue;
            ushort cur = w.GetBlock(x + p.X, yy, z + p.Z);
            var cd = Blocks.ById[cur];
            if (cur != 0 && !cd.Replaceable && !Blocks.IsLeaves(cur) && cd.Render != RenderKind.Cross) return false;
        }
        foreach (var p in parts)
        {
            int xx = x + p.X, yy = y + p.Y, zz = z + p.Z;
            if (yy >= V.Height || !w.IsReady(xx, zz)) continue;
            ushort cur = w.GetBlock(xx, yy, zz);
            var cd = Blocks.ById[cur];
            bool free = cur == 0 || (cd.Replaceable && !cd.Liquid) || cd.Render == RenderKind.Cross || (p.X == 0 && p.Y == 0 && p.Z == 0);
            if (p.Log ? free || Blocks.IsLeaves(cur) : free) w.SetBlock(xx, yy, zz, p.Id, false);
        }
        if (Blocks.IsSoilLike(w.GetBlock(x, y - 1, z))) w.SetBlock(x, y - 1, z, Blocks.Dirt, false);
        return true;
    }

    // --- shapes --------------------------------------------------------------------

    public static void Shape(TreeKind kind, ref Rng r, List<Part> o)
    {
        switch (kind)
        {
            case TreeKind.Elm: Elm(ref r, o); break;
            case TreeKind.Ironwood: Ironwood(ref r, o); break;
            case TreeKind.Pine: Pine(ref r, o, r.Int(6, 9), false); break;
            case TreeKind.TallPine: Pine(ref r, o, r.Int(11, 15), true); break;
            case TreeKind.Willow: Willow(ref r, o); break;
            case TreeKind.Ember: Ember(ref r, o); break;
            case TreeKind.Dead: Dead(ref r, o); break;
            case TreeKind.Shrub: Shrub(ref r, o); break;
        }
    }

    private static void Log(List<Part> o, int x, int y, int z, ushort id) => o.Add(new Part(x, y, z, id, true));
    private static void Leaf(List<Part> o, int x, int y, int z, ushort id) => o.Add(new Part(x, y, z, id, false));

    private static void Blob(List<Part> o, ref Rng r, int cx, int cy, int cz, float rx, float ry, float rz, ushort leaf, float holes)
    {
        int ix = (int)MathF.Ceiling(rx), iy = (int)MathF.Ceiling(ry), iz = (int)MathF.Ceiling(rz);
        for (int y = -iy; y <= iy; y++)
            for (int z = -iz; z <= iz; z++)
                for (int x = -ix; x <= ix; x++)
                {
                    float d = (x * x) / (rx * rx) + (y * y) / (ry * ry) + (z * z) / (rz * rz);
                    if (d > 1f) continue;
                    if (d > 0.55f && r.Chance(holes)) continue;
                    Leaf(o, cx + x, cy + y, cz + z, leaf);
                }
    }

    private static void Elm(ref Rng r, List<Part> o)
    {
        int h = r.Int(5, 7);
        for (int y = 0; y < h; y++) Log(o, 0, y, 0, Blocks.ElmLog);
        // A side limb now and then.
        if (r.Chance(0.5f))
        {
            int d = r.Int(0, 3);
            int bx = d == 0 ? 1 : d == 1 ? -1 : 0, bz = d == 2 ? 1 : d == 3 ? -1 : 0;
            Log(o, bx, h - 2, bz, Blocks.ElmLog);
            Blob(o, ref r, bx * 2, h - 1, bz * 2, 1.6f, 1.3f, 1.6f, Blocks.ElmLeaves, 0.4f);
        }
        Blob(o, ref r, 0, h, 0, 2.7f, 2.2f, 2.7f, Blocks.ElmLeaves, 0.35f);
    }

    private static void Ironwood(ref Rng r, List<Part> o)
    {
        int h = r.Int(10, 15);
        for (int y = 0; y < h; y++) Log(o, 0, y, 0, Blocks.IronwoodLog);
        // Buttress roots.
        for (int d = 0; d < 4; d++)
        {
            if (!r.Chance(0.6f)) continue;
            int bx = d == 0 ? 1 : d == 1 ? -1 : 0, bz = d == 2 ? 1 : d == 3 ? -1 : 0;
            Log(o, bx, 0, bz, Blocks.IronwoodLog);
        }
        // Branches with their own canopies.
        int branches = r.Int(2, 4);
        for (int b = 0; b < branches; b++)
        {
            float a = r.Range(0, MathF.Tau);
            int by = h - r.Int(2, 5);
            int len = r.Int(2, 3);
            int ex = 0, ez = 0;
            for (int s = 1; s <= len; s++)
            {
                ex = (int)MathF.Round(MathF.Cos(a) * s);
                ez = (int)MathF.Round(MathF.Sin(a) * s);
                Log(o, ex, by + s / 2, ez, Blocks.IronwoodLog);
            }
            Blob(o, ref r, ex, by + len / 2 + 1, ez, 2.2f, 1.5f, 2.2f, Blocks.IronwoodLeaves, 0.3f);
        }
        Blob(o, ref r, 0, h, 0, 3.3f, 2.2f, 3.3f, Blocks.IronwoodLeaves, 0.3f);
    }

    private static void Pine(ref Rng r, List<Part> o, int h, bool tall)
    {
        for (int y = 0; y < h; y++) Log(o, 0, y, 0, Blocks.PineLog);
        int start = tall ? h / 2 : 2;
        int layer = 0;
        for (int y = h + 1; y >= start; y--, layer++)
        {
            float frac = (float)(h + 1 - y) / (h + 1 - start);
            float rad = 0.6f + frac * (tall ? 2.2f : 2.8f);
            if (layer % 2 == 1) rad *= 0.65f;
            int ir = (int)MathF.Ceiling(rad);
            for (int z = -ir; z <= ir; z++)
                for (int x = -ir; x <= ir; x++)
                {
                    if (x * x + z * z > rad * rad + 0.3f) continue;
                    if (x == 0 && z == 0 && y < h) continue;
                    Leaf(o, x, y, z, Blocks.PineLeaves);
                }
        }
        Leaf(o, 0, h, 0, Blocks.PineLeaves);
        Leaf(o, 0, h + 1, 0, Blocks.PineLeaves);
    }

    private static void Willow(ref Rng r, List<Part> o)
    {
        int h = r.Int(4, 6);
        int lean = r.Int(0, 3);
        int lx = 0, lz = 0;
        for (int y = 0; y < h; y++)
        {
            if (y == h - 2 && r.Chance(0.6f)) { lx = lean == 0 ? 1 : lean == 1 ? -1 : 0; lz = lean == 2 ? 1 : lean == 3 ? -1 : 0; }
            Log(o, lx, y, lz, Blocks.WillowLog);
        }
        Blob(o, ref r, lx, h, lz, 3.3f, 1.8f, 3.3f, Blocks.WillowLeaves, 0.2f);
        // Hanging curtains of leaves around the rim.
        for (int k = 0; k < 18; k++)
        {
            float a = r.Range(0, MathF.Tau);
            int x = lx + (int)MathF.Round(MathF.Cos(a) * 3.2f), z = lz + (int)MathF.Round(MathF.Sin(a) * 3.2f);
            int len = r.Int(1, 4);
            for (int d = 0; d < len; d++) Leaf(o, x, h - 1 - d, z, Blocks.WillowLeaves);
        }
    }

    private static void Ember(ref Rng r, List<Part> o)
    {
        int h = r.Int(4, 5);
        int x = 0, z = 0;
        for (int y = 0; y < h; y++) Log(o, 0, y, 0, Blocks.ElmLog);
        int d = r.Int(0, 3);
        int dx = d == 0 ? 1 : d == 1 ? -1 : 0, dz = d == 2 ? 1 : d == 3 ? -1 : 0;
        int y2 = h;
        for (int s = 0; s < r.Int(2, 3); s++)
        {
            x += dx; z += dz;
            Log(o, x, y2, z, Blocks.ElmLog);
            y2++;
        }
        // Flat crown.
        for (int zz = -3; zz <= 3; zz++)
            for (int xx = -3; xx <= 3; xx++)
            {
                int dd = xx * xx + zz * zz;
                if (dd > 10) continue;
                Leaf(o, x + xx, y2, z + zz, Blocks.EmberLeaves);
                if (dd <= 4) Leaf(o, x + xx, y2 + 1, z + zz, Blocks.EmberLeaves);
            }
        // A second lower crown on the other side.
        if (r.Chance(0.5f))
        {
            Log(o, -dx, h - 1, -dz, Blocks.ElmLog);
            Log(o, -dx * 2, h, -dz * 2, Blocks.ElmLog);
            for (int zz = -2; zz <= 2; zz++)
                for (int xx = -2; xx <= 2; xx++)
                    if (xx * xx + zz * zz <= 5) Leaf(o, -dx * 2 + xx, h + 1, -dz * 2 + zz, Blocks.EmberLeaves);
        }
    }

    private static void Dead(ref Rng r, List<Part> o)
    {
        int h = r.Int(3, 6);
        for (int y = 0; y < h; y++) Log(o, 0, y, 0, Blocks.IronwoodLog);
        for (int b = 0; b < 2; b++)
        {
            int d = r.Int(0, 3);
            int bx = d == 0 ? 1 : d == 1 ? -1 : 0, bz = d == 2 ? 1 : d == 3 ? -1 : 0;
            int by = r.Int(h / 2, h - 1);
            Log(o, bx, by, bz, Blocks.IronwoodLog);
            if (r.Chance(0.5f)) Leaf(o, bx, by + 1, bz, Blocks.DryLeaves);
        }
        if (r.Chance(0.5f)) Leaf(o, 0, h, 0, Blocks.DryLeaves);
    }

    private static void Shrub(ref Rng r, List<Part> o)
    {
        Log(o, 0, 0, 0, Blocks.ElmLog);
        Blob(o, ref r, 0, 1, 0, 1.8f, 1.2f, 1.8f, Blocks.ElmLeaves, 0.3f);
    }
}
