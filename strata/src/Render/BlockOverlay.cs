using Godot;

namespace Strata;

/// <summary>The outline around the targeted block and the cracks spreading as it is mined.</summary>
public sealed partial class BlockOverlay : Node3D
{
    private MeshInstance3D _outline, _crack;
    private ShaderMaterial _crackMat;

    public override void _Ready()
    {
        var lineMat = new ShaderMaterial
        {
            Shader = new Shader
            {
                Code = @"
shader_type spatial;
render_mode unshaded, fog_disabled, cull_disabled, depth_draw_never, blend_mix;
void fragment() { ALBEDO = vec3(0.02); ALPHA = 0.55; }
",
            },
        };
        var v = new System.Collections.Generic.List<Vector3>();
        Vector3[] c =
        {
            new(0, 0, 0), new(1, 0, 0), new(1, 0, 1), new(0, 0, 1),
            new(0, 1, 0), new(1, 1, 0), new(1, 1, 1), new(0, 1, 1),
        };
        int[] e = { 0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7 };
        foreach (int i in e) v.Add(c[i]);
        var arr = new Godot.Collections.Array();
        arr.Resize((int)Mesh.ArrayType.Max);
        arr[(int)Mesh.ArrayType.Vertex] = v.ToArray();
        var mesh = new ArrayMesh();
        mesh.AddSurfaceFromArrays(Mesh.PrimitiveType.Lines, arr);
        _outline = new MeshInstance3D { Mesh = mesh, MaterialOverride = lineMat, CastShadow = GeometryInstance3D.ShadowCastingSetting.Off, Visible = false };
        AddChild(_outline);

        _crackMat = new ShaderMaterial
        {
            Shader = new Shader
            {
                Code = @"
shader_type spatial;
render_mode unshaded, fog_disabled, cull_back, depth_draw_never, blend_mix;
uniform sampler2DArray cracks : source_color, filter_nearest, repeat_enable;
uniform float stage = 0.0;
void fragment() {
    vec4 t = texture(cracks, vec3(UV * vec2(3.0, 2.0), stage));
    ALBEDO = t.rgb;
    ALPHA = t.a;
}
",
            },
        };
        _crackMat.SetShaderParameter("cracks", Textures.Cracks);
        _crack = new MeshInstance3D
        {
            Mesh = new BoxMesh { Size = Vector3.One * 1.004f },
            MaterialOverride = _crackMat,
            CastShadow = GeometryInstance3D.ShadowCastingSetting.Off,
            Visible = false,
        };
        AddChild(_crack);
    }

    public void Show(Player p)
    {
        if (p == null || !p.Target.Hit || p.TargetMob != null || Game.I.InputBlocked || Game.I.HudHidden)
        {
            _outline.Visible = false;
            _crack.Visible = false;
            return;
        }
        var t = p.Target;
        var def = Blocks.Get(t.Id);
        var box = VoxelRay.SelectionBox(def) ?? new Aabb(Vector3.Zero, Vector3.One);
        var grow = 0.004f;
        _outline.Visible = true;
        _outline.Transform = new Transform3D(Basis.FromScale(box.Size + Vector3.One * grow * 2), new Vector3(t.X, t.Y, t.Z) + box.Position - Vector3.One * grow);
        if (p.BreakProgress > 0.01f)
        {
            _crack.Visible = true;
            _crack.Transform = new Transform3D(Basis.FromScale(box.Size), new Vector3(t.X, t.Y, t.Z) + box.Position + box.Size * 0.5f);
            _crackMat.SetShaderParameter("stage", (float)Mathf.Clamp((int)(p.BreakProgress * 10f), 0, 9));
        }
        else _crack.Visible = false;
    }
}
