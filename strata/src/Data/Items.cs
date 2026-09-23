using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>How an item turns into blocks when used on the world.</summary>
public enum PlaceKind : byte { None, Block, Facing, Torch, Ladder, Door, Seed, Plant }

public enum IconKind : byte { Cube, Flat, Sprite }

public sealed class ItemDef
{
    public ushort Id;
    public string Key;
    public string Name;
    public string Info;                  // one line for the tooltip
    public int MaxStack = 64;

    public PlaceKind Place;
    public ushort Block;                 // what it places (base id for families)

    public ToolKind Tool;
    public int Tier;                     // 0 hand .. 5 starmetal
    public int Durability;               // 0 = does not wear
    public float Damage = 1f;
    public float Cooldown = 0.35f;       // seconds between swings at full strength
    public float Speed = 1f;             // mining multiplier with the right tool
    public float NightBonus;             // extra damage multiplier against night creatures

    public int Food;                     // hunger restored (half-shanks)
    public float Saturation;
    public ushort Leftover;              // what is left after eating (a bowl)

    public float Fuel;                   // furnace seconds
    public readonly HashSet<string> Tags = new();

    public IconKind Icon = IconKind.Sprite;
    public int IconLayer = -1;           // texture layer for Flat icons (plants)
    public Color Tint = Colors.White;    // sprite palette hint

    public bool IsTool => Tool != ToolKind.None && Durability > 0;
    public bool IsFood => Food > 0;
    public bool Stackable => MaxStack > 1;
}

/// <summary>An amount of one item. Tools carry their wear in Damage and never stack.</summary>
public struct ItemStack : IEquatable<ItemStack>
{
    public ushort Id;
    public int Count;
    public int Wear;

    public ItemStack(ushort id, int count = 1, int wear = 0) { Id = id; Count = count; Wear = wear; }

    public static readonly ItemStack Empty = default;
    public bool IsEmpty => Id == 0 || Count <= 0;
    public ItemDef Def => Items.ById[Id];

    public bool CanStackWith(in ItemStack o) =>
        !IsEmpty && !o.IsEmpty && Id == o.Id && Wear == 0 && o.Wear == 0 && Def.MaxStack > 1;

    public ItemStack WithCount(int n) => n <= 0 ? Empty : new ItemStack(Id, n, Wear);

    public bool Equals(ItemStack o) => (IsEmpty && o.IsEmpty) || (Id == o.Id && Count == o.Count && Wear == o.Wear);
    public override bool Equals(object obj) => obj is ItemStack s && Equals(s);
    public override int GetHashCode() => IsEmpty ? 0 : HashCode.Combine(Id, Count, Wear);
    public override string ToString() => IsEmpty ? "(empty)" : $"{Def.Key} x{Count}" + (Wear > 0 ? $" wear {Wear}" : "");
}

/// <summary>
/// Every item. Blocks that can be held get an item with the same key, so a
/// dropped block and the block it places are one thing.
/// </summary>
public static class Items
{
    public static readonly List<ItemDef> All = new();
    public static ItemDef[] ById = Array.Empty<ItemDef>();
    public static readonly Dictionary<string, ushort> ByKey = new();
    public static readonly Dictionary<string, List<ushort>> ByTag = new();
    private static bool _ready;

    public static readonly string[] TierNames = { "Bare", "Wooden", "Stone", "Copper", "Iron", "Starmetal" };
    // Mining speed with the matching tool, by tier. Hand is 1.
    public static readonly float[] TierSpeed = { 1f, 2f, 4f, 5f, 6.5f, 9f };
    public static readonly int[] TierDurability = { 0, 60, 132, 220, 380, 1600 };
    public static readonly float[] TierBlade = { 1f, 4f, 5f, 6f, 7f, 9f };

    public static ushort None;
    public static ushort Stick, Fiber, Cord, Soot, Charcoal, Flint, ClayBall, Brick, Hide, Feather, Bone, Reed,
        LumenShard, CopperIngot, IronIngot, SilverIngot, GoldIngot, StarmetalIngot, Bowl,
        GrainSeeds, FrostleafSeeds, Grain, EmberrootItem, FrostleafItem, Berries,
        RawMossback, MossbackSteak, RawBrisket, SearedBrisket, RawKit, RoastKit, RawFowl, RoastFowl,
        RoastedEmberroot, HearthBread, BerryTart, MushroomStew, FrostleafStew, Umbercap, Blushcap,
        Furnace, Torch, Ladder, Door, SilverBlade, Spitgland;

    public static ItemDef Get(ushort id) => All[id];
    public static ushort Id(string key) => ByKey.TryGetValue(key, out var id) ? id : (ushort)0;

