using System;
using Godot;

namespace Strata;

/// <summary>
/// A tiny pixel-art canvas and the brushes used to paint every texture and
/// icon in the game. Everything is procedural and deterministic: the same
/// name always paints the same picture. Noise wraps at the canvas edge so
/// block faces tile without seams.
/// </summary>
public sealed class Pixel
{
    public readonly int W, H;
    public readonly Color[] P;
    private readonly uint _salt;

    public Pixel(int w, int h, string name)
    {
        W = w; H = h; P = new Color[w * h];
        uint s = 2166136261;
        foreach (char c in name) { s ^= c; s *= 16777619; }
        _salt = s;
    }

    public Color this[int x, int y]
    {
        get => P[((y % H + H) % H) * W + ((x % W + W) % W)];
        set => P[((y % H + H) % H) * W + ((x % W + W) % W)] = value;
    }

    public bool In(int x, int y) => x >= 0 && y >= 0 && x < W && y < H;

    public void Set(int x, int y, Color c) { if (In(x, y)) P[y * W + x] = c; }

    // --- noise ---------------------------------------------------------------------------

    public float Hash(int x, int y, int k = 0)
    {
        uint h = _salt ^ (uint)(x * 374761393) ^ (uint)(y * 668265263) ^ (uint)(k * 2246822519u);
        h = (h ^ (h >> 13)) * 1274126177u;
        h ^= h >> 16;
        return (h & 0xFFFFFF) / 16777216f;
    }

    /// <summary>Smooth value noise with a cell of `cell` pixels; tiles across the canvas.</summary>
    public float Value(int x, int y, int cell, int k = 0)
    {
        int gw = Math.Max(1, W / cell), gh = Math.Max(1, H / cell);
        float fx = (float)x / cell, fy = (float)y / cell;
        int x0 = (int)MathF.Floor(fx), y0 = (int)MathF.Floor(fy);
        float tx = fx - x0, ty = fy - y0;
        tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
        float G(int gx, int gy) => Hash(((gx % gw) + gw) % gw, ((gy % gh) + gh) % gh, k + 1000);
        float a = G(x0, y0), b = G(x0 + 1, y0), c = G(x0, y0 + 1), d = G(x0 + 1, y0 + 1);
        return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
    }

    public float Fractal(int x, int y, int k = 0)
    {
        return Value(x, y, 8, k) * 0.5f + Value(x, y, 4, k + 7) * 0.3f + Value(x, y, 2, k + 13) * 0.2f;
    }

    /// <summary>Distance to the nearest and second-nearest tiling Voronoi seed, and the nearest seed's id.</summary>
    public (float d1, float d2, int id) Voronoi(int x, int y, int cells, int k = 0)
    {
        float best = 1e9f, second = 1e9f;
        int bestId = 0;
        float cs = (float)W / cells;
        int cx = (int)(x / cs), cy = (int)(y / cs);
        for (int oy = -1; oy <= 1; oy++)
            for (int ox = -1; ox <= 1; ox++)
            {
                int gx = cx + ox, gy = cy + oy;
                int wx = ((gx % cells) + cells) % cells, wy = ((gy % cells) + cells) % cells;
                float px = (gx + 0.15f + 0.7f * Hash(wx, wy, k + 50)) * cs;
                float py = (gy + 0.15f + 0.7f * Hash(wx, wy, k + 51)) * cs;
                float dx = x + 0.5f - px, dy = y + 0.5f - py;
                float d = MathF.Sqrt(dx * dx + dy * dy);
                if (d < best) { second = best; best = d; bestId = wy * cells + wx; }
                else if (d < second) second = d;
            }
        return (best, second, bestId);
    }

    // --- colour helpers ----------------------------------------------------------------------

    public static Color Hex(uint rgb) => new(((rgb >> 16) & 255) / 255f, ((rgb >> 8) & 255) / 255f, (rgb & 255) / 255f);

