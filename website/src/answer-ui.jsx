import React, {useEffect, useId, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {JSONGenerativeUI, renderGenerativeUI} from '@assistant-ui/react-generative-ui';
import {schemas, validateUI} from './ui-schema.js';
import {Diagram, FlowGraph} from './structured-visuals.jsx';

// Chart and DataTable adapt assistant-ui Elements (MIT; public/licenses/assistant-ui.txt).
function Chart({title, unit, data, variant: initial, source, seriesLabels}) {
  const [variant,setVariant] = useState(initial);
  const [count,setCount] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches ? data.length : 1);
  const id = useId().replaceAll(':','');
  useEffect(() => { if (count >= data.length) return; const timer = setTimeout(() => setCount(n=>n+1),180); return () => clearTimeout(timer); }, [count,data.length]);
  const paired=data.some(p=>p.highValue!==undefined);
  const series=paired?[{key:'value',label:seriesLabels?.[0]||'Lower estimate',color:'var(--ochre)'},{key:'highValue',label:seriesLabels?.[1]||'Upper estimate',color:'var(--sage)'}]:[{key:'value',label:unit,color:'var(--ochre)'}];
  const max = Math.max(1,...data.flatMap(p=>[p.value,p.highValue??p.value])); const min = Math.min(0,...data.flatMap(p=>[p.value,p.highValue??p.value]));
  const number=v=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2,...(unit.startsWith('USD')?{style:'currency',currency:'USD'}:{})}).format(v);
  const x = i => 48 + i * 414 / Math.max(1,data.length-1);
  const y = v => 152 - (v-min)/(max-min)*122;
  const visible = data.slice(0,count),last=data.at(-1);
  return <section className="answer-chart" data-slot="chart" aria-label={title}>
    <div className="answer-block-header"><h4>{title}</h4><div className="chart-variants" role="group" aria-label="Chart style">{['area','line','bars'].map(v=><button key={v} aria-pressed={v===variant} onClick={()=>setVariant(v)}>{v}</button>)}</div></div>
    <div className="chart-metric">{last?`${number(last.value)}${paired?'–'+number(last.highValue??last.value):''}`:'—'} <span>{unit} · {last?.label||'last point'}{paired?' questions':''}</span></div>
    {paired&&<div className="chart-legend">{series.map(s=><span key={s.key}><i style={{background:s.color}}/>{s.label}</span>)}</div>}
    {data.length ? <svg className="data-chart" viewBox="0 0 510 200" role="img" aria-label={`${title}: ${data.map(d=>`${d.label}: ${number(d.value)}${paired?'–'+number(d.highValue??d.value):''}`).join(', ')}`}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--ochre)" stopOpacity=".18"/><stop offset="100%" stopColor="var(--ochre)" stopOpacity=".02"/></linearGradient></defs>
      {[0,.5,1].map(t=><g key={t}><line x1="48" x2="482" y1={152-t*122} y2={152-t*122} stroke="var(--rule)"/><text x="40" y={156-t*122} textAnchor="end">{number(min+(max-min)*t)}</text></g>)}
      {series.map((s,si)=>{const path=visible.map((p,i)=>`${i?'L':'M'}${x(i)},${y(p[s.key]??p.value)}`).join(' ');return <g key={s.key}>
        {variant==='area'&&visible.length>0&&<path d={`${path} L${x(visible.length-1)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#${id})`} stroke="none"/>}
        {variant!=='bars'&&<path d={path} fill="none" style={{stroke:s.color}} strokeWidth="2" strokeDasharray={si?'5 3':undefined}/>}
        {visible.map((p,i)=>{const value=p[s.key]??p.value,barWidth=Math.min(18,160/data.length);return variant==='bars'?<rect key={i} x={x(i)+(paired?(si-1)*barWidth:-barWidth/2)} y={Math.min(y(0),y(value))} width={barWidth} height={Math.max(1,Math.abs(y(0)-y(value)))} rx="2" style={{fill:s.color}}><title>{p.label}: {number(value)} · {s.label}</title></rect>:<circle key={i} cx={x(i)} cy={y(value)} r="3" style={{fill:s.color}}><title>{p.label}: {number(value)} · {s.label}</title></circle>;})}
      </g>;})}
      {data.map((p,i)=> (data.length<9 || i===0 || i===data.length-1) && <text key={i} x={x(i)} y="176" textAnchor="middle">{p.label.slice(0,14)}</text>)}
    </svg> : <p>No data points returned.</p>}
    <div className="chart-footer"><span>{source}</span><button aria-label="Replay chart" onClick={()=>setCount(matchMedia('(prefers-reduced-motion: reduce)').matches?data.length:1)}>Replay ↻</button></div>
    <details className="chart-data"><summary>View chart values</summary><dl>{data.map((p,i)=><div key={i}><dt>{p.label}</dt><dd>{number(p.value)}{paired?'–'+number(p.highValue??p.value):''} {unit}</dd></div>)}</dl></details>
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
  return <section className="answer-table" data-slot="data-table">
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
  Diagram: props=><Diagram {...props}/>,
  FlowGraph: props=><FlowGraph {...props}/>,
  DataTable: props=><DataTable {...props}/>,
  Source: ({title,url})=><a className="answer-source" href={url} target="_blank" rel="noopener noreferrer"><span>Source</span>{title} ↗</a>,
};
export const library = Object.fromEntries(Object.entries(schemas).map(([name,properties])=>[name,{description:`Render the reviewed ${name} component. Use factual source-grounded data only.`,properties,render:renderers[name]}]));
// Ready for the existing bot runtime: expose this present tool in its toolkit.
export function createResearchPresentTool() { return new JSONGenerativeUI({library}).present(); }
const roots = new Set();
export function clearAnswerRoots() { for (const root of roots) root.unmount(); roots.clear(); }
function AnswerSurface({valid,onRendered}) {
  useEffect(()=>{onRendered?.();},[onRendered]);
  return <div className="answer-ui">{renderGenerativeUI(valid,library)}</div>;
}
export function mountAnswer(container, tree, {onRendered}={}) {
  try { const valid=validateUI(tree); const root=createRoot(container);roots.add(root);root.render(<AnswerSurface valid={valid} onRendered={onRendered}/>); }
  catch { container.textContent='This structured answer could not be displayed. Its data did not match the supported component schema.';container.setAttribute('role','alert'); }
}
