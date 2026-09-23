using System;
using System.Collections.Generic;
using System.Linq;
using Godot;

namespace Strata;

/// <summary>
/// Entry point: builds the registries, then hands over to the unit tests, the
/// end-to-end self test, the screenshot director, or the game.
///   --test                 run the headless unit tests and exit
///   --selftest [dir]       play through the core loop with scripted input
///   --shots [dir]          fly a camera through viewpoints and save pictures
///   --capture SECS PATH    save a screenshot after SECS seconds and quit
/// </summary>
public partial class GameBootstrap : Node
{
    private double _captureAt = -1, _clock;
    private string _capturePath;

    public override void _Ready()
    {
        var args = OS.GetCmdlineUserArgs();
        bool headless = DisplayServer.GetName() == "headless";
        Registry.Init(graphics: !headless);
        InputSetup.Ensure();

        for (int i = 0; i < args.Length; i++)
            if (args[i] == "--capture" && i + 2 < args.Length)
            {
                _captureAt = double.Parse(args[i + 1], System.Globalization.CultureInfo.InvariantCulture);
                _capturePath = args[i + 2];
            }

        if (args.Contains("--probe"))
        {
            // --probe SEED X Z: what blocks make up the ground around a point.
            int at = Array.IndexOf(args, "--probe");
            var gen = new WorldGen(Hash.StringSeed(args[at + 1]));
            int px = int.Parse(args[at + 2]), pz = int.Parse(args[at + 3]);
            var counts = new System.Collections.Generic.Dictionary<string, int>();
            var c = new Chunk(px >> 4, pz >> 4);
            gen.Generate(c);
            for (int i = 0; i < V.ColumnVolume; i++)
            {
                var d = Blocks.Get(c.Blocks[i]);
                if (d.Render == RenderKind.Cube || d.Air) continue;
                counts[d.Key] = counts.GetValueOrDefault(d.Key) + 1;
            }
            foreach (var kv in counts) GD.Print($"{kv.Key}: {kv.Value}");
            GD.Print($"biome {gen.BiomeAt(px, pz)}");
            GetTree().Quit();
            return;
        }
        if (args.Contains("--sheet"))
        {
            ContactSheet(args);
            GetTree().Quit();
            return;
        }
        if (args.Contains("--test"))
        {
            int failed = Tests.RunAll();
            GetTree().Quit(failed == 0 ? 0 : 1);
            return;
        }
        if (args.Contains("--shots"))
        {
            AddChild(new ShotDirector());
            return;
        }
        if (args.Contains("--selftest"))
        {
            AddChild(new SelfTest { Name = "SelfTest" });
            return;
        }
        AddChild(new App { Name = "App" });
    }

    /// <summary>--sheet OUT.png COLS IN1.png IN2.png ...: tiles screenshots into one picture for review.</summary>
    private static void ContactSheet(string[] args)
    {
        int at = Array.IndexOf(args, "--sheet");
        string output = args[at + 1];
        int cols = int.Parse(args[at + 2]);
        var inputs = args[(at + 3)..];
        const int w = 640, h = 360;
        int rows = (inputs.Length + cols - 1) / cols;
        var sheet = Image.CreateEmpty(w * cols, h * rows, false, Image.Format.Rgb8);
        for (int i = 0; i < inputs.Length; i++)
        {
            var img = Image.LoadFromFile(inputs[i]);
            img.Convert(Image.Format.Rgb8);
            img.Resize(w, h, Image.Interpolation.Bilinear);
            sheet.BlitRect(img, new Rect2I(0, 0, w, h), new Vector2I((i % cols) * w, (i / cols) * h));
        }
        sheet.SaveJpg(output, 0.85f);
        GD.Print($"sheet {output}: {inputs.Length} images");
    }

    public override void _Process(double delta)
    {
        if (_captureAt < 0) return;
        _clock += delta;
        if (_clock < _captureAt) return;
        _captureAt = -1;
        GetViewport().GetTexture().GetImage().SavePng(_capturePath);
        GD.Print("captured " + _capturePath);
        GetTree().Quit();
    }
}
