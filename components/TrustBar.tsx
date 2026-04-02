function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconGarmin() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 13V7l5-5 5 5v6h-3.5v-4h-3V13H3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTarget() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="3"   stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="0.8" fill="currentColor" />
    </svg>
  )
}

const features = [
  {
    Icon: IconCheck,
    label: 'Built on your data',
    description: 'Coaching grounded in your actual training history, not templates.',
  },
  {
    Icon: IconGarmin,
    label: 'Garmin-native',
    description: 'Start by uploading your activity data straight from the Garmin website and we will take care of the rest.',
  },
  {
    Icon: IconTarget,
    label: 'Performance-focused',
    description: 'Evidence-based methodology. Actionable insights.',
  },
]

export function TrustBar() {
  return (
    <section id="how-it-works" className="bg-zinc-900 border-y border-white/[0.06]">
      <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x md:divide-white/[0.06]">
        {features.map(({ Icon, label, description }) => (
          <div key={label} className="flex flex-col gap-2.5 md:px-10 first:pl-0 last:pr-0">
            <div className="text-primary-400">
              <Icon />
            </div>
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
