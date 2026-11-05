// Strum (onset) detector. Runs on the audio thread and posts the audio-clock time of
// each new attack, so timing doesn't depend on the main thread.
//
// Method: "SuperFlux" spectral flux. Every 128 samples, take the spectrum of the last
// N samples, compress it (log), and sum how much each frequency band got louder than
// the loudest of its neighbouring bands a few hops earlier. A strum makes many bands
// jump at once, even while earlier strums are still ringing; the beating and wobble
// of ringing strings mostly don't. An onset is a local peak of that flux that stands
// out above its recent average, is loud enough above the background noise, and isn't
// too close to the previous onset.

const HOP = 128;

class OnsetDetector extends AudioWorkletProcessor {
  constructor() {
    super();
    const N = (this.N = 1024);
    this.lag = 3;                // compare with the spectrum this many hops ago
    this.buf = new Float32Array(N);
    this.win = new Float32Array(N);
    for (let i = 0; i < N; i++) this.win[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N);
    this.re = new Float32Array(N);
    this.im = new Float32Array(N);
    this.rev = new Uint16Array(N);
    for (let i = 0, j = 0; i < N; i++) {
      this.rev[i] = j;
      let bit = N >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j |= bit;
    }
    this.cos = new Float32Array(N / 2);
    this.sin = new Float32Array(N / 2);
    for (let i = 0; i < N / 2; i++) {
      this.cos[i] = Math.cos((2 * Math.PI * i) / N);
      this.sin[i] = -Math.sin((2 * Math.PI * i) / N);
    }
    this.lo = Math.max(2, Math.round((400 * N) / sampleRate));
    this.hi = Math.min(N / 2 - 2, Math.round((8000 * N) / sampleRate));
    this.spec = [];
    for (let i = 0; i <= this.lag; i++) this.spec.push(new Float32Array(N / 2));
    this.flux = [0, 0, 0];       // flux at t-2, t-1, t
    this.fluxHist = new Float32Array(this.histLen = 96);
    this.sorted = new Float32Array(this.histLen);
    this.fluxPos = 0;
    this.frames = 0;
    this.floor = -70;            // background level estimate (dB)
    this.dbPrev = -120;
    this.last = -1;              // time of the last onset
    this.lastFlux = 0;           // and its strength
    this.refractory = 0.06;      // s; set from the tempo by the page
    this.sensitivity = 1;        // >1 = more sensitive
    this.k = 1.5;                // threshold = k * recent average + c
    this.c = 0.02;
    this.meter = -120;
    this.meterBlocks = 0;
    this.port.onmessage = (e) => Object.assign(this, e.data);
  }

  fft() {
    const { re, im, cos, sin, N } = this;
    for (let size = 2; size <= N; size <<= 1) {
      const half = size >> 1, step = N / size;
      for (let i = 0; i < N; i += size) {
        for (let j = 0, k = 0; j < half; j++, k += step) {
          const a = i + j, b = a + half;
          const tr = re[b] * cos[k] - im[b] * sin[k];
          const ti = re[b] * sin[k] + im[b] * cos[k];
          re[b] = re[a] - tr; im[b] = im[a] - ti;
          re[a] += tr; im[a] += ti;
        }
      }
    }
  }

  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch || ch.length !== HOP) return true;
    const { buf, win, re, im, rev, N } = this;
    buf.copyWithin(0, HOP);
    buf.set(ch, N - HOP);

    for (let i = 0; i < N; i++) {
      re[rev[i]] = buf[i] * win[i];
      im[rev[i]] = 0;
    }
    let sum = 0;
    for (let i = N - HOP; i < N; i++) sum += buf[i] * buf[i];
    const db = 10 * Math.log10(sum / HOP + 1e-12);
    this.fft();

    // Newest spectrum first; compare with the one `lag` hops ago, max-filtered over ±1 bin.
    const cur = this.spec.pop();
    this.spec.unshift(cur);
    const old = this.spec[this.lag];
    const scale = 4 / N;
    for (let k = this.lo - 1; k <= this.hi + 1; k++) {
      cur[k] = Math.log1p(500 * Math.sqrt(re[k] * re[k] + im[k] * im[k]) * scale);
    }
    let flux = 0;
    for (let k = this.lo; k <= this.hi; k++) {
      const ref = Math.max(old[k - 1], old[k], old[k + 1]);
      const d = cur[k] - ref;
      if (d > 0) flux += d;
    }
    flux /= this.hi - this.lo + 1;
    this.flux.shift();
    this.flux.push(flux);

    // Peak-pick the previous frame: a local maximum well above the recent average.
    const [f0, f1, f2] = this.flux;
    this.sorted.set(this.fluxHist);
    this.sorted.sort();
    const med = this.sorted[this.sorted.length >> 1];
    const thr = (this.k * med + this.c) / this.sensitivity;
    const t = currentTime - HOP / sampleRate; // the previous frame's newest samples
    const level = Math.max(db, this.dbPrev);
    const loud = level > this.floor + 10 / this.sensitivity && level > -65;
    // Within the refractory time only a much stronger attack counts (a strum right after
    // a faint click that leaked into the microphone, not the tail of the same strum).
    if (++this.frames > N / HOP + this.lag + 2 &&
        f1 > thr && f1 >= f0 && f1 > f2 && loud && (t - this.last > this.refractory || f1 > 1.5 * this.lastFlux)) {
      this.last = t;
      this.lastFlux = f1;
      this.port.postMessage({ type: 'onset', t, flux: f1 });
    }
    this.fluxHist[this.fluxPos] = flux;
    this.fluxPos = (this.fluxPos + 1) % this.fluxHist.length;

    // Background level: follows quiet stretches quickly, loud ones very slowly.
    this.floor += (db - this.floor) * (db < this.floor ? 0.05 : 0.00005);
    this.dbPrev = db;

    if (db > this.meter) this.meter = db;
    if (++this.meterBlocks >= 24) {
      this.port.postMessage({ type: 'level', db: this.meter });
      this.meter = -120;
      this.meterBlocks = 0;
    }
    return true;
  }
}

registerProcessor('onset-detector', OnsetDetector);
