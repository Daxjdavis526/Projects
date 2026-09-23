using System;
using Godot;

namespace Strata;

/// <summary>One place for the look of the interface: colours, panels, buttons, text.</summary>
public static class UiStyle
{
    public static readonly Color Panel = new(0.07f, 0.08f, 0.1f, 0.9f);
    public static readonly Color PanelLight = new(0.12f, 0.13f, 0.16f, 0.95f);
    public static readonly Color Border = new(0.28f, 0.31f, 0.37f, 1f);
    public static readonly Color Accent = new(0.96f, 0.74f, 0.33f, 1f);
    public static readonly Color AccentDim = new(0.6f, 0.46f, 0.2f, 1f);
    public static readonly Color Text = new(0.92f, 0.93f, 0.95f, 1f);
    public static readonly Color TextDim = new(0.62f, 0.65f, 0.7f, 1f);
    public static readonly Color Good = new(0.5f, 0.85f, 0.45f, 1f);
    public static readonly Color Bad = new(0.95f, 0.38f, 0.32f, 1f);
    public static readonly Color SlotBg = new(0.13f, 0.14f, 0.17f, 0.92f);

    private static Theme _theme;

    public static StyleBoxFlat Box(Color bg, Color border, int borderW = 2, int radius = 6, int pad = 0)
    {
        var s = new StyleBoxFlat
        {
            BgColor = bg,
            BorderColor = border,
            AntiAliasing = true,
        };
        s.SetBorderWidthAll(borderW);
        s.SetCornerRadiusAll(radius);
        s.SetContentMarginAll(pad);
        return s;
    }

    /// <summary>The shared theme for every screen: dark panels, amber focus, generous text.</summary>
    public static Theme Theme
    {
        get
        {
            if (_theme != null) return _theme;
            var t = new Theme();
            t.DefaultFontSize = 18;
            t.SetColor("font_color", "Label", Text);
            t.SetColor("font_color", "Button", Text);
            t.SetColor("font_hover_color", "Button", Accent);
            t.SetColor("font_pressed_color", "Button", Accent);
            t.SetColor("font_focus_color", "Button", Accent);
            t.SetColor("font_disabled_color", "Button", TextDim * new Color(1, 1, 1, 0.6f));
            t.SetStylebox("normal", "Button", Box(new Color(0.16f, 0.17f, 0.21f, 0.95f), Border, 2, 6, 10));
            t.SetStylebox("hover", "Button", Box(new Color(0.22f, 0.22f, 0.26f, 0.98f), Accent, 2, 6, 10));
            t.SetStylebox("pressed", "Button", Box(new Color(0.12f, 0.12f, 0.15f, 1f), Accent, 2, 6, 10));
            t.SetStylebox("focus", "Button", Box(new Color(0, 0, 0, 0), AccentDim, 2, 6, 10));
            t.SetStylebox("disabled", "Button", Box(new Color(0.12f, 0.12f, 0.14f, 0.7f), Border * new Color(1, 1, 1, 0.5f), 2, 6, 10));
            t.SetStylebox("panel", "Panel", Box(Panel, Border, 2, 10, 12));
            t.SetStylebox("panel", "PanelContainer", Box(Panel, Border, 2, 10, 16));
            t.SetStylebox("normal", "LineEdit", Box(new Color(0.05f, 0.06f, 0.08f, 1f), Border, 2, 5, 8));
            t.SetStylebox("focus", "LineEdit", Box(new Color(0.05f, 0.06f, 0.08f, 1f), Accent, 2, 5, 8));
            t.SetColor("font_color", "LineEdit", Text);
            t.SetColor("caret_color", "LineEdit", Accent);
            t.SetColor("font_placeholder_color", "LineEdit", TextDim);
            t.SetStylebox("slider", "HSlider", Box(new Color(0.2f, 0.21f, 0.25f), Border, 1, 4, 3));
            t.SetStylebox("grabber_area", "HSlider", Box(AccentDim, AccentDim, 1, 4, 3));
            t.SetStylebox("grabber_area_highlight", "HSlider", Box(Accent, Accent, 1, 4, 3));
            t.SetColor("font_color", "CheckBox", Text);
            t.SetColor("font_hover_color", "CheckBox", Accent);
            t.SetColor("font_color", "OptionButton", Text);
            t.SetStylebox("normal", "OptionButton", Box(new Color(0.16f, 0.17f, 0.21f, 0.95f), Border, 2, 6, 8));
            t.SetStylebox("hover", "OptionButton", Box(new Color(0.22f, 0.22f, 0.26f, 0.98f), Accent, 2, 6, 8));
            t.SetStylebox("pressed", "OptionButton", Box(new Color(0.12f, 0.12f, 0.15f, 1f), Accent, 2, 6, 8));
            t.SetStylebox("panel", "PopupMenu", Box(PanelLight, Border, 2, 6, 6));
            t.SetColor("font_color", "PopupMenu", Text);
            t.SetColor("font_hover_color", "PopupMenu", Accent);
            t.SetStylebox("hover", "PopupMenu", Box(new Color(0.22f, 0.22f, 0.26f), Accent, 1, 4, 4));
            t.SetStylebox("panel", "TooltipPanel", Box(new Color(0.05f, 0.05f, 0.07f, 0.97f), Accent, 2, 6, 8));
            t.SetColor("font_color", "TooltipLabel", Text);
            t.SetStylebox("scroll", "VScrollBar", Box(new Color(0.1f, 0.1f, 0.12f, 0.6f), new Color(0, 0, 0, 0), 0, 4, 2));
            t.SetStylebox("grabber", "VScrollBar", Box(Border, Border, 0, 4, 2));
            t.SetStylebox("grabber_highlight", "VScrollBar", Box(AccentDim, AccentDim, 0, 4, 2));
            _theme = t;
            return t;
        }
    }

    public static Label Label(string text, int size = 18, Color? color = null, HorizontalAlignment align = HorizontalAlignment.Left)
    {
        var l = new Label { Text = text, HorizontalAlignment = align };
        l.AddThemeFontSizeOverride("font_size", size);
        if (color.HasValue) l.AddThemeColorOverride("font_color", color.Value);
        return l;
    }

    /// <summary>A label readable over the world: outlined.</summary>
    public static Label HudLabel(string text, int size = 18, Color? color = null)
    {
        var l = Label(text, size, color);
        l.AddThemeColorOverride("font_outline_color", new Color(0, 0, 0, 0.85f));
        l.AddThemeConstantOverride("outline_size", 5);
        return l;
    }

    public static Button Button(string text, Action onPress, int minWidth = 260)
    {
        var b = new Button { Text = text, CustomMinimumSize = new Vector2(minWidth, 44), FocusMode = Control.FocusModeEnum.All };
        b.Pressed += () => { Sfx.Ui("click", 0.6f); onPress(); };
        return b;
    }

    public static Control Spacer(float h) => new Control { CustomMinimumSize = new Vector2(0, h) };

    public static void FillParent(Control c)
    {
        c.AnchorLeft = 0; c.AnchorTop = 0; c.AnchorRight = 1; c.AnchorBottom = 1;
        c.OffsetLeft = c.OffsetTop = c.OffsetRight = c.OffsetBottom = 0;
    }

    public static void Center(Control c)
    {
        c.AnchorLeft = 0.5f; c.AnchorTop = 0.5f; c.AnchorRight = 0.5f; c.AnchorBottom = 0.5f;
        c.GrowHorizontal = Control.GrowDirection.Both;
        c.GrowVertical = Control.GrowDirection.Both;
    }
}
