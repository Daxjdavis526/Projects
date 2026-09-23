using System;
using System.Collections.Generic;

namespace Strata;

public enum Station : byte { Hand, Worktable }

/// <summary>One input line of a recipe: either a specific item or any item carrying a tag.</summary>
public readonly struct Ingredient
{
    public readonly ushort Item;
    public readonly string Tag;
    public readonly int Count;
    public Ingredient(ushort item, int count) { Item = item; Tag = null; Count = count; }
    public Ingredient(string tag, int count) { Item = 0; Tag = tag; Count = count; }
    public bool Matches(ushort id) => Tag != null ? Items.HasTag(id, Tag) : id == Item;
    public string Label => Tag != null ? "any " + Tag.Replace('_', ' ') : Items.Get(Item).Name;
}

public sealed class Recipe
{
    public int Index;
    public ItemStack Output;
    public Ingredient[] In;
    public Station Station;
    public string Group;       // sorting bucket for the recipe book
}

/// <summary>
/// Crafting is recipe-book style: every recipe is data, the book shows what
/// your inventory can make right now, and a click makes it. No shape to learn.
/// </summary>
public static class Recipes
{
    public static readonly List<Recipe> All = new();
    private static bool _ready;

    public static void Init()
    {
        if (_ready) return;
        _ready = true;
        Items.Init();
        ushort I(string k) => Items.ByKey.TryGetValue(k, out var id) ? id : throw new KeyNotFoundException("recipe item " + k);

        // --- by hand ---------------------------------------------------------------
        foreach (var w in new[] { "elm", "ironwood", "pine", "willow" })
            Add(Station.Hand, "basics", I(w + "_planks"), 4, (I(w + "_log"), 1));
        Add(Station.Hand, "basics", Items.Stick, 4, ("planks", 2));
        Add(Station.Hand, "basics", I("worktable"), 1, ("planks", 4));
        Add(Station.Hand, "basics", Items.Cord, 1, (Items.Fiber, 3));
        Add(Station.Hand, "basics", Items.Torch, 4, (Items.Stick, 1), (Items.Soot, 1));
        Add(Station.Hand, "basics", Items.Torch, 4, (Items.Stick, 1), (Items.Charcoal, 1));
        Add(Station.Hand, "basics", Items.Torch, 6, (Items.Stick, 1), (Items.LumenShard, 1));

        // --- tools at the worktable --------------------------------------------
        (string key, object head)[] tiers =
        {
            ("wooden", "planks"), ("stone", "cobble"), ("copper", Items.CopperIngot), ("iron", Items.IronIngot),
            ("starmetal", Items.StarmetalIngot),
        };
        foreach (var (key, head) in tiers)
        {
            ToolRecipe(I(key + "_pick"), head, 3, 2);
            ToolRecipe(I(key + "_axe"), head, 3, 2);
            ToolRecipe(I(key + "_shovel"), head, 1, 2);
            ToolRecipe(I(key + "_hoe"), head, 2, 2);
            ToolRecipe(I(key + "_blade"), head, 2, 1);
        }
        Add(Station.Worktable, "tools", Items.SilverBlade, 1, (Items.SilverIngot, 2), (Items.Stick, 1), (Items.Cord, 1));

        // --- stations and furniture --------------------------------------------
        Add(Station.Worktable, "stations", Items.Furnace, 1, ("cobble", 8));
        Add(Station.Worktable, "stations", I("crate"), 1, ("planks", 8));
        Add(Station.Worktable, "stations", Items.Door, 1, ("planks", 6));
        Add(Station.Worktable, "stations", Items.Ladder, 3, (Items.Stick, 7));
        Add(Station.Worktable, "stations", I("bedroll"), 1, (Items.Hide, 3), ("planks", 3), (Items.Fiber, 3));
        Add(Station.Worktable, "stations", Items.Bowl, 4, ("planks", 3));

        // --- building ----------------------------------------------------------
        Add(Station.Worktable, "building", I("stone_bricks"), 4, (I("stone"), 4));
        Add(Station.Worktable, "building", I("carved_stone"), 1, (I("stone_bricks"), 2));
        Add(Station.Worktable, "building", I("clay_bricks"), 1, (Items.Brick, 4));
        Add(Station.Worktable, "building", I("ash_bricks"), 4, (I("ashstone"), 4));
        Add(Station.Worktable, "building", I("dressed_sandstone"), 4, (I("sandstone"), 4));
        Add(Station.Worktable, "building", I("sandstone"), 1, (I("sand"), 4));
        Add(Station.Worktable, "building", I("slate_tiles"), 4, (I("slatestone"), 4));
        Add(Station.Worktable, "building", I("thatch"), 2, (Items.Reed, 4));
        Add(Station.Worktable, "building", I("thatch"), 1, (Items.Fiber, 6));
        Add(Station.Worktable, "building", I("mossy_cobblestone"), 1, (I("cobblestone"), 1), (Items.Fiber, 1));
        Add(Station.Worktable, "building", I("lumen_block"), 1, (Items.LumenShard, 4));
        Add(Station.Worktable, "building", I("lumen_lamp"), 1, (I("glass"), 1), (Items.LumenShard, 2), (Items.GoldIngot, 1));

        foreach (var (block, ingot) in new[]
        {
            ("copper_block", Items.CopperIngot), ("iron_block", Items.IronIngot), ("silver_block", Items.SilverIngot),
            ("gold_block", Items.GoldIngot), ("starmetal_block", Items.StarmetalIngot),
        })
        {
            Add(Station.Worktable, "building", I(block), 1, (ingot, 9));
            Add(Station.Hand, "basics", ingot, 9, (I(block), 1));
        }

        // --- food ----------------------------------------------------------------
        Add(Station.Worktable, "food", Items.HearthBread, 1, (Items.Grain, 3));
        Add(Station.Worktable, "food", Items.BerryTart, 1, (Items.Grain, 2), (Items.Berries, 3));
        Add(Station.Hand, "food", Items.MushroomStew, 1, (Items.Bowl, 1), (Items.Umbercap, 1), (Items.Blushcap, 1));
        Add(Station.Hand, "food", Items.FrostleafStew, 1, (Items.Bowl, 1), (Items.FrostleafItem, 2), (Items.Umbercap, 1));

        for (int i = 0; i < All.Count; i++) All[i].Index = i;

        Smelting.Init();
    }

