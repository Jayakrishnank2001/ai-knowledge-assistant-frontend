import { useCallback, useEffect, useState } from 'react'

export function useEscapeKey(active: boolean, onEscape: () => void): void {
  useEffect(() => {
    if (!active) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onEscape()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, onEscape])
}

export function errorText(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function useDeleteConfirm<T>() {
  const [pending, setPending] = useState<T | null>(null)
  const [deleting, setDeleting] = useState(false)
  const open = useCallback((item: T) => setPending(item), [])
  const close = useCallback(() => {
    if (!deleting) setPending(null)
  }, [deleting])
  return { pending, deleting, open, close, setPending, setDeleting }
}
