const GAP=10,MARGIN=10;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

// Keep the right-side opening above its launcher on shorter desktop viewports.
export function heightNearLauncher(launcher,preferredHeight,viewport){
  const above=Math.floor(launcher.top-GAP-MARGIN);
  return viewport.width>700&&launcher.left>=viewport.width/2&&above>=360
    ?Math.min(preferredHeight,above):preferredHeight;
}

export function positionNearLauncher(launcher,size,viewport){
  const maxX=viewport.width-size.width-MARGIN,maxY=viewport.height-size.height-MARGIN;
  const centerX=(launcher.left+launcher.right)/2,centerY=(launcher.top+launcher.bottom)/2;
  // Prefer the launcher below the panel's left corner; shift only to fit the viewport.
  const x=clamp(launcher.left,MARGIN,maxX),y=clamp(centerY-size.height/2,MARGIN,maxY);
  const candidates=[
    {left:x,top:launcher.top-size.height-GAP},
    {left:x,top:launcher.bottom+GAP},
    {left:launcher.right+GAP,top:y},
    {left:launcher.left-size.width-GAP,top:y},
  ];
  let result=candidates.find(point=>point.left>=MARGIN&&point.left<=maxX&&point.top>=MARGIN&&point.top<=maxY);
  if(!result){
    const ranked=candidates.map((point,index)=>{
      const left=clamp(point.left,MARGIN,maxX),top=clamp(point.top,MARGIN,maxY);
      const right=left+size.width,bottom=top+size.height;
      const overlap=Math.max(0,Math.min(right,launcher.right)-Math.max(left,launcher.left))*Math.max(0,Math.min(bottom,launcher.bottom)-Math.max(top,launcher.top));
      const dx=Math.max(0,launcher.left-right,left-launcher.right),dy=Math.max(0,launcher.top-bottom,top-launcher.bottom);
      return{left,top,overlap,distance:dx*dx+dy*dy,index};
    });
    ranked.sort((a,b)=>a.overlap-b.overlap||a.distance-b.distance||a.index-b.index);
    result=ranked[0];
  }
  return{left:result.left,top:result.top,originX:clamp(centerX-result.left,0,size.width),originY:clamp(centerY-result.top,0,size.height)};
}
