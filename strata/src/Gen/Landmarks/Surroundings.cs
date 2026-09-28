using System;
using System.Collections.Generic;

namespace Strata;

/// <summary>
/// Everything round the castle: the road that winds up the spur to the
/// barbican, the dead village at the crag's foot with its graveyard and
/// ruined chapel, the dead trees of the valley, old ruins, and the road east
/// to the launch complex.
/// </summary>
public sealed class Surroundings
{
    private readonly LandmarkSite _site;
    private readonly Canvas C;
    private readonly Gothic g;

    public Surroundings(LandmarkSite site, Canvas c, Rng r)
    {
        _site = site; C = c;
        g = new Gothic(site, c, r);
    }

    private int Ground(int x, int z) => _site.Height(x, z) + 1;     // first air

    public void Build()
    {
        SpurRoad();
        Paths();
        Village();
        Wilds();
        Watchtower();
    }

    /// <summary>
    /// The old watchtower on the knoll south of the village, where a new
    /// player arrives: a platform with the whole crag in view, a ladder down.
    /// </summary>
    private void Watchtower()
    {
        var c = LandmarkSite.Lookout;
        int top = LandmarkSite.LookoutTop - 1;           // the platform's floor
        int y0 = Ground(c.X, c.Y);
        const int r = 4;
        g.RoundTower(c.X, c.Y, r, y0, top, Masonry.Old);
        // A knee-high parapet, so the view over it is clear.
        for (int dz = -r; dz <= r; dz++)
            for (int dx = -r; dx <= r; dx++)
                if (Gothic.InDisc(dx, dz, r) && !Gothic.InDisc(dx, dz, r - 1)) C.Set(c.X + dx, top + 1, c.Y + dz, ((dx + dz) & 1) == 0 ? Blocks.CobbledSlate : Blocks.DuskSlab);
        C.Fill(c.X - r + 1, top, c.Y - r + 1, c.X + r - 1, top, c.Y + r - 1, (x, y, z) => Gothic.InDisc(x - c.X, z - c.Y, r - 0.5f) ? Blocks.CobbledSlate : ushort.MaxValue);
        // The ladder down the inside, through a hatch in the platform's south side.
        C.Set(c.X, top, c.Y + 2, Blocks.Air);
        for (int y = y0; y <= top; y++) g.OnWall(Blocks.Ladder, c.X, y, c.Y + 2, Dir.PZ);
        C.Carve(c.X - 1, y0, c.Y - r, c.X + 1, y0 + 2, c.Y - 2);
        C.Set(c.X, y0 + 3, c.Y - r, Blocks.CrimsonLantern);
        for (int y = y0 + 6; y < top; y += 7) C.Set(c.X + r, y, c.Y, Blocks.Air);
        // A brazier and a banner on the platform, facing the castle.
        C.Set(c.X - 2, LandmarkSite.LookoutTop, c.Y - 2, Blocks.Hearthfire);
        C.Set(c.X - 2, top, c.Y - 2, Blocks.CobbledSlate);
        C.Set(c.X + 2, LandmarkSite.LookoutTop, c.Y - 2, Blocks.Candle);
    }

    // --- the road up the spur -----------------------------------------------------------------

    private const float Turns = 1.25f, RoadR = 18f;

