# Run 01 board

Statuses: `todo` · `doing` · `review` · `done` · `blocked`. Edit only your own rows.
Since Dispatch 01.2, sound (`I-` rows) belongs to Instinct. Since D-10, the Brain merges passing in-lane PRs.

| ID | Lane | Owner | Task | Files | Status |
|---|---|---|---|---|---|
| B-01 | Brain | Claude Code | AI operating system: AGENTS.md, protocol, role cards | `AGENTS.md`, `CLAUDE.md`, `ai/**` | done |
| B-02 | Brain | Claude Code | Contracts v1 for every cross-lane API | `docs/CONTRACTS.md` | done |
| B-03 | Brain | Claude Code | Run 01 package: goal, board, seeds, log, decisions | `runs/**` | done |
| B-04 | Brain | Claude Code | Review and merge PRs. Merged #1, #5, #12; integrated #2, #3, #4, #8, #10, #11, #13, #15 | `src/main.js` | doing (ongoing) |
| B-05 | Brain | Claude Code | Close Run 01: retro, then open Run 02 with seeds | `runs/**` | blocked (G-04 product direction) |
| B-06 | Brain | Claude Code | Contracts v1.1: follower events and `followerCue`. FINAL | `docs/CONTRACTS.md` | done |
| B-07 | Brain | Claude Code | Route `followers.events` to `audio.followerCue` in `main.js` | `src/main.js` | done |
| B-08 | Brain | Claude Code | Autonomous coordination: mail, scan tool, scheduled Brain round | `ai/MAIL.md`, `ai/bin/**` | done |
| B-09 | Brain | Claude Code | Optional followers import: report real errors instead of "not present yet" (F-05 #5) | `src/main.js` | done |
| E-01 | Engine | Claude Code | Fixed-step loop, input, rng, noise, perf overlay | `src/engine/**` | done |
| E-02 | Engine | Claude Code | Multitouch: per-pointer map, two-finger lower, pinch for brush size (F-05 #2) | `src/engine/input.js` | todo (after G-04: controls may change) |
| G-01 | Gameplay | Claude Code | Island generator, terrain bands, raise/lower brush | `src/gameplay/world.js` | done |
| G-02 | Gameplay | Claude Code | Belief economy design (Run 02) | `docs/design/belief.md` | blocked (G-04 may replace it) |
| G-03 | Gameplay | Claude Code | `SEA_LEVEL` Float32-exact (Codex flag) | `src/gameplay/world.js` | done |
| G-04 | Gameplay | Claude Code | Product direction: biblical chronological noir puzzle-adventure (issue #14). Replace the provisional concept and write the spec and vertical slice | `docs/design/concept.md` | blocked (awaiting the human's confirmation) |
| G-05 | Gameplay | Claude Code | Degenerate maps (1×1) produce NaN (F-05 #4) | `src/gameplay/world.js` | done |
| A-01 | Art | Claude Code | Palette, hill-shaded terrain, water shimmer, hand, HUD | `src/art/**` | done |
| A-02 | Art | Claude Code | Follower look pass; per-frame allocations in the renderer (F-05 #6) | `src/art/renderer.js` | todo (after G-04: noir art direction) |
| I-01 | Instinct | Instinct | Audio review: sea volume, swell ceiling, `shape()` dedupe, unlock and mute (PR #11) | `src/audio/**`, `docs/design/sound-bible.md` | done |
| I-02 | Instinct | Instinct | Follower cues via `followerCue(type, pan)`, voice-limited and throttled (PR #11) | `src/audio/**` | done (mocked tests not yet committed to `tests/audio/`) |
| I-03 | Instinct | Instinct | Commit the mocked audio tests to `tests/audio/**`; align the soundscape to the noir brief once G-04 is published | `tests/audio/**`, `src/audio/**` | todo |
| F-01 | Forge | Codex | `node:test` harness and tests for rng, noise and world (PR #2) | `package.json`, `tests/**` | done |
| F-02 | Forge | Codex | GitHub Actions CI on Node 20 and 22 (PR #4) | `.github/workflows/ci.yml` | done |
| F-03 | Forge | Codex | Benchmark: generation p95 3.649 ms against the 50 ms budget; brush 0.006 ms per call (PR #13) | `tools/bench.mjs` | done |
| F-04 | Gameplay | Codex | Followers system per contracts v1.1 (PR #3) | `src/gameplay/followers.js`, `tests/followers.test.mjs` | done |
| F-05 | Forge | Codex | Independent review: 8 findings (PR #15, `tools/reviews/run-01-independent-review.md`) | `tools/reviews/**` | done |
| F-06 | Forge | Codex | Nested test discovery, bare `node --test` (PRs #2 and #8) | `package.json` | done |
| F-07 | Forge | Codex | Claude Code Action Brain runner, gated and **inactive** until the human adds a secret (PR #10) | `.github/workflows/brain-agent.yml`, `tools/AGENT_BRIDGE.md` | done (inactive) |
