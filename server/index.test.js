import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { DatabaseSync } from 'node:sqlite'
import { createApp } from './index.js'

const validInquiry = {
  type: 'project',
  name: 'Test Visitor',
  email: 'visitor@example.org',
  phone: '+256700000000',
  interest: 'Community outreach',
  message: 'I would like to help with a project.',
  consent: true,
}

async function withServer(options, callback) {
  const directory = mkdtempSync(join(tmpdir(), 'ten-to-one-api-'))
  const databasePath = join(directory, 'inquiries.sqlite')
  const instance = createApp({ databasePath, ...options })
  const server = instance.app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  const baseUrl = `http://127.0.0.1:${server.address().port}`

  try {
    await callback({ baseUrl, databasePath })
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    instance.close()
    rmSync(directory, { recursive: true, force: true })
  }
}

test('valid inquiry is emailed and stored with delivery status', async () => {
  const sent = []
  await withServer({ sendNotification: async (inquiry) => sent.push(inquiry) }, async ({ baseUrl, databasePath }) => {
    const response = await fetch(`${baseUrl}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validInquiry),
    })

    assert.equal(response.status, 201)
    assert.equal(sent.length, 1)
    assert.equal(sent[0].type, 'project')

    const database = new DatabaseSync(databasePath)
    const stored = database.prepare('SELECT request_type, email_status FROM inquiries').get()
    database.close()
    assert.deepEqual({ ...stored }, { request_type: 'project', email_status: 'sent' })
  })
})

test('invalid submissions are rejected without email', async () => {
  let sent = false
  await withServer({ sendNotification: async () => { sent = true } }, async ({ baseUrl }) => {
    const response = await fetch(`${baseUrl}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validInquiry, email: 'not-an-email' }),
    })

    assert.equal(response.status, 400)
    assert.equal(sent, false)
  })
})

test('honeypot submissions are silently accepted and not stored', async () => {
  let sent = false
  await withServer({ sendNotification: async () => { sent = true } }, async ({ baseUrl, databasePath }) => {
    const response = await fetch(`${baseUrl}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validInquiry, website: 'bot-filled-this' }),
    })

    assert.equal(response.status, 202)
    assert.equal(sent, false)
    const database = new DatabaseSync(databasePath)
    const count = database.prepare('SELECT COUNT(*) AS count FROM inquiries').get().count
    database.close()
    assert.equal(count, 0)
  })
})

test('repeated submissions from one IP are rate limited', async () => {
  let sent = 0
  await withServer({ rateLimit: 1, sendNotification: async () => { sent += 1 } }, async ({ baseUrl }) => {
    const submit = () => fetch(`${baseUrl}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validInquiry),
    })
    const first = await submit()
    const second = await submit()

    assert.equal(first.status, 201)
    assert.equal(second.status, 429)
    assert.ok(Number(second.headers.get('retry-after')) > 0)
    assert.equal(sent, 1)
  })
})

test('notification failures are recorded and reported honestly', async () => {
  await withServer({ sendNotification: async () => { throw new Error('provider unavailable') } }, async ({ baseUrl, databasePath }) => {
    const response = await fetch(`${baseUrl}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validInquiry),
    })

    assert.equal(response.status, 503)
    const database = new DatabaseSync(databasePath)
    const status = database.prepare('SELECT email_status FROM inquiries').get().email_status
    database.close()
    assert.equal(status, 'failed')
  })
})