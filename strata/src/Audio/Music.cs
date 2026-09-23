using System;
using System.Collections.Generic;
using System.Globalization;

namespace Strata;

public enum MusicMood : byte { Menu, Day, Night, Deep }

/// <summary>A stretch of a piece: a chord for every bar, an optional melody, and how the left hand plays.</summary>
public sealed class Section
{
    /// <summary>One chord symbol per bar, separated by spaces; two chords sharing a bar are joined with '+'.</summary>
    public string Chords = "";
    /// <summary>
    /// Melody tokens separated by spaces: "F#5:2" is F sharp above middle C's
    /// octave held two beats, "r:1" a beat's rest, "D5+F#5:2" two notes together,
    /// and a trailing "@0.7" sets the loudness. '|' marks a bar line and is checked.
    /// </summary>
    public string Melody = "";
    public string Pattern = "flow";
    public float Accomp = 0.4f, Lead = 0.6f;
    /// <summary>End on a rolled chord, left to ring.</summary>
    public bool Roll;
}

/// <summary>One piece of music, written out as sections and played in the order of its form.</summary>
public sealed class Piece
{
    public string Id, Title;
    public MusicMood[] Moods;
    public float Bpm;
    public int Beats = 4;
    public Dictionary<string, Section> Sections = new();
    public string[] Form;
    public float Pad;                   // level of the pad under the chords; 0 for none
    public float Room = 0.86f, Wet = 0.9f;
    public int BassLow = 36, VoiceLow = 52, VoiceHigh = 69;
}

public struct NoteEvent
{
    public double Start, KeyUp;         // seconds
    public int Midi;
    public float Vel;
    public bool Lead;
}

/// <summary>Reads the note, chord and melody notation the pieces are written in.</summary>
public static class Notation
{
    private static readonly (string q, int[] iv)[] Qualities =
    {
        ("maj9", new[] { 0, 4, 7, 11, 14 }), ("maj7", new[] { 0, 4, 7, 11 }), ("madd9", new[] { 0, 3, 7, 14 }),
        ("m7b5", new[] { 0, 3, 6, 10 }), ("m9", new[] { 0, 3, 7, 10, 14 }), ("m7", new[] { 0, 3, 7, 10 }),
        ("m6", new[] { 0, 3, 7, 9 }), ("add9", new[] { 0, 4, 7, 14 }), ("sus2", new[] { 0, 2, 7 }),
        ("sus4", new[] { 0, 5, 7 }), ("dim", new[] { 0, 3, 6 }), ("9", new[] { 0, 4, 7, 10, 14 }),
        ("7", new[] { 0, 4, 7, 10 }), ("6", new[] { 0, 4, 7, 9 }), ("m", new[] { 0, 3, 7 }), ("", new[] { 0, 4, 7 }),
    };

    private static int Letter(char c) => c switch
    {
        'C' => 0, 'D' => 2, 'E' => 4, 'F' => 5, 'G' => 7, 'A' => 9, 'B' => 11,
        _ => throw new FormatException($"'{c}' is not a note letter"),
    };

    /// <summary>A pitch class and how many characters it took ("F#" is 6 in 2).</summary>
    private static (int pc, int used) PitchClass(string s, int at)
    {
        int pc = Letter(s[at]);
        int used = 1;
        if (at + 1 < s.Length && s[at + 1] == '#') { pc++; used++; }
        else if (at + 1 < s.Length && s[at + 1] == 'b') { pc--; used++; }
        return ((pc + 12) % 12, used);
    }

    /// <summary>"C4" is middle C, 60; "F#5" is 78.</summary>
    public static int Note(string s)
    {
        var (pc, used) = PitchClass(s, 0);
        int octave = int.Parse(s[used..], CultureInfo.InvariantCulture);
        int midi = 12 * (octave + 1) + pc;
        // B#, Cb and friends cross the octave line.
        if (s.Length > 1 && s[0] == 'C' && s[1] == 'b') midi += 12;
        if (s.Length > 1 && s[0] == 'B' && s[1] == '#') midi -= 12;
        return midi;
    }

