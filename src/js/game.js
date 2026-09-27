// Game engine: company state, weekly simulation, staff, loans, events, saves.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var U = CS.U;
  var G = CS.G = {};
  var SAVE_KEY = 'companysim_save_v1';
  var LEGACY_KEY = 'companysim_legacy_v1';
  var MAX_DECISIONS = 3;

  function store() { try { return globalThis.localStorage || null; } catch (e) { return null; } }

  // ---------- creation ----------

  G.rivalName = function () { return U.pick(CS.RIVAL_A) + ' ' + U.pick(CS.RIVAL_B); };

  G.newGame = function (o) {
    var ind = CS.IND[o.industry], tier = CS.TIERS[ind.tier], city = CS.CITIES[o.city], fund = CS.FUNDING[o.funding];
    var legacy = G.loadLegacy();
    var runs = legacy.companies.length;
    var comp = tier.comp;
    var weight = comp.front + comp.sales + comp.acct * 1.1 + comp.mgr * 1.6;
    var demand = tier.rv / ind.t;
    var g = {
      v: 1,
      company: { name: o.name, logo: o.logo, color: o.color, industry: ind.id, city: o.city, funding: o.funding },
      eco: {
        demand: demand, ticket: ind.t, supply: ind.s,
        rent: tier.rv * Math.max(0.05, 1 - ind.s - ind.l - 0.14),
        wage: tier.rv * ind.l / weight,
        cap: demand * city.demand * 1.25 / comp.front
      },
      week: 0, cash: 0, reputation: Math.min(70, 50 + runs * 2), satisfaction: 60, awareness: 0,
      price: 1, priceIndex: 1, ownership: 100 * fund.own * (tier.startOwnership || 1),
      employees: [], nextId: 1, candidates: [], loans: [], history: [], news: [], pending: [], queue: [],
      mods: [], rel: {}, dating: {}, cooldowns: {}, flags: { equip: 1 }, formers: [],
      stats: { decisions: 0, fired: 0, revenue: 0, peakCash: 0, fullStreak: 0, maxStaff: 0, bigWeeks: 0 },
      achievements: {}, economy: { state: 'normal', weeks: U.ri(15, 30) },
      rivals: [G.rivalName(), G.rivalName(), G.rivalName()],
      negWeeks: 0, over: null, last: null
    };
    g.cash = tier.cash * fund.cash * (1 + Math.min(0.5, runs * 0.05));
    if (fund.loan) G.addLoan(g, tier.cash * fund.loan, 0.07, 104, true);
    if (tier.startDebt) G.addLoan(g, tier.cash * tier.startDebt, 0.09, 156, true);
    var add = function (role, n) { for (var i = 0; i < n; i++) g.employees.push(G.makeEmployee(g, role, { hired: true })); };
    add('front', comp.front); add('sales', comp.sales); add('acct', comp.acct); add('mgr', comp.mgr);
    G.refreshCandidates(g);
    G.news(g, o.name + ' opens its doors in ' + city.name + '.', 'good');
    if (runs) G.news(g, 'Your experience from ' + runs + ' earlier compan' + (runs > 1 ? 'ies' : 'y') + ' gives you a head start.', 'neutral');
    G.save(g);
    return g;
  };

  // ---------- employees ----------

  G.market = function (g, role, level) {
    var city = CS.CITIES[g.company.city];
    return g.eco.wage * CS.ROLES[role].mult * city.wage * [1, 1.15, 1.3][(level || 1) - 1] * g.priceIndex;
  };

  G.title = function (g, e) {
    var base = e.role === 'front' ? CS.IND[g.company.industry].front : CS.ROLES[e.role].label;
    return CS.LEVELS[e.level - 1] + base;
  };

  function rollTraits() {
    var keys = Object.keys(CS.TRAITS), a = U.pick(keys), b;
    do { b = U.pick(keys); } while (b === a || CS.TRAIT_CLASH[a] === b);
    return [a, b];
  }

  G.makeEmployee = function (g, role, opts) {
    opts = opts || {};
    var traits = rollTraits();
    var skill = opts.skill != null ? opts.skill : U.ri(opts.hired ? 40 : 20, opts.hired ? 62 : 88);
    var e = {
      id: g.nextId++,
      name: U.pick(CS.FIRST) + ' ' + U.pick(CS.LAST),
      age: U.ri(19, 58), role: role, level: 1,
      skill: skill, morale: U.ri(58, 75), loyalty: U.ri(40, 65), reliability: U.ri(60, 85),
      traits: traits, weeks: opts.hired ? U.ri(4, 40) : 0, hue: U.ri(0, 359)
    };
    if (G.has(e, 'reliable')) e.reliability = Math.min(99, e.reliability + 15);
    if (G.has(e, 'unreliable')) e.reliability -= 30;
    if (G.has(e, 'loyal')) e.loyalty += 20;
    var ask = 0.8 + skill / 250;
    if (G.has(e, 'greedy')) ask *= 1.15;
    e.salary = Math.round(G.market(g, role, 1) * ask);
    return e;
  };

  G.has = function (e, t) { return e.traits.indexOf(t) >= 0; };
  G.emp = function (g, id) { for (var i = 0; i < g.employees.length; i++) if (g.employees[i].id === id) return g.employees[i]; return null; };
  G.traitKnown = function (e, i) { return i === 0 || e.weeks >= 4; };

  G.productivity = function (e) {
    var p = (0.5 + e.skill / 100) * (0.7 + 0.3 * e.morale / 100) * [1, 1.15, 1.3][e.level - 1];
    if (G.has(e, 'hardworking')) p *= 1.15;
    if (G.has(e, 'lazy')) p *= 0.85;
    if (G.has(e, 'serious')) p *= 1.05;
    return p;
  };

  G.refreshCandidates = function (g) {
    var n = Math.min(6, 3 + Math.floor(g.reputation / 35));
    g.candidates = [];
    for (var i = 0; i < n; i++) {
      var role = U.weighted(['front', 'sales', 'acct', 'mgr'], function (r) { return { front: 55, sales: 20, acct: 10, mgr: 15 }[r]; });
      g.candidates.push(G.makeEmployee(g, role));
    }
  };

  G.hire = function (g, id) {
    var c = g.candidates.find(function (x) { return x.id === id; });
    if (!c) return;
    g.candidates = g.candidates.filter(function (x) { return x.id !== id; });
    g.cash -= c.salary; // recruiting fee: one week of pay
    g.employees.push(c);
    g.flags.hired = true;
    G.news(g, 'Hired ' + c.name + ' as ' + G.title(g, c) + '.', 'neutral');
  };

  // Removes an employee. reason: 'fired' | 'quit'.
  G.removeEmp = function (g, e, reason, silent) {
    g.employees = g.employees.filter(function (x) { return x.id !== e.id; });
    g.formers.unshift({ id: e.id, name: e.name, creative: G.has(e, 'creative'), role: e.role });
    g.formers = g.formers.slice(0, 20);
    G.friendsOf(g, e).forEach(function (f) { f.morale -= 8; });
    if (reason === 'fired') {
      g.stats.fired++;
      g.cash -= e.salary; // severance
      g.employees.forEach(function (x) { x.morale -= 2; });
    }
    if (!silent) G.news(g, e.name + (reason === 'fired' ? ' was let go.' : ' left the company.'), 'bad');
  };

  G.raise = function (g, e, pct) {
    e.salary = Math.round(e.salary * (1 + pct));
    e.morale += pct * 150; e.loyalty += pct * 100;
  };
  G.bonus = function (g, e) {
    var amt = e.salary * 2;
    g.cash -= amt; e.morale += 12; e.loyalty += 4;
    return amt;
  };
  G.promote = function (g, e, toManager) {
    if (toManager) { e.role = 'mgr'; e.level = 1; }
    else e.level = Math.min(3, e.level + 1);
    e.salary = Math.max(Math.round(e.salary * 1.15), Math.round(G.market(g, e.role, e.level)));
    e.morale += 20; e.loyalty += 10;
    G.news(g, e.name + ' was promoted to ' + G.title(g, e) + '.', 'good');
    // A jealous colleague may react.
    var rivals = g.employees.filter(function (x) { return x.id !== e.id && (G.has(x, 'ambitious') || G.has(x, 'greedy')); });
    if (rivals.length && U.chance(0.4)) G.schedule(g, 'jealous', U.ri(1, 3), { a: U.pick(rivals).id, b: e.id });
  };
  G.demote = function (g, e) {
    if (e.role === 'mgr') { e.role = 'front'; e.level = 2; }
    else e.level = Math.max(1, e.level - 1);
    e.salary = Math.round(e.salary * 0.88);
    e.morale -= 25; e.loyalty -= 15;
    G.news(g, e.name + ' was demoted to ' + G.title(g, e) + '.', 'bad');
  };

  // ---------- relationships ----------

  function rk(a, b) { return a < b ? a + '-' + b : b + '-' + a; }
  G.relKey = rk;
  G.getRel = function (g, a, b) { return g.rel[rk(a, b)] || 0; };
  G.addRel = function (g, a, b, d) { var k = rk(a, b); g.rel[k] = U.clamp((g.rel[k] || 0) + d, -100, 100); };
  G.friendsOf = function (g, e) { return g.employees.filter(function (x) { return x.id !== e.id && G.getRel(g, e.id, x.id) >= 40; }); };
  G.enemiesOf = function (g, e) { return g.employees.filter(function (x) { return x.id !== e.id && G.getRel(g, e.id, x.id) <= -40; }); };
  G.partnerOf = function (g, e) { return g.employees.find(function (x) { return g.dating[rk(e.id, x.id)]; }) || null; };

  // ---------- money ----------

  G.scale = function (g) {
    var h = g.history.slice(-4);
    var tierRv = CS.TIERS[CS.IND[g.company.industry].tier].rv;
    if (!h.length) return tierRv;
    var avg = h.reduce(function (s, x) { return s + x.revenue; }, 0) / h.length;
    return Math.max(tierRv * 0.5, avg);
  };
  // A cost as a fraction of normal weekly revenue, rounded to a readable price.
  G.cost = function (g, frac) { return U.nice(G.scale(g) * frac * 0.45); };

  G.addLoan = function (g, amount, apr, weeks, silent) {
    var r = apr / 52;
    var pay = amount * r / (1 - Math.pow(1 + r, -weeks));
    g.loans.push({ id: g.nextId++, principal: amount, balance: amount, rate: r, payment: pay, weeks: weeks, apr: apr });
    g.cash += amount;
    if (!silent) G.news(g, 'Took a ' + U.money(amount) + ' loan at ' + (apr * 100).toFixed(1) + '% APR.', 'neutral');
  };
  G.debt = function (g) { return g.loans.reduce(function (s, l) { return s + l.balance; }, 0); };
  G.loanOffers = function (g) {
    var s = G.scale(g), debt = G.debt(g);
    var apr = 0.06 + Math.max(0, (60 - g.reputation)) / 400 + Math.min(0.1, debt / (s * 200));
    if (g.cash < 0) apr += 0.04;
    var room = s * 60 - debt;
    return [{ amount: s * 4, weeks: 26 }, { amount: s * 12, weeks: 52 }, { amount: s * 30, weeks: 104 }]
      .map(function (o) { return { amount: U.nice(o.amount), weeks: o.weeks, apr: apr + o.weeks / 5200, ok: U.nice(o.amount) <= room }; });
  };
  G.repayLoan = function (g, id) {
    var l = g.loans.find(function (x) { return x.id === id; });
    if (!l || g.cash < l.balance) return false;
    g.cash -= l.balance;
    g.loans = g.loans.filter(function (x) { return x.id !== id; });
    g.flags.debtfree = true;
    G.news(g, 'Paid off a loan early.', 'good');
    return true;
  };

  G.valuation = function (g) {
    var h = g.history.slice(-8);
    var profit = h.length ? h.reduce(function (s, x) { return s + x.profit; }, 0) / h.length : 0;
    var v = G.scale(g) * 52 * 0.9 + Math.max(0, profit) * 52 * 3 + g.cash - G.debt(g) + g.reputation * G.scale(g) * 0.4;
    return Math.max(G.scale(g) * 10, v);
  };
  G.stakeOffer = function (g, pct) {
    return U.nice(G.valuation(g) * pct / 100 * (g.cash < 0 ? 0.7 : 0.9));
  };
  G.sellStake = function (g, pct) {
    if (g.ownership - pct < 10) return 0;
    var amt = G.stakeOffer(g, pct);
    g.ownership -= pct; g.cash += amt;
    G.news(g, 'Sold ' + pct + '% of the company to investors for ' + U.money(amt) + '.', 'neutral');
    return amt;
  };

  G.ads = [
    { id: 'flyers', name: 'Local flyers', frac: 0.25, aw: 6, weeks: 1 },
    { id: 'online', name: 'Online ads', frac: 0.9, aw: 20, weeks: 1 }
  ];
  G.advertise = function (g, id) {
    var ad = G.ads.find(function (a) { return a.id === id; });
    var cost = G.cost(g, ad.frac);
    g.cash -= cost;
    g.awareness = Math.min(G.awCap(g), g.awareness + ad.aw * U.rand(0.7, 1.3));
    g.adsThisWeek = (g.adsThisWeek || 0) + 1;
    G.news(g, 'Ran ' + ad.name.toLowerCase() + ' for ' + U.money(cost) + '.', 'neutral');
    return cost;
  };
  G.awCap = function (g) { return 300; };

  // ---------- modifiers ----------
  // Temporary effects on the business: { type, value, weeks, label }.
  G.mod = function (g, type, value, weeks, label) { g.mods.push({ type: type, value: value, weeks: weeks, label: label }); };
  function modTotals(g) {
    var t = { demand: 1, capacity: 1, closed: false, supply: 0, extra: 0 };
    g.mods.forEach(function (m) {
      if (m.type === 'demand') t.demand *= m.value;
      else if (m.type === 'capacity') t.capacity *= m.value;
      else if (m.type === 'closed') t.closed = true;
      else if (m.type === 'supply') t.supply += m.value;
      else if (m.type === 'extra') t.extra += m.value;
    });
    return t;
  }

  // ---------- the weekly simulation ----------

  G.compute = function (g, preview) {
    var city = CS.CITIES[g.company.city], econ = CS.ECON[g.economy.state], m = modTotals(g);
    var emps = g.employees;
    var front = emps.filter(function (e) { return e.role === 'front'; });
    var sales = emps.filter(function (e) { return e.role === 'sales'; });
    var acct = emps.filter(function (e) { return e.role === 'acct'; });
    var mgrs = emps.filter(function (e) { return e.role === 'mgr'; });
    var covered = emps.length <= 5 || mgrs.length * 8 >= emps.length - mgrs.length;
    var cap = 0;
    front.forEach(function (e) {
      var absent = !preview && U.chance((100 - e.reliability) / 400);
      if (!absent) cap += g.eco.cap * G.productivity(e);
    });
    cap *= m.capacity * g.flags.equip * (covered ? 1.05 : 0.9);
    var salesBoost = Math.min(0.45, sales.reduce(function (s, e) { return s + 0.07 * G.productivity(e); }, 0));
    var demand = g.eco.demand * city.demand * (0.5 + g.reputation / 100) * (1 + g.awareness / 100) *
      [1.25, 1, 0.75][g.price] * (1 + salesBoost) * econ.demand * m.demand * (preview ? 1 : U.rand(0.92, 1.08));
    var served = m.closed ? 0 : Math.min(demand, cap);
    var ticket = g.eco.ticket * city.ticket * [0.8, 1, 1.3][g.price] * g.priceIndex;
    var sales$ = served * ticket;
    var acctCut = Math.min(0.05, acct.reduce(function (s, e) { return s + 0.015 * (0.5 + e.skill / 100); }, 0));
    var supplyRate = Math.max(0.03, g.eco.supply + m.supply + econ.supply - acctCut);
    var supplies = sales$ * supplyRate;
    var wages = emps.reduce(function (s, e) { return s + e.salary; }, 0);
    var rent = g.eco.rent * city.rent * g.priceIndex;
    var loans = g.loans.reduce(function (s, l) { return s + Math.min(l.payment, l.balance * (1 + l.rate)); }, 0);
    var revenue = sales$ + m.extra;
    var profit = revenue - supplies - wages - rent;
    return {
      demand: demand, capacity: cap, served: served, revenue: revenue, supplies: supplies, wages: wages,
      rent: rent, loans: loans, profit: profit, net: profit - loans, closed: m.closed, covered: covered, extra: m.extra
    };
  };

  G.nextWeek = function (g) {
    if (g.queue.length || g.over) return null;
    g.week++;
    var minor = [];
    var econMsg = stepEconomy(g);
    if (econMsg) minor.push(econMsg);

    var f = G.compute(g, false);
    // Loans
    g.loans.forEach(function (l) {
      var interest = l.balance * l.rate;
      var pay = Math.min(l.payment, l.balance + interest);
      l.balance = l.balance + interest - pay;
    });
    var paid = g.loans.filter(function (l) { return l.balance < 1; });
    if (paid.length) { g.flags.debtfree = true; minor.push('🏦 You made the final payment on a loan.'); }
    g.loans = g.loans.filter(function (l) { return l.balance >= 1; });

    g.cash += f.net;
    g.stats.revenue += f.revenue;
    g.history.push({ week: g.week, revenue: f.revenue, profit: f.profit, net: f.net, cash: g.cash, served: f.served, demand: f.demand, capacity: f.capacity });
    if (g.history.length > 260) g.history.shift();
    g.stats.fullStreak = f.served >= f.demand * 0.999 && !f.closed ? g.stats.fullStreak + 1 : 0;

    stepCustomers(g, f);
    stepStaff(g, f, minor);

    g.mods.forEach(function (m) { m.weeks--; });
    g.mods = g.mods.filter(function (m) { return m.weeks > 0; });
    g.adsThisWeek = 0;

    var events = rollEvents(g, minor);
    G.refreshCandidates(g);

    // Cash crisis tracking
    if (g.cash < 0) {
      g.negWeeks++;
      if (g.negWeeks === 1) minor.push('⚠️ You are out of cash. Fix it within 8 weeks or the company goes bankrupt.');
    } else g.negWeeks = 0;
    if (g.negWeeks >= 8 || g.cash < -G.scale(g) * 25) {
      g.over = { reason: 'bankrupt', week: g.week };
    }

    g.stats.maxStaff = Math.max(g.stats.maxStaff, g.employees.length);
    g.stats.peakCash = Math.max(g.stats.peakCash, g.cash);
    var unlocked = G.checkAchievements(g);
    g.last = { week: g.week, fin: f, minor: minor, count: events, unlocked: unlocked };
    G.save(g);
    return g.last;
  };

  function stepEconomy(g) {
    if (g.economy.state === 'inflation') g.priceIndex *= 1.003;
    if (--g.economy.weeks > 0) return null;
    var prev = g.economy.state, next;
    if (prev === 'normal') next = U.weighted(['boom', 'recession', 'inflation', 'normal'], function (s) { return { boom: 35, recession: 28, inflation: 22, normal: 15 }[s]; });
    else next = U.chance(0.8) ? 'normal' : U.pick(['boom', 'recession', 'inflation'].filter(function (s) { return s !== prev; }));
    if (prev === 'recession' && next !== 'recession') g.flags.survivedRecession = true;
    g.economy = { state: next, weeks: U.ri(12, 36) };
    if (next === prev) return null;
    var msg = { normal: 'The economy has stabilized.', boom: 'The economy is booming. Customers are spending.', recession: 'A recession has hit. Customers are cutting back.', inflation: 'Inflation is rising. Costs are going up.' }[next];
    G.news(g, msg, CS.ECON[next].tone === 'good' ? 'good' : CS.ECON[next].tone === 'bad' ? 'bad' : 'neutral');
    return '📉 ' + msg;
  }

  function stepCustomers(g, f) {
    var front = g.employees.filter(function (e) { return e.role === 'front'; });
    var quality = front.length ? front.reduce(function (s, e) { return s + e.skill; }, 0) / front.length : 30;
    var morale = G.avgMorale(g);
    var ratio = f.demand > 0 ? f.capacity / f.demand : 1;
    var target = 48 + (quality - 50) * 0.4 + (morale - 50) * 0.2 + [8, 0, -8][g.price] +
      (g.price === 2 ? (quality - 55) * 0.4 : 0) + (ratio < 1 ? -40 * (1 - ratio) : 6);
    if (f.closed) target -= 15;
    g.satisfaction = U.clamp(g.satisfaction + (target - g.satisfaction) * 0.3, 0, 100);
    g.reputation = U.clamp(g.reputation + (g.satisfaction - g.reputation) * 0.06, 0, 100);
    g.awareness = U.clamp(g.awareness * 0.99 + (g.satisfaction - 55) / 14, 0, G.awCap(g));
  }

  G.avgMorale = function (g) {
    if (!g.employees.length) return 50;
    return g.employees.reduce(function (s, e) { return s + e.morale; }, 0) / g.employees.length;
  };

  function stepStaff(g, f, minor) {
    var emps = g.employees;
    var funny = emps.filter(function (e) { return G.has(e, 'funny') || G.has(e, 'friendly'); }).length;
    var overwork = f.capacity > 0 && f.demand / f.capacity > 1.25;
    emps.forEach(function (e) {
      e.weeks++;
      var grow = e.skill < 60 ? 0.35 : e.skill < 80 ? 0.18 : 0.06;
      if (G.has(e, 'ambitious')) grow *= 1.8;
      if (G.has(e, 'lazy')) grow *= 0.5;
      e.skill = Math.min(100, e.skill + grow);
      var pay = U.clamp((e.salary / G.market(g, e.role, e.level) - 1) * 100, -25, 25);
      var target = 62 + pay + Math.min(8, funny * 1.5) + (f.covered ? 0 : -12) + (overwork && e.role === 'front' ? -10 : 0) +
        G.friendsOf(g, e).length * 3 - G.enemiesOf(g, e).length * 6 + (G.partnerOf(g, e) ? 5 : 0);
      if (G.has(e, 'serious')) target -= 2;
      e.morale += (target - e.morale) * 0.2;
      e.loyalty += e.morale > 60 ? 0.25 : e.morale < 35 ? -0.6 : 0;
      clampEmp(e);
    });
    // Relationships drift between random pairs.
    var pairs = Math.min(4, Math.floor(emps.length / 2));
    for (var i = 0; i < pairs; i++) {
      var a = U.pick(emps), b = U.pick(emps);
      if (!a || !b || a === b) continue;
      var d = U.rand(-3, 6), both = [a, b];
      both.forEach(function (x) {
        if (G.has(x, 'friendly')) d += 3;
        if (G.has(x, 'funny')) d += 2;
        if (G.has(x, 'aggressive')) d -= 6;
        if (G.has(x, 'greedy')) d -= 1;
      });
      var before = G.getRel(g, a.id, b.id);
      G.addRel(g, a.id, b.id, d);
      var after = G.getRel(g, a.id, b.id);
      if (before < 40 && after >= 40) minor.push('🤝 ' + a.name + ' and ' + b.name + ' have become friends.');
      if (before > -40 && after <= -40) minor.push('😠 ' + a.name + ' and ' + b.name + ' can no longer stand each other.');
    }
    // Very unhappy people may decide to leave.
    emps.forEach(function (e) {
      if (e.morale < 22 && U.chance(0.25 * (1 - e.loyalty / 120)) && !g.pending.some(function (p) { return p.id === 'resign' && p.ctx.a === e.id; })) {
        G.schedule(g, 'resign', 0, { a: e.id });
      }
    });
  }

  function clampEmp(e) {
    e.morale = U.clamp(e.morale, 0, 100);
    e.loyalty = U.clamp(e.loyalty, 0, 100);
    e.reliability = U.clamp(e.reliability, 5, 100);
    e.skill = U.clamp(e.skill, 1, 100);
  }
  G.clampAll = function (g) {
    g.employees.forEach(clampEmp);
    g.reputation = U.clamp(g.reputation, 0, 100);
    g.satisfaction = U.clamp(g.satisfaction, 0, 100);
    g.awareness = U.clamp(g.awareness, 0, G.awCap(g));
  };

  // ---------- events ----------

  G.schedule = function (g, id, delay, ctx) { g.pending.push({ id: id, due: g.week + delay, ctx: ctx || {} }); };

  G.news = function (g, text, tone) {
    g.news.unshift({ week: g.week, text: text, tone: tone || 'neutral' });
    if (g.news.length > 150) g.news.length = 150;
  };

  // How many things happen this week. Usually 0-2, occasionally a lot.
  function rollCount(g) {
    var r = Math.random(), n;
    if (r < 0.24) n = 0;
    else if (r < 0.56) n = 1;
    else if (r < 0.76) n = 2;
    else if (r < 0.88) n = 3;
    else if (r < 0.945) n = 4;
    else { n = 5; while (U.chance(0.35)) n++; }
    if (g.employees.length > 20 && U.chance(0.3)) n++;
    if (g.week <= 2) n = Math.min(n, 1);
    return n;
  }

  // Checks that every employee an event refers to still works here.
  function ctxValid(g, ctx) {
    return ['a', 'b', 'm'].every(function (k) { return ctx[k] == null || G.emp(g, ctx[k]); });
  }

  function rollEvents(g, minor) {
    var inst = [];
    var due = g.pending.filter(function (p) { return p.due <= g.week; });
    g.pending = g.pending.filter(function (p) { return p.due > g.week; });
    due.forEach(function (p) {
      var def = CS.EV[p.id];
      if (def && ctxValid(g, p.ctx) && (!def.cond || def.cond(g, p.ctx))) inst.push({ id: p.id, ctx: p.ctx, chain: true });
    });
    var n = rollCount(g), used = {};
    inst.forEach(function (x) { used[x.id] = 1; });
    for (var k = 0, tries = 0; k < n && tries < n * 4; tries++) {
      var def = U.weighted(CS.EVENTS, function (d) {
        if (d.chainOnly || used[d.id]) return 0;
        if ((g.cooldowns[d.id] || -99) > g.week) return 0;
        if (d.minWeek && g.week < d.minWeek) return 0;
        if (d.cond && !d.cond(g)) return 0;
        return typeof d.w === 'function' ? d.w(g) : (d.w || 1);
      });
      if (!def) break;
      var ctx = def.setup ? def.setup(g) : {};
      if (!ctx) { used[def.id] = 1; continue; }
      used[def.id] = 1;
      g.cooldowns[def.id] = g.week + (def.cd || 8);
      inst.push({ id: def.id, ctx: ctx });
      k++;
    }
    var total = inst.length;
    if (total >= 4) g.stats.bigWeeks++;
    if (total >= 5) g.flags.chaos = true;
    // Minor events resolve on their own. Only a few decisions per week reach the player;
    // the rest are handled by your staff using the event's default choice.
    var decisions = 0;
    inst.forEach(function (x) {
      var def = CS.EV[x.id];
      if (!ctxValid(g, x.ctx)) return; // an earlier event this week removed someone involved
      if (def.start) def.start(g, x.ctx);
      if (!def.choices) {
        var txt = def.fx(g, x.ctx);
        minor.push(def.icon + ' ' + (txt || G.render(def.text, g, x.ctx)));
        G.clampAll(g);
      } else if (decisions < MAX_DECISIONS) {
        decisions++;
        g.queue.push(x);
      } else {
        var c = def.choices[def.auto != null ? def.auto : def.choices.length - 1];
        var res = c.fx(g, x.ctx);
        G.clampAll(g);
        minor.push(def.icon + ' ' + G.render(def.title, g, x.ctx) + ' Your team handled it: ' + G.choiceLabel(g, x, c).toLowerCase() + '. ' + (res || ''));
      }
    });
    return total;
  }

  G.render = function (v, g, ctx) { return typeof v === 'function' ? v(g, ctx) : v; };

  G.currentEvent = function (g) {
    while (g.queue.length) {
      var x = g.queue[0];
      if (ctxValid(g, x.ctx)) return x;
      g.queue.shift(); // someone involved already left
    }
    return null;
  };

  G.choose = function (g, idx) {
    var x = G.currentEvent(g);
    if (!x) return null;
    var def = CS.EV[x.id], c = def.choices[idx];
    var result = c.fx(g, x.ctx) || '';
    g.queue.shift();
    g.stats.decisions++;
    G.clampAll(g);
    var unlocked = G.checkAchievements(g);
    G.save(g);
    return { text: result, unlocked: unlocked };
  };

  G.choiceCost = function (g, x, c) { return c.cost ? c.cost(g, x.ctx) : 0; };

  // ---------- achievements ----------

  G.checkAchievements = function (g) {
    var s = g.stats, n = g.employees.length, out = [];
    var test = {
      open: g.week >= 1, hire1: g.flags.hired, team10: n >= 10, team25: n >= 25, team50: n >= 50,
      cash100k: g.cash >= 1e5, cash1m: g.cash >= 1e6, cash10m: g.cash >= 1e7, cash1b: g.cash >= 1e9,
      year1: g.week >= 52, year5: g.week >= 260, rep90: g.reputation >= 90,
      events50: s.decisions >= 50, events250: s.decisions >= 250, chaos: g.flags.chaos,
      recession: g.flags.survivedRecession, debtfree: g.flags.debtfree, viral: g.flags.viral,
      lovebirds: Object.keys(g.dating).length > 0, toughboss: s.fired >= 10, fullhouse: s.fullStreak >= 10,
      bankrupt: !!g.over
    };
    CS.ACHIEVEMENTS.forEach(function (a) {
      if (!g.achievements[a.id] && test[a.id]) { g.achievements[a.id] = g.week || 1; out.push(a); }
    });
    return out;
  };

  // ---------- saves & legacy ----------

  G.save = function (g) { var s = store(); if (s) try { s.setItem(SAVE_KEY, JSON.stringify(g)); } catch (e) {} };
  G.load = function () {
    var s = store(); if (!s) return null;
    try { var g = JSON.parse(s.getItem(SAVE_KEY)); return g && g.v === 1 ? g : null; } catch (e) { return null; }
  };
  G.clearSave = function () { var s = store(); if (s) try { s.removeItem(SAVE_KEY); } catch (e) {} };
  G.loadLegacy = function () {
    var s = store(), d = null;
    if (s) try { d = JSON.parse(s.getItem(LEGACY_KEY)); } catch (e) {}
    return d && d.companies ? d : { companies: [] };
  };
  G.recordLegacy = function (g, reason) {
    var L = G.loadLegacy();
    L.companies.unshift({
      name: g.company.name, logo: g.company.logo, industry: g.company.industry, weeks: g.week,
      peakCash: g.stats.peakCash, staff: g.stats.maxStaff, reason: reason
    });
    L.companies = L.companies.slice(0, 30);
    var s = store(); if (s) try { s.setItem(LEGACY_KEY, JSON.stringify(L)); } catch (e) {}
  };
})();
