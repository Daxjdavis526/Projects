using System;

namespace Strata;

/// <summary>
/// The launch complex east of the castle, laid out on the flat ground at
/// <see cref="LandmarkSite.ComplexCentre"/>. It is built around one fact: the
/// rocket (see <see cref="Rocket"/>) stands on the pad with its axis at the
/// centre of block column P, its fin tips on the deck at <see cref="Deck"/>,
/// and its hatch facing east, 25 m up. Everything that touches the rocket is
/// placed from those numbers:
///
///   the pad: a raised concrete block with a 5×5 hole under the engine, a
///     stepped deflector under the hole, and a flame trench that carries the
///     exhaust north and out into an open channel;
///   hold-down posts beside each fin tip;
///   the launch tower to the east, its crew arm at deck + 23 reaching to
///     within 0.8 m of the capsule, a ladder up its spine, platforms every 8 m,
///     a lightning mast, and a base room with a launch console;
///   a crawlerway ramp from the west, up from the assembly building's doors;
///   a fuel farm and a water tower feeding pipes to the tower;
///   a launch control bunker with blast slits facing the pad, and parking;
///   floodlight masts, lightning masts and warning lamps for the night.
/// </summary>
public sealed class LaunchComplex
{
    /// <summary>The first air above the launch pad's deck: the rocket's fins stand at this height.</summary>
    public const int Deck = LandmarkSite.Valley + 6;
    public const int ArmFloor = Deck + 23;       // the crew arm's floor: its top face is level with the hatch sill

    private readonly LandmarkSite _site;
    private readonly Canvas _c;
    private readonly Gothic _g;
    private Rng _r;
    private readonly int Px, Pz;                 // the pad's centre column
    private const int G = LandmarkSite.Valley;   // first air on the flat ground

    public LaunchComplex(LandmarkSite site, Canvas c, Rng r)
    {
        _site = site; _c = c; _r = r;
        _g = new Gothic(site, c, r);
        Px = LandmarkSite.PadCentre.X; Pz = LandmarkSite.PadCentre.Y;
    }

    public void Build()
    {
        Grounds();
        Pad();
        Trench();
        Tower();
        Ramp();
        Assembly();
        FuelFarm();
        WaterTower();
        Bunker();
        Masts();
    }

    private void Set(int x, int y, int z, ushort id) => _c.Set(x, y, z, id);
    private void Fill(int x0, int y0, int z0, int x1, int y1, int z1, ushort id) => _c.Fill(x0, y0, z0, x1, y1, z1, id);

    // --- the ground ---------------------------------------------------------------------------

    /// <summary>Aprons, roads and parking: concrete round the pad, asphalt between the buildings.</summary>
    private void Grounds()
    {
        // A concrete apron round the pad.
        for (int z = Pz - 24; z <= Pz + 24; z++)
            for (int x = Px - 24; x <= Px + 24; x++)
                Set(x, G - 1, z, (x + z) % 7 == 0 ? Blocks.Concrete : Blocks.PadConcrete);
        // The road from the castle ends at (184, 54): on east to the crawlerway, and south to the bunker.
        Paved(184, 50, 202, 55, 0);
        Paved(196, 41, 202, 55, 1);
        Paved(184, 55, 189, 76, 1);
        // Parking by the bunker.
        for (int z = 60; z <= 74; z++)
            for (int x = 170; x <= 183; x++)
                Set(x, G - 1, z, (x - 170) % 4 == 0 && z != 67 ? Blocks.RoadLine : Blocks.Asphalt);
        // The crawlerway: from the assembly doors to the ramp, a broad double lane.
        for (int z = Pz - 6; z <= Pz + 6; z++)
            for (int x = 192; x <= 205; x++)
                Set(x, G - 1, z, Math.Abs(z - Pz) == 4 ? Blocks.Concrete : Blocks.Asphalt);
    }

    private void Paved(int x0, int z0, int x1, int z1, int axis)
    {
        for (int z = z0; z <= z1; z++)
            for (int x = x0; x <= x1; x++)
            {
                bool centre = axis == 0 ? z == (z0 + z1) / 2 && x % 6 < 3 : x == (x0 + x1) / 2 && z % 6 < 3;
                Set(x, G - 1, z, centre ? Blocks.RoadLine : Blocks.Asphalt);
                _c.Carve(x, G, z, x, G + 3, z);
            }
    }

