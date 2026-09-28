using System;
using System.Collections.Generic;

namespace Strata;

/// <summary>Which masonry a part of a building is made of: a wing's age shows in its stone.</summary>
public enum Masonry : byte
{
    Dusk,       // the castle's own dark brick
    Old,        // the oldest work: rubble slate and ash brick, mossy low down
    Fine,       // the newest: dusk brick with carved trim
    Ruin,       // cracked and mossy, with gaps
}

/// <summary>
/// The pieces a gothic castle is made of, drawn onto a <see cref="Canvas"/>:
/// weathered walls, halls, round and square towers, steep roofs and spires,
/// pointed windows and arches, rose windows, buttresses and flying
/// buttresses, spiral and straight stairs, and the furniture and clutter of a
/// lived-in (or long-abandoned) place. Everything takes local site
/// coordinates and inclusive ranges. Variation comes from hashing the
/// position, so a wall looks the same however many times it is drawn.
/// </summary>
public sealed class Gothic
{
    public readonly Canvas C;
    public readonly LandmarkSite Site;
    public Rng R;
    private readonly ulong _seed;

    public Gothic(LandmarkSite site, Canvas c, Rng r)
    {
        Site = site; C = c; R = r;
        _seed = (ulong)site.Gen.Seed * 0x9E3779B97F4A7C15UL + 77;
    }

    public float H(int x, int y, int z, int k = 0) => Hash.Unit(Hash.Of((long)_seed + k, x, y, z));

    // --- materials -----------------------------------------------------------------------------

    /// <summary>A wall block of the given masonry, weathered by height and chance.</summary>
    public ushort Stone(Masonry m, int x, int y, int z)
    {
        float h = H(x, y, z);
        bool low = y < LandmarkSite.Plateau + 3;
        switch (m)
        {
            case Masonry.Old:
                if (low && h < 0.25f) return Blocks.MossyCobble;
                return h < 0.45f ? Blocks.CobbledSlate : h < 0.8f ? Blocks.AshBricks : h < 0.9f ? Blocks.DuskBricks : Blocks.CrackedDuskBricks;
            case Masonry.Fine:
                return h < 0.06f ? Blocks.CrackedDuskBricks : Blocks.DuskBricks;
            case Masonry.Ruin:
                return h < 0.3f ? Blocks.CrackedDuskBricks : h < 0.5f ? Blocks.MossyDuskBricks : h < 0.6f ? Blocks.CobbledSlate : Blocks.DuskBricks;
            default:
                if (low && h < 0.12f) return Blocks.MossyDuskBricks;
                return h < 0.1f ? Blocks.CrackedDuskBricks : h < 0.14f ? Blocks.Duskstone : Blocks.DuskBricks;
        }
    }

    public void Solid(int x0, int y0, int z0, int x1, int y1, int z1, Masonry m) =>
        C.Fill(x0, y0, z0, x1, y1, z1, (x, y, z) => Stone(m, x, y, z));

    // --- walls, floors, halls ---------------------------------------------------------------

    /// <summary>Masonry from under a footprint down to the rock, so nothing hangs in the air over a cliff.</summary>
    public void Foundation(int x0, int z0, int x1, int z1, int yTop, Masonry m)
    {
        for (int z = Math.Min(z0, z1); z <= Math.Max(z0, z1); z++)
            for (int x = Math.Min(x0, x1); x <= Math.Max(x0, x1); x++)
            {
                int ground = Site.Height(x, z);
                for (int y = yTop; y >= ground - 1 && y > 20; y--) C.Set(x, y, z, Stone(m, x, y, z));
            }
    }

    /// <summary>The four walls of a rectangle, <paramref name="t"/> thick, from y0 to y1.</summary>
    public void Walls(int x0, int z0, int x1, int z1, int y0, int y1, int t, Masonry m)
    {
        for (int y = y0; y <= y1; y++)
            for (int z = z0; z <= z1; z++)
                for (int x = x0; x <= x1; x++)
                {
                    bool edge = x < x0 + t || x > x1 - t || z < z0 + t || z > z1 - t;
                    if (edge) C.Set(x, y, z, Stone(m, x, y, z));
                }
    }

    public void Floor(int x0, int z0, int x1, int z1, int y, ushort id) => C.Fill(x0, y, z0, x1, y, z1, id);

    /// <summary>A checkerboard or bordered floor: tiles with a carpet runner down the middle if asked.</summary>
    public void TiledFloor(int x0, int z0, int x1, int z1, int y) => C.Fill(x0, y, z0, x1, y, z1, Blocks.DuskTiles);

