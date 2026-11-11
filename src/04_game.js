// ───────── 게임 본체: 상태, 효과, 주인공, 탄, 사물, 포로, 탈것 ─────────
let G = null;
const GRAV = .3, LEVELW = 4440, BOSSCAM = 3960;
const WP = {
  pistol: { name: '권총', cd: 9, gun: 'pistol' },
  hmg: { name: '중기관총', cd: 4, ammo: 200, gun: 'hmg' },
  flame: { name: '화염방사기', cd: 3, ammo: 160, gun: 'flame' },
  rocket: { name: '로켓포', cd: 22, ammo: 30, gun: 'rocket' },
};
const addScore = n => { G.score += n; };
const onScr = (x, m = 16) => x > G.cam - m && x < G.cam + W + m;

// ───────── 효과 ─────────
function fx(o) { G.fx.push(o); return o; }
function fxEx(x, y, sz) { fx({ k: 'ex', x, y, fr: SP.ex[sz], t: 0, sp: sz === 'x' ? 4 : 3 }); }
function fxPt(x, y, n, col, sp = 2.5, life = 22, g = .15) { for (let i = 0; i < n; i++) { const a = rnd() * PI * 2, s = rr(.3, 1) * sp; fx({ k: 'pt', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - sp * .3, g, life: life * rr(.5, 1), col: Array.isArray(col) ? pick(col) : col, sz: rnd() < .3 ? 2 : 1 }); } }
function fxSmoke(x, y, n = 1, vy = -.5, sp = .5) { for (let i = 0; i < n; i++) fx({ k: 'sm', x: x + rr(-4, 4), y: y + rr(-4, 4), vx: rr(-sp, sp), vy: vy + rr(-.3, .1), life: 0, max: ri(26, 44) }); }
function fxDeb(x, y, frames, n = 1, sp = 3) { for (let i = 0; i < n; i++) fx({ k: 'deb', x: x + rr(-6, 6), y: y + rr(-6, 6), vx: rr(-1, 1) * sp, vy: rr(-1.6, -.5) * sp, fr: Array.isArray(frames[0]) ? pick(frames) : frames, ri: ri(0, 7), spin: pick([-1, 1]) * rr(.15, .4), b: 2, life: 160 }); }
function fxText(s, x, y, c) { fx({ k: 'txt', s, x, y, life: 50, c: c || '#ffe45c' }); }
function fxDust(x, y, n = 4) { for (let i = 0; i < n; i++) fx({ k: 'pt', x: x + rr(-5, 5), y, vx: rr(-1, 1), vy: rr(-.8, -.1), g: .02, life: rr(10, 22), col: pick(['#d8c8a0', '#a89878', '#f0e8d0']), sz: 2 }); }
function shake(n) { G.shake = Math.max(G.shake, n); }
// 폭발: 크기별 연출 + 피해
function boom(x, y, sz, o = {}) {
  fxEx(x, y, sz); const n = { s: 4, m: 9, l: 16, x: 30 }[sz], r = { s: 12, m: 22, l: 36, x: 60 }[sz];
  fxPt(x, y, n, ['#ffe45c', '#ff9a20', '#fffbe8'], 2 + n * .15, 26); if (sz !== 's') { fxSmoke(x, y - 4, n >> 2, -.7, 1); shake({ m: 4, l: 8, x: 16 }[sz]); }
  sfx(sz === 's' ? 'hit' : sz === 'm' ? 'boom' : sz === 'l' ? 'bigboom' : 'megaboom');
  if (sz === 'l' || sz === 'x') { G.flash = Math.max(G.flash, sz === 'x' ? 10 : 3); G.hitstop = Math.max(G.hitstop, 3); }
  if (o.dmg) blast(x, y, o.r || r, o.dmg);
  if (o.hostile) { const b = plBox(), dx = Math.max(b.x0 - x, 0, x - b.x1), dy = Math.max(b.y0 - y, 0, y - b.y1); if (dx * dx + dy * dy < (o.r || r) * (o.r || r)) hurtPlayer(o.pd || 4); }
}
function blast(x, y, r, dmg) {
  for (const e of G.en) { if (e.dead || !e.awake) continue; const dx = Math.max(Math.abs(e.x - x) - e.w / 2, 0), dy = Math.max(Math.abs(e.y - e.h / 2 - y) - e.h / 2, 0); if (dx * dx + dy * dy < r * r) damageEnemy(e, dmg, { blast: 1, dir: sgn(e.x - x) }); }
  for (const q of G.props) { if (q.dead) continue; const dx = Math.max(Math.abs(q.x - x) - q.w / 2, 0), dy = Math.max(Math.abs(q.y - q.h / 2 - y) - q.h / 2, 0); if (dx * dx + dy * dy < r * r) hitProp(q, dmg); }
  for (const w of G.pows) if (w.st === 'tied' && !w.hidden && Math.abs(w.x - x) < r + 6 && Math.abs(w.y - 12 - y) < r + 12) freePow(w);
  if (G.boss) bossBlast(x, y, r, dmg);
}

