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

  // inline KPI capture (email)
  const [emailKPI,setEmailKPI]=useState({listSize:'',segmentation:'none',openRatePct:'',ctrPct:'',cvrPct:'',revSharePct:''});
  const [needsEmailKPI,setNeedsEmailKPI]=useState(false);

  // ---- local storage helpers ----
  const getProfile = () => { try { return JSON.parse(localStorage.getItem('ss_profile')||'null') || {}; } catch { return {}; } };
  const getHistory = () => { try { return JSON.parse(localStorage.getItem('ss_history')||'[]') || []; } catch { return []; } };
  const setHistory = next => localStorage.setItem('ss_history', JSON.stringify(next));
  const getKPIs = () => { try { return JSON.parse(localStorage.getItem('ss_kpis')||'{}') || {}; } catch { return {}; } };
  const setKPIs = next => localStorage.setItem('ss_kpis', JSON.stringify(next||{}));

  useEffect(()=>{
    const enabled = typeof window !== 'undefined' && localStorage.getItem('ss_ai_passcode');
    setAiEnabled(Boolean(enabled));
    // prefill inline KPI form if any saved
    const k = getKPIs();
    const e = k.email || {};
    setEmailKPI({
      listSize: e.listSize ?? '',
      segmentation: e.segmentation ?? 'none',
      openRatePct: e.openRate != null ? Math.round(e.openRate*100) : '',
      ctrPct: e.ctr != null ? Math.round(e.ctr*100) : '',
      cvrPct: e.cvr != null ? Math.round(e.cvr*100) : '',
      revSharePct: e.revShare != null ? Math.round(e.revShare*100) : ''
    });
    decideIfNeedsEmailKPI();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  function decideIfNeedsEmailKPI(){
    const profile = getProfile();
    const focus = profile?.focus || [];
    const wantsEmail = focus.includes('Marketing'); // treat Marketing as email track for MVP
    const e = (getKPIs().email)||{};
    const required = ['listSize','segmentation','openRate','ctr','cvr','revShare'];
    const missing = required.filter(key => e[key]==='' || e[key]==null || e[key]===undefined);
    setNeedsEmailKPI(wantsEmail && missing.length>0);
  }

  // ---- load a sprint (uses KPIs if present) ----
  async function load(){
    setLoading(true); setError(''); setSaved(false); setNextSteps([]);
    try{
      const pass = typeof window !== 'undefined' ? (localStorage.getItem('ss_ai_passcode') || '') : '';
      const body = { profile: {...getProfile(), kpis: getKPIs()}, history: getHistory() };
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
    }catch{
      setError('Could not load today\'s sprint.');
    } finally { setLoading(false); }
  }

  // ---- AI toggle ----
  function enableAI(){ const code = prompt('Enter AI Dev Passcode (matches SS_AI_PASSCODE in Vercel)'); if(!code) return; localStorage.setItem('ss_ai_passcode', code); setAiEnabled(true); load(); }
  function disableAI(){ localStorage.removeItem('ss_ai_passcode'); setAiEnabled(false); load(); }

  // ---- Save KPIs inline ----
  function saveInlineEmailKPIs(){
    const toNumber = v => (v==='' || v==null) ? null : Number(v);
    const toRatio = v => (v==='' || v==null) ? null : Number(v)/100;
    const next = {
      email:{
        listSize: toNumber(emailKPI.listSize),
        segmentation: emailKPI.segmentation,
        openRate: toRatio(emailKPI.openRatePct),
        ctr: toRatio(emailKPI.ctrPct),
        cvr: toRatio(emailKPI.cvrPct),
        revShare: toRatio(emailKPI.revSharePct)
      }
    };
    setKPIs(next);
    setNeedsEmailKPI(false);
    alert('KPIs saved. Sprint will use these numbers.');
    load();
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
        body: JSON.stringify({ profile: {...getProfile(), kpis: getKPIs()}, history: nextHist, followup: { goals } })
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
        'Draft the first 3 bullets for Goal #1.',
        'Schedule a 10-minute slot tomorrow for Goal #1.',
        'Define one simple metric to track progress.'
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{maxWidth:900, margin:'0 auto', padding:'24px', fontFamily:'system-ui'}}>
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

      {/* Inline KPI prompt if needed */}
      {needsEmailKPI && (
        <section style={{border:'2px solid #0ea5e9', borderRadius:12, padding:16, marginTop:16}}>
          <div style={{opacity:.7, fontSize:12}}>Quick setup — Email KPIs</div>
          <p style={{marginTop:8,opacity:.85}}>Add a few numbers so your coach can benchmark performance and tailor advice.</p>
          <div style={{display:'grid', gap:12, gridTemplateColumns:'1fr 1fr'}}>
            <label>List size
              <input type="number" min="0" value={emailKPI.listSize} onChange={e=>setEmailKPI(v=>({...v,listSize:e.target.value}))}
                style={{width:'100%',padding:10,border:'1px solid #ddd',borderRadius:8}}/>
            </label>
            <label>Segmentation
              <select value={emailKPI.segmentation} onChange={e=>setEmailKPI(v=>({...v,segmentation:e.target.value}))}
                style={{width:'100%',padding:10,border:'1px solid #ddd',borderRadius:8}}>
                <option value="none">None</option>
                <option value="basic">Basic (2–4 segments)</option>
                <option value="advanced">Advanced (5+ / behavioral)</option>
              </select>
            </label>
            <label>Open rate (%)
              <input type="number" min="0" max="100" value={emailKPI.openRatePct} onChange={e=>setEmailKPI(v=>({...v,openRatePct:e.target.value}))}
                style={{width:'100%',padding:10,border:'1px solid #ddd',borderRadius:8}}/>
            </label>
            <label>Click-through rate (%)
              <input type="number" min="0" max="100" value={emailKPI.ctrPct} onChange={e=>setEmailKPI(v=>({...v,ctrPct:e.target.value}))}
                style={{width:'100%',padding:10,border:'1px solid #ddd',borderRadius:8}}/>
            </label>
            <label>Conversion rate (%)
              <input type="number" min="0" max="100" value={emailKPI.cvrPct} onChange={e=>setEmailKPI(v=>({...v,cvrPct:e.target.value}))}
                style={{width:'100%',padding:10,border:'1px solid #ddd',borderRadius:8}}/>
            </label>
            <label>Revenue share from email (%)
              <input type="number" min="0" max="100" value={emailKPI.revSharePct} onChange={e=>setEmailKPI(v=>({...v,revSharePct:e.target.value}))}
                style={{width:'100%',padding:10,border:'1px solid #ddd',borderRadius:8}}/>
            </label>
          </div>
          <div style={{display:'flex',gap:12,marginTop:12}}>
            <button onClick={saveInlineEmailKPIs} style={{padding:'10px 14px',border:0,borderRadius:8,background:'#ff7a1a',color:'#111',fontWeight:700}}>Save KPIs & refresh sprint</button>
            <Link href="/kpis">Open full KPI page</Link>
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
                  Progress saved ✓ — Your goals were stored to the Dashboard. See “Coach now” below for immediate 10-minute actions.
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
              {aiEnabled ? 'AI mode (dev): content uses your KPIs when available.' : 'Mock mode: demo content without API costs.'}
            </div>
            <div style={{marginTop:12}}>
              <Link href="/kpis">Update KPIs →</Link>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
                                                                                              }            { role: 'user', content: user }
          ]
        })
      });

      const data = await r.json();
      const raw = data?.choices?.[0]?.message?.content || '';
      const parsed = extractJSON(raw);

      const aiSteps =
        parsed?.followupSteps && Array.isArray(parsed.followupSteps)
          ? parsed.followupSteps.filter(Boolean)
          : [];

      // Combine AI steps with defaults (no duplicates), keep 5 max
      const combined = [...aiSteps, ...DEFAULT_NEXT_STEPS].filter(Boolean);
      const unique = Array.from(new Set(combined)).slice(0, 5);

      return res.status(200).json({ mode: 'ai', followupSteps: unique });
    } catch {
      // On any error, still give useful defaults
      return res.status(200).json({
        mode: 'ai',
        followupSteps: DEFAULT_NEXT_STEPS.slice(0, 5)
      });
    }
  }

  // ---- DAILY SPRINT (AI) ----
  try {
    const sys = `You are Skill Sprint, a business micro-coach.
Return JSON ONLY in this schema:
{"day":{"title":"","knowledge":"2-3 sentences","task":"1 actionable task","reflection":""},"tips":["",""]}
Rules:
- Reflection must clearly relate to today’s task.
- Be concrete; prefer numbers, examples, or checklists.
- If user focus relates to goals, use "${REFLECTION_PROMPT}" as the reflection.`;

    const user = `PROFILE: ${JSON.stringify(profile)}
RECENT: ${JSON.stringify(history.slice(-5))}
TIME PER DAY: ${profile?.time || '5'} minutes
FOCUS: ${(profile?.focus || []).join(', ') || 'General'}
ROLE: ${profile?.role || 'Unknown'}
CHALLENGE: ${profile?.challenge || '—'}`;

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.35,
        max_tokens: 500,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user }
        ]
      })
    });

    const data = await r.json();
    const raw = data?.choices?.[0]?.message?.content || '';
    const parsed = extractJSON(raw);

    // Guard rails: if model is messy, fall back to clear copy
    const day =
      parsed?.day && parsed.day.title
        ? {
            ...parsed.day,
            reflection: parsed.day.reflection || REFLECTION_PROMPT
          }
        : baseDay;

    const tips =
      Array.isArray(parsed?.tips) && parsed.tips.length ? parsed.tips : baseTips;

    return res.status(200).json({ mode: 'ai', day, tips });
  } catch {
    return res.status(200).json({ mode: 'ai', day: baseDay, tips: baseTips });
  }
}
