using System;
using Godot;

namespace Strata;

/// <summary>
/// The showcase landmarks of a world created with them: Castle Vorhaal on
/// its crag above a dead village, and the launch complex out on the plain to
/// the east. The site reshapes the terrain under both (a mountain with sheer
/// cliffs, a rock spur for the approach road, a gorge, a flat plain) and
/// stamps the buildings into every column it touches as that column is
/// generated. Everything is laid out once, deterministically, the first time
/// a column needs it, so any load order builds the same world.
///
/// Local coordinates: +x east, +z south, the castle's centre at (0, 0).
/// </summary>
public sealed class LandmarkSite
{
    public const int Plateau = 118;        // the castle's ground floor
    public const int Valley = 68;          // the village and the plain
    public const int SpurTop = 116;
    public static readonly Vector2I SpurCentre = new(19, 97);
    public const int SpurRadius = 15;
    public const int GateX = 19;           // the castle gate, the bridge and the barbican line up on this x
    public static readonly Vector2I VillageCentre = new(-58, 138);
    public static readonly Vector2I Lookout = new(-46, 170);
    public const int LookoutTop = 99;        // first air on the watchtower's platform, where a new player arrives
    public static readonly Vector2I PadCentre = new(236, 34);      // the rocket stands here
    public static readonly Vector2I ComplexCentre = new(236, 34);

    public readonly WorldGen Gen;
    public readonly int Ox, Oz;             // world position of the local origin
    private readonly Simplex _n1, _n2, _n3;
    private readonly object _lock = new();
    private volatile Canvas _canvas;
    private readonly int _minCx, _maxCx, _minCz, _maxCz;

    /// <summary>Where a new player starts: at the head of the village street, facing the castle.</summary>
    public Vector3 Spawn => new(Ox + Lookout.X + 0.5f, LookoutTop, Oz + Lookout.Y + 0.5f);
    public Vector3 PadWorld => new(Ox + PadCentre.X + 0.5f, LaunchComplex.Deck, Oz + PadCentre.Y + 0.5f);

    public LandmarkSite(WorldGen gen)
    {
        Gen = gen;
        _n1 = new Simplex(gen.Seed * 7 + 101);
        _n2 = new Simplex(gen.Seed * 7 + 102);
        _n3 = new Simplex(gen.Seed * 7 + 103);
        (Ox, Oz) = ChooseOrigin(gen);
        _minCx = (Ox - 260) >> V.Shift; _maxCx = (Ox + 420) >> V.Shift;
        _minCz = (Oz - 260) >> V.Shift; _maxCz = (Oz + 260) >> V.Shift;
    }

    /// <summary>Somewhere on dry land with dry land all around, searched outward from the world's centre.</summary>
    private static (int, int) ChooseOrigin(WorldGen gen)
    {
        for (int r = 0; r < 6000; r += 180)
        {
            int steps = Math.Max(1, r / 120);
            for (int s = 0; s < steps; s++)
            {
                float a = s * MathF.Tau / steps;
                int ox = (int)(MathF.Cos(a) * r), oz = (int)(MathF.Sin(a) * r);
                bool ok = true;
                for (int k = 0; k < 16 && ok; k++)
                {
                    float b = k * MathF.Tau / 16;
                    var c = gen.Sample(ox + 110 + (int)(MathF.Cos(b) * 300), oz + 20 + (int)(MathF.Sin(b) * 240));
                    ok = c.Height > V.SeaLevel + 2 && c.Biome != Biome.Peaks && c.River < 0.3f;
                }
                if (ok) return (ox & ~15, oz & ~15);
            }
        }
        return (0, 0);
    }

    // --- the shape of the land -----------------------------------------------------------

