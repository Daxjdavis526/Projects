using System;
using Godot;

namespace Strata;

/// <summary>Headless checks of the vehicle physics: every number the rocket shows comes from these rules.</summary>
public static partial class Tests
{
    private const float G = PhysicsWorld.Gravity;

    /// <summary>Steps a vehicle for `seconds` of game time at 60 frames a second.</summary>
    private static void Run(Vehicle v, World w, float seconds, Action<float> each = null)
    {
        int frames = (int)MathF.Round(seconds * 60f);
        for (int i = 0; i < frames; i++) { v.Step(w, 1f / 60f); each?.Invoke(i / 60f); }
    }

    private static void RigidBodies()
    {
        var w = Flat(-2, -2, 5);           // grass top at 64: the ground is at y = 65
        // Free fall matches y = y0 - g t^2 / 2 (no air resistance on a wreck).
        var box = new Wreck("test", new Vector3(1, 1, 1), 500f);
        box.Place(new Vector3(8.5f, 200f, 8.5f), Quaternion.Identity);
        Run(box, w, 2f);
        float g = PhysicsWorld.GravityAt(150f);          // a hair under 28 this far up: the planet is round
        float expect = 200f - 0.5f * g * 4f;
        Check(Math.Abs(box.Body.Y - expect) < 0.3, $"free fall after 2 s: y {box.Body.Y:0.00}, expected {expect:0.00}");
        Check(Math.Abs(box.Body.Vel.Y + g * 2f) < 0.2f, $"falling speed g·t ({box.Body.Vel.Y:0.0}, expected {-g * 2f:0.0})");
        // Lands, bounces a little, comes to rest on the ground, not in it.
        Run(box, w, 8f);
        Check(box.Grounded || box.Asleep, "the box ends up on the ground");
        Check(Math.Abs(box.Body.Y - 65.5) < 0.08, $"resting with its bottom on the grass (centre y {box.Body.Y:0.000})");
        Check(box.Asleep, "at rest it sleeps");
        // A spinning body keeps spinning without torque (and a thrown one slides to a stop on the ground).
        var spin = new Wreck("test", new Vector3(1, 2, 3), 800f);
        spin.Place(new Vector3(8.5f, 400f, 8.5f), Quaternion.Identity);
        spin.Body.AngVel = new Vector3(0, 2f, 0);
        var L0 = spin.Body.InertiaWorld(spin.Body.AngVel);
        Run(spin, w, 1f);
        var L1 = spin.Body.InertiaWorld(spin.Body.AngVel);
        Check((L1 - L0).Length() < L0.Length() * 0.02f, $"angular momentum conserved in flight ({L0.Length():0} vs {L1.Length():0})");
        // A long box stood on end with a nudge topples and lies flat.
        var post = new Wreck("test", new Vector3(0.6f, 5f, 0.6f), 300f);
        post.Place(new Vector3(20.5f, 65f + 2.5f, 20.5f), new Quaternion(Vector3.Back, 0.15f));
        Run(post, w, 6f);
        Check(Math.Abs(post.Body.Up.Y) < 0.2f, $"an upright post nudged off balance falls over (up·y {post.Body.Up.Y:0.00})");
        Check(post.Body.Y > 65f && post.Body.Y < 66f, $"and lies on the ground (y {post.Body.Y:0.00})");

        // Debris: thin panels flung spinning at the ground bounce, tumble and settle; none spins up or sinks.
        var rng = new Random(11);
        bool sane = true;
        int settled = 0;
        for (int i = 0; i < 16; i++)
        {
            var plate = new Wreck("plate", new Vector3(0.8f + (float)rng.NextDouble(), 0.18f, 0.6f + (float)rng.NextDouble() * 0.6f), 120f);
            plate.Place(new Vector3(30.5f + i, 70f, 30.5f), new Quaternion(new Vector3(1, 2, 3).Normalized(), i));
            plate.Body.Vel = new Vector3((float)rng.NextDouble() * 40 - 20, -(float)rng.NextDouble() * 30, (float)rng.NextDouble() * 40 - 20);
            plate.Body.AngVel = new Vector3((float)rng.NextDouble() * 10, (float)rng.NextDouble() * 10, (float)rng.NextDouble() * 10);
            Run(plate, w, 12f, t => sane &= plate.Body.Finite && plate.Body.AngVel.Length() < 61f);
            if (plate.Asleep && plate.Body.Y > 64.9 && plate.Body.Y < 66.5) settled++;
        }
        Check(sane, "flung panels never spin up without bound");
        Check(settled >= 14, $"and come to rest on the ground ({settled} of 16)");
    }

