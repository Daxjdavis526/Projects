using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

public enum ScreenKind { None, Inventory, Worktable, Furnace, Crate }

/// <summary>
/// The backpack and whatever you opened: the player's 36 slots with a recipe
/// book beside them (hand recipes everywhere, the full book at a worktable),
/// or a crate's contents, or a furnace. Items move with a cursor stack: left
/// click takes, drops, merges or swaps; right click splits or places one;
/// shift-click sends a stack across.
/// </summary>
public sealed partial class InventoryScreen : Control
{
    public Game Game;
    public ScreenKind Kind;
    public Vector3I Cell;
    public BlockEntity Entity;
    public ItemStack Cursor;
    private SlotView _dragFrom;          // a stack picked up by pressing here may be dropped by releasing elsewhere

    private Inventory Inv => Game.Player.Inventory;
    private VBoxContainer _recipes;
    private Label _title, _station, _armorLabel;
    private readonly List<(Recipe recipe, Button button, SlotView icon)> _recipeRows = new();
    private int _lastVersion = -1;
    private Control _furnaceGauges;
    private ColorRect _flame, _arrow;
    private string _filter = "all";

    public override void _Ready()
    {
        UiStyle.FillParent(this);
        Theme = UiStyle.Theme;
        MouseFilter = MouseFilterEnum.Stop;

        var dim = new ColorRect { Color = new Color(0, 0, 0, 0.45f), MouseFilter = MouseFilterEnum.Ignore };
        UiStyle.FillParent(dim);
        AddChild(dim);

        var row = new HBoxContainer { Alignment = BoxContainer.AlignmentMode.Center };
        row.AddThemeConstantOverride("separation", 16);
        UiStyle.FillParent(row);
        AddChild(row);

        // --- left: recipe book or container ------------------------------------------------
        var left = new PanelContainer { CustomMinimumSize = new Vector2(420, 560), SizeFlagsVertical = SizeFlags.ShrinkCenter };
        row.AddChild(left);
        var leftBox = new VBoxContainer();
        leftBox.AddThemeConstantOverride("separation", 8);
        left.AddChild(leftBox);
        _title = UiStyle.Label("", 22, UiStyle.Accent);
        leftBox.AddChild(_title);
        _station = UiStyle.Label("", 15, UiStyle.TextDim);
        leftBox.AddChild(_station);

        if (Kind == ScreenKind.Crate) BuildCrate(leftBox);
        else if (Kind == ScreenKind.Furnace) BuildFurnace(leftBox);
        else BuildRecipes(leftBox);

        // --- right: the player's own slots -----------------------------------------------------
        var right = new PanelContainer { SizeFlagsVertical = SizeFlags.ShrinkCenter };
        row.AddChild(right);
        var rbox = new VBoxContainer();
        rbox.AddThemeConstantOverride("separation", 8);
        right.AddChild(rbox);
        rbox.AddChild(UiStyle.Label("Inventory", 22, UiStyle.Accent));
        // Armour: head, chest, legs, feet, and what it adds up to.
        var armorRow = new HBoxContainer();
        armorRow.AddThemeConstantOverride("separation", 4);
        rbox.AddChild(armorRow);
        string[] ghosts = { "hide_hood", "hide_jerkin", "hide_breeches", "hide_boots" };
        for (int a = 0; a < 4; a++)
        {
            int k = a;
            armorRow.AddChild(new SlotView
            {
                Index = k, Tag = "armor", Source = () => Game.Player.Armor[k], Clicked = OnSlot,
                Ghost = Icons.Get(Items.ByKey[ghosts[k]]), TooltipText = Items.ArmorSlotNames[k],
            });
        }
        armorRow.AddChild(UiStyle.Spacer(10));
        _armorLabel = UiStyle.Label("", 15, UiStyle.TextDim);
        _armorLabel.SizeFlagsVertical = SizeFlags.ShrinkCenter;
        armorRow.AddChild(_armorLabel);
        var grid = new GridContainer { Columns = 9 };
        grid.AddThemeConstantOverride("h_separation", 4);
        grid.AddThemeConstantOverride("v_separation", 4);
        rbox.AddChild(grid);
        for (int i = 9; i < 36; i++) grid.AddChild(PlayerSlot(i));
        rbox.AddChild(UiStyle.Spacer(8));
        var hot = new GridContainer { Columns = 9 };
        hot.AddThemeConstantOverride("h_separation", 4);
        rbox.AddChild(hot);
        for (int i = 0; i < 9; i++) hot.AddChild(PlayerSlot(i));
        rbox.AddChild(UiStyle.Spacer(6));
        rbox.AddChild(UiStyle.Label("Left: take / place  ·  Right: split / one  ·  Shift: move across  ·  1-9: to hotbar  ·  E: close", 14, UiStyle.TextDim));

        var v = Game.Player.Vitals;
        rbox.AddChild(UiStyle.Label($"Health {v.Health:0}/20   Hunger {v.Hunger:0}/20   Blocks mined {Game.Player.BlocksMined}   Creatures felled {Game.Player.Kills}", 14, UiStyle.TextDim));
    }

