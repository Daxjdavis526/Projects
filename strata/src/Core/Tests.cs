using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using Godot;

namespace Strata;

/// <summary>
/// Headless unit tests for the parts that must never be wrong: coordinates,
/// storage, generation determinism, saving, inventory and crafting rules,
/// ray casts, light, collision and survival. Run with
/// godot --headless --path strata -- --test
/// </summary>
public static class Tests
{
    private static int _pass, _fail;
    private static readonly List<string> _failures = new();

    private static void Check(bool ok, string what)
    {
        if (ok) _pass++;
        else { _fail++; _failures.Add(what); GD.PrintErr("  FAIL " + what); }
    }

    private static void Test(string name, Action body)
    {
        var sw = Stopwatch.StartNew();
        int before = _fail;
        try { body(); }
        catch (Exception e) { _fail++; _failures.Add($"{name}: threw {e}"); GD.PrintErr($"  FAIL {name}: {e}"); }
        GD.Print($"{(_fail == before ? "ok  " : "FAIL")} {name} ({sw.ElapsedMilliseconds} ms)");
    }

    public static int RunAll()
    {
        Registry.Init(graphics: false);
        GD.Print("STRATA unit tests");
        Test("coordinates and chunk keys", Coordinates);
        Test("column storage bookkeeping", Storage);
        Test("seeds are repeatable", Seeds);
        Test("generation is deterministic and order-free", Determinism);
        Test("worldgen produces terrain, caves, ores, plants", WorldgenSanity);
        Test("column save round trip", ChunkRoundTrip);
        Test("world metadata save round trip", MetaRoundTrip);
        Test("inventory stacking", InventoryStacking);
        Test("cursor clicks", CursorClicks);
        Test("crafting consumes exactly", Crafting);
        Test("furnace smelting", Furnace);
        Test("break times and harvest rules", BreakRules);
        Test("voxel ray cast", Raycast);
        Test("incremental light matches full light", LightConsistency);
        Test("collision: landing, walls, speed, steps", Collision);
        Test("survival: damage, healing, breath, food", Survival);
        Test("greedy mesher merges and culls", Meshing);
        Test("loot tables fill crates", LootFill);
        GD.Print($"\n{_pass} checks passed, {_fail} failed");
        foreach (var f in _failures) GD.Print("  - " + f);
        return _fail;
    }

    // --- helpers -------------------------------------------------------------------------

    /// <summary>A world of real generated columns over a square, lit and marked ready.</summary>
    public static World Generated(long seed, int cx0, int cz0, int size)
    {
        var w = new World(seed);
        for (int z = cz0 - 1; z <= cz0 + size; z++)
            for (int x = cx0 - 1; x <= cx0 + size; x++)
            {
                var c = new Chunk(x, z);
                w.Gen.Generate(c);
                c.State = ChunkState.Generated;
                w.Chunks[c.Key] = c;
            }
        LightAll(w);
        return w;
    }

    /// <summary>A flat world: rootstone at 0, stone to 63, grass at 64, air above.</summary>
    public static World Flat(int cx0, int cz0, int size, int top = 64)
    {
        var w = new World(1);
        for (int z = cz0 - 1; z <= cz0 + size; z++)
            for (int x = cx0 - 1; x <= cx0 + size; x++)
            {
                var c = new Chunk(x, z);
                for (int y = 0; y <= top; y++)
                    for (int lz = 0; lz < 16; lz++)
                        for (int lx = 0; lx < 16; lx++)
                            c.Blocks[V.Index(lx, y, lz)] = y == 0 ? Blocks.Rootstone : y == top ? Blocks.Grass : Blocks.Stone;
                c.Recount();
                c.State = ChunkState.Generated;
                w.Chunks[c.Key] = c;
            }
        LightAll(w);
        return w;
    }

    public static void LightAll(World w)
    {
        var lit = new List<(Chunk, byte[])>();
        foreach (var c in w.Chunks.Values)
        {
            var n = w.Neighbourhood(c.X, c.Z, ChunkState.Generated);
            if (n == null) continue;
            lit.Add((c, Lighting.ComputeColumn(n)));
        }
        foreach (var (c, l) in lit) { c.Light = l; c.State = ChunkState.Meshed; }
        w.InvalidateCache();
    }

    // --- tests ---------------------------------------------------------------------------

