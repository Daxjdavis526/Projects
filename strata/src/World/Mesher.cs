using System;
using System.Runtime.CompilerServices;
using Godot;

namespace Strata;

/// <summary>Vertex streams for one surface of one slab, grown as needed and reused per thread.</summary>
public sealed class MeshBuffers
{
    public Vector3[] V = new Vector3[4096];
    public Vector2[] UV = new Vector2[4096];
    public Vector2[] UV2 = new Vector2[4096];
    public Color[] C = new Color[4096];
    public int[] I = new int[6144];
    public int VC, IC;

    public void Clear() { VC = 0; IC = 0; }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private void Ensure()
    {
        if (VC + 4 > V.Length)
        {
            int n = V.Length * 2;
            Array.Resize(ref V, n); Array.Resize(ref UV, n); Array.Resize(ref UV2, n); Array.Resize(ref C, n);
        }
        if (IC + 6 > I.Length) Array.Resize(ref I, I.Length * 2);
    }

    /// <summary>
    /// One quad, corners A B C D clockwise seen from the front. flip picks the
    /// B-D diagonal instead of A-C so light and occlusion interpolate evenly.
    /// </summary>
    public void Quad(Vector3 a, Vector3 b, Vector3 c, Vector3 d,
        Vector2 ta, Vector2 tb, Vector2 tc, Vector2 td, Vector2 info,
        Color ca, Color cb, Color cc, Color cd, bool flip)
    {
        Ensure();
        int v = VC;
        V[v] = a; V[v + 1] = b; V[v + 2] = c; V[v + 3] = d;
        UV[v] = ta; UV[v + 1] = tb; UV[v + 2] = tc; UV[v + 3] = td;
        UV2[v] = info; UV2[v + 1] = info; UV2[v + 2] = info; UV2[v + 3] = info;
        C[v] = ca; C[v + 1] = cb; C[v + 2] = cc; C[v + 3] = cd;
        int i = IC;
        if (!flip)
        {
            I[i] = v; I[i + 1] = v + 1; I[i + 2] = v + 2;
            I[i + 3] = v; I[i + 4] = v + 2; I[i + 5] = v + 3;
        }
        else
        {
            I[i] = v + 1; I[i + 1] = v + 2; I[i + 2] = v + 3;
            I[i + 3] = v + 1; I[i + 4] = v + 3; I[i + 5] = v;
        }
        VC += 4; IC += 6;
    }

    public Godot.Collections.Array ToArrays()
    {
        if (VC == 0) return null;
        var arr = new Godot.Collections.Array();
        arr.Resize((int)Mesh.ArrayType.Max);
        arr[(int)Mesh.ArrayType.Vertex] = Variant.CreateFrom(new Span<Vector3>(V, 0, VC));
        arr[(int)Mesh.ArrayType.TexUV] = Variant.CreateFrom(new Span<Vector2>(UV, 0, VC));
        arr[(int)Mesh.ArrayType.TexUV2] = Variant.CreateFrom(new Span<Vector2>(UV2, 0, VC));
        arr[(int)Mesh.ArrayType.Color] = Variant.CreateFrom(new Span<Color>(C, 0, VC));
        arr[(int)Mesh.ArrayType.Index] = Variant.CreateFrom(new Span<int>(I, 0, IC));
        return arr;
    }
}

/// <summary>The mesh of one 64-block slab of a column, ready to hand to the renderer.</summary>
public sealed class SlabMesh
{
    public int CX, CZ, Slab, Seq;
    public Godot.Collections.Array Opaque, Cutout, Water;
    public int Triangles;
}

/// <summary>
/// Greedy mesher. Faces between two cells are only drawn where the far cell
/// lets you see them; coplanar faces with identical texture, tint, light and
/// occlusion at all four corners merge into one rectangle. Light is smooth
/// (each corner averages the four cells around it) and corners are darkened by
/// the classic three-neighbour ambient occlusion. Plants, torches, ladders,
/// doors and other odd shapes are emitted as small fixed models.
/// </summary>
public static class Mesher
{
    // Face flag bits packed with the tint into UV2.y.
    public const int FlagSway = 1 << 3, FlagEmissive = 1 << 4, FlagTint = 1 << 5, FlagLiquid = 1 << 6;
    public const int FaceNone = 6;

