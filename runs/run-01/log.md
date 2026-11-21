# Run 01 log (append-only)

Format: see `ai/PROTOCOL.md`. Newest entries at the bottom.

### 2026-11-21 · claude-code · B-01 B-02 B-03 E-01 G-01 A-01 I-01
Done: repo operating system for parallel AI work (AGENTS.md, protocol, six role cards,
contracts v1), the Run 01 package with seeds, and the first playable slice: a procedural island,
raise and lower brush, hill-shaded renderer with animated water, and a procedural Web Audio soundscape.
Measured: 60 fps, about 1.2 ms per frame (sim < 0.1 ms, draw about 1.2 ms) in headless Chromium at 1280×800.
Learned: `src/main.js` loads `src/gameplay/followers.js` with a dynamic import. Until Codex ships
F-04, the browser console shows one expected 404 for that file. This is not a bug.
Blocked/Requests: none. @codex, your lane is open. Start with F-01, then F-04.
The human has not sent a game spec yet; `docs/design/concept.md` is provisional.

### 2026-11-21 · instinct · Dispatch 01.2 (recorded by the Brain)
Received from Instinct, as relayed by the human: Instinct owns sound direction and engineering.
Instinct inspected PR #1 at `f128a72` and will build on it. Scope: I-01 audio review and I-02 follower sounds.
Its priorities: (1) the sea-volume mismatch, (2) runtime tests of unlock, mute, feedback and levels,
(3) agree on the settle/drown interface before wiring anything.

### 2026-11-21 · claude-code (Brain) · B-06, handoff to Instinct
Done: lane reassigned in AGENTS.md, CLAUDE.md, README, the role cards and this board (decision D-06).
Proposed contracts v1.1 (decision D-07): `Followers.events` plus an optional `audio.followerCue(type, pan)`.
**Handoff baseline for Instinct:** `src/audio/audio.js` and `docs/design/sound-bible.md` are unchanged since
`1467615` (both commits `1467615` and `f128a72` hold identical audio files). No agent has touched them since.
Claude Code will make no further audio edits.
**Flags for @instinct (Brain inspected the code; it did not listen to anything):**
1. Sea-volume mismatch, confirmed: the sound bible says more water gives a brighter *and louder* sea,
   but `ambience()` only moves `seaFilter.frequency`. Sea gain is fixed at 0.16, plus the swell LFO.
2. Automation load: `main.js` calls `audio.shape()` on every 60 Hz step, including `shape(0, 0)` while idle,
   so `setTargetAtTime` is scheduled about 60 times per second without pause. The Brain can change `main.js`
   to call it only when the direction or intensity changes. Tell us which you prefer: dedupe in audio, or in `main.js`.
3. The swell LFO depth (0.096) is added to a base of 0.16, so the sea gain swings 0.064–0.256 and its peak
   goes slightly over the bible's limit of 0.25 per layer. Please check levels by ear.
4. Unlock: `unlock()` runs on canvas `pointerdown` and window `keydown`. With mute on, `build()` sets master gain to 0.
**Runtime checks the Brain has done for audio:** none by ear. Headless Chromium only confirmed there are no errors.
Requests: @instinct, please accept or amend B-06 in this log. @codex, please accept or amend the `events` field before finishing F-04.

### 2026-11-21 · instinct · Dispatch 01.4 (recorded by the Brain)
B-06: **ACCEPT** `followers.events` → `followerCue(type, pan)`, with one emit per transition and the Brain routing.
Flag 2: dedupe inside audio and reset the cache when the context is rebuilt; `main.js` unchanged (D-08).
I-01: audio still matches `f128a72` at `6969aca`. A swell-depth change to keep the sea under 0.25, including at startup, is in progress.
Evidence reported: 6 mocked unit tests pass; Chrome OfflineAudioContext render of the sea-volume candidate gave no clipping
in the measured scenarios, with a peak of -6.03 dBFS (sampled, not guaranteed). Unlock/resume and saved mute were checked on the PR #1 game only.
Unverified: mobile playback, final mix approval, and timbre by ear. **Nothing has been published by Instinct yet.**

### 2026-11-21 · claude-code (Brain) · B-04 scan, D-08, D-09
- Recorded Instinct's acceptance in contracts 1.1a. B-06 now waits only on Codex.
- **Codex F-01:** branch `codex/run-01-F-01` at `ab8b884` (based on `6969aca`). It touches only Forge files.
  The Brain ran `npm test`: **15/15 pass**. Missing: a PR, the board row, a log entry. @codex, please open the PR.
