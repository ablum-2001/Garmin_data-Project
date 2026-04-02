"use client";

import { useEffect, useRef, useCallback } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  SendIcon,
  LoaderIcon,
  XIcon,
  ActivityIcon,
  TimerIcon,
  HeartPulseIcon,
  TrophyIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import type { UserProfile, Message } from "@/lib/types";

// ── auto-resize textarea hook ──────────────────────────────────────────────

function useAutoResizeTextarea({ minHeight, maxHeight }: { minHeight: number; maxHeight?: number }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = `${minHeight}px`;
      if (!reset) {
        el.style.height = `${Math.max(minHeight, Math.min(el.scrollHeight, maxHeight ?? Infinity))}px`;
      }
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

// ── Textarea with optional animated focus ring ─────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    return (
      <div className={cn("relative", containerClassName)}>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            className
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {showRing && isFocused && (
          <motion.span
            className="absolute inset-0 rounded-md pointer-events-none ring-2 ring-offset-0 ring-violet-500/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// ── Typing dots ────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center ml-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 bg-white/90 rounded-full mx-0.5"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.15, ease: "easeInOut" }}
          style={{ boxShadow: "0 0 4px rgba(255,255,255,0.3)" }}
        />
      ))}
    </div>
  );
}

// ── Running-coach quick prompts ────────────────────────────────────────────

interface QuickPrompt {
  icon: React.ReactNode;
  label: string;
  text: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  { icon: <ActivityIcon className="w-4 h-4" />, label: "Training plan", text: "Build me a 12-week half marathon plan" },
  { icon: <TimerIcon className="w-4 h-4" />,    label: "Pacing strategy", text: "What's the right long run pace for my goal?" },
  { icon: <HeartPulseIcon className="w-4 h-4" />, label: "Recovery advice", text: "I've been feeling tired — should I take a rest week?" },
  { icon: <TrophyIcon className="w-4 h-4" />,   label: "Race prep", text: "How do I peak for my target race?" },
];

// ── Message bubble ─────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <motion.div
      className={cn("flex items-end gap-2.5 mb-4", isUser ? "justify-end" : "justify-start")}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-violet-600/80 border border-violet-500/30 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mb-0.5">
          P
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap rounded-2xl",
          isUser
            ? "bg-white/10 text-white/90 rounded-br-sm border border-white/10"
            : "bg-white/[0.04] text-white/80 rounded-bl-sm border border-white/[0.06]"
        )}
      >
        {message.content}
      </div>
    </motion.div>
  );
}

// ── Empty state (no messages yet) ─────────────────────────────────────────

function EmptyState({ onSelectPrompt }: { onSelectPrompt: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8">
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-white tracking-tight">
          What would you like to work on?
        </h2>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Ask anything about training, pacing, recovery, or race prep.
        </p>
      </motion.div>

      <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-lg">
        {QUICK_PROMPTS.map((prompt, i) => (
          <motion.button
            key={prompt.label}
            onClick={() => onSelectPrompt(prompt.text)}
            className="flex items-center gap-2 px-3 py-2 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] rounded-lg text-sm text-white/55 hover:text-white/85 transition-all"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 + 0.2 }}
          >
            <span className="text-white/40">{prompt.icon}</span>
            <span>{prompt.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface AnimatedAIChatProps {
  profile: UserProfile | null;
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onOpenOnboarding: () => void;
}

export function AnimatedAIChat({
  profile,
  messages,
  isLoading,
  onSendMessage,
  onOpenOnboarding,
}: AnimatedAIChatProps) {
  const [value, setValue] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const bottomRef = useRef<HTMLDivElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 60, maxHeight: 200 });

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Track mouse for cursor glow
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSend = () => {
    if (!profile) {
      onOpenOnboarding();
      return;
    }
    const text = value.trim();
    if (!text) return;
    onSendMessage(text);
    setValue("");
    adjustHeight(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (text: string) => {
    if (!profile) {
      onOpenOnboarding();
      return;
    }
    onSendMessage(text);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full relative">
      {/* Background glows */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/8 rounded-full filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/8 rounded-full filter blur-[128px] animate-pulse" style={{ animationDelay: "700ms" }} />
      </div>

      {/* Messages / empty state */}
      <div className="relative flex-1 overflow-y-auto chat-scroll px-4 md:px-6 py-6">
        {!hasMessages ? (
          <EmptyState onSelectPrompt={handleQuickPrompt} />
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  className="flex items-end gap-2.5 mb-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="w-7 h-7 rounded-full bg-violet-600/80 border border-violet-500/30 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    P
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-sm px-4 py-3.5 flex items-center gap-1">
                    <TypingDots />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="relative px-4 md:px-6 pb-5 pt-2">
        <motion.div
          className="relative backdrop-blur-2xl bg-white/[0.03] rounded-2xl border border-white/[0.07] shadow-2xl"
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-4">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => { setValue(e.target.value); adjustHeight(); }}
              onKeyDown={handleKeyDown}
              onFocus={() => { setInputFocused(true); if (!profile) onOpenOnboarding(); }}
              onBlur={() => setInputFocused(false)}
              placeholder={profile ? "Ask your coach anything…" : "Complete setup to start coaching"}
              containerClassName="w-full"
              className={cn(
                "w-full px-4 py-3 resize-none bg-transparent border-none",
                "text-white/90 text-sm focus:outline-none",
                "placeholder:text-white/20 min-h-[60px]"
              )}
              style={{ overflow: "hidden" }}
              showRing={false}
            />
          </div>

          <div className="px-4 pb-4 border-t border-white/[0.05] pt-3 flex items-center justify-between gap-4">
            <p className="text-xs text-white/20">
              {profile
                ? `Coaching ${profile.name} · ${profile.sessionsPerWeek}×/week · ${profile.weeklyMileageTarget} km`
                : "Set up your profile to unlock personalized coaching"}
            </p>

            <motion.button
              type="button"
              onClick={handleSend}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={isLoading || (!value.trim() && !!profile)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                value.trim() || !profile
                  ? "bg-white text-zinc-900 shadow-lg shadow-white/10"
                  : "bg-white/[0.06] text-white/35"
              )}
            >
              {isLoading ? (
                <LoaderIcon className="w-4 h-4 animate-spin" />
              ) : (
                <SendIcon className="w-4 h-4" />
              )}
              <span>{profile ? "Send" : "Set up profile"}</span>
            </motion.button>
          </div>
        </motion.div>

        <p className="text-center text-[11px] text-white/20 mt-2">
          Coaching responses are AI-generated and intended for training guidance only.
        </p>
      </div>

      {/* Cursor glow when input focused */}
      {inputFocused && (
        <motion.div
          className="fixed w-[40rem] h-[40rem] rounded-full pointer-events-none z-0 opacity-[0.025] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 blur-[96px]"
          animate={{ x: mousePosition.x - 320, y: mousePosition.y - 320 }}
          transition={{ type: "spring", damping: 25, stiffness: 150, mass: 0.5 }}
        />
      )}
    </div>
  );
}
