// pages/sprint.js
import { useState } from 'react'
import Link from 'next/link'

export default function Sprint() {
  const [step, setStep] = useState(1)

  return (
    <main className="container">
      <h1>Daily Sprint</h1>

      {step === 1 && (
        <div className="card">
          <h2>Step 1 — Learn</h2>
          <p>Today’s topic is <b>Email Segmentation</b>. Did you know that segmenting lists can lift revenue by 20%?</p>
          <button className="button" onClick={() => setStep(2)}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2>Step 2 — Do</h2>
          <p>Create one new customer segment today (e.g. repeat buyers vs new).</p>
          <button className="button" onClick={() => setStep(3)}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h2>Step 3 — Reflect</h2>
          <p>Did this feel useful? What did you notice?</p>
          <textarea rows="3" placeholder="Type your reflection…" className="textarea" />
          <div style={{marginTop: "12px"}}>
            <Link href="/" className="button">Finish</Link>
          </div>
        </div>
      )}
    </main>
  )
}
