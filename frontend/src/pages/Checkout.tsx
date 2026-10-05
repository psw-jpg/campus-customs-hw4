import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice, placeOrder, type OrderConfirmation } from '../api'
import { useAuth } from '../authContext'
import { getToken } from '../authContext'
import { useCart } from '../cartContext'
import Confetti from '../components/Confetti'
import BulldogAvatar from '../components/BulldogAvatar'

export default function Checkout() {
  const { items, subtotal, clear } = useCart()
  const { user } = useAuth()
  const [email, setEmail] = useState(user?.email ?? '')
  const [fullName, setFullName] = useState(user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '')
  const [promo, setPromo] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState<OrderConfirmation | null>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const order = await placeOrder(
        items.map((i) => ({ product_id: i.product_id, size: i.size, quantity: i.quantity })),
        { email, fullName, promoOptIn: promo, token: getToken() },
      )
      clear()
      setConfirmed(order)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  if (confirmed) {
    return (
      <section className="section order-confirmed">
        <Confetti />
        <div className="container prose">
          <div className="order-party">
            <BulldogAvatar size={96} hat celebrate />
          </div>
          <h1>Order confirmed 🎉</h1>
          <p>{confirmed.message}</p>
          <p className="muted">
            Order #{confirmed.order_id} · Confirmation sent to {confirmed.email}
          </p>
          <ul className="value-list">
            {confirmed.items.map((i) => (
              <li key={`${i.product_id}-${i.size}`}>
                {i.quantity}× {i.name} ({i.size}) — {formatPrice(i.line_total)}
              </li>
            ))}
          </ul>
          <p>
            <strong>Total paid: {formatPrice(confirmed.subtotal)}</strong>
          </p>
          <Link to="/products" className="btn btn-primary">
            Keep shopping
          </Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <p className="eyebrow">Almost there</p>
          <h1>Checkout</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {items.length === 0 ? (
            <div className="placeholder">
              Your cart is empty. <Link to="/products">Browse the collection →</Link>
            </div>
          ) : (
            <div className="cart-layout">
              <form className="checkout-form" onSubmit={submit}>
                <h2>Your details</h2>
                <label>
                  Full name
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </label>
                <label>
                  Email {user && <span className="muted small">(from your account)</span>}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
                <label className="checkbox-row">
                  <input type="checkbox" checked={promo} onChange={(e) => setPromo(e.target.checked)} />
                  <span>Email me Campus Customs news and offers.</span>
                </label>
                {error && <p className="notice error">{error}</p>}
                <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
                  {busy ? 'Placing order…' : `Place order · ${formatPrice(subtotal)}`}
                </button>
                <p className="muted small">This is a class demo — no real payment is taken.</p>
              </form>

              <aside className="cart-summary">
                <h2>Order summary</h2>
                {items.map((i) => (
                  <div key={`${i.product_id}-${i.size}`} className="summary-row">
                    <span>
                      {i.quantity}× {i.name} ({i.size})
                    </span>
                    <strong>{formatPrice(i.price * i.quantity)}</strong>
                  </div>
                ))}
                <div className="summary-row summary-total">
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
