using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;

namespace Strata;

/// <summary>
/// The loaded world: every column in memory, block reads and writes in world
/// coordinates, and the bookkeeping an edit sets off — light patched in place,
/// meshes marked stale, and anything that was resting on the old block dealt with.
/// Main thread only; workers see columns, never the World.
/// </summary>
public sealed class World
{
    public readonly long Seed;
    public readonly WorldGen Gen;
    public readonly Dictionary<long, Chunk> Chunks = new();

    /// <summary>A block was destroyed by the world or a player: (x, y, z, old id, drop items).</summary>
    public event Action<int, int, int, ushort, bool> BlockBroken;
    /// <summary>Any block changed: (x, y, z, old id, new id).</summary>
    public event Action<int, int, int, ushort, ushort> BlockChanged;
    /// <summary>A column has its light for the first time since it was loaded: ready to play in.</summary>
    public event Action<Chunk> ColumnReady;
    public void RaiseColumnReady(Chunk c) => ColumnReady?.Invoke(c);
    /// <summary>A crate or furnace was removed with items inside.</summary>
    public event Action<int, int, int, BlockEntity> EntityRemoved;

    public World(long seed)
    {
        Seed = seed;
        Gen = new WorldGen(seed);
    }

    // --- chunk lookup ------------------------------------------------------------

    private Chunk _cache;
    private long _cacheKey = long.MinValue;

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public Chunk GetChunk(int cx, int cz)
    {
        long k = V.Key(cx, cz);
        if (k == _cacheKey) return _cache;
        Chunks.TryGetValue(k, out var c);
        _cache = c; _cacheKey = k;
        return c;
    }

    public void InvalidateCache() { _cache = null; _cacheKey = long.MinValue; }

    public Chunk ChunkAt(int x, int z) => GetChunk(x >> V.Shift, z >> V.Shift);

    /// <summary>True where blocks exist and light is final: the only places edits are allowed.</summary>
    public bool IsReady(int x, int z)
    {
        var c = ChunkAt(x, z);
        return c != null && c.State >= ChunkState.Lit;
    }

    public ushort GetBlock(int x, int y, int z)
    {
        if ((uint)y >= V.Height) return y < 0 ? Blocks.Rootstone : Blocks.Air;
        var c = ChunkAt(x, z);
        if (c == null || c.State < ChunkState.Generated) return Blocks.Air;
        return c.Blocks[V.Index(x & V.Mask, y, z & V.Mask)];
    }

    /// <summary>For collision: columns that are not loaded yet count as solid, so nothing falls out of the world.</summary>
    public ushort GetBlockSolidUnloaded(int x, int y, int z)
    {
        if ((uint)y >= V.Height) return y < 0 ? Blocks.Rootstone : Blocks.Air;
        var c = ChunkAt(x, z);
        if (c == null || c.State < ChunkState.Generated) return Blocks.Rootstone;
        return c.Blocks[V.Index(x & V.Mask, y, z & V.Mask)];
    }

    public BlockDef GetDef(int x, int y, int z) => Blocks.ById[GetBlock(x, y, z)];

    /// <summary>Raw light byte (sky high nibble, block low nibble). Unloaded reads as open sky.</summary>
    public byte GetLight(int x, int y, int z)
    {
        if (y >= V.Height) return 0xF0;
        if (y < 0) return 0;
        var c = ChunkAt(x, z);
        if (c == null || c.State < ChunkState.Lit) return 0xF0;
        return c.Light[V.Index(x & V.Mask, y, z & V.Mask)];
    }

    public int SkyLight(int x, int y, int z) => GetLight(x, y, z) >> 4;
    public int BlockLight(int x, int y, int z) => GetLight(x, y, z) & 15;

    /// <summary>Surface height at a column: one above the highest block that stops sky light.</summary>
    public int HeightAt(int x, int z)
    {
        var c = ChunkAt(x, z);
        if (c == null || c.State < ChunkState.Generated) return 0;
        return c.Height[((z & V.Mask) << 4) | (x & V.Mask)];
    }

