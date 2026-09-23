using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// Streams the world around the player: generates columns in rings, lights
/// them once their neighbours exist, meshes them once their neighbours are lit,
/// and drops (saving if changed) whatever falls out of range. Heavy work runs on
/// the job queue; the main thread only moves results into the scene, within a
/// time budget so a burst of finished meshes never costs a frame.
/// </summary>
public sealed class ChunkManager : IDisposable
{
    public readonly World World;
    public readonly ChunkStore Store;
    public readonly Node3D Root;
    public readonly JobQueue Jobs;
    public int Radius = 8;
    public Material OpaqueMat, CutoutMat, WaterMat;

    private readonly ConcurrentQueue<(Chunk c, bool ok)> _genDone = new();
    private readonly ConcurrentQueue<(Chunk c, byte[] light)> _lightDone = new();
    private readonly ConcurrentQueue<(Chunk c, SlabMesh m)> _meshDone = new();
    private readonly Dictionary<long, MeshInstance3D[]> _nodes = new();
    private readonly Dictionary<long, int[]> _tris = new();
    private int _pcx = int.MinValue, _pcz = int.MinValue;
    private double _scanTimer;
    private readonly List<(int dx, int dz, float d)> _ring = new();
    private int _ringRadius = -1;

    public int Triangles { get; private set; }
    public int InFlightGen, InFlightLight, InFlightMesh;
    public double LastUpdateMs;

    public ChunkManager(World world, ChunkStore store, Node3D root, int workers)
    {
        World = world;
        Store = store;
        Root = root;
        Jobs = new JobQueue(workers);
    }

    private float GenRadius => Radius + 3f;
    private float LightRadius => Radius + 2f;
    private float UnloadRadius => Radius + 4.5f;

    // --- the frame ----------------------------------------------------------------------

    public void Update(Vector3 cam, double delta, double budgetMs = 5.0)
    {
        var t0 = Time.GetTicksUsec();
        int pcx = V.FloorToInt(cam.X) >> V.Shift, pcz = V.FloorToInt(cam.Z) >> V.Shift;
        bool moved = pcx != _pcx || pcz != _pcz;
        _scanTimer -= delta;
        if (moved || _scanTimer <= 0)
        {
            _pcx = pcx; _pcz = pcz;
            _scanTimer = 0.4;
            Scan(moved);
        }

        // Finished work comes back in the order it finished.
        while (_genDone.TryDequeue(out var g))
        {
            InFlightGen--;
            if (!World.Chunks.TryGetValue(g.c.Key, out var live) || live != g.c) continue;
            g.c.State = ChunkState.Generated;
            AdvanceAround(g.c.X, g.c.Z);
        }
        while (_lightDone.TryDequeue(out var l))
        {
            InFlightLight--;
            if (!World.Chunks.TryGetValue(l.c.Key, out var live) || live != l.c) continue;
            l.c.Light = l.light;
            l.c.LightedOnce = true;
            l.c.State = ChunkState.Lit;
            AdvanceAround(l.c.X, l.c.Z);
        }
        while (_meshDone.TryPeek(out var m))
        {
            if ((Time.GetTicksUsec() - t0) / 1000.0 > budgetMs) break;
            _meshDone.TryDequeue(out m);
            bool initialDone = m.c.State == ChunkState.Meshing && m.m.Slab == Chunk.Slabs - 1 && m.m.Seq >= 0;
            if (initialDone) InFlightMesh--;
            if (!World.Chunks.TryGetValue(m.c.Key, out var live) || live != m.c) continue;
            Apply(m.c, m.m);
            if (initialDone) m.c.State = ChunkState.Meshed;
        }

        Remesh(cam, t0, budgetMs + 3.0);
        LastUpdateMs = (Time.GetTicksUsec() - t0) / 1000.0;
    }

    /// <summary>Whether every column within r of the point is meshed (spawn waits on this).</summary>
    public bool AreaReady(Vector3 p, int r)
    {
        int cx = V.FloorToInt(p.X) >> V.Shift, cz = V.FloorToInt(p.Z) >> V.Shift;
        for (int dz = -r; dz <= r; dz++)
            for (int dx = -r; dx <= r; dx++)
            {
                var c = World.GetChunk(cx + dx, cz + dz);
                if (c == null || c.State != ChunkState.Meshed) return false;
            }
        return true;
    }

    private void BuildRing()
    {
        int r = (int)MathF.Ceiling(UnloadRadius) + 1;
        if (r == _ringRadius) return;
        _ringRadius = r;
        _ring.Clear();
        for (int dz = -r; dz <= r; dz++)
            for (int dx = -r; dx <= r; dx++)
                _ring.Add((dx, dz, MathF.Sqrt(dx * dx + dz * dz)));
        _ring.Sort((a, b) => a.d.CompareTo(b.d));
    }

