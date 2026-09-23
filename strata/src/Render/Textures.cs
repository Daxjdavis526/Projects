using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// Paints every block texture at startup into one Texture2DArray (a layer per
/// texture, so neighbouring textures cannot bleed into each other the way
/// atlas tiles do at a distance). Nothing is loaded from disk.
/// </summary>
public static class Textures
{
    public const int Size = 16;
    public static Texture2DArray Blocks;
    public static Texture2DArray Cracks;
    public static Image[] Layers;          // level-0 images, for building icons
    public static readonly HashSet<int> CutoutLayers = new();

    private static Color C(uint hex) => Pixel.Hex(hex);

    public static void Build()
    {
        // Which layers are alpha-tested: anything drawn by a see-through block.
        foreach (var b in Strata.Blocks.All)
        {
            bool cut = b.Cutout || b.Render is RenderKind.Cross or RenderKind.Crop or RenderKind.Torch or RenderKind.Ladder or RenderKind.Door;
            if (cut) foreach (var t in b.Tex) CutoutLayers.Add(t);
        }

        int n = Tex.Count;
        Layers = new Image[n];
        var mipped = new Godot.Collections.Array<Image>();
        for (int i = 0; i < n; i++)
        {
            string name = Tex.Names[i];
            var px = new Pixel(Size, Size, name);
            Paint(name, px);
            bool cut = CutoutLayers.Contains(i);
            if (!cut && !IsTintMasked(name))
                for (int k = 0; k < px.P.Length; k++) px.P[k].A = 1f;
            Layers[i] = px.ToImage();
            mipped.Add(px.ToImage(true, cut));
        }
        Blocks = new Texture2DArray();
        Blocks.CreateFromImages(mipped);

        var cracks = new Godot.Collections.Array<Image>();
        for (int s = 0; s < 10; s++)
        {
            var px = new Pixel(Size, Size, "crack");
            PaintCrack(px, s);
            cracks.Add(px.ToImage(true, false));
        }
        Cracks = new Texture2DArray();
        Cracks.CreateFromImages(cracks);
    }

    /// <summary>Opaque textures that use alpha as a tint mask (0 = take the biome colour).</summary>
    private static bool IsTintMasked(string name) => name is "grass_top" or "grass_side";

    // --- palettes ----------------------------------------------------------------------------

    private static readonly Color[] StonePal = { C(0x55565a), C(0x626367), C(0x6d6e72), C(0x797a7e), C(0x85868a), C(0x909195) };
    private static readonly Color[] SlatePal = { C(0x33353d), C(0x3b3e47), C(0x444750), C(0x4d515b), C(0x575b66) };
    private static readonly Color[] DirtPal = { C(0x533826), C(0x5e412c), C(0x694a33), C(0x74533a), C(0x7f5d42) };
    private static readonly Color[] SandPal = { C(0xc2a974), C(0xcbb27d), C(0xd4bb86), C(0xdcc491), C(0xe4cd9c) };
    private static readonly Color[] GrayPal = { new(0.46f, 0.46f, 0.46f), new(0.53f, 0.53f, 0.53f), new(0.6f, 0.6f, 0.6f), new(0.67f, 0.67f, 0.67f), new(0.76f, 0.76f, 0.76f) };
    private static readonly Color[] SnowPal = { C(0xd8e2ee), C(0xe2eaf3), C(0xebf1f8), C(0xf3f7fc), C(0xfbfdff) };
    private static readonly Color[] AshPal = { C(0x3e3a3a), C(0x484343), C(0x524c4b), C(0x5d5655), C(0x686060) };

    private static Color[] Tone(Color c, int n = 5, float spread = 0.22f)
    {
        var p = new Color[n];
        for (int i = 0; i < n; i++) p[i] = Pixel.Shade(c, 1f - spread + 2 * spread * i / (n - 1));
        return p;
    }

    // --- the painter ---------------------------------------------------------------------------