    public BlockEntity GetEntity(int x, int y, int z)
    {
        var c = ChunkAt(x, z);
        if (c == null) return null;
        c.Entities.TryGetValue(V.Index(x & V.Mask, y, z & V.Mask), out var e);
        return e;
    }

    public void SetEntity(int x, int y, int z, BlockEntity e)
    {
        var c = ChunkAt(x, z);
        if (c == null) return;
        int i = V.Index(x & V.Mask, y, z & V.Mask);
        if (e == null) c.Entities.Remove(i); else c.Entities[i] = e;
        c.Modified = true;
    }

    // --- edits -------------------------------------------------------------------

    /// <summary>
    /// Sets a block and does everything that follows from it. Returns false
    /// where the world is not ready to be edited.
    /// </summary>
    public bool SetBlock(int x, int y, int z, ushort id, bool updateNeighbours = true)
    {
        if ((uint)y >= V.Height) return false;
        var c = ChunkAt(x, z);
        if (c == null || c.State < ChunkState.Lit) return false;
        int lx = x & V.Mask, lz = z & V.Mask;
        int idx = V.Index(lx, y, lz);
        ushort old = c.Blocks[idx];
        if (old == id) return true;

        c.SetRaw(lx, y, lz, id);
        c.Modified = true;

        // A block with state goes when its block does; a new one starts fresh.
        var oldDef = Blocks.ById[old];
        var newDef = Blocks.ById[id];
        bool keepsEntity = oldDef.Use == newDef.Use && (newDef.Use == BlockUse.Furnace || newDef.Use == BlockUse.Crate);
        if (!keepsEntity && c.Entities.TryGetValue(idx, out var ent))
        {
            c.Entities.Remove(idx);
            EntityRemoved?.Invoke(x, y, z, ent);
        }
        if (!keepsEntity)
        {
            if (newDef.Use == BlockUse.Crate) c.Entities[idx] = new CrateEntity();
            else if (newDef.Use == BlockUse.Furnace) c.Entities[idx] = new FurnaceEntity();
        }

        Relight(x, y, z);
        MarkBlockDirty(x, y, z);
        BlockChanged?.Invoke(x, y, z, old, id);

        if (updateNeighbours) CheckSupports(x, y, z);
        return true;
    }

    /// <summary>Removes a block as if mined or destroyed, raising BlockBroken so drops can spawn.</summary>
    public bool BreakBlock(int x, int y, int z, bool drop)
    {
        ushort old = GetBlock(x, y, z);
        if (old == Blocks.Air) return false;
        var def = Blocks.ById[old];

        // Doors are two blocks; take the other half with it.
        if (Blocks.IsDoor(old))
        {
            bool upper = (def.Variant & 8) != 0;
            int oy = upper ? y - 1 : y + 1;
            if (Blocks.IsDoor(GetBlock(x, oy, z))) SetBlock(x, oy, z, Blocks.Air, false);
        }
        ushort replacement = Blocks.Air;
        // Ice melts back into water when broken, the way it should.
        if (old == Blocks.Ice && y > 1 && GetBlock(x, y - 1, z) != Blocks.Air) replacement = Blocks.Water;
        if (!SetBlock(x, y, z, replacement)) return false;
        BlockBroken?.Invoke(x, y, z, old, drop);
        return true;
    }

    /// <summary>After an edit, anything held up by the changed cell may fall.</summary>
    public void CheckSupports(int x, int y, int z)
    {
        // Plants and torches standing on top.
        if (y + 1 < V.Height) CheckOne(x, y + 1, z);
        // Wall-mounted things on the four sides.
        for (int d = 0; d < 6; d++)
        {
            if (d == Dir.PY || d == Dir.NY) continue;
            CheckOne(x + Dir.DX[d], y, z + Dir.DZ[d]);
        }
        // A door's upper half rests on its lower half.
        if (y + 1 < V.Height) CheckOne(x, y + 1, z);
    }

