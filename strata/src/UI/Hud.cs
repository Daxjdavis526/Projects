using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// The in-game overlay: crosshair, hotbar, health, hunger and breath, the name
/// of what you are looking at, short messages, screen flashes for damage and
/// water, and the F3 debug readout.
/// </summary>
public sealed partial class Hud : Control
{
    public Game Game;
    public bool ShowDebug;
    private readonly SlotView[] _hot = new SlotView[9];
    private Label _itemName, _debug, _target, _clock;
    private VBoxContainer _toasts;
    private readonly List<(Label label, float time)> _toastList = new();
    private float _itemNameTime;
    private int _lastSelected = -1;
    private ushort _lastHeld;
    private Texture2D _heart, _heartHalf, _heartEmpty, _food, _foodHalf, _foodEmpty, _bubble, _bubblePop, _shield, _shieldHalf, _shieldEmpty;
    private ColorRect _hurt, _water, _fade;
    public float Fade;                 // sleeping and loading fades

    private const float Slot = 52f, Gap = 4f;

    public override void _Ready()
    {
        UiStyle.FillParent(this);
        MouseFilter = MouseFilterEnum.Ignore;
        Theme = UiStyle.Theme;
        BuildIcons();

        _water = new ColorRect { Color = new Color(0.1f, 0.3f, 0.5f, 0f), MouseFilter = MouseFilterEnum.Ignore };
        UiStyle.FillParent(_water);
        AddChild(_water);
        _hurt = new ColorRect { Color = new Color(0.7f, 0f, 0f, 0f), MouseFilter = MouseFilterEnum.Ignore };
        UiStyle.FillParent(_hurt);
        AddChild(_hurt);

        for (int i = 0; i < 9; i++)
        {
            int k = i;
            var s = new SlotView { Size = Slot, Source = () => Game?.Player?.Inventory[k] ?? ItemStack.Empty, ShowTooltip = false, MouseFilter = MouseFilterEnum.Ignore };
            AddChild(s);
            _hot[i] = s;
        }
        _itemName = UiStyle.HudLabel("", 20);
        _itemName.HorizontalAlignment = HorizontalAlignment.Center;
        AddChild(_itemName);
        _target = UiStyle.HudLabel("", 17, UiStyle.TextDim);
        _target.HorizontalAlignment = HorizontalAlignment.Center;
        AddChild(_target);
        _clock = UiStyle.HudLabel("", 16, UiStyle.TextDim);
        AddChild(_clock);

        _debug = UiStyle.HudLabel("", 15);
        _debug.Position = new Vector2(12, 10);
        _debug.Visible = false;
        AddChild(_debug);

        _toasts = new VBoxContainer { MouseFilter = MouseFilterEnum.Ignore };
        _toasts.AddThemeConstantOverride("separation", 4);
        AddChild(_toasts);

        _fade = new ColorRect { Color = new Color(0, 0, 0, 0), MouseFilter = MouseFilterEnum.Ignore };
        UiStyle.FillParent(_fade);
        AddChild(_fade);
    }

    public void Toast(string text, Color? color = null)
    {
        var l = UiStyle.HudLabel(text, 19, color ?? UiStyle.Text);
        l.HorizontalAlignment = HorizontalAlignment.Center;
        _toasts.AddChild(l);
        _toastList.Add((l, 4f));
        if (_toastList.Count > 5) { _toastList[0].label.QueueFree(); _toastList.RemoveAt(0); }
    }