- **Test discovery gap (D-09):** `tests/*.test.mjs` skips `tests/audio/`. @codex, please fix it in the F-01 PR.
- **Unknown branch:** `feat/genesis-noir-playable-slice` exists on origin. It is identical to the initial commit `212c255`
  (no work on it) and doesn't follow the naming rule. Whose is it? If it's planned work, it needs a board row; if not, the human can delete it.

### 2026-11-21 · codex · F-01
Done: dependency-free Node ESM harness with 15 RNG, noise and world tests; branch codex/run-01-F-01, PR #2.
Verified locally: 15 core cases pass under Node 22 when run in the same mirror as the proposed followers module; CI still pending F-02.
Learned: `node --test tests/` fails under Node 22 because the directory is treated as a single module; using `node --test tests/*.test.mjs`.
Blocked/Requests: @brain PR #1 must land before F-01 for a clean review. @gameplay review Float32 SEA_LEVEL exact-threshold precision, flagged in F-05.

### 2026-11-21 · codex · F-04
Done: pure JS followers implementation and nine Node tests. Wanderers spawn on land, settle on interior grass, accrue belief, drown after terrain is lowered and disappear after 2 seconds. Events are plain data.
Interface: ACCEPT `Followers.events` v1.1 (and Instinct accepts it in Dispatch 01.4). `stepFollowers` clears events at the start of each step and emits `settle` / `drown` once, on transition. Brain owns event routing to optional `audio.followerCue(type,pan)`; no audio imports or DOM in followers.
Verified locally: nine followers tests pass on Node 22; integrated 24-test candidate suite also passed. Browser/HUD smoke and actual CI remain unverified until integration.
Blocked/Requests: @brain B-07 can route events after your review; @instinct proceed with sound design against the accepted interface. This task does not modify `main.js`, renderer, or audio.

### 2026-11-21 · codex · F-02
Done: GitHub Actions `.github/workflows/ci.yml` with `npm test` matrix on Node 20 and Node 22 for pull requests and pushes to main. Read-only permissions and 10-minute job timeout; no package installation or runtime dependencies.
Verified: workflow YAML statically reviewed. Live GitHub Actions job not yet verified; F-01 package.json must merge before this workflow runs successfully.
Blocked/Requests: @brain merge PR #1 and F-01 PR #2 before F-02; review CI results before calling Run 01 complete.

### 2026-11-21 · claude-code (Brain) · B-04, B-06, B-07, B-08, G-03
- **Autonomy (D-10):** mail system `ai/MAIL.md`, scan tool `ai/bin/scan.mjs`, and a scheduled Brain round. The human no longer relays messages.
- **Merged:** PR #1 (foundation) into `main`. Integrated Codex PRs #2 (F-01), #3 (F-04) and #4 (F-02) on top, resolving
  log and board conflicts by keeping every entry.
- **Verified on the integrated tree:** `npm test` gives 24/24. Browser smoke (headless Chromium, 1280×800): after 6 s,
  24 followers, 14 settled, belief 46, 60 fps, about 1.2 ms per frame, no console errors.
- **B-07 done:** `main.js` routes `followers.events` to `audio.followerCue(type, pan)` if it exists. Checked with a stub:
  10 settle and 24 drown cues, one per transition, pan between -0.43 and 0.33. **@instinct: this is an integration change affecting audio.**
- **B-06 FINAL:** contracts v1.1 accepted by Instinct and Codex.
- **G-03 / D-11:** `SEA_LEVEL` is Float32-exact, thanks to the Codex flag.
- Open: F-03 (no commits yet on `codex/run-01-F-03`), F-05 review, F-06 test discovery (D-09), I-01, I-02,
  and the empty branch `feat/genesis-noir-playable-slice` (owner unknown).

### 2026-11-21 · codex · autonomy (relayed by the human, recorded by the Brain)
Codex enabled a Forge automation that checks GitHub every hour, follows PRs and picks up tasks in its lane.
**The loop is now autonomous on both sides:** Codex polls every hour, and the Brain runs a round every 2 hours (scheduled task).

### 2026-11-21 · claude-code (Brain) · B-04
- PR #5 merged (CI green on Node 20 and 22, the first live CI run). PRs #3 and #4 auto-closed as merged.
- PR #2 follow-up `1e36e57` (F-06 / D-09): `"test": "node --test"`. The Brain checked it with a nested probe: 25/25 found on Node 22.
  Its own CI didn't trigger because it was pushed before `ci.yml` reached `main`, so it is integrated here, where CI covers Node 20.
- Coordination bell: issue #6 (`@codex` mentions).

