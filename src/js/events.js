// All events.
//
// Common fields:
//   id, cat (see CS.CATS), icon, kind, rarity (common|rare|epic|legendary), w (weight), cd (cooldown weeks),
//   minWeek, need (min staff), cond(g), who ({a: 'any'|'<trait>'|'front'|'mgr'|'lowmood'|'star'|'new'|'veteran'|'notmgr', b: ...}),
//   init(g, ctx) to add data (return false to skip), start (effect applied when the event appears),
//   chainOnly (only happens as a follow-up).
// Text uses {a} {b} {m} {rival} {amt} {company} {front} {fronts} {unit} {industry} {city} and any ctx key.
//
// Kinds:
//   choice (default)  title, text, choices: [{ t, d, fx }]
//   chat              from: 'a' | 'm' | { name, face }, msgs: [...], choices = replies
//   review            stars, text, choices
//   news              title = headline, text, choices
//   minor             no choices; fx runs by itself and shows in the weekly report
//   boxes             prizes: [{ label, emoji, w, fx }]
//   wheel             slices: [{ label, emoji, color, w, fx, jackpot }]
//   tap               target (emoji), goal, secs, win, lose
//   quiz              init makes ctx.q = { q, options, answer }, win, lose
//   deal              init sets ctx.offer, accept(g, c) -> fx
//   vs                win, lose, tie
//   interview         init makes ctx.cand
//   post              pick a social media post
//
// Effect (fx) keys: cash (share of weekly sales, negative = cost), money ($), rep, happy, fans, team,
//   a/b/m (mood of that person), skill/loyal/reliable ({a: n}), rel ['a','b',n], date, breakup,
//   raise ['a', pct], teamRaise, teamBonus, bonus 'a', promote 'a', mgr 'a', demote 'a', fire 'a', quit 'a',
//   demand/capacity/supply [value, weeks, label], extra [share, weeks, label], closed [weeks, label],
//   price (+1/-1), equip (permanent speed), rent (permanent), viral [min, max], hire 'cand', hireSpecial {...},
//   next ['id', minWeeks, maxWeeks, chance], chance { p, win, lose }, say, xp, flag, run(g, c).
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var U = CS.U, G = CS.G;
  var E = [];
  function ev(d) {
    d.kind = d.kind || (d.choices ? 'choice' : 'minor');
    E.push(d);
  }

  function rival(g, c) { c.rival = U.pick(g.rivals); }
  function amt(frac) { return function (g, c) { c.amt = G.cost(g, frac); }; }
  function isInd(list) { return function (g) { return list.indexOf(g.company.industry) >= 0; }; }
  var FOOD = isInd(['cafe', 'restaurant', 'bakery', 'foodtruck', 'supermarket', 'convenience', 'hotel']);
  var TECH = isInd(['gamestudio', 'software', 'tech', 'electronics', 'phonerepair']);
  var noCams = function (g) { return !G.upLevel(g, 'cameras'); };
  var hasRole = function (r) { return function (g) { return g.employees.some(function (e) { return e.role === r; }); }; };
  var season = function (from, to) { return function (g) { var w = ((g.week - 1) % 52) + 1; return w >= from && w <= to; }; };
  var busy = function (g) { var h = g.history[g.history.length - 1]; return h && h.demand > h.capacity * 1.08; };

  // =====================================================================
  // 👥 TEAM
  // =====================================================================

  ev({ id: 'fight', cat: 'team', icon: '🥊', w: 4, cd: 5, need: 2, who: { a: 'aggressive', b: 'any' },
    title: '{a} and {b} had a big fight!',
    text: 'They yelled at each other in front of customers. 😤 Now they won\'t talk.',
    choices: [
      { t: '🤝 Help them make up', fx: { chance: { p: 0.6, win: { rel: ['a', 'b', 35], team: 2, say: 'They shook hands! 🤗' }, lose: { rel: ['a', 'b', -10], say: 'It didn\'t work. {b} is still angry.', next: ['feud', 1, 2] } } } },
      { t: '📝 Warn them both', fx: { a: -8, b: -8, say: 'The yelling stopped. They are grumpy.' } },
      { t: '🚪 Fire {a}', fx: { fire: 'a', say: 'Everyone got the message. No fighting!' } },
      { t: '🙈 Ignore it', fx: { rel: ['a', 'b', -30], next: ['feud', 1, 1], say: 'You hope it goes away...' } }
    ] });

  ev({ id: 'feud', cat: 'team', icon: '🔥', chainOnly: true,
    title: 'The fight got WORSE!',
    text: '{a} and {b} are still fighting. Now the whole team is picking sides. {b} says: "Me or them!"',
    choices: [
      { t: '💵 Give {b} a raise to stay', fx: { raise: ['b', 0.1], a: -6, say: '{b} stays. {a} is jealous.' } },
      { t: '🚪 Fire {a}', fx: { fire: 'a', team: 3, say: 'Peace at last! 😌' } },
      { t: '👋 Let {b} leave', fx: { quit: 'b', say: '{b} packed up and left.' } }
    ] });

  ev({ id: 'joined_rival', cat: 'rivals', icon: '🕵️', chainOnly: true,
    fx: function (g, c) {
      if (c.creative || U.chance(0.35)) G.schedule(g, 'idea_stolen', U.ri(3, 6), c);
      G.news(g, '🕵️ ' + c.name + ' now works for ' + c.rival + '.', 'bad');
      return 'Your old worker ' + c.name + ' now works for ' + c.rival + '. Uh oh.';
    } });

  ev({ id: 'idea_stolen', cat: 'rivals', icon: '💡', kind: 'news', chainOnly: true,
    title: '{rival} stole your idea!',
    text: '{rival} launched a new product. It was {name}\'s idea when they worked for YOU! Customers are going there.',
    choices: [
      { t: '⚖️ Sue them', fx: { cash: -1.5, chance: { p: 0.5, win: { cash: 4, rep: 3, say: 'You WON in court! 🎉' }, lose: { demand: [0.9, 4, 'Rival copied you'], say: 'You lost the case. 😩' } } } },
      { t: '🚀 Make a better version', fx: { cash: -0.8, fans: 12, say: 'Yours is better! Customers noticed. 😎' } },
      { t: '🤷 Let it go', fx: { demand: [0.88, 5, 'Rival copied you'], say: 'Some customers go to {rival} for a while.' } }
    ] });

  ev({ id: 'late', cat: 'team', icon: '⏰', kind: 'chat', w: 3, who: { a: 'unreliable' }, from: 'a',
    title: '{a} is late again',
    msgs: ['sorry boss 😬', 'overslept AGAIN', 'be there in 20 min!!'],
    choices: [
      { t: '💬 "Is everything okay?"', fx: { chance: { p: 0.5, win: { loyal: { a: 15 }, reliable: { a: 12 }, say: '{a} had problems at home. They promise to do better. ❤️' }, lose: { say: '{a} says thanks... and is late again on Friday. 🙄' } } } },
      { t: '⚠️ "Last warning!"', fx: { reliable: { a: 12 }, a: -10, say: '{a} is on time now. Not happy about it though.' } },
      { t: '🚪 "You\'re fired."', fx: { fire: 'a', say: 'Bye {a}! 👋' } },
      { t: '👍 "No worries"', fx: { team: -3, say: 'The team has to cover for {a}. They are annoyed.' } }
    ] });

  ev({ id: 'raise_request', cat: 'team', icon: '💵', kind: 'chat', w: 4, who: { a: 'greedy' }, from: 'a',
    title: '{a} wants more money',
    msgs: ['hey boss 👋', 'can I get a raise?', 'I work really hard 💪'],
    choices: [
      { t: '💵 "Sure! +10%"', fx: { raise: ['a', 0.1], say: '{a} is super happy! 😁' } },
      { t: '🤏 "I can do +5%"', fx: { raise: ['a', 0.05], say: '{a} takes it.' } },
      { t: '📅 "Ask me in 2 months"', fx: { next: ['raise_promise', 8, 8], say: '{a} will remember that...' } },
      { t: '❌ "No."', fx: { a: -15, loyal: { a: -10 }, next: ['resign', 2, 5, 0.4], say: '{a} is sad. 😞 They might look for a new job.' } }
    ] });

  ev({ id: 'raise_promise', cat: 'team', icon: '📅', kind: 'chat', chainOnly: true, from: 'a',
    title: '{a} remembers your promise',
    msgs: ['hey boss', 'it\'s been 2 months 👀', 'what about my raise?'],
    choices: [
      { t: '✅ "A promise is a promise!"', fx: { raise: ['a', 0.1], loyal: { a: 15 }, say: '{a} trusts you now. 🙌' } },
      { t: '🙊 "Hmm... wait longer?"', fx: { a: -25, loyal: { a: -20 }, next: ['resign', 1, 1, 0.5], say: '{a} is really upset. 😠' } }
    ] });

  ev({ id: 'dating', cat: 'team', icon: '💘', w: 2, need: 3, who: { a: 'any', b: 'any' },
    cond: function (g) { return Object.keys(g.dating).length < 3; },
    title: '{a} and {b} are dating!',
    text: 'Everyone knows. They hold hands in the break room. 🥰 Is that okay?',
    choices: [
      { t: '🎉 "Congrats!"', fx: { date: true, a: 8, b: 8, next: ['breakup', 6, 14, 0.35], say: 'They are so happy! 💕' } },
      { t: '🚫 "No dating at work!"', fx: { a: -12, b: -12, team: -2, say: 'They are sad. They date anyway. 🙃' } },
      { t: '🤐 Stay out of it', fx: { date: true, next: ['breakup', 5, 12, 0.3], say: 'Love is in the air! 💘' } }
    ] });

  ev({ id: 'breakup', cat: 'team', icon: '💔', chainOnly: true, start: { breakup: true },
    title: '{a} and {b} broke up',
    text: 'It ended badly. 💔 They sit far apart and the team picked sides.',
    choices: [
      { t: '📆 Give them different shifts', fx: { cash: -0.05, rel: ['a', 'b', -20], say: 'Out of sight, out of mind.' } },
      { t: '🎳 Team bowling night!', fx: { cash: -0.3, team: 8, say: 'Bowling helped! 🎳' } },
      { t: '🤷 Let them deal with it', fx: { a: -15, b: -15, rel: ['a', 'b', -60], say: 'The office is freezing cold. 🥶' } }
    ] });

  ev({ id: 'resign', cat: 'team', icon: '📝', chainOnly: true,
    title: '{a} wants to quit!',
    text: '{a} gives you a letter. "I found a better job. Bye!" 😢',
    choices: [
      { t: '💰 Offer 20% more money', fx: { chance: { p: function (g, c) { var e = G.emp(g, c.a); return e && G.has(e, 'loyal') ? 0.9 : 0.6; }, win: { raise: ['a', 0.2], a: 30, say: '{a} rips up the letter! 🎉' }, lose: { quit: 'a', say: '{a} already said yes to the new job.' } } } },
      { t: '💬 Ask what\'s wrong', fx: { chance: { p: 0.35, win: { a: 30, loyal: { a: 10 }, say: 'You talked it out. {a} will stay! 🤗' }, lose: { quit: 'a', say: '{a} was unhappy for a long time. They leave.' } } } },
      { t: '👋 "Good luck!"', fx: { quit: 'a', say: '{a} leaves on good terms.' } }
    ] });

  ev({ id: 'jealous', cat: 'team', icon: '😒', chainOnly: true,
    title: '{a} is jealous!',
    text: '{a} is mad that {b} got promoted instead of them. "Not fair!" 😤',
    choices: [
      { t: '💬 Explain why', fx: { chance: { p: 0.55, win: { say: '{a} understands. Phew.' }, lose: { a: -10, rel: ['a', 'b', -25], say: '{a} doesn\'t believe you.' } } } },
      { t: '🤞 "You\'re next!"', fx: { a: 8, next: ['promotion_request', 6, 12], say: '{a} will hold you to that!' } },
      { t: '😑 "Get over it"', fx: { a: -18, loyal: { a: -10 }, rel: ['a', 'b', -35], say: '{a} slams the door. 🚪💥' } }
    ] });

  ev({ id: 'theft', cat: 'team', icon: '🫳', w: 2, minWeek: 4, who: { a: 'greedy' }, cond: noCams, init: amt(0.15), start: { cash: -0.15 },
    title: 'Money is missing! 😱',
    text: '{amt} is gone from the cash register. The camera is blurry... but it looks like {a}!',
    choices: [
      { t: '🔍 Ask {a} about it', fx: { chance: { p: function (g, c) { var e = G.emp(g, c.a); return e && G.has(e, 'greedy') ? 0.85 : 0.3; }, win: { fire: 'a', cash: 0.07, say: '{a} said sorry and paid half back. You fired them.' }, lose: { a: -20, loyal: { a: -20 }, say: 'It wasn\'t {a}! They are very hurt. 😢' } } } },
      { t: '📹 Buy better cameras', fx: { cash: -0.2, say: 'No more missing money! Probably.' } },
      { t: '🤷 Forget it', fx: { next: ['theft_again', 3, 6, 0.5], say: 'You let it go.' } }
    ] });

  ev({ id: 'theft_again', cat: 'team', icon: '🫳', chainOnly: true, fx: { cash: -0.3, say: 'MORE money is missing! Letting it go last time was a mistake. 😬' } });

  ev({ id: 'spy', cat: 'rivals', icon: '🕵️', w: 1, minWeek: 10, need: 4, rarity: 'rare', who: { a: 'greedy', b: 'any' }, init: rival,
    title: '{a} is a SPY! 🕵️',
    text: '{b} found secret messages. {a} is sending your plans to {rival}!',
    choices: [
      { t: '🚪 Fire them right now', fx: { fire: 'a', loyal: { b: 10 }, say: 'Security walks {a} out. 👮' } },
      { t: '🎭 Send them FAKE plans', fx: { chance: { p: 0.6, win: { fans: 15, fire: 'a', say: '{rival} fell for it and wasted tons of money! 😂 Then you fired {a}.' }, lose: { demand: [0.9, 4, 'Plans leaked'], say: '{rival} figured it out. 😩' } } } },
      { t: '🏅 Fire them + reward {b}', fx: { bonus: 'b', fire: 'a', team: 3, say: 'Everyone sees that honesty pays! ✨' } }
    ] });

  ev({ id: 'broke_equipment', cat: 'team', icon: '💥', w: 3, who: { a: 'front' }, init: amt(0.35),
    title: '{a} broke something expensive!',
    text: 'CRASH! 💥 {a} dropped an important machine. A new one costs {amt}.',
    choices: [
      { t: '💳 Company pays', fx: { cash: -0.35, loyal: { a: 8 }, say: 'Accidents happen. {a} is thankful. 🙏' } },
      { t: '🧾 {a} pays half', fx: { cash: -0.17, a: -20, say: '{a} pays. They are NOT happy.' } },
      { t: '🔧 Work without it', fx: { capacity: [0.85, 3, 'Broken machine'], say: 'Work is slower for 3 weeks. 🐢' } }
    ] });

  ev({ id: 'customer_argument', cat: 'team', icon: '🗯️', w: 3, who: { a: 'aggressive' },
    title: '{a} yelled at a customer!',
    text: 'A rude customer yelled at {a}. {a} yelled back! People were filming. 📱',
    choices: [
      { t: '🛡️ Stand up for {a}', fx: { a: 10, loyal: { a: 10 }, rep: -2, next: ['complaint_viral', 1, 1, 0.35], say: 'Your team loves you. The customer posts an angry review.' } },
      { t: '🙏 Say sorry to the customer', fx: { a: -8, rep: 1, say: 'The customer is happy. {a} feels bad.' } },
      { t: '🚪 Fire {a}', fx: { fire: 'a', rep: 1, say: 'The customer is happy. The team is nervous. 😬' } }
    ] });

  ev({ id: 'star', cat: 'team', icon: '🌟', w: 3, who: { a: 'star' },
    title: '{a} is a superstar!',
    text: '{a} is doing the work of TWO people! Customers ask for {a} by name. 🤩',
    choices: [
      { t: '💰 Give a bonus', fx: { bonus: 'a', say: '{a} is beaming! 😁' } },
      { t: '🎖️ Promote {a}', fx: { promote: 'a', say: 'Congrats {a}! 🎉' } },
      { t: '👏 Say "Great job!"', fx: { a: 4, say: '{a} smiles.' } }
    ] });

  ev({ id: 'promotion_request', cat: 'team', icon: '🪜', kind: 'chat', w: 2, minWeek: 6, who: { a: 'ambitious' }, from: 'a',
    title: '{a} wants a promotion',
    msgs: ['boss, can we talk? 🙂', 'I want to move up', 'I\'m ready for more!'],
    choices: [
      { t: '🎖️ "You got it!"', fx: { promote: 'a', next: ['out_of_depth', 2, 5, 0.25], say: '{a} got promoted! 🥳' } },
      { t: '📚 "Take a course first"', fx: { cash: -0.15, skill: { a: 8 }, a: 4, say: '{a} learned a lot! Skill +8 📈' } },
      { t: '⏳ "Not yet"', fx: { a: -12, next: ['resign', 3, 8, 0.3], say: '{a} is disappointed. 😔' } }
    ] });

  ev({ id: 'out_of_depth', cat: 'boss', icon: '🫠', chainOnly: true,
    title: '{a} is struggling',
    text: 'Since the promotion, {a} is confused and making mistakes. 😵',
    choices: [
      { t: '🧑‍🏫 Get {a} a coach', fx: { cash: -0.2, skill: { a: 12 }, say: '{a} is getting better every day! 💪' } },
      { t: '⬇️ Move {a} back down', fx: { demote: 'a', say: 'Awkward... but it helps.' } },
      { t: '⏳ Give it time', fx: { team: -4, capacity: [0.93, 4, 'Team confused'], say: 'Things are a bit messy for a while.' } }
    ] });

  ev({ id: 'rumors', cat: 'team', icon: '🗣️', w: 2, need: 3, who: { a: 'any', b: 'any' },
    title: '{a} is spreading rumors',
    text: '{a} is telling everyone that {b} will be fired soon. It\'s not true! {b} is upset. 😢',
    choices: [
      { t: '📣 Tell everyone the truth', fx: { b: 10, a: -6, say: 'Rumor stopped! {b} feels better.' } },
      { t: '🤫 Talk to {a} alone', fx: { rel: ['a', 'b', 5], say: '{a} promises to stop.' } },
      { t: '🙈 Ignore it', fx: { b: -15, rel: ['a', 'b', -30], say: 'The rumor keeps growing... 😬' } }
    ] });

  ev({ id: 'best_friends', cat: 'team', icon: '🫶', w: 2, need: 2, who: { a: 'friendly', b: 'any' },
    fx: { rel: ['a', 'b', 60], a: 5, b: 5, say: '{a} and {b} are now best friends! They even wear matching socks. 🧦' } });

  ev({ id: 'productive_week', cat: 'team', icon: '📈', w: 2, who: { a: 'front' },
    fx: { skill: { a: 3 }, capacity: [1.05, 1, 'Hot streak'], say: '{a} found a faster way to work! Skill +3 🚀' } });

  ev({ id: 'team_quit_threat', cat: 'team', icon: '🪧', w: function (g) { return G.avgMorale(g) < 42 ? 6 : 0; }, cd: 10, need: 4,
    title: 'The team is angry!',
    text: 'Your workers say they will ALL quit if things don\'t get better. 😡',
    choices: [
      { t: '💵 Everyone gets +5%', fx: { teamRaise: 0.05, say: 'Crisis over! Everyone is happier. 😌' } },
      { t: '🎁 Everyone gets a bonus', fx: { teamBonus: true, team: 5, say: 'Money helps! 💸' } },
      { t: '😤 "Go ahead, quit!"', fx: { run: function (g) { var gone = []; g.employees.slice().forEach(function (e) { if (e.morale < 40 && U.chance(0.35)) { gone.push(G.first(e)); G.removeEmp(g, e, 'quit', true); } }); return gone.length ? gone.join(', ') + ' walked out! 🚶🚶' : 'Nobody left... this time.'; } } }
    ] });

  ev({ id: 'day_off', cat: 'team', icon: '💒', kind: 'chat', w: 3, who: { a: 'any' }, from: 'a',
    title: '{a} needs a day off',
    msgs: ['hi boss!! 😊', 'my sister is getting married on friday 💒', 'can I have the day off? 🙏'],
    choices: [
      { t: '🎉 "Of course! Have fun!"', fx: { a: 12, loyal: { a: 8 }, capacity: [0.97, 1, 'Someone on a day off'], say: '{a} sends you a wedding cake photo! 🎂' } },
      { t: '😐 "Sorry, we\'re too busy"', fx: { a: -15, loyal: { a: -10 }, say: '{a} is very sad. 😞' } }
    ] });

  ev({ id: 'sick', cat: 'team', icon: '🤒', kind: 'chat', w: 3, who: { a: 'any' }, from: 'a',
    title: '{a} feels sick',
    msgs: ['boss I feel terrible 🤒', 'achoo!! 🤧', 'can I stay home?'],
    choices: [
      { t: '🛌 "Stay home and rest!"', fx: { loyal: { a: 6 }, capacity: [0.96, 1, 'Someone is sick'], say: '{a} gets better fast. 💚' } },
      { t: '😬 "Come in anyway"', fx: { chance: { p: 0.5, win: { a: -8, say: '{a} came in. They look awful. 🥴' }, lose: { team: -5, capacity: [0.85, 2, 'Half the team is sick'], say: 'Now HALF the team is sick! 🤧🤧🤧' } } } }
    ] });

  ev({ id: 'idea', cat: 'team', icon: '💡', kind: 'chat', w: 2, who: { a: 'creative' }, from: 'a',
    init: function (g, c) { c.thing = U.pick(['a glow-in-the-dark menu', 'a secret menu', 'a loyalty card with stickers', 'rainbow packaging', 'a mascot costume', 'a late-night opening']); },
    title: '{a} has an idea!',
    msgs: ['BOSS 💡💡💡', 'what if we tried {thing}?!', 'trust me it will be amazing'],
    choices: [
      { t: '🚀 "Let\'s try it!"', fx: { cash: -0.5, a: 10, chance: { p: 0.55, win: { demand: [1.15, 6, 'Great new idea'], fans: 10, say: 'Customers LOVE it! 🤩' }, lose: { say: 'Nobody cared. Oh well! 🤷' } } } },
      { t: '🙅 "Maybe later"', fx: { a: -6, say: '{a} writes it in their notebook anyway. 📓' } }
    ] });

  ev({ id: 'training_request', cat: 'team', icon: '📚', kind: 'chat', w: 2, who: { a: 'ambitious' }, from: 'a',
    title: '{a} wants to learn',
    msgs: ['there\'s a cool course online 📚', 'can the company pay for it?', 'I\'ll get way better!'],
    choices: [
      { t: '✅ "Yes, go for it!"', fx: { cash: -0.15, skill: { a: 10 }, a: 8, say: '{a} learned so much! Skill +10 🧠' } },
      { t: '❌ "Too expensive"', fx: { a: -6, say: '{a} watches free videos instead.' } }
    ] });

  ev({ id: 'pizza_party', cat: 'team', icon: '🍕', kind: 'chat', w: 2, need: 3, who: { a: 'friendly' }, from: 'a',
    title: 'Pizza party?',
    msgs: ['boss!! 🍕', 'the team worked super hard this month', 'pizza party??? pleeeease'],
    choices: [
      { t: '🍕 "PIZZA TIME!"', fx: { cash: -0.08, team: 8, say: 'Best Friday ever! 🍕🎉' } },
      { t: '🥗 "How about salad?"', fx: { team: -2, say: 'The team laughs... a little sadly. 🥗' } },
      { t: '❌ "Nope"', fx: { team: -4, say: 'Everybody is a bit disappointed.' } }
    ] });

  ev({ id: 'overworked', cat: 'team', icon: '😩', kind: 'chat', w: 5, cond: busy, who: { a: 'front' }, from: 'a',
    title: 'The team is exhausted',
    msgs: ['boss we are SO busy 😩', 'there are too many customers!', 'we need more people!!'],
    choices: [
      { t: '⏰ Pay for extra hours', fx: { cash: -0.3, capacity: [1.15, 2, 'Extra hours'], say: 'More work gets done! 💪' } },
      { t: '🤝 "I\'ll hire more soon!"', fx: { team: -2, say: 'Tip: Go to the Team tab to hire people!' } },
      { t: '😤 "Just work harder!"', fx: { team: -8, capacity: [1.05, 1, 'Pushing hard'], say: 'They work harder... and grumble. 😒' } }
    ] });

  ev({ id: 'anniversary', cat: 'team', icon: '🎂', w: 1, who: { a: 'veteran' },
    fx: { a: 8, loyal: { a: 5 }, say: '{a} has worked here for over a year! The team made a cake. 🎂' } });

  ev({ id: 'talent_show', cat: 'team', icon: '🎤', w: 1.5, need: 3, who: { a: 'funny' },
    title: 'Talent show?',
    text: 'The team wants to do a talent show after work! 🎤',
    choices: [
      { t: '🎭 Let\'s do it!', fx: { cash: -0.05, team: 6, chance: { p: 0.35, win: { viral: [0.5, 2], say: '{a} did an AMAZING magic trick. Someone posted it! 🪄' }, lose: { say: 'Everyone had fun! 🎉' } } } },
      { t: '🙅 Not at work', fx: { team: -3, say: 'Maybe next time.' } }
    ] });

  ev({ id: 'secret_skill', cat: 'team', icon: '🗣️', w: 1.5, who: { a: 'any' },
    init: function (g, c) { c.skillx = U.pick(['speaks 5 languages', 'can juggle 6 balls', 'is a chess champion', 'was a child actor', 'can draw amazing portraits']); },
    fx: { fans: 6, a: 5, say: 'Fun fact: {a} {skillx}! Customers love it. 🤩' } });

  ev({ id: 'phone_addict', cat: 'team', icon: '📱', w: 2, who: { a: 'lazy' },
    title: '{a} is always on their phone',
    text: 'Every time you look, {a} is scrolling videos. 📱😴',
    choices: [
      { t: '📵 No phones at work!', fx: { team: -3, capacity: [1.05, 4, 'No phones rule'], say: 'Work gets faster. People miss their phones.' } },
      { t: '💬 Talk to {a}', fx: { chance: { p: 0.5, win: { reliable: { a: 10 }, say: '{a} puts the phone away. 👍' }, lose: { say: '{a} just hides it better now. 🙄' } } } },
      { t: '🤷 Ignore it', fx: { capacity: [0.97, 3, 'Phone scrolling'], say: 'A little slower... but whatever.' } }
    ] });

  ev({ id: 'mentor', cat: 'team', icon: '🧑‍🏫', w: 1.5, need: 3, who: { a: 'star', b: 'any' },
    title: '{a} wants to teach {b}',
    text: '{a} is really good at the job. They want to teach {b} their tricks. It will slow {a} down a bit.',
    choices: [
      { t: '👍 Great idea!', fx: { skill: { b: 10 }, rel: ['a', 'b', 25], capacity: [0.97, 2, 'Training time'], say: '{b} learned a lot! Skill +10 🎓' } },
      { t: '🙅 {a} should just work', fx: { a: -5, say: 'Okay...' } }
    ] });

  ev({ id: 'poached', cat: 'rivals', icon: '🎣', w: 1.5, minWeek: 8, who: { a: 'star' }, init: rival,
    title: '{rival} wants to steal {a}!',
    text: '{rival} offered {a} 30% more money. {a} came to you first. 😬',
    choices: [
      { t: '💰 Match the offer', fx: { raise: ['a', 0.3], loyal: { a: 15 }, say: '{a} stays! 🙌' } },
      { t: '❤️ "We\'re a family!"', fx: { chance: { p: function (g, c) { var e = G.emp(g, c.a); return e && e.loyalty > 60 ? 0.8 : 0.3; }, win: { loyal: { a: 5 }, say: '{a} says no to {rival}! 🥹' }, lose: { quit: 'a', say: '{a} goes to {rival}. 😢' } } } },
      { t: '👋 Let {a} go', fx: { quit: 'a', say: '{a} leaves for {rival}.' } }
    ] });

  ev({ id: 'lottery_win', cat: 'team', icon: '🎰', w: 0.6, rarity: 'rare', who: { a: 'any' },
    title: '{a} won the lottery! 🎰',
    text: '{a} won $2 million! They are screaming and dancing on the tables. 💃',
    choices: [
      { t: '🥳 Throw a party for {a}', fx: { cash: -0.1, team: 8, chance: { p: 0.6, win: { quit: 'a', say: '{a} retires to a beach. They send a thank-you postcard. 🏖️' }, lose: { a: 20, say: '{a} decides to stay! "I love this job!" 🥹' } } } },
      { t: '💼 Ask {a} to invest in the company', fx: { chance: { p: 0.5, win: { cash: 3, say: '{a} invests! Cha-ching! 💰' }, lose: { quit: 'a', say: '{a} laughs and quits. 😂' } } } }
    ] });

  ev({ id: 'nap_pod', cat: 'team', icon: '😴', kind: 'chat', w: 1.5, who: { a: 'lazy' }, from: 'a',
    title: '{a} has a suggestion',
    msgs: ['boss hear me out 🙏', 'NAP PODS', 'we\'d work way better after a nap 😴'],
    choices: [
      { t: '😴 "Buy nap pods!"', fx: { cash: -0.4, team: 6, capacity: [1.04, 8, 'Well rested team'], say: 'Everyone is so rested! 😌' } },
      { t: '☕ "Drink coffee instead"', fx: { a: -3, say: '{a} sighs and grabs a coffee.' } }
    ] });

  ev({ id: 'new_worker_great', cat: 'team', icon: '🐣', w: 2, who: { a: 'new' },
    fx: { a: 6, skill: { a: 2 }, say: 'New worker {a} is doing great! Everyone likes them. 🐣' } });

  ev({ id: 'secret_santa', cat: 'team', icon: '🎁', w: 3, need: 3, cd: 50, cond: season(48, 52),
    title: 'Holiday gift swap! 🎁',
    text: 'The team wants to do a holiday gift swap. Should the company add a gift for everyone?',
    choices: [
      { t: '🎁 Yes! Gifts for all', fx: { cash: -0.2, team: 10, say: 'Everyone loves their gift! 🎄' } },
      { t: '🎄 Just the swap', fx: { team: 4, say: '{company} has the best holiday vibes. ✨' } }
    ] });

  // =====================================================================
  // 🏪 BUSINESS
  // =====================================================================

  ev({ id: 'flood', cat: 'business', icon: '🌊', w: 1.5, cd: 20,
    title: 'The shop is flooding!',
    text: 'A pipe broke in the night. There is water EVERYWHERE! 💦',
    choices: [
      { t: '🚨 Emergency plumber', fx: { cash: -0.7, say: 'Fixed by morning! 🔧' } },
      { t: '🩹 Cheap quick fix', fx: { cash: -0.25, next: ['flood_again', 3, 8, 0.45], say: 'The leak stopped. For now...' } },
      { t: '🔒 Close a week and fix it right', fx: { cash: -0.3, closed: [1, 'Closed for repairs'], say: 'You are closed next week.' } }
    ] });
  ev({ id: 'flood_again', cat: 'business', icon: '🌊', chainOnly: true, fx: { cash: -1, demand: [0.8, 1, 'Flood damage'], say: 'The cheap fix broke! Even MORE water! 🌊🌊' } });

  ev({ id: 'power_outage', cat: 'business', icon: '🔌', w: 2,
    title: 'The power went out!',
    text: 'The whole street is dark. 🌑 No lights, no machines.',
    choices: [
      { t: '⚡ Rent a generator', fx: { cash: -0.12, say: 'You are the only shop with lights! 💡' } },
      { t: '🏠 Send everyone home', fx: { demand: [0.85, 1, 'Power outage'], team: 3, say: 'Fewer sales. Staff enjoyed the free time!' } }
    ] });

  ev({ id: 'equipment_fail', cat: 'business', icon: '🛠️', w: 2.5,
    title: 'A machine broke!',
    text: 'Your most important machine stopped working. 😩',
    choices: [
      { t: '🔧 Repair it', fx: { cash: -0.2, say: 'Good as new!' } },
      { t: '✨ Buy a better one', d: 'Work faster forever', fx: { cash: -1.2, equip: 0.04, say: 'New machine! Everyone works faster! 🚀' } },
      { t: '🐢 Work without it', fx: { capacity: [0.85, 2, 'Broken machine'], say: 'Slow weeks ahead...' } }
    ] });

  ev({ id: 'break_in', cat: 'business', icon: '🚨', w: 1.5, minWeek: 5, cond: noCams, init: amt(0.4), start: { cash: -0.4 },
    title: 'Someone broke in!',
    text: 'A thief broke in at night and took {amt} of stuff! 😱',
    choices: [
      { t: '🚨 Buy an alarm', fx: { cash: -0.3, say: 'Nobody will get in again! 🔒' } },
      { t: '📄 Ask insurance to pay', fx: { chance: { p: 0.6, win: { cash: 0.28, say: 'Insurance paid you back! 🙌' }, lose: { say: 'Insurance said no. Tiny print. 😑' } } } }
    ] });

  ev({ id: 'damaged_shipment', cat: 'business', icon: '📦', w: 2.5, init: amt(0.18),
    title: 'A delivery arrived smashed!',
    text: 'Half of this week\'s supplies are squished. 📦💥 They cost {amt}.',
    choices: [
      { t: '📞 Ask for a refund', fx: { chance: { p: 0.6, win: { say: 'The supplier said sorry and paid you back! 👍' }, lose: { cash: -0.18, say: 'They blamed the truck driver. You pay.' } } } },
      { t: '🤷 Accept it', fx: { cash: -0.18, say: 'Oh well.' } }
    ] });

  ev({ id: 'supplier_prices', cat: 'business', icon: '🚚', kind: 'chat', w: 2, from: { name: 'Sam from Supplies', face: '🚚' },
    title: 'Your supplier has news',
    msgs: ['hello! 👋', 'bad news...', 'our prices go up 5% starting today 😬'],
    choices: [
      { t: '👌 "Okay, fine"', fx: { supply: [0.02, 12, 'Higher supply prices'], say: 'You make a bit less on each sale for a while.' } },
      { t: '🔄 Find a new supplier', fx: { chance: { p: 0.6, win: { supply: [-0.015, 12, 'Cheaper supplier'], say: 'The new one is CHEAPER! 🎉' }, lose: { supply: [0.01, 6, 'New supplier'], rep: -2, say: 'The new one is worse. Customers noticed. 😕' } } } },
      { t: '🤝 "Let\'s negotiate"', fx: { chance: { p: 0.5, win: { say: 'Sam agrees to keep the old price! 🤝' }, lose: { supply: [0.03, 8, 'Angry supplier'], say: 'Sam got annoyed and raised prices MORE. 😤' } } } }
    ] });

  ev({ id: 'inspection', cat: 'business', icon: '📋', w: 2, cd: 15,
    title: 'Surprise inspection!',
    text: 'A city inspector walks in with a clipboard. 📋 They want to check everything.',
    choices: [
      { t: '✅ Show them everything', fx: { chance: { p: function (g) { return g.reputation / 200 + (g.employees.some(function (e) { return e.role === 'mgr'; }) ? 0.3 : 0.15) + 0.15; }, win: { rep: 3, say: 'You passed! Perfect score! 💯' }, lose: { cash: -0.4, say: 'They found a few problems. You pay a fine. 😬' } } } },
      { t: '💰 Offer them a "gift"', d: 'Very risky!', fx: { cash: -0.2, next: ['bribe_scandal', 2, 6, 0.4], say: 'They took it and left... Was that a good idea? 😰' } },
      { t: '🙏 "Can you come back later?"', fx: { rep: -1, next: ['inspection', 2, 4], say: 'They will be back. And they will look harder.' } }
    ] });

  ev({ id: 'bribe_scandal', cat: 'trouble', icon: '📰', kind: 'news', chainOnly: true,
    title: 'SCANDAL: {company} bribed an inspector!',
    text: 'A reporter found out about the "gift". It\'s on the front page! 😱',
    choices: [
      { t: '🙇 Say sorry + pay the fine', fx: { cash: -2, rep: -12, say: 'It hurts. But people forgive you slowly.' } },
      { t: '🤥 Deny everything', fx: { chance: { p: 0.4, win: { rep: -5, say: 'No proof. The story fades.' }, lose: { rep: -25, cash: -3, demand: [0.75, 6, 'Boycott'], say: 'Then they showed the video. Customers are boycotting you! 😭' } } } }
    ] });

  ev({ id: 'repairs', cat: 'business', icon: '🏚️', w: 1.5, cd: 12,
    title: 'The building is falling apart',
    text: 'The roof leaks, the door squeaks, and two letters fell off your sign. 🏚️',
    choices: [
      { t: '✨ Fix everything', fx: { cash: -0.8, rep: 3, team: 4, say: 'It looks brand new! ✨' } },
      { t: '🩹 Fix the worst stuff', fx: { cash: -0.15, say: 'Good enough.' } },
      { t: '⏳ Later', fx: { rep: -2, next: ['repairs', 4, 8], say: 'It won\'t fix itself...' } }
    ] });

  ev({ id: 'late_delivery', cat: 'business', icon: '🐢', w: 2.5,
    title: 'Your delivery is late',
    text: 'The supplies you need are stuck in traffic somewhere. 🚛🚗🚙',
    choices: [
      { t: '⚡ Pay for super-fast shipping', fx: { cash: -0.15, say: 'It arrives just in time! 😅' } },
      { t: '⏳ Wait for it', fx: { capacity: [0.8, 1, 'Missing supplies'], say: 'You run out of stuff for a few days.' } }
    ] });

  ev({ id: 'systems_down', cat: 'business', icon: '🖥️', w: 1.5,
    title: 'The computers crashed!',
    text: 'The card machine, the orders, the schedule... all DOWN! 💻💀',
    choices: [
      { t: '🧑‍💻 Call IT experts', fx: { cash: -0.25, say: 'Fixed in 2 hours! 🛠️' } },
      { t: '📝 Use pen and paper', fx: { capacity: [0.85, 1, 'Computers down'], team: -2, say: 'Chaotic, but you survive the week.' } }
    ] });

  ev({ id: 'big_contract', cat: 'lucky', icon: '🤝', w: 1.5, cd: 14, minWeek: 5, init: function (g, c) { c.weeks = 6; c.amt = U.nice(G.scale(g) * 0.25); },
    title: 'A big client wants a deal!',
    text: 'A big company wants to buy from you for {weeks} weeks. They pay {amt} extra every week! It will keep your team busy.',
    choices: [
      { t: '✍️ Sign it!', fx: { extra: [0.25, 6, 'Big client deal'], team: -5, say: 'Deal signed! Money starts next week. 💰' } },
      { t: '💪 Ask for 30% more', fx: { chance: { p: 0.5, win: { extra: [0.33, 6, 'Big client deal'], team: -5, say: 'They said YES to more money! 🤑' }, lose: { say: 'They walked away. Too greedy! 😅' } } } },
      { t: '🙅 No thanks', fx: { say: 'You stay focused on your normal customers.' } }
    ] });

  ev({ id: 'tax_refund', cat: 'lucky', icon: '🧾', w: 1.5, cd: 26, fx: { cash: 0.3, say: 'Surprise! The tax office sent you money back. 💸' } });

  ev({ id: 'award', cat: 'lucky', icon: '🏆', w: function (g) { return g.reputation > 70 ? 2 : 0; }, cd: 26,
    fx: { rep: 4, fans: 10, say: 'You won "Best {industry} in {city}"! 🏆' } });

  ev({ id: 'heatwave', cat: 'business', icon: '🥵', w: 3, cd: 20, cond: season(24, 34),
    title: 'HEATWAVE! 🥵',
    text: 'It\'s super hot outside and your air conditioner just broke. Everyone is melting! 🫠',
    choices: [
      { t: '❄️ Buy a new AC', fx: { cash: -0.35, say: 'Ahhh, cool air! Customers come in to chill. 😎' } },
      { t: '🍦 Give out free ice pops', fx: { cash: -0.08, fans: 8, happy: 4, say: 'Everyone loves the free ice pops! 🍦' } },
      { t: '🫠 Just sweat it out', fx: { happy: -5, team: -5, say: 'Sweaty customers. Sweaty staff. Not great. 💦' } }
    ] });

  ev({ id: 'snowstorm', cat: 'business', icon: '❄️', w: 3, cd: 20, cond: function (g) { var w = ((g.week - 1) % 52) + 1; return w <= 8 || w >= 49; },
    title: 'Giant snowstorm!',
    text: 'There is SO much snow. ☃️ The roads are closed.',
    choices: [
      { t: '🔒 Close for a week', fx: { closed: [1, 'Snowstorm'], team: 4, say: 'Snow day for everyone! ⛄' } },
      { t: '💪 Stay open!', fx: { chance: { p: 0.5, win: { fans: 12, rep: 2, say: 'Brave customers loved that you were open! ❤️' }, lose: { capacity: [0.6, 1, 'Staff snowed in'], say: 'Half the staff couldn\'t get there. ❄️' } } } }
    ] });

  ev({ id: 'road_works', cat: 'business', icon: '🚧', w: 2, cd: 20,
    title: 'Road work outside!',
    text: 'The city is fixing the road in front of your shop for 3 weeks. It\'s loud and hard to get in. 🚧',
    choices: [
      { t: '😂 Put up a funny sign', fx: { demand: [0.95, 3, 'Road work'], fans: 8, say: '"We\'re still open! Bring earplugs 🎧" People love it.' } },
      { t: '📞 Complain to the city', fx: { chance: { p: 0.4, win: { say: 'They finish super fast! 🏎️' }, lose: { demand: [0.85, 3, 'Road work'], say: 'Nobody listened. 😑' } } } },
      { t: '🤷 Deal with it', fx: { demand: [0.85, 3, 'Road work'], say: 'Fewer customers for a while.' } }
    ] });

  ev({ id: 'mouse', cat: 'business', icon: '🐭', w: 2,
    title: 'A MOUSE! 🐭',
    text: 'A customer screamed. A little mouse ran across the floor!',
    choices: [
      { t: '🧑‍🔬 Call pest control', fx: { cash: -0.12, say: 'The mouse moved out. Bye mouse! 👋' } },
      { t: '🐈 Adopt a shop cat', fx: { cash: -0.05, fans: 12, happy: 3, say: 'Meet Whiskers, the new shop cat! Customers LOVE her. 🐈' } },
      { t: '🙈 Pretend it didn\'t happen', fx: { chance: { p: 0.5, win: { say: 'Nobody posted about it. Lucky!' }, lose: { rep: -8, say: 'Someone posted a video. "MOUSE AT {company}!" 😱' } } } }
    ] });

  ev({ id: 'rent_up', cat: 'business', icon: '🏠', kind: 'chat', w: 1, cd: 40, minWeek: 20, from: { name: 'Your Landlord', face: '🧓' },
    title: 'The landlord wants more rent',
    msgs: ['hello tenant 🧓', 'rent is going up 10%', 'starting next week'],
    choices: [
      { t: '😩 "Okay..."', fx: { rent: 0.1, say: 'Rent is higher now.' } },
      { t: '🤝 "Can we meet in the middle?"', fx: { chance: { p: 0.5, win: { rent: 0.05, say: 'Deal at +5%. 🤝' }, lose: { rent: 0.1, say: 'The landlord said no.' } } } },
      { t: '📦 "Then I\'ll move out!"', fx: { chance: { p: 0.4, win: { say: 'The landlord panics. Rent stays the same! 😎' }, lose: { rent: 0.15, say: 'The landlord called your bluff. +15%! 😱' } } } }
    ] });

  ev({ id: 'found_money', cat: 'lucky', icon: '💵', w: 1.5, cd: 20, fx: { cash: 0.12, say: 'Someone found cash stuck behind the counter! 💵' } });

  ev({ id: 'charity', cat: 'business', icon: '🏫', w: 2, cd: 12,
    title: 'A school needs help',
    text: 'The local school asks for money for new books. 📚',
    choices: [
      { t: '❤️ Donate', fx: { cash: -0.25, rep: 5, fans: 8, say: 'The kids made you a giant thank-you card! 💌' } },
      { t: '📦 Donate some {unit} instead', fx: { cash: -0.1, rep: 3, say: 'They loved it! 😊' } },
      { t: '🙅 Not this time', fx: { rep: -1, say: 'Maybe next time.' } }
    ] });

  ev({ id: 'festival', cat: 'lucky', icon: '🎪', w: 2, cd: 15,
    title: 'City festival this weekend!',
    text: 'Thousands of people are coming to the {city} festival! 🎪🎡',
    choices: [
      { t: '⛺ Set up a stand', fx: { cash: -0.3, extra: [0.35, 1, 'Festival stand'], fans: 15, say: 'Your stand was packed! 🎉' } },
      { t: '🎈 Hand out balloons', fx: { cash: -0.05, fans: 8, say: 'Kids everywhere have your balloons! 🎈' } },
      { t: '😴 Skip it', fx: { say: 'You rest this weekend.' } }
    ] });

  ev({ id: 'holiday_rush', cat: 'business', icon: '🎄', w: 5, cd: 40, cond: season(47, 52),
    title: 'HOLIDAY RUSH! 🎄',
    text: 'It\'s the holidays! Tons of shoppers are coming. Are you ready?',
    choices: [
      { t: '👷 Hire extra helpers', fx: { cash: -0.4, demand: [1.3, 2, 'Holiday rush'], capacity: [1.25, 2, 'Holiday helpers'], say: 'You\'re ready for the crowds! 🛍️' } },
      { t: '🎅 Just decorate', fx: { cash: -0.05, demand: [1.3, 2, 'Holiday rush'], happy: 3, say: 'It looks so cozy! 🎄' } }
    ] });

  ev({ id: 'back_to_school', cat: 'world', icon: '🎒', w: 3, cd: 40, cond: season(33, 36), fx: { demand: [1.1, 2, 'Back to school'], say: 'Back to school week! More customers than usual. 🎒' } });

  ev({ id: 'too_expensive', cat: 'customers', icon: '💸', w: function (g) { return g.price === 2 ? 3 : 0; },
    title: 'Customers say you\'re too pricey',
    text: 'People are complaining your prices are too high. 💸',
    choices: [
      { t: '⬇️ Lower prices', fx: { price: -1, happy: 5, say: 'Prices are normal now. Customers are happier.' } },
      { t: '💎 "We\'re worth it!"', fx: { happy: -4, say: 'Some customers leave. Others stay.' } }
    ] });

  ev({ id: 'long_line', cat: 'customers', icon: '🚶', w: 4, cond: busy,
    title: 'The line goes out the door!',
    text: 'So many customers are waiting! 🚶🚶🚶🚶 Some are getting grumpy.',
    choices: [
      { t: '👷 Hire a temp worker', fx: { cash: -0.12, capacity: [1.2, 1, 'Temp worker'], say: 'The line moves faster! 🏃' } },
      { t: '🍪 Free snacks for waiting people', fx: { cash: -0.05, happy: 6, say: 'Nobody minds waiting now! 🍪' } },
      { t: '🤷 Do nothing', fx: { happy: -4, say: 'Some people give up and leave. 😒' } }
    ] });

  ev({ id: 'lost_wallet', cat: 'customers', icon: '💼', w: 1.5, cd: 25, init: amt(1),
    title: 'A bag full of money!',
    text: 'A customer left a bag behind. Inside: {amt} in cash! 😳',
    choices: [
      { t: '😇 Give it back', fx: { rep: 6, chance: { p: 0.5, win: { cash: 0.2, say: 'The owner cried with joy and gave you a reward! 🥹' }, lose: { say: 'The owner said thank you! You feel great. 😇' } } } },
      { t: '😈 Keep it', fx: { cash: 1, chance: { p: 0.5, win: { say: 'Nobody ever came back for it... 👀' }, lose: { rep: -15, say: 'The camera caught you. EVERYONE knows. 😱' } } } }
    ] });

  ev({ id: 'tax_audit', cat: 'trouble', icon: '🧾', w: 0.8, minWeek: 15, cd: 40,
    title: 'Tax check!',
    text: 'The tax office wants to check all your money records. 🧾🔍',
    choices: [
      { t: '🧮 Pay an expert to help', fx: { cash: -0.4, say: 'Everything was perfect! ✅' } },
      { t: '💪 Do it yourself', fx: { chance: { p: function (g) { return g.employees.some(function (e) { return e.role === 'acct'; }) ? 0.85 : 0.5; }, win: { say: 'You passed! 📊' }, lose: { cash: -1, say: 'You made mistakes. Big fine! 😖' } } } }
    ] });

  // =====================================================================
  // 🛍️ CUSTOMERS
  // =====================================================================

  var REVIEWERS = ['Karen B.', 'Mike T.', 'Sofia L.', 'Grandpa Joe', 'Jenny K.', 'Tom W.', 'Lily P.', 'Carlos M.', 'Anna S.', 'Big Dave'];
  function reviewer(g, c) { c.who2 = U.pick(REVIEWERS); }

  ev({ id: 'review_5', cat: 'customers', icon: '⭐', kind: 'review', w: function (g) { return g.satisfaction > 60 ? 4 : 1; }, stars: 5, init: reviewer,
    title: 'New 5-star review!',
    text: 'BEST {industry} in {city}!!! The staff are amazing. I come here every day! 😍😍',
    choices: [
      { t: '💖 Reply "Thank you!!"', fx: { fans: 5, say: 'They liked your reply! 💕' } },
      { t: '🎁 Send them a free gift', fx: { cash: -0.03, rep: 2, fans: 8, say: 'They posted a photo of your gift! 📸' } },
      { t: '👀 Just enjoy it', fx: { say: 'Nice. 😊' } }
    ] });

  ev({ id: 'review_1', cat: 'customers', icon: '😡', kind: 'review', w: function (g) { return g.satisfaction < 50 ? 4 : 1.2; }, stars: 1, init: reviewer,
    title: 'Ouch! 1-star review',
    text: 'I waited FOREVER and nobody said hi. Never coming back. 😡👎',
    choices: [
      { t: '🙏 Say sorry nicely', fx: { rep: 2, say: 'Other people see your kind reply. 👍' } },
      { t: '🎟️ Offer a free visit', fx: { cash: -0.02, rep: 3, chance: { p: 0.5, win: { say: 'They came back and changed it to 5 stars! ⭐⭐⭐⭐⭐' }, lose: { say: 'They never replied.' } } } },
      { t: '😤 Argue with them', fx: { chance: { p: 0.3, win: { fans: 10, say: 'Your funny reply went a little viral! 😂' }, lose: { rep: -6, say: 'People think you\'re rude. 😬' } } } }
    ] });

  ev({ id: 'review_weird', cat: 'customers', icon: '🤔', kind: 'review', w: 2, stars: 3, init: reviewer,
    title: 'A strange review',
    text: 'Pretty good. But the chair I sat on made a fart noise every time I moved. 3 stars. 🪑💨',
    choices: [
      { t: '🪑 Fix the chair', fx: { cash: -0.02, happy: 2, say: 'No more fart chair. 😌' } },
      { t: '😂 Make it famous', fx: { fans: 14, say: 'People come JUST to sit in the fart chair! 😂🪑' } }
    ] });

  ev({ id: 'review_kid', cat: 'customers', icon: '🧒', kind: 'review', w: 1.5, stars: 5, init: function (g, c) { c.who2 = 'Timmy (age 8)'; },
    title: 'A review from a kid',
    text: 'I LOVE THIS PLACE. the lady gave me a sticker. 10/10 would come again. my mom says i have to stop typing now',
    choices: [
      { t: '🌟 Send Timmy a surprise', fx: { cash: -0.02, fans: 15, rep: 3, say: 'Timmy\'s mom posted his happy face online. Everyone melted! 🥹' } },
      { t: '💖 Reply with a heart', fx: { fans: 4, say: 'Timmy is very proud. 😊' } }
    ] });

  ev({ id: 'vip', cat: 'customers', icon: '🕶️', w: 1.2, cd: 20, rarity: 'rare',
    init: function (g, c) { c.celeb = U.pick(['a famous singer', 'a pro soccer player', 'a movie star', 'a famous YouTuber', 'a TV chef']); },
    title: 'A celebrity walked in!',
    text: 'Wait... is that {celeb}?! 😱 Everyone is staring.',
    choices: [
      { t: '👑 Give them VIP treatment', fx: { cash: -0.1, chance: { p: 0.6, win: { viral: [1, 4], rep: 4, say: 'They posted about you! 🌟' }, lose: { rep: 1, say: 'They said thanks and left. Still cool! 😎' } } } },
      { t: '📸 Ask for a selfie', fx: { chance: { p: 0.5, win: { fans: 20, say: 'Selfie on the wall! 🤳' }, lose: { rep: -2, say: 'They didn\'t like that. Awkward. 😬' } } } },
      { t: '😌 Treat them like anyone else', fx: { rep: 2, say: 'They liked being treated normally. Classy! ✨' } }
    ] });

  ev({ id: 'kid_customer', cat: 'customers', icon: '🧸', w: 1.5, cd: 20,
    title: 'A little customer',
    text: 'A tiny kid wants to buy something. They only have $1.50 and a toy car. 🚗',
    choices: [
      { t: '🥰 "That\'s enough!"', fx: { rep: 4, chance: { p: 0.3, win: { viral: [0.5, 3], say: 'Their dad filmed it. The internet is crying happy tears! 🥹' }, lose: { say: 'The kid is SO happy! 😊' } } } },
      { t: '🙅 "Sorry, not enough"', fx: { rep: -3, say: 'The kid walks away sadly. 😢' } }
    ] });

  ev({ id: 'regulars', cat: 'customers', icon: '🤗', w: 2, fx: { demand: [1.06, 2, 'Friends of regulars'], say: 'Your favorite regular customer brought 5 friends! 👯👯' } });

  ev({ id: 'special_order', cat: 'customers', icon: '🦖', w: 2,
    title: 'A super special order',
    text: 'A customer wants something very special. "Can you make it purple and shaped like a dinosaur?" 🦖💜',
    choices: [
      { t: '🦖 "Challenge accepted!"', fx: { cash: -0.04, happy: 4, fans: 6, say: 'They LOVED it! They told everyone. 💜' } },
      { t: '🙅 "Sorry, we can\'t"', fx: { say: 'They go somewhere else.' } }
    ] });

  ev({ id: 'lost_kid', cat: 'customers', icon: '😢', w: 1.2, cd: 30,
    title: 'A lost kid',
    text: 'A little kid is crying. They can\'t find their parents! 😢',
    choices: [
      { t: '🔍 Help find the parents', fx: { rep: 3, team: 3, say: 'Found them! Big happy hug. 🤗' } },
      { t: '👮 Call the police', fx: { rep: 1, say: 'The police helped. All good.' } }
    ] });

  ev({ id: 'proposal', cat: 'customers', icon: '💍', w: 1, cd: 30, rarity: 'rare',
    title: 'A marriage proposal!',
    text: 'A customer wants to propose to their partner in YOUR shop. 💍 They need your help!',
    choices: [
      { t: '🌹 Go all out!', fx: { cash: -0.08, chance: { p: 0.8, win: { viral: [0.5, 3], rep: 3, say: 'They said YES! 💍 The video is everywhere!' }, lose: { say: 'They said... "let me think about it." Oof. 😬' } } } },
      { t: '🎶 Just play a love song', fx: { fans: 5, say: 'So romantic! 🎶' } }
    ] });

  ev({ id: 'influencer_freebie', cat: 'customers', icon: '🤳', w: 1.5, cd: 15,
    title: 'An influencer wants free stuff',
    text: '"I have 200K followers. Give me free stuff and I\'ll post about you!" 💅',
    choices: [
      { t: '🎁 Okay, here you go', fx: { cash: -0.1, chance: { p: 0.6, win: { fans: 30, say: 'They posted! New followers everywhere! 📈' }, lose: { say: 'They never posted. Hmm. 🤨' } } } },
      { t: '🙅 "Please pay like everyone"', fx: { chance: { p: 0.5, win: { rep: 2, say: 'Other customers respect that! 💪' }, lose: { rep: -4, say: 'They posted a mean video about you. 🙄' } } } }
    ] });

  ev({ id: 'grumpy_grandpa', cat: 'customers', icon: '👴', kind: 'chat', w: 1.5, from: { name: 'Grandpa Joe', face: '👴' },
    title: 'Grandpa Joe has a complaint',
    msgs: ['HELLO', 'THE MUSIC IS TOO LOUD', 'IN MY DAY WE HAD QUIET SHOPS'],
    choices: [
      { t: '🔉 Turn it down', fx: { happy: 2, say: 'Grandpa Joe gives you a thumbs up. 👍' } },
      { t: '🎸 Play his favorite oldies', fx: { happy: 4, fans: 4, say: 'Grandpa Joe is DANCING. 🕺' } },
      { t: '🔊 Keep it loud', fx: { happy: -2, say: 'Grandpa Joe leaves. Grumpy. 😤' } }
    ] });

  ev({ id: 'hair_in_food', cat: 'customers', icon: '🤢', w: 2, cond: FOOD,
    title: 'Hair in the food! 🤢',
    text: 'A customer found a hair in their food. They are VERY upset.',
    choices: [
      { t: '🙏 Free meal + big sorry', fx: { cash: -0.03, rep: 1, say: 'They forgive you. 😌' } },
      { t: '🧢 Hairnets for everyone!', fx: { cash: -0.05, team: -2, happy: 2, say: 'The team looks silly. But no more hair! 😂' } },
      { t: '🤷 "Not ours!"', fx: { rep: -5, say: 'They left a 1-star review. 😬' } }
    ] });

  ev({ id: 'food_critic', cat: 'customers', icon: '🧐', w: 1.2, cond: FOOD, cd: 30, rarity: 'rare',
    title: 'A food critic is here!',
    text: 'A famous food critic is secretly eating here. 🧐 Your staff noticed!',
    choices: [
      { t: '👨‍🍳 Make everything perfect', fx: { cash: -0.1, chance: { p: function (g) { return g.satisfaction / 100 + 0.1; }, win: { rep: 8, fans: 25, say: '"A hidden gem!" ⭐⭐⭐⭐⭐ Critics love you!' }, lose: { rep: -4, say: '"It was... fine." Ouch. 😐' } } } },
      { t: '😎 Act normal', fx: { chance: { p: function (g) { return g.satisfaction / 100; }, win: { rep: 6, say: 'They loved the normal you! ⭐⭐⭐⭐' }, lose: { rep: -3, say: 'Not their favorite. 😕' } } } }
    ] });

  ev({ id: 'streamer', cat: 'customers', icon: '🎮', w: 2, cond: TECH, cd: 20, rarity: 'rare',
    title: 'A big streamer is using your stuff!',
    text: 'A famous streamer is using your product live in front of 50,000 people! 🎮',
    choices: [
      { t: '💬 Send them a message', fx: { chance: { p: 0.5, win: { viral: [1, 4], say: 'They shouted you out LIVE! 🎉' }, lose: { fans: 10, say: 'They didn\'t see it, but lots of viewers did.' } } } },
      { t: '🎁 Send free stuff for the fans', fx: { cash: -0.2, fans: 30, say: 'Viewers go crazy for the giveaway! 🎁' } }
    ] });

  ev({ id: 'bug_found', cat: 'business', icon: '🐛', w: 2, cond: TECH,
    title: 'A big bug was found!',
    text: 'Users found a bug. When you press a button, everything turns upside down. 🙃',
    choices: [
      { t: '🧑‍💻 Fix it now', fx: { cash: -0.15, say: 'Fixed! 🔧' } },
      { t: '😂 Call it a "feature"', fx: { chance: { p: 0.4, win: { fans: 20, say: 'People LOVE the upside-down mode! 🙃' }, lose: { rep: -5, say: 'People did not find it funny. 😑' } } } }
    ] });

  // =====================================================================
  // 📱 SOCIAL MEDIA
  // =====================================================================

  ev({ id: 'video_posted', cat: 'social', icon: '🎥', w: 2.5,
    title: 'Someone filmed your shop!',
    text: 'A customer posted a video of your {fronts} at work. People are watching it! 👀',
    choices: [
      { t: '🔁 Share it on your page', fx: { chance: { p: function (g) { return g.satisfaction > 55 ? 0.8 : 0.4; }, win: { fans: 12, chance: { p: 0.2, win: { viral: [1, 4], say: 'IT WENT VIRAL! 🔥' }, lose: { say: 'Nice boost! 📈' } } }, lose: { rep: -3, say: 'The comments are full of complaints. 😬' } } } },
      { t: '🤐 Leave it', fx: { fans: 4, say: 'It gets a few thousand views.' } }
    ] });

  ev({ id: 'employee_famous', cat: 'social', icon: '🤳', w: 1.5, cd: 20, who: { a: 'funny' }, rarity: 'rare',
    title: '{a} is famous online!',
    text: 'A video of {a} being hilarious has MILLIONS of views! People come just to meet {a}. 🤩',
    choices: [
      { t: '⭐ Make {a} your mascot', fx: { fans: 30, a: 15, viral: [1, 4], next: ['famous_raise', 3, 6], say: 'Everyone loves {a}! 🎉' } },
      { t: '🤫 Keep it low-key', fx: { fans: 10, a: -10, say: '{a} is a little disappointed.' } }
    ] });

  ev({ id: 'famous_raise', cat: 'team', icon: '💅', kind: 'chat', chainOnly: true, from: 'a',
    title: 'Famous {a} wants more',
    msgs: ['so... I\'m kind of famous now 💅', 'another company offered me DOUBLE', 'what do you say?'],
    choices: [
      { t: '💰 "Double it is!"', fx: { raise: ['a', 1], a: 20, fans: 10, say: 'Your star stays! 🌟' } },
      { t: '🤏 "+25%?"', fx: { chance: { p: 0.5, win: { raise: ['a', 0.25], say: '{a} accepts. Phew! 😅' }, lose: { quit: 'a', fans: -10, say: '{a} left. Some fans followed them. 😢' } } } },
      { t: '❌ "No"', fx: { quit: 'a', fans: -15, say: '{a} left and made a video about it. Ouch. 🎥' } }
    ] });

  ev({ id: 'complaint_viral', cat: 'social', icon: '😡', w: function (g) { return g.satisfaction < 50 ? 3 : 0.8; }, cd: 10,
    title: 'A complaint is going viral!',
    text: 'An angry customer\'s post about you has been shared 10,000 times! 😱',
    choices: [
      { t: '🙇 Say sorry publicly', fx: { rep: -2, say: 'People respect it. Mostly. 🙂' } },
      { t: '🎁 Make it right for them', fx: { cash: -0.1, rep: 1, say: 'They updated the post: "They fixed it! ❤️"' } },
      { t: '🤥 "They\'re lying!"', fx: { chance: { p: 0.4, win: { rep: 1, say: 'Their story fell apart! People are on your side.' }, lose: { rep: -10, viral: [0.5, 2], say: 'Big mistake. It got MUCH bigger. 😱' } } } }
    ] });

  ev({ id: 'meme', cat: 'social', icon: '🐸', w: 1.5, cd: 15,
    title: 'You became a meme! 🐸',
    text: 'Someone made a meme about {company}. It\'s actually really funny. 😂',
    choices: [
      { t: '😂 Join the joke', fx: { chance: { p: 0.7, win: { fans: 20, viral: [0.5, 3], say: 'Your reply got more likes than the meme! 🔥' }, lose: { rep: -3, say: 'Your reply was cringe. 😬' } } } },
      { t: '🚫 Ask them to delete it', fx: { rep: -3, fans: 10, say: 'Now EVERYONE is sharing it. Oops. 🙈' } },
      { t: '🙈 Ignore it', fx: { fans: 5, say: 'It fades after a few days.' } }
    ] });

  ev({ id: 'influencer', cat: 'social', icon: '✨', w: 2, fx: { fans: 15, rep: 2, say: 'An influencer with 800K followers said they LOVE {company}! ✨' } });

  ev({ id: 'embarrassing_post', cat: 'social', icon: '🙈', w: 1.5, cd: 15, who: { a: 'any' },
    title: 'Oops! Wrong account!',
    text: '{a} posted a silly selfie on the COMPANY account by mistake. 🤳😳',
    choices: [
      { t: '🗑️ Delete it fast', fx: { rep: -1, say: 'Only a few people saw it.' } },
      { t: '😂 Post another silly selfie', fx: { chance: { p: 0.55, win: { fans: 20, say: 'Everyone loved it! Selfie war! 🤳🤳' }, lose: { rep: -4, say: 'It didn\'t work. 😅' } } } },
      { t: '🚪 Fire {a}', fx: { fire: 'a', say: 'Harsh... but the account is safe.' } }
    ] });

  ev({ id: 'rumor_company', cat: 'social', icon: '🧢', w: 1.5, cd: 15, init: rival,
    title: 'A fake rumor!',
    text: 'People online say {company} is closing forever. It\'s NOT true! 🧢',
    choices: [
      { t: '📢 Post the truth', fx: { rep: 1, say: 'Rumor busted! ✅' } },
      { t: '🔍 Find who started it', fx: { cash: -0.3, chance: { p: 0.5, win: { rep: 5, say: 'It was {rival}! Now everyone is on YOUR side. 😤' }, lose: { say: 'You couldn\'t find out. 🤷' } } } },
      { t: '🙈 Ignore it', fx: { demand: [0.92, 3, 'Fake rumor'], say: 'Some people believe it. 😕' } }
    ] });

  ev({ id: 'celebrity_mention', cat: 'social', icon: '📺', w: 0.8, cd: 40, rarity: 'epic',
    fx: { fans: 50, rep: 3, viral: [3, 10], say: 'A celebrity talked about {company} on TV! The whole country knows you now! 📺🌟' } });

  ev({ id: 'hacked', cat: 'social', icon: '🔓', w: 1, cd: 30,
    title: 'Your account got hacked!',
    text: 'Someone hacked your social media and is posting cat pictures. 🐱🐱🐱',
    choices: [
      { t: '🔐 Reset the password', fx: { fans: -5, say: 'Got it back! Some followers left.' } },
      { t: '🐱 Keep the cat pics', fx: { chance: { p: 0.5, win: { fans: 15, say: 'Honestly? The cats got more likes. 😹' }, lose: { rep: -3, say: 'People are confused. 🤔' } } } }
    ] });

  ev({ id: 'fan_art', cat: 'social', icon: '🎨', w: 1.5, fx: { fans: 8, team: 3, say: 'A fan drew your logo as a superhero! 🦸 It\'s now on the wall.' } });

  ev({ id: 'livestream', cat: 'social', icon: '🔴', w: 1.5, cd: 15,
    title: 'Go live?',
    text: 'Your team wants to livestream a normal work day. 🔴',
    choices: [
      { t: '🔴 Go live!', fx: { chance: { p: 0.45, win: { viral: [0.5, 3], say: 'Something hilarious happened on stream! 😂' }, lose: { fans: 3, say: 'It was a bit boring. 12 viewers. 😅' } } } },
      { t: '🙅 Nah', fx: { say: 'Maybe another day.' } }
    ] });

  ev({ id: 'collab', cat: 'social', icon: '🤝', w: 1.2, cd: 20,
    init: function (g, c) { c.brand = U.pick(['a sneaker brand', 'a famous candy company', 'a video game', 'a cartoon show', 'a popular band']); },
    title: 'Collab offer! 🤝',
    text: '{brand} wants to do a special collab with {company}!',
    choices: [
      { t: '✅ Let\'s do it!', fx: { cash: -0.4, fans: 25, demand: [1.12, 4, 'Collab hype'], say: 'The collab is a HIT! 🔥' } },
      { t: '🙅 Not our style', fx: { say: 'You pass.' } }
    ] });

  ev({ id: 'hashtag', cat: 'social', icon: '#️⃣', w: 1, cd: 25, rarity: 'rare',
    fx: { chance: { p: 0.6, win: { fans: 20, say: '#{company}Challenge is trending! People are doing silly dances outside your shop. 💃' }, lose: { fans: 5, say: 'Someone started #{company}Challenge. 3 people did it. 😅' } } } });

  ev({ id: 'post_time', cat: 'social', icon: '📱', kind: 'post', w: 2.5, cd: 6,
    title: 'Your followers want a post!',
    text: 'Your fans are asking for new content! Pick what to post: 📱' });

  // =====================================================================
  // 👔 BOSS STUFF
  // =====================================================================

  ev({ id: 'manager_raise', cat: 'boss', icon: '👔', kind: 'chat', w: 1.5, who: { m: 'mgr' }, from: 'm',
    title: 'Manager {m} wants a raise',
    msgs: ['boss, I run this place 😤', 'I deserve to be paid like it', 'raise please?'],
    choices: [
      { t: '💵 "+12%, you earned it"', fx: { raise: ['m', 0.12], say: '{m} is fired up! 🔥' } },
      { t: '🎁 "Here\'s a bonus instead"', fx: { bonus: 'm', say: 'Not what they asked, but it helps.' } },
      { t: '❌ "No"', fx: { m: -20, say: '{m} is clearly unhappy. 😒' } }
    ] });

  ev({ id: 'fraud_found', cat: 'boss', icon: '🧮', w: 1, minWeek: 15, cd: 30, rarity: 'rare', cond: hasRole('acct'), who: { a: 'acct', b: 'greedy' }, init: amt(1.5),
    title: 'Your accountant found stealing!',
    text: '{a} found fake bills. {b} has been secretly taking money! Total: {amt}. 😱',
    choices: [
      { t: '👮 Fire {b} + call police', fx: { fire: 'b', chance: { p: 0.5, win: { cash: 0.9, say: 'The court made them pay you back! 💰' }, lose: { say: 'The money is gone forever. 😩' } } } },
      { t: '🚪 Just fire {b}', fx: { fire: 'b', say: 'No drama. No money back.' } },
      { t: '💸 Make {b} pay it back', fx: { cash: 0.7, b: -20, next: ['theft_again', 6, 12, 0.5], say: '{b} pays back half. Can you trust them? 🤨' } }
    ] });

  ev({ id: 'bad_manager', cat: 'boss', icon: '😠', w: 1.5, need: 4, who: { m: 'mgr' },
    title: 'The team doesn\'t like {m}',
    text: 'Workers say manager {m} yells at them and has favorites. 😠',
    choices: [
      { t: '🧑‍🏫 Send {m} to a class', fx: { cash: -0.2, team: 5, say: '{m} came back much nicer. 😊' } },
      { t: '🛡️ Side with {m}', fx: { team: -8, loyal: { m: 10 }, say: '{m} is happy. The team is not.' } },
      { t: '⬇️ Remove {m} as manager', fx: { demote: 'm', team: 6, say: 'The team quietly cheers. 🎉' } }
    ] });

  ev({ id: 'manager_disagree', cat: 'boss', icon: '⚔️', w: 1.5, cond: function (g) { return g.employees.filter(function (e) { return e.role === 'mgr'; }).length >= 2; }, who: { a: 'mgr', b: 'mgr' },
    title: 'Your managers disagree!',
    text: '{a} wants LOWER prices to get more customers. {b} wants HIGHER prices for more money. You decide!',
    choices: [
      { t: '⬇️ Side with {a}', fx: { price: -1, b: -12, say: 'Prices go down! More customers coming.' } },
      { t: '⬆️ Side with {b}', fx: { price: 1, a: -12, say: 'Prices go up! Each sale makes more money.' } },
      { t: '😐 Keep things the same', fx: { a: -5, b: -5, say: 'Neither is happy. 😑' } }
    ] });

  ev({ id: 'risky_idea', cat: 'boss', icon: '🎲', w: 1.2, minWeek: 12, cd: 25, who: { m: 'ambitious' }, init: amt(4),
    title: 'A BIG risky plan!',
    text: '{m} has a huge plan: spend {amt} on a brand new product line! "Trust me!" 🎲',
    choices: [
      { t: '🎲 Go all in!', fx: { cash: -4, chance: { p: 0.5, win: { demand: [1.25, 20, 'New product line'], fans: 15, m: 15, say: 'It\'s a HIT! 🚀' }, lose: { m: -10, say: 'It flopped. The money is gone. 😭' } } } },
      { t: '🧪 Try a small test', fx: { cash: -0.8, chance: { p: 0.5, win: { demand: [1.08, 10, 'Product test'], say: 'The test went well! 👍' }, lose: { say: 'The test says no. Good thing you checked!' } } } },
      { t: '🙅 No way', fx: { m: -8, say: '{m} sighs and closes the laptop.' } }
    ] });

  ev({ id: 'wants_manager', cat: 'boss', icon: '🙋', w: 1.5, minWeek: 8, need: 4, who: { a: 'notmgr' },
    title: '{a} wants to be a manager',
    text: '{a} really wants to lead the team. They are excited, but have never done it before.',
    choices: [
      { t: '👔 Give {a} a chance', fx: { mgr: 'a', next: ['out_of_depth', 2, 5, 0.45], say: '{a} is SO excited! Can they do it? 🤞' } },
      { t: '📚 "Learn more first"', fx: { a: -4, skill: { a: 2 }, say: '{a} takes it well.' } },
      { t: '❌ "No"', fx: { a: -12, say: '{a} is hurt. 😢' } }
    ] });

  ev({ id: 'manager_stealing', cat: 'boss', icon: '💰', w: 0.8, minWeek: 15, cd: 30, who: { m: 'mgr' }, init: amt(1), start: { cash: -1 },
    title: 'Manager {m} was stealing!',
    text: '{m} was paying for fake "work trips" with company money. {amt} is gone! 😡',
    choices: [
      { t: '🚪 Fire {m}', fx: { fire: 'm', say: 'You need a new manager now.' } },
      { t: '⬇️ Demote + get the money back', fx: { demote: 'm', cash: 0.7, say: 'You got most of it back. 💰' } }
    ] });

  ev({ id: 'investors_angry', cat: 'boss', icon: '📊', w: function (g) { return g.ownership < 80 ? 1.5 : 0; }, minWeek: 10, cd: 20,
    title: 'Your investors want more!',
    text: 'The people who own part of {company} want you to grow FASTER. 📈',
    choices: [
      { t: '⬆️ Raise prices', fx: { price: 1, say: 'Investors are happy. Customers... less so.' } },
      { t: '📢 Promise big growth', fx: { rep: -1, say: 'They will be watching! 👀' } },
      { t: '😎 "Trust the plan"', fx: { chance: { p: 0.5, win: { say: 'They calm down. 😌' }, lose: { run: function (g) { g.ownership = Math.max(10, g.ownership - 3); return 'They made you give them 3% more of the company! 😤'; } } } } }
    ] });

  ev({ id: 'consultant', cat: 'boss', icon: '🧑‍💼', w: 1.2, cd: 25, init: amt(1),
    title: 'A fancy consultant',
    text: 'A consultant in a shiny suit says "I can make you 20% more money!" It costs {amt}. 🧑‍💼',
    choices: [
      { t: '✍️ Hire them', fx: { cash: -1, chance: { p: 0.55, win: { demand: [1.12, 12, 'Consultant tips'], equip: 0.03, say: 'Their ideas actually worked! 📈' }, lose: { say: 'They made a pretty slideshow. That\'s it. 🙄' } } } },
      { t: '🙅 No thanks', fx: { say: 'They leave you their card. ✨' } }
    ] });

  ev({ id: 'focus', cat: 'boss', icon: '🎯', w: 2, cd: 10,
    title: 'Pick this month\'s focus',
    text: 'Your team asks: what should we focus on this month? 🎯',
    choices: [
      { t: '⭐ Quality', fx: { happy: 6, rep: 2, say: 'Everything is a bit better! ⭐' } },
      { t: '⚡ Speed', fx: { capacity: [1.12, 4, 'Speed focus'], say: 'Everything is faster! ⚡' } },
      { t: '📣 Getting noticed', fx: { fans: 12, say: 'More people know about you! 📣' } },
      { t: '😊 Team happiness', fx: { team: 8, say: 'Happy team, happy life! 😊' } }
    ] });

  // =====================================================================
  // 😂 FUNNY
  // =====================================================================

  ev({ id: 'pet', cat: 'funny', icon: '🐶', w: 2, cd: 20, who: { a: 'any' },
    title: '{a} brought a dog to work!',
    text: 'The dog is very cute. 🐶 The dog is also eating a customer\'s sandwich.',
    choices: [
      { t: '🐾 Dogs are welcome here!', fx: { team: 6, chance: { p: 0.8, win: { fans: 6, say: 'Everyone loves the office dog! 🐕' }, lose: { rep: -2, say: 'Happy team! But one customer sneezed nonstop. 🤧' } } } },
      { t: '🚫 No pets', fx: { a: -6, say: 'The dog goes home. Everyone is a little sad. 🥺' } }
    ] });

  ev({ id: 'prank_war', cat: 'funny', icon: '🎭', w: function (g) { return g.employees.some(function (e) { return G.has(e, 'funny'); }) ? 2.5 : 0.5; }, need: 3,
    title: 'PRANK WAR! 🎭',
    text: 'Someone wrapped a desk in tin foil. Then someone put a fake spider in a coffee. It\'s getting crazy!',
    choices: [
      { t: '🎈 Join in!', fx: { team: 8, capacity: [0.95, 1, 'Prank war'], say: 'You filled a car with balloons. LEGENDARY. 🎈🚗' } },
      { t: '🛑 Stop it now', fx: { team: -4, say: 'Back to work. Boring. 😐' } }
    ] });

  ev({ id: 'microwave', cat: 'funny', icon: '🍿', w: 1.2, cd: 30,
    title: 'The microwave is GONE',
    text: 'Someone took the office microwave. Lunch is chaos. 🍿😱',
    choices: [
      { t: '🛒 Buy a new one', fx: { money: -150, say: 'Peace returns to the kitchen. 🕊️' } },
      { t: '🔍 Investigate!', fx: { team: 3, say: 'It was found in the closet with a note: "sorry" 📝' } }
    ] });

  ev({ id: 'asleep', cat: 'funny', icon: '😴', w: 2, who: { a: 'lazy' },
    title: '{a} fell asleep in a meeting',
    text: 'In the middle of the meeting... {a} started SNORING. 😴💤',
    choices: [
      { t: '🤫 Let them sleep', fx: { chance: { p: 0.3, win: { skill: { a: 5 }, say: '{a} woke up with a genius idea! Skill +5 💡' }, lose: { team: 2, say: 'Everyone giggled for the whole meeting. 😂' } } } },
      { t: '☕ Wake them with coffee', fx: { say: '{a} says sorry and drinks 3 coffees. ☕☕☕' } },
      { t: '🏠 Send them home', fx: { a: -12, say: 'Point made.' } }
    ] });

  ev({ id: 'mega_order', cat: 'funny', icon: '📦', w: 1.2, cd: 30, who: { a: 'any' },
    title: 'Oops! 10,000 instead of 100!',
    text: '{a} typed too many zeros. A GIANT truck of supplies is outside. 🚛📦📦📦',
    choices: [
      { t: '↩️ Send it back (small fee)', fx: { cash: -0.12, say: 'Lesson learned: check the zeros! 🔢' } },
      { t: '🎉 Throw an "Oops Sale"!', fx: { cash: -0.6, fans: 12, demand: [1.15, 2, 'Oops Sale'], supply: [-0.1, 2, 'Extra stock'], say: 'The Oops Sale was a huge hit! 😂' } },
      { t: '📦 Keep it all', fx: { cash: -0.6, supply: [-0.08, 6, 'Extra stock'], say: 'Your storage room is FULL. 📦📦📦' } }
    ] });

  ev({ id: 'internal_msg', cat: 'funny', icon: '💬', w: 1.2, cd: 25,
    title: 'Private message went public!',
    text: 'Someone posted "is the boss here yet? look busy!!" on the COMPANY page. 😳',
    choices: [
      { t: '😂 Reply "The boss is here."', fx: { chance: { p: 0.6, win: { fans: 18, viral: [0.3, 1.5], say: 'People loved it! 😂' }, lose: { say: 'A few laughs. That\'s it.' } } } },
      { t: '🗑️ Delete it', fx: { say: 'Only 40 people saw it. Probably. 👀' } }
    ] });

  ev({ id: 'parking', cat: 'funny', icon: '🅿️', w: 1.5, need: 2, who: { a: 'any', b: 'any' },
    title: 'The parking spot war',
    text: '{a} and {b} BOTH want the best parking spot. Now there are angry notes on the cars. 🚗📝',
    choices: [
      { t: '📋 Whoever came first gets it', fx: { b: -6, say: 'Rules are rules.' } },
      { t: '🏆 Worker of the month gets it', fx: { team: 3, say: 'Now everyone works harder for it! 😂' } },
      { t: '😈 Take it yourself', fx: { rel: ['a', 'b', 20], say: 'Now they\'re teaming up... against YOU. 😂' } }
    ] });

  ev({ id: 'lunch_thief', cat: 'funny', icon: '🥪', w: 1.5, cd: 25,
    title: 'The lunch thief strikes again',
    text: 'Someone keeps eating other people\'s lunch from the fridge. The fridge is covered in angry notes. 🥪😤',
    choices: [
      { t: '📷 Put a camera in the fridge', fx: { money: -90, run: function (g) { var e = U.pick(g.employees); return 'Caught! It was ' + (e ? G.first(e) : 'the manager') + '. They bring cake to say sorry. 🍰'; } } },
      { t: '🍔 Free lunch for all on Friday', fx: { cash: -0.03, team: 4, say: 'Free lunch fixes EVERYTHING. 🍔' } }
    ] });

  ev({ id: 'birthday', cat: 'funny', icon: '🎂', w: 1.5, need: 2, who: { a: 'any' },
    fx: { team: 2, a: 6, say: 'Surprise birthday party for {a}! 🎂🎉' } });

  ev({ id: 'goose', cat: 'funny', icon: '🪿', w: 1, cd: 30, rarity: 'rare',
    title: 'A GOOSE got inside!',
    text: 'A goose walked into the shop. It won\'t leave. It is honking at everyone. 🪿📢',
    choices: [
      { t: '🧹 Chase it out', fx: { chance: { p: 0.5, win: { say: 'The goose leaves. Everyone claps. 👏' }, lose: { fans: 15, say: 'The goose chased YOU. Someone filmed it. 😂' } } } },
      { t: '👑 Make it the mascot', fx: { fans: 20, happy: 3, say: 'Meet Sir Honksalot, your new mascot! 🪿👑' } }
    ] });

  ev({ id: 'pajamas', cat: 'funny', icon: '🩳', w: 1.5, who: { a: 'any' },
    title: '{a} came in pajamas!',
    text: '{a} forgot to change and came to work in dinosaur pajamas. 🦖🩳',
    choices: [
      { t: '🦖 Pajama Day for everyone!', fx: { team: 6, fans: 6, say: 'Customers love Pajama Day! 😂' } },
      { t: '🏠 "Go change, please"', fx: { a: -3, say: '{a} goes home, red-faced. 😳' } }
    ] });

  ev({ id: 'sign_typo', cat: 'funny', icon: '🪧', w: 1, cd: 40,
    init: function (g, c) { c.typo = g.company.name.split('').reverse().join(''); },
    title: 'Your new sign has a typo!',
    text: 'The sign company printed your name BACKWARDS: "{typo}" 🤦',
    choices: [
      { t: '🔧 Fix it', fx: { cash: -0.1, say: 'Fixed. 😌' } },
      { t: '😂 Keep it!', fx: { fans: 15, chance: { p: 0.3, win: { viral: [0.5, 2], say: 'People travel just to take a photo with it! 📸' }, lose: { say: 'Tourists take photos of it. 📸' } } } }
    ] });

  ev({ id: 'fire_alarm', cat: 'funny', icon: '🍿', w: 1.5, cd: 25, who: { a: 'any' },
    title: 'Burnt popcorn alarm!',
    text: '{a} burned popcorn and set off the fire alarm. Everyone had to go outside! 🚨🍿',
    choices: [
      { t: '🚫 Ban popcorn forever', fx: { team: -3, say: 'Popcorn is now illegal here. 😔🍿' } },
      { t: '😂 Laugh it off', fx: { team: 3, capacity: [0.95, 1, 'Popcorn alarm'], say: '{a} now has the nickname "Popcorn". 🍿' } }
    ] });

  ev({ id: 'elevator', cat: 'funny', icon: '🛗', w: 1.2, need: 2, who: { a: 'any', b: 'any' },
    fx: { chance: { p: 0.6, win: { rel: ['a', 'b', 40], say: '{a} and {b} got stuck in the elevator for 2 hours. Now they\'re best friends! 🛗🤝' }, lose: { rel: ['a', 'b', -40], say: '{a} and {b} got stuck in the elevator for 2 hours. Now they can\'t stand each other. 🛗😤' } } } });

  ev({ id: 'same_outfit', cat: 'funny', icon: '👯', w: 1.2, need: 2, who: { a: 'any', b: 'any' },
    fx: { rel: ['a', 'b', 15], team: 2, say: '{a} and {b} wore the EXACT same outfit today. Twins! 👯' } });

  ev({ id: 'robot_vacuum', cat: 'funny', icon: '🤖', w: 1, fx: { fans: 5, say: 'The robot vacuum escaped and drove down the street. A kid caught it. 🤖🏃' } });

  ev({ id: 'mystery_smell', cat: 'funny', icon: '🤢', w: 1.2, cd: 30,
    title: 'What is that SMELL?!',
    text: 'Something smells terrible and nobody knows where it\'s coming from. 🤢',
    choices: [
      { t: '🔍 Search everywhere', fx: { team: 2, say: 'Found it: a 3-week-old tuna sandwich behind the fridge. 🐟🤮' } },
      { t: '🕯️ Buy 50 candles', fx: { money: -120, happy: -1, say: 'Now it smells like vanilla AND tuna. 🕯️🐟' } }
    ] });

  ev({ id: 'karaoke', cat: 'funny', icon: '🎤', w: 1.2, need: 3, fx: { team: 5, say: 'Someone left karaoke on at lunch. The whole team sang. Badly. 🎤😂' } });

  ev({ id: 'costume_day', cat: 'funny', icon: '🎃', w: 4, cd: 40, cond: season(42, 44),
    title: 'Halloween! 🎃',
    text: 'The team wants to dress up in costumes at work!',
    choices: [
      { t: '👻 Costumes for everyone!', fx: { cash: -0.05, team: 8, fans: 10, say: 'A zombie served customers. They LOVED it. 🧟' } },
      { t: '🍬 Just give out candy', fx: { cash: -0.03, happy: 4, say: 'Sweet! 🍬' } }
    ] });

  // =====================================================================
  // 🚨 BIG TROUBLE
  // =====================================================================

  ev({ id: 'lawsuit', cat: 'trouble', icon: '⚖️', w: 0.7, minWeek: 20, cd: 40, init: amt(6),
    title: 'You\'re being sued!',
    text: 'A customer says they tripped in your shop. They want {amt}! ⚖️',
    choices: [
      { t: '🤝 Pay them to go away', fx: { cash: -2.5, say: 'Settled quietly. 🤐' } },
      { t: '⚖️ Fight it in court', fx: { cash: -1, chance: { p: 0.55, win: { rep: 3, say: 'You WON! They were faking it. 🎉' }, lose: { cash: -6, rep: -8, say: 'You lost. It\'s all over the news. 😭' } } } }
    ] });

  ev({ id: 'accident', cat: 'trouble', icon: '🚑', w: 0.6, minWeek: 15, cd: 40, who: { a: 'front' },
    title: 'Accident at work!',
    text: '{a} got hurt at work. They will be okay, but everyone is worried about safety. 🚑',
    choices: [
      { t: '🦺 Pay their bills + make it safer', fx: { cash: -1.5, team: 8, loyal: { a: 25 }, say: 'The team trusts you more now. ❤️' } },
      { t: '🤏 Pay the minimum', fx: { cash: -0.4, team: -10, next: ['strike', 2, 5, 0.4], say: 'The team is angry at you. 😠' } }
    ] });

  ev({ id: 'bad_batch', cat: 'trouble', icon: '☣️', w: 0.7, minWeek: 12, cd: 40,
    title: 'Some products were bad!',
    text: 'A batch of your {unit} came out wrong. A few customers noticed. Most didn\'t... yet. 😬',
    choices: [
      { t: '📢 Tell everyone + give refunds', fx: { cash: -1.8, rep: 3, say: 'People love your honesty! 🙌' } },
      { t: '🤫 Fix it quietly', fx: { chance: { p: 0.5, win: { say: 'Nobody ever found out. 😅' }, lose: { rep: -18, demand: [0.8, 6, 'Cover-up scandal'], say: 'A reporter found out you hid it! 😱' } } } }
    ] });

  ev({ id: 'strike', cat: 'trouble', icon: '🪧', w: function (g) { return G.avgMorale(g) < 38 ? 2 : 0; }, minWeek: 10, cd: 30, need: 4,
    title: 'STRIKE! 🪧',
    text: 'The whole team walked out! They are outside with signs. Nothing is getting done!',
    choices: [
      { t: '💵 Give everyone +10%', fx: { teamRaise: 0.1, say: 'Everyone is back at work! 🙌' } },
      { t: '🤝 Negotiate', fx: { chance: { p: 0.5, win: { teamRaise: 0.05, say: 'You agree on +5%. Deal! 🤝' }, lose: { closed: [1, 'Strike'], team: -5, say: 'Talks failed. Closed next week. 😩' } } } },
      { t: '😤 Wait them out', fx: { closed: [2, 'Strike'], team: -10, rep: -5, say: 'Closed for 2 weeks! 😱' } }
    ] });

  ev({ id: 'cyberattack', cat: 'trouble', icon: '🦠', w: 0.6, minWeek: 20, cd: 40, init: amt(1.2),
    title: 'HACKERS! 🦠',
    text: 'Hackers locked all your computers. They want {amt} to unlock them! 💻🔒',
    choices: [
      { t: '💸 Pay them', fx: { cash: -1.2, chance: { p: 0.8, win: { say: 'They unlocked everything. Phew.' }, lose: { capacity: [0.7, 2, 'Locked computers'], say: 'They took the money and ran! 😡' } } } },
      { t: '💾 Use your backups', fx: { cash: -0.4, capacity: [0.8, 1, 'Restoring computers'], say: 'Takes a week, but you\'re back! 💪' } }
    ] });

  ev({ id: 'supplier_bankrupt', cat: 'trouble', icon: '🏚️', w: 0.5, minWeek: 20, cd: 50,
    title: 'Your supplier closed!',
    text: 'Your main supplier went out of business overnight! You need a new one NOW. 😰',
    choices: [
      { t: '⚡ Pay extra for a fast one', fx: { supply: [0.06, 8, 'Emergency supplier'], say: 'Supplies keep coming, but it costs more.' } },
      { t: '🔍 Take time to find a good one', fx: { capacity: [0.6, 2, 'No supplies'], say: 'Two slow weeks, then back to normal.' } }
    ] });

  ev({ id: 'kitchen_fire', cat: 'trouble', icon: '🔥', w: 0.7, minWeek: 8, cd: 40, cond: FOOD,
    title: 'FIRE in the kitchen! 🔥',
    text: 'A pan caught fire! Smoke everywhere!',
    choices: [
      { t: '🧯 Use the fire extinguisher', fx: { chance: { p: 0.75, win: { cash: -0.2, team: 3, say: 'Fire out! Hero moment! 🦸' }, lose: { cash: -1, closed: [1, 'Fire damage'], say: 'It spread a bit. Closed for a week to fix it. 😩' } } } },
      { t: '🚒 Everyone out, call for help', fx: { cash: -0.5, closed: [1, 'Fire damage'], say: 'Everyone is safe. That\'s what matters. ❤️' } }
    ] });

  // =====================================================================
  // 🥊 RIVALS & 🌍 WORLD NEWS
  // =====================================================================

  ev({ id: 'rival_opens', cat: 'rivals', icon: '🏪', w: 2, cd: 20, minWeek: 8, init: rival,
    title: '{rival} is opening next door!',
    text: 'A giant "OPENING SOON" sign just went up across the street. It\'s {rival}! They have super low prices. 😬',
    choices: [
      { t: '💳 Start a loyalty card', fx: { cash: -0.5, fans: 8, demand: [0.95, 4, 'New rival nearby'], say: 'Your regular customers stay with you! ❤️' } },
      { t: '🎉 Throw a big party the same day', fx: { cash: -0.8, fans: 15, say: 'Your party was WAY more fun than their opening! 🎉' } },
      { t: '🤷 Ignore them', fx: { demand: [0.85, 8, 'New rival nearby'], say: 'Some customers try the new place. 😕' } }
    ] });

  ev({ id: 'rival_scandal', cat: 'world', icon: '📰', kind: 'news', w: 1.2, cd: 25, init: rival,
    title: '{rival} caught selling fake stuff!',
    text: 'Big news: {rival} has been selling fakes! Their customers are angry. 😱',
    choices: [
      { t: '🤐 Stay quiet', fx: { demand: [1.05, 3, 'Rival scandal'], say: 'Some of their customers come to you anyway.' } },
      { t: '🎟️ "10% off for {rival} customers!"', fx: { cash: -0.2, demand: [1.15, 4, 'Rival scandal'], fans: 10, say: 'Smart move! New customers everywhere! 🧠' } },
      { t: '😈 Make fun of them online', fx: { chance: { p: 0.5, win: { fans: 20, say: 'Savage! People loved it. 🔥' }, lose: { rep: -5, say: 'People thought you were mean. 😬' } } } }
    ] });

  ev({ id: 'rival_closed', cat: 'world', icon: '📰', w: 1, cd: 30, init: rival, fx: { demand: [1.1, 6, 'Rival closed a shop'], say: '📰 {rival} closed one of their shops! Their customers are coming to you.' } });

  ev({ id: 'trend_news', cat: 'world', icon: '📈', kind: 'news', w: 1.5, cd: 20,
    title: 'Your business is the NEW trend!',
    text: 'Everybody online is talking about {industry} places this month! More people want to buy from you.',
    choices: [
      { t: '🚀 Ride the wave!', fx: { cash: -0.3, demand: [1.25, 4, 'Hot trend'], say: 'You\'re part of the trend! 🌊' } },
      { t: '😌 Enjoy the extra customers', fx: { demand: [1.12, 4, 'Hot trend'], say: 'Nice! 📈' } }
    ] });

  ev({ id: 'price_news', cat: 'world', icon: '📰', w: 1, cd: 30, fx: { supply: [0.03, 6, 'Supply prices up'], say: '📰 Supplies cost more everywhere right now. Your costs are a bit higher.' } });

  ev({ id: 'healthy_trend', cat: 'world', icon: '🥗', kind: 'news', w: 1, cd: 30, cond: FOOD,
    title: 'Everyone is eating healthy now!',
    text: 'A new health trend is here! People want healthy food. 🥗',
    choices: [
      { t: '🥗 Add healthy options', fx: { cash: -0.3, demand: [1.1, 6, 'Healthy menu'], say: 'Health fans love your new menu! 💚' } },
      { t: '🍔 "We\'re not changing!"', fx: { demand: [0.95, 3, 'Health trend'], fans: 4, say: 'Some people love that you stay the same!' } }
    ] });

  ev({ id: 'sponsor_team', cat: 'world', icon: '⚽', w: 1.2, cd: 30,
    title: 'Sponsor a kids\' team?',
    text: 'The local kids\' soccer team needs new shirts. They want YOUR logo on them! ⚽',
    choices: [
      { t: '👕 Yes!', fx: { cash: -0.3, rep: 4, fans: 10, say: 'Your logo is on 15 tiny shirts. They won their first game! 🏆' } },
      { t: '🙅 Not now', fx: { say: 'Maybe next season.' } }
    ] });

  ev({ id: 'tv_show', cat: 'lucky', icon: '📺', w: 0.8, cd: 40, rarity: 'epic',
    title: 'A TV show wants YOU!',
    text: 'A TV show wants to film a whole episode at {company}! 📺🎬',
    choices: [
      { t: '🎬 Yes! Roll the cameras!', fx: { chance: { p: 0.75, win: { fans: 60, rep: 5, viral: [2, 6], say: 'The episode was a hit! You\'re famous! 🌟' }, lose: { fans: 25, rep: -4, say: 'They made you look a bit silly... but people know you now! 😅' } } } },
      { t: '🙈 Too scary', fx: { say: 'Maybe it\'s better this way.' } }
    ] });

  ev({ id: 'grant', cat: 'lucky', icon: '🏛️', w: 1, cd: 40, fx: { cash: 0.8, say: 'The city gave you a small-business prize! 🏛️💰' } });

  ev({ id: 'old_painting', cat: 'lucky', icon: '🖼️', w: 0.8, cd: 50, rarity: 'rare',
    title: 'You found an old painting!',
    text: 'While cleaning the storage room, you found a dusty old painting. 🖼️ Is it worth anything?',
    choices: [
      { t: '💰 Sell it', fx: { chance: { p: 0.3, win: { cash: 6, say: 'It was by a FAMOUS painter! 🤑🤑' }, lose: { cash: 0.1, say: 'It was painted by someone\'s grandma. 😂' } } } },
      { t: '🖼️ Hang it on the wall', fx: { happy: 3, say: 'It makes the shop look fancy. 🎩' } }
    ] });

  // =====================================================================
  // 🍀 MINI-GAMES
  // =====================================================================

  ev({ id: 'mystery_boxes', cat: 'lucky', icon: '🎁', kind: 'boxes', w: 2.5, cd: 7,
    title: 'Mystery boxes!',
    text: 'A delivery driver dropped off 3 mystery boxes by mistake. "Keep one!" Pick a box! 🎁',
    prizes: [
      { label: 'A bag of cash', emoji: '💰', w: 3, fx: { cash: 1.2 } },
      { label: 'A viral video', emoji: '📱', w: 2, fx: { fans: 25 } },
      { label: 'A super worker', emoji: '🦸', w: 1, fx: { hireSpecial: { role: 'front', skill: 88, traits: ['hardworking', 'friendly'] } } },
      { label: 'Happy customers', emoji: '🥰', w: 2, fx: { happy: 8, rep: 3 } },
      { label: 'Old socks', emoji: '🧦', w: 2, fx: { say: 'Just old socks. Yuck! 🤢' } },
      { label: 'A toy snake', emoji: '🐍', w: 1.5, fx: { team: 4, say: 'It\'s a toy! Everyone laughed. 😂' } },
      { label: 'Golden ticket', emoji: '🎫', w: 0.5, fx: { cash: 4, fans: 20 } }
    ] });

  ev({ id: 'lucky_wheel', cat: 'lucky', icon: '🎡', kind: 'wheel', w: 2.5, cd: 7,
    title: 'Spin the Lucky Wheel!',
    text: 'The Business Fair has a prize wheel. You get ONE free spin! 🎡',
    slices: [
      { label: 'Cash', emoji: '💰', color: '#FFB020', w: 3, fx: { cash: 0.7 } },
      { label: 'Followers', emoji: '📱', color: '#FF5FA2', w: 2.5, fx: { fans: 20 } },
      { label: 'Reputation', emoji: '⭐', color: '#7C4DFF', w: 2.5, fx: { rep: 5 } },
      { label: 'Oops', emoji: '💸', color: '#FF4D5E', w: 2, fx: { cash: -0.4 } },
      { label: 'Party', emoji: '🎉', color: '#20C997', w: 2.5, fx: { team: 10 } },
      { label: 'JACKPOT', emoji: '💎', color: '#2EA8FF', w: 0.6, jackpot: true, fx: { cash: 5, fans: 30 } },
      { label: 'Lucky week', emoji: '🍀', color: '#12B886', w: 2, fx: { demand: [1.2, 2, 'Lucky week'] } },
      { label: 'Nothing', emoji: '🙃', color: '#ADB5BD', w: 2, fx: { say: 'Better luck next time!' } }
    ] });

  ev({ id: 'rush_hour', cat: 'lucky', icon: '🏃', kind: 'tap', w: 2.5, cd: 8,
    title: 'RUSH HOUR!',
    text: 'A HUGE crowd just walked in! Tap the customers as fast as you can to serve them! 🏃‍♀️',
    target: '🙋', goal: 18, secs: 7,
    win: { cash: 0.8, happy: 5, say: 'Everyone got served! 🙌' }, lose: { happy: -3, say: 'Some customers left without buying. 😕' } });

  ev({ id: 'catch_thief', cat: 'lucky', icon: '🦹', kind: 'tap', w: 2, cd: 10, cond: noCams,
    title: 'STOP THAT THIEF!',
    text: 'A thief grabbed stuff and is running away! Tap them to catch them! 🦹',
    target: '🦹', goal: 14, secs: 6,
    win: { cash: 0.3, rep: 3, fans: 6, say: 'GOT THEM! 👮 You\'re a hero!' }, lose: { cash: -0.5, say: 'They got away... 😩' } });

  ev({ id: 'leak_tap', cat: 'lucky', icon: '💧', kind: 'tap', w: 1.5, cd: 12,
    title: 'LEAKS EVERYWHERE!',
    text: 'The pipes are leaking! Tap the drops to plug them before the shop floods! 💧',
    target: '💧', goal: 16, secs: 7,
    win: { say: 'All leaks plugged! 🔧' }, lose: { cash: -0.5, say: 'Too much water got in. Clean-up costs money. 💦' } });

  ev({ id: 'bug_squash', cat: 'lucky', icon: '🐛', kind: 'tap', w: 2, cd: 10, cond: TECH,
    title: 'BUG ATTACK!',
    text: 'Bugs are crawling through your code! Squash them before launch! 🐛',
    target: '🐛', goal: 18, secs: 7,
    win: { rep: 3, fans: 8, say: 'Bug-free launch! 🚀' }, lose: { rep: -3, say: 'Some bugs got through. Users are grumpy. 😤' } });

  ev({ id: 'balloon_party', cat: 'lucky', icon: '🎈', kind: 'tap', w: 1.5, cd: 12, need: 2,
    title: 'Balloon party!',
    text: 'It\'s the company birthday! Pop as many balloons as you can! 🎈',
    target: '🎈', goal: 20, secs: 7,
    win: { team: 10, say: 'Best party ever! 🥳' }, lose: { team: 4, say: 'Still a fun party! 🎉' } });

  function quizGen() {
    var t = U.ri(0, 4), q, ans, opts, money = true;
    if (t === 0) {
      var price = U.ri(3, 15), paid = price <= 5 ? 10 : 20; ans = paid - price;
      q = 'A customer buys something for $' + price + '. They pay with $' + paid + '. How much change do you give back?';
      opts = [ans, ans + 1, ans + 2, Math.max(1, ans - 1)];
    } else if (t === 1) {
      var n = U.ri(2, 9), p = U.ri(2, 6); ans = n * p;
      q = 'You sell ' + n + ' things for $' + p + ' each. How much money did you make?';
      opts = [ans, ans + p, ans - p, n + p];
    } else if (t === 2) {
      var sell = U.ri(8, 20), costx = U.ri(2, sell - 2); ans = sell - costx;
      q = 'You sell a toy for $' + sell + '. It cost you $' + costx + ' to make. How much PROFIT did you make?';
      opts = [ans, sell + costx, ans + 2, Math.max(1, ans - 2)];
    } else if (t === 3) {
      var full = U.pick([10, 20, 40, 50, 100]), pct = U.pick([10, 20, 50]); ans = full - full * pct / 100;
      q = 'Something costs $' + full + '. It\'s ' + pct + '% off today! What is the new price?';
      opts = [ans, full - pct, full * pct / 100, ans + 5];
    } else {
      var w = U.ri(2, 6), each = U.pick([5, 10, 20, 25]); ans = w * each; money = false;
      q = 'You have ' + w + ' workers. Each one helps ' + each + ' customers a day. How many customers get help in one day?';
      opts = [ans, w + each, ans + each, ans - each];
    }
    var uniq = [];
    opts.forEach(function (o) { if (uniq.indexOf(o) < 0 && o > 0) uniq.push(o); });
    while (uniq.length < 3) uniq.push(ans + uniq.length * 3);
    uniq = U.shuffle(uniq.slice(0, 4));
    return { q: q, options: uniq.map(function (o) { return (money ? '$' : '') + o; }), answer: uniq.indexOf(ans) };
  }
  ev({ id: 'quiz', cat: 'lucky', icon: '🧠', kind: 'quiz', w: 2.5, cd: 6,
    init: function (g, c) { c.q = quizGen(); },
    title: 'Business Brain Quiz!',
    text: 'Answer right to win a prize! 🧠',
    win: { cash: 0.5, xp: 20, say: 'Big brain! 🧠✨' }, lose: { say: 'Nice try! You\'ll get the next one. 💪' } });

  ev({ id: 'investor_deal', cat: 'lucky', icon: '💼', kind: 'deal', w: 1.2, cd: 20, minWeek: 12,
    cond: function (g) { return g.ownership > 30; },
    init: function (g, c) { c.pct = U.pick([5, 10, 15]); c.offer = U.nice(G.stakeOffer(g, c.pct) * 0.8); c.round = 0; c.own = Math.round(g.ownership); },
    title: 'An investor wants in!',
    text: 'A rich investor wants to buy {pct}% of {company}. You own {own}% right now. Make a deal!',
    accept: function (g, c) { return { money: c.offer, run: function (gg) { gg.ownership -= c.pct; return 'You sold ' + c.pct + '% of the company.'; } }; },
    acceptSay: 'Deal! 🤝 {offerTxt} is in your account!' });

  ev({ id: 'buy_recipe', cat: 'lucky', icon: '📜', kind: 'deal', w: 1, cd: 25, minWeek: 8,
    init: function (g, c) { c.offer = U.nice(G.scale(g) * 0.6); c.round = 0; },
    title: 'Someone wants your secret!',
    text: 'A big company wants to buy your secret recipe. They will copy it, so you\'ll get a few fewer customers for a while.',
    accept: function (g, c) { return { money: c.offer, demand: [0.95, 8, 'Secret sold'] }; },
    acceptSay: 'Sold! 🤝 {offerTxt} for your secret.' });

  ev({ id: 'movie_filming', cat: 'lucky', icon: '🎬', kind: 'deal', w: 1, cd: 30, minWeek: 5, rarity: 'rare',
    init: function (g, c) { c.offer = U.nice(G.scale(g) * 0.9); c.round = 0; },
    title: 'A movie wants to film here!',
    text: 'A movie crew wants to film a scene in your shop! You\'d have to close for a week. How much will they pay?',
    accept: function (g, c) { return { money: c.offer, closed: [1, 'Movie filming'], fans: 20 }; },
    acceptSay: 'Lights, camera, action! 🎬 {offerTxt} for you!' });

  ev({ id: 'price_war', cat: 'rivals', icon: '🥊', kind: 'vs', w: 2, cd: 10, minWeek: 4, init: rival,
    title: '{rival} wants a BATTLE!',
    text: '{rival} is trying to steal your customers! Pick your move.',
    win: { fans: 15, demand: [1.15, 4, 'Won the battle'], rep: 2 }, lose: { demand: [0.9, 3, 'Lost the battle'] }, tie: { fans: 4 } });

  ev({ id: 'interview', cat: 'team', icon: '🧑‍💼', kind: 'interview', w: 2.5, cd: 6,
    init: function (g, c) {
      var role = U.weighted(['front', 'sales', 'acct', 'mgr'], function (r) { return { front: 60, sales: 20, acct: 10, mgr: 10 }[r]; });
      c.cand = G.makeEmployee(g, role, { skill: U.ri(35, 90) });
      c.cand.salary = Math.round(c.cand.salary * 0.95);
    },
    title: 'Someone wants a job!',
    text: 'A person walks in with a smile. "Hi! Are you hiring?" Ask ONE question, then decide!' });

  // =====================================================================
  // ✨ LEGENDARY (super rare and weird)
  // =====================================================================

  ev({ id: 'alien', cat: 'weird', icon: '👽', rarity: 'legendary', w: 1, minWeek: 10, cd: 200,
    title: 'An ALIEN walked in! 👽',
    text: 'A little green alien bought some {unit} and paid with a glowing space coin. 🪙✨',
    choices: [
      { t: '🪙 Keep the space coin', fx: { chance: { p: 0.5, win: { cash: 8, say: 'A museum paid a FORTUNE for it! 🤑' }, lose: { say: 'It stopped glowing. Now it\'s just a coin. 😐' } } } },
      { t: '📸 Take a selfie with the alien', fx: { viral: [5, 15], fans: 40, say: 'The selfie broke the internet! 👽🤳' } },
      { t: '🛸 Offer it a job', fx: { hireSpecial: { name: 'Zorp Blip', face: '👽', role: 'front', skill: 99, traits: ['hardworking', 'funny'], salaryMult: 0.5 }, fans: 20, say: 'Zorp joined the team! 👽 "Beep boop, happy to help."' } }
    ] });

  ev({ id: 'time_traveler', cat: 'weird', icon: '⏳', rarity: 'legendary', w: 1, minWeek: 10, cd: 200,
    title: 'A time traveler appears!',
    text: 'A person in shiny clothes says: "I\'m from the year 3000. {company} becomes HUGE in the future!" ⏳',
    choices: [
      { t: '🔮 "Give me tips!"', fx: { demand: [1.2, 12, 'Tips from the future'], say: 'The tips are... weirdly good. 🤯' } },
      { t: '🤨 "Sure you are."', fx: { team: 3, say: 'They vanish in a puff of smoke. Wait, WHAT? 💨' } }
    ] });

  ev({ id: 'cat_ceo', cat: 'weird', icon: '🐈', rarity: 'legendary', w: 1, cd: 200,
    title: 'A cat took your chair',
    text: 'A fluffy stray cat keeps sitting in YOUR boss chair. The team calls it "the CEO". 🐈👔',
    choices: [
      { t: '👔 Make the cat official CEO', fx: { fans: 50, team: 12, viral: [3, 10], say: 'Mr. Whiskers, CEO, is now world famous! 🐈👑' } },
      { t: '🐾 Adopt it as office cat', fx: { team: 8, fans: 15, say: 'Best office cat ever. 😻' } }
    ] });

  ev({ id: 'royal_visit', cat: 'weird', icon: '👑', rarity: 'legendary', w: 1, minWeek: 15, cd: 200,
    title: 'A real prince visits!',
    text: 'A REAL prince from a faraway kingdom is visiting your shop! 👑✨',
    choices: [
      { t: '🎺 Roll out the red carpet', fx: { cash: -0.5, fans: 60, rep: 10, say: 'The prince says it was the best visit of his trip! 👑' } },
      { t: '😎 Treat him like everyone', fx: { rep: 5, fans: 25, say: 'He loved being treated normally! 😄' } }
    ] });

  ev({ id: 'ghost', cat: 'weird', icon: '👻', rarity: 'legendary', w: 1, cd: 200,
    title: 'Is the shop HAUNTED? 👻',
    text: 'Staff say things move by themselves at night. Spooky whispers too! 👻',
    choices: [
      { t: '🔦 Start ghost tours!', fx: { extra: [0.3, 8, 'Ghost tours'], fans: 30, say: 'Ghost tours sell out every night! 👻🎟️' } },
      { t: '🧹 Call ghost hunters', fx: { cash: -0.3, team: 5, say: 'It was a raccoon. 🦝 A very dramatic raccoon.' } }
    ] });

  ev({ id: 'meteor', cat: 'weird', icon: '☄️', rarity: 'legendary', w: 1, cd: 200,
    title: 'A METEOR landed outside!',
    text: 'A tiny glowing space rock crashed in your parking lot! ☄️ Scientists are on the way.',
    choices: [
      { t: '💰 Sell it to scientists', fx: { cash: 6, say: 'Space rocks are worth a LOT! 🤑' } },
      { t: '🏛️ Put it on display', fx: { demand: [1.25, 10, 'Meteor display'], fans: 40, say: 'People come from everywhere to see it! ☄️📸' } }
    ] });

  ev({ id: 'dino_bone', cat: 'weird', icon: '🦖', rarity: 'legendary', w: 1, cd: 200,
    title: 'Dinosaur bone found!',
    text: 'Workers fixing your floor found a DINOSAUR BONE underneath! 🦴🦖',
    choices: [
      { t: '🏛️ Give it to a museum', fx: { rep: 15, fans: 40, say: 'The museum named the dinosaur after {company}! 🦖' } },
      { t: '💰 Sell it', fx: { cash: 5, rep: -3, say: 'Rich! But some people think you should have given it away. 🤔' } }
    ] });

  ev({ id: 'superhero', cat: 'weird', icon: '🦸', rarity: 'legendary', w: 1, cd: 200,
    fx: { fans: 40, rep: 6, viral: [2, 6], say: 'Someone in a superhero costume stopped a robbery at {company}! The video is everywhere! 🦸‍♀️' } });

  ev({ id: 'robot_applicant', cat: 'weird', icon: '🤖', rarity: 'legendary', w: 1, minWeek: 10, cd: 200,
    title: 'A robot wants a job!',
    text: 'A shiny robot rolls in. "HELLO. I AM ROBO-3000. I WANT TO WORK HERE." 🤖',
    choices: [
      { t: '🤖 "You\'re hired!"', fx: { hireSpecial: { name: 'Robo 3000', face: '🤖', role: 'front', skill: 95, traits: ['reliable', 'serious'], salaryMult: 0.4 }, fans: 25, say: 'Robo-3000 never gets tired! 🔋' } },
      { t: '🙅 "Humans only!"', fx: { team: 6, say: 'Your team is relieved. 😅' } }
    ] });

  ev({ id: 'rainbow', cat: 'weird', icon: '🌈', rarity: 'epic', w: 1, cd: 100,
    fx: { happy: 10, fans: 20, say: 'A DOUBLE rainbow appeared right over {company}. Everyone took photos! 🌈🌈' } });

  ev({ id: 'twins', cat: 'weird', icon: '👯', rarity: 'epic', w: 1, cd: 100, who: { a: 'any' },
    title: '{a} has a secret twin!',
    text: 'A person who looks EXACTLY like {a} walks in. "Hi! I\'m their twin. Can I work here too?" 👯',
    choices: [
      { t: '👯 Hire the twin!', fx: { fans: 10, run: function (g, c) { var a = G.emp(g, c.a); if (!a) return ''; var t = G.makeEmployee(g, a.role, { name: 'Twin ' + a.name, face: a.face, skill: a.skill, traits: a.traits.slice() }); G.addEmployee(g, t); return 'Now nobody knows who is who. 😂'; } } },
      { t: '🙅 One is enough', fx: { say: 'The twin waves goodbye. 👋' } }
    ] });

  CS.EVENTS = E;
  CS.EV = {};
  E.forEach(function (d) { CS.EV[d.id] = d; });

  // Name shown in the Event Book, with people's names taken out.
  G.bookName = function (d) {
    var t = typeof d.title === 'string' ? d.title : (d.fx && d.fx.say) || (d.fx && d.fx.chance && d.fx.chance.win.say) || d.id;
    return t.replace(/\{[abm]\}/g, 'Someone').replace(/\{rival\}/g, 'A rival').replace(/\{company\}/g, 'Your company')
      .replace(/\{\w+\}/g, '...').split(/[.!?]/)[0].slice(0, 44);
  };
})();
