using System;
using System.Runtime.CompilerServices;

namespace Strata;

/// <summary>
/// Seeded 2D/3D simplex noise (the skewed-simplex construction), with fBm and
/// ridged helpers. Pure managed code: worldgen runs on worker threads and
/// samples this millions of times per second, and a per-call hop into the
/// engine would cost more than the maths does. Output is roughly [-1, 1].
/// </summary>
public sealed class Simplex
{
    private readonly byte[] _perm = new byte[512];
    private readonly byte[] _perm12 = new byte[512];

    private static readonly double[] G3 =
    {
        1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
        1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
        0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1,
    };

    private const double F2 = 0.36602540378443864676;   // (sqrt(3) - 1) / 2
    private const double Gs2 = 0.21132486540518711775;  // (3 - sqrt(3)) / 6
    private const double F3 = 1.0 / 3.0;
    private const double Gs3 = 1.0 / 6.0;

    public Simplex(long seed)
    {
        var p = new byte[256];
        for (int i = 0; i < 256; i++) p[i] = (byte)i;
        var rng = new Rng(Hash.Mix((ulong)seed ^ 0xA5A5A5A5DEADBEEFUL));
        for (int i = 255; i > 0; i--)
        {
            int j = (int)(rng.Next() % (ulong)(i + 1));
            (p[i], p[j]) = (p[j], p[i]);
        }
        for (int i = 0; i < 512; i++)
        {
            _perm[i] = p[i & 255];
            _perm12[i] = (byte)(_perm[i] % 12);
        }
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static int FastFloor(double v) { int i = (int)v; return v < i ? i - 1 : i; }

    public float Noise2(double xin, double yin)
    {
        double s = (xin + yin) * F2;
        int i = FastFloor(xin + s), j = FastFloor(yin + s);
        double t = (i + j) * Gs2;
        double x0 = xin - (i - t), y0 = yin - (j - t);
        int i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
        double x1 = x0 - i1 + Gs2, y1 = y0 - j1 + Gs2;
        double x2 = x0 - 1.0 + 2.0 * Gs2, y2 = y0 - 1.0 + 2.0 * Gs2;
        int ii = i & 255, jj = j & 255;
        int g0 = _perm12[ii + _perm[jj]] * 3;
        int g1 = _perm12[ii + i1 + _perm[jj + j1]] * 3;
        int g2 = _perm12[ii + 1 + _perm[jj + 1]] * 3;

        double n = 0;
        double t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 > 0) { t0 *= t0; n += t0 * t0 * (G3[g0] * x0 + G3[g0 + 1] * y0); }
        double t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 > 0) { t1 *= t1; n += t1 * t1 * (G3[g1] * x1 + G3[g1 + 1] * y1); }
        double t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 > 0) { t2 *= t2; n += t2 * t2 * (G3[g2] * x2 + G3[g2 + 1] * y2); }
        return (float)(70.0 * n);
    }

    public float Noise3(double xin, double yin, double zin)
    {
        double s = (xin + yin + zin) * F3;
        int i = FastFloor(xin + s), j = FastFloor(yin + s), k = FastFloor(zin + s);
        double t = (i + j + k) * Gs3;
        double x0 = xin - (i - t), y0 = yin - (j - t), z0 = zin - (k - t);
        int i1, j1, k1, i2, j2, k2;
        if (x0 >= y0)
        {
            if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
            else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
            else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
        }
        else
        {
            if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
            else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
            else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        }
        double x1 = x0 - i1 + Gs3, y1 = y0 - j1 + Gs3, z1 = z0 - k1 + Gs3;
        double x2 = x0 - i2 + 2.0 * Gs3, y2 = y0 - j2 + 2.0 * Gs3, z2 = z0 - k2 + 2.0 * Gs3;
        double x3 = x0 - 1.0 + 3.0 * Gs3, y3 = y0 - 1.0 + 3.0 * Gs3, z3 = z0 - 1.0 + 3.0 * Gs3;
        int ii = i & 255, jj = j & 255, kk = k & 255;
        int g0 = _perm12[ii + _perm[jj + _perm[kk]]] * 3;
        int g1 = _perm12[ii + i1 + _perm[jj + j1 + _perm[kk + k1]]] * 3;
        int g2 = _perm12[ii + i2 + _perm[jj + j2 + _perm[kk + k2]]] * 3;
        int g3 = _perm12[ii + 1 + _perm[jj + 1 + _perm[kk + 1]]] * 3;

        double n = 0;
        double t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 > 0) { t0 *= t0; n += t0 * t0 * (G3[g0] * x0 + G3[g0 + 1] * y0 + G3[g0 + 2] * z0); }
        double t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 > 0) { t1 *= t1; n += t1 * t1 * (G3[g1] * x1 + G3[g1 + 1] * y1 + G3[g1 + 2] * z1); }
        double t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 > 0) { t2 *= t2; n += t2 * t2 * (G3[g2] * x2 + G3[g2 + 1] * y2 + G3[g2 + 2] * z2); }
        double t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 > 0) { t3 *= t3; n += t3 * t3 * (G3[g3] * x3 + G3[g3 + 1] * y3 + G3[g3 + 2] * z3); }
        return (float)(32.0 * n);
    }

    /// <summary>Fractal sum, normalised back to about [-1, 1].</summary>
    public float Fbm2(double x, double y, int octaves, double lacunarity = 2.0, float gain = 0.5f)
    {
        float sum = 0, amp = 1, norm = 0;
        double f = 1;
        for (int o = 0; o < octaves; o++)
        {
            sum += amp * Noise2(x * f + o * 37.17, y * f - o * 19.73);
            norm += amp; amp *= gain; f *= lacunarity;
        }
        return sum / norm;
    }

    public float Fbm3(double x, double y, double z, int octaves, double lacunarity = 2.0, float gain = 0.5f)
    {
        float sum = 0, amp = 1, norm = 0;
        double f = 1;
        for (int o = 0; o < octaves; o++)
        {
            sum += amp * Noise3(x * f + o * 37.17, y * f + o * 11.41, z * f - o * 19.73);
            norm += amp; amp *= gain; f *= lacunarity;
        }
        return sum / norm;
    }

    /// <summary>
    /// Ridged multifractal in [0, 1]: sharp crests where the underlying noise
    /// crosses zero. Mountain chains come from this, not from plain fBm.
    /// </summary>
    public float Ridged2(double x, double y, int octaves, double lacunarity = 2.0, float gain = 0.5f)
    {
        float sum = 0, amp = 1, norm = 0, weight = 1;
        double f = 1;
        for (int o = 0; o < octaves; o++)
        {
            float n = 1f - MathF.Abs(Noise2(x * f + o * 53.3, y * f - o * 71.9));
            n *= n;
            n *= weight;
            weight = Math.Clamp(n * 1.6f, 0f, 1f);
            sum += n * amp; norm += amp; amp *= gain; f *= lacunarity;
        }
        return sum / norm;
    }
}

public static class Smooth
{
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static float Step(float a, float b, float x)
    {
        float t = Math.Clamp((x - a) / (b - a), 0f, 1f);
        return t * t * (3f - 2f * t);
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static float Lerp(float a, float b, float t) => a + (b - a) * t;

    /// <summary>Piecewise-linear spline through (x, y) knots, sorted by x.</summary>
    public static float Spline(float x, float[] xs, float[] ys)
    {
        if (x <= xs[0]) return ys[0];
        int n = xs.Length;
        if (x >= xs[n - 1]) return ys[n - 1];
        for (int i = 1; i < n; i++)
        {
            if (x <= xs[i])
            {
                float t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
                t = t * t * (3f - 2f * t);
                return ys[i - 1] + (ys[i] - ys[i - 1]) * t;
            }
        }
        return ys[n - 1];
    }
}
