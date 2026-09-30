/**
 * Encryption at rest for OAuth tokens and PKCE verifiers.
 *
 * AES-256-GCM with a random 96-bit IV per value. The stored form is
 *   v1.<keyId>.<iv>.<authTag>.<ciphertext>      (base64url parts)
 * where keyId is derived from the key itself, so a rotated key is detected
 * instead of producing garbage. Two keys are accepted for decryption (the
 * current and the previous one) to allow rotation without downtime.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { getEnv, isProduction } from '../config/env'
import { getLogger } from '../observability/logger'

const VERSION = 'v1'
const IV_BYTES = 12

export interface EncryptionKey {
  id: string
  key: Buffer
}

export class EncryptionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EncryptionError'
  }
}

export function parseKey(material: string): EncryptionKey {
  const trimmed = material.trim()
  let key: Buffer
  if (/^[0-9a-f]{64}$/i.test(trimmed)) key = Buffer.from(trimmed, 'hex')
  else key = Buffer.from(trimmed, 'base64')
  if (key.length !== 32) {
    throw new EncryptionError('TOKEN_ENCRYPTION_KEY must be 32 bytes, encoded as base64 (44 chars) or hex (64 chars)')
  }
  const id = createHash('sha256').update(key).digest('hex').slice(0, 8)
  return { id, key }
}

export function generateKeyMaterial(): string {
  return randomBytes(32).toString('base64')
}

export function encryptWith(plaintext: string, key: EncryptionKey): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv('aes-256-gcm', key.key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [VERSION, key.id, iv.toString('base64url'), tag.toString('base64url'), ciphertext.toString('base64url')].join('.')
}

export function decryptWith(payload: string, keys: EncryptionKey[]): string {
  const parts = payload.split('.')
  if (parts.length !== 5 || parts[0] !== VERSION) throw new EncryptionError('Unrecognised encrypted value format')
  const [, keyId, ivPart, tagPart, dataPart] = parts as [string, string, string, string, string]
  const key = keys.find((k) => k.id === keyId)
  if (!key) {
    throw new EncryptionError(
      `No key available for encrypted value (key id ${keyId}). Was TOKEN_ENCRYPTION_KEY changed? ` +
        'Set the old key as TOKEN_ENCRYPTION_KEY_PREVIOUS, or reconnect the affected platforms.',
    )
  }
  try {
    const decipher = createDecipheriv('aes-256-gcm', key.key, Buffer.from(ivPart, 'base64url'))
    decipher.setAuthTag(Buffer.from(tagPart, 'base64url'))
    return Buffer.concat([decipher.update(Buffer.from(dataPart, 'base64url')), decipher.final()]).toString('utf8')
  } catch {
    throw new EncryptionError('Encrypted value failed authentication (tampered or wrong key)')
  }
}

export function keyIdOf(payload: string): string | null {
  const parts = payload.split('.')
  return parts.length === 5 ? (parts[1] ?? null) : null
}

// ---------------------------------------------------------------------------
// Process-wide key management
// ---------------------------------------------------------------------------

let keyring: { current: EncryptionKey; all: EncryptionKey[] } | null = null

function devSecretsPath(): string {
  return path.resolve(process.cwd(), '.data', 'dev-secrets.json')
}

/**
 * Development convenience: without TOKEN_ENCRYPTION_KEY, generate one and
 * keep it in .data/dev-secrets.json (git-ignored, mode 0600) so tokens stay
 * readable across restarts. Production refuses to start without a real key.
 */
function loadOrCreateDevKey(): string {
  const file = devSecretsPath()
  if (existsSync(file)) {
    const stored = JSON.parse(readFileSync(file, 'utf8')) as { tokenEncryptionKey?: string }
    if (stored.tokenEncryptionKey) return stored.tokenEncryptionKey
  }
  const material = generateKeyMaterial()
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify({ tokenEncryptionKey: material }, null, 2), { mode: 0o600 })
  getLogger('crypto').warn(
    'TOKEN_ENCRYPTION_KEY is not set; generated a development key in .data/dev-secrets.json. Set a real key before production use.',
  )
  return material
}

export function getKeyring(): { current: EncryptionKey; all: EncryptionKey[] } {
  if (keyring) return keyring
  const env = getEnv()
  let material = env.TOKEN_ENCRYPTION_KEY
  if (!material) {
    if (isProduction(env)) {
      throw new EncryptionError('TOKEN_ENCRYPTION_KEY is required in production (32 random bytes, base64).')
    }
    material = loadOrCreateDevKey()
  }
  const current = parseKey(material)
  const all = [current]
  if (env.TOKEN_ENCRYPTION_KEY_PREVIOUS) all.push(parseKey(env.TOKEN_ENCRYPTION_KEY_PREVIOUS))
  keyring = { current, all }
  return keyring
}

export function encryptSecret(plaintext: string): string {
  return encryptWith(plaintext, getKeyring().current)
}

export function decryptSecret(payload: string): string {
  return decryptWith(payload, getKeyring().all)
}

export function currentKeyId(): string {
  return getKeyring().current.id
}

/** For tests only: a current key and, optionally, a previous one (a rotation). */
export function setKeyringForTests(material: string | null, previous?: string): void {
  keyring = material ? { current: parseKey(material), all: [parseKey(material), ...(previous ? [parseKey(previous)] : [])] } : null
}

// ---------------------------------------------------------------------------
// Hashing helpers
// ---------------------------------------------------------------------------

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && timingSafeEqual(ab, bb)
}
