// components/Nav.js
import Link from 'next/link';
import { useState } from 'react';

export default function Nav({ active="" }){
  const [open,setOpen]=useState(false);
  const Item = ({href,label,keyName}) => (
    <Link href={href} className={`nav-link ${active===keyName?'active':''}`}>{label}</Link>
  );

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link href="/" className="brand">Skill Sprint</Link>

        {/* Always-visible core actions */}
        <nav className="nav-core">
          <Item href="/dashboard" label="Dashboard" keyName="dash" />
          <Item href="/sprint" label="Sprint" keyName="today" />
          <Item href="/coach" label="Coach" keyName="coach" />
        </nav>

        {/* Burger */}
        <button aria-label="Menu" className="burger" onClick={()=>setOpen(!open)}>
          <span/><span/><span/>
        </button>
      </div>

      {open && (
        <div className="nav-drawer">
          <Link href="/onboarding" className="nav-drawer-link">Onboarding</Link>
          <Link href="/kpis" className="nav-drawer-link">KPIs</Link>
          <Link href="/sprints" className="nav-drawer-link">All sprints</Link>
          <Link href="/learn" className="nav-drawer-link">Learn</Link>
          <Link href="/profile" className="nav-drawer-link">Profile</Link>
        </div>
      )}

      <style jsx>{`
        .nav{position:sticky;top:0;background:#fff;border-bottom:1px solid var(--border);z-index:50}
        .nav-inner{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px}
        .brand{font-weight:900;letter-spacing:.2px}
        .nav-core{display:flex;gap:10px}
        .nav-link{padding:6px 10px;border:1px solid transparent;border-radius:10px}
        .nav-link.active{border-color:var(--accent);}
        .burger{width:40px;height:36px;border:1px solid var(--border);border-radius:10px;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}
        .burger span{display:block;width:18px;height:2px;background:#111}
        .nav-drawer{border-top:1px solid var(--border);padding:8px 16px;display:grid;gap:8px}
        .nav-drawer-link{padding:6px 10px;border:1px solid var(--border);border-radius:10px}
        @media(min-width:900px){ .burger{display:none} .nav-drawer{display:none} }
      `}</style>
    </header>
  );
}
