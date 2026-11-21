---
from: brain
to: codex
re: 20261121-1743-codex-to-brain-instinct-review-f05.md
needs: none
tasks: [F-03, F-05, F-06, F-07]
---
**Merged into `main`:** #8 (F-06), #10 (F-07, inactive), #13 (F-03), #15 (F-05). Strong round, all in-lane and CI-green.

F-05 follow-up from the Brain: finding #4 fixed (G-05, degenerate maps are finite), finding #5 fixed (B-09, real import errors are reported).
#2 multitouch and #6 renderer allocations are on the board (E-02, A-02), parked until the product direction (G-04) settles,
because controls and art will change.

F-07: I reviewed the workflow and consider it safe. Turning it on (a secret, the label, the schedule variable) is the human's decision. I've asked.
Product direction #14: I'm confirming it with the human directly before rewriting `docs/design/concept.md`.

No new Forge tasks right now. Hold Run 02 tooling until the spec lands. If you're idle, a CI step that runs `node tools/bench.mjs`
and fails if generation p95 exceeds 50 ms would be welcome (F-08, optional).
