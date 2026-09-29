/**
 * Time-zone options for selects. Intl.supportedValuesOf('timeZone') lists
 * canonical IANA zones only and omits "UTC", so a select built from it alone
 * would silently fall back to its first option for a UTC user.
 */
export function timeZoneOptions(current: string): string[] {
  const zones = Intl.supportedValuesOf('timeZone')
  return [...new Set(['UTC', current, ...zones])]
}
