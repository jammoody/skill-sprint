import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { storage } from '../lib/storage'
import Link from 'next/link'

export default function Dashboard(){
  const [profile, setProfile] = useState(null)
  const [history, setHistory] = useState([])
  const [streak, setStreak] = useState(0)

  useEffect(()=>{
    const p = storage.get('ss_profile'); setProfile(p)
    const h = storage.get('ss_history', []); setHistory(h)
    // Simple streak calc: count consecutive days (UTC) with entries
    const days = new Set(h.map(e=> new Date(e.date).toDateString()))
    let s=0; let today = new Date(); while (days.has(today.toDateString())) { s++; today.setDate(today.getDate()-1) }
    setStreak(s)
  },[])

  if (!profile) return (
    <Layout active="dashboard">
      <div className="card">
        <b>No profile yet</b>
        <p className="hint">Take the skill test to personalise your plan.</p>
        <Link href="/onboarding" className="btn">Start Skill Test</Link>
      </div>
    </Layout>
  )

  return (
    <Layout active="dashboard">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1>Dashboard</h1>
        <div className="streak"><span className="dot"></span><b>{streak}</b><span className="hint">day streak</span></div>
      </div>

      <div className="grid" style={{gridTemplateColumns:'2fr 1fr'}}>
        <div className="card">
          <b>Your profile</b>
          <p className="hint">Role: {profile.role} • Years: {profile.years} • Focus: {(profile.focus||[]).join(', ')||'—'} • Time: {profile.time} min/day</p>
          <p className="hint">Challenge: {profile.challenge||'—'}</p>
          <div style={{marginTop:12}}>
            <Link href="/onboarding" className="btn secondary">Edit profile</Link>
            <Link href="/sprint" className="btn" style={{marginLeft:8}}>Go to today&apos;s sprint</Link>
          </div>
        </div>

        <div className="card">
          <b>Progress</b>
          <p className="hint">Completed sprints: {history.length}</p>
          <ul style={{maxHeight:220, overflow:'auto'}}>
            {history.slice().reverse().map((h,i)=>(
              <li key={i} style={{margin:'8px 0'}}>
                <span className="badge">{new Date(h.date).toLocaleDateString()}</span> <b>{h.title}</b>
                <div className="hint">Reflection: {h.reflection||'—'} • Rating: {h.rating||'—'}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  )
}
