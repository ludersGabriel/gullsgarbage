import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { squawk } from '~/server/gulls.functions'

/**
 * Client component that calls the typed POST server function `squawk`,
 * then invalidates the router so the route loader re-runs and the
 * server-side counter stays cache-coherent.
 */
export function SquawkButton({ flock }: { flock: string }) {
  const squawkFn = useServerFn(squawk)
  const router = useRouter()
  const [pending, setPending] = useState(false)

  return (
    <button
      type="button"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        try {
          await squawkFn({ data: { flock } })
          await router.invalidate({ sync: true })
        } finally {
          setPending(false)
        }
      }}
      className="mt-3 rounded-full border border-sky-900/20 bg-sky-950 px-5 py-2 text-sm font-bold tracking-widest text-amber-300 uppercase shadow-sm transition hover:bg-sky-900 active:scale-95 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? 'squawk…' : 'squawk!'}
    </button>
  )
}
