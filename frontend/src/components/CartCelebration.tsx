import { useEffect, useState } from 'react'
import { useCart } from '../cartContext'
import BulldogAvatar from './BulldogAvatar'

// A brief toast where Handsome Dan celebrates each add-to-cart.
export default function CartCelebration() {
  const { celebration, clearCelebration } = useCart()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!celebration) return
    setShow(true)
    const hide = setTimeout(() => setShow(false), 2200)
    const clear = setTimeout(clearCelebration, 2500)
    return () => {
      clearTimeout(hide)
      clearTimeout(clear)
    }
  }, [celebration, clearCelebration])

  if (!celebration) return null

  return (
    <div className={`cart-celebration${show ? ' show' : ''}`} role="status">
      <BulldogAvatar size={48} celebrate />
      <div>
        <strong>Added to cart! 🎉</strong>
        <span>{celebration.name}</span>
      </div>
    </div>
  )
}
