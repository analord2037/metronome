'use strict';

/* ---------- Constants & data ---------- */

const MIN_BPM = 20;
const MAX_BPM = 300;
const MAX_BEATS = 12;
const MUTE = 0, NORMAL = 1, ACCENT = 2;
const STORE_KEY = 'metronome.settings.v1';

const SOUNDS = { click: 'Click', wood: 'Wood', beep: 'Beep' };
const SUBDIVISIONS = [
  { value: 1, html: '♩︎', title: 'Quarter notes' },
  { value: 2, html: '♫︎', title: 'Eighth notes' },
  { value: 3, html: '♫︎<sup>3</sup>', title: 'Triplets' },
  { value: 4, html: '♬︎', title: 'Sixteenth notes' },
];
const MARKINGS = [
  [40, 'Grave'], [60, 'Largo'], [66, 'Larghetto'], [76, 'Adagio'],
  [108, 'Andante'], [120, 'Moderato'], [156, 'Allegro'], [176, 'Vivace'],
  [200, 'Presto'], [Infinity, 'Prestissimo'],
];

// Rhythm guide. Durations are in sixteenth notes (4 = quarter, 2 = eighth, 1 = sixteenth,
// 4 / 3 = triplet eighth).
// A trailing "-" means the word continues in the next syllable. `level: 2` (dotted,
// syncopated or triplet) keeps a rhythm out of Practice's Easy and Medium levels.
const RHYTHMS = [
  { name: 'Hot Dog', emoji: '🌭', notes: [[4, 'Hot'], [4, 'dog']] },
  { name: 'Grape Soda', emoji: '🥤', notes: [[4, 'Grape'], [2, 'so-'], [2, 'da']] },
  { name: 'Apple Pie', emoji: '🥧', notes: [[2, 'Ap-'], [2, 'ple'], [4, 'pie']] },
  { name: 'Hot Fudge Sundae', emoji: '🍨', notes: [[2, 'Hot'], [2, 'fudge'], [2, 'sun-'], [2, 'dae']] },
  { name: 'Coconut Shrimp', emoji: '🍤', notes: [[1, 'Co-'], [1, 'co-'], [2, 'nut'], [4, 'shrimp']] },
  { name: 'Rice Krispie Treat', emoji: '🍘', notes: [[2, 'Rice'], [1, 'Kris-'], [1, 'pie'], [4, 'treat']] },
  { name: 'Chocolate Strawberry', emoji: '🍓', notes: [[2, 'Choc-'], [2, 'late'], [2, 'straw-'], [1, 'ber-'], [1, 'ry']] },
  { name: 'Cinnamon Oatmeal', emoji: '🥣', notes: [[1, 'Cin-'], [1, 'na-'], [2, 'mon'], [2, 'oat-'], [2, 'meal']] },
  { name: 'Milk and Cereal', emoji: '🥛', notes: [[2, 'Milk'], [2, 'and'], [1, 'ce-'], [1, 're-'], [2, 'al']] },
  { name: 'Avocado Toast', emoji: '🍞', notes: [[1, 'A-'], [1, 'vo-'], [1, 'ca-'], [1, 'do'], [4, 'toast']] },
  { name: 'Cheese Ravioli', emoji: '🥟', notes: [[4, 'Cheese'], [1, 'ra-'], [1, 'vi-'], [1, 'o-'], [1, 'li']] },
  { name: 'Strawberry Ice Cream', emoji: '🍦', notes: [[2, 'Straw-'], [1, 'ber-'], [1, 'ry'], [2, 'ice'], [2, 'cream']] },
  { name: 'Chips and Guacamole', emoji: '🥑', notes: [[2, 'Chips'], [2, 'and'], [1, 'gua-'], [1, 'ca-'], [1, 'mo-'], [1, 'le']] },
  { name: 'Pepperoni Pizza', emoji: '🍕', notes: [[1, 'Pep-'], [1, 'per-'], [1, 'o-'], [1, 'ni'], [2, 'piz-'], [2, 'za']] },
  { name: 'Mac and Cheese', emoji: '🧀', level: 2, notes: [[3, 'Mac'], [1, 'and'], [4, 'cheese']] },
  { name: 'Waffles and Jam', emoji: '🧇', level: 2, notes: [[1, 'Waf-'], [2, 'fles'], [1, 'and'], [4, 'jam']] },
  { name: 'Bacon Bits', emoji: '🥓', level: 2, notes: [[1, 'Ba-'], [3, 'con'], [4, 'bits']] },
  { name: 'Chocolate Cake', emoji: '🍫', level: 2, notes: [[4 / 3, 'Choc-'], [4 / 3, 'o-'], [4 / 3, 'late'], [4, 'cake']] },
];
// One-beat food groups for the Scroll practice. Durations in ticks (12 per beat):
// 12 = quarter, 6 = eighth, 3 = sixteenth, 9 = dotted eighth, 4 = triplet eighth.
// level: 0 = easy, 1 = medium (sixteenths), 2 = all (triplets, dotted, syncopation).
const CELLS = [
  { name: 'Cheese', label: ['Cheese'], emoji: '🧀', level: 0, notes: [[12, 'Cheese']] },
  { name: 'French Toast', label: ['French', 'Toast'], emoji: '🍞', level: 0, notes: [[6, 'French'], [6, 'toast']] },
  { name: 'Apple Juice', label: ['Apple', 'Juice'], emoji: '🧃', level: 1, notes: [[3, 'Ap-'], [3, 'ple'], [6, 'juice']] },
  { name: 'Hamburger', label: ['Ham-', 'burger'], emoji: '🍔', level: 1, notes: [[6, 'Ham-'], [3, 'bur-'], [3, 'ger']] },
  { name: 'Watermelon', label: ['Water-', 'melon'], emoji: '🍉', level: 1, notes: [[3, 'Wa-'], [3, 'ter-'], [3, 'mel-'], [3, 'on']] },
  { name: 'Chocolate', label: ['Choco-', 'late'], emoji: '🍫', level: 2, notes: [[4, 'Choc-'], [4, 'o-'], [4, 'late']] },
  { name: 'Bacon', label: ['Bacon'], emoji: '🥓', level: 2, notes: [[3, 'Ba-'], [9, 'con']] },
  { name: 'Eggs and', label: ['Eggs', 'and'], emoji: '🍳', level: 2, notes: [[9, 'Eggs'], [3, 'and']] },
  { name: 'Waffles and', label: ['Waffles', 'and'], emoji: '🧇', level: 2, notes: [[3, 'Waf-'], [6, 'fles'], [3, 'and']] },
];

// Internally all durations are in ticks: 12 per beat, so sixteenths (3) and triplets (4) both fit.
const TPB = 12;
function prepRhythm(r, ticksPerUnit) {
  r.notes = r.notes.map(([d, syl]) => [Math.round(d * ticksPerUnit), syl]);
  let s = 0;
  r.starts = r.notes.map(([d]) => { const at = s; s += d; return at; });
  r.beats = s / TPB;
  let run = 0;
  r.maxSixteenthRun = 0;
  for (const [d] of r.notes) { run = d === 3 ? run + 1 : 0; r.maxSixteenthRun = Math.max(r.maxSixteenthRun, run); }
}
RHYTHMS.forEach((r) => prepRhythm(r, 3)); // RHYTHMS above are written in sixteenths
CELLS.forEach((c) => prepRhythm(c, 1));

// Practice levels: easy = no sixteenths, medium = no runs of four sixteenths, all = everything.
const LEVELS = { easy: 'Easy', medium: 'Medium', all: 'All' };
const REPS = [1, 2, 4, 8];
const COUNT_IN_BEATS = 4;
const CALIB_BPM = 80;         // microphone calibration: strum along to this many clicks at this tempo
const CALIB_BEATS = 8;
const METERS = [2, 3, 4];
const MODES = ['metronome', 'rhythm', 'practice', 'scroll'];
const PLAY_KINDS = ['practice', 'scroll']; // the two views of the Practice tab, where you play along
const isPlayAlong = () => PLAY_KINDS.includes(state.mode);

// Timing tolerance for scoring: full marks within `perfect` of the note, falling evenly to
// none at `zero` (seconds).
const TOLERANCES = {
  strict: { label: 'Strict', perfect: 0.02, zero: 0.1 },
  normal: { label: 'Normal', perfect: 0.03, zero: 0.15 },
  relaxed: { label: 'Relaxed', perfect: 0.04, zero: 0.2 },
};

const DEFAULTS = {
  bpm: 80, beats: 4, accents: [ACCENT, NORMAL, NORMAL, NORMAL], subdivision: 1, sound: 'click', volume: 0.8,
  mode: 'metronome', rhythm: 0, rhythmClick: true,
  practiceReps: 2, practiceLevel: 'all', practiceGuide: false, practiceListen: false, practiceTolerance: 'normal', micLatency: null,
  scrollMeter: 4, scrollLevel: 'all', scrollGuide: false, scrollLabels: true,
  practiceStyle: 'practice', // which Practice view was used last: 'practice' (Now & Next) or 'scroll'
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const $ = (id) => document.getElementById(id);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const markingFor = (bpm) => MARKINGS.find(([limit]) => bpm < limit)[1];

function normalizeAccents(list, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const v = Array.isArray(list) ? list[i] : undefined;
    out.push(v === MUTE || v === NORMAL || v === ACCENT ? v : (i === 0 ? ACCENT : NORMAL));
  }
  return out;
}

function loadSettings() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { /* storage unavailable */ }
  const bpm = Math.round(Number(s.bpm));
  const beats = Math.round(Number(s.beats));
  const volume = Number(s.volume);
  const out = {
    bpm: Number.isFinite(bpm) ? clamp(bpm, MIN_BPM, MAX_BPM) : DEFAULTS.bpm,
    beats: Number.isFinite(beats) ? clamp(beats, 1, MAX_BEATS) : DEFAULTS.beats,
    subdivision: [1, 2, 3, 4].includes(s.subdivision) ? s.subdivision : DEFAULTS.subdivision,
    sound: Object.hasOwn(SOUNDS, s.sound) ? s.sound : DEFAULTS.sound,
    volume: Number.isFinite(volume) ? clamp(volume, 0, 1) : DEFAULTS.volume,
    mode: MODES.includes(s.mode) ? s.mode : DEFAULTS.mode,
    rhythm: Number.isInteger(s.rhythm) && s.rhythm >= 0 && s.rhythm < RHYTHMS.length ? s.rhythm : DEFAULTS.rhythm,
    rhythmClick: typeof s.rhythmClick === 'boolean' ? s.rhythmClick : DEFAULTS.rhythmClick,
    practiceReps: REPS.includes(s.practiceReps) ? s.practiceReps : DEFAULTS.practiceReps,
    practiceLevel: Object.hasOwn(LEVELS, s.practiceLevel) ? s.practiceLevel : DEFAULTS.practiceLevel,
    practiceGuide: typeof s.practiceGuide === 'boolean' ? s.practiceGuide : DEFAULTS.practiceGuide,
    practiceListen: typeof s.practiceListen === 'boolean' ? s.practiceListen : DEFAULTS.practiceListen,
    practiceTolerance: Object.hasOwn(TOLERANCES, s.practiceTolerance) ? s.practiceTolerance : DEFAULTS.practiceTolerance,
    micLatency: Number.isFinite(s.micLatency) ? clamp(Math.round(s.micLatency), 0, 1000) : DEFAULTS.micLatency,
    scrollMeter: METERS.includes(s.scrollMeter) ? s.scrollMeter : DEFAULTS.scrollMeter,
    practiceStyle: PLAY_KINDS.includes(s.practiceStyle) ? s.practiceStyle : DEFAULTS.practiceStyle,
    scrollLevel: Object.hasOwn(LEVELS, s.scrollLevel) ? s.scrollLevel : DEFAULTS.scrollLevel,
    scrollGuide: typeof s.scrollGuide === 'boolean' ? s.scrollGuide : DEFAULTS.scrollGuide,
    scrollLabels: typeof s.scrollLabels === 'boolean' ? s.scrollLabels : DEFAULTS.scrollLabels,
  };
  out.accents = normalizeAccents(s.accents ?? DEFAULTS.accents, out.beats);
  return out;
}

