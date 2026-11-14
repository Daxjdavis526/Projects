using System;

namespace Strata;

/// <summary>
/// The mosaic beside the launch pad: a photograph built out of pigment
/// blocks, 90 blocks wide and 140 high, one block to a pixel, standing just
/// behind the launch tower (between it and the fuel farm's fence) and facing
/// west toward the rocket, the observatory and the castle. It stands on steel
/// legs, with the fuel and water pipes running under it; a steel frame runs
/// round it, scaffolding holds it up from behind, and floodlights along its
/// foot and sides light it at night. It is part of the launch complex, so it stands in both kinds
/// of world.
///
/// The picture (<see cref="PortraitData"/>) is turned into blocks here: each
/// pixel takes the nearest pigment, and what it misses by is passed on to the
/// pixels not yet chosen (Floyd–Steinberg error diffusion, serpentine), so
/// areas between two pigments come out as a fine mix of both, the way pixel
/// art dithers.
/// </summary>
public sealed class Portrait
{
    public const int W = PortraitData.W, H = PortraitData.H;
    /// <summary>The picture's plane and first column, relative to the pad's centre column; its bottom row.</summary>
    public const int PlaneX = 24, Z0 = -45;
    public const int Y0 = LandmarkSite.Valley + 4;
    public const int Top = Y0 + H - 1;

    private readonly Canvas C;

    public Portrait(Canvas c) { C = c; }

    /// <summary>The pigment chosen for each pixel, row by row from the top: indices into <see cref="Pigments.All"/>.</summary>
    public static int[] Indices => _indices.Value;
    private static readonly Lazy<int[]> _indices = new(Quantize);

    /// <summary>The block at a pixel (row 0 at the top, column 0 at the north end).</summary>
    public static ushort BlockAt(int row, int col) => Pigments.Blocks[Indices[row * W + col]];

    /// <summary>Where a pixel is, in site coordinates: seen from the west, the picture's left is north.</summary>
    public static (int x, int y, int z) Cell(int row, int col) =>
        (LandmarkSite.PadCentre.X + PlaneX, Top - row, LandmarkSite.PadCentre.Y + Z0 + col);

    public void Build()
    {
        int px = LandmarkSite.PadCentre.X + PlaneX, z0 = LandmarkSite.PadCentre.Y + Z0, z1 = z0 + W - 1;
        const int G = LandmarkSite.Valley;

        // The picture, its concrete backing, and a steel frame round both.
        for (int row = 0; row < H; row++)
            for (int col = 0; col < W; col++)
            {
                var (x, y, z) = Cell(row, col);
                C.Set(x, y, z, BlockAt(row, col));
            }
        C.Fill(px + 1, Y0, z0, px + 1, Top, z1, Blocks.Concrete);
        foreach (int x in new[] { px, px + 1 })
        {
            C.Fill(x, Y0 - 1, z0 - 1, x, Top + 1, z0 - 1, Blocks.SteelPlate);
            C.Fill(x, Y0 - 1, z1 + 1, x, Top + 1, z1 + 1, Blocks.SteelPlate);
            C.Fill(x, Top + 1, z0, x, Top + 1, z1, Blocks.SteelPlate);
            C.Fill(x, Y0 - 1, z0, x, Y0 - 1, z1, Blocks.SteelPlate);
        }

        // Legs down to the ground, and scaffolding behind: truss columns tied across every 14 blocks.
        // The columns fall every 11 blocks from the north end, which keeps them clear of the two pipes.
        for (int z = z0 - 1; z <= z1 + 1; z += 11)
        {
            C.Fill(px, G, z, px + 1, Y0 - 2, z, Blocks.SteelTruss);
            C.Fill(px + 2, G, z, px + 2, Top, z, Blocks.SteelTruss);
        }
        for (int y = Y0 + 6; y <= Top; y += 14)
            C.Fill(px + 2, y, z0, px + 2, y, z1, Blocks.SteelTruss);

        // Floodlights: on the frame's foot, and up both sides.
        for (int z = z0 + 2; z <= z1 - 2; z += 6) C.Set(px - 1, Y0 - 1, z, Blocks.FloodLamp);
        for (int y = Y0 + 8; y < Top; y += 12)
        {
            C.Set(px - 1, y, z0 - 1, Blocks.FloodLamp);
            C.Set(px - 1, y, z1 + 1, Blocks.FloodLamp);
        }
    }

    /// <summary>
    /// Picks a pigment for every pixel: the nearest by a perceptual distance
    /// (the "redmean" weighting of RGB), with Floyd–Steinberg error
    /// diffusion run back and forth along the rows. Deterministic: the same
    /// picture always gives the same blocks.
    /// </summary>
    private static int[] Quantize()
    {
        var bytes = Convert.FromBase64String(PortraitData.Rgb);
        if (bytes.Length != W * H * 3) throw new InvalidOperationException($"portrait data is {bytes.Length} bytes, expected {W * H * 3}");
        var px = new float[bytes.Length];
        for (int i = 0; i < bytes.Length; i++) px[i] = bytes[i] / 255f;
        var pal = new (float r, float g, float b)[Pigments.All.Length];
        for (int i = 0; i < pal.Length; i++) { var c = Pigments.All[i].Color; pal[i] = (c.R, c.G, c.B); }

        var idx = new int[W * H];
        const float Keep = 0.85f;     // a little less than all of the error, so flat areas do not crawl with noise
        void Spread(int x, int y, float er, float eg, float eb, float w)
        {
            if (x < 0 || x >= W || y >= H) return;
            int i = (y * W + x) * 3;
            px[i] += er * w; px[i + 1] += eg * w; px[i + 2] += eb * w;
        }
        for (int y = 0; y < H; y++)
        {
            bool back = (y & 1) == 1;
            int dir = back ? -1 : 1;
            for (int k = 0; k < W; k++)
            {
                int x = back ? W - 1 - k : k;
                int i = (y * W + x) * 3;
                float r = Math.Clamp(px[i], 0f, 1f), gr = Math.Clamp(px[i + 1], 0f, 1f), b = Math.Clamp(px[i + 2], 0f, 1f);
                int best = Nearest(pal, r, gr, b);
                idx[y * W + x] = best;
                float er = (r - pal[best].r) * Keep, eg = (gr - pal[best].g) * Keep, eb = (b - pal[best].b) * Keep;
                Spread(x + dir, y, er, eg, eb, 7f / 16f);
                Spread(x - dir, y + 1, er, eg, eb, 3f / 16f);
                Spread(x, y + 1, er, eg, eb, 5f / 16f);
                Spread(x + dir, y + 1, er, eg, eb, 1f / 16f);
            }
        }
        return idx;
    }

    /// <summary>The palette entry nearest a colour, by redmean-weighted RGB distance.</summary>
    public static int Nearest((float r, float g, float b)[] pal, float r, float g, float b)
    {
        int best = 0;
        float bestD = float.MaxValue;
        for (int k = 0; k < pal.Length; k++)
        {
            float rm = (r + pal[k].r) * 0.5f;
            float dr = r - pal[k].r, dg = g - pal[k].g, db = b - pal[k].b;
            float d = (2f + rm) * dr * dr + 4f * dg * dg + (3f - rm) * db * db;
            if (d < bestD) { bestD = d; best = k; }
        }
        return best;
    }
}
