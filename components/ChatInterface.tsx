'use client'

import { useState, useRef, useEffect } from 'react'
import type { UserProfile, Message } from '@/lib/types'

interface ChatInterfaceProps {
  profile: UserProfile | null
  messages: Message[]
  isLoading: boolean
  onSendMessage: (text: string) => void
  onOpenOnboarding: () => void
}

const EXAMPLE_PROMPTS = [
  'Build me a 12-week half marathon plan',
  'How should I structure my easy runs?',
  "I've been feeling tired — should I take a rest week?",
  "What's the right long run pace for my goal?",
]

export function ChatInterface({
  profile,
  messages,
  isLoading,
  onSendMessage,
  onOpenOnboarding,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSubmit = () => {
    const text = input.trim()
    if (!text) return
    if (!profile) {
      onOpenOnboarding()
      return
    }
    setInput('')
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    onSendMessage(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFocus = () => {
    if (!profile) onOpenOnboarding()
  }

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 10rem)' }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scroll space-y-5 pb-6">
        {messages.length === 0 ? (
          <EmptyState
            hasProfile={!!profile}
            onOpenOnboarding={onOpenOnboarding}
            onSelectPrompt={(p) => {
              if (!profile) { onOpenOnboarding(); return }
              onSendMessage(p)
            }}
          />
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="sticky bottom-0 pt-4 pb-3 bg-white">
        <div
          className={`flex items-end gap-3 bg-zinc-50 border rounded-2xl px-4 py-3 transition-all ${
            profile
              ? 'border-zinc-200 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100'
              : 'border-zinc-200 opacity-70'
          }`}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onInput={handleInput}
            placeholder={
              profile ? 'Ask your coach anything…' : 'Complete setup to start coaching'
            }
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm text-zinc-900 placeholder:text-zinc-400 outline-none leading-relaxed overflow-hidden"
            style={{ maxHeight: '8rem' }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center transition-all hover:bg-primary-700 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M6.5 11.5V1.5M1.5 6.5l5-5 5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <p className="text-center text-[11px] text-zinc-400 mt-2">
          Coaching responses are AI-generated and intended for training guidance only.
        </p>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-0.5">
          P
        </div>
      )}
      <div
        className={`max-w-[78%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-zinc-900 text-white rounded-2xl rounded-br-sm'
            : 'bg-zinc-100 text-zinc-800 rounded-2xl rounded-bl-sm'
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        P
      </div>
      <div className="bg-zinc-100 rounded-2xl rounded-bl-sm px-4 py-3.5 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot w-1.5 h-1.5 rounded-full bg-zinc-400 block"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}

function EmptyState({
  hasProfile,
  onOpenOnboarding,
  onSelectPrompt,
}: {
  hasProfile: boolean
  onOpenOnboarding: () => void
  onSelectPrompt: (p: string) => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary-600/20">
        P
      </div>
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold text-zinc-900">
          {hasProfile ? 'Your coach is ready' : 'Meet your running coach'}
        </h2>
        <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
          {hasProfile
            ? 'Ask about training plans, pacing strategy, recovery, race prep, or anything else.'
            : 'Set up your profile and upload your Garmin data to unlock personalized coaching.'}
        </p>
      </div>
      {!hasProfile && (
        <button
          onClick={onOpenOnboarding}
          className="px-5 py-2.5 rounded-full bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors active:scale-95"
        >
          Set up my profile →
        </button>
      )}
      {hasProfile && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md mt-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onSelectPrompt(prompt)}
              className="px-4 py-3 rounded-xl border border-zinc-200 text-sm text-zinc-600 text-left leading-snug hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50 transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
