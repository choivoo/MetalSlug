// ───────── 소리: 전부 WebAudio로 합성 (파일 없음) ─────────
const AU = { ctx: null, last: {} };
let MUS = null, musWant = null;
function auInit() {
  if (TEST) return;
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  try {
    const c = AU.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = c.createDynamicsCompressor(); comp.connect(c.destination);
    AU.sfx = c.createGain(); AU.sfx.gain.value = .5; AU.sfx.connect(comp);
    AU.mus = c.createGain(); AU.mus.gain.value = .26; AU.mus.connect(comp);
    const b = AU.nb = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    setInterval(musTick, 40);
    if (musWant) { const m = musWant; musWant = null; music(m); }
  } catch (e) { AU.ctx = null; }
}
function tone(type, f0, f1, dur, vol, delay = 0, dest) {
  const c = AU.ctx; if (!c) return; const t = c.currentTime + delay, o = c.createOscillator(), gn = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.001, t + dur);
  o.connect(gn); gn.connect(dest || AU.sfx); o.start(t); o.stop(t + dur + .02);
}
function noiz(dur, vol, f0, f1, delay = 0, type = 'lowpass', dest) {
  const c = AU.ctx; if (!c) return; const t = c.currentTime + delay, s = c.createBufferSource(), f = c.createBiquadFilter(), gn = c.createGain();
  s.buffer = AU.nb; s.loop = true; f.type = type; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
  gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.001, t + dur);
  s.connect(f); f.connect(gn); gn.connect(dest || AU.sfx); s.start(t, Math.random() * .5); s.stop(t + dur + .02);
}
const SFX = {
  shot() { tone('square', 900, 180, .08, .22); noiz(.05, .25, 5000, 800); },
  hmg() { tone('sawtooth', 520, 110, .07, .22); noiz(.06, .3, 3500, 500); },
  flame() { noiz(.16, .22, 900, 2600, 0, 'bandpass'); },
  rocket() { noiz(.35, .35, 400, 3000); tone('sawtooth', 160, 60, .3, .2); },
  vulcan() { tone('square', 300, 90, .06, .25); noiz(.05, .3, 2500, 400); },
  eshot() { tone('square', 480, 240, .1, .1); },
  jump() { tone('square', 260, 620, .12, .12); },
  land() { noiz(.06, .15, 500, 120); },
  throw() { tone('triangle', 500, 900, .12, .15); },
  hit() { tone('square', 200, 80, .05, .15); noiz(.03, .15, 3000, 1500); },
  clang() { tone('square', 1300, 900, .04, .1); tone('triangle', 2100, 1500, .05, .08); },
  boom() { noiz(.45, .7, 1800, 60); tone('sine', 130, 30, .4, .6); },
  bigboom() { noiz(.9, .9, 2600, 40); tone('sine', 100, 22, .8, .8); noiz(.3, .4, 6000, 800, .05); },
  megaboom() { noiz(2.2, 1, 3000, 30); tone('sine', 90, 18, 2, .9); for (let i = 0; i < 6; i++) noiz(.4, .5, 4000, 100, .2 + i * .22); },
  scream() { const f = 700 + Math.random() * 500; tone('sawtooth', f, f * 1.5, .1, .14); tone('sawtooth', f * 1.5, f * .35, .38, .14, .1); },
  pdie() { tone('square', 880, 990, .1, .2); tone('square', 990, 110, .7, .2, .1); },
  item() { [660, 880, 1320].forEach((f, i) => tone('square', f, f, .08, .16, i * .07)); },
  power() { [392, 523, 659, 784, 1047].forEach((f, i) => tone('square', f, f, .09, .18, i * .06)); tone('triangle', 1047, 2094, .3, .15, .3); },
  thanks() { [784, 988, 1175, 988, 1568].forEach((f, i) => tone('triangle', f, f * 1.02, .1, .22, i * .09)); },
  rope() { noiz(.08, .2, 2500, 6000, 0, 'highpass'); },
  coin() { tone('square', 988, 988, .08, .2); tone('square', 1319, 1319, .35, .2, .08); },
  tick() { tone('square', 1200, 1200, .03, .1); },
  crush() { tone('square', 140, 50, .12, .2); noiz(.1, .3, 800, 200); },
  step() { noiz(.07, .22, 300, 80); tone('sine', 80, 40, .08, .25); },
  board() { [330, 440, 554, 659, 880].forEach((f, i) => tone('sawtooth', f, f, .07, .15, i * .05)); },
  siren() { for (let i = 0; i < 4; i++) { tone('sawtooth', 440, 880, .28, .16, i * .56); tone('sawtooth', 880, 440, .28, .16, i * .56 + .28); } },
  charge() { tone('sawtooth', 120, 1600, 1.1, .16); tone('square', 60, 800, 1.1, .08); },
  laser() { tone('sawtooth', 1800, 1400, 1.2, .16); noiz(1.2, .25, 5000, 3000, 0, 'bandpass'); },
  slam() { noiz(.5, .9, 900, 40); tone('sine', 70, 25, .5, .9); },
  warn() { tone('square', 1100, 1100, .07, .14); tone('square', 1100, 1100, .07, .14, .12); },
  roar() { tone('sawtooth', 90, 45, 1.1, .4); tone('square', 136, 60, 1.1, .2); noiz(1, .3, 500, 150); },
  boing() { tone('sine', 300, 900, .12, .3); tone('sine', 900, 250, .3, .3, .12); },
  twinkle() { tone('triangle', 2600, 3200, .25, .2); tone('triangle', 3900, 4200, .3, .12, .1); },
  chopper() { noiz(.07, .16, 300, 120); },
  heli() { noiz(.05, .12, 500, 200); },
};
const SGAP = { shot: 50, hmg: 55, flame: 90, vulcan: 60, hit: 45, clang: 60, boom: 70, scream: 120, eshot: 60, chopper: 110, step: 150, tick: 30, crush: 90, warn: 250 };
function sfx(n) { if (!AU.ctx) return; const now = performance.now(); if (now - (AU.last[n] || 0) < (SGAP[n] || 30)) return; AU.last[n] = now; SFX[n](); }

