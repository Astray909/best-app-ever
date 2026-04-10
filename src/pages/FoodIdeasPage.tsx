import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import './FoodIdeasPage.css'

export default function FoodIdeasPage() {
  const { user, loading } = useAuth()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  if (loading) return null
  if (!user) return <p className="food-unauth">Sign in to use this page.</p>

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const dateTimeUtc = date && time
      ? new Date(`${date}T${time}`).toISOString()
      : null

    await fetch(`${import.meta.env.VITE_API_BASE_URL}/datePlanSubmit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dateTimeUtc, title, body }),
    })
  }

  return (
    <div className="food-page">
      <h1>What to Eat?</h1>
      <form className="food-form" onSubmit={handleSubmit}>
        <div className="food-row">
          <label className="food-label">
            Date
            <input
              type="date"
              className="food-input"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
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
          Title
          <input
            type="text"
            className="food-input"
            placeholder="e.g. Dinner at Nobu"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </label>

        <label className="food-label">
          Notes
          <textarea
            className="food-textarea"
            placeholder="What are you thinking?"
            rows={5}
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </label>

        <button type="submit" className="food-submit">Submit</button>
      </form>
    </div>
  )
}