    private SlotView PlayerSlot(int i)
    {
        var s = new SlotView { Index = i, Tag = "player", Source = () => Inv[i], Clicked = OnSlot };
        return s;
    }

    // --- recipe book -----------------------------------------------------------------------

    private bool AtWorktable => Kind == ScreenKind.Worktable;

    private void BuildRecipes(VBoxContainer box)
    {
        _title.Text = AtWorktable ? "Worktable" : "Crafting";
        _station.Text = AtWorktable ? "Every recipe is open here." : "Hand recipes. Build a worktable (4 planks) for tools and more.";
        var filters = new HFlowContainer();
        filters.AddThemeConstantOverride("h_separation", 4);
        filters.AddThemeConstantOverride("v_separation", 4);
        box.AddChild(filters);
        foreach (var (key, label) in new[] { ("all", "All"), ("basics", "Basics"), ("tools", "Tools"), ("building", "Building"), ("stations", "Stations"), ("armour", "Armour"), ("circuits", "Circuits"), ("food", "Food") })
        {
            var b = new Button { Text = label, CustomMinimumSize = new Vector2(0, 32), ToggleMode = true, ButtonPressed = key == _filter };
            b.AddThemeFontSizeOverride("font_size", 14);
            b.Pressed += () => { _filter = key; foreach (var c in filters.GetChildren()) if (c is Button bb) bb.ButtonPressed = bb == b; _lastVersion = -1; };
            filters.AddChild(b);
        }
        var scroll = new ScrollContainer { CustomMinimumSize = new Vector2(400, 440), HorizontalScrollMode = ScrollContainer.ScrollMode.Disabled };
        box.AddChild(scroll);
        _recipes = new VBoxContainer { SizeFlagsHorizontal = SizeFlags.ExpandFill };
        _recipes.AddThemeConstantOverride("separation", 4);
        scroll.AddChild(_recipes);
    }

    private void RefreshRecipes()
    {
        _recipeRows.Clear();
        foreach (var c in _recipes.GetChildren()) c.QueueFree();

        // Craftable first, then what is close, then the rest.
        var list = new List<(Recipe r, int can, int have)>();
        foreach (var r in Recipes.All)
        {
            if (!Recipes.Available(r, AtWorktable)) continue;
            if (_filter != "all" && r.Group != _filter) continue;
            int can = Recipes.Craftable(Inv, r);
            int have = 0;
            foreach (var ing in r.In) have += Math.Min(ing.Count, Inv.CountMatching(ing));
            list.Add((r, can, have));
        }
        // Unpacking a metal block is almost never what you are looking for: it goes last.
        static int Rank(Recipe r) => r.In.Length == 1 && r.In[0].Item != 0 && r.Output.Count == 9 ? 1 : 0;
        list.Sort((a, b) =>
        {
            if (a.can > 0 != b.can > 0) return a.can > 0 ? -1 : 1;
            int ra = Rank(a.r), rb = Rank(b.r);
            if (ra != rb) return ra.CompareTo(rb);
            if (a.have != b.have) return b.have.CompareTo(a.have);
            return a.r.Index.CompareTo(b.r.Index);
        });

        foreach (var (r, can, _) in list)
        {
            var line = new HBoxContainer();
            line.AddThemeConstantOverride("separation", 8);
            var icon = new SlotView { Size = 44, Source = () => r.Output, ShowTooltip = true, MouseFilter = MouseFilterEnum.Pass };
            line.AddChild(icon);
            var text = new VBoxContainer { SizeFlagsHorizontal = SizeFlags.ExpandFill };
            text.AddThemeConstantOverride("separation", 0);
            var name = UiStyle.Label(r.Output.Count > 1 ? $"{r.Output.Def.Name} ×{r.Output.Count}" : r.Output.Def.Name, 16, can > 0 ? UiStyle.Text : UiStyle.TextDim);
            text.AddChild(name);
            var parts = new List<string>();
            foreach (var ing in r.In)
            {
                int have = Inv.CountMatching(ing);
                parts.Add($"{ing.Count} {ing.Label}" + (have < ing.Count ? $" ({have})" : ""));
            }
            var need = UiStyle.Label(string.Join(" + ", parts), 13, can > 0 ? UiStyle.Good : UiStyle.TextDim);
            need.AutowrapMode = TextServer.AutowrapMode.WordSmart;
            need.CustomMinimumSize = new Vector2(220, 0);
            text.AddChild(need);
            line.AddChild(text);
            var btn = new Button { Text = can > 0 ? "Make" : "—", Disabled = can <= 0, CustomMinimumSize = new Vector2(70, 40), TooltipText = "Shift-click to make as many as you can" };
            btn.AddThemeFontSizeOverride("font_size", 15);
            var rr = r;
            btn.GuiInput += e =>
            {
                if (e is InputEventMouseButton mb && mb.Pressed && mb.ButtonIndex == MouseButton.Left && !btn.Disabled)
                {
                    Craft(rr, mb.ShiftPressed ? 64 : 1);
                    btn.AcceptEvent();
                }
            };
            line.AddChild(btn);
            _recipes.AddChild(line);
            _recipeRows.Add((r, btn, icon));
        }
    }

