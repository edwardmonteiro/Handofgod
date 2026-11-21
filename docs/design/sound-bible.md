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
