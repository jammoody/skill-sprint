// pages/dashboard.js
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard(){
  const [profile,setProfile]=useState(null);
  const [history,setHistory]=useState([]);
  const [streak,setStreak]=useState(0);
  const [kpis,setKpis]=useState({});

  useEffect(()=>{
    try { setProfile(JSON.parse(localStorage.getItem('ss_profile')||'null')); } catch {}
    try { const h=JSON.parse(localStorage.getItem('ss_history')||'[]'); setHistory(h);
      const days=new Set(h.map(e=> new Date(e.date).toDateString())); let s=0; let t=new Date(); while(days.has(t.toDateString())){s++; t.setDate(t.getDate()-1)}; setStreak(s);
    } catch {}
    try { setKpis(JSON.parse(localStorage.getItem('ss_kpis')||'{}') || {}); } catch {}
  },[]);

  const email = kpis.email || {};
  const pct = v => (v==null || isNaN(v)) ? '—' : `${Math.round(v*100)}%`;

  return (
    <main style={{maxWidth:1000, margin:'0 auto', padding:'24px', fontFamily:'system-ui'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1>Dashboard</h1>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <div style={{display:'inline-flex',gap:8,alignItems:'center'}}><span style={{width:10,height:10,background:'#22c55e',borderRadius:'50%'}}></span><b>{streak}</b><span style={{opacity:.7}}>day streak</span></div>
          <Link href="/sprint">Today&apos;s Sprint</Link>
        </div>
      </div>

      {!profile && (
        <section style={{border:'1px solid #ddd',borderRadius:12,padding:16,marginTop:12}}>
          <b>No profile yet</b>
          <p style={{opacity:.8}}>Take the skill test to personalise your plan.</p>
          <Link href="/onboarding" style={{padding:'10px 14px',border:'1px solid #ddd',borderRadius:8}}>Start Skill Test</Link>
        </section>
      )}

      {profile && (
        <section style={{display:'grid', gap:16, gridTemplateColumns:'2fr 1fr', marginTop:12}}>
          <div style={{border:'1px solid #ddd',borderRadius:12,padding:16}}>
            <div style={{opacity:.7,fontSize:12}}>Your profile</div>
            <p style={{opacity:.8}}>Role: {profile.role} • Years: {profile.years} • Focus: {(profile.focus||[]).join(', ')||'—'} • Time: {profile.time} min/day</p>
            <p style={{opacity:.8}}>Challenge: {profile.challenge||'—'}</p>
            <div style={{marginTop:12,display:'flex',gap:8}}>
              <Link href="/onboarding" style={{padding:'10px 14px',border:'1px solid #ddd',borderRadius:8}}>Edit profile</Link>
              <Link href="/kpis" style={{padding:'10px 14px',border:'1px solid #ddd',borderRadius:8}}>Update KPIs</Link>
            </div>
          </div>

          <div style={{border:'1px solid #ddd',borderRadius:12,padding:16}}>
            <div style={{opacity:.7,fontSize:12}}>Email KPIs</div>
            <ul style={{marginTop:8, paddingLeft:18, lineHeight:1.8}}>
              <li><b>List size:</b> {email.listSize ?? '—'}</li>
              <li><b>Segmentation:</b> {email.segmentation ?? '—'}</li>
              <li><b>Open rate:</b> {pct(email.openRate)}</li>
              <li><b>CTR:</b> {pct(email.ctr)}</li>
              <li><b>CVR (from email):</b> {pct(email.cvr)}</li>
              <li><b>Revenue share:</b> {pct(email.revShare)}</li>
            </ul>
            <div style={{marginTop:8}}>
              <Link href="/kpis">Edit KPIs →</Link>
            </div>
          </div>
        </section>
      )}

      <section style={{border:'1px solid #ddd',borderRadius:12,padding:16, marginTop:16}}>
        <div style={{opacity:.7,fontSize:12}}>Progress</div>
        {history.length===0 && <p style={{opacity:.8}}>No sprints completed yet.</p>}
        {history.length>0 && (
          <ul style={{maxHeight:320, overflow:'auto', paddingLeft:16}}>
            {history.slice().reverse().map((h,i)=>(
              <li key={i} style={{margin:'10px 0'}}>
                <span style={{display:'inline-block',padding:'4px 10px',border:'1px solid #ddd',borderRadius:999, fontSize:12, marginRight:8}}>
                  {new Date(h.date).toLocaleDateString()}
                </span>
                <b>{h.title}</b>
                {!!(h.goals && h.goals.length) && (
                  <div style={{opacity:.8, marginTop:4}}>Goals: {h.goals.join(' • ')}</div>
                )}
                <div style={{opacity:.7}}>Rating: {h.rating||'—'}</div>
                {!!h.reflection && <div style={{opacity:.7,marginTop:4}}>Reflection: {h.reflection}</div>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
        }
