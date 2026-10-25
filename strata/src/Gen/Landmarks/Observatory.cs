using System;
using Godot;

namespace Strata;

/// <summary>
/// The observatory of a Gargantua world, where a new player arrives: a
/// concrete tower on the plain south-west of the launch complex with a wide
/// deck on top, a parapet low enough to see over, a telescope trained on
/// Gargantua, a launch console wired to the pad, and a road to the complex.
/// From the deck the black hole hangs over the northern horizon, beyond the
/// launch tower.
/// </summary>
public sealed class Observatory
{
    private readonly LandmarkSite _site;
    private readonly Canvas C;
    private readonly Gothic g;

    public Observatory(LandmarkSite site, Canvas c, Rng r)
    {
        _site = site; C = c;
        g = new Gothic(site, c, r);
    }

    private int Ground(int x, int z) => _site.Height(x, z) + 1;     // first air

    public void Build()
    {
        Road();
        Tower();
    }

    private void Tower()
    {
        var o = LandmarkSite.Observatory;
        int top = LandmarkSite.ObservatoryTop - 1;      // the deck's floor
        int y0 = Ground(o.X, o.Y);
        const int s = 3, d = 7;                         // the shaft's and the deck's half-widths

        // The shaft: hollow concrete with window slits, on a footing.
        C.Fill(o.X - s - 1, y0 - 3, o.Y - s - 1, o.X + s + 1, y0 - 1, o.Y + s + 1, Blocks.Concrete);
        for (int y = y0; y < top; y++)
            for (int z = o.Y - s; z <= o.Y + s; z++)
                for (int x = o.X - s; x <= o.X + s; x++)
                {
                    bool wall = Math.Abs(x - o.X) == s || Math.Abs(z - o.Y) == s;
                    bool corner = Math.Abs(x - o.X) == s && Math.Abs(z - o.Y) == s;
                    bool slit = wall && !corner && (x == o.X || z == o.Y) && (y - y0) % 5 == 3;
                    C.Set(x, y, z, !wall ? Blocks.Air : slit ? Blocks.Glass : corner ? Blocks.SteelPlate : Blocks.Concrete);
                }
        // A doorway on the south side and a lamp inside.
        C.Carve(o.X - 1, y0, o.Y + s, o.X + 1, y0 + 2, o.Y + s);
        C.Set(o.X, top - 1, o.Y, Blocks.LumenLamp);
        // The ladder up the inside of the south wall, through a hatch in the deck.
        for (int y = y0; y <= top; y++) g.OnWall(Blocks.Ladder, o.X, y, o.Y + s - 1, Dir.PZ);

        // The deck: concrete over the shaft, open grating round the edge, struts under the overhang.
        for (int z = o.Y - d; z <= o.Y + d; z++)
            for (int x = o.X - d; x <= o.X + d; x++)
            {
                int ring = Math.Max(Math.Abs(x - o.X), Math.Abs(z - o.Y));
                if (x == o.X && z == o.Y + s - 1) continue;          // the hatch
                C.Set(x, top, z, ring <= s ? Blocks.Concrete : ring == d ? Blocks.Concrete : Blocks.SteelGrating);
                C.Set(x, top - 1, z, ring > s ? (ring == d ? Blocks.SteelPlate : Blocks.Air) : C.Get(x, top - 1, z) ?? Blocks.Concrete);
                // A parapet a half block high round the rim, so the view over it is clear.
                if (ring == d) C.Set(x, top + 1, z, Blocks.ConcreteSlab);
            }
        foreach (var (sx, sz) in new[] { (-1, -1), (1, -1), (-1, 1), (1, 1) })
            for (int k = 1; k <= 3; k++)
                C.Set(o.X + sx * (s + k), top - 1 - (3 - k), o.Y + sz * (s + k), Blocks.SteelTruss);
        // Lamps let into the deck's corners, and a warning light on a mast.
        foreach (var (sx, sz) in new[] { (-1, -1), (1, -1), (-1, 1), (1, 1) })
            C.Set(o.X + sx * (d - 1), top, o.Y + sz * (d - 1), Blocks.LumenLamp);
        for (int y = top + 1; y <= top + 7; y++) C.Set(o.X + d, y, o.Y + d, Blocks.SteelTruss);
        C.Set(o.X + d, top + 8, o.Y + d, Blocks.WarningLamp);

        // Benches facing north, and the console that talks to the pad.
        for (int x = o.X - 2; x <= o.X + 2; x++) C.Set(x, top + 1, o.Y + 4, Blocks.ConcreteSlab);
        C.Set(o.X + 3, top + 1, o.Y - 5, Blocks.LaunchConsole);
        C.Set(o.X + 4, top + 1, o.Y - 5, Blocks.LaunchConsole);
        C.Set(o.X + 5, top + 1, o.Y - 5, Blocks.SteelPlate);

        Telescope(o.X - 5, top + 1, o.Y + 1);
    }

