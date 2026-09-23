using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

public enum RenderKind : byte { None, Cube, Cross, Crop, Liquid, Torch, Ladder, Door, Low, Trace }
public enum ToolKind : byte { None, Pick, Axe, Shovel, Hoe, Blade, Bow }
public enum SoundKind : byte { Stone, Wood, Dirt, Grass, Sand, Gravel, Glass, Snow, Metal, Plant, Cloth }
public enum BlockUse : byte { None, Worktable, Furnace, Crate, Door, Bed, BerryBush, Switch }

/// <summary>Texture names to array layers. Painting happens later, in Textures.</summary>
public static class Tex
{
    private static readonly Dictionary<string, int> _ids = new();
    public static readonly List<string> Names = new();

    public static int Get(string name)
    {
        if (_ids.TryGetValue(name, out int id)) return id;
        id = Names.Count;
        Names.Add(name);
        _ids[name] = id;
        return id;
    }

    public static int Count => Names.Count;
}

public sealed class BlockDef
{
    public ushort Id;
    public string Key;
    public string Name;
    public RenderKind Render = RenderKind.Cube;
    public bool Solid = true;            // collides
    public bool Opaque = true;           // full light-blocking cube; hides neighbour faces
    public byte Attenuation;             // extra light loss through a non-opaque block
    public bool Cutout;                  // alpha-tested cube (leaves, glass)
    public byte CullGroup;               // equal non-zero groups hide shared faces
    public bool Liquid;
    public bool Replaceable;             // placing a block overwrites it
    public bool Selectable = true;
    public float Hardness = 1f;          // < 0: unbreakable
    public ToolKind Tool;
    public int MinTier;                  // tool tier needed for a drop; 0 = bare hands
    public byte Light;                   // emission, 0..15
    public SoundKind Sound;
    public readonly int[] Tex = new int[6]; // +X,-X,+Y,-Y,+Z,-Z
    public string DropKey;               // resolved to DropItem after items register
    public ushort DropItem;
    public int DropMin = 1, DropMax = 1;
    public float DropChance = 1f;
    public (string key, float chance, int min, int max)[] Extra;
    public (ushort item, float chance, int min, int max)[] ExtraResolved;
    public bool NeedsSupportBelow;
    public int SupportDir = -1;          // wall-mounted: direction of the block holding it up
    public ushort Base;                  // first id of a variant family
    public int Variant;                  // facing (0 N, 1 E, 2 S, 3 W) or growth stage
    public BlockUse Use;
    public Color Particle = new(0.5f, 0.5f, 0.5f);
    public bool Climbable;
    public float ContactDamage;          // per second
    public Aabb? Box;                    // non-full solid collision box, block-local
    public float Height = 1f;            // visual height for Low blocks
    public bool Sway;                    // wind in the vertex shader
    public bool Emissive;                // drawn full-bright
    public bool IsLit;                   // furnace-lit variant
    public int CropStages;               // > 0: crop family with this many stages
    public float GrowChance;             // per random tick
    public bool Ripe;
    public bool NoItem;                  // a state of another block (lit, pressed, powered): no item of its own

    public bool Air => Id == 0;
    public bool Breakable => Hardness >= 0f;
    public bool IsCube => Render == RenderKind.Cube;

    public void Faces(int all) { for (int i = 0; i < 6; i++) Tex[i] = all; }
    public void Faces(int side, int top, int bottom)
    {
        Tex[Dir.PX] = Tex[Dir.NX] = Tex[Dir.PZ] = Tex[Dir.NZ] = side;
        Tex[Dir.PY] = top; Tex[Dir.NY] = bottom;
    }
}

/// <summary>
/// Every block in the game. Variants (facing, growth stage, lit, open) are
/// separate ids so a block is one ushort with no side-table of metadata;
/// saves store a key palette, so ids can be reordered without breaking worlds.
/// </summary>
public static class Blocks
{
    public static readonly List<BlockDef> All = new();
    public static BlockDef[] ById = Array.Empty<BlockDef>();
    public static readonly Dictionary<string, ushort> ByKey = new();
    private static bool _ready;

    // Facing index -> the direction the block's front looks toward.
    public static readonly int[] FacingDir = { Dir.NZ, Dir.PX, Dir.PZ, Dir.NX };

    public static ushort Air, Rootstone, Stone, Slatestone, Cobblestone, MossyCobble, CobbledSlate,
        Dirt, Grass, SnowyGrass, ForestFloor, Mud, Sand, Cinder, Sandstone, Gravel, Clay, Snow, Ice,
        Ashstone, SootOre, CopperOre, IronOre, SilverOre, GoldOre, LumenOre, StarmetalOre,
        ElmLog, IronwoodLog, PineLog, WillowLog, ElmPlanks, IronwoodPlanks, PinePlanks, WillowPlanks,
        ElmLeaves, IronwoodLeaves, PineLeaves, WillowLeaves, EmberLeaves, DryLeaves,
        ElmSapling, IronwoodSapling, PineSapling, WillowSapling,
        TallGrass, Fern, DeadBush, Emberbloom, Sunpetal, Frostbell, Moonlace, Reeds,
        BerryBush, BerryBushBare, Blushcap, Umbercap, Glowcap, Spinecactus,
        Water, Lava, StoneBricks, CarvedStone, ClayBricks, AshBricks, DressedSandstone, Glass, Thatch,
        CopperBlock, IronBlock, SilverBlock, GoldBlock, StarmetalBlock, LumenBlock, LumenLamp, SlateTiles,
        Worktable, Crate, Bedroll, TilledSoil, Torch;
    public static ushort LumenTrace;   // base of 16: signal strength 0..15
    public static ushort Switch, SwitchOn, TreadPlate, TreadPlateDown, SignalLamp, SignalLampOn;

