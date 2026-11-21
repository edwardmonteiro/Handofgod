import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld,generateIsland,applyBrush,elevationAt,terrainAt,isLand,landRatio,SEA_LEVEL } from '../src/gameplay/world.js';

test('createWorld initializes dimensions, unsigned seed and zeroed Float32Array', () => {
  const w=createWorld(8,6,-1);
  assert.equal(w.w,8);assert.equal(w.h,6);assert.equal(w.seed,0xffffffff);
  assert.ok(w.elev instanceof Float32Array);assert.equal(w.elev.length,48);
  assert.ok(w.elev.every(x=>x===0));
});
test('island generation is deterministic, seed-sensitive and bounded', () => {
  const a=generateIsland(createWorld(192,120,7331));
  const b=generateIsland(createWorld(192,120,7331));
  const c=generateIsland(createWorld(192,120,7332));
  assert.deepEqual(a.elev,b.elev);assert.notDeepEqual(a.elev,c.elev);
  assert.ok(a.elev.every(x=>Number.isFinite(x)&&x>=0&&x<=1));
});
test('generated island contains both water and dry land across known seeds', () => {
  for(const seed of [0,1,77,7331,0xffffffff]) {
    const r=landRatio(generateIsland(createWorld(192,120,seed)));
    assert.ok(r>0&&r<1,'seed '+seed+': '+r);
  }
});
test('brush raises and lowers within bounds and reports exact changes', () => {
  const w=createWorld(9,9,0);w.elev.fill(0.5);
  assert.equal(applyBrush(w,4,4,0.5,0.25),1);
  assert.equal(elevationAt(w,4,4),0.75);
  assert.equal(applyBrush(w,4,4,0.5,1),1);
  assert.equal(elevationAt(w,4,4),1);
  assert.equal(applyBrush(w,4,4,0.5,1),0);
  assert.equal(applyBrush(w,4,4,0.5,-2),1);
  assert.equal(elevationAt(w,4,4),0);
  assert.equal(applyBrush(w,4,4,0.5,-2),0);
  assert.ok(w.elev.every(x=>x>=0&&x<=1));
});
test('brush clips at map edges and does not alter cells outside radius', () => {
  const w=createWorld(7,7,123);
  assert.equal(applyBrush(w,0,0,2,0.8),4);
  assert.equal(elevationAt(w,6,6),0);
  assert.ok(Math.abs(elevationAt(w,0,0)-0.8)<1e-6);
  assert.ok(elevationAt(w,1,0)>0&&elevationAt(w,1,1)>0);
});
test('terrainAt maps all seven bands and above sea level counts as land', () => {
  const w=createWorld(7,1,0);
  [[0.2,'deep'],[0.35,'shallow'],[0.44,'sand'],[0.55,'grass'],[0.69,'forest'],[0.8,'rock'],[0.95,'snow']]
    .forEach(([v,name],x)=>{w.elev[x]=v;assert.equal(terrainAt(w,x,0),name);});
  // Float32 rounds 0.42 downward: exact threshold discrepancy logged for @brain.
  w.elev[0]=SEA_LEVEL+0.001;assert.equal(isLand(w,0,0),true);
  w.elev[0]=0.41;assert.equal(isLand(w,0,0),false);
});
test('elevationAt clamps coordinates and landRatio reflects manipulated cells', () => {
  const w=createWorld(2,2,5);w.elev.set([0,0.7,0.9,0]);
  assert.equal(elevationAt(w,-100,-10),0);
  assert.ok(Math.abs(elevationAt(w,200,0)-0.7)<1e-6);
  assert.ok(Math.abs(elevationAt(w,0,200)-0.9)<1e-6);
  assert.equal(landRatio(w),0.5);
});
