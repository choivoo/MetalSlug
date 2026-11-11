// ───────── 스테이지 구성, 자동 플레이, 화면 상태, HUD, 루프, 터치 ─────────
const DECOR = [];
function buildDecor() {
  const D = (s, x, dy = 0) => DECOR.push({ s, x, dy });
  D('sign', 150);
  for (const x of [60, 300, 520, 700, 880, 1150, 1260, 1420, 1700, 2050, 2380, 2520]) D('palm', x);
  for (const x of [200, 410, 640, 930, 1210, 1500, 1840, 2130, 2440]) D('bush', x);
  for (const x of [1340, 1480, 1640, 2000, 2200, 2460]) D('ruin', x);
  D('hangar', 2760); D('hangar', 3300); D('cont', 3020); D('cont', 3600); D('cont', 3672);
  for (let x = 2640; x < 3880; x += 64) if (!(x > 2740 && x < 2900) && !(x > 3280 && x < 3440)) D('fence', x);
  for (const x of [2700, 2960, 3220, 3500, 3780, 4020, 4260]) D('lamp', x);
  D('crane', 4080); D('crane', 4330);
}
function buildLevel() {
  const E = spawnE, tw = x => { const t = addProp('tower', x); E('rifle', x, GY - 78, { fixed: true, prop: t, st: 'wait' }); };
  // 1구역: 해안 정글
  addProp('crate', 250); E('rifle', 340); E('rifle', 392);
  addProp('crate', 446, { drop: 'can' }); addProp('crate', 466); addProp('barrel', 490);
  E('rifle', 540); addProp('sandbag', 606); E('gren', 628, GY, { fixed: true, st: 'wait' }); E('rifle', 676);
  addPow(770, 'hmg'); E('rifle', 812); E('rifle', 850); E('knife', 930);
  tw(990); addProp('barrel', 1040); addProp('barrel', 1056); E('rifle', 1048); E('gren', 1090); E('rifle', 1122);
  // 2구역: 폐허 마을
  addProp('crate', 1500, { drop: 'medal' }); addProp('sandbag', 1570); E('turret', 1600); E('rifle', 1640); addProp('crate', 1668, { drop: 'gem' }); addProp('crate', 1686);
  const hut = addProp('hut', 1790); addPow(1790, 'flame', { hidden: true, prop: hut }); E('rifle', 1740); E('rifle', 1836); E('gren', 1862);
  G.plats.push({ x: 1925, y: GY - 44, w: 72 }); G.scaf.push(1961); E('gren', 1960, GY - 44, { fixed: true, st: 'wait' }); E('rifle', 1946); E('bazooka', 2030);
  E('tank', 2230); E('rifle', 2180); E('rifle', 2260);
  addPow(2330, 'gren'); addProp('barrel', 2372); addProp('barrel', 2388); addProp('barrel', 2404); E('knife', 2450); E('knife', 2478); E('knife', 2506); E('rifle', 2420); E('rifle', 2396);
  tw(2560); addProp('sandbag', 2600); E('turret', 2628);
  G.veh = { x: 2700, y: GY, hp: 28, max: 28, face: 1, aim: 0, legT: 0, occ: false, shells: 15, flash: 0 };
  // 3구역: 군 기지
  for (const [k, x] of [['rifle', 2800], ['rifle', 2824], ['gren', 2850], ['rifle', 2876], ['rifle', 2900], ['knife', 2930], ['rifle', 2952]]) E(k, x);
  addProp('crate', 2990, { drop: 'medal' }); E('tank', 3090); addProp('sandbag', 3140); E('bazooka', 3162);
  addPow(3660, 'rocket'); addProp('barrel', 3700); addProp('barrel', 3716); addProp('barrel', 3732); for (const x of [3690, 3712, 3740, 3764]) E('rifle', x);
  E('tank', 3830); E('bazooka', 3880); addProp('sandbag', 3860); E('turret', 3920);
  G.gate = addProp('gate', 3990);
  const fromR = (k, i, o) => E(k, G.cam + W + 24 + i * 22, GY, Object.assign({ awake: true, wv: 1 }, o)), fromL = (k, i) => E(k, G.cam - 22 - i * 20, GY, { awake: true, wv: 1, face: 1 }), para = (k, x) => E(k, G.cam + x, -34, { awake: true, wv: 1, st: 'para' });
  const wave = (t, fn) => G.timers.push({ t, fn, wv: 1 });
  G.locks = [
    { cam: 1070, fn() { banner('적 증원! 버텨라!', '#ff6040'); wave(10, () => { fromR('rifle', 0); fromR('rifle', 1); fromR('gren', 2); }); wave(150, () => { para('rifle', 130); para('rifle', 260); para('gren', 390); }); wave(330, () => { fromL('knife', 0); fromL('knife', 1); fromR('rifle', 0); fromR('rifle', 1); }); } },
    { cam: 3180, fn() { banner('공격 헬기 출현!', '#ff6040'); sfx('siren'); wave(60, () => E('heli', G.cam + W + 70, 60, { awake: true, wv: 1, st: 'wait', wait: 90 })); wave(420, () => { para('rifle', 110); para('rifle', 250); para('gren', 380); }); wave(900, () => { para('rifle', 150); para('knife', 300); }); } },
  ];
}
function newGame(auto) {
  seed = 20261111;
  G = { state: 'play', auto: !!auto, t: 0, cam: 0, camI: 0, shake: 0, flash: 0, hitstop: 0, freeze: 0, score: 0, lives: 2, deaths: 0, saved: 0, pl: newPlayer(60), en: [], pb: [], eb: [], fx: [], items: [], props: [], pows: [], haz: [], timers: [], plats: [], scaf: [], wrecks: [], veh: null, boss: null, gate: null, lock: null, locks: [], banner: null, goT: 0, warn: 0, botG: 0 };
  buildLevel(); music('stage'); banner('임무 1: 까마귀 요새를 파괴하라!');
  setUI();
}

