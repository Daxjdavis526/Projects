using Godot;

namespace Strata;

/// <summary>
/// Pigment blocks: plain coloured blocks for building pictures, the way
/// people build pixel art. Each is one flat colour with a faint mottle (the
/// texture averages exactly to the colour). The palette covers greys,
/// skin and earth tones, and every hue in light, middle and dark. The
/// mosaic beside the launch pad is built from them, and in creative mode they
/// are in the block palette like everything else.
/// </summary>
public static class Pigments
{
    public readonly record struct Pigment(string Key, string Name, int Rgb)
    {
        public Color Color => new(((Rgb >> 16) & 255) / 255f, ((Rgb >> 8) & 255) / 255f, (Rgb & 255) / 255f);
    }

    public static readonly Pigment[] All =
    {
        // Greys, black to white.
        new("black", "Black", 0x1a1a1c), new("charcoal", "Charcoal", 0x2f3033), new("slate", "Slate", 0x4a4c50),
        new("ash", "Ash", 0x66686c), new("pewter", "Pewter", 0x85878a), new("silver", "Silver", 0xa6a8ab),
        new("pale_grey", "Pale Grey", 0xc8c9cb), new("white", "White", 0xebebe8),
        // Skin, hair and earth.
        new("chocolate", "Chocolate", 0x3a2418), new("umber", "Umber", 0x4a2f22), new("walnut", "Walnut", 0x6b4430),
        new("sienna", "Sienna", 0x8c5a3c), new("tan", "Tan", 0xb07a55), new("clay", "Clay", 0xc28f6b),
        new("peach", "Peach", 0xd9a283), new("blush", "Blush", 0xe6b39a), new("cream", "Cream", 0xf0d2bc),
        new("rose", "Rose", 0xc87a72), new("khaki", "Khaki", 0x9c8e6a), new("sand", "Sand", 0xd6c49a),
        new("linen", "Linen", 0xe8dcc0),
        // Yellows and golds.
        new("mustard", "Mustard", 0x8f7426), new("ochre", "Ochre", 0xa8822e), new("gold", "Gold", 0xd4a83a),
        new("straw", "Straw", 0xe3c26a), new("butter", "Butter", 0xf0dc96), new("lemon", "Lemon", 0xf2e04a),
        // Reds and oranges.
        new("maroon", "Maroon", 0x6e1f22), new("crimson", "Crimson", 0xa8302f), new("red", "Red", 0xcf3f35),
        new("coral", "Coral", 0xd9655a), new("rust", "Rust", 0x9c4a20), new("orange", "Orange", 0xe07a2e),
        new("apricot", "Apricot", 0xf0a860),
        // Greens.
        new("forest", "Forest", 0x2f4f2a), new("moss", "Moss", 0x5a7a35), new("leaf", "Leaf", 0x7fae4a),
        new("mint", "Mint", 0xa8d8a0), new("teal", "Teal", 0x2f7a72), new("olive", "Olive", 0x6b6a2e),
        // Blues.
        new("navy", "Navy", 0x1c2a5c), new("denim", "Denim", 0x34508a), new("cobalt", "Cobalt", 0x2c4a9e),
        new("royal", "Royal Blue", 0x3a5cc0), new("azure", "Azure", 0x3d6cc8), new("sky", "Sky", 0x6e9be0),
        new("powder", "Powder", 0xa9c6ee), new("steel", "Steel Blue", 0x4e6e8e), new("dusk_blue", "Dusk Blue", 0x7a8aa6),
        new("ice", "Ice", 0xd2e2f0),
        // Purples and pinks.
        new("plum", "Plum", 0x4f2a52), new("violet", "Violet", 0x7a4a9e), new("lavender", "Lavender", 0xb39ad8),
        new("magenta", "Magenta", 0xb0407e), new("pink", "Pink", 0xe48ab0), new("mauve", "Mauve", 0x9c7a8a),
    };

    /// <summary>The block for each pigment, in the order of <see cref="All"/> (set when the blocks are registered).</summary>
    public static ushort[] Blocks = System.Array.Empty<ushort>();

    public static string TextureName(Pigment p) => "pigment_" + p.Key;
}