    /// <summary>A chord symbol such as "Dmaj7", "Em9" or "Dmaj7/F#": the bass pitch class and the chord's pitch classes, root first.</summary>
    public static (int bass, int[] pcs) Chord(string sym)
    {
        var (root, used) = PitchClass(sym, 0);
        string rest = sym[used..];
        int slash = rest.IndexOf('/');
        string quality = slash >= 0 ? rest[..slash] : rest;
        int[] iv = null;
        foreach (var (q, i) in Qualities)
            if (q == quality) { iv = i; break; }
        if (iv == null) throw new FormatException($"unknown chord quality '{quality}' in '{sym}'");
        var pcs = new int[iv.Length];
        for (int k = 0; k < iv.Length; k++) pcs[k] = (root + iv[k]) % 12;
        int bass = root;
        if (slash >= 0) bass = PitchClass(rest, slash + 1).pc;
        return (bass, pcs);
    }

    /// <summary>The bars of a chord line: each bar one chord or two.</summary>
    public static List<string[]> Bars(string chords)
    {
        var bars = new List<string[]>();
        foreach (var bar in chords.Split(' ', StringSplitOptions.RemoveEmptyEntries)) bars.Add(bar.Split('+'));
        return bars;
    }

    /// <summary>How many beats a melody line lasts, rests included.</summary>
    public static double Length(string melody)
    {
        double beats = 0;
        foreach (var tok in melody.Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            if (tok == "|") continue;
            string t = tok.Contains('@') ? tok[..tok.IndexOf('@')] : tok;
            beats += double.Parse(t[(t.IndexOf(':') + 1)..], CultureInfo.InvariantCulture);
        }
        return beats;
    }

    /// <summary>Melody events (start and length in beats), checking every '|' falls on a bar line.</summary>
    public static List<(double beat, double len, int[] notes, float vel)> Melody(string text, int beatsPerBar, float defaultVel)
    {
        var list = new List<(double, double, int[], float)>();
        double beat = 0;
        foreach (var raw in text.Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            if (raw == "|")
            {
                double r = beat % beatsPerBar;
                if (r > 1e-6 && beatsPerBar - r > 1e-6) throw new FormatException($"bar line at beat {beat} is not on a bar boundary");
                continue;
            }
            string tok = raw;
            float vel = defaultVel;
            int at = tok.IndexOf('@');
            if (at >= 0) { vel = float.Parse(tok[(at + 1)..], CultureInfo.InvariantCulture); tok = tok[..at]; }
            int colon = tok.IndexOf(':');
            if (colon < 0) throw new FormatException($"'{raw}' has no length");
            double len = double.Parse(tok[(colon + 1)..], CultureInfo.InvariantCulture);
            string what = tok[..colon];
            if (what != "r")
            {
                var parts = what.Split('+');
                var notes = new int[parts.Length];
                for (int k = 0; k < parts.Length; k++) notes[k] = Note(parts[k]);
                list.Add((beat, len, notes, vel));
            }
            beat += len;
        }
        return list;
    }
}

/// <summary>
/// Turns a piece into notes and the notes into sound: the left hand plays
/// each chord in a pattern with voices led smoothly from chord to chord, the
/// right hand plays the melody a touch behind the beat, the pedal is lifted
/// at every change of chord, the last bars slow down, and the whole is
/// placed in a hall. Timing and touch vary a little, the same way every time.
/// </summary>
public static class Music
{
    private static readonly Dictionary<string, (int beats, (double at, int voice, float vel)[] ev)> Patterns = new()
    {
        // voice: -1 the bass, -3 the bass an octave down, 0..3 the chord's notes from the bottom, 4..7 the same an octave up
        ["flow"] = (4, new[] { (0.0, -1, 1f), (0.5, 0, 0.8f), (1.0, 1, 0.75f), (1.5, 2, 0.8f), (2.0, 4, 0.85f), (2.5, 2, 0.75f), (3.0, 1, 0.72f), (3.5, 0, 0.68f) }),
        ["ripple"] = (4, new[] { (0.0, -1, 1f), (1.0, 0, 0.8f), (1.5, 1, 0.75f), (2.0, 2, 0.8f), (2.5, 3, 0.75f), (3.0, 2, 0.7f) }),
        ["sparse"] = (4, new[] { (0.0, -1, 1f), (1.5, 1, 0.75f), (2.5, 2, 0.7f), (3.5, 3, 0.62f) }),
        ["drone"] = (4, new[] { (0.0, -1, 1f), (0.03, -3, 0.75f), (2.0, 1, 0.6f) }),
        ["waltz"] = (3, new[] { (0.0, -1, 1f), (1.0, 0, 0.8f), (1.5, 1, 0.75f), (2.0, 2, 0.78f), (2.5, 1, 0.68f) }),
    };

