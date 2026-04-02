/**
 * POST /api/chat
 *
 * Sends a user message to Claude with full coaching context.
 * API key is read server-side only — never exposed to the client.
 *
 * Body: {
 *   message: string
 *   history: Array<{ role: 'user' | 'assistant'; content: string }>
 *   userProfile: UserProfile
 *   runnerProfile: RunnerProfile | null
 * }
 * Response: { response: string } | { error: string }
 */

import { retrieveChunks } from '@/lib/rag/retrieve'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { UserProfile, RunnerProfile } from '@/lib/types'
import { buildCoachingContext, COACH_SYSTEM_PROMPT } from '@/lib/coachingContext'

// Swap model here to upgrade later
const MODEL = 'claude-haiku-4-5-20251001'
const MAX_TOKENS = 350
// Keep last N message pairs to limit token usage
const HISTORY_LIMIT = 6

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured. Add it to .env.local.' },
      { status: 500 }
    )
  }

  let body: {
    message: string
    history: Array<{ role: 'user' | 'assistant'; content: string }>
    userProfile: UserProfile
    runnerProfile: RunnerProfile | null
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { message, history, userProfile, runnerProfile } = body
  const chunks = await retrieveChunks(message)
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const context = buildCoachingContext(userProfile, runnerProfile)
  const ragContext = chunks
  .map((chunk, i) => {
    const source = chunk.metadata?.source || 'unknown'
    return `Source ${i + 1} (${source}):\n${chunk.content}`
  })
  .join('\n\n')
  
  const systemPrompt = `${COACH_SYSTEM_PROMPT}

Relevant coaching knowledge:
${ragContext}

${context}`

  // Trim history and append current message
  const trimmedHistory = history.slice(-HISTORY_LIMIT)
  const messages: Anthropic.MessageParam[] = [
    ...trimmedHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: message },
  ]

  try {
    const client = new Anthropic({ apiKey })
    const result = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages,
    })

    const response =
      result.content[0]?.type === 'text' ? result.content[0].text : ''

    return NextResponse.json({ response })
  } catch (err) {
    console.error('[/api/chat] Claude error:', err)
    const message =
      err instanceof Anthropic.APIError
        ? `Claude API error ${err.status}: ${err.message}`
        : 'Coaching response failed. Please try again.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
