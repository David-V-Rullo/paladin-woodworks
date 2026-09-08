import {z} from 'zod';
import {cabinetSchema,defaultCabinet,calculateCabinet} from './cabinet.ts';
import type {Part} from './woodworking';

// Defaults migrate existing version-1 single cabinets without changing their geometry.
export const runSchema=cabinetSchema.extend({
 additionalWidths:z.array(z.number().min(8).max(48)).max(5).default([]),
 mounting:z.enum(['wall','floor']).default('wall'),
 baseHeight:z.number().min(2).max(8).default(4),
 baseSetback:z.number().min(0).max(6).default(3),
 faceFrame:z.boolean().default(false),
 stile:z.number().min(.75).max(4).default(1.5),
 rail:z.number().min(.75).max(4).default(1.5),
 frameThickness:z.number().min(.5).max(1).default(.75),
 doors:z.enum(['none','inset','overlay']).default('none'),
 doorCount:z.enum(['1','2']).default('2'),
 doorThickness:z.number().min(.375).max(1).default(.75),
 reveal:z.number().min(.03125).max(.25).default(.125),
 overlay:z.number().min(.125).max(2).default(.5)
});
export type CabinetRun=z.infer<typeof runSchema>;
export const defaultRun=runSchema.parse(defaultCabinet);
export type Solid={id:string;x:number;y:number;z:number;w:number;d:number;h:number};
export function calculateRun(p:CabinetRun){
 const widths=[p.width,...p.additionalWidths],floor=p.mounting==='floor',base=floor?p.baseHeight:0;
 const parts:Part[]=[],solids:Solid[]=[],errors:string[]=[];
 const add=(id:string,x:number,y:number,z:number,w:number,d:number,h:number)=>{if(w>0&&d>0&&h>0)solids.push({id,x,y,z,w,d,h});};
 let offset=0;
 const cabinets=widths.map((width,index)=>{
  const a=calculateCabinet({...p,width}),prefix=`c${index+1}`,t=p.thickness,d=a.caseDepth,h=p.height;
  errors.push(...a.errors.map(x=>`Cabinet ${index+1}: ${x}`));
  const frameOpeningW=width-2*p.stile,frameOpeningH=h-2*p.rail;
  if(p.faceFrame&&(p.stile<t||p.rail<t))errors.push(`Cabinet ${index+1}: frame rails and stiles must cover the case thickness.`);
  if(p.faceFrame&&(frameOpeningW<2||frameOpeningH<2))errors.push(`Cabinet ${index+1}: face frame leaves too little opening.`);
  const openingW=p.faceFrame?frameOpeningW:a.insideWidth,openingH=p.faceFrame?frameOpeningH:a.insideHeight;
  const borderX=p.faceFrame?p.stile:t,borderZ=p.faceFrame?p.rail:t,n=Number(p.doorCount);
  const inset=p.doors==='inset',doorW=(openingW+(inset?-2*p.reveal:2*p.overlay)-(n-1)*p.reveal)/n;
  const doorH=openingH+(inset?-2*p.reveal:2*p.overlay);
  if(p.doors==='overlay'&&(p.overlay>borderX-p.reveal||p.overlay>borderZ-p.reveal))errors.push(`Cabinet ${index+1}: reduce overlay to leave the chosen reveal inside each case or frame edge.`);
  if(p.doors!=='none'&&(doorW<2||doorH<2))errors.push(`Cabinet ${index+1}: door dimensions are too small.`);
  const front=d+(p.faceFrame?p.frameThickness:0),recess=inset&&p.doors!=='none'?Math.max(0,p.doorThickness+(1/16)-(p.faceFrame?p.frameThickness:0)):0;
  if(d-recess<2)errors.push(`Cabinet ${index+1}: door recess leaves too little shelf depth.`);
  for(const part of a.parts)parts.push({...part,id:`${prefix}-${part.id}`,name:`C${index+1} · ${part.name}`,width:part.id==='shelves'?part.width-recess:part.width});
  const extra=(id:string,name:string,qty:number,length:number,width:number,thickness:number,material:string,note:string)=>parts.push({id:`${prefix}-${id}`,name:`C${index+1} · ${name}`,qty,length,width,thickness,material,note});
  for(const right of [false,true]){let z=0;for(const bottom of [...a.shelfBottoms,h]){add(`${prefix}-sides`,offset+(right?width-t:0),0,base+z,t,d,bottom-z);if(bottom<h){add(`${prefix}-sides`,offset+(right?width-t+a.engagement:0),0,base+bottom,t-a.engagement,d,t);z=bottom+t;}}}
  add(`${prefix}-ends`,offset+t,0,base,a.insideWidth,d,t);add(`${prefix}-ends`,offset+t,0,base+h-t,a.insideWidth,d,t);
  a.shelfBottoms.forEach(z=>add(`${prefix}-shelves`,offset+t-a.engagement,0,base+z,a.shelfLength,d-recess,t));
  add(`${prefix}-back`,offset,-p.backThickness,base,width,p.backThickness,h);
  if(p.faceFrame){
   extra('stiles','Face-frame stiles',2,h,p.stile,p.frameThickness,'Solid wood','Full height; separate flush frame for each cabinet.');
   extra('rails','Face-frame rails',2,frameOpeningW,p.rail,p.frameThickness,'Solid wood','Rails butt between stiles. Finished shoulder lengths; add tenons only if designing that joint.');
   add(`${prefix}-stiles`,offset,d,base,p.stile,p.frameThickness,h);add(`${prefix}-stiles`,offset+width-p.stile,d,base,p.stile,p.frameThickness,h);
   add(`${prefix}-rails`,offset+p.stile,d,base,frameOpeningW,p.frameThickness,p.rail);add(`${prefix}-rails`,offset+p.stile,d,base+h-p.rail,frameOpeningW,p.frameThickness,p.rail);
  }
  if(p.doors!=='none'){
   extra('doors',`${inset?'Inset':'Overlay'} slab doors`,n,doorH,doorW,p.doorThickness,p.material,'Finished plywood slab size; hinge machining and edge banding not included.');
   const dx=borderX+(inset?p.reveal:-p.overlay),dz=borderZ+(inset?p.reveal:-p.overlay);
   for(let i=0;i<n;i++)add(`${prefix}-doors`,offset+dx+i*(doorW+p.reveal),inset?front-p.doorThickness:front+1/16,base+dz,doorW,p.doorThickness,doorH);
  }
  if(floor){
   const baseD=p.depth-p.baseSetback;
   if(baseD<=2*t)errors.push(`Cabinet ${index+1}: reduce toe setback; the plinth needs room between its front and back rails.`);
   extra('base-long','Plinth front & back',2,width,p.baseHeight,t,p.material,'Separate recessed base per cabinet; butt-jointed rails.');
   extra('base-short','Plinth sides',2,baseD-2*t,p.baseHeight,t,p.material,'Sides between front and back rails. No leveling allowance.');
   const y=-p.backThickness;
   add(`${prefix}-base-long`,offset,y,0,width,t,base);add(`${prefix}-base-long`,offset,y+baseD-t,0,width,t,base);
   add(`${prefix}-base-short`,offset,y+t,0,t,baseD-2*t,base);add(`${prefix}-base-short`,offset+width-t,y+t,0,t,baseD-2*t,base);
  }
  const result={...a,width,offset,openingW,openingH,doorW,doorH,prefix,recess};offset+=width;return result;
 });
 return {...cabinets[0],cabinets,parts,solids,errors,runWidth:offset,totalHeight:p.height+base,totalDepth:p.depth+(p.faceFrame?p.frameThickness:0)+(p.doors==='overlay'?p.doorThickness+1/16:0),quantity:parts.reduce((n,x)=>n+x.qty,0),area:parts.reduce((n,x)=>n+x.qty*x.length*x.width/144,0)};
}
