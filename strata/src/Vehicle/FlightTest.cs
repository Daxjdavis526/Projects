using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Godot;

namespace Strata;

/// <summary>
/// End-to-end check of the launch complex and the rocket in a real game, with
/// real input: a showcase world is made, the player is put on the crew arm,
/// boards through the hatch, arms, counts down, lifts off, steers, cuts the
/// engine and rides it down. A second rocket is rolled out from the console
/// and held on the pad by a thrust check. A fourth goes round the planet:
/// in orbit, across the seam where the map meets itself, back into the air
/// glowing, and its rider steps out and falls to the ground. Screenshots all
/// the way.
/// Run with: godot --path strata -- --flighttest [outdir] [--orbit | --creative]
/// </summary>
public partial class FlightTest : Node
{
    private Game G;
    private string _out = "/tmp/strata_flight";
    private int _pass, _fail, _shot;
    private readonly List<string> _log = new();
    private string _folder;

    public override void _Ready()
    {
        var args = OS.GetCmdlineUserArgs();
        for (int i = 0; i < args.Length; i++)
            if (args[i] == "--flighttest" && i + 1 < args.Length && !args[i + 1].StartsWith("--")) _out = args[i + 1];
        System.IO.Directory.CreateDirectory(_out);
        _ = Run();
    }

    private void Check(bool ok, string what)
    {
        if (ok) { _pass++; GD.Print("  ok   " + what); }
        else { _fail++; _log.Add(what); GD.PrintErr("  FAIL " + what); }
    }

    private async Task Frames(int n) { for (int i = 0; i < n; i++) await ToSignal(GetTree(), SceneTree.SignalName.ProcessFrame); }

    private async Task<bool> Until(Func<bool> cond, float wallSeconds)
    {
        ulong end = Time.GetTicksMsec() + (ulong)(wallSeconds * 1000);
        while (Time.GetTicksMsec() < end) { if (cond()) return true; await Frames(1); }
        return cond();
    }

    private async Task<bool> UntilGame(Func<bool> cond, float gameSeconds)
    {
        double end = G.Clock + gameSeconds;
        ulong wallLimit = Time.GetTicksMsec() + (ulong)(gameSeconds * 30000);
        while (G.Clock < end && Time.GetTicksMsec() < wallLimit) { if (cond()) return true; await Frames(1); }
        return cond();
    }

    private Task GameSeconds(float s) => UntilGame(() => false, s);

    private async Task Shot(string name, bool ui = true)
    {
        G.Ui.Visible = ui;
        await Frames(3);
        var img = GetViewport().GetTexture().GetImage();
        string path = System.IO.Path.Combine(_out, $"{++_shot:00}_{name}.png");
        img.SavePng(path);
        GD.Print("  shot " + path);
        G.Ui.Visible = true;
    }

    private async Task Key(Key k)
    {
        Input.ParseInputEvent(new InputEventKey { PhysicalKeycode = k, Keycode = k, Pressed = true });
        await Frames(2);
        Input.ParseInputEvent(new InputEventKey { PhysicalKeycode = k, Keycode = k, Pressed = false });
        await Frames(2);
    }

    private async Task WaitLoaded(Vector3 at)
    {
        await Until(() => G.View.Chunks.AreaReady(at, 3) && G.View.Chunks.Jobs.Pending == 0, 120f);
        await Frames(10);
    }

    private Player P => G.Player;
    private World W => G.World;

    private void Aim(Vector3 target)
    {
        var d = (target - P.Camera.GlobalPosition).Normalized();
        P.Pitch = Mathf.RadToDeg(MathF.Asin(Math.Clamp(d.Y, -1f, 1f)));
        P.Yaw = Mathf.RadToDeg(MathF.Atan2(-d.X, -d.Z));
    }

