using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// The title screen: a real world turning slowly behind the menu, the list
/// of saved worlds with their details, world creation, deletion, settings.
/// </summary>
public sealed partial class MainMenu : Control
{
    public App App;
    private Control _page;
    private Node3D _backdrop;
    private WorldView _view;
    private Camera3D _cam;
    private float _angle;
    private Vector3 _center;

    public override void _Ready()
    {
        Theme = UiStyle.Theme;
        UiStyle.FillParent(this);
        BuildBackdrop();
        ShowTitle();
    }

    private void BuildBackdrop()
    {
        _backdrop = new Node3D();
        AddChild(_backdrop);
        _cam = new Camera3D { Fov = 70, Far = 2000, Current = true };
        _backdrop.AddChild(_cam);
        var world = new World(Hash.StringSeed("strata-title"));
        _view = new WorldView();
        _backdrop.AddChild(_view);
        _view.Init(world, null, _cam, 6);
        _view.Sky.Time = 0.33;
        var (sx, sy, sz) = world.Gen.FindSpawn();
        _center = new Vector3(sx, sy + 22, sz);
        _cam.Position = _center;
    }

    public override void _Process(double delta)
    {
        _angle += (float)delta * 0.03f;
        var eye = _center + new Vector3(MathF.Cos(_angle) * 30f, 6f, MathF.Sin(_angle) * 30f);
        _cam.Position = eye;
        _cam.LookAt(_center + new Vector3(0, -8, 0), Vector3.Up);
        _view.Sky.Time += delta / 2400.0;
        _view.Step(delta, _cam);
    }

    public override void _ExitTree()
    {
        _view?.Chunks.Jobs.Clear();
    }

    private void SetPage(Control c)
    {
        _page?.QueueFree();
        _page = c;
        AddChild(c);
    }

    private static Control Page()
    {
        var root = new Control { MouseFilter = MouseFilterEnum.Pass };
        UiStyle.FillParent(root);
        var shade = new ColorRect { Color = new Color(0, 0, 0, 0.25f), MouseFilter = MouseFilterEnum.Ignore };
        UiStyle.FillParent(shade);
        root.AddChild(shade);
        return root;
    }

    // --- title -----------------------------------------------------------------------------

    private void ShowTitle()
    {
        var root = Page();
        var center = new CenterContainer();
        UiStyle.FillParent(center);
        root.AddChild(center);
        var col = new VBoxContainer();
        col.AddThemeConstantOverride("separation", 12);
        center.AddChild(col);
        var title = UiStyle.HudLabel("STRATA", 96, UiStyle.Accent);
        title.HorizontalAlignment = HorizontalAlignment.Center;
        title.AddThemeConstantOverride("outline_size", 14);
        col.AddChild(title);
        var sub = UiStyle.HudLabel("dig down · build up · last the night", 20, UiStyle.Text);
        sub.HorizontalAlignment = HorizontalAlignment.Center;
        col.AddChild(sub);
        col.AddChild(UiStyle.Spacer(26));
        var play = UiStyle.Button("Play", ShowWorlds, 320);
        col.AddChild(play);
        col.AddChild(UiStyle.Button("Settings", () => AddChild(Menus.Settings(App.Settings, null)), 320));
        col.AddChild(UiStyle.Button("Quit", () => GetTree().Quit(), 320));
        var ver = UiStyle.HudLabel("an original voxel survival game · all art and sound generated at runtime", 14, UiStyle.TextDim);
        ver.HorizontalAlignment = HorizontalAlignment.Center;
        col.AddChild(UiStyle.Spacer(20));
        col.AddChild(ver);
        SetPage(root);
        play.GrabFocus();
    }

    // --- worlds -----------------------------------------------------------------------------

    private string _selected;