    public static bool IsTrace(ushort id) => id >= LumenTrace && id < LumenTrace + 16 && LumenTrace != 0;
    public static int TraceLevel(ushort id) => IsTrace(id) ? id - LumenTrace : 0;
    /// <summary>Anything that takes part in a lumen circuit.</summary>
    public static bool IsCircuit(ushort id) => IsTrace(id) || id == Switch || id == SwitchOn || id == TreadPlate
        || id == TreadPlateDown || id == SignalLamp || id == SignalLampOn;
    public static ushort Furnace;      // base of 4 facings
    public static ushort FurnaceLit;   // base of 4 lit facings
    public static ushort TorchWall;    // base of 4 wall torches (by support direction)
    public static ushort Ladder;       // base of 4
    public static ushort Door;         // base of 16: (lower/upper) x (closed/open) x facing
    public static ushort Grain, Emberroot, Frostleaf; // crop bases (4 stages)
    public static ushort WaterFalling, WaterLast;     // flowing water: falling, then levels 7..1

    /// <summary>Any kind of water: the still source or a moving level.</summary>
    public static bool IsWater(ushort id) => id == Water || (id >= WaterFalling && id <= WaterLast);

    /// <summary>How far water has spread to reach a cell: 0 source, 1..7 thinning, 8 falling (acts like fresh).</summary>
    public static int WaterLevel(ushort id) => id == Water ? 0 : ById[id].Variant;

    public static ushort FlowingWater(int level) => level >= 8 ? WaterFalling : (ushort)(WaterFalling + (8 - level));

    // Surface height of each water level in sixteenths of a block, when nothing liquid sits above.
    private static readonly int[] WaterTops = { 14, 12, 11, 9, 8, 6, 5, 3, 14 };

    /// <summary>Where a liquid's surface sits in its cell, in sixteenths, with nothing liquid above it.</summary>
    public static int LiquidTop16(ushort id) => IsWater(id) ? WaterTops[WaterLevel(id)] : 14;

    public static BlockDef Get(ushort id) => ById[id];