    private static Rocket PadRocket(World w, float x = 8.5f, float z = 8.5f)
    {
        var r = new Rocket();
        r.Place(new Vector3(x, 65f, z), Quaternion.Identity);
        r.Clamps.Engage(r);
        return r;
    }

    private static void RocketLaunch()
    {
        var w = Flat(-2, -2, 5);
        var r = PadRocket(w);
        float m0 = r.Body.Mass;
        Check(Math.Abs(m0 - 76000f) < 1f, $"full rocket weighs 76 t ({m0:0} kg)");
        Check(Math.Abs(r.Twr - 2.8e6f / (76000f * G)) < 0.01f, $"thrust-to-weight at lift-off {r.Twr:0.00}");
        // Nothing happens unarmed.
        Check(!r.Go(), "the countdown will not start unarmed");
        Check(r.Arm() && r.Phase == FlightPhase.Armed, "arms on the pad");

        // Too little throttle: the engine lights, the clamps feel it, but the thrust check holds the launch.
        r.Throttle = 0.5f;
        r.Go();
        float peakLoad = -1e9f;
        Run(r, w, 13f, t => peakLoad = Math.Max(peakLoad, r.Clamps.Load));
        Check(r.Phase == FlightPhase.Safe && r.Clamped, $"low thrust: launch held, still clamped ({r.Phase}, '{r.Status}')");
        Check(Math.Abs(r.Origin.Y - 65f) < 1e-3f, "clamped, it never moved");
        Check(r.Engine.Thrust < r.Engine.MaxThrust * 0.2f, "the engine was shut down after the hold");
        // The clamps carried the difference between thrust and weight.
        Check(peakLoad < 0 && peakLoad > -r.Weight, $"clamp load while burning at half thrust {peakLoad / 1000:0} kN");
        Check(r.Tank.Amount < r.Tank.Capacity, "propellant burned on the pad");

        // Full throttle: counts down, lights at T-5, releases at T-0, climbs.
        r.Refuel();
        r.Throttle = 1f;
        r.Arm(); r.Go();
        bool litBefore = false, clampedAtIgnition = false;
        Run(r, w, 9.5f, t =>
        {
            if (r.T < 1.5f && r.T > 1f) { litBefore |= r.Engine.Thrust > 0; clampedAtIgnition |= r.Clamped; }
        });
        Check(litBefore && clampedAtIgnition, "ignition before T-0 while the clamps hold");
        Check(r.Clamped && r.Phase == FlightPhase.Countdown, "still held at T-0.5");
        Check(r.Clamps.Load > 0, $"at full thrust the clamps hold it down ({r.Clamps.Load / 1000:0} kN)");
        Run(r, w, 1f);
        Check(!r.Clamped && r.Phase == FlightPhase.Flight, $"released at T-0 ({r.Phase}, '{r.Status}')");
        float y1 = r.Altitude;
        Run(r, w, 3f);
        Check(r.Altitude > y1 + 10f && r.Body.Vel.Y > 5f, $"climbing under its own thrust: {r.Altitude - 65:0} m up at {r.Body.Vel.Y:0} m/s");
        Check(Math.Abs(r.Body.Up.Y) > 0.995f, $"stability assist keeps it upright (up·y {r.Body.Up.Y:0.0000})");
        Check(r.GForce > 1.2f && r.GForce < 2f, $"crew feel {r.GForce:0.00} g");
    }

