# Engine budget

**Owner:** Engine optimizer (Claude Code)

| Metric | Budget | Run 01 measured |
|---|---|---|
| Frame rate | 60 fps steady | 60 fps (headless Chromium, 1280×800) |
| Total frame time | ≤ 8 ms (half of 16.7 ms, leaving room for growth) | about 1.2 ms |
| Simulation step | ≤ 2 ms | < 0.1 ms |
| Render | ≤ 5 ms | about 1.2 ms |
| World generation (192×120) | ≤ 50 ms | to be measured by Forge (F-03) |
| Initial download | ≤ 200 KB, no build step | about 40 KB of source |
| Runtime dependencies | 0 | 0 |

## Rules
- Simulation runs at a fixed 60 Hz (`src/engine/loop.js`). A frame never simulates more than 0.25 s of catch-up.
- Device pixel ratio is capped at 2 to bound the fill cost on high-DPI phones.
- No allocations in per-frame hot loops: reuse typed arrays and colour tuples.
- Any PR that pushes a metric over budget must say why, and the Brain must approve it.
