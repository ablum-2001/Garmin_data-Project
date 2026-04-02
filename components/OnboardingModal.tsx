'use client'

import { useState, useRef } from 'react'
import type { UserProfile } from '@/lib/types'

interface OnboardingModalProps {
  onComplete: (profile: UserProfile) => void
  onClose: () => void
}

const GOAL_OPTIONS = [
  'Run a marathon',
  'Improve 5K / 10K pace',
  'Complete a trail race',
  'Build consistent mileage',
  'Return from injury',
  'Run my first race',
]

interface FormData {
  name: string
  age: string
  gender: string
  weight: string
  goals: string[]
  injuryHistory: string
  sessionsPerWeek: string
  weeklyMileageTarget: string
  garminFile: File | null
}

const DEFAULT_FORM: FormData = {
  name: '',
  age: '',
  gender: '',
  weight: '',
  goals: [],
  injuryHistory: '',
  sessionsPerWeek: '4',
  weeklyMileageTarget: '40',
  garminFile: null,
}

const STEPS = ['Profile', 'Training', 'Health', 'Data']

export function OnboardingModal({ onComplete, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(DEFAULT_FORM)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canAdvance = (): boolean => {
    if (step === 0) return !!form.name.trim() && !!form.age
    if (step === 1) return form.goals.length > 0
    return true // steps 2 and 3 are optional
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    let garminCsvContent: string | undefined
    if (form.garminFile) {
      garminCsvContent = await form.garminFile.text()
    }

    const profile: UserProfile = {
      name: form.name.trim(),
      age: parseInt(form.age),
      gender: (form.gender as UserProfile['gender']) || undefined,
      weight: form.weight ? parseFloat(form.weight) : undefined,
      goals: form.goals,
      injuryHistory: form.injuryHistory.trim() || 'None',
      sessionsPerWeek: parseInt(form.sessionsPerWeek) || 4,
      weeklyMileageTarget: parseInt(form.weeklyMileageTarget) || 40,
      garminFileName: form.garminFile?.name,
      garminCsvContent,
    }

    onComplete(profile)
  }

  const toggleGoal = (goal: string) =>
    setForm((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }))

  const handleFile = (file: File | null) => {
    if (!file) { setForm((p) => ({ ...p, garminFile: null })); return }
    if (file.name.endsWith('.csv')) setForm((p) => ({ ...p, garminFile: file }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/65 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[26rem] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-5 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-zinc-400">
              Setup &mdash; {step + 1}&thinsp;/&thinsp;{STEPS.length}
            </span>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 transition-colors p-1 -mr-1 rounded-lg hover:bg-zinc-100"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {/* Progress */}
          <div className="h-0.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: '65vh' }}>
          {step === 0 && <StepProfile form={form} setForm={setForm} />}
          {step === 1 && <StepTraining form={form} setForm={setForm} toggleGoal={toggleGoal} />}
          {step === 2 && <StepHealth form={form} setForm={setForm} />}
          {step === 3 && (
            <StepData
              form={form}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              fileInputRef={fileInputRef}
              onFileChange={handleFile}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-zinc-50">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={handleNext}
            disabled={!canAdvance()}
            className="px-5 py-2.5 rounded-full bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-35 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {step === STEPS.length - 1 ? 'Start coaching →' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Step components ───────────────────────────────────────────────────── */

function StepProfile({
  form,
  setForm,
}: {
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
}) {
  return (
    <div className="space-y-5">
      <StepHeader
        title="About you"
        subtitle="A few basics so we can personalise your plan."
      />
      <Field label="First name *">
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Alex"
          className="input-field"
          autoFocus
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Age *">
          <input
            type="number"
            value={form.age}
            onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
            placeholder="28"
            min={14}
            max={90}
            className="input-field"
          />
        </Field>
        <Field label="Weight (kg)">
          <input
            type="number"
            value={form.weight}
            onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
            placeholder="70"
            className="input-field"
          />
        </Field>
      </div>
      <Field label="Gender">
        <select
          value={form.gender}
          onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
          className="input-field"
        >
          <option value="">Prefer not to say</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non-binary">Non-binary</option>
        </select>
      </Field>
    </div>
  )
}

function StepTraining({
  form,
  setForm,
  toggleGoal,
}: {
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
  toggleGoal: (goal: string) => void
}) {
  return (
    <div className="space-y-5">
      <StepHeader
        title="Your goals"
        subtitle="Select what you're training toward. Pick one or more."
      />
      <div className="grid grid-cols-2 gap-2">
        {GOAL_OPTIONS.map((goal) => {
          const active = form.goals.includes(goal)
          return (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              className={`px-3 py-2.5 rounded-xl border text-sm font-medium text-left transition-all ${
                active
                  ? 'bg-primary-50 border-primary-400 text-primary-700'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              {goal}
            </button>
          )
        })}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Sessions / week">
          <input
            type="number"
            value={form.sessionsPerWeek}
            onChange={(e) => setForm((p) => ({ ...p, sessionsPerWeek: e.target.value }))}
            min={1}
            max={14}
            className="input-field"
          />
        </Field>
        <Field label="Target km / week">
          <input
            type="number"
            value={form.weeklyMileageTarget}
            onChange={(e) => setForm((p) => ({ ...p, weeklyMileageTarget: e.target.value }))}
            min={5}
            max={300}
            className="input-field"
          />
        </Field>
      </div>
    </div>
  )
}

function StepHealth({
  form,
  setForm,
}: {
  form: FormData
  setForm: React.Dispatch<React.SetStateAction<FormData>>
}) {
  return (
    <div className="space-y-5">
      <StepHeader
        title="Injury history"
        subtitle="Current or past injuries we should know about. Skip if none."
      />
      <textarea
        value={form.injuryHistory}
        onChange={(e) => setForm((p) => ({ ...p, injuryHistory: e.target.value }))}
        placeholder="e.g. Left knee IT band issues in 2024, fully recovered. Or leave blank."
        rows={5}
        className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all resize-none leading-relaxed"
      />
    </div>
  )
}

function StepData({
  form,
  isDragging,
  setIsDragging,
  fileInputRef,
  onFileChange,
}: {
  form: FormData
  isDragging: boolean
  setIsDragging: (v: boolean) => void
  fileInputRef: React.RefObject<HTMLInputElement>
  onFileChange: (file: File | null) => void
}) {
  return (
    <div className="space-y-5">
      <StepHeader
        title="Your Garmin data"
        subtitle="Upload your activities CSV to ground coaching in your real training history."
      />

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          onFileChange(e.dataTransfer.files[0] ?? null)
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-all ${
          isDragging
            ? 'border-primary-400 bg-primary-50'
            : form.garminFile
            ? 'border-primary-300 bg-primary-50/60'
            : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
        />

        {form.garminFile ? (
          <>
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3.5 9.5l4 4 7-8" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-900">{form.garminFile.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5">Ready to upload</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFileChange(null) }}
              className="text-xs text-zinc-400 hover:text-zinc-700 underline transition-colors"
            >
              Remove
            </button>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 13V5M5 9l4-4 4 4" stroke="#a1a1aa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 15h12" stroke="#a1a1aa" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-700">Drop your CSV here</p>
              <p className="text-xs text-zinc-400 mt-0.5">or click to browse</p>
            </div>
          </>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-xs text-zinc-500 leading-relaxed">
          Export from Garmin Connect → Activities → Export to CSV. Your data is used only within this session.
        </p>
        <p className="text-xs text-zinc-400">
          Optional — you can skip this and coaching will still work.
        </p>
      </div>
    </div>
  )
}

/* ─── Shared sub-components ─────────────────────────────────────────────── */

function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="space-y-1 mb-1">
      <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
      <p className="text-sm text-zinc-500">{subtitle}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-zinc-500">{label}</label>
      {children}
    </div>
  )
}
