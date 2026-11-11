// ───────── 도트 그림 1: 인물(관절 인형 방식으로 프레임 생성), 아이템, 폭발 ─────────
const OL = '#16101c', PI = Math.PI;
const SP = {};
const clone = c => { const o = mk(c.width, c.height); o.getContext('2d').drawImage(c, 0, 0); return o; };
const PAL = {
  hero: { vest: '#3868d8', vestD: '#24449c', vestL: '#78a8ff', belt: '#3a2a20', pants: '#e0cc90', pantsD: '#a89058', boot: '#6a3c24', bootD: '#3c2214', skin: '#f8c090', skinD: '#c88458', sleeve: '#f8c090', sleeveD: '#c88458', pack: '#4a7a3c' },
  crow: { vest: '#64528e', vestD: '#3c3060', vestL: '#8c7cb8', belt: '#d8b030', pants: '#483c64', pantsD: '#2c2440', boot: '#1e1828', bootD: '#141018', skin: '#e8b890', skinD: '#b88060', sleeve: '#64528e', sleeveD: '#3c3060' },
  pow: { vest: '#f0f0e4', vestD: '#b8b8b4', vestL: '#ffffff', belt: '#8090a8', pants: '#6c8cb8', pantsD: '#486088', boot: '#f0b080', bootD: '#c08050', skin: '#f0b080', skinD: '#c08050', sleeve: '#f0b080', sleeveD: '#c08050' },
  char: { vest: '#2c242c', vestD: '#201a20', vestL: '#40363e', belt: '#201a20', pants: '#2c242c', pantsD: '#201a20', boot: '#201a20', bootD: '#181418', skin: '#2c242c', skinD: '#201a20', sleeve: '#2c242c', sleeveD: '#201a20' },
};
const HEAD = {
  hero: { rows: ['...hhHHh..', '..hhHHHhh.', '.hhhhhhhhh', 'RRrrrrrrrr', 'R.hssssss.', '..hsswesss', '..dssssss.', '..ddssmss.', '...dddd...'], eye: [5, 5], pal: { h: '#6a3a20', H: '#a05c30', r: '#f03838', R: '#b02020', s: '#f8c090', d: '#c88458', w: '#ffffff', e: '#201820', m: '#904838' } },
  crow: hk => ({ rows: ['..kkkkkk..', '.kkKKkkkk.', 'kkKkkkkkkk', 'kkkkkkkkkkk', '.kkssssss.', '.kkswessYY', '..dsssssY.', '..ddsss...', '...ddd....'], eye: [5, 5], pal: { k: hk[0], K: hk[1], s: '#e8b890', d: '#b88060', w: '#fff8a0', e: '#201820', Y: '#f8c820' } }),
  pow: { rows: ['..WWWWWW..', '.WWWWWWWW.', '.WWWWWWWb.', '..WWWWWb..', '..bbbbbb..', '..hsssss..', '..hswesss.', '..dsssssss', '..dMMMMMs.', '..ddMMss..', '...ddd....'], eye: [4, 6], pal: { W: '#fcfcf4', b: '#c0c0cc', h: '#503018', s: '#f0b080', d: '#c08050', w: '#ffffff', e: '#201820', M: '#583418' } },
  char: { rows: ['..kkkkkk..', '.kkkkkkkk.', 'kkkkkkkkkk', 'kkkkkkkkkk', '.kkkkkkkk.', '.kkkwekkk.', '..kkkkkkk.', '..kkkkk...', '...kkk....'], eye: [5, 5], pal: { k: '#2c242c', w: '#ffffff', e: '#201820' } },
};
const AIMS = { f: PI / 2, uf: PI * .75, u: PI, df: PI * .25, d: .02 };
const LEGS = { i: [.2, .05, -.22, .1], j: [.95, 1.5, -.3, 1.0], c: [1.25, 2.3, .9, 2.4], sit: [1.45, .25, 1.3, .35], hit: [.7, .3, -.6, .5] };
function runLegs(i, n = 8, amp = .8) { const f = i / n * PI * 2, lg = q => [amp * Math.sin(q), .2 + 1.1 * Math.max(0, Math.cos(q))]; return [...lg(f), ...lg(f + PI)]; }

