// Event definitions.
//   id, cat, icon, w (weight or fn), cd (cooldown weeks), minWeek, cond(g[,ctx]), setup(g) -> ctx | null
//   title/text: string or fn(g, ctx)
//   choices: [{ t: label, d: hint, cost: fn(g,ctx), fx: fn(g,ctx) -> result text }]
//   Events without choices are minor: fx runs automatically and the line goes to the week report.
//   auto: which choice staff pick when the week has too many decisions (default: last).
//   chainOnly: only happens as a follow-up scheduled by another event.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var U = CS.U, G = CS.G;
  var E = [];
  function def(d) { E.push(d); }

  // ----- helpers for writing events -----
  function N(g, id) { var e = G.emp(g, id); return e ? e.name : 'someone'; }
  function first(g, id) { return N(g, id).split(' ')[0]; }
  function emp(g, id) { return G.emp(g, id); }
  function pickEmp(g, filter, weightFn) {
    var list = g.employees.filter(filter || function () { return true; });
    if (!list.length) return null;
    return weightFn ? U.weighted(list, weightFn) : U.pick(list);
  }
  function pickOther(g, a, filter) {
    return pickEmp(g, function (e) { return e.id !== a.id && (!filter || filter(e)); });
  }
  function traitW(t, heavy) { return function (e) { return G.has(e, t) ? (heavy || 6) : 1; }; }
  function staff(n) { return function (g) { return g.employees.length >= n; }; }
  function spend(g, amt) { g.cash -= amt; return amt; }
  function cost(frac) { return function (g) { return G.cost(g, frac); }; }
  function payCost(frac) { return function (g) { return spend(g, G.cost(g, frac)); }; }
  function team(g, d) { g.employees.forEach(function (e) { e.morale += d; }); }
  function rep(g, d) { g.reputation += d; }
  function aw(g, d) { g.awareness = Math.min(G.awCap(g), g.awareness + d); }
  function rival(g) { return U.pick(g.rivals); }
  function M(n) { return U.money(n); }
  function hasRole(r) { return function (g) { return g.employees.some(function (e) { return e.role === r; }); }; }

  // =====================================================================
  // EMPLOYEE EVENTS
  // =====================================================================

  def({ id: 'fight', cat: 'Employees', icon: '🥊', w: 5, cd: 5, cond: staff(2),
    setup: function (g) {
      var a = pickEmp(g, null, traitW('aggressive', 8)); if (!a) return null;
      var b = pickOther(g, a); return b ? { a: a.id, b: b.id } : null;
    },
    title: function (g, c) { return first(g, c.a) + ' and ' + first(g, c.b) + ' got into a fight'; },
    text: function (g, c) { return N(g, c.a) + ' and ' + N(g, c.b) + ' started shouting at each other in front of customers. Now nobody is talking to anybody.'; },
    choices: [
      { t: 'Sit them down and mediate', d: 'Takes your time, usually works',
        fx: function (g, c) {
          if (U.chance(0.6)) { G.addRel(g, c.a, c.b, 30); return 'They shook hands. Things are awkward, but calm.'; }
          G.addRel(g, c.a, c.b, -10); G.schedule(g, 'feud', U.ri(1, 2), c);
          return 'It seemed to work, but ' + first(g, c.b) + ' left the meeting still angry.';
        } },
      { t: 'Give both a written warning', d: 'Hurts morale a little',
        fx: function (g, c) { emp(g, c.a).morale -= 8; emp(g, c.b).morale -= 8; G.addRel(g, c.a, c.b, -5); return 'Both signed the warning. The shouting stopped.'; } },
      { t: 'Fire them', label: function (g, c) { return 'Fire ' + first(g, c.a); }, d: 'Pays one week severance',
        fx: function (g, c) { G.removeEmp(g, emp(g, c.a), 'fired'); return 'You made an example of them. The team got the message.'; } },
      { t: 'Ignore it', d: 'They are adults',
        fx: function (g, c) { G.addRel(g, c.a, c.b, -30); G.schedule(g, 'feud', 1, c); return 'You hope it blows over.'; } }
    ] });

  def({ id: 'feud', cat: 'Employees', icon: '🔥', chainOnly: true,
    title: function (g, c) { return 'The feud is getting worse'; },
    text: function (g, c) { return 'The tension between ' + N(g, c.a) + ' and ' + N(g, c.b) + ' has spread to the whole team. ' + first(g, c.b) + ' says they will quit unless something changes.'; },
    choices: [
      { t: 'Give them a raise', label: function (g, c) { return 'Give ' + first(g, c.b) + ' a 10% raise to stay'; },
        fx: function (g, c) { G.raise(g, emp(g, c.b), 0.1); return first(g, c.b) + ' stays, for now. ' + first(g, c.a) + ' noticed the raise.'; } },
      { t: 'Fire the troublemaker', label: function (g, c) { return 'Fire ' + first(g, c.a); },
        fx: function (g, c) { G.removeEmp(g, emp(g, c.a), 'fired'); team(g, 3); return 'The office is quieter already.'; } },
      { t: 'Let them quit', label: function (g, c) { return 'Let ' + first(g, c.b) + ' go'; },
        fx: function (g, c) {
          var b = emp(g, c.b), r = rival(g);
          G.removeEmp(g, b, 'quit');
          G.schedule(g, 'joined_rival', U.ri(1, 3), { name: b.name, rival: r, creative: G.has(b, 'creative') });
          return first(g, c.b) + ' cleared their desk and left.';
        } }
    ] });

  def({ id: 'joined_rival', cat: 'Competitors', icon: '🕵️', chainOnly: true,
    fx: function (g, c) {
      if (c.creative || U.chance(0.35)) G.schedule(g, 'idea_stolen', U.ri(3, 6), c);
      G.news(g, c.name + ' joined ' + c.rival + '.', 'bad');
      return 'Your former employee ' + c.name + ' has joined ' + c.rival + '.';
    } });

  def({ id: 'idea_stolen', cat: 'Competitors', icon: '💡', chainOnly: true,
    title: function (g, c) { return c.rival + ' launched your idea'; },
    text: function (g, c) { return c.rival + ' just launched something that looks exactly like an idea ' + c.name + ' pitched while working for you. Customers are going there to try it.'; },
    choices: [
      { t: 'Sue them', d: 'Expensive, 50/50', cost: cost(1.5),
        fx: function (g, c) {
          spend(g, G.cost(g, 1.5));
          if (U.chance(0.5)) { var won = G.cost(g, 4); g.cash += won; G.news(g, 'Won a lawsuit against ' + c.rival + '.', 'good'); return 'You won! The court awarded you ' + M(won) + '.'; }
          G.mod(g, 'demand', 0.9, 4, 'Rival copied your idea'); return 'You lost the case. They keep selling it.';
        } },
      { t: 'Launch it better and cheaper', cost: cost(0.8),
        fx: function (g, c) { spend(g, G.cost(g, 0.8)); aw(g, 12); return 'Your version gets better reviews. Customers noticed.'; } },
      { t: 'Let it go',
        fx: function (g, c) { G.mod(g, 'demand', 0.88, 5, 'Rival copied your idea'); return 'Some customers switch to ' + c.rival + ' for a while.'; } }
    ] });

  def({ id: 'late', cat: 'Employees', icon: '⏰', w: 4,
    setup: function (g) { var a = pickEmp(g, null, function (e) { return G.has(e, 'unreliable') ? 10 : e.reliability < 70 ? 3 : 0.5; }); return a ? { a: a.id } : null; },
    title: function (g, c) { return first(g, c.a) + ' keeps coming in late'; },
    text: function (g, c) { return N(g, c.a) + ' has been late four times this month. The others are covering and they are starting to complain.'; },
    choices: [
      { t: 'Talk to them privately',
        fx: function (g, c) {
          var a = emp(g, c.a);
          if (U.chance(0.5)) { a.loyalty += 15; a.reliability += 10; return first(g, c.a) + ' opens up about problems at home. They promise to do better, and they mean it.'; }
          return first(g, c.a) + ' nods, apologizes, and is late again on Friday.';
        } },
      { t: 'Formal warning', fx: function (g, c) { var a = emp(g, c.a); a.reliability += 12; a.morale -= 10; return 'They are on time now, but not happy about it.'; } },
      { t: 'Dock their pay', fx: function (g, c) { var a = emp(g, c.a); a.reliability += 8; a.morale -= 18; a.loyalty -= 10; g.cash += a.salary * 0.2; return 'You saved a little money and lost a lot of goodwill.'; } },
      { t: 'Fire them', fx: function (g, c) { G.removeEmp(g, emp(g, c.a), 'fired'); return 'You let them go.'; } },
      { t: 'Ignore it', fx: function (g, c) { team(g, -3); return 'The team keeps covering. They are not thrilled.'; } }
    ] });

  def({ id: 'raise_request', cat: 'Employees', icon: '💵', w: 5,
    setup: function (g) {
      var a = pickEmp(g, null, function (e) { var w = 1 + (G.has(e, 'greedy') ? 4 : 0) + (G.has(e, 'ambitious') ? 3 : 0); return e.salary < G.market(g, e.role, e.level) ? w * 2 : w; });
      return a ? { a: a.id } : null;
    },
    title: function (g, c) { return first(g, c.a) + ' wants a raise'; },
    text: function (g, c) {
      var a = emp(g, c.a);
      return N(g, c.a) + ' (' + G.title(g, a) + ') asks for more money. They earn ' + M(a.salary) + ' a week. The market rate is about ' + M(G.market(g, a.role, a.level)) + '.';
    },
    choices: [
      { t: 'Give them 10%', fx: function (g, c) { G.raise(g, emp(g, c.a), 0.1); return 'They thank you and head back to work smiling.'; } },
      { t: 'Offer 5%', fx: function (g, c) { var a = emp(g, c.a); G.raise(g, a, 0.05); if (G.has(a, 'greedy')) { a.morale -= 8; return 'They take it, but wanted more.'; } return 'They accept.'; } },
      { t: 'Promise a raise in two months', fx: function (g, c) { G.schedule(g, 'raise_promise', 8, c); return 'They agree to wait. They will remember.'; } },
      { t: 'Refuse', fx: function (g, c) {
        var a = emp(g, c.a); a.morale -= 15; a.loyalty -= 10;
        if (G.has(a, 'ambitious') || G.has(a, 'greedy')) G.schedule(g, 'resign', U.ri(2, 5), c);
        return 'They go quiet. You notice them updating their CV.';
      } }
    ] });

  def({ id: 'raise_promise', cat: 'Employees', icon: '📅', chainOnly: true,
    title: function (g, c) { return first(g, c.a) + ' reminds you of your promise'; },
    text: function (g, c) { return 'Two months ago you promised ' + N(g, c.a) + ' a raise. They are standing at your door.'; },
    choices: [
      { t: 'Keep your word (10%)', fx: function (g, c) { var a = emp(g, c.a); G.raise(g, a, 0.1); a.loyalty += 15; return 'They respect that you kept your promise.'; } },
      { t: 'Ask them to wait longer', fx: function (g, c) { var a = emp(g, c.a); a.morale -= 25; a.loyalty -= 20; if (U.chance(0.5)) G.schedule(g, 'resign', 1, c); return 'They laugh, but not in a good way.'; } }
    ] });

  def({ id: 'dating', cat: 'Employees', icon: '💘', w: 3, cond: staff(3),
    setup: function (g) {
      var a = pickEmp(g, function (e) { return !G.partnerOf(g, e); }); if (!a) return null;
      var b = pickOther(g, a, function (e) { return !G.partnerOf(g, e) && G.getRel(g, a.id, e.id) > -20; });
      return b ? { a: a.id, b: b.id } : null;
    },
    title: function (g, c) { return first(g, c.a) + ' and ' + first(g, c.b) + ' are dating'; },
    text: function (g, c) { return 'Everybody knows. They are holding hands in the break room. ' + N(g, c.a) + ' and ' + N(g, c.b) + ' ask if this is a problem.'; },
    choices: [
      { t: 'Congratulate them', fx: function (g, c) {
        g.dating[G.relKey(c.a, c.b)] = true; G.addRel(g, c.a, c.b, 50); emp(g, c.a).morale += 8; emp(g, c.b).morale += 8;
        if (U.chance(0.35)) G.schedule(g, 'breakup', U.ri(6, 14), c);
        return 'They are very happy. Some coworkers roll their eyes.';
      } },
      { t: 'No dating at work', fx: function (g, c) { emp(g, c.a).morale -= 12; emp(g, c.b).morale -= 12; team(g, -2); return 'They say they will keep it professional. They keep dating anyway.'; } },
      { t: 'Stay out of it', fx: function (g, c) { g.dating[G.relKey(c.a, c.b)] = true; G.addRel(g, c.a, c.b, 40); if (U.chance(0.3)) G.schedule(g, 'breakup', U.ri(5, 12), c); return 'Love is in the air.'; } }
    ] });

  def({ id: 'breakup', cat: 'Employees', icon: '💔', chainOnly: true,
    title: function (g, c) { return first(g, c.a) + ' and ' + first(g, c.b) + ' broke up'; },
    start: function (g, c) { delete g.dating[G.relKey(c.a, c.b)]; },
    text: function (g, c) { return 'It ended badly. They sit on opposite sides of the room and the whole team has picked sides.'; },
    choices: [
      { t: 'Change their schedules so they rarely meet', cost: cost(0.05), fx: function (g, c) { spend(g, G.cost(g, 0.05)); G.addRel(g, c.a, c.b, -30); return 'Out of sight, slowly out of mind.'; } },
      { t: 'Pay for a team outing to reset the mood', cost: cost(0.3), fx: function (g, c) { spend(g, G.cost(g, 0.3)); team(g, 8); G.addRel(g, c.a, c.b, -20); return 'Bowling helped. Mostly.'; } },
      { t: 'Let them sort it out', fx: function (g, c) {
        G.addRel(g, c.a, c.b, -70); emp(g, c.a).morale -= 15; emp(g, c.b).morale -= 15;
        if (U.chance(0.4)) G.schedule(g, 'resign', U.ri(1, 3), { a: U.chance(0.5) ? c.a : c.b });
        return 'The atmosphere is icy.';
      } }
    ] });

  def({ id: 'resign', cat: 'Employees', icon: '📝', chainOnly: true,
    title: function (g, c) { return first(g, c.a) + ' hands in their resignation'; },
    text: function (g, c) { var a = emp(g, c.a); return N(g, c.a) + ' (' + G.title(g, a) + ') puts a letter on your desk. "I have found something better."'; },
    choices: [
      { t: 'Counteroffer: 20% raise', fx: function (g, c) {
        var a = emp(g, c.a);
        if (U.chance(G.has(a, 'loyal') ? 0.9 : 0.6)) { G.raise(g, a, 0.2); a.morale = Math.max(a.morale, 60); return first(g, c.a) + ' tears up the letter.'; }
        quitToRival(g, a); return 'They thank you, but their mind is made up.';
      } },
      { t: 'Ask why they are leaving', fx: function (g, c) {
        var a = emp(g, c.a);
        if (U.chance(0.35)) { a.morale = 55; a.loyalty += 10; return 'You had a real talk. They decide to give it another month.'; }
        quitToRival(g, a); return 'They were unhappy for a long time. They leave.';
      } },
      { t: 'Wish them luck', fx: function (g, c) { quitToRival(g, emp(g, c.a)); return 'They leave on good terms.'; } }
    ] });

  function quitToRival(g, a) {
    var r = rival(g);
    G.removeEmp(g, a, 'quit');
    if (U.chance(0.5)) G.schedule(g, 'joined_rival', U.ri(1, 3), { name: a.name, rival: r, creative: G.has(a, 'creative') });
  }

  def({ id: 'jealous', cat: 'Employees', icon: '😒', chainOnly: true,
    title: function (g, c) { return first(g, c.a) + ' is jealous of ' + first(g, c.b); },
    text: function (g, c) { return N(g, c.a) + ' is furious that ' + N(g, c.b) + ' got promoted instead of them and is telling everyone it was unfair.'; },
    choices: [
      { t: 'Explain the decision', fx: function (g, c) { if (U.chance(0.55)) return 'They grumble but accept it.'; emp(g, c.a).morale -= 10; G.addRel(g, c.a, c.b, -25); return 'They do not buy it.'; } },
      { t: 'Promise them the next promotion', fx: function (g, c) { emp(g, c.a).morale += 8; G.schedule(g, 'promotion_request', U.ri(6, 12), { a: c.a }); return 'They will hold you to that.'; } },
      { t: 'Tell them to get over it', fx: function (g, c) { var a = emp(g, c.a); a.morale -= 18; a.loyalty -= 10; G.addRel(g, c.a, c.b, -35); return 'They go back to their desk and slam the drawer.'; } }
    ] });

  def({ id: 'theft', cat: 'Employees', icon: '🫳', w: 3, minWeek: 4,
    setup: function (g) { var a = pickEmp(g, null, traitW('greedy', 8)); return a ? { a: a.id, amt: G.cost(g, 0.15) } : null; },
    title: 'Money is missing from the register',
    start: function (g, c) { g.cash -= c.amt; },
    text: function (g, c) { return M(c.amt) + ' has gone missing. The security footage is blurry, but it looks a lot like ' + N(g, c.a) + '.'; },
    choices: [
      { t: 'Confront them', fx: function (g, c) {
        var a = emp(g, c.a);
        if (G.has(a, 'greedy') || U.chance(0.3)) { G.removeEmp(g, a, 'fired'); g.cash += c.amt * 0.5; return 'They confessed and paid back half. You fired them.'; }
        a.morale -= 20; a.loyalty -= 20; return 'It was not them. They are deeply offended.';
      } },
      { t: 'Call the police', fx: function (g, c) {
        var a = emp(g, c.a);
        if (G.has(a, 'greedy') || U.chance(0.3)) { G.removeEmp(g, a, 'fired', true); G.news(g, a.name + ' was arrested for theft.', 'bad'); team(g, -3); return 'The police arrested ' + first(g, c.a) + '. The team is shaken.'; }
        team(g, -8); return 'The police found nothing. Everyone feels like a suspect.';
      } },
      { t: 'Install better cameras', cost: cost(0.2), fx: function (g, c) { spend(g, G.cost(g, 0.2)); return 'No more missing money. Probably.'; } },
      { t: 'Let it go', fx: function (g, c) { if (U.chance(0.5)) G.schedule(g, 'theft_again', U.ri(3, 6), c); return 'You write it off.'; } }
    ] });

  def({ id: 'theft_again', cat: 'Employees', icon: '🫳', chainOnly: true,
    fx: function (g, c) { var amt = G.cost(g, 0.3); g.cash -= amt; return 'More money is missing: ' + M(amt) + '. Letting it go last time was a mistake.'; } });

  def({ id: 'spy', cat: 'Employees', icon: '🕵️', w: 1.5, minWeek: 10, cond: staff(4),
    setup: function (g) { var a = pickEmp(g, null, function (e) { return (G.has(e, 'greedy') ? 5 : 1) * (e.loyalty < 40 ? 3 : 1); }); var b = a && pickOther(g, a); return b ? { a: a.id, b: b.id, rival: rival(g) } : null; },
    title: function (g, c) { return first(g, c.a) + ' is feeding secrets to ' + c.rival; },
    text: function (g, c) { return N(g, c.b) + ' found messages on a shared computer. ' + N(g, c.a) + ' has been sending your prices and plans to ' + c.rival + '.'; },
    choices: [
      { t: 'Fire them on the spot', fx: function (g, c) { G.removeEmp(g, emp(g, c.a), 'fired'); emp(g, c.b).loyalty += 10; return 'Security walks them out.'; } },
      { t: 'Feed them fake plans', fx: function (g, c) {
        if (U.chance(0.6)) { aw(g, 15); G.news(g, c.rival + ' launched a promotion that flopped.', 'good'); G.removeEmp(g, emp(g, c.a), 'fired', true); return c.rival + ' fell for it and wasted a fortune. Then you fired the spy.'; }
        G.mod(g, 'demand', 0.9, 4, 'Leaked plans'); return 'They figured it out. ' + c.rival + ' undercut your prices.';
      } },
      { t: 'Reward the whistleblower', label: function (g, c) { return 'Fire them and reward ' + first(g, c.b); }, cost: function (g, c) { var b = emp(g, c.b); return b ? b.salary * 2 : 0; },
        fx: function (g, c) { G.bonus(g, emp(g, c.b)); G.removeEmp(g, emp(g, c.a), 'fired'); team(g, 3); return 'The team sees that honesty pays.'; } }
    ] });

  def({ id: 'broke_equipment', cat: 'Employees', icon: '💥', w: 3,
    setup: function (g) { var a = pickEmp(g, function (e) { return e.role === 'front'; }, traitW('lazy', 3)); return a ? { a: a.id, amt: G.cost(g, 0.35) } : null; },
    title: function (g, c) { return first(g, c.a) + ' broke expensive equipment'; },
    text: function (g, c) { return N(g, c.a) + ' dropped something important. Replacing it costs ' + M(c.amt) + '.'; },
    choices: [
      { t: 'Company pays for it', cost: function (g, c) { return c.amt; }, fx: function (g, c) { spend(g, c.amt); emp(g, c.a).loyalty += 8; return 'Accidents happen. ' + first(g, c.a) + ' is grateful.'; } },
      { t: 'Take it out of their pay', cost: function (g, c) { return c.amt / 2; }, fx: function (g, c) { spend(g, c.amt / 2); var a = emp(g, c.a); a.morale -= 20; a.loyalty -= 15; return 'They pay half. They will not forget it.'; } },
      { t: 'Run without it for now', fx: function (g, c) { G.mod(g, 'capacity', 0.85, 3, 'Broken equipment'); return 'Work is slower for a few weeks.'; } }
    ] });

  def({ id: 'customer_argument', cat: 'Employees', icon: '🗯️', w: 4,
    setup: function (g) { var a = pickEmp(g, function (e) { return e.role === 'front' || e.role === 'sales'; }, traitW('aggressive', 5)); return a ? { a: a.id } : null; },
    title: function (g, c) { return first(g, c.a) + ' argued with a customer'; },
    text: function (g, c) { return 'A customer yelled at ' + N(g, c.a) + ', and ' + first(g, c.a) + ' yelled back. Other customers were filming.'; },
    choices: [
      { t: 'Back your employee', fx: function (g, c) { var a = emp(g, c.a); a.morale += 10; a.loyalty += 10; rep(g, -2); if (U.chance(0.35)) G.schedule(g, 'complaint_viral', 1, {}); return 'Your staff love you for it. The customer posts an angry review.'; } },
      { t: 'Apologize to the customer', fx: function (g, c) { emp(g, c.a).morale -= 8; rep(g, 1); return 'The customer leaves satisfied. ' + first(g, c.a) + ' feels thrown under the bus.'; } },
      { t: 'Fire them', label: function (g, c) { return 'Fire ' + first(g, c.a); }, fx: function (g, c) { G.removeEmp(g, emp(g, c.a), 'fired'); rep(g, 1); return 'The customer is satisfied. The staff are nervous.'; } }
    ] });

  def({ id: 'star', cat: 'Employees', icon: '🌟', w: 3,
    setup: function (g) { var a = pickEmp(g, null, function (e) { return (G.has(e, 'hardworking') ? 5 : 1) * (e.skill > 60 ? 2 : 1); }); return a ? { a: a.id } : null; },
    title: function (g, c) { return first(g, c.a) + ' is on fire this month'; },
    text: function (g, c) { return N(g, c.a) + ' has been doing the work of two people. Customers ask for them by name.'; },
    choices: [
      { t: 'Give a bonus', cost: function (g, c) { var a = emp(g, c.a); return a ? a.salary * 2 : 0; }, fx: function (g, c) { G.bonus(g, emp(g, c.a)); return 'They beam. You just earned a lot of loyalty.'; } },
      { t: 'Promote them', fx: function (g, c) { var a = emp(g, c.a); if (a.level >= 3) { G.promote(g, a, true); } else G.promote(g, a); return first(g, c.a) + ' is now ' + G.title(g, a) + '.'; } },
      { t: 'Say thanks', fx: function (g, c) { var a = emp(g, c.a); if (G.has(a, 'ambitious') || G.has(a, 'greedy')) { a.morale -= 6; return 'A thank-you was not what they were hoping for.'; } a.morale += 4; return 'They appreciate being noticed.'; } }
    ] });

  def({ id: 'promotion_request', cat: 'Employees', icon: '🪜', w: 3, minWeek: 6,
    setup: function (g) { var a = pickEmp(g, function (e) { return e.role !== 'mgr' || e.level < 3; }, traitW('ambitious', 8)); return a ? { a: a.id } : null; },
    title: function (g, c) { return first(g, c.a) + ' asks for a promotion'; },
    text: function (g, c) { var a = emp(g, c.a); return N(g, c.a) + ' has been here ' + a.weeks + ' weeks and wants to move up. Skill: ' + Math.round(a.skill) + '/100.'; },
    choices: [
      { t: 'Promote them', fx: function (g, c) { var a = emp(g, c.a); if (a.level >= 3) G.promote(g, a, true); else G.promote(g, a); if (a.skill < 45 && U.chance(0.5)) G.schedule(g, 'out_of_depth', U.ri(2, 5), c); return 'Congratulations, ' + G.title(g, a) + '.'; } },
      { t: 'Pay for training first', cost: cost(0.15), fx: function (g, c) { spend(g, G.cost(g, 0.15)); var a = emp(g, c.a); a.skill += 8; a.morale += 4; return 'They come back sharper. Skill +8.'; } },
      { t: 'Not yet', fx: function (g, c) { var a = emp(g, c.a); a.morale -= 12; if (G.has(a, 'ambitious') && U.chance(0.4)) G.schedule(g, 'resign', U.ri(3, 8), c); return 'They are disappointed.'; } }
    ] });

  def({ id: 'out_of_depth', cat: 'Management', icon: '🫠', chainOnly: true,
    title: function (g, c) { return first(g, c.a) + ' is struggling in the new role'; },
    text: function (g, c) { return 'Since the promotion, ' + N(g, c.a) + ' has missed deadlines and the team is confused.'; },
    choices: [
      { t: 'Give them a coach', cost: cost(0.2), fx: function (g, c) { spend(g, G.cost(g, 0.2)); emp(g, c.a).skill += 12; return 'Slowly, they grow into the job.'; } },
      { t: 'Demote them back', fx: function (g, c) { G.demote(g, emp(g, c.a)); return 'Awkward, but the team is relieved.'; } },
      { t: 'Give it time', fx: function (g, c) { team(g, -4); G.mod(g, 'capacity', 0.93, 4, 'Weak leadership'); return 'Things run a bit worse for a while.'; } }
    ] });

  def({ id: 'rumors', cat: 'Employees', icon: '🗣️', w: 3, cond: staff(3),
    setup: function (g) { var a = pickEmp(g); var b = a && pickOther(g, a); return b ? { a: a.id, b: b.id } : null; },
    title: function (g, c) { return first(g, c.a) + ' is spreading rumors'; },
    text: function (g, c) { return N(g, c.a) + ' is telling people that ' + N(g, c.b) + ' is about to be fired. ' + first(g, c.b) + ' is very upset.'; },
    choices: [
      { t: 'Shut the rumor down publicly', fx: function (g, c) { emp(g, c.b).morale += 10; emp(g, c.a).morale -= 6; G.addRel(g, c.a, c.b, -15); return 'You set the record straight in the team meeting.'; } },
      { t: 'Talk to them privately', label: function (g, c) { return 'Talk to ' + first(g, c.a) + ' privately'; }, fx: function (g, c) { G.addRel(g, c.a, c.b, 5); return 'They promise to stop. You will see.'; } },
      { t: 'Ignore it', fx: function (g, c) { emp(g, c.b).morale -= 15; G.addRel(g, c.a, c.b, -30); return 'The rumor keeps spreading.'; } }
    ] });

  def({ id: 'best_friends', cat: 'Employees', icon: '🫶', w: 2, cond: staff(2),
    setup: function (g) { var a = pickEmp(g, null, traitW('friendly', 4)); var b = a && pickOther(g, a); return b ? { a: a.id, b: b.id } : null; },
    fx: function (g, c) { G.addRel(g, c.a, c.b, 60); emp(g, c.a).morale += 5; emp(g, c.b).morale += 5; return N(g, c.a) + ' and ' + N(g, c.b) + ' have become best friends. They now finish each other\'s sentences.'; } });

  def({ id: 'productive_week', cat: 'Employees', icon: '📈', w: 2,
    setup: function (g) { var a = pickEmp(g, function (e) { return e.role === 'front'; }); return a ? { a: a.id } : null; },
    fx: function (g, c) { var a = emp(g, c.a); a.skill += 3; G.mod(g, 'capacity', 1.05, 1, 'Hot streak'); return N(g, c.a) + ' figured out a faster way to work. Skill +3.'; } });

  def({ id: 'team_quit_threat', cat: 'Employees', icon: '🪧', w: function (g) { return G.avgMorale(g) < 42 ? 6 : 0; }, cd: 10, cond: staff(4),
    title: 'The team threatens to quit',
    text: function (g) { return 'A group of employees says they will walk out unless things improve. Average morale is ' + Math.round(G.avgMorale(g)) + '/100.'; },
    choices: [
      { t: 'Everyone gets a 5% raise', fx: function (g) { g.employees.forEach(function (e) { G.raise(g, e, 0.05); }); return 'Crisis averted. Payroll went up.'; } },
      { t: 'Team bonus', cost: function (g) { return g.employees.reduce(function (s, e) { return s + e.salary; }, 0); }, fx: function (g) { spend(g, g.employees.reduce(function (s, e) { return s + e.salary; }, 0)); team(g, 15); return 'An extra week\'s pay each buys some goodwill.'; } },
      { t: 'Call their bluff', fx: function (g) {
        var gone = [];
        g.employees.slice().forEach(function (e) { if (e.morale < 40 && U.chance(0.35)) { gone.push(e.name.split(' ')[0]); G.removeEmp(g, e, 'quit', true); } });
        if (gone.length) { G.news(g, gone.length + ' employees walked out.', 'bad'); return gone.join(', ') + ' walked out.'; }
        return 'Nobody left. This time.';
      } }
    ] });

  // =====================================================================
  // COMPANY EVENTS
  // =====================================================================

  def({ id: 'flood', cat: 'Company', icon: '🌊', w: 1.5, cd: 20,
    title: 'The office is flooding',
    text: 'A pipe burst overnight. There is water everywhere.',
    choices: [
      { t: 'Emergency repair', cost: cost(0.7), fx: function (g) { spend(g, G.cost(g, 0.7)); return 'Plumbers fixed it by morning.'; } },
      { t: 'Cheap patch job', cost: cost(0.25), fx: function (g) { spend(g, G.cost(g, 0.25)); if (U.chance(0.45)) G.schedule(g, 'flood_again', U.ri(3, 8), {}); return 'The leak stopped. For now.'; } },
      { t: 'Close for a week and fix it properly', fx: function (g) { G.mod(g, 'closed', 1, 1, 'Closed for repairs'); spend(g, G.cost(g, 0.3)); return 'You are closed next week.'; } }
    ] });
  def({ id: 'flood_again', cat: 'Company', icon: '🌊', chainOnly: true,
    fx: function (g) { var c = G.cost(g, 1); spend(g, c); G.mod(g, 'demand', 0.8, 1, 'Flood damage'); return 'The cheap patch failed. The flood is worse this time. Repairs cost ' + M(c) + '.'; } });

  def({ id: 'power_outage', cat: 'Company', icon: '🔌', w: 2.5,
    title: 'Power outage',
    text: 'The whole block lost power. Nobody knows when it will come back.',
    choices: [
      { t: 'Rent a generator', cost: cost(0.12), fx: function (g) { spend(g, G.cost(g, 0.12)); return 'You are the only lit shop on the street.'; } },
      { t: 'Send everyone home early', fx: function (g) { G.mod(g, 'demand', 0.85, 1, 'Power outage'); team(g, 3); return 'You lost some sales. Staff enjoyed the afternoon off.'; } }
    ] });

  def({ id: 'equipment_fail', cat: 'Company', icon: '🛠️', w: 3,
    title: 'Equipment broke down',
    text: 'One of your key machines stopped working this morning.',
    choices: [
      { t: 'Repair it', cost: cost(0.2), fx: function (g) { spend(g, G.cost(g, 0.2)); return 'Fixed and running.'; } },
      { t: 'Upgrade to better equipment', cost: cost(1.2), d: 'Permanent +4% capacity', fx: function (g) { spend(g, G.cost(g, 1.2)); g.flags.equip = Math.min(1.4, g.flags.equip * 1.04); return 'New gear. Everyone works faster.'; } },
      { t: 'Work around it', fx: function (g) { G.mod(g, 'capacity', 0.85, 2, 'Broken machine'); return 'Things will be slow for two weeks.'; } }
    ] });

  def({ id: 'break_in', cat: 'Company', icon: '🚨', w: 1.5, minWeek: 5,
    setup: function (g) { return { amt: G.cost(g, 0.4) }; },
    title: 'Break-in overnight',
    start: function (g, c) { g.cash -= c.amt; },
    text: function (g, c) { return 'Someone broke in and took ' + M(c.amt) + ' worth of stock.'; },
    choices: [
      { t: 'Install an alarm system', cost: cost(0.3), fx: function (g) { spend(g, G.cost(g, 0.3)); g.flags.alarm = true; return 'Nobody is getting in again.'; } },
      { t: 'File an insurance claim', fx: function (g, c) { if (U.chance(0.6)) { g.cash += c.amt * 0.7; return 'Insurance covered 70%.'; } return 'The claim was rejected. Fine print.'; } }
    ] });

  def({ id: 'damaged_shipment', cat: 'Company', icon: '📦', w: 3,
    setup: function (g) { return { amt: G.cost(g, 0.18) }; },
    title: 'A shipment arrived damaged',
    text: function (g, c) { return 'Half of this week\'s delivery is crushed. It was worth ' + M(c.amt) + '.'; },
    choices: [
      { t: 'Demand a refund', fx: function (g, c) { if (U.chance(0.6)) return 'The supplier apologized and refunded you.'; spend(g, c.amt); return 'The supplier blames the courier. You eat the cost.'; } },
      { t: 'Accept the loss', fx: function (g, c) { spend(g, c.amt); return 'You move on.'; } }
    ] });

  def({ id: 'supplier_problems', cat: 'Company', icon: '🚚', w: 2.5,
    title: 'Your supplier is raising prices',
    text: 'Your main supplier says costs are going up 5% starting now.',
    choices: [
      { t: 'Accept the new price', fx: function (g) { G.mod(g, 'supply', 0.02, 12, 'Supplier price hike'); return 'Margins get a little thinner for a few months.'; } },
      { t: 'Switch suppliers', fx: function (g) {
        if (U.chance(0.6)) { G.mod(g, 'supply', -0.015, 12, 'Better supplier'); return 'The new supplier is actually cheaper.'; }
        G.mod(g, 'supply', 0.01, 6, 'New supplier'); rep(g, -2); return 'The new supplier\'s quality is worse. Customers notice.';
      } },
      { t: 'Negotiate hard', fx: function (g) { if (U.chance(0.5)) return 'They backed down. Prices stay the same.'; G.mod(g, 'supply', 0.03, 8, 'Angry supplier'); return 'They got annoyed and raised prices even more.'; } }
    ] });

  def({ id: 'inspection', cat: 'Company', icon: '📋', w: 2, cd: 15,
    title: 'Surprise inspection',
    text: 'A government inspector walked in unannounced with a clipboard.',
    choices: [
      { t: 'Cooperate fully', fx: function (g) {
        var ok = g.reputation / 100 * 0.5 + (g.employees.some(function (e) { return e.role === 'mgr'; }) ? 0.25 : 0.1) + 0.2;
        if (U.chance(ok)) { rep(g, 2); return 'You passed with flying colors.'; }
        var fine = G.cost(g, 0.4); spend(g, fine); return 'A few violations. Fine: ' + M(fine) + '.';
      } },
      { t: 'Offer the inspector a "gift"', d: 'Risky', cost: cost(0.2), fx: function (g) {
        spend(g, G.cost(g, 0.2));
        if (U.chance(0.35)) { G.schedule(g, 'bribe_scandal', U.ri(2, 6), {}); return 'The inspector pocketed it and smiled. Hopefully nobody saw.'; }
        return 'The inspector accepted and left. That was easy. Too easy?';
      } },
      { t: 'Ask them to come back later', fx: function (g) { rep(g, -1); G.schedule(g, 'inspection', U.ri(2, 4), {}); return 'They will be back, and they will look harder.'; } }
    ] });

  def({ id: 'bribe_scandal', cat: 'Major', icon: '📰', chainOnly: true,
    title: 'Bribery scandal',
    text: 'A journalist found out you bribed an inspector. It is on the front page.',
    choices: [
      { t: 'Public apology and a large fine', cost: cost(2), fx: function (g) { spend(g, G.cost(g, 2)); rep(g, -12); return 'Painful, but the story dies down.'; } },
      { t: 'Deny everything', fx: function (g) { if (U.chance(0.4)) { rep(g, -5); return 'The story fades without proof.'; } rep(g, -25); spend(g, G.cost(g, 3)); G.mod(g, 'demand', 0.75, 6, 'Scandal boycott'); return 'Then they published the photos. Customers are boycotting you.'; } }
    ] });

  def({ id: 'customer_scene', cat: 'Company', icon: '😤', w: 3,
    title: 'A customer is causing a scene',
    text: 'A customer is screaming that they were overcharged and refuses to leave.',
    choices: [
      { t: 'Give them a full refund and a freebie', cost: cost(0.02), fx: function (g) { spend(g, G.cost(g, 0.02)); rep(g, 1); return 'They leave happy and even post a nice review.'; } },
      { t: 'Calmly explain the bill', fx: function (g) { if (U.chance(0.6)) return 'They realize their mistake and apologize.'; rep(g, -1); return 'They storm out and post a one-star review.'; } },
      { t: 'Call security', fx: function (g) { rep(g, -2); if (U.chance(0.25)) G.schedule(g, 'complaint_viral', 1, {}); return 'Security walks them out. Someone was filming.'; } }
    ] });

  def({ id: 'competitor_nearby', cat: 'Competitors', icon: '🏪', w: 2, cd: 20, minWeek: 8,
    setup: function (g) { return { rival: rival(g) }; },
    title: function (g, c) { return c.rival + ' is opening across the street'; },
    text: function (g, c) { return c.rival + ' just put up a big "Opening soon" sign right across from you. They are known for aggressive prices.'; },
    choices: [
      { t: 'Launch a loyalty program', cost: cost(0.5), fx: function (g) { spend(g, G.cost(g, 0.5)); aw(g, 8); G.mod(g, 'demand', 0.95, 4, 'New competitor'); return 'Your regulars stay loyal.'; } },
      { t: 'Run a big opening-week promotion', cost: cost(0.8), fx: function (g) { spend(g, G.cost(g, 0.8)); aw(g, 15); return 'Your promotion steals their thunder.'; } },
      { t: 'Ignore them', fx: function (g) { G.mod(g, 'demand', 0.85, 8, 'New competitor'); return 'Some customers try the new place.'; } }
    ] });

  def({ id: 'repairs', cat: 'Company', icon: '🏚️', w: 2, cd: 12,
    title: 'The building needs repairs',
    text: 'The roof leaks, the door sticks, and the sign is missing two letters.',
    choices: [
      { t: 'Renovate properly', cost: cost(0.8), fx: function (g) { spend(g, G.cost(g, 0.8)); rep(g, 3); team(g, 4); return 'It looks brand new.'; } },
      { t: 'Do the minimum', cost: cost(0.15), fx: function (g) { spend(g, G.cost(g, 0.15)); return 'It holds together.'; } },
      { t: 'Put it off', fx: function (g) { rep(g, -2); G.schedule(g, 'repairs', U.ri(4, 8), {}); return 'The problems will not fix themselves.'; } }
    ] });

  def({ id: 'late_delivery', cat: 'Company', icon: '🐢', w: 3,
    title: 'An important delivery is late',
    text: 'The supplies you need for this week are stuck somewhere.',
    choices: [
      { t: 'Pay for express shipping', cost: cost(0.15), fx: function (g) { spend(g, G.cost(g, 0.15)); return 'It arrives just in time.'; } },
      { t: 'Wait for it', fx: function (g) { G.mod(g, 'capacity', 0.8, 1, 'Missing supplies'); return 'You run short for a few days.'; } }
    ] });

  def({ id: 'systems_down', cat: 'Company', icon: '🖥️', w: 2,
    title: 'Your computer systems crashed',
    text: 'Payments, orders and schedules are all down.',
    choices: [
      { t: 'Hire an emergency IT team', cost: cost(0.25), fx: function (g) { spend(g, G.cost(g, 0.25)); return 'Back up in two hours.'; } },
      { t: 'Go old school: pen and paper', fx: function (g) { G.mod(g, 'capacity', 0.85, 1, 'Systems down'); team(g, -2); return 'Chaotic, but you get through the week.'; } }
    ] });

  def({ id: 'big_contract', cat: 'Opportunity', icon: '🤝', w: 2, cd: 14, minWeek: 5,
    setup: function (g) { return { weeks: U.ri(4, 8), amt: G.cost(g, 0.25) }; },
    title: 'A big client wants a deal',
    text: function (g, c) { return 'A large local business wants a ' + c.weeks + '-week contract worth ' + M(c.amt) + ' a week. It will stretch your team.'; },
    choices: [
      { t: 'Accept', fx: function (g, c) { G.mod(g, 'extra', c.amt, c.weeks, 'Client contract'); team(g, -5); return 'Deal signed. The money starts next week.'; } },
      { t: 'Negotiate for more', fx: function (g, c) { if (U.chance(0.5)) { G.mod(g, 'extra', c.amt * 1.3, c.weeks, 'Client contract'); team(g, -5); return 'They agreed to 30% more.'; } return 'They walked away.'; } },
      { t: 'Decline', fx: function () { return 'You stay focused on your regular customers.'; } }
    ] });

  def({ id: 'tax_refund', cat: 'Company', icon: '🧾', w: 1.5, cd: 26,
    fx: function (g) { var a = G.cost(g, 0.3); g.cash += a; return 'Surprise tax refund: ' + M(a) + '.'; } });

  def({ id: 'award', cat: 'Company', icon: '🏅', w: function (g) { return g.reputation > 70 ? 2 : 0; }, cd: 26,
    fx: function (g) { rep(g, 4); aw(g, 10); var city = CS.CITIES[g.company.city].name; G.news(g, g.company.name + ' won "Best ' + CS.IND[g.company.industry].name + ' in ' + city + '".', 'good'); return 'You won "Best ' + CS.IND[g.company.industry].name + ' in ' + city + '"!'; } });

  def({ id: 'investor_offer', cat: 'Opportunity', icon: '💼', w: 1, cd: 30, minWeek: 12,
    setup: function (g) { return g.ownership > 30 ? { pct: U.pick([5, 10, 15]) } : null; },
    title: 'An investor wants in',
    text: function (g, c) { return 'An investor offers ' + M(G.stakeOffer(g, c.pct) * 1.1) + ' for ' + c.pct + '% of your company. You currently own ' + Math.round(g.ownership) + '%.'; },
    choices: [
      { t: 'Take the deal', fx: function (g, c) { var amt = U.nice(G.stakeOffer(g, c.pct) * 1.1); g.ownership -= c.pct; g.cash += amt; G.news(g, 'Sold ' + c.pct + '% to an investor for ' + M(amt) + '.', 'neutral'); return 'The money is in your account.'; } },
      { t: 'No thanks', fx: function () { return 'You keep your shares.'; } }
    ] });

  // =====================================================================
  // SOCIAL MEDIA
  // =====================================================================

  function viral(g, views) {
    g.flags.viral = true;
    var v = Math.round(views), likes = Math.round(v * U.rand(0.05, 0.09)), shares = Math.round(v * U.rand(0.01, 0.025));
    return '\n📱 ' + U.num(v) + ' views · ' + U.num(likes) + ' likes · ' + U.num(shares) + ' shares';
  }

  def({ id: 'video_posted', cat: 'Social media', icon: '🎥', w: 2.5,
    title: 'Someone posted a video of your company',
    text: 'A customer filmed your staff at work and posted it. It is getting attention.',
    choices: [
      { t: 'Repost it on your account', fx: function (g) {
        if (g.satisfaction > 55 || U.chance(0.4)) { var big = U.chance(0.2); aw(g, big ? 40 : 10); return (big ? 'It went viral!' : 'Nice boost in attention.') + (big ? viral(g, U.rand(2e6, 9e6)) : ''); }
        rep(g, -3); return 'The comments are full of complaints about your service.';
      } },
      { t: 'Leave it alone', fx: function (g) { aw(g, 4); return 'It gets a few thousand views.'; } }
    ] });

  def({ id: 'employee_famous', cat: 'Social media', icon: '🤳', w: 1.5, cd: 20,
    setup: function (g) { var a = pickEmp(g, null, traitW('funny', 5)); return a ? { a: a.id } : null; },
    title: function (g, c) { return first(g, c.a) + ' is famous online'; },
    text: function (g, c) { return 'A video of ' + N(g, c.a) + ' being hilarious at work has millions of views. People are showing up just to meet them.'; },
    choices: [
      { t: 'Make them the face of the company', fx: function (g, c) { aw(g, 35); emp(g, c.a).morale += 15; G.schedule(g, 'raise_request_famous', U.ri(3, 6), c); return 'Customers love it.' + viral(g, U.rand(3e6, 12e6)); } },
      { t: 'Ask them to keep it low-key', fx: function (g, c) { aw(g, 10); emp(g, c.a).morale -= 10; return 'The hype fades. ' + first(g, c.a) + ' is disappointed.'; } }
    ] });

  def({ id: 'raise_request_famous', cat: 'Employees', icon: '💅', chainOnly: true,
    title: function (g, c) { return 'Internet celebrity ' + first(g, c.a) + ' wants more'; },
    text: function (g, c) { return 'Now that they are famous, ' + N(g, c.a) + ' wants double pay. Another company has made an offer.'; },
    choices: [
      { t: 'Double their pay', fx: function (g, c) { var a = emp(g, c.a); a.salary *= 2; a.morale += 20; aw(g, 10); return 'Your star stays.'; } },
      { t: 'Offer 25% more', fx: function (g, c) { var a = emp(g, c.a); if (U.chance(0.5)) { G.raise(g, a, 0.25); return 'They accept, grudgingly.'; } quitToRival(g, a); aw(g, -10); return 'They take the other offer. Some fans follow them.'; } },
      { t: 'Refuse', fx: function (g, c) { quitToRival(g, emp(g, c.a)); aw(g, -15); return 'They leave and post a video about it.'; } }
    ] });

  def({ id: 'complaint_viral', cat: 'Social media', icon: '😡', w: function (g) { return g.satisfaction < 50 ? 3 : 0.8; }, cd: 10,
    title: 'A complaint about you is going viral',
    text: 'An angry customer\'s post about your company has been shared thousands of times.',
    choices: [
      { t: 'Post a public apology', fx: function (g) { rep(g, -2); return 'People respect the apology. Mostly.'; } },
      { t: 'Offer the customer compensation', cost: cost(0.1), fx: function (g) { spend(g, G.cost(g, 0.1)); rep(g, 1); return 'The customer updates the post: "They made it right."'; } },
      { t: 'Say they are lying', fx: function (g) { if (U.chance(0.4)) { rep(g, 1); return 'Their story fell apart. People side with you.'; } rep(g, -10); aw(g, 10); return 'Big mistake. It got much bigger.' + viral(g, U.rand(1e6, 5e6)); } }
    ] });

  def({ id: 'meme', cat: 'Social media', icon: '🐸', w: 1.5, cd: 15,
    title: 'You are a meme',
    text: 'Someone made a meme about your company. It is actually pretty funny.',
    choices: [
      { t: 'Join the joke', fx: function (g) { if (U.chance(0.7)) { aw(g, 25); return 'Your reply got more likes than the meme.' + viral(g, U.rand(1e6, 6e6)); } rep(g, -3); return 'Your reply came off as cringe.'; } },
      { t: 'Ask for it to be taken down', fx: function (g) { rep(g, -3); aw(g, 12); return 'Now everyone is sharing it even more.'; } },
      { t: 'Ignore it', fx: function (g) { aw(g, 6); return 'It fades after a few days.'; } }
    ] });

  def({ id: 'influencer', cat: 'Social media', icon: '✨', w: 2,
    fx: function (g) { aw(g, U.rand(8, 20)); rep(g, 2); return 'An influencer with 800K followers praised your company.'; } });

  def({ id: 'embarrassing_post', cat: 'Social media', icon: '🙈', w: 1.5, cd: 15,
    setup: function (g) { var a = pickEmp(g); return a ? { a: a.id } : null; },
    title: 'An embarrassing post',
    text: function (g, c) { return N(g, c.a) + ' accidentally posted a selfie with a rude caption on the company account.'; },
    choices: [
      { t: 'Delete it and apologize', fx: function (g) { rep(g, -1); return 'Few people saw it.'; } },
      { t: 'Turn it into a joke', fx: function (g) { if (U.chance(0.5)) { aw(g, 20); return 'Your self-deprecating follow-up was a hit.' + viral(g, U.rand(8e5, 3e6)); } rep(g, -5); return 'It did not land.'; } },
      { t: 'Fire them', label: function (g, c) { return 'Fire ' + first(g, c.a); }, fx: function (g, c) { G.removeEmp(g, emp(g, c.a), 'fired'); return 'Harsh, but the account is safe.'; } }
    ] });

  def({ id: 'rumor_company', cat: 'Social media', icon: '🧢', w: 1.5, cd: 15,
    setup: function (g) { return { rival: rival(g) }; },
    title: 'A rumor about your company',
    text: 'People online are saying your company is about to close down. It is not true.',
    choices: [
      { t: 'Post a clear statement', fx: function (g) { rep(g, 1); return 'The rumor dies down.'; } },
      { t: 'Find out who started it', cost: cost(0.3), fx: function (g, c) { spend(g, G.cost(g, 0.3)); if (U.chance(0.5)) { rep(g, 4); G.news(g, c.rival + ' was caught spreading rumors.', 'good'); return 'It was ' + c.rival + '. The public is on your side now.'; } return 'The trail went cold.'; } },
      { t: 'Ignore it', fx: function (g) { G.mod(g, 'demand', 0.92, 3, 'Closing-down rumor'); return 'Some customers believe it.'; } }
    ] });

  def({ id: 'celebrity', cat: 'Social media', icon: '🌟', w: 0.6, cd: 40,
    fx: function (g) { aw(g, 50); rep(g, 3); g.flags.viral = true; G.news(g, 'A celebrity mentioned ' + g.company.name + ' on a talk show.', 'good'); return 'A celebrity mentioned your company on national TV!' + viral(g, U.rand(5e6, 2e7)); } });

  // =====================================================================
  // MANAGEMENT
  // =====================================================================
  var mgrPick = function (g) { var m = pickEmp(g, function (e) { return e.role === 'mgr'; }); return m ? { m: m.id } : null; };

  def({ id: 'manager_raise', cat: 'Management', icon: '👔', w: 2, cond: hasRole('mgr'), setup: mgrPick,
    title: function (g, c) { return 'Manager ' + first(g, c.m) + ' wants a raise'; },
    text: function (g, c) { return N(g, c.m) + ' says they are running the place and deserve to be paid like it. They earn ' + M(emp(g, c.m).salary) + ' a week.'; },
    choices: [
      { t: 'Give 12%', fx: function (g, c) { G.raise(g, emp(g, c.m), 0.12); return 'They are motivated again.'; } },
      { t: 'Give a one-time bonus', cost: function (g, c) { var m = emp(g, c.m); return m ? m.salary * 2 : 0; }, fx: function (g, c) { G.bonus(g, emp(g, c.m)); return 'Not what they asked for, but it helps.'; } },
      { t: 'Refuse', fx: function (g, c) { var m = emp(g, c.m); m.morale -= 20; if (U.chance(0.4)) G.schedule(g, 'rival_offer', U.ri(2, 5), { m: c.m, rival: rival(g) }); return 'They are clearly unhappy.'; } }
    ] });

  def({ id: 'rival_offer', cat: 'Management', icon: '📨', w: 1, cond: hasRole('mgr'), minWeek: 10,
    setup: function (g) { var c = mgrPick(g); if (c) c.rival = rival(g); return c; },
    title: function (g, c) { return c.rival + ' wants your manager'; },
    text: function (g, c) { return c.rival + ' offered ' + N(g, c.m) + ' 30% more money. ' + first(g, c.m) + ' came to you first.'; },
    choices: [
      { t: 'Match the offer', fx: function (g, c) { var m = emp(g, c.m); G.raise(g, m, 0.3); m.loyalty += 15; return 'They stay, and they appreciate it.'; } },
      { t: 'Appeal to their loyalty', fx: function (g, c) { var m = emp(g, c.m); if (m.loyalty > 60 || U.chance(0.3)) { m.loyalty += 5; return 'They turn the offer down.'; } G.removeEmp(g, m, 'quit'); G.schedule(g, 'joined_rival', 1, { name: m.name, rival: c.rival, creative: G.has(m, 'creative') }); return 'They take the offer.'; } },
      { t: 'Let them go', fx: function (g, c) { var m = emp(g, c.m); G.removeEmp(g, m, 'quit'); G.schedule(g, 'joined_rival', 1, { name: m.name, rival: c.rival, creative: true }); return 'They leave for ' + c.rival + '.'; } }
    ] });

  def({ id: 'fraud_found', cat: 'Management', icon: '🧮', w: 1.2, minWeek: 15, cd: 30, cond: hasRole('acct'),
    setup: function (g) {
      var a = pickEmp(g, function (e) { return e.role === 'acct'; }); if (!a) return null;
      var t = pickEmp(g, function (e) { return e.id !== a.id; }, traitW('greedy', 10)); if (!t) return null;
      return { a: a.id, b: t.id, amt: G.cost(g, 1.5) };
    },
    title: 'Your accountant found fraud',
    text: function (g, c) { return N(g, c.a) + ' found fake invoices. ' + N(g, c.b) + ' has been slowly taking money. Total: ' + M(c.amt) + '.'; },
    choices: [
      { t: 'Fire them and press charges', fx: function (g, c) { G.removeEmp(g, emp(g, c.b), 'fired'); if (U.chance(0.5)) { g.cash += c.amt * 0.6; return 'The court orders them to repay 60%.'; } return 'You will never see that money again.'; } },
      { t: 'Fire them quietly', fx: function (g, c) { G.removeEmp(g, emp(g, c.b), 'fired'); return 'No scandal, no money back.'; } },
      { t: 'Make them pay it back and stay', fx: function (g, c) { var b = emp(g, c.b); g.cash += c.amt * 0.5; b.morale -= 20; b.loyalty -= 10; if (U.chance(0.5)) G.schedule(g, 'theft_again', U.ri(6, 12), { a: c.b }); return 'They repay half so far. Can you trust them?'; } }
    ] });

  def({ id: 'bad_manager', cat: 'Management', icon: '😠', w: function (g) { return g.employees.some(function (e) { return e.role === 'mgr'; }) ? 2 : 0; }, cond: staff(4), setup: mgrPick,
    title: 'Staff complain about their manager',
    text: function (g, c) { return 'Several employees say ' + N(g, c.m) + ' yells at them and plays favorites.'; },
    choices: [
      { t: 'Send the manager to leadership training', cost: cost(0.2), fx: function (g, c) { spend(g, G.cost(g, 0.2)); team(g, 5); return 'They come back calmer.'; } },
      { t: 'Side with the manager', fx: function (g, c) { team(g, -8); emp(g, c.m).loyalty += 10; return 'The manager feels backed. The team feels ignored.'; } },
      { t: 'Demote the manager', fx: function (g, c) { G.demote(g, emp(g, c.m)); team(g, 6); return 'The team cheers quietly.'; } }
    ] });

  def({ id: 'manager_disagree', cat: 'Management', icon: '⚔️', w: 1.5,
    cond: function (g) { return g.employees.filter(function (e) { return e.role === 'mgr'; }).length >= 2; },
    setup: function (g) { var a = pickEmp(g, function (e) { return e.role === 'mgr'; }); var b = a && pickOther(g, a, function (e) { return e.role === 'mgr'; }); return b ? { a: a.id, b: b.id } : null; },
    title: 'Your managers disagree',
    text: function (g, c) { return N(g, c.a) + ' wants to cut prices to grow. ' + N(g, c.b) + ' wants to raise prices for quality. They want you to decide.'; },
    choices: [
      { t: 'Side with growth', label: function (g, c) { return 'Side with ' + first(g, c.a) + ' (cheaper)'; }, fx: function (g, c) { g.price = Math.max(0, g.price - 1); emp(g, c.b).morale -= 12; return 'Prices go down.'; } },
      { t: 'Side with quality', label: function (g, c) { return 'Side with ' + first(g, c.b) + ' (pricier)'; }, fx: function (g, c) { g.price = Math.min(2, g.price + 1); emp(g, c.a).morale -= 12; return 'Prices go up.'; } },
      { t: 'Keep things as they are', fx: function (g, c) { emp(g, c.a).morale -= 5; emp(g, c.b).morale -= 5; G.addRel(g, c.a, c.b, -15); return 'Neither of them is happy.'; } }
    ] });

  def({ id: 'risky_expansion', cat: 'Management', icon: '🎲', w: 1.2, minWeek: 12, cd: 25,
    setup: function (g) { var m = pickEmp(g, function (e) { return e.role === 'mgr' || G.has(e, 'ambitious'); }); return m ? { m: m.id } : null; },
    title: 'A risky growth idea',
    text: function (g, c) { return N(g, c.m) + ' pitches a bold plan: spend ' + M(G.cost(g, 4)) + ' on a new product line. "Trust me, it will pay off."'; },
    choices: [
      { t: 'Go for it', cost: cost(4), fx: function (g, c) {
        spend(g, G.cost(g, 4));
        if (U.chance(0.5)) { G.mod(g, 'demand', 1.25, 20, 'New product line'); aw(g, 15); emp(g, c.m).morale += 15; return 'It is a hit! Customers love the new line.'; }
        emp(g, c.m).morale -= 10; return 'It flopped. The money is gone.';
      } },
      { t: 'Try a small test first', cost: cost(0.8), fx: function (g, c) { spend(g, G.cost(g, 0.8)); if (U.chance(0.5)) { G.mod(g, 'demand', 1.08, 10, 'Product test'); return 'The test went well. Modest gains.'; } return 'The test showed it would not work. Good thing you checked.'; } },
      { t: 'Decline', fx: function (g, c) { emp(g, c.m).morale -= 8; return 'They sigh and close their laptop.'; } }
    ] });

  def({ id: 'unqualified', cat: 'Management', icon: '🙋', w: 1.5, minWeek: 8, cond: staff(4),
    setup: function (g) { var a = pickEmp(g, function (e) { return e.role !== 'mgr' && e.skill < 55; }); return a ? { a: a.id } : null; },
    title: function (g, c) { return first(g, c.a) + ' applies to be a manager'; },
    text: function (g, c) { return N(g, c.a) + ' wants the manager job. They are keen but have little experience (skill ' + Math.round(emp(g, c.a).skill) + ').'; },
    choices: [
      { t: 'Give them a chance', fx: function (g, c) { G.promote(g, emp(g, c.a), true); if (U.chance(0.55)) G.schedule(g, 'out_of_depth', U.ri(2, 5), c); return 'They are thrilled. Can they do it?'; } },
      { t: 'Encourage them to build skills first', fx: function (g, c) { var a = emp(g, c.a); a.morale -= 4; a.skill += 2; return 'They take it well.'; } },
      { t: 'Say no', fx: function (g, c) { emp(g, c.a).morale -= 12; return 'They are hurt.'; } }
    ] });

  def({ id: 'manager_stealing', cat: 'Management', icon: '💰', w: 0.8, minWeek: 15, cd: 30, cond: hasRole('mgr'), setup: function (g) { var c = mgrPick(g); if (c) c.amt = G.cost(g, 1); return c; },
    title: 'A manager was caught stealing',
    start: function (g, c) { g.cash -= c.amt; },
    text: function (g, c) { return N(g, c.m) + ' has been paying themselves "expenses" that do not exist. ' + M(c.amt) + ' is gone.'; },
    choices: [
      { t: 'Fire them', fx: function (g, c) { G.removeEmp(g, emp(g, c.m), 'fired'); return 'You need a new manager now.'; } },
      { t: 'Demote them and recover the money', fx: function (g, c) { G.demote(g, emp(g, c.m)); g.cash += c.amt * 0.7; return 'You got most of it back.'; } }
    ] });

  // =====================================================================
  // FUNNY
  // =====================================================================

  def({ id: 'pet', cat: 'Funny', icon: '🐶', w: 2, cd: 20,
    setup: function (g) { var a = pickEmp(g); return a ? { a: a.id } : null; },
    title: function (g, c) { return first(g, c.a) + ' brought their dog to work'; },
    text: 'The dog is very good. The dog is also eating a customer\'s sandwich.',
    choices: [
      { t: 'Make it a pet-friendly workplace', fx: function (g) { team(g, 6); if (U.chance(0.2)) { rep(g, -2); return 'Morale is up. One customer had an allergic reaction.'; } aw(g, 5); return 'Morale is up and customers love the office dog.'; } },
      { t: 'No pets allowed', fx: function (g, c) { emp(g, c.a).morale -= 6; return 'The dog goes home. Everyone is a little sad.'; } }
    ] });

  def({ id: 'prank_war', cat: 'Funny', icon: '🎭', w: function (g) { return g.employees.some(function (e) { return G.has(e, 'funny'); }) ? 2.5 : 0.5; }, cond: staff(3),
    title: 'A prank war has started',
    text: 'Someone wrapped a desk in tin foil. Retaliation came with a fake spider. It is escalating.',
    choices: [
      { t: 'Join in', fx: function (g) { team(g, 8); G.mod(g, 'capacity', 0.95, 1, 'Prank war'); return 'You filled a manager\'s car with balloons. Legendary.'; } },
      { t: 'Shut it down', fx: function (g) { team(g, -4); return 'Back to work. Boring, but productive.'; } }
    ] });

  def({ id: 'microwave', cat: 'Funny', icon: '🍿', w: 1.5, cd: 30,
    title: 'Someone stole the office microwave',
    text: 'The microwave is gone. Just gone. Lunch is chaos.',
    choices: [
      { t: 'Buy a new one', cost: function () { return 150; }, fx: function (g) { spend(g, 150); return 'Peace returns to the kitchen.'; } },
      { t: 'Launch an investigation', fx: function (g) { team(g, 3); return 'It was found three days later in the supply closet, next to a note: "sorry".'; } }
    ] });

  def({ id: 'asleep', cat: 'Funny', icon: '😴', w: 2,
    setup: function (g) { var a = pickEmp(g, null, traitW('lazy', 5)); return a ? { a: a.id } : null; },
    title: function (g, c) { return first(g, c.a) + ' fell asleep in a meeting'; },
    text: function (g, c) { return 'Mid-presentation, ' + N(g, c.a) + ' started snoring. Loudly.'; },
    choices: [
      { t: 'Let them sleep', fx: function (g, c) { if (U.chance(0.3)) { emp(g, c.a).skill += 5; return 'They wake up with a brilliant idea. Skill +5.'; } team(g, 2); return 'Everyone found it hilarious.'; } },
      { t: 'Wake them gently', fx: function (g, c) { return 'They apologize and chug a coffee.'; } },
      { t: 'Send them home without pay', fx: function (g, c) { emp(g, c.a).morale -= 12; return 'Point made.'; } }
    ] });

  def({ id: 'mega_order', cat: 'Funny', icon: '📦', w: 1.2, cd: 30,
    setup: function (g) { var a = pickEmp(g); return a ? { a: a.id, amt: G.cost(g, 0.6) } : null; },
    title: 'Someone ordered 10,000 instead of 100',
    text: function (g, c) { return N(g, c.a) + ' added two zeros to an order. A truck full of supplies worth ' + M(c.amt) + ' is outside.'; },
    choices: [
      { t: 'Send it back (restocking fee)', cost: function (g, c) { return c.amt * 0.2; }, fx: function (g, c) { spend(g, c.amt * 0.2); return 'Lesson learned.'; } },
      { t: 'Run a giant sale to use it up', cost: function (g, c) { return c.amt; }, fx: function (g, c) { spend(g, c.amt); aw(g, 12); G.mod(g, 'demand', 1.15, 2, 'Mega sale'); G.mod(g, 'supply', -0.1, 2, 'Surplus stock'); return 'The "Oops Sale" was a hit.'; } },
      { t: 'Keep it all', cost: function (g, c) { return c.amt; }, fx: function (g, c) { spend(g, c.amt); G.mod(g, 'supply', -0.08, 6, 'Surplus stock'); return 'Your storage room is full for months.'; } }
    ] });

  def({ id: 'internal_msg', cat: 'Funny', icon: '💬', w: 1.2, cd: 25,
    title: 'Internal message posted publicly',
    text: 'Someone posted "is the boss in yet? tell everyone to look busy" on the company account.',
    choices: [
      { t: 'Own it: "The boss is in. Everyone look busy."', fx: function (g) { if (U.chance(0.6)) { aw(g, 18); return 'People loved the honesty.' + viral(g, U.rand(5e5, 2e6)); } return 'A few laughs. Nothing more.'; } },
      { t: 'Delete it quickly', fx: function () { return 'Only 40 people saw it. Probably.'; } }
    ] });

  def({ id: 'parking', cat: 'Funny', icon: '🅿️', w: 1.5, cond: staff(2),
    setup: function (g) { var a = pickEmp(g); var b = a && pickOther(g, a); return b ? { a: a.id, b: b.id } : null; },
    title: 'The great parking spot war',
    text: function (g, c) { return N(g, c.a) + ' and ' + N(g, c.b) + ' both claim the parking spot closest to the door. There are now handwritten signs.'; },
    choices: [
      { t: 'Assign spots by seniority', fx: function (g, c) { var a = emp(g, c.a), b = emp(g, c.b); (a.weeks >= b.weeks ? b : a).morale -= 6; return 'Rules are rules.'; } },
      { t: 'Make it employee-of-the-month parking', fx: function (g) { team(g, 3); return 'Now everyone wants it. Productivity is up.'; } },
      { t: 'Take the spot yourself', fx: function (g, c) { G.addRel(g, c.a, c.b, 20); return 'They are united now, against you.'; } }
    ] });

  def({ id: 'lunch_thief', cat: 'Funny', icon: '🥪', w: 1.5, cd: 25,
    title: 'Someone keeps eating other people\'s lunch',
    text: 'A labeled sandwich has vanished for the fifth time. There is a sticky note war on the fridge.',
    choices: [
      { t: 'Install a fridge camera', cost: function () { return 90; }, fx: function (g) { spend(g, 90); var e = U.pick(g.employees); return 'The camera caught ' + (e ? e.name : 'someone') + ' red-handed. They bring in cake to apologize.'; } },
      { t: 'Buy everyone lunch on Friday', cost: cost(0.03), fx: function (g) { spend(g, G.cost(g, 0.03)); team(g, 4); return 'Free lunch fixes everything.'; } }
    ] });

  def({ id: 'birthday', cat: 'Funny', icon: '🎂', w: 1.5, cond: staff(2),
    setup: function (g) { var a = pickEmp(g); return a ? { a: a.id } : null; },
    fx: function (g, c) { team(g, 2); emp(g, c.a).morale += 6; return 'The team threw a surprise birthday party for ' + N(g, c.a) + '.'; } });

  // =====================================================================
  // MAJOR PROBLEMS (rare)
  // =====================================================================

  def({ id: 'lawsuit', cat: 'Major', icon: '⚖️', w: 0.7, minWeek: 20, cd: 40,
    title: 'You are being sued',
    text: function (g) { return 'A customer claims they were injured by your product and is suing for ' + M(G.cost(g, 6)) + '.'; },
    choices: [
      { t: 'Settle out of court', cost: cost(2.5), fx: function (g) { spend(g, G.cost(g, 2.5)); return 'Settled quietly.'; } },
      { t: 'Fight it in court', cost: cost(1), fx: function (g) { spend(g, G.cost(g, 1)); if (U.chance(0.55)) { rep(g, 3); return 'You won. The case was thrown out.'; } spend(g, G.cost(g, 6)); rep(g, -8); return 'You lost. It is all over the news.'; } }
    ] });

  def({ id: 'accident', cat: 'Major', icon: '🚑', w: 0.6, minWeek: 15, cd: 40,
    setup: function (g) { var a = pickEmp(g, function (e) { return e.role === 'front'; }); return a ? { a: a.id } : null; },
    title: 'Workplace accident',
    text: function (g, c) { return N(g, c.a) + ' was hurt at work. They will be okay, but it was serious. Staff are asking questions about safety.'; },
    choices: [
      { t: 'Pay their costs and upgrade safety', cost: cost(1.5), fx: function (g, c) { spend(g, G.cost(g, 1.5)); team(g, 8); emp(g, c.a).loyalty += 25; return 'The team trusts you more.'; } },
      { t: 'Pay the minimum required', cost: cost(0.4), fx: function (g, c) { spend(g, G.cost(g, 0.4)); team(g, -10); if (U.chance(0.4)) G.schedule(g, 'strike', U.ri(2, 5), {}); return 'The team is angry.'; } }
    ] });

  def({ id: 'bad_batch', cat: 'Major', icon: '☣️', w: 0.7, minWeek: 12, cd: 40,
    title: 'Something you sold was faulty',
    text: 'A batch of your product was faulty. A few customers noticed. Most have not yet.',
    choices: [
      { t: 'Recall everything and refund', cost: cost(1.8), fx: function (g) { spend(g, G.cost(g, 1.8)); rep(g, 3); return 'Customers praise your honesty.'; } },
      { t: 'Quietly fix it going forward', fx: function (g) { if (U.chance(0.5)) return 'Nobody ever found out.'; rep(g, -18); G.mod(g, 'demand', 0.8, 6, 'Cover-up scandal'); return 'A journalist found out you covered it up.'; } }
    ] });

  def({ id: 'strike', cat: 'Major', icon: '🪧', w: function (g) { return G.avgMorale(g) < 38 ? 2 : 0; }, minWeek: 10, cd: 30, cond: staff(4),
    title: 'Your employees are on strike',
    text: 'The team has walked out. Nothing is getting done until you respond.',
    choices: [
      { t: 'Agree to a 10% raise for everyone', fx: function (g) { g.employees.forEach(function (e) { G.raise(g, e, 0.1); }); return 'Everyone is back at work.'; } },
      { t: 'Negotiate', fx: function (g) { if (U.chance(0.5)) { g.employees.forEach(function (e) { G.raise(g, e, 0.05); }); return 'You met in the middle: 5%.'; } G.mod(g, 'closed', 1, 1, 'Strike'); team(g, -5); return 'Talks failed. You are closed next week.'; } },
      { t: 'Hold out', fx: function (g) { G.mod(g, 'closed', 1, 2, 'Strike'); team(g, -10); rep(g, -5); return 'You are closed for two weeks.'; } }
    ] });

  def({ id: 'cyberattack', cat: 'Major', icon: '🦠', w: 0.6, minWeek: 20, cd: 40,
    title: 'Cyberattack',
    text: function (g) { return 'Hackers locked your systems and demand ' + M(G.cost(g, 1.2)) + ' in crypto.'; },
    choices: [
      { t: 'Pay the ransom', cost: cost(1.2), fx: function (g) { spend(g, G.cost(g, 1.2)); if (U.chance(0.8)) return 'They unlocked everything.'; G.mod(g, 'capacity', 0.7, 2, 'Locked systems'); return 'They took the money and did not unlock anything.'; } },
      { t: 'Restore from backups', cost: cost(0.4), fx: function (g) { spend(g, G.cost(g, 0.4)); G.mod(g, 'capacity', 0.8, 1, 'Restoring systems'); return 'It takes a week, but you are back.'; } }
    ] });

  def({ id: 'supplier_collapse', cat: 'Major', icon: '🏚️', w: 0.5, minWeek: 20, cd: 50,
    title: 'Your main supplier went bankrupt',
    text: 'Your biggest supplier closed overnight. You need a new one now.',
    choices: [
      { t: 'Pay a premium to a fast replacement', fx: function (g) { G.mod(g, 'supply', 0.06, 8, 'Emergency supplier'); return 'Supplies keep flowing, at a price.'; } },
      { t: 'Take time to find a good one', fx: function (g) { G.mod(g, 'capacity', 0.6, 2, 'No supplier'); return 'Two slow weeks, then back to normal.'; } }
    ] });

  CS.EVENTS = E;
  CS.EV = {};
  E.forEach(function (d) { CS.EV[d.id] = d; });

  // Choice labels may depend on who is involved.
  G.choiceLabel = function (g, x, c) { return c.label ? c.label(g, x.ctx) : c.t; };
})();
