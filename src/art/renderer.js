// Renderer: draws the heightmap with hill shading, animated water, followers,
// the divine hand and the HUD. Terrain is drawn at map resolution into an
// offscreen buffer, then scaled up with smoothing for a soft painterly look.

import { PALETTE, terrainColor } from './palette.js';
import { SEA_LEVEL } from '../gameplay/world.js';

const LIGHT = { x: -0.6, y: -0.8 }; // light from the top-left
const SHADE_STRENGTH = 9;           // how strongly slopes are lit or shadowed
const WATER_SHIMMER = 10;           // brightness swing of water ripples

export function createRenderer(canvas, world) {
  const ctx = canvas.getContext('2d');
  const buffer = document.createElement('canvas');
  buffer.width = world.w;
  buffer.height = world.h;
  const bctx = buffer.getContext('2d');
  const image = bctx.createImageData(world.w, world.h);
  const rgb = [0, 0, 0];
  const view = { scale: 1, ox: 0, oy: 0, dpr: 1 };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap at 2x: 4K phones don't need 3x fill cost
    view.dpr = dpr;
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    view.scale = Math.min(canvas.width / world.w, canvas.height / world.h);
    view.ox = (canvas.width - world.w * view.scale) / 2;
    view.oy = (canvas.height - world.h * view.scale) / 2;
  }

  function paintTerrain(time) {
    const { w, h, elev } = world;
    const data = image.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        const e = elev[i];
        terrainColor(e, rgb);
        let light;
        if (e >= SEA_LEVEL) {
          const ex = elev[i + (x < w - 1 ? 1 : 0)] - elev[i - (x > 0 ? 1 : 0)];
          const ey = elev[i + (y < h - 1 ? w : 0)] - elev[i - (y > 0 ? w : 0)];
          light = 1 - (ex * LIGHT.x + ey * LIGHT.y) * SHADE_STRENGTH;
        } else {
          const ripple = Math.sin(x * 0.35 + time * 1.3) + Math.sin(y * 0.45 - time * 0.9 + x * 0.1);
          const depth = (SEA_LEVEL - e) / SEA_LEVEL; // calmer in the deep
          light = 1 + (ripple * WATER_SHIMMER * (1 - depth)) / 255;
        }
        const p = i * 4;
        data[p] = rgb[0] * light;
        data[p + 1] = rgb[1] * light;
        data[p + 2] = rgb[2] * light;
        data[p + 3] = 255;
      }
    }
    bctx.putImageData(image, 0, 0);
  }

  function toScreen(x, y) {
    return [view.ox + (x + 0.5) * view.scale, view.oy + (y + 0.5) * view.scale];
  }

  function drawFollowers(followers) {
    const r = Math.max(2, view.scale * 0.45);
    for (const f of followers.list) {
      const [sx, sy] = toScreen(f.x, f.y);
      ctx.fillStyle =
        f.state === 'settled'
          ? PALETTE.followerSettled
          : f.state === 'drowning'
            ? PALETTE.followerDrowning
            : PALETTE.follower;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawHand(hand, time) {
    if (!hand) return;
    const [sx, sy] = toScreen(hand.x, hand.y);
    const lower = hand.mode === 'lower';
    const pulse = hand.mode === 'idle' ? 0 : Math.sin(time * 10) * 0.08;
    const r = hand.radius * view.scale * (1 + pulse);
    const glow = ctx.createRadialGradient(sx, sy, r * 0.2, sx, sy, r);
    glow.addColorStop(0, 'rgba(0,0,0,0)');
    glow.addColorStop(1, lower ? PALETTE.handLowerGlow : PALETTE.handGlow);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = lower ? PALETTE.handLower : PALETTE.hand;
    ctx.lineWidth = 2 * view.dpr;
    ctx.stroke();
    // A small sigil at the centre: the "finger" of the god
    ctx.beginPath();
    ctx.arc(sx, sy, 3 * view.dpr, 0, Math.PI * 2);
    ctx.fillStyle = ctx.strokeStyle;
    ctx.fill();
  }

  function drawHud(hud) {
    const pad = 12 * view.dpr;
    const lines = [`Power: ${hud.power}`];
    if (hud.belief !== undefined) lines.unshift(`Belief: ${Math.floor(hud.belief)}`);
    if (hud.fps !== undefined) lines.push(hud.fps);
    ctx.font = `${14 * view.dpr}px Georgia, 'Times New Roman', serif`;
    const lh = 20 * view.dpr;
    const width = Math.max(...lines.map((l) => ctx.measureText(l).width)) + pad * 2;
    ctx.fillStyle = PALETTE.uiPanel;
    ctx.fillRect(pad, pad, width, lines.length * lh + pad);
    ctx.fillStyle = PALETTE.ui;
    lines.forEach((l, i) => ctx.fillText(l, pad * 2, pad + lh * (i + 1) - 4 * view.dpr));
  }

  return {
    view,
    resize,
    screenToWorld(px, py) {
      return { x: (px - view.ox) / view.scale - 0.5, y: (py - view.oy) / view.scale - 0.5 };
    },
    render(scene) {
      paintTerrain(scene.time);
      ctx.fillStyle = PALETTE.void;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(buffer, view.ox, view.oy, world.w * view.scale, world.h * view.scale);
      if (scene.followers) drawFollowers(scene.followers);
      drawHand(scene.hand, scene.time);
      drawHud(scene.hud);
    },
  };
}
