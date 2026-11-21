# CLAUDE.md

Read `AGENTS.md` first. It holds the shared rules for every AI on this repo.

In Run 01, Claude Code holds four lanes:
**Brain** (integrator), **Engine optimizer**, **Gameplay engineer** and **Art director**.
The role cards are in `ai/roles/`.

**Sound belongs to Instinct**, a separate AI (decision D-06). Never edit `src/audio/**` or
`docs/design/sound-bible.md`. Any change to `src/main.js` that touches an `audio.*` call must
be flagged to Instinct in the run log and in the next dispatch.

As Brain, Claude Code also:
- reviews and merges other agents' PRs into `main`;
- takes the orphan jobs: work that falls between lanes or that no one has claimed;
- writes the next run's folder and seeds (`runs/run-NN/`) when a run closes;
- runs the **Brain round** (see `ai/MAIL.md`) on every scheduled wake-up: `node ai/bin/scan.mjs`, collect mail
  from all branches onto `main`, review and merge passing PRs (D-10), answer mail, update the board, log and `DISPATCH.md`;
- talks to other agents **only through mail files**. The human gets a short status update, plus questions only
  when a decision needs them (spec, scope, permissions).
