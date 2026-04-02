import type { UserProfile, Message } from './types'

/**
 * Mock coaching response.
 *
 * TODO: Replace with real implementation:
 * 1. Parse garminCsvContent → structured training history (weekly load, pace zones, HRV trends)
 * 2. Embed user profile + parsed history for retrieval context
 * 3. Retrieve relevant coaching knowledge from vector store (RAG)
 * 4. Build prompt: system instructions + user context + retrieved docs + conversation history
 * 5. Call Claude API server-side (app/api/chat/route.ts) and stream response
 */
export async function getCoachResponse(
  userMessage: string,
  profile: UserProfile,
  _history: Message[]
): Promise<string> {
  // Simulated network latency
  await new Promise((resolve) => setTimeout(resolve, 1400))

  const { name, goals, sessionsPerWeek, weeklyMileageTarget, injuryHistory } = profile
  const primaryGoal = goals[0] ?? 'improve your running'
  const hasGarmin = !!profile.garminCsvContent

  const pool = [
    `Based on your goal to ${primaryGoal.toLowerCase()} and your ${sessionsPerWeek} sessions per week, I'd focus on building aerobic base first. At ${weeklyMileageTarget}km per week you have a solid foundation, ${name}. Keep your easy runs genuinely easy — most runners go too hard on recovery days.`,

    `${hasGarmin ? 'Looking at your Garmin data, I can see your training load pattern clearly. ' : ''}A good rule for easy pace: if you can\'t hold a full conversation, you\'re going too hard. Reserve intensity for your one or two key sessions per week and protect everything else.`,

    injuryHistory.toLowerCase() !== 'none'
      ? `Given your history with ${injuryHistory.toLowerCase()}, I'd be careful about ramping volume too fast. The 10% rule — no more than 10% mileage increase per week — exists for a reason. Let's build durability before we layer in speed work.`
      : `For ${primaryGoal.toLowerCase()}, structure your week around one long run, one tempo or interval session, and fill the rest with easy aerobic mileage. Consistency over weeks matters more than any single workout.`,

    `Your long run should sit at genuine conversational pace, around 65–70% max HR. That's where you build the aerobic engine that powers everything else. Resist the urge to push it on weeks when you feel good.`,

    `The athletes who improve fastest aren't always the ones training hardest — they're the ones who barely miss a week for months at a time. Recovery and sleep matter as much as the training itself, ${name}.`,
  ]

  return pool[Math.floor(Math.random() * pool.length)]
}

export function buildWelcomeMessage(profile: UserProfile): string {
  const goal = profile.goals[0] ?? 'reach your goals'
  const hasGarmin = !!profile.garminFileName

  return `Hey ${profile.name} — welcome. I've looked over your profile${hasGarmin ? ` and your Garmin data` : ''} and I have a clear picture of where you're starting from.

Your main goal is to ${goal.toLowerCase()}, and you're targeting ${profile.sessionsPerWeek} sessions and ${profile.weeklyMileageTarget}km per week.${profile.injuryHistory && profile.injuryHistory.toLowerCase() !== 'none' ? ` I've noted your injury history — we'll build around that carefully.` : ''}

What do you want to work on first?`
}
