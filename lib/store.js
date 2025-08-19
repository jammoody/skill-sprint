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

export const getHistory = () => lsGet('ss_history', []);
export const appendHistory = (e) => { const h=getHistory(); h.push(e); lsSet('ss_history', h); return h; };

export const getChat = () => lsGet('ss_chat', []);
export const setChat = (a) => lsSet('ss_chat', a);

export const getCoachMem = () => lsGet('ss_coach_mem', { preferences:{}, themes:[], last:'' });
export const setCoachMem = (m) => lsSet('ss_coach_mem', m);
