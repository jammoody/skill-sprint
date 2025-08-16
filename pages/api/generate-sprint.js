// pages/api/generate-sprint.js

/**
 * Generic, focus-driven KPI coaching.
 * - If KPIs exist for the user's focus, use them for benchmarking & experiments.
 * - If missing, suggest 3 KPIs to track (name + what/why/how).
 * - Follow-up returns immediate 10-minute steps using KPIs/goals when present.
 */

const REFLECTION_PROMPT =
  'What did you try (≤10 min)? What changed (number/observation)? What will you do tomorrow?';

// Safe JSON extractor (handles code fences / extra text)
const extractJSON = (text = '') => {
  const cleaned = (text || '').replace(/```(?:json)?/gi, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const s = cleaned.indexOf('{'); const e = cleaned.lastIndexOf('}');
  if (s !== -1 && e !== -1 && e > s) { try { return JSON.parse(cleaned.slice(s, e + 1)); } catch {} }
  return null;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { profile = {}, history = [], followup = null } = req.body || {};
  const passFromHeader = req.headers['x-ss-ai-passcode'] || '';
  const hasKey = !!process.env.OPENAI_API_KEY;
  const hasPassVar = !!process.env.SS_AI_PASSCODE;
  const passMatches = hasPassVar && String(passFromHeader) === String(process.env.SS_AI_PASSCODE);

  const kpis = profile.kpis || { categories: {} };
  const focusArr = Array.isArray(profile.focus) ? profile.focus : [];
  const primaryFocus = focusArr[0] || 'General';

  // -------- MOCK mode (AI off or pass mismatch) --------
  if (!hasKey || !passMatches) {
    if (followup && Array.isArray(followup.goals)) {
      return res.status(200).json({
        mode: 'mock',
        followupSteps: [
          'Block 10 minutes tomorrow for Goal #1.',
          'Write 3 success criteria for Goal #1 (numbers if possible).',
          'Message one customer/colleague to sanity-check Goal #1.'
        ]
      });
    }
    const hasKPIsForFocus = Boolean(kpis.categories?.[primaryFocus]);
    if (!hasKPIsForFocus) {
      return res.status(200).json({
        mode: 'mock',
        day: {
          title: `Pick KPIs for ${primaryFocus}`,
          knowledge:
            'Tracking the right numbers turns guesses into progress. Let’s choose 2–3 metrics to watch.',
          task: 'Add current & target for 2–3 KPIs (e.g., Open rate %, CTR %, Revenue %, CAC, CVR).',
          reflection: REFLECTION_PROMPT
        },
        tips: [
          'Prefer metrics you can measure weekly.',
          'Targets should be realistic in ~30–60 days.'
        ],
        kpiSuggestions: [
          { name: 'Open rate %', why: 'Gauge subject line/list quality.', how: 'ESP report.' },
          { name: 'Click-through %', why: 'Gauge content relevance.', how: 'ESP report.' },
          { name: 'Conversion %', why: 'Measures revenue impact.', how: 'Store analytics.' }
        ]
      });
    }
    return res.status(200).json({
      mode: 'mock',
      day: {
        title: `Tighten one lever in ${primaryFocus}`,
        knowledge:
          'Small, focused experiments compound. Pick one lever tied to a KPI and test a tiny change.',
        task: 'Design a 10-minute experiment that can shift one KPI by a small amount.',
        reflection: REFLECTION_PROMPT
      },
      tips: ['Change one thing at a time.', 'Write the expected KPI change before you test.']
    });
  }

  // -------- FOLLOW-UP: immediate next steps (after user saved goals) --------
  if (followup && Array.isArray(followup.goals)) {
    const goals = followup.goals.filter(Boolean).slice(0, 3);
    try {
      const sys = `You are Skill Sprint, a pragmatic micro-coach.
Return JSON ONLY in this schema:
{"followupSteps":["short actionable step","short actionable step","short actionable step"]}`;
      const user = `User focus: ${primaryFocus}
KPIs (by category): ${JSON.stringify(kpis)}
Recent history: ${JSON.stringify(history.slice(-5))}
Goals (30 days): ${JSON.stringify(goals)}
Rules:
- Each step must take <=10 minutes.
- Reference KPIs if relevant.
- Be concrete, not generic inspiration.`;

      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
          max_tokens: 300,
          temperature: 0.7
        })
      });
      const data = await resp.json();
      const parsed = extractJSON(data.choices?.[0]?.message?.content);
      if (parsed?.followupSteps) return res.status(200).json({ mode: 'ai', ...parsed });
    } catch (err) {
      console.error('Followup AI error', err);
    }
    return res.status(200).json({
      mode: 'fallback',
      followupSteps: [
        'Write a 10-minute mini-plan for Goal #1.',
        'Draft a baseline number for one KPI.',
        'Share it with a teammate for feedback.'
      ]
    });
  }

  // -------- MAIN SPRINT GENERATION --------
  try {
    const sys = `You are Skill Sprint, a pragmatic micro-coach.
Return JSON ONLY in this schema:
{"day":{"title":"string","knowledge":"string","task":"string","reflection":"string"},"tips":["tip1","tip2"],"kpiSuggestions":[{"name":"string","why":"string","how":"string"}]}`;
    const user = `User focus: ${primaryFocus}
KPIs (by category): ${JSON.stringify(kpis)}
Recent history: ${JSON.stringify(history.slice(-5))}
Rules:
- If KPIs exist for the focus, design a sprint tied to moving them.
- If KPIs missing, suggest 3 relevant ones (with name/why/how).
- Keep language short, friendly, and specific.`;

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
        max_tokens: 500,
        temperature: 0.7
      })
    });
    const data = await resp.json();
    const parsed = extractJSON(data.choices?.[0]?.message?.content);
    if (parsed?.day) return res.status(200).json({ mode: 'ai', ...parsed });
  } catch (err) {
    console.error('Sprint AI error', err);
  }

  // -------- LAST RESORT --------
  return res.status(200).json({
    mode: 'fallback',
    day: {
      title: `Experiment in ${primaryFocus}`,
      knowledge:
        'When you lack data, run small experiments. Each experiment should test one assumption.',
      task: 'Design a 10-min test and write the hypothesis + expected change.',
      reflection: REFLECTION_PROMPT
    },
    tips: ['Start small, then scale.', 'Track a number before and after.']
  });
}
