// pages/api/generate-sprint.js
import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { profile = {}, history = [] } = req.body || {};
  const passFromHeader = req.headers['x-ss-ai-passcode'] || '';
  const hasAIAccess =
    process.env.OPENAI_API_KEY &&
    process.env.SS_AI_PASSCODE &&
    String(passFromHeader) === String(process.env.SS_AI_PASSCODE);

  // If AI not allowed or no key → return MOCK so the app stays free for everyone else
  if (!hasAIAccess) {
    return res.status(200).json({
      day: {
        title: 'Value Proposition Sprint',
        knowledge: 'A clear value prop tells who you help, the outcome, and why you are different.',
        task: 'Write your one-sentence value proposition and ask 1 customer if it’s clear.',
        reflection: 'Did they understand it immediately?'
      },
      tips: ['Keep it under 20 words.', 'Outcome > features.']
    });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const sys = `You are Skill Sprint, a business micro-coach.
Return JSON ONLY in this exact schema:
{"day":{"title":"","knowledge":"2-3 sentences","task":"1 actionable task","reflection":""},"tips":["",""]}`;

    const user = `PROFILE: ${JSON.stringify(profile)}
RECENT: ${JSON.stringify(history.slice(-5))}
TIME PER DAY: ${profile?.time || '5'} minutes
FOCUS: ${(profile?.focus || []).join(', ') || 'General'}
ROLE: ${profile?.role || 'Unknown'}
CHALLENGE: ${profile?.challenge || '—'}`;

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 500,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: user }
      ]
    });

    let parsed;
    try {
      parsed = JSON.parse(resp.choices?.[0]?.message?.content || '{}');
    } catch {
      parsed = null;
    }

    if (!parsed?.day?.title) throw new Error('Bad JSON from model');

    return res.status(200).json(parsed);
  } catch (e) {
    console.error('AI error:', e?.message || e);
    // Safe fallback to mock
    return res.status(200).json({
      day: {
        title: 'Value Proposition Sprint',
        knowledge: 'Fallback due to AI error.',
        task: 'Write your one-sentence value proposition.',
        reflection: 'Would a stranger “get it” in 10 seconds?'
      },
      tips: ['Short and specific.', 'Outcome > features.']
    });
  }
}