    private static void Coordinates()
    {
        Check(V.ChunkOf(0) == 0 && V.ChunkOf(15) == 0 && V.ChunkOf(16) == 1, "positive chunk of");
        Check(V.ChunkOf(-1) == -1 && V.Local(-1) == 15, "-1 -> chunk -1 local 15");
        Check(V.ChunkOf(-16) == -1 && V.Local(-16) == 0, "-16 -> chunk -1 local 0");
        Check(V.ChunkOf(-17) == -2 && V.Local(-17) == 15, "-17 -> chunk -2 local 15");
        foreach (var (x, z) in new[] { (0, 0), (-1, 5), (7, -9), (int.MaxValue >> 5, int.MinValue >> 5), (-30000, 30000) })
        {
            long k = V.Key(x, z);
            Check(V.KeyX(k) == x && V.KeyZ(k) == z, $"key round trip {x},{z}");
        }
        Check(V.Key(1, 2) != V.Key(2, 1), "keys distinguish axes");
        Check(V.FloorToInt(-0.5f) == -1 && V.FloorToInt(-1.0) == -1 && V.FloorToInt(2.9) == 2, "floor to int");
    }

    private static void Storage()
    {
        var seen = new HashSet<int>();
        for (int y = 0; y < 256; y += 37) for (int z = 0; z < 16; z += 5) for (int x = 0; x < 16; x += 3) Check(seen.Add(V.Index(x, y, z)), $"index unique {x},{y},{z}");
        Check(V.Index(15, 255, 15) == V.ColumnVolume - 1, "last index");
        var c = new Chunk(0, 0);
        c.SetRaw(3, 70, 4, Blocks.Stone);
        Check(c.SectionCount[70 >> 4] == 1, "section count up");
        Check(c.TopY == 70, "top follows");
        Check(c.Height[(4 << 4) | 3] == 71, "heightmap is top + 1");
        c.SetRaw(3, 70, 4, Blocks.Air);
        Check(c.SectionCount[70 >> 4] == 0, "section count down");
        Check(c.Height[(4 << 4) | 3] == 0, "heightmap falls back");
        c.SetRaw(3, 10, 4, Blocks.TallGrass);
        Check(c.Height[(4 << 4) | 3] == 0, "plants do not block the sky");
        c.SetRaw(3, 12, 4, Blocks.ElmLeaves);
        Check(c.Height[(4 << 4) | 3] == 13, "leaves do");
    }

    private static void Seeds()
    {
        Check(Hash.StringSeed("12345") == 12345, "numeric seed parses");
        Check(Hash.StringSeed("glacier") == Hash.StringSeed("glacier"), "text seed stable");
        Check(Hash.StringSeed("glacier") != Hash.StringSeed("Glacier"), "text seed case-sensitive");
        Check(Hash.StringSeed("  glacier ") == Hash.StringSeed("glacier"), "text seed trims");
        var a = new Simplex(7); var b = new Simplex(7); var c = new Simplex(8);
        Check(a.Noise2(12.3, -4.5) == b.Noise2(12.3, -4.5), "noise repeatable");
        Check(a.Noise2(12.3, -4.5) != c.Noise2(12.3, -4.5), "noise differs by seed");
    }

    private static void Determinism()
    {
        var g1 = new WorldGen(424242);
        var g2 = new WorldGen(424242);
        var g3 = new WorldGen(424243);
        var a = new Chunk(3, -2); g1.Generate(a);
        // Generate other columns first on the second generator: order must not matter.
        var tmp = new Chunk(-7, 11); g2.Generate(tmp);
        var b = new Chunk(3, -2); g2.Generate(b);
        var c = new Chunk(3, -2); g3.Generate(c);
        bool same = true;
        for (int i = 0; i < V.ColumnVolume; i++) if (a.Blocks[i] != b.Blocks[i]) { same = false; break; }
        Check(same, "same seed, same column");
        int diff = 0;
        for (int i = 0; i < V.ColumnVolume; i++) if (a.Blocks[i] != c.Blocks[i]) diff++;
        Check(diff > 1000, $"different seed, different column ({diff} cells differ)");
        Check(a.Entities.Count == b.Entities.Count, "same structures");
        // Spawn search is repeatable.
        Check(g1.FindSpawn() == g2.FindSpawn(), "spawn repeatable");
    }

