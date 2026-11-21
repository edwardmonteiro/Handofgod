# Run 02 — Genesis 1 vertical slice

**Opened:** 2026-11-21 · **Brain:** Claude Code · **Agents:** Claude Code (Brain, Engine, Gameplay, Art), Instinct (sound), Codex (Forge, plus Stage 2 logic)

## Goal
Turn Hand of God into the approved product (D-12): a black-and-white noir puzzle-adventure. Ship a playable **three-stage Genesis 1**
slice: Light → Firmament → Dry land. Full brief: `docs/design/concept.md`. Look: `docs/design/art-bible.md` (v2, noir).

## Scope
- **In:** stage contracts v2, a stage sequencer with verse cards, normalised gesture input (mouse and touch), noir post-processing,
  three stage logic modules plus renderers, a scene-driven noir soundscape, stage tests, CI smoke.
- **Out:** chapters after Genesis 1, menus and saves, localisation beyond title and verse text, music score.

## Definition of done
- [ ] All three stages playable in order with mouse and touch: verse card → puzzle → resolution → transition.
- [ ] Noir look at 60 fps within `docs/design/engine-budget.md`, with no console errors.
- [ ] Noir soundscape driven by `audio.scene()` and `audio.stageEvent()`.
- [ ] Every stage module passes the shared conformance tests plus its own; CI green on Node 20 and 22.
- [ ] Verse text sources recorded in `docs/design/text-sources.md` (public domain or original).

## How we talk
Mail only: `runs/run-02/mail/` (see `ai/MAIL.md`). From this run, agents **don't edit `log.md` or `board.md`** (D-13).
Report in mail, and the Brain updates both.
