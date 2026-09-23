using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

public enum MobState : byte { Idle, Wander, Flee, Chase, Graze, Follow, Fly, Dying }

/// <summary>
/// One creature: a voxel body, a rig, and a small state machine. Passive ones
/// idle, wander, graze and flee; hunters notice you by sight within range,
/// chase along a short path, strike when close, and give up when you get away.
/// All of them look before they step: no walking off cliffs or into lava.
/// </summary>
public sealed class Mob
{
    public readonly MobDef Def;
    public readonly VoxelBody Body = new();
    public float Health;
    public MobState State;
    public float Yaw, HeadYaw;
    public bool Dead => State == MobState.Dying;
    public bool Removed;
    public float Age, StateTime, Anim, AnimSpeed, Flash, DyingTime, AttackTimer, SunBurn;
    public bool Persistent;           // bred or named: never despawns
    public float Scale = 1f;          // babies are small
    public float LoveTimer, GrowTimer;
    public Rig Rig;
    public Vector3 Goal;
    public bool HasGoal;
    public List<Vector3I> Path;
    public int PathIndex;
    public float RepathTimer, LostSight, StuckTimer, AttackAnim, IdleSound;
    private Vector3 _lastPos;
    private readonly Rng _rng;

    public Vector3 Position => Body.Position;

    public Mob(MobDef def, Vector3 pos, ulong seed)
    {
        Def = def;
        Health = def.Health;
        Body.HalfWidth = def.Width * 0.5f;
        Body.Height = def.Height;
        Body.StepHeight = 0f;
        Body.Position = pos;
        _rng = new Rng(seed);
        Yaw = _rng.Range(0, MathF.Tau);
        State = MobState.Idle;
        StateTime = _rng.Range(0.5f, 3f);
        IdleSound = _rng.Range(4f, 14f);
    }

    /// <summary>Resizes the creature, body and all: babies are small, and grow.</summary>
    public void SetScale(float s)
    {
        Scale = s;
        Body.HalfWidth = Def.Width * 0.5f * s;
        Body.Height = Def.Height * s;
    }

    public float R(float a, float b) => _rng.Range(a, b);
    public bool Chance(float p) => _rng.Chance(p);

    /// <summary>A hit from the player (or anything). Returns true if it landed.</summary>
    public bool Hurt(float dmg, Vector3 from, float knockback, Player by)
    {
        if (Dead || Flash > 0.6f) return false;
        Health -= dmg;
        Flash = 1f;
        var d = Position - from; d.Y = 0;
        if (d.LengthSquared() < 1e-4f) d = new Vector3(0, 0, 1);
        d = d.Normalized();
        float kb = knockback * (Def.Kind == MobKind.Gravemaw ? 0.25f : 1f);
        Body.Vel += d * kb + new Vector3(0, Math.Min(5f, 2.5f + kb * 0.4f), 0);
        Sfx.Play(Def.Voice + "_hurt", Position + new Vector3(0, Def.Height * 0.6f, 0), 0.8f);
        if (Health <= 0f)
        {
            State = MobState.Dying;
            DyingTime = 0f;
            Sfx.Play(Def.Voice + "_death", Position, 0.9f);
            return true;
        }
        if (Def.Hostile) { State = MobState.Chase; StateTime = 12f; }
        else { State = MobState.Flee; StateTime = R(3f, 5f); Goal = Position + d * 12f; HasGoal = true; }
        return true;
    }

    public void SetState(MobState s, float time)
    {
        State = s; StateTime = time;
        Path = null; HasGoal = false;
    }

    // --- the brain --------------------------------------------------------------------------

