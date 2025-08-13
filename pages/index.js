import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Home(){
  return (
    <Layout active="home">
      <Head><title>Skill Sprint — Your Daily Business Workout</title></Head>
      <section className="hero">
        <div className="container section grid grid-2" style={{alignItems:'center'}}>
          <div>
            <div className="kicker">Built for busy founders & teams</div>
            <h1 className="h1">Short, sharp training.<br/>Long-term results.</h1>
            <p className="sub">Pick your focus — marketing, e-commerce, retail, leadership — and Skill Sprint delivers a 5–10 minute daily workout that turns learning into action.</p>
            <div style={{display:'flex',gap:12,marginTop:16}}>
              <Link href="/onboarding" className="btn">Take My Free Skill Test</Link>
              <Link href="/sprint" className="btn secondary">Try Today’s Sprint</Link>
            </div>
            <div className="testlinks" style={{marginTop:18}}>
              <span className="hint">Test pages: </span>
              <Link href="/">Home</Link> · <Link href="/onboarding">Onboarding</Link> · <Link href="/sprint">Sprint</Link> · <Link href="/dashboard">Dashboard</Link>
            </div>
          </div>
          <div className="card">
            <div className="badge">Preview</div>
            <h3>Day 1: Value Proposition</h3>
            <p className="hint">Write a one-sentence value proposition. We’ll refine it tomorrow.</p>
            <textarea rows="4" style={{width:'100%',background:'#0b1020',border:'1px solid #1f2a44',color:'#e5e7eb',borderRadius:10,padding:12}} placeholder="We help [who] achieve [outcome] by [how]." />
            <div style={{textAlign:'right',marginTop:8}}><button className="btn">Save</button></div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
