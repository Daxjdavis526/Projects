using System;
using System.Collections.Generic;

namespace Strata;

/// <summary>
/// A soft felt piano, synthesised. Each note is a dozen partials of a stiff
/// string (so they sit a little sharp of true harmonics), played on two
/// strings a cent or so apart so the tone beats gently as it rings. A soft
/// blow barely wakes the upper partials; a hammer knock of filtered noise
/// starts the note; the sound falls quickly at first and then rings on,
/// shorter for high notes and for high partials. A piece renders each pitch
/// and loudness once and reuses it. Everything here is plain arithmetic on
/// arrays, safe to run off the main thread.
/// </summary>
public static class Piano
{
    public const int Rate = 32000;
    /// <summary>The loudness layers a note is rendered at; anything between is scaled from the nearest.</summary>
    public static readonly float[] Levels = { 0.3f, 0.5f, 0.72f };

    public static int LevelFor(float velocity)
    {
        int best = 0;
        for (int i = 1; i < Levels.Length; i++)
            if (MathF.Abs(Levels[i] - velocity) < MathF.Abs(Levels[best] - velocity)) best = i;
        return best;
    }

    /// <summary>How long a note rings undamped: long in the bass, short at the top.</summary>
    public static float RingSeconds(int midi) => Math.Clamp(10f * MathF.Pow(0.5f, (midi - 40) / 20f), 2.2f, 10f);

    public static double Hz(int midi) => 440.0 * Math.Pow(2.0, (midi - 69) / 12.0);

    /// <summary>
    /// A note's natural ring, undamped, as mono samples at <see cref="Rate"/>,
    /// taken from the cache if it has been rendered before. The cache belongs
    /// to one render: a full set of notes is tens of megabytes, not worth keeping.
    /// </summary>
    public static float[] Note(int midi, int level, Dictionary<int, float[]> cache)
    {
        int key = midi * 16 + level;
        if (cache.TryGetValue(key, out var hit)) return hit;
        return cache[key] = Render(midi, Levels[level]);
    }

