using Godot;

namespace Strata;

public enum Biome : byte
{
    DeepSea, Sea, FrozenSea, Shore, River, Meadow, Elderwood, Mirewood, Pinereach, Frostveld,
    Dunes, Savanna, Ashlands, Peaks,
}

public enum TreeKind : byte { None, Elm, Ironwood, Pine, Willow, Ember, Dead, TallPine, Shrub }

public enum Precip : byte { Rain, Snow, None }

public sealed class BiomeInfo
{
    public Biome Id;
    public string Name;
    public ushort Top, Filler, Under;     // surface, the few blocks under it, deeper crust over stone
    public int FillerDepth = 4;
    public ushort SeaFloor;
    public float TreeDensity;             // chance per 4x4 cell of a tree
    public (TreeKind kind, float weight)[] Trees = { };
    public float Grass, Flowers, Ferns, Bushes, Mushrooms;
    public ushort[] FlowerKinds = { };
    public Precip Precip = Precip.Rain;
    public float Temperature;             // for weather and snowfall
    public Color Fog = new(0.75f, 0.83f, 0.95f);
    public int PassiveWeight = 10;        // how lively it is
}

public static class Biomes
{
    public static readonly BiomeInfo[] Info = new BiomeInfo[14];

    public static BiomeInfo Get(Biome b) => Info[(int)b];

