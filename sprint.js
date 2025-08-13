import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { storage } from '../lib/storage'

export default function Sprint(){
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [day, setDay] = useState(null)
  const [tips, setTips] = useState([])
  const [reflection, setReflection] = useState('')
  const [rating, setRating] = useState(0)

  const profile = storage.get('ss_profile')
  const history = storage.get('ss_history', [])

  async function fetchSprint(){
    if (!profile) return setError('Please complete the skill test first.')
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/generate-sprint', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ profile, history }) })
      const data = await res.json()
      setDay(data.day); setTips(data.tips||[])
    } catch (e) {
      setError('Could not load today\'s sprint.'); console.error(e)
    } finally { setLoading(false) }
  }

  useEffect(()=>{ fetchSprint() },[])

  function completeSprint(){
    const entry = { date: new Date().toISOString(), title: day?.title||'Sprint', reflection, rating }
    const next = [...history, entry]
    storage.set('ss_history', next)
    alert('Nice work — progress saved!')
  }

  return (
    <Layout active="sprint">
      <h1>Today&apos;s Sprint</h1>
      {!profile && <div className="notice">No profile found. Please complete the skill test first.</div>}
      {error && <div className="notice">{error}</div>}
      {loading && <div className="card">Loading your sprint…</div>}
      {day && (
        <div className="grid" style={{gridTemplateColumns:'2fr 1fr'}}>
          <div className="card">
            <div className="badge">Sprint</div>
            <h3 style={{marginTop:8}}>{day.title}</h3>
            <p className="hint" style={{marginTop:8}}>{day.knowledge}</p>

            <div style={{marginTop:12}}>
              <b>Task</b>
              <p style={{marginTop:6}}>{day.task}</p>
            </div>

            <div style={{marginTop:12}}>
              <b>Reflection</b>
              <p className="hint" style={{marginTop:6}}>{day.reflection}</p>
              <textarea className="textarea" rows="3" placeholder="Jot your thoughts…" value={reflection} onChange={e=>setReflection(e.target.value)} />
              <div style={{display:'flex', alignItems:'center', gap:8, marginTop:8}}>
                <span className="hint">How useful was this?</span>
                {[1,2,3,4,5].map(n=> <button key={n} onClick={()=>setRating(n)} className="badge" style={{border: rating===n?'2px solid #ff7a1a':'1px solid #e5e7eb'}}>{n}</button>)}
              </div>
              <div style={{textAlign:'right', marginTop:12}}>
                <button className="btn" onClick={completeSprint}>Save progress</button>
              </div>
            </div>
          </div>

          <aside className="card">
            <b>Tips</b>
            <ul style={{marginTop:8}}>
              {(tips||[]).map((t,i)=> <li key={i} className="hint" style={{margin:'6px 0'}}>{t}</li>)}
            </ul>
            <div className="notice" style={{marginTop:12}}>
              Free MVP: your data is stored in your browser (localStorage). Connect a database later to sync across devices.
            </div>
          </aside>
        </div>
      )}
    </Layout>
  )
}
