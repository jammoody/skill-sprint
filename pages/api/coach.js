// pages/api/coach.js
// Simple rule-based coach that: (1) answers briefly, (2) links to /learn pages, (3) offers a sprint.

export default function handler(req, res){
  if (req.method !== 'POST') { res.setHeader('Allow','POST'); return res.status(405).json({error:'Method not allowed'}); }

  const { profile={}, user='', mem={} } = req.body || {};
  const focus = profile.focus?.[0] || 'General';
  const txt = (user||'').toLowerCase();

  let reply='', quick=[], route=null, sprintSeed=null, newMem={...mem}, learningLinks=[];

  const link = (topic, title)=> ({ href:`/learn?topic=${encodeURIComponent(topic)}`, title });

  // Lightweight intents
  const wantsExamples = /example|ideas?|suggest/i.test(txt);
  const wantsSegments = /segment|segmentation/i.test(txt);
  const wantsSprint = /start\s*sprint|do\s*a\s*sprint|make\s*a\s*sprint/i.test(txt);
  const greetings = /^(hi|hello|hey)\b/i.test(txt);
  const tweak = /tweak|change|not sure|edit goal/i.test(txt);

  if (greetings) {
    reply = `Hey! For ${focus}, we can work on quick wins or build a plan. Ask me anything or say “Start sprint”.`;
    quick = ['Start sprint','Show examples','What should I focus on?'];
    learningLinks = [link('getting-started','Coach guide: getting started')];
  }
  else if (wantsSegments) {
    reply = `Great question. Segments worth testing:\n• Repeat buyers (90d)\n• Browsed-abandoners (14d)\n• High AOV customers\nI can walk you through each, or we can start a 10-minute sprint to set them up.`;
    quick = ['Start sprint','Show examples','Different idea'];
    learningLinks = [link('email-segmentation','How to choose email segments')];
    sprintSeed = { title:'High-impact segmentation', topic: focus };
  }
  else if (wantsExamples) {
    reply = 'Here are a few examples you can copy: (1) Repeat buyers (90d), (2) Browsed-abandoners (14d), (3) High AOV customers. Want me to start a sprint?';
    quick = ['Start sprint','Different idea'];
    learningLinks = [link('email-segmentation-examples','Segment examples that work')];
    sprintSeed = { title:'High-impact segmentation', topic: focus };
  }
  else if (wantsSprint) {
    reply = 'Nice — seeding a 10-minute sprint.';
    sprintSeed = { title:'High-impact segmentation', topic: focus };
    route = 'sprint';
  }
  else if (tweak) {
    reply = 'Tell me your ideal 30-day outcome in one sentence (include a number if possible).';
    quick = ['More leads','Higher conversion','Ship faster','Reduce churn'];
  }
  else {
    reply = `Got it. I can answer briefly and link a guide, or turn this into a sprint. What would you prefer?`;
    quick = ['Answer briefly','Start sprint','Show resources'];
    learningLinks = [link('focus-ideas',`What to focus on in ${focus}`)];
  }

  if (/example/.test(txt)) newMem.preferences = { ...(mem.preferences||{}), likesExamples:true };

  return res.status(200).json({ reply, quick, route, sprintSeed, mem: newMem, learningLinks });
}
