/**
 * Random tokens, OAuth `state`, and PKCE (RFC 7636) helpers.
 */
import { createHash, randomBytes } from 'node:crypto'

/** URL-safe random token with `bytes` bytes of entropy. */
export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url')
}

/**
 * PKCE code verifier: 43–128 characters from the unreserved set. 32 random
 * bytes in base64url is exactly 43 characters of [A-Za-z0-9-_].
 */
export function createCodeVerifier(): string {
  return randomBytes(48).toString('base64url') // 64 chars
}

/** S256 code challenge: BASE64URL(SHA256(ASCII(code_verifier))). */
export function codeChallengeS256(verifier: string): string {
  return createHash('sha256').update(verifier, 'ascii').digest('base64url')
}

/**
 * Hex-encoded S256 challenge. TikTok's Login Kit for desktop documents a
 * hex-encoded SHA-256 challenge rather than base64url; kept here so the
 * TikTok connector can follow whichever form its docs specify.
 */
export function codeChallengeS256Hex(verifier: string): string {
  return createHash('sha256').update(verifier, 'ascii').digest('hex')
}
