// ───────── 도트 그림 2: 사물, 기계, 보스, 배경 ─────────
const MT = ['#1c1626', '#3a3050', '#5a4e78', '#8478a4', '#b8b0d0'];
const RD = ['#3a0c18', '#7a1824', '#b83030', '#e85c40', '#ffa878'];
const WD = ['#3c2414', '#5c3c20', '#84582c', '#a87840', '#d0a060'];
const GN = ['#1c3020', '#2c5030', '#48783c', '#70a050', '#a8d070'];
const BK = ['#181418', '#2c242c', '#40363e', '#584c54', '#70646c'];
const GL = ['#205878', '#38a0c0', '#80e0f0', '#e0ffff'];
const TAN = ['#6a5838', '#948058', '#b8a878', '#d8cca0'];
const hazard = (p, x, y, w, h) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) p.p(x + i, y + j, ((i + j) >> 2) & 1 ? '#f8c820' : '#201828'); };
const emblem = (p, x, y) => { p.el(x, y, 6, 6, '#16101c'); p.el(x, y, 4.5, 4.5, '#f0f0e8'); p.r(x - 3, y - 1, 2, 2, '#16101c'); p.r(x + 1, y - 1, 2, 2, '#16101c'); p.r(x - 1, y + 2, 3, 2, '#f8c820'); p.p(x, y + 4, '#f8c820'); };

