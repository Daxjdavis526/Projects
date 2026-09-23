using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

public enum MobKind : byte { Mossback, Burrowkit, Pipwing, Brindle, Hollow, Thornspitter, Lurker, Gravemaw }

public sealed class MobDef
{
    public MobKind Kind;
    public string Name;
    public bool Hostile;
    public bool Nocturnal;             // crumbles in sunlight; silver bites harder
    public float Health = 10f;
    public float Walk = 1.6f, Run = 4.5f;
    public float Width = 0.8f, Height = 1f;
    public float Damage, Reach = 1.5f, AttackCooldown = 1.2f;
    public bool Ranged;
    public float Detect = 16f;
    public bool Skittish;              // runs from a player who comes close
    public bool Grazes, Flies, Pounces, Slams, FollowsGrain;
    public float StepHeight = 0.6f;
    public (string item, float chance, int min, int max)[] Drops = { };
    public Func<Rig, int, Rig> Build;
    public string Voice;               // sound bank prefix
}

/// <summary>The eight creatures: four that live here, four that hunt.</summary>
public static class MobDefs
{
    public static readonly Dictionary<MobKind, MobDef> All = new();
    public static MobDef Get(MobKind k) => All[k];

    private static Color C(uint hex) => Pixel.Hex(hex);

    static MobDefs()
    {
        Add(new MobDef
        {
            Kind = MobKind.Mossback, Name = "Mossback", Health = 14, Walk = 1.3f, Run = 4.2f, Width = 1.1f, Height = 1.15f,
            Grazes = true, Voice = "mossback",
            Drops = new[] { ("raw_mossback", 1f, 1, 3), ("hide", 0.7f, 1, 2) },
            Build = Mossback,
        });
        Add(new MobDef
        {
            Kind = MobKind.Burrowkit, Name = "Burrowkit", Health = 4, Walk = 1.8f, Run = 6.2f, Width = 0.45f, Height = 0.55f,
            Skittish = true, Voice = "kit", StepHeight = 1.1f,
            Drops = new[] { ("raw_kit", 1f, 1, 1), ("hide", 0.3f, 1, 1) },
            Build = Burrowkit,
        });
        Add(new MobDef
        {
            Kind = MobKind.Pipwing, Name = "Pipwing", Health = 4, Walk = 1.2f, Run = 5f, Width = 0.45f, Height = 0.6f,
            Skittish = true, Flies = true, Voice = "pip",
            Drops = new[] { ("raw_fowl", 1f, 1, 1), ("feather", 0.8f, 1, 2) },
            Build = Pipwing,
        });
        Add(new MobDef
        {
            Kind = MobKind.Brindle, Name = "Brindle", Health = 12, Walk = 1.4f, Run = 4f, Width = 0.95f, Height = 1.4f,
            FollowsGrain = true, Voice = "brindle",
            Drops = new[] { ("raw_brisket", 1f, 1, 3), ("hide", 0.8f, 1, 2) },
            Build = Brindle,
        });
        Add(new MobDef
        {
            Kind = MobKind.Hollow, Name = "Hollow", Hostile = true, Nocturnal = true, Health = 20, Walk = 1.5f, Run = 3.6f,
            Width = 0.6f, Height = 1.9f, Damage = 3f, Reach = 1.6f, AttackCooldown = 1.1f, Detect = 22f, Voice = "hollow",
            Drops = new[] { ("bone", 0.7f, 1, 2), ("soot", 0.4f, 1, 1), ("lumen_shard", 0.05f, 1, 1) },
            Build = Hollow,
        });
        Add(new MobDef
        {
            Kind = MobKind.Thornspitter, Name = "Thornspitter", Hostile = true, Nocturnal = true, Health = 16, Walk = 1.2f, Run = 2.4f,
            Width = 0.8f, Height = 1.2f, Damage = 3f, Reach = 14f, AttackCooldown = 2.4f, Ranged = true, Detect = 20f, Voice = "spitter",
            Drops = new[] { ("spit_gland", 0.5f, 1, 1), ("fiber", 0.8f, 1, 3), ("grain_seeds", 0.2f, 1, 2) },
            Build = Thornspitter,
        });
        Add(new MobDef
        {
            Kind = MobKind.Lurker, Name = "Lurker", Hostile = true, Health = 16, Walk = 2f, Run = 6f, Width = 0.8f, Height = 0.8f,
            Damage = 4f, Reach = 1.4f, AttackCooldown = 1f, Detect = 18f, Pounces = true, Voice = "lurker",
            Drops = new[] { ("bone", 1f, 1, 2), ("hide", 0.4f, 1, 1), ("lumen_shard", 0.12f, 1, 1) },
            Build = Lurker,
        });
        Add(new MobDef
        {
            Kind = MobKind.Gravemaw, Name = "Gravemaw", Hostile = true, Nocturnal = true, Health = 70, Walk = 1.2f, Run = 3.2f,
            Width = 1.5f, Height = 2.4f, Damage = 8f, Reach = 2.4f, AttackCooldown = 2f, Detect = 26f, Slams = true, Voice = "gravemaw",
            StepHeight = 1.1f,
            Drops = new[] { ("iron_ingot", 1f, 2, 4), ("starmetal_ingot", 0.3f, 1, 1), ("hide", 1f, 2, 4), ("bone", 1f, 2, 4) },
            Build = Gravemaw,
        });
    }

