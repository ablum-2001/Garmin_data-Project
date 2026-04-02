const WEEKLY_DATA = [
  { label: 'W1', km: 38 },
  { label: 'W2', km: 44 },
  { label: 'W3', km: 47 },
  { label: 'W4', km: 31 }, // recovery
  { label: 'W5', km: 49 },
  { label: 'W6', km: 53 },
  { label: 'W7', km: 51 },
  { label: 'W8', km: 56, current: true },
] as const

const MAX_KM = 62

const HR_ZONES = [
  { label: 'Z1 · Easy',      pct: 44, colorBar: 'bg-primary-200', colorText: 'text-primary-300' },
  { label: 'Z2 · Aerobic',   pct: 31, colorBar: 'bg-primary-400', colorText: 'text-primary-400' },
  { label: 'Z3 · Tempo',     pct: 14, colorBar: 'bg-primary-500', colorText: 'text-primary-500' },
  { label: 'Z4 · Threshold', pct:  8, colorBar: 'bg-primary-700', colorText: 'text-primary-600' },
  { label: 'Z5 · Max',       pct:  3, colorBar: 'bg-primary-900', colorText: 'text-primary-800' },
]

const INSIGHTS = [
  {
    icon: '↑',
    color: 'text-emerald-400',
    label: 'Aerobic base',
    value: 'Strong — 75% easy running',
  },
  {
    icon: '⚠',
    color: 'text-amber-400',
    label: 'Recovery pattern',
    value: 'W4 dip + immediate rebound — watch this',
  },
  {
    icon: '→',
    color: 'text-primary-400',
    label: 'This week',
    value: 'Long run at 5:40–5:50 / km, stay aerobic',
  },
]

export function DataPreview() {
  return (
    <section className="bg-zinc-950 py-24 px-6 overflow-hidden">
      {/* Section label + heading */}
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <span className="inline-block text-[11px] font-semibold tracking-widest uppercase text-primary-500 mb-4">
          What you'll see
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
          Your training data, finally legible.
        </h2>
        <p className="text-zinc-500 text-base max-w-xl mx-auto leading-relaxed">
          Upload your Garmin export and your coach instantly reads your load, pace zones,
          and recovery patterns — then tells you exactly what they mean.
        </p>
      </div>

      {/* App window mockup */}
      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-2xl overflow-hidden border border-zinc-800"
          style={{ boxShadow: '0 0 80px rgba(37,99,235,0.12), 0 40px 80px rgba(0,0,0,0.6)' }}
        >
          {/* Window chrome */}
          <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-zinc-700" />
              <span className="w-3 h-3 rounded-full bg-zinc-700" />
              <span className="w-3 h-3 rounded-full bg-zinc-700" />
            </div>
            <div className="flex-1 flex justify-center">
              <span className="text-xs text-zinc-500 font-medium tracking-wide">
                Pace · Training Analysis
              </span>
            </div>
            <div className="w-12" /> {/* spacer */}
          </div>

          {/* Content */}
          <div className="bg-zinc-900 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
            {/* LEFT — data panel */}
            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Training overview</p>
                <p className="text-white font-semibold mt-0.5">Last 8 weeks</p>
              </div>

              {/* Stat row */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Avg / week', value: '49 km' },
                  { label: 'Avg pace',   value: '5:23 /km' },
                  { label: 'Easy %',     value: '75%' },
                  { label: 'Load trend', value: '↑ 12%' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-zinc-800/60 rounded-xl px-3.5 py-3">
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-white font-semibold text-sm">{value}</p>
                  </div>
                ))}
              </div>

              {/* Weekly mileage bar chart */}
              <div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-3 font-medium">
                  Weekly mileage (km)
                </p>
                <div className="flex items-end gap-1.5 h-24">
                  {WEEKLY_DATA.map((week) => {
                    const heightPct = Math.round((week.km / MAX_KM) * 100)
                    const isCurrent = 'current' in week && week.current
                    return (
                      <div key={week.label} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={`w-full rounded-t-sm transition-all ${
                            isCurrent ? 'bg-primary-500' : 'bg-zinc-700'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className={`text-[10px] ${isCurrent ? 'text-primary-400' : 'text-zinc-600'}`}>
                          {week.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* HR zone breakdown */}
              <div>
                <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-3 font-medium">
                  Heart rate zones
                </p>
                <div className="space-y-2">
                  {HR_ZONES.map(({ label, pct, colorBar, colorText }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className={`text-[11px] w-28 flex-shrink-0 ${colorText}`}>{label}</span>
                      <div className="flex-1 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${colorBar}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] text-zinc-500 w-8 text-right">{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — coaching insight panel */}
            <div className="p-6 flex flex-col gap-5">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Coach analysis</p>
                <p className="text-white font-semibold mt-0.5">Based on your Garmin data</p>
              </div>

              {/* Coach avatar + message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                  P
                </div>
                <div className="bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3.5 text-sm text-zinc-300 leading-relaxed">
                  Your aerobic base is solid — 75% of your training sits in Z1/Z2, which is exactly where it should be for a marathon build.
                  <br /><br />
                  One thing to flag: the drop to 31km in week 4 followed by an immediate jump to 49km is an aggressive rebound. Next recovery week, give yourself a longer runway back up.
                  <br /><br />
                  Overall: you&apos;re trending well. Stay the course this week.
                </div>
              </div>

              {/* Insight cards */}
              <div className="space-y-2 mt-auto">
                {INSIGHTS.map(({ icon, color, label, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-3 bg-zinc-800/50 border border-zinc-800 rounded-xl px-4 py-3"
                  >
                    <span className={`text-base leading-none mt-0.5 flex-shrink-0 ${color}`}>{icon}</span>
                    <div>
                      <p className="text-xs text-zinc-500 font-medium">{label}</p>
                      <p className="text-sm text-zinc-200 mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA hint */}
              <p className="text-xs text-zinc-600 text-center pt-2 border-t border-zinc-800">
                This is a preview — your actual analysis is based on your real Garmin data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