const state = loadSettings();
let saveTimer = 0;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, 250);
}

/* ---------- Audio context ---------- */

let ctx = null;
let master = null;
let silentAudio = null;

const volumeToGain = (v) => v * v * 0.9;

function ensureAudio() {
  if (!ctx) {
    // iOS 17+: play through the silent switch, like a music app would.
    if (navigator.audioSession) {
      try { navigator.audioSession.type = 'playback'; } catch { /* ignore */ }
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC({ latencyHint: 'interactive' });
    master = ctx.createGain();
    master.gain.value = volumeToGain(state.volume);
    master.connect(ctx.destination);

    // Unlock: play a one-sample silent buffer inside the user gesture.
    const unlock = ctx.createBufferSource();
    unlock.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    unlock.connect(ctx.destination);
    unlock.start(0);

    // Older iOS: a looping silent <audio> element moves the app into the
    // "playback" audio category so the ring/silent switch doesn't mute clicks.
    if (!navigator.audioSession) startSilentAudio();
  }
  if (silentAudio && silentAudio.paused) silentAudio.play().catch(() => {});
  return ctx.state === 'running' ? Promise.resolve() : ctx.resume();
}

function startSilentAudio() {
  const rate = 8000, n = 4000;
  const buf = new ArrayBuffer(44 + n);
  const v = new DataView(buf);
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + n, true); str(8, 'WAVE');
  str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, rate, true); v.setUint32(28, rate, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true);
  str(36, 'data'); v.setUint32(40, n, true);
  for (let i = 0; i < n; i++) v.setUint8(44 + i, 128); // 8-bit PCM silence
  silentAudio = new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })));
  silentAudio.loop = true;
  silentAudio.setAttribute('playsinline', '');
  silentAudio.play().catch(() => {});
}

/* ---------- Voices: synthesized once per sound, kept as samples ---------- */

const VOICE_SECONDS = 0.16;
const LEVEL_GAIN = { accent: 1, beat: 0.6, sub: 0.34 };
const voiceCache = new Map(); // sound -> { accent, beat, sub, rhythm } as Float32Array

function envelope(c, out, t, peak, decay) {
  const env = c.createGain();
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(peak, t + 0.0015);
  env.gain.exponentialRampToValueAtTime(0.0005, t + decay);
  env.connect(out);
  return env;
}

function tone(c, out, t, freq, decay, peak, type = 'sine') {
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(envelope(c, out, t, peak, decay));
  osc.start(t);
  osc.stop(t + decay + 0.01);
}

