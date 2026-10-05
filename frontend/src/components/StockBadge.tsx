import type { Product } from '../api'

// Summarises stock across all sizes for a product card.
export default function StockBadge({ product }: { product: Product }) {
  const available = product.sizes_available.length
  if (available === 0) return <span className="badge badge-out">Sold out</span>
  if (available < product.inventory.length)
    return <span className="badge badge-low">{available} of {product.inventory.length} sizes</span>
  return <span className="badge badge-in">All sizes</span>
}
