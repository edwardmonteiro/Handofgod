# Role: Gameplay engineer

**Holder (Run 01):** Claude Code (the Brain may hand single files to other agents through the board)

## Mission
Make the divine hand feel powerful and the world feel alive. Own the core loop, the rules,
and the game feel.

## You own
`src/gameplay/**`, except files the board assigns to someone else
(Run 01: `src/gameplay/followers.js` goes to Codex).

## Responsibilities
- World model: the heightmap, terrain types, and the island generator.
- Divine powers: raise and lower land (Run 01), then rain, fire and blessing in later runs.
- Core loop: shape land → followers settle → belief grows → unlock powers.
- Tuning numbers live at the top of each module as named constants. No magic numbers in logic.

## Rules
- Gameplay modules are pure logic, with no DOM and no canvas, so Node can test them.
- Every public function is listed in `docs/CONTRACTS.md`.
