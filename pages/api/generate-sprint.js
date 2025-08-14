// pages/api/generate-sprint.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { profile = {}, history = [] } = req.body || {};
  const passFromHeader = req.headers['x-ss-ai-passcode'] || '';
  const hasAIAccess =
    process.env.OPENAI_API_KEY &&
    process.env.SS_AI_PASSCODE &&
    String(passFromHeader) === String(process.env.SS_AI_PASSCODE);

  // Free/mock mode for everyone else
  if (!hasAIAccess) {
    return res.status(200).json({
      mode: 'mock',
      day: {
        title: 'Value Proposition Sprint',
        knowledge: 'A clear value prop tells who you help, the outcome, and why you are different.',
        task: 'Write your one-sentence value proposition and ask 1 customer if it’s clear.',
        reflection: 'Did they understand it immediately?'
      },
      tips: ['Keep it under 20 words.', 'Outcome > features.']
    });
  }

  // Helper: safely extract JSON from messy model output
  const extractJSON = (text = '') => {
    // Remove code fences if present
    const cleaned = text.replace(/```(?:json)?/gi, '').trim();
    // Try direct parse first
    try { return JSON.parse(cleaned); } catch {}
    // Fallback: grab first {...} block
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      const maybe = cleaned.slice(start, end + 1);
      try { return JSON.parse(maybe); } catch {}
    }
    return null;
  };

  try {
    const sys = `You are Skill Sprint, a business micro-coach.
Return JSON ONLY in this exact schema (no extra text, no markdown, no explanations):
{"day":{"title":"","knowledge":"2-3 sentences","task":"1 actionable task","reflection":""},"tips":["",""]}`;

    const user = `PROFILE: ${JSON.stringify(profile)}
RECENT: ${JSON.stringify(history.slice(-5))}
TIME PER DAY: ${profile?.time || '5'} minutes
FOCUS: ${(profile?.focus || []).join(', ') || 'General'}
ROLE: ${profile?.role || 'Unknown'}
CHALLENGE: ${profile?.challenge || '—'}`;

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
      // Surface a friendly reason to the client (no secrets leaked)
      return res.status(200).json({
        mode: 'ai',
        error: `OpenAI HTTP ${r.status}`,
        detail: data?.error?.message || 'Unknown error from model',
        // Safe fallback so the page still works
        day: {
          title: 'Value Proposition Sprint',
          knowledge: 'Fallback due to AI error.',
          task: 'Write your one-sentence value proposition.',
          reflection: 'Would a stranger “get it” in 10 seconds?'
        },
        tips: ['Short and specific.', 'Outcome > features.']
      });
    }

    const raw = data?.choices?.[0]?.message?.content || '';
    const parsed = extractJSON(raw);

    if (!parsed?.day?.title) {
      return res.status(200).json({
        mode: 'ai',
        error: 'Bad JSON from model',
        raw, // helpful for debugging; safe to show
        day: {
          title: 'Value Proposition Sprint',
          knowledge: 'Fallback due to JSON parse.',
          task: 'Write your one-sentence value proposition.',
          reflection: 'Would a stranger “get it” in 10 seconds?'
        },
        tips: ['Short and specific.', 'Outcome > features.']
      });
    }

    return res.status(200).json({ mode: 'ai', ...parsed });
  } catch (e) {
    return res.status(200).json({
      mode: 'ai',
      error: 'Exception',
      detail: e?.message || String(e),
      day: {
        title: 'Value Proposition Sprint',
        knowledge: 'Fallback due to AI exception.',
        task: 'Write your one-sentence value proposition.',
        reflection: 'Would a stranger “get it” in 10 seconds?'
      },
      tips: ['Short and specific.', 'Outcome > features.']
    });
  }
}
