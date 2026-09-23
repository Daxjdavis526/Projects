using System;
using Godot;

namespace Strata;

/// <summary>
/// Everything needed to see a world: its materials, the streamed chunk meshes,
/// the sky and clouds. Gameplay owns one of these; so does the screenshot
/// director.
/// </summary>
public sealed partial class WorldView : Node3D
{
    public World World { get; private set; }
    public ChunkManager Chunks { get; private set; }
    public Atmosphere Sky { get; private set; }
    public ShaderMaterial Opaque, Cutout, Water;
    public float Brightness = 1f;

    public void Init(World world, ChunkStore store, Camera3D cam, int radius)
    {
        World = world;
        Opaque = Mat("res://shaders/voxel_opaque.gdshader");
        Cutout = Mat("res://shaders/voxel_cutout.gdshader");
        Water = Mat("res://shaders/voxel_water.gdshader");
        Water.RenderPriority = 1;

        var root = new Node3D { Name = "Chunks" };
        AddChild(root);
        int workers = Math.Clamp(System.Environment.ProcessorCount - 1, 1, 6);
        Chunks = new ChunkManager(world, store, root, workers)
        {
            Radius = radius,
            OpaqueMat = Opaque,
            CutoutMat = Cutout,
            WaterMat = Water,
        };
        Sky = new Atmosphere();
        Sky.Setup(this, cam);
    }

    private static ShaderMaterial Mat(string path)
    {
        var m = new ShaderMaterial { Shader = GD.Load<Shader>(path) };
        m.SetShaderParameter("blocks", Textures.Blocks);
        return m;
    }

    public void Step(double delta, Camera3D cam)
    {
        Chunks.Update(cam.GlobalPosition, delta);
        Sky.Update(delta, cam.GlobalPosition, Chunks.Radius * 16f, Brightness);
    }

    public override void _ExitTree()
    {
        Chunks?.Dispose();
    }
}