    public static void Init()
    {
        if (_ready) return;
        _ready = true;
        Blocks.Init();

        None = Add("none", "Nothing", d => { d.MaxStack = 0; });

        // --- blocks that are held as themselves -------------------------------
        foreach (var b in Blocks.All)
        {
            if (!HoldsAsItself(b)) continue;
            var bb = b;
            ushort id = Add(b.Key, b.Name, d =>
            {
                d.Place = b.Render == RenderKind.Cross ? PlaceKind.Plant : PlaceKind.Block;
                d.Block = bb.Id;
                d.Icon = bb.Render == RenderKind.Cube || bb.Render == RenderKind.Low ? IconKind.Cube : IconKind.Flat;
                d.IconLayer = bb.Tex[Dir.PZ];
                d.Tint = bb.Particle;
            });
            if (Blocks.IsLog(b.Id)) Tag(id, "logs");
        }
        foreach (var k in new[] { "elm_planks", "ironwood_planks", "pine_planks", "willow_planks" }) Tag(ByKey[k], "planks");
        foreach (var k in new[] { "cobblestone", "cobbled_slate", "mossy_cobblestone" }) Tag(ByKey[k], "cobble");
        foreach (var k in new[] { "elm_sapling", "ironwood_sapling", "pine_sapling", "willow_sapling" }) Tag(ByKey[k], "saplings");
        foreach (var k in new[] { "elm_leaves", "ironwood_leaves", "pine_leaves", "willow_leaves", "ember_leaves", "dry_leaves" }) Tag(ByKey[k], "leaves");
        Umbercap = ByKey["umbercap"];
        Blushcap = ByKey["blushcap"];

        // Blocks with a family of states place through a single item.
        Furnace = Add("furnace", "Furnace", d =>
        {
            d.Place = PlaceKind.Facing; d.Block = Blocks.Furnace; d.Icon = IconKind.Cube;
            d.IconLayer = Blocks.Get(Blocks.Furnace).Tex[Blocks.FacingDir[2]]; d.Info = "Smelts ore and cooks food. Needs fuel.";
        });
        Torch = Add("torch", "Torch", d =>
        {
            d.Place = PlaceKind.Torch; d.Block = Blocks.Torch; d.Icon = IconKind.Flat; d.IconLayer = Blocks.Get(Blocks.Torch).Tex[0];
            d.Info = "Light level 14. Stands on floors or walls.";
        });
        Ladder = Add("ladder", "Ladder", d =>
        {
            d.Place = PlaceKind.Ladder; d.Block = Blocks.Ladder; d.Icon = IconKind.Flat; d.IconLayer = Blocks.Get(Blocks.Ladder).Tex[0];
        });
        Door = Add("door", "Door", d =>
        {
            d.Place = PlaceKind.Door; d.Block = Blocks.Door; d.MaxStack = 16; d.Icon = IconKind.Sprite; d.Tint = new Color(0.55f, 0.4f, 0.25f);
            d.Info = "Right-click to open.";
        });

        // --- materials ---------------------------------------------------------
        Stick = Mat("stick", "Stick", 0.55f, 0.4f, 0.25f, fuel: 2.5f);
        Fiber = Mat("fiber", "Plant Fiber", 0.5f, 0.7f, 0.3f, fuel: 1f);
        Cord = Mat("cord", "Twisted Cord", 0.8f, 0.75f, 0.55f);
        Soot = Mat("soot", "Soot Lump", 0.12f, 0.12f, 0.13f, fuel: 80f, info: "Burns long and hot.");
        Charcoal = Mat("charcoal", "Charcoal", 0.18f, 0.16f, 0.15f, fuel: 80f);
        Flint = Mat("flint", "Flint", 0.3f, 0.3f, 0.33f);
        ClayBall = Mat("clay_ball", "Clay Lump", 0.62f, 0.64f, 0.7f);
        Brick = Mat("brick", "Fired Brick", 0.65f, 0.33f, 0.25f);
        Hide = Mat("hide", "Hide", 0.6f, 0.45f, 0.3f);
        Feather = Mat("feather", "Feather", 0.92f, 0.92f, 0.95f);
        Bone = Mat("bone", "Bone", 0.9f, 0.88f, 0.8f);
        Reed = Mat("reed", "Reed", 0.55f, 0.65f, 0.35f, fuel: 1.5f);
        LumenShard = Mat("lumen_shard", "Lumen Shard", 0.5f, 0.95f, 0.9f, info: "Holds light it never received.");
        CopperIngot = Mat("copper_ingot", "Copper Ingot", 0.85f, 0.52f, 0.33f);
        IronIngot = Mat("iron_ingot", "Iron Ingot", 0.8f, 0.8f, 0.82f);
        SilverIngot = Mat("silver_ingot", "Silver Ingot", 0.9f, 0.92f, 0.96f);
        GoldIngot = Mat("gold_ingot", "Gold Ingot", 1f, 0.84f, 0.3f);
        StarmetalIngot = Mat("starmetal_ingot", "Starmetal Ingot", 0.55f, 0.45f, 1f, info: "Heavier than it looks. Warm to the touch.");
        Bowl = Mat("bowl", "Wooden Bowl", 0.6f, 0.45f, 0.28f, fuel: 3f);
        Spitgland = Mat("spit_gland", "Spit Gland", 0.6f, 0.85f, 0.3f, info: "Drops from Thornspitters.");

        // --- seeds and produce -------------------------------------------------
        GrainSeeds = Add("grain_seeds", "Goldgrain Seeds", d =>
        {
            d.Place = PlaceKind.Seed; d.Block = Blocks.Grain; d.Tint = new Color(0.8f, 0.7f, 0.3f); d.Info = "Plant on tilled soil.";
        });
        FrostleafSeeds = Add("frostleaf_seeds", "Frostleaf Seeds", d =>
        {
            d.Place = PlaceKind.Seed; d.Block = Blocks.Frostleaf; d.Tint = new Color(0.55f, 0.75f, 0.9f); d.Info = "Plant on tilled soil.";
        });
        Grain = Mat("grain", "Goldgrain", 0.9f, 0.78f, 0.35f);
        EmberrootItem = Add("emberroot", "Emberroot", d =>
        {
            d.Place = PlaceKind.Seed; d.Block = Blocks.Emberroot; d.Food = 2; d.Saturation = 1.2f;
            d.Tint = new Color(0.85f, 0.35f, 0.15f); d.Info = "Edible raw. Plant on tilled soil.";
        });
        FrostleafItem = Food("frostleaf", "Frostleaf", 1, 0.6f, 0.6f, 0.85f, 0.95f);
        Berries = Food("berries", "Duskberries", 2, 1.2f, 0.45f, 0.2f, 0.55f);

        RawMossback = Food("raw_mossback", "Raw Mossback", 3, 1.8f, 0.8f, 0.35f, 0.35f);
        MossbackSteak = Food("mossback_steak", "Mossback Steak", 8, 12.8f, 0.55f, 0.3f, 0.18f);
        RawBrisket = Food("raw_brisket", "Raw Brisket", 3, 1.8f, 0.85f, 0.4f, 0.42f);
        SearedBrisket = Food("seared_brisket", "Seared Brisket", 8, 12.8f, 0.6f, 0.35f, 0.2f);
        RawKit = Food("raw_kit", "Raw Kit Meat", 2, 1.2f, 0.85f, 0.5f, 0.5f);
        RoastKit = Food("roast_kit", "Roast Kit", 5, 6f, 0.62f, 0.4f, 0.25f);
        RawFowl = Food("raw_fowl", "Raw Fowl", 2, 1.2f, 0.95f, 0.75f, 0.7f);
        RoastFowl = Food("roast_fowl", "Roast Fowl", 6, 7.2f, 0.75f, 0.5f, 0.25f);
        RoastedEmberroot = Food("roasted_emberroot", "Roasted Emberroot", 6, 7.2f, 0.7f, 0.3f, 0.1f);
        HearthBread = Food("hearth_bread", "Hearth Bread", 5, 6f, 0.8f, 0.6f, 0.3f);
        BerryTart = Food("berry_tart", "Duskberry Tart", 7, 8f, 0.6f, 0.25f, 0.5f);
        MushroomStew = Food("mushroom_stew", "Cap Stew", 6, 7.2f, 0.6f, 0.45f, 0.35f);
        FrostleafStew = Food("frostleaf_stew", "Frostleaf Stew", 8, 9.6f, 0.55f, 0.75f, 0.8f);
        Get(MushroomStew).MaxStack = 1; Get(MushroomStew).Leftover = Bowl;
        Get(FrostleafStew).MaxStack = 1; Get(FrostleafStew).Leftover = Bowl;
        Get(Umbercap).Food = 1; Get(Umbercap).Saturation = 0.6f;

        // --- tools -------------------------------------------------------------
        string[] tierKey = { "", "wooden", "stone", "copper", "iron", "starmetal" };
        Color[] tierColor =
        {
            Colors.White, new(0.62f, 0.46f, 0.28f), new(0.5f, 0.5f, 0.52f), new(0.85f, 0.52f, 0.33f),
            new(0.82f, 0.82f, 0.85f), new(0.55f, 0.45f, 1f),
        };
        for (int t = 1; t <= 5; t++)
        {
            int tt = t;
            string tn = TierNames[t];
            Tool(tierKey[t] + "_pick", tn + " Pick", ToolKind.Pick, t, tierColor[t], TierBlade[t] - 2f, 0.85f);
            Tool(tierKey[t] + "_axe", tn + " Axe", ToolKind.Axe, t, tierColor[t], TierBlade[t] - 0.5f, 1.05f);
            Tool(tierKey[t] + "_shovel", tn + " Shovel", ToolKind.Shovel, t, tierColor[t], TierBlade[t] - 2.5f, 0.8f);
            Tool(tierKey[t] + "_hoe", tn + " Hoe", ToolKind.Hoe, t, tierColor[t], 1f, 0.5f);
            Tool(tierKey[t] + "_blade", tn + " Blade", ToolKind.Blade, t, tierColor[t], TierBlade[t], 0.6f);
            if (t == 1) foreach (var k in new[] { "_pick", "_axe", "_shovel", "_hoe", "_blade" }) Get(ByKey[tierKey[t] + k]).Fuel = 10f;
        }
        SilverBlade = Tool("silver_blade", "Silver Blade", ToolKind.Blade, 4, new Color(0.9f, 0.92f, 0.96f), 6f, 0.55f);
        Get(SilverBlade).NightBonus = 2f;
        Get(SilverBlade).Durability = 300;
        Get(SilverBlade).Info = "Twice as hard on things that walk at night.";

        // Fuel values for placeable wood.
        foreach (var d in All)
        {
            if (d.Tags.Contains("logs") || d.Tags.Contains("planks")) d.Fuel = 15f;
            if (d.Tags.Contains("saplings")) d.Fuel = 5f;
        }
        Get(ByKey["worktable"]).Fuel = 15f;
        Get(ByKey["crate"]).Fuel = 15f;
        Get(Ladder).Fuel = 5f;
        Get(ByKey["dead_bush"]).Fuel = 2f;

        ById = All.ToArray();
        Blocks.LinkItems();
    }

