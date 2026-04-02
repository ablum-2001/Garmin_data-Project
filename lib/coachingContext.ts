/**
 * Builds a compact, token-efficient coaching context string for the Claude prompt.
 * Combines onboarding UserProfile with parsed RunnerProfile metrics.
 */

import type { UserProfile, RunnerProfile, BestEffort } from './types'

// ── Formatters ─────────────────────────────────────────────────────────────

function fmtDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

function fmtEffort(e: BestEffort | null): string {
  if (!e) return 'no data'
  return `${fmtDuration(e.durationSeconds)} (${e.date})`
}

// ── Context builder ────────────────────────────────────────────────────────

export function buildCoachingContext(
  user: UserProfile,
  runner: RunnerProfile | null
): string {
  const lines: string[] = []

  // Athlete profile
  lines.push('=== ATHLETE PROFILE ===')
  const demographics = [
    `Name: ${user.name}`,
    `Age: ${user.age}`,
    user.gender ? `Gender: ${user.gender}` : null,
    user.weight ? `Weight: ${user.weight}kg` : null,
  ]
    .filter(Boolean)
    .join(' | ')
  lines.push(demographics)
  lines.push(`Goals: ${user.goals.join(', ')}`)
  lines.push(`Target: ${user.sessionsPerWeek} sessions/week, ${user.weeklyMileageTarget}km/week`)
  if (user.injuryHistory && user.injuryHistory.toLowerCase() !== 'none') {
    lines.push(`Injury history: ${user.injuryHistory}`)
  }

  if (!runner) {
    lines.push('\n(No Garmin data uploaded — coaching based on self-reported profile only.)')
    return lines.join('\n')
  }

  // Garmin data
  lines.push('\n=== GARMIN TRAINING DATA ===')
  lines.push(
    `${runner.totalActivities} runs from ${runner.firstActivity} to ${runner.lastActivity}`
  )

  lines.push('\nPersonal bests:')
  lines.push(`  5K: ${fmtEffort(runner.bestEfforts.fiveK)}`)
  lines.push(`  10K: ${fmtEffort(runner.bestEfforts.tenK)}`)
  lines.push(`  Half marathon: ${fmtEffort(runner.bestEfforts.halfMarathon)}`)
  lines.push(`  Marathon: ${fmtEffort(runner.bestEfforts.marathon)}`)

  lines.push('\nWeekly mileage (avg):')
  lines.push(
    `  Last 30d: ${runner.weeklyMileage.last30d}km | ` +
      `Last 90d: ${runner.weeklyMileage.last90d}km | ` +
      `Last 365d: ${runner.weeklyMileage.last365d}km`
  )

  lines.push('\nSessions per week (avg):')
  lines.push(
    `  Last 30d: ${runner.sessionsPerWeek.last30d} | ` +
      `Last 90d: ${runner.sessionsPerWeek.last90d} | ` +
      `Last 365d: ${runner.sessionsPerWeek.last365d}`
  )

  lines.push('\nLongest runs:')
  lines.push(
    `  All-time: ${runner.longestRun.allTime}km | ` +
      `Last 30d: ${runner.longestRun.last30d}km | ` +
      `Last 90d: ${runner.longestRun.last90d}km`
  )

  lines.push(
    `\nLong run history: ` +
      `${runner.longRunCounts.over18km} runs >18km | ` +
      `${runner.longRunCounts.over25km} runs >25km | ` +
      `${runner.longRunCounts.over30km} runs >30km`
  )

  const trendLabel =
    runner.trend === 'rising'
      ? 'RISING (volume increasing)'
      : runner.trend === 'falling'
      ? 'FALLING (volume decreasing)'
      : 'STABLE'
  lines.push(`\nTraining trend (last 30d vs prior 30d): ${trendLabel}`)

  if (runner.recentBreak) {
    lines.push('Note: Gap >14 days detected in recent activity history.')
  }

  return lines.join('\n')
}

// ── System prompt ──────────────────────────────────────────────────────────

export const COACH_SYSTEM_PROMPT = `You are a performance-oriented running coach with access to precise Garmin training data and athlete profile information.

Guidelines:
- Be concise and direct. 2–4 sentences for conversational questions.
- Reference specific metrics (pace, mileage, PBs) when relevant.
- when making recommendations about training regime or fitness level, look at recent data (last 8-12 weeks), a PB from a year ago doesn't guarantee you have the same fitness level today
- Never invent data not present in the profile.
- Give structured plans only when explicitly requested, using clear weekly structure.
- Don't repeat the athlete's data back to them unless it supports your point.
- Tone: credible, practical, performance-focused. Not generic wellness advice.
- You should base your answers primarily on the retrieved coaching knowledge below.
If the knowledge is insufficient, you may supplement, but always prioritize it.
`
