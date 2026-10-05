import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <strong>Campus Customs</strong>
          <p>Yale gear for students, alumni, families, and every Bulldog in between.</p>
        </div>
        <div>
          <strong>Come say hello</strong>
          <p>57 Broadway, New Haven, CT 06511</p>
        </div>
        <div>
          <strong>Explore</strong>
          <p>
            <Link to="/products">Shop all</Link> · <Link to="/about">Our story</Link>
          </p>
        </div>
      </div>
      <p className="footer-legal">© 2026 Campus Customs. Class project demo.</p>
    </footer>
  )
}
