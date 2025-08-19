// pages/dashboard.js
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Nav from '../components/Nav';
import { getProfile, getKPIs, getHistory } from '../lib/store';

export default function Dashboard(){
  const [profile,setProfile]=useState(null);
  const [history,setHistory]=useState([]);
  const [kpis,setKpis]=useState({categories:{}});
  const [streak,setStreak]=useState(0);

  useEffect(()=>{
    const p = getProfile(); setProfile(p);
    const h = getHistory(); setHistory(h);
    const days=new Set(h.map(e=>new Date(e.date).toDateString()));
    let s=0; const d=new Date(); while(days.has(d.toDateString())){ s++; d.setDate(d.getDate()-1); } setStreak(s);
    setKpis(getKPIs());
  },[]);

  const latest = history.slice().reverse()[0];
  const firstName = useMemo(()=>{
    const n = profile?.name || '';
    return n.split(' ')[0] || 'Welcome';
  },[profile]);

  const fmt=(n,u)=> (n==null||n==='')?'—': `${Number(n)%1===0?Number(n):Number(n).toFixed(2)}${u==='%'?'%':u?` ${u}`:''}`;
  const prog=(c,t)=> (Number.isFinite(+c)&&Number.isFinite(+t)&&+t!==0)? Math.max(0, Math.min(100, (+c/+t)*100)) : null;

  return (
    <>
      <Nav active="dash" />
      <main className="container">
        {/* Top banner with CTA */}
        <section className="card" style={{marginTop:18}}>
          <div className="spaced">
            <div>
              <div className="small">Good to see you</div>
              <h2 style={{margin:'6px 0 8px 0'}}>{firstName} — keep momentum going</h2>
              <p className="help" style={{marginTop:6}}>
                {profile?.goal30d ? <>30-day outcome: <b>{profile.goal30d}</b></> : 'Set a clear 30-day outcome in Onboarding.'}
              </p>
            </div>
            <div className="tag"><b>{streak}</b>-day streak 🔥</div>
          </div>
          <div style={{display:'flex', gap:10, marginTop:12, flexWrap:'wrap'}}>
            <Link className="btn btn-primary" href="/sprint">Start today’s 10-minute sprint</Link>
            <Link className="btn" href="/coach">Ask the coach</Link>
            <Link className="btn" href="/kpis">Review KPIs</Link>
          </div>
        </section>

        {/* KPI snapshot */}
        <section className="row two" style={{marginTop:16}}>
          <div className="card">
            <b>KPI snapshot</b>
            {Object.keys(kpis.categories||{}).length===0 ? (
              <>
                <p className="help" style={{marginTop:6}}>No KPIs yet — add a couple to anchor progress.</p>
                <Link className="btn" href="/kpis">Add KPIs</Link>
              </>
            ) : (
              Object.entries(kpis.categories).map(([cat,catObj])=>(
                <div key={cat} style={{marginTop:10}}>
                  <div className="spaced">
                    <div className="small">{cat}</div>
                    <Link className="small" href="/kpis">Edit</Link>
                  </div>
                  {Object.entries(catObj.metrics||{}).slice(0,3).map(([m,row])=>{
                    const p=prog(row.current,row.target);
                    return (
                      <div key={m} style={{display:'grid', gridTemplateColumns:'1fr auto', gap:10, alignItems:'center', marginTop:8}}>
                        <div>
                          <b>{m}</b>
                          <div className="small">{fmt(row.current,row.unit)} → {fmt(row.target,row.unit)}</div>
                          {p!=null && (
                            <div style={{position:'relative',height:8, background:'#eef2ff', border:'1px solid var(--border)', borderRadius:999, marginTop:6}}>
                              <div style={{position:'absolute',inset:'0 0 0 0', width:`${p}%`, background:'linear-gradient(90deg,var(--accent),var(--accent-2))', borderRadius:999}}/>
                            </div>
                          )}
                        </div>
                        <div className="tag">{p==null?'—':`${Math.round(p)}%`}</div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Recent activity */}
          <div className="card">
            <b>Recent activity</b>
            {history.length===0 ? (
              <p className="help" style={{marginTop:6}}>No sprints yet — kick off your first one.</p>
            ) : (
              <ul className="list" style={{maxHeight:320, overflow:'auto', marginTop:8}}>
                {history.slice().reverse().map((h,i)=>(
                  <li key={i} style={{margin:'10px 0'}}>
                    <span className="tag">{new Date(h.date).toLocaleDateString()}</span>{' '}
                    <b>{h.title}</b>{h.goals?.length? <> — <span className="help">{h.goals.join(' • ')}</span></> : null}
                  </li>
                ))}
              </ul>
            )}
            <div style={{display:'flex', gap:10, marginTop:12}}>
              <Link className="btn" href="/sprint">Resume sprint</Link>
              <Link className="btn" href="/coach">Ask the coach</Link>
            </div>
          </div>
        </section>

        {/* Next suggestion */}
        <section className="card" style={{marginTop:16}}>
          <div className="spaced">
            <b>Next best step</b>
            <span className="small">Based on your recent sprint</span>
          </div>
          <p className="help" style={{marginTop:6}}>
            {latest
              ? 'Ship one small improvement on the last experiment, then log the KPI change.'
              : 'Start with a focused sprint — I’ll keep it light and actionable.'}
          </p>
          <div style={{display:'flex', gap:10, marginTop:8}}>
            <Link className="btn btn-primary" href="/sprint">Start today’s sprint</Link>
            <Link className="btn" href="/onboarding">Improve profile</Link>
          </div>
        </section>
      </main>
    </>
  );
}
