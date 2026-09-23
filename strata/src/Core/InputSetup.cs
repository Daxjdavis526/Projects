using Godot;

namespace Strata;

/// <summary>Registers the input actions in code, so the project file stays minimal and rebinding lives in settings.</summary>
public static class InputSetup
{
    public static void Ensure()
    {
        Key("move_forward", Godot.Key.W);
        Key("move_back", Godot.Key.S);
        Key("move_left", Godot.Key.A);
        Key("move_right", Godot.Key.D);
        Key("jump", Godot.Key.Space);
        Key("sneak", Godot.Key.Shift);
        Key("sprint", Godot.Key.Ctrl);
        Key("inventory", Godot.Key.E);
        Key("drop", Godot.Key.Q);
        Key("pause", Godot.Key.Escape);
        Key("debug", Godot.Key.F3);
        Key("hide_hud", Godot.Key.F1);
        Key("screenshot", Godot.Key.F2);
        for (int i = 1; i <= 9; i++) Key("slot_" + i, Godot.Key.Key0 + i);
        Mouse("attack", MouseButton.Left);
        Mouse("use", MouseButton.Right);
        Mouse("pick", MouseButton.Middle);
    }

    private static void Key(string action, Key key)
    {
        if (!InputMap.HasAction(action)) InputMap.AddAction(action);
        foreach (var e in InputMap.ActionGetEvents(action)) if (e is InputEventKey) return;
        InputMap.ActionAddEvent(action, new InputEventKey { PhysicalKeycode = key });
    }

    private static void Mouse(string action, MouseButton b)
    {
        if (!InputMap.HasAction(action)) InputMap.AddAction(action);
        foreach (var e in InputMap.ActionGetEvents(action)) if (e is InputEventMouseButton) return;
        InputMap.ActionAddEvent(action, new InputEventMouseButton { ButtonIndex = b });
    }
}