    private void SpurRoad()
    {
        var c = LandmarkSite.SpurCentre;
        float a0 = MathF.PI / 2 - Turns * MathF.Tau;          // it arrives at the top on the south side
        int startX = c.X + (int)MathF.Round(MathF.Cos(a0) * RoadR), startZ = c.Y + (int)MathF.Round(MathF.Sin(a0) * RoadR);
        float h0 = Ground(startX + 6, startZ), h1 = LandmarkSite.Plateau;
        var cells = new List<(int x, int z, float s, float h, bool outer)>();
        int R = (int)RoadR + 3;
        for (int dz = -R; dz <= R; dz++)
            for (int dx = -R; dx <= R; dx++)
            {
                float d = MathF.Sqrt(dx * dx + dz * dz);
                if (d < RoadR - 2.5f || d > RoadR + 2.5f) continue;
                float a = MathF.Atan2(dz, dx);
                for (int k = -3; k <= 3; k++)
                {
                    float s = (a + k * MathF.Tau - a0) / (Turns * MathF.Tau);
                    if (s < 0f || s > 1f) continue;
                    cells.Add((c.X + dx, c.Y + dz, s, h0 + (h1 - h0) * s, d > RoadR + 1.5f));
                }
            }
        // First every support (a rough shelf of rock under the road), then the roadway and the
        // space over it, so the lower loop can pass under the upper.
        foreach (var (x, z, s, h, outer) in cells)
        {
            int top = (int)MathF.Floor(MathF.Round(h * 2) / 2f);
            for (int y = Ground(x, z) - 2; y < top; y++) C.Set(x, y, z, _site.RockAt(x, y, z));
        }
        foreach (var (x, z, s, h, outer) in cells)
        {
            float q = MathF.Round(h * 2) / 2f;
            int yb = (int)MathF.Floor(q);
            bool half = q - yb > 0.01f;
            ushort pave = g.H(x, 0, z, 80) < 0.7f ? Blocks.CobbledSlate : Blocks.Gravel;
            if (half) { C.Set(x, yb - 1, z, pave); C.Set(x, yb, z, Blocks.DuskSlab); }
            else C.Set(x, yb - 1, z, pave);
            C.Carve(x, yb + (half ? 1 : 0), z, x, yb + 5, z);
        }
        // A parapet on the drop side, and lamps along it.
        int lamp = 0;
        foreach (var (x, z, s, h, outer) in cells)
        {
            if (!outer || s < 0.03f || s > 0.97f) continue;
            float q = MathF.Round(h * 2) / 2f;
            int yb = (int)MathF.Ceiling(q);
            if (C.Get(x, yb, z) is ushort v && v != Blocks.Air && v != Blocks.DuskSlab) continue;
            C.Set(x, yb, z, g.Stone(Masonry.Old, x, yb, z));
            if (((int)(s * 400)) % 24 == 0 && lamp++ % 2 == 0)
            {
                C.Set(x, yb + 1, z, Blocks.DuskPillar);
                C.Set(x, yb + 2, z, Blocks.CrimsonLantern);
            }
        }
        // The top of the road joins the spur's paving through the gap in its ring wall.
        C.Fill(c.X - 2, LandmarkSite.Plateau - 1, c.Y + 13, c.X + 2, LandmarkSite.Plateau - 1, c.Y + 18, Blocks.CobbledSlate);
        C.Carve(c.X - 2, LandmarkSite.Plateau, c.Y + 13, c.X + 2, LandmarkSite.Plateau + 4, c.Y + 18);
        // Gate posts where the road begins its climb.
        int sx = startX, sz = startZ + 3;
        foreach (int dx in new[] { -3, 3 })
        {
            int y = Ground(sx + dx, sz);
            for (int k = 0; k < 5; k++) C.Set(sx + dx, y + k, sz, Blocks.DuskPillar);
            C.Set(sx + dx, y + 5, sz, Blocks.CrimsonLantern);
            g.Statue(sx + dx, y + 6, sz, true);
        }
    }

    // --- roads across the valley ---------------------------------------------------------------

    private void Paths()
    {
        var c = LandmarkSite.SpurCentre;
        float a0 = MathF.PI / 2 - Turns * MathF.Tau;
        int sx = c.X + (int)MathF.Round(MathF.Cos(a0) * RoadR), sz = c.Y + (int)MathF.Round(MathF.Sin(a0) * RoadR);
        // From the village square to the foot of the spur road.
        Road(new[] { (-50, 130), (-30, 122), (0, 118), (24, 112), (sx, sz + 8), (sx, sz + 2) }, 3, false);
        // East to the launch complex.
        var cc = LandmarkSite.ComplexCentre;
        Road(new[] { (0, 118), (40, 122), (90, 118), (140, 96), (cc.X - 70, cc.Y + 40), (cc.X - 52, cc.Y + 20) }, 4, true);
    }

