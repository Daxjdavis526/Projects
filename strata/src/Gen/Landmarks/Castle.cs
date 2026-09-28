using System;
using System.Collections.Generic;

namespace Strata;

/// <summary>
/// Castle Vorhaal: a fortress on the crag, grown over centuries. The oldest
/// work is the west wing (rubble slate and ash brick: library, alchemist's
/// rooms, chapel); the great keep and its throne hall are the heart; the east
/// wing (dining hall, chambers, kitchen, armoury) is the newest and finest.
/// Under it all run the dungeons, the catacombs and the crypts, joined by
/// passages the living were not meant to find.
///
/// Levels (first air above each floor): the courtyard and ground floors at
/// 118; the keep's floors at 150, 174 and 198 (eight apart from 118 so the
/// keep's spiral stair lands exactly on each); the underground at 106.
/// </summary>
public sealed class Castle
{
    private const int G = LandmarkSite.Plateau;          // 118
    private const int U = 106;                           // the underground floor level
    private const int F2 = 150, F3 = 174, F4 = 198;      // the keep's upper floors
    private const int GX = LandmarkSite.GateX;            // 19

    private readonly LandmarkSite _site;
    private readonly Canvas C;
    private readonly Gothic g;

    // The curtain wall, clockwise from the north-west; the gate is between (26, 54) and (12, 54).
    private static readonly (int x, int z)[] Ring =
    {
        (-46, -40), (-14, -52), (18, -50), (44, -30), (50, 4), (40, 40), (26, 54), (12, 54), (-24, 48), (-50, 18),
    };
    private const int GateSegment = 6;

    public Castle(LandmarkSite site, Canvas c, Rng r)
    {
        _site = site; C = c;
        g = new Gothic(site, c, r);
    }

    public void Build()
    {
        Bailey();
        CurtainWall();
        Gatehouse();
        Bridge();
        Barbican();
        EntranceHall();
        Keep();
        StairTurret();
        EastWing();
        Armoury();
        WestWing();
        Chapel();
        Underground();
        Grounds();
        Ruins();
    }

    // --- the ground inside the walls ---------------------------------------------------------

    private static bool Inside(int x, int z)
    {
        bool c = false;
        for (int i = 0, j = Ring.Length - 1; i < Ring.Length; j = i++)
        {
            var (xi, zi) = Ring[i];
            var (xj, zj) = Ring[j];
            if ((zi > z) != (zj > z) && x < (xj - xi) * (z - zi) / (float)(zj - zi) + xi) c = !c;
        }
        return c;
    }

    private void Bailey()
    {
        for (int z = -56; z <= 58; z++)
            for (int x = -54; x <= 54; x++)
            {
                if (!Inside(x, z)) continue;
                float h = g.H(x, 0, z, 30);
                ushort pave = h < 0.55f ? Blocks.CobbledSlate : h < 0.75f ? Blocks.DuskTiles : h < 0.88f ? Blocks.Gravel : Blocks.ForestFloor;
                int ground = _site.Height(x, z);
                for (int y = Math.Min(ground, G - 2); y <= G - 2; y++) C.Set(x, y, z, _site.RockAt(x, y, z));
                C.Set(x, G - 1, z, pave);
                C.Carve(x, G, z, x, G + 2, z);
            }
    }

    // --- the curtain wall and its towers ----------------------------------------------------------

    private const int WallTop = 133;      // the wall-walk is on top of this

    private void CurtainWall()
    {
        float cx = 0, cz = 0;
        foreach (var (x, z) in Ring) { cx += x; cz += z; }
        cx /= Ring.Length; cz /= Ring.Length;
        for (int i = 0; i < Ring.Length; i++)
        {
            if (i == GateSegment) continue;
            var a = Ring[i];
            var b = Ring[(i + 1) % Ring.Length];
            bool ruined = i == 2;              // the north-east stretch, where the tower fell
            WallSegment(a.x, a.z, b.x, b.z, cx, cz, ruined);
        }
        // The towers, each its own age and shape.
        Tower(-46, -40, 6, 150, Blocks.SlateTiles, round: true, height: 22);
        Tower(-14, -52, 5, 148, Blocks.CrimsonRoof, round: false, height: 12);
        Tower(18, -50, 5, 146, Blocks.PatinaRoof, round: true, height: 18);
        RuinedTower(44, -30, 6);
        Tower(50, 4, 7, 156, Blocks.SlateTiles, round: true, height: 26);
        Tower(40, 40, 5, 150, Blocks.CrimsonRoof, round: false, height: 12);
        Tower(-24, 48, 5, 144, Blocks.SlateTiles, round: true, height: 17);
        Tower(-50, 18, 6, 152, Blocks.PatinaRoof, round: true, height: 20);
    }

    private void WallSegment(int ax, int az, int bx, int bz, float cx, float cz, bool ruined)
    {
        float vx = bx - ax, vz = bz - az, len = MathF.Sqrt(vx * vx + vz * vz);
        float nx = -vz / len, nz = vx / len;
        // Outward is away from the middle of the castle.
        float mx = (ax + bx) * 0.5f, mz = (az + bz) * 0.5f;
        if ((mx - cx) * nx + (mz - cz) * nz < 0) { nx = -nx; nz = -nz; }
        int x0 = Math.Min(ax, bx) - 3, x1 = Math.Max(ax, bx) + 3, z0 = Math.Min(az, bz) - 3, z1 = Math.Max(az, bz) + 3;
        for (int z = z0; z <= z1; z++)
            for (int x = x0; x <= x1; x++)
            {
                float px = x - ax, pz = z - az;
                float t = Math.Clamp((px * vx + pz * vz) / (len * len), 0f, 1f);
                float dx = px - vx * t, dz = pz - vz * t;
                float d = MathF.Sqrt(dx * dx + dz * dz);
                if (d > 1.6f) continue;
                float side = dx * nx + dz * nz;          // + outside, - inside
                float along = t * len;
                int top = WallTop;
                if (ruined)
                {
                    // Gaps and broken tops where the tower brought the wall down with it.
                    float n = g.H((int)(along / 3), 0, 0, 31);
                    top = along > len * 0.55f ? G + 2 + (int)(n * 8) : WallTop - (int)(n * 5);
                }
                int ground = _site.Height(x, z);
                for (int y = Math.Min(ground - 1, G - 1); y <= top; y++)
                    C.Set(x, y, z, g.Stone(ruined ? Masonry.Ruin : Masonry.Dusk, x, y, z));
                C.Carve(x, top + 1, z, x, top + 3, z);
                if (side > 0.9f && !(ruined && along > len * 0.55f))
                {
                    C.Set(x, top + 1, z, g.Stone(Masonry.Dusk, x, top + 1, z));
                    if (((int)MathF.Round(along)) % 2 == 0) C.Set(x, top + 2, z, g.Stone(Masonry.Dusk, x, top + 2, z));
                }
                // Arrow slits every seven blocks, and a lantern on the inner face between them.
                int step = (int)MathF.Round(along);
                if (step % 7 == 3 && step > 3 && step < len - 3) C.Carve(x, G + 6, z, x, G + 8, z);
                if (step % 14 == 10 && side < -1.2f) C.Set(x, G + 5, z, Blocks.CrimsonLantern);
            }
    }

    /// <summary>A wall tower: ladder inside, a floor at the wall-walk with doors onto it, a lookout, a roof.</summary>
    private void Tower(int cx, int cz, int r, int top, ushort roof, bool round, int height)
    {
        if (round)
        {
            g.RoundTower(cx, cz, r, G, top, Masonry.Dusk);
            g.RoundCrenellate(cx, cz, r + 1, top + 1, Masonry.Dusk);
            // Corbels: the parapet overhangs by a block.
            for (int dz = -r - 1; dz <= r + 1; dz++)
                for (int dx = -r - 1; dx <= r + 1; dx++)
                    if (Gothic.InDisc(dx, dz, r + 1) && !Gothic.InDisc(dx, dz, r)) C.Set(cx + dx, top, cz + dz, Blocks.DuskBricks);
            g.Spire(cx, cz, r - 0.5f, top + 1, height, roof);
        }
        else
        {
            g.Foundation(cx - r, cz - r, cx + r, cz + r, G - 1, Masonry.Dusk);
            g.Walls(cx - r, cz - r, cx + r, cz + r, G - 1, top, 2, Masonry.Dusk);
            C.Carve(cx - r + 2, G, cz - r + 2, cx + r - 2, top - 1, cz + r - 2);
            C.Fill(cx - r + 2, G - 1, cz - r + 2, cx + r - 2, G - 1, cz + r - 2, Blocks.DuskTiles);
            g.Crenellate(cx - r - 1, cz - r - 1, cx + r + 1, cz + r + 1, top + 1, Masonry.Dusk);
            C.Fill(cx - r - 1, top, cz - r - 1, cx + r + 1, top, cz + r + 1, Blocks.DuskBricks);
            foreach (var (px, pz) in new[] { (cx - r - 1, cz - r - 1), (cx + r + 1, cz - r - 1), (cx - r - 1, cz + r + 1), (cx + r + 1, cz + r + 1) })
                g.Pinnacle(px, top + 2, pz, 5);
            g.PyramidRoof(cx - r + 1, cz - r + 1, cx + r - 1, cz + r - 1, top + 1, roof, 3);
        }
        // Inside: a floor at the wall-walk, a ladder up the south wall, a doorway to the bailey.
        int ri = round ? Math.Max(1, r - (r >= 5 ? 2 : 1)) - 1 : r - 2;
        C.Fill(cx - ri, WallTop, cz - ri, cx + ri, WallTop, cz + ri, (x, y, z) =>
            Gothic.InDisc(x - cx, z - cz, ri + 0.4f) || !round ? Blocks.IronwoodPlanks : ushort.MaxValue);
        C.Set(cx, WallTop, cz + ri, Blocks.Air);
        for (int y = G; y <= WallTop + 2; y++) g.OnWall(Blocks.Ladder, cx, y, cz + ri, Dir.PZ);
        C.Set(cx, WallTop - 1, cz, Blocks.CrimsonLantern);
        C.Set(cx, top - 1, cz, Blocks.CrimsonLantern);
        // Doorway facing the middle of the castle, and openings onto the wall-walk all round.
        float ang = MathF.Atan2(-cz, -cx);
        int ox = (int)MathF.Round(MathF.Cos(ang) * (r + 1)), oz = (int)MathF.Round(MathF.Sin(ang) * (r + 1));
        CarveLine(cx, cz, cx + ox, cz + oz, G, G + 2);
        foreach (var (ax, az) in new[] { (1, 0), (-1, 0), (0, 1), (0, -1) })
            CarveLine(cx, cz, cx + ax * (r + 1), cz + az * (r + 1), WallTop + 1, WallTop + 2);
        C.Set(cx + ox, G + 3, cz + oz, Blocks.CrimsonLantern);
        // Lookout windows under the roof.
        foreach (var (ax, az) in new[] { (1, 0), (-1, 0), (0, 1), (0, -1) })
            for (int k = 0; k <= r; k++) C.Set(cx + ax * k, top - 3, cz + az * k, k == r || (round && k == r - 1) ? Blocks.EmberGlass : C.Get(cx + ax * k, top - 3, cz + az * k) ?? Blocks.Air);
        C.Fill(cx - 1, top - 2, cz - 1, cx + 1, top - 2, cz + 1, Blocks.Air);
    }

