// The world: a heightmap island the divine hand can reshape.
// Pure module: no DOM, so it can be tested in Node.

import { createRng } from '../engine/rng.js';
import { createNoise2D, fbm } from '../engine/noise.js';

// ---- Tuning ----------------------------------------------------------------
// Float32-exact so that comparisons against the Float32Array heightmap agree:
// a cell set to SEA_LEVEL is land (flagged by Codex in F-01 / F-05).
export const SEA_LEVEL = Math.fround(0.42);
const NOISE_SCALE = 0.045;   // lower = bigger landmasses
const ISLAND_FALLOFF = 1.35; // higher = the island hugs the centre more
const ISLAND_LIFT = 0.18;    // raises the centre so there is always an island
const TERRAIN_BANDS = [
  // [upper elevation bound, terrain]
  [0.30, 'deep'],
  [SEA_LEVEL, 'shallow'],
  [0.47, 'sand'],
  [0.62, 'grass'],
  [0.74, 'forest'],
  [0.88, 'rock'],
  [Infinity, 'snow'],
];

export function createWorld(w, h, seed) {
  return { w, h, seed: seed >>> 0, elev: new Float32Array(w * h) };
}

/** Fills the heightmap with a deterministic island shaped by the world seed. */
export function generateIsland(world) {
  const { w, h, elev } = world;
  const noise = createNoise2D(createRng(world.seed));
  // Max(…, 0.5) keeps degenerate 1-wide maps finite (F-05 finding #4).
  const cx = Math.max((w - 1) / 2, 0.5);
  const cy = Math.max((h - 1) / 2, 0.5);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = (x - cx) / cx;
      const ny = (y - cy) / cy;
      const d = Math.min(1, Math.sqrt(nx * nx + ny * ny));
      const n = fbm(noise, x * NOISE_SCALE, y * NOISE_SCALE, 5);
      const mask = 1 - Math.pow(d, ISLAND_FALLOFF);
      elev[y * w + x] = clamp01(n * mask + ISLAND_LIFT * mask);
    }
  }
  return world;
}

/** Raises (amount > 0) or lowers (amount < 0) land with a smooth falloff. Returns cells changed. */
export function applyBrush(world, cx, cy, radius, amount) {
  const { w, h, elev } = world;
  const r = Math.max(0.5, radius);
  const x0 = Math.max(0, Math.floor(cx - r));
  const x1 = Math.min(w - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r));
  const y1 = Math.min(h - 1, Math.ceil(cy + r));
  let changed = 0;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d2 = (dx * dx + dy * dy) / (r * r);
      if (d2 >= 1) continue;
      const falloff = (1 - d2) * (1 - d2); // smooth, no hard edge
      const i = y * w + x;
      const before = elev[i];
      const after = clamp01(before + amount * falloff);
      if (after !== before) {
        elev[i] = after;
        changed++;
      }
    }
  }
  return changed;
}

export function elevationAt(world, x, y) {
  const ix = Math.min(world.w - 1, Math.max(0, Math.round(x)));
  const iy = Math.min(world.h - 1, Math.max(0, Math.round(y)));
  return world.elev[iy * world.w + ix];
}

export function terrainAt(world, x, y) {
  const e = elevationAt(world, x, y);
  for (const [bound, name] of TERRAIN_BANDS) if (e < bound) return name;
  return 'snow';
}

export function isLand(world, x, y) {
  return elevationAt(world, x, y) >= SEA_LEVEL;
}

export function landRatio(world) {
  const { elev } = world;
  let land = 0;
  for (let i = 0; i < elev.length; i++) if (elev[i] >= SEA_LEVEL) land++;
  return land / elev.length;
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