// ───────── 주인공 ─────────
function newPlayer(x) { return { x, y: -30, vx: 0, vy: 0, face: 1, ax: 1, ay: 0, ground: false, crouch: false, weapon: 'pistol', ammo: 0, gren: 10, cool: 0, inv: 120, dead: 0, veh: null, runT: 0, shootT: 0 }; }
function plBox() { const p = G.pl; return p.veh ? { x0: p.x - 12, x1: p.x + 12, y0: p.y - 44, y1: p.y } : p.crouch ? { x0: p.x - 4, x1: p.x + 4, y0: p.y - 14, y1: p.y } : { x0: p.x - 4, x1: p.x + 4, y0: p.y - 24, y1: p.y }; }
function hurtPlayer(dmg = 1) {
  const p = G.pl; if (p.inv > 0 || p.dead || G.state !== 'play' || (G.boss && G.boss.st === 'die')) return;
  const v = p.veh;
  if (v) {
    v.hp -= dmg; v.flash = 5; p.inv = 14; sfx('clang'); shake(3); fxPt(p.x, p.y - 28, 6, ['#ffe45c', '#fffbe8'], 3, 14);
    if (v.hp <= 0) { p.veh = null; G.veh = null; p.vy = -6.2; p.ground = false; p.inv = 130; boom(v.x, v.y - 24, 'l'); fxDeb(v.x, v.y - 24, SP.plate, 8, 3.4); banner('탈것 파괴!', '#ff6040'); }
    return;
  }
  p.dead = 1; p.vy = -3.6; p.vx = -p.face * 1.4; p.ground = false; G.deaths++; sfx('pdie'); G.hitstop = 8; shake(5); fxPt(p.x, p.y - 14, 10, ['#fffbe8', '#f03838'], 3);
}
function landOn(e, prevY) { // 지면·발판 착지
  if (e.y >= GY) { e.y = GY; return true; }
  if (e.vy >= 0) for (const pl of G.plats) if (e.x > pl.x - 3 && e.x < pl.x + pl.w + 3 && prevY <= pl.y + .01 && e.y >= pl.y && !pl.dead) { e.y = pl.y; return true; }
  return false;
}
function updPlayer() {
  const p = G.pl, v = p.veh;
  if (p.dead) {
    p.dead++; p.vy += GRAV; const py = p.y; p.y += p.vy; p.x += p.vx; if (landOn(p, py)) { p.vy = 0; p.vx *= .8; }
    p.x = clamp(p.x, G.cam + 8, G.cam + W - 8);
    if (p.dead > 95) {
      if (G.lives > 0) { G.lives--; const nx = clamp(p.x, G.cam + 40, G.cam + 200); G.pl = newPlayer(nx); G.pl.inv = 170; }
      else { G.state = 'continue'; G.contT = 60 * 10; music(null); }
    }
    return;
  }
  if (p.inv > 0) p.inv--;
  const frozen = G.freeze > 0;
  const mx = frozen ? 0 : (inp.r ? 1 : 0) - (inp.l ? 1 : 0);
  if (mx) p.face = mx;
  p.crouch = !v && p.ground && inp.d && !frozen;
  p.vx = mx * (v ? 1.45 : p.crouch ? .7 : 1.75);
  p.x += p.vx;
  let maxX = G.cam + W - 8; const gate = G.gate; if (gate && !gate.dead) maxX = Math.min(maxX, gate.x - 20); if (G.boss) maxX = Math.min(maxX, G.boss.x - 116);
  p.x = clamp(p.x, G.cam + 8, maxX);
  if (edge.jump && p.ground && !frozen) { p.vy = v ? -5.3 : -5.7; p.ground = false; sfx('jump'); if (v) sfx('step'); }
  if (!inp.jump && p.vy < -2.2) p.vy = -2.2;
  const py = p.y; p.vy = Math.min(p.vy + GRAV, 7); p.y += p.vy;
  const was = p.ground; p.ground = landOn(p, py);
  if (p.ground) { if (!was && p.vy > 2) { fxDust(p.x, p.y, v ? 8 : 3); sfx(v ? 'step' : 'land'); if (v) shake(2); } p.vy = 0; }
  // 조준(여덟 방향)
  let ay = inp.u ? -1 : (inp.d && !p.ground) ? 1 : 0;
  p.ay = ay; p.ax = (ay && !mx) ? 0 : p.face;
  if (p.cool > 0) p.cool--; if (p.shootT > 0) p.shootT--;
  if (mx && p.ground) { p.runT++; if (v && p.runT % 14 === 0) sfx('step'); } else if (!mx) p.runT = 0;
  if (v) {
    v.x = p.x; v.y = p.y; v.face = p.face; if (mx || !p.ground) v.legT++;
    const ta = Math.atan2(p.ay, p.ax); let d = ta - v.aim; while (d > PI) d -= PI * 2; while (d < -PI) d += PI * 2; v.aim += clamp(d, -.22, .22);
    if (v.flash > 0) v.flash--;
    for (const e of G.en) if (!e.dead && e.awake && e.cls === 'sold' && e.y > GY - 4 && Math.abs(e.x - v.x) < 13 && (mx || p.vy > 0) && p.y > GY - 14) { damageEnemy(e, 99, { crush: 1 }); }
  }
  if (!frozen) { if (inp.fire && p.cool <= 0) fire(); if (edge.gren) grenade(); }
  // 탈것 탑승
  const w = G.veh; if (w && !w.occ && Math.abs(w.x - p.x) < 14 && Math.abs(w.y - p.y) < 30) { w.occ = true; p.veh = w; p.inv = 60; p.y = w.y; sfx('board'); banner('보행전차 탑승!', '#a8f0a0'); }
}
function muzzle() {
  const p = G.pl, v = p.veh;
  if (v) { const dx = Math.cos(v.aim), dy = Math.sin(v.aim); return [v.x + v.face * 5 + dx * 20, v.y - 28 + dy * 20, dx, dy]; }
  const n = p.ax && p.ay ? .7071 : 1, dx = p.ax * n, dy = p.ay * n; return [p.x + p.face + dx * 14, p.y - (p.crouch ? 15 : 20) + dy * 14, dx, dy];
}
function fire() {
  const p = G.pl, v = p.veh, [mx, my, dx, dy] = muzzle(), w = v ? null : WP[p.weapon];
  const B = (k, sp, dmg, o) => G.pb.push(Object.assign({ k, x: mx, y: my, vx: dx * sp, vy: dy * sp, dmg, life: 70 }, o));
  p.shootT = 4; fx({ k: 'mz', x: mx, y: my, t: 0 });
  if (v) { p.cool = 4; const s = rr(-.05, .05); G.pb.push({ k: 'v', x: mx, y: my, vx: (dx - dy * s) * 9, vy: (dy + dx * s) * 9, dmg: 1.5, life: 60 }); sfx('vulcan'); fx({ k: 'pt', x: v.x, y: v.y - 30, vx: -v.face * rr(1, 2), vy: -2, g: .25, life: 24, col: '#f8c820', sz: 1 }); return; }
  p.cool = w.cd;
  if (p.weapon === 'pistol') { B('b', 7.5, 1); sfx('shot'); }
  else if (p.weapon === 'hmg') { const s = rr(-.06, .06); G.pb.push({ k: 'h', x: mx - dy * rr(-2, 2), y: my + dx * rr(-2, 2), vx: (dx - dy * s) * 8.5, vy: (dy + dx * s) * 8.5, dmg: 1, life: 60 }); sfx('hmg'); fx({ k: 'pt', x: p.x, y: p.y - 18, vx: -p.face * rr(.6, 1.6), vy: -2.2, g: .25, life: 24, col: '#f8c820', sz: 1 }); }
  else if (p.weapon === 'flame') { const s = rr(-.12, .12); G.pb.push({ k: 'f', x: mx, y: my, vx: (dx - dy * s) * 3.6 + p.vx * .6, vy: (dy + dx * s) * 3.6, dmg: .55, life: 26, max: 26, pierce: 1, hit: new Set() }); sfx('flame'); }
  else { B('r', 2, 10, { ax: dx * .35, ay: dy * .35, life: 90 }); sfx('rocket'); p.shootT = 8; }
  if (w.ammo && --p.ammo <= 0) { p.weapon = 'pistol'; }
}
function grenade() {
  const p = G.pl, v = p.veh;
  if (v) { if (v.shells <= 0 || p.cool > 12) return; v.shells--; const [mx, my, dx, dy] = muzzle(); G.pb.push({ k: 'c', x: mx, y: my, vx: dx * 6.5, vy: dy * 6.5, dmg: 16, life: 80 }); sfx('rocket'); shake(3); fx({ k: 'mz', x: mx, y: my, t: 0 }); fxSmoke(mx, my, 2); return; }
  if (p.gren <= 0) return; p.gren--; sfx('throw');
  G.pb.push({ k: 'g', x: p.x + p.face * 6, y: p.y - 22, vx: p.face * 2.5 + p.vx * .4, vy: -4.1, dmg: 12, life: 110, grav: .22, b: 1 });
}