    /// <summary>Clears a one-wide passage between two points at the given heights (a doorway through a wall).</summary>
    private void CarveLine(int x0, int z0, int x1, int z1, int y0, int y1)
    {
        int n = Math.Max(Math.Abs(x1 - x0), Math.Abs(z1 - z0));
        for (int i = 0; i <= n; i++)
        {
            int x = x0 + (n == 0 ? 0 : (x1 - x0) * i / n), z = z0 + (n == 0 ? 0 : (z1 - z0) * i / n);
            C.Carve(x, y0, z, x, y1, z);
        }
    }

    /// <summary>The fallen north-east tower: a broken ring of wall, rubble inside and spilling out.</summary>
    private void RuinedTower(int cx, int cz, int r)
    {
        for (int dz = -r - 3; dz <= r + 3; dz++)
            for (int dx = -r - 3; dx <= r + 3; dx++)
            {
                int x = cx + dx, z = cz + dz;
                float d = MathF.Sqrt(dx * dx + dz * dz);
                float a = MathF.Atan2(dz, dx);
                int ground = _site.Height(x, z);
                if (d <= r + 0.4f)
                {
                    bool wall = d > r - 1.6f;
                    // The broken top: high at the back, gone at the front where it fell outward.
                    int top = wall ? G + 4 + (int)((MathF.Sin(a * 1.3f + 0.7f) * 0.5f + 0.5f) * 22 + g.H(x, 0, z, 32) * 5) : G - 1;
                    for (int y = Math.Min(ground - 1, G - 1); y <= top; y++) C.Set(x, y, z, g.Stone(Masonry.Ruin, x, y, z));
                    if (!wall)
                    {
                        C.Carve(x, G, z, x, G + 30, z);
                        if (g.H(x, 1, z, 33) < 0.45f) C.Set(x, G, z, g.H(x, 2, z, 34) < 0.5f ? Blocks.CrackedDuskBricks : Blocks.CobbledSlate);
                        if (g.H(x, 3, z, 35) < 0.12f) C.Set(x, G + 1, z, Blocks.Cobweb);
                    }
                }
                else if (d <= r + 3 && g.H(x, 4, z, 36) < 0.35f && Inside(x, z))
                    C.Set(x, G, z, g.H(x, 5, z, 37) < 0.5f ? Blocks.CrackedDuskBricks : Blocks.Gravel);   // rubble in the bailey
            }
    }

    // --- the gate, the bridge and the barbican ------------------------------------------------

    private void Gatehouse()
    {
        // The gate block between the two drum towers.
        g.Foundation(10, 47, 28, 60, G - 1, Masonry.Fine);
        g.Solid(12, G, 48, 26, 141, 59, Masonry.Fine);
        // The passage: a great pointed arch, 7 wide and 13 tall, straight through.
        for (int z = 47; z <= 60; z++)
        {
            var rows = Gothic.ArchProfile(7, 13);
            for (int k = 0; k < rows.Length; k++) C.Carve(GX - rows[k], G + k, z, GX + rows[k], G + k, z);
        }
        C.Fill(GX - 3, G - 1, 47, GX + 3, G - 1, 60, Blocks.DuskTiles);
        g.Opening(true, GX, 60, 60, G, 7, 13, 0, int.MinValue, true, Blocks.DuskPillar);
        g.Opening(true, GX, 47, 47, G, 7, 13, 0, int.MinValue, true, Blocks.DuskPillar);
        // The portcullis, half raised: its teeth hang over the passage.
        for (int x = GX - 3; x <= GX + 3; x++)
            for (int y = G + 7; y <= G + 12; y++)
                if (C.Get(x, y, 57) == Blocks.Air) C.Set(x, y, 57, Blocks.IronBars);
        // Murder holes in the passage roof and lanterns in the reveals.
        for (int z = 50; z <= 56; z += 3) C.Set(GX, G + 13, z, Blocks.Air);
        C.Set(GX - 4, G + 3, 53, Blocks.CrimsonLantern); C.Set(GX + 4, G + 3, 53, Blocks.CrimsonLantern);
        // Battlements and the banner hanging over the gate.
        g.Crenellate(12, 48, 26, 59, 142, Masonry.Fine);
        for (int x = GX - 2; x <= GX + 2; x += 2) g.BannerPair(x, G + 17, 61, Dir.NZ);
        g.GothicWindow(true, GX, 60, 59, G + 17, 5, 8, 60);
        // The drum towers.
        foreach (int tx in new[] { 10, 28 })
        {
            g.RoundTower(tx, 55, 6, G, 152, Masonry.Fine);
            g.RoundCrenellate(tx, 55, 7, 153, Masonry.Fine);
            for (int dz = -7; dz <= 7; dz++)
                for (int dx = -7; dx <= 7; dx++)
                    if (Gothic.InDisc(dx, dz, 7) && !Gothic.InDisc(dx, dz, 6)) C.Set(tx + dx, 152, 55 + dz, Blocks.DuskBricks);
            g.Spire(tx, 55, 5.5f, 153, 24, Blocks.SlateTiles);
            for (int y = G + 6; y < 150; y += 9) C.Set(tx, y, 61, Blocks.EmberGlass);
            C.Carve(tx - 1, G, 49, tx + 1, G + 2, 50);
            for (int y = G; y <= 150; y++) g.OnWall(Blocks.Ladder, tx, y, 58, Dir.PZ);
            C.Fill(tx - 3, 142, 52, tx + 3, 142, 58, (x, y, z) => Gothic.InDisc(x - tx, z - 55, 3.4f) ? Blocks.IronwoodPlanks : ushort.MaxValue);
            C.Set(tx, 142, 58, Blocks.Air);
            C.Carve(tx + (tx < GX ? 3 : -3), 143, 54, tx + (tx < GX ? 6 : -6), 144, 56);   // out onto the gate roof
        }
        // Two guardians outside, facing the bridge.
        g.Statue(GX - 5, G, 62);
        g.Statue(GX + 5, G, 62);
    }

    private void Bridge()
    {
        const int z0 = 60, z1 = 84;
        for (int z = z0; z <= z1; z++)
        {
            for (int x = GX - 4; x <= GX + 4; x++)
            {
                // Deck and the beam under it.
                for (int y = G - 5; y <= G - 1; y++) C.Set(x, y, z, x == GX - 4 || x == GX + 4 ? Blocks.CarvedStone : g.Stone(Masonry.Fine, x, y, z));
                C.Carve(x, G, z, x, G + 4, z);
            }
            C.Fill(GX - 2, G - 1, z, GX + 2, G - 1, z, (x, y, zz) => x == GX ? Blocks.CrimsonCarpet == 0 ? Blocks.DuskTiles : Blocks.DuskTiles : Blocks.DuskTiles);
            // Parapets.
            foreach (int x in new[] { GX - 4, GX + 4 })
            {
                C.Set(x, G, z, Blocks.DuskBricks);
                if (z % 2 == 0) C.Set(x, G + 1, z, Blocks.DuskSlab);
                if (z % 6 == 0)
                {
                    C.Set(x, G + 1, z, Blocks.DuskPillar);
                    C.Set(x, G + 2, z, Blocks.DuskPillar);
                    C.Set(x, G + 3, z, Blocks.CrimsonLantern);
                    C.Set(x, G + 4, z, Blocks.IronBars);
                }
            }
        }
        // Piers down to the gorge floor, with pointed arches between them.
        foreach (int pz in new[] { 66, 74, 82 })
            for (int z = pz - 1; z <= pz + 1; z++)
                for (int x = GX - 5; x <= GX + 5; x++)
                {
                    int ground = _site.Height(x, z);
                    for (int y = ground - 1; y <= G - 6; y++) C.Set(x, y, z, g.Stone(Masonry.Fine, x, y, z));
                }
        foreach (int z in new[] { 66, 74 })
        {
            g.Statue(GX - 5, G, z, true);
            g.Statue(GX + 5, G, z, true);
        }
        // Chains hanging from the deck's underside.
        for (int z = 62; z <= 82; z += 5)
            for (int k = 1; k <= 3 + (z % 3); k++) { C.Set(GX - 4, G - 5 - k, z, Blocks.Chain); C.Set(GX + 4, G - 5 - k, z, Blocks.Chain); }
    }

    /// <summary>The outer gate on the spur, where the road arrives: a walled court, a gate, and an avenue of statues.</summary>
    private void Barbican()
    {
        var c = LandmarkSite.SpurCentre;
        int r = LandmarkSite.SpurRadius;
        // Pave the spur top level with the bridge.
        for (int dz = -r - 1; dz <= r + 1; dz++)
            for (int dx = -r - 1; dx <= r + 1; dx++)
            {
                if (!Gothic.InDisc(dx, dz, r)) continue;
                int x = c.X + dx, z = c.Y + dz;
                int ground = _site.Height(x, z);
                for (int y = Math.Min(ground, G - 3); y <= G - 2; y++) C.Set(x, y, z, _site.RockAt(x, y, z));
                C.Set(x, G - 1, z, g.H(x, 0, z, 40) < 0.6f ? Blocks.CobbledSlate : Blocks.Gravel);
                C.Carve(x, G, z, x, G + 3, z);
                // A low ring wall round the edge, open where the road comes up and where the gate is.
                if (!Gothic.InDisc(dx, dz, r - 1))
                {
                    bool roadGap = dz > 8 && Math.Abs(dx) < 4;
                    bool gateGap = dz < -8 && Math.Abs(dx) < 6;
                    if (!roadGap && !gateGap)
                    {
                        C.Set(x, G, z, g.Stone(Masonry.Dusk, x, G, z));
                        C.Set(x, G + 1, z, g.Stone(Masonry.Dusk, x, G + 1, z));
                        if (((dx + dz) & 1) == 0) C.Set(x, G + 2, z, g.Stone(Masonry.Dusk, x, G + 2, z));
                    }
                }
            }
        // The outer gate at the spur's north edge.
        int gz = c.Y - r + 1;     // 83
        foreach (int tx in new[] { GX - 6, GX + 6 })
        {
            g.RoundTower(tx, gz, 3, G, 134, Masonry.Dusk);
            g.RoundCrenellate(tx, gz, 3, 135, Masonry.Dusk);
            g.Spire(tx, gz, 2.5f, 135, 12, Blocks.CrimsonRoof);
            C.Set(tx, G + 4, gz + 3, Blocks.CrimsonLantern);
        }
        g.Solid(GX - 4, G, gz - 1, GX + 4, G + 11, gz + 1, Masonry.Dusk);
        var rows = Gothic.ArchProfile(5, 9);
        for (int z = gz - 1; z <= gz + 1; z++)
            for (int k = 0; k < rows.Length; k++) C.Carve(GX - rows[k], G + k, z, GX + rows[k], G + k, z);
        g.Opening(true, GX, gz + 1, gz + 1, G, 5, 9, 0, int.MinValue, true);
        g.Crenellate(GX - 4, gz - 1, GX + 4, gz + 1, G + 12, Masonry.Dusk);
        for (int x = GX - 2; x <= GX + 2; x++) C.Set(x, G + 7, gz, Blocks.IronBars);
        // The avenue of statues and braziers from the road's arrival to the gate.
        for (int z = c.Y + 8; z >= gz + 4; z -= 4)
        {
            g.Statue(GX - 4, G, z, (z / 4) % 2 == 0);
            g.Statue(GX + 4, G, z, (z / 4) % 2 == 1);
            C.Set(GX - 3, G - 1, z + 2, Blocks.CobbledSlate);
            C.Set(GX - 3, G, z + 2, Blocks.Hearthfire);
            C.Set(GX + 3, G, z + 2, Blocks.Hearthfire);
        }
        C.Fill(GX - 1, G - 1, gz + 2, GX + 1, G - 1, c.Y + 12, Blocks.DuskTiles);
    }