// ───────── 자동 플레이(녹화용): 실제 입력과 같은 통로로 조작 ─────────
function bot() {
  const p = G.pl, o = { l: 0, r: 0, u: 0, d: 0, fire: 0, jump: 0, gren: 0 }, b = G.boss, v = p.veh;
  if (p.dead) return o;
  const lo = G.cam + 12; let hi = G.cam + W - 12; if (G.gate && !G.gate.dead) hi = Math.min(hi, G.gate.x - 22); if (b) hi = Math.min(hi, b.x - 120);
  // 위험 구역 [x0, x1, 시작 프레임, 끝 프레임] 을 모아 왼쪽/제자리/오른쪽 중 안전한 쪽을 미리 계산
  const hz = [], half = v ? 15 : 7, spd = v ? 1.45 : 1.75;
  for (const h of G.haz) hz.push([h.x - h.r - half, h.x + h.r + half, h.t - 2, h.t + 2]);
  let wantJump = false;
  for (const q of G.eb) {
    if (q.g) { let x = q.x, y = q.y, vy = q.vy, n = 0; while (y < GY - 4 && n++ < 150) { vy += q.g; x += q.vx; y += vy; } hz.push([x - 24 - half, x + 24 + half, n - 3, n + 3]); continue; }
    const tt = (p.x - q.x) / (q.vx || .001);
    if (Math.abs(q.vy) > .9) { const ty = (p.y - 12 - q.y) / q.vy; if (ty > 0 && ty < 60) { const xh = q.x + q.vx * ty; hz.push([xh - 9 - half, xh + 9 + half, ty - 6, ty + 6]); } }
    else if (tt > 0 && tt < (v ? 12 : 15)) { const yq = q.y + q.vy * tt; if (yq > p.y - 30 && yq < p.y + 2) wantJump = true; }
  }
  for (const e of G.en) { if (e.awake && e.k === 'tank') hz.push([e.x - 44 - half, e.x + 44 + half, 0, 999]); if (e.awake && e.k === 'knife' && Math.abs(e.x - p.x) < 34 && Math.abs(e.y - p.y) < 10 && p.ground) wantJump = true; }
  if (b) {
    const c = b.claw, hl = b.phase === 2 ? 19 : 26;
    if (c.st === 'hold' || c.st === 'slam') { const th = c.st === 'hold' ? hl - c.t + 5 : 2; hz.push([c.tx - 36, c.tx + 36, th - 4, th + 3]); }
    if (b.st === 'flame' && b.t < 146) hz.push([b.x - 282, b.x, Math.max(0, 54 - b.t), 148 - b.t]);
    if (b.st === 'laser' && b.t < 126) hz.push([b.x - 216 - half, b.x, Math.max(0, 68 - b.t), 128 - b.t]);
    for (const w of b.waves) if (w.x > p.x - 8 && w.x - p.x < (v ? 34 : 30)) wantJump = true;
  }
  const plan = dir => { // dir 방향으로 모든 구역 밖까지 걷고 멈췄을 때 가장 먼저 맞는 시각(안 맞으면 999)
    let x = p.x, first = 999;
    for (let t = 0; t < 150; t++) {
      for (const z of hz) if (t >= z[2] && t <= z[3] && x > z[0] && x < z[1] && t < first) first = t;
      if (dir && hz.some(z => x > z[0] - 2 && x < z[1] + 2 && z[3] >= t)) x = clamp(x + dir * spd, lo, hi);
    }
    return first;
  };
  let mv = 0, esc = false;
  if (hz.length) {
    const s0 = plan(0);
    if (s0 < 999) { const sl = plan(-1), sr = plan(1); esc = true; if (sl >= 999 && sr >= 999) mv = (G.t >> 6) & 1 ? -1 : 1; else mv = sl > sr ? -1 : sr > sl ? 1 : -1; if (Math.max(sl, sr) <= s0) { mv = 0; } if (sl >= 999 && sr >= 999) { let dl = 0, dr = 0; for (const z of hz) if (p.x > z[0] && p.x < z[1]) { dl = Math.max(dl, p.x - z[0]); dr = Math.max(dr, z[1] - p.x); } mv = dl <= dr ? -1 : 1; } }
  }
  // 목표 고르기
  let tg = null, td = 1e9;
  for (const e of G.en) { if (!e.awake || e.dead || !onScr(e.x, 0) || e.st === 'crash') continue; const d = Math.abs(e.x - p.x) + (e.st === 'para' ? 120 : 0); if (d < td) { td = d; tg = { x: e.x, y: e.y - e.h / 2, mech: e.cls === 'mech', k: e.k }; } }
  for (const q of G.props) { if (q.dead || !onScr(q.x, 0) || q.x < p.x) continue; const d = q.x - p.x + 40; if (d < td && d < 260) { td = d; tg = { x: q.x, y: q.y - Math.min(q.h, 30) / 2, prop: 1, k: q.k }; } }
  if (b && b.st !== 'die' && b.st !== 'enter') tg = { x: b.x - 100, y: p.y - 20, boss: 1 };
  const sy = p.y - 20;
  if (tg) {
    const dx = tg.x - p.x, ad = Math.abs(dx), up = sy - tg.y;
    o.fire = 1;
    if (up > 34) { // 높은 목표: 밑으로 가서 위로, 가는 길에는 대각선
      o.u = 1; if (ad > 7 && !esc) mv = sgn(dx); else if (!esc && sgn(dx) !== p.face && ad > 2) mv = sgn(dx);
      if (ad > 7 && Math.abs(ad - up) > 26 && ad > up) o.u = 0;
    } else if (!esc) {
      if (tg.boss) { const want = b.x - 232; if (p.x < want - 14) mv = 1; else if (p.x > want + 14) mv = -1; else if (p.face < 0) mv = 1; }
      else { const near = tg.prop ? (tg.k === 'barrel' ? 66 : 24) : tg.mech ? 96 : 58, far = tg.prop ? 150 : 170; if (ad < near) mv = -sgn(dx); else if (ad > far) mv = sgn(dx); else if (sgn(dx) !== p.face) mv = sgn(dx); }
    }
    if (G.botG <= 0 && !tg.prop && up < 30) {
      const gd = tg.boss ? (b.x - 104) - p.x : ad;
      if (v ? (v.shells > 0 && (tg.mech || tg.boss) && gd < 260) : (p.gren > 0 && (tg.mech || tg.boss) && gd > 50 && gd < 135 && sgn(dx) === p.face)) { o.gren = 1; G.botG = v ? 40 : 55; }
    }
  } else if (!esc) {
    let goal = null;
    for (const it of G.items) if (Math.abs(it.x - p.x) < 220 && it.vy === 0) goal = it.x;
    for (const w of G.pows) if (w.st === 'tied' && !w.hidden && onScr(w.x, 0)) goal = w.x;
    if (G.veh && !G.veh.occ && onScr(G.veh.x, 0)) goal = G.veh.x;
    if (goal !== null) mv = Math.abs(goal - p.x) > 3 ? sgn(goal - p.x) : 0; else if (!G.lock && !G.warn) mv = 1; else if (b && p.x < G.cam + 120) mv = 1; else if (G.warn && !b) mv = p.x < G.cam + 110 ? 1 : p.x > G.cam + 150 ? -1 : 0;
  }
  if (G.botG > 0) G.botG--;
  if (!esc && mv) { const nx = p.x + mv * spd * 6; if (hz.some(z => nx > z[0] && nx < z[1] && z[2] < 70) && !hz.some(z => p.x > z[0] && p.x < z[1])) mv = 0; }
  if (mv > 0) o.r = 1; else if (mv < 0) o.l = 1;
  if ((wantJump && p.ground) || (!p.ground && p.vy < 0)) o.jump = 1;
  return o;
}