    private static void Paint(string name, Pixel p)
    {
        switch (name)
        {
            case "rootstone":
                p.Noise(new[] { C(0x121015), C(0x1c1920), C(0x27232b), C(0x332e37) }, 0.6f, 1, 2);
                p.Speckle(C(0x4a3f55), 0.05f);
                return;
            case "stone": Stone(p, StonePal, 0); return;
            case "slatestone":
                p.Fill((x, y) => Pixel.Ramp(SlatePal, p.Value(x, y / 3, 4, 2) * 0.4f + p.Value(x * 1, y, 8, 5) * 0.2f + p.Hash(x, y) * 0.4f));
                for (int y = 3; y < 16; y += 5) for (int x = 0; x < 16; x++) if (p.Hash(x, y, 9) < 0.7f) p[x, y + (int)(p.Value(x, 0, 8, 3) * 2)] = C(0x2a2c33);
                return;
            case "cobblestone": Cobble(p, StonePal, 0); return;
            case "mossy_cobblestone":
                Cobble(p, StonePal, 0);
                p.Fill((x, y) =>
                {
                    float m = p.Value(x, y, 4, 40) * 0.7f + p.Hash(x, y, 41) * 0.3f;
                    return m > 0.58f ? Pixel.Ramp(new[] { C(0x3d5a2a), C(0x4a6b31), C(0x587c39) }, p.Hash(x, y, 42)) : p[x, y];
                });
                return;
            case "cobbled_slate": Cobble(p, SlatePal, 5); return;
            case "dirt": Dirt(p); return;
            case "grass_top":
                p.Fill((x, y) => { var c = Pixel.Ramp(GrayPal, 0.1f + p.Value(x, y, 4) * 0.5f + p.Hash(x, y) * 0.35f); c.A = 0f; return c; });
                for (int k = 0; k < 20; k++)
                {
                    int x = (int)(p.Hash(k, 1, 5) * 16), y = (int)(p.Hash(k, 2, 5) * 16);
                    p[x, y] = new Color(0.8f, 0.8f, 0.8f, 0f);
                }
                return;
            case "grass_side":
                Dirt(p);
                for (int x = 0; x < 16; x++)
                {
                    int depth = 4 + (int)(p.Value(x, 0, 2, 7) * 3f) + (p.Hash(x, 0, 8) < 0.35f ? 2 : 0);
                    for (int y = 0; y < depth; y++)
                    {
                        var c = Pixel.Ramp(GrayPal, 0.35f + p.Hash(x, y, 9) * 0.6f - y * 0.05f);
                        c.A = 0f;
                        p[x, y] = c;
                    }
                }
                return;
            case "snow":
                p.Noise(SnowPal, 0.5f, 3);
                p.Speckle(C(0xffffff), 0.04f);
                return;
            case "snow_side":
                Dirt(p);
                for (int x = 0; x < 16; x++)
                {
                    int depth = 3 + (int)(p.Value(x, 0, 2, 11) * 3f);
                    for (int y = 0; y < depth; y++) p[x, y] = Pixel.Ramp(SnowPal, 0.3f + p.Hash(x, y) * 0.7f);
                }
                return;
            case "forest_floor_top": Litter(p); return;
            case "forest_floor_side":
            {
                Dirt(p);
                var top = new Pixel(16, 16, "forest_floor_top");
                Litter(top);
                for (int x = 0; x < 16; x++)
                {
                    int depth = 2 + (int)(p.Value(x, 0, 2, 13) * 3f);
                    for (int y = 0; y < depth; y++) p[x, y] = top[x, y];
                }
                return;
            }
            case "mud":
                p.Noise(new[] { C(0x3a2e24), C(0x42352a), C(0x4a3c30), C(0x534437) }, 0.4f, 4);
                p.Speckle(C(0x62533f), 0.04f);
                p.Speckle(C(0x2c231b), 0.05f, 7);
                return;
            case "sand":
                p.Fill((x, y) => Pixel.Ramp(SandPal, p.Hash(x, y) * 0.6f + p.Value(x, y, 8) * 0.25f + (MathF.Sin((x + y * 0.4f) * 0.8f) * 0.5f + 0.5f) * 0.15f));
                p.Speckle(C(0xa89160), 0.03f, 4);
                return;
            case "cinder":
                p.Noise(new[] { C(0x1d1a19), C(0x262221), C(0x2f2a28), C(0x393331) }, 0.6f, 5, 2);
                p.Speckle(C(0x7a2e18), 0.03f, 6);
                p.Speckle(C(0x4a4442), 0.06f, 8);
                return;
            case "sandstone_side":
                p.Fill((x, y) =>
                {
                    int band = (y + (int)(p.Value(x, 0, 8, 2) * 2)) / 4;
                    var pal = Tone(C(0xcdb07a), 5, 0.12f);
                    var c = Pixel.Ramp(pal, 0.3f + p.Hash(x, y) * 0.35f + (band % 2) * 0.25f);
                    return y % 4 == 3 && p.Hash(x, y, 3) < 0.6f ? Pixel.Shade(c, 0.88f) : c;
                });
                return;
            case "sandstone_top":
                p.Noise(Tone(C(0xd4b986), 5, 0.1f), 0.5f, 6);
                p.Frame(0, 0, 16, 16, C(0xbfa06d));
                return;
            case "gravel":
                p.Fill((x, y) =>
                {
                    var (d1, d2, id) = p.Voronoi(x, y, 5, 3);
                    if (d2 - d1 < 0.9f) return C(0x4d4947);
                    float t = p.Hash(id, 0, 4);
                    var baseC = t < 0.25f ? C(0x8f8781) : t < 0.5f ? C(0x77726e) : t < 0.75f ? C(0x9e9892) : C(0x6a615b);
                    return Pixel.Shade(baseC, 0.9f + p.Hash(x, y) * 0.2f - d1 * 0.05f);
                });
                return;
            case "clay":
                p.Noise(new[] { C(0x8b909b), C(0x9197a3), C(0x989eaa), C(0x9fa5b1) }, 0.3f, 7, 8);
                p.Speckle(C(0x7f8490), 0.03f);
                return;
            case "ice":
                p.Noise(new[] { C(0x9cc4ec), C(0xa6cbef), C(0xb1d2f2), C(0xbcd9f5) }, 0.15f, 8, 8);
                for (int k = 0; k < 3; k++)
                {
                    int x0 = (int)(p.Hash(k, 0, 9) * 16), y0 = (int)(p.Hash(k, 1, 9) * 16);
                    p.Line(x0, y0, x0 + 5, y0 - 5, C(0xe3f0fc));
                }
                return;
            case "ashstone":
                p.Noise(AshPal, 0.55f, 9, 4);
                p.Speckle(C(0x8a7f7a), 0.06f);
                p.Speckle(C(0x2a2626), 0.05f, 11);
                return;

            // --- ores ---------------------------------------------------------------------
            case "soot_ore": Ore(p, new[] { C(0x0f0f10), C(0x19191b), C(0x262628) }, 7); return;
            case "copper_ore": Ore(p, new[] { C(0x8a4a2c), C(0xc07040), C(0xe39a62), C(0x5f9b7c) }, 6); return;
            case "iron_ore": Ore(p, new[] { C(0x8b6a58), C(0xb08c76), C(0xd8b6a0) }, 6); return;
            case "silver_ore": Ore(p, new[] { C(0x9ca3ad), C(0xc9ced6), C(0xf2f5fa) }, 5); return;
            case "gold_ore": Ore(p, new[] { C(0xb58a1c), C(0xe0b538), C(0xfde07a) }, 5); return;
            case "lumen_ore": Crystal(p, StonePal, new[] { C(0x2c9c95), C(0x4fd8cf), C(0xb7fff8) }); return;
            case "starmetal_ore": Crystal(p, SlatePal, new[] { C(0x4b2f9c), C(0x7a5cf0), C(0xd6c8ff) }); return;

            // --- wood -----------------------------------------------------------------------
            case "elm_log": Bark(p, C(0x5e4530), C(0x3f2d1e)); return;
            case "ironwood_log": Bark(p, C(0x3a302c), C(0x221c1a)); return;
            case "pine_log": Bark(p, C(0x5a3a26), C(0x3a2416), true); return;
            case "willow_log": Bark(p, C(0x5f5a45), C(0x3f3b2c)); return;
            case "elm_log_top": Rings(p, C(0xb58f5e), C(0x5e4530)); return;
            case "ironwood_log_top": Rings(p, C(0x7a5a45), C(0x3a302c)); return;
            case "pine_log_top": Rings(p, C(0xc49a66), C(0x5a3a26)); return;
            case "willow_log_top": Rings(p, C(0xbfae82), C(0x5f5a45)); return;
            case "elm_planks": Planks(p, C(0xb08a5a)); return;
            case "ironwood_planks": Planks(p, C(0x6b4d3c)); return;
            case "pine_planks": Planks(p, C(0xa87650)); return;
            case "willow_planks": Planks(p, C(0xb3a47a)); return;

            // --- foliage --------------------------------------------------------------------
            case "elm_leaves": Leaves(p, GrayPal, 0.18f); return;
            case "ironwood_leaves": Leaves(p, Tone(new Color(0.6f, 0.6f, 0.6f), 5, 0.25f), 0.14f); return;
            case "pine_leaves": Needles(p); return;
            case "willow_leaves": Leaves(p, Tone(new Color(0.78f, 0.8f, 0.72f), 5, 0.2f), 0.26f); return;
            case "ember_leaves": Leaves(p, new[] { C(0x8c2f14), C(0xb3431a), C(0xd4611f), C(0xe88a2e), C(0xf4b04a) }, 0.2f); return;
            case "dry_leaves": Leaves(p, new[] { C(0x6b5536), C(0x7f6641), C(0x94784d), C(0xa88b5c) }, 0.3f); return;
            case "elm_sapling": Sapling(p, C(0x4f3a26), new Color(0.35f, 0.62f, 0.25f)); return;
            case "ironwood_sapling": Sapling(p, C(0x33292a), new Color(0.2f, 0.45f, 0.22f)); return;
            case "pine_sapling": Sapling(p, C(0x4a3020), new Color(0.2f, 0.4f, 0.3f)); return;
            case "willow_sapling": Sapling(p, C(0x5a5440), new Color(0.45f, 0.62f, 0.3f)); return;
            case "tall_grass": Blades(p, GrayPal, 9, false); return;
            case "fern": Fern(p); return;
            case "dead_bush": Twigs(p, C(0x7a5a38)); return;
            case "emberbloom": Flower(p, new[] { C(0xa81e12), C(0xe0431f), C(0xff7a3a) }, C(0x2b1a10), 0); return;
            case "sunpetal": Flower(p, new[] { C(0xd9a515), C(0xf5cf33), C(0xfff08a) }, C(0x7a4a14), 1); return;
            case "frostbell": Flower(p, new[] { C(0x3561c7), C(0x5f8ff0), C(0xa9c9ff) }, C(0xe8f2ff), 2); return;
            case "moonlace": Flower(p, new[] { C(0xc8c8d8), C(0xe6e6f0), C(0xffffff) }, C(0xc9b25a), 3); return;
            case "reeds": Reeds(p); return;
            case "berry_bush": Bush(p, true); return;
            case "berry_bush_bare": Bush(p, false); return;
            case "blushcap": Mushroom(p, new[] { C(0x8f1d1d), C(0xc23434), C(0xe86060) }, true); return;
            case "umbercap": Mushroom(p, new[] { C(0x5a3b22), C(0x7d5534), C(0xa0744a) }, false); return;
            case "glowcap": Mushroom(p, new[] { C(0x2aa39a), C(0x5de6db), C(0xc8fff9) }, true); return;
            case "spinecactus_side":
                p.Fill((x, y) =>
                {
                    int rib = x % 4;
                    var c = rib == 0 ? C(0x2f5d2a) : rib == 2 ? C(0x4f8a3f) : C(0x417634);
                    return Pixel.Shade(c, 0.94f + p.Hash(x, y) * 0.12f);
                });
                for (int y = 1; y < 16; y += 3) for (int x = 2; x < 16; x += 4) p[x + (y / 3) % 2 - 1, y] = C(0xe8e0b0);
                return;
            case "spinecactus_top":
                p.Clear(C(0x4f8a3f));
                p.Frame(1, 1, 14, 14, C(0x3a6c31));
                p.Disc(8, 8, 3, C(0x5c9a4a));
                p.Speckle(C(0xe8e0b0), 0.05f);
                return;

            // --- liquids ---------------------------------------------------------------------
            case "water":
                p.Fill((x, y) =>
                {
                    float t = p.Value(x, y, 8, 1) * 0.6f + p.Value(x, y, 4, 2) * 0.4f;
                    var c = Pixel.Mix(C(0x2a5ea8), C(0x4a86cf), t);
                    return (MathF.Sin((x + y * 0.5f) * 1.2f + t * 6f) > 0.85f) ? Pixel.Mix(c, C(0x9fc6f0), 0.5f) : c;
                });
                return;
            case "lava":
                p.Fill((x, y) =>
                {
                    float t = p.Value(x, y, 4, 3) * 0.7f + p.Hash(x, y) * 0.3f;
                    return t < 0.35f ? C(0x9c2a0c) : t < 0.55f ? C(0xd94a12) : t < 0.8f ? C(0xf5851f) : C(0xffd060);
                });
                return;

            // --- masonry and building --------------------------------------------------------
            case "stone_bricks": Bricks(p, StonePal, C(0x45464a), 8, 8); return;
            case "carved_stone":
                Stone(p, StonePal, 7);
                p.Frame(0, 0, 16, 16, C(0x4a4b4f));
                p.Frame(2, 2, 12, 12, C(0x5a5b5f));
                for (int k = 0; k < 4; k++) { p.Line(8, 4 + k, 4 + k, 8, C(0x9a9b9f)); p.Line(8, 12 - k, 12 - k, 8, C(0x505155)); }
                p.Set(7, 7, C(0xb0b1b5)); p.Set(8, 8, C(0xb0b1b5));
                return;
            case "clay_bricks": Bricks(p, Tone(C(0x9e4a36), 5, 0.14f), C(0xc9b8a4), 4, 8); return;
            case "ash_bricks": Bricks(p, AshPal, C(0x2a2626), 4, 8); return;
            case "dressed_sandstone":
                p.Noise(Tone(C(0xd6bd8a), 5, 0.08f), 0.4f, 12, 8);
                p.Frame(0, 0, 16, 16, C(0xb8986a));
                p.Frame(1, 1, 14, 14, C(0xe4d2a6));
                for (int x = 3; x < 13; x++) { p.Set(x, 7, C(0xb8986a)); p.Set(x, 8, C(0xe4d2a6)); }
                return;
            case "slate_tiles":
                p.Fill((x, y) =>
                {
                    int tx = x / 8, ty = y / 8;
                    var c = Pixel.Ramp(SlatePal, 0.3f + p.Hash(tx, ty, 3) * 0.5f + p.Hash(x, y) * 0.2f);
                    if (x % 8 == 0 || y % 8 == 0) return C(0x25272d);
                    if (x % 8 == 1 || y % 8 == 1) return Pixel.Shade(c, 1.15f);
                    return c;
                });
                return;
            case "glass":
                p.Clear(new Color(0, 0, 0, 0));
                p.Frame(0, 0, 16, 16, new Color(0.85f, 0.92f, 0.96f));
                for (int k = 0; k < 3; k++) p.Set(3 + k, 5 - k, new Color(1, 1, 1));
                for (int k = 0; k < 2; k++) p.Set(10 + k, 12 - k, new Color(0.95f, 0.98f, 1f));
                return;
            case "thatch_side":
                p.Fill((x, y) =>
                {
                    var c = Pixel.Ramp(Tone(C(0xc4a24c), 5, 0.18f), p.Hash(x, y / 2) * 0.7f + p.Value(x, y, 4) * 0.3f);
                    return (y % 5 == 4) ? Pixel.Shade(c, 0.72f) : c;
                });
                return;
            case "thatch_top":
                p.Fill((x, y) => Pixel.Ramp(Tone(C(0xc9a753), 5, 0.2f), p.Hash(x / 2, y, 2) * 0.7f + p.Hash(x, y) * 0.3f));
                return;
            case "copper_block": MetalBlock(p, Tone(C(0xc27a4a), 5, 0.18f), C(0x5f9b7c)); return;
            case "iron_block": MetalBlock(p, Tone(C(0xc4c6cc), 5, 0.12f), default); return;
            case "silver_block": MetalBlock(p, Tone(C(0xe2e6ee), 5, 0.1f), default); return;
            case "gold_block": MetalBlock(p, Tone(C(0xf0c440), 5, 0.14f), default); return;
            case "starmetal_block":
                MetalBlock(p, Tone(C(0x6d52d8), 5, 0.2f), default);
                for (int k = 0; k < 6; k++) { int x = (int)(p.Hash(k, 1, 30) * 14) + 1, y = (int)(p.Hash(k, 2, 30) * 14) + 1; p.Set(x, y, C(0xf0eaff)); }
                return;
            case "lumen_block":
                p.Fill((x, y) =>
                {
                    var (d1, d2, id) = p.Voronoi(x, y, 3, 8);
                    var c = Pixel.Mix(C(0x4fd8cf), C(0xd8fffb), p.Hash(id, 1, 2) * 0.6f);
                    return d2 - d1 < 0.8f ? C(0x2c9c95) : Pixel.Shade(c, 1.05f - d1 * 0.05f);
                });
                return;
            case "lumen_lamp":
                p.Clear(C(0xe7c56a));
                p.Frame(0, 0, 16, 16, C(0x8a6a2a));
                p.Frame(1, 1, 14, 14, C(0xc9a24a));
                p.Rect(3, 3, 10, 10, C(0xbffcf6));
                p.Rect(5, 5, 6, 6, C(0xf2fffd));
                p.Line(3, 8, 12, 8, C(0x8a6a2a)); p.Line(8, 3, 8, 12, C(0x8a6a2a));
                return;

            // --- stations --------------------------------------------------------------------
            case "worktable_top":
                Planks(p, C(0xb08a5a));
                p.Frame(0, 0, 16, 16, C(0x5e4530));
                for (int k = 3; k < 16; k += 4) { p.Line(k, 1, k, 14, C(0x8a6a42)); }
                p.Rect(2, 2, 4, 2, C(0x8c8e94));
                return;
            case "worktable_side":
                Planks(p, C(0xa07c50));
                p.Rect(0, 0, 16, 3, C(0x6b4d33));
                p.Line(3, 5, 3, 12, C(0x3f2d1e)); p.Rect(2, 5, 3, 2, C(0x9a9ca2));     // hammer
                p.Line(9, 5, 13, 11, C(0x3f2d1e)); p.Line(10, 5, 14, 11, C(0xb8bac0)); // saw
                return;
            case "furnace_side": Cobble(p, StonePal, 21); return;
            case "furnace_top":
                Stone(p, StonePal, 22);
                p.Frame(0, 0, 16, 16, C(0x4a4b4f));
                return;
            case "furnace_front":
            case "furnace_front_lit":
            {
                Cobble(p, StonePal, 21);
                p.Rect(3, 7, 10, 7, C(0x1a1718));
                p.Frame(2, 6, 12, 9, C(0x3b3c40));
                p.Rect(3, 2, 10, 3, C(0x5a5b5f));
                if (name == "furnace_front_lit")
                {
                    for (int x = 4; x < 12; x++)
                    {
                        int h = 2 + (int)(p.Hash(x, 0, 3) * 4);
                        for (int y = 0; y < h; y++) p.Set(x, 13 - y, y < 1 ? C(0xfff0a0) : y < 3 ? C(0xffa030) : C(0xd9401a));
                    }
                }
                return;
            }
            case "crate_side":
                Planks(p, C(0x9c7648));
                p.Frame(0, 0, 16, 16, C(0x5e4530));
                p.Frame(1, 1, 14, 14, C(0x7a5a38));
                p.Line(2, 2, 13, 13, C(0x6b4d33)); p.Line(2, 3, 12, 13, C(0x6b4d33));
                return;
            case "crate_top":
                Planks(p, C(0xa27c4c));
                p.Frame(0, 0, 16, 16, C(0x5e4530));
                p.Frame(1, 1, 14, 14, C(0x7a5a38));
                return;
            case "bedroll_top":
                p.Noise(Tone(C(0xa3342c), 5, 0.12f), 0.3f, 3, 8);
                p.Rect(0, 0, 16, 5, C(0xe8e0d0));
                p.Frame(0, 0, 16, 16, C(0x6d1f1a));
                for (int x = 1; x < 15; x += 2) p.Set(x, 8, C(0xd9a09a));
                return;
            case "bedroll_side":
                p.Clear(new Color(0, 0, 0, 0));
                p.Rect(0, 11, 16, 5, C(0xa3342c));
                p.Rect(0, 11, 16, 1, C(0xc75048));
                return;
            case "tilled_soil":
                Dirt(p);
                for (int y = 0; y < 16; y++)
                    for (int x = 0; x < 16; x++)
                        if (y % 4 == 0) p[x, y] = Pixel.Shade(p[x, y], 0.6f);
                        else if (y % 4 == 1) p[x, y] = Pixel.Shade(p[x, y], 1.12f);
                return;
            case "torch":
                p.Clear(new Color(0, 0, 0, 0));
                p.Rect(7, 6, 2, 10, C(0x6b4a2c));
                p.Rect(7, 6, 1, 10, C(0x8a643e));
                p.Rect(6, 3, 4, 4, C(0xffb030));
                p.Rect(7, 2, 2, 5, C(0xffe070));
                p.Set(7, 1, C(0xfff4c0));
                return;
            case "ladder":
                p.Clear(new Color(0, 0, 0, 0));
                p.Rect(2, 0, 2, 16, C(0x7a5a38)); p.Rect(12, 0, 2, 16, C(0x7a5a38));
                p.Rect(2, 0, 1, 16, C(0x9a7648)); p.Rect(12, 0, 1, 16, C(0x9a7648));
                for (int y = 2; y < 16; y += 4) { p.Rect(2, y, 12, 2, C(0x8a6840)); p.Rect(2, y, 12, 1, C(0xa88256)); }
                return;
            case "door_upper":
            case "door_lower":
            {
                Planks(p, C(0x9c7648), vertical: true);
                p.Frame(0, 0, 16, 16, C(0x5e4530));
                if (name == "door_upper")
                {
                    p.Rect(3, 3, 4, 5, new Color(0, 0, 0, 0)); p.Rect(9, 3, 4, 5, new Color(0, 0, 0, 0));
                    p.Frame(2, 2, 12, 7, C(0x5e4530)); p.Line(8, 2, 8, 8, C(0x5e4530));
                }
                else
                {
                    p.Rect(11, 1, 2, 2, C(0xc9c9cf)); p.Set(11, 1, C(0xf0f0f4));
                    p.Frame(2, 5, 12, 9, C(0x7a5a38));
                }
                return;
            }
        }

        // Crops by stage.
        if (name.StartsWith("grain_")) { Crop(p, name[^1] - '0', 0); return; }
        if (name.StartsWith("emberroot_")) { Crop(p, name[^1] - '0', 1); return; }
        if (name.StartsWith("frostleaf_")) { Crop(p, name[^1] - '0', 2); return; }

        // Something was registered without a painting: make it loud.
        p.Fill((x, y) => ((x / 4 + y / 4) & 1) == 0 ? new Color(1, 0, 1) : new Color(0, 0, 0));
        GD.PushWarning("no painter for texture " + name);
    }

