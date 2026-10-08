import React, {useEffect, useId, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {JSONGenerativeUI, renderGenerativeUI} from '@assistant-ui/react-generative-ui';
import {schemas, validateUI} from './ui-schema.js';

function Chart({title, unit, data, variant: initial, source}) {
  const [variant,setVariant] = useState(initial);
  const [count,setCount] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches ? data.length : 1);
  const id = useId().replaceAll(':','');
  useEffect(() => { if (count >= data.length) return; const timer = setTimeout(() => setCount(n=>n+1),180); return () => clearTimeout(timer); }, [count,data.length]);
  const max = Math.max(1,...data.map(p=>p.value)); const min = Math.min(0,...data.map(p=>p.value));
  const x = i => 42 + i * 430 / Math.max(1,data.length-1);
  const y = v => 152 - (v-min)/(max-min)*122;
  const visible = data.slice(0,count);
  const path = visible.map((p,i)=>`${i ? 'L':'M'}${x(i)},${y(p.value)}`).join(' ');
  return <section className="answer-chart" aria-label={title}>
    <div className="answer-block-header"><h4>{title}</h4><div className="chart-variants" aria-label="Chart style">{['area','line','bars'].map(v=><button key={v} aria-pressed={v===variant} onClick={()=>setVariant(v)}>{v}</button>)}</div></div>
    <div className="chart-metric">{data.at(-1)?.value.toLocaleString() ?? '—'} <span>{unit} · last point</span></div>
    {data.length ? <svg className="data-chart" viewBox="0 0 510 200" role="img" aria-label={`${title}: ${data.map(d=>`${d.label} ${d.value}`).join(', ')}`}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a8c8f5" stopOpacity=".18"/><stop offset="100%" stopColor="#a8c8f5" stopOpacity=".02"/></linearGradient></defs>
      {[0,.5,1].map(t=><g key={t}><line x1="42" x2="482" y1={152-t*122} y2={152-t*122} stroke="#e4dfd7"/><text x="32" y={156-t*122} textAnchor="end">{Math.round(min+(max-min)*t)}</text></g>)}
      {variant==='area' && visible.length>0 && <path d={`${path} L${x(visible.length-1)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#${id})`} stroke="none"/>}
      {variant!=='bars' && <path d={path} fill="none" stroke="#a8c8f5" strokeWidth="2"/>}
      {visible.map((p,i)=>variant==='bars' ? <rect key={i} x={x(i)-Math.min(16,150/data.length)} y={Math.min(y(0),y(p.value))} width={Math.min(32,300/data.length)} height={Math.max(1,Math.abs(y(0)-y(p.value)))} rx="2" fill={i===visible.length-1?'#a8c8f5':'#bd8c82'}><title>{p.label}: {p.value} {unit}</title></rect> : <circle key={i} cx={x(i)} cy={y(p.value)} r={i===visible.length-1?4:2.5} fill="#a8c8f5" stroke="#fdfcf9" strokeWidth="1"><title>{p.label}: {p.value} {unit}</title></circle>)}
      {data.map((p,i)=> (data.length<9 || i===0 || i===data.length-1) && <text key={i} x={x(i)} y="176" textAnchor="middle">{p.label.slice(0,14)}</text>)}
    </svg> : <p>No data points returned.</p>}
    <div className="chart-footer"><span>{source}</span><button aria-label="Replay chart" onClick={()=>setCount(matchMedia('(prefers-reduced-motion: reduce)').matches?data.length:1)}>Replay ↻</button></div>
    <details className="chart-data"><summary>View chart values</summary><dl>{data.map((p,i)=><div key={i}><dt>{p.label}</dt><dd>{p.value.toLocaleString()} {unit}</dd></div>)}</dl></details>
  </section>;
}
export function sortedRows(rows, sort) {
  if (!sort) return [...rows];
  return [...rows].sort((a,b)=> { const av=a[sort.key],bv=b[sort.key]; if(av==null)return bv==null?0:1; if(bv==null)return -1; const delta=typeof av==='number' && typeof bv==='number'?av-bv:String(av).localeCompare(String(bv), 'en', {numeric:true});return sort.direction==='asc'?delta:-delta; });
}
function format(value,kind) { if(value==null)return '—'; if(typeof value!=='number')return String(value); const opts=kind==='currency'?{style:'currency',currency:'USD'}:kind==='percent'?{style:'percent',maximumFractionDigits:1}:{};return new Intl.NumberFormat('en-US',opts).format(value); }
function DataTable({title, columns, rows, source}) {
  const [sort,setSort]=useState(null); const id=useId(); const ordered=sortedRows(rows,sort);
  const toggle=key=>setSort(s=>s?.key!==key?{key,direction:'asc'}:s.direction==='asc'?{key,direction:'desc'}:null);
  return <section className="answer-table">
    <div className="answer-block-header"><h4>{title}</h4><span>{rows.length} rows</span></div>
    <div className="compact-sort"><label htmlFor={id}>Sort by</label><select id={id} value={sort?`${sort.key}:${sort.direction}`:''} onChange={e=>{const [key,direction]=e.target.value.split(':');setSort(key?{key,direction}:null);}}><option value="">Original order</option>{columns.flatMap(c=>['asc','desc'].map(d=><option key={c.key+d} value={`${c.key}:${d}`}>{c.label} · {d==='asc'?'ascending':'descending'}</option>))}</select></div>
    <table><caption className="sr-only">{title}</caption><thead><tr>{columns.map(c=><th key={c.key} scope="col" aria-sort={sort?.key===c.key?(sort.direction==='asc'?'ascending':'descending'):undefined}><button onClick={()=>toggle(c.key)} aria-label={`Sort by ${c.label}`}>{c.label} <span aria-hidden="true">{sort?.key===c.key?(sort.direction==='asc'?'↑':'↓'):'↕'}</span></button></th>)}</tr></thead><tbody>{ordered.map((r,i)=><tr key={i}>{columns.map(c=><td key={c.key}>{format(r[c.key],c.format)}</td>)}</tr>)}</tbody></table>
    <div className="table-cards" role="list" aria-label={title}>{ordered.map((r,i)=><article key={i} role="listitem"><h5>{format(r[columns[0].key],columns[0].format)}</h5><dl>{columns.slice(1).map(c=><div key={c.key}><dt>{c.label}</dt><dd>{format(r[c.key],c.format)}</dd></div>)}</dl></article>)}</div>
    {!rows.length && <p role="status">No rows returned.</p>}
    <p className="data-provenance">{source}</p><p className="sr-only" aria-live="polite">{sort?`Sorted by ${columns.find(c=>c.key===sort.key)?.label}, ${sort.direction==='asc'?'ascending':'descending'}`:'Original order'}</p>
  </section>;
}
const renderers = {
  Card: ({title,children})=><section className="composed-card"><h3>{title}</h3>{children}</section>,
  Row: ({children})=><div className="answer-facts">{children}</div>,
  Text: ({text})=><p className="answer-text">{text}</p>,
  Fact: ({label,value,detail})=><div className="answer-fact"><span>{label}</span><b>{value}</b><small>{detail}</small></div>,
  Chart: props=><Chart {...props}/>,
  DataTable: props=><DataTable {...props}/>,
  Source: ({title,url})=><a className="answer-source" href={url} target="_blank" rel="noopener noreferrer"><span>Source</span>{title} ↗</a>,
};
export const library = Object.fromEntries(Object.entries(schemas).map(([name,properties])=>[name,{description:`Render the research ${name} component. Use factual source-grounded data only.`,properties,render:renderers[name]}]));
// Ready for the existing bot runtime: expose this present tool in its toolkit.
export function createResearchPresentTool() { return new JSONGenerativeUI({library}).present(); }
const roots = new Set();
export function clearAnswerRoots() { for (const root of roots) root.unmount(); roots.clear(); }
export function mountAnswer(container, tree) {
  try { const valid=validateUI(tree); const root=createRoot(container);roots.add(root);root.render(<div className="answer-ui">{renderGenerativeUI(valid,library)}</div>); }
  catch { container.textContent='This structured answer could not be displayed. Its data did not match the supported component schema.';container.setAttribute('role','alert'); }
}
