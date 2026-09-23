using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// 3D models for items: blocks as little cubes (or plants as crossed cards),
/// everything else as its sprite extruded one pixel thick, with a side wall
/// on every pixel edge that borders transparency. Meshes and materials are
/// cached per item; lighting comes per instance.
/// </summary>
public static class ItemMeshes
{
    private static readonly Dictionary<ushort, (Mesh mesh, Material mat)> _world = new();
    private static readonly Dictionary<ushort, (Mesh mesh, Material mat)> _view = new();
    private static Shader _cubeShader, _spriteShader;

    public static (Mesh mesh, Material mat) Get(ushort item, bool viewmodel)
    {
        var cache = viewmodel ? _view : _world;
        if (cache.TryGetValue(item, out var r)) return r;
        _cubeShader ??= GD.Load<Shader>("res://shaders/item_cube.gdshader");
        _spriteShader ??= GD.Load<Shader>("res://shaders/item_sprite.gdshader");
        var d = Items.Get(item);
        if (d.Icon == IconKind.Cube)
        {
            var m = new ShaderMaterial { Shader = _cubeShader };
            m.SetShaderParameter("blocks", Textures.Blocks);
            m.SetShaderParameter("viewmodel", viewmodel);
            if (viewmodel) m.RenderPriority = 10;
            r = (CubeMesh(Blocks.Get(d.Block)), m);
        }
        else
        {
            var m = new ShaderMaterial { Shader = _spriteShader };
            m.SetShaderParameter("sprite", ImageTexture.CreateFromImage(Icons.Sprite(item)));
            m.SetShaderParameter("viewmodel", viewmodel);
            if (viewmodel) m.RenderPriority = 10;
            r = (SpriteMesh(Icons.Sprite(item)), m);
        }
        cache[item] = r;
        return r;
    }

    private static int TintMode(int layer)
    {
        string n = Tex.Names[layer];
        if (n is "grass_top" or "grass_side") return 1;
        if (n is "elm_leaves" or "ironwood_leaves" or "willow_leaves" or "pine_leaves" or "tall_grass" or "fern") return 2;
        return 0;
    }

    /// <summary>A unit cube centred on the origin (or a short one for low blocks).</summary>
    public static ArrayMesh CubeMesh(BlockDef def)
    {
        float h = def.Render == RenderKind.Low ? def.Height : 1f;
        var v = new List<Vector3>(); var uv = new List<Vector2>(); var uv2 = new List<Vector2>(); var col = new List<Color>(); var idx = new List<int>();
        float[] shade = { 0.7f, 0.7f, 1f, 0.55f, 0.85f, 0.85f };
        for (int f = 0; f < 6; f++)
        {
            int layer = def.Tex[f];
            if (def.Use == BlockUse.Furnace && f == Dir.PZ) layer = def.Tex[Blocks.FacingDir[2]];
            int mode = TintMode(layer);
            var tint = mode == 1 ? Icons.DefaultGrass : mode == 2 ? Icons.DefaultFoliage : Colors.White;
            tint.A = shade[f];
            var (a, b, c, d) = FaceCorners(f, h);
            int baseIdx = v.Count;
            v.Add(a); v.Add(b); v.Add(c); v.Add(d);
            float top = f == Dir.PY || f == Dir.NY ? 0f : 1f - h;
            uv.Add(new(0, 1)); uv.Add(new(0, top)); uv.Add(new(1, top)); uv.Add(new(1, 1));
            for (int k = 0; k < 4; k++) { uv2.Add(new(layer, mode)); col.Add(tint); }
            idx.Add(baseIdx); idx.Add(baseIdx + 1); idx.Add(baseIdx + 2);
            idx.Add(baseIdx); idx.Add(baseIdx + 2); idx.Add(baseIdx + 3);
        }
        return Build(v, uv, uv2, col, idx);
    }

    /// <summary>Corners of a face of the cube [-0.5, 0.5]^3, clockwise from outside, starting bottom-left.</summary>
    private static (Vector3, Vector3, Vector3, Vector3) FaceCorners(int f, float h)
    {
        float y0 = -0.5f, y1 = -0.5f + h;
        return f switch
        {
            Dir.PX => (new(0.5f, y0, 0.5f), new(0.5f, y1, 0.5f), new(0.5f, y1, -0.5f), new(0.5f, y0, -0.5f)),
            Dir.NX => (new(-0.5f, y0, -0.5f), new(-0.5f, y1, -0.5f), new(-0.5f, y1, 0.5f), new(-0.5f, y0, 0.5f)),
            Dir.PZ => (new(-0.5f, y0, 0.5f), new(-0.5f, y1, 0.5f), new(0.5f, y1, 0.5f), new(0.5f, y0, 0.5f)),
            Dir.NZ => (new(0.5f, y0, -0.5f), new(0.5f, y1, -0.5f), new(-0.5f, y1, -0.5f), new(-0.5f, y0, -0.5f)),
            Dir.PY => (new(-0.5f, y1, 0.5f), new(-0.5f, y1, -0.5f), new(0.5f, y1, -0.5f), new(0.5f, y1, 0.5f)),
            _ => (new(-0.5f, y0, -0.5f), new(-0.5f, y0, 0.5f), new(0.5f, y0, 0.5f), new(0.5f, y0, -0.5f)),
        };
    }

