using System;
using System.Threading.Tasks;
using Godot;

namespace Strata;

/// <summary>
/// The rest of the world as seen from high up: terrain out to the horizon,
/// drawn coarsely from the world generator itself (heights, water, biome
/// colours, forest cover, snow) and bent onto the planet (see
/// planet.gdshader), so from a rocket the ground curves away into a limb of
/// blue haze. Five nested square rings, each four times coarser than the one
/// inside it (8 m to 2 km between samples), follow the camera; each hides
/// itself inside the next finer ring, and all of them hide wherever real
/// block columns are loaded, so the far terrain only ever fills in around
/// the world you can walk on. Each point of a ring stands for the cell round
/// it (the ground averaged across it, see <see cref="Footprint"/>), and
/// toward its edge a ring turns into the next one out, so there is no step
/// or crack where one gives way to the other. Rings are sampled on worker
/// threads and swapped in when ready. Near the ground the ordinary fog hides
/// all of it.
///
/// For anything in orbit the map repeats every lap of the planet (see
/// <see cref="PhysicsWorld.WrapShift"/>), so the far terrain is drawn as if
/// it repeated too: within 12 km of the seam, 125 km from the world's
/// origin, the two sides are blended into each other. Nowhere else does it
/// differ from the ground the generator makes, but for that averaging.
/// </summary>
public sealed partial class FarTerrain : Node3D
{
    public const int N = 128;                                  // cells along a ring's side
    public const int Levels = 5;
    public const double SeamBand = 12000.0;
    public const float MorphBand = 24f;                         // cells at a ring's edge over which it turns into the next ring out
    public static float Spacing(int k) => 8f * MathF.Pow(4f, k);

    public World World;
    public ChunkManager Chunks;
    public bool AnyReady { get; private set; }
    /// <summary>Every ring that should be on show is built and none is being rebuilt.</summary>
    public bool Settled
    {
        get
        {
            bool any = false;
            foreach (var r in _rings) { if (r.Job != null) return false; any |= r.Shown; }
            return any;
        }
    }
    public int Generated { get; private set; }                 // rings built so far (diagnostics)

    private sealed class Ring
    {
        public int K;
        public float S;
        public MeshInstance3D Node;
        public ShaderMaterial Mat;
        public bool Ready, Shown;
        public Vector2 Centre;                                 // of what is displayed
        public Task<Godot.Collections.Array> Job;
        public Vector2 JobCentre;
        public int JobStamp;
    }

    private readonly Ring[] _rings = new Ring[Levels];
    private Image _maskImg;
    private ImageTexture _mask;
    private float _maskTimer;
    private Vector2 _maskOrigin;
    private int _stamp;
    private static Shader _shader;

    public override void _Ready()
    {
        _shader ??= GD.Load<Shader>("res://shaders/planet.gdshader");
        _maskImg = Image.CreateEmpty(64, 64, false, Image.Format.L8);
        _mask = ImageTexture.CreateFromImage(_maskImg);
        for (int k = 0; k < Levels; k++)
        {
            var mat = new ShaderMaterial { Shader = _shader, RenderPriority = -10 };
            mat.SetShaderParameter("loaded_mask", _mask);
            var node = new MeshInstance3D
            {
                Name = "Far" + k, MaterialOverride = mat, Visible = false,
                CastShadow = GeometryInstance3D.ShadowCastingSetting.Off,
                GIMode = GeometryInstance3D.GIModeEnum.Disabled,
                ExtraCullMargin = 200000f,
            };
            AddChild(node);
            _rings[k] = new Ring { K = k, S = Spacing(k), Node = node, Mat = mat };
        }
    }

    /// <summary>
    /// The finest ring worth drawing from this height above the ground: the
    /// one whose cells, straight below, are a few pixels across.
    /// </summary>
    public static int FinestFor(float agl) => agl < 1000f ? 0 : agl < 4000f ? 1 : agl < 16000f ? 2 : agl < 64000f ? 3 : 4;

