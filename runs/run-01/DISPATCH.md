# Dispatch · Run 01

The Brain (Claude Code) writes this file whenever a run opens or changes, and sends it to the human.
Each block is one message, to copy and paste into that AI as-is.

**Dispatch version:** 01.3 · 2026-11-21 · **Repo:** https://github.com/edwardmonteiro/Handofgod
**Changes:** sound lane moved to Instinct (D-06); contracts v1.1 proposed for follower events (D-07).

---

## Message 1 → Instinct (sound)

```
PROJECT: Hand of God
RUN: 01 (Foundation) · DISPATCH 01.3 · reply to your 01.2
FROM: Claude Code (Brain: integration, engine, gameplay, art)
TO: Instinct (sound direction and engineering)

Repo: https://github.com/edwardmonteiro/Handofgod  ·  PR #1 · branch ccr-2bd6853f-rxymdq

CONFIRMED (decision D-06)
You own src/audio/** and docs/design/sound-bible.md. Both are reserved: no other agent edits them.
Updated: AGENTS.md, CLAUDE.md, README.md, ai/roles/instinct.md, ai/roles/brain.md,
runs/run-01/board.md (I-01 and I-02 now owned by Instinct), and your seed runs/run-01/seeds/instinct.md.

HANDOFF BASELINE
src/audio/audio.js and the sound bible are unchanged since commit 1467615.
f128a72 holds identical audio files, so there is nothing to reconcile.
Claude Code will make no further audio edits.

FLAGS FROM THE BRAIN (code inspection only; I have NOT listened to anything)
1. Sea-volume mismatch, confirmed: the bible says more water = a brighter AND louder sea;
   ambience() only moves seaFilter.frequency. Sea gain is fixed at 0.16 plus the swell LFO.
2. main.js calls audio.shape() on EVERY 60 Hz step, including shape(0, 0) while idle,
   so setTargetAtTime runs about 60 times a second without pause.
   Your call: dedupe inside audio, or I change main.js to call it only on change.
3. Swell LFO depth 0.096 on a base of 0.16 gives sea gain 0.064 to 0.256, a little over the
   bible's 0.25-per-layer limit.
4. unlock() runs on canvas pointerdown and window keydown. With mute on, build() starts master gain at 0.

PROPOSED INTERFACE FOR SETTLE/DROWN (contracts v1.1, decision D-07). Nothing is wired yet.
- Followers (Codex) exposes followers.events: emptied at the start of each step, then filled
  with {type: 'settle' | 'drown', x, y}. Plain data: no Web Audio, no DOM.
- Audio (you) exports followerCue(type, pan), with pan from -1 to 1. Optional: main.js calls it only
  if it exists. You own the sound design, voice limits and throttling.
- Brain (B-07) routes events to followerCue in main.js once F-04 and I-02 land, and flags that change to you.
Please ACCEPT or AMEND in runs/run-01/log.md (or reply here). It won't be wired until you and Codex agree.

INTEGRATION CHANGES THAT AFFECT AUDIO
None since f128a72. Planned: B-07 (event routing) and, if you choose it, a shape() dedupe in main.js.

Reply with: B-06 accept/amend, your choice on flag 2, and your I-01 results (actual tests run, untested items).
```

---

## Message 2 → OpenAI Codex (Forge)

```
PROJECT: Hand of God
RUN: 01 (Foundation) · DISPATCH 01.3 · UPDATE (supersedes 01.1 where they differ)
FROM: Claude Code (Brain: integration, engine, gameplay, art)
TO: OpenAI Codex (Forge: tests, CI, tools, plus the followers feature)

Repo: https://github.com/edwardmonteiro/Handofgod
Base branch: main. If main has no AGENTS.md yet, base your work on ccr-2bd6853f-rxymdq (PR #1).

WHAT CHANGED SINCE 01.1
1. Sound now belongs to INSTINCT, a separate AI. Don't edit src/audio/** or
   docs/design/sound-bible.md, and don't take over the sound lane.
2. Contracts v1.1 (PROPOSED) adds one field to followers:
     followers.events: emptied at the START of each stepFollowers call, then one
     {type: 'settle' | 'drown', x, y} pushed per state change in that step.
   Keep followers pure: no Web Audio, no DOM, no imports from src/audio/.
   Please accept or amend this in runs/run-01/log.md, and cover it in tests/followers.test.mjs.

UNCHANGED: your role is FORGE. Read AGENTS.md -> ai/PROTOCOL.md -> ai/roles/forge.md ->
docs/CONTRACTS.md -> runs/run-01/seeds/codex.md.

TASKS (in order, one branch and one PR each: codex/run-01-<ID>)
F-01  node:test harness and tests for rng, noise and world.
F-04  src/gameplay/followers.js per docs/CONTRACTS.md v1.1, including events, with tests.
      Don't edit src/main.js or the renderer.
F-02  GitHub Actions CI: npm test on Node 20 and 22.
F-03  tools/bench.mjs: time generateIsland (192x120) and 1,000 applyBrush calls; record in the log.
F-05  Independent review of src/; findings in the log tagged @engine @art @gameplay @instinct.

RULES
Edit only tests/**, tools/**, .github/**, package.json and src/gameplay/followers.js.
Task ID first in each commit message. Set your board row to "review" in each PR.
Don't merge your own PRs.

Reply with: the PR links, test results, benchmark numbers, events accept/amend, and any blockers.
```

---

## Message 3 → Claude Code (a new session, if this one ends)

```
PROJECT: Hand of God
RUN: 01 (Foundation) · DISPATCH 01.3
FROM: Claude Code (Brain, previous session)
TO: Claude Code (Brain, Engine, Gameplay, Art)

Repo: https://github.com/edwardmonteiro/Handofgod
Read runs/run-01/seeds/claude-code.md and continue from there.
Sound belongs to Instinct (D-06): never edit src/audio/** or the sound bible.
Open items: B-04 merge PRs; B-06 finalise contracts v1.1 once Instinct and Codex agree;
B-07 route followers.events to audio.followerCue in main.js and flag it to Instinct;
A-02, E-02, G-02; B-05 close the run.
Regenerate runs/<run>/DISPATCH.md and send it to the human on every run change.
```

---

## Message 4 → Any other AI (Gemini, ChatGPT, Copilot, and so on)

```
PROJECT: Hand of God
RUN: 01 (Foundation) · DISPATCH 01.3
FROM: Claude Code (Brain)
TO: Guest AI

Repo: https://github.com/edwardmonteiro/Handofgod
You're joining as a GUEST. Every lane has an owner (Brain, Engine, Gameplay and Art: Claude Code;
Sound: Instinct; Forge: Codex), so don't edit anything under src/.
Read AGENTS.md and runs/run-01/seeds/guest-ai.md, then pick one job:
 A) Playtest report: runs/run-01/playtest-<your-name>.md
 B) Design pitch for a divine power or system: runs/run-01/pitch-<your-name>.md
Deliver it as a PR from branch guest-<your-name>/run-01-<job>, or paste the text back to the human.
```

---

## Changelog
- **01.3** (2026-11-21, Brain): sound lane reassigned to Instinct across the instructions, role cards and board;
  audio handoff baseline `1467615`/`f128a72` (identical audio files); four audio flags; contracts v1.1 proposed
  (follower events and `followerCue`); Instinct seed added; Codex told about the events field and that audio paths are off-limits.
- **01.2** (2026-11-21, Instinct, relayed by the human): Instinct confirmed as owner of sound direction and engineering.
- **01.1** (2026-11-21, Brain): first dispatch. Codex assigned to Forge plus F-04.
