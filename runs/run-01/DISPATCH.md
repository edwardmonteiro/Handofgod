# Dispatch · Run 01

The Brain (Claude Code) writes this file whenever a run opens or changes, and sends it to the human.
Each block is one message, to copy and paste into that AI as-is.

**Dispatch version:** 01.1 · 2026-11-21 · **Repo:** https://github.com/edwardmonteiro/Handofgod

---

## Message 1 → OpenAI Codex

```
PROJECT: Hand of God
RUN: 01 (Foundation) · DISPATCH 01.1
FROM: Claude Code (Brain: integrator, engine, gameplay, art, Instinct/sound)
TO: OpenAI Codex (Forge: tests, CI, tools, plus the followers feature)

Repo: https://github.com/edwardmonteiro/Handofgod
Base branch: main. If main has no AGENTS.md yet, base your work on ccr-2bd6853f-rxymdq (PR #1).

YOUR ROLE
In Run 01 you are FORGE. The engine, art, gameplay and sound lanes belong to Claude Code,
so ignore any earlier message that gave you those roles. This keeps the two of us out of each other's files.

READ FIRST
AGENTS.md -> ai/PROTOCOL.md -> ai/roles/forge.md -> docs/CONTRACTS.md -> runs/run-01/board.md
Your full briefing is in runs/run-01/seeds/codex.md.

TASKS (in order, one branch and one PR each, named codex/run-01-<ID>)
F-01  Test harness: package.json ("type":"module", "test":"node --test tests/") and tests for
      src/engine/rng.js, src/engine/noise.js and src/gameplay/world.js (determinism, ranges,
      brush clamping, island has land and water, terrain bands). No dependencies.
F-04  Followers: create src/gameplay/followers.js exactly as docs/CONTRACTS.md specifies
      (createFollowers, stepFollowers; wander, settle on grass, drown in water, belief).
      Pure JS, no DOM. Add tests/followers.test.mjs.
      Do NOT edit src/main.js or the renderer: they load your module automatically.
F-02  CI: .github/workflows/ci.yml runs npm test on Node 20 and 22 for every PR and for pushes to main.
F-03  Benchmark: tools/bench.mjs times generateIsland (192x120) and 1,000 applyBrush calls.
      Record the results in runs/run-01/log.md against docs/design/engine-budget.md.
F-05  Independent review: read all of src/ and write the bugs and risks you find in
      runs/run-01/log.md, tagged @engine @art @gameplay @instinct. Don't fix other lanes' files.

RULES
- Edit only tests/**, tools/**, .github/**, package.json and src/gameplay/followers.js.
- Start each commit message with the task ID, e.g. "F-04: followers wander and settle".
- In each PR, set your board row to "review" and add a log entry (format in ai/PROTOCOL.md).
- Don't merge your own PRs. The Brain reviews and merges them.
- Contract unclear? Write "@brain" in runs/run-01/log.md and move to your next task.

DONE MEANS
npm test is green locally and in CI; followers show in the game (cream dots, amber when
settled, coral when drowning) and the HUD shows Belief; the benchmark results and review
findings are in the log; all PRs are open.

When you finish, reply with: the PR links, test results, benchmark numbers and any blockers.
```

---

## Message 2 → Claude Code (a new session, if this one ends)

```
PROJECT: Hand of God
RUN: 01 (Foundation) · DISPATCH 01.1
FROM: Claude Code (Brain, previous session)
TO: Claude Code (Brain, Engine, Gameplay, Art, Instinct/sound)

Repo: https://github.com/edwardmonteiro/Handofgod

Read runs/run-01/seeds/claude-code.md and continue from there.
State: foundation done (B-01..B-03, E-01, G-01, A-01, I-01). PR #1 holds it.
Next: B-04 review and merge Codex PRs; A-02 and I-02 follower art and sound cues;
E-02 touch controls; G-02 belief-economy design doc; B-05 close the run.
Every time a run opens or changes, regenerate runs/<run>/DISPATCH.md and send it to the human.
```

---

## Message 3 → Any other AI (Gemini, Copilot, ChatGPT, and so on)

```
PROJECT: Hand of God
RUN: 01 (Foundation) · DISPATCH 01.1
FROM: Claude Code (Brain)
TO: Guest AI

Repo: https://github.com/edwardmonteiro/Handofgod

You're joining as a GUEST. Every code lane has an owner this run, so don't edit anything under src/.
Read AGENTS.md and runs/run-01/seeds/guest-ai.md, then pick one job:
 A) Playtest report: run the game (python3 -m http.server 8000) and write
    runs/run-01/playtest-<your-name>.md covering what feels good, what's confusing,
    and any bugs, with steps to reproduce.
 B) Design pitch: a one-page idea for a new divine power or system, as runs/run-01/pitch-<your-name>.md.
Deliver it as a PR from branch guest-<your-name>/run-01-<job>, or paste the text back to the human.
```

---

## Changelog
- **01.1** (2026-11-21): first dispatch. Codex assigned to Forge plus F-04.
