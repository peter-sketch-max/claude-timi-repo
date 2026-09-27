// The living town on the home screen, drawn on a canvas in the same cartoon style as the rest of the game.
// Cartoon people walk by, go into your shop and come out with a bag. Cars drive past, trees sway, and the
// sky follows the real time of day. The weather follows the season, your building grows with your rank,
// and props next to it match your business (an oil pump, banana trees, a football goal...).
// Sometimes a golden customer walks past: tap them for a bonus.
var CS = globalThis.CS = globalThis.CS || {};

CS.Scene = (function () {
  var INK = '#2B2250';
  var SKINS = ['#FFDBB4', '#F1C27D', '#E0AC69', '#C68642', '#8D5524', '#FFE3CC'];
  var HAIRS = ['#2B1B0F', '#5A3A1A', '#A0522D', '#E6B94A', '#1E1E1E', '#C0392B', '#8E44AD', '#EDEDED', '#FF7EB6'];
  var SHIRTS = ['#FF5FA2', '#2EA8FF', '#22C55E', '#FFC93C', '#7C4DFF', '#FF8A3D', '#20C997', '#FF4D5E', '#FFFFFF', '#5DD3F3'];
  var PANTS = ['#2B2250', '#3B5BDB', '#495057', '#6D4C41', '#1E3A5F', '#8B5CF6'];
  var CARS = ['#FF4D5E', '#2EA8FF', '#FFC93C', '#22C55E', '#7C4DFF', '#FF8A3D', '#F8F9FA', '#343A40'];
  var BUBBLES = ['😋', '❤️', '⭐', '😍', '👍', '🤑', '🥳'];

  var S = { walkers: [], cars: [], floaters: [], parts: [], birds: [], exits: [], lastSpawn: 0, lastCar: 0, lastBird: 0, lastT: 0, door: 0, rivalDoor: 0, sky: null, skyW: 0 };
  var golden = { x: -60, dir: 1, y: 0, phase: 0 };
  var running = false, onGolden = null, debug = {};

  function game() { return CS.S && CS.S.g; }
  function canvas() { return document.getElementById('scene'); }
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  // ---------- drawing helpers ----------

  function rr(x, px, py, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r);
    x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath();
  }
  function circle(x, px, py, r) { x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); }
  function ink(x, w) { x.lineWidth = w || 2; x.strokeStyle = INK; x.lineJoin = 'round'; x.stroke(); }
  function emoji(x, e, px, py, size) {
    x.font = size + 'px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, px, py);
  }
  function hex(c) { var n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  // Mixes a color with another: mix('#FF0000', '#FFFFFF', 0.5) is pink.
  function mix(a, b, t) {
    var p = hex(a), q = hex(b);
    return 'rgb(' + Math.round(p[0] + (q[0] - p[0]) * t) + ',' + Math.round(p[1] + (q[1] - p[1]) * t) + ',' + Math.round(p[2] + (q[2] - p[2]) * t) + ')';
  }
  function text(x, str, px, py, size, color, weight, outline) {
    x.font = (weight || 700) + ' ' + size + 'px Fredoka, Nunito, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    if (outline) { x.lineWidth = 3; x.strokeStyle = outline; x.lineJoin = 'round'; x.strokeText(str, px, py); }
    x.fillStyle = color; x.fillText(str, px, py);
  }

  // ---------- time, season, weather ----------

  function timeOfDay() {
    if (debug.tod) return debug.tod;
    var d = new Date(), h = d.getHours() + d.getMinutes() / 60;
    if (h >= 7 && h < 17.5) return 'day';
    if ((h >= 17.5 && h < 19.5) || (h >= 5.5 && h < 7)) return 'sunset';
    return 'night';
  }
  function season(g) {
    var w = ((g.week - 1) % 52 + 52) % 52 + 1;
    return w <= 8 || w >= 49 ? 'winter' : w <= 21 ? 'spring' : w <= 35 ? 'summer' : 'autumn';
  }
  function weather(g) {
    if (debug.weather) return debug.weather;
    var s = season(g);
    if (g.economy && g.economy.state === 'recession') return 'rain';
    if (s === 'winter') return 'snow';
    if (s === 'autumn') return g.week % 4 === 0 ? 'rain' : 'leaves';
    if (s === 'spring') return 'petals';
    return 'clear';
  }

  // ---------- layout ----------

  function layout(W, H, g) {
    var ground = H - 46, ind = CS.IND[g.company.industry], stars = CS.TIERS[ind.tier].stars, rank = g.rank || 0;
    var gfH = 56, fh = 30;
    var floors = Math.max(1, Math.min(stars + Math.floor(rank / 2), Math.floor((ground - gfH - 36) / fh) + 1, 7));
    var bw = Math.round(Math.max(128, Math.min(W * 0.4 + rank * 5 + (stars - 1) * 12, W * 0.55)));
    var bx = Math.round(Math.max(34, W * 0.1)), bh = gfH + (floors - 1) * fh;
    var rw = Math.round(Math.min(80, W * 0.21)), rx = W - rw - 8;
    return {
      W: W, H: H, ground: ground, walkY: ground + 11, gfH: gfH, fh: fh, floors: floors, stars: stars, rank: rank,
      bx: bx, bw: bw, bh: bh, by: ground - bh, door: bx + Math.round(bw * 0.74), rx: rx, rw: rw, rdoor: rx + Math.round(rw * 0.62),
      propX: Math.round((bx + bw + rx) / 2), gap: rx - (bx + bw)
    };
  }

  // ---------- sky, skyline, trees, lamps ----------

  function drawSky(x, L, tod, wx, sec) {
    var sky = x.createLinearGradient(0, 0, 0, L.ground);
    var cols = tod === 'day' ? ['#5CC8FF', '#C9EFFF'] : tod === 'sunset' ? ['#FF7E6B', '#FFD27F'] : ['#15103A', '#3A2D7A'];
    if (wx === 'rain') cols = tod === 'night' ? ['#141230', '#2C2656'] : ['#7F93B5', '#C4CFE0'];
    sky.addColorStop(0, cols[0]); sky.addColorStop(1, cols[1]);
    x.fillStyle = sky; x.fillRect(0, 0, L.W, L.H);
    var cx = L.W - 36, cy = 30;
    if (tod === 'night') {
      for (var s = 0; s < 30; s++) {
        x.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(sec * 1.2 + s * 1.7));
        x.fillStyle = '#FFF'; x.fillRect((s * 97 + 13) % L.W, (s * 53) % (L.ground * 0.55), s % 3 ? 1.5 : 2.5, s % 3 ? 1.5 : 2.5);
      }
      x.globalAlpha = 1;
      circle(x, cx, cy, 14); x.fillStyle = '#FFF4C2'; x.fill(); ink(x, 2);
      x.fillStyle = 'rgba(214,196,120,.55)'; circle(x, cx - 4, cy - 3, 3.2); x.fill(); circle(x, cx + 5, cy + 4, 2.4); x.fill(); circle(x, cx + 3, cy - 6, 1.6); x.fill();
    } else if (wx !== 'rain') {
      x.save(); x.translate(cx, cy); x.rotate(sec * 0.25);
      x.strokeStyle = tod === 'sunset' ? '#FF9F43' : '#FFC93C'; x.lineWidth = 3; x.lineCap = 'round';
      for (var r = 0; r < 10; r++) { x.rotate(Math.PI / 5); x.beginPath(); x.moveTo(0, 19); x.lineTo(0, 25 + (r % 2) * 3); x.stroke(); }
      x.restore();
      circle(x, cx, cy, 15); x.fillStyle = tod === 'sunset' ? '#FFB347' : '#FFD84D'; x.fill(); ink(x, 2);
    }
    // Clouds
    var n = wx === 'rain' ? 5 : 3;
    for (var c = 0; c < n; c++) {
      var sp = 6 + c * 3, px = ((sec * sp + c * 150) % (L.W + 140)) - 70, py = 20 + (c % 3) * 17;
      cloud(x, px, py, 0.8 + (c % 2) * 0.35, wx === 'rain' ? (tod === 'night' ? '#4A4570' : '#9AA6BD') : tod === 'night' ? 'rgba(255,255,255,.25)' : '#FFFFFF');
    }
  }
  function cloud(x, px, py, s, color) {
    x.fillStyle = color;
    [[0, 0, 11], [11, -5, 13], [24, 0, 10], [12, 4, 11]].forEach(function (b) { circle(x, px + b[0] * s, py + b[1] * s, b[2] * s); x.fill(); });
  }

  function makeSkyline(W) {
    var far = [], near = [], xx = -10;
    while (xx < W + 20) { var w = rnd(18, 36); far.push({ x: xx, w: w, h: rnd(40, 95), lit: Math.random() }); xx += w + rnd(-4, 3); }
    xx = -20;
    while (xx < W + 20) { var w2 = rnd(22, 44); near.push({ x: xx, w: w2, h: rnd(24, 60), lit: Math.random(), roof: Math.random() < 0.3 }); xx += w2 + rnd(0, 8); }
    return { far: far, near: near };
  }
  function drawSkyline(x, L, tod, wx) {
    if (!S.sky || S.skyW !== L.W) { S.sky = makeSkyline(L.W); S.skyW = L.W; }
    var night = tod === 'night';
    var farC = night ? '#2D2566' : tod === 'sunset' ? 'rgba(160,90,120,.35)' : 'rgba(80,140,200,.22)';
    var nearC = night ? '#3A3080' : tod === 'sunset' ? 'rgba(140,70,110,.45)' : 'rgba(70,120,190,.32)';
    if (wx === 'rain' && !night) { farC = 'rgba(90,100,130,.3)'; nearC = 'rgba(80,90,120,.42)'; }
    x.fillStyle = farC;
    S.sky.far.forEach(function (b) { x.fillRect(b.x, L.ground - b.h, b.w, b.h); });
    S.sky.near.forEach(function (b) {
      x.fillStyle = nearC; x.fillRect(b.x, L.ground - b.h, b.w, b.h);
      if (b.roof) x.fillRect(b.x + b.w / 2 - 1, L.ground - b.h - 8, 2, 8);
      if (night) {
        for (var wy = L.ground - b.h + 6; wy < L.ground - 8; wy += 9)
          for (var wxp = b.x + 4; wxp < b.x + b.w - 5; wxp += 8)
            if (((wxp * 7 + wy * 13) % 10) / 10 < b.lit * 0.8) { x.fillStyle = '#FFE58A'; x.fillRect(wxp, wy, 3, 4); }
      }
    });
  }

  function tree(x, px, L, sec, seasonName, wx) {
    var base = L.ground + 2, sway = Math.sin(sec * 1.4 + px) * 1.6;
    x.fillStyle = '#8B5A2B'; rr(x, px - 3.5, base - 30, 7, 30, 2); x.fill(); ink(x, 2);
    var leaf = seasonName === 'autumn' ? '#FF9F43' : seasonName === 'winter' ? '#7FB08A' : seasonName === 'spring' ? '#6BD68B' : '#3DBE62';
    [[-9, -34, 10], [9, -34, 10], [0, -45, 12], [0, -32, 11]].forEach(function (b) { circle(x, px + b[0] + sway, base + b[1], b[2]); x.fillStyle = leaf; x.fill(); ink(x, 2); });
    [[-9, -34, 10], [9, -34, 10], [0, -45, 12], [0, -32, 11]].forEach(function (b) { circle(x, px + b[0] + sway, base + b[1], b[2] - 2); x.fillStyle = leaf; x.fill(); });
    if (seasonName === 'spring') { x.fillStyle = '#FF9EC7'; [[-8, -38], [6, -46], [10, -30], [-2, -28]].forEach(function (f) { circle(x, px + f[0] + sway, base + f[1], 2.3); x.fill(); }); }
    if (wx === 'snow') { x.fillStyle = '#FFFFFF'; rr(x, px - 12 + sway, base - 58, 24, 7, 4); x.fill(); }
  }
  function lamp(x, px, L, tod) {
    var base = L.ground + 2;
    if (tod !== 'day') {
      var g = x.createRadialGradient(px, base - 44, 2, px, base - 30, 40);
      g.addColorStop(0, 'rgba(255,230,140,.55)'); g.addColorStop(1, 'rgba(255,230,140,0)');
      x.fillStyle = g; x.beginPath(); x.moveTo(px - 4, base - 44); x.lineTo(px - 24, base); x.lineTo(px + 24, base); x.lineTo(px + 4, base - 44); x.fill();
    }
    x.fillStyle = '#4B4A6B'; x.fillRect(px - 1.5, base - 44, 3, 44);
    rr(x, px - 6, base - 50, 12, 8, 3); x.fillStyle = tod === 'day' ? '#DDE3F0' : '#FFE58A'; x.fill(); ink(x, 1.8);
  }

  // ---------- buildings ----------

  function workerHead(x, e, px, py, sec, lit) {
    var id = e.id || 1, skin = SKINS[id % SKINS.length], hair = HAIRS[(id * 7) % HAIRS.length];
    var bob = Math.sin(sec * 2 + id) * 1.2;
    x.fillStyle = SHIRTS[(id * 3) % SHIRTS.length]; rr(x, px - 6, py + 4 + bob, 12, 8, 3); x.fill(); ink(x, 1.2);
    circle(x, px, py + bob, 5.5); x.fillStyle = skin; x.fill(); ink(x, 1.2);
    x.fillStyle = hair; x.beginPath(); x.arc(px, py - 1 + bob, 5.8, Math.PI * 1.02, Math.PI * 1.98); x.fill();
    x.fillStyle = INK; circle(x, px - 2, py + 0.5 + bob, 0.8); x.fill(); circle(x, px + 2, py + 0.5 + bob, 0.8); x.fill();
    // Now and then a worker waves.
    if (Math.sin(sec * 0.9 + id * 2.3) > 0.93) {
      x.strokeStyle = skin; x.lineWidth = 2.5; x.lineCap = 'round';
      x.beginPath(); x.moveTo(px + 5, py + 6 + bob); x.lineTo(px + 9 + Math.sin(sec * 14) * 2, py - 4 + bob); x.stroke();
    }
    if (!lit) { x.fillStyle = 'rgba(20,16,58,.35)'; circle(x, px, py + bob, 6); x.fill(); }
  }

  function drawAwning(x, px, py, w, color, snow) {
    var n = Math.max(4, Math.round(w / 12)), sw = w / n;
    for (var i = 0; i < n; i++) { x.fillStyle = i % 2 ? '#FFFFFF' : color; x.fillRect(px + i * sw, py, sw, 12); }
    x.fillStyle = color;
    for (var j = 0; j < n; j++) { x.beginPath(); x.arc(px + j * sw + sw / 2, py + 12, sw / 2, 0, Math.PI); x.fillStyle = j % 2 ? '#FFFFFF' : color; x.fill(); }
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + w, py); x.lineTo(px + w, py + 12);
    for (var k = n - 1; k >= 0; k--) x.arc(px + k * sw + sw / 2, py + 12, sw / 2, 0, Math.PI, false);
    x.closePath(); ink(x, 2);
    if (snow) { x.fillStyle = '#FFFFFF'; rr(x, px - 1, py - 4, w + 2, 6, 3); x.fill(); }
  }

  function drawBuilding(x, L, g, tod, wx, sec, closed) {
    var c = g.company.color, wall = mix(c, '#FFFFFF', 0.74), trim = mix(c, '#2B2250', 0.25), night = tod === 'night';
    var lit = !closed && (night || tod === 'sunset');
    // Body
    x.fillStyle = wall; rr(x, L.bx, L.by, L.bw, L.bh + 3, 6); x.fill(); ink(x, 2.5);
    // Bricks texture on the upper floors
    x.strokeStyle = mix(c, '#FFFFFF', 0.6); x.lineWidth = 1;
    for (var by = L.by + 6; by < L.ground - L.gfH; by += 8) { x.beginPath(); x.moveTo(L.bx + 3, by); x.lineTo(L.bx + L.bw - 3, by); x.stroke(); }
    // Roof ledge
    x.fillStyle = trim; rr(x, L.bx - 4, L.by - 5, L.bw + 8, 8, 3); x.fill(); ink(x, 2);
    if (wx === 'snow') { x.fillStyle = '#FFFFFF'; rr(x, L.bx - 5, L.by - 9, L.bw + 10, 6, 3); x.fill(); }

    // Upper floor windows with workers
    var staff = g.employees, fronts = staff.filter(function (e) { return e.role === 'front'; }), others = staff.filter(function (e) { return e.role !== 'front'; }).concat(fronts.slice(3));
    var cols = Math.max(2, Math.floor((L.bw - 14) / 30)), k = 0;
    for (var f = 0; f < L.floors - 1; f++) {
      var wy = L.by + 8 + f * L.fh, ww = (L.bw - 14) / cols - 7;
      for (var q = 0; q < cols; q++) {
        var wxp = L.bx + 10 + q * ((L.bw - 14) / cols), on = lit && ((q * 3 + f * 5) % 7) !== 0;
        rr(x, wxp, wy, ww, L.fh - 11, 4);
        x.fillStyle = on ? '#FFE58A' : closed && night ? '#51497F' : night ? '#6D63A8' : '#CFEFFF'; x.fill();
        var e = others[k++];
        if (e) workerHead(x, e, wxp + ww / 2, wy + 7, sec, !night || on);
        if (!night) { x.strokeStyle = 'rgba(255,255,255,.8)'; x.lineWidth = 2; x.beginPath(); x.moveTo(wxp + 3, wy + L.fh - 15); x.lineTo(wxp + 9, wy + 3); x.stroke(); }
        rr(x, wxp, wy, ww, L.fh - 11, 4); ink(x, 1.8);
      }
    }

    // Ground floor: awning, shop window with the counter, door
    var gy = L.ground - L.gfH;
    drawAwning(x, L.bx - 5, gy + 2, L.bw + 10, c, wx === 'snow');
    var winX = L.bx + 8, winW = L.door - 16 - winX, winY = gy + 22, winH = L.gfH - 30;
    if (winW > 20) {
      var glass = x.createLinearGradient(0, winY, 0, winY + winH);
      glass.addColorStop(0, lit ? '#FFF1B8' : night ? '#5E5596' : '#D8F3FF'); glass.addColorStop(1, lit ? '#FFD76A' : night ? '#453C7E' : '#A9E2FA');
      x.fillStyle = glass; rr(x, winX, winY, winW, winH, 4); x.fill();
      // Front workers behind the counter
      var slots = Math.min(3, fronts.length, Math.floor(winW / 22));
      for (var i = 0; i < slots; i++) workerHead(x, fronts[i], winX + (i + 0.5) * winW / slots, winY + 9, sec, !night || lit);
      x.fillStyle = '#A26A3C'; x.fillRect(winX, winY + winH - 9, winW, 9);
      x.fillStyle = '#C98B55'; x.fillRect(winX, winY + winH - 9, winW, 3);
      emoji(x, CS.IND[g.company.industry].emoji, winX + winW - 11, winY + winH - 13, 11);
      if (!night) { x.strokeStyle = 'rgba(255,255,255,.75)'; x.lineWidth = 3; x.beginPath(); x.moveTo(winX + 6, winY + winH - 12); x.lineTo(winX + 16, winY + 3); x.stroke(); x.lineWidth = 1.5; x.beginPath(); x.moveTo(winX + 14, winY + winH - 12); x.lineTo(winX + 22, winY + 3); x.stroke(); }
      rr(x, winX, winY, winW, winH, 4); ink(x, 2);
    }
    // Door (opens when someone walks in)
    var dw = 22, dh = 34, dx = L.door - dw / 2, dy = L.ground - dh;
    x.fillStyle = lit ? '#FFE58A' : '#3A2F6B'; rr(x, dx, dy, dw, dh, 4); x.fill();
    var open = Math.min(1, S.door * 3), pw = dw * (1 - 0.65 * open);
    x.fillStyle = closed ? '#8E86B8' : trim; rr(x, dx, dy, pw, dh, 4); x.fill(); ink(x, 2);
    if (open < 0.5) { x.fillStyle = '#CFEFFF'; rr(x, dx + 4, dy + 5, pw - 8, 11, 2); x.fill(); ink(x, 1.2); circle(x, dx + pw - 5, dy + 20, 1.8); x.fillStyle = '#FFC93C'; x.fill(); }
    rr(x, dx, dy, dw, dh, 4); ink(x, 2);
    // Open / closed sign
    x.fillStyle = '#FFFFFF'; rr(x, dx - 2, dy - 11, dw + 4, 9, 3); x.fill(); ink(x, 1.2);
    text(x, closed ? 'CLOSED' : 'OPEN', L.door, dy - 6.2, 6.5, closed ? '#E03131' : '#15803D', 800);
    // Plant pots
    [L.door - dw / 2 - 7, L.door + dw / 2 + 7].forEach(function (px) {
      x.fillStyle = '#E8834A'; rr(x, px - 4.5, L.ground - 9, 9, 9, 2); x.fill(); ink(x, 1.4);
      circle(x, px, L.ground - 13, 6); x.fillStyle = '#3DBE62'; x.fill(); ink(x, 1.4);
    });

    // Sign on the roof
    var name = g.company.logo + ' ' + g.company.name, size = 12;
    x.font = '700 ' + size + 'px Fredoka, Nunito, sans-serif';
    var tw = Math.min(x.measureText(name).width, L.bw + 30), sw = tw + 22, sx = L.bx + L.bw / 2 - sw / 2, sy = L.by - 30;
    x.fillStyle = INK; x.fillRect(sx + 10, sy + 20, 3, 8); x.fillRect(sx + sw - 13, sy + 20, 3, 8);
    x.save();
    if (night && L.rank >= 4 && !closed) { x.shadowColor = c; x.shadowBlur = 14 + Math.sin(sec * 3) * 4; }
    x.fillStyle = c; rr(x, sx, sy, sw, 21, 8); x.fill();
    x.restore();
    rr(x, sx, sy, sw, 21, 8); ink(x, 2);
    x.save(); rr(x, sx, sy, sw, 21, 8); x.clip();
    text(x, name, L.bx + L.bw / 2, sy + 11, size, '#FFFFFF', 700, 'rgba(43,34,80,.35)');
    x.restore();
    // Rank decorations: flags, then an antenna with a blinking light
    if (L.rank >= 3) [L.bx + 6, L.bx + L.bw - 6].forEach(function (fx, i) {
      x.fillStyle = INK; x.fillRect(fx - 1, L.by - 22, 2, 18);
      var wave = Math.sin(sec * 4 + i) * 2;
      x.beginPath(); x.moveTo(fx + 1, L.by - 22); x.lineTo(fx + 13, L.by - 18 + wave); x.lineTo(fx + 1, L.by - 14); x.closePath();
      x.fillStyle = i ? '#FFC93C' : c; x.fill(); ink(x, 1.2);
    });
    if (L.stars >= 3 || L.rank >= 6) {
      var ax = L.bx + L.bw * 0.82;
      x.fillStyle = INK; x.fillRect(ax - 1, L.by - 26, 2, 22);
      circle(x, ax, L.by - 27, 2.6); x.fillStyle = Math.sin(sec * 4) > 0 ? '#FF4D5E' : '#7A2230'; x.fill();
    }
  }

  function drawRival(x, L, g, tod, wx) {
    var rv = g.rivalCos && g.rivalCos[0];
    if (!rv || L.rw < 50) return;
    var tall = rv.power > 1.25, rh = tall ? 84 : 60, ry = L.ground - rh, night = tod === 'night';
    x.fillStyle = mix(rv.color, '#FFFFFF', 0.66); rr(x, L.rx, ry, L.rw, rh + 3, 5); x.fill(); ink(x, 2.2);
    if (wx === 'snow') { x.fillStyle = '#FFFFFF'; rr(x, L.rx - 2, ry - 4, L.rw + 4, 6, 3); x.fill(); }
    if (tall) { rr(x, L.rx + 8, ry + 8, L.rw - 16, 16, 3); x.fillStyle = night ? '#FFE58A' : '#CFEFFF'; x.fill(); ink(x, 1.5); }
    drawAwning(x, L.rx - 3, L.ground - 46, L.rw + 6, rv.color, wx === 'snow');
    rr(x, L.rx + 6, L.ground - 28, L.rw * 0.42, 20, 3); x.fillStyle = night ? '#FFE58A' : '#CFEFFF'; x.fill(); ink(x, 1.5);
    emoji(x, rv.logo, L.rx + 6 + L.rw * 0.21, L.ground - 18, 12);
    var dw = 16, dx = L.rdoor - dw / 2, open = Math.min(1, S.rivalDoor * 3);
    x.fillStyle = '#3A2F6B'; rr(x, dx, L.ground - 26, dw, 26, 3); x.fill();
    x.fillStyle = mix(rv.color, '#2B2250', 0.3); rr(x, dx, L.ground - 26, dw * (1 - 0.6 * open), 26, 3); x.fill(); ink(x, 1.5);
    rr(x, dx, L.ground - 26, dw, 26, 3); ink(x, 1.5);
    x.fillStyle = rv.color; rr(x, L.rx - 2, ry - 17, L.rw + 4, 15, 6); x.fill(); ink(x, 1.8);
    x.save(); rr(x, L.rx - 2, ry - 17, L.rw + 4, 15, 6); x.clip();
    text(x, rv.name, L.rx + L.rw / 2, ry - 9.5, 8.5, '#FFFFFF', 700);
    x.restore();
  }

  // ---------- props that match your business ----------

  function drawProp(x, L, g, sec, tod) {
    if (L.gap < 56) return;
    var id = g.company.industry, has = function (t) { return CS.hasTag(id, t); }, px = L.propX, base = L.ground + 1;
    if (id === 'space') { // rocket on a pad
      x.fillStyle = '#9AA0B4'; x.fillRect(px - 14, base - 5, 28, 5);
      rr(x, px - 7, base - 46, 14, 40, 7); x.fillStyle = '#F1F3F5'; x.fill(); ink(x, 1.8);
      circle(x, px, base - 32, 3.5); x.fillStyle = '#5CC8FF'; x.fill(); ink(x, 1.2);
      x.beginPath(); x.moveTo(px - 7, base - 14); x.lineTo(px - 13, base - 5); x.lineTo(px - 7, base - 8); x.fillStyle = '#FF4D5E'; x.fill(); ink(x, 1.2);
      x.beginPath(); x.moveTo(px + 7, base - 14); x.lineTo(px + 13, base - 5); x.lineTo(px + 7, base - 8); x.fill(); ink(x, 1.2);
      if (Math.sin(sec * 9) > 0) { x.fillStyle = '#FFC93C'; x.beginPath(); x.moveTo(px - 4, base - 6); x.lineTo(px, base + 2 + Math.random() * 3); x.lineTo(px + 4, base - 6); x.fill(); }
    } else if (has('mine')) { // mine entrance with a cart full of gold on rails
      x.fillStyle = '#6B4F3A'; x.beginPath(); x.arc(px - 10, base, 20, Math.PI, 0); x.fill(); ink(x, 2);
      x.fillStyle = '#2B2250'; x.beginPath(); x.arc(px - 10, base, 12, Math.PI, 0); x.fill();
      x.fillStyle = '#8B6B3E'; x.fillRect(px - 32, base - 2, 64, 2);
      var cx2 = px + 8 + Math.sin(sec * 0.8) * 10;
      rr(x, cx2 - 10, base - 14, 20, 10, 2); x.fillStyle = '#7A7F95'; x.fill(); ink(x, 1.4);
      x.fillStyle = '#FFC93C'; [[-5, -16], [0, -18], [5, -16]].forEach(function (n) { circle(x, cx2 + n[0], base + n[1], 3.2); x.fill(); });
      [cx2 - 6, cx2 + 6].forEach(function (wx) { circle(x, wx, base - 3, 2.6); x.fillStyle = INK; x.fill(); });
      if (Math.sin(sec * 3) > 0.6) emoji(x, '✨', cx2 + 8, base - 24, 9);
    } else if (has('oil')) { // oil pump that rocks up and down
      var a = Math.sin(sec * 1.8) * 0.28;
      x.fillStyle = '#5B5F75'; x.fillRect(px - 16, base - 5, 32, 5);
      x.strokeStyle = INK; x.lineWidth = 3; x.beginPath(); x.moveTo(px - 8, base - 5); x.lineTo(px, base - 28); x.lineTo(px + 8, base - 5); x.stroke();
      x.save(); x.translate(px, base - 28); x.rotate(a);
      rr(x, -22, -3.5, 44, 7, 3); x.fillStyle = '#FFC93C'; x.fill(); ink(x, 1.6);
      rr(x, 16, -9, 10, 16, 3); x.fillStyle = '#343A40'; x.fill(); ink(x, 1.4);
      x.restore();
      x.fillStyle = '#343A40'; x.fillRect(px + 20, base - 26 + a * 20, 2, 22 - a * 20);
    } else if (has('farm')) { // banana trees
      [px - 14, px + 14].forEach(function (tx, i) {
        var sw = Math.sin(sec * 1.5 + i) * 2;
        x.fillStyle = '#8B6B3E'; rr(x, tx - 3, base - 34, 6, 34, 3); x.fill(); ink(x, 1.5);
        x.fillStyle = '#3DBE62';
        [-1, 1].forEach(function (d) { x.beginPath(); x.ellipse(tx + d * 11 + sw, base - 36, 13, 5, d * 0.5, 0, Math.PI * 2); x.fill(); ink(x, 1.4); });
        x.beginPath(); x.ellipse(tx + sw, base - 42, 5, 12, 0, 0, Math.PI * 2); x.fill(); ink(x, 1.4);
        emoji(x, '🍌', tx + 5 + sw / 2, base - 27, 11);
      });
    } else if (has('sport')) { // football goal and a bouncing ball
      x.strokeStyle = '#FFFFFF'; x.lineWidth = 3; x.beginPath(); x.moveTo(px - 20, base); x.lineTo(px - 20, base - 24); x.lineTo(px + 20, base - 24); x.lineTo(px + 20, base); x.stroke();
      x.strokeStyle = 'rgba(255,255,255,.6)'; x.lineWidth = 1;
      for (var nx = px - 16; nx < px + 20; nx += 6) { x.beginPath(); x.moveTo(nx, base - 24); x.lineTo(nx + 3, base); x.stroke(); }
      for (var ny = base - 20; ny < base; ny += 6) { x.beginPath(); x.moveTo(px - 20, ny); x.lineTo(px + 20, ny); x.stroke(); }
      x.strokeStyle = INK; x.lineWidth = 1.2; x.strokeRect(px - 21.5, base - 25.5, 43, 1);
      emoji(x, '⚽', px + Math.sin(sec * 1.1) * 12, base - 6 - Math.abs(Math.sin(sec * 3.2)) * 18, 12);
    } else if (has('fun')) { // spinning Ferris wheel
      var hub = base - 30;
      x.strokeStyle = INK; x.lineWidth = 2.5; x.beginPath(); x.moveTo(px - 14, base); x.lineTo(px, hub); x.lineTo(px + 14, base); x.stroke();
      circle(x, px, hub, 23); x.strokeStyle = '#FF5FA2'; x.lineWidth = 3; x.stroke();
      for (var s = 0; s < 8; s++) {
        var ang = sec * 0.6 + s * Math.PI / 4, cx = px + Math.cos(ang) * 23, cy = hub + Math.sin(ang) * 23;
        x.strokeStyle = 'rgba(43,34,80,.4)'; x.lineWidth = 1; x.beginPath(); x.moveTo(px, hub); x.lineTo(cx, cy); x.stroke();
        rr(x, cx - 4, cy - 2, 8, 7, 2); x.fillStyle = SHIRTS[s % SHIRTS.length]; x.fill(); ink(x, 1);
      }
    } else if (has('animals')) { // fence with animals
      x.fillStyle = '#C98B55';
      for (var fx = px - 26; fx <= px + 26; fx += 8) { rr(x, fx - 2, base - 18, 4, 18, 1.5); x.fill(); ink(x, 1); }
      x.fillRect(px - 28, base - 14, 56, 3); x.fillRect(px - 28, base - 7, 56, 3);
      emoji(x, id === 'zoo' ? '🦒' : '🐶', px - 10, base - 24 + Math.sin(sec * 2) * 1.5, 18);
      emoji(x, id === 'zoo' ? '🐘' : '🐱', px + 12, base - 20, 15);
    } else if (has('tech') || has('media')) { // satellite dish
      x.fillStyle = '#9AA0B4'; x.fillRect(px - 2, base - 22, 4, 22);
      x.save(); x.translate(px, base - 26); x.rotate(-0.5 + Math.sin(sec * 0.7) * 0.2);
      x.beginPath(); x.ellipse(0, 0, 14, 8, 0, 0, Math.PI); x.fillStyle = '#E9ECF5'; x.fill(); ink(x, 1.6);
      x.strokeStyle = INK; x.lineWidth = 1.5; x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -9); x.stroke(); circle(x, 0, -10, 2); x.fillStyle = '#FF4D5E'; x.fill();
      x.restore();
      if (tod === 'night') { x.fillStyle = 'rgba(255,255,255,.12)'; x.beginPath(); x.moveTo(px, base - 30); x.lineTo(px - 30 + Math.sin(sec) * 20, 0); x.lineTo(px - 10 + Math.sin(sec) * 20, 0); x.fill(); }
    } else if (has('food') || has('sweet')) { // sandwich board with a giant product
      x.fillStyle = '#FFFFFF'; x.beginPath(); x.moveTo(px - 11, base); x.lineTo(px - 7, base - 26); x.lineTo(px + 7, base - 26); x.lineTo(px + 11, base); x.closePath(); x.fill(); ink(x, 1.8);
      text(x, 'YUM!', px, base - 19, 7, '#FF4D5E', 800);
      emoji(x, CS.IND[id].emoji, px, base - 9, 12);
      x.save(); x.translate(px, base - 40); x.rotate(Math.sin(sec * 1.6) * 0.15); emoji(x, CS.IND[id].emoji, 0, 0, 20); x.restore();
    } else if (has('fashion')) { // clothes rack
      x.strokeStyle = INK; x.lineWidth = 2; x.beginPath(); x.moveTo(px - 18, base); x.lineTo(px - 18, base - 30); x.lineTo(px + 18, base - 30); x.lineTo(px + 18, base); x.stroke();
      ['#FF5FA2', '#2EA8FF', '#FFC93C', '#22C55E'].forEach(function (col, i) {
        var hx = px - 12 + i * 8, sw = Math.sin(sec * 2 + i) * 1.5;
        x.fillStyle = col; rr(x, hx - 3.5 + sw, base - 28, 7, 16, 2); x.fill(); ink(x, 1);
      });
    } else { // bench and flowers
      x.fillStyle = '#C98B55'; rr(x, px - 18, base - 13, 36, 4, 2); x.fill(); ink(x, 1.2); rr(x, px - 18, base - 20, 36, 4, 2); x.fill(); ink(x, 1.2);
      x.fillStyle = INK; x.fillRect(px - 15, base - 9, 2.5, 9); x.fillRect(px + 12.5, base - 9, 2.5, 9);
      ['#FF5FA2', '#FFC93C', '#7C4DFF'].forEach(function (col, i) { circle(x, px - 26 + i * 4, base - 5 - (i % 2) * 3, 2.6); x.fillStyle = col; x.fill(); });
    }
  }

  // ---------- people ----------

  function newLook(kid) {
    return { skin: pick(SKINS), hair: pick(HAIRS), style: Math.floor(Math.random() * 5), shirt: pick(SHIRTS), pants: pick(PANTS), kid: kid,
      balloon: kid && Math.random() < 0.5 ? pick(['#FF4D5E', '#FFC93C', '#2EA8FF', '#FF5FA2']) : null, dog: !kid && Math.random() < 0.08 };
  }

  // Draws a cartoon person with their feet at (px, py). dir: 1 = facing right, -1 = left.
  function person(x, P, px, py, dir, phase, moving, gold) {
    var s = P.kid ? 0.78 : 1, sw = moving ? Math.sin(phase) : 0, headY = -27.5;
    x.save(); x.translate(px, py); x.scale(dir * s, s);
    x.lineCap = 'round';
    if (P.balloon) {
      x.strokeStyle = 'rgba(43,34,80,.6)'; x.lineWidth = 1; x.beginPath(); x.moveTo(4, -15); x.quadraticCurveTo(8, -32, 6, -44); x.stroke();
      circle(x, 6, -50, 6); x.fillStyle = P.balloon; x.fill(); ink(x, 1.4);
    }
    if (P.style === 1) { x.fillStyle = P.hair; rr(x, -7.5, -31, 6, 12, 3); x.fill(); } // long hair at the back
    // Legs and shoes
    x.strokeStyle = P.pants; x.lineWidth = 3.4;
    x.beginPath(); x.moveTo(-2, -10); x.lineTo(-2 + sw * 4, -0.5); x.stroke();
    x.beginPath(); x.moveTo(2, -10); x.lineTo(2 - sw * 4, -0.5); x.stroke();
    x.fillStyle = INK; circle(x, -2 + sw * 4 + 1, 0, 1.9); x.fill(); circle(x, 2 - sw * 4 + 1, 0, 1.9); x.fill();
    // Back arm
    x.strokeStyle = gold ? '#E0A800' : mix(P.shirt === '#FFFFFF' ? '#DDDDDD' : P.shirt, '#2B2250', 0.2); x.lineWidth = 3;
    x.beginPath(); x.moveTo(-1, -19); x.lineTo(-1 - sw * 4.5, -11.5); x.stroke();
    // Body
    rr(x, -5.5, -21.5, 11, 12.5, 4); x.fillStyle = gold ? '#FFD23F' : P.shirt; x.fill(); ink(x, 1.5);
    // Front arm, with a shopping bag if they bought something
    x.strokeStyle = gold ? '#FFD23F' : P.shirt; x.lineWidth = 3;
    x.beginPath(); x.moveTo(1, -19); x.lineTo(1 + sw * 4.5, -11.5); x.stroke();
    circle(x, 1 + sw * 4.5, -11, 1.8); x.fillStyle = P.skin; x.fill();
    if (P.bag) { rr(x, 1 + sw * 4.5 - 3, -11, 7, 8, 1.5); x.fillStyle = P.bag; x.fill(); ink(x, 1.1); }
    // Head and hair
    circle(x, 0, headY, 6.6); x.fillStyle = P.skin; x.fill(); ink(x, 1.5);
    x.fillStyle = P.hair;
    if (P.style === 3) { // cap
      x.fillStyle = P.shirt === '#FFFFFF' ? '#FF4D5E' : P.shirt;
      x.beginPath(); x.arc(0, headY - 1.2, 6.9, Math.PI, 0); x.fill(); ink(x, 1.1);
      rr(x, 2, headY - 2.6, 7, 2.4, 1.2); x.fill(); ink(x, 1);
    } else if (P.style !== 4) {
      x.beginPath(); x.arc(0, headY - 1, 6.9, Math.PI * 1.02, Math.PI * 1.98); x.fill();
      if (P.style === 2) { circle(x, -4, headY - 7, 3); x.fill(); }
    }
    if (gold) { // crown
      x.fillStyle = '#FFC93C'; x.beginPath(); x.moveTo(-5, headY - 6); x.lineTo(-5, headY - 12); x.lineTo(-2.5, headY - 8.5); x.lineTo(0, headY - 13); x.lineTo(2.5, headY - 8.5); x.lineTo(5, headY - 12); x.lineTo(5, headY - 6); x.closePath(); x.fill(); ink(x, 1.1);
    }
    x.fillStyle = INK; circle(x, 1.8, headY + 0.2, 0.95); x.fill(); circle(x, 4.4, headY + 0.2, 0.95); x.fill();
    x.strokeStyle = INK; x.lineWidth = 1; x.beginPath(); x.arc(3.2, headY + 2.2, 1.8, 0.15, Math.PI - 0.4); x.stroke();
    x.fillStyle = 'rgba(255,120,140,.45)'; circle(x, 5.2, headY + 2.3, 1.3); x.fill();
    x.restore();
    if (P.dog) emoji(x, '🐕', px - dir * 14, py - 5 - Math.abs(Math.sin(phase)) * 1.5, 12);
  }
  function bubble(x, px, py, e, a) {
    x.globalAlpha = Math.max(0, Math.min(1, a));
    rr(x, px - 10, py - 20, 20, 16, 7); x.fillStyle = '#FFFFFF'; x.fill(); ink(x, 1.3);
    x.beginPath(); x.moveTo(px - 3, py - 4.5); x.lineTo(px, py + 1); x.lineTo(px + 3, py - 4.5); x.fillStyle = '#FFFFFF'; x.fill();
    emoji(x, e, px, py - 12, 10);
    x.globalAlpha = 1;
  }

  // ---------- cars ----------

  function car(x, c, L, tod) {
    var y = c.lane ? L.ground + 44 : L.ground + 31, px = c.x;
    x.save(); x.translate(px, y); x.scale(c.dir, 1);
    if (tod !== 'day') { var gl = x.createLinearGradient(16, 0, 60, 0); gl.addColorStop(0, 'rgba(255,240,170,.5)'); gl.addColorStop(1, 'rgba(255,240,170,0)'); x.fillStyle = gl; x.beginPath(); x.moveTo(17, -8); x.lineTo(60, -14); x.lineTo(60, 2); x.closePath(); x.fill(); }
    if (c.van) {
      rr(x, -21, -19, 40, 16, 4); x.fillStyle = c.color; x.fill(); ink(x, 1.6);
      rr(x, 10, -16, 8, 6, 2); x.fillStyle = '#CFEFFF'; x.fill(); ink(x, 1);
      x.restore(); emoji(x, c.logo, px - c.dir * 5, y - 11, 10); x.save(); x.translate(px, y); x.scale(c.dir, 1);
    } else {
      rr(x, -8, -18, 18, 9, 4); x.fillStyle = mix(c.color, '#FFFFFF', 0.25); x.fill(); ink(x, 1.4);
      rr(x, -5, -16.5, 6, 5.5, 1.5); x.fillStyle = '#CFEFFF'; x.fill(); rr(x, 2.5, -16.5, 6, 5.5, 1.5); x.fill();
      rr(x, -18, -11, 36, 9, 4); x.fillStyle = c.color; x.fill(); ink(x, 1.6);
      x.fillStyle = '#FFE58A'; circle(x, 16, -7, 1.6); x.fill();
    }
    [-10, 10].forEach(function (wx) {
      circle(x, wx, -2, 3.8); x.fillStyle = '#2B2250'; x.fill();
      circle(x, wx, -2, 1.5); x.fillStyle = '#BFC3D6'; x.fill();
    });
    x.restore();
  }

  // ---------- main loop ----------

  function draw(t) {
    var cv = canvas(), g = game();
    if (!cv || !g) { running = false; return; }
    requestAnimationFrame(draw);
    var dt = Math.min(0.05, (t - (S.lastT || t)) / 1000); S.lastT = t;
    var dpr = Math.min(2, window.devicePixelRatio || 1), W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    var x = cv.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    var L = layout(W, H, g), tod = timeOfDay(), wx = weather(g), sea = season(g), sec = t / 1000;
    var closed = g.mods && g.mods.some(function (m) { return m.type === 'closed'; });
    S.door = Math.max(0, S.door - dt); S.rivalDoor = Math.max(0, S.rivalDoor - dt);

    drawSky(x, L, tod, wx, sec);
    // Birds on nice days
    if ((wx === 'clear' || wx === 'petals') && tod !== 'night' && t - S.lastBird > 9000 && Math.random() < 0.01) {
      S.lastBird = t; var by = rnd(20, 60);
      for (var b = 0; b < 3; b++) S.birds.push({ x: -20 - b * 14, y: by + (b % 2) * 8, v: rnd(30, 42), f: Math.random() * 6 });
    }
    x.strokeStyle = INK; x.lineWidth = 1.5;
    S.birds.forEach(function (bd) {
      bd.x += bd.v * dt; var flap = Math.sin(sec * 10 + bd.f) * 3;
      x.beginPath(); x.moveTo(bd.x - 5, bd.y - flap); x.quadraticCurveTo(bd.x - 2, bd.y - 2, bd.x, bd.y); x.quadraticCurveTo(bd.x + 2, bd.y - 2, bd.x + 5, bd.y - flap); x.stroke();
    });
    S.birds = S.birds.filter(function (bd) { return bd.x < W + 20; });

    drawSkyline(x, L, tod, wx);
    // Grass strip behind the sidewalk
    x.fillStyle = wx === 'snow' ? '#F4F7FF' : sea === 'autumn' ? '#9CC46A' : '#7ED67E'; x.fillRect(0, L.ground - 6, W, 6);
    tree(x, 16, L, sec, sea, wx);
    if (L.gap > 110) tree(x, L.rx - 16, L, sec, sea, wx);
    drawProp(x, L, g, sec, tod);
    drawRival(x, L, g, tod, wx);
    drawBuilding(x, L, g, tod, wx, sec, closed);

    // Sidewalk, curb and road
    x.fillStyle = wx === 'snow' ? '#F1F3FA' : '#E9E4F5'; x.fillRect(0, L.ground, W, 15);
    x.fillStyle = '#D3CCE8'; for (var p = 0; p < W; p += 24) x.fillRect(p, L.ground, 1.5, 15);
    x.fillStyle = '#B8AFD6'; x.fillRect(0, L.ground + 15, W, 3);
    x.fillStyle = wx === 'rain' ? '#3E3D5C' : '#4B4A6B'; x.fillRect(0, L.ground + 18, W, H - L.ground - 18);
    x.fillStyle = 'rgba(255,255,255,.75)'; for (var l = 6; l < W; l += 34) x.fillRect(l, L.ground + 32.5, 16, 2.5);
    lamp(x, L.bx - 12, L, tod);
    if (L.gap > 70) lamp(x, L.rx - 6, L, tod);

    // Pet by the door
    if (g.pet) {
      x.save(); x.translate(L.door - 30, L.walkY - 5 - Math.abs(Math.sin(sec * 3)) * 3);
      if (Math.sin(sec * 0.5) < 0) x.scale(-1, 1);
      emoji(x, g.pet, 0, 0, 16); x.restore();
    }

    // Line of waiting customers when you can't serve everyone
    var h = g.history[g.history.length - 1];
    var waiting = !closed && h && h.demand > h.capacity ? Math.min(5, Math.ceil((h.demand - h.capacity) / h.demand * 10)) : 0;
    if (!S.queue || S.queue.length !== waiting) { S.queue = []; for (var qi = 0; qi < waiting; qi++) S.queue.push(newLook(Math.random() < 0.2)); }
    S.queue.forEach(function (P, i) { person(x, P, L.door + 20 + i * 14, L.walkY + Math.sin(sec * 3 + i) * 0.6, -1, 0, false); });
    if (waiting >= 3) bubble(x, L.door + 20 + (waiting - 1) * 14, L.walkY - 36, '😤', 0.6 + Math.sin(sec * 2) * 0.4);

    // New people walking by
    var busy = 0.6 + (g.reputation || 50) / 120 + (g.awareness || 0) / 400;
    if (t - S.lastSpawn > 1300 / busy && S.walkers.length < 11) {
      S.lastSpawn = t;
      var dir = Math.random() < 0.5 ? 1 : -1, r = Math.random();
      var target = closed ? null : r < 0.25 + (g.satisfaction || 50) / 300 ? 'shop' : r > 0.9 ? 'rival' : null;
      S.walkers.push({ x: dir > 0 ? -20 : W + 20, dir: dir, P: newLook(Math.random() < 0.18), speed: rnd(26, 44), phase: Math.random() * 6, target: target, a: 1 });
    }
    // People leaving your shop with a bag
    S.exits = S.exits.filter(function (ex) {
      if (t < ex.at) return true;
      var P = newLook(Math.random() < 0.18); P.bag = g.company.color;
      S.walkers.push({ x: L.door, dir: Math.random() < 0.5 ? 1 : -1, P: P, speed: rnd(26, 40), phase: 0, a: 0, fadeIn: true, bub: pick(BUBBLES), bubT: 1.6 });
      S.door = 0.5;
      return false;
    });
    S.walkers.forEach(function (w) {
      var goal = w.target === 'shop' ? L.door : w.target === 'rival' ? L.rdoor : null;
      if (goal != null && !w.going && Math.abs(w.x - goal) < 3) {
        w.going = true;
        if (w.target === 'shop') { S.door = 0.6; S.floaters.push({ x: goal, y: L.ground - 44, txt: pick(['+$', '+$$', '💰', '+⭐']), a: 1 }); S.exits.push({ at: t + rnd(1800, 4200) }); }
        else { S.rivalDoor = 0.6; S.floaters.push({ x: goal, y: L.ground - 34, txt: '😒', a: 0.9, big: true }); }
      }
      if (w.going) { w.a -= dt * 3; w.shrink = true; }
      else {
        w.x += w.dir * w.speed * dt; w.phase += dt * w.speed * 0.28;
        if (w.fadeIn) { w.a = Math.min(1, w.a + dt * 3); if (w.a >= 1) w.fadeIn = false; }
      }
      x.globalAlpha = Math.max(0, w.a);
      person(x, w.P, w.x, L.walkY - (w.shrink ? (1 - w.a) * 4 : 0), w.dir, w.phase, !w.going);
      x.globalAlpha = 1;
      if (w.bubT > 0) { w.bubT -= dt; bubble(x, w.x, L.walkY - (w.P.kid ? 30 : 38), w.bub, w.bubT); }
    });
    S.walkers = S.walkers.filter(function (w) { return w.a > 0 && w.x > -40 && w.x < W + 40; });

    // Golden customer
    if (g.golden && !g.golden.tapped) {
      golden.x += golden.dir * 24 * dt; golden.phase += dt * 7;
      if (golden.x > W - 24) golden.dir = -1;
      if (golden.x < 24) golden.dir = 1;
      if (!golden.P) golden.P = { skin: '#FFE3CC', hair: '#E6B94A', style: 0, shirt: '#FFD23F', pants: '#B8860B', kid: false };
      x.save(); x.shadowColor = '#FFD700'; x.shadowBlur = 14 + Math.sin(sec * 6) * 6;
      person(x, golden.P, golden.x, L.walkY, golden.dir, golden.phase, true, true);
      x.restore();
      emoji(x, '✨', golden.x + 12, L.walkY - 38 + Math.sin(sec * 7) * 3, 11);
      emoji(x, '💰', golden.x - 12, L.walkY - 30 + Math.cos(sec * 6) * 3, 10);
      golden.y = L.walkY - 16;
    }

    // Cars
    if (t - S.lastCar > 2600 && Math.random() < 0.03) {
      S.lastCar = t;
      var lane = Math.random() < 0.5 ? 0 : 1, cdir = lane ? -1 : 1, van = (g.rank || 0) >= 2 && Math.random() < 0.25;
      S.cars.push({ x: cdir > 0 ? -40 : W + 40, dir: cdir, lane: lane, v: rnd(55, 85), color: van ? g.company.color : pick(CARS), van: van, logo: g.company.logo });
    }
    S.cars.sort(function (a, b) { return a.lane - b.lane; }).forEach(function (c) { c.x += c.dir * c.v * dt; car(x, c, L, tod); });
    S.cars = S.cars.filter(function (c) { return c.x > -60 && c.x < W + 60; });

    // Coins and money floating up
    S.floaters.forEach(function (f) {
      f.y -= 26 * dt; f.a -= dt * 0.9;
      x.globalAlpha = Math.max(0, Math.min(1, f.a));
      if (f.big) emoji(x, f.txt, f.x, f.y, 20);
      else text(x, f.txt, f.x, f.y, 14, '#15803D', 700, '#FFFFFF');
      x.globalAlpha = 1;
    });
    S.floaters = S.floaters.filter(function (f) { return f.a > 0; });

    // Weather
    if (wx !== 'clear') {
      var max = wx === 'rain' ? 70 : wx === 'snow' ? 45 : 12;
      if (S.parts.length < max && Math.random() < (wx === 'rain' ? 1 : wx === 'snow' ? 0.5 : 0.08)) {
        S.parts.push({ x: Math.random() * W, y: -10, v: wx === 'rain' ? rnd(220, 300) : wx === 'snow' ? rnd(16, 32) : rnd(20, 35), r: Math.random() * 6, c: wx === 'leaves' ? pick(['#FF9F43', '#E8590C', '#FFC93C']) : '#FF9EC7' });
      }
      S.parts.forEach(function (f) {
        f.y += f.v * dt;
        if (wx === 'rain') { x.strokeStyle = 'rgba(200,220,255,.75)'; x.lineWidth = 1.3; x.beginPath(); x.moveTo(f.x, f.y); x.lineTo(f.x - 2, f.y + 8); x.stroke(); }
        else if (wx === 'snow') { f.x += Math.sin(sec + f.y / 20) * 0.35; x.fillStyle = '#FFFFFF'; circle(x, f.x, f.y, 2.3); x.fill(); }
        else { f.x += Math.sin(sec * 2 + f.r) * 0.6; f.r += dt * 3; x.save(); x.translate(f.x, f.y); x.rotate(f.r); x.fillStyle = f.c; x.beginPath(); x.ellipse(0, 0, 4, 2.2, 0, 0, Math.PI * 2); x.fill(); x.restore(); }
      });
      S.parts = S.parts.filter(function (f) { return f.y < (wx === 'rain' ? L.ground + 10 : L.ground + 12); });
      if (wx === 'rain') { x.fillStyle = 'rgba(40,40,90,.08)'; x.fillRect(0, 0, W, H); }
    } else S.parts = [];
    if (tod === 'night') { x.fillStyle = 'rgba(20,16,70,.12)'; x.fillRect(0, 0, W, H); }
    if (closed) { x.fillStyle = 'rgba(43,34,80,.15)'; x.fillRect(0, 0, W, H); }
  }

  function start() {
    if (running || !canvas()) return;
    running = true;
    requestAnimationFrame(draw);
  }

  // Tapping the scene: catch the golden customer.
  document.addEventListener('pointerdown', function (ev) {
    var cv = canvas(), g = game();
    if (!cv || ev.target !== cv || !g || !g.golden || g.golden.tapped) return;
    var rect = cv.getBoundingClientRect(), px = ev.clientX - rect.left, py = ev.clientY - rect.top;
    if (Math.abs(px - golden.x) < 28 && Math.abs(py - (golden.y || 0)) < 32) {
      for (var i = 0; i < 6; i++) S.floaters.push({ x: golden.x + (Math.random() - 0.5) * 50, y: golden.y - 10 - Math.random() * 20, txt: '🪙', a: 1.2, big: true });
      if (onGolden) onGolden();
    }
  });

  return {
    start: start,
    onGolden: function (f) { onGolden = f; },
    burst: function (txt) { var cv = canvas(); if (cv) S.floaters.push({ x: cv.clientWidth * 0.36, y: 70, txt: txt, a: 1.4, big: true }); },
    debug: debug
  };
})();
