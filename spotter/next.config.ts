import type { NextConfig } from 'next'

// Security headers applied to every response. The Referrer-Policy matters for
// OAuth: an authorization code in a callback URL must never leak to a third
// party through the Referer header when the page loads remote thumbnails.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
    : []),
]

const nextConfig: NextConfig = {
  // Database drivers are loaded from node_modules at runtime rather than
  // bundled: PGlite ships a WASM binary and data bundle it locates relative to
  // its own files, and `pg` has optional native bindings.
  serverExternalPackages: ['@electric-sql/pglite', 'pg'],
  poweredByHeader: false,
  // Don't let `next dev` write AGENTS.md/CLAUDE.md into the project; the repo keeps one CLAUDE.md at its root.
  agentRules: false,
  devIndicators: false,
  // The dev server logs request URLs. OAuth callbacks carry one-time codes and
  // state in the query string, and the demo consent page carries state: keep
  // them out of the terminal, like everything else secret.
  logging: { incomingRequests: { ignore: [/\/api\/oauth\//, /\/demo\/consent\//, /\/api\/webhooks\//] } },
  typedRoutes: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
