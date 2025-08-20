// pages/coach.js
import { useEffect, useRef, useState } from 'react';
import Nav from '@/components/Nav';
import {
  getProfile, getKPIs,
  getThreads, setThreads, createThread, getThreadById,
  appendThreadMessage, setActiveThreadId, getActiveThreadId,
  setThreadTimebox, setThreadStatus
} from '@/lib/store';

function Timebox({ value, onChange }) {
  const opts = [5,10,20,30];
  return (
    <div className="inline" style={{gap:6}}>
      {opts.map(n => (
        <button key={n} className="btn btn-chip"
          onClick={()=>onChange(n)} style={{borderColor: value===n?'var(--accent)':'var(--border)'}}>
          {n}m
        </button>
      ))}
    </div>
  );
}

function LearningBlock({ mode, onModeChange, onSubmitMiniTest }) {
  /** mode: learn | quiz | test | real */
  const [answers,setAnswers] = useState({q1:'',q2:''});
  const [mini,setMini] = useState('');
  const [real,setReal] = useState('');

  return (
    <div className="card" style={{marginTop:8}}>
      <div className="inline" style={{justifyContent:'space-between'}}>
        <b>Learning</b>
        <div className="inline">
          {['learn','quiz','test','real'].map(m=>(
            <button key={m} className="btn btn-chip" onClick={()=>onModeChange(m)} style={{borderColor: mode===m?'var(--accent)':'var(--border)'}}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode==='learn' && (
        <ul className="list" style={{marginTop:8}}>
          <li><b>Concept 1:</b> Relevance ↑ → CTR ↑ → CVR ↑ (match message to intent).</li>
          <li><b>Concept 2:</b> Change one variable at a time to learn what moved the KPI.</li>
        </ul>
      )}

      {mode==='quiz' && (
        <div style={{marginTop:8}}>
          <div className="inline" style={{alignItems:'flex-start'}}>
            <div className="small" style={{minWidth:160}}>1) What metric shows message fit in emails?</div>
            <input className="input" placeholder="e.g., CTR" value={answers.q1} onChange={e=>setAnswers(v=>({...v,q1:e.target.value}))} />
          </div>
          <div className="inline" style={{alignItems:'flex-start', marginTop:8}}>
            <div className="small" style={{minWidth:160}}>2) Why change one thing at a time?</div>
            <input className="input" placeholder="Your answer…" value={answers.q2} onChange={e=>setAnswers(v=>({...v,q2:e.target.value}))} />
          </div>
        </div>
      )}

      {mode==='test' && (
        <div style={{marginTop:8}}>
          <b>Mini test (do now, ≤5m)</b>
          <p className="help">Draft 3 subject lines using (curiosity • benefit • urgency). Paste them here:</p>
          <textarea className="textarea" placeholder="- SL1: ..." value={mini} onChange={e=>setMini(e.target.value)} />
          <div className="inline" style={{marginTop:8}}>
            <button className="btn btn-primary" onClick={()=>onSubmitMiniTest(mini)}>Submit mini test</button>
          </div>
        </div>
      )}

      {mode==='real' && (
        <div style={{marginTop:8}}>
          <b>Real task</b>
          <p className="help">Send the best subject line to a small warm segment. Track CTR vs. baseline, then report tomorrow.</p>
          <textarea className="textarea" placeholder="Notes, recipients, expected CTR…" value={real} onChange={e=>setReal(e.target.value)} />
        </div>
      )}
    </div>
  );
}

