export function makeLauncherDraggable(launcher){
  let drag=null,position=null,movedByUser=false,suppressClick=false,clickTimer;
  function place(x,y){
    const rect=launcher.getBoundingClientRect();
    position={x:Math.max(8,Math.min(window.innerWidth-rect.width-8,x)),y:Math.max(8,Math.min(window.innerHeight-rect.height-8,y))};
    Object.assign(launcher.style,{left:`${position.x}px`,top:`${position.y}px`,bottom:'auto'});
  }
  launcher.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0)return;
    const rect=launcher.getBoundingClientRect();
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,left:rect.left,top:rect.top,moved:false};
    launcher.setPointerCapture(event.pointerId);
  });
  launcher.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.moved&&Math.hypot(dx,dy)<6)return;
    movedByUser=true;drag.moved=true;launcher.classList.add('is-dragging');
    place(drag.left+dx,drag.top+dy);
  });
  function finish(event){
    if(!drag||event.pointerId!==drag.id)return;
    suppressClick=drag.moved;drag=null;launcher.classList.remove('is-dragging');
    clearTimeout(clickTimer);clickTimer=setTimeout(()=>{suppressClick=false;},0);
  }
  for(const type of ['pointerup','pointercancel','lostpointercapture'])launcher.addEventListener(type,finish);
  launcher.addEventListener('click',event=>{
    if(!suppressClick||event.detail===0)return;
    event.preventDefault();event.stopImmediatePropagation();suppressClick=false;
  },true);
  launcher.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();movedByUser=true;const rect=launcher.getBoundingClientRect(),step=event.shiftKey?40:10;
    place(rect.left+(event.key==='ArrowRight'?step:event.key==='ArrowLeft'?-step:0),rect.top+(event.key==='ArrowDown'?step:event.key==='ArrowUp'?-step:0));
  });
  const keepInView=()=>{if(!drag){if(movedByUser)place(position.x,position.y);else place(window.innerWidth*.694,window.innerHeight*.73);}};
  keepInView();
  addEventListener('resize',keepInView);
  new ResizeObserver(keepInView).observe(launcher);
}