    /// <summary>The sprite as a 1 x 1 card, one pixel thick, walls on every opaque edge.</summary>
    public static ArrayMesh SpriteMesh(Image img)
    {
        int w = img.GetWidth(), hgt = img.GetHeight();
        float t = 1f / 16f * 0.5f;
        var v = new List<Vector3>(); var uv = new List<Vector2>(); var uv2 = new List<Vector2>(); var col = new List<Color>(); var idx = new List<int>();
        bool Opaque(int x, int y) => x >= 0 && y >= 0 && x < w && y < hgt && img.GetPixel(x, y).A > 0.5f;
        void Quad(Vector3 a, Vector3 b, Vector3 c, Vector3 d, Vector2 ua, Vector2 ub, Vector2 uc, Vector2 ud, float shade)
        {
            int i = v.Count;
            v.Add(a); v.Add(b); v.Add(c); v.Add(d);
            uv.Add(ua); uv.Add(ub); uv.Add(uc); uv.Add(ud);
            for (int k = 0; k < 4; k++) { uv2.Add(Vector2.Zero); col.Add(new Color(1, 1, 1, shade)); }
            idx.Add(i); idx.Add(i + 1); idx.Add(i + 2); idx.Add(i); idx.Add(i + 2); idx.Add(i + 3);
        }
        float px = 1f / w, py = 1f / hgt;
        // Back first, edges, then the front last so a viewmodel drawn without depth test still layers right.
        Quad(new(0.5f, -0.5f, -t), new(0.5f, 0.5f, -t), new(-0.5f, 0.5f, -t), new(-0.5f, -0.5f, -t),
            new(1, 1), new(1, 0), new(0, 0), new(0, 1), 0.7f);
        for (int y = 0; y < hgt; y++)
            for (int x = 0; x < w; x++)
            {
                if (!Opaque(x, y)) continue;
                float x0 = -0.5f + x * px, x1 = x0 + px;
                float y1 = 0.5f - y * py, y0 = y1 - py;
                var c = new Vector2((x + 0.5f) * px, (y + 0.5f) * py);
                if (!Opaque(x - 1, y)) Quad(new(x0, y0, -t), new(x0, y1, -t), new(x0, y1, t), new(x0, y0, t), c, c, c, c, 0.75f);
                if (!Opaque(x + 1, y)) Quad(new(x1, y0, t), new(x1, y1, t), new(x1, y1, -t), new(x1, y0, -t), c, c, c, c, 0.75f);
                if (!Opaque(x, y - 1)) Quad(new(x0, y1, t), new(x0, y1, -t), new(x1, y1, -t), new(x1, y1, t), c, c, c, c, 0.95f);
                if (!Opaque(x, y + 1)) Quad(new(x0, y0, -t), new(x0, y0, t), new(x1, y0, t), new(x1, y0, -t), c, c, c, c, 0.55f);
            }
        Quad(new(-0.5f, -0.5f, t), new(-0.5f, 0.5f, t), new(0.5f, 0.5f, t), new(0.5f, -0.5f, t),
            new(0, 1), new(0, 0), new(1, 0), new(1, 1), 1f);
        return Build(v, uv, uv2, col, idx);
    }

    private static ArrayMesh Build(List<Vector3> v, List<Vector2> uv, List<Vector2> uv2, List<Color> col, List<int> idx)
    {
        var arr = new Godot.Collections.Array();
        arr.Resize((int)Mesh.ArrayType.Max);
        arr[(int)Mesh.ArrayType.Vertex] = v.ToArray();
        arr[(int)Mesh.ArrayType.TexUV] = uv.ToArray();
        arr[(int)Mesh.ArrayType.TexUV2] = uv2.ToArray();
        arr[(int)Mesh.ArrayType.Color] = col.ToArray();
        arr[(int)Mesh.ArrayType.Index] = idx.ToArray();
        var mesh = new ArrayMesh();
        mesh.AddSurfaceFromArrays(Mesh.PrimitiveType.Triangles, arr);
        return mesh;
    }
}