    private async Task Run()
    {
        GD.Print("STRATA flight test");
        InputSetup.Ensure();
        var settings = new Settings { RenderDistance = 10, ViewBobbing = false };
        var meta = WorldSave.Create("flighttest " + DateTime.Now.ToString("HHmmss"), "flight", landmarks: true);
        _folder = meta.Folder;
        G = new Game { AutoCapture = false };
        G.Begin(meta, settings);
        AddChild(new Sfx());
        AddChild(G);
        Check(await Until(() => G.State == GameState.Playing, 180f), "the showcase world loads");
        G.View.Sky.Time = 0.2;       // mid-morning

        if (OS.GetCmdlineUserArgs().Contains("--creative")) { await Creative(); await Finish(); return; }
        if (OS.GetCmdlineUserArgs().Contains("--orbit")) { await Orbit(); await Finish(); return; }
        var site = W.Gen.Landmarks;
        var pad = site.PadWorld;
        var r = G.Vehicles.OnPad();
        Check(r != null, "a rocket stands on the pad");
        if (r == null) { await Finish(); return; }
        Check(r.Clamped && r.Phase == FlightPhase.Safe && r.Tank.Fraction > 0.999f, "clamped, safe and fuelled");
        float m0 = r.Body.Mass;

        // Up the tower: the crew arm reaches the hatch.
        var exit = r.PointWorld(r.Seat.Exit);
        P.Teleport(exit + new Vector3(1.5f, 0.05f, 0));
        await WaitLoaded(exit);
        int ax = V.FloorToInt(exit.X), ay = V.FloorToInt(exit.Y) - 1, az = V.FloorToInt(exit.Z);
        Check(W.GetBlock(ax, ay, az) == Blocks.SteelGrating, $"the crew arm's floor is under the hatch ({Blocks.Get(W.GetBlock(ax, ay, az)).Key} at y {ay})");
        int px = V.FloorToInt(pad.X), pz = V.FloorToInt(pad.Z);
        Check(W.GetBlock(px, LaunchComplex.Deck - 1, pz) == Blocks.Air && W.GetDef(px + 3, LaunchComplex.Deck - 1, pz + 3).Solid, "the pad has a hole under the engine and deck under the fins");
        int ladders = 0;
        for (int y = LaunchComplex.Deck; y < LaunchComplex.Deck + 40; y++)
            if (Blocks.Get(W.GetBlock(px + 10, y, pz)).Render == RenderKind.Ladder) ladders++;
        Check(ladders >= 38, $"a ladder runs up the tower ({ladders} rungs)");
        Check(P.Body.Colliding(W) == false, "standing clear on the arm");
        await Frames(10);
        Aim(r.PointWorld(r.Seat.Hatch));
        await Frames(4);
        await Shot("crew_arm");
        Check(G.Vehicles.HatchTarget == r, "looking at the hatch from the arm, it can be boarded");
        Input.ActionPress("use"); await Frames(3); Input.ActionRelease("use"); await Frames(3);
        Check(P.Riding == r && r.Seat.Occupant == P, "boarded through the hatch");
        await Frames(20);
        await Shot("aboard_on_pad");

        // The sequence, by the keys.
        await Key(Godot.Key.G);
        Check(r.Phase == FlightPhase.Safe, "G does nothing until armed");
        await Key(Godot.Key.R);
        Check(r.Phase == FlightPhase.Armed, "R arms");
        await Key(Godot.Key.G);
        Check(r.Phase == FlightPhase.Countdown, "G starts the countdown");
        await Key(Godot.Key.V); await Key(Godot.Key.V);
        Check(G.Vehicles.Cam == VehicleManager.CamMode.Tower, "V cycles to the pad camera");
        Check(await UntilGame(() => r.Engine.Burning, 12f) && r.Clamped, "the engine lights while the clamps hold");
        await GameSeconds(1.6f);
        await Shot("ignition_pad_cam");
        Check(await UntilGame(() => !r.Clamped, 5f), "the clamps let go at T-0");
        double y0 = r.Origin.Y;
        await GameSeconds(1.5f);
        await Shot("liftoff_pad_cam");
        Check(r.Origin.Y > y0 + 2, $"it rises off the pad ({r.Origin.Y - y0:0.0} m)");
        await GameSeconds(2.5f);
        await Shot("climb_pad_cam");
        await Key(Godot.Key.V);
        Check(G.Vehicles.Cam == VehicleManager.CamMode.Chase, "back to the chase camera");
        P.Yaw = 200f; P.Pitch = -20f;
        await GameSeconds(2f);
        await Shot("climb_chase");
        float m1 = r.Body.Mass;
        Check(m1 < m0 - 5000f, $"propellant is being burned ({m0 / 1000:0.0} t to {m1 / 1000:0.0} t)");

        // Steer: W pushes the nose away from the view.
        var up0 = r.Body.Up;
        Input.ActionPress("move_forward");
        await GameSeconds(2f);
        Input.ActionRelease("move_forward");
        float tilt = Mathf.RadToDeg(up0.AngleTo(r.Body.Up));
        Check(tilt > 12f, $"pitches over under the stick ({tilt:0} degrees)");
        var camFwd = -P.Camera.GlobalTransform.Basis.Z; camFwd.Y = 0;
        var noseH = r.Body.Up; noseH.Y = 0;
        Check(noseH.Normalized().Dot(camFwd.Normalized()) > 0.5f, "toward where the camera faces");
        await GameSeconds(1f);
        await Shot("pitched_over");
        await GameSeconds(4f);
        P.Pitch = -55f;
        await GameSeconds(1f);
        await Shot("high_looking_down");
        Check(r.MaxAltitude - LaunchComplex.Deck > 500f, $"well up ({r.MaxAltitude - LaunchComplex.Deck:0} m)");

        // Cut the engine and ride it down.
        await Key(Godot.Key.X);
        Check(await UntilGame(() => !r.Engine.Burning, 3f), "X cuts the engine");
        var crash = r.Origin;
        bool falling = await UntilGame(() => { crash = r.PointWorld(r.Tank.Local); return r.Destroyed || r.Body.Vel.Y < 0 && r.Altitude - W.Gen.GroundY(V.FloorToInt(crash.X), V.FloorToInt(crash.Z)) < 400; }, 150f);
        P.Pitch = -25f;
        if (!r.Destroyed) await Shot("falling");
        bool down = await UntilGame(() => { if (!r.Destroyed) crash = r.PointWorld(r.Tank.Local); return r.Destroyed || P.Dead || P.Riding == null; }, 150f);
        Check(down && P.Riding == null, $"it came down ({r.DestroyedBy})");
        await Spectate(crash, new Vector3(-55, 28, 55), 0.35f, "impact");
        int wrecks = 0; foreach (var v in G.Vehicles.All) if (v is Wreck) wrecks++;
        Check(wrecks >= 8, $"and broke into wreckage ({wrecks} pieces)");
        await Spectate(crash, new Vector3(-30, 14, 30), 3f, "aftermath");
        bool calm = true; foreach (var v in G.Vehicles.All) calm &= v.Body.Finite && v.Body.AngVel.Length() <= RigidBody.MaxSpin;
        Check(calm, "the wreckage behaves");

        // A botched launch: assist off and full rudder off the pad. It tips over and comes down by the tower.
        await Revive();
        var r3 = Rollout();
        Check(r3 != null, "the console rolls out a new rocket");
        if (r3 != null)
        {
            await Board(r3);
            await Key(Godot.Key.T);
            Check(!r3.Sas, "T switches the assist off");
            int blasted = G.Vehicles.BlocksBlasted;
            await Key(Godot.Key.R); await Key(Godot.Key.G);
            await Key(Godot.Key.V); await Key(Godot.Key.V);
            Check(await UntilGame(() => !r3.Clamped, 14f), "lifts off");
            Input.ActionPress("move_right");
            await GameSeconds(2.2f);
            Input.ActionRelease("move_right");
            await Shot("botched_tipping");
            var at = r3.Origin;
            bool gone = await UntilGame(() => { if (!r3.Destroyed) at = r3.PointWorld(r3.Tank.Local); return r3.Destroyed; }, 40f);
            Check(gone, $"it tips over and is destroyed ({r3.DestroyedBy}, {(at - pad).Length():0} m from the pad)");
            await Spectate(at, new Vector3(-60, 30, 70), 0.3f, "botched_blast");
            await Spectate(at, new Vector3(-45, 22, 55), 2.5f, "botched_after");
            Check(await Until(() => G.Vehicles.BlocksBlasted > blasted + 30, 60f), $"and blows a crater in the ground ({G.Vehicles.BlocksBlasted - blasted} blocks)");
        }

        // A third rocket, and a launch held by the thrust check.
        await Revive();
        var r2 = Rollout();
        if (r2 != null)
        {
            await Board(r2);
            r2.Throttle = 0.5f;
            await Key(Godot.Key.R); await Key(Godot.Key.G);
            Check(await UntilGame(() => r2.Phase == FlightPhase.Safe, 16f) && r2.Clamped, $"at half throttle the launch is held ('{r2.Status}')");
            await Frames(10);
            await Shot("hold_on_pad");
            await Key(Godot.Key.F);
            Check(P.Riding == null && !P.Dead, "F climbs back out");
            await Frames(10);
            Check(!P.Body.Colliding(W), "into free space by the hatch");
        }
        // Round the planet.
        await Orbit();
        // Creative mode, switched on from the pause menu's button.
        await Revive();
        await Creative();

        // Night on the pad.
        G.View.Sky.Time = Math.Floor(G.View.Sky.Time) + 0.75;
        P.Teleport(new Vector3(pad.X - 30, LandmarkSite.Valley + 6, pad.Z + 40));
        await WaitLoaded(P.Body.Position);
        await Frames(30);
        Aim(pad + new Vector3(0, 16, 0));
        await Frames(10);
        await Shot("pad_at_night", ui: false);
        await Finish();
    }

