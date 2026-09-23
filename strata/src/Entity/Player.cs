using System;
using Godot;

namespace Strata;

/// <summary>
/// The person in the world: first-person movement over the voxel body,
/// mouse look, and everything the hands do — mine, place, use, fight, eat.
/// </summary>
public sealed partial class Player : Node3D
{
    // Movement tuning, in blocks and seconds.
    public const float WalkSpeed = 4.3f, SprintSpeed = 5.7f, SneakSpeed = 1.35f, SwimSpeed = 2.4f;
    public const float Gravity = 28f, JumpSpeed = 8.6f, TerminalSpeed = 60f;
    public const float EyeHeight = 1.62f, SneakEyeHeight = 1.33f;
    public const float Reach = 5f, AttackReach = 3.6f;
    private const float CoyoteTime = 0.1f, JumpBuffer = 0.14f;

    public readonly VoxelBody Body = new();
    public readonly Vitals Vitals = new();
    public readonly Inventory Inventory = new(36);
    public int Selected;
    public Camera3D Camera;
    public float Yaw, Pitch;
    public Vector3 Spawn;
    public bool HasBedSpawn;
    public bool Frozen = true;              // held still until the ground has loaded

    public bool Dead => Vitals.Dead;
    public bool Sneaking { get; private set; }
    public bool Sprinting { get; private set; }
    public RayHit Target;
    public Mob TargetMob;
    public float BreakProgress;             // 0..1 on the targeted block
    public float Eating;                    // seconds into eating
    public int Kills, BlocksMined, BlocksPlaced;
    public int BreakResets;                 // times the mining target changed (diagnostics)

    private float _coyote, _jumpBuffer, _eye = EyeHeight, _bob, _bobAmount, _fovKick, _tilt, _swing, _swingSpeed = 6f;
    private float _placeCooldown, _instantCooldown, _hitSoundTimer, _attackTimer = 10f, _stepDist;
    private bool _wasOnGround = true, _wasInWater;
    private double _fallStartY;
    private Vector3I _breakCell = new(int.MinValue, 0, 0);
    private MeshInstance3D _hand, _held;
    private ushort _heldItem = ushort.MaxValue;
    private float _heldDip;

    private Game G => Game.I;
    private World W => Game.I.World;

    public ItemStack HeldStack => Inventory[Selected];
    public ItemDef HeldDef => HeldStack.IsEmpty ? null : HeldStack.Def;
    public Vector3 EyePosition => Body.Position + new Vector3(0, _eye, 0);
    public Vector3 Forward => -Camera.GlobalTransform.Basis.Z;

    public override void _Ready()
    {
        Camera = new Camera3D { Near = 0.05f, Far = 2400f, Fov = 75f, Current = true };
        AddChild(Camera);
        _hand = new MeshInstance3D
        {
            Mesh = new BoxMesh { Size = new Vector3(0.09f, 0.09f, 0.34f) },
            CastShadow = GeometryInstance3D.ShadowCastingSetting.Off,
        };
        var handMat = new ShaderMaterial { Shader = GD.Load<Shader>("res://shaders/entity.gdshader"), RenderPriority = 10 };
        handMat.SetShaderParameter("tint", new Color(0.86f, 0.66f, 0.52f));
        _hand.MaterialOverride = handMat;
        Camera.AddChild(_hand);
        _held = new MeshInstance3D { CastShadow = GeometryInstance3D.ShadowCastingSetting.Off };
        Camera.AddChild(_held);
        Vitals.Hurt += OnHurt;
    }

    public void Teleport(Vector3 feet)
    {
        Body.Position = feet;
        Body.Vel = Vector3.Zero;
        Body.FallDistance = 0;
        _fallStartY = feet.Y;
    }

    // --- input -----------------------------------------------------------------------------

