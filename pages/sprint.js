// pages/sprint.js
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Sprint(){
  // UI state
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [day,setDay]=useState(null);
  const [tips,setTips]=useState([]);
  const [aiEnabled, setAiEnabled] = useState(false);

  // Inputs
  const [g1,setG1]=useState('');
  const [g2,setG2]=useState('');
  const [g3,setG3]=useState('');
  const [reflection,setReflection]=useState('');
  const [rating,setRating]=useState(0);

  // Feedback state
  const [saved,setSaved]=useState(false);
  const [nextSteps,setNextSteps]=useState([]); // follow-up actions

  // ----- helpers for local storage -----
  function getProfile(){
    try { return JSON.parse(localStorage.getItem('ss_profile')||'null') || {}; }
    catch { return {}; }
  }
  function getHistory(){
    try { return JSON.parse(localStorage.getItem('ss_history')||'[]') || []; }
    catch { return []; }
  }
  function setHistory(next){ localStorage.setItem('ss_history', JSON.stringify(next)); }

  // ----- lifecycle -----
  useEffect(()=>{
    const enabled = typeof window !== 'undefined' && localStorage.getItem('ss_ai_passcode');
    setAiEnabled(Boolean(enabled));
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // ----- load sprint (AI or mock) -----
  async function load(){
    setLoading(true); setError(''); setSaved(false); setNextSteps([]);
    try{
      const pass = typeof window !== 'undefined' ? (localStorage.getItem('ss_ai_passcode') || '') : '';
      const body = { profile: getProfile(), history: getHistory() };
      const res = await fetch('/api/generate-sprint', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'x-ss-ai-passcode': pass },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      // Debug log to help diagnose
      console.log('[Sprint] load() response:', data);

      if (data?.error || data?.note) {
        const dbg = data?.detail ? ` | ${JSON.stringify(data.detail)}` : '';
        setError(`${data?.error || data?.note}${dbg}`);
      }

      setDay(data.day || null);
      setTips(Array.isArray(data.tips) ? data.tips : []);
    }catch(e){
      console.error('[Sprint] load() exception:', e);
      setError('Could not load today\'s sprint.');
    } finally { setLoading(false); }
  }

  // ----- AI toggle -----
  function enableAI(){
    const code = prompt('Enter AI Dev Passcode (matches SS_AI_PASSCODE in Vercel)');
    if (!code) return;
    localStorage.setItem('ss_ai_passcode', code);
    setAiEnabled(true);
    load();
  }
  function disableAI(){
    localStorage.removeItem('ss_ai_passcode');
    setAiEnabled(false);
    load();
  }

  // ----- save + ask for follow-up steps -----
  async function saveAndCoach(){
    const goals = [g1,g2,g3].map(s=>s?.trim()).filter(Boolean);
    // Save to history
    const entry = {
      date: new Date().toISOString(),
      title: day?.title || 'Sprint',
      goals,
      reflection,
      rating
    };
    const hist = getHistory();
    const nextHist = [...hist, entry];
    setHistory(nextHist);
    setSaved(true);

    // Ask AI for immediate next steps (based on goals)
    try{
      setLoading(true);
      const pass = typeof window !== 'undefined' ? (localStorage.getItem('ss_ai_passcode') || '') : '';
      const res = await fetch('/api/generate-sprint', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'x-ss-ai-passcode': pass },
        body: JSON.stringify({
          profile: getProfile(),
          history: nextHist,
          followup: { goals }
        })
      });
      const data = await res.json();

      console.log('[Sprint] follow-up response:', data); // DEBUG

      // Prefer explicit followupSteps; fallback to tips; if nothing, show a helpful default
      let follow = [];
      if (Array.isArray(data?.followupSteps)) follow = data.followupSteps;
      else if (Array.isArray(data?.tips)) follow = data.tips;

      if (!follow.length) {
        // Safe fallback if model returned nothing parseable
        follow = [
          'Block 10 minutes tomorrow to progress Goal #1.',
          'Write 3 bullets that define success for Goal #1.',
          'Ask one customer/colleague for feedback on Goal #1 via a short message.'
        ];
      }

      setNextSteps(follow.slice(0,5));
    }catch(e){
      console.error('[Sprint] follow-up exception:', e);
      // Safe fallback so the UX never feels “dead”
      setNextSteps([
        'Draft the first 3 bullets for Goal #1.',
        'Schedule a 10-minute slot tomorrow for Goal #1.',
        'Define one simple metric to track progress.'
      ]);
    }finally{
      setLoading(false);
    }
  }

  return (
    <main style={{maxWidth:900, margin:'0 auto', padding:'24px', fontFamily:'system-ui'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center', border:'2px dashed #f59e0b', padding:'8px'}}>
        <h1>Today&apos;s Sprint (with AI toggle)</h1>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <strong>AI:</strong> <span>{aiEnabled ? 'ON (dev)' : 'OFF (mock)'} </span>
          {!aiEnabled
            ? <button onClick={enableAI} style={{padding:'8px 12px', fontWeight:700}}>Enable AI</button>
            : <button onClick={disableAI} style={{padding:'8px 12px', fontWeight:700}}>Disable AI</button>
          }
          <Link href="/dashboard">Back to Dashboard</Link>
        </div>
      </div>

      {error && (
        <div style={{padding:12, border:'1px solid #f87171', background:'#fee2e2', color:'#7f1d1d', borderRadius:8, margin:'12px 0'}}>
          {error}
        </div>
      )}
      {loading && <div style={{padding:12}}>Loading…</div>}

      {day && (
        <div style={{display:'grid', gap:16, gridTemplateColumns:'2fr 1fr', marginTop:16}}>
          <div style={{display:'grid', gap:16}}>
            {/* Step 1: Learn */}
            <section style={{border:'1px solid #ddd', borderRadius:12, padding:16}}>
              <div style={{opacity:.7, fontSize:12}}>Step 1 — Learn</div>
              <h3 style={{margin:'8px 0'}}>{day.title}</h3>
              <p style={{opacity:.8}}>{day.knowledge}</p>
            </section>

            {/* Step 2: Do (Goals input) */}
            <section style={{border:'1px solid #ddd', borderRadius:12, padding:16}}>
              <div style={{opacity:.7, fontSize:12}}>Step 2 — Do</div>
              <b>Task</b>
              <p style={{marginTop:6}}>{day.task}</p>
              <div style={{display:'grid', gap:8, marginTop:10}}>
                <input placeholder="Goal #1 for the next month" value={g1} onChange={e=>setG1(e.target.value)} style={{padding:'10px', border:'1px solid #ddd', borderRadius:8}} />
                <input placeholder="Goal #2 (optional)" value={g2} onChange={e=>setG2(e.target.value)} style={{padding:'10px', border:'1px solid #ddd', borderRadius:8}} />
                <input placeholder="Goal #3 (optional)" value={g3} onChange={e=>setG3(e.target.value)} style={{padding:'10px', border:'1px solid #ddd', borderRadius:8}} />
              </div>
            </section>

            {/* Step 3: Reflect */}
            <section style={{border:'1px solid #ddd', borderRadius:12, padding:16}}>
              <div style={{opacity:.7, fontSize:12}}>Step 3 — Reflect</div>
              <p style={{opacity:.8, marginTop:6}}>{day.reflection}</p>
              <textarea rows="3" placeholder="Your reflection…" style={{width:'100%', padding:10, border:'1px solid #ddd', borderRadius:8}} value={reflection} onChange={e=>setReflection(e.target.value)} />
              <div style={{display:'flex', alignItems:'center', gap:8, marginTop:8}}>
                <span style={{opacity:.7}}>How useful?</span>
                {[1,2,3,4,5].map(n=> (
                  <button
                    key={n}
                    onClick={()=>setRating(n)}
                    style={{
                      padding:'6px 10px',
                      borderRadius:999,
                      border: rating===n?'2px solid #0ea5e9':'1px solid #ddd',
                      background:'#fff'
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div style={{textAlign:'right', marginTop:12}}>
                <button
                  onClick={saveAndCoach}
                  style={{padding:'10px 14px', border:'0', borderRadius:8, background:'#ff7a1a', color:'#111', fontWeight:700}}
                >
                  Save goals & get next steps
                </button>
              </div>

              {saved && (
                <div style={{marginTop:12, padding:12, border:'1px solid #bbf7d0', background:'#ecfdf5', color:'#065f46', borderRadius:8}}>
                  Progress saved ✓ — check your Dashboard. We also pulled tailored next steps below.
                </div>
              )}
            </section>

            {/* Immediate next steps from AI (after save) */}
            {nextSteps.length > 0 && (
              <section style={{border:'2px solid #0ea5e9', borderRadius:12, padding:16}}>
                <div style={{opacity:.7, fontSize:12}}>Coach now</div>
                <b>Next 10-minute moves based on your goals</b>
                <ul style={{marginTop:8, paddingLeft:18}}>
                  {nextSteps.map((t,i)=> <li key={i} style={{margin:'6px 0'}}>{t}</li>)}
                </ul>
              </section>
            )}
          </div>

          {/* Side: Tips */}
          <aside style={{border:'1px solid #ddd', borderRadius:12, padding:16}}>
            <b>Tips</b>
            <ul style={{marginTop:8, paddingLeft:18}}>
              {(tips||[]).map((t,i)=> (
                <li key={i} style={{opacity:.8, margin:'6px 0'}}>{t}</li>
              ))}
            </ul>
            <div style={{opacity:.7, fontSize:12, marginTop:12}}>
              {aiEnabled
                ? 'AI mode (dev): content is generated by the model.'
                : 'Mock mode: demo content for testing without API costs.'}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
              }
