using System;
using Godot;

namespace Strata;

/// <summary>
/// Day and night, and how the air looks: the sky dome, clouds, fog and the
/// colour of sunlight, all driven from one clock. The same horizon colour goes
/// to the sky and to the fog so the far edge of the world dissolves into it.
/// </summary>
public sealed class Atmosphere
{
    public const float DayLengthSeconds = 1200f;   // twenty minutes, sunrise to sunrise

    public double Time;         // days since the world began; fraction = time of day (0 = sunrise)
    public float Rain;          // 0..1, current precipitation strength (visual and audible)
    public float Storm;         // 0..1 for thunderstorms
    public bool Underwater;
    public Biome BiomeHere = Biome.Meadow;

    public float Daylight { get; private set; } = 1f;
    public float SunHeight { get; private set; }
    public Color Horizon { get; private set; }
    public Color SkyTop { get; private set; }
    public Color FogColor { get; private set; }
    public float LightningFlash;
    public static readonly Color TorchTint = new(1f, 0.86f, 0.66f);
    public static float CurrentDaylight = 1f;       // for CPU-side lighting (particles)

    private MeshInstance3D _dome, _clouds;
    private WorldEnvironment _env;

    public float TimeOfDay => (float)(Time - Math.Floor(Time));
    public int Day => (int)Math.Floor(Time);
    public bool IsNight => SunHeight < -0.05f;

    /// <summary>A friendly clock string: sunrise is six in the morning.</summary>
    public string Clock
    {
        get
        {
            float h = (TimeOfDay * 24f + 6f) % 24f;
            int hh = (int)h, mm = (int)((h - hh) * 60f);
            return $"{hh:00}:{mm:00}";
        }
    }

    public void Setup(Node3D parent, Camera3D cam)
    {
        var env = new Godot.Environment
        {
            BackgroundMode = Godot.Environment.BGMode.Color,
            BackgroundColor = new Color(0.6f, 0.75f, 0.9f),
            AmbientLightSource = Godot.Environment.AmbientSource.Color,
            AmbientLightColor = Colors.White,
            ReflectedLightSource = Godot.Environment.ReflectionSource.Disabled,
            TonemapMode = Godot.Environment.ToneMapper.Linear,
            GlowEnabled = true,
            GlowIntensity = 0.55f,
            GlowStrength = 0.9f,
            GlowBloom = 0.02f,
            GlowHdrThreshold = 1.05f,
            GlowBlendMode = Godot.Environment.GlowBlendModeEnum.Additive,
        };
        _env = new WorldEnvironment { Environment = env };
        parent.AddChild(_env);

        var skyMat = new ShaderMaterial { Shader = GD.Load<Shader>("res://shaders/sky.gdshader"), RenderPriority = -100 };
        _dome = new MeshInstance3D
        {
            Mesh = new SphereMesh { Radius = 1800f, Height = 3600f, RadialSegments = 32, Rings = 16, Material = skyMat },
            CastShadow = GeometryInstance3D.ShadowCastingSetting.Off,
            ExtraCullMargin = 16384f,
        };
        parent.AddChild(_dome);

        var cloudMat = new ShaderMaterial { Shader = GD.Load<Shader>("res://shaders/clouds.gdshader") };
        _clouds = new MeshInstance3D
        {
            Mesh = new PlaneMesh { Size = new Vector2(1000, 1000), Material = cloudMat },
            CastShadow = GeometryInstance3D.ShadowCastingSetting.Off,
            ExtraCullMargin = 4096f,
        };
        parent.AddChild(_clouds);
    }

    public void SetQuality(bool clouds) { if (_clouds != null) _clouds.Visible = clouds; }