    public override void _Process(double delta)
    {
        float dt = (float)delta;
        var p = Game?.Player;
        var vp = GetViewportRect().Size;
        float total = 9 * Slot + 8 * Gap;
        float x0 = (vp.X - total) / 2f, y0 = vp.Y - Slot - 14f;
        for (int i = 0; i < 9; i++)
        {
            _hot[i].Position = new Vector2(x0 + i * (Slot + Gap), y0);
            _hot[i].Highlight = p != null && p.Selected == i;
            _hot[i].QueueRedraw();
        }

        if (p != null)
        {
            if (p.Selected != _lastSelected || p.HeldStack.Id != _lastHeld)
            {
                _lastSelected = p.Selected; _lastHeld = p.HeldStack.Id;
                _itemName.Text = p.HeldStack.IsEmpty ? "" : p.HeldStack.Def.Name;
                _itemNameTime = 2.2f;
            }
            _itemNameTime -= dt;
            _itemName.Modulate = new Color(1, 1, 1, Math.Clamp(_itemNameTime, 0f, 1f));
            _itemName.Size = new Vector2(total, 30);
            _itemName.Position = new Vector2(x0, y0 - 96);

            // What the crosshair is on.
            string t = "";
            if (p.TargetMob != null) t = p.TargetMob.Def.Name;
            else if (p.Target.Hit)
            {
                var b = Blocks.Get(p.Target.Id);
                t = b.Name;
                if (b.MinTier > 0)
                {
                    var (_, harvest) = Items.BreakTime(b, p.HeldDef);
                    if (!harvest) t += $"  ·  needs a {Items.TierNames[b.MinTier].ToLowerInvariant()} {b.Tool.ToString().ToLowerInvariant()}";
                }
            }
            _target.Text = t;
            _target.Size = new Vector2(600, 24);
            _target.Position = new Vector2(vp.X / 2 - 300, 12);

            float hurt = p.Vitals.SinceHurt < 0.6f ? (0.6f - p.Vitals.SinceHurt) / 0.6f * 0.35f : 0f;
            if (p.Vitals.Health <= 4f && !p.Dead) hurt = Math.Max(hurt, 0.12f + 0.08f * MathF.Sin(Time.GetTicksMsec() / 250f));
            _hurt.Color = new Color(0.6f, 0f, 0f, hurt);
            _water.Color = new Color(0.05f, 0.22f, 0.42f, p.Body.HeadInWater ? 0.28f : 0f);
        }

        _clock.Text = Game != null ? $"Day {Game.View.Sky.Day + 1}  {Game.View.Sky.Clock}" : "";
        if (Game != null && Game.Settings.ShowFps && !ShowDebug) _clock.Text = $"{Game.Fps:0} fps   " + _clock.Text;
        _clock.Position = new Vector2(vp.X - 12 - _clock.GetMinimumSize().X, 10);

        for (int i = _toastList.Count - 1; i >= 0; i--)
        {
            var (l, time) = _toastList[i];
            time -= dt;
            if (time <= 0) { l.QueueFree(); _toastList.RemoveAt(i); continue; }
            l.Modulate = new Color(1, 1, 1, Math.Min(1f, time));
            _toastList[i] = (l, time);
        }
        _toasts.Position = new Vector2(vp.X / 2 - 300, 44);
        _toasts.Size = new Vector2(600, 10);
        foreach (var (l, _) in _toastList) l.CustomMinimumSize = new Vector2(600, 0);

        _fade.Color = new Color(0, 0, 0, Fade);
        _debug.Visible = ShowDebug;
        if (ShowDebug && Game != null) _debug.Text = Game.DebugText();
        QueueRedraw();
    }