    // --- the pad ------------------------------------------------------------------------------

    private void Pad()
    {
        int top = Deck - 1;
        for (int z = Pz - 16; z <= Pz + 16; z++)
            for (int x = Px - 16; x <= Px + 16; x++)
                for (int y = G - 1; y <= top; y++)
                {
                    bool edge = Math.Abs(x - Px) == 16 || Math.Abs(z - Pz) == 16;
                    Set(x, y, z, y == top ? (edge ? Blocks.Hazard : ScorchAt(x, z)) : edge ? Blocks.Concrete : Blocks.PadConcrete);
                }
        // The hole the engine fires into, ringed with warning stripes.
        _c.Carve(Px - 2, top, Pz - 2, Px + 2, top, Pz + 2);
        for (int d = -3; d <= 3; d++)
        {
            Set(Px + d, top, Pz - 3, Blocks.Hazard); Set(Px + d, top, Pz + 3, Blocks.Hazard);
            Set(Px - 3, top, Pz + d, Blocks.Hazard); Set(Px + 3, top, Pz + d, Blocks.Hazard);
        }
        // Hold-down posts: a steel block either side of each fin tip (the fins stand on the diagonals).
        for (int sx = -1; sx <= 1; sx += 2)
            for (int sz = -1; sz <= 1; sz += 2)
            {
                int tx = Px + 3 * sx, tz = Pz + 3 * sz;
                Set(tx + sx, Deck, tz, Blocks.SteelPlate);
                Set(tx, Deck, tz + sz, Blocks.SteelPlate);
                Set(tx + sx, Deck + 1, tz, Blocks.WarningLamp);
            }
        // Railings round the deck, open on the west (the ramp) and where the tower stands.
        for (int d = -16; d <= 16; d++)
        {
            if (Math.Abs(d) > 6) Set(Px - 16, Deck, Pz + d, Blocks.IronBars);
            Set(Px + d, Deck, Pz - 16, Blocks.IronBars);
            Set(Px + d, Deck, Pz + 16, Blocks.IronBars);
            if (d < -4 || d > 4) Set(Px + 16, Deck, Pz + d, Blocks.IronBars);
        }
        // Lamps on the corners.
        foreach (var (cx, cz) in new[] { (-16, -16), (16, -16), (-16, 16), (16, 16) })
        {
            Set(Px + cx, Deck, Pz + cz, Blocks.SteelPlate);
            Set(Px + cx, Deck + 1, Pz + cz, Blocks.SteelPlate);
            Set(Px + cx, Deck + 2, Pz + cz, Blocks.FloodLamp);
        }
        // Stairs up the south face for people on foot.
        for (int i = 0; i < 12; i++)
        {
            float t = G + (i + 1) * 0.5f;
            int yb = (int)MathF.Floor(t);
            for (int w = 0; w < 3; w++)
            {
                int x = Px - 10 + w, z = Pz + 28 - i;
                for (int y = G - 1; y < yb; y++) Set(x, y, z, Blocks.Concrete);
                if (t - yb > 0.01f) Set(x, yb, z, Blocks.ConcreteSlab);
                _c.Carve(x, yb + 1, z, x, yb + 3, z);
            }
        }
        _c.Carve(Px - 10, Deck, Pz + 16, Px - 8, Deck + 2, Pz + 16);
    }

    /// <summary>The deck is blackened most near the hole, fading outward.</summary>
    private ushort ScorchAt(int x, int z)
    {
        float d = MathF.Sqrt((x - Px) * (x - Px) + (z - Pz) * (z - Pz));
        return _g.H(x, 0, z, 91) * 12f > d - 3f ? Blocks.PadConcrete : Blocks.Concrete;
    }

