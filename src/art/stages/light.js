// A-04 · Stage 1 renderer: "Let there be light". Monochrome only (art bible v2).
// The deep is a slow, rippled surface that exists only where light falls on it. The light grid is
// upsampled into a small offscreen buffer (smooth pools), multiplied by the deep's texture, then
// scaled to the screen. Motes are dust in a projector beam; the hand is the key light.

import { grey, NOIR } from '../palette.js';
import { createNoise2D, fbm } from '../../engine/noise.js';
import { createRng } from '../../engine/rng.js';

const BUF_W = 160;
const BUF_H = 90;

let buffer = null;
let bctx = null;
let image = null;
let texture = null; // Float32Array(BUF_W*BUF_H): the deep's surface relief, 0..1

function ensure() {
  if (buffer) return;
  buffer = document.createElement('canvas');
  buffer.width = BUF_W;
  buffer.height = BUF_H;
  bctx = buffer.getContext('2d');
  image = bctx.createImageData(BUF_W, BUF_H);
  const noise = createNoise2D(createRng(0x6e1));
  texture = new Float32Array(BUF_W * BUF_H);
  for (let y = 0; y < BUF_H; y++) {
    for (let x = 0; x < BUF_W; x++) texture[y * BUF_W + x] = fbm(noise, x * 0.06, y * 0.09, 4);
  }
}

export function drawStage(ctx, state, view, time) {
  ensure();
  const { w, h } = view;
  const { grid, gw, gh } = state;
  const data = image.data;
  const dawn = state.resolve || 0;

  // ---- The deep, lit by the grid ------------------------------------------------
  for (let y = 0; y < BUF_H; y++) {
    const gy = (y / BUF_H) * gh - 0.5;
    const y0 = Math.max(0, Math.floor(gy));
    const y1 = Math.min(gh - 1, y0 + 1);
    const ty = Math.min(1, Math.max(0, gy - y0));
    for (let x = 0; x < BUF_W; x++) {
      const gx = (x / BUF_W) * gw - 0.5;
      const x0 = Math.max(0, Math.floor(gx));
      const x1 = Math.min(gw - 1, x0 + 1);
      const tx = Math.min(1, Math.max(0, gx - x0));
      const top = grid[y0 * gw + x0] * (1 - tx) + grid[y0 * gw + x1] * tx;
      const bot = grid[y1 * gw + x0] * (1 - tx) + grid[y1 * gw + x1] * tx;
      let light = top * (1 - ty) + bot * ty;
      // Dawn: light floods in from the left as the stage resolves ("God divided the light from the darkness")
      if (dawn > 0) light = Math.max(light, smooth(dawn * 1.6 - x / BUF_W));
      const ripple = 0.5 + 0.5 * Math.sin(x * 0.21 + y * 0.07 + time * 0.8 + texture[y * BUF_W + x] * 6);
      const surface = 0.35 + 0.45 * texture[y * BUF_W + x] + 0.2 * ripple;
      const v = NOIR.void + Math.pow(light, 1.4) * surface * 0.92;
      const c = Math.min(255, v * 255);
      const p = (y * BUF_W + x) * 4;
      data[p] = data[p + 1] = data[p + 2] = c;
      data[p + 3] = 255;
    }
  }
  bctx.putImageData(image, 0, 0);
  ctx.fillStyle = grey(NOIR.void);
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(buffer, 0, 0, w, h);

  // ---- Motes: dust in the beam ----------------------------------------------
  const unit = Math.min(w, h);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const m of state.motes) {
    const tw = 0.6 + 0.4 * Math.sin(time * 3 + m.phase * 5);
    const r = unit * (0.002 + 0.003 * m.glow);
    ctx.fillStyle = grey(NOIR.divine, 0.25 + 0.6 * m.glow * tw);
    ctx.beginPath();
    ctx.arc(m.x * w, m.y * h, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // ---- The hand: the key light --------------------------------------------------
  const hand = state.hand;
  if (!state.complete) {
    const hx = hand.x * w;
    const hy = hand.y * h;
    const rr = Math.max(unit * 0.02, hand.radius * w);
    const strength = (hand.active ? 0.25 : 0.1) + 0.5 * hand.charge;
    const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, rr);
    g.addColorStop(0, grey(NOIR.divine, strength));
    g.addColorStop(0.35, grey(NOIR.lit, strength * 0.35));
    g.addColorStop(1, grey(0, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(hx, hy, rr, 0, Math.PI * 2);
    ctx.fill();
    // The point of the finger
    ctx.fillStyle = grey(NOIR.divine, hand.active ? 0.95 : 0.55);
    ctx.beginPath();
    ctx.arc(hx, hy, unit * (hand.active ? 0.006 : 0.004), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // ---- Progress: a thin horizon line that fills, never a HUD number -------------
  const p = Math.min(1, state.coverage / state.target);
  ctx.fillStyle = grey(NOIR.lit, 0.12);
  ctx.fillRect(w * 0.3, h * 0.9, w * 0.4, Math.max(1, view.dpr));
  ctx.fillStyle = grey(NOIR.divine, state.holdTime > 0 ? 0.9 : 0.5);
  ctx.fillRect(w * 0.3, h * 0.9, w * 0.4 * p, Math.max(1, view.dpr));
}

function smooth(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}
