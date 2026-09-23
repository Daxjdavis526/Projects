using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// Lumen circuits. A switch that is on, or a tread plate with something
/// standing on it, powers the lumen traces beside it at strength 15; each
/// trace along the line is one weaker, so a signal carries fifteen blocks.
/// Traces link to their four neighbours on the level and to traces a step up
/// or down. Signal lamps light, and doors open, while anything beside them is
/// powered (a door follows changes in power, so one opened by hand stays
/// open until the power changes). Whenever something in a circuit changes, the whole network around
/// the change is worked out again from what is on the ground, so there is no
/// hidden state to go stale and nothing to save beyond the blocks themselves.
/// </summary>
public sealed class Signals
{
    private readonly World _w;
    private bool _writing;                                       // our own edits must not re-trigger us
    private readonly Queue<Vector3I> _dirty = new();
    private readonly HashSet<Vector3I> _dirtySet = new();
    private readonly Dictionary<Vector3I, float> _pressed = new();   // plates held down: seconds since last stood on
    private readonly List<Vector3> _feet = new();
    private readonly List<Vector3I> _retry = new();
    private readonly Dictionary<Vector3I, bool> _doorPower = new();    // lower half -> powered when last looked at
    public const int MaxNetwork = 4096;
    public const float PlateHold = 0.5f;
    public int Pending => _dirty.Count;

    private static readonly Vector3I[] Six =
    {
        new(1, 0, 0), new(-1, 0, 0), new(0, 1, 0), new(0, -1, 0), new(0, 0, 1), new(0, 0, -1),
    };
    private static readonly Vector3I[] Flat = { new(1, 0, 0), new(-1, 0, 0), new(0, 0, 1), new(0, 0, -1) };

    public Signals(World w)
    {
        _w = w;
        _w.BlockChanged += (x, y, z, old, id) =>
        {
            if (_writing) return;
            if (Relevant(old) || Relevant(id)) { Mark(new Vector3I(x, y, z)); return; }
            // A solid block appearing or vanishing beside a trace can join or cut a step.
            if (Blocks.Get(old).Opaque == Blocks.Get(id).Opaque) return;
            foreach (var d in Six)
                if (Blocks.IsTrace(_w.GetBlock(x + d.X, y + d.Y, z + d.Z))) { Mark(new Vector3I(x, y, z)); return; }
        };
        // A plate saved while held down comes back up once its column is loaded and nobody is on it.
        _w.ColumnReady += c =>
        {
            if (!c.Modified) return;
            var b = c.Blocks;
            for (int i = 0; i < b.Length; i++)
                if (b[i] == Blocks.TreadPlateDown)
                    _pressed[new Vector3I(c.X * V.Size + (i & 15), i >> 8, c.Z * V.Size + ((i >> 4) & 15))] = 0f;
        };
    }

    private static bool Relevant(ushort id) => Blocks.IsCircuit(id) || Blocks.IsDoor(id);

    public void Mark(Vector3I c)
    {
        if (_dirtySet.Add(c)) _dirty.Enqueue(c);
    }

    private ushort Get(Vector3I p) => _w.GetBlock(p.X, p.Y, p.Z);

    /// <summary>
    /// Presses the plates under the given feet, lets go of plates nobody has
    /// stood on for a moment, then settles every network that changed.
    /// </summary>
    public void Step(float dt, IEnumerable<Vector3> feet)
    {
        _feet.Clear();
        if (feet != null) _feet.AddRange(feet);
        foreach (var f in _feet)
        {
            var c = new Vector3I(V.FloorToInt(f.X), V.FloorToInt(f.Y + 0.01f), V.FloorToInt(f.Z));
            ushort id = Get(c);
            if (id != Blocks.TreadPlate && id != Blocks.TreadPlateDown) continue;
            _pressed[c] = 0f;
            if (id == Blocks.TreadPlate)
            {
                _w.SetBlock(c.X, c.Y, c.Z, Blocks.TreadPlateDown, false);
                Sfx.Play("plate", new Vector3(c.X + 0.5f, c.Y, c.Z + 0.5f), 0.6f);
            }
        }
        if (_pressed.Count > 0)
        {
            List<Vector3I> up = null;
            foreach (var c in new List<Vector3I>(_pressed.Keys))
            {
                float t = _pressed[c] + dt;
                _pressed[c] = t;
                if (t > PlateHold) (up ??= new List<Vector3I>()).Add(c);
            }
            if (up != null)
                foreach (var c in up)
                {
                    _pressed.Remove(c);
                    if (_w.ChunkAt(c.X, c.Z) == null) continue;
                    if (Get(c) != Blocks.TreadPlateDown) continue;
                    _w.SetBlock(c.X, c.Y, c.Z, Blocks.TreadPlate, false);
                    Sfx.Play("plate", new Vector3(c.X + 0.5f, c.Y, c.Z + 0.5f), 0.45f, 0.8f);
                }
        }
        for (int budget = 64; budget > 0 && _dirty.Count > 0; budget--)
        {
            var c = _dirty.Dequeue();
            _dirtySet.Remove(c);
            if (!_w.IsReady(c.X, c.Z)) continue;
            Settle(c);
        }
        foreach (var c in _retry) Mark(c);
        _retry.Clear();
    }

    /// <summary>A live source: a switch that is on, or a plate held down.</summary>
    private static bool Source(ushort id) => id == Blocks.SwitchOn || id == Blocks.TreadPlateDown;

    private static bool Listener(ushort id) => id == Blocks.SignalLamp || id == Blocks.SignalLampOn || Blocks.IsDoor(id);

