// ───────── 보스: 거대 기갑요새 '철왕게' ─────────
const BOSSHP = 800;
const BSEQ = [['cannon', 'claw'], ['missile', 'claw', 'laser', 'cannon'], ['flame', 'claw', 'laser', 'missile', 'cannon']];
function spawnBoss() {
  const hx = BOSSCAM + 362, x = hx + 250;
  G.boss = {
    x, hx, y: 112, hp: BOSSHP, phase: 0, st: 'enter', t: 0, flash: 0, atk: 0, n: 0,
    claw: { x: x - 128, y: 150, open: 1, st: 'idle', t: 0, tx: 0 },
    feet: [-82, -36, 36, 84].map(o => ({ o, x: x + o, lift: 0, t: -1, sx: 0, ex: 0 })),
    parts: { pod: 1, cannon: 1, claw: 1, legB: 1, legF: 1, eye: 1 }, can: { a: -2.3, rec: 0 }, podOpen: 0, las: null, waves: [], flames: [], nextDrop: 200, eyePop: 0, vy: 0,
  };
  music('boss');
}
function bossDamage(dmg, x, y) {
  const b = G.boss; if (!b || b.st === 'enter' || b.st === 'stagger' || b.st === 'die') return;
  b.hp -= dmg; b.flash = 2; sfx('clang'); addScore(Math.ceil(dmg * 5));
  if (b.hp <= 0) {
    b.hp = 0; b.st = 'die'; b.t = 0; b.las = null; b.claw.st = 'idle'; G.haz = []; G.eb = []; music(null); G.hitstop = 24; G.flash = 8; sfx('roar'); G.pl.inv = Math.max(G.pl.inv, 60);
  } else if (b.phase < 2 && b.hp <= BOSSHP * (b.phase === 0 ? .66 : .33)) { b.st = 'stagger'; b.t = 0; b.las = null; b.podOpen = 0; if (b.claw.st !== 'idle') b.claw.st = 'back'; b.flames = []; }
}
function bossBlast(x, y, r, dmg) {
  const b = G.boss, c = b.claw;
  if ((Math.abs(x - b.x) < 104 + r && y > b.y - 84 - r) || (b.parts.claw && Math.abs(x - (c.x - 28)) < 36 + r && Math.abs(y - c.y) < 26 + r)) bossDamage(dmg, x, y);
}
function bossHit(q) {
  const b = G.boss, c = b.claw, ex = q.k === 'r' || q.k === 'c' || q.k === 'g'; let m = 0;
  const dx = q.x - (b.x - 86), dy = q.y - (b.y + 3);
  if (dx * dx + dy * dy < 17 * 17) m = 2;
  else if (b.parts.claw && q.x > c.x - 62 && q.x < c.x + 10 && Math.abs(q.y - c.y) < 25) m = c.st === 'stuck' ? 1.6 : 1;
  else if (((q.x - b.x) / 104) ** 2 + ((q.y - b.y - 7) / (q.y < b.y + 7 ? 62 : 40)) ** 2 < 1) m = 1;
  else if (Math.abs(q.x - b.x + 10) < 30 && q.y < b.y - 40 && q.y > b.y - 84) m = 1;
  else if (Math.abs(q.x - b.x) < 94 && q.y >= b.y + 38) m = .75;
  if (!m) return false;
  if (ex) return true;
  if (q.pierce) { if (!q.hit.has(b)) { q.hit.add(b); bossDamage(q.dmg * 2.2 * m, q.x, q.y); } q.life = Math.min(q.life, 4); return false; }
  bossDamage(q.dmg * m, q.x, q.y); if (m === 2) fxPt(q.x, q.y, 4, ['#fffbe8', '#80f080', '#ffe45c'], 3, 12);
  return true;
}
function updBoss() {
  const b = G.boss; if (!b) return; const p = G.pl, c = b.claw, ph = b.phase;
  b.t++; if (b.flash > 0) b.flash--; if (b.can.rec > 0) b.can.rec--;
  // 다리 걸음
  const grpBusy = k => b.feet.some((f, i) => (i & 1) === k && f.t >= 0);
  b.feet.forEach((f, i) => {
    const want = b.x + f.o;
    if (f.t < 0 && Math.abs(want - f.x) > 20 && !grpBusy((i & 1) ^ 1)) { f.t = 0; f.sx = f.x; f.ex = want + sgn(want - f.x) * 14; }
    if (f.t >= 0) { f.t++; const k = f.t / 13; f.x = f.sx + (f.ex - f.sx) * k; f.lift = Math.sin(k * PI) * 16; if (f.t >= 13) { f.t = -1; f.lift = 0; if (b.st !== 'die') { sfx('step'); shake(3); fxDust(f.x, GY, 6); } } }
  });
  // 집게팔
  c.t++;
  if (c.st === 'idle') { c.x += (b.x - 128 + Math.sin(G.t * .03) * 7 - c.x) * .1; c.y += (b.y + 40 + Math.sin(G.t * .05) * 5 - c.y) * .1; c.open = G.t % 130 < 16 ? 0 : 1; }
  else if (c.st === 'raise') { c.tx = clamp(p.x, b.x - 336, b.x - 152); c.x += (c.tx + 30 - c.x) * .16; c.y += (58 - c.y) * .14; c.open = 1; if (c.t > 44) { c.st = 'hold'; c.t = 0; sfx('warn'); } }
  else if (c.st === 'hold') { c.x += (c.tx + 30 - c.x) * .3; c.y = 58 + ((c.t >> 1) & 1) * 2; if (c.t > (ph === 2 ? 19 : 26)) { c.st = 'slam'; c.t = 0; } }
  else if (c.st === 'slam') {
    c.y += 30; if (c.y >= GY - 24) {
      c.y = GY - 24; c.st = 'stuck'; c.t = 0; c.open = 0; sfx('slam'); shake(10); G.hitstop = 3; fx({ k: 'ring', x: c.tx, y: GY - 2, t: 0 }); fxDust(c.tx, GY, 16); fxDeb(c.tx, GY - 6, SP.plate[2], 3, 3);
      if (Math.abs(p.x - c.tx) < 31 && p.y > GY - 36) hurtPlayer(6);
    }
  }
  else if (c.st === 'stuck') { if (c.t > (ph === 2 ? 40 : 54)) { c.st = 'back'; c.t = 0; } }
  else if (c.st === 'back') { c.x += (b.x - 128 - c.x) * .12; c.y += (b.y + 40 - c.y) * .12; if (c.t > 26) { c.st = 'idle'; } }
  // 화염 줄기
  for (const f of b.flames) { f.x += f.vx; f.y += f.vy; if (f.y > GY - 6) { f.y = GY - 6; f.vy = -rr(0, .5); } f.life--; }
  b.flames = b.flames.filter(f => f.life > 0);
  for (const w of b.waves) { w.x -= 3.2; if (G.t % 2 === 0) fx({ k: 'pt', x: w.x + rr(-4, 4), y: GY - rr(2, 16), vx: rr(.2, 1), vy: rr(-1.2, -.4), g: -.02, life: 14, col: pick(['#ffe45c', '#ff9a20', '#e04018']), sz: 2 }); if (Math.abs(p.x - w.x) < (p.veh ? 16 : 9) && p.y > GY - 18) hurtPlayer(5); if (w.x < G.cam - 20) w.dead = 1; }
  b.waves = b.waves.filter(w => !w.dead);
  const lo = G.cam + 16, hi = b.x - 128;
  switch (b.st) {
    case 'enter': b.x -= .95; if (b.x <= b.hx) { b.x = b.hx; b.st = 'idle'; b.t = 0; sfx('roar'); shake(8); } break;
    case 'idle':
      if (ph === 2) b.x += (b.hx - 14 + Math.sin(G.t * .02) * 10 - b.x) * .05;
      if (b.t > [80, 58, 40][ph] && !p.dead && c.st === 'idle') { const sq = BSEQ[ph]; b.st = sq[b.atk++ % sq.length]; b.t = 0; b.n = 0; if (b.st === 'claw') { c.st = 'raise'; c.t = 0; } }
      break;
    case 'claw': if (c.st === 'idle') { b.st = 'idle'; b.t = 0; } break;
    case 'cannon': {
      const n = [3, 4, 5][ph]; b.can.a += (-2.25 - b.can.a) * .2;
      if (b.t % 26 === 8 && b.n < n) {
        b.can.rec = 8; sfx('boom'); shake(3); const mx = b.x - 10 + Math.cos(b.can.a) * 32, my = b.y - 66 + Math.sin(b.can.a) * 32; fxSmoke(mx, my, 3); fx({ k: 'mz', x: mx, y: my, t: 0 }); fxEx(mx, my, 's');
        G.haz.push({ x: clamp(b.n === 0 ? p.x : p.x + rr(-64, 64), lo, hi), t: 64, r: 24, k: 's' }); b.n++;
      }
      if (b.t > n * 26 + 46) { b.st = 'idle'; b.t = 0; }
      break;
    }
    case 'missile': {
      const n = ph === 1 ? 6 : 8; if (b.t === 1) { b.podOpen = 1; sfx('warn'); }
      if (b.t >= 22 && (b.t - 22) % 9 === 0 && b.n < n) {
        fx({ k: 'up', x: b.x + 52 + (b.n % 3) * 10, y: b.y - 70, vy: -2 }); sfx('rocket');
        const x = b.n === 2 ? p.x : lo + ((b.n * 3) % n + rnd()) * (hi - lo) / n; G.haz.push({ x: clamp(x, lo, hi), t: 84 + b.n * 7, r: 22, k: 'm' }); b.n++;
      }
      if (b.t > 22 + n * 9 + 70) { b.podOpen = 0; b.st = 'idle'; b.t = 0; }
      break;
    }
    case 'laser': {
      const ex = b.x - 92, ey = b.y + 3, lx = b.x - 168;
      if (b.t === 1) { sfx('charge'); b.las = { x: lx, on: 0 }; }
      if (b.t < 70) { if (b.t % 2 === 0) { const a = rnd() * PI * 2, r = rr(18, 30); fx({ k: 'pt', x: ex + Math.cos(a) * r, y: ey + Math.sin(a) * r, vx: -Math.cos(a) * r / 12, vy: -Math.sin(a) * r / 12, g: 0, life: 12, col: pick(['#ff6040', '#fffbe8', '#ffe45c']), sz: 2 }); } }
      else if (b.t < (ph === 2 ? 126 : 106)) {
        if (b.t === 70) { sfx('laser'); b.las.on = 1; shake(5); }
        fxPt(lx, GY - 2, 2, ['#ffe45c', '#ff9a20', '#fffbe8'], 3, 14);
        if (b.t === 72 || (ph === 2 && b.t === 120)) b.waves.push({ x: lx - 6 });
        const bx = plBox(); for (let k = 0; k <= 1; k += .02) { const x = lx + (ex - lx) * k, y = GY + (ey - GY) * k; if (x > bx.x0 - 3 && x < bx.x1 + 3 && y > bx.y0 - 2 && y < bx.y1 + 2) { hurtPlayer(6); break; } }
      } else { b.las = null; if (b.t > (ph === 2 ? 170 : 150)) { b.st = 'idle'; b.t = 0; } }
      break;
    }
    case 'flame': {
      const nx = b.x - 82, ny = b.y + 36;
      if (b.t < 56) { if (b.t % 14 === 1) sfx('warn'); if (b.t % 3 === 0) fxPt(nx, ny, 1, ['#ffe45c', '#ff9a20'], 2, 10); }
      else if (b.t < 146) {
        if (b.t % 5 === 0) sfx('flame');
        for (let i = 0; i < 2; i++) b.flames.push({ x: nx, y: ny, vx: -rr(3.4, 5.6), vy: rr(.6, 1.8), life: ri(26, 36), max: 36 });
        if (p.x > b.x - 276 && p.y > GY - 46) hurtPlayer(5);
      } else { b.st = 'idle'; b.t = 0; }
      break;
    }
    case 'stagger':
      if (b.t === 1) { sfx('roar'); G.hitstop = 10; }
      if (b.t % 6 === 0) boom(b.x + rr(-90, 90), b.y + rr(-50, 40), pick(['m', 'm', 'l']));
      if (b.t === 44) { b.phase++; G.flash = 8; shake(14); fxDeb(b.x, b.y - 20, SP.plate, 22, 5); sfx('bigboom'); banner(b.phase === 1 ? '장갑 파괴! 미사일 주의!' : '핵심부 노출! 마지막이다!', '#ff6040'); }
      if (b.t > 110) { b.st = 'idle'; b.t = 30; }
      break;
    case 'die': bossDie(b); break;
  }
  // 보급 투하
  if (b.st !== 'enter' && b.st !== 'die' && --b.nextDrop <= 0) { b.nextDrop = 780; const it = dropItem(pick(['hmg', 'rocket', 'gren', 'hmg', 'flame']), G.cam + rr(60, 200), -16); it.chute = 1; it.vy = .8; banner('보급품 투하!', '#a8d0ff'); }
  if (ph >= 1 && b.st !== 'die' && G.t % 5 === 0) fxSmoke(b.x + rr(-70, 80), b.y - rr(20, 60), 1, -.9);
  if (ph >= 2 && b.st !== 'die' && G.t % 3 === 0) fx({ k: 'pt', x: b.x + rr(-80, 80), y: b.y - rr(0, 50), vx: rr(-.3, .3), vy: rr(-1.6, -.6), g: -.02, life: 18, col: pick(['#ffe45c', '#ff9a20', '#e04018']), sz: 2 });
}
function bossDie(b) {
  const t = b.t, P_ = b.parts, c = b.claw;
  if (t < 330 && t % 7 === 0) boom(b.x + rr(-95, 95), b.y + rr(-55, 45), pick(['s', 'm', 'm']));
  if (t === 26) { P_.pod = 0; boom(b.x + 64, b.y - 64, 'l'); fx({ k: 'deb', x: b.x + 64, y: b.y - 64, vx: 2.4, vy: -6, fr: SP.podRot, ri: 0, spin: .3, b: 2, life: 200, gr: 12 }); }
  if (t === 62) { P_.cannon = 0; boom(b.x - 10, b.y - 68, 'l'); fxDeb(b.x - 10, b.y - 70, SP.plate, 8, 5); }
  if (t === 98) { P_.claw = 0; boom(c.x - 20, c.y, 'l'); fx({ k: 'deb', x: c.x - 30, y: c.y, vx: -2.2, vy: -5.5, fr: SP.clawRot, ri: 0, spin: -.25, b: 2, life: 240, gr: 16 }); fxDeb(c.x, c.y, SP.plate, 6, 4); }
  if (t === 136) { P_.legB = 0; boom(b.x - 40, b.y + 70, 'l'); boom(b.x + 40, b.y + 70, 'm'); b.y += 8; shake(8); fxDeb(b.x, b.y + 70, SP.plate, 8, 4); }
  if (t === 172) { P_.legF = 0; boom(b.x - 84, b.y + 70, 'l'); boom(b.x + 84, b.y + 70, 'l'); fxDeb(b.x, b.y + 70, SP.plate, 10, 4); b.fall = 1; }
  if (b.fall === 1) { b.vy += .5; b.y += b.vy; if (b.y >= GY - 46) { b.y = GY - 46; b.fall = 2; sfx('slam'); shake(16); fxDust(b.x - 60, GY, 20); fxDust(b.x + 40, GY, 20); fx({ k: 'ring', x: b.x - 40, y: GY - 2, t: 0 }); } }
  if (t === 215) { b.eyePop = 1; sfx('boing'); }
  if (b.eyePop) b.eyePop++;
  if (t > 235 && t < 335 && t % 4 === 0) boom(b.x + rr(-100, 100), b.y + rr(-60, 40), pick(['m', 'l', 'm']));
  if (t === 338) {
    boom(b.x, b.y, 'x'); boom(b.x - 60, b.y - 20, 'x'); boom(b.x + 60, b.y + 10, 'x'); G.flash = 26; shake(24); G.hitstop = 6; b.phase = 3; P_.eye = 0; b.eyePop = 0; addScore(50000); fxText('50000', b.x - 60, b.y - 80);
    fxDeb(b.x, b.y - 20, SP.plate, 40, 7); fx({ k: 'deb', x: b.x - 90, y: b.y, vx: -3, vy: -6, fr: [SP.eye[2]], ri: 0, spin: 0, b: 3, life: 300, gr: 12 });
    fx({ k: 'pilot', x: b.x - 20, y: b.y - 50, vx: -1.6, vy: -3.4, t: 0 }); sfx('scream');
  }
  if (t > 338 && t % 4 === 0) fxSmoke(b.x + rr(-80, 80), b.y - rr(10, 50), 1, -1);
  if (t > 338 && t < 420 && t % 9 === 0) boom(b.x + rr(-90, 90), b.y + rr(-40, 30), 'm');
  if (t === 500) { G.state = 'clear'; G.clearT = 0; music('clear'); }
}
function drawBoss(layer) {
  const b = G.boss; if (!b) return; const P_ = b.parts, c = b.claw, p = G.pl, wh = b.flash > 0 && G.t % 4 === 0, dead = b.phase === 3;
  const jit = b.st === 'stagger' || (b.st === 'die' && !dead) ? ((G.t & 1) ? 1 : -1) : 0, bob = dead ? 0 : Math.round(Math.sin(G.t * .05) * 2) + (b.feet.some(f => f.t >= 0) ? 1 : 0), X = b.x + jit, Y = b.y + bob;
  const leg = (f, dark) => {
    const hx = X + f.o * .72, hy = Y + 38, fxx = f.x, fy = GY - f.lift, kx = (hx + fxx) / 2 + sgn(f.o) * 24, ky = (hy + fy) / 2 - 18;
    limb(hx, hy, kx, ky, 9, RD[dark ? 1 : 2], RD[dark ? 2 : 4]); limb(kx, ky, fxx, fy - 12, 7, MT[dark ? 1 : 2], MT[dark ? 2 : 4]); spr(SP.joint, kx - 11, ky - 11); spr(SP.bfoot, fxx - 22, fy - 17, f.o > 0);
  };
  if (layer === 0) {
    if (P_.legB) { leg(b.feet[1], 1); leg(b.feet[2], 1); }
    if (P_.cannon) { const px = X - 10, py = Y - 66, l = 32 - b.can.rec, ex = px + Math.cos(b.can.a) * l, ey = py + Math.sin(b.can.a) * l; limb(px, py, ex, ey, 7, MT[2], MT[4]); limb(ex - Math.cos(b.can.a) * 6, ey - Math.sin(b.can.a) * 6, ex, ey, 9, MT[1], MT[3]); spr(SP.bcannon, X - 34, Y - 79, false, wh); }
    if (P_.pod) spr(SP.pod[b.podOpen], X + 44, Y - 78, false, wh);
    spr(SP.hull[b.phase], X - 108, Y - 63, false, wh);
    // 눈
    const ex = X - 86, ey = Y + 3;
    if (b.eyePop) { const k = Math.min(1, b.eyePop / 10), sp = 34 * k + Math.sin(b.eyePop * .5) * 8 * Math.exp(-b.eyePop * .02), x2 = ex - sp, y2 = ey + Math.sin(b.eyePop * .35) * 6; for (let i = 0; i <= 10; i++) R(ex + (x2 - ex) * i / 10, ey + (y2 - ey) * i / 10 + ((i & 1) ? 3 : -3), 2, 2, MT[4]); g.drawImage(SP.eye[2], Math.round(x2 - 13), Math.round(y2 - 13)); R(x2 - 3, y2 - 3, 6, 6, '#16101c'); R(x2 - 5, y2 - 5, 2, 2, '#fff'); }
    else if (P_.eye) {
      const charging = b.st === 'laser' && b.t < 70; g.drawImage(charging && (G.t & 2) ? whiteOf(SP.eye[2]) : SP.eye[b.phase > 2 ? 2 : b.phase], Math.round(ex - 13), Math.round(ey - 13));
      const a = Math.atan2(p.y - 14 - ey, p.x - ex), qx = ex + Math.cos(a) * 4, qy = ey + Math.sin(a) * 4; g.fillStyle = '#16101c'; g.fillRect(Math.round(qx - 4), Math.round(qy - 3), 8, 6); g.fillRect(Math.round(qx - 3), Math.round(qy - 4), 6, 8); R(qx - 3, qy - 3, 2, 2, '#ffffff');
      if (G.t % 190 < 7 || b.st === 'stagger') R(ex - 12, ey - 12 + (b.st === 'stagger' ? 0 : 0), 24, b.st === 'stagger' ? 14 : 24, RD[1]);
    }
    if (P_.legF) { leg(b.feet[0], 0); leg(b.feet[3], 0); }
    if (b.st === 'flame' && b.t < 56 && (b.t >> 2) & 1) { for (let x = b.x - 276; x < b.x - 104; x += 4) R(x, GY - 3, 2, 2, '#f02828'); T('화염 주의!', b.x - 190 - G.camI, GY - 26, { s: 9, a: .5, c: '#ff6040' }); }
  } else {
    // 레이저
    if (b.las) {
      const ex = X - 92, ey = Y + 3, l = b.las;
      if (!l.on) { if (G.t & 2) for (let k = 0; k < 1; k += .03) R(l.x + (ex - l.x) * k, GY + (ey - GY) * k, 2, 1, '#f02828'); if ((G.t >> 2) & 1) T('레이저! 불길을 뛰어넘어라!', l.x - 70 - G.camI, GY - 40, { s: 9, a: .5, c: '#ff6040' }); }
      else { L(l.x, GY - 1, ex, ey, '#e04018', 7); L(l.x, GY - 1, ex, ey, '#ffe45c', 5); L(l.x, GY - 1, ex, ey, '#fffbe8', (G.t & 1) ? 3 : 1); const s = SP.ex.s[(G.t >> 1) % 4]; g.drawImage(s, Math.round(l.x - 9), GY - 12); }
    }
    for (const w of b.waves) { g.drawImage(SP.ex.m[2 + ((G.t >> 1) % 4)], Math.round(w.x - 17), GY - 28); g.drawImage(SP.flame[1 + ((G.t >> 2) % 3)], Math.round(w.x - 6), GY - 30 - ((G.t >> 1) & 3)); }
    for (const f of b.flames) { const s = SP.flame[Math.min(5, Math.floor((1 - f.life / f.max) * 6))]; g.drawImage(s, Math.round(f.x - s.width / 2), Math.round(f.y - s.height / 2)); }
    if (P_.claw) {
      if (c.st === 'raise' || c.st === 'hold') { for (let i = -28; i < 28; i++) for (let j = -3; j < 3; j++) if ((i + j) & 1 && (i / 28) ** 2 + (j / 3) ** 2 < 1) R(c.tx + i, GY - 2 + j, 1, 1, '#16101c'); if (c.st === 'hold' || (G.t >> 2) & 1) T('위험!', c.tx - G.camI, GY - 30, { s: 10, a: .5, c: '#ff4030', c2: '#ffe45c' }); }
      const sx = X - 66, sy = Y + 22, wx = c.x, wy = c.y, mx = (sx + wx) / 2, my = Math.min(sy, wy) - 24;
      limb(sx, sy, mx, my, 8, RD[2], RD[4]); limb(mx, my, wx, wy, 8, RD[2], RD[4]); spr(SP.joint, mx - 11, my - 11); spr(SP.joint, sx - 11, sy - 11);
      spr(SP.claw[c.open ? 0 : 1], wx - 60, wy - 27, false, wh);
    }
  }
}
