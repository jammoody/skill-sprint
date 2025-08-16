// pages/sprint.js
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Sprint(){
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [day,setDay]=useState(null);
  const [tips,setTips]=useState([]);
  const [aiEnabled, setAiEnabled] = useState(false);

  const [g1,setG1]=useState('');
  const [g2,setG2]=useState('');
  const [g3,setG3]=useState('');
  const [reflection,setReflection]=useState('');
  const [rating,setRating]=useState(0);

  const [saved,setSaved]=useState(false);
  const [nextSteps,setNextSteps]=useState([]); // immediate, tailored next steps after saving

  useEffect(()=>{
    setAiEnabled(Boolean(typeof window !== 'undefined' && localStorage.getItem('ss_ai_passcode')));
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  function getProfile(){
    try { return JSON.parse(localStorage.getItem('ss_profile')||'null') || {}; }
    catch { return {}; }
  }
  function getHistory(){
    try { return JSON.parse(localStorage.getItem('ss_history')||'[]') || []; }
    catch { return []; }
  }
  function setHistory(next){ localStorage.setItem('ss_history', JSON.stringify(next)); }

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

      if (data?.error || data?.note) {
        const dbg = data?.detail ? ` | ${JSON.stringify(data.detail)}` : '';
        setError(`${data?.error || data?.note}${dbg}`);
      }

      setDay(data.day); setTips(data.tips||[]);
    }catch(e){
      console.error(e);
      setError('Could not load today\'s sprint.');
    } finally { setLoading(false); }
  }

  function enableAI(){
    const code = prompt('Enter AI Dev Passcode'); // must match SS_AI_PASSCODE in Vercel
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

  async function saveAndCoach(){
    // 1) save to local history
    const goals = [g1,g2,g3].filter(Boolean);
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

    // 2) ask AI for immediate next steps (based on those goals)
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
      // Accept either day.tips or a special followupSteps array from API
      const follow = data?.followupSteps || data?.tips || [];
      setNextSteps(Array.isArray(follow) ? follow.slice(0,5) : []);
    }catch(e){
      console.error(e);
    }finally{
      setLoading(false);
    }
  }

  return (
    <main style={{maxWidth:900, margin:'0 auto', padding:'24px', fontFamily:'system-ui'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center', border:'2px dashed #f59e0b', padding:'8px'}}>
        <h1>Today&apos;s Sprint (with AI toggle)</h1>
        <div style={{display:'flex', gap:12, alignItems:'center'}}>
          <strong>AI