    public override void _UnhandledInput(InputEvent e)
    {
        if (G == null || G.InputBlocked || Dead) return;
        if (e is InputEventMouseMotion mm && Input.MouseMode == Input.MouseModeEnum.Captured)
        {
            float s = G.Settings.Sensitivity;
            Yaw -= mm.Relative.X * s;
            Pitch -= mm.Relative.Y * s * (G.Settings.InvertY ? -1f : 1f);
            Pitch = Math.Clamp(Pitch, -89.5f, 89.5f);
        }
        else if (e is InputEventMouseButton mb && mb.Pressed)
        {
            if (mb.ButtonIndex == MouseButton.WheelUp) SelectSlot((Selected + 8) % 9);
            else if (mb.ButtonIndex == MouseButton.WheelDown) SelectSlot((Selected + 1) % 9);
        }
        for (int i = 1; i <= 9; i++)
            if (e.IsActionPressed("slot_" + i)) SelectSlot(i - 1);
        if (e.IsActionPressed("drop")) DropHeld(Input.IsKeyPressed(Key.Ctrl));
        if (e.IsActionPressed("pick")) PickBlock();
        if (e.IsActionPressed("jump")) _jumpBuffer = JumpBuffer;
    }

    public void SelectSlot(int i)
    {
        if (i == Selected) return;
        Selected = i;
        Eating = 0;
        BreakProgress = 0;
        _heldDip = 1f;
    }

    // --- the frame -----------------------------------------------------------------------------

    public void Step(float dt)
    {
        if (Dead) return;
        // Physics in small steps so a slow frame never changes how far a jump goes.
        int steps = Math.Clamp((int)MathF.Ceiling(dt / (1f / 60f)), 1, 8);
        float h = dt / steps;
        for (int i = 0; i < steps; i++) Physics(h);

        Vitals.Tick(dt, Body.HeadInWater);
        if (Body.InLava) Vitals.Damage(4f, DamageKind.Lava);
        ContactDamage();
        if (Body.Y < -32) Vitals.Damage(4f, DamageKind.Void);

        UpdateCamera(dt);
        if (!G.InputBlocked) Hands(dt);
        else { BreakProgress = 0; Eating = 0; }
        UpdateViewmodel(dt);
    }