    /// <summary>
    /// A hall: walls, a floor at yFloor, empty air inside up to the ceiling,
    /// and a solid ceiling slab on top (a roof can sit on that).
    /// </summary>
    public void Hall(int x0, int z0, int x1, int z1, int yFloor, int height, Masonry m, int t = 2, ushort floor = 0)
    {
        int top = yFloor + height;
        Foundation(x0, z0, x1, z1, yFloor - 1, m);
        Walls(x0, z0, x1, z1, yFloor, top, t, m);
        Floor(x0 + t, z0 + t, x1 - t, z1 - t, yFloor - 1, floor == 0 ? Blocks.DuskTiles : floor);
        C.Carve(x0 + t, yFloor, z0 + t, x1 - t, top - 1, z1 - t);
        Solid(x0, top, z0, x1, top, z1, m);
    }

    /// <summary>Merlons along the top edge of a rectangle's walls.</summary>
    public void Crenellate(int x0, int z0, int x1, int z1, int y, Masonry m)
    {
        for (int x = x0; x <= x1; x++)
        {
            Merlon(x, y, z0, m, (x - x0) % 2 == 0);
            Merlon(x, y, z1, m, (x - x0) % 2 == 0);
        }
        for (int z = z0; z <= z1; z++)
        {
            Merlon(x0, y, z, m, (z - z0) % 2 == 0);
            Merlon(x1, y, z, m, (z - z0) % 2 == 0);
        }
    }

    private void Merlon(int x, int y, int z, Masonry m, bool tall)
    {
        C.Set(x, y, z, Stone(m, x, y, z));
        if (tall) C.Set(x, y + 1, z, Stone(m, x, y + 1, z));
    }

    // --- round towers and spires --------------------------------------------------------------

    public static bool InDisc(int dx, int dz, float r) => dx * dx + dz * dz <= r * r + r * 0.8f;

    /// <summary>A round tower: a ring of wall, hollow inside, with floors every few blocks.</summary>
    public void RoundTower(int cx, int cz, int r, int y0, int y1, Masonry m, int floorEvery = 0)
    {
        int ri = Math.Max(1, r - (r >= 5 ? 2 : 1));
        for (int dz = -r; dz <= r; dz++)
            for (int dx = -r; dx <= r; dx++)
            {
                if (!InDisc(dx, dz, r)) continue;
                int x = cx + dx, z = cz + dz;
                int ground = Site.Height(x, z);
                for (int y = Math.Min(y0 - 1, ground); y >= ground - 1 && y > 20; y--) C.Set(x, y, z, Stone(m, x, y, z));
                bool inside = InDisc(dx, dz, ri - 0.5f);
                for (int y = y0 - 1; y <= y1; y++)
                {
                    if (!inside || y == y0 - 1 || y == y1) C.Set(x, y, z, Stone(m, x, y, z));
                    else if (floorEvery > 0 && (y - y0 + 1) % floorEvery == 0) C.Set(x, y, z, Blocks.IronwoodPlanks);
                    else C.Set(x, y, z, Blocks.Air);
                }
            }
    }

    /// <summary>A ring of merlons around the top of a round tower.</summary>
    public void RoundCrenellate(int cx, int cz, int r, int y, Masonry m)
    {
        for (int dz = -r; dz <= r; dz++)
            for (int dx = -r; dx <= r; dx++)
            {
                if (!InDisc(dx, dz, r) || InDisc(dx, dz, r - 1)) continue;
                C.Set(cx + dx, y, cz + dz, Stone(m, cx + dx, y, cz + dz));
                if (((dx + dz) & 1) == 0) C.Set(cx + dx, y + 1, cz + dz, Stone(m, cx + dx, y + 1, cz + dz));
            }
    }

    /// <summary>A conical spire, hollow, tapering from radius r to a point with a finial on top.</summary>
    public void Spire(int cx, int cz, float r, int yBase, int height, ushort roof, bool finial = true)
    {
        for (int k = 0; k < height; k++)
        {
            float rr = r * (1f - k / (float)height);
            float inner = rr - 1.6f;
            int ir = (int)MathF.Ceiling(rr);
            for (int dz = -ir; dz <= ir; dz++)
                for (int dx = -ir; dx <= ir; dx++)
                {
                    float d = MathF.Sqrt(dx * dx + dz * dz);
                    if (d > rr + 0.35f) continue;
                    C.Set(cx + dx, yBase + k, cz + dz, d >= inner ? roof : Blocks.Air);
                }
        }
        // A flared eave ring at the foot.
        int er = (int)MathF.Ceiling(r + 1);
        for (int dz = -er; dz <= er; dz++)
            for (int dx = -er; dx <= er; dx++)
            {
                float d = MathF.Sqrt(dx * dx + dz * dz);
                if (d > r + 0.2f && d <= r + 1.3f) C.Set(cx + dx, yBase, cz + dz, roof);
            }
        if (finial) Finial(cx, yBase + height, cz, 3 + (int)(r / 2));
    }

