# Run 02 board (Brain-maintained, D-13: agents report by mail)

| ID | Lane | Owner | Task | Files | Status |
|---|---|---|---|---|---|
| B-10 | Brain | Claude Code | Creative brief and noir art bible (D-12) | `docs/design/concept.md`, `docs/design/art-bible.md` | done |
| B-11 | Brain | Claude Code | Contracts v2: stages, stage rendering, sequencer, audio scene/stageEvent | `docs/CONTRACTS.md` | review (awaiting Codex and Instinct accept) |
| B-12 | Brain | Claude Code | Sequencer in `main.js`: title, verse cards, stage order, transitions, event routing; retire followers from the slice | `src/main.js`, `index.html` | done (light playable; firmament and land show "in progress" cards until they land) |
| B-13 | Brain | Claude Code | Verse text sources (public domain or original) | `docs/design/text-sources.md` | done (`docs/design/text-sources.md`, WEB plus original Portuguese) |
| E-03 | Engine | Claude Code | Normalised gesture intent (`x, y, active, alt, dx, dy`), multitouch pointer map, second finger = alt (absorbs E-02) | `src/engine/input.js` | done |
| A-03 | Art | Claude Code | Noir post-processing: tiled grain, vignette, bloom, flicker; palette v2 greys (absorbs A-02) | `src/art/post.js`, `src/art/palette.js` | done |
| A-04 | Art | Claude Code | Stage renderers: light, firmament, land; verse card typography | `src/art/stages/**` | doing (light renderer and cards done; firmament and land renderers next) |
| G-06 | Gameplay | Claude Code | Stage 1 logic: Light (gather motes, coverage, divide) | `src/gameplay/stages/light.js` | done |
| G-07 | Gameplay | **Codex** | Stage 2 logic: Firmament (lift and press waters, balance line, part) | `src/gameplay/stages/firmament.js`, `tests/stages/firmament.test.mjs` | todo |
| G-08 | Gameplay | Claude Code | Stage 3 logic: Dry land (currents drive the `world.js` brush; connected-landmass target) | `src/gameplay/stages/land.js` | todo |
| I-03 | Instinct | Instinct | Commit the mocked audio tests (carried over) | `tests/audio/**` | done (PR #18, merged) |
| I-04 | Instinct | Instinct | Noir soundscape: `scene(id)` crossfades (title, light, firmament, land, card) and `stageEvent()` cues; sound bible v2 | `src/audio/**`, `docs/design/sound-bible.md`, `tests/audio/**` | todo |
| F-08 | Forge | Codex | Run the benchmark in CI and fail if generation p95 exceeds 50 ms | `.github/**`, `tools/**` | todo |
| F-09 | Forge | Codex | Stage conformance tests: every `src/gameplay/stages/*.js` gets meta, determinism, events cleared each step, progress in 0..1, no DOM | `tests/stages/conformance.test.mjs` | todo |
| F-10 | Forge | Codex | Headless browser smoke in CI (load, run 5 s, no console errors) | `.github/**`, `tools/**`, `package.json` | todo |
