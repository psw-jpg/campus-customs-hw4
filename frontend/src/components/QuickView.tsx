import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice, type Product } from '../api'
import { useCart } from '../cartContext'

// A fast "look without leaving the grid" modal: image, price, size, add-to-cart.
export default function QuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const { add } = useCart()
  const [size, setSize] = useState(product.sizes_available[0] ?? '')
  const [added, setAdded] = useState(false)
  const soldOut = product.sizes_available.length === 0

  const handleAdd = () => {
    if (!size) return
    add({
      product_id: product.product_id,
      name: product.name,
      image_url: product.image_url,
      price: product.price,
      size,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal quickview" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={product.name}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="quickview-image">
          <img src={product.image_url} alt={product.name} />
        </div>
        <div className="quickview-info">
          <p className="product-card-category">{product.category}</p>
          <h2>{product.name}</h2>
          <p className="detail-price">{formatPrice(product.price)}</p>
          <p className="muted">{product.customer_description}</p>

          {soldOut ? (
            <Link to={`/products/${product.product_id}`} className="btn btn-outline btn-block" onClick={onClose}>
              Sold out — see options
            </Link>
          ) : (
            <div className="quickview-buy">
              <select value={size} onChange={(e) => setSize(e.target.value)} aria-label="Size">
                {product.sizes_available.map((s) => (
                  <option key={s} value={s}>
                    Size {s}
                  </option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={handleAdd}>
                {added ? 'Added ✓' : 'Add to cart'}
              </button>
            </div>
          )}
          <Link to={`/products/${product.product_id}`} className="quickview-full" onClick={onClose}>
            View full details →
          </Link>
        </div>
      </div>
    </div>
  )
}
