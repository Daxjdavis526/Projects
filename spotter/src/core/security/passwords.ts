/**
 * Password hashing with scrypt (node:crypto; no native add-on to build).
 * Stored form: scrypt$<N>$<r>$<p>$<salt b64url>$<hash b64url>
 */
import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'

const N = 2 ** 15
const R = 8
const P = 1
const KEY_LENGTH = 64
const MAX_MEM = 128 * N * R * 2

function scrypt(password: string, salt: Buffer, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(password, salt, KEY_LENGTH, { N: n, r, p, maxmem: Math.max(MAX_MEM, 128 * n * r * 2) }, (err, key) =>
      err ? reject(err) : resolve(key),
    )
  })
}

export const PASSWORD_MIN_LENGTH = 10

export function validatePasswordStrength(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`
  if (password.length > 256) return 'That password is too long.'
  if (/^(.)\1+$/.test(password)) return 'Use more than one repeated character.'
  return null
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await scrypt(password.normalize('NFKC'), salt, N, R, P)
  return ['scrypt', N, R, P, salt.toString('base64url'), hash.toString('base64url')].join('$')
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  const [, n, r, p, saltPart, hashPart] = parts as [string, string, string, string, string, string]
  const expected = Buffer.from(hashPart, 'base64url')
  const actual = await scrypt(password.normalize('NFKC'), Buffer.from(saltPart, 'base64url'), Number(n), Number(r), Number(p))
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
