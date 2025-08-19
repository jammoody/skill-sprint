// pages/learn.js
import { useRouter } from 'next/router';
import Nav from '../components/Nav';

const ARTICLES = {
  'getting-started': {
    title: 'Coach guide: Getting started',
    body: [
      'Pick one focus and a measurable 30-day outcome.',
      'Spend ≤10 minutes daily — small steps compound.',
      'Use KPIs to anchor progress (one or two is enough).'
    ]
  },
  'email-segmentation': {
    title: 'How to choose email segments',
    body: [
      'Start with intent: repeat buyers, browsed-abandoners, cart starters.',
      'Size × impact: small but high-value segments can outperform broad lists.',
      'Keep it simple: two segments you can action this week beat ten you never use.'
    ]
  },
  'email-segmentation-examples': {
    title: 'Segment examples that work',
    body: [
      'Repeat buyers (90d) → loyalty nudge with new-in or early access.',
      'Browsed-abandoners (14d) → benefit-led reminder, not just a discount.',
      'High AOV customers → premium bundles, concierge support, VIP perks.'
    ]
  },
  'focus-ideas': {
    title: 'What to focus on first',
    body: [
      'Tighten the top of funnel message → clearer value prop + CTA.',
      'Fix the leakiest step (where do most drop off?).',
      'Ship one test per week; keep what works.'
    ]
  }
};

export default function Learn(){
  const { query } = useRouter();
  const topic = String(query.topic||'getting-started');
  const art = ARTICLES[topic] || ARTICLES['getting-started'];

  return (
    <>
      <Nav active="learn" />
      <main className="container">
        <div className="card" style={{marginTop:18}}>
          <h2 style={{margin:'6px 0 8px 0'}}>{art.title}</h2>
          <ul className="list">
            {art.body.map((b,i)=><li key={i} style={{margin:'8px 0'}}>{b}</li>)}
          </ul>
        </div>
      </main>
    </>
  );
}
