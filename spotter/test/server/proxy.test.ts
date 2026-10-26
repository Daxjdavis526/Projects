/**
 * The loopback hand-off: a local install answers on one address, and a page
 * opened on another loopback name is sent there by an HTML refresh (not a
 * redirect, which Next.js would make relative and loop).
 */
import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it } from 'vitest'
import { proxy } from '@/proxy'

const request = (url: string, host: string, method = 'GET') => new NextRequest(url, { method, headers: { host } })
const savedAppUrl = process.env.APP_URL

afterEach(() => {
  process.env.APP_URL = savedAppUrl
})

describe('proxy', () => {
  it('sends localhost to the canonical 127.0.0.1 address, keeping the path and query', async () => {
    process.env.APP_URL = 'http://127.0.0.1:3000'
    const res = proxy(request('http://localhost:3000/trends?stage=emerging&x="<y>"', 'localhost:3000'))
    expect(res.status).toBe(200)
    expect(res.headers.get('location')).toBeNull()
    const html = await res.text()
    expect(html).toContain('content="0;url=http://127.0.0.1:3000/trends?stage=emerging&amp;x=%22%3Cy%3E%22"')
    expect(html).not.toMatch(/<y>/)
  })

  it('leaves the canonical address alone', () => {
    process.env.APP_URL = 'http://127.0.0.1:3000'
    expect(proxy(request('http://127.0.0.1:3000/', '127.0.0.1:3000')).headers.get('x-middleware-next')).toBe('1')
  })

  it('leaves a real deployment and non-loopback hosts alone', () => {
    process.env.APP_URL = 'https://spotter.example.com'
    expect(proxy(request('http://localhost:3000/', 'localhost:3000')).headers.get('x-middleware-next')).toBe('1')
    process.env.APP_URL = 'http://127.0.0.1:3000'
    expect(proxy(request('http://192.168.1.5:3000/', '192.168.1.5:3000')).headers.get('x-middleware-next')).toBe('1')
  })

  it('never answers a form post with a page', () => {
    process.env.APP_URL = 'http://127.0.0.1:3000'
    expect(proxy(request('http://localhost:3000/login', 'localhost:3000', 'POST')).headers.get('x-middleware-next')).toBe('1')
  })
})
