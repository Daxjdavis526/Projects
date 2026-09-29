'use client'

import { useSyncExternalStore } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/cn'

type Theme = 'system' | 'light' | 'dark'

const listeners = new Set<() => void>()

function readSaved(): Theme {
  try {
    const saved = localStorage.getItem('spotter-theme')
    return saved === 'light' || saved === 'dark' ? saved : 'system'
  } catch {
    return 'system'
  }
}

function apply(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)
  try {
    if (theme === 'system') localStorage.removeItem('spotter-theme')
    else localStorage.setItem('spotter-theme', theme)
  } catch {
    // Storage unavailable (private mode): the choice lasts for this page only.
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, readSaved, () => 'system' as Theme)
  const options: Array<{ value: Theme; icon: typeof Sun; label: string }> = [
    { value: 'light', icon: Sun, label: 'Light theme' },
    { value: 'system', icon: Monitor, label: 'Match system theme' },
    { value: 'dark', icon: Moon, label: 'Dark theme' },
  ]
  return (
    <div role="radiogroup" aria-label="Theme" className={cn('inline-flex rounded-xl border border-line bg-surface-2 p-0.5', className)}>
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          onClick={() => apply(value)}
          className={cn('grid size-7 place-items-center rounded-[9px] text-muted transition-colors', theme === value ? 'bg-surface text-ink shadow-card' : 'hover:text-ink')}
        >
          <Icon aria-hidden className="size-3.5" />
        </button>
      ))}
    </div>
  )
}