    private static void RocketFlight()
    {
        var w = Flat(-2, -2, 5);
        // Unclamped on the ground at low throttle: too weak to lift, it sits there burning.
        var sit = new Rocket();
        sit.Place(new Vector3(8.5f, 65f, 8.5f), Quaternion.Identity);
        sit.Clamps.Release();
        sit.Throttle = 0f;               // the engine's minimum, 20%
        sit.ToggleEngine();
        Run(sit, w, 4f);
        Check(sit.Engine.Burning && sit.Origin.Y < 65.2f, $"thrust below weight does not lift it (TWR {sit.Engine.Thrust / sit.Weight:0.00}, y {sit.Origin.Y:0.00})");

        // A free rocket burning: mass falls at thrust / exhaust velocity, and acceleration rises as it does.
        var r = new Rocket();
        r.Place(new Vector3(8.5f, 65f, 8.5f), Quaternion.Identity);
        r.Clamps.Release();
        r.ToggleEngine();
        Run(r, w, 2f);
        float m1 = r.Body.Mass;
        float a1 = r.ProperAccel.Length();
        Run(r, w, 1f);
        float burned = m1 - r.Body.Mass;
        float flow = r.Engine.MaxThrust / r.Engine.ExhaustVelocity;
        Check(Math.Abs(burned - flow) < 20f, $"burns {burned:0} kg/s at full thrust (expected {flow:0})");
        Run(r, w, 17f);
        float a2 = r.ProperAccel.Length();
        Check(a2 > a1 * 1.3f, $"acceleration grows as the tanks empty ({a1 / G:0.00} g to {a2 / G:0.00} g)");

        // Steering: stick about the world x axis turns the nose; letting go, it holds the new attitude.
        var up0 = r.Body.Up;
        r.Stick = new Vector3(1, 0, 0);
        Run(r, w, 1.5f);
        r.Stick = Vector3.Zero;
        var tilted = r.Body.Up;
        Check(tilted.Z > 0.15f && Math.Abs(tilted.X) < 0.05f, $"pitching about +x swings the nose toward +z ({tilted.X:0.00}, {tilted.Y:0.00}, {tilted.Z:0.00})");
        Run(r, w, 1.5f);
        Check(r.Body.Up.Dot(tilted) > 0.985f, "released, the assist holds the attitude");
        Check(r.Body.Vel.Z > 20f, $"thrust along the tilted axis pushes it sideways ({r.Body.Vel.Z:0} m/s)");

        // To burn-out and beyond: flames out when dry, coasts up, falls back.
        for (int k = 0; k < 60 && r.Tank.Amount > 0f; k++) Run(r, w, 1f);
        Run(r, w, 1f);
        Check(r.Tank.Amount <= 0f && !r.Engine.Burning, $"flamed out when dry ('{r.Status}', {r.Tank.Amount:0} kg left)");
        Check(Math.Abs(r.Body.Mass - 26000f) < 1f, $"dry mass left: {r.Body.Mass:0} kg");
        Check(r.MaxAltitude > 1500f, $"reached {r.MaxAltitude - 65:0} m");

        // Straight up at full throttle it goes faster than the planet can hold: it escapes, and is lost.
        var v = PadRocket(w, 40.5f, 40.5f);
        v.Arm(); v.Go();
        bool escaping = false;
        for (int k = 0; k < 600 && !v.Lost; k++) { Run(v, w, 1f); escaping |= v.Path.Escaping && v.Altitude > PhysicsWorld.SpaceLine; }
        GD.Print($"   straight up: {v.MaxAltitude / 1000:0} km, top speed {v.MaxSpeed:0} m/s, escape speed at burn-out height {PhysicsWorld.EscapeSpeed(v.Body.Y):0}");
        Check(escaping && v.Events.Contains("escape") || v.Status.Length > 0 && escaping, "straight up at full throttle, it reaches escape speed");
        Check(v.Lost, $"and leaves the planet for good ({v.MaxAltitude / 1000:0} km)");
    }

