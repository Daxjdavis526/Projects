using System;
using Godot;

namespace Strata;

/// <summary>
/// Connects a Gargantua world's black hole to the game: hands its geometry to
/// the sky shader, shows a readout as you near it (how far, how fast your
/// clock runs against the world's), rumbles, runs the world's clock fast
/// while yours is slowed, and opens the tesseract when you cross the horizon.
/// </summary>
public sealed partial class GargantuaView : Node
{
    public Game Game;
    private Label _info;
    private AudioStreamPlayer _rumble;

    public override void _Ready()
    {
        Gargantua.Publish(Game.World.Gargantua);
        _info = UiStyle.Label("", 15, new Color(1f, 0.86f, 0.62f));
        _info.Position = new Vector2(12, 40);
        _info.MouseFilter = Control.MouseFilterEnum.Ignore;
        Game.Ui.AddChild(_info);
        _rumble = new AudioStreamPlayer { Stream = SoundBank.Get("amb_gargantua"), VolumeDb = -80f };
        AddChild(_rumble);
        if (_rumble.Stream != null) _rumble.Play();
    }

    public override void _ExitTree() => Gargantua.Publish(null);

    public void Step(float dt)
    {
        var g = Game;
        var bh = g.World.Gargantua;
        var t = g.Tesseract;
        if (bh == null) return;
        if (t.Active)
        {
            _info.Visible = false;
            Fade(0f, dt);
            return;
        }
        var p = g.Player;
        var at = p.Body.Position + new Vector3(0, 0.9f, 0);
        float r = bh.R(at);

        // Through the horizon: there is no coming back the way you came. (Aboard a rocket, the rocket's own crossing does this.)
        if (bh.Inside(at) && !p.Dead && p.Riding == null && g.State == GameState.Playing) { t.Enter(); return; }

        // Your clock runs slow down here, so the world's runs fast: the sun and the stars
        // speed up across the sky as you go in (at most 400 times, in the last moments).
        float rate = bh.ClockRate(at);
        if (r < Gargantua.Reach) g.View.Sky.Time += dt * (Math.Min(1f / Math.Max(rate, 1e-3f), 400f) - 1f) / Atmosphere.DayLengthSeconds;

        _info.Visible = r < Gargantua.Reach && !g.HudHidden;
        if (_info.Visible)
        {
            float metres = (r - Gargantua.Horizon) * Gargantua.M;
            string where = r < Gargantua.PhotonSphere ? "inside the photon sphere: no way out but in"
                : r < 6f ? "inside the innermost stable orbit"
                : r < Gargantua.DiskOuter ? "among the disk's orbits" : "approaching";
            _info.Text = $"GARGANTUA   {metres:0} m to the horizon   ·   r = {r:0.0} M   ·   {where}\n"
                + $"your clock runs at {rate:0.000}× the world's: one hour here is {Hours(1f / Math.Max(rate, 1e-4f))} out there";
        }
        Fade(Math.Clamp(1f - (r - Gargantua.Horizon) / 26f, 0f, 1f), dt);
    }

    private static string Hours(float h) => h < 10f ? $"{h:0.00} hours" : h < 48f ? $"{h:0} hours" : $"{h / 24f:0} days";

    private void Fade(float near, float dt)
    {
        if (_rumble.Stream == null) return;
        float target = near * near * 0.9f * Game.Settings.MasterVolume;
        float cur = Mathf.DbToLinear(_rumble.VolumeDb);
        cur = Mathf.MoveToward(cur, target, dt * 0.6f);
        _rumble.VolumeDb = Mathf.LinearToDb(Math.Max(0.0001f, cur));
        _rumble.PitchScale = 1f + near * 0.25f;
    }
}
