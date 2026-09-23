using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Runtime.CompilerServices;

namespace Strata;

/// <summary>
/// Where a column is in its life. Each step needs its eight neighbours to be at
/// least one step behind it: light leaks across borders, so a column cannot be
/// lit until the blocks around it exist, and it cannot be meshed until the
/// light around it is final.
/// </summary>
public enum ChunkState : byte { Generating, Generated, Lighting, Lit, Meshing, Meshed }

/// <summary>A 16 x 16 x 256 column of blocks, its light, and what lives in it.</summary>
public sealed class Chunk
{
    public const int Slabs = 4;                 // mesh units: four sections, 64 blocks tall each
    public const int SlabHeight = V.Height / Slabs;

    public readonly int X, Z;
    public readonly long Key;
    public ushort[] Blocks = new ushort[V.ColumnVolume];
    public byte[] Light = new byte[V.ColumnVolume];          // sky << 4 | block
    public readonly short[] Height = new short[V.Size * V.Size]; // 1 + highest sky-blocking y, per column
    public readonly int[] SectionCount = new int[V.Sections];    // non-air blocks per section
    public int TopY;                                              // highest non-air y
    public readonly ushort[] GrassTint = new ushort[V.Size * V.Size];   // 15-bit colours, per column
    public readonly ushort[] FoliageTint = new ushort[V.Size * V.Size];

    public volatile ChunkState State;
    public bool Modified;                  // holds player changes: must be saved
    public bool LightedOnce;
    public int DirtySlabs;                 // bitmask of slabs that need a new mesh
    public readonly int[] SlabSeq = new int[Slabs];     // newest mesh job sent per slab
    public readonly int[] SlabApplied = new int[Slabs]; // newest mesh result applied per slab
    public bool UnloadRequested;

    public readonly Dictionary<int, BlockEntity> Entities = new();

    public Chunk(int x, int z) { X = x; Z = z; Key = V.Key(x, z); }

    public int WorldX => X << V.Shift;
    public int WorldZ => Z << V.Shift;

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public ushort Get(int x, int y, int z) => Blocks[V.Index(x, y, z)];

