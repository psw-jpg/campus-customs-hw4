import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="section">
      <div className="container prose">
        <h1>Page not found</h1>
        <p>This page doesn't exist. Let's get you back to the good stuff.</p>
        <Link to="/" className="btn btn-primary">
          Back home
        </Link>
      </div>
    </section>
  )
}
