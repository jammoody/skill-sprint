// pages/coach.js
import { useEffect, useRef, useState } from 'react';
import Nav from '../components/Nav';
import { getProfile, getKPIs, getChat, setChat, getCoachMem, setCoachMem } from '../lib/store';

export default function Coach(){
  const [messages,setMessages] = useState([]);
  const [quick,setQuick] = useState([]);
  const [links,setLinks] = useState([]);
  const [sprintSeed,setSprintSeed] = useState(null);
  const [input,setInput] = useState('');
  const scroller = useRef(null);

  useEffect(()=>{
    const profile = getProfile();
    let chat = getChat();
    if (!profile) { if (typeof window!=='undefined') window.location.assign('/onboarding'); return; }
    if (chat.length === 0) {
      chat = [{ from:'coach', text:`Hey! I’m your coach. Your focus is ${profile.focus?.[0]||'General'} and your 30-day goal is “${profile.goal30d}”. Sound right?`, ts: Date.now() }];
      setChat(chat); setQuick(['✅ Yes','✏️ Tweak','❓ Not sure']);
    }
    setMessages(chat);
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  },[]);

  useEffect(()=>{ if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; },[messages]);

  async function send(text){
    if (!text.trim()) return;
    const me = { from:'me', text, ts: Date.now() };
    const afterMe = [...messages, me];
    setMessages(afterMe); setChat(afterMe); setQuick([]); setLinks([]); setSprintSeed(null);

    const payload = { profile: getProfile(), kpis: getKPIs(), last: afterMe.slice(-6), mem: getCoachMem(), user: text };
    try{
      const res = await fetch('/api/coach', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const data = await res.json();
      const coach = { from:'coach', text: data.reply || 'Got it.', ts: Date.now() };
      const updated = [...afterMe, coach];
      setMessages(updated); setChat(updated);
      setQuick(Array.isArray(data.quick)? data.quick : []);
      setLinks(Array.isArray(data.learningLinks)? data.learningLinks : []);
      if (data.mem) setCoachMem(data.mem);
      if (data.sprintSeed) setSprintSeed(data.sprintSeed);
      if (data.route === 'sprint') startSprint(data.sprintSeed);
    }catch{
      const coach = { from:'coach', text:'Want me to start a 10-minute sprint based on that?', ts: Date.now() };
      const updated = [...afterMe, coach];
      setMessages(updated); setChat(updated);
      setQuick(['Start sprint','Different idea']);
    }
  }

  function startSprint(seed){
    if (seed) localStorage.setItem('ss_sprint_seed', JSON.stringify(seed));
    window.location.assign('/sprint');
  }

  function onQuick(q){
    setQuick([]);
    if (q==='Start sprint') return startSprint({ title:'High-impact segmentation', topic: getProfile()?.focus?.[0]||'General' });
    send(q);
  }

  return (
    <>
      <Nav active="coach" />
      <main className="container">
        <div className="card" style={{marginTop:18}}>
          <div ref={scroller} className="messages">
            {messages.map((m,i)=><div key={i} className={`msg ${m.from}`}><div className="small" style={{opacity:.7}}>{m.from==='me'?'You':'Coach'}</div>{m.text}</div>)}
          </div>

          {links.length>0 && (
            <div className="inline" style={{marginTop:8}}>
              {links.map((l,i)=>(
                <a key={i} className="btn btn-chip" href={l.href}>{l.title}</a>
              ))}
            </div>
          )}

          {!!quick.length && <div className="quick" style={{marginTop:8}}>{quick.map((q,i)=><button key={i} className="btn btn-chip" onClick={()=>onQuick(q)}>{q}</button>)}</div>}

          {sprintSeed && (
            <div className="inline" style={{marginTop:8}}>
              <button className="btn btn-primary" onClick={()=>startSprint(sprintSeed)}>Start Sprint: {sprintSeed.title}</button>
            </div>
          )}

          <div className="inputbar">
            <input className="input" placeholder="Ask me anything…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') send(input); }} />
            <button className="btn btn-primary" onClick={()=>send(input)}>Send</button>
          </div>
        </div>
      </main>
    </>
  );
}
