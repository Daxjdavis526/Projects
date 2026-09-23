using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>A thorn in flight.</summary>
public sealed class Projectile
{
    public Vector3 Pos, Vel;
    public float Life = 5f, Damage;
    public Mob Owner;
    public MeshInstance3D Node;
    public bool Dead;
}

/// <summary>
/// Every creature: spawning under the right conditions and within caps,
/// thinking and moving each frame, dying into drops, despawning far away, and
/// the shared services they need (sight lines, short paths, projectiles).
/// </summary>
public sealed partial class MobManager : Node3D
{
    public const int PassiveCap = 12, HostileCap = 14;
    public readonly List<Mob> All = new();
    public readonly List<Projectile> Shots = new();
    public Game Game;
    public World World;
    public float Daylight = 1f;          // sunlight only, 0..1 (see Atmosphere.Sun)
    public bool SpawningEnabled = true;
    private float _spawnTimer = 2f, _rareTimer;
    private readonly Random _rng = new();
    private ShaderMaterial _thornMat;

    public int CountHostile { get; private set; }
    public int CountPassive { get; private set; }

    public Mob SpawnMob(MobKind kind, Vector3 pos)
    {
        var def = MobDefs.Get(kind);
        var m = new Mob(def, pos, (ulong)_rng.NextInt64());
        m.Body.StepHeight = 0f;
        m.Rig = def.Build(new Rig(_rng.Next()), 0);
        AddChild(m.Rig.Root);
        All.Add(m);
        return m;
    }

    public void Clear()
    {
        foreach (var m in All) m.Rig?.Root.QueueFree();
        All.Clear();
        foreach (var s in Shots) s.Node?.QueueFree();
        Shots.Clear();
    }

    public void Step(float dt, Player player)
    {
        if (World == null) return;
        CountHostile = CountPassive = 0;
        foreach (var m in All) { if (m.Def.Hostile) CountHostile++; else CountPassive++; }

        if (SpawningEnabled && player != null && !player.Dead)
        {
            _spawnTimer -= dt;
            if (_spawnTimer <= 0f)
            {
                _spawnTimer = 1f;
                TrySpawn(player);
            }
        }

        foreach (var m in All)
        {
            if (m.Removed) continue;
            // Frozen while the ground under it is not loaded.
            if (!World.IsReady(V.FloorToInt(m.Body.X), V.FloorToInt(m.Body.Z))) continue;
            if (m.Dead)
            {
                m.DyingTime += dt;
                m.Move(dt, World);
                if (m.DyingTime > 0.9f) Die(m);
            }
            else
            {
                m.Think(dt, World, player, this);
                m.Move(dt, World);
            }
            m.Pose(dt, World);

            // Despawn: far away, or a hunter lingering unseen at a distance.
            if (!m.Persistent && player != null)
            {
                float d = (m.Position - player.Body.Position).Length();
                if (d > 110f || (m.Def.Hostile && d > 48f && _rng.NextDouble() < dt / 40f)) m.Removed = true;
            }
        }
        for (int i = All.Count - 1; i >= 0; i--)
        {
            if (!All[i].Removed) continue;
            All[i].Rig?.Root.QueueFree();
            All.RemoveAt(i);
        }
        StepShots(dt, player);
    }

    private void Die(Mob m)
    {
        m.Removed = true;
        var p = m.Position + new Vector3(0, m.Def.Height * 0.4f, 0);
        Game?.Particles.Burst(p, new Color(0.85f, 0.85f, 0.85f), 18, 2.5f, 0.12f, -1f, 0.9f);
        foreach (var (key, chance, min, max) in m.Def.Drops)
        {
            if (_rng.NextDouble() >= chance) continue;
            if (!Items.ByKey.TryGetValue(key, out var id)) continue;
            int n = _rng.Next(min, max + 1);
            if (m.Scale < 1f) n = Math.Min(n, 1);
            Game?.Drops.Spawn(new ItemStack(id, n), p, new Vector3((float)_rng.NextDouble() * 2 - 1, 3f, (float)_rng.NextDouble() * 2 - 1), 0.4f);
        }
    }

    // --- spawning -------------------------------------------------------------------------

