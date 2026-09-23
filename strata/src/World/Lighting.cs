using System;
using System.Runtime.CompilerServices;

namespace Strata;

/// <summary>
/// Two light channels, sky and block, each 0..15, stored as one byte per cell.
///
/// One propagation rule is used everywhere, so a column lit from scratch and a
/// column patched after an edit agree exactly: light moving into a cell loses
/// one level plus that cell's attenuation, except sky light at full strength
/// moving straight down, which only loses the attenuation. That is what makes
/// open ground 15 all the way down to the surface and caves dark.
/// </summary>
public static class Lighting
{
    public const byte Opaque = 255;
    public static byte[] Att = Array.Empty<byte>();   // per block id: Opaque, or extra loss 0..14
    public static byte[] Emit = Array.Empty<byte>();  // per block id: emission 0..15

    public static void Init()
    {
        int n = Blocks.ById.Length;
        Att = new byte[n];
        Emit = new byte[n];
        for (int i = 0; i < n; i++)
        {
            var b = Blocks.ById[i];
            Att[i] = b.Opaque ? Opaque : b.Attenuation;
            Emit[i] = b.Light;
        }
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    public static int Propagate(int level, bool down, int att) =>
        down && level == 15 ? 15 - att : level - 1 - att;

    // --- whole-column lighting -----------------------------------------------------
    //
    // Light travels at most 15 cells, so the light inside a column depends only on
    // blocks within 15 cells of it. Lighting runs over that window (46 x 46 cells
    // around the 16 x 16 column) and keeps the middle. It reads the neighbours'
    // blocks and writes nothing but the result, so it is safe on a worker thread.

    private const int M = 15;
    private const int W = V.Size + 2 * M;   // 46
    private const int WW = W * W;

    [ThreadStatic] private static byte[] _att, _sky, _blk;
    [ThreadStatic] private static int[] _queue;

    /// <summary>
    /// Lights the middle column of a 3 x 3 neighbourhood (index (dz + 1) * 3 + (dx + 1)).
    /// Every neighbour must exist with its blocks generated.
    /// </summary>
    public static byte[] ComputeColumn(Chunk[] n)
    {
        _att ??= new byte[WW * V.Height];
        _sky ??= new byte[WW * V.Height];
        _blk ??= new byte[WW * V.Height];
        _queue ??= new int[1 << 16];
        var att = _att; var sky = _sky; var blk = _blk;

        int maxTop = 0;
        foreach (var c in n) maxTop = Math.Max(maxTop, c.TopY);
        int H = Math.Min(V.Height, maxTop + 17);   // block light can rise 15 above the highest block

        int qTail = 0;
        var queue = _queue;

        // Gather attenuation and emitters.
        for (int y = 0; y < H; y++)
        {
            int yo = y << 8;
            for (int wz = 0; wz < W; wz++)
            {
                int gz = wz - M;
                int ci = gz < 0 ? 0 : gz < V.Size ? 3 : 6;
                int lz = gz & V.Mask;
                int row = (y * W + wz) * W;
                for (int wx = 0; wx < W; wx++)
                {
                    int gx = wx - M;
                    var ch = n[ci + (gx < 0 ? 0 : gx < V.Size ? 1 : 2)];
                    ushort id = ch.Blocks[yo | (lz << 4) | (gx & V.Mask)];
                    int i = row + wx;
                    att[i] = Att[id];
                    sky[i] = 0;
                    byte e = Emit[id];
                    blk[i] = e;
                    if (e > 1) Push(ref queue, ref qTail, i);
                }
            }
        }

        // Block light from every emitter.
        Spread(blk, att, ref queue, qTail, H, skyRule: false);

        // Sky: descend each column with the propagation rule, remembering where
        // the open sky ends.
        Span<short> top = stackalloc short[WW];
        for (int wz = 0; wz < W; wz++)
        {
            for (int wx = 0; wx < W; wx++)
            {
                int level = 15;
                int col = wz * W + wx;
                int h = 0;
                for (int y = H - 1; y >= 0; y--)
                {
                    int i = y * WW + col;
                    int a = att[i];
                    if (a == Opaque) { if (h == 0) h = y + 1; level = 0; break; }
                    if (a != 0 && h == 0) h = y + 1;
                    level = Propagate(level, true, a);
                    if (level <= 0) { level = 0; break; }
                    sky[i] = (byte)level;
                }
                top[col] = (short)h;
            }
        }

        // Seeds: open-sky cells beside taller neighbours, and any shaded cell
        // bright enough to still pass light on.
        qTail = 0;
        for (int wz = 0; wz < W; wz++)
        {
            for (int wx = 0; wx < W; wx++)
            {
                int col = wz * W + wx;
                int h = top[col];
                int hn = h;
                if (wx > 0) hn = Math.Max(hn, top[col - 1]);
                if (wx < W - 1) hn = Math.Max(hn, top[col + 1]);
                if (wz > 0) hn = Math.Max(hn, top[col - W]);
                if (wz < W - 1) hn = Math.Max(hn, top[col + W]);
                for (int y = h; y < hn && y < H; y++) Push(ref queue, ref qTail, y * WW + col);
                for (int y = h - 1; y >= 0; y--)
                {
                    int i = y * WW + col;
                    int s = sky[i];
                    if (s == 0) break;
                    if (s >= 2) Push(ref queue, ref qTail, i);
                }
            }
        }
        Spread(sky, att, ref queue, qTail, H, skyRule: true);
        _queue = queue;

        // Keep the middle.
        var outLight = new byte[V.ColumnVolume];
        for (int y = 0; y < V.Height; y++)
        {
            int yo = y << 8;
            if (y >= H)
            {
                Array.Fill(outLight, (byte)0xF0, yo, 256);
                continue;
            }
            for (int lz = 0; lz < V.Size; lz++)
            {
                int row = (y * W + lz + M) * W + M;
                int o = yo | (lz << 4);
                for (int lx = 0; lx < V.Size; lx++)
                    outLight[o + lx] = (byte)((sky[row + lx] << 4) | blk[row + lx]);
            }
        }
        return outLight;
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static void Push(ref int[] q, ref int tail, int v)
    {
        if (tail == q.Length) Array.Resize(ref q, q.Length * 2);
        q[tail++] = v;
    }

    private static void Spread(byte[] lv, byte[] att, ref int[] queue, int tail, int H, bool skyRule)
    {
        int head = 0;
        while (head < tail)
        {
            int i = queue[head++];
            int L = lv[i];
            if (L <= 1) continue;
            int y = i / WW;
            int r = i - y * WW;
            int wz = r / W;
            int wx = r - wz * W;

            if (wx > 0) Try(lv, att, ref queue, ref tail, i - 1, L, false);
            if (wx < W - 1) Try(lv, att, ref queue, ref tail, i + 1, L, false);
            if (wz > 0) Try(lv, att, ref queue, ref tail, i - W, L, false);
            if (wz < W - 1) Try(lv, att, ref queue, ref tail, i + W, L, false);
            if (y > 0) Try(lv, att, ref queue, ref tail, i - WW, L, skyRule);
            if (y < H - 1) Try(lv, att, ref queue, ref tail, i + WW, L, false);

            // Reclaim the consumed front of the queue when it gets long.
            if (head > 1 << 20 && head * 2 > tail)
            {
                Array.Copy(queue, head, queue, 0, tail - head);
                tail -= head; head = 0;
            }
        }
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static void Try(byte[] lv, byte[] att, ref int[] queue, ref int tail, int n, int L, bool down)
    {
        int a = att[n];
        if (a == Opaque) return;
        int nl = Propagate(L, down, a);
        if (nl > lv[n])
        {
            lv[n] = (byte)nl;
            if (nl > 1) Push(ref queue, ref tail, n);
        }
    }
}
