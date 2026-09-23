using System;
using System.Runtime.CompilerServices;

namespace Strata;

/// <summary>
/// The world as a pure function of (seed, position). A column is generated
/// without reading or writing any other column: features that cross borders
/// (trees, tunnels, ruins) are re-derived by every column they touch, so any
/// load order produces the same world and generation is safe on any thread.
/// </summary>
public sealed class WorldGen
{
    public readonly long Seed;
    public readonly TreeGen Trees;
    public readonly StructureGen Structures;

    private readonly Simplex _cont, _ero, _ridge, _hills, _rug, _temp, _hum, _river, _warp, _volc, _detail,
        _over, _cheese, _sp1, _sp2, _entrance, _lake, _slate, _patch, _surf, _glow;

    public WorldGen(long seed)
    {
        Seed = seed;
        Biomes.Init();
        Simplex S(int salt) => new(seed * 31 + salt * 0x5DEECE66DL);
        _cont = S(1); _ero = S(2); _ridge = S(3); _hills = S(4); _rug = S(5); _temp = S(6); _hum = S(7);
        _river = S(8); _warp = S(9); _volc = S(10); _detail = S(11); _over = S(12); _cheese = S(13);
        _sp1 = S(14); _sp2 = S(15); _entrance = S(16); _lake = S(17); _slate = S(18); _patch = S(19);
        _surf = S(20); _glow = S(21);
        Trees = new TreeGen(this);
        Structures = new StructureGen(this);
    }

    // --- climate and height -----------------------------------------------------------

    public struct Column
    {
        public float Cont, Ero, Temp, Hum, Rug, River, Mountain, Volc;
        public float HeightF;
        public int Height;          // first air above the 2D surface
        public Biome Biome;
        public float Overhang;      // amplitude of 3D shaping here (0 = none)
    }

    public Column Sample(int x, int z)
    {
        Column c = default;
        double wx = x + _warp.Fbm2(x / 400.0, z / 400.0, 2) * 60.0;
        double wz = z + _warp.Fbm2(x / 400.0 + 71.3, z / 400.0 - 29.1, 2) * 60.0;

        c.Cont = _cont.Fbm2(wx / 1500.0, wz / 1500.0, 5, 2.0, 0.5f) * 1.25f + 0.12f;
        c.Ero = _ero.Fbm2(wx / 900.0, wz / 900.0, 3);
        c.Rug = _rug.Fbm2(x / 320.0, z / 320.0, 2);
        c.Temp = _temp.Fbm2(x / 1400.0, z / 1400.0, 3) * 1.3f;
        c.Hum = _hum.Fbm2(x / 1100.0 + 13.7, z / 1100.0 - 4.1, 3) * 1.3f;
        c.Volc = _volc.Fbm2(x / 700.0, z / 700.0, 2);

        float h = Smooth.Spline(c.Cont,
            new[] { -1.2f, -0.6f, -0.32f, -0.17f, -0.08f, -0.02f, 0.1f, 0.3f, 0.55f, 1.0f },
            new[] { 22f, 32f, 44f, 54f, 60f, 63.5f, 66f, 71f, 80f, 94f });

        float land = Smooth.Step(-0.12f, 0.06f, c.Cont);
        c.Mountain = Smooth.Step(-0.05f, 0.45f, c.Cont) * Smooth.Step(0.3f, -0.45f, c.Ero);

        float ridge = _ridge.Ridged2(wx / 460.0, wz / 460.0, 5);
        h += MathF.Pow(ridge, 1.6f) * 118f * c.Mountain;

        float rugged = Smooth.Step(-0.3f, 0.7f, c.Rug);
        float hills = _hills.Fbm2(x / 150.0, z / 150.0, 4);
        float hillAmp = (5f + 15f * rugged) * land * (1f - 0.65f * Smooth.Step(0.15f, 0.7f, c.Ero));
        h += hills * hillAmp + hills * 18f * c.Mountain;
        h += _detail.Fbm2(x / 37.0, z / 37.0, 2) * 0.9f * land;

        // Rivers: a narrow band where warped noise crosses zero, cut down to sea level.
        float rv = MathF.Abs(_river.Fbm2(wx / 760.0, wz / 760.0, 3));
        float rivStr = (1f - Smooth.Step(0.014f, 0.055f, rv)) * land * (1f - Smooth.Step(0.55f, 0.9f, c.Mountain));
        c.River = rivStr;
        if (rivStr > 0f)
        {
            float bed = V.SeaLevel - 3.5f + (1f - rivStr) * 3f;
            h = Smooth.Lerp(h, Math.Min(h, bed), Smooth.Step(0f, 1f, rivStr * 1.4f));
        }

        // Classify.
        float t = c.Temp, hu = c.Hum;
        Biome b;
        if (h < V.SeaLevel - 0.5f && c.Cont < -0.06f)
            b = t < -0.55f ? Biome.FrozenSea : h < 44f ? Biome.DeepSea : Biome.Sea;
        else if (rivStr > 0.45f && h < V.SeaLevel + 1f)
            b = t < -0.55f ? Biome.FrozenSea : Biome.River;
        else if (h < V.SeaLevel + 2.5f && c.Cont < 0.02f && t > -0.5f && !(hu > 0.35f && t > 0.1f))
            b = Biome.Shore;
        else if (h > 132f || (c.Mountain > 0.55f && h > 108f))
            b = Biome.Peaks;
        else if (c.Volc > 0.52f && t > 0.05f && h > V.SeaLevel + 3f)
            b = Biome.Ashlands;
        else if (t < -0.5f) b = Biome.Frostveld;
        else if (t < -0.16f) b = Biome.Pinereach;
        else if (t > 0.42f)
        {
            if (hu < -0.12f) b = Biome.Dunes;
            else if (hu < 0.3f) b = Biome.Savanna;
            else b = h < 67f ? Biome.Mirewood : Biome.Elderwood;
        }
        else
        {
            if (hu > 0.5f && h < 68f) b = Biome.Mirewood;
            else if (hu > 0.08f) b = Biome.Elderwood;
            else b = Biome.Meadow;
        }

        // Swamps sit right at the waterline, pooling where they dip under it.
        if (b == Biome.Mirewood)
        {
            float target = V.SeaLevel + 0.4f + _patch.Noise2(x / 24.0, z / 24.0) * 1.6f;
            h = Smooth.Lerp(h, target, 0.75f);
        }
        // Dunes roll.
        if (b == Biome.Dunes)
            h += MathF.Abs(_surf.Fbm2(x / 48.0, z / 70.0, 2)) * 7f;

        c.Biome = b;
        c.HeightF = h;
        c.Height = Math.Clamp((int)MathF.Floor(h), 4, V.Height - 8);
        c.Overhang = c.Mountain > 0.35f ? Smooth.Step(0.35f, 0.8f, c.Mountain) * Smooth.Step(-0.1f, 0.5f, c.Rug) * 14f : 0f;
        return c;
    }