    // --- the entrance hall --------------------------------------------------------------------

    private void EntranceHall()
    {
        const int x0 = -11, x1 = 15, z0 = -12, z1 = 20, height = 22;
        g.Hall(x0, z0, x1, z1, G, height, Masonry.Dusk);
        int top = G + height;
        g.GableRoof(x0, z0, x1, z1, top + 1, false, Blocks.SlateTiles, Masonry.Dusk, 2, 1);
        int mid = (x0 + x1) / 2;   // 2
        // The facade: a great doorway, a rose window over it, pinnacles at the corners.
        var rows = Gothic.ArchProfile(7, 11);
        for (int z = z1 - 1; z <= z1; z++)
            for (int k = 0; k < rows.Length; k++) C.Carve(mid - rows[k], G + k, z, mid + rows[k], G + k, z);
        g.Opening(true, mid, z1, z1, G, 7, 11, 0, int.MinValue, true, Blocks.DuskPillar);
        for (int x = mid - 3; x <= mid + 3; x++) for (int y = G + 7; y <= G + 10; y++) if (C.Get(x, y, z1 - 1) == Blocks.Air) C.Set(x, y, z1 - 1, Blocks.IronBars);
        g.RoseWindow(true, mid, G + 16, z1, 3.6f);
        foreach (int x in new[] { x0, x1 }) g.Pinnacle(x, top + 1, z1, 8);
        // A porch of steps and statues before the door.
        for (int k = 0; k < 3; k++)
            C.Fill(mid - 5 + k, G - 1 + 0, z1 + 1 + k, mid + 5 - k, G - 1, z1 + 1 + k, Blocks.DuskTiles);
        C.Fill(mid - 4, G, z1 + 1, mid + 4, G, z1 + 1, Blocks.DuskSlab);
        g.Statue(mid - 5, G, z1 + 2);
        g.Statue(mid + 5, G, z1 + 2);
        C.Set(mid - 5, G + 4, z1 + 2, Blocks.Hearthfire);
        C.Set(mid + 5, G + 4, z1 + 2, Blocks.Hearthfire);

        // Inside: two rows of columns, a gallery along both sides, a carpet to the throne room.
        int ix0 = x0 + 2, ix1 = x1 - 2, iz0 = z0 + 2, iz1 = z1 - 2;
        C.Fill(mid - 1, G - 1, iz0, mid + 1, G - 1, z1 + 3, Blocks.CrimsonCloth);
        C.Fill(mid - 2, G, iz0, mid + 2, G, iz1, (x, y, z) => Math.Abs(x - mid) <= 1 ? Blocks.CrimsonCarpet : ushort.MaxValue);
        foreach (int cx in new[] { mid - 7, mid + 7 })
            for (int z = iz0 + 2; z <= iz1 - 2; z += 5)
            {
                C.Fill(cx, G, z, cx, top - 1, z, Blocks.DuskPillar);
                C.Set(cx, G, z, Blocks.CarvedStone);
                C.Set(cx, G + 12, z, Blocks.Gilded);
            }
        // The galleries: 3 wide along the east and west walls at the height of the column capitals.
        int gy = G + 9;
        C.Fill(ix0, gy, iz0, ix0 + 3, gy, iz1, Blocks.IronwoodPlanks);
        C.Fill(ix1 - 3, gy, iz0, ix1, gy, iz1, Blocks.IronwoodPlanks);
        for (int z = iz0; z <= iz1; z++)
        {
            C.Set(ix0 + 3, gy + 1, z, Blocks.IronBars);
            C.Set(ix1 - 3, gy + 1, z, Blocks.IronBars);
        }
        // Stairs up to each gallery, along the facade wall.
        g.Stair(ix0 + 4, iz1, 0, -1, G, 9, 2, Masonry.Dusk, Blocks.DuskTiles);
        g.Stair(ix1 - 5, iz1, 0, -1, G, 9, 2, Masonry.Dusk, Blocks.DuskTiles);
        C.Carve(ix0, gy + 1, iz1 - 18, ix0 + 2, gy + 2, iz1 - 18);
        // Windows high in both side walls, above the galleries.
        for (int z = iz0 + 3; z <= iz1 - 3; z += 6)
        {
            g.GothicWindow(false, z, x0, x0 + 1, gy + 3, 3, 9, x0);
            g.GothicWindow(false, z, x1 - 1, x1, gy + 3, 3, 9, x1);
            g.BannerPair(ix0, G + 6, z, Dir.NX);
            g.BannerPair(ix1, G + 6, z, Dir.PX);
            g.Armour(mid - 4, G, z);
            g.Armour(mid + 4, G, z);
        }
        foreach (int z in new[] { iz0 + 6, iz0 + 16, iz1 - 3 })
            g.Chandelier(mid, top, z, 8);
        g.Sconces(ix0, iz0, ix1, iz1, G + 4, 5);
        g.Sconces(ix0, iz0, ix1, iz1, gy + 3, 6);
        for (int z = iz0 + 2; z <= iz1 - 2; z += 5) foreach (int cx in new[] { mid - 7, mid + 7 }) { C.Set(cx + 1, G + 5, z, Blocks.CrimsonLantern); C.Set(cx - 1, G + 5, z, Blocks.CrimsonLantern); }
        // Portraits (tapestries) and bookcases on the gallery walls, candles on the rail.
        for (int z = iz0; z <= iz1; z += 4)
        {
            C.Set(ix0, gy + 3, z, Blocks.Tapestry == 0 ? Blocks.Bookshelf : Blocks.Bookshelf);
            C.Place(ix0 + 1, gy + 1, z, Blocks.Candle);
            C.Place(ix1 - 1, gy + 1, z, Blocks.Candle);
        }
        // The way on: a tall doorway into the throne hall.
        var inner = Gothic.ArchProfile(5, 10);
        for (int z = z0 - 3; z <= z0 + 1; z++)
            for (int k = 0; k < inner.Length; k++) C.Carve(mid - inner[k], G + k, z, mid + inner[k], G + k, z);
        g.Opening(true, mid, z0 + 1, z0 + 1, G, 5, 10, 0, int.MinValue, true, Blocks.Gilded);
        C.Fill(mid - 1, G - 1, z0 - 3, mid + 1, G - 1, z0 + 1, Blocks.CrimsonCloth);
        // Buttresses down both long sides.
        for (int z = z0 + 3; z <= z1 - 2; z += 6)
        {
            g.Buttress(x0, z, -1, 0, G, top - 4, Masonry.Dusk);
            g.Buttress(x1, z, 1, 0, G, top - 4, Masonry.Dusk);
        }
    }

    // --- the great keep -----------------------------------------------------------------------

    private void Keep()
    {
        // Level 1: the throne hall, 31 wide and 32 tall.
        const int x0 = -15, x1 = 15, z0 = -46, z1 = -12;
        g.Foundation(x0, z0, x1, z1, G - 1, Masonry.Dusk);
        g.Walls(x0, z0, x1, z1, G - 1, F2 - 1, 3, Masonry.Dusk);
        C.Carve(x0 + 3, G, z0 + 3, x1 - 3, F2 - 2, z1 - 3);
        g.Solid(x0, F2 - 1, z0, x1, F2 - 1, z1, Masonry.Dusk);
        ThroneHall(x0 + 3, z0 + 3, x1 - 3, z1 - 3);

        // Level 2: the gallery of the house, set back two.
        Level(-13, -44, 13, -14, F2, F3, Masonry.Dusk, 2);
        Gallery(-11, -42, 11, -16);
        // Level 3: the Count's own rooms, set back again; the ledge round it is a balcony.
        Level(-11, -42, 11, -16, F3, F4, Masonry.Fine, 2);
        PrivateChambers(-9, -40, 9, -18);
        Balcony(-13, -44, 13, -14, F3);
        // Level 4: the Crimson Crown, flaring out again on corbels, 29 tall.
        const int ctop = F4 + 29;
        Level(-12, -43, 12, -15, F4, ctop, Masonry.Fine, 2);
        for (int x = -13; x <= 13; x++) { C.Set(x, F4 - 1, -44, Blocks.CarvedStone); C.Set(x, F4 - 1, -14, Blocks.CarvedStone); }
        for (int z = -44; z <= -14; z++) { C.Set(-13, F4 - 1, z, Blocks.CarvedStone); C.Set(13, F4 - 1, z, Blocks.CarvedStone); }
        CrimsonCrown(-10, -41, 10, -17, ctop);
        g.Crenellate(-13, -44, 13, -14, ctop + 1, Masonry.Fine);
        C.Fill(-13, ctop, -44, 13, ctop, -14, Blocks.DuskBricks);
        g.Spire(0, -29, 9.5f, ctop + 1, 22, Blocks.PatinaRoof);

        // Turrets: tall ones at the throne hall's corners, bartizans round the crown.
        var turrets = new (int x, int z, int top, ushort roof)[]
        {
            (x0, z0, 168, Blocks.SlateTiles), (x1, z0, 164, Blocks.CrimsonRoof), (x0, z1, 160, Blocks.CrimsonRoof), (x1, z1, 166, Blocks.SlateTiles),
        };
        foreach (var (tx, tz, tt, roof) in turrets)
        {
            g.RoundTower(tx, tz, 3, G, tt, Masonry.Dusk);
            g.RoundCrenellate(tx, tz, 3, tt + 1, Masonry.Dusk);
            g.Spire(tx, tz, 2.5f, tt + 1, 12 + (tt % 5), roof);
            for (int y = G + 8; y < tt; y += 10) C.Set(tx, y, tz + (tz < -20 ? -3 : 3), Blocks.EmberGlass);
        }
        foreach (var (bx, bz) in new[] { (-12, -43), (12, -43), (-12, -15), (12, -15) })
        {
            g.RoundTower(bx, bz, 3, F4 - 6, ctop + 6, Masonry.Fine);
            g.RoundCrenellate(bx, bz, 3, ctop + 7, Masonry.Fine);
            g.Spire(bx, bz, 2.5f, ctop + 7, 13, Blocks.PatinaRoof);
            for (int k = 1; k <= 5; k++) C.Set(bx, F4 - 6 - k, bz, k == 5 ? Blocks.Gilded : Blocks.CarvedStone);   // the corbel under it
        }

        // Flying buttresses: piers along the throne hall's long sides, struts up to the gallery walls.
        for (int z = z0 + 4; z <= z1 - 4; z += 6)
        {
            foreach (int side in new[] { -1, 1 })
            {
                int wx = side < 0 ? x0 : x1;
                int px = wx + side * 5;
                g.Foundation(px - 1, z, px + 1, z, G - 1, Masonry.Dusk);
                g.Solid(Math.Min(px - 1, px + 1), G, z, Math.Max(px - 1, px + 1), F2 + 2, z, Masonry.Dusk);
                g.Pinnacle(px, F2 + 3, z, 6);
                g.Flying(px, F2 + 1, z, side < 0 ? -13 : 13, F2 + 16, z, Masonry.Dusk);
                g.Flying(wx + side, G + 20, z, px, G + 12, z, Masonry.Dusk);
            }
        }
        // Struts from the gallery level's corners up to the crown's corbels.
        foreach (var (sx, sz) in new[] { (-1, -1), (1, -1), (-1, 1), (1, 1) })
            g.Flying(sx * 13, F3 + 2, sz > 0 ? -14 : -44, sx * 11, F4 - 4, sz > 0 ? -16 : -42, Masonry.Fine);
    }

