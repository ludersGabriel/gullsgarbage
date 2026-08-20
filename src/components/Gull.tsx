/** Tiny sea-gull silhouette (wings up) used across the app. */
export function Gull({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 64" fill="currentColor" className={className} aria-hidden="true">
      <path d="M60 42 Q30 10 8 14 Q26 26 44 34 Q44 42 60 46 Q76 42 76 34 Q94 26 112 14 Q90 10 60 42 Z" />
    </svg>
  )
}

/** Layered rolling wave bars for the shoreline. */
export function Waves({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg
        className="h-24 w-full text-sky-300/80"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          d="M0 60 Q 60 30 120 60 T 240 60 T 360 60 T 480 60 T 600 60 T 720 60 T 840 60 T 960 60 T 1080 60 T 1200 60 T 1320 60 T 1440 60 L 1440 120 L 0 120 Z"
          fill="currentColor"
          opacity="0.55"
        />
      </svg>
      <svg
        className="-mt-6 h-16 w-full text-sky-500/70"
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0 40 Q 60 10 120 40 T 240 40 T 360 40 T 480 40 T 600 40 T 720 40 T 840 40 T 960 40 T 1080 40 T 1200 40 T 1320 40 T 1440 40 L 1440 100 L 0 100 Z"
          fill="currentColor"
          opacity="0.7"
        />
      </svg>
    </div>
  )
}