    /// <summary>
    /// Under the hole, a deflector of stepped concrete that slopes down to the
    /// north; a tunnel under the deck carries the flame that way, and past
    /// the pad's edge it runs on as an open channel rising back to the ground.
    /// </summary>
    private void Trench()
    {
        int floor = G - 7, top = Deck - 2;
        // Under the deck: walls, floor, and the tunnel itself.
        for (int z = Pz - 16; z <= Pz + 4; z++)
        {
            Fill(Px - 4, floor, z, Px + 4, top, z, Blocks.PadConcrete);
            _c.Carve(Px - 3, floor + 1, z, Px + 3, top, z);
        }
        Fill(Px - 4, floor, Pz + 4, Px + 4, top, Pz + 4, Blocks.PadConcrete);
        // The deflector: from high at the south end of the hole down to the floor two blocks north of it.
        for (int z = Pz - 6; z <= Pz + 3; z++)
        {
            int h = floor + Math.Max(0, z - (Pz - 7));
            if (h > floor) Fill(Px - 3, floor + 1, z, Px + 3, h, z, Blocks.PadConcrete);
        }
        // North of the pad: an open channel, its floor rising to meet the ground.
        for (int z = Pz - 40; z < Pz - 16; z++)
        {
            int bed = floor + Math.Max(0, (Pz - 16 - z) / 4);
            if (bed >= G - 1) bed = G - 1;
            Fill(Px - 4, bed, z, Px + 4, G - 1, z, Blocks.PadConcrete);
            if (bed < G - 1) _c.Carve(Px - 3, bed + 1, z, Px + 3, G + 4, z);
            // Blast walls either side, and a warning lamp now and then.
            Set(Px - 4, G, z, Blocks.Concrete); Set(Px + 4, G, z, Blocks.Concrete);
            if (z % 8 == 0) { Set(Px - 4, G + 1, z, Blocks.WarningLamp); Set(Px + 4, G + 1, z, Blocks.WarningLamp); }
        }
    }

    // --- the tower ----------------------------------------------------------------------------