function noiseHit(c, out, t, freq, q, decay, peak, type = 'bandpass') {
  const noise = c.createBuffer(1, Math.ceil(c.sampleRate * (decay + 0.01)), c.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = noise;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  src.connect(filter);
  filter.connect(envelope(c, out, t, peak, decay));
  src.start(t);
}

function beep(c, out, t, freq, dur, peak) {
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.frequency.value = freq;
  env.gain.setValueAtTime(0, t);
  env.gain.linearRampToValueAtTime(peak, t + 0.003);
  env.gain.setValueAtTime(peak, t + dur);
  env.gain.linearRampToValueAtTime(0, t + dur + 0.012);
  osc.connect(env);
  env.connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function synth(c, out, sound, level) {
  const g = LEVEL_GAIN[level];
  const pick = (a, b, s) => (level === 'accent' ? a : level === 'beat' ? b : s);
  switch (sound) {
    case 'rhythm': // the rhythm-guide note: a short, warm pitched tone
      tone(c, out, 0, 523.25, 0.14, 0.6, 'sine');
      tone(c, out, 0, 1046.5, 0.035, 0.2, 'triangle');
      break;
    case 'wood': {
      const f = pick(1650, 1150, 950);
      tone(c, out, 0, f, 0.07, g * 0.75, 'sine');
      tone(c, out, 0, f * 2.7, 0.025, g * 0.15, 'sine');
      noiseHit(c, out, 0, f * 1.4, 3, 0.025, g * 0.9);
      break;
    }
    case 'beep':
      beep(c, out, 0, pick(1320, 880, 660), 0.06, g * 0.5);
      break;
    default: // click
      tone(c, out, 0, pick(2500, 1750, 1400), 0.03, g * 0.8, 'triangle');
      noiseHit(c, out, 0, 5000, 0.7, 0.008, g * 0.5, 'highpass');
  }
}

function renderOffline(sound, level) {
  const sr = ctx.sampleRate;
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const oc = new OAC(1, Math.ceil(VOICE_SECONDS * sr), sr);
  synth(oc, oc.destination, sound, level);
  return new Promise((resolve, reject) => {
    oc.oncomplete = (e) => resolve(e.renderedBuffer);
    const p = oc.startRendering();
    if (p && p.then) p.then(resolve, reject);
  }).then((buf) => buf.getChannelData(0).slice());
}

async function getVoices(sound) {
  if (!voiceCache.has(sound)) {
    const [accent, beat, sub, rhythm] = await Promise.all([
      renderOffline(sound, 'accent'), renderOffline(sound, 'beat'), renderOffline(sound, 'sub'),
      renderOffline('rhythm', 'accent'),
    ]);
    voiceCache.set(sound, { accent, beat, sub, rhythm });
  }
  return voiceCache.get(sound);
}

/* ---------- Player ----------
 * One loop (a bar, or one rhythm) is rendered into a buffer that the audio engine
 * loops on its own. Timing therefore never depends on JavaScript timers, so it stays
 * exact even when iOS throttles or pauses the page in the background. When settings
 * change while playing, a new loop is spliced in exactly on the next beat.
 */

let playing = false;
let runId = 0;
const sources = new Set();  // live looping sources (old ones end at their splice point)
const timelines = [];       // [{ start, t0, beatSec, beats, kind, rhythm, items }] for the display, oldest first
const history = [];         // the same, kept ~10 s longer, for scoring strums

// Listening (Practice): see "Listening" below.
let mic = null;             // { stream, src, node } while the microphone is open
let micOpening = null;      // promise while it is being opened
let micModule = null;       // promise: the detector worklet loaded into the audio context
let calibrating = false;    // the current run is a calibration
let calibOnsets = [];       // onsets ({ raw, flux }) heard during calibration
let score = null;           // live scoring state while listening
let lastScore = null;       // the same, kept after Stop so the diagnostics list stays readable

/* Practice sequence: a random run of rhythms (no immediate repeats). The audio loop
 * holds one sequence; while the app is visible a fresh one is spliced in at each wrap. */
let practiceSeq = [];
let practiceNext = [];

function practicePool() {
  return RHYTHMS.map((r, i) => i).filter((i) => {
    const m = RHYTHMS[i].maxSixteenthRun;
    if (RHYTHMS[i].level === 2 && state.practiceLevel !== 'all') return false;
    return state.practiceLevel === 'easy' ? m === 0 : state.practiceLevel === 'medium' ? m <= 2 : true;
  });
}

function genSequence(avoidFirst = -1) {
  const pool = practicePool();
  // Aim for a loop of ~24 s (keeps the audio buffer small at slow tempos), 3–16 patterns.
  const itemSec = 2 * state.practiceReps * (60 / state.bpm);
  const n = clamp(Math.floor(24 / itemSec), 3, 16);
  const seq = [];
  let prev = avoidFirst;
  for (let i = 0; i < n; i++) {
    const choices = pool.length > 1 ? pool.filter((x) => x !== prev) : pool;
    prev = choices[Math.floor(Math.random() * choices.length)];
    seq.push(prev);
  }
  // If the loop ever repeats unchanged (e.g. in the background), avoid last == first.
  if (pool.length > 2 && seq[n - 1] === seq[0]) seq[n - 1] = pool.find((x) => x !== seq[0] && x !== seq[n - 2]);
  return seq;
}

function resetPractice() {
  practiceSeq = genSequence();
  practiceNext = genSequence(practiceSeq[practiceSeq.length - 1]);
}

/* Scroll sequence: whole bars of random one-beat food groups. Same loop-and-splice
 * scheme as practice; the strip always knows the next sequence so it can show 4 bars ahead. */
let scrollSeq = [];
let scrollNext = [];
let seqId = 0;

function genScroll() {
  const max = { easy: 0, medium: 1, all: 2 }[state.scrollLevel];
  const pool = CELLS.map((c, i) => i).filter((i) => CELLS[i].level <= max);
  const bpb = state.scrollMeter;
  // ~24 s per loop (small buffers at slow tempos), at least 6 bars so the 4-bar view only
  // ever needs the current and the next sequence.
  const bars = clamp(Math.floor(24 / (bpb * 60 / state.bpm)), 6, 32);
  const seq = [];
  for (let i = 0; i < bars * bpb; i++) {
    let c;
    do { c = pool[Math.floor(Math.random() * pool.length)]; }
    while (pool.length > 1 && i >= 2 && c === seq[i - 1] && c === seq[i - 2]); // no 3 in a row
    seq.push(c);
  }
  seq.id = ++seqId;
  return seq;
}

function resetScroll() {
  scrollSeq = genScroll();
  scrollNext = genScroll();
}

// What to play, as [position in beats, voice samples] pairs.
function patternEvents(voices) {
  const events = [];
  if (state.mode === 'scroll') {
    const bpb = state.scrollMeter;
    const notes = [];
    scrollSeq.forEach((ci, b) => {
      events.push([b, b % bpb === 0 ? voices.accent : voices.beat]);
      if (state.scrollGuide) CELLS[ci].starts.forEach((s) => events.push([b + s / TPB, voices.rhythm]));
      CELLS[ci].starts.forEach((s) => notes.push(b + s / TPB));
    });
    return { beats: scrollSeq.length, events, kind: 'scroll', cells: scrollSeq, bpb, notes };
  }
  if (state.mode === 'practice') {
    const reps = state.practiceReps;
    const items = [];
    const notes = []; // when each note is due, in beats (for scoring what the microphone hears)
    let beat = 0;
    for (const ri of practiceSeq) {
      const r = RHYTHMS[ri];
      items.push({ r: ri, start: beat, beats: r.beats, reps });
      for (let k = 0; k < reps; k++) {
        for (let b = 0; b < r.beats; b++) {
          events.push([beat + b, b > 0 ? voices.sub : k === 0 ? voices.accent : voices.beat]);
        }
        if (state.practiceGuide) r.starts.forEach((s) => events.push([beat + s / TPB, voices.rhythm]));
        r.starts.forEach((s) => notes.push(beat + s / TPB));
        beat += r.beats;
      }
    }
    return { beats: beat, events, kind: 'practice', items, notes };
  }
  if (state.mode === 'rhythm') {
    const r = RHYTHMS[state.rhythm];
    if (state.rhythmClick) {
      for (let b = 0; b < r.beats; b++) events.push([b, b === 0 ? voices.beat : voices.sub]);
    }
    r.starts.forEach((s) => events.push([s / TPB, voices.rhythm]));
    return { beats: r.beats, events, kind: 'rhythm', rhythm: state.rhythm };
  }
  const { beats, subdivision: sub } = state;
  for (let i = 0; i < beats; i++) {
    const level = state.accents[i];
    if (level === MUTE) continue;
    for (let j = 0; j < sub; j++) {
      events.push([i + j / sub, j > 0 ? voices.sub : level === ACCENT ? voices.accent : voices.beat]);
    }
  }
  return { beats, events, kind: 'metronome' };
}

function renderEvents({ beats, events, bpm = state.bpm, ...info }) {
  const sr = ctx.sampleRate;
  const len = Math.max(1, Math.round(beats * (60 / bpm) * sr));
  const beatSamples = len / beats;
  const buffer = ctx.createBuffer(1, len, sr);
  const data = buffer.getChannelData(0);
  for (const [pos, v] of events) {
    const at = Math.round(pos * beatSamples);
    // Tails that run past the end wrap to the start, as they would when looping.
    for (let k = 0; k < v.length; k++) data[(at + k) % len] += v[k];
  }
  const sounds = [...new Set(events.map(([pos]) => pos))].sort((a, b) => a - b); // when anything sounds, in beats
  return { ...info, buffer, beats, beatSec: beatSamples / sr, sounds };
}

const buildLoop = (voices) => renderEvents(patternEvents(voices));

function buildCountIn(voices, beats = COUNT_IN_BEATS, bpb = beats, bpm = state.bpm) {
  const events = [];
  for (let b = 0; b < beats; b++) events.push([b, b % bpb === 0 ? voices.accent : voices.beat]);
  return renderEvents({ beats, events, kind: 'countin', bpb, bpm });
}

// Calibration: plain clicks at a fixed, easy tempo; the player strums on each one.
function buildCalibration(voices) {
  const events = [], notes = [];
  for (let b = 0; b < CALIB_BEATS; b++) {
    events.push([b, b % 4 === 0 ? voices.accent : voices.beat]);
    notes.push(b);
  }
  return renderEvents({ beats: CALIB_BEATS, events, kind: 'calib', bpm: CALIB_BPM, notes });
}

let timelineId = 0;
function launch(loop, when, beatIndex, { once = false } = {}) {
  const offset = beatIndex * loop.beatSec;
  // For the scroll strip: which cells came before this loop (shown behind the playhead).
  const prevTl = timelines[timelines.length - 1];
  let prevCells = null;
  if (loop.kind === 'scroll' && prevTl && prevTl.kind === 'scroll') {
    prevCells = prevTl.cells === loop.cells ? prevTl.prevCells : prevTl.cells;
  }
  const src = ctx.createBufferSource();
  src.buffer = loop.buffer;
  src.loop = !once;
  src.connect(master);
  for (const old of sources) old.stop(when);
  src.start(when, offset);
  sources.add(src);
  src.onended = () => { sources.delete(src); src.disconnect(); };
  const tl = {
    id: ++timelineId, start: when, t0: when - offset, beatSec: loop.beatSec, beats: loop.beats,
    kind: loop.kind, rhythm: loop.rhythm ?? -1, items: loop.items,
    cells: loop.cells, bpb: loop.bpb, prevCells, notes: loop.notes, sounds: loop.sounds, once,
  };
  timelines.push(tl);
  // A longer record than `timelines` (which the display trims), for scoring strums
  // that the microphone reports a little after they were played.
  while (history.length && history[history.length - 1].start >= when) history.pop();
  while (history.length > 1 && history[1].start < when - 10) history.shift();
  history.push(tl);
}

async function start() {
  if (playing) return;
  playing = true;
  const id = ++runId;
  updatePlayButtons();
  try {
    await Promise.race([ensureAudio(), new Promise((r) => setTimeout(r, 1000))]);
    const voices = await getVoices(state.sound);
    if (id !== runId) return;
    const listen = isPlayAlong() && (state.practiceListen || calibrating);
    if (listen) {
      showScoreMessage('Opening the microphone…');
      try {
        await openMic();
      } catch (err) {
        micFailed(err);
        if (calibrating) { stop(); return; }
      }
      if (id !== runId) { if (!playing) closeMic(); return; }
    }
    let when = ctx.currentTime + 0.05;
    if (calibrating) {
      const countIn = buildCountIn(voices, 4, 4, CALIB_BPM);
      launch(countIn, when, 0, { once: true });
      launch(buildCalibration(voices), when + countIn.beats * countIn.beatSec, 0, { once: true });
      showScoreMessage('Calibrating: strum once on every click after the count-in');
    } else if (state.mode === 'practice' || state.mode === 'scroll') {
      const bpb = state.mode === 'scroll' ? state.scrollMeter : COUNT_IN_BEATS;
      const countIn = buildCountIn(voices, bpb >= 3 ? bpb : bpb * 2, bpb); // 2/4 counts in two bars
      launch(countIn, when, 0, { once: true });
      when += countIn.beats * countIn.beatSec;
    }
    if (!calibrating) launch(buildLoop(voices), when, 0);
    if (listen && mic && !calibrating) beginScoring();
  } catch (err) {
    console.error(err);
    if (id === runId) stop();
    return;
  }
  requestAnimationFrame(draw);
  requestWakeLock();
  updateMediaSession();
}

function stop() {
  playing = false;
  runId++;
  calibrating = false;
  closeMic();
  for (const s of sources) { try { s.stop(); } catch { /* not started */ } }
  timelines.length = 0;
  history.length = 0;
  setActiveBeat(-1);
  setActiveNote(-1);
  resetPractice();
  showPracticeIdle();
  resetScroll();
  showScrollIdle();
  updatePlayButtons();
  releaseWakeLock();
  updateMediaSession();
  suspendSoon();
  setTimeout(applyUpdate, 0);
}

// Release the audio hardware shortly after stopping, so iOS can drop the
// lock-screen "Now Playing" widget. ensureAudio() resumes it on the next start.
let suspendTimer = 0;
function suspendSoon() {
  clearTimeout(suspendTimer);
  suspendTimer = setTimeout(() => {
    if (playing || !ctx) return;
    if (ctx.state === 'running') ctx.suspend().catch(() => {});
    if (silentAudio) silentAudio.pause();
  }, 400);
}

// Called after any change that affects what's playing. Coalesced to one rebuild per frame.
// restart = begin the new pattern from its first beat (new rhythm or mode) instead of
// continuing at the same position (tempo or accent changes).
let rebuildQueued = false;
let restartQueued = false;
function patternChanged(restart = false) {
  updateMediaSession();
  if (!playing || !timelines.length || calibrating) return;
  restartQueued ||= restart;
  if (rebuildQueued) return;
  rebuildQueued = true;
  requestAnimationFrame(async () => {
    rebuildQueued = false;
    const fromStart = restartQueued;
    restartQueued = false;
    const id = runId;
    let voices;
    try { voices = await getVoices(state.sound); } catch (err) { console.error(err); return; }
    if (id !== runId || !playing || !timelines.length) return;
    if (fromStart && state.mode === 'practice') resetPractice();
    if (fromStart && state.mode === 'scroll') resetScroll();
    const tl = timelines[timelines.length - 1];
    const ref = Math.max(ctx.currentTime + 0.03, tl.start);
    const n = Math.ceil((ref - tl.t0) / tl.beatSec - 1e-9); // next beat boundary
    const loop = buildLoop(voices);
    launch(loop, tl.t0 + n * tl.beatSec, fromStart ? 0 : (n % tl.beats) % loop.beats);
  });
}

function noteAt(r, posBeats) {
  const ticks = posBeats * TPB + 1e-6;
  let idx = 0;
  for (let i = 0; i < r.starts.length; i++) if (r.starts[i] <= ticks) idx = i;
  return idx;
}

function draw() {
  if (!playing || !ctx) return;
  const now = ctx.currentTime;
  const t = now - (ctx.outputLatency || ctx.baseLatency || 0);
  while (timelines.length > 1 && timelines[1].start <= t) timelines.shift();
  const tl = timelines[0];
  if (tl && t >= tl.start) {
    const pos = ((t - tl.t0) / tl.beatSec + 1e-9) % tl.beats;
    setActiveBeat(tl.kind === 'metronome' ? Math.floor(pos) : -1);
    setActiveNote(tl.kind === 'rhythm' && tl.rhythm === state.rhythm ? noteAt(RHYTHMS[tl.rhythm], pos) : -1);
    const next = timelines.find((x) => (x.kind === 'practice' || x.kind === 'calib') && x.start > tl.start);
    if (tl.kind === 'countin' && next) {
      const count = Math.floor(pos) + 1;
      if (next.kind === 'calib') showCalibration(count, true);
      else showPractice({ phase: 'countin', count, next: next.items[0].r, lastBeat: count === tl.beats });
    } else if (tl.kind === 'practice') {
      showPractice(practiceAt(tl, pos));
    } else if (tl.kind === 'calib') {
      showCalibration(Math.min(tl.beats, Math.floor((t - tl.t0) / tl.beatSec) + 1), false);
      if (now > tl.start + tl.beats * tl.beatSec + micLatency() + 0.4) { finishCalibration(tl); return; }
    }
  }
  if (score) sweepMisses(now);
  if (state.mode === 'scroll') {
    const view = scrollViewAt(t);
    if (view) updateStrip(view);
  }
  if (state.mode === 'practice' || state.mode === 'scroll') queueNextSequence(now);
  requestAnimationFrame(draw);
}

/* Where the scroll strip is, in beats relative to the start of the current scroll loop
 * (negative during the count-in), plus the cells before, in and after that loop. */
function scrollViewAt(t) {
  const tl = timelines[0];
  if (!tl) return null;
  const after = (x) => timelines.find((y) => y.kind === 'scroll' && y.start > x.start);
  const nextCells = (x) => {
    const last = timelines[timelines.length - 1];
    return last.kind === 'scroll' && last.cells !== x.cells ? last.cells : scrollNext;
  };
  if (tl.kind === 'countin') {
    const loop = after(tl);
    if (!loop) return null;
    const p = t < tl.start ? 0 : Math.min((t - tl.t0) / tl.beatSec, tl.beats);
    return { pos: p - tl.beats, cells: loop.cells, prev: null, next: nextCells(loop), count: tl.beats, bpb: loop.bpb };
  }
  if (tl.kind !== 'scroll') return null;
  const pos = t < tl.start ? (tl.start - tl.t0) / tl.beatSec : ((t - tl.t0) / tl.beatSec + 1e-9) % tl.beats;
  return { pos, cells: tl.cells, prev: tl.prevCells, next: nextCells(tl), count: 0, bpb: tl.bpb };
}

function practiceAt(tl, pos) {
  const { items } = tl;
  let idx = 0;
  for (let i = 0; i < items.length && items[i].start <= pos; i++) idx = i;
  const it = items[idx];
  const within = pos - it.start;
  const rep = Math.min(it.reps - 1, Math.floor(within / it.beats));
  let next;
  if (idx + 1 < items.length) next = items[idx + 1].r;
  else {
    const later = timelines.find((x) => x.kind === 'practice' && x.start > tl.start);
    // Not spliced in yet (that happens ~3 s before the wrap): show the sequence that will be.
    next = later ? later.items[0].r : practiceNext[0];
  }
  const inPattern = within - rep * it.beats;
  return {
    phase: 'play', item: idx, r: it.r, rep: rep + 1, reps: it.reps, next,
    note: noteAt(RHYTHMS[it.r], inPattern),
    lastBeat: rep === it.reps - 1 && inPattern >= it.beats - 1, // final beat before the next rhythm
  };
}

// While visible: shortly before the practice loop wraps, splice in a fresh random sequence.
function queueNextSequence(now) {
  const tl = timelines[timelines.length - 1];
  const voices = voiceCache.get(state.sound);
  if (!tl || tl.kind !== state.mode || tl.start > now || rebuildQueued || !voices) return;
  const loopLen = tl.beats * tl.beatSec;
  const boundary = tl.t0 + Math.ceil((now - tl.t0) / loopLen + 1e-9) * loopLen;
  const lead = boundary - now;
  if (lead > Math.min(3, loopLen / 2) || lead < 0.08) return;
  if (tl.kind === 'practice') {
    practiceSeq = practiceNext;
    practiceNext = genSequence(practiceSeq[practiceSeq.length - 1]);
  } else {
    scrollSeq = scrollNext;
    scrollNext = genScroll();
  }
  launch(buildLoop(voices), boundary, 0);
}

async function preview() {
  try {
    await ensureAudio();
    const v = (await getVoices(state.sound)).accent;
    const buf = ctx.createBuffer(1, v.length, ctx.sampleRate);
    buf.getChannelData(0).set(v);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(master);
    src.start(ctx.currentTime + 0.01);
    if (!playing) suspendSoon();
  } catch { /* ignore */ }
}

/* ---------- Lock screen / Control Center ("Now Playing") ---------- */

let mediaKey = '';
function updateMediaSession() {
  if (!('mediaSession' in navigator)) return;
  try {
    const key = `${state.bpm}|${state.beats}|${state.mode}|${state.rhythm}|${state.practiceLevel}|${state.scrollMeter}`;
    if (key !== mediaKey && typeof MediaMetadata === 'function') {
      mediaKey = key;
      const r = RHYTHMS[state.rhythm];
      const info = {
        metronome: ['Metronome', `${state.bpm} BPM · ${markingFor(state.bpm)}`,
          `${state.beats} beat${state.beats === 1 ? '' : 's'} per bar`],
        rhythm: [r.name, `${state.bpm} BPM · Rhythm guide`, 'Metronome'],
        practice: ['Rhythm practice', `${state.bpm} BPM · ${LEVELS[state.practiceLevel]}`, 'Metronome'],
        scroll: ['Rhythm reading', `${state.bpm} BPM · ${state.scrollMeter}/4`, 'Metronome'],
      }[state.mode];
      navigator.mediaSession.metadata = new MediaMetadata({
        title: info[0],
        artist: info[1],
        album: info[2],
        artwork: [
          { src: new URL('icons/icon-512.png', location.href).href, sizes: '512x512', type: 'image/png' },
          { src: new URL('icons/icon-192.png', location.href).href, sizes: '192x192', type: 'image/png' },
        ],
      });
    }
    navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
  } catch { /* ignore */ }
}

if ('mediaSession' in navigator) {
  const handlers = {
    play: () => start(),
    pause: () => stop(),
    stop: () => stop(),
    seekbackward: null, seekforward: null, seekto: null, previoustrack: null, nexttrack: null,
  };
  for (const [action, fn] of Object.entries(handlers)) {
    try { navigator.mediaSession.setActionHandler(action, fn); } catch { /* unsupported action */ }
  }
}

/* ---------- Keep the screen awake while playing ---------- */

let wakeLock = null;
async function requestWakeLock() {
  if (!('wakeLock' in navigator) || document.visibilityState !== 'visible' || wakeLock) return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => { wakeLock = null; });
  } catch { wakeLock = null; }
}
function releaseWakeLock() {
  if (wakeLock) wakeLock.release().catch(() => {});
  wakeLock = null;
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && playing) {
    ensureAudio().catch(() => {});
    requestWakeLock();
  }
});

