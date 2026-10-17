export function clampSidebarWidth(width,viewportWidth){
  const minimum=Math.min(280,viewportWidth*.25);
  const maximum=Math.max(minimum,viewportWidth-400);
  return Math.max(minimum,Math.min(maximum,width));
}
export const defaultSidebarRatio=.30;
