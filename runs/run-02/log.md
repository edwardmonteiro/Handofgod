# Run 02 log (Brain-maintained from agents' mail, D-13)

### 2026-11-21 · claude-code (Brain) · RUN 02 OPENED
The human confirmed the product direction (D-12): a black-and-white biblical noir puzzle-adventure. Run 01 closed with a retro.
Brief: `docs/design/concept.md`. Art bible v2 (noir). Contracts v2 PROPOSED (stages). Board: 15 tasks across 3 agents.
Brain runner (F-07): the human chose to run it on their Claude subscription (`CLAUDE_CODE_OAUTH_TOKEN`). The `agent:brain` label was created.
It is still inactive until the human adds the secret.

### 2026-11-21 18:xx · claude-code (Brain) · scheduled round 1
- **Merged:** Instinct PR #18 (I-03, 8 mocked audio tests). The suite is 32/32. No new mail from Codex or Instinct about contracts v2 yet.
- **Brain-lane Run 02 work landed:** E-03 (multitouch pointer map plus normalised intent; one finger lifting no longer releases all,
  F-05 #2), G-06 (Stage 1 Light logic), A-03 (noir post: tiled grain, vignette, flicker), A-04 (Light renderer, verse and title cards),
  B-12 (sequencer: title → verse card → stage → resolution → next; missing stages show an "in progress" card), B-13 (text sources).
- **The island is retired from `main.js`** (D-12). `renderer.js`, `world.js` and `followers.js` stay for Stage 3 and possible later chapters.
- **Playtest findings, fixed:** (1) motes respawned at the screen edges and starved the middle of the deep. Coverage peaked at 0.47, then fell.
  They now respawn in dark cells away from the hand, and decay is 0.025. (2) An async race between stages crashed the renderer; fixed with a guard.
- **Verified:** a scripted Node player completes Stage 1 in 15.6–20.2 s on 3 seeds, and an idle player never does. A browser playthrough
  (headless Chromium, 1280×720) went title → card → Light completed at 22 s → Firmament card, at 60 fps, 1.1 ms per frame,
  with no console errors apart from the expected 404s for unbuilt stages.
- **Integration change affecting audio (flagged to @instinct):** `main.js` no longer calls `shape()`, `ambience()` or `followerCue()`.
  It now calls `audio.scene(id)` and `audio.stageEvent(type, pan, strength)`, both guarded with `typeof === 'function'`.

### 2026-11-21 20:xx · claude-code (Brain) · scheduled round 2
- **Mail collected:** Codex `20261121-1826-codex-to-brain-b11-f08.md`: **B-11 ACCEPT** (stage logic v2), F-08 pushed. Integrated F-08 (the benchmark gate runs in CI).
- **Issue #14 (relayed by Instinct, 19:47–19:48):** the human chose an on-screen character traversing the world (INSIDE as the reference) over a disembodied hand.
  Instinct paused I-04. D-14 records this as provisional until the human confirms directly. Hand-based stages G-07, G-08 and A-04 are paused.
- **Built the reversible prototype G-09 / A-05 / E-04** (`?slice=traverse`): walk → a ledge too high to jump ('blocked' cue) → push the stone to it →
  climb → the exit light. Scripted Node solver: completes in 8.8 s. Without the block: 43 jumps in 30 s, never up. Browser keyboard playthrough
  completed through to the end card, at 60 fps, 0.23 ms per frame, no console errors. The default build (Light stage) is unchanged.
- **Bell finding:** `@codex` on issue #6 doesn't wake Codex (a bot replies that a Codex cloud environment is needed). Codex's own hourly watcher works, so the Brain stops pinging.
- Instinct's F-07 one-shot runner test proposal (#6, 17:47) is noted. The Brain agrees: never put a shared OAuth secret where the label-triggered Brain workflow can see it.

### 2026-11-21 22:xx · claude-code (Brain) · scheduled round 3
- **Integrated:** Instinct #21 (I-05 traversal sound: per-cue gaps, a voice cap with a slot kept for reach, silent until unlock and while muted, active only in the traversal scene)
  and Codex #22 (F-09 conformance), #23 (F-10 Chromium smoke in CI; runner pinned to ubuntu-24.04 for Playwright 1.56) and #24 (F-11 traversal tests). Suite: **41/41**.
- **Instinct on #14 (20:37):** the character choice is owner-confirmed through the human's conversation with Instinct (16:47 BRT); don't re-ask the human.
  Accepted: D-14a records it with explicit bounds. D-12a records the separate provenance of the biblical framing (the human's chat with the Brain).
- **Instinct's provenance proposal (21:37):** adopted as the decision record format in `ai/PROTOCOL.md`.
- **Codex (#6, 21:38):** its current authorisation can't write `src/` beyond `followers.js`, so G-07 goes back to the Brain (and is superseded anyway).
- **D-15:** the default slice is now traversal; `?slice=light` is archived. The four optional 404s that F-10 tolerated no longer occur.
- **Orphan job:** `.gitignore` added (`node_modules/`), since F-10 introduced a dev dependency.
- Note for @instinct: the scene ids `light` and `card` keep the ambience silent in your I-05 audio, which is fine now that traversal is the default.

### 2026-11-22 00:xx · claude-code (Brain) · scheduled round 4
- No new PRs, branches or mail. Instinct (#14, 22:38) independently verified the integrated build on `main` `26b1e29`: real keyboard, real oscillators for
  step, push, jump, land and reach. It asks for G-10's light mechanic to stay separate from any Genesis interpretation; respected.
- **Built space 2 (G-11, A-06, B-16), mechanics only:** a 6 m chasm (a run-jump covers ≈ 2.9 m); ghost planks are solid only within 3 m of a pushable lamp-stone.
  You cross inside the circle of light you push, and stepping out of it means falling (respawn at the space start).
  It's a separate stage module (`beam`) so Codex's `traverse` tests stay valid. The sequencer runs `traverse` → `beam` with no card in between.
  `meta.verse: 'unassigned'` (no passage chosen) satisfies Codex's conformance suite without implying narrative; documented as a v3 addition.
- **Verified:** Node: pushing across completes in 10 s with 12 `light` events; without the lamp, 5 falls in 20 s and no crossing. Suite 42/42 (conformance includes `beam`).
  Browser: space 1 → space 2 → end card with the keyboard, 60 fps, 0.27 ms per frame, zero console errors, zero 404s.
- New events for @instinct: `light` (planks firm up, strength = lit share) and `fall` (dropped into the void). Same audio scene (`meta.scene = 'traverse'`).

### 2026-11-22 02:xx · claude-code (Brain) · scheduled round 5
- **Merged** Instinct #27 (I-06: `light` and `fall` cues; two cue definitions plus tests; CI green). Suite 43/43.
- **Owner visual feedback (#14, 02:01, via Instinct): "the character looks deformed and square-like."** Prioritised over new content (A-07):
  the trapezoid "cloak", oversized hood circle and rectangle legs were replaced by a jointed figure. Head ≈ 1/7 of the height, a neck, a tapered torso
  with rounded shoulders and a pelvis, two-segment arms and legs with round joints and feet. Far-side limbs are one shade lighter so each limb reads.
  Poses: idle breathing; a walk with knee bend and opposite arm swing; a pushing lean with elbows tucked and palms on the object's face;
  jump rising (arms up, knees tucked) and falling (arms spread). A thin rim light on the head separates the figure from dark ground.
  Physics, events and contracts are unchanged. One function, shared by both spaces.
- **Proof** (`docs/design/proof/a07-character/`): `pose-sheet-close.png` (close view: standing, walk A and B, pushing, jump rising and falling),
  `game-closeups.png` (real gameplay frames: standing, walking, pushing, jumping, space 2 pushing the lamp) and `game-pushing.png` (a full frame at normal scale).
  Browser run with zero console errors. This doesn't claim owner acceptance: Instinct reviews it and presents it to the owner.

### 2026-11-22 04:xx · claude-code (Brain) · scheduled round 6
- No new PRs, branches or mail. Codex F-12 (beam tests) is still open.
- **Instinct's A-07 review (#14, 02:41):** on `main` `5db6b5d`, the figure reads as human, and walking, pushing and airborne poses are distinct in both spaces.
  "Addresses the square-body issue visibly." Suggested polish: idle limb overlap and the walk cycle. This is Instinct's visual review, not owner sign-off.
- **A-08 (art only):** idle stance with feet apart and arms off the torso, so the far-side limbs show; the walk gets a body bob (dip at full stride),
  more knee lift on the trailing leg and more forearm bend on the forward swing. Space 2 gets a 0.6 s dip to black and a camera snap on respawn after a fall.
- **Verified:** 43/43. Browser: fell into the chasm on purpose, frame brightness 2.4 just after the respawn and 16.8 a second later; zero errors, 60 fps.

### 2026-11-22 06:xx · claude-code (Brain) · scheduled round 7
- No new PRs, branches, mail or comments. Codex F-12 is still open.
- **Mobile pass (E-05):** emulated iPhone 13 landscape (844×390 CSS, DPR 3), with real touch events. Taps advance cards; holding the right third walks
  (x 2 → 8.8 in 2 s, pushing the stone); a middle tap jumps (airborne at y 0.94); lifting a second finger doesn't break walking.
  60 fps, zero errors. Problem found: the controls hint covered about a quarter of the phone screen. Fixed: compact on short screens (≤ 500 px tall)
  and it fades 5 s after the first input.
- Note: a player can hop over the stone and leave it behind. That's not a softlock: you can hop back and push it again. Logged for future level tuning.

### 2026-11-22 08:xx · claude-code (Brain) · scheduled round 8
- No new PRs or mail. **Instinct (#14, 06:42):** in a 390×844 portrait viewport the fixed 16 m camera made the figure about 28 px tall and the limbs unreadable;
  it asked to keep mobile readability as an open check rather than call #30 a completed mobile pass. Accepted (E-05 set to partial).
- **A-09:** the camera zoom now also guarantees at most 11 m of vertical view. Portrait goes from 24 to 76.7 px/m (figure ≈ 88 px, about 5.1 m visible across).
  Landscape 1280×720 is unchanged at 80 px/m (16 m). Rendering only; physics, events and audio are untouched.
- **A-10:** found while checking portrait: the Genesis 1:2 verse line overflowed the screen. Card text now fits within 90% of the width.
- **Verified:** 43/43. Playthroughs of both spaces in portrait 390×844 and landscape 1280×720 reached the end card with zero errors.
  Not validated on a physical device, in Safari or with real touch; that stays open.

### 2026-11-22 16:xx · claude-code (Brain) · scheduled round 12
- **Owner feedback (#14, 14:48, via Instinct):** the A-07/A-08 figure is "better, but still far from looking human". It's not resolved. A substantially different
  body and proportion design is wanted (no level, camera or animation-only substitutes), labelled as a proposal for owner review.
- **Diagnosis:** the figure had a symmetric, front-facing torso walking in profile, plus uniform-width stroke limbs, which reads as a stick mannequin.
- **A-11 (PROPOSAL):** redrawn as a true **profile** silhouette. A skull with a face profile (brow, nose, lips, chin, jaw), a neck; a torso with the chest leading,
  shoulder blade, lumbar curve and buttocks behind; filled, tapered limbs (thigh 0.10H → knee 0.06H, calf bulge, ankle), a deltoid, hands, heel-to-toe feet.
  Pose angles kept (walk, push, jump, idle). Physics box, collision, input, events and audio are unchanged.
- **Proof** (`docs/design/proof/a11-character/`): `before-after.png` (the delivered A-07 figure versus this proposal, same poses), `pose-sheet-close.png`,
  `game-closeups.png` (real gameplay crops: standing, walking, pushing, jumping, space 2) and `game-pushing.png` (a full frame). 43/43, zero console errors.
  **Not approved or resolved:** Instinct inspects it and presents it to the owner.

### 2026-11-24 18:xx · claude-code (Brain) · scheduled round
- About 48 h with no agent activity after A-11. **Instinct (#14, 2026-11-24 17:01)** verified A-11 on `fb6eff5`: 43/43; a touch-only portrait run through space 1
  into space 2; the figure is about 85 px and reads as a human profile. It noted again that the opening is very dark and the figure shows only by contrast with the hill.
  Open items it listed: physical device, Safari, real listening, F-12, B-11/B-14, Q1–Q3, deploy.
- **A-12 (art only):** horizon fog 0.24 → 0.31, hills 0.15/0.09 → 0.20/0.14, and a faint halo behind the figure, drawn before the ground so the floor stays black.
  Measured at 390×844: figure 15 versus background 63 on a 0–255 scale, contrast 31 → 48. Still dark noir. 43/43; both spaces to the end card, zero errors.
