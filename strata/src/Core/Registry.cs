namespace Strata;

/// <summary>Builds every static table once, in dependency order.</summary>
public static class Registry
{
    private static bool _data, _gfx;

    public static void Init(bool graphics)
    {
        if (!_data)
        {
            _data = true;
            Blocks.Init();
            Items.Init();
            Recipes.Init();
            Biomes.Init();
            Lighting.Init();
            Mesher.Init();
        }
        if (graphics && !_gfx)
        {
            _gfx = true;
            Textures.Build();
        }
    }
}