    private static void Add(MobDef d) => All[d.Kind] = d;

    // --- models ------------------------------------------------------------------------------
    // Units are blocks; the root sits on the ground at the creature's centre, facing -Z.

    private static Rig Mossback(Rig r, int v)
    {
        var fur = C(0x5c5a3a); var moss = C(0x5d7d3a); var hide = C(0x4a3d2c); var horn = C(0xd8ccb0);
        r.Box("body", null, new(0, 0.55f, 0), new(-0.5f, -0.1f, -0.65f), new(1f, 0.62f, 1.3f), fur);
        r.Detail("body", new(-0.52f, 0.42f, -0.6f), new(1.04f, 0.16f, 1.2f), moss, 0.14f);  // moss on the back
        r.Detail("body", new(-0.3f, 0.52f, -0.35f), new(0.6f, 0.1f, 0.5f), Pixel.Shade(moss, 1.2f), 0.14f);
        r.Box("head", "body", new(0, 0.18f, -0.62f), new(-0.3f, -0.25f, -0.48f), new(0.6f, 0.45f, 0.5f), hide);
        r.Detail("head", new(-0.36f, 0.1f, -0.3f), new(0.14f, 0.12f, 0.12f), horn);
        r.Detail("head", new(0.22f, 0.1f, -0.3f), new(0.14f, 0.12f, 0.12f), horn);
        r.Detail("head", new(-0.2f, 0.02f, -0.49f), new(0.08f, 0.08f, 0.02f), C(0x101010));
        r.Detail("head", new(0.12f, 0.02f, -0.49f), new(0.08f, 0.08f, 0.02f), C(0x101010));
        r.Detail("head", new(-0.18f, -0.24f, -0.5f), new(0.36f, 0.14f, 0.1f), Pixel.Shade(hide, 0.8f));
        Legs(r, 0.3f, 0.4f, 0.22f, 0.5f, hide);
        return r;
    }

    private static Rig Burrowkit(Rig r, int v)
    {
        var fur = C(0xa8764a); var belly = C(0xe8dcc8); var dark = C(0x2a1d14);
        r.Box("body", null, new(0, 0.26f, 0), new(-0.17f, -0.1f, -0.25f), new(0.34f, 0.26f, 0.5f), fur);
        r.Detail("body", new(-0.12f, -0.11f, -0.2f), new(0.24f, 0.05f, 0.4f), belly);
        r.Box("head", "body", new(0, 0.12f, -0.24f), new(-0.13f, -0.08f, -0.22f), new(0.26f, 0.22f, 0.24f), fur);
        r.Detail("head", new(-0.1f, 0.12f, -0.1f), new(0.06f, 0.26f, 0.05f), fur);   // ears
        r.Detail("head", new(0.04f, 0.12f, -0.1f), new(0.06f, 0.26f, 0.05f), fur);
        r.Detail("head", new(-0.09f, 0.02f, -0.23f), new(0.05f, 0.05f, 0.02f), dark);
        r.Detail("head", new(0.04f, 0.02f, -0.23f), new(0.05f, 0.05f, 0.02f), dark);
        r.Detail("head", new(-0.04f, -0.05f, -0.24f), new(0.08f, 0.05f, 0.03f), belly);
        r.Box("tail", "body", new(0, 0.05f, 0.25f), new(-0.08f, -0.05f, 0f), new(0.16f, 0.18f, 0.28f), Pixel.Shade(fur, 1.15f));
        Legs(r, 0.1f, 0.14f, 0.08f, 0.18f, Pixel.Shade(fur, 0.85f));
        return r;
    }