    public override void _Draw()
    {
        var p = Game?.Player;
        if (p == null || Game.HudHidden) return;
        var vp = GetViewportRect().Size;
        var c = vp / 2;

        // Crosshair.
        if (!Game.InputBlocked)
        {
            var ink = new Color(1, 1, 1, 0.85f);
            var shadow = new Color(0, 0, 0, 0.5f);
            DrawRect(new Rect2(c.X - 10, c.Y - 1, 20, 3), shadow);
            DrawRect(new Rect2(c.X - 1, c.Y - 10, 3, 20), shadow);
            DrawRect(new Rect2(c.X - 9, c.Y - 0.5f, 18, 2), ink);
            DrawRect(new Rect2(c.X - 0.5f, c.Y - 9, 2, 18), ink);
            if (p.Eating > 0)
            {
                float f = Math.Min(1f, p.Eating / 1.4f);
                DrawRect(new Rect2(c.X - 20, c.Y + 18, 40, 5), new Color(0, 0, 0, 0.6f));
                DrawRect(new Rect2(c.X - 20, c.Y + 18, 40 * f, 5), UiStyle.Accent);
            }
        }

        float total = 9 * Slot + 8 * Gap;
        float x0 = (vp.X - total) / 2f, y0 = vp.Y - Slot - 14f;
        const float icon = 20f, step = 21f;
        var v = p.Vitals;
        float hy = y0 - icon - 8;
        // Health, left to right; a shake when low.
        for (int i = 0; i < 10; i++)
        {
            float hp = v.Health - i * 2;
            var tex = hp >= 2 ? _heart : hp >= 1 ? _heartHalf : _heartEmpty;
            float shake = v.Health <= 4 ? MathF.Sin(Time.GetTicksMsec() / 60f + i * 1.7f) * 1.5f : 0f;
            DrawTextureRect(_heartEmpty, new Rect2(x0 + i * step, hy + shake, icon, icon), false);
            if (tex != _heartEmpty) DrawTextureRect(tex, new Rect2(x0 + i * step, hy + shake, icon, icon), false);
        }
        // Armour above health, only when worn: a shield for every two points.
        int armor = p.ArmorPoints;
        if (armor > 0)
            for (int i = 0; i < 10; i++)
            {
                int a = armor - i * 2;
                var tex = a >= 2 ? _shield : a >= 1 ? _shieldHalf : _shieldEmpty;
                DrawTextureRect(tex, new Rect2(x0 + i * step, hy - step - 2, icon, icon), false);
            }
        // Bow draw, under the crosshair.
        if (p.Draw > 0f && !Game.InputBlocked)
        {
            DrawRect(new Rect2(c.X - 20, c.Y + 18, 40, 5), new Color(0, 0, 0, 0.6f));
            DrawRect(new Rect2(c.X - 20, c.Y + 18, 40 * p.Draw, 5), p.Draw >= 1f ? new Color(1f, 0.85f, 0.4f) : UiStyle.Accent);
        }
        // Hunger, right to left.
        for (int i = 0; i < 10; i++)
        {
            float f = v.Hunger - i * 2;
            var tex = f >= 2 ? _food : f >= 1 ? _foodHalf : _foodEmpty;
            float shake = v.Hunger <= 6 && v.Saturation <= 0 ? MathF.Sin(Time.GetTicksMsec() / 80f + i) * 1.2f : 0f;
            var r = new Rect2(x0 + total - (i + 1) * step, hy + shake, icon, icon);
            DrawTextureRect(_foodEmpty, r, false);
            if (tex != _foodEmpty) DrawTextureRect(tex, r, false);
        }
        // Breath, only while it matters.
        if (p.Body.HeadInWater || v.Air < Vitals.MaxAir - 0.01f)
        {
            int bubbles = (int)MathF.Ceiling(v.Air);
            for (int i = 0; i < 10; i++)
            {
                if (i >= bubbles) continue;
                var tex = i == bubbles - 1 && v.Air % 1f < 0.25f && v.Air % 1f > 0f ? _bubblePop : _bubble;
                DrawTextureRect(tex, new Rect2(x0 + total - (i + 1) * step, hy - step - 2, icon, icon), false);
            }
        }
    }

    // --- icons ----------------------------------------------------------------------------

    private void BuildIcons()
    {
        _heart = Icon(Heart(new Color(0.88f, 0.12f, 0.16f), 1f));
        _heartHalf = Icon(Heart(new Color(0.88f, 0.12f, 0.16f), 0.5f));
        _heartEmpty = Icon(Heart(new Color(0.18f, 0.12f, 0.12f), 1f, empty: true));
        _food = Icon(Ration(new Color(0.84f, 0.58f, 0.26f), 1f));
        _foodHalf = Icon(Ration(new Color(0.84f, 0.58f, 0.26f), 0.5f));
        _foodEmpty = Icon(Ration(new Color(0.2f, 0.16f, 0.12f), 1f, empty: true));
        _bubble = Icon(Bubble(false));
        _bubblePop = Icon(Bubble(true));
        _shield = Icon(Shield(new Color(0.72f, 0.74f, 0.8f), 1f));
        _shieldHalf = Icon(Shield(new Color(0.72f, 0.74f, 0.8f), 0.5f));
        _shieldEmpty = Icon(Shield(new Color(0.16f, 0.16f, 0.2f), 1f, empty: true));
    }

