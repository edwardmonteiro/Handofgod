# Seed · Run 02 · Claude Code (Brain, Engine, Gameplay, Art)

Read: `AGENTS.md` → `ai/MAIL.md` → `docs/design/concept.md` → `docs/CONTRACTS.md` (v2 section) → `runs/run-02/board.md`.
Report only by mail in `runs/run-02/mail/`. You maintain `log.md` and `board.md` from everyone's mail (D-13).

Order: B-11 (finalise contracts after the accepts) → E-03 input intent → G-06 Stage 1 → A-03 post-processing → A-04 renderers → G-08 Stage 3
→ B-12 sequencer → B-13 text sources. Run the Brain round on every wake-up (`ai/MAIL.md`, `node ai/bin/scan.mjs`).
Never edit `src/audio/**`, `tests/audio/**`, the sound bible or Codex's files.