### 2026-11-21 · codex · F-03
Done: Node 22.16.0 Linux x64 benchmark of generateIsland(192x120) across 30 runs and 1,000 deterministic applyBrush calls (after 5 warmups).
Measured: generation median 3.406 ms, p95 3.649 ms, max 4.255 ms; budget <= 50 ms (p95 13.7x under budget). Brush calls total 6.175 ms, 0.00617 ms/call, 67,556 cells changed.
Learned: generation budget passes on this environment. Numbers are runtime-specific, not mobile-device performance. Rerun `node tools/bench.mjs` in CI and an actual Android device to validate device-level speed.
Blocked/Requests: @brain review benchmark PR; no engine or audio file edits.

### 2026-11-21 · codex · F-05
Done: independently reviewed every `src/` module on `main`; eight findings with severity, lane owner and evidence in `tools/reviews/run-01-independent-review.md`. Confirmed 1×1 island NaN in Node 22 and reported product-spec mismatch in issue #14.
Learned: `src/main.js` obscures follower import errors; touch handling needs multi-pointer state; sound sea-volume and automation changes are already assigned to Instinct.
Blocked/Requests: @brain review issue #14 before Run 02 work; @engine finish E-02; @instinct finish I-01/I-02. No cross-lane edits made.

### 2026-11-21 · codex · F-06
Done: changed npm test to native Node test discovery (node --test), covering both tests/*.test.mjs and tests/audio/*.test.mjs without shell globs. Verified nested discovery in a temporary fixture on Node 22: 2/2 passed.
Learned: Node 20 and 22 support native node:test file discovery; retained both CI versions. The integrated 24-case suite and future Instinct audio tests are covered by the same command.
Blocked/Requests: @brain review PR; @instinct can add tests/audio/*.test.mjs without editing package.json. Node 20 CI execution remains to be confirmed on GitHub.

### 2026-11-21 · claude-code (Brain) · B-04, B-09, G-05: big integration round
- **Integrated:** Instinct PR #11 (I-01 and I-02 audio), Codex PRs #13 (F-03 benchmark), #15 (F-05 review), #10 (F-07 runner, inactive)
  and #8 (F-06). Log and board conflicts were resolved by keeping every entry; the board was rewritten with current statuses.
- **Instinct's audio, reviewed by the Brain** (code only, not by ear): the sea is now louder with more water (base 0.08–0.16, max 0.248);
  `shape()` dedupe follows D-08; `followerCue` matches contract v1.1 with at most 4 voices, a 90 ms gap, nothing played while muted, and no implicit unlock.
  Gap: the 6 mocked tests Instinct reported are not in the PR (now I-03).
- **F-05 fixes in Brain lanes:** G-05 (1×1 map NaN fixed, 1×1, 1×5 and 192×120 all finite) and B-09 (followers import errors are no longer masked).
- **Verified:** `npm test` 24/24. Browser smoke after a click unlock: `followerCue` live, a flood burst fired, 60 fps, 1.24 ms per frame, no console errors.
  Minor engine note: two presses of the same key within one 16 ms step count as one, since `pressed()` uses a Set. Harmless for humans.
- **Product direction (G-04, issue #14):** Codex relays the human's direction as a biblical chronological black-and-white noir puzzle-adventure.
  The Brain is confirming it with the human directly before rewriting the concept. B-05 and G-02 are blocked on it.
- **F-07 runner:** reviewed as safe. It checks out trusted `main`, runs only from a label or an opt-in schedule, has a concurrency limit, and does nothing until the human adds a secret.

### 2026-11-21 · claude-code (Brain) · B-05: RUN 01 CLOSED (retro)
**Shipped:** the parallel-AI operating system (lanes, contracts, mail, scheduled Brain round, gated Actions runner); a playable island
with raise and lower; procedural reactive audio (Instinct); followers with events (Codex); 24 tests; CI on Node 20 and 22; benchmark
(generation p95 3.6 ms against the 50 ms budget); an independent review with 8 findings (2 fixed, 2 parked).
**What worked:** file-ownership lanes meant zero cross-lane edits by any agent. Contract-first interfaces (follower events) let three agents
build without blocking. Codex's independent review caught a real bug (Float32 sea level) and the product drift.
**What broke:** the Brain wrote a provisional concept without the human's spec, and it was wrong (D-05 to D-12). Every PR touched the shared
log and board, so every merge conflicted (resolved by union). Instinct's tests weren't committed. Instinct has no automatic wake-up.
**Changes for Run 02:** the product direction is now approved (D-12). Agents should put their log notes in **mail files** (unique filenames,
so no conflicts) rather than appending to `log.md`. Only the Brain appends to `log.md` and edits `board.md` (D-13).
**Carry-over:** I-03 (audio tests). E-02 and A-02 are folded into Run 02's E-03 and A-03.
