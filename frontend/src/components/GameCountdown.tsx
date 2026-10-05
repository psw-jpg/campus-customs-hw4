import { useEffect, useState } from 'react'

// Live countdown to The Game (Harvard–Yale). Date is configurable.
const THE_GAME = new Date('2026-11-21T12:00:00-05:00')

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

export default function GameCountdown() {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const remaining = THE_GAME.getTime() - now
  const over = remaining <= 0
  const { days, hours, minutes, seconds } = parts(remaining)

  return (
    <div className="countdown">
      {over ? (
        <p className="countdown-live">It's Game Day — Boola Boola! 🏈</p>
      ) : (
        <div className="countdown-units">
          {[
            { v: days, l: 'Days' },
            { v: hours, l: 'Hours' },
            { v: minutes, l: 'Min' },
            { v: seconds, l: 'Sec' },
          ].map((u) => (
            <div key={u.l} className="countdown-unit">
              <span className="countdown-num">{String(u.v).padStart(2, '0')}</span>
              <span className="countdown-label">{u.l}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