    public void Think(float dt, World w, Player player, MobManager mgr)
    {
        Age += dt;
        StateTime -= dt;
        Flash = Math.Max(0f, Flash - dt * 4f);
        AttackTimer = Math.Max(0f, AttackTimer - dt);
        AttackAnim = Math.Max(0f, AttackAnim - dt * 3f);
        LoveTimer = Math.Max(0f, LoveTimer - dt);
        if (Scale < 1f) { GrowTimer += dt; if (GrowTimer > 300f) SetScale(1f); }

        IdleSound -= dt;
        if (IdleSound <= 0f)
        {
            IdleSound = R(6f, 16f);
            Sfx.Play(Def.Voice + "_idle", Position + new Vector3(0, Def.Height * 0.8f, 0), 0.5f);
        }

        var toPlayer = player != null && !player.Dead ? player.Body.Position - Position : new Vector3(1e6f, 0, 0);
        float distPlayer = toPlayer.Length();

        // Night-walkers come apart in direct sunlight.
        if (Def.Nocturnal && mgr.Daylight > 0.6f)
        {
            int sky = w.SkyLight(V.FloorToInt(Body.X), V.FloorToInt(Body.Y + Def.Height), V.FloorToInt(Body.Z));
            if (sky >= 13)
            {
                SunBurn += dt;
                if (SunBurn > 1f) { SunBurn = 0f; Hurt(2f, Position, 0f, null); mgr.Game?.Particles.Smoke(Position + new Vector3(0, Def.Height * 0.6f, 0), 4); }
            }
        }

        if (Def.Hostile) ThinkHunter(dt, w, player, distPlayer, toPlayer, mgr);
        else ThinkGrazer(dt, w, player, distPlayer, toPlayer, mgr);
    }

    private void ThinkGrazer(float dt, World w, Player player, float dist, Vector3 toPlayer, MobManager mgr)
    {
        bool threatened = Def.Skittish && player != null && !player.Sneaking && dist < 5f + (player.Sprinting ? 4f : 0f);
        if (threatened && State != MobState.Flee && State != MobState.Fly)
        {
            if (Def.Flies) { SetState(MobState.Fly, R(2.5f, 4f)); Goal = Position - toPlayer.Normalized() * 16f + new Vector3(R(-6, 6), 0, R(-6, 6)); HasGoal = true; Sfx.Play("flap", Position, 0.6f); }
            else { SetState(MobState.Flee, R(2f, 4f)); Goal = Position - toPlayer.Normalized() * 10f; HasGoal = true; }
        }

        // Livestock trails anyone holding grain.
        if (Def.FollowsGrain && player != null && dist < 9f && player.HeldStack.Id == Items.Grain && State != MobState.Flee)
        {
            if (State != MobState.Follow) SetState(MobState.Follow, 1f);
            StateTime = 1f;
        }

        switch (State)
        {
            case MobState.Idle:
                if (StateTime <= 0f)
                {
                    if (Def.Grazes && Chance(0.35f)) { SetState(MobState.Graze, R(2f, 4f)); break; }
                    PickWanderGoal(w, 10f);
                    SetState(MobState.Wander, R(4f, 9f));
                    HasGoal = true;
                }
                break;
            case MobState.Wander:
                if (!HasGoal || StateTime <= 0f || Arrived()) { SetState(MobState.Idle, R(2f, 6f)); break; }
                Steer(w, Goal, Def.Walk, dt);
                break;
            case MobState.Graze:
                AttackAnim = 0.5f + 0.5f * MathF.Sin(Age * 6f);
                if (StateTime <= 0f)
                {
                    // Grazing crops the grass it stands on.
                    int x = V.FloorToInt(Body.X), y = V.FloorToInt(Body.Y) - 1, z = V.FloorToInt(Body.Z);
                    ushort below = w.GetBlock(x, y, z);
                    if (below == Blocks.Grass && Chance(0.5f)) w.SetBlock(x, y, z, Blocks.Dirt);
                    else if (Blocks.Get(w.GetBlock(x, y + 1, z)).Id == Blocks.TallGrass) w.BreakBlock(x, y + 1, z, false);
                    SetState(MobState.Idle, R(1f, 4f));
                }
                break;
            case MobState.Flee:
                if (StateTime <= 0f) { SetState(MobState.Idle, R(1f, 3f)); break; }
                Steer(w, Goal, Def.Run, dt);
                break;
            case MobState.Fly:
                if (StateTime <= 0f && Body.OnGround) { SetState(MobState.Idle, R(1f, 3f)); break; }
                Fly(w, dt);
                break;
            case MobState.Follow:
                if (StateTime <= 0f || player == null) { SetState(MobState.Idle, 1f); break; }
                if (dist > 2.2f) Steer(w, player.Body.Position, Def.Walk * 1.4f, dt);
                else { Face(player.Body.Position, dt); Body.Vel.X *= 0.8f; Body.Vel.Z *= 0.8f; }
                break;
        }
    }