    private void Tower()
    {
        int x0 = Px + 6, x1 = Px + 11, z0 = Pz - 3, z1 = Pz + 3, y0 = Deck, yTop = Deck + 40;
        int spineX = x1, ladderX = x1 - 1, ladderZ = Pz;
        // Columns at the corners and mid-faces; cross-bracing on the faces between platforms.
        for (int y = y0; y <= yTop; y++)
        {
            foreach (int x in new[] { x0, x1 })
                foreach (int z in new[] { z0, Pz, z1 })
                    Set(x, y, z, Blocks.SteelTruss);
            int k = (y - y0) % 8;
            // Diagonal bracing on each face, zig-zagging from bay to bay.
            int zz = z0 + Math.Min(k, 8 - k) * 3 / 4;
            Set(x0, y, zz, Blocks.SteelTruss); Set(x1, y, z1 - (zz - z0), Blocks.SteelTruss);
            int xx = x0 + Math.Min(k, 8 - k) * 5 / 8;
            Set(xx, y, z0, Blocks.SteelTruss); Set(x1 - (xx - x0), y, z1, Blocks.SteelTruss);
        }
        // The spine: solid steel down the east side, carrying the ladder.
        for (int y = y0; y <= yTop; y++) Set(spineX, y, ladderZ, Blocks.SteelPlate);
        // Platforms every 8 m, the crew arm's among them; a way through for the ladder.
        for (int y = ArmFloor - 16; y <= yTop; y += 8)
        {
            Fill(x0, y, z0, x1, y, z1, Blocks.SteelGrating);
            Set(spineX, y, ladderZ, Blocks.SteelPlate);
        }
        // The base room: steel walls, a door toward the pad, a console, a light.
        Fill(x0, y0, z0, x1, y0 + 3, z1, Blocks.SteelPlate);
        _c.Carve(x0 + 1, y0, z0 + 1, x1 - 1, y0 + 2, z1 - 1);
        _c.Carve(x0, y0, Pz, x0, y0 + 1, Pz);
        Set(x0 + 2, y0, z0 + 1, Blocks.LaunchConsole);
        Set(x0 + 3, y0, z0 + 1, Blocks.LaunchConsole);
        Set(x0 + 2, y0 + 2, Pz, Blocks.FloodLamp);
        // The ladder, all the way up, through a gap in every floor.
        for (int y = y0; y <= yTop; y++)
        {
            _c.Set(ladderX, y, ladderZ, Blocks.Air);
            _g.OnWall(Blocks.Ladder, ladderX, y, ladderZ, Dir.PX);
        }
        // The roof and the lightning mast.
        Fill(x0, yTop + 1, z0, x1, yTop + 1, z1, Blocks.SteelPlate);
        _c.Carve(ladderX, yTop + 1, ladderZ, ladderX, yTop + 1, ladderZ);
        for (int y = yTop + 2; y <= yTop + 14; y++) Set(x0 + 2, y, Pz, Blocks.SteelTruss);
        Set(x0 + 2, yTop + 15, Pz, Blocks.WarningLamp);
        foreach (int x in new[] { x0, x1 }) foreach (int z in new[] { z0, z1 }) Set(x, yTop + 2, z, Blocks.WarningLamp);
        for (int d = x0; d <= x1; d++) { Set(d, yTop + 2, z0 + 1, Blocks.IronBars); Set(d, yTop + 2, z1 - 1, Blocks.IronBars); }

        // The crew arm: grating out to within a step of the capsule, rails, a white room over the end.
        for (int x = Px + 3; x < x0; x++)
        {
            Fill(x, ArmFloor, Pz - 1, x, ArmFloor, Pz + 1, Blocks.SteelGrating);
            Set(x, ArmFloor - 1, Pz - 1, Blocks.SteelTruss); Set(x, ArmFloor - 1, Pz + 1, Blocks.SteelTruss);
            Set(x, ArmFloor + 1, Pz - 2, Blocks.IronBars); Set(x, ArmFloor + 1, Pz + 2, Blocks.IronBars);
            Fill(x, ArmFloor + 2, Pz - 2, x, ArmFloor + 3, Pz - 2, Blocks.HullPanel);
            Fill(x, ArmFloor + 2, Pz + 2, x, ArmFloor + 3, Pz + 2, Blocks.HullPanel);
            Fill(x, ArmFloor + 4, Pz - 2, x, ArmFloor + 4, Pz + 2, Blocks.HullPanel);
        }
        _c.Carve(x0, ArmFloor + 1, Pz - 1, x0, ArmFloor + 3, Pz + 1);
        Set(Px + 3, ArmFloor + 3, Pz - 2, Blocks.WarningLamp);
        Set(Px + 3, ArmFloor + 3, Pz + 2, Blocks.WarningLamp);
        // The umbilical arm lower down: a steel beam with the fuel lines on it.
        for (int x = Px + 3; x < x0; x++) { Set(x, Deck + 12, Pz, Blocks.SteelTruss); Set(x, Deck + 11, Pz, Blocks.SteelPlate); }
        // Floodlights on the tower's face, trained on the rocket.
        foreach (int y in new[] { Deck + 4, Deck + 12, Deck + 19, Deck + 30 })
        {
            Set(x0, y, Pz - 1, Blocks.FloodLamp);
            Set(x0, y, Pz + 1, Blocks.FloodLamp);
        }
        // A second console out on the deck by the tower's door.
        Set(x0 - 1, Deck, z1 + 1, Blocks.LaunchConsole);
    }

    /// <summary>The crawlerway ramp up the west side of the pad, in half steps a person can walk.</summary>
    private void Ramp()
    {
        int steps = (Deck - G) * 2;
        for (int i = 0; i < steps; i++)
        {
            int x = Px - 17 - steps + 1 + i;
            float t = G + (i + 1) * 0.5f;
            int yb = (int)MathF.Floor(t);
            for (int z = Pz - 6; z <= Pz + 6; z++)
            {
                bool edge = Math.Abs(z - Pz) == 6;
                for (int y = G - 1; y < yb; y++) Set(x, y, z, Blocks.Concrete);
                if (t - yb > 0.01f) Set(x, yb, z, edge ? Blocks.Concrete : Blocks.ConcreteSlab);
            }
        }
    }

    // --- the buildings ------------------------------------------------------------------------

