# Run 01: GitHub autonomous agent bridge (Forge F-07)

The repo already uses `runs/<run>/mail/` as its canonical communication channel. This file describes **execution**, not another messaging system.

## Verified capabilities
- **Forge / ChatGPT:** hourly condition-watch automation `Hand of God Forge` checks GitHub, subject to ChatGPT task scheduling. It is not a real-time worker.
- **Brain / Claude Code:** `.github/workflows/brain-agent.yml` can invoke the official `anthropics/claude-code-action@v1` on a labeled issue or on a bounded schedule. It is a runner only **after** one-time credentials and GitHub settings are configured.
- **Instinct / Sound:** no runner, credentials, wake-up webhook or scheduled environment has been verified. Mail addressed to Instinct is queued in GitHub; this alone cannot wake its session.

## One-time activation (Edward or repository administrator)
1. Install/authorize Claude Code's GitHub app for `edwardmonteiro/Handofgod` if required by your Anthropic setup.
2. In [GitHub Actions secrets](https://github.com/edwardmonteiro/Handofgod/settings/secrets/actions), configure **one** secret: `CLAUDE_CODE_OAUTH_TOKEN` (if your supported Claude Code workflow permits subscription OAuth), **or** `ANTHROPIC_API_KEY` (provider-billed). Never paste secrets in issues, PRs, or mail. OAuth quotas and terms vary; this repo cannot verify account entitlements.
3. For periodic Brain work, set repository variable `BRAIN_AGENT_AUTORUN` = `true` under Settings → Secrets and variables → Actions → Variables. Absent/false means **no scheduled model calls**. The cron is twice daily at 09:17 and 21:17 UTC.
4. For a one-off Brain task, apply label `agent:brain` to an open issue (the label must exist). A GitHub issue `labeled` event can invoke Claude without turning on the recurring schedule.
5. Watch [Actions](https://github.com/edwardmonteiro/Handofgod/actions) and approve/review its first run before relying on automation. The workflow is unverified until it runs with the configured credentials.

## Ownership and protocol
| Identity | Work | Activation | Output |
|---|---|---|---|
| Brain (Claude Code) | engine, art, gameplay, integration, contracts | scheduled workflow, labeled issue or its own session | PRs, GitHub mail, issue comments |
| Forge (Codex / ChatGPT) | `tests/**` except audio, `tools/**`, `.github/**`, `package.json`, `followers.js` | hourly ChatGPT automation; optional future runner | PRs, GitHub mail, issue comments |
| Instinct | `src/audio/**`, `docs/design/sound-bible.md`, `tests/audio/**` | **pending external runner** | PRs and mail, when its runtime is available |

## Instinct adapter contract (future; not yet active)
A real Instinct worker must: (1) authenticate to GitHub without publishing tokens, (2) poll `runs/CURRENT` and mail addressed to `instinct`, (3) claim sound-lane tasks, (4) work on `instinct/run-NN-I-xx`, (5) open PR + report measured tests, (6) avoid touching engine/Forge lanes. Polling alone without an authenticated worker is insufficient.

## Safety
- Public issues and PR descriptions are untrusted inputs. Only trusted write-capable collaborators should label Brain tasks.
- Workflow checks out trusted `main` on an `issues:labeled` event; it does **not** evaluate fork PR code in a privileged workflow context.
- A single Brain job may run at a time, with a 25-minute timeout and `--max-turns 12`.
- Issue labels and the schedule can still incur provider charges or subscription quota. No free usage is implied.
- No automatic Forge→Instinct transfer is claimed without Instinct's own runtime.
- No agent may force-push `main`, change another lane's files, or merge its own PR.

## Proof-of-life checklist
- [ ] GitHub secret supplied and Claude GitHub app authorized
- [ ] `agent:brain` label created
- [ ] Labeled issue produces a successful Brain Actions run and GitHub mail or issue output
- [ ] Scheduled work explicitly enabled by repo variable (optional)
- [ ] Instinct provides an authenticated runner and first PR
- [ ] CI green after merges; no repeated agent-trigger feedback loops

Primary references: [Claude Code Action usage](https://github.com/anthropics/claude-code-action/blob/main/docs/usage.md), [custom automations](https://github.com/anthropics/claude-code-action/blob/main/docs/custom-automations.md), [security](https://github.com/anthropics/claude-code-action/blob/main/docs/security.md).
