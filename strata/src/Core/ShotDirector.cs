using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// Development aid: flies a camera to viewpoints in a fixed world, waits for
/// the terrain to finish streaming at each, and saves a screenshot. With
/// --tour it goes looking for every biome, a cave, a ruin and a mountain range.
/// Run with: godot --path strata -- --shots [outdir] [--seed S] [--tour]
/// </summary>
public partial class ShotDirector : Node3D
{
    private readonly List<(string name, Vector3 pos, Vector3 look, float time, float bright)> _shots = new();
    private WorldView _view;
    private Camera3D _cam;
    private int _index = -1;
    private double _wait;
    private string _out = "/tmp/strata_shots";
    private long _seed = 12345;
    private int _frames;
    private World _world;
    private MobManager _mobs;
    private (Vector3 from, Vector3 to)? _look;

    public override void _Ready()
    {
        var args = OS.GetCmdlineUserArgs();
        bool tour = false;
        for (int i = 0; i < args.Length; i++)
        {
            if (args[i] == "--shots" && i + 1 < args.Length && !args[i + 1].StartsWith("--")) _out = args[i + 1];
            if (args[i] == "--seed" && i + 1 < args.Length) _seed = Hash.StringSeed(args[i + 1]);
            if (args[i] == "--tour") tour = true;
            if (args[i] == "--look" && i + 6 < args.Length)
            {
                float F(int k) => float.Parse(args[i + k], System.Globalization.CultureInfo.InvariantCulture);
                _look = (new Vector3(F(1), F(2), F(3)), new Vector3(F(4), F(5), F(6)));
            }
        }
        System.IO.Directory.CreateDirectory(_out);

        _cam = new Camera3D { Fov = 75, Far = 2400, Near = 0.05f };
        AddChild(_cam);
        _world = new World(_seed);
        _view = new WorldView();
        AddChild(_view);
        _view.Init(_world, null, _cam, 10);
        var mobs = new MobManager { World = _world, SpawningEnabled = false };
        AddChild(mobs);
        _mobs = mobs;

        var gen = _world.Gen;
        var (sx, sy, sz) = gen.FindSpawn();
        GD.Print($"spawn {sx},{sy},{sz} biome {gen.BiomeAt(sx, sz)}");
        var p = new Vector3(sx + 0.5f, sy + 1.7f, sz + 0.5f);
        if (_look.HasValue)
        {
            _shots.Add(("look", _look.Value.from, _look.Value.to, 0.25f, 1f));
            tour = true;   // no creatures
        }
        else if (!tour)
        {
            _shots.Add(("spawn_eye", p, p + new Vector3(10, -1.5f, -6), 0.22f, 1f));
            _shots.Add(("spawn_high", p + new Vector3(-40, 45, 40), p + new Vector3(30, -10, -20), 0.2f, 1f));
            _shots.Add(("sunset", p + new Vector3(0, 20, 0), p + new Vector3(-60, 12, 5), 0.47f, 1f));
            _shots.Add(("night", p + new Vector3(0, 2, 0), p + new Vector3(10, 1, -10), 0.72f, 1f));
            // The creature ring, close, by day and by night.
            var ring = new Vector3(sx + 6, gen.SurfaceY(sx + 6, sz - 4) + 1, sz - 4);
            _shots.Add(("creatures_day", ring + new Vector3(-7, 3.5f, 7), ring, 0.25f, 1f));
            _shots.Add(("creatures_night", ring + new Vector3(-7, 3.5f, 7), ring, 0.72f, 1f));
            _shots.Add(("creatures_night_far", ring + new Vector3(-30, 5f, 30), ring, 0.72f, 1f));
            // The same creatures in mid-morning from across a meadow, where they once showed as glowing blobs.
            _shots.Add(("creatures_morning_far", ring + new Vector3(-16, 3f, 16), ring, 0.12f, 1f));
            // The night sky itself, early in the night and again later once it has turned.
            _shots.Add(("night_sky", p + new Vector3(0, 3, 0), p + new Vector3(26, 34, -15), 0.72f, 1f));
            _shots.Add(("night_sky_late", p + new Vector3(0, 3, 0), p + new Vector3(26, 34, -15), 0.84f, 1f));
            _shots.Add(("night_zenith", p + new Vector3(0, 3, 0), p + new Vector3(0.6f, 40, 0.3f), 0.75f, 1f));
        }
        else BuildTour(gen, sx, sz);

        // A few creatures near the first viewpoints so the models can be judged.
        if (!tour)
        {
            int i = 0;
            foreach (MobKind k in Enum.GetValues(typeof(MobKind)))
            {
                float a = i++ * 0.7f;
                var at = new Vector3(sx + 6 + MathF.Cos(a) * 5, 0, sz - 4 + MathF.Sin(a) * 5);
                at.Y = gen.SurfaceY(V.FloorToInt(at.X), V.FloorToInt(at.Z));
                var m = mobs.SpawnMob(k, at);
                // Stand still, facing the close-up camera.
                var cam = new Vector3(sx + 6 - 7, 0, sz - 4 + 7);
                m.Yaw = MathF.Atan2(-(cam.X - at.X), -(cam.Z - at.Z)) + (i % 2 == 0 ? 0.35f : -0.35f);
                m.SetState(MobState.Idle, 1e6f);
            }
        }
        Next();
    }

