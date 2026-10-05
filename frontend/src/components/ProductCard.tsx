import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice, type Product } from '../api'
import { useCart } from '../cartContext'
import StockBadge from './StockBadge'
import QuickView from './QuickView'

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const [size, setSize] = useState(product.sizes_available[0] ?? '')
  const [added, setAdded] = useState(false)
  const [quickView, setQuickView] = useState(false)
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
    <div className="product-card">
      {/* Image + info navigate to the single-item page; the action row does not. */}
      <Link to={`/products/${product.product_id}`} className="product-card-media">
        <div className="product-card-image">
          <img src={product.image_url} alt={product.name} loading="lazy" />
          <button
            className="quickview-btn"
            onClick={(e) => {
              e.preventDefault()
              setQuickView(true)
            }}
          >
            Quick view
          </button>
        </div>
        <div className="product-card-body">
          <p className="product-card-category">{product.category}</p>
          <h3>{product.name}</h3>
          <div className="product-card-footer">
            <span className="price">{formatPrice(product.price)}</span>
            <StockBadge product={product} />
          </div>
        </div>
      </Link>

      <div className="product-card-actions">
        {soldOut ? (
          <Link to={`/products/${product.product_id}`} className="btn btn-outline btn-sm btn-block">
            Sold out — notify me
          </Link>
        ) : (
          <div className="quick-add">
            <select
              aria-label={`Size for ${product.name}`}
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              {product.sizes_available.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>
              {added ? 'Added ✓' : 'Add'}
            </button>
          </div>
        )}
      </div>

      {quickView && <QuickView product={product} onClose={() => setQuickView(false)} />}
    </div>
  )
}
