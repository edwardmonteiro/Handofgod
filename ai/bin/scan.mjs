#!/usr/bin/env node
// Brain round helper: what changed across all branches since the last round?
// Usage: node ai/bin/scan.mjs            (read-only: fetches, never pushes)
// Lists every remote branch that is ahead of origin/main, the files it touches,
// lane violations, and mail files that are not yet on main.

import { execSync } from 'node:child_process';

const sh = (cmd) => execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const lines = (cmd) => sh(cmd).split('\n').filter(Boolean);

// Lane ownership, mirroring AGENTS.md. First match wins.
const LANES = [
  [/^tests\/audio\//, 'instinct'],
  [/^(src\/audio\/|docs\/design\/sound-bible\.md)/, 'instinct'],
  [/^src\/gameplay\/followers\.js$|^tests\/followers\.test\.mjs$/, 'codex'],
  [/^src\/gameplay\/stages\/firmament\.js$/, 'codex'],   // Run 02 G-07
  [/^(tests\/|tools\/|\.github\/|package\.json$|package-lock\.json$)/, 'codex'],
  [/^runs\/[^/]+\/mail\//, 'anyone'],
  [/^runs\/[^/]+\/(log|decisions)\.md$/, 'anyone'],     // append-only shared files
  [/^runs\/[^/]+\/board\.md$/, 'anyone'],               // own rows only
  [/^runs\/[^/]+\/(playtest|pitch)-/, 'guest'],
  [/^(AGENTS\.md|CLAUDE\.md|README\.md|ai\/|runs\/|docs\/CONTRACTS\.md|src\/main\.js|index\.html)/, 'brain'],
  [/^(src\/engine\/|docs\/design\/engine-budget\.md)/, 'brain'],
  [/^(src\/gameplay\/|docs\/design\/(concept|belief)\.md)/, 'brain'],
  [/^(src\/art\/|docs\/design\/art-bible\.md)/, 'brain'],
];
const laneOf = (f) => (LANES.find(([re]) => re.test(f)) || [null, 'unowned'])[1];
const agentOf = (branch) => {
  if (branch.startsWith('codex/') || branch === 'mail/codex') return 'codex';
  if (branch.startsWith('instinct/') || branch === 'mail/instinct') return 'instinct';
  if (branch.startsWith('guest-')) return 'guest';
  if (branch.startsWith('ccr-') || branch.startsWith('brain/') || branch === 'mail/brain') return 'brain';
  return 'unknown';
};

sh('git fetch --prune --quiet origin');
const mainMail = new Set(lines("git ls-tree -r --name-only origin/main -- runs/ || true").filter((f) => f.includes('/mail/')));
const branches = lines("git for-each-ref --format='%(refname:short)' refs/remotes/origin")
  .map((b) => b.replace(/^origin\//, ''))
  .filter((b) => b !== 'main' && b !== 'HEAD' && b !== 'origin');

console.log(`# Brain scan · ${new Date().toISOString()}`);
console.log(`main = ${sh('git rev-parse --short origin/main')}\n`);
let newMail = 0;
for (const b of branches) {
  const ref = `origin/${b}`;
  const ahead = Number(sh(`git rev-list --count origin/main..${ref}`));
  if (ahead === 0) {
    console.log(`- ${b}: nothing ahead of main (stale or empty branch)`);
    continue;
  }
  const agent = agentOf(b);
  const files = lines(`git diff --name-only origin/main...${ref}`);
  const last = sh(`git log -1 --format='%h %cr: %s' ${ref}`);
  console.log(`## ${b}  (agent: ${agent}, ${ahead} commit(s) ahead)\n   last: ${last}`);
  for (const f of files) {
    const lane = laneOf(f);
    const ok = lane === 'anyone' || lane === agent || (agent === 'guest' && lane === 'guest');
    const isMail = /^runs\/[^/]+\/mail\/.+\.md$/.test(f);
    if (isMail && !mainMail.has(f)) newMail++;
    console.log(`   ${ok ? '  ' : '!!'} ${f}  [${lane}]${isMail && !mainMail.has(f) ? '  <- NEW MAIL' : ''}`);
  }
}
console.log(`\nNew mail not yet on main: ${newMail}`);
console.log('Legend: !! = file outside the branch owner\'s lane (needs review or a log request).');
