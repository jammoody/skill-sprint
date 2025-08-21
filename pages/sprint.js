// pages/sprint.js
import { useEffect, useState } from 'react';
import Nav from '../components/Nav';
import { getOrCreateTodaySprint, saveDailySprint } from '../lib/store';

const steps = ['learn','quiz','test','real'];

export default function Sprint(){
  const [s,setS] = useState(null);
  const [i,setI] = useState(0); // step index
  const [answers,setAnswers] = useState({q1:'',q2:'',test:'' , real:''});

  useEffect(()=>{ setS(getOrCreateTodaySprint()); },[]);

  function next(){
    if (i < steps.length-1) setI(i+1);
    else {
      // complete sprint
      const done = { ...s, status:'done' };
      saveDailySprint(new Date().toISOString().slice(0,10), done);
      setS(done);
      alert('Sprint complete. Returning to Coach.'); window.location.assign('/coach');
    }
  }
  function back(){ if (i>0) setI(i-1); }

  if (!s) return (<><Nav active="sprint" /><main className="container"><div className="card">Loading…</div></main></>);

  return (
    <>
      <Nav active="sprint" />
      <main className="container">
        <section className="card">
          <div className="progress"><span style={{width:`${((i+1)/steps.length)*100}%`}}/></div>
          <h2 style={{margin:'10px 0 0 0'}}>{s.title}</h2>
          <div style={{opacity:.75,marginTop:4}}>{s.goal}</div>
        </section>

        <section className="card" style={{marginTop:12}}>
          {steps[i]==='learn' && (
            <>
              <div className="section-title">Learn</div>
              <ul style={{margin:'6px 0 0 18px',lineHeight:1.8}}>
                {s.learning.map((l,idx)=><li key={idx}>{l}</li>)}
              </ul>
            </>
          )}

          {steps[i]==='quiz' && (
            <>
              <div className="section-title">Quick quiz</div>
              <div style={{display:'grid',gap:10, marginTop:8}}>
                <div>
                  <div style={{fontSize:14, marginBottom:6}}>1) What KPI will this affect?</div>
                  <input className="input" value={answers.q1} onChange={e=>setAnswers(v=>({...v,q1:e.target.value}))} placeholder="e.g., CTR, CVR, ROAS"/>
                </div>
                <div>
                  <div style={{fontSize:14, marginBottom:6}}>2) What “one variable” will you change?</div>
                  <input className="input" value={answers.q2} onChange={e=>setAnswers(v=>({...v,q2:e.target.value}))} placeholder="Subject, headline, hook, CTA, audience…"/>
                </div>
              </div>
            </>
          )}

          {steps[i]==='test' && (
            <>
              <div className="section-title">Mini test (≤10m)</div>
              <p className="muted">Write a quick experiment plan.</p>
              <textarea className="textarea" value={answers.test} onChange={e=>setAnswers(v=>({...v,test:e.target.value}))} placeholder="- Hypothesis:&#10;- Change:&#10;- Expected KPI change:&#10;- How you’ll measure:" />
            </>
          )}

          {steps[i]==='real' && (
            <>
              <div className="section-title">Real-world</div>
              <p>Ship the experiment to a small, safe audience. Note what you did and when you’ll check results.</p>
              <textarea className="textarea" value={answers.real} onChange={e=>setAnswers(v=>({...v,real:e.target.value}))} placeholder="Audience, timing, expected baseline vs. actual…" />
            </>
          )}

          <div style={{display:'flex',justifyContent:'space-between',gap:8,marginTop:12}}>
            <button className="btn" onClick={back} disabled={i===0}>Back</button>
            <button className="btn btn-accent" onClick={next}>{i===steps.length-1?'Finish':'Next'}</button>
          </div>
        </section>
      </main>
    </>
  );
}