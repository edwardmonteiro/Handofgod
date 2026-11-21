// Run 01 F-04. Pure deterministic simulation: no DOM or Web Audio.
// age is elapsed time spent in the current state (reset on transitions).
import { isLand, terrainAt, SEA_LEVEL } from './world.js';

export const BELIEF_PER_SECOND = 1;
export const WANDER_SPEED = 1.75; // world cells per second
export const SETTLE_AFTER_SECONDS = 1.5;
export const SETTLE_CHANCE_PER_SECOND = 0.9;
export const DROWN_REMOVE_SECONDS = 2;
const MAX_MOTION_DT = 0.05;

/** @returns {{list:Array<{x:number,y:number,state:string,age:number}>,belief:number,events:Array}} */
export function createFollowers(world, rng, count = 24) {
  const list = [];
  const requested = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  if (requested === 0 || world.w < 1 || world.h < 1) return { list, belief: 0, events: [] };

  // Collect valid spawn positions to prevent unbounded retries on tiny or submerged maps.
  const landCells = [];
  for (let i = 0; i < world.elev.length; i++) {
    if (world.elev[i] >= SEA_LEVEL) landCells.push(i);
  }
  if (landCells.length === 0) return { list, belief: 0, events: [] };

  for (let i = 0; i < requested; i++) {
    const cell = landCells[Math.min(landCells.length - 1, Math.floor(rng() * landCells.length))];
    list.push({ x: cell % world.w, y: Math.floor(cell / world.w), state: 'wander', age: 0 });
  }
  return { list, belief: 0, events: [] };
}

/**
 * Advances followers. Events are ephemeral plain data for Brain to route to Instinct.
 * Each settle/drown event is emitted once, on the corresponding state transition.
 */
export function stepFollowers(followers, world, rng, dt) {
  followers.events.length = 0;
  if (!Number.isFinite(dt) || dt <= 0) return;
  const motionDt = Math.min(dt, MAX_MOTION_DT);

  for (let i = followers.list.length - 1; i >= 0; i--) {
    const follower = followers.list[i];
    if (follower.state === 'drowning') {
      follower.age += dt;
      if (follower.age >= DROWN_REMOVE_SECONDS) followers.list.splice(i, 1);
      continue;
    }

    // The hand may have lowered the land beneath an existing follower.
    if (!isLand(world, follower.x, follower.y)) {
      follower.state = 'drowning';
      follower.age = 0;
      followers.events.push({ type: 'drown', x: follower.x, y: follower.y });
      continue;
    }

    follower.age += dt;
    if (follower.state === 'settled') {
      followers.belief += BELIEF_PER_SECOND * dt;
      continue;
    }
    if (follower.state !== 'wander') continue;

    if (follower.age >= SETTLE_AFTER_SECONDS &&
        terrainAt(world, follower.x, follower.y) === 'grass' &&
        surroundedByLand(world, follower.x, follower.y)) {
      const probability = 1 - Math.exp(-SETTLE_CHANCE_PER_SECOND * dt);
      if (rng() < probability) {
        follower.state = 'settled';
        follower.age = 0;
        followers.events.push({ type: 'settle', x: follower.x, y: follower.y });
        continue;
      }
    }

    // Smooth, deterministic drift with a small seeded perturbation.
    const angle = Math.sin(follower.age * 0.48 + follower.x * 0.13 + follower.y * 0.07) * Math.PI
      + (rng() - 0.5) * 0.18;
    const dx = Math.cos(angle) * WANDER_SPEED * motionDt;
    const dy = Math.sin(angle) * WANDER_SPEED * motionDt;
    const nx = Math.min(world.w - 1, Math.max(0, follower.x + dx));
    const ny = Math.min(world.h - 1, Math.max(0, follower.y + dy));

    // Slide along shoreline; do not walk through newly submerged cells.
    if (isLand(world, nx, ny)) {
      follower.x = nx;
      follower.y = ny;
    } else if (isLand(world, nx, follower.y)) {
      follower.x = nx;
    } else if (isLand(world, follower.x, ny)) {
      follower.y = ny;
    }
  }
}

function surroundedByLand(world, x, y) {
  if (x < 1 || x > world.w - 2 || y < 1 || y > world.h - 2) return false;
  return isLand(world, x - 1, y) && isLand(world, x + 1, y)
    && isLand(world, x, y - 1) && isLand(world, x, y + 1);
}
