using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Godot;

namespace Strata;

/// <summary>
/// End-to-end check of a Gargantua world, played the way a person would: the
/// world loads with the player on the observatory's deck facing the black
/// hole; in creative they fly up to it, feel it take hold, cross the horizon
/// and fall into the tesseract; they look round, drift, slide through the
/// fourth dimension, let it fold shut, and come back to the deck days later.
/// Then a rocket is flown into the hole with the player aboard. Screenshots
/// all the way.
/// Run with: godot --path strata -- --tesseracttest [outdir]
/// </summary>
public partial class TesseractTest : Node
{
    private Game G;
    private string _out = "/tmp/strata_tesseract";
    private int _pass, _fail, _shot;
    private readonly List<string> _log = new();
    private string _folder;

    public override void _Ready()
    {
        var args = OS.GetCmdlineUserArgs();
        for (int i = 0; i < args.Length; i++)
            if (args[i] == "--tesseracttest" && i + 1 < args.Length && !args[i + 1].StartsWith("--")) _out = args[i + 1];
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
        if (G.Tesseract != null) G.Tesseract.Hints = ui;
        await Frames(2);
        var img = GetViewport().GetTexture().GetImage();
        string path = System.IO.Path.Combine(_out, $"{++_shot:00}_{name}.png");
        img.SavePng(path);
        GD.Print("  shot " + path);
        G.Ui.Visible = true;
        if (G.Tesseract != null) G.Tesseract.Hints = true;
    }

