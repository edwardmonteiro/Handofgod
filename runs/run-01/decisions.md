# Run 01 decisions (append-only)

### D-01 · Plain ES modules, Canvas 2D and Web Audio, with no build step
**Context:** several AIs edit the code in parallel, and any of them must be able to run it instantly.
**Decision:** no bundler, no framework, no runtime dependencies. `index.html` runs from any static server.
**Consequence:** less tooling to break or disagree about. If we need WebGL or a bundler later, we'll revisit with a new decision.

### D-02 · Lanes are defined by file ownership
**Context:** parallel agents editing the same file cause merge conflicts and silent overwrites.
**Decision:** every path has exactly one owning lane (see `AGENTS.md`). Cross-lane needs go through the log.
**Consequence:** some requests wait on another lane, but merges stay clean.

### D-03 · Optional modules plug in through dynamic import
**Context:** Codex's followers system lands after the foundation.
**Decision:** `main.js` tries `import('./gameplay/followers.js')` and runs without it if the file is missing.
**Consequence:** Codex can ship F-04 with no edits to Brain-owned files. One expected 404 shows until then.

### D-04 · All art and sound is procedural
**Context:** licence safety, tiny downloads, and visuals and sound that react to the world.
**Decision:** no image or audio files. Terrain, the hand and sound are generated in code.
**Consequence:** the style must be achievable in code; the art and sound bibles define it.

### D-05 · Provisional concept until the human's spec arrives
**Context:** Run 01 started without a game spec.
**Decision:** the Brain wrote `docs/design/concept.md` (shape an island so followers can live and believe).
**Consequence:** the human's spec overrides it, and the gameplay lane re-plans in Run 02.

### D-06 · Instinct (a separate AI) owns sound direction and engineering
**Context:** Dispatch 01.2. The human confirmed that Instinct owns the sound lane.
**Decision:** `src/audio/**` and `docs/design/sound-bible.md` are reserved for Instinct. Claude Code keeps
Brain, engine, gameplay and art. Codex keeps Forge and F-04. Instinct builds on the audio Claude Code wrote at `f128a72`.
**Consequence:** the Brain flags any change to `audio.*` calls in `main.js` to Instinct. I-01 and I-02 move to Instinct.

### D-07 · Followers emit plain-data events; the Brain routes them to audio
**Context:** follower sounds need settle and drown signals, while followers must stay free of Web Audio and the DOM.
**Decision (proposed, contracts v1.1):** `Followers.events` is emptied at the start of each step and filled
with `{type, x, y}`. `main.js` reads the events and calls `audio.followerCue(type, pan)` if Instinct exports it.
**Consequence:** followers, audio and art stay decoupled. Art can use the same events later (for example a glow
when someone settles). This becomes final once Instinct and Codex agree in the log.

### D-08 · `shape()` deduplication happens inside audio
**Context:** `main.js` calls `audio.shape()` at 60 Hz, including while idle (flag 2 in the Brain's handoff).
**Decision:** Instinct dedupes repeated values inside `src/audio/` and resets that cache when the audio context is rebuilt. `main.js` stays unchanged.
**Consequence:** no integration change. The audio module is responsible for its own automation load.

### D-09 · Audio unit tests live in `tests/audio/**`, owned by Instinct
**Context:** Instinct reported six mocked unit tests, but `tests/**` is Forge's lane, and the F-01 command
`node --test tests/*.test.mjs` doesn't look in subfolders. The Brain checked this on Node 22:
a nested test was skipped. `node --test tests/` failed, and the quoted glob `'tests/**/*.test.mjs'` found it.
**Decision:** `tests/audio/**` is reserved for Instinct. Forge keeps the rest of `tests/` and must make `npm test` and CI
discover `tests/**/*.test.mjs` on every Node version CI runs. Forge chooses how; glob support starts at Node 21.
**Consequence:** audio tests run in CI without a lane collision.

### D-10 · Autonomous coordination: mail in the repo, and the Brain merges to `main`
**Context:** the human asked the AIs to work together autonomously and stopped relaying messages.
The human authorised the Brain to merge PRs into `main` (answer in chat, 2026-11-21).
**Decision:** agents talk through `runs/<run>/mail/` (see `ai/MAIL.md`). The Brain runs a scheduled round: it collects mail
from every branch, reviews and merges passing in-lane PRs, and replies. `main` is the shared truth.
**Consequence:** no human relay. The Brain may resolve conflicts in shared append-only files (log, board) when integrating.

### D-11 · `SEA_LEVEL` is Float32-exact
**Context:** Codex flagged that `0.42` stored in the Float32 heightmap reads back as 0.41999998, so a cell set to sea level counted as water.
**Decision:** `SEA_LEVEL = Math.fround(0.42)`. Every comparison (world, followers, renderer) now agrees.
**Consequence:** none visible. It removes an edge-case inconsistency between modules.

### D-12 · Product direction: biblical chronological noir puzzle-adventure
**Context:** issue #14 (relayed by Codex), and the human confirmed it in chat on 2026-11-21.
**Decision:** the game is *A Mão de Deus / Hand of God*, a black-and-white noir puzzle-adventure through the Bible in order.
Run 02 builds a three-stage Genesis 1 vertical slice. The island sandbox and the belief economy are retired. Followers are dormant.
**Consequence:** `docs/design/concept.md` and the art bible were rewritten; contracts v2 (stages) proposed; G-02 cancelled.

### D-13 · Only the Brain writes `log.md` and `board.md` from Run 02 on
**Context:** in Run 01 every agent PR appended to the same two files, so every merge conflicted.
**Decision:** agents report through mail files (unique names, never conflicting). The Brain transcribes into the log and the board.
**Consequence:** agent PRs stop conflicting with each other.
