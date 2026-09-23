using Godot;

namespace Strata;

/// <summary>The top of the tree: switches between the title screen and a running world.</summary>
public sealed partial class App : Node
{
    public Settings Settings;
    private MainMenu _menu;
    private Game _game;
    private Sfx _sfx;

    public override void _Ready()
    {
        Settings = Settings.Load();
        Settings.ApplyDisplay();
        if (DisplayServer.GetName() != "headless") DisplayServer.SetIcon(AppIcon.Paint());
        InputSetup.Ensure();
        _sfx = new Sfx { Name = "Sfx" };
        AddChild(_sfx);
        _sfx.SetVolume(Settings.MasterVolume);
        GetTree().AutoAcceptQuit = false;
        ShowMenu();
    }

    public void ShowMenu()
    {
        _game = null;
        Input.MouseMode = Input.MouseModeEnum.Visible;
        _menu = new MainMenu { App = this, Name = "Menu" };
        AddChild(_menu);
    }

    public void StartGame(WorldMeta meta)
    {
        _menu?.QueueFree();
        _menu = null;
        _game = new Game { App = this, Name = "Game" };
        _game.Begin(meta, Settings);
        AddChild(_game);
    }

    public override void _Notification(int what)
    {
        if (what == NotificationWMCloseRequest)
        {
            _game?.Save();
            Settings.Save();
            GetTree().Quit();
        }
    }
}
