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
