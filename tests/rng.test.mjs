import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng, hashSeed } from '../src/engine/rng.js';

test('mulberry32 is deterministic for identical numeric seeds', () => {
  const a = createRng(123456789), b = createRng(123456789);
  assert.deepEqual(Array.from({length:1024},()=>a()),Array.from({length:1024},()=>b()));
});
test('rng always returns numbers within [0, 1)', () => {
  const rng = createRng(0);
  for(let i=0;i<10000;i++) { const n=rng(); assert.ok(Number.isFinite(n)&&n>=0&&n<1); }
});
test('different seeds produce different sequences', () => {
  const a=createRng(1),b=createRng(2);
  assert.notDeepEqual(Array.from({length:64},()=>a()),Array.from({length:64},()=>b()));
});
test('hashSeed is a stable unsigned 32-bit hash for strings', () => {
  for(const s of ['', 'Gênesis','run-01']) {
    const v=hashSeed(s);
    assert.ok(Number.isInteger(v)&&v>=0&&v<=0xffffffff);
    assert.equal(v,hashSeed(s));
  }
  assert.notEqual(hashSeed('run-01'),hashSeed('run-02'));
});
