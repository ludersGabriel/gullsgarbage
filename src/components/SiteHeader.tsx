import { Link } from '@tanstack/react-router'
import { Gull } from './Gull'

const navLink = {
  activeProps: { className: 'bg-sky-900/10 text-sky-950' },
  inactiveProps: { className: 'text-sky-900/70 hover:bg-sky-900/5 hover:text-sky-950' },
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-sky-900/10 bg-sky-50/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2.5 text-sky-950">
          <Gull className="h-5 w-10 text-sky-800 transition-transform group-hover:-rotate-6" />
          <span className="font-display text-lg font-black tracking-tight italic">gullsgabage</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold">
          <Link to="/games" className="rounded-full px-4 py-2" {...navLink}>
            Games
          </Link>
          <Link to="/devlog" className="rounded-full px-4 py-2" {...navLink}>
            Devlog
          </Link>
        </nav>
      </div>
    </header>
  )
}
