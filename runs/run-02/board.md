# Run 02 board (Brain-maintained, D-13: agents report by mail)

| ID | Lane | Owner | Task | Files | Status |
|---|---|---|---|---|---|
| B-10 | Brain | Claude Code | Creative brief and noir art bible (D-12) | `docs/design/concept.md`, `docs/design/art-bible.md` | done |
| B-11 | Brain | Claude Code | Contracts v2: stages, stage rendering, sequencer, audio scene/stageEvent | `docs/CONTRACTS.md` | review (Codex ACCEPT; Instinct pending D-14) |
| B-12 | Brain | Claude Code | Sequencer in `main.js`: title, verse cards, stage order, transitions, event routing; retire followers from the slice | `src/main.js`, `index.html` | done (default = traversal; `?slice=light` archived) |
| B-13 | Brain | Claude Code | Verse text sources (public domain or original) | `docs/design/text-sources.md` | done (`docs/design/text-sources.md`, WEB plus original Portuguese) |
| E-03 | Engine | Claude Code | Normalised gesture intent (`x, y, active, alt, dx, dy`), multitouch pointer map, second finger = alt (absorbs E-02) | `src/engine/input.js` | done |
| A-03 | Art | Claude Code | Noir post-processing: tiled grain, vignette, bloom, flicker; palette v2 greys (absorbs A-02) | `src/art/post.js`, `src/art/palette.js` | done |
| A-04 | Art | Claude Code | Stage renderers: light, firmament, land; verse card typography | `src/art/stages/**` | Light done; Firmament and Land superseded (D-14a) |
| G-06 | Gameplay | Claude Code | Stage 1 logic: Light (gather motes, coverage, divide) | `src/gameplay/stages/light.js` | done |
| G-07 | Gameplay | Brain | Stage 2 logic: Firmament (lift and press waters, balance line, part) | `src/gameplay/stages/firmament.js`, `tests/stages/firmament.test.mjs` | superseded (D-14a); reassigned to Brain (Codex can't write src/ in its current authorisation) |
| G-08 | Gameplay | Claude Code | Stage 3 logic: Dry land (currents drive the `world.js` brush; connected-landmass target) | `src/gameplay/stages/land.js` | superseded (D-14a) |
| I-03 | Instinct | Instinct | Commit the mocked audio tests (carried over) | `tests/audio/**` | done (PR #18, merged) |
| I-04 | Instinct | Instinct | Noir soundscape: `scene(id)` crossfades (title, light, firmament, land, card) and `stageEvent()` cues; sound bible v2 | `src/audio/**`, `docs/design/sound-bible.md`, `tests/audio/**` | superseded by I-05 (D-14a) |
| F-08 | Forge | Codex | Run the benchmark in CI and fail if generation p95 exceeds 50 ms | `.github/**`, `tools/**` | done (benchmark gate in CI, Codex `de37e1e`) |
| F-09 | Forge | Codex | Stage conformance tests: every `src/gameplay/stages/*.js` gets meta, determinism, events cleared each step, progress in 0..1, no DOM | `tests/stages/conformance.test.mjs` | done (PR #22) |
| F-10 | Forge | Codex | Headless browser smoke in CI (load, run 5 s, no console errors) | `.github/**`, `tools/**`, `package.json` | done (PR #23: Chromium smoke in CI, ubuntu-24.04) |
| G-09 | Gameplay | Claude Code | Traversal prototype: walk, a blocked ledge, push the stone, climb, exit (`?slice=traverse`) | `src/gameplay/stages/traverse.js` | done; now the default slice (D-15) |
| A-05 | Art | Claude Code | Traversal renderer: side-view noir silhouettes, fog parallax, the exit light | `src/art/stages/traverse.js` | done (prototype) |
| E-04 | Engine | Claude Code | Held keys plus traversal intent (moveX, jump, act), with touch thirds | `src/engine/input.js` | done |
| B-14 | Brain | Claude Code | Contracts v3 (traversal events), proposed | `docs/CONTRACTS.md` | review (Instinct accepted the v3 events in #21; Codex provisionally accepted for testing) |
| I-05 | Instinct | Instinct | Traversal sound: steps, jump and land, push, blocked, reach; `scene('traverse')` | `src/audio/**`, `tests/audio/**` | done (PR #21, merged) |
| F-11 | Forge | Codex | Unit tests for `traverse.js`: the solver path completes; no completion without the block; events fire | `tests/stages/traverse.test.mjs` | done (PR #24) |
| B-15 | Brain | Claude Code | `.gitignore` (node_modules from the F-10 dev dependency), decision provenance format | `.gitignore`, `ai/PROTOCOL.md` | done |
| G-10 | Gameplay | Claude Code | Traversal slice v2: proposal for 3 connected spaces with one obstacle each; content needs owner input via #14 | `docs/design/concept.md` | space 2 mechanic built (neutral: the light bridge, `beam.js`); narrative questions open on #14 |
| G-11 | Gameplay | Claude Code | Space 2 "the bridge that exists only in light": push the lamp-stone; planks are solid only inside its circle; fall respawns | `src/gameplay/stages/beam.js` | done |
| A-06 | Art | Claude Code | Space 2 renderer: ghost planks, the lamp's circle, true-black chasm | `src/art/stages/beam.js` | done |
| B-16 | Brain | Claude Code | Sequencer: card-less spaces follow straight on (a continuous journey); audio scene from `meta.scene` | `src/main.js` | done |
| F-12 | Forge | Codex | Tests for `beam.js`: crossing with the lamp completes; no crossing without it; stepping out of the light falls and respawns; events | `tests/stages/beam.test.mjs` | todo |
| I-06 | Instinct | Instinct | Light-bridge `light` and void-reset `fall` cues (PR #27) | `src/audio/**`, `tests/audio/**` | done |
| A-07 | Art | Claude Code | **Character redraw after owner feedback** (#14, "deformed and square-like"): jointed human figure, idle, walk, push and jump poses, both spaces | `src/art/stages/traverse.js` (shared by `beam`) | done (review by Instinct; proof in `docs/design/proof/a07-character/`) |
| A-08 | Art | Claude Code | Character polish after Instinct's A-07 review: idle stance (no limb overlap), walk bob and knee lift; respawn fade in space 2 | `src/art/stages/traverse.js`, `src/art/stages/beam.js` | done |
| E-05 | Engine | Claude Code | Mobile pass: emulated iPhone 13 landscape touch playthrough; the controls hint shrinks on short screens and fades 5 s after first input | `index.html` | done |