    public static void Init()
    {
        if (_ready) return;
        _ready = true;

        Air = Add("air", "Air", b =>
        {
            b.Render = RenderKind.None; b.Solid = false; b.Opaque = false; b.Selectable = false;
            b.Replaceable = true; b.Hardness = 0;
        });

        // --- stone and earth -------------------------------------------------
        Rootstone = Add("rootstone", "Rootstone", b => { b.Faces(Tex.Get("rootstone")); b.Hardness = -1; P(b, 0.12f, 0.11f, 0.13f); });
        Stone = Add("stone", "Stone", b => { Rock(b, "stone", 1.5f, 1); b.DropKey = "cobblestone"; });
        Slatestone = Add("slatestone", "Slatestone", b => { Rock(b, "slatestone", 3.0f, 1); b.DropKey = "cobbled_slate"; P(b, 0.22f, 0.22f, 0.26f); });
        Cobblestone = Add("cobblestone", "Cobblestone", b => Rock(b, "cobblestone", 2f, 1));
        MossyCobble = Add("mossy_cobblestone", "Mossy Cobblestone", b => Rock(b, "mossy_cobblestone", 2f, 1));
        CobbledSlate = Add("cobbled_slate", "Cobbled Slate", b => { Rock(b, "cobbled_slate", 3f, 1); P(b, 0.24f, 0.24f, 0.28f); });
        Dirt = Add("soil", "Soil", b => Earth(b, "dirt", 0.5f, SoundKind.Dirt, 0.42f, 0.30f, 0.20f));
        Grass = Add("grass", "Grassy Soil", b =>
        {
            Earth(b, "dirt", 0.6f, SoundKind.Grass, 0.36f, 0.55f, 0.22f);
            b.Faces(Tex.Get("grass_side"), Tex.Get("grass_top"), Tex.Get("dirt"));
            b.DropKey = "soil";
        });
        SnowyGrass = Add("snowy_soil", "Snowy Soil", b =>
        {
            Earth(b, "dirt", 0.6f, SoundKind.Snow, 0.9f, 0.93f, 0.97f);
            b.Faces(Tex.Get("snow_side"), Tex.Get("snow"), Tex.Get("dirt"));
            b.DropKey = "soil";
        });
        ForestFloor = Add("forest_floor", "Forest Floor", b =>
        {
            Earth(b, "dirt", 0.6f, SoundKind.Grass, 0.33f, 0.26f, 0.16f);
            b.Faces(Tex.Get("forest_floor_side"), Tex.Get("forest_floor_top"), Tex.Get("dirt"));
            b.DropKey = "soil";
        });
        Mud = Add("mud", "Marsh Mud", b => Earth(b, "mud", 0.5f, SoundKind.Dirt, 0.27f, 0.23f, 0.18f));
        Sand = Add("sand", "Sand", b => Earth(b, "sand", 0.5f, SoundKind.Sand, 0.86f, 0.78f, 0.55f));
        Cinder = Add("cinder", "Cinder", b => Earth(b, "cinder", 0.6f, SoundKind.Gravel, 0.2f, 0.18f, 0.17f));
        Sandstone = Add("sandstone", "Sandstone", b =>
        {
            Rock(b, "sandstone_side", 0.8f, 1);
            b.Faces(Tex.Get("sandstone_side"), Tex.Get("sandstone_top"), Tex.Get("sandstone_top"));
            P(b, 0.83f, 0.74f, 0.52f);
        });
        Gravel = Add("gravel", "Gravel", b => Earth(b, "gravel", 0.6f, SoundKind.Gravel, 0.48f, 0.46f, 0.45f));
        All[Gravel].DropKey = "gravel";          // extras replace the self-drop unless it is named
        All[Gravel].Extra = new[] { ("flint", 0.15f, 1, 1) };
        Clay = Add("clay", "Clay", b =>
        {
            Earth(b, "clay", 0.6f, SoundKind.Dirt, 0.6f, 0.63f, 0.68f);
            b.DropKey = "clay_ball"; b.DropMin = 3; b.DropMax = 4;
        });
        Snow = Add("snow", "Snow Block", b => Earth(b, "snow", 0.2f, SoundKind.Snow, 0.94f, 0.96f, 1f));
        Ice = Add("ice", "Ice", b => { Rock(b, "ice", 0.5f, 0); b.Sound = SoundKind.Glass; b.Tool = ToolKind.Pick; P(b, 0.7f, 0.85f, 1f); });
        Ashstone = Add("ashstone", "Ashstone", b => { Rock(b, "ashstone", 1.5f, 1); P(b, 0.3f, 0.28f, 0.28f); });

        // --- ores ------------------------------------------------------------
        SootOre = Add("soot_ore", "Soot Seam", b => { Rock(b, "soot_ore", 3f, 1); b.DropKey = "soot"; b.DropMin = 1; b.DropMax = 2; });
        CopperOre = Add("copper_ore", "Copper Ore", b => { Rock(b, "copper_ore", 3f, 2); P(b, 0.78f, 0.47f, 0.3f); });
        IronOre = Add("iron_ore", "Iron Ore", b => { Rock(b, "iron_ore", 3.2f, 3); P(b, 0.8f, 0.66f, 0.55f); });
        SilverOre = Add("silver_ore", "Silver Ore", b => { Rock(b, "silver_ore", 3.5f, 3); P(b, 0.82f, 0.84f, 0.88f); });
        GoldOre = Add("gold_ore", "Gold Ore", b => { Rock(b, "gold_ore", 3.5f, 4); P(b, 0.95f, 0.8f, 0.3f); });
        LumenOre = Add("lumen_ore", "Lumen Crystal", b =>
        {
            Rock(b, "lumen_ore", 3.5f, 4); b.Light = 7; b.Sound = SoundKind.Glass;
            b.DropKey = "lumen_shard"; b.DropMin = 2; b.DropMax = 4; P(b, 0.5f, 0.95f, 0.9f);
        });
        StarmetalOre = Add("starmetal_ore", "Starmetal Ore", b => { Rock(b, "starmetal_ore", 6f, 4); b.Light = 3; P(b, 0.55f, 0.45f, 0.95f); });

        // --- wood ------------------------------------------------------------
        string[] woods = { "elm", "ironwood", "pine", "willow" };
        string[] woodNames = { "Elm", "Ironwood", "Pine", "Willow" };
        Color[] woodColors = { new(0.55f, 0.4f, 0.26f), new(0.28f, 0.22f, 0.2f), new(0.45f, 0.33f, 0.22f), new(0.5f, 0.45f, 0.32f) };
        var logs = new ushort[4];
        var planks = new ushort[4];
        for (int i = 0; i < 4; i++)
        {
            string w = woods[i];
            int ci = i;
            logs[i] = Add(w + "_log", woodNames[i] + " Log", b =>
            {
                b.Faces(Tex.Get(w + "_log"), Tex.Get(w + "_log_top"), Tex.Get(w + "_log_top"));
                b.Hardness = 2f; b.Tool = ToolKind.Axe; b.Sound = SoundKind.Wood; b.Particle = woodColors[ci];
            });
            planks[i] = Add(w + "_planks", woodNames[i] + " Planks", b =>
            {
                b.Faces(Tex.Get(w + "_planks"));
                b.Hardness = 2f; b.Tool = ToolKind.Axe; b.Sound = SoundKind.Wood; b.Particle = woodColors[ci].Lightened(0.15f);
            });
        }
        (ElmLog, IronwoodLog, PineLog, WillowLog) = (logs[0], logs[1], logs[2], logs[3]);
        (ElmPlanks, IronwoodPlanks, PinePlanks, WillowPlanks) = (planks[0], planks[1], planks[2], planks[3]);

        ElmLeaves = Leaves("elm_leaves", "Elm Leaves", "elm_sapling", new Color(0.3f, 0.55f, 0.2f));
        IronwoodLeaves = Leaves("ironwood_leaves", "Ironwood Leaves", "ironwood_sapling", new Color(0.18f, 0.38f, 0.2f));
        PineLeaves = Leaves("pine_leaves", "Pine Needles", "pine_sapling", new Color(0.2f, 0.36f, 0.28f));
        WillowLeaves = Leaves("willow_leaves", "Willow Leaves", "willow_sapling", new Color(0.4f, 0.55f, 0.25f));
        EmberLeaves = Leaves("ember_leaves", "Emberleaf", "elm_sapling", new Color(0.85f, 0.4f, 0.12f));
        DryLeaves = Leaves("dry_leaves", "Dry Leaves", null, new Color(0.55f, 0.48f, 0.3f));

        ElmSapling = Plant("elm_sapling", "Elm Sapling", false, 0.3f, 0.6f, 0.2f);
        IronwoodSapling = Plant("ironwood_sapling", "Ironwood Sapling", false, 0.2f, 0.4f, 0.2f);
        PineSapling = Plant("pine_sapling", "Pine Sapling", false, 0.2f, 0.4f, 0.3f);
        WillowSapling = Plant("willow_sapling", "Willow Sapling", false, 0.4f, 0.6f, 0.3f);
        foreach (var s in new[] { ElmSapling, IronwoodSapling, PineSapling, WillowSapling })
        {
            var d = All[s]; d.Replaceable = false; d.GrowChance = 0.004f;
        }

        // --- ground plants ---------------------------------------------------
        TallGrass = Plant("tall_grass", "Tall Grass", true, 0.35f, 0.6f, 0.22f);
        All[TallGrass].DropKey = null;
        All[TallGrass].Extra = new[] { ("fiber", 0.3f, 1, 1), ("grain_seeds", 0.12f, 1, 1) };
        Fern = Plant("fern", "Fern", true, 0.25f, 0.5f, 0.22f);
        All[Fern].DropKey = null; All[Fern].Extra = new[] { ("fiber", 0.3f, 1, 1) };
        DeadBush = Plant("dead_bush", "Dry Brush", true, 0.55f, 0.45f, 0.3f);
        All[DeadBush].DropKey = null; All[DeadBush].Extra = new[] { ("stick", 0.6f, 1, 2) };
        Emberbloom = Plant("emberbloom", "Emberbloom", true, 0.9f, 0.25f, 0.2f);
        Sunpetal = Plant("sunpetal", "Sunpetal", true, 0.95f, 0.85f, 0.25f);
        Frostbell = Plant("frostbell", "Frostbell", true, 0.45f, 0.6f, 0.95f);
        // The wild parents of two crops: an emberbloom sometimes comes up with its root,
        // and a frostbell sheds the seeds of its cultivated cousin.
        All[Emberbloom].DropKey = "emberbloom";
        All[Emberbloom].Extra = new[] { ("emberroot", 0.3f, 1, 1) };
        All[Frostbell].DropKey = "frostbell";
        All[Frostbell].Extra = new[] { ("frostleaf_seeds", 0.35f, 1, 2) };
        Moonlace = Plant("moonlace", "Moonlace", true, 0.92f, 0.92f, 0.95f);
        Reeds = Plant("reeds", "Reeds", false, 0.5f, 0.6f, 0.3f);
        All[Reeds].DropKey = "reed";
        BerryBush = Plant("berry_bush", "Berry Bush", false, 0.3f, 0.45f, 0.22f);
        BerryBushBare = Plant("berry_bush_bare", "Berry Bush", false, 0.3f, 0.45f, 0.22f);
        foreach (var bb in new[] { BerryBush, BerryBushBare })
        {
            var d = All[bb]; d.DropKey = "berry_bush"; d.Use = BlockUse.BerryBush; d.Hardness = 0.3f;
        }
        All[BerryBush].Ripe = true;
        All[BerryBushBare].GrowChance = 0.01f;
        Blushcap = Plant("blushcap", "Blushcap", false, 0.8f, 0.25f, 0.25f);
        Umbercap = Plant("umbercap", "Umbercap", false, 0.5f, 0.38f, 0.25f);
        Glowcap = Plant("glowcap", "Glowcap", false, 0.35f, 0.9f, 0.85f);
        All[Glowcap].Light = 9; All[Glowcap].Emissive = true;
        foreach (var m in new[] { Blushcap, Umbercap, Glowcap }) All[m].Sway = false;
        Spinecactus = Add("spinecactus", "Spinecactus", b =>
        {
            b.Faces(Tex.Get("spinecactus_side"), Tex.Get("spinecactus_top"), Tex.Get("spinecactus_top"));
            b.Hardness = 0.4f; b.Sound = SoundKind.Cloth; b.ContactDamage = 1f; b.NeedsSupportBelow = true;
            b.Opaque = false; b.Cutout = true; P(b, 0.3f, 0.55f, 0.25f);
            b.Box = new Aabb(new Vector3(0.0625f, 0, 0.0625f), new Vector3(0.875f, 1, 0.875f));
        });

        // --- liquids ---------------------------------------------------------
        Water = Add("water", "Water", b =>
        {
            b.Render = RenderKind.Liquid; b.Solid = false; b.Opaque = false; b.Liquid = true;
            b.Attenuation = 2; b.Replaceable = true; b.Selectable = false; b.Hardness = -1;
            b.Faces(Tex.Get("water")); b.CullGroup = 3; P(b, 0.2f, 0.4f, 0.8f);
        });
        // Moving water: variant 8 is a falling column, 1..7 spread out from a source, thinning as they go.
        for (int level = 8; level >= 1; level--)
        {
            int lv = level;
            ushort id = Add(level == 8 ? "water_falling" : "water_" + level, "Water", b =>
            {
                b.Render = RenderKind.Liquid; b.Solid = false; b.Opaque = false; b.Liquid = true;
                b.Attenuation = 2; b.Replaceable = true; b.Selectable = false; b.Hardness = -1;
                b.Faces(Tex.Get("water")); b.CullGroup = 3; P(b, 0.2f, 0.4f, 0.8f);
                b.Variant = lv; b.DropKey = null;
            });
            if (level == 8) WaterFalling = id;
            if (level == 1) WaterLast = (ushort)(id);
        }
        Lava = Add("lava", "Lava", b =>
        {
            b.Render = RenderKind.Liquid; b.Solid = false; b.Opaque = false; b.Liquid = true;
            b.Light = 15; b.Replaceable = true; b.Selectable = false; b.Hardness = -1;
            b.Faces(Tex.Get("lava")); b.CullGroup = 4; b.ContactDamage = 6f; b.Emissive = true;
            P(b, 1f, 0.45f, 0.1f);
        });

        // --- building blocks -------------------------------------------------
        StoneBricks = Add("stone_bricks", "Stone Bricks", b => Rock(b, "stone_bricks", 1.8f, 1));
        CarvedStone = Add("carved_stone", "Carved Stone", b => Rock(b, "carved_stone", 1.8f, 1));
        ClayBricks = Add("clay_bricks", "Kiln Bricks", b => { Rock(b, "clay_bricks", 2f, 1); P(b, 0.62f, 0.32f, 0.26f); });
        AshBricks = Add("ash_bricks", "Ashbrick", b => { Rock(b, "ash_bricks", 2f, 1); P(b, 0.25f, 0.23f, 0.24f); });
        DressedSandstone = Add("dressed_sandstone", "Dressed Sandstone", b => { Rock(b, "dressed_sandstone", 1f, 1); P(b, 0.85f, 0.76f, 0.54f); });
        SlateTiles = Add("slate_tiles", "Slate Tiles", b => { Rock(b, "slate_tiles", 3f, 1); P(b, 0.24f, 0.24f, 0.28f); });
        Glass = Add("glass", "Glass", b =>
        {
            b.Faces(Tex.Get("glass")); b.Opaque = false; b.Cutout = true; b.CullGroup = 2;
            b.Hardness = 0.3f; b.Sound = SoundKind.Glass; P(b, 0.8f, 0.9f, 0.95f);
        });
        Thatch = Add("thatch", "Thatch", b =>
        {
            b.Faces(Tex.Get("thatch_side"), Tex.Get("thatch_top"), Tex.Get("thatch_top"));
            b.Hardness = 0.5f; b.Sound = SoundKind.Grass; b.Tool = ToolKind.Hoe; P(b, 0.8f, 0.68f, 0.35f);
        });
        CopperBlock = Metal("copper_block", "Copper Block", 2, 0.8f, 0.5f, 0.32f);
        IronBlock = Metal("iron_block", "Iron Block", 3, 0.78f, 0.78f, 0.8f);
        SilverBlock = Metal("silver_block", "Silver Block", 3, 0.88f, 0.9f, 0.94f);
        GoldBlock = Metal("gold_block", "Gold Block", 4, 0.98f, 0.82f, 0.3f);
        StarmetalBlock = Metal("starmetal_block", "Starmetal Block", 4, 0.5f, 0.4f, 0.95f);
        LumenBlock = Add("lumen_block", "Lumen Block", b =>
        {
            b.Faces(Tex.Get("lumen_block")); b.Light = 15; b.Hardness = 0.6f; b.Sound = SoundKind.Glass;
            b.Emissive = true; P(b, 0.6f, 1f, 0.95f);
        });
        LumenLamp = Add("lumen_lamp", "Lumen Lamp", b =>
        {
            b.Faces(Tex.Get("lumen_lamp")); b.Light = 15; b.Hardness = 0.6f; b.Sound = SoundKind.Glass;
            b.Emissive = true; P(b, 1f, 0.9f, 0.7f);
        });

        // --- lumen circuits ---------------------------------------------------
        // A trace carries a signal, strongest (15) beside a live switch or plate and one weaker per block.
        for (int level = 0; level < 16; level++)
        {
            int lv = level;
            ushort id = Add(level == 0 ? "lumen_trace" : "lumen_trace_" + level, "Lumen Trace", b =>
            {
                b.Render = RenderKind.Trace; b.Solid = false; b.Opaque = false; b.Hardness = 0f; b.Sound = SoundKind.Glass;
                b.Faces(Tex.Get(lv > 0 ? "lumen_trace_on" : "lumen_trace_off")); b.Emissive = lv > 0;
                b.NeedsSupportBelow = true; b.Variant = lv; b.DropKey = "lumen_trace"; b.NoItem = lv > 0;
                b.Box = new Aabb(Vector3.Zero, new Vector3(1, 1f / 16f, 1)); P(b, 0.4f, 0.9f, 0.85f);
            });
            if (level == 0) LumenTrace = id;
        }
        Switch = Add("switch", "Switch", b => SwitchDef(b, false));
        SwitchOn = Add("switch_on", "Switch", b => SwitchDef(b, true));
        TreadPlate = Add("tread_plate", "Tread Plate", b => PlateDef(b, false));
        TreadPlateDown = Add("tread_plate_down", "Tread Plate", b => PlateDef(b, true));
        SignalLamp = Add("signal_lamp", "Signal Lamp", b => LampDef(b, false));
        SignalLampOn = Add("signal_lamp_on", "Signal Lamp", b => LampDef(b, true));

        // --- stations and furniture -----------------------------------------
        Worktable = Add("worktable", "Worktable", b =>
        {
            b.Faces(Tex.Get("worktable_side"), Tex.Get("worktable_top"), Tex.Get("elm_planks"));
            b.Hardness = 2.5f; b.Tool = ToolKind.Axe; b.Sound = SoundKind.Wood; b.Use = BlockUse.Worktable;
            P(b, 0.6f, 0.45f, 0.3f);
        });
        Furnace = Facing("furnace", "Furnace", lit: false);
        FurnaceLit = Facing("furnace_lit", "Furnace", lit: true);
        Crate = Add("crate", "Storage Crate", b =>
        {
            b.Faces(Tex.Get("crate_side"), Tex.Get("crate_top"), Tex.Get("crate_top"));
            b.Hardness = 2.5f; b.Tool = ToolKind.Axe; b.Sound = SoundKind.Wood; b.Use = BlockUse.Crate;
            P(b, 0.58f, 0.42f, 0.26f);
        });
        Bedroll = Add("bedroll", "Bedroll", b =>
        {
            b.Render = RenderKind.Low; b.Height = 0.3f; b.Opaque = false;
            b.Faces(Tex.Get("bedroll_side"), Tex.Get("bedroll_top"), Tex.Get("elm_planks"));
            b.Hardness = 0.4f; b.Sound = SoundKind.Cloth; b.Use = BlockUse.Bed;
            b.Box = new Aabb(Vector3.Zero, new Vector3(1, 0.3f, 1)); P(b, 0.7f, 0.2f, 0.18f);
        });
        TilledSoil = Add("tilled_soil", "Tilled Soil", b =>
        {
            Earth(b, "dirt", 0.6f, SoundKind.Dirt, 0.35f, 0.25f, 0.17f);
            b.Faces(Tex.Get("dirt"), Tex.Get("tilled_soil"), Tex.Get("dirt"));
            b.DropKey = "soil";
        });

        Torch = Add("torch", "Torch", b =>
        {
            b.Render = RenderKind.Torch; b.Solid = false; b.Opaque = false; b.Light = 14;
            b.Hardness = 0; b.Sound = SoundKind.Wood; b.Faces(Tex.Get("torch")); b.NeedsSupportBelow = true;
            b.Emissive = true; b.Replaceable = false; P(b, 1f, 0.8f, 0.4f);
        });
        TorchWall = 0;
        int[] wallDirs = { Dir.PZ, Dir.NX, Dir.NZ, Dir.PX }; // support is behind: facing N means the wall is to the south
        for (int f = 0; f < 4; f++)
        {
            int ff = f;
            ushort id = Add("torch_wall_" + f, "Torch", b =>
            {
                b.Render = RenderKind.Torch; b.Solid = false; b.Opaque = false; b.Light = 14;
                b.Hardness = 0; b.Sound = SoundKind.Wood; b.Faces(Tex.Get("torch")); b.SupportDir = wallDirs[ff];
                b.Variant = ff; b.DropKey = "torch"; b.Emissive = true; P(b, 1f, 0.8f, 0.4f);
            });
            if (f == 0) TorchWall = id;
            All[id].Base = TorchWall;
        }
        for (int f = 0; f < 4; f++)
        {
            int ff = f;
            ushort id = Add("ladder_" + f, "Ladder", b =>
            {
                b.Render = RenderKind.Ladder; b.Solid = false; b.Opaque = false; b.Climbable = true;
                b.Hardness = 0.4f; b.Tool = ToolKind.Axe; b.Sound = SoundKind.Wood; b.Faces(Tex.Get("ladder"));
                b.SupportDir = wallDirs[ff]; b.Variant = ff; b.DropKey = "ladder"; P(b, 0.55f, 0.4f, 0.25f);
            });
            if (f == 0) Ladder = id;
            All[id].Base = Ladder;
        }
        // Doors: variant = facing | (open << 2) | (upper << 3)
        for (int v = 0; v < 16; v++)
        {
            int vv = v;
            ushort id = Add("door_" + v, "Door", b =>
            {
                bool upper = (vv & 8) != 0, open = (vv & 4) != 0;
                b.Render = RenderKind.Door; b.Opaque = false; b.Solid = !open; b.Variant = vv;
                b.Hardness = 2f; b.Tool = ToolKind.Axe; b.Sound = SoundKind.Wood; b.Use = BlockUse.Door;
                b.Faces(Tex.Get(upper ? "door_upper" : "door_lower")); b.DropKey = upper ? null : "door";
                b.Box = DoorBox(vv & 3, open);
                P(b, 0.55f, 0.4f, 0.25f);
            });
            if (v == 0) Door = id;
            All[id].Base = Door;
        }

        // --- crops -----------------------------------------------------------
        Grain = Crop("grain", "Goldgrain", 4, 0.035f, "grain", 1, 3, "grain_seeds", 1, 2);
        Emberroot = Crop("emberroot", "Emberroot", 4, 0.03f, "emberroot", 2, 4, null, 0, 0);
        Frostleaf = Crop("frostleaf", "Frostleaf", 4, 0.04f, "frostleaf", 1, 2, "frostleaf_seeds", 1, 2);

        ById = All.ToArray();
        foreach (var b in All) if (b.Base == 0) b.Base = b.Id;
    }

