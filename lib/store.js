// lib/store.js
export const lsGet = (k, f) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; }
  catch { return f; }
};
export const lsSet = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export const getProfile = () => lsGet('ss_profile', null);
export const setProfile = (p) => lsSet('ss_profile', p);

export