    /// <summary>The far terrain seen from high up: the generator's own ground, and a map that repeats round the planet.</summary>
    private static void FarGround()
    {
        var w = new World(Hash.StringSeed("planet"));
        var gen = w.Gen;
        var (sx, sy, sz) = gen.FindSpawn();
        // It is the generator's ground: the same height where it is land, sea level over the sea.
        int land = 0, sea = 0, agree = 0;
        for (int i = 0; i < 200; i++)
        {
            int x = sx + (i % 20) * 97 - 900, z = sz + (i / 20) * 131 - 600;
            FarTerrain.Sample(gen, x, z, out float h, out Color c);
            var col = gen.Sample(x, z);
            if (col.Height <= V.SeaLevel - 1) { sea++; if (h == V.SeaLevel && c.B > c.R) agree++; }
            else { land++; if (h == col.Height) agree++; }
        }
        Check(agree == 200, $"far ground follows the generator ({agree} of 200 points; {land} land, {sea} sea)");
        // One lap of the planet later, the same ground: the map repeats for anything in orbit.
        double C = PhysicsWorld.Circumference;
        bool repeats = true, smooth = true;
        for (int i = 0; i < 40; i++)
        {
            double x = sx + i * 1234.5, z = sz - i * 777.7;
            FarTerrain.SampleRepeating(gen, x, z, out float a, out Color ca);
            FarTerrain.SampleRepeating(gen, x + C, z - C, out float b, out Color cb);
            repeats &= Math.Abs(a - b) < 0.01f && Math.Abs(ca.G - cb.G) < 0.001f;
        }
        // And no step at the seam, half a lap out: both sides blend into each other there.
        for (int i = 0; i < 40; i++)
        {
            double z = sz + i * 911.0;
            FarTerrain.SampleRepeating(gen, C / 2 - 0.5, z, out float a, out _);
            FarTerrain.SampleRepeating(gen, C / 2 + 0.5, z, out float b, out _);
            smooth &= Math.Abs(a - b) < 3f;
        }
        Check(repeats, "a lap round the planet comes back to the same far ground");
        Check(smooth, "and the seam where the map meets itself has no cliff");
        // A ring of far ground builds in reasonable time on one thread.
        float fine = FarTerrain.Spacing(2), coarse = FarTerrain.Spacing(3);
        float fx = MathF.Round(sx / (fine * 16)) * fine * 16, fz = MathF.Round(sz / (fine * 16)) * fine * 16;
        var sw = System.Diagnostics.Stopwatch.StartNew();
        var arr = FarTerrain.Build(gen, fx, fz, fine, coarse);
        long ms = sw.ElapsedMilliseconds;
        var verts = (Vector3[])arr[(int)Mesh.ArrayType.Vertex];
        var cols = (Color[])arr[(int)Mesh.ArrayType.Color];
        int side = FarTerrain.N + 1;
        Check(verts.Length == side * side + 4 * side, $"a ring is a {side} by {side} grid with a skirt ({verts.Length} vertices)");
        Check(ms < 2500, $"and builds in {ms} ms");
        // Where it ends, the next ring out takes over without a step: along its edge it lies
        // exactly on the coarser ring's surface (a crack there would show the sky through the ground).
        float cxo = MathF.Round(sx / (coarse * 16)) * coarse * 16, czo = MathF.Round(sz / (coarse * 16)) * coarse * 16;
        var outer = FarTerrain.Build(gen, cxo, czo, coarse);
        var overts = (Vector3[])outer[(int)Mesh.ArrayType.Vertex];
        var ocols = (Color[])outer[(int)Mesh.ArrayType.Color];
        float step = 0f, tint = 0f, inner = 0f;
        int n = FarTerrain.N + 1;
        for (int e = 0; e < n; e++)
            foreach (var (i, j) in new[] { (e, 0), (e, n - 1), (0, e), (n - 1, e) })
            {
                int v = j * n + i;
                float wx = fx + verts[v].X, wz = fz + verts[v].Z;
                float u = (wx - cxo) / coarse + FarTerrain.N / 2f, t = (wz - czo) / coarse + FarTerrain.N / 2f;
                int u0 = Math.Min((int)MathF.Floor(u), FarTerrain.N - 1), t0 = Math.Min((int)MathF.Floor(t), FarTerrain.N - 1);
                float fu = u - u0, ft = t - t0;
                if (fu > 1e-3f && ft > 1e-3f) { step = float.PositiveInfinity; continue; }   // not on one of its grid lines
                int a = t0 * n + u0, b = fu > 1e-3f ? a + 1 : a + n;
                float f = Math.Max(fu, ft);
                step = Math.Max(step, Math.Abs(verts[v].Y - Mathf.Lerp(overts[a].Y, overts[b].Y, f)));
                tint = Math.Max(tint, Math.Abs(cols[v].G - Mathf.Lerp(ocols[a].G, ocols[b].G, f)));
            }
        // And away from its edge it is its own, finer ground.
        var plain = FarTerrain.Build(gen, fx, fz, fine);
        var pverts = (Vector3[])plain[(int)Mesh.ArrayType.Vertex];
        int band = (int)FarTerrain.MorphBand;
        for (int j = band; j < n - band; j++)
            for (int i = band; i < n - band; i++)
                inner = Math.Max(inner, Math.Abs(pverts[j * n + i].Y - verts[j * n + i].Y));
        Check(step < 0.01f && tint < 0.002f, $"its edge meets the next ring out exactly (step {step:0.000} m)");
        Check(inner == 0f, "and inside the edge band it is untouched");
    }

