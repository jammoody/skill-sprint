// pages/onboarding.js
import { useMemo, useState } from 'react';
import Nav from '../components/Nav';
import { setProfile, getKPIs } from '../lib/store';

const FOCUS = ['Marketing','E-commerce','Leadership','Operations','Sales','General'];
const STYLE_OPTIONS = [
  { key:'supportive', label:'Supportive', sub:'Encouraging and positive' },
  { key:'direct', label:'Direct', sub:'Clear and to the point' },
  { key:'analytical', label:'Analytical', sub:'Data-first and KPI-driven' }
];
const AREA_LIBRARY = [
  'Value proposition','Positioning','Lead gen','Email','Paid ads','SEO',
  'Conversion rate','Pricing','Customer success','Churn','Hiring','Process',
];

function extractFromJD(text=''){
  const lower = text.toLowerCase();
  const hits = [];
  const map = {
    marketing:['campaign','email','content','seo','brand','paid','ads','demand','lead'],
    ecommerce:['product page','cart','checkout','aov','catalog','merchandising'],
    leadership:['team','stakeholder','roadmap','kpi','strategy','cross-functional'],
    operations:['process','sla','ops','workflow','efficiency','throughput'],
    sales:['pipeline','crm','quota','prospect','closing','objection'],
  };
  const suggestions = new Set();
  for (const [area, kws] of Object.entries(map)) {
    if (kws.some(k=>lower.includes(k))) hits.push(area[0].toUpperCase()+area.slice(1));
  }
  if (lower.includes('email')) { suggestions.add('Email'); suggestions.add('Conversion rate'); }
  if (lower.includes('seo')) suggestions.add('SEO');
  if (lower.includes('ads') || lower.includes('paid')) suggestions.add('Paid ads');
  if (lower.includes('pipeline') || lower.includes('quota')) suggestions.add('Lead gen');
  if (lower.includes('process')) suggestions.add('Process');
  return {
    inferredFocus: hits[0] ? hits[0] : null,
    areas: Array.from(suggestions)
  };
}

