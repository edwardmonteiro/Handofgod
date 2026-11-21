# Art bible v2: noir

**Owner:** Art director (Claude Code). **Supersedes** the v1 "dusk over an ancient sea" colour palette (decision D-12).

## Direction
Black-and-white cinematic noir. Think of a film shot by a single lamp: deep blacks, hard edges where light falls,
soft falloff into shadow, and grain everywhere. **Light is the only colour**, and it's the player's tool.

## Rules
1. **Monochrome only.** Every pixel is a grey level from `PALETTE` (0 = void black, 1 = divine white). No hue, ever.
   (A single warm tint may be tested later as an exception for divine light, and only with a decision record.)
2. **One key light.** The divine hand is the main light source. Scene lights exist only where scripture puts them.
3. **Contrast ladder:** void (0.02) < deep shadow (0.08) < world mid-tones (0.2–0.5) < lit surfaces (0.6–0.85) < divine light (0.95–1.0).
   Interactable things must always read at least one step brighter than their surroundings.
4. **Film treatment** on everything: animated grain (2–4% amplitude), vignette, a gentle bloom on divine light, and a slow flicker of a few percent.
5. **Typography:** a serif, letter-spaced, small caps for verse cards. White on black, and the verse fades in word by word.
6. **Motion:** slow, weighty easing. Nothing snaps except feedback at the moment of a gesture.
7. **Procedural only:** drawn in code (canvas compositing, gradients, noise). Any outside asset needs its licence recorded here.

## Per-stage look (vertical slice)
| Stage | Key image |
|---|---|
| 1 · Light | Near-total black; motes like dust in a projector beam; the gathered light carves a pool out of the deep |
| 2 · Firmament | Churning grey water; mist lifted by the wind; a razor-thin bright line where the waters part |
| 3 · Dry land | The Run 01 heightmap re-shaded in greyscale relief; wet sheen where the water withdraws; grass as fine pale strokes |

## Performance
Post-processing (grain, vignette, bloom) must fit inside the render budget (≤ 5 ms). Pre-render the grain to a small tiled canvas
and offset it per frame; don't generate noise per pixel per frame.
