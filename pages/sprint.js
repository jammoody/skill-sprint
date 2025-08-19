// pages/sprint.js
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Nav from '../components/Nav';
import CoachDock from '../components/CoachDock';
import { getProfile, getKPIs, setKPIs, getSprintById, updateSprint, setSprintStatus } from '../lib/store';

const SUGGESTED_LIBRARY = {
  Marketing: [
    { name:'Repeat buyers (90 days)', criteria:'Purchased ≥2 in 90d', why:'Warmer audience; quick lift.' },
    { name:'Browsed-abandoners (14 days)', criteria:'Visited product, no purchase (14d)', why:'Fresh intent → higher CTR/CVR.' },
    { name:'High AOV customers', criteria:'Top 20% AOV', why:'Small list, outsized revenue per send.' },
  ],
  'E-commerce': [
    { name:'Add-to-cart no checkout', criteria:'Added to cart, no order (7d)', why:'Closest to purchase; easy win.' },
    { name:'First-time buyers (30 days)', criteria:'1 order in 30d', why:'Onboarding + cross-sell lifts LTV.' },
    { name:'Lapsed buyers', criteria:'No purchase in 180d', why:'Reactivation can recover dormants.' },
  ],
  General: [
    { name:'Recent engagers', criteria:'Opened/clicked in 30d', why:'Active audience → quick signal.' },
    { name:'Prospects by source', criteria:'Came from source X', why:'Match message to acquisition.' },
  ]
};

