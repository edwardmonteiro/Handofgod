// Traversal prototype renderer (A-05). Side view, monochrome noir (art bible v2): the world is black silhouette
// against layered grey fog; the only bright thing is the light of the exit. Original art: a small cloaked
// figure drawn from simple shapes.

import { grey, NOIR } from '../palette.js';
import { createNoise2D, fbm } from '../../engine/noise.js';
import { createRng } from '../../engine/rng.js';

const GROUND_Y = 0.74;        // screen height fraction where y=0 sits
const noise = createNoise2D(createRng(0x7a5));
let camX = null;

export function drawStage(ctx, state, view, time) {
  const { w, h, dpr } = view;
  const { level, hero, block } = state;
  const scale = w / level.viewW;                 // pixels per metre
  const targetCam = Math.max(0, Math.min(level.w - level.viewW, hero.x - level.viewW * 0.4));
  camX = camX === null ? targetCam : camX + (targetCam - camX) * 0.08; // smooth follow
  const sx = (x) => (x - camX) * scale;
  const sy = (y) => h * GROUND_Y - y * scale;

  // ---- Sky: layered fog, lighter toward the horizon ----------------------------------
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, grey(0.07));
  sky.addColorStop(0.62, grey(0.24));
  sky.addColorStop(1, grey(0.1));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Exit glow bleeds into the fog, growing as you approach and flooding on arrival
  const ex = level.exit;
  const exCx = sx(ex.x + ex.w / 2);
  const exCy = sy(ex.y + ex.h * 0.5);
  const near = Math.max(0, 1 - Math.abs(hero.x - ex.x) / 18);
  const glowR = scale * (4 + 6 * near + 30 * (state.resolve || 0));
  const glow = ctx.createRadialGradient(exCx, exCy, 0, exCx, exCy, glowR);
  glow.addColorStop(0, grey(NOIR.divine, 0.55 + 0.4 * (state.resolve || 0)));
  glow.addColorStop(1, grey(NOIR.divine, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // ---- Parallax hills (two layers of silhouette) ---------------------------------------
  hills(ctx, w, h, camX * scale * 0.25, 0.5, grey(0.15), scale, 0.02, 3.2);
  hills(ctx, w, h, camX * scale * 0.5, 0.6, grey(0.09), scale, 0.035, 2.2);

  // ---- Solid world ----------------------------------------------------------------
  ctx.fillStyle = grey(0.025);
  for (const s of level.solids) ctx.fillRect(sx(s.x), sy(s.y + s.h), s.w * scale, s.h * scale);
  // A faint rim of light along walkable tops
  ctx.fillStyle = grey(0.32, 0.5);
  for (const s of level.solids) if (s.w > 2) ctx.fillRect(sx(s.x), sy(s.y + s.h), s.w * scale, Math.max(1, dpr));

  // ---- The exit: a slit of pure light ---------------------------------------------------
  ctx.fillStyle = grey(NOIR.divine, 0.9);
  ctx.fillRect(sx(ex.x + ex.w * 0.35), sy(ex.y + ex.h), ex.w * 0.3 * scale, ex.h * scale);

  // ---- The stone block ----------------------------------------------------------------
  const bx = sx(block.x);
  const by = sy(block.y + block.h);
  ctx.fillStyle = grey(0.06);
  ctx.fillRect(bx, by, block.w * scale, block.h * scale);
  ctx.strokeStyle = grey(0.28, 0.6);
  ctx.lineWidth = Math.max(1, dpr);
  ctx.strokeRect(bx + 0.5, by + 0.5, block.w * scale - 1, block.h * scale - 1);
  ctx.beginPath(); // a carved crack
  ctx.moveTo(bx + block.w * scale * 0.3, by);
  ctx.lineTo(bx + block.w * scale * 0.45, by + block.h * scale * 0.5);
  ctx.lineTo(bx + block.w * scale * 0.35, by + block.h * scale);
  ctx.stroke();

  // ---- The hero: a small cloaked figure ---------------------------------------------
  drawHero(ctx, hero, sx(hero.x), sy(hero.y), scale, time, near);

  // ---- Foreground fog band ---------------------------------------------------------------
  const fog = ctx.createLinearGradient(0, h * 0.78, 0, h);
  fog.addColorStop(0, grey(0.02, 0));
  fog.addColorStop(1, grey(0.02, 0.9));
  ctx.fillStyle = fog;
  ctx.fillRect(0, h * 0.78, w, h * 0.22);

  // Arrival: everything whitens
  if (state.resolve > 0) {
    ctx.fillStyle = grey(NOIR.divine, Math.min(0.85, state.resolve * 0.9));
    ctx.fillRect(0, 0, w, h);
  }
}

function drawHero(ctx, hero, x, y, scale, time, lightNear) {
  const W = hero.w * scale;
  const H = hero.h * scale;
  const swing = hero.grounded ? Math.sin(hero.walk) : 0.6;
  const lean = hero.pushing ? 0.18 * hero.facing : 0;
  ctx.save();
  ctx.translate(x + W / 2, y);
  ctx.transform(1, 0, -lean, 1, 0, 0);
  ctx.fillStyle = grey(0.015);
  // Legs
  const legW = W * 0.18;
  ctx.fillRect(-W * 0.2 + swing * W * 0.12, -H * 0.32, legW, H * 0.32);
  ctx.fillRect(W * 0.04 - swing * W * 0.12, -H * 0.32, legW, H * 0.32);
  // Cloak (a tapered body)
  ctx.beginPath();
  ctx.moveTo(-W * 0.42, -H * 0.3);
  ctx.lineTo(W * 0.42, -H * 0.3);
  ctx.lineTo(W * 0.26, -H * 0.8);
  ctx.lineTo(-W * 0.26, -H * 0.8);
  ctx.closePath();
  ctx.fill();
  // Hood
  ctx.beginPath();
  ctx.arc(hero.facing * W * 0.04, -H * 0.86, W * 0.3, 0, Math.PI * 2);
  ctx.fill();
  // A single pale point: the face catching the light, brighter as the exit nears
  ctx.fillStyle = grey(NOIR.lit, 0.35 + 0.5 * lightNear);
  ctx.beginPath();
  ctx.arc(hero.facing * W * 0.16, -H * 0.86, Math.max(1, W * 0.05), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  void time;
}

function hills(ctx, w, h, offset, baseFrac, fill, scale, freq, amp) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(0, h);
  const step = Math.max(4, Math.floor(w / 120));
  for (let px = 0; px <= w + step; px += step) {
    const n = fbm(noise, (px + offset) * freq / scale * 4, baseFrac * 10, 3);
    ctx.lineTo(px, h * baseFrac + h * 0.25 - n * amp * scale);
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
}