    /// <summary>How much of the site's terrain replaces the natural terrain here: 1 inside, falling to 0 at the edge.</summary>
    public float Weight(int lx, int lz)
    {
        float castle = 1f - Smooth.Step(185f, 235f, Dist(lx, lz, 0, 40));
        float complex = 1f - Smooth.Step(125f, 170f, Dist(lx, lz, ComplexCentre.X, ComplexCentre.Y));
        float corridor = 1f - Smooth.Step(60f, 100f, SegDist(lx, lz, 20, 130, ComplexCentre.X - 60, ComplexCentre.Y + 20));
        return Math.Max(castle, Math.Max(complex, corridor));
    }

    /// <summary>The castle's crag: 0 on the plateau, rising past 1 down its cliffs, with a ragged edge.</summary>
    public float CragU(int lx, int lz)
    {
        float dx = lx, dz = lz + 4;
        float d = MathF.Sqrt(dx * dx + dz * dz);
        float a = MathF.Atan2(dz, dx);
        float r = 64f + _n1.Fbm2(MathF.Cos(a) * 1.6 + 5, MathF.Sin(a) * 1.6 + 5, 3) * 9f;
        return d / r;
    }

    /// <summary>The height of the site's ground at a point (the top of the last solid block is at this height).</summary>
    public int Height(int lx, int lz)
    {
        float hills = _n2.Fbm2(lx / 90.0, lz / 90.0, 3) * 4f + _n3.Fbm2(lx / 23.0, lz / 23.0, 2) * 1.2f;
        float flat = Math.Max(1f - Smooth.Step(95f, 125f, Dist(lx, lz, ComplexCentre.X, ComplexCentre.Y)),
            1f - Smooth.Step(28f, 44f, Dist(lx, lz, VillageCentre.X, VillageCentre.Y)) * 0.8f);
        float h = Valley + hills * (1f - flat) - 0.5f;

        // The crag: a flat top, sheer cliffs with ledges, a skirt of scree.
        float u = CragU(lx, lz);
        if (u < 1.5f)
        {
            float crag;
            if (u < 1f) crag = Plateau - 0.5f + MathF.Max(0f, _n3.Noise2(lx / 9.0, lz / 9.0)) * 0.9f;
            else
            {
                float t = (u - 1f) / 0.5f;
                float drop = MathF.Pow(Smooth.Step(0f, 1f, t), 0.55f);
                float ledges = MathF.Floor(drop * 7f) / 7f * 0.35f + drop * 0.65f;
                float rough = _n1.Fbm2(lx / 14.0, lz / 14.0, 3) * 7f * (1f - t);
                crag = Plateau - (Plateau - Valley) * ledges + rough;
            }
            h = MathF.Max(h, crag);
        }

        // The spur the road climbs: a stump of rock standing off the crag's south face.
        // The spur the road climbs: a sheer stump of rock standing off the crag's south face
        // (the road winds round it on a shelf of its own, so the ground outside the stump stays low).
        float ds = Dist(lx, lz, SpurCentre.X, SpurCentre.Y);
        if (ds < SpurRadius + 0.5f)
            h = MathF.Max(h, SpurTop - 0.5f - MathF.Max(0f, ds - SpurRadius + 1.5f) * 3f);

        // A knoll by the village where the road first comes in sight of the castle.
        float dk = Dist(lx, lz, Lookout.X, Lookout.Y);
        if (dk < 22f) h = MathF.Max(h, Valley + 9.5f * (1f - Smooth.Step(5f, 22f, dk)) - 0.5f);

        // The gorge between spur and crag, cut down to a dry stream bed.
        if (lz > 54 && lz < 84 && Math.Abs(lx) < 60 && u > 0.97f && ds > SpurRadius + 0.5f)
        {
            float bed = Valley + 10 + MathF.Abs(lx) * 0.25f + _n3.Noise2(lx / 6.0, lz / 6.0) * 1.5f;
            float side = Smooth.Step(0f, 6f, Math.Min(lz - 54, 84 - lz));
            h = MathF.Min(h, Smooth.Lerp(h, bed, side));
        }
        return Math.Clamp((int)MathF.Floor(h), 5, V.Height - 20);
    }