    private const int P = 18;                     // padded width
    private const int PP = P * P;
    private const int SH = Chunk.SlabHeight;      // 64
    private const int PH = SH + 2;

    // Per-block tables, flattened for the inner loops.
    private static bool[] _opq;
    private static byte[] _cull, _kind;           // kind: 0 air, 1 cube, 2 liquid, 3 special
    private static bool[] _cutout, _emissive, _sway;
    private static int[] _tex;                    // id * 6 + face
    private static byte[] _tintOfLayer;           // 0 none, 1 grass, 2 foliage
    private static bool[] _lava;
    private static byte[] _liquidTop;             // surface height in sixteenths with nothing on top

    public static void Init()
    {
        int n = Blocks.ById.Length;
        _opq = new bool[n]; _cull = new byte[n]; _kind = new byte[n]; _cutout = new bool[n];
        _emissive = new bool[n]; _sway = new bool[n]; _tex = new int[n * 6]; _lava = new bool[n];
        _liquidTop = new byte[n];
        for (int i = 0; i < n; i++)
        {
            var b = Blocks.ById[i];
            _opq[i] = b.Opaque;
            _cull[i] = b.CullGroup;
            _kind[i] = (byte)(b.Render switch
            {
                RenderKind.None => 0,
                RenderKind.Cube => b.Box == null ? 1 : 3,
                RenderKind.Liquid => 2,
                _ => 3,
            });
            _cutout[i] = b.Cutout;
            _emissive[i] = b.Emissive;
            _sway[i] = b.Sway;
            _lava[i] = i == Blocks.Lava;
            _liquidTop[i] = (byte)(b.Render == RenderKind.Liquid ? Blocks.LiquidTop16((ushort)i) : 16);
            for (int f = 0; f < 6; f++) _tex[i * 6 + f] = b.Tex[f];
        }
        _tintOfLayer = new byte[Math.Max(256, Tex.Count)];
        foreach (var name in new[] { "grass_top", "grass_side", "tall_grass", "fern" }) _tintOfLayer[Tex.Get(name)] = 1;
        foreach (var name in new[] { "elm_leaves", "ironwood_leaves", "willow_leaves", "pine_leaves" }) _tintOfLayer[Tex.Get(name)] = 2;
        if (Tex.Count > 255) throw new InvalidOperationException("texture layers exceed the mesher's 8-bit key");
    }

    [ThreadStatic] private static ushort[] _pb;
    [ThreadStatic] private static byte[] _pl;
    [ThreadStatic] private static ulong[] _m1;
    [ThreadStatic] private static uint[] _m2;
    [ThreadStatic] private static MeshBuffers _op, _cu, _wa;

    /// <summary>Builds one slab from the 3 x 3 neighbourhood (index (dz + 1) * 3 + dx + 1).</summary>
    public static SlabMesh Build(Chunk[] n, int slab, int seq)
    {
        _pb ??= new ushort[PP * PH];
        _pl ??= new byte[PP * PH];
        _m1 ??= new ulong[16 * SH];
        _m2 ??= new uint[16 * SH];
        _op ??= new MeshBuffers(); _cu ??= new MeshBuffers(); _wa ??= new MeshBuffers();
        var op = _op; var cu = _cu; var wa = _wa;
        op.Clear(); cu.Clear(); wa.Clear();

        var center = n[4];
        int y0 = slab * SH;
        Gather(n, y0);

        var pb = _pb;
        var pl = _pl;

        // --- greedy cube faces -------------------------------------------------------
        for (int d = 0; d < 6; d++) Sweep(d, y0, center, op, cu, wa);

        // --- special shapes ------------------------------------------------------------
        for (int y = 0; y < SH; y++)
        {
            int wy = y0 + y;
            for (int z = 0; z < 16; z++)
                for (int x = 0; x < 16; x++)
                {
                    int pi = ((y + 1) * P + (z + 1)) * P + (x + 1);
                    ushort id = pb[pi];
                    if (_kind[id] != 3) continue;
                    Special(id, x, wy, z, pi, center, op, cu);
                }
        }

        var m = new SlabMesh { CX = center.X, CZ = center.Z, Slab = slab, Seq = seq };
        m.Opaque = op.ToArrays();
        m.Cutout = cu.ToArrays();
        m.Water = wa.ToArrays();
        m.Triangles = (op.IC + cu.IC + wa.IC) / 3;
        return m;
    }