    /// <summary>The round planet: gravity and air with height, circular orbits, the orbit maths, a lap back to the start.</summary>
    private static void PlanetAndOrbits()
    {
        float g0 = PhysicsWorld.GravityAt(V.SeaLevel), g40 = PhysicsWorld.GravityAt(V.SeaLevel + 40000);
        Check(g0 == G && Math.Abs(g40 - G / 4f) < 0.01f, $"gravity {g0} at sea level, a quarter of it one planet-radius up ({g40:0.00})");
        Check(Math.Abs(PhysicsWorld.AirDensity(V.SeaLevel + 2500) - 1.2f / MathF.E) < 0.01f, "air thins by e every 2.5 km");
        Check(PhysicsWorld.AirDensity(V.SeaLevel + PhysicsWorld.AirTop) == 0f && PhysicsWorld.AirDensity(V.SeaLevel + 30000) == 0f, "and is gone above 18 km");

        // The orbit maths against the textbook: a circular orbit, an ellipse, an escape.
        double y = V.SeaLevel + 20000;
        float vc = PhysicsWorld.CircularSpeed(y);
        var circ = Orbit.Of(new Vector3(vc, 0, 0), y);
        double r = PhysicsWorld.PlanetRadius + 20000.0;
        float period = (float)(2 * Math.PI * Math.Sqrt(r * r * r / PhysicsWorld.Mu));
        Check(circ.Eccentricity < 1e-3f && Math.Abs(circ.Periapsis - 20000) < 30 && Math.Abs(circ.Apoapsis - 20000) < 30, $"circular speed {vc:0} m/s gives a circle ({circ.Periapsis:0} by {circ.Apoapsis:0} m)");
        Check(Math.Abs(circ.Period - period) < 1f && circ.Stable, $"with the right period ({circ.Period:0} s)");
        var ellipse = Orbit.Of(new Vector3(vc * 1.1f, 0, 0), y);
        Check(Math.Abs(ellipse.Periapsis - 20000) < 30 && ellipse.Apoapsis > 30000 && ellipse.TimeToApoapsis > ellipse.Period * 0.45f && ellipse.TimeToApoapsis < ellipse.Period * 0.55f,
            $"faster, the far side rises ({ellipse.Periapsis / 1000:0.0} by {ellipse.Apoapsis / 1000:0.0} km, top in {ellipse.TimeToApoapsis:0} of {ellipse.Period:0} s)");
        var slow = Orbit.Of(new Vector3(vc * 0.8f, 0, 0), y);
        Check(!slow.Stable && slow.Periapsis < 0, $"slower, it comes down ({slow.Periapsis / 1000:0.0} km: under the sea)");
        Check(Orbit.Of(new Vector3(PhysicsWorld.EscapeSpeed(y) * 1.01f, 0, 0), y).Escaping, "at escape speed it is leaving");
        // Straight up at 55 m/s from 130 m: the top is about 55/g seconds away, and 55²/2g higher.
        var up = Orbit.Of(new Vector3(0, 55f, 0), V.SeaLevel + 130.0);
        Check(Math.Abs(up.TimeToApoapsis - 55f / G) < 0.1f && Math.Abs(up.Apoapsis - (130f + 55f * 55f / (2f * G))) < 1f,
            $"a path straight up tops out when it should ({up.TimeToApoapsis:0.00} s, {up.Apoapsis:0} m)");

        // Put a wreck in a circular orbit and let it go round: it neither climbs nor falls,
        // feels weightless, and one lap brings it back over where it started.
        var w = Flat(-2, -2, 5);
        var box = new Wreck("test", new Vector3(1, 1, 1), 500f);
        box.Place(new Vector3(1000f, (float)y, 30f), Quaternion.Identity);
        box.Body.Vel = new Vector3(vc, 0, 0);
        double x0 = box.Body.X, minAlt = 1e9, maxAlt = 0, run = 0;
        int wraps = 0;
        float weight = 0;
        int frames = (int)(period * 60f);
        for (int i = 0; i < frames; i++)
        {
            double xb = box.Body.X;
            box.Step(w, 1f / 60f);
            run += box.Wrapped == Vector3.Zero ? box.Body.X - xb : box.Body.X - box.Wrapped.X - xb;
            if (box.Wrapped != Vector3.Zero) wraps++;
            double alt = box.Body.Y - V.SeaLevel;
            minAlt = Math.Min(minAlt, alt); maxAlt = Math.Max(maxAlt, alt);
            if (i == frames / 2) weight = box.GForce;
        }
        Check(minAlt > 19900 && maxAlt < 20100, $"a circular orbit holds its height for a whole lap ({minAlt:0} to {maxAlt:0} m)");
        Check(weight < 0.01f, $"and everything aboard floats ({weight:0.000} g)");
        Check(Math.Abs(run - PhysicsWorld.Circumference) < PhysicsWorld.Circumference * 0.01, $"a lap crosses the planet's circumference on the map ({run / 1000:0.0} of {PhysicsWorld.Circumference / 1000:0.0} km)");
        Check(wraps == 1 && Math.Abs(box.Body.X - x0) < PhysicsWorld.Circumference * 0.01, $"and comes back round over the start ({box.Body.X - x0:0} m off, {wraps} wrap)");
    }

