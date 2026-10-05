import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, type Product } from '../api'
import Reveal from '../components/Reveal'
import HeroCarousel from '../components/HeroCarousel'
import GameCountdown from '../components/GameCountdown'
import ProductRail from '../components/ProductRail'

const categories = [
  { label: 'Hoodies', category: 'Hoodies', blurb: 'Your go-to layer for late nights at Sterling' },
  { label: 'Crewnecks', category: 'Crewnecks & Sweatshirts', blurb: 'Classic sweatshirts that go with everything' },
  { label: 'T-Shirts', category: 'T-Shirts', blurb: 'Easy tees for game days and every other day' },
  { label: 'Quarter-Zips', category: 'Quarter-Zips', blurb: 'Smart enough for class, comfy enough for the couch' },
  { label: 'Fleece & Jackets', category: 'Jackets & Fleece', blurb: 'Warm outer layers for a New England winter' },
]

const promises = [
  { title: 'Officially licensed', text: 'Real Yale marks on every item, done properly.' },
  { title: 'Sizes XS to XXL', text: 'Every style comes in six sizes, with live stock for each.' },
  { title: 'Honest answers', text: 'Ask our shopping assistant about price or stock and get a straight answer.' },
]

// Five well-stocked products (one per category) for the hero carousel.
const CAROUSEL_IDS = [
  'tri-blend-sports-football-t-shirt',
  'branford-1-4-zip',
  'district-vit-crewneck-vintage-bulldog',
  'divinity-school-fleece-sweater',
  'champion-reverse-weave-hoodie-1',
]

// Terms that mark an item as Harvard–Yale / game-day gear.
const GAME_TERMS = ['harvard', 'the game', 'football', 'gameday', 'game day', 'boola']

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
  }, [])

  const carousel = useMemo(() => {
    const byId = new Map(products.map((p) => [p.product_id, p]))
    return CAROUSEL_IDS.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p))
  }, [products])

  const gameGear = useMemo(
    () =>
      products.filter((p) => {
        const hay = [p.name, p.description, ...p.search_tags].join(' ').toLowerCase()
        return p.total_stock > 0 && GAME_TERMS.some((t) => hay.includes(t))
      }),
    [products],
  )

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">Made in New Haven</p>
            <h1>
              Comfortable clothes.
              <br />
              Lifelong Bulldog pride.
            </h1>
            <p className="hero-sub">
              Hoodies, crewnecks, tees and layers for students, alumni, parents, and anyone
              who's ever shouted “Boola Boola.” Find your next favorite piece of Yale gear.
            </p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-light">
                Shop the collection
              </Link>
              <Link to="/about" className="btn btn-outline-light">
                Meet the shop
              </Link>
            </div>
          </div>
          <div className="hero-media">
            <HeroCarousel items={carousel} />
          </div>
        </div>
      </section>

      {/* The Game countdown — bold full-width band + related gear rail */}
      <section className="game-section">
        <div className="game-banner">
          <div className="container">
            <p className="game-kicker">🏈 Harvard vs. Yale · The Game</p>
            <h2 className="game-title">Kickoff is coming</h2>
            <GameCountdown />
            <p className="game-sub">Gear up before game day and wear your Bulldog pride loud.</p>
          </div>
        </div>
        {gameGear.length > 0 && (
          <div className="container game-gear">
            <h3 className="section-title">Shop Game Day gear</h3>
            <ProductRail products={gameGear} />
          </div>
        )}
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <h2 className="section-title">Shop by style</h2>
          </Reveal>
          <div className="category-grid">
            {categories.map((c, i) => (
              <Reveal key={c.label} delay={i * 70}>
                <Link
                  to={`/products?category=${encodeURIComponent(c.category)}`}
                  className="category-card"
                >
                  <h3>{c.label}</h3>
                  <p>{c.blurb}</p>
                  <span className="card-link">Browse →</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container promise-grid">
          {promises.map((p, i) => (
            <Reveal key={p.title} delay={i * 70}>
              <div className="promise">
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section">
        <Reveal>
          <div className="container visit-banner">
            <div>
              <h2>Stop by the shop</h2>
              <p>
                Come try things on at 57 Broadway, a short walk from Old Campus. If you'd rather stay
                in, our online store has the same gear.
              </p>
            </div>
            <Link to="/about" className="btn btn-primary">
              Plan your visit
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