    /// <summary>The assembly building: a tall white hall with a door high enough for a rocket, facing the crawlerway.</summary>
    private void Assembly()
    {
        int x0 = 164, x1 = 192, z0 = Pz - 14, z1 = Pz + 14, yTop = G + 44;
        for (int y = G - 1; y <= yTop; y++)
            for (int z = z0; z <= z1; z++)
                for (int x = x0; x <= x1; x++)
                {
                    bool wall = x == x0 || x == x1 || z == z0 || z == z1;
                    if (y == G - 1) { Set(x, y, z, Blocks.Concrete); continue; }
                    if (y == yTop) { Set(x, y, z, Blocks.SteelPlate); continue; }
                    if (!wall) { _c.Set(x, y, z, Blocks.Air); continue; }
                    bool corner = (x == x0 || x == x1) && (z == z0 || z == z1);
                    bool rib = (x - x0) % 4 == 0 && (z == z0 || z == z1) || (z - z0) % 4 == 0 && (x == x0 || x == x1);
                    bool band = y == G + 36 || y == G + 37;
                    Set(x, y, z, corner ? Blocks.SteelTruss : band ? Blocks.Hazard : rib ? Blocks.SteelPlate : Blocks.HullPanel);
                }
        // The great door: open, 13 wide and 38 high.
        _c.Carve(x1, G, Pz - 6, x1, G + 37, Pz + 6);
        for (int y = G; y <= G + 38; y++) { Set(x1, y, Pz - 7, Blocks.SteelPlate); Set(x1, y, Pz + 7, Blocks.SteelPlate); }
        // Work platforms round the inside walls, reached by ladders; lamps under the roof.
        for (int y = G + 10; y < yTop - 4; y += 10)
        {
            for (int x = x0 + 1; x < x1; x++) { Set(x, y, z0 + 1, Blocks.SteelGrating); Set(x, y, z0 + 2, Blocks.SteelGrating); Set(x, y, z1 - 1, Blocks.SteelGrating); Set(x, y, z1 - 2, Blocks.SteelGrating); }
            for (int x = x0 + 3; x < x1; x++) { Set(x, y + 1, z0 + 3, Blocks.IronBars); Set(x, y + 1, z1 - 3, Blocks.IronBars); }
        }
        // Ladders on the west wall, beside each run of platforms.
        for (int y = G; y < yTop - 4; y++) { _g.OnWall(Blocks.Ladder, x0 + 1, y, z0 + 3, Dir.NX); _g.OnWall(Blocks.Ladder, x0 + 1, y, z1 - 3, Dir.NX); }
        for (int z = z0 + 4; z <= z1 - 4; z += 6)
            for (int x = x0 + 4; x <= x1 - 4; x += 6)
                Set(x, yTop - 1, z, Blocks.FloodLamp);
        // Stands and crates on the floor, and a spare engine bell's worth of steel.
        Fill(x0 + 6, G, Pz - 3, x0 + 8, G + 2, Pz + 3, Blocks.SteelTruss);
        _c.Crate(x0 + 3, G, z0 + 5, "armory");
        _c.Crate(x0 + 3, G, z1 - 5, "larder");
        Fill(x0 + 12, G, z0 + 4, x0 + 14, G, z0 + 6, Blocks.SteelPlate);
        Fill(x0 + 12, G, z1 - 6, x0 + 14, G, z1 - 4, Blocks.HullPanel);
    }

