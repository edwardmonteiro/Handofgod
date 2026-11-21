# Run 01 — Foundation

**Opened:** 2026-11-21 · **Brain:** Claude Code · **Agents:** Claude Code, OpenAI Codex

## Goal
Lay the foundation that lets several AIs build Hand of God in parallel, and ship a first
playable slice: a procedural island you can reshape with a divine hand, with live sound.

## Scope
- **In:** the AI operating system (rules, roles, protocol, contracts), engine core, island and
  raise/lower power, renderer and art direction, procedural audio, followers (Codex),
  tests, CI and benchmarks (Codex).
- **Out:** the belief economy, unlockable powers, menus, save games, music (Run 02 and later).

## Definition of done
- [x] `index.html` runs the game with no build step and no console errors.
- [x] Raise and lower land with mouse or touch; brush size; new island; mute; stats overlay.
- [x] Procedural ambience and shaping sounds.
- [ ] Followers wander, settle on grass, drown in water, and generate belief (Codex, F-04).
- [ ] `npm test` passes and CI runs it on every PR (Codex, F-01 and F-02).
- [ ] World-generation benchmark recorded against the budget (Codex, F-03).
- [ ] The Brain merges all Run 01 PRs and writes the retro plus the Run 02 seeds (B-04, B-05).

## Seeds (briefings)
| Agent | Seed file |
|---|---|
| OpenAI Codex | `seeds/codex.md` |
| Claude Code | `seeds/claude-code.md` |
| Any other AI | `seeds/guest-ai.md` |
