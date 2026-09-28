using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// The rocket's look, built from turned shapes: a white tank with a black
/// roll pattern and a crimson band, a dark skirt and engine bell, crimson fins
/// on the diagonals, a silver capsule with its window and hatch facing the
/// tower, and an escape tower on top. The mesh is in the rocket's reference
/// frame (the origin is on the axis level with the fin tips), so it matches
/// the physics model's hull and parts exactly. Also the pieces it breaks into.
/// </summary>
public static class RocketModel
{
    public static readonly Color White = new(0.9f, 0.9f, 0.88f);
    public static readonly Color Black = new(0.1f, 0.1f, 0.11f);
    public static readonly Color Crimson = new(0.62f, 0.09f, 0.08f);
    public static readonly Color Steel = new(0.34f, 0.34f, 0.37f);
    public static readonly Color DarkSteel = new(0.2f, 0.2f, 0.22f);
    public static readonly Color Silver = new(0.72f, 0.73f, 0.75f);
    public static readonly Color Soot = new(0.16f, 0.13f, 0.12f);
    public static readonly Color Glass = new(0.08f, 0.12f, 0.18f);

    private const int Seg = 24;

    private static List<Vector2> P(params float[] yr)
    {
        var l = new List<Vector2>();
        for (int i = 0; i + 1 < yr.Length; i += 2) l.Add(new Vector2(yr[i], yr[i + 1]));
        return l;
    }

    public static readonly List<Vector2> FinShape = new()
    {
        new(1.6f, 1.2f), new(Rocket.FinSpan, 0f), new(Rocket.FinSpan, 3f), new(1.6f, 8f),
    };

    private static void Bell(MeshKit k, Vector3 at)
    {
        // Outside: from the nozzle exit up to the throat and the chamber.
        k.Lathe(P(0.6f, 1.25f, 1.6f, 0.95f, 2.5f, 0.6f, 2.8f, 0.5f, 3.1f, 0.7f, 3.4f, 0.7f), Seg,
            (b, s, y, a) => y < 0.9f ? Soot : b >= 3 ? DarkSteel : Steel, at);
        // Inside of the bell, seen from below: sooty, faintly warm.
        k.Lathe(P(2.6f, 0.46f, 1.6f, 0.9f, 0.62f, 1.2f), Seg, (b, s, y, a) => new Color(0.22f, 0.12f, 0.08f), at);
    }

    /// <summary>The whole rocket.</summary>
    public static ArrayMesh Build()
    {
        var k = new MeshKit();
        Bell(k, Vector3.Zero);
        // Body, bottom to top: a flat base, the skirt, the tank with its roll pattern, the intertank,
        // the upper tank, a crimson band, the capsule adapter, the capsule, and a cap.
        var body = P(2.0f, 0f, 2.0f, 1.75f, 4.6f, 1.75f, 5.0f, 1.7f, 9.5f, 1.7f, 14f, 1.7f, 15.2f, 1.7f, 20.6f, 1.7f, 21.6f, 1.7f, 22.4f, 1.7f, 24f, 1.7f, 24.3f, 1.649f, 26.2f, 1.326f, 26.3f, 1.309f, 27.6f, 1.088f, 29f, 0.85f, 29f, 0f);
        k.Lathe(body, Seg, (b, s, y, a) =>
        {
            int quad = (int)(((a % MathF.Tau) + MathF.Tau) % MathF.Tau / (MathF.PI / 2));
            if (y < 4.6f) return b == 0 ? Soot : ((s / 3) % 2 == 0 ? DarkSteel : Black);       // skirt, with vents
            if (y < 9.5f) return (quad % 2 == 0) ? Black : White;                              // roll pattern
            if (y < 14f) return (quad % 2 == 1) ? Black : White;
            if (y < 15.2f) return DarkSteel;                                                   // intertank
            if (y < 20.6f) return White;
            if (y < 21.6f) return Crimson;
            if (y < 22.4f) return White;
            if (y < 24f) return Silver.Darkened(0.12f);
            if (y < 29f)
            {
                // The capsule: its window and hatch face +x, toward the tower's crew arm.
                float off = MathF.Abs(Mathf.Wrap(a, -MathF.PI, MathF.PI));
                if (off < 0.28f && y > 26.3f && y < 27.6f) return Glass;
                if (off < 0.34f && y > 24.3f && y < 26.2f) return Silver.Darkened(0.28f);
                return Silver;
            }
            return Silver;
        }, default, MathF.PI / Seg);
        // Escape tower: a thin mast with a red tip.
        k.Lathe(P(29f, 0f, 29f, 0.3f, 29.6f, 0.3f, 29.6f, 0.2f, 32.2f, 0.2f, 32.2f, 0.36f, 32.9f, 0.3f, 33.5f, 0f), 12,
            (b, s, y, a) => y > 32.1f ? Crimson : DarkSteel);
        // Four fins on the diagonals, clear of the crew arm.
        for (int f = 0; f < 4; f++) k.Plate(FinShape, MathF.PI / 4 + f * MathF.PI / 2, 0.24f, Crimson);
        // Stringers on the skirt: four dark ribs between the fins.
        for (int f = 0; f < 4; f++)
        {
            float a = f * MathF.PI / 2;
            var d = new Vector3(MathF.Cos(a), 0, MathF.Sin(a));
            var c = d * 1.78f;
            k.Box(c + new Vector3(-0.12f, 2.0f, -0.12f), new Vector3(0.24f, 2.6f, 0.24f), Black);
        }
        return k.Build();
    }

    /// <summary>A broken piece, centred on its middle: what a wreck of that look is drawn as.</summary>
    public static ArrayMesh Piece(string look, Vector3 size)
    {
        var k = new MeshKit();
        var h = size / 2;
        switch (look)
        {
            case "engine":
                Bell(k, new Vector3(0, -1.9f, 0));
                break;
            case "tank_lower":
                k.Lathe(P(-h.Y, 0f, -h.Y, 1.7f, h.Y, 1.7f, h.Y, 0f), Seg, (b, s, y, a) => b == 1 ? (((int)(a / (MathF.PI / 2)) % 2 == 0) ? Black : White) : Soot);
                break;
            case "tank_upper":
                k.Lathe(P(-h.Y, 0f, -h.Y, 1.7f, h.Y, 1.7f, h.Y, 0f), Seg, (b, s, y, a) => b == 1 ? (y > h.Y - 1.2f ? Crimson : White) : Soot);
                break;
            case "capsule":
                k.Lathe(P(-h.Y, 0f, -h.Y, 1.7f, h.Y, 0.85f, h.Y, 0f), Seg, (b, s, y, a) =>
                {
                    float off = MathF.Abs(Mathf.Wrap(a, -MathF.PI, MathF.PI));
                    return b == 1 && off < 0.3f && y > 0.2f && y < 1.4f ? Glass : b == 0 ? Soot : Silver;
                });
                break;
            case "fin":
            {
                var shape = new List<Vector2>();
                foreach (var p in FinShape) shape.Add(new Vector2(p.X - (Rocket.FinSpan + 1.6f) / 2, p.Y - 4f));
                k.Plate(shape, 0f, 0.24f, Crimson);
                break;
            }
            default:
                k.Box(-h, size, look == "plate_dark" ? DarkSteel : White);
                break;
        }
        return k.Build();
    }
}
