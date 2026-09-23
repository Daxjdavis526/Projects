using System;
using System.Text;
using Godot;

namespace Strata;

/// <summary>
/// One inventory cell: draws its stack (icon, count, wear bar) and reports
/// clicks to whoever owns it. Hovering shows what the item is and does.
/// </summary>
public sealed partial class SlotView : Control
{
    public Func<ItemStack> Source;
    public Action<SlotView, MouseButton, bool> Clicked;   // (slot, button, shift)
    public int Index;
    public object Tag;
    public bool Highlight;
    public bool ShowTooltip = true;
    public float Size = 52f;
    private ItemStack _shown = new(ushort.MaxValue, -1);
    private bool _hover;

    public override void _Ready()
    {
        CustomMinimumSize = new Vector2(Size, Size);
        MouseFilter = MouseFilterEnum.Stop;
        MouseEntered += () => { _hover = true; QueueRedraw(); };
        MouseExited += () => { _hover = false; QueueRedraw(); };
    }

    public override void _Process(double delta)
    {
        var s = Source?.Invoke() ?? ItemStack.Empty;
        if (!s.Equals(_shown) || (s.IsEmpty != _shown.IsEmpty))
        {
            _shown = s;
            TooltipText = ShowTooltip && !s.IsEmpty ? Describe(s) : "";
            QueueRedraw();
        }
    }

    public override void _GuiInput(InputEvent e)
    {
        if (e is InputEventMouseButton mb && mb.Pressed && (mb.ButtonIndex == MouseButton.Left || mb.ButtonIndex == MouseButton.Right))
        {
            Clicked?.Invoke(this, mb.ButtonIndex, mb.ShiftPressed);
            AcceptEvent();
        }
    }

    public override void _Draw()
    {
        var r = new Rect2(Vector2.Zero, new Vector2(Size, Size));
        var border = Highlight ? UiStyle.Accent : _hover && Clicked != null ? new Color(0.55f, 0.58f, 0.66f) : UiStyle.Border;
        DrawStyleBox(UiStyle.Box(UiStyle.SlotBg, border, Highlight ? 3 : 2, 5), r);
        DrawStack(this, _shown, r);
    }

    /// <summary>Draws a stack into a rectangle on any control (also used for the cursor stack and the hotbar).</summary>
    public static void DrawStack(CanvasItem ci, ItemStack s, Rect2 r)
    {
        if (s.IsEmpty) return;
        var tex = Icons.Get(s.Id);
        float pad = r.Size.X * 0.14f;
        ci.DrawTextureRect(tex, new Rect2(r.Position + new Vector2(pad, pad), r.Size - new Vector2(pad * 2, pad * 2)), false);
        var font = ThemeDB.FallbackFont;
        if (s.Count > 1)
        {
            string t = s.Count.ToString();
            int fs = (int)(r.Size.X * 0.34f);
            var size = font.GetStringSize(t, HorizontalAlignment.Left, -1, fs);
            var p = r.Position + new Vector2(r.Size.X - size.X - 4, r.Size.Y - 5);
            ci.DrawStringOutline(font, p, t, HorizontalAlignment.Left, -1, fs, 4, new Color(0, 0, 0, 0.9f));
            ci.DrawString(font, p, t, HorizontalAlignment.Left, -1, fs, Colors.White);
        }
        var d = s.Def;
        if (d.IsTool && s.Wear > 0)
        {
            float f = 1f - (float)s.Wear / d.Durability;
            var bar = new Rect2(r.Position + new Vector2(pad * 0.8f, r.Size.Y - pad * 0.9f), new Vector2((r.Size.X - pad * 1.6f), 4));
            ci.DrawRect(bar, new Color(0, 0, 0, 0.8f));
            ci.DrawRect(new Rect2(bar.Position, new Vector2(bar.Size.X * f, bar.Size.Y)), Color.FromHsv(f * 0.33f, 0.9f, 0.95f));
        }
    }

    public static string Describe(ItemStack s)
    {
        var d = s.Def;
        var sb = new StringBuilder();
        sb.Append(d.Name);
        if (d.IsTool)
        {
            sb.Append($"\n{Items.TierNames[Math.Clamp(d.Tier, 0, 5)]} tier  ·  {d.Damage:0.#} damage");
            sb.Append($"\nDurability {d.Durability - s.Wear} / {d.Durability}");
        }
        if (d.IsFood) sb.Append($"\nRestores {d.Food / 2f:0.#} hunger");
        if (d.Fuel > 0) sb.Append($"\nFuel: {d.Fuel:0} s");
        if (Smelting.Has(s.Id)) sb.Append($"\nSmelts into {Items.Get(Smelting.Table[s.Id].output).Name}");
        if (d.Place is PlaceKind.Block or PlaceKind.Facing or PlaceKind.Plant && d.Block != 0)
        {
            var b = Blocks.Get(d.Block);
            if (b.MinTier > 0) sb.Append($"\nMine with a {Items.TierNames[b.MinTier]} {b.Tool.ToString().ToLowerInvariant()} or better");
            if (b.Light > 0) sb.Append($"\nGives light {b.Light}");
        }
        if (!string.IsNullOrEmpty(d.Info)) sb.Append('\n').Append(d.Info);
        return sb.ToString();
    }
}