    private void ThinkHunter(float dt, World w, Player player, float dist, Vector3 toPlayer, MobManager mgr)
    {
        bool canSee = false;
        if (player != null && !player.Dead && dist < Def.Detect)
            canSee = mgr.LineOfSight(Position + new Vector3(0, Def.Height * 0.85f, 0), player.EyePosition);

        if (canSee && State != MobState.Chase) { SetState(MobState.Chase, 12f); Sfx.Play(Def.Voice + "_idle", Position, 0.8f); }

        switch (State)
        {
            case MobState.Idle:
                if (StateTime <= 0f) { PickWanderGoal(w, 8f); SetState(MobState.Wander, R(4f, 8f)); HasGoal = true; }
                break;
            case MobState.Wander:
                if (!HasGoal || StateTime <= 0f || Arrived()) { SetState(MobState.Idle, R(2f, 5f)); break; }
                Steer(w, Goal, Def.Walk, dt);
                break;
            case MobState.Chase:
            {
                if (player == null || player.Dead) { SetState(MobState.Idle, 2f); break; }
                LostSight = canSee ? 0f : LostSight + dt;
                if (dist > Def.Detect * 1.6f || LostSight > 8f) { SetState(MobState.Idle, R(2f, 4f)); break; }
                var target = player.Body.Position;
                if (Def.Ranged)
                {
                    // Keep a spitting distance and fire when there is a clear line.
                    Face(target, dt);
                    if (dist < 5f) Steer(w, Position - toPlayer.Normalized() * 6f, Def.Run, dt);
                    else if (dist > 11f || !canSee) FollowPath(w, target, Def.Run, dt, mgr);
                    else { Body.Vel.X *= 0.85f; Body.Vel.Z *= 0.85f; }
                    if (canSee && dist < Def.Reach && AttackTimer <= 0f)
                    {
                        AttackTimer = Def.AttackCooldown * R(0.8f, 1.2f);
                        AttackAnim = 1f;
                        mgr.Spit(this, player.EyePosition - new Vector3(0, 0.3f, 0));
                    }
                    break;
                }
                float horiz = new Vector2(toPlayer.X, toPlayer.Z).Length();
                bool inReach = horiz < Def.Reach + Def.Width * 0.5f && Math.Abs(toPlayer.Y + 0.5f) < 1.8f;
                if (inReach)
                {
                    Face(target, dt);
                    Body.Vel.X *= 0.7f; Body.Vel.Z *= 0.7f;
                    if (AttackTimer <= 0f && canSee)
                    {
                        AttackTimer = Def.AttackCooldown;
                        AttackAnim = 1f;
                        mgr.MeleeHit(this, player);
                    }
                }
                else if (Def.Pounces && horiz < 5.5f && horiz > 2f && Body.OnGround && AttackTimer <= 0f && canSee)
                {
                    // A lunge: low and fast.
                    var dir = new Vector3(toPlayer.X, 0, toPlayer.Z).Normalized();
                    Body.Vel = dir * 9f + new Vector3(0, 5.5f, 0);
                    AttackTimer = 1.6f;
                    AttackAnim = 1f;
                    Sfx.Play(Def.Voice + "_idle", Position, 1f, 1.3f);
                }
                else FollowPath(w, target, Def.Run, dt, mgr);
                if (Def.Slams && horiz < 3.2f && AttackTimer <= 0f && Body.OnGround)
                {
                    AttackTimer = Def.AttackCooldown * 1.5f;
                    AttackAnim = 1f;
                    mgr.Slam(this);
                }
                break;
            }
        }
    }

