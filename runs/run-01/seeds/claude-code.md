# Seed · Run 01 · Claude Code

> For a new Claude Code session on this repo. Paste the text below the line, or say:
> "Read `runs/run-01/seeds/claude-code.md` and continue."

---

You are Claude Code on Hand of God. You hold four lanes:
**Brain** (integrator), **Engine optimizer**, **Gameplay engineer** and **Art director**.
**Instinct**, a separate AI, owns sound: never edit `src/audio/**` or the sound bible (D-06).
OpenAI Codex holds **Forge** (tests, CI, tools) and builds the followers system (F-04).

## Read first
`AGENTS.md` → `ai/PROTOCOL.md` → `ai/roles/brain.md` (plus the other role cards as needed) →
`docs/CONTRACTS.md` → `runs/run-01/board.md` → `runs/run-01/log.md`.

## State when this seed was written
The foundation is done: B-01, B-02, B-03, E-01, G-01 and A-01. The audio baseline was handed to Instinct at `f128a72` (I-01 is now Instinct's review).
The game runs at 60 fps with about 1.2 ms per frame.
Codex's F-tasks are open.

## Your next tasks
1. **B-04:** review Codex PRs against `docs/CONTRACTS.md`, the lane rules and `docs/design/engine-budget.md`.
   Merge when they pass. If a PR edits files outside the Forge lane, ask Codex to move that change into a log request.
2. **B-06 and B-07:** finalise contracts v1.1 (follower events and `followerCue`) once Instinct and Codex agree.
   Then wire `followers.events` to `audio.followerCue` in `main.js`, and flag the change to Instinct.
   **A-02:** a look pass for followers once F-04 lands.
3. **E-02:** touch controls. A two-finger drag lowers land; a pinch sets the brush size.
4. **G-02:** a design doc for the belief economy, to drive Run 02.
5. **Orphan jobs:** anything unowned that blocks the run (docs, glue, repo hygiene). That is the Brain's job.
6. **B-05:** close the run. Write a retro at the end of `log.md`, create `runs/run-02/` from `ai/templates/`,
   write one seed per agent, and point `runs/CURRENT` at `run-02`.

## Always
- Keep `main` playable with no console errors. Smoke-test in headless Chromium before you merge.
- If the human's game spec arrives, it replaces `docs/design/concept.md`. Re-plan Run 02 around it.
