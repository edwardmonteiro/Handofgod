// Instinct: procedural soundscape in Web Audio. No audio files.
//   Ambience: sea (filtered noise with a slow swell) and a low divine drone.
//   Feedback: raising land = earthy rumble that rises; lowering = watery hiss that falls.
// See docs/design/sound-bible.md for the mixing rules.

const MASTER_GAIN = 0.6;
const SEA_GAIN = 0.16;
const DRONE_GAIN = 0.05;
const SHAPE_GAIN = 0.22;
const SWELL_RATIO = 0.55; // 0.16 * 1.55 = 0.248 maximum sea gain.
const CUE_GAP = 0.09;
const CUE_MAX_VOICES = 4;
const MUTE_KEY = 'handofgod.muted';

const STAGE_CUES = {
        step: [92, 48, 0.075, 0.035, 'triangle', 0.16],
        jump: [110, 165, 0.14, 0.032, 'sine', 0.16],
        land: [100, 38, 0.19, 0.065, 'triangle', 0.12],
        push: [72, 45, 0.28, 0.045, 'triangle', 0.35],
        blocked: [140, 100, 0.12, 0.032, 'sine', 0.8],
        reach: [220, 330, 0.7, 0.05, 'sine', 1.5],
        light: [330, 440, 0.18, 0.024, 'sine', 0.45],
        fall: [140, 42, 0.38, 0.045, 'triangle', 0.8],
};

