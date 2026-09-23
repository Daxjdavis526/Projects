using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Godot;

namespace Strata;

/// <summary>
/// Plays the core loop end to end with scripted input, the way a person
/// would: arrive, chop a tree, craft planks and a worktable, make tools, dig
/// to stone, build a furnace and smelt, hunt and cook, eat, survive a night
/// attacker, light a room, store things in a crate, farm, fall, die and
/// respawn, save, quit, reload and check that everything is still there.
/// Screenshots are taken along the way. Run with
/// godot --path strata -- --selftest [outdir]
/// </summary>
public partial class SelfTest : Node
{
    private Game G;
    private string _out = "/tmp/strata_selftest";
    private int _pass, _fail, _shot;
    private readonly List<string> _log = new();
    private string _folder;

    public override void _Ready()
    {
        var args = OS.GetCmdlineUserArgs();
        for (int i = 0; i < args.Length; i++)
            if (args[i] == "--selftest" && i + 1 < args.Length && !args[i + 1].StartsWith("--")) _out = args[i + 1];
        System.IO.Directory.CreateDirectory(_out);
        _ = Run();
    }

    private void Check(bool ok, string what)
    {
        if (ok) { _pass++; GD.Print("  ok   " + what); }
        else { _fail++; _log.Add(what); GD.PrintErr("  FAIL " + what); }
    }

    private async Task Frames(int n)
    {
        for (int i = 0; i < n; i++) await ToSignal(GetTree(), SceneTree.SignalName.ProcessFrame);
    }

    private async Task Seconds(float s)
    {
        ulong end = Time.GetTicksMsec() + (ulong)(s * 1000);
        while (Time.GetTicksMsec() < end) await Frames(1);
    }

    private async Task<bool> Until(Func<bool> cond, float timeout)
    {
        ulong end = Time.GetTicksMsec() + (ulong)(timeout * 1000);
        while (Time.GetTicksMsec() < end)
        {
            if (cond()) return true;
            await Frames(1);
        }
        return cond();
    }

    /// <summary>Waits in game time, which is what matters when the renderer is slow.</summary>
    private async Task GameSeconds(float s)
    {
        double end = G.Clock + s;
        ulong wallLimit = Time.GetTicksMsec() + (ulong)(s * 20000);
        while (G.Clock < end && Time.GetTicksMsec() < wallLimit) await Frames(1);
    }

    private async Task<bool> UntilGame(Func<bool> cond, float gameSeconds)
    {
        double end = G.Clock + gameSeconds;
        ulong wallLimit = Time.GetTicksMsec() + (ulong)(gameSeconds * 20000);
        while (G.Clock < end && Time.GetTicksMsec() < wallLimit)
        {
            if (cond()) return true;
            await Frames(1);
        }
        return cond();
    }

    private async Task Shot(string name)
    {
        await Frames(3);
        var img = GetViewport().GetTexture().GetImage();
        string path = System.IO.Path.Combine(_out, $"{++_shot:00}_{name}.png");
        img.SavePng(path);
        GD.Print("  shot " + path);
    }

    private Player P => G.Player;
    private World W => G.World;

    private void Aim(Vector3 target)
    {
        var d = (target - P.Camera.GlobalPosition).Normalized();
        P.Pitch = Mathf.RadToDeg(MathF.Asin(Math.Clamp(d.Y, -1f, 1f)));
        P.Yaw = Mathf.RadToDeg(MathF.Atan2(-d.X, -d.Z));
    }

    private static Vector3 Center(Vector3I c) => new(c.X + 0.5f, c.Y + 0.5f, c.Z + 0.5f);

    private void Give(ushort item, int n) => P.Inventory.Add(new ItemStack(item, n));

    private void Hold(ushort item)
    {
        for (int i = 0; i < 9; i++) if (P.Inventory[i].Id == item) { P.SelectSlot(i); return; }
        for (int i = 9; i < 36; i++)
            if (P.Inventory[i].Id == item)
            {
                var tmp = P.Inventory[8];
                P.Inventory[8] = P.Inventory[i];
                P.Inventory[i] = tmp;
                P.SelectSlot(8);
                return;
            }
    }

    private async Task Press(string action, int frames = 2)
    {
        Input.ActionPress(action);
        await Frames(frames);
        Input.ActionRelease(action);
        await Frames(2);
    }

    /// <summary>Holds attack on a block until it is gone. Returns the seconds it took.</summary>
    private async Task<float> Mine(Vector3I cell, float timeout = 20f)
    {
        ushort before = W.GetBlock(cell.X, cell.Y, cell.Z);
        double t0 = G.Clock;
        Input.ActionPress("attack");
        bool gone = await UntilGame(() =>
        {
            Aim(Center(cell));
            return W.GetBlock(cell.X, cell.Y, cell.Z) != before;
        }, timeout);
        Input.ActionRelease("attack");
        await Frames(2);
        return gone ? (float)(G.Clock - t0) : -1f;
    }