    /// <summary>A storey of the keep: walls t thick, a floor, air inside, the ceiling slab left for the next level.</summary>
    private void Level(int x0, int z0, int x1, int z1, int floor, int ceil, Masonry m, int t)
    {
        g.Walls(x0, z0, x1, z1, floor - 1, ceil, t, m);
        C.Fill(x0, floor - 1, z0, x1, floor - 1, z1, (x, y, z) => x > x0 + t - 1 && x < x1 - t + 1 && z > z0 + t - 1 && z < z1 - t + 1 ? Blocks.DuskTiles : g.Stone(m, x, y, z));
        C.Carve(x0 + t, floor, z0 + t, x1 - t, ceil - 1, z1 - t);
        g.Solid(x0, ceil, z0, x1, ceil, z1, m);
    }

    private void ThroneHall(int ix0, int iz0, int ix1, int iz1)
    {
        C.Fill(ix0, G - 1, iz0, ix1, G - 1, iz1, (x, y, z) => ((x + z) & 1) == 0 ? Blocks.DuskTiles : Blocks.Duskstone);
        // Two ranks of columns, the carpet between.
        foreach (int cx in new[] { -7, 7 })
            for (int z = iz1 - 2; z >= iz0 + 8; z -= 5)
            {
                C.Fill(cx, G, z, cx, F2 - 2, z, Blocks.DuskPillar);
                C.Set(cx, G, z, Blocks.CarvedStone);
                C.Set(cx, F2 - 8, z, Blocks.Gilded);
                // Ribs: a pointed arch across the aisle to the wall.
                g.Flying(cx, F2 - 8, z, cx < 0 ? ix0 : ix1, F2 - 3, z, Masonry.Dusk);
                C.Set(cx + (cx < 0 ? 1 : -1), G, z, Blocks.CobbledSlate);
                C.Set(cx + (cx < 0 ? 1 : -1), G + 1, z, Blocks.Hearthfire);
            }
        C.Fill(-2, G - 1, iz0 + 6, 2, G - 1, iz1, Blocks.CrimsonCloth);
        C.Fill(-1, G, iz0 + 6, 1, G, iz1, Blocks.CrimsonCarpet);
        // The dais: three steps up, the throne on it, a great window behind.
        for (int k = 0; k < 3; k++)
            C.Fill(-8 + k, G + k / 2 - (k % 2 == 0 ? 0 : 0), iz0, 8 - k, G + k / 2, iz0 + 6 - k, k % 2 == 0 ? Blocks.DuskSlab : Blocks.DuskTiles);
        C.Fill(-6, G, iz0, 6, G, iz0 + 4, Blocks.DuskTiles);
        C.Fill(-5, G + 1, iz0, 5, G + 1, iz0 + 3, Blocks.CrimsonCarpet);
        int ty = G + 1;
        C.Set(0, ty, iz0 + 1, Blocks.Gilded);                     // the seat
        C.Fill(-1, ty, iz0, 1, ty + 4, iz0, Blocks.CrimsonCloth); // its high back
        C.Set(0, ty + 5, iz0, Blocks.Gilded);
        C.Set(-1, ty + 5, iz0, Blocks.IronBars); C.Set(1, ty + 5, iz0, Blocks.IronBars); C.Set(0, ty + 6, iz0, Blocks.IronBars);
        C.Set(-1, ty, iz0 + 1, Blocks.CarvedStone); C.Set(1, ty, iz0 + 1, Blocks.CarvedStone);   // arms
        foreach (int x in new[] { -4, 4 })
        {
            g.Statue(x, ty, iz0 + 1);
            C.Set(x, ty + 4, iz0 + 1, Blocks.CrimsonLantern);
        }
        g.GothicWindow(true, 0, iz0 - 3, iz0 - 1, G + 10, 9, 20, iz0 - 3);
        // Windows down both long walls, banners between.
        for (int z = iz1 - 4; z >= iz0 + 6; z -= 6)
        {
            g.GothicWindow(false, z, ix0 - 3, ix0 - 1, G + 6, 5, 16, ix0 - 3);
            g.GothicWindow(false, z, ix1 + 1, ix1 + 3, G + 6, 5, 16, ix1 + 3);
            g.BannerPair(ix0, G + 4, z + 3, Dir.NX);
            g.BannerPair(ix1, G + 4, z + 3, Dir.PX);
        }
        for (int z = iz1 - 3; z >= iz0 + 6; z -= 8) g.Chandelier(0, F2 - 2, z, 7);
        g.Sconces(ix0, iz0, ix1, iz1, G + 3, 6);
        g.Chandelier(-7, F2 - 2, iz0 + 4, 9);
        g.Chandelier(7, F2 - 2, iz0 + 4, 9);
        // Behind the fourth column on the west side, the wall is not a wall: the way down to the crypts.
        C.Fill(-15, G, -24, -13, G + 1, -24, Blocks.FalseDuskBricks);
        // Bones and a dark stain where petitioners knelt.
        g.Clutter(-4, iz0 + 7, 4, iz0 + 9, G, 0.3f, false);
    }

    private void Gallery(int ix0, int iz0, int ix1, int iz1)
    {
        // The long gallery of the house: armour and banners, portraits (tapestries), a table of maps.
        for (int z = iz0 + 2; z <= iz1 - 2; z += 4)
        {
            g.Armour(ix0 + 1, F2, z);
            g.Armour(ix1 - 1, F2, z);
            C.Set(ix0, F2 + 3, z + 2, Blocks.Tapestry);
            C.Set(ix0, F2 + 4, z + 2, Blocks.Tapestry);
            C.Set(ix1, F2 + 3, z + 2, Blocks.Tapestry);
            C.Set(ix1, F2 + 4, z + 2, Blocks.Tapestry);
        }
        g.Table(-3, iz0 + 8, 3, iz0 + 10, F2);
        C.Fill(-3, F2 + 1, iz0 + 9, 3, F2 + 1, iz0 + 9, Blocks.CrimsonCarpet);
        g.Fireplace(0, F2, iz1 - 1, 0, 1, F3 - 2);
        g.Shelves(-8, iz0, 8, iz0, F2, 5);
        foreach (var (x, z) in new[] { (-6, iz0 + 6), (6, iz0 + 6), (-6, iz1 - 6), (6, iz1 - 6) }) g.Chandelier(x, F3 - 2, z, 4);
        // Windows each side.
        for (int z = iz0 + 3; z <= iz1 - 3; z += 6)
        {
            g.GothicWindow(false, z, ix0 - 2, ix0 - 1, F2 + 5, 3, 10, ix0 - 2);
            g.GothicWindow(false, z, ix1 + 1, ix1 + 2, F2 + 5, 3, 10, ix1 + 2);
        }
        g.GothicWindow(true, 0, iz0 - 2, iz0 - 1, F2 + 8, 5, 12, iz0 - 2);
        g.Sconces(ix0, iz0, ix1, iz1, F2 + 3, 5);
        g.Clutter(ix0, iz0, ix1, iz1, F2, 0.05f);
    }

    private void PrivateChambers(int ix0, int iz0, int ix1, int iz1)
    {
        // The Count's bedchamber: his coffin on a dais under a canopy, a hearth, books, a desk.
        C.Fill(ix0, F3 - 1, iz0, ix1, F3 - 1, iz1, Blocks.CrimsonCloth);
        C.Fill(-3, F3, iz0 + 2, 3, F3, iz0 + 7, Blocks.DuskSlab);
        C.Fill(-2, F3 + 1, iz0 + 3, 2, F3 + 1, iz0 + 6, Blocks.CrimsonCarpet);
        g.Coffin(0, F3 + 1, iz0 + 4, false, open: true);
        foreach (var (x, z) in new[] { (-3, iz0 + 2), (3, iz0 + 2), (-3, iz0 + 7), (3, iz0 + 7) })
        {
            C.Fill(x, F3 + 1, z, x, F3 + 6, z, Blocks.DuskPillar);
            C.Set(x, F3 + 7, z, Blocks.Gilded);
        }
        C.Fill(-3, F3 + 7, iz0 + 2, 3, F3 + 7, iz0 + 7, (x, y, z) => x == -3 || x == 3 || z == iz0 + 2 || z == iz0 + 7 ? Blocks.CrimsonCloth : ushort.MaxValue);
        foreach (int x in new[] { -3, 3 }) for (int y = F3 + 2; y <= F3 + 6; y++) g.OnWall(Blocks.Banner, x, y, iz0 + 8, Dir.NZ);
        g.Fireplace(ix1, F3, -29, 1, 0, F4 - 2);
        g.Shelves(ix0, iz1 - 6, ix0, iz1, F3, 4);
        g.Table(ix0 + 3, iz1 - 3, ix0 + 6, iz1 - 2, F3, false);
        C.Set(ix0 + 4, F3, iz1 - 1, Blocks.IronwoodSlab);
        g.Chandelier(0, F4 - 2, -29, 4);
        g.Chandelier(0, F4 - 2, iz1 - 3, 3);
        C.Fill(ix0 + 1, F3, iz1 - 1, ix0 + 1, F3, iz1 - 1, Blocks.CrimsonLantern);
        // Windows onto the balcony, and doors out to it.
        for (int z = iz0 + 3; z <= iz1 - 3; z += 6)
        {
            g.GothicWindow(false, z, ix0 - 2, ix0 - 1, F3 + 3, 3, 9, ix0 - 2);
            g.GothicWindow(false, z, ix1 + 1, ix1 + 2, F3 + 3, 3, 9, ix1 + 2);
        }
        g.Opening(true, 0, iz1 + 1, iz1 + 2, F3, 3, 4, 0, int.MinValue, true);
        g.Opening(true, 0, iz0 - 2, iz0 - 1, F3, 3, 4, 0, int.MinValue, true);
        // The treasury: behind the bookcase wall's end, a false panel into the thickness of the wall.
        C.Fill(ix0 - 2, F3, iz1 - 8, ix0 - 1, F3 + 1, iz1 - 8, Blocks.FalseDuskBricks);
        C.Carve(ix0 - 5, F3, iz1 - 11, ix0 - 3, F3 + 2, iz1 - 6);
        C.Crate(ix0 - 5, F3, iz1 - 11, "treasury");
        C.Crate(ix0 - 5, F3, iz1 - 6, "treasury");
        C.Set(ix0 - 4, F3, iz1 - 11, Blocks.GoldBlock);
        C.Set(ix0 - 3, F3, iz1 - 6, Blocks.Candle);
        C.Set(ix0 - 5, F3 + 2, iz1 - 8, Blocks.CrimsonLantern);
        g.Sconces(ix0, iz0, ix1, iz1, F3 + 3, 5);
        g.Clutter(ix0, iz0, ix1, iz1, F3, 0.03f);
    }

