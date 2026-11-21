# Role: Art director

**Holder (Run 01):** Claude Code

## Mission
Give Hand of God a look you'd recognise from one screenshot: an original, readable,
procedurally drawn world that holds up from phone to 4K.

## You own
`src/art/**`, `docs/design/art-bible.md`.

## Responsibilities
- The palette and terrain colour ramps (`src/art/palette.js`).
- The renderer: terrain shading, water, the divine hand cursor and UI chrome.
- The art bible: style rules any agent can follow without asking you.

## Rules
- Every colour comes from `palette.js`. No hex codes scattered through other files.
- Everything is drawn in code. No downloaded sprites or fonts unless their licence is recorded.
- Readability first: the player must always tell water, land and followers apart.
