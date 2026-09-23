using System;

namespace Strata;

/// <summary>
/// A fixed row of item slots. The player's is 36 (a 9-slot hotbar, then three
/// rows); crates are 27; a furnace is 3. All of the stack logic lives here so
/// it is testable without a UI.
/// </summary>
public sealed class Inventory
{
    public readonly ItemStack[] Slots;
    public int Version;                        // bumped on every change so views know to redraw
    public event Action Changed;

    public Inventory(int size) { Slots = new ItemStack[size]; }

    public int Size => Slots.Length;

    public ItemStack this[int i]
    {
        get => Slots[i];
        set { Slots[i] = value.IsEmpty ? ItemStack.Empty : value; Touch(); }
    }

    public void Touch() { Version++; Changed?.Invoke(); }

    public void Clear() { Array.Clear(Slots); Touch(); }

    public bool IsEmpty
    {
        get { foreach (var s in Slots) if (!s.IsEmpty) return false; return true; }
    }

    /// <summary>
    /// Adds as much of the stack as fits: first onto matching stacks, then into
    /// empty slots, both in slot order. Returns what did not fit.
    /// </summary>
    public ItemStack Add(ItemStack stack, int from = 0, int to = -1)
    {
        if (stack.IsEmpty) return ItemStack.Empty;
        if (to < 0) to = Slots.Length;
        int max = stack.Def.MaxStack;
        int left = stack.Count;
        bool changed = false;
        if (stack.Wear == 0 && max > 1)
        {
            for (int i = from; i < to && left > 0; i++)
            {
                ref var s = ref Slots[i];
                if (!s.CanStackWith(stack) || s.Count >= max) continue;
                int n = Math.Min(max - s.Count, left);
                s.Count += n; left -= n; changed = true;
            }
        }
        for (int i = from; i < to && left > 0; i++)
        {
            ref var s = ref Slots[i];
            if (!s.IsEmpty) continue;
            int n = Math.Min(Math.Max(1, max), left);
            s = new ItemStack(stack.Id, n, stack.Wear);
            left -= n; changed = true;
        }
        if (changed) Touch();
        return stack.WithCount(left);
    }

    public bool CanFit(ItemStack stack)
    {
        if (stack.IsEmpty) return true;
        int max = stack.Def.MaxStack, left = stack.Count;
        foreach (var s in Slots)
        {
            if (s.IsEmpty) left -= Math.Max(1, max);
            else if (s.CanStackWith(stack)) left -= max - s.Count;
            if (left <= 0) return true;
        }
        return false;
    }

    public int Count(ushort id)
    {
        int n = 0;
        foreach (var s in Slots) if (!s.IsEmpty && s.Id == id) n += s.Count;
        return n;
    }

    public int CountMatching(in Ingredient ing)
    {
        int n = 0;
        foreach (var s in Slots) if (!s.IsEmpty && s.Wear == 0 && ing.Matches(s.Id)) n += s.Count;
        return n;
    }

    /// <summary>Removes up to n of an item, from the last slots first so the hotbar keeps its stock.</summary>
    public int Remove(ushort id, int n)
    {
        int removed = 0;
        for (int i = Slots.Length - 1; i >= 0 && removed < n; i--)
        {
            ref var s = ref Slots[i];
            if (s.IsEmpty || s.Id != id) continue;
            int k = Math.Min(s.Count, n - removed);
            s.Count -= k; removed += k;
            if (s.Count <= 0) s = ItemStack.Empty;
        }
        if (removed > 0) Touch();
        return removed;
    }

    public int RemoveMatching(in Ingredient ing, int n)
    {
        int removed = 0;
        for (int i = Slots.Length - 1; i >= 0 && removed < n; i--)
        {
            ref var s = ref Slots[i];
            if (s.IsEmpty || s.Wear != 0 || !ing.Matches(s.Id)) continue;
            int k = Math.Min(s.Count, n - removed);
            s.Count -= k; removed += k;
            if (s.Count <= 0) s = ItemStack.Empty;
        }
        if (removed > 0) Touch();
        return removed;
    }

    /// <summary>Takes n from one slot and returns them.</summary>
    public ItemStack Take(int slot, int n)
    {
        ref var s = ref Slots[slot];
        if (s.IsEmpty || n <= 0) return ItemStack.Empty;
        n = Math.Min(n, s.Count);
        var taken = s.WithCount(n);
        s.Count -= n;
        if (s.Count <= 0) s = ItemStack.Empty;
        Touch();
        return taken;
    }

    public void CopyFrom(Inventory other)
    {
        Array.Copy(other.Slots, Slots, Math.Min(Slots.Length, other.Slots.Length));
        Touch();
    }
}

/// <summary>
/// Mouse interaction with slots, the way a cursor stack behaves: the left
/// button picks up, drops, merges or swaps whole stacks; the right button
/// splits in half or places one at a time.
/// </summary>
public static class SlotOps
{
    public static void LeftClick(ref ItemStack cursor, ref ItemStack slot)
    {
        if (cursor.IsEmpty && slot.IsEmpty) return;
        if (cursor.IsEmpty)
        {
            cursor = slot; slot = ItemStack.Empty; return;
        }
        if (slot.IsEmpty)
        {
            slot = cursor; cursor = ItemStack.Empty; return;
        }
        if (slot.CanStackWith(cursor))
        {
            int max = slot.Def.MaxStack;
            int n = Math.Min(max - slot.Count, cursor.Count);
            slot.Count += n; cursor.Count -= n;
            if (cursor.Count <= 0) cursor = ItemStack.Empty;
            return;
        }
        (cursor, slot) = (slot, cursor);
    }

    public static void RightClick(ref ItemStack cursor, ref ItemStack slot)
    {
        if (cursor.IsEmpty)
        {
            if (slot.IsEmpty) return;
            int half = (slot.Count + 1) / 2;
            cursor = slot.WithCount(half);
            slot.Count -= half;
            if (slot.Count <= 0) slot = ItemStack.Empty;
            return;
        }
        if (slot.IsEmpty)
        {
            slot = cursor.WithCount(1);
            cursor.Count -= 1;
            if (cursor.Count <= 0) cursor = ItemStack.Empty;
            return;
        }
        if (slot.CanStackWith(cursor) && slot.Count < slot.Def.MaxStack)
        {
            slot.Count += 1;
            cursor.Count -= 1;
            if (cursor.Count <= 0) cursor = ItemStack.Empty;
            return;
        }
        (cursor, slot) = (slot, cursor);
    }

    /// <summary>Moves a stack into another inventory (shift-click). Returns what stayed behind.</summary>
    public static ItemStack QuickMove(ItemStack stack, Inventory target, int from = 0, int to = -1) =>
        target.Add(stack, from, to);
}
