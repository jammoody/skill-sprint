// pages/api/generate-sprint.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { profile = {}, history = [] } = req.body || {};
  const passFromHeader = req.headers['x-ss-ai-passcode'] || '';
  const hasKey = !!process.env.OPENAI_API_KEY;
  const hasPassVar = !!process.env.SS_AI_PASSCODE;
  const passMatches = hasPassVar && String(passFromHeader) === String(process.env.SS_AI_PASSCODE);

  // Free/mock mode for everyone else
  if (!hasKey || !passMatches) {
    return res.status(200).json({
      mode: 'mock',
      note: !hasKey ? 'Missing OPENAI_API_KEY in Vercel env' : (!passMatches ? 'Passcode mismatch' : ''),
      day: {
        title: 'Value Proposition Sprint',
        knowledge: 'A clear value prop tells who you help, the outcome, and why you are different.',
        task: 'Write your one-sentence value proposition and ask 1 customer if it’s clear.',
        reflection: 'Did they understand it immediately?'
      },
      tips: ['Keep it under 20 words.', 'Outcome > features.']
    });
  }

  // Helper: safely extract JSON from model output
  const extractJSON = (text = '') => {
    const cleaned = text.replace(/```(?:json)?/gi, '').trim();
    try { return JSON.parse(cleaned); } catch {}
    const s = cleaned.indexOf('{');
    const e = cleaned.lastIndexOf('}');
    if (s !== -1 && e !== -1 && e > s) {
      try { return JSON.parse(cleaned.slice(s, e + 1)); } catch {}
    }
    return null;
  };

  // Try a small list of models until one works for your account
  const modelsToTry = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];

  const sys = `You are Skill Sprint, a business micro-coach.
Return JSON ONLY in this exact schema (no extra text, no markdown, no explanations):
{"day":{"title":"","knowledge":"2-3 sentences","task":"1 actionable task","reflection":""},"tips":["",""]}`;

  const user = `PROFILE: ${JSON.stringify(profile)}
RECENT: ${JSON.stringify(history.slice(-5))}
TIME PER DAY: ${profile?.time || '5'} minutes
FOCUS: ${(profile?.focus || []).join(', ') || 'General'}
ROLE: ${profile?.role || 'Unknown'}
CHALLENGE: ${profile?.challenge || '—'}`;

  const errors = [];
  for (const model of modelsToTry) {
    try {
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          max_tokens: 500,
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: user }
          ]
        })
      });

      const data = await r.json();

      if (!r.ok) {
        errors.push({ model, http: r.status, message: data?.error?.message || 'Unknown error' });
        continue; // try next model
      }

      const raw = data?.choices?.[0]?.message?.content || '';
      const parsed = extractJSON(raw);

      if (parsed?.day?.title) {
        return res.status(200).json({ mode: 'ai', model, ...parsed });
      } else {
        errors.push({ model, http: 200, message: 'Bad JSON from model', raw: raw?.slice(0, 400) });
      }
    } catch (e) {
      errors.push({ model, http: 0, message: e?.message || String(e) });
    }
  }

  // If all models failed, return a friendly fallback with debug info
  return res.status(200).json({
    mode: 'ai',
    error: 'All model attempts failed',
    detail: errors,
    day: {
      title: 'Value Proposition Sprint',
      knowledge: 'Fallback due to AI error.',
      task: 'Write your one-sentence value proposition.',
      reflection: 'Would a stranger “get it” in 10 seconds?'
    },
    tips: ['Short and specific.', 'Outcome > features.']
  });
}