function initProps() {
  let c, p;
  c = mk(20, 18); p = P(c); p.box(1, 1, 18, 16, WD); p.r(1, 6, 18, 1, WD[0]); p.r(1, 11, 18, 1, WD[0]); p.ln(2, 15, 17, 2, WD[1]); p.r(1, 1, 2, 16, WD[1]); p.r(17, 1, 2, 16, WD[1]); p.riv(2, 3, 3, 0, 5, WD[4]); p.riv(17, 3, 3, 0, 5, WD[4]); SP.crate = outline(c, OL);
  c = mk(16, 20); p = P(c); for (let y = 0; y < 18; y++) for (let x = 0; x < 14; x++) { const nx = (x - 6.5) / 7; p.p(x + 1, y + 1, ['#5a1010', '#a02020', '#d83828', '#f87858'][clamp(Math.floor((.6 - nx * .5) * 4 + bay(x, y) - .5), 0, 3)]); } p.r(1, 5, 14, 1, '#5a1010'); p.r(1, 13, 14, 1, '#5a1010'); hazard(p, 1, 7, 14, 5); p.r(7, 8, 2, 2, '#f02828'); SP.barrel = outline(c, OL);
  c = mk(34, 20); p = P(c); for (let r = 0; r < 3; r++) for (let i = 0; i < 3 + (r > 0); i++) p.el(6 + i * 9 - (r > 0 ? 4 : -1) + (r === 2 ? 2 : 0), 4 + r * 6, 5, 3.4, TAN); SP.sandbag = outline(c, OL);
  c = mk(44, 102); p = P(c);
  for (const x of [7, 34]) p.box(x, 24, 3, 77, WD, 0);
  for (let y = 30; y < 96; y += 22) { p.ln(8, y, 35, y + 20, WD[1], 2); p.ln(35, y, 8, y + 20, WD[2], 2); p.r(6, y + 21, 32, 2, WD[3]); }
  p.box(1, 22, 42, 4, WD); p.box(2, 13, 2, 9, WD, 0); p.box(40, 13, 2, 9, WD, 0); p.r(2, 15, 40, 2, WD[2]); p.r(2, 19, 40, 1, WD[1]);
  for (let x = 0; x < 44; x++) p.r(x, 1 + Math.abs(x - 22) * .14, 1, 4, x % 4 < 2 ? MT[2] : MT[1]); p.box(4, 5, 2, 9, WD, 0); p.box(38, 5, 2, 9, WD, 0);
  SP.tower = outline(c, OL);
  c = mk(70, 52); p = P(c); p.box(4, 18, 62, 33, WD); for (let x = 9; x < 64; x += 6) p.r(x, 19, 1, 31, WD[1]);
  p.r(26, 28, 14, 23, '#16101c'); p.r(27, 29, 12, 22, WD[0]); p.box(46, 26, 12, 9, GL, 0); p.r(51, 26, 1, 9, WD[0]); p.r(46, 30, 12, 1, WD[0]);
  for (let x = 0; x < 70; x++) for (let y = 0; y < 18; y++) { if (y < 17 - x * .9 || y < x * .9 - 45) continue; p.p(x, y + 1, x % 5 < 2 ? MT[3] : y % 9 < 1 ? MT[1] : MT[2]); }
  emblem(p, 14, 32); SP.hut = outline(c, OL);
  c = mk(34, 22); p = P(c); p.el(17, 16, 15, 13, MT); p.x.clearRect(0, 17, 34, 6); p.box(2, 14, 30, 4, MT); hazard(p, 3, 15, 28, 2); p.r(8, 8, 10, 3, '#0c0810'); SP.turret = outline(c, OL);
  SP.tank = [0, 1].map(k => {
    const c = mk(64, 40), p = P(c);
    p.box(8, 16, 46, 12, MT); for (let i = 0; i < 8; i++) p.r(1 + i, 23 - i, 8, i + 5, MT[2 + (i < 3)]); p.r(54, 18, 6, 9, MT[1]); p.r(56, 14, 2, 5, MT[2]); p.r(57, 12, 3, 2, BK[2]);
    p.el(30, 12, 14, 9, MT); p.x.clearRect(0, 16, 64, 1); p.box(16, 15, 28, 2, MT); p.r(34, 5, 6, 2, MT[4]); emblem(p, 40, 21); hazard(p, 12, 26, 38, 2);
    p.el(8, 33, 6, 5.5, BK[0]); p.el(54, 33, 6, 5.5, BK[0]); p.r(8, 28, 46, 11, BK[0]);
    for (let i = 0; i < 6; i++) { p.el(8 + i * 9.2, 33, 3.4, 3.4, MT.slice(1, 4)); p.p(8 + i * 9.2, 33, MT[0]); }
    for (let x = 3 + k * 2; x < 60; x += 4) { p.r(x, 28, 2, 1, BK[3]); p.r(x, 38, 2, 1, BK[3]); }
    return outline(c, OL);
  });
  c = mk(84, 40); p = P(c);
  for (let x = 44; x < 80; x++) p.r(x, 17 + (x - 44) * .05, 1, 5 - (x - 44) * .08, MT[2 + (x % 7 < 1 ? -1 : 0)]);
  p.box(72, 8, 5, 12, MT); p.el(76, 9, 4, 4, MT.slice(2)); p.el(30, 21, 21, 13, MT); p.el(15, 22, 10, 9, GL); p.r(14, 14, 1, 16, MT[1]); p.r(6, 22, 18, 1, MT[1]);
  p.box(26, 7, 10, 4, MT); p.r(30, 3, 2, 5, MT[1]); emblem(p, 38, 21); hazard(p, 24, 30, 20, 2);
  p.ln(14, 36, 46, 36, MT[3], 2); p.ln(20, 32, 20, 36, MT[1]); p.ln(40, 32, 40, 36, MT[1]); p.r(27, 33, 8, 3, BK[1]);
  SP.heli = outline(c, OL);
  c = mk(32, 96); p = P(c); p.box(1, 1, 30, 94, MT); hazard(p, 2, 40, 28, 8); p.riv(4, 5, 10, 0, 9, MT[4]); p.riv(27, 5, 10, 0, 9, MT[4]); p.r(15, 2, 2, 92, MT[0]); emblem(p, 16, 22); p.box(0, 0, 32, 4, BK); SP.gate = outline(c, OL);
  // 탈것: 이족 보행기 '깡충이'
  c = mk(44, 32); p = P(c);
  p.box(3, 12, 6, 4, BK); p.box(1, 16, 5, 8, BK); p.el(21, 16, 16, 12, GN); p.el(28, 11, 9, 6.5, GL); p.r(21, 5, 1, 12, GN[0]); p.r(20, 11, 17, 1, GN[1]);
  hazard(p, 9, 24, 22, 2); p.r(9, 13, 7, 5, '#f0f0e8'); p.r(10, 14, 5, 3, '#d03030'); p.riv(8, 21, 6, 4, 0, GN[4]); p.box(15, 26, 14, 4, BK);
  SP.walker = outline(c, OL);
  c = mk(16, 8); p = P(c); p.box(1, 2, 14, 5, BK); p.r(11, 1, 4, 2, BK[3]); p.r(1, 6, 14, 1, '#f8c820'); SP.wfoot = outline(c, OL);
  // 파편 조각
  SP.plate = [[7, 5, RD], [10, 7, RD], [6, 6, MT], [12, 5, MT]].map(([w, h, rp]) => { const c = mk(w + 8, w + 8), p = P(c); p.box(4, 4 + (w - h) / 2, w, h, rp); return [...Array(8)].map((_, i) => outline(rot(c, i * PI / 4), OL)); });
  SP.plank = (() => { const c = mk(14, 14), p = P(c); p.box(2, 5, 10, 3, WD); return [...Array(8)].map((_, i) => outline(rot(c, i * PI / 4), OL)); })();
}

