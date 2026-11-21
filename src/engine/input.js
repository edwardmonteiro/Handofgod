// Input abstraction: mouse, touch (via pointer events) and keyboard.
// Gameplay reads this object and never touches DOM events directly.
//
// E-03 (Run 02): per-pointer tracking (multitouch) and a normalised gesture intent for stages
// (contracts v2): { x, y, active, alt, dx, dy }, with every coordinate in 0..1 of the canvas.
//   active = a primary pointer is down (left button, or the first finger)
//   alt    = alternate gesture: right button, Shift + click, or a second finger down

export function createInput(canvas) {
  const justPressed = new Set();
  const heldKeys = new Set();
  const pointers = new Map(); // pointerId -> { x, y, button }
  let primaryId = null;
  let lastX = 0;
  let lastY = 0;
  let accDx = 0;
  let accDy = 0;
  let tapped = false;
  // moveX / jump / act: character-traversal fields (contracts v3 proposal). Stage modules ignore what they don't use.
  const intent = { x: 0.5, y: 0.5, active: false, alt: false, dx: 0, dy: 0, moveX: 0, jump: false, act: false };
  const JUMP_KEYS = ['Space', 'ArrowUp', 'KeyW'];
  const ACT_KEYS = ['KeyE', 'KeyF', 'ShiftLeft', 'ShiftRight'];
  let jumpLatch = false;

  const input = {
    x: 0, // canvas pixels (device-pixel scaled)
    y: 0,
    inside: false,
    primary: false,   // left mouse button, or first finger
    secondary: false, // right mouse button, Shift + primary, or a second finger
    wheel: 0,
    consumeWheel() {
      const w = input.wheel;
      input.wheel = 0;
      return w;
    },
    pressed(code) {
      return justPressed.delete(code);
    },
    /** True once after any pointer went down (used to advance cards). */
    consumeTap() {
      const t = tapped;
      tapped = false;
      return t;
    },
    /** Normalised gesture intent. Returns the same object every call (no allocation); dx and dy reset on read. */
    readIntent() {
      const w = canvas.width || 1;
      const h = canvas.height || 1;
      intent.x = clamp01(input.x / w);
      intent.y = clamp01(input.y / h);
      intent.active = input.primary;
      intent.alt = input.secondary;
      intent.dx = accDx / w;
      intent.dy = accDy / h;
      // Keyboard: arrows or A/D move; Space, W or Up jump (one-shot); E, F or Shift act (held).
      let mx = (heldKeys.has('ArrowRight') || heldKeys.has('KeyD') ? 1 : 0) - (heldKeys.has('ArrowLeft') || heldKeys.has('KeyA') ? 1 : 0);
      // Touch and mouse: holding the left or right third of the screen walks; a tap in the middle third jumps.
      if (mx === 0 && input.primary) {
        if (intent.x < 1 / 3) mx = -1;
        else if (intent.x > 2 / 3) mx = 1;
      }
      intent.moveX = mx;
      intent.jump = jumpLatch;
      jumpLatch = false;
      intent.act = ACT_KEYS.some((k) => heldKeys.has(k)) || input.secondary;
      accDx = 0;
      accDy = 0;
      return intent;
    },
    get pointerCount() {
      return pointers.size;
    },
  };

  function toCanvas(e) {
    const rect = canvas.getBoundingClientRect();
    return [
      (e.clientX - rect.left) * (canvas.width / (rect.width || 1)),
      (e.clientY - rect.top) * (canvas.height / (rect.height || 1)),
    ];
  }

  function refreshButtons() {
    const p = primaryId !== null ? pointers.get(primaryId) : null;
    input.primary = !!p && p.button !== 'alt';
    input.secondary = (!!p && p.button === 'alt') || pointers.size >= 2;
  }

  canvas.addEventListener('pointermove', (e) => {
    const [x, y] = toCanvas(e);
    const p = pointers.get(e.pointerId);
    if (p) {
      p.x = x;
      p.y = y;
    }
    // Only the primary pointer (or a hovering mouse) steers the hand.
    if (primaryId === null || e.pointerId === primaryId) {
      accDx += x - lastX;
      accDy += y - lastY;
      lastX = input.x = x;
      lastY = input.y = y;
    }
    input.inside = true;
  });

  canvas.addEventListener('pointerdown', (e) => {
    const [x, y] = toCanvas(e);
    try { canvas.setPointerCapture(e.pointerId); } catch { /* synthetic events may not be capturable */ }
    const alt = e.button === 2 || (e.button === 0 && e.shiftKey);
    pointers.set(e.pointerId, { x, y, button: alt ? 'alt' : 'main' });
    if (primaryId === null && x > canvas.width / 3 && x < (canvas.width * 2) / 3) jumpLatch = true; // middle-third tap = jump
    if (primaryId === null) {
      primaryId = e.pointerId;
      lastX = input.x = x;
      lastY = input.y = y;
    }
    input.inside = true;
    tapped = true;
    refreshButtons();
  });

  const lift = (e) => {
    pointers.delete(e.pointerId);
    if (e.pointerId === primaryId) {
      // Hand the primary role to a remaining finger, if any, without jumping the hand.
      const next = pointers.keys().next();
      primaryId = next.done ? null : next.value;
      if (primaryId !== null) {
        const p = pointers.get(primaryId);
        lastX = input.x = p.x;
        lastY = input.y = p.y;
      }
    }
    refreshButtons();
  };
  canvas.addEventListener('pointerup', lift);
  canvas.addEventListener('pointercancel', lift);
  canvas.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse' && !pointers.has(e.pointerId)) input.inside = false;
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
    heldKeys.add(e.code);
    if (!e.repeat) {
      justPressed.add(e.code);
      if (JUMP_KEYS.includes(e.code)) jumpLatch = true;
    }
    if (JUMP_KEYS.includes(e.code) || e.code.startsWith('Arrow')) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => heldKeys.delete(e.code));
  window.addEventListener('blur', () => {
    pointers.clear();
    heldKeys.clear();
    primaryId = null;
    refreshButtons();
    justPressed.clear();
  });

  return input;
}

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
