// pages/index.js
import Link from 'next/link';
import Nav from '../components/Nav';

export default function Home(){
  return (
    <>
      <Nav active="" />
      <main className="container" style={{paddingTop:24}}>
        <section className="card" style={{background:'linear-gradient(135deg, #ffffff 60%, #EEF2FF)', borderColor:'#E0E7FF'}}>
          <h1 style={{margin:'0 0 8px 0', fontSize:32, lineHeight:1.2}}>
            Your AI Coach to <span style={{background:'linear-gradient(90deg,#8B5CF6,#3B82F6)', WebkitBackgroundClip:'text', color:'transparent'}}>level up at work</span>
          </h1>
          <p style={{opacity:.8,maxWidth:620}}>
            Short, practical sprints guided by a coach. Learn fast, apply immediately, and track progress against real KPIs.
          </p>
          <div className="chips" style={{marginTop:12}}>
            <Link href="/onboarding"><button className="btn btn-primary">Start free</button></Link>
            <Link href="/dashboard"><button className="btn">View dashboard</button></Link>
          </div>
        </section>

        <section className="card" style={{marginTop:16}}>
          <div className="section-title">Why Skill Sprint?</div>
          <ul style={{paddingLeft:18,margin:0,lineHeight:1.8}}>
            <li>Coach-first: ask anything, get actionable answers.</li>
            <li>Deepstash-style learning cards: Learn → Quiz → Real.</li>
            <li>Daily sprints aligned to your goals and KPIs.</li>
          </ul>
        </section>
      </main>
    </>
  );
}