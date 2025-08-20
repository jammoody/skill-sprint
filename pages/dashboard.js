// pages/dashboard.js
import { useEffect, useRef, useState } from 'react';
import Nav from '../components/Nav';
import {
  getProfile, ensureGeneralThread, getThreadById, getActiveThreadId, setActiveThreadId,
  appendThreadMessage, createThread,
  getOrCreateTodaySprint, saveDailySprint, getDailyNudges
} from '../lib/store';

export default function Dashboard(){
  const [profile,setProfile] = useState(null);
  const [coachInput,setCoachInput] = useState('');
  const [messages,setMessages] = useState([]);
  const [today,setToday] = useState(null);
  const [nudges,setNudges] = useState([]);
  const scroller = useRef(null);

  // Simple “dashboard-only” chat: we write into the General thread
  useEffect(()=>{
    const p = getProfile();
    if (!p) { window.location.assign('/onboarding'); return; }
    setProfile(p);

    const gen = ensureGeneralThread();
    setActiveThreadId(gen.id);
    const t = getThreadById(gen.id);
    setMessages(t?.messages || []);

    setToday(getOrCreateTodaySprint());
    setNudges(getDailyNudges());
  },[]);

  useEffect(()=>{ if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [messages]);

  function addCoach(text){ 
    const id = getActiveThreadId(); 
    appendThreadMessage(id, { from:'coach', text });
    setMessages(getThreadById(id)?.messages || []);
  }
  function addUser(text){ 
    const id = getActiveThreadId(); 
    appendThreadMessage(id, { from:'me', text });
    setMessages(getThreadById(id)?.messages || []);
  }

  async function send(){
    const text = coachInput.trim(); if(!text) return;
    setCoachInput(''); addUser(text);

    // lightweight call to /api/coach if present; otherwise fallback
    try{
      const res = await fetch('/api/coach',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
        profile, user: text, last: messages.slice(-6)
      })});
      const data = await res.json();
      addCoach(data.reply || 'Okay.');
    }catch{
      addCoach('I can answer briefly, share a guide, or start a sprint. Which do you want?');
    }
  }

  function startSprint(){
    const s = { ...today, status: 'in-progress' };
    saveDailySprint(new Date().toISOString().slice(0,10), s);
    setToday(s);
    // Create/activate a sprint thread pre-named
    const thr = createThread({ title: `Today: ${today.title}`, topic: profile?.focus?.[0] || 'General', timebox: 10 });
    setActiveThreadId(thr.id);
    addCoach(`Starting today's sprint: “${today.title}”. Pick your timebox: 5m • 10m • 20m • 30m`);
    window.location.assign('/coach');
  }

  function completeSprint(){
    const s = { ...today, status: 'done' };
    saveDailySprint(new Date().toISOString().slice(0,10), s);
    setToday(s);
    addCoach('Nice. Logged today’s sprint as complete. Want a follow-up suggestion?');
  }

  return (
    <>
      <Nav active="dash" />
      <main className="container" style={{display:'grid', gridTemplateColumns:'1.2fr 0.8fr', gap:16}}>
        {/* Left: Coach first */}
        <section className="card" style={{display:'flex', flexDirection:'column', minHeight:'60vh'}}>
          <div className="spaced" style={{flexWrap:'wrap'}}>
            <h2 style={{margin:0}}>How can I help you today?</h2>
            <div className="chipbar">
              {nudges.map((n,i)=>(
                <button key={i} className="btn btn-chip" onClick={()=>{ setCoachInput(n); }}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div ref={scroller} className="messages" style={{flex:1, overflow:'auto', marginTop:8}}>
            {messages.map((m,i)=>(
              <div key={i} className={`msg ${m.from}`}>
                <div className="small" style={{opacity:.7}}>{m.from==='me'?'You':'Coach'}</div>
                <div style={{whiteSpace:'pre-wrap'}}>{m.text}</div>
              </div>
            ))}
          </div>

          <div className="inputbar">
            <input className="input" placeholder="Ask your coach… (e.g., Lower ROAS, Improve welcome email)"
              value={coachInput} onChange={e=>setCoachInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter') send(); }} />
            <button className="btn btn-primary" onClick={send}>Send</button>
            <a className="btn" href="/coach">Open full Coach</a>
          </div>
        </section>

        {/* Right: Today’s Sprint */}
        <aside className="card">
          <div className="spaced">
            <h2 style={{margin:0}}>Today’s Sprint</h2>
            <span className="tag">{today?.status || 'pending'}</span>
          </div>
          {today && (
            <>
              <div className="small" style={{opacity:.7, marginTop:6}}>{today.goal}</div>
              <h3 style={{marginTop:8}}>{today.title}</h3>

              <div className="card" style={{marginTop:10}}>
                <b>Learn</b>
                <ul className="list" style={{marginTop:6}}>
                  {today.learning.map((l,i)=><li key={i}>{l}</li>)}
                </ul>
              </div>

              <div className="card" style={{marginTop:10}}>
                <b>Quiz</b>
                <ul className="list" style={{marginTop:6}}>
                  {today.quiz.map((q,i)=><li key={i}>{q.q}</li>)}
                </ul>
              </div>

              <div className="card" style={{marginTop:10}}>
                <b>Mini test</b>
                <p className="help">{today.test}</p>
              </div>

              <div className="card" style={{marginTop:10}}>
                <b>Real task</b>
                <p className="help">{today.real}</p>
              </div>

              <div className="chipbar" style={{marginTop:12}}>
                {today.status!=='in-progress' && today.status!=='done' && (
                  <button className="btn btn-primary" onClick={startSprint}>Start sprint</button>
                )}
                {today.status==='in-progress' && (
                  <>
                    <a className="btn" href="/coach">Resume in Coach</a>
                    <button className="btn" onClick={completeSprint}>Mark complete</button>
                  </>
                )}
                {today.status==='done' && <a className="btn" href="/coach">Open Coach</a>}
              </div>
            </>
          )}
        </aside>
      </main>
    </>
  );
}