// Adapted from assistant-ui Elements Diagram and FlowGraph (MIT).
// https://github.com/assistant-ui/assistant-ui/tree/main/packages/ui/src/components/react/assistant-ui/elements
// Copyright (c) 2026 AgentbaseAI Inc.; see public/licenses/assistant-ui.txt.
import React, {useRef, useState} from 'react';
import {IntegrationIcon} from './integration-icons.jsx';

function IntegrationSteps({steps}) {
  const wrap=text=>text.split(' ').reduce((lines,word)=>{const last=lines.at(-1);if(last&&last.length+word.length<43)lines[lines.length-1]+=' '+word;else lines.push(word);return lines;},[]);
  return <svg className="integration-graphic" viewBox={`0 0 420 ${steps.length*104}`} role="img" aria-label={steps.map((s,i)=>`${i+1}. ${s.title}: ${s.detail}`).join('; ')}>{steps.map((step,index)=><g key={index}>
    {index>0&&<path d={`M210,${index*104-18} v18 m-4,-5 4,5 4,-5`} fill="none" stroke="var(--ochre)" strokeWidth="1.5"/>}
    <rect x="10" y={index*104+4} width="400" height="82" rx="12" fill="var(--paper)" stroke="var(--rule)"/>
    <circle cx="35" cy={index*104+29} r="16" fill="var(--ochre)" fillOpacity=".14"/>
    <g data-integration-icon={step.icon}>{step.icon?<IntegrationIcon kind={step.icon} x="24" y={index*104+18} width="22" height="22" style={{color:'var(--ochre)'}}/>:<text x="35" y={index*104+33} textAnchor="middle" fill="var(--ink-2)" fontSize="12">{index+1}</text>}</g>
    <text x="58" y={index*104+33} fill="var(--ink)" fontSize="14" fontWeight="500">{step.title}</text>
    <text x="58" y={index*104+54} fill="var(--ink-2)" fontSize="12">{wrap(step.detail).map((line,i)=><tspan key={i} x="58" dy={i?16:0}>{line}</tspan>)}</text>
  </g>)}</svg>;
}
export function Diagram({title,steps,source}) {
  const [zoom,setZoom]=useState(1);
  const dialog=useRef(null);
  const graphic=()=> <div className="diagram-canvas" style={{width:`${zoom*100}%`}}><IntegrationSteps steps={steps}/></div>;
  return <section className="answer-diagram" data-slot="diagram" aria-label={title}>
    <div className="answer-block-header"><h4>{title}</h4><div className="diagram-controls"><span aria-live="polite">{Math.round(zoom*100)}%</span><button type="button" aria-label="Zoom out" disabled={zoom<=.6} onClick={()=>setZoom(z=>Math.max(.6,z-.2))}>−</button><button type="button" aria-label="Zoom in" disabled={zoom>=2} onClick={()=>setZoom(z=>Math.min(2,z+.2))}>+</button><button type="button" aria-label="Reset the view" onClick={()=>setZoom(1)}>↺</button><button type="button" aria-label="Open diagram full screen" onClick={()=>dialog.current.showModal()}>⛶</button></div></div>
    <div className="diagram-viewport" tabIndex="0" role="region" aria-label={`${title} · scroll to explore`}>{graphic()}</div>
    <p className="data-provenance">{source}</p>
    <dialog ref={dialog} className="diagram-dialog" aria-label={title}><div className="answer-block-header"><h4>{title}</h4><button type="button" aria-label="Close diagram full screen" onClick={()=>dialog.current.close()}>Close ×</button></div>{graphic()}<p className="data-provenance">{source}</p></dialog>
  </section>;
}
export function FlowGraph({title,nodes,edges,source}) {
  const colWidth=126,rowHeight=66,nodeWidth=108,nodeHeight=42;
  const width=Math.max(...nodes.map(n=>n.column))*colWidth+nodeWidth;
  const height=Math.max(...nodes.map(n=>n.row))*rowHeight+nodeHeight;
  const byId=new Map(nodes.map(n=>[n.id,n]));
  return <section className="answer-flow" data-slot="flow-graph" aria-label={title}>
    <div className="answer-block-header"><h4>{title}</h4></div>
    <div className="flow-viewport" tabIndex="0" role="region" aria-label={`${title} · scroll to explore`}>
      <div className="flow-canvas" style={{width,height}} dir="ltr"><svg width={width} height={height} aria-hidden="true">{edges.map(({from,to})=>{
        const a=byId.get(from),b=byId.get(to);const x1=a.column*colWidth+nodeWidth,y1=a.row*rowHeight+nodeHeight/2,x2=b.column*colWidth,y2=b.row*rowHeight+nodeHeight/2;
        return <path key={`${from}-${to}`} d={`M${x1},${y1} C${(x1+x2)/2},${y1} ${(x1+x2)/2},${y2} ${x2},${y2}`} fill="none"/>;
      })}</svg>{nodes.map(node=><div key={node.id} className={`flow-node flow-node--${node.state}`} style={{left:node.column*colWidth,top:node.row*rowHeight,width:nodeWidth,height:nodeHeight}}>{node.icon?<IntegrationIcon kind={node.icon}/>:null}<span>{node.label}</span></div>)}</div>
    </div>
    <ul className="sr-only">{edges.map(edge=><li key={`${edge.from}-${edge.to}`}>{byId.get(edge.from).label} → {byId.get(edge.to).label}</li>)}</ul>
    <p className="data-provenance">{source}</p>
  </section>;
}
