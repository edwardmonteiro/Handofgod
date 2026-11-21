# Dispatch · status for the human (Runs 01–02)

From 01.6 onward the AIs talk to each other through `runs/run-01/mail/` (see `ai/MAIL.md`).
**You don't need to copy anything.** This page is the Brain's summary, updated every Brain round.

**Version:** 01.7 · 2026-11-21 · **Repo:** https://github.com/edwardmonteiro/Handofgod

## Run 02 status · round 2, 2026-11-21 20:xx UTC
| Area | State |
|---|---|
| Default build on `main` | Title → Genesis 1:3 card → Stage 1 "Let there be light" (disembodied-hand light puzzle) |
| **New: `?slice=traverse`** | **Character prototype:** a cloaked figure walks, is blocked by a ledge, pushes a stone, climbs, reaches the light |
| Direction | Issue #14 relays that you chose **character traversal** (INSIDE as reference). **Waiting for you to confirm directly** (D-14) |
| Paused | Firmament (Codex), Land (Brain), the noir score (Instinct): until you confirm |
| Codex | Accepted contracts v2; benchmark gate now runs in CI |
| Instinct | Tests merged; sound paused pending direction |

## Run 01 status (closed)
| Area | State |
|---|---|
| `main` | Foundation (PR #1) plus Codex F-01 (PR #2), F-04 (PR #3) and F-02 (PR #4), integrated by the Brain |
| Tests | 24/24 pass locally; GitHub Actions CI is live from this round on |
| Game | Island, raise and lower land, procedural audio, **followers that settle and drown, and belief** at 60 fps |
| Contracts | v1.1 FINAL: follower events, routed to the optional `audio.followerCue` |
| Sound (Instinct) | **I-01 and I-02 merged** (PR #11): reactive sea, dedupe, follower cues. Next: I-03 commit its tests |
| Forge (Codex) | **Autonomous: hourly automation.** F-01 to F-07 all merged. Benchmark p95 3.6 ms against the 50 ms budget |

## Mail sent this round
- `brain → all`: autonomy starts; how mail works
- `brain → codex`: PRs merged, SEA_LEVEL fix, next tasks F-06, F-03, F-05
- `brain → instinct`: B-07 wired (integration change affecting audio), contract final, how to publish

## Needs you
- **The game spec**, whenever it's ready. `docs/design/concept.md` is still provisional.
- **`feat/genesis-noir-playable-slice`:** an empty branch whose owner is unknown. Keep it or delete it?
- **Wake-ups:** Codex checks every hour (its own automation). The Brain checks every 2 hours. **Instinct has no schedule yet.**
  If its platform can't schedule itself, a nudge like "check your mail in the repo" restarts its loop.

## Decisions waiting for you (asked in chat)
1. **Product direction (issue #14):** pivot to a black-and-white biblical noir puzzle-adventure? It blocks Run 02.
2. **Brain runner (PR #10, merged, inactive):** add an Anthropic API key or Claude token as a GitHub secret so the Brain
   can run from GitHub Actions even when this session is closed? This costs API usage.

## Changelog
- **01.7** (2026-11-21): integrated #8, #10, #11, #13 and #15; G-05 and B-09 fixes; board rewritten; product direction escalated to the human.
- **01.6** (2026-11-21): autonomy (D-10); PR #1 merged; Codex PRs #2, #3 and #4 integrated; B-07 wired; contract v1.1 final; SEA_LEVEL fix (D-11).
- **01.5** (2026-11-21): Instinct's acceptance recorded; D-08; D-09; F-01 reviewed.
- **01.4** (2026-11-21, Instinct): ACCEPT the interface; dedupe in audio.
- **01.3** (2026-11-21): sound lane moved to Instinct; contracts v1.1 proposed.
- **01.2** (2026-11-21, Instinct): Instinct confirmed as owner of sound.
- **01.1** (2026-11-21): first dispatch.
