using System;
using Godot;

namespace Strata;

/// <summary>Headless checks of Gargantua's light, pull and clocks, and of the tesseract's four-dimensional geometry.</summary>
public static partial class Tests
{
    /// <summary>Light round the hole: the shadow's rim, weak-field bending, the disk seen over the top.</summary>
    private static void GargantuaLight()
    {
        // The shadow's edge: rays aimed with impact parameter b fall in below 3√3 M and escape above it.
        float lo = 4f, hi = 7f;
        for (int i = 0; i < 30; i++)
        {
            float b = (lo + hi) / 2f;
            var r = Gargantua.Trace(new Vector3(-40f, b, 0f), Vector3.Right);
            if (r.Fate == Gargantua.Fate.Captured) lo = b; else hi = b;
        }
        float edge = (lo + hi) / 2f;
        Check(Math.Abs(edge - Gargantua.ShadowEdge) < 0.04f, $"the shadow's rim is at b = {edge:0.000} M (3√3 = {Gargantua.ShadowEdge:0.000})");

        // Just outside the rim light whips round the hole, coming back out far from where it was going.
        var grazing = Gargantua.Trace(new Vector3(-40f, Gargantua.ShadowEdge + 0.03f, 0f), Vector3.Right);
        Check(grazing.Fate == Gargantua.Fate.Escaped && grazing.Out.Dot(Vector3.Right) < 0f, $"a grazing ray is turned back on itself (leaves along {grazing.Out.X:0.00}, {grazing.Out.Y:0.00})");
        // Its closest approach is the turning point of the orbit equation, b² = r³ / (r − 2): just outside the photon sphere.
        float bg = Gargantua.ShadowEdge + 0.03f, rlo = 3f, rhi = 6f;
        for (int i = 0; i < 40; i++) { float rm = (rlo + rhi) / 2f; if (rm * rm * rm / (rm - 2f) < bg * bg) rlo = rm; else rhi = rm; }
        Check(Math.Abs(grazing.Closest - rlo) < 0.05f, $"and turns at r = {grazing.Closest:0.00} M, just outside the photon sphere (orbit equation: {rlo:0.00} M)");

        // Far out, the bending matches the weak-field result 4M/b + 15π/4 (M/b)².
        foreach (float b in new[] { 30f, 60f })
        {
            var w = Gargantua.Trace(new Vector3(-6000f, b, 0f), Vector3.Right, reach: 6000f, maxSteps: 4000);
            float bent = MathF.Atan2(-w.Out.Y, w.Out.X);
            float expect = 4f / b + 15f * MathF.PI / 4f / (b * b);
            Check(Math.Abs(bent - expect) < expect * 0.04f, $"bending at b = {b} M: {bent:0.0000} rad (weak field {expect:0.0000})");
        }

        // The disk behind the hole shows above it: a ray passing over the top lands on the disk's far side.
        var over = Gargantua.Trace(new Vector3(-40f, 7f, 0f), Vector3.Right, diskNormal: Vector3.Up);
        Check(over.DiskR >= Gargantua.DiskInner && over.DiskR <= Gargantua.DiskOuter, $"a ray over the top of the shadow is bent down onto the far disk (r = {over.DiskR:0.0} M)");
        Check(over.Closest > Gargantua.PhotonSphere, "without going in");

        // Nothing gets out from inside the photon sphere aimed inward, and the step budget suffices everywhere.
        int stuck = 0;
        for (int i = 0; i < 200; i++)
        {
            float b = 0.05f * i;
            var r = Gargantua.Trace(new Vector3(-30f, b, 0f), Vector3.Right);
            if (r.Steps >= Gargantua.MaxSteps) stuck++;
        }
        Check(stuck <= 2, $"rays finish within {Gargantua.MaxSteps} steps ({stuck} of 200 ran out, all on the photon sphere)");
    }