    /// <summary>Three tall propellant tanks on legs behind a hazard fence, and the pipe to the tower.</summary>
    private void FuelFarm()
    {
        var tanks = new[] { (Px + 38, Pz - 26, 5, 14), (Px + 52, Pz - 18, 5, 14), (Px + 44, Pz - 6, 4, 10) };
        foreach (var (cx, cz, r, h) in tanks)
        {
            int y0 = G + 3;
            // Legs.
            foreach (var (lx, lz) in new[] { (-r + 1, -r + 1), (r - 1, -r + 1), (-r + 1, r - 1), (r - 1, r - 1) })
                for (int y = G; y < y0; y++) Set(cx + lx, y, cz + lz, Blocks.SteelTruss);
            // The tank: a cylinder with rounded ends.
            for (int y = y0; y <= y0 + h + r; y++)
                for (int dz = -r; dz <= r; dz++)
                    for (int dx = -r; dx <= r; dx++)
                    {
                        float d = MathF.Sqrt(dx * dx + dz * dz);
                        float capR = y < y0 + h ? r + 0.3f : MathF.Sqrt(Math.Max(0, (r + 0.3f) * (r + 0.3f) - (y - (y0 + h)) * (y - (y0 + h)) * 1.4f));
                        if (d > capR) continue;
                        if (d < capR - 1.2f && y > y0 && y < y0 + h + r - 1) continue;     // hollow
                        bool band = y == y0 + h / 2 || y == y0 + 1;
                        Set(cx + dx, y, cz + dz, band ? Blocks.SteelPlate : (dx + dz + y) % 13 == 0 ? Blocks.Hazard : Blocks.HullPanel);
                    }
            // A ladder up the side and a lamp on top.
            for (int y = G; y <= y0 + h; y++) _g.OnWall(Blocks.Ladder, cx, y, cz + r + 1, Dir.NZ);
            Set(cx, y0 + h + r + 1, cz, Blocks.WarningLamp);
        }
        // The fence.
        int fx0 = Px + 30, fx1 = Px + 60, fz0 = Pz - 34, fz1 = Pz + 2;
        for (int x = fx0; x <= fx1; x++) { Fence(x, fz0); if (x < fx0 + 10 || x > fx0 + 14) Fence(x, fz1); }
        for (int z = fz0; z <= fz1; z++) { Fence(fx0, z); Fence(fx1, z); }
        // The pipe: from the farm along the ground on supports, up the side of the pad, across the deck into the tower.
        int py = G + 1;
        for (int x = Px + 17; x <= fx0 + 12; x++) { Set(x, py, Pz + 5, Blocks.SteelPlate); if (x % 4 == 0) Set(x, G, Pz + 5, Blocks.SteelTruss); }
        for (int z = Pz - 6; z <= Pz + 5; z++) Set(fx0 + 12, py, z, Blocks.SteelPlate);
        for (int y = py; y <= Deck; y++) Set(Px + 17, y, Pz + 5, Blocks.SteelPlate);
        for (int x = Px + 12; x <= Px + 16; x++) Set(x, Deck, Pz + 5, Blocks.SteelPlate);
    }

    private void Fence(int x, int z)
    {
        Set(x, G, z, (x + z) % 6 == 0 ? Blocks.Hazard : Blocks.IronBars);
        Set(x, G + 1, z, Blocks.IronBars);
    }

    /// <summary>The deluge water tower: a tank high on four legs.</summary>
    private void WaterTower()
    {
        int cx = Px + 40, cz = Pz + 26, r = 4, y0 = G + 22;
        for (int y = G; y < y0; y++)
            foreach (var (lx, lz) in new[] { (-3, -3), (3, -3), (-3, 3), (3, 3) })
            {
                Set(cx + lx, y, cz + lz, Blocks.SteelTruss);
                // Cross-bracing every 6 m.
                if ((y - G) % 6 == 0) for (int k = -3; k <= 3; k++) { Set(cx + k, y, cz - 3, Blocks.SteelTruss); Set(cx + k, y, cz + 3, Blocks.SteelTruss); Set(cx - 3, y, cz + k, Blocks.SteelTruss); Set(cx + 3, y, cz + k, Blocks.SteelTruss); }
            }
        for (int y = y0; y <= y0 + 8; y++)
            for (int dz = -r; dz <= r; dz++)
                for (int dx = -r; dx <= r; dx++)
                {
                    float d = MathF.Sqrt(dx * dx + dz * dz);
                    float rr = y == y0 + 8 ? r - 1.5f : r + 0.3f;
                    if (d > rr) continue;
                    if (d < rr - 1.2f && y > y0 && y < y0 + 8) continue;
                    Set(cx + dx, y, cz + dz, y == y0 + 4 ? Blocks.Hazard : Blocks.HullPanel);
                }
        Set(cx, y0 + 9, cz, Blocks.WarningLamp);
        for (int y = G; y < y0; y++) _g.OnWall(Blocks.Ladder, cx + 3, y, cz, Dir.PX);
        // The deluge main, to the pad.
        for (int x = Px + 17; x <= cx; x++) Set(x, G, cz, Blocks.SteelPlate);
    }

