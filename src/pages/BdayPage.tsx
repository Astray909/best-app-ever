import { useState } from 'react'
import bdayImg from '../assets/angy_frog_bday.jpg'
import './BdayPage.css'

export default function BdayPage() {
  const [open, setOpen] = useState(false)

  return (
    <div className="bday-page">
      <img src={bdayImg} alt="angy frog birthday" className="bday-img" />
      <button className="bday-btn" onClick={() => setOpen(true)}>
        Birthday girl will click here
      </button>

      {open && (
        <div className="bday-overlay" onClick={() => setOpen(false)}>
          <div className="bday-dialog" onClick={e => e.stopPropagation()}>
            <p className="bday-message">Happy Birthday! 🎂</p>
            <p className="bday-note"></p>
            <button className="bday-close" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
