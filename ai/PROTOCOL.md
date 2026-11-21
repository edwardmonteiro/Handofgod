# Parallel AI protocol

How several AIs build one game at the same time without stepping on each other.

## The analogy

Think of a building site. The **Brain** is the site foreman: it holds the plans
(`docs/CONTRACTS.md`), hands out work orders (`board.md`) and inspects every delivery (PR review).
Each trade (engine, art, sound, tools) works on its own floor (**lane**) and never rewires someone else's room.
The **log** is the site diary everyone signs at the end of a shift.

## The Run cycle

```
 Brain writes run-NN/  ->  agents read their seeds  ->  agents work in their lanes, in parallel
          ^                                                           |
          |                                                           v
 Brain closes the run  <-  Brain reviews and merges PRs  <-  agents open PRs and write log entries
 (retro + seeds for run-NN+1)
```

1. **Open:** the Brain creates `runs/run-NN/` with `README.md` (goal), `board.md` (tasks),
   `seeds/<agent>.md` (one briefing per agent), `log.md` and `decisions.md`.
   It then points `runs/CURRENT` at the new run.
2. **Seed:** the human pastes each seed into the matching AI, or the AI reads it from the repo.
3. **Work:** each agent claims its tasks on the board by setting status to `doing` and works on its own branch.
4. **Integrate:** agents open PRs. The Brain reviews them against the contracts and the budget, then merges.
5. **Close:** the Brain writes a retro at the end of `log.md` and opens the next run.

## Files every run has

| File | Who writes it | Purpose |
|---|---|---|
| `README.md` | Brain | Goal, scope, and the definition of done |
| `board.md` | Everyone (own rows only) | Tasks with ID, owner, status and files |
| `seeds/<agent>.md` | Brain | A briefing you can paste straight into that AI |
| `log.md` | Everyone, append-only | Handoffs, blockers, requests to other lanes |
| `decisions.md` | Everyone, append-only | Short decision records: context, decision, consequence |

## Task IDs

Use a lane prefix and a number: `B-` Brain, `E-` Engine, `G-` Gameplay, `A-` Art, `I-` Instinct, `F-` Forge.
IDs are unique inside a run. Unfinished tasks carry over to the next run with the same ID.

## Status values

`todo` → `doing` → `review` (PR open) → `done`. Use `blocked` and say why in `log.md`.

## Conflict rules

1. **Contracts win.** If code and `docs/CONTRACTS.md` disagree, the contract is right until the Brain changes it.
2. **To change a contract**, ask in `log.md` and tag `@brain`. Only the Brain edits `CONTRACTS.md`.
3. **Two agents need the same file?** The board owner edits it and the other sends a request through the log.
4. **Stuck for more than one task?** Mark the task `blocked`, write why, and move to your next task.

## Log entry format

```
### 2026-11-21 · codex · F-01
Done: node test harness, 6 tests for world.js.
Learned: applyBrush clamps heights to [0,1], as the contract says.
Blocked/Requests: @brain please expose world.seed in CONTRACTS.md.
```
