// pages/api/coach.js
export default async function handler(req,res){
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  const { profile = {}, user = '', last = [], mode = 'brief' } = req.body || {};
  const hasKey = !!process.env.OPENAI_API_KEY;

  // If you have an API key, use OpenAI; otherwise return a helpful mock.
  if (!hasKey){
    const brief = `**Quick tips**
1) **Segment better** – message-to-intent ↑ → CTR/CVR ↑
2) **Test one variable** – see what moved the KPI
3) **Tight CTA** – action words, one clear ask
4) **Personalise** – use behaviour or past purchases
5) **Measure** – baseline vs. delta this week`;
    return res.status(200).json({
      reply: brief.replace(/\*\*/g,''),
      quick: ['Answer briefly','Start sprint','Show resources'],
      learningLinks: [{title:'Subject line tips', href:'#'}, {title:'Segmentation basics', href:'#'}]
    });
  }

  // With key: short deterministic response
  try{
    const sys = `You are Skill Sprint, a pragmatic work coach. Be concise and actionable. Prefer 5 bullets with bolded leads.`;
    const prompt = `${mode==='resources'
      ? `Give 3 resource links (title + URL) for: ${user}`
      : `Answer briefly (5 bullets with bolded leads): ${user}`
    }`;
    const r = await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",
      headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{role:"system",content:sys},{role:"user",content:prompt}],
        temperature: 0.3
      })
    });
    const j = await r.json();
    const text = j.choices?.[0]?.message?.content || 'Okay.';
    res.status(200).json({
      reply: text.replace(/\*\*/g,''),
      quick: ['Answer briefly','Start sprint','Show resources'],
      learningLinks: []
    });
  }catch(e){
    res.status(200).json({
      reply:'I can answer briefly, share a guide, or start a sprint. Which do you want?',
      quick:['Answer briefly','Start sprint','Show resources'],
      learningLinks:[]
    });
  }
}