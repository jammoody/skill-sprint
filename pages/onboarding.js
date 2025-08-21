// pages/onboarding.js
import { useMemo, useState, useEffect } from 'react';
import Nav from '../components/Nav';
import { setProfile, getKPIs, setOnboardedAt, getOnboardedAt } from '../lib/store';

const FOCUS = ['Marketing','E-commerce','Leadership','Operations','Sales','General'];
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
  const [step,setStep]=useState(0);
  const [jd,setJD]=useState(''); const [jdFile,setJDFile]=useState('');
  const [focus,setFocus]=useState('Marketing');
  const [areas,setAreas]=useState([]);
  const [goals,setGoals]=useState(['','','']);
  const [minutes,setMinutes]=useState(10);
  const [companyWebsite,setCompanyWebsite]=useState('');
  const [already,setAlready]=useState(null);

  useEffect(()=>{ setAlready(getOnboardedAt()); },[]);

  const steps = useMemo(()=>[
    {title:'Paste or upload your job description', key:'jd'},
    {title:'Choose focus & areas', key:'areas'},
    {title:'Top 3 goals (30 days)', key:'goals'},
    {title:'Daily cadence', key:'cad'},
    {title:'Summary', key:'summary'},
  ],[]);
  const progress = ((step+1)/steps.length)*100;

  async function onFile(e){
    const f = e.target.files?.[0]; if(!f) return; setJDFile(f.name);
    if (f.type.startsWith('text/')) onJD(await f.text());
    else alert('Upload .txt for now (paste text if PDF).');
  }
  function onJD(text){ setJD(text); const { focus:f, areas:a } = fromJD(text); if (f) setFocus(f); if (a?.length) setAreas(prev=>Array.from(new Set([...prev,...a]))); }
  function toggleArea(a){ setAreas(prev=>prev.includes(a)? prev.filter(x=>x!==a) : [...prev,a]); }
  function setGoal(i,val){ const g=[...goals]; g[i]=val; setGoals(g); }
  function next(){ step<steps.length-1 ? setStep(step+1) : finish(); }
  function back(){ if(step>0) setStep(step-1); }

  function finish(){
    const gs = goals.filter(Boolean);
    setProfile({
      focus:[focus],
      areas,
      constraints:{minutesPerDay:Number(minutes)},
      goals30d: gs, goal30d: gs[0] || 'Make visible progress',
      jobDescription: jd ? { text: jd, fileName: jdFile || null } : null,
      companyWebsite: companyWebsite || null
    });
    if (!getKPIs().categories) localStorage.setItem('ss_kpis', JSON.stringify({categories:{}}));
    setOnboardedAt(Date.now());
    window.location.assign('/dashboard');
  }

  return (
    <>
      <Nav active="onboard" />
      <main className="container">
        {already && (
          <div className="card" style={{marginTop:12, background:'#f7fbff', borderColor:'#d8ecfb'}}>
            <b>Onboarding complete</b>
            <p style={{opacity:.8}}>You can update answers anytime. Prefer to keep coaching? <a href="/coach">Go to Coach →</a></p>
          </div>
        )}

        <div className="card" style={{marginTop:18}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
            <div><div style={{fontSize:12,opacity:.7}}>Step {step+1} of {steps.length}</div><h2 style={{margin:'6px 0 8px 0'}}>{steps[step].title}</h2></div>
            <div style={{minWidth:220}}><div className="progress"><span style={{width:`${progress}%`}}/></div></div>
          </div>

          {/* JD */}
          {steps[step].key==='jd' && (
            <section style={{marginTop:8,display:'grid',gap:12,gridTemplateColumns:'1fr'}}>
              <div className="card">
                <b>Company website (optional)</b>
                <input className="input" placeholder="https://yourcompany.com" value={companyWebsite} onChange={e=>setCompanyWebsite(e.target.value)} style={{marginTop:8}} />
              </div>
              <div className="card">
                <b>Paste job description</b>
                <textarea className="textarea" placeholder="Paste text…" value={jd} onChange={e=>onJD(e.target.value)} />
                <p style={{opacity:.7}}>We detect signals (email/SEO/ads/process) to prefill focus & areas.</p>
              </div>
              <div className="card">
                <b>Upload (.txt for now)</b>
                <input className="input" type="file" accept=".txt,text/plain" onChange={onFile}/>
                {jdFile && <p style={{fontSize:12,marginTop:6}}>Uploaded: {jdFile}</p>}
              </div>
            </section>
          )}

          {/* Areas */}
          {steps[step].key==='areas' && (
            <section style={{marginTop:8}}>
              <b>Focus</b>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
                {FOCUS.map(f=>(
                  <button key={f} className="btn btn-chip" onClick={()=>setFocus(f)} style={{borderColor: focus===f?'#A78BFA':'#E5E7EB'}}>{f}</button>
                ))}
              </div>
              <b style={{display:'block',marginTop:14}}>Areas</b>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
                {AREAS.map(a=>(
                  <button key={a} className="btn btn-chip" onClick={()=>toggleArea(a)} style={{borderColor: areas.includes(a)?'#60A5FA':'#E5E7EB'}}>{areas.includes(a)?'✓ ':''}{a}</button>
                ))}
              </div>
            </section>
          )}

          {/* Goals */}
          {steps[step].key==='goals' && (
            <section style={{display:'grid',gap:10,marginTop:8}}>
              <b>Top 3 goals (30 days)</b>
              <input className="input" placeholder="Goal 1 (e.g., Increase email revenue by 20%)" value={goals[0]} onChange={e=>setGoal(0,e.target.value)} />
              <input className="input" placeholder="Goal 2 (optional)" value={goals[1]} onChange={e=>setGoal(1,e.target.value)} />
              <input className="input" placeholder="Goal 3 (optional)" value={goals[2]} onChange={e=>setGoal(2,e.target.value)} />
            </section>
          )}

          {/* Cadence */}
          {steps[step].key==='cad' && (
            <section style={{display:'grid',gap:10,marginTop:8}}>
              <b>Daily minutes you can give</b>
              <input className="input" type="number" min="5" max="60" value={minutes} onChange={e=>setMinutes(e.target.value)} />
              <p style={{opacity:.7}}>We’ll keep sprints to ~{minutes} minutes.</p>
            </section>
          )}

          {/* Summary */}
          {steps[step].key==='summary' && (
            <section className="card" style={{marginTop:8}}>
              <b>Summary</b>
              <ul style={{margin:'8px 0 0 18px'}}>
                <li><b>Website:</b> {companyWebsite || '—'}</li>
                <li><b>Focus:</b> {focus}</li>
                <li><b>Areas:</b> {areas.length? areas.join(' • ') : '—'}</li>
                <li><b>Goals (30d):</b> {goals.filter(Boolean).join(' • ') || 'Make visible progress'}</li>
                <li><b>Daily minutes:</b> {minutes}</li>
                {jd && <li><b>JD provided:</b> yes</li>}
              </ul>
            </section>
          )}

          <div style={{display:'flex',justifyContent:'space-between',gap:8,marginTop:14}}>
            <button className="btn" onClick={back} disabled={step===0}>Back</button>
            <button className="btn btn-primary" onClick={next}>{step===steps.length-1?'Finish':'Continue'}</button>
          </div>
        </div>
      </main>
    </>
  );
}