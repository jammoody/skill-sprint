import Link from 'next/link'
export default function Layout({ children, active='' }) {
  return (
    <div>
      <header className="header">
        <div className="container header-inner">
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:36,height:36,background:'#ff7a1a',borderRadius:8,color:'#fff',display:'grid',placeItems:'center',fontWeight:700}}>SS</div>
            <div>
              <div style={{fontWeight:700}}>Skill Sprint</div>
              <div className="hint">Your daily workout for business growth</div>
            </div>
          </div>
          <nav className="nav">
            <Link href="/" className={`link ${active==='home'?'active':''}`}>Home</Link>
            <Link href="/onboarding" className={`link ${active==='onboarding'?'active':''}`}>Skill Test</Link>
            <Link href="/dashboard" className={`link ${active==='dashboard'?'active':''}`}>Dashboard</Link>
            <Link href="/sprint" className={`link ${active==='sprint'?'active':''}`}>Today&apos;s Sprint</Link>
          </nav>
        </div>
      </header>
      <main className="container" style={{padding:'24px 0'}}>{children}</main>
      <footer style={{padding:'20px 0', marginTop:40}}>
        <div className="container" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>© {new Date().getFullYear()} Skill Sprint</div>
          <div className="hint">Free MVP — payments coming soon</div>
        </div>
      </footer>
    </div>
  )
}
