// Screens, event cards, mini-games, sounds and effects.
// Every screen is a function that returns HTML; clicks go through data-a="action" attributes.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var U = CS.U, G = CS.G, esc = U.esc, M = U.money;

  var S = CS.S = {
    g: null, screen: 'title', tab: 'home', sheet: null, sheetKey: null, settings: G.settings(),
    create: { step: 0, name: '', logo: '☕', color: CS.COLORS[0], tier: 'small', industry: 'cafe', city: 'berlin', funding: 'savings' }
  };
  var $app, $sheet, $toast, toastTimer, tapState = null;

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
      whoosh: [[200, 0.25, 'sine', 0.05, 0], [500, 0.2, 'sine', 0.03, 0.05]]
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
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
  function toast(msg) {
    $toast.innerHTML = '<div class="toast" role="status">' + esc(msg) + '</div>';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $toast.innerHTML = ''; }, 2600);
  }
  // Sound and effects for a result, based on what changed.
  function celebrate(res) {
    if (!res) return;
    var good = (res.chips || []).filter(function (c) { return c.good; }).length, bad = (res.chips || []).length - good;
    if ((res.levelUps && res.levelUps.length) || (res.unlocked && res.unlocked.length) || (res.post && res.post.viral)) { SFX.play('level'); confetti(80); buzz([30, 40, 30]); }
    else if (good > bad) { SFX.play((res.chips || []).some(function (c) { return c.good && c.txt.indexOf('💰') >= 0; }) ? 'coin' : 'good'); }
    else if (bad > good) { SFX.play('bad'); buzz(60); }
    else SFX.play('pop');
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
  function countUp(v, fmt) { return '<span data-count="' + v + '" data-fmt="' + fmt + '">' + fmtVal(0, fmt) + '</span>'; }
  function fmtVal(v, fmt) { return fmt === 'signed' ? U.signed(v) : fmt === 'money' ? M(v) : U.num(v); }

  // ================= mentor tips =================

  function mentorTip(g) {
    var h = g.history[g.history.length - 1];
    var fronts = ind(g).front.toLowerCase() + 's';
    if (g.week === 0) return 'Hi boss! I\'m <b>Ollie</b> 🦉 I\'ll help you. Press the big green <b>NEXT WEEK</b> button to open your shop!';
    if (g.cash < 0) return 'Uh oh, you\'re out of money! 😱 Get a <b>loan</b> in the Money tab, or you will go bankrupt in ' + Math.max(0, 8 - g.negWeeks) + ' weeks.';
    if (G.readyMissions(g)) return 'A mission is done! Tap <b>CLAIM</b> to get your reward! 🎁';
    if (h && h.demand > h.capacity * 1.1) return 'So many customers! 🚶🚶 Your team can\'t serve them all. Hire more <b>' + fronts + '</b> in the Team tab!';
    if (g.employees.length > 5 && !g.employees.some(function (e) { return e.role === 'mgr'; })) return 'Your team is getting big! Hire a <b>Manager</b> 👔. Each one keeps 8 people happy.';
    if (G.avgMorale(g) < 40) return 'Your team is sad 😟. Give raises, or buy a <b>Fun Break Room</b> in the Shop.';
    if (!g.posted && g.week >= 1) return 'Post on social media once a week to get <b>followers</b>! 📱 Tap the pink Post button.';
    if (g.week <= 3) return 'Every week, new things happen! Make choices and watch your ⭐ 😊 💪 📱 go up.';
    if (g.week <= 6) return 'Tip: tap any colored stat bubble to see what it means. 👆';
    if (g.cash > G.upCost(g, 'equip') * 2 && !g.stats.upgrades) return 'You have money to spare! Buy an upgrade in the <b>Shop</b> 🛠️';
    if (g.satisfaction < 45) return 'Customers are not happy 😕. Try Budget prices, or hire more skilled workers.';
    return null;
  }

  var STAT_INFO = {
    rep: { e: '⭐', t: 'Reputation', d: 'How much people trust your company. High reputation brings more customers. It goes up slowly when customers are happy.' },
    happy: { e: '😊', t: 'Customer happiness', d: 'How happy your customers are right now. Serve everyone quickly, keep prices fair, and hire skilled workers to raise it.' },
    mood: { e: '💪', t: 'Team mood', d: 'How happy your workers are. Sad workers are slower and may quit. Fair pay, managers, friends and the break room help.' },
    fans: { e: '📱', t: 'Followers', d: 'People who follow you online. Post every week, run ads and go viral to get more. More fans means more customers.' }
  };

  // ================= title =================

  function titleScreen() {
    var saved = G.load('main'), L = G.loadLegacy(), daily = G.dailyInfo(), dsave = G.load('daily'), best = G.dailyBest()[daily.dailyNum];
    var fl = '';
    ['🏢', '💰', '☕', '🚀', '⭐', '📈', '🍩', '💎', '🎁', '📱'].forEach(function (e, i) {
      fl += '<span style="left:' + (i * 10 + 2) + '%;animation-duration:' + (9 + (i * 7) % 8) + 's;animation-delay:-' + (i * 1.3) + 's">' + e + '</span>';
    });
    var h = '<div class="floaters" aria-hidden="true">' + fl + '</div><div class="wrap title-screen">' +
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
    h += '<div class="card" style="display:flex;justify-content:space-between;gap:10px;align-items:center"><span>📖 Event Book</span><b class="num">' + G.bookCount() + ' / ' + CS.EVENTS.length + ' found</b></div>';
    if (L.companies.length) {
      h += '<div class="card"><b style="font-family:var(--display);font-size:17px">🏆 Your old companies</b>';
      L.companies.slice(0, 3).forEach(function (c) { h += '<div class="news-item"><span>' + esc(c.logo) + '</span><span style="flex:1"><b>' + esc(c.name) + '</b> · ' + c.weeks + ' weeks</span><span class="num">' + U.short(c.peakCash) + '</span></div>'; });
      h += '<small class="muted">Each old company gives your next one +5% starting cash.</small></div>';
    }
    return h + '</div>';
  }

  // ================= create =================

  function createScreen() {
    var c = S.create, step = c.step, h = '<div class="wrap create">';
    h += '<div class="steps">' + [0, 1, 2, 3].map(function (i) { return '<i class="' + (i <= step ? 'on' : '') + '"></i>'; }).join('') + '</div>';
    if (step === 0) {
      h += '<h2>Name your company!</h2><p class="sub">Pick a cool name and a logo. ✨</p>';
      h += '<div class="card"><div class="preview" style="margin-bottom:14px">' + logo(c) + '<strong id="cprev">' + esc(c.name || 'Your Company') + '</strong></div>' +
        '<div class="field"><label class="label" for="cname">Company name</label><div class="name-row"><input id="cname" maxlength="24" autocomplete="off" placeholder="Type a name..." value="' + esc(c.name) + '"><button class="btn yellow" data-a="randname" aria-label="Random name">🎲</button></div></div>' +
        '<div class="field"><span class="label">Logo</span><div class="logo-grid">' + CS.LOGOS.map(function (l) { return '<button data-a="logo" data-v="' + l + '" class="' + (c.logo === l ? 'on' : '') + '">' + l + '</button>'; }).join('') + '</div></div>' +
        '<div class="field" style="margin:0"><span class="label">Color</span><div class="color-row">' + CS.COLORS.map(function (col) { return '<button data-a="color" data-v="' + col + '" class="' + (c.color === col ? 'on' : '') + '" style="background:' + col + '" aria-label="Color"></button>'; }).join('') + '</div></div></div>';
    } else if (step === 1) {
      h += '<h2>What will you run?</h2><p class="sub">Each business has different workers and problems.</p>';
      h += '<div class="tabs">' + Object.keys(CS.TIERS).map(function (t) { var tr = CS.TIERS[t]; return '<button data-a="tier" data-v="' + t + '" class="' + (c.tier === t ? 'on' : '') + '">' + tr.label + '<small>' + '⭐'.repeat(tr.stars) + '</small></button>'; }).join('') + '</div>';
      h += '<p class="tier-note">' + CS.TIERS[c.tier].blurb + ' You start with <b>' + M(CS.TIERS[c.tier].cash) + '</b>.</p><div class="pick-grid">';
      CS.INDUSTRIES.filter(function (i) { return i.tier === c.tier; }).forEach(function (i) {
        h += '<button class="pick ' + (c.industry === i.id ? 'on' : '') + '" data-a="industry" data-v="' + i.id + '"><span class="e">' + i.emoji + '</span><b>' + i.name + '</b><small>' + i.front + 's</small></button>';
      });
      h += '</div>';
    } else if (step === 2) {
      h += '<h2>Pick a city!</h2><p class="sub">Big cities have more customers, but cost more.</p><div class="pick-list">';
      Object.keys(CS.CITIES).forEach(function (k) {
        var ci = CS.CITIES[k];
        h += '<button class="pick-row ' + (c.city === k ? 'on' : '') + '" data-a="city" data-v="' + k + '"><span class="e">' + ci.flag + '</span><span class="grow"><b>' + ci.name + '</b><small>' + ci.note + '</small></span><span class="side">👥 ' + '●'.repeat(Math.round(ci.demand * 3)) + '<br>💸 ' + '●'.repeat(Math.max(1, Math.round(ci.rent * 2.2))) + '</span></button>';
      });
      h += '</div>';
    } else {
      var i = CS.IND[c.industry], tr = CS.TIERS[i.tier];
      h += '<h2>Where\'s the money from?</h2><p class="sub">More money now = less of the company for you.</p><div class="pick-list">';
      Object.keys(CS.FUNDING).forEach(function (k) {
        var f = CS.FUNDING[k];
        h += '<button class="pick-row ' + (c.funding === k ? 'on' : '') + '" data-a="funding" data-v="' + k + '"><span class="e">' + f.emoji + '</span><span class="grow"><b>' + f.name + '</b><small>' + f.note + '</small></span><span class="side"><b class="num">' + U.short(tr.cash * (f.cash + f.loan)) + '</b><br>you own ' + Math.round(100 * f.own * (tr.startOwnership || 1)) + '%</span></button>';
      });
      h += '</div><div class="card section"><div class="preview">' + logo(c) + '<div><strong>' + esc(c.name || 'Your Company') + '</strong><br><span class="muted">' + i.emoji + ' ' + i.name + ' in ' + CS.CITIES[c.city].flag + ' ' + CS.CITIES[c.city].name + '</span></div></div>' +
        (tr.startDebt ? '<p class="hint bad" style="margin-bottom:0">Hard mode: you start with ' + M(tr.cash * tr.startDebt) + ' of debt and other owners.</p>' : '') + '</div>';
    }
    h += '</div><div class="create-bar"><div class="wrap"><button class="btn" data-a="cback">' + (step === 0 ? '✖ Cancel' : '◀ Back') + '</button>' +
      (step < 3 ? '<button class="btn green" data-a="cnext">Next ▶</button>' : '<button class="btn green" data-a="start">🚀 Open for business!</button>') + '</div></div>';
    return h;
  }

  // ================= game shell =================

  function hud(g) {
    var need = G.xpNeed(g.level), pct = g.xp / need, r = 18, C = 2 * Math.PI * r;
    var rank = CS.RANKS[g.rank];
    return '<header class="hud"><div class="wrap">' + logo(g.company) +
      '<div class="who"><b>' + esc(g.company.name) + '</b><small>' + weekLabel(g) + '</small><br><span class="rank">' + rank.emoji + ' ' + rank.name + '</span></div>' +
      '<span class="coin ' + (g.cash < 0 ? 'neg' : '') + '"><i>$</i>' + U.short(g.cash) + '</span>' +
      '<button class="lvl" data-a="tab" data-v="more" aria-label="CEO level ' + g.level + '"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="' + r + '" fill="#3D3470" stroke="#554A8F" stroke-width="5"/><circle cx="22" cy="22" r="' + r + '" fill="none" stroke="#FFC93C" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + (C * pct).toFixed(1) + ' ' + C.toFixed(1) + '"/></svg><span class="n">' + g.level + '</span><small>LVL</small></button>' +
      '</div></header>';
  }

  function gameScreen() {
    var g = S.g;
    var h = '<div class="game">' + hud(g) + '<main class="wrap">' + ({ home: homeTab, team: teamTab, shop: shopTab, money: moneyTab, more: moreTab })[S.tab](g) + '</main>';
    var pend = g.queue.length;
    h += '<div class="dock"><div class="wrap"><button class="next ' + (pend ? 'pending' : '') + '" data-a="' + (pend ? 'events' : 'next') + '">' +
      (pend ? '⚡ ' + pend + ' THING' + (pend > 1 ? 'S' : '') + ' TO DECIDE' : '▶ NEXT WEEK') + '<span class="wk">Week ' + (g.week + 1) + '</span></button></div></div>';
    var ready = G.readyMissions(g), gift = g.mode === 'main' && G.giftStatus().available;
    h += '<nav class="nav"><div class="wrap">' + [['home', '🏠', 'Home', ready + (gift ? 1 : 0)], ['team', '👥', 'Team', 0], ['shop', '🛠️', 'Shop', 0], ['money', '💰', 'Money', g.cash < 0 ? 1 : 0], ['more', '🏆', 'Goals', 0]].map(function (t) {
      return '<button data-a="tab" data-v="' + t[0] + '" class="' + (S.tab === t[0] ? 'on' : '') + '"><span class="e">' + t[1] + '</span>' + t[2] + (t[3] ? '<span class="badge">' + t[3] + '</span>' : '') + '</button>';
    }).join('') + '</div></nav></div>';
    return h;
  }

  // ---------- home ----------

  function homeTab(g) {
    var h = '', tip = mentorTip(g), last = g.history[g.history.length - 1];
    if (tip) h += '<div class="section mentor"><span class="owl">🦉</span><div class="bubble">' + tip + '</div></div>';
    if (g.mode === 'main' && G.giftStatus().available) h += '<button class="card gift-banner section" data-a="gift"><span class="e">🎁</span><span><b style="font-family:var(--display);font-size:18px">Daily gift is ready!</b><br><small>Day ' + G.giftStatus().day + ' of 7 · come back every day for bigger gifts</small></span></button>';

    h += '<div class="section stats4">' +
      statBubble('rep', '⭐', Math.round(g.reputation), 'Rep', g.reputation) +
      statBubble('happy', '😊', Math.round(g.satisfaction), 'Happy', g.satisfaction) +
      statBubble('mood', '💪', Math.round(G.avgMorale(g)), 'Team', G.avgMorale(g)) +
      statBubble('fans', '📱', U.num(g.followers), 'Fans', Math.min(100, g.awareness / G.awCap(g) * 100)) + '</div>';

    if (last) {
      var capPct = last.demand > 0 ? Math.min(100, last.served / last.demand * 100) : 100;
      h += '<div class="section card week-card"><div class="top"><div><span class="label">Last week</span><div class="big-money ' + (last.net >= 0 ? 'good' : 'bad') + '">' + U.signed(last.net) + '</div></div>' +
        (g.streak >= 2 ? '<span class="chip gold">🔥 ' + g.streak + ' week streak</span>' : '<span class="chip">' + CS.ECON[g.economy.state].emoji + ' ' + CS.ECON[g.economy.state].name + '</span>') + '</div>' +
        '<div class="served">' + ind(g).emoji + ' Served <b>' + U.num(last.served) + '</b> of <b>' + U.num(last.demand) + '</b> ' + ind(g).unit + bar(capPct) + '</div>' +
        (last.capacity < last.demand * 0.97 ? '<div class="hint bad">🚶 ' + U.num(last.demand - last.served) + ' customers left without buying! Hire more ' + ind(g).front.toLowerCase() + 's.</div>' : '') + '</div>';
    }

    h += '<div class="section"><div class="section-head"><h3>🎯 Missions</h3><span class="label">Rewards!</span></div><div class="card">';
    g.missions.forEach(function (m, i) {
      var p = G.missionProgress(g, m), done = p[0] >= p[1];
      h += '<div class="mission"><span class="e">' + m.emoji + '</span><div class="grow"><b>' + esc(G.missionText(m)) + '</b><small>💰 ' + U.short(m.reward) + ' · ⭐ ' + m.xp + ' XP</small>' + bar(p[0] / p[1] * 100) + '</div>' +
        (done ? '<button class="btn small yellow" data-a="claim" data-v="' + i + '">CLAIM</button>' : '<small class="num">' + (m.id === 'cash' ? U.short(p[0]) : U.num(p[0])) + '/' + (m.id === 'cash' ? U.short(p[1]) : U.num(p[1])) + '</small>') + '</div>';
    });
    h += '</div></div>';

    h += '<div class="section"><div class="section-head"><h3>⚡ Actions</h3></div><div class="actions">' +
      '<button class="action ' + (g.posted ? 'done' : 'pink') + '" data-a="' + (g.posted ? 'noop' : 'post') + '"><span class="e">📱</span>' + (g.posted ? 'Posted ✓' : 'Post') + '<small>' + (g.posted ? 'next week' : '1 free per week') + '</small></button>' +
      '<button class="action orange" data-a="tab" data-v="shop"><span class="e">📢</span>Ads<small>get fans</small></button>' +
      '<button class="action purple" data-a="tab" data-v="shop"><span class="e">🛠️</span>Upgrades<small>' + upgradesReady(g) + ' ready</small></button></div></div>';

    h += '<div class="section"><div class="section-head"><h3>🏷️ Prices</h3></div><div class="seg">' + [['💚', 'Cheap', '+25% customers'], ['👍', 'Normal', 'balanced'], ['💎', 'Fancy', '+30% per sale']].map(function (p, i) {
      return '<button data-a="price" data-v="' + i + '" class="' + (g.price === i ? 'on' : '') + '">' + p[0] + ' ' + p[1] + '<small>' + p[2] + '</small></button>';
    }).join('') + '</div></div>';

    if (g.mods.length) {
      h += '<div class="section card"><span class="label">Happening now</span><div class="mods" style="margin-top:6px">' + g.mods.map(function (m) {
        return '<div class="mod"><span>' + (G.modGood(m) ? '📈' : '📉') + ' ' + esc(m.label) + '</span><span class="faint">' + m.weeks + ' wk' + (m.weeks > 1 ? 's' : '') + '</span></div>';
      }).join('') + '</div></div>';
    }
    h += '<div class="section"><div class="section-head"><h3>📰 News</h3></div><div class="card">' + newsList(g.news.slice(0, 4)) + '</div></div>';
    return h;
  }
  function statBubble(k, e, val, label, pct) {
    return '<button class="stat ' + k + '" data-a="stat" data-v="' + k + '"><div class="e">' + e + '</div><b>' + val + '</b><small>' + label + '</small><div class="mini"><i style="width:' + U.clamp(pct, 0, 100).toFixed(0) + '%"></i></div></button>';
  }
  function upgradesReady(g) {
    return CS.UPGRADES.filter(function (u) { var c = G.upCost(g, u.id); return c && g.cash >= c && g.level >= G.upNeedLevel(g, u.id); }).length;
  }
  function newsList(items) {
    if (!items.length) return '<p class="faint" style="margin:0">No news yet.</p>';
    return items.map(function (n) { return '<div class="news-item ' + n.tone + '"><span class="wk">W' + n.week + '</span><span>' + esc(n.text) + '</span></div>'; }).join('');
  }

  // ---------- team ----------

  function personRow(g, e, cand) {
    return '<button class="person" data-a="' + (cand ? 'cand' : 'emp') + '" data-v="' + e.id + '">' + face(e, !cand) +
      '<span class="grow"><b>' + esc(e.name) + '</b><small>' + (CS.ROLES[e.role].emoji || ind(g).emoji) + ' ' + G.title(g, e) + ' · ' + U.short(e.salary) + '/wk</small></span>' +
      '<span class="side"><span>Skill ' + Math.round(e.skill) + '</span><span class="skillbar"><i style="width:' + Math.round(e.skill) + '%"></i></span>' + (cand ? traitChip(e, 0) : '') + '</span></button>';
  }
  function teamTab(g) {
    var f = G.compute(g, true);
    var payroll = g.employees.reduce(function (s, e) { return s + e.salary; }, 0);
    var h = '<div class="section card"><div class="summary3"><div><b>' + g.employees.length + '</b><small>👥 Workers</small></div><div><b>' + U.short(payroll) + '</b><small>💸 Pay/week</small></div><div><b>' + G.moodFace(G.avgMorale(g)) + ' ' + Math.round(G.avgMorale(g)) + '</b><small>Team mood</small></div></div>' +
      '<div class="served">Your team can serve <b>' + U.num(f.capacity) + '</b> ' + ind(g).unit + '. About <b>' + U.num(f.demand) + '</b> customers want to buy.' + bar(f.demand ? Math.min(100, f.capacity / f.demand * 100) : 100) + '</div>' +
      (f.capacity < f.demand * 0.97 ? '<div class="hint bad">Not enough ' + ind(g).front.toLowerCase() + 's! Hire more below. 👇</div>' : '<div class="hint">✅ Your team can handle everyone right now.</div>') +
      (!f.covered ? '<div class="hint bad">👔 You need more managers! One manager for every 8 workers.</div>' : '') + '</div>';
    var order = { mgr: 0, acct: 1, sales: 2, front: 3 };
    var list = g.employees.slice().sort(function (a, b) { return order[a.role] - order[b.role] || b.level - a.level || b.skill - a.skill; });
    h += '<div class="section"><div class="section-head"><h3>👥 Your team</h3><span class="label">Tap a person</span></div>' +
      (list.length ? list.map(function (e) { return personRow(g, e); }).join('') : '<div class="card">Nobody works here! Hire someone below. 👇</div>') + '</div>';
    h += '<div class="section"><div class="section-head"><h3>🧑‍💼 Hire people</h3><span class="label">New every week</span></div>' +
      '<div class="card" style="margin-bottom:12px;font-size:14px">' + ind(g).emoji + ' <b>' + ind(g).front + 's</b> serve customers · 🗣️ <b>Salespeople</b> bring more customers · 🧮 <b>Accountants</b> cut costs · 👔 <b>Managers</b> keep 8 people happy</div>' +
      g.candidates.map(function (c) { return personRow(g, c, true); }).join('') + '</div>';
    return h;
  }

  // ---------- shop ----------

  function shopTab(g) {
    var h = '<div class="section"><div class="section-head"><h3>🛠️ Upgrades</h3><span class="label">Forever boosts</span></div><div class="up-grid">';
    CS.UPGRADES.forEach(function (u) {
      var lv = G.upLevel(g, u.id), cost = G.upCost(g, u.id), need = G.upNeedLevel(g, u.id);
      var pips = u.cost.map(function (x, i) { return '<i class="' + (i < lv ? 'on' : '') + '"></i>'; }).join('');
      var btn = !cost ? '<button class="btn small block" disabled>✅ MAX</button>'
        : g.level < need ? '<button class="btn small block" disabled>🔒 CEO Lv ' + need + '</button>'
          : '<button class="btn small block ' + (g.cash >= cost ? 'green' : '') + '" data-a="upgrade" data-v="' + u.id + '" ' + (g.cash >= cost ? '' : 'disabled') + '>' + U.short(cost) + '</button>';
      h += '<div class="up"><span class="e">' + u.emoji + '</span><b>' + u.name + '</b><div class="pips">' + pips + '</div><small>' + u.desc + '</small>' + btn + '</div>';
    });
    h += '</div></div>';
    h += '<div class="section"><div class="section-head"><h3>📢 Ads</h3><span class="label">Get more fans</span></div><div class="card">';
    CS.ADS.forEach(function (a) {
      var cost = G.adCost(g, a), locked = g.level < a.lvl;
      h += '<div class="ad-row"><span class="e">' + a.emoji + '</span><span class="grow"><b>' + a.name + '</b><br><small class="muted">+' + a.fans + ' fame</small></span>' +
        (locked ? '<button class="btn small" disabled>🔒 Lv ' + a.lvl + '</button>' : '<button class="btn small orange" data-a="ad" data-v="' + a.id + '">' + U.short(cost) + '</button>') + '</div>';
    });
    h += '</div></div>';
    return h;
  }

  // ---------- money ----------

  function moneyTab(g) {
    var debt = G.debt(g), val = G.valuation(g);
    var h = '<div class="section card"><div class="summary3"><div><b>' + U.short(val) + '</b><small>🏢 Worth</small></div><div><b>' + Math.round(g.ownership) + '%</b><small>🥧 You own</small></div><div><b class="' + (debt ? 'bad' : '') + '">' + U.short(debt) + '</b><small>🏦 Debt</small></div></div>' +
      '<button class="btn pink block" style="margin-top:12px" data-a="share">📤 Share my company</button></div>';
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
      '<small class="muted">Get XP by making choices, playing mini-games and finishing missions. New levels unlock ads and upgrades!</small></div>';
    var rk = CS.RANKS[g.rank], nx = CS.RANKS[g.rank + 1];
    h += '<div class="card"><b style="font-family:var(--display);font-size:18px">' + rk.emoji + ' ' + rk.name + '</b>' + (nx ? '<br><small class="muted">Next rank: ' + nx.emoji + ' ' + nx.name + ' when your company is worth ' + U.short(nx.min) + '</small>' + bar(G.valuation(g) / nx.min * 100) : '<br><small>Top rank! 🪐</small>') + '</div>';

    var got = Object.keys(g.achievements).length;
    h += '<div class="section"><div class="section-head"><h3>🏆 Achievements</h3><span class="label">' + got + '/' + CS.ACHIEVEMENTS.length + '</span></div><div class="ach-grid">';
    CS.ACHIEVEMENTS.forEach(function (a) { h += '<div class="ach ' + (g.achievements[a.id] ? '' : 'locked') + '"><span class="e">' + a.emoji + '</span><span><b>' + a.name + '</b><small>' + a.desc + '</small></span></div>'; });
    h += '</div></div>';

    var book = G.book(), count = G.bookCount();
    h += '<div class="section"><div class="section-head"><h3>📖 Event Book</h3><span class="label">' + count + '/' + CS.EVENTS.length + '</span></div><div class="card">' +
      '<p style="margin:0 0 8px;font-size:14px">Find every event! Some are ✨ <b>Legendary</b> and super rare. Your book is kept even when you start a new company.</p>' + bar(count / CS.EVENTS.length * 100, 'progress-big') + '<div class="book" style="margin-top:12px">';
    CS.EVENTS.forEach(function (d) {
      var r = d.rarity || 'common';
      h += book[d.id] ? '<div class="bk ' + r + '" title="' + esc(G.bookName(d)) + '">' + d.icon + '</div>' : '<div class="bk unk ' + r + '" title="Not found yet">?</div>';
    });
    h += '</div></div></div>';

    h += '<div class="section"><div class="section-head"><h3>⚙️ Settings</h3></div><div class="card">' +
      '<div class="toggle"><span>🔊 Sounds</span><button class="switch ' + (S.settings.sound ? 'on' : '') + '" data-a="setting" data-v="sound" aria-label="Sounds"><i></i></button></div>' +
      '<div class="toggle"><span>📳 Vibration</span><button class="switch ' + (S.settings.vibe ? 'on' : '') + '" data-a="setting" data-v="vibe" aria-label="Vibration"><i></i></button></div>' +
      '<div class="row2" style="margin-top:8px"><button class="btn small" data-a="confirm" data-v="newgame">🔄 Start over</button><button class="btn small red" data-a="confirm" data-v="bankrupt">📉 Give up</button></div>' +
      '<button class="btn small block" style="margin-top:10px" data-a="home">🏠 Main menu</button></div></div>';
    return h;
  }

  // ================= sheets =================

  function evHead(def, x) {
    var cat = catOf(def);
    return '<div class="ev-head" style="--c:' + cat.color + '"><div class="meta"><span>' + cat.emoji + ' ' + cat.label + (x.chain ? ' · follow-up' : '') + '</span>' + rarityTag(def) + '<span>Week ' + S.g.week + '</span></div><div class="ev-icon">' + def.icon + '</div></div>';
  }
  function tagsFor(g, x, fx) {
    var cost = G.fxCost(g, fx), risk = G.fxRisk(g, fx, x.ctx), t = '';
    if (cost) t += '<span class="tag cost">-' + U.short(cost) + '</span>';
    if (risk != null) t += '<span class="tag risk">🎲 ' + risk + '%</span>';
    return t ? '<span class="tags">' + t + '</span>' : '';
  }
  function choiceButtons(g, x, def, cls) {
    return def.choices.map(function (c, i) {
      var delay = cls === 'reply' ? ' style="animation:pop .35s ease-out ' + (0.5 * def.msgs.length + 0.1 * i).toFixed(2) + 's backwards"' : '';
      return '<button class="' + (cls || 'option') + '" data-a="choose" data-v="' + i + '"' + delay + '><span>' + F(c.t, x) + (c.d ? '<small>' + esc(c.d) + '</small>' : '') + '</span>' + tagsFor(g, x, c.fx) + '</button>';
    }).join('');
  }

  var INTERVIEW_Q = ['💼 Why do you want this job?', '🤔 What is your biggest weakness?', '😂 Tell me something fun!'];
  var INTERVIEW_A = {
    hardworking: ['I love working hard! I never stop until it\'s done. 💪', 'I work TOO much. My friends say I need a break.', 'I once worked 3 jobs at the same time!'],
    lazy: ['Honestly? I heard the break room is nice. 😴', 'Mornings. And afternoons. Kind of all day.', 'I can nap standing up!'],
    ambitious: ['I want to be the boss one day! 🚀', 'I get impatient when I\'m not moving up.', 'I have a 10-year plan. Want to see it?'],
    creative: ['I have SO many ideas for this place! 🎨', 'I get distracted by new ideas.', 'I paint murals on weekends!'],
    loyal: ['I stay at jobs for a long time. I\'m loyal! 🐶', 'I get attached to places.', 'I\'ve had the same best friend since I was 4.'],
    greedy: ['Money. Lots of money. 🤑', 'I always ask for raises.', 'I collect rare coins!'],
    friendly: ['I love meeting new people! 🤗', 'I talk a bit too much.', 'I know everyone in my building by name!'],
    aggressive: ['I\'m the best. The others here better watch out. 😤', 'People say I get angry fast. They\'re wrong! 😠', 'I won an arm-wrestling contest.'],
    reliable: ['You can always count on me. ⏰', 'I\'m a bit boring. I just always show up.', 'I\'ve never been late. Not once.'],
    unreliable: ['Sorry I\'m late for this interview, by the way. 💤', 'Alarms. They don\'t work for me.', 'I forgot what I was going to say.'],
    funny: ['I make everyone laugh! 😂', 'I make jokes at bad times.', 'Why did the coffee call the police? It got mugged! ☕'],
    serious: ['I want to do excellent work. 🧐', 'I don\'t really do small talk.', 'Fun? I read tax books. For fun.']
  };

  function eventSheet() {
    var g = S.g, sh = S.sheet, x = sh.x, def = CS.EV[x.id], c = x.ctx;
    if (sh.phase === 'result') return resultView(sh);
    var h = evHead(def, x) + '<div class="ev-body">';
    var title = '<h2>' + F(def.title, x) + '</h2>';
    switch (def.kind) {
      case 'chat': {
        var who = def.from === 'a' || def.from === 'm' ? G.emp(g, c[def.from]) : null;
        var fr = who ? { name: who.name, face: who.face, hue: who.hue } : def.from;
        h += title + '<div class="phone"><div class="who">' + face(fr) + '<span>' + esc(fr.name) + '<small>● online</small></span></div>' +
          def.msgs.map(function (m, i) { return '<div class="msg" style="animation-delay:' + (i * 0.5) + 's">' + F(m, x) + '</div>'; }).join('') + '</div>' +
          '<div class="options">' + choiceButtons(g, x, def, 'reply') + '</div>';
        break;
      }
      case 'review':
        h += title + '<div class="review"><div class="by"><span style="font-size:26px">🧑</span>' + esc(c.who2 || 'A customer') + '</div><div class="stars">' + '★'.repeat(def.stars) + '<span class="off">' + '★'.repeat(5 - def.stars) + '</span></div><q>' + F(def.text, x) + '</q></div>' +
          '<div class="options">' + choiceButtons(g, x, def) + '</div>';
        break;
      case 'news':
        h += '<div class="breaking">BREAKING NEWS</div><div class="newspaper"><h2>' + F(def.title, x) + '</h2><p style="margin:6px 0 0">' + F(def.text, x) + '</p></div><div class="options">' + choiceButtons(g, x, def) + '</div>';
        break;
      case 'boxes':
        h += title + '<p class="ev-text">' + F(def.text, x) + '</p>';
        if (!sh.res) h += '<div class="boxes">' + [0, 1, 2].map(function (i) { return '<button class="box" data-a="box" data-v="' + i + '" aria-label="Box ' + (i + 1) + '">🎁</button>'; }).join('') + '</div>';
        else {
          h += '<div class="boxes">' + sh.res.boxes.map(function (p, i) { return '<div class="box open ' + (i === sh.res.pick ? 'mine' : '') + '" style="animation-delay:' + (i === sh.res.pick ? 0 : 0.5) + 's">' + p.emoji + '<small>' + esc(p.label) + '</small></div>'; }).join('') + '</div>' +
            '<p>You picked box ' + (sh.res.pick + 1) + '!</p><button class="btn green block" data-a="showres">Continue ▶</button>';
        }
        break;
      case 'wheel':
        h += title + '<p class="ev-text">' + F(def.text, x) + '</p>' + wheelSvg(def) +
          '<button class="btn yellow big block" data-a="spin" ' + (sh.res ? 'disabled' : '') + '>' + (sh.res ? '🎡 Spinning...' : '🎡 SPIN!') + '</button>';
        break;
      case 'tap':
        h += title + '<p class="ev-text">' + F(def.text, x) + '</p>' +
          '<div class="arena" id="arena"><div class="hudline"><span id="tapCount">0 / ' + def.goal + '</span><span id="tapTime">' + def.secs + 's</span></div>' +
          '<div class="start"><button class="btn green big" data-a="tapstart">▶ START!</button></div></div><div class="timebar"><i id="tapBar"></i></div>' +
          '<p class="faint" style="font-size:13px">Tap the ' + def.target + ' ' + def.goal + ' times in ' + def.secs + ' seconds!</p>';
        break;
      case 'quiz':
        h += title + '<div class="quiz-q">' + esc(c.q.q) + '</div><div class="answers">' + c.q.options.map(function (o, i) {
          var cls = sh.res ? (i === c.q.answer ? 'right' : i === sh.pick ? 'wrong' : '') : '';
          return '<button class="btn ' + cls + '" data-a="answer" data-v="' + i + '" ' + (sh.res ? 'disabled style="opacity:1;filter:none"' : '') + '>' + esc(o) + '</button>';
        }).join('') + '</div>' + (sh.res ? '<button class="btn green block" style="margin-top:14px" data-a="showres">Continue ▶</button>' : '');
        break;
      case 'deal':
        h += title + '<p class="ev-text">' + F(def.text, x) + '</p>';
        if (c.walked) h += '<div class="banner red">😤 They walked away! Too greedy...</div><button class="btn block" data-a="dealend">Oh well ▶</button>';
        else h += '<span class="label">Their offer</span><div class="offer">' + M(c.offer) + '</div><div class="dots">' + [0, 1, 2, 3].map(function (i) { return '<i class="' + (i <= c.round ? 'on' : '') + '"></i>'; }).join('') + '</div>' +
          '<div class="options"><button class="btn green big block" data-a="dealok">🤝 Accept ' + U.short(c.offer) + '</button>' +
          (c.round < 3 ? '<button class="btn yellow block" data-a="dealpush">💪 Ask for more <span class="tag">🎲 risky</span></button>' : '') +
          '<button class="btn block" data-a="dealend">🙅 No deal</button></div>';
        break;
      case 'vs': {
        var me = sh.res && sh.res.me, them = sh.res && sh.res.them;
        h += title + '<p class="ev-text">' + F(def.text, x) + '</p><div class="versus"><div class="side">' + logo(g.company) + esc(g.company.name) + (me ? '<span class="move">' + me.emoji + '</span>' : '') + '</div><span class="vs">VS</span>' +
          '<div class="side"><span class="logo" style="background:#FF4D5E">😈</span>' + esc(c.rival) + (them ? '<span class="move" style="animation-delay:.4s">' + them.emoji + '</span>' : '') + '</div></div>';
        if (!sh.res) h += '<div class="rules">💸 beats ⭐ · ⭐ beats 📣 · 📣 beats 💸</div><div class="moves">' + G.VS_MOVES.map(function (m) { return '<button class="btn" data-a="vs" data-v="' + m.id + '"><span>' + m.emoji + '</span>' + m.label + '</button>'; }).join('') + '</div>';
        else h += '<div class="banner ' + (sh.res.outcome === 'win' ? 'green' : sh.res.outcome === 'lose' ? 'red' : 'gold') + '" style="animation-delay:.7s">' + (sh.res.outcome === 'win' ? '🏆 YOU WIN!' : sh.res.outcome === 'lose' ? '😖 You lost!' : '🤝 Tie!') + '</div><button class="btn green block" data-a="showres">Continue ▶</button>';
        break;
      }
      case 'interview': {
        var cd = c.cand;
        h += title + '<p class="ev-text">' + F(def.text, x) + '</p><div class="cand">' + face(cd) + '<div style="flex:1"><b style="font-family:var(--display);font-size:18px">' + esc(cd.name) + '</b><br><small>' + (CS.ROLES[cd.role].emoji || ind(g).emoji) + ' ' + G.title(g, cd) + ' · Skill ' + Math.round(cd.skill) + ' · ' + U.short(cd.salary) + '/wk</small><div class="chips" style="margin-top:4px">' + traitChip(cd, 0) + (c.asked != null ? traitChip(cd, 1) : '<span class="trait unk">❓ Hidden</span>') + '</div></div></div>';
        if (c.asked == null) h += '<div class="options">' + INTERVIEW_Q.map(function (q, i) { return '<button class="option" data-a="ask" data-v="' + i + '">' + q + '</button>'; }).join('') + '</div>';
        else h += '<div class="phone"><div class="msg me">' + INTERVIEW_Q[c.asked] + '</div><div class="msg" style="animation-delay:.4s">' + esc((INTERVIEW_A[cd.traits[1]] || ['...'])[c.asked]) + '</div></div>' +
          '<div class="row2"><button class="btn" data-a="pass">🙅 No thanks</button><button class="btn green" data-a="hirecand">🤝 Hire (free!)</button></div>';
        break;
      }
      case 'post':
        h += title + '<p class="ev-text">' + F(def.text, x) + '</p>' + (sh.res ? postResult(sh.res.post) + '<button class="btn green block" data-a="showres">Continue ▶</button>' : postPicker(g, 'postev'));
        break;
      default:
        h += title + '<p class="ev-text">' + F(def.text, x) + '</p><div class="options">' + choiceButtons(g, x, def) + '</div>';
    }
    return h + '</div>';
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
    return '<div class="post-grid">' + G.postOptions(g).map(function (p) {
      var note = p.cost ? 'Costs ' + U.short(G.cost(g, p.cost)) : p.risk >= 0.2 ? '🌶️ Risky!' : p.viral >= 0.1 ? '🔥 Could go viral' : '✅ Safe';
      return '<button class="post-opt" data-a="' + action + '" data-v="' + p.id + '"><span class="e">' + p.emoji + '</span><b>' + p.name + '</b><small>' + note + '</small></button>';
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
    var h = '<div class="result"><div class="face-big">' + big + '</div><h2>' + F(def.title || 'What happened', sh.x) + '</h2><p>' + esc(res.text || 'Done!') + '</p>' +
      (res.chips.length ? '<div class="chips">' + res.chips.map(function (c, i) { return '<span class="chip ' + (c.good ? 'good' : 'bad') + '" style="animation-delay:' + (0.15 + i * 0.1) + 's">' + esc(c.txt) + '</span>'; }).join('') + '</div>' : '') +
      banners(res) + '<button class="btn green big block" data-a="cont">' + (S.g.queue.length ? 'Next (' + S.g.queue.length + ' more) ▶' : 'Continue ▶') + '</button></div>';
    return h;
  }
  function banners(r) {
    var h = '';
    (r.levelUps || []).forEach(function (l) { h += '<div class="banner purple">🎖️ LEVEL UP! You are CEO level ' + l.level + '!<br><small>Gift: ' + M(l.gift) + ' · check the Shop for new stuff</small></div>'; });
    (r.unlocked || []).forEach(function (a) { h += '<div class="banner gold">' + a.emoji + ' Achievement: ' + a.name + '!</div>'; });
    return h;
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
    if (r.rankUp != null) h += '<div class="banner pink">🎊 RANK UP! You are now a ' + CS.RANKS[r.rankUp].emoji + ' ' + CS.RANKS[r.rankUp].name + '!</div>';
    h += banners(r);
    if (r.star && g.employees.length > 1) h += '<div class="banner" style="background:#E0F2FF">🏅 Worker of the week: ' + esc(r.star.face) + ' ' + esc(r.star.name) + '</div>';
    if (r.minor.length) h += '<div class="happen">' + r.minor.map(function (m) { return '<div>' + esc(m) + '</div>'; }).join('') + '</div>';
    var pend = g.queue.length;
    return h + '<button class="btn green big block" style="margin-top:12px" data-a="cont">' + (pend ? '⚡ ' + pend + ' thing' + (pend > 1 ? 's' : '') + ' to decide ▶' : g.over ? 'Continue ▶' : '👍 Back to work') + '</button>';
  }

  function empSheet() {
    var g = S.g, sh = S.sheet, cand = sh.type === 'cand';
    var e = cand ? g.candidates.find(function (c) { return c.id === sh.id; }) : G.emp(g, sh.id);
    if (!e) return null;
    var mkt = G.market(g, e.role, e.level);
    var h = '<div class="grab"></div><div style="display:flex;gap:12px;align-items:center">' + face(e, !cand).replace('class="face"', 'class="face" style="width:72px;height:72px;font-size:42px;background:hsl(' + e.hue + ' 80% 85%)"') +
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
    return '<div class="result"><div class="face-big">' + (done ? '🎉' : '🎁') + '</div><h2>' + (done ? 'You got ' + M(done) + '!' : 'Daily gift!') + '</h2>' +
      '<p style="font-size:16px">Come back every day in a row for bigger gifts. Day 7 is the biggest!</p><div class="chips" style="justify-content:center;margin-bottom:16px">' + days + '</div>' +
      (done ? '<button class="btn green big block" data-a="close">Yay! 🎉</button>' : '<button class="btn yellow big block" data-a="claimgift">🎁 Open it!</button>') + '</div>';
  }

  function postSheet() {
    var sh = S.sheet;
    return '<div class="grab"></div><div class="ev-head" style="--c:#FF5FA2"><div class="meta"><span>📱 Social Media</span><span>' + U.num(S.g.followers) + ' followers</span></div><div class="ev-icon">📱</div></div><div class="ev-body">' +
      (sh.res ? '<h2>Your post is live!</h2>' + postResult(sh.res) + '<button class="btn green big block" data-a="close">Awesome ▶</button>'
        : '<h2>What do you want to post?</h2><p class="ev-text">Pick one. Some are safe, some are risky but could go viral! 🔥</p>' + postPicker(S.g, 'dopost') + '<button class="btn block" style="margin-top:12px" data-a="close">Maybe later</button>') + '</div>';
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
      : ['📉', 'Give up?', 'Your company closes for good. Your next company gets an experience bonus.'];
    return '<div class="result"><div class="face-big">' + t[0] + '</div><h2>' + t[1] + '</h2><p style="font-size:16px">' + t[2] + '</p><div class="row2"><button class="btn" data-a="close">Cancel</button><button class="btn red" data-a="doconfirm">Yes</button></div></div>';
  }

  // ---------- game over / daily finish ----------

  function overScreen() {
    var g = S.g;
    if (g.over.reason === 'daily') {
      var best = G.dailyBest()[g.dailyNum];
      return '<div class="wrap gameover"><div class="face-big">🏁</div><h1>Challenge done!</h1><div class="card"><span class="label">Daily Challenge #' + g.dailyNum + '</span>' +
        '<div class="offer">' + U.short(G.valuation(g)) + '</div><p style="margin:0">company value after 52 weeks</p><div class="grid-emoji">' + G.dailyGrid(g) + '</div>' +
        '<small class="muted">🟩 profit · 🟨 so-so · 🟥 loss (every 4 weeks)</small>' + (best ? '<p><b>Your best today: ' + U.short(best) + '</b></p>' : '') + '</div>' +
        '<button class="btn pink big block section" data-a="share">📤 Share my score</button><button class="btn block section" data-a="home">🏠 Main menu</button><p style="font-size:14px">Come back tomorrow for a new challenge! 📅</p></div>';
    }
    return '<div class="wrap gameover"><div class="face-big">📉</div><h1>' + esc(g.company.name) + ' went bankrupt!</h1>' +
      '<div class="card" style="text-align:left"><table class="ledger"><tr><td>📅 Weeks in business</td><td>' + g.week + '</td></tr><tr><td>💰 Most money</td><td>' + M(g.stats.peakCash) + '</td></tr>' +
      '<tr><td>👥 Most workers</td><td>' + g.stats.maxStaff + '</td></tr><tr><td>🎖️ CEO level</td><td>' + g.level + '</td></tr><tr><td>🤔 Decisions</td><td>' + g.stats.decisions + '</td></tr></table></div>' +
      '<p class="card section" style="font-size:15px">Every great boss fails sometimes! 💪 Your next company starts with bonus cash.</p>' +
      '<button class="btn green big block" data-a="restart">✨ Start a new company</button><button class="btn block section" data-a="home">🏠 Main menu</button></div>';
  }

  // ================= render =================

  function render() {
    var g = S.g;
    if (S.screen === 'game' && g && g.over && !S.sheet) { S.screen = 'over'; }
    $app.innerHTML = S.screen === 'title' ? titleScreen() : S.screen === 'create' ? createScreen() : S.screen === 'over' ? overScreen() : gameScreen();
    renderSheet();
  }

  function renderSheet() {
    var sh = S.sheet, html = null;
    if (sh) {
      html = sh.type === 'week' ? weekSheet(sh.report) : sh.type === 'event' ? eventSheet() : sh.type === 'emp' || sh.type === 'cand' ? empSheet()
        : sh.type === 'stat' ? statSheet() : sh.type === 'gift' ? giftSheet() : sh.type === 'post' ? postSheet() : sh.type === 'share' ? shareSheet() : sh.type === 'confirm' ? confirmSheet() : null;
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
      var to = +el.dataset.count, fmt = el.dataset.fmt, t0 = performance.now(), dur = 700;
      if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = fmtVal(to, fmt); return; }
      (function step(t) {
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmtVal(Math.round(to * e), fmt);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
    var img = document.getElementById('shareImg');
    if (img && !img.src) img.src = shareCard();
  }

  // ================= mini-game engines =================

  function spinWheel() {
    var sh = S.sheet, def = CS.EV[sh.x.id];
    sh.res = G.spin(S.g);
    render();
    var n = def.slices.length, a = 360 / n, target = 360 * 6 - (sh.res.slice + 0.5) * a + (Math.random() - 0.5) * a * 0.5;
    var el = document.getElementById('wheel');
    SFX.play('whoosh');
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (el) el.style.transform = 'rotate(' + target + 'deg)'; }); });
    var ticks = 0, tk = setInterval(function () { if (++ticks > 16) clearInterval(tk); else SFX.play('tick'); }, 180);
    setTimeout(function () { if (S.sheet === sh) { sh.phase = 'result'; celebrate(sh.res); render(); } }, 3600);
  }

  function startTap() {
    var sh = S.sheet, def = CS.EV[sh.x.id], arena = document.getElementById('arena');
    if (!arena || tapState) return;
    arena.querySelector('.start').remove();
    var btn = document.createElement('button');
    btn.className = 'target'; btn.type = 'button'; btn.textContent = def.target; btn.setAttribute('aria-label', 'Tap');
    arena.appendChild(btn);
    tapState = { n: 0, end: performance.now() + def.secs * 1000 };
    function move() {
      var w = arena.clientWidth - 72, h = arena.clientHeight - 72 - 30;
      btn.style.left = Math.round(Math.random() * w) + 'px';
      btn.style.top = Math.round(30 + Math.random() * h) + 'px';
    }
    move();
    var mover = setInterval(move, 850);
    btn.addEventListener('pointerdown', function (ev) {
      ev.preventDefault();
      if (!tapState) return;
      tapState.n++;
      SFX.play('tap'); buzz(8);
      document.getElementById('tapCount').textContent = tapState.n + ' / ' + def.goal;
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
      sh.res = G.tapDone(S.g, score);
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
    x.fillText('📅 ' + g.week + ' wks   👥 ' + g.employees.length + '   📱 ' + U.num(g.followers) + '   🎖️ Lv ' + g.level, W / 2, 452);
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
    if (un.length || lv.length) {
      setTimeout(function () { toast(lv.length ? '🎖️ Level up! CEO level ' + lv[lv.length - 1].level : '🏆 ' + un.map(function (a) { return a.name; }).join(', ')); }, 400);
      SFX.play('level'); confetti(60);
    }
  }

  // ================= actions =================

  var A = {
    noop: function () { return false; },
    home: function () { S.sheet = null; S.screen = 'title'; S.g = null; window.scrollTo(0, 0); },
    new: function () { S.create.step = 0; S.screen = 'create'; },
    continue: function () { S.g = G.load('main'); if (!S.g) return; G.resume(S.g); S.screen = 'game'; S.tab = 'home'; if (G.currentEvent(S.g)) openNextEvent(); },
    daily: function () {
      var info = G.dailyInfo(), saved = G.load('daily');
      if (saved) { S.g = saved; G.resume(saved); } else S.g = G.newGame(info);
      S.screen = S.g.over ? 'over' : 'game'; S.tab = 'home';
      if (!S.g.over && G.currentEvent(S.g)) openNextEvent();
    },
    randname: function () { S.create.name = G.randomName(); SFX.play('pop'); },
    logo: function (v) { S.create.logo = v; SFX.play('tap'); },
    color: function (v) { S.create.color = v; SFX.play('tap'); },
    tier: function (v) { S.create.tier = v; S.create.industry = CS.INDUSTRIES.find(function (i) { return i.tier === v; }).id; },
    industry: function (v) { S.create.industry = v; SFX.play('tap'); },
    city: function (v) { S.create.city = v; SFX.play('tap'); },
    funding: function (v) { S.create.funding = v; SFX.play('tap'); },
    cnext: function () {
      if (S.create.step === 0 && !S.create.name.trim()) { toast('Type a name first! Or tap 🎲'); return false; }
      S.create.step++; window.scrollTo(0, 0);
    },
    cback: function () { if (S.create.step === 0) S.screen = 'title'; else S.create.step--; window.scrollTo(0, 0); },
    start: function () {
      var c = S.create;
      S.g = G.newGame({ name: c.name.trim(), logo: c.logo, color: c.color, industry: c.industry, city: c.city, funding: c.funding });
      S.screen = 'game'; S.tab = 'home'; window.scrollTo(0, 0);
      SFX.play('level'); confetti(70);
    },
    tab: function (v) { S.tab = v; S.sheet = null; window.scrollTo(0, 0); SFX.play('tap'); },
    next: function () {
      var r = G.nextWeek(S.g);
      if (!r) return;
      S.sheet = { type: 'week', report: r, n: r.week };
      SFX.play(r.fin.net >= 0 ? 'coin' : 'bad');
      if (r.levelUps.length || r.unlocked.length || r.rankUp != null) { setTimeout(function () { SFX.play('level'); confetti(70); }, 300); }
      buzz(15);
    },
    events: function () { openNextEvent(); },
    cont: function () { openNextEvent(); },
    choose: function (v) { finish(G.choose(S.g, +v)); },
    showres: function () { S.sheet.phase = 'result'; celebrate(S.sheet.res); },
    box: function (v) { S.sheet.res = G.openBox(S.g, +v); SFX.play('whoosh'); },
    spin: function () { if (!S.sheet.res) spinWheel(); return false; },
    tapstart: function () { startTap(); return false; },
    answer: function (v) { S.sheet.pick = +v; S.sheet.res = G.quizAnswer(S.g, +v); SFX.play(S.sheet.res.won ? 'good' : 'bad'); },
    dealok: function () { finish(G.dealAccept(S.g)); },
    dealpush: function () { var ok = G.dealPush(S.g); SFX.play(ok ? 'coin' : 'bad'); if (ok) buzz(20); },
    dealend: function () { finish(G.dealEnd(S.g)); },
    vs: function (v) { S.sheet.res = G.vsPlay(S.g, v); SFX.play('whoosh'); },
    ask: function (v) { G.interviewAsk(S.g, +v); SFX.play('pop'); },
    hirecand: function () { finish(G.resolve(S.g, { hire: 'cand' }, '🤝 Welcome to the team!')); },
    pass: function () { finish(G.resolve(S.g, null, 'You said no thanks. 👋')); },
    postev: function (v) { S.sheet.res = G.postEvent(S.g, v); celebrate(S.sheet.res); },
    post: function () { S.sheet = { type: 'post' }; },
    dopost: function (v) { S.sheet.res = G.post(S.g, v); G.clampAll(S.g); afterAction(); celebrate({ post: S.sheet.res, chips: [{ good: !S.sheet.res.backfire, txt: '' }] }); },
    stat: function (v) { S.sheet = { type: 'stat', k: v }; },
    claim: function (v) {
      var m = G.claimMission(S.g, +v);
      if (m) { toast('🎯 +' + U.short(m.reward) + ' and ' + m.xp + ' XP!'); SFX.play('coin'); confetti(40); buzz(25); afterAction(); }
    },
    gift: function () { S.sheet = { type: 'gift' }; },
    claimgift: function () { var amt = G.claimGift(S.g); S.sheet.amount = amt; SFX.play('level'); confetti(90); buzz([30, 30, 30]); },
    price: function (v) { S.g.price = +v; G.save(S.g); SFX.play('tap'); },
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
    close: function () { S.sheet = null; },
    scrim: function () { if (S.sheet && ['emp', 'cand', 'confirm', 'stat', 'share', 'post'].indexOf(S.sheet.type) >= 0 && !(S.sheet.type === 'post' && S.sheet.res)) S.sheet = null; else return false; },
    loan: function (v) { var o = G.loanOffers(S.g)[+v]; if (!o || !o.ok) return; G.addLoan(S.g, o.amount, o.apr, o.weeks); afterAction(); toast('🏦 Got ' + M(o.amount) + '!'); SFX.play('coin'); },
    repay: function (v) { if (G.repayLoan(S.g, +v)) { afterAction(); toast('🕊️ Loan paid off!'); SFX.play('good'); } },
    stake: function (v) { var a = G.sellStake(S.g, +v); if (a) { afterAction(); toast('💼 Investors paid ' + M(a) + '!'); SFX.play('coin'); } },
    share: function () { S.sheet = { type: 'share' }; },
    doshare: function () {
      var text = document.getElementById('shareText').value, img = document.getElementById('shareImg');
      var data = { text: text, title: 'Company Simulator' };
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
    setting: function (v) { S.settings[v] = !S.settings[v]; G.setSetting(v, S.settings[v]); SFX.play('pop'); },
    confirm: function (v) { S.sheet = { type: 'confirm', what: v }; },
    doconfirm: function () {
      var g = S.g, w = S.sheet.what;
      S.sheet = null;
      if (w === 'newgame') {
        if (g.mode === 'main') { G.recordLegacy(g, 'Started over'); G.clearSave('main'); } else G.clearSave('daily');
        S.g = null; S.screen = 'create'; S.create.step = 0; S.create.name = '';
      } else { g.over = { reason: g.mode === 'daily' ? 'daily' : 'gaveup', week: g.week }; G.checkAchievements(g); endCompany(); }
    },
    restart: function () { S.g = null; S.screen = 'create'; S.create.step = 0; S.create.name = ''; window.scrollTo(0, 0); }
  };

  function onClick(ev) {
    var el = ev.target.closest('[data-a]');
    if (!el) return;
    if (el.dataset.a === 'scrim' && ev.target !== el) return; // clicks inside the sheet body
    var fn = A[el.dataset.a];
    if (!fn) return;
    if (fn(el.dataset.v) === false) return;
    render();
  }
  function onInput(ev) {
    if (ev.target.id === 'cname') {
      S.create.name = ev.target.value;
      var p = document.getElementById('cprev'); if (p) p.textContent = ev.target.value || 'Your Company';
    }
  }

  CS.boot = function () {
    $app = document.getElementById('app');
    $sheet = document.getElementById('sheet-root');
    $toast = document.getElementById('toast-root');
    document.addEventListener('click', onClick);
    document.addEventListener('input', onInput);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && S.sheet && A.scrim() !== false) render();
      if (ev.key === 'Enter' && ev.target.id === 'cname') { if (A.cnext() !== false) render(); }
    });
    render();
  };
})();