    /// <summary>Called once items exist: turns drop keys into item ids.</summary>
    public static void LinkItems()
    {
        foreach (var b in All)
        {
            if (b.Id == Air) continue;
            string key = b.DropKey;
            if (key == null && b.Extra == null && b.CropStages == 0 && Items.ByKey.ContainsKey(b.Key)) key = b.Key;
            if (key != null && Items.ByKey.TryGetValue(key, out ushort it)) b.DropItem = it;
            if (b.Extra != null)
            {
                var list = new List<(ushort, float, int, int)>();
                foreach (var e in b.Extra)
                    if (Items.ByKey.TryGetValue(e.key, out ushort ei)) list.Add((ei, e.chance, e.min, e.max));
                b.ExtraResolved = list.ToArray();
            }
        }
    }

    // --- helpers ---------------------------------------------------------------

    private static ushort Add(string key, string name, Action<BlockDef> cfg)
    {
        var b = new BlockDef { Id = (ushort)All.Count, Key = key, Name = name };
        cfg(b);
        All.Add(b);
        ByKey[key] = b.Id;
        return b.Id;
    }

    private static void P(BlockDef b, float r, float g, float bl) => b.Particle = new Color(r, g, bl);

    private static void Rock(BlockDef b, string tex, float hardness, int tier)
    {
        b.Faces(Tex.Get(tex)); b.Hardness = hardness; b.Tool = ToolKind.Pick; b.MinTier = tier;
        b.Sound = SoundKind.Stone; b.Particle = new Color(0.5f, 0.5f, 0.52f);
    }