    public static Color Mix(Color a, Color b, float t) => new(a.R + (b.R - a.R) * t, a.G + (b.G - a.G) * t, a.B + (b.B - a.B) * t, a.A + (b.A - a.A) * t);

    public static Color Shade(Color c, float f) => new(Math.Clamp(c.R * f, 0, 1), Math.Clamp(c.G * f, 0, 1), Math.Clamp(c.B * f, 0, 1), c.A);

    /// <summary>Picks from a dark-to-light palette.</summary>
    public static Color Ramp(Color[] pal, float t)
    {
        int i = Math.Clamp((int)(t * pal.Length), 0, pal.Length - 1);
        return pal[i];
    }

    // --- brushes -----------------------------------------------------------------------------

    public void Clear(Color c) { Array.Fill(P, c); }

    public void Noise(Color[] pal, float grain = 0.35f, int k = 0, int cell = 4)
    {
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
            {
                float t = Value(x, y, cell, k) * (1 - grain) + Hash(x, y, k) * grain;
                P[y * W + x] = Ramp(pal, t);
            }
    }

    public void Speckle(Color c, float density, int k = 3)
    {
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
                if (Hash(x, y, k) < density) P[y * W + x] = c;
    }

    public void Rect(int x0, int y0, int w, int h, Color c)
    {
        for (int y = y0; y < y0 + h; y++)
            for (int x = x0; x < x0 + w; x++) Set(x, y, c);
    }

    public void Frame(int x0, int y0, int w, int h, Color c)
    {
        for (int x = x0; x < x0 + w; x++) { Set(x, y0, c); Set(x, y0 + h - 1, c); }
        for (int y = y0; y < y0 + h; y++) { Set(x0, y, c); Set(x0 + w - 1, y, c); }
    }

    public void Line(int x0, int y0, int x1, int y1, Color c)
    {
        int dx = Math.Abs(x1 - x0), dy = -Math.Abs(y1 - y0);
        int sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
        while (true)
        {
            Set(x0, y0, c);
            if (x0 == x1 && y0 == y1) break;
            int e2 = 2 * err;
            if (e2 >= dy) { err += dy; x0 += sx; }
            if (e2 <= dx) { err += dx; y0 += sy; }
        }
    }

    public void Disc(float cx, float cy, float r, Color c)
    {
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
            {
                float dx = x + 0.5f - cx, dy = y + 0.5f - cy;
                if (dx * dx + dy * dy <= r * r) P[y * W + x] = c;
            }
    }

    /// <summary>Lightens top-left edges and darkens bottom-right ones of every opaque region: a cheap bevel.</summary>
    public void Bevel(float amount = 0.18f)
    {
        var src = (Color[])P.Clone();
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
            {
                var c = src[y * W + x];
                if (c.A < 0.5f) continue;
                bool topOpen = y == 0 || src[(y - 1) * W + x].A < 0.5f;
                bool leftOpen = x == 0 || src[y * W + x - 1].A < 0.5f;
                bool botOpen = y == H - 1 || src[(y + 1) * W + x].A < 0.5f;
                bool rightOpen = x == W - 1 || src[y * W + x + 1].A < 0.5f;
                if (topOpen || leftOpen) P[y * W + x] = Shade(c, 1 + amount);
                else if (botOpen || rightOpen) P[y * W + x] = Shade(c, 1 - amount);
            }
    }