    // --- recipes --------------------------------------------------------------------------------

    private static void Stone(Pixel p, Color[] pal, int k)
    {
        p.Fill((x, y) => Pixel.Ramp(pal, p.Value(x, y, 8, k) * 0.35f + p.Value(x, y, 4, k + 1) * 0.3f + p.Hash(x, y, k) * 0.35f));
        // Faint fracture lines.
        for (int n = 0; n < 2; n++)
        {
            int x = (int)(p.Hash(n, 5, k) * 16), y = (int)(p.Hash(n, 6, k) * 16);
            for (int s = 0; s < 5; s++)
            {
                p[x, y] = Pixel.Shade(p[x, y], 0.82f);
                x += p.Hash(s, n, k + 3) < 0.5f ? 1 : 0;
                y += 1;
            }
        }
    }

    private static void Cobble(Pixel p, Color[] pal, int k)
    {
        p.Fill((x, y) =>
        {
            var (d1, d2, id) = p.Voronoi(x, y, 4, k);
            if (d2 - d1 < 0.75f) return Pixel.Shade(pal[0], 0.7f);
            float t = 0.25f + p.Hash(id, 0, k + 1) * 0.55f + p.Hash(x, y, k) * 0.2f - d1 * 0.03f;
            var c = Pixel.Ramp(pal, t);
            return d2 - d1 < 1.4f ? Pixel.Shade(c, 0.88f) : c;
        });
    }

