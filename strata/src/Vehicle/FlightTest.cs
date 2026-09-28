using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Godot;

namespace Strata;

/// <summary>
/// End-to-end check of the launch complex and the rocket in a real game, with
/// real input: a showcase world is made, the player is put on the crew arm,
/// boards through the hatch, arms, counts down, lifts off, steers, cuts the
/// engine and rides it down. A second rocket is rolled out from the console
/// and held on the pad by a thrust check. Screenshots all the way.
/// Run with: godot --path strata -- --flighttest [outdir]
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

        var site = W.Gen.Landmarks;
        var pad = site.PadWorld;
        var r = G.Vehicles.OnPad();
        Check(r != null, "a rocket stands on the pad");
        if (r == null) { await Finish(); return; }
        Check(r.Clamped && r.Phase == FlightPhase.Safe && r.Tank.Fraction > 0.999f, "clamped, safe and fuelled");

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
        Check(m1 < 58000f - 5000f, $"propellant is being burned ({m1 / 1000:0.0} t)");

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
