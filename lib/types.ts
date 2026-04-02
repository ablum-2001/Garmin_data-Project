export interface UserProfile {
  name: string
  age: number
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'
  weight?: number // kg
  goals: string[]
  injuryHistory: string
  sessionsPerWeek: number
  weeklyMileageTarget: number // km
  garminFileName?: string
  garminCsvContent?: string // raw CSV passed to server-side parsing
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ── Garmin-derived types ───────────────────────────────────────────────────

export interface RunnerActivity {
  date: Date
  distanceKm: number
  durationSeconds: number
  avgPaceSecPerKm: number | null
  avgHR: number | null
}

export interface BestEffort {
  distanceKm: number
  durationSeconds: number
  date: string // ISO date string
}

export interface RunnerProfile {
  totalActivities: number
  firstActivity: string // ISO date
  lastActivity: string  // ISO date
  bestEfforts: {
    fiveK: BestEffort | null
    tenK: BestEffort | null
    halfMarathon: BestEffort | null
    marathon: BestEffort | null
  }
  weeklyMileage: {
    last30d: number
    last90d: number
    last365d: number
  }
  sessionsPerWeek: {
    last30d: number
    last90d: number
    last365d: number
  }
  longestRun: {
    allTime: number
    last30d: number
    last90d: number
    last365d: number
  }
  longRunCounts: {
    over18km: number
    over25km: number
    over30km: number
  }
  trend: 'rising' | 'stable' | 'falling'
  recentBreak: boolean
}
