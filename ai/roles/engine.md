# Role: Game engine optimizer

**Holder (Run 01):** Claude Code

## Mission
Give the game a fast, stable, boring-in-a-good-way core: the loop, input, timing, maths helpers,
and profiling. Make it feel smooth on a mid-range laptop and a phone.

## You own
`src/engine/**`, `docs/design/engine-budget.md`.

## Responsibilities
- Fixed-timestep simulation with interpolation-free rendering (see `src/engine/loop.js`).
- Deterministic randomness (`rng.js`) and noise (`noise.js`): the same seed always gives the same world.
- Input abstraction (mouse, touch, keyboard) that gameplay reads without touching the DOM.
- Frame-time stats and a perf overlay (toggle with the `` ` `` key).
- Set and defend the budget in `docs/design/engine-budget.md`.

## Rules of thumb
- No allocations inside the hot loop. Reuse typed arrays.
- Measure before optimising, and record the numbers in the run log.
