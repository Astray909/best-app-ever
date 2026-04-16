import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import './FoodIdeasPage.css'

interface DatePlan {
  id: string
  dateTimeUtc: string
  title: string
  body: string | null
}

interface EditState {
  id: string
  date: string
  time: string
  title: string
  body: string
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
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<EditState | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [editError, setEditError] = useState(false)

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'datePlans'), orderBy('dateTimeUtc', 'asc'))
    const unsubscribe = onSnapshot(q, snapshot => {
      setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DatePlan)))
    })
    return unsubscribe
  }, [user])

  if (loading) return null
  if (!user) return <p className="food-unauth">Sign in to use this page.</p>

  function openEdit(plan: DatePlan) {
    const { date: d, time: t } = parseIso(plan.dateTimeUtc)
    setEditing({ id: plan.id, date: d, time: t, title: plan.title, body: plan.body ?? '' })
    setEditError(false)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/datePlans/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPlans(prev => prev.filter(p => p.id !== id))
        if (editing?.id === id) setEditing(null)
      }
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSave() {
    if (!editing) return
    const { id, date: d, time: t, title: ttl, body: b } = editing
    const dateTimeUtc = d && t
      ? new Date(`${d}T${t}`).toISOString()
      : new Date(`${d}T00:00`).toISOString()
    setSavingId(id)
    setEditError(false)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/datePlans/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateTimeUtc, title: ttl, body: b || null }),
      })
      if (res.ok) {
        setEditing(null)
      } else {
        setEditError(true)
      }
    } catch {
      setEditError(true)
    } finally {
      setSavingId(null)
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
      } else {
        setError(true)
        setSuccess(false)
      }
    } catch {
      setError(true)
      setSuccess(false)
    }
  }

  return (
    <div className="food-page">
      <h1>What to Eat?</h1>

      <div className="food-form-section">
        <button
          className="food-form-toggle"
          onClick={() => setFormOpen(o => !o)}
          aria-expanded={formOpen}
        >
          <span>Submit an Idea</span>
          <span className={`food-form-toggle-arrow${formOpen ? ' open' : ''}`}>▾</span>
        </button>
        {formOpen && (
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
              Notes
              <textarea
                className="food-textarea"
                placeholder="Loooooooots of chicken!!!"
                rows={4}
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </label>
            <button type="submit" className="food-submit">Submit</button>
            {success && <p className="food-success">Date plan submitted!</p>}
            {error && <p className="food-error">Submission failed. Please try again.</p>}
          </form>
        )}
      </div>

      <div className="food-ideas">
        <h2>Submitted Ideas</h2>
        {plans.length === 0 ? (
          <p className="food-ideas-empty">No ideas yet.</p>
        ) : (
          <ul className="food-ideas-list">
            {plans.map(plan => {
              const isEditing = editing?.id === plan.id
              return (
                <li key={plan.id} className={`food-idea-card${isEditing ? ' editing' : ''}`}>
                  {isEditing ? (
                    <div className="food-idea-edit">
                      <div className="food-row">
                        <label className="food-label">
                          Date
                          <input
                            type="date"
                            className="food-input"
                            value={editing.date}
                            onChange={e => setEditing(s => s && ({ ...s, date: e.target.value }))}
                          />
                        </label>
                        <label className="food-label">
                          Time
                          <input
                            type="time"
                            className="food-input"
                            value={editing.time}
                            onChange={e => setEditing(s => s && ({ ...s, time: e.target.value }))}
                          />
                        </label>
                      </div>
                      <label className="food-label">
                        Thing or Place
                        <input
                          type="text"
                          className="food-input"
                          value={editing.title}
                          onChange={e => setEditing(s => s && ({ ...s, title: e.target.value }))}
                        />
                      </label>
                      <label className="food-label">
                        Notes
                        <textarea
                          className="food-textarea"
                          rows={3}
                          value={editing.body}
                          onChange={e => setEditing(s => s && ({ ...s, body: e.target.value }))}
                        />
                      </label>
                      <div className="food-idea-actions">
                        <button
                          className="food-submit"
                          onClick={handleSave}
                          disabled={!!savingId}
                        >
                          {savingId === plan.id ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          className="food-idea-cancel"
                          onClick={() => setEditing(null)}
                          disabled={!!savingId}
                        >
                          Cancel
                        </button>
                        <button
                          className="food-idea-delete-btn"
                          onClick={() => handleDelete(plan.id)}
                          disabled={!!deletingId}
                        >
                          {deletingId === plan.id ? 'Deleting…' : 'Delete'}
                        </button>
                        {editError && <span className="food-error">Save failed.</span>}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="food-idea-view"
                      onClick={() => openEdit(plan)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openEdit(plan) }}
                    >
                      <div className="food-idea-header">
                        <span className="food-idea-title">{plan.title}</span>
                        <span className="food-idea-date">{formatDate(plan.dateTimeUtc)}</span>
                      </div>
                      {plan.body && <p className="food-idea-body">{plan.body}</p>}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function parseIso(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return { date: '', time: '' }
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}
