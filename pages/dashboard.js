import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { storage } from '../lib/storage';
import Link from 'next/link';

export default function Dashboard(){
  const [profile,setProfile]=useState(null);
  const [history,setHistory]=useState([]);
  const [streak,setStreak]=useState(0);

  useEffect(()=>{
    const p=storage.get('ss_profile'); setProfile(p);
    const h=storage.get('ss_history',[]); setHistory(h);
    const days = new Set(h.map(e=> new Date(e.date).toDateString()));
    let s=0; let t=new Date(); while(days.has(t.toDateString())){s++; t.setDate(t.getDate()-1)}; setStreak(s);
  },[]);

  return (
    <Layout active="dashboard">
      <section className="container section">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h1 className="h1">Dashboard</h1>
          <div className="streak"><span className="dot"></span><b>{streak}</b><span className="hint">day streak</span></div>
        </div>

        {!profile && <div className="card"><b>No profile yet</b><p className="hint">Take the skill test to personalise your plan.</p><Link className="btn" href="/onboarding">Start Skill Test</Link></div>}

        {profile && (
          <div className="grid" style={{gridTemplateColumns:'2fr 1fr'}}>
            <div className="card">
              <div className="kicker">Your profile</div>
              <p className="hint">Role: {profile.role} • Years: {profile.years} • Focus: {(profile.focus||[]).join(', ')||'—'} • Time: {profile.time} min/day</p>
              <p className="hint">Challenge: {profile.challenge||'—'}</p>
              <div style={{marginTop:12}}>
                <Link href="/onboarding" className="btn secondary">Edit profile</Link>
                <Link href="/sprint" className="btn" style={{marginLeft:10}}>Go to today&apos;s sprint</Link>
              </div>
            </div>

            <div className="card">
              <div className="kicker">Progress</div>
              <p className="hint">Completed sprints: {history.length}</p>
              <ul style={{maxHeight:240, overflow:'auto', paddingLeft:16}}>
                {history.slice().reverse().map((h,i)=>(
                  <li key={i} style={{margin:'8px 0'}}>
                    <span className="badge">{new Date(h.date).toLocaleDateString()}</span> <b>{h.title}</b>
                    <div className="hint">Reflection: {h.reflection||'—'} • Rating: {h.rating||'—'}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