// ───────── 한 프레임 갱신 ─────────
let TITLE = { t: 0 }, state0 = 'title';
function startAudioAndGame(auto) { auInit(); sfx('coin'); newGame(auto); }
function update() {
  // 입력 모으기
  const src = (G && G.auto && G.state === 'play') ? bot() : null;
  for (const k in inp) { prevInp[k] = inp[k]; inp[k] = src ? src[k] : (kb[k] || ts[k] ? 1 : 0); edge[k] = inp[k] && !prevInp[k]; }
  const tp = tap; tap = null;
  if (!G) {
    TITLE.t++;
    if (TITLE.t === 2) music('title');
    if (tp) { const a = tp.auto || (tp.x > 250 && tp.x < 366 && tp.y > 138 && tp.y < 172); startAudioAndGame(a); }
    return;
  }
  if (G.state === 'continue') {
    G.contT--; if (G.contT % 60 === 0) sfx('tick');
    if ((tp && !tp.auto) || (G.auto && G.contT < 540)) { sfx('coin'); G.lives = 2; G.state = 'play'; G.pl = newPlayer(clamp(G.pl.x, G.cam + 40, G.cam + 200)); G.pl.inv = 200; music(G.boss ? 'boss' : 'stage'); setUI(); }
    else if (G.contT <= 0) { G.state = 'over'; G.overT = 0; music('over'); }
    updFx(); return;
  }
  if (G.state === 'over') { G.overT++; if (G.overT > 300 || (tp && G.overT > 60)) { G = null; TITLE.t = 0; setUI(); } return; }
  if (G.state === 'clear') { G.clearT++; updFx(); for (const w of G.wrecks) w.t++; if (G.clearT > 60 && G.clearT < 300 && G.clearT % 4 === 0) sfx('tick'); if (tp && G.clearT > 380 && !G.auto) { G = null; TITLE.t = 0; setUI(); } return; }
  if (G.hitstop > 0) { G.hitstop--; return; }
  G.t++; if (G.shake > 0) G.shake *= .86; if (G.shake < .4) G.shake = 0; if (G.flash > 0) G.flash--; if (G.goT > 0) G.goT--; if (G.banner && --G.banner.t <= 0) G.banner = null;
  for (const tm of G.timers) if (--tm.t <= 0) { tm.done = 1; tm.fn(); }
  G.timers = G.timers.filter(tm => !tm.done);
  updPlayer();
  // 카메라·구간 잠금
  const p = G.pl; let maxCam = BOSSCAM; if (G.gate && !G.gate.dead) maxCam = Math.min(maxCam, G.gate.x - W + 60); if (G.lock) maxCam = G.lock.cam; else if (G.locks.length) maxCam = Math.min(maxCam, G.locks[0].cam);
  const tgt = p.x - 170; if (tgt > G.cam && G.cam < maxCam) G.cam = Math.min(G.cam + Math.min(3, tgt - G.cam), maxCam);
  if (!G.lock && G.locks.length && G.cam >= G.locks[0].cam) { G.lock = G.locks.shift(); G.lock.fn(); }
  if (G.lock && !G.timers.some(tm => tm.wv) && !G.en.some(e => e.wv && !e.dead)) { G.lock = null; G.goT = 170; sfx('item'); }
  if (!G.boss && !G.warn && G.cam >= BOSSCAM) { G.warn = 1; music(null); sfx('siren'); }
  if (G.warn && !G.boss) { G.warn++; if (G.warn === 100) sfx('siren'); if (G.warn > 210) spawnBoss(); }
  G.camI = Math.round(G.cam);
  updEnemies(); updBoss(); updBullets(); updEB(); updPows(); updItems(); updFx();
  for (const q of G.props) if (q.flash > 0) q.flash--;
}

