using System;
using System.Collections.Generic;
using Godot;

namespace Strata;

/// <summary>
/// What a blast does to the world: blocks inside a ragged sphere are blown
/// away, the tougher ones only close to the centre (a block's hardness eats
/// into the radius, and nothing unbreakable goes), and loose things nearby are
/// thrown outward and hurt by how close they were. Pure game logic, no
/// effects: the caller turns the result into flame, smoke, debris and sound.
/// </summary>
public static class Explosions
{
    public struct Result
    {
        public List<(Vector3I cell, ushort id)> Removed;
    }

    /// <summary>
    /// Blows a hole of about radius r around c. Returns what was removed (so
    /// the caller can throw a few of those blocks as debris or leave drops).
    /// </summary>
    public static Result Blast(World w, Vector3 c, float r, ulong seed)
    {
        var res = new Result { Removed = new() };
        int x0 = V.FloorToInt(c.X - r), x1 = V.FloorToInt(c.X + r);
        int y0 = Math.Max(1, V.FloorToInt(c.Y - r)), y1 = Math.Min(V.Height - 1, V.FloorToInt(c.Y + r));
        int z0 = V.FloorToInt(c.Z - r), z1 = V.FloorToInt(c.Z + r);
        for (int y = y0; y <= y1; y++)
            for (int z = z0; z <= z1; z++)
                for (int x = x0; x <= x1; x++)
                {
                    ushort id = w.GetBlock(x, y, z);
                    if (id == Blocks.Air) continue;
                    var d = Blocks.ById[id];
                    if (!d.Breakable || d.Liquid) continue;
                    float dist = new Vector3(x + 0.5f - c.X, y + 0.5f - c.Y, z + 0.5f - c.Z).Length();
                    // Ragged edge, and hard blocks resist: stone survives further out than dirt or leaves.
                    float rough = 0.75f + 0.5f * Hash.Unit(Hash.Of((long)seed, x, y, z));
                    float reach = r * rough / (1f + 0.12f * Math.Min(d.Hardness, 8f));
                    if (dist > reach) continue;
                    if (!w.IsReady(x, z)) continue;
                    if (w.SetBlock(x, y, z, Blocks.Air, updateNeighbours: false)) res.Removed.Add((new Vector3I(x, y, z), id));
                }
        // Loose things around the edge (torches, plants) come down once the holes are made.
        foreach (var (cell, _) in res.Removed) w.CheckSupports(cell.X, cell.Y, cell.Z);
        return res;
    }

    /// <summary>How hard the blast hits something at distance d: 1 at the centre, 0 at twice the radius.</summary>
    public static float Falloff(float d, float r) => Math.Clamp(1f - d / (r * 2f), 0f, 1f);
}
