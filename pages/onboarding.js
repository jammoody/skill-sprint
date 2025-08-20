// pages/onboarding.js
import { useMemo, useState } from 'react';
import Nav from '@/components/Nav';
import { setProfile, getKPIs } from '@/lib/store';

const FOCUS = ['Marketing','E-commerce','Leadership','Operations','Sales','General'];
const STYLE = [
  { key:'supportive', label:'Supportive', sub:'Encouraging and positive' },
  { key:'direct', label:'Direct', sub:'Clear and to the point' },
  { key:'analytical', label:'Analytical', sub:'Data-first and KPI-driven' }
];
const AREAS = ['Email','Paid ads','SEO','Conversion rate','Pricing','Analytics','Customer success','Process','Lead gen'];

function fromJD(text=''){
  const lower = text.toLowerCase(); const sug=new Set();
  if (lower.includes('email')) {sug.add('Email');sug.add('Conversion rate');}
  if (lower.includes('ads')||lower.includes('paid')) sug.add('Paid ads');
  if (lower.includes('seo')) sug.add('SEO');
  if (lower.includes('pipeline')||lower.includes('quota')) sug.add('Lead gen');
  if (lower.includes('process')) sug.add('Process');
  const focus = lower.includes('ecommerce') ? 'E-commerce'
             : lower.includes('marketing') ? 'Marketing'
             : null;
  return { focus, areas:[...sug] };
}