    private bool Arrived() => new Vector2(Goal.X - (float)Body.X, Goal.Z - (float)Body.Z).LengthSquared() < 1.2f;

    private void PickWanderGoal(World w, float range)
    {
        for (int tries = 0; tries < 6; tries++)
        {
            float a = R(0, MathF.Tau), d = R(3f, range);
            int x = V.FloorToInt(Body.X + MathF.Cos(a) * d), z = V.FloorToInt(Body.Z + MathF.Sin(a) * d);
            int y = V.FloorToInt(Body.Y);
            // Find standable ground near our height.
            for (int dy = 3; dy >= -4; dy--)
            {
                if (Standable(w, x, y + dy, z) && !Hazard(w, x, y + dy - 1, z))
                {
                    Goal = new Vector3(x + 0.5f, y + dy, z + 0.5f);
                    return;
                }
            }
        }
        Goal = Position;
    }

    public bool Standable(World w, int x, int y, int z)
    {
        var below = w.GetDef(x, y - 1, z);
        if (!below.Solid) return false;
        int h = (int)MathF.Ceiling(Def.Height * Scale);
        for (int k = 0; k < h; k++)
        {
            var d = w.GetDef(x, y + k, z);
            if (d.Solid || d.Id == Blocks.Lava) return false;
        }
        return true;
    }

    public static bool Hazard(World w, int x, int y, int z)
    {
        ushort b = w.GetBlock(x, y, z);
        return b == Blocks.Lava || Blocks.Get(b).ContactDamage > 0;
    }

    private void Face(Vector3 target, float dt)
    {
        var d = target - Position;
        if (d.X * d.X + d.Z * d.Z < 1e-4f) return;
        float want = MathF.Atan2(-d.X, -d.Z);
        Yaw = Mathf.LerpAngle(Yaw, want, 1f - MathF.Exp(-dt * 8f));
    }

    /// <summary>Walk toward a point, jumping single steps and refusing cliffs, water and fire.</summary>
    public void Steer(World w, Vector3 target, float speed, float dt)
    {
        var d = target - Position;
        d.Y = 0;
        float len = d.Length();
        if (len < 0.3f) { Body.Vel.X *= 0.7f; Body.Vel.Z *= 0.7f; return; }
        d /= len;
        Face(target, dt);

        // Look one step ahead.
        float look = Def.Width * 0.5f + 0.6f;
        int ax = V.FloorToInt(Body.X + d.X * look), az = V.FloorToInt(Body.Z + d.Z * look), ay = V.FloorToInt(Body.Y + 0.05);
        bool wall = w.GetDef(ax, ay, az).Solid;
        bool wallHigh = w.GetDef(ax, ay + 1, az).Solid;
        int drop = 0;
        if (!wall)
            while (drop < 5 && !w.GetDef(ax, ay - 1 - drop, az).Solid && !Blocks.IsWater(w.GetBlock(ax, ay - 1 - drop, az))) drop++;
        bool water = Blocks.IsWater(w.GetBlock(ax, ay - 1 - drop, az)) && State != MobState.Chase;
        bool danger = drop > 3 || Hazard(w, ax, ay - 1 - drop, az) || Hazard(w, ax, ay, az) || (water && !Def.Flies && State == MobState.Wander);
        if (danger && Body.OnGround)
        {
            // Turn away rather than step off.
            Body.Vel.X *= 0.3f; Body.Vel.Z *= 0.3f;
            if (State == MobState.Wander || State == MobState.Flee) { HasGoal = false; StateTime = Math.Min(StateTime, 0.2f); Yaw += MathF.PI * 0.5f; }
            return;
        }
        float k = 1f - MathF.Exp(-dt * (Body.OnGround ? 10f : 2f));
        Body.Vel.X += (d.X * speed - Body.Vel.X) * k;
        Body.Vel.Z += (d.Z * speed - Body.Vel.Z) * k;
        if (Body.OnGround && (wall || Body.HitX || Body.HitZ))
        {
            if (!wallHigh || Def.Height * Scale < 1f) Body.Vel.Y = 7.2f;   // hop the step
            else if (State == MobState.Wander) { HasGoal = false; StateTime = 0f; }
        }
        if (Body.InWater) Body.Vel.Y = Math.Max(Body.Vel.Y, 2.2f);    // paddle
    }

