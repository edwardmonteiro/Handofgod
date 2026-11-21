// Traversal prototype (G-09, Run 02): the smallest slice of the character direction relayed on issue #14.
// Pure logic: no DOM, no audio. It uses the contracts v2 stage shape, with the v3-proposal intent fields
// moveX, jump and act.
//
// Beat sheet: walk through the dark → a ledge too high to jump blocks the way (readable: you bump it and
// fall short) → a stone block sits nearby → push it against the ledge (the world changes) → climb onto it,
// jump up → walk on to the light of the exit.
// Original design: a generic side-view puzzle beat. No character, art or level copied from any existing game.
//
// Units: metres, y up, bodies anchored at the bottom-left. Render-facing state (src/art/stages/traverse.js):
//   level  { w, viewW, solids: [{x,y,w,h}], exit: {x, y, w, h} }
//   hero   { x, y, w, h, vx, vy, grounded, facing (-1|1), walk (phase), pushing }
//   block  { x, y, w, h }
//   resolve 0..1 after reaching the exit

export const meta = { id: 'traverse', order: 1, verse: 'Genesis 1:2', title: 'Darkness on the face of the deep' };

// ---- Tuning ----------------------------------------------------------------
export const GRAVITY = 26;
export const RUN_SPEED = 4.2;
export const PUSH_SPEED_FACTOR = 0.45;
export const JUMP_SPEED = 9;          // apex ≈ v²/2g ≈ 1.56 m: a bare jump can't reach the 2 m ledge
export const COYOTE_S = 0.1;
export const JUMP_BUFFER_S = 0.12;
export const STEP_INTERVAL_S = 0.34;
export const BLOCKED_COOLDOWN_S = 1.6;
export const RESOLVE_SECONDS = 3;
const LAND_EVENT_SPEED = 4;

const LEVEL = {
  w: 34,
  viewW: 16,
  solids: [
    { x: -1, y: -2, w: 16, h: 2 },   // ground, lower section (top at y=0)
    { x: 15, y: -2, w: 20, h: 4 },   // the ledge: raised ground from x=15 (top at y=2)
    { x: -2, y: -2, w: 1, h: 12 },   // left boundary
    { x: 34, y: -2, w: 1, h: 12 },   // right boundary
  ],
  exit: { x: 31, y: 2, w: 1.2, h: 2.6 },
};

