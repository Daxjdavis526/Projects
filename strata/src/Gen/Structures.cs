using System;
using System.Collections.Generic;

namespace Strata;

/// <summary>
/// Ruins, camps and vaults. The world is divided into regions; each region
/// may hold one surface site and one buried one, chosen by hash. A column
/// asks every region within reach for its site and draws the part that
/// falls inside it, so a structure crossing four columns is built four times
/// from the same plan and meets itself exactly.
/// </summary>
public sealed class StructureGen
{
    public enum Kind : byte { None, Camp, Ruin, Shrine, Vault, Tower }

    public struct Site
    {
        public Kind Kind;
        public int X, Y, Z;     // anchor: centre of the floor
        public int Rot;         // quarter turns
        public int R;           // half-size of the footprint
        public int H;           // height above the floor
        public ulong Seed;
    }

    private const int RegionChunks = 8;           // 128 blocks
    private const int RegionBlocks = RegionChunks * V.Size;
    private readonly WorldGen _gen;

    public StructureGen(WorldGen gen) { _gen = gen; }

    public Site SiteFor(int rx, int rz, int layer)
    {
        long seed = _gen.Seed;
        ulong h = Hash.Of(seed ^ (layer == 0 ? 0x57C0L : 0xBA17L), rx, rz);
        var rng = new Rng(h);
        var s = new Site { Seed = h, Rot = rng.Int(0, 3) };
        int margin = 24;
        s.X = rx * RegionBlocks + rng.Int(margin, RegionBlocks - margin);
        s.Z = rz * RegionBlocks + rng.Int(margin, RegionBlocks - margin);

        if (layer == 1)
        {
            if (!rng.Chance(0.45f)) return default;
            s.Kind = Kind.Vault; s.R = 12; s.H = 7;
            s.Y = rng.Int(14, 38);
            var c = _gen.Sample(s.X, s.Z);
            if (c.Height < s.Y + 16) return default;
            return s;
        }

        if (!rng.Chance(0.55f)) return default;
        var col = _gen.Sample(s.X, s.Z);
        int y = _gen.SurfaceY(col, s.X, s.Z);
        if (y <= V.SeaLevel + 1 || y > 180) return default;
        // Reasonably level ground only.
        int lo = y, hi = y;
        for (int k = 0; k < 4; k++)
        {
            int dx = (k & 1) == 0 ? -6 : 6, dz = (k & 2) == 0 ? -6 : 6;
            int yy = _gen.SurfaceY(s.X + dx, s.Z + dz);
            lo = Math.Min(lo, yy); hi = Math.Max(hi, yy);
        }
        if (hi - lo > 6 || lo <= V.SeaLevel) return default;

        switch (col.Biome)
        {
            case Biome.Dunes: s.Kind = Kind.Shrine; s.R = 6; s.H = 8; break;
            case Biome.Peaks:
            case Biome.Pinereach:
            case Biome.Frostveld:
                s.Kind = rng.Chance(0.5f) ? Kind.Tower : Kind.Ruin; s.R = s.Kind == Kind.Tower ? 3 : 5; s.H = s.Kind == Kind.Tower ? 13 : 5; break;
            case Biome.Meadow:
            case Biome.Savanna:
            case Biome.Elderwood:
                s.Kind = rng.Chance(0.55f) ? Kind.Camp : Kind.Ruin; s.R = s.Kind == Kind.Camp ? 4 : 5; s.H = 5; break;
            case Biome.Ashlands:
            case Biome.Mirewood:
                s.Kind = Kind.Ruin; s.R = 5; s.H = 5; break;
            default: return default;
        }
        s.Y = y;
        return s;
    }