    /// <summary>Copies the slab and a one-cell border from the neighbours into flat padded arrays.</summary>
    private static void Gather(Chunk[] n, int y0)
    {
        var pb = _pb; var pl = _pl;
        for (int py = 0; py < PH; py++)
        {
            int wy = y0 + py - 1;
            if (wy < 0 || wy >= V.Height)
            {
                ushort fill = wy < 0 ? Blocks.Rootstone : (ushort)0;
                byte light = wy < 0 ? (byte)0 : (byte)0xF0;
                int s = py * PP;
                Array.Fill(pb, fill, s, PP);
                Array.Fill(pl, light, s, PP);
                continue;
            }
            int yo = wy << 8;
            for (int pz = 0; pz < P; pz++)
            {
                int lz = pz - 1;
                int cz = lz < 0 ? 0 : lz < 16 ? 1 : 2;
                int zz = lz & 15;
                int row = (py * P + pz) * P;
                for (int px = 0; px < P; px++)
                {
                    int lx = px - 1;
                    var ch = n[cz * 3 + (lx < 0 ? 0 : lx < 16 ? 1 : 2)];
                    int i = yo | (zz << 4) | (lx & 15);
                    pb[row + px] = ch.Blocks[i];
                    pl[row + px] = ch.Light[i];
                }
            }
        }
    }

    // Axis bookkeeping per face direction: which padded strides the slice, the
    // mask's a and b axes, and the in-plane corner axes use.
    private static readonly int[] StrideOf = { 1, PP, P };  // x, y, z

