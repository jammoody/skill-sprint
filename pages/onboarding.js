// pages/onboarding.js
import { useMemo, useState } from 'react';
import Link from 'next/link';
import Nav from '../components/Nav';
import { setProfile, getKPIs } from '../lib/store';

const FOCUS = ['Marketing','E-commerce','Leadership','Operations','Sales','General'];
const STYLES = [
  { key:'supportive', label:'Supportive', sub:'Encouraging and positive' },
  { key:'direct', label:'Direct', sub:'Clear and to the point' },
  { key:'analytical', label:'Analytical', sub:'Data-first and KPI-driven' }
];

export default function Onboarding(){
  const [step,setStep]=useState(0);
  const [focus,setFocus]=useState('Marketing');
  const [goal,setGoal]=useState('');
  const [style,setStyle]=useState('analytical');
  const [minutes,setMinutes]=useState(10);
  const [prefExamples,setPrefExamples]=useState(true);

  const steps = useMemo(()=>[
    { title:'What’s your primary focus?', render: FocusStep },
    { title:'What outcome do you want in 30 days?', render: GoalStep },
    { title:'Pick your coach style', render: StyleStep },
    { title:'Any preferences?', render: PrefStep },
    { title:'Summary', render: SummaryStep },
  ],[]);
  const progress = ((step+1)/steps.length)*100;
  const next = ()=> step<steps.length-1 ? setStep(step+1) : finish();
  const back = ()=> step>0 && setStep(step-1);

  function finish(){
    const profile = { focus:[focus], coachStyle:style, constraints:{ minutesPerDay:Number(minutes), prefersExamples:prefExamples }, goal30d: goal || 'Make visible progress' };
    setProfile(profile);
    if (!getKPIs().categories) localStorage.setItem('ss_kpis', JSON.stringify({categories:{}}));
    window.location.assign('/coach');
  }

  const Current = steps[step].render;
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
            <Current {...{focus,setFocus,goal,setGoal,style,setStyle,minutes,setMinutes,prefExamples,setPrefExamples}} />
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

function FocusStep({focus,setFocus}){
  return (
    <>
      <div className="row" style={{gridTemplateColumns:'repeat(3,minmax(0,1fr))'}}>
        {FOCUS.map(f=>(
          <button key={f} className="btn" onClick={()=>setFocus(f)}
            style={{borderColor: focus===f ? 'var(--accent)' : 'var(--border)', fontWeight: focus===f?800:600}}>
            {f}
          </button>
        ))}
      </div>
      <p className="help" style={{marginTop:8}}>You can change this later.</p>
    </>
  );
}
function GoalStep({goal,setGoal}){
  return (
    <div className="row two">
      <div className="card">
        <b>Your #1 outcome (30 days)</b>
        <input className="input" placeholder="e.g., Increase email revenue by 20%" value={goal} onChange={e=>setGoal(e.target.value)} style={{marginTop:8}} />
        <p className="help" style={{marginTop:8}}>Short and specific helps me coach you better.</p>
      </div>
      <div className="card">
        <b>Need inspiration?</b>
        <div className="inline" style={{marginTop:8}}>
          {['More leads','Higher conversion','Ship faster','Reduce churn'].map(x=>(
            <button key={x} className="btn btn-chip" onClick={()=>setGoal(x)}>{x}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
function StyleStep({style,setStyle}){
  return (
    <div className="row">
      {STYLES.map(s=>(
        <button key={s.key} className="btn" onClick={()=>setStyle(s.key)}
          style={{display:'flex', flexDirection:'column', alignItems:'flex-start', gap:4, borderColor: style===s.key?'var(--accent)':'var(--border)'}}>
          <span style={{fontWeight:800}}>{s.label}</span>
          <span className="small">{s.sub}</span>
        </button>
      ))}
    </div>
  );
}
function PrefStep({minutes,setMinutes,prefExamples,setPrefExamples}){
  return (
    <div className="row two">
      <div className="card">
        <b>Minutes per day</b>
        <input className="input" type="number" min="5" max="60" value={minutes} onChange={e=>setMinutes(e.target.value)} style={{marginTop:8}}/>
      </div>
      <div className="card">
        <b>Preferences</b>
        <label className="inline" style={{gap:8, marginTop:8}}>
          <input type="checkbox" checked={prefExamples} onChange={e=>setPrefExamples(e.target.checked)} />
          <span>Prefer examples</span>
        </label>
        <p className="help" style={{marginTop:8}}>I’ll tailor how I explain things.</p>
      </div>
    </div>
  );
}
function SummaryStep({focus,style,minutes,goal}){
  const styleLabel = {supportive:'Supportive', direct:'Direct', analytical:'Analytical'}[style] || style;
  return (
    <div className="row two">
      <div className="card">
        <b>You chose</b>
        <ul className="list">
          <li><b>Focus</b>: {focus}</li>
          <li><b>Coach style</b>: {styleLabel}</li>
          <li><b>Minutes/day</b>: {minutes}</li>
          <li><b>Outcome</b>: {goal || 'Make visible progress'}</li>
        </ul>
      </div>
      <div className="card">
        <b>What happens next</b>
        <p className="help">We’ll jump into a quick chat to clarify context, then start your first sprint.</p>
      </div>
    </div>
  );
}
