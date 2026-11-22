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

// A-07 (Run 02): the character redrawn after owner feedback relayed on #14 ("deformed and square-like").
// A jointed figure: human proportions (head ≈ 1/7 of the height), two-segment arms and legs with round joints,
// far-side limbs a shade lighter so each limb reads separately, and a pose per state: idle breathing, a walk cycle
// with knee bend and opposite arm swing, a pushing lean with both hands forward, and a tucked jump.
// No specific identity or costume is implied. Physics box unchanged (hero.w × hero.h).
const NEAR = 0.012;  // near-side limbs and body (silhouette black)
const FAR = 0.085;   // far-side limbs: one step lighter, so arms and legs separate from the body

export function drawHero(ctx, hero, x, y, scale, time, lightNear) {
  const H = hero.h * scale;
  const W = hero.w * scale;
  const air = !hero.grounded;
  const pushing = !!hero.pushing && !air;
  const moving = Math.abs(hero.vx || 0) > 0.05 && !air;
  const p = hero.walk || 0;                       // walk phase (advanced by the gameplay module)
  const breathe = moving || air ? 0 : Math.sin(time * 2.2) * 0.006 * H;

  // Skeleton (y up from the feet, in pixels; x forward)
  const bob = moving ? -Math.abs(Math.sin(p)) * 0.022 * H + 0.011 * H : 0; // dips at full stride, rises when the legs pass
  const hipY = 0.5 * H + breathe * 0.5 + bob;
  const lean = pushing ? 0.24 : moving ? 0.07 : 0;          // forward lean of the torso, radians
  const torsoLen = 0.31 * H;
  const shoulder = { x: Math.sin(lean) * torsoLen, y: hipY + Math.cos(lean) * torsoLen + breathe };
  const neckLen = 0.045 * H;
  const headR = 0.072 * H;
  const head = { x: shoulder.x + Math.sin(lean) * (neckLen + headR), y: shoulder.y + Math.cos(lean) * (neckLen + headR) };

  // Limb angles, measured from straight down; positive = forward
  let legA, legB, armA, armB; // [upper, lower] for near (A) and far (B)
  if (air) {
    const rising = (hero.vy || 0) > 0;
    legA = [0.75, -1.25];  legB = [0.25, -0.85];
    armA = rising ? [2.5, 0.25] : [1.55, 0.35];   // rising: arms up; falling: spread for balance
    armB = rising ? [2.2, 0.3] : [-1.2, -0.3];
  } else if (pushing) {
    const s = Math.sin(p);
    legA = [-0.2 + s * 0.35, -0.15 - Math.max(0, -Math.cos(p)) * 0.5];
    legB = [-0.2 - s * 0.35, -0.15 - Math.max(0, Math.cos(p)) * 0.5];
    armA = [0.2, 1.3];  armB = [0.3, 1.2]; // elbows tucked low, forearms level: palms on the object's face
  } else if (moving) {
    const s = Math.sin(p);
    legA = [s * 0.48, -Math.max(0, Math.cos(p)) * 0.8 - 0.06 - Math.max(0, -s) * 0.18];
    legB = [-s * 0.48, -Math.max(0, -Math.cos(p)) * 0.8 - 0.06 - Math.max(0, s) * 0.18];
    armA = [-s * 0.42, 0.3 + Math.max(0, s) * 0.25];  armB = [s * 0.42, 0.3 + Math.max(0, -s) * 0.25]; // forearm bends more on the forward swing
  } else {
    legA = [0.11, -0.05];  legB = [-0.13, 0.02];   // feet apart: both legs read in silhouette
    armA = [0.16 + breathe * 0.01, 0.22];  armB = [-0.2, 0.14];   // arms slightly off the torso, gentle elbow bend
  }

  const thigh = 0.25 * H, shin = 0.25 * H, upperArm = 0.17 * H, foreArm = 0.165 * H;
  const legW = 0.088 * H, armW = 0.068 * H;   // slightly heavy so limbs read at gameplay scale (~90 px tall)
  const hipNear = { x: 0.012 * H, y: hipY };
  const hipFar = { x: -0.012 * H, y: hipY };

  ctx.save();
  ctx.translate(x + W / 2, y);
  ctx.scale(hero.facing < 0 ? -1 : 1, -1);   // y up, facing to +x
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Far side first: one shade lighter
  limb(ctx, hipFar, legB, thigh, shin, legW, FAR, lean * 0.15);
  foot(ctx, hipFar, legB, thigh, shin, legW, FAR);
  limb(ctx, shoulder, armB, upperArm, foreArm, armW, FAR, lean);

  // Body: a tapered torso along the spine (hips < waist-to-chest taper < rounded shoulders)
  const sp = (t, off) => ({
    x: hipNear.x + Math.sin(lean) * torsoLen * t + Math.cos(lean) * off,
    y: hipY + Math.cos(lean) * torsoLen * t - Math.sin(lean) * off,
  });
  const P = [ // [t along the spine, half-width]
    [0, 0.072], [0.3, 0.064], [0.72, 0.092], [0.93, 0.1],
  ];
  ctx.fillStyle = grey(NEAR);
  ctx.beginPath();
  let q = sp(P[0][0], -P[0][1] * H);
  ctx.moveTo(q.x, q.y);
  for (let i = 1; i < P.length; i++) { q = sp(P[i][0], -P[i][1] * H); ctx.lineTo(q.x, q.y); }
  const top = sp(1.04, 0);
  const r = sp(P[3][0], P[3][1] * H);
  ctx.quadraticCurveTo(sp(1.05, -0.09 * H).x, sp(1.05, -0.09 * H).y, top.x, top.y);   // rounded left shoulder
  ctx.quadraticCurveTo(sp(1.05, 0.09 * H).x, sp(1.05, 0.09 * H).y, r.x, r.y);         // rounded right shoulder
  for (let i = P.length - 2; i >= 0; i--) { q = sp(P[i][0], P[i][1] * H); ctx.lineTo(q.x, q.y); }
  ctx.closePath();
  ctx.fill();
  // Pelvis: a rounded base so the legs grow out of it rather than a flat edge
  ctx.beginPath();
  ctx.ellipse(hipNear.x, hipY, 0.07 * H, 0.05 * H, -lean, 0, Math.PI * 2);
  ctx.fill();
  // Neck and head
  ctx.strokeStyle = grey(NEAR);
  ctx.lineWidth = 0.05 * H;
  ctx.beginPath();
  ctx.moveTo(shoulder.x, shoulder.y);
  ctx.lineTo(head.x - Math.sin(lean) * headR * 0.6, head.y - Math.cos(lean) * headR * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(head.x, head.y, headR * 0.92, headR, -lean, 0, Math.PI * 2);
  ctx.fill();

  // Near side on top
  limb(ctx, hipNear, legA, thigh, shin, legW, NEAR, lean * 0.15);
  foot(ctx, hipNear, legA, thigh, shin, legW, NEAR);
  limb(ctx, shoulder, armA, upperArm, foreArm, armW, NEAR, lean);

  // Rim light on the back of the head and shoulder: separates the figure from dark ground, brighter near light
  ctx.strokeStyle = grey(NOIR.lit, 0.12 + 0.35 * lightNear);
  ctx.lineWidth = Math.max(1, 0.012 * H);
  ctx.beginPath();
  ctx.arc(head.x, head.y, headR * 0.98, Math.PI * 0.55 - lean, Math.PI * 1.05 - lean);
  ctx.stroke();
  ctx.restore();
}

/** Two-segment limb from a joint, angles from straight down (positive = forward), y up. */
function limb(ctx, root, [a1, a2], l1, l2, width, shade, lean) {
  const k = { x: root.x + Math.sin(a1 + lean * 0) * l1, y: root.y - Math.cos(a1) * l1 };
  const e = { x: k.x + Math.sin(a1 + a2) * l2, y: k.y - Math.cos(a1 + a2) * l2 };
  ctx.strokeStyle = grey(shade);
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(root.x, root.y);
  ctx.lineTo(k.x, k.y);
  ctx.lineTo(e.x, e.y);
  ctx.stroke();
  void lean;
  return e;
}

/** A small foot at the end of a leg, pointing forward. */
function foot(ctx, root, [a1, a2], l1, l2, width, shade) {
  const kx = root.x + Math.sin(a1) * l1, ky = root.y - Math.cos(a1) * l1;
  const ax = kx + Math.sin(a1 + a2) * l2, ay = ky - Math.cos(a1 + a2) * l2;
  ctx.strokeStyle = grey(shade);
  ctx.lineWidth = width * 0.8;
  ctx.beginPath();
  ctx.moveTo(ax - width * 0.15, ay);
  ctx.lineTo(ax + width * 1.0, ay - width * 0.05);
  ctx.stroke();
}

export function hills(ctx, w, h, offset, baseFrac, fill, scale, freq, amp) {
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