    /// <summary>A spike of iron on a gilded knop, to finish a spire or a gable.</summary>
    public void Finial(int x, int y, int z, int h)
    {
        C.Set(x, y, z, Blocks.Gilded);
        for (int k = 1; k <= h; k++) C.Set(x, y + k, z, Blocks.IronBars);
    }

    /// <summary>A square pyramid roof over a rectangle, steep (rises `steep` per step in).</summary>
    public void PyramidRoof(int x0, int z0, int x1, int z1, int yBase, ushort roof, int steep = 2, bool finial = true)
    {
        int w = x1 - x0, d = z1 - z0;
        int layers = Math.Min(w, d) / 2 + 1;
        for (int k = 0; k <= layers; k++)
        {
            int ax = x0 + k, bx = x1 - k, az = z0 + k, bz = z1 - k;
            if (ax > bx || az > bz) break;
            for (int s = 0; s < steep; s++)
            {
                int y = yBase + k * steep + s;
                for (int x = ax; x <= bx; x++) { C.Set(x, y, az, roof); C.Set(x, y, bz, roof); }
                for (int z = az; z <= bz; z++) { C.Set(ax, y, z, roof); C.Set(bx, y, z, roof); }
            }
            if (ax == bx || az == bz)
            {
                C.Fill(ax, yBase + k * steep, az, bx, yBase + k * steep + steep - 1, bz, roof);
                if (finial) Finial((ax + bx) / 2, yBase + k * steep + steep, (az + bz) / 2, 3);
                return;
            }
        }
    }

    /// <summary>
    /// A steep gable roof over a rectangle, ridge along X (alongX) or Z, rising
    /// `steep` blocks per block in from the eaves; the gable ends are walled in
    /// and the ridge carries iron cresting.
    /// </summary>
    public void GableRoof(int x0, int z0, int x1, int z1, int yBase, bool alongX, ushort roof, Masonry m, int steep = 2, int overhang = 1)
    {
        int a0 = alongX ? z0 - overhang : x0 - overhang, a1 = alongX ? z1 + overhang : x1 + overhang;   // across the ridge
        int b0 = alongX ? x0 : z0, b1 = alongX ? x1 : z1;                                               // along the ridge
        int span = a1 - a0;
        int half = span / 2;
        for (int a = a0; a <= a1; a++)
        {
            int inFrom = Math.Min(a - a0, a1 - a);
            int yTop = yBase + inFrom * steep;
            for (int b = b0; b <= b1; b++)
            {
                for (int s = 0; s < steep + 1; s++)
                {
                    int y = yTop - s;
                    if (y < yBase - 1) break;
                    Put(alongX, b, y, a, roof);
                }
                // Gable end walls, filled up under the slope.
                if (b == b0 || b == b1)
                    for (int y = yBase; y < yTop - steep; y++)
                        if (a > a0 + overhang - 1 && a < a1 - overhang + 1) Put(alongX, b, y, a, Stone(m, alongX ? b : a, y, alongX ? a : b));
            }
        }
        // Ridge cresting: short iron spikes every other block.
        int ridgeY = yBase + half * steep + 1;
        for (int b = b0; b <= b1; b += 2) Put(alongX, b, ridgeY, a0 + half, Blocks.IronBars);
        Finial(alongX ? b0 : a0 + half, ridgeY, alongX ? a0 + half : b0, 2);
        Finial(alongX ? b1 : a0 + half, ridgeY, alongX ? a0 + half : b1, 2);
    }

    private void Put(bool alongX, int b, int y, int a, ushort id)
    {
        if (alongX) C.Set(b, y, a, id); else C.Set(a, y, b, id);
    }

    // --- openings -----------------------------------------------------------------------------

    /// <summary>Half-widths, row by row from the sill, of a pointed arch w wide and h tall.</summary>
    public static int[] ArchProfile(int w, int h)
    {
        int hw = w / 2;
        var rows = new int[h];
        int arch = Math.Min(h - 1, hw + 1 + hw / 2);
        for (int k = 0; k < h; k++)
        {
            int j = k - (h - arch);
            if (j < 0) { rows[k] = hw; continue; }
            float t = (j + 1f) / (arch + 1f);
            rows[k] = Math.Max(0, (int)MathF.Round(hw * MathF.Pow(1f - t, 0.75f)));
        }
        return rows;
    }