    private void ShowWorlds()
    {
        var root = Page();
        var center = new CenterContainer();
        UiStyle.FillParent(center);
        root.AddChild(center);
        var panel = new PanelContainer { CustomMinimumSize = new Vector2(720, 520) };
        center.AddChild(panel);
        var col = new VBoxContainer();
        col.AddThemeConstantOverride("separation", 10);
        panel.AddChild(col);
        col.AddChild(UiStyle.Label("Your Worlds", 30, UiStyle.Accent));

        var scroll = new ScrollContainer { CustomMinimumSize = new Vector2(680, 330), HorizontalScrollMode = ScrollContainer.ScrollMode.Disabled };
        col.AddChild(scroll);
        var list = new VBoxContainer { SizeFlagsHorizontal = SizeFlags.ExpandFill };
        list.AddThemeConstantOverride("separation", 6);
        scroll.AddChild(list);

        var worlds = WorldSave.List();
        var rows = new List<(string folder, Button b)>();
        if (worlds.Count == 0)
            list.AddChild(UiStyle.Label("No worlds yet. Make one.", 18, UiStyle.TextDim));
        foreach (var w in worlds)
        {
            var b = new Button { ToggleMode = true, CustomMinimumSize = new Vector2(660, 64), Alignment = HorizontalAlignment.Left };
            b.Text = $"{w.Name}\n{w.LastPlayed:yyyy-MM-dd HH:mm}  ·  played {Fmt(w.PlaySeconds)}  ·  seed {w.SeedText}  ·  {WorldSave.SizeOnDisk(w.Folder) / 1024} KB";
            b.AddThemeFontSizeOverride("font_size", 16);
            string folder = w.Folder;
            b.Pressed += () =>
            {
                _selected = folder;
                foreach (var (f, other) in rows) other.ButtonPressed = f == folder;
            };
            b.GuiInput += e => { if (e is InputEventMouseButton mb && mb.DoubleClick) Play(folder); };
            rows.Add((folder, b));
            list.AddChild(b);
        }
        if (worlds.Count > 0) { _selected = worlds[0].Folder; rows[0].b.ButtonPressed = true; }

        var buttons = new HBoxContainer { Alignment = BoxContainer.AlignmentMode.Center };
        buttons.AddThemeConstantOverride("separation", 10);
        col.AddChild(buttons);
        var play = UiStyle.Button("Play Selected", () => { if (_selected != null) Play(_selected); }, 200);
        play.Disabled = worlds.Count == 0;
        buttons.AddChild(play);
        buttons.AddChild(UiStyle.Button("New World", ShowCreate, 200));
        var del = UiStyle.Button("Delete", () => { if (_selected != null) ConfirmDelete(_selected); }, 140);
        del.Disabled = worlds.Count == 0;
        buttons.AddChild(del);
        col.AddChild(UiStyle.Button("Back", ShowTitle, 200));
        SetPage(root);
    }

    private static string Fmt(double seconds)
    {
        var t = TimeSpan.FromSeconds(seconds);
        return t.TotalHours >= 1 ? $"{(int)t.TotalHours}h {t.Minutes}m" : $"{t.Minutes}m {t.Seconds}s";
    }

    private void Play(string folder)
    {
        var m = WorldSave.TryLoad(folder);
        if (m == null) { ShowMessage("That world's save is damaged and could not be read."); return; }
        App.StartGame(m);
    }

    private void ConfirmDelete(string folder)
    {
        var m = WorldSave.TryLoad(folder);
        var root = Menus.Overlay(0.5f);
        var col = Menus.CenterColumn(root, 440);
        col.AddChild(UiStyle.Label($"Delete \"{m?.Name ?? folder}\"?", 24, UiStyle.Bad, HorizontalAlignment.Center));
        col.AddChild(UiStyle.Label("It cannot be brought back.", 16, UiStyle.TextDim, HorizontalAlignment.Center));
        col.AddChild(UiStyle.Button("Delete forever", () => { WorldSave.Delete(folder); root.QueueFree(); ShowWorlds(); }));
        col.AddChild(UiStyle.Button("Keep it", () => root.QueueFree()));
        AddChild(root);
    }

    private void ShowMessage(string text)
    {
        var root = Menus.Overlay(0.5f);
        var col = Menus.CenterColumn(root, 440);
        var l = UiStyle.Label(text, 18, UiStyle.Text, HorizontalAlignment.Center);
        l.AutowrapMode = TextServer.AutowrapMode.WordSmart;
        col.AddChild(l);
        col.AddChild(UiStyle.Button("OK", () => root.QueueFree()));
        AddChild(root);
    }

    // --- new world --------------------------------------------------------------------------

    private void ShowCreate()
    {
        var root = Page();
        var col = Menus.CenterColumn(root, 520);
        col.AddChild(UiStyle.Label("New World", 30, UiStyle.Accent));
        col.AddChild(UiStyle.Label("Name", 16, UiStyle.TextDim));
        var name = new LineEdit { Text = "New World", CustomMinimumSize = new Vector2(480, 40), MaxLength = 40 };
        col.AddChild(name);
        col.AddChild(UiStyle.Label("Seed (leave empty for a random one; any text works)", 16, UiStyle.TextDim));
        var seedRow = new HBoxContainer();
        seedRow.AddThemeConstantOverride("separation", 8);
        var seed = new LineEdit { PlaceholderText = "random", CustomMinimumSize = new Vector2(340, 40), SizeFlagsHorizontal = SizeFlags.ExpandFill };
        seedRow.AddChild(seed);
        seedRow.AddChild(UiStyle.Button("Random", () => seed.Text = (new Random().NextInt64() & 0x7FFFFFFFFFFFL).ToString(), 130));
        col.AddChild(seedRow);
        col.AddChild(UiStyle.Spacer(8));
        col.AddChild(UiStyle.Button("Create and Play", () =>
        {
            var m = WorldSave.Create(name.Text, seed.Text);
            App.StartGame(m);
        }));
        col.AddChild(UiStyle.Button("Back", ShowWorlds));
        SetPage(root);
        name.GrabFocus();
        name.SelectAll();
    }
}
