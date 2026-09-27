// The living shop scene on the home screen, drawn on a canvas.
// Customers walk by and go inside, workers wave from the windows, the building grows with your rank,
// the sky follows the real time of day, weather follows the season, and sometimes a golden customer
// walks past: tap it for a bonus.
var CS = globalThis.CS = globalThis.CS || {};

CS.Scene = (function () {
  var walkers = [], floaters = [], flakes = [], lastSpawn = 0, lastT = 0, running = false;
  var golden = { x: -60, dir: 1 };
  var WALK = ['🚶', '🚶‍♀️', '🚶‍♂️', '🏃', '🏃‍♀️', '🧑‍🦯', '👩‍🦽', '🛹'];
  var onGolden = null;

  function g() { return CS.S && CS.S.g; }
  function canvas() { return document.getElementById('scene'); }

  function rr(x, px, py, w, h, r) {
    x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r);
    x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath();
  }
  function emoji(x, e, px, py, size, flip) {
    x.save(); x.font = size + 'px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    if (flip) { x.translate(px, py); x.scale(-1, 1); x.fillText(e, 0, 0); } else x.fillText(e, px, py);
    x.restore();
  }
  function lighten(hex, amt) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255;
    r = Math.round(r + (255 - r) * amt); gg = Math.round(gg + (255 - gg) * amt); b = Math.round(b + (255 - b) * amt);
    return 'rgb(' + r + ',' + gg + ',' + b + ')';
  }

  function timeOfDay() {
    var h = new Date().getHours() + new Date().getMinutes() / 60;
    if (h >= 7 && h < 17.5) return 'day';
    if ((h >= 17.5 && h < 19.5) || (h >= 5.5 && h < 7)) return 'sunset';
    return 'night';
  }
  function weather(game) {
    var w = ((game.week - 1) % 52 + 52) % 52 + 1;
    if (w <= 8 || w >= 49) return 'snow';
    if (game.economy && game.economy.state === 'recession') return 'rain';
    return 'clear';
  }

  function draw(t) {
    var cv = canvas(), game = g();
    if (!cv || !game) { running = false; return; }
    requestAnimationFrame(draw);
    var dt = Math.min(0.05, (t - (lastT || t)) / 1000); lastT = t;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var W = cv.clientWidth, H = cv.clientHeight;
    if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    var x = cv.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    var tod = timeOfDay(), wx = weather(game), sec = t / 1000;

    // Sky
    var sky = x.createLinearGradient(0, 0, 0, H);
    if (tod === 'day') { sky.addColorStop(0, '#6FD3FF'); sky.addColorStop(1, '#D9F4FF'); }
    else if (tod === 'sunset') { sky.addColorStop(0, '#FF8A65'); sky.addColorStop(1, '#FFE08A'); }
    else { sky.addColorStop(0, '#1B1745'); sky.addColorStop(1, '#3B2F7A'); }
    x.fillStyle = sky; x.fillRect(0, 0, W, H);
    if (tod === 'night') {
      x.fillStyle = '#FFF';
      for (var s = 0; s < 24; s++) { var a = 0.4 + 0.6 * Math.abs(Math.sin(sec * 1.3 + s)); x.globalAlpha = a; x.fillRect((s * 97) % W, (s * 53) % (H * 0.5), 2, 2); }
      x.globalAlpha = 1;
      emoji(x, '🌙', W - 34, 26, 26);
    } else emoji(x, tod === 'sunset' ? '🌅' : '☀️', W - 34, 26, 28);

    // Clouds
    x.globalAlpha = tod === 'night' ? 0.35 : 0.9;
    for (var c = 0; c < 3; c++) emoji(x, '☁️', ((sec * (8 + c * 5) + c * 170) % (W + 120)) - 60, 22 + c * 16, 26 + c * 4);
    x.globalAlpha = 1;

    var ground = H - 44;
    // Rival shop on the right
    var rv = game.rivalCos && game.rivalCos[0];
    if (rv) {
      var rw = 64, rh = 62, rx = W - rw - 10, ry = ground - rh;
      x.fillStyle = lighten(rv.color, 0.55); rr(x, rx, ry, rw, rh, 8); x.fill();
      x.lineWidth = 2.5; x.strokeStyle = '#2B2250'; x.stroke();
      x.fillStyle = rv.color; rr(x, rx - 4, ry - 12, rw + 8, 16, 6); x.fill(); x.stroke();
      emoji(x, rv.logo, rx + rw / 2, ry + 26, 22);
      x.fillStyle = '#2B2250'; x.font = 'bold 9px Nunito, sans-serif'; x.textAlign = 'center';
      x.fillText(rv.name.slice(0, 12), rx + rw / 2, ry - 3);
    }

    // Your building: grows with rank
    var rank = game.rank || 0;
    var bw = Math.min(W * 0.55, 130 + rank * 12), bh = Math.min(H - 70, 78 + rank * 10);
    var bx = Math.max(10, W * 0.36 - bw / 2), by = ground - bh;
    x.fillStyle = lighten(game.company.color, 0.6); rr(x, bx, by, bw, bh, 12); x.fill();
    x.lineWidth = 3; x.strokeStyle = '#2B2250'; x.stroke();
    // Sign
    x.fillStyle = game.company.color; rr(x, bx - 6, by - 20, bw + 12, 26, 10); x.fill(); x.stroke();
    x.fillStyle = '#FFF'; x.font = 'bold 13px Fredoka, Nunito, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(game.company.logo + ' ' + game.company.name.slice(0, 18), bx + bw / 2, by - 7);
    // Windows with workers
    var cols = Math.max(2, Math.floor((bw - 20) / 34)), rows = Math.max(1, Math.floor((bh - 50) / 34));
    var staff = game.employees, k = 0;
    for (var r = 0; r < rows; r++) {
      for (var q = 0; q < cols; q++) {
        var wxp = bx + 12 + q * ((bw - 24) / cols), wyp = by + 12 + r * 34, ww = (bw - 24) / cols - 8;
        x.fillStyle = tod === 'night' ? '#FFE27A' : '#EAF7FF'; rr(x, wxp, wyp, ww, 26, 6); x.fill();
        x.lineWidth = 2; x.stroke();
        var e = staff[k++];
        if (e) emoji(x, e.face, wxp + ww / 2, wyp + 14 + Math.sin(sec * 2 + k) * 1.5, 17);
      }
    }
    // Door
    var dx = bx + bw / 2 - 14, dy = ground - 34;
    var closed = game.mods && game.mods.some(function (m) { return m.type === 'closed'; });
    x.fillStyle = closed ? '#9A93BD' : '#FF8A3D'; rr(x, dx, dy, 28, 34, 6); x.fill(); x.lineWidth = 2.5; x.stroke();
    if (closed) { x.fillStyle = '#FFF'; x.font = 'bold 8px Nunito, sans-serif'; x.fillText('CLOSED', dx + 14, dy + 16); }
    var doorX = dx + 14;

    // Sidewalk and road
    x.fillStyle = '#E2E8F0'; x.fillRect(0, ground, W, 20);
    x.fillStyle = '#CBD5E1'; for (var p = 0; p < W; p += 28) x.fillRect(p, ground, 2, 20);
    x.fillStyle = '#64748B'; x.fillRect(0, ground + 20, W, H - ground - 20);
    x.fillStyle = '#F8FAFC'; for (var l = ((sec * 30) % 40) - 40; l < W; l += 40) x.fillRect(l, ground + 30, 20, 3);

    // Pet by the door
    if (game.pet) emoji(x, game.pet, dx - 20, ground + 6 - Math.abs(Math.sin(sec * 3)) * 4, 20);

    // Queue of waiting customers when you can't serve everyone
    var h = game.history[game.history.length - 1];
    var waiting = h && h.demand > h.capacity ? Math.min(5, Math.ceil((h.demand - h.capacity) / h.demand * 10)) : 0;
    for (var wq = 0; wq < waiting; wq++) emoji(x, '🧍', doorX + 26 + wq * 16, ground + 4, 18);

    // Walkers
    var busy = 0.6 + (game.reputation || 50) / 120 + (game.awareness || 0) / 400;
    if (!closed && t - lastSpawn > 1400 / busy) {
      lastSpawn = t;
      var dir = Math.random() < 0.5 ? 1 : -1;
      walkers.push({ x: dir > 0 ? -20 : W + 20, dir: dir, e: WALK[Math.floor(Math.random() * WALK.length)], speed: 28 + Math.random() * 22, enter: Math.random() < 0.3 + (game.satisfaction || 50) / 250, a: 1 });
    }
    walkers.forEach(function (wk) {
      wk.x += wk.dir * wk.speed * dt;
      if (wk.enter && Math.abs(wk.x - doorX) < 3 && !wk.going) { wk.going = true; floaters.push({ x: doorX, y: ground - 40, txt: U2(), a: 1 }); }
      if (wk.going) wk.a -= dt * 3;
      x.globalAlpha = Math.max(0, wk.a);
      emoji(x, wk.e, wk.x, ground + 8 + Math.abs(Math.sin(wk.x / 6)) * -2, 20, wk.dir > 0);
      x.globalAlpha = 1;
    });
    walkers = walkers.filter(function (wk) { return wk.a > 0 && wk.x > -40 && wk.x < W + 40; });

    // Golden customer
    if (game.golden && !game.golden.tapped) {
      golden.x += golden.dir * 22 * dt;
      if (golden.x > W - 30) golden.dir = -1;
      if (golden.x < 30) golden.dir = 1;
      var gy = ground - 2 + Math.sin(sec * 5) * 3;
      x.save(); x.shadowColor = '#FFD700'; x.shadowBlur = 16 + Math.sin(sec * 6) * 6;
      emoji(x, '🤑', golden.x, gy, 26); x.restore();
      emoji(x, '✨', golden.x + 14, gy - 16 + Math.sin(sec * 7) * 3, 12);
      golden.y = gy;
    }

    // Coins and money floating up
    floaters.forEach(function (f) {
      f.y -= 26 * dt; f.a -= dt * 0.9;
      x.globalAlpha = Math.max(0, f.a);
      if (f.big) emoji(x, f.txt, f.x, f.y, 22);
      else { x.fillStyle = '#15803D'; x.font = 'bold 14px Fredoka, sans-serif'; x.textAlign = 'center'; x.fillText(f.txt, f.x, f.y); }
      x.globalAlpha = 1;
    });
    floaters = floaters.filter(function (f) { return f.a > 0; });

    // Weather
    if (wx !== 'clear') {
      if (flakes.length < (wx === 'snow' ? 40 : 60)) flakes.push({ x: Math.random() * W, y: -10, v: wx === 'snow' ? 18 + Math.random() * 18 : 160 + Math.random() * 80 });
      x.fillStyle = wx === 'snow' ? '#FFFFFF' : 'rgba(180,210,255,0.8)';
      flakes.forEach(function (f) {
        f.y += f.v * dt; if (wx === 'snow') f.x += Math.sin(sec + f.y / 20) * 0.3;
        if (wx === 'snow') { x.beginPath(); x.arc(f.x, f.y, 2.2, 0, 7); x.fill(); } else x.fillRect(f.x, f.y, 1.5, 8);
      });
      flakes = flakes.filter(function (f) { return f.y < H; });
    } else flakes = [];
  }
  function U2() { return U2.list[Math.floor(Math.random() * U2.list.length)]; }
  U2.list = ['+$', '+$$', '💰', '+⭐'];

  function start() {
    if (running) return;
    if (!canvas()) return;
    running = true;
    requestAnimationFrame(draw);
  }

  // Tapping the scene: catch the golden customer.
  document.addEventListener('pointerdown', function (ev) {
    var cv = canvas(), game = g();
    if (!cv || ev.target !== cv || !game || !game.golden || game.golden.tapped) return;
    var rect = cv.getBoundingClientRect(), px = ev.clientX - rect.left, py = ev.clientY - rect.top;
    if (Math.abs(px - golden.x) < 28 && Math.abs(py - (golden.y || 0)) < 30) {
      for (var i = 0; i < 6; i++) floaters.push({ x: golden.x + (Math.random() - 0.5) * 50, y: golden.y - 10 - Math.random() * 20, txt: '🪙', a: 1.2, big: true });
      if (onGolden) onGolden();
    }
  });

  return { start: start, onGolden: function (f) { onGolden = f; }, burst: function (txt) { var cv = canvas(); if (cv) floaters.push({ x: cv.clientWidth * 0.36, y: 60, txt: txt, a: 1.4, big: true }); } };
})();
