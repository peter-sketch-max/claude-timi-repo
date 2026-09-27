// All events, part 1: your team. The rest live in events-more.js (customers, business, money, social media),
// events-fun.js (rivals, world news, lucky breaks, mini-games, legendary), events-life.js (your life, shady deals,
// trouble, goodbyes) and the events-biz*.js files (events for one kind of business).
// Every event that asks the player something has exactly 4 responses.
// Style: short and simple. Titles have no emoji, text is 1-2 short sentences, every answer starts with one emoji,
// and results say what happened in one sentence. tools/check-events.js enforces this.
//
// Common fields:
//   id, cat (see CS.CATS), icon, kind, rarity (common|rare|epic|legendary), w (weight), cd (cooldown weeks),
//   minWeek, need (min staff), cond(g), who ({a: 'any'|'<trait>'|'front'|'mgr'|'lowmood'|'star'|'new'|'veteran'|'notmgr'|'old', b: ...}),
//   init(g, ctx) to add data (return false to skip), start (effect applied when the event appears),
//   chainOnly (only happens as a follow-up).
// Text uses {a} {b} {m} {rival} {amt} {company} {front} {fronts} {unit} {industry} {city} and any ctx key.
//
// Kinds:
//   choice (default)  title, text, choices: [4 x { t, d, fx }]
//   chat              from: 'a' | 'm' | { name, face }, msgs: [...], choices = replies
//   review            stars, text, choices
//   news              title = headline, text, choices
//   boxes             prizes: [{ label, emoji, w, fx }]   (player picks 1 of 4 boxes)
//   wheel             slices: [{ label, emoji, color, w, fx, jackpot, bad }]   (spin, golden spin, sure prize, skip)
//   tap               target (emoji), goal, secs, win, lose   (easy, normal, hard, skip)
//   quiz              init makes ctx.q = { q, options (4), answer }, win, lose
//   deal              init sets ctx.offer, accept(g, c) -> fx   (accept, push, push hard, walk away)
//   vs                win, lose, tie   (4 moves)
//   interview         init makes ctx.cand   (4 questions, then 4 ways to hire or pass)
//   post              pick 1 of 4 social media posts
//
// Effect (fx) keys: cash (share of weekly sales, negative = cost), money ($), rep, happy, fans, team,
//   a/b/m (mood of that person), skill/loyal/reliable ({a: n}), rel ['a','b',n], date, breakup,
//   raise ['a', pct], teamRaise, teamBonus, bonus 'a', promote 'a', mgr 'a', demote 'a', fire 'a', quit 'a' (may join a rival),
//   leave 'a' (leaves on good terms), die 'a',
//   demand/capacity/supply [value, weeks, label], extra [share, weeks, label], closed [weeks, label],
//   price (+1/-1), equip (permanent speed), rent (permanent), viral [min, max], hire 'cand', hireSpecial {...},
//   pet (emoji), rival (+/- share of that rival's strength), next ['id', minWeeks, maxWeeks, chance],
//   chance { p, win, lose }, say, xp, flag, run(g, c), then 'id' (the story continues right away with that event).
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var U = CS.U, G = CS.G;
  CS.EVENTS = [];
  CS.EV = {};
  CS.ev = function (d) {
    d.kind = d.kind || (d.choices ? 'choice' : 'minor');
    CS.EVENTS.push(d);
    CS.EV[d.id] = d;
  };
  var ev = CS.ev;

  // Shared helpers for writing events (also used by the other event files).
  var H = CS.EVH = {
    rival: function (g, c) { c.rival = U.pick(g.rivals); },
    amt: function (frac) { return function (g, c) { c.amt = G.cost(g, frac); }; },
    tag: function (t) { return function (g) { return CS.hasTag(g.company.industry, t); }; },
    noCams: function (g) { return !G.upLevel(g, 'cameras'); },
    hasRole: function (r) { return function (g) { return g.employees.some(function (e) { return e.role === r; }); }; },
    season: function (from, to) { return function (g) { var w = ((g.week - 1) % 52) + 1; return w >= from && w <= to; }; },
    busy: function (g) { var h = g.history[g.history.length - 1]; return h && h.demand > h.capacity * 1.08; },
    isInd: function (id) { return function (g) { return g.company.industry === id; }; },
    person: function (g, c) { c.name = U.pick(CS.FIRST) + ' ' + U.pick(CS.LAST); },
    // For stories that say "he" or "she": a name that fits.
    man: function (g, c) { c.name = U.pick(MEN) + ' ' + U.pick(CS.LAST); },
    woman: function (g, c) { c.name = U.pick(WOMEN) + ' ' + U.pick(CS.LAST); },
    boy: function (g, c) { c.name = U.pick(MEN); }
  };
  var MEN = ['Liam', 'Noah', 'Leo', 'Mateo', 'Omar', 'Ethan', 'Lucas', 'Diego', 'Felix', 'Jonah', 'Ravi', 'Tariq', 'Marcus', 'Kofi', 'Oscar', 'Ivan', 'Malik', 'Theo', 'Hugo', 'Bruno', 'Arjun', 'Emeka', 'Max', 'Finn', 'Axel', 'Ezra'];
  var WOMEN = ['Ava', 'Maya', 'Zara', 'Priya', 'Chloe', 'Amara', 'Sofia', 'Nia', 'Hana', 'Aisha', 'Ines', 'Grace', 'Elena', 'Lena', 'Mei', 'Leila', 'Freya', 'Rosa', 'Tess', 'Nora', 'Imani', 'Keiko', 'Ruby', 'Lola', 'Jade', 'Luna', 'Isla', 'Mila', 'Nala'];
  // Short way to write a normal event: CS.E(id, category, icon, title, text, [[answer, effect] x4], extra fields).
  CS.E = function (id, cat, icon, title, text, choices, o) {
    var d = { id: id, cat: cat, icon: icon, title: title, text: text };
    if (choices) d.choices = choices.map(function (c) { return { t: c[0], fx: c[1] }; });
    if (o) for (var k in o) d[k] = o[k];
    CS.ev(d);
  };
  var E = CS.E, rival = H.rival, noCams = H.noCams, busy = H.busy;
  var loyalP = function (hi, lo) { return function (g, c) { var e = G.emp(g, c.a); return e && G.has(e, 'loyal') ? hi : lo; }; };

  // =====================================================================
  // 👥 TEAM
  // =====================================================================

  E('fight', 'team', '🥊', '{a} and {b} had a screaming match', 'It happened in front of customers. Now they refuse to work together.', [
    ['🤝 Sit them down and talk', { chance: { p: 0.6, win: { rel: ['a', 'b', 30], team: 2, say: 'They shook hands. For now.' }, lose: { rel: ['a', 'b', -10], next: ['feud', 1, 2], say: 'It got worse. {b} stormed out.' } } }],
    ['⚠️ Warn them both', { a: -6, b: -6, rel: ['a', 'b', 5], say: 'Both are mad at you now, but it\'s quiet.' }],
    ['🚪 Fire {a}', { fire: 'a', say: 'The shouting stopped. So did {a}\'s job.' }],
    ['🙈 Stay out of it', { rel: ['a', 'b', -25], next: ['feud', 1, 2, 0.7], say: 'You pretended not to hear it.' }]
  ], { w: 4, cd: 6, need: 2, who: { a: 'aggressive', b: 'any' } });

  E('feud', 'team', '🔥', '{b}: "It\'s me or {a}"', 'The fight between {a} and {b} split the team into two sides.', [
    ['💵 Pay {b} more to stay', { raise: ['b', 0.1], a: -8, say: '{b} stays. {a} is furious.' }],
    ['🚪 Fire {a}', { fire: 'a', team: 4, say: 'Peace returns. Mostly.' }],
    ['🔀 Put them on split shifts', { capacity: [0.95, 6, 'Split shifts'], rel: ['a', 'b', 15], say: 'Awkward, but it works.' }],
    ['👋 Let {b} walk', { quit: 'b', say: '{b} quit and slammed the door.' }]
  ], { chainOnly: true });

  E('joined_rival', 'rivals', '🕵️', '{name} now works for {rival}', 'Your old worker {name} just joined {rival}. They know how you do everything.', [
    ['📞 Try to win them back', { chance: { p: 0.35, win: { hireSpecial: { role: 'front', skill: 70 }, say: 'They came back. "Their boss is a nightmare."' }, lose: { next: ['idea_stolen', 3, 6, 0.6], say: 'They laughed and hung up.' } } }],
    ['🔐 Change your secret recipes', { cash: -0.3, say: 'Their inside info is useless now.' }],
    ['⚖️ Remind them of their contract', { chance: { p: 0.5, win: { rival: -0.05, say: 'They got scared and kept quiet.' }, lose: { cash: -0.4, say: 'Their lawyers were better than yours.' } } }],
    ['🤷 Let it go', { rival: 0.05, next: ['idea_stolen', 3, 6, 0.5], say: '{rival} just got stronger.' }]
  ], { kind: 'news', chainOnly: true });

  E('idea_stolen', 'rivals', '💡', '{rival} copied your best idea', '{rival} launched your idea as their own. Customers think they invented it.', [
    ['⚖️ Sue them', { cash: -1, chance: { p: 0.5, win: { cash: 3, rep: 3, rival: -0.15, say: 'You won in court. They had to pay.' }, lose: { demand: [0.9, 4, 'Idea copied'], say: 'You lost the case.' } } }],
    ['🚀 Launch a better version', { cash: -0.6, fans: 12, rival: -0.05, say: 'Yours is better, and people noticed.' }],
    ['📢 Tell the true story online', { chance: { p: 0.6, win: { fans: 20, rep: 3, say: 'People took your side.' }, lose: { rep: -2, say: 'People called you a sore loser.' } } }],
    ['🤷 Move on', { demand: [0.9, 5, 'Idea copied'], rival: 0.08, say: 'Some customers switched to them.' }]
  ], { kind: 'news', chainOnly: true });

  E('late', 'team', '⏰', '{a} is late. Again.', null, [
    ['💬 "Is everything okay?"', { chance: { p: 0.5, win: { loyal: { a: 15 }, reliable: { a: 12 }, say: 'Things were rough at home. {a} is grateful.' }, lose: { say: '{a} said thanks. And was late again Friday.' } } }],
    ['⚠️ "Final warning."', { reliable: { a: 12 }, a: -10, say: '{a} is on time now. Barely.' }],
    ['💸 Cut their pay', { raise: ['a', -0.1], reliable: { a: 8 }, a: -15, say: '{a} is on time. And bitter.' }],
    ['🚪 "Don\'t come back."', { fire: 'a', say: 'You fired {a} by text.' }]
  ], { kind: 'chat', from: 'a', msgs: ['sorry boss', 'overslept again', 'there in 30 min'], w: 3, who: { a: 'unreliable' } });

  E('raise_request', 'team', '💵', '{a} wants a big raise', null, [
    ['💵 Give 20%', { raise: ['a', 0.2], a: 20, loyal: { a: 10 }, say: 'Done. {a} is staying.' }],
    ['🤝 Offer 10%', { chance: { p: 0.55, win: { raise: ['a', 0.1], a: 8, say: '{a} took the deal.' }, lose: { quit: 'a', say: '{a} took the other offer.' } } }],
    ['📅 "Ask me in 6 months"', { a: -6, next: ['raise_promise', 20, 26], say: '{a} marked the date.' }],
    ['🚪 "Then go."', { quit: 'a', say: '{a} walked out and didn\'t look back.' }]
  ], { kind: 'chat', from: 'a', msgs: ['can we talk about money?', '{rival} offered me a job', '20% more or I leave'], w: 3, who: { a: 'greedy' }, init: rival });

  E('raise_promise', 'team', '📅', '{a} remembers your promise', null, [
    ['💵 Keep your word', { raise: ['a', 0.12], a: 15, loyal: { a: 10 }, say: '{a} trusts you now.' }],
    ['🙏 "Next month, I swear"', { chance: { p: 0.4, win: { a: -2, say: '{a} sighed and agreed.' }, lose: { quit: 'a', say: '{a} had enough and quit.' } } }],
    ['🎁 A bonus instead', { bonus: 'a', a: 6, say: 'A one-time bonus. {a} takes it.' }],
    ['🤥 "I never promised that"', { a: -25, loyal: { a: -20 }, team: -3, say: '{a} told everyone you lied.' }]
  ], { kind: 'chat', from: 'a', msgs: ['it\'s been 6 months', 'you promised me a raise'], chainOnly: true });

  E('dating', 'team', '💕', '{a} and {b} are dating', 'Everyone knows. They hold hands in the break room.', [
    ['💕 Wish them well', { date: true, team: 2, say: 'The team thinks it\'s sweet.' }],
    ['📜 Ban dating at work', { team: -4, a: -8, b: -8, say: 'Nobody liked the new rule.' }],
    ['🔀 Put them on different shifts', { date: true, capacity: [0.97, 4, 'Shift changes'], say: 'Love, but apart.' }],
    ['😬 "This will end badly"', { date: true, next: ['breakup', 6, 14, 0.7], say: 'You have a bad feeling about this.' }]
  ], { w: 2, cd: 20, need: 2, who: { a: 'notmgr', b: 'notmgr' } });

  E('breakup', 'team', '💔', '{a} and {b} broke up', 'It was messy. Now they won\'t even look at each other.', [
    ['🔀 Separate their shifts', { breakup: true, rel: ['a', 'b', 10], capacity: [0.96, 4, 'Separate shifts'], say: 'Cold, but calm.' }],
    ['☕ Talk to both of them', { breakup: true, chance: { p: 0.5, win: { rel: ['a', 'b', 20], team: 2, say: 'They agreed to stay professional.' }, lose: { rel: ['a', 'b', -20], say: '{b} cried in the storage room.' } } }],
    ['🚪 Let one of them go', { breakup: true, quit: 'b', a: 5, say: '{b} left. {a} is relieved.' }],
    ['🙈 Ignore it', { breakup: true, team: -5, rel: ['a', 'b', -30], say: 'The whole team is walking on eggshells.' }]
  ], { chainOnly: true });

  E('theft', 'team', '💸', 'Money is missing from the register', 'It happened three times this month. {a} was working every time.', [
    ['🔍 Confront {a}', { chance: { p: 0.5, win: { then: 'theft_confession', say: '{a} went pale.' }, lose: { a: -20, team: -6, say: '{a} was innocent. The team is upset with you.' } } }],
    ['📹 Install cameras', { cash: -0.4, next: ['theft_again', 3, 6, 0.5], say: 'Now you\'ll see everything.' }],
    ['🪤 Set a trap with marked bills', { chance: { p: 0.6, win: { then: 'theft_confession', say: 'Marked bills in {a}\'s bag. Caught.' }, lose: { say: 'Nothing. The thief got careful.' } } }],
    ['🤷 Let it slide', { cash: -0.3, next: ['theft_again', 2, 5, 0.7], say: 'More money went missing.' }]
  ], { w: 2, cd: 20, need: 2, who: { a: 'any' }, cond: noCams });

  E('theft_again', 'team', '📹', 'The thief struck again', 'This time it\'s bigger. And this time you saw {a} do it.', [
    ['👮 Call the police', { fire: 'a', rep: 3, say: '{a} was arrested.' }],
    ['🚪 Fire {a} quietly', { fire: 'a', say: '{a} is gone. No drama.' }],
    ['💬 One last chance', { chance: { p: 0.5, win: { a: 10, loyal: { a: 20 }, say: 'It never happened again.' }, lose: { cash: -0.4, fire: 'a', say: 'It happened again. You fired {a}.' } } }],
    ['💸 Make {a} pay it all back', { a: -10, cash: 0.3, say: '{a} paid it back, week by week.' }]
  ], { chainOnly: true });

  E('spy', 'team', '🕵️', '{a} might be a spy for {rival}', 'You saw {a} texting {rival}\'s manager. Twice.', [
    ['📱 Check {a}\'s work phone', { chance: { p: 0.5, win: { then: 'spy_caught', say: 'The messages are all there.' }, lose: { a: -15, loyal: { a: -15 }, say: 'Innocent. {a} feels betrayed.' } } }],
    ['🎭 Feed {a} fake plans', { chance: { p: 0.5, win: { rival: -0.05, next: ['fake_plan_flop', 2, 4], say: '{a} passed it on. Now you know.' }, lose: { say: 'Nothing happened. Maybe it wasn\'t {a}.' } } }],
    ['💬 Ask {a} straight out', { chance: { p: 0.6, win: { loyal: { a: 15 }, say: 'They were friends from school. Nothing more.' }, lose: { quit: 'a', say: '{a} quit on the spot. Suspicious.' } } }],
    ['🙈 Do nothing', { next: ['idea_stolen', 3, 6, 0.4], say: 'You let it go.' }]
  ], { w: 1.5, cd: 25, minWeek: 8, who: { a: 'any' }, init: rival });

  E('broken_machine', 'team', '🔧', '{a} broke the main machine', 'It was an accident. Fixing it will not be cheap.', [
    ['🔧 Pay for repairs', { cash: -0.5, say: 'Fixed in a day.' }],
    ['💸 Take it out of {a}\'s pay', { cash: -0.25, a: -18, say: '{a} is paying for it. Unhappily.' }],
    ['🆕 Buy a better one', { cash: -1.1, equip: 0.03, say: 'The new one is faster.' }],
    ['🩹 Fix it yourself', { chance: { p: 0.5, win: { say: 'It works. Somehow.' }, lose: { capacity: [0.85, 3, 'Broken machine'], say: 'It broke again. Worse.' } } }]
  ], { w: 2, cd: 15, who: { a: 'any' } });

  E('customer_argument', 'team', '😤', '{a} yelled at a customer', 'The customer was rude first. Now they\'re filming.', [
    ['🛡️ Defend {a}', { a: 12, loyal: { a: 10 }, rep: -3, say: 'Your team loves you. The internet doesn\'t.' }],
    ['🙏 Apologize to the customer', { happy: 3, a: -8, say: 'The customer calmed down.' }],
    ['🎓 Send {a} to training', { cash: -0.1, skill: { a: 3 }, say: '{a} learned to stay calm.' }],
    ['🚪 Fire {a} on the spot', { fire: 'a', rep: 2, say: 'The video ends with {a} walking out.' }]
  ], { w: 2, cd: 12, who: { a: 'front' } });

  E('star', 'team', '⭐', '{a} is your best worker', 'Customers ask for {a} by name. Other shops are noticing.', [
    ['🪜 Promote {a}', { promote: 'a', a: 15, say: '{a} is moving up.' }],
    ['💵 Raise to keep them', { raise: ['a', 0.15], loyal: { a: 20 }, say: 'Nobody is stealing {a} now.' }],
    ['🏅 Employee of the month', { a: 10, team: 3, say: '{a}\'s photo is on the wall.' }],
    ['🤐 Say nothing', { next: ['poached', 4, 8, 0.6], say: '{a} feels invisible.' }]
  ], { w: 2, cd: 15, who: { a: 'star' } });

  E('poached', 'team', '🎣', '{rival} wants to hire {a}', 'They offered {a} double pay. {a} came to you first.', [
    ['💰 Match the offer', { raise: ['a', 0.3], a: 20, loyal: { a: 20 }, say: '{a} stays. It cost you.' }],
    ['❤️ Appeal to loyalty', { chance: { p: loyalP(0.85, 0.45), win: { loyal: { a: 25 }, say: '{a} turned them down.' }, lose: { quit: 'a', say: '{a} took the money.' } } }],
    ['🪜 Offer a promotion', { promote: 'a', a: 15, say: 'A new title did the trick.' }],
    ['👋 Wish them luck', { quit: 'a', say: 'Your best worker now works for {rival}.' }]
  ], { w: 1.5, cd: 15, minWeek: 6, who: { a: 'star' }, init: rival });

  E('promotion_request', 'team', '🪜', '{a} wants a promotion', '"I\'ve earned it," {a} says. Others might get jealous.', [
    ['🪜 Promote {a}', { promote: 'a', a: 20, say: '{a} is thrilled.' }],
    ['📋 "Show me results first"', { a: -5, skill: { a: 2 }, say: '{a} is working twice as hard.' }],
    ['🎓 Pay for a course first', { cash: -0.2, skill: { a: 6 }, a: 8, say: '{a} came back sharper.' }],
    ['❌ "Not yet."', { a: -15, next: ['resign', 4, 10, 0.4], say: '{a} is updating their CV.' }]
  ], { w: 2, cd: 12, minWeek: 6, who: { a: 'ambitious' } });

  E('resign', 'team', '📝', '{a} is quitting', '{a} hands you a letter. "I found another job."', [
    ['💰 Offer 20% more', { chance: { p: loyalP(0.9, 0.6), win: { raise: ['a', 0.2], a: 25, say: '{a} tore up the letter.' }, lose: { quit: 'a', say: 'Too late. {a} already said yes.' } } }],
    ['💬 Ask what went wrong', { chance: { p: 0.4, win: { a: 25, loyal: { a: 10 }, say: 'You fixed it together. {a} stays.' }, lose: { quit: 'a', say: '{a} had been unhappy for months.' } } }],
    ['🎁 A going-away gift', { quit: 'a', rep: 2, team: 3, say: '{a} left on good terms.' }],
    ['🚪 "Leave today."', { quit: 'a', team: -3, say: '{a} packed up in ten minutes.' }]
  ], { chainOnly: true });

  E('jealous', 'team', '😒', '{a} is jealous of {b}', '{b} got promoted. {a} thinks it was unfair.', [
    ['💬 Explain your choice', { chance: { p: 0.55, win: { say: '{a} understands.' }, lose: { a: -10, rel: ['a', 'b', -25], say: '{a} doesn\'t buy it.' } } }],
    ['🤞 "You\'re next"', { a: 8, next: ['promotion_request', 6, 12], say: '{a} will hold you to that.' }],
    ['🎁 A small raise for {a}', { raise: ['a', 0.05], a: 10, say: '{a} feels valued.' }],
    ['😑 "Deal with it"', { a: -18, loyal: { a: -10 }, rel: ['a', 'b', -35], say: '{a} slammed the door.' }]
  ], { chainOnly: true });

  E('burnout', 'team', '🥵', 'Your team is burning out', 'Too many customers, not enough hands. People are exhausted.', [
    ['🍕 Buy dinner for everyone', { cash: -0.1, team: 6, say: 'It helped. A little.' }],
    ['🧑‍💼 Hire help this week', { hireSpecial: { role: 'front', skill: 45 }, team: 5, say: 'Fresh hands. Everyone breathes again.' }],
    ['🏖️ Close one day to rest', { closed: [1, 'Rest day'], team: 15, say: 'Everyone came back recharged.' }],
    ['💪 "Push through"', { team: -12, capacity: [1.1, 2, 'Pushing hard'], say: 'Sales up. Morale down.' }]
  ], { w: 3, cd: 10, need: 3, cond: busy });

  E('sick', 'team', '🤒', '{a} called in sick', 'On the busiest day of the week.', [
    ['🍲 "Get well soon!"', { a: 8, capacity: [0.95, 1, 'Short-staffed'], say: '{a} appreciated it.' }],
    ['🤨 Ask for a doctor\'s note', { chance: { p: 0.6, win: { a: -3, say: '{a} really was sick.' }, lose: { a: -10, reliable: { a: -5 }, say: '{a} was at the beach. You saw the photos.' } } }],
    ['😤 "Come in anyway"', { a: -15, team: -4, say: '{a} came in coughing. Two others got sick.' }],
    ['🧑‍🍳 Cover the shift yourself', { team: 3, say: 'You worked the counter all day.' }]
  ], { w: 3, cd: 6, who: { a: 'any' } });

  E('idea', 'team', '💡', '{a} has a big idea', '{a} wants to launch something new. It could be huge, or a flop.', [
    ['🚀 Go all in', { cash: -0.8, chance: { p: 0.5, win: { demand: [1.2, 6, 'New idea'], fans: 20, a: 10, say: 'It\'s a hit!' }, lose: { a: -5, say: 'Nobody wanted it.' } } }],
    ['🧪 Test it small first', { cash: -0.2, chance: { p: 0.6, win: { demand: [1.08, 6, 'New idea'], say: 'A nice small win.' }, lose: { say: 'The test flopped. Cheap lesson.' } } }],
    ['🏆 Credit and a bonus for {a}', { bonus: 'a', a: 12, loyal: { a: 10 }, say: '{a} feels like a star.' }],
    ['❌ "Not now."', { a: -10, say: '{a} stopped sharing ideas.' }]
  ], { w: 2, cd: 12, who: { a: 'creative' } });

  E('training_request', 'team', '🎓', '{a} wants to take a course', 'It\'s expensive, but {a} would be much better at the job.', [
    ['🎓 Pay for it', { cash: -0.3, skill: { a: 10 }, a: 10, say: '{a} came back a pro.' }],
    ['🤝 Pay half', { cash: -0.15, skill: { a: 8 }, say: 'Fair deal.' }],
    ['📺 "Watch free videos"', { skill: { a: 2 }, a: -4, say: 'Not quite the same.' }],
    ['❌ "No budget."', { a: -8, next: ['resign', 5, 10, 0.2], say: '{a} looks disappointed.' }]
  ], { w: 2, cd: 12, who: { a: 'ambitious' } });

  E('mentor', 'team', '🧑‍🏫', '{b} keeps making mistakes', '{b} is new and struggling. {a} offered to help.', [
    ['🤝 Let {a} mentor {b}', { skill: { b: 8 }, rel: ['a', 'b', 25], a: -3, say: '{b} is improving fast.' }],
    ['💵 Pay {a} extra to do it', { cash: -0.1, skill: { b: 10 }, a: 5, say: 'Worth every cent.' }],
    ['🎓 Send {b} to training', { cash: -0.2, skill: { b: 6 }, say: 'Better.' }],
    ['🚪 Let {b} go', { fire: 'b', say: '{b} wasn\'t a fit.' }]
  ], { w: 2, cd: 12, who: { a: 'star', b: 'new' } });

  E('rumors', 'team', '🗣️', 'Rumor: you\'re selling the company', 'The team is worried. Some are looking for new jobs.', [
    ['📢 Team meeting: tell the truth', { team: 8, rep: 1, say: 'Everyone calmed down.' }],
    ['🤐 Say nothing', { team: -8, next: ['resign', 2, 4, 0.5], say: 'The rumors grew.' }],
    ['💵 Surprise bonus for everyone', { teamBonus: true, team: 10, say: 'Money talks.' }],
    ['🔍 Find who started it', { chance: { p: 0.5, win: { a: -10, team: 3, say: 'It was {a}. Awkward.' }, lose: { team: -5, say: 'A witch hunt. Bad vibes.' } } }]
  ], { w: 1.5, cd: 25, need: 3, who: { a: 'any' } });

  E('strike', 'team', '✊', 'Your team threatens a strike', 'They want better pay. If you say no, they walk out Monday.', [
    ['💵 Give everyone 8% more', { teamRaise: 0.08, team: 18, say: 'Strike called off.' }],
    ['🤝 Negotiate', { chance: { p: 0.5, win: { teamRaise: 0.04, team: 10, say: 'A fair deal for everyone.' }, lose: { closed: [1, 'Strike'], team: -5, say: 'Talks failed. They walked out for a week.' } } }],
    ['🍕 Offer perks instead', { cash: -0.3, chance: { p: 0.5, win: { team: 8, say: 'Free lunches did the trick.' }, lose: { closed: [1, 'Strike'], say: '"We can\'t pay rent with pizza." They walked out.' } } }],
    ['🚫 Refuse', { closed: [1, 'Strike'], team: -15, rep: -3, say: 'The shop sat empty for a week.' }]
  ], { w: 1, cd: 40, need: 5, minWeek: 15 });

  E('injured', 'team', '🩼', '{a} got hurt at work', '{a} slipped on a wet floor. Their lawyer is calling.', [
    ['💵 Pay the medical bills', { cash: -0.6, a: 10, rep: 2, say: '{a} is grateful. No lawsuit.' }],
    ['⚖️ Fight it in court', { chance: { p: 0.5, win: { cash: -0.3, say: 'You won. Barely.' }, lose: { cash: -2, rep: -4, say: 'You lost. It was expensive.' } } }],
    ['🦺 Pay, and add safety rules', { cash: -0.9, a: 12, team: 5, equip: 0.01, say: 'Safer shop, happier team.' }],
    ['🙅 "Not my problem."', { cash: -1.2, rep: -6, team: -8, say: 'The court disagreed.' }]
  ], { w: 1.5, cd: 25, who: { a: 'any' } });

  E('worker_viral', 'team', '📱', '{a} went viral', 'A video of {a} working super fast has 2 million views.', [
    ['📱 Repost it', { fans: 20, a: 8, next: ['viral_offer', 4, 8, 0.3], say: 'New fans are pouring in.' }],
    ['🎥 Put {a} in your ads', { raise: ['a', 0.1], fans: 30, a: 15, next: ['viral_offer', 4, 8, 0.5], say: '{a} is a local star.' }],
    ['🤐 Keep it low-key', { a: -3, say: 'It faded in a week.' }],
    ['🔒 Sign {a} to a contract', { cash: -0.2, loyal: { a: 20 }, fans: 10, say: 'Nobody can steal {a} now.' }]
  ], { w: 1.5, cd: 25, who: { a: 'front' } });

  E('second_job', 'team', '🌙', '{a} works for another company', 'You found out {a} works nights at a competitor.', [
    ['🚪 Fire {a}', { fire: 'a', say: 'Loyalty matters.' }],
    ['💬 Make {a} choose', { chance: { p: 0.6, win: { loyal: { a: 20 }, say: '{a} quit the other job.' }, lose: { quit: 'a', say: '{a} chose them.' } } }],
    ['💵 Pay {a} enough to quit it', { raise: ['a', 0.15], loyal: { a: 15 }, say: '{a} quit the night job.' }],
    ['🤷 "It\'s your life"', { a: 5, reliable: { a: -5 }, say: '{a} is tired, but grateful.' }]
  ], { w: 1.5, cd: 25, who: { a: 'any' } });

  E('bully', 'team', '😠', '{a} is bullying {b}', '{b} is afraid to come to work. Everyone knows why.', [
    ['🚪 Fire {a}', { fire: 'a', b: 15, team: 6, say: 'The team feels safer.' }],
    ['⚠️ Final warning for {a}', { a: -10, b: 5, next: ['bully_again', 3, 6, 0.5], say: '{a} backed off. For now.' }],
    ['🔀 Separate them', { rel: ['a', 'b', -10], capacity: [0.97, 4, 'Separate shifts'], say: 'Out of sight, out of mind.' }],
    ['🙈 "Sort it out yourselves"', { b: -20, chance: { p: 0.5, win: { say: '{b} is holding on. Barely.' }, lose: { quit: 'b', say: '{b} quit. Everyone knows why.' } } }]
  ], { w: 1.5, cd: 20, need: 2, who: { a: 'aggressive', b: 'any' } });

  E('new_star', 'team', '🌟', '{a} is a natural', 'Just started, and already the fastest on the team.', [
    ['🪜 Fast-track a promotion', { promote: 'a', team: -3, say: '{a} is climbing fast. Some are jealous.' }],
    ['💵 A raise to keep them', { raise: ['a', 0.1], loyal: { a: 15 }, say: '{a} is here to stay.' }],
    ['🧑‍🏫 Let them train the others', { capacity: [1.05, 6, 'New tricks'], team: 3, say: 'Everyone got a bit faster.' }],
    ['🤐 Don\'t let it go to their head', { a: -5, say: '{a} feels unappreciated.' }]
  ], { w: 2, cd: 15, who: { a: 'new' } });

  E('fake_cv', 'team', '📄', '{a} lied on their CV', '{a} never worked at the famous place they claimed.', [
    ['🚪 Fire {a}', { fire: 'a', say: 'No liars here.' }],
    ['💬 Give them a chance', { chance: { p: 0.5, win: { skill: { a: 5 }, loyal: { a: 20 }, say: '{a} works harder than anyone now.' }, lose: { rep: -2, say: '{a} kept messing up.' } } }],
    ['📉 Cut their pay', { raise: ['a', -0.15], a: -10, say: '{a} took the pay cut.' }],
    ['🤐 Ignore it', { rep: -1, next: ['fake_cv_exposed', 3, 6, 0.6], say: 'You hope nobody finds out.' }]
  ], { w: 1.5, cd: 20, who: { a: 'new' } });

  E('manager_raise', 'team', '👔', 'Manager {m} wants a raise', null, [
    ['💵 Give it', { raise: ['m', 0.15], m: 15, loyal: { m: 10 }, say: '{m} is happy. The team runs smoothly.' }],
    ['📊 Tie it to results', { chance: { p: 0.6, win: { raise: ['m', 0.15], capacity: [1.05, 8, 'Motivated manager'], say: '{m} hit the goals. Raise earned.' }, lose: { m: -8, say: '{m} missed the goals. No raise.' } } }],
    ['🎁 A bonus instead', { bonus: 'm', m: 5, say: 'Not what {m} wanted, but okay.' }],
    ['❌ "No."', { m: -20, next: ['resign', 3, 6, 0.3], say: '{m} is quietly job hunting.' }]
  ], { kind: 'chat', from: 'm', msgs: ['I run this place', 'I deserve to be paid like it', 'can we talk?'], w: 1.5, cd: 20, who: { m: 'mgr' } });

  E('bad_manager', 'team', '😡', 'Your manager is a bully', 'Three workers complained. {m} yells at everyone.', [
    ['🎓 Leadership training', { cash: -0.3, m: -5, team: 8, say: '{m} is calmer now.' }],
    ['⬇️ Demote {m}', { demote: 'm', team: 10, say: 'The team cheered. Quietly.' }],
    ['🚪 Fire {m}', { fire: 'm', team: 12, say: 'Nobody misses {m}.' }],
    ['🤷 "Results matter more"', { team: -12, capacity: [1.05, 4, 'Strict manager'], say: 'Fast work. Miserable team.' }]
  ], { w: 1.5, cd: 25, who: { m: 'mgr' } });

  E('wants_manager', 'team', '👔', '{a} wants to be a manager', '{a} is ready to lead. Is the team ready for {a}?', [
    ['👔 Make {a} manager', { mgr: 'a', a: 20, say: 'Meet your new manager.' }],
    ['📋 A trial month first', { chance: { p: 0.6, win: { mgr: 'a', say: '{a} passed the test. Promoted!' }, lose: { a: -8, say: 'It didn\'t work out. {a} is back to normal work.' } } }],
    ['🎓 Leadership course first', { cash: -0.3, skill: { a: 5 }, a: 5, say: '{a} is learning how to lead.' }],
    ['❌ "Not you."', { a: -12, say: '{a} took it hard.' }]
  ], { w: 1.5, cd: 25, need: 6, who: { a: 'ambitious' } });

  E('team_building', 'team', '🎳', 'Your team barely talks', 'Everyone eats lunch alone. It\'s way too quiet.', [
    ['🎳 Bowling night', { cash: -0.15, team: 10, say: 'They laughed all night.' }],
    ['🏕️ A weekend trip', { cash: -0.5, team: 18, say: 'They came back as a real team.' }],
    ['🍕 Pizza Fridays', { cash: -0.2, team: 7, say: 'Friday is everyone\'s favorite day now.' }],
    ['🤷 "They\'re here to work"', { team: -5, say: 'The silence continues.' }]
  ], { w: 1.5, cd: 25, need: 4 });

  E('anniversary', 'team', '🎂', '{a}\'s first work anniversary', '{a} has been here a full year today. The team wants to celebrate.', [
    ['🎉 Throw a party', { cash: -0.1, a: 15, team: 5, say: '{a} got a little emotional.' }],
    ['💵 A raise as a thank you', { raise: ['a', 0.08], a: 15, loyal: { a: 15 }, say: '{a} is staying for years.' }],
    ['🏅 A plaque on the wall', { a: 10, say: '{a} took a photo of it.' }],
    ['😐 Forget about it', { a: -10, say: 'Nobody said anything. {a} noticed.' }]
  ], { w: 1.5, cd: 30, who: { a: 'veteran' } });

  E('secret_skill', 'team', '🎨', '{a} used to be a pro designer', '{a} designed for big brands before this job. They never mentioned it.', [
    ['🎨 Let {a} redo your branding', { rep: 5, fans: 15, a: 10, say: 'Your shop looks amazing now.' }],
    ['🪜 Give {a} a new role', { promote: 'a', a: 12, say: '{a} is your new head of design.' }],
    ['💵 Pay extra for side projects', { cash: -0.2, fans: 10, a: 6, say: 'Beautiful new menus and posters.' }],
    ['🤷 "Just do your job"', { a: -8, say: '{a} shrugged and went back to work.' }]
  ], { w: 1, cd: 40, who: { a: 'creative' } });

  E('phone_addict', 'team', '📵', '{a} is always on their phone', 'Customers wait while {a} scrolls.', [
    ['📵 Phones go in a locker', { team: -3, capacity: [1.05, 6, 'No phones'], say: 'Service is faster already.' }],
    ['⚠️ Warn {a}', { a: -5, reliable: { a: 5 }, say: '{a} put it away. Mostly.' }],
    ['🎯 Set a goal with a bonus', { bonus: 'a', skill: { a: 2 }, say: '{a} hit the goal. Phone forgotten.' }],
    ['🚪 Fire {a}', { fire: 'a', say: 'Maybe they\'ll go viral now.' }]
  ], { w: 1.5, cd: 20, who: { a: 'lazy' } });

  E('family_emergency', 'team', '🏥', '{a} has a family emergency', '{a}\'s mother is in the hospital in another city.', [
    ['✈️ Paid leave and a plane ticket', { cash: -0.2, a: 25, loyal: { a: 30 }, capacity: [0.95, 1, '{a} away'], say: '{a} will never forget this.' }],
    ['🗓️ Unpaid leave', { a: 10, capacity: [0.95, 1, '{a} away'], say: '{a} left right away.' }],
    ['🤝 The team covers the shifts', { team: 5, a: 15, say: 'Everyone stepped up.' }],
    ['😬 "Can it wait until Friday?"', { a: -20, loyal: { a: -15 }, say: '{a} left anyway. And won\'t forget it.' }]
  ], { w: 1.5, cd: 25, who: { a: 'any' } });

  E('trash_talk', 'team', '💬', '{a} trashed you online', 'An anonymous post says your shop is a terrible place to work. It was {a}.', [
    ['🚪 Fire {a}', { fire: 'a', rep: -3, say: '{a} posted about that too.' }],
    ['💬 Talk it out', { chance: { p: 0.5, win: { a: 15, rep: 2, say: '{a} deleted it and said sorry.' }, lose: { rep: -3, say: '{a} doubled down.' } } }],
    ['🛠️ Fix what they complained about', { cash: -0.3, team: 10, rep: 3, say: 'Things really did get better.' }],
    ['🤷 Ignore it', { rep: -4, say: 'People looking for jobs read it.' }]
  ], { w: 1.5, cd: 25, who: { a: 'lowmood' } });

  E('worker_baby', 'team', '👶', '{a} had a baby', '{a} is exhausted and very happy.', [
    ['🍼 Two weeks of paid leave', { a: 20, loyal: { a: 25 }, capacity: [0.95, 2, '{a} with the baby'], say: '{a} will never forget this.' }],
    ['🎁 A big gift basket', { cash: -0.1, a: 12, team: 3, say: '200 diapers. Very useful.' }],
    ['🎈 A baby party at work', { cash: -0.1, team: 8, a: 10, say: 'The baby was the star.' }],
    ['⏰ "See you Monday!"', { a: -12, team: -3, say: '{a} came back looking like a zombie.' }]
  ], { w: 1.2, cd: 25, who: { a: 'any' } });

  E('worker_wedding', 'team', '💍', '{a} is getting married', '{a} invited the whole team. That would leave the shop empty.', [
    ['💒 Close and everyone goes', { closed: [1, 'Wedding'], team: 12, a: 20, say: 'You danced all night.' }],
    ['🎁 Pay for the honeymoon', { cash: -0.6, a: 20, loyal: { a: 30 }, say: '{a} sent a postcard from the beach.' }],
    ['🍰 Make the wedding cake', { cash: -0.1, a: 10, fans: 8, say: 'Your logo was on the cake. Free advertising.' }],
    ['🙅 Only {a} can go', { a: -5, team: -5, say: 'Everyone was sad to miss it.' }]
  ], { w: 1.2, cd: 30, who: { a: 'any' } });

  E('worker_jackpot', 'team', '🎰', '{a} won the lottery', null, [
    ['🎉 "Go live your dream!"', { leave: 'a', rep: 2, say: '{a} left happy. They bought a boat.' }],
    ['💼 "Invest in our company!"', { chance: { p: 0.5, win: { cash: 4, leave: 'a', say: '{a} invested, then retired to a beach.' }, lose: { leave: 'a', say: '{a} said no thanks and left.' } } }],
    ['🙏 "Please stay!"', { chance: { p: 0.35, win: { a: 20, say: '{a} stays because they love the job.' }, lose: { leave: 'a', say: '{a} said sorry and left.' } } }],
    ['🤔 "Can I borrow some?"', { chance: { p: 0.3, win: { cash: 1, say: '{a} gave the company a gift.' }, lose: { leave: 'a', say: '{a} left without saying goodbye.' } } }]
  ], { kind: 'chat', from: 'a', msgs: ['BOSS', 'I WON THE LOTTERY', 'like... A LOT', 'I don\'t need to work anymore'], rarity: 'rare', w: 1, cd: 50, who: { a: 'any' } });

  E('cpr_hero', 'team', '🚑', '{a} saved a customer\'s life', 'A customer collapsed. {a} did CPR until the ambulance came.', [
    ['🏅 A hero medal and a bonus', { bonus: 'a', a: 15, loyal: { a: 20 }, team: 4, say: '{a} is officially a hero.' }],
    ['❤️ First-aid classes for everyone', { cash: -0.3, team: 5, rep: 4, say: 'Now your whole team can save lives.' }],
    ['📱 Tell the world', { viral: [1, 3], rep: 4, a: 8, say: 'The news called {a} "The Hero of {city}".' }],
    ['🪜 Promote {a}', { promote: 'a', a: 12, say: 'Heroes get promoted here.' }]
  ], { w: 1, cd: 40, who: { a: 'any' } });

  E('clique', 'team', '👯', 'The team split into two groups', 'The new people and the old people don\'t get along.', [
    ['🎲 Mix everyone into new teams', { team: 5, capacity: [0.97, 2, 'New teams'], say: 'Awkward first week. Then it worked.' }],
    ['🏆 A friendly competition', { cash: -0.1, team: 8, capacity: [1.05, 3, 'Competition'], say: 'Competing brought them together.' }],
    ['👔 Let the manager handle it', { chance: { p: 0.5, win: { team: 6, say: 'The manager fixed it.' }, lose: { team: -6, say: 'The manager picked a side. Oops.' } } }],
    ['🤷 Leave it', { team: -8, say: 'The groups still don\'t talk.' }]
  ], { w: 1.2, cd: 30, need: 6 });

  E('lazy_worker', 'team', '😴', '{a} is barely working', 'The others are doing {a}\'s work and they\'re angry about it.', [
    ['⚠️ Warn {a}', { chance: { p: 0.5, win: { reliable: { a: 10 }, say: '{a} woke up. Finally.' }, lose: { team: -4, say: 'Nothing changed.' } } }],
    ['📋 Give {a} clear daily goals', { skill: { a: 3 }, a: -4, say: 'Goals helped. {a} does more now.' }],
    ['🚪 Fire {a}', { fire: 'a', team: 6, say: 'The team is relieved.' }],
    ['🙈 Ignore it', { team: -8, say: 'The hard workers are losing motivation.' }]
  ], { w: 2, cd: 15, need: 3, who: { a: 'lazy' } });

  E('whistleblower', 'team', '📣', '{a} wants to report you', '{a} says you\'re breaking safety rules and wants to tell the city.', [
    ['🛠️ Fix the problems now', { cash: -0.6, rep: 3, a: 15, say: 'You fixed everything. {a} is satisfied.' }],
    ['🤝 Thank {a} for the warning', { cash: -0.4, loyal: { a: 20 }, say: 'You fixed it together.' }],
    ['🤫 Pay {a} to keep quiet', { cash: -0.3, chance: { p: 0.5, win: { next: ['hush_money', 3, 6, 0.6], say: '{a} took the money. For now.' }, lose: { rep: -10, cash: -1, say: '{a} reported it anyway. Now you\'re fined for bribery too.' } } }],
    ['🚪 Fire {a}', { fire: 'a', rep: -8, cash: -1, say: '{a} reported you anyway. The fine was huge.' }]
  ], { w: 1, cd: 40, minWeek: 10, who: { a: 'serious' } });

  E('overtime_request', 'team', '🕐', 'The team wants overtime pay', 'They\'ve been staying late for free. They want to be paid for it.', [
    ['💵 Pay the overtime', { cash: -0.4, team: 12, say: 'Fair is fair.' }],
    ['🕔 Send everyone home on time', { team: 6, capacity: [0.95, 4, 'No overtime'], say: 'Less done, happier team.' }],
    ['🤝 Pay half', { cash: -0.2, team: 4, say: 'Nobody loved it, but they accepted.' }],
    ['❌ "That\'s part of the job"', { team: -12, next: ['resign', 2, 5, 0.4], say: 'People are angry.' }]
  ], { w: 1.5, cd: 25, need: 4, who: { a: 'any' } });

  E('worker_drunk', 'team', '🍺', '{a} showed up drunk', 'Slurring words, dropping things. Customers are staring.', [
    ['🏠 Send {a} home', { a: -5, capacity: [0.95, 1, '{a} sent home'], next: ['worker_drunk_again', 2, 5, 0.4], say: '{a} left, embarrassed.' }],
    ['💬 Talk tomorrow, in private', { chance: { p: 0.6, win: { a: 10, loyal: { a: 15 }, next: ['worker_recovered', 8, 14, 0.6], say: '{a} is going through a divorce. You offered help.' }, lose: { say: '{a} brushed it off.' } } }],
    ['🚪 Fire {a}', { fire: 'a', say: 'Zero tolerance.' }],
    ['🙈 Pretend you didn\'t see', { rep: -4, next: ['worker_drunk_again', 1, 3, 0.6], say: 'A customer complained to the city.' }]
  ], { w: 1.2, cd: 30, who: { a: 'any' } });

  E('salary_leak', 'team', '📄', 'Everyone saw everyone\'s salary', 'A payslip was left on the printer. {a} earns much less than {b} for the same job.', [
    ['💵 Raise {a} to match', { raise: ['a', 0.15], a: 15, team: 3, say: 'Fair pay. The team noticed.' }],
    ['📋 Fair pay for everyone', { teamRaise: 0.04, team: 10, say: 'Expensive, but trust is back.' }],
    ['💬 Explain the difference', { chance: { p: 0.4, win: { say: '{a} understood.' }, lose: { a: -15, rel: ['a', 'b', -20], say: '{a} doesn\'t buy it.' } } }],
    ['🤐 Say nothing', { a: -20, team: -6, next: ['resign', 2, 5, 0.5], say: '{a} is furious.' }]
  ], { w: 1.2, cd: 30, need: 3, who: { a: 'any', b: 'any' } });

  E('manager_wants_fire', 'team', '👔', '{m} wants to fire {a}', '"{a} is slow and it\'s dragging everyone down."', [
    ['✅ Let {m} decide', { fire: 'a', m: 8, say: '{m} fired {a}.' }],
    ['🎓 One more chance with training', { cash: -0.1, skill: { a: 6 }, m: -4, say: '{a} is improving.' }],
    ['🔍 See for yourself first', { chance: { p: 0.5, win: { a: 8, say: '{a} is fine. {m} was too harsh.' }, lose: { fire: 'a', say: '{m} was right.' } } }],
    ['🛡️ Protect {a}', { m: -12, a: 10, say: '{m} feels undermined.' }]
  ], { w: 1.2, cd: 25, need: 3, who: { m: 'mgr', a: 'lazy' } });

  E('asleep_on_job', 'team', '😴', '{a} was asleep at the counter', 'A customer took a photo and posted it.', [
    ['💬 Ask why', { chance: { p: 0.6, win: { a: 8, loyal: { a: 10 }, say: '{a} works two jobs to pay rent.' }, lose: { say: '{a} just stayed up gaming.' } } }],
    ['⚠️ Written warning', { a: -8, reliable: { a: 8 }, say: 'It won\'t happen again.' }],
    ['🚪 Fire {a}', { fire: 'a', say: 'Gone.' }],
    ['☕ Free coffee for the team', { cash: -0.02, team: 4, say: 'Everyone is more awake.' }]
  ], { w: 1.5, cd: 25, who: { a: 'lazy' } });

  E('union', 'team', '✊', 'Your workers want a union', 'They say they need a voice. {a} is leading it.', [
    ['🤝 Support it', { team: 12, teamRaise: 0.03, rep: 4, say: 'The team trusts you.' }],
    ['💬 Talk first', { chance: { p: 0.5, win: { team: 8, say: 'You fixed their worries.' }, lose: { team: -5, say: 'They formed it anyway.' } } }],
    ['💵 Raises to stop it', { teamRaise: 0.05, team: 6, say: 'They dropped the idea. For now.' }],
    ['🚪 Fire {a}', { fire: 'a', team: -18, rep: -8, say: 'Illegal. The news found out.' }]
  ], { w: 0.8, cd: 50, need: 6, minWeek: 20, who: { a: 'serious' } });

  E('retirement', 'team', '🎣', '{a} wants to retire', 'After many years. "I\'m tired. I want to see my grandkids."', [
    ['🎉 A big farewell party', { leave: 'a', cash: -0.1, team: 8, rep: 2, say: 'Everyone cried. Good tears.' }],
    ['🎁 A retirement gift', { leave: 'a', cash: -0.3, team: 6, say: '{a} was very touched.' }],
    ['🧑‍🏫 Train a replacement first', { skill: { b: 8 }, leave: 'a', say: '{b} learned everything from {a}.' }],
    ['🙏 Ask {a} to stay a bit', { chance: { p: 0.5, win: { a: 5, say: 'One more year.' }, lose: { leave: 'a', say: '{a} said no, kindly.' } } }]
  ], { w: 0.8, cd: 40, who: { a: 'old', b: 'any' } });

  E('stalker', 'team', '😨', 'A customer follows {a} home', 'Every night. {a} is scared to leave work alone.', [
    ['👮 Call the police', { a: 12, team: 4, say: 'He was warned. It stopped.' }],
    ['🚗 Drive {a} home yourself', { a: 15, loyal: { a: 15 }, say: '{a} feels safe.' }],
    ['🚫 Ban him from the shop', { a: 10, rep: 1, next: ['stalker_back', 2, 4, 0.5], say: 'He hasn\'t come back. Yet.' }],
    ['🤷 "Probably nothing"', { a: -20, next: ['resign', 1, 3, 0.6], say: '{a} feels alone.' }]
  ], { w: 0.8, cd: 40, who: { a: 'front' } });

  E('two_quit', 'team', '🚪', '{a} and {b} quit together', 'Same day. Same letter. They\'re opening their own shop.', [
    ['💰 Big raises to stay', { raise: ['a', 0.2], chance: { p: 0.5, win: { raise: ['b', 0.2], say: 'Both stayed.' }, lose: { leave: 'b', say: '{a} stayed. {b} left.' } } }],
    ['🤝 Invest in their shop', { leave: 'a', chance: { p: 1, win: { leave: 'b', cash: -0.5, extra: [0.05, 16, 'Their shop'], say: 'They left. You own a piece of their shop.' }, lose: { say: 'They left.' } } }],
    ['👋 Wish them luck', { leave: 'a', chance: { p: 1, win: { leave: 'b', say: 'Two gone. A new rival.' }, lose: { say: 'They left.' } } }],
    ['⚖️ Remind them of their contracts', { a: -20, b: -20, team: -6, say: 'They stayed. Angry.' }]
  ], { w: 0.8, cd: 40, need: 4, minWeek: 15, who: { a: 'ambitious', b: 'any' } });

  E('team_lunch_rumor', 'team', '🗣️', '{a} is spreading rumors about {b}', 'Nasty ones. {b} heard, and wants you to do something.', [
    ['🗣️ Talk to both', { chance: { p: 0.6, win: { rel: ['a', 'b', 20], say: 'Cleared the air.' }, lose: { rel: ['a', 'b', -20], say: 'It got worse.' } } }],
    ['⚠️ Warn {a}', { a: -8, b: 8, say: 'The rumors stopped.' }],
    ['🚪 Fire {a}', { fire: 'a', b: 12, team: 4, say: 'The team feels safer.' }],
    ['🙈 Stay out of it', { b: -15, team: -4, say: '{b} feels alone.' }]
  ], { w: 1.2, cd: 25, need: 3, who: { a: 'any', b: 'any' } });

  E('first_hire_loyal', 'team', '🤝', '{a} turned down a huge offer', 'A big company offered {a} double. {a} said no, for you.', [
    ['💵 A raise to say thanks', { raise: ['a', 0.15], a: 15, loyal: { a: 15 }, say: '{a} was touched.' }],
    ['🪜 Promote {a}', { promote: 'a', a: 18, say: '{a} deserves it.' }],
    ['🎁 A big bonus', { bonus: 'a', a: 12, say: 'Thank you, {a}.' }],
    ['😊 A heartfelt thank you', { a: 6, say: '{a} smiled.' }]
  ], { w: 1, cd: 40, who: { a: 'loyal' } });
})();
