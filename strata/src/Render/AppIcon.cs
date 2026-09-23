using Godot;

namespace Strata;

/// <summary>
/// The window and taskbar icon, painted like everything else: a block of the
/// world cut open to show its layers — turf, soil, stone with a copper seam
/// and a lumen crystal, and dark slate at the bottom.
/// </summary>
public static class AppIcon
{
    public static Image Paint(int size = 64)
    {
        var p = new Pixel(size, size, "app-icon");
        p.Clear(new Color(0, 0, 0, 0));
        int m = size / 16, s = size - 2 * m;
        float u = s / 16f;
        for (int y = 0; y < s; y++)
            for (int x = 0; x < s; x++)
            {
                float h = p.Hash(x / (int)u, y / (int)u);
                float fy = y / u;
                Color c = fy < 3.2f ? Pixel.Hex(0x5f9e3a) : fy < 6.5f ? Pixel.Hex(0x7a5433) : fy < 12.5f ? Pixel.Hex(0x7c7c82) : Pixel.Hex(0x3a3a44);
                if (fy < 3.2f && fy > 2.2f && h > 0.5f) c = Pixel.Hex(0x7a5433);        // turf hanging over the soil
                c = Pixel.Shade(c, 0.88f + h * 0.24f);
                p.Set(m + x, m + y, c);
            }
        void Speck(float cx, float cy, float r, Color c)
        {
            for (int y = 0; y < s; y++)
                for (int x = 0; x < s; x++)
                {
                    float dx = x / u - cx, dy = y / u - cy;
                    if (dx * dx + dy * dy < r * r) p.Set(m + x, m + y, Pixel.Shade(c, 1f + (dx + dy < 0 ? 0.2f : -0.1f)));
                }
        }
        Speck(4f, 8.5f, 1.2f, Pixel.Hex(0xd8844f));
        Speck(5.6f, 9.6f, 0.9f, Pixel.Hex(0xc9733e));
        Speck(11f, 10.2f, 1.5f, Pixel.Hex(0x6ff2e4));
        Speck(11.4f, 9.6f, 0.5f, Pixel.Hex(0xe8fffc));
        p.Frame(m, m, s, s, Pixel.Hex(0x14110e));
        return p.ToImage();
    }
}
