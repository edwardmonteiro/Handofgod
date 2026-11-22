// Traversal space 2 renderer (A-06): the bridge that exists only in light. Monochrome noir (art bible v2).
// The chasm is pure black. Planks over it are ghost outlines in the dark and solid pale wood inside the lamp's circle.
// The lamp-stone is the key light of the scene.

import { grey, NOIR } from '../palette.js';
import { drawHero, hills } from './traverse.js';

const GROUND_Y = 0.7;
let camX = null;
let seenFalls = 0;
let fallFade = 0;     // 1 → 0 after a respawn: a brief dip to black so the reset doesn't snap
let lastTime = 0;

export function drawStage(ctx, state, view, time) {
  const { w, h, dpr } = view;
  const { level, hero, lamp } = state;
  const scale = w / level.viewW;
  const target = Math.max(0, Math.min(level.w - level.viewW, hero.x - level.viewW * 0.4));
  camX = camX === null || Math.abs(target - camX) > level.viewW ? target : camX + (target - camX) * 0.08;
  const sx = (x) => (x - camX) * scale;
  const sy = (y) => h * GROUND_Y - y * scale;

  // Sky: darker than space 1, the fog hangs low
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, grey(0.04));
  sky.addColorStop(0.6, grey(0.15));
  sky.addColorStop(1, grey(0.03));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  hills(ctx, w, h, camX * scale * 0.25, 0.48, grey(0.09), scale, 0.02, 3);

  // Lamp light: a warm-less white circle (monochrome) that defines the playable space
  const lx = sx(lamp.x + lamp.w / 2);
  const ly = sy(lamp.y + lamp.h * 0.6);
  const flick = 1 + 0.04 * Math.sin(time * 11) + 0.03 * Math.sin(time * 23);
  const rr = lamp.radius * scale * flick;
  const glow = ctx.createRadialGradient(lx, ly, 0, lx, ly, rr * 1.15);
  glow.addColorStop(0, grey(NOIR.divine, 0.42));
  glow.addColorStop(0.6, grey(NOIR.lit, 0.12));
  glow.addColorStop(1, grey(0, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(lx - rr * 1.2, ly - rr * 1.2, rr * 2.4, rr * 2.4);

  // Ground and boundaries
  ctx.fillStyle = grey(0.025);
  for (const s of level.solids) ctx.fillRect(sx(s.x), sy(s.y + s.h), s.w * scale, s.h * scale);
  ctx.fillStyle = grey(0.3, 0.45);
  for (const s of level.solids) if (s.w > 2) ctx.fillRect(sx(s.x), sy(s.y + s.h), s.w * scale, Math.max(1, dpr));
  // The chasm below the planks: true black, deeper than the ground
  const cx0 = sx(level.planks[0].x);
  const cx1 = sx(level.planks[level.planks.length - 1].x + 0.5);
  ctx.fillStyle = grey(0.005);
  ctx.fillRect(cx0, sy(0), cx1 - cx0, h);

  // Planks: ghost outlines in the dark, solid where lit
  for (const p of level.planks) {
    const px = sx(p.x) + 1;
    const py = sy(p.y + p.h);
    const pw = p.w * scale - 2;
    const ph = Math.max(2, p.h * scale);
    if (p.lit > 0.01) {
      ctx.fillStyle = grey(0.18 + 0.4 * p.lit, Math.min(1, p.lit * 1.4));
      ctx.fillRect(px, py, pw, ph);
    }
    ctx.strokeStyle = grey(0.5, 0.06 + 0.1 * (0.5 + 0.5 * Math.sin(time * 1.5 + p.x)));
    ctx.lineWidth = Math.max(1, dpr * 0.5);
    ctx.strokeRect(px, py, pw, ph);
  }

  // Exit slit of light
  const ex = level.exit;
  ctx.fillStyle = grey(NOIR.divine, 0.85);
  ctx.fillRect(sx(ex.x + ex.w * 0.35), sy(ex.y + ex.h), ex.w * 0.3 * scale, ex.h * scale);

  // The lamp-stone
  const bx = sx(lamp.x);
  const by = sy(lamp.y + lamp.h);
  ctx.fillStyle = grey(0.07);
  ctx.fillRect(bx, by, lamp.w * scale, lamp.h * scale);
  ctx.fillStyle = grey(NOIR.divine, 0.85 * flick);
  ctx.beginPath();
  ctx.arc(bx + lamp.w * scale / 2, by + lamp.h * scale * 0.4, lamp.w * scale * 0.16, 0, Math.PI * 2);
  ctx.fill();

  const near = Math.max(0, 1 - Math.abs(hero.x + hero.w / 2 - (lamp.x + lamp.w / 2)) / lamp.radius);
  drawHero(ctx, hero, sx(hero.x), sy(hero.y), scale, time, near);

  if (state.resolve > 0) {
    ctx.fillStyle = grey(NOIR.divine, Math.min(0.85, state.resolve * 0.9));
    ctx.fillRect(0, 0, w, h);
  }

  // Respawn fade
  const dt = Math.max(0, Math.min(0.1, time - lastTime));
  lastTime = time;
  if ((state.falls || 0) < seenFalls) seenFalls = 0; // a new stage instance
  if ((state.falls || 0) > seenFalls) {
    seenFalls = state.falls;
    fallFade = 1;
    camX = null; // snap the camera back with the hero
  }
  if (fallFade > 0) {
    ctx.fillStyle = grey(0, Math.min(1, fallFade * 1.3));
    ctx.fillRect(0, 0, w, h);
    fallFade = Math.max(0, fallFade - dt / 0.6);
  }
}
