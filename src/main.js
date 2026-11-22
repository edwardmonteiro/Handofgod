// Brain lane: the stage sequencer (B-12, contracts v2). It wires engine, gameplay, art and audio together.
// Flow: title card -> (verse card -> stage -> resolution) for each stage in order -> end card.
// Keep this file thin. Logic belongs in the stage modules, drawing in src/art, sound in src/audio.

import { createLoop } from './engine/loop.js';
import { createInput } from './engine/input.js';
import { hashSeed } from './engine/rng.js';
import { createPost } from './art/post.js';
import { drawCard } from './art/cards.js';
import { grey, NOIR } from './art/palette.js';
import { createAudio } from './audio/audio.js';
import { TITLE, CARDS, END, MISSING } from './content/genesis1.js';

// ---- Tuning ----------------------------------------------------------------
const params = new URLSearchParams(location.search);
// D-14 (owner-confirmed through Instinct): the game is character traversal, so the traversal slice is the default.
// ?slice=light keeps the archived disembodied-hand prototype playable for reference. The Firmament and Land hand stages
// were superseded and are no longer probed, so the four optional 404s are gone.
const SLICES = { traverse: ['traverse', 'beam'], light: ['light'] };
const STAGE_IDS = SLICES[params.get('slice')] || SLICES.traverse;
const CARD_MIN_S = 2.5;     // a verse card can be skipped after this long
const CARD_AUTO_S = 9;      // ...and advances by itself after this long
const RESOLVE_HOLD_S = 3.5; // time on a completed stage before moving on
const FADE_S = 0.8;

const seed = params.has('seed') ? hashSeed(params.get('seed')) : hashSeed('genesis-1');

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const post = createPost();
const audio = createAudio();
const view = { w: 1, h: 1, dpr: 1 };

/** Loads a stage's logic and art. Missing modules are expected while the team builds them. */
async function loadStage(id) {
  const [logic, art] = await Promise.all([
    import(`./gameplay/stages/${id}.js`).catch((err) => report(id, 'logic', err)),
    import(`./art/stages/${id}.js`).catch((err) => report(id, 'art', err)),
  ]);
  return logic ? { id, logic, art } : { id, missing: true };
}
function report(id, part, err) {
  const missing = /Failed to fetch dynamically imported module|Cannot find module|404|Importing a module script failed/i.test(String(err && err.message));
  if (missing) console.info(`[hand-of-god] stage "${id}" ${part} not built yet.`);
  else console.error(`[hand-of-god] stage "${id}" ${part} failed to load:`, err);
  return null;
}

// ---- Sequencer state -------------------------------------------------------------
const stages = STAGE_IDS.map((id) => ({ id, loading: loadStage(id), mod: null }));
let mode = 'title';     // 'title' | 'card' | 'play' | 'end'
let index = -1;
let modeTime = 0;
let state = null;       // current stage state
let resolvedFor = 0;
let showStats = false;
let time = 0;

function scene(id) {
  if (typeof audio.scene === 'function') audio.scene(id);
}

let advancing = false;
async function next() {
  // Guard: loading is async; don't let the loop call next() again or render a stage that isn't ready.
  if (advancing) return;
  advancing = true;
  const target = index + 1;
  if (target < stages.length) {
    const s = stages[target];
    s.mod = s.mod || (await s.loading);
  }
  index = target;
  modeTime = 0;
  mode = index >= stages.length ? 'end' : 'card';
  advancing = false;
  // Spaces without a card follow straight on, so the journey stays continuous.
  if (mode === 'card' && !stages[index].mod.missing && !CARDS[stages[index].id]) {
    startStage();
    return;
  }
  scene('card');
}

function startStage() {
  const s = stages[index];
  modeTime = 0;
  if (s.mod.missing) {
    next();
    return;
  }
  state = s.mod.logic.createStage((seed + index * 7919) >>> 0);
  resolvedFor = 0;
  mode = 'play';
  scene((s.mod.logic.meta && s.mod.logic.meta.scene) || s.id);
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  view.dpr = dpr;
  canvas.width = Math.floor(canvas.clientWidth * dpr);
  canvas.height = Math.floor(canvas.clientHeight * dpr);
  view.w = canvas.width;
  view.h = canvas.height;
}
resize();
window.addEventListener('resize', resize);
const unlock = () => audio.unlock();
canvas.addEventListener('pointerdown', unlock);
window.addEventListener('keydown', unlock);

