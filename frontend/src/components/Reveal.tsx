import type { ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'

// Wraps children so they fade/slide in when scrolled into view.
export default function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const { ref, shown } = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal${shown ? ' reveal-in' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