    private static void Earth(BlockDef b, string tex, float hardness, SoundKind snd, float r, float g, float bl)
    {
        b.Faces(Tex.Get(tex)); b.Hardness = hardness; b.Tool = ToolKind.Shovel; b.Sound = snd;
        b.Particle = new Color(r, g, bl);
    }

    private static ushort Metal(string key, string name, int tier, float r, float g, float bl) => Add(key, name, b =>
    {
        b.Faces(Tex.Get(key)); b.Hardness = 4f; b.Tool = ToolKind.Pick; b.MinTier = tier;
        b.Sound = SoundKind.Metal; P(b, r, g, bl);
    });

    private static ushort Leaves(string key, string name, string sapling, Color c) => Add(key, name, b =>
    {
        b.Faces(Tex.Get(key)); b.Opaque = false; b.Cutout = true; b.CullGroup = 1; b.Attenuation = 1;
        b.Hardness = 0.2f; b.Tool = ToolKind.Hoe; b.Sound = SoundKind.Plant; b.Particle = c; b.Sway = true;
        b.DropKey = null;
        b.Extra = sapling != null
            ? new[] { (sapling, 0.06f, 1, 1), ("stick", 0.04f, 1, 1) }
            : new[] { ("stick", 0.08f, 1, 1) };
    });