    private static void Sweep(int d, int y0, Chunk center, MeshBuffers op, MeshBuffers cu, MeshBuffers wa)
    {
        var pb = _pb; var pl = _pl; var m1 = _m1; var m2 = _m2;
        int axis = d >> 1;               // 0 x, 1 y, 2 z
        bool pos = (d & 1) == 0;
        int aAxis, bAxis, sliceCount, aCount, bCount;
        if (axis == 1) { aAxis = 0; bAxis = 2; sliceCount = SH; aCount = 16; bCount = 16; }
        else if (axis == 0) { aAxis = 2; bAxis = 1; sliceCount = 16; aCount = 16; bCount = SH; }
        else { aAxis = 0; bAxis = 1; sliceCount = 16; aCount = 16; bCount = SH; }
        int aS = StrideOf[aAxis], bS = StrideOf[bAxis], sS = StrideOf[axis];
        int nOff = pos ? sS : -sS;
        int face = d;

        for (int s = 0; s < sliceCount; s++)
        {
            bool any = false;
            for (int b = 0; b < bCount; b++)
                for (int a = 0; a < aCount; a++)
                {
                    int x, y, z;
                    Cell(axis, s, a, b, out x, out y, out z);
                    int pi = ((y + 1) * P + (z + 1)) * P + (x + 1);
                    int mi = b * aCount + a;
                    m2[mi] = 0;
                    ushort id = pb[pi];
                    byte kind = _kind[id];
                    if (kind != 1 && kind != 2) continue;
                    ushort nid = pb[pi + nOff];
                    if (_opq[nid]) continue;
                    byte cg = _cull[id];
                    int top = 16, bot = 0;
                    if (kind == 2)
                    {
                        top = LiquidTop(pi);
                        if (_cull[nid] == cg)
                        {
                            // Against the same liquid only a side shows, and only the strip where this cell stands higher.
                            if (axis == 1) continue;
                            bot = LiquidTop(pi + nOff);
                            if (bot >= top) continue;
                        }
                    }
                    else if (cg != 0 && cg == _cull[nid]) continue;

                    int layer = _tex[id * 6 + face];
                    int flags = face;
                    bool emissive = _emissive[id];
                    if (emissive) flags |= FlagEmissive;
                    if (_sway[id] && kind == 1) flags |= FlagSway;
                    int tint = 0;
                    bool shaped = false;
                    byte tk = _tintOfLayer[layer];
                    if (tk != 0)
                    {
                        flags |= FlagTint;
                        tint = tk == 1 ? center.GrassTint[(z << 4) | x] : center.FoliageTint[(z << 4) | x];
                    }
                    if (kind == 2)
                    {
                        // Liquids are never tinted, so their tint bits carry the face's top and bottom instead.
                        flags |= FlagLiquid;
                        tint = top | (bot << 5);
                        shaped = top != 16 || bot != 0;
                    }

                    m1[mi] = emissive ? FullBright : Corners(pi + nOff, aS, bS);
                    // Bit 7 of the flags byte marks "a face is here", so an all-zero key never looks like one.
                    m2[mi] = (uint)layer | ((uint)(flags | 0x80) << 8) | ((uint)(tint & 0x7FFF) << 16) | (shaped ? 0x8000_0000u : 0u);
                    any = true;
                }
            if (!any) continue;

            // Greedy merge.
            for (int b = 0; b < bCount; b++)
                for (int a = 0; a < aCount; a++)
                {
                    int mi = b * aCount + a;
                    uint k2 = m2[mi];
                    if (k2 == 0) continue;
                    ulong k1 = m1[mi];
                    int w = 1;
                    while (a + w < aCount && m2[mi + w] == k2 && m1[mi + w] == k1) w++;
                    int h = 1;
                    bool shaped = (k2 & 0x8000_0000u) != 0;
                    if (!shaped || axis == 1)
                    {
                        for (; b + h < bCount; h++)
                        {
                            int row = (b + h) * aCount + a;
                            bool ok = true;
                            for (int k = 0; k < w; k++)
                                if (m2[row + k] != k2 || m1[row + k] != k1) { ok = false; break; }
                            if (!ok) break;
                        }
                    }
                    for (int hh = 0; hh < h; hh++)
                        for (int k = 0; k < w; k++) m2[(b + hh) * aCount + a + k] = 0;

                    int x, y, z;
                    Cell(axis, s, a, b, out x, out y, out z);
                    int layer = (int)(k2 & 0xFF);
                    int flags = (int)((k2 >> 8) & 0x7F);
                    int tint = (int)((k2 >> 16) & 0x7FFF);
                    float top = 1f, bot = 0f;
                    if ((flags & FlagLiquid) != 0) { top = (tint & 31) / 16f; bot = ((tint >> 5) & 31) / 16f; tint = 0; }
                    ushort id = _pb[((y + 1) * P + (z + 1)) * P + (x + 1)];
                    var target = (flags & FlagLiquid) != 0 && !_lava[id] ? wa : _cutout[id] ? cu : op;
                    Emit(target, d, x, y0 + y, z, w, h, k1, layer, flags, tint, bot, top);
                    a += w - 1;
                }
        }
    }

    /// <summary>Surface of the liquid in a padded cell, in sixteenths: full when the same liquid sits on top.</summary>
    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static int LiquidTop(int pi)
    {
        ushort id = _pb[pi], up = _pb[pi + PP];
        return _kind[up] == 2 && _cull[up] == _cull[id] ? 16 : _liquidTop[id];
    }

    [MethodImpl(MethodImplOptions.AggressiveInlining)]
    private static void Cell(int axis, int s, int a, int b, out int x, out int y, out int z)
    {
        if (axis == 1) { x = a; y = s; z = b; }
        else if (axis == 0) { x = s; y = b; z = a; }
        else { x = a; y = b; z = s; }
    }

