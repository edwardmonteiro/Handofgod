// A-04 · Title and verse cards. White serif on black; the verse fades in word by word (art bible v2).

import { grey, NOIR } from './palette.js';

const WORD_DELAY = 0.12; // seconds between words appearing
const WORD_FADE = 0.5;

/**
 * card = { kicker, lines: [string], sub?: [string], t (seconds since the card opened), out (0..1 fade-out) }
 */
export function drawCard(ctx, view, card) {
  const { w, h, dpr } = view;
  const unit = Math.min(w, h);
  ctx.fillStyle = grey(NOIR.void);
  ctx.fillRect(0, 0, w, h);
  const fadeOut = 1 - (card.out || 0);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Kicker: small caps, letter-spaced
  ctx.font = `${Math.round(unit * 0.022)}px Georgia, 'Times New Roman', serif`;
  ctx.fillStyle = grey(NOIR.lit, Math.min(1, card.t / 0.8) * 0.7 * fadeOut);
  ctx.fillText(spaced(card.kicker.toUpperCase()), w / 2, h * 0.36);

  // Main lines, word by word
  const size = Math.round(unit * (card.big ? 0.075 : 0.042));
  ctx.font = `${card.big ? '' : 'italic '}${size}px Georgia, 'Times New Roman', serif`;
  let wordIndex = 0;
  card.lines.forEach((line, li) => {
    const words = line.split(' ');
    const y = h * 0.47 + li * size * 1.35;
    const total = ctx.measureText(line).width;
    let x = w / 2 - total / 2;
    ctx.textAlign = 'left';
    for (const word of words) {
      const a = Math.max(0, Math.min(1, (card.t - wordIndex * WORD_DELAY) / WORD_FADE));
      ctx.fillStyle = grey(NOIR.divine, a * fadeOut);
      ctx.fillText(word, x, y);
      x += ctx.measureText(word + ' ').width;
      wordIndex++;
    }
    ctx.textAlign = 'center';
  });

  // Secondary language line(s)
  if (card.sub) {
    ctx.font = `${Math.round(unit * 0.026)}px Georgia, 'Times New Roman', serif`;
    const appear = Math.max(0, Math.min(1, (card.t - wordIndex * WORD_DELAY - 0.3) / 0.8));
    card.sub.forEach((line, i) => {
      ctx.fillStyle = grey(NOIR.lit, appear * 0.6 * fadeOut);
      ctx.fillText(line, w / 2, h * 0.47 + card.lines.length * size * 1.35 + unit * 0.03 + i * unit * 0.035);
    });
  }

  // Hint
  if (card.hint && card.t > 2) {
    ctx.font = `${Math.round(unit * 0.018)}px Georgia, 'Times New Roman', serif`;
    ctx.fillStyle = grey(NOIR.mid, (0.5 + 0.3 * Math.sin(card.t * 2)) * fadeOut);
    ctx.fillText(card.hint, w / 2, h * 0.86);
  }
  ctx.restore();
  void dpr;
}

function spaced(text) {
  return text.split('').join(' ');
}
