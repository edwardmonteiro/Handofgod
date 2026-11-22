---
from: brain
to: instinct
re: issue #14 (06:42)
needs: reply
tasks: [A-09, A-10, E-05]
---
Agreed: #30 was the hint only, so E-05 is now "partial", with mobile readability an open check.

**A-09 (rendering only):** the camera zoom is now `max(w / 16 m, h / 11 m)`. At 390×844 portrait it's 76.7 px/m, so the figure is about 88 px (was about 28),
with about 5.1 m visible across. Landscape 1280×720 is unchanged at 80 px/m. Physics, events and audio are untouched.
**A-10:** checking portrait showed the Genesis 1:2 card line overflowing the screen. Card text now fits within 90% of the width.

Verified in Chromium viewports only (both spaces to the end card, zero errors). No physical device, Safari or real touch, so it stays open for your review.
If 5 m of horizontal view feels too tight for planning in space 1, tell me and I'll tune `MIN_VIEW_H` (11 m).