    /// <summary>
    /// In orbit and back: a rocket put on a circular path above the air stays
    /// on it; P swings its nose onto the path; F there only warns (no suit);
    /// half a lap out it crosses the seam where the map meets itself and the
    /// view comes with it; fast back into the air its hull glows. Then its
    /// rider steps out 6 km up and falls: the far ground gives way to real
    /// ground on the way down, loaded before it arrives.
    /// </summary>
    private async Task Orbit()
    {
        await Revive();
        var r = Rollout();
        Check(r != null, "a rocket rolled out for orbit");
        if (r == null) return;
        await Board(r);
        var pad = G.Vehicles.Pad.Value;
        float high = V.SeaLevel + 21000f;
        float vc = PhysicsWorld.CircularSpeed(high);
        Place(r, new Vector3(pad.X, high, pad.Z), new Vector3(vc, 0f, 0f));
        P.Yaw = -90f; P.Pitch = -18f;                  // behind it, looking along its path
        await GameSeconds(1.5f);
        Check(r.Phase == FlightPhase.Flight && r.Path.Stable, $"at {vc:0} m/s level, 21 km up, it is in orbit ({r.Path.Periapsis / 1000:0.0} by {r.Path.Apoapsis / 1000:0.0} km)");
        await Key(Godot.Key.P);
        Check(r.Mode == SasMode.Prograde && r.Sas, "P: the assist holds the nose along the path");
        await GameSeconds(6f);
        float off = Mathf.RadToDeg(r.Body.Up.AngleTo(r.Body.Vel));
        Check(off < 6f, $"and swings it round onto it ({off:0.0} degrees off)");
        double alt0 = r.Altitude;
        await GameSeconds(6f);
        Check(Math.Abs(r.Altitude - alt0) < 60.0 && r.Path.Stable, $"going round, neither climbing nor falling ({r.Altitude - alt0:+0;-0} m)");
        await Key(Godot.Key.F);
        Check(P.Riding == r, "F up here only warns: there is no spacesuit");
        Check(await Until(() => G.View.Far.Settled, 90f), "the planet below is drawn");
        await Shot("orbit_chase");
        P.Pitch = -65f;
        await Frames(3);
        await Shot("orbit_down");

        // Half a lap out, the seam: the map comes round to meet itself.
        float C = PhysicsWorld.Circumference;
        Place(r, new Vector3(C / 2f - 2500f, high, pad.Z), new Vector3(vc, 0f, 0f));
        P.Pitch = -18f;
        int wraps = 0;
        var shift = Vector3.Zero;
        void OnWrap(Vector3 by) { wraps++; shift = by; }
        G.Vehicles.Wrapped += OnWrap;
        await Until(() => G.View.Far.Settled, 90f);
        await Shot("orbit_seam_before");
        var rel0 = P.Camera.GlobalPosition - r.Origin;
        bool crossed = await UntilGame(() => wraps > 0, 15f);
        G.Vehicles.Wrapped -= OnWrap;
        await Frames(2);
        var rel1 = P.Camera.GlobalPosition - r.Origin;
        Check(crossed && Math.Abs(shift.X + C) < 1f, $"across the seam it comes round to the far side of the map ({shift.X / 1000:0.0} km)");
        Check(r.Origin.X < -C / 2f + 6000f && r.Path.Stable, $"still in orbit, now at x {r.Origin.X / 1000:0.0} km");
        Check((rel1 - rel0).Length() < 40f && G.View.Far.AnyReady, "the camera comes with it and the planet stays drawn");
        await GameSeconds(1f);
        await Shot("orbit_seam_after");

        // Back into the air, fast: the hull glows and trails plasma.
        Place(r, new Vector3(pad.X + 30000f, V.SeaLevel + 9000f, pad.Z), new Vector3(850f, -60f, 0f));
        P.Yaw = 0f; P.Pitch = -8f;                     // from the side
        await GameSeconds(1.2f);
        Check(r.Heat > 0.2f, $"back in the air at {r.Body.Vel.Length():0} m/s the hull heats ({r.Heat:0.00})");
        await Shot("reentry");

        // Out 6 km up (below the line a suit would be needed) and down.
        var drop = pad + new Vector3(1500f, 0f, -1500f);
        Place(r, new Vector3(drop.X, V.SeaLevel + 6000f, drop.Z), new Vector3(300f, 0f, 0f));
        await Frames(2);
        await Key(Godot.Key.F);
        Check(P.Riding == null && !P.Dead && P.Chute == ChuteState.Packed, "F bails out, 6 km up, with the seat's parachute");
        P.Pitch = -40f; P.Yaw = 30f;
        float Agl() => P.AboveGround();
        foreach (float mark in new[] { 4500f, 2500f, 1200f, 600f, 350f, 200f, 120f, 60f })
        {
            if (!await UntilGame(() => P.Dead || Agl() < mark, 150f) || P.Dead) break;
            if (mark == 200f) Check(P.Chute == ChuteState.Open && P.Body.Vel.Y > -Player.ChuteSink - 1f, $"the parachute opened by itself ({P.Body.Vel.Y:0.0} m/s)");
            if (mark == 60f) Check(G.View.Chunks.AreaReady(P.Body.Position, 2), "the ground under the fall is loaded before it arrives");
            if (mark == 200f) { P.Pitch = 70f; await Frames(2); await Shot("under_the_canopy"); P.Pitch = -40f; }
            await Shot($"fall_{mark:0}m");
        }
        Check(await UntilGame(() => P.Dead || P.Body.OnGround || P.Body.InWater, 90f) && !P.Dead && P.Chute == ChuteState.None,
            $"and comes down alive under it ({P.Vitals.Health:0} health)");
    }