    private static Rig Pipwing(Rig r, int v)
    {
        var slate = C(0x4e6a8c); var breast = C(0xe07a3a); var beak = C(0xe8c048);
        r.Box("body", null, new(0, 0.3f, 0), new(-0.16f, -0.14f, -0.2f), new(0.32f, 0.3f, 0.42f), slate);
        r.Detail("body", new(-0.13f, -0.12f, -0.22f), new(0.26f, 0.2f, 0.1f), breast);
        r.Box("head", "body", new(0, 0.16f, -0.16f), new(-0.11f, -0.02f, -0.12f), new(0.22f, 0.2f, 0.22f), slate);
        r.Detail("head", new(-0.03f, 0.03f, -0.22f), new(0.06f, 0.05f, 0.12f), beak);
        r.Detail("head", new(-0.12f, 0.08f, -0.08f), new(0.03f, 0.04f, 0.04f), C(0x101010));
        r.Detail("head", new(0.09f, 0.08f, -0.08f), new(0.03f, 0.04f, 0.04f), C(0x101010));
        r.Box("wingL", "body", new(-0.16f, 0.1f, 0f), new(-0.03f, -0.2f, -0.16f), new(0.03f, 0.22f, 0.36f), Pixel.Shade(slate, 0.8f));
        r.Box("wingR", "body", new(0.16f, 0.1f, 0f), new(0f, -0.2f, -0.16f), new(0.03f, 0.22f, 0.36f), Pixel.Shade(slate, 0.8f));
        r.Box("tail", "body", new(0, 0.02f, 0.2f), new(-0.08f, -0.02f, 0f), new(0.16f, 0.04f, 0.2f), Pixel.Shade(slate, 0.7f));
        r.Box("legFL", null, new(-0.07f, 0.16f, 0), new(-0.02f, -0.16f, -0.02f), new(0.04f, 0.16f, 0.04f), beak);
        r.Box("legFR", null, new(0.07f, 0.16f, 0), new(-0.02f, -0.16f, -0.02f), new(0.04f, 0.16f, 0.04f), beak);
        return r;
    }

    private static Rig Brindle(Rig r, int v)
    {
        var tan = C(0xb08a5c); var stripe = C(0x4a3424); var muzzle = C(0xd8c0a0); var tusk = C(0xf0e8d8);
        r.Box("body", null, new(0, 0.85f, 0), new(-0.42f, -0.3f, -0.6f), new(0.84f, 0.66f, 1.2f), tan);
        for (int k = 0; k < 4; k++) r.Detail("body", new(-0.43f, -0.28f, -0.45f + k * 0.28f), new(0.86f, 0.62f, 0.08f), stripe, 0.1f);
        r.Box("head", "body", new(0, 0.2f, -0.6f), new(-0.2f, -0.35f, -0.42f), new(0.4f, 0.5f, 0.45f), tan);
        r.Detail("head", new(-0.18f, -0.35f, -0.5f), new(0.36f, 0.2f, 0.16f), muzzle);
        r.Detail("head", new(-0.3f, 0.02f, -0.2f), new(0.12f, 0.2f, 0.06f), Pixel.Shade(tan, 0.8f)); // droopy ears
        r.Detail("head", new(0.18f, 0.02f, -0.2f), new(0.12f, 0.2f, 0.06f), Pixel.Shade(tan, 0.8f));
        r.Detail("head", new(-0.16f, -0.3f, -0.52f), new(0.04f, 0.14f, 0.04f), tusk);
        r.Detail("head", new(0.12f, -0.3f, -0.52f), new(0.04f, 0.14f, 0.04f), tusk);
        r.Detail("head", new(-0.15f, 0.0f, -0.43f), new(0.06f, 0.06f, 0.02f), C(0x101010));
        r.Detail("head", new(0.09f, 0.0f, -0.43f), new(0.06f, 0.06f, 0.02f), C(0x101010));
        r.Box("tail", "body", new(0, 0.2f, 0.6f), new(-0.04f, -0.5f, 0f), new(0.08f, 0.5f, 0.06f), stripe);
        Legs(r, 0.28f, 0.42f, 0.18f, 0.55f, Pixel.Shade(tan, 0.85f));
        return r;
    }