    private static void ToolRecipe(ushort tool, object head, int headCount, int sticks)
    {
        var headIng = head is string tag ? new Ingredient(tag, headCount) : new Ingredient((ushort)head, headCount);
        var r = new Recipe
        {
            Output = new ItemStack(tool, 1),
            In = new[] { headIng, new Ingredient(Items.Stick, sticks) },
            Station = Station.Worktable,
            Group = "tools",
        };
        All.Add(r);
    }

    private static void Add(Station st, string group, ushort output, int count, params object[] ins)
    {
        var list = new List<Ingredient>();
        foreach (var o in ins)
        {
            switch (o)
            {
                case ValueTuple<ushort, int> t: list.Add(new Ingredient(t.Item1, t.Item2)); break;
                case ValueTuple<string, int> t: list.Add(new Ingredient(t.Item1, t.Item2)); break;
                default: throw new ArgumentException("bad ingredient " + o);
            }
        }
        All.Add(new Recipe { Output = new ItemStack(output, count), In = list.ToArray(), Station = st, Group = group });
    }

    /// <summary>How many times this recipe could be made from the inventory right now.</summary>
    public static int Craftable(Inventory inv, Recipe r)
    {
        int best = int.MaxValue;
        foreach (var ing in r.In)
        {
            int have = inv.CountMatching(ing);
            best = Math.Min(best, have / ing.Count);
            if (best == 0) return 0;
        }
        return best == int.MaxValue ? 0 : best;
    }

    public static bool Available(Recipe r, bool atWorktable) => r.Station == Station.Hand || atWorktable;

    /// <summary>
    /// Makes one batch: removes the inputs and returns the output. Fails without
    /// touching the inventory if anything is missing.
    /// </summary>
    public static bool TryCraft(Inventory inv, Recipe r, out ItemStack output)
    {
        output = ItemStack.Empty;
        if (Craftable(inv, r) < 1) return false;
        foreach (var ing in r.In) inv.RemoveMatching(ing, ing.Count);
        output = r.Output;
        return true;
    }
}

/// <summary>Furnace recipes: one input item becomes one output.</summary>
public static class Smelting
{
    public static readonly Dictionary<ushort, (ushort output, int count, float seconds)> Table = new();
    public const float DefaultSeconds = 6f;

    public static void Init()
    {
        if (Table.Count > 0) return;
        ushort I(string k) => Items.ByKey[k];
        Add(I("copper_ore"), Items.CopperIngot);
        Add(I("iron_ore"), Items.IronIngot);
        Add(I("silver_ore"), Items.SilverIngot);
        Add(I("gold_ore"), Items.GoldIngot);
        Add(I("starmetal_ore"), Items.StarmetalIngot, 1, 12f);
        Add(I("sand"), I("glass"));
        Add(I("clay_ball"), Items.Brick);
        Add(I("cobblestone"), I("stone"));
        Add(I("cobbled_slate"), I("slatestone"));
        Add(I("mud"), I("clay"));
        foreach (var w in new[] { "elm", "ironwood", "pine", "willow" }) Add(I(w + "_log"), Items.Charcoal);
        Add(Items.RawMossback, Items.MossbackSteak);
        Add(Items.RawBrisket, Items.SearedBrisket);
        Add(Items.RawKit, Items.RoastKit);
        Add(Items.RawFowl, Items.RoastFowl);
        Add(Items.EmberrootItem, Items.RoastedEmberroot);
    }

    private static void Add(ushort input, ushort output, int count = 1, float seconds = DefaultSeconds) =>
        Table[input] = (output, count, seconds);

    public static bool Has(ushort input) => Table.ContainsKey(input);
}
