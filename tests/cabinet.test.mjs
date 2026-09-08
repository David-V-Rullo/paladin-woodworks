import test from 'node:test';
import assert from 'node:assert/strict';
import {cabinetSchema,defaultCabinet,calculateCabinet} from '../lib/cabinet.ts';

test('default cabinet fits its overall envelope and equal openings',()=>{
 const a=calculateCabinet(defaultCabinet);
 assert.equal(a.insideWidth,22.5);assert.equal(a.caseDepth,11.75);
 assert.equal(a.opening,11);assert.deepEqual(a.shelfBottoms,[11.75,23.5]);
 assert.equal(a.shelfLength,23);assert.equal(a.quantity,7);assert.deepEqual(a.errors,[]);
 assert.equal(a.caseDepth+defaultCabinet.backThickness,defaultCabinet.depth);
 assert.equal(a.shelfBottoms.at(-1)+defaultCabinet.thickness+a.opening,defaultCabinet.height-defaultCabinet.thickness);
});
test('switching shelf joinery removes only the dado engagement allowance',()=>{
 const dado=calculateCabinet(defaultCabinet),butt=calculateCabinet({...defaultCabinet,joint:'butt'});
 assert.equal(dado.shelfLength-butt.shelfLength,.5);
 assert.deepEqual(dado.shelfBottoms,butt.shelfBottoms);
 assert.deepEqual(dado.parts.filter(x=>x.id!=='shelves'),butt.parts.filter(x=>x.id!=='shelves'));
});
test('zero shelves removes shelf parts and gives a single clear opening',()=>{
 const a=calculateCabinet({...defaultCabinet,shelves:0});assert.equal(a.quantity,5);
 assert.equal(a.opening,34.5);assert.deepEqual(a.shelfBottoms,[]);
 assert.equal(a.parts.some(x=>x.id==='shelves'),false);
});
test('invalid joinery and cramped openings are rejected for export',()=>{
 assert.ok(calculateCabinet({...defaultCabinet,thickness:.5,dado:.375}).errors.length);
 assert.ok(calculateCabinet({...defaultCabinet,height:12,shelves:6}).errors.length);
 assert.equal(cabinetSchema.safeParse({...defaultCabinet,kind:'watchbox'}).success,false);
 assert.equal(cabinetSchema.safeParse({...defaultCabinet,width:Infinity}).success,false);
 assert.deepEqual(cabinetSchema.parse(JSON.parse(JSON.stringify(defaultCabinet))),defaultCabinet);
});