    /// <summary>Raw write with bookkeeping for counts and the heightmap; no light or mesh work.</summary>
    public void SetRaw(int x, int y, int z, ushort id)
    {
        int i = V.Index(x, y, z);
        ushort old = Blocks[i];
        if (old == id) return;
        Blocks[i] = id;
        int s = y >> V.Shift;
        if (old == 0) SectionCount[s]++;
        if (id == 0) SectionCount[s]--;
        if (id != 0 && y > TopY) TopY = y;
        int hi = (z << 4) | x;
        if (BlocksSky(id))
        {
            if (y + 1 > Height[hi]) Height[hi] = (short)(y + 1);
        }
        else if (y + 1 == Height[hi])
        {
            RecalcHeight(x, z);
        }
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static bool BlocksSky(ushort id)
    {
        var d = Strata.Blocks.ById[id];
        return d.Opaque || d.Attenuation > 0 || d.Liquid;
    }

    public void RecalcHeight(int x, int z)
    {
        int hi = (z << 4) | x;
        int y = Math.Min(TopY, V.Height - 1);
        for (; y >= 0; y--)
            if (BlocksSky(Blocks[V.Index(x, y, z)])) break;
        Height[hi] = (short)(y + 1);
    }

    /// <summary>Counts, top and heightmap from scratch. Called once after generation or load.</summary>
    public void Recount()
    {
        Array.Clear(SectionCount);
        TopY = 0;
        for (int s = 0; s < V.Sections; s++)
        {
            int n = 0, start = s * V.SectionVolume;
            for (int i = start; i < start + V.SectionVolume; i++) if (Blocks[i] != 0) n++;
            SectionCount[s] = n;
            if (n > 0) TopY = s * V.Size + V.Size - 1;
        }
        // Tighten TopY to the real top.
        for (int y = TopY; y >= 0; y--)
        {
            bool any = false;
            int start = y << 8;
            for (int i = start; i < start + 256; i++) if (Blocks[i] != 0) { any = true; break; }
            if (any) { TopY = y; break; }
            if (y == 0) TopY = 0;
        }
        for (int z = 0; z < V.Size; z++)
            for (int x = 0; x < V.Size; x++) RecalcHeight(x, z);
    }

    public bool SlabEmpty(int slab)
    {
        int s0 = slab * (SlabHeight / V.Size);
        for (int s = s0; s < s0 + SlabHeight / V.Size; s++) if (SectionCount[s] > 0) return false;
        return true;
    }

    public static int LocalIndex(int x, int y, int z) => V.Index(x, y, z);

    // --- persistence -----------------------------------------------------------

    private const uint Magic = 0x43525453; // "STRC"
    private const int FormatVersion = 1;

    /// <summary>
    /// Serialises blocks (through a key palette, so the registry can change
    /// between versions) and block entities. Light is not stored: it is a pure
    /// function of the blocks and is rebuilt on load.
    /// </summary>
    public byte[] Serialize()
    {
        using var ms = new MemoryStream();
        using (var z = new ZLibStream(ms, CompressionLevel.Fastest, leaveOpen: true))
        using (var w = new BinaryWriter(z))
        {
            w.Write(Magic);
            w.Write(FormatVersion);
            w.Write(X); w.Write(Z);

            var palette = new List<ushort>();
            var map = new Dictionary<ushort, ushort>();
            foreach (var id in Blocks)
                if (!map.ContainsKey(id)) { map[id] = (ushort)palette.Count; palette.Add(id); }
            w.Write((ushort)palette.Count);
            foreach (var id in palette) w.Write(Strata.Blocks.ById[id].Key);

            // Run-length over the y-major array: long runs of stone and air collapse.
            var runs = new List<(ushort v, int n)>();
            ushort cur = map[Blocks[0]]; int len = 0;
            foreach (var id in Blocks)
            {
                ushort p = map[id];
                if (p == cur) { len++; continue; }
                runs.Add((cur, len)); cur = p; len = 1;
            }
            runs.Add((cur, len));
            w.Write(runs.Count);
            foreach (var (v, n) in runs) { w.Write(v); w.Write(n); }

            w.Write(Entities.Count);
            foreach (var kv in Entities)
            {
                w.Write(kv.Value.TypeName);
                w.Write(kv.Key);
                kv.Value.Write(w);
            }
        }
        return ms.ToArray();
    }

    public static Chunk Deserialize(byte[] data)
    {
        using var ms = new MemoryStream(data);
        using var z = new ZLibStream(ms, CompressionMode.Decompress);
        using var r = new BinaryReader(z);
        if (r.ReadUInt32() != Magic) throw new InvalidDataException("not a chunk file");
        int ver = r.ReadInt32();
        if (ver > FormatVersion) throw new InvalidDataException("chunk from a newer version");
        int cx = r.ReadInt32(), cz = r.ReadInt32();
        var c = new Chunk(cx, cz);
        int pc = r.ReadUInt16();
        var palette = new ushort[pc];
        for (int i = 0; i < pc; i++)
        {
            string key = r.ReadString();
            palette[i] = Strata.Blocks.ByKey.TryGetValue(key, out var id) ? id : Strata.Blocks.Stone;
        }
        int runCount = r.ReadInt32();
        int at = 0;
        for (int i = 0; i < runCount; i++)
        {
            ushort v = r.ReadUInt16();
            int n = r.ReadInt32();
            if (v >= pc || at + n > V.ColumnVolume) throw new InvalidDataException("corrupt chunk runs");
            Array.Fill(c.Blocks, palette[v], at, n);
            at += n;
        }
        if (at != V.ColumnVolume) throw new InvalidDataException("short chunk");
        int ec = r.ReadInt32();
        for (int i = 0; i < ec; i++)
        {
            string type = r.ReadString();
            int idx = r.ReadInt32();
            var e = BlockEntity.Create(type);
            e.Read(r);
            c.Entities[idx] = e;
        }
        c.Recount();
        c.Modified = true; // it came from disk, so it differs from the generator; keep saving it
        return c;
    }
}

/// <summary>State attached to a single block: a crate's contents, a furnace's fire.</summary>
public abstract class BlockEntity
{
    public abstract string TypeName { get; }
    public abstract void Write(BinaryWriter w);
    public abstract void Read(BinaryReader r);

