// pages/sprint.js
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Nav from '../components/Nav';
import { getProfile, getKPIs, setKPIs, appendHistory } from '../lib/store';

export default function Sprint(){
  const profile = useMemo(()=>getProfile(),[]);
  const kpisObj = useMemo(()=>getKPIs(),[]);
  const [seed,setSeed]=useState(null);

  const [step,setStep]=useState(0);
  const [day,setDay]=useState({ title:'High-impact segmentation', knowledge:'Two quick segments can lift CTR/CVR without heavy setup.', task:'Create 2 segments you can email this week.', reflection:'What did you try (≤10 min)? What changed (number/observation)? What will you do tomorrow?' });

  const [expand,setExpand]=useState({ examples:false, why:false, case:false });
  const [segments,setSegments]=useState([{name:'',criteria:''},{name:'',criteria:''}]);
  const [already,setAlready]=useState(false);
  const [upgrade,setUpgrade]=useState(false);
  const [goal,setGoal]=useState('');
  const [note,setNote]=useState('');
  const [rating,setRating]=useState(0);

  const cats = Object.keys(kpisObj.categories||{});
  const [kCat,setKCat]=useState(cats[0]||'');
  const [kMetric,setKMetric]=useState('');
  const [kNew,setKNew]=useState('');

  useEffect(()=>{
    if (!profile) { if (typeof window !== 'undefined') window.location.assign('/onboarding'); return; }
    try{
      const s = JSON.parse(localStorage.getItem('ss_sprint_seed')||'null');
      if (s) { setSeed(s); setDay(d=>({...d, title: s.title || d.title })); }
    }catch{}
  },[profile]);

  const steps=['Learn','Apply','Evolve','Coach'];
  const progress=((step+1)/steps.length)*100;

  function setSeg(i, field, val){ setSegments(arr=>{ const x=[...arr]; x[i] = {...x[i], [field]:val}; return x; }); }

  function save(){
    if (kCat && kMetric && kNew!=='') {
      const clone = JSON.parse(JSON.stringify(kpisObj));
      const row = (((clone.categories||{})[kCat]||{}).metrics||{})[kMetric];
      if (row) row.current = Number(kNew);
      setKPIs(clone);
    }
    const entry = {
      date: new Date().toISOString(),
      title: day.title,
      learnExpansions: expand,
      apply: { already, segments, upgrade },
      reflection: note,
      goals: [goal].filter(Boolean),
      rating
    };
    appendHistory(entry);
    setStep(3);
  }

  const metricsForCat = useMemo(()=>{
    if (!kCat || !kpisObj.categories?.[kCat]?.metrics) return [];
    return Object.keys(kpisObj.categories[kCat].metrics);
  },[kCat, kpisObj]);

  return (
    <>
      <Nav active="today" />
      <main className="container">
        <div className="card" style={{marginTop:18}}>
          <div className="spaced">
            <div>
              <div className="small">Step {step+1} of 4 • {profile?.focus?.[0]||'General'}</div>
              <h2 style={{margin:'6px 0 8px 0'}}>{steps[step]}</h2>
            </div>
            <div style={{minWidth:240}}><div className="progress"><span style={{width:`${progress}%`}}/></div></div>
          </div>

          {step===0 && (
            <section style={{marginTop:12}}>
              <h3 style={{margin:'0 0 6px 0'}}>{day.title}</h3>
              <p className="help">{day.knowledge}</p>
              <div className="inline" style={{marginTop:12}}>
                <button className="btn btn-chip" onClick={()=>setExpand(e=>({...e, examples:!e.examples}))}>{expand.examples?'Hide':'Show'} examples</button>
                <button className="btn btn-chip" onClick={()=>setExpand(e=>({...e, case:!e.case}))}>{expand.case?'Hide':'Mini case'}</button>
                <button className="btn btn-chip" onClick={()=>setExpand(e=>({...e, why:!e.why}))}>{expand.why?'Hide':'Why this works'}</button>
              </div>
              {expand.examples && <div className="card" style={{marginTop:12}}><b>Examples</b><ul className="list"><li>Repeat buyers (90 days)</li><li>Browsed-abandoners (14 days)</li><li>High AOV customers</li></ul></div>}
              {expand.case && <div className="card" style={{marginTop:12}}><b>Mini case</b><p className="help">A DTC brand created two segments and sent 3 emails. CTR +0.8pp; revenue +12% in 2 weeks.</p></div>}
              {expand.why && <div className="card" style={{marginTop:12}}><b>Why this works</b><p className="help">Relevance → higher CTR → higher CVR. Segments reduce mismatch between message and intent.</p></div>}
              <div className="spaced" style={{marginTop:18}}>
                <button className="btn" disabled>Back</button>
                <button className="btn btn-primary" onClick={()=>setStep(1)}>Continue</button>
              </div>
            </section>
          )}

          {step===1 && (
            <section style={{marginTop:12}}>
              <b>Task</b>
              <p className="help" style={{marginTop:6}}>{day.task}</p>

              <div className="inline" style={{gap:18, margin:'8px 0'}}>
                <label className="inline" style={{gap:8}}>
                  <input type="checkbox" checked={already} onChange={e=>setAlready(e.target.checked)} />
                  <span>I’ve already done this</span>
                </label>
                {already && (
                  <label className="inline" style={{gap:8}}>
                    <input type="checkbox" checked={upgrade} onChange={e=>setUpgrade(e.target.checked)} />
                    <span>Show next-level version</span>
                  </label>
                )}
              </div>

              {!already && (
                <>
                  <div className="row">
                    {segments.map((s, i)=>(
                      <div key={i} className="card">
                        <b>Segment {i+1}</b>
                        <input className="input" placeholder="Name" value={s.name} onChange={e=>setSeg(i,'name',e.target.value)} style={{marginTop:8}}/>
                        <input className="input" placeholder="Criteria" value={s.criteria} onChange={e=>setSeg(i,'criteria',e.target.value)} style={{marginTop:8}}/>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-chip" style={{marginTop:8}} onClick={()=>setSegments(a=>[...a,{name:'',criteria:''}])}>+ Add another</button>
                </>
              )}

              {already && (
                <div className="card" style={{marginTop:8}}>
                  <b>Upgrade suggestions</b>
                  <ul className="list">
                    <li>Add 1 dynamic block per segment (headline/product).</li>
                    <li>Test a 3-email sequence: nudge → social proof → offer.</li>
                    <li>Layer time window (last 14d vs 90d) to increase freshness.</li>
                  </ul>
                </div>
              )}

              <input className="input" placeholder="Your one goal for the next month" value={goal} onChange={e=>setGoal(e.target.value)} style={{marginTop:12}}/>

              <div className="spaced" style={{marginTop:18}}>
                <button className="btn" onClick={()=>setStep(0)}>Back</button>
                <button className="btn btn-primary" onClick={()=>setStep(2)}>I’ve done this step</button>
              </div>
            </section>
          )}

          {step===2 && (
            <section style={{marginTop:12}}>
              <b>Evolve</b>
              <p className="help" style={{marginTop:6}}>{day.reflection}</p>
              <textarea className="textarea" placeholder="One insight or blocker…" value={note} onChange={e=>setNote(e.target.value)} />

              <div className="row two" style={{marginTop:10}}>
                <div className="card">
                  <b>Update a KPI (optional)</b>
                  {cats.length===0 ? <p className="help" style={{marginTop:6}}>No KPIs yet. Add some in <Link href="/kpis">KPIs</Link>.</p> : (
                    <>
                      <select className="select" value={kCat} onChange={e=>{ setKCat(e.target.value); setKMetric(''); }} style={{marginTop:8}}>
                        {cats.map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                      <select className="select" value={kMetric} onChange={e=>setKMetric(e.target.value)} style={{marginTop:8}}>
                        <option value="">Select metric</option>
                        {Object.keys(kpisObj.categories[kCat].metrics).map(m=><option key={m} value={m}>{m}</option>)}
                      </select>
                      <input className="input" type="number" placeholder="New value" value={kNew} onChange={e=>setKNew(e.target.value)} style={{marginTop:8}}/>
                    </>
                  )}
                </div>
                <div className="card">
                  <b>How useful?</b>
                  <div className="inline" style={{marginTop:8}}>
                    {[1,2,3,4,5].map(n=><button key={n} className="btn" onClick={()=>setRating(n)} style={{borderColor: rating===n?'var(--accent)':'var(--border)'}}>{n}</button>)}
                  </div>
                </div>
              </div>

              <div className="spaced" style={{marginTop:18}}>
                <button className="btn" onClick={()=>setStep(1)}>Back</button>
                <button className="btn btn-primary" onClick={save}>Save & get coach feedback</button>
              </div>
            </section>
          )}

          {step===3 && (
            <section style={{marginTop:12}}>
              <b>Coach now</b>
              <ul className="list">
                <li>If CTR ≥ 2.5% this week, ship the second email with tighter hook.</li>
                <li>If CTR &lt; 2.5%, test subject line: curiosity + specificity.</li>
                <li>Schedule a 10-minute slot tomorrow to iterate.</li>
              </ul>
              <div className="spaced" style={{marginTop:18}}>
                <Link className="btn" href="/dashboard">Go to dashboard</Link>
                <button className="btn btn-primary" onClick={()=>window.location.assign('/coach')}>Talk to coach</button>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