    private static void Dirt(Pixel p)
    {
        p.Fill((x, y) => Pixel.Ramp(DirtPal, p.Value(x, y, 4, 20) * 0.4f + p.Hash(x, y, 20) * 0.6f));
        for (int k = 0; k < 5; k++)
        {
            int x = (int)(p.Hash(k, 0, 21) * 16), y = (int)(p.Hash(k, 1, 21) * 16);
            p[x, y] = C(0x8e7a66);
            p[x + 1, y] = C(0x6d5b4a);
        }
    }

    private static void Litter(Pixel p)
    {
        p.Fill((x, y) => Pixel.Ramp(new[] { C(0x3d2a1a), C(0x4a3320), C(0x573d26) }, p.Hash(x, y, 30)));
        var leafCols = new[] { C(0x7a5a24), C(0x8f6a2a), C(0x5c6a2a), C(0xa0602a), C(0x6a4a20) };
        for (int k = 0; k < 26; k++)
        {
            int x = (int)(p.Hash(k, 0, 31) * 16), y = (int)(p.Hash(k, 1, 31) * 16);
            var c = leafCols[(int)(p.Hash(k, 2, 31) * leafCols.Length)];
            p[x, y] = c; p[x + 1, y] = Pixel.Shade(c, 0.85f);
            if (p.Hash(k, 3, 31) < 0.5f) p[x, y + 1] = Pixel.Shade(c, 0.9f);
        }
        for (int k = 0; k < 2; k++)
        {
            int x = (int)(p.Hash(k, 5, 32) * 16), y = (int)(p.Hash(k, 6, 32) * 16);
            for (int s = 0; s < 4; s++) p[x + s, y + s / 2] = C(0x5a4028);
        }
    }

