// Traversal space 2 (G-10): "the bridge that exists only in light". Pure logic: no DOM, no audio.
// Contracts v2 stage shape with v3 traversal intent (moveX, jump).
//
// Beat sheet: a chasm far too wide to jump. Ghostly planks hang over it, but only planks inside a circle of light
// are solid. A lamp-stone sits on the near side. Push it to the edge and the first planks firm up. Keep pushing,
// and you cross the void inside the circle of light you push. Step back out of the light and you fall
// (you respawn at the start of the space).
// Mechanics only: no narrative or Genesis interpretation is implied (per Instinct's note on issue #14).
//
// Render-facing state (src/art/stages/beam.js):
//   level  { w, viewW, solids, planks: [{x, y, w, h, lit (0..1)}], exit, voidY }
//   hero   { x, y, w, h, grounded, facing, walk, pushing }   (same shape as traverse.js)
//   lamp   { x, y, w, h, radius }                              (the light radius in metres)
//   resolve 0..1 after reaching the exit

export const meta = { id: 'beam', order: 2, scene: 'traverse', verse: 'unassigned', title: 'The bridge of light' }; // no passage chosen (G-10 open question)

// ---- Tuning ----------------------------------------------------------------
export const GRAVITY = 26;
export const RUN_SPEED = 4.2;
export const PUSH_SPEED_FACTOR = 0.5;
export const JUMP_SPEED = 9;          // the jump covers ≈ 2.9 m when running: the 6 m chasm can't be jumped
export const LIGHT_RADIUS = 3;        // planks within this distance of the lamp's centre are solid
export const PLANK_W = 0.5;
export const COYOTE_S = 0.1;
export const JUMP_BUFFER_S = 0.12;
export const STEP_INTERVAL_S = 0.34;
export const RESOLVE_SECONDS = 3;
const LAND_EVENT_SPEED = 4;
const VOID_Y = -8;                    // falling below this respawns
const CHASM_X0 = 12;
const CHASM_X1 = 18;

function buildLevel() {
  const planks = [];
  for (let x = CHASM_X0; x < CHASM_X1 - 1e-6; x += PLANK_W) planks.push({ x, y: -0.2, w: PLANK_W, h: 0.2, lit: 0 });
  return {
    w: 28,
    viewW: 16,
    voidY: VOID_Y,
    solids: [
      { x: -1, y: -12, w: CHASM_X0 + 1, h: 12 }, // near ground (top at y=0), deep enough to fill the screen
      { x: CHASM_X1, y: -12, w: 11, h: 12 },     // far ground
      { x: -2, y: -2, w: 1, h: 12 },             // left boundary
      { x: 28, y: -2, w: 1, h: 12 },             // right boundary
    ],
    planks,
    exit: { x: 25, y: 0, w: 1.2, h: 2.6 },
  };
}

const HERO_START = { x: 1.5, y: 0 };
const LAMP_START = { x: 6, y: 0 };

