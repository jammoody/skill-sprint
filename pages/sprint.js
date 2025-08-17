// pages/sprint.js
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Sprint() {
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);

  // Sprint payload from API
  const [day, setDay] = useState(null);         // { title, knowledge, task, reflection }
  const [tips, setTips] = useState([]);         // [string]
  const [kpiSuggestions, setKpiSuggestions] = useState([]); // [{name,why,how}]

  // User inputs for today
  const [goal1, setGoal1] = useState('');
  const [goal2, setGoal2] = useState('');
  const [goal3, setGoal3] = useState('');
  const [reflection, setReflection] = useState('');
  const [rating, setRating] = useState(0);

  // After save → next steps (from API)
  const [saved, setSaved] = useState(false);
  const [nextSteps, setNextSteps] = useState([]);

  // Inline quick-add KPI when suggestions appear
  const [inlineKPI, setInlineKPI] = useState({ metric: '', unit: '%', current: '', target: '' });

  // ------- localStorage helpers (safe parse) -------
  const lsGet = (key, fallback) => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  };
  const lsSet = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  // Profile, history & KPIs accessors
  const getProfile = () => lsGet('ss_profile', {});
  const getHistory = () => lsGet('ss_history', []);
  const setHistory = (arr) => lsSet('ss_history', arr);
  const getKPIs = () => {
    const k = lsGet('ss_kpis', { categories: {} });
    if (!k || typeof k !== 'object' || !k.categories) return { categories: {} };
    return k;
  };
  const setKPIs = (obj) => lsSet('ss_kpis', obj);

  // Determine primary focus from onboarding
  const primaryFocus = () => {
    const p = getProfile();
    const arr = Array.isArray(p.focus) ? p.focus : [];
    return arr[0] || 'General';
  };

  // ------- lifecycle -------
  useEffect(() => {
    const hasPass = typeof window !== 'undefined' && localStorage.getItem('ss_ai_passcode');
    setAiEnabled(Boolean(hasPass));
    loadSprint();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------- API calls -------
  async function loadSprint() {
    setLoading(true);
    setError('');
    setSaved(false);
    setNextSteps([]);
    setKpiSuggestions([]);
    try {
      const pass = typeof window !== 'undefined' ? (localStorage.getItem('ss_ai_passcode') || '') : '';
      const body = {
        profile: { ...getProfile(), kpis: getKPIs() },
        history: getHistory()
      };
      const res = await fetch('/api/generate-sprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-ss-ai-passcode': pass },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data?.error) setError(String(data.error));
      setDay(data.day || null);
      setTips(Array.isArray(data.tips) ? data.tips : []);
      setKpiSuggestions(Array.isArray(data.kpiSuggestions) ? data.kpiSuggestions : []);
    } catch (e) {
      setError('Could not load today’s sprint.');
    } finally {
      setLoading(false);
    }
  }

  async function saveAndCoach() {
    const goals = [goal1, goal2, goal3].map(s => (s || '').trim()).filter(Boolean);
    const entry = {
      date: new Date().toISOString(),
      title: day?.title || 'Sprint',
      goals,
      reflection,
      rating
    };
    const nextHistory = [...getHistory(), entry];
    setHistory(nextHistory);
    setSaved(true);

    // Ask API for immediate next steps
    try {
      setLoading(true);
      const pass = typeof window !== 'undefined' ? (localStorage.getItem('ss_ai_passcode') || '') : '';
      const res = await fetch('/api/generate-sprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-ss-ai-passcode': pass },
        body: JSON.stringify({
          profile: { ...getProfile(), kpis: getKPIs() },
          history: nextHistory,
          followup: { goals }
        })
      });
      const data = await res.json();
      const steps = Array.isArray(data?.followupSteps) ? data.followupSteps : [];
      setNextSteps(steps.length ? steps.slice(0, 5) : [
        'Block a 10-minute slot tomorrow to move Goal #1.',
        'Write 3 success criteria for Goal #1 (numbers).',
        'Sanity-check Goal #1 with a colleague/customer.'
      ]);
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

  // ------- actions -------
  function enableAI() {
    const code = prompt('Enter AI Dev Passcode (matches SS_AI_PASSCODE in Vercel):');
    if (!code) return;
    localStorage.setItem('ss_ai_passcode', code);
    setAiEnabled(true);
    loadSprint();
  }
  function disableAI() {
    localStorage.removeItem('ss_ai_passcode');
    setAiEnabled(false);
    loadSprint();
  }

  function quickAddKPI() {
    const focus = primaryFocus();
    const store = getKPIs();
    const metric = (inlineKPI.metric || '').trim();
    if (!metric) { alert('Add a metric name, e.g., “Open rate” or “CVR”.'); return; }
    const unit = inlineKPI.unit || '%';
    const current = inlineKPI.current === '' ? null : Number(inlineKPI.current);
    const target = inlineKPI.target === '' ? null : Number(inlineKPI.target);
    const cat = store.categories[focus] || { metrics: {} };
    cat.metrics = { ...(cat.metrics || {}), [metric]: { unit, current, target } };
    store.categories[focus] = cat;
    setKPIs(store);
    setInlineKPI({ metric: '', unit: '%', current: '', target: '' });
    alert(`Saved KPI “${metric}” under ${focus}.`);
    loadSprint();
  }

  // ------- small UI helpers -------
  function Pill({ children }) {
    return (
      <span style={{display:'inline-block', padding:'4px 10px', border:'1px solid #e5e7eb', borderRadius:999, fontSize:12}}>
        {children}
      </span>
    );
  }

  // ------- RENDER -------
  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 24, fontFamily: 'system-ui' }}>
      {/* Top bar */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <h1 style={{margin:0}}>Today&apos;s Sprint</h1>
          <Pill>{aiEnabled ? 'AI: ON' : 'AI: OFF'}</Pill>
        </div>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          {!aiEnabled
            ? <button onClick={enableAI} style={{padding:'8px 12px', fontWeight:700}}>Enable AI</button>
            : <button onClick={disableAI} style={{padding:'8px 12px', fontWeight:700}}>Disable AI</button>}
          <Link href="/kpis">KPIs</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </div>

      {error && (
        <div style={{padding:12, border:'1px solid #fca5a5', background:'#fee2e2', color:'#7f1d1d', borderRadius:8, marginBottom:12}}>
          {error}
        </div>
      )}
      {loading && <div style={{padding:12}}>Loading…</div>}

      {/* KPI nudge when missing */}
      {kpiSuggestions.length > 0 && (
        <section style={{border:'2px solid #0ea5e9', borderRadius:12, padding:16, marginTop:12}}>
          <div style={{opacity:.7, fontSize:12}}>Add KPIs to measure progress</div>
          <p style={{marginTop:6, opacity:.85}}>
            Based on your focus (<b>{primaryFocus()}</b>), consider tracking:
          </p>
          <ul style={{marginTop:8, paddingLeft:18}}>
            {kpiSuggestions.map((s, i) => (
              <li key={i} style={{margin:'4px 0'}}>
                <b>{s.name}</b> — <span style={{opacity:.85}}>{s.why}</span>
                {s.how ? <span style={{opacity:.6}}> (How: {s.how})</span> : null}
              </li>
            ))}
          </ul>
          <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr auto', gap:8, marginTop:10}}>
            <input placeholder="Metric (e.g., Open rate, CVR, CAC)" value={inlineKPI.metric} onChange={e=>setInlineKPI(v=>({...v, metric:e.target.value}))} style={{padding:8, border:'1px solid #ddd', borderRadius:8}} />
            <input placeholder="% | # | £ | $" value={inlineKPI.unit} onChange={e=>setInlineKPI(v=>({...v, unit:e.target.value}))} style={{padding:8, border:'1px solid #ddd', borderRadius:8}} />
            <input type="number" placeholder="Current" value={inlineKPI.current} onChange={e=>setInlineKPI(v=>({...v, current:e.target.value}))} style={{padding:8, border:'1px solid #ddd', borderRadius:8}} />
            <input type="number" placeholder="Target" value={inlineKPI.target} onChange={e=>setInlineKPI(v=>({...v, target:e.target.value}))} style={{padding:8, border:'1px solid #ddd', borderRadius:8}} />
            <button onClick={quickAddKPI} style={{border:'1px solid #ddd', borderRadius:8, background:'#fff'}}>Add</button>
          </div>
          <div style={{marginTop:10}}>
            <Link href="/kpis">Open full KPI manager →</Link>
          </div>
        </section>
      )}

      {/* Sprint content */}
      {day && (
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginTop:12}}>
          <div style={{display:'grid', gap:16}}>
            {/* Step 1 — Learn */}
            <section style={{border:'1px solid #e5e7eb', borderRadius:12, padding:16}}>
              <div style={{opacity:.7, fontSize:12}}>Step 1 — Learn</div>
              <h3 style={{margin:'8px 0'}}>{day.title}</h3>
              <p style={{opacity:.85}}>{day.knowledge}</p>
            </section>

            {/* Step 2 — Do */}
            <section style={{border:'1px solid #e5e7eb', borderRadius:12, padding:16}}>
              <div style={{opacity:.7, fontSize:12}}>Step 2 — Do</div>
              <p style={{marginTop:6}}><b>Task:</b> {day.task}</p>
              <div style={{display:'grid', gap:8, marginTop:12}}>
                <input placeholder="Goal #1 for the next month" value={goal1} onChange={e=>setGoal1(e.target.value)} style={{padding:10, border:'1px solid #ddd', borderRadius:8}} />
                <input placeholder="Goal #2 (optional)" value={goal2} onChange={e=>setGoal2(e.target.value)} style={{padding:10, border:'1px solid #ddd', borderRadius:8}} />
                <input placeholder="Goal #3 (optional)" value={goal3} onChange={e=>setGoal3(e.target.value)} style={{padding:10, border:'1px solid #ddd', borderRadius:8}} />
              </div>
            </section>

            {/* Step 3 — Reflect */}
            <section style={{border:'1px solid #e5e7eb', borderRadius:12, padding:16}}>
              <div style={{opacity:.7, fontSize:12}}>Step 3 — Reflect</div>
              <p style={{opacity:.85, marginTop:6}}>{day.reflection}</p>
              <textarea rows={3} placeholder="One insight or blocker you noticed…" value={reflection} onChange={e=>setReflection(e.target.value)} style={{width:'100%', padding:10, border:'1px solid #ddd', borderRadius:8}} />
              <div style={{display:'flex', alignItems:'center', gap:8, marginTop:10}}>
                <span style={{opacity:.7}}>How useful?</span>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={()=>setRating(n)} style={{padding:'6px 10px', borderRadius:999, border: rating===n ? '2px solid #0ea5e9' : '1px solid #ddd', background:'#fff'}}>{n}</button>
                ))}
              </div>
              <div style={{textAlign:'right', marginTop:12}}>
                <button onClick={saveAndCoach} style={{padding:'10px 14px', border:0, borderRadius:8, background:'#ff7a1a', color:'#111', fontWeight:700}}>
                  Save & get next steps
                </button>
              </div>
              {saved && (
                <div style={{marginTop:12, padding:12, border:'1px solid #bbf7d0', background:'#ecfdf5', color:'#065f46', borderRadius:8}}>
                  Progress saved ✓ — see “Coach now” below for immediate actions.
                </div>
              )}
            </section>

            {/* Coach now */}
            {nextSteps.length > 0 && (
              <section style={{border:'2px solid #0ea5e9', borderRadius:12, padding:16}}>
                <div style={{opacity:.7, fontSize:12}}>Coach now</div>
                <b>Next 10-minute moves</b>
                <ul style={{marginTop:8, paddingLeft:18}}>
                  {nextSteps.map((t, i) => <li key={i} style={{margin:'6px 0'}}>{t}</li>)}
                </ul>
              </section>
            )}
          </div>

          {/* Tips side */}
          <aside style={{border:'1px solid #e5e7eb', borderRadius:12, padding:16}}>
            <b>Tips</b>
            <ul style={{marginTop:8, paddingLeft:18}}>
              {(tips || []).map((t, i) => <li key={i} style={{opacity:.85, margin:'6px 0'}}>{t}</li>)}
            </ul>
            <div style={{opacity:.7, fontSize:12, marginTop:12}}>
              {aiEnabled ? 'AI mode: uses your focus & KPIs when available.' : 'Mock mode: demo content without API costs.'}
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
