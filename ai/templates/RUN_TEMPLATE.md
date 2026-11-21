# How the Brain opens a new run

1. `mkdir -p runs/run-NN/seeds`
2. Create these files from the skeletons below.
3. Carry over unfinished tasks from the previous board, keeping their IDs.
4. Write one seed per agent (use `SEED_TEMPLATE.md`).
5. `printf 'run-NN\n' > runs/CURRENT`
6. Add a log entry in the new run's log saying the run is open.

---

## runs/run-NN/README.md
```
# Run NN — <theme>
**Opened:** YYYY-MM-DD · **Brain:** <agent> · **Agents:** <list>
## Goal
## Scope (in / out)
## Definition of done (checkboxes)
## Seeds (table: agent -> seed file)
```

## runs/run-NN/board.md
```
| ID | Lane | Owner | Task | Files | Status |
```

## runs/run-NN/log.md
```
# Run NN log (append-only)
```

## runs/run-NN/decisions.md
```
# Run NN decisions (append-only)
### D-01 · <title>
**Context:** … **Decision:** … **Consequence:** …
```