    /// <summary>
    /// Light and occlusion at the four corners of a face whose front cell is f.
    /// Each corner packs sky (6 bits, quarter levels), block (6) and AO (2).
    /// Order: (da, db) = 00, 10, 11, 01.
    /// </summary>
    private static ulong Corners(int f, int aS, int bS)
    {
        var pb = _pb; var pl = _pl;
        ulong r = 0;
        int fl = pl[f];
        for (int c = 0; c < 4; c++)
        {
            int da = c == 1 || c == 2 ? aS : -aS;
            int db = c >= 2 ? bS : -bS;
            int s1 = f + da, s2 = f + db, cc = f + da + db;
            bool o1 = _opq[pb[s1]], o2 = _opq[pb[s2]], oc = _opq[pb[cc]];
            int ao = o1 && o2 ? 0 : 3 - ((o1 ? 1 : 0) + (o2 ? 1 : 0) + (oc ? 1 : 0));
            int sky = fl >> 4, blk = fl & 15, cnt = 1;
            if (!o1) { int l = pl[s1]; sky += l >> 4; blk += l & 15; cnt++; }
            if (!o2) { int l = pl[s2]; sky += l >> 4; blk += l & 15; cnt++; }
            if (!oc && !(o1 && o2)) { int l = pl[cc]; sky += l >> 4; blk += l & 15; cnt++; }
            int sq = (sky * 4 + cnt / 2) / cnt;
            int bq = (blk * 4 + cnt / 2) / cnt;
            ulong v = (ulong)sq | ((ulong)bq << 6) | ((ulong)ao << 12);
            r |= v << (c * 14);
        }
        return r;
    }

    // Sky 60, block 60, no occlusion, at all four corners: emissive faces ignore light.
    private const ulong FullBright = 16188UL | (16188UL << 14) | (16188UL << 28) | (16188UL << 42);

    private static Color CornerColor(ulong k1, int c)
    {
        ulong v = (k1 >> (c * 14)) & 0x3FFF;
        return new Color((v & 63) / 60f, ((v >> 6) & 63) / 60f, ((v >> 12) & 3) / 3f, 1f);
    }

    private static float Brightness(ulong k1, int c)
    {
        ulong v = (k1 >> (c * 14)) & 0x3FFF;
        return (v & 63) + ((v >> 6) & 63) + ((v >> 12) & 3) * 20;
    }

    /// <summary>
    /// Writes a merged rectangle. (x, y, z) is its lowest cell, w and h its size
    /// along the direction's a and b axes. Side faces run from bot in the lowest
    /// cell to top in the highest (fractions of a block, for liquids); a top face
    /// sits at top.
    /// </summary>
    private static void Emit(MeshBuffers mb, int d, int x, int y, int z, int w, int h, ulong k1, int layer, int flags, int tint, float bot, float top)
    {
        var info = new Vector2(layer, flags | (tint << 8));
        Color c00 = CornerColor(k1, 0), c10 = CornerColor(k1, 1), c11 = CornerColor(k1, 2), c01 = CornerColor(k1, 3);
        float b00 = Brightness(k1, 0), b10 = Brightness(k1, 1), b11 = Brightness(k1, 2), b01 = Brightness(k1, 3);
        bool flip = MathF.Abs(b00 - b11) > MathF.Abs(b10 - b01);
        // Side faces keep one texel per sixteenth however much of the cell they cover.
        float yb = y + bot, vt = 1f - top, vb = h - bot;
        switch (d)
        {
            case Dir.PY:
            {
                float Y = y + top;
                mb.Quad(new(x, Y, z), new(x + w, Y, z), new(x + w, Y, z + h), new(x, Y, z + h),
                    new(0, 0), new(w, 0), new(w, h), new(0, h), info, c00, c10, c11, c01, flip);
                break;
            }
            case Dir.NY:
            {
                float Y = y;
                mb.Quad(new(x, Y, z), new(x, Y, z + h), new(x + w, Y, z + h), new(x + w, Y, z),
                    new(0, 0), new(0, h), new(w, h), new(w, 0), info, c00, c01, c11, c10, flip);
                break;
            }
            case Dir.PX:
            {
                float X = x + 1, yt = y + h - 1 + top;
                mb.Quad(new(X, yb, z), new(X, yb, z + w), new(X, yt, z + w), new(X, yt, z),
                    new(w, vb), new(0, vb), new(0, vt), new(w, vt), info, c00, c10, c11, c01, flip);
                break;
            }
            case Dir.NX:
            {
                float X = x, yt = y + h - 1 + top;
                mb.Quad(new(X, yb, z), new(X, yt, z), new(X, yt, z + w), new(X, yb, z + w),
                    new(0, vb), new(0, vt), new(w, vt), new(w, vb), info, c00, c01, c11, c10, flip);
                break;
            }
            case Dir.PZ:
            {
                float Z = z + 1, yt = y + h - 1 + top;
                mb.Quad(new(x, yb, Z), new(x, yt, Z), new(x + w, yt, Z), new(x + w, yb, Z),
                    new(0, vb), new(0, vt), new(w, vt), new(w, vb), info, c00, c01, c11, c10, flip);
                break;
            }
            default:
            {
                float Z = z, yt = y + h - 1 + top;
                mb.Quad(new(x, yb, Z), new(x + w, yb, Z), new(x + w, yt, Z), new(x, yt, Z),
                    new(w, vb), new(0, vb), new(0, vt), new(w, vt), info, c00, c10, c11, c01, flip);
                break;
            }
        }
    }