    private static bool HoldsAsItself(BlockDef b)
    {
        if (b.Id == Blocks.Air || b.Liquid || b.Id == Blocks.Rootstone) return false;
        if (b.CropStages > 0 || b.IsLit) return false;
        if (b.Use == BlockUse.Furnace || b.Use == BlockUse.Door) return false;
        if (b.Render == RenderKind.Torch || b.Render == RenderKind.Ladder) return false;
        if (b.Id == Blocks.BerryBushBare || b.Id == Blocks.TilledSoil) return false;
        return true;
    }

    private static ushort Add(string key, string name, Action<ItemDef> cfg)
    {
        if (ByKey.ContainsKey(key)) throw new InvalidOperationException("duplicate item " + key);
        var d = new ItemDef { Id = (ushort)All.Count, Key = key, Name = name };
        cfg(d);
        All.Add(d);
        ByKey[key] = d.Id;
        return d.Id;
    }

    private static void Tag(ushort id, string tag)
    {
        All[id].Tags.Add(tag);
        if (!ByTag.TryGetValue(tag, out var list)) ByTag[tag] = list = new List<ushort>();
        list.Add(id);
    }

    private static ushort Mat(string key, string name, float r, float g, float b, float fuel = 0f, string info = null) =>
        Add(key, name, d => { d.Tint = new Color(r, g, b); d.Fuel = fuel; d.Info = info; });