    /// <summary>Advances the clock and pushes every colour to the shaders.</summary>
    public void Update(double delta, Vector3 cam, float renderDistance, float brightness)
    {
        Time += delta / DayLengthSeconds;
        float t = TimeOfDay;
        float a = t * MathF.Tau;
        var sun = new Vector3(MathF.Cos(a), MathF.Sin(a), 0.22f).Normalized();
        SunHeight = sun.Y;
        float s = sun.Y;

        float dayF = Smooth.Step(-0.14f, 0.28f, s);
        float dusk = 1f - Smooth.Step(0f, 0.38f, MathF.Abs(s + 0.03f));
        float moonLight = 0.16f + 0.12f * MoonFullness;

        var dayTop = new Color(0.27f, 0.5f, 0.88f);
        var dayHor = new Color(0.66f, 0.8f, 0.96f);
        var nightTop = new Color(0.008f, 0.012f, 0.035f);
        var nightHor = new Color(0.035f, 0.045f, 0.085f);
        var duskTop = new Color(0.22f, 0.24f, 0.5f);
        var duskHor = new Color(0.98f, 0.55f, 0.3f);

        var top = Lerp(nightTop, dayTop, dayF);
        var hor = Lerp(nightHor, dayHor, dayF);
        top = Lerp(top, duskTop, dusk * 0.45f);
        hor = Lerp(hor, duskHor, dusk * 0.62f);

        // Biome haze tints the horizon a touch (dust over dunes, damp over marsh).
        var bf = Biomes.Get(BiomeHere).Fog;
        hor = Lerp(hor, new Color(hor.R * bf.R / 0.75f, hor.G * bf.G / 0.83f, hor.B * bf.B / 0.95f), 0.35f * dayF);

        // Rain greys everything and pulls the fog in.
        var grey = new Color(0.5f, 0.53f, 0.58f) * (0.25f + 0.75f * dayF);
        top = Lerp(top, grey * 0.85f, Rain * 0.75f);
        hor = Lerp(hor, grey, Rain * 0.7f);

        float daylight = Mathf.Lerp(moonLight, 1f, dayF) * (1f - 0.32f * Rain - 0.2f * Storm);
        if (LightningFlash > 0f)
        {
            daylight = Math.Min(1f, daylight + LightningFlash);
            hor = Lerp(hor, new Color(0.85f, 0.88f, 1f), LightningFlash * 0.6f);
            top = Lerp(top, new Color(0.7f, 0.75f, 0.95f), LightningFlash * 0.6f);
            LightningFlash = Math.Max(0f, LightningFlash - (float)delta * 3.5f);
        }
        Daylight = daylight;
        CurrentDaylight = daylight;
        Horizon = hor; SkyTop = top;

        var skyTint = Lerp(new Color(0.55f, 0.62f, 0.95f), Colors.White, dayF);
        skyTint = Lerp(skyTint, new Color(1f, 0.8f, 0.66f), dusk * 0.55f);
        var glow = Lerp(new Color(1f, 0.93f, 0.8f), new Color(1f, 0.55f, 0.28f), dusk);

        var fog = hor;
        float fogEnd = Math.Max(24f, renderDistance - 8f);
        float fogStart = fogEnd * (0.66f - 0.36f * Rain);
        if (Underwater)
        {
            fog = new Color(0.07f, 0.2f, 0.33f) * (0.25f + 0.75f * daylight);
            fogStart = 0f; fogEnd = 28f;
        }
        FogColor = fog;

        // Colours are designed in sRGB; global shader colours reach the shaders
        // untouched, and the shaders work in linear light, so convert here.
        var moon = -sun;
        RenderingServer.GlobalShaderParameterSet("daylight", daylight);
        RenderingServer.GlobalShaderParameterSet("sky_tint", skyTint.SrgbToLinear());
        RenderingServer.GlobalShaderParameterSet("torch_tint", TorchTint.SrgbToLinear());
        RenderingServer.GlobalShaderParameterSet("fog_color", fog.SrgbToLinear());
        RenderingServer.GlobalShaderParameterSet("fog_start", fogStart);
        RenderingServer.GlobalShaderParameterSet("fog_end", fogEnd);
        RenderingServer.GlobalShaderParameterSet("sun_dir", sun);
        RenderingServer.GlobalShaderParameterSet("moon_dir", moon);
        RenderingServer.GlobalShaderParameterSet("sky_top", top.SrgbToLinear());
        RenderingServer.GlobalShaderParameterSet("sky_horizon", hor.SrgbToLinear());
        RenderingServer.GlobalShaderParameterSet("sun_glow", glow.SrgbToLinear());
        RenderingServer.GlobalShaderParameterSet("star_alpha", (1f - Smooth.Step(-0.28f, 0.04f, s)) * (1f - Rain));
        RenderingServer.GlobalShaderParameterSet("moon_phase", (Day % 8) / 8f);
        RenderingServer.GlobalShaderParameterSet("cloud_cover", 0.42f + 0.5f * Rain);
        RenderingServer.GlobalShaderParameterSet("cloud_shade", Lerp(Colors.White, new Color(0.55f, 0.57f, 0.62f), Rain).SrgbToLinear());
        RenderingServer.GlobalShaderParameterSet("underwater", Underwater ? 1f : 0f);
        RenderingServer.GlobalShaderParameterSet("brightness", brightness);

        if (_env != null) _env.Environment.BackgroundColor = fog;
        if (_dome != null) _dome.GlobalPosition = cam;
        if (_clouds != null) _clouds.GlobalPosition = new Vector3(cam.X, 192f, cam.Z);
    }

    /// <summary>0 at new moon, 1 at full; an eight-day cycle.</summary>
    public float MoonFullness
    {
        get
        {
            float p = (Day % 8) / 8f;
            return 0.5f + 0.5f * MathF.Cos((p - 0.5f) * MathF.Tau);
        }
    }

    private static Color Lerp(Color a, Color b, float t) => a.Lerp(b, Math.Clamp(t, 0f, 1f));
}
