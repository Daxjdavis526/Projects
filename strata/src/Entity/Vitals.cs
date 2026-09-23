using System;

namespace Strata;

public enum DamageKind : byte { Generic, Fall, Drown, Starve, Lava, Cactus, Mob, Projectile, Void }

/// <summary>
/// Health, hunger, saturation and breath. Effort (sprinting, jumping, mining,
/// fighting, healing) builds exhaustion; every 4 points of it eats a point of
/// saturation, then of hunger. A well-fed body slowly heals; a starving one
/// slowly weakens. Pure logic, so the rules can be tested without the game.
/// </summary>
public sealed class Vitals
{
    public const float MaxHealth = 20f, MaxHunger = 20f, MaxAir = 10f;

    public float Health = MaxHealth;
    public float Hunger = MaxHunger;
    public float Saturation = 5f;
    public float Exhaustion;
    public float Air = MaxAir;
    public float Invulnerable;          // seconds of immunity after a hit
    public float LastDamage;            // amount of the last hit, for the red flash
    public DamageKind LastKind;
    public float SinceHurt = 99f;
    public int ArmorPoints;             // set by the wearer; each point turns aside 4% of a blow, up to 80%

    private float _regen, _starve, _drown;

    public bool Dead => Health <= 0f;
    public bool CanSprint => Hunger > 6f;

    public event Action<float, DamageKind> Hurt;
    public event Action<DamageKind> Died;
    public event Action<float> ArmorStruck;     // a blow the armour took some of: it wears

    /// <summary>What armour does to a blow of this kind: creatures, arrows, spines and the like, not falls, fire, drowning or hunger.</summary>
    public float Mitigated(float amount, DamageKind kind)
    {
        bool blocks = kind is DamageKind.Mob or DamageKind.Projectile or DamageKind.Cactus or DamageKind.Generic;
        return blocks && ArmorPoints > 0 ? amount * (1f - Math.Min(0.8f, ArmorPoints * 0.04f)) : amount;
    }

    public void Tick(float dt, bool headUnderwater)
    {
        if (Dead) return;
        Invulnerable = Math.Max(0f, Invulnerable - dt);
        SinceHurt += dt;

        while (Exhaustion >= 4f)
        {
            Exhaustion -= 4f;
            if (Saturation > 0f) Saturation = Math.Max(0f, Saturation - 1f);
            else Hunger = Math.Max(0f, Hunger - 1f);
        }

        // Healing: fast when well fed with saturation to spare, slow otherwise.
        if (Hunger >= 18f && Health < MaxHealth)
        {
            _regen += dt;
            float period = Saturation > 0f && Hunger >= MaxHunger ? 1.5f : 3.5f;
            if (_regen >= period)
            {
                _regen = 0f;
                Health = Math.Min(MaxHealth, Health + 1f);
                Exhaustion += 3f;
            }
        }
        else _regen = 0f;

        if (Hunger <= 0f)
        {
            _starve += dt;
            if (_starve >= 4f)
            {
                _starve = 0f;
                if (Health > 1f) Damage(1f, DamageKind.Starve, ignoreInvuln: true);
            }
        }
        else _starve = 0f;

        if (headUnderwater)
        {
            Air = Math.Max(0f, Air - dt);
            if (Air <= 0f)
            {
                _drown += dt;
                if (_drown >= 1f) { _drown = 0f; Damage(2f, DamageKind.Drown, ignoreInvuln: true); }
            }
        }
        else
        {
            Air = Math.Min(MaxAir, Air + dt * 5f);
            _drown = 0f;
        }
    }

    /// <summary>Applies damage unless still flinching from the last hit. Returns true if it landed.</summary>
    public bool Damage(float amount, DamageKind kind, bool ignoreInvuln = false)
    {
        if (Dead || amount <= 0f) return false;
        if (!ignoreInvuln && Invulnerable > 0f) return false;
        float taken = Mitigated(amount, kind);
        if (taken < amount) ArmorStruck?.Invoke(amount);
        amount = taken;
        Health = Math.Max(0f, Health - amount);
        Invulnerable = 0.5f;
        LastDamage = amount;
        LastKind = kind;
        SinceHurt = 0f;
        Exhaustion += 0.1f;
        Hurt?.Invoke(amount, kind);
        if (Dead) Died?.Invoke(kind);
        return true;
    }

    /// <summary>Fall damage: one point per metre beyond three.</summary>
    public static float FallDamage(float distance) => MathF.Max(0f, MathF.Floor(distance - 3f));

    public bool Hungry => Hunger < MaxHunger;

    public void Eat(ItemDef food)
    {
        Hunger = Math.Min(MaxHunger, Hunger + food.Food);
        Saturation = Math.Min(Hunger, Saturation + food.Saturation);
    }

    public void Exhaust(float amount) => Exhaustion += amount;

    public void Reset()
    {
        Health = MaxHealth; Hunger = MaxHunger; Saturation = 5f; Exhaustion = 0f; Air = MaxAir;
        Invulnerable = 2f; _regen = _starve = _drown = 0f; SinceHurt = 99f;
    }
}
