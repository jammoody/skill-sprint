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