    public static void Init()
    {
        if (Info[0] != null) return;
        Blocks.Init();
        B(Biome.DeepSea, "Deep Sea", Blocks.Sand, Blocks.Sand, Blocks.Gravel, i => { i.SeaFloor = Blocks.Gravel; });
        B(Biome.Sea, "Shallow Sea", Blocks.Sand, Blocks.Sand, Blocks.Sand, i => { i.SeaFloor = Blocks.Sand; });
        B(Biome.FrozenSea, "Frozen Sea", Blocks.Gravel, Blocks.Gravel, Blocks.Gravel, i =>
        {
            i.SeaFloor = Blocks.Gravel; i.Precip = Precip.Snow; i.Temperature = -0.8f; i.Fog = new Color(0.82f, 0.88f, 0.96f);
        });
        B(Biome.Shore, "Shore", Blocks.Sand, Blocks.Sand, Blocks.Sandstone, i => { i.SeaFloor = Blocks.Sand; i.Grass = 0.02f; });
        B(Biome.River, "River", Blocks.Sand, Blocks.Sand, Blocks.Gravel, i => { i.SeaFloor = Blocks.Clay; i.Grass = 0.1f; });
        B(Biome.Meadow, "Verdant Meadow", Blocks.Grass, Blocks.Dirt, Blocks.Dirt, i =>
        {
            i.TreeDensity = 0.03f; i.Trees = new[] { (TreeKind.Elm, 1f), (TreeKind.Shrub, 0.6f) };
            i.Grass = 0.35f; i.Flowers = 0.04f; i.Bushes = 0.004f;
            i.FlowerKinds = new[] { Blocks.Sunpetal, Blocks.Emberbloom, Blocks.Moonlace };
            i.PassiveWeight = 16;
        });
        B(Biome.Elderwood, "Elderwood", Blocks.ForestFloor, Blocks.Dirt, Blocks.Dirt, i =>
        {
            i.TreeDensity = 0.42f; i.Trees = new[] { (TreeKind.Elm, 1f), (TreeKind.Ironwood, 0.7f), (TreeKind.Shrub, 0.3f) };
            i.Grass = 0.22f; i.Ferns = 0.12f; i.Flowers = 0.01f; i.Bushes = 0.006f; i.Mushrooms = 0.01f;
            i.FlowerKinds = new[] { Blocks.Moonlace };
            i.Fog = new Color(0.7f, 0.8f, 0.85f);
        });
        B(Biome.Mirewood, "Mirewood", Blocks.Grass, Blocks.Mud, Blocks.Dirt, i =>
        {
            i.SeaFloor = Blocks.Mud; i.TreeDensity = 0.12f; i.Trees = new[] { (TreeKind.Willow, 1f) };
            i.Grass = 0.3f; i.Ferns = 0.05f; i.Mushrooms = 0.015f; i.Temperature = 0.5f;
            i.Fog = new Color(0.62f, 0.7f, 0.64f); i.PassiveWeight = 6;
        });
        B(Biome.Pinereach, "Pinereach", Blocks.Grass, Blocks.Dirt, Blocks.Dirt, i =>
        {
            i.TreeDensity = 0.3f; i.Trees = new[] { (TreeKind.Pine, 1f), (TreeKind.TallPine, 0.35f) };
            i.Grass = 0.12f; i.Ferns = 0.14f; i.Bushes = 0.004f; i.Mushrooms = 0.004f; i.Temperature = -0.3f;
            i.FlowerKinds = new[] { Blocks.Frostbell };
            i.Flowers = 0.006f;
        });
        B(Biome.Frostveld, "Frostveld", Blocks.SnowyGrass, Blocks.Dirt, Blocks.Dirt, i =>
        {
            i.TreeDensity = 0.015f; i.Trees = new[] { (TreeKind.Pine, 1f) };
            i.Grass = 0.02f; i.Flowers = 0.01f; i.FlowerKinds = new[] { Blocks.Frostbell };
            i.Precip = Precip.Snow; i.Temperature = -0.8f; i.Fog = new Color(0.85f, 0.9f, 0.97f); i.PassiveWeight = 5;
        });
        B(Biome.Dunes, "Sunscorch Dunes", Blocks.Sand, Blocks.Sand, Blocks.Sandstone, i =>
        {
            i.FillerDepth = 5; i.Grass = 0.0f; i.Precip = Precip.None; i.Temperature = 0.9f;
            i.Fog = new Color(0.95f, 0.88f, 0.72f); i.PassiveWeight = 2;
        });
        B(Biome.Savanna, "Ember Savanna", Blocks.Grass, Blocks.Dirt, Blocks.Dirt, i =>
        {
            i.TreeDensity = 0.04f; i.Trees = new[] { (TreeKind.Ember, 1f), (TreeKind.Shrub, 0.4f) };
            i.Grass = 0.45f; i.Flowers = 0.02f; i.FlowerKinds = new[] { Blocks.Emberbloom, Blocks.Sunpetal };
            i.Precip = Precip.None; i.Temperature = 0.6f; i.Fog = new Color(0.92f, 0.86f, 0.75f); i.PassiveWeight = 14;
        });
        B(Biome.Ashlands, "Ashlands", Blocks.Cinder, Blocks.Cinder, Blocks.Ashstone, i =>
        {
            i.TreeDensity = 0.02f; i.Trees = new[] { (TreeKind.Dead, 1f), (TreeKind.Ember, 0.4f) };
            i.Precip = Precip.None; i.Temperature = 1f; i.Fog = new Color(0.55f, 0.5f, 0.5f); i.PassiveWeight = 1;
        });
        B(Biome.Peaks, "Stonecrown Peaks", Blocks.Stone, Blocks.Stone, Blocks.Stone, i =>
        {
            i.TreeDensity = 0.02f; i.Trees = new[] { (TreeKind.Pine, 1f) };
            i.Grass = 0.05f; i.Precip = Precip.Snow; i.Temperature = -0.5f; i.Fog = new Color(0.82f, 0.86f, 0.93f);
            i.PassiveWeight = 3;
        });
    }

    private static void B(Biome id, string name, ushort top, ushort filler, ushort under, System.Action<BiomeInfo> cfg)
    {
        var i = new BiomeInfo { Id = id, Name = name, Top = top, Filler = filler, Under = under, SeaFloor = Blocks.Sand };
        cfg(i);
        Info[(int)id] = i;
    }
}