export default function Sprint(){
  const router = useRouter();
  const { sid } = router.query || {};
  const profile = useMemo(()=>getProfile(),[]);
  const kpisObj = useMemo(()=>getKPIs(),[]);
  const [sprint,setSprint] = useState(null);

  const steps=['Learn','Apply','Evolve','Coach'];
  const [step,setStep]=useState(0);
  const [expand,setExpand]=useState({ examples:true, why:true, case:false });
  const [segments,setSegments]=useState([{name:'',criteria:''},{name:'',criteria:''}]);
  const [guided, setGuided] = useState(false);
  const [openWhy, setOpenWhy] = useState({});
  const [already,setAlready]=useState(false);
  const [upgrade,setUpgrade]=useState(false);
  const [goal,setGoal]=useState('');
  const [note,setNote]=useState('');
  const [rating,setRating]=useState(0);

  const cats = Object.keys(kpisObj.categories||{});
  const [kCat,setKCat]=useState(cats[0]||'');
  const [kMetric,setKMetric]=useState('');
  const [kNew,setKNew]=useState('');

  const focusKey = (profile?.focus?.[0] && SUGGESTED_LIBRARY[profile.focus[0]]) ? profile.focus[0] : 'General';
  const suggestions = SUGGESTED_LIBRARY[focusKey] || [];

  useEffect(()=>{
    if (!profile) { if (typeof window!=='undefined') window.location.assign('/onboarding'); return; }
    if (!sid) return;
    const s = getSprintById(String(sid));
    if (!s) { window.location.assign('/sprints'); return; }
    setSprint(s);
    const d = s.data || {};
    setStep(d.step ?? 0);
    setExpand(d.expand ?? {examples:true,why:true,case:false});
    setSegments(d.segments ?? [{name:'',criteria:''},{name:'',criteria:''}]);
    setGuided(d.guided ?? false);
    setOpenWhy({});
    setAlready(d.already ?? false);
    setUpgrade(d.upgrade ?? false);
    setGoal(d.goal ?? '');
    setNote(d.note ?? '');
    setRating(d.rating ?? 0);
  },[sid, profile]);

  const progress=((step+1)/steps.length)*100;
  const setSeg = (i, field, val) => setSegments(arr=>{ const x=[...arr]; x[i]={...x[i],[field]:val}; return x; });

  function persist(patch){
    if (!sprint) return;
    const data = {
      step, expand, segments, guided, already, upgrade, goal, note, rating,
      ...patch?.data
    };
    const saved = updateSprint(sprint.id, { data, ...(patch||{}) });
    setSprint(saved);
  }

  function saveAndFinish(){
    if (kCat && kMetric && kNew!=='') {
      const clone = JSON.parse(JSON.stringify(kpisObj));
      const row = (((clone.categories||{})[kCat]||{}).metrics||{})[kMetric];
      if (row) row.current = Number(kNew);
      setKPIs(clone);
    }
    persist({ data: { completedAt: new Date().toISOString() } });
    setSprintStatus(sprint.id, 'done');
    router.push('/dashboard');
  }

  if (!sprint) {
    return (
      <>
        <Nav active="today" />
        <main className="container">
          <div className="card" style={{marginTop:18}}>
            <h2>No sprint loaded</h2>
            <p className="help">This page expects a sprint id in the URL.</p>
            <Link className="btn" href="/sprints">View all sprints</Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav active="today" />
      <main className="container">
        <div className="card" style={{marginTop:18}}>
          <div className="spaced">
            <div>
              <div className="small">Step {step+1} of 4 • {profile?.focus?.[0]||'General'}</div>
              <h2 style={{margin:'6px 0 8px 0'}}>{sprint.title}</h2>
            </div>
            <div style={{minWidth:240}}><div className="progress"><span style={{width:`${progress}%`}}/></div></div>
          </div>

          {/* LEARN */}
          {step===0 && (
            <section style={{marginTop:12}}>
              <p><b>Answer (brief):</b> Create two intent-based segments you can email this week; send 3 emails (nudge • proof • offer); watch CTR → CVR.</p>
              <div className="inline" style={{marginTop:12}}>
                <button className="btn btn-chip" onClick={()=>setExpand(e=>({...e, examples:!e.examples}))}>{expand.examples?'Hide':'Show'} examples</button>
                <button className="btn btn-chip" onClick={()=>setExpand(e=>({...e, case:!e.case}))}>{expand.case?'Hide':'Mini case'}</button>
                <button className="btn btn-chip" onClick={()=>setExpand(e=>({...e, why:!e.why}))}>{expand.why?'Hide':'Why this works'}</button>
              </div>
              {expand.examples && <div className="card" style={{marginTop:12}}><b>Examples</b><ul className="list"><li>Repeat buyers (90d)</li><li>Browsed-abandoners (14d)</li><li>High AOV customers</li></ul></div>}
              {expand.case && <div className="card" style={{marginTop:12}}><b>Mini case</b><p className="help">A DTC brand created two segments and sent 3 emails. CTR +0.8pp; revenue +12% in 2 weeks.</p></div>}
              {expand.why && <div className="card" style={{marginTop:12}}><b>Why this works</b><ul className="list"><li>Relevance → higher CTR → higher CVR.</li><li>Small, intentful lists avoid fatigue.</li><li>3-email sequences compound impact.</li></ul></div>}
              <div className="spaced" style={{marginTop:18}}>
                <button className="btn" disabled>Back</button>
                <button className="btn btn-primary" onClick={()=>{ setStep(1); persist({data:{step:1}}); }}>Continue</button>
              </div>
            </section>
          )}

          {/* APPLY */}
          {step===1 && (
            <section style={{marginTop:12}}>
              <b>Task</b>
              <p className="help" style={{marginTop:6}}>Create 2 segments you can email this week.</p>

              <div className="inline" style={{gap:18, margin:'8px 0'}}>
                <label className="inline" style={{gap:8}}>
                  <input type="checkbox" checked={already} onChange={e=>{ setAlready(e.target.checked); persist(); }} />
                  <span>I’ve already done this</span>
                </label>
                {already && (
                  <label className="inline" style={{gap:8}}>
                    <input type="checkbox" checked={upgrade} onChange={e=>{ setUpgrade(e.target.checked); persist(); }} />
                    <span>Show next-level version</span>
                  </label>
                )}
                {!already && (
                  <button className="btn btn-chip" onClick={()=>{ setGuided(g=>!g); persist(); }}>
                    {guided ? 'Hide suggestions' : 'I’m new to this — suggest ideas'}
                  </button>
                )}
              </div>

              {!already && guided && (
                <div className="card" style={{marginTop:8}}>
                  <b>Suggested segments for {focusKey}</b>
                  <div className="row" style={{marginTop:8}}>
                    {suggestions.map((s, i)=>(
                      <div key={i} className="card">
                        <div className="spaced">
                          <div>
                            <div style={{fontWeight:700}}>{s.name}</div>
                            <div className="small">Criteria: {s.criteria}</div>
                          </div>
                          <div className="inline">
                            <button className="btn btn-chip" onClick={()=>{ setSegments(arr=>{ const next=[...arr, {name:s.name, criteria:s.criteria}]; persist({data:{segments:next}}); return next;}); }}>+ Add</button>
                            <button className="btn btn-chip" onClick={()=>setOpenWhy(o=>({...o, [i]:!o[i]}))}>{openWhy[i] ? 'Hide why' : 'Why this works'}</button>
                          </div>
                        </div>
                        {openWhy[i] && <p className="help" style={{marginTop:6}}>{s.why}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!already && (
                <>
                  <div className="row" style={{marginTop:8}}>
                    {segments.map((s, i)=>(
                      <div key={i} className="card">
                        <b>Segment {i+1}</b>
                        <input className="input" placeholder="Name" value={s.name} onChange={e=>{ const v=e.target.value; setSeg(i,'name',v); persist(); }} style={{marginTop:8}}/>
                        <input className="input" placeholder="Criteria" value={s.criteria} onChange={e=>{ const v=e.target.value; setSeg(i,'criteria',v); persist(); }} style={{marginTop:8}}/>
                      </div>
                    ))}
                  </div>
                  <button className="btn btn-chip" style={{marginTop:8}} onClick={()=>{ const next=[...segments,{name:'',criteria:''}]; setSegments(next); persist({data:{segments:next}}); }}>+ Add another</button>
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

              <input className="input" placeholder="Your one goal for the next month" value={goal} onChange={e=>{ setGoal(e.target.value); persist(); }} style={{marginTop:12}}/>

              <div className="spaced" style={{marginTop:18}}>
                <button className="btn" onClick={()=>{ setStep(0); persist({data:{step:0}}); }}>Back</button>
                <button className="btn btn-primary" onClick={()=>{ setStep(2); persist({data:{step:2}}); }}>I’ve done this step</button>
              </div>
            </section>
          )}

          {/* EVOLVE */}
          {step===2 && (
            <section style={{marginTop:12}}>
              <b>Evolve</b>
              <p className="help" style={{marginTop:6}}>What did you try (≤10 min)? What changed (number/observation)? What will you do tomorrow?</p>
              <textarea className="textarea" placeholder="One insight or blocker…" value={note} onChange={e=>{ setNote(e.target.value); persist(); }} />

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
                    {[1,2,3,4,5].map(n=><button key={n} className="btn" onClick={()=>{ setRating(n); persist(); }} style={{borderColor: rating===n?'var(--accent)':'var(--border)'}}>{n}</button>)}
                  </div>
                </div>
              </div>

              <div className="spaced" style={{marginTop:18}}>
                <button className="btn" onClick={()=>{ setStep(1); persist({data:{step:1}}); }}>Back</button>
                <button className="btn btn-primary" onClick={()=>{ setStep(3); persist({data:{step:3}}); }}>Save to get coach tips</button>
              </div>
            </section>
          )}

          {/* COACH */}
          {step===3 && (
            <section style={{marginTop:12}}>
              <b>Coach now</b>
              <ul className="list">
                <li>If CTR ≥ 2.5% this week, ship the second email with tighter hook.</li>
                <li>If CTR &lt; 2.5%, test subject line: curiosity + specificity.</li>
                <li>Schedule a 10-minute slot tomorrow to iterate.</li>
              </ul>
              <div className="spaced" style={{marginTop:18}}>
                <Link className="btn" href="/sprints">All sprints</Link>
                <button className="btn btn-primary" onClick={saveAndFinish}>Mark done</button>
              </div>
            </section>
          )}
        </div>

        {/* Context-aware coach on this page */}
        <CoachDock context={{ label:`Sprint • ${steps[step]} step`, step: steps[step], suggestedTitle:'Unblock today’s step' }} />
      </main>
    </>
  );
}
