'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** While a collection run is active, re-render the page every few seconds so results appear as they land. */
export function LiveRefresher({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router = useRouter()
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh()
    }, intervalMs)
    return () => clearInterval(t)
  }, [router, intervalMs])
  return null
}