    public void Place(Chunk ch)
    {
        int wx0 = ch.WorldX, wz0 = ch.WorldZ;
        int rx0 = FloorDiv(wx0 - 32, RegionBlocks), rx1 = FloorDiv(wx0 + 16 + 32, RegionBlocks);
        int rz0 = FloorDiv(wz0 - 32, RegionBlocks), rz1 = FloorDiv(wz0 + 16 + 32, RegionBlocks);
        for (int rz = rz0; rz <= rz1; rz++)
            for (int rx = rx0; rx <= rx1; rx++)
                for (int layer = 0; layer < 2; layer++)
                {
                    var s = SiteFor(rx, rz, layer);
                    if (s.Kind == Kind.None) continue;
                    int ext = s.R + 12;  // corridors reach beyond the room
                    if (s.X + ext < wx0 || s.X - ext >= wx0 + 16 || s.Z + ext < wz0 || s.Z - ext >= wz0 + 16) continue;
                    var st = new Stamper(ch, s);
                    switch (s.Kind)
                    {
                        case Kind.Camp: Camp(st); break;
                        case Kind.Ruin: Ruin(st); break;
                        case Kind.Shrine: Shrine(st); break;
                        case Kind.Vault: Vault(st); break;
                        case Kind.Tower: Tower(st); break;
                    }
                }
    }

    private static int FloorDiv(int a, int b) => a >= 0 ? a / b : -((-a + b - 1) / b);

    /// <summary>Writes a structure into one column, in the structure's rotated local frame.</summary>
    private sealed class Stamper
    {
        public readonly Chunk Ch;
        public readonly Site S;
        public Rng R;
        public Stamper(Chunk ch, Site s) { Ch = ch; S = s; R = new Rng(s.Seed ^ 0x51A3); }

        public (int x, int z) World(int lx, int lz)
        {
            int x = lx, z = lz;
            for (int i = 0; i < S.Rot; i++) (x, z) = (-z, x);
            return (S.X + x, S.Z + z);
        }

        public bool Inside(int wx, int wz) =>
            wx >= Ch.WorldX && wx < Ch.WorldX + 16 && wz >= Ch.WorldZ && wz < Ch.WorldZ + 16;

        public void Set(int lx, int y, int lz, ushort id)
        {
            var (wx, wz) = World(lx, lz);
            int yy = S.Y + y;
            if (!Inside(wx, wz) || (uint)yy >= V.Height) return;
            Ch.Blocks[V.Index(wx - Ch.WorldX, yy, wz - Ch.WorldZ)] = id;
        }

        public ushort Get(int lx, int y, int lz)
        {
            var (wx, wz) = World(lx, lz);
            int yy = S.Y + y;
            if (!Inside(wx, wz) || (uint)yy >= V.Height) return Blocks.Stone;
            return Ch.Blocks[V.Index(wx - Ch.WorldX, yy, wz - Ch.WorldZ)];
        }

        /// <summary>Fills downward from just under the floor until it meets ground.</summary>
        public void Foundation(int lx, int lz, ushort id, int maxDepth = 8)
        {
            var (wx, wz) = World(lx, lz);
            if (!Inside(wx, wz)) return;
            for (int d = 1; d <= maxDepth; d++)
            {
                int yy = S.Y - d;
                if (yy < 1) break;
                int i = V.Index(wx - Ch.WorldX, yy, wz - Ch.WorldZ);
                var b = Blocks.ById[Ch.Blocks[i]];
                if (b.Solid && b.Opaque) break;
                Ch.Blocks[i] = id;
            }
        }

        /// <summary>Clears everything above the floor inside the footprint.</summary>
        public void Clear(int lx, int lz, int height)
        {
            for (int y = 0; y < height; y++) Set(lx, y, lz, Blocks.Air);
        }

        public void Crate(int lx, int y, int lz, string loot)
        {
            var (wx, wz) = World(lx, lz);
            int yy = S.Y + y;
            if (!Inside(wx, wz) || (uint)yy >= V.Height) return;
            int idx = V.Index(wx - Ch.WorldX, yy, wz - Ch.WorldZ);
            Ch.Blocks[idx] = Blocks.Crate;
            Ch.Entities[idx] = new CrateEntity { Loot = loot, LootSeed = Hash.Of((long)S.Seed, wx, yy, wz) };
        }

        /// <summary>A ladder whose wall lies in the given local direction.</summary>
        public void Ladder(int lx, int y, int lz, int localSupport)
        {
            int d = localSupport;
            for (int i = 0; i < S.Rot; i++)
                d = d switch { Dir.PX => Dir.PZ, Dir.PZ => Dir.NX, Dir.NX => Dir.NZ, _ => Dir.PX };
            for (int v = 0; v < 4; v++)
                if (Blocks.Get((ushort)(Blocks.Ladder + v)).SupportDir == d) { Set(lx, y, lz, (ushort)(Blocks.Ladder + v)); return; }
        }

