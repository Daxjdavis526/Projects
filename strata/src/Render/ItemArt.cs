using System;
using Godot;

namespace Strata;

/// <summary>
/// 16 x 16 sprites for everything that is not a block: tools, ingots, food,
/// materials. Painted from a handful of shape recipes and the item's colour,
/// each with a dark outline so it reads on any background.
/// </summary>
public static class ItemArt
{
    private static Color C(uint hex) => Pixel.Hex(hex);
    private static readonly Color Clear = new(0, 0, 0, 0);
    private static readonly Color Wood = Pixel.Hex(0x7a5530), WoodLight = Pixel.Hex(0x9c7243), WoodDark = Pixel.Hex(0x4f3520);

    public static Pixel Paint(ItemDef d)
    {
        var p = new Pixel(16, 16, "item:" + d.Key);
        p.Clear(Clear);
        var t = d.Tint;
        if (d.Tool != ToolKind.None) { Tool(p, d.Tool, t, d.Key == "silver_blade"); p.Outline(C(0x1a1410)); return p; }
        switch (d.Key)
        {
            case "stick": Handle(p, 3, 13, 12, 4); break;
            case "fiber":
                for (int k = 0; k < 5; k++) p.Line(4 + k * 2, 14, 6 + k, 2 + (k % 3), Pixel.Shade(t, 0.8f + k * 0.08f));
                break;
            case "cord":
                for (int k = 0; k < 4; k++) { p.Disc(8, 8, 6 - k * 1.3f, k % 2 == 0 ? t : Pixel.Shade(t, 0.75f)); }
                p.Disc(8, 8, 1.2f, Clear);
                p.Line(12, 11, 15, 15, t);
                break;
            case "soot":
            case "charcoal":
            case "flint":
                Lump(p, t, d.Key == "flint");
                break;
            case "clay_ball":
                p.Disc(8, 9, 5, t); p.Disc(6.5f, 7.5f, 1.6f, Pixel.Shade(t, 1.2f));
                break;
            case "brick":
                p.Rect(2, 6, 12, 6, t); p.Rect(2, 6, 12, 1, Pixel.Shade(t, 1.25f)); p.Rect(2, 11, 12, 1, Pixel.Shade(t, 0.7f));
                break;
            case "hide":
                for (int y = 2; y < 15; y++) for (int x = 2; x < 14; x++)
                    if (Math.Abs(x - 7.5f) + Math.Abs(y - 8.5f) * 0.8f < 7.5f) p.Set(x, y, Pixel.Shade(t, 0.9f + p.Hash(x, y) * 0.2f));
                p.Disc(5, 6, 1.5f, Pixel.Shade(t, 0.7f));
                break;
            case "feather":
                p.Line(3, 14, 12, 2, C(0xc8c0b0));
                for (int k = 2; k < 11; k++) { p.Line(3 + k, 14 - k * 4 / 3, 1 + k, 11 - k * 4 / 3, t); p.Line(3 + k, 14 - k * 4 / 3, 6 + k, 13 - k * 4 / 3, Pixel.Shade(t, 0.85f)); }
                break;
            case "bone":
                p.Line(4, 12, 11, 5, t); p.Line(5, 12, 12, 5, t);
                p.Disc(3.5f, 12.5f, 1.8f, t); p.Disc(12.5f, 3.5f, 1.8f, t);
                break;
            case "reed":
                p.Line(6, 15, 9, 1, t); p.Line(8, 15, 11, 3, Pixel.Shade(t, 0.8f));
                break;
            case "lumen_shard":
                p.Line(8, 2, 12, 8, C(0xd8fffb)); p.Line(12, 8, 8, 14, t); p.Line(8, 14, 4, 8, Pixel.Shade(t, 0.8f)); p.Line(4, 8, 8, 2, t);
                for (int y = 3; y < 14; y++) for (int x = 5; x < 12; x++) if (Math.Abs(x - 8) + Math.Abs(y - 8) * 0.7f < 4) p.Set(x, y, Pixel.Shade(t, 1.1f));
                p.Set(7, 5, C(0xffffff));
                break;
            case "copper_ingot":
            case "iron_ingot":
            case "silver_ingot":
            case "gold_ingot":
            case "starmetal_ingot":
                Ingot(p, t);
                break;
            case "bowl":
                Bowl(p, t, default);
                break;
            case "spit_gland":
                p.Disc(8, 9, 5, t); p.Disc(6, 7, 1.5f, Pixel.Shade(t, 1.3f)); p.Disc(10, 11, 1, Pixel.Shade(t, 0.6f));
                break;
            case "grain_seeds":
            case "frostleaf_seeds":
                for (int k = 0; k < 7; k++)
                {
                    int x = 3 + (int)(p.Hash(k, 1) * 10), y = 4 + (int)(p.Hash(k, 2) * 9);
                    p.Set(x, y, t); p.Set(x + 1, y, Pixel.Shade(t, 0.75f)); p.Set(x, y + 1, Pixel.Shade(t, 0.8f));
                }
                break;
            case "grain":
                for (int k = 0; k < 3; k++)
                {
                    p.Line(5 + k * 3, 15, 7 + k * 2, 5, C(0xa88a3a));
                    for (int s = 0; s < 4; s++) { p.Set(6 + k * 2 + (s % 2), 5 - s + 3, t); p.Set(8 + k * 2, 6 - s + 3, Pixel.Shade(t, 0.8f)); }
                }
                break;
            case "emberroot":
            case "roasted_emberroot":
                for (int y = 4; y < 15; y++) { int w = Math.Max(1, 4 - (y - 4) / 3); p.Rect(8 - w / 2 - 1, y, w + 1, 1, Pixel.Shade(t, 0.85f + (y % 3) * 0.08f)); }
                if (d.Key == "emberroot") { p.Line(7, 4, 5, 0, C(0x4f8a34)); p.Line(8, 4, 10, 0, C(0x3f7a2a)); }
                break;
            case "frostleaf":
                p.Disc(6, 8, 4, t); p.Disc(10, 7, 4, Pixel.Shade(t, 0.85f)); p.Line(8, 14, 8, 6, C(0x3c6a5a));
                break;
            case "berries":
                foreach (var (x, y) in new[] { (5, 6), (9, 5), (7, 9), (11, 9), (5, 11), (9, 12) })
                {
                    p.Disc(x + 0.5f, y + 0.5f, 2.1f, t); p.Set(x - 1, y - 1, Pixel.Shade(t, 1.5f));
                }
                p.Line(8, 3, 9, 1, C(0x3f7a2a));
                break;
            case "raw_mossback":
            case "raw_brisket":
            case "mossback_steak":
            case "seared_brisket":
                Steak(p, t, d.Key.StartsWith("raw"));
                break;
            case "raw_kit":
            case "roast_kit":
            case "raw_fowl":
            case "roast_fowl":
                Drumstick(p, t, d.Key.StartsWith("raw"));
                break;
            case "hearth_bread":
                for (int y = 6; y < 13; y++) for (int x = 2; x < 14; x++)
                {
                    float dx = (x - 7.5f) / 6f, dy = (y - 10f) / 3.6f;
                    if (dx * dx + dy * dy < 1f) p.Set(x, y, Pixel.Shade(t, 1.05f - (y - 6) * 0.05f));
                }
                for (int k = 0; k < 3; k++) p.Line(5 + k * 3, 7, 6 + k * 3, 9, Pixel.Shade(t, 0.7f));
                break;
            case "berry_tart":
                p.Rect(2, 9, 12, 4, C(0xc9953a)); p.Rect(3, 7, 10, 2, t); p.Rect(2, 9, 12, 1, C(0xe0b050));
                for (int k = 0; k < 4; k++) p.Set(4 + k * 2, 7, Pixel.Shade(t, 1.4f));
                break;
            case "mushroom_stew":
                Bowl(p, C(0x8a643e), C(0x9a6a44)); break;
            case "frostleaf_stew":
                Bowl(p, C(0x8a643e), C(0x6ab0b8)); break;
            case "door":
                p.Rect(4, 1, 8, 14, WoodLight); p.Frame(4, 1, 8, 14, WoodDark);
                p.Rect(5, 2, 3, 4, C(0x8fb8d8)); p.Rect(8, 2, 3, 4, C(0x8fb8d8));
                p.Set(10, 9, C(0xd0d0d8));
                break;
            default:
                p.Disc(8, 8, 5, t); break;
        }
        p.Outline(C(0x1a1410));
        return p;
    }

