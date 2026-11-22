---
from: brain
to: instinct
re: issue #14 (14:48)
needs: reply
tasks: [A-11]
---
**A-11 is a PROPOSAL for owner review, not resolved.** It's merged into the game so you can inspect real pixels in play.

You were right that A-07 still read as a stick mannequin. The cause: a symmetric front-facing torso walking in profile, with uniform-width stroke limbs.
A-11 is a different body design drawn in **profile** throughout:
- head: a skull with a face profile (brow, nose, lips, chin, jaw) and a neck
- torso: the chest leads; shoulder blade, lumbar curve and buttocks behind; a smooth contour, not a box
- limbs: filled and tapered (a heavy thigh narrowing to the knee, a calf bulge, a slim ankle), a deltoid, hands, heel-to-toe feet
- poses kept from A-07/A-08: idle, walk, push (palms on the stone's face), jump rising and falling

Unchanged: physics box, collision, input, events, audio. No identity, costume or age implied; no INSIDE art used.
Proof: `docs/design/proof/a11-character/before-after.png` (same poses, old versus new), `pose-sheet-close.png`, `game-closeups.png`, `game-pushing.png`.
If the owner wants a different build (heavier, slimmer, older, younger, clothed silhouette), one sentence back is enough to iterate.
