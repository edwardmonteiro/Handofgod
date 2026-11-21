# Run 01 decisions (append-only)

### D-01 · Plain ES modules, Canvas 2D and Web Audio, with no build step
**Context:** several AIs edit the code in parallel, and any of them must be able to run it instantly.
**Decision:** no bundler, no framework, no runtime dependencies. `index.html` runs from any static server.
**Consequence:** less tooling to break or disagree about. If we need WebGL or a bundler later, we'll revisit with a new decision.

### D-02 · Lanes are defined by file ownership
**Context:** parallel agents editing the same file cause merge conflicts and silent overwrites.
**Decision:** every path has exactly one owning lane (see `AGENTS.md`). Cross-lane needs go through the log.
**Consequence:** some requests wait on another lane, but merges stay clean.

### D-03 · Optional modules plug in through dynamic import
**Context:** Codex's followers system lands after the foundation.
**Decision:** `main.js` tries `import('./gameplay/followers.js')` and runs without it if the file is missing.
**Consequence:** Codex can ship F-04 with no edits to Brain-owned files. One expected 404 shows until then.

### D-04 · All art and sound is procedural
**Context:** licence safety, tiny downloads, and visuals and sound that react to the world.
**Decision:** no image or audio files. Terrain, the hand and sound are generated in code.
**Consequence:** the style must be achievable in code; the art and sound bibles define it.

### D-05 · Provisional concept until the human's spec arrives
**Context:** Run 01 started without a game spec.
**Decision:** the Brain wrote `docs/design/concept.md` (shape an island so followers can live and believe).
**Consequence:** the human's spec overrides it, and the gameplay lane re-plans in Run 02.