    private void CheckOne(int x, int y, int z)
    {
        ushort id = GetBlock(x, y, z);
        if (id == Blocks.Air) return;
        var d = Blocks.ById[id];
        if (!IsSupported(x, y, z, d)) BreakBlock(x, y, z, true);
    }

    public bool IsSupported(int x, int y, int z, BlockDef d)
    {
        if (d.NeedsSupportBelow)
        {
            ushort below = GetBlock(x, y - 1, z);
            var bd = Blocks.ById[below];
            if (d.CropStages > 0) return below == Blocks.TilledSoil;
            if (d.Id == Blocks.Spinecactus) return below == Blocks.Sand || below == Blocks.Spinecactus || below == Blocks.Cinder;
            if (d.Id == Blocks.Torch) return bd.Solid && bd.Render == RenderKind.Cube;
            if (d.Id == Blocks.Reeds) return below == Blocks.Reeds || Blocks.IsSoilLike(below) || below == Blocks.Sand;
            if (d.Id == Blocks.Glowcap || d.Id == Blocks.Blushcap || d.Id == Blocks.Umbercap) return bd.Solid && bd.Opaque;
            return bd.Solid && bd.Opaque;
        }
        if (d.SupportDir >= 0)
        {
            int sx = x + Dir.DX[d.SupportDir], sz = z + Dir.DZ[d.SupportDir];
            var sd = GetDef(sx, y, sz);
            return sd.Solid && sd.Opaque;
        }
        if (Blocks.IsDoor(d.Id))
        {
            bool upper = (d.Variant & 8) != 0;
            if (upper) return Blocks.IsDoor(GetBlock(x, y - 1, z));
            var below = GetDef(x, y - 1, z);
            return below.Solid && Blocks.IsDoor(GetBlock(x, y + 1, z));
        }
        return true;
    }

    // --- mesh bookkeeping --------------------------------------------------------

    /// <summary>
    /// Marks every slab whose mesh reads this cell: its own, plus neighbours'
    /// when the cell sits on an edge (faces, ambient occlusion and smooth light
    /// all look one cell across).
    /// </summary>
    public void MarkBlockDirty(int x, int y, int z)
    {
        int lx = x & V.Mask, lz = z & V.Mask;
        int cx = x >> V.Shift, cz = z >> V.Shift;
        int x0 = lx == 0 ? -1 : 0, x1 = lx == V.Mask ? 1 : 0;
        int z0 = lz == 0 ? -1 : 0, z1 = lz == V.Mask ? 1 : 0;
        int s = y / Chunk.SlabHeight;
        int ly = y % Chunk.SlabHeight;
        int mask = 1 << s;
        if (ly == 0 && s > 0) mask |= 1 << (s - 1);
        if (ly == Chunk.SlabHeight - 1 && s < Chunk.Slabs - 1) mask |= 1 << (s + 1);
        for (int dz = z0; dz <= z1; dz++)
            for (int dx = x0; dx <= x1; dx++)
            {
                var c = GetChunk(cx + dx, cz + dz);
                if (c != null) c.DirtySlabs |= mask;
            }
    }

    // --- incremental light ------------------------------------------------------

    private struct LNode { public int X, Y, Z, L; }
    private LNode[] _rq = new LNode[4096], _aq = new LNode[4096];
    private readonly List<LNode> _emitters = new();

    private static readonly int[] DX6 = { 1, -1, 0, 0, 0, 0 };
    private static readonly int[] DY6 = { 0, 0, 1, -1, 0, 0 };
    private static readonly int[] DZ6 = { 0, 0, 0, 0, 1, -1 };

    /// <summary>Patches both light channels around a changed cell.</summary>
    public void Relight(int x, int y, int z)
    {
        RelightChannel(x, y, z, sky: false);
        RelightChannel(x, y, z, sky: true);
    }

