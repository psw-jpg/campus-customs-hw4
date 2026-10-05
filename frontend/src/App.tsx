import { useMemo, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import CartCelebration from './components/CartCelebration'
import { ChatContext } from './chatContext'
import { ChatResultsContext, type ChatResult } from './chatResultsContext'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import About from './pages/About'
import Login from './pages/Login'
import CreateAccount from './pages/CreateAccount'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import NotFound from './pages/NotFound'

type ChatTopic = { productId: string; productName: string } | null

export default function App() {
  const [chatOpen, setChatOpen] = useState(false)
  const [chatTopic, setChatTopic] = useState<ChatTopic>(null)
  const [chatResult, setChatResult] = useState<ChatResult | null>(null)

  const chatControls = useMemo(
    () => ({
      openChat: (productId?: string, productName?: string) => {
        if (productId && productName) setChatTopic({ productId, productName })
        setChatOpen(true)
      },
    }),
    [],
  )

  const chatResultsControls = useMemo(
    () => ({
      result: chatResult,
      showResults: (ids: string[], query: string) => setChatResult({ ids, query }),
      clear: () => setChatResult(null),
    }),
    [chatResult],
  )

  return (
    <ChatContext.Provider value={chatControls}>
      <ChatResultsContext.Provider value={chatResultsControls}>
        <div className="app">
          <NavBar />
          <main className="main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:productId" element={<ProductDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <ChatWidget
            open={chatOpen}
            onToggle={() => setChatOpen((o) => !o)}
            context={chatTopic}
            onClearContext={() => setChatTopic(null)}
          />
          <CartCelebration />
        </div>
      </ChatResultsContext.Provider>
    </ChatContext.Provider>
  )
}
