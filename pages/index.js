// pages/index.js
import Link from 'next/link';

export default function Home(){
  return (
    <main className="container">
      <header className="header">
        <div className="brand">
          <span className="brand-badge" />
          Skill Sprint
        </div>
        <nav className="nav">
          <Link href="/onboarding">Get started</Link>
          <Link href="/sprint">Today</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </header>

      <section className="hero" style={{marginTop:18}}>
        <div className="tag">Professional micro-coaching</div>
        <h1>Level up in 10 minutes a day</h1>
        <p>Clean, step-by-step sprints that turn goals into measurable progress — with a coach style that fits you.</p>
        <div style={{display:'flex', gap:12, marginTop:20}}>
          <Link href="/onboarding" className="btn btn-primary btn-lg">Start your first sprint</Link>
          <Link href="/sprint" className="btn btn-lg">View today’s sprint</Link>
        </div>
      </section>

      <section style={{marginTop:20}} className="row three">
        <div className="card">
          <b>One step at a time</b>
          <p className="help" style={{marginTop:6}}>No overwhelm. A single clear action per screen, just like the best product onboardings.</p>
        </div>
        <div className="card">
          <b>Measurable KPIs</b>
          <p className="help" style={{marginTop:6}}>Track current vs target for anything — revenue, CVR, churn, response time, you name it.</p>
        </div>
        <div className="card">
          <b>Your coaching style</b>
          <p className="help" style={{marginTop:6}}>Supportive, direct, or data-driven — choose a voice that motivates you.</p>
        </div>
      </section>
    </main>
  );
}