    private void Scan(bool moved)
    {
        BuildRing();
        // Create what is missing, nearest first.
        foreach (var (dx, dz, d) in _ring)
        {
            if (d > GenRadius) break;
            int cx = _pcx + dx, cz = _pcz + dz;
            long key = V.Key(cx, cz);
            if (World.Chunks.ContainsKey(key)) continue;
            var c = new Chunk(cx, cz) { State = ChunkState.Generating };
            World.Chunks[key] = c;
            World.InvalidateCache();
            InFlightGen++;
            int pri = (int)(d * 10);
            Jobs.Enqueue(pri, () => GenerateJob(c));
        }

        // Advance anything that became eligible.
        foreach (var c in World.Chunks.Values) TryAdvance(c);

        // Unload what is far.
        List<Chunk> drop = null;
        foreach (var c in World.Chunks.Values)
        {
            float d = Dist(c.X, c.Z);
            if (d > UnloadRadius) (drop ??= new()).Add(c);
            else if (moved && _nodes.TryGetValue(c.Key, out var nodes))
            {
                bool vis = d <= Radius + 1.2f;
                foreach (var n in nodes) if (n != null) n.Visible = vis;
            }
        }
        if (drop != null) foreach (var c in drop) Unload(c);
    }

    private float Dist(int cx, int cz)
    {
        float dx = cx - _pcx, dz = cz - _pcz;
        return MathF.Sqrt(dx * dx + dz * dz);
    }

    private void AdvanceAround(int cx, int cz)
    {
        for (int dz = -1; dz <= 1; dz++)
            for (int dx = -1; dx <= 1; dx++)
            {
                var n = World.GetChunk(cx + dx, cz + dz);
                if (n != null) TryAdvance(n);
            }
    }

    private void TryAdvance(Chunk c)
    {
        float d = Dist(c.X, c.Z);
        if (c.State == ChunkState.Generated && d <= LightRadius)
        {
            var n = World.Neighbourhood(c.X, c.Z, ChunkState.Generated);
            if (n == null) return;
            c.State = ChunkState.Lighting;
            InFlightLight++;
            Jobs.Enqueue((int)(d * 10) + 1, () =>
            {
                if (c.UnloadRequested) { _lightDone.Enqueue((c, c.Light)); return; }
                var light = Lighting.ComputeColumn(n);
                _lightDone.Enqueue((c, light));
            });
        }
        else if (c.State == ChunkState.Lit && d <= Radius)
        {
            var n = World.Neighbourhood(c.X, c.Z, ChunkState.Lit);
            if (n == null) return;
            c.State = ChunkState.Meshing;
            c.DirtySlabs = 0;
            var seqs = new int[Chunk.Slabs];
            for (int s = 0; s < Chunk.Slabs; s++) seqs[s] = ++c.SlabSeq[s];
            InFlightMesh++;
            Jobs.Enqueue((int)(d * 10) + 2, () =>
            {
                for (int s = 0; s < Chunk.Slabs; s++)
                {
                    SlabMesh m;
                    if (c.UnloadRequested || c.SlabEmpty(s)) m = new SlabMesh { CX = c.X, CZ = c.Z, Slab = s, Seq = seqs[s] };
                    else m = Mesher.Build(n, s, seqs[s]);
                    _meshDone.Enqueue((c, m));
                }
            });
        }
    }

    private void GenerateJob(Chunk c)
    {
        if (c.UnloadRequested) { _genDone.Enqueue((c, false)); return; }
        byte[] saved = Store?.Read(c.X, c.Z);
        if (saved != null)
        {
            try
            {
                var loaded = Chunk.Deserialize(saved);
                Array.Copy(loaded.Blocks, c.Blocks, V.ColumnVolume);
                foreach (var kv in loaded.Entities) c.Entities[kv.Key] = kv.Value;
                c.Recount();
                c.Modified = true;
                World.Gen.FillTints(c);
                _genDone.Enqueue((c, true));
                return;
            }
            catch (Exception e)
            {
                GD.PrintErr($"column {c.X},{c.Z} failed to load ({e.Message}); regenerating");
            }
        }
        World.Gen.Generate(c);
        _genDone.Enqueue((c, true));
    }

    private void Unload(Chunk c)
    {
        c.UnloadRequested = true;
        World.Chunks.Remove(c.Key);
        World.InvalidateCache();
        if (c.Modified && Store != null && c.State >= ChunkState.Generated && c.State != ChunkState.Generating)
            Store.Write(c.X, c.Z, c.Serialize());
        if (_nodes.TryGetValue(c.Key, out var nodes))
        {
            foreach (var n in nodes) n?.QueueFree();
            _nodes.Remove(c.Key);
        }
        if (_tris.TryGetValue(c.Key, out var t))
        {
            foreach (var v in t) Triangles -= v;
            _tris.Remove(c.Key);
        }
    }

