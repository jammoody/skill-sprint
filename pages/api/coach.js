// pages/api/coach.js
export default function handler(req, res){
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).json({error:'Method not allowed'}); }

  const { profile={}, user='', mem={} } = req.body || {};
  const focus = profile.focus?.[0] || 'General';
  const txt = (user||'').toLowerCase();

  let reply='', quick=[], route=null, sprintSeed=null, newMem={...mem};

  if (/^✅|^yes\b|^correct\b/.test(user)) {
    reply = `Great. Two quick checks:
1) What’s your current list size (growing/stable)?
2) Do you segment today?`;
    quick = ['List ~5k, growing','No segmentation','I do segment'];
  } else if (txt.includes('start sprint')) {
    reply = 'Nice — seeding a 10-minute sprint.';
    sprintSeed = { title: 'High-impact segmentation', topic: focus };
    route = 'sprint';
  } else if (/examples?/.test(txt)) {
    reply = 'Examples: (1) Repeat buyers (90d), (2) Browsed-abandoners (14d), (3) High AOV customers. Start a sprint?';
    quick = ['Start sprint','Different idea'];
  } else if (/tweak|not sure|change goal/.test(txt)) {
    reply = 'No problem. Tell me your ideal 30-day outcome in one sentence.';
  } else if (/segment|no segmentation|do segment/.test(txt)) {
    reply = 'Based on that, I recommend a sprint: identify 2 segments you can act on this week.';
    quick = ['Start sprint','Show me examples','Different idea'];
  } else if (/different idea|alternative/.test(txt)) {
    reply = 'Two options: (A) Subject line A/B (2 variants). (B) Improve cart recovery flow. Which?';
    quick = ['Subject line test','Cart recovery'];
  } else if (/subject line/.test(txt)) {
    reply = 'Great — I’ll seed a “Subject line A/B” sprint.';
    sprintSeed = { title:'Subject line A/B test', topic: focus };
    route = 'sprint';
  } else if (/cart/.test(txt)) {
    reply = 'Cool — I’ll seed a “Cart recovery touch-up” sprint.';
    sprintSeed = { title:'Cart recovery touch-up', topic: focus };
    route = 'sprint';
  } else {
    reply = `Got it. Want me to start a quick 10-minute sprint for ${focus}?`;
    quick = ['Start sprint','Show me examples','Tweak'];
  }

  if (/example/.test(txt)) newMem.preferences = { ...(mem.preferences||{}), likesExamples:true };

  return res.status(200).json({ reply, quick, route, sprintSeed, mem: newMem });
}