    /// <summary>Per frame: rings follow the camera; finished ones go on show; holes are cut where finer detail exists.</summary>
    public void Step(Vector3 cam, float agl, float lift, float dt)
    {
        bool want = lift > 0.004f;
        int finest = FinestFor(agl);
        for (int k = 0; k < Levels; k++)
        {
            var r = _rings[k];
            // Collect a finished ring.
            if (r.Job != null && r.Job.IsCompleted)
            {
                var job = r.Job;
                r.Job = null;
                if (job.Status == TaskStatus.RanToCompletion && job.Result != null && r.JobStamp == _stamp)
                {
                    // The arrays were made on a worker; the mesh itself is made here, on the main thread.
                    var mesh = new ArrayMesh();
                    mesh.AddSurfaceFromArrays(Mesh.PrimitiveType.Triangles, job.Result);
                    r.Node.Mesh = mesh;
                    r.Centre = r.JobCentre;
                    r.Node.Position = new Vector3(r.Centre.X, 0f, r.Centre.Y);
                    r.Ready = true;
                    Generated++;
                }
            }
            bool active = want && k >= finest;
            if (active && r.Job == null)
            {
                float step = r.S * 16f;                        // (a multiple of the next ring's spacing, so the edges line up with it)
                var centre = new Vector2(MathF.Round(cam.X / step) * step, MathF.Round(cam.Z / step) * step);
                if (!r.Ready || centre != r.Centre) Start(r, centre);
            }
            r.Shown = active && r.Ready;
            r.Node.Visible = r.Shown;
        }
        AnyReady = false;
        // Each ring hides inside the nearest finer ring that is on show.
        for (int k = 0; k < Levels; k++)
        {
            var r = _rings[k];
            if (!r.Shown) continue;
            AnyReady = true;
            var inner = new Vector4(0, 0, 0, 0);
            for (int j = k - 1; j >= 0; j--)
                if (_rings[j].Shown) { inner = new Vector4(_rings[j].Centre.X, _rings[j].Centre.Y, _rings[j].S * N / 2f, 1f); break; }
            r.Mat.SetShaderParameter("inner_rect", inner);
        }
        if (want) UpdateMask(cam, dt);
    }

    /// <summary>Which block columns are loaded and drawn, round the camera: the far terrain stays out of them.</summary>
    private void UpdateMask(Vector3 cam, float dt)
    {
        _maskTimer -= dt;
        if (_maskTimer > 0f || Chunks == null) return;
        _maskTimer = 0.2f;
        int cx0 = (V.FloorToInt(cam.X) >> V.Shift) - 32, cz0 = (V.FloorToInt(cam.Z) >> V.Shift) - 32;
        for (int z = 0; z < 64; z++)
            for (int x = 0; x < 64; x++)
                _maskImg.SetPixel(x, z, Chunks.Shown(cx0 + x, cz0 + z) ? Colors.White : Colors.Black);
        _mask.Update(_maskImg);
        _maskOrigin = new Vector2(cx0 * 16, cz0 * 16);
        var rect = new Vector4(_maskOrigin.X, _maskOrigin.Y, 64 * 16, 1f);
        foreach (var r in _rings) r.Mat.SetShaderParameter("mask_rect", rect);
    }

    /// <summary>The camera came round the planet: everything shown moves with it (it repeats, so it looks the same).</summary>
    public void Shift(Vector3 by)
    {
        var d = new Vector2(by.X, by.Z);
        foreach (var r in _rings)
        {
            r.Centre += d;
            r.JobCentre += d;
            r.Node.Position += new Vector3(by.X, 0, by.Z);
        }
        _maskTimer = 0f;
    }

    /// <summary>Throws away everything (a different world, or a jump across it).</summary>
    public void Reset()
    {
        _stamp++;
        foreach (var r in _rings) { r.Ready = false; r.Shown = false; r.Node.Visible = false; }
    }

    private void Start(Ring r, Vector2 centre)
    {
        r.JobCentre = centre;
        r.JobStamp = _stamp;
        var gen = World.Gen;
        float s = r.S, outer = r.K < Levels - 1 ? Spacing(r.K + 1) : 0f;
        r.Job = Task.Run(() => Build(gen, centre.X, centre.Y, s, outer));
    }

    // --- building a ring -------------------------------------------------------------------------

