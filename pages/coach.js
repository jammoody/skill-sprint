// pages/coach.js
import { useEffect, useRef, useState } from 'react';
import Nav from '../components/Nav';
import { getProfile, ensureGeneralThread, getThreadById, setActiveThreadId, appendThreadMessage, saveDailySprint } from '../lib/store';

export default function Coach(){
  const [profile,setProfile] = useState(null);
  const [input,setInput] = useState('');
  const [messages,setMessages] = useState([]);
  const scroller = useRef(null);
  const [quick,setQuick] = useState(['Answer briefly','Start sprint','Show resources']);

  useEffect(()=>{
    const p = getProfile();
    if (!p) { window.location.assign('/onboarding'); return; }
    setProfile(p);
    const gen = ensureGeneralThread();
    setActiveThreadId(gen.id);
    setMessages(getThreadById(gen.id)?.messages || []);
  },[]);

  useEffect(()=>{ if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [messages]);

  function addCoach(text){ const id=JSON.parse(localStorage.getItem('ss_active_thread_id')); appendThreadMessage(id,{from:'coach',text}); setMessages(getThreadById(id)?.messages||[]); }
  function addUser(text){ const id=JSON.parse(localStorage.getItem('ss_active_thread_id')); appendThreadMessage(id,{from:'me',text}); setMessages(getThreadById(id)?.messages||[]); }

  async function callAPI(text, mode='brief'){
    try{
      const res = await fetch('/api/coach',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ profile, user: text, last: messages.slice(-6), mode })});
      const data = await res.json();
      addCoach(data.reply || 'Okay.');
      setQuick(data.quick || ['Answer briefly','Start sprint','Show resources']);
    }catch{
      addCoach('I can answer briefly, share a guide, or start a sprint. Which do you want?');
    }
  }

  function onQuick(q){
    if (q==='Start sprint'){
      const name = prompt('Name your sprint (e.g., Improve welcome email open rate)') || 'Focused sprint';
      saveDailySprint(new Date().toISOString().slice(0,10), { title:name, goal: profile?.goals30d?.[0] || 'Progress goal', status:'in-progress',
        learning:['Change one variable at a time','Tie to a weekly KPI'],
        quiz:[{q:'What KPI will this affect?',a:''},{q:'What variable will you change?',a:''}],
        test:'Draft one 10-minute experiment.',
        real:'Ship to a small segment and measure delta vs baseline.'
      });
      window.location.assign('/sprint');
      return;
    }
    if (q==='Answer briefly'){
      const lastUser = [...messages].reverse().find(m=>m.from==='me')?.text || 'Give me quick tips on my last message.';
      callAPI(`Answer briefly in 5 short bullets with bolded leads: ${lastUser}`,'brief'); return;
    }
    if (q==='Show resources'){
      const lastUser = [...messages].reverse().find(m=>m.from==='me')?.text || 'Resources for my last topic';
      callAPI(`Share 3 concise resources (title + URL) for: ${lastUser}`,'resources'); return;
    }
    setInput(q); send();
  }

  async function send(){
    const text=input.trim(); if(!text) return;
    setInput(''); addUser(text);
    await callAPI(text);
  }

  return (
    <>
      <Nav active="coach" />
      <main className="container">
        <section className="card" style={{background:'linear-gradient(180deg,#FFFFFF,#F5F3FF)'}}>
          <h2 style={{margin:'4px 0 8px 0'}}>Coach</h2>
          <div className="chips" style={{marginBottom:8}}>
            {quick.map((q,i)=><button key={i} className="btn btn-chip" onClick={()=>onQuick(q)}>{q}</button>)}
          </div>

          <div ref={scroller} className="messages" style={{minHeight:'50vh',maxHeight:'70vh',overflow:'auto'}}>
            {messages.map((m,i)=>(
              <div key={i} className={`msg ${m.from==='me'?'me':'coach'}`}>
                <div className="who">{m.from==='me'?'You':'Coach'}</div>
                <div style={{whiteSpace:'pre-wrap'}}>{m.text}</div>
              </div>
            ))}
          </div>

          <div className="inputbar">
            <input className="input" placeholder="Ask anything… (e.g., Lower ROAS, Improve CTR, Write a plan)"
              value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') send(); }} />
            <button className="btn btn-primary" onClick={send}>Send</button>
          </div>
        </section>
      </main>
    </>
  );
}