// ───────── 아군 탄 ─────────
function updBullets() {
  for (const b of G.pb) {
    if (b.ax) { b.vx += b.ax; b.vy += b.ay; if (G.t % 2 === 0) fxSmoke(b.x - b.vx, b.y - b.vy, 1, 0, .1); }
    if (b.grav) b.vy += b.grav;
    b.x += b.vx; b.y += b.vy; b.life--;
    if (b.k === 'g') { if (b.y >= GY - 2) { if (b.b-- > 0) { b.y = GY - 2; b.vy *= -.45; b.vx *= .6; } else b.life = 0; } }
    else if (b.y >= GY) { b.life = 0; b.y = GY; if (b.k !== 'f') fxPt(b.x, GY - 1, 2, '#d8c8a0', 1.5, 10); }
    if (b.x < G.cam - 20 || b.x > G.cam + W + 20 || b.y < -30) { b.life = -1; continue; }
    let hit = false;
    for (const e of G.en) {
      if (e.dead || !e.awake || e.x < G.cam - 30 || e.x > G.cam + W + 24) continue;
      if (Math.abs(b.x - e.x) < e.w / 2 + 2 && b.y > e.y - e.h - 2 && b.y < e.y + 1) {
        if (b.pierce) { if (b.hit.has(e)) continue; b.hit.add(e); damageEnemy(e, b.dmg * 2.2, { burn: 1 }); continue; }
        if (b.k !== 'r' && b.k !== 'c' && b.k !== 'g') damageEnemy(e, b.dmg, { dir: sgn(b.vx || 1) }); hit = true; break;
      }
    }
    if (!hit) for (const q of G.props) {
      if (q.dead || Math.abs(b.x - q.x) > q.w / 2 + 2 || b.y < q.y - q.h || b.y > q.y) continue;
      if (b.pierce) { if (!b.hit.has(q)) { b.hit.add(q); hitProp(q, b.dmg * 2.2); } if (q.solid) { b.life = Math.min(b.life, 3); } continue; }
      if (b.k !== 'r' && b.k !== 'c' && b.k !== 'g') hitProp(q, b.dmg); hit = true; break;
    }
    if (!hit) for (const w of G.pows) if (w.st === 'tied' && !w.hidden && Math.abs(b.x - w.x) < 9 && b.y > w.y - 26 && b.y < w.y) { freePow(w); if (!b.pierce) hit = true; break; }
    if (!hit && G.boss) hit = bossHit(b);
    if (hit && !b.pierce) { b.life = 0; if (b.k === 'b' || b.k === 'h' || b.k === 'v') { fxPt(b.x, b.y, 3, ['#fffbe8', '#ffe45c'], 2, 8, 0); } }
    if (b.life === 0 && (b.k === 'r' || b.k === 'c' || b.k === 'g')) boom(b.x, b.y - (b.k === 'g' ? 6 : 0), 'm', { dmg: b.dmg, r: b.k === 'g' ? 34 : 30 });
  }
  G.pb = G.pb.filter(b => b.life > 0);
}

