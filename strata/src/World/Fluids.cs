using System;
using System.Collections.Generic;

namespace Strata;

/// <summary>
/// Water that moves. A source feeds its neighbours; each step sideways thins
/// the flow by one level until it gives out after seven, and anything with air
/// below pours straight down as a falling column. When the feed is cut, the
/// flow recedes the same way. Two sources either side of a gap refill it, so a
/// hole dug in a lake heals over. Only cells that something disturbed are ever
/// looked at: generated oceans and lakes sit still for free.
/// </summary>
public sealed class Fluids
{
    private readonly World _w;
    private readonly Queue<(int x, int y, int z)> _now = new();
    private readonly HashSet<long> _queued = new();
    private float _timer;
    public const float Interval = 0.25f;
    public int MaxPerStep = 400;
    public int Pending => _now.Count;

    public Fluids(World w)
    {
        _w = w;
        _w.BlockChanged += (x, y, z, old, id) =>
        {
            // Anything touching water may make it move.
            Schedule(x, y, z);
            for (int d = 0; d < 6; d++) Schedule(x + Dir.DX[d], y + Dir.DY[d], z + Dir.DZ[d]);
        };
    }

    private static long Key(int x, int y, int z) => ((long)(x & 0x3FFFFFF) << 34) | ((long)(z & 0x3FFFFFF) << 8) | (long)(y & 0xFF);

    public void Schedule(int x, int y, int z)
    {
        if ((uint)y >= V.Height) return;
        if (_queued.Add(Key(x, y, z))) _now.Enqueue((x, y, z));
    }

    public void Step(float dt)
    {
        _timer += dt;
        if (_timer < Interval) return;
        _timer = 0f;
        int n = Math.Min(_now.Count, MaxPerStep);
        for (int i = 0; i < n; i++)
        {
            var (x, y, z) = _now.Dequeue();
            _queued.Remove(Key(x, y, z));
            Update(x, y, z);
        }
    }

    private bool Open(int x, int y, int z)
    {
        if (!_w.IsReady(x, z)) return false;
        ushort id = _w.GetBlock(x, y, z);
        if (Blocks.IsWater(id)) return false;
        var d = Blocks.Get(id);
        return id == 0 || (d.Replaceable && !d.Liquid) || (!d.Solid && d.Render == RenderKind.Cross);
    }

    /// <summary>What a cell's water should be, given its neighbours: -1 for none.</summary>
    private int Wanted(int x, int y, int z, ushort self)
    {
        if (self == Blocks.Water) return 0;
        if (Blocks.IsWater(_w.GetBlock(x, y + 1, z))) return 8;
        int best = 99, sources = 0;
        for (int d = 0; d < 6; d++)
        {
            if (d == Dir.PY || d == Dir.NY) continue;
            ushort n = _w.GetBlock(x + Dir.DX[d], y, z + Dir.DZ[d]);
            if (!Blocks.IsWater(n)) continue;
            int l = Blocks.WaterLevel(n);
            if (l == 0) sources++;
            if (l == 8) l = 0;          // a falling column spreads like a source where it lands
            best = Math.Min(best, l);
        }
        // Two sources meeting over something firm make a new source.
        if (sources >= 2)
        {
            ushort below = _w.GetBlock(x, y - 1, z);
            if (below == Blocks.Water || Blocks.Get(below).Solid) return 0;
        }
        int level = best + 1;
        return level <= 7 ? level : -1;
    }

    private void Update(int x, int y, int z)
    {
        if (!_w.IsReady(x, z)) return;
        ushort id = _w.GetBlock(x, y, z);
        bool isWater = Blocks.IsWater(id);
        if (!isWater && !Open(x, y, z)) return;

        int want = Wanted(x, y, z, id);
        if (!isWater)
        {
            // Air next to water: fill if fed.
            if (want < 0 || want == 0) { if (want == 0) Set(x, y, z, Blocks.Water); return; }
            // Only flow in if a neighbour can actually feed this far.
            Set(x, y, z, Blocks.FlowingWater(want));
            return;
        }

        if (id != Blocks.Water)
        {
            int have = Blocks.WaterLevel(id);
            if (want < 0) { Set(x, y, z, Blocks.Air); return; }
            if (want != have) { Set(x, y, z, want == 0 ? Blocks.Water : Blocks.FlowingWater(want)); return; }
        }

        // Spread: down first; sideways only from something resting on a floor.
        int level = Blocks.WaterLevel(id);
        if (Open(x, y - 1, z))
        {
            Set(x, y - 1, z, Blocks.WaterFalling);
            if (level != 0) return;
        }
        ushort below = _w.GetBlock(x, y - 1, z);
        bool floored = Blocks.Get(below).Solid || below == Blocks.Water;
        if (!floored && !Blocks.IsWater(below)) return;
        if (!floored && Blocks.IsWater(below) && below != Blocks.Water) return;   // still falling into moving water
        int next = (level == 8 ? 0 : level) + 1;
        if (next > 7) return;
        for (int d = 0; d < 6; d++)
        {
            if (d == Dir.PY || d == Dir.NY) continue;
            int nx = x + Dir.DX[d], nz = z + Dir.DZ[d];
            if (!Open(nx, y, nz)) continue;
            Set(nx, y, nz, Blocks.FlowingWater(next));
        }
    }

    private void Set(int x, int y, int z, ushort id)
    {
        ushort old = _w.GetBlock(x, y, z);
        if (old == id) return;
        // Plants caught by water wash away as items.
        var od = Blocks.Get(old);
        if (od.Render == RenderKind.Cross && !Blocks.IsWater(id)) return;
        if (od.Render == RenderKind.Cross) _w.BreakBlock(x, y, z, true);
        _w.SetBlock(x, y, z, id, updateNeighbours: true);
    }
}