    private static void WorldgenSanity()
    {
        var gen = new WorldGen(98765);
        int ores = 0, air = 0, water = 0, plants = 0, logs = 0, lumen = 0, caveAir = 0;
        for (int cz = 0; cz < 4; cz++)
            for (int cx = 0; cx < 4; cx++)
            {
                var c = new Chunk(cx, cz);
                gen.Generate(c);
                for (int y = 0; y < 256; y++)
                    for (int z = 0; z < 16; z++)
                        for (int x = 0; x < 16; x++)
                        {
                            ushort b = c.Blocks[V.Index(x, y, z)];
                            if (b == Blocks.CopperOre || b == Blocks.IronOre || b == Blocks.SootOre || b == Blocks.GoldOre || b == Blocks.SilverOre) ores++;
                            if (b == Blocks.LumenOre) lumen++;
                            if (b == 0) { air++; if (y < 40) caveAir++; }
                            if (b == Blocks.Water) water++;
                            if (Blocks.Get(b).Render == RenderKind.Cross) plants++;
                            if (Blocks.IsLog(b)) logs++;
                        }
                Check(c.Blocks[V.Index(5, 0, 5)] == Blocks.Rootstone, "rootstone floor");
            }
        Check(ores > 50, $"ores present ({ores})");
        Check(caveAir > 200, $"caves carved below 40 ({caveAir})");
        Check(air > 100000, "open air above ground");
        GD.Print($"    16 columns: ores {ores}, lumen {lumen}, cave air {caveAir}, water {water}, plants {plants}, logs {logs}");
        var (sx, sy, sz) = gen.FindSpawn();
        var col = gen.Sample(sx, sz);
        Check(sy > V.SeaLevel && col.Biome != Biome.Sea && col.Biome != Biome.DeepSea, $"spawn on dry land ({sx},{sy},{sz} {col.Biome})");
    }

    private static void ChunkRoundTrip()
    {
        var gen = new WorldGen(5);
        var c = new Chunk(-4, 9);
        gen.Generate(c);
        int idx = V.Index(2, 80, 3);
        var crate = new CrateEntity();
        crate.Inv[4] = new ItemStack(Items.IronIngot, 17);
        crate.Inv[20] = new ItemStack(Items.Get(Items.ByKey["copper_pick"]).Id, 1, 33);
        c.Entities[idx] = crate;
        var f = new FurnaceEntity { Burn = 12.5f, BurnMax = 80f, Cook = 2f };
        f.Inv[FurnaceEntity.In] = new ItemStack(Items.ByKey["iron_ore"], 5);
        c.Entities[V.Index(5, 81, 5)] = f;
        var data = c.Serialize();
        var d = Chunk.Deserialize(data);
        bool same = d.X == c.X && d.Z == c.Z;
        for (int i = 0; i < V.ColumnVolume && same; i++) same = c.Blocks[i] == d.Blocks[i];
        Check(same, "blocks survive a round trip");
        Check(d.Entities.TryGetValue(idx, out var e) && e is CrateEntity dc && dc.Inv[4].Equals(crate.Inv[4]) && dc.Inv[20].Wear == 33, "crate contents survive");
        Check(d.Entities.TryGetValue(V.Index(5, 81, 5), out var e2) && e2 is FurnaceEntity df && Math.Abs(df.Burn - 12.5f) < 1e-4 && df.Inv[0].Count == 5, "furnace state survives");
        Check(data.Length < 40000, $"compressed column is small ({data.Length} bytes)");
        // Corrupt data fails loudly rather than loading garbage.
        var bad = (byte[])data.Clone();
        for (int i = 20; i < bad.Length; i += 7) bad[i] ^= 0x5A;
        bool threw = false;
        try { Chunk.Deserialize(bad); } catch { threw = true; }
        Check(threw, "corrupt column is rejected");
    }