    /// <summary>Stands the player on solid ground next to a cell, facing it.</summary>
    private bool StandBeside(Vector3I cell)
    {
        foreach (var (dx, dz) in new[] { (1, 0), (-1, 0), (0, 1), (0, -1), (2, 0), (0, 2), (-2, 0), (0, -2) })
        {
            int x = cell.X + dx, z = cell.Z + dz;
            for (int y = cell.Y + 1; y >= cell.Y - 2; y--)
            {
                if (W.GetDef(x, y - 1, z).Solid && !W.GetDef(x, y, z).Solid && !W.GetDef(x, y + 1, z).Solid)
                {
                    P.Teleport(new Vector3(x + 0.5f, y, z + 0.5f));
                    return true;
                }
            }
        }
        return false;
    }

    private Vector3I? FindNearest(Func<ushort, bool> match, int radius, Func<int, int, int, bool> extra = null)
    {
        var p = P.Body.Position;
        int px = V.FloorToInt(p.X), py = V.FloorToInt(p.Y), pz = V.FloorToInt(p.Z);
        Vector3I? best = null;
        float bestD = float.MaxValue;
        for (int y = Math.Max(1, py - radius); y <= Math.Min(250, py + radius); y++)
            for (int z = pz - radius; z <= pz + radius; z++)
                for (int x = px - radius; x <= px + radius; x++)
                {
                    if (!W.IsReady(x, z)) continue;
                    if (!match(W.GetBlock(x, y, z))) continue;
                    if (extra != null && !extra(x, y, z)) continue;
                    float d = (new Vector3(x, y, z) - p).LengthSquared();
                    if (d < bestD) { bestD = d; best = new Vector3I(x, y, z); }
                }
        return best;
    }

    private Recipe RecipeFor(string key)
    {
        ushort id = Items.ByKey[key];
        foreach (var r in Recipes.All) if (r.Output.Id == id) return r;
        return null;
    }

    /// <summary>Clicks a control the way a mouse would.</summary>
    private async Task Click(Control c, bool shift = false, MouseButton button = MouseButton.Left)
    {
        var pos = c.GetGlobalRect().GetCenter();
        Input.WarpMouse(pos);
        var down = new InputEventMouseButton { ButtonIndex = button, Pressed = true, Position = pos, GlobalPosition = pos, ShiftPressed = shift };
        Input.ParseInputEvent(down);
        await Frames(1);
        var up = new InputEventMouseButton { ButtonIndex = button, Pressed = false, Position = pos, GlobalPosition = pos, ShiftPressed = shift };
        Input.ParseInputEvent(up);
        await Frames(2);
    }

    private static List<T> FindAll<T>(Node root) where T : Node
    {
        var list = new List<T>();
        void Walk(Node n) { if (n is T t) list.Add(t); foreach (var c in n.GetChildren()) Walk(c); }
        Walk(root);
        return list;
    }

    // --- the play-through ---------------------------------------------------------------