export function createStage() {
  return {
    level: buildLevel(),
    hero: { x: HERO_START.x, y: HERO_START.y, w: 0.55, h: 1.15, vx: 0, vy: 0, grounded: true, facing: 1, walk: 0, pushing: false },
    lamp: { x: LAMP_START.x, y: LAMP_START.y, w: 0.9, h: 0.9, vy: 0, radius: LIGHT_RADIUS },
    coyote: 0,
    jumpBuffer: 0,
    stepTimer: 0,
    wasPushing: false,
    litCount: 0,
    falls: 0,
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
  const { hero, lamp, level } = state;
  if (state.complete) {
    state.resolve = Math.min(1, state.resolve + dt / RESOLVE_SECONDS);
    return;
  }

  // ---- Light: which planks are solid this step --------------------------------------
  const lampCx = lamp.x + lamp.w / 2;
  let lit = 0;
  const litPlanks = [];
  for (const p of level.planks) {
    const d = Math.abs(p.x + p.w / 2 - lampCx);
    const on = d < LIGHT_RADIUS && lamp.y > VOID_Y / 2;
    p.lit = on ? Math.max(p.lit, 1 - d / LIGHT_RADIUS) : Math.max(0, p.lit - dt * 4); // fades out quickly
    if (on) {
      lit++;
      litPlanks.push(p);
    }
  }
  if (lit > state.litCount && lamp.x + lamp.w > CHASM_X0 - LIGHT_RADIUS) {
    state.events.push(ev(state, 'light', Math.min(1, lit / 12)));
  }
  state.litCount = lit;
  const world = level.solids.concat(litPlanks);

  // ---- Intent and jump ---------------------------------------------------------------
  const move = Math.max(-1, Math.min(1, intent.moveX || 0));
  if (move !== 0) hero.facing = move > 0 ? 1 : -1;
  state.jumpBuffer = intent.jump ? JUMP_BUFFER_S : Math.max(0, state.jumpBuffer - dt);
  state.coyote = hero.grounded ? COYOTE_S : Math.max(0, state.coyote - dt);
  if (state.jumpBuffer > 0 && state.coyote > 0) {
    hero.vy = JUMP_SPEED;
    hero.grounded = false;
    state.coyote = 0;
    state.jumpBuffer = 0;
    state.events.push(ev(state, 'jump', 0.6));
  }

  // ---- Horizontal: walk, maybe push the lamp ------------------------------------------
  let dx = move * RUN_SPEED * dt;
  hero.pushing = false;
  if (dx !== 0 && hero.grounded) {
    const probe = { x: hero.x + dx, y: hero.y, w: hero.w, h: hero.h };
    const beside = hero.y < lamp.y + lamp.h - 0.05 && hero.y + hero.h > lamp.y + 0.05;
    if (beside && overlaps(probe, lamp)) {
      const before = lamp.x;
      moveX(lamp, dx * PUSH_SPEED_FACTOR, level.solids);
      dx = lamp.x - before;
      hero.pushing = Math.abs(dx) > 1e-6;
    }
  }
  if (hero.pushing && !state.wasPushing) state.events.push(ev(state, 'push', 0.7));
  state.wasPushing = hero.pushing;
  moveX(hero, dx, world.concat([lamp]));
  hero.vx = dx / dt;

  // ---- Vertical ---------------------------------------------------------------------
  const fallSpeed = -hero.vy;
  hero.vy -= GRAVITY * dt;
  const vHit = moveY(hero, hero.vy * dt, world.concat([lamp]));
  const wasGrounded = hero.grounded;
  if (vHit && hero.vy < 0) {
    hero.grounded = true;
    if (!wasGrounded && fallSpeed > LAND_EVENT_SPEED) state.events.push(ev(state, 'land', Math.min(1, fallSpeed / 12)));
    hero.vy = 0;
  } else {
    if (vHit && hero.vy > 0) hero.vy = 0;
    hero.grounded = isSupported(hero, world.concat([lamp]));
  }
  // The lamp rests on solid ground or on the planks it lights itself.
  lamp.vy -= GRAVITY * dt;
  if (moveY(lamp, lamp.vy * dt, world)) lamp.vy = 0;

  // ---- The void --------------------------------------------------------------------
  if (hero.y < VOID_Y) {
    state.falls++;
    state.events.push(ev(state, 'fall', 1));
    Object.assign(hero, { x: HERO_START.x, y: HERO_START.y, vx: 0, vy: 0, grounded: true });
  }
  if (lamp.y < VOID_Y) Object.assign(lamp, { x: LAMP_START.x, y: LAMP_START.y, vy: 0 });

  // ---- Footsteps ----------------------------------------------------------------------
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

  // ---- Progress and the exit ------------------------------------------------------------
  state.progress = Math.max(state.progress, Math.min(0.9, (hero.x / level.exit.x) * 0.9));
  if (overlaps(hero, level.exit)) {
    state.complete = true;
    state.progress = 1;
    state.events.push(ev(state, 'reach', 1));
  }
}

function isSupported(body, solids) {
  const foot = { x: body.x + 0.02, y: body.y - 0.03, w: body.w - 0.04, h: 0.03 };
  return solids.some((s) => s !== body && overlaps(foot, s));
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

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

function ev(state, type, strength) {
  const { hero, level } = state;
  return {
    type,
    x: Math.max(0, Math.min(1, (hero.x + hero.w / 2) / level.w)),
    y: Math.max(0, Math.min(1, 0.72 - hero.y / 9)),
    strength: Math.max(0, Math.min(1, strength)),
  };
}
