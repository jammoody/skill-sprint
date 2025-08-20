// lib/store.js
// LocalStorage helpers
export const lsGet = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };
export const lsSet = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// Profile + KPIs + onboarding marker
export const getProfile = () => lsGet('ss_profile', null);
export const setProfile = (p) => lsSet('ss_profile', p);
export const getOnboardedAt = () => lsGet('ss_onboarded_at', null);
export const setOnboardedAt = (ts = Date.now()) => lsSet('ss_onboarded_at', ts);

export const getKPIs = () => {
  const k = lsGet('ss_kpis', { categories:{} });
  return k && k.categories ? k : { categories:{} };
};
export const setKPIs = (k) => lsSet('ss_kpis', k);

// Threads (coach chats / sprints)
export const getThreads = () => lsGet('ss_threads', []);
export const setThreads = (arr) => lsSet('ss_threads', arr);
export const getActiveThreadId = () => lsGet('ss_active_thread_id', null);
export const setActiveThreadId = (id) => lsSet('ss_active_thread_id', id);

const newId = () => `thr_${Date.now().toString(36)}${Math.random().toString(36).slice(2,5)}`;

export const createThread = (seed = {}) => {
  const id = newId();
  const t = {
    id,
    title: seed.title || 'New sprint',
    topic: seed.topic || (getProfile()?.focus?.[0] || 'General'),
    timebox: seed.timebox || 10,
    status: 'active', // active | done | archived
    summary: seed.summary || null,
    createdAt: new Date().toISOString(),
    messages: seed.messages || []
  };
  const all = getThreads(); all.push(t); setThreads(all); setActiveThreadId(id);
  return t;
};
export const getThreadById = (id) => getThreads().find(t => t.id === id) || null;
export const updateThread = (id, patch = {}) => {
  const all = getThreads().map(t => t.id === id
    ? ({ ...t, ...patch, messages: patch.messages ? patch.messages : t.messages })
    : t
  );
  setThreads(all);
  return all.find(t => t.id === id) || null;
};
export const appendThreadMessage = (id, msg) => {
  const all = getThreads();
  const idx = all.findIndex(t => t.id === id);
  if (idx === -1) return null;
  const thread = all[idx];
  thread.messages = [...(thread.messages||[]), { ...msg, ts: msg.ts || Date.now() }];
  all[idx] = thread; setThreads(all);
  return thread;
};
export const setThreadStatus = (id, status) => updateThread(id, { status });
export const setThreadTimebox = (id, minutes) => updateThread(id, { timebox: minutes });
export const setThreadSummary = (id, summary) => updateThread(id, { summary });

export const ensureGeneralThread = () => {
  const all = getThreads();
  let gen = all.find(t => t.title === 'General coaching');
  if (!gen) {
    gen = createThread({
      title: 'General coaching',
      topic: getProfile()?.focus?.[0] || 'General',
      messages: [{ from:'coach', text:'Welcome to General Coaching. Ask anything or start a sprint.' }]
    });
  }
  return gen;
};
export const searchThreads = (q = '') => {
  const term = q.trim().toLowerCase();
  if (!term) return getThreads();
  return getThreads().filter(t =>
    (t.title || '').toLowerCase().includes(term) ||
    (t.messages || []).some(m => (m.text || '').toLowerCase().includes(term))
  );
};

// ===== Daily sprint storage =====
const todayKey = (d = new Date()) => d.toISOString().slice(0,10); // YYYY-MM-DD
export const getDailySprints = () => lsGet('ss_daily_sprints', {}); // { 'YYYY-MM-DD': {title, steps[], status} }
export const setDailySprints = (obj) => lsSet('ss_daily_sprints', obj);
export const getDailySprint = (dateStr = todayKey()) => getDailySprints()[dateStr] || null;
export const saveDailySprint = (dateStr, sprint) => {
  const all = getDailySprints(); all[dateStr] = sprint; setDailySprints(all); return sprint;
};

// Basic mock/seed sprint if none exists yet
export const getOrCreateTodaySprint = () => {
  const key = todayKey();
  const existing = getDailySprint(key);
  if (existing) return existing;

  const p = getProfile() || {};
  const focus = p.focus?.[0] || 'General';
  const goal = (p.goals30d && p.goals30d[0]) || p.goal30d || 'Make visible progress';

  const seed = {
    title: `Quick win in ${focus}`,
    goal,
    status: 'pending', // pending | in-progress | done
    learning: [
      'Principle: change one variable at a time.',
      'Tie experiments to a KPI you can measure this week.'
    ],
    quiz: [
      { q:'What KPI will this affect?', a:'' },
      { q:'What “one variable” will you change?', a:'' }
    ],
    test: 'Draft one concrete experiment you can do in ≤10 minutes.',
    real: 'Ship the experiment to a small, safe audience and measure the delta vs baseline.'
  };
  return saveDailySprint(key, seed);
};

// Nudges generated from KPIs/goals (simple heuristic for now)
export const getDailyNudges = () => {
  const p = getProfile() || {};
  const kpis = getKPIs();
  const nudges = [];

  const goal = (p.goals30d && p.goals30d[0]) || '';
  if (/email/i.test(goal)) {
    nudges.push('Have you progressed your email list growth target this week? Need help?');
  }
  if (kpis.categories?.Ecommerce?.metrics?.['ROAS']) {
    nudges.push('ROAS is a focus. Want ideas to stabilise CPA or test new hooks?');
  }
  if (!nudges.length) nudges.push('What’s the most important thing you could move by 1% today?');

  return nudges;
};