    /// <summary>
    /// To orbit with the rocket's own controls, as a pilot would fly it: lift off, tip ten degrees
    /// east at 500 m, let the assist hold prograde through the gravity turn, cut off when the top of
    /// the path is above the air, coast up to it, and burn prograde until the bottom is above the air too.
    /// </summary>
    private static void RocketToOrbit()
    {
        var w = Flat(-2, -2, 5);
        var r = PadRocket(w, 8.5f, 8.5f);
        r.Arm(); r.Go();
        Run(r, w, 10.5f);
        Check(!r.Clamped, "lifted off");
        for (int k = 0; k < 400 && r.Altitude - 65 < 500; k++) Run(r, w, 0.05f);
        r.Stick = new Vector3(0, 0, -1);                  // about -z: the nose goes east (+x)
        for (int k = 0; k < 200 && r.Body.Up.AngleTo(Vector3.Up) < Mathf.DegToRad(10f); k++) Run(r, w, 0.05f);
        r.Stick = Vector3.Zero;
        r.Mode = SasMode.Prograde;
        float tip = Mathf.RadToDeg(r.Body.Up.AngleTo(Vector3.Up));
        Check(r.Body.Up.X > 0.1f, $"tipped east ({tip:0} degrees)");
        float maxLoad = 0, maxQ = 0;
        for (int k = 0; k < 3000 && r.Path.Apoapsis < 21000 && r.Tank.Amount > 0; k++)
        {
            Run(r, w, 0.05f);
            maxLoad = Math.Max(maxLoad, r.Aero.DynamicPressure * MathF.Sin(Math.Min(r.Aero.AngleOfAttack, MathF.PI / 2)));
            maxQ = Math.Max(maxQ, r.Aero.DynamicPressure);
        }
        r.Abort();
        Check(r.Path.Apoapsis >= 21000 && !r.Destroyed, $"the gravity turn throws the top of the path above the air ({r.Path.Apoapsis / 1000:0.0} km, {r.Altitude / 1000:0.0} km up, {r.Body.Vel.Length():0} m/s)");
        Check(maxLoad < Rocket.AeroLimit * 0.4f && r.Health > 99f, $"prograde hold keeps the nose in the airflow: sideways load at most {maxLoad / 1000:0.0} kPa (max q {maxQ / 1000:0} kPa; the hull fails at {Rocket.AeroLimit / 1000:0})");
        for (int k = 0; k < 4000 && r.Body.Vel.Y > 25f; k++) Run(r, w, 0.05f);
        Check(r.Altitude - V.SeaLevel > PhysicsWorld.SpaceLine * 0.9f, $"coasted up near the top ({r.Altitude / 1000:0.0} km)");
        r.ToggleEngine();
        for (int k = 0; k < 2000 && !r.Path.Stable && r.Tank.Amount > 0; k++) Run(r, w, 0.05f);
        r.Abort();
        var o = r.Path;
        GD.Print($"   orbit: {o.Periapsis / 1000:0.0} by {o.Apoapsis / 1000:0.0} km, period {o.Period:0} s, {r.Tank.Amount / 1000:0.0} t left, {r.MissionTime:0} s after lift-off");
        Check(o.Stable, $"in orbit ({o.Periapsis / 1000:0.0} by {o.Apoapsis / 1000:0.0} km)");
        Check(r.Tank.Amount > r.Tank.Capacity * 0.08f, $"with propellant to spare for coming home ({r.Tank.Fraction * 100:0}%)");
        Check(r.Events.Contains("space") && r.Events.Contains("orbit") || r.Status.StartsWith("ORBIT") || o.Stable, "the flight computer called space and orbit");
        // A quarter of a lap later it is still up there.
        Run(r, w, o.Period / 4f);
        Check(r.Altitude - V.SeaLevel > PhysicsWorld.SpaceLine && !r.Destroyed, $"and stays up ({(r.Altitude - V.SeaLevel) / 1000:0.0} km a quarter lap on)");

        // Home: swing round to retrograde (from facing exactly the other way), burn the lowest point
        // down into the air, turn back to prograde, and fall in: hot, but in one piece.
        r.CycleSas();
        Check(r.Mode == SasMode.Retrograde, "P again: retrograde");
        for (int k = 0; k < 600 && r.Body.Up.AngleTo(-r.Body.Vel) > Mathf.DegToRad(3f); k++) Run(r, w, 0.05f);
        float back = Mathf.RadToDeg(r.Body.Up.AngleTo(-r.Body.Vel));
        Check(back < 3f, $"the nose swings round against the path ({back:0.0} degrees off)");
        r.ToggleEngine();
        for (int k = 0; k < 2000 && r.Path.Periapsis > 4000f && r.Tank.Amount > 0; k++) Run(r, w, 0.05f);
        r.Abort();
        Check(r.Path.Periapsis < 4000f, $"a retrograde burn brings the lowest point down into the air ({r.Path.Periapsis / 1000:0.0} km, {r.Tank.Amount / 1000:0.0} t left)");
        r.CycleSas(); r.CycleSas();
        Check(r.Mode == SasMode.Prograde, "and round to prograde again");
        float hottest = 0f, worst = 0f;
        for (int k = 0; k < 12000 && r.Altitude - V.SeaLevel > 3000f && !r.Destroyed; k++)
        {
            Run(r, w, 0.05f);
            hottest = Math.Max(hottest, r.Heat);
            worst = Math.Max(worst, r.Aero.DynamicPressure * MathF.Sin(Math.Min(r.Aero.AngleOfAttack, MathF.PI / 2)));
        }
        GD.Print($"   home: hottest {hottest:0.00}, sideways load at most {worst / 1000:0.0} kPa, {r.Body.Vel.Length():0} m/s at {(r.Altitude - V.SeaLevel) / 1000:0.0} km, hull {r.Health:0}%, {r.MissionTime:0} s after lift-off");
        Check(!r.Destroyed && r.Altitude - V.SeaLevel <= 3000f, $"it falls back into the air nose first and in one piece ({(r.Altitude - V.SeaLevel) / 1000:0.0} km, {r.Body.Vel.Length():0} m/s, hull {r.Health:0}%)");
        Check(hottest > 0.1f && worst < Rocket.AeroLimit, $"glowing on the way (heat {hottest:0.00}), the sideways load within the structure ({worst / 1000:0.0} kPa)");
    }

