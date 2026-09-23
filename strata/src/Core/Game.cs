using System;
using System.Text;
using Godot;

namespace Strata;

public enum GameState { Loading, Playing, Dead }

/// <summary>
/// One running world: owns the terrain, the player, the creatures, the drops,
/// the weather and the interface over them, and runs them each frame in a
/// fixed order. Saving writes the column files and the world's metadata.
/// </summary>
public sealed partial class Game : Node3D
{
    public static Game I;
    public App App;
    public Settings Settings;
    public WorldMeta Meta;
    public World World;
    public WorldView View;
    public ChunkStore Store;
    public Player Player;
    public DropManager Drops;
    public Particles Particles;
    public MobManager Mobs;
    public Weather Weather;
    public BlockOverlay Overlay;
    public Hud Hud;
    public CanvasLayer Ui;
    public InventoryScreen Screen;
    public Control PauseMenu, DeathScreen, LoadingScreen;
    public GameState State = GameState.Loading;
    public StatsSave Stats = new();
    public bool HudHidden;
    public bool AutoCapture = true;          // tests turn this off
    public double Clock;                     // game seconds played this session
    private float _autosave = 300f, _loadTime, _sleepFade, _tickAccum;
    private bool _sleeping;
    private Rng _tickRng = new(0xC0FFEE);
    private double _fpsTime;
    private int _fpsFrames;
    private float _fps;
    private Ambience _ambience;

    public bool Paused => PauseMenu != null;
    public bool InputBlocked => State != GameState.Playing || Screen != null || Paused || _sleeping;

    public void Begin(WorldMeta meta, Settings settings)
    {
        Meta = meta;
        Settings = settings;
    }

    public override void _Ready()
    {
        I = this;
        World = new World(Meta.Seed);
        Store = new ChunkStore(WorldSave.ChunkDir(Meta.Folder));

        Player = new Player { Name = "Player" };
        AddChild(Player);
        View = new WorldView { Name = "WorldView", Brightness = Settings.Brightness };
        AddChild(View);
        View.Init(World, Store, Player.Camera, Settings.RenderDistance);
        View.Sky.Time = Meta.Time;

        Particles = new Particles { Name = "Particles", World = World };
        AddChild(Particles);
        Drops = new DropManager { Name = "Drops" };
        AddChild(Drops);
        Mobs = new MobManager { Name = "Mobs", Game = this, World = World };
        AddChild(Mobs);
        Weather = new Weather { Name = "Weather", State = Meta.WeatherState, Timer = Meta.WeatherTimer, Intensity = Meta.Rain };
        AddChild(Weather);
        Overlay = new BlockOverlay { Name = "Overlay" };
        AddChild(Overlay);
        _ambience = new Ambience { Name = "Ambience" };
        AddChild(_ambience);

        Ui = new CanvasLayer { Layer = 5 };
        AddChild(Ui);
        Hud = new Hud { Game = this };
        Ui.AddChild(Hud);

        World.BlockBroken += OnBlockBroken;
        World.EntityRemoved += OnEntityRemoved;
        Drops.PickedUp += s => Sfx.Play("pickup", Player.EyePosition, 0.35f, 0.9f + (float)GD.RandRange(0, 0.3));
        Player.Vitals.Died += OnDied;

        // Where the player is: saved, or a fresh spawn.
        Stats = Meta.Stats ?? new StatsSave();
        if (Meta.HasPlayer)
        {
            var ps = Meta.Player;
            Player.Teleport(new Vector3((float)ps.X, (float)ps.Y, (float)ps.Z));
            Player.Yaw = ps.Yaw; Player.Pitch = ps.Pitch;
            var v = Player.Vitals;
            v.Health = ps.Health; v.Hunger = ps.Hunger; v.Saturation = ps.Saturation; v.Air = ps.Air;
            Player.Selected = Math.Clamp(ps.Selected, 0, 8);
            WorldSave.LoadInventory(Player.Inventory, ps.Inventory);
            Player.Spawn = new Vector3((float)ps.SpawnX, (float)ps.SpawnY, (float)ps.SpawnZ);
            Player.HasBedSpawn = ps.BedSpawn;
            if (v.Health <= 0) v.Health = 1;
        }
        else
        {
            var (sx, sy, sz) = World.Gen.FindSpawn();
            Player.Spawn = new Vector3(sx + 0.5f, sy, sz + 0.5f);
            Player.Teleport(Player.Spawn + new Vector3(0, 2, 0));
            Player.Yaw = 180f;
        }
        if (Meta.Drops != null)
            foreach (var d in Meta.Drops)
                if (Items.ByKey.TryGetValue(d.Item ?? "", out var id))
                {
                    var drop = Drops.Spawn(new ItemStack(id, d.Count, d.Wear), new Vector3((float)d.X, (float)d.Y + 0.14f, (float)d.Z), Vector3.Zero, 0f);
                    if (drop != null) drop.Age = d.Age;
                }

        Settings.ApplyDisplay();
        ApplyGraphics();
        LoadingScreen = Menus.Loading(this);
        Ui.AddChild(LoadingScreen);
        State = GameState.Loading;
        Player.Frozen = true;
        Input.MouseMode = Input.MouseModeEnum.Visible;
    }