    private static float[] Render(int midi, float vel)
    {
        double f0 = Hz(midi);
        float ring = RingSeconds(midi);
        int n = (int)(ring * Rate);
        var s = new float[n];
        double stiffness = 0.00012 * Math.Pow(2.0, (midi - 60) / 24.0);
        float felt = 0.3f - 0.16f * vel;                                       // how fast the spectrum falls away: softer is darker
        float prompt = Math.Clamp(0.9f * MathF.Pow(0.5f, (midi - 36) / 16f), 0.12f, 0.9f);
        float after = ring * 0.25f;
        const int MaxPartials = 24;
        double top = Math.Min(Rate * 0.44, 9000.0);

        var amp = new float[MaxPartials + 1];
        float total = 0f;
        for (int p = 1; p <= MaxPartials; p++)
        {
            double fp = f0 * p * Math.Sqrt(1 + stiffness * p * p);
            if (fp > top) break;
            // The hammer strikes about a seventh of the way along the string, so every seventh partial is weak.
            amp[p] = MathF.Pow(p, -1.05f) * MathF.Exp(-(p - 1) * felt) * (0.3f + 0.7f * MathF.Abs(MathF.Sin(MathF.PI * p / 7.5f)));
            total += amp[p];
        }
        // A low string puts little of itself into its fundamental: a bass note is mostly the partials above.
        float fundamental = Math.Clamp(0.45f + (midi - 36) / 40f, 0.45f, 1f);
        total -= amp[1] * (1f - fundamental);
        amp[1] *= fundamental;

        var rng = new Rng((ulong)(midi * 7919 + (int)(vel * 1000) + 1));
        int strings = midi < 34 ? 1 : 2;
        for (int p = 1; p <= MaxPartials; p++)
        {
            if (amp[p] <= 0f) continue;
            double fp = f0 * p * Math.Sqrt(1 + stiffness * p * p);
            float quicker = 1f + 0.35f * (p - 1);
            double d1 = Math.Exp(-1.0 / (prompt / quicker * Rate));
            double d2 = Math.Exp(-1.0 / (after / quicker * Rate));
            for (int st = 0; st < strings; st++)
            {
                double cents = strings == 1 ? 0 : (st == 0 ? -1 : 1) * (0.5 + 0.7 * rng.Float());
                double w = 2 * Math.PI * fp * Math.Pow(2, cents / 1200) / Rate;
                double cw = Math.Cos(w), sw = Math.Sin(w);
                double ph = rng.Float() * 2 * Math.PI;
                double c = Math.Cos(ph), si = Math.Sin(ph);
                double e1 = 0.72 * amp[p] / total / strings, e2 = 0.28 * amp[p] / total / strings;
                for (int i = 0; i < n; i++)
                {
                    s[i] += (float)((e1 + e2) * si);
                    double nc = c * cw - si * sw;
                    si = si * cw + c * sw;
                    c = nc;
                    e1 *= d1;
                    e2 *= d2;
                    if ((i & 4095) == 4095)
                    {
                        if (e1 + e2 < 2e-6) break;
                        double m = 1.0 / Math.Sqrt(c * c + si * si);    // keep the phasor on the unit circle
                        c *= m;
                        si *= m;
                    }
                }
            }
        }

        // The hammer: a short knock of filtered noise.
        float lp = 0f, cut = 0.12f + 0.25f * vel;
        int knock = Math.Min(n, (int)(0.012f * Rate));
        for (int i = 0; i < knock; i++)
        {
            lp += (rng.Float() * 2f - 1f - lp) * cut;
            s[i] += lp * 0.06f * vel * (1f - i / (float)knock);
        }
        // A few milliseconds of rise, quicker the harder the blow; a fade at the very end so nothing clicks.
        int rise = Math.Max(1, (int)((0.006f - 0.004f * vel) * Rate));
        for (int i = 0; i < rise && i < n; i++) s[i] *= i / (float)rise;
        int fade = Math.Min(n, (int)(0.15f * Rate));
        for (int i = 0; i < fade; i++) s[n - 1 - i] *= i / (float)fade;
        // Loudness grows faster than the blow.
        float gain = 0.5f * MathF.Pow(vel, 1.4f);
        for (int i = 0; i < n; i++) s[i] *= gain;
        return s;
    }

    /// <summary>
    /// A quiet pad under a chord: each note as two gently detuned voices of a
    /// few soft harmonics, swelling in and dying away past the chord's end.
    /// </summary>
    public static void Pad(float[] left, float[] right, double start, double end, IReadOnlyList<int> notes, float level)
    {
        const double Attack = 1.6, Release = 2.4;
        int i0 = Math.Max(0, (int)(start * Rate));
        int i1 = Math.Min(left.Length, (int)((end + Release * 4) * Rate));
        int iEnd = (int)(end * Rate);
        foreach (int midi in notes)
        {
            double f0 = Hz(midi);
            for (int voice = 0; voice < 2; voice++)
            {
                double detune = voice == 0 ? -6 : 6;
                float gl = voice == 0 ? 0.62f : 0.38f, gr = 1f - gl;
                for (int h = 1; h <= 3; h++)
                {
                    double w = 2 * Math.PI * f0 * h * Math.Pow(2, detune / 1200) / Rate;
                    double cw = Math.Cos(w), sw = Math.Sin(w), c = 1, si = 0;
                    float a = level * 0.25f / (h * h) / notes.Count;     // it never stops sounding, so it sits well down
                    double rel = 1, relStep = Math.Exp(-1.0 / (Release / 2.5 * Rate));
                    for (int i = i0; i < i1; i++)
                    {
                        double t = (i - i0) / (double)Rate;
                        double env = Math.Min(1.0, t / Attack);
                        if (i > iEnd) { rel *= relStep; env *= rel; if (rel < 1e-4) break; }
                        float v = (float)(a * env * si);
                        left[i] += v * gl;
                        right[i] += v * gr;
                        double nc = c * cw - si * sw;
                        si = si * cw + c * sw;
                        c = nc;
                    }
                }
            }
        }
    }
}