    private static ImageTexture Icon(Pixel p) => ImageTexture.CreateFromImage(p.ToImage());

    private static readonly string[] HeartShape =
    {
        ".XX.XX.",
        "XXXXXXX",
        "XXXXXXX",
        "XXXXXXX",
        ".XXXXX.",
        "..XXX..",
        "...X...",
    };

    private static Pixel Heart(Color c, float fill, bool empty = false)
    {
        var p = new Pixel(9, 9, "heart");
        p.Clear(new Color(0, 0, 0, 0));
        var outline = new Color(0.08f, 0.02f, 0.02f);
        for (int y = 0; y < 7; y++)
            for (int x = 0; x < 7; x++)
            {
                if (HeartShape[y][x] != 'X') continue;
                if (x >= 7 * fill + 0.01f && !empty) continue;
                var col = empty ? c : (y == 1 && (x == 1 || x == 2) ? Pixel.Shade(c, 1.6f) : y > 3 ? Pixel.Shade(c, 0.8f) : c);
                p.Set(x + 1, y + 1, col);
            }
        p.Outline(outline);
        return p;
    }

    private static Pixel Ration(Color c, float fill, bool empty = false)
    {
        // A little loaf with a scored top.
        var p = new Pixel(9, 9, "ration");
        p.Clear(new Color(0, 0, 0, 0));
        for (int y = 2; y < 8; y++)
            for (int x = 1; x < 8; x++)
            {
                float dx = (x - 4f) / 3.6f, dy = (y - 5f) / 3f;
                if (dx * dx + dy * dy > 1f) continue;
                if (!empty && x > 1 + 7 * fill - 0.5f) continue;
                var col = empty ? c : y < 4 ? Pixel.Shade(c, 1.25f) : c;
                if (!empty && y == 4 && (x == 3 || x == 5)) col = Pixel.Shade(c, 0.7f);
                p.Set(x, y, col);
            }
        p.Outline(new Color(0.1f, 0.06f, 0.02f));
        return p;
    }

    private static Pixel Shield(Color c, float fill, bool empty = false)
    {
        // A kite shield: flat top, tapering to a point.
        var p = new Pixel(9, 9, "shield");
        p.Clear(new Color(0, 0, 0, 0));
        for (int y = 1; y < 8; y++)
        {
            int half = y < 5 ? 3 : 7 - y;
            for (int x = 4 - half; x <= 4 + half; x++)
            {
                if (!empty && x >= 1 + 7 * fill + 0.01f) continue;
                var col = empty ? c : x < 4 ? Pixel.Shade(c, 1.2f) : Pixel.Shade(c, 0.85f);
                if (!empty && y == 1) col = Pixel.Shade(c, 1.35f);
                p.Set(x, y, col);
            }
        }
        p.Outline(new Color(0.05f, 0.05f, 0.08f));
        return p;
    }

    private static Pixel Bubble(bool popping)
    {
        var p = new Pixel(9, 9, "bubble");
        p.Clear(new Color(0, 0, 0, 0));
        var edge = new Color(0.75f, 0.9f, 1f);
        if (popping)
        {
            foreach (var (x, y) in new[] { (2, 2), (6, 2), (1, 5), (7, 5), (4, 7), (4, 1) }) p.Set(x, y, edge);
            return p;
        }
        for (int y = 0; y < 9; y++)
            for (int x = 0; x < 9; x++)
            {
                float d = MathF.Sqrt((x - 4f) * (x - 4f) + (y - 4f) * (y - 4f));
                if (d > 3.6f && d < 4.4f) p.Set(x, y, edge);
                else if (d <= 3.6f) p.Set(x, y, new Color(0.35f, 0.6f, 0.95f, 0.55f));
            }
        p.Set(3, 2, Colors.White); p.Set(2, 3, Colors.White);
        return p;
    }
}