    public void ApplyGraphics()
    {
        int q = Settings.Graphics;
        View.Chunks.Radius = Settings.RenderDistance;
        View.Brightness = Settings.Brightness;
        View.Sky.SetQuality(q >= 1);
        Particles.Density = q == 0 ? 0.4f : q == 1 ? 0.7f : 1f;
        Weather.Density = q == 0 ? 0.4f : 1f;
        Sfx.I?.SetVolume(Settings.MasterVolume);
        GetViewport().Msaa3D = q == 2 ? Viewport.Msaa.Msaa2X : Viewport.Msaa.Disabled;
    }

    // --- the frame ------------------------------------------------------------------------

    public override void _Process(double delta)
    {
        if (I != this) return;   // shut down and waiting to be freed
        float dt = (float)Math.Min(delta, 0.25);
        if (!Paused && State == GameState.Playing) Clock += dt;
        _fpsFrames++;
        _fpsTime += delta;
        if (_fpsTime >= 0.5) { _fps = (float)(_fpsFrames / _fpsTime); _fpsFrames = 0; _fpsTime = 0; }

        if (State == GameState.Loading) { StepLoading(dt); return; }

        bool frozen = Paused;
        View.Sky.Underwater = Player.Body.HeadInWater;
        View.Sky.BiomeHere = World.Gen.BiomeAt(V.FloorToInt(Player.Body.X), V.FloorToInt(Player.Body.Z));
        View.Chunks.Update(Player.Camera.GlobalPosition, dt);
        if (!frozen)
        {
            View.Sky.Update(dt, Player.Camera.GlobalPosition, View.Chunks.Radius * 16f, View.Brightness);
            Mobs.Daylight = View.Sky.Daylight;
            if (State == GameState.Playing) Player.Step(dt);
            Mobs.Step(dt, State == GameState.Playing ? Player : null);
            Drops.Step(dt, World, Player);
            Weather.Step(dt, this);
            World.TickEntities(dt);
            // Three random ticks per section per twentieth of a second.
            _tickAccum += dt;
            while (_tickAccum >= 0.05f)
            {
                _tickAccum -= 0.05f;
                World.RandomTicks(V.FloorToInt(Player.Body.X) >> 4, V.FloorToInt(Player.Body.Z) >> 4, 4, 3, ref _tickRng);
            }
            Meta.PlaySeconds += dt;
            _autosave -= dt;
            if (_autosave <= 0f) { _autosave = 300f; Save(); Hud.Toast("World saved", UiStyle.TextDim); }
        }
        else View.Sky.Update(0, Player.Camera.GlobalPosition, View.Chunks.Radius * 16f, View.Brightness);
        Overlay.Show(Player);
        _ambience.Step(dt, this);
        StepSleep(dt);
    }