    /// <summary>A road along a polyline, following the ground, `width` wide; gravel in the valley, asphalt toward the complex.</summary>
    private void Road((int x, int z)[] pts, int width, bool paved)
    {
        float total = 0;
        for (int i = 0; i + 1 < pts.Length; i++) total += MathF.Sqrt(Sq(pts[i + 1].x - pts[i].x) + Sq(pts[i + 1].z - pts[i].z));
        float run = 0;
        for (int i = 0; i + 1 < pts.Length; i++)
        {
            var (ax, az) = pts[i];
            var (bx, bz) = pts[i + 1];
            float len = MathF.Sqrt(Sq(bx - ax) + Sq(bz - az));
            int n = (int)MathF.Ceiling(len * 2);
            for (int k = 0; k <= n; k++)
            {
                float t = k / (float)n;
                float px = ax + (bx - ax) * t, pz = az + (bz - az) * t;
                float along = run + len * t;
                float nx = -(bz - az) / len, nz = (bx - ax) / len;
                for (float w = -width / 2f; w <= width / 2f; w += 0.5f)
                {
                    int x = (int)MathF.Round(px + nx * w), z = (int)MathF.Round(pz + nz * w);
                    int y = Ground(x, z);
                    bool asphalt = paved && along > total * 0.55f;
                    ushort id = asphalt ? (MathF.Abs(w) < 0.3f && ((int)along) % 6 < 3 ? Blocks.RoadLine : Blocks.Asphalt)
                        : g.H(x, 0, z, 81) < 0.6f ? Blocks.Gravel : Blocks.CobbledSlate;
                    C.Set(x, y - 1, z, id);
                    C.Carve(x, y, z, x, y + 2, z);
                }
                // Lamp posts along the paved stretch, dead lanterns along the village road.
                if (k % 24 == 0 && k > 0)
                {
                    int lx = (int)MathF.Round(px + nx * (width / 2f + 1.5f)), lz = (int)MathF.Round(pz + nz * (width / 2f + 1.5f));
                    int y = Ground(lx, lz);
                    bool modern = paved && along > total * 0.55f;
                    for (int h = 0; h < 4; h++) C.Set(lx, y + h, lz, modern ? Blocks.SteelPlate : Blocks.PineLog);
                    C.Set(lx, y + 4, lz, modern ? Blocks.FloodLamp : Blocks.CrimsonLantern);
                }
            }
            run += len;
        }
    }

    private static float Sq(float v) => v * v;

    // --- the dead village -----------------------------------------------------------------------