    /// <summary>
    /// A pointed opening through a wall. alongX: the wall runs along X and the
    /// opening goes through it in Z, between planes p0..p1. The outermost plane
    /// (glassPlane) gets `fill` (glass, bars) if given; the rest is carved.
    /// A frame of carved trim is drawn round the outline on both faces.
    /// </summary>
    public void Opening(bool alongX, int center, int p0, int p1, int y0, int w, int h, ushort fill = 0, int glassPlane = int.MinValue, bool frame = true, ushort trim = 0)
    {
        var rows = ArchProfile(w, h);
        if (trim == 0) trim = Blocks.DuskPillar;
        for (int k = 0; k < h; k++)
        {
            int hw = rows[k];
            for (int o = -hw; o <= hw; o++)
                for (int p = Math.Min(p0, p1); p <= Math.Max(p0, p1); p++)
                {
                    ushort id = fill != 0 && (glassPlane == int.MinValue ? p == (p0 + p1) / 2 : p == glassPlane) ? fill : Blocks.Air;
                    if (alongX) C.Set(center + o, y0 + k, p, id); else C.Set(p, y0 + k, center + o, id);
                }
            if (!frame) continue;
            foreach (int p in new[] { p0, p1 })
            {
                if (alongX) { C.Set(center - hw - 1, y0 + k, p, trim); C.Set(center + hw + 1, y0 + k, p, trim); }
                else { C.Set(p, y0 + k, center - hw - 1, trim); C.Set(p, y0 + k, center + hw + 1, trim); }
            }
        }
        if (!frame) return;
        // Keystone and sill.
        foreach (int p in new[] { p0, p1 })
        {
            if (alongX) { C.Set(center, y0 + h, p, trim); C.Set(center, y0 + h + 1, p, Blocks.Gilded); }
            else { C.Set(p, y0 + h, center, trim); C.Set(p, y0 + h + 1, center, Blocks.Gilded); }
            for (int o = -rows[0] - 1; o <= rows[0] + 1; o++)
                if (alongX) C.Set(center + o, y0 - 1, p, Blocks.DuskSlab == 0 ? trim : Blocks.CarvedStone);
                else C.Set(p, y0 - 1, center + o, Blocks.CarvedStone);
        }
    }

    /// <summary>A tall window with ember glass and a mullion down the middle (if wide enough).</summary>
    public void GothicWindow(bool alongX, int center, int p0, int p1, int y0, int w, int h, int outerPlane, ushort glass = 0)
    {
        if (glass == 0) glass = Blocks.EmberGlass;
        Opening(alongX, center, p0, p1, y0, w, h, glass, outerPlane);
        if (w >= 5)
            for (int y = y0; y < y0 + h - 2; y++)
                if (alongX) C.Set(center, y, outerPlane, Blocks.DuskPillar); else C.Set(outerPlane, y, center, Blocks.DuskPillar);
        if (w >= 5)
            for (int o = -w / 2; o <= w / 2; o++)
                if (alongX) C.Set(center + o, y0 + h / 2, outerPlane, Blocks.IronBars); else C.Set(outerPlane, y0 + h / 2, center + o, Blocks.IronBars);
    }

    /// <summary>A round window of radiating ember glass and iron tracery, in a wall plane.</summary>
    public void RoseWindow(bool alongX, int cx, int cy, int plane, float r)
    {
        int ir = (int)MathF.Ceiling(r);
        for (int dy = -ir; dy <= ir; dy++)
            for (int d = -ir; d <= ir; d++)
            {
                float dist = MathF.Sqrt(d * d + dy * dy);
                if (dist > r + 0.3f) continue;
                ushort id;
                if (dist > r - 0.8f) id = Blocks.Gilded;
                else if (dist < 1.2f) id = Blocks.CrimsonLantern;
                else
                {
                    float a = MathF.Atan2(dy, d);
                    float spoke = MathF.Abs(MathF.Sin(a * 4f));
                    id = spoke < 0.22f ? Blocks.IronBars : Blocks.EmberGlass;
                }
                if (alongX) C.Set(cx + d, cy + dy, plane, id); else C.Set(plane, cy + dy, cx + d, id);
            }
    }

    // --- buttresses ---------------------------------------------------------------------------

    /// <summary>A pier standing against a wall (outward in direction (ox, oz)), stepping in as it rises, capped by a pinnacle.</summary>
    public void Buttress(int x, int z, int ox, int oz, int y0, int y1, Masonry m, int depth = 3)
    {
        for (int y = y0; y <= y1; y++)
        {
            int d = Math.Max(1, (int)MathF.Round(depth * (1f - (y - y0) / (float)(y1 - y0 + 1) * 0.66f)));
            for (int k = 1; k <= d; k++)
                C.Set(x + ox * k, y, z + oz * k, Stone(m, x + ox * k, y, z + oz * k));
        }
        Foundation(x + ox, z + oz, x + ox * depth, z + oz * depth, y0 - 1, m);
        Pinnacle(x + ox, y1 + 1, z + oz, 4);
    }

