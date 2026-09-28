// Screens, event cards, mini-games, celebrations, sounds and effects.
// Every screen is a function that returns HTML; clicks go through data-a="action" attributes.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var U = CS.U, G = CS.G, esc = U.esc, M = U.money;

  var S = CS.S = {
    g: null, screen: 'title', tab: 'home', sheet: null, sheetKey: null, viewKey: null, overlays: [], started: false,
    settings: G.settings(), prev: null,
    create: { step: 0, name: '', logo: '☕', color: CS.COLORS[0], avatar: '😎', tier: 'small', industry: 'cafe', city: 'berlin', funding: 'savings' }
  };
  if (S.settings.music == null) S.settings.music = true;
  var $app, $sheet, $toast, $over, toastTimer, tapState = null;
  var reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ================= sound, buzz, confetti, toast =================

  var SFX = (function () {
    var ctx = null;
    function ac() { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } } return ctx; }
    var SETS = {
      tap: [[700, 0.04, 'sine', 0.04, 0]],
      pop: [[520, 0.06, 'triangle', 0.06, 0], [780, 0.06, 'triangle', 0.05, 0.05]],
      coin: [[988, 0.07, 'square', 0.04, 0], [1319, 0.16, 'square', 0.04, 0.07]],
      good: [[523, 0.1, 'triangle', 0.08, 0], [659, 0.1, 'triangle', 0.08, 0.1], [784, 0.2, 'triangle', 0.08, 0.2]],
      bad: [[330, 0.14, 'sawtooth', 0.04, 0], [220, 0.26, 'sawtooth', 0.04, 0.13]],
      level: [[523, 0.1, 'square', 0.05, 0], [659, 0.1, 'square', 0.05, 0.1], [784, 0.1, 'square', 0.05, 0.2], [1047, 0.35, 'square', 0.05, 0.3]],
      tick: [[1200, 0.02, 'square', 0.02, 0]],
      whoosh: [[200, 0.25, 'sine', 0.05, 0], [500, 0.2, 'sine', 0.03, 0.05]],
      page: [[300, 0.05, 'triangle', 0.05, 0], [450, 0.05, 'triangle', 0.05, 0.08], [600, 0.08, 'triangle', 0.05, 0.16]],
      power: [[392, 0.08, 'square', 0.05, 0], [523, 0.08, 'square', 0.05, 0.07], [784, 0.08, 'square', 0.05, 0.14], [1047, 0.2, 'sawtooth', 0.03, 0.21]]
    };
    function play(name) {
      if (!S.settings.sound) return;
      var a = ac(); if (!a) return;
      try {
        if (a.state === 'suspended') a.resume();
        (SETS[name] || []).forEach(function (n) {
          var o = a.createOscillator(), v = a.createGain(), t = a.currentTime + n[4];
          o.type = n[2]; o.frequency.setValueAtTime(n[0], t);
          v.gain.setValueAtTime(n[3], t); v.gain.exponentialRampToValueAtTime(0.0001, t + n[1]);
          o.connect(v); v.connect(a.destination); o.start(t); o.stop(t + n[1] + 0.02);
        });
      } catch (e) {}
    }
    return { play: play };
  })();
  function buzz(p) { if (S.settings.vibe && navigator.vibrate) try { navigator.vibrate(p); } catch (e) {} }
  function confetti(n) {
    if (reduced) return;
    var cols = ['#FF5FA2', '#FFC93C', '#22C55E', '#2EA8FF', '#7C4DFF', '#FF8A3D'];
    for (var i = 0; i < (n || 60); i++) {
      var d = document.createElement('div');
      d.className = 'confetti';
      d.style.left = Math.random() * 100 + 'vw';
      d.style.background = cols[i % cols.length];
      d.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
      d.style.animationDelay = (Math.random() * 0.3) + 's';
      document.body.appendChild(d);
      setTimeout(function (el) { el.remove(); }.bind(null, d), 3800);
    }
  }
  function coinBurst(n) {
    if (reduced) return;
    for (var i = 0; i < (n || 12); i++) {
      var d = document.createElement('div');
      d.className = 'coin-fly'; d.textContent = '🪙';
      d.style.left = (40 + Math.random() * 20) + 'vw'; d.style.top = '55vh';
      d.style.setProperty('--dx', ((Math.random() - 0.5) * 60) + 'vw');
      d.style.animationDelay = (i * 0.04) + 's';
      document.body.appendChild(d);
      setTimeout(function (el) { el.remove(); }.bind(null, d), 1600);
    }
  }
  function shake() {
    var el = document.querySelector('.sheet');
    if (!el || reduced) return;
    el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
  }
  function toast(msg) {
    $toast.innerHTML = '<div class="toast" role="status">' + esc(msg) + '</div>';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $toast.innerHTML = ''; }, 2600);
  }
  // Sound and effects for a result, based on what changed.
  function celebrate(res) {
    if (!res) return;
    var chips = res.chips || [], good = chips.filter(function (c) { return c.good; }).length, bad = chips.length - good;
    queueCelebrations(res);
    if ((res.post && res.post.viral)) { SFX.play('level'); confetti(80); buzz([30, 40, 30]); }
    else if (good > bad) {
      var money = chips.some(function (c) { return c.good && c.txt.indexOf('💰') >= 0; });
      SFX.play(money ? 'coin' : 'good'); if (money) coinBurst(10);
    } else if (bad > good) { SFX.play('bad'); buzz(60); setTimeout(shake, 50); }
    else SFX.play('pop');
  }

  // ================= big celebrations (level up, rank up, cup) =================

  // later: wait until the current sheet is closed before showing them.
  function queueCelebrations(r, later) {
    (r.levelUps || []).forEach(function (l) { S.overlays.push({ kind: 'level', level: l.level, gift: l.gift }); });
    if (r.rankUp != null) S.overlays.push({ kind: 'rank', rank: r.rankUp });
    if (r.cup) S.overlays.push({ kind: 'cup', cup: r.cup });
    (r.unlocked || []).forEach(function (a) { S.overlays.push({ kind: 'ach', a: a }); });
    if (!later) showOverlay();
  }
  function showOverlay() {
    if ($over.innerHTML || !S.overlays.length) return;
    var o = S.overlays.shift(), h;
    if (o.kind === 'level') h = '<div class="burst"></div><div class="ov-e">🎖️</div><h1>LEVEL UP!</h1><p>You are now <b>CEO level ' + o.level + '</b></p><div class="chip gold">🎁 Gift: ' + M(o.gift) + '</div><p class="small">New upgrades and ads may be unlocked!</p>';
    else if (o.kind === 'rank') h = '<div class="burst"></div><div class="ov-e">' + CS.RANKS[o.rank].emoji + '</div><h1>RANK UP!</h1><p>Your company is now a</p><div class="rank-big">' + CS.RANKS[o.rank].name + '</div>';
    else if (o.kind === 'ach') h = '<div class="burst"></div><div class="ov-e">' + o.a.emoji + '</div><h1>ACHIEVEMENT!</h1><div class="rank-big">' + esc(o.a.name) + '</div><p class="small">' + esc(o.a.desc) + '</p>';
    else {
      var c = o.cup, medal = ['🥇', '🥈', '🥉', '4️⃣'][c.place - 1];
      h = '<div class="burst"></div><div class="ov-e">' + (c.place === 1 ? '🏆' : medal) + '</div><h1>' + (c.place === 1 ? 'CHAMPIONS!' : 'Business Cup') + '</h1><p>You finished <b>#' + c.place + '</b> this season!</p>' +
        '<div class="cup-board">' + c.board.map(function (b) { return '<div class="' + (b.me ? 'me' : '') + '"><span>' + ['🥇', '🥈', '🥉', '4️⃣'][b.place - 1] + '</span><span>' + esc(b.logo) + ' ' + esc(b.name) + '</span><b>' + U.short(b.sales) + '</b></div>'; }).join('') + '</div>' +
        (c.cash ? '<div class="chip gold">💰 Prize: ' + M(c.cash) + '</div>' : '<p class="small">No prize this time. Next season!</p>');
    }
    $over.innerHTML = '<div class="overlay" data-a="closeov"><div class="ov-card">' + h + '<button class="btn yellow big block" data-a="closeov">Awesome! ✨</button></div></div>';
    SFX.play('level'); confetti(o.kind === 'cup' && o.cup.place > 1 ? 30 : 90); buzz([40, 30, 40]);
  }

  // ================= small building blocks =================

  function ind(g) { return CS.IND[g.company.industry]; }
  function logo(c, size) { return '<span class="logo" style="background:' + esc(c.color) + (size ? ';width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.55) + 'px' : '') + '">' + esc(c.logo) + '</span>'; }
  function face(e, mood) {
    return '<span class="face" style="background:hsl(' + (e.hue || 200) + ' 80% 85%)">' + esc(e.face || '🙂') +
      (mood ? '<span class="mood">' + G.moodFace(e.morale) + '</span>' : '') + '</span>';
  }
  function tone(v) { return v >= 60 ? '' : v >= 35 ? 'mid' : 'low'; }
  function bar(pct, cls) { pct = U.clamp(pct, 0, 100); return '<div class="bar ' + (cls || '') + '"><i class="' + tone(pct) + '" style="width:' + pct.toFixed(1) + '%"></i></div>'; }
  function weekLabel(g) {
    if (g.mode === 'daily') return 'Daily #' + g.dailyNum + ' · Week ' + g.week + '/' + G.DAILY_WEEKS;
    var w = g.week; if (w < 1) return 'Opening day!';
    return 'Year ' + (Math.floor((w - 1) / 52) + 1) + ' · Week ' + (((w - 1) % 52) + 1);
  }
  function traitChip(e, i) {
    if (!G.traitKnown(e, i)) return '<span class="trait unk">❓ Hidden</span>';
    var t = CS.TRAITS[e.traits[i]];
    return '<span class="trait ' + (t.good ? 'good' : 'bad') + '" title="' + esc(t.desc) + '">' + t.emoji + ' ' + t.label + '</span>';
  }
  function F(v, x) { return esc(G.fill(v, S.g, x ? x.ctx : {})); }
  function catOf(def) { return CS.CATS[def.cat] || CS.CATS.business; }
  function rarityTag(def) { var r = def.rarity || 'common'; return r === 'common' ? '' : '<span class="rarity ' + r + '">' + CS.RARITY[r].label + '</span>'; }
  function countUp(v, fmt, from) { return '<span data-count="' + v + '" data-from="' + (from || 0) + '" data-fmt="' + fmt + '">' + fmtVal(from || 0, fmt) + '</span>'; }
  function fmtVal(v, fmt) { return fmt === 'signed' ? U.signed(v) : fmt === 'money' ? M(v) : fmt === 'short' ? U.short(v) : U.num(v); }
  function vip() { return G.isVIP(); }
  function stagger(i) { return ' style="--i:' + i + '"'; }

  // ================= mentor tips =================

  function mentorTip(g) {
    var h = g.history[g.history.length - 1];
    var fronts = U.plural(ind(g).front.toLowerCase());
    if (g.week === 0) return 'Hi boss! I\'m <b>Ollie</b> 🦉 I\'ll help you. Press the big green <b>NEXT WEEK</b> button to open your shop!';
    if (g.cash < 0) return 'Uh oh, you\'re out of money! 😱 Get a <b>loan</b> in the Money tab, or you will go bankrupt in ' + Math.max(0, 8 - g.negWeeks) + ' weeks.';
    if (g.golden && !g.golden.tapped) return 'A <b>golden customer</b> 🤑 is walking by your shop! Tap them in the picture for bonus cash!';
    if (G.readyMissions(g)) return 'A mission is done! Tap <b>CLAIM</b> to get your reward! 🎁';
    if (h && h.demand > h.capacity * 1.1) return 'People are waiting in line! 🧍🧍 Hire more <b>' + fronts + '</b> in the Team tab!';
    if (g.employees.length > 5 && !g.employees.some(function (e) { return e.role === 'mgr'; })) return 'Your team is getting big! Hire a <b>Manager</b> 👔. Each one keeps 8 people happy.';
    if (G.avgMorale(g) < 40) return 'Your team is sad 😟. Use the <b>Team Party</b> power, give raises, or buy a Fun Break Room.';
    if (g.week >= 1 && CS.POWERS.some(function (p) { return G.powerReadyIn(g, p.id) === 0; }) && g.week <= 12) return 'Try a <b>Boss Power</b> ⚡! They are free and recharge after a few weeks.';
    if (!g.posted && g.week >= 1) return 'Post on social media once a week to get <b>followers</b>! 📱 Tap the pink Post button.';
    if (g.week <= 3) return 'Every week, new things happen! Make choices and watch your ⭐ 😊 💪 📱 go up.';
    if (g.week % G.CUP_WEEKS >= G.CUP_WEEKS - 3) return 'The <b>Business Cup</b> 🏆 ends in ' + (G.CUP_WEEKS - g.week % G.CUP_WEEKS) + ' weeks! Sell more than your rivals to win!';
    if (g.cash > G.upCost(g, 'equip') * 2 && !g.stats.upgrades) return 'You have money to spare! Buy an upgrade in the <b>Shop</b> 🛠️';
    return null;
  }

  var STAT_INFO = {
    rep: { e: '⭐', t: 'Reputation', d: 'How much people trust your company. High reputation brings more customers. It goes up slowly when customers are happy.' },
    happy: { e: '😊', t: 'Customer happiness', d: 'How happy your customers are right now. Serve everyone quickly, keep prices fair, and hire skilled workers to raise it.' },
    mood: { e: '💪', t: 'Team mood', d: 'How happy your workers are. Sad workers are slower and may quit. Fair pay, managers, friends, pets and the break room help.' },
    fans: { e: '📱', t: 'Followers', d: 'People who follow you online. Post every week, run ads and go viral to get more. More fans means more customers.' }
  };

  // ================= title =================

  function titleScreen() {
    var saved = G.load('main'), L = G.loadLegacy(), daily = G.dailyInfo(), dsave = G.load('daily'), best = G.dailyBest()[daily.dailyNum];
    var fl = '';
    ['🏢', '💰', '☕', '🚀', '⭐', '📈', '🍩', '💎', '🎁', '📱', '🍌', '⚽'].forEach(function (e, i) {
      fl += '<span style="left:' + (i * 8 + 2) + '%;animation-duration:' + (9 + (i * 7) % 8) + 's;animation-delay:-' + (i * 1.3) + 's">' + e + '</span>';
    });
    var h = '<div class="floaters" aria-hidden="true">' + fl + '</div><div class="wrap title-screen enter">' +
      '<div class="logo-big"><div class="bld">🏢</div><h1>COMPANY<br><span>SIMULATOR</span></h1><p>Start small. Make choices. Build a giant company! 🚀</p></div>';
    if (saved) {
      h += '<button class="card cont-card" data-a="continue">' + logo(saved.company, 52) + '<span class="grow"><b style="font-family:var(--display);font-size:18px">▶ Continue</b><br><span>' + esc(saved.company.name) + '</span><br><small class="muted">' + weekLabel(saved) + ' · ' + M(saved.cash) + '</small></span></button>';
    }
    h += '<button class="btn green big block" data-a="new">✨ New Company</button>';
    var dind = CS.IND[daily.industry];
    h += '<div class="card daily-card"><div class="row"><span class="ico">📅</span><div style="flex:1"><b style="font-family:var(--display);font-size:18px">Daily Challenge #' + daily.dailyNum + '</b><br>' +
      '<small>Everyone gets the same company today: ' + dind.emoji + ' ' + esc(daily.name) + '. Play 52 weeks and share your score!</small>' +
      (best ? '<br><small><b>Your best today: ' + U.short(best) + '</b></small>' : '') + '</div></div>' +
      '<button class="btn yellow block" style="margin-top:10px" data-a="daily">' + (dsave && !dsave.over ? '▶ Continue challenge' : dsave && dsave.over ? '🏁 See today\'s result' : '🎯 Play today\'s challenge') + '</button></div>';
    h += vip() ? '<div class="card vip-card"><b>👑 You are VIP!</b> <small>All VIP companies and perks are unlocked.</small></div>'
      : '<button class="card vip-card" data-a="vip"><span style="font-size:34px">👑</span><span style="flex:1;text-align:left"><b style="font-family:var(--display);font-size:18px">Go VIP</b><br><small>VIP companies, double gifts, faster powers and more!</small></span><span class="chip gold">Unlock</span></button>';
    h += '<div class="card" style="display:flex;justify-content:space-between;gap:10px;align-items:center"><span>📖 Event Book</span><b class="num">' + G.bookCount() + ' / ' + CS.EVENTS.length + ' found</b></div>';
    if (L.companies.length) {
      h += '<div class="card"><b style="font-family:var(--display);font-size:17px">🏆 Your old companies</b>';
      L.companies.slice(0, 3).forEach(function (c) { h += '<div class="news-item"><span>' + esc(c.logo) + '</span><span style="flex:1"><b>' + esc(c.name) + '</b> · ' + c.weeks + ' weeks</span><span class="num">' + U.short(c.peakCash) + '</span></div>'; });
      h += '<small class="muted">Each old company gives your next one +5% starting cash.</small></div>';
    }
    h += '<div class="title-foot"><button class="btn small" data-a="togglemusic">' + (S.settings.music ? '🎵 Music on' : '🔇 Music off') + '</button></div>';
    return h + '</div>';
  }

  // ================= create =================

  function createScreen() {
    var c = S.create, step = c.step, h = '<div class="wrap create enter">';
    h += '<div class="steps">' + [0, 1, 2, 3].map(function (i) { return '<i class="' + (i <= step ? 'on' : '') + '"></i>'; }).join('') + '</div>';
    if (step === 0) {
      h += '<h2>Name your company!</h2><p class="sub">Pick a cool name, a logo and YOUR face as the boss. ✨</p>';
      h += '<div class="card"><div class="preview" style="margin-bottom:14px">' + logo(c) + '<span class="boss-face">' + c.avatar + '</span><strong id="cprev">' + esc(c.name || 'Your Company') + '</strong></div>' +
        '<div class="field"><label class="label" for="cname">Company name</label><div class="name-row"><input id="cname" maxlength="24" autocomplete="off" placeholder="Type a name..." value="' + esc(c.name) + '"><button class="btn yellow" data-a="randname" aria-label="Random name">🎲</button></div></div>' +
        '<div class="field"><span class="label">You, the boss</span><div class="logo-grid">' + CS.AVATARS.map(function (a) { return '<button data-a="avatar" data-v="' + a + '" class="' + (c.avatar === a ? 'on' : '') + '">' + a + '</button>'; }).join('') + '</div></div>' +
        '<div class="field"><span class="label">Logo</span><div class="logo-grid">' + CS.LOGOS.concat(vip() ? CS.VIP_LOGOS : []).map(function (l) { return '<button data-a="logo" data-v="' + l + '" class="' + (c.logo === l ? 'on' : '') + '">' + l + '</button>'; }).join('') +
        (vip() ? '' : '<button data-a="vip" class="locked" aria-label="VIP logos">👑</button>') + '</div></div>' +
        '<div class="field" style="margin:0"><span class="label">Color</span><div class="color-row">' + CS.COLORS.map(function (col) { return '<button data-a="color" data-v="' + col + '" class="' + (c.color === col ? 'on' : '') + '" style="background:' + col + '" aria-label="Color"></button>'; }).join('') + '</div></div></div>';
    } else if (step === 1) {
      h += '<h2>What will you run?</h2><p class="sub">' + CS.INDUSTRIES.length + ' kinds of company! Each has different workers and problems.</p>';
      h += '<div class="tabs">' + Object.keys(CS.TIERS).map(function (t) { var tr = CS.TIERS[t]; return '<button data-a="tier" data-v="' + t + '" class="' + (c.tier === t ? 'on' : '') + '">' + tr.label + '<small>' + '⭐'.repeat(tr.stars) + '</small></button>'; }).join('') + '</div>';
      h += '<p class="tier-note">' + CS.TIERS[c.tier].blurb + ' You start with <b>' + M(CS.TIERS[c.tier].cash) + '</b>.</p><div class="pick-grid">';
      CS.INDUSTRIES.filter(function (i) { return i.tier === c.tier; }).forEach(function (i, n) {
        var locked = i.vip && !vip();
        h += '<button class="pick ' + (c.industry === i.id ? 'on' : '') + (locked ? ' locked' : '') + '" data-a="industry" data-v="' + i.id + '"' + stagger(n) + '>' + (i.vip ? '<span class="vip-tag">👑 VIP</span>' : '') + '<span class="e">' + i.emoji + '</span><b>' + i.name + '</b><small>' + U.plural(i.front) + '</small></button>';
      });
      h += '</div>';
    } else if (step === 2) {
      h += '<h2>Pick a city!</h2><p class="sub">Big cities have more customers, but cost more.</p><div class="pick-list">';
      Object.keys(CS.CITIES).forEach(function (k, n) {
        var ci = CS.CITIES[k];
        h += '<button class="pick-row ' + (c.city === k ? 'on' : '') + '" data-a="city" data-v="' + k + '"' + stagger(n) + '><span class="e">' + ci.flag + '</span><span class="grow"><b>' + ci.name + '</b><small>' + ci.note + '</small></span><span class="side">👥 ' + '●'.repeat(Math.round(ci.demand * 3)) + '<br>💸 ' + '●'.repeat(Math.max(1, Math.round(ci.rent * 2.2))) + '</span></button>';
      });
      h += '</div>';
    } else {
      var i = CS.IND[c.industry], tr = CS.TIERS[i.tier];
      h += '<h2>Where\'s the money from?</h2><p class="sub">More money now = less of the company for you.</p><div class="pick-list">';
      Object.keys(CS.FUNDING).forEach(function (k, n) {
        var f = CS.FUNDING[k];
        h += '<button class="pick-row ' + (c.funding === k ? 'on' : '') + '" data-a="funding" data-v="' + k + '"' + stagger(n) + '><span class="e">' + f.emoji + '</span><span class="grow"><b>' + f.name + '</b><small>' + f.note + '</small></span><span class="side"><b class="num">' + U.short(tr.cash * (f.cash + f.loan)) + '</b><br>you own ' + Math.round(100 * f.own * (tr.startOwnership || 1)) + '%</span></button>';
      });
      h += '</div><div class="card section"><div class="preview">' + logo(c) + '<span class="boss-face">' + c.avatar + '</span><div><strong>' + esc(c.name || 'Your Company') + '</strong><br><span class="muted">' + i.emoji + ' ' + i.name + ' in ' + CS.CITIES[c.city].flag + ' ' + CS.CITIES[c.city].name + '</span></div></div>' +
        (tr.startDebt ? '<p class="hint bad" style="margin-bottom:0">Hard mode: you start with ' + M(tr.cash * tr.startDebt) + ' of debt and other owners.</p>' : '') + '</div>';
    }
    h += '</div><div class="create-bar"><div class="wrap"><button class="btn" data-a="cback">' + (step === 0 ? '✖ Cancel' : '◀ Back') + '</button>' +
      (step < 3 ? '<button class="btn green" data-a="cnext">Next ▶</button>' : '<button class="btn green" data-a="start">🚀 Open for business!</button>') + '</div></div>';
    return h;
  }

  // ================= game shell =================

  function hud(g) {
    var need = G.xpNeed(g.level), pct = g.xp / need, r = 18, C = 2 * Math.PI * r;
    var rank = CS.RANKS[g.rank], prevCash = S.prev ? S.prev.cash : g.cash;
    return '<header class="hud"><div class="wrap"><span class="hud-logo">' + logo(g.company) + '<span class="hud-boss">' + esc(g.avatar || '😎') + '</span></span>' +
      '<div class="who"><b>' + esc(g.company.name) + (vip() ? ' <span class="vip-badge">👑</span>' : '') + '</b><small>' + weekLabel(g) + '</small><br><span class="rank">' + rank.emoji + ' ' + rank.name + '</span></div>' +
      '<span class="coin ' + (g.cash < 0 ? 'neg' : '') + (prevCash !== g.cash ? ' bump' : '') + '"><i>$</i>' + (prevCash !== g.cash ? countUp(Math.round(g.cash), 'short', Math.round(prevCash)) : U.short(g.cash)) + '</span>' +
      '<button class="lvl" data-a="tab" data-v="more" aria-label="CEO level ' + g.level + '"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="' + r + '" fill="#3D3470" stroke="#554A8F" stroke-width="5"/><circle cx="22" cy="22" r="' + r + '" fill="none" stroke="#FFC93C" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + (C * pct).toFixed(1) + ' ' + C.toFixed(1) + '"/></svg><span class="n">' + g.level + '</span><small>LVL</small></button>' +
      '</div></header>';
  }

  function gameScreen() {
    var g = S.g;
    var h = '<div class="game">' + hud(g) + '<main class="wrap tabview">' + ({ home: homeTab, team: teamTab, shop: shopTab, ads: adsTab, money: moneyTab, more: moreTab, settings: settingsTab, war: warTab })[S.tab](g) + '</main>';
    var pend = g.queue.length;
    h += '<div class="dock"><div class="wrap"><button class="next ' + (pend ? 'pending' : '') + '" data-a="' + (pend ? 'events' : 'next') + '">' +
      (pend ? '⚡ ' + pend + ' THING' + (pend > 1 ? 'S' : '') + ' TO DECIDE' : '▶ NEXT WEEK') + '<span class="wk">Week ' + (g.week + 1) + '</span></button></div></div>';
    var ready = G.readyMissions(g), gift = g.mode === 'main' && G.giftStatus().available;
    h += '<nav class="nav"><div class="wrap">' + [['home', '🏠', 'Home', ready + (gift ? 1 : 0) + (g.golden && !g.golden.tapped ? 1 : 0)], ['team', '👥', 'Team', 0], ['shop', '🛠️', 'Shop', upgradesReady(g) ? 1 : 0], ['ads', '📺', 'Ads', G.adsReady(g)], ['money', '💰', 'Money', g.cash < 0 ? 1 : 0], ['more', '🏆', 'Goals', 0], ['settings', '⚙️', 'Settings', g.mode === 'main' && G.shareGameReady() ? 1 : 0]].map(function (t) {
      return '<button data-a="tab" data-v="' + t[0] + '" class="' + (S.tab === t[0] ? 'on' : '') + '"><span class="e">' + t[1] + '</span>' + t[2] + (t[3] ? '<span class="badge">' + t[3] + '</span>' : '') + '</button>';
    }).join('') + '</div></nav></div>';
    return h;
  }

  // ---------- home ----------

  function homeTab(g) {
    var h = '', tip = mentorTip(g), last = g.history[g.history.length - 1], p = S.prev;
    h += '<div class="section scene-card"><canvas id="scene" aria-label="Your shop"></canvas>' +
      (g.golden && !g.golden.tapped ? '<div class="scene-hint">👆 Tap the golden customer 🤑!</div>' : '') + '</div>';
    if (tip) h += '<div class="section mentor"><span class="owl">🦉</span><div class="bubble">' + tip + '</div></div>';
    if (g.mode === 'main' && G.giftStatus().available) h += '<button class="card gift-banner section" data-a="gift"><span class="e">🎁</span><span><b style="font-family:var(--display);font-size:18px">Daily gift is ready!</b><br><small>Day ' + G.giftStatus().day + ' of 7' + (vip() ? ' · 👑 VIP: double gift!' : ' · come back every day for bigger gifts') + '</small></span></button>';

    h += '<div class="section stats4">' +
      statBubble('rep', '⭐', Math.round(g.reputation), 'Rep', g.reputation, p && Math.round(g.reputation - p.rep)) +
      statBubble('happy', '😊', Math.round(g.satisfaction), 'Happy', g.satisfaction, p && Math.round(g.satisfaction - p.happy)) +
      statBubble('mood', '💪', Math.round(G.avgMorale(g)), 'Team', G.avgMorale(g), p && Math.round(G.avgMorale(g) - p.mood)) +
      statBubble('fans', '📱', U.num(g.followers), 'Fans', Math.min(100, g.awareness / G.awCap(g) * 100), p && (g.followers - p.fans), true) + '</div>';

    if (last) {
      var capPct = last.demand > 0 ? Math.min(100, last.served / last.demand * 100) : 100;
      h += '<div class="section card week-card"><div class="top"><div><span class="label">Last week</span><div class="big-money ' + (last.net >= 0 ? 'good' : 'bad') + '">' + U.signed(last.net) + '</div></div>' +
        (g.streak >= 2 ? '<span class="chip gold fire">🔥 ' + g.streak + ' week streak</span>' : '<span class="chip">' + CS.ECON[g.economy.state].emoji + ' ' + CS.ECON[g.economy.state].name + '</span>') + '</div>' +
        '<div class="served">' + ind(g).emoji + ' Served <b>' + U.num(last.served) + '</b> of <b>' + U.num(last.demand) + '</b> ' + ind(g).unit + bar(capPct) + '</div>' +
        (last.capacity < last.demand * 0.97 ? '<div class="hint bad">🧍 ' + U.num(last.demand - last.served) + ' customers left without buying! Hire more ' + U.plural(ind(g).front.toLowerCase()) + '.</div>' : '') + '</div>';
    }

    // Boss powers
    h += '<div class="section"><div class="section-head"><h3>⚡ Boss Powers</h3><span class="label">Free! Recharge weekly</span></div><div class="powers">';
    CS.POWERS.forEach(function (pw, i) {
      var left = G.powerReadyIn(g, pw.id), cd = G.powerCd(g, pw);
      h += '<button class="power ' + (left ? 'cooling' : 'ready') + '" data-a="power" data-v="' + pw.id + '"' + stagger(i) + (left ? ' disabled' : '') + '>' +
        '<span class="e">' + pw.emoji + '</span><b>' + pw.name + '</b><small>' + (left ? '⏳ ' + left + ' wk' + (left > 1 ? 's' : '') : pw.desc) + '</small>' +
        (left ? '<i class="cd" style="height:' + Math.round(left / cd * 100) + '%"></i>' : '') + '</button>';
    });
    h += '</div></div>';

    // Company Wars
    var wr = G.warInit(g), wrank = CS.WAR_RANKS[G.warRankIndex(g)];
    h += '<button class="section card war-banner" data-a="tab" data-v="war"><span class="e">⚔️</span><span class="grow"><b>Company Wars</b><small>' + wrank.emoji + ' ' + wrank.name + ' · 🏆 ' + wr.trophies + ' trophies · ' + '⚡'.repeat(wr.energy) + '<span class="faint">' + '⚡'.repeat(Math.max(0, G.warMaxEnergy() - wr.energy)) + '</span></small></span><span class="chip ' + (wr.energy ? 'gold' : '') + '">' + (wr.energy ? 'FIGHT!' : 'Open') + '</span></button>';

    // Missions
    h += '<div class="section"><div class="section-head"><h3>🎯 Missions</h3><span class="label">' + (vip() ? '👑 4 slots' : 'Rewards!') + '</span></div><div class="card">';
    g.missions.forEach(function (m, i) {
      var pr = G.missionProgress(g, m), done = pr[0] >= pr[1];
      h += '<div class="mission' + (done ? ' done' : '') + '"><span class="e">' + m.emoji + '</span><div class="grow"><b>' + esc(G.missionText(m)) + '</b><small>💰 ' + U.short(m.reward) + ' · ⭐ ' + m.xp + ' XP</small>' + bar(pr[0] / pr[1] * 100) + '</div>' +
        (done ? '<button class="btn small yellow" data-a="claim" data-v="' + i + '">CLAIM</button>' : '<small class="num">' + (m.id === 'cash' ? U.short(pr[0]) : U.num(pr[0])) + '/' + (m.id === 'cash' ? U.short(pr[1]) : U.num(pr[1])) + '</small>') + '</div>';
    });
    h += '</div></div>';

    // Rivals and the Business Cup
    var board = G.cupBoard(g), left = G.CUP_WEEKS - (g.week % G.CUP_WEEKS), top = Math.max.apply(null, board.map(function (b) { return b.sales; }).concat([1]));
    h += '<div class="section"><div class="section-head"><h3>🥊 Business Cup</h3><span class="label">Ends in ' + left + ' wk' + (left > 1 ? 's' : '') + '</span></div><div class="card rivals">';
    board.forEach(function (b, i) {
      h += '<div class="rv-row ' + (b.me ? 'me' : '') + '"' + stagger(i) + '><span class="pl">' + ['🥇', '🥈', '🥉', '4️⃣'][i] + '</span><span class="logo" style="background:' + esc(b.color) + '">' + esc(b.logo) + '</span>' +
        '<span class="grow"><b>' + esc(b.name) + (b.me ? ' (you)' : '') + '</b><span class="rv-bar"><i style="width:' + (b.sales / top * 100).toFixed(1) + '%;background:' + esc(b.color) + '"></i></span></span><span class="num">' + U.short(b.sales) + '</span></div>';
    });
    h += '<small class="muted">Sell more than your rivals this season to win prizes! 🏆 You have ' + (g.cups.gold || 0) + ' gold cup' + (g.cups.gold === 1 ? '' : 's') + '.</small></div></div>';

    h += '<div class="section"><div class="section-head"><h3>⚡ Actions</h3></div><div class="actions">' +
      '<button class="action ' + (g.posted ? 'done' : 'pink') + '" data-a="' + (g.posted ? 'noop' : 'post') + '"><span class="e">📱</span>' + (g.posted ? 'Posted ✓' : 'Post') + '<small>' + (g.posted ? 'next week' : '1 free per week') + '</small></button>' +
      '<button class="action orange" data-a="tab" data-v="shop"><span class="e">📢</span>Ads<small>get fans</small></button>' +
      '<button class="action purple" data-a="tab" data-v="shop"><span class="e">🛠️</span>Upgrades<small>' + upgradesReady(g) + ' ready</small></button></div></div>';

    h += '<div class="section"><div class="section-head"><h3>🏷️ Prices</h3></div><div class="seg">' + [['💚', 'Cheap', '+25% customers'], ['👍', 'Normal', 'balanced'], ['💎', 'Fancy', '+30% per sale']].map(function (pp, i) {
      return '<button data-a="price" data-v="' + i + '" class="' + (g.price === i ? 'on' : '') + '">' + pp[0] + ' ' + pp[1] + '<small>' + pp[2] + '</small></button>';
    }).join('') + '</div></div>';

    if (g.mods.length) {
      h += '<div class="section card"><span class="label">Happening now</span><div class="mods" style="margin-top:6px">' + g.mods.map(function (m) {
        return '<div class="mod"><span>' + (G.modGood(m) ? '📈' : '📉') + ' ' + esc(m.label) + '</span><span class="faint">' + m.weeks + ' wk' + (m.weeks > 1 ? 's' : '') + '</span></div>';
      }).join('') + '</div></div>';
    }
    h += '<div class="section"><div class="section-head"><h3>📰 News</h3></div><div class="card">' + newsList(g.news.slice(0, 4)) + '</div></div>';
    return h;
  }
  function statBubble(k, e, val, label, pct, delta, isFans) {
    var d = delta ? '<span class="delta ' + (delta > 0 ? 'up' : 'down') + '">' + (delta > 0 ? '+' : '') + (isFans ? U.num(delta) : delta) + '</span>' : '';
    return '<button class="stat ' + k + (delta ? ' bump' : '') + '" data-a="stat" data-v="' + k + '"><div class="e">' + e + '</div><b>' + val + '</b><small>' + label + '</small><div class="mini"><i style="width:' + U.clamp(pct, 0, 100).toFixed(0) + '%"></i></div>' + d + '</button>';
  }
  function upgradesReady(g) {
    return CS.UPGRADES.filter(function (u) { var c = G.upCost(g, u.id); return c && g.cash >= c && g.level >= G.upNeedLevel(g, u.id); }).length;
  }
  function newsList(items) {
    if (!items.length) return '<p class="faint" style="margin:0">No news yet.</p>';
    return items.map(function (n) { return '<div class="news-item ' + n.tone + '"><span class="wk">W' + n.week + '</span><span>' + esc(n.text) + '</span></div>'; }).join('');
  }

  // ---------- team ----------

  function personRow(g, e, cand, i) {
    return '<button class="person" data-a="' + (cand ? 'cand' : 'emp') + '" data-v="' + e.id + '"' + stagger(i || 0) + '>' + face(e, !cand) +
      '<span class="grow"><b>' + esc(e.name) + '</b><small>' + (CS.ROLES[e.role].emoji || ind(g).emoji) + ' ' + G.title(g, e) + ' · ' + U.short(e.salary) + '/wk</small></span>' +
      '<span class="side"><span>Skill ' + Math.round(e.skill) + '</span><span class="skillbar"><i style="width:' + Math.round(e.skill) + '%"></i></span>' + (cand ? traitChip(e, 0) : '') + '</span></button>';
  }
  function teamTab(g) {
    var f = G.compute(g, true);
    var payroll = g.employees.reduce(function (s, e) { return s + e.salary; }, 0);
    var h = '<div class="section card"><div class="summary3"><div><b>' + g.employees.length + '</b><small>👥 Workers</small></div><div><b>' + U.short(payroll) + '</b><small>💸 Pay/week</small></div><div><b>' + G.moodFace(G.avgMorale(g)) + ' ' + Math.round(G.avgMorale(g)) + '</b><small>Team mood</small></div></div>' +
      '<div class="served">Your team can serve <b>' + U.num(f.capacity) + '</b> ' + ind(g).unit + '. About <b>' + U.num(f.demand) + '</b> customers want to buy.' + bar(f.demand ? Math.min(100, f.capacity / f.demand * 100) : 100) + '</div>' +
      (f.capacity < f.demand * 0.97 ? '<div class="hint bad">Not enough ' + U.plural(ind(g).front.toLowerCase()) + '! Hire more below. 👇</div>' : '<div class="hint">✅ Your team can handle everyone right now.</div>') +
      (!f.covered ? '<div class="hint bad">👔 You need more managers! One manager for every 8 workers.</div>' : '') +
      (g.pet ? '<div class="hint">' + g.pet + ' Your office pet makes everyone a bit happier every week!</div>' : '') + '</div>';
    var order = { mgr: 0, acct: 1, sales: 2, front: 3 };
    var list = g.employees.slice().sort(function (a, b) { return order[a.role] - order[b.role] || b.level - a.level || b.skill - a.skill; });
    h += '<div class="section"><div class="section-head"><h3>👥 Your team</h3><span class="label">Tap a person</span></div>' +
      (list.length ? list.map(function (e, i) { return personRow(g, e, false, i); }).join('') : '<div class="card">Nobody works here! Hire someone below. 👇</div>') + '</div>';
    h += '<div class="section"><div class="section-head"><h3>🧑‍💼 Hire people</h3><span class="label">New every week</span></div>' +
      '<div class="card" style="margin-bottom:12px;font-size:14px">' + ind(g).emoji + ' <b>' + U.plural(ind(g).front) + '</b> serve customers · 🗣️ <b>Salespeople</b> bring more customers · 🧮 <b>Accountants</b> cut costs · 👔 <b>Managers</b> keep 8 people happy</div>' +
      g.candidates.map(function (c, i) { return personRow(g, c, true, i); }).join('') + '</div>';
    if (g.memorial && g.memorial.length) h += '<div class="section card memorial"><b>🕊️ In loving memory</b>' + g.memorial.map(function (m) { return '<span>' + esc(m.face) + ' ' + esc(m.name) + ' <small>week ' + m.week + '</small></span>'; }).join('') + '</div>';
    return h;
  }

  // ---------- shop ----------

  function shopTab(g) {
    var h = '<div class="section"><div class="section-head"><h3>🛠️ Upgrades</h3><span class="label">Forever boosts</span></div><div class="up-grid">';
    CS.UPGRADES.forEach(function (u, i) {
      var lv = G.upLevel(g, u.id), cost = G.upCost(g, u.id), need = G.upNeedLevel(g, u.id);
      var pips = u.cost.map(function (x, k) { return '<i class="' + (k < lv ? 'on' : '') + '"></i>'; }).join('');
      var btn = !cost ? '<button class="btn small block" disabled>✅ MAX</button>'
        : g.level < need ? '<button class="btn small block" disabled>🔒 CEO Lv ' + need + '</button>'
          : '<button class="btn small block ' + (g.cash >= cost ? 'green' : '') + '" data-a="upgrade" data-v="' + u.id + '" ' + (g.cash >= cost ? '' : 'disabled') + '>' + U.short(cost) + '</button>';
      h += '<div class="up"' + stagger(i) + '><span class="e">' + u.emoji + '</span><b>' + u.name + '</b><div class="pips">' + pips + '</div><small>' + u.desc + '</small>' + btn + '</div>';
    });
    h += '</div></div>';
    if (!vip()) h += '<button class="card vip-card section" data-a="vip"><span style="font-size:34px">👑</span><span style="flex:1;text-align:left"><b style="font-family:var(--display);font-size:18px">VIP</b><br><small>Faster powers, double gifts, VIP companies & more</small></span><span class="chip gold">See</span></button>';
    return h;
  }

  // ---------- ads ----------

  function adsTab(g) {
    var h = '<div class="section card ads-hero in"><span class="e">📺</span><div><b>Free Ads!</b><small>Tap an ad to try to get in. It\'s <b>FREE</b>, but they can say no! 😬 More 📱 fans and ⭐ reputation = better chances. You get ' + G.adTriesMax() + ' tries every week.</small></div></div>';
    var tries = G.adTriesLeft(g);
    h += '<div class="section fame-meter"><span>📱 <b>' + U.num(g.followers) + '</b> fans · ⭐ ' + Math.round(g.reputation) + '</span><span class="tries">🎟️ ' + tries + '/' + G.adTriesMax() + ' tries this week</span></div>';
    h += '<div class="section ad-list">';
    CS.CELEB_ADS.forEach(function (a, i) {
      var p = G.adChance(g, a), pct = Math.round(p * 100), wait = G.adReadyIn(g, a), fits = G.adFits(g, a);
      var tone = pct >= 60 ? 'hi' : pct >= 25 ? 'mid' : 'lo';
      h += '<div class="ad-card ' + (wait ? 'wait' : '') + '"' + stagger(i % 10) + '><span class="ad-e">' + a.emoji + '</span><div class="ad-mid"><b>' + a.name + '</b><small>with ' + esc(a.who) + '</small>' +
        '<small class="ad-boost">📈 +' + Math.round(a.boost * 100) + '% customers for ' + a.weeks + ' weeks' + (fits ? ' · <span class="fits">' + ind(g).emoji + ' Fits you! +15%</span>' : '') + '</small>' +
        '<div class="chance ' + tone + '"><i style="width:' + pct + '%"></i><span>' + pct + '% chance</span></div></div>' +
        (wait ? '<button class="btn small" disabled>⏳ ' + wait + ' wk' + (wait > 1 ? 's' : '') + '</button>' : !tries ? '<button class="btn small" disabled>🎟️ Next<br>week</button>' : '<button class="btn small green try" data-a="tryad" data-v="' + a.id + '">🎲 Try<br>FREE</button>') + '</div>';
    });
    h += '</div>';
    h += '<div class="section"><div class="section-head"><h3>💸 Paid ads</h3><span class="label">Always work</span></div><div class="card">';
    CS.ADS.forEach(function (a) {
      var cost = G.adCost(g, a), locked = g.level < a.lvl;
      h += '<div class="ad-row"><span class="e">' + a.emoji + '</span><span class="grow"><b>' + a.name + '</b><br><small class="muted">+' + a.fans + ' fame</small></span>' +
        (locked ? '<button class="btn small" disabled>🔒 Lv ' + a.lvl + '</button>' : '<button class="btn small orange" data-a="ad" data-v="' + a.id + '">' + U.short(cost) + '</button>') + '</div>';
    });
    h += '</div></div>';
    return h;
  }

  function adTrySheet() {
    var sh = S.sheet, r = sh.res, a = r.ad;
    if (sh.phase === 'roll') return '<div class="result ad-roll"><div class="face-big spin-e">' + a.emoji + '</div><h2>Calling ' + esc(a.who) + '...</h2><div class="typing"><i></i><i></i><i></i></div><p class="muted">Your chance: <b>' + Math.round(r.chance * 100) + '%</b> 🤞</p></div>';
    return '<div class="result"><div class="face-big">' + (r.ok ? '🎉' : '😢') + '</div><h2>' + (r.ok ? 'YOU\'RE IN!' : 'NOT THIS TIME') + '</h2><p style="font-size:17px">' + esc(r.text) + '</p>' +
      (r.chips.length ? '<div class="chips">' + r.chips.map(function (c, i) { return '<span class="chip ' + (c.good ? 'good' : 'bad') + '" style="animation-delay:' + (0.15 + i * 0.1) + 's">' + esc(c.txt) + '</span>'; }).join('') + '</div>' : '') +
      '<p class="small muted">You can try this ad again in ' + a.cd + ' weeks.</p><button class="btn ' + (r.ok ? 'green' : 'blue') + ' big block" data-a="close">' + (r.ok ? 'Awesome! 🌟' : 'Try another ad') + '</button></div>';
  }

  // ---------- money ----------

  function moneyTab(g) {
    var debt = G.debt(g), val = G.valuation(g);
    var h = '<div class="section card"><div class="summary3"><div><b>' + U.short(val) + '</b><small>🏢 Worth</small></div><div><b>' + Math.round(g.ownership) + '%</b><small>🥧 You own</small></div><div><b class="' + (debt ? 'bad' : '') + '">' + U.short(debt) + '</b><small>🏦 Debt</small></div></div>' +
      '<button class="btn pink block" style="margin-top:12px" data-a="share">📤 Share my company</button></div>';
    h += '<button class="card shop-card section" data-a="shop"><span class="e">💎</span><span class="grow"><b>Shop</b><small>Cash packs, Starter Pack and the VIP Pass</small></span><span class="chip gold">Open</span></button>';
    h += '<div class="section"><div class="section-head"><h3>🏦 Bank loans</h3><span class="label">Pay back weekly</span></div><div class="card">';
    G.loanOffers(g).forEach(function (o, i) {
      var r = o.apr / 52, pay = o.amount * r / (1 - Math.pow(1 + r, -o.weeks));
      h += '<div class="loan"><span class="grow"><b class="num" style="font-size:18px">' + M(o.amount) + '</b><br><small class="muted">Pay ' + U.short(pay) + '/week for ' + o.weeks + ' weeks</small></span><button class="btn small ' + (o.ok ? 'blue' : '') + '" data-a="loan" data-v="' + i + '" ' + (o.ok ? '' : 'disabled') + '>' + (o.ok ? 'Borrow' : 'Too much debt') + '</button></div>';
    });
    h += '</div>';
    if (g.loans.length) {
      h += '<div class="card"><span class="label">Your loans</span>';
      g.loans.forEach(function (l) {
        h += '<div class="loan" style="margin-top:8px"><span class="grow"><b class="num">' + M(l.balance) + '</b> left<br><small class="muted">' + U.short(l.payment) + '/week</small></span><button class="btn small green" data-a="repay" data-v="' + l.id + '" ' + (g.cash >= l.balance ? '' : 'disabled') + '>Pay it all</button></div>';
      });
      h += '</div>';
    }
    h += '</div><div class="section"><div class="section-head"><h3>💼 Sell shares</h3><span class="label">Get cash now</span></div><div class="card">';
    [10, 20].forEach(function (p) {
      var ok = g.ownership - p >= 10;
      h += '<div class="loan"><span class="grow">Sell <b>' + p + '%</b> of your company<br><small class="muted">Investors pay ' + M(G.stakeOffer(g, p)) + '</small></span><button class="btn small yellow" data-a="stake" data-v="' + p + '" ' + (ok ? '' : 'disabled') + '>Sell</button></div>';
    });
    h += '</div></div>';
    var rows = g.history.slice(-10).reverse();
    h += '<div class="section"><div class="section-head"><h3>📊 History</h3></div><div class="card table-wrap"><table class="hist"><thead><tr><th>Week</th><th>Sales</th><th>Profit</th><th>Cash</th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (r) { return '<tr><td>' + r.week + '</td><td>' + U.short(r.revenue) + '</td><td class="' + (r.net >= 0 ? 'good' : 'bad') + '">' + U.short(r.net) + '</td><td>' + U.short(r.cash) + '</td></tr>'; }).join('') : '<tr><td colspan="4" class="faint">Play a week first!</td></tr>') + '</tbody></table></div></div>';
    return h;
  }

  // ---------- goals / more ----------

  function moreTab(g) {
    var need = G.xpNeed(g.level);
    var h = '<div class="section card"><div style="display:flex;align-items:center;gap:12px"><span style="font-size:40px">🎖️</span><div style="flex:1"><b style="font-family:var(--display);font-size:20px">CEO Level ' + g.level + '</b><br><small class="muted">' + g.xp + ' / ' + need + ' XP to the next level</small>' + bar(g.xp / need * 100) + '</div></div>' +
      '<small class="muted">Get XP by making choices, playing mini-games, using powers and finishing missions. New levels unlock ads and upgrades!</small></div>';
    var rk = CS.RANKS[g.rank], nx = CS.RANKS[g.rank + 1];
    h += '<div class="card"><b style="font-family:var(--display);font-size:18px">' + rk.emoji + ' ' + rk.name + '</b>' + (nx ? '<br><small class="muted">Next rank: ' + nx.emoji + ' ' + nx.name + ' when your company is worth ' + U.short(nx.min) + '</small>' + bar(G.valuation(g) / nx.min * 100) : '<br><small>Top rank! 🪐</small>') + '</div>';
    var fm = g.family;
    if (fm && fm.stage) {
      h += '<div class="card family section in"><span class="e">' + (fm.stage === 'married' ? '💍' : fm.stage === 'engaged' ? '💎' : '💘') + '</span><span class="grow"><b>' +
        (fm.stage === 'married' ? 'Married to ' : fm.stage === 'engaged' ? 'Engaged to ' : 'Dating ') + esc(fm.partner) + '</b><small>' +
        (fm.stage === 'married' ? 'Since week ' + fm.married : 'Since week ' + fm.since) + ((fm.kids || []).length ? ' · 👶 ' + fm.kids.map(esc).join(', ') : '') + '</small></span></div>';
    }
    h += '<div class="card cups"><span>🥇 ' + (g.cups.gold || 0) + '</span><span>🥈 ' + (g.cups.silver || 0) + '</span><span>🥉 ' + (g.cups.bronze || 0) + '</span><small class="muted">Business Cups won</small></div>';
    h += vip() ? '<div class="card vip-card section"><span style="font-size:30px">👑</span><span style="flex:1"><b>You are VIP!</b><br><small>Thank you for supporting the game! 💖</small></span><button class="btn small" data-a="vip">Manage</button></div>'
      : '<button class="card vip-card section" data-a="vip"><span style="font-size:34px">👑</span><span style="flex:1;text-align:left"><b style="font-family:var(--display);font-size:18px">Go VIP</b><br><small>' + CS.VIP_PERKS.length + ' awesome perks</small></span><span class="chip gold">Unlock</span></button>';

    var got = Object.keys(g.achievements).length;
    h += '<div class="section"><div class="section-head"><h3>🏆 Achievements</h3><span class="label">' + got + '/' + CS.ACHIEVEMENTS.length + '</span></div><div class="ach-grid">';
    CS.ACHIEVEMENTS.forEach(function (a, i) { h += '<div class="ach ' + (g.achievements[a.id] ? '' : 'locked') + '"' + stagger(i % 10) + '><span class="e">' + a.emoji + '</span><span><b>' + a.name + '</b><small>' + a.desc + '</small></span></div>'; });
    h += '</div></div>';

    var book = G.book(), count = G.bookCount();
    h += '<div class="section"><div class="section-head"><h3>📖 Event Book</h3><span class="label">' + count + '/' + CS.EVENTS.length + '</span></div><div class="card">' +
      '<p style="margin:0 0 8px;font-size:14px">Find every event! Some are ✨ <b>Legendary</b> and super rare. Your book is kept even when you start a new company.</p>' + bar(count / CS.EVENTS.length * 100, 'progress-big') + '<div class="book" style="margin-top:12px">';
    CS.EVENTS.forEach(function (d) {
      var r = d.rarity || 'common';
      h += book[d.id] ? '<div class="bk ' + r + '" title="' + esc(G.bookName(d)) + '">' + d.icon + '</div>' : '<div class="bk unk ' + r + '" title="Not found yet">?</div>';
    });
    h += '</div></div></div>';

    return h;
  }

  // ---------- wars ----------

  function friendTriesTxt() { var n = G.friendWarsLeft(); return n === Infinity ? '👑 Unlimited (VIP)' : n + ' left today'; }
  function warTab(g) {
    var w = G.warInit(g), ri = G.warRankIndex(g), rk = CS.WAR_RANKS[ri], nx = CS.WAR_RANKS[ri + 1];
    var h = '<button class="btn small back-btn" data-a="tab" data-v="home">⬅ Back</button>';
    h += '<div class="section card war-hero in"><div class="wh-top"><span class="e">' + rk.emoji + '</span><div class="grow"><b>' + rk.name + '</b><small>🏆 ' + w.trophies + ' trophies' + (nx ? ' · ' + (nx.min - w.trophies) + ' more for ' + nx.emoji + ' ' + nx.name : ' · Top rank!') + '</small>' + (nx ? bar((w.trophies - rk.min) / (nx.min - rk.min) * 100) : '') + '</div></div>' +
      '<div class="wh-stats"><span>📱 <b>' + U.num(g.followers) + '</b> fans</span><span>⚡ <b>' + w.energy + '/' + G.warMaxEnergy() + '</b> energy</span><span>✅ ' + w.wins + ' · ❌ ' + w.losses + '</span></div>' +
      '<small class="muted">Every war is 5 rounds, picked from ' + CS.WAR_GAMES.length + ' mini-games. Win more rounds to win the war. <b>The winner takes 10% of the loser\'s fans!</b></small>' +
      '<div class="wh-games">' + CS.WAR_GAMES.map(function (x) { var best = (w.best || {})[x.id]; return '<span>' + x.emoji + ' ' + x.name + (best ? ' <b>🏅' + best + '</b>' : '') + '</span>'; }).join('') + '</div></div>';

    if (w.battle && !w.battle.done) h += '<button class="card war-banner section" data-a="warback"><span class="e">⚔️</span><span class="grow"><b>You\'re in the middle of a war!</b><small>Tap to go back to it.</small></span><span class="chip red">Go</span></button>';
    h += '<div class="section"><div class="section-head"><h3>🎯 Attack a rival</h3><span class="label">Costs ⚡1 · +1 every week</span></div>' +
      (w.energy ? '' : '<button class="btn block small" style="margin-bottom:10px" data-a="shop">⚡ Out of energy? Refill in the shop</button>') + '<div class="war-list">';
    (g.rivalCos || []).forEach(function (rv, i) {
      var fans = G.rivalFans(g, rv);
      h += '<div class="war-foe"' + stagger(i) + '><span class="logo" style="background:' + esc(rv.color) + '">' + esc(rv.logo) + '</span><div class="grow"><b>' + esc(rv.name) + '</b><small>📱 ' + U.num(fans) + ' fans · win to take ' + U.num(Math.round(fans * G.WAR_FAN_SHARE)) + '</small></div>' +
        '<button class="btn small ' + (w.energy ? 'red' : '') + '" data-a="warattack" data-v="' + i + '" ' + (w.energy ? '' : 'disabled') + '>⚔️ Attack</button></div>';
    });
    h += '</div></div>';

    h += '<div class="section"><div class="section-head"><h3>🤝 Friend Wars</h3><span class="label">' + friendTriesTxt() + '</span></div><div class="card friend-war">' +
      '<b class="fw-h">1. Challenge a friend</b><p class="small">Play the 5 games, then send your scores to a friend in any chat app. They have to beat you!</p>' +
      '<button class="btn pink block" data-a="warchallenge">🎮 Play &amp; send a challenge</button>' +
      '<b class="fw-h" style="margin-top:16px">2. Got a code from a friend?</b><p class="small">Type it in, or paste their whole message.</p>' +
      '<div class="code-row"><input id="warcode" class="code-input" type="text" inputmode="text" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" maxlength="400" placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX" value="' + esc(S.warDraft || '') + '">' +
      '<button class="btn small" data-a="warclip" aria-label="Paste">📋 Paste</button></div>' +
      '<button class="btn red big block" data-a="warpaste">⚔️ BATTLE THEM!</button>' +
      (G.friendWarsLeft() === Infinity ? '' : '<p class="small muted" style="margin:10px 0 0">You get ' + G.FRIEND_WARS_PER_DAY + ' friend wars a day. 👑 VIP gets unlimited!</p>') + '</div></div>';
    return h;
  }

  function warSide(c, cls) {
    return '<div class="side ' + cls + '"><span class="logo" style="background:' + esc(c.color) + '">' + esc(c.logo) + '</span><b>' + esc(c.name) + '</b><small>' + (c.fans != null ? '📱 ' + U.num(c.fans) : '&nbsp;') + '</small></div>';
  }
  function warSheet() {
    var g = S.g, sh = S.sheet, b = g.war && g.war.battle;
    if (!b) return null;
    var me = { name: g.company.name, logo: g.company.logo, color: g.company.color, fans: g.followers };
    var foe = b.foe || { name: 'Your friend', logo: '❓', color: '#ADB5BD' };
    var head = b.kind === 'friend' ? '🤜 Friend War' : b.kind === 'challenge' ? '🎮 Challenge run' : '⚔️ WAR!';
    var won = b.rounds.filter(function (r) { return r.win > 0; }).length, lost = b.rounds.filter(function (r) { return r.win < 0; }).length;
    var h = '<div class="war-sheet">' + (b.done ? '' : '<button class="war-quit" data-a="warquit">🏳️ Quit</button>') + '<h2>' + head + '</h2><div class="war-vs">' + warSide(me, 'me') +
      (b.foe ? '<span class="vs">' + (b.rounds.length ? '<span class="tally">' + won + '<i>–</i>' + lost + '</span>' : 'VS') + '</span>' : '<span class="vs">VS</span>') + warSide(foe, 'them') + '</div>' +
      '<div class="war-dots">' + b.games.map(function (id, i) {
        var r = b.rounds[i], cls = r ? (r.win > 0 ? 'w' : r.win < 0 ? 'l' : r.win === 0 ? 't' : 'd') : i === b.mine.length ? 'now' : '';
        return '<i class="' + cls + '">' + G.warGame(id).emoji + '</i>';
      }).join('') + '</div>';
    var i = b.mine.length, stage = sh.stage || 'intro';
    if (stage === 'intro' && !b.done) {
      var gm = G.warGame(b.games[i]);
      var myBest = (g.war.best || {})[gm.id];
      h += '<div class="war-intro in"><small>ROUND ' + (i + 1) + ' OF ' + b.games.length + '</small><div class="wi-e">' + gm.emoji + '</div><h3>' + gm.name + '</h3><p>' + gm.desc + '</p>' +
        '<div class="wi-row">' + (b.foe ? '<span>' + esc(foe.name) + ': <b>❓</b></span>' : '') + (myBest ? '<span>🏅 Your best: <b>' + myBest + '</b></span>' : '') + '</div></div>' +
        '<button class="btn green big block" data-a="wargo">▶ GO!</button>' +
        (i === 0 && !b.started ? '<p class="small muted" style="margin:8px 0 0">Quit now and you get your ' + (b.kind === 'friend' ? 'friend war' : b.kind === 'rival' ? '⚡ energy' : 'turn') + ' back.</p>' : '');
    } else if (stage === 'play' && !b.done) {
      h += '<div class="war-arena" id="warArena"><div class="ws-hud"><span class="ws-score">⭐ 0</span><span class="ws-time"></span></div><div class="ws-field"></div><div class="ws-count">3</div></div>';
    } else if (stage === 'reveal') {
      var r = b.rounds[b.rounds.length - 1], gm2 = G.warGame(r.game);
      h += '<div class="war-reveal in"><div class="wr-game">' + gm2.emoji + ' ' + gm2.name + '</div><div class="wr-scores"><div class="' + (r.win > 0 ? 'win' : '') + '"><small>You</small><b>' + r.mine + '</b></div>' +
        (b.foe ? '<span>vs</span><div class="' + (r.win < 0 ? 'win' : '') + '"><small>' + esc(foe.name) + '</small><b>' + r.theirs + '</b></div>' : '') + '</div>' +
        (r.best ? '<div class="new-best">🏅 New personal best!</div>' : '') +
        (b.foe ? '<h3 class="' + (r.win > 0 ? 'good' : r.win < 0 ? 'bad' : '') + '">' + (r.win > 0 ? 'You win the round!' : r.win < 0 ? 'They win the round!' : 'It\'s a tie!') + '</h3>' : '<h3>Score saved!</h3>') + '</div>' +
        '<button class="btn green big block" data-a="warnext">' + (b.done ? 'See the result 🏆' : 'Next round ▶') + '</button>';
    } else {
      var res = b.result;
      if (res.won == null) {
        var code = G.warCode(g, b); G.save(g);
        h += '<div class="war-end"><div class="face-big">🎮</div><h2>Challenge ready!</h2>' + roundTable(b) + '<p class="small">Send this code to a friend. They play the same 5 games and try to beat you!</p>' +
          '<div class="code-box" id="mycode">' + code + '</div><div class="row2" style="margin-bottom:10px"><button class="btn" data-a="warcopy">📋 Copy code</button><button class="btn pink" data-a="warsendscores">📤 Send</button></div>' +
          '<div class="row2"><button class="btn" data-a="warrematch">🔁 Play again</button><button class="btn green" data-a="warclose">Done</button></div></div>';
      } else {
        var left = b.kind === 'friend' ? G.friendWarsLeft() : g.war.energy;
        var canRe = left > 0;
        h += '<div class="war-end ' + (res.won ? 'won' : 'lost') + '"><div class="face-big">' + (res.won ? '🏆' : b.forfeit ? '🏳️' : '😤') + '</div><h2>' + (res.won ? 'VICTORY!' : 'DEFEAT') + '</h2><div class="war-score">' + res.score[0] + ' – ' + res.score[1] + '</div><p>' + esc(res.text) + '</p>' + roundTable(b) +
          (res.chips.length ? '<div class="chips">' + res.chips.map(function (c, k) { return '<span class="chip ' + (c.good ? 'good' : 'bad') + '" style="animation-delay:' + (0.15 + k * 0.1) + 's">' + esc(c.txt) + '</span>'; }).join('') + '</div>' : '') +
          '<button class="btn ' + (canRe ? 'red' : '') + ' big block" data-a="warrematch" ' + (canRe ? '' : 'disabled') + '>🔁 Quick rematch' + (b.kind === 'friend' ? ' (' + (left === Infinity ? '∞' : left) + ' left)' : ' (⚡' + left + ')') + '</button>' +
          '<div class="row2" style="margin-top:10px">' + (b.kind === 'friend' ? '<button class="btn pink" data-a="warsendscores">📤 Send my scores</button>' : '<button class="btn pink" data-a="warshare">📣 Share</button>') + '<button class="btn green" data-a="warclose">Done</button></div></div>';
      }
    }
    return h + '</div>';
  }

  function roundTable(b) {
    return '<div class="round-table">' + b.rounds.map(function (r) {
      var gm = G.warGame(r.game);
      return '<div class="' + (r.win > 0 ? 'w' : r.win < 0 ? 'l' : '') + '"><span>' + gm.emoji + ' ' + gm.name + (r.best ? ' 🏅' : '') + '</span><b>' + r.mine + '</b>' + (b.foe ? '<i>' + r.theirs + '</i>' : '') + '</div>';
    }).join('') + '</div>';
  }

  // The war games. Each builds itself inside #warArena and calls done(score) when it ends.
  var warGame = null;
  function startWarPlay() {
    var g = S.g, b = g.war && g.war.battle;
    if (!b || b.done || !document.getElementById('warArena')) return;
    var id = b.games[b.mine.length];
    runWarGame(id, G.warGameData(id, b.seed), b, function (score) {
      var r = G.warSubmit(g, score);
      if (!r || !S.sheet || S.sheet.type !== 'war') return;
      S.sheet.stage = 'reveal';
      if (!b.foe) SFX.play('coin'); else if (r.win > 0) { SFX.play('good'); buzz(20); } else if (r.win < 0) { SFX.play('bad'); buzz(50); } else SFX.play('pop');
      render();
      if (r.win < 0) setTimeout(shake, 60);
    });
  }
  function runWarGame(id, data, b, done) {
    var box = document.getElementById('warArena');
    var field = box.querySelector('.ws-field'), scoreEl = box.querySelector('.ws-score'), timeEl = box.querySelector('.ws-time'), cd = box.querySelector('.ws-count');
    var score = 0, over = false, timers = [], raf = 0, craf = 0;
    if (warGame) warGame.stop();
    // stop: throw the round away. end: finish it now with the score so far (used by the Quit button).
    warGame = { stop: function () { over = true; timers.forEach(clearTimeout); cancelAnimationFrame(raf); cancelAnimationFrame(craf); },
      end: function () { if (over) return; warGame.stop(); warGame = null; done(score); } };
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function show() { scoreEl.textContent = '⭐ ' + score; }
    function pop(txt, x, y, good) {
      var d = document.createElement('div');
      d.className = 'ws-pop ' + (good ? 'good' : 'bad'); d.textContent = txt; d.style.left = x + 'px'; d.style.top = y + 'px';
      field.appendChild(d); setTimeout(function () { d.remove(); }, 700);
    }
    function add(v, x, y) { score = Math.max(0, score + v); show(); pop(v > 0 ? '+' + v : String(v), x, y, v > 0); SFX.play(v > 0 ? 'tap' : 'bad'); if (v < 0) buzz(40); }
    function finish() {
      if (over) return;
      warGame.stop(); warGame = null;
      box.classList.add('over');
      var t = document.createElement('div'); t.className = 'ws-count'; t.textContent = '⭐ ' + score; box.appendChild(t);
      setTimeout(function () { done(score); }, 900);
    }
    function clock(secs) {
      var t0 = performance.now();
      (function tick() {
        if (over) return;
        var left = Math.max(0, secs - (performance.now() - t0) / 1000);
        timeEl.textContent = '⏱️ ' + left.toFixed(1);
        if (left <= 0) return finish();
        craf = requestAnimationFrame(tick);
      })();
    }
    show();
    var n = 3;
    SFX.play('tick');
    (function count() {
      later(function () {
        n--;
        if (n > 0) { cd.textContent = n; SFX.play('tick'); count(); }
        else { cd.textContent = 'GO!'; SFX.play('power'); later(function () { cd.remove(); start(); }, 350); }
      }, 550);
    })();

    function start() {
      var W = field.clientWidth, Hh = field.clientHeight;
      if (id === 'coins') {
        data.items.forEach(function (it) {
          later(function () {
            var el = document.createElement('button');
            el.className = 'ws-coin' + (it.bomb ? ' bomb' : it.gold ? ' gold' : '');
            el.textContent = it.bomb ? '💣' : it.gold ? '💰' : '🪙';
            var x = 6 + it.x * (W - 62), y = 6 + it.y * (Hh - 62);
            el.style.left = x + 'px'; el.style.top = y + 'px';
            el.addEventListener('pointerdown', function (e) {
              e.preventDefault();
              if (el.dataset.hit || over) return;
              el.dataset.hit = 1; el.classList.add('hit');
              add(it.bomb ? -3 : it.gold ? 3 : 1, x, y);
              setTimeout(function () { el.remove(); }, 160);
            });
            field.appendChild(el);
            setTimeout(function () { el.remove(); }, 1000);
          }, it.t);
        });
        clock(data.secs);
      } else if (id === 'stop') {
        field.innerHTML = '<div class="ws-bar"><i class="zone"></i><b class="mark"></b></div><div class="ws-tip">Tap anywhere to STOP!</div>';
        var zone = field.querySelector('.zone'), mark = field.querySelector('.mark'), k = 0, t0 = 0, pos = 0, moving = false;
        var next = function () {
          if (k >= data.tries.length) return finish();
          var tr = data.tries[k];
          zone.style.left = (tr.zone * 100) + '%'; zone.style.width = (tr.width * 100) + '%';
          timeEl.textContent = 'Try ' + (k + 1) + '/5';
          t0 = performance.now(); moving = true;
          var myTry = k;
          later(function () { if (moving && k === myTry) stopNow(); }, 4000); // too slow: it stops by itself
          (function anim(now) {
            if (over || !moving) return;
            var p = (((now || t0) - t0) / 1000 * tr.speed + tr.phase) % 2;
            pos = p < 1 ? p : 2 - p;
            mark.style.left = (pos * 100) + '%';
            raf = requestAnimationFrame(anim);
          })();
        };
        var stopNow = function () {
          if (!moving || over) return;
          moving = false; cancelAnimationFrame(raf);
          var tr = data.tries[k], half = tr.width / 2, dist = Math.abs(pos - (tr.zone + half));
          var pts = dist <= half ? Math.round(100 - dist / half * 40) : Math.max(0, Math.round(40 - (dist - half) * 200));
          score += pts; show();
          pop('+' + pts, pos * (W - 32) + 8, Hh * 0.45 - 40, pts >= 60);
          SFX.play(pts >= 60 ? 'coin' : 'tap');
          k++; later(next, 650);
        };
        field.addEventListener('pointerdown', function (e) { e.preventDefault(); stopNow(); });
        next();
      } else if (id === 'whack') {
        field.innerHTML = '<div class="ws-grid">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (i) { return '<button class="hole"><span></span></button>'; }).join('') + '</div>';
        var holes = field.querySelectorAll('.hole'), myLogo = S.g.company.logo, theirLogo = b.foe && b.foe.logo !== myLogo ? b.foe.logo : '😈';
        holes.forEach(function (hl) {
          hl.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            if (over || !hl.classList.contains('up')) return;
            var mine = hl.dataset.mine === '1';
            hl.classList.remove('up'); hl.classList.add(mine ? 'oops' : 'bonk');
            setTimeout(function () { hl.classList.remove('oops', 'bonk'); }, 260);
            add(mine ? -2 : 1, hl.offsetLeft + hl.offsetWidth / 2 - 10, hl.offsetTop);
          });
        });
        data.pops.forEach(function (p) {
          later(function () {
            var hl = holes[p.hole];
            if (hl.classList.contains('up')) return;
            hl.dataset.mine = p.mine ? '1' : '';
            hl.querySelector('span').textContent = p.mine ? myLogo : theirLogo;
            hl.classList.add('up'); hl._tok = p.t;
            setTimeout(function () { if (hl._tok === p.t) hl.classList.remove('up'); }, p.dur);
          }, p.t);
        });
        clock(data.secs);
      } else if (id === 'math') {
        field.innerHTML = '<div class="ws-q"></div><div class="ws-opts"></div>';
        var qEl = field.querySelector('.ws-q'), oEl = field.querySelector('.ws-opts'), qi = 0, busy = false;
        var ask = function () {
          var q = data.questions[qi % data.questions.length];
          qEl.textContent = q.q + ' = ?';
          oEl.innerHTML = q.options.map(function (o, i) { return '<button class="btn" data-i="' + i + '">' + o + '</button>'; }).join('');
          busy = false;
        };
        oEl.addEventListener('pointerdown', function (e) {
          var btn = e.target.closest('button');
          if (!btn || over || busy) return;
          e.preventDefault(); busy = true;
          var q = data.questions[qi % data.questions.length], ok = +btn.dataset.i === q.answer;
          if (ok) { btn.classList.add('right'); add(1, btn.offsetLeft + 20, btn.offsetTop); }
          else { btn.classList.add('wrong'); SFX.play('bad'); buzz(40); }
          qi++; later(ask, ok ? 150 : 450);
        });
        ask(); clock(data.secs);
      } else if (id === 'numbers') {
        field.innerHTML = '<div class="ws-grid num"></div><div class="ws-tip">Tap 1 first!</div>';
        var ngrid = field.querySelector('.ws-grid'), ntip = field.querySelector('.ws-tip'), board = 0, want = 1;
        var deal = function () {
          want = 1;
          ngrid.innerHTML = data.boards[board % data.boards.length].map(function (n) { return '<button class="num-t" data-n="' + n + '">' + n + '</button>'; }).join('');
        };
        ngrid.addEventListener('pointerdown', function (e) {
          var t = e.target.closest('.num-t');
          if (!t || over || t.classList.contains('ok')) return;
          e.preventDefault();
          if (+t.dataset.n === want) {
            t.classList.add('ok'); add(1, t.offsetLeft + t.offsetWidth / 2 - 10, t.offsetTop); want++;
            if (want > 12) { board++; ntip.textContent = 'Board cleared! Next one...'; SFX.play('coin'); later(deal, 250); } else ntip.textContent = 'Next: ' + want;
          } else { t.classList.add('bad'); setTimeout(function () { t.classList.remove('bad'); }, 250); add(-1, t.offsetLeft + t.offsetWidth / 2 - 10, t.offsetTop); }
        });
        deal(); clock(data.secs);
      } else if (id === 'colors') {
        var COLS = [['RED', '#FF4D5E'], ['BLUE', '#2EA8FF'], ['GREEN', '#1FB36A'], ['YELLOW', '#F2A900']];
        field.innerHTML = '<div class="ws-word"></div><div class="ws-tip">Tap the color of the paint, not the word!</div><div class="ws-swatches">' +
          COLS.map(function (c, i) { return '<button class="sw" data-i="' + i + '" style="background:' + c[1] + '">' + c[0] + '</button>'; }).join('') + '</div>';
        var word = field.querySelector('.ws-word'), sws = field.querySelector('.ws-swatches'), ci = 0, cbusy = false;
        var show2 = function () { var q = data.items[ci % data.items.length]; word.textContent = COLS[q.word][0]; word.style.color = COLS[q.ink][1]; word.classList.remove('flash'); void word.offsetWidth; word.classList.add('flash'); cbusy = false; };
        sws.addEventListener('pointerdown', function (e) {
          var btn = e.target.closest('.sw');
          if (!btn || over || cbusy) return;
          e.preventDefault(); cbusy = true;
          var ok = +btn.dataset.i === data.items[ci % data.items.length].ink;
          add(ok ? 1 : -1, btn.offsetLeft + btn.offsetWidth / 2 - 10, btn.offsetTop - 10);
          ci++; later(show2, ok ? 120 : 420);
        });
        show2(); clock(data.secs);
      } else if (id === 'stack') {
        field.innerHTML = '<div class="stk"></div><div class="ws-tip">Tap anywhere to drop the block!</div>';
        var stk = field.querySelector('.stk'), bh = 24, col = S.g.company.color || '#7C4DFF', level = 0, lastX = W * 0.2, lastW = W * 0.6, cur = null, cx = 0, dir = 1, lastT = 0;
        var block = function (x, w, y, moving) {
          var el = document.createElement('div');
          el.className = 'stk-b' + (moving ? ' moving' : ''); el.style.cssText = 'left:' + x + 'px;width:' + w + 'px;bottom:' + y + 'px;background:' + col;
          stk.appendChild(el); return el;
        };
        block(lastX, lastW, 0);
        var spawn = function () {
          if (level >= data.blocks.length) return finish();
          var bl = data.blocks[level];
          dir = bl.left ? 1 : -1; cx = bl.left ? 0 : W - lastW;
          cur = block(cx, lastW, (level + 1) * bh, true); lastT = performance.now();
          (function move(now) {
            if (over || !cur) return;
            cx += dir * bl.speed * W * Math.min(0.05, (now - lastT) / 1000); lastT = now;
            if (cx < 0) { cx = 0; dir = 1; } if (cx > W - lastW) { cx = W - lastW; dir = -1; }
            cur.style.left = cx + 'px';
            raf = requestAnimationFrame(move);
          })(lastT);
        };
        field.addEventListener('pointerdown', function (e) {
          e.preventDefault();
          if (over || !cur) return;
          cancelAnimationFrame(raf);
          var tipS = field.querySelector('.ws-tip'); if (tipS) tipS.remove();
          var el = cur; cur = null;
          var left = Math.max(cx, lastX), right = Math.min(cx + lastW, lastX + lastW), ov = right - left;
          if (ov < 6) { el.classList.add('fall'); SFX.play('bad'); buzz(60); later(finish, 500); return; }
          el.classList.remove('moving'); el.style.left = left + 'px'; el.style.width = ov + 'px';
          var perfect = Math.abs(cx - lastX) < 4;
          if (perfect) { ov = lastW; el.style.left = lastX + 'px'; el.style.width = lastW + 'px'; left = lastX; }
          lastX = left; lastW = ov; level++;
          add(1, left + ov / 2 - 10, Hh - (level + 1) * bh - 30 + Math.max(0, (level - 7) * bh));
          if (perfect) { pop('PERFECT!', left, Hh - (level + 1) * bh - 50 + Math.max(0, (level - 7) * bh), true); SFX.play('coin'); }
          if (level > 7) stk.style.transform = 'translateY(' + ((level - 7) * bh) + 'px)';
          later(spawn, 120);
        });
        spawn(); clock(data.secs);
      } else if (id === 'reaction') {
        field.innerHTML = '<div class="rx wait"><b>Wait for green...</b><small></small></div>';
        var rx = field.querySelector('.rx'), rb = rx.querySelector('b'), rs = rx.querySelector('small'), rk = 0, armed = 0, token = 0;
        var nextTry = function () {
          if (rk >= data.waits.length) return finish();
          var my = ++token;
          armed = 0; rx.className = 'rx wait'; rb.textContent = 'Wait for green...'; rs.textContent = ''; timeEl.textContent = 'Try ' + (rk + 1) + '/' + data.waits.length;
          later(function () {
            if (my !== token || over) return;
            armed = performance.now(); rx.className = 'rx go'; rb.textContent = 'TAP!'; SFX.play('pop');
            later(function () { if (my === token && armed) { armed = 0; token++; rb.textContent = 'Too slow! +0'; rx.className = 'rx miss'; rk++; later(nextTry, 900); } }, 1500);
          }, data.waits[rk]);
        };
        field.addEventListener('pointerdown', function (e) {
          e.preventDefault();
          if (over || rx.classList.contains('miss') || rx.classList.contains('hit')) return;
          token++;
          if (!armed) { rx.className = 'rx miss'; rb.textContent = 'Too early! +0'; SFX.play('bad'); buzz(50); rk++; later(nextTry, 900); return; }
          var ms = Math.round(performance.now() - armed), pts = Math.max(0, Math.min(100, Math.round(100 - (ms - 180) / 4)));
          armed = 0; rx.className = 'rx hit'; rb.textContent = ms + ' ms'; rs.textContent = '+' + pts;
          score += pts; show(); SFX.play(pts >= 70 ? 'coin' : 'tap');
          rk++; later(nextTry, 900);
        });
        nextTry();
      } else if (id === 'catch') {
        field.innerHTML = '<div class="basket">🧺</div><div class="ws-tip">Drag to move the basket</div>';
        var basket = field.querySelector('.basket'), bx = W / 2, drops = [], t0c = performance.now(), di = 0, lastC = t0c;
        var moveTo = function (e) { var r = field.getBoundingClientRect(); bx = Math.max(28, Math.min(W - 28, e.clientX - r.left)); basket.style.left = (bx - 28) + 'px'; };
        field.addEventListener('pointerdown', function (e) { e.preventDefault(); moveTo(e); });
        field.addEventListener('pointermove', function (e) { if (!over) moveTo(e); });
        basket.style.left = (bx - 28) + 'px';
        (function loop(now) {
          if (over) return;
          var el = now - t0c, dt = Math.min(0.05, (now - lastC) / 1000); lastC = now;
          while (di < data.drops.length && data.drops[di].t <= el) {
            var dd = data.drops[di++], de = document.createElement('div');
            de.className = 'drop ' + dd.kind; de.textContent = dd.kind === 'bomb' ? '💣' : dd.kind === 'gold' ? '💰' : '💵';
            field.appendChild(de); drops.push({ d: dd, el: de, x: 18 + dd.x * (W - 56), y: -40 });
          }
          drops = drops.filter(function (o) {
            o.y += o.d.spd * Hh * dt; o.el.style.transform = 'translate(' + o.x + 'px,' + o.y + 'px)';
            if (o.y > Hh - 78 && o.y < Hh - 30 && Math.abs(o.x + 18 - bx) < 42) {
              o.el.remove(); add(o.d.kind === 'bomb' ? -3 : o.d.kind === 'gold' ? 3 : 1, o.x, Hh - 110);
              if (o.d.kind !== 'bomb') { basket.classList.remove('bump'); void basket.offsetWidth; basket.classList.add('bump'); }
              return false;
            }
            if (o.y > Hh) { o.el.remove(); return false; }
            return true;
          });
          raf = requestAnimationFrame(loop);
        })(t0c);
        clock(data.secs);
      } else {
        field.innerHTML = '<div class="ws-grid mem">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function () { return '<button class="tile"></button>'; }).join('') + '</div><div class="ws-tip"></div>';
        var tiles = field.querySelectorAll('.tile'), tip = field.querySelector('.ws-tip'), lv = 0, need = [], found = 0, input = false;
        var level = function () {
          if (lv >= data.levels.length) return finish();
          need = data.levels[lv]; found = 0; input = false;
          tiles.forEach(function (t) { t.className = 'tile'; });
          tip.textContent = 'Level ' + (lv + 1) + '/5 · Watch carefully...';
          need.forEach(function (i) { tiles[i].classList.add('lit'); });
          later(function () { need.forEach(function (i) { tiles[i].classList.remove('lit'); }); input = true; tip.textContent = 'Level ' + (lv + 1) + '/5 · Tap the ' + need.length + ' squares!'; }, data.show);
        };
        tiles.forEach(function (t, i) {
          t.addEventListener('pointerdown', function (e) {
            e.preventDefault();
            if (!input || over || t.classList.contains('ok')) return;
            if (need.indexOf(i) >= 0) {
              t.classList.add('ok'); found++;
              add(1, t.offsetLeft + t.offsetWidth / 2 - 10, t.offsetTop);
              if (found === need.length) { input = false; lv++; tip.textContent = 'Perfect!'; later(level, 500); }
            } else {
              input = false; t.classList.add('bad'); SFX.play('bad'); buzz(60);
              tip.textContent = 'Wrong square!';
              need.forEach(function (k) { if (!tiles[k].classList.contains('ok')) tiles[k].classList.add('lit'); });
              later(finish, 800);
            }
          });
        });
        level(); clock(data.secs);
      }
    }
  }

  // ---------- settings ----------

  function toggleRow(k, label) {
    return '<div class="toggle"><span>' + label + '</span><button class="switch ' + (S.settings[k] ? 'on' : '') + '" data-a="setting" data-v="' + k + '" aria-label="' + label + '"><i></i></button></div>';
  }
  function settingsTab(g) {
    var h = '<div class="section"><div class="section-head"><h3>⚙️ Settings</h3></div><div class="card">' +
      toggleRow('music', '🎵 Music') + toggleRow('sound', '🔊 Sound effects') + toggleRow('vibe', '📳 Vibration') + '</div></div>';
    if (g.mode === 'main') {
      var ready = G.shareGameReady(), amt = G.shareGameAmount(g);
      h += '<div class="section card share-game in"><div class="sg-top"><span class="e">📤</span><div><b>Share the game, get +10%!</b><small>Send Company Simulator to a friend and get <b>+10% cash</b> (' + U.short(amt) + '). Once a day!</small></div></div>' +
        (ready ? '<button class="btn green big block" data-a="sharegame">📤 Share &amp; get +' + U.short(amt) + '</button>' : '<button class="btn block" disabled>✅ Done today! Come back tomorrow</button>') + '</div>';
    }
    h += '<div class="section"><div class="section-head"><h3>🎮 Game</h3></div><div class="card">' +
      '<button class="btn block" data-a="share">🖼️ Share my company card</button>' +
      '<button class="btn blue block" style="margin-top:10px" data-a="quit">💾 Save &amp; quit to menu</button>' +
      '<div class="row2" style="margin-top:10px"><button class="btn small" data-a="confirm" data-v="newgame">🔄 Start over</button><button class="btn small red" data-a="confirm" data-v="bankrupt">📉 Give up</button></div></div></div>';
    h += vip() ? '<div class="card vip-card section"><span style="font-size:30px">👑</span><span style="flex:1"><b>You are VIP!</b><br><small>Thank you for supporting the game! 💖</small></span><button class="btn small" data-a="vip">Manage</button></div>'
      : '<button class="card vip-card section" data-a="vip"><span style="font-size:34px">👑</span><span style="flex:1;text-align:left"><b style="font-family:var(--display);font-size:18px">Go VIP</b><br><small>' + CS.VIP_PERKS.length + ' awesome perks</small></span><span class="chip gold">Unlock</span></button>';
    h += '<div class="section card about"><b>Company Simulator</b><small>No ads · No accounts · Your saves stay on this device.</small></div>';
    return h;
  }

  // ================= sheets =================

  function evHead(def, x) {
    var cat = catOf(def);
    return '<div class="ev-head" style="--c:' + cat.color + '"><div class="meta"><span>' + cat.emoji + ' ' + cat.label + (x.chain ? ' · 🔗 Story' : '') + '</span>' + rarityTag(def) + '<span>Week ' + S.g.week + '</span></div><div class="ev-icon">' + def.icon + '</div></div>';
  }
  function tagsFor(g, x, fx) {
    var cost = G.fxCost(g, fx), risk = G.fxRisk(g, fx, x.ctx), t = '';
    if (cost) t += '<span class="tag cost">-' + U.short(cost) + '</span>';
    if (risk != null) t += '<span class="tag risk">🎲 ' + risk + '%</span>';
    return t ? '<span class="tags">' + t + '</span>' : '';
  }
  function choiceButtons(g, x, def, cls) {
    var base = cls === 'reply' ? 0.35 * def.msgs.length : 0.15;
    return def.choices.map(function (c, i) {
      return '<button class="' + (cls || 'option') + ' in" data-a="choose" data-v="' + i + '" style="animation-delay:' + (base + 0.08 * i).toFixed(2) + 's"><span>' + F(c.t, x) + (c.d ? '<small>' + esc(c.d) + '</small>' : '') + '</span>' + tagsFor(g, x, c.fx) + '</button>';
    }).join('');
  }
  function fourButtons(list) {
    return '<div class="options">' + list.map(function (b, i) {
      return '<button class="option in" data-a="' + b[0] + '" data-v="' + (b[1] == null ? '' : b[1]) + '" style="animation-delay:' + (0.15 + 0.08 * i).toFixed(2) + 's"' + (b[4] ? ' disabled' : '') + '><span>' + b[2] + (b[3] ? '<small>' + b[3] + '</small>' : '') + '</span>' + (b[5] || '') + '</button>';
    }).join('') + '</div>';
  }

  var INTERVIEW_Q = ['💼 Why do you want this job?', '🤔 What is your biggest weakness?', '😂 Tell me something fun!', '🦸 What is your superpower?'];
  var INTERVIEW_A = {
    hardworking: ['I love working hard! I never stop until it\'s done. 💪', 'I work TOO much. My friends say I need a break.', 'I once worked 3 jobs at the same time!', 'Working all day without getting tired! ⚡'],
    lazy: ['Honestly? I heard the break room is nice. 😴', 'Mornings. And afternoons. Kind of all day.', 'I can nap standing up!', 'Sleeping 14 hours in a row. 😴'],
    ambitious: ['I want to be the boss one day! 🚀', 'I get impatient when I\'m not moving up.', 'I have a 10-year plan. Want to see it?', 'Climbing to the top, fast! 🧗'],
    creative: ['I have SO many ideas for this place! 🎨', 'I get distracted by new ideas.', 'I paint murals on weekends!', 'Turning boring things into amazing things! ✨'],
    loyal: ['I stay at jobs for a long time. I\'m loyal! 🐶', 'I get attached to places.', 'I\'ve had the same best friend since I was 4.', 'Never giving up on my team! 🤝'],
    greedy: ['Money. Lots of money. 🤑', 'I always ask for raises.', 'I collect rare coins!', 'Finding money everywhere! 💰'],
    friendly: ['I love meeting new people! 🤗', 'I talk a bit too much.', 'I know everyone in my building by name!', 'Making friends in 5 seconds! 🤝'],
    aggressive: ['I\'m the best. The others better watch out. 😤', 'People say I get angry fast. They\'re wrong! 😠', 'I won an arm-wrestling contest.', 'Winning every argument! 😤'],
    reliable: ['You can always count on me. ⏰', 'I\'m a bit boring. I just always show up.', 'I\'ve never been late. Not once.', 'Being on time. Every. Single. Day. ⏰'],
    unreliable: ['Sorry I\'m late for this interview, by the way. 💤', 'Alarms. They don\'t work for me.', 'I forgot what I was going to say.', 'Disappearing? Wait, what was the question? 💨'],
    funny: ['I make everyone laugh! 😂', 'I make jokes at bad times.', 'Why did the coffee call the police? It got mugged! ☕', 'Making grumpy people laugh! 😂'],
    serious: ['I want to do excellent work. 🧐', 'I don\'t really do small talk.', 'Fun? I read tax books. For fun.', 'Focusing for 8 hours straight. 🧐']
  };

  function eventSheet() {
    var g = S.g, sh = S.sheet, x = sh.x, def = CS.EV[x.id], c = x.ctx;
    if (sh.phase === 'result') return resultView(sh);
    var h = '<div class="ev-card">' + evHead(def, x) + '<div class="ev-body">';
    var title = '<h2>' + F(def.title, x) + '</h2>';
    switch (def.kind) {
      case 'chat': {
        var who = def.from === 'a' || def.from === 'm' ? G.emp(g, c[def.from]) : null;
        var fr = who ? { name: who.name, face: who.face, hue: who.hue } : def.from;
        h += title + '<div class="phone"><div class="who">' + face(fr) + '<span>' + esc(fr.name) + '<small>● online</small></span></div>' +
          def.msgs.map(function (m, i) { return '<div class="msg" style="animation-delay:' + (i * 0.35) + 's">' + F(m, x) + '</div>'; }).join('') +
          '<div class="typing" style="animation-delay:' + (def.msgs.length * 0.35) + 's"><span></span><span></span><span></span></div></div>' +
          '<div class="options">' + choiceButtons(g, x, def, 'reply') + '</div>';
        break;
      }
      case 'review':
        h += title + '<div class="review"><div class="by"><span style="font-size:26px">🧑</span>' + esc(c.who2 || 'A customer') + '</div><div class="stars">' +
          [1, 2, 3, 4, 5].map(function (n) { return '<span class="' + (n <= def.stars ? 'on' : 'off') + '" style="animation-delay:' + (0.1 * n) + 's">★</span>'; }).join('') + '</div><q>' + F(def.text, x) + '</q></div>' +
          '<div class="options">' + choiceButtons(g, x, def) + '</div>';
        break;
      case 'news':
        h += '<div class="breaking">BREAKING NEWS</div><div class="newspaper"><h2>' + F(def.title, x) + '</h2><p style="margin:6px 0 0">' + F(def.text, x) + '</p></div><div class="options">' + choiceButtons(g, x, def) + '</div>';
        break;
      case 'boxes':
        h += title + '<p class="ev-text">' + F(def.text, x) + '</p>';
        if (!sh.res) h += '<div class="boxes">' + [0, 1, 2, 3].map(function (i) { return '<button class="box" data-a="box" data-v="' + i + '" aria-label="Box ' + (i + 1) + '">🎁</button>'; }).join('') + '</div>';
        else {
          h += '<div class="boxes">' + sh.res.boxes.map(function (p, i) { return '<div class="box open ' + (i === sh.res.pick ? 'mine' : '') + '" style="animation-delay:' + (i === sh.res.pick ? 0 : 0.5 + i * 0.1) + 's">' + p.emoji + '<small>' + esc(p.label) + '</small></div>'; }).join('') + '</div>' +
            '<p>You picked box ' + (sh.res.pick + 1) + '!</p><button class="btn green block" data-a="showres">Continue ▶</button>';
        }
        break;
      case 'wheel':
        h += title + '<p class="ev-text">' + F(def.text, x) + '</p>' + wheelSvg(def);
        h += sh.res ? '<button class="btn yellow big block" disabled>🎡 Spinning...</button>'
          : fourButtons([['spin', 'free', '🎡 Free spin', 'Normal prizes'], ['spin', 'golden', '💎 Golden spin', 'Better odds, 1.5x prizes', g.cash < G.spinCost(g), '<span class="tags"><span class="tag cost">-' + U.short(G.spinCost(g)) + '</span></span>'],
            ['wheelsafe', null, '🎁 Take a small sure prize', 'No spin, just ' + U.short(G.prize(g, 0.3))], ['wheelskip', null, '🙅 Skip it', 'Walk away']]);
        break;
      case 'tap':
        h += title + '<p class="ev-text">' + F(def.text, x) + '</p>';
        if (sh.level == null) {
          h += fourButtons(G.TAP_LEVELS.map(function (lv, i) { return ['taplevel', i, lv.emoji + ' ' + lv.label, 'Tap ' + G.tapGoal(def, i) + ' times in ' + def.secs + 's · prize x' + lv.prize]; }).concat([['tapskip', null, '🙅 Skip', 'No prize, no risk']]));
        } else {
          h += '<div class="arena" id="arena"><div class="hudline"><span id="tapCount">0 / ' + G.tapGoal(def, sh.level) + '</span><span id="tapTime">' + def.secs + 's</span></div>' +
            '<div class="start"><button class="btn green big" data-a="tapstart">▶ START!</button></div></div><div class="timebar"><i id="tapBar"></i></div>' +
            '<p class="faint" style="font-size:13px">Tap the ' + def.target + ' ' + G.tapGoal(def, sh.level) + ' times!</p>';
        }
        break;
      case 'quiz':
        h += title + '<div class="quiz-q">' + esc(c.q.q) + '</div><div class="answers">' + c.q.options.map(function (o, i) {
          var cls = sh.res ? (i === c.q.answer ? 'right' : i === sh.pick ? 'wrong' : '') : '';
          return '<button class="btn in ' + cls + '" data-a="answer" data-v="' + i + '" style="animation-delay:' + (0.1 + i * 0.08) + 's" ' + (sh.res ? 'disabled style="opacity:1;filter:none"' : '') + '>' + esc(o) + '</button>';
        }).join('') + '</div>' + (sh.res ? '<button class="btn green block" style="margin-top:14px" data-a="showres">Continue ▶</button>' : '');
        break;
      case 'deal':
        h += title + '<p class="ev-text">' + F(def.text, x) + '</p>';
        if (c.walked) h += '<div class="banner red">😤 They walked away! Too greedy...</div><button class="btn block" data-a="dealend">Oh well ▶</button>';
        else h += '<span class="label">Their offer</span><div class="offer bump">' + M(c.offer) + '</div><div class="dots">' + [0, 1, 2, 3].map(function (i) { return '<i class="' + (i <= c.round ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
          fourButtons([['dealok', null, '🤝 Accept ' + U.short(c.offer), 'Take the money'], ['dealpush', 0, '💪 Ask for a bit more', 'They might walk away', c.round >= 3, '<span class="tags"><span class="tag risk">🎲 risky</span></span>'],
            ['dealpush', 1, '🤑 Ask for WAY more', 'Big jump... or they leave!', c.round >= 2, '<span class="tags"><span class="tag risk">🎲 very risky</span></span>'], ['dealend', null, '🙅 No deal', 'Walk away']]);
        break;
      case 'vs': {
        var me = sh.res && sh.res.me, them = sh.res && sh.res.them;
        var rco = G.rivalByName(g, c.rival) || { logo: '😈', color: '#FF4D5E' };
        h += title + '<p class="ev-text">' + F(def.text, x) + '</p><div class="versus"><div class="side">' + logo(g.company) + esc(g.company.name) + (me ? '<span class="move">' + me.emoji + '</span>' : '') + '</div><span class="vs">VS</span>' +
          '<div class="side"><span class="logo" style="background:' + esc(rco.color) + '">' + esc(rco.logo) + '</span>' + esc(c.rival) + (them ? '<span class="move" style="animation-delay:.4s">' + them.emoji + '</span>' : '') + '</div></div>';
        if (!sh.res) h += '<div class="rules">💸 beats ⭐ · ⭐ beats 📣 · 📣 beats 🎉 · 🎉 beats 💸</div><div class="moves">' + G.VS_MOVES.map(function (m, i) { return '<button class="btn in" data-a="vs" data-v="' + m.id + '" style="animation-delay:' + (0.1 + i * 0.08) + 's"><span>' + m.emoji + '</span>' + m.label + '</button>'; }).join('') + '</div>';
        else h += '<div class="banner ' + (sh.res.outcome === 'win' ? 'green' : sh.res.outcome === 'lose' ? 'red' : 'gold') + '" style="animation-delay:.7s">' + (sh.res.outcome === 'win' ? '🏆 YOU WIN!' : sh.res.outcome === 'lose' ? '😖 You lost!' : '🤝 Tie!') + '</div><button class="btn green block" data-a="showres">Continue ▶</button>';
        break;
      }
      case 'interview': {
        var cd = c.cand;
        h += title + '<p class="ev-text">' + F(def.text, x) + '</p><div class="cand">' + face(cd) + '<div style="flex:1"><b style="font-family:var(--display);font-size:18px">' + esc(cd.name) + '</b><br><small>' + (CS.ROLES[cd.role].emoji || ind(g).emoji) + ' ' + G.title(g, cd) + ' · Skill ' + Math.round(cd.skill) + ' · ' + U.short(cd.salary) + '/wk</small><div class="chips" style="margin-top:4px">' + traitChip(cd, 0) + (c.asked != null ? traitChip(cd, 1) : '<span class="trait unk">❓ Hidden</span>') + '</div></div></div>';
        if (c.asked == null) h += fourButtons(INTERVIEW_Q.map(function (q, i) { return ['ask', i, q]; }));
        else h += '<div class="phone"><div class="msg me">' + INTERVIEW_Q[c.asked] + '</div><div class="msg" style="animation-delay:.4s">' + esc((INTERVIEW_A[cd.traits[1]] || ['...', '...', '...', '...'])[c.asked]) + '</div></div>' +
          fourButtons([['hirecand', 'hire', '🤝 Hire (free!)', 'Normal pay'], ['hirecand', 'rich', '💰 Hire + pay 10% more', 'They will be super loyal'], ['hirecand', 'trial', '🧪 Hire on a trial', 'Pay 10% less, a bit grumpy'], ['pass', null, '🙅 No thanks', '']]);
        break;
      }
      case 'post':
        h += title + '<p class="ev-text">' + F(def.text, x) + '</p>' + (sh.res ? postResult(sh.res.post) + '<button class="btn green block" data-a="showres">Continue ▶</button>' : postPicker(g, 'postev'));
        break;
      default:
        h += title + '<p class="ev-text">' + F(def.text, x) + '</p><div class="options">' + choiceButtons(g, x, def) + '</div>';
    }
    return h + '</div></div>';
  }

  function wheelSvg(def) {
    var n = def.slices.length, a = 360 / n, r = 96, parts = '';
    function pt(deg, rad) { var t = deg * Math.PI / 180; return (rad * Math.sin(t)).toFixed(2) + ' ' + (-rad * Math.cos(t)).toFixed(2); }
    def.slices.forEach(function (s, i) {
      parts += '<path d="M0 0 L' + pt(i * a, r) + ' A' + r + ' ' + r + ' 0 0 1 ' + pt((i + 1) * a, r) + ' Z" fill="' + s.color + '" stroke="#2B2250" stroke-width="3"/>';
      var mid = (i + 0.5) * a, p = pt(mid, 64).split(' ');
      parts += '<text x="' + p[0] + '" y="' + p[1] + '" font-size="22" text-anchor="middle" dominant-baseline="central" transform="rotate(' + mid + ' ' + p[0] + ' ' + p[1] + ')">' + s.emoji + '</text>';
    });
    return '<div class="wheel-wrap"><span class="wheel-pointer">🔻</span><svg id="wheel" viewBox="-100 -100 200 200" role="img" aria-label="Prize wheel"><circle r="99" fill="#2B2250"/>' + parts + '</svg><div class="wheel-hub">🍀</div></div>';
  }

  function postPicker(g, action) {
    return '<div class="post-grid">' + G.postOptions(g).map(function (p, i) {
      var note = p.cost ? 'Costs ' + U.short(G.cost(g, p.cost)) : p.risk >= 0.2 ? '🌶️ Risky!' : p.viral >= 0.1 ? '🔥 Could go viral' : '✅ Safe';
      return '<button class="post-opt in" data-a="' + action + '" data-v="' + p.id + '" style="animation-delay:' + (0.1 + i * 0.08) + 's"><span class="e">' + p.emoji + '</span><b>' + p.name + '</b><small>' + note + '</small></button>';
    }).join('') + '</div>';
  }
  function postResult(r) {
    return '<div class="post-card"><div class="ph">' + r.post.emoji + '</div><div class="metrics">' +
      '<div><b>' + countUp(r.views, 'num') + '</b><small>👀 views</small></div><div><b>' + countUp(r.likes, 'num') + '</b><small>❤️ likes</small></div>' +
      '<div><b>' + countUp(r.comments, 'num') + '</b><small>💬 comments</small></div><div><b>' + countUp(r.shares, 'num') + '</b><small>🔁 shares</small></div></div></div>' +
      (r.viral ? '<div style="text-align:center;margin-bottom:10px"><span class="viral-stamp">🔥 VIRAL!</span></div>' : '') +
      '<div class="banner ' + (r.backfire ? 'red' : 'green') + '">' + esc(r.text) + (r.followers ? '<br>+' + U.num(r.followers) + ' followers 📱' : '') + '</div>';
  }

  function resultView(sh) {
    var res = sh.res, def = CS.EV[sh.x.id];
    var good = res.chips.filter(function (c) { return c.good; }).length, bad = res.chips.length - good;
    var big = res.won === true || good > bad ? U.pick(['🎉', '😄', '🥳', '🤩']) : bad > good ? U.pick(['😬', '😖', '🙈']) : '🙂';
    return '<div class="result"><div class="face-big">' + big + '</div><h2>' + F(def.title || 'What happened', sh.x) + '</h2><p>' + esc(res.text || 'Done!') + '</p>' +
      (res.chips.length ? '<div class="chips">' + res.chips.map(function (c, i) { return '<span class="chip ' + (c.good ? 'good' : 'bad') + '" style="animation-delay:' + (0.15 + i * 0.1) + 's">' + esc(c.txt) + '</span>'; }).join('') + '</div>' : '') +
      (res.later ? '<div class="story-hint later">⏳ This isn\'t over yet...</div>' : '') +
      (res.then ? '<div class="story-hint now">🔗 The story continues...</div><button class="btn pink big block" data-a="cont">➡️ What happens next?</button></div>'
        : '<button class="btn green big block" data-a="cont">' + (S.g.queue.length ? 'Next (' + S.g.queue.length + ' more) ▶' : 'Continue ▶') + '</button></div>');
  }

  function weekSheet(r) {
    var g = S.g, f = r.fin;
    var word = r.count === 0 ? 'A quiet week. ☕' : r.count >= 5 ? 'WOW! ' + r.count + ' things happened! 🌪️' : r.count + ' thing' + (r.count > 1 ? 's' : '') + ' happened!';
    var h = '<div class="wk-title"><div class="cal">📅</div><h2>Week ' + r.week + ' done!</h2><p>' + word + '</p></div>' +
      '<div class="money-pop ' + (f.net >= 0 ? 'good' : 'bad') + '">' + countUp(Math.round(f.net), 'signed') + '</div>' +
      '<div class="card" style="box-shadow:none"><table class="ledger">' +
      (f.closed ? '<tr><td class="bad">🔒 Closed this week</td><td></td></tr>' : '') +
      '<tr><td>' + ind(g).emoji + ' ' + U.num(f.served) + ' ' + ind(g).unit + '</td><td class="good">+' + U.short(f.revenue) + '</td></tr>' +
      '<tr><td>🧾 Supplies</td><td>-' + U.short(f.supplies) + '</td></tr><tr><td>👥 Pay</td><td>-' + U.short(f.wages) + '</td></tr><tr><td>🏠 Rent</td><td>-' + U.short(f.rent) + '</td></tr>' +
      (f.loans ? '<tr><td>🏦 Loans</td><td>-' + U.short(f.loans) + '</td></tr>' : '') + '</table></div>';
    if (r.streakBonus) h += '<div class="banner gold">🔥 ' + r.streak + '-week profit streak! Bonus: ' + M(r.streakBonus) + '</div>';
    else if (r.streak >= 3) h += '<div class="banner gold">🔥 ' + r.streak + ' profitable weeks in a row!</div>';
    if (r.cup) h += '<div class="banner pink">🏆 Business Cup finished! You placed #' + r.cup.place + '</div>';
    if (r.star && g.employees.length > 1) h += '<div class="banner" style="background:#E0F2FF">🏅 Worker of the week: ' + esc(r.star.face) + ' ' + esc(r.star.name) + '</div>';
    if (g.golden && !g.golden.tapped) h += '<div class="banner gold">🤑 A golden customer is outside! Tap them on the home screen!</div>';
    if (r.minor.length) h += '<div class="happen">' + r.minor.map(function (m, i) { return '<div style="animation-delay:' + (0.2 + i * 0.08) + 's">' + esc(m) + '</div>'; }).join('') + '</div>';
    var pend = g.queue.length;
    return h + '<button class="btn green big block" style="margin-top:12px" data-a="cont">' + (pend ? '⚡ ' + pend + ' thing' + (pend > 1 ? 's' : '') + ' to decide ▶' : g.over ? 'Continue ▶' : '👍 Back to work') + '</button>';
  }

  function empSheet() {
    var g = S.g, sh = S.sheet, cand = sh.type === 'cand';
    var e = cand ? g.candidates.find(function (c) { return c.id === sh.id; }) : G.emp(g, sh.id);
    if (!e) return null;
    var mkt = G.market(g, e.role, e.level);
    var h = '<div class="grab"></div><div style="display:flex;gap:12px;align-items:center">' + face(e, !cand).replace('class="face"', 'class="face big-face"') +
      '<div><h2 style="font-size:24px">' + esc(e.name) + '</h2><span class="muted">' + (CS.ROLES[e.role].emoji || ind(g).emoji) + ' ' + G.title(g, e) + ' · age ' + e.age + '</span><br><small class="muted">' + (e.role === 'front' ? CS.ROLES.front.job : CS.ROLES[e.role].job) + '</small></div></div>';
    h += '<div class="chips" style="margin:12px 0">' + traitChip(e, 0) + traitChip(e, 1) + '</div>';
    h += '<div class="stat-grid"><div><b>' + Math.round(e.skill) + '</b><small>🎯 Skill</small></div>' +
      (cand ? '' : '<div><b>' + G.moodFace(e.morale) + ' ' + Math.round(e.morale) + '</b><small>Mood</small></div><div><b>' + Math.round(e.loyalty) + '</b><small>🐶 Loyalty</small></div>') +
      '<div><b>' + Math.round(e.reliability) + '</b><small>⏰ Reliable</small></div><div><b>' + Math.round(G.productivity(e) * 100) + '%</b><small>⚡ Speed</small></div><div><b>' + U.short(e.salary) + '</b><small>💵 Pay/wk</small></div></div>';
    var diff = Math.round((e.salary / mkt - 1) * 100);
    h += '<p style="font-size:14px;margin:10px 0">' + (diff > 3 ? '😊 Paid ' + diff + '% more than normal.' : diff < -3 ? '😟 Paid ' + (-diff) + '% less than normal. They might get unhappy.' : '👍 Normal pay for this job.') + '</p>';
    if (cand) {
      return h + '<p class="hint">Hiring costs one week of pay (' + M(e.salary) + '). Their second trait shows after 4 weeks.</p>' +
        '<div class="row2" style="margin-top:12px"><button class="btn" data-a="close">Not now</button><button class="btn green" data-a="hire" data-v="' + e.id + '">🤝 Hire</button></div>';
    }
    var friends = G.friendsOf(g, e), enemies = G.enemiesOf(g, e), partner = G.partnerOf(g, e);
    if (friends.length || enemies.length || partner) {
      h += '<div class="card" style="box-shadow:none;margin-bottom:12px"><span class="label">Friends & drama</span><div style="font-size:14px;margin-top:6px;display:grid;gap:4px">' +
        (partner ? '<div>💘 Dating ' + esc(partner.name) + '</div>' : '') +
        friends.filter(function (x) { return x !== partner; }).map(function (x) { return '<div>🤝 Friends with ' + esc(x.name) + '</div>'; }).join('') +
        enemies.map(function (x) { return '<div>😠 Doesn\'t like ' + esc(x.name) + '</div>'; }).join('') + '</div></div>';
    }
    h += '<div class="row2">' +
      '<button class="btn" data-a="raise" data-v="' + e.id + '">💵 Raise +10%</button>' +
      '<button class="btn" data-a="bonus" data-v="' + e.id + '">🎁 Bonus ' + U.short(e.salary * 2) + '</button>' +
      (e.level < 3 && e.role !== 'mgr' ? '<button class="btn" data-a="promote" data-v="' + e.id + '">🎖️ Promote</button>' : '<button class="btn" disabled>🎖️ Top level</button>') +
      (e.role !== 'mgr' ? '<button class="btn" data-a="makemgr" data-v="' + e.id + '">👔 Make manager</button>' : '<button class="btn" data-a="demote" data-v="' + e.id + '">⬇️ Demote</button>') + '</div>';
    if (e.role !== 'mgr' && e.level > 1) h += '<button class="btn block" style="margin-top:10px" data-a="demote" data-v="' + e.id + '">⬇️ Demote</button>';
    h += '<div class="field" style="margin:14px 0 0"><label class="label" for="rename">Rename (name them after a friend!)</label><div class="name-row"><input id="rename" maxlength="24" value="' + esc(e.name) + '"><button class="btn blue" data-a="rename" data-v="' + e.id + '">Save</button></div></div>';
    h += sh.confirmFire
      ? '<div class="banner red" style="text-align:left">Fire ' + esc(e.name) + '? You pay ' + M(e.salary) + ' and their friends get sad.<div class="row2" style="margin-top:8px"><button class="btn small" data-a="fire" data-v="0">Keep them</button><button class="btn small red" data-a="fire" data-v="' + e.id + '">🚪 Fire</button></div></div>'
      : '<button class="btn red block" style="margin-top:12px" data-a="askfire">🚪 Fire</button>';
    return h + '<button class="btn block" style="margin-top:10px" data-a="close">Done</button>';
  }

  function statSheet() {
    var k = S.sheet.k, i = STAT_INFO[k], g = S.g;
    var val = k === 'rep' ? Math.round(g.reputation) : k === 'happy' ? Math.round(g.satisfaction) : k === 'mood' ? Math.round(G.avgMorale(g)) : U.num(g.followers);
    return '<div class="result"><div class="face-big">' + i.e + '</div><h2>' + i.t + ': ' + val + '</h2><p style="font-size:16px">' + i.d + '</p><button class="btn green block" data-a="close">Got it! 👍</button></div>';
  }

  function giftSheet() {
    var st = G.giftStatus(), done = S.sheet.amount;
    var days = G.GIFTS.map(function (m, i) {
      var cls = i + 1 < st.day || (done && i + 1 === st.day) ? 'good' : i + 1 === st.day ? 'gold' : '';
      return '<span class="chip ' + cls + '">Day ' + (i + 1) + (i === 6 ? ' 💎' : '') + '</span>';
    }).join('');
    return '<div class="result"><div class="face-big ' + (done ? '' : 'wiggle') + '">' + (done ? '🎉' : '🎁') + '</div><h2>' + (done ? 'You got ' + M(done) + '!' : 'Daily gift!') + '</h2>' +
      '<p style="font-size:16px">Come back every day in a row for bigger gifts. Day 7 is the biggest!' + (vip() ? ' 👑 VIP doubles every gift!' : '') + '</p><div class="chips" style="justify-content:center;margin-bottom:16px">' + days + '</div>' +
      (done ? '<button class="btn green big block" data-a="close">Yay! 🎉</button>' : '<button class="btn yellow big block" data-a="claimgift">🎁 Open it!</button>') + '</div>';
  }

  function postSheet() {
    var sh = S.sheet;
    return '<div class="ev-card"><div class="ev-head" style="--c:#FF5FA2"><div class="meta"><span>📱 Social Media</span><span>' + U.num(S.g.followers) + ' followers</span></div><div class="ev-icon">📱</div></div><div class="ev-body">' +
      (sh.res ? '<h2>Your post is live!</h2>' + postResult(sh.res) + '<button class="btn green big block" data-a="close">Awesome ▶</button>'
        : '<h2>What do you want to post?</h2><p class="ev-text">Pick one. Some are safe, some are risky but could go viral! 🔥</p>' + postPicker(S.g, 'dopost') + '<button class="btn block" style="margin-top:12px" data-a="close">Maybe later</button>') + '</div></div>';
  }

  function powerSheet() {
    var r = S.sheet.res;
    return '<div class="result"><div class="face-big power-e">' + r.power.emoji + '</div><h2>' + r.power.name + '!</h2><p>' + esc(r.text) + '</p>' +
      (r.chips.length ? '<div class="chips">' + r.chips.map(function (c, i) { return '<span class="chip ' + (c.good ? 'good' : 'bad') + '" style="animation-delay:' + (0.15 + i * 0.1) + 's">' + esc(c.txt) + '</span>'; }).join('') + '</div>' : '') +
      '<p class="small muted">Ready again in ' + G.powerCd(S.g, r.power) + ' weeks.</p><button class="btn green big block" data-a="close">Let\'s go! ⚡</button></div>';
  }

  function offlineSheet() {
    var o = S.sheet.o;
    return '<div class="result"><div class="face-big">💤</div><h2>While you were away...</h2><p>Your shop kept working for <b>' + (o.hours >= 1 ? o.hours.toFixed(1) + ' hours' : Math.round(o.hours * 60) + ' minutes') + '</b> and earned</p>' +
      '<div class="money-pop good">' + countUp(o.amt, 'money') + '</div>' + (vip() ? '<p class="small">👑 VIP doubled it!</p>' : '<p class="small">👑 VIP earns 2x while you are away.</p>') +
      '<button class="btn green big block" data-a="close">Collect! 💰</button></div>';
  }

  // VIP Pass: one payment, yours forever.
  function vipSheet() {
    var st = CS.Store.info(), on = vip();
    var h = '<div class="vip-head"><div class="crown">👑</div><h2>VIP Pass</h2><p>' + (on ? 'You are VIP. Thank you! 💖' : 'Pay once, keep it forever. It also helps us make more updates!') + '</p></div>' +
      '<div class="perks">' + CS.VIP_PERKS.map(function (p, i) { return '<div class="perk"' + stagger(i) + '><span class="e">' + p[0] + '</span><span><b>' + p[1] + '</b><small>' + p[2] + '</small></span>' + (on ? '<span>✅</span>' : '') + '</div>'; }).join('') + '</div>';
    if (!on) h += buyButton('vip', 'btn yellow big block', '👑 Get VIP forever · ');
    h += shopFoot(st);
    return h + '<div class="row2" style="margin-top:10px"><button class="btn" data-a="shop">💎 Shop</button><button class="btn" data-a="close">Close</button></div>';
  }
  function buyButton(key, cls, label) {
    var st = CS.Store.info();
    if (!st.native) return '<button class="' + cls + '" disabled>' + label + esc(CS.Store.price(key)) + '</button>';
    return '<button class="' + cls + '" data-a="buy" data-v="' + key + '" ' + (st.busy ? 'disabled' : '') + '>' + label + esc(CS.Store.price(key)) + '</button>';
  }
  function shopFoot(st) {
    return (st.error ? '<p class="small bad">' + esc(st.error) + '</p>' : '') +
      (st.native ? '<button class="btn small block" style="margin-top:8px" data-a="restorevip">Restore my purchases</button>' +
        '<p class="small muted shop-note">💳 These cost real money, paid through Google Play. Ask a parent before you buy!</p>'
        : '<p class="small muted shop-note">📱 Buying works in the Company Simulator app from Google Play. This web version can\'t take payments.</p>');
  }
  // The real-money shop.
  function shopSheet() {
    var st = CS.Store.info(), g = S.g;
    var h = '<div class="vip-head"><div class="crown">💎</div><h2>Shop</h2><p>Boost your company with real purchases.</p></div><div class="shop-list">';
    CS.Store.PRODUCTS.forEach(function (p, i) {
      var item = CS.SHOP[p.key], owned = p.kind === 'forever' && CS.Store.owns(p.key);
      var extra = item.weeks && g && g.mode === 'main' ? ' <b>(' + U.short(U.nice(G.scale(g) * item.weeks)) + ' for this company)</b>' : '';
      h += '<div class="shop-item ' + (p.key === 'vip' ? 'gold' : '') + '"' + stagger(i) + '><span class="e">' + item.emoji + '</span><span class="grow"><b>' + item.name + '</b><small>' + item.desc + extra + '</small></span>' +
        (owned ? '<span class="chip good">✅ Owned</span>' : buyButton(p.key, 'btn small ' + (p.key === 'vip' ? 'yellow' : 'green'), '')) + '</div>';
    });
    h += '</div>' + shopFoot(st);
    return h + '<button class="btn block" style="margin-top:10px" data-a="close">Close</button>';
  }
  // Gives the current company anything bought in the shop.
  function giveGrants() {
    var g = S.g;
    if (!g || g.mode !== 'main' || g.over || !CS.Store.hasGrants()) return;
    CS.Store.takeGrants().forEach(function (key) {
      var t = G.shopGrant(g, key);
      if (t) { toast(t); SFX.play('level'); confetti(70); coinBurst(16); }
    });
  }

  function shareSheet() {
    var g = S.g, daily = g.over && g.over.reason === 'daily';
    var text = daily ? G.dailyShare(g) : G.shareText(g);
    return '<div class="grab"></div><h2 style="text-align:center;margin:6px 0 12px">📤 Show your friends!</h2><img class="share-img" id="shareImg" alt="Your company card">' +
      '<textarea class="share-text" id="shareText" readonly>' + esc(text) + '</textarea>' +
      '<div class="row2"><button class="btn pink" data-a="doshare">📤 Share</button><button class="btn" data-a="copyshare">📋 Copy</button></div>' +
      '<button class="btn block" style="margin-top:10px" data-a="close">Close</button>';
  }

  function confirmSheet() {
    var w = S.sheet.what;
    var t = w === 'newgame' ? ['🔄', 'Start over?', 'This company is saved in your history, and you start a new one. You get a small bonus for your experience!']
      : w === 'wargiveup' ? ['🏳️', 'Quit this war?', 'The games you haven\'t played count as 0, so you will probably lose and give up 10% of your fans.']
        : ['📉', 'Give up?', 'Your company closes for good. Your next company gets an experience bonus.'];
    return '<div class="result"><div class="face-big">' + t[0] + '</div><h2>' + t[1] + '</h2><p style="font-size:16px">' + t[2] + '</p><div class="row2"><button class="btn" data-a="' + (w === 'wargiveup' ? 'warback' : 'close') + '">Cancel</button><button class="btn red" data-a="doconfirm">Yes</button></div></div>';
  }

  // ---------- game over / daily finish ----------

  function overScreen() {
    var g = S.g;
    if (g.over.reason === 'daily') {
      var best = G.dailyBest()[g.dailyNum];
      return '<div class="wrap gameover enter"><div class="face-big">🏁</div><h1>Challenge done!</h1><div class="card"><span class="label">Daily Challenge #' + g.dailyNum + '</span>' +
        '<div class="offer">' + U.short(G.valuation(g)) + '</div><p style="margin:0">company value after 52 weeks</p><div class="grid-emoji">' + G.dailyGrid(g) + '</div>' +
        '<small class="muted">🟩 profit · 🟨 so-so · 🟥 loss (every 4 weeks)</small>' + (best ? '<p><b>Your best today: ' + U.short(best) + '</b></p>' : '') + '</div>' +
        '<button class="btn pink big block section" data-a="share">📤 Share my score</button><button class="btn block section" data-a="home">🏠 Main menu</button><p style="font-size:14px">Come back tomorrow for a new challenge! 📅</p></div>';
    }
    return '<div class="wrap gameover enter"><div class="face-big">📉</div><h1>' + esc(g.company.name) + ' closed!</h1>' +
      '<div class="card" style="text-align:left"><table class="ledger"><tr><td>📅 Weeks in business</td><td>' + g.week + '</td></tr><tr><td>💰 Most money</td><td>' + M(g.stats.peakCash) + '</td></tr>' +
      '<tr><td>👥 Most workers</td><td>' + g.stats.maxStaff + '</td></tr><tr><td>🎖️ CEO level</td><td>' + g.level + '</td></tr><tr><td>🏆 Gold cups</td><td>' + (g.cups ? g.cups.gold : 0) + '</td></tr><tr><td>🤔 Decisions</td><td>' + g.stats.decisions + '</td></tr></table></div>' +
      '<p class="card section" style="font-size:15px">Every great boss fails sometimes! 💪 Your next company starts with bonus cash.</p>' +
      '<button class="btn green big block" data-a="restart">✨ Start a new company</button><button class="btn block section" data-a="home">🏠 Main menu</button></div>';
  }

  // ================= render =================

  function render() {
    var g = S.g;
    if (S.screen === 'game' && g && g.over && !S.sheet) { S.screen = 'over'; }
    $app.innerHTML = S.screen === 'title' ? titleScreen() : S.screen === 'create' ? createScreen() : S.screen === 'over' ? overScreen() : gameScreen();
    // Tab content animates in only when you open a new screen or tab.
    var view = S.screen + ':' + S.tab;
    var tv = $app.querySelector('.tabview');
    if (tv && view !== S.viewKey) tv.classList.add('enter');
    S.viewKey = view;
    renderSheet();
    // Menu, game and war each have their own music.
    if (CS.Music) CS.Music.setMood(S.sheet && S.sheet.type === 'war' ? 'war' : S.screen === 'game' ? 'game' : 'menu');
    if (S.screen === 'game' && S.tab === 'home') CS.Scene.start();
    if (g && S.screen === 'game') S.prev = G.snap(g);
  }

  function renderSheet() {
    var sh = S.sheet, html = null;
    if (sh) {
      html = sh.type === 'week' ? weekSheet(sh.report) : sh.type === 'event' ? eventSheet() : sh.type === 'emp' || sh.type === 'cand' ? empSheet()
        : sh.type === 'stat' ? statSheet() : sh.type === 'gift' ? giftSheet() : sh.type === 'post' ? postSheet() : sh.type === 'share' ? shareSheet()
          : sh.type === 'confirm' ? confirmSheet() : sh.type === 'vip' ? vipSheet() : sh.type === 'shop' ? shopSheet() : sh.type === 'power' ? powerSheet() : sh.type === 'offline' ? offlineSheet()
            : sh.type === 'adtry' ? adTrySheet() : sh.type === 'war' ? warSheet() : null;
      if (html == null) S.sheet = null;
    }
    var key = sh ? sh.type + ':' + (sh.x ? sh.x.id + sh.x.ctx.a + (sh.phase || '') : sh.id || sh.k || '') + ':' + (sh.n || 0) : null;
    var enter = key && key !== S.sheetKey;
    S.sheetKey = key;
    $sheet.innerHTML = html ? '<div class="scrim' + (enter ? ' enter' : '') + '" data-a="scrim"><div class="sheet" role="dialog" aria-modal="true">' + html + '</div></div>' : '';
    document.body.style.overflow = html ? 'hidden' : '';
    hydrate();
  }

  // After-render work: number count-ups and the share image.
  function hydrate() {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var to = +el.dataset.count, from = +(el.dataset.from || 0), fmt = el.dataset.fmt, t0 = performance.now(), dur = 700;
      if (reduced) { el.textContent = fmtVal(to, fmt); return; }
      (function step(t) {
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmtVal(Math.round(from + (to - from) * e), fmt);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
    var img = document.getElementById('shareImg');
    if (img && !img.src) img.src = shareCard();
  }

  // ================= week transition =================

  function weekTransition(week, done) {
    if (reduced) return done();
    var days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    $over.innerHTML = '<div class="week-flip"><div class="cal-big"><div class="cal-top">WEEK</div><div class="cal-num" id="calNum">' + (week - 1) + '</div><div class="cal-days">' +
      days.map(function (d, i) { return '<span style="animation-delay:' + (0.06 * i) + 's">' + d + '</span>'; }).join('') + '</div></div><div class="flip-coins">💰 🪙 💰</div></div>';
    SFX.play('page');
    setTimeout(function () { var n = document.getElementById('calNum'); if (n) { n.textContent = week; n.classList.add('flip'); } SFX.play('tick'); }, 420);
    setTimeout(function () { $over.innerHTML = ''; done(); }, 900);
  }

  // ================= mini-game engines =================

  function spinWheel(mode) {
    var sh = S.sheet, def = CS.EV[sh.x.id];
    sh.res = G.spin(S.g, mode);
    render();
    var n = def.slices.length, a = 360 / n, target = 360 * 6 - (sh.res.slice + 0.5) * a + (Math.random() - 0.5) * a * 0.5;
    var el = document.getElementById('wheel');
    SFX.play('whoosh');
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (el) el.style.transform = 'rotate(' + target + 'deg)'; }); });
    var ticks = 0, tk = setInterval(function () { if (++ticks > 16) clearInterval(tk); else SFX.play('tick'); }, 180);
    setTimeout(function () { if (S.sheet === sh) { sh.phase = 'result'; celebrate(sh.res); render(); } }, 3600);
  }

  function startTap() {
    var sh = S.sheet, def = CS.EV[sh.x.id], arena = document.getElementById('arena'), goal = G.tapGoal(def, sh.level);
    if (!arena || tapState) return;
    arena.querySelector('.start').remove();
    var btn = document.createElement('button');
    btn.className = 'target'; btn.type = 'button'; btn.textContent = def.target; btn.setAttribute('aria-label', 'Tap');
    arena.appendChild(btn);
    tapState = { n: 0, end: performance.now() + def.secs * 1000 };
    var speed = [1100, 850, 650][sh.level];
    function move() {
      var w = arena.clientWidth - 72, h = arena.clientHeight - 72 - 30;
      btn.style.left = Math.round(Math.random() * w) + 'px';
      btn.style.top = Math.round(30 + Math.random() * h) + 'px';
    }
    move();
    var mover = setInterval(move, speed);
    btn.addEventListener('pointerdown', function (ev) {
      ev.preventDefault();
      if (!tapState) return;
      tapState.n++;
      SFX.play('tap'); buzz(8);
      document.getElementById('tapCount').textContent = tapState.n + ' / ' + goal;
      var plus = document.createElement('span');
      plus.className = 'pop-plus'; plus.textContent = '+1';
      plus.style.left = btn.style.left; plus.style.top = btn.style.top;
      arena.appendChild(plus); setTimeout(function () { plus.remove(); }, 600);
      move();
    });
    (function tick() {
      if (!tapState) return;
      var left = Math.max(0, tapState.end - performance.now());
      var bar = document.getElementById('tapBar'), tt = document.getElementById('tapTime');
      if (bar) bar.style.width = (left / (def.secs * 10)) + '%';
      if (tt) tt.textContent = (left / 1000).toFixed(1) + 's';
      if (left > 0) return requestAnimationFrame(tick);
      clearInterval(mover);
      var score = tapState.n; tapState = null;
      sh.res = G.tapDone(S.g, score, sh.level);
      sh.phase = 'result';
      celebrate(sh.res);
      render();
    })();
  }

  // ================= share image =================

  function shareCard() {
    var g = S.g, cv = document.createElement('canvas'), W = 600, H = 600;
    cv.width = W; cv.height = H;
    var x = cv.getContext('2d');
    var grd = x.createLinearGradient(0, 0, 0, H);
    grd.addColorStop(0, '#3EC5FF'); grd.addColorStop(1, '#8EE3FF');
    x.fillStyle = grd; x.fillRect(0, 0, W, H);
    x.fillStyle = 'rgba(255,255,255,.25)';
    for (var i = 0; i < 15; i++) for (var j = 0; j < 15; j++) { x.beginPath(); x.arc(i * 40 + 20, j * 40 + 20, 3, 0, 7); x.fill(); }
    function rr(px, py, w, h, r, fill) { x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); x.fillStyle = fill; x.fill(); x.lineWidth = 6; x.strokeStyle = '#2B2250'; x.stroke(); }
    rr(40, 48, W - 80, H - 96, 36, '#FFFFFF');
    rr(W / 2 - 60, 80, 120, 120, 30, g.company.color);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '72px sans-serif'; x.fillText(g.company.logo, W / 2, 144);
    x.fillStyle = '#2B2250'; x.font = 'bold 40px Fredoka, sans-serif'; x.fillText(g.company.name.slice(0, 22), W / 2, 244);
    var rk = CS.RANKS[g.rank];
    x.font = 'bold 26px Nunito, sans-serif'; x.fillStyle = '#625A8C';
    x.fillText(rk.emoji + ' ' + rk.name + ' · ' + CS.IND[g.company.industry].name, W / 2, 288);
    x.fillStyle = '#15803D'; x.font = 'bold 64px Fredoka, sans-serif'; x.fillText(U.short(G.valuation(g)), W / 2, 360);
    x.fillStyle = '#625A8C'; x.font = 'bold 22px Nunito, sans-serif'; x.fillText('company value', W / 2, 402);
    x.fillStyle = '#2B2250'; x.font = 'bold 26px Nunito, sans-serif';
    x.fillText('📅 ' + g.week + ' wks   👥 ' + g.employees.length + '   📱 ' + U.num(g.followers) + '   🏆 ' + (g.cups ? g.cups.gold : 0), W / 2, 452);
    if (g.over && g.over.reason === 'daily') { x.font = '30px sans-serif'; x.fillText(G.dailyGrid(g), W / 2, 494); }
    x.fillStyle = '#7C4DFF'; x.font = 'bold 24px Fredoka, sans-serif'; x.fillText('COMPANY SIMULATOR', W / 2, 520);
    try { return cv.toDataURL('image/png'); } catch (e) { return ''; }
  }

  // ================= flow helpers =================

  function openNextEvent() {
    var x = G.currentEvent(S.g);
    if (!x) return closeFlow();
    S.sheet = { type: 'event', x: x, phase: 'play', n: Math.random() };
    SFX.play('pop');
  }
  function closeFlow() {
    S.sheet = null;
    if (S.g.over) endCompany();
    showOverlay();
  }
  function endCompany() {
    var g = S.g;
    if (g.over.reason === 'daily') { G.recordDaily(g); G.save(g); }
    else if (!g.legacyDone) { G.recordLegacy(g, g.over.reason === 'gaveup' ? 'Gave up' : 'Bankrupt'); g.legacyDone = true; G.clearSave('main'); }
    S.screen = 'over';
    if (g.over.reason === 'daily') { confetti(100); SFX.play('level'); }
  }
  function finish(res) { var sh = S.sheet; sh.res = res; sh.phase = 'result'; celebrate(res); }
  function afterAction() {
    var un = G.checkAchievements(S.g), lv = G.takeLevelUps(S.g);
    G.save(S.g);
    queueCelebrations({ unlocked: un, levelUps: lv });
  }
  function enterGame() {
    S.screen = 'game'; S.tab = 'home'; S.prev = null; window.scrollTo(0, 0);
    giveGrants();
    var off = G.offlineEarnings(S.g);
    if (off) { S.sheet = { type: 'offline', o: off }; SFX.play('coin'); return; }
    if (S.g.war && S.g.war.battle) { S.sheet = { type: 'war', k: 'war', stage: S.g.war.battle.done ? 'end' : 'intro' }; return; }
    if (G.currentEvent(S.g)) openNextEvent();
  }
  // Android app: the WebView has no navigator.share, so the native share menu (Capacitor) is used.
  function nativeShare() { var Cap = globalThis.Capacitor; return Cap && Cap.isNativePlatform && Cap.isNativePlatform() && Cap.Plugins && Cap.Plugins.Share; }
  // Shares text. Resolves true if it was shared or copied, false if the player cancelled.
  function shareText(text, title) {
    var NS = nativeShare();
    if (NS) return NS.share({ title: 'Company Simulator', text: text, dialogTitle: title }).then(function () { return true; }, function () { return false; });
    if (navigator.share) return navigator.share({ title: 'Company Simulator', text: text }).then(function () { return true; }, function (e) { return !(e && e.name === 'AbortError'); });
    return new Promise(function (res) {
      try { navigator.clipboard.writeText(text).then(function () { toast('📋 Copied! Paste it to your friends.'); res(true); }, function () { res(true); }); } catch (e) { res(true); }
    });
  }
  function startMusic() { if (S.settings.music && S.started && CS.Music) CS.Music.start(); }

  // ================= actions =================

  var A = {
    noop: function () { return false; },
    home: function () { S.sheet = null; S.screen = 'title'; S.g = null; window.scrollTo(0, 0); },
    new: function () { S.create.step = 0; S.screen = 'create'; },
    continue: function () { S.g = G.load('main'); if (!S.g) return; G.resume(S.g); enterGame(); },
    daily: function () {
      var info = G.dailyInfo(), saved = G.load('daily');
      if (saved) { S.g = saved; G.resume(saved); } else S.g = G.newGame(info);
      if (S.g.over) { S.screen = 'over'; return; }
      enterGame();
    },
    randname: function () { S.create.name = G.randomName(); SFX.play('pop'); },
    avatar: function (v) { S.create.avatar = v; SFX.play('tap'); },
    logo: function (v) { S.create.logo = v; SFX.play('tap'); },
    color: function (v) { S.create.color = v; SFX.play('tap'); },
    tier: function (v) { S.create.tier = v; S.create.industry = CS.INDUSTRIES.find(function (i) { return i.tier === v && (!i.vip || vip()); }).id; SFX.play('tap'); },
    industry: function (v) { if (CS.IND[v].vip && !vip()) { S.sheet = { type: 'vip' }; return; } S.create.industry = v; SFX.play('tap'); },
    city: function (v) { S.create.city = v; SFX.play('tap'); },
    funding: function (v) { S.create.funding = v; SFX.play('tap'); },
    cnext: function () {
      if (S.create.step === 0 && !S.create.name.trim()) { toast('Type a name first! Or tap 🎲'); return false; }
      S.create.step++; S.viewKey = null; window.scrollTo(0, 0); SFX.play('pop');
    },
    cback: function () { if (S.create.step === 0) S.screen = 'title'; else S.create.step--; S.viewKey = null; window.scrollTo(0, 0); },
    start: function () {
      var c = S.create;
      S.g = G.newGame({ name: c.name.trim(), logo: c.logo, color: c.color, avatar: c.avatar, industry: c.industry, city: c.city, funding: c.funding });
      S.screen = 'game'; S.tab = 'home'; S.prev = null; window.scrollTo(0, 0);
      SFX.play('level'); confetti(70);
    },
    tab: function (v) { S.tab = v; S.sheet = null; window.scrollTo(0, 0); SFX.play('tap'); },
    next: function () {
      var g = S.g;
      if (g.queue.length || g.over) return;
      weekTransition(g.week + 1, function () {
        var r = G.nextWeek(g);
        if (!r) return;
        S.sheet = { type: 'week', report: r, n: r.week };
        SFX.play(r.fin.net >= 0 ? 'coin' : 'bad');
        if (r.fin.net > 0) coinBurst(8);
        buzz(15);
        render();
        queueCelebrations(r);
      });
      return false;
    },
    events: function () { openNextEvent(); },
    cont: function () { openNextEvent(); },
    choose: function (v) { finish(G.choose(S.g, +v)); },
    showres: function () { S.sheet.phase = 'result'; celebrate(S.sheet.res); },
    box: function (v) { S.sheet.res = G.openBox(S.g, +v); SFX.play('whoosh'); },
    spin: function (v) { if (!S.sheet.res) spinWheel(v || 'free'); return false; },
    wheelsafe: function () { finish(G.resolve(S.g, { cash: 0.3 }, '🎁 You took the sure prize!')); },
    wheelskip: function () { finish(G.resolve(S.g, null, 'You walked away from the wheel. 🚶')); },
    taplevel: function (v) { S.sheet.level = +v; SFX.play('pop'); },
    tapskip: function () { finish(G.resolve(S.g, null, 'You skipped it. 🤷')); },
    tapstart: function () { startTap(); return false; },
    answer: function (v) { S.sheet.pick = +v; S.sheet.res = G.quizAnswer(S.g, +v); SFX.play(S.sheet.res.won ? 'good' : 'bad'); if (!S.sheet.res.won) setTimeout(shake, 50); },
    dealok: function () { finish(G.dealAccept(S.g)); },
    dealpush: function (v) { var ok = G.dealPush(S.g, +v === 1); SFX.play(ok ? 'coin' : 'bad'); if (ok) buzz(20); else setTimeout(shake, 50); },
    dealend: function () { finish(G.dealEnd(S.g)); },
    vs: function (v) { S.sheet.res = G.vsPlay(S.g, v); SFX.play('whoosh'); },
    ask: function (v) { G.interviewAsk(S.g, +v); SFX.play('pop'); },
    hirecand: function (v) { finish(G.interviewHire(S.g, v || 'hire')); },
    pass: function () { finish(G.resolve(S.g, null, 'You said no thanks. 👋')); },
    postev: function (v) { S.sheet.res = G.postEvent(S.g, v); celebrate(S.sheet.res); },
    post: function () { S.sheet = { type: 'post' }; },
    dopost: function (v) { S.sheet.res = G.post(S.g, v); G.clampAll(S.g); afterAction(); celebrate({ post: S.sheet.res, chips: [{ good: !S.sheet.res.backfire, txt: '' }] }); },
    power: function (v) {
      var r = G.usePower(S.g, v);
      if (!r) return false;
      S.sheet = { type: 'power', res: r, n: Math.random() };
      SFX.play('power'); buzz([20, 30, 20]); confetti(40);
      CS.Scene.burst(r.power.emoji);
      queueCelebrations(r);
    },
    stat: function (v) { S.sheet = { type: 'stat', k: v }; },
    claim: function (v) {
      var m = G.claimMission(S.g, +v);
      if (m) { toast('🎯 +' + U.short(m.reward) + ' and ' + m.xp + ' XP!'); SFX.play('coin'); coinBurst(14); confetti(30); buzz(25); afterAction(); }
    },
    gift: function () { S.sheet = { type: 'gift' }; },
    claimgift: function () { var amt = G.claimGift(S.g); S.sheet.amount = amt; SFX.play('level'); confetti(90); coinBurst(16); buzz([30, 30, 30]); },
    price: function (v) { S.g.price = +v; G.save(S.g); SFX.play('tap'); },
    warattack: function (v) {
      var rv = S.g.rivalCos[+v];
      if (!rv || !G.warAttackRival(S.g, rv.name)) return false;
      G.save(S.g);
      S.sheet = { type: 'war', k: 'war', stage: 'intro' };
      SFX.play('power'); buzz([30, 30, 30]);
    },
    warchallenge: function () {
      if (!G.warStartChallenge(S.g)) return false;
      S.sheet = { type: 'war', k: 'war', stage: 'intro' };
      SFX.play('pop');
    },
    warpaste: function () {
      var ta = document.getElementById('warcode'), foe = G.readWarCode(S.g, ta && ta.value);
      if (!foe.error) S.warDraft = '';
      if (foe.error) { toast(foe.error); SFX.play('bad'); return false; }
      if (G.friendWarsLeft() < 1) { toast('No friend wars left today. Come back tomorrow, or get 👑 VIP for unlimited!'); S.sheet = { type: 'vip' }; return; }
      if (!G.warStartFriend(S.g, foe)) return false;
      G.save(S.g);
      S.sheet = { type: 'war', k: 'war', stage: 'intro' };
      SFX.play('power'); buzz([30, 30, 30]);
    },
    wargo: function () {
      if (!S.sheet || S.sheet.type !== 'war') return false;
      var bt = S.g.war && S.g.war.battle;
      if (bt && !bt.started) { bt.started = true; G.save(S.g); }
      S.sheet.stage = 'play';
      setTimeout(startWarPlay, 40);
    },
    warnext: function () {
      var b = S.g.war && S.g.war.battle;
      if (!b) return false;
      S.sheet.stage = b.done ? 'end' : 'intro';
      if (b.done && b.result && b.result.won != null) {
        if (b.result.won) { confetti(90); coinBurst(14); SFX.play('level'); } else SFX.play('bad');
        queueCelebrations(b.result, true);
      }
    },
    warrematch: function () {
      var g = S.g, w = G.warInit(g), last = w.last;
      if (last && last.kind === 'friend' && G.friendWarsLeft() < 1) { toast('No friend wars left today. 👑 VIP gets unlimited!'); S.sheet = { type: 'vip' }; return; }
      if (last && last.kind === 'rival' && w.energy < 1) { toast('No war energy left. It refills +1 every week! ⚡'); return false; }
      G.warClose(g);
      if (!G.warRematch(g)) { toast('Can\'t rematch right now.'); return false; }
      G.save(g);
      S.sheet = { type: 'war', k: 'war', stage: 'intro', n: Math.random() };
      SFX.play('power');
    },
    warback: function () { var bt = S.g.war && S.g.war.battle; S.sheet = { type: 'war', k: 'war', stage: bt && bt.done ? 'end' : 'intro' }; },
    // Quit a war: free before the first game, otherwise the games you haven't played count as 0.
    warquit: function () {
      var g = S.g, bt = g.war && g.war.battle;
      if (!bt || bt.done) return A.warclose();
      if (!bt.started || bt.kind === 'challenge') {
        if (warGame) warGame.stop();
        var r = G.warQuit(g);
        S.sheet = null; showOverlay();
        toast(r.kind === 'rival' && !bt.started ? '🏳️ War called off. Your ⚡ energy is back.' : r.kind === 'friend' ? '🏳️ War called off. You got your friend war back.' : '🏳️ You left the challenge.');
        return;
      }
      if (S.sheet && S.sheet.stage === 'play' && warGame) warGame.end(); // this round counts with the score you have
      S.sheet = { type: 'confirm', what: 'wargiveup' };
    },
    warclip: function () {
      var inp = document.getElementById('warcode');
      var put = function (t) { if (!inp) return; inp.value = t; S.warDraft = t; inp.focus(); };
      if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(put, function () { toast('Press and hold the box, then tap Paste. 📋'); if (inp) inp.focus(); });
      else { toast('Press and hold the box, then tap Paste. 📋'); if (inp) inp.focus(); }
      return false;
    },
    warcopy: function () {
      var b = S.g.war && S.g.war.battle, code = b ? G.warCode(S.g, b) : '';
      var ok = function () { toast('📋 Code copied! Send it to a friend.'); SFX.play('coin'); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(ok, function () { toast('Your code: ' + code); });
      else toast('Your code: ' + code);
      return false;
    },
    warclose: function () { if (warGame) warGame.stop(); G.warClose(S.g); G.save(S.g); S.sheet = null; showOverlay(); },
    warshare: function () { shareText(G.warShareText(S.g), 'Share your war'); return false; },
    warsendscores: function () { var b = S.g.war && S.g.war.battle; if (b) shareText(G.warCodeText(S.g, b), 'Send your scores'); return false; },
    tryad: function (v) {
      var r = G.tryAd(S.g, v);
      if (!r) return false;
      S.sheet = { type: 'adtry', res: r, phase: 'roll', k: v };
      SFX.play('tick'); buzz(10);
      setTimeout(function () {
        if (!S.sheet || S.sheet.type !== 'adtry' || S.sheet.res !== r) return;
        S.sheet.phase = 'done';
        if (r.ok) { SFX.play('good'); confetti(60); coinBurst(10); buzz([20, 30, 20]); CS.Scene.burst(r.ad.emoji); }
        else { SFX.play('bad'); buzz(40); }
        queueCelebrations(r, true);
        render();
      }, 1500);
    },
    ad: function (v) { var c = G.advertise(S.g, v); if (c) { toast('📢 Ad is running! -' + U.short(c)); SFX.play('coin'); afterAction(); } },
    upgrade: function (v) { if (G.buyUpgrade(S.g, v)) { toast(CS.UP[v].emoji + ' ' + CS.UP[v].name + ' upgraded!'); SFX.play('level'); confetti(40); afterAction(); } },
    emp: function (v) { S.sheet = { type: 'emp', id: +v }; },
    cand: function (v) { S.sheet = { type: 'cand', id: +v }; },
    hire: function (v) { var c = G.hire(S.g, +v); if (c) { toast('🤝 ' + c.name + ' joined!'); SFX.play('good'); afterAction(); } S.sheet = null; },
    raise: function (v) { var e = G.emp(S.g, +v); G.raise(S.g, e, 0.1); G.clampAll(S.g); afterAction(); toast('💵 ' + G.first(e) + ' is happy!'); SFX.play('coin'); },
    bonus: function (v) { var e = G.emp(S.g, +v); G.bonus(S.g, e); G.clampAll(S.g); afterAction(); toast('🎁 ' + G.first(e) + ' loves the bonus!'); SFX.play('coin'); },
    promote: function (v) { G.promote(S.g, G.emp(S.g, +v)); G.clampAll(S.g); afterAction(); SFX.play('good'); },
    makemgr: function (v) { G.promote(S.g, G.emp(S.g, +v), true); G.clampAll(S.g); afterAction(); SFX.play('good'); },
    demote: function (v) { G.demote(S.g, G.emp(S.g, +v)); G.clampAll(S.g); afterAction(); SFX.play('bad'); },
    rename: function (v) { var el = document.getElementById('rename'); if (el) { G.rename(S.g, +v, el.value); G.save(S.g); toast('✏️ Name saved!'); } },
    askfire: function () { S.sheet.confirmFire = true; },
    fire: function (v) {
      if (+v === 0) { S.sheet.confirmFire = false; return; }
      var e = G.emp(S.g, +v); G.removeEmp(S.g, e, 'fired'); G.clampAll(S.g); afterAction(); S.sheet = null; toast('🚪 ' + e.name + ' was fired.'); SFX.play('bad');
    },
    close: function () { S.sheet = null; showOverlay(); },
    closeov: function () { $over.innerHTML = ''; setTimeout(showOverlay, 250); return false; },
    scrim: function () {
      var t = S.sheet && S.sheet.type;
      if (t === 'confirm' && S.sheet.what === 'wargiveup') return A.warback();
      if (['emp', 'cand', 'confirm', 'stat', 'share', 'vip', 'power', 'offline'].indexOf(t) >= 0 || (t === 'post' && !S.sheet.res) || (t === 'gift' && !S.sheet.amount) || (t === 'adtry' && S.sheet.phase === 'done')) { S.sheet = null; showOverlay(); } else return false;
    },
    loan: function (v) { var o = G.loanOffers(S.g)[+v]; if (!o || !o.ok) return; G.addLoan(S.g, o.amount, o.apr, o.weeks); afterAction(); toast('🏦 Got ' + M(o.amount) + '!'); SFX.play('coin'); coinBurst(10); },
    repay: function (v) { if (G.repayLoan(S.g, +v)) { afterAction(); toast('🕊️ Loan paid off!'); SFX.play('good'); } },
    stake: function (v) { var a = G.sellStake(S.g, +v); if (a) { afterAction(); toast('💼 Investors paid ' + M(a) + '!'); SFX.play('coin'); coinBurst(10); } },
    share: function () { S.sheet = { type: 'share' }; },
    sharegame: function () {
      var g = S.g;
      shareText(G.shareGameText(g), 'Share Company Simulator').then(function (ok) {
        if (!ok) return;
        var amt = G.claimShareGame(g);
        if (amt) { toast('📤 Thanks for sharing! +' + M(amt)); SFX.play('coin'); coinBurst(14); confetti(40); render(); }
      });
      return false;
    },
    quit: function () { if (S.g) G.save(S.g); A.home(); },
    doshare: function () {
      var text = document.getElementById('shareText').value, img = document.getElementById('shareImg');
      var data = { text: text, title: 'Company Simulator' };
      if (nativeShare()) { shareText(text, 'Share your company'); return false; }
      try {
        if (navigator.share) {
          fetch(img.src).then(function (r) { return r.blob(); }).then(function (b) {
            var file = new File([b], 'my-company.png', { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) data.files = [file];
            return navigator.share(data);
          }).catch(function () { A.copyshare(); });
        } else A.copyshare();
      } catch (e) { A.copyshare(); }
      return false;
    },
    copyshare: function () {
      var ta = document.getElementById('shareText');
      var fallback = function () { ta.focus(); ta.select(); toast('Text selected. Copy it! 📋'); };
      try { navigator.clipboard.writeText(ta.value).then(function () { toast('📋 Copied! Paste it to your friends.'); }, fallback); } catch (e) { fallback(); }
      return false;
    },
    setting: function (v) {
      S.settings[v] = !S.settings[v]; G.setSetting(v, S.settings[v]); SFX.play('pop');
      if (v === 'music') { if (S.settings.music) startMusic(); else CS.Music.stop(); }
    },
    togglemusic: function () { A.setting('music'); },
    vip: function () { S.sheet = { type: 'vip' }; },
    shop: function () { S.sheet = { type: 'shop' }; },
    buy: function (v) {
      var wasVip = vip();
      CS.Store.buy(v).then(function (ok) {
        if (ok && v === 'vip' && !wasVip && vip()) { SFX.play('level'); confetti(100); toast('👑 Welcome to VIP!'); if (S.g) G.fillMissions(S.g); }
        giveGrants();
        render();
      });
      render();
      return false;
    },
    restorevip: function () { CS.Store.restore().then(function (ok) { toast(ok ? '👑 VIP restored!' : 'Purchases checked.'); giveGrants(); render(); }); return false; },
    confirm: function (v) { S.sheet = { type: 'confirm', what: v }; },
    doconfirm: function () {
      var g = S.g, w = S.sheet.what;
      S.sheet = null;
      if (w === 'newgame') {
        if (g.mode === 'main') { G.recordLegacy(g, 'Started over'); G.clearSave('main'); } else G.clearSave('daily');
        S.g = null; S.screen = 'create'; S.create.step = 0; S.create.name = '';
      } else if (w === 'wargiveup') {
        if (warGame) warGame.stop();
        G.warQuit(g);
        S.sheet = { type: 'war', k: 'war', stage: 'end' };
        var br = g.war.battle && g.war.battle.result;
        if (br) { SFX.play(br.won ? 'level' : 'bad'); queueCelebrations(br, true); }
      } else { g.over = { reason: g.mode === 'daily' ? 'daily' : 'gaveup', week: g.week }; G.checkAchievements(g); endCompany(); }
    },
    restart: function () { S.g = null; S.screen = 'create'; S.create.step = 0; S.create.name = ''; window.scrollTo(0, 0); }
  };

  function onClick(ev) {
    var el = ev.target.closest('[data-a]');
    if (!el) return;
    if ((el.dataset.a === 'scrim' || (el.classList.contains('overlay') && el.dataset.a === 'closeov')) && ev.target !== el) return;
    var fn = A[el.dataset.a];
    if (!fn) return;
    if (fn(el.dataset.v) === false) return;
    render();
  }
  function onInput(ev) {
    if (ev.target.id === 'warcode') S.warDraft = ev.target.value;
    if (ev.target.id === 'cname') {
      S.create.name = ev.target.value;
      var p = document.getElementById('cprev'); if (p) p.textContent = ev.target.value || 'Your Company';
    }
  }

  // Android back button: close things first, then go back, then leave the app.
  CS.onBack = function () {
    if ($over.innerHTML) { $over.innerHTML = ''; return true; }
    if (S.sheet && S.sheet.type === 'war') { if (A.warquit() !== false) render(); return true; }
    if (S.sheet) { if (A.scrim() !== false) { render(); return true; } return true; }
    if (S.screen === 'game' && S.tab !== 'home') { A.tab('home'); render(); return true; }
    if (S.screen === 'create') { A.cback(); render(); return true; }
    if (S.screen === 'game' || S.screen === 'over') { A.home(); render(); return true; }
    return false;
  };

  CS.boot = function () {
    $app = document.getElementById('app');
    $sheet = document.getElementById('sheet-root');
    $toast = document.getElementById('toast-root');
    $over = document.getElementById('overlay-root');
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') CS.onBack();
      if (ev.key === 'Enter' && ev.target.id === 'cname') { if (A.cnext() !== false) render(); }
    });
    CS.Scene.onGolden(function () {
      var amt = G.tapGolden(S.g);
      if (amt) { toast('🤑 Golden customer! +' + M(amt)); SFX.play('coin'); coinBurst(16); buzz([20, 20, 20]); render(); }
    });
    CS.Store.onChange(function () { render(); });
    CS.Store.onGrant(function () { setTimeout(function () { giveGrants(); render(); }, 50); });
    try { CS.Store.init(); } catch (e) {}
    // In the app, the billing plugin is ready after 'deviceready'.
    document.addEventListener('deviceready', function () { try { CS.Store.init(); } catch (e) {} }, false);
    // Native app: Android back button.
    var Cap = globalThis.Capacitor;
    if (Cap && Cap.Plugins && Cap.Plugins.App) {
      Cap.Plugins.App.addListener('backButton', function () { if (!CS.onBack()) Cap.Plugins.App.exitApp(); });
    }
    render();
    // Loading screen: wait for fonts (max 2.5s), then "tap to play" (this also unlocks sound on phones).
    var loader = document.getElementById('loader');
    var ready = function () {
      if (!loader) { S.started = true; return; }
      loader.classList.add('ready');
      loader.addEventListener('click', function () {
        S.started = true;
        loader.classList.add('gone');
        setTimeout(function () { loader.remove(); }, 500);
        SFX.play('level'); startMusic();
      }, { once: true });
    };
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([Promise.all([fontsReady, new Promise(function (r) { setTimeout(r, 1300); })]), new Promise(function (r) { setTimeout(r, 2500); })]).then(ready);
  };
})();
