# AGENTS.md — Rules for every AI working on Hand of God

> This file is read automatically by OpenAI Codex and should be read first by any AI
> (Claude Code, Codex, Gemini, Copilot, etc.). Humans: see `README.md`.

Hand of God is built by **several AIs working in parallel**, coordinated in **Runs**.
A Run is one sprint with a goal, a task board, and one seed (briefing) per AI.

## 0. We work autonomously: the repo is the only channel

The human no longer relays messages between AIs. **Talk through mail files in the repo** (see `ai/MAIL.md`).
`main` is the shared truth. The Brain merges passing PRs into it on a schedule (human-approved, D-10).

**Every session, start here:**
1. `git fetch origin` and read `main`: `runs/CURRENT`, then your mail in `runs/<run>/mail/`
   (files whose `to:` includes you or `all`).
2. Do the work your mail and the board ask for, in your lane, on your own branch, and open a PR.
3. Reply with a new mail file (`YYYYMMDD-HHMM-<you>-to-<them>-<slug>.md`) on any branch you push.
   The Brain collects it, even before your PR merges.
4. If your platform supports schedules, re-run this loop every few hours.

## 0b. Before you touch anything

1. Read `runs/CURRENT` to find the active run (e.g. `run-01`).
2. Read `runs/<run>/README.md` (the goal) and **your seed** in `runs/<run>/seeds/`.
3. Read `ai/PROTOCOL.md` (how we work together) and your role card(s) in `ai/roles/`.
4. Read `docs/CONTRACTS.md` before calling or changing any module API.

## 1. Who owns what (lanes)

| Lane | Role card | Agent (Run 01) | Owns these paths |
|---|---|---|---|
| Brain (integrator) | `ai/roles/brain.md` | Claude Code | `AGENTS.md`, `CLAUDE.md`, `ai/**`, `runs/**`, `docs/CONTRACTS.md`, `src/main.js`, `index.html` |
| Engine optimizer | `ai/roles/engine.md` | Claude Code | `src/engine/**`, `docs/design/engine-budget.md` |
| Gameplay engineer | `ai/roles/gameplay.md` | Claude Code | `src/gameplay/**` (except files given to others on the board) |
| Art director | `ai/roles/art.md` | Claude Code | `src/art/**`, `docs/design/art-bible.md` |
| Instinct (sound) | `ai/roles/instinct.md` | **Instinct** (separate AI, confirmed by the human in Dispatch 01.2) | `src/audio/**`, `docs/design/sound-bible.md`, `tests/audio/**` (reserved: no other agent edits these) |
| Forge (build, test, tools) | `ai/roles/forge.md` | OpenAI Codex | `tests/**` (except `tests/audio/**`), `tools/**`, `.github/**`, `package.json`, plus files the board gives to Codex |

**Rule:** change only the paths you own, plus files a board task gives you.
Need a change in someone else's lane? Write a request in `runs/<run>/log.md` and don't edit their files.

## 2. Branches and commits

- Work on your own branch: `<agent>/run-NN-<task-id>`, e.g. `codex/run-01-F-01` or `instinct/run-01-I-01`.
  (Claude Code cloud sessions may use a branch name the platform gives them instead.)
- Open a pull request into `main`. The **Brain** reviews and merges. Don't merge your own PR.
- Start each commit message with the task ID: `F-01: add node test harness`.
- Never force-push to `main` or to another agent's branch.

## 3. Tech ground rules

- Plain JavaScript ES modules, HTML5 Canvas 2D and Web Audio. **No build step.**
  The game must run from `index.html` with any static server.
- No runtime dependencies. Dev-only tools (tests, lint) go through `package.json`, owned by Forge.
- Keep logic modules free of the DOM (no `window` or `document`) so Node can test them.
  Today that means `src/engine/rng.js`, `src/engine/noise.js` and `src/gameplay/*.js`.
- All art and sound is **original and procedural**, generated in code.
  Don't add third-party assets unless their licence is recorded in `docs/design/`.
- Performance budget: see `docs/design/engine-budget.md`. Never break it.

## 4. Run the game

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## 5. When you finish a task

1. Tick the task on `runs/<run>/board.md` (in your PR).
2. Add a few lines to `runs/<run>/log.md`: what changed, what you learned, what is blocked.
3. If you made a design decision, add it to `runs/<run>/decisions.md`.
