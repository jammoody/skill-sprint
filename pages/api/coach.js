// pages/api/coach.js
/**
 * Conversational coach that:
 * - Detects intent (brief answer, resources, start sprint) and topic from the user's turn
 * - Uses OpenAI if OPENAI_API_KEY is present; otherwise a good rule-based fallback
 * - Returns: reply (short), quick actions, learningLinks, and an optional sprintSeed derived from the topic
 *
 * Expected request JSON:
 * { profile, kpis, context, user, last }  // last = last ~6 messages [{from:'me'|'coach',text:''}]
 */

const SYSTEM_BRIEF = `You are "Skill Sprint"—a pragmatic business coach. 
Write BRIEF, actionable answers (3-5 sentences). 
Do not waffle. Prefer numbered tips or bullets. 
If the user asks about metrics (ROAS, CAC, CVR, CTR, AOV, churn), include 1-2 quick levers to test this week.`;

const TOPIC_HINTS = [
  { key: 'roas', re: /\broas\b/i, title: 'Improve ROAS with creative + bids', learn: ['roas-basics','creative-testing','bid-strategy'] },
  { key: 'cac', re: /\bcac\b/i, title: 'Lower CAC via targeting + funnel', learn: ['cac-basics','audience-testing','landing-page'] },
  { key: 'cvr', re: /\bcvr\b|conversion rate/i, title: 'Lift CVR with clarity + proof', learn: ['cvr-basics','offer-clarity','social-proof'] },
  { key: 'ctr', re: /\bctr\b|click.?through/i, title: 'Boost CTR with hooks + relevance', learn: ['ctr-hooks','message-market-fit'] },
  { key: 'aov', re: /\baov\b/i, title: 'Increase AOV with bundles + upsells', learn: ['aov-bundles','upsell-cross-sell'] },
  { key: 'churn', re: /\bchurn\b/i, title: 'Reduce churn with activation + value moments', learn: ['churn-causes','activation'] },
  { key: 'email', re: /email|newsletter|subject line|inbox/i, title: 'Improve email performance', learn: ['email-segmentation','email-hooks'] },
  { key: 'seo', re: /\bseo\b/i, title: 'Compound organic with SEO sprints', learn: ['seo-quick-wins','seo-content'] },
  { key: 'ads', re: /\bads?\b|google|meta|facebook|tiktok|linkedin/i, title: 'Stabilise paid performance', learn: ['creative-testing','bid-strategy'] },
];

const learnLink = (slug, title) => ({ href: `/learn?topic=${encodeURIComponent(slug)}`, title });

function detectIntentAndTopic(text='') {
  const t = text.toLowerCase();
  const wantsBrief = /(^|\b)(brief|quick|short answer|answer briefly)(\b|$)/i.test(text);
  const wantsResources = /(show|share).*(resource|guide|example)|\bresources?\b/i.test(text);
  const wantsSprint = /start\s*(a|new)?\s*sprint|make\s*(a|new)?\s*sprint/i.test(text);

  // topic matchers
  const hit = TOPIC_HINTS.find(h => h.re.test(text));
  const topic = hit ? hit.key : null;

  return {
    wantsBrief, wantsResources, wantsSprint,
    topicKey: topic,
    topicTitle: hit?.title || null,
    learnSlugs: hit?.learn || []
  };
}

async function openAIBriefAnswer({ profile, kpis, last, user }) {
  const hasKey = !!process.env.OPENAI_API_KEY;
  if (!hasKey) return null;

  const messages = [
    { role: 'system', content: SYSTEM_BRIEF },
    { role: 'user', content: `User profile:\n${JSON.stringify({
      focus: profile?.focus?.[0] || 'General',
      website: profile?.companyWebsite || null,
      areas: profile?.areas || [],
      goals: profile?.goals30d || (profile?.goal30d ? [profile.goal30d] : []),
      kpis
    }, null, 2)}` },
  ];

  // include small tail of convo for context
  (last || []).slice(-6).forEach(m => {
    messages.push({ role: m.from === 'me' ? 'user' : 'assistant', content: m.text });
  });
  messages.push({ role: 'user', content: user });

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.3,
        max_tokens: 220
      })
    });
    const data = await r.json();
    const txt = data?.choices?.[0]?.message?.content?.trim();
    if (!txt) return null;
    return txt;
  } catch {
    return null;
  }
}

function fallbackBriefAnswer(text, focus) {
  if (/\broas\b/i.test(text)) {
    return [
      `Quick take on ROAS:`,
      `1) Creative: test 3 hooks (pain • proof • offer) against the same audience.`,
      `2) Targeting: split broad vs. stacked interests; compare ROAS after 3–5k impressions.`,
      `3) Bids/Budget: cap bids to stabilise CPA; re-allocate to winners every 48h.`,
      `Want me to spin up a sprint for this?`
    ].join('\n');
  }
  if (/cac/i.test(text)) {
    return `Quick take on CAC: tighten audience (recency/intent), fix above-the-fold offer, and reduce form friction. Test one change at a time and watch CPA. Start a sprint?`;
  }
  if (/cvr|conversion rate/i.test(text)) {
    return `Quick take on CVR: clarify the value prop in the headline, add 1 social-proof block, and test a risk reducer (guarantee/returns). Start a sprint?`;
  }
  return `Quick take: make the smallest change that moves your main KPI this week. I can propose a 10-minute sprint if you want.`;
}

export default async function handler(req, res){
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).json({error:'Method not allowed'}); }

  const { profile={}, kpis={}, context={}, user='', last=[] } = req.body || {};
  const focus = profile?.focus?.[0] || 'General';
  const { wantsBrief, wantsResources, wantsSprint, topicKey, topicTitle, learnSlugs } = detectIntentAndTopic(user);

  // Prepare response shells
  let reply = '';
  let quick = ['Answer briefly','Start sprint','Show resources'];
  let links = [];
  let sprintSeed = null;

  // Branch on user intent
  if (wantsBrief) {
    // AI first, fallback otherwise
    reply = await openAIBriefAnswer({ profile, kpis, last, user }) || fallbackBriefAnswer(user, focus);
  } else if (wantsResources) {
    const slugs = learnSlugs.length ? learnSlugs : ['getting-started', `${focus.toLowerCase()}-ideas`];
    links = slugs.map(s => learnLink(s, `Deep dive: ${s.replace(/-/g,' ')}`));
    reply = `Here are resources tailored to your question. Want me to start a sprint?`;
  } else if (wantsSprint) {
    const title = topicTitle || (profile?.goals30d?.[0] || profile?.goal30d || `Focused improvement in ${focus}`);
    sprintSeed = { title, topic: focus };
    reply = `Starting a fresh sprint: “${title}”.`;
  } else {
    // Default conversational route
    if (topicTitle) {
      reply = `Got it. Do you want a brief answer on “${topicTitle}”, some resources, or shall I start a sprint for it?`;
      links = learnSlugs.map(s => learnLink(s, `Deep dive: ${s.replace(/-/g,' ')}`));
    } else {
      reply = `Got it. Want a quick answer, a resource, or a focused sprint for this?`;
      links = [learnLink(`${focus.toLowerCase()}-ideas`, `Ideas in ${focus}`)];
    }
  }

  // If the user talked about a topic but didn’t say "start sprint", still offer a sprint seed
  if (!sprintSeed && topicTitle) {
    sprintSeed = { title: topicTitle, topic: focus };
  }

  return res.status(200).json({
    reply,
    quick,
    learningLinks: links,
    sprintSeed
  });
}