    private static void MetaRoundTrip()
    {
        var m = WorldSave.Create("unit test world " + Guid.NewGuid().ToString("N")[..6], "tests");
        try
        {
            m.Player.X = 12.5; m.Player.Y = 70; m.Player.Z = -3.25; m.HasPlayer = true;
            m.Player.Inventory.Add(new SlotSave { Slot = 3, Item = "torch", Count = 12 });
            m.Drops.Add(new DropSave { Item = "stick", Count = 2, X = 1, Y = 2, Z = 3, Age = 5 });
            m.Time = 3.7;
            WorldSave.Write(m);
            var back = WorldSave.TryLoad(m.Folder);
            Check(back != null && back.Seed == Hash.StringSeed("tests"), "seed persisted");
            Check(back.HasPlayer && Math.Abs(back.Player.Z + 3.25) < 1e-9 && back.Player.Inventory.Count == 1 && back.Player.Inventory[0].Count == 12, "player persisted");
            Check(back.Drops.Count == 1 && back.Drops[0].Item == "stick", "drops persisted");
            Check(Math.Abs(back.Time - 3.7) < 1e-9, "clock persisted");
            // A damaged world.json falls back to the backup.
            WorldSave.Write(m);
            File.WriteAllText(Path.Combine(WorldSave.DirOf(m.Folder), "world.json"), "{ not json");
            var rescued = WorldSave.TryLoad(m.Folder);
            Check(rescued != null && rescued.HasPlayer, "backup used when the main file is corrupt");
            var inv = new Inventory(36);
            WorldSave.LoadInventory(inv, back.Player.Inventory);
            Check(inv[3].Id == Items.Torch && inv[3].Count == 12, "inventory restored");
        }
        finally { WorldSave.Delete(m.Folder); }
        Check(!Directory.Exists(WorldSave.DirOf(m.Folder)), "delete removes the folder");
    }

    private static void InventoryStacking()
    {
        var inv = new Inventory(4);
        var left = inv.Add(new ItemStack(Items.Stick, 100));
        Check(left.IsEmpty && inv[0].Count == 64 && inv[1].Count == 36, "overflow into next slot");
        left = inv.Add(new ItemStack(Items.Stick, 30));
        Check(inv[1].Count == 64 && inv[2].Count == 2, "merge before empty");
        var pick = Items.ByKey["wooden_pick"];
        left = inv.Add(new ItemStack(pick, 1));
        Check(left.IsEmpty && inv[3].Id == pick, "tools take their own slot");
        left = inv.Add(new ItemStack(pick, 1));
        Check(!left.IsEmpty && left.Count == 1, "no room returns the rest");
        Check(inv.Count(Items.Stick) == 130, "count");
        Check(inv.Remove(Items.Stick, 70) == 70 && inv.Count(Items.Stick) == 60, "remove");
        Check(inv.CanFit(new ItemStack(Items.Stick, 60)), "can fit merges");
        Check(!inv.CanFit(new ItemStack(Items.Soot, 200)), "cannot fit");
        var worn = new ItemStack(pick, 1, 5);
        Check(!worn.CanStackWith(new ItemStack(pick, 1, 5)), "worn tools never stack");
    }

    private static void CursorClicks()
    {
        var cur = ItemStack.Empty;
        var slot = new ItemStack(Items.Stick, 10);
        SlotOps.LeftClick(ref cur, ref slot);
        Check(cur.Count == 10 && slot.IsEmpty, "left takes all");
        SlotOps.RightClick(ref cur, ref slot);
        Check(cur.Count == 9 && slot.Count == 1, "right places one");
        SlotOps.LeftClick(ref cur, ref slot);
        Check(cur.IsEmpty && slot.Count == 10, "left merges");
        SlotOps.RightClick(ref cur, ref slot);
        Check(cur.Count == 5 && slot.Count == 5, "right splits half");
        var other = new ItemStack(Items.Soot, 3);
        SlotOps.LeftClick(ref cur, ref other);
        Check(cur.Id == Items.Soot && other.Id == Items.Stick, "left swaps different items");
        var full = new ItemStack(Items.Stick, 64);
        var c2 = new ItemStack(Items.Stick, 10);
        SlotOps.LeftClick(ref c2, ref full);
        Check(full.Count == 64 && c2.Count == 10, "merge respects the stack limit");
        var odd = new ItemStack(Items.Stick, 7);
        var c3 = ItemStack.Empty;
        SlotOps.RightClick(ref c3, ref odd);
        Check(c3.Count == 4 && odd.Count == 3, "split rounds up to the cursor");
    }

