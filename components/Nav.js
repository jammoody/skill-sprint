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
      <div className="nav-inner container" style={{padding:'10px 16px'}}>
        <Link href="/" className="brand">Skill Sprint</Link>

        <nav className="nav-core">
          <Item href="/dashboard" label="Dashboard" keyName="dash" />
          <Item href="/coach" label="Coach" keyName="coach" />
          <Item href="/learn" label="Learn" keyName="learn" />
          <Item href="/onboarding" label="Onboard" keyName="onboard" />
        </nav>

        <button aria-label="Menu" className="burger" onClick={()=>setOpen(o=>!o)}>
          <span/><span/><span/>
        </button>
      </div>

      {open && (
        <div className="nav-drawer container">
          <Link onClick={()=>setOpen(false)} href="/dashboard" className="nav-drawer-link">Dashboard</Link>
          <Link onClick={()=>setOpen(false)} href="/coach" className="nav-drawer-link">Coach</Link>
          <Link onClick={()=>setOpen(false)} href="/learn" className="nav-drawer-link">Learn</Link>
          <Link onClick={()=>setOpen(false)} href="/onboarding" className="nav-drawer-link">Onboarding</Link>
          <Link onClick={()=>setOpen(false)} href="/" className="nav-drawer-link">Home</Link>
        </div>
      )}
    </header>
  );
}