    /// <summary>Puts a rocket somewhere in flight, nose along its path, as if it had flown there.</summary>
    private static void Place(Rocket r, Vector3 origin, Vector3 vel)
    {
        if (r.Clamped) r.Clamps.Release();
        r.Phase = FlightPhase.Flight;
        var rot = vel.LengthSquared() > 1f ? new Quaternion(Vector3.Up, vel.Normalized()) : Quaternion.Identity;
        r.Body.Rot = rot;
        r.Body.Position = origin + rot * r.Com;
        r.Body.Vel = vel;
        r.Body.AngVel = Vector3.Zero;
        r.Wake();
    }

    /// <summary>Puts the camera at an offset from a point, looking at it, and takes a picture after a wait (wall time: game time stops for the dead).</summary>
    private async Task Spectate(Vector3 at, Vector3 offset, float wait, string name)
    {
        ulong end = Time.GetTicksMsec() + (ulong)(wait * 1000);
        var eye = at + offset;
        await Until(() => G.View.Chunks.AreaReady(at, 2), 60f);
        do
        {
            P.Camera.GlobalPosition = eye;
            P.Camera.LookAt(at, Vector3.Up);
            await Frames(1);
        } while (Time.GetTicksMsec() < end);
        P.Camera.GlobalPosition = eye;
        P.Camera.LookAt(at, Vector3.Up);
        await Shot(name, ui: false);
    }