    /// <summary>A slender pointed cap: a pillar, a slab, a spike.</summary>
    public void Pinnacle(int x, int y, int z, int h)
    {
        for (int k = 0; k < h - 1; k++) C.Set(x, y + k, z, Blocks.DuskPillar);
        C.Set(x, y + h - 1, z, Blocks.DuskSlab);
        C.Set(x, y + h, z, Blocks.IronBars);
    }

    /// <summary>A flying buttress: a straight strut of masonry from a pier top to a wall high up.</summary>
    public void Flying(int x0, int y0, int z0, int x1, int y1, int z1, Masonry m)
    {
        int n = Math.Max(Math.Max(Math.Abs(x1 - x0), Math.Abs(y1 - y0)), Math.Abs(z1 - z0)) * 2;
        for (int i = 0; i <= n; i++)
        {
            float t = i / (float)n;
            int x = (int)MathF.Round(x0 + (x1 - x0) * t), y = (int)MathF.Round(y0 + (y1 - y0) * t), z = (int)MathF.Round(z0 + (z1 - z0) * t);
            C.Set(x, y, z, Stone(m, x, y, z));
            C.Set(x, y - 1, z, Stone(m, x, y - 1, z));
        }
    }

    // --- stairs -------------------------------------------------------------------------------

    /// <summary>
    /// A spiral stair round a central pillar, rising half a block per step so it
    /// can be walked without jumping (sixteen steps a turn, eight blocks of
    /// headroom). The shaft is cleared first; openings are the caller's job.
    /// </summary>
    public void SpiralStair(int cx, int cz, int r, int y0, int y1, Masonry m, bool clockwise = true)
    {
        // Clear the shaft (inside radius r) and raise the newel.
        for (int dz = -r; dz <= r; dz++)
            for (int dx = -r; dx <= r; dx++)
                if (InDisc(dx, dz, r)) C.Carve(cx + dx, y0, cz + dz, cx + dx, y1, cz + dz);
        for (int y = y0 - 1; y <= y1; y++) C.Set(cx, y, cz, Blocks.DuskPillar);
        const int stepsPerTurn = 16;
        int totalHalfSteps = (y1 - y0) * 2;
        for (int dz = -r; dz <= r; dz++)
            for (int dx = -r; dx <= r; dx++)
            {
                if ((dx == 0 && dz == 0) || !InDisc(dx, dz, r)) continue;
                float a = MathF.Atan2(dz, dx);
                if (!clockwise) a = -a;
                int step = ((int)MathF.Floor((a + MathF.PI) / MathF.Tau * stepsPerTurn)) % stepsPerTurn;
                for (int turn = 0; ; turn++)
                {
                    int half = turn * stepsPerTurn + step;
                    if (half > totalHalfSteps) break;
                    float top = y0 + half * 0.5f;
                    int yb = (int)MathF.Floor(top);
                    int x = cx + dx, z = cz + dz;
                    if (top - yb > 0.01f)
                    {
                        C.Set(x, yb, z, Blocks.DuskSlab);
                        C.Set(x, yb - 1, z, Blocks.DuskBricks);
                    }
                    else C.Set(x, yb - 1, z, Blocks.DuskBricks);
                }
            }
    }

    /// <summary>A straight flight: rises half a block for every block forward, `width` wide, filled in beneath.</summary>
    public void Stair(int x, int z, int dx, int dz, int y0, int rise, int width, Masonry m, ushort tread = 0)
    {
        int sx = dz != 0 ? 1 : 0, sz = dx != 0 ? 1 : 0;   // sideways
        int steps = rise * 2;
        for (int i = 0; i < steps; i++)
        {
            float top = y0 + (i + 1) * 0.5f;
            int yb = (int)MathF.Floor(top);
            for (int w = 0; w < width; w++)
            {
                int px = x + dx * i + sx * w, pz = z + dz * i + sz * w;
                for (int y = y0 - 1; y < yb; y++) C.Set(px, y, pz, Stone(m, px, y, pz));
                if (top - yb > 0.01f) C.Set(px, yb, pz, Blocks.DuskSlab);
                else C.Set(px, yb - 1, pz, tread == 0 ? Stone(m, px, yb - 1, pz) : tread);
                for (int y = yb + (top - yb > 0.01f ? 1 : 0); y < yb + 4; y++) C.Set(px, y, pz, Blocks.Air);
            }
        }
    }

