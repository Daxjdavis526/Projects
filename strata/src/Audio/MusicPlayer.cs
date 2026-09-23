using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Godot;

namespace Strata;

/// <summary>
/// The soundtrack. A piece now and then, never two at once and never the same
/// one twice running, with silence between: on the title screen a couple of
/// seconds after it opens, in a world after a minute or so and then every few
/// minutes. Which pieces can come up depends on <see cref="Mood"/>: day,
/// night, or deep underground. A piece is rendered on a worker thread when it
/// is wanted, which takes a second or two, and let go when it ends.
/// </summary>
public sealed partial class MusicPlayer : Node
{
    public static MusicPlayer I;
    /// <summary>The music setting, 0..1. The master volume is applied on the bus.</summary>
    public Func<float> Volume = () => 0.5f;
    public MusicMood Mood = MusicMood.Menu;
    /// <summary>Pieces are levelled to a full peak; this sits them under the game's own sounds.</summary>
    public const float Level = 0.8f;
    public const float FadeSeconds = 2.5f;

    private AudioStreamPlayer _player;
    private float _wait = 2f;
    private float _fade = 1f;
    private bool _fadingOut, _inGame;
    private string _last;
    private Task<(Piece piece, AudioStreamWav stream)> _pending;
    private readonly Random _rng = new();

    /// <summary>The piece playing, or null.</summary>
    public Piece Current { get; private set; }

    public override void _Ready()
    {
        I = this;
        _player = new AudioStreamPlayer { Name = "Piece", Bus = "Master" };
        AddChild(_player);
        _player.Finished += () =>
        {
            if (Current == null) return;
            Stop();
            _wait = Gap();
        };
    }

    public override void _ExitTree()
    {
        if (I == this) I = null;
    }

    /// <summary>Back to the title screen: whatever plays fades out, and a menu piece follows shortly.</summary>
    public void EnterMenu()
    {
        _inGame = false;
        Mood = MusicMood.Menu;
        Restart(2f);
    }

    /// <summary>Into a world: whatever plays fades out, and the first piece comes after a while.</summary>
    public void EnterGame(float firstWait = -1f)
    {
        _inGame = true;
        Mood = MusicMood.Day;
        Restart(firstWait >= 0f ? firstWait : 30f + (float)_rng.NextDouble() * 45f);
    }

    private void Restart(float wait)
    {
        _pending = null;                    // a piece still rendering for the old place is dropped when done
        if (Current != null) _fadingOut = true;
        _wait = wait;
    }

    /// <summary>How long the quiet lasts after a piece: short on the title screen, a few minutes in a world.</summary>
    private float Gap() => _inGame ? 120f + (float)_rng.NextDouble() * 180f : 40f + (float)_rng.NextDouble() * 50f;

    public override void _Process(double delta)
    {
        float dt = (float)delta;
        float setting = Math.Clamp(Volume(), 0f, 1f);

        if (Current != null)
        {
            if (_fadingOut) _fade -= dt / FadeSeconds;
            if (_fade <= 0f || setting <= 0.001f)
            {
                bool leaving = _fadingOut;
                Stop();
                if (!leaving) _wait = Gap();          // turned all the way down: the next piece waits its turn
                return;
            }
            _player.VolumeDb = Mathf.LinearToDb(Math.Max(0.0001f, setting * Level * _fade));
            return;
        }

        if (_pending != null)
        {
            if (!_pending.IsCompleted) return;
            var task = _pending;
            _pending = null;
            if (task.IsFaulted)
            {
                GD.PrintErr("music: " + task.Exception?.GetBaseException().Message);
                _wait = Gap();
                return;
            }
            var (piece, stream) = task.Result;
            if (setting <= 0.001f) return;
            _last = piece.Id;
            Current = piece;
            _fade = 1f;
            _player.Stream = stream;
            _player.VolumeDb = Mathf.LinearToDb(Math.Max(0.0001f, setting * Level));
            _player.Play();
            GD.Print($"music: {piece.Title}");
            return;
        }

        _wait -= dt;
        if (_wait > 0f || setting <= 0.001f) return;
        var next = Choose(Mood);
        if (next == null) { _wait = Gap(); return; }
        _pending = Task.Run(() => (next, Stream(Music.Render(next))));
    }

    private void Stop()
    {
        _player.Stop();
        _player.Stream = null;              // a piece is some twenty megabytes; let it go
        Current = null;
        _fade = 1f;
        _fadingOut = false;
    }

    /// <summary>A piece for the mood, not the one just played if there is another.</summary>
    private Piece Choose(MusicMood mood)
    {
        var options = new List<Piece>(Music.For(mood));
        if (options.Count > 1) options.RemoveAll(p => p.Id == _last);
        return options.Count == 0 ? null : options[_rng.Next(options.Count)];
    }

    /// <summary>A rendered piece as a stream the engine can play.</summary>
    public static AudioStreamWav Stream(Music.Rendered r) => new()
    {
        Format = AudioStreamWav.FormatEnum.Format16Bits,
        MixRate = Piano.Rate,
        Stereo = true,
        Data = r.Pcm,
    };
}
