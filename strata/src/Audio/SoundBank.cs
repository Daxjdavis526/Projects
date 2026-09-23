using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// Every sound in the game, synthesised at startup from oscillators, filtered
/// noise and envelopes: the knock of wood and the grind of stone, footsteps on
/// each surface, eight creature voices, rain, wind and cave air. Nothing is
/// recorded or loaded. (The music is separate: see <see cref="Music"/>.)
/// </summary>
public static class SoundBank
{
    public const int Rate = 22050;
    private static readonly Dictionary<string, AudioStreamWav> _bank = new();
    private static bool _built;

    public static AudioStreamWav Get(string name) => _bank.TryGetValue(name, out var s) ? s : null;

    public static void Build()
    {
        if (_built) return;
        _built = true;
        var sw = System.Diagnostics.Stopwatch.StartNew();

        foreach (SoundKind k in Enum.GetValues(typeof(SoundKind)))
        {
            string n = k.ToString().ToLowerInvariant();
            Add("dig_" + n, Material(k, 0.14f, 1f, 11));
            Add("break_" + n, Material(k, 0.32f, 1.2f, 23, crumble: true));
            Add("place_" + n, Material(k, 0.12f, 0.8f, 37));
            Add("step_" + n, Material(k, 0.09f, 0.55f, 51, step: true));
        }

        Add("click", Blip(1250, 0.035f, 0.3f));
        Add("pickup", Pop());
        Add("craft", Knocks(2, 520, 0.06f));
        Add("hurt_player", Oof());
        Add("hurt_fall", Thud(70, 0.25f, 0.9f));
        Add("hit_player", Thwack(0.9f, 140));
        Add("hit", Thwack(0.7f, 190));
        Add("hit_crit", Thwack(1f, 260, crit: true));
        Add("eat", Crunch());
        Add("burp", Burp());
        Add("splash", Splash());
        Add("swim", Swish());
        Add("tool_break", ToolBreak());
        Add("door_open", Creak(true));
        Add("door_close", Creak(false));
        Add("crate_open", Knocks(1, 300, 0.12f, creak: true));
        Add("crate_close", Knocks(1, 240, 0.1f));
        Add("death", Descend());
        Add("thunder", Thunder());
        Add("flap", Flap());
        Add("spit", Spit());
        Add("slam", Thud(45, 0.7f, 1f));
        Add("bow", Twang());
        Add("arrow_hit", Knocks(1, 620, 0.05f));
        Add("equip", Rustle());
        Add("switch", Knocks(2, 950, 0.025f));
        Add("plate", Knocks(1, 380, 0.06f));

        Voice("mossback", 85, 0.7f, 380, 760, grunt: true);
        Voice("brindle", 118, 0.95f, 520, 900, vibrato: true);
        Chirps("kit", 1500, 2100, 0.1f, 1);
        Chirps("pip", 2600, 3600, 0.07f, 2);
        Moan("hollow");
        Gurgle("spitter");
        Hiss("lurker");
        Roar("gravemaw");

        AddLoop("amb_wind", Wind(8f));
        AddLoop("amb_rain", RainLoop(6f));
        AddLoop("amb_cave", CaveLoop(12f));
        AddLoop("amb_underwater", UnderwaterLoop(6f));
        GD.Print($"sound bank: {_bank.Count} sounds in {sw.ElapsedMilliseconds} ms");
    }

    // --- plumbing -----------------------------------------------------------------------

    private static void Add(string name, float[] s) => _bank[name] = ToWav(s, false);
    private static void AddLoop(string name, float[] s) => _bank[name] = ToWav(s, true);

    private static AudioStreamWav ToWav(float[] s, bool loop)
    {
        var data = new byte[s.Length * 2];
        float peak = 0.0001f;
        foreach (var v in s) peak = Math.Max(peak, Math.Abs(v));
        float gain = peak > 0.95f ? 0.95f / peak : 1f;
        for (int i = 0; i < s.Length; i++)
        {
            short v = (short)Math.Clamp((int)(s[i] * gain * 32767f), short.MinValue, short.MaxValue);
            data[i * 2] = (byte)(v & 0xFF);
            data[i * 2 + 1] = (byte)((v >> 8) & 0xFF);
        }
        var w = new AudioStreamWav { Format = AudioStreamWav.FormatEnum.Format16Bits, MixRate = Rate, Stereo = false, Data = data };
        if (loop) { w.LoopMode = AudioStreamWav.LoopModeEnum.Forward; w.LoopBegin = 0; w.LoopEnd = s.Length; }
        return w;
    }

