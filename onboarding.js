import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { storage } from '../lib/storage'
import { useRouter } from 'next/router'

const focusOptions = ['Marketing','E-commerce','Retail','Leadership','Finance','Customer Experience']

export default function Onboarding() {
  const router = useRouter()
  const [role, setRole] = useState('Owner')
  const [years, setYears] = useState('0-1')
  const [focus, setFocus] = useState([])
  const [time, setTime] = useState('5')
  const [challenge, setChallenge] = useState('')

  useEffect(()=>{
    const p = storage.get('ss_profile')
    if (p) {
      setRole(p.role||'Owner'); setYears(p.years||'0-1'); setFocus(p.focus||[]); setTime(p.time||'5'); setChallenge(p.challenge||'')
    }
  },[])

  function toggleFocus(item){
    setFocus(prev => prev.includes(item) ? prev.filter(i=>i!==item) : [...prev, item].slice(0,3))
  }

  function save(){
    const profile = { role, years, focus, time, challenge, createdAt: Date.now() }
    storage.set('ss_profile', profile)
    // Reset streak if new
    if (!storage.get('ss_history')) storage.set('ss_history', [])
    router.push('/dashboard')
  }

  return (
    <Layout active="onboarding">
      <h1>Skill Test</h1>
      <p className="hint">This helps us personalise your daily sprints. Takes ~60 seconds.</p>
      <div className="grid" style={{gridTemplateColumns:'1fr', gap:16, maxWidth:720}}>
        <div className="card">
          <label>What’s your current role?</label>
          <select className="select" value={role} onChange={e=>setRole(e.target.value)}>
            {['Owner','Manager','Freelancer','Employee'].map(o=> <option key={o}>{o}</option>)}
          </select>
        </div>

        <div className="card">
          <label>How many years in business?</label>
          <select className="select" value={years} onChange={e=>setYears(e.target.value)}>
            {['0-1','2-4','5+'].map(o=> <option key={o}>{o}</option>)}
          </select>
        </div>

        <div className="card">
          <label>Pick up to 3 focus areas</label>
          <div style={{display:'flex', flexWrap:'wrap', gap:8, marginTop:8}}>
            {focusOptions.map(o => (
              <button key={o} type="button" onClick={()=>toggleFocus(o)}
                className="badge"
                style={{border: focus.includes(o)?'2px solid #ff7a1a':'1px solid #e5e7eb'}}>
                {o}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <label>How many minutes per day can you commit?</label>
          <select className="select" value={time} onChange={e=>setTime(e.target.value)}>
            {['5','10','20+'].map(o=> <option key={o}>{o}</option>)}
          </select>
        </div>

        <div className="card">
          <label>What’s your biggest current challenge? (short)</label>
          <textarea className="textarea" rows="3" value={challenge} onChange={e=>setChallenge(e.target.value)} placeholder="e.g., Our conversion rate is low and ad spend is high." />
        </div>

        <div style={{display:'flex', gap:12}}>
          <button className="btn" onClick={save}>Save & Continue</button>
        </div>
      </div>
    </Layout>
  )
}
