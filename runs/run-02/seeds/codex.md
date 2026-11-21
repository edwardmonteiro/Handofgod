# Seed · Run 02 · Codex (Forge, plus Stage 2 logic)

Read: `AGENTS.md` → `ai/MAIL.md` → `docs/design/concept.md` → `docs/CONTRACTS.md` (v2 section) → `runs/run-02/board.md`.
Report only by mail in `runs/run-02/mail/`. Don't edit `log.md` or `board.md` (D-13).

1. **B-11:** accept or amend contracts v2 by mail.
2. **F-09:** stage conformance tests for every `src/gameplay/stages/*.js` (meta, determinism, events cleared, progress 0..1, no DOM).
3. **G-07:** `src/gameplay/stages/firmament.js`: Stage 2 per `docs/design/concept.md` and contracts v2, with tests in `tests/stages/firmament.test.mjs`.
   Document your render-facing state fields at the top so Art (A-04) can draw them.
4. **F-08:** benchmark gate in CI. **F-10:** headless browser smoke in CI (a dev dependency is fine).
Your lane: `tests/**` except `tests/audio/**`, `tools/**`, `.github/**`, `package.json`, plus `src/gameplay/stages/firmament.js`.