// ───────── 부서지는 사물 ─────────
const PROPDEF = { crate: [18, 23, 3], barrel: [14, 23, 2], sandbag: [30, 23, 9], tower: [34, 78, 16], hut: [62, 48, 26], gate: [28, 94, 60] };
function addProp(k, x, o = {}) { const d = PROPDEF[k], q = Object.assign({ k, x, y: GY, w: d[0], h: d[1], hp: d[2], flash: 0, solid: k !== 'crate' && k !== 'barrel' }, o); G.props.push(q); return q; }
function hitProp(q, dmg) {
  if (q.dead) return; q.hp -= dmg; q.flash = 3; sfx(q.k === 'gate' ? 'clang' : 'hit');
  if (q.k === 'tower' || q.k === 'hut' || q.k === 'crate') fxPt(q.x + rr(-8, 8), q.y - rr(4, q.h), 2, WD.slice(2), 2, 14);
  if (q.hp > 0) return; q.dead = true;
  const cy = q.y - q.h / 2;
  if (q.k === 'crate') { fxDeb(q.x, cy, SP.plank, 5, 2.4); fxSmoke(q.x, cy, 2); sfx('boom'); addScore(100); if (q.drop) dropItem(q.drop, q.x, q.y - 10); }
  else if (q.k === 'barrel') { G.timers.push({ t: 5, fn: () => { boom(q.x, cy, 'l', { dmg: 14, r: 42 }); fxDeb(q.x, cy, SP.plate[0], 3, 3); } }); addScore(200); }
  else if (q.k === 'sandbag') { fxPt(q.x, cy, 22, TAN, 3, 30); fxSmoke(q.x, cy, 3); sfx('boom'); addScore(100); }
  else if (q.k === 'tower') {
    for (let i = 0; i < 6; i++) G.timers.push({ t: i * 5, fn: () => { boom(q.x + rr(-12, 12), q.y - i * 14 - 6, i % 2 ? 'm' : 's'); fxDeb(q.x, q.y - i * 14, SP.plank, 4, 3); } });
    if (q.pl) q.pl.dead = true; addScore(500); fxText('500', q.x, q.y - 80);
    for (const e of G.en) if (e.prop === q && !e.dead) { e.prop = null; killEnemy(e, { blast: 1, dir: -1 }); }
  }
  else if (q.k === 'hut') {
    for (let i = 0; i < 5; i++) G.timers.push({ t: i * 4, fn: () => { boom(q.x + rr(-26, 26), q.y - rr(6, 40), i === 4 ? 'l' : 'm'); fxDeb(q.x + rr(-20, 20), q.y - 24, i % 2 ? SP.plank : SP.plate[2], 5, 3.2); } });
    addScore(800); fxText('800', q.x, q.y - 54); for (const w of G.pows) if (w.prop === q) w.hidden = false;
  }
  else if (q.k === 'gate') { for (let i = 0; i < 8; i++) G.timers.push({ t: i * 5, fn: () => { boom(q.x + rr(-10, 10), q.y - rr(6, 90), i === 7 ? 'l' : 'm'); fxDeb(q.x, q.y - rr(10, 80), SP.plate, 4, 3.6); } }); addScore(1500); fxText('1500', q.x, q.y - 100); }
}

