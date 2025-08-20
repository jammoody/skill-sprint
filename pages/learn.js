// pages/learn.js
import { useRouter } from 'next/router';
import Nav from '../components/Nav';

const CONTENT = {
  'getting-started': {
    title:'Getting started with Skill Sprint',
    bullets:[
      'Ask the coach about real problems first — then learn.',
      'Run a 5–30m sprint: learn → quiz → mini test → real task.',
      'Report results; the coach suggests the next step.'
    ]
  },
  'marketing-ideas': { title:'Ideas in Marketing', bullets:['Clarify value prop','Tighten audience','Focus your offer'] },
  'e-commerce-ideas': { title:'Ideas in E-commerce', bullets:['Segment by intent','Fix PDP clarity','Reduce drop-offs'] },
  'roas-basics': { title:'ROAS basics', bullets:['ROAS = Revenue / Ad Spend','Stabilise CPA before scaling','Creative x Audience x Bids'] },
  'creative-testing': { title:'Creative testing', bullets:['Test 3 hooks: pain • proof • offer','Hold audience constant','Measure after 3–5k impressions'] },
  'bid-strategy': { title:'Bid strategy', bullets:['Start with caps to stabilise','Shift budget to winners every 48h'] },
  'cvr-basics': { title:'Conversion basics', bullets:['Clarity beats clever','Add one proof block','Reduce risk (returns/guarantee)'] },
  'offer-clarity': { title:'Offer clarity', bullets:['Headline states the value','Match promise to audience'] },
  'social-proof': { title:'Social proof', bullets:['Use a short testimonial','Add star ratings or logos'] },
  'ctr-hooks': { title:'CTR hooks', bullets:['Curiosity + specificity','Consistent promise through the click'] },
  'message-market-fit': { title:'Message–market fit', bullets:['Match segment intent to message','Avoid bait & switch'] },
  'aov-bundles': { title:'AOV bundles', bullets:['Bundle complements','Price to look like a deal'] },
  'upsell-cross-sell': { title:'Upsell & cross-sell', bullets:['Offer relevant add-ons','Keep friction low'] },
  'seo-quick-wins': { title:'SEO quick wins', bullets:['Fix titles/descriptions','Internal links','Index essentials'] },
  'seo-content': { title:'SEO content', bullets:['Answer searcher intent','Use clear H1–H3','Link to deeper pages'] }
};

export default function Learn(){
  const { query } = useRouter();
  const topic = String(query.topic||'getting-started');
  const data = CONTENT[topic] || { title:'Learn', bullets:['No content yet.'] };

  return (
    <>
      <Nav active="learn" />
      <main className="container">
        <div className="card" style={{marginTop:18}}>
          <h2>{data.title}</h2>
          <ul className="list" style={{marginTop:8}}>
            {data.bullets.map((b,i)=><li key={i}>{b}</li>)}
          </ul>
        </div>
      </main>
    </>
  );
}