// ───────── 보스 '철왕게' ─────────
function mkHull(dmg) {
  const c = mk(216, 126), p = P(c), cx = 108, cy = 70, rp = dmg > 2 ? BK : RD, mt = dmg > 2 ? BK : MT;
  const sd = [...Array(40)].map(() => rnd());
  const holes = [[150, 40, 15], [60, 34, 11], [100, 86, 12], [182, 74, 12], [118, 26, 12], [36, 50, 9], [74, 70, 13], [140, 80, 10]].slice(0, dmg === 0 ? 0 : dmg === 1 ? 3 : 8);
  p.box(176, 10, 9, 30, mt); p.box(190, 18, 8, 28, mt); p.r(175, 8, 11, 3, mt[0]); p.r(189, 16, 10, 3, mt[0]);
  for (let y = 0; y < 126; y++) for (let x = 0; x < 216; x++) {
    const nx = (x - cx) / 104, ny = (y - cy) / (y < cy ? 62 : 40), q = nx * nx + ny * ny; if (q > 1) continue;
    let v = .44 - (nx * .3 + (y - cy) / 62 * .5), col;
    const u = nx / Math.sqrt(Math.max(.02, 1 - ny * ny));
    let seam = 9; for (const s of [-.62, -.18, .26, .66]) { const d = u - s; if (Math.abs(d) < Math.abs(seam)) seam = d; }
    if (dmg >= 2 && bay(x + 1, y) > .6) v -= .22;
    col = rp[clamp(Math.floor(v * 5 + bay(x, y) - .5), 0, 4)];
    if (Math.abs(seam) < .011) col = rp[0]; else if (seam > .011 && seam < .03) col = rp[4];
    else if (Math.abs(seam) < .05 && y % 8 === 3 && seam < 0) col = rp[4];
    if (y >= cy + 2 && y < cy + 18) { col = mt[clamp(Math.floor((.8 - (y - cy) / 26) * 5 + bay(x, y) - .5), 0, 4)]; if (y >= cy + 9 && y < cy + 15) col = ((x + y) >> 2) & 1 ? (dmg > 2 ? BK[3] : '#f8c820') : '#201828'; if (y === cy + 2) col = mt[4]; if (x % 14 === 3 && (y === cy + 5 || y === cy + 16)) col = mt[4]; }
    if (q > .93 && y < cy) col = rp[Math.min(4, rp.indexOf(col) + 1)] || col;
    for (const [hx, hy, hr] of holes) {
      const dx = x - hx, dy = y - hy, d = Math.hypot(dx, dy), a = Math.floor((Math.atan2(dy, dx) / PI + 1) * 10), e = hr * (.7 + .5 * sd[(a + hx) % 40]);
      if (d < e - 1.5) { col = (y + hx) % 5 === 0 ? mt[1] : (x * 7 + y * 13 + hx) % 23 === 0 ? '#ff9a20' : (x + hy) % 9 === 0 ? mt[0] : '#140c14'; if ((x + y * 3) % 31 === 0) col = '#ffe45c'; }
      else if (d < e) col = '#16101c'; else if (d < e + 1.5) col = rp[4];
    }
    p.p(x, y, col);
  }
  // 눈구멍·입·문양·가시
  p.el(22, 66, 17, 17, mt[0]); p.el(22, 66, 15, 15, mt.slice(1, 4)); p.el(22, 66, 12, 12, '#0c0810');
  p.box(30, 90, 34, 16, mt); for (let x = 33; x < 62; x += 4) p.r(x, 93, 2, 10, '#0c0810'); p.r(30, 97, 34, 1, mt[4]);
  if (dmg < 2) emblem(p, 126, 52); if (dmg < 2) { p.el(126, 52, 11, 11, '#16101c'); p.el(126, 52, 9, 9, '#f0f0e8'); p.r(120, 49, 4, 4, '#16101c'); p.r(128, 49, 4, 4, '#16101c'); p.r(123, 56, 6, 3, '#f8c820'); p.r(125, 59, 2, 2, '#f8c820'); }
  for (const [sx, sh] of [[44, 9], [72, 12], [104, 14], [138, 12], [166, 9]]) { const ty = cy - 62 * Math.sqrt(1 - ((sx - cx) / 104) ** 2); for (let i = 0; i < sh; i++) p.r(sx - (sh - i) * .32, ty - i + 3, Math.max(1, (sh - i) * .64), 1, i > sh - 4 ? mt[4] : mt[3 - (i < 3)]); }
  return outline(c, OL);
}
function initBoss() {
  SP.hull = [0, 1, 2, 3].map(mkHull);
  SP.claw = [8, 0].map(open => {
    const c = mk(74, 56), p = P(c);
    for (let x = 4; x < 62; x++) {
      const top = 4 + (x - 36) * (x - 36) / 80, bot = 23 - (62 - x) * .1;
      for (let y = Math.floor(top); y < bot; y++) p.p(x, y, RD[clamp(Math.floor((.9 - (y - top) / 22) * 5 + bay(x, y) - .5), 0, 4)]);
      if (x % 7 === 3 && x < 52) { p.r(x, bot, 3, 2, '#f0f0e8'); p.r(x + 1, bot + 2, 1, 2, '#c8c8d0'); }
      const lt = 30 + open + (62 - x) * .02, lb = lt + 4 + (x - 8) * .2; if (x > 8) for (let y = Math.floor(lt); y < lb; y++) p.p(x, y, RD[clamp(Math.floor((.75 - (y - lt) / 22) * 5 + bay(x, y) - .5), 0, 4)]);
      if (x % 7 === 0 && x > 12 && x < 52) p.r(x, lt - 2, 2, 2, '#f0f0e8');
    }
    p.r(20, 9, 30, 1, RD[4]); p.riv(24, 13, 5, 7, 0, RD[0]);
    p.el(60, 27, 11, 11, MT); p.el(60, 27, 4, 4, MT.slice(0, 2)); p.p(59, 26, MT[4]);
    return outline(c, OL);
  });
  SP.clawRot = [...Array(8)].map((_, i) => outline(rot(SP.claw[1], i * PI / 4, 37, 28), OL));
  let c = mk(48, 28), p = P(c); p.el(24, 22, 22, 18, MT); p.x.clearRect(0, 23, 48, 6); p.box(1, 20, 46, 5, MT); p.r(8, 10, 32, 3, RD[2]); p.r(8, 10, 32, 1, RD[4]); p.el(24, 14, 5, 5, MT.slice(0, 3)); SP.bcannon = outline(c, OL);
  SP.pod = [0, 1].map(open => {
    const c = mk(40, 30), p = P(c); p.box(1, 5, 38, 24, MT);
    if (open) { for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) { p.el(8 + i * 12, 12 + j * 10, 4, 4, '#0c0810'); p.el(8 + i * 12, 12 + j * 10, 2, 2, ['#a02020', '#f04030']); } p.box(1, 0, 38, 4, RD); }
    else { p.box(3, 7, 34, 20, RD); hazard(p, 4, 15, 32, 4); }
    return outline(c, OL);
  });
  SP.podRot = [...Array(8)].map((_, i) => outline(rot(SP.pod[0], i * PI / 4), OL));
  SP.eye = [['#1c5030', '#38a848', '#80f080', '#e0ffe0'], ['#6a5010', '#c8a020', '#ffe45c', '#fffbe8'], ['#6a1010', '#d02020', '#ff6040', '#ffd0a0']].map(rp => { const c = mk(26, 26), p = P(c); p.el(13, 13, 11, 11, rp); p.el(13, 13, 11, 11, rp); return c; });
  c = mk(22, 22); p = P(c); p.el(11, 11, 9, 9, MT); p.el(11, 11, 3, 3, MT.slice(0, 2)); SP.joint = outline(c, OL);
  c = mk(44, 18); p = P(c); for (let x = 2; x < 42; x++) { const t = 3 + Math.abs(x - 24) * .28; for (let y = Math.floor(t); y < 16; y++) p.p(x, y, MT[clamp(Math.floor((.9 - (y - t) / 14) * 5 + bay(x, y) - .5), 0, 4)]); } hazard(p, 3, 13, 38, 3); for (const x of [3, 12, 21]) { p.r(x, 14, 3, 3, '#f0f0e8'); } SP.bfoot = outline(c, OL);
}

