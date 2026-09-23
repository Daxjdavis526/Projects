using System;
using System.Runtime.CompilerServices;

namespace Strata;

/// <summary>
/// World layout. Columns are 16 x 16 x 256, stored y-major so each 16-high
/// section is one contiguous 4096-block span — the mesher works a section at a
/// time and a single edit only ever remeshes the section it touched.
/// </summary>
public static class V
{
    public const int Size = 16;
    public const int Shift = 4;
    public const int Mask = 15;
    public const int Height = 256;
    public const int Sections = Height / Size;          // 16
    public const int ColumnVolume = Size * Size * Height; // 65536
    public const int SectionVolume = Size * Size * Size;  // 4096
    public const int SeaLevel = 62;

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static int Index(int x, int y, int z) => (y << 8) | (z << 4) | x;

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static long Key(int cx, int cz) => ((long)cx << 32) | (uint)cz;

    public static int KeyX(long key) => (int)(key >> 32);
    public static int KeyZ(long key) => (int)(key & 0xFFFFFFFF);

    /// <summary>Floor division by 16 — an arithmetic shift, correct for negatives.</summary>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static int ChunkOf(int w) => w >> Shift;

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static int Local(int w) => w & Mask;

    public static int FloorToInt(double v) => (int)Math.Floor(v);
    public static int FloorToInt(float v) => (int)MathF.Floor(v);
}

/// <summary>Six face directions, in a fixed order used everywhere.</summary>
public static class Dir
{
    // +X, -X, +Y, -Y, +Z, -Z
    public const int PX = 0, NX = 1, PY = 2, NY = 3, PZ = 4, NZ = 5;
    public static readonly int[] DX = { 1, -1, 0, 0, 0, 0 };
    public static readonly int[] DY = { 0, 0, 1, -1, 0, 0 };
    public static readonly int[] DZ = { 0, 0, 0, 0, 1, -1 };
    public static int Opposite(int d) => d ^ 1;
}

/// <summary>
/// Deterministic hashing. Everything procedural derives from (seed, position)
/// through these, so the same seed rebuilds the same world in any load order.
/// </summary>
public static class Hash
{
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static ulong Mix(ulong x)
    {
        x += 0x9E3779B97F4A7C15UL;
        x = (x ^ (x >> 30)) * 0xBF58476D1CE4E5B9UL;
        x = (x ^ (x >> 27)) * 0x94D049BB133111EBUL;
        return x ^ (x >> 31);
    }

    public static ulong Of(long seed, int a) => Mix((ulong)seed ^ Mix((ulong)(uint)a * 0xD6E8FEB86659FD93UL));
    public static ulong Of(long seed, int a, int b) => Mix(Of(seed, a) ^ Mix((ulong)(uint)b * 0x9E3779B97F4A7C15UL + 0x632BE59BD9B4E019UL));
    public static ulong Of(long seed, int a, int b, int c) => Mix(Of(seed, a, b) ^ Mix((ulong)(uint)c * 0xC2B2AE3D27D4EB4FUL + 0x165667B19E3779F9UL));

    /// <summary>Uniform in [0, 1).</summary>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static float Unit(ulong h) => (h >> 40) * (1f / 16777216f);

    public static long StringSeed(string s)
    {
        if (string.IsNullOrWhiteSpace(s)) return 0;
        s = s.Trim();
        if (long.TryParse(s, out long n)) return n;
        ulong h = 1469598103934665603UL;                 // FNV-1a, then mixed
        foreach (char ch in s) { h ^= ch; h *= 1099511628211UL; }
        return (long)Mix(h);
    }
}

/// <summary>A small, fast, seedable generator for procedural decisions.</summary>
public struct Rng
{
    private ulong _s;
    public Rng(ulong seed) { _s = seed == 0 ? 0x2545F4914F6CDD1DUL : seed; }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public ulong Next()
    {
        _s += 0x9E3779B97F4A7C15UL;
        ulong z = _s;
        z = (z ^ (z >> 30)) * 0xBF58476D1CE4E5B9UL;
        z = (z ^ (z >> 27)) * 0x94D049BB133111EBUL;
        return z ^ (z >> 31);
    }

    public float Float() => (Next() >> 40) * (1f / 16777216f);
    public float Range(float a, float b) => a + (b - a) * Float();
    /// <summary>Integer in [a, b] inclusive.</summary>
    public int Int(int a, int b) => b <= a ? a : a + (int)(Next() % (ulong)(b - a + 1));
    public bool Chance(float p) => Float() < p;
}
