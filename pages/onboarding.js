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
    window.location.assign('/dashboard');
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
            <button key={f} className="btn" onClick={()=>setFocus(f)} style={{borderColor: focus===