    private async Task Run()
    {
        GD.Print("STRATA self test");
        InputSetup.Ensure();
        var settings = new Settings { RenderDistance = 6, ViewBobbing = false };
        var meta = WorldSave.Create("selftest " + DateTime.Now.ToString("HHmmss"), "selftest");
        _folder = meta.Folder;
        G = new Game { AutoCapture = false };
        G.Begin(meta, settings);
        AddChild(new Sfx());
        AddChild(G);

        Check(await Until(() => G.State == GameState.Playing, 90f), "world loads and the player arrives");
        await Seconds(1f);
        Check(P.Body.OnGround, "standing on the ground after arrival");
        var arrival = P.Body.Position;
        await Shot("arrival");

        // Walk forward a little with real input, in a direction with nothing in the way.
        P.Yaw = ClearHeading();
        var before = P.Body.Position;
        Input.ActionPress("move_forward");
        await GameSeconds(1.2f);
        Input.ActionRelease("move_forward");
        await GameSeconds(0.3f);
        float walked = new Vector2(P.Body.Position.X - before.X, P.Body.Position.Z - before.Z).Length();
        Check(walked > 2.5f, $"walks with the forward key ({walked:0.0} m in 1.2 s)");
        double groundY = P.Body.Y;
        Input.ActionPress("jump");
        bool rose = await UntilGame(() => P.Body.Y > groundY + 0.5, 0.6f);
        Input.ActionRelease("jump");
        Check(rose, "jump leaves the ground");
        Check(await UntilGame(() => P.Body.OnGround, 2f), "and lands again");

        // --- wood --------------------------------------------------------------------
        var log = FindNearest(Blocks.IsLog, 48, (x, y, z) => !Blocks.IsLog(W.GetBlock(x, y - 1, z)) && W.GetDef(x, y - 1, z).Solid);
        Check(log.HasValue, "there is a tree nearby");
        if (!log.HasValue) { await Finish(); return; }
        var trunk = log.Value;
        Check(StandBeside(trunk), "can stand beside the trunk");
        await Seconds(0.5f);
        await Shot("tree");
        int logsBefore = CountLogs();
        for (int k = 0; k < 3; k++)
        {
            var cell = new Vector3I(trunk.X, trunk.Y + k, trunk.Z);
            if (!Blocks.IsLog(W.GetBlock(cell.X, cell.Y, cell.Z))) break;
            int resets = P.BreakResets;
            float t = await Mine(cell);
            GD.Print($"    log by hand: {t:0.00} s game time, expected {Items.BreakTime(Blocks.Get(Blocks.ElmLog), P.HeldDef).seconds:0.00}, target changes {P.BreakResets - resets}, fps {Engine.GetFramesPerSecond()}");
            Check(t > 0.3f, $"log {k + 1} takes a few seconds by hand ({t:0.0} s)");
        }
        await Seconds(1.5f);
        int logs = CountLogs() - logsBefore;
        Check(logs >= 2, $"logs picked up ({logs})");
        await Shot("chopped");

        // --- crafting by hand, in the real screen ----------------------------------------
        G.OpenScreen(ScreenKind.Inventory, default);
        await Frames(4);
        Check(G.Screen != null, "E opens the inventory");
        await Shot("inventory");
        var makeButtons = FindAll<Button>(G.Screen).FindAll(b => b.Text == "Make");
        Check(makeButtons.Count > 0, "the recipe book offers something to make");
        if (makeButtons.Count > 0) await Click(makeButtons[0], shift: true);
        int planks = 0;
        foreach (var s in P.Inventory.Slots) if (!s.IsEmpty && Items.HasTag(s.Id, "planks")) planks += s.Count;
        Check(planks >= 4, $"planks crafted through the screen ({planks})");
        G.CloseScreen();
        await Frames(2);
        Check(Recipes.TryCraft(P.Inventory, RecipeFor("worktable"), out var table), "worktable crafted");
        P.Inventory.Add(table);
        Check(Recipes.TryCraft(P.Inventory, RecipeFor("stick"), out var sticks), "sticks crafted");
        P.Inventory.Add(sticks);

        // --- place the worktable and use it --------------------------------------------
        Hold(Items.ByKey["worktable"]);
        var ground = new Vector3I(V.FloorToInt(P.Body.X) + 2, V.FloorToInt(P.Body.Y) - 1, V.FloorToInt(P.Body.Z));
        if (W.GetDef(ground.X, ground.Y + 1, ground.Z).Solid || !W.GetDef(ground.X, ground.Y, ground.Z).Solid)
            ground = new Vector3I(V.FloorToInt(P.Body.X) - 2, V.FloorToInt(P.Body.Y) - 1, V.FloorToInt(P.Body.Z));
        Aim(new Vector3(ground.X + 0.5f, ground.Y + 1f, ground.Z + 0.5f));
        await Frames(2);
        await Press("use");
        var tablePos = new Vector3I(ground.X, ground.Y + 1, ground.Z);
        var tableAt = Near(tablePos, id => id == Blocks.Worktable);
        Check(tableAt.HasValue, "worktable placed where aimed");
        if (tableAt.HasValue) tablePos = tableAt.Value;
        // Enough wood for tools.
        Give(Items.ByKey["elm_log"], 3);
        for (int k = 0; k < 3; k++) { Recipes.TryCraft(P.Inventory, RecipeFor("elm_planks"), out var pl); P.Inventory.Add(pl); }
        Aim(Center(tablePos));
        await Frames(2);
        await Press("use");
        Check(G.Screen != null && G.Screen.Kind == ScreenKind.Worktable, "right-click opens the worktable");
        await Shot("worktable");
        if (G.Screen != null)
        {
            // Make a wooden pick through the screen: find its row.
            await Frames(3);
            foreach (var b in FindAll<Button>(G.Screen))
            {
                if (b.Text != "Make") continue;
                var row = b.GetParent();
                bool isPick = false;
                foreach (var l in FindAll<Label>(row)) if (l.Text.StartsWith("Wooden Pick")) isPick = true;
                if (isPick) { await Click(b); break; }
            }
        }
        Check(P.Inventory.Count(Items.ByKey["wooden_pick"]) == 1, "wooden pick made at the worktable");
        G.CloseScreen();
        // Make sure we have enough wood for the rest.
        Give(Items.ByKey["elm_log"], 6);
        foreach (var r in new[] { "elm_planks", "elm_planks", "elm_planks" }) { Recipes.TryCraft(P.Inventory, RecipeFor(r), out var o); P.Inventory.Add(o); }
        Recipes.TryCraft(P.Inventory, RecipeFor("stick"), out var s2); P.Inventory.Add(s2);

        // --- dig down to stone -----------------------------------------------------------
        Hold(Items.ByKey["wooden_pick"]);
        int cobble0 = P.Inventory.Count(Items.ByKey["cobblestone"]);
        float stoneTime = -1;
        for (int k = 0; k < 40 && P.Inventory.Count(Items.ByKey["cobblestone"]) - cobble0 < 12; k++)
        {
            var below = new Vector3I(V.FloorToInt(P.Body.X), V.FloorToInt(P.Body.Y - 0.5), V.FloorToInt(P.Body.Z));
            ushort id = W.GetBlock(below.X, below.Y, below.Z);
            if (id == Blocks.Water || id == Blocks.Lava || id == Blocks.Rootstone) break;
            // Dig the block ahead as well as below, so the pit is a staircase we can walk out of.
            var def = Blocks.Get(id);
            if (id == Blocks.Stone && stoneTime < 0)
            {
                int resets = P.BreakResets;
                stoneTime = await Mine(below);
                GD.Print($"    stone with a wooden pick: {stoneTime:0.00} s game time, expected {Items.BreakTime(Blocks.Get(Blocks.Stone), P.HeldDef).seconds:0.00}, target changes {P.BreakResets - resets}");
            }
            else await Mine(below);
            await GameSeconds(0.6f);
            var side = new Vector3I(below.X + 1, below.Y, below.Z);
            if (Blocks.Get(W.GetBlock(side.X, side.Y, side.Z)).Id == Blocks.Stone) { await Mine(side); await GameSeconds(0.4f); }
            if (def.Air) { P.Teleport(P.Body.Position - new Vector3(0, 1, 0)); await GameSeconds(0.3f); }
        }
        await Seconds(1f);
        int cobble = P.Inventory.Count(Items.ByKey["cobblestone"]) - cobble0;
        Check(cobble >= 8, $"cobblestone collected with the wooden pick ({cobble})");
        Check(stoneTime > 0.2f && stoneTime < 3f, $"stone breaks in a sensible time with a wooden pick ({stoneTime:0.00} s)");
        await Shot("pit");

        // --- stone tools and a furnace ---------------------------------------------------
        Give(Items.ByKey["cobblestone"], 12);
        Check(Recipes.TryCraft(P.Inventory, RecipeFor("stone_pick"), out var spick) && spick.Id == Items.ByKey["stone_pick"], "stone pick");
        P.Inventory.Add(spick);
        Check(Recipes.TryCraft(P.Inventory, RecipeFor("furnace"), out var furnace), "furnace crafted");
        P.Inventory.Add(furnace);

        // Back to the surface for the rest.
        P.Teleport(arrival + new Vector3(0, 0.2f, 0));
        G.PlaceOnSurface();
        await Seconds(1f);
        var feet = new Vector3I(V.FloorToInt(P.Body.X), V.FloorToInt(P.Body.Y), V.FloorToInt(P.Body.Z));

        Hold(Items.Furnace);
        var fcell = PlaceSpotNear(feet, 2);
        Aim(new Vector3(fcell.X + 0.5f, fcell.Y, fcell.Z + 0.5f));
        await Frames(2);
        await Press("use");
        // Tall grass on the way in is replaceable, so the furnace may land a cell nearer.
        var placedAt = Near(fcell, id => Blocks.Get(id).Use == BlockUse.Furnace);
        Check(placedAt.HasValue, "furnace placed");
        if (placedAt.HasValue) fcell = placedAt.Value;
        Aim(Center(fcell));
        await Frames(2);
        await Press("use");
        Check(G.Screen != null && G.Screen.Kind == ScreenKind.Furnace, "furnace opens");
        Give(Items.ByKey["iron_ore"], 2);
        Give(Items.Soot, 2);
        if (G.Screen != null)
        {
            await Frames(3);
            // Shift-click the ore and the soot across from the backpack.
            var slots = FindAll<SlotView>(G.Screen);
            foreach (var sv in slots)
            {
                if ((string)sv.Tag != "player") continue;
                var st = P.Inventory[sv.Index];
                if (st.Id == Items.ByKey["iron_ore"] || st.Id == Items.Soot) await Click(sv, shift: true);
            }
            await Shot("furnace");
        }
        var fe = W.GetEntity(fcell.X, fcell.Y, fcell.Z) as FurnaceEntity;
        Check(fe != null && fe.Inv[FurnaceEntity.In].Count == 2 && !fe.Inv[FurnaceEntity.FuelSlot].IsEmpty, "shift-click fills the furnace");
        G.CloseScreen();
        await GameSeconds(1.5f);
        Check(Blocks.Get(W.GetBlock(fcell.X, fcell.Y, fcell.Z)).IsLit, "the furnace lights up while burning");
        Check(W.BlockLight(fcell.X, fcell.Y + 1, fcell.Z) >= 11, $"and casts light ({W.BlockLight(fcell.X, fcell.Y + 1, fcell.Z)})");
        fe ??= new FurnaceEntity();
        Check(await UntilGame(() => fe.Inv[FurnaceEntity.Out].Count >= 2, 20f), "two iron ingots smelted");

        // --- hunting ---------------------------------------------------------------------
        P.Yaw = 90;
        await Frames(2);
        var ahead = P.Body.Position + new Vector3(-2.2f, 0, 0);
        var prey = G.Mobs.SpawnMob(MobKind.Mossback, ahead);
        prey.State = MobState.Idle; prey.StateTime = 30f;
        await Seconds(0.3f);
        await Shot("mossback");
        Hold(Items.ByKey["wooden_pick"]);
        Give(Items.ByKey["stone_blade"], 1);
        Hold(Items.ByKey["stone_blade"]);
        int hits = 0;
        for (int k = 0; k < 20 && !prey.Dead && !prey.Removed; k++)
        {
            Aim(prey.Position + new Vector3(0, 0.6f, 0));
            await Frames(1);
            if (P.TargetMob == prey) { await Press("attack"); hits++; }
            else if ((prey.Position - P.Body.Position).Length() > 3f) P.Teleport(prey.Position + new Vector3(2f, 0, 0));
            await Seconds(0.7f);
        }
        Check(prey.Dead || prey.Removed, $"the mossback falls after {hits} blade strikes");
        await GameSeconds(1.5f);
        // Walk over to whatever it dropped.
        foreach (var d in G.Drops.All)
            if (d.Stack.Id == Items.RawMossback) { P.Teleport(d.Body.Position + new Vector3(0.4f, 0.1f, 0)); break; }
        await GameSeconds(1.5f);
        int meat = P.Inventory.Count(Items.RawMossback);
        Check(meat >= 1, $"raw meat picked up ({meat})");

        // --- cooking and eating -----------------------------------------------------------
        var fe2 = fe;
        fe2.Inv[FurnaceEntity.In] = new ItemStack(Items.RawMossback, Math.Max(1, meat));
        P.Inventory.Remove(Items.RawMossback, meat);
        fe2.Inv[FurnaceEntity.FuelSlot] = new ItemStack(Items.Soot, 1);
        fe2.Inv[FurnaceEntity.Out] = ItemStack.Empty;
        Check(await UntilGame(() => fe2.Inv[FurnaceEntity.Out].Id == Items.MossbackSteak, 12f), "the meat cooks");
        P.Inventory.Add(fe2.Inv[FurnaceEntity.Out]);
        fe2.Inv[FurnaceEntity.Out] = ItemStack.Empty;
        P.Vitals.Hunger = 10;
        Hold(Items.MossbackSteak);
        Aim(P.Camera.GlobalPosition + new Vector3(0, 1, 0.01f));   // at the sky, so the click is not a block use
        Input.ActionPress("use");
        bool ate = await UntilGame(() => P.Vitals.Hunger > 10, 3f);
        Input.ActionRelease("use");
        Check(ate && P.Vitals.Hunger >= 18, $"eating a steak fills hunger ({P.Vitals.Hunger})");

        // --- shelter and light --------------------------------------------------------------
        // Build somewhere clear of the worktable and furnace, so a click is never a "use".
        G.CloseScreen();
        P.Teleport(new Vector3(fcell.X + 12.5f, fcell.Y + 2, fcell.Z + 0.5f));
        G.PlaceOnSurface();
        await GameSeconds(0.5f);
        Hold(Items.ByKey["elm_planks"]);
        int placed = 0;
        var f0 = new Vector3I(V.FloorToInt(P.Body.X), V.FloorToInt(P.Body.Y), V.FloorToInt(P.Body.Z));
        foreach (var (dx, dz) in new[] { (2, 1), (2, 0), (2, -1), (-2, 1), (-2, 0), (-2, -1) })
        {
            var at = new Vector3I(f0.X + dx, f0.Y - 1, f0.Z + dz);
            if (!W.GetDef(at.X, at.Y, at.Z).Solid || W.GetDef(at.X, at.Y + 1, at.Z).Solid) continue;
            Aim(new Vector3(at.X + 0.5f, at.Y + 1f, at.Z + 0.5f));
            await Frames(2);
            await Press("use");
            await GameSeconds(0.3f);
            G.CloseScreen();
            if (Near(new Vector3I(at.X, at.Y + 1, at.Z), id => id == Blocks.ElmPlanks, 1).HasValue) placed++;
        }
        Check(placed >= 3, $"planks placed around ({placed})");
        Give(Items.Torch, 8);
        Hold(Items.Torch);
        var wallTarget = FindNearest(id => id == Blocks.ElmPlanks, 4);
        if (wallTarget.HasValue)
        {
            var wt = wallTarget.Value;
            // Aim at a side face that looks back toward the player.
            var face = P.Body.Position.X > wt.X + 0.5f ? new Vector3(wt.X + 1.001f, wt.Y + 0.5f, wt.Z + 0.5f) : new Vector3(wt.X - 0.001f, wt.Y + 0.5f, wt.Z + 0.5f);
            Aim(face);
            await Frames(2);
            await Press("use");
            await Frames(3);
            var tcell = P.Target.Hit ? P.Target.Adjacent : wt;
            bool torch = FindNearest(id => Blocks.Get(id).Render == RenderKind.Torch, 4).HasValue;
            Check(torch, "a torch goes on the wall");
        }

        // --- storage -------------------------------------------------------------------------
        Give(Items.ByKey["crate"], 1);
        Hold(Items.ByKey["crate"]);
        var ccell = PlaceSpotNear(new Vector3I(V.FloorToInt(P.Body.X), V.FloorToInt(P.Body.Y), V.FloorToInt(P.Body.Z)), 1, exclude: fcell);
        Aim(new Vector3(ccell.X + 0.5f, ccell.Y, ccell.Z + 0.5f));
        await Frames(2);
        await Press("use");
        var crateAt = Near(ccell, id => id == Blocks.Crate);
        Check(crateAt.HasValue, "crate placed");
        if (crateAt.HasValue) ccell = crateAt.Value;
        Aim(Center(ccell));
        await Frames(2);
        await Press("use");
        Check(G.Screen != null && G.Screen.Kind == ScreenKind.Crate, "crate opens");
        int ingots = P.Inventory.Count(Items.IronIngot);
        Give(Items.IronIngot, 5);
        if (G.Screen != null)
        {
            await Frames(3);
            foreach (var sv in FindAll<SlotView>(G.Screen))
                if ((string)sv.Tag == "player" && P.Inventory[sv.Index].Id == Items.IronIngot) { await Click(sv, shift: true); break; }
            await Shot("crate");
        }
        G.CloseScreen();
        var crateEnt = W.GetEntity(ccell.X, ccell.Y, ccell.Z) as CrateEntity;
        Check(crateEnt != null && crateEnt.Inv.Count(Items.IronIngot) >= 5, "ingots stored in the crate");

        // --- farming -----------------------------------------------------------------------
        Give(Items.ByKey["wooden_hoe"], 1);
        Give(Items.GrainSeeds, 4);
        Hold(Items.ByKey["wooden_hoe"]);
        var soil = FindNearest(id => id == Blocks.Grass || id == Blocks.Dirt, 6, (x, y, z) => W.GetBlock(x, y + 1, z) == 0 || Blocks.Get(W.GetBlock(x, y + 1, z)).Replaceable);
        Check(soil.HasValue, "some soil to till");
        if (soil.HasValue)
        {
            var sc = soil.Value;
            if (W.GetBlock(sc.X, sc.Y + 1, sc.Z) != 0) W.SetBlock(sc.X, sc.Y + 1, sc.Z, 0);
            StandBeside(sc);
            await Frames(2);
            Aim(new Vector3(sc.X + 0.5f, sc.Y + 1f, sc.Z + 0.5f));
            await Frames(2);
            await Press("use");
            Check(W.GetBlock(sc.X, sc.Y, sc.Z) == Blocks.TilledSoil, "the hoe tills the soil");
            Hold(Items.GrainSeeds);
            Aim(new Vector3(sc.X + 0.5f, sc.Y + 1f, sc.Z + 0.5f));
            await Frames(2);
            await Press("use");
            Check(W.GetBlock(sc.X, sc.Y + 1, sc.Z) == Blocks.Grain, "seeds planted");
            // Let time pass for the crop.
            var rng = new Rng(5);
            for (int k = 0; k < 400 && W.GetBlock(sc.X, sc.Y + 1, sc.Z) != Blocks.Grain + 3; k++)
                W.RandomTicks(sc.X >> 4, sc.Z >> 4, 0, 400, ref rng, growthScale: 20f);
            Check(W.GetBlock(sc.X, sc.Y + 1, sc.Z) == Blocks.Grain + 3, "the crop ripens");
            int grain = P.Inventory.Count(Items.Grain);
            Aim(new Vector3(sc.X + 0.5f, sc.Y + 1.3f, sc.Z + 0.5f));
            await Frames(2);
            await Press("attack", 3);
            await Seconds(1.5f);
            Check(P.Inventory.Count(Items.Grain) > grain, "harvest gives goldgrain");
        }

        // --- a night visitor ------------------------------------------------------------
        G.View.Sky.Time = Math.Floor(G.View.Sky.Time) + 0.72;
        await Seconds(0.5f);
        Check(G.View.Sky.IsNight, "night falls");
        G.CloseScreen();
        P.Yaw = ClearHeading();
        await Frames(2);
        // Stand it on open ground a few steps in front of the player.
        float yr = Mathf.DegToRad(P.Yaw);
        var spot = P.Body.Position + new Vector3(-MathF.Sin(yr), 0, -MathF.Cos(yr)) * 5f;
        int hy = V.FloorToInt(spot.Y) + 3;
        while (hy > 2 && !W.GetDef(V.FloorToInt(spot.X), hy - 1, V.FloorToInt(spot.Z)).Solid) hy--;
        var hollow = G.Mobs.SpawnMob(MobKind.Hollow, new Vector3(spot.X, hy, spot.Z));
        P.Vitals.Health = 20;
        float hp0 = P.Vitals.Health;
        await Shot("night_hollow");
        Check(await UntilGame(() => P.Vitals.Health < hp0, 15f), "the hollow comes for you and strikes");
        Hold(Items.ByKey["stone_blade"]);
        for (int k = 0; k < 40 && !hollow.Dead && !hollow.Removed; k++)
        {
            Aim(hollow.Position + new Vector3(0, 1.4f, 0));
            await Frames(1);
            if (P.TargetMob == hollow) await Press("attack");
            await Seconds(0.6f);
            if (P.Dead) break;
        }
        Check(hollow.Dead || hollow.Removed, "and it can be fought off");
        await Seconds(2f);
        await Shot("after_fight");

        // --- falling --------------------------------------------------------------------
        P.Vitals.Health = 20;
        P.Vitals.Invulnerable = 0;
        var up = P.Body.Position + new Vector3(0, 12, 0);
        P.Teleport(up);
        P.Body.OnGround = false;
        await UntilGame(() => P.Body.Y < up.Y - 1f, 3f);
        Check(await UntilGame(() => P.Body.OnGround, 6f), "falls back to the ground");
        await GameSeconds(0.2f);
        Check(P.Vitals.Health <= 12f && P.Vitals.Health >= 6f, $"a 12 m fall hurts ({20 - P.Vitals.Health} damage)");

        // --- death and respawn ----------------------------------------------------------
        int carried = 0;
        foreach (var s in P.Inventory.Slots) if (!s.IsEmpty) carried++;
        var deathPos = P.Body.Position;
        P.Vitals.Invulnerable = 0;
        P.Vitals.Damage(100, DamageKind.Mob, ignoreInvuln: true);
        await Frames(3);
        deathPos = P.Body.Position;
        Check(G.State == GameState.Dead && G.DeathScreen != null, "death screen");
        await Shot("death");
        int nearDrops = 0;
        foreach (var d in G.Drops.All) if ((d.Body.Position - deathPos).Length() < 3f) nearDrops++;
        Check(nearDrops >= carried - 1 && carried > 0, $"the inventory lies where you fell ({nearDrops} drops for {carried} stacks)");
        G.Respawn();
        Check(await Until(() => G.State == GameState.Playing, 30f), "respawned");
        Check(!P.Dead && P.Vitals.Health == 20f, "alive and whole");

        // --- save, quit, reload ---------------------------------------------------------
        P.Teleport(deathPos);
        await Seconds(2.5f);
        int invItems = 0;
        foreach (var s in P.Inventory.Slots) invItems += s.Count;
        var savedPos = P.Body.Position;
        var savedTime = G.View.Sky.Time;
        G.Save();
        G.Shutdown();
        await Frames(10);

        var meta2 = WorldSave.TryLoad(_folder);
        Check(meta2 != null && meta2.HasPlayer, "the world reloads from disk");
        G = new Game { AutoCapture = false };
        G.Begin(meta2, settings);
        AddChild(G);
        Check(await Until(() => G.State == GameState.Playing, 90f), "and is playable again");
        await Seconds(1f);
        Check((P.Body.Position - savedPos).Length() < 2f, $"the player is where they saved ({P.Body.Position} vs {savedPos})");
        int invAfter = 0;
        foreach (var s in P.Inventory.Slots) invAfter += s.Count;
        Check(invAfter == invItems, $"the inventory came back ({invAfter} of {invItems} items)");
        Check(W.GetBlock(tablePos.X, tablePos.Y, tablePos.Z) == Blocks.Worktable, "the worktable is still there");
        Check(Blocks.Get(W.GetBlock(fcell.X, fcell.Y, fcell.Z)).Use == BlockUse.Furnace, "so is the furnace");
        var crate2 = W.GetEntity(ccell.X, ccell.Y, ccell.Z) as CrateEntity;
        Check(crate2 != null && crate2.Inv.Count(Items.IronIngot) >= 5, "and the crate still holds the ingots");
        Check(Math.Abs(G.View.Sky.Time - savedTime) < 0.01, "the clock carried over");
        await Shot("reloaded");

        await Finish();
    }

