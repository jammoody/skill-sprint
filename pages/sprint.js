// pages/sprint.js
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Sprint(){
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [day,setDay]=useState(null);
  const [tips,setTips]=useState([]);
  const [aiEnabled, setAiEnabled] = useState(false);

  // goals + reflection
  const [g1,setG1]=useState(''); const [g2,setG2]=useState(''); const [g3,setG3]=useState('');
  const [reflection,setReflection]=useState(''); const [rating,setRating]=useState(0);
  const [saved,setSaved]=useState(false); const [nextSteps,setNextSteps]=useState([]);

  // KPI helper state
  const [kpiSuggestions, setKpiSuggestions] = useState([]); // from API when missing
  const [inlineAdd, setInlineAdd] = useState({ metric:'', unit:'%', current:'', target:'' }); // quick-add

  // ---- local storage helpers ----
  const getProfile = () => { try { return JSON.parse(localStorage.getItem('ss_profile')||'null') || {}; } catch { return {}; } };
  const getHistory = () => { try { return JSON.parse(localStorage.getItem('ss_history')||'[]') || []; } catch { return []; } };
  const setHistory = next => localStorage.setItem('ss_history', JSON.stringify(next));
  const getKPIs = () => { try { return JSON.parse(localStorage.getItem('ss_kpis')||'{}') || {}; } catch { return {}; } };
  const setKPIs = next => localStorage.setItem('ss_kpis', JSON.stringify(next||{}));
  const ensureKPIShape = () => {
    const k = getKPIs(); if (!k.categories) k.categories = {}; return k;
  };

  // Determine primary focus (from onboarding)
  const getPrimaryFocus = () => {
    const p = getProfile(); const arr = Array.isArray(p.focus) ? p.focus : []; return arr[0] || 'General';
  };

  useEffect(()=>{
    const enabled = typeof window !== 'undefined' && localStorage.getItem('ss_ai_passcode');
    setAiEnabled(Boolean(enabled));
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  // ---- load sprint (AI or mock), and collect KPI suggestions if provided ----
  async function load(){
    setLoading(true); setError(''); setSaved(false); setNextSteps([]); setKpiSuggestions([]);
    try{
      const pass = typeof window !== 'undefined' ? (localStorage.getItem('ss_ai_passcode') || '') : '';
      const body = { profile: {...getProfile(), kpis: ensureKPIShape()}, history: getHistory() };
      const res = await fetch('/api/generate-sprint', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'x-ss-ai-passcode': pass },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data?.error || data?.note) {
        const dbg = data?.detail ? ` | ${JSON.stringify(data.detail)}` : '';
        setError(`${data?.error || data?.note}${dbg}`);
      }
      setDay(data.day || null);
      setTips(Array.isArray(data.tips) ? data.tips : []);
      setKpiSuggestions(Array.isArray(data.kpiSuggestions) ? data.kpiSuggestions : []);
    }catch{
      setError('Could not load today\'s sprint.');
    } finally { setLoading(false); }
  }

  // ---- AI toggle ----
  function enableAI(){ const code = prompt('Enter AI Dev Passcode (matches SS_AI_PASSCODE in Vercel)'); if(!code) return; localStorage.setItem('ss_ai_passcode', code); setAiEnabled(true); load(); }
  function disableAI(){ localStorage.removeItem('ss_ai_passcode'); setAiEnabled(false); load(); }

  // ---- quick add one KPI for the current focus ----
  function addOneKPI(){
    const focus = getPrimaryFocus();
    const { metric, unit, current, target } = inlineAdd;
    if (!metric.trim()) return alert('Add a metric name, e.g., "Open rate" or "CVR"');
    const store = ensureKPIShape();
    const cat = store.categories[focus] || { metrics:{} };
    cat.metrics[metric.trim()] = {
      unit: unit || '%',
      current: current===''? null : Number(current),
      target: target===''? null : Number(target)
    };
    store.categories[focus] = cat;
    setKPIs(store);
    setInlineAdd({ metric:'', unit:'%', current:'', target:'' });
    alert(`Saved KPI "${metric.trim()}" under ${focus}.`);
    load(); // refresh sprint with KPI context
  }

  // ---- save sprint + ask for follow-up steps ----
  async function saveAndCoach(){
    const goals = [g1,g2,g3].map(s=>s?.trim()).filter(Boolean);
    const entry = { date: new Date().toISOString(), title: day?.title || 'Sprint', goals, reflection, rating };
    const nextHist = [...getHistory(), entry];
    setHistory(nextHist);
    setSaved(true);

    // ask API for immediate next steps (uses KPIs + goals)
    try{
      setLoading(true);
      const pass = typeof window !== 'undefined' ? (localStorage.getItem('ss_ai_passcode') || '') : '';
      const res = await fetch('/api/generate-sprint', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'x-ss-ai-passcode': pass },
        body: JSON.stringify({ profile: {...getProfile(), kpis: ensureKPIShape()}, history: nextHist, followup: { goals } })
      });
      const data = await res.json();
      let follow = [];
      if (Array.isArray(data?.followupSteps)) follow = data.followupSteps;
      else if (Array.isArray(data?.tips)) follow = data.tips;
      if (!follow.length) {
        follow = [
          'Block a 10-minute slot tomorrow to move Goal #1.',
          'Write 3 success criteria for Goal #1 (numbers if possible).',
          'Send one message to sanity-check Goal #1 with a colleague/customer.'
        ];
      }
      setNextSteps(follow.slice(0,5));
    } catch {
      setNextSteps([
        'Draft first 3 bullets for Goal #1.',
        'Schedule a 10-minute slot tomorrow.',
        'Define one simple metric to track.'
      ]);
    } finally {
      setLoading(false);
    }
  }

  // ---------- UI ----------
  return (
    <main style={{maxWidth:960, margin:'0 auto', padding:'24px', fontFamily:'system-ui'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center', border:'2px dashed #f59e0b', padding:'8px'}}>
        <h1>Today&apos;s Sprint</h1>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <strong>AI:</strong> <span>{aiEnabled ? 'ON (dev)' : 'OFF (mock)'}</span>
          {!aiEnabled ? <button onClick={enableAI} style={{padding:'8px 12px', fontWeight:700}}>Enable AI</button>
                      : <button onClick={disableAI} style={{padding:'8px 12px', fontWeight:700}}>Disable AI</button>}
          <Link href="/kpis">KPIs</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </div>

      {error && <div style={{padding:12, border:'1px solid #f87171', background:'#fee2e2', color:'#7f1d1d', borderRadius:8, margin:'12px 0'}}>{error}</div>}
      {loading && <div style={{padding:12}}>Loading…</div>}

      {/* KPI suggestions (when missing for primary focus) */}
      {kpiSuggestions.length > 0 && (
        <section style={{border:'2px solid #0ea5e9', borderRadius:12, padding:16, marginTop:16}}>
          <div style={{opacity:.7, fontSize:12}}>You’re close — add KPIs?</div>
          <p style={{marginTop:6, opacity:.85}}>
            Based on your focus (<b>{getPrimaryFocus()}</b>), here are a few KPIs to consider. Add one quickly here or open the full KPI page.
          </p>
          <ul style={{marginTop:8, paddingLeft:18}}>
            {kpiSuggestions.map((s,i)=>(
              <li key={i} style={{margin:'4px 0'}}>
                <b>{s.name}</b> — <span style={{opacity:.85}}>{s.why}</span>
                {s.how && <span style={{opacity:.6}}> (How: {s.how})</span>}
              </li>
            ))}
          </ul>
          <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr auto', gap:8, marginTop:10}}>
            <input placeholder="Metric (e.g., Open rate, CVR, CAC)" value={inlineAdd.metric} onChange={e=>setInlineAdd(v=>({...v,metric:e.target.value}))} style={{padding:8,border:'1px solid #ddd',borderRadius:8}} />
            <input placeholder="% | # | £ | $" value={inlineAdd.unit} onChange={e=>setInlineAdd(v=>({...v,unit:e.target.value}))} style={{padding:8,border:'1px solid #ddd',borderRadius:8}} />
            <input type="number" placeholder="Current" value={inlineAdd.current} onChange={e=>setInlineAdd(v=>({...v,current:e.target.value}))} style={{padding:8,border:'1px solid #ddd',borderRadius:8}} />
            <input type="number" placeholder="Target" value={inlineAdd.target} onChange={e=>setInlineAdd(v=>({...v,target:e.target.value}))} style={{padding:8,border:'1px solid #ddd',borderRadius:8}} />
            <button onClick={addOneKPI} style={{border:'1px solid #ddd', borderRadius:8, background:'#fff'}}>Add</button>
          </div>
          <div style={{marginTop:10}}>
            <Link href="/kpis">Open full KPI manager →</Link>
          </div>
        </section>
      )}

      {day && (
        <div style={{display:'grid', gap:16, gridTemplateColumns:'2fr 1fr', marginTop:16}}>
          <div style={{display:'grid', gap:16}}>
            {/* Step 1: Learn */}
            <section style={{border:'1px solid #ddd', borderRadius:12, padding:16}}>
              <div style={{opacity:.7, fontSize:12}}>Step 1 — Learn</div>
              <h3 style={{margin:'8px 0'}}>{day.title}</h3>
              <p style={{opacity:.8}}>{day.knowledge}</p>
            </section>

            {/* Step 2: Do */}
            <section style={{border:'1px solid #ddd', borderRadius:12, padding:16}}>
              <div style={{opacity:.7, fontSize:12}}>Step 2 — Do</div>
              <b>Task</b>
              <p style={{marginTop:6}}>{day.task}</p>
              <div className="hint" style={{opacity:.8, fontSize:13, marginTop:8}}>
                Tip: add a metric (e.g., “Email 10 past customers”, not just “Email customers”).
              </div>
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
              <textarea rows="3" placeholder="Write one insight or blocker you notice…" style={{width:'100%', padding:10, border:'1px solid #ddd', borderRadius:8}} value={reflection} onChange={e=>setReflection(e.target.value)} />
              <div style={{display:'flex', alignItems:'center', gap:8, marginTop:8}}>
                <span style={{opacity:.7}}>How useful?</span>
                {[1,2,3,4,5].map(n=> (
                  <button key={n} onClick={()=>setRating(n)} style={{padding:'6px 10px', borderRadius:999, border: rating===n?'2px solid #0ea5e9':'1px solid #ddd', background:'#fff'}}>{n}</button>
                ))}
              </div>
              <div style={{textAlign:'right', marginTop:12}}>
                <button onClick={saveAndCoach} style={{padding:'10px 14px', border:'0', borderRadius:8, background:'#ff7a1a', color:'#111', fontWeight:700}}>
                  Save goals & get next steps
                </button>
              </div>
              {saved && (
                <div style={{marginTop:12, padding:12, border:'1px solid #bbf7d0', background:'#ecfdf5', color:'#065f46', borderRadius:8}}>
                  Progress saved ✓ — See “Coach now” for immediate 10-minute actions tied to your goals/KPIs.
                </div>
              )}
            </section>

            {/* Immediate next steps */}
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
              {(tips||[]).map((t,i)=> <li key={i} style={{opacity:.8, margin:'6px 0'}}>{t}</li>)}
            </ul>
            <div style={{opacity:.7, fontSize:12, marginTop:12}}>
              {aiEnabled ? 'AI mode: advice uses your focus & KPIs when available.' : 'Mock mode: demo content without API costs.'}
            </div>
            <div style={{marginTop:12}}>
              <Link href="/kpis">Add/Update KPIs →</Link>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
            }
