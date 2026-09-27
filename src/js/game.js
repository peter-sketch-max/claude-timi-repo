// Game engine: company state, weekly simulation, staff, money, events, progression, saves.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var U = CS.U;
  var G = CS.G = {};
  var KEYS = {
    main: 'companysim_save_v2', daily: 'companysim_daily_v2', legacy: 'companysim_legacy_v1',
    book: 'companysim_book_v1', settings: 'companysim_settings_v1', gift: 'companysim_gift_v1', best: 'companysim_dailybest_v1',
    share: 'companysim_share_v1', friendwar: 'companysim_friendwar_v1'
  };
  var MAX_DECISIONS = 3;
  var MINIGAMES = { boxes: 1, wheel: 1, tap: 1, post: 1, quiz: 1, deal: 1, vs: 1, interview: 1 };
  G.MINIGAMES = MINIGAMES;

  function store() { try { return globalThis.localStorage || null; } catch (e) { return null; } }
  function readJSON(k) { var s = store(); if (!s) return null; try { return JSON.parse(s.getItem(k)); } catch (e) { return null; } }
  function writeJSON(k, v) { var s = store(); if (s) try { s.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function removeKey(k) { var s = store(); if (s) try { s.removeItem(k); } catch (e) {} }

  // ---------- creation ----------

  G.rivalName = function () { return U.pick(CS.RIVAL_A) + ' ' + U.pick(CS.RIVAL_B); };
  G.rivalNames = function (n) {
    var out = [];
    for (var i = 0; out.length < n && i < 50; i++) { var r = G.rivalName(); if (out.indexOf(r) < 0) out.push(r); }
    return out;
  };
  G.randomName = function () { return U.pick(CS.NAME_A) + ' ' + U.pick(CS.NAME_B); };
  G.tierOf = function (g) { return CS.TIERS[CS.IND[g.company.industry].tier]; };

  G.newGame = function (o) {
    U.seed(o.seed != null ? o.seed : (Math.random() * 4294967296) >>> 0);
    var ind = CS.IND[o.industry], tier = CS.TIERS[ind.tier], city = CS.CITIES[o.city], fund = CS.FUNDING[o.funding];
    var runs = o.mode === 'daily' ? 0 : G.loadLegacy().companies.length;
    var comp = tier.comp;
    var weight = comp.front + comp.sales + comp.acct * 1.1 + comp.mgr * 1.6;
    var demand = tier.rv / ind.t;
    var g = {
      v: 2, mode: o.mode || 'main', dailyNum: o.dailyNum || 0,
      company: { name: o.name, logo: o.logo, color: o.color, industry: ind.id, city: o.city, funding: o.funding },
      eco: {
        demand: demand, ticket: ind.t, supply: ind.s,
        rent: tier.rv * Math.max(0.05, 1 - ind.s - ind.l - 0.14),
        wage: tier.rv * ind.l / weight,
        cap: demand * city.demand * 1.25 / comp.front
      },
      week: 0, cash: 0, reputation: Math.min(66, 50 + runs * 2), satisfaction: 60, awareness: 0,
      followers: 25 * tier.stars * tier.stars, price: 1, priceIndex: 1, rentMult: 1,
      ownership: 100 * fund.own * (tier.startOwnership || 1),
      employees: [], nextId: 1, candidates: [], loans: [], history: [], news: [], pending: [], queue: [],
      mods: [], rel: {}, dating: {}, cooldowns: {}, flags: { equip: 1 }, formers: [], upgrades: {},
      xp: 0, level: 1, missions: [], streak: 0, bestStreak: 0, posted: false, rank: 0,
      stats: { decisions: 0, fired: 0, revenue: 0, peakCash: 0, fullStreak: 0, maxStaff: 0, bigWeeks: 0, hires: 0, posts: 0,
        upgrades: 0, weeksPlayed: 0, minigames: 0, ads: 0, missionsDone: 0, quizRight: 0, vsWins: 0, virals: 0, powers: 0, golden: 0 },
      achievements: {}, economy: { state: 'normal', weeks: U.ri(15, 30) },
      rivals: G.rivalNames(3), rivalCos: null, cupMine: 0, cups: { gold: 0, silver: 0, bronze: 0 },
      powers: {}, golden: null, pet: null, avatar: o.avatar || '😎',
      negWeeks: 0, over: null, last: null, tips: 0
    };
    g.cash = tier.cash * fund.cash * (1 + Math.min(0.5, runs * 0.05));
    if (fund.loan) G.addLoan(g, tier.cash * fund.loan, 0.07, 104, true);
    if (tier.startDebt) G.addLoan(g, tier.cash * tier.startDebt, 0.09, 156, true);
    var add = function (role, n) { for (var i = 0; i < n; i++) g.employees.push(G.makeEmployee(g, role, { hired: true })); };
    add('front', comp.front); add('sales', comp.sales); add('acct', comp.acct); add('mgr', comp.mgr);
    G.refreshCandidates(g);
    G.makeRivals(g);
    G.fillMissions(g);
    g.rank = G.rankIndex(g);
    G.news(g, '🎉 ' + o.name + ' opens in ' + city.name + '!', 'good');
    if (runs) G.news(g, '🧠 You learned from ' + runs + ' old compan' + (runs > 1 ? 'ies' : 'y') + '. Bonus cash!', 'good');
    G.save(g);
    return g;
  };

  // The same company for everyone today.
  G.dailyInfo = function () {
    var today = U.today();
    var num = Math.floor((new Date(today + 'T00:00:00') - new Date('2026-01-01T00:00:00')) / 864e5) + 1;
    var seed = U.hash('company-sim-daily-' + today);
    var keep = U.state();
    U.seed(seed);
    var inds = CS.INDUSTRIES.filter(function (i) { return i.tier !== 'large'; });
    var info = {
      mode: 'daily', dailyNum: num, date: today, seed: U.hash('run-' + today),
      industry: U.pick(inds).id, city: U.pick(Object.keys(CS.CITIES)), logo: U.pick(CS.LOGOS),
      color: U.pick(CS.COLORS), name: G.randomName(), funding: 'savings'
    };
    U.seed(keep);
    return info;
  };
  G.DAILY_WEEKS = 52;

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

  var TONES = ['\u{1F3FB}', '\u{1F3FC}', '\u{1F3FD}', '\u{1F3FE}', '\u{1F3FF}'];
  function makeFace(age) {
    var base = U.pick(['👩', '👨', '🧑']), hair = U.pick(['', '‍🦱', '‍🦰', '']);
    if (age > 52) hair = '‍🦳';
    if (base === '🧑') hair = '';
    return base + U.pick(TONES) + hair;
  }

  G.makeEmployee = function (g, role, opts) {
    opts = opts || {};
    var traits = opts.traits || rollTraits();
    var skill = opts.skill != null ? opts.skill : U.ri(opts.hired ? 40 : 20, opts.hired ? 62 : 88);
    var age = opts.age || U.ri(19, 58);
    var e = {
      id: g.nextId++,
      name: opts.name || (U.pick(CS.FIRST) + ' ' + U.pick(CS.LAST)),
      face: opts.face || makeFace(age),
      age: age, role: role, level: 1,
      skill: skill, morale: U.ri(62, 78), loyalty: U.ri(40, 65), reliability: U.ri(60, 85),
      traits: traits, weeks: opts.hired ? U.ri(4, 40) : 0, hue: U.ri(0, 359)
    };
    if (G.has(e, 'reliable')) e.reliability = Math.min(99, e.reliability + 15);
    if (G.has(e, 'unreliable')) e.reliability -= 30;
    if (G.has(e, 'loyal')) e.loyalty += 20;
    var ask = 0.8 + skill / 250;
    if (G.has(e, 'greedy')) ask *= 1.15;
    e.salary = Math.round(G.market(g, role, 1) * ask * (opts.salaryMult || 1));
    return e;
  };

  G.has = function (e, t) { return e.traits.indexOf(t) >= 0; };
  G.emp = function (g, id) { for (var i = 0; i < g.employees.length; i++) if (g.employees[i].id === id) return g.employees[i]; return null; };
  G.traitKnown = function (e, i) { return i === 0 || e.weeks >= 4 || e.revealed; };
  G.first = function (e) { return e ? e.name.split(' ')[0] : 'Someone'; };
  G.moodFace = function (m) { return m >= 75 ? '😁' : m >= 58 ? '🙂' : m >= 42 ? '😐' : m >= 25 ? '😟' : '😡'; };

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
    if (!c) return null;
    g.candidates = g.candidates.filter(function (x) { return x.id !== id; });
    g.cash -= c.salary; // recruiting fee: one week of pay
    G.addEmployee(g, c);
    return c;
  };
  G.addEmployee = function (g, e) {
    g.employees.push(e);
    g.flags.hired = true;
    g.stats.hires++;
    G.news(g, '🤝 ' + e.name + ' joined as ' + G.title(g, e) + '.', 'good');
  };

  // reason: 'fired' | 'quit' | 'died'
  G.removeEmp = function (g, e, reason, silent) {
    if (!e) return;
    g.employees = g.employees.filter(function (x) { return x.id !== e.id; });
    g.formers.unshift({ id: e.id, name: e.name, creative: G.has(e, 'creative'), role: e.role });
    g.formers = g.formers.slice(0, 20);
    G.friendsOf(g, e).forEach(function (f) { f.morale -= 8; });
    if (reason === 'fired') {
      g.stats.fired++;
      g.cash -= e.salary; // one week severance
      g.employees.forEach(function (x) { x.morale -= 2; });
    }
    if (reason === 'died') {
      g.memorial = (g.memorial || []).concat([{ name: e.name, face: e.face, week: g.week }]).slice(-12);
      g.employees.forEach(function (x) { x.morale -= 5; });
    }
    if (!silent) G.news(g, reason === 'fired' ? '🚪 ' + e.name + ' was fired.' : reason === 'died' ? '🕊️ ' + e.name + ' passed away.' : '👋 ' + e.name + ' quit.', 'bad');
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
    G.news(g, '🎖️ ' + e.name + ' is now ' + G.title(g, e) + '!', 'good');
    var rivals = g.employees.filter(function (x) { return x.id !== e.id && (G.has(x, 'ambitious') || G.has(x, 'greedy')); });
    if (rivals.length && U.chance(0.4)) {
      var r = U.pick(rivals);
      G.schedule(g, 'jealous', U.ri(1, 3), { a: r.id, an: G.first(r), b: e.id, bn: G.first(e) });
    }
  };
  G.demote = function (g, e) {
    if (e.role === 'mgr') { e.role = 'front'; e.level = 2; }
    else e.level = Math.max(1, e.level - 1);
    e.salary = Math.round(e.salary * 0.88);
    e.morale -= 25; e.loyalty -= 15;
    G.news(g, '⬇️ ' + e.name + ' was moved down to ' + G.title(g, e) + '.', 'bad');
  };
  G.rename = function (g, id, name) {
    var e = G.emp(g, id); name = String(name || '').trim().slice(0, 24);
    if (e && name) e.name = name;
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
    var tierRv = G.tierOf(g).rv;
    if (!h.length) return tierRv;
    var avg = h.reduce(function (s, x) { return s + x.revenue; }, 0) / h.length;
    return Math.max(tierRv * 0.5, avg);
  };
  // An event price as a share of normal weekly sales, rounded to look like a real price.
  G.cost = function (g, frac) { return U.nice(G.scale(g) * frac * 0.55); };
  // Event prizes are a bit smaller than event costs so luck never replaces running the business.
  G.prize = function (g, frac) { return U.nice(G.scale(g) * frac * 0.35); };

  G.addLoan = function (g, amount, apr, weeks, silent) {
    var r = apr / 52;
    var pay = amount * r / (1 - Math.pow(1 + r, -weeks));
    g.loans.push({ id: g.nextId++, principal: amount, balance: amount, rate: r, payment: pay, weeks: weeks, apr: apr });
    g.cash += amount;
    if (!silent) G.news(g, '🏦 Borrowed ' + U.money(amount) + '.', 'neutral');
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
    G.news(g, '🕊️ Paid off a loan!', 'good');
    return true;
  };

  G.valuation = function (g) {
    var h = g.history.slice(-8);
    var profit = h.length ? h.reduce(function (s, x) { return s + x.profit; }, 0) / h.length : 0;
    var v = G.scale(g) * 52 * 0.9 + Math.max(0, profit) * 52 * 3 + g.cash - G.debt(g) + g.reputation * G.scale(g) * 0.4;
    return Math.max(G.scale(g) * 10, v);
  };
  G.stakeOffer = function (g, pct) { return U.nice(G.valuation(g) * pct / 100 * (g.cash < 0 ? 0.7 : 0.9)); };
  G.sellStake = function (g, pct) {
    if (g.ownership - pct < 10) return 0;
    var amt = G.stakeOffer(g, pct);
    g.ownership -= pct; g.cash += amt;
    G.news(g, '💼 Sold ' + pct + '% of the company for ' + U.money(amt) + '.', 'neutral');
    return amt;
  };

  G.rankIndex = function (g) {
    var v = G.valuation(g), i = 0;
    CS.RANKS.forEach(function (r, k) { if (v >= r.min) i = k; });
    return i;
  };

  // ---------- fans, ads, posts ----------

  G.awCap = function (g) { return 300 + G.upLevel(g, 'space') * 40; };
  // Followers grow toward a ceiling that rises with fame and every viral hit.
  G.fanCeiling = function (g) { return 5000 * [1, 4, 20][G.tierOf(g).stars - 1] * (1 + g.awareness / 25) * (1 + g.stats.virals * 0.3); };
  G.fanRoom = function (g) { return Math.max(0.02, 1 - g.followers / G.fanCeiling(g)); };
  // A viral hit adds a chunk of the follower ceiling, less as you get close to it.
  G.viralGain = function (g, views) { return Math.round(Math.min(views * U.rand(0.01, 0.02), G.fanCeiling(g) * 0.12) * Math.max(0.15, G.fanRoom(g))); };
  G.addFans = function (g, pts) {
    g.awareness = U.clamp(g.awareness + pts, 0, G.awCap(g));
    if (pts > 0) g.followers += Math.round(pts * (8 * G.tierOf(g).stars + g.followers * 0.002) * U.rand(0.8, 1.2) * G.fanRoom(g));
    else g.followers = Math.max(0, g.followers + Math.round(pts * 5));
  };

  G.adCost = function (g, ad) { return G.cost(g, ad.frac); };
  G.advertise = function (g, id) {
    var ad = CS.ADS.find(function (a) { return a.id === id; });
    if (!ad || g.level < ad.lvl) return 0;
    var cost = G.adCost(g, ad);
    g.cash -= cost;
    G.addFans(g, ad.fans * U.rand(0.7, 1.3));
    g.stats.ads++;
    G.addXP(g, 6);
    G.news(g, ad.emoji + ' Ran ' + ad.name.toLowerCase() + ' for ' + U.money(cost) + '.', 'neutral');
    return cost;
  };

  // ---------- free ads (Ads tab) ----------

  G.celebAd = function (id) { return CS.CELEB_ADS.find(function (a) { return a.id === id; }); };
  G.adFits = function (g, ad) { return ad.tags.some(function (t) { return CS.hasTag(g.company.industry, t); }); };
  // Chance to get into an ad: more followers and a better reputation help, and so does an ad that fits your business.
  G.adChance = function (g, ad) {
    var ratio = (g.followers + 10) / ad.need;
    var p = 0.5 * Math.pow(ratio, 0.55) * (0.7 + g.reputation / 166) + (G.adFits(g, ad) ? 0.15 : 0);
    return U.clamp(p, 0.03, 0.9);
  };
  G.adReadyIn = function (g, ad) { g.adCd = g.adCd || {}; return Math.max(0, (g.adCd[ad.id] || 0) - g.week); };
  G.adTriesMax = function () { return G.isVIP() ? 4 : 3; };
  G.adTriesLeft = function (g) {
    if (!g.adTries || g.adTries.week !== g.week) g.adTries = { week: g.week, used: 0 };
    return Math.max(0, G.adTriesMax() - g.adTries.used);
  };
  G.adsReady = function (g) { return Math.min(G.adTriesLeft(g), CS.CELEB_ADS.filter(function (a) { return G.adReadyIn(g, a) === 0 && G.adChance(g, a) >= 0.1; }).length); };
  G.tryAd = function (g, id) {
    var ad = G.celebAd(id);
    if (!ad || G.adReadyIn(g, ad) > 0 || G.adTriesLeft(g) < 1) return null;
    g.adTries.used++;
    var before = G.snap(g), p = G.adChance(g, ad), ok = U.chance(p), text;
    g.adCd[ad.id] = g.week + ad.cd;
    g.stats.adTries = (g.stats.adTries || 0) + 1;
    if (ok) {
      // Ad boosts don't stack: the new ad replaces the old one (you keep the bigger boost).
      var old = g.mods.filter(function (m) { return m.ad; }), best = 1 + ad.boost;
      old.forEach(function (m) { best = Math.max(best, m.value); });
      g.mods = g.mods.filter(function (m) { return !m.ad; });
      G.mod(g, 'demand', best, ad.weeks, ad.name);
      g.mods[g.mods.length - 1].ad = true;
      // Free ads bring followers, but only a little lasting awareness (paid ads are the way to build that).
      var pts = ad.fans * U.rand(0.8, 1.25);
      g.followers += Math.round(pts * (8 * G.tierOf(g).stars + g.followers * 0.002) * G.fanRoom(g));
      g.awareness = U.clamp(g.awareness + pts * 0.2, 0, G.awCap(g));
      g.reputation += ad.rep;
      g.stats.ads++;
      g.stats.celebAds = (g.stats.celebAds || 0) + 1;
      if (ad.id === 'queen') g.flags.queenAd = true;
      G.addXP(g, ad.xp);
      text = U.pick(['YES! You\'re in the ad with ' + ad.who + '! 🎉', ad.who + ' LOVES your company! You got the ad! 🤩', 'They picked YOU! ' + ad.who + ' says hi! 👋✨']);
      G.news(g, ad.emoji + ' Got the ' + ad.name + ' with ' + ad.who + '!', 'good');
    } else {
      var rv = U.pick(g.rivals);
      if (U.chance(0.35)) { G.rivalShift(g, rv, 0.03); text = 'Nope! They picked ' + rv + ' instead. 😤'; }
      else text = U.pick(['Nope! ' + ad.who + ' said "Who are you?" 😅 Get more famous and try again!', 'So close! They picked someone more famous. 😢', 'Not this time! Their agent never called back. 📵', '"We\'ll call you." They did not call. 😬']);
      G.addXP(g, 2);
    }
    G.clampAll(g);
    G.save(g);
    var chips = G.diff(before, g);
    if (ok && !chips.some(function (c) { return c.txt.indexOf(ad.name) >= 0; })) {
      var m = g.mods[g.mods.length - 1];
      chips.push({ txt: '📈 ' + m.label + ' (' + m.weeks + ' wks)', good: true });
    }
    return { ok: ok, ad: ad, chance: p, text: text, chips: chips, unlocked: G.checkAchievements(g), levelUps: G.takeLevelUps(g) };
  };

  G.postOptions = function (g) {
    var seed = U.hash(g.company.name + g.week);
    var list = CS.POSTS.slice().sort(function (a, b) { return (U.hash(a.id + seed) % 97) - (U.hash(b.id + seed) % 97); });
    return list.slice(0, 4);
  };

  // Publishes a social media post and returns what happened.
  G.post = function (g, id) {
    var p = CS.POSTS.find(function (x) { return x.id === id; });
    var funny = g.employees.filter(function (e) { return G.has(e, 'funny') || G.has(e, 'creative'); }).length;
    var tierMul = [1, 4, 20][G.tierOf(g).stars - 1];
    if (p.cost) g.cash -= G.cost(g, p.cost);
    var base = 250 * tierMul;
    var views = (g.followers * 2.5 + base) * p.views * U.rand(0.5, 1.6) * (0.6 + g.satisfaction / 100);
    var r = { post: p, viral: false, backfire: false };
    if (U.chance(p.risk)) {
      r.backfire = true;
      views *= 0.6;
      g.reputation -= U.ri(2, 6);
      g.followers = Math.max(0, g.followers - Math.round(g.followers * 0.02));
      r.text = U.pick(['People did not like it 😬', 'The comments are not nice... 😬', 'Oops. That did not go well.']);
    } else if (U.chance(p.viral * (1 + funny * 0.08))) {
      r.viral = true;
      views *= U.rand(12, 40);
      g.flags.viral = true;
      g.stats.virals++;
      r.text = U.pick(['IT WENT VIRAL! 🔥🔥🔥', 'Everyone is sharing it! 🚀', 'You broke the internet! 🤯']);
    } else {
      r.text = U.pick(['Nice post! People liked it. 👍', 'Your followers loved it! 💖', 'Solid post. 📈']);
    }
    r.views = Math.round(views);
    r.likes = Math.round(views * U.rand(0.05, 0.12));
    r.comments = Math.round(r.likes * U.rand(0.03, 0.08));
    r.shares = Math.round(views * U.rand(0.005, 0.02) * (r.viral ? 3 : 1));
    // Gains are capped so followers grow fast but never explode.
    var gained = r.backfire ? 0 : r.viral ? G.viralGain(g, views) :
      Math.round(Math.min(g.followers * 0.05 + base * 0.3, views * U.rand(0.01, 0.025) * p.fans) * G.fanRoom(g));
    g.followers += gained;
    r.followers = gained;
    if (!r.backfire) g.awareness = U.clamp(g.awareness + (r.viral ? 30 : 2 + Math.log10(Math.max(10, views)) * 0.8) * p.fans, 0, G.awCap(g));
    g.posted = true;
    g.stats.posts++;
    G.addXP(g, 8);
    G.news(g, p.emoji + ' Your post got ' + U.num(r.views) + ' views' + (r.viral ? ' and went VIRAL!' : '.'), r.backfire ? 'bad' : 'good');
    return r;
  };

  // ---------- upgrades ----------

  G.upLevel = function (g, id) { return g.upgrades[id] || 0; };
  G.upCost = function (g, id) {
    var u = CS.UP[id], lv = G.upLevel(g, id);
    if (lv >= u.cost.length) return 0;
    return U.nice(G.tierOf(g).rv * u.cost[lv] * (G.tierOf(g).stars === 3 ? 0.5 : 1));
  };
  G.upNeedLevel = function (g, id) { var u = CS.UP[id], lv = G.upLevel(g, id); return lv < u.lvl.length ? u.lvl[lv] : 0; };
  G.buyUpgrade = function (g, id) {
    var cost = G.upCost(g, id);
    if (!cost || g.cash < cost || g.level < G.upNeedLevel(g, id)) return false;
    g.cash -= cost;
    g.upgrades[id] = G.upLevel(g, id) + 1;
    g.stats.upgrades++;
    G.addXP(g, 15);
    G.news(g, CS.UP[id].emoji + ' Bought ' + CS.UP[id].name + ' (level ' + g.upgrades[id] + ').', 'good');
    return true;
  };

  // ---------- XP, levels, missions ----------

  G.xpNeed = function (level) { return Math.round(80 * Math.pow(level, 1.5)); };
  G.addXP = function (g, n) {
    g.xp += n;
    var ups = 0;
    while (g.xp >= G.xpNeed(g.level)) {
      g.xp -= G.xpNeed(g.level);
      g.level++; ups++;
      var gift = U.nice(G.scale(g) * 0.1 * g.level);
      g.cash += gift;
      g.levelUps = (g.levelUps || []).concat([{ level: g.level, gift: gift }]);
      G.news(g, '🎖️ You reached CEO level ' + g.level + '! Gift: ' + U.money(gift), 'good');
    }
    return ups;
  };
  G.takeLevelUps = function (g) { var l = g.levelUps || []; g.levelUps = []; return l; };

  G.newMission = function (g) {
    var have = g.missions.map(function (m) { return m.id; });
    var t = U.pick(CS.MISSIONS.filter(function (m) { return have.indexOf(m.id) < 0; }));
    var m = { id: t.id, emoji: t.emoji };
    var s = G.scale(g);
    if (t.special === 'rep') {
      var opts = t.n.filter(function (n) { return n > g.reputation + 2; });
      m.target = opts.length ? opts[0] : Math.min(100, Math.round(g.reputation) + 5);
    } else if (t.special === 'fans') {
      m.target = U.nice(Math.max(g.followers * 1.5, g.followers + 200));
    } else if (t.special === 'cash') {
      m.target = U.nice(Math.max(g.cash * 1.35, s * 6));
    } else if (t.special === 'streak') {
      m.target = U.pick(t.n);
    } else {
      m.target = U.pick(t.n);
      m.base = g.stats[t.stat];
    }
    m.reward = U.nice(s * U.rand(0.15, 0.3));
    m.xp = 30 + Math.round(U.rand(0, 2)) * 10;
    return m;
  };
  G.missionText = function (m) {
    var t = CS.MISSIONS.find(function (x) { return x.id === m.id; });
    var n = t.special === 'cash' ? U.short(m.target) : t.special === 'fans' ? U.num(m.target) : m.target;
    // {one|many} picks the right word: "Hire 1 new person", "Hire 2 new people".
    return t.text.replace('{n}', n).replace(/\{([^|}]*)\|([^}]*)\}/g, function (_, one, many) { return m.target === 1 ? one : many; });
  };
  G.missionProgress = function (g, m) {
    var t = CS.MISSIONS.find(function (x) { return x.id === m.id; });
    var cur;
    if (t.special === 'rep') cur = g.reputation;
    else if (t.special === 'fans') cur = g.followers;
    else if (t.special === 'cash') cur = g.cash;
    else if (t.special === 'streak') cur = g.streak;
    else cur = g.stats[t.stat] - m.base;
    return [Math.max(0, Math.min(cur, m.target)), m.target];
  };
  G.missionDone = function (g, m) { var p = G.missionProgress(g, m); return p[0] >= p[1]; };
  G.claimMission = function (g, idx) {
    var m = g.missions[idx];
    if (!m || !G.missionDone(g, m)) return null;
    g.cash += m.reward;
    G.addXP(g, m.xp);
    g.stats.missionsDone++;
    g.missions[idx] = G.newMission(g);
    return m;
  };
  G.readyMissions = function (g) { return g.missions.filter(function (m) { return G.missionDone(g, m); }).length; };

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
  G.modGood = function (m) {
    return (m.type === 'demand' || m.type === 'capacity') ? m.value >= 1 : m.type === 'supply' ? m.value < 0 : m.type === 'extra';
  };

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
    cap *= m.capacity * g.flags.equip * (1 + 0.08 * G.upLevel(g, 'equip')) * (covered ? 1.05 : 0.9);
    var salesBoost = Math.min(0.45, sales.reduce(function (s, e) { return s + 0.07 * G.productivity(e); }, 0));
    var demand = g.eco.demand * city.demand * (0.5 + g.reputation / 100) * (1 + g.awareness / 100) *
      [1.25, 1, 0.75][g.price] * (1 + salesBoost) * (1 + 0.12 * G.upLevel(g, 'space')) * econ.demand * m.demand *
      (preview ? 1 : U.rand(0.92, 1.08));
    var served = m.closed ? 0 : Math.min(demand, cap);
    var ticket = g.eco.ticket * city.ticket * [0.8, 1, 1.3][g.price] * g.priceIndex;
    var sales$ = served * ticket;
    var acctCut = Math.min(0.05, acct.reduce(function (s, e) { return s + 0.015 * (0.5 + e.skill / 100); }, 0));
    var supplyRate = Math.max(0.03, g.eco.supply + m.supply + econ.supply - acctCut - 0.015 * G.upLevel(g, 'register'));
    var supplies = sales$ * supplyRate;
    var wages = emps.reduce(function (s, e) { return s + e.salary; }, 0);
    var rent = g.eco.rent * city.rent * g.priceIndex * g.rentMult * (1 + 0.15 * G.upLevel(g, 'space'));
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
    var rankBefore = g.rank;
    var econMsg = stepEconomy(g);
    if (econMsg) minor.push(econMsg);

    var f = G.compute(g, false);
    g.loans.forEach(function (l) {
      var interest = l.balance * l.rate;
      var pay = Math.min(l.payment, l.balance + interest);
      l.balance = l.balance + interest - pay;
    });
    if (g.loans.some(function (l) { return l.balance < 1; })) { g.flags.debtfree = true; minor.push('🕊️ You paid off a loan!'); }
    g.loans = g.loans.filter(function (l) { return l.balance >= 1; });

    g.cash += f.net;
    g.stats.revenue += f.revenue;
    g.stats.weeksPlayed++;
    g.history.push({ week: g.week, revenue: f.revenue, profit: f.profit, net: f.net, cash: g.cash, served: f.served, demand: f.demand, capacity: f.capacity });
    if (g.history.length > 260) g.history.shift();
    g.stats.fullStreak = f.served >= f.demand * 0.999 && !f.closed ? g.stats.fullStreak + 1 : 0;

    // Profit streak with a bonus every 5 weeks.
    var streakBonus = 0;
    if (f.net > 0) {
      g.streak++;
      g.bestStreak = Math.max(g.bestStreak, g.streak);
      G.addXP(g, 5);
      if (g.streak % 5 === 0) {
        streakBonus = U.nice(G.scale(g) * 0.1 * Math.min(4, g.streak / 5));
        g.cash += streakBonus;
      }
    } else g.streak = 0;

    stepCustomers(g, f);
    stepStaff(g, f, minor);

    g.mods.forEach(function (m) { m.weeks--; });
    g.mods = g.mods.filter(function (m) { return m.weeks > 0; });
    g.posted = false;
    g.golden = U.chance(0.45) ? { tapped: false } : null;
    var cup = stepRivals(g, f, minor);
    if (g.war) g.war.energy = Math.min(G.warMaxEnergy(), g.war.energy + 1);
    if (g.pet) g.employees.forEach(function (e) { e.morale += 1; });

    var count = rollEvents(g, minor);
    G.refreshCandidates(g);

    if (g.cash < 0) {
      g.negWeeks++;
      if (g.negWeeks === 1) minor.push('⚠️ You ran out of money! Fix it in 8 weeks or you go bankrupt.');
    } else g.negWeeks = 0;
    if (g.negWeeks >= 8 || g.cash < -G.scale(g) * 25) g.over = { reason: 'bankrupt', week: g.week };
    if (!g.over && g.mode === 'daily' && g.week >= G.DAILY_WEEKS) g.over = { reason: 'daily', week: g.week };

    g.stats.maxStaff = Math.max(g.stats.maxStaff, g.employees.length);
    g.stats.peakCash = Math.max(g.stats.peakCash, g.cash);
    g.rank = Math.max(g.rank, G.rankIndex(g));
    var best = bestWorker(g);
    var unlocked = G.checkAchievements(g);
    g.last = {
      week: g.week, fin: f, minor: minor, count: count, unlocked: unlocked, streak: g.streak, streakBonus: streakBonus,
      rankUp: g.rank > rankBefore ? g.rank : null, cup: cup, levelUps: G.takeLevelUps(g), star: best ? { name: best.name, face: best.face } : null
    };
    G.save(g);
    return g.last;
  };

  function bestWorker(g) {
    var best = null;
    g.employees.forEach(function (e) { if (!best || G.productivity(e) > G.productivity(best)) best = e; });
    return best;
  }

  function stepEconomy(g) {
    if (g.economy.state === 'inflation') g.priceIndex *= 1.003;
    if (--g.economy.weeks > 0) return null;
    var prev = g.economy.state, next;
    if (prev === 'normal') next = U.weighted(['boom', 'recession', 'inflation', 'normal'], function (s) { return { boom: 35, recession: 28, inflation: 22, normal: 15 }[s]; });
    else next = U.chance(0.8) ? 'normal' : U.pick(['boom', 'recession', 'inflation'].filter(function (s) { return s !== prev; }));
    if (prev === 'recession' && next !== 'recession') g.flags.survivedRecession = true;
    g.economy = { state: next, weeks: U.ri(12, 36) };
    if (next === prev) return null;
    var e = CS.ECON[next];
    var msg = e.emoji + ' ' + e.name + ' ' + e.tip;
    G.news(g, msg, e.tone === 'good' ? 'good' : e.tone === 'bad' ? 'bad' : 'neutral');
    return msg;
  }

  function stepCustomers(g, f) {
    var front = g.employees.filter(function (e) { return e.role === 'front'; });
    var quality = front.length ? front.reduce(function (s, e) { return s + e.skill; }, 0) / front.length : 30;
    var morale = G.avgMorale(g);
    var ratio = f.demand > 0 ? f.capacity / f.demand : 1;
    var target = 48 + (quality - 50) * 0.4 + (morale - 50) * 0.2 + [8, 0, -8][g.price] +
      (g.price === 2 ? (quality - 55) * 0.4 : 0) + (ratio < 1 ? -40 * (1 - ratio) : 6) + 4 * G.upLevel(g, 'decor');
    if (f.closed) target -= 15;
    g.satisfaction = U.clamp(g.satisfaction + (target - g.satisfaction) * 0.3, 0, 100);
    g.reputation = U.clamp(g.reputation + (g.satisfaction - g.reputation) * 0.06, 0, 100);
    var awGain = (g.satisfaction - 55) / 14 + 0.8 * G.upLevel(g, 'neon');
    g.awareness = U.clamp(g.awareness * 0.985 + awGain, 0, G.awCap(g));
    var fd = ((g.awareness / 10 + g.followers * 0.01) * (g.satisfaction - 40) / 40 * U.rand(0.6, 1.4) + G.upLevel(g, 'neon') * 3) * G.fanRoom(g);
    g.followers = Math.max(0, Math.round(g.followers + fd));
  }

  G.avgMorale = function (g) {
    if (!g.employees.length) return 50;
    return g.employees.reduce(function (s, e) { return s + e.morale; }, 0) / g.employees.length;
  };

  function stepStaff(g, f, minor) {
    var emps = g.employees;
    var cheer = emps.filter(function (e) { return G.has(e, 'funny') || G.has(e, 'friendly'); }).length;
    var overwork = f.capacity > 0 && f.demand / f.capacity > 1.25;
    var learn = 1 + 0.4 * G.upLevel(g, 'training');
    emps.forEach(function (e) {
      e.weeks++;
      var grow = (e.skill < 60 ? 0.35 : e.skill < 80 ? 0.18 : 0.06) * learn;
      if (G.has(e, 'ambitious')) grow *= 1.8;
      if (G.has(e, 'lazy')) grow *= 0.5;
      e.skill = Math.min(100, e.skill + grow);
      var pay = U.clamp((e.salary / G.market(g, e.role, e.level) - 1) * 100, -25, 25);
      var target = 62 + pay + Math.min(8, cheer * 1.5) + (f.covered ? 0 : -12) + (overwork && e.role === 'front' ? -10 : 0) +
        G.friendsOf(g, e).length * 3 - G.enemiesOf(g, e).length * 6 + (G.partnerOf(g, e) ? 5 : 0) + 5 * G.upLevel(g, 'breakroom');
      if (G.has(e, 'serious')) target -= 2;
      e.morale += (target - e.morale) * 0.2;
      e.loyalty += e.morale > 60 ? 0.25 : e.morale < 35 ? -0.6 : 0;
      clampEmp(e);
    });
    var pairs = Math.min(4, Math.floor(emps.length / 2));
    for (var i = 0; i < pairs; i++) {
      var a = U.pick(emps), b = U.pick(emps);
      if (!a || !b || a === b) continue;
      var d = U.rand(-3, 6);
      [a, b].forEach(function (x) {
        if (G.has(x, 'friendly')) d += 3;
        if (G.has(x, 'funny')) d += 2;
        if (G.has(x, 'aggressive')) d -= 6;
        if (G.has(x, 'greedy')) d -= 1;
      });
      var before = G.getRel(g, a.id, b.id);
      G.addRel(g, a.id, b.id, d);
      var after = G.getRel(g, a.id, b.id);
      if (before < 40 && after >= 40) minor.push('🤝 ' + G.first(a) + ' and ' + G.first(b) + ' are now friends.');
      if (before > -40 && after <= -40) minor.push('😠 ' + G.first(a) + ' and ' + G.first(b) + ' don\'t like each other anymore.');
    }
    emps.forEach(function (e) {
      if (e.morale < 22 && U.chance(0.25 * (1 - e.loyalty / 120)) && !g.pending.some(function (p) { return p.id === 'resign' && p.ctx.a === e.id; })) {
        G.schedule(g, 'resign', 0, { a: e.id, an: G.first(e) });
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
    g.followers = Math.max(0, Math.round(g.followers));
  };

  // ---------- events ----------

  G.schedule = function (g, id, delay, ctx) { g.pending.push({ id: id, due: g.week + delay, ctx: ctx || {} }); };

  G.news = function (g, text, tone) {
    g.news.unshift({ week: g.week, text: text, tone: tone || 'neutral' });
    if (g.news.length > 150) g.news.length = 150;
  };

  function rollCount(g) {
    var r = U.random(), n;
    if (r < 0.22) n = 0;
    else if (r < 0.6) n = 1;
    else if (r < 0.82) n = 2;
    else if (r < 0.93) n = 3;
    else if (r < 0.975) n = 4;
    else { n = 5; while (U.chance(0.3)) n++; }
    if (g.employees.length > 20 && U.chance(0.3)) n++;
    if (g.week <= 2) n = Math.max(1, Math.min(n, 1));
    return n;
  }

  function ctxValid(g, ctx) {
    return ['a', 'b', 'm'].every(function (k) { return ctx[k] == null || G.emp(g, ctx[k]); });
  }

  // Picks the people an event is about, following def.who, e.g. { a: 'aggressive', b: 'any' }.
  var ROLE_KEYS = { front: 1, sales: 1, acct: 1, mgr: 1 };
  function castActors(g, def) {
    var ctx = {}, used = {};
    var who = def.who || {};
    var keys = Object.keys(who);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i], spec = who[k];
      var list = g.employees.filter(function (e) {
        if (used[e.id]) return false;
        if (ROLE_KEYS[spec] && e.role !== spec) return false;
        if (spec === 'new' && e.weeks > 6) return false;
        if (spec === 'veteran' && e.weeks < 52) return false;
        if (spec === 'notmgr' && e.role === 'mgr') return false;
        if (spec === 'old' && e.age < 50) return false;
        return true;
      });
      if (!list.length) return null;
      var e = U.weighted(list, function (x) {
        if (CS.TRAITS[spec]) return G.has(x, spec) ? 8 : 1;
        if (spec === 'lowmood') return x.morale < 45 ? 6 : 1;
        if (spec === 'star') return x.skill >= 60 ? 6 : 1;
        return 1;
      });
      used[e.id] = 1;
      ctx[k] = e.id;
      ctx[k + 'n'] = G.first(e);
    }
    return ctx;
  }

  function eventWeight(g, d, picked) {
    if (d.chainOnly || picked[d.id]) return 0;
    if ((g.cooldowns[d.id] || -99) > g.week) return 0;
    if (d.minWeek && g.week < d.minWeek) return 0;
    if (d.need && g.employees.length < d.need) return 0;
    if (d.cond && !d.cond(g)) return 0;
    if (MINIGAMES[d.kind] && picked._mini) return 0;
    var w = typeof d.w === 'function' ? d.w(g) : (d.w == null ? 1 : d.w);
    return w * CS.RARITY[d.rarity || 'common'].w;
  }

  function rollEvents(g, minor) {
    var inst = [];
    var due = g.pending.filter(function (p) { return p.due <= g.week; });
    g.pending = g.pending.filter(function (p) { return p.due > g.week; });
    due.forEach(function (p) {
      var def = CS.EV[p.id];
      if (def && ctxValid(g, p.ctx) && (!def.cond || def.cond(g, p.ctx))) inst.push({ id: p.id, ctx: p.ctx, chain: true });
    });
    var n = rollCount(g), picked = {};
    inst.forEach(function (x) { picked[x.id] = 1; });
    for (var k = 0, tries = 0; k < n && tries < n * 5; tries++) {
      var def = U.weighted(CS.EVENTS, function (d) { return eventWeight(g, d, picked); });
      if (!def) break;
      picked[def.id] = 1;
      var ctx = castActors(g, def);
      if (ctx && def.init && def.init(g, ctx) === false) ctx = null;
      if (!ctx) continue;
      if (MINIGAMES[def.kind]) picked._mini = 1;
      g.cooldowns[def.id] = g.week + (def.cd || 8);
      inst.push({ id: def.id, ctx: ctx });
      k++;
    }
    var total = inst.length;
    if (total >= 4) g.stats.bigWeeks++;
    if (total >= 5) g.flags.chaos = true;
    var decisions = 0;
    inst.forEach(function (x) {
      var def = CS.EV[x.id];
      if (!ctxValid(g, x.ctx)) return; // an earlier event this week removed someone involved
      if (def.start) G.apply(g, def.start, x.ctx);
      if (!def.choices && !MINIGAMES[def.kind]) {
        G.seen(x.id);
        if (def.rarity === 'legendary') g.flags.legendary = true;
        var txt = G.apply(g, def.fx, x.ctx);
        minor.push(def.icon + ' ' + G.fill(txt || def.text, g, x.ctx));
        G.clampAll(g);
      } else if (decisions < MAX_DECISIONS || x.chain) { // a story that continues is never skipped
        decisions++;
        g.queue.push(x);
      } else if (def.choices) {
        // Too busy: your team handles it with the default answer.
        G.seen(x.id);
        var c = def.choices[def.auto != null ? def.auto : def.choices.length - 1];
        var res = G.apply(g, c.fx, x.ctx);
        G.clampAll(g);
        minor.push(def.icon + ' ' + G.fill(def.title, g, x.ctx) + ' Your team chose: "' + G.fill(c.t, g, x.ctx) + '". ' + (res || ''));
      }
    });
    // A story the team handled for you continues next week instead.
    (g.thenQ || []).forEach(function (t) { g.pending.push({ id: t.id, due: g.week + 1, ctx: t.ctx }); });
    g.thenQ = []; delete g._later;
    return total;
  }

  // Replaces {a}, {b}, {m}, {rival}, {amt}... in event text.
  G.fill = function (v, g, c) {
    if (typeof v === 'function') v = v(g, c);
    if (v == null) return '';
    c = c || {};
    var ind = CS.IND[g.company.industry];
    return String(v).replace(/\{(\w+)\}/g, function (m, k) {
      if (k === 'a' || k === 'b' || k === 'm') { var e = G.emp(g, c[k]); return e ? G.first(e) : (c[k + 'n'] || 'Someone'); }
      if (k === 'amt') return U.money(c.amt || 0);
      if (k === 'amt2') return U.money(c.amt2 || 0);
      if (k === 'company') return g.company.name;
      if (k === 'front') return ind.front.toLowerCase();
      if (k === 'fronts') return U.plural(ind.front.toLowerCase());
      if (k === 'unit') return ind.unit;
      if (k === 'industry') return ind.name.toLowerCase();
      if (k === 'city') return CS.CITIES[g.company.city].name;
      if (k === 'rival') return c.rival || g.rivals[0];
      if (c[k] != null) return c[k];
      return m;
    });
  };

  // Applies a declarative effect (see events.js for the list of keys) and returns the result text.
  G.apply = function (g, fx, c) {
    if (!fx) return '';
    if (typeof fx === 'function') return fx(g, c) || '';
    var E = function (k) { return G.emp(g, c[k]); };
    var say = fx.say ? G.fill(fx.say, g, c) : '';
    var extra = [];
    if (fx.cash) g.cash += fx.cash < 0 ? -G.cost(g, -fx.cash) : G.prize(g, fx.cash);
    if (fx.money) g.cash += fx.money;
    if (fx.rep) g.reputation += fx.rep;
    if (fx.happy) g.satisfaction += fx.happy;
    if (fx.fans) G.addFans(g, fx.fans);
    if (fx.team) g.employees.forEach(function (e) { e.morale += fx.team; });
    ['a', 'b', 'm'].forEach(function (k) { if (fx[k] && E(k)) E(k).morale += fx[k]; });
    if (fx.skill) Object.keys(fx.skill).forEach(function (k) { if (E(k)) E(k).skill += fx.skill[k]; });
    if (fx.loyal) Object.keys(fx.loyal).forEach(function (k) { if (E(k)) E(k).loyalty += fx.loyal[k]; });
    if (fx.reliable) Object.keys(fx.reliable).forEach(function (k) { if (E(k)) E(k).reliability += fx.reliable[k]; });
    if (fx.rel && c[fx.rel[0]] && c[fx.rel[1]]) G.addRel(g, c[fx.rel[0]], c[fx.rel[1]], fx.rel[2]);
    if (fx.date && c.a && c.b) { g.dating[rk(c.a, c.b)] = true; G.addRel(g, c.a, c.b, 40); }
    if (fx.breakup && c.a && c.b) delete g.dating[rk(c.a, c.b)];
    if (fx.raise && E(fx.raise[0])) G.raise(g, E(fx.raise[0]), fx.raise[1]);
    if (fx.teamRaise) g.employees.forEach(function (e) { G.raise(g, e, fx.teamRaise); });
    if (fx.teamBonus) g.employees.forEach(function (e) { G.bonus(g, e); });
    if (fx.bonus && E(fx.bonus)) G.bonus(g, E(fx.bonus));
    if (fx.promote && E(fx.promote)) G.promote(g, E(fx.promote), E(fx.promote).level >= 3);
    if (fx.mgr && E(fx.mgr)) G.promote(g, E(fx.mgr), true);
    if (fx.demote && E(fx.demote)) G.demote(g, E(fx.demote));
    if (fx.demand) G.mod(g, 'demand', fx.demand[0], fx.demand[1], fx.demand[2]);
    if (fx.capacity) G.mod(g, 'capacity', fx.capacity[0], fx.capacity[1], fx.capacity[2]);
    if (fx.supply) G.mod(g, 'supply', fx.supply[0], fx.supply[1], fx.supply[2]);
    if (fx.extra) G.mod(g, 'extra', U.nice(G.scale(g) * fx.extra[0]), fx.extra[1], fx.extra[2]);
    if (fx.closed) G.mod(g, 'closed', 1, fx.closed[0], fx.closed[1]);
    if (fx.price) g.price = U.clamp(g.price + fx.price, 0, 2);
    if (fx.equip) g.flags.equip = Math.min(1.5, g.flags.equip * (1 + fx.equip));
    if (fx.rent) g.rentMult *= 1 + fx.rent;
    if (fx.viral) {
      var views = Math.round((g.followers * 3 + 5000) * U.rand(fx.viral[0], fx.viral[1]));
      g.flags.viral = true; g.stats.virals++;
      g.followers += G.viralGain(g, views);
      G.addFans(g, 25);
      extra.push('🔥 ' + U.num(views) + ' views!');
    }
    if (fx.hire === 'cand' && c.cand) { var cand = c.cand; cand.id = g.nextId++; G.addEmployee(g, cand); }
    if (fx.hireSpecial) { var sp = G.makeEmployee(g, fx.hireSpecial.role || 'front', fx.hireSpecial); G.addEmployee(g, sp); }
    if (fx.xp) G.addXP(g, fx.xp);
    if (fx.pet) g.pet = fx.pet;
    if (fx.rival && c.rival) G.rivalShift(g, c.rival, fx.rival);
    if (fx.flag) g.flags[fx.flag] = true;
    if (fx.next) {
      var list = typeof fx.next[0] === 'string' ? [fx.next] : fx.next;
      list.forEach(function (n) {
        if (n[3] == null || U.chance(n[3])) { G.schedule(g, n[0], U.ri(n[1], n[2]), chainCtx(c)); g._later = true; }
      });
    }
    // then: the story continues right away with another event (it opens after this one).
    if (fx.then) (g.thenQ = g.thenQ || []).push({ id: fx.then, ctx: chainCtx(c), chain: true });
    if (fx.run) { var r = fx.run(g, c); if (r) extra.push(G.fill(r, g, c)); }
    // Firing and quitting come last so the text above can still use their names.
    if (fx.fire && E(fx.fire)) G.removeEmp(g, E(fx.fire), 'fired');
    if (fx.quit && E(fx.quit)) G.quitToRival(g, E(fx.quit));
    if (fx.leave && E(fx.leave)) G.removeEmp(g, E(fx.leave), 'left'); // leaves on good terms (retires, starts a business...)
    if (fx.die && E(fx.die)) G.removeEmp(g, E(fx.die), 'died');
    var out = [say].concat(extra);
    if (fx.chance) {
      var p = typeof fx.chance.p === 'function' ? fx.chance.p(g, c) : fx.chance.p;
      c._won = U.chance(p);
      out.push(G.apply(g, c._won ? fx.chance.win : fx.chance.lose, c));
    }
    return out.filter(Boolean).join(' ');
  };

  function chainCtx(c) { var o = JSON.parse(JSON.stringify(c)); delete o._won; return o; }

  G.quitToRival = function (g, e) {
    var rv = U.pick(g.rivals);
    G.removeEmp(g, e, 'quit');
    if (U.chance(0.5)) G.schedule(g, 'joined_rival', U.ri(1, 3), { name: e.name, rival: rv, creative: G.has(e, 'creative') });
  };

  // What a choice will cost up front, for the price tag on the button.
  G.fxCost = function (g, fx) {
    if (!fx || typeof fx === 'function') return 0;
    if (fx.cash < 0) return G.cost(g, -fx.cash);
    if (fx.money < 0) return -fx.money;
    return 0;
  };
  G.fxRisk = function (g, fx, c) {
    if (!fx || !fx.chance) return null;
    var p = typeof fx.chance.p === 'function' ? fx.chance.p(g, c) : fx.chance.p;
    return Math.round(p * 100);
  };

  G.currentEvent = function (g) {
    while (g.queue.length) {
      var x = g.queue[0];
      if (CS.EV[x.id] && ctxValid(g, x.ctx)) return x;
      g.queue.shift();
    }
    return null;
  };

  // Before/after snapshot so the result screen can show what changed.
  G.snap = function (g) {
    return { cash: g.cash, rep: g.reputation, happy: g.satisfaction, fans: g.followers, mood: G.avgMorale(g), staff: g.employees.length, mods: g.mods.length };
  };
  G.diff = function (b, g) {
    var a = G.snap(g), out = [];
    function add(d, txt, good) { out.push({ txt: txt, good: good }); }
    var dc = a.cash - b.cash;
    if (Math.abs(dc) >= 1) add(dc, (dc > 0 ? '+' : '-') + U.money(Math.abs(dc)).replace('-', '') + ' 💰', dc > 0);
    var dr = Math.round(a.rep - b.rep);
    if (dr) add(dr, '⭐ Reputation ' + (dr > 0 ? '+' : '') + dr, dr > 0);
    var dh = Math.round(a.happy - b.happy);
    if (dh) add(dh, '😊 Happiness ' + (dh > 0 ? '+' : '') + dh, dh > 0);
    var df = a.fans - b.fans;
    if (Math.abs(df) >= 1) add(df, '📱 ' + (df > 0 ? '+' : '') + U.num(df) + ' followers', df > 0);
    var dm = Math.round(a.mood - b.mood);
    if (dm) add(dm, '💪 Team mood ' + (dm > 0 ? '+' : '') + dm, dm > 0);
    var ds = a.staff - b.staff;
    if (ds) add(ds, '👥 ' + (ds > 0 ? '+' : '') + ds + ' worker' + (Math.abs(ds) > 1 ? 's' : ''), ds > 0);
    g.mods.slice(b.mods).forEach(function (m) {
      out.push({ txt: (G.modGood(m) ? '📈 ' : '📉 ') + m.label + ' (' + m.weeks + ' wk' + (m.weeks > 1 ? 's' : '') + ')', good: G.modGood(m) });
    });
    return out;
  };

  // Finishes the current event with the given effect. Used by every event type.
  G.resolve = function (g, fx, pre) {
    var x = G.currentEvent(g);
    if (!x) return null;
    var def = CS.EV[x.id];
    var before = G.snap(g);
    var text = G.apply(g, fx, x.ctx);
    if (pre) text = pre + (text ? ' ' + text : '');
    g.queue.shift();
    var then = g.thenQ && g.thenQ.length, later = !!g._later;
    if (then) { g.queue.unshift.apply(g.queue, g.thenQ); g.thenQ = []; }
    delete g._later;
    G.seen(x.id);
    if (def.rarity === 'legendary') g.flags.legendary = true;
    if (MINIGAMES[def.kind]) { g.stats.minigames++; G.addXP(g, 20); }
    else { g.stats.decisions++; G.addXP(g, 12); }
    G.clampAll(g);
    var res = { text: text, chips: G.diff(before, g), unlocked: G.checkAchievements(g), levelUps: G.takeLevelUps(g), won: x.ctx._won, then: !!then, later: later && !then };
    G.save(g);
    return res;
  };

  G.choose = function (g, idx) {
    var x = G.currentEvent(g);
    if (!x) return null;
    var c = CS.EV[x.id].choices[idx];
    return G.resolve(g, c.fx);
  };

  // ----- mini-game helpers (every mini-game offers 4 ways to play) -----

  // Multiplies the size of an effect, for easy/hard modes and golden spins.
  function scaleFx(fx, m) {
    if (!fx || typeof fx !== 'object') return fx;
    var out = {};
    Object.keys(fx).forEach(function (k) {
      out[k] = (['cash', 'fans', 'rep', 'happy', 'team'].indexOf(k) >= 0 && typeof fx[k] === 'number' && fx[k] > 0) ? fx[k] * m : fx[k];
    });
    return out;
  }
  G.scaleFx = scaleFx;

  G.openBox = function (g, pick) {
    var x = G.currentEvent(g), def = CS.EV[x.id];
    var prizes = [0, 1, 2, 3].map(function () { return def.prizes.indexOf(U.weighted(def.prizes, function (p) { return p.w || 1; })); });
    var p = def.prizes[prizes[pick]];
    var res = G.resolve(g, p.fx, 'You got: ' + p.emoji + ' ' + p.label + '!');
    res.boxes = prizes.map(function (i) { return def.prizes[i]; });
    res.pick = pick;
    return res;
  };
  // mode: 'free' | 'golden' (costs money, better odds)
  G.spinCost = function (g) { return G.cost(g, 0.3); };
  G.spin = function (g, mode) {
    var x = G.currentEvent(g), def = CS.EV[x.id], golden = mode === 'golden';
    if (golden) g.cash -= G.spinCost(g);
    var s = U.weighted(def.slices, function (p) { var w = p.w || 1; return golden ? (p.jackpot ? w * 4 : p.bad ? w * 0.2 : w) : w; });
    var idx = def.slices.indexOf(s);
    if (s.jackpot) g.flags.jackpot = true;
    var res = G.resolve(g, golden ? scaleFx(s.fx, 1.5) : s.fx, 'The wheel landed on ' + s.emoji + ' ' + s.label + '!');
    res.slice = idx;
    return res;
  };
  G.TAP_LEVELS = [
    { id: 'easy', label: 'Easy', emoji: '🐢', goal: 0.6, prize: 0.5 },
    { id: 'normal', label: 'Normal', emoji: '🙂', goal: 1, prize: 1 },
    { id: 'hard', label: 'Hard', emoji: '🔥', goal: 1.4, prize: 2.2 }
  ];
  G.tapGoal = function (def, level) { return Math.max(5, Math.round(def.goal * G.TAP_LEVELS[level].goal)); };
  G.tapDone = function (g, score, level) {
    var x = G.currentEvent(g), def = CS.EV[x.id], lv = G.TAP_LEVELS[level || 1], goal = G.tapGoal(def, level || 1);
    var won = score >= goal;
    var res = G.resolve(g, won ? scaleFx(def.win, lv.prize) : def.lose, won ? '🏆 You tapped ' + score + ' times on ' + lv.label + '!' : '⏱️ Only ' + score + ' of ' + goal + ' taps.');
    res.won = won;
    return res;
  };
  G.quizAnswer = function (g, i) {
    var x = G.currentEvent(g), def = CS.EV[x.id];
    var right = i === x.ctx.q.answer;
    if (right) g.stats.quizRight++;
    var res = G.resolve(g, right ? def.win : def.lose, right ? '✅ Correct!' : '❌ Not quite. The answer was ' + x.ctx.q.options[x.ctx.q.answer] + '.');
    res.won = right;
    return res;
  };
  // big = ask for WAY more: bigger jump, bigger chance they walk away.
  G.dealPush = function (g, big) {
    var x = G.currentEvent(g);
    if (U.chance((big ? 0.5 : 0.28) + x.ctx.round * 0.12)) { x.ctx.walked = true; G.save(g); return false; }
    x.ctx.round += big ? 2 : 1;
    x.ctx.offer = U.nice(x.ctx.offer * (big ? U.rand(1.6, 2.1) : U.rand(1.15, 1.4)));
    G.save(g);
    return true;
  };
  G.dealAccept = function (g) {
    var x = G.currentEvent(g), def = CS.EV[x.id];
    x.ctx.offerTxt = U.money(x.ctx.offer);
    return G.resolve(g, def.accept(g, x.ctx), def.acceptSay ? G.fill(def.acceptSay, g, x.ctx) : 'Deal! 🤝');
  };
  G.dealEnd = function (g) {
    return G.resolve(g, null, G.currentEvent(g).ctx.walked ? 'They walked away. No deal. 😅' : 'You said no thanks.');
  };
  // Four moves in a circle: each beats the next one, loses to the one before, and ties the opposite.
  G.VS_MOVES = [
    { id: 'price', label: 'Cut prices', emoji: '💸', beats: 'quality' },
    { id: 'quality', label: 'Better quality', emoji: '⭐', beats: 'ads' },
    { id: 'ads', label: 'Big ads', emoji: '📣', beats: 'party' },
    { id: 'party', label: 'Crazy party', emoji: '🎉', beats: 'price' }
  ];
  G.vsPlay = function (g, moveId) {
    var x = G.currentEvent(g), def = CS.EV[x.id];
    var me = G.VS_MOVES.find(function (m) { return m.id === moveId; });
    var them = U.pick(G.VS_MOVES);
    var out = me.beats === them.id ? 'win' : them.beats === me.id ? 'lose' : 'tie';
    if (out === 'win') g.stats.vsWins++;
    G.rivalShift(g, x.ctx.rival, out === 'win' ? -0.08 : out === 'lose' ? 0.06 : 0);
    var res = G.resolve(g, out === 'win' ? def.win : out === 'lose' ? def.lose : def.tie,
      out === 'win' ? '🏆 You won the battle!' : out === 'lose' ? '😖 ' + x.ctx.rival + ' won this time.' : '🤝 It\'s a tie!');
    res.me = me; res.them = them; res.outcome = out;
    return res;
  };
  G.interviewAsk = function (g, i) {
    var x = G.currentEvent(g);
    x.ctx.asked = i;
    x.ctx.cand.revealed = true;
    G.save(g);
  };
  // how: 'hire' | 'rich' (pay more, very loyal) | 'trial' (pay less, a bit grumpy)
  G.interviewHire = function (g, how) {
    var c = G.currentEvent(g).ctx.cand;
    if (how === 'rich') { c.salary = Math.round(c.salary * 1.1); c.loyalty += 20; c.morale += 10; }
    if (how === 'trial') { c.salary = Math.round(c.salary * 0.9); c.morale -= 10; }
    return G.resolve(g, { hire: 'cand' }, how === 'rich' ? '🤝 They are SO happy with the pay!' : how === 'trial' ? '🧪 They start on a trial. A bit nervous.' : '🤝 Welcome to the team!');
  };
  G.postEvent = function (g, id) {
    var r = G.post(g, id);
    var res = G.resolve(g, null, r.text);
    res.post = r;
    return res;
  };

  // ---------- rival companies & the Business Cup ----------

  G.makeRivals = function (g) {
    var looks = U.shuffle(CS.RIVAL_LOOKS);
    g.rivalCos = g.rivals.map(function (n, i) { return { name: n, logo: looks[i][0], color: looks[i][1], power: U.rand(0.75, 1.3), sales: 0, cups: 0 }; });
  };
  G.rivalByName = function (g, name) { return (g.rivalCos || []).find(function (r) { return r.name === name; }); };
  G.rivalShift = function (g, name, pct) { var r = G.rivalByName(g, name); if (r && pct) r.power = U.clamp(r.power * (1 + pct), 0.3, 3); };
  G.CUP_WEEKS = 13;
  var RIVAL_NEWS = [
    '{r} started a silly dance trend. 💃', '{r} gave away free hats. 🧢', '{r} put up a GIANT billboard. 🪧',
    '{r} hired a famous mascot. 🐻', '{r} cut their prices! 💸', '{r} opened a new shop across town. 🏪',
    '{r}\'s boss was on TV bragging. 📺', '{r} launched a new product. 🆕', '{r} got a bad review from a critic. 👎',
    '{r} had a power cut all weekend. 🔌', '{r}\'s website crashed. 💻', '{r} lost their best worker. 😬'
  ];
  function stepRivals(g, f, minor) {
    if (!g.rivalCos) G.makeRivals(g);
    var mine = f.revenue;
    g.cupMine = (g.cupMine || 0) + mine;
    g.rivalCos.forEach(function (r) {
      r.power = U.clamp(r.power * U.rand(0.97, 1.035) + (g.week % 26 === 0 ? 0.05 : 0), 0.3, 3);
      r.sales += G.scale(g) * r.power * U.rand(0.85, 1.15);
    });
    if (U.chance(0.4)) {
      var r = U.pick(g.rivalCos), line = U.pick(RIVAL_NEWS).replace('{r}', r.name);
      var good = /bad review|power cut|crashed|lost their/.test(line);
      if (good) r.power *= 0.95; else if (/cut their prices|new shop|billboard/.test(line)) r.power *= 1.04;
      minor.push('🥊 ' + line);
      G.news(g, '🥊 ' + line, good ? 'good' : 'bad');
    }
    if (g.week % G.CUP_WEEKS !== 0) return null;
    var board = G.cupBoard(g), place = board.findIndex(function (b) { return b.me; }) + 1;
    var prize = [1.5, 0.6, 0.25, 0][place - 1] || 0;
    var cash = prize ? U.nice(G.scale(g) * prize) : 0;
    g.cash += cash;
    g.cups = g.cups || { gold: 0, silver: 0, bronze: 0 };
    if (place === 1) g.cups.gold++; else if (place === 2) g.cups.silver++; else if (place === 3) g.cups.bronze++;
    G.addXP(g, [80, 50, 30, 15][place - 1]);
    board.forEach(function (b) { if (!b.me && b.place === 1) G.rivalByName(g, b.name).cups++; });
    G.news(g, '🏆 Business Cup: you finished #' + place + '!' + (cash ? ' Prize: ' + U.money(cash) : ''), place === 1 ? 'good' : 'neutral');
    g.cupMine = 0;
    g.rivalCos.forEach(function (r) { r.sales = 0; });
    return { place: place, cash: cash, board: board };
  }
  G.cupBoard = function (g) {
    if (!g.rivalCos) G.makeRivals(g);
    var list = g.rivalCos.map(function (r) { return { name: r.name, logo: r.logo, color: r.color, sales: r.sales }; });
    list.push({ me: true, name: g.company.name, logo: g.company.logo, color: g.company.color, sales: g.cupMine || 0 });
    list.sort(function (a, b) { return b.sales - a.sales; });
    list.forEach(function (b, i) { b.place = i + 1; });
    return list;
  };

  // ---------- Boss Powers ----------

  G.powerCd = function (g, p) { return Math.max(2, p.cd - (G.isVIP() ? 1 : 0)); };
  G.powerReadyIn = function (g, id) { g.powers = g.powers || {}; return Math.max(0, (g.powers[id] || 0) - g.week); };
  G.usePower = function (g, id) {
    var p = CS.POWERS.find(function (x) { return x.id === id; });
    if (!p || G.powerReadyIn(g, id) > 0) return null;
    var before = G.snap(g), text;
    if (id === 'sale') { G.mod(g, 'demand', 1.4, 1, 'Flash Sale'); g.satisfaction += 3; text = 'Flash Sale! Customers are lining up! ⚡'; }
    else if (id === 'party') { g.cash -= G.cost(g, p.cost); g.employees.forEach(function (e) { e.morale += 15; }); text = 'PARTY TIME! 🎉 Everyone danced all night.'; }
    else if (id === 'overtime') { G.mod(g, 'capacity', 1.3, 1, 'Overtime'); g.employees.forEach(function (e) { e.morale -= 5; }); text = 'Overtime! Everyone works extra hard. 🔥'; }
    else {
      if (U.chance(0.4)) { text = U.pick(['You jumped into a pool of ' + CS.IND[g.company.industry].unit + '. IT WENT VIRAL! 🤪🔥', 'You dressed as a giant ' + CS.IND[g.company.industry].emoji + ' and danced downtown. VIRAL! 🔥']); G.apply(g, { viral: [2, 6], fans: 20 }, {}); }
      else { text = 'Your crazy stunt made people laugh. 😂 A few new fans!'; G.addFans(g, 10); }
    }
    g.powers[id] = g.week + G.powerCd(g, p);
    g.stats.powers = (g.stats.powers || 0) + 1;
    G.addXP(g, 10);
    G.clampAll(g);
    G.save(g);
    return { text: text, chips: G.diff(before, g), power: p, unlocked: G.checkAchievements(g), levelUps: G.takeLevelUps(g) };
  };

  // ---------- Company Wars ----------
  // A war is 5 rounds, each one a different quick game (see CS.WAR_GAMES). Win more rounds to win the war.
  // The winner takes 10% of the loser's fans. Rivals are AI companies. Friends battle with war codes and no server:
  // a code carries the sender's 5 scores and the game seed, so both players get exactly the same games.

  G.WAR_FAN_SHARE = 0.1;
  G.FRIEND_WARS_PER_DAY = 3;
  G.warInit = function (g) {
    if (!g.war || g.war.v !== 2) {
      var old = g.war || {};
      g.war = { v: 2, trophies: old.trophies || 0, wins: old.wins || 0, losses: old.losses || 0, friendWins: old.friendWins || 0,
        energy: old.energy == null ? 3 : old.energy, id: old.id || Math.random().toString(36).slice(2, 10), battle: null, last: null };
    }
    return g.war;
  };
  G.warMaxEnergy = function () { return G.isVIP() ? 4 : 3; };
  G.warRankIndex = function (g) {
    var t = g.war ? g.war.trophies : 0, i = 0;
    CS.WAR_RANKS.forEach(function (r, k) { if (t >= r.min) i = k; });
    return i;
  };
  G.warGame = function (id) { return CS.WAR_GAMES.find(function (w) { return w.id === id; }); };

  // Friend wars: 3 a day, unlimited with VIP. Counted per device.
  G.friendWarsLeft = function () {
    if (G.isVIP()) return Infinity;
    var d = readJSON(KEYS.friendwar) || {};
    return d.day === U.today() ? Math.max(0, G.FRIEND_WARS_PER_DAY - d.used) : G.FRIEND_WARS_PER_DAY;
  };
  function refundFriendWar() {
    var d = readJSON(KEYS.friendwar) || {};
    if (d.day === U.today() && d.used > 0) writeJSON(KEYS.friendwar, { day: d.day, used: d.used - 1 });
  }
  function useFriendWar() {
    if (G.isVIP()) return;
    var d = readJSON(KEYS.friendwar) || {};
    writeJSON(KEYS.friendwar, { day: U.today(), used: (d.day === U.today() ? d.used : 0) + 1 });
  }

  // Seeded random numbers just for the war games, so a war code always makes the same games.
  function srng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  G.WAR_ROUNDS = 5;
  // Each war picks 5 of the games, in a random order made from the seed.
  G.warOrder = function (seed) {
    var r = srng(seed), ids = CS.WAR_GAMES.map(function (w) { return w.id; });
    for (var i = ids.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = ids[i]; ids[i] = ids[j]; ids[j] = t; }
    return ids.slice(0, G.WAR_ROUNDS);
  };
  G.warSeed = function () { return Math.floor(Math.random() * 65536); };
  // Everything a game needs (coin spots, questions, lit squares...), made from the seed.
  G.warGameData = function (id, seed) {
    var r = srng(seed * 31 + U.hash(id)), list = [], t, k;
    if (id === 'coins') {
      for (t = 300; t < 7800; t += 210 + r() * 150) list.push({ t: Math.round(t), x: r(), y: r(), bomb: r() < 0.18, gold: r() < 0.1 });
      return { secs: 8, items: list };
    }
    if (id === 'stop') {
      for (k = 0; k < 5; k++) list.push({ zone: 0.12 + r() * 0.56, width: 0.26 - k * 0.035, speed: 0.75 + k * 0.22 + r() * 0.1, phase: r() });
      return { tries: list };
    }
    if (id === 'whack') {
      for (t = 400; t < 9600; t += 330 + r() * 220) list.push({ t: Math.round(t), hole: Math.floor(r() * 9), mine: r() < 0.28, dur: Math.round(950 - (t / 9600) * 380) });
      return { secs: 10, pops: list };
    }
    if (id === 'math') {
      for (k = 0; k < 40; k++) {
        var type = Math.floor(r() * 4), a, b, q, ans;
        if (type === 0) { a = 2 + Math.floor(r() * 25); b = 2 + Math.floor(r() * 25); q = a + ' + ' + b; ans = a + b; }
        else if (type === 1) { a = 10 + Math.floor(r() * 40); b = 1 + Math.floor(r() * (a - 1)); q = a + ' − ' + b; ans = a - b; }
        else if (type === 2) { a = 2 + Math.floor(r() * 8); b = 2 + Math.floor(r() * 8); q = a + ' × ' + b; ans = a * b; }
        else { a = 2 + Math.floor(r() * 6); b = [2, 3, 4, 5, 10][Math.floor(r() * 5)]; q = a + ' items at $' + b; ans = a * b; }
        var opts = [ans];
        while (opts.length < 4) { var o = ans + (Math.floor(r() * 9) - 4) * (type === 2 || type === 3 ? 2 : 1); if (o > 0 && opts.indexOf(o) < 0) opts.push(o); }
        for (var i = 3; i > 0; i--) { var j = Math.floor(r() * (i + 1)), tmp = opts[i]; opts[i] = opts[j]; opts[j] = tmp; }
        list.push({ q: q, options: opts.map(function (o) { return (type === 3 ? '$' : '') + o; }), answer: opts.indexOf(ans) });
      }
      return { secs: 15, questions: list };
    }
    if (id === 'numbers') { // boards with 1..12 in a random order
      for (k = 0; k < 12; k++) list.push(shuffleWith(r, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]));
      return { secs: 20, boards: list };
    }
    if (id === 'colors') { // a color word printed in a (usually different) color
      for (k = 0; k < 70; k++) { var word = Math.floor(r() * 4), ink = r() < 0.8 ? (word + 1 + Math.floor(r() * 3)) % 4 : word; list.push({ word: word, ink: ink }); }
      return { secs: 15, items: list };
    }
    if (id === 'stack') { // how fast each new block slides (share of the width per second)
      for (k = 0; k < 20; k++) list.push({ speed: 0.5 + k * 0.07 + r() * 0.08, left: r() < 0.5 });
      return { secs: 30, blocks: list };
    }
    if (id === 'reaction') { // how long to wait before each GO
      for (k = 0; k < 5; k++) list.push(Math.round(1100 + r() * 2300));
      return { waits: list };
    }
    if (id === 'catch') {
      for (t = 300; t < 14200; t += 260 + r() * 200) list.push({ t: Math.round(t), x: r(), kind: r() < 0.2 ? 'bomb' : r() < 0.12 ? 'gold' : 'coin', spd: 0.5 + r() * 0.3 + t / 14000 * 0.45 });
      return { secs: 15, drops: list };
    }
    // memory: 5 levels with 3, 4, 5, 6 and 7 lit squares out of 9
    for (k = 3; k <= 7; k++) {
      var cells = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      for (var m = cells.length - 1; m > 0; m--) { var n = Math.floor(r() * (m + 1)), c = cells[m]; cells[m] = cells[n]; cells[n] = c; }
      list.push(cells.slice(0, k));
    }
    return { levels: list, show: 1300, secs: 25 };
  };

  function shuffleWith(r, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  G.rivalFans = function (g, rv) { return Math.max(40, Math.round(g.followers * (0.6 + 0.4 * rv.power))); };
  function aiScores(g, games, power) {
    var s = U.clamp(0.72 + 0.28 * power, 0.75, 1.25) * Math.min(1, 0.85 + g.week / 300);
    return games.map(function (id) { return Math.max(1, Math.round(G.warGame(id).typical * s * U.rand(0.75, 1.2))); });
  }
  function newBattle(g, kind, foe, seed) {
    var w = G.warInit(g), games = G.warOrder(seed);
    w.battle = { kind: kind, foe: foe, seed: seed, games: games, mine: [], rounds: [], done: false, result: null };
    return w.battle;
  }
  G.warAttackRival = function (g, name) {
    var w = G.warInit(g), rv = G.rivalByName(g, name);
    if (!rv || w.energy < 1 || (w.battle && !w.battle.done)) return null;
    w.energy--;
    var seed = G.warSeed(), games = G.warOrder(seed);
    return newBattle(g, 'rival', { name: rv.name, logo: rv.logo, color: rv.color, fans: G.rivalFans(g, rv), scores: aiScores(g, games, rv.power) }, seed);
  };
  G.warStartFriend = function (g, foe) {
    var w = G.warInit(g);
    if (!foe || foe.error || G.friendWarsLeft() < 1 || (w.battle && !w.battle.done)) return null;
    useFriendWar();
    return newBattle(g, 'friend', foe, foe.seed);
  };
  // A practice run makes a challenge code for friends. It's free and has no winner.
  G.warStartChallenge = function (g) {
    var w = G.warInit(g);
    if (w.battle && !w.battle.done) return null;
    return newBattle(g, 'challenge', null, G.warSeed());
  };
  G.warRematch = function (g) {
    var w = G.warInit(g), last = w.last;
    if (!last || (w.battle && !w.battle.done)) return null;
    if (last.kind === 'friend') return G.warStartFriend(g, last.foe);
    if (last.kind === 'rival') return G.warAttackRival(g, last.foe.name);
    return G.warStartChallenge(g);
  };
  // Saves your score for the current round and compares it with theirs.
  G.warSubmit = function (g, score) {
    var w = G.warInit(g), b = w.battle;
    if (!b || b.done) return null;
    var i = b.mine.length, mine = Math.max(0, Math.min(1023, Math.round(score) || 0));
    b.mine.push(mine);
    w.best = w.best || {};
    var gid = b.games[i], newBest = !b.forfeit && mine > (w.best[gid] || 0);
    if (newBest) w.best[gid] = mine;
    var round = { game: gid, mine: mine, best: newBest };
    if (b.foe) { round.theirs = b.foe.scores[i]; round.win = mine > round.theirs ? 1 : mine < round.theirs ? -1 : 0; }
    b.rounds.push(round);
    if (b.mine.length === b.games.length) finishBattle(g, b);
    return round;
  };
  function finishBattle(g, b) {
    var w = g.war, before = G.snap(g), t0 = w.trophies, text;
    b.done = true;
    w.last = { kind: b.kind, foe: b.foe };
    if (b.kind === 'challenge') {
      b.result = { won: null, text: 'Your scores are ready. Send the code to a friend and see if they can beat you!', chips: [] };
      G.save(g);
      return;
    }
    var mineWins = b.rounds.filter(function (r) { return r.win > 0; }).length, theirWins = b.rounds.filter(function (r) { return r.win < 0; }).length;
    var won = mineWins > theirWins, tiebreak = mineWins === theirWins;
    if (tiebreak) { // same number of rounds: whoever did better overall wins (a full tie goes to the defender)
      var edge = b.rounds.reduce(function (s, r) { return s + (r.mine - r.theirs) / G.warGame(r.game).typical; }, 0);
      won = edge > 0;
    }
    var friend = b.kind === 'friend', fans;
    if (won) {
      fans = Math.max(1, Math.round(b.foe.fans * G.WAR_FAN_SHARE));
      g.followers += fans;
      w.wins++;
      w.trophies += friend ? 5 : 3;
      if (friend) w.friendWins++;
      else { G.rivalShift(g, b.foe.name, -0.08); g.cash += G.prize(g, 0.4); }
      G.addXP(g, friend ? 30 : 25);
      text = 'You took ' + U.num(fans) + ' fans from ' + b.foe.name + '!';
      G.news(g, '⚔️ Beat ' + b.foe.name + ' in a war and took ' + U.num(fans) + ' fans!', 'good');
    } else {
      fans = Math.round(g.followers * G.WAR_FAN_SHARE);
      g.followers = Math.max(0, g.followers - fans);
      w.losses++;
      w.trophies = Math.max(0, w.trophies - (friend ? 2 : 1));
      if (!friend) G.rivalShift(g, b.foe.name, 0.03);
      G.addXP(g, friend ? 10 : 8);
      text = b.foe.name + ' won and took ' + U.num(fans) + ' of your fans.';
      G.news(g, '⚔️ Lost a war to ' + b.foe.name + '. They took ' + U.num(fans) + ' fans.', 'bad');
    }
    G.clampAll(g);
    var chips = G.diff(before, g), dt = w.trophies - t0;
    if (dt) chips.unshift({ txt: '🏆 ' + (dt > 0 ? '+' : '') + dt + ' war trophies', good: dt > 0 });
    if (b.forfeit) text = 'You quit the war. ' + text;
    else if (tiebreak) text = 'Tied ' + mineWins + '-' + theirWins + ' in rounds, decided on total points. ' + text;
    b.result = { won: won, score: [mineWins, theirWins], tiebreak: tiebreak, fans: fans, text: text, chips: chips, unlocked: G.checkAchievements(g), levelUps: G.takeLevelUps(g) };
    G.save(g);
  }
  G.warClose = function (g) { if (g.war && g.war.battle && g.war.battle.done) g.war.battle = null; };
  // Quit a war. Before the first game starts it's free (you get your energy or friend war back).
  // After that, the games you haven't played count as 0.
  G.warQuit = function (g) {
    var w = G.warInit(g), b = w.battle;
    if (!b || b.done) { w.battle = null; return { closed: true }; }
    if (!b.started || b.kind === 'challenge') {
      if (!b.started) { if (b.kind === 'rival') w.energy = Math.min(G.warMaxEnergy() + 1, w.energy + 1); else if (b.kind === 'friend') refundFriendWar(); }
      w.battle = null; G.save(g);
      return { canceled: true, kind: b.kind };
    }
    b.forfeit = true;
    while (!b.done) G.warSubmit(g, 0);
    return { forfeit: true };
  };

  // War codes (v3) are short enough to type: 24 letters and numbers like K7P2-QX9M-... They hold the seed that
  // picks the games, your 5 scores, your fans, trophies, business, logo and color, plus a checksum so nobody can
  // change the scores. A name doesn't fit, so the share message carries it (and the code works without it).
  var B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // no I, L, O or U, so nothing looks alike
  var CODE_V = 3;
  var FIELDS = [['v', 3], ['s', 16], ['a', 10], ['b', 10], ['c', 10], ['d', 10], ['e', 10], ['f', 7], ['t', 9], ['i', 6], ['l', 6], ['k', 3], ['id', 8]];
  function allLogos() { return CS.LOGOS.concat(CS.VIP_LOGOS || []); }
  function codeSum(bits) { return (U.hash(bits + '|cs-war3') >>> 0) & 4095; }
  function nbits(v, n) { return (Math.max(0, Math.min(Math.pow(2, n) - 1, v | 0)) + Math.pow(2, n)).toString(2).slice(1); }
  G.warCode = function (g, b) {
    var w = G.warInit(g), sc = b.mine, logos = allLogos();
    var vals = { v: CODE_V, s: b.seed, a: sc[0], b: sc[1], c: sc[2], d: sc[3], e: sc[4],
      f: Math.min(127, Math.round(Math.log2(g.followers + 1) * 4)), t: w.trophies, i: Object.keys(CS.IND).indexOf(g.company.industry),
      l: logos.indexOf(g.company.logo) < 0 ? 63 : logos.indexOf(g.company.logo), k: Math.max(0, CS.COLORS.indexOf(g.company.color)), id: U.hash(w.id) & 255 };
    var bits = FIELDS.map(function (f) { return nbits(vals[f[0]], f[1]); }).join('');
    bits += nbits(codeSum(bits), 12);
    var out = '';
    for (var i = 0; i < bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)];
    var code = out.match(/.{4}/g).join('-');
    w.sent = w.sent || [];
    if (w.sent.indexOf(code) < 0) w.sent = w.sent.concat(code).slice(-10);
    return code;
  };
  G.warCodeText = function (g, b) {
    var total = b.mine.reduce(function (s, x) { return s + x; }, 0), code = G.warCode(g, b);
    return '⚔️ ' + g.company.logo + ' ' + g.company.name + ' challenges you to a Company War! The winner takes 10% of the loser\'s fans.\n' +
      'My scores: ' + b.mine.join(' · ') + ' (total ' + total + '). Can you beat them?\n' +
      'In Company Simulator, open ⚔️ Wars and type this code:\n' + code + (CS.SHARE_URL ? '\n' + CS.SHARE_URL : '');
  };
  // Reads a typed or pasted code (spaces, dashes and small letters are fine). Returns a foe, or { error }.
  G.readWarCode = function (g, text) {
    text = String(text || '');
    if (/CSW[12]\./.test(text)) return { error: 'That code is from an older version. Ask your friend to update the game and send a new one!' };
    // A pasted message has the code with dashes in it. Something typed by hand can be just the 24 characters.
    var m = /(^|[^0-9A-Za-z])([0-9A-Za-z]{4}(?:-[0-9A-Za-z]{4}){5})(?![0-9A-Za-z])/.exec(text);
    var raw = (m ? m[2] : text).toUpperCase().replace(/[^0-9A-Z]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
    if (raw.length !== 24) return { error: raw.length ? 'A war code has 24 letters and numbers. Check it again!' : 'Type or paste your friend\'s war code first.' };
    var bits = '';
    for (var i = 0; i < raw.length; i++) { var n = B32.indexOf(raw[i]); if (n < 0) return { error: 'There\'s a typo in the code. Check it again!' }; bits += nbits(n, 5); }
    var pos = 0, d = {};
    FIELDS.forEach(function (f) { d[f[0]] = parseInt(bits.slice(pos, pos + f[1]), 2); pos += f[1]; });
    if (parseInt(bits.slice(pos, pos + 12), 2) !== codeSum(bits.slice(0, pos))) return { error: 'That code doesn\'t work. Check for a typo!' };
    if (d.v !== CODE_V) return { error: 'That code is from a different version of the game. Both of you need the newest update!' };
    var inds = Object.keys(CS.IND), ind = CS.IND[inds[d.i]];
    if (!ind) return { error: 'That code doesn\'t work. Check for a typo!' };
    var code = raw.match(/.{4}/g).join('-'), w = G.warInit(g);
    if ((w.sent || []).indexOf(code) >= 0) return { error: 'That\'s your own code! Send it to a friend.' };
    var named = /⚔️\s*\S+\s+(.{1,24}?)\s+challenges you/.exec(text), logos = allLogos();
    return { kind: 'friend', id: 'c' + d.id, code: code, name: named ? named[1] : 'Your friend\'s ' + ind.name, logo: logos[d.l] || ind.emoji, color: CS.COLORS[d.k] || '#7C4DFF',
      fans: Math.round(Math.pow(2, d.f / 4) - 1), trophies: d.t, seed: d.s, scores: [d.a, d.b, d.c, d.d, d.e] };
  };
  G.warShareText = function (g) {
    var b = g.war && g.war.battle;
    if (!b || !b.done || !b.result || b.result.won == null) return '';
    return (b.result.won ? '🏆 I beat ' : '😤 I lost to ') + b.foe.logo + ' ' + b.foe.name + ' in a Company War! ' +
      b.rounds.map(function (r) { return r.win > 0 ? '🟩' : r.win < 0 ? '🟥' : '🟨'; }).join('') + ' (' + b.result.score.join('-') + ')\n' +
      (b.result.won ? 'I took ' + U.num(b.result.fans) + ' of their fans 😎' : 'Rematch coming 🔥');
  };

  // ---------- golden customer, pets, offline earnings ----------

  G.tapGolden = function (g) {
    if (!g.golden || g.golden.tapped) return 0;
    g.golden.tapped = true;
    var amt = G.prize(g, U.rand(0.8, 1.6));
    g.cash += amt;
    g.stats.golden = (g.stats.golden || 0) + 1;
    G.addXP(g, 8);
    G.save(g);
    return amt;
  };
  G.offlineEarnings = function (g) {
    if (g.mode !== 'main' || !g.savedAt || g.over) return null;
    var mins = (Date.now() - g.savedAt) / 60000;
    var last = g.history[g.history.length - 1];
    if (mins < 20 || !last || last.net <= 0) return null;
    var hours = Math.min(12, mins / 60);
    var amt = U.nice(G.scale(g) * 0.04 * hours * (G.isVIP() ? 2 : 1));
    if (!amt) return null;
    g.cash += amt;
    G.save(g);
    return { amt: amt, hours: hours };
  };

  // ---------- VIP ----------

  G.isVIP = function () { return !!(CS.Store && CS.Store.isVIP()); };
  G.missionSlots = function () { return G.isVIP() ? 4 : 3; };
  G.fillMissions = function (g) { while (g.missions.length < G.missionSlots()) g.missions.push(G.newMission(g)); };


  // ---------- achievements ----------

  G.checkAchievements = function (g) {
    var s = g.stats, n = g.employees.length, out = [];
    var maxed = CS.UPGRADES.some(function (u) { return G.upLevel(g, u.id) >= u.cost.length; });
    var book = G.bookCount();
    var test = {
      open: g.week >= 1, hire1: g.flags.hired, team10: n >= 10, team25: n >= 25, team50: n >= 50,
      cash100k: g.cash >= 1e5, cash1m: g.cash >= 1e6, cash10m: g.cash >= 1e7, cash1b: g.cash >= 1e9,
      year1: g.week >= 52, year5: g.week >= 260, rep90: g.reputation >= 90,
      events50: s.decisions >= 50, events250: s.decisions >= 250, chaos: g.flags.chaos,
      recession: g.flags.survivedRecession, debtfree: g.flags.debtfree, viral: g.flags.viral,
      lovebirds: Object.keys(g.dating).length > 0, toughboss: s.fired >= 10, fullhouse: s.fullStreak >= 10,
      streak10: g.bestStreak >= 10, level5: g.level >= 5, level10: g.level >= 10, upgrade1: s.upgrades >= 1, maxup: maxed,
      missions10: s.missionsDone >= 10, vswin: s.vsWins >= 1, jackpot: g.flags.jackpot, quiz5: s.quizRight >= 5,
      legendary: g.flags.legendary, book50: book >= 50, book100: book >= 100, rank4: g.rank >= 3, rank7: g.rank >= 6,
      cupgold: g.cups && g.cups.gold > 0, powers10: s.powers >= 10, golden5: s.golden >= 5, pet: !!g.pet,
      daily: g.over && g.over.reason === 'daily', bankrupt: g.over && g.over.reason === 'bankrupt',
      starad: s.celebAds >= 1, famous10: s.celebAds >= 10, queenad: g.flags.queenAd,
      war1: g.war && g.war.wins >= 1, war10: g.war && g.war.wins >= 10, friendwar: g.war && g.war.friendWins >= 1,
      warlord: g.war && G.warRankIndex(g) >= 4
    };
    CS.ACHIEVEMENTS.forEach(function (a) {
      if (!g.achievements[a.id] && test[a.id]) { g.achievements[a.id] = g.week || 1; out.push(a); G.addXP(g, 25); }
    });
    return out;
  };

  // ---------- sharing ----------

  G.shareText = function (g) {
    var r = CS.RANKS[g.rank];
    return g.company.logo + ' ' + g.company.name + ' (' + CS.IND[g.company.industry].name + ')\n' +
      r.emoji + ' ' + r.name + ' · CEO level ' + g.level + '\n' +
      '💰 Worth ' + U.short(G.valuation(g)) + ' after ' + g.week + ' weeks\n' +
      '👥 ' + g.employees.length + ' workers · 📱 ' + U.num(g.followers) + ' followers\n' +
      'Can you beat me? #CompanySimulator';
  };
  G.dailyGrid = function (g) {
    var cells = '', h = g.history;
    for (var i = 0; i < 13; i++) {
      var chunk = h.filter(function (x) { return x.week > i * 4 && x.week <= i * 4 + 4; });
      if (!chunk.length) { cells += '⬜'; continue; }
      var net = chunk.reduce(function (s, x) { return s + x.net; }, 0);
      cells += net > G.tierOf(g).rv * 0.05 ? '🟩' : net < 0 ? '🟥' : '🟨';
    }
    return cells;
  };
  G.dailyShare = function (g) {
    return 'Company Sim Daily #' + g.dailyNum + ' ' + g.company.logo + '\n' +
      '💰 ' + U.short(G.valuation(g)) + ' company value\n' +
      G.dailyGrid(g) + '\n' +
      '👥 ' + g.employees.length + ' · 📱 ' + U.num(g.followers) + ' · 🔥 ' + g.stats.virals + ' viral\n' +
      '#CompanySimulator';
  };

  // ---------- saves, legacy, book, settings, daily gift ----------

  G.save = function (g) { g.rng = U.state(); g.savedAt = Date.now(); writeJSON(g.mode === 'daily' ? KEYS.daily : KEYS.main, g); };
  G.load = function (mode) {
    var g = readJSON(mode === 'daily' ? KEYS.daily : KEYS.main);
    if (!g || g.v !== 2) return null;
    if (mode === 'daily' && g.dailyNum !== G.dailyInfo().dailyNum) return null;
    return g;
  };
  // Restores the random number stream and fills in anything older saves are missing.
  G.resume = function (g) {
    if (g.rng != null) U.seed(g.rng);
    if (!g.rivalCos) G.makeRivals(g);
    g.powers = g.powers || {};
    g.cups = g.cups || { gold: 0, silver: 0, bronze: 0 };
    g.avatar = g.avatar || '😎';
    g.stats.powers = g.stats.powers || 0;
    g.stats.golden = g.stats.golden || 0;
    g.adCd = g.adCd || {};
    G.warInit(g);
    // Events from older versions of the game may not exist anymore.
    g.queue = g.queue.filter(function (x) { return CS.EV[x.id]; });
    g.pending = g.pending.filter(function (p) { return CS.EV[p.id]; });
    G.fillMissions(g);
  };
  G.clearSave = function (mode) { removeKey(mode === 'daily' ? KEYS.daily : KEYS.main); };

  G.loadLegacy = function () { var d = readJSON(KEYS.legacy); return d && d.companies ? d : { companies: [] }; };
  G.recordLegacy = function (g, reason) {
    if (g.mode === 'daily') return;
    var L = G.loadLegacy();
    L.companies.unshift({ name: g.company.name, logo: g.company.logo, industry: g.company.industry, weeks: g.week, peakCash: g.stats.peakCash, staff: g.stats.maxStaff, reason: reason });
    L.companies = L.companies.slice(0, 30);
    writeJSON(KEYS.legacy, L);
  };

  var bookCache = null;
  G.book = function () { if (!bookCache) bookCache = readJSON(KEYS.book) || {}; return bookCache; };
  G.seen = function (id) { var b = G.book(); if (!b[id]) { b[id] = 1; writeJSON(KEYS.book, b); } };
  G.bookCount = function () { var b = G.book(); return CS.EVENTS.filter(function (d) { return b[d.id]; }).length; };

  G.settings = function () { return Object.assign({ sound: true, vibe: true }, readJSON(KEYS.settings) || {}); };
  G.setSetting = function (k, v) { var s = G.settings(); s[k] = v; writeJSON(KEYS.settings, s); };

  G.dailyBest = function () { return readJSON(KEYS.best) || {}; };
  G.recordDaily = function (g) {
    var b = G.dailyBest(), v = Math.round(G.valuation(g));
    if (!b[g.dailyNum] || v > b[g.dailyNum]) { b[g.dailyNum] = v; writeJSON(KEYS.best, b); }
    return b[g.dailyNum];
  };

  G.GIFTS = [0.3, 0.4, 0.5, 0.7, 0.9, 1.2, 2];
  G.giftStatus = function () {
    var d = readJSON(KEYS.gift) || {}, today = U.today();
    if (d.last === today) return { available: false, day: d.day || 1 };
    var y = new Date(); y.setDate(y.getDate() - 1);
    var yest = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
    var day = d.last === yest ? (d.day % 7) + 1 : 1;
    return { available: true, day: day };
  };
  G.claimGift = function (g) {
    var st = G.giftStatus();
    if (!st.available) return 0;
    var amt = U.nice(G.scale(g) * G.GIFTS[st.day - 1] * (G.isVIP() ? 2 : 1));
    g.cash += amt;
    writeJSON(KEYS.gift, { last: U.today(), day: st.day });
    G.news(g, '🎁 Daily gift: ' + U.money(amt), 'good');
    G.save(g);
    return amt;
  };

  // Share the game with friends: +10% cash, once a day.
  G.shareGameReady = function () { return (readJSON(KEYS.share) || {}).last !== U.today(); };
  G.shareGameAmount = function (g) { return U.nice(Math.max(g.cash * 0.1, G.prize(g, 0.4))); };
  G.claimShareGame = function (g) {
    if (!G.shareGameReady()) return 0;
    var amt = G.shareGameAmount(g);
    g.cash += amt;
    writeJSON(KEYS.share, { last: U.today() });
    G.news(g, '📤 Shared the game: +' + U.money(amt), 'good');
    G.save(g);
    return amt;
  };
  G.shareGameText = function (g) {
    return 'I\'m running ' + (g ? g.company.logo + ' ' + g.company.name + ', my own ' + CS.IND[g.company.industry].name.toLowerCase() : 'my own company') +
      ' in Company Simulator! 🏢💰 Can you build a bigger empire than me?' + (CS.SHARE_URL ? '\n' + CS.SHARE_URL : '');
  };
})();