    private void TrySpawn(Player player)
    {
        var pp = player.Body.Position;
        bool night = Daylight < 0.45f;

        // Passive life: on sunlit grass away from the player.
        if (CountPassive < PassiveCap && _rng.NextDouble() < 0.35)
        {
            float a = (float)_rng.NextDouble() * MathF.Tau, d = 26f + (float)_rng.NextDouble() * 30f;
            int x = V.FloorToInt(pp.X + MathF.Cos(a) * d), z = V.FloorToInt(pp.Z + MathF.Sin(a) * d);
            if (World.IsReady(x, z))
            {
                int y = World.HeightAt(x, z);
                ushort ground = World.GetBlock(x, y - 1, z);
                var biome = World.Gen.BiomeAt(x, z);
                if ((ground == Blocks.Grass || ground == Blocks.ForestFloor || ground == Blocks.SnowyGrass) && World.GetBlock(x, y, z) is var above
                    && !Blocks.Get(above).Solid && World.SkyLight(x, y, z) >= 12)
                {
                    var kind = PickPassive(biome);
                    if (kind.HasValue)
                    {
                        int group = kind == MobKind.Pipwing ? _rng.Next(1, 3) : kind == MobKind.Burrowkit ? _rng.Next(1, 3) : _rng.Next(2, 5);
                        for (int i = 0; i < group && CountPassive < PassiveCap; i++)
                        {
                            int gx = x + _rng.Next(-3, 4), gz = z + _rng.Next(-3, 4);
                            int gy = World.HeightAt(gx, gz);
                            if (Math.Abs(gy - y) > 2 || Blocks.IsWater(World.GetBlock(gx, gy, gz))) continue;
                            var m = SpawnMob(kind.Value, new Vector3(gx + 0.5f, gy, gz + 0.5f));
                            if (m.Body.Colliding(World)) { m.Removed = true; continue; }
                            CountPassive++;
                        }
                    }
                }
            }
        }

        // Hunters: in darkness, at night on the surface or any time underground.
        if (CountHostile >= HostileCap) return;
        for (int attempt = 0; attempt < 3; attempt++)
        {
            float a = (float)_rng.NextDouble() * MathF.Tau, d = 20f + (float)_rng.NextDouble() * 26f;
            int x = V.FloorToInt(pp.X + MathF.Cos(a) * d), z = V.FloorToInt(pp.Z + MathF.Sin(a) * d);
            if (!World.IsReady(x, z)) continue;
            int surface = World.HeightAt(x, z);
            bool underground = _rng.NextDouble() < 0.5;
            int y = underground ? V.FloorToInt(pp.Y) + _rng.Next(-16, 17) : surface;
            if (y < 2 || y > 250) continue;
            // Drop to a floor.
            int tries = 0;
            while (y > 2 && !World.GetDef(x, y - 1, z).Solid && tries++ < 24) y--;
            if (!World.GetDef(x, y - 1, z).Solid) continue;
            if (World.GetDef(x, y, z).Solid || World.GetDef(x, y + 1, z).Solid) continue;
            if (Blocks.IsWater(World.GetBlock(x, y, z)) || World.GetBlock(x, y, z) == Blocks.Lava) continue;
            int sky = World.SkyLight(x, y, z), blk = World.BlockLight(x, y, z);
            float effectiveSky = sky * Daylight;
            if (blk > 0 || effectiveSky > 4.5f) continue;
            // Not in plain view right in front of the player.
            if ((new Vector3(x, y, z) - pp).Length() < 18f) continue;

            bool deep = sky == 0 && y < surface - 8;
            MobKind kind;
            double r = _rng.NextDouble();
            if (deep) kind = r < 0.5 ? MobKind.Lurker : r < 0.88 ? MobKind.Hollow : MobKind.Thornspitter;
            else
            {
                if (!night) continue;
                _rareTimer -= 1f;
                if (_rareTimer <= 0f && r < 0.04 && !Exists(MobKind.Gravemaw)) { kind = MobKind.Gravemaw; _rareTimer = 600f; }
                else kind = r < 0.66 ? MobKind.Hollow : MobKind.Thornspitter;
            }
            var def = MobDefs.Get(kind);
            if (def.Height > 2f && World.GetDef(x, y + 2, z).Solid) continue;
            var m = SpawnMob(kind, new Vector3(x + 0.5f, y, z + 0.5f));
            if (m.Body.Colliding(World)) { m.Removed = true; continue; }
            CountHostile++;
            return;
        }
    }

    private bool Exists(MobKind k)
    {
        foreach (var m in All) if (m.Def.Kind == k && !m.Removed) return true;
        return false;
    }

    private MobKind? PickPassive(Biome b)
    {
        double r = _rng.NextDouble();
        switch (b)
        {
            case Biome.Meadow: return r < 0.35 ? MobKind.Brindle : r < 0.6 ? MobKind.Mossback : r < 0.8 ? MobKind.Burrowkit : MobKind.Pipwing;
            case Biome.Savanna: return r < 0.5 ? MobKind.Brindle : r < 0.8 ? MobKind.Mossback : MobKind.Pipwing;
            case Biome.Elderwood: return r < 0.45 ? MobKind.Burrowkit : r < 0.8 ? MobKind.Pipwing : MobKind.Mossback;
            case Biome.Pinereach: return r < 0.4 ? MobKind.Mossback : r < 0.7 ? MobKind.Burrowkit : MobKind.Pipwing;
            case Biome.Frostveld: return r < 0.7 ? MobKind.Mossback : MobKind.Burrowkit;
            case Biome.Mirewood: return r < 0.6 ? MobKind.Pipwing : MobKind.Burrowkit;
            case Biome.Peaks: return MobKind.Mossback;
            case Biome.River: return r < 0.5 ? MobKind.Pipwing : MobKind.Brindle;
            default: return null;
        }
    }