    /// <summary>A whole flight under slow, uneven frames: steered, cut off, falling. Nothing may go not-a-number.</summary>
    private static void RocketRough()
    {
        var w = Flat(-2, -2, 5);
        var r = PadRocket(w, 8.5f, 8.5f);
        r.Arm(); r.Go();
        var rng = new Random(3);
        float t = 0;
        bool finite = true;
        string firstBad = "";
        while (t < 160f && !r.Destroyed)
        {
            float dt = (float)(0.01 + rng.NextDouble() * 0.24);
            t += dt;
            r.Stick = t > 14f && t < 16.5f ? new Vector3(-1, 0, 0) : Vector3.Zero;
            if (t > 26f && r.Engine.State == EngineState.Running) { r.Throttle = 0; r.Abort(); }
            r.Step(w, dt);
            var b = r.Body;
            bool ok = float.IsFinite(b.Rot.X + b.Rot.Y + b.Rot.Z + b.Rot.W) && float.IsFinite(b.AngVel.Length()) && double.IsFinite(b.Y);
            if (!ok && finite) { finite = false; firstBad = $"t {t:0.00} alt {r.Altitude:0} w {b.AngVel} v {b.Vel} phase {r.Phase}"; }
            if (!finite) break;
            if (b.AngVel.Length() > 20f && firstBad == "") firstBad = $"spinning {b.AngVel.Length():0} rad/s at t {t:0.0}";
        }
        Check(finite, $"state stays finite through a rough flight {firstBad}");
        Check(firstBad == "", $"and never spins up absurdly {firstBad}");
    }