    private static Rig Hollow(Rig r, int v)
    {
        var bark = C(0x3c3834); var ash = C(0x5a534c); var eye = C(0x9ff6ff);
        r.Box("body", null, new(0, 1.05f, 0), new(-0.24f, 0f, -0.14f), new(0.48f, 0.62f, 0.28f), bark);
        r.Detail("body", new(-0.14f, 0.18f, -0.15f), new(0.28f, 0.3f, 0.04f), C(0x0c0a0a));        // the hollow
        r.Detail("body", new(-0.22f, 0.5f, -0.15f), new(0.44f, 0.08f, 0.3f), ash);
        r.Box("head", "body", new(0, 0.62f, 0), new(-0.17f, 0f, -0.17f), new(0.34f, 0.36f, 0.34f), ash);
        r.Detail("head", new(-0.12f, 0.16f, -0.18f), new(0.08f, 0.05f, 0.02f), eye);
        r.Detail("head", new(0.04f, 0.16f, -0.18f), new(0.08f, 0.05f, 0.02f), eye);
        r.Detail("head", new(-0.09f, 0.03f, -0.18f), new(0.18f, 0.04f, 0.02f), C(0x141010));
        r.Box("armL", "body", new(-0.3f, 0.58f, 0), new(-0.07f, -0.66f, -0.07f), new(0.14f, 0.7f, 0.14f), bark);
        r.Box("armR", "body", new(0.3f, 0.58f, 0), new(-0.07f, -0.66f, -0.07f), new(0.14f, 0.7f, 0.14f), bark);
        r.Box("legFL", null, new(-0.12f, 1.05f, 0), new(-0.08f, -1.05f, -0.08f), new(0.16f, 1.05f, 0.16f), Pixel.Shade(bark, 0.85f));
        r.Box("legFR", null, new(0.12f, 1.05f, 0), new(-0.08f, -1.05f, -0.08f), new(0.16f, 1.05f, 0.16f), Pixel.Shade(bark, 0.85f));
        return r;
    }

    private static Rig Thornspitter(Rig r, int v)
    {
        var skin = C(0x4f6a2e); var bulb = C(0x6a3f6e); var thorn = C(0xe8e0b0); var mouth = C(0x2a0f18);
        r.Box("body", null, new(0, 0.55f, 0), new(-0.36f, -0.2f, -0.36f), new(0.72f, 0.62f, 0.72f), bulb);
        r.Detail("body", new(-0.38f, -0.22f, -0.38f), new(0.76f, 0.18f, 0.76f), skin);
        r.Box("head", "body", new(0, 0.42f, 0), new(-0.26f, 0f, -0.26f), new(0.52f, 0.3f, 0.52f), skin);
        r.Detail("head", new(-0.12f, 0.06f, -0.27f), new(0.24f, 0.16f, 0.03f), mouth);
        for (int k = 0; k < 6; k++)
        {
            float a = k * MathF.Tau / 6f;
            r.Detail("head", new(MathF.Cos(a) * 0.2f - 0.03f, 0.28f, MathF.Sin(a) * 0.2f - 0.03f), new(0.06f, 0.22f, 0.06f), thorn);
        }
        r.Detail("head", new(-0.16f, 0.2f, -0.27f), new(0.06f, 0.05f, 0.02f), C(0xffd84a));
        r.Detail("head", new(0.1f, 0.2f, -0.27f), new(0.06f, 0.05f, 0.02f), C(0xffd84a));
        Legs(r, 0.26f, 0.26f, 0.1f, 0.36f, skin);
        return r;
    }

