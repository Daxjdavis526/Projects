using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>Pause, death, loading and settings panels, built in code with the shared theme.</summary>
public static partial class Menus
{
    public static readonly string[] Tips =
    {
        "Wooden tools come first: four planks make a worktable.",
        "Stone needs a pick. Copper needs a stone pick; iron needs copper.",
        "Soot seams burn for a long time in a furnace, and make torches.",
        "Hollows come apart in sunlight. Silver cuts them twice as deep.",
        "Sneak at an edge and you will not step off it.",
        "A bedroll sets where you wake, and lets you sleep through the night.",
        "Goldgrain seeds fall from tall grass. Till soil with a hoe to plant them.",
        "Lumen crystals glow in the deep caves. Iron picks break them free.",
        "Crates in ruins hold whatever the last visitor left behind.",
        "Cook meat in a furnace: it feeds you three times as well.",
        "Brindles follow anyone holding goldgrain. Feed two to raise a calf.",
        "Lurkers live where no light has ever reached. Bring torches.",
    };

    public static Control Overlay(float dim = 0.55f)
    {
        var root = new Control { Theme = UiStyle.Theme, MouseFilter = Control.MouseFilterEnum.Stop };
        UiStyle.FillParent(root);
        var bg = new ColorRect { Color = new Color(0, 0, 0, dim), MouseFilter = Control.MouseFilterEnum.Ignore };
        UiStyle.FillParent(bg);
        root.AddChild(bg);
        return root;
    }

    public static VBoxContainer CenterColumn(Control root, float width = 360)
    {
        var center = new CenterContainer();
        UiStyle.FillParent(center);
        root.AddChild(center);
        var panel = new PanelContainer { CustomMinimumSize = new Vector2(width, 0) };
        center.AddChild(panel);
        var col = new VBoxContainer { Alignment = BoxContainer.AlignmentMode.Center };
        col.AddThemeConstantOverride("separation", 10);
        panel.AddChild(col);
        return col;
    }

    // --- loading --------------------------------------------------------------------------

    public sealed partial class LoadingPanel : Control
    {
        private ProgressBar _bar;
        private Label _status;

        public override void _Ready()
        {
            Theme = UiStyle.Theme;
            UiStyle.FillParent(this);
            MouseFilter = MouseFilterEnum.Stop;
            var bg = new ColorRect { Color = new Color(0.04f, 0.05f, 0.07f, 1f) };
            UiStyle.FillParent(bg);
            AddChild(bg);
            var center = new CenterContainer();
            UiStyle.FillParent(center);
            AddChild(center);
            var col = new VBoxContainer { CustomMinimumSize = new Vector2(520, 0) };
            col.AddThemeConstantOverride("separation", 14);
            center.AddChild(col);
            col.AddChild(UiStyle.Label("STRATA", 54, UiStyle.Accent, HorizontalAlignment.Center));
            _status = UiStyle.Label("Shaping the ground...", 18, UiStyle.Text, HorizontalAlignment.Center);
            col.AddChild(_status);
            _bar = new ProgressBar { MinValue = 0, MaxValue = 1, CustomMinimumSize = new Vector2(520, 18), ShowPercentage = false };
            _bar.AddThemeStyleboxOverride("background", UiStyle.Box(new Color(0.12f, 0.12f, 0.15f), UiStyle.Border, 1, 4));
            _bar.AddThemeStyleboxOverride("fill", UiStyle.Box(UiStyle.Accent, UiStyle.Accent, 0, 4));
            col.AddChild(_bar);
            var tip = UiStyle.Label(Tips[new Random().Next(Tips.Length)], 16, UiStyle.TextDim, HorizontalAlignment.Center);
            tip.AutowrapMode = TextServer.AutowrapMode.WordSmart;
            col.AddChild(tip);
        }

        public void SetProgress(ChunkManager cm, Vector3 at)
        {
            int ready = 0, total = 0;
            int cx = V.FloorToInt(at.X) >> 4, cz = V.FloorToInt(at.Z) >> 4;
            for (int dz = -2; dz <= 2; dz++)
                for (int dx = -2; dx <= 2; dx++)
                {
                    total += 3;
                    var c = cm.World.GetChunk(cx + dx, cz + dz);
                    if (c == null) continue;
                    ready += c.State >= ChunkState.Meshed ? 3 : c.State >= ChunkState.Lit ? 2 : c.State >= ChunkState.Generated ? 1 : 0;
                }
            _bar.Value = (double)ready / total;
            _status.Text = ready * 3 < total ? "Shaping the ground..." : ready * 3 < total * 2 ? "Letting the light in..." : "Building the view...";
        }
    }