    private void Physics(float dt)
    {
        var b = Body;
        if (Frozen) { b.Vel = Vector3.Zero; return; }
        b.SenseMedium(W, _eye);

        bool blocked = G.InputBlocked;
        var input = blocked ? Vector2.Zero : Input.GetVector("move_left", "move_right", "move_forward", "move_back");
        bool jump = !blocked && Input.IsActionPressed("jump");
        Sneaking = !blocked && Input.IsActionPressed("sneak") && !b.InWater;
        if (!blocked && Input.IsActionPressed("sprint") && input.Y < -0.5f && !Sneaking && Vitals.CanSprint && Eating <= 0) Sprinting = true;
        if (input.Y > -0.3f || Sneaking || !Vitals.CanSprint || (b.HitX || b.HitZ) && b.OnGround) Sprinting = false;

        float yaw = Mathf.DegToRad(Yaw);
        var fwd = new Vector3(-MathF.Sin(yaw), 0, -MathF.Cos(yaw));
        var right = new Vector3(MathF.Cos(yaw), 0, -MathF.Sin(yaw));
        var wish = (right * input.X - fwd * input.Y);
        if (wish.LengthSquared() > 1f) wish = wish.Normalized();

        _jumpBuffer = Math.Max(0f, _jumpBuffer - dt);
        _coyote = b.OnGround ? CoyoteTime : Math.Max(0f, _coyote - dt);
        if (jump && b.OnGround) _jumpBuffer = Math.Max(_jumpBuffer, dt);

        var v = b.Vel;
        if (b.InWater || b.InLava)
        {
            float sp = b.InLava ? SwimSpeed * 0.5f : SwimSpeed * (Sprinting ? 1.5f : 1f);
            float k = 1f - MathF.Exp(-dt * 6f);
            v.X += (wish.X * sp - v.X) * k;
            v.Z += (wish.Z * sp - v.Z) * k;
            if (jump) v.Y = Mathf.MoveToward(v.Y, 3.4f, dt * 14f);
            else if (Input.IsActionPressed("sneak") && !blocked) v.Y = Mathf.MoveToward(v.Y, -3f, dt * 10f);
            else v.Y = Mathf.MoveToward(v.Y, -1.2f, dt * 5f);
            // Clamber out onto a bank.
            if (jump && (b.HitX || b.HitZ)) v.Y = 5.6f;
            b.FallDistance = 0;
            _fallStartY = b.Y;
        }
        else if (b.OnLadder)
        {
            float k = 1f - MathF.Exp(-dt * 12f);
            v.X += (wish.X * WalkSpeed * 0.6f - v.X) * k;
            v.Z += (wish.Z * WalkSpeed * 0.6f - v.Z) * k;
            if (jump || ((b.HitX || b.HitZ) && input.LengthSquared() > 0.01f)) v.Y = 3f;
            else if (Sneaking) v.Y = 0f;
            else v.Y = Math.Max(v.Y - Gravity * dt, -2.4f);
            b.FallDistance = 0;
            _fallStartY = b.Y;
        }
        else
        {
            float speed = Sneaking ? SneakSpeed : Sprinting ? SprintSpeed : WalkSpeed;
            if (Eating > 0) speed = Math.Min(speed, SneakSpeed * 1.2f);
            float accel = b.OnGround ? 16f : 3.2f;
            float k = 1f - MathF.Exp(-dt * accel);
            var target = wish * speed;
            // In the air, keep momentum you already have beyond what the keys ask for.
            if (!b.OnGround && new Vector2(v.X, v.Z).Length() > speed && wish.LengthSquared() > 0.01f) k *= 0.3f;
            v.X += (target.X - v.X) * k;
            v.Z += (target.Z - v.Z) * k;
            v.Y = Math.Max(v.Y - Gravity * dt, -TerminalSpeed);

            if (_jumpBuffer > 0f && _coyote > 0f)
            {
                v.Y = JumpSpeed;
                _jumpBuffer = 0f; _coyote = 0f;
                if (Sprinting) { v.X += fwd.X * 1.4f; v.Z += fwd.Z * 1.4f; }
                Vitals.Exhaust(Sprinting ? 0.2f : 0.05f);
            }
        }
        b.Vel = v;

        double y0 = b.Y;
        bool groundedBefore = b.OnGround;
        var moved = b.Move(W, v.X * dt, v.Y * dt, v.Z * dt, sneakEdge: Sneaking && b.OnGround);

        // Walking effort and footsteps.
        float horiz = new Vector2(moved.X, moved.Z).Length();
        if (b.OnGround && horiz > 0)
        {
            if (Sprinting) Vitals.Exhaust(horiz * 0.1f);
            _stepDist += horiz;
            if (_stepDist > (Sprinting ? 2.1f : 1.7f))
            {
                _stepDist = 0;
                Footstep(0.35f);
            }
        }

        // Falling and landing.
        if (b.OnGround)
        {
            if (!groundedBefore || !_wasOnGround)
            {
                float fell = (float)(_fallStartY - b.Y);
                float dmg = Vitals.FallDamage(fell);
                if (dmg > 0 && !b.InWater)
                {
                    Vitals.Damage(dmg, DamageKind.Fall, ignoreInvuln: true);
                    Sfx.Play("hurt_fall", EyePosition, 0.9f);
                }
                if (fell > 0.9f) Footstep(Math.Min(1f, 0.35f + fell * 0.1f));
            }
            _fallStartY = b.Y;
        }
        else if (b.Vel.Y > 0 || b.Y > _fallStartY) _fallStartY = Math.Max(_fallStartY, b.Y);
        _wasOnGround = b.OnGround;

        if (b.InWater && !_wasInWater && v.Y < -4f)
        {
            Sfx.Play("splash", Body.Position, 0.8f);
            G.Particles.Burst(Body.Position + new Vector3(0, 0.3f, 0), new Color(0.6f, 0.75f, 0.95f), 16, 3f, 0.08f);
        }
        _wasInWater = b.InWater;
    }

    private void Footstep(float vol)
    {
        int x = V.FloorToInt(Body.X), y = V.FloorToInt(Body.Y - 0.2), z = V.FloorToInt(Body.Z);
        var d = W.GetDef(x, y, z);
        if (d.Air || Body.InWater) { if (Body.InWater) Sfx.Play("swim", Body.Position, vol * 0.6f); return; }
        Sfx.Play(Sfx.BlockSound(d, "step"), Body.Position, vol);
    }

    private void ContactDamage()
    {
        var (x0, y0, z0, x1, y1, z1) = Body.Box;
        for (int y = (int)Math.Floor(y0 - 0.01); y <= (int)Math.Floor(y1); y++)
            for (int z = (int)Math.Floor(z0 - 0.01); z <= (int)Math.Floor(z1 + 0.01); z++)
                for (int x = (int)Math.Floor(x0 - 0.01); x <= (int)Math.Floor(x1 + 0.01); x++)
                {
                    var d = W.GetDef(x, y, z);
                    if (d.ContactDamage > 0 && d.Id != Blocks.Lava) { Vitals.Damage(d.ContactDamage, DamageKind.Cactus); return; }
                }
    }

