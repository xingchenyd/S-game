import { useEffect } from 'react'

export interface ToastMessage { id: number; text: string; tone?: 'normal' | 'success' | 'warning' }

export default function Toast({ message, onDone }: { message: ToastMessage | null; onDone: () => void }) {
  useEffect(() => {
    if (!message) return
    const timeout = window.setTimeout(onDone, 2600)
    return () => window.clearTimeout(timeout)
  }, [message, onDone])
  if (!message) return null
  return <div className={`toast ${message.tone ?? 'normal'}`} role="status">{message.text}</div>
}
