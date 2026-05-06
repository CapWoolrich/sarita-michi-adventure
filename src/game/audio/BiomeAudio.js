/**
 * Audio ambiental por bioma usando Tone.js.
 * Drone suave + acordes lentos en escalas distintas por mundo.
 */
import * as Tone from 'tone';

const BIOME_PALETTES = {
  'mystic-forest':   { notes: ['E3', 'G3', 'B3', 'D4', 'A4'], reverb: 0.7, delay: 0.4, type: 'sine' },
  'sakura-city':     { notes: ['F#3', 'A3', 'C#4', 'E4', 'B4'], reverb: 0.55, delay: 0.3, type: 'triangle' },
  'crystal-lake':    { notes: ['C4', 'E4', 'G4', 'B4', 'D5'], reverb: 0.85, delay: 0.55, type: 'sine' },
  'mist-grove':      { notes: ['E3', 'G3', 'A#3', 'D4', 'F4'], reverb: 0.9, delay: 0.6, type: 'sine' },
  'pastel-port':     { notes: ['G3', 'B3', 'D4', 'F#4', 'A4'], reverb: 0.5, delay: 0.3, type: 'triangle' },
  'cloud-valley':    { notes: ['D4', 'F#4', 'A4', 'C#5', 'E5'], reverb: 0.75, delay: 0.45, type: 'sine' },
  'moon-garden':     { notes: ['A2', 'C3', 'E3', 'G3', 'B3'], reverb: 0.85, delay: 0.5, type: 'sine' },
  'cotton-beach':    { notes: ['D4', 'F#4', 'A4', 'B4', 'D5'], reverb: 0.5, delay: 0.25, type: 'triangle' },
  'aurora-mountain': { notes: ['F#2', 'A2', 'C#3', 'E3', 'A3'], reverb: 0.95, delay: 0.7, type: 'sine' },
  'stellar-village': { notes: ['C3', 'D#3', 'G3', 'A#3', 'D4'], reverb: 0.9, delay: 0.65, type: 'sine' },
  'neon-city':       { notes: ['F#2', 'A2', 'C#3', 'E3', 'B3'], reverb: 0.4, delay: 0.2, type: 'sawtooth' }
};

let synth = null;
let reverb = null;
let delay = null;
let loop = null;
let started = false;
let currentBiome = null;
let muted = false;

async function ensure() {
  if (started) return;
  if (Tone.context.state !== 'running') await Tone.start();
  reverb = new Tone.Reverb({ decay: 6, wet: 0.5 }).toDestination();
  delay = new Tone.FeedbackDelay({ delayTime: 0.4, feedback: 0.3, wet: 0.3 }).connect(reverb);
  synth = new Tone.PolySynth(Tone.Synth, {
    envelope: { attack: 1.5, decay: 0.4, sustain: 0.6, release: 3 },
    volume: muted ? -Infinity : -22
  }).connect(delay);
  started = true;
}

export async function startBiomeAudio(biome) {
  if (currentBiome === biome) return;
  await ensure();
  if (loop) { loop.stop(); loop.dispose(); loop = null; }
  const palette = BIOME_PALETTES[biome] ?? BIOME_PALETTES['mystic-forest'];
  if (reverb) reverb.wet.rampTo(palette.reverb, 1);
  if (delay) {
    delay.delayTime.rampTo(palette.delay, 1);
    delay.wet.rampTo(0.3, 1);
  }
  synth.set({ oscillator: { type: palette.type } });

  let step = 0;
  loop = new Tone.Loop((time) => {
    const note = palette.notes[step % palette.notes.length];
    const dur = step % 3 === 0 ? '2n' : '4n';
    synth.triggerAttackRelease(note, dur, time, 0.4 + Math.random() * 0.3);
    step++;
  }, '2n').start(0);
  Tone.Transport.bpm.rampTo(60, 1);
  if (Tone.Transport.state !== 'started') Tone.Transport.start();
  currentBiome = biome;
}

export function muteBiomeAudio() {
  muted = true;
  if (synth) synth.volume.rampTo(-Infinity, 0.3);
}

export function unmuteBiomeAudio() {
  muted = false;
  if (synth) synth.volume.rampTo(-22, 0.3);
}

export function stopBiomeAudio() {
  if (loop) { loop.stop(); loop.dispose(); loop = null; }
  if (Tone.Transport.state === 'started') Tone.Transport.stop();
  currentBiome = null;
}

export async function playCaptureChime() {
  await ensure();
  if (muted) return;
  const now = Tone.now();
  const chimeSynth = new Tone.PolySynth(Tone.Synth, {
    envelope: { attack: 0.005, decay: 0.2, sustain: 0.1, release: 0.4 },
    volume: -16
  }).connect(reverb);
  chimeSynth.triggerAttackRelease('C5', '8n', now);
  chimeSynth.triggerAttackRelease('E5', '8n', now + 0.1);
  chimeSynth.triggerAttackRelease('G5', '8n', now + 0.2);
  chimeSynth.triggerAttackRelease('C6', '4n', now + 0.3);
  setTimeout(() => chimeSynth.dispose(), 1500);
}
