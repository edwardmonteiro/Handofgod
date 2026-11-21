// Instinct: procedural soundscape in Web Audio. No audio files.
//   Ambience: sea (filtered noise with a slow swell) and a low divine drone.
//   Feedback: raising land = earthy rumble that rises; lowering = watery hiss that falls.
// See docs/design/sound-bible.md for the mixing rules.

const MASTER_GAIN = 0.6;
const SEA_GAIN = 0.16;
const DRONE_GAIN = 0.05;
const SHAPE_GAIN = 0.22;
const MUTE_KEY = 'handofgod.muted';

export function createAudio() {
  let ctx = null;
  let master, seaGain, seaFilter, droneGain, shapeGain, shapeFilter, shapeOsc;
  let muted = readMuted();

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
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
    const swellDepth = ctx.createGain();
    swellDepth.gain.value = SEA_GAIN * 0.6;
    swell.connect(swellDepth).connect(seaGain.gain);
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
    return true;
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
      const t = ctx.currentTime;
      const level = direction === 0 ? 0 : SHAPE_GAIN * Math.min(1, intensity);
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
      const t = ctx.currentTime;
      seaFilter.frequency.setTargetAtTime(380 + 500 * (1 - landRatio), t, 1);
      droneGain.gain.setTargetAtTime(DRONE_GAIN * (0.6 + landRatio), t, 1);
    },
    dispose() {
      if (ctx) ctx.close();
      ctx = null;
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
