import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './FoodIdeasPage.css'

interface DatePlan {
  id: string
  dateTimeUtc: string
  title: string
  body: string | null
}

export default function FoodIdeasPage() {
  const { user, loading } = useAuth()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ date?: string; title?: string }>({})
  const [plans, setPlans] = useState<DatePlan[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    fetchPlans()
  }, [user])

  function fetchPlans() {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/datePlans`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setPlans(data))
      .catch(() => {})
  }

  if (loading) return null
  if (!user) return <p className="food-unauth">Sign in to use this page.</p>

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/datePlans/${id}`, { method: 'DELETE' })
      if (res.ok) setPlans(prev => prev.filter(p => p.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const errors: { date?: string; title?: string } = {}
    if (!date) errors.date = 'Date is required.'
    if (!title.trim()) errors.title = 'Thing or Place is required.'
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    const dateTimeUtc = date && time
      ? new Date(`${date}T${time}`).toISOString()
      : new Date(`${date}T00:00`).toISOString()

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/datePlanSubmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateTimeUtc, title, body: body || null }),
      })

      if (res.ok) {
        setSuccess(true)
        setError(false)
        setDate('')
        setTime('')
        setTitle('')
        setBody('')
        fetchPlans()
      } else {
        setError(true)
        setSuccess(false)
      }
    } catch (_e) {
      setError(true)
      setSuccess(false)
    }
  }

  return (
    <div className="food-page">
      <h1>What to Eat?</h1>
      <div className="food-layout">
        <form className="food-form" onSubmit={e => handleSubmit(e).catch(() => { setError(true); setSuccess(false) })}>
          <div className="food-row">
            <label className="food-label">
              Date
              <input
                type="date"
                className={`food-input${fieldErrors.date ? ' food-input-error' : ''}`}
                value={date}
                onChange={e => { setDate(e.target.value); setFieldErrors(f => ({ ...f, date: undefined })) }}
              />
              {fieldErrors.date && <span className="food-field-error">{fieldErrors.date}</span>}
            </label>
            <label className="food-label">
              Time
              <input
                type="time"
                className="food-input"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </label>
          </div>

          <label className="food-label">
            Thing or Place
            <input
              type="text"
              className={`food-input${fieldErrors.title ? ' food-input-error' : ''}`}
              placeholder="e.g. Chicken Salsa at Home"
              value={title}
              onChange={e => { setTitle(e.target.value); setFieldErrors(f => ({ ...f, title: undefined })) }}
            />
            {fieldErrors.title && <span className="food-field-error">{fieldErrors.title}</span>}
          </label>

          <label className="food-label">
            Extra Info
            <textarea
              className="food-textarea"
              placeholder="Loooooooots of chicken!!!"
              rows={5}
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </label>

          <button type="submit" className="food-submit">Submit</button>
          {success && <p className="food-success">Date plan submitted successfully!</p>}
          {error && <p className="food-error">Submission failed. Please try again.</p>}
        </form>

        <div className="food-ideas">
          <h2>Submitted Ideas</h2>
          {plans.length === 0 ? (
            <p className="food-ideas-empty">No ideas yet.</p>
          ) : (
            <ul className="food-ideas-list">
              {plans.map(plan => (
                <li key={plan.id} className="food-idea-card">
                  <div className="food-idea-header">
                    <span className="food-idea-title">{plan.title}</span>
                    <div className="food-idea-header-right">
                      <span className="food-idea-date">{formatDate(plan.dateTimeUtc)}</span>
                      <button
                        className="food-idea-delete"
                        onClick={() => handleDelete(plan.id)}
                        disabled={deletingId === plan.id}
                        aria-label="Delete"
                      >
                        {deletingId === plan.id ? '…' : '×'}
                      </button>
                    </div>
                  </div>
                  {plan.body && <p className="food-idea-body">{plan.body}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}
