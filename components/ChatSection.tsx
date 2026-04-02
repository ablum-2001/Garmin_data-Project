import { AnimatedAIChat } from './ui/animated-ai-chat'
import type { UserProfile, Message } from '@/lib/types'

interface ChatSectionProps {
  profile: UserProfile | null
  messages: Message[]
  isLoading: boolean
  onSendMessage: (text: string) => void
  onOpenOnboarding: () => void
}

export function ChatSection({
  profile,
  messages,
  isLoading,
  onSendMessage,
  onOpenOnboarding,
}: ChatSectionProps) {
  return (
    <section id="chat" className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Session header */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-sm border-b border-white/[0.06] px-6 md:px-10 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-sm font-semibold text-white/80">
            {profile ? `${profile.name}'s coaching session` : 'Running Coach'}
          </span>
          {profile && profile.goals[0] && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
              {profile.goals[0]}
            </span>
          )}
        </div>

        {profile && (
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>{profile.sessionsPerWeek}×&thinsp;/&thinsp;week</span>
            <span>{profile.weeklyMileageTarget} km&thinsp;/&thinsp;week</span>
            {profile.garminFileName && (
              <span className="hidden md:flex items-center gap-1 text-violet-400">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M1.5 9.5V5L5.5 1l4 4v4.5H8V6H3v3.5H1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
                {profile.garminFileName}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto" style={{ minHeight: 'calc(100vh - 3.5rem)' }}>
        <AnimatedAIChat
          profile={profile}
          messages={messages}
          isLoading={isLoading}
          onSendMessage={onSendMessage}
          onOpenOnboarding={onOpenOnboarding}
        />
      </div>
    </section>
  )
}
