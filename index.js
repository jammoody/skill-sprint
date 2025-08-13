import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/Layout'

export default function Home() {
  return (
    <Layout active="home">
      <Head><title>Skill Sprint</title></Head>
      <section className="grid grid-2" style={{alignItems:'center'}}>
        <div>
          <h1 style={{fontSize:42, lineHeight:1.1, margin:'8px 0'}}>Your Daily Workout for Business Growth</h1>
          <p style={{color:'#6b7280', fontSize:18}}>Short, sharp, daily sprints that turn learning into real results.</p>
          <div style={{display:'flex', gap:12, marginTop:16}}>
            <Link href="/onboarding" className="btn">Take My Free Skill Test</Link>
            <Link href="/sprint" className="btn secondary">Try a Sprint Now</Link>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)', gap:12, marginTop:24}}>
            <div className="card"><b>Short & Focused</b><p className="hint" style={{marginTop:8}}>5–10 mins/day fits your schedule.</p></div>
            <div className="card"><b>Real-World</b><p className="hint" style={{marginTop:8}}>Every sprint applies to your business.</p></div>
            <div className="card"><b>Adaptive</b><p className="hint" style={{marginTop:8}}>Plans evolve as you improve.</p></div>
          </div>
        </div>
        <div>
          <div className="card">
            <div className="badge">Preview</div>
            <h3>Day 1: Value Proposition</h3>
            <p className="hint">Write a one-sentence value proposition. We’ll refine it tomorrow.</p>
            <textarea className="textarea" rows="4" placeholder="Our product helps [who] achieve [outcome] by [how]."></textarea>
            <div style={{textAlign:'right', marginTop:8}}>
              <button className="btn">Save</button>
            </div>
          </div>
        </div>
      </section>
      <section style={{marginTop:32}}>
        <h3>How it works</h3>
        <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)'}}>
          <div className="card"><div className="badge">1</div><b>Pick focus areas</b><p className="hint" style={{marginTop:8}}>Marketing, e‑commerce, retail, leadership…</p></div>
          <div className="card"><div className="badge">2</div><b>Take a quick skill test</b><p className="hint" style={{marginTop:8}}>Find strengths and gaps in 60–90 seconds.</p></div>
          <div className="card"><div className="badge">3</div><b>Daily sprints</b><p className="hint" style={{marginTop:8}}>Learn, act, reflect. Build momentum.</p></div>
        </div>
      </section>
    </Layout>
  )
}