        public bool Hash01(int a, int b, int c, float p) => Strata.Hash.Unit(Strata.Hash.Of((long)S.Seed, a, b, c)) < p;
    }

    // --- the structures --------------------------------------------------------------

    private static void Camp(Stamper st)
    {
        int r = st.S.R;
        for (int z = -r; z <= r; z++)
            for (int x = -r; x <= r; x++)
            {
                st.Clear(x, z, 6);
                st.Foundation(x, z, Blocks.Dirt, 5);
                st.Set(x, -1, z, (x * x + z * z) < 6 ? Blocks.ElmPlanks : st.Get(x, -1, z) == Blocks.Air ? Blocks.Dirt : st.Get(x, -1, z));
            }
        // A lean-to: three plank walls and a thatch roof.
        for (int y = 0; y < 3; y++)
        {
            for (int x = -2; x <= 2; x++) st.Set(x, y, -2, Blocks.ElmPlanks);
            for (int z = -2; z <= 1; z++) { st.Set(-2, y, z, Blocks.ElmPlanks); st.Set(2, y, z, Blocks.ElmPlanks); }
        }
        for (int x = -3; x <= 3; x++)
            for (int z = -3; z <= 2; z++) st.Set(x, 3, z, Blocks.Thatch);
        st.Set(0, 0, -1, Blocks.Bedroll);
        st.Crate(-1, 0, -1, "camp");
        st.Set(1, 0, -1, Blocks.Worktable);
        st.Set(1, 1, -1, Blocks.Torch);
        // A cold fire pit out front.
        st.Set(0, -1, 3, Blocks.Cobblestone);
        st.Set(1, -1, 3, Blocks.Cobblestone);
        st.Set(0, 0, 3, Blocks.Torch);
    }

    private static void Ruin(Stamper st)
    {
        int r = st.S.R;
        for (int z = -r; z <= r; z++)
            for (int x = -r; x <= r; x++)
            {
                st.Clear(x, z, 6);
                st.Foundation(x, z, Blocks.Cobblestone, 6);
                bool edge = Math.Abs(x) == r || Math.Abs(z) == r;
                ushort floor = st.Hash01(x, 0, z, 0.3f) ? Blocks.MossyCobble : st.Hash01(x, 1, z, 0.5f) ? Blocks.Cobblestone : Blocks.StoneBricks;
                st.Set(x, -1, z, floor);
                if (!edge) continue;
                // Walls crumble toward the top.
                int wall = 1 + (int)(Hash.Unit(Hash.Of((long)st.S.Seed, x, 7, z)) * 4.5f);
                if (x == 0 || z == 0) wall = Math.Min(wall, 1);    // doorways
                for (int y = 0; y < wall; y++)
                    st.Set(x, y, z, st.Hash01(x, y + 10, z, 0.25f) ? Blocks.MossyCobble : Blocks.StoneBricks);
            }
        // Corner pillars of carved stone.
        foreach (var (px, pz) in new[] { (-r, -r), (r, -r), (-r, r), (r, r) })
            for (int y = 0; y < 5; y++) st.Set(px, y, pz, Blocks.CarvedStone);
        st.Crate(r - 2, 0, r - 2, "ruin");
        st.Set(-(r - 2), 0, r - 2, Blocks.CarvedStone);
        st.Set(-(r - 2), 1, r - 2, Blocks.Torch);
    }

    private static void Shrine(Stamper st)
    {
        int r = st.S.R;
        for (int z = -r; z <= r; z++)
            for (int x = -r; x <= r; x++)
            {
                st.Clear(x, z, 9);
                st.Foundation(x, z, Blocks.Sandstone, 8);
                st.Set(x, -1, z, Blocks.DressedSandstone);
            }
        // Stepped walls.
        for (int y = 0; y < 7; y++)
        {
            int rr = r - y / 2;
            for (int z = -rr; z <= rr; z++)
                for (int x = -rr; x <= rr; x++)
                {
                    bool edge = Math.Abs(x) == rr || Math.Abs(z) == rr;
                    if (!edge && y < 6) continue;
                    if (y < 3 && z == -rr && Math.Abs(x) <= 1) continue; // entrance
                    st.Set(x, y, z, y % 3 == 2 ? Blocks.Sandstone : Blocks.DressedSandstone);
                }
        }
        // An inner chamber below the floor.
        for (int y = -5; y <= -2; y++)
            for (int z = -2; z <= 2; z++)
                for (int x = -2; x <= 2; x++)
                {
                    bool wall = Math.Abs(x) == 2 || Math.Abs(z) == 2 || y == -5;
                    st.Set(x, y, z, wall ? Blocks.DressedSandstone : Blocks.Air);
                }
        for (int y = -4; y <= -1; y++) st.Ladder(0, y, 1, Dir.PZ);   // the way down, against the back wall
        st.Crate(-1, -4, -1, "shrine");
        st.Crate(1, -4, -1, "shrine");
        st.Set(0, -4, -1, Blocks.LumenLamp);
    }