    private void StepLoading(float dt)
    {
        _loadTime += dt;
        View.Chunks.Update(Player.Body.Position + new Vector3(0, 1.6f, 0), dt, 12.0);
        View.Sky.Update(0, Player.Body.Position, View.Chunks.Radius * 16f, View.Brightness);
        if (LoadingScreen is Menus.LoadingPanel lp) lp.SetProgress(View.Chunks, Player.Body.Position);
        if (!View.Chunks.AreaReady(Player.Body.Position, 2)) return;

        // Settle the player on solid ground if the saved spot is buried or in the air.
        if (!Meta.HasPlayer || Player.Body.Colliding(World)) PlaceOnSurface();
        Player.Frozen = false;
        State = GameState.Playing;
        LoadingScreen?.QueueFree();
        LoadingScreen = null;
        if (AutoCapture) Input.MouseMode = Input.MouseModeEnum.Captured;
        if (!Meta.HasPlayer)
        {
            Hud.Toast($"Welcome to {Meta.Name}", UiStyle.Accent);
            Hud.Toast("Punch a tree for logs. E opens your bag and the recipe book.", UiStyle.TextDim);
            Meta.HasPlayer = true;
        }
        GD.Print($"world ready in {_loadTime:0.0}s at {Player.Body.Position}");
    }

    /// <summary>Puts the player on the highest safe block of their column (or a nearby one).</summary>
    public void PlaceOnSurface()
    {
        var p = Player.Body.Position;
        for (int r = 0; r < 8; r++)
            for (int dz = -r; dz <= r; dz++)
                for (int dx = -r; dx <= r; dx++)
                {
                    if (Math.Max(Math.Abs(dx), Math.Abs(dz)) != r) continue;
                    int x = V.FloorToInt(p.X) + dx, z = V.FloorToInt(p.Z) + dz;
                    for (int y = V.Height - 3; y > 1; y--)
                    {
                        var below = World.GetDef(x, y - 1, z);
                        if (!below.Solid || below.Id == Blocks.Lava) continue;
                        if (World.GetDef(x, y, z).Solid || World.GetDef(x, y + 1, z).Solid) break;
                        if (World.GetBlock(x, y, z) == Blocks.Lava || Blocks.Get(World.GetBlock(x, y - 1, z)).Id == Blocks.Water) break;
                        Player.Teleport(new Vector3(x + 0.5f, y, z + 0.5f));
                        return;
                    }
                }
    }

    // --- world events -----------------------------------------------------------------------

    private void OnBlockBroken(int x, int y, int z, ushort id, bool drop)
    {
        var def = Blocks.Get(id);
        Particles.BlockBreak(x, y, z, id);
        Sfx.Play(Sfx.BlockSound(def, "break"), new Vector3(x + 0.5f, y + 0.5f, z + 0.5f), 0.9f);
        if (!drop) return;
        var rng = new Random();
        if (def.DropItem != 0 && rng.NextDouble() < def.DropChance)
            Drops.SpawnAtBlock(new ItemStack(def.DropItem, rng.Next(def.DropMin, def.DropMax + 1)), x, y, z);
        if (def.ExtraResolved != null)
            foreach (var (item, chance, min, max) in def.ExtraResolved)
                if (rng.NextDouble() < chance) Drops.SpawnAtBlock(new ItemStack(item, rng.Next(min, max + 1)), x, y, z);
        if (Player != null && (new Vector3(x, y, z) - Player.Body.Position).Length() < 8) Stats.Mined++;
    }

    private void OnEntityRemoved(int x, int y, int z, BlockEntity e)
    {
        Inventory inv = e switch { CrateEntity c => c.Inv, FurnaceEntity f => f.Inv, _ => null };
        if (e is CrateEntity crate && crate.Loot != null) { Loot.Fill(crate.Inv, crate.Loot, crate.LootSeed); crate.Loot = null; }
        if (inv == null) return;
        foreach (var s in inv.Slots) if (!s.IsEmpty) Drops.SpawnAtBlock(s, x, y, z);
        if (Screen != null && Screen.Entity == e) CloseScreen();
    }

    private void OnDied(DamageKind kind)
    {
        State = GameState.Dead;
        Stats.Deaths++;
        CloseScreen();
        // Everything you carried stays where you fell.
        var at = Player.Body.Position + new Vector3(0, 0.6f, 0);
        var rng = new Random();
        for (int i = 0; i < Player.Inventory.Size; i++)
        {
            var s = Player.Inventory[i];
            if (s.IsEmpty) continue;
            Drops.Spawn(s, at, new Vector3((float)rng.NextDouble() * 4 - 2, 3f, (float)rng.NextDouble() * 4 - 2), 1f);
        }
        Player.Inventory.Clear();
        Sfx.Ui("death", 0.9f);
        Input.MouseMode = Input.MouseModeEnum.Visible;
        DeathScreen = Menus.Death(this, kind);
        Ui.AddChild(DeathScreen);
    }

