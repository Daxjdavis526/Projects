using System;
using System.Collections.Generic;
using System.Linq;
using Godot;

namespace Strata;

/// <summary>
/// Entry point: builds the registries, then hands over to the unit tests, the
/// end-to-end self test, the screenshot director, or the game.
///   --test                 run the headless unit tests and exit
///   --bench                time generation, lighting, meshing and saving per column
///   --music DIR [ID...]    render the soundtrack (or the named pieces) to WAV files; --stems
///                          adds each piece's melody, accompaniment and pad apart, at the mix's level
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
        if (args.Contains("--music"))
        {
            RenderMusic(args);
            GetTree().Quit();
            return;
        }
        if (args.Contains("--bench"))
        {
            Tests.Bench();
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

    /// <summary>--music DIR [ID...]: every piece (or the named ones) as a WAV file, with its length and levels.</summary>
    private static void RenderMusic(string[] args)
    {
        int at = Array.IndexOf(args, "--music");
        string dir = at + 1 < args.Length ? args[at + 1] : "music";
        var only = args[(at + 2)..].Where(a => !a.StartsWith("--")).ToArray();
        bool stems = args.Contains("--stems");
        System.IO.Directory.CreateDirectory(dir);
        foreach (var piece in Music.All)
        {
            if (only.Length > 0 && !only.Contains(piece.Id)) continue;
            var sw = System.Diagnostics.Stopwatch.StartNew();
            var r = Music.Render(piece);
            long ms = sw.ElapsedMilliseconds;
            string path = System.IO.Path.Combine(dir, piece.Id + ".wav");
            MusicPlayer.Stream(r).SaveToWav(path);
            GD.Print($"{piece.Title,-14} {string.Join("/", piece.Moods),-10} {(int)r.Seconds / 60}:{(int)r.Seconds % 60:00}  rms {20 * Math.Log10(r.Rms):0.0} dBFS  rendered in {ms} ms  -> {path}");
            if (!stems) continue;
            foreach (var (stem, keep, pad) in new (string, Func<NoteEvent, bool>, bool)[] { ("lead", n => n.Lead, false), ("accomp", n => !n.Lead, false), ("pad", n => false, true) })
            {
                if (pad && piece.Pad <= 0) continue;
                var (sl, sr) = Music.Mix(piece, keep: keep, pad: pad);
                MusicPlayer.Stream(Music.Level(piece.Id, sl, sr, r.Gain)).SaveToWav(System.IO.Path.Combine(dir, $"{piece.Id}_{stem}.wav"));
            }
        }
    }

    /// <summary>--sheet OUT.jpg COLS [--tile WxH] IN1.png IN2.png ...: tiles screenshots into one picture for review.</summary>
    private static void ContactSheet(string[] args)
    {
        int at = Array.IndexOf(args, "--sheet");
        string output = args[at + 1];
        int cols = int.Parse(args[at + 2]);
        var inputs = args[(at + 3)..];
        int w = 640, h = 360;
        // Optional tile size: --sheet OUT COLS --tile 1280x720 IN...
        if (inputs.Length > 1 && inputs[0] == "--tile")
        {
            var wh = inputs[1].Split('x');
            w = int.Parse(wh[0]); h = int.Parse(wh[1]);
            inputs = inputs[2..];
        }
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
