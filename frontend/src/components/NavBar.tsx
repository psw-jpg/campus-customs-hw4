import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../authContext'
import { useCart } from '../cartContext'

const mainLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About Us' },
]

export default function NavBar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const close = () => setOpen(false)
  const handleLogout = () => {
    logout()
    close()
    navigate('/')
  }
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-link active' : 'nav-link'

  return (
    <header className="navbar">
      <div className="promo-strip">Bulldog pride, made in New Haven — visit us at 57 Broadway</div>
      <nav className="nav-inner" aria-label="Main navigation">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">Y</span>
          <span className="brand-text">
            <strong>Campus Customs</strong>
            <small>Yale Bulldog Blue</small>
          </span>
        </Link>

        <button
          className="menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>

        <div className={open ? 'nav-links open' : 'nav-links'}>
          <ul className="nav-main">
            {mainLinks.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.end} className={linkClass} onClick={close}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <ul className="nav-account">
            <li>
              <NavLink to="/cart" className="nav-cart" onClick={close} aria-label="Cart">
                🛒 Cart
                {count > 0 && <span className="cart-badge">{count}</span>}
              </NavLink>
            </li>
            {user ? (
              <>
                <li className="nav-greeting">Hi, {user.first_name ?? 'there'}</li>
                <li>
                  <button className="nav-cta" onClick={handleLogout}>
                    Log Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink to="/login" className={linkClass} onClick={close}>
                    Log In
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/create-account" className="nav-cta" onClick={close}>
                    Create Account
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </header>
  )
}