    private int ReadL(Chunk c, int i, bool sky) => sky ? c.Light[i] >> 4 : c.Light[i] & 15;

    private void WriteL(Chunk c, int x, int y, int z, int i, bool sky, int v)
    {
        byte b = c.Light[i];
        byte nb = sky ? (byte)((b & 0x0F) | (v << 4)) : (byte)((b & 0xF0) | v);
        if (nb == b) return;
        c.Light[i] = nb;
        MarkBlockDirty(x, y, z);
    }

    private Chunk LitChunk(int x, int z)
    {
        var c = ChunkAt(x, z);
        return c != null && c.State >= ChunkState.Lit ? c : null;
    }

    private void RelightChannel(int x, int y, int z, bool sky)
    {
        int rt = 0, at = 0;
        _emitters.Clear();
        var c0 = LitChunk(x, z);
        if (c0 == null) return;
        int i0 = V.Index(x & V.Mask, y, z & V.Mask);
        int cur = ReadL(c0, i0, sky);
        ushort id0 = c0.Blocks[i0];
        int a0 = Lighting.Att[id0];

        if (cur > 0)
        {
            WriteL(c0, x, y, z, i0, sky, 0);
            PushR(ref rt, x, y, z, cur);
        }

        // Take away everything that was lit through this cell.
        for (int h = 0; h < rt; h++)
        {
            var p = _rq[h];
            for (int d = 0; d < 6; d++)
            {
                int nx = p.X + DX6[d], ny = p.Y + DY6[d], nz = p.Z + DZ6[d];
                if ((uint)ny >= V.Height) continue;
                var c = LitChunk(nx, nz);
                if (c == null) continue;
                int ni = V.Index(nx & V.Mask, ny, nz & V.Mask);
                int nl = ReadL(c, ni, sky);
                if (nl == 0) continue;
                bool dependent = nl < p.L || (sky && d == Dir.NY && p.L == 15 && nl == 15);
                if (dependent)
                {
                    WriteL(c, nx, ny, nz, ni, sky, 0);
                    PushR(ref rt, nx, ny, nz, nl);
                    if (!sky)
                    {
                        int e = Lighting.Emit[c.Blocks[ni]];
                        if (e > 0) _emitters.Add(new LNode { X = nx, Y = ny, Z = nz, L = e });
                    }
                }
                else
                {
                    PushA(ref at, nx, ny, nz, nl);
                }
            }
        }

        // Relight: this cell's own emission, emitters caught in the removal, and
        // every lit neighbour of a cell that light can now pass through.
        if (!sky)
        {
            int e = Lighting.Emit[id0];
            if (e > 0)
            {
                WriteL(c0, x, y, z, i0, false, e);
                PushA(ref at, x, y, z, e);
            }
            foreach (var em in _emitters)
            {
                var c = LitChunk(em.X, em.Z);
                if (c == null) continue;
                int i = V.Index(em.X & V.Mask, em.Y, em.Z & V.Mask);
                if (ReadL(c, i, false) < em.L) WriteL(c, em.X, em.Y, em.Z, i, false, em.L);
                PushA(ref at, em.X, em.Y, em.Z, em.L);
            }
        }
        if (a0 != Lighting.Opaque)
        {
            if (sky && y == V.Height - 1)
            {
                WriteL(c0, x, y, z, i0, true, 15 - a0);
                PushA(ref at, x, y, z, 15 - a0);
            }
            for (int d = 0; d < 6; d++)
            {
                int nx = x + DX6[d], ny = y + DY6[d], nz = z + DZ6[d];
                if ((uint)ny >= V.Height) continue;
                var c = LitChunk(nx, nz);
                if (c == null) continue;
                int nl = ReadL(c, V.Index(nx & V.Mask, ny, nz & V.Mask), sky);
                if (nl > 0) PushA(ref at, nx, ny, nz, nl);
            }
        }

        for (int h = 0; h < at; h++)
        {
            var p = _aq[h];
            var pc = LitChunk(p.X, p.Z);
            if (pc == null) continue;
            int pl = ReadL(pc, V.Index(p.X & V.Mask, p.Y, p.Z & V.Mask), sky);
            if (pl <= 1) continue;
            for (int d = 0; d < 6; d++)
            {
                int nx = p.X + DX6[d], ny = p.Y + DY6[d], nz = p.Z + DZ6[d];
                if ((uint)ny >= V.Height) continue;
                var c = LitChunk(nx, nz);
                if (c == null) continue;
                int ni = V.Index(nx & V.Mask, ny, nz & V.Mask);
                int an = Lighting.Att[c.Blocks[ni]];
                if (an == Lighting.Opaque) continue;
                int nl = Lighting.Propagate(pl, sky && d == Dir.NY, an);
                if (nl > ReadL(c, ni, sky))
                {
                    WriteL(c, nx, ny, nz, ni, sky, nl);
                    PushA(ref at, nx, ny, nz, nl);
                }
            }
        }
    }