    private static ushort Plant(string key, string name, bool replaceable, float r, float g, float bl) => Add(key, name, b =>
    {
        b.Render = RenderKind.Cross; b.Solid = false; b.Opaque = false; b.Hardness = 0f;
        b.Sound = SoundKind.Plant; b.Faces(Tex.Get(key)); b.NeedsSupportBelow = true;
        b.Replaceable = replaceable; b.Sway = true; P(b, r, g, bl);
    });

    private static ushort Facing(string key, string name, bool lit)
    {
        ushort first = 0;
        for (int f = 0; f < 4; f++)
        {
            int ff = f;
            ushort id = Add(key + "_" + f, name, b =>
            {
                b.Faces(Tex.Get("furnace_side"), Tex.Get("furnace_top"), Tex.Get("furnace_top"));
                b.Tex[FacingDir[ff]] = Tex.Get(lit ? "furnace_front_lit" : "furnace_front");
                b.Hardness = 3.5f; b.Tool = ToolKind.Pick; b.MinTier = 1; b.Sound = SoundKind.Stone;
                b.Use = BlockUse.Furnace; b.Variant = ff; b.IsLit = lit; b.DropKey = "furnace";
                if (lit) { b.Light = 13; }
                P(b, 0.45f, 0.44f, 0.44f);
            });
            if (f == 0) first = id;
            All[id].Base = first;
        }
        return first;
    }

