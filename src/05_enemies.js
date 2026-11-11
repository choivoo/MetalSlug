// ───────── 적: 까마귀 군단 보병, 포탑, 전차, 헬기 ─────────
const EDEF = { rifle: [10, 24, 1], gren: [10, 24, 1], knife: [10, 24, 1], bazooka: [10, 24, 2], turret: [26, 24, 14], tank: [54, 30, 45], heli: [62, 30, 75] };
function spawnE(k, x, y, o = {}) {
  const D = EDEF[k], e = Object.assign({ k, x, y: y === undefined ? GY : y, vx: 0, vy: 0, w: D[0], h: D[1], hp: D[2], face: -1, t: 0, st: 'walk', stT: 0, flash: 0, awake: false, cls: D[2] < 3 ? 'sold' : 'mech', pd: rr(95, 180), wait: rr(15, 60), ang: PI, n: 0 }, o);
  if (e.cls === 'sold') e.S = SP.sold[k]; else e.st = 'wait';
  if (k === 'bazooka') { e.fixed = true; e.st = 'wait'; }
  G.en.push(e); return e;
}
function damageEnemy(e, dmg, o = {}) {
  if (e.dead || e.st === 'crash') return; e.hp -= dmg; e.flash = 3;
  if (e.cls === 'mech') { sfx('clang'); addScore(10); }
  if (e.hp <= 0) killEnemy(e, o);
}
function killEnemy(e, o = {}) {
  if (e.dead) return;
  if (e.k === 'heli') { e.st = 'crash'; e.stT = 0; e.vy = -1; sfx('bigboom'); boom(e.x, e.y - 16, 'm'); return; }
  e.dead = true;
  if (e.cls === 'sold') {
    const dir = o.dir || -e.face, mode = o.crush ? 'flat' : o.burn ? 'burn' : (o.blast || e.st === 'para' || e.y < GY - 4 || rnd() < .4) ? 'fly' : 'fall';
    fx({ k: 'corpse', mode, S: e.S, x: e.x, y: e.y, face: mode === 'burn' ? pick([-1, 1]) : -dir, vx: mode === 'fly' ? dir * rr(1.4, o.blast ? 4 : 2.6) : mode === 'fall' ? dir * 1.3 : 0, vy: mode === 'fly' ? rr(-6, -3.6) : 0, t: 0, b: 0 });
    sfx(o.crush ? 'crush' : 'scream'); addScore(100);
    fxDeb(e.x, e.y - 24, SP.feather, 3, 1.6); if (mode !== 'burn' && rnd() < .6) fxDeb(e.x, e.y - 30, SP.helmet, 1, 2.2);
    return;
  }
  if (e.k === 'turret') { boom(e.x, e.y - 10, 'l'); fxDeb(e.x, e.y - 10, SP.plate, 6, 3.4); addScore(500); fxText('500', e.x, e.y - 30); }
  if (e.k === 'tank') {
    for (let i = 0; i < 5; i++) G.timers.push({ t: i * 6, fn: () => { boom(e.x + rr(-22, 22), e.y - rr(4, 28), i === 4 ? 'l' : 'm'); fxDeb(e.x, e.y - 18, SP.plate, 4, 3.8); } });
    addScore(2000); fxText('2000', e.x, e.y - 46); G.wrecks.push({ x: e.x, y: e.y, t: 0, face: e.face });
  }
}
function updCorpse(f) {
  f.t++;
  if (f.mode === 'fly') {
    f.x += f.vx; f.y += f.vy; f.vy += .25;
    if (f.y >= GY && f.vy > 0) { f.y = GY; fxDust(f.x, GY, 4); if (!f.b) { f.b = 1; f.vy *= -.4; f.vx *= .5; } else { f.mode = 'fall'; f.t = 16; f.vx = 0; } }
  } else if (f.mode === 'fall') { f.x += f.vx; f.vx *= .88; if (f.y < GY) { f.vy += .25; f.y = Math.min(GY, f.y + f.vy); } if (f.t > 75) f.dead = 1; }
  else if (f.mode === 'burn') {
    f.x += f.face * 2.3; if (f.t % 18 === 0 && rnd() < .6) f.face = -f.face; if (f.t % 22 === 1) sfx('scream');
    if (f.t % 2 === 0) fx({ k: 'pt', x: f.x + rr(-4, 4), y: f.y - rr(8, 28), vx: rr(-.3, .3), vy: rr(-1.4, -.6), g: -.02, life: 16, col: pick(['#ffe45c', '#ff9a20', '#e04018']), sz: 2 });
    if (f.t > 84) { f.mode = 'ash'; f.t = 0; fxSmoke(f.x, f.y - 10, 4); }
  } else if (f.t > 70) f.dead = 1;
}
function drawCorpse(f) {
  const S = f.S, fl = f.face < 0; let c;
  if (f.mode === 'fly') c = S.spin[(((f.vx > 0 ? -1 : 1) * (f.t >> 1)) % 8 + 8) % 8];
  else if (f.mode === 'fall') { if (f.t > 50 && (f.t & 2)) return; c = f.t < 5 ? S.hit : S.die[Math.min(2, Math.floor((f.t - 5) / 5))]; }
  else if (f.mode === 'burn') c = SP.burn[(f.t >> 1) % 8];
  else if (f.mode === 'ash') { if (f.t > 45 && (f.t & 2)) return; g.drawImage(SP.ash, Math.round(f.x - 6), Math.round(f.y - 6)); return; }
  else { if (f.t > 45 && (f.t & 2)) return; c = S.flat; }
  spr(c, f.x - (fl ? 22 : 21), f.y - 41 - (f.mode === 'fly' ? 8 : 0), fl);
}
function ebul(k, x, y, vx, vy, o) { G.eb.push(Object.assign({ k, x, y, vx, vy, t: 0 }, o)); }
function aimKeyOf(e) { const p = G.pl, a = Math.atan2((p.y - 14) - (e.y - 20), Math.abs(p.x - e.x)); return a < -.4 ? 'uf' : a > .4 ? 'df' : 'f'; }
function updEnemies() {
  const p = G.pl;
  for (const e of G.en) {
    if (e.dead) continue;
    if (!e.awake) { if (onScr(e.x, 6)) e.awake = true; else continue; }
    e.t++; e.stT++; if (e.flash > 0) e.flash--;
    const dx = p.x - e.x, ad = Math.abs(dx), tgt = !p.dead;
    if (e.cls === 'sold') {
      if (e.st === 'para') { e.y += .8; e.x += Math.sin(e.t * .06) * .4; if (e.y >= GY) { e.y = GY; e.st = 'walk'; e.stT = 0; } continue; }
      if (!e.fixed && e.y < GY) { e.vy += GRAV; e.y = Math.min(GY, e.y + e.vy); if (e.y >= GY) e.vy = 0; }
      if (e.st !== 'fire' && e.st !== 'charge') e.face = dx < 0 ? -1 : 1;
      if (e.x < G.cam - 60) { e.dead = true; continue; }
      if (e.k === 'knife') {
        if (e.st === 'walk') { e.x += e.face * 1.0; e.mv = 1; if (ad < 230 && tgt) { e.st = 'charge'; sfx('scream'); } }
        else { if (ad > 26) e.face = dx < 0 ? -1 : 1; e.x += e.face * 2.25; if (tgt && ad < 9 && Math.abs(p.y - e.y) < 24) hurtPlayer(2); }
        continue;
      }
      e.mv = 0;
      if (e.st === 'walk') {
        if (e.fixed) { e.st = 'wait'; e.stT = 0; }
        else if (ad > e.pd || e.x > G.cam + W - 14) { e.x += e.face * .95; e.mv = 1; }
        else if (ad < 46) { e.x -= e.face * .95; e.mv = 1; }
        else { e.st = 'wait'; e.stT = 0; }
      } else if (e.st === 'wait') {
        if (e.stT > e.wait) { if (!e.fixed && (ad > e.pd + 50 || ad < 40)) e.st = 'walk'; else if (tgt && onScr(e.x, -4)) { e.st = 'aim'; e.stT = 0; e.ak = aimKeyOf(e); } }
      } else if (e.st === 'aim') {
        const tel = e.k === 'bazooka' ? 40 : e.k === 'gren' ? 20 : 30;
        if (e.stT > tel) {
          e.st = 'fire'; e.stT = 0;
          if (e.k === 'rifle') { let a = Math.atan2((p.y - 14) - (e.y - 20), dx); if (!e.fixed) { const lim = .45; a = e.face > 0 ? clamp(a, -lim, lim) : (a > 0 ? Math.max(a, PI - lim) : Math.min(a, -PI + lim)); } ebul('b', e.x + e.face * 14, e.y - 20, Math.cos(a) * 2.1, Math.sin(a) * 2.1); sfx('eshot'); }
          else if (e.k === 'gren') { const tt = 56, g_ = .16; ebul('g', e.x + e.face * 4, e.y - 30, clamp(dx / tt, -3.2, 3.2), (p.y - 4 - (e.y - 30)) / tt - .5 * g_ * tt, { g: g_, br: 20 }); sfx('throw'); }
          else { ebul('r', e.x + e.face * 16, e.y - 19, e.face * 2.7, 0, { br: 20 }); sfx('rocket'); }
        }
      } else if (e.st === 'fire') { if (e.stT > 16) { e.st = 'wait'; e.stT = 0; e.wait = e.k === 'rifle' ? rr(60, 130) : rr(95, 160); } }
      continue;
    }
    if (e.k === 'turret') {
      let d = Math.atan2(p.y - 16 - (e.y - 12), dx) - e.ang; while (d > PI) d -= PI * 2; while (d < -PI) d += PI * 2; if (e.st !== 'burst') e.ang += clamp(d, -.04, .04);
      if (e.st === 'wait') { if (e.stT > e.wait && tgt) { e.st = 'aim'; e.stT = 0; } }
      else if (e.st === 'aim') { if (e.stT > 34) { e.st = 'burst'; e.stT = 0; } }
      else { if (e.stT % 9 === 1) { ebul('b', e.x + Math.cos(e.ang) * 18, e.y - 12 + Math.sin(e.ang) * 18, Math.cos(e.ang) * 2.3, Math.sin(e.ang) * 2.3); sfx('eshot'); } if (e.stT > 20) { e.st = 'wait'; e.stT = 0; e.wait = rr(90, 140); } }
    } else if (e.k === 'tank') {
      e.face = dx < 0 ? -1 : 1; e.mv = 0;
      if (ad > 175 || e.x > G.cam + W - 30) { e.x += e.face * .5; e.mv = 1; }
      if (tgt && ad < 30 && p.y > GY - 30) hurtPlayer(4);
      if (e.st === 'wait') { if (e.stT > e.wait && tgt && onScr(e.x, -10)) { e.st = 'aim'; e.stT = 0; } }
      else if (e.st === 'aim') { if (e.stT > 44) { e.st = 'fire'; e.stT = 0; const tt = 72, g_ = .13, x0 = e.x + e.face * 22, y0 = e.y - 36; ebul('s', x0, y0, clamp((p.x - x0) / tt, -4, 4), (GY - y0) / tt - .5 * g_ * tt, { g: g_, br: 24 }); sfx('boom'); fxSmoke(x0, y0, 3); shake(2); } }
      else if (e.stT > 20) { e.st = 'wait'; e.stT = 0; e.wait = rr(100, 150); }
    } else if (e.k === 'heli') {
      if (e.t % 7 === 0 && onScr(e.x)) sfx('chopper');
      if (e.st === 'crash') { e.vy += .09; e.y += e.vy; e.x += e.vx; if (e.t % 2 === 0) fxSmoke(e.x + rr(-10, 10), e.y - 20, 1, -.8); if (e.t % 9 === 0) boom(e.x + rr(-20, 20), e.y - rr(5, 25), 's'); if (e.y >= GY) { e.dead = true; boom(e.x, GY - 14, 'x'); fxDeb(e.x, GY - 20, SP.plate, 14, 4.5); addScore(5000); fxText('5000', e.x, GY - 60); } continue; }
      e.face = dx < 0 ? -1 : 1;
      const tx = p.x + Math.sin(e.t * .013) * 90; e.vx += clamp((tx - e.x) * .002, -.035, .035); e.vx = clamp(e.vx * .985, -1.3, 1.3); e.x += e.vx; e.x = clamp(e.x, G.cam + 30, G.cam + W + 60);
      e.y += ((84 + Math.sin(e.t * .04) * 9) - e.y) * .05;
      if (e.st === 'wait') { if (e.stT > e.wait && tgt) { e.st = (e.n++ % 2) ? 'gun' : 'bomb'; e.stT = 0; sfx('warn'); } }
      else if (e.st === 'bomb') { if (e.stT > 30 && (e.stT - 30) % 16 === 1) ebul('bomb', e.x, e.y - 2, e.vx * .6, .5, { g: .09, br: 22 }); if (e.stT > 30 + 16 * 3) { e.st = 'wait'; e.stT = 0; e.wait = rr(70, 110); } }
      else { if (e.stT === 30) e.ga = Math.atan2(p.y - 14 - e.y, p.x - (e.x + e.face * 30)); if (e.stT > 30 && (e.stT - 30) % 7 === 1) { ebul('b', e.x + e.face * 30, e.y - 8, Math.cos(e.ga) * 2.6, Math.sin(e.ga) * 2.6); sfx('eshot'); } if (e.stT > 62) { e.st = 'wait'; e.stT = 0; e.wait = rr(70, 110); } }
    }
  }
  G.en = G.en.filter(e => !e.dead);
  for (const w of G.wrecks) { w.t++; if (w.t % 6 === 0 && w.t < 600 && onScr(w.x, 40)) fxSmoke(w.x + rr(-12, 12), w.y - 30, 1, -.7); }
}
function drawEnemies() {
  for (const w of G.wrecks) { if (!onScr(w.x, 40)) continue; spr(SP.tankWreck, w.x - 32, w.y - 39, w.face > 0); }
  for (const e of G.en) {
    if (!e.awake || !onScr(e.x, 60)) continue; const wh = e.flash > 0, fl = e.face < 0;
    if (e.cls === 'sold') {
      const S = e.S; let c;
      if (e.st === 'para') { spr(SP.chute, e.x - 17, e.y - 70); c = S.para; }
      else if (e.k === 'knife') c = e.st === 'charge' ? S.charge[(e.t >> 1) % 8] : S.run[(e.t >> 2) % 8];
      else if (e.k === 'bazooka') { c = S.kneel[e.st === 'fire' && e.stT < 6 ? 1 : 0]; if (e.st === 'aim' && (e.stT >> 2) & 1) R(e.x + e.face * 18 - 1, e.y - 21, 3, 3, '#fffbe8'); }
      else if (e.st === 'aim' || e.st === 'fire') {
        if (e.k === 'gren') c = S.throw[e.st === 'aim' ? 0 : 1];
        else { c = S.aim[e.ak][e.st === 'fire' && e.stT < 5 ? 1 : 0]; if (e.st === 'aim' && e.stT > 14 && (e.stT >> 1) & 1) g.drawImage(SP.star, Math.round(e.x + e.face * 15 - 4), Math.round(e.y - 24 + (e.ak === 'df' ? 8 : e.ak === 'uf' ? -8 : 0))); }
      } else c = e.mv ? S.run[(e.t >> 2) % 8] : S.idle;
      spr(c, e.x - (fl ? 22 : 21), e.y - 41, fl, wh);
    } else if (e.k === 'turret') {
      const bx = e.x, byy = e.y - 12, ex = bx + Math.cos(e.ang) * 17, ey = byy + Math.sin(e.ang) * 17;
      limb(bx, byy, ex, ey, 3, e.st === 'aim' && (e.stT >> 2) & 1 ? '#f04030' : MT[2], MT[4]); spr(SP.turret, e.x - 17, e.y - 21, false, wh);
    } else if (e.k === 'tank') {
      const f = e.face, el = e.st === 'aim' ? Math.min(.55, e.stT * .02) : e.st === 'fire' ? .55 : .12, rc = e.st === 'fire' && e.stT < 8 ? 4 : 0, bx = e.x + f * 4, byy = e.y - 29;
      limb(bx, byy, bx + f * Math.cos(el) * (26 - rc), byy - Math.sin(el) * (26 - rc), 4, e.st === 'aim' && (e.stT >> 2) & 1 ? '#f04030' : MT[2], MT[4]);
      spr(SP.tank[e.mv ? (e.t >> 2) & 1 : 0], e.x - 32, e.y - 39, f > 0, wh);
    } else if (e.k === 'heli') {
      const f = e.face, c = SP.heli; if (e.st === 'crash' && (e.t & 2)) { spr(c, e.x - 42, e.y - 40, f > 0, true); } else spr(c, e.x - 42, e.y - 40, f > 0, wh);
      const rx = e.x + f * 11, ry = e.y - 38; if (e.t & 1) R(rx - 38, ry, 76, 1, MT[4]); else { R(rx - 14, ry, 28, 2, MT[3]); R(rx - 40, ry, 8, 1, MT[2]); R(rx + 32, ry, 8, 1, MT[2]); }
      R(e.x - f * 34 - 1, e.y - 36 + ((e.t & 1) ? 0 : 3), 2, (e.t & 1) ? 9 : 3, MT[4]);
      if (e.st === 'bomb' && e.stT < 30 && (e.stT >> 2) & 1) R(e.x - 3, e.y - 5, 6, 3, '#f04030');
      if (e.st === 'gun' && e.stT < 30 && (e.stT >> 2) & 1) g.drawImage(SP.star, Math.round(e.x + f * 30 - 4), Math.round(e.y - 12));
    }
  }
}
// ───────── 적 탄·위험 표시 ─────────
function updEB() {
  const b = plBox();
  for (const q of G.eb) {
    q.t++; if (q.g) q.vy += q.g; q.x += q.vx; q.y += q.vy;
    const r = q.k === 'b' ? 2 : 4, hp = !G.pl.dead && q.x > b.x0 - r && q.x < b.x1 + r && q.y > b.y0 - r && q.y < b.y1 + r;
    if (q.k === 'b') { if (hp) { if (G.pl.inv <= 0) q.dead = 1; hurtPlayer(1); } else if (q.y >= GY) { q.dead = 1; fxPt(q.x, GY - 1, 2, '#ff6898', 1.5, 8); } }
    else {
      if (q.k === 'r' && q.t % 3 === 0) fxSmoke(q.x - q.vx * 3, q.y, 1, 0, .1);
      if ((hp && G.pl.inv <= 0) || q.y >= GY - 3) { q.dead = 1; boom(q.x, Math.min(q.y, GY - 8), 'm', { hostile: 1, r: q.br || 22, pd: 3 }); }
    }
    if (q.x < G.cam - 40 || q.x > G.cam + W + 80 || q.y < -200) q.dead = 1;
  }
  G.eb = G.eb.filter(q => !q.dead);
  for (const h of G.haz) { if (--h.t <= 0) { h.dead = 1; boom(h.x, GY - 10, h.k === 'm' ? 'l' : 'm', { hostile: 1, r: h.r, pd: 5 }); fx({ k: 'ring', x: h.x, y: GY - 2, t: 0 }); } }
  G.haz = G.haz.filter(h => !h.dead);
}
function drawEB() {
  for (const h of G.haz) {
    const bl = h.t > 30 ? (h.t >> 3) & 1 : (h.t >> 1) & 1; g.drawImage(SP.ret[bl], Math.round(h.x - 15), GY - 7);
    if (h.t < 34) for (let y = GY - 12 - (G.t % 6); y > 30; y -= 6) R(h.x, y, 1, 2, '#f02828');
    if (h.t < 16) { const c = h.k === 'm' ? SP.missile[2] : SP.bomb[0], y = GY - 10 - h.t * 15; g.drawImage(c, Math.round(h.x - c.width / 2), Math.round(y - c.height / 2)); R(h.x - 1, y - 16, 3, 8, '#ff9a20'); }
  }
  for (const q of G.eb) {
    if (q.k === 'b') g.drawImage(SP.ebul[(q.t >> 2) & 1], Math.round(q.x - 2), Math.round(q.y - 2));
    else if (q.k === 'g') g.drawImage(SP.egren[(q.t >> 2) % 8], Math.round(q.x - 5), Math.round(q.y - 5));
    else if (q.k === 'r') { g.drawImage(SP.erocket[q.vx > 0 ? 0 : 4], Math.round(q.x - 7), Math.round(q.y - 7)); R(q.x - sgn(q.vx) * 8 - 1, q.y - 1, 3, 3, (G.t & 2) ? '#ffe45c' : '#ff9a20'); }
    else if (q.k === 's') { g.drawImage(SP.shell, Math.round(q.x - 4), Math.round(q.y - 4)); }
    else g.drawImage(SP.bomb[q.k === 'bomb' ? 0 : (q.t >> 2) % 8], Math.round(q.x - 6), Math.round(q.y - 6));
  }
}
const PROPSPR = { crate: ['crate', 10, 17], barrel: ['barrel', 8, 19], sandbag: ['sandbag', 17, 19], tower: ['tower', 22, 101], hut: ['hut', 35, 51], gate: ['gate', 16, 95] };
function drawProps() {
  for (const q of G.props) { if (q.dead || !onScr(q.x, 50)) continue; const d = PROPSPR[q.k]; spr(SP[d[0]], q.x - d[1], q.y - d[2], false, q.flash > 0); if (q.flash > 0) q.flash--; }
}
function initProps2() {
  let c = mk(78, 48), p = P(c); for (const x of [5, 70]) p.box(x, 5, 3, 43, WD, 0); p.ln(6, 44, 71, 8, WD[1], 2); p.ln(71, 44, 6, 8, WD[2], 2); p.box(1, 1, 76, 5, WD); for (let x = 8; x < 76; x += 9) p.r(x, 2, 1, 3, WD[0]); SP.scaffold = outline(c, OL);
  c = mk(64, 40); p = P(c); const x = c.getContext('2d'); x.drawImage(SP.tank[0], 0, 6, 64, 34, 0, 6, 64, 34); x.globalCompositeOperation = 'source-atop'; for (let yy = 0; yy < 40; yy++) for (let xx = 0; xx < 64; xx++) if (bay(xx, yy) < .72) p.p(xx, yy, BK[(xx + yy * 3) % 7 === 0 ? 2 : 1]); x.globalCompositeOperation = 'source-over'; SP.tankWreck = c;
  c = mk(12, 11); P(c).art(HEAD.hero.rows, HEAD.hero.pal, 1, 1); SP.heroHead = outline(c, OL);
}