    private static ushort Food(string key, string name, int food, float sat, float r, float g, float b) =>
        Add(key, name, d => { d.Food = food; d.Saturation = sat; d.Tint = new Color(r, g, b); });

    private static ushort Tool(string key, string name, ToolKind kind, int tier, Color c, float damage, float cooldown) =>
        Add(key, name, d =>
        {
            d.Tool = kind; d.Tier = tier; d.Durability = TierDurability[tier]; d.MaxStack = 1;
            d.Damage = Math.Max(1f, damage); d.Cooldown = cooldown; d.Speed = TierSpeed[tier]; d.Tint = c;
        });

    public static bool HasTag(ushort id, string tag) => id != 0 && ById[id].Tags.Contains(tag);

    /// <summary>
    /// Seconds to break a block with an item in hand, and whether it drops.
    /// The right tool of a high enough tier is fast and yields the block; the
    /// wrong tool is slow, and too low a tier is slower still and yields nothing.
    /// </summary>
    public static (float seconds, bool harvest) BreakTime(BlockDef b, ItemDef held)
    {
        if (!b.Breakable) return (float.PositiveInfinity, false);
        if (b.Hardness <= 0f) return (0f, true);
        bool rightTool = held != null && b.Tool != ToolKind.None && held.Tool == b.Tool;
        int tier = rightTool ? held.Tier : 0;
        bool harvest = b.MinTier == 0 || (rightTool && tier >= b.MinTier);
        float speed = rightTool ? TierSpeed[Math.Clamp(held.Tier, 0, 5)] : 1f;
        if (held != null && held.Tool == ToolKind.Blade && b.CullGroup == 1) speed = 3f; // blades cut foliage
        float t = b.Hardness * (harvest ? 1.5f : 5f) / speed;
        return (t, harvest);
    }
}