    private void OnHurt(float amount, DamageKind kind)
    {
        _tilt = 1f;
        if (kind != DamageKind.Drown && kind != DamageKind.Starve) Sfx.Play("hurt_player", EyePosition, 0.8f);
    }

    public void Knockback(Vector3 from, float strength)
    {
        var d = Body.Position - from;
        d.Y = 0;
        if (d.LengthSquared() < 1e-4f) d = new Vector3(1, 0, 0);
        d = d.Normalized();
        Body.Vel += d * strength + new Vector3(0, Math.Min(4.5f, strength * 0.6f), 0);
    }

    // --- camera --------------------------------------------------------------------------------

    private void UpdateCamera(float dt)
    {
        float targetEye = Sneaking ? SneakEyeHeight : EyeHeight;
        _eye = Mathf.Lerp(_eye, targetEye, 1f - MathF.Exp(-dt * 14f));
        var b = Body;
        float speed = new Vector2(b.Vel.X, b.Vel.Z).Length();
        bool bobbing = G.Settings.ViewBobbing && b.OnGround && speed > 0.5f;
        _bobAmount = Mathf.Lerp(_bobAmount, bobbing ? Math.Min(1f, speed / WalkSpeed) : 0f, 1f - MathF.Exp(-dt * 8f));
        _bob += dt * speed * 1.75f;
        _tilt = Math.Max(0f, _tilt - dt * 3f);
        _fovKick = Mathf.Lerp(_fovKick, Sprinting ? 1f : 0f, 1f - MathF.Exp(-dt * 6f));

        var bobOff = new Vector3(MathF.Cos(_bob) * 0.035f, MathF.Abs(MathF.Sin(_bob)) * 0.055f, 0) * _bobAmount;
        Position = Body.Position;
        Camera.Position = new Vector3(0, _eye, 0);
        var basis = Basis.FromEuler(new Vector3(Mathf.DegToRad(Pitch), Mathf.DegToRad(Yaw), 0), EulerOrder.Yxz);
        float roll = MathF.Sin(_tilt * MathF.PI) * 0.08f * (_tilt > 0 ? 1 : 0) + MathF.Sin(_bob) * 0.006f * _bobAmount;
        Camera.Basis = basis * new Basis(Vector3.Back, roll);
        Camera.Position += basis * bobOff;
        Camera.Fov = G.Settings.Fov * (1f + 0.1f * _fovKick) * (Body.HeadInWater ? 0.92f : 1f);
    }

    // --- hands ---------------------------------------------------------------------------------

    private void Hands(float dt)
    {
        _placeCooldown = Math.Max(0f, _placeCooldown - dt);
        _instantCooldown = Math.Max(0f, _instantCooldown - dt);
        _attackTimer += dt;
        var eye = Camera.GlobalPosition;
        var dir = Forward;
        Target = VoxelRay.Cast(W, eye, dir, Reach);
        TargetMob = null;
        if (G.Mobs != null)
        {
            var m = G.Mobs.Raycast(eye, dir, AttackReach, out float mobDist);
            if (m != null && (!Target.Hit || mobDist < Target.Distance)) TargetMob = m;
        }

        bool attack = Input.IsActionPressed("attack");
        bool attackPressed = Input.IsActionJustPressed("attack");
        bool use = Input.IsActionPressed("use");
        bool usePressed = Input.IsActionJustPressed("use");

        // Fighting takes precedence over digging when something is in reach.
        if (attackPressed && TargetMob != null) { Attack(TargetMob); BreakProgress = 0; }
        else if (attack && TargetMob == null) Mine(dt, attackPressed);
        else { BreakProgress = 0; _breakCell = new Vector3I(int.MinValue, 0, 0); }
        if (attackPressed && TargetMob == null && !Target.Hit) Swing();

        // Eating is a held action; everything else on the use button is a click.
        var held = HeldDef;
        bool edible = held != null && held.IsFood && (Vitals.Hungry || held.Leftover != 0);
        if (use && edible && !(Target.Hit && IsUsable(Target.Id) && !Sneaking))
        {
            Eat(dt, held);
            return;
        }
        Eating = 0;
        if (use && _placeCooldown <= 0f && (usePressed || _placeCooldown <= 0f))
        {
            if (UseOrPlace()) { _placeCooldown = 0.22f; Swing(); }
            else if (usePressed) _placeCooldown = 0.1f;
        }
    }

