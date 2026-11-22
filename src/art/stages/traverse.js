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
  const scale = cameraScale(w, h, level.viewW);   // pixels per metre (portrait zooms in, see cameraScale)
  const visW = w / scale;                          // metres visible across
  const targetCam = Math.max(0, Math.min(level.w - visW, hero.x - visW * 0.4));
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

// A-11 (Run 02) · PROPOSAL for owner review: a true side-view human silhouette, after the owner's feedback relayed on #14
// (14:48 UTC, 2026-11-22): the A-07/A-08 figure was "better, but still far from looking human". It read as a stick mannequin:
// a symmetric front-facing torso walking in profile, with uniform-width stroke limbs.
// This version is drawn in profile throughout: a skull with a face profile (brow, nose, lips, chin, jaw), a chest that leads
// with the shoulder blade, lumbar curve and buttocks behind, tapered limbs (thigh → knee, calf bulge → ankle), hands, and
// heel-to-toe feet. Pose angles (walk, push, jump, idle) are kept from A-07/A-08.
// Physics box, collision, input, events and audio are unchanged. No identity, costume or age is implied.
const NEAR = 0.012;  // near-side limbs and body (silhouette black)
const FAR = 0.085;   // far-side limbs: one step lighter so they separate from the body

export function drawHero(ctx, hero, x, y, scale, time, lightNear) {
  const H = hero.h * scale;
  const W = hero.w * scale;
  const air = !hero.grounded;
  const pushing = !!hero.pushing && !air;
  const moving = Math.abs(hero.vx || 0) > 0.05 && !air;
  const p = hero.walk || 0;
  const breathe = moving || air ? 0 : Math.sin(time * 2.2) * 0.006 * H;
  const bob = moving ? -Math.abs(Math.sin(p)) * 0.02 * H + 0.01 * H : 0;
  const lean = pushing ? 0.26 : moving ? 0.06 : 0;
  const hip = { x: 0, y: 0.49 * H + breathe * 0.5 + bob };
  const cl = Math.cos(lean), sl = Math.sin(lean);
  // Torso-local point (units of H, relative to the hip, x forward, y up) -> rotated by the lean -> pixels
  const T = (lx, ly) => ({ x: hip.x + (lx * cl + ly * sl) * H, y: hip.y + (-lx * sl + ly * cl) * H + (ly > 0.15 ? breathe : 0) });

  // ---- Limb angles (from straight down; positive = forward), as in A-07/A-08 ----
  let legA, legB, armA, armB;
  if (air) {
    const rising = (hero.vy || 0) > 0;
    legA = [0.75, -1.25];  legB = [0.25, -0.85];
    armA = rising ? [2.5, 0.25] : [1.55, 0.35];
    armB = rising ? [2.2, 0.3] : [-1.2, -0.3];
  } else if (pushing) {
    const s = Math.sin(p);
    legA = [-0.2 + s * 0.35, -0.15 - Math.max(0, -Math.cos(p)) * 0.5];
    legB = [-0.2 - s * 0.35, -0.15 - Math.max(0, Math.cos(p)) * 0.5];
    armA = [-0.15, 1.6];  armB = [-0.05, 1.5];   // elbows down, forearms level: palms land on the object's face
  } else if (moving) {
    const s = Math.sin(p);
    legA = [s * 0.48, -Math.max(0, Math.cos(p)) * 0.8 - 0.06 - Math.max(0, -s) * 0.18];
    legB = [-s * 0.48, -Math.max(0, -Math.cos(p)) * 0.8 - 0.06 - Math.max(0, s) * 0.18];
    armA = [-s * 0.42, 0.3 + Math.max(0, s) * 0.25];  armB = [s * 0.42, 0.3 + Math.max(0, -s) * 0.25];
  } else {
    legA = [0.09, -0.05];  legB = [-0.1, 0.02];
    armA = [0.1 + breathe * 0.01, 0.18];  armB = [-0.12, 0.12];
  }

  ctx.save();
  ctx.translate(x + W / 2, y);
  ctx.scale(hero.facing < 0 ? -1 : 1, -1);   // y up, facing +x

  const shoulder = T(0.0, 0.3);
  const hipNear = { x: hip.x + 0.006 * H, y: hip.y };
  const hipFar = { x: hip.x - 0.01 * H, y: hip.y };

  // Far side (lighter), behind the body
  leg(ctx, hipFar, legB, H, FAR);
  arm(ctx, shoulder, armB, H, FAR);

  // ---- Torso in profile -------------------------------------------------------------
  ctx.fillStyle = grey(NEAR);
  const body = [
    T(0.03, 0.335), T(0.07, 0.27), T(0.074, 0.225), T(0.062, 0.17), T(0.05, 0.11), T(0.058, 0.035), T(0.03, -0.03),
    T(-0.01, -0.045), T(-0.048, -0.025), T(-0.072, 0.03), T(-0.06, 0.09), T(-0.047, 0.14), T(-0.058, 0.21),
    T(-0.066, 0.27), T(-0.045, 0.32), T(-0.02, 0.345),
  ];
  smoothClosed(ctx, body);
  ctx.fill();

  // ---- Neck and head (profile) ------------------------------------------------------
  const neck = [T(-0.02, 0.34), T(0.026, 0.33), T(0.03, 0.37), T(-0.012, 0.378)];
  smoothClosed(ctx, neck);
  ctx.fill();
  const head = [
    T(-0.03, 0.375), T(-0.05, 0.41), T(-0.045, 0.45), T(-0.015, 0.478), T(0.025, 0.482), T(0.055, 0.462),
    T(0.066, 0.435), T(0.07, 0.418),   // brow
    T(0.083, 0.398),                   // nose tip
    T(0.071, 0.39), T(0.074, 0.378),   // under the nose, lips
    T(0.068, 0.363), T(0.058, 0.352),  // chin
    T(0.03, 0.352), T(0.01, 0.36),     // jaw to neck
  ];
  smoothClosed(ctx, head);
  ctx.fill();

  // Near side on top
  leg(ctx, hipNear, legA, H, NEAR);
  arm(ctx, shoulder, armA, H, NEAR);

  // Rim light along the back of the head and shoulders: separates the figure from dark ground, brighter near light
  ctx.strokeStyle = grey(NOIR.lit, 0.12 + 0.35 * lightNear);
  ctx.lineWidth = Math.max(1, 0.01 * H);
  ctx.lineCap = 'round';
  ctx.beginPath();
  const rim = [T(-0.045, 0.45), T(-0.05, 0.41), T(-0.03, 0.375)];
  ctx.moveTo(rim[0].x, rim[0].y);
  for (const q of rim.slice(1)) ctx.lineTo(q.x, q.y);
  ctx.moveTo(T(-0.045, 0.32).x, T(-0.045, 0.32).y);
  ctx.lineTo(T(-0.066, 0.27).x, T(-0.066, 0.27).y);
  ctx.stroke();
  ctx.restore();
  void time;
}

