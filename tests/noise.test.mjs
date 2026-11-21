import test from 'node:test';
import assert from 'node:assert/strict';
import { createNoise2D, fbm } from '../src/engine/noise.js';
import { createRng } from '../src/engine/rng.js';

test('value noise is seed-deterministic across positive and negative coordinates', () => {
  const a=createNoise2D(createRng(42)), b=createNoise2D(createRng(42));
  for(const [x,y] of [[0,0],[1.2,3.1],[9.99,-2.1],[-32,52.5],[200.4,300.3]]) assert.equal(a(x,y),b(x,y));
});
test('noise and fBm remain within [0,1] for sampled coordinates', () => {
  const n=createNoise2D(createRng(2026));
  for(let y=-8;y<11;y+=0.7) for(let x=-12;x<13;x+=0.9){
    const v=n(x,y), f=fbm(n,x/5,y/5);
    assert.ok(v>=0&&v<=1);
    assert.ok(f>=0&&f<=1);
  }
});
test('noise is continuous at a grid boundary', () => {
  const n=createNoise2D(createRng(2027)),eps=1e-6;
  assert.ok(Math.abs(n(2-eps,3.25)-n(2+eps,3.25))<1e-5);
});
test('fBm honours octave parameter and repeats identically', () => {
  const n=createNoise2D(createRng(5));
  assert.equal(fbm(n,2.1,4.3,1),n(2.1,4.3));
  assert.equal(fbm(n,-0.25,10.75,5),fbm(n,-0.25,10.75,5));
});
