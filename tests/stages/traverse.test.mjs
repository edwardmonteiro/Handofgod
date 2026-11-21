import test from 'node:test';
import assert from 'node:assert/strict';
import { createStage, stepStage } from '../../src/gameplay/stages/traverse.js';

const DT = 1 / 60;
const idle = { x: .5, y: .5, active: false, alt: false, dx: 0, dy: 0, moveX: 0, jump: false, act: false };
function step(state, moveX = 0, jump = false) {
  stepStage(state, { ...idle, moveX, jump }, DT);
  for (const event of state.events) {
    assert.ok(['step', 'jump', 'land', 'push', 'blocked', 'reach'].includes(event.type));
    assert.ok(event.x >= 0 && event.x <= 1);
    assert.ok(event.y >= 0 && event.y <= 1);
    assert.ok(event.strength >= 0 && event.strength <= 1);
  }
  return state.events.map(({ type }) => type);
}

test('traversal: initial obstacle cannot be completed by walking or jumping alone', () => {
  const state = createStage(17);
  state.block.x = -100; // remove the required tool without changing engine/game code
  let blocked = 0, reached = 0;
  for (let i = 0; i < 1200; i++) {
    const events = step(state, 1, i % 65 === 0);
    blocked += events.filter(x => x === 'blocked').length;
    reached += events.filter(x => x === 'reach').length;
  }
  assert.equal(reached, 0);
  assert.equal(state.complete, false);
  assert.ok(state.hero.x < 15, 'bare jump should not cross the 2m ledge');
  assert.ok(blocked > 0, 'unreachable ledge should emit blocked feedback');
});

test('traversal: pushing changes the level and emits a push event once per push start', () => {
  const state = createStage(19);
  let pushes = 0, footsteps = 0;
  for (let i = 0; i < 300; i++) {
    const events = step(state, 1);
    pushes += events.filter(x => x === 'push').length;
    footsteps += events.filter(x => x === 'step').length;
  }
  assert.ok(state.block.x > 13, 'player should push the stone to the ledge');
  assert.ok(pushes >= 1, 'stone movement must emit push');
  assert.ok(footsteps >= 1, 'walking should emit steps');
  assert.equal(state.complete, false);
});

test('traversal: push stone, mount it, jump to ledge and reach exit', () => {
  const state = createStage(23);
  const events = new Set();
  const advance = (n, move, firstJump = false) => {
    for (let i = 0; i < n; i++) {
      for (const type of step(state, move, firstJump && i === 0)) events.add(type);
    }
  };
  advance(300, 1);     // bring the block against the raised ledge
  assert.ok(state.block.x > 13, 'stone did not reach the ledge');
  advance(26, 1, true); // jump across the block's upper face
  advance(45, 0);      // settle on top of the block
  assert.ok(state.hero.y >= 1, 'stone must serve as a step');
  assert.ok(state.hero.grounded, 'hero should land on the stone');
  advance(290, 1, true); // jump again, land on the high shelf, continue to exit
  assert.equal(state.complete, true, 'solver path did not reach the exit');
  assert.equal(state.progress, 1);
  assert.ok(events.has('push'));
  assert.ok(events.has('jump'));
  assert.ok(events.has('reach'));
  advance(1, 0);
  assert.ok(!state.events.some((event) => event.type === 'reach'), 'reach must not repeat');
});