export default function Onboarding(){
  const [mode,setMode]=useState('simple'); // 'simple' | 'enhanced'
  const [step,setStep]=useState(0);

  // shared
  const [focus,setFocus]=useState('Marketing');
  const [areas,setAreas]=useState([]);
  const [goal,setGoal]=useState('');
  const [style,setStyle]=useState('analytical');
  const [minutes,setMinutes]=useState(10);

  // enhanced
  const [jd,setJD]=useState('');
  const [jdFileName,setJDFileName]=useState('');

  const steps = useMemo(()=>{
    const base = [
      { title:'Choose onboarding mode', key:'mode' },
      ...(mode==='enhanced'
        ? [
            { title:'Paste or upload your job description', key:'jd' },
            { title:'Review suggested focus & areas', key:'areas' },
          ]
        : []),
      { title:'Pick your primary focus', key:'focus' },
      { title:'30-day outcome', key:'goal' },
      { title:'Coach style & cadence', key:'style' },
      { title:'Summary', key:'summary' },
    ];
    return base;
  },[mode]);

  const progress = ((step+1)/steps.length)*100;
  const next = ()=> step<steps.length-1 ? setStep(step+1) : finish();
  const back = ()=> step>0 && setStep(step-1);

  function onJDChange(text){
    setJD(text);
    const { inferredFocus, areas: recAreas } = extractFromJD(text);
    if (inferredFocus) setFocus(inferredFocus);
    if (recAreas?.length) setAreas(prev=>{
      const s = new Set(prev); recAreas.forEach(a=>s.add(a)); return Array.from(s);
    });
  }

  async function onFile(e){
    const f = e.target.files?.[0];
    if (!f) return;
    setJDFileName(f.name);
    if (f.type.startsWith('text/')) {
      const txt = await f.text();
      onJDChange(txt);
    } else {
      alert('For now, please upload .txt or paste your JD text. (PDF support coming soon)');
    }
  }

  function toggleArea(a){
    setAreas(prev => prev.includes(a) ? prev.filter(x=>x!==a) : [...prev, a]);
  }

  function finish(){
    const profile = {
      focus:[focus],
      areas,
      coachStyle:style,
      constraints:{ minutesPerDay:Number(minutes) },
      goal30d: goal || 'Make visible progress',
      jobDescription: jd ? { text: jd, fileName: jdFileName || null } : null
    };
    setProfile(profile);
    if (!getKPIs().categories) localStorage.setItem('ss_kpis', JSON.stringify({categories:{}}));
    window.location.assign('/coach');
  }

  return (
    <>
      <Nav active="onboard" />
      <main className="container">
        <div className="card" style={{marginTop:18}}>
          <div className="spaced">
            <div>
              <div className="small">Step {step+1} of {steps.length}</div>
              <h2 style={{margin:'6px 0 8px 0'}}>{steps[step].title}</h2>
            </div>
            <div style={{minWidth:220}}><div className="progress"><span style={{width:`${progress}%`}}/></div></div>
          </div>

          <div style={{marginTop:16}}>
            {steps[step].key==='mode' && (
              <section className="row two">
                <div className="card">
                  <b>Simple (fast)</b>
                  <p className="help" style={{marginTop:6}}>Pick a focus and goal. You can refine later.</p>
                  <button className="btn" style={{marginTop:8, borderColor: mode==='simple'?'var(--accent)':'var(--border)'}} onClick={()=>setMode('simple')}>Use Simple</button>
                </div>
                <div className="card">
                  <b>Enhanced (recommended)</b>
                  <p className="help" style={{marginTop:6}}>Paste or upload your job description so we tailor suggestions to your role.</p>
                  <button className="btn" style={{marginTop:8, borderColor: mode==='enhanced'?'var(--accent)':'var(--border)'}} onClick={()=>setMode('enhanced')}>Use Enhanced</button>
                </div>
              </section>
            )}

            {steps[step].key==='jd' && (
              <section className="row two">
                <div className="card">
                  <b>Paste job description (or responsibilities)</b>
                  <textarea className="textarea" placeholder="Paste the JD text here…" value={jd} onChange={e=>onJDChange(e.target.value)} />
                  <p className="help" style={{marginTop:6}}>We scan for signals (e.g., “email”, “pipeline”, “process”) to pre-fill focus and areas.</p>
                </div>
                <div className="card">
                  <b>Upload (.txt for now)</b>
                  <input className="input" type="file" accept=".txt,text/plain" onChange={onFile}/>
                  {jdFileName && <p className="small" style={{marginTop:6}}>Uploaded: {jdFileName}</p>}
                  <p className="help" style={{marginTop:8}}>PDF support coming soon — meanwhile, paste the text.</p>
                </div>
              </section>
            )}

            {steps[step].key==='areas' && (
              <section>
                <b>Suggested areas to focus</b>
                <p className="help" style={{marginTop:6}}>These came from your job description. Toggle any you want.</p>
                <div className="inline" style={{marginTop:8}}>
                  {AREA_LIBRARY.map(a=>(
                    <button key={a} className="btn btn-chip" onClick={()=>toggleArea(a)} style={{borderColor: areas.includes(a)?'var(--accent)':'var(--border)'}}>
                      {areas.includes(a)?'✓ ':''}{a}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {steps[step].key==='focus' && (
              <section>
                <b>Your primary focus</b>
                <div className="row" style={{gridTemplateColumns:'repeat(3,minmax(0,1fr))', marginTop:8}}>
                  {FOCUS.map(f=>(
                    <button key={f} className="btn" onClick={()=>setFocus(f)}
                      style={{borderColor: focus===f ? 'var(--accent)' : 'var(--border)', fontWeight: focus===f?800:600}}>
                      {f}
                    </button>
                  ))}
                </div>
                <p className="help" style={{marginTop:8}}>Used to seed your first coach reply and sprint suggestions.</p>
              </section>
            )}

            {steps[step].key==='goal' && (
              <section className="row two">
                <div className="card">
                  <b>Your #1 outcome (30 days)</b>
                  <input className="input" placeholder="e.g., Increase email revenue by 20%" value={goal} onChange={e=>setGoal(e.target.value)} style={{marginTop:8}} />
                  <p className="help" style={{marginTop:8}}>Short and specific helps me coach you better.</p>
                </div>
                <div className="card">
                  <b>Inspiration</b>
                  <div className="inline" style={{marginTop:8}}>
                    {['More leads','Higher conversion','Ship faster','Reduce churn'].map(x=>(
                      <button key={x} className="btn btn-chip" onClick={()=>setGoal(x)}>{x}</button>
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
                    {STYLE_OPTIONS.map(s=>(
                      <button key={s.key} className="btn" onClick={()=>setStyle(s.key)}
                        style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:4, borderColor: style===s.key?'var(--accent)':'var(--border)'}}>
                        <span style={{fontWeight:800}}>{s.label}</span>
                        <span className="small">{s.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <b>Daily cadence</b>
                  <input className="input" type="number" min="5" max="60" value={minutes} onChange={e=>setMinutes(e.target.value)} style={{marginTop:8}}/>
                  <p className="help" style={{marginTop:8}}>We’ll keep sprints to ~{minutes} minutes.</p>
                </div>
              </section>
            )}

            {steps[step].key==='summary' && (
              <section className="row two">
                <div className="card">
                  <b>Summary</b>
                  <ul className="list" style={{marginTop:8}}>
                    <li><b>Focus:</b> {focus}</li>
                    <li><b>Areas:</b> {areas.length? areas.join(' • ') : '—'}</li>
                    <li><b>Goal (30d):</b> {goal || 'Make visible progress'}</li>
                    <li><b>Coach style:</b> {STYLE_OPTIONS.find(s=>s.key===style)?.label || style}</li>
                    <li><b>Daily minutes:</b> {minutes}</li>
                    {jd && <li><b>JD provided:</b> yes</li>}
                  </ul>
                </div>
                <div className="card">
                  <b>What happens next</b>
                  <p className="help">We’ll tailor your first coach answers and sprint suggestions to your role and chosen areas.</p>
                </div>
              </section>
            )}
          </div>

          <div className="spaced" style={{marginTop:18}}>
            <button className="btn" onClick={back} disabled={step===0} style={{opacity:step===0?.5:1}}>Back</button>
            <button className="btn btn-primary" onClick={next}>{step===steps.length-1?'Finish':'Continue'}</button>
          </div>
        </div>
      </main>
    </>
  );
}
