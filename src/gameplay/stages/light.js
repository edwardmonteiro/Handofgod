// Stage 1 · "Let there be light" (Genesis 1:3-5). Pure logic: no DOM, no audio. Contracts v2.
//
// Darkness covers the deep. Motes of light drift through it. Hold to draw motes into the hand, which
// glows brighter the more it has gathered. Wherever the hand's light falls, the deep is lit. Release to
// leave a pool behind. Light slowly fades, so the player must gather and place it well.
// Done when enough of the deep is lit at once, held for HOLD_TO_DIVIDE seconds.
//
// Render-facing state (read by src/art/stages/light.js):
//   gw, gh            light-grid size (cells)
//   grid              Float32Array(gw*gh), light level 0..1 per cell
//   motes             [{ x, y, glow }], normalised 0..1 positions, glow 0..1
//   hand              { x, y, active, charge, radius }, normalised; radius in x-units (fraction of width)
//   coverage          share of cells lit above LIT_LEVEL, 0..1
//   target            coverage needed (COVERAGE_TARGET)
//   holdTime          seconds coverage has stayed at or above target
//   resolve           0..1 after completion (the dawn spreading)

import { createRng } from '../../engine/rng.js';

export const meta = { id: 'light', order: 1, verse: 'Genesis 1:3-5', title: 'Let there be light' };

// ---- Tuning ----------------------------------------------------------------
export const GRID_W = 32;
export const GRID_H = 18;
export const MOTE_COUNT = 70;
export const MOTE_DRIFT = 0.025;        // normalised units per second
export const GATHER_RADIUS = 0.22;      // motes inside this distance are pulled toward the hand
export const GATHER_PULL = 0.9;         // pull speed, normalised units per second
export const ABSORB_RADIUS = 0.025;
export const MOTE_CHARGE = 0.08;        // charge gained per absorbed mote
export const RESPAWN_MIN_DIST = 0.3;    // reborn motes appear at least this far from the hand
export const HAND_RADIUS_MIN = 1.5;     // light radius in cells with zero charge
export const HAND_RADIUS_GROW = 6.5;    // extra cells at full charge
export const HAND_GLOW_MIN = 0.35;      // light level under an empty hand
export const LIGHT_DECAY = 0.025;       // light lost per second per cell
export const RELEASE_DRAIN = 1.6;       // charge lost per second after release (the pool settles)
export const LIT_LEVEL = 0.5;
export const COVERAGE_TARGET = 0.55;
export const HOLD_TO_DIVIDE = 2;        // seconds
export const RESOLVE_SECONDS = 3;
const REVEAL_STEP = 0.05;               // emit 'reveal' each time coverage crosses another 5%

export function createStage(seed) {
  const rng = createRng(seed >>> 0);
  const motes = [];
  for (let i = 0; i < MOTE_COUNT; i++) {
    motes.push({ x: rng(), y: rng(), glow: 0.3 + rng() * 0.7, phase: rng() * Math.PI * 2, held: false });
  }
  return {
    rng,
    gw: GRID_W,
    gh: GRID_H,
    grid: new Float32Array(GRID_W * GRID_H),
    motes,
    hand: { x: 0.5, y: 0.5, active: false, charge: 0, radius: cellsToX(HAND_RADIUS_MIN) },
    coverage: 0,
    bestReveal: 0,
    target: COVERAGE_TARGET,
    holdTime: 0,
    time: 0,
    progress: 0,
    complete: false,
    resolve: 0,
    events: [],
  };
}

