# F-05 — independent Run 01 source review

Date: 2026-11-21. Scope: all files currently present under `src/` on `main`. Read-only review, no cross-lane source changes.

## Findings by severity

### P0/P1 — product and usability
1. **@brain @gameplay @art — Product-spec drift, confirmed.** `docs/design/concept.md` remains a provisional sandbox about raising terrain to gather Belief, while Edward specified a biblical chronological noir puzzle-adventure with suspense and emotional discovery. `src/main.js` and `src/art/palette.js` still implement the island sandbox using blue/green/gold colors. Action: Brain should replace the provisional GDD and prototype acceptance criteria; issue #14. This is not a technical test failure.
2. **@engine — Mobile multitouch controls incomplete, confirmed by code review.** `src/engine/input.js` models only global primary/secondary states. A `pointerup` releases all pointers; there is no active-pointer map, pinch zoom, or 2-finger lowering. E-02 is already on the board. Action: per-pointer capture/ownership and a phone gesture smoke test.
3. **@instinct — Soundscape baseline not matching documented dynamics, confirmed from code.** `src/audio/audio.js` changes sea cutoff when land ratio changes but not `seaGain`; the swell 0.16 ± 0.096 reaches 0.256 (above the 0.25 layer gain limit). `shape()` schedules parameter targets at 60 Hz even during long idle periods. Already assigned I-01 to Instinct, who accepted audio-side dedupe and a sea-volume fix. Do not fix from Forge.

### P2 — correctness and observability
4. **@gameplay — 1×1 world generates NaN, reproduced in Node 22.** `generateIsland(createWorld(1,1,5)).elev[0]` is NaN because `cx` and `cy` are zero (division by zero). The production map is 192×120, so this does not affect current gameplay. Action: validate minimum 2×2 dimensions or special-case degenerate maps; add an edge-case test.
5. **@brain — Optional followers import masks genuine runtime faults, confirmed by inspection.** In `src/main.js`, the broad `import('./gameplay/followers.js').then(...).catch(() => console.info('not present yet'))` reports a missing module even when `createFollowers` throws or import resolution fails for another reason. Action: keep optional-module compatibility but report the actual error with stack for non-missing-module failures.

### P3 — performance and QA
6. **@art — Per-frame allocations in renderer, confirmed by inspection.** `toScreen()` allocates arrays per follower and hand; HUD creates string/array/map allocations each frame. 24 followers is safe in headless smoke, but reuse scalars and caches if follower counts increase. Preserve 60 fps budget.
7. **@engine @gameplay — Mobile proof still missing.** No device-level DPR/gesture/fps benchmark yet; headless 60 fps isn't Android 60 fps. F-03 Node-generation p95 measured 3.649 ms against 50 ms budget, but no Android GPU/render measurement. Action: once the next vertical slice is ready, test on the target phone.
8. **@instinct — Audio cue validation pending.** `audio.followerCue` is optional and currently absent on `main`; B-07 routing exists and is guarded. Instinct must deliver I-02 and burst-limited cue tests. No audio-path edits from Forge.

## Verified and non-verified
- **Verified (source inspection):** lane ownership, v1.1 events in followers.js, B-07 optional cue routing, all modules listed above; 1×1 NaN reproduced in Node 22.
- **Previously verified by Brain:** 24 game tests, 60 fps headless, 24 follower smoke on integrated main (see run mail). Forge did not independently repeat that browser smoke here.
- **Still unverified:** native Android graphics, Instinct listening/mix approval, CI on PR #8, Claude Actions runner configured and operating autonomously.

## Actions requested
- @brain: prioritize issue #14 before planning Run 02 belief mechanics.
- @engine: complete E-02 and add multitouch tests/smoke.
- @gameplay: address edge-case map dimensions.
- @instinct: finish I-01 and I-02 in audio-owned paths.
- @art: align palette and staged scene assets to approved noir brief when Brain updates the spec.

The review did not edit engine, artwork, gameplay, audio or integration source.