    private static void Crafting()
    {
        var inv = new Inventory(36);
        inv.Add(new ItemStack(Items.ByKey["pine_log"], 2));
        Recipe planks = null, sticks = null, table = null, pick = null;
        foreach (var r in Recipes.All)
        {
            if (r.Output.Id == Items.ByKey["pine_planks"]) planks = r;
            if (r.Output.Id == Items.Stick) sticks = r;
            if (r.Output.Id == Items.ByKey["worktable"]) table = r;
            if (r.Output.Id == Items.ByKey["wooden_pick"]) pick = r;
        }
        Check(Recipes.Craftable(inv, planks) == 2, "two logs, two batches of planks");
        Check(Recipes.TryCraft(inv, planks, out var o) && o.Count == 4, "planks made");
        inv.Add(o);
        Check(inv.Count(Items.ByKey["pine_log"]) == 1, "one log used");
        Check(Recipes.TryCraft(inv, table, out var t), "worktable from any planks");
        inv.Add(t);
        Check(inv.Count(Items.ByKey["pine_planks"]) == 0, "planks used by the tag recipe");
        Check(!Recipes.TryCraft(inv, sticks, out _), "no planks, no sticks");
        Check(inv.Count(Items.ByKey["pine_log"]) == 1 && inv.Count(Items.ByKey["worktable"]) == 1, "failed craft changes nothing");
        Check(!Recipes.Available(pick, atWorktable: false) && Recipes.Available(pick, atWorktable: true), "tools need a worktable");
        int tools = 0;
        foreach (var r in Recipes.All) if (r.Output.Def.IsTool) tools++;
        Check(tools >= 25, $"every tier has its tools ({tools})");
        // Every ingredient resolves to something that exists.
        foreach (var r in Recipes.All)
            foreach (var ing in r.In)
                Check(ing.Tag != null ? Items.ByTag.ContainsKey(ing.Tag) : ing.Item != 0, $"recipe for {r.Output.Def.Key} has a real ingredient");
    }

    private static void Furnace()
    {
        var f = new FurnaceEntity();
        f.Inv[FurnaceEntity.FuelSlot] = new ItemStack(Items.Soot, 2);
        f.Tick(5f);
        Check(f.Burn == 0f && f.Inv[FurnaceEntity.FuelSlot].Count == 2, "no fuel burnt with nothing to cook");
        f.Inv[FurnaceEntity.In] = new ItemStack(Items.ByKey["iron_ore"], 3);
        for (int i = 0; i < 70; i++) f.Tick(0.1f);
        Check(f.Inv[FurnaceEntity.Out].Id == Items.IronIngot && f.Inv[FurnaceEntity.Out].Count == 1, "one ingot after one cook time");
        Check(f.Inv[FurnaceEntity.FuelSlot].Count == 1, "one soot lit");
        for (int i = 0; i < 200; i++) f.Tick(0.1f);
        Check(f.Inv[FurnaceEntity.Out].Count == 3 && f.Inv[FurnaceEntity.In].IsEmpty, "all three smelted");
        // Output full of something else: it stops.
        var g = new FurnaceEntity();
        g.Inv[FurnaceEntity.In] = new ItemStack(Items.ByKey["sand"], 1);
        g.Inv[FurnaceEntity.Out] = new ItemStack(Items.Stick, 64);
        g.Inv[FurnaceEntity.FuelSlot] = new ItemStack(Items.Soot, 1);
        for (int i = 0; i < 100; i++) g.Tick(0.1f);
        Check(g.Inv[FurnaceEntity.In].Count == 1 && g.Inv[FurnaceEntity.FuelSlot].Count == 1, "blocked output wastes nothing");
    }

    private static void BreakRules()
    {
        var stone = Blocks.Get(Blocks.Stone);
        var (hand, handDrop) = Items.BreakTime(stone, null);
        var (wood, woodDrop) = Items.BreakTime(stone, Items.Get(Items.ByKey["wooden_pick"]));
        var (iron, _) = Items.BreakTime(stone, Items.Get(Items.ByKey["iron_pick"]));
        Check(!handDrop && woodDrop, "stone needs a pick to drop");
        Check(hand > wood && wood > iron, "better tools are faster");
        var ironOre = Blocks.Get(Blocks.IronOre);
        Check(!Items.BreakTime(ironOre, Items.Get(Items.ByKey["stone_pick"])).harvest, "iron ore resists stone");
        Check(Items.BreakTime(ironOre, Items.Get(Items.ByKey["copper_pick"])).harvest, "copper pick takes iron");
        Check(Items.BreakTime(Blocks.Get(Blocks.StarmetalOre), Items.Get(Items.ByKey["iron_pick"])).harvest, "iron pick takes starmetal");
        Check(Items.BreakTime(Blocks.Get(Blocks.TallGrass), null).seconds == 0f, "grass breaks instantly");
        Check(float.IsInfinity(Items.BreakTime(Blocks.Get(Blocks.Rootstone), null).seconds), "rootstone never breaks");
        Check(Items.BreakTime(Blocks.Get(Blocks.Dirt), Items.Get(Items.ByKey["stone_shovel"])).seconds < Items.BreakTime(Blocks.Get(Blocks.Dirt), null).seconds, "shovels dig faster");
    }

