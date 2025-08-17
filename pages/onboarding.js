// pages/onboarding.js
import { useState } from 'react';
import Link from 'next/link';

const STYLES = [
  { key:'supportive', label:'Supportive' },
  { key:'direct', label:'Direct' },
  { key:'analytical', label:'Analytical' }
];
const FOCUS = ['Marketing','E-commerce','Leadership','Operations','Sales','General'];

export default function Onboarding(){
  const [focus,setFocus]=useState('Marketing');
  const [style,setStyle]=useState('analytical');
  const [time,setTime]=useState(10);
  const [length,setLength]=useState(30);

  function save(){
    const profile={ focus:[focus], coachStyle:style, time:Number(time), sprintDays:Number(length), challenge:'' };
    localStorage.setItem('ss_profile', JSON.stringify(profile));
    window.location.assign('/sprint');
  }

  return (
    <main className="container">
      <header className="header">
        <div className="brand"><span className="brand-badge" />Skill Sprint</div>
        <nav className="nav"><Link href="/">Home</Link></nav>
      </header>

      <div className="card" style={{marginTop:18}}>
        <h2>Let’s tailor your sprint</h2>

        <div className="row" style={{gridTemplateColumns:'repeat(3,minmax(0,1fr))', marginTop:10}}>
          {FOCUS.map(f=>(
            <button key={f} className="btn"
              onClick={()=>setFocus(f)}
              style={{borderColor: focus===f?'var(--accent)':'var(--border)'}}>
              {f}
            </button>
          ))}
        </div>

        <div className="row" style={{marginTop:12}}>
          {STYLES.map(s=>(
            <button key={s.key} className="btn"
              onClick={()=>setStyle(s.key)}
              style={{borderColor: style===s.key?'var(--accent)':'var(--border)'}}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="row two" style={{marginTop:12}}>
          <div className="card">
            <b>Minutes per day</b>
            <input className="input" type="number" min="5" max="60"
                   value={time} onChange={e=>setTime(e.target.value)} style={{marginTop:8}}/>
          </div>
          <div className="card">
            <b>Sprint length (days)</b>
            <input className="input" type="number" min="7" max="60"
                   value={length} onChange={e=>setLength(e.target.value)} style={{marginTop:8}}/>
          </div>
        </div>

        <div className="spaced" style={{marginTop:16}}>
          <Link className="btn" href="/">Cancel</Link>
          <button className="btn btn-primary" onClick={save}>Save & Continue</button>
        </div>
      </div>
    </main>
  );
}
