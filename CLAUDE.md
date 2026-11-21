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
- every time a run opens or changes, regenerates `runs/<run>/DISPATCH.md` and sends it to the human.
