using System;
using System.IO;
using System.IO.Compression;

namespace Strata;

/// <summary>
/// The Gallery: a block painting as tall as the world allows, standing north of
/// Castle Vorhaal in the showcase world. Every block of it is one solid-colour
/// Pigment block (one per colour of <see cref="PaintingData"/>, made from a
/// picture by strata/tools/painting.py). It faces south over a sunken viewing
/// bowl the site digs into the plain (<see cref="LandmarkSite.Height"/>), so its
/// foot is far below the plain and its top just under the world's ceiling.
///
/// Local site coordinates: +x east, +z south. The picture's left edge is at the
/// west end, so it reads the right way round to someone looking north at it.
/// </summary>
public sealed class Gallery
{
    /// <summary>The painting's west column, its face (the wall's south side) and its lowest row.</summary>
    public const int X0 = -50;
    public const int WallZ = -340;
    public const int Bottom = 14;
    /// <summary>The top row: just under the frame, which takes the last layer the world has but one.</summary>
    public static int Top => Bottom + PaintingData.Height - 1;
    public static int X1 => X0 + PaintingData.Width - 1;

    /// <summary>The bowl in front: from the wall south this far, a little wider than the painting each side.</summary>
    public const int BowlDepth = 140;
    public const int BowlMargin = 6;
    /// <summary>How fast the bowl's floor climbs from the painting's foot back up to the plain (blocks per block).</summary>
    public const float BowlRise = 0.4f;

    private readonly Canvas _c;

    public Gallery(Canvas c) { _c = c; }

    /// <summary>The bowl's floor (the top of its last solid block) at a site point, or -1 outside the bowl.</summary>
    public static int BowlFloor(int lx, int lz)
    {
        if (lx < X0 - BowlMargin || lx > X1 + BowlMargin || lz <= WallZ || lz > WallZ + BowlDepth) return -1;
        return Bottom - 1 + (int)((lz - WallZ - 1) * BowlRise);
    }

    /// <summary>How much of the site's terrain applies round the Gallery: 1 over the bowl and the wall, falling to 0.</summary>
    public static float Weight(int lx, int lz)
    {
        float dx = Math.Max(Math.Max(X0 - 30 - lx, lx - (X1 + 30)), 0);
        float dz = Math.Max(Math.Max(WallZ - 30 - lz, lz - (WallZ + BowlDepth + 20)), 0);
        return 1f - Smooth.Step(0f, 40f, MathF.Sqrt(dx * dx + dz * dz));
    }

    /// <summary>The picture: a palette index per block, row by row from the top-left.</summary>
    public static byte[] Cells()
    {
        var packed = Convert.FromBase64String(PaintingData.Cells);
        using var z = new ZLibStream(new MemoryStream(packed), CompressionMode.Decompress);
        var cells = new byte[PaintingData.Width * PaintingData.Height];
        int n = 0;
        while (n < cells.Length)
        {
            int got = z.Read(cells, n, cells.Length - n);
            if (got <= 0) throw new InvalidDataException("the painting's data is short");
            n += got;
        }
        return cells;
    }

    /// <summary>The block a painting cell is: column x from the west, row y from the top.</summary>
    public static ushort BlockAt(byte[] cells, int x, int y) => (ushort)(Blocks.PigmentFirst + cells[y * PaintingData.Width + x]);

    public void Build()
    {
        var cells = Cells();
        int w = PaintingData.Width, h = PaintingData.Height;
        // The face: one Pigment block per pixel.
        for (int row = 0; row < h; row++)
            for (int col = 0; col < w; col++)
                _c.Set(X0 + col, Top - row, WallZ, BlockAt(cells, col, row));
        // Behind it, two blocks of stone hold it up; round it, a dark frame one block wide, as deep as the wall.
        for (int z = WallZ - 2; z <= WallZ; z++)
        {
            for (int y = Bottom - 1; y <= Top + 1; y++)
                for (int x = X0 - 1; x <= X1 + 1; x++)
                {
                    bool frame = x == X0 - 1 || x == X1 + 1 || y == Bottom - 1 || y == Top + 1;
                    if (frame) _c.Set(x, y, z, Blocks.Asphalt);
                    else if (z < WallZ) _c.Set(x, y, z, Blocks.Stone);
                }
        }
    }
}
