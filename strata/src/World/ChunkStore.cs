using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Threading;

namespace Strata;

/// <summary>
/// Saved columns on disk, one file each, holding only columns the player has
/// changed (untouched ones regenerate from the seed). Writes go through a
/// background thread; until a write lands its bytes stay in memory so a column
/// reloaded in the meantime reads the newest copy, never the stale file.
/// Every file is written to a temporary name and renamed into place, so a
/// crash mid-write leaves the previous version intact.
/// </summary>
public sealed class ChunkStore : IDisposable
{
    public readonly string Dir;
    private readonly Dictionary<long, byte[]> _pending = new();
    private readonly object _lock = new();
    private readonly BlockingCollection<(long key, byte[] data)> _writes = new();
    private readonly Thread _thread;
    private int _inFlight;

    public ChunkStore(string dir)
    {
        Dir = dir;
        Directory.CreateDirectory(dir);
        _thread = new Thread(WriteLoop) { IsBackground = true, Name = "strata-io" };
        _thread.Start();
    }

    public string PathFor(int cx, int cz) => Path.Combine(Dir, $"c_{cx}_{cz}.bin");

    /// <summary>The saved bytes for a column, or null if it was never changed. Thread-safe.</summary>
    public byte[] Read(int cx, int cz)
    {
        long key = V.Key(cx, cz);
        lock (_lock)
            if (_pending.TryGetValue(key, out var mem)) return mem;
        string p = PathFor(cx, cz);
        try
        {
            return File.Exists(p) ? File.ReadAllBytes(p) : null;
        }
        catch (IOException)
        {
            return null;
        }
    }

    public void Write(int cx, int cz, byte[] data)
    {
        long key = V.Key(cx, cz);
        lock (_lock) { _pending[key] = data; _inFlight++; }
        _writes.Add((key, data));
    }

    private void WriteLoop()
    {
        foreach (var (key, data) in _writes.GetConsumingEnumerable())
        {
            int cx = V.KeyX(key), cz = V.KeyZ(key);
            try { AtomicWrite(PathFor(cx, cz), data); }
            catch (Exception e) { Godot.GD.PrintErr($"saving column {cx},{cz} failed: {e.Message}"); }
            lock (_lock)
            {
                _inFlight--;
                // Only forget the in-memory copy if nothing newer arrived meanwhile.
                if (_pending.TryGetValue(key, out var cur) && ReferenceEquals(cur, data)) _pending.Remove(key);
            }
        }
    }

    public static void AtomicWrite(string path, byte[] data)
    {
        string tmp = path + ".tmp";
        using (var fs = new FileStream(tmp, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            fs.Write(data, 0, data.Length);
            fs.Flush(true);
        }
        File.Move(tmp, path, true);
    }

    public static void AtomicWriteText(string path, string text) => AtomicWrite(path, System.Text.Encoding.UTF8.GetBytes(text));

    /// <summary>Waits for every queued write to reach the disk.</summary>
    public void Flush(int timeoutMs = 20000)
    {
        long start = Environment.TickCount64;
        while (Environment.TickCount64 - start < timeoutMs)
        {
            lock (_lock) if (_inFlight == 0) return;
            Thread.Sleep(2);
        }
    }

    public void Dispose()
    {
        Flush();
        _writes.CompleteAdding();
        _thread.Join(2000);
    }
}