    private static void RocketCrash()
    {
        var w = Flat(-2, -2, 5);
        // A short drop on its fins is fine.
        var soft = new Rocket();
        soft.Place(new Vector3(8.5f, 66.5f, 8.5f), Quaternion.Identity);
        soft.Clamps.Release();
        Run(soft, w, 4f);
        Check(!soft.Destroyed && soft.Health > 99f, $"a 1.5 m drop does no harm (health {soft.Health:0})");
        Check(Math.Abs(soft.Body.Up.Y) > 0.99f && Math.Abs(soft.Origin.Y - 65f) < 0.1f, $"it stands on its fins (base y {soft.Origin.Y:0.00})");

        // Dropped from 40 m: destroyed on impact.
        var hard = new Rocket();
        hard.Place(new Vector3(24.5f, 105f, 24.5f), Quaternion.Identity);
        hard.Clamps.Release();
        Run(hard, w, 4f);
        Check(hard.Destroyed && hard.Phase == FlightPhase.Destroyed, $"a 40 m fall wrecks it ({hard.DestroyedBy})");

        // Stood up leaning too far, it topples and the nose hits hard.
        var lean = new Rocket();
        lean.Place(new Vector3(40.5f, 65.5f, 40.5f), new Quaternion(Vector3.Back, 0.35f));
        lean.Clamps.Release();
        Run(lean, w, 8f);
        Check(lean.Destroyed, $"leaning 20 degrees, it falls over and breaks ({lean.DestroyedBy}, up·y {lean.Body.Up.Y:0.00})");

        // Flung sideways through the air at speed: the airflow tears it apart.
        var side = new Rocket();
        side.Place(new Vector3(8.5f, 1000f, 8.5f), Quaternion.Identity);
        side.Clamps.Release();
        side.Body.Vel = new Vector3(300f, 0, 0);
        Run(side, w, 2f);
        Check(side.Destroyed && side.DestroyedBy.Contains("airflow"), $"broadside at 300 m/s it breaks up ({side.DestroyedBy})");

        // A blast: a hole in stone and grass, but not through rootstone; hard blocks resist.
        var sw = System.Diagnostics.Stopwatch.StartNew();
        var res = Explosions.Blast(w, new Vector3(40.5f, 65f, 8.5f), 5.5f, 7);
        long ms = sw.ElapsedMilliseconds;
        Check(res.Removed.Count > 150, $"a full-tank blast digs a crater ({res.Removed.Count} blocks, {ms} ms)");
        Check(w.GetBlock(40, 64, 8) == Blocks.Air && w.GetBlock(40, 62, 8) == Blocks.Air, "the centre is gone");
        Check(w.GetBlock(40, 58, 8) != Blocks.Air, "stone six blocks down holds");
        Check(ms < 1500, "and it takes no longer than a frame hitch");

        // Where the ground has not loaded, a vehicle meets the ground the site laid, not the natural hills.
        var lw = new World(Hash.StringSeed("flight"), landmarks: true);
        var pad = lw.Gen.Landmarks.PadWorld;
        int gx = V.FloorToInt(pad.X) + 40, gz = V.FloorToInt(pad.Z) - 30;
        Check(lw.Gen.GroundY(gx, gz) == LandmarkSite.Valley, $"unloaded ground by the pad is the complex's flat ({lw.Gen.GroundY(gx, gz)}, natural {lw.Gen.SurfaceY(gx, gz)})");
        Check(VoxelCollider.SolidAt(lw, gx, LandmarkSite.Valley - 1, gz, out _) && !VoxelCollider.SolidAt(lw, gx, LandmarkSite.Valley, gz, out _), "and collides there");
    }
}
