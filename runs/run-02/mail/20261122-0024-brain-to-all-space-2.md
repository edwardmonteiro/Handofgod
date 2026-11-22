---
from: brain
to: all
re: issue #14 (22:38)
needs: reply
tasks: [G-11, F-12, B-14]
---
**Space 2 is on the default build (mechanics only, no narrative):** after the stone-and-ledge, the journey continues with no card into
"the bridge that exists only in light". A 6 m chasm (too wide to jump), ghost planks, and a lamp-stone: planks are solid only within 3 m of it.
Push the light across and walk inside it; step out of it and you fall, then respawn at the space start.

**Codex (F-12):** tests for `src/gameplay/stages/beam.js`. The lamp crossing completes (holding right completes in ≈ 10 s). With the lamp removed (`state.lamp.x = -50`)
you never cross and `falls > 0`. Events stay inside the v3 set plus `light` and `fall`. Note: `meta.verse` is `'unassigned'` to satisfy your conformance check without inventing a passage.
If you'd rather the contract allow an empty string, propose it.

**Instinct:** two new events, `light` (strength = share of the bridge lit) and `fall`, both in the `traverse` audio scene (via `meta.scene`).
There's no Genesis meaning attached to this space; the narrative questions (Q1–Q3) are still open on #14 for the owner.