    private static void Raycast()
    {
        var w = Flat(-1, -1, 2);
        var h = VoxelRay.Cast(w, new Vector3(-5.5f, 70f, -5.5f), Vector3.Down, 10f);
        Check(h.Hit && h.X == -6 && h.Y == 64 && h.Z == -6 && h.Face == Dir.PY, $"straight down hits the top face ({h.X},{h.Y},{h.Z} f{h.Face})");
        Check(h.Adjacent == new Vector3I(-6, 65, -6), "adjacent is above");
        var miss = VoxelRay.Cast(w, new Vector3(0.5f, 70f, 0.5f), Vector3.Down, 4f);
        Check(!miss.Hit, "out of reach misses");
        w.SetBlock(3, 65, 0, Blocks.Stone);
        var side = VoxelRay.Cast(w, new Vector3(0.5f, 65.5f, 0.5f), Vector3.Right, 10f);
        Check(side.Hit && side.X == 3 && side.Face == Dir.NX, "sideways hits the near face");
        w.SetBlock(1, 65, 5, Blocks.Torch);
        var t = VoxelRay.Cast(w, new Vector3(1.05f, 65.9f, 3f), Vector3.Back, 5f);
        Check(!t.Hit || t.X != 1 || t.Z != 5 || t.Y != 65, "a ray past a torch's corner misses the torch");
        var t2 = VoxelRay.Cast(w, new Vector3(1.5f, 65.3f, 3f), Vector3.Back, 5f);
        Check(t2.Hit && t2.X == 1 && t2.Y == 65 && t2.Z == 5, "a ray through the torch hits it");
    }

    private static void LightConsistency()
    {
        var w = Generated(777, 0, 0, 3);
        var rng = new Rng(99);
        int edits = 0;
        for (int k = 0; k < 60; k++)
        {
            int x = rng.Int(8, 40), z = rng.Int(8, 40);
            int top = w.HeightAt(x, z);
            int y = rng.Int(Math.Max(2, top - 12), top + 2);
            ushort id = k % 3 == 0 ? Blocks.Torch : k % 3 == 1 ? Blocks.Air : Blocks.Stone;
            if (id == Blocks.Torch && !w.GetDef(x, y - 1, z).Solid) id = Blocks.LumenBlock;
            if (w.GetBlock(x, y, z) == Blocks.Rootstone) continue;
            w.SetBlock(x, y, z, id, updateNeighbours: false);
            edits++;
        }
        // Recompute everything from scratch and compare the interior.
        int mismatch = 0, total = 0;
        var fresh = new Dictionary<long, byte[]>();
        foreach (var c in w.Chunks.Values)
        {
            var n = w.Neighbourhood(c.X, c.Z, ChunkState.Generated);
            if (n != null) fresh[c.Key] = Lighting.ComputeColumn(n);
        }
        foreach (var c in w.Chunks.Values)
        {
            if (c.X < 0 || c.X > 2 || c.Z < 0 || c.Z > 2) continue;
            var f = fresh[c.Key];
            for (int i = 0; i < V.ColumnVolume; i++)
            {
                total++;
                if (f[i] != c.Light[i]) mismatch++;
            }
        }
        Check(mismatch == 0, $"{edits} edits: {mismatch} of {total} cells differ from a full relight");
        // Sanity: a torch in a sealed room lights it; removing it darkens it.
        var flat = Flat(0, 0, 1, 64);
        for (int y = 60; y <= 62; y++) for (int z = 4; z <= 8; z++) for (int x = 4; x <= 8; x++) flat.SetBlock(x, y, z, Blocks.Air, false);
        flat.SetBlock(6, 60, 6, Blocks.Torch, false);
        Check(flat.BlockLight(6, 61, 6) == 13, $"torch lights a sealed room ({flat.BlockLight(6, 61, 6)})");
        Check(flat.SkyLight(6, 61, 6) == 0, "no sky in a sealed room");
        flat.SetBlock(6, 60, 6, Blocks.Air, false);
        Check(flat.BlockLight(6, 61, 6) == 0, "dark again without it");
        flat.SetBlock(6, 64, 6, Blocks.Air, false);
        flat.SetBlock(6, 63, 6, Blocks.Air, false);
        Check(flat.SkyLight(6, 60, 6) == 15, "a shaft lets full sky straight down");
        Check(flat.SkyLight(4, 60, 4) < 15 && flat.SkyLight(4, 60, 4) > 8, "and less into the corners");
    }