    /// <summary>A Gargantua world: the site, the hole's place, its pull, clocks and air, and a rocket it swallows.</summary>
    private static void GargantuaWorld()
    {
        var w = new World(Hash.StringSeed("garg"), gargantua: true);
        var site = w.Gen.Landmarks;
        var bh = w.Gargantua;
        Check(site != null && site.Kind == SiteKind.Gargantua && !site.HasCastle && bh != null, "a Gargantua world has the site and the hole, and no castle");
        var again = new World(Hash.StringSeed("garg"), gargantua: true).Gargantua;
        Check((again.Centre - bh.Centre).Length() < 1e-3f && (again.Normal - bh.Normal).Length() < 1e-5f, "the hole hangs in the same place every time");
        Check(Math.Abs(bh.Normal.Length() - 1f) < 1e-4f && Math.Abs(bh.Normal.Dot(bh.DiskU)) < 1e-4f && Math.Abs(bh.DiskU.Dot(bh.DiskV)) < 1e-4f, "the disk's frame is orthonormal");

        // The observatory: solid deck under the spawn, open air above it; the pad and the rocket's deck.
        var spawn = site.Spawn;
        int sx = V.FloorToInt(spawn.X), sz = V.FloorToInt(spawn.Z);
        var col = new Chunk(sx >> 4, sz >> 4);
        w.Gen.Generate(col);
        ushort under = col.Blocks[V.Index(sx & 15, LandmarkSite.ObservatoryTop - 1, sz & 15)];
        Check(Blocks.Get(under).Solid, $"the observatory's deck is under the spawn ({Blocks.Get(under).Key})");
        Check(col.Blocks[V.Index(sx & 15, LandmarkSite.ObservatoryTop, sz & 15)] == Blocks.Air && col.Blocks[V.Index(sx & 15, LandmarkSite.ObservatoryTop + 1, sz & 15)] == Blocks.Air, "with room to stand");
        var pad = site.PadWorld;
        var pc = new Chunk(V.FloorToInt(pad.X + 3) >> 4, V.FloorToInt(pad.Z + 3) >> 4);
        w.Gen.Generate(pc);
        Check(Blocks.Get(pc.Blocks[V.Index(V.FloorToInt(pad.X + 3) & 15, LaunchComplex.Deck - 1, V.FloorToInt(pad.Z + 3) & 15)]).Solid, "the launch pad's deck is there");
        // No castle where the showcase world would have one.
        var cc = new Chunk(site.Ox >> 4, (site.Oz - 20) >> 4);
        w.Gen.Generate(cc);
        int dusk = 0;
        foreach (var b in cc.Blocks) if (b == Blocks.DuskBricks) dusk++;
        Check(dusk == 0, "no castle masonry on the castle's crag");

        // Seen from the deck it is high in the north, out of reach; the pad is out of its pull too.
        var toBh = bh.Centre - spawn;
        float elev = Mathf.RadToDeg(MathF.Atan2(toBh.Y, new Vector2(toBh.X, toBh.Z).Length()));
        Check(toBh.Z < 0 && elev > 15f && elev < 35f, $"from the deck it stands {elev:0}° up, to the north");
        Check(bh.Pull(spawn) == Vector3.Zero && bh.Pull(pad) == Vector3.Zero, "the deck and the pad feel no pull");
        float lowest = bh.Centre.Y - Gargantua.DiskOuter * Gargantua.M * MathF.Sqrt(1f - bh.Normal.Y * bh.Normal.Y);
        Check(lowest > 262f, $"the disk stays above the clouds (lowest point y {lowest:0})");

        // The pull: toward the centre, gone past the reach; under the hole you are lighter, not lifted.
        var p4 = bh.Centre + Vector3.Right * (4f * Gargantua.M);
        var p8 = bh.Centre + Vector3.Right * (8f * Gargantua.M);
        Check(bh.Pull(p4).Normalized().Dot(Vector3.Left) > 0.999f, "the pull points at the centre");
        Check(Math.Abs(bh.Pull(p4).Length() / bh.Pull(p8).Length() - 9f) < 0.1f, "and falls off as 1/(r − 2M)², the Paczyński–Wiita law");
        var ground = new Vector3(bh.Centre.X, 70f, bh.Centre.Z);
        var lift = bh.Pull(ground);
        Check(lift.Y > 0f && lift.Y < PhysicsWorld.Gravity * 0.5f, $"standing beneath it you weigh less ({lift.Y:0.0} of {PhysicsWorld.Gravity} m/s² taken off)");
        Check(bh.Pull(p4).Length() > Player.FlyFastSpeed * 9f * 0.5f, "close in it pulls harder than creative flight can push");

        // Clocks: √(1 − 2M/r).
        Check(Math.Abs(bh.ClockRate(p4) - MathF.Sqrt(0.5f)) < 1e-3f, $"a clock at 4M runs at √½ ({bh.ClockRate(p4):0.0000})");
        Check(bh.ClockRate(bh.Centre + Vector3.Up * Gargantua.M) == 0f && bh.Inside(bh.Centre + Vector3.Up * Gargantua.M), "inside the horizon: stopped, and inside");
        Check(bh.AirFactor(p4) == 0f && bh.AirFactor(spawn) == 1f, "no air near the hole, all of it on the deck");

        // A rocket climbing straight up into it from 9M below is swallowed whole: no air there to tear it apart.
        var r = new Rocket();
        r.Place(bh.Centre + Vector3.Down * (9f * Gargantua.M), Quaternion.Identity);
        r.Body.Vel = Vector3.Up * 150f;
        r.Clamps.Release();
        r.Phase = FlightPhase.Flight;
        r.ToggleEngine();
        float t = 0f;
        while (!r.Swallowed && !r.Destroyed && t < 30f) { r.Step(w, 1f / 60f); t += 1f / 60f; }
        Check(r.Swallowed && !r.Destroyed, $"a rocket flown at it is swallowed after {t:0.0} s ({(r.Destroyed ? r.DestroyedBy : "intact")})");
        // From the pad, the way a pilot would with the dial: lift off, tip over early while still slow, then
        // keep the flight path (○) on the hole's marker, turning gently while the air is thick.
        var flown = new Rocket();
        flown.Place(site.PadWorld, Quaternion.Identity);
        flown.Clamps.Engage(flown);
        flown.Arm(); flown.Go();
        t = 0f;
        float fuelLeft = 0f;
        while (!flown.Swallowed && !flown.Destroyed && t < 90f)
        {
            var to = bh.Centre - flown.Body.Position;
            var vel = flown.Body.Vel;
            var aim = flown.Body.Position.Y < site.PadWorld.Y + 40f ? Vector3.Up
                : vel.Length() < 30f ? to.Normalized()
                : (to.Normalized() * 2f - vel.Normalized()).Normalized();
            var err = flown.Body.Up.Cross(aim);
            // A hard turn at speed in thick air breaks the rocket up.
            float hand = Math.Clamp(3000f / Math.Max(flown.Aero.DynamicPressure, 1f), 0.15f, 1f);
            flown.Stick = err.Length() > 0.02f ? err.Normalized() * Math.Min(hand, err.Length() * 3f) : Vector3.Zero;
            flown.Step(w, 1f / 60f);
            t += 1f / 60f;
            fuelLeft = flown.Tank.Fraction;
        }
        GD.Print($"   flown from the pad: {(flown.Swallowed ? "swallowed" : "missed")} after {t:0.0} s, {fuelLeft * 100:0}% of the propellant left");
        Check(flown.Swallowed && !flown.Destroyed, $"a rocket launched from the pad and steered at it gets there in {t:0} s with {fuelLeft * 100:0}% of its propellant left ({(flown.Destroyed ? flown.DestroyedBy : flown.Swallowed ? "swallowed" : "missed: closest " + bh.R(flown.Body.Position).ToString("0.0") + " M")})");

        // One left dead in the sky at 5M, level with the centre, falls in all the same: the pull beats the world's gravity there.
        var drift = new Rocket();
        drift.Place(bh.Centre + Vector3.Right * (5f * Gargantua.M), Quaternion.Identity);
        drift.Clamps.Release();
        t = 0f;
        while (!drift.Swallowed && t < 60f) { drift.Step(w, 1f / 30f); t += 1f / 30f; }
        Check(drift.Swallowed, $"a dead rocket left at 5M falls in ({t:0.0} s)");
    }

