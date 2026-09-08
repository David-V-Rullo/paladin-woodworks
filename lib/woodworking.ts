import { z } from 'zod';
export const schema=z.object({version:z.literal(1),width:z.number().min(6).max(30),depth:z.number().min(4).max(20),height:z.number().min(2).max(10),thickness:z.number().min(.25).max(1),groove:z.number().min(.0625).max(.375),columns:z.number().int().min(1).max(6),rows:z.number().int().min(1).max(3),joint:z.enum(['miter','butt']),material:z.enum(['Walnut','Cherry','White oak']),lid:z.boolean()});
export type Project=z.infer<typeof schema>;
export const initial:Project={version:1,width:14,depth:9,height:3.5,thickness:.5,groove:.1875,columns:3,rows:2,joint:'miter',material:'Walnut',lid:true};
export type Part={id:string;name:string;qty:number;length:number;width:number;thickness:number;material:string;note:string};
export function calculate(p:Project){
 const {width:w,depth:d,height:h,thickness:t,groove:g,columns:c,rows:r}=p;
 const iw=w-2*t,id=d-2*t,dt=.25,bottom=.25,under=.375,clearance=.03125;
 const cellW=(iw-(c-1)*dt)/c,cellD=(id-(r-1)*dt)/r,dividerH=h-under-bottom-.25;
 const errors:string[]=[];
 if(g>=t*.6)errors.push('Groove depth must be less than 60% of wall thickness.');
 if(cellW<1.5||cellD<1.5)errors.push('Compartments must be at least 1½ inches in both directions. Reduce the divider count.');
 const parts:Part[]=[{id:'front-back',name:'Front & back',qty:2,length:w,width:h,thickness:t,material:p.material,note:p.joint==='miter'?'45° ends; long-point to long-point length.':'Full-length faces; sides fit between.'},{id:'sides',name:'Left & right',qty:2,length:p.joint==='miter'?d:d-2*t,width:h,thickness:t,material:p.material,note:p.joint==='miter'?'45° ends; long-point to long-point length.':'Square ends; glue-up/clamping method to be chosen.'},{id:'bottom',name:'Captured bottom',qty:1,length:iw+2*g-clearance,width:id+2*g-clearance,thickness:bottom,material:'Veneered plywood',note:'1/32 in total clearance in each direction. Dry-fit before assembly.'}];
 if(r>1)parts.push({id:'row-dividers',name:'Long dividers',qty:r-1,length:iw-.03125,width:dividerH,thickness:dt,material:p.material,note:'Removable, square-ended. Short dividers butt against these.'});
 if(c>1)parts.push({id:'column-dividers',name:'Short dividers',qty:(c-1)*r,length:cellD-.03125,width:dividerH,thickness:dt,material:p.material,note:'Removable, square-ended. Loose grid; no half-laps.'});
 if(p.lid)parts.push({id:'lid',name:'Lift-off lid',qty:1,length:w,width:d,thickness:t,material:'Veneered plywood',note:'Flush cover only; no locating lip or hardware in this prototype.'});
 return {parts,errors,iw,id,cellW,cellD,dividerH,bottom,under,dt,quantity:parts.reduce((n,x)=>n+x.qty,0),boardFeet:parts.filter(x=>x.material===p.material).reduce((n,x)=>n+x.qty*(x.length+1)*(x.width+.25)*(x.thickness+.125)/144,0)};
}
export function measure(n:number){const ticks=Math.round(n*32),whole=Math.floor(ticks/32);let a=ticks%32,b=32;while(a&&a%2===0){a/=2;b/=2;}return `${whole||!a?whole:''}${whole&&a?' ':''}${a?`${a}/${b}`:''}″`;}
export function parseDimension(v:string){const s=v.trim().replace(/[″"]/g,'').replace(/-/g,' ');if(/^\d+(?:\.\d+)?$/.test(s))return Number(s);const m=s.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);return m&&Number(m[3])?Number(m[1]||0)+Number(m[2])/Number(m[3]):NaN;}
