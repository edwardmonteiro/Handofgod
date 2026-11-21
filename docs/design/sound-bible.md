# Sound bible (Instinct)

**Owner:** Instinct, sound direction and engineering (Claude Code)

## Direction
The world should sound **vast, calm and ancient** until you touch it. Then it answers.
No audio files: everything is synthesised in Web Audio, so it's tiny, licence-free and reactive.

## Layers
| Layer | Source | Reacts to |
|---|---|---|
| Sea | Low-passed brown noise with a 0.09 Hz swell | More water means a brighter, louder sea |
| Divine drone | Sines at 55 Hz and 82.5 Hz (a fifth), slightly detuned | More land means a louder drone |
| Raise land | Band-passed noise at 180–440 Hz plus a triangle rumble at 48–88 Hz | Brush size sets the intensity |
| Lower land | Band-passed noise at 900–1400 Hz plus a falling triangle tone | Brush size sets the intensity |

## Mixing rules
- Master gain 0.6. No layer above 0.25 on its own. Nothing should clip on a laptop speaker.
- Feedback attack within 30 ms (it must feel instant) and release over about 120 ms.
- At most **one** shaping voice. Sounds re-use persistent nodes, so there are no allocations per stroke.
- `M` mutes, and the choice is saved in `localStorage`.
- Audio starts only after the first click or key press, as browser policy requires.

## Next runs
- Followers: soft voices or chimes when someone settles; a dissonant cue when someone drowns.
- Music: a generative modal pad that brightens as belief grows.
