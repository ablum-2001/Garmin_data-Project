/**
 * Deterministic Garmin CSV parser.
 *
 * Handles the standard Garmin Connect "Activities" export format.
 * Filters to running activities only and normalises distances to km.
 */

import type { RunnerActivity } from './types'

// ── CSV parsing ────────────────────────────────────────────────────────────

function parseCSVRow(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

// ── Time parsing ───────────────────────────────────────────────────────────

/** Parse "H:MM:SS" or "MM:SS" → total seconds. Returns null on failure. */
function parseDuration(raw: string): number | null {
  const clean = raw.replace(/[^0-9:]/g, '').trim()
  if (!clean) return null
  const parts = clean.split(':').map(Number)
  if (parts.some(isNaN)) return null
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return null
}

/** Parse "M:SS" pace string → seconds per km. Returns null on failure. */
function parsePace(raw: string): number | null {
  const clean = raw.replace(/[^0-9:]/g, '').trim()
  if (!clean) return null
  const parts = clean.split(':').map(Number)
  if (parts.length === 2 && !parts.some(isNaN)) return parts[0] * 60 + parts[1]
  return null
}

// ── Date parsing ───────────────────────────────────────────────────────────

/** Parse Garmin date strings: "YYYY-MM-DD HH:MM:SS" or "YYYY/MM/DD HH:MM:SS" */
function parseDate(raw: string): Date | null {
  if (!raw) return null
  const normalised = raw.replace(/\//g, '-')
  const d = new Date(normalised)
  return isNaN(d.getTime()) ? null : d
}

// ── Running activity type detection ───────────────────────────────────────

const RUNNING_TYPES = new Set([
  'running', 'trail running', 'treadmill running', 'track running',
  'virtual run', 'indoor running', 'road running',
])

function isRunning(activityType: string): boolean {
  return RUNNING_TYPES.has(activityType.toLowerCase().trim())
}

// ── Distance normalisation ─────────────────────────────────────────────────

/** Detect if distances are in miles based on the header string. */
function isMilesHeader(header: string): boolean {
  return /\bmi\b|\bmile/i.test(header)
}

// ── Main export ────────────────────────────────────────────────────────────

/**
 * Parse a Garmin Connect activities CSV string into structured RunnerActivity records.
 * Returns an empty array (not an error) if the CSV is malformed or contains no running data.
 */
export function parseGarminCSV(csv: string): RunnerActivity[] {
  const lines = csv.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  const headers = parseCSVRow(lines[0]).map((h) => h.toLowerCase())

  // Column index helpers
  const idx = (names: string[]): number => {
    for (const name of names) {
      const i = headers.findIndex((h) => h.includes(name))
      if (i !== -1) return i
    }
    return -1
  }

  const iActivity  = idx(['activity type'])
  const iDate      = idx(['date'])
  const iDistance  = idx(['distance'])
  const iTime      = idx(['time'])
  const iAvgHR     = idx(['avg hr'])
  const iAvgPace   = idx(['avg pace'])

  // Need at minimum activity type, date, distance, time
  if ([iActivity, iDate, iDistance, iTime].some((i) => i === -1)) return []

  // Detect miles from distance column header
  const distHeaderRaw = headers[iDistance] ?? ''
  const milesMode = isMilesHeader(distHeaderRaw)

  const activities: RunnerActivity[] = []

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i])
    if (row.length < 4) continue

    const activityType = row[iActivity] ?? ''
    if (!isRunning(activityType)) continue

    const date = parseDate(row[iDate] ?? '')
    if (!date) continue

    const rawDist = parseFloat(row[iDistance] ?? '')
    if (isNaN(rawDist) || rawDist <= 0) continue

    const distanceKm = milesMode ? rawDist * 1.60934 : rawDist

    const durationSeconds = parseDuration(row[iTime] ?? '')
    if (!durationSeconds || durationSeconds <= 0) continue

    const avgPaceRaw = iAvgPace !== -1 ? parsePace(row[iAvgPace] ?? '') : null
    const avgPaceSecPerKm = avgPaceRaw ?? (durationSeconds / distanceKm)

    const avgHRRaw = iAvgHR !== -1 ? parseInt(row[iAvgHR] ?? '') : NaN
    const avgHR = isNaN(avgHRRaw) ? null : avgHRRaw

    activities.push({ date, distanceKm, durationSeconds, avgPaceSecPerKm, avgHR })
  }

  // Sort oldest → newest
  return activities.sort((a, b) => a.date.getTime() - b.date.getTime())
}