    private static void Handle(Pixel p, int x0, int y0, int x1, int y1)
    {
        p.Line(x0, y0, x1, y1, Wood);
        p.Line(x0 + 1, y0, x1 + 1, y1, WoodDark);
        p.Line(x0, y0 - 1, x1, y1 - 1, WoodLight);
    }

    private static void Tool(Pixel p, ToolKind kind, Color head, bool silver)
    {
        var hl = Pixel.Shade(head, 1.28f);
        var hd = Pixel.Shade(head, 0.72f);
        switch (kind)
        {
            case ToolKind.Pick:
                Handle(p, 3, 14, 10, 7);
                // A curved head across the top.
                p.Line(3, 5, 7, 2, head); p.Line(7, 2, 10, 2, head); p.Line(10, 2, 13, 5, head);
                p.Line(3, 6, 7, 3, hd); p.Line(10, 3, 13, 6, hd); p.Line(7, 1, 10, 1, hl);
                p.Line(13, 5, 14, 8, head); p.Line(3, 5, 2, 8, head);
                p.Rect(9, 3, 3, 3, hd);
                break;
            case ToolKind.Axe:
                Handle(p, 3, 14, 11, 6);
                for (int y = 2; y < 9; y++) for (int x = 9; x < 15; x++)
                    if ((x - 9) + Math.Abs(y - 5) * 0.8f < 5.5f) p.Set(x, y, x == 14 || y == 2 ? hl : x < 11 ? hd : head);
                break;
            case ToolKind.Shovel:
                Handle(p, 3, 14, 10, 7);
                for (int y = 1; y < 8; y++) for (int x = 8; x < 15; x++)
                {
                    float dx = x - 11.5f, dy = y - 4f;
                    if (dx * dx + dy * dy < 9f) p.Set(x, y, dx + dy < -1 ? hl : dx + dy > 2 ? hd : head);
                }
                break;
            case ToolKind.Hoe:
                Handle(p, 3, 14, 11, 6);
                p.Line(9, 3, 14, 3, head); p.Line(9, 4, 13, 4, hd); p.Line(13, 3, 14, 6, head); p.Set(9, 2, hl);
                break;
            case ToolKind.Blade:
                // Grip, guard, blade from bottom-left to top-right.
                p.Line(2, 14, 4, 12, WoodDark); p.Line(3, 14, 5, 12, Wood);
                p.Line(3, 10, 7, 14, silver ? C(0x6a6a78) : C(0x5a4632)); p.Line(4, 10, 7, 13, C(0x8a7a60));
                for (int k = 0; k < 9; k++)
                {
                    p.Set(6 + k, 10 - k, head);
                    p.Set(7 + k, 10 - k, hd);
                    p.Set(6 + k, 9 - k, hl);
                }
                p.Set(14, 1, hl);
                break;
        }
    }

