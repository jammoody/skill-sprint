// pages/kpis.js
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Nav from '../components/Nav';
import { getKPIs, setKPIs } from '../lib/store';

export default function KPIs(){
  const [kpis,setKpisState]=useState({categories:{}});
  const [newCat,setNewCat]=useState('');
  const [row,setRow]=useState({name:'', unit:'%', current:'', target:''});

  useEffect(()=>{ setKpisState(getKPIs()); },[]);
  const save=()=>{ setKPIs(kpis); alert('KPIs saved'); };

  const addCat=()=>{
    const name=(newCat||'').trim(); if(!name) return;
    if(!kpis.categories[name]){
      setKpisState(prev=> ({...prev, categories:{...prev.categories, [name]:{metrics:{}}}}));
    }
    setNewCat('');
  };

  const addMetric=(cat)=>{
    const name=(row.name||'').trim(); if(!name) return;
    setKpisState(prev=>{
      const c=prev.categories[cat] || {metrics:{}};
      const metrics={...c.metrics, [name]:{
        unit: row.unit||'%',
        current: row.current===''?null:Number(row.current),
        target: row.target===''?null:Number(row.target)
      }};
      return {...prev, categories:{...prev.categories, [cat]:{metrics}}};
    });
    setRow({name:'',unit:'%',current:'',target:''});
  };

  const delMetric=(cat,metric)=>{
    setKpisState(prev=>{
      const c=prev.categories[cat]; if(!c) return prev;
      const metrics={...c.metrics}; delete metrics[metric];
      return {...prev, categories:{...prev.categories, [cat]:{metrics}}};
    });
  };

  const delCat=(cat)=>{
    setKpisState(prev=>{
      const nxt={...prev.categories}; delete nxt[cat];
      return {...prev, categories:nxt};
    });
  };

  const setField=(cat,metric,field,val)=>{
    setKpisState(prev=>{
      const c=prev.categories[cat]||{metrics:{}};
      const m={...(c.metrics[metric]||{})};
      m[field] = (field==='current'||field==='target') ? (val===''?null:Number(val)) : val;
      return {...prev, categories:{...prev.categories, [cat]:{metrics:{...c.metrics, [metric]:m}}}};
    });
  };

  return (
    <>
      <Nav active="kpis" />
      <main className="container">
        <section className="card" style={{marginTop:18}}>
          <div className="spaced">
            <b>KPIs</b>
            <button className="btn" onClick={save}>Save all</button>
          </div>
          <div className="spaced" style={{marginTop:12}}>
            <input className="input" placeholder="New category (e.g., Email, Ads, Sales, Ops)" value={newCat} onChange={e=>setNewCat(e.target.value)}/>
            <button className="btn" onClick={addCat}>Add category</button>
          </div>
        </section>

        {Object.keys(kpis.categories).length===0 && (
          <p className="help" style={{marginTop:12}}>No categories yet. Add one above to get started.</p>
        )}

        {Object.entries(kpis.categories).map(([cat,cobj])=>(
          <section key={cat} className="card" style={{marginTop:16}}>
            <div className="spaced">
              <b>{cat}</b>
              <button className="btn" onClick={()=>delCat(cat)}>Remove</button>
            </div>

            <div className="kpi-grid" style={{marginTop:10, fontSize:13, color:'var(--muted)'}}>
              <div>Metric</div><div>Unit</div><div>Current</div><div>Target</div><div></div>
            </div>

            {Object.entries(cobj.metrics||{}).map(([m,row])=>(
              <div key={m} className="kpi-row" style={{marginTop:8}}>
                <input className="input" value={m} readOnly />
                <input className="input" value={row.unit||''} onChange={e=>setField(cat,m,'unit',e.target.value)}/>
                <input className="input" type="number" value={row.current??''} onChange={e=>setField(cat,m,'current',e.target.value)}/>
                <input className="input" type="number" value={row.target??''} onChange={e=>setField(cat,m,'target',e.target.value)}/>
                <button className="btn" onClick={()=>delMetric(cat,m)}>Delete</button>
              </div>
            ))}

            <div className="kpi-row" style={{marginTop:12}}>
              <input className="input" placeholder="New metric (e.g., Open rate, CVR, AOV)" value={row.name} onChange={e=>setRow(v=>({...v,name:e.target.value}))}/>
              <input className="input" placeholder="% | # | £ | $" value={row.unit} onChange={e=>setRow(v=>({...v,unit:e.target.value}))}/>
              <input className="input" type="number" placeholder="Current" value={row.current} onChange={e=>setRow(v=>({...v,current:e.target.value}))}/>
              <input className="input" type="number" placeholder="Target" value={row.target} onChange={e=>setRow(v=>({...v,target:e.target.value}))}/>
              <button className="btn" onClick={()=>addMetric(cat)}>Add</button>
            </div>
          </section>
        ))}
      </main>
    </>
  );
}