    private static ushort Crop(string key, string name, int stages, float grow, string drop, int dmin, int dmax,
        string seed, int smin, int smax)
    {
        ushort first = 0;
        for (int s = 0; s < stages; s++)
        {
            int ss = s;
            ushort id = Add(key + "_" + s, name, b =>
            {
                b.Render = RenderKind.Crop; b.Solid = false; b.Opaque = false; b.Hardness = 0f;
                b.Sound = SoundKind.Plant; b.Faces(Tex.Get(key + "_" + ss)); b.NeedsSupportBelow = true;
                b.CropStages = stages; b.Variant = ss; b.GrowChance = ss < stages - 1 ? grow : 0f;
                b.Sway = true; b.Ripe = ss == stages - 1; P(b, 0.5f, 0.7f, 0.3f);
                b.DropKey = null;
                if (b.Ripe)
                {
                    var extra = new List<(string, float, int, int)> { (drop, 1f, dmin, dmax) };
                    if (seed != null) extra.Add((seed, 1f, smin, smax));
                    b.Extra = extra.ToArray();
                }
                else
                {
                    b.Extra = new[] { (seed ?? drop, 1f, 1, 1) };
                }
            });
            if (s == 0) first = id;
            All[id].Base = first;
        }
        return first;
    }

    /// <summary>A door is a 3/16-thick panel on one edge of its cell; opening swings it to the side.</summary>
    public static Aabb DoorBox(int facing, bool open)
    {
        const float t = 3f / 16f;
        // Closed: the panel lies across the cell on the side the door faces.
        int side = open ? (facing + 1) & 3 : facing;
        return side switch
        {
            0 => new Aabb(new Vector3(0, 0, 0), new Vector3(1, 1, t)),         // north edge
            1 => new Aabb(new Vector3(1 - t, 0, 0), new Vector3(t, 1, 1)),     // east edge
            2 => new Aabb(new Vector3(0, 0, 1 - t), new Vector3(1, 1, t)),     // south edge
            _ => new Aabb(new Vector3(0, 0, 0), new Vector3(t, 1, 1)),         // west edge
        };
    }

