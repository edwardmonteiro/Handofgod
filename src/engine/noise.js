// Smooth 2D value noise and fractal Brownian motion.
// Pure module: safe in Node and the browser.

const SIZE = 256;
const MASK = SIZE - 1;

/** Returns noise2d(x, y) -> [0, 1], seeded from the given rng. */
export function createNoise2D(rng) {
  const values = new Float32Array(SIZE);
  const perm = new Uint8Array(SIZE * 2);
  for (let i = 0; i < SIZE; i++) {
    values[i] = rng();
    perm[i] = i;
  }
  for (let i = SIZE - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = perm[i];
    perm[i] = perm[j];
    perm[j] = tmp;
  }
  for (let i = 0; i < SIZE; i++) perm[i + SIZE] = perm[i];

  const lattice = (ix, iy) => values[perm[(ix & MASK) + perm[iy & MASK]]];
  const smooth = (t) => t * t * (3 - 2 * t);

  return function noise2d(x, y) {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const sx = smooth(x - x0);
    const sy = smooth(y - y0);
    const a = lattice(x0, y0);
    const b = lattice(x0 + 1, y0);
    const c = lattice(x0, y0 + 1);
    const d = lattice(x0 + 1, y0 + 1);
    const top = a + (b - a) * sx;
    const bottom = c + (d - c) * sx;
    return top + (bottom - top) * sy;
  };
}

/** Fractal noise: layers of noise at rising frequency. Result normalised to [0, 1]. */
export function fbm(noise2d, x, y, octaves = 5, lacunarity = 2, gain = 0.5) {
  let sum = 0;
  let amp = 1;
  let freq = 1;
  let norm = 0;
  for (let o = 0; o < octaves; o++) {
    sum += noise2d(x * freq, y * freq) * amp;
    norm += amp;
    amp *= gain;
    freq *= lacunarity;
  }
  return sum / norm;
}
