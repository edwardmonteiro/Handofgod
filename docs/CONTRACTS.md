# Module contracts

**Owner:** Brain. This is the single source of truth for every API that crosses a lane.
If code disagrees with this file, the code is wrong. To change a contract, ask in the run log
and tag `@brain`.

Coordinates: **world cells**. `x` runs `0..w-1` left to right and `y` runs `0..h-1` top to bottom.
Floats are allowed, meaning positions inside a cell.

---

## Engine (`src/engine/`) — pure modules, safe to use in Node

### `rng.js`
- `createRng(seed: number) -> () => number` returns a deterministic PRNG (mulberry32) giving floats in `[0, 1)`.
- `hashSeed(text: string) -> number` turns any string into a 32-bit seed.

### `noise.js`
- `createNoise2D(rng) -> (x, y) => number` gives smooth value noise in `[0, 1]`.
- `fbm(noise2d, x, y, octaves = 5, lacunarity = 2, gain = 0.5) -> number` gives fractal noise in `[0, 1]`.

## Engine (`src/engine/`) — browser only

### `loop.js`
- `createLoop({ update(dt), render(alpha, time), stepHz = 60 }) -> { start(), stop(), stats }`
- `stats` is `{ fps, frameMs, updateMs, renderMs }`, smoothed and read-only.

### `input.js`
- `createInput(canvas) -> Input`
- `Input` is `{ x, y, inside, primary, secondary, wheel, consumeWheel(), pressed(code) }`.
  `x` and `y` are canvas pixels (device-pixel scaled). `primary` and `secondary` are booleans.
  `pressed(code)` returns true once per key press (`KeyboardEvent.code`).

---

## Gameplay (`src/gameplay/`) — pure, no DOM

### `world.js`
```js
SEA_LEVEL                     // 0.42; elevation below this is water
createWorld(w, h, seed) -> World         // World = { w, h, seed, elev: Float32Array(w*h) }, all zero
generateIsland(world) -> World           // fills elev deterministically from world.seed
applyBrush(world, cx, cy, radius, amount) -> number
    // raises (amount > 0) or lowers (amount < 0) the land with a smooth falloff.
    // Elevations are clamped to [0, 1]. Returns how many cells changed.
elevationAt(world, x, y) -> number       // nearest cell, coordinates clamped into the map
terrainAt(world, x, y) -> Terrain        // 'deep'|'shallow'|'sand'|'grass'|'forest'|'rock'|'snow'
isLand(world, x, y) -> boolean           // elevationAt >= SEA_LEVEL
landRatio(world) -> number               // share of cells that are land, 0..1
```

### `followers.js` — **assigned to Codex (task F-04)**
```js
createFollowers(world, rng, count = 24) -> Followers
    // Followers = { list: Follower[], belief: number }
    // Follower  = { x, y, state: 'wander' | 'settled' | 'drowning', age: number }
    // Spawn followers on land cells only.
stepFollowers(followers, world, rng, dt) -> void
    // dt is in seconds. Wanderers drift on land and avoid water.
    // On 'grass' with land around them, followers may settle.
    // Each settled follower adds belief at BELIEF_PER_SECOND (a named constant).
    // A follower whose cell becomes water switches to 'drowning' and is removed after 2 s.
```
`src/main.js` loads this module **optionally**: until it exists, the game runs without followers.
Once it exists, the renderer draws `list` and the HUD shows `belief`. No other wiring is needed.

---

## Art (`src/art/`) — browser only

### `palette.js`
- `PALETTE` holds the named colours (`ui`, `hand`, `follower`, and so on).
- `terrainColor(elev, out = [r, g, b]) -> out` returns the colour for an elevation, with no allocation.

### `renderer.js`
- `createRenderer(canvas, world) -> Renderer`
- `Renderer` is `{ resize(), render(scene), screenToWorld(px, py) -> {x, y}, view }`.
- `scene` is `{ time, hand: {x, y, radius, mode}, followers?, hud: {belief?, power, fps?} }`.
  `mode` is `'raise'`, `'lower'` or `'idle'`.

---

## Audio (`src/audio/`) — browser only

### `audio.js`
- `createAudio() -> Audio`
- `Audio` is `{ unlock(), toggleMute() -> boolean, muted, shape(direction, intensity), ambience(landRatio), dispose() }`.
  `direction` is `+1` (raise) or `-1` (lower), and `intensity` runs `0..1`.
  `unlock()` must be called from a user gesture handler.
