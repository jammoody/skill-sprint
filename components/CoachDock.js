// components/CoachDock.js
import { useState } from 'react';
import { getProfile, getKPIs, createSprint } from '../lib/store';

export default function CoachDock({ context = {} }){
  const [open,setOpen] = useState(false);
  const [input,setInput] = useState('');
  const [reply,setReply] = useState('');
  const [links,setLinks] = useState([]);
  const [busy,setBusy] = useState(false);

  async function ask(q){
    if (!q.trim()) return;
    setBusy(true); setReply(''); setLinks([]);
    try{
      const res = await fetch('/api/coach', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          profile: getProfile(),
          kpis: getKPIs(),
          context,
          user: q
        })
      });
      const data = await res.json();
      setReply(data.reply || 'Got it.');
      setLinks(Array.isArray(data.learningLinks)? data.learningLinks : []);
    } finally {
      setBusy(false);
    }
  }

  function startSprint(){
    const s = createSprint({ title: context?.suggestedTitle || 'New sprint', topic: getProfile()?.focus?.[0]||'General' });
    window.location.assign(`/sprint?sid=${encodeURIComponent(s.id)}`);
  }

  return (
    <>
      <button className="coach-fab" onClick={()=>setOpen(!open)}>Coach</button>
      {open && (
        <div className="coach-dock">
          <div className="coach-head">
            <b>Coach</b>
            <span className="small" style={{opacity:.7}}>{context?.label || 'Ask me anything'}</span>
          </div>

          {reply && <div className="coach-reply">{reply}</div>}
          {links?.length>0 && (
            <div className="inline" style={{marginTop:8}}>
              {links.map((l,i)=><a key={i} className="btn btn-chip" href={l.href}>{l.title}</a>)}
            </div>
          )}

          <div className="coach-bar">
            <input className="input" placeholder="Ask for help…" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') ask(input); }} />
            <button className="btn btn-primary" onClick={()=>ask(input)} disabled={busy}>{busy?'…':'Send'}</button>
            <button className="btn" onClick={startSprint}>Start sprint</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .coach-fab{position:fixed;right:16px;bottom:16px;padding:10px 14px;border:1px solid var(--border);border-radius:999px;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,.06);z-index:60}
        .coach-dock{position:fixed;right:16px;bottom:70px;width:min(520px,calc(100vw - 32px));background:#fff;border:1px solid var(--border);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.12);padding:12px;z-index:60}
        .coach-head{display:flex;align-items:center;justify-content:space-between}
        .coach-reply{margin-top:8px;padding:10px;border:1px solid var(--border);border-radius:10px;background:#fafafa}
        .coach-bar{display:flex;gap:8px;margin-top:10px}
        @media(max-width:480px){ .coach-dock{right:8px;left:8px;width:auto} }
      `}</style>
    </>
  );
}
