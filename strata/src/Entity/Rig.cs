using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// A creature model made of coloured boxes on pivots, so legs swing from the
/// hip and heads turn at the neck. Every face of every box gets its own shade
/// and a little colour noise, which reads as form under flat voxel lighting.
/// </summary>
public sealed class Rig
{
    public readonly Node3D Root = new();
    public readonly Dictionary<string, Node3D> Parts = new();
    private readonly List<MeshInstance3D> _meshes = new();
    private static Shader _shader;
    private static ShaderMaterial _litMat;
    private readonly ShaderMaterial _mat;
    private int _seed;

    public Rig(int seed)
    {
        _shader ??= GD.Load<Shader>("res://shaders/entity.gdshader");
        _mat = new ShaderMaterial { Shader = _shader };
        _seed = seed;
    }

    public Node3D this[string name] => Parts.TryGetValue(name, out var n) ? n : null;

    /// <summary>
    /// Adds a pivot at `pivot` (in the parent's space) holding a box from
    /// `min` to `min + size` relative to the pivot.
    /// </summary>
    public Node3D Box(string name, string parent, Vector3 pivot, Vector3 min, Vector3 size, Color color, float noise = 0.08f)
    {
        var p = new Node3D { Name = name, Position = pivot };
        (parent != null ? Parts[parent] : Root).AddChild(p);
        Parts[name] = p;
        AddMesh(p, min, size, color, noise);
        return p;
    }

    /// <summary>Another box on an existing pivot (for details such as eyes, horns, stripes).</summary>
    public void Detail(string part, Vector3 min, Vector3 size, Color color, float noise = 0.04f)
    {
        AddMesh(Parts[part], min, size, color, noise);
    }

    /// <summary>A detail that shines by itself, so it shows in the dark: eyes, mostly.</summary>
    public void Eye(string part, Vector3 min, Vector3 size, Color color)
    {
        if (_litMat == null)
        {
            _litMat = new ShaderMaterial { Shader = _shader };
            _litMat.SetShaderParameter("self_lit", 1f);
        }
        AddMesh(Parts[part], min, size, color, 0f, _litMat);
    }

    private void AddMesh(Node3D parent, Vector3 min, Vector3 size, Color color, float noise, ShaderMaterial mat = null)
    {
        var mi = new MeshInstance3D { Mesh = BoxMesh(min, size, color, noise, _seed++), MaterialOverride = mat ?? _mat, CastShadow = GeometryInstance3D.ShadowCastingSetting.Off };
        parent.AddChild(mi);
        _meshes.Add(mi);
    }

    public void SetLight(Vector2 light, float flash, float glow = 0f)
    {
        foreach (var m in _meshes)
        {
            m.SetInstanceShaderParameter("light_level", light);
            m.SetInstanceShaderParameter("flash", flash);
            m.SetInstanceShaderParameter("glow", glow);
        }
    }

    private static readonly float[] FaceShade = { 0.8f, 0.8f, 1f, 0.55f, 0.9f, 0.7f };

    private static ArrayMesh BoxMesh(Vector3 min, Vector3 size, Color color, float noise, int seed)
    {
        var v = new List<Vector3>(24); var c = new List<Color>(24); var idx = new List<int>(36);
        var max = min + size;
        var rng = new Rng((ulong)(seed * 7919 + 17));
        for (int f = 0; f < 6; f++)
        {
            Vector3 a, b, cc, d;
            switch (f)
            {
                case Dir.PX: a = new(max.X, min.Y, max.Z); b = new(max.X, max.Y, max.Z); cc = new(max.X, max.Y, min.Z); d = new(max.X, min.Y, min.Z); break;
                case Dir.NX: a = new(min.X, min.Y, min.Z); b = new(min.X, max.Y, min.Z); cc = new(min.X, max.Y, max.Z); d = new(min.X, min.Y, max.Z); break;
                case Dir.PY: a = new(min.X, max.Y, max.Z); b = new(min.X, max.Y, min.Z); cc = new(max.X, max.Y, min.Z); d = new(max.X, max.Y, max.Z); break;
                case Dir.NY: a = new(min.X, min.Y, min.Z); b = new(min.X, min.Y, max.Z); cc = new(max.X, min.Y, max.Z); d = new(max.X, min.Y, min.Z); break;
                case Dir.PZ: a = new(min.X, min.Y, max.Z); b = new(min.X, max.Y, max.Z); cc = new(max.X, max.Y, max.Z); d = new(max.X, min.Y, max.Z); break;
                default: a = new(max.X, min.Y, min.Z); b = new(max.X, max.Y, min.Z); cc = new(min.X, max.Y, min.Z); d = new(min.X, min.Y, min.Z); break;
            }
            int i = v.Count;
            v.Add(a); v.Add(b); v.Add(cc); v.Add(d);
            float n = 1f + rng.Range(-noise, noise);
            var col = new Color(Math.Clamp(color.R * n, 0, 1), Math.Clamp(color.G * n, 0, 1), Math.Clamp(color.B * n, 0, 1), FaceShade[f]);
            // Darker toward the bottom of side faces: a soft ground bounce.
            for (int k = 0; k < 4; k++)
            {
                var cv = col;
                if (f != Dir.PY && f != Dir.NY && (k == 0 || k == 3)) cv.A *= 0.85f;
                c.Add(cv);
            }
            idx.Add(i); idx.Add(i + 1); idx.Add(i + 2); idx.Add(i); idx.Add(i + 2); idx.Add(i + 3);
        }
        var arr = new Godot.Collections.Array();
        arr.Resize((int)Mesh.ArrayType.Max);
        arr[(int)Mesh.ArrayType.Vertex] = v.ToArray();
        arr[(int)Mesh.ArrayType.Color] = c.ToArray();
        arr[(int)Mesh.ArrayType.Index] = idx.ToArray();
        var mesh = new ArrayMesh();
        mesh.AddSurfaceFromArrays(Mesh.PrimitiveType.Triangles, arr);
        return mesh;
    }
}