    public void Respawn()
    {
        DeathScreen?.QueueFree();
        DeathScreen = null;
        Player.Vitals.Reset();
        if (Player.HasBedSpawn && World.IsReady(V.FloorToInt(Player.Spawn.X), V.FloorToInt(Player.Spawn.Z))
            && World.GetBlock(V.FloorToInt(Player.Spawn.X), V.FloorToInt(Player.Spawn.Y) - 1, V.FloorToInt(Player.Spawn.Z)) != Blocks.Bedroll)
        {
            Hud.Toast("Your bedroll is gone; back to where you first arrived", UiStyle.TextDim);
            Player.HasBedSpawn = false;
            Player.Spawn = WorldSpawn();
        }
        Player.Teleport(Player.Spawn + new Vector3(0, 0.5f, 0));
        Player.Frozen = true;
        State = GameState.Loading;
        _loadTime = 0;
        LoadingScreen = Menus.Loading(this);
        Ui.AddChild(LoadingScreen);
        Meta.HasPlayer = false; // settle on the surface when the area is ready
    }

    public void Toast(string text) => Hud?.Toast(text);

    public Vector3 WorldSpawn()
    {
        var (sx, sy, sz) = World.Gen.FindSpawn();
        return new Vector3(sx + 0.5f, sy, sz + 0.5f);
    }

    // --- screens ------------------------------------------------------------------------

    public void OpenScreen(ScreenKind kind, Vector3I cell)
    {
        if (Screen != null || State != GameState.Playing) return;
        BlockEntity ent = null;
        if (kind is ScreenKind.Crate or ScreenKind.Furnace)
        {
            ent = World.GetEntity(cell.X, cell.Y, cell.Z);
            if (ent == null)
            {
                ent = kind == ScreenKind.Crate ? new CrateEntity() : new FurnaceEntity();
                World.SetEntity(cell.X, cell.Y, cell.Z, ent);
            }
            if (ent is CrateEntity c && c.Loot != null)
            {
                Loot.Fill(c.Inv, c.Loot, c.LootSeed);
                c.Loot = null;
                World.ChunkAt(cell.X, cell.Z).Modified = true;
            }
        }
        Screen = new InventoryScreen { Game = this, Kind = kind, Cell = cell, Entity = ent };
        Ui.AddChild(Screen);
        Input.MouseMode = Input.MouseModeEnum.Visible;
    }

    public void CloseScreen()
    {
        if (Screen == null) return;
        Screen.ReturnCursor();
        if (Screen.Entity != null)
        {
            var c = World.ChunkAt(Screen.Cell.X, Screen.Cell.Z);
            if (c != null) c.Modified = true;
            if (Screen.Kind == ScreenKind.Crate) Sfx.Play("crate_close", new Vector3(Screen.Cell.X + 0.5f, Screen.Cell.Y + 0.5f, Screen.Cell.Z + 0.5f), 0.6f);
        }
        Screen.QueueFree();
        Screen = null;
        if (!Paused && State == GameState.Playing && AutoCapture) Input.MouseMode = Input.MouseModeEnum.Captured;
    }

    public void SetPaused(bool paused)
    {
        if (paused == Paused || State == GameState.Dead) return;
        if (paused)
        {
            CloseScreen();
            PauseMenu = Menus.Pause(this);
            Ui.AddChild(PauseMenu);
            Input.MouseMode = Input.MouseModeEnum.Visible;
        }
        else
        {
            PauseMenu.QueueFree();
            PauseMenu = null;
            if (State == GameState.Playing && AutoCapture) Input.MouseMode = Input.MouseModeEnum.Captured;
        }
    }

