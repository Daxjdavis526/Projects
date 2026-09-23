using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// Plays the synthesised sound bank: positional one-shots from a pool of
/// players, plus a few looping ambiences. Every sound is generated at startup
/// by SoundBank; nothing is loaded from disk.
/// </summary>
public sealed partial class Sfx : Node3D
{
    public static Sfx I;
    private readonly List<AudioStreamPlayer3D> _pool3 = new();
    private readonly List<AudioStreamPlayer> _pool2 = new();
    private int _next3, _next2;
    public float Volume = 1f;

    public void SetVolume(float v) => Volume = Math.Clamp(v, 0f, 1f);

    public override void _Ready()
    {
        I = this;
        SoundBank.Build();
        for (int i = 0; i < 24; i++)
        {
            var p = new AudioStreamPlayer3D { UnitSize = 6f, MaxDistance = 48f, AttenuationModel = AudioStreamPlayer3D.AttenuationModelEnum.InverseDistance, Bus = "Master" };
            AddChild(p);
            _pool3.Add(p);
        }
        for (int i = 0; i < 8; i++)
        {
            var p = new AudioStreamPlayer { Bus = "Master" };
            AddChild(p);
            _pool2.Add(p);
        }
    }

    public static void Play(string name, Vector3 pos, float volume = 1f, float pitch = 1f) => I?.PlayAt(name, pos, volume, pitch);
    public static void Ui(string name, float volume = 1f, float pitch = 1f) => I?.Play2D(name, volume, pitch);

    private void PlayAt(string name, Vector3 pos, float volume, float pitch)
    {
        var s = SoundBank.Get(name);
        if (s == null) return;
        var p = _pool3[_next3];
        _next3 = (_next3 + 1) % _pool3.Count;
        p.Stream = s;
        p.GlobalPosition = pos;
        p.VolumeDb = Mathf.LinearToDb(Math.Max(0.0001f, volume * Volume));
        p.PitchScale = pitch * (float)GD.RandRange(0.94, 1.06);
        p.Play();
    }

    private void Play2D(string name, float volume, float pitch)
    {
        var s = SoundBank.Get(name);
        if (s == null) return;
        var p = _pool2[_next2];
        _next2 = (_next2 + 1) % _pool2.Count;
        p.Stream = s;
        p.VolumeDb = Mathf.LinearToDb(Math.Max(0.0001f, volume * Volume));
        p.PitchScale = pitch;
        p.Play();
    }

    /// <summary>The block family's sound for breaking, placing, stepping or digging.</summary>
    public static string BlockSound(BlockDef d, string action) => action + "_" + d.Sound.ToString().ToLowerInvariant();
}
