// pages/api/coach.js
const SYSTEM = `You are Skill Sprint — a pragmatic micro-coach for early-career marketers/ecom folks.
Write BRIEF, actionable answers (~3–5 sentences). Prefer bullets or numbers.
If asked, propose a 5/10/20/30-minute sprint with:
- Learn: 1–2 concepts (plain language)
- Quiz: 2 check questions
- Mini test: 1 tiny task done now
- Real task: 1 action in their real work
Always keep tone supportive, adult, professional (not cartoonish).`;

const HINTS = [
  { key:'roas', re:/\broas\b/i, title:'Improve ROAS with creative + bids', learn:['roas-basics','creative-testing','bid-strategy'] },
  { key:'cvr', re:/\bcvr\b|conversion rate/i, title:'Lift CVR with clarity + proof', learn:['cvr-basics','offer-clarity','social-proof'] },
  { key:'ctr', re:/\bctr\b|click.?through/i, title:'Boost CTR with hooks + relevance', learn:['ctr-hooks','message-market-fit'] },
  { key:'cac', re:/\bcac\b/i, title:'Lower CAC via targeting + funnel', learn:['cac-basics','audience-testing','landing-page'] },
  { key:'aov', re:/\baov\b/i, title:'Increase AOV with bundles + upsells', learn:['aov-bundles','upsell-cross-sell'] },
  { key:'email', re:/email|newsletter|subject line|inbox/i, title:'Improve email performance', learn:['email-segmentation','email-hooks'] },
  { key:'seo', re:/\bseo\b/i, title:'Compound organic with SEO sprints', learn:['seo-quick-wins','seo-content'] },
  { key:'ads', re:/\bads?\b|google|meta|facebook|tiktok|linkedin/i, title:'Stabilise paid performance', learn:['creative-testing','bid-strategy'] },
];

const link = (slug) => ({ href:`/learn?topic=${encodeURIComponent(slug)}`, title:`Deep dive: ${slug.replace(/-/g,' ')}` });

function detect(text=''){
  const brief = /(^|\b)(brief|quick|short answer|answer briefly)(\b|$)/i.test(text);
  const resources = /(show|share).*(resource|guide|example)|\bresources?\b/i.test(text);
  const start = /start\s*(a|new)?\s*sprint|make\s*(a|new)?\s*sprint|do my own/i.test(text);
  const hit = HINTS.find(h=>h.re.test(text));
  return { brief, resources, start, hit };
}

async function aiBrief({ profile, kpis, last, user }){
  if (!process.env.OPENAI_API_KEY) return null;
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role:'system', content: SYSTEM },
      { role:'user', content: `Profile: ${JSON.stringify({
        focus: profile?.focus?.[0] || 'General',
        website: profile?.companyWebsite || null,
        areas: profile?.areas || [],
        goals: profile?.goals30d || (profile?.goal30d ? [profile.goal30d] : []),
        kpis
      })}` },
      ...((last||[]).slice(-6).map(m=>({role: m.from==='me'?'user':'assistant', content: m.text}))),
      { role:'user', content: user }
    ],
    temperature: 0.3, max_tokens: 260
  };
  try{
    const r = await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},
      body: JSON.stringify(body)
    });
    const data = await r.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  }catch{ return null; }
}

function fbBrief(text){
  if(/\broas\b/i.test(text)) return `Quick take on ROAS: 1) Test 3 creative hooks (pain • proof • offer) on same audience. 2) Compare broad vs stacked interests; reallocate after 3–5k impressions. 3) Cap bids to stabilise CPA; shift budget every 48h.`;
  if(/\bcvr\b|conversion rate/i.test(text)) return `Quick take on CVR: clarify headline value, add one proof block, and test a risk reducer (guarantee/returns).`;
  if(/\bctr\b/i.test(text)) return `Quick take on CTR: sharpen the hook (curiosity + specificity), align creative with landing-page promise, and test 3 angles.`;
  return `Quick take: make one small change tied to your main KPI this week; measure and iterate.`;
}

export default async function handler(req,res){
  if(req.method!=='POST'){ res.setHeader('Allow','POST'); return res.status(405).json({error:'Method not allowed'}); }
  const { profile={}, kpis={}, last=[], user='' } = req.body || {};
  const { brief, resources, start, hit } = detect(user);
  const focus = profile?.focus?.[0] || 'General';

  let reply=''; let quick=['Answer briefly','Start sprint','Show resources']; let links=[]; let threadSeed=null;

  if (brief) {
    reply = await aiBrief({ profile,kpis,last,user }) || fbBrief(user);
  } else if (resources) {
    const slugs = hit?.learn?.length ? hit.learn : ['getting-started', `${focus.toLowerCase()}-ideas`];
    links = slugs.map(link); reply = `Here are resources tailored to your question. Want me to start a sprint?`;
  } else if (start) {
    const title = hit?.title || (profile?.goals30d?.[0] || profile?.goal30d || `Focused improvement in ${focus}`);
    threadSeed = { title, topic: focus };
    reply = `Starting a sprint: “${title}”. Pick your time: 5 • 10 • 20 • 30 minutes.`;
  } else {
    if (hit?.title) { reply = `Got it. Want a quick answer on “${hit.title}”, some resources, or should I start a sprint?`; links = (hit.learn||[]).map(link); }
    else { reply = `Got it. Want a brief answer, a resource, or a focused sprint for this?`; links = [link(`${focus.toLowerCase()}-ideas`)]; }
  }

  res.status(200).json({ reply, quick, learningLinks:links, threadSeed });
}
