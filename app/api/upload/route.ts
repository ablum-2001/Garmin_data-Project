/**
 * POST /api/upload
 *
 * Receives the raw Garmin CSV string, parses it server-side,
 * and returns a structured RunnerProfile.
 *
 * Body: { garminCsvContent: string }
 * Response: { runnerProfile: RunnerProfile | null, activitiesFound: number }
 */

import { NextRequest, NextResponse } from 'next/server'
import { parseGarminCSV } from '@/lib/garminParser'
import { buildRunnerProfile } from '@/lib/runnerProfile'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { garminCsvContent } = body as { garminCsvContent?: string }

    if (!garminCsvContent) {
      return NextResponse.json({ runnerProfile: null, activitiesFound: 0 })
    }

    const activities = parseGarminCSV(garminCsvContent)
    const runnerProfile = buildRunnerProfile(activities)

    return NextResponse.json({
      runnerProfile,
      activitiesFound: activities.length,
    })
  } catch (err) {
    console.error('[/api/upload] error:', err)
    return NextResponse.json(
      { error: 'Failed to parse CSV', runnerProfile: null, activitiesFound: 0 },
      { status: 500 }
    )
  }
}