const loop = createLoop({
  update(dt) {
    time += dt;
    modeTime += dt;
    if (input.pressed('KeyM')) audio.toggleMute();
    if (input.pressed('Backquote') || input.pressed('F3')) showStats = !showStats;
    // Cards advance on tap, Space or Enter. During play, keys belong to the stage (Space = jump).
    const tapped = input.consumeTap(); // always consumed, so a tap during play doesn't leak into the next card
    const tap = mode !== 'play' && (tapped || input.pressed('Space') || input.pressed('Enter'));
    const skip = input.pressed('KeyN'); // developer shortcut: skip to the next stage

    if (mode === 'title') {
      if (tap && modeTime > 0.6) next();
    } else if (mode === 'card') {
      if ((tap && modeTime > CARD_MIN_S) || modeTime > CARD_AUTO_S) startStage();
    } else if (mode === 'play') {
      const s = stages[index];
      const intent = input.readIntent();
      s.mod.logic.stepStage(state, intent, dt);
      if (state.events.length && typeof audio.stageEvent === 'function') {
        for (const e of state.events) audio.stageEvent(e.type, e.x * 2 - 1, e.strength);
      }
      if (state.complete) resolvedFor += dt;
      if (resolvedFor > RESOLVE_HOLD_S || skip) next();
    } else if (mode === 'end') {
      if (tap && modeTime > 3) {
        index = -1;
        mode = 'title';
        modeTime = 0;
      }
    }
  },
  render() {
    const card = currentCard();
    if (card) {
      drawCard(ctx, view, card);
    } else if (mode === 'play') {
      const s = stages[index];
      if (s.mod.art) s.mod.art.drawStage(ctx, state, view, time);
      else drawFallback(state);
      const fadeIn = Math.min(1, modeTime / FADE_S);
      const fadeOut = state.complete ? Math.max(0, (resolvedFor - (RESOLVE_HOLD_S - FADE_S)) / FADE_S) : 0;
      const black = Math.max(1 - fadeIn, fadeOut);
      if (black > 0) {
        ctx.fillStyle = grey(0, black);
        ctx.fillRect(0, 0, view.w, view.h);
      }
    }
    post.apply(ctx, view, time);
    if (showStats) drawStats();
  },
});

function currentCard() {
  const t = modeTime;
  if (mode === 'title') return { ...TITLE, t };
  if (mode === 'end') return { ...END, t };
  if (mode === 'card') {
    const s = stages[index];
    const base = s.mod && s.mod.missing ? MISSING(s.id) : CARDS[s.id];
    return { ...base, t, out: Math.max(0, (t - (CARD_AUTO_S - FADE_S)) / FADE_S) };
  }
  return null;
}

/** Used when a stage's logic exists but its renderer hasn't landed yet. */
function drawFallback(st) {
  ctx.fillStyle = grey(NOIR.void);
  ctx.fillRect(0, 0, view.w, view.h);
  ctx.fillStyle = grey(NOIR.lit, 0.6);
  ctx.fillRect(view.w * 0.3, view.h * 0.5, view.w * 0.4 * (st.progress || 0), Math.max(2, view.dpr * 2));
}

function drawStats() {
  const s = loop.stats;
  ctx.font = `${12 * view.dpr}px monospace`;
  ctx.fillStyle = grey(NOIR.lit, 0.8);
  ctx.textAlign = 'left';
  ctx.fillText(
    `${s.fps.toFixed(0)} fps · ${s.frameMs.toFixed(1)} ms (sim ${s.updateMs.toFixed(1)} / draw ${s.renderMs.toFixed(1)}) · ${mode}${index >= 0 && stages[index] ? ':' + stages[index].id : ''}`,
    10 * view.dpr,
    18 * view.dpr,
  );
}

loop.start();
// Exposed for debugging and automated smoke tests. Not part of the game API.
window.__handOfGod = {
  loop,
  audio,
  get mode() { return mode; },
  get stage() { return index >= 0 && stages[index] ? stages[index].id : null; },
  get state() { return state; },
};
