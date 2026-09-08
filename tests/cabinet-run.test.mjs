import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultCabinet,calculateCabinet} from '../lib/cabinet.ts';
import {defaultRun,runSchema,calculateRun} from '../lib/cabinet-run.ts';

test('old projects migrate without changing cut dimensions',()=>{
 const p=runSchema.parse(defaultCabinet),a=calculateRun(p),old=calculateCabinet(defaultCabinet);
 assert.equal(p.additionalWidths.length,0);assert.equal(p.mounting,'wall');assert.equal(p.doors,'none');
 assert.deepEqual(a.parts.map(x=>[x.qty,x.length,x.width,x.thickness]),old.parts.map(x=>[x.qty,x.length,x.width,x.thickness]));
 assert.equal(a.totalHeight,36);assert.equal(a.totalDepth,12);
});
test('unequal run gives independent frame rail and inset door dimensions',()=>{
 const p={...defaultRun,additionalWidths:[30,18],faceFrame:true,doors:'inset'},a=calculateRun(p);
 assert.equal(a.runWidth,72);assert.deepEqual(a.cabinets.map(c=>c.offset),[0,24,54]);
 assert.deepEqual(a.cabinets.map(c=>c.openingW),[21,27,15]);
 assert.deepEqual(a.cabinets.map(c=>c.doorW),[10.3125,13.3125,7.3125]);
 assert.equal(a.cabinets[0].doorH,32.75);assert.equal(a.parts.filter(x=>x.id.endsWith('stiles')).reduce((n,x)=>n+x.qty,0),6);
 for(const c of a.cabinets)assert.equal(c.doorW*2+3*p.reveal,c.openingW);
 assert.deepEqual(a.errors,[]);
});
test('overlay doors fit and leave separation at neighboring cabinets',()=>{
 const p={...defaultRun,additionalWidths:[24],faceFrame:true,doors:'overlay',overlay:.5},a=calculateRun(p);
 assert.equal(a.cabinets[0].doorW,10.9375);assert.equal(a.cabinets[0].doorH,34);
 assert.equal(a.totalDepth,13.5625);
 const doors=a.solids.filter(x=>x.id.endsWith('doors'));
 assert.ok(doors[1].x+doors[1].w<doors[2].x);
 assert.ok(calculateRun({...p,overlay:1.5}).errors.length);
});
test('floor mode adds the right plinth cuts and raises every case',()=>{
 const a=calculateRun({...defaultRun,mounting:'floor',additionalWidths:[30]});
 assert.equal(a.totalHeight,40);assert.equal(a.parts.find(x=>x.id==='c1-base-short').length,7.5);
 assert.equal(a.parts.find(x=>x.id==='c2-base-long').length,30);
 assert.equal(a.quantity,22);assert.equal(a.solids.find(x=>x.id==='c1-back').z,4);
 assert.ok(calculateRun({...defaultRun,mounting:'floor',depth:6,baseSetback:6}).errors.length);
});
test('inset frameless doors shorten shelves without reducing case depth',()=>{
 const a=calculateRun({...defaultRun,doors:'inset'});
 assert.equal(a.parts.find(x=>x.id==='c1-shelves').width,10.9375);
 assert.equal(a.parts.find(x=>x.id==='c1-sides').width,11.75);
});
test('run settings round trip and reject unsupported sizes',()=>{
 const p={...defaultRun,additionalWidths:[30,18],faceFrame:true,mounting:'floor',doors:'overlay'};
 assert.deepEqual(runSchema.parse(JSON.parse(JSON.stringify(p))),p);
 assert.equal(runSchema.safeParse({...p,additionalWidths:[0]}).success,false);
 assert.equal(runSchema.safeParse({...p,additionalWidths:Array(6).fill(24)}).success,false);
 assert.ok(calculateRun({...p,stile:.75,thickness:1}).errors.length);
});
