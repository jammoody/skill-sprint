// pages/dashboard.js
import { useEffect, useRef, useState } from 'react';
import Nav from '../components/Nav';
import {
  getProfile, ensureGeneralThread, getThreadById, getActiveThreadId, setActiveThreadId,
  appendThreadMessage, getOrCreateTodaySprint, saveDailySprint, getDailyNudges
} from '../lib/store';

export default function Dashboard(){
  const [profile,setProfile] = useState(null);
  const [coachInput,setCoachInput] = useState('');
  const [messages,setMessages] = useState([]);
  const [today,setToday] = useState(null);
  const [nudges,setNudges] = useState([]);
  const scroller = useRef(null);

  useEffect(()=>{
    const p = getProfile();
    if (!p) { window.location.assign('/onboarding'); return; }
    setProfile(p);

    const gen = ensureGeneralThread();
    setActiveThreadId(gen.id);
    setMessages(getThreadById(gen.id)?.messages || []);

    setToday(getOrCreateTodaySprint());
    setNudges(getDailyNudges());
  },[]);

  useEffect(()=>{ if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [messages]);

  function addCoach(text){ const id=getActiveThreadId(); appendThreadMessage(id,{from:'coach',text}); setMessages(getThreadById(id)?.messages||[]); }
  function addUser(text){ const id=getActiveThreadId(); appendThreadMessage(id,{from:'me',text}); setMessages(getThreadById(id)?.messages||[]); }

  async function send(){
    const text = coachInput.trim(); if(!text) return;
    setCoachInput(''); addUser(text);
    try{
      const res = await fetch('/api/coach',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ profile, user: text, last: messages.slice(-6) })});
      const data = await res.json();
      addCoach(data.reply || 'Okay.');
    }catch{
      addCoach('I can answer briefly, share a guide, or start a sprint. Which do you want?');
    }
  }

  function startSprint(){
    const s = { ...today, status:'in-progress' };
    saveDailySprint(new Date().toISOString().slice(0,10), s);
    setToday(s);
    window.location.assign('/sprint');
  }

  function completeSprint(){
    const s = { ...today, status:'done' };
    saveDailySprint(new Date().toISOString().slice(0,10), s);
    setToday(s);
    addCoach('Nice. Logged today’s sprint as complete.');
  }

  return (
    <>
      <Nav active="dash" />
      <main className="container" style={{display:'grid', gap:16}}>
        {/* Coach first */}
        <section className="card" style={{display:'flex',flexDirection:'column',minHeight:'50vh', background:'linear-gradient(180deg,#FFFFFF, #F5F3FF)'}}>
          <div className="section-title">How can I help you today?</div>
          <div className="chips" style={{margin:'8px 0 10px 0'}}>
            {nudges.map((n,i)=><button key={i} className="btn btn-chip" onClick={()=>setCoachInput(n)}>{n}</button>)}
            <a className="btn btn-chip" href="/coach">Open full coach</a>
          </div>

          <div ref={scroller} className="messages" style={{flex:1,overflow:'auto',marginTop:8}}>
            {messages.map((m,i)=>(
              <div key={i} className={`msg ${m.from}`}>
                <div className="who">{m.from==='me'?'You':'Coach'}</div>
                <div style={{whiteSpace:'pre-wrap'}}>{m.text}</div>
              </div>
            ))}
          </div>

          <div className="inputbar">
            <input className="input" placeholder="Ask your coach… (e.g., Improve open rate, Fix ROAS)"
              value={coachInput} onChange={e=>setCoachInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter') send(); }} />
            <button className="btn btn-primary" onClick={send}>Send</button>
          </div>
        </section>

        {/* Today's Sprint below */}
        <section className="card">
          <div className="section-title">Today’s Sprint</div>
          {today && (
            <>
              <div style={{opacity:.75,marginTop:4}}>{today.goal}</div>
              <h3 style={{marginTop:8}}>{today.title}</h3>

              <div className="card" style={{marginTop:10}}>
                <b>Learn</b>
                <ul style={{margin:'6px 0 0 18px'}}>
                  {today.learning.map((l,i)=><li key={i}>{l}</li>)}
                </ul>
              </div>

              <div className="card" style={{marginTop:10}}>
                <b>Quiz</b>
                <ul style={{margin:'6px 0 0 18px'}}>
                  {today.quiz.map((q,i)=><li key={i}>{q.q}</li>)}
                </ul>
              </div>

              <div className="chips" style={{marginTop:12}}>
                {today.status!=='in-progress' && today.status!=='done' && (
                  <button className="btn btn-accent" onClick={startSprint}>Start sprint</button>
                )}
                {today.status==='in-progress' && (
                  <>
                    <a className="btn" href="/sprint">Resume</a>
                    <button className="btn" onClick={completeSprint}>Mark complete</button>
                  </>
                )}
                {today.status==='done' && <a className="btn" href="/sprint">Open sprint</a>}
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
}