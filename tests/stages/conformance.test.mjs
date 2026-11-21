import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';

const directory = new URL('../../src/gameplay/stages/', import.meta.url);
const modules = (await readdir(directory)).filter((name) => name.endsWith('.js')).sort();
const idle = Object.freeze({ x: 0.5, y: 0.5, active: false, alt: false, dx: 0, dy: 0, moveX: 0, jump: false, act: false });

test('stage conformance discovers at least one module', () => {
  assert.ok(modules.length > 0, 'No stage modules found; do not silently skip the contract suite');
});

for (const filename of modules) {
  test(`contract: ${filename}`, async () => {
    const stage = await import(new URL(filename, directory).href);
    assert.equal(typeof stage.createStage, 'function');
    assert.equal(typeof stage.stepStage, 'function');
    assert.equal(stage.meta?.id, filename.replace(/\.js$/, ''));
    assert.ok(Number.isInteger(stage.meta?.order) && stage.meta.order > 0);
    assert.ok(typeof stage.meta?.verse === 'string' && stage.meta.verse.length > 0);
    assert.ok(typeof stage.meta?.title === 'string' && stage.meta.title.length > 0);

    const a = stage.createStage(12345);
    const b = stage.createStage(12345);
    for (const state of [a, b]) {
      assert.ok(Array.isArray(state.events));
      assert.equal(typeof state.complete, 'boolean');
      assert.ok(Number.isFinite(state.progress) && state.progress >= 0 && state.progress <= 1);
    }
    // Compare serializable simulation values, excluding internal PRNG closures.
    function snapshot(state) {
      return JSON.stringify(state, (_key, value) => typeof value === 'function' ? undefined : value);
    }
    assert.equal(snapshot(a), snapshot(b), 'same seed must initialize identically');
    const intents = [
      { ...idle, active: true, x: 0.3, y: 0.6, moveX: 1 },
      { ...idle, active: true, x: 0.35, y: 0.55, moveX: 1, dx: 0.05, dy: -0.05 },
      { ...idle, alt: true, moveX: 0, jump: true },
      idle,
    ];
    for (let i = 0; i < 100; i++) {
      const intent = intents[i % intents.length];
      stage.stepStage(a, intent, 1 / 60);
      stage.stepStage(b, intent, 1 / 60);
      assert.equal(snapshot(a), snapshot(b), `nondeterministic state at step ${i}`);
      for (const state of [a, b]) {
        assert.ok(Number.isFinite(state.progress) && state.progress >= 0 && state.progress <= 1, 'progress out of range');
        assert.equal(typeof state.complete, 'boolean');
        assert.ok(Array.isArray(state.events));
        for (const event of state.events) {
          assert.equal(typeof event.type, 'string');
          for (const key of ['x', 'y', 'strength']) {
            assert.ok(Number.isFinite(event[key]) && event[key] >= 0 && event[key] <= 1, `bad event ${key}`);
          }
        }
      }
    }
    // Event arrays are ephemeral, and must be emptied at the start even for dt=0.
    a.events.push({ type: '__probe__', x: 0, y: 0, strength: 0 });
    stage.stepStage(a, idle, 0);
    assert.ok(!a.events.some((event) => event.type === '__probe__'), 'stale events survived step');
    // Pure gameplay modules must be usable without a browser DOM.
    assert.equal(typeof globalThis.document, 'undefined');
    assert.equal(typeof globalThis.window, 'undefined');
  });
}