export default function Onboarding(){
  const [mode,setMode]=useState('enhanced');
  const [step,setStep]=useState(0);
  const [focus,setFocus]=useState('Marketing');
  const [areas,setAreas]=useState([]);
  const [goals,setGoals]=useState(['','','']);
  const [style,setStyle]=useState('analytical');
  const [minutes,setMinutes]=useState(10);
  const [companyWebsite,setCompanyWebsite]=useState('');
  const [jd,setJD]=useState(''); const [jdFile,setJDFile]=useState('');

  const steps = useMemo(()=>[
    {title:'Choose onboarding mode', key:'mode'},
    ...(mode==='enhanced' ? [
      {title:'Paste or upload your job description', key:'jd'},
      {title:'Review suggested focus & areas', key:'areas'},
    ]: []),
    {title:'Your company & focus', key:'focus'},
    {title:'Top 3 goals (30 days)', key:'goals'},
    {title:'Coach style & cadence', key:'style'},
    {title:'Summary', key:'summary'},
  ],[mode]);
  const progress = ((step+1)/steps.length)*100;

  function next(){ step<steps.length-1 ? setStep(step+1) : finish(); }
  function back(){ if(step>0) setStep(step-1); }

  function onJD(text){
    setJD(text);
    const { focus:f, areas:a } = fromJD(text);
    if (f) setFocus(f);
    if (a?.length) setAreas(prev=>Array.from(new Set([...prev,...a])));
  }

  async function onFile(e){
    const f = e.target.files?.[0]; if(!f) return; setJDFile(f.name);
    if (f.type.startsWith('text/')) onJD(await f.text());
    else alert('Upload .txt for now (paste text if PDF).');
  }

  function toggleArea(a){ setAreas(prev=>prev.includes(a) ? prev.filter(x=>x!==a) : [...prev,a]); }
  function setGoal(i,val){ const g=[...goals]; g[i]=val; setGoals(g); }

  function finish(){
    const gs = goals.filter(Boolean);
    setProfile({
      focus:[focus],
      areas,
      coachStyle:style,
      constraints:{minutesPerDay:Number(minutes)},
      goals30d: gs, goal30d: gs[0] || 'Make visible progress',
      jobDescription: jd ? { text: jd, fileName: jdFile || null } : null,
      companyWebsite: companyWebsite || null
    });
    if (!getKPIs().categories) localStorage.setItem('ss_kpis', JSON.stringify({categories:{}}));
    window.location.assign('/coach');
  }

  return (
    <>
      <Nav active="onboard" />
      <main className="container">
        <div className="card" style={{marginTop:18}}>
          <div className="spaced">
            <div><div className="small">Step {step+1} of {steps.length}</div><h2 style={{margin:'6px 0 8px 0'}}>{steps[step].title}</h2></div>
            <div style={{minWidth:220}}><div className="progress"><span style={{width:`${progress}%`}}/></div></div>
          </div>

          <div style={{marginTop:12}}>
            {steps[step].key==='mode' && (
              <section className="row two">
                <div className="card">
                  <b>Simple (fast)</b>
                  <p className="help">Pick a focus and goals. Refine later.</p>
                  <button className="btn" onClick={()=>setMode('simple')}>Use Simple</button>
                </div>
                <div className="card">
                  <b>Enhanced (recommended)</b>
                  <p className="help">Paste/upload your job description for tailored coaching.</p>
                  <button className="btn" onClick={()=>setMode('enhanced')}>Use Enhanced</button>
                </div>
              </section>
            )}

            {steps[step].key==='jd' && (
              <section className="row two">
                <div className="card">
                  <b>Paste job description</b>
                  <textarea className="textarea" placeholder="Paste text…" value={jd} onChange={e=>onJD(e.target.value)} />
                  <p className="help">We detect signals (email/SEO/ads/process) to prefill focus & areas.</p>
                </div>
                <div className="card">
                  <b>Upload (.txt for now)</b>
                  <input className="input" type="file" accept=".txt,text/plain" onChange={onFile}/>
                  {jdFile && <p className="small" style={{marginTop:6}}>Uploaded: {jdFile}</p>}
                </div>
              </section>
            )}

            {steps[step].key==='areas' && (
              <section>
                <b>Suggested areas</b>
                <div className="inline" style={{marginTop:8}}>
                  {AREAS.map(a=>(
                    <button key={a} className="btn btn-chip" onClick={()=>toggleArea(a)} style={{borderColor: areas.includes(a)?'var(--accent)':'var(--border)'}}>
                      {areas.includes(a)?'✓ ':''}{a}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {steps[step].key==='focus' && (
              <section className="row two">
                <div className="card">
                  <b>Company website (optional)</b>
                  <input className="input" placeholder="https://yourcompany.com" value={companyWebsite} onChange={e=>setCompanyWebsite(e.target.value)} style={{marginTop:8}} />
                  <p className="help">Improves examples & suggestions.</p>
                </div>
                <div className="card">
                  <b>Your primary focus</b>
                  <div className="row" style={{gridTemplateColumns:'repeat(3,minmax(0,1fr))', marginTop:8}}>
                    {FOCUS.map(f=>(
                      <button key={f} className="btn" onClick={()=>setFocus(f)} style={{borderColor: focus===f ? 'var(--accent)' : 'var(--border)', fontWeight: focus===f?800:600}}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {steps[step].key==='goals' && (
              <section className="row two">
                <div className="card">
                  <b>Top 3 goals (30 days)</b>
                  <input className="input" placeholder="Goal 1 (e.g., Increase email revenue by 20%)" value={goals[0]} onChange={e=>setGoal(0,e.target.value)} style={{marginTop:8}} />
                  <input className="input" placeholder="Goal 2 (optional)" value={goals[1]} onChange={e=>setGoal(1,e.target.value)} style={{marginTop:8}} />
                  <input className="input" placeholder="Goal 3 (optional)" value={goals[2]} onChange={e=>setGoal(2,e.target.value)} style={{marginTop:8}} />
                </div>
                <div className="card">
                  <b>Inspiration</b>
                  <div className="inline" style={{marginTop:8}}>
                    {['Lift open rate','Improve CTR','Boost CVR','Reduce churn','Increase AOV','Ship faster'].map(x=>(
                      <button key={x} className="btn btn-chip" onClick={()=>{
                        if(!goals[0]) setGoal(0,x); else if(!goals[1]) setGoal(1,x); else setGoal(2,x);
                      }}>{x}</button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {steps[step].key==='style' && (
              <section className="row two">
                <div className="card">
                  <b>Coach style</b>
                  <div className="row" style={{marginTop:8}}>
                    {STYLE.map(s=>(
                      <button key={s.key} className="btn" onClick={()=>setStyle(s.key)}
                        style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:4, borderColor: style===s.key?'var(--accent)':'var(--border)'}}>
                        <span style={{fontWeight:800}}>{s.label}</span><span className="small">{s.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <b>Daily cadence</b>
                  <input className="input" type="number" min="5" max="60" value={minutes} onChange={e=>setMinutes(e.target.value)} style={{marginTop:8}}/>
                  <p className="help">We’ll keep sprints to ~{minutes} minutes.</p>
                </div>
              </section>
            )}

            {steps[step].key==='summary' && (
              <section className="row two">
                <div className="card">
                  <b>Summary</b>
                  <ul className="list" style={{marginTop:8}}>
                    <li><b>Website:</b> {companyWebsite || '—'}</li>
                    <li><b>Focus:</b> {focus}</li>
                    <li><b>Areas:</b> {areas.length? areas.join(' • ') : '—'}</li>
                    <li><b>Goals (30d):</b> {goals.filter(Boolean).join(' • ') || 'Make visible progress'}</li>
                    <li><b>Coach style:</b> {STYLE.find(s=>s.key===style)?.label || style}</li>
                    <li><b>Daily minutes:</b> {minutes}</li>
                    {jd && <li><b>JD provided:</b> yes</li>}
                  </ul>
                </div>
                <div className="card">
                  <b>What happens next</b>
                  <p className="help">Your coach will use this context to suggest sprints and answer live questions.</p>
                </div>
              </section>
            )}
          </div>

          <div className="spaced" style={{marginTop:18}}>
            <button className="btn" onClick={back} disabled={step===0}>Back</button>
            <button className="btn btn-primary" onClick={next}>{step===steps.length-1?'Finish':'Continue'}</button>
          </div>
        </div>
      </main>
    </>
  );
}