    public override void _UnhandledInput(InputEvent e)
    {
        if (e.IsActionPressed("pause"))
        {
            if (Screen != null) CloseScreen();
            else if (State == GameState.Playing) SetPaused(!Paused);
            GetViewport().SetInputAsHandled();
            return;
        }
        if (e.IsActionPressed("inventory") && State == GameState.Playing && !Paused)
        {
            if (Screen != null) CloseScreen();
            else OpenScreen(ScreenKind.Inventory, default);
            GetViewport().SetInputAsHandled();
            return;
        }
        if (e.IsActionPressed("debug")) Hud.ShowDebug = !Hud.ShowDebug;
        if (e.IsActionPressed("hide_hud")) { HudHidden = !HudHidden; Hud.Visible = !HudHidden; }
        if (e.IsActionPressed("screenshot")) TakeScreenshot();
        // Clicking back into the window recaptures the mouse.
        if (e is InputEventMouseButton mb && mb.Pressed && !InputBlocked && Input.MouseMode != Input.MouseModeEnum.Captured && AutoCapture)
            Input.MouseMode = Input.MouseModeEnum.Captured;
        // Feeding livestock.
        if (e.IsActionPressed("use") && !InputBlocked && Player.TargetMob != null && Player.HeldStack.Id == Items.Grain)
        {
            if (Mobs.Feed(Player.TargetMob))
            {
                var s = Player.Inventory[Player.Selected];
                Player.Inventory[Player.Selected] = s.WithCount(s.Count - 1);
            }
        }
    }

    public override void _Notification(int what)
    {
        if (what == NotificationWMWindowFocusOut && State == GameState.Playing && !Paused && Screen == null && AutoCapture) SetPaused(true);
        if (what == NotificationWMCloseRequest) { Save(); }
    }

    private void TakeScreenshot()
    {
        var img = GetViewport().GetTexture().GetImage();
        var dir = ProjectSettings.GlobalizePath("user://screenshots");
        System.IO.Directory.CreateDirectory(dir);
        var path = System.IO.Path.Combine(dir, $"strata_{DateTime.Now:yyyyMMdd_HHmmss}.png");
        img.SavePng(path);
        Hud.Toast("Screenshot saved to " + path, UiStyle.TextDim);
    }

    // --- sleep --------------------------------------------------------------------------

    public void TrySleep(Vector3I bed)
    {
        Player.Spawn = new Vector3(bed.X + 0.5f, bed.Y + 1f, bed.Z + 0.5f);
        Player.HasBedSpawn = true;
        if (!View.Sky.IsNight) { Hud.Toast("Spawn point set. You can only sleep at night."); return; }
        foreach (var m in Mobs.All)
            if (m.Def.Hostile && !m.Dead && (m.Position - Player.Body.Position).Length() < 12f)
            {
                Hud.Toast("You cannot rest with something hunting nearby", UiStyle.Bad);
                return;
            }
        _sleeping = true;
        _sleepFade = 0f;
        Hud.Toast("Spawn point set. Sleeping...");
    }

    private void StepSleep(float dt)
    {
        if (!_sleeping) { Hud.Fade = Math.Max(0f, Hud.Fade - dt * 1.5f); return; }
        _sleepFade += dt;
        Hud.Fade = Math.Min(1f, _sleepFade / 1.5f);
        if (_sleepFade >= 2.2f)
        {
            // Sleep until just after sunrise.
            double t = View.Sky.Time;
            View.Sky.Time = Math.Floor(t) + 1.0 + 0.01;
            Weather.State = 0; Weather.Intensity = 0f;
            _sleeping = false;
            foreach (var m in Mobs.All) if (m.Def.Hostile && m.Def.Nocturnal) m.Removed = true;
            Hud.Toast("Good morning");
        }
    }

    // --- saving -------------------------------------------------------------------------

    public void Save()
    {
        if (Meta == null) return;
        var ps = Meta.Player;
        var b = Player.Body;
        ps.X = b.X; ps.Y = b.Y; ps.Z = b.Z;
        ps.Yaw = Player.Yaw; ps.Pitch = Player.Pitch;
        var v = Player.Vitals;
        ps.Health = Math.Max(v.Health, State == GameState.Dead ? 20 : 1); ps.Hunger = v.Hunger; ps.Saturation = v.Saturation; ps.Air = v.Air;
        ps.Selected = Player.Selected;
        ps.Inventory = WorldSave.SaveInventory(Player.Inventory);
        ps.SpawnX = Player.Spawn.X; ps.SpawnY = Player.Spawn.Y; ps.SpawnZ = Player.Spawn.Z;
        ps.BedSpawn = Player.HasBedSpawn;
        if (State == GameState.Dead) { ps.X = Player.Spawn.X; ps.Y = Player.Spawn.Y + 0.5; ps.Z = Player.Spawn.Z; ps.Health = 20; }
        Meta.Time = View.Sky.Time;
        Meta.WeatherState = Weather.State; Meta.WeatherTimer = Weather.Timer; Meta.Rain = Weather.Intensity;
        Meta.Drops.Clear();
        foreach (var d in Drops.All)
        {
            if (d.Dead || d.Stack.IsEmpty) continue;
            Meta.Drops.Add(new DropSave { Item = d.Stack.Def.Key, Count = d.Stack.Count, Wear = d.Stack.Wear, X = d.Body.X, Y = d.Body.Y, Z = d.Body.Z, Age = d.Age });
        }
        Stats.Kills = Player.Kills; Stats.Placed = Player.BlocksPlaced;
        Meta.Stats = Stats;
        Meta.LastPlayed = DateTime.Now;
        int n = View.Chunks.SaveAll();
        WorldSave.Write(Meta);
        GD.Print($"saved {Meta.Name}: {n} changed columns");
    }