    /// <summary>The walk round the Count's floor, on the roof of the gallery below: merlons and gargoyles.</summary>
    private void Balcony(int x0, int z0, int x1, int z1, int y)
    {
        for (int x = x0; x <= x1; x++)
            foreach (int z in new[] { z0, z1 })
            {
                C.Set(x, y, z, x % 2 == 0 ? Blocks.DuskBricks : Blocks.DuskSlab);
                if (x % 6 == 0) g.Statue(x, y, z, true);
            }
        for (int z = z0; z <= z1; z++)
            foreach (int x in new[] { x0, x1 })
                C.Set(x, y, z, z % 2 == 0 ? Blocks.DuskBricks : Blocks.DuskSlab);
        C.Carve(x0 + 1, y, z0 + 1, x1 - 1, y + 3, z0 + 1);
        C.Carve(x0 + 1, y, z1 - 1, x1 - 1, y + 3, z1 - 1);
        C.Carve(x0 + 1, y, z0 + 1, x0 + 1, y + 3, z1 - 1);
        C.Carve(x1 - 1, y, z0 + 1, x1 - 1, y + 3, z1 - 1);
        foreach (var (cx, cz) in new[] { (x0 + 1, z0 + 1), (x1 - 1, z0 + 1), (x0 + 1, z1 - 1), (x1 - 1, z1 - 1) })
            C.Set(cx, y, cz, Blocks.CrimsonLantern);
    }

    /// <summary>
    /// The top of the keep, and the end of the road: a vast chamber open to
    /// the sky through four great windows, a ring of fire round a raised
    /// floor, and at its heart the altar and the last coffin.
    /// </summary>
    private void CrimsonCrown(int ix0, int iz0, int ix1, int iz1, int ceil)
    {
        int cx = 0, cz = -29;
        C.Fill(ix0, F4 - 1, iz0, ix1, F4 - 1, iz1, (x, y, z) => ((x + z) & 1) == 0 ? Blocks.DuskTiles : Blocks.CrimsonCloth);
        // A moat of lava round the central floor, with four bridges.
        for (int dz = -9; dz <= 9; dz++)
            for (int dx = -9; dx <= 9; dx++)
            {
                float d = MathF.Sqrt(dx * dx + dz * dz);
                int x = cx + dx, z = cz + dz;
                bool bridge = Math.Abs(dx) <= 1 || Math.Abs(dz) <= 1;
                if (d > 5.6f && d < 8.2f && !bridge)
                {
                    C.Set(x, F4 - 1, z, Blocks.Lava);
                    C.Set(x, F4 - 2, z, Blocks.Duskstone);
                }
                else if (d <= 5.6f) C.Set(x, F4, z, (((dx + 9) + (dz + 9)) & 1) == 0 ? Blocks.DuskTiles : Blocks.Duskstone);
            }
        // The altar: a coffin of black wood on a gilded plinth, lanterns at its corners.
        C.Fill(cx - 2, F4 + 1, cz - 2, cx + 2, F4 + 1, cz + 2, Blocks.Gilded);
        g.Coffin(cx, F4 + 2, cz - 1, false);
        foreach (var (dx, dz) in new[] { (-2, -2), (2, -2), (-2, 2), (2, 2) })
        {
            C.Set(cx + dx, F4 + 2, cz + dz, Blocks.CrimsonLantern);
            C.Set(cx + dx, F4 + 3, cz + dz, Blocks.IronBars);
        }
        // Eight columns round the ring, chains swinging from the vault.
        for (int k = 0; k < 8; k++)
        {
            float a = k * MathF.Tau / 8 + MathF.PI / 8;
            int px = cx + (int)MathF.Round(MathF.Cos(a) * 9.5f), pz = cz + (int)MathF.Round(MathF.Sin(a) * 9.5f);
            C.Fill(px, F4, pz, px, ceil - 1, pz, Blocks.DuskPillar);
            C.Set(px, F4 + 14, pz, Blocks.Gilded);
            C.Set(px, F4, pz, Blocks.Hearthfire == 0 ? Blocks.CarvedStone : Blocks.CarvedStone);
            g.Flying(px, F4 + 14, pz, cx, ceil - 1, cz, Masonry.Fine);
            for (int c2 = 1; c2 <= 6 + k % 3; c2++) C.Set((px + cx) / 2, ceil - 2 - c2, (pz + cz) / 2, Blocks.Chain);
        }
        // Four great windows, one on each side, and braziers before them.
        g.GothicWindow(true, cx, iz0 - 2, iz0 - 1, F4 + 3, 9, 20, iz0 - 2);
        g.GothicWindow(true, cx, iz1 + 1, iz1 + 2, F4 + 3, 9, 20, iz1 + 2);
        g.GothicWindow(false, cz, ix0 - 2, ix0 - 1, F4 + 3, 9, 20, ix0 - 2);
        g.GothicWindow(false, cz, ix1 + 1, ix1 + 2, F4 + 3, 9, 20, ix1 + 2);
        foreach (var (x, z) in new[] { (cx, iz0 + 1), (cx, iz1 - 1), (ix0 + 1, cz), (ix1 - 1, cz) })
        {
            C.Set(x, F4, z, Blocks.CobbledSlate);
            C.Set(x, F4 + 1, z, Blocks.Hearthfire);
        }
        g.Chandelier(cx, ceil - 1, cz, 10);
        g.Sconces(ix0, iz0, ix1, iz1, F4 + 4, 5);
        g.Clutter(ix0, iz0, ix1, iz1, F4, 0.08f);
    }

    /// <summary>The spiral stair up the keep's east side, from the dungeons to the Crimson Crown.</summary>
    private void StairTurret()
    {
        const int tx = 18, tz = -30, r = 5, y0 = 102, y1 = 206, top = 214;
        g.RoundTower(tx, tz, r, y0, top, Masonry.Dusk);
        g.SpiralStair(tx, tz, 3, y0, y1, Masonry.Dusk, clockwise: true);
        g.RoundCrenellate(tx, tz, r + 1, top + 1, Masonry.Dusk);
        for (int dz = -r - 1; dz <= r + 1; dz++)
            for (int dx = -r - 1; dx <= r + 1; dx++)
                if (Gothic.InDisc(dx, dz, r + 1) && !Gothic.InDisc(dx, dz, r)) C.Set(tx + dx, top, tz + dz, Blocks.DuskBricks);
        g.Spire(tx, tz, r - 0.5f, top + 1, 20, Blocks.CrimsonRoof);
        // Doorways west into each floor of the keep (the stair's west side lands on 118, 150, 174 and 198).
        foreach (var (floor, xEnd) in new[] { (G, 12), (F2, 11), (F3, 9), (F4, 10) })
            C.Carve(xEnd, floor, tz - 1, tx - 2, floor + 2, tz + 1);
        // East, at the bottom, into the dungeon corridor (the east side lands on 106).
        C.Carve(tx + 2, U, tz - 1, tx + r + 1, U + 2, tz + 1);
        // Narrow windows spiralling up the shaft.
        for (int y = G + 4; y < y1; y += 6)
        {
            float a = y * 0.9f;
            int wx = tx + (int)MathF.Round(MathF.Cos(a) * r), wz = tz + (int)MathF.Round(MathF.Sin(a) * r);
            if (wx > 15) C.Set(wx, y, wz, Blocks.EmberGlass);
        }
        for (int y = y0 + 3; y < y1; y += 8) C.Set(tx, y, tz, Blocks.CrimsonLantern);
    }

    // --- the east wing: dining hall, chambers, kitchen ---------------------------------------------

