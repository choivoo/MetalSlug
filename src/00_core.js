'use strict';
// ───────── 기본 화면: 480×270 도트 버퍼를 정수 배(기본 4배 = 1920×1080)로 확대 ─────────
const W = 480, H = 270, GY = 226;
const QS = new URLSearchParams(location.search);
const TEST = QS.has('test');
const cv = document.getElementById('game'), out = cv.getContext('2d');
const buf = document.createElement('canvas'); buf.width = W; buf.height = H;
const g = buf.getContext('2d');
let K = 4;
const textCache = new Map();
function fit() {
  const dpr = window.devicePixelRatio || 1;
  const vw = innerWidth * dpr, vh = innerHeight * dpr;
  K = Math.max(1, Math.floor(Math.min(vw / W, vh / H) + 1e-3));
  if (QS.has('k')) K = Math.max(1, +QS.get('k') | 0);
  cv.width = W * K; cv.height = H * K;
  cv.style.width = (W * K / dpr) + 'px'; cv.style.height = (H * K / dpr) + 'px';
  out.imageSmoothingEnabled = false; textCache.clear();
  document.body.classList.toggle('portrait', innerHeight > innerWidth);
}
addEventListener('resize', fit); addEventListener('orientationchange', () => setTimeout(fit, 200));

// ───────── 난수(시드 고정: 자동 플레이가 매번 같은 결과) ─────────
let seed = 20261111;
function rnd() { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
const rr = (a, b) => a + rnd() * (b - a), ri = (a, b) => a + Math.floor(rnd() * (b - a + 1)), pick = a => a[Math.floor(rnd() * a.length)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, sgn = v => v < 0 ? -1 : 1;

// ───────── 도트 찍기 도구 ─────────
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const bay = (x, y) => (BAYER[(y & 3) * 4 + (x & 3)] + .5) / 16;
function P(c) {
  const x = c.getContext('2d');
  const o = {
    c, x,
    p(px, py, col) { x.fillStyle = col; x.fillRect(Math.round(px), Math.round(py), 1, 1); },
    r(px, py, w, h, col) { x.fillStyle = col; x.fillRect(Math.round(px), Math.round(py), Math.round(w), Math.round(h)); },
    ln(x0, y0, x1, y1, col, th = 1) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx - dy, h = th >> 1;
      x.fillStyle = col;
      for (; ;) { x.fillRect(x0 - h, y0 - h, th, th); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 > -dy) { e -= dy; x0 += sx; } if (e2 < dx) { e += dx; y0 += sy; } }
    },
    // 음영 타원: 왼쪽 위에서 빛, 디더링으로 단계 표현
    el(cx, cy, rx, ry, ramp, k = 1) {
      for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let xx = Math.floor(cx - rx); xx <= cx + rx; xx++) {
        const nx = (xx - cx) / rx, ny = (y - cy) / ry; if (nx * nx + ny * ny > 1) continue;
        if (typeof ramp === 'string') { o.p(xx, y, ramp); continue; }
        const v = clamp(.55 - (nx * .45 + ny * .65) * k, 0, .999);
        o.p(xx, y, ramp[clamp(Math.floor(v * ramp.length + bay(xx, y) - .5), 0, ramp.length - 1)]);
      }
    },
    // 음영 판: 위가 밝고 아래가 어두움 + 테두리 하이라이트
    box(px, py, w, h, ramp, bevel = 1) {
      for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
        const v = clamp(.72 - y / h * .5, 0, .999);
        o.p(px + xx, py + y, ramp[clamp(Math.floor(v * ramp.length + bay(px + xx, py + y) - .5), 0, ramp.length - 1)]);
      }
      if (bevel) { o.r(px, py, w, 1, ramp[ramp.length - 1]); o.r(px, py, 1, h, ramp[ramp.length - 2]); o.r(px, py + h - 1, w, 1, ramp[0]); o.r(px + w - 1, py, 1, h, ramp[0]); }
    },
    riv(px, py, n, dx, dy, col) { for (let i = 0; i < n; i++) o.p(px + i * dx, py + i * dy, col); },
    art(rows, pal, ox = 0, oy = 0) { rows.forEach((row, y) => { for (let i = 0; i < row.length; i++) { const ch = row[i]; if (ch !== '.' && pal[ch]) o.p(ox + i, oy + y, pal[ch]); } }); },
  };
  return o;
}
function outline(c, col) {
  const x = c.getContext('2d'), w = c.width, h = c.height, im = x.getImageData(0, 0, w, h), d = im.data, a = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3] > 0 ? 1 : 0;
  const n = parseInt(col.slice(1), 16);
  for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
    const i = y * w + xx; if (a[i]) continue;
    if ((xx > 0 && a[i - 1]) || (xx < w - 1 && a[i + 1]) || (y > 0 && a[i - w]) || (y < h - 1 && a[i + w])) { d[i * 4] = n >> 16 & 255; d[i * 4 + 1] = n >> 8 & 255; d[i * 4 + 2] = n & 255; d[i * 4 + 3] = 255; }
  }
  x.putImageData(im, 0, 0); return c;
}
function rot(c, ang, cx, cy) {
  const w = c.width, h = c.height, s = c.getContext('2d').getImageData(0, 0, w, h).data, o = mk(w, h), ox = o.getContext('2d'), im = ox.createImageData(w, h), d = im.data;
  const cs = Math.cos(ang), sn = Math.sin(ang); if (cx === undefined) { cx = w / 2; cy = h / 2; }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = x - cx, dy = y - cy, sx = Math.round(cx + dx * cs + dy * sn), sy = Math.round(cy - dx * sn + dy * cs);
    if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue;
    const a = (sy * w + sx) * 4, b = (y * w + x) * 4; d[b] = s[a]; d[b + 1] = s[a + 1]; d[b + 2] = s[a + 2]; d[b + 3] = s[a + 3];
  }
  ox.putImageData(im, 0, 0); return o;
}
function squash(c, base, ky, kx) { // 납작하게 눌린 프레임
  const w = c.width, h = c.height, o = mk(w, h), x = o.getContext('2d'); x.imageSmoothingEnabled = false;
  const nh = Math.round(base * ky), nw = Math.round(w * kx);
  x.drawImage(c, 0, 0, w, base, Math.round((w - nw) / 2), base - nh, nw, nh); return o;
}
const whiteMap = new Map();
function whiteOf(c) { // 피격 섬광용 흰 실루엣
  let o = whiteMap.get(c); if (o) return o;
  o = mk(c.width, c.height); const x = o.getContext('2d'); x.drawImage(c, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#fff'; x.fillRect(0, 0, o.width, o.height);
  whiteMap.set(c, o); return o;
}
// 화면에 스프라이트 그리기 (flip: 좌우 반전)
function spr(c, x, y, flip, white) {
  if (!c) return; if (white) c = whiteOf(c); x = Math.round(x); y = Math.round(y);
  if (flip) { g.save(); g.translate(x + c.width, y); g.scale(-1, 1); g.drawImage(c, 0, 0); g.restore(); } else g.drawImage(c, x, y);
}
function R(x, y, w, h, col) { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function L(x0, y0, x1, y1, col, th = 1) { // 화면에 직접 굵은 선(팔다리·포신)
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx - dy, h = th >> 1; g.fillStyle = col;
  for (; ;) { g.fillRect(x0 - h, y0 - h, th, th); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 > -dy) { e -= dy; x0 += sx; } if (e2 < dx) { e += dx; y0 += sy; } }
}
function limb(x0, y0, x1, y1, th, col, hi, ol = '#16101c') { L(x0, y0, x1, y1, ol, th + 2); L(x0, y0, x1, y1, col, th); if (hi) L(x0, y0 - (th >> 1), x1, y1 - (th >> 1), hi, 1); }

// ───────── 한글 도트 글자: 글꼴을 작게 찍은 뒤 흑백으로 잘라 정수 배 확대 ─────────
const FONT = '"Apple SD Gothic Neo","Malgun Gothic","Noto Sans CJK KR","Noto Sans KR","NanumGothic","WenQuanYi Zen Hei",sans-serif';
let texts = [];
const hex = c => { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
function T(s, x, y, o) { texts.push([String(s), x, y, o || {}]); }
function textSpr(s, o) {
  const size = o.s || 8, px = o.px || .5; const u = Math.max(1, Math.floor(K * px + 1e-6)); const fs = Math.max(7, Math.round(size * K / u));
  const key = s + '|' + fs + '|' + u + '|' + (o.c || '') + (o.c2 || '') + (o.oc || '');
  let e = textCache.get(key); if (e) return e;
  if (textCache.size > 500) textCache.clear();
  const t = mk(4, 4), tx = t.getContext('2d', { willReadFrequently: true }); tx.font = 'bold ' + fs + 'px ' + FONT;
  const w = Math.ceil(tx.measureText(s).width) + 4, h = Math.ceil(fs * 1.3) + 4; t.width = w; t.height = h;
  tx.font = 'bold ' + fs + 'px ' + FONT; tx.fillStyle = '#fff'; tx.textBaseline = 'alphabetic'; tx.fillText(s, 2, Math.round(fs * .98) + 2);
  const src = tx.getImageData(0, 0, w, h).data, m = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) m[i] = src[i * 4 + 3] > 120 ? 1 : 0;
  const im = tx.createImageData(w, h), d = im.data, c1 = hex(o.c || '#ffffff'), c2 = hex(o.c2 || o.c || '#ffffff'), oc = hex(o.oc || '#180e22'), mid = Math.round(fs * .58) + 2;
  const M = (x, y) => x >= 0 && y >= 0 && x < w && y < h && m[y * w + x];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4; let col = null;
    if (m[y * w + x]) col = y < mid ? c1 : c2;
    else if (M(x - 1, y) || M(x + 1, y) || M(x, y - 1) || M(x, y + 1) || M(x - 1, y - 1) || M(x + 1, y - 1) || M(x - 1, y + 1) || M(x + 1, y + 1) || M(x, y - 2) || M(x - 1, y - 2)) col = oc;
    if (col) { d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255; }
  }
  tx.clearRect(0, 0, w, h); tx.putImageData(im, 0, 0);
  e = { c: t, u }; textCache.set(key, e); return e;
}
function flushText() {
  for (const [s, x, y, o] of texts) { const e = textSpr(s, o), w = e.c.width * e.u; out.drawImage(e.c, Math.round(x * K - (o.a || 0) * w), Math.round(y * K), w, e.c.height * e.u); }
  texts.length = 0;
}

// ───────── 입력 ─────────
const inp = { l: 0, r: 0, u: 0, d: 0, fire: 0, jump: 0, gren: 0 }, prevInp = {}, edge = {};
let tap = null; // 화면 탭(게임 좌표) 또는 시작 키
const KEYMAP = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd', KeyA: 'l', KeyD: 'r', KeyW: 'u', KeyS: 'd', KeyZ: 'fire', KeyJ: 'fire', KeyX: 'jump', KeyK: 'jump', Space: 'jump', KeyC: 'gren', KeyL: 'gren' };
const kb = {};
addEventListener('keydown', e => { const k = KEYMAP[e.code]; if (k) { kb[k] = 1; e.preventDefault(); } if (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyZ') { if (!e.repeat) tap = { x: -1, y: -1, key: 1 }; } if (e.code === 'KeyP' && !e.repeat) tap = { x: -1, y: -1, auto: 1 }; auInit(); });
addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) kb[k] = 0; });
