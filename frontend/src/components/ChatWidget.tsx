import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { formatPrice, getChatHistory, sendChat, type ChatHistoryItem, type ChatProductCard } from '../api'
import { getToken, useAuth } from '../authContext'
import { useChatResults } from '../chatResultsContext'
import BulldogAvatar from './BulldogAvatar'

// Describe the current page so the agent knows what "this" or "here" refers to.
function describePage(pathname: string, search: string): { productId?: string; pageContext: string } {
  const productMatch = pathname.match(/^\/products\/(.+)$/)
  if (productMatch) {
    return { productId: productMatch[1], pageContext: 'a product page for a specific item' }
  }
  if (pathname === '/products') {
    const category = new URLSearchParams(search).get('category')
    return {
      pageContext: category
        ? `the Products page, browsing the ${category} category`
        : 'the Products page (all products)',
    }
  }
  const labels: Record<string, string> = {
    '/': 'the Campus Customs home page',
    '/about': 'the About Us page',
    '/login': 'the login page',
    '/create-account': 'the create account page',
  }
  return { pageContext: labels[pathname] ?? `the ${pathname} page` }
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  products?: ChatProductCard[]
}

interface Props {
  open: boolean
  onToggle: () => void
  // Product the customer is asking about (set by "Ask about this item").
  context: { productId: string; productName: string } | null
  onClearContext: () => void
}

const WELCOME: Message = {
  role: 'assistant',
  content: "Hi! I'm the Campus Customs assistant. Ask me about our gear, prices, or what's in stock.",
}

export default function ChatWidget({ open, onToggle, context, onClearContext }: Props) {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { showResults } = useChatResults()
  const { user } = useAuth()

  // When a customer logs in, bring their saved conversation back; on logout, start fresh.
  useEffect(() => {
    const token = getToken()
    if (!user || !token) {
      setMessages([WELCOME])
      return
    }
    getChatHistory(token)
      .then((saved) => {
        const restored: Message[] = saved.map((m) => ({
          role: m.role,
          content: m.content,
          products: m.products,
        }))
        setMessages(restored.length ? [WELCOME, ...restored] : [WELCOME])
      })
      .catch(() => setMessages([WELCOME]))
  }, [user])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open, context])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    setSending(true)
    // Guests send their on-screen conversation so the agent has context; logged-in
    // users have history loaded server-side, so we only need their token.
    const token = getToken()
    const history: ChatHistoryItem[] = token
      ? []
      : messages
          .filter((m) => m !== WELCOME)
          .map((m) => ({ role: m.role, content: m.content }))
    // Tell the agent which page the customer is on (and the product, if they're on one),
    // so "is this in stock?" or "what am I looking at?" resolves correctly.
    const page = describePage(location.pathname, location.search)
    const productId = context?.productId ?? page.productId
    try {
      const res = await sendChat(text, { productId, pageContext: page.pageContext, history, token })
      setMessages((m) => [...m, { role: 'assistant', content: res.reply, products: res.products }])
      // Dynamically update the page: show the agent's matches as product cards on the
      // Products page. Cards still link to each item's single-item page.
      if (res.products.length > 0) {
        showResults(res.products.map((p) => p.product_id), text)
        navigate('/products')
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: "Sorry, I couldn't reach the shop's server. Please try again shortly." },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="chat-root">
      {open && (
        <section className="chat-panel" aria-label="Shopping assistant chat">
          <header className="chat-header">
            <BulldogAvatar size={40} />
            <div>
              <strong>Handsome Dan</strong>
              <small>Your Campus Customs guide</small>
            </div>
            <button className="chat-close" onClick={onToggle} aria-label="Close chat">
              ×
            </button>
          </header>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                {m.role === 'assistant' && (
                  <div className="chat-avatar">
                    <BulldogAvatar size={28} />
                  </div>
                )}
                <div className="chat-bubble-wrap">
                  <div className="chat-bubble">{m.content}</div>
                  {m.products && m.products.length > 0 && (
                    <div className="chat-products">
                      {m.products.map((p) => (
                        <Link key={p.product_id} to={`/products/${p.product_id}`} className="chat-product">
                          <img src={p.image_url} alt={p.name} />
                          <span>{p.name}</span>
                          <strong>{formatPrice(p.price)}</strong>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="chat-msg assistant thinking-row" aria-label="Handsome Dan is thinking">
                <div className="chat-avatar">
                  <BulldogAvatar size={40} thinking />
                </div>
                <span className="thinking-text">Handsome Dan is thinking…</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {context && (
            <div className="chat-context">
              Asking about <strong>{context.productName}</strong>
              <button onClick={onClearContext} aria-label="Stop asking about this item">
                ×
              </button>
            </div>
          )}

          <form className="chat-input" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about hoodies, sizes, prices…"
              aria-label="Chat message"
            />
            <button type="submit" disabled={!input.trim() || sending} aria-label="Send">
              ➤
            </button>
          </form>
        </section>
      )}

      <button
        className={`chat-launcher${open ? ' open' : ''}`}
        onClick={onToggle}
        aria-label={open ? 'Close chat' : 'Chat with Handsome Dan'}
      >
        {open ? <span className="chat-launcher-x">×</span> : <BulldogAvatar size={60} animated />}
        {!open && <span className="chat-launcher-hint">Hi! 🐾</span>}
      </button>
    </div>
  )
}