    private void Village()
    {
        var vc = LandmarkSite.VillageCentre;
        int y0 = Ground(vc.X, vc.Y);
        // The square: cobbles, a well gone dry, a broken cart, a dead tree.
        for (int dz = -9; dz <= 9; dz++)
            for (int dx = -11; dx <= 11; dx++)
            {
                int x = vc.X + dx, z = vc.Y + dz;
                int y = Ground(x, z);
                if (g.H(x, 0, z, 90) < 0.8f) C.Set(x, y - 1, z, g.H(x, 1, z, 91) < 0.6f ? Blocks.CobbledSlate : Blocks.Gravel);
            }
        for (int dz = -1; dz <= 1; dz++)
            for (int dx = -1; dx <= 1; dx++)
                if (dx != 0 || dz != 0) { C.Set(vc.X + dx, Ground(vc.X + dx, vc.Y + dz), vc.Y + dz, Blocks.CobbledSlate); }
        C.Carve(vc.X, y0 - 8, vc.Y, vc.X, y0, vc.Y);
        C.Fill(vc.X - 1, y0 + 1, vc.Y, vc.X - 1, y0 + 2, vc.Y, Blocks.PineLog);
        C.Fill(vc.X + 1, y0 + 1, vc.Y, vc.X + 1, y0 + 2, vc.Y, Blocks.PineLog);
        C.Fill(vc.X - 1, y0 + 3, vc.Y, vc.X + 1, y0 + 3, vc.Y, Blocks.IronwoodSlab);
        C.Set(vc.X, y0 + 2, vc.Y, Blocks.Chain);
        g.DeadTree(vc.X + 7, Ground(vc.X + 7, vc.Y - 5), vc.Y - 5, 8);
        C.Set(vc.X - 6, y0, vc.Y + 5, Blocks.IronwoodPlanks); C.Set(vc.X - 5, y0, vc.Y + 5, Blocks.IronwoodSlab);   // the cart
        C.Set(vc.X - 7, y0, vc.Y + 4, Blocks.PineLog);

        // Houses round the square, several fallen in.
        var houses = new (int x, int z, int w, int d, bool alongX, int ruin)[]
        {
            (-78, 122, 9, 7, true, 0), (-66, 116, 7, 9, false, 1), (-48, 118, 9, 7, true, 2),
            (-80, 136, 7, 9, false, 0), (-40, 134, 7, 9, false, 1), (-78, 152, 9, 7, true, 2),
            (-62, 156, 9, 7, true, 0), (-44, 152, 7, 9, false, 0),
        };
        foreach (var (x, z, w, d, ax, ruin) in houses) House(x, z, w, d, ax, ruin);

        // The chapel, roofless, and its graveyard.
        RuinedChapel(-98, 128);
        for (int z = 140; z <= 170; z += 3)
            for (int x = -108; x <= -90; x += 3)
                if (g.H(x, 0, z, 92) < 0.8f) g.Grave(x, Ground(x, z), z, true);
        for (int x = -110; x <= -88; x++) { C.Set(x, Ground(x, 138), 138, x % 7 == 0 ? Blocks.Air : Blocks.IronBars); C.Set(x, Ground(x, 172), 172, Blocks.IronBars); }
        for (int z = 138; z <= 172; z++) { C.Set(-110, Ground(-110, z), z, Blocks.IronBars); C.Set(-88, Ground(-88, z), z, Blocks.IronBars); }
        g.DeadTree(-102, Ground(-102, 150), 150, 10);
        g.DeadTree(-94, Ground(-94, 165), 165, 7);
        // A crypt in the graveyard: steps down to a small vault.
        int cy = Ground(-99, 160);
        g.Walls(-102, 157, -96, 163, cy - 6, cy + 3, 1, Masonry.Old);
        C.Carve(-101, cy - 5, 158, -97, cy + 2, 162);
        C.Fill(-101, cy - 6, 158, -97, cy - 6, 162, Blocks.CobbledSlate);
        g.PyramidRoof(-103, 156, -95, 164, cy + 3, Blocks.SlateTiles, 1);
        g.Stair(-99, 164, 0, -1, cy - 5, 5, 1, Masonry.Old);
        C.Carve(-99, cy - 5, 162, -99, cy + 2, 166);
        g.Sarcophagus(-100, cy - 5, 158, true);
        C.Crate(-97, cy - 5, 161, "crypt");
        C.Set(-99, cy - 2, 160, Blocks.CrimsonLantern);
        g.Clutter(-101, 158, -97, 162, cy - 5, 0.5f);
    }