    private static float[] Buf(float seconds) => new float[Math.Max(1, (int)(seconds * Rate))];

    /// <summary>A tiny deterministic noise source.</summary>
    private sealed class Noise
    {
        private uint _s;
        public Noise(uint seed) { _s = seed * 2654435761u + 12345; }
        public float Next() { _s ^= _s << 13; _s ^= _s >> 17; _s ^= _s << 5; return (_s & 0xFFFFFF) / 8388608f - 1f; }
    }

    /// <summary>State-variable filter: one step returns (low, band, high).</summary>
    private sealed class Svf
    {
        private float _low, _band;
        public float F, Q;
        public Svf(float hz, float q) { Set(hz, q); }
        public void Set(float hz, float q) { F = 2f * MathF.Sin(MathF.PI * Math.Min(hz, Rate * 0.45f) / Rate); Q = 1f / Math.Max(0.5f, q); }
        public (float low, float band, float high) Step(float x)
        {
            _low += F * _band;
            float high = x - _low - Q * _band;
            _band += F * high;
            return (_low, _band, high);
        }
        public float Low(float x) => Step(x).low;
        public float Band(float x) => Step(x).band;
        public float High(float x) => Step(x).high;
    }

    private static float Env(float t, float attack, float decay) => t < attack ? t / attack : MathF.Exp(-(t - attack) / decay);

    private static void FadeEdges(float[] s, float ms = 4f)
    {
        int n = (int)(ms / 1000f * Rate);
        for (int i = 0; i < n && i < s.Length; i++)
        {
            float g = (float)i / n;
            s[i] *= g;
            s[s.Length - 1 - i] *= g;
        }
    }

    /// <summary>Makes a loop seamless by cross-fading its tail into its head.</summary>
    private static float[] Seamless(float[] s, float fadeSeconds)
    {
        int f = (int)(fadeSeconds * Rate);
        int n = s.Length - f;
        var o = new float[n];
        Array.Copy(s, o, n);
        for (int i = 0; i < f; i++)
        {
            float t = (float)i / f;
            o[i] = s[i] * t + s[n + i] * (1f - t);
        }
        return o;
    }

    // --- materials ------------------------------------------------------------------------

    private static float[] Material(SoundKind k, float len, float vol, uint seed, bool crumble = false, bool step = false)
    {
        var s = Buf(len);
        var n = new Noise(seed + (uint)k * 97);
        var rng = new Rng(seed * 31 + (ulong)k);
        (float hz, float q, float tone, float toneDecay, float noiseDecay, float grain) p = k switch
        {
            SoundKind.Stone => (1900f, 1.2f, 190f, 0.03f, 0.05f, 0.3f),
            SoundKind.Wood => (900f, 2.2f, 320f, 0.05f, 0.04f, 0f),
            SoundKind.Dirt => (480f, 0.9f, 110f, 0.04f, 0.06f, 0.2f),
            SoundKind.Grass => (3200f, 1.1f, 0f, 0f, 0.05f, 0.5f),
            SoundKind.Sand => (1300f, 0.8f, 0f, 0f, 0.07f, 0.7f),
            SoundKind.Gravel => (1600f, 1.3f, 90f, 0.02f, 0.06f, 0.9f),
            SoundKind.Glass => (4200f, 4f, 2600f, 0.05f, 0.02f, 0f),
            SoundKind.Snow => (900f, 0.9f, 0f, 0f, 0.08f, 0.8f),
            SoundKind.Metal => (2400f, 5f, 520f, 0.18f, 0.03f, 0f),
            SoundKind.Plant => (3600f, 1.4f, 0f, 0f, 0.04f, 0.4f),
            _ => (700f, 0.8f, 150f, 0.03f, 0.05f, 0.1f),
        };
        if (step) p.hz *= 0.8f;
        var f = new Svf(p.hz, p.q);
        float phase = 0, phase2 = 0;
        int bursts = crumble ? 4 : 1;
        for (int b = 0; b < bursts; b++)
        {
            float start = b == 0 ? 0 : rng.Range(0.03f, len * 0.6f);
            float bv = b == 0 ? 1f : rng.Range(0.3f, 0.7f);
            float pitch = rng.Range(0.9f, 1.1f);
            for (int i = (int)(start * Rate); i < s.Length; i++)
            {
                float t = i / (float)Rate - start;
                float e = Env(t, 0.002f, p.noiseDecay * (crumble ? 1.4f : 1f));
                float x = n.Next();
                // Grainy surfaces crackle: gate the noise with random pulses.
                if (p.grain > 0 && n.Next() > 1f - p.grain * 0.5f) x *= 2.5f;
                float v = f.Band(x) * e;
                if (p.tone > 0)
                {
                    phase += p.tone * pitch * MathF.Tau / Rate;
                    phase2 += p.tone * pitch * 2.63f * MathF.Tau / Rate;
                    float te = Env(t, 0.001f, p.toneDecay);
                    v += (MathF.Sin(phase) * 0.8f + MathF.Sin(phase2) * (k == SoundKind.Metal || k == SoundKind.Glass ? 0.6f : 0.25f)) * te * 0.6f;
                }
                s[i] += v * bv * vol;
            }
        }
        FadeEdges(s, 2f);
        return s;
    }

