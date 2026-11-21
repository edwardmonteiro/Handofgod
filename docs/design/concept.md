# A Mão de Deus · Hand of God: creative brief

**Status:** the biblical, chronological, black-and-white noir direction was confirmed by the human in chat with the Brain on 2026-11-21 (D-12).
**Amendment pending (D-14):** on issue #14, Instinct relays that the human chose an **on-screen character traversing the world, solving obstacles in it**
(with INSIDE, 2016, as the tonal reference) over the disembodied hand. A playable prototype is at `?slice=traverse`. The Brain is confirming it with the human
directly. Until then, the hand-based stages below are **paused, not deleted**.
**Reference ≠ copy:** any resemblance to INSIDE stays at the level of genre and mood (side-view cinematic puzzle-platformer, silence, dread).
No character, art, level, story beat or name from that game will be recreated.
**Owner:** Brain (gameplay and art). Sound direction: Instinct, working from this brief.

## One line
A cinematic, black-and-white noir suspense adventure. You are a **restrained divine hand** (light, wind, water,
protection) moving through the Bible **in narrative order**, solving tactile environmental puzzles that let each passage happen.

## What it is, and what it isn't
| It is | It isn't |
|---|---|
| Emotional discovery, awe, suspense | Combat, enemies, health bars |
| Tactile, satisfying environmental puzzles | Grinding, economies, follower management |
| Restraint: small gestures, big consequences | A power fantasy of smiting things |
| Chronological chapters, one passage at a time | An open sandbox |

## Pillars
1. **Restraint is power.** The hand rarely touches anything directly. It shapes light, wind and water, and the world responds.
2. **Tactile clarity.** Every gesture (press, hold, drag, release) gives immediate visual and audio feedback. Puzzles are about the feel of the elements, not about reading UI.
3. **Noir reverence.** High-contrast monochrome, deep shadow, film grain, silence used as a tool. Light is the only "colour".
4. **Scripture as the spine.** Each stage opens with its verse and resolves when the passage is fulfilled. Order is never broken.

## Controls (mouse and touch first)
| Gesture | Divine element |
|---|---|
| Press and hold | Gather (light pools under the hand; water is drawn in) |
| Drag | Wind or current follows the hand |
| Release | Let go: what was gathered disperses or settles |
| Second finger, or right button | The alternate form of the element (for example, part rather than gather) |

## Chapter order (roadmap)
1. **Genesis 1, Creation:** light, separation, emergence. *The vertical slice (Run 02).*
2. Eden and the Fall
3. Cain and Abel
4. Noah
5. Babel
6. Abraham
7. Joseph
8. Exodus, and onward

## Vertical slice: Genesis 1, three stages (Run 02)
Each stage: a title card with the verse, then the puzzle, then a moment of resolution, then a fade.

### Stage 1 · "Let there be light" (Genesis 1:3–5)
- **Scene:** total darkness over the formless deep. Faint drifting motes of light.
- **Mechanic:** press and hold to gather motes into a growing light under the hand. Gathered light reveals the hidden
  surface of the deep. Release, and the light stays where it was placed but fades slowly.
- **Puzzle:** light enough of the deep at once (coverage threshold) to "divide the light from the darkness".
- **Resolution:** the light spreads into the first day; darkness retreats to one side ("evening and morning").
- **Done when:** lit coverage reaches the target and holds for 2 s.

### Stage 2 · "A firmament in the midst of the waters" (Genesis 1:6–8)
- **Scene:** one undivided mass of churning water filling the frame.
- **Mechanic:** drag upward to lift mist and water with wind; the alternate gesture presses water down. A visible line
  (the firmament) forms where the two separated bodies hold apart.
- **Puzzle:** balance the waters above and below so the firmament stays level across the screen, within tolerance, for 3 s.
- **Resolution:** sky above, sea below.
- **Done when:** both bodies are within the balance tolerance for 3 s.

### Stage 3 · "Let the dry land appear" (Genesis 1:9–10, a hint of 1:11)
- **Scene:** the sea below the firmament, unbroken.
- **Mechanic:** gather the waters to one place (hold and drag currents); land rises where the water withdraws.
  This **reuses the Run 01 heightmap** (`world.js`), with the raise/lower brush driven by currents rather than painted.
- **Puzzle:** reach a target land shape (a single landmass above a coverage threshold, without breaking it into islands).
- **Resolution:** the first grass ripples across the land (1:11); the chapter title card appears.
- **Done when:** the land ratio is within its target band and forms one connected mass.

## What carries over from Run 01
- Engine (loop, input, rng, noise), the heightmap (`world.js`, used in Stage 3), CI, tests, the benchmark and the mail protocol.
- **Followers and belief are retired from the slice.** The module stays in the repo (tested, contract v1.1)
  for possible later chapters, but `main.js` stops loading it once the stage sequencer lands.

## Text and licensing
- Verse text must come from **public-domain translations** (for example, the World English Bible) or be original paraphrase.
  Portuguese text must be original or from a verified public-domain edition. Record the source in `docs/design/text-sources.md`.
- Title: **A Mão de Deus**, subtitle **Hand of God**.

## Acceptance for the slice (Run 02 definition of done)
- [ ] All three stages are playable in order with mouse and with touch, each with a verse card, a puzzle, a resolution and a transition.
- [ ] A full black-and-white noir look (art bible v2) at 60 fps, within the engine budget, with no console errors.
- [ ] A scene-driven noir soundscape (Instinct) that reacts to each stage's events.
- [ ] Pure stage logic is unit-tested, and CI is green.
- [ ] A first-time player finishes the slice in 5–10 minutes without a tutorial wall of text.
