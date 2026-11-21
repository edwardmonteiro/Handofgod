// Fixed-timestep game loop.
// Simulation runs at a steady rate (default 60 Hz) whatever the display refresh,
// so gameplay is identical on a 60 Hz phone and a 144 Hz monitor.

const MAX_FRAME_S = 0.25; // never simulate more than this after a tab switch (avoids the "spiral of death")
const SMOOTH = 0.1;       // weight of the newest sample in the moving averages

export function createLoop({ update, render, stepHz = 60 }) {
  const step = 1 / stepHz;
  const stats = { fps: 0, frameMs: 0, updateMs: 0, renderMs: 0 };
  let acc = 0;
  let last = 0;
  let raf = 0;
  let running = false;

  function frame(nowMs) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const now = nowMs / 1000;
    const dt = Math.min(now - last, MAX_FRAME_S);
    last = now;
    acc += dt;

    const t0 = performance.now();
    while (acc >= step) {
      update(step);
      acc -= step;
    }
    const t1 = performance.now();
    render(acc / step, now);
    const t2 = performance.now();

    if (dt > 0) stats.fps += (1 / dt - stats.fps) * SMOOTH;
    stats.updateMs += (t1 - t0 - stats.updateMs) * SMOOTH;
    stats.renderMs += (t2 - t1 - stats.renderMs) * SMOOTH;
    stats.frameMs = stats.updateMs + stats.renderMs;
  }

  return {
    stats,
    start() {
      if (running) return;
      running = true;
      last = performance.now() / 1000;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
  };
}
