# CLAUDE.md

Read `AGENTS.md` first. It holds the shared rules for every AI on this repo.

In Run 01, Claude Code holds five lanes:
**Brain** (integrator), **Engine optimizer**, **Gameplay engineer**, **Art director** and
**Instinct** (sound direction and engineering). The role cards are in `ai/roles/`.

As Brain, Claude Code also:
- reviews and merges other agents' PRs into `main`;
- takes the orphan jobs: work that falls between lanes or that no one has claimed;
- writes the next run's folder and seeds (`runs/run-NN/`) when a run closes.
