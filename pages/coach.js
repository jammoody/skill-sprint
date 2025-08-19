// pages/coach.js
import { useEffect, useRef, useState } from 'react';
import Nav from '../components/Nav';
import { getProfile, getKPIs, getChat, setChat, getCoachMem, setCoachMem, createSprint } from '../lib/store';

export default function Coach(){
  const [messages,setMessages] = useState([]);
  const [quick,setQuick] = useState([]);
  const [links,setLinks] = useState([]);
  const [input,setInput] = useState('');
  const [lastUserQuery,setLastUserQuery] = useState('');
  const scroller = useRef(null);

  useEffect(()=>{
    const p = getProfile();
    if (!p) { if (typeof window!=='undefined') window.location.assign('/onboarding'); return; }
    let chat = getChat();
    if (chat.length === 0) {
      const intro = `Hey! I’m your coach. Your focus is ${p.focus?.[0]||'General'} and your 30-day goal is “${p.goal30d || (p.goals30d?.[0] || 'Make visible progress')}”. What do you want help with?`;
      chat = [{ from:'coach', text:intro, ts: Date.now() }];
      setChat(chat);
      setQuick(['Answer briefly','Start sprint','Show resources']);
    }
    setMessages(chat);
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  },[]);

  useEffect(()=>{ if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; },[messages]);

  async function send(text){
    if (!text.trim()) return;
    const clean = text.trim();
    const me = { from:'me', text: clean, ts: Date.now() };
    const afterMe = [...messages, me];
    setMessages(afterMe); setChat(afterMe);
    setLastUserQuery(clean);
    setQuick([]); setLinks([]);

    try{
      const res = await fetch('/api/coach', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          profile: getProfile(),
          kpis: getKPIs(),
          last: afterMe.slice(-6),
          mem: getCoachMem(),
          user: clean
        })
      });
      const data = await res.json();
      if (data.mem) setCoachMem(data.mem);
      if (Array.isArray(data.learningLinks)) setLinks(data.learningLinks);
      if (Array.isArray(data.quick)) setQuick(data.quick);

      const coach = { from:'coach', text: data.reply || 'Okay.', ts: Date.now() };
      const updated = [...afterMe, coach];
      setMessages(updated); setChat(updated);

      // If API already decided to start a sprint immediately (rare), create it now
      if (data.sprintSeed && /starting a fresh sprint/i.test(data.reply || '')) {
        startNewSprint(data.sprintSeed);
      }
    }catch{
      const coach = { from:'coach', text:'I can give a quick answer, link a guide, or start a new sprint — what would you like?', ts: Date.now() };
      const updated = [...afterMe, coach]; setMessages(updated); setChat(updated);
      setQuick(['Answer briefly','Start sprint','Show resources']);
    }
  }

  function startNewSprint(seed){
    // If we have a seed from the API, use it; otherwise derive from last user query or goal
    const p = getProfile();
    const derivedTitle =
      seed?.title
      || (lastUserQuery ? (lastUserQuery.length > 60 ? `${lastUserQuery.slice(0,57)}…` : lastUserQuery) : null)
      || (p?.goals30d?.[0] || p?.goal30d || `Focused improvement in ${p?.focus?.[0]||'General'}`);
    const s = createSprint({ title: derivedTitle, topic: p?.focus?.[0]||'General' });
    window.location.assign(`/sprint?sid=${encodeURIComponent(s.id)}`);
  }

  function onQuick(q){
    if (q==='Start sprint') return startNewSprint({});
    if (q==='Show resources') return send('Show resources');
    if (q==='Answer briefly') return send('Answer briefly');
    // fallback: treat the chip text as a message
    return send(q);
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
              {links.map((l,i)=><a key={i} className="btn btn-chip" href={l.href}>{l.title}</a>)}
            </div>
          )}

          {!!quick.length && <div className="quick" style={{marginTop:8}}>{quick.map((q,i)=><button key={i} className="btn btn-chip" onClick={()=>onQuick(q)}>{q}</button>)}</div>}

          <div className="inputbar">
            <input
              className="input"
              placeholder="Ask me anything (e.g., How do I lower ROAS?)"
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter') { send(input); setInput(''); } }}
            />
            <button className="btn btn-primary" onClick={()=>{ send(input); setInput(''); }}>Send</button>
          </div>
        </div>
      </main>
    </>
  );
}
