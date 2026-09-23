using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using Godot;

namespace Strata;

public sealed class SlotSave { public int Slot; public string Item; public int Count; public int Wear; }
public sealed class DropSave { public string Item; public int Count; public int Wear; public double X, Y, Z; public float Age; }
public sealed class MobSave { public string Kind; public double X, Y, Z; public float Yaw, Health, Scale = 1f, Grow; public bool Persistent; }

public sealed class PlayerSave
{
    public double X, Y, Z;
    public float Yaw, Pitch;
    public float Health = 20, Hunger = 20, Saturation = 5, Air = 10;
    public int Selected;
    public List<SlotSave> Inventory = new();
    public List<SlotSave> Armor = new();
    public double SpawnX, SpawnY, SpawnZ;
    public bool BedSpawn;
}

public sealed class StatsSave { public int Mined, Placed, Kills, Crafted, Deaths; public double Walked; }

/// <summary>Everything about a world that is not in its column files.</summary>
public sealed class WorldMeta
{
    public int Version = 1;
    public string Name = "New World";
    public string SeedText = "";
    public long Seed;
    public DateTime Created = DateTime.Now;
    public DateTime LastPlayed = DateTime.Now;
    public double PlaySeconds;
    public double Time = 0.02;            // days; a little after sunrise
    public float Rain, WeatherTimer = 300f;
    public int WeatherState;
    public bool HasPlayer;
    public PlayerSave Player = new();
    public List<DropSave> Drops = new();
    public List<MobSave> Mobs = new();
    public StatsSave Stats = new();

    [System.Text.Json.Serialization.JsonIgnore] public string Folder;
    [System.Text.Json.Serialization.JsonIgnore] public string Error;
}

/// <summary>
/// Worlds on disk: user://worlds/&lt;folder&gt;/world.json plus a chunks folder.
/// The metadata is written atomically and the previous copy kept as a
/// backup, so a crash during a save can never leave a world unloadable.
/// </summary>
public static class WorldSave
{
    private static readonly JsonSerializerOptions Json = new() { IncludeFields = true, WriteIndented = true };

    public static string Root => ProjectSettings.GlobalizePath("user://worlds");
    public static string DirOf(string folder) => Path.Combine(Root, folder);
    public static string ChunkDir(string folder) => Path.Combine(DirOf(folder), "chunks");
    private static string MetaPath(string folder) => Path.Combine(DirOf(folder), "world.json");

    public static List<WorldMeta> List()
    {
        var list = new List<WorldMeta>();
        if (!Directory.Exists(Root)) return list;
        foreach (var dir in Directory.GetDirectories(Root))
        {
            string folder = Path.GetFileName(dir);
            var m = TryLoad(folder);
            if (m != null) list.Add(m);
        }
        list.Sort((a, b) => b.LastPlayed.CompareTo(a.LastPlayed));
        return list;
    }

    public static WorldMeta TryLoad(string folder)
    {
        foreach (var path in new[] { MetaPath(folder), MetaPath(folder) + ".bak" })
        {
            try
            {
                if (!File.Exists(path)) continue;
                var m = JsonSerializer.Deserialize<WorldMeta>(File.ReadAllText(path), Json);
                if (m == null) continue;
                m.Folder = folder;
                return m;
            }
            catch (Exception e)
            {
                GD.PrintErr($"world {folder}: {Path.GetFileName(path)} unreadable ({e.Message})");
            }
        }
        return null;
    }

    public static WorldMeta Create(string name, string seedText)
    {
        name = string.IsNullOrWhiteSpace(name) ? "New World" : name.Trim();
        if (name.Length > 40) name = name[..40];
        seedText = (seedText ?? "").Trim();
        long seed = seedText.Length == 0 ? (long)(new Random().NextInt64() & 0x7FFFFFFFFFFFL) : Hash.StringSeed(seedText);
        var m = new WorldMeta
        {
            Name = name,
            SeedText = seedText.Length == 0 ? seed.ToString() : seedText,
            Seed = seed,
            Created = DateTime.Now,
            LastPlayed = DateTime.Now,
        };
        m.Folder = UniqueFolder(name);
        Directory.CreateDirectory(ChunkDir(m.Folder));
        Write(m);
        return m;
    }

    private static string UniqueFolder(string name)
    {
        var chars = new List<char>();
        foreach (char c in name.ToLowerInvariant())
            chars.Add(char.IsLetterOrDigit(c) ? c : '_');
        string baseName = new string(chars.ToArray()).Trim('_');
        if (baseName.Length == 0) baseName = "world";
        // Windows reserves a few device names for folders, whatever the case.
        if (baseName is "con" or "prn" or "aux" or "nul" || (baseName.Length == 4 && (baseName.StartsWith("com") || baseName.StartsWith("lpt")) && char.IsDigit(baseName[3])))
            baseName += "_world";
        Directory.CreateDirectory(Root);
        string folder = baseName;
        for (int i = 2; Directory.Exists(DirOf(folder)); i++) folder = $"{baseName}_{i}";
        return folder;
    }

    public static void Write(WorldMeta m)
    {
        Directory.CreateDirectory(DirOf(m.Folder));
        string path = MetaPath(m.Folder);
        if (File.Exists(path)) File.Copy(path, path + ".bak", true);
        ChunkStore.AtomicWriteText(path, JsonSerializer.Serialize(m, Json));
    }

    public static void Delete(string folder)
    {
        string dir = DirOf(folder);
        if (Directory.Exists(dir) && dir.StartsWith(Root)) Directory.Delete(dir, true);
    }

    public static long SizeOnDisk(string folder)
    {
        long total = 0;
        try
        {
            foreach (var f in Directory.EnumerateFiles(DirOf(folder), "*", SearchOption.AllDirectories)) total += new FileInfo(f).Length;
        }
        catch (IOException) { }
        return total;
    }

    // --- conversions between live objects and saved ones ---------------------------------

    public static List<SlotSave> SaveInventory(Inventory inv)
    {
        var list = new List<SlotSave>();
        for (int i = 0; i < inv.Size; i++)
        {
            var s = inv[i];
            if (s.IsEmpty) continue;
            list.Add(new SlotSave { Slot = i, Item = s.Def.Key, Count = s.Count, Wear = s.Wear });
        }
        return list;
    }

    public static void LoadInventory(Inventory inv, List<SlotSave> list)
    {
        inv.Clear();
        if (list == null) return;
        foreach (var s in list)
        {
            if (s.Slot < 0 || s.Slot >= inv.Size || s.Count <= 0) continue;
            if (!Items.ByKey.TryGetValue(s.Item ?? "", out var id)) continue;
            inv.Slots[s.Slot] = new ItemStack(id, Math.Min(s.Count, Math.Max(1, Items.Get(id).MaxStack)), s.Wear);
        }
        inv.Touch();
    }
}
