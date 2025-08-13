import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { storage } from '../lib/storage';
import { useRouter } from 'next/router';

const focusOptions = ['Marketing','E-commerce','Retail','Leadership','Finance','Customer Experience'];

export default function Onboarding(){
  const router = useRouter();
  const [role,setRole]=useState('Owner');
  const [years,setYears]=useState('0-1');
  const [focus,setFocus]=useState([]);
  const [time,setTime]=useState('5');
  const [challenge,setChallenge]=useState('');

  useEffect(()=>{ const p=storage.get('ss_profile'); if(p){setRole(p.role||'Owner');setYears(p.years||'0-1');setFocus(p.focus||[]);setTime(p.time||'5');setChallenge(p.challenge||'')} },[]);

  function toggle(item){ setFocus(prev=> prev.includes(item)? prev.filter(i=>i!==item): [...prev,item].slice(0,3)) }
  function save(){ storage.set('ss_profile',{role,years,focus,time,challenge,createdAt:Date.now()}); if(!storage.get('ss_history')) storage.set('ss_history',[]); router.push('/dashboard') }

  return (
    <Layout active="onboarding">
      <section className="container section">
        <div className="kicker">Free skill test</div>
        <h1 className="h1">Let’s personalise your daily plan</h1>
        <p className="sub">60 seconds — no login needed. You can edit this later.</p>

        <div className="grid" style={{gridTemplateColumns:'1fr', gap:16, maxWidth:780, marginTop:16}}>
          <div className="card"><label>What’s your current role?</label><br/>
            <select value={role} onChange={e=>setRole(e.target.value)} style={{width:'100%',background:'#0b1020',color:'#e5e7eb',border:'1px solid #1f2a44',borderRadius:10,padding:12}}>
              <option>Owner</option><option>Manager</option><option>Freelancer</option><option>Employee</option>
            </select>
          </div>

          <div className="card"><label>How many years in business?</label><br/>
            <select value={years} onChange={e=>setYears(e.target.value)} style={{width:'100%',background:'#0b1020',color:'#e5e7eb',border:'1px solid #1f2a44',borderRadius:10,padding:12}}>
              <option>0-1</option><option>2-4</option><option>5+</option>
            </select>
          </div>

          <div className="card"><label>Pick up to 3 focus areas</label>
            <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:10}}>
              {focusOptions.map(o=> <button key={o} onClick={()=>toggle(o)} className="badge" style={{border:'1px solid #334155', background: focus.includes(o)? '#121a33':'#0b1020', color:'#e2e8f0'}}>{o}</button>)}
            </div>
          </div>

          <div className="card"><label>How many minutes per day can you commit?</label><br/>
            <select value={time} onChange={e=>setTime(e.target.value)} style={{width:'100%',background:'#0b1020',color:'#e5e7eb',border:'1px solid #1f2a44',borderRadius:10,padding:12}}>
              <option>5</option><option>10</option><option>20+</option>
            </select>
          </div>

          <div className="card"><label>What’s your biggest current challenge?</label><br/>
            <textarea rows="3" value={challenge} onChange={e=>setChallenge(e.target.value)} placeholder="e.g., Low conversion rate with high ad spend." style={{width:'100%',background:'#0b1020',color:'#e5e7eb',border:'1px solid #1f2a44',borderRadius:10,padding:12}}/>
          </div>

          <div style={{display:'flex',gap:12}}>
            <button className="btn" onClick={save}>Save & Continue</button>
            <span className="hint">Your data is stored in your browser for now.</span>
          </div>
        </div>
      </section>
    </Layout>
  );
}