    /// <summary>
    /// A ring's mesh: an (N+1)² grid of samples round a centre, positions
    /// relative to it, with colours and slope normals, and a skirt hanging
    /// from its edge so no crack shows where it meets its neighbours.
    /// <paramref name="outer"/> is the spacing of the next coarser ring (0 for
    /// none): toward its edge this ring turns into that one, so where it stops
    /// and that one takes over there is no step and no seam of colour. At the
    /// very edge its heights, colours and normals are the coarser ring's own,
    /// interpolated between that ring's samples just as its triangles will be.
    /// </summary>
    public static Godot.Collections.Array Build(WorldGen gen, float cx, float cz, float s, float outer = 0f)
    {
        int n = N + 1, m = N + 3;                              // samples, and samples with a border for the normals
        var h = new float[m * m];
        var col = new Color[m * m];
        float half = N / 2f * s;
        int sub = SubSamples(s);
        for (int j = 0; j < m; j++)
            for (int i = 0; i < m; i++)
            {
                double x = cx - half + (i - 1) * s, z = cz - half + (j - 1) * s;
                Footprint(gen, x, z, s, sub, out h[j * m + i], out col[j * m + i]);
            }
        // The coarser ring's samples over this one (with a border for its normals).
        int cn = 0;
        float[] ch = null;
        Color[] ccol = null;
        Vector3[] cnrm = null;
        if (outer > 0f)
        {
            cn = (int)MathF.Round(2f * half / outer) + 3;
            ch = new float[cn * cn];
            ccol = new Color[cn * cn];
            cnrm = new Vector3[cn * cn];
            int csub = SubSamples(outer);
            for (int j = 0; j < cn; j++)
                for (int i = 0; i < cn; i++)
                    Footprint(gen, cx - half + (i - 1) * (double)outer, cz - half + (j - 1) * (double)outer, outer, csub, out ch[j * cn + i], out ccol[j * cn + i]);
            for (int j = 1; j < cn - 1; j++)
                for (int i = 1; i < cn - 1; i++)
                {
                    int a = j * cn + i;
                    cnrm[a] = new Vector3(-(ch[a + 1] - ch[a - 1]), 2f * outer, -(ch[a + cn] - ch[a - cn])).Normalized();
                }
        }
        int count = n * n + 4 * n;
        var verts = new Vector3[count];
        var cols = new Color[count];
        var norms = new Vector3[count];
        for (int j = 0; j < n; j++)
            for (int i = 0; i < n; i++)
            {
                int a = (j + 1) * m + (i + 1);
                float hx = h[a + 1] - h[a - 1], hz = h[a + m] - h[a - m];
                var nrm = new Vector3(-hx, 2f * s, -hz).Normalized();
                float y = h[a];
                var c = col[a];
                float w = outer > 0f ? 1f - Smooth.Step(0f, MorphBand, Math.Min(Math.Min(i, N - i), Math.Min(j, N - j))) : 0f;
                if (w > 0f)
                {
                    // Where this point lies among the coarser ring's samples, and what they make there.
                    float u = i * s / outer + 1f, v = j * s / outer + 1f;
                    int i0 = Math.Clamp((int)MathF.Floor(u), 1, cn - 3), j0 = Math.Clamp((int)MathF.Floor(v), 1, cn - 3);
                    float fu = Math.Clamp(u - i0, 0f, 1f), fv = Math.Clamp(v - j0, 0f, 1f);
                    int c00 = j0 * cn + i0, c10 = c00 + 1, c01 = c00 + cn, c11 = c01 + 1;
                    float w00 = (1 - fu) * (1 - fv), w10 = fu * (1 - fv), w01 = (1 - fu) * fv, w11 = fu * fv;
                    float yc = ch[c00] * w00 + ch[c10] * w10 + ch[c01] * w01 + ch[c11] * w11;
                    var cc = ccol[c00] * w00 + ccol[c10] * w10 + ccol[c01] * w01 + ccol[c11] * w11;
                    var nc = cnrm[c00] * w00 + cnrm[c10] * w10 + cnrm[c01] * w01 + cnrm[c11] * w11;
                    y = Mathf.Lerp(y, yc, w);
                    c = c.Lerp(new Color(cc.R, cc.G, cc.B, 1f), w);
                    nrm = nrm.Lerp(nc, w).Normalized();
                }
                int vi = j * n + i;
                verts[vi] = new Vector3(-half + i * s, y, -half + j * s);
                cols[vi] = c;
                norms[vi] = nrm;
            }
        // The skirt: the edge again, dropped well below.
        float drop = s * 1.5f + 30f;
        int k = n * n;
        int[] edge = new int[4 * n];
        for (int e = 0; e < n; e++)
        {
            edge[e] = e;                                       // north edge, west to east
            edge[n + e] = (n - 1) * n + e;                     // south edge
            edge[2 * n + e] = e * n;                           // west edge
            edge[3 * n + e] = e * n + (n - 1);                 // east edge
        }
        for (int e = 0; e < edge.Length; e++)
        {
            int src = edge[e];
            verts[k + e] = verts[src] - new Vector3(0, drop, 0);
            cols[k + e] = cols[src];
            norms[k + e] = norms[src];
        }
        var idx = new System.Collections.Generic.List<int>(N * N * 6 + 4 * N * 6);
        for (int j = 0; j < N; j++)
            for (int i = 0; i < N; i++)
            {
                int a = j * n + i, b = a + 1, c = a + n, d = c + 1;
                idx.Add(a); idx.Add(b); idx.Add(d);
                idx.Add(a); idx.Add(d); idx.Add(c);
            }
        for (int side = 0; side < 4; side++)
            for (int e = 0; e < N; e++)
            {
                int t0 = edge[side * n + e], t1 = edge[side * n + e + 1];
                int b0 = k + side * n + e, b1 = b0 + 1;
                idx.Add(t0); idx.Add(t1); idx.Add(b1);
                idx.Add(t0); idx.Add(b1); idx.Add(b0);
            }
        var arr = new Godot.Collections.Array();
        arr.Resize((int)Mesh.ArrayType.Max);
        arr[(int)Mesh.ArrayType.Vertex] = verts;
        arr[(int)Mesh.ArrayType.Normal] = norms;
        arr[(int)Mesh.ArrayType.Color] = cols;
        arr[(int)Mesh.ArrayType.Index] = idx.ToArray();
        return arr;
    }