    private static void Collision()
    {
        var w = Flat(-1, -1, 4);
        var b = new VoxelBody();
        b.Position = new Vector3(4.5f, 70f, 4.5f);
        for (int i = 0; i < 240; i++) { b.Vel.Y -= 28f / 60f; b.Move(w, b.Vel.X / 60f, b.Vel.Y / 60f, b.Vel.Z / 60f); }
        Check(b.OnGround && b.Y == 65.0, $"lands exactly on the surface (y = {b.Y:R})");
        // Walk into a wall: stopped, not climbed, not snagged.
        w.SetBlock(7, 65, 4, Blocks.Stone); w.SetBlock(7, 66, 4, Blocks.Stone);
        for (int i = 0; i < 120; i++) { b.Vel = new Vector3(5f, b.Vel.Y - 28f / 60f, 0); b.Move(w, b.Vel.X / 60f, b.Vel.Y / 60f, 0); }
        Check(Math.Abs(b.X - 6.7) < 1e-6 && b.Y == 65.0, $"wall stops at its face, feet stay down ({b.X:0.000},{b.Y:0.000})");
        // Slide along the wall.
        double z0 = b.Z;
        for (int i = 0; i < 30; i++) b.Move(w, 0.05, -0.01, 0.05);
        Check(b.Z > z0 + 1.0, "slides along a wall");
        // A very fast body does not pass through a one-block wall.
        var fast = new VoxelBody { Position = new Vector3(0.5f, 65f, 10.5f) };
        w.SetBlock(3, 65, 10, Blocks.Stone); w.SetBlock(3, 66, 10, Blocks.Stone);
        fast.Move(w, 30, 0, 0);
        Check(fast.X < 3.0, $"no tunnelling at 30 blocks per step (x = {fast.X:0.00})");
        // Walking along a floor made of many blocks never catches on the seams.
        var walker = new VoxelBody { Position = new Vector3(-10.5f, 65f, 20.5f) };
        walker.Move(w, 0, -0.01, 0);
        double start = walker.X;
        for (int i = 0; i < 600; i++) { walker.Move(w, 4.3 / 60.0, -0.02, 0.0013); }
        Check(walker.X - start > 42.9 && walker.Y == 65.0, $"no seams snag a walk ({walker.X - start:0.00} of 43)");
        // A one-block ledge needs a jump; a low bedroll does not.
        var stepper = new VoxelBody { Position = new Vector3(10.5f, 65f, 30.5f) };
        w.SetBlock(12, 65, 30, Blocks.Bedroll);
        double topY = 0;
        for (int i = 0; i < 60; i++) { stepper.Move(w, 0.05, -0.05, 0); topY = Math.Max(topY, stepper.Y); }
        Check(topY > 65.25 && stepper.X > 12.0, $"steps onto a bedroll (reached y {topY:0.00}, x {stepper.X:0.00})");
        w.SetBlock(16, 65, 30, Blocks.Stone);
        for (int i = 0; i < 120; i++) stepper.Move(w, 0.05, -0.05, 0);
        Check(stepper.X < 15.8, "does not walk up a full block");
        // Crouching at an edge.
        for (int x = 20; x <= 22; x++) for (int z = 22; z <= 26; z++) w.SetBlock(x, 64, z, Blocks.Air);
        Check(w.GetBlock(21, 64, 24) == Blocks.Air, "hole dug");
        var edge = new VoxelBody { Position = new Vector3(18.5f, 65f, 24.5f) };
        edge.Move(w, 0, -0.01, 0);
        for (int i = 0; i < 100; i++) edge.Move(w, 0.05, -0.05, 0, sneakEdge: true);
        Check(edge.Y == 65.0 && edge.X < 20.35, $"sneaking stops at the edge ({edge.X:0.00})");
    }