    /// <summary>A yaw (degrees) along which the next six blocks at body height are open.</summary>
    private float ClearHeading()
    {
        var p = P.Body.Position;
        for (int k = 0; k < 16; k++)
        {
            float yaw = k * 22.5f;
            float r = Mathf.DegToRad(yaw);
            var d = new Vector3(-MathF.Sin(r), 0, -MathF.Cos(r));
            bool clear = true;
            for (float s = 0.5f; s <= 6f && clear; s += 0.5f)
            {
                var q = p + d * s;
                int x = V.FloorToInt(q.X), y = V.FloorToInt(q.Y), z = V.FloorToInt(q.Z);
                if (W.GetDef(x, y, z).Solid || W.GetDef(x, y + 1, z).Solid || !W.GetDef(x, y - 1, z).Solid && !W.GetDef(x, y - 2, z).Solid) clear = false;
                if (W.GetBlock(x, y - 1, z) == Blocks.Water) clear = false;
            }
            if (clear) return yaw;
        }
        return 0f;
    }

    /// <summary>The nearest block of a kind around a point (placements can land a cell off from where a test aimed).</summary>
    private Vector3I? Near(Vector3I around, Func<ushort, bool> match, int r = 3)
    {
        Vector3I? best = null;
        int bestD = int.MaxValue;
        for (int y = around.Y - r; y <= around.Y + r; y++)
            for (int z = around.Z - r; z <= around.Z + r; z++)
                for (int x = around.X - r; x <= around.X + r; x++)
                {
                    if (!match(W.GetBlock(x, y, z))) continue;
                    int d = (x - around.X) * (x - around.X) + (y - around.Y) * (y - around.Y) + (z - around.Z) * (z - around.Z);
                    if (d < bestD) { bestD = d; best = new Vector3I(x, y, z); }
                }
        return best;
    }

