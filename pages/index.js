// pages/index.js
import Link from 'next/link';
import Nav from '../components/Nav';

export default function Home(){
  return (
    <>
      <Nav active="home" />
      <main className="container">
        <section className="hero" style={{marginTop:18}}>
          <div className="tag">Professional micro-coaching</div>
          <h1>Level up in 10 minutes a day</h1>
          <p>Step-by-step sprints that adapt to you — with KPIs and a coach that remembers.</p>
          <div style={{display:'flex', gap:12, marginTop:20, flexWrap:'wrap'}}>
            <Link href="/onboarding" className="btn btn-primary btn-lg">Start my tailored sprint</Link>
            <Link href="/coach" className="btn btn-lg">Talk to my coach</Link>
          </div>
        </section>
      </main>
    </>
  );
}