    public static readonly List<Piece> All = Catalog();

    public static IEnumerable<Piece> For(MusicMood mood)
    {
        foreach (var p in All)
            if (Array.IndexOf(p.Moods, mood) >= 0) yield return p;
    }

    // --- arranging ----------------------------------------------------------------------------

    /// <summary>Seconds at a beat, with the last two bars slowing to about three quarters of the pace.</summary>
    private static double Seconds(double beat, double spb, double ritStart, double ritLen)
    {
        if (beat <= ritStart) return beat * spb;
        double d = Math.Min(beat - ritStart, ritLen);
        double extra = beat - ritStart - d;
        return spb * (ritStart + d + 0.2 * d * d / ritLen + extra * 1.4);
    }

    /// <summary>Chord notes placed in a register, as close as possible to where the last chord's notes were.</summary>
    private static int[] Voice(int[] pcs, int[] prev, int low, int high)
    {
        // Five-note chords drop the fifth; the bass has the root.
        var tones = new List<int>(pcs);
        if (tones.Count > 4) tones.RemoveAt(2);
        int[] best = null;
        double bestCost = double.MaxValue;
        for (int r = 0; r < tones.Count; r++)
        {
            var v = new int[tones.Count];
            int note = low + ((tones[r] - low) % 12 + 12) % 12;
            v[0] = note;
            for (int k = 1; k < tones.Count; k++)
            {
                int pc = tones[(r + k) % tones.Count];
                int next = note + 1 + ((pc - note - 1) % 12 + 12) % 12;
                v[k] = next;
                note = next;
            }
            if (v[^1] > high + 4) continue;
            double cost = 0;
            if (prev != null)
            {
                for (int k = 0; k < v.Length; k++) cost += Math.Abs(v[k] - prev[Math.Min(k, prev.Length - 1)]);
            }
            else cost = Math.Abs((v[0] + v[^1]) / 2.0 - (low + high) / 2.0);
            if (cost < bestCost) { bestCost = cost; best = v; }
        }
        return best ?? new[] { low + tones[0] % 12 };
    }