    private void Swing()
    {
        if (_swing <= 0f || _swing > 0.5f) _swing = 1f;
    }

    private void Mine(float dt, bool pressed)
    {
        if (!Target.Hit) { BreakProgress = 0; return; }
        var cell = Target.Cell;
        if (cell != _breakCell) { _breakCell = cell; BreakProgress = 0; _hitSoundTimer = 0; BreakResets++; }
        var def = Blocks.Get(Target.Id);
        var (secs, harvest) = Items.BreakTime(def, HeldDef);
        if (float.IsInfinity(secs)) { BreakProgress = 0; return; }
        Swing();
        if (secs <= 0f)
        {
            if (!pressed && _instantCooldown > 0f) return;
            _instantCooldown = 0.18f;
            Break(cell, def, harvest);
            return;
        }
        BreakProgress += dt / secs;
        _hitSoundTimer -= dt;
        if (_hitSoundTimer <= 0f)
        {
            _hitSoundTimer = 0.22f;
            Sfx.Play(Sfx.BlockSound(def, "dig"), new Vector3(cell.X + 0.5f, cell.Y + 0.5f, cell.Z + 0.5f), 0.45f);
            G.Particles.BlockHit(cell.X, cell.Y, cell.Z, Target.Id, Target.Face);
        }
        if (BreakProgress >= 1f) Break(cell, def, harvest);
    }

    private void Break(Vector3I cell, BlockDef def, bool harvest)
    {
        BreakProgress = 0;
        _breakCell = new Vector3I(int.MinValue, 0, 0);
        if (!W.BreakBlock(cell.X, cell.Y, cell.Z, harvest)) return;
        BlocksMined++;
        Vitals.Exhaust(0.005f);
        if (def.Hardness > 0f) Wear(1);
    }

    /// <summary>Uses up tool durability; a worn-out tool breaks.</summary>
    public void Wear(int amount)
    {
        var s = Inventory[Selected];
        if (s.IsEmpty || !s.Def.IsTool) return;
        s.Wear += amount;
        if (s.Wear >= s.Def.Durability)
        {
            Inventory[Selected] = ItemStack.Empty;
            Sfx.Play("tool_break", EyePosition, 0.9f);
            G.Toast($"Your {s.Def.Name} broke");
        }
        else Inventory[Selected] = s;
    }

    private void Attack(Mob m)
    {
        var held = HeldDef;
        float cooldown = held?.Cooldown ?? 0.35f;
        float strength = Math.Clamp(_attackTimer / cooldown, 0.2f, 1f);
        _attackTimer = 0f;
        float dmg = (held != null && held.Tool != ToolKind.None ? held.Damage : 1f) * strength;
        if (held != null && held.NightBonus > 0 && m.Def.Nocturnal) dmg *= held.NightBonus;
        bool crit = !Body.OnGround && Body.Vel.Y < -1f && strength > 0.9f;
        if (crit) dmg *= 1.5f;
        float kb = (Sprinting ? 7f : 4.5f) * strength;
        Swing();
        if (m.Hurt(dmg, EyePosition, kb, this))
        {
            Sfx.Play(crit ? "hit_crit" : "hit", m.Position, 0.8f);
            if (crit) G.Particles.Burst(m.Position + new Vector3(0, m.Def.Height * 0.7f, 0), new Color(1f, 0.95f, 0.6f), 10, 3f, 0.06f, 2f, 0.5f, true);
            Vitals.Exhaust(0.1f);
            if (held != null && held.IsTool) Wear(held.Tool == ToolKind.Blade || held.Tool == ToolKind.Axe ? 1 : 2);
            if (m.Dead) Kills++;
            Sprinting = false;
        }
    }

