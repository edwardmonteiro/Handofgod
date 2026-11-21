#!/usr/bin/env node
// Run 01 F-03: reproducible, dependency-free engine benchmark.
import { performance } from 'node:perf_hooks';
import { createWorld, generateIsland, applyBrush } from '../src/gameplay/world.js';

const WIDTH = 192;
const HEIGHT = 120;
const SEED = 0x20261121;
const TRIALS = 30;
const BRUSH_CALLS = 1000;
const quantile = (arr, p) => [...arr].sort((a, b) => a - b)[Math.min(arr.length - 1, Math.floor((arr.length - 1) * p))];

// Warm-up removes first-run JIT compilation cost from the measurement.
for (let i = 0; i < 5; i++) generateIsland(createWorld(WIDTH, HEIGHT, SEED + i));

const generations = [];
for (let i = 0; i < TRIALS; i++) {
  const world = createWorld(WIDTH, HEIGHT, SEED + i);
  const t0 = performance.now();
  generateIsland(world);
  generations.push(performance.now() - t0);
}

const world = generateIsland(createWorld(WIDTH, HEIGHT, SEED));
let touched = 0;
const t0 = performance.now();
for (let i = 0; i < BRUSH_CALLS; i++) {
  const x = 8 + ((i * 47) % (WIDTH - 16));
  const y = 8 + ((i * 31) % (HEIGHT - 16));
  const magnitude = i % 2 === 0 ? 0.02 : -0.02;
  touched += applyBrush(world, x, y, 5, magnitude);
}
const brushMs = performance.now() - t0;

const report = {
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  world: `${WIDTH}x${HEIGHT}`,
  generation: {
    trials: TRIALS,
    medianMs: +quantile(generations, 0.5).toFixed(3),
    p95Ms: +quantile(generations, 0.95).toFixed(3),
    maxMs: +Math.max(...generations).toFixed(3),
    budgetMs: 50,
  },
  brush: {
    calls: BRUSH_CALLS,
    totalMs: +brushMs.toFixed(3),
    msPerCall: +(brushMs / BRUSH_CALLS).toFixed(5),
    cellsTouched: touched,
  },
};
console.log(JSON.stringify(report, null, 2));
if (report.generation.p95Ms > report.generation.budgetMs) process.exitCode = 1;