export function createStage() {
  return {
    level: LEVEL,
    hero: { x: 2, y: 0, w: 0.55, h: 1.15, vx: 0, vy: 0, grounded: true, facing: 1, walk: 0, pushing: false },
    block: { x: 8, y: 0, w: 1.1, h: 1.1, vy: 0 },
    coyote: 0,
    jumpBuffer: 0,
    stepTimer: 0,
    blockedCooldown: 0,
    wasPushing: false,
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
  const { hero, block, level } = state;
  if (state.complete) {
    state.resolve = Math.min(1, state.resolve + dt / RESOLVE_SECONDS);
    hero.vx = 0;
    return;
  }
  state.blockedCooldown = Math.max(0, state.blockedCooldown - dt);

  // ---- Intent ---------------------------------------------------------------
  const move = Math.max(-1, Math.min(1, intent.moveX || 0));
  if (move !== 0) hero.facing = move > 0 ? 1 : -1;
  if (intent.jump) state.jumpBuffer = JUMP_BUFFER_S;
  else state.jumpBuffer = Math.max(0, state.jumpBuffer - dt);
  state.coyote = hero.grounded ? COYOTE_S : Math.max(0, state.coyote - dt);

  // ---- Jump -----------------------------------------------------------------
  if (state.jumpBuffer > 0 && state.coyote > 0) {
    hero.vy = JUMP_SPEED;
    hero.grounded = false;
    state.coyote = 0;
    state.jumpBuffer = 0;
    state.events.push(ev(state, 'jump', 0.6));
  }

  // ---- Horizontal: walk, maybe push the block ------------------------------------
  let dx = move * RUN_SPEED * dt;
  hero.pushing = false;
  if (dx !== 0 && hero.grounded) {
    const probe = { x: hero.x + dx, y: hero.y, w: hero.w, h: hero.h };
    const beside = hero.y < block.y + block.h - 0.05 && hero.y + hero.h > block.y + 0.05;
    if (beside && overlaps(probe, block)) {
      // Pushing: the block moves (slowly) unless something solid stops it.
      const want = dx * PUSH_SPEED_FACTOR;
      const before = block.x;
      moveX(block, want, level.solids);
      const moved = block.x - before;
      dx = moved; // the hero advances only as far as the block did
      hero.pushing = Math.abs(moved) > 1e-6;
      if (!hero.pushing) dx = 0;
    }
  }
  if (hero.pushing && !state.wasPushing) state.events.push(ev(state, 'push', 0.7));
  state.wasPushing = hero.pushing;

  const solids = level.solids.concat([block]);
  const wallHit = moveX(hero, dx, solids);
  hero.vx = dt > 0 ? dx / dt : 0;

  // Readable obstacle: walking into the ledge face while it's out of reach.
  if (wallHit && wallHit !== block && hero.grounded && move !== 0 && state.blockedCooldown === 0) {
    const top = wallHit.y + wallHit.h;
    if (top - hero.y > 1.5) {
      state.events.push(ev(state, 'blocked', Math.min(1, (top - hero.y) / 3)));
      state.blockedCooldown = BLOCKED_COOLDOWN_S;
    }
  }

  // ---- Vertical ---------------------------------------------------------------
  const fallSpeed = -hero.vy;
  hero.vy -= GRAVITY * dt;
  const vHit = moveY(hero, hero.vy * dt, solids);
  const wasGrounded = hero.grounded;
  if (vHit && hero.vy < 0) {
    hero.grounded = true;
    if (!wasGrounded && fallSpeed > LAND_EVENT_SPEED) state.events.push(ev(state, 'land', Math.min(1, fallSpeed / 12)));
    hero.vy = 0;
  } else {
    if (vHit && hero.vy > 0) hero.vy = 0; // bumped a ceiling
    hero.grounded = !!vHit && hero.vy <= 0 ? true : isSupported(hero, solids);
  }

  // The block falls too, if it's pushed off an edge.
  block.vy -= GRAVITY * dt;
  if (moveY(block, block.vy * dt, level.solids)) block.vy = 0;

  // ---- Footsteps ----------------------------------------------------------------
  if (hero.grounded && Math.abs(dx) > 0.001) {
    hero.walk += dt * (hero.pushing ? 5 : 10);
    state.stepTimer -= dt;
    if (state.stepTimer <= 0) {
      state.events.push(ev(state, 'step', hero.pushing ? 0.5 : 0.35));
      state.stepTimer = STEP_INTERVAL_S * (hero.pushing ? 1.6 : 1);
    }
  } else {
    state.stepTimer = 0;
  }

  // ---- Progress and the exit ------------------------------------------------------
  state.progress = Math.max(state.progress, Math.min(0.9, (hero.x / level.exit.x) * 0.9));
  if (overlaps(hero, level.exit)) {
    state.complete = true;
    state.progress = 1;
    state.events.push(ev(state, 'reach', 1));
  }
}

function isSupported(body, solids) {
  const foot = { x: body.x + 0.02, y: body.y - 0.03, w: body.w - 0.04, h: 0.03 };
  return solids.some((s) => overlaps(foot, s));
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Moves a body horizontally, stopping at the first solid. Returns the solid hit, or null. */
function moveX(body, dx, solids) {
  if (dx === 0) return null;
  body.x += dx;
  for (const s of solids) {
    if (s === body || !overlaps(body, s)) continue;
    body.x = dx > 0 ? s.x - body.w : s.x + s.w;
    return s;
  }
  return null;
}

function moveY(body, dy, solids) {
  if (dy === 0) return null;
  body.y += dy;
  for (const s of solids) {
    if (s === body || !overlaps(body, s)) continue;
    body.y = dy > 0 ? s.y - body.h : s.y + s.h;
    return s;
  }
  return null;
}

/** Stage events use normalised coordinates (contracts v2): x across the level, y down the view. */
function ev(state, type, strength) {
  const { hero, level } = state;
  return { type, x: (hero.x + hero.w / 2) / level.w, y: Math.max(0, Math.min(1, 0.72 - hero.y / 9)), strength };
}