    private void BuildTour(WorldGen gen, int sx, int sz)
    {
        var wanted = new[] { Biome.Meadow, Biome.Elderwood, Biome.Mirewood, Biome.Pinereach, Biome.Frostveld, Biome.Dunes, Biome.Savanna, Biome.Ashlands, Biome.Peaks, Biome.Shore };
        foreach (var b in wanted)
        {
            var spot = FindBiome(gen, b, sx, sz);
            if (spot == null) { GD.Print($"  no {b} found"); continue; }
            var (x, z) = spot.Value;
            int y = gen.SurfaceY(x, z);
            var target = new Vector3(x, y, z);
            float up = b == Biome.Peaks ? 45 : 24;
            _shots.Add(("biome_" + b.ToString().ToLowerInvariant(), target + new Vector3(-34, up, 30), target + new Vector3(0, 2, 0), 0.23f, 1f));
        }
        // A structure.
        for (int r = 0; r < 12 && _shots.Count < 40; r++)
        {
            var site = gen.Structures.SiteFor(r % 4 - 2, r / 4 - 1, 0);
            if (site.Kind == StructureGen.Kind.None) continue;
            var c = new Vector3(site.X, site.Y, site.Z);
            _shots.Add(("structure_" + site.Kind.ToString().ToLowerInvariant(), c + new Vector3(-12, 9, 12), c + new Vector3(0, 1, 0), 0.24f, 1f));
            break;
        }
        // A cave: a big pocket of air well under the surface.
        var cave = FindCave(gen, sx, sz);
        if (cave.HasValue)
            _shots.Add(("cave", cave.Value, cave.Value + new Vector3(8, -2, 5), 0.25f, 2.6f));
        _shots.Add(("sunrise", new Vector3(sx, gen.SurfaceY(sx, sz) + 30, sz), new Vector3(sx + 100, gen.SurfaceY(sx, sz) + 25, sz), 0.01f, 1f));
    }

    private static (int x, int z)? FindBiome(WorldGen gen, Biome want, int sx, int sz)
    {
        for (int r = 0; r < 4000; r += 48)
        {
            int steps = Math.Max(1, r / 16);
            for (int s = 0; s < steps; s++)
            {
                float a = s * MathF.Tau / steps;
                int x = sx + (int)(MathF.Cos(a) * r), z = sz + (int)(MathF.Sin(a) * r);
                if (gen.BiomeAt(x, z) != want) continue;
                int same = 0;
                for (int k = 0; k < 8; k++)
                {
                    float b = k * MathF.Tau / 8;
                    if (gen.BiomeAt(x + (int)(MathF.Cos(b) * 30), z + (int)(MathF.Sin(b) * 30)) == want) same++;
                }
                if (same >= 6) return (x, z);
            }
        }
        return null;
    }

    private Vector3? FindCave(WorldGen gen, int sx, int sz)
    {
        // Generate a few columns and look for a roomy air pocket below y 45.
        for (int cz = -3; cz <= 3; cz++)
            for (int cx = -3; cx <= 3; cx++)
            {
                var c = new Chunk((sx >> 4) + cx, (sz >> 4) + cz);
                gen.Generate(c);
                for (int y = 20; y < 45; y++)
                    for (int z = 3; z < 13; z++)
                        for (int x = 3; x < 13; x++)
                        {
                            bool open = true;
                            for (int d = -2; d <= 2 && open; d++)
                                open = c.Blocks[V.Index(x + d, y, z)] == 0 && c.Blocks[V.Index(x, y + d, z)] == 0 && c.Blocks[V.Index(x, y, z + d)] == 0;
                            if (open) return new Vector3(c.WorldX + x + 0.5f, y + 0.5f, c.WorldZ + z + 0.5f);
                        }
            }
        return null;
    }

    private void Next()
    {
        _index++;
        if (_index >= _shots.Count)
        {
            GD.Print("shots done");
            GetTree().Quit();
            return;
        }
        var s = _shots[_index];
        _cam.GlobalPosition = s.pos;
        _cam.LookAt(s.look, Vector3.Up);
        _view.Sky.Time = 3 + s.time;
        _view.Brightness = s.bright;
        _wait = 0;
        _frames = 0;
    }

    public override void _Process(double delta)
    {
        if (_index >= _shots.Count) return;
        var s = _shots[_index];
        _view.Sky.Time = 3 + s.time;
        _view.Sky.BiomeHere = _world.Gen.BiomeAt(V.FloorToInt(s.pos.X), V.FloorToInt(s.pos.Z));
        _view.Sky.Underwater = Blocks.IsWater(_world.GetBlock(V.FloorToInt(s.pos.X), V.FloorToInt(s.pos.Y), V.FloorToInt(s.pos.Z)));
        _view.Step(0, _cam);
        _mobs.Daylight = 0f;   // no sunburn: the night-walkers are here to be looked at
        _mobs.Step(0.016f, null);
        _wait += delta;
        bool ready = _view.Chunks.AreaReady(_cam.GlobalPosition, 6) && _view.Chunks.Jobs.Pending == 0;
        if (ready) _frames++;
        if ((_frames > 8) || _wait > 120)
        {
            var img = GetViewport().GetTexture().GetImage();
            string path = System.IO.Path.Combine(_out, $"{_index:00}_{s.name}.png");
            img.SavePng(path);
            GD.Print($"saved {path} after {_wait:0.0}s tris={_view.Chunks.Triangles} chunks={_view.World.Chunks.Count}");
            Next();
        }
    }
}
