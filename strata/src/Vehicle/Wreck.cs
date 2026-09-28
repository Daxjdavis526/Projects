using System;
using Godot;

namespace Strata;

/// <summary>
/// A piece of something that blew up: a box-shaped rigid body that tumbles,
/// bounces and slides to rest under the same physics as any vehicle, and
/// smoulders for a while. What it looked like (a tank section, a fin, the
/// engine bell) is up to whoever draws it.
/// </summary>
public sealed class Wreck : Vehicle
{
    public readonly Vector3 Size;
    public readonly string Look;          // which piece: tells the renderer what to draw
    public float Age, Burning;

    public Wreck(string look, Vector3 size, float mass)
    {
        Kind = "wreck";
        Look = look;
        Size = size;
        StructureMass = mass;
        StructureCentre = Vector3.Zero;
        // A solid box: I = m/12 (b² + c²) about each axis.
        Gyration = new Vector3(size.Y * size.Y + size.Z * size.Z, size.X * size.X + size.Z * size.Z, size.X * size.X + size.Y * size.Y) / 12f;
        MaxHealth = Health = float.MaxValue;
        SafeImpact = float.MaxValue;
        Restitution = 0.3f;
        Friction = 0.55f;
        var h = size / 2;
        for (int i = 0; i < 8; i++)
            Hull.Add(new Vector3((i & 1) != 0 ? h.X : -h.X, (i & 2) != 0 ? h.Y : -h.Y, (i & 4) != 0 ? h.Z : -h.Z));
        // Mid-edge points along long sides, so a long piece does not sink between its corners.
        if (size.Y > 3f)
            for (int i = 0; i < 4; i++)
                Hull.Add(new Vector3((i & 1) != 0 ? h.X : -h.X, 0, (i & 2) != 0 ? h.Z : -h.Z));
        UpdateMass();
    }
}
