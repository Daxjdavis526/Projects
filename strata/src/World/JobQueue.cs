using System;
using System.Collections.Generic;
using System.Threading;

namespace Strata;

/// <summary>
/// A pool of background threads draining one priority queue (lowest number
/// first). Generation, lighting and meshing all run here; results come back
/// to the main thread through queues owned by whoever submitted the work.
/// </summary>
public sealed class JobQueue : IDisposable
{
    private readonly PriorityQueue<Action, long> _queue = new();
    private readonly object _lock = new();
    private readonly SemaphoreSlim _signal = new(0);
    private readonly Thread[] _threads;
    private volatile bool _stop;
    private long _order;
    private int _running;

    public int Pending { get { lock (_lock) return _queue.Count + _running; } }
    public int Workers => _threads.Length;
    public Exception LastError;

    public JobQueue(int threads)
    {
        _threads = new Thread[Math.Max(1, threads)];
        for (int i = 0; i < _threads.Length; i++)
        {
            _threads[i] = new Thread(Loop) { IsBackground = true, Name = "strata-worker-" + i, Priority = ThreadPriority.BelowNormal };
            _threads[i].Start();
        }
    }

    /// <summary>Queues work. Equal priorities run first-come first-served.</summary>
    public void Enqueue(int priority, Action job)
    {
        lock (_lock)
        {
            _queue.Enqueue(job, ((long)priority << 32) | (_order++ & 0xFFFFFFFF));
        }
        _signal.Release();
    }

    private void Loop()
    {
        while (!_stop)
        {
            _signal.Wait();
            if (_stop) break;
            Action job;
            lock (_lock)
            {
                if (!_queue.TryDequeue(out job, out _)) continue;
                _running++;
            }
            try { job(); }
            catch (Exception e)
            {
                LastError = e;
                Godot.GD.PrintErr("worker job failed: " + e);
            }
            finally { lock (_lock) _running--; }
        }
    }

    /// <summary>Blocks until everything queued so far has run (used by saves and tests).</summary>
    public void Drain(int timeoutMs = 30000)
    {
        var start = Environment.TickCount64;
        while (Pending > 0 && Environment.TickCount64 - start < timeoutMs) Thread.Sleep(2);
    }

    public void Clear()
    {
        lock (_lock) _queue.Clear();
    }

    public void Dispose()
    {
        _stop = true;
        for (int i = 0; i < _threads.Length; i++) _signal.Release();
        foreach (var t in _threads) t.Join(500);
    }
}
