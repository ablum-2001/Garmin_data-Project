/**
 * Derives structured RunnerProfile metrics from parsed Garmin activity data.
 * All calculations are deterministic and transparent.
 */

import type { RunnerActivity, BestEffort, RunnerProfile } from './types'

// ── Helpers ────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

function activitiesSince(activities: RunnerActivity[], cutoff: Date): RunnerActivity[] {
  return activities.filter((a) => a.date >= cutoff)
}

// ── Weekly averages ────────────────────────────────────────────────────────

function avgWeeklyKm(activities: RunnerActivity[], days: number): number {
  const recent = activitiesSince(activities, daysAgo(days))
  const total = recent.reduce((sum, a) => sum + a.distanceKm, 0)
  return round1(total / (days / 7))
}

function avgSessionsPerWeek(activities: RunnerActivity[], days: number): number {
  const recent = activitiesSince(activities, daysAgo(days))
  return round1(recent.length / (days / 7))
}

// ── Longest run ────────────────────────────────────────────────────────────

function longestKm(activities: RunnerActivity[]): number {
  if (activities.length === 0) return 0
  return round1(Math.max(...activities.map((a) => a.distanceKm)))
}

// ── Best efforts ───────────────────────────────────────────────────────────

/**
 * Find the fastest activity within a distance window.
 * "Fastest" = shortest duration per actual distance (not normalised).
 */
function findBestEffort(
  activities: RunnerActivity[],
  minKm: number,
  maxKm: number
): BestEffort | null {
  const candidates = activities.filter(
    (a) => a.distanceKm >= minKm && a.distanceKm <= maxKm
  )
  if (candidates.length === 0) return null

  const best = candidates.reduce((prev, curr) =>
    curr.durationSeconds < prev.durationSeconds ? curr : prev
  )

  return {
    distanceKm: round1(best.distanceKm),
    durationSeconds: best.durationSeconds,
    date: best.date.toISOString().slice(0, 10),
  }
}

// ── Training trend ─────────────────────────────────────────────────────────

function computeTrend(activities: RunnerActivity[]): 'rising' | 'stable' | 'falling' {
  const recentKm = activitiesSince(activities, daysAgo(30)).reduce(
    (s, a) => s + a.distanceKm, 0
  )
  const priorKm = activities
    .filter((a) => a.date >= daysAgo(60) && a.date < daysAgo(30))
    .reduce((s, a) => s + a.distanceKm, 0)

  if (priorKm === 0) return 'stable'
  const delta = (recentKm - priorKm) / priorKm
  if (delta > 0.15) return 'rising'
  if (delta < -0.15) return 'falling'
  return 'stable'
}

// ── Recent break detection ─────────────────────────────────────────────────

function hasRecentBreak(activities: RunnerActivity[]): boolean {
  const recent = activitiesSince(activities, daysAgo(60))
    .slice()
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  for (let i = 1; i < recent.length; i++) {
    const gapDays =
      (recent[i].date.getTime() - recent[i - 1].date.getTime()) / 86_400_000
    if (gapDays > 14) return true
  }
  return false
}

// ── Main export ────────────────────────────────────────────────────────────

export function buildRunnerProfile(activities: RunnerActivity[]): RunnerProfile | null {
  if (activities.length === 0) return null

  return {
    totalActivities: activities.length,
    firstActivity: activities[0].date.toISOString().slice(0, 10),
    lastActivity: activities[activities.length - 1].date.toISOString().slice(0, 10),

    bestEfforts: {
      fiveK:        findBestEffort(activities, 4.7, 5.3),
      tenK:         findBestEffort(activities, 9.5, 10.5),
      halfMarathon: findBestEffort(activities, 20.5, 21.6),
      marathon:     findBestEffort(activities, 41.5, 43.0),
    },

    weeklyMileage: {
      last30d:  avgWeeklyKm(activities, 30),
      last90d:  avgWeeklyKm(activities, 90),
      last365d: avgWeeklyKm(activities, 365),
    },

    sessionsPerWeek: {
      last30d:  avgSessionsPerWeek(activities, 30),
      last90d:  avgSessionsPerWeek(activities, 90),
      last365d: avgSessionsPerWeek(activities, 365),
    },

    longestRun: {
      allTime: longestKm(activities),
      last30d:  longestKm(activitiesSince(activities, daysAgo(30))),
      last90d:  longestKm(activitiesSince(activities, daysAgo(90))),
      last365d: longestKm(activitiesSince(activities, daysAgo(365))),
    },

    longRunCounts: {
      over18km: activities.filter((a) => a.distanceKm >= 18).length,
      over25km: activities.filter((a) => a.distanceKm >= 25).length,
      over30km: activities.filter((a) => a.distanceKm >= 30).length,
    },

    trend: computeTrend(activities),
    recentBreak: hasRecentBreak(activities),
  }
}
