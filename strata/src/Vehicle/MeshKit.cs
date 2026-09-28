using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// Builds small vertex-coloured meshes for vehicles out of turned shapes
/// (a profile swept round an axis: tanks, cones, engine bells), flat plates
/// (fins) and boxes. Each face carries a baked shade from a fixed light
/// direction in its alpha, which the entity shader turns into form, the way
/// creature models are shaded.
/// </summary>
public sealed class MeshKit
{
    private readonly List<Vector3> _v = new();
    private readonly List<Color> _c = new();
    private readonly List<int> _i = new();
    private static readonly Vector3 LightDir = new Vector3(0.45f, 0.8f, 0.35f).Normalized();

    public int Triangles => _i.Count / 3;

    private static float Shade(Vector3 n) => 0.58f + 0.42f * Math.Max(0f, n.Dot(LightDir)) + (n.Y < -0.5f ? -0.08f : 0f);

    /// <summary>A flat quad facing along n (the winding is fixed up to match).</summary>
    public void Quad(Vector3 a, Vector3 b, Vector3 c, Vector3 d, Color col, Vector3 n)
    {
        // Godot's front faces wind clockwise seen from the front.
        if ((b - a).Cross(c - a).Dot(n) > 0) (b, d) = (d, b);
        int k = _v.Count;
        var cc = new Color(col.R, col.G, col.B, Shade(n.Normalized()));
        _v.Add(a); _v.Add(b); _v.Add(c); _v.Add(d);
        _c.Add(cc); _c.Add(cc); _c.Add(cc); _c.Add(cc);
        _i.Add(k); _i.Add(k + 1); _i.Add(k + 2); _i.Add(k); _i.Add(k + 2); _i.Add(k + 3);
    }

    public void Tri(Vector3 a, Vector3 b, Vector3 c, Color col, Vector3 n)
    {
        if ((b - a).Cross(c - a).Dot(n) > 0) (b, c) = (c, b);
        int k = _v.Count;
        var cc = new Color(col.R, col.G, col.B, Shade(n.Normalized()));
        _v.Add(a); _v.Add(b); _v.Add(c);
        _c.Add(cc); _c.Add(cc); _c.Add(cc);
        _i.Add(k); _i.Add(k + 1); _i.Add(k + 2);
    }

    /// <summary>
    /// A surface of revolution about the y axis. The profile runs from the
    /// bottom to the top round the outside, as (y, radius) pairs; faces point
    /// away from the axis (or up and down on flat rings). Give the profile in
    /// the other order to face inward (the inside of a bell). The colour is
    /// asked for each face: (band index, segment index, mid height, mid angle).
    /// </summary>
    public void Lathe(IReadOnlyList<Vector2> profile, int segments, Func<int, int, float, float, Color> color, Vector3 offset = default, float angle0 = 0f)
    {
        for (int b = 0; b + 1 < profile.Count; b++)
        {
            var p0 = profile[b]; var p1 = profile[b + 1];
            float dy = p1.X - p0.X, dr = p1.Y - p0.Y;
            if (Math.Abs(dy) < 1e-5f && Math.Abs(dr) < 1e-5f) continue;
            for (int s = 0; s < segments; s++)
            {
                float a0 = angle0 + s * MathF.Tau / segments, a1 = angle0 + (s + 1) * MathF.Tau / segments, am = (a0 + a1) / 2;
                var d0 = new Vector3(MathF.Cos(a0), 0, MathF.Sin(a0));
                var d1 = new Vector3(MathF.Cos(a1), 0, MathF.Sin(a1));
                var dm = new Vector3(MathF.Cos(am), 0, MathF.Sin(am));
                var n = dm * dy + Vector3.Down * dr;              // outward normal of the profile (dy, -dr)
                var a = offset + d0 * p0.Y + Vector3.Up * p0.X;
                var bb = offset + d1 * p0.Y + Vector3.Up * p0.X;
                var c = offset + d1 * p1.Y + Vector3.Up * p1.X;
                var d = offset + d0 * p1.Y + Vector3.Up * p1.X;
                var col = color(b, s, (p0.X + p1.X) / 2, am);
                if (p0.Y < 1e-4f) Tri(a, c, d, col, n);
                else if (p1.Y < 1e-4f) Tri(a, bb, c, col, n);
                else Quad(a, bb, c, d, col, n);
            }
        }
    }

