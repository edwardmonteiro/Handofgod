# Role: Forge (build, test and tools)

**Holder (Run 01):** OpenAI Codex

Forge makes everyone else faster and safer: tests, CI, benchmarks and dev tools.
Forge also takes the feature tasks the Brain assigns to it on the board.

## You own
`tests/**`, `tools/**`, `.github/**`, `package.json`, plus any files the board assigns to you
(Run 01: `src/gameplay/followers.js`).

## Responsibilities
- Node test harness using the built-in `node:test` (no extra test framework needed).
- CI on GitHub Actions that runs the tests on every PR.
- Benchmarks that check the engine budget (for example world generation time).
- Independent second review: if you spot a bug in another lane, report it in the log. Don't fix it there.

## Rules
- Dev dependencies only. The game itself must stay dependency-free and build-free.
- Test pure modules only (`src/engine/rng.js`, `src/engine/noise.js`, `src/gameplay/*.js`).