export function createAudio() {
  let ctx = null;
  let master, seaGain, seaFilter, seaSwellDepth, droneGain, shapeGain, shapeFilter, shapeOsc;
  let muted = readMuted();
  let lastDirection = null, lastIntensity = null;
  let nextCueAt = 0;
  const cueEnds = [];
  let activeScene = null;
  const stageEnds = [];
  const stageNext = new Map();

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    lastDirection = lastIntensity = null;
    nextCueAt = 0;
    cueEnds.length = 0;
    master = ctx.createGain();
    master.gain.value = muted ? 0 : MASTER_GAIN;
    master.connect(ctx.destination);

    const noise = ctx.createBufferSource();
    noise.buffer = makeNoise(ctx, 2);
    noise.loop = true;

    // Sea: low-passed noise, its volume swells with a slow LFO
    seaFilter = ctx.createBiquadFilter();
    seaFilter.type = 'lowpass';
    seaFilter.frequency.value = 520;
    seaGain = ctx.createGain();
    seaGain.gain.value = SEA_GAIN;
    const swell = ctx.createOscillator();
    swell.frequency.value = 0.09;
    seaSwellDepth = ctx.createGain();
    seaSwellDepth.gain.value = SEA_GAIN * SWELL_RATIO;
    swell.connect(seaSwellDepth).connect(seaGain.gain);
    noise.connect(seaFilter).connect(seaGain).connect(master);

    // Drone: two detuned low sines, a perfect fifth apart
    droneGain = ctx.createGain();
    droneGain.gain.value = DRONE_GAIN;
    droneGain.connect(master);
    for (const [freq, detune] of [[55, -4], [82.5, 5]]) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq;
      o.detune.value = detune;
      o.connect(droneGain);
      o.start();
    }

    // Shaping voice: one persistent voice (no allocations per brush stroke)
    shapeFilter = ctx.createBiquadFilter();
    shapeFilter.type = 'bandpass';
    shapeFilter.Q.value = 1.2;
    shapeGain = ctx.createGain();
    shapeGain.gain.value = 0;
    noise.connect(shapeFilter).connect(shapeGain).connect(master);
    shapeOsc = ctx.createOscillator();
    shapeOsc.type = 'triangle';
    shapeOsc.frequency.value = 60;
    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.5;
    shapeOsc.connect(oscGain).connect(shapeGain);

    noise.start();
    swell.start();
    shapeOsc.start();
    applyScene();
    return true;
  }

  // Only traversal/cards have an agreed functional sound use here. Other scenes are inert.
  function applyScene() {
    if (!ctx || !activeScene) return;
    const t = ctx.currentTime;
    const playing = activeScene === 'traverse';
    seaGain.gain.setTargetAtTime(playing ? 0.018 : 0, t, 0.35);
    seaSwellDepth.gain.setTargetAtTime(playing ? 0.006 : 0, t, 0.35);
    seaFilter.frequency.setTargetAtTime(playing ? 240 : 520, t, 0.35);
    droneGain.gain.setTargetAtTime(playing ? 0.012 : 0, t, 0.35);
    shapeGain.gain.setTargetAtTime(0, t, 0.05);
  }

  const api = {
    get muted() {
      return muted;
    },
    /** Call from a user gesture: browsers block audio until then. */
    unlock() {
      if (!ctx && !build()) return;
      if (ctx.state === 'suspended') ctx.resume();
    },
    toggleMute() {
      muted = !muted;
      writeMuted(muted);
      if (ctx) master.gain.setTargetAtTime(muted ? 0 : MASTER_GAIN, ctx.currentTime, 0.05);
      return muted;
    },
    /** direction: +1 raise, -1 lower, 0 stop. intensity: 0..1 */
    shape(direction, intensity) {
      if (!ctx) return;
      direction = Number.isFinite(direction) ? Math.sign(direction) : 0;
      intensity = direction === 0 || !Number.isFinite(intensity) ? 0 : Math.max(0, Math.min(1, intensity));
      if (direction === lastDirection && intensity === lastIntensity) return;
      lastDirection = direction;
      lastIntensity = intensity;
      const t = ctx.currentTime;
      const level = direction === 0 ? 0 : SHAPE_GAIN * intensity;
      shapeGain.gain.setTargetAtTime(level, t, direction === 0 ? 0.12 : 0.03);
      if (direction > 0) {
        shapeFilter.frequency.setTargetAtTime(180 + 260 * intensity, t, 0.2);
        shapeOsc.frequency.setTargetAtTime(48 + 40 * intensity, t, 0.3);
      } else if (direction < 0) {
        shapeFilter.frequency.setTargetAtTime(1400 - 500 * intensity, t, 0.2);
        shapeOsc.frequency.setTargetAtTime(90 - 40 * intensity, t, 0.3);
      }
    },
    /** More land -> less sea, more drone. landRatio: 0..1 */
    ambience(landRatio) {
      if (!ctx) return;
      landRatio = Number.isFinite(landRatio) ? Math.max(0, Math.min(1, landRatio)) : 0.5;
      const t = ctx.currentTime;
      // Scale the swell with the base gain so its trough stays above zero.
      const seaLevel = SEA_GAIN * (1 - 0.5 * landRatio);
      seaGain.gain.setTargetAtTime(seaLevel, t, 1);
      seaSwellDepth.gain.setTargetAtTime(seaLevel * SWELL_RATIO, t, 1);
      seaFilter.frequency.setTargetAtTime(380 + 500 * (1 - landRatio), t, 1);
      droneGain.gain.setTargetAtTime(DRONE_GAIN * (0.6 + landRatio), t, 1);
    },
    /** One transition cue; no implicit unlock, no backlog while muted/suspended. */
    followerCue(type, pan = 0) {
      if (!ctx || ctx.state !== 'running' || muted || (type !== 'settle' && type !== 'drown')) return;
      const t = ctx.currentTime;
      for (let i = cueEnds.length - 1; i >= 0; i--) if (cueEnds[i] <= t) cueEnds.splice(i, 1);
      if (t < nextCueAt || cueEnds.length >= CUE_MAX_VOICES) return;
      nextCueAt = t + CUE_GAP;
      const duration = type === 'settle' ? 0.45 : 0.38;
      cueEnds.push(t + duration + 0.02);
      const voice = ctx.createOscillator();
      const envelope = ctx.createGain();
      const position = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      voice.type = type === 'settle' ? 'sine' : 'triangle';
      const from = type === 'settle' ? 660 : 233;
      const to = type === 'settle' ? 880 : 110;
      voice.frequency.setValueAtTime(from, t);
      voice.frequency.exponentialRampToValueAtTime(to, t + duration * 0.8);
      envelope.gain.setValueAtTime(0, t);
      envelope.gain.linearRampToValueAtTime(0.055, t + 0.012);
      envelope.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      voice.connect(envelope);
      if (position) {
        position.pan.value = Number.isFinite(pan) ? Math.max(-1, Math.min(1, pan)) : 0;
        envelope.connect(position).connect(master);
      } else envelope.connect(master);
      voice.onended = () => { voice.disconnect(); envelope.disconnect(); if (position) position.disconnect(); };
      voice.start(t);
      voice.stop(t + duration + 0.02);
    },
    /** Store scene before the first gesture, never unlock implicitly. */
    scene(id) {
      if (id !== 'traverse' && id !== 'card' && id !== 'title') return;
      if (activeScene === id) return;
      activeScene = id;
      stageNext.clear();
      applyScene();
    },
    /** Functional traversal cues, not a final score or approval of a narrative theme. */
    stageEvent(type, pan = 0, strength = 1) {
      const spec = STAGE_CUES[type];
      if (!spec || !ctx || ctx.state !== 'running' || muted || activeScene !== 'traverse') return;
      const t = ctx.currentTime;
      for (let i = stageEnds.length - 1; i >= 0; i--) if (stageEnds[i] <= t) stageEnds.splice(i, 1);
      // Keep one slot for reach so a footstep burst cannot swallow completion feedback.
      if (t < (stageNext.get(type) || 0) || stageEnds.length >= (type === 'reach' ? 6 : 5)) return;
      strength = Number.isFinite(strength) ? Math.max(0, Math.min(1, strength)) : 0;
      if (strength === 0) return;
      const [from, to, duration, gain, wave, gap] = spec;
      stageNext.set(type, t + gap);
      stageEnds.push(t + duration + 0.02);
      const voice = ctx.createOscillator();
      const envelope = ctx.createGain();
      const position = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      voice.type = wave;
      voice.frequency.setValueAtTime(from, t);
      voice.frequency.exponentialRampToValueAtTime(to, t + duration * 0.8);
      envelope.gain.setValueAtTime(0, t);
      envelope.gain.linearRampToValueAtTime(gain * Math.sqrt(strength), t + 0.008);
      envelope.gain.exponentialRampToValueAtTime(0.0001, t + duration);
      voice.connect(envelope);
      if (position) {
        position.pan.value = Number.isFinite(pan) ? Math.max(-1, Math.min(1, pan)) : 0;
        envelope.connect(position).connect(master);
      } else envelope.connect(master);
      voice.onended = () => { voice.disconnect(); envelope.disconnect(); if (position) position.disconnect(); };
      voice.start(t);
      voice.stop(t + duration + 0.02);
    },
    dispose() {
      if (ctx) ctx.close();
      ctx = null;
      lastDirection = lastIntensity = null;
      cueEnds.length = 0;
      nextCueAt = 0;
      stageEnds.length = 0;
      stageNext.clear();
    },
  };
  return api;
}

function makeNoise(ctx, seconds) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buf.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < data.length; i++) {
    // Brown-ish noise: softer, more like surf than TV static
    brown = (brown + (Math.random() * 2 - 1) * 0.08) * 0.985;
    data[i] = brown * 3;
  }
  return buf;
}

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeMuted(v) {
  try {
    localStorage.setItem(MUTE_KEY, v ? '1' : '0');
  } catch {
    /* storage unavailable: mute still works for this session */
  }
}