    // --- special shapes ---------------------------------------------------------------

    private static Color CellColor(int pi)
    {
        int l = _pl[pi];
        return new Color((l >> 4) / 15f, (l & 15) / 15f, 1f, 1f);
    }

    /// <summary>Light for a shape that fills little of its cell: the brightest of it and its open neighbours.</summary>
    private static Color OpenCellColor(int pi)
    {
        int best = _pl[pi];
        int sky = best >> 4, blk = best & 15;
        foreach (int off in new[] { 1, -1, P, -P, PP })
        {
            int l = _pl[pi + off];
            if (_opq[_pb[pi + off]]) continue;
            sky = Math.Max(sky, (l >> 4) - 1);
            blk = Math.Max(blk, (l & 15) - 1);
        }
        return new Color(sky / 15f, blk / 15f, 1f, 1f);
    }

    private static void Special(ushort id, int x, int y, int z, int pi, Chunk center, MeshBuffers op, MeshBuffers cu)
    {
        var def = Blocks.ById[id];
        int layer = def.Tex[0];
        int flags = FaceNone;
        if (def.Sway) flags |= FlagSway;
        if (def.Emissive) flags |= FlagEmissive;
        int tint = 0;
        if (_tintOfLayer[layer] != 0)
        {
            flags |= FlagTint;
            tint = _tintOfLayer[layer] == 1 ? center.GrassTint[(z << 4) | x] : center.FoliageTint[(z << 4) | x];
        }
        var info = new Vector2(layer, flags | (tint << 8));
        var col = def.Render == RenderKind.Door || def.Render == RenderKind.Low ? CellColor(pi) : OpenCellColor(pi);

        switch (def.Render)
        {
            case RenderKind.Cross:
            {
                ulong h = Hash.Of(0x51, center.WorldX + x, y, center.WorldZ + z);
                float jx = ((h & 0xFF) / 255f - 0.5f) * 0.3f, jz = (((h >> 8) & 0xFF) / 255f - 0.5f) * 0.3f;
                float ht = def.Id == Blocks.TallGrass || def.Id == Blocks.Fern ? 0.85f + ((h >> 16) & 0xFF) / 255f * 0.3f : 1f;
                float cx = x + 0.5f + jx, cz = z + 0.5f + jz;
                const float r = 0.45f;
                Cross(cu, cx, y, cz, r, ht, info, col);
                break;
            }
            case RenderKind.Crop:
            {
                float ht = 0.4f + 0.2f * def.Variant;
                if (ht > 1f) ht = 1f;
                for (int k = 0; k < 2; k++)
                {
                    float o = k == 0 ? 0.28f : 0.72f;
                    // Two panels along z and two along x, like a small hash sign.
                    cu.Quad(new(x + o, y, z), new(x + o, y + ht, z), new(x + o, y + ht, z + 1), new(x + o, y, z + 1),
                        new(0, 1), new(0, 1 - ht), new(1, 1 - ht), new(1, 1), info, col, col, col, col, false);
                    cu.Quad(new(x, y, z + o), new(x + 1, y, z + o), new(x + 1, y + ht, z + o), new(x, y + ht, z + o),
                        new(0, 1), new(1, 1), new(1, 1 - ht), new(0, 1 - ht), info, col, col, col, col, false);
                }
                break;
            }
            case RenderKind.Torch:
            {
                float bx = x + 0.5f, bz = z + 0.5f, tx = bx, tz = bz, by = y;
                if (def.SupportDir >= 0)
                {
                    // Lean out from the wall.
                    bx += Dir.DX[def.SupportDir] * 0.38f; bz += Dir.DZ[def.SupportDir] * 0.38f;
                    tx += Dir.DX[def.SupportDir] * 0.2f; tz += Dir.DZ[def.SupportDir] * 0.2f;
                    by = y + 0.2f;
                }
                const float r = 0.5f;
                float ht = 1f;
                var c = new Color(col.R, 1f, 1f, 1f);
                cu.Quad(new(bx - r, by, bz - r), new(tx - r, by + ht, tz - r), new(tx + r, by + ht, tz + r), new(bx + r, by, bz + r),
                    new(0, 1), new(0, 0), new(1, 0), new(1, 1), info, c, c, c, c, false);
                cu.Quad(new(bx - r, by, bz + r), new(tx - r, by + ht, tz + r), new(tx + r, by + ht, tz - r), new(bx + r, by, bz - r),
                    new(0, 1), new(0, 0), new(1, 0), new(1, 1), info, c, c, c, c, false);
                break;
            }
            case RenderKind.Ladder:
            {
                int sd = def.SupportDir;
                const float e = 1f / 16f;
                Vector3 a, b, c, d;
                switch (sd)
                {
                    case Dir.PX: a = new(x + 1 - e, y, z + 1); b = new(x + 1 - e, y + 1, z + 1); c = new(x + 1 - e, y + 1, z); d = new(x + 1 - e, y, z); break;
                    case Dir.NX: a = new(x + e, y, z); b = new(x + e, y + 1, z); c = new(x + e, y + 1, z + 1); d = new(x + e, y, z + 1); break;
                    case Dir.PZ: a = new(x, y, z + 1 - e); b = new(x, y + 1, z + 1 - e); c = new(x + 1, y + 1, z + 1 - e); d = new(x + 1, y, z + 1 - e); break;
                    default: a = new(x + 1, y, z + e); b = new(x + 1, y + 1, z + e); c = new(x, y + 1, z + e); d = new(x, y, z + e); break;
                }
                cu.Quad(a, b, c, d, new(0, 1), new(0, 0), new(1, 0), new(1, 1), info, col, col, col, col, false);
                break;
            }
            case RenderKind.Door:
            case RenderKind.Low:
            default:
            {
                if (def.Box is Aabb box)
                {
                    var target = def.Render == RenderKind.Low ? op : cu;
                    Box(target, def, x, y, z, box, pi, col, tint);
                }
                break;
            }
        }
    }