    // --- one-shots --------------------------------------------------------------------------

    private static float[] Blip(float hz, float len, float vol)
    {
        var s = Buf(len);
        for (int i = 0; i < s.Length; i++) { float t = i / (float)Rate; s[i] = MathF.Sin(t * hz * MathF.Tau) * Env(t, 0.002f, len / 3f) * vol; }
        return s;
    }

    private static float[] Pop()
    {
        var s = Buf(0.12f);
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            float hz = 700 + t * 6000;
            s[i] = MathF.Sin(t * hz * MathF.Tau) * Env(t, 0.003f, 0.03f) * 0.5f;
        }
        return s;
    }

    private static float[] Knocks(int count, float hz, float gap, bool creak = false)
    {
        var s = Buf(gap * count + 0.25f);
        var n = new Noise(5);
        var f = new Svf(hz * 2.5f, 2f);
        for (int k = 0; k < count; k++)
        {
            float start = k * gap;
            for (int i = (int)(start * Rate); i < s.Length; i++)
            {
                float t = i / (float)Rate - start;
                float e = Env(t, 0.001f, 0.035f);
                s[i] += (MathF.Sin(t * hz * MathF.Tau) * 0.7f + f.Band(n.Next()) * 0.8f) * e;
            }
        }
        if (creak)
        {
            for (int i = 0; i < s.Length; i++)
            {
                float t = i / (float)Rate;
                float hz2 = 180 + 60 * MathF.Sin(t * 30);
                s[i] += MathF.Sign(MathF.Sin(t * hz2 * MathF.Tau)) * 0.06f * Env(t, 0.02f, 0.08f);
            }
        }
        return s;
    }

    private static float[] Oof()
    {
        var s = Buf(0.28f);
        var f1 = new Svf(650, 5f); var f2 = new Svf(1100, 6f);
        float ph = 0;
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            float hz = 190 - t * 180;
            ph += hz * MathF.Tau / Rate;
            float saw = (ph / MathF.Tau % 1f) * 2f - 1f;
            s[i] = (f1.Band(saw) + f2.Band(saw) * 0.6f) * Env(t, 0.01f, 0.08f) * 1.4f;
        }
        var thud = Thud(90, 0.12f, 0.6f);
        for (int i = 0; i < thud.Length && i < s.Length; i++) s[i] += thud[i];
        return s;
    }

    private static float[] Thud(float hz, float len, float vol)
    {
        var s = Buf(len);
        var n = new Noise(9);
        var f = new Svf(300, 0.8f);
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            float e = Env(t, 0.002f, len / 4f);
            s[i] = (MathF.Sin(t * (hz - t * hz * 0.6f) * MathF.Tau) + f.Low(n.Next()) * 1.5f) * e * vol;
        }
        return s;
    }

    private static float[] Thwack(float vol, float hz, bool crit = false)
    {
        var s = Buf(0.18f);
        var n = new Noise(13);
        var f = new Svf(1500, 1f);
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            float e = Env(t, 0.001f, 0.03f);
            s[i] = (f.Band(n.Next()) * 1.2f + MathF.Sin(t * hz * MathF.Tau) * 0.8f) * e * vol;
            if (crit) s[i] += MathF.Sin(t * 1800 * MathF.Tau) * Env(t, 0.001f, 0.06f) * 0.3f;
        }
        return s;
    }

    private static float[] Crunch()
    {
        var s = Buf(0.22f);
        var n = new Noise(21);
        var f = new Svf(2400, 1.5f);
        var rng = new Rng(4);
        for (int k = 0; k < 5; k++)
        {
            float start = rng.Range(0, 0.15f);
            for (int i = (int)(start * Rate); i < s.Length; i++)
            {
                float t = i / (float)Rate - start;
                s[i] += f.Band(n.Next()) * Env(t, 0.001f, 0.012f) * 0.8f;
            }
        }
        return s;
    }

    private static float[] Burp()
    {
        var s = Buf(0.3f);
        var f = new Svf(500, 4f);
        float ph = 0;
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            ph += (95 + 20 * MathF.Sin(t * 40)) * MathF.Tau / Rate;
            float saw = (ph / MathF.Tau % 1f) * 2f - 1f;
            s[i] = f.Band(saw) * Env(t, 0.03f, 0.08f) * 1.5f;
        }
        return s;
    }

    private static float[] Splash()
    {
        var s = Buf(0.7f);
        var n = new Noise(31);
        var f = new Svf(1800, 0.7f);
        var rng = new Rng(8);
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            s[i] = f.Low(n.Next()) * Env(t, 0.01f, 0.18f) * 0.9f;
        }
        for (int k = 0; k < 8; k++)
        {
            float start = rng.Range(0.05f, 0.5f), hz = rng.Range(500, 1400);
            for (int i = (int)(start * Rate); i < s.Length && i < (start + 0.08f) * Rate; i++)
            {
                float t = i / (float)Rate - start;
                s[i] += MathF.Sin(t * (hz + t * 4000) * MathF.Tau) * Env(t, 0.002f, 0.02f) * 0.25f;
            }
        }
        return s;
    }

    private static float[] Swish()
    {
        var s = Buf(0.35f);
        var n = new Noise(41);
        var f = new Svf(900, 0.8f);
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            f.Set(600 + 1200 * MathF.Sin(t / 0.35f * MathF.PI), 0.8f);
            s[i] = f.Band(n.Next()) * MathF.Sin(t / 0.35f * MathF.PI) * 0.5f;
        }
        return s;
    }

    private static float[] ToolBreak()
    {
        var s = Material(SoundKind.Metal, 0.4f, 1f, 77, crumble: true);
        var snap = Thwack(1f, 900);
        for (int i = 0; i < snap.Length; i++) s[i] += snap[i];
        return s;
    }

    private static float[] Creak(bool open)
    {
        var s = Buf(0.45f);
        float ph = 0;
        var f = new Svf(1200, 3f);
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            float hz = open ? 150 + t * 260 : 380 - t * 300;
            ph += (hz + 25 * MathF.Sin(t * 180)) * MathF.Tau / Rate;
            float saw = (ph / MathF.Tau % 1f) * 2f - 1f;
            s[i] = f.Band(saw) * Env(t, 0.02f, 0.18f) * 0.5f;
        }
        var k = Knocks(1, open ? 260 : 200, 0.1f);
        int off = open ? 0 : (int)(0.3f * Rate);
        for (int i = 0; i < k.Length && i + off < s.Length; i++) s[i + off] += k[i] * 0.8f;
        return s;
    }

    private static float[] Descend()
    {
        var s = Buf(1.4f);
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            float hz = 330 * MathF.Pow(0.5f, t);
            s[i] = (MathF.Sin(t * hz * MathF.Tau) + 0.5f * MathF.Sin(t * hz * 1.5f * MathF.Tau)) * Env(t, 0.02f, 0.5f) * 0.4f;
        }
        return s;
    }

    private static float[] Thunder()
    {
        var s = Buf(4.5f);
        var n = new Noise(51);
        var f = new Svf(160, 0.7f);
        var f2 = new Svf(900, 0.7f);
        var rng = new Rng(77);
        float amp = 0, target = 1f, timer = 0;
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            timer -= 1f / Rate;
            if (timer <= 0) { timer = rng.Range(0.05f, 0.3f); target = rng.Range(0.3f, 1f); }
            amp += (target - amp) * 0.0008f;
            float crack = t < 0.25f ? f2.Band(n.Next()) * (1f - t / 0.25f) * 1.2f : 0f;
            s[i] = (f.Low(n.Next()) * 3f * amp + crack) * Env(t, 0.03f, 1.6f);
        }
        return s;
    }

    private static float[] Flap()
    {
        var s = Buf(0.5f);
        var n = new Noise(61);
        var f = new Svf(700, 1f);
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            float beat = MathF.Max(0, MathF.Sin(t * 12 * MathF.Tau));
            s[i] = f.Band(n.Next()) * beat * beat * Env(t, 0.01f, 0.25f);
        }
        return s;
    }

    /// <summary>A plucked bowstring (a Karplus-Strong string) and the hiss of the arrow leaving.</summary>
    private static float[] Twang()
    {
        var s = Buf(0.45f);
        var n = new Noise(83);
        int period = Rate / 118;
        var line = new float[period];
        for (int i = 0; i < period; i++) line[i] = n.Next();
        int p = 0;
        var air = new Svf(900, 0.9f);
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            int q = (p + 1) % period;
            float v = line[p];
            line[p] = (line[p] + line[q]) * 0.5f * 0.994f;
            p = q;
            air.Set(1600 - t * 2400, 0.9f);
            s[i] = v * Env(t, 0.001f, 0.12f) * 0.8f + air.Band(n.Next()) * Env(t, 0.01f, 0.06f) * 0.5f;
        }
        return s;
    }

    /// <summary>Cloth and buckles: armour going on.</summary>
    private static float[] Rustle()
    {
        var s = Buf(0.3f);
        var n = new Noise(97);
        var f = new Svf(2200, 1.4f);
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            f.Set(1800 + 1400 * MathF.Sin(t * 30f), 1.4f);
            s[i] = f.Band(n.Next()) * Env(t, 0.02f, 0.08f) * 0.9f + MathF.Sin(t * 1850f * MathF.Tau) * Env(t, 0.004f, 0.05f) * 0.12f;
        }
        return s;
    }

    private static float[] Spit()
    {
        var s = Buf(0.25f);
        var n = new Noise(71);
        var f = new Svf(1800, 1.2f);
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            f.Set(2600 - t * 7000, 1.2f);
            s[i] = f.Band(n.Next()) * Env(t, 0.005f, 0.05f) * 1.3f + MathF.Sin(t * (300 - t * 900) * MathF.Tau) * Env(t, 0.002f, 0.04f) * 0.4f;
        }
        return s;
    }

    // --- voices -----------------------------------------------------------------------------

    private static float[] VoiceCore(float baseHz, float len, float f1, float f2, bool vibrato, bool grunt, float drop, uint seed)
    {
        var s = Buf(len);
        var a = new Svf(f1, 6f); var b = new Svf(f2, 7f);
        var n = new Noise(seed);
        float ph = 0;
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            float hz = baseHz * (1f - drop * t / len) * (vibrato ? 1f + 0.03f * MathF.Sin(t * 6 * MathF.Tau) : 1f);
            ph += hz * MathF.Tau / Rate;
            float saw = (ph / MathF.Tau % 1f) * 2f - 1f;
            float x = saw + (grunt ? n.Next() * 0.4f : 0f);
            float env = MathF.Sin(MathF.Min(1f, t / len) * MathF.PI);
            s[i] = (a.Band(x) + b.Band(x) * 0.6f) * env * 1.2f;
        }
        return s;
    }

    private static void Voice(string name, float hz, float len, float f1, float f2, bool grunt = false, bool vibrato = false)
    {
        Add(name + "_idle", VoiceCore(hz, len, f1, f2, vibrato, grunt, 0.15f, 3));
        Add(name + "_hurt", VoiceCore(hz * 1.5f, 0.3f, f1 * 1.2f, f2 * 1.2f, false, true, 0.3f, 5));
        Add(name + "_death", VoiceCore(hz * 1.2f, 0.9f, f1, f2, true, grunt, 0.6f, 7));
    }

    private static void Chirps(string name, float lo, float hi, float len, int count)
    {
        float[] Make(float pitch, int n, float l)
        {
            var s = Buf(l * n + 0.05f * n);
            for (int k = 0; k < n; k++)
            {
                float start = k * (l + 0.05f);
                for (int i = (int)(start * Rate); i < (start + l) * Rate && i < s.Length; i++)
                {
                    float t = i / (float)Rate - start;
                    float hz = (lo + (hi - lo) * (t / l)) * pitch;
                    s[i] += MathF.Sin(t * hz * MathF.Tau + MathF.Sin(t * hz * 0.5f * MathF.Tau) * 0.8f) * MathF.Sin(t / l * MathF.PI) * 0.5f;
                }
            }
            return s;
        }
        Add(name + "_idle", Make(1f, count, len));
        Add(name + "_hurt", Make(1.3f, 1, len * 0.8f));
        Add(name + "_death", Make(0.8f, 3, len));
    }

    private static void Moan(string name)
    {
        float[] Make(float len, float hz, float breath, uint seed)
        {
            var s = Buf(len);
            var n = new Noise(seed);
            var f = new Svf(420, 4f);
            float ph = 0;
            for (int i = 0; i < s.Length; i++)
            {
                float t = i / (float)Rate;
                ph += hz * (1f + 0.05f * MathF.Sin(t * 3)) * MathF.Tau / Rate;
                float trem = 0.7f + 0.3f * MathF.Sin(t * 7 * MathF.Tau);
                s[i] = (MathF.Sin(ph) * 0.5f + f.Band(n.Next()) * breath) * trem * MathF.Sin(MathF.Min(1f, t / len) * MathF.PI);
            }
            return s;
        }
        Add(name + "_idle", Make(1.3f, 72, 0.9f, 3));
        Add(name + "_hurt", Make(0.35f, 110, 1.4f, 4));
        Add(name + "_death", Make(1.2f, 55, 1.8f, 5));
    }

    private static void Gurgle(string name)
    {
        float[] Make(float len, float hz, uint seed)
        {
            var s = Buf(len);
            var n = new Noise(seed);
            var f = new Svf(600, 3f);
            for (int i = 0; i < s.Length; i++)
            {
                float t = i / (float)Rate;
                float bub = MathF.Sin(t * hz * MathF.Tau + MathF.Sin(t * 23 * MathF.Tau) * 4f);
                s[i] = (bub * 0.4f + f.Band(n.Next()) * 0.5f) * MathF.Sin(MathF.Min(1f, t / len) * MathF.PI);
            }
            return s;
        }
        Add(name + "_idle", Make(0.8f, 140, 3));
        Add(name + "_hurt", Make(0.3f, 220, 4));
        Add(name + "_death", Make(1f, 90, 5));
    }

    private static void Hiss(string name)
    {
        float[] Make(float len, float hz, uint seed)
        {
            var s = Buf(len);
            var n = new Noise(seed);
            var f = new Svf(2400, 2f);
            for (int i = 0; i < s.Length; i++)
            {
                float t = i / (float)Rate;
                float growl = MathF.Sin(t * hz * MathF.Tau) * (0.6f + 0.4f * MathF.Sin(t * 31 * MathF.Tau));
                s[i] = (f.Band(n.Next()) * 0.8f + growl * 0.5f) * MathF.Sin(MathF.Min(1f, t / len) * MathF.PI);
            }
            return s;
        }
        Add(name + "_idle", Make(0.8f, 62, 3));
        Add(name + "_hurt", Make(0.3f, 90, 4));
        Add(name + "_death", Make(1f, 48, 5));
    }

    private static void Roar(string name)
    {
        float[] Make(float len, float hz, uint seed)
        {
            var s = Buf(len);
            var n = new Noise(seed);
            var a = new Svf(300, 3f); var b = new Svf(700, 4f);
            float ph = 0;
            for (int i = 0; i < s.Length; i++)
            {
                float t = i / (float)Rate;
                ph += hz * (1f - 0.3f * t / len) * MathF.Tau / Rate;
                float saw = (ph / MathF.Tau % 1f) * 2f - 1f + n.Next() * 0.5f;
                float x = MathF.Tanh((a.Band(saw) + b.Band(saw) * 0.7f) * 3f);
                s[i] = x * MathF.Sin(MathF.Min(1f, t / len) * MathF.PI) * 0.8f;
            }
            return s;
        }
        Add(name + "_idle", Make(1.6f, 48, 3));
        Add(name + "_hurt", Make(0.5f, 70, 4));
        Add(name + "_death", Make(2f, 36, 5));
    }

    // --- ambience -----------------------------------------------------------------------------

    private static float[] Wind(float len)
    {
        var s = Buf(len + 1f);
        var n = new Noise(81);
        var f = new Svf(400, 0.8f);
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            float gust = 0.55f + 0.3f * MathF.Sin(t * 0.7f) + 0.15f * MathF.Sin(t * 1.9f + 1f);
            f.Set(260 + 380 * gust, 0.9f);
            s[i] = f.Band(n.Next()) * gust * 0.8f;
        }
        return Seamless(s, 1f);
    }

    private static float[] RainLoop(float len)
    {
        var s = Buf(len + 1f);
        var n = new Noise(91);
        var hp = new Svf(3000, 0.7f);
        var lp = new Svf(900, 0.7f);
        var rng = new Rng(9);
        for (int i = 0; i < s.Length; i++)
        {
            float x = n.Next();
            s[i] = hp.High(x) * 0.25f + lp.Low(x) * 0.35f;
        }
        for (int k = 0; k < (int)(len * 40); k++)
        {
            float start = rng.Range(0, len);
            float hz = rng.Range(1500, 4000);
            for (int i = (int)(start * Rate); i < s.Length && i < (start + 0.02f) * Rate; i++)
            {
                float t = i / (float)Rate - start;
                s[i] += MathF.Sin(t * hz * MathF.Tau) * Env(t, 0.0005f, 0.004f) * rng.Range(0.1f, 0.4f);
            }
        }
        return Seamless(s, 1f);
    }

    private static float[] CaveLoop(float len)
    {
        var s = Buf(len + 1f);
        var n = new Noise(101);
        var f = new Svf(120, 0.8f);
        var rng = new Rng(11);
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            s[i] = f.Low(n.Next()) * 0.5f + MathF.Sin(t * 55 * MathF.Tau) * 0.05f * (0.7f + 0.3f * MathF.Sin(t * 0.3f));
        }
        // Drips, each with a short echo.
        for (int k = 0; k < 5; k++)
        {
            float start = rng.Range(0.3f, len - 0.5f);
            float hz = rng.Range(900, 1700);
            for (int e = 0; e < 3; e++)
            {
                float st = start + e * 0.18f, g = MathF.Pow(0.35f, e);
                for (int i = (int)(st * Rate); i < s.Length && i < (st + 0.12f) * Rate; i++)
                {
                    float t = i / (float)Rate - st;
                    s[i] += MathF.Sin(t * (hz + t * 2500) * MathF.Tau) * Env(t, 0.001f, 0.02f) * 0.5f * g;
                }
            }
        }
        return Seamless(s, 1f);
    }

    private static float[] UnderwaterLoop(float len)
    {
        var s = Buf(len + 1f);
        var n = new Noise(111);
        var f = new Svf(220, 0.8f);
        for (int i = 0; i < s.Length; i++)
        {
            float t = i / (float)Rate;
            s[i] = f.Low(n.Next()) * (0.7f + 0.3f * MathF.Sin(t * 0.9f)) * 0.9f;
        }
        return Seamless(s, 1f);
    }
}
