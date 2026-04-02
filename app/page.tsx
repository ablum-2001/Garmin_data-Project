'use client'

import { useState, useCallback, useRef } from 'react'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { TrustBar } from '@/components/TrustBar'
import { DataPreview } from '@/components/DataPreview'
import { ChatSection } from '@/components/ChatSection'
import { OnboardingModal } from '@/components/OnboardingModal'
import type { UserProfile, Message, RunnerProfile } from '@/lib/types'
import { buildWelcomeMessage } from '@/lib/mockCoach'

export default function Home() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [runnerProfile, setRunnerProfile] = useState<RunnerProfile | null>(null)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  const scrollToChat = useCallback(() => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleStartCoaching = useCallback(() => {
    if (!profile) {
      setOnboardingOpen(true)
    } else {
      scrollToChat()
    }
  }, [profile, scrollToChat])

  const handleOnboardingComplete = useCallback(
    async (newProfile: UserProfile) => {
      setProfile(newProfile)
      setOnboardingOpen(false)

      // Parse Garmin CSV server-side if uploaded
      if (newProfile.garminCsvContent) {
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ garminCsvContent: newProfile.garminCsvContent }),
          })
          if (res.ok) {
            const data = await res.json()
            if (data.runnerProfile) setRunnerProfile(data.runnerProfile)
          }
        } catch {
          // Non-fatal — coaching works without Garmin data
        }
      }

      const welcome: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: buildWelcomeMessage(newProfile),
        timestamp: new Date(),
      }
      setMessages([welcome])
      setTimeout(scrollToChat, 100)
    },
    [scrollToChat]
  )

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!profile) {
        setOnboardingOpen(true)
        return
      }

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
            userProfile: profile,
            runnerProfile,
          }),
        })

        const data = await res.json()
        const content: string = data.response ?? data.error ?? 'Something went wrong.'

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content,
            timestamp: new Date(),
          },
        ])
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Network error — please try again.',
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [profile, runnerProfile, messages]
  )

  return (
    <>
      <Navbar onStartCoaching={handleStartCoaching} hasProfile={!!profile} />
      <Hero onStartCoaching={handleStartCoaching} />
      <TrustBar />
      <DataPreview />
      <div ref={chatRef}>
        <ChatSection
          profile={profile}
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onOpenOnboarding={() => setOnboardingOpen(true)}
        />
      </div>
      {onboardingOpen && (
        <OnboardingModal
          onComplete={handleOnboardingComplete}
          onClose={() => setOnboardingOpen(false)}
        />
      )}
    </>
  )
}
