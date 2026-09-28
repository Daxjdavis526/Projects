using System;
using System.Collections.Generic;

namespace Strata;

/// <summary>
/// A sparse set of block edits, laid out once for a whole landmark and then
/// stamped into each column as it is generated. Coordinates are local to the
/// site (the canvas knows where its origin is in the world); edits are kept
/// per column, so a column the landmark never touches costs nothing.
/// A cell holds 0 for "leave the terrain alone" or the block to put there
/// (air is stored as <see cref="AirMark"/> so it can be told from "untouched").
/// </summary>
public sealed class Canvas
{
    public const ushort AirMark = 0xFFFF;
    public readonly int Ox, Oz;
    private readonly Dictionary<long, ushort[]> _cols = new();
    private readonly Dictionary<long, List<(int index, int x, int y, int z, string loot)>> _crates = new();
    public int Cells { get; private set; }

    public Canvas(int ox, int oz) { Ox = ox; Oz = oz; }

    /// <summary>Every column the canvas writes into, by chunk key.</summary>
    public IReadOnlyDictionary<long, ushort[]> Columns => _cols;

    public ushort[] ColumnAt(long chunkKey) => _cols.TryGetValue(chunkKey, out var c) ? c : null;

    public List<(int index, int x, int y, int z, string loot)> CratesAt(long chunkKey) => _crates.TryGetValue(chunkKey, out var c) ? c : null;

    /// <summary>A storage crate that fills itself from a loot table the first time it is opened.</summary>
    public void Crate(int x, int y, int z, string loot)
    {
        Set(x, y, z, Blocks.Crate);
        int wx = x + Ox, wz = z + Oz;
        long key = V.Key(wx >> V.Shift, wz >> V.Shift);
        if (!_crates.TryGetValue(key, out var list)) { list = new(); _crates[key] = list; }
        list.Add((V.Index(wx & V.Mask, y, wz & V.Mask), wx, y, wz, loot));
    }

    public void Set(int x, int y, int z, ushort id)
    {
        if ((uint)y >= V.Height) return;
        int wx = x + Ox, wz = z + Oz;
        long key = V.Key(wx >> V.Shift, wz >> V.Shift);
        if (!_cols.TryGetValue(key, out var col)) { col = new ushort[V.ColumnVolume]; _cols[key] = col; }
        int i = V.Index(wx & V.Mask, y, wz & V.Mask);
        if (col[i] == 0) Cells++;
        col[i] = id == Blocks.Air ? AirMark : id;
    }

    /// <summary>What the canvas puts at a cell: a block id, <see cref="Blocks.Air"/> for carved space, or null if untouched.</summary>
    public ushort? Get(int x, int y, int z)
    {
        if ((uint)y >= V.Height) return null;
        int wx = x + Ox, wz = z + Oz;
        if (!_cols.TryGetValue(V.Key(wx >> V.Shift, wz >> V.Shift), out var col)) return null;
        ushort v = col[V.Index(wx & V.Mask, y, wz & V.Mask)];
        return v == 0 ? null : v == AirMark ? Blocks.Air : v;
    }

    public bool IsSet(int x, int y, int z) => Get(x, y, z).HasValue;

    /// <summary>True if the canvas has put something solid here.</summary>
    public bool Solid(int x, int y, int z)
    {
        var v = Get(x, y, z);
        return v.HasValue && Blocks.ById[v.Value].Solid;
    }

    /// <summary>Only writes where nothing has been written yet.</summary>
    public void SetIfEmpty(int x, int y, int z, ushort id)
    {
        if (!IsSet(x, y, z)) Set(x, y, z, id);
    }

    /// <summary>Only writes over air (or untouched cells): furniture never cuts into a wall.</summary>
    public void Place(int x, int y, int z, ushort id)
    {
        var v = Get(x, y, z);
        if (!v.HasValue || v.Value == Blocks.Air) Set(x, y, z, id);
    }

    public void Fill(int x0, int y0, int z0, int x1, int y1, int z1, ushort id)
    {
        if (x0 > x1) (x0, x1) = (x1, x0);
        if (y0 > y1) (y0, y1) = (y1, y0);
        if (z0 > z1) (z0, z1) = (z1, z0);
        for (int y = y0; y <= y1; y++)
            for (int z = z0; z <= z1; z++)
                for (int x = x0; x <= x1; x++)
                    Set(x, y, z, id);
    }

    public void Fill(int x0, int y0, int z0, int x1, int y1, int z1, Func<int, int, int, ushort> pick)
    {
        if (x0 > x1) (x0, x1) = (x1, x0);
        if (y0 > y1) (y0, y1) = (y1, y0);
        if (z0 > z1) (z0, z1) = (z1, z0);
        for (int y = y0; y <= y1; y++)
            for (int z = z0; z <= z1; z++)
                for (int x = x0; x <= x1; x++)
                {
                    ushort id = pick(x, y, z);
                    if (id != ushort.MaxValue) Set(x, y, z, id);
                }
    }

    /// <summary>Clears a box to air.</summary>
    public void Carve(int x0, int y0, int z0, int x1, int y1, int z1) => Fill(x0, y0, z0, x1, y1, z1, Blocks.Air);
}