export function stepStage(state, intent, dt) {
  state.events.length = 0;
  if (!(dt > 0)) return;
  state.time += dt;
  const { hand, grid, gw, gh } = state;

  if (state.complete) {
    state.resolve = Math.min(1, state.resolve + dt / RESOLVE_SECONDS);
    for (let i = 0; i < grid.length; i++) grid[i] = Math.min(1, grid[i] + dt * 0.6);
    driftMotes(state, dt, false);
    return;
  }

  // ---- Hand ------------------------------------------------------------------
  const wasActive = hand.active;
  hand.x = intent.x;
  hand.y = intent.y;
  hand.active = !!intent.active;
  if (hand.active && !wasActive) state.events.push(ev('gather', hand.x, hand.y, hand.charge));
  if (!hand.active && wasActive) state.events.push(ev('release', hand.x, hand.y, hand.charge));
  if (!hand.active) hand.charge = Math.max(0, hand.charge - RELEASE_DRAIN * dt);

  // ---- Motes -----------------------------------------------------------------
  driftMotes(state, dt, hand.active);

  // ---- Light -----------------------------------------------------------------
  for (let i = 0; i < grid.length; i++) grid[i] = Math.max(0, grid[i] - LIGHT_DECAY * dt);
  const rCells = HAND_RADIUS_MIN + HAND_RADIUS_GROW * hand.charge;
  hand.radius = cellsToX(rCells);
  if (hand.active || hand.charge > 0) {
    const level = hand.active ? HAND_GLOW_MIN + (1 - HAND_GLOW_MIN) * hand.charge : hand.charge;
    const cx = hand.x * gw - 0.5;
    const cy = hand.y * gh - 0.5;
    const x0 = Math.max(0, Math.floor(cx - rCells));
    const x1 = Math.min(gw - 1, Math.ceil(cx + rCells));
    const y0 = Math.max(0, Math.floor(cy - rCells));
    const y1 = Math.min(gh - 1, Math.ceil(cy + rCells));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x - cx, y - cy) / rCells;
        if (d >= 1) continue;
        const v = level * (1 - d * d);
        const i = y * gw + x;
        if (v > grid[i]) grid[i] = v;
      }
    }
  }

  // ---- Coverage and completion --------------------------------------------------
  let lit = 0;
  for (let i = 0; i < grid.length; i++) if (grid[i] >= LIT_LEVEL) lit++;
  state.coverage = lit / grid.length;
  const step = Math.floor(state.coverage / REVEAL_STEP);
  if (step > state.bestReveal) {
    state.bestReveal = step;
    state.events.push(ev('reveal', hand.x, hand.y, Math.min(1, state.coverage / COVERAGE_TARGET)));
  }
  state.progress = Math.max(state.progress, Math.min(1, state.coverage / COVERAGE_TARGET) * 0.9);
  if (state.coverage >= COVERAGE_TARGET) state.holdTime += dt;
  else state.holdTime = 0;
  if (state.holdTime >= HOLD_TO_DIVIDE) {
    state.complete = true;
    state.progress = 1;
    hand.active = false;
    state.events.push(ev('divide', 0.5, 0.5, 1));
  }
}

function driftMotes(state, dt, gathering) {
  const { hand, rng } = state;
  for (const m of state.motes) {
    m.phase += dt * 0.7;
    let vx = Math.cos(m.phase) * MOTE_DRIFT;
    let vy = Math.sin(m.phase * 0.8) * MOTE_DRIFT;
    if (gathering) {
      const dx = hand.x - m.x;
      const dy = hand.y - m.y;
      const d = Math.hypot(dx, dy);
      if (d < ABSORB_RADIUS) {
        // Absorbed: the hand grows brighter; the mote is reborn elsewhere in the dark, away from the hand.
        // (Edge respawn starved the middle of the deep: found in the Run 02 browser playtest.)
        state.hand.charge = Math.min(1, state.hand.charge + MOTE_CHARGE * m.glow);
        respawnAway(m, hand, state.grid, state.gw, state.gh, rng);
        continue;
      }
      if (d < GATHER_RADIUS && d > 0) {
        const pull = GATHER_PULL * (1 - d / GATHER_RADIUS) + 0.1;
        vx += (dx / d) * pull;
        vy += (dy / d) * pull;
      }
    }
    m.x += vx * dt;
    m.y += vy * dt;
    if (m.x < 0) m.x += 1;
    if (m.x > 1) m.x -= 1;
    if (m.y < 0) m.y += 1;
    if (m.y > 1) m.y -= 1;
  }
}

function respawnAway(m, hand, grid, gw, gh, rng) {
  // Prefer dark cells far from the hand: light is reborn where it is still needed.
  for (let tries = 0; tries < 8; tries++) {
    const x = rng();
    const y = rng();
    if (Math.hypot(x - hand.x, y - hand.y) < RESPAWN_MIN_DIST) continue;
    const cell = Math.min(gh - 1, Math.floor(y * gh)) * gw + Math.min(gw - 1, Math.floor(x * gw));
    if (grid[cell] < LIT_LEVEL || tries === 7) {
      m.x = x;
      m.y = y;
      break;
    }
  }
  m.glow = 0.3 + rng() * 0.7;
}

function cellsToX(cells) {
  return cells / GRID_W;
}

function ev(type, x, y, strength) {
  return { type, x, y, strength: Math.max(0, Math.min(1, strength)) };
}