    /// <summary>A long refractor on a pillar, pointing at the black hole.</summary>
    private void Telescope(int px, int py, int pz)
    {
        C.Set(px, py, pz, Blocks.SteelPlate);
        C.Set(px, py + 1, pz, Blocks.SteelTruss);
        var pivot = new Vector3(px + 0.5f, py + 2.5f, pz + 0.5f);
        var target = new Vector3(LandmarkSite.PadCentre.X + 0.5f, LaunchComplex.Deck, LandmarkSite.PadCentre.Y + 0.5f) + Gargantua.FromPad;
        var dir = (target - pivot).Normalized();
        for (float t = -2.5f; t <= 7f; t += 0.25f)
        {
            var q = pivot + dir * t;
            C.Set(V.FloorToInt(q.X), V.FloorToInt(q.Y), V.FloorToInt(q.Z), t > 6.5f ? Blocks.Glass : Blocks.SteelPlate);
        }
    }

    /// <summary>A paved road from the tower's door to the complex, with lamp posts.</summary>
    private void Road()
    {
        var o = LandmarkSite.Observatory;
        var c = LandmarkSite.ComplexCentre;
        var away = new Vector2(o.X - c.X, o.Y - c.Y).Normalized();
        var pts = new[] { new Vector2(o.X, o.Y + 6), new Vector2(o.X + 14, o.Y + 6), new Vector2(c.X, c.Y) + away * 64f };
        const int width = 5;
        int lamp = 0;
        for (int i = 0; i + 1 < pts.Length; i++)
        {
            var a = pts[i]; var b = pts[i + 1];
            float len = (b - a).Length();
            var n = new Vector2(-(b.Y - a.Y), b.X - a.X) / len;
            int steps = (int)MathF.Ceiling(len * 2);
            for (int k = 0; k <= steps; k++)
            {
                var p = a + (b - a) * (k / (float)steps);
                for (float w = -width / 2f; w <= width / 2f; w += 0.5f)
                {
                    int x = (int)MathF.Round(p.X + n.X * w), z = (int)MathF.Round(p.Y + n.Y * w);
                    int y = Ground(x, z);
                    C.Set(x, y - 1, z, MathF.Abs(w) < 0.3f && (k / 6) % 2 == 0 ? Blocks.RoadLine : Blocks.Asphalt);
                    C.Carve(x, y, z, x, y + 2, z);
                }
                if (++lamp % 40 == 0)
                {
                    int lx = (int)MathF.Round(p.X + n.X * (width / 2f + 1.5f)), lz = (int)MathF.Round(p.Y + n.Y * (width / 2f + 1.5f));
                    int y = Ground(lx, lz);
                    for (int h = 0; h < 4; h++) C.Set(lx, y + h, lz, Blocks.SteelPlate);
                    C.Set(lx, y + 4, lz, Blocks.FloodLamp);
                }
            }
        }
    }
}
