// lib/store.js
export const lsGet = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch { return f; } };
export const lsSet = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export const getProfile = () => lsGet('ss_profile', null);
export const setProfile = (p) => lsSet('ss_profile', p);

export const getKPIs = () => {
  const k = lsGet('ss_kpis', { categories:{} });
  return k && k.categories ? k : { categories:{} };
};
export const setKPIs = (k) => lsSet('ss_kpis', k);

// Threads = conversational sprints
export const getThreads = () => lsGet('ss_threads', []);
export const setThreads = (arr) => lsSet('ss_threads', arr);
export const getActiveThreadId = () => lsGet('ss_active_thread_id', null);
export const setActiveThreadId = (id) => lsSet('ss_active_thread_id', id);

export const createThread = (seed = {}) => {
  const id = `thr_${Date.now().toString(36)}${Math.random().toString(36).slice(2,5)}`;
  const t = {
    id,
    title: seed.title || 'New sprint',
    topic: seed.topic || (getProfile()?.focus?.[0] || 'General'),
    timebox: seed.timebox || 10,
    status: 'active',
    createdAt: new Date().toISOString(),
    messages: seed.messages || []
  };
  const all = getThreads(); all.push(t); setThreads(all); setActiveThreadId(id); return t;
};

export const getThreadById = (id) => getThreads().find(t => t.id === id) || null;

export const updateThread = (id, patch = {}) => {
  const all = getThreads().map(t => t.id === id
    ? ({ ...t, ...patch, messages: patch.messages ? patch.messages : t.messages })
    : t
  );
  setThreads(all); return all.find(t => t.id === id) || null;
};

export const appendThreadMessage = (id, msg) => {
  const all = getThreads();
  const idx = all.findIndex(t => t.id === id);
  if (idx === -1) return null;
  const thread = all[idx];
  thread.messages = [...(thread.messages||[]), { ...msg, ts: Date.now() }];
  all[idx] = thread; setThreads(all);
  return thread;
};

export const setThreadStatus = (id, status) => updateThread(id, { status });
export const setThreadTimebox = (id, minutes) => updateThread(id, { timebox: minutes });