    private void EastWing()
    {
        const int x0 = 18, x1 = 48, z0 = -6, z1 = 10;
        g.Hall(x0, z0, x1, z1, G, 14, Masonry.Fine);
        const int f1 = G + 15;   // the chambers' floor
        g.Walls(x0, z0, x1, z1, f1 - 1, f1 + 10, 2, Masonry.Fine);
        C.Carve(x0 + 2, f1, z0 + 2, x1 - 2, f1 + 9, z1 - 2);
        g.Solid(x0, f1 + 10, z0, x1, f1 + 10, z1, Masonry.Fine);
        g.GableRoof(x0, z0, x1, z1, f1 + 11, true, Blocks.CrimsonRoof, Masonry.Fine, 2, 1);

        // The dining hall: one long table under three chandeliers, a hearth at the far end.
        g.Table(x0 + 5, 1, x1 - 5, 3, G);
        C.Set(x1 - 4, G, 2, Blocks.Gilded);      // the host's chair
        C.Fill(x1 - 4, G + 1, 2, x1 - 4, G + 2, 2, Blocks.CrimsonCloth);
        g.Fireplace(x1 - 2, G, 2, 1, 0, f1 + 12);
        g.Fireplace(x0 + 2, G, 2, -1, 0, f1 + 12);
        foreach (int x in new[] { x0 + 9, (x0 + x1) / 2, x1 - 9 }) g.Chandelier(x, G + 13, 2, 4);
        g.Sconces(x0 + 2, z0 + 2, x1 - 2, z1 - 2, G + 3, 5);
        g.Sconces(x0 + 2, z0 + 2, x1 - 2, z1 - 2, f1 + 3, 7);
        for (int x = x0 + 4; x <= x1 - 4; x += 5)
        {
            g.GothicWindow(true, x, z0, z0 + 1, G + 3, 3, 8, z0);
            g.GothicWindow(true, x, z1 - 1, z1, G + 3, 3, 8, z1);
            g.BannerPair(x + 2, G + 8, z0 + 2, Dir.NZ);
            g.BannerPair(x + 2, G + 8, z1 - 2, Dir.PZ);
        }
        // Doors: west into the entrance hall, south into the bailey, east to the kitchen.
        C.Carve(x0 - 3, G, 1, x0 + 1, G + 3, 3);
        g.Opening(true, 33, z1 - 1, z1, G, 3, 5, 0, int.MinValue, true);
        g.Door(x1 - 1, G, 7, false, false);
        C.Carve(x1 - 1, G, 7, x1, G + 1, 7);
        g.Door(x1, G, 7, false, true);

        // The chambers above: four bedrooms off a corridor, reached by a stair from the hall.
        g.Stair(x0 + 3, z1 - 3, 1, 0, G, 15, 2, Masonry.Fine, Blocks.DuskTiles);
        C.Carve(x0 + 3, f1 - 1, z1 - 3, x0 + 30, f1 - 1, z1 - 2);
        C.Fill(x0 + 2, f1 - 1, z0 + 2, x1 - 2, f1 - 1, z1 - 2, Blocks.IronwoodPlanks);
        C.Carve(x0 + 3, f1 - 1, z1 - 3, x0 + 34, f1 - 1, z1 - 2);
        C.Fill(x0 + 2, f1 - 1, z0 + 2, x0 + 2, f1 - 1, z1 - 2, Blocks.IronwoodPlanks);
        for (int k = 0; k < 4; k++)
        {
            int rx0 = x0 + 2 + k * 7, rx1 = rx0 + 5;
            // Partition walls with a door, a bed (a coffin-shaped one, for some guests), a chest, a candle.
            for (int z = z0 + 2; z <= z0 + 7; z++) C.Set(rx1 + 1, f1, z, Blocks.DuskBricks);
            C.Fill(rx1 + 1, f1, z0 + 2, rx1 + 1, f1 + 9, z0 + 7, Blocks.DuskBricks);
            C.Fill(rx0, f1, z0 + 8, rx1 + 1, f1 + 9, z0 + 8, Blocks.DuskBricks);
            g.Door(rx0 + 2, f1, z0 + 8, true, k % 2 == 0);
            if (k == 2) g.Coffin(rx0 + 1, f1, z0 + 3, true);
            else { C.Set(rx0 + 1, f1, z0 + 3, Blocks.Bedroll); C.Set(rx0 + 2, f1, z0 + 3, Blocks.Bedroll); }
            C.Crate(rx1, f1, z0 + 2, k == 1 ? "armory" : "larder");
            C.Set(rx0, f1, z0 + 6, Blocks.IronwoodPlanks);
            C.Set(rx0, f1 + 1, z0 + 6, Blocks.Candle);
            C.Fill(rx0, f1 - 1, z0 + 2, rx1, f1 - 1, z0 + 7, Blocks.CrimsonCarpet == 0 ? Blocks.IronwoodPlanks : Blocks.IronwoodPlanks);
            C.Fill(rx0 + 1, f1, z0 + 4, rx1 - 1, f1, z0 + 6, (x, y, z) => ushort.MaxValue);
            g.GothicWindow(true, rx0 + 3, z0, z0 + 1, f1 + 2, 3, 6, z0);
            g.Clutter(rx0, z0 + 2, rx1, z0 + 7, f1, 0.02f);
        }
        // A balcony over the bailey from the corridor, with an iron rail.
        C.Fill(28, f1 - 1, z1 + 1, 38, f1 - 1, z1 + 3, Blocks.DuskBricks);
        for (int x = 28; x <= 38; x++) C.Set(x, f1, z1 + 3, Blocks.IronBars);
        for (int z = z1 + 1; z <= z1 + 3; z++) { C.Set(28, f1, z, Blocks.IronBars); C.Set(38, f1, z, Blocks.IronBars); }
        C.Carve(32, f1, z1 - 1, 34, f1 + 2, z1);
        for (int x = 29; x <= 37; x += 4) { C.Set(x, f1 - 2, z1 + 2, Blocks.CarvedStone); C.Set(x, f1 - 3, z1 + 1, Blocks.CarvedStone); }
        for (int x = x0 + 5; x <= x1 - 5; x += 8) g.Chandelier(x, f1 + 9, z1 - 3, 2);

        // The kitchen: ovens, a hearth, tables, the larder's crates.
        g.Hall(38, 12, 50, 24, G, 8, Masonry.Old);
        g.GableRoof(38, 12, 50, 24, G + 9, false, Blocks.SlateTiles, Masonry.Old, 2, 1);
        g.Fireplace(44, G, 23, 0, 1, G + 14);
        C.Set(40, G, 14, (ushort)(Blocks.FurnaceLit + 2)); C.Set(41, G, 14, (ushort)(Blocks.FurnaceLit + 2));
        g.Table(42, 16, 47, 17, G, false);
        C.Crate(40, G, 22, "larder");
        C.Crate(48, G, 14, "larder");
        C.Set(48, G, 15, Blocks.Crate);
        g.Chandelier(44, G + 7, 18, 2);
        g.Sconces(40, 14, 48, 22, G + 3, 4);
        C.Carve(47, G, 10, 48, G + 2, 12);
        g.Opening(true, 42, 24, 24, G, 3, 4, 0, int.MinValue, false);
        g.Clutter(40, 14, 48, 22, G, 0.08f);
    }

    // --- the armoury, over the dungeons -----------------------------------------------------------

    private void Armoury()
    {
        const int x0 = 24, x1 = 46, z0 = -30, z1 = -12;
        g.Hall(x0, z0, x1, z1, G, 12, Masonry.Fine, 3);
        g.Crenellate(x0, z0, x1, z1, G + 13, Masonry.Fine);
        // Arrow slits, weapons racked on the walls, armour stands in rows, a forge.
        for (int x = x0 + 4; x <= x1 - 4; x += 4)
        {
            C.Carve(x, G + 3, z0, x, G + 6, z0 + 2);
            C.Carve(x, G + 3, z1 - 2, x, G + 6, z1);
            g.Armour(x, G, z0 + 5);
            g.Armour(x, G, z1 - 5);
            C.Set(x - 1, G + 2, z0 + 3, Blocks.IronBars);
            C.Set(x + 1, G + 2, z1 - 3, Blocks.IronBars);
        }
        for (int x = x0 + 5; x <= x1 - 5; x += 6) { C.Crate(x, G, z0 + 3, "armory"); C.Crate(x, G, z1 - 3, "armory"); }
        C.Set(x1 - 4, G, -21, Blocks.IronBlock);                     // the anvil
        C.Set(x1 - 4, G, -23, (ushort)(Blocks.FurnaceLit + 1));
        C.Set(x1 - 3, G, -23, Blocks.Hearthfire);
        C.Set(x1 - 3, G - 1, -23, Blocks.Cobblestone);
        C.Fill(x0 + 4, G, -22, x0 + 4, G + 1, -20, Blocks.Thatch);     // straw targets
        g.Chandelier(35, G + 11, -21, 3);
        g.Sconces(x0 + 3, z0 + 3, x1 - 3, z1 - 3, G + 4, 5);
        g.BannerPair(x1 - 3, G + 8, -21, Dir.PX);
        // A door from the bailey on the south, and the way through to the stair turret on the west.
        g.Door(35, G, z1 - 1, true, false);
        C.Carve(35, G, z1 - 2, 35, G + 1, z1 - 2);
        C.Carve(x0 - 1, G, -31, x0 + 2, G + 2, -29);
    }

    // --- the west wing: library, study, alchemist's rooms -------------------------------------------

    private void WestWing()
    {
        // The library: two storeys of books round a hall, a gallery, a great west window.
        const int x0 = -46, x1 = -20, z0 = -22, z1 = -2;
        g.Hall(x0, z0, x1, z1, G, 20, Masonry.Old);
        g.GableRoof(x0, z0, x1, z1, G + 21, true, Blocks.SlateTiles, Masonry.Old, 2, 1);
        int ix0 = x0 + 2, ix1 = x1 - 2, iz0 = z0 + 2, iz1 = z1 - 2;
        C.Fill(ix0, G - 1, iz0, ix1, G - 1, iz1, (x, y, z) => ((x / 2 + z / 2) & 1) == 0 ? Blocks.IronwoodPlanks : Blocks.DuskTiles);
        const int gal = G + 9;
        g.Shelves(ix0, iz0, ix1, iz0, G, 8);
        g.Shelves(ix0, iz1, ix1, iz1, G, 8);
        g.Shelves(ix0, iz0, ix1, iz0, gal + 1, 8);
        g.Shelves(ix0, iz1, ix1, iz1, gal + 1, 8);
        // The gallery, three wide along the north and south walls.
        C.Fill(ix0, gal, iz0 + 1, ix1, gal, iz0 + 3, Blocks.IronwoodPlanks);
        C.Fill(ix0, gal, iz1 - 3, ix1, gal, iz1 - 1, Blocks.IronwoodPlanks);
        for (int x = ix0; x <= ix1; x++) { C.Set(x, gal + 1, iz0 + 4, Blocks.IronBars); C.Set(x, gal + 1, iz1 - 4, Blocks.IronBars); }
        for (int x = ix0 + 2; x <= ix1 - 2; x += 5) { C.Fill(x, G, iz0 + 4, x, gal - 1, iz0 + 4, Blocks.DuskPillar); C.Fill(x, G, iz1 - 4, x, gal - 1, iz1 - 4, Blocks.DuskPillar); }
        g.Stair(ix1 - 1, iz1 - 3, -1, 0, G, 9, 2, Masonry.Old, Blocks.IronwoodPlanks);
        C.Carve(ix1 - 19, gal, iz1 - 3, ix1 - 18, gal, iz1 - 2);
        // Freestanding cases on the floor, reading tables between them.
        for (int x = ix0 + 3; x <= ix1 - 6; x += 5)
        {
            g.Shelves(x, iz0 + 6, x, iz1 - 6, G, 4);
            C.Carve(x, G, (iz0 + iz1) / 2, x, G + 2, (iz0 + iz1) / 2);
        }
        g.Table(ix0 + 1, -12, ix0 + 1, -9, G, false);
        g.Table(ix1 - 4, -12, ix1 - 3, -11, G, false);
        g.GothicWindow(false, (z0 + z1) / 2, x0, x0 + 1, G + 4, 5, 14, x0);
        foreach (int x in new[] { -39, -33, -27 }) g.Chandelier(x, G + 19, (z0 + z1) / 2, 6);
        g.Sconces(ix0, iz0, ix1, iz1, G + 12, 5);
        for (int x = ix0 + 3; x <= ix1 - 6; x += 5) C.Set(x, G + 4, (iz0 + iz1) / 2 + 3, Blocks.CrimsonLantern);
        // Doors: south into the bailey, east to the throne hall's side.
        g.Opening(true, -33, z1 - 1, z1, G, 3, 5, 0, int.MinValue, true);
        C.Carve(x1 - 1, G, -8, x1 + 5, G + 2, -6);
        // Behind the tapestry on the north wall: the secret study.
        C.Fill(-36, G, z0, -36, G + 1, z0 + 1, Blocks.Tapestry);
        C.Carve(-42, G, -30, -30, G + 4, z0 - 1);
        C.Fill(-43, G - 1, -31, -29, G - 1, z0 - 1, Blocks.IronwoodPlanks);
        g.Walls(-43, -31, -29, z0, G - 1, G + 5, 1, Masonry.Old);
        C.Fill(-36, G, z0, -36, G + 1, z0 + 1, Blocks.Tapestry);
        C.Fill(-36, G, z0 - 1, -36, G + 1, z0 - 1, Blocks.Air);
        g.Shelves(-42, -30, -42, z0 - 1, G, 4);
        g.Table(-36, -28, -33, -27, G, false);
        C.Set(-34, G + 1, -28, Blocks.LumenLamp == 0 ? Blocks.Candle : Blocks.Candle);
        g.Coffin(-31, G, -30, true);
        C.Crate(-30, G, z0 - 2, "alchemy");
        C.Set(-36, G + 4, -27, Blocks.CrimsonLantern);
        C.Fill(-40, G - 1, -28, -38, G - 1, -26, Blocks.CrimsonCarpet);
        g.Clutter(-42, -30, -30, z0 - 1, G, 0.1f);

        Alchemy();
    }

