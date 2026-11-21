// Brain lane: wires engine, gameplay, art and audio together.
// Keep this file thin. Logic belongs in the lanes, not here.

import { createLoop } from './engine/loop.js';
import { createInput } from './engine/input.js';
import { createRng, hashSeed } from './engine/rng.js';
import { createWorld, generateIsland, applyBrush, landRatio } from './gameplay/world.js';
import { createRenderer } from './art/renderer.js';
import { createAudio } from './audio/audio.js';

// ---- Tuning ----------------------------------------------------------------
const WORLD_W = 192;
const WORLD_H = 120;
const BRUSH_MIN = 2;
const BRUSH_MAX = 16;
const BRUSH_START = 6;
const SHAPE_RATE = 0.9;        // elevation change per second at the brush centre
const AMBIENCE_EVERY_S = 0.5;  // how often sound re-reads the world state

const params = new URLSearchParams(location.search);
const seed = params.has('seed') ? hashSeed(params.get('seed')) : hashSeed('run-01');

const canvas = document.getElementById('game');
const world = generateIsland(createWorld(WORLD_W, WORLD_H, seed));
const rng = createRng(seed ^ 0x9e3779b9);
const input = createInput(canvas);
const renderer = createRenderer(canvas, world);
const audio = createAudio();

const hand = { x: WORLD_W / 2, y: WORLD_H / 2, radius: BRUSH_START, mode: 'idle' };
let followersApi = null; // set when Codex's followers.js exists (task F-04)
let followers = null;
let showStats = false;
let ambienceTimer = 0;
let time = 0;

// Optional lane: load followers if the module has landed. Until then the game runs without them.
import('./gameplay/followers.js')
  .then((mod) => {
    followersApi = mod;
    followers = mod.createFollowers(world, rng);
  })
  .catch(() => {
    console.info('[hand-of-god] followers.js not present yet (task F-04), running without followers.');
  });

renderer.resize();
window.addEventListener('resize', () => renderer.resize());
const unlock = () => audio.unlock();
canvas.addEventListener('pointerdown', unlock);
window.addEventListener('keydown', unlock);

const loop = createLoop({
  update(dt) {
    time += dt;
    if (input.pressed('KeyM')) audio.toggleMute();
    if (input.pressed('Backquote') || input.pressed('F3')) showStats = !showStats;
    if (input.pressed('KeyR')) {
      world.seed = Math.floor(rng() * 4294967296) >>> 0;
      generateIsland(world);
      if (followersApi) followers = followersApi.createFollowers(world, rng);
    }

    const wheel = input.consumeWheel();
    if (wheel) hand.radius = Math.min(BRUSH_MAX, Math.max(BRUSH_MIN, hand.radius - wheel));
    if (input.pressed('BracketLeft')) hand.radius = Math.max(BRUSH_MIN, hand.radius - 1);
    if (input.pressed('BracketRight')) hand.radius = Math.min(BRUSH_MAX, hand.radius + 1);

    const p = renderer.screenToWorld(input.x, input.y);
    hand.x = p.x;
    hand.y = p.y;
    const dir = input.secondary ? -1 : input.primary ? 1 : 0;
    hand.mode = dir > 0 ? 'raise' : dir < 0 ? 'lower' : 'idle';
    if (dir !== 0 && input.inside) {
      const changed = applyBrush(world, hand.x, hand.y, hand.radius, dir * SHAPE_RATE * dt);
      audio.shape(changed > 0 ? dir : 0, hand.radius / BRUSH_MAX);
    } else {
      audio.shape(0, 0);
    }

    if (followersApi && followers) followersApi.stepFollowers(followers, world, rng, dt);

    ambienceTimer += dt;
    if (ambienceTimer >= AMBIENCE_EVERY_S) {
      ambienceTimer = 0;
      audio.ambience(landRatio(world));
    }
  },
  render() {
    const s = loop.stats;
    renderer.render({
      time,
      hand: input.inside ? hand : null,
      followers,
      hud: {
        belief: followers ? followers.belief : undefined,
        power: hand.mode === 'lower' ? 'Lower land' : 'Raise land',
        fps: showStats
          ? `${s.fps.toFixed(0)} fps · ${s.frameMs.toFixed(1)} ms (sim ${s.updateMs.toFixed(1)} / draw ${s.renderMs.toFixed(1)})`
          : undefined,
      },
    });
  },
});

loop.start();
// Exposed for debugging and automated smoke tests. Not part of the game API.
window.__handOfGod = { world, hand, loop, audio, get followers() { return followers; } };
