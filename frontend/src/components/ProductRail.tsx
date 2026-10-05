import { useRef } from 'react'
import type { Product } from '../api'
import ProductCard from './ProductCard'

// A horizontal, swipeable row of product cards with prev/next arrows.
export default function ProductRail({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 520), behavior: 'smooth' })
  }

  return (
    <div className="rail">
      <button className="rail-arrow prev" onClick={() => scrollBy(-1)} aria-label="Scroll left">
        ‹
      </button>
      <div className="rail-track" ref={trackRef}>
        {products.map((p) => (
          <div key={p.product_id} className="rail-item">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      <button className="rail-arrow next" onClick={() => scrollBy(1)} aria-label="Scroll right">
        ›
      </button>
    </div>
  )
}