    private void Craft(Recipe r, int times)
    {
        int made = 0;
        for (int i = 0; i < times; i++)
        {
            if (!Recipes.TryCraft(Inv, r, out var output)) break;
            made++;
            var left = Inv.Add(output);
            if (!left.IsEmpty) Game.Player.DropStack(left);
        }
        if (made > 0)
        {
            Sfx.Ui("craft", 0.7f);
            Game.Stats.Crafted += made;
        }
    }

    // --- containers ------------------------------------------------------------------------

    private void BuildCrate(VBoxContainer box)
    {
        _title.Text = "Storage Crate";
        _station.Text = "27 slots. Breaking the crate spills what is inside.";
        var crate = (CrateEntity)Entity;
        var grid = new GridContainer { Columns = 9 };
        grid.AddThemeConstantOverride("h_separation", 4);
        grid.AddThemeConstantOverride("v_separation", 4);
        box.AddChild(grid);
        for (int i = 0; i < crate.Inv.Size; i++)
        {
            int k = i;
            grid.AddChild(new SlotView { Index = i, Tag = "entity", Source = () => crate.Inv[k], Clicked = OnSlot });
        }
        var sort = UiStyle.Button("Sort", () => SortInventory(crate.Inv), 120);
        box.AddChild(sort);
    }

    private void BuildFurnace(VBoxContainer box)
    {
        _title.Text = "Furnace";
        _station.Text = "Ore, sand, clay or raw food on top; fuel below.";
        var f = (FurnaceEntity)Entity;
        var grid = new GridContainer { Columns = 3 };
        grid.AddThemeConstantOverride("h_separation", 18);
        grid.AddThemeConstantOverride("v_separation", 10);
        box.AddChild(UiStyle.Spacer(30));
        var center = new CenterContainer();
        box.AddChild(center);
        center.AddChild(grid);
        grid.AddChild(new SlotView { Index = FurnaceEntity.In, Tag = "entity", Source = () => f.Inv[FurnaceEntity.In], Clicked = OnSlot });
        _arrow = new ColorRect { Color = UiStyle.Accent, CustomMinimumSize = new Vector2(0, 10), SizeFlagsVertical = SizeFlags.ShrinkCenter };
        var arrowBox = new Control { CustomMinimumSize = new Vector2(90, 52) };
        var arrowBg = new ColorRect { Color = new Color(0.2f, 0.2f, 0.24f), Position = new Vector2(0, 21), Size = new Vector2(90, 10) };
        arrowBox.AddChild(arrowBg);
        _arrow.Position = new Vector2(0, 21);
        _arrow.Size = new Vector2(0, 10);
        arrowBox.AddChild(_arrow);
        grid.AddChild(arrowBox);
        grid.AddChild(new SlotView { Index = FurnaceEntity.Out, Tag = "entity", Source = () => f.Inv[FurnaceEntity.Out], Clicked = OnSlot });
        var flameBox = new Control { CustomMinimumSize = new Vector2(52, 40) };
        var flameBg = new ColorRect { Color = new Color(0.2f, 0.2f, 0.24f), Position = new Vector2(18, 4), Size = new Vector2(16, 32) };
        flameBox.AddChild(flameBg);
        _flame = new ColorRect { Color = new Color(1f, 0.55f, 0.15f), Position = new Vector2(18, 36), Size = new Vector2(16, 0) };
        flameBox.AddChild(_flame);
        grid.AddChild(flameBox);
        grid.AddChild(new Control());
        grid.AddChild(new Control());
        grid.AddChild(new SlotView { Index = FurnaceEntity.FuelSlot, Tag = "entity", Source = () => f.Inv[FurnaceEntity.FuelSlot], Clicked = OnSlot });
        box.AddChild(UiStyle.Spacer(20));
        box.AddChild(UiStyle.Label("Fuel: planks, logs, sticks, soot, charcoal.\nSoot and charcoal burn for 80 seconds.", 14, UiStyle.TextDim));
    }