    // --- services for mobs -----------------------------------------------------------------

    public bool LineOfSight(Vector3 from, Vector3 to)
    {
        var d = to - from;
        float len = d.Length();
        if (len < 0.01f) return true;
        var hit = VoxelRay.Cast(World, from, d / len, len);
        if (!hit.Hit) return true;
        return !Blocks.Get(hit.Id).Opaque;
    }

    public void MeleeHit(Mob m, Player p)
    {
        if (p.Vitals.Damage(m.Def.Damage, DamageKind.Mob))
        {
            p.Knockback(m.Position, m.Def.Kind == MobKind.Gravemaw ? 9f : 4.5f);
            Sfx.Play("hit_player", p.EyePosition, 0.8f);
        }
    }

    public void Slam(Mob m)
    {
        var p = Game?.Player;
        Sfx.Play("slam", m.Position, 1f);
        Game?.Particles.Burst(m.Position + new Vector3(0, 0.2f, 0), new Color(0.5f, 0.45f, 0.4f), 30, 5f, 0.14f, 12f, 0.8f);
        if (p == null || p.Dead) return;
        float d = (p.Body.Position - m.Position).Length();
        if (d < 4f && p.Vitals.Damage(m.Def.Damage * (1f - d / 5f), DamageKind.Mob))
            p.Knockback(m.Position, 11f);
    }

    public void Spit(Mob m, Vector3 target)
    {
        var from = m.Position + new Vector3(0, m.Def.Height * 0.85f, 0);
        var d = target - from;
        float dist = d.Length();
        float speed = 16f;
        float t = dist / speed;
        // Lead the aim upward to cancel gravity over the flight time.
        var vel = d / t + new Vector3(0, 0.5f * 9.8f * t, 0);
        if (_thornMat == null)
        {
            _thornMat = new ShaderMaterial { Shader = GD.Load<Shader>("res://shaders/entity.gdshader") };
            _thornMat.SetShaderParameter("tint", new Color(0.9f, 0.85f, 0.55f));
        }
        var node = new MeshInstance3D { Mesh = new BoxMesh { Size = new Vector3(0.08f, 0.08f, 0.3f) }, MaterialOverride = _thornMat };
        AddChild(node);
        Shots.Add(new Projectile { Pos = from, Vel = vel, Damage = m.Def.Damage, Owner = m, Node = node });
        Sfx.Play("spit", from, 0.8f);
    }

    private void StepShots(float dt, Player p)
    {
        foreach (var s in Shots)
        {
            s.Life -= dt;
            s.Vel.Y -= 9.8f * dt;
            var next = s.Pos + s.Vel * dt;
            var hit = VoxelRay.Cast(World, s.Pos, s.Vel.Normalized(), (next - s.Pos).Length());
            if (hit.Hit && Blocks.Get(hit.Id).Solid) { s.Dead = true; Game?.Particles.Burst(hit.Point, new Color(0.7f, 0.8f, 0.4f), 5, 1.5f, 0.05f); continue; }
            if (p != null && !p.Dead)
            {
                var b = p.Body;
                var box = new Aabb(new Vector3((float)b.X - 0.35f, (float)b.Y, (float)b.Z - 0.35f), new Vector3(0.7f, 1.85f, 0.7f));
                if (VoxelRay.RayBox(s.Pos, s.Vel.Normalized(), box.Position, box.End, out float tn, out _) && tn <= (next - s.Pos).Length())
                {
                    if (p.Vitals.Damage(s.Damage, DamageKind.Projectile)) { p.Knockback(s.Pos - s.Vel, 3f); Sfx.Play("hit_player", p.EyePosition, 0.7f); }
                    s.Dead = true;
                    continue;
                }
            }
            s.Pos = next;
            if (s.Life <= 0) s.Dead = true;
            if (s.Node != null)
            {
                s.Node.Position = s.Pos;
                if (s.Vel.LengthSquared() > 0.01f) s.Node.LookAt(s.Pos + s.Vel, Vector3.Up);
                byte l = World.GetLight(V.FloorToInt(s.Pos.X), V.FloorToInt(s.Pos.Y), V.FloorToInt(s.Pos.Z));
                s.Node.SetInstanceShaderParameter("light_level", new Vector2((l >> 4) / 15f, (l & 15) / 15f));
            }
        }
        for (int i = Shots.Count - 1; i >= 0; i--)
            if (Shots[i].Dead) { Shots[i].Node?.QueueFree(); Shots.RemoveAt(i); }
    }