    private static void Lump(Pixel p, Color t, bool sharp)
    {
        for (int y = 3; y < 14; y++)
            for (int x = 3; x < 14; x++)
            {
                float dx = x - 8f, dy = y - 8.5f;
                float r = sharp ? Math.Abs(dx) + Math.Abs(dy) * 0.8f : MathF.Sqrt(dx * dx + dy * dy);
                if (r < (sharp ? 6f : 5.2f) - p.Hash(x, y) * 0.8f)
                    p.Set(x, y, Pixel.Shade(t, 0.85f + p.Hash(x, y, 2) * 0.5f + (dx + dy < 0 ? 0.25f : 0f)));
            }
    }

    private static void Ingot(Pixel p, Color t)
    {
        for (int y = 5; y < 12; y++)
        {
            int inset = (11 - y) / 2;
            for (int x = 2 + inset; x < 14 - inset; x++)
                p.Set(x, y, y == 5 ? Pixel.Shade(t, 1.3f) : y > 9 ? Pixel.Shade(t, 0.75f) : t);
        }
        p.Line(5, 6, 9, 6, Pixel.Shade(t, 1.45f));
    }

    private static void Bowl(Pixel p, Color wood, Color soup)
    {
        for (int y = 7; y < 14; y++)
            for (int x = 2; x < 14; x++)
            {
                float dx = (x - 7.5f) / 6f, dy = (y - 7f) / 6.5f;
                if (dx * dx + dy * dy < 1f) p.Set(x, y, Pixel.Shade(wood, 1.1f - (y - 7) * 0.05f));
            }
        if (soup.A > 0) { p.Rect(3, 7, 10, 2, soup); p.Set(5, 7, Pixel.Shade(soup, 1.3f)); p.Set(9, 8, Pixel.Shade(soup, 0.8f)); }
        else p.Rect(3, 7, 10, 1, Pixel.Shade(wood, 0.6f));
    }

    private static void Steak(Pixel p, Color t, bool raw)
    {
        for (int y = 3; y < 14; y++)
            for (int x = 2; x < 14; x++)
            {
                float dx = (x - 7.5f) / 6f, dy = (y - 8.5f) / 5f;
                float r = dx * dx + dy * dy;
                if (r < 1f) p.Set(x, y, r > 0.7f ? (raw ? C(0xf0e0d8) : Pixel.Shade(t, 0.7f)) : Pixel.Shade(t, 0.9f + p.Hash(x, y) * 0.2f));
            }
        p.Line(5, 7, 10, 9, raw ? C(0xf5e8e0) : Pixel.Shade(t, 1.25f));
    }

    private static void Drumstick(Pixel p, Color t, bool raw)
    {
        p.Line(3, 13, 7, 9, C(0xefe6d8)); p.Line(4, 13, 8, 9, C(0xd9cdb8));
        p.Disc(2.5f, 13.5f, 1.4f, C(0xefe6d8));
        for (int y = 2; y < 12; y++)
            for (int x = 5; x < 15; x++)
            {
                float dx = x - 10f, dy = y - 6f;
                if (dx * dx + dy * dy < 20f) p.Set(x, y, Pixel.Shade(t, 0.9f + p.Hash(x, y) * 0.2f + (dx + dy < -2 ? 0.2f : 0)));
            }
    }
}
