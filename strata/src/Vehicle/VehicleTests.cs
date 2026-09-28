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
        float expect = 200f - 0.5f * G * 4f;
        Check(Math.Abs(box.Body.Y - expect) < 0.3, $"free fall after 2 s: y {box.Body.Y:0.00}, expected {expect:0.00}");
        Check(Math.Abs(box.Body.Vel.Y + G * 2f) < 0.2f, $"falling speed g·t ({box.Body.Vel.Y:0.0})");
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
        Check(Math.Abs(m0 - 58000f) < 1f, $"full rocket weighs 58 t ({m0:0} kg)");
        Check(Math.Abs(r.Twr - 2.1e6f / (58000f * G)) < 0.01f, $"thrust-to-weight at lift-off {r.Twr:0.00}");
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
        sit.Throttle = 0f;               // the engine's minimum, 30%
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
        Check(Math.Abs(burned - 2.1e6f / 1300f) < 20f, $"burns {burned:0} kg/s at full thrust (expected {2.1e6f / 1300f:0})");
        Run(r, w, 8f);
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
        Run(r, w, 12f);
        Check(r.Tank.Amount <= 0f && !r.Engine.Burning, $"flamed out when dry ('{r.Status}', {r.Tank.Amount:0} kg left)");
        Check(Math.Abs(r.Body.Mass - 26000f) < 1f, $"dry mass left: {r.Body.Mass:0} kg");
        Check(r.MaxAltitude > 1500f, $"reached {r.MaxAltitude - 65:0} m");

        // Straight up at full throttle, the apex matches the design figure (drag and thinning air included).
        var v = PadRocket(w, 40.5f, 40.5f);
        v.Arm(); v.Go();
        Run(v, w, 90f);
        GD.Print($"   vertical flight: apex {v.MaxAltitude - 65:0} m, top speed {v.MaxSpeed:0} m/s, {v.DestroyedBy}");
        Check(v.MaxAltitude > 4500f && v.MaxAltitude < 7000f, $"vertical flight apex {v.MaxAltitude - 65:0} m (design ~5500)");
        Check(v.Destroyed, $"and what goes up without a landing burn comes down hard ({v.DestroyedBy})");
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
        side.Place(new Vector3(8.5f, 3000f, 8.5f), Quaternion.Identity);
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
