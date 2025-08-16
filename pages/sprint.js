// pages/api/generate-sprint.js

// ---- Default "B — Do" steps (always shown; AI can add on top) ----
const DEFAULT_NEXT_STEPS = [
  // Marketing / traffic
  'Write 1 headline + 1 hook for your best post; schedule it for tomorrow.',
  'Find 2 relevant communities (subreddit/FB group); note the top 3 questions asked.',
  'Add a simple CTA to your last post (1 line, 1 link). Repost at a better time.',
  // Conversion / landing page
  'Add a one-sentence value prop above the fold: “We help [who] get [outcome] by [how].”',
  'Replace one vague benefit with a measurable one (number or deadline).',
  'Add 1 testimonial or proof point to the hero (stars, logo, or stat).',
  // Sales / e-commerce
  'Add a “Most Popular” badge to your best-selling product.',
  'Create a 10%-off first-order code; add it to hero + checkout.',
  'Draft a 2-line cart-abandon email: subject, one benefit, direct link.',
  // Team / productivity
  'Write a 3-bullet weekly priority for yourself; share it with 1 person.',
  'Turn one recurring task into a 5-bullet checklist template.',
  'Book a 15-minute “decision block” tomorrow for the stickiest item.'
];

// ---- Clear, goal-appropriate reflection prompt ----
const REFLECTION_PROMPT =
  'For each goal: Is it specific and measurable? What did you try today (10 min)? What will you do tomorrow?';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { profile = {}, history = [], followup = null } = req.body || {};
  const passFromHeader = req.headers['x-ss-ai-passcode'] || '';
  const hasKey = !!process.env.OPENAI_API_KEY;
  const hasPassVar = !!process.env.SS_AI_PASSCODE;
  const passMatches = hasPassVar && String(passFromHeader) === String(process.env.SS_AI_PASSCODE);

  // Base sprint copy (works for mock and fallback)
  const baseDay = {
    title: 'Set 3 Monthly Goals',
    knowledge:
      'Clear, realistic goals create focus. Keep each one specific, measurable, and achievable in ~30 days.',
    task: 'Write three specific goals for the next month (include a metric for each).',
    reflection: REFLECTION_PROMPT
  };
  const baseTips = [
    'Add a metric to each goal.',
    'Make the first step doable in 10 minutes.'
  ];

  // Helper: safely extract JSON from model output
  const extractJSON = (text = '') => {
    const cleaned = (text || '').replace(/```(?:json)?/gi, '').trim();
    try { return JSON.parse(cleaned); } catch {}
    const s = cleaned.indexOf('{');
    const e = cleaned.lastIndexOf('}');
    if (s !== -1 && e !== -1 && e > s) {
      try { return JSON.parse(cleaned.slice(s, e + 1)); } catch {}
    }
    return null;
  };

  // ---- MOCK mode if AI is off or passcode mismatch ----
  if (!hasKey || !passMatches) {
    // If this is a follow-up request (after saving goals), still return helpful steps
    if (followup && Array.isArray(followup.goals)) {
      return res.status(200).json({
        mode: 'mock',
        followupSteps: DEFAULT_NEXT_STEPS.slice(0, 5)
      });
    }
    return res.status(200).json({ mode: 'mock', day: baseDay, tips: baseTips });
  }

  // ---- FOLLOW-UP: After user saves goals, return specific next steps ----
  if (followup && Array.isArray(followup.goals)) {
    const goals = followup.goals.filter(Boolean).slice(0, 3);

    try {
      const sys = `You are Skill Sprint, a pragmatic micro-coach.
Return JSON ONLY:
{"followupSteps":["short actionable step","short actionable step","short actionable step"]}`;
      const user = `User profile: ${JSON.stringify(profile)}
Recent history: ${JSON.stringify(history.slice(-5))}
User goals (next 30 days): ${JSON.stringify(goals)}
Constraints: Each step must take <= 10 minutes; be specific; include a simple metric if relevant.`;

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0.3,
          max_tokens: 300,
          messages: [
            { role: 'system', content: sys },
            { role: 'user', content: user }
          ]
        })
      });

      const data = await r.json();
      const raw = data?.choices?.[0]?.message?.content || '';
      const parsed = extractJSON(raw);

      const aiSteps =
        parsed?.followupSteps && Array.isArray(parsed.followupSteps)
          ? parsed.followupSteps.filter(Boolean)
          : [];

      // Combine AI steps with defaults (no duplicates), keep 5 max
      const combined = [...aiSteps, ...DEFAULT_NEXT_STEPS].filter(Boolean);
      const unique = Array.from(new Set(combined)).slice(0, 5);

      return res.status(200).json({ mode: 'ai', followupSteps: unique });
    } catch {
      // On any error, still give useful defaults
      return res.status(200).json({
        mode: 'ai',
        followupSteps: DEFAULT_NEXT_STEPS.slice(0, 5)
      });
    }
  }

  // ---- DAILY SPRINT (AI) ----
  try {
    const sys = `You are Skill Sprint, a business micro-coach.
Return JSON ONLY in this schema:
{"day":{"title":"","knowledge":"2-3 sentences","task":"1 actionable task","reflection":""},"tips":["",""]}
Rules:
- Reflection must clearly relate to today’s task.
- Be concrete; prefer numbers, examples, or checklists.
- If user focus relates to goals, use "${REFLECTION_PROMPT}" as the reflection.`;

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
        temperature: 0.35,
        max_tokens: 500,
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: user }
        ]
      })
    });

    const data = await r.json();
    const raw = data?.choices?.[0]?.message?.content || '';
    const parsed = extractJSON(raw);

    // Guard rails: if model is messy, fall back to clear copy
    const day =
      parsed?.day && parsed.day.title
        ? {
            ...parsed.day,
            reflection: parsed.day.reflection || REFLECTION_PROMPT
          }
        : baseDay;

    const tips =
      Array.isArray(parsed?.tips) && parsed.tips.length ? parsed.tips : baseTips;

    return res.status(200).json({ mode: 'ai', day, tips });
  } catch {
    return res.status(200).json({ mode: 'ai', day: baseDay, tips: baseTips });
  }
}