    /// <summary>A flat convex plate (a fin): a polygon in the (r, y) half-plane at angle a, t thick.</summary>
    public void Plate(IReadOnlyList<Vector2> poly, float angle, float t, Color col)
    {
        var dir = new Vector3(MathF.Cos(angle), 0, MathF.Sin(angle));
        var side = new Vector3(-MathF.Sin(angle), 0, MathF.Cos(angle));
        Vector3 P(Vector2 p, float s) => dir * p.X + Vector3.Up * p.Y + side * s;
        for (int k = 1; k + 1 < poly.Count; k++)
        {
            Tri(P(poly[0], t / 2), P(poly[k], t / 2), P(poly[k + 1], t / 2), col, side);
            Tri(P(poly[0], -t / 2), P(poly[k], -t / 2), P(poly[k + 1], -t / 2), col, -side);
        }
        for (int k = 0; k < poly.Count; k++)
        {
            var a = poly[k]; var b = poly[(k + 1) % poly.Count];
            var e = b - a;
            var n2 = new Vector2(e.Y, -e.X);                     // outward for a counter-clockwise (r, y) polygon
            var mid = (a + b) / 2;
            var centre = Vector2.Zero; foreach (var p in poly) centre += p; centre /= poly.Count;
            if (n2.Dot(mid - centre) < 0) n2 = -n2;
            var n = dir * n2.X + Vector3.Up * n2.Y;
            Quad(P(a, t / 2), P(b, t / 2), P(b, -t / 2), P(a, -t / 2), col.Darkened(0.1f), n);
        }
    }

    /// <summary>An axis-aligned box.</summary>
    public void Box(Vector3 min, Vector3 size, Color col)
    {
        var max = min + size;
        Quad(new(max.X, min.Y, min.Z), new(max.X, max.Y, min.Z), new(max.X, max.Y, max.Z), new(max.X, min.Y, max.Z), col, Vector3.Right);
        Quad(new(min.X, min.Y, min.Z), new(min.X, max.Y, min.Z), new(min.X, max.Y, max.Z), new(min.X, min.Y, max.Z), col, Vector3.Left);
        Quad(new(min.X, max.Y, min.Z), new(max.X, max.Y, min.Z), new(max.X, max.Y, max.Z), new(min.X, max.Y, max.Z), col, Vector3.Up);
        Quad(new(min.X, min.Y, min.Z), new(max.X, min.Y, min.Z), new(max.X, min.Y, max.Z), new(min.X, min.Y, max.Z), col, Vector3.Down);
        Quad(new(min.X, min.Y, max.Z), new(max.X, min.Y, max.Z), new(max.X, max.Y, max.Z), new(min.X, max.Y, max.Z), col, Vector3.Back);
        Quad(new(min.X, min.Y, min.Z), new(max.X, min.Y, min.Z), new(max.X, max.Y, min.Z), new(min.X, max.Y, min.Z), col, Vector3.Forward);
    }

    public ArrayMesh Build()
    {
        var arr = new Godot.Collections.Array();
        arr.Resize((int)Mesh.ArrayType.Max);
        arr[(int)Mesh.ArrayType.Vertex] = _v.ToArray();
        arr[(int)Mesh.ArrayType.Color] = _c.ToArray();
        arr[(int)Mesh.ArrayType.Index] = _i.ToArray();
        var mesh = new ArrayMesh();
        if (_v.Count > 0) mesh.AddSurfaceFromArrays(Mesh.PrimitiveType.Triangles, arr);
        return mesh;
    }
}