    public void QuitToMenu()
    {
        Save();
        Shutdown();
        App.ShowMenu();
    }

    public void Shutdown()
    {
        View.Chunks.Jobs.Clear();
        View.Chunks.Jobs.Drain(5000);
        Store.Dispose();
        I = null;
        QueueFree();
    }

    // --- debug readout ------------------------------------------------------------------

    public string DebugText()
    {
        var sb = new StringBuilder();
        var b = Player.Body;
        int x = V.FloorToInt(b.X), y = V.FloorToInt(b.Y), z = V.FloorToInt(b.Z);
        var c = View.Chunks;
        sb.AppendLine($"STRATA  {_fps:0} fps  ({1000f / Math.Max(1f, _fps):0.0} ms)   chunk update {c.LastUpdateMs:0.00} ms");
        sb.AppendLine($"XYZ {b.X:0.00} / {b.Y:0.00} / {b.Z:0.00}   block {x} {y} {z}");
        sb.AppendLine($"chunk {x >> 4} {z >> 4}  local {x & 15} {y} {z & 15}   facing {Facing()}");
        var col = World.Gen.Sample(x, z);
        sb.AppendLine($"biome {Biomes.Get(col.Biome).Name}   temp {col.Temp:0.00} hum {col.Hum:0.00} cont {col.Cont:0.00} ero {col.Ero:0.00}");
        byte l = World.GetLight(x, y, z);
        sb.AppendLine($"light sky {l >> 4} block {l & 15}   daylight {View.Sky.Daylight:0.00}   {View.Sky.Clock} day {View.Sky.Day + 1}");
        sb.AppendLine($"seed {Meta.SeedText} ({World.Seed})");
        sb.AppendLine($"columns loaded {World.Chunks.Count}   radius {c.Radius}   queued gen {c.InFlightGen} light {c.InFlightLight} mesh {c.InFlightMesh}   jobs {c.Jobs.Pending}");
        sb.AppendLine($"triangles {c.Triangles:N0} world, {Performance.GetMonitor(Performance.Monitor.RenderTotalPrimitivesInFrame):N0} drawn   draw calls {Performance.GetMonitor(Performance.Monitor.RenderTotalDrawCallsInFrame):0}");
        sb.AppendLine($"memory {GC.GetTotalMemory(false) / 1048576.0:0} MB managed, {OS.GetStaticMemoryUsage() / 1048576.0:0} MB engine");
        sb.AppendLine($"creatures {Mobs.All.Count} ({Mobs.CountPassive} passive, {Mobs.CountHostile} hostile)   drops {Drops.All.Count}   weather {(Weather.State == 0 ? "clear" : Weather.State == 1 ? "rain" : "storm")} {Weather.Intensity:0.00}");
        if (Player.Target.Hit)
        {
            var t = Player.Target;
            sb.AppendLine($"looking at {Blocks.Get(t.Id).Key} {t.X} {t.Y} {t.Z} face {t.Face}");
        }
        return sb.ToString();
    }

    private string Facing()
    {
        float yaw = ((Player.Yaw % 360f) + 360f) % 360f;
        return ((int)MathF.Round(yaw / 90f) % 4) switch { 0 => "north (-Z)", 1 => "west (-X)", 2 => "south (+Z)", _ => "east (+X)" };
    }
}