    private int CountLogs()
    {
        int n = 0;
        foreach (var s in P.Inventory.Slots) if (!s.IsEmpty && Items.HasTag(s.Id, "logs")) n += s.Count;
        return n;
    }

    /// <summary>An empty cell on the ground near a spot, not on top of the player.</summary>
    private Vector3I PlaceSpotNear(Vector3I feet, int dist, Vector3I? exclude = null)
    {
        foreach (var (dx, dz) in new[] { (dist, 0), (-dist, 0), (0, dist), (0, -dist), (dist, dist), (-dist, -dist), (dist, -dist), (-dist, dist) })
        {
            for (int dy = 1; dy >= -2; dy--)
            {
                var c = new Vector3I(feet.X + dx, feet.Y + dy, feet.Z + dz);
                if (exclude.HasValue && c == exclude.Value) continue;
                if (W.GetDef(c.X, c.Y - 1, c.Z).Solid && W.GetDef(c.X, c.Y - 1, c.Z).Render == RenderKind.Cube
                    && Blocks.Get(W.GetBlock(c.X, c.Y, c.Z)).Replaceable && !W.GetDef(c.X, c.Y + 1, c.Z).Solid)
                    return c;
            }
        }
        return new Vector3I(feet.X + dist, feet.Y, feet.Z);
    }

    private async Task Finish()
    {
        GD.Print($"\nself test: {_pass} passed, {_fail} failed");
        foreach (var f in _log) GD.Print("  - " + f);
        await Frames(2);
        try { G?.Shutdown(); } catch { }
        if (_folder != null) WorldSave.Delete(_folder);
        GetTree().Quit(_fail == 0 ? 0 : 1);
    }
}
