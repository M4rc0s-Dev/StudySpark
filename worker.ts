// Cloudflare Worker entry point.
// This runs INSTEAD of the old functions/api/generate.ts (that folder only
// works on Cloudflare Pages, but your project is deployed as a Worker).
//
// What this file does:
//   1. POST /api/generate  -> forwards the notes to n8n, returns flashcards JSON.
//   2. Everything else      -> serves the built React app (the ./dist assets),
//                              with SPA fallback handled by the assets binding.

interface Env {
  N8N_WEBHOOK_URL: string
  CONTACT_TO: string
  RESEND_API_KEY: string
  ASSETS: Fetcher
}

// Minimal RFC4180-ish CSV parser (kept in case n8n ever returns CSV).
// Handles quoted fields that contain commas.
function parseCsv(text: string): { question: string; answer: string; concept?: string }[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else {
      if (c === '"') {
        inQuotes = true
      } else if (c === ',') {
        row.push(field)
        field = ''
      } else if (c === '\n') {
        row.push(field)
        rows.push(row)
        row = []
        field = ''
      } else {
        field += c
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows
    .slice(1)
    .filter((r) => r.length >= 2 && (r[0].trim() || r[1].trim()))
    .map((r) => ({ question: r[0].trim(), answer: r[1].trim() }))
}

// Convert an ArrayBuffer (the raw uploaded file) into a base64 string.
// Done in chunks to avoid blowing the call-stack on large files.
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)))
  }
  return btoa(binary)
}

// The AI model sometimes ignores the requested card count and returns more
// cards than asked. Trim the result so the user gets exactly what they asked
// for (when a concrete number was requested, not "auto").
function trimFlashcards(
  flashcards: { question: string; answer: string }[],
  requestedCount: number | 'auto'
): { question: string; answer: string }[] {
  if (requestedCount === 'auto' || !Number.isFinite(requestedCount as number)) {
    return flashcards
  }
  const n = Math.max(1, Math.min(25, Math.floor(requestedCount as number)))
  return flashcards.slice(0, n)
}

// Generate an unguessable job id. This id is used as a capability token: the
// frontend polls the Supabase `jobs` table by this id, and n8n writes the
// result there when generation finishes.
function makeJobId(): string {
  return 'job_' + crypto.randomUUID().replace(/-/g, '')
}

async function handleGenerate(request: Request, env: Env): Promise<Response> {
  if (!env.N8N_WEBHOOK_URL) {
    return new Response(JSON.stringify({ error: 'N8N_WEBHOOK_URL is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const contentType = request.headers.get('content-type') || ''
  const jobId = makeJobId()

  // --- Case A: a file was uploaded (multipart/form-data) ---
  // We decode the file into base64 and forward it to n8n as a clean JSON body.
  // This avoids n8n's fragile multipart/binary handling: the filename, the
  // requested card count AND the file bytes all arrive reliably in JSON.
  if (contentType.includes('multipart/form-data')) {
    let form: FormData
    try {
      form = await request.formData()
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid form data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const file = form.get('file')
    const fileName = (form.get('fileName') || '').toString()
    const rawCount = Number(form.get('cardCount'))
    const autoCount = form.get('cardCount') === 'auto' || rawCount === -1
    const clampedCount: number | 'auto' = autoCount ? 'auto' : Math.max(1, Math.min(25, Math.floor(rawCount || 10)))

    const resolvedName =
      fileName || (file instanceof File ? file.name : '') || 'studyspark'

    let fileBase64: string | null = null
    let fileType = ''
    if (file instanceof File) {
      const buf = await file.arrayBuffer()
      fileBase64 = arrayBufferToBase64(buf)
      fileType = file.type || ''
    }

    const upstreamBody = JSON.stringify({
      jobId,
      fileName: resolvedName,
      deckName: resolvedName,
      cardCount: clampedCount,
      fileBase64,
      fileType,
    })

    // Fire-and-forget: kick off the n8n workflow but do NOT wait for the AI to
    // finish (it can take minutes, well past the proxy's ~100s limit). The
    // workflow writes the result to Supabase keyed by jobId; the frontend polls.
    return startJob(env, upstreamBody, jobId)
  }

  // --- Case B: plain text notes (JSON) ---
  let body: { studyNotes?: string; text?: string; fileName?: string; cardCount?: number }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const studyNotes = (body.studyNotes || body.text || '').toString()
  const fileName = (body.fileName || '').toString()

  // Number of flashcards to generate. A value of -1 (or "auto") means "let the
  // AI decide" — we forward it as-is so the n8n workflow picks a sensible number.
  // Otherwise we clamp to a safe max (25) so the prompt can never be asked for an
  // unbounded amount.
  const rawCount = Number(body.cardCount)
  const autoCount = body.cardCount === 'auto' || rawCount === -1
  const clampedCount: number | 'auto' = autoCount
    ? 'auto'
    : Math.max(1, Math.min(25, Number.isFinite(rawCount) ? Math.floor(rawCount) : 10))

  if (!studyNotes.trim()) {
    return new Response(JSON.stringify({ error: 'studyNotes is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const upstreamBody = JSON.stringify({
    jobId,
    studyNotes,
    fileName,
    deckName: fileName,
    cardCount: clampedCount,
    fileBase64: null,
    fileType: '',
  })

  return startJob(env, upstreamBody, jobId)
}

// Trigger the n8n workflow and immediately return a 202 with the job id.
// n8n is configured to acknowledge the webhook right away and keep processing
// in the background, so this fetch resolves quickly. We still don't block on
// the AI result: the frontend polls Supabase using the returned jobId.
async function startJob(env: Env, upstreamBody: string, jobId: string): Promise<Response> {
  try {
    const upstream = await fetch(env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: upstreamBody,
    })
    if (!upstream.ok && upstream.status !== 200) {
      return new Response(
        JSON.stringify({ error: `n8n returned status ${upstream.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      )
    }
    return new Response(JSON.stringify({ jobId, status: 'processing' }), {
      status: 202,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function handleContact(request: Request, env: Env): Promise<Response> {
  let body: { name?: string; email?: string; subject?: string; message?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const name = (body.name || '').toString().trim()
  const email = (body.email || '').toString().trim()
  const subject = (body.subject || '').toString().trim()
  const message = (body.message || '').toString().trim()

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: 'name, email and message are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const to = env.CONTACT_TO || 'valera08marcos.trabajo@gmail.com'
  const apiKey = env.RESEND_API_KEY

  // If no Resend key is configured we still acknowledge success so the UI flow
  // works, but the email is not actually sent (deployer must set RESEND_API_KEY).
  if (!apiKey) {
    console.log('[contact] RESEND_API_KEY not set. Would have sent:', { name, email, subject })
    return new Response(JSON.stringify({ ok: true, simulated: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'StudySpark <onboarding@resend.dev>',
        to: [to],
        reply_to: email,
        subject: `[StudySpark] ${subject || 'Nuevo mensaje de contacto'}`,
        text: `Nombre: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      return new Response(JSON.stringify({ error: 'Email send failed', detail: err }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/generate' && request.method === 'POST') {
      return handleGenerate(request, env)
    }

    if (url.pathname === '/api/contact' && request.method === 'POST') {
      return handleContact(request, env)
    }

    // Serve the React app (static assets + SPA fallback).
    return env.ASSETS.fetch(request)
  },
}
