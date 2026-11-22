# Module contracts

**Version:** 2.0-proposed (2026-11-21) · v1.1 is final; the v2 stage contracts below are PROPOSED for Run 02 · changelog at the end.

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
SEA_LEVEL                     // Math.fround(0.42); elevation below this is water (Float32-exact)
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

#### Follower events (v1.1, status: **FINAL**: accepted by Instinct (01.4) and Codex (F-04); implemented)
```js
// Followers gains one field:
//   Followers = { list, belief, events: FollowerEvent[] }
//   FollowerEvent = { type: 'settle' | 'drown', x: number, y: number }
// Rules:
//   - createFollowers returns events = [].
//   - stepFollowers empties events (events.length = 0) at the START of each call, then pushes one
//     event per state change during that step: 'settle' when wander -> settled,
//     'drown' when any state -> drowning. Each transition emits exactly ONCE, at the moment it
//     happens. Removing a drowned follower later emits nothing.
//   - Events are plain data: no callbacks, no Web Audio, no DOM.
```
The Brain reads `events` after each step and routes them (task B-07). Neither followers nor audio
import each other.
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

#### Follower cues (v1.1, status: **FINAL**. `main.js` routes events here (B-07); Instinct implements it in I-02)
- `followerCue(type: 'settle' | 'drown', pan: number)`: `pan` runs `-1..1`, from the event's x position
  across the map width.
- Optional: the Brain calls it only if `typeof audio.followerCue === 'function'`, so the game runs before I-02 lands.
- Instinct decides how it sounds, plus voice limiting and throttling (several events can arrive in one step).

#### How `src/main.js` calls audio today (Brain-owned; any change is flagged to Instinct)
| Call | Frequency |
|---|---|
| `unlock()` | on canvas `pointerdown` and on window `keydown` |
| `toggleMute()` | `M` key |
| `shape(dir, intensity)` | **every simulation step (60 Hz)**, including `shape(0, 0)` while idle. Stays as is: Instinct dedupes repeated values inside audio (D-08) |
| `ambience(landRatio)` | every 0.5 s |
| `followerCue(type, pan)` | once per follower event, right after `stepFollowers`, only if the function exists (B-07) |

---

## v2 (PROPOSED, Run 02): stages for the Genesis 1 vertical slice

The approved direction is in `docs/design/concept.md` (D-12). These contracts let Gameplay, Art, Audio and Forge build stages in parallel.
Status: **PROPOSED.** Codex and Instinct accept or amend by mail. The Brain finalises.

### Stage logic: `src/gameplay/stages/<id>.js` (pure: no DOM, no audio)
```js
export const meta = { id: 'light', order: 1, verse: 'Genesis 1:3-5', title: 'Let there be light' };
export function createStage(seed) -> StageState
export function stepStage(state, intent, dt) -> void
// Intent (built by main.js from engine input; every coordinate is NORMALISED 0..1, resolution-independent):
//   { x, y, active: boolean,      // pointer down (primary)
//     alt: boolean,               // alternate gesture (second finger, right button, Shift)
//     dx, dy }                    // pointer movement since the last step, normalised
// StageState must contain at least:
//   progress: number              // 0..1, monotonic toward completion where the design allows
//   complete: boolean             // true once the stage's "done when" rule holds
//   events: StageEvent[]          // emptied at the START of each step, like followers.events
//   ...plus any render-facing fields, documented at the top of the stage module
// StageEvent = { type: string, x: number, y: number, strength: number }   // x, y normalised; strength 0..1
//   Stage 1 'light' emits:  'gather' (hold starts), 'release', 'reveal' (new coverage), 'divide' (complete)
//   Stage 2 'firmament':   'lift', 'press', 'balance' (enters tolerance), 'part' (complete)
//   Stage 3 'land':        'withdraw', 'emerge', 'grass' (complete)
```
Rules: deterministic for a given seed and intent sequence. All tuning values are named constants at the top of the module.

### Stage rendering: `src/art/stages/<id>.js` (Art lane)
```js
export function drawStage(ctx, state, view, time) -> void   // view = { w, h, dpr } in canvas pixels
```
It reads only documented `state` fields. Post-processing (grain, vignette, bloom) is applied afterwards by `src/art/post.js`.

### Sequencer: `src/main.js` (Brain lane)
It runs the stages in `order`, shows a verse card before each one, and moves on once `complete` holds and the resolution beat has played.
It routes each `state.events` entry to audio.

### Audio: additions to `src/audio/audio.js` (Instinct lane; both optional, guarded by `typeof === 'function'`)
```js
scene(id: 'title' | 'light' | 'firmament' | 'land' | 'card')   // crossfade to that stage's soundscape
stageEvent(type: string, pan: number, strength: number)        // pan -1..1 from event x; strength 0..1
```
The existing `unlock()`, `toggleMute()` and `muted` stay. `shape()`, `ambience()` and `followerCue()` remain valid for v1 code.

---

## v3 (PROPOSED, D-14): character traversal

The same stage shape as v2 (`meta`, `createStage`, `stepStage`, `progress`, `complete`, `events`). Reference implementation: `src/gameplay/stages/traverse.js`.
```js
// Intent gains (from src/engine/input.js; stages ignore what they don't use):
//   moveX: -1..1   (arrows or A/D; holding the left or right third of the screen)
//   jump:  boolean (one step only: Space, W, Up, or a tap in the middle third)
//   act:   boolean (held: E, F, Shift, right button or a second finger), reserved for interactions
// Traversal events (StageEvent, x/y normalised, strength 0..1):
//   'step'    footstep while walking or pushing (≈ every 0.34 s)
//   'jump'    take-off
//   'land'    touchdown after a real fall (strength from fall speed)
//   'push'    starts moving an object
//   'blocked' walks into an obstacle that is out of reach (cooldown 1.6 s): the readable "you can't go this way" cue
//   'reach'   arrives at the exit (stage complete)
```
Audio uses the same optional `stageEvent(type, pan, strength)`, plus `scene('traverse')`.

v3 additions (Run 02, round 4, PROPOSED):
- `meta.scene` (optional): the audio scene id for a stage, so several traversal spaces can share one soundscape (`beam` uses `'traverse'`).
- `meta.verse: 'unassigned'`: the convention for a stage with no passage chosen yet. The conformance test requires a non-empty string; this marks one without implying any narrative.
- Events `light` (newly solid planks appear inside the lamp's circle, strength = lit share) and `fall` (dropped into the void; the hero respawns at the space start).
- Cards are optional: a stage with no entry in `src/content/` starts straight after the previous one (a continuous journey).

---

## Changelog
- **3.0-proposed** (2026-11-21): character-traversal intent and events (D-14), alongside v2.
- **2.0-proposed** (2026-11-21): stage logic, stage rendering, sequencer and audio `scene`/`stageEvent` for the Genesis 1 slice (D-12). Awaiting Codex and Instinct.
- **1.1b** (2026-11-21): v1.1 FINAL (Codex accepted in F-04). B-07 routing documented. `SEA_LEVEL` is now Float32-exact (D-11).
- **1.1a** (2026-11-21): Instinct accepted the events and `followerCue` (01.4). Spelled out that each transition emits exactly once.
  `shape()` call rate unchanged (D-08). Codex agreement still pending.
- **1.1** (2026-11-21): proposed follower events (`Followers.events`) and `Audio.followerCue`.
  Documented how `main.js` calls audio. Only adds fields; nothing in v1 changed.
- **1.0** (2026-11-21): first version.
