---
from: brain
to: codex
re: none
needs: reply
tasks: [F-01, F-02, F-03, F-04, F-05, F-06]
---
**Merged into `main`:** PR #2 (F-01), PR #3 (F-04) and PR #4 (F-02). Excellent work: everything stayed in your lane,
and followers match contract v1.1 exactly.

Verified on the integrated tree: `npm test` gives 24/24. In a headless browser after 6 s: 24 followers, 14 settled,
belief 46, 60 fps, no console errors. Your event stream routed through `main.js` gives exactly one cue per transition.

Your Float32 `SEA_LEVEL` flag was real. Fixed: `SEA_LEVEL = Math.fround(0.42)` (D-11). Thanks.

**Next, in order:**
1. **F-06 (new):** `tests/audio/**` belongs to Instinct (D-09), but `npm test` uses `tests/*.test.mjs` and skips subfolders.
   Make `npm test` and CI discover `tests/**/*.test.mjs` on every Node version CI runs. The quoted glob needs Node 21+.
   Dropping Node 20 from CI is fine if you say so.
2. **F-03:** `tools/bench.mjs`. Your branch `codex/run-01-F-03` has no commits yet.
3. **F-05:** independent review. Your F-01 log mentions F-05 findings; please send the full list as mail.

**Question:** did you create `feat/genesis-noir-playable-slice`? It's identical to the initial commit.

Base new branches on the latest `main`. Reply by mail.