    // --- doors --------------------------------------------------------------------------------

    /// <summary>A wooden door in a wall. alongX: the wall runs along X.</summary>
    public void Door(int x, int y, int z, bool alongX, bool open = false)
    {
        int f = alongX ? 0 : 1;
        if (open) f |= 4;
        C.Set(x, y, z, (ushort)(Blocks.Door + f));
        C.Set(x, y + 1, z, (ushort)(Blocks.Door + f + 8));
    }

    // --- furnishing ---------------------------------------------------------------------------

    /// <summary>A hanging wall item (banner, torch) against the wall in direction supportDir.</summary>
    public void OnWall(ushort family, int x, int y, int z, int supportDir)
    {
        for (int v = 0; v < 4; v++)
            if (Blocks.Get((ushort)(family + v)).SupportDir == supportDir) { C.Place(x, y, z, (ushort)(family + v)); return; }
    }

    public void BannerPair(int x, int y, int z, int supportDir)
    {
        OnWall(Blocks.Banner, x, y, z, supportDir);
        OnWall(Blocks.Banner, x, y - 1, z, supportDir);
    }

    /// <summary>
    /// Lanterns set into the walls round a room (the room's inside is x0..x1,
    /// z0..z1), one every `spacing` blocks at height y. Only wall blocks are
    /// replaced, so windows and doorways are left alone.
    /// </summary>
    public void Sconces(int x0, int z0, int x1, int z1, int y, int spacing, ushort lamp = 0)
    {
        if (lamp == 0) lamp = Blocks.CrimsonLantern;
        void Try(int x, int z)
        {
            var v = C.Get(x, y, z);
            if (v.HasValue && v.Value != Blocks.Air && Blocks.Get(v.Value).Opaque && Blocks.Get(v.Value).Light == 0) C.Set(x, y, z, lamp);
        }
        for (int x = x0 + spacing / 2; x <= x1; x += spacing) { Try(x, z0 - 1); Try(x, z1 + 1); }
        for (int z = z0 + spacing / 2; z <= z1; z += spacing) { Try(x0 - 1, z); Try(x1 + 1, z); }
    }

    /// <summary>A chandelier: a chain from the ceiling to a ring of candles round a crimson lantern.</summary>
    public void Chandelier(int x, int yCeil, int z, int drop)
    {
        for (int k = 1; k <= drop; k++) C.Set(x, yCeil - k, z, Blocks.Chain);
        int y = yCeil - drop - 1;
        C.Set(x, y, z, Blocks.CrimsonLantern);
        foreach (var (dx, dz) in new[] { (1, 0), (-1, 0), (0, 1), (0, -1) })
        {
            C.Set(x + dx, y, z + dz, Blocks.IronBars);
            C.Set(x + dx, y + 1, z + dz, Blocks.Candle);
        }
    }

    /// <summary>A long table with candles and the leftovers of a meal, and chairs down both sides.</summary>
    public void Table(int x0, int z0, int x1, int z1, int y, bool chairs = true)
    {
        C.Fill(x0, y, z0, x1, y, z1, Blocks.IronwoodPlanks);
        bool alongX = x1 - x0 >= z1 - z0;
        int len = alongX ? x1 - x0 : z1 - z0;
        for (int i = 1; i < len; i += 3)
        {
            int x = alongX ? x0 + i : (x0 + x1) / 2, z = alongX ? (z0 + z1) / 2 : z0 + i;
            C.Set(x, y + 1, z, H(x, y, z, 5) < 0.7f ? Blocks.Candle : Blocks.Bones);
        }
        if (!chairs) return;
        for (int i = 0; i <= len; i += 2)
        {
            if (alongX) { C.Place(x0 + i, y, z0 - 1, Blocks.IronwoodSlab); C.Place(x0 + i, y, z1 + 1, Blocks.IronwoodSlab); }
            else { C.Place(x0 - 1, y, z0 + i, Blocks.IronwoodSlab); C.Place(x1 + 1, y, z0 + i, Blocks.IronwoodSlab); }
        }
    }

    /// <summary>A coffin, lid on, one wide and two long, with a candle at its head.</summary>
    public void Coffin(int x, int y, int z, bool alongX, bool open = false)
    {
        int ex = alongX ? 1 : 0, ez = alongX ? 0 : 1;
        C.Set(x, y, z, Blocks.IronwoodPlanks);
        C.Set(x + ex, y, z + ez, Blocks.IronwoodPlanks);
        if (open) { C.Set(x, y, z, Blocks.CrimsonCloth); C.Set(x + ex, y, z + ez, Blocks.CrimsonCloth); }
        C.Set(x, y + 1, z, open ? Blocks.Air : Blocks.IronwoodSlab);
        C.Set(x + ex, y + 1, z + ez, open ? Blocks.Air : Blocks.IronwoodSlab);
        C.Place(x - ex * 1 - (alongX ? 0 : 0), y, z - ez, Blocks.Candle);
    }

