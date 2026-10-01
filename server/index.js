import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { DatabaseSync } from 'node:sqlite'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = resolve(projectRoot, '.env')
if (existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envPath)
}

const requestTypes = new Map([
  ['membership', 'Membership request'],
  ['project', 'Project contribution'],
  ['partnership', 'Partnership or resources'],
  ['general', 'General contact'],
])

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function cleanText(value, maxLength, singleLine = false) {
  if (typeof value !== 'string') return ''
  let clean = ''
  for (const character of value) {
    const code = character.codePointAt(0)
    if (code >= 32 && code !== 127 || code === 9 || code === 10 || code === 13) {
      clean += character
    }
  }
  clean = clean.replace(/\r\n?/g, '\n').trim()
  return (singleLine ? clean.replace(/\s+/g, ' ') : clean).slice(0, maxLength)
}

async function sendResendNotification(inquiry) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  const to = process.env.CONTACT_TO_EMAIL || 'tentoone00@gmail.com'
  if (!apiKey || !from) throw new Error('Email delivery is not configured.')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: inquiry.email,
      subject: `[Ten to One] ${requestTypes.get(inquiry.type)} from ${inquiry.name}`,
      text: [
        `${requestTypes.get(inquiry.type)}`,
        `Name: ${inquiry.name}`,
        `Email: ${inquiry.email}`,
        `Phone: ${inquiry.phone || 'Not provided'}`,
        `Area of interest: ${inquiry.interest || 'Not provided'}`,
        '',
        'Message:',
        inquiry.message,
      ].join('\n'),
    }),
  })

  if (!response.ok) throw new Error(`Email provider returned ${response.status}.`)
}

export function createApp({
  databasePath = process.env.DATABASE_PATH || resolve(projectRoot, 'data/inquiries.sqlite'),
  sendNotification = sendResendNotification,
  rateLimit = 5,
  rateWindowMs = 15 * 60 * 1000,
  allowedOrigin = process.env.ALLOWED_ORIGIN || '',
  trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0),
} = {}) {
  if (databasePath !== ':memory:') {
    mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 })
  }

  const database = new DatabaseSync(databasePath)
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      request_type TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      interest TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL,
      consented_at TEXT NOT NULL,
      submitted_at TEXT NOT NULL,
      email_status TEXT NOT NULL,
      email_error TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS inquiries_submitted_at_idx ON inquiries(submitted_at);
  `)

  const insertInquiry = database.prepare(`
    INSERT INTO inquiries (
      id, request_type, name, email, phone, interest, message,
      consented_at, submitted_at, email_status, email_error
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  const updateDelivery = database.prepare(
    'UPDATE inquiries SET email_status = ?, email_error = ? WHERE id = ?',
  )
  const app = express()
  const rateBuckets = new Map()

  app.disable('x-powered-by')
  if (trustProxyHops > 0) app.set('trust proxy', trustProxyHops)
  app.use(express.json({ limit: '12kb' }))

  app.get('/api/health', (_request, response) => {
    response.json({
      status: 'ok',
      emailConfigured: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
    })
  })

  app.post('/api/inquiries', async (request, response) => {
    const body = request.body
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return response.status(400).json({ message: 'Please check the form and try again.' })
    }

    if (cleanText(body.website, 200)) {
      return response.status(202).json({ message: 'Thank you. Your request has been received.' })
    }

    if (allowedOrigin && request.get('origin') && request.get('origin') !== allowedOrigin) {
      return response.status(403).json({ message: 'This request could not be accepted.' })
    }

    const now = Date.now()
    const ip = request.ip || request.socket.remoteAddress || 'unknown'
    const bucket = rateBuckets.get(ip)
    if (!bucket || now >= bucket.resetAt) {
      rateBuckets.set(ip, { count: 1, resetAt: now + rateWindowMs })
    } else if (bucket.count >= rateLimit) {
      response.set('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))))
      return response.status(429).json({ message: 'Please wait a little before trying again.' })
    } else {
      bucket.count += 1
    }

    const inquiry = {
      type: cleanText(body.type, 30, true),
      name: cleanText(body.name, 100, true),
      email: cleanText(body.email, 254, true).toLowerCase(),
      phone: cleanText(body.phone, 40, true),
      interest: cleanText(body.interest, 120, true),
      message: cleanText(body.message, 3000),
    }

    if (!requestTypes.has(inquiry.type)) {
      return response.status(400).json({ message: 'Please choose how you would like to get involved.' })
    }
    if (!inquiry.name || !inquiry.email || !emailPattern.test(inquiry.email) || !inquiry.message) {
      return response.status(400).json({ message: 'Please provide your name, a valid email, and a message.' })
    }
    if (body.consent !== true) {
      return response.status(400).json({ message: 'Please agree that Ten to One may use your details to respond.' })
    }

    const id = randomUUID()
    const submittedAt = new Date().toISOString()
    insertInquiry.run(
      id,
      inquiry.type,
      inquiry.name,
      inquiry.email,
      inquiry.phone,
      inquiry.interest,
      inquiry.message,
      submittedAt,
      submittedAt,
      'pending',
      '',
    )

    try {
      await sendNotification(inquiry)
      updateDelivery.run('sent', '', id)
      return response.status(201).json({
        message: 'Thank you. Your request has been sent to Ten to One. The team will be in touch.',
      })
    } catch (error) {
      const deliveryError = error instanceof Error ? error.message : 'Unknown email delivery error.'
      updateDelivery.run('failed', deliveryError.slice(0, 250), id)
      console.error(`Inquiry ${id} was saved, but notification delivery failed.`)
      return response.status(503).json({
        message: 'Your request could not be emailed right now. Please use the contact email or phone listed on this page.',
      })
    }
  })

  app.use((error, _request, response, _next) => {
    if (error?.type === 'entity.too.large') {
      return response.status(413).json({ message: 'That message is too long. Please shorten it and try again.' })
    }
    if (error instanceof SyntaxError && 'body' in error) {
      return response.status(400).json({ message: 'Please check the form and try again.' })
    }
    console.error('API request failed.')
    return response.status(500).json({ message: 'Something went wrong. Please try again later.' })
  })

  if (process.env.NODE_ENV === 'production') {
    const distPath = resolve(projectRoot, 'dist')
    app.use(express.static(distPath, { index: false }))
    app.use((request, response, next) => {
      if (request.method === 'GET' && !request.path.startsWith('/api/')) {
        return response.sendFile(resolve(distPath, 'index.html'))
      }
      return next()
    })
  }

  return { app, close: () => database.close() }
}

const entryPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (entryPath === fileURLToPath(import.meta.url)) {
  const { app } = createApp()
  const port = Number(process.env.PORT || 3001)
  app.listen(port, '0.0.0.0', () => {
    console.log(`Ten to One API listening on port ${port}.`)
  })
}