    private static Rig Lurker(Rig r, int v)
    {
        var pale = C(0xb9b4c0); var spine = C(0x6f6a7a); var maw = C(0x3a1016);
        r.Box("body", null, new(0, 0.5f, 0), new(-0.3f, -0.14f, -0.6f), new(0.6f, 0.36f, 1.2f), pale);
        for (int k = 0; k < 5; k++) r.Detail("body", new(-0.04f, 0.2f, -0.5f + k * 0.22f), new(0.08f, 0.16f, 0.1f), spine);
        r.Box("head", "body", new(0, 0.04f, -0.6f), new(-0.2f, -0.14f, -0.42f), new(0.4f, 0.28f, 0.44f), pale);
        r.Detail("head", new(-0.16f, -0.15f, -0.43f), new(0.32f, 0.08f, 0.3f), maw);
        r.Detail("head", new(-0.14f, -0.08f, -0.44f), new(0.03f, 0.08f, 0.03f), C(0xf4f0e8));
        r.Detail("head", new(0.11f, -0.08f, -0.44f), new(0.03f, 0.08f, 0.03f), C(0xf4f0e8));
        r.Box("tail", "body", new(0, 0.05f, 0.6f), new(-0.06f, -0.06f, 0f), new(0.12f, 0.12f, 0.6f), Pixel.Shade(pale, 0.85f));
        Legs(r, 0.26f, 0.42f, 0.1f, 0.38f, Pixel.Shade(pale, 0.9f));
        return r;
    }

    private static Rig Gravemaw(Rig r, int v)
    {
        var plate = C(0x3d4148); var hide = C(0x5a4a44); var bone = C(0xd8d0c0); var eye = C(0xff6a2a);
        r.Box("body", null, new(0, 1.4f, 0), new(-0.72f, -0.5f, -0.8f), new(1.44f, 1.1f, 1.5f), hide);
        r.Detail("body", new(-0.74f, 0.3f, -0.7f), new(1.48f, 0.34f, 1.3f), plate, 0.1f);
        for (int k = 0; k < 4; k++) r.Detail("body", new(-0.08f, 0.6f, -0.6f + k * 0.34f), new(0.16f, 0.3f, 0.2f), bone);
        r.Box("head", "body", new(0, 0.05f, -0.8f), new(-0.45f, -0.45f, -0.7f), new(0.9f, 0.6f, 0.75f), plate);
        r.Detail("head", new(-0.42f, -0.62f, -0.72f), new(0.84f, 0.24f, 0.7f), hide);    // the jaw
        for (int k = 0; k < 5; k++) r.Detail("head", new(-0.36f + k * 0.17f, -0.42f, -0.73f), new(0.06f, 0.14f, 0.04f), bone);
        r.Detail("head", new(-0.34f, -0.02f, -0.71f), new(0.14f, 0.1f, 0.02f), eye);
        r.Detail("head", new(0.2f, -0.02f, -0.71f), new(0.14f, 0.1f, 0.02f), eye);
        r.Detail("head", new(-0.55f, 0.02f, -0.3f), new(0.16f, 0.16f, 0.5f), bone);      // horns
        r.Detail("head", new(0.39f, 0.02f, -0.3f), new(0.16f, 0.16f, 0.5f), bone);
        r.Box("armL", "body", new(-0.8f, 0.3f, -0.4f), new(-0.2f, -1.2f, -0.2f), new(0.4f, 1.3f, 0.4f), hide);
        r.Box("armR", "body", new(0.8f, 0.3f, -0.4f), new(-0.2f, -1.2f, -0.2f), new(0.4f, 1.3f, 0.4f), hide);
        r.Box("legBL", null, new(-0.45f, 0.9f, 0.45f), new(-0.2f, -0.9f, -0.2f), new(0.4f, 0.9f, 0.4f), Pixel.Shade(hide, 0.85f));
        r.Box("legBR", null, new(0.45f, 0.9f, 0.45f), new(-0.2f, -0.9f, -0.2f), new(0.4f, 0.9f, 0.4f), Pixel.Shade(hide, 0.85f));
        return r;
    }

    /// <summary>Four legs hanging from hip pivots at the given half-width/half-length.</summary>
    private static void Legs(Rig r, float hx, float hz, float thick, float len, Color c)
    {
        foreach (var (name, x, z) in new[] { ("legFL", -hx, -hz), ("legFR", hx, -hz), ("legBL", -hx, hz), ("legBR", hx, hz) })
            r.Box(name, null, new(x, len, z), new(-thick / 2, -len, -thick / 2), new(thick, len, thick), c);
    }
}