    public static Control Loading(Game g) => new LoadingPanel();

    // --- pause ------------------------------------------------------------------------------

    public static Control Pause(Game g)
    {
        var root = Overlay();
        var col = CenterColumn(root);
        col.AddChild(UiStyle.Label("Paused", 30, UiStyle.Accent, HorizontalAlignment.Center));
        col.AddChild(UiStyle.Label(g.Meta.Name, 16, UiStyle.TextDim, HorizontalAlignment.Center));
        col.AddChild(UiStyle.Spacer(6));
        col.AddChild(UiStyle.Button("Resume", () => g.SetPaused(false)));
        col.AddChild(UiStyle.Button("Settings", () => root.AddChild(Settings(g.Settings, () => g.ApplyGraphics()))));
        col.AddChild(UiStyle.Button("Save", () => { g.Save(); g.Hud.Toast("World saved"); }));
        col.AddChild(UiStyle.Button("Save and Quit to Menu", () => g.QuitToMenu()));
        col.AddChild(UiStyle.Button("Save and Exit Game", () => { g.Save(); g.GetTree().Quit(); }));
        var stats = g.Stats;
        col.AddChild(UiStyle.Spacer(4));
        col.AddChild(UiStyle.Label($"Played {TimeSpan.FromSeconds(g.Meta.PlaySeconds):hh\\:mm\\:ss}  ·  mined {g.Player.BlocksMined}  ·  placed {g.Player.BlocksPlaced}  ·  felled {g.Player.Kills}", 14, UiStyle.TextDim, HorizontalAlignment.Center));
        return root;
    }

    // --- death ------------------------------------------------------------------------------

    public static Control Death(Game g, DamageKind kind)
    {
        var root = Overlay(0.2f);
        var red = new ColorRect { Color = new Color(0.45f, 0f, 0f, 0.45f), MouseFilter = Control.MouseFilterEnum.Ignore };
        UiStyle.FillParent(red);
        root.AddChild(red);
        var col = CenterColumn(root);
        col.AddChild(UiStyle.Label("You died", 38, UiStyle.Bad, HorizontalAlignment.Center));
        string cause = kind switch
        {
            DamageKind.Fall => "You hit the ground too hard.",
            DamageKind.Drown => "You ran out of air.",
            DamageKind.Starve => "You starved.",
            DamageKind.Lava => "You tried to swim in lava.",
            DamageKind.Cactus => "A spinecactus had the last word.",
            DamageKind.Mob => "Something caught you.",
            DamageKind.Projectile => "A thorn found its mark.",
            DamageKind.Void => "You fell out of the world.",
            _ => "It happens.",
        };
        col.AddChild(UiStyle.Label(cause, 18, UiStyle.Text, HorizontalAlignment.Center));
        col.AddChild(UiStyle.Label("Everything you carried is where you fell.", 15, UiStyle.TextDim, HorizontalAlignment.Center));
        col.AddChild(UiStyle.Spacer(8));
        col.AddChild(UiStyle.Button("Respawn", () => g.Respawn()));
        col.AddChild(UiStyle.Button("Save and Quit to Menu", () => g.QuitToMenu()));
        return root;
    }

    // --- settings ---------------------------------------------------------------------------