// ───────── 배경 ─────────
function initBg() {
  let c = mk(W, H), p = P(c);
  const sky = ['#241440', '#3c1c58', '#64286c', '#983870', '#d05068', '#f07858', '#f8a858', '#fcd478'];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) p.p(x, y, sky[clamp(Math.floor(Math.pow(y / 215, 1.25) * 8 + bay(x, y) - .5), 0, 7)]);
  for (let y = -30; y <= 30; y++) for (let x = -30; x <= 30; x++) { if (x * x + y * y > 900) continue; if (y > 4 && (y % 6 === 4 || (y > 16 && y % 6 === 5))) continue; p.p(352 + x, 112 + y, y < -8 ? '#fffbe8' : y < 8 ? '#fff0a8' : '#ffd070'); }
  for (let i = 0; i < 46; i++) { const x = rnd() * W, y = rnd() * 70; p.p(x, y, i % 3 ? '#b890d0' : '#fff8e0'); }
  for (const [x, y, w] of [[40, 54, 70], [180, 34, 50], [300, 70, 90], [420, 44, 60], [110, 96, 60], [250, 112, 50]]) for (let i = 0; i < 3; i++) { p.el(x + i * w * .28, y + (i & 1) * 3, w * .26, 4 + (i & 1) * 2, ['#783070', '#b04c78', '#e87878']); p.r(x - w * .2, y + 5, w * 1.1, 2, '#783070'); }
  SP.sky = c;
  c = mk(512, H); p = P(c);
  for (let x = 0; x < 512; x++) {
    const a = x / 512 * PI * 2, h1 = 150 - 34 * Math.abs(Math.sin(a * 1.5 + .4)) - 14 * Math.sin(a * 5) - 6 * Math.sin(a * 13), h2 = 176 - 18 * Math.abs(Math.sin(a * 2 + 2)) - 8 * Math.sin(a * 7 + 1) - 3 * Math.sin(a * 19);
    for (let y = Math.floor(h1); y < H; y++) p.p(x, y, y - h1 < 3 + 3 * bay(x, y) ? '#a04c80' : '#6c3070');
    for (let y = Math.floor(h2); y < H; y++) p.p(x, y, y - h2 < 2 + 3 * bay(x, y) ? '#74386c' : '#48245c');
  }
  SP.far = c;
  c = mk(512, H); p = P(c); const D = '#2a183e', D2 = '#3c2250', LT = '#b04c68';
  const bld = (x, w, h) => { const top = 206 - h; p.r(x, top, w, h + 64, D); p.r(x + w - 2, top, 2, h, LT); for (let i = 0; i < w; i += 3) if (rnd() < .5) p.x.clearRect(x + i, top, 3, ri(1, 6)); for (let wy = top + 8; wy < 200; wy += 9) for (let wx = x + 3; wx < x + w - 5; wx += 7) p.r(wx, wy, 3, 4, rnd() < .12 ? '#f8a858' : D2); };
  const palm = (x, h) => { for (let i = 0; i < h; i++) p.r(x + Math.sin(i / h * 1.4) * 6, 206 - i, 2, 1, D); const tx = x + Math.sin(1.4) * 6, ty = 206 - h; for (const a of [-2.6, -2.0, -1.2, -.5, .1, -3.2]) for (let i = 0; i < 16; i++) { const px = tx + Math.cos(a) * i, py = ty + Math.sin(a) * i * .7 + i * i * .035; p.r(px, py, 2, 2, D); if (a > -1.4 && i > 3) p.p(px + 1, py, LT); } };
  bld(10, 40, 50); bld(58, 26, 80); palm(100, 46); bld(120, 54, 38); palm(190, 60); palm(206, 40); bld(230, 30, 66); bld(266, 44, 46);
  for (let i = 0; i < 70; i += 6) { p.ln(336 - i * .12, 206 - i, 344 + i * .12, 206 - i - 6, D); p.ln(344 + i * .12, 206 - i, 336 - i * .12, 206 - i - 6, D); } p.r(339, 128, 2, 8, D); p.r(339, 126, 2, 2, '#ff4040');
  palm(380, 52); bld(400, 60, 56); palm(476, 44); bld(486, 20, 30);
  for (let x = 0; x < 512; x++) { const h = 204 - 5 * Math.abs(Math.sin(x * .09)) - 3 * Math.sin(x * .31); p.r(x, h, 1, 70, D); }
  SP.mid = c;
  // 지면 타일 3종
  const tile = (fn) => { const c = mk(64, 44), p = P(c); for (let y = 0; y < 44; y++) for (let x = 0; x < 64; x++) p.p(x, y, fn(x, y)); return c; };
  const hs = (x, y) => { let n = (x * 374761 + y * 668265) ^ 0x5bf03; n = Math.imul(n ^ n >>> 13, 1274126177); return ((n ^ n >>> 16) >>> 0) / 4294967296; };
  const DR = ['#2c1a14', '#4c2e1c', '#6c4428', '#8c5e38', '#a87848'];
  SP.ground = [
    tile((x, y) => { const gh = 3 + (hs(x, 0) > .6) + (hs(x >> 1, 9) > .7); if (y < gh) return y === 0 ? (hs(x, 3) > .5 ? '#b8e060' : '#88c848') : y < 2 ? '#58a038' : '#387830'; const v = .8 - y / 50 + (hs(x >> 1, y >> 1) - .5) * .5; let col = DR[clamp(Math.floor(v * 5 + bay(x, y) - .5), 0, 4)]; if (hs(x >> 2, (y >> 1) + 50) > .975) col = '#b8a888'; return col; }),
    tile((x, y) => { const CR = ['#30303c', '#4c4c5c', '#6c6c7c', '#9090a0', '#b8b8c8']; if (y === 0) return CR[4]; if (y < 3) return CR[3]; if (y >= 4 && y < 8) return ((x + y) >> 2) & 1 ? '#f8c820' : '#201828'; if (x % 32 === 0 || y === 20) return CR[0]; const v = .7 - y / 60 + (hs(x >> 2, y >> 2) - .5) * .25; return hs(x, y) > .985 ? CR[0] : CR[clamp(Math.floor(v * 5 + bay(x, y) - .5), 0, 4)]; }),
    tile((x, y) => { const ST = ['#141c30', '#28385c', '#405884', '#6884b0', '#a0b8d8']; if (y === 0) return ST[4]; if (y < 10) { if (x % 32 === 0) return ST[0]; if (y === 9) return ST[0]; if ((x % 32 === 3 || x % 32 === 29) && (y === 2 || y === 7)) return ST[4]; return ST[clamp(Math.floor((.8 - y / 20) * 5 + bay(x, y) - .5), 1, 4)]; } const dx = x % 32; if (dx < 3 || Math.abs(dx - (y - 10)) < 2 || Math.abs(32 - dx - (y - 10)) < 2 || y === 26 || y === 27) return ST[y > 24 ? 0 : 1]; return y > 18 ? '#1c2c60' : '#24387c'; }),
  ];
  // 장식물
  SP.dec = {};
  c = mk(60, 92); p = P(c);
  for (let i = 0; i < 70; i++) { const x = 24 + Math.sin(i / 70 * 1.3) * 10, w = 5 - i / 30; p.r(x, 91 - i, w, 1, WD[2 + (i % 6 < 1 ? -1 : 0)]); p.p(x, 91 - i, WD[1]); p.p(x + w - 1, 91 - i, WD[4]); }
  for (const [a, l] of [[-2.9, 26], [-2.3, 28], [-1.7, 24], [-1.0, 26], [-.35, 28], [.2, 24], [-3.5, 22]]) for (let i = 0; i < l; i++) { const px = 35 + Math.cos(a) * i, py = 22 + Math.sin(a) * i * .75 + i * i * .028, w = 1 + Math.sin(i / l * PI) * 4; for (let j = 0; j < w; j++) p.p(px, py + j, GN[j < 1 ? 4 : j < 2 ? 3 : (i + j) % 3 ? 2 : 1]); }
  p.el(33, 24, 2.5, 2.5, WD.slice(0, 3)); p.el(38, 25, 2.5, 2.5, WD.slice(0, 3)); SP.dec.palm = outline(c, OL);
  c = mk(36, 18); p = P(c); p.el(9, 11, 8, 6, GN); p.el(26, 12, 9, 5, GN); p.el(18, 8, 10, 8, GN.slice(1)); SP.dec.bush = outline(c, OL);
  c = mk(56, 66); p = P(c); for (let y = 0; y < 64; y++) for (let x = 0; x < 54; x++) { if (y < 30 - x * .9 + 6 * Math.sin(x * .7) || (x > 20 && x < 34 && y > 24 && y < 44)) continue; const br = ((x + (Math.floor(y / 5) & 1) * 5) % 10 === 0) || y % 5 === 0; p.p(x + 1, y + 1, br ? TAN[0] : TAN[clamp(Math.floor((.7 - y / 120 + (hs(x >> 3, y >> 2) - .5) * .4) * 4 + bay(x, y) - .5), 0, 3)]); } SP.dec.ruin = outline(c, OL);
  c = mk(66, 34); p = P(c); for (let x = 0; x < 64; x++) for (let y = 6; y < 32; y++) if ((x + y) % 4 === 0 || (x - y + 64) % 4 === 0) p.p(x + 1, y + 1, MT[3]); for (const x of [1, 32, 63]) p.box(x, 3, 2, 30, MT, 0); p.r(1, 5, 64, 1, MT[4]); for (let x = 3; x < 64; x += 5) { p.p(x, 3, MT[4]); p.p(x + 1, 2, MT[4]); p.p(x + 2, 3, MT[4]); } SP.dec.fence = c;
  c = mk(150, 84); p = P(c); const HB = ['#28304c', '#404c70', '#5c6c94', '#8090b8', '#a8b8d8'];
  for (let x = 0; x < 148; x++) { const top = 34 - 32 * Math.sqrt(Math.max(0, 1 - ((x - 74) / 74) ** 2)); for (let y = Math.floor(top); y < 82; y++) p.p(x + 1, y + 1, x % 8 === 0 ? HB[1] : HB[clamp(Math.floor((.8 - (y - top) / 90) * 5 + bay(x, y) - .5), 0, 4)]); }
  p.r(38, 34, 74, 49, '#141826'); for (let x = 40; x < 110; x += 9) p.r(x, 36, 7, 47, '#1c2236'); hazard(p, 38, 30, 74, 4); p.r(120, 44, 14, 10, GL[1]); p.r(120, 44, 14, 1, GL[3]); emblem(p, 22, 50); SP.dec.hangar = outline(c, OL);
  c = mk(12, 64); p = P(c); p.box(5, 8, 2, 56, MT, 0); p.box(1, 4, 10, 5, MT); p.r(2, 9, 8, 2, '#fff0a8'); SP.dec.lamp = outline(c, OL);
  c = mk(70, 46); p = P(c); [[1, 23, ['#1c4c28', '#2c8040', '#58c060', '#a8f0a0']], [36, 23, ['#6a1418', '#b82828', '#f05038', '#ffa080']], [16, 1, ['#1c3068', '#2c58b8', '#5890f0', '#a8d0ff']]].forEach(([x, y, rp]) => { p.box(x, y, 33, 22, rp); for (let i = 3; i < 32; i += 4) p.r(x + i, y + 2, 1, 18, rp[0]); }); SP.dec.cont = outline(c, OL);
  c = mk(80, 150); p = P(c); for (let y = 20; y < 150; y += 10) { p.ln(30, y, 44, y + 10, MT[1]); p.ln(44, y, 30, y + 10, MT[2]); } p.r(29, 20, 2, 130, MT[1]); p.r(44, 20, 2, 130, MT[2]); for (let x = 0; x < 78; x += 8) { p.ln(x, 20, x + 8, 12, MT[1]); p.ln(x + 8, 20, x, 12, MT[2]); } p.r(0, 11, 80, 2, MT[2]); p.r(0, 20, 80, 2, MT[1]); p.box(26, 22, 22, 12, MT); p.r(8, 22, 1, 40, MT[0]); p.r(5, 62, 7, 6, MT[1]); SP.dec.crane = c;
  c = mk(20, 26); p = P(c); p.box(8, 8, 3, 18, WD, 0); p.box(1, 1, 18, 11, WD); p.r(5, 4, 2, 2, '#16101c'); p.r(12, 4, 2, 2, '#16101c'); p.r(7, 8, 6, 1, '#16101c'); SP.dec.sign = outline(c, OL);
}
