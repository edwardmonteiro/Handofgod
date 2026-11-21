// A-03 · Noir post-processing: film grain, vignette, a slow flicker. Art bible v2.
// Grain is pre-rendered into a few small tiles once and only offset per frame,
// so the per-frame cost is a handful of drawImage calls (render budget <= 5 ms).

import { createRng } from '../engine/rng.js';

const TILE = 128;
const TILE_FRAMES = 4;
const GRAIN_ALPHA = 0.07;    // art bible: 2-4% visible amplitude after blending
const FLICKER = 0.025;       // max extra darkness from the flicker
const VIGNETTE = 0.78;       // edge darkness

export function createPost() {
  const rng = createRng(0x9a17);
  const tiles = [];
  for (let f = 0; f < TILE_FRAMES; f++) {
    const c = document.createElement('canvas');
    c.width = c.height = TILE;
    const g = c.getContext('2d');
    const img = g.createImageData(TILE, TILE);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(rng() * 255);
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    tiles.push(c);
  }
  let vignette = null;
  let vw = 0;
  let vh = 0;

  return {
    /** Applies the film treatment over whatever is on the canvas. */
    apply(ctx, view, time) {
      const { w, h } = view;
      // Vignette (cached per size)
      if (!vignette || vw !== w || vh !== h) {
        vw = w;
        vh = h;
        vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) * 0.55);
        vignette.addColorStop(0, 'rgba(0,0,0,0)');
        vignette.addColorStop(1, `rgba(0,0,0,${VIGNETTE})`);
      }
      ctx.save();
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      // Grain: one tile per frame step, offset randomly, tiled across the screen
      const frame = Math.floor(time * 24) % TILE_FRAMES;
      const ox = Math.floor(((time * 977) % 1) * TILE);
      const oy = Math.floor(((time * 613) % 1) * TILE);
      const scale = Math.max(1, Math.round(view.dpr || 1));
      const step = TILE * scale;
      ctx.globalAlpha = GRAIN_ALPHA;
      ctx.globalCompositeOperation = 'overlay';
      for (let y = -oy; y < h; y += step) {
        for (let x = -ox; x < w; x += step) ctx.drawImage(tiles[frame], x, y, step, step);
      }

      // Flicker: a barely-there breathing of the exposure
      ctx.globalCompositeOperation = 'source-over';
      const flick = (Math.sin(time * 7.3) * 0.5 + Math.sin(time * 17.1) * 0.3 + 0.8) / 1.6;
      ctx.globalAlpha = 1;
      ctx.fillStyle = `rgba(0,0,0,${(flick * FLICKER).toFixed(4)})`;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    },
  };
}