    /// <summary>How many samples a side each grid point of a ring averages: more where a cell covers more ground.</summary>
    public static int SubSamples(float s) => s <= 8f ? 1 : s <= 32f ? 2 : 3;

    /// <summary>
    /// The ground a grid point stands for: height and colour averaged over the
    /// square of side <paramref name="s"/> round it, sub by sub samples, one
    /// in each part of the square at a fixed random place within it. Read at a
    /// single point instead, a river or a pond or a clearing would colour a
    /// whole cell a kilometre across, and from high up the planet would be a
    /// mottle of specks; and a regular grid of samples beats against the
    /// generator's own patterns in diamonds.
    /// </summary>
    public static void Footprint(WorldGen gen, double x, double z, float s, int sub, out float height, out Color colour)
    {
        double cell = s / (double)sub, x0 = x - s / 2.0, z0 = z - s / 2.0;
        long kx = (long)Math.Floor(x), kz = (long)Math.Floor(z);
        float hSum = 0f, r = 0f, g = 0f, b = 0f;
        for (int v = 0; v < sub; v++)
            for (int u = 0; u < sub; u++)
            {
                int salt = v * sub + u;
                double px = x0 + (u + Jitter(kx, kz, salt * 2)) * cell, pz = z0 + (v + Jitter(kx, kz, salt * 2 + 1)) * cell;
                SampleRepeating(gen, px, pz, out float hh, out Color cc);
                hSum += hh; r += cc.R; g += cc.G; b += cc.B;
            }
        float inv = 1f / (sub * sub);
        height = hSum * inv;
        colour = new Color(r * inv, g * inv, b * inv, 1f);
    }

