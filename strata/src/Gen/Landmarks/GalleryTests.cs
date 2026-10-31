using System.Linq;

namespace Strata;

/// <summary>The Gallery's block painting (Gen/Landmarks/Gallery.cs): its data, its blocks, the wall and the bowl.</summary>
public static partial class Tests
{
    private static void GalleryPainting()
    {
        // The data: a full grid of palette indices, and a Pigment block for every colour.
        var cells = Gallery.Cells();
        int w = PaintingData.Width, h = PaintingData.Height;
        Check(cells.Length == w * h && cells.All(c => c < PaintingData.Palette.Length), $"the painting decodes to {w} x {h} palette indices");
        Check(Gallery.Top + 1 <= V.Height - 1 && Gallery.Bottom >= 6, $"it stands from y {Gallery.Bottom} to {Gallery.Top}, its frame inside the world");
        bool pigments = true;
        for (int i = 0; i < PaintingData.Palette.Length; i++)
        {
            var b = Blocks.ById[Blocks.PigmentFirst + i];
            pigments &= b.Key == $"pigment_{i:D2}" && b.IsCube && b.Opaque && b.Breakable && Items.ByKey.ContainsKey(b.Key);
        }
        Check(pigments, $"{PaintingData.Palette.Length} Pigment blocks, solid cubes you can also mine and place");
        Check(cells.Distinct().Count() > PaintingData.Palette.Length / 2, "and the picture uses most of the colours");

        // The world: the painting stamped where it belongs, framed, with the bowl dug in front.
        var lw = new World(Hash.StringSeed("gallery"), landmarks: true);
        var site = lw.Gen.Landmarks;
        int ox = site.Ox, oz = site.Oz;
        var canvas = site.Canvas;
        bool face = true;
        foreach (var (col, row) in new[] { (0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w / 2, h / 2), (123, 45) })
            face &= canvas.Get(Gallery.X0 + col, Gallery.Top - row, Gallery.WallZ) == Gallery.BlockAt(cells, col, row);
        Check(face, "the picture's corners and middle are the right blocks, the right way round");
        Check(canvas.Get(Gallery.X0 - 1, Gallery.Bottom, Gallery.WallZ) == Blocks.Asphalt && canvas.Get(Gallery.X0, Gallery.Top + 1, Gallery.WallZ) == Blocks.Asphalt,
            "a dark frame round it");

        int midX = ox + Gallery.X0 + w / 2;
        Check(lw.Gen.GroundY(midX, oz + Gallery.WallZ + 1) == Gallery.Bottom, $"the bowl is dug to the painting's foot ({lw.Gen.GroundY(midX, oz + Gallery.WallZ + 1)})");
        int rim = lw.Gen.GroundY(midX, oz + Gallery.WallZ + Gallery.BowlDepth);
        Check(rim >= LandmarkSite.Valley - 6 && rim <= LandmarkSite.Valley + 6, $"and climbs back to the plain ({rim})");

        // A generated column through the painting carries it, from the frame at the foot to the frame at the top.
        int wx = midX, wz = oz + Gallery.WallZ;
        var ch = new Chunk(wx >> V.Shift, wz >> V.Shift);
        lw.Gen.Generate(ch);
        int lx = wx & V.Mask, lz = wz & V.Mask;
        bool column = ch.Blocks[V.Index(lx, Gallery.Bottom - 1, lz)] == Blocks.Asphalt && ch.Blocks[V.Index(lx, Gallery.Top + 1, lz)] == Blocks.Asphalt;
        for (int row = 0; row < h; row++) column &= ch.Blocks[V.Index(lx, Gallery.Top - row, lz)] == Gallery.BlockAt(cells, w / 2, row);
        Check(column, "a generated column through it holds every block of that column of the picture");
        var front = new Chunk(wx >> V.Shift, (wz + 1) >> V.Shift);
        lw.Gen.Generate(front);
        Check(front.Blocks[V.Index(lx, Gallery.Bottom, (wz + 1) & V.Mask)] == Blocks.Air && front.Blocks[V.Index(lx, Gallery.Bottom - 1, (wz + 1) & V.Mask)] != Blocks.Air,
            "and in front of it, open air down to the bowl's floor");
    }
}