    /// <summary>The launch control bunker: thick concrete, slit windows facing the pad, consoles in a row.</summary>
    private void Bunker()
    {
        int x0 = 190, x1 = 214, z0 = 64, z1 = 78, yTop = G + 5;
        for (int y = G - 1; y <= yTop; y++)
            for (int z = z0; z <= z1; z++)
                for (int x = x0; x <= x1; x++)
                {
                    bool shell = x <= x0 + 1 || x >= x1 - 1 || z <= z0 + 1 || z >= z1 - 1 || y == G - 1 || y >= yTop - 1;
                    Set(x, y, z, shell ? Blocks.Concrete : Blocks.Air);
                }
        // A sloped roof of slabs round the edge, as if earth were banked against it.
        for (int x = x0 - 1; x <= x1 + 1; x++) { Set(x, G, z0 - 1, Blocks.ConcreteSlab); Set(x, G, z1 + 1, Blocks.ConcreteSlab); }
        for (int z = z0 - 1; z <= z1 + 1; z++) { Set(x0 - 1, G, z, Blocks.ConcreteSlab); Set(x1 + 1, G, z, Blocks.ConcreteSlab); }
        // Slit windows in the north wall, toward the pad.
        for (int x = x0 + 3; x <= x1 - 3; x++) if (x % 3 != 0) { Set(x, G + 2, z0, Blocks.Glass); Set(x, G + 2, z0 + 1, Blocks.Glass); }
        // Consoles under the windows, a second row behind.
        for (int x = x0 + 3; x <= x1 - 3; x++) Set(x, G, z0 + 2, x % 4 == 0 ? Blocks.SteelPlate : Blocks.LaunchConsole);
        for (int x = x0 + 5; x <= x1 - 5; x += 2) Set(x, G, z0 + 6, Blocks.LaunchConsole);
        // Lights, the door, a crate of supplies, a map table.
        for (int x = x0 + 4; x <= x1 - 4; x += 5) Set(x, yTop - 2, (z0 + z1) / 2, Blocks.FloodLamp);
        _c.Carve(x0, G, 71, x0 + 1, G + 1, 72);
        _c.Crate(x1 - 3, G, z1 - 3, "larder");
        _c.Crate(x1 - 4, G, z1 - 3, "armory");
        Fill(x0 + 8, G, z1 - 5, x0 + 12, G, z1 - 4, Blocks.SteelPlate);
        // A path to the parking.
        for (int x = 184; x < x0; x++) { Set(x, G - 1, 71, Blocks.Asphalt); Set(x, G - 1, 72, Blocks.Asphalt); }
    }

    /// <summary>Floodlight masts round the pad and two lightning masts beyond it.</summary>
    private void Masts()
    {
        foreach (var (dx, dz) in new[] { (-28, -26), (-28, 28), (26, 30), (22, -30) })
        {
            int x = Px + dx, z = Pz + dz, h = 26;
            for (int y = G; y < G + h; y++) Set(x, y, z, Blocks.SteelTruss);
            // A head of lamps, facing in.
            int fx = -Math.Sign(dx), fz = -Math.Sign(dz);
            Fill(x - 1, G + h, z - 1, x + 1, G + h, z + 1, Blocks.SteelPlate);
            Set(x + fx, G + h + 1, z, Blocks.FloodLamp); Set(x, G + h + 1, z + fz, Blocks.FloodLamp); Set(x + fx, G + h + 1, z + fz, Blocks.FloodLamp);
            Set(x, G + h + 1, z, Blocks.FloodLamp);
            Set(x, G + h + 2, z, Blocks.WarningLamp);
        }
        foreach (var (x, z) in new[] { (Px - 6, Pz - 46), (Px + 4, Pz + 44) })
        {
            for (int y = G; y < G + 58; y++) Set(x, y, z, Blocks.SteelTruss);
            for (int y = G + 14; y < G + 58; y += 14) Set(x, y, z, Blocks.WarningLamp);
            Set(x, G + 58, z, Blocks.WarningLamp);
            Fill(x - 1, G - 1, z - 1, x + 1, G, z + 1, Blocks.Concrete);
            Set(x, G, z, Blocks.SteelTruss);
        }
    }
}
