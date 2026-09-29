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
    public FarTerrain Far { get; private set; }
    /// <summary>0 near the ground .. 1 from 280 m up: how much the classic fog has given way to the air's own haze.</summary>
    public float Lift { get; private set; }
    public float CameraAboveGround { get; private set; }
    private Vector3 _lastCam;
    private bool _haveLast;
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
        Far = new FarTerrain { Name = "FarTerrain", World = world, Chunks = Chunks };
        AddChild(Far);
        RenderingServer.GlobalShaderParameterSet("planet_radius", PhysicsWorld.PlanetRadius);
    }

    /// <summary>
    /// Once a frame, after the camera has moved: how high it is above the
    /// ground decides how far it can see (the fog lifts, the camera's range
    /// reaches to the horizon, the far terrain comes in), and whether new
    /// ground is streamed in at all (not from high up, nor when racing past).
    /// </summary>
    public void Frame(Camera3D cam, double delta)
    {
        var p = cam.GlobalPosition;
        float ground = World.Gen.GroundY(V.FloorToInt(p.X), V.FloorToInt(p.Z));
        float agl = p.Y - ground;
        CameraAboveGround = agl;
        // (From a few hundred metres up the far terrain is what you look at; near the ground the
        // fog hides the edge of the loaded world, as it always has.)
        Lift = Smooth.Step(30f, 280f, agl);
        RenderingServer.GlobalShaderParameterSet("fog_lift", Lift);
        // The horizon of a round planet from this height, and a little beyond it.
        double r = PhysicsWorld.PlanetRadius, h = Math.Max(0.0, p.Y - V.SeaLevel);
        float horizon = (float)Math.Sqrt((r + h) * (r + h) - r * r);
        cam.Far = Mathf.Lerp(2400f, Math.Max(2400f, horizon * 1.25f + 6000f), Lift);
        Sky.SetRange(cam.Far);
        float dt = (float)Math.Max(delta, 1e-4);
        float speed = _haveLast ? new Vector2(p.X - _lastCam.X, p.Z - _lastCam.Z).Length() / dt : 0f;
        _lastCam = p; _haveLast = true;
        Chunks.Suspended = agl > 2500f || (agl > 700f && speed > 140f);
        Far.Step(p, agl, Lift, dt);
    }

    /// <summary>The camera jumped round the planet (see PhysicsWorld.WrapShift): what is drawn far off moves with it.</summary>
    public void Shift(Vector3 by)
    {
        Far.Shift(by);
        _lastCam += by;
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
        Frame(cam, delta > 0 ? delta : 1.0 / 60.0);
    }

    public override void _ExitTree()
    {
        Chunks?.Dispose();
    }
}