    public Biome BiomeAt(int x, int z) => Sample(x, z).Biome;

    /// <summary>Terrain solidity before caves: a 2D surface, bent into cliffs and overhangs in rugged high ground.</summary>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public bool SolidAt(in Column c, int x, int y, int z)
    {
        if (c.Overhang <= 0f) return y < c.Height;
        float d = c.HeightF - y;
        if (d > c.Overhang + 1f) return true;
        if (d < -c.Overhang - 1f) return false;
        float n = _over.Fbm3(x / 38.0, y / 26.0, z / 38.0, 2);
        return d + n * c.Overhang > 0f;
    }

    /// <summary>First air above the ground at a column, 3D shaping included (caves ignored).</summary>
    public int SurfaceY(int x, int z)
    {
        var c = Sample(x, z);
        return SurfaceY(c, x, z);
    }

    public int SurfaceY(in Column c, int x, int z)
    {
        if (c.Overhang <= 0f) return c.Height;
        int top = Math.Min(V.Height - 1, (int)(c.HeightF + c.Overhang + 2));
        for (int y = top; y > 0; y--) if (SolidAt(c, x, y, z)) return y + 1;
        return 1;
    }

    /// <summary>A 15-bit grass/foliage tint from climate (smooth, so it needs no blending).</summary>
    public ushort TintAt(int x, int z, out ushort foliage)
    {
        float t = Math.Clamp((_temp.Fbm2(x / 1400.0, z / 1400.0, 3) * 1.3f + 1f) * 0.5f, 0f, 1f);
        float h = Math.Clamp((_hum.Fbm2(x / 1100.0 + 13.7, z / 1100.0 - 4.1, 3) * 1.3f + 1f) * 0.5f, 0f, 1f);
        // Corners: cold-dry, cold-wet, hot-dry, hot-wet.
        float r = Bilerp(0.42f, 0.30f, 0.62f, 0.28f, t, h);
        float g = Bilerp(0.64f, 0.58f, 0.64f, 0.62f, t, h);
        float b = Bilerp(0.48f, 0.38f, 0.28f, 0.18f, t, h);
        float v = _patch.Noise2(x / 90.0, z / 90.0) * 0.04f;
        foliage = Pack15(r * 0.86f + v, g * 0.9f + v, b * 0.8f + v);
        return Pack15(r + v, g + v, b + v);
    }

    private static float Bilerp(float a, float b, float c, float d, float t, float h) =>
        Smooth.Lerp(Smooth.Lerp(a, b, h), Smooth.Lerp(c, d, h), t);

