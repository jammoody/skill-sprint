// pages/index.js
import Link from 'next/link';
import Nav from '@/components/Nav';

export default function Home(){
  return (
    <>
      <Nav active="home" />
      <main className="container">
        <div className="row">
          <section className="card">
            <h1>Become great at your job — 10 minutes at a time</h1>
            <p className="help">Skill Sprint is a conversational coach + bite-size learning. Ask for help on real problems, then do a 5–30 minute sprint that teaches and applies.</p>
            <div className="inline" style={{marginTop:10}}>
              <Link className="btn btn-primary" href="/onboarding">Start free</Link>
              <Link className="btn" href="/coach">Open Coach</Link>
            </div>
          </section>
          <section className="card">
            <b>How it works</b>
            <ul className="list">
              <li><b>Upload your job description</b> to tailor context.</li>
              <li><b>Chat with your coach</b> about live issues.</li>
              <li><b>Run a sprint</b> with learning → quiz → mini test → real task.</li>
              <li><b>Report results</b> and get the next best step.</li>
            </ul>
          </section>
        </div>

        <section className="card" style={{marginTop:12}}>
          <b>Why it’s better than courses</b>
          <ul className="list">
            <li>Coaches you through your <i>actual</i> work, not generic theory.</li>
            <li>Short, focused, and measurable.</li>
            <li>Adapts to your goals, KPIs, and constraints.</li>
          </ul>
        </section>
      </main>
      <footer className="version">Skill Sprint</footer>
    </>
  );
}
