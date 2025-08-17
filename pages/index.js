// pages/index.js
import Link from 'next/link';

export default function Home(){
  return (
    <main className="container">
      <header className="header">
        <div className="brand"><span className="brand-badge" />Skill Sprint</div>
        <nav className="nav">
          <Link href="/onboarding">Get started</Link>
          <Link href="/sprint">Today</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </header>

      <section className="hero" style={{marginTop:18}}>
        <div className="tag">Professional micro-coaching</div>
        <h1>Level up in 10 minutes a day</h1>
        <p>Clean, step-by-step sprints that turn goals into measurable progress.</p>
        <div style={{display:'flex', gap:12, marginTop:20}}>
          <Link href="/onboarding" className="btn btn-primary btn-lg">Start your first sprint</Link>
          <Link href="/sprint" className="btn btn-lg">View today’s sprint</Link>
        </div>
      </section>
    </main>
  );
}