    private void Eat(float dt, ItemDef food)
    {
        const float duration = 1.4f;
        float before = Eating;
        Eating += dt;
        if ((int)(before * 5) != (int)(Eating * 5))
        {
            Sfx.Play("eat", EyePosition, 0.6f);
            G.Particles.Burst(EyePosition + Forward * 0.4f - new Vector3(0, 0.25f, 0), food.Tint, 3, 1.5f, 0.05f);
        }
        if (Eating < duration) return;
        Eating = 0;
        Vitals.Eat(food);
        var s = Inventory[Selected];
        Inventory[Selected] = s.WithCount(s.Count - 1);
        if (food.Leftover != 0)
        {
            var left = new ItemStack(food.Leftover, 1);
            if (Inventory[Selected].IsEmpty) Inventory[Selected] = left;
            else { var rest = Inventory.Add(left); if (!rest.IsEmpty) DropStack(rest); }
        }
        Sfx.Play("burp", EyePosition, 0.5f);
    }

    public static bool IsUsable(ushort id)
    {
        var u = Blocks.Get(id).Use;
        return u is BlockUse.Worktable or BlockUse.Furnace or BlockUse.Crate or BlockUse.Door or BlockUse.Bed
            || (u == BlockUse.BerryBush && Blocks.Get(id).Ripe);
    }

    /// <summary>Right click: use the block you are looking at, or put down what you hold.</summary>
    private bool UseOrPlace()
    {
        if (!Target.Hit) return false;
        var cell = Target.Cell;
        var tdef = Blocks.Get(Target.Id);

        if (!Sneaking && IsUsable(Target.Id)) return UseBlock(cell, tdef);

        var held = HeldDef;
        if (held == null) return false;

        // Hoes till soil.
        if (held.Tool == ToolKind.Hoe && Target.Face == Dir.PY && (Target.Id == Blocks.Grass || Target.Id == Blocks.Dirt
            || Target.Id == Blocks.ForestFloor || Target.Id == Blocks.SnowyGrass) && W.GetBlock(cell.X, cell.Y + 1, cell.Z) == 0)
        {
            W.SetBlock(cell.X, cell.Y, cell.Z, Blocks.TilledSoil);
            Sfx.Play("dig_dirt", CellCenter(cell), 0.8f);
            Wear(1);
            return true;
        }

        if (held.Place == PlaceKind.None) return false;

        // Where it goes: into the targeted cell if that is replaceable (tall grass), else in front of the face.
        var at = tdef.Replaceable && !tdef.Liquid && Target.Id != 0 ? cell : Target.Adjacent;
        if (at.Y < 1 || at.Y >= V.Height - 1) return false;
        var cur = W.GetDef(at.X, at.Y, at.Z);
        if (!cur.Replaceable) return false;
        int face = at == cell ? Dir.PY : Target.Face;

        ushort id = 0;
        switch (held.Place)
        {
            case PlaceKind.Block:
            case PlaceKind.Plant:
                id = held.Block;
                break;
            case PlaceKind.Facing:
            {
                int f = FacingToward();
                id = (ushort)(held.Block + f);
                break;
            }
            case PlaceKind.Torch:
                if (face == Dir.NY) return false;
                id = face == Dir.PY ? Blocks.Torch : WallVariant(Blocks.TorchWall, Dir.Opposite(face));
                break;
            case PlaceKind.Ladder:
                if (face == Dir.PY || face == Dir.NY) return false;
                id = WallVariant(Blocks.Ladder, Dir.Opposite(face));
                break;
            case PlaceKind.Seed:
                if (W.GetBlock(at.X, at.Y - 1, at.Z) != Blocks.TilledSoil) return false;
                id = held.Block;
                break;
            case PlaceKind.Door:
                return PlaceDoor(at);
        }
        if (id == 0) return false;
        var def = Blocks.Get(id);
        if (!W.IsSupported(at.X, at.Y, at.Z, def) && (def.NeedsSupportBelow || def.SupportDir >= 0)) return false;
        if (def.Solid && Obstructed(at, def)) return false;

        if (!W.SetBlock(at.X, at.Y, at.Z, id)) return false;
        Consume();
        BlocksPlaced++;
        Sfx.Play(Sfx.BlockSound(def, "place"), CellCenter(at), 0.8f);
        return true;
    }