    private static void Ore(Pixel p, Color[] ore, int clusters)
    {
        Stone(p, StonePal, 40);
        for (int c = 0; c < clusters; c++)
        {
            int cx = (int)(p.Hash(c, 0, 41) * 13) + 1, cy = (int)(p.Hash(c, 1, 41) * 13) + 1;
            int n = 2 + (int)(p.Hash(c, 2, 41) * 3);
            for (int k = 0; k < n; k++)
            {
                int x = cx + (int)(p.Hash(c, k, 42) * 3) - 1, y = cy + (int)(p.Hash(c, k, 43) * 3) - 1;
                p[x, y] = ore[Math.Min(ore.Length - 1, 1 + (int)(p.Hash(x, y, 44) * (ore.Length - 1)))];
                p[x + 1, y + 1] = Pixel.Shade(ore[0], 0.9f);
            }
            p[cx, cy] = ore[^1];
        }
    }

    private static void Crystal(Pixel p, Color[] basePal, Color[] cry)
    {
        p.Fill((x, y) => Pixel.Ramp(basePal, p.Value(x, y, 4, 50) * 0.5f + p.Hash(x, y, 50) * 0.5f));
        for (int c = 0; c < 4; c++)
        {
            int cx = (int)(p.Hash(c, 0, 51) * 12) + 2, cy = (int)(p.Hash(c, 1, 51) * 12) + 2;
            int len = 3 + (int)(p.Hash(c, 2, 51) * 3);
            int dir = p.Hash(c, 3, 51) < 0.5f ? 1 : -1;
            for (int s = 0; s < len; s++)
            {
                p[cx + s * dir, cy - s] = cry[1];
                p[cx + s * dir + 1, cy - s] = cry[0];
                if (s == len - 1) p[cx + s * dir, cy - s] = cry[2];
            }
        }
    }