// ───────── 그리기 ─────────
function drawBg(cam) {
  g.drawImage(SP.sky, 0, 0);
  let ox = -Math.floor(cam * .12) % 512; g.drawImage(SP.far, ox, 0); g.drawImage(SP.far, ox + 512, 0);
  ox = -Math.floor(cam * .35) % 512; g.drawImage(SP.mid, ox, 8); g.drawImage(SP.mid, ox + 512, 8);
  const sx = 3905 - cam; if (sx < W) { const x0 = Math.max(0, sx), tt = G ? G.t : TITLE.t; R(x0, 196, W - x0, 34, '#24387c'); for (let y = 198; y < 228; y += 4) for (let x = x0 - ((cam * .6) | 0) % 16 + ((y * 5 + (tt >> 3)) % 16); x < W; x += 16) if (x >= x0) R(x, y, 6, 1, y < 206 ? '#f8a858' : '#5878c0'); }
  for (const d of DECOR) { if (d.x < cam - 160 || d.x > cam + W + 10) continue; const c = SP.dec[d.s]; g.drawImage(c, Math.round(d.x - cam), GY - c.height + 1 + d.dy); }
  for (let tx = Math.floor(cam / 64) * 64; tx < cam + W; tx += 64) g.drawImage(SP.ground[tx < 2624 ? 0 : tx < 3904 ? 1 : 2], Math.round(tx - cam), GY);
}
const pad = (n, l) => String(n).padStart(l, '0');
function drawHUD() {
  const p = G.pl, v = p.veh;
  T('1P', 8, 5, { s: 8, c: '#78a8ff' }); T(pad(G.score, 7), 26, 5, { s: 8, c: '#ffffff', c2: '#ffe45c' });
  spr(SP.heroHead, 7, 17); T('×' + G.lives, 21, 18, { s: 8 });
  R(150, 4, 100, 24, '#16101c'); R(151, 5, 98, 22, '#2c2440'); R(151, 5, 98, 1, '#5a4e78');
  if (v) { T('보행전차', 156, 6, { s: 8, c: '#a8f0a0' }); T('포탄 ' + v.shells, 246, 6, { s: 8, a: 1 }); R(156, 19, 88, 5, '#16101c'); R(157, 20, Math.max(0, 86 * v.hp / v.max), 3, v.hp < 9 ? '#f03838' : '#58c060'); }
  else { T(WP[p.weapon].name, 156, 6, { s: 8, c: '#ffe45c' }); T(p.weapon === 'pistol' ? '∞' : String(p.ammo), 246, 6, { s: 8, a: 1 }); T('수류탄', 156, 16, { s: 8, c: '#a8d0ff' }); T(String(p.gren), 246, 16, { s: 8, a: 1 }); }
  T('구출 ' + G.saved, W - 8, 5, { s: 8, a: 1, c: '#fff8a0' });
  if (G.auto) { if ((G.t >> 5) & 1) T('자동 플레이', W - 8, 17, { s: 7, a: 1, c: '#ff9a20' }); }
  const b = G.boss;
  if (b && b.st !== 'enter') { T('철왕게', 300, 30, { s: 8, a: 1, c: '#ff6040' }); R(304, 32, 164, 8, '#16101c'); const w = 162 * b.hp / BOSSHP; R(305, 33, w, 6, b.phase === 0 ? '#58c060' : b.phase === 1 ? '#ffe45c' : '#f03838'); R(305, 33, w, 1, '#ffffff'); R(305 + 162 * .33, 32, 1, 8, '#16101c'); R(305 + 162 * .66, 32, 1, 8, '#16101c'); }
  if (G.banner && (G.banner.t > 20 || (G.banner.t & 2))) T(G.banner.s, W / 2, 56, { s: 14, px: 1, a: .5, c: '#ffffff', c2: G.banner.c });
  if (G.goT > 0 && (G.goT >> 3) & 1) T('가자! ▶', W - 14, 110, { s: 14, px: 1, a: 1, c: '#ffffff', c2: '#58c060' });
  if (G.warn && !G.boss) { if ((G.warn >> 3) & 1) { R(0, 96, W, 44, '#16101c'); for (let x = -((G.warn * 2) % 16); x < W; x += 16) { R(x, 96, 8, 4, '#f8c820'); R(x + 8, 136, 8, 4, '#f8c820'); } T('경고! 거대 병기 접근 중', W / 2, 104, { s: 20, px: 1, a: .5, c: '#ff4030', c2: '#ffe45c' }); } }
}
function dim(a) { g.fillStyle = '#16101c'; for (let y = 0; y < H; y++) for (let x = (y & 1); x < W; x += 2) g.fillRect(x, y, 1, 1); if (a) { g.globalAlpha = a; g.fillRect(0, 0, W, H); g.globalAlpha = 1; } }
function render() {
  if (!G) {
    const t = TITLE.t, cam = t * 1.2 % 2400; drawBg(cam);
    const r = (t >> 2) % 8; spr(SP.walker, 74, GY - 49 + ((t >> 3) & 1)); limb(101, GY - 28, 120, GY - 30, 5, BK[2], BK[4]); for (const i of [0, 1]) { const ph = t * .25 + i * PI, fx_ = 96 + (i ? 5 : -5) + Math.sin(ph) * 8, fy = GY - Math.max(0, Math.cos(ph)) * 6; limb(96 + (i ? 3 : -3), GY - 24, (96 + fx_) / 2 - 7, (GY - 24 + fy) / 2 - 2, 4, GN[2], GN[4]); limb((96 + fx_) / 2 - 7, (GY - 24 + fy) / 2 - 2, fx_ - 2, fy - 5, 3, BK[3]); spr(SP.wfoot, fx_ - 8, fy - 8); }
    spr(heroSpr('r' + r, 'f', 0, 'hmg'), 150, GY - 41); spr(SP.pow.run[r], 30, GY - 41);
    for (let i = 0; i < 3; i++) spr(SP.sold.rifle.scared[(t >> 3) & 1], 330 + i * 40 + ((t >> 1) % 3), GY - 41, false);
    T('철갑돌격대', W / 2, 30, { s: 56, px: 2, a: .5, c: '#fff8c0', c2: '#ff9a20', oc: '#3a0c18' });
    T('작전명: 까마귀 사냥', W / 2, 98, { s: 16, px: 1, a: .5, c: '#ffffff', c2: '#a8d0ff' });
    const btn = (x, s, c) => { R(x, 138, 116, 34, '#16101c'); R(x + 2, 140, 112, 30, c); R(x + 2, 140, 112, 2, '#ffffff'); R(x + 2, 166, 112, 4, '#16101c'); T(s, x + 58, 147, { s: 12, a: .5 }); };
    btn(114, '게임 시작', '#b83030'); btn(250, '자동 플레이', '#3868d8');
    if ((t >> 4) & 1) T('화면을 터치해 동전을 넣으세요!', W / 2, 121, { s: 10, a: .5, c: '#ffe45c' });
    T(TOUCH ? '왼쪽: 이동·조준   오른쪽: 사격·점프·폭탄' : '방향키: 이동·조준   Z: 사격   X: 점프   C: 폭탄   P: 자동 플레이', W / 2, 246, { s: 8, a: .5, c: '#d8d0e8' });
    T('오리지널 도트 런앤건 · 모든 그림과 소리는 코드로 생성', W / 2, 258, { s: 6, a: .5, c: '#8478a4' });
  } else {
    drawBg(G.cam);
    const shx = G.shake ? Math.round((Math.sin(G.t * 12.9) * G.shake)) : 0, shy = G.shake ? Math.round(Math.cos(G.t * 7.3) * G.shake * .7) : 0;
    g.save(); g.translate(-G.camI + shx, shy);
    for (const x of G.scaf) spr(SP.scaffold, x - 39, GY - 46);
    drawProps(); drawPows(); drawFx(0); drawItems(); drawEnemies(); drawBoss(0); drawVeh(); if (G.state !== 'clear') drawPlayer(); drawBoss(1); drawBullets(); drawEB(); drawFx(1);
    g.restore();
    if (G.flash > 0) { g.globalAlpha = Math.min(1, G.flash / 8); g.fillStyle = '#fffbe8'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    if (G.state === 'play') drawHUD();
    else if (G.state === 'continue') { dim(.3); T('계속하시겠습니까?', W / 2, 50, { s: 24, px: 1, a: .5, c: '#ffffff', c2: '#ffe45c' }); T(String(Math.max(0, Math.ceil(G.contT / 60) - 1)), W / 2, 96, { s: 60, px: 2, a: .5, c: '#fff8c0', c2: '#ff4030' }); if ((G.contT >> 4) & 1) T('터치: 동전 넣고 계속', W / 2, 190, { s: 12, a: .5, c: '#a8f0a0' }); }
    else if (G.state === 'over') { dim(.5); T('게임 오버', W / 2, 90, { s: 48, px: 2, a: .5, c: '#ff8060', c2: '#b02020' }); T('점수 ' + pad(G.score, 7), W / 2, 170, { s: 12, a: .5 }); }
    else if (G.state === 'clear') {
      const t = G.clearT; dim(.25);
      T('임무 완료!', W / 2, 14, { s: 48, px: 2, a: .5, c: '#fff8c0', c2: '#ffb020', oc: '#3a0c18' });
      const bonus = G.saved * 1000 + G.pl.gren * 100, rows = [['전투 점수', pad(G.score, 7)], ['구출한 포로 ' + G.saved + '명', '+' + G.saved * 1000], ['남은 수류탄 ' + G.pl.gren + '개', '+' + G.pl.gren * 100], ['쓰러진 횟수', G.deaths + '회']];
      rows.forEach((r, i) => { if (t > 70 + i * 40) { T(r[0], 130, 84 + i * 17, { s: 11, c: '#d8d0e8' }); T(r[1], 350, 84 + i * 17, { s: 11, a: 1, c: '#ffffff', c2: '#ffe45c' }); } });
      if (t > 240) { R(126, 154, 228, 1, '#ffe45c'); T('총점', 130, 159, { s: 14, c: '#ffe45c' }); T(pad(G.score + Math.floor(bonus * Math.min(1, (t - 240) / 60)), 7), 350, 157, { s: 16, a: 1, c: '#ffffff', c2: '#ffe45c' }); }
      const hop = (t >> 3) & 1; spr(SP.heroWin[hop], W / 2 - 21, GY - 41);
      for (let i = 0; i < G.saved; i++) spr(SP.pow.joy[(hop + i) & 1], W / 2 - 21 + (i % 2 ? 1 : -1) * (34 + (i >> 1) * 28), GY - 41, i % 2 === 0);
      if (t > 330 && (t >> 4) & 1) T(G.auto ? '자동 플레이 끝 — 수고하셨습니다!' : '화면을 터치하면 처음으로', W / 2, 252, { s: 9, a: .5, c: '#a8f0a0' });
    }
  }
  out.drawImage(buf, 0, 0, W * K, H * K); flushText();
}

// ───────── 터치 조작(모바일 기준) ─────────
const ts = { l: 0, r: 0, u: 0, d: 0, fire: 0, jump: 0, gren: 0 };
let TOUCH = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const $ = id => document.getElementById(id);
function setUI() { document.body.classList.toggle('playing', !!G && (G.state === 'play') && !G.auto && TOUCH); }
function initTouch() {
  const zone = $('stickzone'), stick = $('stick'), knob = $('knob'); let sid = null, ox = 0, oy = 0;
  const setDir = (dx, dy) => { const l = Math.hypot(dx, dy), R_ = stick.offsetWidth / 2; ts.l = ts.r = ts.u = ts.d = 0; if (l > R_ * .28) { const nx = dx / l, ny = dy / l; ts.r = nx > .38 ? 1 : 0; ts.l = nx < -.38 ? 1 : 0; ts.d = ny > .38 ? 1 : 0; ts.u = ny < -.38 ? 1 : 0; } const k = Math.min(1, R_ * .8 / (l || 1)); knob.style.transform = 'translate(' + dx * k + 'px,' + dy * k + 'px)'; };
  zone.addEventListener('pointerdown', e => { if (sid !== null) return; sid = e.pointerId; zone.setPointerCapture(sid); ox = e.clientX; oy = e.clientY; stick.style.left = ox + 'px'; stick.style.top = oy + 'px'; stick.classList.add('on'); setDir(0, 0); e.preventDefault(); });
  zone.addEventListener('pointermove', e => { if (e.pointerId === sid) setDir(e.clientX - ox, e.clientY - oy); });
  const end = e => { if (e.pointerId === sid) { sid = null; setDir(0, 0); stick.classList.remove('on'); } };
  zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
  for (const [id, k] of [['bFire', 'fire'], ['bJump', 'jump'], ['bGren', 'gren']]) {
    const el = $(id), on = e => { ts[k] = 1; el.classList.add('on'); try { el.setPointerCapture(e.pointerId); } catch (_) { } e.preventDefault(); if (navigator.vibrate && k !== 'fire') navigator.vibrate(8); }, off = () => { ts[k] = 0; el.classList.remove('on'); };
    el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', off);
  }
  addEventListener('pointerdown', e => {
    auInit(); if (e.pointerType === 'touch' && !TOUCH) { TOUCH = true; }
    if (e.target.id === 'bFs') return;
    if (G && G.state === 'play') return;
    const r = cv.getBoundingClientRect(); tap = { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
    if (TOUCH && !document.fullscreenElement && !G) goFull();
  });
  $('bFs').addEventListener('click', goFull);
  addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('visibilitychange', () => { if (AU.ctx) { if (document.hidden) AU.ctx.suspend(); else AU.ctx.resume(); } });
}
function goFull() { const d = document.documentElement; try { const pr = (d.requestFullscreen || d.webkitRequestFullscreen || (() => { })).call(d); if (pr && pr.then) pr.then(() => { try { screen.orientation.lock('landscape').catch(() => { }); } catch (_) { } setTimeout(fit, 300); }).catch(() => { }); } catch (_) { } }

// ───────── 시작 ─────────
let lastT = 0, acc = 0;
function frame(t) {
  requestAnimationFrame(frame); const dt = Math.min(100, t - lastT); lastT = t; acc += dt; let n = 0;
  while (acc >= 1000 / 60 && n < 4) { update(); acc -= 1000 / 60; n++; } if (n === 4) acc = 0;
  render();
}
function boot() {
  fit(); initChars(); initFx(); initProps(); initBoss(); initBg(); initProps2(); buildDecor(); initTouch();
  if (QS.has('auto')) newGame(true);
  window.__adv = n => { for (let i = 0; i < n; i++) update(); render(); return G ? { st: G.state, t: G.t, cam: G.cam | 0, x: G.pl.x | 0, score: G.score, lives: G.lives, deaths: G.deaths, saved: G.saved, boss: G.boss ? [G.boss.st, G.boss.hp | 0, G.boss.phase] : null, veh: G.pl.veh ? G.pl.veh.hp : -1, wp: G.pl.weapon, en: G.en.length } : null; };
  window.__game = () => G; window.__new = a => newGame(a);
  if (!TEST) requestAnimationFrame(frame); else render();
}
boot();