    /// <summary>A timber-framed house: stone footing, plank and daub walls, a steep roof; ruin 0..2 takes it apart.</summary>
    private void House(int x0, int z0, int w, int d, bool alongX, int ruin)
    {
        int x1 = x0 + w - 1, z1 = z0 + d - 1;
        int y = Ground((x0 + x1) / 2, (z0 + z1) / 2);
        // Level the plot.
        for (int z = z0 - 1; z <= z1 + 1; z++)
            for (int x = x0 - 1; x <= x1 + 1; x++)
            {
                int gy = Ground(x, z);
                for (int yy = gy - 1; yy < y - 1; yy++) C.Set(x, yy, z, Blocks.Dirt);
                C.Carve(x, y, z, x, y + 12, z);
            }
        C.Fill(x0, y - 1, z0, x1, y - 1, z1, Blocks.CobbledSlate);
        C.Fill(x0 + 1, y - 1, z0 + 1, x1 - 1, y - 1, z1 - 1, Blocks.PinePlanks);
        int wallTop = y + 4;
        for (int yy = y; yy <= wallTop; yy++)
            for (int z = z0; z <= z1; z++)
                for (int x = x0; x <= x1; x++)
                {
                    bool edge = x == x0 || x == x1 || z == z0 || z == z1;
                    if (!edge) continue;
                    bool corner = (x == x0 || x == x1) && (z == z0 || z == z1);
                    ushort id = corner || yy == wallTop ? Blocks.IronwoodLog : yy == y ? Blocks.CobbledSlate
                        : g.H(x, yy, z, 93) < 0.5f ? Blocks.PinePlanks : Blocks.Clay;
                    // Ruin: walls broken off at random heights.
                    if (ruin > 0 && !corner && yy > y + 1 && g.H(x, 0, z, 94) < 0.25f * ruin && yy > y + 1 + (int)(g.H(x, 1, z, 95) * 3)) continue;
                    C.Set(x, yy, z, id);
                }
        // Windows (some glazed, mostly dark holes) and a door.
        int mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
        C.Set(x0, y + 2, mz, g.H(x0, 2, mz, 96) < 0.3f ? Blocks.Glass : Blocks.Air);
        C.Set(x1, y + 2, mz, Blocks.Air);
        g.Door(mx, y, z1, true, g.H(mx, 0, z1, 97) < 0.5f);
        // The roof, unless it has fallen in.
        if (ruin < 2)
        {
            g.GableRoof(x0, z0, x1, z1, wallTop + 1, alongX, ruin == 0 ? Blocks.Thatch : Blocks.SlateTiles, Masonry.Old, 1, 1);
            if (ruin == 1)
                for (int x = x0 + 1; x < x1; x++)
                    for (int z = z0 + 1; z < z1; z++)
                        if (g.H(x, 2, z, 98) < 0.35f) C.Carve(x, wallTop + 1, z, x, wallTop + 8, z);
        }
        else
        {
            // Fallen beams across the floor.
            C.Fill(x0 + 1, y, mz, x1 - 1, y, mz, (x, yy, z) => g.H(x, yy, z, 99) < 0.6f ? Blocks.IronwoodLog : ushort.MaxValue);
        }
        // Inside: what was left behind.
        C.Set(x0 + 1, y, z0 + 1, Blocks.Bedroll);
        C.Set(x1 - 1, y, z0 + 1, Blocks.IronwoodPlanks);
        C.Set(x1 - 1, y + 1, z0 + 1, Blocks.Candle);
        if (g.H(x0, 3, z0, 100) < 0.6f) C.Crate(x0 + 1, y, z1 - 1, "camp");
        g.Clutter(x0 + 1, z0 + 1, x1 - 1, z1 - 1, y, 0.06f);
    }

