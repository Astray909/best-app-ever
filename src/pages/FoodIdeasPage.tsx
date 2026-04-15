import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './FoodIdeasPage.css'

export default function FoodIdeasPage() {
  const { user, loading } = useAuth()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ date?: string; title?: string }>({})

  if (loading) return null
  if (!user) return <p className="food-unauth">Sign in to use this page.</p>

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
      : null

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/datePlanSubmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateTimeUtc, title, body }),
      })

      if (res.ok) {
        setSuccess(true)
        setError(false)
        setDate('')
        setTime('')
        setTitle('')
        setBody('')
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
    </div>
  )
}
