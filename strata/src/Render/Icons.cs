using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// Inventory icons, built once per item: blocks as small isometric cubes
/// drawn from their own textures, everything else from ItemArt sprites.
/// </summary>
public static class Icons
{
    private static readonly Dictionary<ushort, ImageTexture> _cache = new();
    private static readonly Dictionary<ushort, Image> _sprites = new();
    public static readonly Color DefaultGrass = new(0.42f, 0.64f, 0.3f);
    public static readonly Color DefaultFoliage = new(0.36f, 0.58f, 0.26f);

    public static ImageTexture Get(ushort item)
    {
        if (_cache.TryGetValue(item, out var t)) return t;
        var img = Build(item);
        t = ImageTexture.CreateFromImage(img);
        _cache[item] = t;
        return t;
    }

    /// <summary>The 16 x 16 sprite for items drawn flat (also used to extrude held-item meshes).</summary>
    public static Image Sprite(ushort item)
    {
        if (_sprites.TryGetValue(item, out var img)) return img;
        var d = Items.Get(item);
        if (d.Icon == IconKind.Flat && d.IconLayer >= 0)
        {
            img = (Image)Textures.Layers[d.IconLayer].Duplicate();
            TintFlat(img, d);
        }
        else img = ItemArt.Paint(d).ToImage();
        _sprites[item] = img;
        return img;
    }

    private static Image Build(ushort item)
    {
        var d = Items.Get(item);
        if (d.Icon == IconKind.Cube) return Cube(d);
        var s = Sprite(item);
        var big = (Image)s.Duplicate();
        big.Resize(32, 32, Image.Interpolation.Nearest);
        return big;
    }

    private static void TintFlat(Image img, ItemDef d)
    {
        var def = Blocks.Get(d.Block);
        string name = Tex.Names[d.IconLayer];
        if (name != "tall_grass" && name != "fern") return;
        for (int y = 0; y < img.GetHeight(); y++)
            for (int x = 0; x < img.GetWidth(); x++)
            {
                var c = img.GetPixel(x, y);
                img.SetPixel(x, y, new Color(c.R * DefaultGrass.R * 1.6f, c.G * DefaultGrass.G * 1.6f, c.B * DefaultGrass.B * 1.6f, c.A));
            }
    }

    /// <summary>An isometric cube: top, left (+Z face) and right (+X face) sampled from the block's layers.</summary>
    private static Image Cube(ItemDef d)
    {
        const int S = 32;
        var def = Blocks.Get(d.Block);
        int top = def.Tex[Dir.PY], left = def.Tex[Dir.PZ], right = def.Tex[Dir.PX];
        if (d.Place == PlaceKind.Facing) left = def.Tex[Blocks.FacingDir[2]];
        var img = Image.CreateEmpty(S, S, false, Image.Format.Rgba8);
        float h = def.Render == RenderKind.Low ? def.Height : 1f;

        for (int py = 0; py < S; py++)
            for (int px = 0; px < S; px++)
            {
                float x = px + 0.5f, y = py + 0.5f;
                // Top rhombus, lowered for short blocks.
                float ty = 2f + (1f - h) * 14f;
                float dx = x - 16f, dy = y - ty;
                float u = (dx / 14f + dy / 7f) * 0.5f, v = (dy / 7f - dx / 14f) * 0.5f;
                if (u >= 0 && u < 1 && v >= 0 && v < 1)
                {
                    img.SetPixel(px, py, Sample(top, u, v, 1f, def));
                    continue;
                }
                // Left face.
                float lu = (x - 2f) / 14f;
                float lv = (y - (9f + (1f - h) * 14f) - 7f * lu) / (14f * h);
                if (lu >= 0 && lu < 1 && lv >= 0 && lv < 1)
                {
                    img.SetPixel(px, py, Sample(left, lu, 1f - h + lv * h, 0.8f, def));
                    continue;
                }
                float ru = (x - 16f) / 14f;
                float rv = (y - (16f + (1f - h) * 14f) + 7f * ru) / (14f * h);
                if (ru >= 0 && ru < 1 && rv >= 0 && rv < 1)
                    img.SetPixel(px, py, Sample(right, ru, 1f - h + rv * h, 0.62f, def));
            }
        return img;
    }

    private static Color Sample(int layer, float u, float v, float shade, BlockDef def)
    {
        var src = Textures.Layers[layer];
        int tx = Math.Clamp((int)(u * 16), 0, 15), ty = Math.Clamp((int)(v * 16), 0, 15);
        var c = src.GetPixel(tx, ty);
        string name = Tex.Names[layer];
        bool cut = Textures.CutoutLayers.Contains(layer);
        if (name is "grass_top" or "grass_side")
        {
            float m = 1f - c.A;  // alpha is the tint mask
            var g = new Color(c.R * DefaultGrass.R * 1.7f, c.G * DefaultGrass.G * 1.7f, c.B * DefaultGrass.B * 1.7f);
            c = new Color(Mathf.Lerp(c.R, g.R, m), Mathf.Lerp(c.G, g.G, m), Mathf.Lerp(c.B, g.B, m), 1f);
        }
        else if (name is "elm_leaves" or "ironwood_leaves" or "willow_leaves" or "pine_leaves")
        {
            c = new Color(c.R * DefaultFoliage.R * 1.7f, c.G * DefaultFoliage.G * 1.7f, c.B * DefaultFoliage.B * 1.7f, c.A);
        }
        if (cut && c.A < 0.5f) return new Color(0, 0, 0, 0);
        return new Color(Math.Min(1f, c.R * shade), Math.Min(1f, c.G * shade), Math.Min(1f, c.B * shade), 1f);
    }
}