    /// <summary>The nearest creature the ray passes through within reach.</summary>
    public Mob Raycast(Vector3 origin, Vector3 dir, float maxDist, out float dist)
    {
        Mob best = null;
        dist = maxDist;
        foreach (var m in All)
        {
            if (m.Dead || m.Removed) continue;
            var b = m.Bounds;
            b = b.Grow(0.1f);
            if (VoxelRay.RayBox(origin, dir, b.Position, b.End, out float t, out _) && t < dist) { dist = t; best = m; }
        }
        return best;
    }

    public bool AnyIntersecting(Aabb box)
    {
        foreach (var m in All)
            if (!m.Dead && !m.Removed && m.Body.Intersects(box)) return true;
        return false;
    }

    /// <summary>Feeding grain to livestock: two fed ones close together make a calf.</summary>
    public bool Feed(Mob m)
    {
        if (!m.Def.FollowsGrain || m.Scale < 1f || m.LoveTimer > 0f) return false;
        m.LoveTimer = 20f;
        m.Persistent = true;
        Game?.Particles.Burst(m.Position + new Vector3(0, m.Def.Height, 0), new Color(1f, 0.5f, 0.6f), 6, 1f, 0.08f, -1f, 1f, true);
        foreach (var o in All)
        {
            if (o == m || o.Def.Kind != m.Def.Kind || o.LoveTimer <= 0f || o.Scale < 1f) continue;
            if ((o.Position - m.Position).Length() > 5f) continue;
            o.LoveTimer = 0f; m.LoveTimer = 0f;
            var baby = SpawnMob(m.Def.Kind, (o.Position + m.Position) * 0.5f + new Vector3(0, 0.2f, 0));
            baby.SetScale(0.55f);
            baby.Persistent = true;
            Sfx.Play(m.Def.Voice + "_idle", baby.Position, 1f, 1.5f);
            break;
        }
        return true;
    }

    // --- short-range path finding -----------------------------------------------------------

    private readonly PriorityQueue<Vector3I, float> _open = new();
    private readonly Dictionary<Vector3I, Vector3I> _from = new();
    private readonly Dictionary<Vector3I, float> _cost = new();
    private static readonly Vector3I[] Steps = { new(1, 0, 0), new(-1, 0, 0), new(0, 0, 1), new(0, 0, -1) };

    /// <summary>
    /// A* over walkable cells (standable ground, one-block steps up, drops of
    /// up to three), capped at a few hundred nodes. Returns null if it gives up;
    /// the mob then steers straight, which is fine at close range.
    /// </summary>
    public List<Vector3I> FindPath(Mob m, Vector3 target)
    {
        var start = new Vector3I(V.FloorToInt(m.Body.X), V.FloorToInt(m.Body.Y + 0.1), V.FloorToInt(m.Body.Z));
        var goal = new Vector3I(V.FloorToInt(target.X), V.FloorToInt(target.Y + 0.1), V.FloorToInt(target.Z));
        if ((goal - start).LengthSquared() > 32 * 32) return null;
        _open.Clear(); _from.Clear(); _cost.Clear();
        _open.Enqueue(start, 0);
        _cost[start] = 0;
        Vector3I best = start;
        float bestH = H(start, goal);
        int expanded = 0;
        while (_open.Count > 0 && expanded < 500)
        {
            var c = _open.Dequeue();
            expanded++;
            if (c == goal) { best = c; break; }
            float h = H(c, goal);
            if (h < bestH) { bestH = h; best = c; }
            foreach (var s in Steps)
            {
                var n = c + s;
                // Same level, one up, or down up to three.
                for (int dy = 1; dy >= -3; dy--)
                {
                    var t = new Vector3I(n.X, n.Y + dy, n.Z);
                    if (!m.Standable(World, t.X, t.Y, t.Z)) continue;
                    if (Mob.Hazard(World, t.X, t.Y - 1, t.Z)) break;
                    if (dy == 1 && (World.GetDef(c.X, c.Y + (int)MathF.Ceiling(m.Def.Height), c.Z).Solid)) break; // no head room to hop
                    float g = _cost[c] + 1f + (dy != 0 ? 0.5f : 0f);
                    if (_cost.TryGetValue(t, out var old) && old <= g) break;
                    _cost[t] = g;
                    _from[t] = c;
                    _open.Enqueue(t, g + H(t, goal));
                    break;
                }
            }
        }
        if (best == start) return null;
        var path = new List<Vector3I>();
        var at = best;
        while (at != start && _from.TryGetValue(at, out var prev)) { path.Add(at); at = prev; }
        path.Reverse();
        return path;
    }

    private static float H(Vector3I a, Vector3I b) => Math.Abs(a.X - b.X) + Math.Abs(a.Z - b.Z) + Math.Abs(a.Y - b.Y) * 0.5f;
}
