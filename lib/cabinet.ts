import {z} from 'zod';
import type {Part} from './woodworking';

export const cabinetSchema=z.object({kind:z.literal('cabinet'),version:z.literal(1),width:z.number().min(8).max(48),height:z.number().min(12).max(84),depth:z.number().min(6).max(30),thickness:z.number().min(.5).max(1),backThickness:z.number().min(.125).max(.75),shelves:z.number().int().min(0).max(6),joint:z.enum(['butt','dado']),dado:z.number().min(.125).max(.375),material:z.enum(['Birch plywood','Oak plywood','Walnut plywood'])});
export type Cabinet= z.infer<typeof cabinetSchema>;
export const defaultCabinet:Cabinet={kind:'cabinet',version:1,width:24,height:36,depth:12,thickness:.75,backThickness:.25,shelves:2,joint:'dado',dado:.25,material:'Birch plywood'};
export function calculateCabinet(p:Cabinet){
 const insideWidth=p.width-2*p.thickness,insideHeight=p.height-2*p.thickness,caseDepth=p.depth-p.backThickness;
 const opening=(insideHeight-p.shelves*p.thickness)/(p.shelves+1);
 const engagement=p.joint==='dado'?p.dado:0;
 const shelfLength=insideWidth+2*engagement;
 const shelfBottoms=Array.from({length:p.shelves},(_,i)=>p.thickness+(i+1)*opening+i*p.thickness);
 const errors:string[]=[];
 if(p.shelves>0&&p.joint==='dado'&&p.dado>p.thickness/2)errors.push('Keep shelf dados at or below half the side thickness.');
 if(opening<3)errors.push('Each opening needs at least 3 inches of clear height. Reduce shelves or increase height.');
 const parts:Part[]=[
  {id:'sides',name:'Sides',qty:2,length:p.height,width:caseDepth,thickness:p.thickness,material:p.material,note:'Full-height sides. Grain runs vertically.'},
  {id:'ends',name:'Top & bottom',qty:2,length:insideWidth,width:caseDepth,thickness:p.thickness,material:p.material,note:'Square-ended panels between sides; butt joints.'},
  ...(p.shelves?[{id:'shelves',name:'Fixed shelves',qty:p.shelves,length:shelfLength,width:caseDepth,thickness:p.thickness,material:p.material,note:p.joint==='dado'?'Full-depth through dados in both sides; shelf length includes both dado engagements.':'Square-ended shelves between sides; fastener method to be chosen.'}]:[]),
  {id:'back',name:'Applied back',qty:1,length:p.height,width:p.width,thickness:p.backThickness,material:p.material,note:'Full overlay back. Its thickness is included in overall cabinet depth.'}
 ];
 return {insideWidth,insideHeight,caseDepth,opening,shelfBottoms,shelfLength,engagement,errors,parts,quantity:parts.reduce((n,x)=>n+x.qty,0),area:parts.reduce((n,x)=>n+x.qty*x.length*x.width/144,0)};
}
