// Rendering and input. Every screen is a function returning an HTML string;
// clicks are routed through data-a="action" attributes.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var U = CS.U, G = CS.G, esc = U.esc, M = U.money;

  var S = CS.S = {
    g: null, screen: 'title', tab: 'home', sheet: null,
    create: { step: 0, name: '', logo: '☕', color: CS.COLORS[0], tier: 'small', industry: 'cafe', city: 'berlin', funding: 'savings' }
  };

  var $app, $sheet, $toast, toastTimer;

  // ---------- small building blocks ----------

  function tone(v) { return v >= 60 ? '' : v >= 35 ? 'mid' : 'low'; }
  function meter(label, v, max, shown) {
    var pct = U.clamp(v / (max || 100) * 100, 0, 100);
    return '<div class="meter"><div class="top"><span>' + label + '</span><span>' + (shown != null ? shown : Math.round(v)) + '</span></div>' +
      '<div class="bar"><i class="' + tone(pct) + '" style="width:' + pct.toFixed(1) + '%"></i></div></div>';
  }
  function mini(v) { return '<span class="mini"><i class="' + tone(v) + '" style="width:' + Math.round(v) + '%"></i></span>'; }
  function logo(c, size) { return '<span class="logo" style="background:' + esc(c.color) + (size ? ';width:' + size + 'px;height:' + size + 'px' : '') + '">' + esc(c.logo) + '</span>'; }
  function initials(n) { return n.split(' ').map(function (p) { return p[0]; }).join('').slice(0, 2); }
  function avatar(e) { return '<span class="avatar" style="background:hsl(' + e.hue + ' 42% 42%)">' + esc(initials(e.name)) + '</span>'; }
  function weekLabel(w) { var y = Math.floor((w - 1) / 52) + 1, wk = ((w - 1) % 52) + 1; return w < 1 ? 'Opening day' : 'Year ' + y + ' · Week ' + wk; }
  function traitChip(e, i) {
    if (!G.traitKnown(e, i)) return '<span class="trait" title="Revealed after 4 weeks">? Unknown</span>';
    var t = CS.TRAITS[e.traits[i]];
    return '<span class="trait ' + (t.good ? 'good' : 'bad') + '" title="' + esc(t.desc) + '">' + t.label + '</span>';
  }
  function ind(g) { return CS.IND[g.company.industry]; }

  var ICONS = {
    home: '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/></svg>',
    staff: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M16.5 14.6c2.6 0 4.4 1.6 5 4.4"/></svg>',
    money: '<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="19" height="13" rx="2"/><path d="M2.5 10h19"/><path d="M6.5 15h4"/></svg>',
    news: '<svg viewBox="0 0 24 24"><path d="M4 4h13v16H6a2 2 0 0 1-2-2z"/><path d="M17 8h3v10a2 2 0 0 1-2 2"/><path d="M7.5 8h6M7.5 12h6M7.5 16h4"/></svg>',
    goals: '<svg viewBox="0 0 24 24"><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5"/><path d="M12 14v4M8 21h8M9.5 18h5"/></svg>'
  };

  // ---------- title ----------

  function titleScreen() {
    var saved = G.load(), L = G.loadLegacy();
    var h = '<div class="wrap title-screen">' +
      '<div class="title-mark">A business life simulator</div>' +
      '<h1>Company<br><span>Simulator</span></h1>' +
      '<p class="lede">Start with a little money and one idea. Hire people, survive the drama, and press Next Week until you run an empire.</p>' +
      '<div class="title-actions">';
    if (saved) {
      h += '<button class="btn block continue-card" data-a="continue">' + logo(saved.company) +
        '<span style="flex:1"><b>Continue ' + esc(saved.company.name) + '</b><br><small class="muted">' + weekLabel(saved.week) + ' · <span class="num">' + M(saved.cash) + '</span></small></span></button>';
    }
    h += '<button class="btn primary block" data-a="new" style="min-height:52px;font-size:16px">Start a new company</button></div>';
    if (L.companies.length) {
      h += '<div class="section"><div class="section-head"><h3>Past companies</h3><span class="label">Experience bonus +' + Math.min(50, L.companies.length * 5) + '% cash</span></div>';
      L.companies.slice(0, 4).forEach(function (c) {
        h += '<div class="card" style="display:flex;justify-content:space-between;gap:10px"><span>' + esc(c.logo) + ' <b>' + esc(c.name) + '</b><br><small class="muted">' + esc(CS.IND[c.industry] ? CS.IND[c.industry].name : '') + ' · ' + c.weeks + ' weeks</small></span><span class="num muted" style="text-align:right">peak ' + U.short(c.peakCash) + '<br><small>' + esc(c.reason) + '</small></span></div>';
      });
      h += '</div>';
    }
    h += '<div class="ticker" aria-hidden="true"><span>BREAKING: Local café hires its 10,000th barista · Employee of the month sleeps through award ceremony · Office microwave still missing · Markets steady as new startups open doors · Rival opens across the street, again · </span></div></div>';
    return h;
  }

  // ---------- creation ----------

  function createScreen() {
    var c = S.create, step = c.step, h = '<div class="wrap create">';
    h += '<div class="steps">' + [0, 1, 2, 3].map(function (i) { return '<i class="' + (i <= step ? 'on' : '') + '"></i>'; }).join('') + '</div>';
    if (step === 0) {
      h += '<h2>Name your company</h2><p class="sub">This is what the news will call you.</p>';
      h += '<div class="preview-row">' + logo(c) + '<strong id="cprev">' + esc(c.name || 'Your Company') + '</strong></div>';
      h += '<div class="field"><label class="label" for="cname">Company name</label><input id="cname" maxlength="28" autocomplete="off" placeholder="e.g. Bean There" value="' + esc(c.name) + '"></div>';
      h += '<div class="field"><span class="label">Logo</span><div class="logo-grid">' + CS.LOGOS.map(function (l) { return '<button data-a="logo" data-v="' + l + '" class="' + (c.logo === l ? 'on' : '') + '" aria-label="Logo ' + l + '">' + l + '</button>'; }).join('') + '</div></div>';
      h += '<div class="field"><span class="label">Brand color</span><div class="color-row">' + CS.COLORS.map(function (col) { return '<button data-a="color" data-v="' + col + '" class="' + (c.color === col ? 'on' : '') + '" style="background:' + col + '" aria-label="Color ' + col + '"></button>'; }).join('') + '</div></div>';
    } else if (step === 1) {
      h += '<h2>What kind of company?</h2><p class="sub">Each industry has its own staff, prices and risks.</p>';
      h += '<div class="seg">' + Object.keys(CS.TIERS).map(function (t) { return '<button data-a="tier" data-v="' + t + '" class="' + (c.tier === t ? 'on' : '') + '">' + CS.TIERS[t].label.replace(' business', '').replace(' industry', '') + '</button>'; }).join('') + '</div>';
      var tier = CS.TIERS[c.tier];
      h += '<p class="tier-note">' + tier.blurb + ' Starts with <b class="num">' + M(tier.cash) + '</b>.</p><div class="choice-list">';
      CS.INDUSTRIES.filter(function (i) { return i.tier === c.tier; }).forEach(function (i) {
        h += '<button class="choice ' + (c.industry === i.id ? 'on' : '') + '" data-a="industry" data-v="' + i.id + '"><span class="ico">' + i.emoji + '</span><span class="grow"><b>' + i.name + '</b><small>Staff: ' + i.front + 's</small></span><span class="side">Avg. sale<br><b class="num">' + M(i.t) + '</b></span></button>';
      });
      h += '</div>';
    } else if (step === 2) {
      h += '<h2>Where do you start?</h2><p class="sub">Cities change how many customers you get, what they pay, and what everything costs.</p><div class="choice-list">';
      Object.keys(CS.CITIES).forEach(function (k) {
        var ci = CS.CITIES[k];
        h += '<button class="choice ' + (c.city === k ? 'on' : '') + '" data-a="city" data-v="' + k + '"><span class="ico">' + ci.flag + '</span><span class="grow"><b>' + ci.name + '</b><small>' + ci.note + '</small></span><span class="side num">demand ×' + ci.demand + '<br>rent ×' + ci.rent + '</span></button>';
      });
      h += '</div>';
    } else {
      var i = CS.IND[c.industry], tr = CS.TIERS[i.tier];
      h += '<h2>How will you fund it?</h2><p class="sub">More money now means owning less later, or paying it back.</p><div class="choice-list">';
      Object.keys(CS.FUNDING).forEach(function (k) {
        var f = CS.FUNDING[k];
        var own = Math.round(100 * f.own * (tr.startOwnership || 1));
        h += '<button class="choice ' + (c.funding === k ? 'on' : '') + '" data-a="funding" data-v="' + k + '"><span class="grow"><b>' + f.name + '</b><small>' + f.note + '</small></span><span class="side"><b class="num">' + M(tr.cash * (f.cash + f.loan)) + '</b><br>you own ' + own + '%</span></button>';
      });
      h += '</div><div class="card section"><span class="label">Summary</span><div class="preview-row" style="margin:10px 0 0">' + logo(c) + '<div><strong>' + esc(c.name || 'Your Company') + '</strong><br><small class="muted">' + i.emoji + ' ' + i.name + ' in ' + CS.CITIES[c.city].name + '</small></div></div>' +
        (tr.startDebt ? '<p class="muted" style="margin:10px 0 0;font-size:13px">Large industries start with ' + M(tr.cash * tr.startDebt) + ' of existing debt and outside shareholders owning 30%.</p>' : '') + '</div>';
    }
    h += '</div><div class="create-bar"><div class="wrap">' +
      '<button class="btn" data-a="cback">' + (step === 0 ? 'Cancel' : 'Back') + '</button>' +
      (step < 3 ? '<button class="btn primary" data-a="cnext">Next</button>' : '<button class="btn primary" data-a="start">Open for business</button>') +
      '</div></div>';
    return h;
  }

  // ---------- game shell ----------

  function gameScreen() {
    var g = S.g, last = g.history[g.history.length - 1];
    var h = '<div class="game"><header class="topbar"><div class="wrap">' + logo(g.company) +
      '<div class="who"><b>' + esc(g.company.name) + '</b><small>' + weekLabel(g.week) + '</small></div>' +
      '<div class="cash"><b class="' + (g.cash < 0 ? 'bad' : '') + '">' + M(g.cash) + '</b>' +
      (last ? '<small class="' + (last.net >= 0 ? 'good' : 'bad') + '">' + U.signed(last.net) + '/wk</small>' : '<small class="faint">cash</small>') + '</div></div></header>';
    h += '<main class="wrap">' + ({ home: homeTab, staff: staffTab, money: moneyTab, news: newsTab, goals: goalsTab }[S.tab])(g) + '</main>';
    var pend = g.queue.length;
    h += '<div class="dock"><div class="wrap"><button class="next ' + (pend ? 'pending' : '') + '" data-a="' + (pend ? 'events' : 'next') + '">' +
      '<span class="stub"><small>WEEK</small><b>' + (pend ? '!' : g.week + 1) + '</b></span>' +
      '<span class="go"><b>' + (pend ? pend + ' DECISION' + (pend > 1 ? 'S' : '') + ' WAITING' : 'NEXT WEEK') + '</b><span aria-hidden="true">→</span></span></button></div></div>';
    h += '<nav class="nav"><div class="wrap">' + [['home', 'Company'], ['staff', 'Staff'], ['money', 'Money'], ['news', 'News'], ['goals', 'Goals']].map(function (t) {
      return '<button data-a="tab" data-v="' + t[0] + '" class="' + (S.tab === t[0] ? 'on' : '') + '">' + ICONS[t[0]] + t[1] + '</button>';
    }).join('') + '</div></nav></div>';
    return h;
  }

  function sparkline(g) {
    var pts = g.history.slice(-26).map(function (x) { return x.cash; });
    if (pts.length < 2) return '<p class="faint" style="font-size:13px;margin:10px 0 0">Your cash chart starts after week 2.</p>';
    var W = 300, H = 64, pad = 4;
    var lo = Math.min.apply(null, pts.concat([0])), hi = Math.max.apply(null, pts);
    if (hi === lo) hi = lo + 1;
    var x = function (i) { return pad + i * (W - pad * 2) / (pts.length - 1); };
    var y = function (v) { return pad + (hi - v) * (H - pad * 2) / (hi - lo); };
    var line = pts.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
    var area = line + ' L' + x(pts.length - 1).toFixed(1) + ' ' + (H - pad) + ' L' + pad + ' ' + (H - pad) + ' Z';
    var end = pts[pts.length - 1], col = end >= pts[0] ? 'var(--accent)' : 'var(--bad)';
    var zero = lo < 0 ? '<line x1="0" x2="' + W + '" y1="' + y(0).toFixed(1) + '" y2="' + y(0).toFixed(1) + '" stroke="var(--line)" stroke-dasharray="3 3"/>' : '';
    return '<svg class="spark" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" role="img" aria-label="Cash over the last ' + pts.length + ' weeks">' + zero +
      '<path d="' + area + '" fill="' + col + '" fill-opacity=".12"/><path d="' + line + '" fill="none" stroke="' + col + '" stroke-width="2" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="' + x(pts.length - 1).toFixed(1) + '" cy="' + y(end).toFixed(1) + '" r="3.5" fill="' + col + '"/></svg>';
  }

  function homeTab(g) {
    var econ = CS.ECON[g.economy.state], f = G.compute(g, true), last = g.history[g.history.length - 1];
    var h = '';
    if (g.cash < 0) {
      h += '<div class="card section" style="border-color:var(--bad);background:var(--bad-soft)"><b class="bad">Out of cash</b><p style="margin:6px 0 10px;font-size:14px">You have ' + Math.max(0, 8 - g.negWeeks) + ' weeks to get back above $0 or the company goes bankrupt. Borrow money, sell part of the company, or cut staff.</p>' +
        '<div class="row-actions"><button class="btn small" data-a="tab" data-v="money">Loans & investors</button><button class="btn small" data-a="tab" data-v="staff">Manage staff</button></div></div>';
    }
    h += '<div class="card hero section"><div class="row"><div><span class="label">Cash</span><div class="cash-big ' + (g.cash < 0 ? 'bad' : '') + '">' + M(g.cash) + '</div></div>' +
      '<div class="chips" style="justify-content:flex-end"><span class="chip ' + (econ.tone === 'good' ? 'good' : econ.tone === 'bad' ? 'bad' : econ.tone === 'warn' ? 'warn' : '') + '">' + econ.name + '</span><span class="chip">' + CS.CITIES[g.company.city].flag + ' ' + CS.CITIES[g.company.city].name + '</span></div></div>' +
      sparkline(g) + '</div>';

    h += '<div class="card section"><div class="meters">' +
      meter('Reputation', g.reputation) + meter('Customer happiness', g.satisfaction) +
      meter('Team morale', G.avgMorale(g)) + meter('Brand awareness', g.awareness, G.awCap(g), Math.round(g.awareness / G.awCap(g) * 100) + '%') +
      '</div></div>';

    if (last) {
      var lf = g.last && g.last.fin;
      h += '<div class="section"><div class="section-head"><h3>Last week</h3><span class="label">Week ' + last.week + '</span></div><div class="card"><table class="ledger">' +
        '<tr><td>Revenue</td><td>' + M(last.revenue) + '</td></tr>' +
        (lf ? '<tr><td class="muted">Supplies</td><td>-' + M(lf.supplies) + '</td></tr><tr><td class="muted">Wages</td><td>-' + M(lf.wages) + '</td></tr><tr><td class="muted">Rent</td><td>-' + M(lf.rent) + '</td></tr>' + (lf.loans ? '<tr><td class="muted">Loan payments</td><td>-' + M(lf.loans) + '</td></tr>' : '') : '') +
        '<tr class="total"><td>Net</td><td class="' + (last.net >= 0 ? 'good' : 'bad') + '">' + U.signed(last.net) + '</td></tr></table>';
      var capPct = last.demand > 0 ? Math.min(100, last.capacity / last.demand * 100) : 100;
      h += '<div class="ops">Served <b class="num">' + U.num(last.served) + '</b> of <b class="num">' + U.num(last.demand) + '</b> ' + ind(g).unit + '. ' +
        (last.capacity < last.demand * 0.97 ? '<span class="bad">Your team is at capacity. Hire more ' + ind(g).front.toLowerCase() + 's.</span>' : '<span class="good">You had room to serve more.</span>') +
        '<div class="capbar" aria-hidden="true"><i style="width:' + capPct.toFixed(1) + '%"></i></div></div></div></div>';
    } else {
      h += '<div class="section card"><b>Ready to open.</b><p class="muted" style="margin:6px 0 0;font-size:14px">This week you expect about <b class="num">' + U.num(f.demand) + '</b> ' + ind(g).unit + ' and can serve about <b class="num">' + U.num(f.capacity) + '</b>. Press Next Week to start trading.</p></div>';
    }
    if (g.mods.length) {
      h += '<div class="card section"><span class="label">Right now</span><div class="mods">' + g.mods.map(function (m) {
        var good = (m.type === 'demand' || m.type === 'capacity') ? m.value >= 1 : m.type === 'supply' ? m.value < 0 : m.type === 'extra';
        return '<div><span class="' + (good ? 'good' : 'bad') + '">●</span> ' + esc(m.label) + ' <span class="faint">· ' + m.weeks + ' wk' + (m.weeks > 1 ? 's' : '') + ' left</span></div>';
      }).join('') + '</div></div>';
    }

    h += '<div class="section"><div class="section-head"><h3>Pricing</h3><span class="label">Avg. sale ' + M(g.eco.ticket * CS.CITIES[g.company.city].ticket * [0.8, 1, 1.3][g.price] * g.priceIndex) + '</span></div>' +
      '<div class="seg">' + ['Budget', 'Standard', 'Premium'].map(function (p, i) { return '<button data-a="price" data-v="' + i + '" class="' + (g.price === i ? 'on' : '') + '">' + p + '</button>'; }).join('') + '</div>' +
      '<p class="tier-note">' + ['Cheaper prices bring 25% more customers and happier ones, but each sale earns less.', 'Normal prices. A safe middle ground.', 'Higher prices, fewer customers. Works well when your staff are skilled.'][g.price] + '</p></div>';

    h += '<div class="section"><div class="section-head"><h3>Advertise</h3><span class="label">Raises awareness</span></div><div class="row-actions">' +
      G.ads.map(function (a) { return '<button class="btn" data-a="ad" data-v="' + a.id + '">' + a.name + '<span class="num faint" style="font-size:12px">' + U.short(G.cost(g, a.frac)) + '</span></button>'; }).join('') + '</div></div>';

    h += '<div class="section"><div class="section-head"><h3>Latest news</h3><button class="btn small ghost" data-a="tab" data-v="news">All news</button></div><div class="card">' + newsList(g.news.slice(0, 5)) + '</div></div>';
    return h;
  }

  function newsList(items) {
    if (!items.length) return '<p class="faint" style="margin:0">Nothing yet.</p>';
    return items.map(function (n) {
      return '<div class="news-item"><span class="wk">W' + n.week + '</span><span class="dot ' + n.tone + '"></span><span>' + esc(n.text) + '</span></div>';
    }).join('');
  }

  function personRow(g, e, cand) {
    return '<button class="person ' + (cand ? 'cand' : '') + '" data-a="' + (cand ? 'cand' : 'emp') + '" data-v="' + e.id + '">' + avatar(e) +
      '<span class="grow"><b>' + esc(e.name) + '</b><small>' + G.title(g, e) + ' · ' + (cand ? 'asks ' : '') + '<span class="num">' + M(e.salary) + '</span>/wk</small></span>' +
      '<span class="stat">' + (cand ? '<span>Skill <b class="num">' + Math.round(e.skill) + '</b></span>' + traitChip(e, 0)
        : '<span>Skill ' + mini(e.skill) + '</span><span>Mood ' + mini(e.morale) + '</span>') + '</span></button>';
  }

  function staffTab(g) {
    var f = G.compute(g, true);
    var payroll = g.employees.reduce(function (s, e) { return s + e.salary; }, 0);
    var mgrs = g.employees.filter(function (e) { return e.role === 'mgr'; }).length;
    var h = '<div class="card section"><div class="stat-grid">' +
      '<div><b>' + g.employees.length + '</b><small>Employees</small></div>' +
      '<div><b>' + U.short(payroll) + '</b><small>Payroll / week</small></div>' +
      '<div><b>' + Math.round(G.avgMorale(g)) + '</b><small>Avg. morale</small></div></div>' +
      '<div class="ops">Capacity <b class="num">' + U.num(f.capacity) + '</b> vs. expected demand <b class="num">' + U.num(f.demand) + '</b> ' + ind(g).unit + '.</div>' +
      (!f.covered ? '<p class="bad" style="font-size:13px;margin:8px 0 0">Too few managers. Each manager can look after 8 people. Morale and output are suffering.</p>' : '<p class="faint" style="font-size:13px;margin:8px 0 0">' + mgrs + ' manager' + (mgrs === 1 ? '' : 's') + '. Each can look after 8 people once you have more than 5.</p>') +
      '</div>';
    var order = { mgr: 0, acct: 1, sales: 2, front: 3 };
    var list = g.employees.slice().sort(function (a, b) { return order[a.role] - order[b.role] || b.level - a.level || b.skill - a.skill; });
    h += '<div class="section"><div class="section-head"><h3>Your team</h3><span class="label">Tap for details</span></div>' +
      (list.length ? list.map(function (e) { return personRow(g, e); }).join('') : '<div class="card muted">Nobody works here. Hire someone below.</div>') + '</div>';
    h += '<div class="section"><div class="section-head"><h3>Hiring board</h3><span class="label">New faces every week</span></div>' +
      '<p class="tier-note" style="margin-top:0">' + ind(g).front + 's serve customers. Salespeople bring in customers. Accountants cut supply costs. Managers keep teams happy.</p>' +
      g.candidates.map(function (c) { return personRow(g, c, true); }).join('') + '</div>';
    return h;
  }

  function moneyTab(g) {
    var debt = G.debt(g), val = G.valuation(g);
    var h = '<div class="card section"><div class="stat-grid">' +
      '<div><b>' + U.short(val) + '</b><small>Company value</small></div>' +
      '<div><b>' + Math.round(g.ownership) + '%</b><small>You own</small></div>' +
      '<div><b class="' + (debt ? 'bad' : '') + '">' + U.short(debt) + '</b><small>Debt</small></div></div>' +
      '<p class="faint" style="font-size:13px;margin:10px 0 0">Your stake is worth about <b class="num">' + M(val * g.ownership / 100) + '</b>.</p></div>';

    h += '<div class="section"><div class="section-head"><h3>Bank loans</h3><span class="label">Paid back weekly</span></div>';
    G.loanOffers(g).forEach(function (o, i) {
      var r = o.apr / 52, pay = o.amount * r / (1 - Math.pow(1 + r, -o.weeks));
      h += '<div class="card" style="display:flex;align-items:center;gap:10px"><span style="flex:1"><b class="num">' + M(o.amount) + '</b><br><small class="muted">' + (o.apr * 100).toFixed(1) + '% APR · ' + o.weeks + ' weeks · <span class="num">' + M(pay) + '</span>/wk</small></span>' +
        '<button class="btn small" data-a="loan" data-v="' + i + '" ' + (o.ok ? '' : 'disabled') + '>' + (o.ok ? 'Borrow' : 'Too much debt') + '</button></div>';
    });
    if (g.loans.length) {
      h += '<div class="section-head" style="margin-top:14px"><h3>Your loans</h3></div>';
      g.loans.forEach(function (l) {
        h += '<div class="card" style="display:flex;align-items:center;gap:10px"><span style="flex:1"><b class="num">' + M(l.balance) + '</b> left<br><small class="muted">' + (l.apr * 100).toFixed(1) + '% APR · <span class="num">' + M(l.payment) + '</span>/wk</small></span>' +
          '<button class="btn small" data-a="repay" data-v="' + l.id + '" ' + (g.cash >= l.balance ? '' : 'disabled') + '>Pay off</button></div>';
      });
    }
    h += '</div>';

    h += '<div class="section"><div class="section-head"><h3>Sell shares to investors</h3><span class="label">You keep at least 10%</span></div>';
    [10, 20].forEach(function (p) {
      var ok = g.ownership - p >= 10;
      h += '<div class="card" style="display:flex;align-items:center;gap:10px"><span style="flex:1">Sell <b>' + p + '%</b> of the company<br><small class="muted">Offer: <span class="num">' + M(G.stakeOffer(g, p)) + '</span></small></span><button class="btn small" data-a="stake" data-v="' + p + '" ' + (ok ? '' : 'disabled') + '>Sell</button></div>';
    });
    h += '</div>';

    var rows = g.history.slice(-12).reverse();
    h += '<div class="section"><div class="section-head"><h3>History</h3><span class="label">Last 12 weeks</span></div><div class="card table-wrap"><table class="hist"><thead><tr><th>Week</th><th>Revenue</th><th>Net</th><th>Cash</th></tr></thead><tbody>' +
      (rows.length ? rows.map(function (r) { return '<tr><td>' + r.week + '</td><td>' + U.short(r.revenue) + '</td><td class="' + (r.net >= 0 ? 'good' : 'bad') + '">' + U.short(r.net) + '</td><td>' + U.short(r.cash) + '</td></tr>'; }).join('') : '<tr><td colspan="4" class="faint">No weeks played yet.</td></tr>') +
      '</tbody></table></div></div>';
    return h;
  }

  function newsTab(g) {
    return '<div class="section"><div class="section-head"><h3>Business news</h3><span class="label">' + g.news.length + ' stories</span></div><div class="card">' + newsList(g.news) + '</div></div>';
  }

  function goalsTab(g) {
    var got = Object.keys(g.achievements).length;
    var h = '<div class="section"><div class="section-head"><h3>Achievements</h3><span class="label">' + got + ' / ' + CS.ACHIEVEMENTS.length + '</span></div><div class="ach-grid">';
    CS.ACHIEVEMENTS.forEach(function (a) {
      var w = g.achievements[a.id];
      h += '<div class="ach ' + (w ? '' : 'locked') + '"><b>' + (w ? '🏆 ' : '') + a.name + '</b><small>' + a.desc + '</small>' + (w ? '<div class="when">Week ' + w + '</div>' : '') + '</div>';
    });
    h += '</div></div>';
    h += '<div class="section"><div class="section-head"><h3>Company</h3></div><div class="card"><table class="ledger">' +
      '<tr><td>Industry</td><td>' + ind(g).emoji + ' ' + ind(g).name + '</td></tr>' +
      '<tr><td>Rivals</td><td style="font-family:var(--body)">' + g.rivals.map(esc).join(', ') + '</td></tr>' +
      '<tr><td>Decisions made</td><td>' + g.stats.decisions + '</td></tr>' +
      '<tr><td>Total revenue</td><td>' + M(g.stats.revenue) + '</td></tr>' +
      '<tr><td>People fired</td><td>' + g.stats.fired + '</td></tr></table>' +
      '<p class="faint" style="font-size:13px">Your game saves on this device after every week and decision.</p>' +
      '<div class="row-actions"><button class="btn small" data-a="confirm" data-v="newgame">Start over</button><button class="btn small danger" data-a="confirm" data-v="bankrupt">Declare bankruptcy</button></div></div></div>';
    return h;
  }

  // ---------- sheets ----------

  function weekSheet(r) {
    var f = r.fin, g = S.g;
    var h = '<div class="grab"></div><div class="receipt-head"><h2 class="week-title">Week ' + r.week + '</h2><span class="label">' + weekLabel(r.week).split(' · ')[0] + '</span></div>';
    var word = r.count === 0 ? 'A quiet week. Nothing unusual happened.' : r.count === 1 ? '1 thing happened this week.' : r.count >= 5 ? r.count + ' things happened. What a week.' : r.count + ' things happened this week.';
    h += '<div class="count-line">' + word + '</div>';
    h += '<div class="receipt"><table class="ledger">' +
      (f.closed ? '<tr><td class="bad">Closed this week</td><td></td></tr>' : '') +
      '<tr><td>Revenue</td><td>' + M(f.revenue) + '</td></tr>' +
      '<tr><td class="muted">Costs</td><td>-' + M(f.supplies + f.wages + f.rent + f.loans) + '</td></tr>' +
      '<tr class="total"><td>Net</td><td class="' + (f.net >= 0 ? 'good' : 'bad') + '">' + U.signed(f.net) + '</td></tr></table>' +
      '<div class="ops">' + U.num(f.served) + ' ' + ind(g).unit + ' · cash now <b class="num">' + M(g.cash) + '</b></div></div>';
    if (r.minor.length) h += '<div class="happen">' + r.minor.map(function (m) { return '<div>' + esc(m) + '</div>'; }).join('') + '</div>';
    r.unlocked.forEach(function (a) { h += '<div class="unlock">🏆 <b>Achievement:</b> ' + a.name + '</div>'; });
    var pend = g.queue.length;
    h += '<div style="margin-top:16px"><button class="btn primary block" data-a="cont">' + (pend ? 'Handle ' + pend + ' decision' + (pend > 1 ? 's' : '') : g.over ? 'Continue' : 'Back to work') + '</button></div>';
    return h;
  }

  function eventSheet() {
    var g = S.g, sh = S.sheet;
    if (sh.result) {
      var x0 = sh.done;
      var h0 = '<div class="grab"></div><div class="event-meta"><span>' + x0.cat + '</span><span>Outcome</span></div>' +
        '<div class="event-icon">' + x0.icon + '</div><h2>' + esc(x0.title) + '</h2><div class="outcome">' + esc(sh.result.text || 'Done.') + '</div>';
      sh.result.unlocked.forEach(function (a) { h0 += '<div class="unlock">🏆 <b>Achievement:</b> ' + a.name + '</div>'; });
      var more = g.queue.length;
      h0 += '<button class="btn primary block" style="margin-top:14px" data-a="cont">' + (more ? 'Next (' + more + ' left)' : 'Continue') + '</button>';
      return h0;
    }
    var x = G.currentEvent(g);
    if (!x) return null;
    var def = CS.EV[x.id];
    var h = '<div class="grab"></div><div class="event-meta"><span>' + def.cat + (x.chain ? ' · follow-up' : '') + '</span><span>Week ' + g.week + '</span></div>' +
      '<div class="event-icon">' + def.icon + '</div><h2>' + esc(G.render(def.title, g, x.ctx)) + '</h2>' +
      '<p class="event-text">' + esc(G.render(def.text, g, x.ctx)) + '</p><div class="options">';
    def.choices.forEach(function (c, i) {
      var cost = G.choiceCost(g, x, c);
      h += '<button class="option" data-a="choose" data-v="' + i + '"><span><b>' + esc(G.choiceLabel(g, x, c)) + '</b>' + (c.d ? '<small>' + esc(c.d) + '</small>' : '') + '</span>' + (cost ? '<span class="price">-' + M(cost) + '</span>' : '') + '</button>';
    });
    return h + '</div>';
  }

  function empSheet() {
    var g = S.g, sh = S.sheet, cand = sh.type === 'cand';
    var e = cand ? g.candidates.find(function (c) { return c.id === sh.id; }) : G.emp(g, sh.id);
    if (!e) return null;
    var mkt = G.market(g, e.role, e.level);
    var h = '<div class="grab"></div><div style="display:flex;gap:12px;align-items:center">' + avatar(e) + '<div><h2 style="font-size:22px">' + esc(e.name) + '</h2><span class="muted">' + G.title(g, e) + ' · age ' + e.age + (cand ? '' : ' · ' + e.weeks + ' weeks here') + '</span></div></div>';
    h += '<div class="chips" style="margin:12px 0">' + traitChip(e, 0) + traitChip(e, 1) + '</div>';
    h += '<div class="stat-grid">' +
      '<div><b>' + Math.round(e.skill) + '</b><small>Skill</small></div>' +
      (cand ? '' : '<div><b>' + Math.round(e.morale) + '</b><small>Morale</small></div><div><b>' + Math.round(e.loyalty) + '</b><small>Loyalty</small></div>') +
      '<div><b>' + Math.round(e.reliability) + '</b><small>Reliability</small></div>' +
      '<div><b>' + Math.round(G.productivity(e) * 100) + '%</b><small>Output</small></div>' +
      '<div><b>' + U.short(e.salary) + '</b><small>Pay / week</small></div></div>';
    var diff = Math.round((e.salary / mkt - 1) * 100);
    h += '<p class="faint" style="font-size:13px;margin:10px 0">Market rate for this job: <span class="num">' + M(mkt) + '</span>/wk. ' + (diff > 3 ? 'Paid ' + diff + '% above market.' : diff < -3 ? '<span class="bad">Paid ' + (-diff) + '% below market.</span>' : 'Paid about market rate.') + '</p>';
    if (cand) {
      return h + '<p class="muted" style="font-size:14px">Hiring costs one week of pay as a recruiting fee (<span class="num">' + M(e.salary) + '</span>). Their second trait shows after 4 weeks.</p>' +
        '<div class="row-actions"><button class="btn" data-a="close">Not now</button><button class="btn primary" data-a="hire" data-v="' + e.id + '">Hire</button></div>';
    }
    var friends = G.friendsOf(g, e), enemies = G.enemiesOf(g, e), partner = G.partnerOf(g, e);
    if (friends.length || enemies.length || partner) {
      h += '<div class="card" style="margin-bottom:12px"><span class="label">Relationships</span><div style="font-size:14px;margin-top:6px;display:grid;gap:4px">' +
        (partner ? '<div>💘 Dating ' + esc(partner.name) + '</div>' : '') +
        friends.filter(function (x) { return x !== partner; }).map(function (x) { return '<div>🤝 Friends with ' + esc(x.name) + '</div>'; }).join('') +
        enemies.map(function (x) { return '<div class="bad">😠 Dislikes ' + esc(x.name) + '</div>'; }).join('') + '</div></div>';
    }
    h += '<div class="row-actions">' +
      '<button class="btn" data-a="raise" data-v="' + e.id + '">Raise 10%</button>' +
      '<button class="btn" data-a="bonus" data-v="' + e.id + '">Bonus ' + U.short(e.salary * 2) + '</button>' +
      (e.role === 'mgr' ? '<button class="btn" data-a="demote" data-v="' + e.id + '">Demote</button>' :
        e.level < 3 ? '<button class="btn" data-a="promote" data-v="' + e.id + '">Promote</button>' : '<button class="btn" disabled>Top level</button>') +
      (e.role !== 'mgr' ? '<button class="btn" data-a="makemgr" data-v="' + e.id + '">Make manager</button>' : '<span></span>') +
      '</div>';
    if (e.role !== 'mgr' && e.level > 1) h += '<button class="btn ghost block" style="margin-top:8px" data-a="demote" data-v="' + e.id + '">Demote</button>';
    h += sh.confirmFire
      ? '<div class="confirm-box"><span>Fire ' + esc(e.name) + '? You pay one week of severance (<span class="num">' + M(e.salary) + '</span>) and their friends will be upset.</span><div class="row-actions"><button class="btn" data-a="fire" data-v="0">Keep them</button><button class="btn danger" data-a="fire" data-v="' + e.id + '">Fire</button></div></div>'
      : '<button class="btn danger block" style="margin-top:8px" data-a="askfire">Fire</button>';
    return h + '<button class="btn ghost block" style="margin-top:8px" data-a="close">Done</button>';
  }

  function confirmSheet() {
    var w = S.sheet.what;
    var txt = w === 'newgame' ? ['Start over?', 'Your current company will be recorded in your history and you start fresh. Past companies give you a small cash bonus.']
      : ['Declare bankruptcy?', 'The company closes for good. You keep the experience for your next company.'];
    return '<div class="grab"></div><h2>' + txt[0] + '</h2><p class="event-text">' + txt[1] + '</p><div class="row-actions"><button class="btn" data-a="close">Cancel</button><button class="btn danger" data-a="doconfirm">' + (w === 'newgame' ? 'Start over' : 'Declare bankruptcy') + '</button></div>';
  }

  function overScreen() {
    var g = S.g;
    return '<div class="wrap gameover"><div class="big">📉</div><h1>' + esc(g.company.name) + ' is bankrupt</h1>' +
      '<p class="muted">After ' + g.week + ' weeks, the doors are closed. Every founder has one of these.</p>' +
      '<div class="card" style="text-align:left;margin:20px 0"><table class="ledger">' +
      '<tr><td>Weeks in business</td><td>' + g.week + '</td></tr><tr><td>Peak cash</td><td>' + M(g.stats.peakCash) + '</td></tr>' +
      '<tr><td>Most employees</td><td>' + g.stats.maxStaff + '</td></tr><tr><td>Total revenue</td><td>' + M(g.stats.revenue) + '</td></tr>' +
      '<tr><td>Decisions made</td><td>' + g.stats.decisions + '</td></tr></table></div>' +
      '<p class="muted" style="font-size:14px">Your next company starts with extra cash and reputation from what you learned.</p>' +
      '<button class="btn primary block" data-a="restart">Start a new company</button></div>';
  }

  // ---------- render ----------

  function render() {
    var g = S.g;
    if (S.screen === 'game' && g && g.over && !S.sheet) S.screen = 'over';
    $app.innerHTML = S.screen === 'title' ? titleScreen() : S.screen === 'create' ? createScreen() : S.screen === 'over' ? overScreen() : gameScreen();
    renderSheet();
  }

  function renderSheet() {
    var html = null, sh = S.sheet;
    if (sh) {
      if (sh.type === 'week') html = weekSheet(sh.report);
      else if (sh.type === 'event') html = eventSheet();
      else if (sh.type === 'emp' || sh.type === 'cand') html = empSheet();
      else if (sh.type === 'confirm') html = confirmSheet();
      if (html == null) S.sheet = null;
    }
    $sheet.innerHTML = html ? '<div class="scrim" data-a="scrim"><div class="sheet" role="dialog" aria-modal="true">' + html + '</div></div>' : '';
    document.body.style.overflow = html ? 'hidden' : '';
  }

  function toast(msg) {
    $toast.innerHTML = '<div class="toast" role="status">' + esc(msg) + '</div>';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $toast.innerHTML = ''; }, 2600);
  }

  function endCompany(reason) {
    var g = S.g;
    if (!g.legacyDone) { G.recordLegacy(g, reason); g.legacyDone = true; }
    G.clearSave();
  }

  // ---------- actions ----------

  var A = {
    new: function () { S.create.step = 0; S.screen = 'create'; },
    continue: function () { S.g = G.load(); S.screen = 'game'; S.tab = 'home'; if (S.g && S.g.queue.length) S.sheet = { type: 'event' }; },
    logo: function (v) { S.create.logo = v; },
    color: function (v) { S.create.color = v; },
    tier: function (v) { S.create.tier = v; S.create.industry = CS.INDUSTRIES.find(function (i) { return i.tier === v; }).id; },
    industry: function (v) { S.create.industry = v; },
    city: function (v) { S.create.city = v; },
    funding: function (v) { S.create.funding = v; },
    cnext: function () {
      if (S.create.step === 0 && !S.create.name.trim()) { toast('Give your company a name first.'); var el = document.getElementById('cname'); if (el) el.focus(); return false; }
      S.create.step++; window.scrollTo(0, 0);
    },
    cback: function () { if (S.create.step === 0) S.screen = 'title'; else S.create.step--; window.scrollTo(0, 0); },
    start: function () {
      var c = S.create;
      S.g = G.newGame({ name: c.name.trim(), logo: c.logo, color: c.color, industry: c.industry, city: c.city, funding: c.funding });
      S.screen = 'game'; S.tab = 'home'; window.scrollTo(0, 0);
    },
    tab: function (v) { S.tab = v; S.sheet = null; window.scrollTo(0, 0); },
    next: function () {
      var r = G.nextWeek(S.g);
      if (r) S.sheet = { type: 'week', report: r };
    },
    events: function () { S.sheet = { type: 'event' }; },
    cont: function () {
      var g = S.g;
      if (G.currentEvent(g)) S.sheet = { type: 'event' };
      else { S.sheet = null; if (g.over) { endCompany('Bankrupt'); S.screen = 'over'; } }
    },
    choose: function (v) {
      var g = S.g, x = G.currentEvent(g); if (!x) return;
      var def = CS.EV[x.id];
      var done = { cat: def.cat, icon: def.icon, title: G.render(def.title, g, x.ctx) };
      var res = G.choose(g, +v);
      S.sheet = { type: 'event', result: res, done: done };
    },
    price: function (v) { S.g.price = +v; G.save(S.g); },
    ad: function (v) { var c = G.advertise(S.g, v); G.save(S.g); toast('Ad campaign launched for ' + M(c) + '.'); },
    emp: function (v) { S.sheet = { type: 'emp', id: +v }; },
    cand: function (v) { S.sheet = { type: 'cand', id: +v }; },
    hire: function (v) { var g = S.g; var c = g.candidates.find(function (x) { return x.id === +v; }); G.hire(g, +v); after(); toast(c ? c.name + ' joins the team.' : 'Hired.'); S.sheet = null; },
    raise: function (v) { var e = G.emp(S.g, +v); G.raise(S.g, e, 0.1); G.clampAll(S.g); after(); toast(e.name + ' got a 10% raise.'); },
    bonus: function (v) { var e = G.emp(S.g, +v); var a = G.bonus(S.g, e); G.clampAll(S.g); after(); toast('Paid ' + e.name + ' a ' + M(a) + ' bonus.'); },
    promote: function (v) { G.promote(S.g, G.emp(S.g, +v)); G.clampAll(S.g); after(); },
    makemgr: function (v) { G.promote(S.g, G.emp(S.g, +v), true); G.clampAll(S.g); after(); },
    demote: function (v) { G.demote(S.g, G.emp(S.g, +v)); G.clampAll(S.g); after(); },
    askfire: function () { S.sheet.confirmFire = true; },
    fire: function (v) {
      if (+v === 0) { S.sheet.confirmFire = false; return; }
      var e = G.emp(S.g, +v); G.removeEmp(S.g, e, 'fired'); G.clampAll(S.g); after(); S.sheet = null; toast(e.name + ' was let go.');
    },
    close: function () { S.sheet = null; },
    scrim: function () { if (S.sheet && (S.sheet.type === 'emp' || S.sheet.type === 'cand' || S.sheet.type === 'confirm')) S.sheet = null; else return false; },
    loan: function (v) { var o = G.loanOffers(S.g)[+v]; if (!o || !o.ok) return; G.addLoan(S.g, o.amount, o.apr, o.weeks); after(); toast('Borrowed ' + M(o.amount) + '.'); },
    repay: function (v) { if (G.repayLoan(S.g, +v)) { after(); toast('Loan paid off.'); } },
    stake: function (v) { var a = G.sellStake(S.g, +v); if (a) { after(); toast('Investors paid ' + M(a) + '.'); } },
    confirm: function (v) { S.sheet = { type: 'confirm', what: v }; },
    doconfirm: function () {
      var g = S.g;
      if (S.sheet.what === 'newgame') { endCompany('Closed by founder'); S.g = null; S.sheet = null; S.screen = 'title'; }
      else { g.over = { reason: 'bankrupt', week: g.week }; G.checkAchievements(g); endCompany('Declared bankruptcy'); S.sheet = null; S.screen = 'over'; }
    },
    restart: function () { S.g = null; S.screen = 'create'; S.create.step = 0; S.create.name = ''; window.scrollTo(0, 0); }
  };

  function after() {
    var un = G.checkAchievements(S.g);
    G.save(S.g);
    if (un.length) setTimeout(function () { toast('🏆 ' + un.map(function (a) { return a.name; }).join(', ')); }, 900);
  }

  function onClick(ev) {
    var el = ev.target.closest('[data-a]');
    if (!el) return;
    if (el.dataset.a === 'scrim' && ev.target !== el) return; // clicks inside the sheet
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
