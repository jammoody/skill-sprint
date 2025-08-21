// pages/coach.js
import { useEffect, useRef, useState } from 'react';
import Nav from '../components/Nav';
import {
  getProfile, ensureGeneralThread, getThreadById,
  setActiveThreadId, appendThreadMessage, saveDailySprint
} from '../lib/store';

// tiny markdown -> HTML for **bold**
function mdBold(text=''){
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>');
}

export default function Coach(){
  const [profile,setProfile] = useState(null);
  const [input,setInput] = useState('');
  const [messages,setMessages] = useState([]);
  const [quick,setQuick] = useState(['Answer briefly','Start sprint','Show resources']);
  const scroller = useRef(null);

  useEffect(()=>{
    const p = getProfile();
    if (!p) { window.location.assign('/onboarding'); return; }
    setProfile(p);

    const gen = ensureGeneralThread();
    setActiveThreadId(gen.id);
    setMessages(getThreadById(gen.id)?.messages || []);
  },[]);

  useEffect(()=>{
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [messages]);

  function activeId(){
    try { return JSON.parse(localStorage.getItem('ss_active_thread_id')); }
    catch { return null; }
  }
  function addCoach(html){ const id=activeId(); appendThreadMessage(id,{from:'coach',html}); setMessages(getThreadById(id)?.messages||[]); }
  function addUser(text){ const id=activeId(); appendThreadMessage(id,{from:'me',text}); setMessages(getThreadById(id)?.messages||[]); }

  async function callAPI(text, mode='brief'){
    try{
      const res = await fetch('/api/coach',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ profile, user: text, last