    private static void Bark(Pixel p, Color light, Color dark, bool plates = false)
    {
        var pal = new[] { dark, Pixel.Mix(dark, light, 0.4f), Pixel.Mix(dark, light, 0.7f), light };
        p.Fill((x, y) =>
        {
            float stripe = p.Value(x * 4, y, 8, 60);
            float t = p.Hash(x, y / 3, 61) * 0.5f + stripe * 0.5f;
            if (plates && (y + (x / 4) * 3) % 6 == 0) t *= 0.5f;
            if (x % 4 == (int)(p.Hash(0, y / 4, 62) * 4)) t *= 0.6f;
            return Pixel.Ramp(pal, t);
        });
    }

    private static void Rings(Pixel p, Color wood, Color bark)
    {
        p.Fill((x, y) =>
        {
            float dx = x - 7.5f, dy = y - 7.5f;
            float d = MathF.Sqrt(dx * dx + dy * dy) + p.Hash(x, y) * 0.6f;
            if (x == 0 || y == 0 || x == 15 || y == 15) return bark;
            int ring = (int)(d * 0.9f);
            return ring % 2 == 0 ? wood : Pixel.Shade(wood, 0.84f);
        });
    }

    private static void Planks(Pixel p, Color wood, bool vertical = false)
    {
        var pal = Tone(wood, 5, 0.12f);
        p.Fill((x, y) =>
        {
            int u = vertical ? y : x, v = vertical ? x : y;
            int board = v / 4;
            float grain = p.Value(u, board * 7 + v, 4, 70 + board) * 0.6f + p.Hash(u / 3, v, 71) * 0.4f;
            var c = Pixel.Ramp(pal, 0.2f + grain * 0.6f + (board % 2) * 0.1f);
            if (v % 4 == 3) return Pixel.Shade(c, 0.7f);
            int seam = (board * 5 + 3) % 16;
            if (u == seam) return Pixel.Shade(c, 0.78f);
            return c;
        });
    }

    private static void Bricks(Pixel p, Color[] pal, Color mortar, int rowH, int brickW)
    {
        p.Fill((x, y) =>
        {
            int row = y / rowH;
            int off = (row % 2) * (brickW / 2);
            int bx = (x + off) / brickW;
            if (y % rowH == rowH - 1 || (x + off) % brickW == 0) return mortar;
            float t = 0.3f + p.Hash(bx, row, 80) * 0.4f + p.Hash(x, y, 81) * 0.3f;
            var c = Pixel.Ramp(pal, t);
            if (y % rowH == 0) c = Pixel.Shade(c, 1.1f);
            return c;
        });
    }

    private static void MetalBlock(Pixel p, Color[] pal, Color patina)
    {
        p.Fill((x, y) => Pixel.Ramp(pal, 0.35f + p.Value(x, y, 8, 90) * 0.35f + p.Hash(x, y, 90) * 0.15f + (15 - x - y) * 0.008f));
        p.Frame(0, 0, 16, 16, pal[0]);
        p.Frame(1, 1, 14, 14, pal[^1]);
        foreach (var (rx, ry) in new[] { (2, 2), (13, 2), (2, 13), (13, 13) }) { p.Set(rx, ry, pal[^1]); p.Set(rx + 1, ry + 1, pal[0]); }
        if (patina.A > 0f)
            for (int y = 0; y < 16; y++)
                for (int x = 0; x < 16; x++)
                    if (p.Value(x, y, 4, 91) > 0.72f) p[x, y] = Pixel.Shade(patina, 0.9f + p.Hash(x, y) * 0.2f);
    }