// ───────── 포로(취사병) ─────────
function addPow(x, item, o = {}) { const w = Object.assign({ x, y: GY, st: 'tied', t: 0, item, hidden: false }, o); G.pows.push(w); return w; }
function freePow(w) { w.st = 'joy'; w.t = 0; G.saved++; addScore(1000); sfx('rope'); sfx('thanks'); fxText('1000', w.x, w.y - 44); fxPt(w.x, w.y - 12, 8, ['#d8c890', '#f0f0e4'], 2); }
function updPows() {
  const p = G.pl;
  for (const w of G.pows) {
    w.t++; if (w.hidden) continue;
    if (w.st === 'tied') { if (!p.dead && Math.abs(p.x - w.x) < 14 && Math.abs(p.y - w.y) < 30) freePow(w); }
    else if (w.st === 'joy') { if (w.t > 44) { w.st = 'salute'; w.t = 0; w.face = sgn(p.x - w.x); } }
    else if (w.st === 'salute') { if (w.t > 56) { w.st = 'give'; w.t = 0; } }
    else if (w.st === 'give') { if (w.t === 8) { const it = dropItem(w.item, w.x + w.face * 10, w.y - 16); it.vx = w.face * 1.2; it.vy = -3; sfx('item'); } if (w.t > 30) { w.st = 'run'; w.t = 0; } }
    else if (w.st === 'run') { w.x -= 2.3; if (w.x < G.cam - 30) w.st = 'gone'; }
  }
}
function drawPows() {
  for (const w of G.pows) {
    if (w.hidden || w.st === 'gone' || !onScr(w.x, 40)) continue; const S = SP.pow; let c, fl = false;
    if (w.st === 'tied') { spr(SP.post, w.x - 9, w.y - 30); c = S.tied[(w.t >> 4) % 2]; if ((w.t >> 5) % 4 === 0) T('살려줘!', w.x - G.camI, w.y - 46, { s: 7, a: .5, c: '#ffffff' }); }
    else if (w.st === 'joy') c = S.joy[(w.t >> 3) % 2];
    else if (w.st === 'salute') { c = S.salute[w.t > 28 ? 1 : 0]; fl = w.face < 0; T(w.t > 28 ? '충성!' : '고맙습니다!', w.x - G.camI, w.y - 50, { s: 8, a: .5, c: '#fff8a0' }); }
    else if (w.st === 'give') { c = S.give; fl = w.face < 0; }
    else { c = S.run[(w.t >> 2) % 8]; fl = true; }
    spr(c, w.x - (fl ? 22 : 21), w.y - 41, fl);
  }
}