    private async Task Key(Key k)
    {
        Input.ParseInputEvent(new InputEventKey { PhysicalKeycode = k, Keycode = k, Pressed = true });
        await Frames(2);
        Input.ParseInputEvent(new InputEventKey { PhysicalKeycode = k, Keycode = k, Pressed = false });
        await Frames(2);
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
        GD.Print("STRATA tesseract test");
        InputSetup.Ensure();
        var settings = new Settings { RenderDistance = 10, ViewBobbing = false };
        var meta = WorldSave.Create("tesseracttest " + DateTime.Now.ToString("HHmmss"), "garg", creative: true, gargantua: true);
        _folder = meta.Folder;
        G = new Game { AutoCapture = false };
        G.Begin(meta, settings);
        AddChild(new Sfx());
        AddChild(G);
        Check(await Until(() => G.State == GameState.Playing, 180f), "the Gargantua world loads");
        var bh = W.Gargantua;
        Check(bh != null && G.Tesseract != null && G.Hole != null, "it has a black hole, and a tesseract behind it");
        if (bh == null) { await Finish(); return; }
        var site = W.Gen.Landmarks;
        Check(site.Kind == SiteKind.Gargantua && !site.HasCastle, "a Gargantua site: no castle");

        // Arrival: on the observatory's deck, looking at it.
        var deck = site.Spawn;
        Check((P.Body.Position - deck).Length() < 2.5f, $"the player arrives on the observatory deck ({P.Body.Position}, deck {deck})");
        int dx = V.FloorToInt(deck.X), dz = V.FloorToInt(deck.Z);
        Check(W.GetDef(dx, LandmarkSite.ObservatoryTop - 1, dz).Solid, "standing on the deck's floor");
        float yaw = Mathf.DegToRad(P.Yaw);
        var look = new Vector2(-MathF.Sin(yaw), -MathF.Cos(yaw));
        var toward = bh.Centre - P.Body.Position;
        Check(look.Dot(new Vector2(toward.X, toward.Z).Normalized()) > 0.97f && P.Pitch > 3f, $"facing the black hole, looking up a little (yaw {P.Yaw:0}, pitch {P.Pitch:0})");
        Check(G.Vehicles.OnPad() != null, "a rocket stands on the pad");
        Check(bh.R(P.Body.Position) > Gargantua.Reach, $"the deck is out of its pull ({bh.R(P.Body.Position):0.0} M)");
        G.View.Sky.Time = 0.74;      // night, for the best view
        await GameSeconds(1f);
        await Shot("deck_night", ui: false);
        G.View.Sky.Time = 0.2;
        await GameSeconds(1f);
        await Shot("deck_day");
        G.View.Sky.Time = 0.74;

        // Up to it, flying: within its reach it pulls, and close in nothing can fly away.
        P.Flying = true;
        var dirOut = (deck - bh.Centre).Normalized();
        P.Teleport(bh.Centre + dirOut * (Gargantua.M * 9f));
        P.Flying = true;
        await Frames(4);
        Aim(bh.Centre);
        await GameSeconds(1.5f);
        Check(!G.InTesseract, "hovering at 9M, still outside");
        await Shot("approach_9M");
        float r0 = bh.R(P.Body.Position);
        await GameSeconds(2f);
        float r1 = bh.R(P.Body.Position);
        Check(r1 < r0 - 0.02f, $"at 9M it draws you in ({r0:0.00} M to {r1:0.00} M in 2 s)");
        Check(G.Hole != null && bh.ClockRate(P.Body.Position) < 0.95f, $"and your clock runs slow ({bh.ClockRate(P.Body.Position):0.000}×)");

        // Fly straight at it at full speed: across the horizon, into the tesseract.
        P.Teleport(bh.Centre + dirOut * (Gargantua.M * 4f));
        P.Flying = true;
        Aim(bh.Centre);
        Input.ActionPress("move_forward");
        Input.ActionPress("sprint");
        await GameSeconds(0.6f);
        await Shot("diving_in");
        bool entered = await UntilGame(() => G.InTesseract, 20f);
        Input.ActionRelease("move_forward");
        Input.ActionRelease("sprint");
        Check(entered, $"crossing the horizon opens the tesseract (r = {bh.R(P.Body.Position):0.00} M)");
        if (!entered) { await Finish(); return; }
        var t = G.Tesseract;
        Check(P.Camera.CullMask == Tesseract.Layer, "the world is hidden from the camera");
        Check(!G.Hud.Visible, "the HUD is away");

        // The fall through the horizon, then the flash, then the lattice.
        foreach (float at in new[] { 1.2f, 3.0f, 4.3f, 6.2f })
        {
            await UntilGame(() => t.Time >= at, 30f);
            await Shot($"falling_{at:0.0}s", ui: false);
        }
        await UntilGame(() => t.Time >= Tesseract.EntrySeconds + 1.5f, 30f);
        Check(t.Active && !t.Closing, "the tesseract stays open");
        var eye0 = t.Eye;
        P.Pitch = -10f; P.Yaw = 30f;
        await GameSeconds(0.3f);
        await Shot("tesseract_ahead", ui: true);
        P.Pitch = -70f;
        await GameSeconds(0.3f);
        await Shot("tesseract_down", ui: false);
        P.Pitch = 60f; P.Yaw = 200f;
        await GameSeconds(0.3f);
        await Shot("tesseract_up", ui: false);
        Check(t.Eye.Y < eye0.Y - 1f, $"falling all the while ({eye0.Y:0.0} to {t.Eye.Y:0.0})");

        // Drifting, and through the fourth dimension: Q/E change everything.
        P.Pitch = -15f; P.Yaw = 0f;
        float w0 = t.W;
        Input.ParseInputEvent(new InputEventKey { PhysicalKeycode = Godot.Key.E, Keycode = Godot.Key.E, Pressed = true });
        await GameSeconds(2.5f);
        Input.ParseInputEvent(new InputEventKey { PhysicalKeycode = Godot.Key.E, Keycode = Godot.Key.E, Pressed = false });
        Check(t.W > w0 + 1.5f, $"E moves along the fourth axis (w {w0:0.00} to {t.W:0.00})");
        await Shot("tesseract_w_plus", ui: false);
        var e1 = t.Eye;
        Input.ActionPress("move_forward");
        await GameSeconds(1.5f);
        Input.ActionRelease("move_forward");
        var moved = t.Eye - e1;
        Check(new Vector2(moved.X, moved.Z).Length() > 3f, $"W drifts you forward ({moved.X:0.0}, {moved.Z:0.0})");
        await GameSeconds(4f);
        await Shot("tesseract_later", ui: false);

        // Saving in here keeps you out of the hole: the save puts you back where you began.
        G.Save();
        var saved = WorldSave.TryLoad(_folder);
        Check(saved != null && (new Vector3((float)saved.Player.X, (float)saved.Player.Y, (float)saved.Player.Z) - P.Spawn).Length() < 1.5f,
            "saved from inside the tesseract, the player is kept at the spawn");

        // Let it fold shut: back on the deck, days later.
        double clock = G.View.Sky.Time;
        float spent = t.Time;
        await Key(Godot.Key.F);
        Check(t.Closing, "F lets it fold shut");
        await UntilGame(() => t.Time > spent + 2.2f, 20f);
        await Shot("folding", ui: false);
        Check(await Until(() => !G.InTesseract, 60f), "it closes");
        Check(await Until(() => G.State == GameState.Playing, 120f), "and the world loads round the deck again");
        Check((P.Body.Position - P.Spawn).Length() < 3f, $"back where you began ({P.Body.Position})");
        Check(P.Camera.CullMask != Tesseract.Layer && G.Hud.Visible, "the world and the HUD are back");
        double days = G.View.Sky.Time - clock;
        Check(days > spent * Tesseract.OutsideRate / Atmosphere.DayLengthSeconds * 0.9, $"the world's clock moved on {days:0.0} days for {spent:0} s inside");
        await GameSeconds(1f);
        await Shot("back_on_deck");

        await RocketIn();
        await Finish();
    }

