using System;
using Godot;

namespace Strata;

/// <summary>
/// Looping beds under everything: wind on open ground, rain when it rains,
/// drips and hum underground. Each loop fades in and out rather than
/// switching. (The music is played by <see cref="MusicPlayer"/>.)
/// </summary>
public sealed partial class Ambience : Node
{
    private AudioStreamPlayer _wind, _rain, _cave, _water;

    public override void _Ready()
    {
        _wind = Loop("amb_wind");
        _rain = Loop("amb_rain");
        _cave = Loop("amb_cave");
        _water = Loop("amb_underwater");
    }

    private AudioStreamPlayer Loop(string name)
    {
        var p = new AudioStreamPlayer { Stream = SoundBank.Get(name), VolumeDb = -80, Autoplay = false };
        AddChild(p);
        if (p.Stream != null) p.Play();
        return p;
    }

    private static void Fade(AudioStreamPlayer p, float target, float dt)
    {
        if (p.Stream == null) return;
        float cur = Mathf.DbToLinear(p.VolumeDb);
        cur = Mathf.MoveToward(cur, target, dt * 0.5f);
        p.VolumeDb = Mathf.LinearToDb(Math.Max(0.0001f, cur));
    }

    public void Step(float dt, Game g)
    {
        var p = g.Player;
        var b = p.Body;
        int x = V.FloorToInt(b.X), y = V.FloorToInt(b.Y + 1.6), z = V.FloorToInt(b.Z);
        int sky = g.World.SkyLight(x, y, z);
        float open = sky / 15f;
        bool under = b.HeadInWater;
        float vol = g.Settings.MasterVolume;
        float rain = g.Weather.Kind == Precip.Rain ? g.Weather.Intensity : 0f;
        Fade(_wind, under ? 0f : (0.12f + 0.25f * Math.Clamp((float)(b.Y - 70) / 60f, 0f, 1f) + 0.2f * g.View.Sky.Storm) * open * vol, dt);
        Fade(_rain, under ? 0f : rain * (0.25f + 0.55f * open) * vol, dt);
        Fade(_cave, under ? 0f : (1f - open) * (b.Y < 55 ? 0.35f : 0.1f) * vol, dt);
        Fade(_water, under ? 0.5f * vol : 0f, dt * 4f);

        // Which pieces suit the place: the deep ones out of the sky's reach well below sea level, else by the hour.
        if (MusicPlayer.I != null)
            MusicPlayer.I.Mood = sky < 4 && b.Y < V.SeaLevel - 6 ? MusicMood.Deep : g.View.Sky.IsNight ? MusicMood.Night : MusicMood.Day;
    }
}
