# Art bible

**Owner:** Art director (Claude Code)

## Direction: "dusk over an ancient sea"
A painterly, top-down diorama. Soft-scaled terrain with light from the top-left,
deep navy seas, warm sand, saturated greens, and cold stone peaks. The divine hand is the only
thing that **glows**: gold for creation, ice-blue for destruction.

## Rules
1. **One source of colour:** every colour lives in `src/art/palette.js`.
2. **Glow means divine.** Only the hand and divine effects get additive glow. The world never glows.
3. **Readability ladder:** water < land < followers < hand. Each step is brighter or more saturated than the one before.
4. **Light from the top-left**, everywhere: terrain shading, future shadows, UI bevels.
5. **Type:** a serif (Georgia fallback) for a mythic feel. HUD text sits on a translucent navy panel.
6. **Procedural only.** Draw with code. Any outside asset must have its licence noted here first.

## Terrain colour stops
| Elevation | Look |
|---|---|
| 0.00–0.30 | Abyss to deep sea (navy) |
| 0.30–0.42 | Shallows (teal), with animated ripples that calm in deep water |
| 0.42–0.47 | Foam line, then warm sand |
| 0.47–0.74 | Fresh grass to deep forest |
| 0.74–0.92 | Rock to high rock |
| 0.92+ | Snow |

## Follower readability
- Wandering followers: cream `#fff6e0`.
- Settled followers: amber `#ffb347`.
- Drowning followers: coral `#ff6b6b`.
