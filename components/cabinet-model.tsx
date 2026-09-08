'use client';
import {calculateRun,type CabinetRun} from '@/lib/cabinet-run';
import {orderFaces,normal,dot,type Face,type Point3} from '@/lib/model-rendering';
export default function CabinetModel({p,angle,explode,selected,onSelect,showDoors=true}:{p:CabinetRun;angle:number;explode:boolean;selected:string;onSelect:(id:string)=>void;showDoors?:boolean}){
 const a=calculateRun(p),w=a.runWidth,d=p.depth;
 const solids=a.solids.filter(s=>showDoors||!s.id.endsWith('-doors')).map(s=>({...s,
 x:s.x+(explode?(Number(s.id.match(/^c(\d+)/)?.[1]||1)-1)*4:0),
 y:s.y+(explode?(s.id.endsWith('-doors')?8:s.id.endsWith('-stiles')||s.id.endsWith('-rails')?4:s.id.endsWith('-back')?-4:0):0),
 z:s.z+(explode&&s.id.endsWith('-shelves')?1:0)}));
 const rad=angle*Math.PI/180,view:Point3=[0,1,.52],faces:Face[]=[];
 const rotate=([x,y,z]:Point3):Point3=>[(x-w/2)*Math.cos(rad)-(y-d/2)*Math.sin(rad),(x-w/2)*Math.sin(rad)+(y-d/2)*Math.cos(rad),z];
 const color={'Birch plywood':'#c7aa78','Oak plywood':'#b49569','Walnut plywood':'#916849'}[p.material];
 for(const s of solids){const b:Point3[]=[[s.x,s.y,s.z],[s.x+s.w,s.y,s.z],[s.x+s.w,s.y+s.d,s.z],[s.x,s.y+s.d,s.z]],top=b.map(([x,y,z]):Point3=>[x,y,z+s.h]);const push=(points:Point3[])=>{const pts=points.map(rotate),n=normal(pts);if(dot(n,view)>1e-7)faces.push({id:s.id,points:pts,color,shade:.72+.35*Math.max(0,dot(n,[-.4,.35,.85]))});};push(top);push([...b].reverse());for(let i=0;i<4;i++)push([b[i],b[(i+1)%4],top[(i+1)%4],top[i]]);}
 const sorted=orderFaces(faces),project=([x,y,z]:Point3)=>[x,y*.52-z],all=sorted.flatMap(f=>f.points.map(project));
 const minX=Math.min(...all.map(v=>v[0])),maxX=Math.max(...all.map(v=>v[0])),minY=Math.min(...all.map(v=>v[1])),maxY=Math.max(...all.map(v=>v[1])),scale=Math.min(530/(maxX-minX),340/(maxY-minY));
 return <svg viewBox="0 0 700 420" role="img" aria-label="Cabinet run with casework, face frames, doors and bases as configured. Select parts in the cut list."><rect width="700" height="420" fill="#f1f5f8"/>{sorted.map((f,i)=><polygon key={i} points={f.points.map(v=>{const [x,y]=project(v);return `${350+(x-(minX+maxX)/2)*scale},${210+(y-(minY+maxY)/2)*scale}`}).join(' ')} fill={selected===f.id?'#dca34d':color} stroke={selected===f.id?'#dca34d':color} strokeWidth=".35" style={{filter:`brightness(${f.shade})`}} onClick={()=>onSelect(f.id)}><title>{a.parts.find(x=>x.id===f.id)?.name}</title></polygon>)}</svg>;
}