// ───────── 아이템 ─────────
const ITEMNAME = { hmg: '중', flame: '화', rocket: '로', gren: '폭' };
function dropItem(k, x, y) { const it = { k, x, y, vx: 0, vy: -2.5, t: 0 }; G.items.push(it); return it; }
function banner(s, c) { G.banner = { s, c: c || '#ffe45c', t: 100 }; }
function updItems() {
  const b = plBox();
  for (const it of G.items) {
    it.t++; it.vy += .2; it.x += it.vx; it.y += it.vy; if (it.chute) it.vy = Math.min(it.vy, .8);
    if (it.y >= GY - 8) { it.y = GY - 8; it.vy = 0; it.vx = 0; it.chute = 0; }
    it.x = clamp(it.x, G.cam + 10, G.cam + W - 10);
    if (!G.pl.dead && it.x > b.x0 - 9 && it.x < b.x1 + 9 && it.y > b.y0 - 8 && it.y < b.y1 + 8) {
      it.dead = true; const p = G.pl;
      if (WP[it.k]) { p.weapon = it.k; p.ammo = WP[it.k].ammo; sfx('power'); banner(WP[it.k].name + '!'); addScore(100); if (p.veh) { p.veh.shells += 5; } }
      else if (it.k === 'gren') { p.gren += 10; if (p.veh) p.veh.shells += 8; sfx('item'); banner('수류탄 보급!', '#a8d0ff'); }
      else { const s = { medal: 500, can: 300, gem: 1000 }[it.k]; addScore(s); fxText(String(s), it.x, it.y - 10); sfx('item'); }
    }
    if (it.t > 1100) it.dead = true;
  }
  G.items = G.items.filter(i => !i.dead);
}
function drawItems() {
  for (const it of G.items) {
    if (it.t > 900 && (it.t >> 2) & 1) continue; const c = SP.item[it.k], bob = it.vy === 0 ? Math.round(Math.sin(it.t * .12) * 1.5) : 0;
    if (it.chute) spr(SP.chute, it.x - 17, it.y - 40);
    spr(c, it.x - (c.width >> 1), it.y - (c.height >> 1) + bob);
    if (ITEMNAME[it.k]) T(ITEMNAME[it.k], it.x - G.camI + .5, it.y - 6.5 + bob, { s: 9, a: .5, c: '#ffffff', c2: '#ffe8a0' });
  }
}