    private static void Survival()
    {
        var v = new Vitals();
        Check(Vitals.FallDamage(3f) == 0 && Vitals.FallDamage(7.5f) == 4, "fall damage beyond three metres");
        v.Damage(5, DamageKind.Mob);
        Check(v.Health == 15, "damage lands");
        Check(!v.Damage(5, DamageKind.Mob), "brief immunity after a hit");
        for (int i = 0; i < 200; i++) v.Tick(0.1f, false);
        Check(v.Health > 15, "well fed heals");
        float h0 = v.Hunger;
        v.Exhaust(40f);
        v.Tick(0.01f, false);
        Check(v.Hunger < h0 || v.Saturation < 5, "effort costs food");
        var d = new Vitals();
        for (int i = 0; i < 100; i++) d.Tick(0.1f, true);
        Check(d.Air == 0 && d.Health == 20, "ten seconds of breath");
        for (int i = 0; i < 30; i++) d.Tick(0.1f, true);
        Check(d.Health < 20, "then drowning");
        for (int i = 0; i < 30; i++) d.Tick(0.1f, false);
        Check(d.Air == Vitals.MaxAir, "breath returns");
        var s = new Vitals { Hunger = 0, Saturation = 0, Health = 3 };
        for (int i = 0; i < 600; i++) s.Tick(0.1f, false);
        Check(s.Health == 1f, "starving stops at the last point");
        s.Eat(Items.Get(Items.MossbackSteak));
        Check(s.Hunger == 8, "steak restores eight");
        bool died = false;
        var k = new Vitals();
        k.Died += _ => died = true;
        k.Damage(25, DamageKind.Lava);
        Check(k.Dead && died, "death is reported");
    }

    private static World Empty()
    {
        var w = new World(1);
        for (int z = -2; z <= 2; z++)
            for (int x = -2; x <= 2; x++)
            {
                var c = new Chunk(x, z) { State = ChunkState.Generated };
                w.Chunks[c.Key] = c;
            }
        return w;
    }

    private static void Meshing()
    {
        var w = Empty();
        var center = w.GetChunk(0, 0);
        center.SetRaw(5, 10, 5, Blocks.Stone);
        LightAll(w);
        var m = Mesher.Build(w.Neighbourhood(0, 0, ChunkState.Lit), 0, 1);
        Check(m.Triangles == 12, $"a lone block is six faces ({m.Triangles} triangles)");
        // A floor spanning every column, in uniform light: one quad above, one below.
        foreach (var c in w.Chunks.Values)
            for (int z = 0; z < 16; z++) for (int x = 0; x < 16; x++) c.SetRaw(x, 20, z, Blocks.Stone);
        center.SetRaw(5, 10, 5, Blocks.Air);
        LightAll(w);
        m = Mesher.Build(w.Neighbourhood(0, 0, ChunkState.Lit), 0, 2);
        Check(m.Triangles == 4, $"a floor merges greedily ({m.Triangles} triangles)");
        // Two touching blocks hide their shared faces.
        var w2 = Empty();
        w2.GetChunk(0, 0).SetRaw(4, 30, 4, Blocks.Stone);
        w2.GetChunk(0, 0).SetRaw(4, 30, 7, Blocks.Dirt);
        w2.GetChunk(0, 0).SetRaw(4, 30, 5, Blocks.Stone);
        LightAll(w2);
        var m2 = Mesher.Build(w2.Neighbourhood(0, 0, ChunkState.Lit), 0, 1);
        // The stone pair: top, two sides and two ends merge or stand alone (6 quads), its underside splits
        // in two because light grades from the edges inward; the dirt block is six. 13 quads; 18 without culling.
        Check(m2.Triangles == 13 * 2, $"shared faces culled, same-texture neighbours merged ({m2.Triangles} triangles)");
        // Faces at a column border read the neighbour, not air.
        var w3 = Empty();
        w3.GetChunk(0, 0).SetRaw(15, 30, 4, Blocks.Stone);
        w3.GetChunk(1, 0).SetRaw(0, 30, 4, Blocks.Stone);
        LightAll(w3);
        var m3 = Mesher.Build(w3.Neighbourhood(0, 0, ChunkState.Lit), 0, 1);
        Check(m3.Triangles == 10, $"the face against the next column is culled ({m3.Triangles} triangles)");
    }

    private static void LootFill()
    {
        foreach (var t in new[] { "camp", "ruin", "shrine", "tower", "vault" })
        {
            var inv = new Inventory(27);
            Loot.Fill(inv, t, 1234);
            var inv2 = new Inventory(27);
            Loot.Fill(inv2, t, 1234);
            bool same = true;
            for (int i = 0; i < 27; i++) same &= inv[i].Equals(inv2[i]);
            Check(!inv.IsEmpty, $"{t} crate has something");
            Check(same, $"{t} crate is repeatable from its seed");
        }
    }
}