export default function Coach(){
  const [profile,setProfileState] = useState(null);
  const [threads,setThreadsState] = useState([]);
  const [activeId,setActiveId] = useState(null);
  const [input,setInput] = useState('');
  const [links,setLinks] = useState([]);
  const [quick,setQuick] = useState(['Answer briefly','Start sprint','Show resources']);
  const [learnMode,setLearnMode] = useState('learn');
  const scroller = useRef(null);

  useEffect(()=>{
    const p = getProfile();
    if (!p) { if (typeof window!=='undefined') window.location.assign('/onboarding'); return; }
    setProfileState(p);

    let all = getThreads();
    if (all.length === 0) {
      const intro = { from:'coach', text:`Hey! I’m your coach. Your focus is ${p.focus?.[0]||'General'}. Ask for help (e.g., “How do I lower ROAS?”) or type “Start sprint on subject lines”.`, ts: Date.now() };
      const thr = createThread({ title: 'General coaching', topic: p.focus?.[0]||'General', timebox: 10, messages: [intro] });
      all = getThreads(); setActiveId(thr.id);
    } else {
      setActiveId(getActiveThreadId() || all[0].id);
    }
    setThreadsState(all);
  },[]);

  useEffect(()=>{ if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [threads, activeId]);

  const active = activeId ? getThreadById(activeId) : null;
  function refresh(){ setThreadsState(getThreads()); }

  function addCoach(text){ appendThreadMessage(activeId, { from:'coach', text }); refresh(); }
  function addUser(text){ appendThreadMessage(activeId, { from:'me', text }); refresh(); }

  function seedSprint(title){
    addCoach(`Starting sprint: “${title||active?.title||'Focused sprint'}”. Pick your timebox: 5 • 10 • 20 • 30 minutes, then I’ll guide you.`);
    setQuick(['Answer briefly','Show resources']);
  }

  async function callAPI(text){
    try{
      const res = await fetch('/api/coach',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({
        profile: profile, kpis: getKPIs(), last: (active?.messages||[]).slice(-6), user: text
      })});
      const data = await res.json();
      if (Array.isArray(data.learningLinks)) setLinks(data.learningLinks); else setLinks([]);
      setQuick(Array.isArray(data.quick)? data.quick : ['Answer briefly','Start sprint','Show resources']);
      addCoach(data.reply || 'Okay.');
      if (data.threadSeed?.title) seedSprint(data.threadSeed.title);
    }catch{
      addCoach('I can answer briefly, share a guide, or start a sprint. Which do you want?'); setQuick(['Answer briefly','Start sprint','Show resources']);
    }
  }

  function newThread(fromText){
    const topic = fromText?.trim() ? (fromText.length>60 ? `${fromText.slice(0,57)}…` : fromText) : 'New sprint';
    const thr = createThread({ title: topic, topic: profile?.focus?.[0]||'General', timebox: 10, messages: [] });
    setActiveId(thr.id); setActiveThreadId(thr.id);
    addCoach(`Created a new sprint thread: “${topic}”. Choose a timebox or ask a question.`);
    setQuick(['Answer briefly','Show resources']);
  }

  function onTimeboxChange(n){
    setThreadTimebox(activeId,n); refresh();
    addCoach(`Timebox set to ${n} minutes. I’ll keep steps tight.`);
    // Drop a first step and learning panel
    addCoach(`Step 1 (≤${n}m): learn the core idea, answer 2 checks, then do a mini test right now.`);
  }

  function markDone(){
    setThreadStatus(activeId,'done'); refresh();
    addCoach('Marked done. Want a follow-up sprint or a summary of learnings?');
    setQuick(['Start sprint','Answer briefly','Show resources']);
  }

  function onQuick(q){
    if (q==='Start sprint') { seedSprint(active?.title); return; }
    if (q==='Answer briefly') {
      const lastUser = (active?.messages||[]).slice().reverse().find(m=>m.from==='me')?.text || 'Answer briefly my last topic.';
      callAPI(`Answer briefly: ${lastUser}`); return;
    }
    if (q==='Show resources') {
      const lastUser = (active?.messages||[]).slice().reverse().find(m=>m.from==='me')?.text || 'Show resources for my last topic.';
      callAPI(`Show resources for: ${lastUser}`); return;
    }
    setInput(q); send();
  }

  function onSubmitMiniTest(text){
    if (!text.trim()) return;
    addCoach('Nice start. For your real task: ship the best option to a small warm audience and track the KPI delta vs baseline. Report back tomorrow.');
  }

  async function send(){
    const text = input.trim(); if(!text) return;
    setInput(''); setLinks([]); addUser(text);

    if (/^start\s+(a\s+)?sprint\b/i.test(text) || /do my own/i.test(text)) { const title=text.replace(/^start\s+(a\s+)?sprint\s*(on|about)?\s*/i,'').trim(); seedSprint(title); return; }
    if (/^new\s+sprint\b/i.test(text)) { newThread(text.replace(/^new\s+sprint\s*/i,'').trim()); return; }
    if (/^\d+\s*m(in(ute)?)?$/i.test(text)) { const num=parseInt(text,10); if([5,10,20,30].includes(num)){ onTimeboxChange(num); return; } }

    await callAPI(text);
  }

  return (
    <>
      <Nav active="coach" />
      <main className="container" style={{display:'grid', gridTemplateColumns:'280px 1fr', gap:16}}>
        <aside className="card" style={{height:'calc(100vh - 140px)', overflow:'auto'}}>
          <div className="spaced">
            <b>Your sprints</b>
            <button className="btn" onClick={()=>newThread('')}>+ New sprint</button>
          </div>
          <ul className="list" style={{marginTop:8}}>
            {getThreads().slice().reverse().map(t=>(
              <li key={t.id} style={{margin:'8px 0'}}>
                <button className="btn" style={{width:'100%', justifyContent:'flex-start', borderColor: activeId===t.id ? 'var(--accent)' : 'var(--border)'}}
                  onClick={()=>{ setActiveId(t.id); setActiveThreadId(t.id); }}>
                  <span className="small tag" style={{marginRight:8}}>{t.status}</span>{t.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <section className="card" style={{display:'flex', flexDirection:'column', height:'calc(100vh - 140px)'}}>
          <div className="spaced">
            <div>
              <div className="small" style={{opacity:.7}}>{active?.topic || (profile?.focus?.[0]||'General')}</div>
              <h2 style={{margin:'6px 0 0 0'}}>{active?.title || 'Coach'}</h2>
            </div>
            <div className="inline" style={{gap:8, alignItems:'center'}}>
              <Timebox value={active?.timebox||10} onChange={onTimeboxChange} />
              <button className="btn" onClick={markDone}>Mark done</button>
            </div>
          </div>

          <div ref={scroller} className="messages" style={{flex:1, overflow:'auto', marginTop:8}}>
            {(active?.messages||[]).map((m,i)=>(
              <div key={i} className={`msg ${m.from}`}>
                <div className="small" style={{opacity:.7}}>{m.from==='me'?'You':'Coach'}</div>
                {m.text}
              </div>
            ))}
          </div>

          {/* Learning mode lives under the chat — toggled as you sprint */}
          <LearningBlock mode={learnMode} onModeChange={setLearnMode} onSubmitMiniTest={onSubmitMiniTest} />

          {links.length>0 && (
            <div className="inline" style={{marginTop:8}}>
              {links.map((l,i)=><a key={i} className="btn btn-chip" href={l.href}>{l.title}</a>)}
            </div>
          )}
          {!!quick.length && (
            <div className="quick" style={{marginTop:8}}>
              {quick.map((q,i)=><button key={i} className="btn btn-chip" onClick={()=>onQuick(q)}>{q}</button>)}
            </div>
          )}

          <div className="inputbar" style={{marginTop:8}}>
            <input className="input" placeholder="Ask your coach… (e.g., Lower ROAS, Start sprint on subject lines, 10m)"
              value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') send(); }} />
            <button className="btn btn-primary" onClick={send}>Send</button>
          </div>
        </section>
      </main>
    </>
  );
}
