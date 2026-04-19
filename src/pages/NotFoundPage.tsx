import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <span className="not-found-code">404</span>
      <h1>Page not found</h1>
      <p>This page doesn't exist yet.</p>
      <Link to="/home" className="not-found-link">Go home</Link>
    </div>
  )
}
