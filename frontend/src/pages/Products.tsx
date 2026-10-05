import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, type Product } from '../api'
import ProductCard from '../components/ProductCard'
import { useChatResults } from '../chatResultsContext'

type SortKey = 'name' | 'price-asc' | 'price-desc'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('name')
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? 'All'
  const { result: chatResult, clear: clearChatResult } = useChatResults()

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError("We couldn't load products. Is the backend running?"))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category))).sort()],
    [products],
  )

  // When a chat search is active, show exactly those products (in the agent's order),
  // looked up from the full catalogue so the cards and stock badges are complete.
  const chatProducts = useMemo(() => {
    if (!chatResult) return null
    const byId = new Map(products.map((p) => [p.product_id, p]))
    return chatResult.ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p))
  }, [chatResult, products])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = products.filter((p) => {
      if (category !== 'All' && p.category !== category) return false
      if (!q) return true
      const haystack = [p.name, p.garment_type, p.description, ...p.colors, ...p.search_tags]
        .join(' ')
        .toLowerCase()
      return q.split(/\s+/).every((word) => haystack.includes(word))
    })
    return filtered.sort((a, b) =>
      sort === 'price-asc'
        ? a.price - b.price
        : sort === 'price-desc'
          ? b.price - a.price
          : a.name.localeCompare(b.name),
    )
  }, [products, category, search, sort])

  // Manual browsing (search box, category, sort) takes over from a chat search.
  const leaveChatResults = () => {
    if (chatResult) clearChatResult()
  }
  const pickCategory = (c: string) => {
    leaveChatResults()
    setParams(c === 'All' ? {} : { category: c })
  }

  const showingChat = chatProducts !== null

  return (
    <>
      <section className="page-header">
        <div className="container">
          <p className="eyebrow">Shop</p>
          <h1>{showingChat ? 'Chat results' : category === 'All' ? 'All Products' : category}</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {showingChat && (
            <div className="chat-results-banner">
              <span>
                Showing matches for <strong>“{chatResult?.query}”</strong> from your chat.
              </span>
              <button className="btn btn-primary" onClick={clearChatResult}>
                Show all products
              </button>
            </div>
          )}

          <div className="shop-toolbar">
            <input
              type="search"
              className="search-input"
              placeholder="Search by name, color, sport, college…"
              value={search}
              onChange={(e) => {
                leaveChatResults()
                setSearch(e.target.value)
              }}
              aria-label="Search products"
            />
            <select
              className="sort-select"
              value={sort}
              onChange={(e) => {
                leaveChatResults()
                setSort(e.target.value as SortKey)
              }}
              aria-label="Sort products"
            >
              <option value="name">Sort: Name A–Z</option>
              <option value="price-asc">Sort: Price low to high</option>
              <option value="price-desc">Sort: Price high to low</option>
            </select>
          </div>

          {!showingChat && (
            <div className="chip-row">
              {categories.map((c) => (
                <button
                  key={c}
                  className={c === category ? 'chip active' : 'chip'}
                  onClick={() => pickCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="product-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="product-card skeleton-card">
                  <div className="skeleton skeleton-image" />
                  <div className="skeleton-card-body">
                    <div className="skeleton skeleton-line short" />
                    <div className="skeleton skeleton-line" />
                    <div className="skeleton skeleton-line price" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {error && <div className="placeholder error">{error}</div>}
          {!loading && !error && (() => {
            const items = showingChat ? (chatProducts as Product[]) : visible
            return (
              <>
                <p className="result-count">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
                {items.length === 0 ? (
                  <div className="placeholder">
                    {showingChat
                      ? 'No matching products to show.'
                      : 'No products match that search. Try a different word.'}
                  </div>
                ) : (
                  <div className="product-grid">
                    {items.map((p) => (
                      <ProductCard key={p.product_id} product={p} />
                    ))}
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </section>
    </>
  )
}