    private static void Leaves(Pixel p, Color[] pal, float holes)
    {
        p.Fill((x, y) =>
        {
            float clump = p.Value(x, y, 4, 100);
            float h = p.Hash(x, y, 101);
            if (h < holes && clump < 0.6f) return new Color(0, 0, 0, 0);
            var c = Pixel.Ramp(pal, clump * 0.55f + p.Hash(x, y, 102) * 0.45f);
            return c;
        });
        // Dark hearts give the clumps depth.
        for (int y = 0; y < 16; y++)
            for (int x = 0; x < 16; x++)
                if (p[x, y].A > 0 && p.Value(x, y, 4, 100) < 0.28f) p[x, y] = Pixel.Shade(p[x, y], 0.78f);
    }

    private static void Needles(Pixel p)
    {
        var pal = Tone(new Color(0.55f, 0.6f, 0.58f), 5, 0.25f);
        p.Clear(new Color(0, 0, 0, 0));
        for (int y = 0; y < 16; y++)
            for (int x = 0; x < 16; x++)
            {
                bool needle = ((x + y) % 3 == 0 && p.Hash(x, y, 110) < 0.85f) || ((x - y + 32) % 4 == 0 && p.Hash(x, y, 111) < 0.7f);
                if (needle || p.Hash(x, y, 112) < 0.68f) p[x, y] = Pixel.Ramp(pal, p.Hash(x, y, 113) * 0.8f + p.Value(x, y, 4, 114) * 0.2f);
            }
    }

    private static void Sapling(Pixel p, Color stem, Color leaf)
    {
        p.Clear(new Color(0, 0, 0, 0));
        p.Line(8, 15, 8, 7, stem);
        p.Line(7, 11, 5, 9, stem);
        p.Line(9, 10, 11, 8, stem);
        foreach (var (cx, cy, r) in new[] { (8f, 5f, 3f), (5f, 8f, 2.2f), (11.5f, 7f, 2.2f) })
            for (int y = 0; y < 16; y++)
                for (int x = 0; x < 16; x++)
                {
                    float dx = x + 0.5f - cx, dy = y + 0.5f - cy;
                    if (dx * dx + dy * dy <= r * r && p.Hash(x, y, 120) < 0.85f)
                        p[x, y] = Pixel.Shade(leaf, 0.8f + p.Hash(x, y, 121) * 0.4f);
                }
    }

    private static void Blades(Pixel p, Color[] pal, int count, bool tall)
    {
        p.Clear(new Color(0, 0, 0, 0));
        for (int b = 0; b < count; b++)
        {
            int x = 1 + (int)(p.Hash(b, 0, 130) * 14);
            int h = 6 + (int)(p.Hash(b, 1, 130) * 9);
            float lean = (p.Hash(b, 2, 130) - 0.5f) * 0.5f;
            for (int s = 0; s < h; s++)
            {
                int xx = x + (int)(lean * s);
                p.Set(xx, 15 - s, Pixel.Ramp(pal, 0.2f + 0.8f * s / h));
            }
        }
    }

    private static void Fern(Pixel p)
    {
        p.Clear(new Color(0, 0, 0, 0));
        var pal = GrayPal;
        for (int f = 0; f < 3; f++)
        {
            float a = -0.6f + f * 0.6f;
            float x = 8, y = 15;
            for (int s = 0; s < 12; s++)
            {
                x += MathF.Sin(a) * 0.9f; y -= MathF.Cos(a) * 0.9f;
                a += (f - 1) * 0.06f;
                p.Set((int)x, (int)y, Pixel.Ramp(pal, 0.3f + s * 0.05f));
                if (s > 2 && s % 2 == 0)
                {
                    p.Set((int)x - 1, (int)y, Pixel.Ramp(pal, 0.6f));
                    p.Set((int)x + 1, (int)y, Pixel.Ramp(pal, 0.7f));
                }
            }
        }
    }

    private static void Twigs(Pixel p, Color c)
    {
        p.Clear(new Color(0, 0, 0, 0));
        p.Line(8, 15, 8, 9, c);
        p.Line(8, 11, 4, 6, c);
        p.Line(8, 10, 12, 5, c);
        p.Line(5, 7, 3, 7, c);
        p.Line(11, 6, 13, 7, Pixel.Shade(c, 0.8f));
        p.Line(8, 9, 7, 4, Pixel.Shade(c, 1.15f));
    }

    private static void Flower(Pixel p, Color[] petal, Color center, int style)
    {
        p.Clear(new Color(0, 0, 0, 0));
        var stem = C(0x3f7a2e);
        p.Line(8, 15, 8, 7, stem);
        p.Set(7, 11, stem); p.Set(6, 10, stem); p.Set(9, 12, stem); p.Set(10, 11, stem);
        switch (style)
        {
            case 0: // emberbloom: flared cup
                p.Rect(6, 4, 5, 3, petal[1]); p.Set(5, 3, petal[2]); p.Set(11, 3, petal[2]); p.Set(8, 2, petal[2]);
                p.Set(7, 3, petal[0]); p.Set(9, 3, petal[0]); p.Set(8, 5, center);
                break;
            case 1: // sunpetal: daisy
                foreach (var (dx, dy) in new[] { (0, -2), (2, 0), (0, 2), (-2, 0), (1, -1), (1, 1), (-1, 1), (-1, -1) })
                    p.Set(8 + dx, 5 + dy, dx == 0 || dy == 0 ? petal[2] : petal[1]);
                p.Set(8, 5, center);
                break;
            case 2: // frostbell: drooping bells
                p.Line(8, 7, 11, 5, stem);
                p.Rect(10, 6, 3, 3, petal[1]); p.Set(11, 9, petal[2]); p.Set(10, 8, petal[0]);
                p.Rect(5, 5, 3, 3, petal[1]); p.Set(6, 8, petal[2]); p.Line(8, 7, 6, 5, stem);
                break;
            default: // moonlace: lacy umbel
                for (int k = 0; k < 9; k++)
                {
                    int x = 5 + (int)(p.Hash(k, 0, 140) * 7), y = 2 + (int)(p.Hash(k, 1, 140) * 4);
                    p.Set(x, y, petal[k % 3]);
                    p.Line(8, 7, x, y, Pixel.Shade(stem, 1.1f));
                    p.Set(x, y, petal[2]);
                }
                p.Set(8, 5, center);
                break;
        }
    }

