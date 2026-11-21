// Input abstraction: mouse, touch (via pointer events) and keyboard.
// Gameplay reads this object and never touches DOM events directly.

export function createInput(canvas) {
  const justPressed = new Set();
  const input = {
    x: 0,
    y: 0,
    inside: false,
    primary: false,   // left mouse button, or one-finger touch
    secondary: false, // right mouse button, or Shift + primary
    wheel: 0,
    consumeWheel() {
      const w = input.wheel;
      input.wheel = 0;
      return w;
    },
    pressed(code) {
      return justPressed.delete(code);
    },
  };

  function locate(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    input.x = (e.clientX - rect.left) * sx;
    input.y = (e.clientY - rect.top) * sy;
  }

  canvas.addEventListener('pointermove', (e) => {
    locate(e);
    input.inside = true;
  });
  canvas.addEventListener('pointerdown', (e) => {
    locate(e);
    input.inside = true;
    canvas.setPointerCapture(e.pointerId);
    if (e.button === 2 || (e.button === 0 && e.shiftKey)) input.secondary = true;
    else if (e.button === 0) input.primary = true;
  });
  const release = () => {
    input.primary = false;
    input.secondary = false;
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') input.inside = false;
  });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      input.wheel += Math.sign(e.deltaY);
    },
    { passive: false },
  );
  window.addEventListener('keydown', (e) => {
    if (!e.repeat) justPressed.add(e.code);
  });
  window.addEventListener('blur', () => {
    release();
    justPressed.clear();
  });

  return input;
}