    /// <summary>A stone sarcophagus with a carved lid.</summary>
    public void Sarcophagus(int x, int y, int z, bool alongX)
    {
        int ex = alongX ? 1 : 0, ez = alongX ? 0 : 1;
        for (int k = 0; k < 3; k++)
        {
            C.Set(x + ex * k, y, z + ez * k, Blocks.CarvedStone);
            C.Set(x + ex * k, y + 1, z + ez * k, Blocks.DuskSlab);
        }
    }

    /// <summary>A figure in stone: a gargoyle or a saint, on a plinth.</summary>
    public void Statue(int x, int y, int z, bool winged = true)
    {
        C.Set(x, y, z, Blocks.CarvedStone);
        C.Set(x, y + 1, z, Blocks.DuskPillar);
        C.Set(x, y + 2, z, Blocks.DuskPillar);
        C.Set(x, y + 3, z, Blocks.Duskstone);
        if (winged)
        {
            C.Set(x + 1, y + 2, z, Blocks.DuskSlab); C.Set(x - 1, y + 2, z, Blocks.DuskSlab);
            C.Set(x, y + 2, z + 1, Blocks.DuskSlab); C.Set(x, y + 2, z - 1, Blocks.DuskSlab);
        }
    }

    /// <summary>A suit of armour on a stand.</summary>
    public void Armour(int x, int y, int z)
    {
        C.Set(x, y, z, Blocks.IronBars);
        C.Set(x, y + 1, z, Blocks.IronBlock);
        C.Set(x, y + 2, z, Blocks.SilverBlock);
    }

    /// <summary>Clutter for a floor: bones, cobwebs in corners, a pool of spilled red, the odd candle stub.</summary>
    public void Clutter(int x0, int z0, int x1, int z1, int y, float amount, bool webs = true)
    {
        for (int z = z0; z <= z1; z++)
            for (int x = x0; x <= x1; x++)
            {
                float h = H(x, y, z, 11);
                if (h < amount * 0.25f) C.Place(x, y, z, Blocks.Bones);
                else if (h < amount * 0.4f) C.Place(x, y, z, Blocks.CrimsonCarpet);
                else if (h < amount * 0.45f) C.Place(x, y, z, Blocks.Candle);
            }
        if (!webs) return;
        foreach (var (x, z) in new[] { (x0, z0), (x1, z0), (x0, z1), (x1, z1) })
        {
            C.Place(x, y, z, Blocks.Cobweb);
            if (H(x, y, z, 12) < 0.5f) C.Place(x, y + 1, z, Blocks.Cobweb);
        }
    }

    /// <summary>A fireplace set into a wall (the wall on the side of direction (ox, oz)), with a fire and a chimney breast.</summary>
    public void Fireplace(int x, int y, int z, int ox, int oz, int chimneyTop)
    {
        int sx = oz != 0 ? 1 : 0, sz = ox != 0 ? 1 : 0;
        // The breast stands out from the wall; the hearth is set back into it.
        for (int w = -2; w <= 2; w++)
            for (int k = 0; k < 4; k++)
                C.Set(x + sx * w, y + k, z + sz * w, Blocks.CarvedStone);
        for (int w = -1; w <= 1; w++)
        {
            C.Set(x + sx * w + ox, y, z + sz * w + oz, Blocks.Hearthfire);
            C.Set(x + sx * w + ox, y - 1, z + sz * w + oz, Blocks.Cobblestone);
            C.Set(x + sx * w + ox, y + 1, z + sz * w + oz, Blocks.Air);
            C.Set(x + sx * w, y, z + sz * w, Blocks.Air);
            C.Set(x + sx * w, y + 1, z + sz * w, Blocks.Air);
            C.Set(x + sx * w + ox * 2, y, z + sz * w + oz * 2, Blocks.CobbledSlate);
            C.Set(x + sx * w + ox * 2, y + 1, z + sz * w + oz * 2, Blocks.CobbledSlate);
        }
        C.Set(x, y, z, Blocks.Air);
        for (int yy = y + 4; yy <= chimneyTop; yy++) C.Set(x, yy, z, Blocks.CarvedStone);
        C.Set(x + sx * -1, y + 4, z + sz * -1, Blocks.Gilded); C.Set(x + sx, y + 4, z + sz, Blocks.Gilded);
    }

