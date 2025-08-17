// components/Nav.js
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Nav({ active }) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem('ss_history') || '[]');
      const days = new Set(h.map(e => new Date(e.date).toDateString()));
      let s = 0; const d = new Date();
      while (days.has(d.toDateString())) { s++; d.setDate(d.getDate()-1); }
      setStreak(s);
    } catch {}
  }, []);

  return (
    <div className="topnav">
      <div className="topnav-inner">
        <div className="brand"><span className="brand-badge" />Skill Sprint</div>
        <nav className="mainnav">
          <Link className={active==='today'?'active':''} href="/sprint">Today</Link>
          <Link className={active==='coach'?'active':''} href="/coach">Coach</Link>
          <Link className={active==='dash'?'active':''} href="/dashboard">Dashboard</Link>
          <Link className={active==='kpis'?'active':''} href="/kpis">KPIs</Link>
        </nav>
        <div className="rightnav">
          <span>Streak 🔥 <b>{streak}</b></span>
        </div>
      </div>
    </div>
  );
}