// ───────── 그리기: 주인공·탈것·탄·효과 ─────────
function drawPlayer() {
  const p = G.pl; if (p.veh) return;
  if (p.dead) { if (p.dead > 60 && (p.dead >> 1) & 1) return; const c = SP.heroDie[Math.min(3, p.dead >> 3)]; spr(c, p.x - (p.face < 0 ? 22 : 21), p.y - 41, p.face < 0); return; }
  if (p.inv > 0 && (p.inv >> 1) & 1) return;
  const leg = !p.ground ? 'j' : p.crouch ? 'c' : (p.vx ? 'r' + ((p.runT >> 2) % 8) : 'i'), aim = p.ay < 0 ? (p.ax ? 'uf' : 'u') : p.ay > 0 ? (p.ax ? 'df' : 'd') : 'f';
  spr(heroSpr(leg, aim, p.shootT > 1 ? 2 : 0, WP[p.weapon].gun), p.x - (p.face < 0 ? 22 : 21), p.y - 41, p.face < 0);
}
function drawVeh() {
  const v = G.veh; if (!v) return; const f = v.face, mv = v.occ && (G.pl.vx !== 0 || !G.pl.ground), air = v.occ && !G.pl.ground;
  const bob = v.occ ? Math.round(Math.sin(v.legT * .25) * 1.5) : Math.round(Math.sin(G.t * .06)), by = v.y - 30 + bob, wh = v.flash > 0;
  if (v.occ && G.pl.inv > 60 && (G.pl.inv >> 1) & 1) return;
  for (const i of [0, 1]) {
    const ph = v.legT * .25 + i * PI, fx_ = v.x + (i ? 5 : -5) * f + (mv && !air ? Math.sin(ph) * 8 * f : 0), fy = v.y - (mv && !air ? Math.max(0, Math.cos(ph)) * 6 : 0) + (air ? -3 + i * 3 : 0);
    const hx = v.x + (i ? 3 : -3) * f, hy = by + 6, kx = (hx + fx_) / 2 - f * 7, ky = (hy + fy) / 2 - 2;
    limb(hx, hy, kx, ky, 4, i ? GN[2] : GN[1], i ? GN[4] : 0); limb(kx, ky, fx_ - f * 2, fy - 5, 3, i ? BK[3] : BK[2]); spr(SP.wfoot, fx_ - 8, fy - 8, f < 0);
  }
  const px = v.x + f * 5, pyy = by + 2, dx = Math.cos(v.aim), dy = Math.sin(v.aim), rc = G.pl.shootT > 1 && v.occ ? 2 : 0;
  spr(SP.walker, v.x - 22, by - 18, f < 0, wh);
  limb(px, pyy, px + dx * (19 - rc), pyy + dy * (19 - rc), 5, BK[2], BK[4]); L(px + dx * (15 - rc), pyy + dy * (15 - rc), px + dx * (19 - rc), pyy + dy * (19 - rc), '#f8c820', 3);
  R(px - 3, pyy - 3, 6, 6, OL); R(px - 2, pyy - 2, 4, 4, GN[3]);
  if (v.occ) { spr(SP.heroHead, v.x + f * 6 - 6, by - 15, f < 0); R(v.x + f * 9, by - 12, 2, 1, GL[3]); }
  else if ((G.t >> 4) & 1) T('▼ 탑승', v.x - G.camI, v.y - 66, { s: 8, a: .5, c: '#a8f0a0' });
}
function drawBullets() {
  for (const b of G.pb) {
    const n = Math.hypot(b.vx, b.vy) || 1, ux = b.vx / n, uy = b.vy / n;
    if (b.k === 'b') { L(b.x - ux * 6, b.y - uy * 6, b.x, b.y, '#ff9a20', 2); L(b.x - ux * 3, b.y - uy * 3, b.x, b.y, '#fffbe8', 2); }
    else if (b.k === 'h' || b.k === 'v') { const t = b.k === 'v' ? 3 : 2; L(b.x - ux * 11, b.y - uy * 11, b.x, b.y, '#e04018', t); L(b.x - ux * 8, b.y - uy * 8, b.x, b.y, '#ffe45c', t); L(b.x - ux * 3, b.y - uy * 3, b.x, b.y, '#fffbe8', t); }
    else if (b.k === 'f') { const c = SP.flame[Math.min(5, Math.floor((1 - b.life / b.max) * 6))]; g.drawImage(c, Math.round(b.x - c.width / 2), Math.round(b.y - c.height / 2)); }
    else if (b.k === 'r' || b.k === 'c') { const c = (b.k === 'r' ? SP.rocket : SP.missile)[(Math.round(Math.atan2(uy, ux) / (PI / 4)) + 8) % 8]; g.drawImage(c, Math.round(b.x - c.width / 2), Math.round(b.y - c.height / 2)); R(b.x - ux * 8 - 1, b.y - uy * 8 - 1, 3, 3, (G.t & 2) ? '#ffe45c' : '#ff9a20'); }
    else if (b.k === 'g') { const c = SP.gren[(b.life >> 2) % 8]; g.drawImage(c, Math.round(b.x - 5), Math.round(b.y - 5)); }
  }
}
function updFx() {
  for (const f of G.fx) {
    switch (f.k) {
      case 'ex': if (++f.t >= f.fr.length * f.sp) f.dead = 1; break;
      case 'pt': f.x += f.vx; f.y += f.vy; f.vy += f.g; if (--f.life <= 0) f.dead = 1; break;
      case 'sm': f.x += f.vx; f.y += f.vy; f.vx *= .96; if (++f.life >= f.max) f.dead = 1; break;
      case 'mz': if (++f.t > 3) f.dead = 1; break;
      case 'txt': f.y -= .5; if (--f.life <= 0) f.dead = 1; break;
      case 'deb': f.x += f.vx; f.y += f.vy; f.vy += .22; f.ri += f.spin; { const gy = GY - (f.gr || 3); if (f.y > gy && f.vy > 0) { if (f.b-- > 0) { f.vy *= -.45; f.vx *= .6; f.y = gy; if (f.gr) { sfx('clang'); shake(3); } } else { f.vy = 0; f.vx = 0; f.spin = 0; f.y = gy; f.life = Math.min(f.life, 40); } } } if (--f.life <= 0) f.dead = 1; break;
      case 'corpse': updCorpse(f); break;
      case 'ring': if (++f.t > 16) f.dead = 1; break;
      case 'up': f.y += f.vy; f.vy -= .15; if (G.t % 2 === 0) fxSmoke(f.x, f.y + 8, 1, .5, .2); if (f.y < -30) f.dead = 1; break;
      case 'pilot': f.x += f.vx; f.y += f.vy; f.t++; if (f.t > 70) { f.dead = 1; fx({ k: 'star', x: f.x, y: f.y, t: 0 }); sfx('twinkle'); } break;
      case 'star': if (++f.t > 30) f.dead = 1; break;
    }
  }
  if (G.fx.length > 700) G.fx.splice(0, G.fx.length - 700);
  G.fx = G.fx.filter(f => !f.dead);
}
function drawFx(layer) {
  for (const f of G.fx) {
    if ((f.k === 'corpse' || f.k === 'deb') !== (layer === 0)) continue;
    switch (f.k) {
      case 'ex': { const c = f.fr[Math.floor(f.t / f.sp)]; g.drawImage(c, Math.round(f.x - c.width / 2), Math.round(f.y - c.height / 2)); break; }
      case 'pt': R(f.x, f.y, f.sz, f.sz, f.col); break;
      case 'sm': { const c = SP.smoke[Math.min(5, Math.floor(f.life / f.max * 6))]; if (f.life / f.max > .7 && (f.life & 1)) break; g.drawImage(c, Math.round(f.x - c.width / 2), Math.round(f.y - c.height / 2)); break; }
      case 'mz': { const c = SP.muzzle[f.t >> 1]; if (c) g.drawImage(c, Math.round(f.x - 4), Math.round(f.y - 4)); break; }
      case 'txt': T(f.s, f.x - G.camI, f.y, { s: 8, a: .5, c: f.c }); break;
      case 'deb': { if (f.life < 30 && (f.life & 2)) break; const c = f.fr[((Math.floor(f.ri) % f.fr.length) + f.fr.length) % f.fr.length]; g.drawImage(c, Math.round(f.x - c.width / 2), Math.round(f.y - c.height / 2)); break; }
      case 'corpse': drawCorpse(f); break;
      case 'ring': for (let a = 0; a < 40; a++) { const an = a / 40 * PI * 2, r = 8 + f.t * 3.2; if ((a + f.t) % 3) R(f.x + Math.cos(an) * r, f.y + Math.sin(an) * r * .22, 2, 2, f.t > 10 ? '#a89878' : '#f0e8d0'); } break;
      case 'up': { const c = SP.missile[6]; g.drawImage(c, Math.round(f.x - 9), Math.round(f.y - 9)); R(f.x - 1, f.y + 8, 3, 4, (G.t & 2) ? '#ffe45c' : '#ff9a20'); break; }
      case 'pilot': { const c = SP.sold.rifle.spin[(f.t >> 1) % 8]; g.drawImage(c, Math.round(f.x - 22), Math.round(f.y - 28)); break; }
      case 'star': { if ((f.t >> 1) & 1) g.drawImage(SP.star, Math.round(f.x - 4), Math.round(f.y - 4)); break; }
    }
  }
}