    private void FollowPath(World w, Vector3 target, float speed, float dt, MobManager mgr)
    {
        RepathTimer -= dt;
        bool stuck = StuckTimer > 1f;
        if (Path == null || RepathTimer <= 0f || stuck)
        {
            RepathTimer = R(0.8f, 1.4f);
            StuckTimer = 0f;
            Path = mgr.FindPath(this, target);
            PathIndex = 0;
        }
        Vector3 next = target;
        if (Path != null && Path.Count > 0)
        {
            while (PathIndex < Path.Count - 1)
            {
                var c = Path[PathIndex];
                var cp = new Vector3(c.X + 0.5f, c.Y, c.Z + 0.5f);
                if (new Vector2(cp.X - (float)Body.X, cp.Z - (float)Body.Z).LengthSquared() < 0.3f) PathIndex++;
                else break;
            }
            var n = Path[Math.Min(PathIndex, Path.Count - 1)];
            next = new Vector3(n.X + 0.5f, n.Y, n.Z + 0.5f);
        }
        Steer(w, next, speed, dt);
        var moved = Position - _lastPos;
        if (new Vector2(moved.X, moved.Z).Length() < speed * dt * 0.2f) StuckTimer += dt; else StuckTimer = 0f;
        _lastPos = Position;
    }

    private void Fly(World w, float dt)
    {
        var d = Goal - Position;
        d.Y = 0;
        float len = d.Length();
        if (len > 0.5f) d /= len;
        Face(Goal, dt);
        Body.Vel.X = Mathf.Lerp(Body.Vel.X, d.X * Def.Run, 1f - MathF.Exp(-dt * 3f));
        Body.Vel.Z = Mathf.Lerp(Body.Vel.Z, d.Z * Def.Run, 1f - MathF.Exp(-dt * 3f));
        // Climb while there is time left, then glide down.
        float ground = w.HeightAt(V.FloorToInt(Body.X), V.FloorToInt(Body.Z));
        if (StateTime > 0f && Body.Y < ground + 6f) Body.Vel.Y = Math.Max(Body.Vel.Y, 4.5f);
        else Body.Vel.Y = Math.Max(Body.Vel.Y, -1.5f);
        Anim += dt * 22f;
    }

    // --- body and animation -----------------------------------------------------------------

    public void Move(float dt, World w)
    {
        if (Removed) return;
        var b = Body;
        b.SenseMedium(w, Def.Height * 0.8f);
        float g = State == MobState.Fly ? 9f : 28f;
        if (b.InWater) b.Vel.Y = Math.Max(b.Vel.Y - 6f * dt, -2f);
        else b.Vel.Y = Math.Max(b.Vel.Y - g * dt, -50f);
        if (Dead) { b.Vel.X *= 0.9f; b.Vel.Z *= 0.9f; }
        double fallFrom = b.Y;
        b.Move(w, b.Vel.X * dt, b.Vel.Y * dt, b.Vel.Z * dt);
        if (b.OnGround && !Dead)
        {
            float f = MathF.Exp(-dt * 6f);
            if (State == MobState.Idle || State == MobState.Graze) { b.Vel.X *= f; b.Vel.Z *= f; }
        }
        if (b.InLava && !Dead) Hurt(4f * dt * 4f, Position, 0f, null);
        float speed = new Vector2(b.Vel.X, b.Vel.Z).Length();
        AnimSpeed = Mathf.Lerp(AnimSpeed, speed, 1f - MathF.Exp(-dt * 8f));
        if (State != MobState.Fly) Anim += dt * AnimSpeed * 3.2f / Math.Max(0.5f, Def.Height * Scale);
    }