/** A leg in profile: tapered thigh, knee, calf bulge, ankle and a heel-to-toe foot. Angles from down, positive = forward. */
function leg(ctx, root, [a1, a2], H, shade) {
  const thigh = 0.245 * H, shin = 0.25 * H;
  const knee = { x: root.x + Math.sin(a1) * thigh, y: root.y - Math.cos(a1) * thigh };
  const a = a1 + a2;
  const ankle = { x: knee.x + Math.sin(a) * shin, y: knee.y - Math.cos(a) * shin };
  // the calf bulges on the back of the shin
  const calf = { x: knee.x + Math.sin(a) * shin * 0.33 - Math.cos(a) * 0.008 * H, y: knee.y - Math.cos(a) * shin * 0.33 - Math.sin(a) * 0.008 * H };
  ctx.fillStyle = grey(shade);
  seg(ctx, root, knee, 0.1 * H, 0.06 * H);
  seg(ctx, knee, calf, 0.06 * H, 0.068 * H);
  seg(ctx, calf, ankle, 0.068 * H, 0.034 * H);
  // Foot: heel slightly behind the ankle, toe forward; tips onto the toe when the leg trails
  const tip = Math.max(0, -a) * 0.6;
  const fx = Math.cos(tip), fy = Math.sin(tip);
  const heel = { x: ankle.x - 0.03 * H * fx, y: ankle.y - 0.016 * H - 0.03 * H * fy * 0 };
  const toe = { x: ankle.x + 0.105 * H * fx, y: ankle.y - 0.022 * H - 0.105 * H * fy * 0.35 };
  ctx.beginPath();
  ctx.moveTo(heel.x, heel.y + 0.035 * H);
  ctx.lineTo(heel.x - 0.006 * H, heel.y);
  ctx.lineTo(toe.x, toe.y);
  ctx.lineTo(toe.x - 0.02 * H, toe.y + 0.022 * H);
  ctx.lineTo(ankle.x + 0.012 * H, ankle.y + 0.012 * H);
  ctx.closePath();
  ctx.fill();
}

