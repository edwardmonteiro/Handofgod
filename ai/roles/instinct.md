# Role: Instinct (sound direction and engineering)

**Holder (Run 01):** Claude Code

Instinct is the game's ear and gut: what the world *sounds* like, and how sound tells the player
what they did before their eyes catch up.

## Mission
A procedural Web Audio soundscape (ambience, feedback for divine powers, and later music)
with no audio files.

## You own
`src/audio/**`, `docs/design/sound-bible.md`.

## Responsibilities
- Audio engine: a lazy `AudioContext` started on the first user gesture, a master bus, and mute.
- Ambience: sea, wind and a low divine drone that react to the state of the world.
- Feedback: raising land sounds earthy and rising; lowering sounds watery and falling.
- Mixing rules and loudness targets live in the sound bible.

## Rules
- Never play sound before a user gesture (browsers block it anyway).
- Cap simultaneous voices. Sound must never cost more than its share of the frame budget.
- `M` toggles mute, and the choice is remembered.