// ───────── 칩튠 음악 ─────────
function midi(nm) { const m = /^([a-g])(#?)(\d)$/.exec(nm); return 12 * (+m[3] + 1) + { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[m[1]] + (m[2] ? 1 : 0); }
function bars(arr) {
  const o = [];
  for (const b of arr) { let n = 0; for (const tk of b.trim().split(/\s+/)) { let [nm, l] = tk.split(':'); l = +l || 2; if (n + l > 16) l = 16 - n; if (l <= 0) break; o.push([nm === '-' ? null : midi(nm), l]); n += l; } if (n < 16) o.push([null, 16 - n]); }
  return o;
}
function bassOf(ch, pat) { const o = []; for (const c of ch) { const r = midi(c[0]); for (const s of pat) o.push([r + s, 2]); } return o; }
function arpOf(ch) { const o = []; for (const c of ch) { const r = midi(c[0]) + 12, t = [0, c[1] ? 3 : 4, 7, 12]; for (const i of [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 2, 1, 2, 1]) o.push([r + t[i], 1]); } return o; }
const CH_ST = [['a2', 1], ['a2', 1], ['c3', 0], ['g2', 0], ['f2', 0], ['f2', 0], ['g2', 0], ['e2', 0], ['d3', 1], ['d3', 1], ['a2', 1], ['a2', 1], ['d3', 1], ['d3', 1], ['e2', 0], ['e2', 0]];
const CH_BS = [['e2', 1], ['e2', 1], ['f2', 0], ['f2', 0], ['e2', 1], ['e2', 1], ['g2', 0], ['b2', 0]];
const TRACKS = {
  stage: {
    bpm: 152, loop: 1, drums: 'k.h.s.h.k.k.s.hhk.h.s.h.k.k.s.ss',
    ch: [
      { w: 'square', v: .16, n: bars(['a4 a4 c5 e5:4 d5 c5 b4', 'c5:4 a4:4 - e4 a4 b4', 'c5 c5 e5 g5:4 f5 e5 d5', 'e5:6 d5 c5:4 b4:4', 'f5 f5 a5 c6:4 b5 a5 g5', 'a5:4 f5:4 - c5 f5 a5', 'g5 g5 b5 d6:4 c6 b5 g5', 'e5:4 g#5:4 b5:4 e6:4',
        'd5:4 f5 a5:4 g5 f5 e5', 'f5:6 e5 d5:8', 'c5:4 e5 a5:4 g5 e5 c5', 'e5:6 d5 c5:8', 'd5 e5 f5 g5 a5:4 d6:4', 'c6:4 a5:4 f5:4 d5:4', 'e5 e5 g#5 b5:4 g#5 b5 e6', 'e6:8 - e5 g#5 b5']) },
      { w: 'triangle', v: .34, n: bassOf(CH_ST, [0, 12, 0, 12, 0, 12, 7, 12]) },
      { w: 'square', v: .05, n: arpOf(CH_ST) },
    ],
  },
  boss: {
    bpm: 176, loop: 1, drums: 'k.hks.h.k.hks.shk.hks.hkk.kks.ss',
    ch: [
      { w: 'sawtooth', v: .13, n: bars(['e5 - e5 - e5 f5 e5 d5', 'e5 - e5 - e5 g5 f5 e5', 'f5 - f5 - f5 g5 f5 e5', 'f5 a5 c6:4 b5:4 a5:4', 'e5 - e5 - e5 f5 e5 d5', 'e5 b5 e6:4 d6 c6 b5 a5', 'g5 - g5 - b5 d6 b5 g5', 'f#5:4 a5:4 c6:4 d#6:4']) },
      { w: 'triangle', v: .36, n: bassOf(CH_BS, [0, 0, 12, 0, 0, 12, 0, 12]) },
      { w: 'square', v: .05, n: arpOf(CH_BS) },
    ],
  },
  title: {
    bpm: 132, loop: 1, drums: 'k...s...k.k.s...',
    ch: [
      { w: 'square', v: .14, n: bars(['e5:4 g5:4 a5:6 g5', 'e5:4 d5:4 e5:8', 'c5:4 e5:4 g5:6 e5', 'd5:4 b4:4 d5:8', 'e5:4 g5:4 a5:6 b5', 'c6:4 b5:4 a5:8', 'g5:4 a5:4 b5:6 g5', 'a5:12 -:4']) },
      { w: 'triangle', v: .32, n: bassOf([['a2', 1], ['a2', 1], ['c3', 0], ['g2', 0], ['a2', 1], ['f2', 0], ['g2', 0], ['a2', 1]], [0, 7, 12, 7, 0, 7, 12, 7]) },
    ],
  },
  clear: {
    bpm: 150, loop: 0, drums: 'k.k.s.k.k.k.s.ssk.k.s.k.s.s.ssssk...............',
    ch: [
      { w: 'square', v: .17, n: bars(['c5 c5 c5 e5:4 g5:4 e5', 'f5 f5 f5 a5:4 c6:4 a5', 'g5 g5 a5 b5 c6:8', 'c6:4 g5:4 c6:8']) },
      { w: 'triangle', v: .34, n: bassOf([['c3', 0], ['f2', 0], ['g2', 0], ['c3', 0]], [0, 12, 0, 12, 0, 12, 0, 12]) },
      { w: 'square', v: .07, n: bars(['e4 e4 e4 g4:4 c5:4 g4', 'a4 a4 a4 c5:4 f5:4 c5', 'b4 b4 c5 d5 e5:8', 'e5:4 c5:4 e5:8']) },
    ],
  },
  over: {
    bpm: 96, loop: 0, drums: 'k.......s.......',
    ch: [{ w: 'square', v: .15, n: bars(['a4:4 g4:4 f4:4 e4:4', 'd4:6 c4 d4:8']) }, { w: 'triangle', v: .3, n: bars(['a2:8 f2:8', 'd2:16']) }],
  },
};
function music(name) {
  if (MUS && MUS.name === name) return;
  if (!AU.ctx) { musWant = name; MUS = null; return; }
  if (MUS && MUS.g) { const og = MUS.g; og.gain.setTargetAtTime(0, AU.ctx.currentTime, .05); setTimeout(() => og.disconnect(), 400); }
  MUS = null; if (!name) return;
  const d = TRACKS[name], gn = AU.ctx.createGain(); gn.connect(AU.mus);
  MUS = { name, d, g: gn, t0: AU.ctx.currentTime + .06, ch: d.ch.map(() => ({ i: 0, t: 0 })), dr: { i: 0, end: 0 } };
}
function musTick() {
  const c = AU.ctx; if (!MUS || !c) return; const d = MUS.d, s16 = 60 / d.bpm / 4, hz = c.currentTime + .25, G_ = MUS.g;
  d.ch.forEach((ch, k) => {
    const st = MUS.ch[k];
    while (!st.end && MUS.t0 + st.t * s16 < hz) {
      const [m, l] = ch.n[st.i], t = MUS.t0 + st.t * s16;
      if (m != null) {
        const o = c.createOscillator(), gn = c.createGain(), du = l * s16; o.type = ch.w; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
        gn.gain.setValueAtTime(.0001, t); gn.gain.linearRampToValueAtTime(ch.v, t + .008); gn.gain.setValueAtTime(ch.v * .75, t + du * .5); gn.gain.linearRampToValueAtTime(.0001, t + du * .95);
        o.connect(gn); gn.connect(G_); o.start(t); o.stop(t + du);
      }
      st.t += l; if (++st.i >= ch.n.length) { if (d.loop) st.i = 0; else st.end = 1; }
    }
  });
  const dr = MUS.dr;
  while (!dr.end && MUS.t0 + dr.i * s16 < hz) {
    const ch = d.drums[dr.i % d.drums.length], dl = Math.max(0, MUS.t0 + dr.i * s16 - c.currentTime);
    if (ch === 'k') tone('sine', 160, 40, .12, .7, dl, G_); else if (ch === 's') { noiz(.11, .4, 3000, 1200, dl, 'bandpass', G_); tone('triangle', 220, 120, .06, .25, dl, G_); } else if (ch === 'h') noiz(.03, .16, 9000, 7000, dl, 'highpass', G_);
    dr.i++; if (!d.loop && dr.i >= d.drums.length) dr.end = 1;
  }
}
