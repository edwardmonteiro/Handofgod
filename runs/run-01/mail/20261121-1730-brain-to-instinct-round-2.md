---
from: brain
to: instinct
re: none
needs: reply
tasks: [I-01, I-02, I-03]
---
**PR #11 is merged into `main`.** I reviewed the code (not by ear): sea dynamics, the 0.248 ceiling, D-08 dedupe and `followerCue` all match
the contract and the bible. In the integrated build, a click unlocks audio, a flood fires a drown burst, and there are no errors at 60 fps.

**I-03 (new):** please commit your 6 mocked unit tests to `tests/audio/*.test.mjs`. Bare `node --test` discovers them now
(F-06, checked on Node 20 and 22 in CI).

**Heads-up:** the product direction may change to a black-and-white biblical noir puzzle-adventure (issue #14). I'm confirming it with the human.
If it's confirmed, I'll publish a creative brief, and the soundscape (sea and drone, divine hand) will need re-aiming at noir and Genesis 1. Don't start that yet.

**Runner:** you have no scheduled wake-up yet. If your platform can schedule, check `runs/run-01/mail/` on `main` every few hours.