    private static void Tower(Stamper st)
    {
        int r = st.S.R;
        int h = st.S.H;
        for (int z = -r - 1; z <= r + 1; z++)
            for (int x = -r - 1; x <= r + 1; x++) { st.Clear(x, z, h + 3); st.Foundation(x, z, Blocks.Cobblestone, 10); }
        for (int y = -1; y < h; y++)
            for (int z = -r; z <= r; z++)
                for (int x = -r; x <= r; x++)
                {
                    bool edge = Math.Abs(x) == r || Math.Abs(z) == r;
                    bool floor = y == -1 || y == h - 1 || y == h / 2;
                    if (!edge && !floor) continue;
                    if (floor && !edge && x == r - 1 && z == r - 1 && y != -1) continue; // ladder hole
                    if (edge && y >= 0 && y < 2 && x == 0 && z == -r) continue;  // door
                    if (edge && (y == 2 || y == h / 2 + 2) && (x == 0 || z == 0)) continue; // windows
                    st.Set(x, y, z, st.Hash01(x, y, z, 0.2f) ? Blocks.MossyCobble : Blocks.StoneBricks);
                }
        for (int y = 0; y < h; y++) st.Ladder(r - 1, y, r - 1, Dir.PZ);
        // Crenellations.
        for (int z = -r; z <= r; z++)
            for (int x = -r; x <= r; x++)
                if ((Math.Abs(x) == r || Math.Abs(z) == r) && ((x + z) & 1) == 0) st.Set(x, h, z, Blocks.StoneBricks);
        st.Crate(-1, h / 2, -1, "tower");
        st.Crate(-1, h, 1, "tower");
        st.Set(1, h, -1, Blocks.Torch);
    }

    private static void Vault(Stamper st)
    {
        const int r = 5, h = 6;
        // Corridors out to the caves.
        for (int k = -12; k <= 12; k++)
            for (int w = -1; w <= 1; w++)
                for (int y = -1; y <= 3; y++)
                {
                    bool shell = y == -1 || y == 3 || Math.Abs(w) == 1;
                    ushort id = shell ? (st.Hash01(k, y, w, 0.3f) ? Blocks.MossyCobble : Blocks.StoneBricks) : Blocks.Air;
                    if (Math.Abs(k) > r) { st.Set(k, y, w, id); st.Set(w, y, k, id); }
                }
        for (int y = -1; y <= h; y++)
            for (int z = -r; z <= r; z++)
                for (int x = -r; x <= r; x++)
                {
                    bool shell = y == -1 || y == h || Math.Abs(x) == r || Math.Abs(z) == r;
                    ushort id;
                    if (shell)
                    {
                        bool door = y >= 0 && y <= 1 && ((Math.Abs(x) == r && z == 0) || (Math.Abs(z) == r && x == 0));
                        id = door ? Blocks.Air : st.Hash01(x, y, z, 0.18f) ? Blocks.MossyCobble : Blocks.StoneBricks;
                    }
                    else id = Blocks.Air;
                    st.Set(x, y, z, id);
                }
        foreach (var (px, pz) in new[] { (-2, -2), (2, -2), (-2, 2), (2, 2) })
            for (int y = 0; y < h; y++) st.Set(px, y, pz, Blocks.CarvedStone);
        st.Crate(-r + 1, 0, -r + 1, "vault");
        st.Crate(r - 1, 0, r - 1, "vault");
        if (st.R.Chance(0.5f)) st.Crate(r - 1, 0, -r + 1, "vault");
        st.Set(0, h - 1, 0, Blocks.LumenLamp);
    }
}