    private static void SortInventory(Inventory inv)
    {
        var items = new List<ItemStack>();
        foreach (var s in inv.Slots) if (!s.IsEmpty) items.Add(s);
        inv.Clear();
        items.Sort((a, b) => a.Id != b.Id ? a.Id.CompareTo(b.Id) : b.Count.CompareTo(a.Count));
        foreach (var s in items) inv.Add(s);
    }

    // --- clicks -----------------------------------------------------------------------------

    private Inventory InvFor(SlotView s) => (string)s.Tag switch
    {
        "entity" => Entity is CrateEntity c ? c.Inv : ((FurnaceEntity)Entity).Inv,
        "armor" => Game.Player.Armor,
        _ => Inv,
    };

    /// <summary>Only the right piece goes in an armour slot.</summary>
    private static bool Fits(SlotView view, in ItemStack s) =>
        (string)view.Tag != "armor" || s.IsEmpty || (s.Def.IsArmor && s.Def.ArmorSlot == view.Index);

    private void OnSlot(SlotView view, MouseButton button, bool shift)
    {
        var inv = InvFor(view);
        int i = view.Index;
        bool furnaceOut = Kind == ScreenKind.Furnace && (string)view.Tag == "entity" && i == FurnaceEntity.Out;

        if (shift && button == MouseButton.Left)
        {
            QuickMove(inv, i, view);
            Sfx.Ui("click", 0.4f, 1.3f);
            return;
        }
        var slot = inv.Slots[i];
        if (!Fits(view, Cursor)) { Sfx.Ui("click", 0.3f, 0.6f); return; }
        if ((string)view.Tag == "armor") button = MouseButton.Left;     // armour does not split
        if (furnaceOut)
        {
            // Output only comes out.
            if (slot.IsEmpty) return;
            if (Cursor.IsEmpty) { Cursor = slot; inv[i] = ItemStack.Empty; }
            else if (Cursor.CanStackWith(slot) && Cursor.Count + slot.Count <= Cursor.Def.MaxStack) { Cursor.Count += slot.Count; inv[i] = ItemStack.Empty; }
            Sfx.Ui("click", 0.4f, 1.2f);
            return;
        }
        bool wasEmpty = Cursor.IsEmpty;
        if (button == MouseButton.Left) SlotOps.LeftClick(ref Cursor, ref slot);
        else SlotOps.RightClick(ref Cursor, ref slot);
        inv[i] = slot;
        _dragFrom = button == MouseButton.Left && wasEmpty && !Cursor.IsEmpty ? view : null;
        Sfx.Ui("click", 0.35f, 1.1f);
    }

    private bool IsOutput(SlotView v) => Kind == ScreenKind.Furnace && (string)v.Tag == "entity" && v.Index == FurnaceEntity.Out;

    /// <summary>Releasing a dragged stack over another slot drops it there; whatever was there goes back where the drag began.</summary>
    private void EndDrag(Vector2 at)
    {
        var from = _dragFrom;
        _dragFrom = null;
        if (from == null || Cursor.IsEmpty) return;
        var target = SlotAt(this, at);
        if (target == null || target == from || target.Clicked == null) return;
        OnSlot(target, MouseButton.Left, false);
        _dragFrom = null;
        var back = InvFor(from);
        if (!Cursor.IsEmpty && !IsOutput(from) && back[from.Index].IsEmpty && Fits(from, Cursor)) { back[from.Index] = Cursor; Cursor = ItemStack.Empty; }
    }

    private static SlotView SlotAt(Node n, Vector2 at)
    {
        if (n is SlotView { Visible: true } s && s.GetGlobalRect().HasPoint(at)) return s;
        foreach (var c in n.GetChildren())
        {
            var found = SlotAt(c, at);
            if (found != null) return found;
        }
        return null;
    }