    public static BlockEntity Create(string type) => type switch
    {
        "crate" => new CrateEntity(),
        "furnace" => new FurnaceEntity(),
        _ => throw new InvalidDataException("unknown block entity " + type),
    };

    public static void WriteInventory(BinaryWriter w, Inventory inv)
    {
        w.Write(inv.Size);
        foreach (var s in inv.Slots)
        {
            if (s.IsEmpty) { w.Write(""); continue; }
            w.Write(Items.Get(s.Id).Key);
            w.Write(s.Count);
            w.Write(s.Wear);
        }
    }

    public static void ReadInventory(BinaryReader r, Inventory inv)
    {
        int n = r.ReadInt32();
        for (int i = 0; i < n; i++)
        {
            string key = r.ReadString();
            if (key.Length == 0) { if (i < inv.Size) inv.Slots[i] = ItemStack.Empty; continue; }
            int count = r.ReadInt32(), wear = r.ReadInt32();
            if (i < inv.Size && Items.ByKey.TryGetValue(key, out var id))
                inv.Slots[i] = new ItemStack(id, count, wear);
        }
        inv.Touch();
    }
}

public sealed class CrateEntity : BlockEntity
{
    public readonly Inventory Inv = new(27);
    public string Loot;        // loot table not yet rolled (structure crates fill on first open)
    public ulong LootSeed;

    public override string TypeName => "crate";

    public override void Write(BinaryWriter w)
    {
        w.Write(Loot ?? "");
        w.Write(LootSeed);
        WriteInventory(w, Inv);
    }

    public override void Read(BinaryReader r)
    {
        Loot = r.ReadString();
        if (Loot.Length == 0) Loot = null;
        LootSeed = r.ReadUInt64();
        ReadInventory(r, Inv);
    }
}

public sealed class FurnaceEntity : BlockEntity
{
    public const int In = 0, FuelSlot = 1, Out = 2;
    public readonly Inventory Inv = new(3);
    public float Burn;        // seconds of fire left
    public float BurnMax;     // length of the current fuel item, for the gauge
    public float Cook;        // seconds into the current item

    public override string TypeName => "furnace";

    public override void Write(BinaryWriter w)
    {
        w.Write(Burn); w.Write(BurnMax); w.Write(Cook);
        WriteInventory(w, Inv);
    }

    public override void Read(BinaryReader r)
    {
        Burn = r.ReadSingle(); BurnMax = r.ReadSingle(); Cook = r.ReadSingle();
        ReadInventory(r, Inv);
    }

    public float CookTime => Smelting.Table.TryGetValue(Inv[In].Id, out var t) ? t.seconds : Smelting.DefaultSeconds;

    /// <summary>
    /// Advances the fire. Fuel is only lit when there is something it can
    /// cook and room for the result, so fuel is never wasted on an empty furnace.
    /// Returns true while burning.
    /// </summary>
    public bool Tick(float dt)
    {
        var input = Inv[In];
        bool canCook = false;
        (ushort output, int count, float seconds) recipe = default;
        if (!input.IsEmpty && Smelting.Table.TryGetValue(input.Id, out recipe))
        {
            var o = Inv[Out];
            canCook = o.IsEmpty || (o.Id == recipe.output && o.Count + recipe.count <= Items.Get(o.Id).MaxStack);
        }

        if (Burn <= 0f && canCook)
        {
            var fuel = Inv[FuelSlot];
            if (!fuel.IsEmpty && fuel.Def.Fuel > 0f)
            {
                Burn = BurnMax = fuel.Def.Fuel;
                Inv.Take(FuelSlot, 1);
            }
        }

        if (Burn > 0f)
        {
            Burn = Math.Max(0f, Burn - dt);
            if (canCook)
            {
                Cook += dt;
                if (Cook >= recipe.seconds)
                {
                    Cook = 0f;
                    Inv.Take(In, 1);
                    var o = Inv[Out];
                    Inv[Out] = o.IsEmpty ? new ItemStack(recipe.output, recipe.count) : o.WithCount(o.Count + recipe.count);
                }
            }
            else Cook = 0f;
            return true;
        }
        // Out of fire: progress cools off rather than vanishing at once.
        Cook = Math.Max(0f, Cook - dt * 2f);
        return false;
    }
}
