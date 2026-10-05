import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { formatPrice, getProduct, type ProductDetail as Detail, type SizeStock } from '../api'
import { useChat } from '../chatContext'
import { useCart } from '../cartContext'
import NotifyMe from '../components/NotifyMe'

const statusLabel = (s: SizeStock) =>
  s.status === 'sold_out' ? 'Sold out' : s.status === 'low_stock' ? `Only ${s.quantity} left` : 'In stock'

// Remount on product change so state (loaded product, selected size) starts fresh.
export default function ProductDetail() {
  const { productId = '' } = useParams()
  return <ProductView key={productId} productId={productId} />
}

function ProductView({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Detail | null>(null)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [added, setAdded] = useState(false)
  const [showSticky, setShowSticky] = useState(false)
  const { openChat } = useChat()
  const { add } = useCart()

  useEffect(() => {
    getProduct(productId)
      .then(setProduct)
      .catch(() => setError("We couldn't find that product."))
  }, [productId])

  // Show the sticky buy bar once the customer scrolls past the main buy button.
  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 520)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const addToCart = (sizeToAdd: string) => {
    if (!product || !sizeToAdd) return
    add({
      product_id: product.product_id,
      name: product.name,
      image_url: product.image_url,
      price: product.price,
      size: sizeToAdd,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  if (error)
    return (
      <section className="section">
        <div className="container prose">
          <h1>Product not found</h1>
          <p>{error}</p>
          <Link to="/products" className="btn btn-primary">
            Back to all products
          </Link>
        </div>
      </section>
    )
  if (!product)
    return (
      <section className="section">
        <div className="container">
          <div className="detail-layout">
            <div className="skeleton skeleton-detail-image" />
            <div className="detail-info">
              <div className="skeleton skeleton-line short" />
              <div className="skeleton skeleton-line title" />
              <div className="skeleton skeleton-line price" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line short" />
            </div>
          </div>
        </div>
      </section>
    )

  const selectedSize = product.inventory.find((s) => s.size === selected)

  return (
    <section className="section">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/products">Products</Link> ›{' '}
          <Link to={`/products?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> ›{' '}
          <span>{product.name}</span>
        </nav>

        <div className="detail-layout">
          <div className="detail-image">
            <img src={product.image_url} alt={product.name} />
          </div>

          <div className="detail-info">
            <p className="product-card-category">{product.category}</p>
            <h1>{product.name}</h1>
            <p className="detail-price">{formatPrice(product.price)}</p>

            <p className="detail-description">{product.customer_description}</p>

            <div className="detail-block">
              <h3>Colors</h3>
              <div className="color-list">
                {product.colors.map((c) => (
                  <span key={c} className="color-pill">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="detail-block">
              <h3>
                Size &amp; availability
                <span className="muted small-inline">
                  {' '}
                  · {product.sizes_available.length} of {product.inventory.length} sizes in stock
                </span>
              </h3>
              <div className="size-grid">
                {product.inventory.map((s) => (
                  <button
                    key={s.size}
                    className={`size-btn ${s.status}${selected === s.size ? ' selected' : ''}`}
                    disabled={s.status === 'sold_out'}
                    onClick={() => setSelected(s.size)}
                    title={statusLabel(s)}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
              <p className="size-status">
                {selectedSize
                  ? `Size ${selectedSize.size}: ${statusLabel(selectedSize)}`
                  : 'Pick a size to see how many are left.'}
              </p>
            </div>

            <ul className="detail-facts">
              <li>
                <strong>Style:</strong> {product.garment_type}
              </li>
              <li>
                <strong>Officially licensed</strong> Yale merchandise
              </li>
              <li>
                <strong>Try it on</strong> at 57 Broadway, New Haven
              </li>
            </ul>

            <div className="detail-cta">
              {selectedSize && selectedSize.status === 'sold_out' ? (
                <NotifyMe productId={product.product_id} size={selectedSize.size} />
              ) : (
                <button
                  className="btn btn-primary btn-block"
                  disabled={!selectedSize}
                  onClick={() => selectedSize && addToCart(selectedSize.size)}
                >
                  {!selectedSize ? 'Select a size' : added ? 'Added to cart ✓' : 'Add to cart'}
                </button>
              )}
              <button className="btn btn-outline btn-block" onClick={() => openChat(product.product_id, product.name)}>
                💬 Ask about this item
              </button>
            </div>
          </div>
        </div>

        {product.related.length > 0 && (
          <div className="related">
            <h2 className="section-title">More {product.category.toLowerCase()}</h2>
            <div className="related-grid">
              {product.related.map((r) => (
                <Link key={r.product_id} to={`/products/${r.product_id}`} className="related-card">
                  <img src={r.image_url} alt={r.name} loading="lazy" />
                  <span>{r.name}</span>
                  <strong>{formatPrice(r.price)}</strong>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky buy bar: keeps the purchase action one click away as the customer scrolls. */}
      <div className={`sticky-buy${showSticky ? ' show' : ''}`}>
        <div className="container sticky-buy-inner">
          <div className="sticky-buy-info">
            <img src={product.image_url} alt="" />
            <div>
              <strong>{product.name}</strong>
              <span className="price">{formatPrice(product.price)}</span>
            </div>
          </div>
          <div className="sticky-buy-actions">
            <select
              value={selected ?? ''}
              onChange={(e) => setSelected(e.target.value)}
              aria-label="Choose a size"
            >
              <option value="" disabled>
                Size
              </option>
              {product.inventory.map((s) => (
                <option key={s.size} value={s.size} disabled={s.status === 'sold_out'}>
                  {s.size}
                  {s.status === 'sold_out' ? ' — sold out' : ''}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary"
              disabled={!selectedSize || selectedSize.status === 'sold_out'}
              onClick={() => selectedSize && addToCart(selectedSize.size)}
            >
              {added ? 'Added ✓' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