    private void PushR(ref int t, int x, int y, int z, int l)
    {
        if (t == _rq.Length) Array.Resize(ref _rq, t * 2);
        _rq[t++] = new LNode { X = x, Y = y, Z = z, L = l };
    }

    private void PushA(ref int t, int x, int y, int z, int l)
    {
        if (t == _aq.Length) Array.Resize(ref _aq, t * 2);
        _aq[t++] = new LNode { X = x, Y = y, Z = z, L = l };
    }

    // --- neighbourhood helpers ---------------------------------------------------

    /// <summary>The 3 x 3 columns around (cx, cz), or null if any is missing or behind the given state.</summary>
    public Chunk[] Neighbourhood(int cx, int cz, ChunkState atLeast)
    {
        var n = new Chunk[9];
        for (int dz = -1; dz <= 1; dz++)
            for (int dx = -1; dx <= 1; dx++)
            {
                var c = GetChunk(cx + dx, cz + dz);
                if (c == null || c.State < atLeast) return null;
                n[(dz + 1) * 3 + dx + 1] = c;
            }
        return n;
    }

    public bool NeighboursAtLeast(Chunk c, ChunkState s)
    {
        for (int dz = -1; dz <= 1; dz++)
            for (int dx = -1; dx <= 1; dx++)
            {
                if (dx == 0 && dz == 0) continue;
                var n = GetChunk(c.X + dx, c.Z + dz);
                if (n == null || n.State < s) return false;
            }
        return true;
    }

    // --- living world ------------------------------------------------------------

    /// <summary>
    /// A few random cells per section in each nearby column get a chance to
    /// change: crops ripen, saplings become trees, grass creeps over bare soil,
    /// picked bushes regrow.
    /// </summary>
    public void RandomTicks(int centerCx, int centerCz, int radius, int perSection, ref Rng rng, float growthScale = 1f)
    {
        for (int cz = centerCz - radius; cz <= centerCz + radius; cz++)
            for (int cx = centerCx - radius; cx <= centerCx + radius; cx++)
            {
                var c = GetChunk(cx, cz);
                if (c == null || c.State != ChunkState.Meshed) continue;
                for (int s = 0; s < V.Sections; s++)
                {
                    if (c.SectionCount[s] == 0) continue;
                    for (int k = 0; k < perSection; k++)
                    {
                        int r = (int)(rng.Next() & 0xFFF);
                        int lx = r & 15, lz = (r >> 4) & 15, ly = (r >> 8) & 15;
                        int y = (s << 4) | ly;
                        ushort id = c.Blocks[V.Index(lx, y, lz)];
                        if (id == 0) continue;
                        TickBlock(c.WorldX + lx, y, c.WorldZ + lz, id, ref rng, growthScale);
                    }
                }
            }
    }

