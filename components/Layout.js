import Link from 'next/link';
export default function Layout({ children, active='' }) {
  return (
    <div>
      <header className="header">
        <div className="container header-inner">
          <div className="brand">
            <div className="logo">SS</div>
            <div>
              <div style={{fontWeight:900}}>Skill Sprint</div>
              <div className="hint">Your daily workout for business growth</div>
            </div>
          </div>
          <nav className="nav">
            <Link className={`link ${active==='home'?'active':''}`} href="/">Home</Link>
            <Link className={`link ${active==='onboarding'?'active':''}`} href="/onboarding">Skill Test</Link>
            <Link className={`link ${active==='sprint'?'active':''}`} href="/sprint">Today&apos;s Sprint</Link>
            <Link className={`link ${active==='dashboard'?'active':''}`} href="/dashboard">Dashboard</Link>
          </nav>
        </div>
      </header>
      {children}
      <footer>
        <div className="container" style={{padding:'18px 0', display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>© {new Date().getFullYear()} Skill Sprint</div>
          <div className="hint">Free MVP — payments coming later</div>
        </div>
      </footer>
    </div>
  );
}