    private void Alchemy()
    {
        const int x0 = -46, x1 = -28, z0 = 0, z1 = 14;
        g.Hall(x0, z0, x1, z1, G, 11, Masonry.Old);
        g.GableRoof(x0, z0, x1, z1, G + 12, true, Blocks.CrimsonRoof, Masonry.Old, 2, 1);
        int cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
        // A circle of red on the floor, candles at its points, a skull at its heart.
        for (int k = 0; k < 40; k++)
        {
            float a = k * MathF.Tau / 40;
            C.Set(cx + (int)MathF.Round(MathF.Cos(a) * 4), G, cz + (int)MathF.Round(MathF.Sin(a) * 4), Blocks.CrimsonCarpet);
        }
        for (int k = 0; k < 5; k++)
        {
            float a = k * MathF.Tau / 5 - MathF.PI / 2;
            float b = (k + 2) * MathF.Tau / 5 - MathF.PI / 2;
            int ax = cx + (int)MathF.Round(MathF.Cos(a) * 4), az = cz + (int)MathF.Round(MathF.Sin(a) * 4);
            int bx = cx + (int)MathF.Round(MathF.Cos(b) * 4), bz = cz + (int)MathF.Round(MathF.Sin(b) * 4);
            int n = Math.Max(Math.Abs(bx - ax), Math.Abs(bz - az));
            for (int i = 0; i <= n; i++) C.Set(ax + (bx - ax) * i / n, G, az + (bz - az) * i / n, Blocks.CrimsonCarpet);
            C.Set(ax, G, az, Blocks.Candle);
        }
        C.Set(cx, G, cz, Blocks.Bones);
        // Benches of glassware and crystal, cauldrons, a furnace, the reagent crates.
        for (int x = x0 + 3; x <= x1 - 3; x++)
        {
            C.Set(x, G, z0 + 2, Blocks.CarvedStone);
            C.Set(x, G + 1, z0 + 2, (x % 3) switch { 0 => Blocks.Glass, 1 => Blocks.LumenOre, _ => Blocks.Glowcap });
        }
        foreach (int x in new[] { x0 + 4, x1 - 4 })
        {
            C.Set(x, G, z1 - 3, Blocks.IronBlock);
            C.Set(x, G + 1, z1 - 3, Blocks.Water);
            C.Set(x, G - 1, z1 - 3, Blocks.Hearthfire == 0 ? Blocks.Cobblestone : Blocks.Cobblestone);
        }
        C.Set(x0 + 2, G, cz, (ushort)(Blocks.FurnaceLit + 1));
        C.Crate(x1 - 2, G, z0 + 3, "alchemy");
        C.Crate(x1 - 2, G, z1 - 2, "alchemy");
        g.Shelves(x0 + 2, z1 - 2, x0 + 8, z1 - 2, G, 4);
        g.Chandelier(cx, G + 10, cz, 3);
        g.Sconces(x0 + 2, z0 + 2, x1 - 2, z1 - 2, G + 3, 5);
        C.Set(cx, G + 6, z0 + 2, Blocks.Chain);
        C.Set(cx, G + 5, z0 + 2, Blocks.LumenLamp);
        for (int x = x0 + 4; x <= x1 - 4; x += 5) g.GothicWindow(true, x, z1 - 1, z1, G + 3, 3, 6, z1);
        g.Opening(false, 6, x1 - 1, x1, G, 3, 5, 0, int.MinValue, true);
        g.Clutter(x0 + 2, z0 + 3, x1 - 2, z1 - 3, G, 0.12f);
    }

    // --- the chapel -------------------------------------------------------------------------------

    private void Chapel()
    {
        const int x0 = -44, x1 = -20, z0 = -42, z1 = -26;
        g.Hall(x0, z0, x1, z1, G, 18, Masonry.Old);
        g.GableRoof(x0, z0, x1, z1, G + 19, true, Blocks.SlateTiles, Masonry.Old, 3, 1);
        int cz = (z0 + z1) / 2;
        // A bell-tower spire over the west end.
        g.RoundTower(x0 + 3, cz, 4, G + 18, G + 34, Masonry.Old);
        g.Spire(x0 + 3, cz, 4.5f, G + 35, 24, Blocks.PatinaRoof);
        C.Set(x0 + 3, G + 32, cz, Blocks.GoldBlock);
        for (int k = 0; k < 4; k++) C.Carve(x0 + 3 + (k < 2 ? (k == 0 ? 4 : -4) : 0), G + 29, cz + (k >= 2 ? (k == 2 ? 4 : -4) : 0), x0 + 3 + (k < 2 ? (k == 0 ? 4 : -4) : 0), G + 32, cz + (k >= 2 ? (k == 2 ? 4 : -4) : 0));
        // Rose window in the west gable, the altar in the east.
        g.RoseWindow(false, cz, G + 12, x0, 4.5f);
        C.Fill(x1 - 5, G, z0 + 3, x1 - 3, G, z1 - 3, Blocks.DuskTiles);
        C.Fill(x1 - 4, G + 1, cz - 2, x1 - 4, G + 1, cz + 2, Blocks.CarvedStone);
        C.Fill(x1 - 4, G + 2, cz - 1, x1 - 4, G + 2, cz + 1, Blocks.CrimsonCloth);
        foreach (int dz in new[] { -2, 2 }) C.Set(x1 - 4, G + 2, cz + dz, Blocks.Candle);
        C.Fill(x1 - 3, G + 6, cz - 1, x1 - 3, G + 12, cz + 1, Blocks.Gilded);          // a cross of gold, broken and turned
        C.Set(x1 - 3, G + 10, cz - 2, Blocks.Gilded); C.Set(x1 - 3, G + 9, cz + 2, Blocks.Gilded);
        g.GothicWindow(false, cz, x1 - 1, x1, G + 5, 5, 11, x1);
        // Pews in two blocks, candles, a toppled one.
        for (int x = x0 + 5; x <= x1 - 9; x += 2)
        {
            C.Fill(x, G, z0 + 2, x, G, cz - 2, Blocks.IronwoodSlab);
            C.Fill(x, G, cz + 2, x, G, z1 - 2, Blocks.IronwoodSlab);
        }
        C.Set(x0 + 9, G, cz + 3, Blocks.Air); C.Set(x0 + 9, G, cz + 5, Blocks.IronwoodPlanks);
        C.Fill(x0 + 2, G - 1, cz - 1, x1 - 5, G - 1, cz + 1, Blocks.CrimsonCloth);
        for (int x = x0 + 4; x <= x1 - 6; x += 5)
        {
            g.GothicWindow(true, x, z0, z0 + 1, G + 4, 3, 10, z0);
            g.GothicWindow(true, x, z1 - 1, z1, G + 4, 3, 10, z1);
            g.Buttress(x + 2, z0, 0, -1, G, G + 14, Masonry.Old, 2);
            g.Buttress(x + 2, z1, 0, 1, G, G + 14, Masonry.Old, 2);
        }
        foreach (int x in new[] { x0 + 8, x1 - 10 }) g.Chandelier(x, G + 17, cz, 5);
        g.Sconces(x0 + 2, z0 + 2, x1 - 2, z1 - 2, G + 3, 5);
        // The door from the bailey side; and in the floor by the altar, the stair down to the crypt.
        g.Opening(true, -31, z1 - 1, z1, G, 3, 6, 0, int.MinValue, true);
        C.Carve(-31, G, z1 + 1, -31, G + 2, z1 + 3);
        g.Stair(x1 - 8, z0 + 2, -1, 0, U, 12, 2, Masonry.Old);
        C.Carve(x1 - 31, U, z0 + 2, x1 - 8, U + 2, z0 + 3);
        g.Clutter(x0 + 2, z0 + 2, x1 - 2, z1 - 2, G, 0.05f);
    }

    // --- under the castle -----------------------------------------------------------------------

    private void Underground()
    {
        Dungeon();
        Crypts();
        HiddenStair();
        Tunnels();
    }

    /// <summary>The dungeons under the armoury: a corridor of cells, a guardroom, and the room at the end.</summary>
    private void Dungeon()
    {
        const int z = -30;             // corridor centre line
        C.Carve(22, U, z - 1, 50, U + 3, z + 1);
        C.Fill(22, U - 1, z - 1, 50, U - 1, z + 1, Blocks.CobbledSlate);
        for (int x = 24; x <= 50; x += 4) C.Set(x, U + 2, z + 1, (ushort)(Blocks.TorchWall + 2));
        for (int x = 24; x <= 40; x += 5)
        {
            g.Cell(x, z - 6, x + 3, z - 3, U, true, z - 2, (x / 5) % 2 == 0);
            g.Cell(x, z + 3, x + 3, z + 6, U, true, z + 2, (x / 5) % 2 == 1);
            C.Carve(x, U, z - 2, x + 3, U + 2, z - 2);
            C.Carve(x, U, z + 2, x + 3, U + 2, z + 2);
            for (int xx = x; xx <= x + 3; xx++)
                for (int y = U; y <= U + 2; y++)
                {
                    if (!((x / 5) % 2 == 0 && xx == x + 1 && y < U + 2)) C.Set(xx, y, z - 2, Blocks.IronBars);
                    if (!((x / 5) % 2 == 1 && xx == x + 2 && y < U + 2)) C.Set(xx, y, z + 2, Blocks.IronBars);
                }
        }
        // The room at the end: chains, a rack, a cage, a drain full of red.
        C.Carve(44, U, -38, 52, U + 5, -22);
        C.Fill(44, U - 1, -38, 52, U - 1, -22, Blocks.CobbledSlate);
        C.Fill(47, U - 1, -31, 49, U - 1, -29, Blocks.CrimsonCarpet);
        C.Fill(46, U, -36, 50, U, -35, Blocks.IronwoodPlanks);
        for (int x = 46; x <= 50; x += 2) for (int k = 1; k <= 4; k++) C.Set(x, U + 5 - k + 1, -25, Blocks.Chain);
        C.Fill(50, U, -28, 51, U + 2, -27, Blocks.IronBars);
        C.Set(51, U, -26, Blocks.IronBlock); C.Set(51, U + 1, -26, Blocks.IronBlock);
        C.Set(48, U + 4, -30, Blocks.CrimsonLantern);
        g.Clutter(44, -38, 52, -22, U, 0.25f);
        // The guardroom at the corridor's head.
        C.Carve(23, U, z + 3, 27, U + 2, z + 8);
        g.Table(24, z + 5, 26, z + 5, U, true);
        C.Crate(23, U, z + 8, "armory");
    }

