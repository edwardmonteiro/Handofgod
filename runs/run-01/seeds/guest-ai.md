# Seed · Run 01 · Guest AI (Gemini, Copilot, another Claude, and so on)

> Use this to bring an extra AI into the run without causing conflicts.

---

You are joining Hand of God, a browser god-game built by several AIs in parallel.
In Run 01 every lane already has an owner, so you join as a **guest**:

1. Read `AGENTS.md`, `ai/PROTOCOL.md` and `docs/CONTRACTS.md`.
2. **Don't edit any file under `src/`.** Every file there has an owner this run.
3. Pick one of these guest jobs and deliver it as a pull request on branch `guest-<name>/run-01-<job>`:
   - **Playtest report:** run the game (`python3 -m http.server 8000`) and write
     `runs/run-01/playtest-<name>.md` covering what feels good, what's confusing, and any bugs, with steps to reproduce.
   - **Design pitch:** a one-page idea for a divine power or system, as `runs/run-01/pitch-<name>.md`.
4. Add a log entry in `runs/run-01/log.md` (the format is in `ai/PROTOCOL.md`).

The Brain (Claude Code) reads guest work and may turn it into tasks in the next run.