/** An arm in profile: deltoid, tapered upper arm and forearm, and a hand. */
function arm(ctx, root, [a1, a2], H, shade) {
  const upper = 0.175 * H, fore = 0.16 * H;
  const elbow = { x: root.x + Math.sin(a1) * upper, y: root.y - Math.cos(a1) * upper };
  const a = a1 + a2;
  const wrist = { x: elbow.x + Math.sin(a) * fore, y: elbow.y - Math.cos(a) * fore };
  ctx.fillStyle = grey(shade);
  ctx.beginPath();
  ctx.arc(root.x, root.y - 0.008 * H, 0.04 * H, 0, Math.PI * 2); // deltoid
  ctx.fill();
  seg(ctx, root, elbow, 0.064 * H, 0.046 * H);
  seg(ctx, elbow, wrist, 0.046 * H, 0.032 * H);
  // Hand: a small tapered mitten continuing the forearm
  const hand = { x: wrist.x + Math.sin(a) * 0.05 * H, y: wrist.y - Math.cos(a) * 0.05 * H };
  seg(ctx, wrist, hand, 0.036 * H, 0.026 * H);
}

/** A filled tapered segment with round ends (widths are full widths). */
function seg(ctx, a, b, wa, wb) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  ctx.beginPath();
  ctx.moveTo(a.x + nx * wa / 2, a.y + ny * wa / 2);
  ctx.lineTo(b.x + nx * wb / 2, b.y + ny * wb / 2);
  ctx.lineTo(b.x - nx * wb / 2, b.y - ny * wb / 2);
  ctx.lineTo(a.x - nx * wa / 2, a.y - ny * wa / 2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(a.x, a.y, wa / 2, 0, Math.PI * 2);
  ctx.arc(b.x, b.y, wb / 2, 0, Math.PI * 2);
  ctx.fill();
}

/** Smooth closed outline through points (quadratic curves via midpoints). */
function smoothClosed(ctx, pts) {
  const n = pts.length;
  const mid = (i) => ({ x: (pts[i].x + pts[(i + 1) % n].x) / 2, y: (pts[i].y + pts[(i + 1) % n].y) / 2 });
  ctx.beginPath();
  const m0 = mid(n - 1);
  ctx.moveTo(m0.x, m0.y);
  for (let i = 0; i < n; i++) {
    const m = mid(i);
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, m.x, m.y);
  }
  ctx.closePath();
}

// Camera zoom (A-09): landscape shows level.viewW metres across, as before. Narrow or portrait screens would shrink
// the figure to ~28 px (Instinct, #14), so the zoom also guarantees that at most MIN_VIEW_H metres are visible vertically.
// Rendering only: physics, events and audio are untouched.
export const MIN_VIEW_H = 11;
export function cameraScale(w, h, viewW) {
  return Math.max(w / viewW, h / MIN_VIEW_H);
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