function human(o) {
  const c = mk(44, 44), p = P(c), pl = o.pal, Lg = o.legs || LEGS.i;
  const pt = (a, k) => { const kx = Math.sin(a) * 5, ky = Math.cos(a) * 5; return [kx, ky, kx + Math.sin(a - k) * 5, ky + Math.cos(a - k) * 5]; };
  const F = pt(Lg[0], Lg[1]), B = pt(Lg[2], Lg[3]);
  const hx = 21, hy = Math.round(39 - Math.max(F[3], B[3])) + (o.dy || 0), ln = o.lean || 0;
  const leg = (q, ox, c1, bc) => {
    p.ln(hx + ox, hy, hx + ox + q[0], hy + q[1], c1, 3); p.ln(hx + ox + q[0], hy + q[1], hx + ox + q[2], hy + q[3], c1, 2);
    p.r(Math.round(hx + ox + q[2]) - 1, Math.round(hy + q[3]), 4, 2, bc);
  };
  const arm = (sx, sy, a1, a2, c1, c2) => {
    const r = o.rec || 0, d2x = Math.sin(a2), d2y = Math.cos(a2); sx -= d2x * r; sy -= d2y * r;
    const ex = sx + Math.sin(a1) * 4, ey = sy + Math.cos(a1) * 4, hx2 = ex + d2x * 4, hy2 = ey + d2y * 4;
    p.ln(sx, sy, ex, ey, c1, 2); p.ln(ex, ey, hx2, hy2, c2, 2); return [hx2, hy2, d2x, d2y];
  };
  const SX = hx + ln, SY = hy - 7;
  leg(B, -1, pl.pantsD, pl.bootD);
  let hb = null; if (o.armB) hb = arm(SX - 1, SY, o.armB[0], o.armB[1], pl.sleeveD, pl.skinD);
  if (o.pack) p.r(hx - 5 + ln, hy - 8, 3, 6, pl.pack);
  p.r(hx - 3, hy - 1, 6, 2, pl.pants);
  for (let i = 0; i < 9; i++) {
    const y = hy - 9 + i, xo = Math.round(ln * (8 - i) / 8);
    p.r(hx - 3 + xo, y, 7, 1, i === 8 ? pl.belt : pl.vest); if (i < 8) { p.r(hx - 3 + xo, y, 2, 1, pl.vestD); if (i < 5) p.p(hx + 3 + xo, y, pl.vestL); }
  }
  leg(F, 1, pl.pants, pl.boot);
  const hd = o.head, hX = hx + ln - 5 + (o.hdx || 0), hY = hy - 9 - hd.rows.length + 1 + (o.hdy || 0);
  p.art(hd.rows, hd.pal, hX, hY);
  if (o.shock) { const ex = hX + hd.eye[0], ey = hY + hd.eye[1]; p.r(ex - 1, ey - 1, 3, 2, '#ffffff'); p.p(ex, ey, '#201820'); p.r(ex, ey + 2, 2, 2, '#501018'); }
  if (o.armF) {
    const h = arm(SX + 1, SY, o.armF[0], o.armF[1], pl.sleeve, pl.skin), [gx, gy, dx, dy] = h, G = (a, b, col, th) => p.ln(gx + dx * a, gy + dy * a, gx + dx * b, gy + dy * b, col, th);
    switch (o.gun) {
      case 'pistol': G(0, 4, '#30303c', 2); G(3, 4, '#8890a8', 1); break;
      case 'rifle': G(-3, 1, '#6a4428', 2); G(1, 9, '#2c2c38', 2); G(4, 9, '#70708c', 1); break;
      case 'hmg': G(-2, 11, '#2c2c38', 3); G(0, 11, '#8888a8', 1); p.r(gx - dy * 3 + dx * 2 - 1, gy + dx * 3 + dy * 2 - 1, 3, 3, '#d8a820'); break;
      case 'flame': G(-2, 9, '#b04818', 3); G(0, 8, '#e88830', 1); G(9, 10, '#ffe060', 2); break;
      case 'rocket': G(-6, 9, '#3c6a3c', 4); G(-5, 8, '#74a868', 1); G(9, 11, '#d03020', 3); break;
      case 'knife': G(1, 6, '#e0e8f8', 1); G(0, 1, '#503018', 2); break;
      case 'pot': p.r(gx - 1, gy - 3, 7, 5, '#585868'); p.r(gx - 1, gy - 3, 7, 1, '#9898b0'); break;
    }
    p.r(Math.round(gx) - 1, Math.round(gy) - 1, 2, 2, pl.skin);
  }
  return o.raw ? c : outline(c, OL);
}
// 주인공 프레임(다리 × 조준 × 반동 × 무기) — 필요할 때 만들어 보관
const heroCache = new Map();
function heroSpr(leg, aim, rec, wp) {
  const k = leg + aim + rec + wp; let c = heroCache.get(k); if (c) return c;
  const a = AIMS[aim], legs = leg[0] === 'r' ? runLegs(+leg[1]) : LEGS[leg];
  c = human({ pal: PAL.hero, head: HEAD.hero, legs, lean: leg[0] === 'r' ? 1 : 0, armF: [a, a], armB: [a - .4, a + .3], gun: wp, rec, pack: 1 });
  heroCache.set(k, c); return c;
}
function mkSoldier(hk) {
  const pal = PAL.crow, head = HEAD.crow(hk), f = o => human(Object.assign({ pal, head }, o)), S = {}, hold = { armF: [.9, 1.7], armB: [.5, 1.9], gun: 'rifle' };
  S.idle = f(hold);
  S.run = [...Array(8)].map((_, i) => f(Object.assign({ legs: runLegs(i), lean: 1 }, hold)));
  S.aim = {}; for (const k in AIMS) { const a = AIMS[k]; S.aim[k] = [f({ armF: [a, a], armB: [a - .4, a + .3], gun: 'rifle' }), f({ armF: [a, a], armB: [a - .4, a + .3], gun: 'rifle', rec: 2 })]; }
  S.kneel = [0, 2].map(rec => f({ legs: LEGS.c, armF: [PI / 2, PI / 2], armB: [1.2, 1.9], gun: 'rocket', rec }));
  S.throw = [f({ armF: [3.0, 3.5], armB: [.3, .8], lean: -1 }), f({ armF: [1.3, 1.7], armB: [.3, .8], lean: 2 })];
  S.charge = [...Array(8)].map((_, i) => f({ legs: runLegs(i, 8, 1), lean: 2, armF: [2.3, 2.9], armB: [-.6, -.2], gun: 'knife', shock: 1 }));
  S.para = f({ legs: [.25, .4, -.1, .5], armF: [2.9, 3.1], armB: [-2.9, -3.1] });
  S.scared = [0, 1].map(i => f({ legs: LEGS.hit, armF: [2.6 + i * .3, 3.0], armB: [-2.6 - i * .3, -3.0], shock: 1, lean: -1 }));
  const raw = human({ pal, head, legs: LEGS.hit, lean: -2, armF: [2.4, 3.0], armB: [-2.2, -2.9], shock: 1, raw: 1 });
  S.hit = outline(clone(raw), OL);
  S.die = [-.5, -1.05, -1.57].map(a => outline(rot(raw, a, 21, 36), OL));
  S.spin = [...Array(8)].map((_, i) => outline(rot(raw, i * PI / 4, 21, 28), OL));
  S.flat = squash(S.hit, 42, .2, 1);
  return S;
}
function initChars() {
  SP.sold = {
    rifle: mkSoldier(['#3c3458', '#6c5c94']), gren: mkSoldier(['#3c5838', '#64904c']),
    knife: mkSoldier(['#a02c2c', '#e06048']), bazooka: mkSoldier(['#30506c', '#5888a8']),
  };
  SP.burn = [...Array(8)].map((_, i) => human({ pal: PAL.char, head: HEAD.char, legs: runLegs(i, 8, 1), lean: 1, armF: [2.6 + .5 * Math.sin(i * 1.57), 3.1], armB: [-2.6 + .5 * Math.sin(i * 1.57), -3.1], shock: 1 }));
  const hraw = human({ pal: PAL.hero, head: HEAD.hero, legs: LEGS.hit, lean: -2, armF: [2.4, 3.0], armB: [-2.2, -2.9], shock: 1, raw: 1, pack: 1 });
  SP.heroDie = [outline(clone(hraw), OL), ...[-.5, -1.05, -1.57].map(a => outline(rot(hraw, a, 21, 36), OL))];
  SP.heroWin = [human({ pal: PAL.hero, head: HEAD.hero, armF: [2.7, 3.0], armB: [-2.7, -3.0], pack: 1 }), human({ pal: PAL.hero, head: HEAD.hero, legs: LEGS.j, dy: -5, armF: [2.9, 3.2], armB: [-2.9, -3.2], pack: 1 })];
  const pw = o => human(Object.assign({ pal: PAL.pow, head: HEAD.pow }, o));
  SP.pow = {
    tied: [pw({ legs: LEGS.sit, armF: [-.5, -1.3], armB: [-.5, -1.3] }), pw({ legs: [1.35, .35, 1.45, .2], armF: [-.5, -1.3], armB: [-.5, -1.3], shock: 1, hdy: -1 })],
    joy: [pw({ armF: [2.7, 3.0], armB: [-2.7, -3.0] }), pw({ legs: LEGS.j, dy: -4, armF: [2.9, 3.2], armB: [-2.9, -3.2] })],
    salute: [pw({ armF: [2.2, 4.3], armB: [.1, .1] }), pw({ armF: [2.2, 4.3], armB: [.1, .1], lean: 3, hdx: 1, hdy: 1 })],
    give: pw({ armF: [1.5, 1.6], armB: [.2, .3], gun: 'pot' }),
    run: [...Array(8)].map((_, i) => pw({ legs: runLegs(i, 8, 1), lean: 2, armF: [2.6 + .4 * Math.sin(i * .8), 3.0], armB: [-2.6, -3.0] })),
  };
  // 기둥, 낙하산, 재
  let c = mk(8, 30), p = P(c); p.box(2, 0, 4, 30, ['#4a2c18', '#6a4424', '#8a5c34', '#a87848'], 0); p.r(1, 10, 6, 1, '#d8c890'); p.r(1, 13, 6, 1, '#d8c890'); p.r(1, 16, 6, 1, '#b8a870'); SP.post = outline(c, OL);
  c = mk(34, 34); p = P(c);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 32; x++) { const nx = (x - 15.5) / 16, ny = (y - 16) / 16; if (nx * nx + ny * ny > 1) continue; const s = Math.floor((x + 2) / 6) % 2; p.p(x + 1, y + 1, y > 12 ? (s ? '#b8b8b0' : '#901c1c') : (s ? '#f4f4e8' : '#d83030')); }
  for (const x of [2, 9, 16, 24, 31]) p.ln(x, 17, 17, 33, '#c8c0a0');
  SP.chute = outline(c, OL);
  c = mk(12, 6); p = P(c); p.el(6, 5, 5, 3, ['#181418', '#2c242c', '#40363e']); SP.ash = c;
}