    /// <summary>A rocket flown at the hole with the player aboard: it is swallowed, and they go on into the tesseract.</summary>
    private async Task RocketIn()
    {
        var bh = W.Gargantua;
        var r = G.Vehicles.OnPad();
        Check(r != null, "a rocket on the pad for the second trip");
        if (r == null) return;
        G.Vehicles.Board(r);
        Check(P.Riding == r, "aboard");
        // Put it on course, already in the vacuum round the hole, burning toward it.
        var from = bh.Centre + (W.Gen.Landmarks.PadWorld - bh.Centre).Normalized() * (Gargantua.M * 10f);
        var dir = (bh.Centre - from).Normalized();
        r.Clamps.Release();
        r.Place(from, new Quaternion(Vector3.Up.Cross(dir).Normalized(), MathF.Acos(Vector3.Up.Dot(dir))));
        r.Body.Vel = dir * 60f;
        r.Phase = FlightPhase.Flight;
        r.ToggleEngine();
        await GameSeconds(1f);
        Check(r.Engine.Thrust > 0f, $"the engine lights ({r.Status})");
        await Shot("rocket_diving", ui: true);
        Check(await UntilGame(() => G.InTesseract, 30f), $"the rocket crosses the horizon and its pilot falls into the tesseract (r = {bh.R(r.Body.Position):0.00} M, {r.Status})");
        Check(!G.Vehicles.All.Contains(r) && P.Riding == null, "the rocket is gone");
        Check(!r.Destroyed, $"it was swallowed whole, not torn apart ({r.DestroyedBy})");
        await UntilGame(() => G.Tesseract.Time > Tesseract.EntrySeconds + 1f, 30f);
        await Key(Godot.Key.F);
        Check(await Until(() => !G.InTesseract && G.State == GameState.Playing, 120f), "and back out again");
        G.Vehicles.UseConsole();
        Check(G.Vehicles.OnPad() != null, "the console rolls out a new rocket");
    }

    private async Task Finish()
    {
        GD.Print($"\ntesseract test: {_pass} passed, {_fail} failed");
        foreach (var f in _log) GD.Print("  - " + f);
        await Frames(2);
        G?.Shutdown();
        try { System.IO.Directory.Delete(WorldSave.DirOf(_folder), true); } catch { }
        GetTree().Quit(_fail == 0 ? 0 : 1);
    }
}