    /// <summary>The traces a trace links to: four on the level, and any a step up or down.</summary>
    private IEnumerable<Vector3I> Links(Vector3I p)
    {
        foreach (var d in Flat)
        {
            var n = p + d;
            ushort nid = Get(n);
            if (Blocks.IsTrace(nid)) { yield return n; continue; }
            // Down a step, unless something solid sits over the lower trace; up a step, unless something is over this one.
            var down = n + new Vector3I(0, -1, 0);
            if (!Blocks.Get(nid).Opaque && Blocks.IsTrace(Get(down))) yield return down;
            var up = n + new Vector3I(0, 1, 0);
            if (Blocks.IsTrace(Get(up)) && !Blocks.Get(Get(p + new Vector3I(0, 1, 0))).Opaque) yield return up;
        }
    }

    private void Settle(Vector3I origin)
    {
        // 1. Every trace connected to the change.
        var net = new List<Vector3I>();
        var seen = new HashSet<Vector3I>();
        var q = new Queue<Vector3I>();
        void Seed(Vector3I p)
        {
            if (Blocks.IsTrace(Get(p)) && seen.Add(p)) q.Enqueue(p);
        }
        Seed(origin);
        foreach (var d in Six) Seed(origin + d);
        foreach (var d in Flat) { Seed(origin + d + new Vector3I(0, 1, 0)); Seed(origin + d + new Vector3I(0, -1, 0)); }
        while (q.Count > 0 && net.Count < MaxNetwork)
        {
            var p = q.Dequeue();
            net.Add(p);
            foreach (var n in Links(p))
                if (seen.Add(n)) q.Enqueue(n);
        }

        // 2. Strength: 15 beside a live source, one less for every trace further along.
        var level = new Dictionary<Vector3I, int>(net.Count);
        var bfs = new Queue<Vector3I>();
        foreach (var p in net)
        {
            bool fed = false;
            foreach (var d in Six) if (Source(Get(p + d))) { fed = true; break; }
            level[p] = fed ? 15 : 0;
            if (fed) bfs.Enqueue(p);
        }
        while (bfs.Count > 0)
        {
            var p = bfs.Dequeue();
            int l = level[p] - 1;
            if (l <= 0) continue;
            foreach (var n in Links(p))
                if (level.TryGetValue(n, out int have) && have < l) { level[n] = l; bfs.Enqueue(n); }
        }

        _writing = true;
        try
        {
            // 3. The traces show their strength.
            foreach (var p in net)
            {
                var want = (ushort)(Blocks.LumenTrace + level[p]);
                if (Get(p) != want) _w.SetBlock(p.X, p.Y, p.Z, want, false);
            }
            // 4. Lamps and doors beside the network, or beside the change itself, follow it.
            var listeners = new HashSet<Vector3I>();
            if (Listener(Get(origin))) listeners.Add(origin);
            foreach (var d in Six) if (Listener(Get(origin + d))) listeners.Add(origin + d);
            foreach (var p in net)
                foreach (var d in Six)
                    if (Listener(Get(p + d))) listeners.Add(p + d);
            foreach (var l in listeners) Apply(l);
        }
        finally { _writing = false; }
    }

    /// <summary>Whether anything beside a cell is powered.</summary>
    private bool Powered(Vector3I c)
    {
        foreach (var d in Six)
        {
            ushort id = Get(c + d);
            if (Source(id) || Blocks.TraceLevel(id) > 0) return true;
        }
        return false;
    }

    private void Apply(Vector3I c)
    {
        ushort id = Get(c);
        if (id == Blocks.SignalLamp || id == Blocks.SignalLampOn)
        {
            var want = Powered(c) ? Blocks.SignalLampOn : Blocks.SignalLamp;
            if (want != id) _w.SetBlock(c.X, c.Y, c.Z, want, false);
            return;
        }
        if (!Blocks.IsDoor(id)) return;
        // A door is two blocks; power beside either half opens it.
        int ly = (Blocks.Get(id).Variant & 8) != 0 ? c.Y - 1 : c.Y;
        var lower = new Vector3I(c.X, ly, c.Z);
        var upper = new Vector3I(c.X, ly + 1, c.Z);
        ushort lo = Get(lower), hi = Get(upper);
        if (!Blocks.IsDoor(lo) || !Blocks.IsDoor(hi)) { _doorPower.Remove(lower); return; }
        // Only a change in power moves a door: one opened or shut by hand is left alone.
        bool want2 = Powered(lower) || Powered(upper);
        if (_doorPower.TryGetValue(lower, out bool was) ? was == want2 : !want2) { _doorPower[lower] = want2; return; }
        bool open = (Blocks.Get(lo).Variant & 4) != 0;
        if (open == want2) { _doorPower[lower] = want2; return; }
        if (!want2 && Occupied(lower)) { _retry.Add(c); return; }    // never shut on someone; try again next step
        _doorPower[lower] = want2;
        int lv = Blocks.Get(lo).Variant ^ 4;
        _w.SetBlock(lower.X, lower.Y, lower.Z, (ushort)(Blocks.Door + (lv & 7)), false);
        _w.SetBlock(upper.X, upper.Y, upper.Z, (ushort)(Blocks.Door + (lv & 7) + 8), false);
        Sfx.Play(want2 ? "door_open" : "door_close", new Vector3(c.X + 0.5f, ly + 1, c.Z + 0.5f), 0.6f);
    }

    private bool Occupied(Vector3I lower)
    {
        foreach (var f in _feet)
            if (V.FloorToInt(f.X) == lower.X && V.FloorToInt(f.Z) == lower.Z && f.Y > lower.Y - 2f && f.Y < lower.Y + 2f) return true;
        return false;
    }
}
