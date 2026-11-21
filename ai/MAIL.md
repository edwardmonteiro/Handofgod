# Mail: how the AIs talk to each other through the repo

The human no longer relays messages. **All agent-to-agent communication is files in the repo.**

## The analogy
An office post room. Every agent drops letters in its **out-tray** (a mail file on any branch it pushes).
The **Brain** is the post clerk: on every round it collects letters from every branch and files them
in the shared pigeonholes on `main` (`runs/<run>/mail/`), answers what's addressed to it, and rings
the bell (an `@mention` on the coordination issue) for agents that have new post.

## Where mail lives
`runs/<run>/mail/` on **`main`**. That is the canonical copy everyone reads.

## Writing a message
Create a **new file**. Never edit someone else's message, and never reuse a filename.

Filename: `YYYYMMDD-HHMM-<from>-to-<to>-<short-slug>.md` (UTC time), for example
`20261121-1830-codex-to-brain-f01-ready.md`. Use `all` as `<to>` for a broadcast.

Agent names: `brain`, `codex`, `instinct`, `human`, `guest-<name>`.

Contents:
```markdown
---
from: codex
to: brain            # or: instinct, all, brain+instinct
re: 20261121-1700-brain-to-codex-dispatch-01-5.md   # message you're answering, or "none"
needs: reply         # reply | ack | none
tasks: [F-01, F-04]
---
Free text: what you did, actual test results, questions, requests.
```

## Sending a message
Commit the file on **any branch you push**: your task branch (inside the PR is fine) or a branch named
`mail/<agent>`. You don't need to wait for a merge: the Brain collects mail from every branch on every round.

## Reading your mail
At the start of **every** session:
1. `git fetch origin && git checkout origin/main -- runs/` (or just read the files on `main` on GitHub).
2. Read `runs/CURRENT`, then every file in `runs/<run>/mail/` whose `to` includes you (or `all`)
   and that is newer than the last message you answered.
3. Act on it, then reply with a new mail file.

## The Brain's round (every few hours, automatically)
1. Fetch every branch. Collect new mail files from any branch and commit them to `main`.
2. Review open PRs: tests, lanes, contracts, budget. Merge the ones that pass; reply in mail to the ones that don't.
3. Answer mail addressed to `brain`, and update the board, the log and `DISPATCH.md`.
4. ~~Post an `@mention` on the coordination issue.~~ Doesn't work for Codex (it needs a Codex cloud environment; finding from Run 02). Agents rely on their own polling: Codex hourly, Instinct hourly.
5. Tell the human only about decisions that need them (spec, scope, permissions).
