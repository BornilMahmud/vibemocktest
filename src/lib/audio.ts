/**
 * 100% Offline Web Audio API Synthesizer
 * Generates emergency simulation audio effects dynamically without any external audio files.
 */

let audioCtx: AudioContext | null = null;
let sirenOscillator: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let isAudioEnabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setSoundEnabled(enabled: boolean) {
  isAudioEnabled = enabled;
  if (!enabled && sirenOscillator) {
    stopSiren();
  }
}

export function getSoundEnabled(): boolean {
  return isAudioEnabled;
}

/**
 * Tactical click / node select blip
 */
export function playClickSound() {
  if (!isAudioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

/**
 * Route calculated successfully chime
 */
export function playRouteFoundSound() {
  if (!isAudioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.09, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.15);
    });
  } catch {
    // Ignore audio autoplay restrictions
  }
}

/**
 * Hazard alert buzzer (when a hazard is triggered or route is blocked)
 */
export function playHazardAlertSound() {
  if (!isAudioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.setValueAtTime(220, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

/**
 * Toggle emergency evacuation siren
 */
export function toggleSiren(): boolean {
  if (sirenOscillator) {
    stopSiren();
    return false;
  } else {
    startSiren();
    return true;
  }
}

export function isSirenActive(): boolean {
  return sirenOscillator !== null;
}

export function startSiren() {
  if (!isAudioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx || sirenOscillator) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, ctx.currentTime);

    // LFO for wailing siren modulation
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.8, ctx.currentTime); // 0.8 Hz frequency cycle
    lfoGain.gain.setValueAtTime(280, ctx.currentTime); // modulate pitch +/- 280 Hz

    lfo.connect(osc.frequency);
    lfo.start();

    gain.gain.setValueAtTime(0.08, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();

    sirenOscillator = osc;
    sirenGain = gain;
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export function stopSiren() {
  if (sirenOscillator && sirenGain && audioCtx) {
    try {
      sirenGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
      setTimeout(() => {
        sirenOscillator?.stop();
        sirenOscillator?.disconnect();
        sirenOscillator = null;
        sirenGain = null;
      }, 120);
    } catch {
      sirenOscillator = null;
      sirenGain = null;
    }
  }
}

/**
 * Celebratory fanfare when the agent reaches the emergency exit safely
 */
export function playSuccessFanfare() {
  if (!isAudioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Major triad arpeggio: C5, E5, G5, C6 (chord sustain)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0.12, now + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.5);
    });
  } catch {
    // Ignore autoplay restriction
  }
}

/**
 * Serious alarm buzzer when the evacuation route is blocked with no escape
 */
export function playFailureAlarm() {
  if (!isAudioEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.4);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  } catch {
    // Ignore autoplay restriction
  }
}

