// pages/dashboard.js
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Dashboard(){
  const [profile,setProfile]=useState(null);
  const [history,setHistory]=useState([]);
  const [streak,setStreak]=useState(0);
  const [kpis,setKpis]=useState({ categories: {} });

  // ---- load data from localStorage ----
  useEffect(()=>{
    try { setProfile(JSON.parse(localStorage.getItem('ss_profile')||'null')); } catch {}
    try { 
      const h=JSON.parse(localStorage.getItem('ss_history')||'[]'); 
      setHistory(h);
      // simple daily streak (unique dates)
      const days=new Set(h.map(e=> new Date(e.date).toDateString()));
      let s=0; let t=new Date();
      while(days.has(t.toDateString())){ s++; t.setDate(t.getDate()-1); }
      setStreak(s);
    } catch {}
    try { 
      const saved = JSON.parse(localStorage.getItem('ss_kpis')||'null') || { categories: {} };
      // ensure shape
      setKpis(saved.categories ? saved : { categories: {} });
    } catch {
      setKpis({ categories: {} });
    }
  },[]);

  // ---- helpers ----
  const fmt = (val, unit) => {
    if (val == null || val === '' || Number.isNaN(Number(val))) return '—';
    const n = Number(val);
    // pretty print integers vs decimals
    const text = Number.isInteger(n) ? String(n) : n.toFixed(2);
    // put %/£/$ after/before sensibly
    if (unit === '%' || unit === ' %') return `${text}%`;
    if (unit === '£') return `£${text}`;
    if (unit === '$') return `$${text}`;
    return `${text}${unit ? ' ' + unit : ''}`;
  };

  const percentProgress = (current, target) => {
    const c = Number(current), t = Number(target);
    if (!Number.isFinite(c) || !Number.isFinite(t) || t === 0) return null;
    // progress towards target (cap 0-100+)
    const p = Math.max(0, Math.min(100, (c / t) * 100));
    return p;
  };

  // ---- UI ----
  return (
    <main style={{maxWidth:1100, margin:'0 auto', padding:'24px', fontFamily:'system-ui'}}>
      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center', marginBottom:8}}>
        <h1>Dashboard</h1>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <div title="Daily streak" style={{display:'inline-flex',gap:8,alignItems:'center'}}>
            <span style={{width:10,height:10,background:'#22c55e',borderRadius:'50%'}}></span>
            <b>{streak}</b><span style={{opacity:.7}}>day streak</span>
          </div>
          <Link href="/sprint">Today&apos;s Sprint</Link>
        </div>
      </div>

      {/* Profile card */}
      <section style={{display:'grid', gap:16, gridTemplateColumns:'2fr 1fr'}}>
        <div style={{border:'1px solid #ddd',borderRadius:12,padding:16}}>
          <div style={{opacity:.7,fontSize:12}}>Your profile</div>
          {!profile ? (
            <>
              <p style={{opacity:.8, marginTop:6}}>No profile yet. Take the short skill test to personalise your plan.</p>
              <Link href="/onboarding" style={{padding:'10px 14px',border:'1px solid #ddd',borderRadius:8}}>Start Skill Test</Link>
            </>
          ) : (
            <>
              <p style={{opacity:.85, marginTop:6}}>
                Role: {profile.role || '—'} • Years: {profile.years || '—'} • Focus: {(profile.focus||[]).join(', ') || '—'} • Time: {profile.time || '—'} min/day
              </p>
              <p style={{opacity:.8}}><b>Challenge:</b> {profile.challenge || '—'}</p>
              <div style={{marginTop:12,display:'flex',gap:8,flexWrap:'wrap'}}>
                <Link href="/onboarding" style={{padding:'10px 14px',border:'1px solid #ddd',borderRadius:8}}>Edit profile</Link>
                <Link href="/kpis" style={{padding:'10px 14px',border:'1px solid #ddd',borderRadius:8}}>Manage KPIs</Link>
              </div>
            </>
          )}
        </div>

        {/* KPI summary CTA */}
        <div style={{border:'1px solid #ddd',borderRadius:12,padding:16}}>
          <div style={{opacity:.7,fontSize:12}}>KPI summary</div>
          {Object.keys(kpis.categories||{}).length === 0 ? (
            <>
              <p style={{opacity:.85, marginTop:6}}>No KPIs yet. Want to measure progress against your goals?</p>
              <Link href="/kpis" style={{padding:'10px 14px',border:'1px solid #ddd',borderRadius:8}}>Add KPIs →</Link>
            </>
          ) : (
            <>
              <p style={{opacity:.85, marginTop:6}}>
                Tracking <b>{Object.keys(kpis.categories).length}</b> categories. Keep targets realistic for the next 30–60 days.
              </p>
              <Link href="/kpis" style={{padding:'10px 14px',border:'1px solid #ddd',borderRadius:8}}>Update KPIs</Link>
            </>
          )}
        </div>
      </section>

      {/* KPI details per category */}
      {Object.entries(kpis.categories||{}).map(([cat, catObj])=>(
        <section key={cat} style={{border:'1px solid #ddd',borderRadius:12,padding:16, marginTop:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <h3 style={{margin:0}}>{cat}</h3>
            <Link href="/kpis" style={{fontSize:14}}>Edit {cat} KPIs →</Link>
          </div>

          {/* Table header */}
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 2fr', gap:8, marginTop:12, fontSize:13, opacity:.7}}>
            <div>Metric</div>
            <div>Current</div>
            <div>Target</div>
            <div>Progress</div>
          </div>

          {/* Rows */}
          {Object.entries(catObj.metrics || {}).length === 0 && (
            <div style={{opacity:.7, marginTop:8}}>No metrics yet. Add some in the KPI manager.</div>
          )}

          {Object.entries(catObj.metrics || {}).map(([metric, row])=>{
            const unit = row.unit || '';
            const progress = percentProgress(row.current, row.target);
            return (
              <div key={metric} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 2fr', gap:8, marginTop:8, alignItems:'center'}}>
                <div><b>{metric}</b></div>
                <div>{fmt(row.current, unit)}</div>
                <div>{fmt(row.target, unit)}</div>
                <div>
                  {progress == null ? (
                    <span style={{opacity:.6}}>—</span>
                  ) : (
                    <div style={{position:'relative', height:10, background:'#eee', borderRadius:999}}>
                      <div style={{position:'absolute', left:0, top:0, bottom:0, width:`${progress}%`, background:'#0ea5e9', borderRadius:999}} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      ))}

      {/* History */}
      <section style={{border:'1px solid #ddd',borderRadius:12,padding:16, marginTop:16}}>
        <div style={{opacity:.7,fontSize:12}}>Recent sprints</div>
        {history.length===0 && <p style={{opacity:.8}}>No sprints completed yet.</p>}
        {history.length>0 && (
          <ul style={{maxHeight:360, overflow:'auto', paddingLeft:16}}>
            {history.slice().reverse().map((h,i)=>(
              <li key={i} style={{margin:'10px 0'}}>
                <span style={{display:'inline-block',padding:'4px 10px',border:'1px solid #ddd',borderRadius:999, fontSize:12, marginRight:8}}>
                  {new Date(h.date).toLocaleDateString()}
                </span>
                <b>{h.title}</b>
                {!!(h.goals && h.goals.length) && (
                  <div style={{opacity:.85, marginTop:4}}>Goals: {h.goals.join(' • ')}</div>
                )}
                <div style={{opacity:.7}}>Rating: {h.rating || '—'}</div>
                {!!h.reflection && <div style={{opacity:.7,marginTop:4}}>Reflection: {h.reflection}</div>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
                                             }
