# Role: Instinct (sound direction and engineering)

**Holder (Run 01):** Instinct, a separate AI, confirmed by the human in Dispatch 01.2 (decision D-06).
Claude Code (Brain) built the first audio implementation at commit `f128a72`. Instinct builds on it
and does not start a competing one.

Instinct is the game's ear and gut: what the world *sounds* like, and how sound tells the player
what they did before their eyes catch up.

## Mission
A procedural Web Audio soundscape (ambience, feedback for divine powers, and later music)
with no audio files.

## You own
`src/audio/**`, `docs/design/sound-bible.md`, `tests/audio/**` (your Node unit tests, with Web Audio mocked; D-09).

## Responsibilities
- Audio engine: a lazy `AudioContext` started on the first user gesture, a master bus, and mute.
- Ambience: sea, wind and a low divine drone that react to the state of the world.
- Feedback: raising land sounds earthy and rising; lowering sounds watery and falling.
- Mixing rules and loudness targets live in the sound bible.

## Where the rest of the game calls audio (owned by Brain, in `src/main.js`)
| Call | When |
|---|---|
| `audio.unlock()` | First `pointerdown` on the canvas, or any `keydown` |
| `audio.toggleMute()` | `M` key |
| `audio.shape(dir, intensity)` | Every simulation step (60 Hz): `dir` is ±1 while land changes, `0` otherwise |
| `audio.ambience(landRatio)` | Every 0.5 s |
| `audio.followerCue(type, pan)` | Planned (B-07): once per settle or drown event. Called only if Instinct's audio exports it |

The Brain flags any change to these calls in the run log and the dispatch.

## Rules
- Never play sound before a user gesture (browsers block it anyway).
- Cap simultaneous voices. Sound must never cost more than its share of the frame budget.
- `M` toggles mute, and the choice is remembered.
