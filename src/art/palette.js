// Hand of God palette. Every colour in the game comes from here. See docs/design/art-bible.md.
//
// Art bible v2 (noir, D-12): monochrome only. NOIR and grey() are the Run 02 palette.
// PALETTE / terrainColor below are the legacy v1 colours, kept until the island renderer is removed.

/** Contrast ladder from the art bible (0 = void black, 1 = divine white). */
export const NOIR = {
  void: 0.02,
  shadow: 0.08,
  mid: 0.32,
  lit: 0.72,
  divine: 0.97,
};

/** A CSS grey for level v (0..1), with optional alpha. The only way stage art makes colours. */
export function grey(v, a = 1) {
  const c = Math.round(Math.max(0, Math.min(1, v)) * 255);
  return a >= 1 ? `rgb(${c},${c},${c})` : `rgba(${c},${c},${c},${a})`;
}

export const PALETTE = {
  void: '#0b1020',
  ui: '#f3e9d2',
  uiDim: 'rgba(243, 233, 210, 0.6)',
  uiPanel: 'rgba(11, 16, 32, 0.72)',
  hand: '#ffd27a',
  handGlow: 'rgba(255, 210, 122, 0.35)',
  handLower: '#7fd6ff',
  handLowerGlow: 'rgba(127, 214, 255, 0.35)',
  follower: '#fff6e0',
  followerSettled: '#ffb347',
  followerDrowning: '#ff6b6b',
  belief: '#ffd27a',
};

// Terrain ramp: [elevation stop, r, g, b]. Colours blend between stops.
const RAMP = [
  [0.0, 10, 22, 52],    // abyss
  [0.30, 22, 58, 110],  // deep sea
  [0.42, 52, 128, 168], // shallows (sea level)
  [0.425, 226, 205, 150], // foam line / wet sand
  [0.47, 214, 190, 132],  // sand
  [0.48, 120, 168, 84],   // fresh grass (matches gameplay sand/grass boundary 0.47)
  [0.62, 74, 132, 64],    // grass
  [0.66, 46, 98, 58],     // forest
  [0.74, 38, 78, 52],     // deep forest
  [0.78, 112, 104, 96],   // rock
  [0.88, 150, 142, 134],  // high rock
  [0.92, 236, 238, 244],  // snow
  [1.0, 255, 255, 255],
];

/** Writes the terrain colour for an elevation into `out` (no allocation in the hot loop). */
export function terrainColor(elev, out = [0, 0, 0]) {
  let i = 1;
  while (i < RAMP.length - 1 && elev > RAMP[i][0]) i++;
  const a = RAMP[i - 1];
  const b = RAMP[i];
  const t = b[0] === a[0] ? 0 : Math.min(1, Math.max(0, (elev - a[0]) / (b[0] - a[0])));
  out[0] = a[1] + (b[1] - a[1]) * t;
  out[1] = a[2] + (b[2] - a[2]) * t;
  out[2] = a[3] + (b[3] - a[3]) * t;
  return out;
}