    /// <summary>The crypt under the chapel and the catacombs under the library.</summary>
    private void Crypts()
    {
        // The crypt: a vaulted hall of tombs.
        const int x0 = -44, x1 = -22, z0 = -42, z1 = -28;
        C.Carve(x0, U, z0, x1, U + 7, z1);
        C.Fill(x0, U - 1, z0, x1, U - 1, z1, (x, y, z) => ((x + z) & 1) == 0 ? Blocks.DuskTiles : Blocks.CobbledSlate);
        for (int x = x0 + 3; x <= x1 - 3; x += 5)
            foreach (int z in new[] { z0 + 4, z1 - 4 })
            {
                C.Fill(x, U, z, x, U + 7, z, Blocks.DuskPillar);
                C.Set(x, U + 7, z, Blocks.CarvedStone);
            }
        for (int x = x0 + 4; x <= x1 - 6; x += 5) g.Sarcophagus(x, U, (z0 + z1) / 2 - 1, true);
        // Coffin niches in the long walls.
        for (int x = x0 + 1; x <= x1 - 2; x += 3)
        {
            C.Carve(x, U, z0 - 2, x + 1, U + 1, z0 - 1);
            g.Coffin(x, U, z0 - 2, true, (x / 3) % 3 == 0);
            C.Carve(x, U, z1 + 1, x + 1, U + 1, z1 + 2);
            g.Coffin(x, U, z1 + 2, true, (x / 3) % 4 == 1);
        }
        for (int x = x0 + 2; x <= x1 - 2; x += 6) C.Set(x, U + 6, (z0 + z1) / 2, Blocks.CrimsonLantern);
        g.Sconces(x0, z0, x1, z1, U + 3, 6);
        C.Crate(x1 - 1, U, z0 + 1, "crypt");
        g.Clutter(x0, z0, x1, z1, U, 0.2f);

        // The catacombs: a loop of narrow passages lined with bones.
        var loop = new (int x, int z)[] { (-31, -27), (-31, -18), (-44, -18), (-44, -4), (-24, -4), (-24, -18), (-31, -18) };
        for (int i = 0; i + 1 < loop.Length; i++) Passage(loop[i].x, loop[i].z, loop[i + 1].x, loop[i + 1].z, true);
        // The ossuary, sealed behind false bricks off the west passage.
        C.Fill(-46, U, -12, -45, U + 1, -12, Blocks.FalseDuskBricks);
        C.Carve(-52, U, -15, -47, U + 3, -9);
        C.Fill(-52, U - 1, -15, -47, U - 1, -9, Blocks.CobbledSlate);
        C.Fill(-52, U, -15, -52, U + 3, -9, Blocks.Bones == 0 ? Blocks.Bones : Blocks.Bones);
        g.Clutter(-51, -14, -48, -10, U, 1.4f);
        C.Crate(-51, U, -12, "crypt");
        C.Crate(-48, U, -14, "treasury");
        C.Set(-49, U + 3, -12, Blocks.CrimsonLantern);
    }

    /// <summary>A catacomb passage: three wide, niches of bones and coffins in the walls, a lantern now and then.</summary>
    private void Passage(int x0, int z0, int x1, int z1, bool niches)
    {
        int n = Math.Max(Math.Abs(x1 - x0), Math.Abs(z1 - z0));
        int sx = Math.Sign(x1 - x0), sz = Math.Sign(z1 - z0);
        for (int i = 0; i <= n; i++)
        {
            int x = x0 + sx * i, z = z0 + sz * i;
            C.Carve(x - 1, U, z - 1, x + 1, U + 2, z + 1);
            C.Fill(x - 1, U - 1, z - 1, x + 1, U - 1, z + 1, Blocks.CobbledSlate);
            if (!niches || i % 3 != 1) continue;
            // Niches in both walls.
            int nx = sz != 0 ? 1 : 0, nz = sx != 0 ? 1 : 0;
            foreach (int s in new[] { -2, 2 })
            {
                int px = x + nx * s, pz = z + nz * s;
                C.Carve(px, U, pz, px, U + 1, pz);
                C.Set(px, U, pz, g.H(px, 0, pz, 50) < 0.6f ? Blocks.Bones : Blocks.IronwoodPlanks);
                if (g.H(px, 1, pz, 51) < 0.3f) C.Set(px, U + 1, pz, Blocks.Candle);
            }
            if (i % 9 == 1) C.Set(x, U + 2, z, Blocks.Cobweb);
            if (i % 12 == 7) C.Set(x + nx, U + 2, z + nz, Blocks.CrimsonLantern);
        }
    }

    /// <summary>The hidden stair from the throne hall's false wall down to the catacombs.</summary>
    private void HiddenStair()
    {
        // A solid pier of masonry between chapel and library hides the shaft.
        g.Solid(-21, U - 1, -27, -16, G + 30, -21, Masonry.Old);
        g.SpiralStair(-18, -24, 2, U, G, Masonry.Old, clockwise: true);
        C.Carve(-17, G, -24, -16, G + 1, -24);       // its top opens east, behind the false bricks
        C.Carve(-22, U, -25, -20, U + 2, -23);        // its foot opens west, into the catacombs
        Passage(-22, -24, -31, -24, false);
        Passage(-31, -24, -31, -27, false);
        C.Set(-18, G + 5, -24, Blocks.Candle);
        C.Set(-18, U + 8, -24, Blocks.CrimsonLantern);
    }

    /// <summary>The passage from the crypts, under the keep, to the dungeons; and the old way out through the cliff.</summary>
    private void Tunnels()
    {
        Passage(-22, -40, -22, -49, false);
        Passage(-22, -49, 26, -49, true);
        Passage(26, -49, 26, -31, false);
        // The escape: west from the catacombs until the cliff opens up, a grate at the end.
        for (int x = -45; x >= -90; x--)
        {
            int z = -6;
            if (_site.Height(x, z) < U - 1 && x < -62)
            {
                for (int y = U; y <= U + 2; y++) C.Set(x, y, z, Blocks.IronBars);
                C.Set(x, U - 1, z, Blocks.CobbledSlate);
                break;
            }
            C.Carve(x, U, z - 1, x, U + 2, z + 1);
            C.Fill(x, U - 1, z - 1, x, U - 1, z + 1, Blocks.CobbledSlate);
            if (x % 10 == 0) C.Set(x, U + 2, z, Blocks.Cobweb);
        }
    }

    // --- the bailey -----------------------------------------------------------------------------

    private void Grounds()
    {
        // The well.
        for (int dz = -2; dz <= 2; dz++)
            for (int dx = -2; dx <= 2; dx++)
            {
                if (!Gothic.InDisc(dx, dz, 2)) continue;
                int x = 2 + dx, z = 34 + dz;
                bool rim = !Gothic.InDisc(dx, dz, 1);
                C.Set(x, G, z, rim ? Blocks.CobbledSlate : Blocks.Air);
                for (int y = G - 12; y < G; y++) C.Set(x, y, z, rim ? Blocks.CobbledSlate : y < G - 6 ? Blocks.Water : Blocks.Air);
            }
        C.Fill(0, G + 1, 34, 0, G + 3, 34, Blocks.IronwoodLog); C.Fill(4, G + 1, 34, 4, G + 3, 34, Blocks.IronwoodLog);
        C.Fill(0, G + 4, 34, 4, G + 4, 34, Blocks.IronwoodSlab);
        C.Set(2, G + 3, 34, Blocks.Chain);

        // The path from gate to hall: flagstones between statues and braziers.
        for (int i = 0; i <= 30; i++)
        {
            float t = i / 30f;
            int x = (int)MathF.Round(GX + (2 - GX) * t), z = (int)MathF.Round(47 - (47 - 23) * t);
            C.Fill(x - 1, G - 1, z, x + 1, G - 1, z, Blocks.DuskTiles);
            if (i % 6 == 3)
            {
                g.Statue(x - 4, G, z, i % 12 == 3);
                g.Statue(x + 4, G, z, i % 12 != 3);
            }
            if (i % 6 == 0) { C.Set(x - 3, G, z, Blocks.Hearthfire); C.Set(x + 3, G, z, Blocks.Hearthfire); }
        }

        // The graveyard in the west of the bailey, a mausoleum at its head, a fence round it.
        for (int z = 22; z <= 42; z += 3)
            for (int x = -42; x <= -26; x += 3)
                if (Inside(x, z) && Inside(x - 3, z + 3) && g.H(x, 0, z, 60) < 0.85f) g.Grave(x, G, z, true);
        Mausoleum(-36, 18);
        for (int x = -45; x <= -23; x++) { if (Inside(x, 44)) C.Set(x, G, 44, Blocks.IronBars); if (Inside(x, 19)) C.Set(x, G, 19, x % 6 == 0 ? Blocks.Air : Blocks.IronBars); }
        g.DeadTree(-30, G, 30, 9);
        g.DeadTree(-40, G, 38, 7);
        g.DeadTree(24, G, 28, 8);
        g.DeadTree(-10, G, 40, 6);

        // The stables in the east of the bailey, half fallen in.
        g.Walls(28, 24, 42, 36, G, G + 5, 1, Masonry.Ruin);
        C.Carve(28, G + 3, 29, 28, G + 5, 32);
        C.Carve(34, G, 24, 36, G + 3, 24);
        for (int x = 28; x <= 42; x++)
            for (int z = 24; z <= 36; z++)
                if (g.H(x, 7, z, 61) < 0.55f + (x - 28) * 0.02f) C.Set(x, G + 6, z, Blocks.Thatch);
        for (int x = 30; x <= 40; x += 3) { C.Fill(x, G, 26, x, G, 34, (xx, yy, zz) => g.H(xx, yy, zz, 62) < 0.4f ? Blocks.Thatch : ushort.MaxValue); }
        C.Crate(41, G, 35, "larder");
        // The gallows by the east wall.
        C.Fill(34, G, 46, 34, G + 5, 46, Blocks.IronwoodLog);
        C.Fill(34, G + 5, 44, 34, G + 5, 46, Blocks.IronwoodPlanks);
        C.Set(34, G + 4, 44, Blocks.Chain); C.Set(34, G + 3, 44, Blocks.Chain);
        C.Fill(33, G, 43, 35, G, 45, Blocks.IronwoodSlab);
    }

    private void Mausoleum(int cx, int cz)
    {
        g.Walls(cx - 3, cz - 4, cx + 3, cz + 4, G - 1, G + 6, 1, Masonry.Fine);
        C.Carve(cx - 2, G, cz - 3, cx + 2, G + 5, cz + 3);
        C.Fill(cx - 2, G - 1, cz - 3, cx + 2, G - 1, cz + 3, Blocks.DuskTiles);
        g.GableRoof(cx - 3, cz - 4, cx + 3, cz + 4, G + 7, false, Blocks.CrimsonRoof, Masonry.Fine, 2, 1);
        g.Opening(true, cx, cz + 4, cz + 4, G, 3, 5, 0, int.MinValue, true);
        g.Sarcophagus(cx, G, cz - 2, false);
        C.Set(cx - 2, G, cz - 3, Blocks.Candle); C.Set(cx + 2, G, cz - 3, Blocks.Candle);
        C.Set(cx, G + 4, cz, Blocks.CrimsonLantern);
        g.Statue(cx - 3, G, cz + 5); g.Statue(cx + 3, G, cz + 5);
    }

    /// <summary>Older work outside the walls on the north side: a fallen wall and a roofless watch-house.</summary>
    private void Ruins()
    {
        for (int x = -30; x <= 10; x++)
        {
            int z = -62 - (int)(MathF.Sin(x * 0.2f) * 2);
            int ground = _site.Height(x, z);
            if (ground < G - 6) continue;
            int top = ground + 1 + (int)(g.H(x, 0, z, 70) * 6);
            for (int y = ground - 1; y <= top; y++) { C.Set(x, y, z, g.Stone(Masonry.Ruin, x, y, z)); C.Set(x, y, z + 1, g.Stone(Masonry.Ruin, x, y, z + 1)); }
        }
    }
}
