using System;

namespace Strata;

/// <summary>
/// A stereo hall: eight damped comb filters in parallel and four all-pass
/// filters in series per side (the classic Schroeder–Moorer arrangement), the
/// right side's delays a little longer than the left's so the tail is wide.
/// </summary>
public static class Reverb
{
    private static readonly int[] CombTunings = { 1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617 };   // at 44.1 kHz
    private static readonly int[] AllPassTunings = { 556, 441, 341, 225 };
    private const int StereoSpread = 23;

    private sealed class Comb
    {
        private readonly float[] _buf;
        private int _i;
        private float _store;
        public Comb(int len) { _buf = new float[Math.Max(1, len)]; }

        public float Process(float x, float feedback, float damp)
        {
            float y = _buf[_i];
            _store = y * (1f - damp) + _store * damp;
            if (MathF.Abs(_store) < 1e-20f) _store = 0f;          // no denormals in the tail
            _buf[_i] = x + _store * feedback;
            if (++_i >= _buf.Length) _i = 0;
            return y;
        }
    }

    private sealed class AllPass
    {
        private readonly float[] _buf;
        private int _i;
        public AllPass(int len) { _buf = new float[Math.Max(1, len)]; }

        public float Process(float x)
        {
            float b = _buf[_i];
            float y = b - x;
            _buf[_i] = x + b * 0.5f;
            if (++_i >= _buf.Length) _i = 0;
            return y;
        }
    }

    /// <summary>
    /// Adds the hall to a stereo signal in place. room 0..1 sets the tail's
    /// length, damp 0..1 how quickly it darkens, wet and dry the mix. What goes
    /// into the hall loses its lows below <paramref name="lowCut"/> Hz, so the
    /// tail stays clear instead of booming.
    /// </summary>
    public static void Apply(float[] left, float[] right, int rate, float room, float damp, float wet, float dry, float preDelay = 0.015f, float lowCut = 220f)
    {
        float scale = rate / 44100f;
        var cl = new Comb[8];
        var cr = new Comb[8];
        for (int k = 0; k < 8; k++)
        {
            cl[k] = new Comb((int)(CombTunings[k] * scale));
            cr[k] = new Comb((int)((CombTunings[k] + StereoSpread) * scale));
        }
        var al = new AllPass[4];
        var ar = new AllPass[4];
        for (int k = 0; k < 4; k++)
        {
            al[k] = new AllPass((int)(AllPassTunings[k] * scale));
            ar[k] = new AllPass((int)((AllPassTunings[k] + StereoSpread) * scale));
        }
        float feedback = room * 0.28f + 0.7f;
        float d = damp * 0.4f;
        int pd = Math.Max(1, (int)(preDelay * rate));
        var delay = new float[pd];
        int di = 0;
        float lowK = 1f - MathF.Exp(-2f * MathF.PI * lowCut / rate), low = 0f;
        for (int i = 0; i < left.Length; i++)
        {
            float inL = left[i], inR = right[i];
            float send = delay[di];
            low += (send - low) * lowK;
            float input = (send - low) * 0.015f;
            delay[di] = inL + inR;
            if (++di >= pd) di = 0;
            float outL = 0f, outR = 0f;
            for (int k = 0; k < 8; k++)
            {
                outL += cl[k].Process(input, feedback, d);
                outR += cr[k].Process(input, feedback, d);
            }
            for (int k = 0; k < 4; k++)
            {
                outL = al[k].Process(outL);
                outR = ar[k].Process(outR);
            }
            left[i] = outL * wet + inL * dry;
            right[i] = outR * wet + inR * dry;
        }
    }
}