    public static bool IsDoor(ushort id) => id >= Door && id < Door + 16;

    private static void SwitchDef(BlockDef b, bool on)
    {
        b.Render = RenderKind.Low; b.Opaque = false; b.Solid = false; b.Hardness = 0.3f; b.Sound = SoundKind.Stone;
        b.Faces(Tex.Get("switch_side"), Tex.Get(on ? "switch_top_on" : "switch_top_off"), Tex.Get("switch_side"));
        b.Box = new Aabb(new Vector3(0.25f, 0, 0.25f), new Vector3(0.5f, 0.2f, 0.5f)); b.Height = 0.2f;
        b.Use = BlockUse.Switch; b.NeedsSupportBelow = true; b.DropKey = "switch"; b.NoItem = on; b.Variant = on ? 1 : 0;
        P(b, 0.5f, 0.5f, 0.52f);
    }

    private static void PlateDef(BlockDef b, bool down)
    {
        float h = down ? 1f / 32f : 1f / 16f;
        b.Render = RenderKind.Low; b.Opaque = false; b.Solid = false; b.Hardness = 0.5f; b.Sound = SoundKind.Wood; b.Tool = ToolKind.Axe;
        b.Faces(Tex.Get("tread_plate"));
        b.Box = new Aabb(new Vector3(1f / 16f, 0, 1f / 16f), new Vector3(14f / 16f, h, 14f / 16f)); b.Height = h;
        b.NeedsSupportBelow = true; b.DropKey = "tread_plate"; b.NoItem = down; b.Variant = down ? 1 : 0;
        P(b, 0.62f, 0.47f, 0.3f);
    }

    private static void LampDef(BlockDef b, bool on)
    {
        b.Faces(Tex.Get(on ? "signal_lamp_on" : "signal_lamp_off")); b.Hardness = 0.6f; b.Sound = SoundKind.Glass;
        b.Light = (byte)(on ? 15 : 0); b.Emissive = on; b.DropKey = "signal_lamp"; b.NoItem = on; b.Variant = on ? 1 : 0;
        if (on) P(b, 1f, 0.85f, 0.55f); else P(b, 0.55f, 0.5f, 0.45f);
    }
    public static bool IsLeaves(ushort id) => ById[id].CullGroup == 1;
    public static bool IsLog(ushort id) => id == ElmLog || id == IronwoodLog || id == PineLog || id == WillowLog;
    public static bool IsSoilLike(ushort id) =>
        id == Dirt || id == Grass || id == SnowyGrass || id == ForestFloor || id == TilledSoil || id == Mud;
}
