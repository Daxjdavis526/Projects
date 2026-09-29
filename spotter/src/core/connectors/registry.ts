/**
 * The one place that decides which implementation backs a platform.
 *
 *   live  → the real connector talking to the real API
 *   mock  → the same connector class with the demo transport injected
 *
 * Nothing else in the codebase branches on mock vs live.
 */
import type { Env } from '../config/env'
import type { ConnectorMode, Platform } from '../domain/types'
import { createDemoFetch, demoEndpoints, parseFaults } from '../demo/transport'
import type { DemoWorld } from '../demo/world'
import { defaultHttpDeps, type HttpDeps } from './http'
import { InstagramConnector } from './instagram/connector'
import { TikTokConnector } from './tiktok/connector'
import type { PlatformConnector } from './types'
import { YouTubeConnector } from './youtube/connector'

export interface ConnectorFactoryOptions {
  env: Env
  /** "Now" for the demo world (lets demo backfill run at simulated times). */
  clock: () => Date
  /** Required for mock mode. */
  world?: DemoWorld | null
  /** Override the HTTP layer (tests). */
  http?: HttpDeps
  /** Demo only: platform faults, defaults to MOCK_FAULTS. */
  faults?: string | null
}

const DEMO_PLACEHOLDER = 'demo'

export function createConnector(platform: Platform, mode: ConnectorMode, options: ConnectorFactoryOptions): PlatformConnector {
  if (mode === 'mock') {
    if (!options.world) throw new Error('Demo connectors need the demo world')
    const base = defaultHttpDeps()
    const http: HttpDeps = options.http ?? {
      fetch: createDemoFetch({ world: options.world, clock: options.clock, faults: parseFaults(options.faults ?? options.env.MOCK_FAULTS) }),
      // Retries still happen in the demo, just without real waiting.
      sleep: (ms) => base.sleep(Math.min(250, ms / 40)),
      random: base.random,
    }
    const endpoints = demoEndpoints(options.env.APP_URL)
    switch (platform) {
      case 'youtube':
        return new YouTubeConnector({
          mode,
          http,
          endpoints: endpoints.youtube,
          env: { GOOGLE_CLIENT_ID: DEMO_PLACEHOLDER, GOOGLE_CLIENT_SECRET: DEMO_PLACEHOLDER, YOUTUBE_API_KEY: undefined, GOOGLE_OAUTH_PKCE: true, YOUTUBE_DERIVED_METRICS_APPROVED: true },
        })
      case 'instagram':
        // The demo simulates the Facebook Login path, the only one with discovery.
        return new InstagramConnector({
          mode,
          http,
          endpoints: endpoints.instagram,
          env: {
            INSTAGRAM_AUTH_MODE: 'facebook_login',
            INSTAGRAM_APP_ID: DEMO_PLACEHOLDER,
            INSTAGRAM_APP_SECRET: DEMO_PLACEHOLDER,
            FACEBOOK_APP_ID: DEMO_PLACEHOLDER,
            FACEBOOK_APP_SECRET: DEMO_PLACEHOLDER,
            FACEBOOK_LOGIN_CONFIG_ID: undefined,
            META_GRAPH_API_VERSION: options.env.META_GRAPH_API_VERSION,
          },
        })
      case 'tiktok':
        return new TikTokConnector({
          mode,
          http,
          endpoints: endpoints.tiktok,
          env: { TIKTOK_CLIENT_KEY: DEMO_PLACEHOLDER, TIKTOK_CLIENT_SECRET: DEMO_PLACEHOLDER },
        })
    }
  }
  const http = options.http ?? defaultHttpDeps()
  switch (platform) {
    case 'youtube':
      return new YouTubeConnector({ mode, http, env: options.env })
    case 'instagram':
      return new InstagramConnector({ mode, http, env: options.env })
    case 'tiktok':
      return new TikTokConnector({ mode, http, env: options.env })
  }
}

/** Whether the server has the credentials a live connector needs to start OAuth. */
export function isConfigured(platform: Platform, env: Env): boolean {
  const connector = createConnector(platform, 'live', { env, clock: () => new Date() })
  return connector.auth.missingConfiguration().length === 0
}