    /// <summary>
    /// The piece's notes, pad chords and length in seconds. maxBars stops
    /// early (the tests use it to render a quick excerpt).
    /// </summary>
    public static (List<NoteEvent> notes, List<(double start, double end, int[] voicing)> chords, double seconds) Arrange(Piece piece, int maxBars = int.MaxValue)
    {
        double spb = 60.0 / piece.Bpm;
        int beats = piece.Beats;
        // Lay out the sections first to find the length (for the slowing at the end).
        var layout = new List<(Section s, List<string[]> bars, double at)>();
        double total = 0;
        int barCount = 0;
        foreach (var name in piece.Form)
        {
            var s = piece.Sections[name];
            var bars = Notation.Bars(s.Chords);
            if (barCount + bars.Count > maxBars) bars = bars.GetRange(0, Math.Max(0, maxBars - barCount));
            if (bars.Count == 0) break;
            layout.Add((s, bars, total));
            total += bars.Count * beats;
            barCount += bars.Count;
        }
        double ritLen = 2.0 * beats, ritStart = Math.Max(0, total - ritLen);
        double Sec(double b) => Seconds(b, spb, ritStart, ritLen);

        var rng = new Rng((ulong)piece.Id.GetHashCode() * 2654435761UL + 17);
        var notes = new List<NoteEvent>();
        var chords = new List<(double start, double end, int[] voicing)>();
        var lifts = new List<double>();
        int[] prev = null;

        foreach (var (s, bars, at) in layout)
        {
            var pattern = Patterns[s.Pattern];
            if (pattern.beats != beats) throw new FormatException($"pattern {s.Pattern} is for {pattern.beats} beats, piece {piece.Id} has {beats}");
            for (int b = 0; b < bars.Count; b++)
            {
                double barBeat = at + b * beats;
                bool last = s.Roll && b == bars.Count - 1;
                int parts = bars[b].Length;
                double partLen = (double)beats / parts;
                for (int part = 0; part < parts; part++)
                {
                    var (bassPc, pcs) = Notation.Chord(bars[b][part]);
                    var v = Voice(pcs, prev, piece.VoiceLow, piece.VoiceHigh);
                    prev = v;
                    int bass = piece.BassLow + ((bassPc - piece.BassLow) % 12 + 12) % 12;
                    double start = barBeat + part * partLen;
                    lifts.Add(Sec(start));
                    chords.Add((Sec(start), Sec(start + partLen), v));
                    if (last)
                    {
                        // A rolled chord, left to ring out.
                        Add(notes, ref rng, Sec(start), Sec(start) + 9, bass, s.Accomp * 1.05f, false);
                        Add(notes, ref rng, Sec(start) + 0.02, Sec(start) + 9, bass - 12, s.Accomp * 0.8f, false);
                        for (int k = 0; k < v.Length; k++)
                            Add(notes, ref rng, Sec(start + 0.12 * (k + 1)), Sec(start) + 9, v[k], s.Accomp * 0.85f, false);
                        Add(notes, ref rng, Sec(start + 0.12 * (v.Length + 1)), Sec(start) + 9, v[0] + 12, s.Accomp * 0.8f, false);
                        continue;
                    }
                    foreach (var (off, voice, vm) in pattern.ev)
                    {
                        if (off >= partLen - 1e-6) continue;
                        int midi = voice switch
                        {
                            -1 => bass,
                            -3 => bass - 12,
                            _ when voice < 4 => voice < v.Length ? v[voice] : v[voice % v.Length] + 12,
                            _ => v[(voice - 4) % v.Length] + 12,
                        };
                        double t = start + off;
                        float vel = s.Accomp * vm * (voice < 0 ? 1.1f : 1f);
                        Add(notes, ref rng, Sec(t), Sec(t + 0.4), midi, vel, false);
                    }
                }
            }
            // The melody, a touch behind the beat.
            if (s.Melody.Length > 0)
            {
                double sectionBeats = bars.Count * beats;
                foreach (var (beat, len, ns, vel) in Notation.Melody(s.Melody, beats, s.Lead))
                {
                    if (beat >= sectionBeats - 1e-6) break;
                    double t0 = at + beat;
                    float accent = Math.Abs(beat % beats) < 1e-6 ? 1.05f : 1f;
                    foreach (int midi in ns)
                        Add(notes, ref rng, Sec(t0) + 0.012, Sec(t0 + len), midi, vel * accent, true);
                }
            }
        }

        // The pedal: a note sounds until its key is up and the pedal has lifted at the next change of chord.
        lifts.Sort();
        double end = Sec(total);
        for (int i = 0; i < notes.Count; i++)
        {
            var n = notes[i];
            double release = end + 8;
            int idx = lifts.BinarySearch(n.KeyUp);
            if (idx < 0) idx = ~idx;
            if (idx < lifts.Count) release = Math.Max(n.KeyUp, lifts[idx]);
            n.KeyUp = release;
            notes[i] = n;
        }
        return (notes, chords, end + 7.0);
    }

    private static void Add(List<NoteEvent> list, ref Rng rng, double start, double keyUp, int midi, float vel, bool lead)
    {
        if (midi < 21 || midi > 108) return;
        start += rng.Range(-0.009f, 0.009f);
        vel = Math.Clamp(vel + rng.Range(-0.035f, 0.035f), 0.08f, 1f);
        list.Add(new NoteEvent { Start = Math.Max(0, start), KeyUp = Math.Max(start + 0.05, keyUp), Midi = midi, Vel = vel, Lead = lead });
    }