    public void Pose(float dt, World w)
    {
        if (Rig == null) return;
        var root = Rig.Root;
        float s = Scale;
        root.Position = Position;
        root.Rotation = new Vector3(0, Yaw, 0);
        root.Scale = new Vector3(s, s, s);
        float swing = MathF.Sin(Anim) * Math.Min(1f, AnimSpeed / 2f) * 0.8f;
        if (Rig["legFL"] is Node3D fl) fl.Rotation = new Vector3(swing, 0, 0);
        if (Rig["legBR"] is Node3D br) br.Rotation = new Vector3(swing, 0, 0);
        if (Rig["legFR"] is Node3D fr) fr.Rotation = new Vector3(-swing, 0, 0);
        if (Rig["legBL"] is Node3D bl) bl.Rotation = new Vector3(-swing, 0, 0);
        if (Rig["armL"] is Node3D al)
        {
            float reach = State == MobState.Chase && Def.Kind == MobKind.Hollow ? -1.3f : 0f;
            al.Rotation = new Vector3(reach - swing * 0.6f - AttackAnim * 0.8f, 0, 0);
        }
        if (Rig["armR"] is Node3D ar)
        {
            float reach = State == MobState.Chase && Def.Kind == MobKind.Hollow ? -1.3f : 0f;
            ar.Rotation = new Vector3(reach + swing * 0.6f - AttackAnim * 0.8f, 0, 0);
        }
        if (Rig["head"] is Node3D head)
        {
            float nod = State == MobState.Graze ? 0.6f + AttackAnim * 0.3f : -AttackAnim * 0.35f;
            head.Rotation = new Vector3(nod + MathF.Sin(Age * 1.3f) * 0.04f, MathF.Sin(Age * 0.7f) * 0.15f, 0);
        }
        if (Rig["tail"] is Node3D tail) tail.Rotation = new Vector3(0.3f + MathF.Sin(Age * 3f) * 0.15f, MathF.Sin(Age * 2.1f) * 0.3f, 0);
        if (Rig["wingL"] is Node3D wl)
        {
            float flap = State == MobState.Fly ? MathF.Sin(Anim) * 1.1f : 0.05f;
            wl.Rotation = new Vector3(0, 0, -flap);
            if (Rig["wingR"] is Node3D wr) wr.Rotation = new Vector3(0, 0, flap);
        }
        if (Dead)
        {
            float t = Math.Min(1f, DyingTime * 2.5f);
            root.Rotation = new Vector3(0, Yaw, t * MathF.PI * 0.5f);
        }
        byte l = w.GetLight(V.FloorToInt(Body.X), V.FloorToInt(Body.Y + Def.Height * 0.5f), V.FloorToInt(Body.Z));
        float glow = Def.Kind == MobKind.Hollow || Def.Kind == MobKind.Gravemaw ? 0f : 0f;
        Rig.SetLight(new Vector2((l >> 4) / 15f, (l & 15) / 15f), Math.Max(Flash, Dead ? 0.6f : 0f), glow);
    }

    public Aabb Bounds
    {
        get
        {
            var (x0, y0, z0, x1, y1, z1) = Body.Box;
            return new Aabb(new Vector3((float)x0, (float)y0, (float)z0), new Vector3((float)(x1 - x0), (float)(y1 - y0), (float)(z1 - z0)));
        }
    }
}
