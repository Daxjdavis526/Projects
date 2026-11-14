using Godot;

namespace Strata;

/// <summary>
/// The picture on the billboard beside the launch pad: a photograph on a
/// flat panel over the face of the frame <see cref="LaunchComplex"/> builds,
/// lit like the blocks round it (bright by day, floodlit by night) and lost
/// in the fog with them. It is the one picture in the game not painted by
/// its own code.
/// </summary>
public static class PadBillboard
{
    public static MeshInstance3D Make(LandmarkSite site)
    {
        var (centre, size) = LaunchComplex.BoardFace(site);
        var mat = new ShaderMaterial { Shader = GD.Load<Shader>("res://shaders/billboard.gdshader") };
        mat.SetShaderParameter("photo", GD.Load<Texture2D>("res://art/billboard.png"));
        return new MeshInstance3D
        {
            Name = "Billboard",
            Mesh = new QuadMesh { Size = size },
            MaterialOverride = mat,
            Position = centre,
            CastShadow = GeometryInstance3D.ShadowCastingSetting.Off,
        };
    }
}