    private void QuickMove(Inventory from, int i, SlotView view)
    {
        var s = from.Slots[i];
        if (s.IsEmpty) return;
        ItemStack left;
        if (from != Inv)
        {
            left = Inv.Add(s);
        }
        else if (Kind == ScreenKind.Crate)
        {
            left = ((CrateEntity)Entity).Inv.Add(s);
        }
        else if (Kind == ScreenKind.Furnace)
        {
            var f = (FurnaceEntity)Entity;
            int target = Smelting.Has(s.Id) ? FurnaceEntity.In : s.Def.Fuel > 0 ? FurnaceEntity.FuelSlot : -1;
            if (target < 0) return;
            left = f.Inv.Add(s, target, target + 1);
        }
        else if (s.Def.IsArmor && Game.Player.Armor[s.Def.ArmorSlot].IsEmpty)
        {
            // Straight on.
            Game.Player.Armor[s.Def.ArmorSlot] = s;
            left = ItemStack.Empty;
            Sfx.Ui("equip", 0.6f);
        }
        else
        {
            // Between hotbar and backpack.
            from.Slots[i] = ItemStack.Empty;
            left = i < 9 ? Inv.Add(s, 9, 36) : Inv.Add(s, 0, 9);
            from.Slots[i] = left;
            from.Touch();
            return;
        }
        from[i] = left;
    }

    /// <summary>Anything still on the cursor goes back in the bag, or on the ground.</summary>
    public void ReturnCursor()
    {
        if (Cursor.IsEmpty) return;
        var left = Inv.Add(Cursor);
        if (!left.IsEmpty) Game.Player.DropStack(left);
        Cursor = ItemStack.Empty;
    }

    /// <summary>Hovering a slot and pressing 1-9 swaps it with that hotbar slot.</summary>
    public override void _Input(InputEvent e)
    {
        if (e is InputEventMouseButton { ButtonIndex: MouseButton.Left, Pressed: false } up) { EndDrag(up.GlobalPosition); return; }
        if (e is not InputEventKey { Pressed: true, Echo: false }) return;
        for (int n = 1; n <= 9; n++)
        {
            if (!e.IsActionPressed("slot_" + n)) continue;
            var view = HoveredSlot(this);
            if (view == null || view.Clicked == null) return;
            var inv = InvFor(view);
            int i = view.Index, h = n - 1;
            if (inv == Inv && i == h) return;
            bool furnaceOut = Kind == ScreenKind.Furnace && (string)view.Tag == "entity" && i == FurnaceEntity.Out;
            if (furnaceOut && !Inv[h].IsEmpty) return;      // output only comes out
            if (!Fits(view, Inv[h])) return;
            (inv[i], Inv[h]) = (Inv[h], inv[i]);
            Sfx.Ui("click", 0.35f, 1.2f);
            GetViewport().SetInputAsHandled();
            return;
        }
    }

    private static SlotView HoveredSlot(Node n)
    {
        if (n is SlotView { Hovered: true } s) return s;
        foreach (var c in n.GetChildren())
        {
            var found = HoveredSlot(c);
            if (found != null) return found;
        }
        return null;
    }

    public override void _GuiInput(InputEvent e)
    {
        // Clicking outside every panel throws the cursor stack.
        if (e is InputEventMouseButton mb && mb.Pressed && !Cursor.IsEmpty)
        {
            if (mb.ButtonIndex == MouseButton.Left) { Game.Player.DropStack(Cursor); Cursor = ItemStack.Empty; }
            else if (mb.ButtonIndex == MouseButton.Right) { Game.Player.DropStack(Cursor.WithCount(1)); Cursor = Cursor.WithCount(Cursor.Count - 1); }
            AcceptEvent();
        }
    }

    public override void _Process(double delta)
    {
        if (_armorLabel != null)
        {
            int pts = Game.Player.ArmorPoints;
            _armorLabel.Text = pts > 0 ? $"Protection {pts}  ·  {Math.Min(80, pts * 4)}% of each blow" : "No armour";
        }
        if (_recipes != null && Inv.Version != _lastVersion)
        {
            _lastVersion = Inv.Version;
            RefreshRecipes();
        }
        if (Entity is FurnaceEntity f && _arrow != null)
        {
            float cook = f.Cook / Math.Max(0.01f, f.CookTime);
            _arrow.Size = new Vector2(90 * Math.Clamp(cook, 0f, 1f), 10);
            float burn = f.BurnMax > 0 ? f.Burn / f.BurnMax : 0f;
            _flame.Size = new Vector2(16, 32 * burn);
            _flame.Position = new Vector2(18, 36 - 32 * burn);
        }
        QueueRedraw();
    }

    public override void _Draw()
    {
        if (Cursor.IsEmpty) return;
        var m = GetLocalMousePosition();
        SlotView.DrawStack(this, Cursor, new Rect2(m - new Vector2(26, 26), new Vector2(52, 52)));
    }
}
