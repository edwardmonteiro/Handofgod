# Sound bible

Owner: Instinct, sound direction and engineering.

## Direction
Vast, calm and ancient until the player touches the world. Procedural Web Audio only. No audio assets or runtime dependencies. The game concept is still provisional.

## Layers
- Sea: low-passed brown noise, 0.09 Hz swell. More water increases brightness and base volume. Base gain ranges from 0.08 to 0.16; swell depth is 55% of base. Maximum sea gain parameter is 0.248, not a guarantee about waveform peak.
- Divine drone: detuned sine tones at 55 and 82.5 Hz; more land increases drone gain.
- Raise: filtered noise plus a low triangle tone, tuned by brush intensity.
- Lower: brighter filtered noise plus a lower triangle tone, tuned by brush intensity.
- Settle: brief rising sine, 660 to 880 Hz, with a 12 ms attack and 450 ms decay.
- Drown: brief falling triangle, 233 to 110 Hz, with a 12 ms attack and 380 ms decay. This is a warning motif, not a voice recording.

## Runtime and mixing
- Master gain 0.6. Layer gain parameters stay below 0.25. Parameter bounds do not prove output cannot clip: noise, filters and overlapping layers still need measurement.
- One persistent shaping voice. Identical shape calls are ignored inside audio; the 60 Hz caller need not change. Dedupe state resets on context rebuild.
- Shape attack and release use setTargetAtTime time constants of 30 ms and 120 ms. These are not full-settling times or measured hardware latencies.
- Follower cues use at most four live oscillator voices, including their 20 ms stop margin. A global 90 ms gap drops excess events with no queue. This intentionally prioritises quiet, bounded feedback over sounding every follower in a burst. Each cue envelope peaks at 0.055 before master gain.
- Stereo pan is clamped to [-1,1]. If StereoPanner is unavailable, cues use a centred fallback.
- followerCue does not unlock audio. Pre-unlock, suspended and muted events are discarded, never replayed later.
- First pointer/key gesture unlocks audio. M toggles mute and saves it when storage permits. Muting has a short smoothed tail. A saved muted state builds the master at zero.

## Interface and integration
Audio exposes followerCue(type, pan) for settle/drown transitions. Instinct accepts the proposed contracts v1.1 interface from PR #1 at 6969aca. Codex agreement and Brain event routing remain separate dependencies. Audio never imports followers and followers must remain plain data.

## Verification status
See the accompanying handoff evidence for exact candidate hash and measured cases. Logical mocks, native OfflineAudioContext renders and local browser lifecycle checks are separate evidence types. No physical-device latency, Safari compatibility, final artistic listening approval or end-to-end follower-event integration is claimed. Music remains outside Run 01.


## I-05: functional character-traversal candidate

This is a review candidate for the confirmed character/traversal experience, not approval of Genesis, Bible chronology, a final style or score. It is original procedural feedback, not INSIDE audio recreation.

- `scene('traverse')` stores its intent before unlock and fades the old sea/drone into a very quiet air/low-space bed. `card` and `title` fade those layers out. Unknown scenes are ignored. Scene changes never unlock audio. Existing v1 methods remain compatible for earlier callers/tests.
- `stageEvent(type, pan, strength)` supports step, jump, land, push, blocked and reach. Contact/stone cues use brief low triangle tones; jump/blocked use soft sine gestures; reach uses a restrained rising sine. These synthetic sketches establish feedback timing, not realistic Foley or an approved mix.
- Finite pan clamps to [-1,1], strength to [0,1]; invalid strength drops the event. Muted/suspended/pre-unlock/wrong-scene events drop, without queues or implicit resume. Each type has a gap. Five concurrent ordinary voices, one reserved completion slot; mono fallback and ended-node cleanup. Dispose clears voice/timing tracking; rebuild restores the selected scene.
- `push` is an onset cue under the current contract, not continuous scraping. `blocked` inherits gameplay cooldown plus an audio gap. Audio alone does not establish obstacle readability. The current automatic keyboard path does not emit blocked, so that event has only mocked/render coverage so far.
- Candidate checks: 35/35 Node tests, including 3 new traversal audio tests. Native Chrome OfflineAudioContext eight-second sequence and burst renders had zero clipped samples, highest measured peak about -11.3 dBFS. This is not universal/true-peak assurance. Browser traversal with real input and AudioContext completed and emitted actual step/push/jump/land/reach voices. No physical device listening, Safari, mobile latency, realistic Foley or final timbre approval is claimed.
