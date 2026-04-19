import { useState } from 'react'
import bdayImg from '../assets/angy_frog_bday.jpg'
import './BdayPage.css'

export default function BdayPage() {
  const [open, setOpen] = useState(false)
  const [pookie, setPookie] = useState(false)

  return (
    <div className="bday-page">
      <img src={bdayImg} alt="angy frog birthday" className="bday-img" />
      <button className="bday-btn" onClick={() => setOpen(true)}>
        Birthday girl will click here
      </button>

      {open && (
        <div className="bday-overlay" onClick={() => setOpen(false)}>
          <div className="bday-dialog" onClick={e => e.stopPropagation()}>
            <p className="bday-message">
              Happy Birthday! My{' '}
              <span className="bday-name" onClick={() => setPookie(p => !p)}>
                {pookie ? 'Pookie 🤫' : 'Honey 🎂'}
              </span>
            </p>
            <p className="bday-note">
              Happy 29th birthday to my favourite person in the world!
              <br />
              Now that you are turning 19 for the 10th time,
              we will have to wait until September for our age gap to get back to 2.
              <br />
              I hope this year has been treating you well so far (it should, because I appeared in it 😎) 
              and that your 29th time on this planet revolving our sun will be the best one yet!
              <br />
              I am looking forward to all the adventures we will have together. Even though you are the birthday
              girl, I almost feel like I was the one who got the best present in the universe when I met you.
              <br />
              Happy Birthday!!!!! And I hope you are having the best day ever! 🎉🎁🎈
            </p>
            <button className="bday-close" onClick={() => setOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