    /// <summary>A fixed pseudo-random number in [0, 1) for a map point and a salt.</summary>
    private static double Jitter(long x, long z, int salt)
    {
        ulong h = (ulong)(x * 73856093L) ^ (ulong)(z * 19349663L) ^ (ulong)((salt + 1) * 83492791L);
        h ^= h >> 33; h *= 0xff51afd7ed558ccdUL; h ^= h >> 33; h *= 0xc4ceb9fe1a85ec53UL; h ^= h >> 33;
        return (h & 0xFFFFFF) / 16777216.0;
    }

    /// <summary>
    /// Height and colour of the ground at a map point, as if the map repeated
    /// every lap of the planet: brought into the lap round the origin, and
    /// blended with the far side of the seam within <see cref="SeamBand"/> of it.
    /// </summary>
    public static void SampleRepeating(WorldGen gen, double x, double z, out float height, out Color colour)
    {
        double C = PhysicsWorld.Circumference, half = C / 2;
        x = Wrap(x, C); z = Wrap(z, C);
        float tx = Seam(x, half), tz = Seam(z, half);
        double x2 = x - Math.Sign(x) * C, z2 = z - Math.Sign(z) * C;
        float hSum = 0f;
        var cSum = new Color(0, 0, 0, 0);
        void Add(double sx, double sz, float wgt)
        {
            if (wgt <= 0f) return;
            Sample(gen, (int)Math.Floor(sx), (int)Math.Floor(sz), out float hh, out Color cc);
            hSum += hh * wgt;
            cSum += cc * wgt;
        }
        Add(x, z, (1f - tx) * (1f - tz));
        Add(x2, z, tx * (1f - tz));
        Add(x, z2, (1f - tx) * tz);
        Add(x2, z2, tx * tz);
        height = hSum;
        colour = new Color(cSum.R, cSum.G, cSum.B, 1f);
    }

    private static double Wrap(double u, double c) => u - Math.Floor((u + c / 2) / c) * c;
    private static float Seam(double u, double half) => 0.5f * Smooth.Step((float)(half - SeamBand), (float)half, (float)Math.Abs(u));

    /// <summary>The surface at one column: height of its top (water level over the sea) and its colour from above.</summary>
    public static void Sample(WorldGen gen, int x, int z, out float height, out Color colour)
    {
        var c = gen.Sample(x, z);
        int ground = gen.Landmarks?.GroundAt(x, z, c.Height) ?? c.Height;      // first air
        var info = Biomes.Get(c.Biome);
        if (ground <= V.SeaLevel - 1)
        {
            // Water: deeper, darker; frozen seas white.
            float depth = V.SeaLevel - ground;
            height = V.SeaLevel;
            colour = c.Biome == Biome.FrozenSea
                ? new Color(0.8f, 0.86f, 0.93f)
                : new Color(0.2f, 0.45f, 0.6f).Lerp(new Color(0.06f, 0.15f, 0.34f), Smooth.Step(0f, 26f, depth));
            return;
        }
        height = ground;
        ushort top = info.Top;
        Color col;
        ushort grass = gen.TintAt(x, z, out ushort foliage);
        if (top == Blocks.Grass || top == Blocks.ForestFloor) col = Unpack15(grass) * (top == Blocks.Grass ? 0.86f : 0.62f);
        else col = Blocks.Get(top).Particle;
        // Trees cover the ground: seen from above, a forest is the colour of its leaves, and darker.
        float trees = Math.Clamp(info.TreeDensity * 1.8f, 0f, 0.85f);
        if (trees > 0f) col = col.Lerp(Unpack15(foliage) * 0.5f, trees);
        // Snow on the high peaks.
        if (c.Biome == Biome.Peaks) col = col.Lerp(new Color(0.93f, 0.95f, 0.98f), Smooth.Step(138f, 168f, ground));
        // The castle's dead land is grey.
        if (gen.Landmarks is LandmarkSite site)
        {
            float gl = site.Gloom(x - site.Ox, z - site.Oz) * site.Weight(x - site.Ox, z - site.Oz);
            if (gl > 0f) col = col.Lerp(new Color(0.3f, 0.29f, 0.3f), gl * 0.8f);
        }
        colour = new Color(col.R, col.G, col.B, 1f);
    }

    private static Color Unpack15(ushort p) => new((p & 31) / 31f, ((p >> 5) & 31) / 31f, ((p >> 10) & 31) / 31f);
}