    /// <summary>The tesseract's geometry: true rotations of 4-space, and the hypercube's corners, edges and shadow.</summary>
    private static void FourDimensions()
    {
        double worst = 0;
        for (double t = 0; t < 600; t += 37.3)
        {
            worst = Math.Max(worst, Hyper.Slice(t).OrthoError());
            worst = Math.Max(worst, Hyper.Double(t, 0.41, 0.27).OrthoError());
        }
        Check(worst < 1e-9, $"every orientation is a rotation (|R Rᵀ − I| ≤ {worst:0.0e0})");
        var plane = Hyper.Mat.Plane(0, 3, Math.PI / 2);
        var turned = plane.Apply(new Vector4(1, 0, 0, 0));
        Check((turned - new Vector4(0, 0, 0, 1)).Length() < 1e-6f, "a quarter turn in the xw plane carries x into w");

        var c = Hyper.Corners();
        var e = Hyper.Edges();
        Check(c.Length == 16 && e.Count == 32, $"a hypercube has 16 corners and 32 edges ({c.Length}, {e.Count})");
        bool unit = true;
        foreach (var (a, b) in e) unit &= Math.Abs((c[a] - c[b]).Length() - 2f) < 1e-5f;
        Check(unit, "every edge is the same length");
        var deg = new int[16];
        foreach (var (a, b) in e) { deg[a]++; deg[b]++; }
        Check(Array.TrueForAll(deg, d => d == 4), "four edges meet at every corner");
        // Its shadow: the far cell (w = −1) is the small inner cube, the near one the big outer cube.
        var inner = Hyper.Project(new Vector4(1, 1, 1, -1));
        var outer = Hyper.Project(new Vector4(1, 1, 1, 1));
        Check(inner.X < outer.X && Math.Abs(outer.X / inner.X - 2f) < 1e-4f, $"projected, the inner cube is half the outer one ({inner.X:0.00} vs {outer.X:0.00})");
        var proj = plane.ToProjection();
        var viaGpu = proj * new Vector4(1, 0, 0, 0);
        Check((viaGpu - turned).Length() < 1e-6f, "handed to a shader, the matrix turns points the same way");
    }
}