    public static ushort Pack15(float r, float g, float b)
    {
        int R = Math.Clamp((int)(r * 31f + 0.5f), 0, 31);
        int G = Math.Clamp((int)(g * 31f + 0.5f), 0, 31);
        int B = Math.Clamp((int)(b * 31f + 0.5f), 0, 31);
        return (ushort)(R | (G << 5) | (B << 10));
    }

    // --- caves ------------------------------------------------------------------------

    private const int CG = 4;                   // cave noise lattice spacing
    [ThreadStatic] private static float[] _caveGrid;

    /// <summary>Samples the cave noise on a coarse lattice and trilinearly fills a carve mask.</summary>
    private void CaveMask(int wx0, int wz0, int[] surface, Column[] cols, bool[] carve)
    {
        const int NX = V.Size / CG + 1, NY = V.Height / CG + 1;
        _caveGrid ??= new float[NX * NX * NY * 2];
        var g = _caveGrid;
        for (int gy = 0; gy < NY; gy++)
            for (int gz = 0; gz < NX; gz++)
                for (int gx = 0; gx < NX; gx++)
                {
                    int x = wx0 + gx * CG, y = gy * CG, z = wz0 + gz * CG;
                    int i = ((gy * NX + gz) * NX + gx) * 2;
                    g[i] = _cheese.Fbm3(x / 110.0, y / 60.0, z / 110.0, 2);
                    float a = _sp1.Noise3(x / 70.0, y / 44.0, z / 70.0);
                    float b = _sp2.Noise3(x / 70.0, y / 44.0, z / 70.0);
                    g[i + 1] = a * a + b * b;
                }

        for (int lz = 0; lz < V.Size; lz++)
            for (int lx = 0; lx < V.Size; lx++)
            {
                int ci = (lz << 4) | lx;
                int surf = surface[ci];
                var col = cols[ci];
                bool wet = col.Height < V.SeaLevel;
                float ent = _entrance.Noise2((wx0 + lx) / 90.0, (wz0 + lz) / 90.0);
                int maxY = wet ? col.Height - 6 : (ent > 0.45f ? surf + 1 : surf - 6);
                maxY = Math.Min(maxY, V.Height - 2);
                int gx = lx / CG, gz = lz / CG;
                float fx = (lx % CG) / (float)CG, fz = (lz % CG) / (float)CG;
                for (int y = 2; y < maxY; y++)
                {
                    int gy = y / CG;
                    float fy = (y % CG) / (float)CG;
                    float cheese = Tri(g, gx, gy, gz, fx, fy, fz, 0);
                    float spag = Tri(g, gx, gy, gz, fx, fy, fz, 1);
                    // Caverns open up with depth and close toward the surface.
                    float depthOpen = Smooth.Step(70f, 20f, y);
                    bool cav = cheese > 0.62f - 0.18f * depthOpen && y < 72;
                    float tw = 0.011f + 0.006f * depthOpen;
                    bool tun = spag < tw;
                    if (cav || tun) carve[(y << 8) | ci] = true;
                }
            }
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static float Tri(float[] g, int gx, int gy, int gz, float fx, float fy, float fz, int ch)
    {
        const int NX = V.Size / CG + 1;
        int i000 = ((gy * NX + gz) * NX + gx) * 2 + ch;
        int sy = NX * NX * 2, sz = NX * 2, sx = 2;
        float c00 = Smooth.Lerp(g[i000], g[i000 + sx], fx);
        float c10 = Smooth.Lerp(g[i000 + sz], g[i000 + sz + sx], fx);
        float c01 = Smooth.Lerp(g[i000 + sy], g[i000 + sy + sx], fx);
        float c11 = Smooth.Lerp(g[i000 + sy + sz], g[i000 + sy + sz + sx], fx);
        return Smooth.Lerp(Smooth.Lerp(c00, c10, fz), Smooth.Lerp(c01, c11, fz), fy);
    }

    /// <summary>
    /// Worm tunnels: random walks seeded per column within reach, each carving
    /// its own spheres. Some pitch steeply and become shafts to the surface.
    /// </summary>
    private void Worms(int cx, int cz, bool[] carve, int[] surface)
    {
        const int reach = 6;
        int wx0 = cx << 4, wz0 = cz << 4;
        for (int oz = cz - reach; oz <= cz + reach; oz++)
            for (int ox = cx - reach; ox <= cx + reach; ox++)
            {
                var rng = new Rng(Hash.Of(Seed ^ 0x57A1, ox, oz, 77));
                if (!rng.Chance(0.07f)) continue;
                bool shaft = rng.Chance(0.18f);
                double x = (ox << 4) + rng.Range(0, 16), z = (oz << 4) + rng.Range(0, 16);
                double y = shaft ? rng.Range(40, 90) : rng.Range(12, 64);
                float yaw = rng.Range(0, MathF.Tau), pitch = shaft ? -1.2f : rng.Range(-0.3f, 0.3f);
                int len = rng.Int(70, 170);
                float baseR = shaft ? rng.Range(1.6f, 2.6f) : rng.Range(1.3f, 2.6f);
                for (int s = 0; s < len; s++)
                {
                    float r = baseR + MathF.Sin(s * 0.19f) * 0.6f + (rng.Chance(0.02f) ? 2.5f : 0f);
                    // Only carve when the sphere touches this column.
                    if (x + r >= wx0 && x - r < wx0 + 16 && z + r >= wz0 && z - r < wz0 + 16)
                        CarveSphere(carve, surface, x - wx0, y, z - wz0, r);
                    yaw += rng.Range(-0.25f, 0.25f);
                    pitch = shaft ? Math.Clamp(pitch + rng.Range(-0.05f, 0.05f), -1.5f, -0.9f)
                                  : Math.Clamp(pitch * 0.9f + rng.Range(-0.12f, 0.12f), -0.6f, 0.6f);
                    x += MathF.Cos(yaw) * MathF.Cos(pitch);
                    z += MathF.Sin(yaw) * MathF.Cos(pitch);
                    y += MathF.Sin(pitch);
                    if (shaft) { y = Math.Max(y, 8); }
                    if (y < 6) pitch = MathF.Abs(pitch);
                    if (y > 120) break;
                }
            }
    }

    private static void CarveSphere(bool[] carve, int[] surface, double cx, double cy, double cz, float r)
    {
        int x0 = Math.Max(0, (int)Math.Floor(cx - r)), x1 = Math.Min(15, (int)Math.Ceiling(cx + r));
        int z0 = Math.Max(0, (int)Math.Floor(cz - r)), z1 = Math.Min(15, (int)Math.Ceiling(cz + r));
        int y0 = Math.Max(2, (int)Math.Floor(cy - r)), y1 = Math.Min(V.Height - 2, (int)Math.Ceiling(cy + r));
        float r2 = r * r;
        for (int y = y0; y <= y1; y++)
            for (int z = z0; z <= z1; z++)
                for (int x = x0; x <= x1; x++)
                {
                    double dx = x + 0.5 - cx, dy = (y + 0.5 - cy) * 1.25, dz = z + 0.5 - cz;
                    if (dx * dx + dy * dy + dz * dz > r2) continue;
                    if (y > surface[(z << 4) | x] + 1) continue;
                    carve[(y << 8) | (z << 4) | x] = true;
                }
    }

    // --- the column --------------------------------------------------------------------

    [ThreadStatic] private static bool[] _carve;

    /// <summary>Fills a new column with terrain, water, caves, ores, plants, trees and ruins.</summary>
    public void Generate(Chunk ch)
    {
        int wx0 = ch.WorldX, wz0 = ch.WorldZ;
        var cols = new Column[256];
        var surface = new int[256];
        var blocks = ch.Blocks;

        for (int lz = 0; lz < 16; lz++)
            for (int lx = 0; lx < 16; lx++)
            {
                int ci = (lz << 4) | lx;
                cols[ci] = Sample(wx0 + lx, wz0 + lz);
                surface[ci] = SurfaceY(cols[ci], wx0 + lx, wz0 + lz);
            }

        // Stone, crust, water. Scanned top-down so each solid cell knows how deep it is.
        Span<bool> solid = stackalloc bool[V.Height];
        for (int lz = 0; lz < 16; lz++)
            for (int lx = 0; lx < 16; lx++)
            {
                int ci = (lz << 4) | lx;
                ref var c = ref cols[ci];
                int x = wx0 + lx, z = wz0 + lz;
                var bi = Biomes.Get(c.Biome);
                int surf = surface[ci];
                int slateTop = 14 + (int)(_slate.Noise2(x / 60.0, z / 60.0) * 5f);
                int fillDepth = bi.FillerDepth + (int)(_patch.Noise2(x / 13.0, z / 13.0) * 1.5f);
                bool underwater = surf <= V.SeaLevel;
                int top = Math.Max(surf, V.SeaLevel + 1);

                for (int y = 0; y < top; y++) solid[y] = y == 0 || SolidAt(c, x, y, z);
                int depth = -1;
                for (int y = top - 1; y >= 0; y--)
                {
                    ushort id;
                    if (!solid[y])
                    {
                        depth = -1;
                        id = y <= V.SeaLevel ? Blocks.Water : Blocks.Air;
                    }
                    else
                    {
                        depth = Math.Min(depth + 1, 12);
                        if (y < 4 && (y == 0 || Hash.Unit(Hash.Of(Seed, x, y, z)) < 0.5f - y * 0.15f))
                            id = Blocks.Rootstone;
                        else if (depth == 0)
                            id = underwater ? SeaFloor(c, bi, x, z) : SurfaceBlock(c, bi, x, y, z, surf);
                        else if (depth <= fillDepth)
                            id = underwater ? (bi.SeaFloor == Blocks.Mud ? Blocks.Mud : Blocks.Sand) : Filler(c, bi, y, depth);
                        else if (depth <= fillDepth + 3 && bi.Under != Blocks.Stone && !underwater)
                            id = bi.Under;
                        else
                            id = y < slateTop ? Blocks.Slatestone : (c.Biome == Biome.Ashlands && y > 40 ? Blocks.Ashstone : Blocks.Stone);
                    }
                    blocks[(y << 8) | ci] = id;
                }

                // Frozen water in cold places.
                if (bi.Temperature <= -0.75f && blocks[(V.SeaLevel << 8) | ci] == Blocks.Water)
                    blocks[(V.SeaLevel << 8) | ci] = Blocks.Ice;
            }

        // Caves: noise caverns and tunnels, then worms.
        _carve ??= new bool[V.ColumnVolume];
        var carve = _carve;
        Array.Clear(carve);
        CaveMask(wx0, wz0, surface, cols, carve);
        Worms(ch.X, ch.Z, carve, surface);
        int lakeLevel = 18 + (int)(Hash.Unit(Hash.Of(Seed, ch.X >> 3, ch.Z >> 3, 5)) * 18f);
        bool lakeRegion = _lake.Noise2(wx0 / 160.0, wz0 / 160.0) > 0.25f;
        for (int ci = 0; ci < 256; ci++)
        {
            bool prevWater = false;
            for (int y = 1; y < V.Height - 1; y++)
            {
                int i = (y << 8) | ci;
                if (!carve[i]) { prevWater = false; continue; }
                ushort b = blocks[i];
                if (b == Blocks.Air || b == Blocks.Water || b == Blocks.Ice || b == Blocks.Rootstone) { prevWater = b == Blocks.Water; continue; }
                // Never open a hole into the sea or under a lake.
                if (TouchesWater(blocks, ci, y)) { prevWater = false; continue; }
                ushort fill = Blocks.Air;
                if (y <= 10) fill = Blocks.Lava;
                else if (lakeRegion && y >= 14 && y <= lakeLevel && (prevWater || !IsAirOrCarved(blocks, carve, ci, y - 1))) fill = Blocks.Water;
                blocks[i] = fill;
                prevWater = fill == Blocks.Water;
            }
        }
        // Soil exposed at the top of a carved hole should not float as grass over nothing.
        for (int ci = 0; ci < 256; ci++)
        {
            int s = surface[ci] - 1;
            if (s < 2) continue;
            int i = (s << 8) | ci;
            ushort b = blocks[i];
            if ((b == Blocks.Sand || b == Blocks.Gravel) && blocks[((s - 1) << 8) | ci] == Blocks.Air)
                blocks[i] = b == Blocks.Sand ? Blocks.Sandstone : Blocks.Stone;
        }

        FillTints(ch);

        Ores(ch);
        ch.Recount();

        Decorate(ch, cols);
        Trees.Place(ch);
        Structures.Place(ch);
        ch.Recount();
    }

    /// <summary>Per-column grass and foliage colours for the mesher (also needed after loading a saved column).</summary>
    public void FillTints(Chunk ch)
    {
        for (int lz = 0; lz < 16; lz++)
            for (int lx = 0; lx < 16; lx++)
            {
                ch.GrassTint[(lz << 4) | lx] = TintAt(ch.WorldX + lx, ch.WorldZ + lz, out var fol);
                ch.FoliageTint[(lz << 4) | lx] = fol;
            }
    }

    private static bool TouchesWater(ushort[] blocks, int ci, int y)
    {
        int lx = ci & 15, lz = ci >> 4;
        if (y + 1 < V.Height && IsWater(blocks[((y + 1) << 8) | ci])) return true;
        if (lx > 0 && IsWater(blocks[(y << 8) | ci - 1])) return true;
        if (lx < 15 && IsWater(blocks[(y << 8) | ci + 1])) return true;
        if (lz > 0 && IsWater(blocks[(y << 8) | ci - 16])) return true;
        if (lz < 15 && IsWater(blocks[(y << 8) | ci + 16])) return true;
        return false;
    }

    private static bool IsWater(ushort b) => b == Blocks.Water || b == Blocks.Ice;

    private static bool IsAirOrCarved(ushort[] blocks, bool[] carve, int ci, int y)
    {
        int i = (y << 8) | ci;
        return blocks[i] == Blocks.Air || carve[i];
    }

    /// <summary>What the generator puts on top of a column (before caves and plants).</summary>
    public ushort GroundBlock(in Column c, int x, int y, int z)
    {
        var bi = Biomes.Get(c.Biome);
        return y < V.SeaLevel ? SeaFloor(c, bi, x, z) : SurfaceBlock(c, bi, x, y, z, y + 1);
    }

    private ushort SurfaceBlock(in Column c, BiomeInfo bi, int x, int y, int z, int surf)
    {
        float p = _patch.Noise2(x / 11.0, z / 11.0);
        switch (c.Biome)
        {
            case Biome.Peaks:
                if (y >= 150 + (int)(p * 8)) return Blocks.SnowyGrass;
                if (y < 118 && p > -0.2f) return Blocks.Grass;
                return p > 0.45f ? Blocks.Gravel : Blocks.Stone;
            case Biome.Pinereach:
                if (y > 115) return Blocks.SnowyGrass;
                return p > 0.35f ? Blocks.ForestFloor : Blocks.Grass;
            case Biome.Elderwood:
                return p > 0.3f ? Blocks.Grass : Blocks.ForestFloor;
            case Biome.Mirewood:
                return p > 0.4f ? Blocks.Mud : Blocks.Grass;
            case Biome.Savanna:
                return p > 0.62f ? Blocks.Dirt : Blocks.Grass;
            case Biome.Ashlands:
                return p > 0.3f ? Blocks.Ashstone : Blocks.Cinder;
            case Biome.Shore:
                if (c.Temp < -0.45f) return Blocks.Gravel;
                return Blocks.Sand;
            case Biome.River:
                return y >= V.SeaLevel ? Blocks.Grass : Blocks.Sand;
            default:
                if (y > 118 && c.Temp < 0.1f) return Blocks.SnowyGrass;
                return bi.Top;
        }
    }

    private ushort Filler(in Column c, BiomeInfo bi, int y, int depth)
    {
        if (c.Biome == Biome.Peaks) return Blocks.Stone;
        return bi.Filler;
    }

    private ushort SeaFloor(in Column c, BiomeInfo bi, int x, int z)
    {
        float p = _patch.Noise2(x / 9.0, z / 9.0);
        if (c.Biome == Biome.River) return p > 0.35f ? Blocks.Clay : p < -0.35f ? Blocks.Gravel : Blocks.Sand;
        if (c.Biome == Biome.Mirewood) return Blocks.Mud;
        if (bi.SeaFloor == Blocks.Gravel) return p > 0.5f ? Blocks.Sand : Blocks.Gravel;
        if (c.Height < 50) return p > 0.3f ? Blocks.Gravel : p < -0.55f ? Blocks.Clay : Blocks.Sand;
        return p > 0.55f ? Blocks.Clay : p < -0.5f ? Blocks.Gravel : Blocks.Sand;
    }

    // --- ores ---------------------------------------------------------------------------

    private void Ores(Chunk ch)
    {
        var rng = new Rng(Hash.Of(Seed ^ 0x0E5, ch.X, ch.Z));
        var b = ch.Blocks;
        Vein(ch, ref rng, Blocks.SootOre, 18, 5, 128, 70, 4, 12);
        Vein(ch, ref rng, Blocks.CopperOre, 11, 0, 96, 48, 4, 10);
        Vein(ch, ref rng, Blocks.IronOre, 9, 0, 72, 28, 3, 8);
        Vein(ch, ref rng, Blocks.SilverOre, 4, 0, 40, 16, 3, 6);
        Vein(ch, ref rng, Blocks.GoldOre, 3, 0, 32, 12, 3, 6);
        Vein(ch, ref rng, Blocks.Gravel, 6, 5, 110, 50, 12, 28, host: true);
        Vein(ch, ref rng, Blocks.Dirt, 5, 20, 110, 60, 12, 26, host: true);
        Vein(ch, ref rng, Blocks.Ashstone, 5, 5, 90, 40, 14, 30, host: true);
        if (rng.Chance(0.3f)) Vein(ch, ref rng, Blocks.StarmetalOre, 1, 2, 16, 8, 1, 3, slateOnly: true);

        // Lumen crystals grow on cave walls in the deep.
        for (int k = 0; k < 50; k++)
        {
            int x = rng.Int(1, 14), y = rng.Int(3, 30), z = rng.Int(1, 14);
            int i = (y << 8) | (z << 4) | x;
            if (!IsHost(b[i])) continue;
            if (!NextToAir(b, x, y, z)) continue;
            int n = rng.Int(1, 4);
            for (int j = 0; j < n; j++)
            {
                int xx = Math.Clamp(x + rng.Int(-1, 1), 0, 15), yy = Math.Clamp(y + rng.Int(-1, 1), 1, 60), zz = Math.Clamp(z + rng.Int(-1, 1), 0, 15);
                int ii = (yy << 8) | (zz << 4) | xx;
                if (IsHost(b[ii])) b[ii] = Blocks.LumenOre;
            }
        }
    }

    private static bool IsHost(ushort id) => id == Blocks.Stone || id == Blocks.Slatestone || id == Blocks.Ashstone;

    private static bool NextToAir(ushort[] b, int x, int y, int z)
    {
        return (x > 0 && b[(y << 8) | (z << 4) | (x - 1)] == 0) || (x < 15 && b[(y << 8) | (z << 4) | (x + 1)] == 0) ||
               (z > 0 && b[(y << 8) | ((z - 1) << 4) | x] == 0) || (z < 15 && b[(y << 8) | ((z + 1) << 4) | x] == 0) ||
               b[((y + 1) << 8) | (z << 4) | x] == 0 || (y > 0 && b[((y - 1) << 8) | (z << 4) | x] == 0);
    }

    /// <summary>Blobs of ore grown by a short random walk, denser around a preferred depth.</summary>
    private static void Vein(Chunk ch, ref Rng rng, ushort ore, int count, int minY, int maxY, int peakY, int minSize, int maxSize,
        bool host = false, bool slateOnly = false)
    {
        var b = ch.Blocks;
        for (int v = 0; v < count; v++)
        {
            // Triangular distribution around the peak.
            float u = (rng.Float() + rng.Float()) * 0.5f;
            int y = u < 0.5f ? (int)(minY + (peakY - minY) * u * 2f) : (int)(peakY + (maxY - peakY) * (u - 0.5f) * 2f);
            int x = rng.Int(2, 13), z = rng.Int(2, 13);
            int size = rng.Int(minSize, maxSize);
            for (int s = 0; s < size; s++)
            {
                if (y < 1 || y >= V.Height) break;
                int i = (y << 8) | (z << 4) | x;
                ushort cur = b[i];
                bool ok = slateOnly ? cur == Blocks.Slatestone : host ? cur == Blocks.Stone : IsHost(cur);
                if (ok) b[i] = ore;
                switch (rng.Int(0, 5))
                {
                    case 0: x = Math.Min(15, x + 1); break;
                    case 1: x = Math.Max(0, x - 1); break;
                    case 2: z = Math.Min(15, z + 1); break;
                    case 3: z = Math.Max(0, z - 1); break;
                    case 4: y++; break;
                    default: y--; break;
                }
            }
        }
    }

    // --- ground cover ------------------------------------------------------------------

    private void Decorate(Chunk ch, Column[] cols)
    {
        var b = ch.Blocks;
        var rng = new Rng(Hash.Of(Seed ^ 0xDEC0, ch.X, ch.Z));
        int wx0 = ch.WorldX, wz0 = ch.WorldZ;
        for (int lz = 0; lz < 16; lz++)
            for (int lx = 0; lx < 16; lx++)
            {
                int ci = (lz << 4) | lx;
                var c = cols[ci];
                var bi = Biomes.Get(c.Biome);
                int top = ch.TopY;
                int y = top;
                while (y > 0 && b[(y << 8) | ci] == 0) y--;
                if (y <= 0 || y >= V.Height - 4) continue;
                ushort ground = b[(y << 8) | ci];
                int above = ((y + 1) << 8) | ci;
                float r = rng.Float();
                int x = wx0 + lx, z = wz0 + lz;

                if (ground == Blocks.Water)
                {
                    // Reeds along shallow edges.
                    continue;
                }
                bool grassy = ground == Blocks.Grass || ground == Blocks.ForestFloor || ground == Blocks.SnowyGrass;
                if (grassy)
                {
                    float fl = _glow.Noise2(x / 18.0, z / 18.0);  // flowers come in drifts
                    if (r < bi.Bushes) { b[above] = Blocks.BerryBush; continue; }
                    r -= bi.Bushes;
                    if (r < bi.Flowers * (1.5f + fl * 2f) && bi.FlowerKinds.Length > 0)
                    {
                        int k = (int)(Hash.Unit(Hash.Of(Seed, x >> 3, z >> 3, 9)) * bi.FlowerKinds.Length);
                        b[above] = bi.FlowerKinds[Math.Min(k, bi.FlowerKinds.Length - 1)];
                        continue;
                    }
                    r -= Math.Max(0f, bi.Flowers * (1.5f + fl * 2f));
                    if (r < bi.Ferns) { b[above] = Blocks.Fern; continue; }
                    r -= bi.Ferns;
                    if (r < bi.Mushrooms) { b[above] = rng.Chance(0.5f) ? Blocks.Umbercap : Blocks.Blushcap; continue; }
                    r -= bi.Mushrooms;
                    if (r < bi.Grass) { b[above] = Blocks.TallGrass; continue; }
                    if (NearWater(b, lx, y, lz) && rng.Chance(0.25f) && y <= V.SeaLevel + 2) PlaceReeds(b, ci, y, ref rng);
                    continue;
                }
                if (ground == Blocks.Sand)
                {
                    if (c.Biome == Biome.Dunes)
                    {
                        if (r < 0.006f) { int h = rng.Int(1, 3); for (int k = 1; k <= h; k++) b[((y + k) << 8) | ci] = Blocks.Spinecactus; }
                        else if (r < 0.014f) b[above] = Blocks.DeadBush;
                    }
                    else if (NearWater(b, lx, y, lz) && rng.Chance(0.12f) && y <= V.SeaLevel + 2) PlaceReeds(b, ci, y, ref rng);
                    continue;
                }
                if (ground == Blocks.Mud && NearWater(b, lx, y, lz) && rng.Chance(0.3f)) { PlaceReeds(b, ci, y, ref rng); continue; }
                if (ground == Blocks.Cinder && r < 0.01f) b[above] = Blocks.DeadBush;
            }

        // Lava pools in the Ashlands, glowcaps and mushrooms in caves.
        for (int k = 0; k < 24; k++)
        {
            int lx = rng.Int(0, 15), lz = rng.Int(0, 15), y = rng.Int(8, 60);
            int ci = (lz << 4) | lx;
            if (b[(y << 8) | ci] != 0) continue;
            int yy = y;
            while (yy > 2 && b[((yy - 1) << 8) | ci] == 0) yy--;
            ushort floor = b[((yy - 1) << 8) | ci];
            if (floor != Blocks.Stone && floor != Blocks.Slatestone && floor != Blocks.Dirt && floor != Blocks.Gravel) continue;
            float g = _glow.Noise3((ch.WorldX + lx) / 40.0, yy / 30.0, (ch.WorldZ + lz) / 40.0);
            ushort plant = g > 0.35f ? Blocks.Glowcap : rng.Chance(0.4f) ? Blocks.Umbercap : Blocks.Blushcap;
            if (g > 0.35f || rng.Chance(0.3f)) b[(yy << 8) | ci] = plant;
        }
        if (cols[136].Biome == Biome.Ashlands)
        {
            var r2 = new Rng(Hash.Of(Seed ^ 0xA5, ch.X, ch.Z));
            if (r2.Chance(0.2f)) LavaPool(ch, ref r2);
        }
    }

    private static bool NearWater(ushort[] b, int lx, int y, int lz)
    {
        for (int dz = -1; dz <= 1; dz++)
            for (int dx = -1; dx <= 1; dx++)
            {
                int x = lx + dx, z = lz + dz;
                if ((uint)x > 15 || (uint)z > 15) continue;
                if (b[(y << 8) | (z << 4) | x] == Blocks.Water) return true;
            }
        return false;
    }

    private static void PlaceReeds(ushort[] b, int ci, int y, ref Rng rng)
    {
        int h = rng.Int(1, 3);
        for (int k = 1; k <= h; k++)
        {
            int i = ((y + k) << 8) | ci;
            if (b[i] != 0) break;
            b[i] = Blocks.Reeds;
        }
    }

    private static void LavaPool(Chunk ch, ref Rng rng)
    {
        var b = ch.Blocks;
        int cx = rng.Int(4, 11), cz = rng.Int(4, 11);
        int ci = (cz << 4) | cx;
        int y = ch.TopY;
        while (y > 1 && b[(y << 8) | ci] == 0) y--;
        float r = rng.Range(2f, 3.6f);
        for (int z = 0; z < 16; z++)
            for (int x = 0; x < 16; x++)
            {
                float d = MathF.Sqrt((x - cx) * (x - cx) + (z - cz) * (z - cz));
                if (d > r) continue;
                int c2 = (z << 4) | x;
                int top = y + 2;
                while (top > 1 && b[(top << 8) | c2] == 0) top--;
                if (Math.Abs(top - y) > 2) continue;
                for (int yy = y + 1; yy <= y + 4; yy++) b[(yy << 8) | c2] = 0;
                b[(y << 8) | c2] = Blocks.Lava;
                if (d < r - 1.2f) b[((y - 1) << 8) | c2] = Blocks.Lava;
                b[((y - 2) << 8) | c2] = Blocks.Ashstone;
            }
    }

    // --- spawn -------------------------------------------------------------------------

    /// <summary>A dry, gentle place to start, searched outward from the origin.</summary>
    public (int x, int y, int z) FindSpawn()
    {
        for (int r = 0; r < 4000; r += 24)
        {
            int steps = Math.Max(1, r / 12);
            for (int s = 0; s < steps; s++)
            {
                float a = s * MathF.Tau / steps;
                int x = (int)(MathF.Cos(a) * r), z = (int)(MathF.Sin(a) * r);
                var c = Sample(x, z);
                if (c.Biome is Biome.Meadow or Biome.Elderwood or Biome.Pinereach or Biome.Savanna && c.Overhang <= 0f
                    && c.Height > V.SeaLevel + 1 && c.Height < 100 && c.River < 0.2f)
                    return (x, c.Height, z);
            }
        }
        var c0 = Sample(0, 0);
        return (0, Math.Max(c0.Height, V.SeaLevel + 1), 0);
    }
}
