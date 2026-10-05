import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../authContext'

export default function CreateAccount() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm: '',
    promo_opt_in: false,
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Your passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setBusy(true)
    try {
      await signup({
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        password: form.password,
        promo_opt_in: form.promo_opt_in,
      })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Join the Bulldog crew</h1>
        <p className="muted">
          Create an account to chat with our shopping assistant and keep your conversations.
        </p>

        <div className="form-row">
          <label>
            First name
            <input
              type="text"
              autoComplete="given-name"
              required
              value={form.first_name}
              onChange={(e) => update('first_name', e.target.value)}
            />
          </label>
          <label>
            Last name
            <input
              type="text"
              autoComplete="family-name"
              required
              value={form.last_name}
              onChange={(e) => update('last_name', e.target.value)}
            />
          </label>
        </div>
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={form.confirm}
            onChange={(e) => update('confirm', e.target.value)}
          />
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={form.promo_opt_in}
            onChange={(e) => update('promo_opt_in', e.target.checked)}
          />
          <span>Send me promotional emails about new gear and sales.</span>
        </label>

        {error && <p className="notice error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Creating account…' : 'Create Account'}
        </button>

        <p className="muted small">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  )
}
