'use client';
import {calculate,measure,type Project} from '@/lib/woodworking';
import {orderFaces,normal,dot,type Face} from '@/lib/model-rendering';
type P3=[number,number,number];
export default function Model({p,explode,angle,selected,setSelected,showLid=true}:{p:Project;explode:boolean;angle:number;selected:string;setSelected:(v:string)=>void;showLid?:boolean}){
 const a=calculate(p),w=p.width,d=p.depth,h=p.height,t=p.thickness,g=p.groove,e=explode?1.4:0;
 const solids:{id:string;poly:number[][];z:number;h:number;offset:P3;color:string}[]=[];
 const color={Walnut:'#94694b',Cherry:'#b97d55','White oak':'#b49a6a'}[p.material];
 const rect=(x:number,y:number,b:number,l:number)=>[[x,y],[x+b,y],[x+b,y+l],[x,y+l]];
 const front=p.joint==='miter'?[[0,0],[w,0],[w-t,t],[t,t]]:rect(0,0,w,t);
 const side=p.joint==='miter'?[[0,0],[t,t],[t,d-t],[0,d]]:rect(0,t,t,d-2*t);
 const add=(id:string,poly:number[][],z:number,height:number,offset:P3,c=color)=>solids.push({id,poly,z,h:height,offset,color:c});
 // Grooves represented by recessing the interior wall face at the bottom-panel elevation.
 const narrowFront=p.joint==='miter'?[[0,0],[w,0],[w-t+g,t-g],[t-g,t-g]]:rect(0,0,w,t-g);
 const narrowSide=p.joint==='miter'?[[0,0],[t-g,t-g],[t-g,d-t+g],[0,d]]:rect(0,t,t-g,d-2*t);
 const walls=[{id:'front-back',poly:front,inner:narrowFront,off:[0,-e,0] as P3},{id:'front-back',poly:front.map(([x,y])=>[x,d-y]).reverse(),inner:narrowFront.map(([x,y])=>[x,d-y]).reverse(),off:[0,e,0] as P3},{id:'sides',poly:side,inner:narrowSide,off:[-e,0,0] as P3},{id:'sides',poly:side.map(([x,y])=>[w-x,y]).reverse(),inner:narrowSide.map(([x,y])=>[w-x,y]).reverse(),off:[e,0,0] as P3}];
 for(const wall of walls){add(wall.id,wall.poly,0,a.under,wall.off);add(wall.id,wall.inner,a.under,a.bottom,wall.off);add(wall.id,wall.poly,a.under+a.bottom,h-a.under-a.bottom,wall.off);}
 add('bottom',rect(t-g+.015625,t-g+.015625,a.iw+2*g-.03125,a.id+2*g-.03125),a.under,a.bottom,[0,0,-e],'#c4ac87');
 for(let j=1;j<p.rows;j++)add('row-dividers',rect(t+.015625,t+j*a.cellD+(j-1)*a.dt,a.iw-.03125,a.dt),a.under+a.bottom,a.dividerH,[0,0,e*.7]);
 for(let i=1;i<p.columns;i++)for(let j=0;j<p.rows;j++)add('column-dividers',rect(t+i*a.cellW+(i-1)*a.dt,t+j*(a.cellD+a.dt)+.015625,a.dt,a.cellD-.03125),a.under+a.bottom,a.dividerH,[0,0,e*.7]);
 if(p.lid&&showLid)add('lid',rect(0,0,w,d),h,t,[0,0,explode?4:2],'#ac8a63');
 const rad=angle*Math.PI/180;
 const rotate=([x,y,z]:P3)=>{const xx=x-w/2,yy=y-d/2;return [xx*Math.cos(rad)-yy*Math.sin(rad),xx*Math.sin(rad)+yy*Math.cos(rad),z] as P3};
 const project=([x,y,z]:P3)=>[x,y*.52-z];
 const visible:Face[]=[];
 solids.forEach(s=>{const pts=s.poly.map(([x,y])=>[x+s.offset[0],y+s.offset[1],s.z+s.offset[2]] as P3);const top=pts.map(([x,y,z])=>[x,y,z+s.h] as P3);const addFace=(points:P3[])=>{const camera=points.map(rotate),n=normal(camera);if(dot(n,[0,1,.52])<=1e-7)return;visible.push({id:s.id,points:camera,color:s.color,shade:.74+.38*Math.max(0,dot(n,[-.4,.35,.85]))});};addFace(top);for(let i=0;i<pts.length;i++)addFace([pts[i],pts[(i+1)%pts.length],top[(i+1)%pts.length],top[i]]);});
 const faces=orderFaces(visible);
 const all=faces.flatMap(f=>f.points.map(project)),xs=all.map(p=>p[0]),ys=all.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),scale=Math.min(560/(maxX-minX),320/(maxY-minY));
 const coords=(v:P3)=>{const [x,y]=project(v);return `${350+(x-(minX+maxX)/2)*scale},${205+(y-(minY+maxY)/2)*scale}`};
 return <svg viewBox="0 0 700 420" role="img" aria-label="Rotatable box assembly. Interior parts are hidden by the solid walls; select parts using the cut list."><defs><pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#dbe2e9" strokeWidth=".65"/></pattern></defs><rect width="700" height="420" fill="url(#grid)"/>{faces.map((f,i)=><polygon key={i} points={f.points.map(coords).join(' ')} fill={selected===f.id?'#dca34d':f.color} style={{filter:`brightness(${f.shade})`}} stroke={selected===f.id?'#dca34d':f.color} strokeWidth=".4" strokeLinejoin="round" onClick={()=>setSelected(f.id)}><title>{a.parts.find(x=>x.id===f.id)?.name}</title></polygon>)}<text x="25" y="394" fill="#536477" fontSize="14">{measure(w)} W × {measure(d)} D × {measure(h)} case H</text><text x="675" y="394" textAnchor="end" fill="#536477" fontSize="13">{p.lid?(showLid?'LID LIFTED':'LID HIDDEN IN PREVIEW'):'OPEN CASE'}</text></svg>;
}