    /// <summary>A prison cell behind bars: chains on the back wall, bones, straw.</summary>
    public void Cell(int x0, int z0, int x1, int z1, int y, bool alongX, int barsPlane, bool openDoor)
    {
        C.Carve(x0, y, z0, x1, y + 2, z1);
        C.Fill(x0, y - 1, z0, x1, y - 1, z1, Blocks.CobbledSlate);
        int n = alongX ? x1 - x0 : z1 - z0;
        for (int i = 0; i <= n; i++)
            for (int k = 0; k < 3; k++)
            {
                if (openDoor && i == n / 2 && k < 2) continue;
                if (alongX) C.Set(x0 + i, y + k, barsPlane, Blocks.IronBars); else C.Set(barsPlane, y + k, z0 + i, Blocks.IronBars);
            }
        Clutter(x0, z0, x1, z1, y, 1.2f);
        C.Place((x0 + x1) / 2, y + 2, (z0 + z1) / 2, Blocks.Chain);
        C.Place((x0 + x1) / 2, y + 1, (z0 + z1) / 2, Blocks.Chain);
        C.Place(x0, y, z1, Blocks.Thatch);
    }

    /// <summary>Rows of bookshelves along a wall from y0 up h blocks.</summary>
    public void Shelves(int x0, int z0, int x1, int z1, int y0, int h)
    {
        C.Fill(x0, y0, z0, x1, y0 + h - 1, z1, (x, y, z) => H(x, y, z, 13) < 0.06f ? Blocks.Cobweb : Blocks.Bookshelf);
    }

    /// <summary>A dead tree: a crooked trunk leaning a little, and bare branches reaching up and out.</summary>
    public void DeadTree(int x, int y, int z, int height)
    {
        ushort log = H(x, y, z, 14) < 0.6f ? Blocks.IronwoodLog : Blocks.PineLog;
        float lean = H(x, y, z, 23) * MathF.Tau;
        float fx = x, fz = z;
        int tx = x, tz = z;
        for (int k = 0; k < height; k++)
        {
            tx = (int)MathF.Round(fx); tz = (int)MathF.Round(fz);
            C.Set(tx, y + k, tz, log);
            if (k > height / 3) { fx += MathF.Cos(lean) * 0.22f; fz += MathF.Sin(lean) * 0.22f; }
        }
        int branches = 3 + (int)(H(x, y, z, 17) * 3);
        for (int b = 0; b < branches; b++)
        {
            float a = lean + (b - branches / 2f) * 1.7f + H(x, b, z, 18);
            int by = y + height / 2 + (int)(H(x, b, z, 19) * (height / 2));
            int len = 2 + (int)(H(x, b, z, 20) * 4);
            float bx = tx, bz = tz;
            for (int k = 1; k <= len; k++)
            {
                bx += MathF.Cos(a); bz += MathF.Sin(a);
                C.Set((int)MathF.Round(bx), by + (k + 1) / 2, (int)MathF.Round(bz), log);
            }
            // A twig forking off the end.
            float a2 = a + (H(x, b, z, 24) < 0.5f ? 0.9f : -0.9f);
            C.Set((int)MathF.Round(bx + MathF.Cos(a2)), by + (len + 1) / 2 + 1, (int)MathF.Round(bz + MathF.Sin(a2)), log);
        }
        if (H(x, y, z, 21) < 0.25f) C.Set(tx, y + height, tz, Blocks.DryLeaves);
    }

    /// <summary>A gravestone: a slab of carved stone, sometimes toppled, sometimes with a candle.</summary>
    public void Grave(int x, int y, int z, bool alongX)
    {
        float h = H(x, y, z, 22);
        if (h < 0.2f) { C.Set(x, y, z, Blocks.DuskSlab); C.Set(x + (alongX ? 0 : 1), y, z + (alongX ? 1 : 0), Blocks.DuskSlab); }
        else
        {
            C.Set(x, y, z, h < 0.6f ? Blocks.CarvedStone : Blocks.Duskstone);
            if (h > 0.8f) C.Set(x, y + 1, z, Blocks.DuskSlab);
        }
        // The mound in front of it.
        int fx = x + (alongX ? 0 : 1), fz = z + (alongX ? 1 : 0);
        C.Set(fx, y - 1, fz, Blocks.Dirt);
        if (h > 0.9f) C.Set(fx, y - 1, fz, Blocks.Air);     // an open grave
        if (h > 0.45f && h < 0.55f) C.Place(fx, y, fz, Blocks.Candle);
    }
}
