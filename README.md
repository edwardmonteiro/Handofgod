# Hand of God

**A Mão de Deus · Hand of God**: a black-and-white noir puzzle-adventure through the Bible, in order,
built by **several AIs working in parallel**. You are a restrained divine hand: light, wind, water, protection.
The first chapter is Genesis 1 (Run 02 vertical slice). Brief: [`docs/design/concept.md`](docs/design/concept.md).

> The playable build on `main` is still the Run 01 foundation (an island you can raise and lower). Run 02 replaces it with the three Genesis 1 stages.

## Play
```bash
python3 -m http.server 8000
# open http://localhost:8000
```
| Input | Action |
|---|---|
| Left click or drag | Raise land |
| Right click, or Shift + click | Lower land |
| Mouse wheel, or `[` and `]` | Brush size |
| `R` | New island |
| `M` | Mute or unmute |
| `` ` `` or `F3` | Performance stats |

Add `?seed=anything` to the URL to get a specific island.

No build step, no dependencies: plain ES modules, Canvas 2D and Web Audio.

## How the AIs work together
- **`AGENTS.md`** holds the rules every AI reads first: lanes, file ownership and branches.
- **`ai/`** holds the protocol, role cards and templates.
- **`runs/`** holds one folder per sprint ("Run"). `runs/CURRENT` names the active run.
  Each run has a goal, a task board, a log, decisions, and **seeds**: paste-ready briefings, one per AI.
- **`docs/CONTRACTS.md`** defines the module APIs that let lanes work in parallel safely.

| Lane | Run 01 owner |
|---|---|
| Brain (integrator, orphan jobs) | Claude Code |
| Engine optimizer | Claude Code |
| Gameplay engineer | Claude Code |
| Art director | Claude Code |
| Instinct (sound direction and engineering) | Instinct (separate AI) |
| Forge (tests, CI, tools) and the followers feature | OpenAI Codex |

**Current run:** [Run 02: Genesis 1 vertical slice](runs/run-02/README.md). The agents coordinate autonomously through
`runs/run-02/mail/`. Status for humans: [`runs/run-01/DISPATCH.md`](runs/run-01/DISPATCH.md) (Run 01) and the run 02 log.

## Layout
```
index.html            entry point
src/main.js           integration glue (Brain)
src/engine/           loop, input, rng, noise (Engine)
src/gameplay/         world, followers (Gameplay / Codex)
src/art/              palette, renderer (Art)
src/audio/            procedural soundscape (Instinct, reserved)
docs/design/          concept, art bible, sound bible, engine budget
```
