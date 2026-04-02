interface HeroProps {
  onStartCoaching: () => void
}

export function Hero({ onStartCoaching }: HeroProps) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-zinc-950">
      {/*
        Video background — drop your trail running footage here.
        Recommended: 1920×1080, muted looping clip, placed at /public/videos/hero.mp4
      */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-45"
        aria-hidden="true"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay — top darker for nav legibility, bottom darker for text */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(9,9,11,0.7) 0%, rgba(9,9,11,0.35) 45%, rgba(9,9,11,0.8) 100%)',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl mx-auto">
        {/* Headline */}
        <h1 className="text-5xl md:text-[4.5rem] font-bold text-white tracking-tight leading-[1.04] mb-5">
          Train smarter.
          <br />
          <span className="text-primary-400">Run faster.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-zinc-400 max-w-lg leading-relaxed mb-10">
          Upload your Garmin data, share your goals, and get coaching built
          around your actual training history — not generic advice.
        </p>

        {/* CTA */}
        <button
          onClick={onStartCoaching}
          className="px-6 py-3 rounded-full bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 active:scale-[0.98] transition-all"
        >
          Meet the coach →
        </button>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-zinc-600 select-none">
        <span className="text-[10px] tracking-[0.2em] uppercase">scroll</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="animate-bounce"
        >
          <path
            d="M7 2v10M2 7l5 5 5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  )
}
