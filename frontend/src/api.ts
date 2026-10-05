// Types and fetch helpers for the FastAPI backend (proxied by Vite at /api and /media).

export type StockStatus = 'in_stock' | 'low_stock' | 'sold_out'

export interface SizeStock {
  size: string
  quantity: number
  status: StockStatus
}

export interface Product {
  product_id: string
  name: string
  garment_type: string
  category: string
  description: string
  customer_description: string
  colors: string[]
  search_tags: string[]
  image_url: string
  price: number
  inventory: SizeStock[]
  total_stock: number
  sizes_available: string[]
}

export interface RelatedProduct {
  product_id: string
  name: string
  image_url: string
  price: number
  total_stock: number
}

export interface ProductDetail extends Product {
  related: RelatedProduct[]
}

export interface ChatProductCard {
  product_id: string
  name: string
  category: string
  price: number
  image_url: string
  total_stock: number
  sizes_available: string[]
}

export interface ChatReply {
  reply: string
  products: ChatProductCard[]
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) throw new Error(`Request failed (${res.status})`)
  return res.json() as Promise<T>
}

export const getProducts = () => request<Product[]>('/api/products')

export const getProduct = (id: string) =>
  request<ProductDetail>(`/api/products/${encodeURIComponent(id)}`)

export interface ChatHistoryItem {
  role: 'user' | 'assistant'
  content: string
}

export const sendChat = (
  message: string,
  opts: {
    productId?: string
    pageContext?: string
    history?: ChatHistoryItem[]
    token?: string | null
  } = {},
) =>
  request<ChatReply>('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: JSON.stringify({
      message,
      product_id: opts.productId ?? null,
      page_context: opts.pageContext ?? null,
      history: opts.history ?? [],
    }),
  })

export interface ChatHistoryMessage {
  role: 'user' | 'assistant'
  content: string
  products: ChatProductCard[]
}

// A signed-in customer's saved conversation, replayed when they return.
export const getChatHistory = (token: string) =>
  request<ChatHistoryMessage[]>('/api/chat/history', {
    headers: { Authorization: `Bearer ${token}` },
  })

export const formatPrice = (price: number) => `$${price.toFixed(2)}`

// ---------- Auth ----------
export interface User {
  id: number
  first_name: string | null
  last_name: string | null
  email: string
  promo_opt_in: boolean
}

interface AuthResult {
  token: string
  user: User
}

export interface SignUpInput {
  first_name: string
  last_name: string
  email: string
  password: string
  promo_opt_in: boolean
}

// Pulls a human-readable message out of FastAPI's error shapes (string or validation array).
async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json()
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail) && data.detail[0]?.msg) return data.detail[0].msg
  } catch {
    /* ignore */
  }
  return fallback
}

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(await errorMessage(res, "We couldn't create your account."))
  return res.json()
}

export async function logIn(email: string, password: string): Promise<AuthResult> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error(await errorMessage(res, 'Incorrect email or password.'))
  return res.json()
}

export async function fetchMe(token: string): Promise<User> {
  const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error('Session expired')
  return res.json()
}

// ---------- Orders & back-in-stock ----------

export interface OrderItemIn {
  product_id: string
  size: string
  quantity: number
}

export interface OrderLine {
  product_id: string
  name: string
  size: string
  quantity: number
  unit_price: number
  line_total: number
}

export interface OrderConfirmation {
  order_id: number
  email: string
  created_at: string
  items: OrderLine[]
  subtotal: number
  message: string
}

// FastAPI's `detail` can be a string or an array (validation / stock problems).
async function detailMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json()
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail)) {
      return data.detail.map((d: { msg?: string } | string) =>
        typeof d === 'string' ? d : (d.msg ?? ''),
      ).filter(Boolean).join(' ')
    }
  } catch {
    /* ignore */
  }
  return fallback
}

export async function placeOrder(
  items: OrderItemIn[],
  opts: { email?: string; fullName?: string; promoOptIn?: boolean; token?: string | null },
): Promise<OrderConfirmation> {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
    },
    body: JSON.stringify({
      items,
      email: opts.email ?? null,
      full_name: opts.fullName ?? null,
      promo_opt_in: opts.promoOptIn ?? false,
    }),
  })
  if (!res.ok) throw new Error(await detailMessage(res, "We couldn't place your order."))
  return res.json()
}

export async function notifyMe(productId: string, size: string, email: string): Promise<string> {
  const res = await fetch('/api/notify-me', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ product_id: productId, size, email }),
  })
  if (!res.ok) throw new Error(await detailMessage(res, "We couldn't sign you up."))
  const data: { message: string } = await res.json()
  return data.message
}