    private static void Cross(MeshBuffers mb, float cx, float y, float cz, float r, float ht, Vector2 info, Color col)
    {
        mb.Quad(new(cx - r, y, cz - r), new(cx - r, y + ht, cz - r), new(cx + r, y + ht, cz + r), new(cx + r, y, cz + r),
            new(0, 1), new(0, 0), new(1, 0), new(1, 1), info, col, col, col, col, false);
        mb.Quad(new(cx - r, y, cz + r), new(cx - r, y + ht, cz + r), new(cx + r, y + ht, cz - r), new(cx + r, y, cz - r),
            new(0, 1), new(0, 0), new(1, 0), new(1, 1), info, col, col, col, col, false);
    }

    /// <summary>An axis-aligned box inside a cell, textured per face. Faces flush with an opaque neighbour are skipped.</summary>
    private static void Box(MeshBuffers mb, BlockDef def, int x, int y, int z, Aabb box, int pi, Color col, int tint)
    {
        var p0 = box.Position;
        var p1 = box.End;
        float x0 = x + p0.X, x1 = x + p1.X, y0 = y + p0.Y, y1 = y + p1.Y, z0 = z + p0.Z, z1 = z + p1.Z;
        for (int d = 0; d < 6; d++)
        {
            bool flush = d switch
            {
                Dir.PX => p1.X >= 1f, Dir.NX => p0.X <= 0f, Dir.PY => p1.Y >= 1f, Dir.NY => p0.Y <= 0f,
                Dir.PZ => p1.Z >= 1f, _ => p0.Z <= 0f,
            };
            if (flush)
            {
                int off = d switch { Dir.PX => 1, Dir.NX => -1, Dir.PY => PP, Dir.NY => -PP, Dir.PZ => P, _ => -P };
                ushort nid = _pb[pi + off];
                if (_opq[nid]) continue;
                if (nid == def.Id && (d == Dir.PY || d == Dir.NY)) continue; // stacked cactus
            }
            int layer = def.Tex[d];
            int flags = d | (def.Emissive ? FlagEmissive : 0);
            var info = new Vector2(layer, flags);
            var c = col;
            // Texture coordinates follow the box's extent, so a thin panel shows a sliver.
            switch (d)
            {
                case Dir.PY:
                    mb.Quad(new(x0, y1, z0), new(x1, y1, z0), new(x1, y1, z1), new(x0, y1, z1),
                        new(p0.X, p0.Z), new(p1.X, p0.Z), new(p1.X, p1.Z), new(p0.X, p1.Z), info, c, c, c, c, false);
                    break;
                case Dir.NY:
                    mb.Quad(new(x0, y0, z0), new(x0, y0, z1), new(x1, y0, z1), new(x1, y0, z0),
                        new(p0.X, p0.Z), new(p0.X, p1.Z), new(p1.X, p1.Z), new(p1.X, p0.Z), info, c, c, c, c, false);
                    break;
                case Dir.PX:
                    mb.Quad(new(x1, y0, z0), new(x1, y0, z1), new(x1, y1, z1), new(x1, y1, z0),
                        new(1 - p0.Z, 1 - p0.Y), new(1 - p1.Z, 1 - p0.Y), new(1 - p1.Z, 1 - p1.Y), new(1 - p0.Z, 1 - p1.Y), info, c, c, c, c, false);
                    break;
                case Dir.NX:
                    mb.Quad(new(x0, y0, z0), new(x0, y1, z0), new(x0, y1, z1), new(x0, y0, z1),
                        new(p0.Z, 1 - p0.Y), new(p0.Z, 1 - p1.Y), new(p1.Z, 1 - p1.Y), new(p1.Z, 1 - p0.Y), info, c, c, c, c, false);
                    break;
                case Dir.PZ:
                    mb.Quad(new(x0, y0, z1), new(x0, y1, z1), new(x1, y1, z1), new(x1, y0, z1),
                        new(p0.X, 1 - p0.Y), new(p0.X, 1 - p1.Y), new(p1.X, 1 - p1.Y), new(p1.X, 1 - p0.Y), info, c, c, c, c, false);
                    break;
                default:
                    mb.Quad(new(x0, y0, z0), new(x1, y0, z0), new(x1, y1, z0), new(x0, y1, z0),
                        new(1 - p0.X, 1 - p0.Y), new(1 - p1.X, 1 - p0.Y), new(1 - p1.X, 1 - p1.Y), new(1 - p0.X, 1 - p1.Y), info, c, c, c, c, false);
                    break;
            }
        }
    }
}