    /// <summary>Near the castle the land is dead: greys and browns instead of green.</summary>
    public float Gloom(int lx, int lz) => 1f - Smooth.Step(150f, 210f, Dist(lx, lz, 0, 30));

    private static float Dist(float x, float z, float cx, float cz) => MathF.Sqrt((x - cx) * (x - cx) + (z - cz) * (z - cz));

    private static float SegDist(float x, float z, float ax, float az, float bx, float bz)
    {
        float vx = bx - ax, vz = bz - az;
        float t = Math.Clamp(((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz), 0f, 1f);
        return Dist(x, z, ax + vx * t, az + vz * t);
    }

    // --- building ------------------------------------------------------------------------

    /// <summary>The laid-out buildings, built the first time anything asks (a second or two, once per world).</summary>
    public Canvas Canvas
    {
        get
        {
            if (_canvas != null) return _canvas;
            lock (_lock)
            {
                if (_canvas == null)
                {
                    var sw = System.Diagnostics.Stopwatch.StartNew();
                    var c = new Canvas(Ox, Oz);
                    var rng = new Rng(Hash.Of(Gen.Seed, 0x5A17E, 0, 0));
                    new Surroundings(this, c, rng).Build();
                    new Castle(this, c, new Rng(Hash.Of(Gen.Seed, 0xCA571E, 0, 0))).Build();
                    new LaunchComplex(this, c, new Rng(Hash.Of(Gen.Seed, 0x1A0C4, 0, 0))).Build();
                    _canvas = c;
                    GD.Print($"landmarks laid out: {c.Cells} blocks in {c.Columns.Count} columns, {sw.ElapsedMilliseconds} ms, at {Ox}, {Oz}");
                }
            }
            return _canvas;
        }
    }

    public bool Touches(int cx, int cz) => cx >= _minCx && cx <= _maxCx && cz >= _minCz && cz <= _maxCz;

    /// <summary>The first air above the site's ground at a world column, given the natural one (as <see cref="Apply"/> lays it).</summary>
    public int GroundAt(int wx, int wz, int natural)
    {
        int x = wx - Ox, z = wz - Oz;
        float w = Weight(x, z);
        if (w <= 0f) return natural;
        int site = Height(x, z) + 1;
        return w >= 0.999f ? site : (int)MathF.Round(Smooth.Lerp(natural, site, Smooth.Step(0f, 1f, w)));
    }

    /// <summary>Reshapes a freshly generated column to the site's terrain and stamps the buildings into it.</summary>
    public void Apply(Chunk ch)
    {
        if (!Touches(ch.X, ch.Z)) return;
        var b = ch.Blocks;
        bool any = false;
        for (int lz = 0; lz < 16; lz++)
            for (int lx = 0; lx < 16; lx++)
            {
                int x = ch.WorldX + lx - Ox, z = ch.WorldZ + lz - Oz;
                float w = Weight(x, z);
                if (w <= 0f) continue;
                any = true;
                int ci = (lz << 4) | lx;
                // Where the natural ground was.
                int top = V.Height - 2;
                while (top > 1 && (b[(top << 8) | ci] == Blocks.Air || !Blocks.ById[b[(top << 8) | ci]].Solid)) top--;
                int natural = top + 1;
                int site = Height(x, z) + 1;
                int ground = w >= 0.999f ? site : (int)MathF.Round(Smooth.Lerp(natural, site, Smooth.Step(0f, 1f, w)));
                Rebuild(b, ci, x, z, ground, Math.Max(natural, ground), w);
            }

        var col = Canvas.ColumnAt(ch.Key);
        if (col != null)
        {
            for (int i = 0; i < col.Length; i++)
            {
                ushort v = col[i];
                if (v == 0) continue;
                b[i] = v == Canvas.AirMark ? Blocks.Air : v;
            }
            any = true;
            var crates = Canvas.CratesAt(ch.Key);
            if (crates != null)
                foreach (var (index, cx, cy, cz, loot) in crates)
                    if (b[index] == Blocks.Crate)
                        ch.Entities[index] = new CrateEntity { Loot = loot, LootSeed = Hash.Of(Gen.Seed, cx, cy, cz) };
        }
        if (any) ch.Recount();
    }

    /// <summary>Drains the colour from grass and leaves near the castle (run whenever a column's tints are worked out).</summary>
    public void Tint(Chunk ch)
    {
        if (!Touches(ch.X, ch.Z)) return;
        for (int lz = 0; lz < 16; lz++)
            for (int lx = 0; lx < 16; lx++)
            {
                int x = ch.WorldX + lx - Ox, z = ch.WorldZ + lz - Oz;
                float gl = Gloom(x, z) * Smooth.Step(0.3f, 0.7f, Weight(x, z));
                if (gl <= 0f) continue;
                int ci = (lz << 4) | lx;
                ch.GrassTint[ci] = Mix15(ch.GrassTint[ci], WorldGen.Pack15(0.42f, 0.40f, 0.28f), gl * 0.85f);
                ch.FoliageTint[ci] = Mix15(ch.FoliageTint[ci], WorldGen.Pack15(0.36f, 0.34f, 0.24f), gl * 0.85f);
            }
    }

    /// <summary>Lays the site's ground in one cell's column: rock, a skin of soil or scree, and nothing above.</summary>
    private void Rebuild(ushort[] b, int ci, int x, int z, int ground, int clearTo, float w)
    {
        float u = CragU(x, z);
        bool crag = u < 1.8f || Dist(x, z, SpurCentre.X, SpurCentre.Y) < SpurRadius + 17;
        // Steepness from the neighbours, to put bare rock on cliffs and soil on flats.
        int hx = Height(x + 1, z), hz = Height(x, z + 1), hx0 = Height(x - 1, z), hz0 = Height(x, z - 1);
        int slope = Math.Max(Math.Max(Math.Abs(hx - hx0), Math.Abs(hz - hz0)), 0);
        bool steep = slope >= 3;
        for (int y = 4; y < V.Height - 1 && (y < clearTo + 2 || y < ground + 2); y++)
        {
            int i = (y << 8) | ci;
            if (y >= ground) { b[i] = y <= V.SeaLevel ? Blocks.Water : Blocks.Air; continue; }
            int depth = ground - 1 - y;
            ushort id;
            if (crag)
            {
                if (depth == 0 && !steep)
                {
                    float r = Hash.Unit(Hash.Of(Gen.Seed, x, y, z));
                    id = r < 0.14f ? Blocks.Gravel : r < 0.22f ? Blocks.CobbledSlate : Blocks.Grass;
                }
                else if (depth < 3 && !steep) id = Blocks.Dirt;
                else id = RockAt(x, y, z);
            }
            else
            {
                if (depth == 0) id = Blocks.Grass;
                else if (depth < 4) id = Blocks.Dirt;
                else id = y < 16 ? Blocks.Slatestone : Blocks.Stone;
            }
            if (w < 1f && depth > 6) continue;     // at the edge, keep the natural rock (and its ores and caves) below
            b[i] = id;
        }
    }

    /// <summary>The crag's rock: dark duskstone streaked with ordinary stone and slate.</summary>
    public ushort RockAt(int x, int y, int z)
    {
        float n = _n3.Noise3(x / 11.0, y / 6.0, z / 11.0);
        return n > 0.35f ? Blocks.Stone : n < -0.45f ? Blocks.Slatestone : Blocks.Duskstone;
    }

    private static ushort Mix15(ushort a, ushort b, float t)
    {
        int ar = a & 31, ag = (a >> 5) & 31, ab = (a >> 10) & 31;
        int br = b & 31, bg = (b >> 5) & 31, bb = (b >> 10) & 31;
        int r = (int)MathF.Round(ar + (br - ar) * t), g = (int)MathF.Round(ag + (bg - ag) * t), bl = (int)MathF.Round(ab + (bb - ab) * t);
        return (ushort)(r | (g << 5) | (bl << 10));
    }
}