    private async Task Revive()
    {
        if (P.Dead) G.Respawn();
        await Until(() => G.State == GameState.Playing, 120f);
        await Frames(5);
    }

    private Rocket Rollout()
    {
        var old = G.Vehicles.OnPad();
        G.Vehicles.UseConsole();
        var r = G.Vehicles.OnPad();
        return r != null && r != old ? r : r;
    }

    private async Task Board(Rocket r)
    {
        P.Teleport(r.PointWorld(r.Seat.Exit) + new Vector3(1.5f, 0.05f, 0));
        await WaitLoaded(r.Origin);
        G.Vehicles.Board(r);
        await Frames(5);
    }

    private async Task Creative()
    {
        if (P.Riding != null) G.Vehicles.Exit();
        var spot = G.Vehicles.Pad.Value + new Vector3(-24, 0, 26);
        P.Teleport(new Vector3(spot.X, LandmarkSite.Valley, spot.Z));
        await WaitLoaded(P.Body.Position);
        G.SetCreative(true);
        Check(G.Creative && P.Vitals.Immortal, "creative mode switches on");
        P.Vitals.Damage(50f, DamageKind.Fall, true);
        Check(!P.Dead && P.Vitals.Health == Vitals.MaxHealth, "nothing hurts in creative");
        // Double-tap jump: take off; hold it: climb; let go: hover.
        await Frames(10);
        // As a key press arrives: an input event (the double tap is read from events, not held state).
        // (Both taps within one frame: this renderer is slow, and the taps must fall within 0.3 s.)
        for (int t = 0; t < 2; t++)
        {
            Input.ParseInputEvent(new InputEventAction { Action = "jump", Pressed = true });
            Input.ParseInputEvent(new InputEventAction { Action = "jump", Pressed = false });
        }
        await Frames(3);
        Check(P.Flying, "a double tap of Space takes off");
        double y0 = P.Body.Y;
        Input.ActionPress("jump"); await GameSeconds(1.2f); Input.ActionRelease("jump");
        Check(P.Body.Y > y0 + 5, $"holding Space climbs ({P.Body.Y - y0:0.0} m)");
        double hover = P.Body.Y;
        await GameSeconds(1.5f);
        Check(Math.Abs(P.Body.Y - hover) < 1.0, $"and it hovers without falling ({P.Body.Y - hover:+0.0;-0.0} m)");
        var h0 = P.Body.Position;
        P.Pitch = 0f;
        Input.ActionPress("move_forward"); await GameSeconds(1f); Input.ActionRelease("move_forward");
        float flown = new Vector2(P.Body.Position.X - h0.X, P.Body.Position.Z - h0.Z).Length();
        Check(flown > 6f, $"flies forward ({flown:0.0} m in a second)");
        // Instant breaking, no drops.
        P.Flying = false;
        P.Teleport(new Vector3(spot.X, LandmarkSite.Valley, spot.Z));
        await GameSeconds(0.5f);
        var below = new Vector3I(V.FloorToInt(spot.X) + 2, LandmarkSite.Valley - 1, V.FloorToInt(spot.Z));
        ushort was = W.GetBlock(below.X, below.Y, below.Z);
        int drops = G.Drops.All.Count;
        var eye = P.Camera.GlobalPosition;
        var d = (new Vector3(below.X + 0.5f, below.Y + 0.5f, below.Z + 0.5f) - eye).Normalized();
        P.Pitch = Mathf.RadToDeg(MathF.Asin(d.Y)); P.Yaw = Mathf.RadToDeg(MathF.Atan2(-d.X, -d.Z));
        await Frames(3);
        Input.ActionPress("attack"); await Frames(3); Input.ActionRelease("attack"); await Frames(3);
        Check(was != Blocks.Air && W.GetBlock(below.X, below.Y, below.Z) == Blocks.Air, $"one click breaks {Blocks.Get(was).Key} at once");
        Check(G.Drops.All.Count == drops, "and drops nothing");
        // Every block to hand, and placing never runs out.
        G.OpenScreen(ScreenKind.Inventory, default);
        await Frames(5);
        int palette = CountPalette(G.Screen);
        Check(palette > 100, $"E shows every block ({palette} in the palette)");
        await Shot("creative_palette");
        G.CloseScreen();
        P.Inventory[P.Selected] = new ItemStack(Items.ByKey["crimson_lantern"], 1);
        await Frames(3);
        Input.ActionPress("use"); await Frames(3); Input.ActionRelease("use"); await Frames(3);
        Check(W.GetBlock(below.X, below.Y, below.Z) == Blocks.CrimsonLantern || W.GetBlock(below.X, below.Y + 1, below.Z) == Blocks.CrimsonLantern
            || W.GetBlock(below.X, below.Y - 1, below.Z) == Blocks.CrimsonLantern, "right-click places it");
        Check(P.Inventory[P.Selected].Count == 1, "and the stack in hand is not used up");
        G.SetCreative(false);
        Check(!P.Vitals.Immortal && !P.Flying, "and back to survival");
    }

    private static int CountPalette(Node n)
    {
        int k = n is SlotView sv && (string)sv.Tag == "palette" ? 1 : 0;
        foreach (var c in n.GetChildren()) k += CountPalette(c);
        return k;
    }

    private async Task Finish()
    {
        GD.Print($"\nflight test: {_pass} passed, {_fail} failed");
        foreach (var f in _log) GD.Print("  - " + f);
        await Frames(2);
        try { G?.Shutdown(); } catch { }
        if (_folder != null) WorldSave.Delete(_folder);
        GetTree().Quit(_fail == 0 ? 0 : 1);
    }
}
