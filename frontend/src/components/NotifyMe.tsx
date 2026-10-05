import { useState, type FormEvent } from 'react'
import { notifyMe } from '../api'
import { useAuth } from '../authContext'

// "Email me when this size is back in stock." Used on sold-out sizes.
export default function NotifyMe({ productId, size }: { productId: string; size: string }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState(user?.email ?? '')
  const [done, setDone] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      setDone(await notifyMe(productId, size, email))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (done) return <p className="notice">{done}</p>

  if (!open) {
    return (
      <button className="btn btn-outline btn-block" onClick={() => setOpen(true)}>
        Notify me when size {size} is back
      </button>
    )
  }

  return (
    <form className="notify-form" onSubmit={submit}>
      <input
        type="email"
        placeholder="you@example.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email for back-in-stock alert"
      />
      <button type="submit" className="btn btn-primary">
        Notify me
      </button>
      {error && <p className="notice error">{error}</p>}
    </form>
  )
}