    private bool Obstructed(Vector3I at, BlockDef def)
    {
        var box = def.Box ?? new Aabb(Vector3.Zero, Vector3.One);
        var world = new Aabb(new Vector3(at.X, at.Y, at.Z) + box.Position, box.Size);
        if (Body.Intersects(world)) return true;
        return G.Mobs != null && G.Mobs.AnyIntersecting(world);
    }

    private static Vector3 CellCenter(Vector3I c) => new(c.X + 0.5f, c.Y + 0.5f, c.Z + 0.5f);

    private void Consume()
    {
        var s = Inventory[Selected];
        Inventory[Selected] = s.WithCount(s.Count - 1);
    }

    /// <summary>Which of the four facings points back at the player (0 N, 1 E, 2 S, 3 W).</summary>
    private int FacingToward()
    {
        float yaw = ((Yaw % 360f) + 360f) % 360f;
        // Yaw 0 looks toward -Z (north), so the block should face south (2) to look back at us.
        int look = (int)MathF.Round(yaw / 90f) % 4;   // 0 north, 1 west, 2 south, 3 east
        return look switch { 0 => 2, 1 => 1, 2 => 0, _ => 3 };
    }

    private static ushort WallVariant(ushort family, int supportDir)
    {
        for (int v = 0; v < 4; v++)
            if (Strata.Blocks.Get((ushort)(family + v)).SupportDir == supportDir) return (ushort)(family + v);
        return 0;
    }

    private bool PlaceDoor(Vector3I at)
    {
        if (!W.GetDef(at.X, at.Y + 1, at.Z).Replaceable) return false;
        var below = W.GetDef(at.X, at.Y - 1, at.Z);
        if (!below.Solid) return false;
        int f = (FacingToward() + 2) & 3;  // a door's panel sits on the side facing away from you
        var lower = Strata.Blocks.Get((ushort)(Strata.Blocks.Door + f));
        if (Obstructed(at, lower) || Obstructed(at + Vector3I.Up, lower)) return false;
        W.SetBlock(at.X, at.Y, at.Z, (ushort)(Strata.Blocks.Door + f), false);
        W.SetBlock(at.X, at.Y + 1, at.Z, (ushort)(Strata.Blocks.Door + f + 8), false);
        Consume();
        Sfx.Play("place_wood", CellCenter(at), 0.8f);
        return true;
    }

    private bool UseBlock(Vector3I cell, BlockDef def)
    {
        switch (def.Use)
        {
            case BlockUse.Worktable:
                G.OpenScreen(ScreenKind.Worktable, cell);
                return true;
            case BlockUse.Furnace:
                G.OpenScreen(ScreenKind.Furnace, cell);
                return true;
            case BlockUse.Crate:
                G.OpenScreen(ScreenKind.Crate, cell);
                Sfx.Play("crate_open", CellCenter(cell), 0.7f);
                return true;
            case BlockUse.Door:
            {
                int v = def.Variant;
                bool upper = (v & 8) != 0;
                int ly = upper ? cell.Y - 1 : cell.Y;
                ushort lower = W.GetBlock(cell.X, ly, cell.Z);
                ushort up = W.GetBlock(cell.X, ly + 1, cell.Z);
                if (!Strata.Blocks.IsDoor(lower) || !Strata.Blocks.IsDoor(up)) return false;
                int lv = Strata.Blocks.Get(lower).Variant ^ 4;
                // Do not swing a door shut on yourself.
                var closed = Strata.Blocks.Get((ushort)(Strata.Blocks.Door + (lv & 7)));
                if ((lv & 4) == 0 && (Obstructed(new Vector3I(cell.X, ly, cell.Z), closed) || Obstructed(new Vector3I(cell.X, ly + 1, cell.Z), closed))) return false;
                W.SetBlock(cell.X, ly, cell.Z, (ushort)(Strata.Blocks.Door + (lv & 7)), false);
                W.SetBlock(cell.X, ly + 1, cell.Z, (ushort)(Strata.Blocks.Door + (lv & 7) + 8), false);
                Sfx.Play((lv & 4) != 0 ? "door_open" : "door_close", CellCenter(cell), 0.7f);
                return true;
            }
            case BlockUse.Bed:
                G.TrySleep(cell);
                return true;
            case BlockUse.BerryBush:
                if (!def.Ripe) return false;
                W.SetBlock(cell.X, cell.Y, cell.Z, Strata.Blocks.BerryBushBare);
                G.Drops.SpawnAtBlock(new ItemStack(Items.Berries, (int)GD.RandRange(2, 3)), cell.X, cell.Y, cell.Z);
                Sfx.Play("dig_plant", CellCenter(cell), 0.7f);
                return true;
        }
        return false;
    }