    private void TickBlock(int x, int y, int z, ushort id, ref Rng rng, float scale)
    {
        var d = Blocks.ById[id];
        if (d.GrowChance > 0f && rng.Chance(d.GrowChance * scale))
        {
            int light = Math.Max(SkyLight(x, y, z), BlockLight(x, y, z));
            if (d.CropStages > 0)
            {
                if (light >= 9 && d.Variant < d.CropStages - 1) SetBlock(x, y, z, (ushort)(id + 1));
                return;
            }
            if (id == Blocks.BerryBushBare) { if (light >= 9) SetBlock(x, y, z, Blocks.BerryBush); return; }
            if (id == Blocks.ElmSapling || id == Blocks.IronwoodSapling || id == Blocks.PineSapling || id == Blocks.WillowSapling)
            {
                if (light >= 9) Gen.Trees.GrowSapling(this, x, y, z, id, ref rng);
                return;
            }
        }

        if (id == Blocks.Dirt)
        {
            // Grass creeps onto lit soil next to grass.
            if (rng.Chance(0.25f) && Blocks.ById[GetBlock(x, y + 1, z)].Opaque == false && SkyLight(x, y + 1, z) >= 9)
            {
                for (int k = 0; k < 4; k++)
                {
                    int nx = x + rng.Int(-1, 1), ny = y + rng.Int(-1, 1), nz = z + rng.Int(-1, 1);
                    if (GetBlock(nx, ny, nz) == Blocks.Grass) { SetBlock(x, y, z, Blocks.Grass); break; }
                }
            }
        }
        else if (id == Blocks.Grass || id == Blocks.SnowyGrass || id == Blocks.ForestFloor)
        {
            if (Blocks.ById[GetBlock(x, y + 1, z)].Opaque) SetBlock(x, y, z, Blocks.Dirt);
        }
        else if (id == Blocks.TilledSoil)
        {
            // Untended farmland slowly returns to soil if nothing grows on it.
            ushort above = GetBlock(x, y + 1, z);
            if (Blocks.ById[above].CropStages == 0 && rng.Chance(0.02f)) SetBlock(x, y, z, Blocks.Dirt);
        }
        else if (Blocks.IsLeaves(id) && rng.Chance(0.2f))
        {
            // Leaves with no wood nearby wither (after a tree is felled).
            if (!LogNearby(x, y, z, 4)) BreakBlock(x, y, z, true);
        }
    }

    private bool LogNearby(int x, int y, int z, int r)
    {
        for (int dy = -r; dy <= r; dy++)
            for (int dz = -r; dz <= r; dz++)
                for (int dx = -r; dx <= r; dx++)
                    if (Blocks.IsLog(GetBlock(x + dx, y + dy, z + dz))) return true;
        return false;
    }

    /// <summary>Furnaces keep burning while their column is loaded, watched or not.</summary>
    public void TickEntities(float dt)
    {
        foreach (var c in Chunks.Values)
        {
            if (c.State < ChunkState.Lit || c.Entities.Count == 0) continue;
            List<(int idx, bool lit)> swaps = null;
            foreach (var kv in c.Entities)
            {
                if (kv.Value is not FurnaceEntity f) continue;
                bool wasActive = f.Burn > 0f || f.Cook > 0f;
                bool burning = f.Tick(dt);
                if (burning || wasActive) c.Modified = true;
                ushort id = c.Blocks[kv.Key];
                var d = Blocks.ById[id];
                if (d.Use == BlockUse.Furnace && d.IsLit != burning)
                    (swaps ??= new()).Add((kv.Key, burning));
            }
            if (swaps == null) continue;
            foreach (var (idx, lit) in swaps)
            {
                int ly = idx >> 8, lz = (idx >> 4) & 15, lx = idx & 15;
                var d = Blocks.ById[c.Blocks[idx]];
                ushort nid = (ushort)((lit ? Blocks.FurnaceLit : Blocks.Furnace) + d.Variant);
                SetBlock(c.WorldX + lx, ly, c.WorldZ + lz, nid, false);
            }
        }
    }
}
