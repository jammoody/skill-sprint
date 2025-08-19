// pages/index.js
import Link from 'next/link';
import Nav from '../components/Nav';

export default function Home(){
  return (
    <>
      <Nav active="home" />
      <main className="container">
        {/* Hero */}
        <section className="hero" style={{marginTop:18}}>
          <div className="tag">Professional micro-coaching</div>
          <h1>Become excellent at your job — in 10 minutes a day</h1>
          <p>Skill Sprint blends a coach that answers your real questions with tiny, KPI-driven sprints. Less fluff. More progress.</p>
          <div style={{display:'flex', gap:12, marginTop:20, flexWrap:'wrap'}}>
            <Link href="/onboarding" className="btn btn-primary btn-lg">Start free</Link>
            <Link href="/coach" className="btn btn-lg">Ask the coach</Link>
          </div>
          <div className="inline" style={{marginTop:16}}>
            <span className="tag">No credit card</span>
            <span className="tag">Personalised plan</span>
            <span className="tag">Track KPIs</span>
          </div>
        </section>

        {/* How it works */}
        <section className="row three" style={{marginTop:16}}>
          {[
            {t:'Tell us your role & goals',d:'Paste a job description or describe your role. Pick areas to improve.'},
            {t:'Tiny sprints, daily',d:'10-minute steps with examples. Learn + apply + evolve.'},
            {t:'Measured by KPIs',d:'Your plan adapts to what moves your numbers.'},
          ].map((b,i)=>(
            <div key={i} className="card">
              <b>{b.t}</b>
              <p className="help" style={{marginTop:6}}>{b.d}</p>
            </div>
          ))}
        </section>

        {/* Benefits grid */}
        <section className="row three" style={{marginTop:16}}>
          {[
            {t:'Answers, not lectures',d:'Coach gives brief, practical replies — plus deeper links when you want.'},
            {t:'Action over theory',d:'Every chat can become a 10-minute sprint with clear next steps.'},
            {t:'Designed for busy pros',d:'Short, focused, and tailored to your job — not generic courses.'},
          ].map((b,i)=>(
            <div key={i} className="card">
              <b>{b.t}</b>
              <p className="help" style={{marginTop:6}}>{b.d}</p>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="card" style={{marginTop:16, display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
          <div>
            <b>Ready to see your first win this week?</b>
            <p className="help" style={{marginTop:6}}>Start with a 3-step onboarding — no sign-in required.</p>
          </div>
          <Link href="/onboarding" className="btn btn-primary btn-lg">Start free</Link>
        </section>
      </main>
    </>
  );
}
