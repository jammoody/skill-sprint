// pages/onboarding.js
import { useState, useMemo } from 'react';
import Link from 'next/link';

const COACH_STYLES = [
  { key:'supportive', label:'Supportive', sub:'Encouraging, positive, momentum-building' },
  { key:'direct', label:'Direct', sub:'No-nonsense, clear, to the point' },
  { key:'analytical', label:'Analytical', sub:'Data-first, KPI-driven, experiments' }
];

const FOCUS_AREAS = ['Marketing', 'E-commerce', 'Leadership', 'Operations', 'Sales', 'General'];

export default function Onboarding(){
  const [step, setStep] = useState(0);
  const [focus, setFocus] = useState('Marketing');
  const [style, setStyle] = useState('analytical');
  const [time, setTime] = useState(10);           // minutes per day
  const [length, setLength] = useState(30);       // sprint days

  const steps = useMemo(()=>[
    { title:'What do you want to focus on?', render: FocusStep },
    { title:'Pick your coaching style', render: StyleStep },
    { title:'How much time and duration?', render: TimeStep },
    { title:'Ready to sprint', render: SummaryStep }
  ],[]);

  const progress = ((step+1)/steps.length)*100;

  function next(){
    if (step < steps.length-1) setStep(step+1);
    else finish();
  }
  function back(){
    if (step > 0) setStep(step-1);
  }
  function finish(){
    const profile = {
      focus:[focus],
      coachStyle:style,
      time:Number(time),
      sprintDays:Number(length),
      challenge:''
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('ss_profile', JSON.stringify(profile));
    }
    window.location.assign('/sprint');
  }

  const Current = steps[step].render;
  return (
    <main className="container">
      <header className="header">
        <div className="brand">
          <span className="brand-badge" />
          Skill Sprint
        </div>
        <div className="nav small"><Link href="/">Home</Link></div>
      </header>

      <div className="card" style={{marginTop:18}}>
        <div className="spaced">
          <div>
            <div className="small">Step {step+1} of {steps.length}</div>
            <h2 style={{margin:'6px 0 8px 0'}}>{steps[step].title}</h2>
          </div>
          <div style={{minWidth:160}}>
            <div className="progress"><span style={{width:`${progress}%`}} /></div>
          </div>
        </div>

        <div style={{marginTop:16}}>
          <Current {...{focus,setFocus,style,setStyle,time,setTime,length,setLength}} />
        </div>

        <div className="spaced" style={{marginTop:18}}>
          <button className="btn" onClick={back}