    // --- rendering ----------------------------------------------------------------------------

    public sealed class Rendered
    {
        public string Id;
        public byte[] Pcm;              // 16-bit little-endian, stereo interleaved, at Piano.Rate
        public int Frames;
        public float Seconds, Peak, Rms, Gain;
    }

    /// <summary>Pieces are levelled to this average loudness (RMS, -20 dBFS), unless that would push a peak past <see cref="MaxPeak"/>.</summary>
    public const float TargetRms = 0.1f, MaxPeak = 0.89f;

    /// <summary>The whole piece, levelled so every piece sounds about as loud as the others. Safe off the main thread.</summary>
    public static Rendered Render(Piece piece, int maxBars = int.MaxValue)
    {
        var (left, right) = Mix(piece, maxBars);
        float peak = 1e-6f;
        double sum = 1e-12;
        for (int i = 0; i < left.Length; i++)
        {
            peak = Math.Max(peak, Math.Max(Math.Abs(left[i]), Math.Abs(right[i])));
            sum += left[i] * left[i] + right[i] * right[i];
        }
        float rms = (float)Math.Sqrt(sum / (2.0 * Math.Max(1, left.Length)));
        return Level(piece.Id, left, right, Math.Min(MaxPeak / peak, TargetRms / rms));
    }

    /// <summary>
    /// Plays the piece's notes (all of them, or the ones <paramref name="keep"/>
    /// picks) and its pad into a stereo buffer, and adds the hall.
    /// </summary>
    public static (float[] left, float[] right) Mix(Piece piece, int maxBars = int.MaxValue, Func<NoteEvent, bool> keep = null, bool pad = true)
    {
        var (notes, chords, seconds) = Arrange(piece, maxBars);
        int frames = (int)(seconds * Piano.Rate);
        var left = new float[frames];
        var right = new float[frames];
        var cache = new Dictionary<int, float[]>();

        foreach (var n in notes)
        {
            if (keep != null && !keep(n)) continue;
            int level = Piano.LevelFor(n.Vel);
            var sample = Piano.Note(n.Midi, level, cache);
            float amp = Math.Clamp(n.Vel / Piano.Levels[level], 0.6f, 1.5f);
            float pan = Math.Clamp((n.Midi - 62) / 40f, -0.35f, 0.35f);
            double angle = (pan + 1) * Math.PI / 4;
            float gl = (float)Math.Cos(angle) * amp, gr = (float)Math.Sin(angle) * amp;
            int i0 = (int)(n.Start * Piano.Rate);
            int rel = (int)(n.KeyUp * Piano.Rate) - i0;
            float tau = 0.09f + 0.14f * Math.Clamp((70 - n.Midi) / 34f, 0f, 1f);
            float dampStep = MathF.Exp(-1f / (tau * Piano.Rate));
            float damp = 1f;
            for (int j = 0; j < sample.Length; j++)
            {
                int i = i0 + j;
                if (i >= frames) break;
                if (j > rel) { damp *= dampStep; if (damp < 1e-4f) break; }
                float v = sample[j] * damp;
                left[i] += v * gl;
                right[i] += v * gr;
            }
        }

        // The pad doubles the left hand's chord, a soft wash behind the piano.
        if (pad && piece.Pad > 0)
            foreach (var (start, end, v) in chords)
                Piano.Pad(left, right, start, end, v, piece.Pad);

        Reverb.Apply(left, right, Piano.Rate, piece.Room, 0.35f, piece.Wet, 1f);
        // The last of the tail fades to nothing, whatever was still ringing.
        int fade = Math.Min(frames, (int)(1.5 * Piano.Rate));
        for (int i = 0; i < fade; i++)
        {
            float k = 0.5f - 0.5f * MathF.Cos(MathF.PI * i / fade);
            left[frames - 1 - i] *= k;
            right[frames - 1 - i] *= k;
        }
        return (left, right);
    }

