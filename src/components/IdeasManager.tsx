import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase-firestore'
import './IdeasManager.css'

export type IdeaType = 'eat' | 'do'

interface DatePlan {
  id: string
  dateTimeUtc: string
  title: string
  body: string | null
  type?: IdeaType
}

interface EditState {
  id: string
  date: string
  time: string
  title: string
  body: string
}

interface IdeasManagerProps {
  pageTitle: string
  ideaType: IdeaType
  submitToggleLabel: string
  titleLabel: string
  titlePlaceholder: string
  notesPlaceholder: string
  titleRequiredMessage: string
}

// Existing entries without a `type` field were created before the eat/do split,
// when the page was food-only. Treat them as 'eat' so they don't disappear.
function matchesType(plan: DatePlan, type: IdeaType): boolean {
  if (plan.type) return plan.type === type
  return type === 'eat'
}

export default function IdeasManager({
  pageTitle,
  ideaType,
  submitToggleLabel,
  titleLabel,
  titlePlaceholder,
  notesPlaceholder,
  titleRequiredMessage,
}: IdeasManagerProps) {
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
  if (!user) return <p className="ideas-unauth">Sign in to use this page.</p>

  const visiblePlans = plans.filter(p => matchesType(p, ideaType))

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
        body: JSON.stringify({ dateTimeUtc, title: ttl, body: b || null, type: ideaType }),
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
    if (!title.trim()) errors.title = titleRequiredMessage
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
        body: JSON.stringify({ dateTimeUtc, title, body: body || null, type: ideaType }),
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
    <div className="ideas-page">
      <h1>{pageTitle}</h1>

      <div className="ideas-form-section">
        <button
          className="ideas-form-toggle"
          onClick={() => setFormOpen(o => !o)}
          aria-expanded={formOpen}
        >
          <span>{submitToggleLabel}</span>
          <span className={`ideas-form-toggle-arrow${formOpen ? ' open' : ''}`}>▾</span>
        </button>
        {formOpen && (
          <form className="ideas-form" onSubmit={e => handleSubmit(e).catch(() => { setError(true); setSuccess(false) })}>
            <div className="ideas-row">
              <label className="ideas-label">
                Date
                <input
                  type="date"
                  className={`ideas-input${fieldErrors.date ? ' ideas-input-error' : ''}`}
                  value={date}
                  onChange={e => { setDate(e.target.value); setFieldErrors(f => ({ ...f, date: undefined })) }}
                />
                {fieldErrors.date && <span className="ideas-field-error">{fieldErrors.date}</span>}
              </label>
            </div>
            <div className="ideas-row">
              <label className="ideas-label">
                Time
                <input
                  type="time"
                  className="ideas-input"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                />
              </label>
            </div>
            <label className="ideas-label">
              {titleLabel}
              <input
                type="text"
                className={`ideas-input${fieldErrors.title ? ' ideas-input-error' : ''}`}
                placeholder={titlePlaceholder}
                value={title}
                onChange={e => { setTitle(e.target.value); setFieldErrors(f => ({ ...f, title: undefined })) }}
              />
              {fieldErrors.title && <span className="ideas-field-error">{fieldErrors.title}</span>}
            </label>
            <label className="ideas-label">
              Notes
              <textarea
                className="ideas-textarea"
                placeholder={notesPlaceholder}
                rows={4}
                value={body}
                onChange={e => setBody(e.target.value)}
              />
            </label>
            <button type="submit" className="ideas-submit">Submit</button>
            {success && <p className="ideas-success">Idea submitted!</p>}
            {error && <p className="ideas-error">Submission failed. Please try again.</p>}
          </form>
        )}
      </div>

      <div className="ideas-list-section">
        <h2>Submitted Ideas</h2>
        {visiblePlans.length === 0 ? (
          <p className="ideas-empty">No ideas yet.</p>
        ) : (
          <ul className="ideas-list">
            {visiblePlans.map(plan => {
              const isEditing = editing?.id === plan.id
              return (
                <li key={plan.id} className={`idea-card${isEditing ? ' editing' : ''}`}>
                  {isEditing ? (
                    <div className="idea-edit">
                      <div className="ideas-row">
                        <label className="ideas-label">
                          Date
                          <input
                            type="date"
                            className="ideas-input"
                            value={editing.date}
                            onChange={e => setEditing(s => s && ({ ...s, date: e.target.value }))}
                          />
                        </label>
                        <label className="ideas-label">
                          Time
                          <input
                            type="time"
                            className="ideas-input"
                            value={editing.time}
                            onChange={e => setEditing(s => s && ({ ...s, time: e.target.value }))}
                          />
                        </label>
                      </div>
                      <label className="ideas-label">
                        {titleLabel}
                        <input
                          type="text"
                          className="ideas-input"
                          value={editing.title}
                          onChange={e => setEditing(s => s && ({ ...s, title: e.target.value }))}
                        />
                      </label>
                      <label className="ideas-label">
                        Notes
                        <textarea
                          className="ideas-textarea"
                          rows={3}
                          value={editing.body}
                          onChange={e => setEditing(s => s && ({ ...s, body: e.target.value }))}
                        />
                      </label>
                      <div className="idea-actions">
                        <button
                          className="ideas-submit"
                          onClick={handleSave}
                          disabled={!!savingId}
                        >
                          {savingId === plan.id ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          className="idea-cancel"
                          onClick={() => setEditing(null)}
                          disabled={!!savingId}
                        >
                          Cancel
                        </button>
                        <button
                          className="idea-delete-btn"
                          onClick={() => handleDelete(plan.id)}
                          disabled={!!deletingId}
                        >
                          {deletingId === plan.id ? 'Deleting…' : 'Delete'}
                        </button>
                        {editError && <span className="ideas-error">Save failed.</span>}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="idea-view"
                      onClick={() => openEdit(plan)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openEdit(plan) }}
                    >
                      <div className="idea-header">
                        <span className="idea-title">{plan.title}</span>
                        <span className="idea-date">{formatDate(plan.dateTimeUtc)}</span>
                      </div>
                      {plan.body && <p className="idea-body">{plan.body}</p>}
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
