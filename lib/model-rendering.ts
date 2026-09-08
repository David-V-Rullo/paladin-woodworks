export type Point3=[number,number,number];
export type Face={id:string;points:Point3[];color:string;shade:number};
const EPS=1e-7;
export const dot=(a:Point3,b:Point3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const sub=(a:Point3,b:Point3):Point3=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
export function normal(points:Point3[]):Point3{const a=sub(points[1],points[0]),b=sub(points[2],points[0]);const n:Point3=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];const length=Math.hypot(...n);return length>EPS?n.map(v=>v/length) as Point3:[0,0,0];}
/** BSP ordering splits spanning polygons, unlike average-depth sorting which
 * can paint an interior divider over an exterior wall. Input uses camera axes. */
export function orderFaces(faces:Face[],view:Point3=[0,1,.52]):Face[]{
 if(faces.length<2)return faces;
 const plane=faces[0],n=normal(plane.points),w=dot(n,plane.points[0]);
 const front:Face[]=[],back:Face[]=[],coplanar:Face[]=[];
 for(const f of faces){const ds=f.points.map(v=>dot(n,v)-w);const pos=ds.some(d=>d>EPS),neg=ds.some(d=>d<-EPS);
  if(!pos&&!neg){coplanar.push(f);continue;}if(!neg){front.push(f);continue;}if(!pos){back.push(f);continue;}
  const fp:Point3[]=[],bp:Point3[]=[];
  for(let i=0;i<f.points.length;i++){const j=(i+1)%f.points.length,a=f.points[i],b=f.points[j],da=ds[i],db=ds[j];if(da>=-EPS)fp.push(a);if(da<=EPS)bp.push(a);if((da>EPS&&db<-EPS)||(da<-EPS&&db>EPS)){const t=da/(da-db);const v:Point3=[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1]),a[2]+t*(b[2]-a[2])];fp.push(v);bp.push(v);}}
  if(fp.length>=3)front.push({...f,points:fp});if(bp.length>=3)back.push({...f,points:bp});
 }
 return dot(n,view)>=0?[...orderFaces(back,view),...coplanar,...orderFaces(front,view)]:[...orderFaces(front,view),...coplanar,...orderFaces(back,view)];
}
