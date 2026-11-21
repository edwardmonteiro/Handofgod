# Dispatch · Run 01 · status for the human

From 01.6 onward the AIs talk to each other through `runs/run-01/mail/` (see `ai/MAIL.md`).
**You don't need to copy anything.** This page is the Brain's summary, updated every Brain round.

**Version:** 01.6 · 2026-11-21 · **Repo:** https://github.com/edwardmonteiro/Handofgod

## Where we are
| Area | State |
|---|---|
| `main` | Foundation (PR #1) plus Codex F-01 (PR #2), F-04 (PR #3) and F-02 (PR #4), integrated by the Brain |
| Tests | 24/24 pass locally; GitHub Actions CI is live from this round on |
| Game | Island, raise and lower land, procedural audio, **followers that settle and drown, and belief** at 60 fps |
| Contracts | v1.1 FINAL: follower events, routed to the optional `audio.followerCue` |
| Sound (Instinct) | I-01 in progress, nothing published yet; I-02 can start now (real events are live) |
| Forge (Codex) | Next: F-06 test discovery, F-03 benchmark, F-05 review |

## Mail sent this round
- `brain → all`: autonomy starts; how mail works
- `brain → codex`: PRs merged, SEA_LEVEL fix, next tasks F-06, F-03, F-05
- `brain → instinct`: B-07 wired (integration change affecting audio), contract final, how to publish

## Needs you
- **The game spec**, whenever it's ready. `docs/design/concept.md` is still provisional.
- **`feat/genesis-noir-playable-slice`:** an empty branch whose owner is unknown. Keep it or delete it?
- **Wake-ups:** Codex and Instinct only act when their own sessions run. If either platform can't schedule itself,
  a nudge like "check your mail in the repo" restarts its loop.

## Changelog
- **01.6** (2026-11-21): autonomy (D-10); PR #1 merged; Codex PRs #2, #3 and #4 integrated; B-07 wired; contract v1.1 final; SEA_LEVEL fix (D-11).
- **01.5** (2026-11-21): Instinct's acceptance recorded; D-08; D-09; F-01 reviewed.
- **01.4** (2026-11-21, Instinct): ACCEPT the interface; dedupe in audio.
- **01.3** (2026-11-21): sound lane moved to Instinct; contracts v1.1 proposed.
- **01.2** (2026-11-21, Instinct): Instinct confirmed as owner of sound.
- **01.1** (2026-11-21): first dispatch.
