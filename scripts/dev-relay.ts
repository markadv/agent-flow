#!/usr/bin/env node
/**
 * Dev relay server — wraps the shared relay with a standalone HTTP server
 * that includes CORS headers for cross-origin dev mode (Next.js on :3000).
 */
import * as http from 'http'
import { execFileSync } from 'child_process'
import { createRelay } from './relay'
import { DEFAULT_RELAY_PORT, DEV_WEB_ORIGIN_PATTERN } from '../extension/src/constants'

async function main() {
  const workspace = process.argv[2] || process.env.AGENT_FLOW_WORKSPACE || process.cwd()

  console.log('Starting Agent Flow dev relay...\n')
  console.log(`Workspace: ${workspace}`)

  const relay = await createRelay({ workspace, verbose: true })

  const server = http.createServer((req, res) => {
    // Echo back the request Origin if it matches a localhost pattern, so
    // CORS survives Next.js picking a fallback port when 3000 is busy.
    const origin = req.headers.origin
    if (typeof origin === 'string' && DEV_WEB_ORIGIN_PATTERN.test(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
      res.setHeader('Vary', 'Origin')
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    if (req.url === '/events') {
      return relay.handleSSE(req, res)
    }

    if (req.method === 'POST' && req.url === '/brainstorm') {
      let body = ''
      req.on('data', (chunk: Buffer) => { body += chunk.toString() })
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body) as { html?: unknown }
          if (typeof parsed.html !== 'string') {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'html must be a string' }))
            return
          }
          relay.setBrainstormContent(parsed.html)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ ok: true }))
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'invalid JSON' }))
        }
      })
      return
    }

    if (req.method === 'GET' && req.url === '/skills') {
      const skills = relay.getSkills()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ skills }))
      return
    }

    if (req.method === 'POST' && req.url === '/chat') {
      let body = ''
      req.on('data', (chunk: Buffer) => { body += chunk.toString() })
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body) as { message?: unknown }
          if (typeof parsed.message !== 'string' || !parsed.message.trim()) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'message must be a non-empty string' }))
            return
          }
          // Read at request time so the session can change without restarting the relay
          const session = process.env.AGENT_FLOW_TMUX_SESSION ?? 'levi'
          try {
            execFileSync('tmux', ['send-keys', '-t', session, parsed.message, 'Enter'], { stdio: 'ignore', timeout: 5000 })
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ ok: true }))
          } catch {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: `tmux session '${session}' not found or send-keys failed` }))
          }
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'invalid JSON' }))
        }
      })
      return
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Agent Flow Dev Relay')
  })

  server.listen(DEFAULT_RELAY_PORT, '127.0.0.1', () => {
    console.log(`\nSSE relay on http://127.0.0.1:${DEFAULT_RELAY_PORT}/events`)
    console.log('Ready! Events will appear in the web app.')
  })

  function cleanup() {
    server.close()
    relay.dispose()
    process.exit(0)
  }
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
}

main().catch(e => {
  console.error('Failed to start dev relay:', e)
  process.exit(1)
})
