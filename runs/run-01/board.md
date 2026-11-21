# Run 01 board

Statuses: `todo` · `doing` · `review` · `done` · `blocked`. Edit only your own rows.

**Since Dispatch 01.2:** the sound lane (`I-` rows) belongs to Instinct, a separate AI. Audio paths are reserved for it.

| ID | Lane | Owner | Task | Files | Status |
|---|---|---|---|---|---|
| B-01 | Brain | Claude Code | AI operating system: AGENTS.md, protocol, role cards | `AGENTS.md`, `CLAUDE.md`, `ai/**` | done |
| B-02 | Brain | Claude Code | Contracts v1 for every cross-lane API | `docs/CONTRACTS.md` | done |
| B-03 | Brain | Claude Code | Run 01 package: goal, board, seeds, log, decisions | `runs/**` | done |
| B-04 | Brain | Claude Code | Review and merge Codex PRs; fix integration seams | `src/main.js` | todo |
| B-05 | Brain | Claude Code | Close Run 01: retro, then open Run 02 with seeds | `runs/**` | todo |
| B-06 | Brain | Claude Code | Contracts v1.1: follower events and `followerCue`. Proposed; needs agreement from Instinct and Codex | `docs/CONTRACTS.md` | review |
| B-07 | Brain | Claude Code | Route `followers.events` to `audio.followerCue` in `main.js` (after F-04 and I-02; flag to Instinct) | `src/main.js` | blocked (F-04, I-02, B-06) |
| E-01 | Engine | Claude Code | Fixed-step loop, input, rng, noise, perf overlay | `src/engine/**` | done |
| E-02 | Engine | Claude Code | Touch: two-finger drag lowers land; pinch sets brush size | `src/engine/input.js` | todo |
| G-01 | Gameplay | Claude Code | Island generator, terrain bands, raise/lower brush | `src/gameplay/world.js` | done |
| G-02 | Gameplay | Claude Code | Design doc for the belief economy (Run 02) | `docs/design/belief.md` | todo |
| A-01 | Art | Claude Code | Palette, hill-shaded terrain, water shimmer, hand, HUD | `src/art/**` | done |
| A-02 | Art | Claude Code | Follower look pass once F-04 lands | `src/art/renderer.js` | todo |
| I-01 | Instinct | **Instinct** | Audio review of the baseline Claude Code built at `f128a72`: fix the sea-volume mismatch with the sound bible; runtime-test unlock, saved mute, terrain feedback and levels | `src/audio/**`, `docs/design/sound-bible.md` | todo |
| I-02 | Instinct | **Instinct** | Settle and drown cues through `followerCue(type, pan)`, once B-06 is agreed | `src/audio/**` | blocked (B-06) |
| F-01 | Forge | Codex | `node:test` harness and tests for rng, noise and world | `package.json`, `tests/**` | review |
| F-02 | Forge | Codex | GitHub Actions: run `npm test` on every PR and on pushes to main | `.github/workflows/ci.yml` | todo |
| F-03 | Forge | Codex | Benchmark script for world generation and brush; record in the log | `tools/bench.mjs` | todo |
| F-04 | Gameplay | Codex | Followers system, following `docs/CONTRACTS.md` exactly | `src/gameplay/followers.js`, `tests/followers.test.mjs` | todo |
| F-05 | Forge | Codex | Independent review of Run 01 code; report findings in the log (no cross-lane edits) | `runs/run-01/log.md` | todo |
