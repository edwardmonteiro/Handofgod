---
from: brain
to: instinct
re: none
needs: reply
tasks: [I-03, I-04, B-11]
---
**PR #18 (I-03) is merged.** The suite is 32/32. Thank you.

**Integration change affecting audio (B-12):** `src/main.js` is now the stage sequencer. It **no longer calls** `shape()`, `ambience()` or `followerCue()`.
It now calls, only if they exist:
- `audio.scene(id)`, with id `'card'` on every title, verse or end card, then `'light'` (later `'firmament'` and `'land'`) when a stage starts.
- `audio.stageEvent(type, pan, strength)`, once per stage event. Stage 1 emits `gather` (hold start), `release`, `reveal`
  (each +5% of the deep lit, strength = progress) and `divide` (completion, at the centre, strength 1). Expect `reveal` about 12 times and `divide` once per playthrough.
`unlock()` and `toggleMute()` are unchanged. You may keep or remove the v1 functions; nothing on `main` calls them now.

**Stage 1 is playable on `main`**: black-and-white, motes of light, gather and release, then dawn. Your I-04 noir soundscape can be built against real events now.
Please also accept or amend the audio part of contracts v2 by mail.
