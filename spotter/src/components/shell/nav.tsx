'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, BarChart3, Cable, Flame, History, Inbox, LayoutDashboard, Settings2 } from 'lucide-react'
import { cn } from '@/lib/cn'

const ITEMS = [
  { href: '/', label: 'Today', icon: LayoutDashboard },
  { href: '/trends', label: 'Trends', icon: Flame },
  { href: '/performance', label: 'Your performance', icon: BarChart3 },
  { href: '/history', label: 'History', icon: History },
  { href: '/connections', label: 'Connections', icon: Cable },
  { href: '/collection', label: 'Collection status', icon: Activity },
  { href: '/settings', label: 'Settings', icon: Settings2 },
] as const

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

export function SideNav({ showCapture }: { showCapture: boolean }) {
  const pathname = usePathname()
  const items = showCapture ? [...ITEMS.slice(0, 4), { href: '/capture', label: 'Captured posts', icon: Inbox }, ...ITEMS.slice(4)] : ITEMS
  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5">
      {items.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium transition-colors',
              active ? 'bg-surface text-ink shadow-card ring-1 ring-line' : 'text-ink-2 hover:bg-surface-2 hover:text-ink',
            )}
          >
            <Icon aria-hidden className={cn('size-4', active ? 'text-accent' : 'text-muted')} strokeWidth={2.1} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

export function TopNav({ showCapture }: { showCapture: boolean }) {
  const pathname = usePathname()
  const items = showCapture ? [...ITEMS.slice(0, 4), { href: '/capture', label: 'Captured', icon: Inbox }, ...ITEMS.slice(4)] : ITEMS
  return (
    <nav aria-label="Main" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      {items.map(({ href, label }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium',
              active ? 'bg-ink text-plane' : 'text-ink-2 hover:bg-surface-2',
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