    /// <summary>Writes every changed column now (used by Save and on quit).</summary>
    public int SaveAll()
    {
        if (Store == null) return 0;
        int n = 0;
        foreach (var c in World.Chunks.Values)
        {
            if (!c.Modified || c.State < ChunkState.Generated || c.State == ChunkState.Generating) continue;
            Store.Write(c.X, c.Z, c.Serialize());
            n++;
        }
        Store.Flush();
        return n;
    }

    // --- meshes in the scene ------------------------------------------------------------

    private void Apply(Chunk c, SlabMesh m)
    {
        if (m.Seq <= c.SlabApplied[m.Slab]) return;
        c.SlabApplied[m.Slab] = m.Seq;
        if (!_nodes.TryGetValue(c.Key, out var nodes))
        {
            nodes = new MeshInstance3D[Chunk.Slabs];
            _nodes[c.Key] = nodes;
        }
        if (!_tris.TryGetValue(c.Key, out var tris)) _tris[c.Key] = tris = new int[Chunk.Slabs];
        Triangles += m.Triangles - tris[m.Slab];
        tris[m.Slab] = m.Triangles;

        var mi = nodes[m.Slab];
        if (m.Opaque == null && m.Cutout == null && m.Water == null)
        {
            if (mi != null) mi.Mesh = null;
            return;
        }
        var mesh = new ArrayMesh();
        int si = 0;
        if (m.Opaque != null) { mesh.AddSurfaceFromArrays(Mesh.PrimitiveType.Triangles, m.Opaque); mesh.SurfaceSetMaterial(si++, OpaqueMat); }
        if (m.Cutout != null) { mesh.AddSurfaceFromArrays(Mesh.PrimitiveType.Triangles, m.Cutout); mesh.SurfaceSetMaterial(si++, CutoutMat); }
        if (m.Water != null) { mesh.AddSurfaceFromArrays(Mesh.PrimitiveType.Triangles, m.Water); mesh.SurfaceSetMaterial(si++, WaterMat); }
        if (mi == null)
        {
            mi = new MeshInstance3D
            {
                CastShadow = GeometryInstance3D.ShadowCastingSetting.Off,
                GIMode = GeometryInstance3D.GIModeEnum.Disabled,
                Position = new Vector3(c.WorldX, 0, c.WorldZ),
            };
            Root.AddChild(mi);
            nodes[m.Slab] = mi;
        }
        mi.Mesh = mesh;
        mi.Visible = Dist(c.X, c.Z) <= Radius + 1.2f;
    }

    /// <summary>
    /// Slabs touched by edits get new meshes: right now for the columns around
    /// the player (so a broken block is gone the same frame), on workers for
    /// the rest (light spreading into the distance).
    /// </summary>
    private void Remesh(Vector3 cam, ulong t0, double budgetMs)
    {
        foreach (var c in World.Chunks.Values)
        {
            if (c.DirtySlabs == 0 || c.State != ChunkState.Meshed) continue;
            var n = World.Neighbourhood(c.X, c.Z, ChunkState.Lit);
            if (n == null) continue;
            float d = Dist(c.X, c.Z);
            bool near = d <= 1.5f && (Time.GetTicksUsec() - t0) / 1000.0 < budgetMs;
            for (int s = 0; s < Chunk.Slabs; s++)
            {
                if ((c.DirtySlabs & (1 << s)) == 0) continue;
                int seq = ++c.SlabSeq[s];
                if (near)
                {
                    Apply(c, Mesher.Build(n, s, seq));
                }
                else
                {
                    int ss = s;
                    Jobs.Enqueue(-1000 + (int)d, () => _meshDone.Enqueue((c, c.UnloadRequested
                        ? new SlabMesh { CX = c.X, CZ = c.Z, Slab = ss, Seq = -1 }
                        : Mesher.Build(n, ss, seq))));
                }
            }
            c.DirtySlabs = 0;
        }
    }

    public void Clear()
    {
        Jobs.Clear();
        Jobs.Drain();
        foreach (var nodes in _nodes.Values) foreach (var n in nodes) n?.QueueFree();
        _nodes.Clear();
        _tris.Clear();
        Triangles = 0;
        while (_genDone.TryDequeue(out _)) { }
        while (_lightDone.TryDequeue(out _)) { }
        while (_meshDone.TryDequeue(out _)) { }
        InFlightGen = InFlightLight = InFlightMesh = 0;
    }

    public void Dispose()
    {
        Jobs.Clear();
        Jobs.Dispose();
    }
}
