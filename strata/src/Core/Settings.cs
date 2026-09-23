using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using Godot;

namespace Strata;

/// <summary>Player preferences, saved as JSON in the user folder and applied on change.</summary>
public sealed class Settings
{
    public float Sensitivity { get; set; } = 0.22f;   // degrees per pixel
    public bool InvertY { get; set; }
    public float Fov { get; set; } = 75f;
    public int RenderDistance { get; set; } = 10;      // columns
    public float MasterVolume { get; set; } = 0.8f;
    public float MusicVolume { get; set; } = 0.5f;
    public int Graphics { get; set; } = 2;            // 0 fast, 1 balanced, 2 fancy
    public bool VSync { get; set; } = true;
    public bool Fullscreen { get; set; }
    public int ResolutionIndex { get; set; } = -1;    // -1 = keep the window as is
    public bool ViewBobbing { get; set; } = true;
    public float Brightness { get; set; } = 1f;
    public bool ShowFps { get; set; }

    public static readonly Vector2I[] Resolutions =
    {
        new(1280, 720), new(1366, 768), new(1600, 900), new(1920, 1080), new(2560, 1440), new(3840, 2160),
    };
    public static readonly string[] GraphicsNames = { "Fast", "Balanced", "Fancy" };

    private static string PathOnDisk => ProjectSettings.GlobalizePath("user://settings.json");

    public static Settings Load()
    {
        try
        {
            if (System.IO.File.Exists(PathOnDisk))
            {
                var s = JsonSerializer.Deserialize<Settings>(System.IO.File.ReadAllText(PathOnDisk));
                if (s != null) { s.Clamp(); return s; }
            }
        }
        catch (Exception e) { GD.PrintErr("settings unreadable, using defaults: " + e.Message); }
        return new Settings();
    }

    public void Save()
    {
        try
        {
            Clamp();
            ChunkStore.AtomicWriteText(PathOnDisk, JsonSerializer.Serialize(this, new JsonSerializerOptions { WriteIndented = true }));
        }
        catch (Exception e) { GD.PrintErr("could not save settings: " + e.Message); }
    }

    public void Clamp()
    {
        Sensitivity = Math.Clamp(Sensitivity, 0.02f, 1.5f);
        Fov = Math.Clamp(Fov, 50f, 110f);
        RenderDistance = Math.Clamp(RenderDistance, 3, 20);
        MasterVolume = Math.Clamp(MasterVolume, 0f, 1f);
        MusicVolume = Math.Clamp(MusicVolume, 0f, 1f);
        Graphics = Math.Clamp(Graphics, 0, 2);
        Brightness = Math.Clamp(Brightness, 0.6f, 1.6f);
        ResolutionIndex = Math.Clamp(ResolutionIndex, -1, Resolutions.Length - 1);
    }

    /// <summary>Pushes the window and audio settings to the engine.</summary>
    public void ApplyDisplay()
    {
        if (DisplayServer.GetName() == "headless") return;
        DisplayServer.WindowSetVsyncMode(VSync ? DisplayServer.VSyncMode.Enabled : DisplayServer.VSyncMode.Disabled);
        var mode = Fullscreen ? DisplayServer.WindowMode.Fullscreen : DisplayServer.WindowMode.Windowed;
        if (DisplayServer.WindowGetMode() != mode) DisplayServer.WindowSetMode(mode);
        if (!Fullscreen && ResolutionIndex >= 0)
        {
            var size = Resolutions[ResolutionIndex];
            var screen = DisplayServer.ScreenGetSize();
            if (size.X <= screen.X && size.Y <= screen.Y)
            {
                DisplayServer.WindowSetSize(size);
                DisplayServer.WindowSetPosition((screen - size) / 2);
            }
        }
        int bus = AudioServer.GetBusIndex("Master");
        AudioServer.SetBusVolumeDb(bus, Mathf.LinearToDb(Math.Max(0.0001f, MasterVolume)));
    }
}
