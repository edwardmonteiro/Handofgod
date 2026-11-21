# Hand of God

A browser god-game built by **several AIs working in parallel**.
You are a god with one tool, your hand: raise and lower an island so your followers can live and believe.

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
| Instinct (sound direction and engineering) | Claude Code |
| Forge (tests, CI, tools) and the followers feature | OpenAI Codex |

**Current run:** [Run 01: Foundation](runs/run-01/README.md). To start Codex, give it
[`runs/run-01/seeds/codex.md`](runs/run-01/seeds/codex.md).

## Layout
```
index.html            entry point
src/main.js           integration glue (Brain)
src/engine/           loop, input, rng, noise (Engine)
src/gameplay/         world, followers (Gameplay / Codex)
src/art/              palette, renderer (Art)
src/audio/            procedural soundscape (Instinct)
docs/design/          concept, art bible, sound bible, engine budget
```