    /// <summary>Dark outline around opaque pixels (for icons).</summary>
    public void Outline(Color c)
    {
        var src = (Color[])P.Clone();
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++)
            {
                if (src[y * W + x].A > 0.5f) continue;
                bool near = false;
                for (int k = 0; k < 4 && !near; k++)
                {
                    int nx = x + (k == 0 ? 1 : k == 1 ? -1 : 0), ny = y + (k == 2 ? 1 : k == 3 ? -1 : 0);
                    if (In(nx, ny) && src[ny * W + nx].A > 0.5f) near = true;
                }
                if (near) P[y * W + x] = c;
            }
    }

    public void Fill(Func<int, int, Color> f)
    {
        for (int y = 0; y < H; y++)
            for (int x = 0; x < W; x++) P[y * W + x] = f(x, y);
    }

    public Image ToImage(bool mipmaps = false, bool coverage = false)
    {
        var data = new byte[W * H * 4];
        for (int i = 0; i < P.Length; i++)
        {
            var c = P[i];
            data[i * 4] = (byte)Math.Clamp((int)(c.R * 255f + 0.5f), 0, 255);
            data[i * 4 + 1] = (byte)Math.Clamp((int)(c.G * 255f + 0.5f), 0, 255);
            data[i * 4 + 2] = (byte)Math.Clamp((int)(c.B * 255f + 0.5f), 0, 255);
            data[i * 4 + 3] = (byte)Math.Clamp((int)(c.A * 255f + 0.5f), 0, 255);
        }
        if (!mipmaps) return Image.CreateFromData(W, H, false, Image.Format.Rgba8, data);
        return Image.CreateFromData(W, H, true, Image.Format.Rgba8, Mips(data, W, H, coverage));
    }

    /// <summary>
    /// Mip chain by box filter, colour weighted by alpha so transparent texels
    /// do not darken edges. For cut-out textures the alpha of each level is
    /// rescaled so the fraction of texels that pass the alpha test stays the
    /// same: leaves stay leafy in the distance instead of thinning to nothing.
    /// </summary>
    public static byte[] Mips(byte[] level0, int w, int h, bool coverage)
    {
        var levels = new System.Collections.Generic.List<byte[]> { level0 };
        float target = 0;
        if (coverage)
        {
            int pass = 0;
            for (int i = 0; i < w * h; i++) if (level0[i * 4 + 3] >= 128) pass++;
            target = pass / (float)(w * h);
        }
        var cur = level0; int cw = w, chh = h;
        while (cw > 1 || chh > 1)
        {
            int nw = Math.Max(1, cw / 2), nh = Math.Max(1, chh / 2);
            var next = new byte[nw * nh * 4];
            var alpha = new float[nw * nh];
            for (int y = 0; y < nh; y++)
                for (int x = 0; x < nw; x++)
                {
                    float r = 0, g = 0, b = 0, a = 0, wsum = 0;
                    for (int k = 0; k < 4; k++)
                    {
                        int sx = Math.Min(cw - 1, x * 2 + (k & 1)), sy = Math.Min(chh - 1, y * 2 + (k >> 1));
                        int si = (sy * cw + sx) * 4;
                        float wa = cur[si + 3] / 255f + 0.001f;
                        r += cur[si] * wa; g += cur[si + 1] * wa; b += cur[si + 2] * wa; wsum += wa;
                        a += cur[si + 3];
                    }
                    int di = (y * nw + x) * 4;
                    next[di] = (byte)(r / wsum); next[di + 1] = (byte)(g / wsum); next[di + 2] = (byte)(b / wsum);
                    alpha[y * nw + x] = a / 4f;
                }
            if (coverage && target > 0f)
            {
                // Binary search a scale that keeps the pass rate.
                float lo = 0.1f, hi = 8f;
                for (int it = 0; it < 18; it++)
                {
                    float mid = (lo + hi) * 0.5f;
                    int pass = 0;
                    foreach (var av in alpha) if (av * mid >= 128f) pass++;
                    if (pass / (float)alpha.Length < target) lo = mid; else hi = mid;
                }
                for (int i = 0; i < alpha.Length; i++) alpha[i] = Math.Min(255f, alpha[i] * hi);
            }
            for (int i = 0; i < alpha.Length; i++) next[i * 4 + 3] = (byte)Math.Clamp((int)alpha[i], 0, 255);
            levels.Add(next);
            cur = next; cw = nw; chh = nh;
        }
        int total = 0;
        foreach (var l in levels) total += l.Length;
        var all = new byte[total];
        int at = 0;
        foreach (var l in levels) { Buffer.BlockCopy(l, 0, all, at, l.Length); at += l.Length; }
        return all;
    }
}
