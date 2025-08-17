// pages/dashboard.js
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Dashboard(){
  const [profile,setProfile]=useState(null);
  const [history,setHistory]=useState([]);
  const [kpis,setKpis]=useState({categories:{}});
  const [streak,setStreak]=useState(0);

  useEffect(()=>{
    try{ setProfile(JSON.parse(localStorage.getItem('ss_profile')||'null')); }catch{}
    try{
      const h=JSON.parse(localStorage.getItem('ss_history')||'[]'); setHistory(h);
      const days=new Set(h.map(e=>new Date(e.date).toDateString()));
      let s=0; const d=new Date(); while(days.has(d.toDateString())){ s++; d.setDate(d.getDate()-1); } setStreak(s);
    }catch{}
    try{
      const k=JSON.parse(localStorage.getItem('ss_kpis')||'null')||{categories:{}}; setKpis(k.categories?k:{categories:{}});
    }catch{ setKpis({categories:{}}); }
  },[]);

  const fmt=(n,u)=> (n==null||n==='')?'—': `${Number(n)%1===0?Number(n):Number(n).toFixed(2)}${u==='%'?'%':u?` ${u}`:''}`;
  const prog=(c,t)=> (Number.isFinite(+c)&&Number.isFinite(+t)&&+t!==0)? Math.max(0, Math.min(100, (+c/+t)*100)) : null;

  return (
    <main className="container">
      <header className="header">
        <div className="brand"><span className="brand-badge" />Skill Sprint</div>
        <nav className="nav">
          <Link href="/sprint">Today</Link>
          <Link href="/kpis">KPIs</Link>
        </nav>
      </header>

      <section className="row two" style={{marginTop:18}}>
        <div className="card">
          <div className="spaced">
            <b>Welcome{profile?.focus?.[0] ? ` — ${profile.focus[0]}`:''}</b>
            <div className="tag"><b>{streak}</b> day streak</div>
          </div>
          <p className="help" style={{marginTop:6}}>Do a 10-minute sprint today to keep your streak alive.</p>
          <div style={{marginTop:12, display:'flex', gap:10}}>
            <Link className="btn btn-primary" href="/sprint">Start today’s sprint</Link>
            <Link className="btn" href="/onboarding">Edit profile</Link>
          </div>
        </div>

        <div className="card">
          <b>KPI summary</b>
          {Object.keys(kpis.categories||{}).length===0 ? (
            <>
              <p className="help" style={{marginTop:6}}>No KPIs yet.</p>
              <Link className="btn" href="/kpis">Add KPIs</Link>
            </>
          ) : (
            <p className="help" style={{marginTop:6}}>Tracking {Object.keys(kpis.categories).length} categories.</p>
          )}
        </div>
      </section>

      {Object.entries(kpis.categories||{}).map(([cat,catObj])=>(
        <section key={cat} className="card" style={{marginTop:16}}>
          <div className="spaced">
            <b>{cat}</b>
            <Link className="small" href="/kpis">Edit {cat} KPIs →</Link>
          </div>
          <div className="kpi-grid" style={{marginTop:10, fontSize:13, color:'var(--muted)'}}>
            <div>Metric</div><div>Current</div><div>Target</div><div>Progress</div><div></div>
          </div>
          {Object.entries(catObj.metrics||{}).map(([m,row])=>{
            const p=prog(row.current,row.target);
            return (
              <div className="kpi-row" key={m} style={{marginTop:8}}>
                <div><b>{m}</b></div>
                <div>{fmt(row.current,row.unit)}</div>
                <div>{fmt(row.target,row.unit)}</div>
                <div>
                  {p==null? <span className="small">—</span> :
                  <div style={{position:'relative',height:8, background:'#eef2ff', border:'1px solid var(--border)', borderRadius:999}}>
                    <div style={{position:'absolute',inset:'0 0 0 0', width:`${p}%`, background:'linear-gradient(90deg,var(--accent),var(--accent-2))', borderRadius:999}}/>
                  </div>}
                </div>
                <div className="small">{p==null?'':`${Math.round(p)}%`}</div>
              </div>
            );
          })}
        </section>
      ))}

      <section className="card" style={{marginTop:16}}>
        <b>Recent sprints</b>
        {history.length===0? <p className="help" style={{marginTop:6}}>No sprints yet.</p> : (
          <ul className="list" style={{maxHeight:320, overflow:'auto'}}>
            {history.slice().reverse().map((h,i)=>(
              <li key={i} style={{margin:'8px 0'}}>
                <span className="tag">{new Date(h.date).toLocaleDateString()}</span>{' '}
                <b>{h.title}</b>{h.goals?.length? <> — <span className="help">{h.goals.join(' • ')}</span></> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