/// <summary>What a found crate holds. Rolled once, the first time it is opened, from its own seed.</summary>
public static class Loot
{
    private static readonly Dictionary<string, (string item, float chance, int min, int max)[]> Tables = new()
    {
        ["camp"] = new[]
        {
            ("hearth_bread", 0.7f, 1, 3), ("torch", 0.9f, 3, 8), ("stick", 0.7f, 2, 6), ("fiber", 0.6f, 2, 5),
            ("berries", 0.6f, 2, 6), ("copper_ingot", 0.35f, 1, 3), ("stone_pick", 0.15f, 1, 1), ("hide", 0.4f, 1, 2),
            ("grain_seeds", 0.6f, 1, 4), ("bowl", 0.4f, 1, 2), ("cord", 0.5f, 1, 3), ("raw_brisket", 0.3f, 1, 3),
        },
        ["ruin"] = new[]
        {
            ("iron_ingot", 0.5f, 1, 3), ("copper_ingot", 0.7f, 2, 5), ("soot", 0.8f, 3, 8), ("hearth_bread", 0.4f, 1, 2),
            ("frostleaf_seeds", 0.3f, 1, 3), ("silver_ingot", 0.2f, 1, 2), ("iron_pick", 0.08f, 1, 1), ("stone_blade", 0.2f, 1, 1),
            ("lumen_shard", 0.3f, 1, 3), ("gold_ingot", 0.15f, 1, 2), ("emberroot", 0.35f, 1, 3),
        },
        ["shrine"] = new[]
        {
            ("gold_ingot", 0.8f, 2, 5), ("lumen_shard", 0.7f, 2, 5), ("silver_ingot", 0.5f, 1, 3), ("emberroot", 0.6f, 2, 4),
            ("starmetal_ingot", 0.08f, 1, 1), ("iron_blade", 0.15f, 1, 1), ("berry_tart", 0.5f, 1, 2), ("glass", 0.4f, 2, 6),
        },
        ["tower"] = new[]
        {
            ("torch", 0.9f, 4, 10), ("iron_ingot", 0.5f, 1, 4), ("copper_ingot", 0.6f, 2, 4), ("hearth_bread", 0.6f, 1, 3),
            ("cord", 0.5f, 1, 4), ("ladder", 0.4f, 2, 6), ("starmetal_ingot", 0.05f, 1, 1), ("mossback_steak", 0.4f, 1, 3),
            ("silver_blade", 0.05f, 1, 1),
        },
        ["vault"] = new[]
        {
            ("iron_ingot", 0.8f, 3, 8), ("silver_ingot", 0.5f, 2, 5), ("gold_ingot", 0.5f, 2, 5), ("lumen_shard", 0.6f, 3, 8),
            ("starmetal_ingot", 0.25f, 1, 2), ("silver_blade", 0.1f, 1, 1), ("iron_pick", 0.15f, 1, 1), ("iron_blade", 0.15f, 1, 1),
            ("soot", 0.7f, 5, 12), ("seared_brisket", 0.4f, 2, 4), ("frostleaf_seeds", 0.3f, 2, 4),
        },
    };

    public static bool Has(string table) => table != null && Tables.ContainsKey(table);

    public static void Fill(Inventory inv, string table, ulong seed)
    {
        if (!Tables.TryGetValue(table, out var entries)) return;
        var rng = new Rng(seed);
        foreach (var (key, chance, min, max) in entries)
        {
            if (!rng.Chance(chance)) continue;
            if (!Items.ByKey.TryGetValue(key, out var id)) continue;
            var def = Items.Get(id);
            int n = rng.Int(min, max);
            var stack = new ItemStack(id, Math.Min(n, Math.Max(1, def.MaxStack)));
            // Scatter into random empty slots, the way things get left behind.
            for (int tries = 0; tries < 12; tries++)
            {
                int slot = rng.Int(0, inv.Size - 1);
                if (!inv.Slots[slot].IsEmpty) continue;
                inv.Slots[slot] = stack;
                stack = ItemStack.Empty;
                break;
            }
            if (!stack.IsEmpty) inv.Add(stack);
        }
        inv.Touch();
    }
}
