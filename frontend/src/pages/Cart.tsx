import { Link, useNavigate } from 'react-router-dom'
import { formatPrice } from '../api'
import { useCart } from '../cartContext'

export default function Cart() {
  const { items, subtotal, setQuantity, remove } = useCart()
  const navigate = useNavigate()

  return (
    <>
      <section className="page-header">
        <div className="container">
          <p className="eyebrow">Your bag</p>
          <h1>Shopping Cart</h1>
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
              <div className="cart-items">
                {items.map((item) => (
                  <div key={`${item.product_id}-${item.size}`} className="cart-row">
                    <Link to={`/products/${item.product_id}`} className="cart-thumb">
                      <img src={item.image_url} alt={item.name} />
                    </Link>
                    <div className="cart-info">
                      <Link to={`/products/${item.product_id}`}>
                        <strong>{item.name}</strong>
                      </Link>
                      <span className="muted">Size {item.size}</span>
                      <span className="price">{formatPrice(item.price)}</span>
                    </div>
                    <div className="cart-qty">
                      <label>
                        Qty
                        <input
                          type="number"
                          min={1}
                          max={25}
                          value={item.quantity}
                          onChange={(e) =>
                            setQuantity(item.product_id, item.size, Number(e.target.value))
                          }
                        />
                      </label>
                      <button className="link-btn" onClick={() => remove(item.product_id, item.size)}>
                        Remove
                      </button>
                    </div>
                    <div className="cart-line-total">{formatPrice(item.price * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <aside className="cart-summary">
                <h2>Order summary</h2>
                <div className="summary-row">
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <p className="muted small">Shipping and tax calculated at checkout.</p>
                <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
                  Checkout
                </button>
                <Link to="/products" className="muted small continue-link">
                  ← Continue shopping
                </Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