    private static void Reeds(Pixel p)
    {
        p.Clear(new Color(0, 0, 0, 0));
        for (int b = 0; b < 4; b++)
        {
            int x = 2 + b * 4 - (b % 2);
            var c = b % 2 == 0 ? C(0x6f8a3c) : C(0x8a9a4a);
            p.Line(x, 15, x, 0, c);
            p.Set(x + 1, 6 + b * 2, Pixel.Shade(c, 1.2f));
        }
    }

    private static void Bush(Pixel p, bool berries)
    {
        p.Clear(new Color(0, 0, 0, 0));
        var pal = new[] { C(0x2f5a26), C(0x3b6c2e), C(0x4a7f38), C(0x5a9142) };
        for (int y = 3; y < 16; y++)
            for (int x = 1; x < 15; x++)
            {
                float dx = x - 7.5f, dy = (y - 9.5f) * 1.2f;
                if (dx * dx + dy * dy > 42 || p.Hash(x, y, 150) < 0.15f) continue;
                p[x, y] = Pixel.Ramp(pal, p.Hash(x, y, 151) * 0.7f + p.Value(x, y, 4, 152) * 0.3f);
            }
        p.Line(7, 15, 7, 11, C(0x4a3520));
        if (berries)
            for (int k = 0; k < 9; k++)
            {
                int x = 2 + (int)(p.Hash(k, 0, 153) * 11), y = 5 + (int)(p.Hash(k, 1, 153) * 8);
                if (p[x, y].A < 0.5f) continue;
                p[x, y] = C(0x4a1a5a); p[x + 1, y] = C(0x7a2e8c); p[x, y - 1] = C(0xb46ac8);
            }
    }

    private static void Mushroom(Pixel p, Color[] cap, bool spots)
    {
        p.Clear(new Color(0, 0, 0, 0));
        p.Rect(7, 9, 2, 7, C(0xe6dcc8));
        p.Rect(7, 9, 1, 7, C(0xf4ecdc));
        for (int y = 3; y < 10; y++)
            for (int x = 2; x < 14; x++)
            {
                float dx = x - 7.5f, dy = (y - 9f) * 1.6f;
                if (dx * dx + dy * dy > 32 || y > 8) continue;
                p[x, y] = Pixel.Ramp(cap, 0.2f + (9 - y) * 0.05f + p.Hash(x, y, 160) * 0.4f);
            }
        for (int x = 3; x < 13; x++) p.Set(x, 8, Pixel.Shade(cap[0], 0.8f));
        if (spots)
            foreach (var (sx, sy) in new[] { (5, 5), (9, 4), (11, 6), (7, 7) })
                p.Set(sx, sy, new Color(1, 0.98f, 0.95f));
    }

    private static void Crop(Pixel p, int stage, int kind)
    {
        p.Clear(new Color(0, 0, 0, 0));
        int h = 4 + stage * 4;
        var leaf = kind == 2 ? C(0x5a9a8a) : C(0x4f8a34);
        for (int b = 0; b < 5; b++)
        {
            int x = 1 + b * 3 + (b % 2);
            int bh = h - (int)(p.Hash(b, stage, 170) * 3);
            for (int s = 0; s < bh; s++) p.Set(x, 15 - s, Pixel.Shade(leaf, 0.8f + 0.3f * s / Math.Max(1, bh)));
            if (stage >= 1 && kind != 0) { p.Set(x - 1, 15 - bh + 2, leaf); p.Set(x + 1, 15 - bh + 3, leaf); }
            if (stage == 3)
            {
                if (kind == 0) // goldgrain heads
                {
                    for (int s = 0; s < 4; s++) p.Set(x + (s % 2), 15 - bh - s + 2, s % 2 == 0 ? C(0xe0b840) : C(0xc8962a));
                    for (int s = 0; s < bh; s++) p.Set(x, 15 - s, Pixel.Mix(p[x, 15 - s], C(0xc9a040), 0.6f));
                }
                else if (kind == 1) // emberroot shoulders show at the soil line
                {
                    p.Set(x, 14, C(0xd9481a)); p.Set(x + 1, 15, C(0xb3381a)); p.Set(x, 15, C(0xe8622a));
                }
                else // frostleaf heads
                {
                    p.Rect(x - 1, 15 - bh, 3, 3, C(0x9fd6e8)); p.Set(x, 15 - bh, C(0xd8f4ff));
                }
            }
        }
    }

    private static void PaintCrack(Pixel p, int stage)
    {
        p.Clear(new Color(0, 0, 0, 0));
        var dark = new Color(0.05f, 0.05f, 0.05f, 0.85f);
        int strokes = 2 + stage * 2;
        for (int s = 0; s < strokes; s++)
        {
            float x = 8, y = 8;
            float a = p.Hash(s, 0, 180) * MathF.Tau;
            int len = 2 + (int)(stage * 0.9f) + (int)(p.Hash(s, 1, 180) * 3);
            for (int k = 0; k < len; k++)
            {
                x += MathF.Cos(a); y += MathF.Sin(a);
                a += (p.Hash(s, k, 181) - 0.5f) * 1.2f;
                p.Set((int)x, (int)y, dark);
            }
        }
    }
}