// ───────── 아이템·탄·효과 ─────────
function initFx() {
  const mkExp = (R_, n) => {
    const fr = [], sd = [...Array(24)].map(() => rnd());
    for (let f = 0; f < n; f++) {
      const c = mk(R_ * 2, R_ * 2), p = P(c), t = f / (n - 1), rad = R_ * (.4 + .6 * Math.pow(t, .45));
      for (let y = 0; y < R_ * 2; y++) for (let x = 0; x < R_ * 2; x++) {
        const dx = x - R_ + .5, dy = y - R_ + .5, d = Math.hypot(dx, dy), a = (Math.atan2(dy, dx) / (PI * 2) + .5) * 24, i = Math.floor(a), nz = sd[i % 24] + (sd[(i + 1) % 24] - sd[i % 24]) * (a - i);
        const ed = rad * (.72 + .28 * nz + .08 * Math.sin(a * 1.3 + f)); if (d > ed) continue;
        const q = d / ed; if (t > .5 && q < (t - .5) * 2.1 + nz * .25 - .08) continue;
        let h = 1.05 - q * .75 - t * 1.25 + nz * .3 + (bay(x, y) - .5) * .16;
        p.p(x, y, h > .78 ? '#fffbe8' : h > .55 ? '#ffe45c' : h > .3 ? '#ff9a20' : h > .05 ? '#e04018' : h > -.25 ? '#7a2c30' : '#3c2c38');
      }
      fr.push(c);
    }
    return fr;
  };
  SP.ex = { s: mkExp(9, 8), m: mkExp(17, 10), l: mkExp(30, 12), x: mkExp(52, 15) };
  SP.smoke = [2, 3, 4, 5, 6, 7].map(r => { const c = mk(r * 2 + 2, r * 2 + 2); P(c).el(r + 1, r + 1, r, r, ['#3c3440', '#5a5260', '#80788c', '#a8a0b4']); return c; });
  SP.flame = [[3, ['#ffe45c', '#fffbe8']], [4, ['#ff9a20', '#ffe45c', '#fffbe8']], [5, ['#e04018', '#ff9a20', '#ffe45c']], [6, ['#e04018', '#ff9a20', '#ffe45c']], [6, ['#7a2c30', '#e04018', '#ff9a20']], [5, ['#3c2c38', '#7a2c30']]].map(([r, rp]) => { const c = mk(r * 2 + 2, r * 2 + 2); P(c).el(r + 1, r + 1, r, r, rp, 1.6); return c; });
  SP.muzzle = [['....y....', '....y....', '...ywy...', '.yywwwyy.', 'yywwwwwyy', '.yywwwyy.', '...ywy...', '....y....', '....y....'], ['.........', '..y...y..', '...ywy...', '..ywwwy..', '...www...', '..ywwwy..', '...ywy...', '..y...y..', '.........']].map(rows => { const c = mk(9, 9); P(c).art(rows, { y: '#ffc830', w: '#fffbe8' }); return c; });
  SP.ebul = [['.ppp.', 'pwwwp', 'pwwwp', 'pwwwp', '.ppp.'], ['.rrr.', 'rpppr', 'rpwpr', 'rpppr', '.rrr.']].map(rows => { const c = mk(5, 5); P(c).art(rows, { p: '#ff6898', w: '#ffffff', r: '#c82058' }); return c; });
  const rots = (c, n = 8) => [...Array(n)].map((_, i) => outline(rot(c, i * PI * 2 / n), OL));
  let c = mk(11, 11), p = P(c); p.el(5, 5, 2.4, 3, ['#284820', '#3c6c30', '#5c9848']); p.r(5, 1, 2, 1, '#c8c8d0'); SP.gren = rots(c);
  c = mk(11, 11); p = P(c); p.r(4, 2, 3, 4, '#3c3458'); p.r(5, 6, 1, 4, '#a87848'); SP.egren = rots(c);
  c = mk(13, 13); p = P(c); p.el(6, 6, 3, 4.5, ['#201828', '#3c3458', '#6c5c94']); p.r(5, 0, 3, 2, '#d03020'); p.p(6, 11, '#c8c8d0'); SP.bomb = rots(c);
  c = mk(15, 15); p = P(c); p.r(3, 6, 8, 3, '#d8d8e0'); p.r(3, 8, 8, 1, '#8888a0'); p.r(11, 6, 2, 3, '#d03020'); p.p(13, 7, '#d03020'); p.r(2, 5, 2, 5, '#3c6a3c'); SP.rocket = rots(c);
  c = mk(15, 15); p = P(c); p.r(3, 6, 8, 3, '#64528e'); p.r(3, 8, 8, 1, '#3c3060'); p.r(11, 6, 2, 3, '#f8c820'); p.p(13, 7, '#f8c820'); p.r(2, 5, 2, 5, '#3c3060'); SP.erocket = rots(c);
  c = mk(19, 19); p = P(c); p.r(3, 7, 11, 5, '#c8c8d8'); p.r(3, 11, 11, 1, '#70708c'); p.r(14, 8, 2, 3, '#e03020'); p.p(16, 9, '#e03020'); p.r(2, 6, 2, 7, '#a02828'); p.r(7, 7, 1, 5, '#a02828'); SP.missile = rots(c);
  c = mk(9, 9); p = P(c); p.art(['.kkk.', 'kwwwk', 'kwkwk', 'kkkkk', '.kkk.'], { k: '#ffe45c', w: '#fffbe8' }, 2, 2); SP.shell = c;
  // 아이템 상자(글자는 한글 도트 글자로 위에 얹음)
  SP.item = {};
  const box = (k, ramp) => { const c = mk(18, 16), p = P(c); p.box(1, 1, 16, 14, ramp); p.r(3, 3, 12, 10, ramp[0]); p.r(3, 3, 12, 1, '#16101c'); SP.item[k] = outline(c, OL); };
  box('hmg', ['#7a3c10', '#c86818', '#f8a030', '#ffd870']); box('flame', ['#6a1418', '#b82828', '#f05038', '#ffa080']); box('rocket', ['#1c4c28', '#2c8040', '#58c060', '#a8f0a0']); box('gren', ['#1c3068', '#2c58b8', '#5890f0', '#a8d0ff']);
  c = mk(13, 16); p = P(c); p.r(4, 0, 5, 5, '#d03030'); p.r(6, 0, 1, 5, '#f8f8f0'); p.el(6, 10, 4.5, 4.5, ['#a87010', '#e8b020', '#ffe45c', '#fffbe8']); p.p(6, 10, '#a87010'); p.r(5, 9, 3, 3, '#fff8c0'); SP.item.medal = outline(c, OL);
  c = mk(14, 14); p = P(c); p.box(2, 3, 10, 10, ['#606878', '#9098a8', '#c0c8d8', '#f0f4ff']); p.r(2, 6, 10, 4, '#d83030'); p.r(4, 7, 6, 2, '#f8e8a0'); p.r(2, 2, 10, 1, '#f0f4ff'); SP.item.can = outline(c, OL);
  c = mk(13, 13); p = P(c); p.art(['....c....', '...cwc...', '..cwwbc..', '.cwwbbbc.', 'cwbbbbbdc', '.cbbbbdc.', '..cbbdc..', '...cdc...', '....c....'], { c: '#2040a0', w: '#e0f8ff', b: '#60c0ff', d: '#3070d8' }, 2, 2); SP.item.gem = outline(c, OL);
  // 조준 표시(지면), 별
  SP.ret = [0, 1].map(k => { const c = mk(30, 10), p = P(c), col = k ? '#ffe45c' : '#f02828'; for (let a = 0; a < 64; a++) { if ((a >> 2) % 2 === k) continue; const an = a / 64 * PI * 2; p.p(15 + Math.cos(an) * 14, 5 + Math.sin(an) * 4, col); p.p(15 + Math.cos(an) * 8, 5 + Math.sin(an) * 2.2, col); } p.r(14, 4, 2, 2, col); return c; });
  c = mk(9, 9); P(c).art(['....w....', '....w....', '...www...', '.wwwwwww.', 'wwwwwwwww', '.wwwwwww.', '...www...', '....w....', '....w....'].map((r, i) => (i === 3 || i === 5) ? '...www...' : r), { w: '#fffbe8' }); SP.star = c;
  c = mk(7, 7); P(c).art(['kk...', 'kKk..', '.kKk.', '..kKk', '...kk'], { k: '#201828', K: '#4c4068' }, 1, 1); SP.feather = [c, rot(c, PI / 2)];
  c = mk(12, 9); p = P(c); p.art(['..kkkkkk..', '.kkKKkkkk.', 'kkKkkkkkkk', 'kkkkkkkkkkk'], { k: '#3c3458', K: '#6c5c94' }, 0, 2); SP.helmet = rots(c, 4);
}
