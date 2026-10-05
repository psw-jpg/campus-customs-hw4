import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../api'

// Rotating hero of featured products. Each slide links to its single-product page.
export default function HeroCarousel({ items }: { items: Product[] }) {
  const [index, setIndex] = useState(0)
  const timer = useRef<number | null>(null)

  const go = (i: number) => setIndex((i + items.length) % items.length)

  // Auto-advance every 4.5s; pause on hover/focus.
  const start = () => {
    stop()
    if (items.length > 1) timer.current = window.setInterval(() => setIndex((i) => (i + 1) % items.length), 4500)
  }
  const stop = () => {
    if (timer.current) window.clearInterval(timer.current)
  }
  useEffect(() => {
    start()
    return stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

  if (items.length === 0) return <div className="hero-carousel skeleton" style={{ aspectRatio: '1' }} />

  return (
    <div className="hero-carousel" onMouseEnter={stop} onMouseLeave={start}>
      <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {items.map((p) => (
          <Link key={p.product_id} to={`/products/${p.product_id}`} className="carousel-slide">
            <img src={p.image_url} alt={p.name} />
            <span className="carousel-caption">{p.name}</span>
          </Link>
        ))}
      </div>

      <button className="carousel-arrow prev" onClick={() => go(index - 1)} aria-label="Previous">
        ‹
      </button>
      <button className="carousel-arrow next" onClick={() => go(index + 1)} aria-label="Next">
        ›
      </button>

      <div className="carousel-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={i === index ? 'dot active' : 'dot'}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