    public static Control Settings(Settings s, Action applied)
    {
        var root = Overlay(0.35f);
        var col = CenterColumn(root, 560);
        col.AddChild(UiStyle.Label("Settings", 30, UiStyle.Accent, HorizontalAlignment.Center));
        var grid = new GridContainer { Columns = 2 };
        grid.AddThemeConstantOverride("h_separation", 18);
        grid.AddThemeConstantOverride("v_separation", 8);
        col.AddChild(grid);

        void Row(string label, Control c)
        {
            grid.AddChild(UiStyle.Label(label, 17));
            c.SizeFlagsHorizontal = Control.SizeFlags.ExpandFill;
            c.CustomMinimumSize = new Vector2(280, 30);
            grid.AddChild(c);
        }
        HSlider Slider(double min, double max, double step, double value, Action<double> set, Func<double, string> fmt)
        {
            var box = new HBoxContainer();
            var sl = new HSlider { MinValue = min, MaxValue = max, Step = step, Value = value, SizeFlagsHorizontal = Control.SizeFlags.ExpandFill, CustomMinimumSize = new Vector2(200, 24) };
            var lbl = UiStyle.Label(fmt(value), 15, UiStyle.TextDim);
            lbl.CustomMinimumSize = new Vector2(60, 0);
            sl.ValueChanged += v => { set(v); lbl.Text = fmt(v); applied?.Invoke(); };
            box.AddChild(sl);
            box.AddChild(lbl);
            return sl;
        }
        Control SliderRow(string label, double min, double max, double step, double value, Action<double> set, Func<double, string> fmt)
        {
            var box = new HBoxContainer();
            var sl = new HSlider { MinValue = min, MaxValue = max, Step = step, Value = value, SizeFlagsHorizontal = Control.SizeFlags.ExpandFill, CustomMinimumSize = new Vector2(200, 24) };
            var lbl = UiStyle.Label(fmt(value), 15, UiStyle.TextDim);
            lbl.CustomMinimumSize = new Vector2(64, 0);
            sl.ValueChanged += v => { set(v); lbl.Text = fmt(v); applied?.Invoke(); };
            box.AddChild(sl);
            box.AddChild(lbl);
            Row(label, box);
            return box;
        }
        CheckButton Toggle(string label, bool value, Action<bool> set)
        {
            var c = new CheckButton { ButtonPressed = value };
            c.Toggled += v => { set(v); applied?.Invoke(); };
            Row(label, c);
            return c;
        }
        OptionButton Options(string label, string[] items, int selected, Action<int> set)
        {
            var o = new OptionButton();
            foreach (var it in items) o.AddItem(it);
            o.Selected = selected;
            o.ItemSelected += i => { set((int)i); applied?.Invoke(); };
            Row(label, o);
            return o;
        }

        SliderRow("Mouse sensitivity", 0.03, 1.0, 0.01, s.Sensitivity, v => s.Sensitivity = (float)v, v => $"{v:0.00}");
        Toggle("Invert mouse Y", s.InvertY, v => s.InvertY = v);
        SliderRow("Field of view", 50, 110, 1, s.Fov, v => s.Fov = (float)v, v => $"{v:0}°");
        SliderRow("Render distance", 3, 16, 1, s.RenderDistance, v => s.RenderDistance = (int)v, v => $"{v:0} chunks");
        SliderRow("Brightness", 0.6, 1.6, 0.05, s.Brightness, v => s.Brightness = (float)v, v => $"{v * 100:0}%");
        SliderRow("Volume", 0, 1, 0.05, s.MasterVolume, v => { s.MasterVolume = (float)v; s.ApplyDisplay(); }, v => $"{v * 100:0}%");
        SliderRow("Music", 0, 1, 0.05, s.MusicVolume, v => s.MusicVolume = (float)v, v => $"{v * 100:0}%");
        Options("Graphics", global::Strata.Settings.GraphicsNames, s.Graphics, v => s.Graphics = v);
        Toggle("View bobbing", s.ViewBobbing, v => s.ViewBobbing = v);
        Toggle("VSync", s.VSync, v => { s.VSync = v; s.ApplyDisplay(); });
        Toggle("Fullscreen", s.Fullscreen, v => { s.Fullscreen = v; s.ApplyDisplay(); });
        var res = new List<string> { "Window as is" };
        foreach (var r in global::Strata.Settings.Resolutions) res.Add($"{r.X} × {r.Y}");
        Options("Resolution", res.ToArray(), s.ResolutionIndex + 1, v => { s.ResolutionIndex = v - 1; s.ApplyDisplay(); });

        col.AddChild(UiStyle.Spacer(6));
        col.AddChild(UiStyle.Label("Controls: WASD move · Space jump · Shift sneak · Ctrl sprint · E inventory · Q drop · 1-9 / wheel hotbar · F3 debug · F2 screenshot · F1 hide HUD", 13, UiStyle.TextDim, HorizontalAlignment.Center));
        col.GetChild<Label>(col.GetChildCount() - 1).AutowrapMode = TextServer.AutowrapMode.WordSmart;
        col.AddChild(UiStyle.Button("Done", () => { s.Save(); applied?.Invoke(); root.QueueFree(); }));
        return root;
    }
}