    /// <summary>A mix scaled by <paramref name="gain"/> as 16-bit PCM.</summary>
    public static Rendered Level(string id, float[] left, float[] right, float gain)
    {
        int frames = left.Length;
        float peak = 0f;
        double sum = 0;
        for (int i = 0; i < frames; i++)
        {
            peak = Math.Max(peak, Math.Max(Math.Abs(left[i]), Math.Abs(right[i])));
            sum += left[i] * left[i] + right[i] * right[i];
        }
        var pcm = new byte[frames * 4];
        for (int i = 0; i < frames; i++)
        {
            short l = (short)Math.Clamp((int)(left[i] * gain * 32767f), -32768, 32767);
            short r = (short)Math.Clamp((int)(right[i] * gain * 32767f), -32768, 32767);
            pcm[i * 4] = (byte)l; pcm[i * 4 + 1] = (byte)(l >> 8);
            pcm[i * 4 + 2] = (byte)r; pcm[i * 4 + 3] = (byte)(r >> 8);
        }
        return new Rendered
        {
            Id = id, Pcm = pcm, Frames = frames, Seconds = frames / (float)Piano.Rate,
            Peak = peak * gain, Rms = (float)Math.Sqrt(sum / (2.0 * Math.Max(1, frames))) * gain, Gain = gain,
        };
    }

    // --- the pieces ---------------------------------------------------------------------------

    private static Section S(string chords, string melody = "", string pattern = null, float accomp = 0.4f, float lead = 0.6f, bool roll = false) =>
        new() { Chords = chords, Melody = melody, Pattern = pattern, Accomp = accomp, Lead = lead, Roll = roll };

    private static Piece P(string id, string title, float bpm, int beats, string pattern, MusicMood[] moods, string[] form, params (string name, Section s)[] sections)
    {
        var p = new Piece { Id = id, Title = title, Bpm = bpm, Beats = beats, Moods = moods, Form = form };
        foreach (var (name, s) in sections)
        {
            s.Pattern ??= pattern;
            p.Sections[name] = s;
        }
        return p;
    }