/* ---------- Music notation (SVG, drawn from the rhythm data) ---------- */

// Horizontal space per note in the compact (card) layout, by duration in ticks.
const SLOT = { 3: 15, 4: 17, 6: 20, 9: 23, 12: 26 };
const NOTE_H = 52;         // height of the notes part of the SVG (stems, beams, heads)
const NOTATION_H = 66;     // full SVG height, including the strum arrows below the heads

// Guitar strum direction for each note ('D' down, 'U' up), decided per beat like a
// strumming hand that keeps moving: every beat starts down; in a beat of eighths the
// "&" is up; in a beat with sixteenths the hand moves in sixteenths (1 e & a = D U D U);
// a triplet beat is D U D.
function strokes(r) {
  return r.notes.map((n, i) => {
    const beat = Math.floor(r.starts[i] / TPB);
    const off = r.starts[i] % TPB;
    const inBeat = r.notes.map((x, j) => j).filter((j) => Math.floor(r.starts[j] / TPB) === beat);
    const has = (fn) => inBeat.some(fn);
    let step = 6;                                                            // eighths
    if (has((j) => r.notes[j][0] === 4)) step = 4;                           // triplets
    else if (has((j) => [3, 9].includes(r.notes[j][0]) || r.starts[j] % 6 === 3)) step = 3; // sixteenths
    return Math.round(off / step) % 2 === 0 ? 'D' : 'U';
  });
}
for (const r of [...RHYTHMS, ...CELLS]) r.strokes = strokes(r);

// Draws rhythm r as SVG. Compact spacing by default; with `prop` (SVG units per beat), notes
// are placed by time: each beat starts exactly at its beat position and the notes within it
// use IN_BEAT (80%) of the beat, leaving a small gap so neighbouring beat groups read separately.
const IN_BEAT = 0.8;
function notationSVG(r, scale, prop = 0) {
  const PAD = 6, BEAT_GAP = 8, HEAD_Y = 44, STEM_TOP = 10, BEAM = 4.5, BEAM_STEP = 7.5, H = NOTATION_H;
  const beatOf = (i) => Math.floor(r.starts[i] / TPB);
  const xs = [];
  let W;
  if (prop) {
    r.notes.forEach((n, i) => xs.push(6 + (beatOf(i) + (r.starts[i] % TPB) / TPB * IN_BEAT) * prop));
    W = r.beats * prop;
  } else {
    let x = PAD + 6, beat = 0;
    r.notes.forEach(([d], i) => {
      if (beatOf(i) !== beat) { x += BEAT_GAP; beat = beatOf(i); }
      xs.push(x);
      x += SLOT[d] ?? 20;
    });
    W = xs[xs.length - 1] + 6 + PAD + (r.notes[r.notes.length - 1][0] === 9 ? 5 : 0);
  }
  const stemX = (i) => xs[i] + 4.9;
  const rect = (x0, x1, y) => `<rect x="${(x0 - 0.7).toFixed(1)}" y="${y}" width="${(x1 - x0 + 1.4).toFixed(1)}" height="${BEAM}"/>`;

  let notes = '';
  let beams = '';
  r.notes.forEach(([d], i) => {
    const flag = (dy) => `<path d="M${stemX(i)} ${STEM_TOP + dy}c0 7 9 8 6.5 18c1-7-2-10-6.5-11z"/>`;
    notes += `<g class="n" data-i="${i}">` +
      `<ellipse cx="${xs[i].toFixed(1)}" cy="${HEAD_Y}" rx="5.7" ry="4.2" transform="rotate(-22 ${xs[i].toFixed(1)} ${HEAD_Y})"/>` +
      `<rect x="${(stemX(i) - 0.7).toFixed(1)}" y="${STEM_TOP}" width="1.4" height="${HEAD_Y - STEM_TOP - 1}"/>` +
      (d === 9 ? `<circle cx="${(xs[i] + 9.5).toFixed(1)}" cy="${HEAD_Y - 1.5}" r="1.9"/>` : '') +
      (d < TPB && isLoneInBeat(r, i) ? flag(0) + (d === 3 ? flag(BEAM_STEP) : '') : '') +
      strokeArrow(xs[i], r.strokes[i]) +
      '</g>';
  });

  // Beam groups: the short notes within each beat.
  for (let b = 0; b < r.beats; b++) {
    const group = r.notes.map((n, i) => i).filter((i) => beatOf(i) === b && r.notes[i][0] < TPB);
    if (group.length < 2) continue;
    const x0 = stemX(group[0]), x1 = stemX(group[group.length - 1]);
    beams += rect(x0, x1, STEM_TOP);
    // Second beam for sixteenths; a lone sixteenth gets a stub pointing into the group.
    for (let k = 0; k < group.length; k++) {
      if (r.notes[group[k]][0] !== 3) continue;
      let e = k;
      while (e + 1 < group.length && r.notes[group[e + 1]][0] === 3) e++;
      const y = STEM_TOP + BEAM_STEP;
      if (e > k) beams += rect(stemX(group[k]), stemX(group[e]), y);
      else if (k === group.length - 1) beams += rect(stemX(group[k]) - 7, stemX(group[k]), y);
      else beams += rect(stemX(group[k]), stemX(group[k]) + 7, y);
      k = e;
    }
    if (group.every((i) => r.notes[i][0] === 4)) {
      beams += `<text x="${((x0 + x1) / 2).toFixed(1)}" y="${STEM_TOP - 2.5}" font-size="9" font-style="italic" ` +
        `text-anchor="middle" font-family="-apple-system, system-ui, sans-serif">3</text>`;
    }
  }
  return `<svg class="notation" viewBox="0 0 ${W.toFixed(1)} ${H}" width="${(W * scale).toFixed(1)}" height="${(H * scale).toFixed(1)}" ` +
    `fill="currentColor" aria-hidden="true">${beams}${notes}</svg>`;
}

