import { Link } from 'react-router-dom'

export default function About() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <p className="eyebrow">About Us</p>
          <h1>A neighborhood shop for every Bulldog</h1>
        </div>
      </section>

      <section className="section">
        <div className="container prose">
          <p>
            Campus Customs started with a simple idea: Yale gear should feel as good as it looks.
            We pick each hoodie, crewneck and tee because we'd happily wear it ourselves, whether
            that's to a 9 a.m. seminar, the Yale–Harvard game, or a reunion years from now.
          </p>
          <p>
            We serve the whole Yale family. That means students settling in on Old Campus, alumni
            who still remember their residential college, and parents who want everyone at home to
            know where their kid goes to school. Every design celebrates a piece of Yale life, from
            varsity teams and residential colleges to the bulldog that's been cheering from the
            sidelines for generations.
          </p>

          <h2>What we stand for</h2>
          <ul className="value-list">
            <li>
              <strong>Pride without pretension.</strong> Classic designs that are easy to wear, not
              stiff or fussy.
            </li>
            <li>
              <strong>Quality you can feel.</strong> Soft fabrics, sturdy stitching, and fits that
              hold up wash after wash.
            </li>
            <li>
              <strong>Straight talk.</strong> Our prices and stock levels are always accurate. If we
              don't have something, we'll tell you.
            </li>
          </ul>

          <h2>Visit us</h2>
          <p>
            You'll find our shop at <strong>57 Broadway, New Haven, CT 06511</strong>, right in the
            middle of campus life. Come in to try on sizes, browse new arrivals, or just say hello.
          </p>

          <Link to="/products" className="btn btn-primary">
            Browse the collection
          </Link>
        </div>
      </section>
    </>
  )
}
