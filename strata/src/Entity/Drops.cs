using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>An item lying in the world.</summary>
public sealed class ItemDrop
{
    public ItemStack Stack;
    public readonly VoxelBody Body = new() { HalfWidth = 0.14f, Height = 0.28f, StepHeight = 0f };
    public float Age, PickupDelay, Spin;
    public MeshInstance3D Node;
    public ushort NodeItem;
    public bool Dead;
}

/// <summary>
/// Dropped items: they fall and settle, bob and turn, drift toward a nearby
/// player once their pickup delay runs out, merge with identical neighbours,
/// and vanish after five minutes. They are saved with the world, so a death
/// pile is still there after a reload.
/// </summary>
public sealed partial class DropManager : Node3D
{
    public const float Lifetime = 300f;
    public readonly List<ItemDrop> All = new();
    private float _mergeTimer;
    public event Action<ItemStack> PickedUp;

    public ItemDrop Spawn(ItemStack stack, Vector3 pos, Vector3 vel, float delay = 0.5f)
    {
        if (stack.IsEmpty) return null;
        var d = new ItemDrop { Stack = stack, PickupDelay = delay, Spin = (float)GD.RandRange(0, Math.Tau) };
        d.Body.Position = pos - new Vector3(0, 0.14f, 0);
        d.Body.Vel = vel;
        All.Add(d);
        return d;
    }

    /// <summary>A block's worth of drops at the centre of a cell, popping out a little.</summary>
    public void SpawnAtBlock(ItemStack stack, int x, int y, int z)
    {
        var rng = new Vector3((float)GD.RandRange(-1.2, 1.2), (float)GD.RandRange(2.0, 3.5), (float)GD.RandRange(-1.2, 1.2));
        Spawn(stack, new Vector3(x + 0.5f, y + 0.35f, z + 0.5f), rng, 0.25f);
    }

    public void Step(float dt, World world, Player player)
    {
        var pp = player != null && !player.Dead ? player.Body.Position + new Vector3(0, 0.8f, 0) : new Vector3(float.NaN, 0, 0);
        foreach (var d in All)
        {
            if (d.Dead) continue;
            d.Age += dt;
            d.PickupDelay = Math.Max(0f, d.PickupDelay - dt);
            if (d.Age > Lifetime) { d.Dead = true; continue; }
            if (!world.IsReady(V.FloorToInt(d.Body.X), V.FloorToInt(d.Body.Z))) continue;  // frozen until its ground loads

            var b = d.Body;
            // A block placed on top of a drop pushes it out upward.
            if (b.Colliding(world)) { b.Y = Math.Floor(b.Y) + 1.0; b.Vel = Vector3.Zero; }

            b.SenseMedium(world, 0.1f);
            if (b.InWater) { b.Vel.Y = Mathf.MoveToward(b.Vel.Y, 1.2f, dt * 8f); b.Vel.X *= 0.9f; b.Vel.Z *= 0.9f; }
            else b.Vel.Y = Math.Max(b.Vel.Y - 18f * dt, -30f);

            // Pulled toward a player close by.
            if (!float.IsNaN(pp.X) && d.PickupDelay <= 0f)
            {
                var to = pp - b.Position;
                float dist = to.Length();
                if (dist < 2.6f)
                {
                    b.Vel = b.Vel.Lerp(to.Normalized() * 8f, Math.Min(1f, dt * 10f));
                    if (dist < 1.1f)
                    {
                        var left = player.Inventory.Add(d.Stack);
                        int taken = d.Stack.Count - left.Count;
                        if (taken > 0) PickedUp?.Invoke(d.Stack.WithCount(taken));
                        d.Stack = left;
                        if (left.IsEmpty) { d.Dead = true; continue; }
                    }
                }
            }
            b.Move(world, b.Vel.X * dt, b.Vel.Y * dt, b.Vel.Z * dt);
            if (b.OnGround) { float f = MathF.Exp(-dt * 8f); b.Vel.X *= f; b.Vel.Z *= f; }
            d.Spin += dt * 1.6f;
        }

        _mergeTimer -= dt;
        if (_mergeTimer <= 0f) { _mergeTimer = 0.5f; Merge(); }

        for (int i = All.Count - 1; i >= 0; i--)
        {
            if (!All[i].Dead) continue;
            All[i].Node?.QueueFree();
            All.RemoveAt(i);
        }
        UpdateVisuals(world);
    }

    private void Merge()
    {
        for (int i = 0; i < All.Count; i++)
        {
            var a = All[i];
            if (a.Dead || !a.Stack.Def.Stackable) continue;
            for (int j = i + 1; j < All.Count; j++)
            {
                var b = All[j];
                if (b.Dead || !a.Stack.CanStackWith(b.Stack)) continue;
                if ((a.Body.Position - b.Body.Position).LengthSquared() > 1.2f) continue;
                int max = a.Stack.Def.MaxStack;
                int n = Math.Min(max - a.Stack.Count, b.Stack.Count);
                if (n <= 0) continue;
                a.Stack.Count += n;
                b.Stack.Count -= n;
                a.Age = Math.Min(a.Age, b.Age);
                if (b.Stack.Count <= 0) b.Dead = true;
            }
        }
    }

    private void UpdateVisuals(World world)
    {
        foreach (var d in All)
        {
            if (d.Node == null || d.NodeItem != d.Stack.Id)
            {
                d.Node?.QueueFree();
                var (mesh, mat) = ItemMeshes.Get(d.Stack.Id, false);
                d.Node = new MeshInstance3D { Mesh = mesh, MaterialOverride = Rig.Own(mat), CastShadow = GeometryInstance3D.ShadowCastingSetting.Off };
                AddChild(d.Node);
                d.NodeItem = d.Stack.Id;
            }
            bool cube = d.Stack.Def.Icon == IconKind.Cube;
            float s = cube ? 0.26f : 0.42f;
            float bob = MathF.Sin(d.Age * 2.4f) * 0.06f + 0.08f;
            var p = d.Body.Position + new Vector3(0, 0.14f + bob, 0);
            d.Node.Transform = new Transform3D(new Basis(Vector3.Up, d.Spin).Scaled(new Vector3(s, s, s)), p);
            byte l = world.GetLight(V.FloorToInt(p.X), V.FloorToInt(p.Y), V.FloorToInt(p.Z));
            Rig.SetLight(d.Node, new Vector2((l >> 4) / 15f, (l & 15) / 15f));
            // Blink out in the last few seconds.
            d.Node.Visible = d.Age < Lifetime - 10f || ((int)(d.Age * 6) & 1) == 0;
        }
    }

    public void Clear()
    {
        foreach (var d in All) d.Node?.QueueFree();
        All.Clear();
    }
}