    private static List<Piece> Catalog()
    {
        var list = new List<Piece>();

        // Hearthlight: the title. D major, a warm eighth-note flow under a line that climbs and settles.
        var hearth = P("hearthlight", "Hearthlight", 64, 4, "flow", new[] { MusicMood.Menu, MusicMood.Day },
            new[] { "intro", "A", "B", "A2", "end" },
            ("intro", S("Dmaj9 Gmaj7 Dmaj9 Gmaj7", accomp: 0.34f)),
            ("A", S("Dmaj9 Gmaj7 Bm7 Aadd9 Dmaj9 Gmaj7 Em7 Asus4+A",
                "r:2 A4:1 D5:1 | F#5:3 E5:1 | D5:2 B4:1 D5:1 | E5:4 | r:2 A4:1 D5:1 | F#5:2 A5:2 | G5:1 F#5:1 E5:1 B4:1 | D5:2 C#5:2 |")),
            ("B", S("Bm7 Gmaj7 Dmaj7/F# Em7 Bm7 Gmaj7 Em9 Asus4+A",
                "B5:2 A5:1 F#5:1 | D5:3 r:1 | F#5:2 E5:1 D5:1 | B4:4 | D5:1 F#5:1 B5:2 | A5:2 G5:1 F#5:1 | E5:2 G5:2 | E5:2 C#5:2 |", lead: 0.64f)),
            ("A2", S("Dmaj9 Gmaj7 Bm7 Aadd9 Dmaj9 Gmaj7 Em7 Asus4+A",
                "r:2 A4:1 D5:1 | F#5:2 G5:1 E5:1 | D5:2 B4:1 D5:1 | E5:3 r:1 | r:1 E5:1 F#5:1 A5:1 | B5:2 A5:2 | G5:1 F#5:1 E5:1 G5:1 | E5:2 C#5:2 |")),
            ("end", S("Dmaj9 Gmaj7 Dmaj9 Dmaj9", "F#5:4 | r:4 | A4:2 D5:2 | r:4 |", accomp: 0.34f, lead: 0.52f, roll: true)));
        hearth.Pad = 0.1f;
        list.Add(hearth);

        // Morning Field: G major, a quarter-and-eighth ripple, the melody reaching up and coming home.
        list.Add(P("morning_field", "Morning Field", 72, 4, "ripple", new[] { MusicMood.Day, MusicMood.Menu },
            new[] { "intro", "A", "B", "A", "end" },
            ("intro", S("Gmaj7 Cmaj7 Gmaj7 Cmaj7", accomp: 0.36f)),
            ("A", S("Gmaj7 Cmaj7 Em7 Dsus4+D Gmaj7 Cmaj7 Am7 Dsus2",
                "B4:1 D5:1 F#5:2 | E5:2 G5:1 E5:1 | D5:3 B4:1 | A4:2 D5:2 | B4:1 D5:1 G5:2 | G5:1 E5:1 B5:2 | A5:2 G5:1 E5:1 | E5:4 |")),
            ("B", S("Em7 Cmaj7 G/B Am7 Em7 Cmaj7 Am7 D",
                "G5:2 B5:2 | E5:3 D5:1 | D5:2 B4:2 | C5:2 E5:2 | G5:1 F#5:1 E5:2 | G5:2 E5:1 C5:1 | E5:2 A4:2 | F#5:2 A5:2 |", lead: 0.63f)),
            ("end", S("Gmaj7 Cmaj7 Gmaj7 Gmaj7", "B4:2 D5:2 | E5:4 | D5:4 | r:4 |", accomp: 0.35f, lead: 0.54f, roll: true))));

        // Clearwater: C major in three, a lilting waltz.
        list.Add(P("clearwater", "Clearwater", 84, 3, "waltz", new[] { MusicMood.Day },
            new[] { "intro", "A", "B", "A", "B", "A", "end" },
            ("intro", S("Cmaj7 Fmaj7 Cmaj7 Fmaj7", accomp: 0.35f)),
            ("A", S("Cmaj7 Fmaj7 Am7 G Cmaj7 Fmaj7 Dm7 Gsus4+G",
                "E5:2 G5:1 | A5:3 | G5:1 E5:1 C5:1 | D5:3 | E5:2 G5:1 | C6:2 A5:1 | F5:1 E5:1 D5:1 | C5:1.5 B4:1.5 |")),
            ("B", S("Am7 Em7 Fmaj7 Cmaj7/E Dm7 Am7 Fmaj7 Gsus4+G",
                "C5:1 E5:1 A5:1 | G5:3 | A5:1 G5:1 E5:1 | E5:3 | F5:2 A5:1 | E5:3 | A5:1 C6:1 A5:1 | G5:1.5 D5:1.5 |", lead: 0.62f)),
            ("end", S("Cmaj7 Fmaj7 Cmaj7 Cmaj7", "E5:3 | A5:3 | G5:3 | r:3 |", accomp: 0.34f, lead: 0.52f, roll: true))));

        // Long Road: F major, slow and open, a few long notes over a sparse left hand and a quiet pad.
        var road = P("long_road", "Long Road", 60, 4, "sparse", new[] { MusicMood.Day },
            new[] { "intro", "A", "B", "A", "end" },
            ("intro", S("Fmaj7 Bbmaj7 Fmaj7 Bbmaj7", accomp: 0.38f)),
            ("A", S("Fmaj7 Am7 Bbmaj7 Csus4+C Fmaj7 Dm7 Bbmaj7 Csus2",
                "r:1 C5:1 A5:2 | G5:4 | F5:2 D5:2 | F5:2 E5:2 | r:1 C5:1 A5:2 | C6:2 A5:2 | A5:3 F5:1 | G5:4 |")),
            ("B", S("Dm7 Bbmaj7 F/A Gm7 Dm7 Bbmaj7 Gm7 C",
                "A5:2 F5:2 | D5:4 | C5:2 F5:2 | Bb4:4 | F5:1 A5:1 D6:2 | C6:2 A5:2 | Bb5:2 G5:2 | E5:4 |", lead: 0.62f)),
            ("end", S("Fmaj7 Bbmaj7 Fmaj7 Fmaj7", "A5:4 | F5:4 | C5:4 | r:4 |", accomp: 0.36f, lead: 0.5f, roll: true)));
        road.Pad = 0.08f;
        list.Add(road);

        // Lanterns: E minor at night, high and far apart, with a pad under it.
        var lanterns = P("lanterns", "Lanterns", 58, 4, "sparse", new[] { MusicMood.Night, MusicMood.Deep },
            new[] { "intro", "A", "B", "A", "end" },
            ("intro", S("Em9 Cmaj7 Em9 Cmaj7", accomp: 0.36f)),
            ("A", S("Em9 Cmaj7 Am7 Bm7 Em9 Cmaj7 Am9 Bsus4+B7",
                "r:2 B5:2 | G5:4 | E5:2 G5:2 | F#5:4 | r:2 B5:1 D6:1 | E6:2 B5:2 | C6:2 B5:1 A5:1 | E5:2 D#5:2 |", lead: 0.55f)),
            ("B", S("Cmaj7 G/B Am7 Em9 Cmaj7 G/B Am7 Bsus4+B",
                "E5:2 G5:2 | D5:4 | C5:2 E5:2 | F#5:4 | G5:1 B5:1 E6:2 | D6:4 | C6:2 A5:2 | F#5:2 D#5:2 |", lead: 0.57f)),
            ("end", S("Em9 Cmaj7 Em9 Em9", "B5:4 | G5:4 | E5:4 | r:4 |", accomp: 0.34f, lead: 0.48f, roll: true)));
        lanterns.Pad = 0.08f;
        list.Add(lanterns);

        // Night Garden: B minor in three, soft.
        var garden = P("night_garden", "Night Garden", 66, 3, "waltz", new[] { MusicMood.Night },
            new[] { "intro", "A", "B", "A", "B", "end" },
            ("intro", S("Bm7 Gmaj7 Bm7 Gmaj7", accomp: 0.33f)),
            ("A", S("Bm7 Gmaj7 Dmaj7 Aadd9 Bm7 Gmaj7 Em7 F#sus4+F#",
                "F#5:2 D5:1 | B4:3 | A4:1 D5:1 F#5:1 | E5:3 | F#5:2 A5:1 | B5:2 F#5:1 | G5:1 E5:1 B4:1 | B4:1.5 A#4:1.5 |", accomp: 0.36f, lead: 0.55f)),
            ("B", S("Gmaj7 Dmaj7/F# Em7 Bm7 Gmaj7 Dmaj7/F# Em7 F#7",
                "D5:1 F#5:1 B5:1 | A5:3 | G5:2 E5:1 | F#5:3 | B5:1 A5:1 F#5:1 | E5:2 D5:1 | B4:2 D5:1 | C#5:3 |", accomp: 0.36f, lead: 0.57f)),
            ("end", S("Bm7 Gmaj7 Bm7 Bm7", "D5:3 | B4:3 | F#5:3 | r:3 |", accomp: 0.32f, lead: 0.48f, roll: true)));
        garden.Pad = 0.09f;
        list.Add(garden);

        // Undercroft: deep underground. A minor, very slow, low notes in a large, dark space.
        var under = P("undercroft", "Undercroft", 48, 4, "drone", new[] { MusicMood.Deep },
            new[] { "intro", "A", "B", "A", "end" },
            ("intro", S("Am9 Fmaj7 Am9 Fmaj7", accomp: 0.38f)),
            ("A", S("Am9 Fmaj7 Am9 Em7 Am9 Dm9 Fmaj7 Esus4+E",
                "r:2 E5:2 | C5:4 | r:1 B4:1 C5:2 | G4:4 | r:2 A4:1 E5:1 | F5:4 | E5:2 C5:2 | A4:2 G#4:2 |", lead: 0.5f)),
            ("B", S("Fmaj7 Dm9 Am9 Esus4+E", "r:4 | A5:4 | r:2 E5:2 | B4:4 |", accomp: 0.34f, lead: 0.46f)),
            ("end", S("Am9 Am9", "A4:4 | r:4 |", accomp: 0.34f, lead: 0.44f, roll: true)));
        under.Pad = 0.1f;
        under.Room = 0.92f;
        under.Wet = 1.3f;
        list.Add(under);

        return list;
    }
}