    private void RuinedChapel(int cx, int cz)
    {
        int y = Ground(cx, cz);
        int x0 = cx - 6, x1 = cx + 6, z0 = cz - 9, z1 = cz + 9;
        for (int z = z0 - 1; z <= z1 + 1; z++)
            for (int x = x0 - 1; x <= x1 + 1; x++)
            {
                int gy = Ground(x, z);
                for (int yy = gy - 1; yy < y - 1; yy++) C.Set(x, yy, z, Blocks.Dirt);
                C.Carve(x, y, z, x, y + 16, z);
            }
        C.Fill(x0, y - 1, z0, x1, y - 1, z1, (x, yy, z) => g.H(x, yy, z, 101) < 0.7f ? Blocks.CobbledSlate : Blocks.Gravel);
        for (int z = z0; z <= z1; z++)
            for (int x = x0; x <= x1; x++)
            {
                bool edge = x == x0 || x == x1 || z == z0 || z == z1;
                if (!edge) continue;
                int top = y + 3 + (int)(g.H(x, 0, z, 102) * 9);
                if (z == z0) top = y + 12 - Math.Abs(x - cx);
                for (int yy = y; yy <= top; yy++) C.Set(x, yy, z, g.Stone(Masonry.Ruin, x, yy, z));
            }
        g.Opening(true, cx, z1, z1, y, 3, 6, 0, int.MinValue, true);
        g.Opening(true, cx, z0, z0, y + 4, 3, 6, Blocks.EmberGlass, z0, true);
        for (int z = z0 + 3; z < z1 - 1; z += 4)
        {
            C.Fill(x0 + 2, y, z, cx - 2, y, z, Blocks.IronwoodSlab);
            C.Fill(cx + 2, y, z, x1 - 2, y, z, Blocks.IronwoodSlab);
        }
        C.Fill(cx - 1, y, z0 + 1, cx + 1, y, z0 + 1, Blocks.CarvedStone);
        C.Set(cx - 1, y + 1, z0 + 1, Blocks.Candle); C.Set(cx + 1, y + 1, z0 + 1, Blocks.Candle);
        g.Clutter(x0 + 1, z0 + 1, x1 - 1, z1 - 1, y, 0.2f);
    }

    // --- the valley -------------------------------------------------------------------------------

    private void Wilds()
    {
        // Dead trees scattered wherever the land is dead, clear of roads, the village and the spur.
        var rng = new Rng(Hash.Of(_site.Gen.Seed, 0xDEAD, 7, 7));
        for (int i = 0; i < 140; i++)
        {
            int x = rng.Int(-200, 200), z = rng.Int(-160, 220);
            if (_site.Gloom(x, z) < 0.6f || _site.Weight(x, z) < 0.99f) continue;
            if (_site.CragU(x, z) < 1.05f) continue;
            var vc = LandmarkSite.VillageCentre;
            if (MathF.Abs(x - vc.X) < 34 && MathF.Abs(z - vc.Y) < 30) continue;
            if (MathF.Abs(x - LandmarkSite.SpurCentre.X) < 24 && MathF.Abs(z - LandmarkSite.SpurCentre.Y) < 24) continue;
            if (MathF.Abs(z - 120) < 6 && x > -50 && x < 40) continue;
            if (MathF.Abs(x - LandmarkSite.Lookout.X) < 16 && MathF.Abs(z - LandmarkSite.Lookout.Y) < 16) continue;
            g.DeadTree(x, Ground(x, z), z, 5 + rng.Int(0, 6));
        }
        // An old watchtower, broken, on the valley floor west of the crag.
        int tx = -120, tz = 40, ty = Ground(tx, tz);
        for (int dz = -4; dz <= 4; dz++)
            for (int dx = -4; dx <= 4; dx++)
            {
                if (!Gothic.InDisc(dx, dz, 4) || Gothic.InDisc(dx, dz, 2.6f)) continue;
                int top = ty + 6 + (int)((MathF.Sin(MathF.Atan2(dz, dx) * 2 + 1) * 0.5f + 0.5f) * 14);
                for (int y = Ground(tx + dx, tz + dz) - 1; y <= top; y++) C.Set(tx + dx, y, tz + dz, g.Stone(Masonry.Ruin, tx + dx, y, tz + dz));
            }
        C.Carve(tx + 4, ty, tz, tx + 4, ty + 2, tz);
        // A standing ring of old stones to the south-east.
        for (int k = 0; k < 9; k++)
        {
            float a = k * MathF.Tau / 9;
            int x = 70 + (int)(MathF.Cos(a) * 7), z = 170 + (int)(MathF.Sin(a) * 7);
            int y = Ground(x, z);
            int h = 2 + (int)(g.H(x, 0, z, 103) * 3);
            for (int yy = y; yy < y + h; yy++) C.Set(x, yy, z, Blocks.Duskstone);
        }
        C.Set(70, Ground(70, 170), 170, Blocks.CarvedStone);
        C.Set(70, Ground(70, 170) + 1, 170, Blocks.Candle);
    }
}