// Small arrow under a note head: down (↓) or up (↑) strum.
function strokeArrow(x, dir) {
  const top = 53, bottom = 64, cx = x.toFixed(1);
  const tip = dir === 'D' ? bottom : top;
  const wing = dir === 'D' ? tip - 3.6 : tip + 3.6;
  return `<path class="stroke" d="M${cx} ${top}V${bottom}M${(x - 3.2).toFixed(1)} ${wing}L${cx} ${tip}L${(x + 3.2).toFixed(1)} ${wing}" ` +
    `fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function isLoneInBeat(r, i) {
  const b = Math.floor(r.starts[i] / TPB);
  return r.notes.filter((n, j) => Math.floor(r.starts[j] / TPB) === b && n[0] < TPB).length === 1;
}

/* ---------- UI ---------- */

const el = {
  beats: $('beats'), slider: $('slider'), minus: $('minus'), plus: $('plus'), tap: $('tap'),
  beatsOut: $('beatsOut'), beatsMinus: $('beatsMinus'), beatsPlus: $('beatsPlus'),
  subdivision: $('subdivision'), sound: $('sound'), volume: $('volume'), tabs: $('tabs'),
  metronomeView: $('metronomeView'), rhythmView: $('rhythmView'),
  nowEmoji: $('nowEmoji'), nowWords: $('nowWords'), nowNotes: $('nowNotes'),
  rMinus: $('rMinus'), rPlus: $('rPlus'), clickToggle: $('clickToggle'), grid: $('rhythmGrid'),
  practiceView: $('practiceView'), pNow: $('pNow'), pNext: $('pNext'), pRep: $('pRep'),
  pNowCard: $('pNowCard'), styleRow: $('styleRow'), pStyle: $('pStyle'), listenRows: $('listenRows'), pNextCard: $('pNextCard'),
  pScoreCard: $('pScoreCard'), pPct: $('pPct'), pScale: $('pScale'), pScoreMsg: $('pScoreMsg'),
  pSession: $('pSession'), pMeter: $('pMeter'), pListen: $('pListen'), pCalibRow: $('pCalibRow'), pTolRow: $('pTolRow'), pTolerance: $('pTolerance'),
  pDelay: $('pDelay'), pCalib: $('pCalib'), pDiag: $('pDiag'), pHint: $('pHint'), pDiagToggle: $('pDiagToggle'), version: $('version'),
  pMinus: $('pMinus'), pPlus: $('pPlus'), guideToggle: $('guideToggle'), pReps: $('pReps'), pLevel: $('pLevel'),
  scrollView: $('scrollView'), sStrip: $('sStrip'), sTrack: $('sTrack'), sPlayhead: $('sPlayhead'),
 sMinus: $('sMinus'), sPlus: $('sPlus'), sGuide: $('sGuide'),
  sMeter: $('sMeter'), sLevel: $('sLevel'), sNotesOnly: $('sNotesOnly'),
  bpms: $$('.js-bpm'), markings: $$('.js-marking'), plays: $$('.js-play'),
};

function setFill(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty('--fill', pct + '%');
}

let shownBpm = null;
function setBpm(value) {
  const bpm = clamp(Math.round(value), MIN_BPM, MAX_BPM);
  if (!Number.isFinite(bpm) || bpm === shownBpm) return;
  shownBpm = bpm;
  state.bpm = bpm;
  el.bpms.forEach((e) => { e.textContent = bpm; });
  el.markings.forEach((e) => { e.textContent = markingFor(bpm); });
  el.slider.value = bpm;
  setFill(el.slider);
  save();
  patternChanged();
  tuneDetector();
}

function setBeats(n) {
  state.beats = clamp(n, 1, MAX_BEATS);
  state.accents = normalizeAccents(state.accents, state.beats);
  el.beatsOut.textContent = state.beats;
  renderBeats();
  save();
  if (state.mode === 'metronome') patternChanged();
}

const LEVEL_NAMES = ['muted', 'normal', 'accent'];
function renderBeats() {
  const n = state.beats;
  const [size, gap] = n <= 6 ? [46, 10] : n <= 8 ? [40, 8] : [30, 6];
  el.beats.style.setProperty('--size', size + 'px');
  el.beats.style.setProperty('--gap', gap + 'px');
  activeDot = null;
  activeIndex = -1;
  el.beats.replaceChildren(...state.accents.map((level, i) => {
    const b = document.createElement('button');
    b.className = 'dot';
    b.dataset.level = level;
    b.dataset.index = i;
    b.setAttribute('aria-label', `Beat ${i + 1}: ${LEVEL_NAMES[level]}`);
    return b;
  }));
}

let activeDot = null;
let activeIndex = -1;
function setActiveBeat(i) {
  if (i === activeIndex && (i < 0 || activeDot)) return;
  if (activeDot) activeDot.classList.remove('on');
  activeIndex = i;
  activeDot = i >= 0 ? el.beats.children[i] || null : null;
  if (activeDot) activeDot.classList.add('on');
}

let activeNote = -1;
function setActiveNote(i) {
  if (i === activeNote) return;
  for (const e of el.rhythmView.querySelectorAll('.now .on')) e.classList.remove('on');
  activeNote = i;
  if (i < 0) return;
  for (const e of el.rhythmView.querySelectorAll(`.now [data-i="${i}"]`)) e.classList.add('on');
}

function updatePlayButtons() {
  document.body.classList.toggle('is-playing', playing);
  for (const b of el.plays) {
    b.querySelector('.js-play-label').textContent = playing ? 'Stop' : 'Start';
    b.setAttribute('aria-label', playing ? 'Stop' : 'Start');
    b.querySelector('.js-play-icon').innerHTML = playing
      ? '<rect x="6" y="6" width="12" height="12" rx="2"/>'
      : '<path d="M7 4.5v15l13-7.5z"/>';
  }
}

function segmented(container, options, current, onPick) {
  const buttons = options.map((opt) => {
    const b = document.createElement('button');
    b.innerHTML = opt.html;
    if (opt.title) b.title = opt.title;
    b.setAttribute('aria-label', opt.title || opt.html);
    b.addEventListener('click', () => {
      buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      onPick(opt.value);
    });
    b.setAttribute('aria-pressed', String(opt.value === current));
    return b;
  });
  container.replaceChildren(...buttons);
}

// Press-and-hold repeat for +/- buttons, accelerating after a while.
function holdRepeat(button, step) {
  let delayTimer = 0, repeatTimer = 0, count = 0;
  const end = () => { clearTimeout(delayTimer); clearInterval(repeatTimer); };
  button.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    end();
    count = 0;
    step(1);
    delayTimer = setTimeout(() => {
      repeatTimer = setInterval(() => step(++count > 15 ? 5 : 1), 80);
    }, 400);
  });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => button.addEventListener(ev, end));
  button.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Tap tempo: average of recent intervals; resets after a 2 s pause.
let taps = [];
function tap() {
  const now = performance.now();
  if (taps.length && now - taps[taps.length - 1] > 2000) taps = [];
  taps.push(now);
  if (taps.length > 6) taps.shift();
  if (taps.length >= 2) setBpm(60000 / ((taps[taps.length - 1] - taps[0]) / (taps.length - 1)));
  el.tap.classList.remove('tapped');
  void el.tap.offsetWidth; // restart animation
  el.tap.classList.add('tapped');
}

/* ---------- Rhythm guide UI ---------- */

function renderNow() {
  const r = RHYTHMS[state.rhythm];
  activeNote = -1;
  el.nowEmoji.textContent = r.emoji;
  el.nowWords.innerHTML = wordsHTML(r);
  el.nowNotes.innerHTML = notationSVG(r, 1.45);
  el.grid.querySelectorAll('.card').forEach((c, i) => c.setAttribute('aria-pressed', String(i === state.rhythm)));
}

function renderGrid() {
  el.grid.replaceChildren(...RHYTHMS.map((r, i) => {
    const b = document.createElement('button');
    b.className = 'card' + (r.beats > 2 ? ' wide' : '');
    b.setAttribute('aria-label', r.name);
    b.innerHTML = `<div class="emoji">${r.emoji}</div><div class="name">${r.name}</div>${notationSVG(r, 0.78)}`;
    b.addEventListener('click', () => selectRhythm(i));
    return b;
  }));
}

function selectRhythm(i) {
  const changed = i !== state.rhythm;
  state.rhythm = i;
  save();
  renderNow();
  if (!playing) start();
  else if (changed) patternChanged(true);
}

function setMode(mode) {
  if (calibrating) stop();
  state.mode = mode;
  if (isPlayAlong()) state.practiceStyle = mode;
  placePracticeShared();
  const tab = isPlayAlong() ? 'practice' : mode;
  ['metronome', 'rhythm', 'practice'].forEach((v, i) => el.tabs.children[i]?.setAttribute('aria-pressed', String(v === tab)));
  if (!isPlayAlong()) closeMic();
  else if (playing && state.practiceListen && !mic) startListening();
  el.metronomeView.hidden = mode !== 'metronome';
  el.rhythmView.hidden = mode !== 'rhythm';
  el.practiceView.hidden = mode !== 'practice';
  el.scrollView.hidden = mode !== 'scroll';
  document.body.dataset.mode = mode;
  if (!playing) { showPracticeIdle(); showScrollIdle(); }
  save();
  patternChanged(true);
}

/* ---------- Scroll UI: notation sliding past a fixed playhead ---------- */

let strip = {};          // render cache: key, metrics, highlighted note
const svgCache = new Map();

function stripMetrics() {
  const W = el.sStrip.clientWidth || 340;
  // At most 1 bar ahead of the playhead, plus a beat of history behind it.
  const ppb = Math.round(Math.max(36, (W - 8) / (state.scrollMeter + 1)) * 10) / 10;
  const scale = Math.min(1.8, ppb / 54);
  const fsMax = Math.round(12 * Math.max(1, scale * 0.85)); // labels grow with the notes
  const es = Math.round(18 * Math.max(1, scale * 0.9));       // emoji size above each beat
  const labels = state.scrollLabels;                          // false = notes only
  return {
    W, ppb, scale, fsMax, es, labels, playX: Math.round(ppb + 8), barX: barOffset(ppb, scale),
    eh: labels ? Math.round(es * 1.3) : 0,                    // emoji row height
    lh: labels ? Math.round(2.2 * fsMax) : 0,                 // label area height (two lines)
  };
}

// Where a bar line goes, relative to the start of the beat it precedes: halfway between the
// first note head of that beat (left edge at 0.3 units) and the furthest the previous beat's
// last note can reach (a note on its last sixteenth, head right edge 5.8 units past centre).
function barOffset(ppb, scale) {
  const prop = ppb / scale;
  const prevRight = 6 + 0.75 * IN_BEAT * prop + 5.8 - prop;
  return ((0.3 + prevRight) / 2) * scale;
}

// Widest label line in characters (sets one font size for all labels).
const LABEL_CHARS = Math.max(...CELLS.flatMap((c) => c.label.map((w) => w.length)));

function cellAt(view, b) {
  const len = view.cells.length;
  if (b >= 0 && b < len) return { c: view.cells[b] };
  if (b >= len) return b - len < view.next.length ? { c: view.next[b - len] } : null;
  if (view.count) return b >= -view.count ? { count: b + view.count + 1 } : null;
  if (view.prev && view.prev.length + b >= 0) return { c: view.prev[view.prev.length + b] };
  return null;
}

// Horizontal centre (px from the beat's left edge) of a cell's drawn notes, matching
// the proportional layout in notationSVG: heads at 6 + (offset in beat × IN_BEAT) units.
function notesCenter(c, m) {
  const prop = m.ppb / m.scale;
  const last = c.notes.length - 1;
  const lastX = 6 + ((c.starts[last] % TPB) / TPB) * IN_BEAT * prop;
  const right = lastX + (c.notes[last][0] === 9 ? 11.5 : 5.8); // include the dot of a dotted note
  return ((0.3 + right) / 2) * m.scale;
}

function cellSVG(ci, m) {
  const key = `${ci}|${m.ppb}`;
  if (!svgCache.has(key)) svgCache.set(key, notationSVG(CELLS[ci], m.scale, m.ppb / m.scale));
  return svgCache.get(key);
}

function renderStrip(view, b0, m) {
  const bpb = view.bpb;
  const rMin = -Math.ceil(m.playX / m.ppb) - 1;
  const rMax = Math.ceil((m.W - m.playX) / m.ppb) + 1;
  let html = '';
  for (let r = rMin; r <= rMax; r++) {
    const b = b0 + r;
    const cell = cellAt(view, b);
    if (!cell) continue;
    const x = (m.playX + r * m.ppb).toFixed(1);
    if (((b % bpb) + bpb) % bpb === 0) html += `<div class="bar" style="left:${(Number(x) + m.barX).toFixed(1)}px"></div>`;
    const cls = 'scell' + (r === 0 ? ' cur' : r < 0 ? ' past' : '');
    if (cell.count != null) {
      html += `<div class="${cls} scount" style="left:${x}px;width:${m.ppb}px">${cell.count}</div>`;
    } else {
      const c = CELLS[cell.c];
      const fs = clamp((m.ppb - 3) / (LABEL_CHARS * 0.56), 7, m.fsMax).toFixed(1); // same size for every label
      // Emoji centred over this beat's notes, then the notes, then the label (unless notes only).
      html += `<div class="${cls}" style="left:${x}px;width:${m.ppb}px">` +
        (m.labels ? `<div class="semoji" style="width:${(2 * notesCenter(c, m)).toFixed(1)}px;font-size:${m.es}px;height:${m.eh}px">${c.emoji}</div>` : '') +
        cellSVG(cell.c, m) +
        (m.labels ? `<div class="sword" style="font-size:${fs}px">${c.label.join('<br>')}</div>` : '') + '</div>';
    }
  }
  el.sTrack.innerHTML = html;

}

function updateStrip(view) {
  const m = stripMetrics();
  const sizeKey = `${m.ppb}|${m.labels}`;
  if (strip.sizeKey !== sizeKey) {
    strip.sizeKey = sizeKey;
    svgCache.clear();
    el.sStrip.style.height = `${Math.round(m.eh + NOTATION_H * m.scale + m.lh + (m.labels ? 30 : 24))}px`;
    el.sStrip.style.setProperty('--nh', `${Math.round(NOTE_H * m.scale)}px`);
    el.sStrip.style.setProperty('--bt', `${12 + m.eh}px`);
    el.sPlayhead.style.left = `${(m.playX + 6 * m.scale - 1).toFixed(1)}px`;
  }
  const b0 = Math.floor(view.pos + 1e-9);
  const frac = Math.max(0, view.pos - b0);
  const key = [b0, view.cells.id, view.prev?.id, view.next?.id, view.count, view.bpb, m.ppb, m.W, m.labels].join('|');
  if (strip.key !== key) {
    strip.key = key;
    strip.note = null;
    renderStrip(view, b0, m);
  }
  el.sTrack.style.transform = `translate3d(${(-frac * m.ppb).toFixed(2)}px,0,0)`;

  // Light up the note being played now.
  const cur = cellAt(view, b0);
  const note = playing && cur && cur.c != null && view.pos >= 0 ? noteAt(CELLS[cur.c], frac) : -1;
  if (strip.note !== note) {
    strip.note = note;
    for (const e of el.sTrack.querySelectorAll('.on')) e.classList.remove('on');
    if (note >= 0) {
      for (const e of el.sTrack.querySelectorAll(`.cur [data-i="${note}"]`)) e.classList.add('on');
    }
  }
}

function showScrollIdle() {
  if (el.scrollView.hidden || !scrollSeq.length) return;
  strip.key = null;
  updateStrip({ pos: 0, cells: scrollSeq, prev: null, next: scrollNext, count: 0, bpb: state.scrollMeter });
}

window.addEventListener('resize', () => {
  strip = {};
  if (!playing) showScrollIdle();
});

/* ---------- Practice UI ---------- */

const wordsHTML = (r) => r.notes
  .map(([, syl], i) => `<span class="syl" data-i="${i}">${syl}</span>${syl.endsWith('-') ? '' : ' '}`)
  .join('').trim();

let shown = {}; // what the practice cards currently show, to touch the DOM only on change

function showNext(ri) {
  if (shown.next === ri) return;
  shown.next = ri;
  const r = RHYTHMS[ri];
  el.pNext.innerHTML = `<div class="pnext-name"><span class="emoji">${r.emoji}</span><span>${r.name}</span></div>` +
    notationSVG(r, 0.95);
}

function showPracticeIdle() {
  shown = {};
  el.pRep.textContent = '';
  el.pRep.classList.remove('last');
  el.pNextCard.classList.remove('upnext');
  el.pNow.innerHTML = '<div class="pready">Ready</div>';
  showNext(practiceSeq[0]);
}

function showPractice(d) {
  const key = d.phase === 'countin' ? `c${d.count}` : `p${d.item}:${d.r}`;
  if (shown.key !== key) {
    shown.key = key;
    shown.note = -1;
    if (d.phase === 'countin') {
      el.pNow.innerHTML = `<div class="pcount">${d.count}</div><div class="psub">Get ready</div>`;
    } else {
      const r = RHYTHMS[d.r];
      el.pNow.innerHTML = `<div class="pwords">${r.emoji} ${wordsHTML(r)}</div>${notationSVG(r, 1.5)}`;
    }
  }
  const rep = d.lastBeat ? 'LAST BEAT' : d.phase === 'play' && d.reps > 1 ? `${d.rep} / ${d.reps}` : '';
  if (el.pRep.textContent !== rep) el.pRep.textContent = rep;
  if (shown.last !== !!d.lastBeat) {
    shown.last = !!d.lastBeat;
    el.pRep.classList.toggle('last', shown.last);
    el.pNextCard.classList.toggle('upnext', shown.last);
  }
  if (d.phase === 'play' && shown.note !== d.note) {
    shown.note = d.note;
    for (const e of el.pNow.querySelectorAll('.on')) e.classList.remove('on');
    for (const e of el.pNow.querySelectorAll(`[data-i="${d.note}"]`)) e.classList.add('on');
  }
  showNext(d.next);
}

/* ---------- Listening: score strums against the rhythm ----------
 * The microphone feeds an AudioWorklet (onset-worklet.js) that reports the audio-clock
 * time of every strum. Each strum is matched to the nearest note of the rhythm being
 * played. The phone's round-trip delay (sound out of the speaker, strum back into the
 * microphone) is measured once with Calibrate and subtracted.
 */

const SCORE_WINDOW = 16;    // the live percentage covers the last 16 notes
const MATCH_MAX = 0.15;     // s: a strum further than this from every note is an extra strum (or `zero`, if larger)

function micLatency() {
  if (state.micLatency != null) return state.micLatency / 1000;
  return ((ctx && (ctx.outputLatency || ctx.baseLatency)) || 0.01) + 0.03; // rough guess until calibrated
}

async function openMic() {
  if (mic) return;
  if (!micOpening) {
    micOpening = (async () => {
      if (!navigator.mediaDevices?.getUserMedia || !window.AudioWorkletNode || !ctx.audioWorklet) {
        throw Object.assign(new Error('unsupported'), { name: 'Unsupported' });
      }
      // Record and play at the same time (iOS 17+); back to plain playback when the mic closes.
      if (navigator.audioSession) { try { navigator.audioSession.type = 'play-and-record'; } catch { /* ignore */ } }
      // Echo cancellation keeps the app's own clicks out of what the detector hears.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false },
      });
      try {
        micModule ||= ctx.audioWorklet.addModule('onset-worklet.js');
        await micModule;
      } catch (err) {
        micModule = null;
        stream.getTracks().forEach((t) => t.stop());
        throw err;
      }
      const src = ctx.createMediaStreamSource(stream);
      const node = new AudioWorkletNode(ctx, 'onset-detector', { numberOfOutputs: 1, outputChannelCount: [1] });
      node.port.onmessage = (e) => onMicMessage(e.data);
      src.connect(node);
      node.connect(ctx.destination); // outputs silence; connected so it keeps running
      mic = { stream, src, node };
      tuneDetector();
    })();
  }
  try { await micOpening; } finally { micOpening = null; }
}

function closeMic() {
  score = null;
  if (mic) {
    mic.stream.getTracks().forEach((t) => t.stop());
    mic.node.port.onmessage = null;
    mic.src.disconnect();
    mic.node.disconnect();
    mic = null;
    if (navigator.audioSession) { try { navigator.audioSession.type = 'playback'; } catch { /* ignore */ } }
  }
  showMeter(-120);
}

// Strums can't be closer than a sixteenth note, so ignore re-triggers within ~40% of one.
function tuneDetector() {
  if (!mic) return;
  const bpm = calibrating ? CALIB_BPM : state.bpm;
  mic.node.port.postMessage({ refractory: clamp(0.4 * (15 / bpm), 0.035, 0.08) });
}

function onMicMessage(d) {
  if (d.type === 'level') showMeter(d.db);
  else if (d.type === 'onset') {
    flashMeter();
    if (calibrating) calibOnsets.push({ raw: d.t, flux: d.flux });
    else if (score) scoreOnset(d.t, d.flux);
  }
}

// Times (audio clock, as scheduled) of the notes to play in [a, b); with `what` = 'sounds',
// of every sound the app plays there (clicks and guide notes) instead.
function notesBetween(a, b, what = 'notes', kinds = PLAY_KINDS) {
  const out = [];
  history.forEach((tl, i) => {
    if (!kinds.includes(tl.kind) || !tl[what]) return;
    const lo = Math.max(a, tl.start);
    const hi = Math.min(b, history[i + 1] ? history[i + 1].start : Infinity);
    if (lo >= hi) return;
    const loopSec = tl.beats * tl.beatSec;
    const first = tl.once ? 0 : Math.floor((lo - tl.t0) / loopSec);
    const last = tl.once ? 0 : Math.floor((hi - tl.t0) / loopSec);
    for (let L = first; L <= last; L++) {
      for (const p of tl[what]) {
        const t = tl.t0 + (L * tl.beats + p) * tl.beatSec;
        if (t >= lo && t < hi) out.push(t);
      }
    }
  });
  return out.sort((x, y) => x - y);
}

function timelineAt(t) {
  let found = null;
  for (const tl of history) if (tl.start <= t) found = tl;
  return found;
}

const noteKey = (t) => Math.round(t * 1000);

function beginScoring() {
  score = {
    matched: new Map(), recent: [], offsets: [], total: 0, count: 0,
    sweep: ctx.currentTime - micLatency(),
    countIn: [],        // onsets heard during the count-in (the player isn't playing yet)
    bleed: undefined,   // { delay, flux } if the microphone hears the app's own clicks; null if not
    log: [],            // recent onsets and what they were taken for (diagnostics)
  };
  lastScore = score;
  renderDiag();
  tuneDetector();
  el.pPct.innerHTML = '–';
  el.pPct.className = 'score-pct';
  el.pSession.textContent = '';
  el.pHint.hidden = true;
  showScoreMessage(state.micLatency == null ? 'Listening… (calibrate for exact timing)' : 'Listening…');
}

function scoreOnset(raw, flux = 0) {
  // Count-in: nothing to score, but onsets here tell whether the mic hears the clicks.
  const rawTl = timelineAt(raw - 0.02);
  if (rawTl && rawTl.kind === 'countin' && score.bleed === undefined) { score.countIn.push({ raw, flux }); return; }
  if (score.bleed === undefined) checkBleed();

  const t = raw - micLatency(); // when the strum happened, on the clock the clicks were scheduled on
  const tl = timelineAt(t);
  if (!tl || !PLAY_KINDS.includes(tl.kind)) return;

  // A click (or guide note) that leaked into the microphone: arrives a fixed delay after the
  // sound was played and is no louder than the leaks heard in the count-in.
  if (score.bleed) {
    const d = score.bleed.delay;
    const leak = notesBetween(raw - d - 0.008, raw - d + 0.008, 'sounds', [...PLAY_KINDS, 'countin']);
    if (leak.length && isLeak(score.bleed, raw, flux, leak[0])) return logOnset('click', raw - d - leak[0], flux);
  }

  const near = notesBetween(t - 0.5, t + 0.5);
  let best = -1;
  near.forEach((n, i) => { if (best < 0 || Math.abs(t - n) < Math.abs(t - near[best])) best = i; });
  if (best < 0) { logOnset('extra', null, flux); return addResult({ kind: 'extra' }); }
  const n = near[best];
  const e = t - n;
  const gap = Math.min(best > 0 ? n - near[best - 1] : Infinity, best + 1 < near.length ? near[best + 1] - n : Infinity);
  const key = noteKey(n);
  const { perfect, zero } = TOLERANCES[state.practiceTolerance];
  if (Math.abs(e) > Math.min(Math.max(MATCH_MAX, zero), gap / 2)) { logOnset('extra', e, flux); return addResult({ kind: 'extra' }); }
  const s = clamp(1 - (Math.abs(e) - perfect) / (zero - perfect), 0, 1);
  const pos = (n - tl.t0) / tl.beatSec;
  const onClick = Math.abs(pos - Math.round(pos)) < 1e-3; // on a beat, where the click plays
  const prev = score.matched.get(key);
  if (prev) {
    if (Math.abs(raw - prev.raw) < DOUBLE_GAP) {
      // Two onsets for one note: keep the first unless the second is clearly stronger.
      if (takesOver(prev, raw, flux)) {
        Object.assign(prev, { raw, flux });
        logOnset('hit', e, flux, onClick);
        return addResult({ kind: 'hit', e, s, onClick }, prev.result);
      }
      return logOnset('double', e, flux, onClick);
    }
    logOnset('extra', e, flux);
    return addResult({ kind: 'extra' });
  }
  const m = { n, raw, flux, result: null };
  score.matched.set(key, m);
  logOnset('hit', e, flux, onClick);
  m.result = addResult({ kind: 'hit', e, s, onClick });
}

// After the count-in: if (nearly) every count-in click produced an onset with the same,
// machine-exact delay, the microphone is hearing the clicks. People strumming along
// would never be that consistent, so this doesn't mistake early strums for leaks.
function checkBleed() {
  score.bleed = findBleed(history.find((x) => x.kind === 'countin'), score.countIn);
  el.pHint.hidden = !score.bleed;
  renderDiag();
}

// The mic hears the click if (nearly) every count-in click produced an onset after the
// same, machine-exact delay. Returns { delay, flux } of those leaks, or null.
function findBleed(tl, onsets) {
  if (!tl) return null;
  const hits = [];
  for (let k = 0; k < tl.beats; k++) {
    const click = tl.t0 + k * tl.beatSec;
    const c = onsets.filter((o) => o.raw - click > -0.02 && o.raw - click < 0.4);
    if (c.length) hits.push({ delay: c[0].raw - click, flux: c[0].flux });
  }
  if (hits.length < Math.min(3, tl.beats)) return null;
  const ds = hits.map((h) => h.delay).sort((a, b) => a - b);
  if (ds[ds.length - 1] - ds[0] > 0.006) return null;
  const fl = hits.map((h) => h.flux).sort((a, b) => a - b);
  return { delay: ds[ds.length >> 1], flux: fl[fl.length >> 1] };
}

// A leaked click: a fixed delay after a sound the app played, and no louder than the leaks.
const isLeak = (bleed, raw, flux, soundAt) =>
  !!bleed && Math.abs(raw - soundAt - bleed.delay) <= 0.008 && flux < 1.8 * bleed.flux;

// Which onset stands for one strum: the first, unless a clearly stronger one follows within
// 60 ms (the same strum detected twice, or a faint leaked click just before it). Practice
// scoring and calibration both use this rule, so they measure the strum the same way.
const DOUBLE_GAP = 0.06;
const takesOver = (prev, raw, flux) => Math.abs(raw - prev.raw) < DOUBLE_GAP && flux > 1.5 * prev.flux;

// Notes whose time has safely passed without a strum count as missed.
function sweepMisses(now) {
  if (score.bleed === undefined) {
    const first = history.find((x) => PLAY_KINDS.includes(x.kind));
    if (first && now > first.start + 0.15) checkBleed();
  }
  const to = now - micLatency() - 0.25;
  if (to <= score.sweep) return;
  if (to - score.sweep > 1) { score.sweep = to; return; } // the page was paused (e.g. in the background)
  for (const n of notesBetween(score.sweep, to)) {
    if (!score.matched.has(noteKey(n))) { logOnset('miss', null, null); addResult({ kind: 'miss' }); }
  }
  score.sweep = to;
  for (const [k, m] of score.matched) if (m.n < to - 2) score.matched.delete(k);
}

const grade = (p) => (p >= 85 ? 'good' : p >= 60 ? 'ok' : 'poor');

// Records a result (or, with `replace`, corrects an earlier one) and updates the display.
function addResult(r, replace = null) {
  r.s = r.kind === 'hit' ? r.s : 0;
  if (replace) {
    score.total += r.s - replace.s;
    Object.assign(replace, r);
  } else {
    score.recent.push(r);
    if (score.recent.length > SCORE_WINDOW) score.recent.shift();
    score.total += r.s;
    score.count++;
  }
  const hits = score.recent.filter((x) => x.kind === 'hit');
  score.offsets = hits.map((x) => x.e);

  const pct = Math.round((100 * score.recent.reduce((a, x) => a + x.s, 0)) / score.recent.length);
  el.pPct.innerHTML = `${pct}<small>%</small>`;
  el.pPct.className = `score-pct ${grade(pct)}`;

  if (r.kind === 'hit') {
    const ms = Math.round(r.e * 1000);
    showScoreMessage(Math.abs(ms) <= 12 ? 'Spot on' : `${Math.abs(ms)} ms ${ms < 0 ? 'early' : 'late'}`);
    const dot = document.createElement('span');
    dot.className = `hit ${grade(r.s * 100)}`;
    dot.style.left = `${50 + clamp(r.e / TOLERANCES[state.practiceTolerance].zero, -1, 1) * 46}%`;
    dot.addEventListener('animationend', () => dot.remove());
    el.pScale.append(dot);
    const dots = el.pScale.querySelectorAll('.hit');
    if (dots.length > 24) dots[0].remove();
  } else {
    showScoreMessage(r.kind === 'miss' ? 'Missed a note' : 'Extra strum');
  }

  // Average offset of recent hits, separately on the clicks and between them: shows whether
  // being late is everywhere (then recalibrate) or only on the notes you count yourself.
  const avg = (on) => {
    const es = hits.filter((x) => x.onClick === on).map((x) => x.e);
    if (!es.length) return '';
    const ms = Math.round((1000 * es.reduce((a, x) => a + x, 0)) / es.length);
    return `${on ? 'On clicks' : 'between'} ${ms > 0 ? '+' : ms < 0 ? '−' : '±'}${Math.abs(ms)} ms`;
  };
  const split = [avg(true), avg(false)].filter(Boolean).join(' · ');
  el.pSession.textContent = `Session ${Math.round((100 * score.total) / score.count)}% · ${score.count} notes` +
    (split ? `\n${split[0].toUpperCase()}${split.slice(1)}` : '');
  return replace || r;
}

// Diagnostics (tap the Timing card): what each recent onset was taken for.
function logOnset(kind, e, flux, onClick = null) {
  score.log.push({ kind, ms: e == null ? null : Math.round(e * 1000), flux, onClick });
  if (score.log.length > 10) score.log.shift();
  renderDiag();
}

function renderDiag() {
  el.pDiagToggle.textContent = el.pDiag.hidden ? 'Details ▾' : 'Details ▴';
  if (el.pDiag.hidden) return;
  const sc = score || lastScore;
  if (!sc) {
    el.pDiag.textContent = 'Nothing heard yet. Press Start and strum along: this list then shows ' +
      'each sound the microphone picks up and how it was counted.';
    return;
  }
  const b = sc.bleed;
  const head = `mic delay ${Math.round(micLatency() * 1000)} ms${state.micLatency == null ? ' (guess)' : ''} · ` +
    (b === undefined ? 'checking the count-in…' : b ? `hears the click (${Math.round(b.delay * 1000)} ms), filtered out` : 'click not heard');
  el.pDiag.textContent = [head, ...sc.log.slice().reverse().map((x) =>
    `${x.kind.padEnd(6)} ${x.ms == null ? '' : `${x.ms > 0 ? '+' : ''}${x.ms} ms`.padEnd(8)}` +
    `${x.onClick == null ? '' : x.onClick ? '  click  ' : '  between'}${x.flux != null ? `  ·  ${x.flux.toFixed(2)}` : ''}`)].join('\n');
}

function showScoreMessage(text) {
  if (el.pScoreMsg.textContent !== text) el.pScoreMsg.textContent = text;
}

let meterWidth = '';
function showMeter(db) {
  const w = `${Math.round(clamp((db + 70) / 60, 0, 1) * 100)}%`;
  if (w !== meterWidth) { meterWidth = w; el.pMeter.firstElementChild.style.width = w; }
}
let meterTimer = 0;
function flashMeter() {
  el.pMeter.classList.add('hit');
  clearTimeout(meterTimer);
  meterTimer = setTimeout(() => el.pMeter.classList.remove('hit'), 120);
}

function micFailed(err) {
  console.warn('microphone:', err);
  const name = err && err.name;
  showScoreMessage(
    name === 'NotAllowedError' ? 'Microphone access was denied. Allow it for this app (Settings), then try again.'
      : name === 'Unsupported' ? 'This browser can’t listen to the microphone.'
        : name === 'NotFoundError' ? 'No microphone found.'
          : `Couldn’t open the microphone (${name || err}).`);
}

// Turning Listen on (or coming back to Practice) while already playing.
async function startListening() {
  try {
    await ensureAudio();
    await openMic();
  } catch (err) {
    micFailed(err);
    return;
  }
  if (!playing || !isPlayAlong() || !state.practiceListen) { if (!calibrating) closeMic(); return; }
  if (!score && !calibrating) beginScoring();
}

function calibrate() {
  if (playing) stop();
  calibrating = true;
  calibOnsets = [];
  start();
}

function showCalibration(count, countIn) {
  const key = `cal${countIn ? 'c' : ''}${count}`;
  if (shown.key === key) return;
  shown.key = key;
  el.pRep.textContent = 'CALIBRATING';
  el.pRep.classList.remove('last');
  el.pNextCard.classList.remove('upnext');
  shown.last = false;
  const text = countIn ? 'Get ready. After the count, strum once on every click.' : `Strum on every click · ${count} of ${CALIB_BEATS}`;
  el.pNow.innerHTML = `<div class="pcount">${count}</div><div class="psub">${text}</div>`;
  if (state.mode === 'scroll') showScoreMessage(countIn ? `Calibrating · count-in ${count} · get ready` : `Calibrating · ${text}`);
}

// Delay = median time from each click to the strum heard for it. Leaked clicks (found in the
// count-in, when nobody strums yet) are ignored, and doubles are resolved as in scoring.
function finishCalibration(tl) {
  const bleed = findBleed(history.find((x) => x.kind === 'countin'), calibOnsets);
  const offsets = [];
  for (let k = 0; k < CALIB_BEATS; k++) {
    const click = tl.t0 + k * tl.beatSec;
    let pick = null;
    for (const o of calibOnsets) {
      const d = o.raw - click;
      if (d <= -0.1 || d >= 0.5 || isLeak(bleed, o.raw, o.flux, click)) continue;
      if (!pick) pick = o;
      else if (takesOver(pick, o.raw, o.flux)) pick = o;
    }
    if (pick) offsets.push(pick.raw - click);
  }
  offsets.sort((a, b) => a - b);
  const median = offsets[offsets.length >> 1];
  const spread = offsets.map((x) => Math.abs(x - median)).sort((a, b) => a - b)[offsets.length >> 1];
  stop();
  if (offsets.length < 5) {
    showScoreMessage(`Heard ${offsets.length} of ${CALIB_BEATS} strums. Strum louder or hold the phone closer, then try again.`);
  } else if (spread > 0.035) {
    showScoreMessage('Those strums were too uneven to measure. Try again, right on each click.');
  } else {
    state.micLatency = Math.round(median * 1000);
    save();
    updateListenUI();
    showScoreMessage(`Calibrated: the mic delay is ${state.micLatency} ms. Press Start and strum along.`);
  }
}

function updateListenUI() {
  el.pScoreCard.hidden = !state.practiceListen;
  el.pCalibRow.hidden = !state.practiceListen;
  el.pTolRow.hidden = !state.practiceListen;
  el.pDelay.textContent = state.micLatency != null ? `${state.micLatency} ms` : 'not calibrated';
}

/* ---------- Wire up ---------- */

el.slider.addEventListener('input', () => setBpm(Number(el.slider.value)));
holdRepeat(el.minus, (s) => setBpm(state.bpm - s));
holdRepeat(el.plus, (s) => setBpm(state.bpm + s));
holdRepeat(el.rMinus, (s) => setBpm(state.bpm - s));
holdRepeat(el.rPlus, (s) => setBpm(state.bpm + s));
holdRepeat(el.pMinus, (s) => setBpm(state.bpm - s));
holdRepeat(el.pPlus, (s) => setBpm(state.bpm + s));
holdRepeat(el.sMinus, (s) => setBpm(state.bpm - s));
holdRepeat(el.sPlus, (s) => setBpm(state.bpm + s));
holdRepeat(el.beatsMinus, () => setBeats(state.beats - 1));
holdRepeat(el.beatsPlus, () => setBeats(state.beats + 1));

el.plays.forEach((b) => b.addEventListener('click', () => (playing ? stop() : start())));
el.tap.addEventListener('pointerdown', (e) => { e.preventDefault(); tap(); });

el.beats.addEventListener('click', (e) => {
  const dot = e.target.closest('.dot');
  if (!dot) return;
  const i = Number(dot.dataset.index);
  const next = { [ACCENT]: NORMAL, [NORMAL]: MUTE, [MUTE]: ACCENT }[state.accents[i]];
  state.accents[i] = next;
  dot.dataset.level = next;
  dot.setAttribute('aria-label', `Beat ${i + 1}: ${LEVEL_NAMES[next]}`);
  save();
  patternChanged();
});

// Drag up/down on a tempo display to change tempo.
for (const area of $$('.js-drag')) {
  let drag = null;
  area.addEventListener('pointerdown', (e) => {
    drag = { y: e.clientY, bpm: state.bpm, id: e.pointerId };
    area.setPointerCapture(e.pointerId);
  });
  area.addEventListener('pointermove', (e) => {
    if (drag && e.pointerId === drag.id) setBpm(drag.bpm + (drag.y - e.clientY) / 6);
  });
  ['pointerup', 'pointercancel'].forEach((ev) => area.addEventListener(ev, () => { drag = null; }));
}

// The Practice tab has two views (Now & Next, and Scroll); it opens the one used last.
segmented(el.tabs, [
  { value: 'metronome', html: 'Metronome' }, { value: 'rhythm', html: 'Rhythms' }, { value: 'practice', html: 'Practice' },
], isPlayAlong() ? 'practice' : state.mode, (v) => setMode(v === 'practice' ? state.practiceStyle : v));

// The view switch, the Timing card and the listening options are shared by both views:
// they move into whichever is showing.
function placePracticeShared() {
  if (!isPlayAlong()) return;
  const scroll = state.mode === 'scroll';
  const opts = (scroll ? el.scrollView : el.practiceView).querySelector('.options');
  opts.prepend(el.styleRow);
  opts.append(el.listenRows);
  if (scroll) el.sStrip.after(el.pScoreCard);
  else el.pNowCard.after(el.pScoreCard);
  segmented(el.pStyle, [{ value: 'practice', html: 'Now &amp; Next' }, { value: 'scroll', html: 'Scroll' }],
    state.mode, (v) => { if (v !== state.mode) setMode(v); });
}
placePracticeShared();

// Scroll options. Meter or level changes start a fresh sequence (on the next beat if playing).
const scrollOptionChanged = () => {
  save();
  updateMediaSession();
  if (playing && state.mode === 'scroll') patternChanged(true);
  else if (!playing) { resetScroll(); showScrollIdle(); }
};
segmented(el.sMeter, METERS.map((n) => ({ value: n, html: `${n}/4`, title: `${n}/4 time` })),
  state.scrollMeter, (v) => { state.scrollMeter = v; scrollOptionChanged(); });
segmented(el.sLevel, Object.entries(LEVELS).map(([value, html]) => ({ value, html })),
  state.scrollLevel, (v) => { state.scrollLevel = v; scrollOptionChanged(); });
el.sNotesOnly.checked = !state.scrollLabels;
el.sNotesOnly.addEventListener('change', () => {
  state.scrollLabels = !el.sNotesOnly.checked;
  save();
  strip.key = null;
  if (!playing) showScrollIdle(); // while playing, the next frame redraws the strip
});
el.sGuide.setAttribute('aria-pressed', String(state.scrollGuide));
el.sGuide.addEventListener('click', () => {
  state.scrollGuide = !state.scrollGuide;
  el.sGuide.setAttribute('aria-pressed', String(state.scrollGuide));
  save();
  if (state.mode === 'scroll') patternChanged(); // same sequence, same position
});

// Practice options. Changing reps or level starts a fresh sequence (on the next beat if playing).
const practiceOptionChanged = () => {
  save();
  if (playing && state.mode === 'practice') patternChanged(true);
  else if (!playing) { resetPractice(); showPracticeIdle(); }
};
segmented(el.pReps, REPS.map((n) => ({ value: n, html: `${n}×`, title: `${n} time${n > 1 ? 's' : ''}` })),
  state.practiceReps, (v) => { state.practiceReps = v; practiceOptionChanged(); });
segmented(el.pLevel, Object.entries(LEVELS).map(([value, html]) => ({ value, html })),
  state.practiceLevel, (v) => { state.practiceLevel = v; updateMediaSession(); practiceOptionChanged(); });

// The full-marks band on the early/late scale is the same fraction of it at every tolerance.
segmented(el.pTolerance, Object.entries(TOLERANCES).map(([value, t]) => ({
  value, html: t.label, title: `${t.label}: full marks within ${t.perfect * 1000} ms, none from ${t.zero * 1000} ms`,
})), state.practiceTolerance, (v) => { state.practiceTolerance = v; save(); });

const listenHint = () => showScoreMessage(state.micLatency == null
  ? 'Tip: tap Calibrate once so timing is measured exactly.' : 'Press Start and strum along.');
el.pListen.checked = state.practiceListen;
el.pListen.addEventListener('change', () => {
  state.practiceListen = el.pListen.checked;
  save();
  updateListenUI();
  if (calibrating) stop();
  else if (state.practiceListen && playing && isPlayAlong()) startListening();
  else if (!state.practiceListen) closeMic();
  if (state.practiceListen && !playing) listenHint();
});
el.pCalib.addEventListener('click', calibrate);
el.pScoreCard.addEventListener('click', () => { el.pDiag.hidden = !el.pDiag.hidden; renderDiag(); });
updateListenUI();
if (state.practiceListen) listenHint();

el.guideToggle.setAttribute('aria-pressed', String(state.practiceGuide));
el.guideToggle.addEventListener('click', () => {
  state.practiceGuide = !state.practiceGuide;
  el.guideToggle.setAttribute('aria-pressed', String(state.practiceGuide));
  save();
  if (state.mode === 'practice') patternChanged(); // same sequence, same position
});
segmented(el.subdivision, SUBDIVISIONS, state.subdivision, (v) => {
  state.subdivision = v;
  save();
  if (state.mode === 'metronome') patternChanged();
});
segmented(el.sound, Object.entries(SOUNDS).map(([value, html]) => ({ value, html })), state.sound, (v) => {
  state.sound = v;
  save();
  if (playing) patternChanged(); else preview();
});

el.clickToggle.setAttribute('aria-pressed', String(state.rhythmClick));
el.clickToggle.addEventListener('click', () => {
  state.rhythmClick = !state.rhythmClick;
  el.clickToggle.setAttribute('aria-pressed', String(state.rhythmClick));
  save();
  if (state.mode === 'rhythm') patternChanged();
});

el.volume.value = Math.round(state.volume * 100);
setFill(el.volume);
el.volume.addEventListener('input', () => {
  state.volume = Number(el.volume.value) / 100;
  setFill(el.volume);
  if (master) master.gain.setTargetAtTime(volumeToGain(state.volume), ctx.currentTime, 0.015);
  save();
});

// Keyboard shortcuts (handy on a Mac): space = start/stop, arrows = tempo.
document.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  if (e.code === 'Space') { e.preventDefault(); playing ? stop() : start(); }
  else if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); setBpm(state.bpm + (e.shiftKey ? 5 : 1)); }
  else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); setBpm(state.bpm - (e.shiftKey ? 5 : 1)); }
  else if (e.key === 't' && state.mode === 'metronome') tap();
});

renderGrid();
renderNow();
setBpm(state.bpm);
resetPractice();
resetScroll();
setBeats(state.beats);
setMode(state.mode);
updatePlayButtons();

/* ---------- Offline support ---------- */

// A new version is downloaded in the background. Once it has taken over, reload so it's
// used straight away, but never in the middle of playing: then it waits for Stop.
let updateReady = false;
function applyUpdate() {
  if (updateReady && !playing) location.reload();
}

// Ask the service worker that served this page which version it is.
function showVersion() {
  const sw = navigator.serviceWorker && navigator.serviceWorker.controller;
  if (!sw) { el.version.textContent = ''; return; }
  const ch = new MessageChannel();
  ch.port1.onmessage = (e) => { el.version.textContent = `Version ${e.data}`; };
  sw.postMessage('version', [ch.port2]);
}

if ('serviceWorker' in navigator && window.isSecureContext) {
  const sw = navigator.serviceWorker;
  const hadController = !!sw.controller;
  sw.register('sw.js').then((reg) => {
    // iOS keeps the app alive in the background, so also check for updates when it comes back.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) reg.update().catch(() => {});
    });
  }).catch(() => {});
  sw.addEventListener('controllerchange', () => {
    if (!hadController) { showVersion(); return; } // first install: this page is already the latest
    updateReady = true;
    applyUpdate();
  });
  showVersion();
}