    private void PickBlock()
    {
        if (!Target.Hit) return;
        var d = Blocks.Get(Target.Id);
        ushort want = d.DropItem;
        if (Items.ByKey.TryGetValue(Blocks.Get(d.Base).Key, out var same)) want = same;
        if (want == 0) return;
        for (int i = 0; i < 9; i++)
            if (!Inventory[i].IsEmpty && Inventory[i].Id == want) { SelectSlot(i); return; }
        // From the backpack into the hotbar.
        for (int i = 9; i < Inventory.Size; i++)
        {
            if (Inventory[i].IsEmpty || Inventory[i].Id != want) continue;
            var tmp = Inventory[Selected];
            Inventory[Selected] = Inventory[i];
            Inventory[i] = tmp;
            return;
        }
    }

    public void DropHeld(bool all)
    {
        var s = Inventory[Selected];
        if (s.IsEmpty) return;
        int n = all ? s.Count : 1;
        Inventory[Selected] = s.WithCount(s.Count - n);
        DropStack(s.WithCount(n));
    }

    public void DropStack(ItemStack s)
    {
        if (s.IsEmpty) return;
        var from = EyePosition - new Vector3(0, 0.3f, 0);
        G.Drops.Spawn(s, from, Forward * 5f + new Vector3(0, 1.5f, 0), 1.5f);
        Swing();
    }

    // --- held item ----------------------------------------------------------------------------

    private void UpdateViewmodel(float dt)
    {
        var stack = HeldStack;
        ushort id = stack.IsEmpty ? (ushort)0 : stack.Id;
        if (id != _heldItem)
        {
            _heldItem = id;
            if (id != 0)
            {
                var (mesh, mat) = ItemMeshes.Get(id, true);
                _held.Mesh = mesh;
                _held.MaterialOverride = mat;
            }
            _held.Visible = id != 0;
            _hand.Visible = id == 0;
        }
        _heldDip = Math.Max(0f, _heldDip - dt * 5f);
        if (_swing > 0f) _swing = Math.Max(0f, _swing - dt * _swingSpeed * 0.5f);
        float s = 1f - _swing;                                   // 0 at the start of a swing, 1 at the end
        float arc = _swing > 0 ? MathF.Sin(s * MathF.PI) : 0f;
        float bobX = MathF.Cos(_bob) * 0.012f * _bobAmount, bobY = MathF.Abs(MathF.Sin(_bob)) * 0.016f * _bobAmount;
        float eat = Eating > 0 ? MathF.Sin(Eating * 18f) * 0.02f : 0f;
        var basePos = new Vector3(0.42f + bobX, -0.36f - bobY - _heldDip * 0.4f + eat + (Eating > 0 ? 0.12f : 0f), -0.62f);

        byte l = W.GetLight(V.FloorToInt(EyePosition.X), V.FloorToInt(EyePosition.Y), V.FloorToInt(EyePosition.Z));
        var light = new Vector2((l >> 4) / 15f, (l & 15) / 15f);

        if (id == 0)
        {
            _hand.Position = basePos + new Vector3(0.06f - arc * 0.12f, -0.04f + arc * 0.1f, 0.02f - arc * 0.2f);
            _hand.Rotation = new Vector3(-0.2f - arc * 0.9f, -0.15f, 0.1f);
            _hand.SetInstanceShaderParameter("light_level", light);
            return;
        }
        var d = stack.Def;
        bool cube = d.Icon == IconKind.Cube;
        float scale = cube ? 0.26f : 0.46f;
        var rot = cube
            ? new Vector3(0.1f - arc * 0.8f, 0.8f, 0f)
            : new Vector3(-arc * 1.2f, 1.45f, 0.35f - arc * 0.6f);
        _held.Position = basePos + new Vector3(-arc * 0.1f - (cube ? 0.04f : 0f), arc * 0.08f, -arc * 0.18f);
        _held.Basis = Basis.FromEuler(rot).Scaled(new Vector3(scale, scale, scale));
        _held.SetInstanceShaderParameter("light_level", light);
    }
}
