// All events, part 1: team, business and customers. Parts 2 and 3 live in events-more.js and events-fun.js.
// Every event that asks the player something has exactly 4 responses.
//
// Common fields:
//   id, cat (see CS.CATS), icon, kind, rarity (common|rare|epic|legendary), w (weight), cd (cooldown weeks),
//   minWeek, need (min staff), cond(g), who ({a: 'any'|'<trait>'|'front'|'mgr'|'lowmood'|'star'|'new'|'veteran'|'notmgr', b: ...}),
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
//   raise ['a', pct], teamRaise, teamBonus, bonus 'a', promote 'a', mgr 'a', demote 'a', fire 'a', quit 'a',
//   demand/capacity/supply [value, weeks, label], extra [share, weeks, label], closed [weeks, label],
//   price (+1/-1), equip (permanent speed), rent (permanent), viral [min, max], hire 'cand', hireSpecial {...},
//   pet (emoji), rival (+/- share of that rival's strength), next ['id', minWeeks, maxWeeks, chance],
//   chance { p, win, lose }, say, xp, flag, run(g, c).
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
    busy: function (g) { var h = g.history[g.history.length - 1]; return h && h.demand > h.capacity * 1.08; }
  };
  var rival = H.rival, amt = H.amt, noCams = H.noCams, season = H.season, busy = H.busy;
  var FOOD = H.tag('food'), TECH = H.tag('tech');

  // =====================================================================
  // 👥 TEAM
  // =====================================================================

  ev({ id: 'fight', cat: 'team', icon: '🥊', w: 4, cd: 5, need: 2, who: { a: 'aggressive', b: 'any' },
    title: '{a} and {b} had a big fight!',
    text: 'They yelled at each other in front of customers. 😤 Now they won\'t talk.',
    choices: [
      { t: '🤝 Help them make up', fx: { chance: { p: 0.6, win: { rel: ['a', 'b', 35], team: 2, say: 'They shook hands! 🤗' }, lose: { rel: ['a', 'b', -10], say: 'It didn\'t work. {b} is still angry.', next: ['feud', 1, 2] } } } },
      { t: '🪶 Settle it with a pillow fight', fx: { team: 6, rel: ['a', 'b', 20], say: 'Feathers EVERYWHERE. They laughed so hard they forgot the fight. 🪶😂' } },
      { t: '🚪 Fire {a}', fx: { fire: 'a', say: 'Everyone got the message. No fighting!' } },
      { t: '🙈 Ignore it', fx: { rel: ['a', 'b', -30], next: ['feud', 1, 1], say: 'You hope it goes away...' } }
    ] });

  ev({ id: 'feud', cat: 'team', icon: '🔥', chainOnly: true,
    title: 'The fight got WORSE!',
    text: '{a} and {b} are still fighting. Now the whole team is picking sides. {b} says: "Me or them!"',
    choices: [
      { t: '💵 Give {b} a raise to stay', fx: { raise: ['b', 0.1], a: -6, say: '{b} stays. {a} is jealous.' } },
      { t: '🚪 Fire {a}', fx: { fire: 'a', team: 3, say: 'Peace at last! 😌' } },
      { t: '🏕️ Send them on a camping trip together', fx: { cash: -0.2, chance: { p: 0.6, win: { rel: ['a', 'b', 60], say: 'They got lost in the woods together and came back best friends! 🏕️' }, lose: { rel: ['a', 'b', -20], say: 'They argued about the tent all night. ⛺😤' } } } },
      { t: '👋 Let {b} leave', fx: { quit: 'b', say: '{b} packed up and left.' } }
    ] });

  ev({ id: 'joined_rival', cat: 'rivals', icon: '🕵️', kind: 'news', chainOnly: true,
    title: '{name} now works for {rival}!',
    text: 'Your old worker {name} joined your rival {rival}. They know all your secrets! 😱',
    choices: [
      { t: '📞 Ask {name} to come back', fx: { chance: { p: 0.35, win: { hireSpecial: { role: 'front', skill: 70 }, say: 'They came back! "It was SO boring over there." 😅' }, lose: { say: 'They say they\'re happy there. Hmm.', next: ['idea_stolen', 3, 6, 0.5] } } } },
      { t: '🔐 Change all the secret recipes', fx: { cash: -0.2, say: 'New secrets! Nothing they know works now. 🔐' } },
      { t: '💐 Send a "good luck" gift', fx: { rep: 2, next: ['idea_stolen', 4, 8, 0.25], say: 'Classy move. People noticed. ✨' } },
      { t: '🤷 Whatever', fx: { rival: 0.05, next: ['idea_stolen', 3, 6, 0.6], say: 'You move on. {rival} looks happy though... 😬' } }
    ] });

  ev({ id: 'idea_stolen', cat: 'rivals', icon: '💡', kind: 'news', chainOnly: true,
    title: '{rival} stole your idea!',
    text: '{rival} launched a new product. It was {name}\'s idea when they worked for YOU! Customers are going there.',
    choices: [
      { t: '⚖️ Sue them', fx: { cash: -1.5, chance: { p: 0.5, win: { cash: 4, rep: 3, rival: -0.15, say: 'You WON in court! 🎉' }, lose: { demand: [0.9, 4, 'Rival copied you'], say: 'You lost the case. 😩' } } } },
      { t: '🚀 Make a better version', fx: { cash: -0.8, fans: 12, rival: -0.05, say: 'Yours is better! Customers noticed. 😎' } },
      { t: '😂 Post "Copying is a compliment"', fx: { fans: 15, rep: 2, say: 'Everyone laughed at {rival}. Savage but classy. 🔥' } },
      { t: '🤷 Let it go', fx: { demand: [0.88, 5, 'Rival copied you'], rival: 0.08, say: 'Some customers go to {rival} for a while.' } }
    ] });

  ev({ id: 'late', cat: 'team', icon: '⏰', kind: 'chat', w: 3, who: { a: 'unreliable' }, from: 'a',
    title: '{a} is late again',
    msgs: ['sorry boss 😬', 'overslept AGAIN', 'be there in 20 min!!'],
    choices: [
      { t: '💬 "Is everything okay?"', fx: { chance: { p: 0.5, win: { loyal: { a: 15 }, reliable: { a: 12 }, say: '{a} had problems at home. They promise to do better. ❤️' }, lose: { say: '{a} says thanks... and is late again on Friday. 🙄' } } } },
      { t: '⏰ "I\'m buying you 5 alarm clocks"', fx: { money: -60, reliable: { a: 20 }, a: 4, say: 'RING RING RING RING RING. {a} is never late again. 😂' } },
      { t: '⚠️ "Last warning!"', fx: { reliable: { a: 12 }, a: -10, say: '{a} is on time now. Not happy about it though.' } },
      { t: '🚪 "You\'re fired."', fx: { fire: 'a', say: 'Bye {a}! 👋' } }
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
      { t: '🎁 "How about a big bonus?"', fx: { bonus: 'a', say: '{a} takes the bonus. Not bad! 💰' } },
      { t: '🍕 "Free pizza forever?"', fx: { money: -80, a: 5, say: '{a} thinks about it... and says yes?! 🍕' } },
      { t: '🙊 "Hmm... wait longer?"', fx: { a: -25, loyal: { a: -20 }, next: ['resign', 1, 1, 0.5], say: '{a} is really upset. 😠' } }
    ] });

  ev({ id: 'dating', cat: 'team', icon: '💘', w: 2, need: 3, who: { a: 'any', b: 'any' },
    cond: function (g) { return Object.keys(g.dating).length < 3; },
    title: '{a} and {b} are dating!',
    text: 'Everyone knows. They hold hands in the break room. 🥰 Is that okay?',
    choices: [
      { t: '🎉 "Congrats!"', fx: { date: true, a: 8, b: 8, next: ['breakup', 6, 14, 0.35], say: 'They are so happy! 💕' } },
      { t: '💐 Buy them flowers', fx: { money: -50, date: true, a: 12, b: 12, team: 2, say: 'Cutest couple award goes to... 💐' } },
      { t: '🚫 "No dating at work!"', fx: { a: -12, b: -12, team: -2, say: 'They are sad. They date anyway. 🙃' } },
      { t: '🤐 Stay out of it', fx: { date: true, next: ['breakup', 5, 12, 0.3], say: 'Love is in the air! 💘' } }
    ] });

  ev({ id: 'breakup', cat: 'team', icon: '💔', chainOnly: true, start: { breakup: true },
    title: '{a} and {b} broke up',
    text: 'It ended badly. 💔 They sit far apart and the team picked sides.',
    choices: [
      { t: '📆 Give them different shifts', fx: { cash: -0.05, rel: ['a', 'b', -20], say: 'Out of sight, out of mind.' } },
      { t: '🎳 Team bowling night!', fx: { cash: -0.3, team: 8, say: 'Bowling helped! 🎳' } },
      { t: '🍦 Ice cream for both of them', fx: { money: -20, a: 8, b: 8, say: 'Ice cream fixes broken hearts. A little. 🍦' } },
      { t: '🤷 Let them deal with it', fx: { a: -15, b: -15, rel: ['a', 'b', -60], say: 'The office is freezing cold. 🥶' } }
    ] });

  ev({ id: 'resign', cat: 'team', icon: '📝', chainOnly: true,
    title: '{a} wants to quit!',
    text: '{a} gives you a letter. "I found a better job. Bye!" 😢',
    choices: [
      { t: '💰 Offer 20% more money', fx: { chance: { p: function (g, c) { var e = G.emp(g, c.a); return e && G.has(e, 'loyal') ? 0.9 : 0.6; }, win: { raise: ['a', 0.2], a: 30, say: '{a} rips up the letter! 🎉' }, lose: { quit: 'a', say: '{a} already said yes to the new job.' } } } },
      { t: '💬 Ask what\'s wrong', fx: { chance: { p: 0.35, win: { a: 30, loyal: { a: 10 }, say: 'You talked it out. {a} will stay! 🤗' }, lose: { quit: 'a', say: '{a} was unhappy for a long time. They leave.' } } } },
      { t: '🥺 Beg dramatically on your knees', fx: { chance: { p: 0.45, win: { a: 25, team: 3, say: '{a} laughed so hard they decided to stay! 😂' }, lose: { quit: 'a', say: '{a} filmed it... and still left. 🎥' } } } },
      { t: '👋 "Good luck!"', fx: { quit: 'a', say: '{a} leaves on good terms.' } }
    ] });

  ev({ id: 'jealous', cat: 'team', icon: '😒', chainOnly: true,
    title: '{a} is jealous!',
    text: '{a} is mad that {b} got promoted instead of them. "Not fair!" 😤',
    choices: [
      { t: '💬 Explain why', fx: { chance: { p: 0.55, win: { say: '{a} understands. Phew.' }, lose: { a: -10, rel: ['a', 'b', -25], say: '{a} doesn\'t believe you.' } } } },
      { t: '🤞 "You\'re next!"', fx: { a: 8, next: ['promotion_request', 6, 12], say: '{a} will hold you to that!' } },
      { t: '🏅 Give {a} a funny title', fx: { a: 6, say: '{a} is now "Chief Vibes Officer". They love it. 😎' } },
      { t: '😑 "Get over it"', fx: { a: -18, loyal: { a: -10 }, rel: ['a', 'b', -35], say: '{a} slams the door. 🚪💥' } }
    ] });

  ev({ id: 'theft', cat: 'team', icon: '🫳', w: 2, minWeek: 4, who: { a: 'greedy' }, cond: noCams, init: amt(0.15), start: { cash: -0.15 },
    title: 'Money is missing! 😱',
    text: '{amt} is gone from the cash register. The camera is blurry... but it looks like {a}!',
    choices: [
      { t: '🔍 Ask {a} about it', fx: { chance: { p: function (g, c) { var e = G.emp(g, c.a); return e && G.has(e, 'greedy') ? 0.85 : 0.3; }, win: { fire: 'a', cash: 0.07, say: '{a} said sorry and paid half back. You fired them.' }, lose: { a: -20, loyal: { a: -20 }, say: 'It wasn\'t {a}! They are very hurt. 😢' } } } },
      { t: '✨ Set a glitter trap', fx: { chance: { p: 0.6, win: { fire: 'a', team: 4, say: 'The next day {a} was COVERED in glitter. Caught! ✨😂' }, lose: { team: -2, say: 'The only person covered in glitter... was you. ✨🤦' } } } },
      { t: '📹 Buy better cameras', fx: { cash: -0.2, say: 'No more missing money! Probably.' } },
      { t: '🤷 Forget it', fx: { next: ['theft_again', 3, 6, 0.5], say: 'You let it go.' } }
    ] });

  ev({ id: 'theft_again', cat: 'team', icon: '🫳', chainOnly: true, start: { cash: -0.3 },
    title: 'MORE money is missing!',
    text: 'The thief is back. Letting it go last time was a mistake. 😬',
    choices: [
      { t: '📹 Buy cameras NOW', fx: { cash: -0.2, say: 'Nobody will steal again. 📹' } },
      { t: '🐕 Get a guard dog', fx: { cash: -0.1, pet: '🐕', team: 3, say: 'Meet Tank, the guard dog. He is a very good boy. 🐕' } },
      { t: '👮 Call the police', fx: { rep: 1, team: -3, say: 'The police are looking into it. Everyone is nervous.' } },
      { t: '🔒 Lock the register', fx: { money: -40, say: 'Click. Should have done that from the start. 🔒' } }
    ] });

  ev({ id: 'spy', cat: 'rivals', icon: '🕵️', w: 1.5, minWeek: 8, need: 4, rarity: 'rare', who: { a: 'greedy', b: 'any' }, init: rival,
    title: '{a} is a SPY! 🕵️',
    text: '{b} found secret messages. {a} is sending your plans to {rival}!',
    choices: [
      { t: '🚪 Fire them right now', fx: { fire: 'a', loyal: { b: 10 }, say: 'Security walks {a} out. 👮' } },
      { t: '🎭 Send them FAKE plans', fx: { chance: { p: 0.6, win: { fans: 15, fire: 'a', rival: -0.15, say: '{rival} fell for it and wasted tons of money! 😂 Then you fired {a}.' }, lose: { demand: [0.9, 4, 'Plans leaked'], say: '{rival} figured it out. 😩' } } } },
      { t: '🔄 Make {a} a DOUBLE agent', fx: { chance: { p: 0.5, win: { rival: -0.2, a: 10, say: '{a} now spies on {rival} for YOU! 🕵️🕵️' }, lose: { rival: 0.1, quit: 'a', say: '{a} ran off to {rival}. Triple agent?! 😵' } } } },
      { t: '🏅 Fire them + reward {b}', fx: { bonus: 'b', fire: 'a', team: 3, say: 'Everyone sees that honesty pays! ✨' } }
    ] });

  ev({ id: 'broke_equipment', cat: 'team', icon: '💥', w: 3, who: { a: 'front' }, init: amt(0.35),
    title: '{a} broke something expensive!',
    text: 'CRASH! 💥 {a} dropped an important machine. A new one costs {amt}.',
    choices: [
      { t: '💳 Company pays', fx: { cash: -0.35, loyal: { a: 8 }, say: 'Accidents happen. {a} is thankful. 🙏' } },
      { t: '🧾 {a} pays half', fx: { cash: -0.17, a: -20, say: '{a} pays. They are NOT happy.' } },
      { t: '🩹 Fix it with duct tape', fx: { chance: { p: 0.5, win: { say: 'It WORKS! Duct tape fixes everything. 🩹😎' }, lose: { capacity: [0.85, 3, 'Duct-taped machine'], say: 'It works... badly. 🐢' } } } },
      { t: '🔧 Work without it', fx: { capacity: [0.85, 3, 'Broken machine'], say: 'Work is slower for 3 weeks. 🐢' } }
    ] });

  ev({ id: 'customer_argument', cat: 'team', icon: '🗯️', w: 3, who: { a: 'aggressive' },
    title: '{a} yelled at a customer!',
    text: 'A rude customer yelled at {a}. {a} yelled back! People were filming. 📱',
    choices: [
      { t: '🛡️ Stand up for {a}', fx: { a: 10, loyal: { a: 10 }, rep: -2, next: ['complaint_viral', 1, 1, 0.35], say: 'Your team loves you. The customer posts an angry review.' } },
      { t: '🙏 Say sorry to the customer', fx: { a: -8, rep: 1, say: 'The customer is happy. {a} feels bad.' } },
      { t: '🧘 Send {a} to a calm-down class', fx: { cash: -0.08, reliable: { a: 5 }, say: '{a} now says "woosah" before every sentence. 🧘' } },
      { t: '🚪 Fire {a}', fx: { fire: 'a', rep: 1, say: 'The customer is happy. The team is nervous. 😬' } }
    ] });

  ev({ id: 'star', cat: 'team', icon: '🌟', w: 3, who: { a: 'star' },
    title: '{a} is a superstar!',
    text: '{a} is doing the work of TWO people! Customers ask for {a} by name. 🤩',
    choices: [
      { t: '💰 Give a bonus', fx: { bonus: 'a', say: '{a} is beaming! 😁' } },
      { t: '🎖️ Promote {a}', fx: { promote: 'a', say: 'Congrats {a}! 🎉' } },
      { t: '🖼️ Hang their photo on the wall', fx: { a: 8, team: 2, fans: 3, say: '"Worker of the Month: {a}" Everyone wants to be next! 🖼️' } },
      { t: '👏 Say "Great job!"', fx: { a: 4, say: '{a} smiles.' } }
    ] });

  ev({ id: 'promotion_request', cat: 'team', icon: '🪜', kind: 'chat', w: 2, minWeek: 6, who: { a: 'ambitious' }, from: 'a',
    title: '{a} wants a promotion',
    msgs: ['boss, can we talk? 🙂', 'I want to move up', 'I\'m ready for more!'],
    choices: [
      { t: '🎖️ "You got it!"', fx: { promote: 'a', next: ['out_of_depth', 2, 5, 0.25], say: '{a} got promoted! 🥳' } },
      { t: '📚 "Take a course first"', fx: { cash: -0.15, skill: { a: 8 }, a: 4, say: '{a} learned a lot! Skill +8 📈' } },
      { t: '🎯 "Beat a challenge first!"', fx: { chance: { p: 0.5, win: { promote: 'a', skill: { a: 3 }, say: '{a} crushed the challenge and got the promotion! 🏆' }, lose: { a: -5, say: '{a} almost did it. Next time! 💪' } } } },
      { t: '⏳ "Not yet"', fx: { a: -12, next: ['resign', 3, 8, 0.3], say: '{a} is disappointed. 😔' } }
    ] });

  ev({ id: 'out_of_depth', cat: 'boss', icon: '🫠', chainOnly: true,
    title: '{a} is struggling',
    text: 'Since the promotion, {a} is confused and making mistakes. 😵',
    choices: [
      { t: '🧑‍🏫 Get {a} a coach', fx: { cash: -0.2, skill: { a: 12 }, say: '{a} is getting better every day! 💪' } },
      { t: '🤝 Give {a} a buddy', fx: { team: 2, skill: { a: 6 }, say: 'Teamwork makes the dream work! 🤝' } },
      { t: '⬇️ Move {a} back down', fx: { demote: 'a', say: 'Awkward... but it helps.' } },
      { t: '⏳ Give it time', fx: { team: -4, capacity: [0.93, 4, 'Team confused'], say: 'Things are a bit messy for a while.' } }
    ] });

  ev({ id: 'rumors', cat: 'team', icon: '🗣️', w: 2, need: 3, who: { a: 'any', b: 'any' },
    title: '{a} is spreading rumors',
    text: '{a} is telling everyone that {b} will be fired soon. It\'s not true! {b} is upset. 😢',
    choices: [
      { t: '📣 Tell everyone the truth', fx: { b: 10, a: -6, say: 'Rumor stopped! {b} feels better.' } },
      { t: '🤫 Talk to {a} alone', fx: { rel: ['a', 'b', 5], say: '{a} promises to stop.' } },
      { t: '🪴 Start a FUNNY rumor instead', fx: { team: 5, say: 'Now everyone thinks the office plant is a secret millionaire. 🪴💰' } },
      { t: '🙈 Ignore it', fx: { b: -15, rel: ['a', 'b', -30], say: 'The rumor keeps growing... 😬' } }
    ] });

  ev({ id: 'best_friends', cat: 'team', icon: '🫶', w: 2, need: 2, who: { a: 'friendly', b: 'any' },
    title: '{a} and {b} are BEST friends!',
    text: 'They eat lunch together, laugh all day and even wear matching socks. 🧦🧦',
    choices: [
      { t: '👯 Let them work together', fx: { rel: ['a', 'b', 50], capacity: [1.05, 3, 'Best-friend teamwork'], say: 'They work faster together! 🚀' } },
      { t: '🧦 Matching socks for EVERYONE', fx: { money: -60, team: 6, say: 'The whole team is a sock family now. 🧦❤️' } },
      { t: '📸 Post a friendship photo', fx: { fans: 6, rel: ['a', 'b', 40], say: 'Everyone loves a friendship story! 📸' } },
      { t: '😐 Split them up (too much chatting)', fx: { a: -8, b: -8, capacity: [1.03, 2, 'Less chatting'], say: 'Less talking, a bit more work.' } }
    ] });

  ev({ id: 'hot_streak', cat: 'team', icon: '📈', w: 2, who: { a: 'front' },
    title: '{a} found a secret trick!',
    text: '{a} figured out a way to work twice as fast. "It\'s all in the wrist!" 🚀',
    choices: [
      { t: '📚 Teach it to everyone', fx: { capacity: [1.08, 4, 'Secret trick'], skill: { a: 3 }, say: 'Everyone is faster now! 🚀' } },
      { t: '💰 Pay {a} for the idea', fx: { bonus: 'a', equip: 0.02, say: 'Now it\'s company magic forever. ✨' } },
      { t: '🏁 Make it a speed contest', fx: { team: 5, capacity: [1.05, 2, 'Speed contest'], say: 'Speed contest! Everyone is racing. 🏁' } },
      { t: '👍 Nice, keep going', fx: { skill: { a: 3 }, say: '{a} keeps crushing it. Skill +3!' } }
    ] });

  ev({ id: 'team_quit_threat', cat: 'team', icon: '🪧', w: function (g) { return G.avgMorale(g) < 42 ? 6 : 0; }, cd: 10, need: 4,
    title: 'The team is angry!',
    text: 'Your workers say they will ALL quit if things don\'t get better. 😡',
    choices: [
      { t: '💵 Everyone gets +5%', fx: { teamRaise: 0.05, say: 'Crisis over! Everyone is happier. 😌' } },
      { t: '🎁 Everyone gets a bonus', fx: { teamBonus: true, team: 5, say: 'Money helps! 💸' } },
      { t: '🛝 Buy a slide for the office', fx: { cash: -0.6, team: 14, say: 'Nobody is angry on a SLIDE! 🛝😂' } },
      { t: '😤 "Go ahead, quit!"', fx: { run: function (g) { var gone = []; g.employees.slice().forEach(function (e) { if (e.morale < 40 && U.chance(0.35)) { gone.push(G.first(e)); G.removeEmp(g, e, 'quit', true); } }); return gone.length ? gone.join(', ') + ' walked out! 🚶🚶' : 'Nobody left... this time.'; } } }
    ] });

  ev({ id: 'day_off', cat: 'team', icon: '💒', kind: 'chat', w: 3, who: { a: 'any' }, from: 'a',
    title: '{a} needs a day off',
    msgs: ['hi boss!! 😊', 'my sister is getting married on friday 💒', 'can I have the day off? 🙏'],
    choices: [
      { t: '🎉 "Of course! Have fun!"', fx: { a: 12, loyal: { a: 8 }, capacity: [0.97, 1, 'Someone on a day off'], say: '{a} sends you a wedding cake photo! 🎂' } },
      { t: '🎁 "Take a gift from us!"', fx: { money: -80, a: 18, loyal: { a: 12 }, say: 'The bride LOVED the gift. {a} is so proud. 💝' } },
      { t: '🕐 "Half a day?"', fx: { a: -3, say: '{a} runs to the wedding in work clothes. 🏃💒' } },
      { t: '😐 "Sorry, we\'re too busy"', fx: { a: -15, loyal: { a: -10 }, say: '{a} is very sad. 😞' } }
    ] });

  ev({ id: 'sick', cat: 'team', icon: '🤒', kind: 'chat', w: 3, who: { a: 'any' }, from: 'a',
    title: '{a} feels sick',
    msgs: ['boss I feel terrible 🤒', 'achoo!! 🤧', 'can I stay home?'],
    choices: [
      { t: '🛌 "Stay home and rest!"', fx: { loyal: { a: 6 }, capacity: [0.96, 1, 'Someone is sick'], say: '{a} gets better fast. 💚' } },
      { t: '🍲 "I\'ll send you soup!"', fx: { money: -25, a: 10, loyal: { a: 10 }, say: 'Best boss ever! The soup worked. 🍲' } },
      { t: '💻 "Work from bed?"', fx: { a: -5, say: '{a} answers emails in pajamas. 🤧💻' } },
      { t: '😬 "Come in anyway"', fx: { chance: { p: 0.5, win: { a: -8, say: '{a} came in. They look awful. 🥴' }, lose: { team: -5, capacity: [0.85, 2, 'Half the team is sick'], say: 'Now HALF the team is sick! 🤧🤧🤧' } } } }
    ] });

  ev({ id: 'idea', cat: 'team', icon: '💡', kind: 'chat', w: 2, who: { a: 'creative' }, from: 'a',
    init: function (g, c) { c.thing = U.pick(['a glow-in-the-dark menu', 'a secret menu', 'a loyalty card with stickers', 'rainbow packaging', 'a mascot costume', 'a late-night opening', 'a pet-friendly day']); },
    title: '{a} has an idea!',
    msgs: ['BOSS 💡💡💡', 'what if we tried {thing}?!', 'trust me it will be amazing'],
    choices: [
      { t: '🚀 "Let\'s try it!"', fx: { cash: -0.5, a: 10, chance: { p: 0.55, win: { demand: [1.15, 6, 'Great new idea'], fans: 10, say: 'Customers LOVE it! 🤩' }, lose: { say: 'Nobody cared. Oh well! 🤷' } } } },
      { t: '🧪 "Test it for one day"', fx: { cash: -0.1, chance: { p: 0.5, win: { demand: [1.07, 4, 'Small new idea'], say: 'The test worked! 👍' }, lose: { say: 'The test flopped, but it was cheap. 😅' } } } },
      { t: '🤪 "Make it even CRAZIER!"', fx: { cash: -0.6, chance: { p: 0.35, win: { viral: [1, 4], fans: 15, say: 'It was SO crazy it went viral! 🤯' }, lose: { rep: -2, say: 'Too crazy. People were confused. 😵' } } } },
      { t: '🙅 "Maybe later"', fx: { a: -6, say: '{a} writes it in their notebook anyway. 📓' } }
    ] });

  ev({ id: 'training_request', cat: 'team', icon: '📚', kind: 'chat', w: 2, who: { a: 'ambitious' }, from: 'a',
    title: '{a} wants to learn',
    msgs: ['there\'s a cool course online 📚', 'can the company pay for it?', 'I\'ll get way better!'],
    choices: [
      { t: '✅ "Yes, go for it!"', fx: { cash: -0.15, skill: { a: 10 }, a: 8, say: '{a} learned so much! Skill +10 🧠' } },
      { t: '👥 "Take the whole team!"', fx: { cash: -0.5, run: function (g) { g.employees.forEach(function (e) { e.skill += 4; }); return 'Everyone got smarter! Skill +4 for all. 🎓'; } } },
      { t: '📺 "Watch free videos instead"', fx: { skill: { a: 3 }, say: '{a} learned a bit from videos. 📺' } },
      { t: '❌ "Too expensive"', fx: { a: -6, say: '{a} is a bit disappointed.' } }
    ] });

  ev({ id: 'pizza_party', cat: 'team', icon: '🍕', kind: 'chat', w: 2, need: 3, who: { a: 'friendly' }, from: 'a',
    title: 'Pizza party?',
    msgs: ['boss!! 🍕', 'the team worked super hard this month', 'pizza party??? pleeeease'],
    choices: [
      { t: '🍕 "PIZZA TIME!"', fx: { cash: -0.08, team: 8, say: 'Best Friday ever! 🍕🎉' } },
      { t: '🎮 "Pizza AND video games!"', fx: { cash: -0.2, team: 14, say: 'Pizza AND video games?! Legendary. 🎮🍕' } },
      { t: '🥗 "How about salad?"', fx: { team: -2, say: 'The team laughs... a little sadly. 🥗' } },
      { t: '❌ "Nope"', fx: { team: -4, say: 'Everybody is a bit disappointed.' } }
    ] });

  ev({ id: 'overworked', cat: 'team', icon: '😩', kind: 'chat', w: 5, cond: busy, who: { a: 'front' }, from: 'a',
    title: 'The team is exhausted',
    msgs: ['boss we are SO busy 😩', 'there are too many customers!', 'we need more people!!'],
    choices: [
      { t: '⏰ Pay for extra hours', fx: { cash: -0.3, capacity: [1.15, 2, 'Extra hours'], say: 'More work gets done! 💪' } },
      { t: '👔 "I\'ll help out myself!"', fx: { capacity: [1.08, 1, 'Boss helping'], team: 6, say: 'The boss is working too! Everyone cheers. 👔💪' } },
      { t: '🤝 "I\'ll hire more soon!"', fx: { team: -2, say: 'Tip: Go to the Team tab to hire people!' } },
      { t: '😤 "Just work harder!"', fx: { team: -8, capacity: [1.05, 1, 'Pushing hard'], say: 'They work harder... and grumble. 😒' } }
    ] });

  ev({ id: 'anniversary', cat: 'team', icon: '🎂', w: 1, who: { a: 'veteran' },
    title: '{a}\'s 1-year work birthday!',
    text: '{a} has worked here for over a year! 🎉',
    choices: [
      { t: '🎂 Cake for everyone!', fx: { money: -60, a: 8, team: 3, say: 'Happy work birthday, {a}! 🎂' } },
      { t: '💰 Loyalty bonus', fx: { bonus: 'a', loyal: { a: 10 }, say: '{a} feels super valued. 💖' } },
      { t: '🏆 Give a golden trophy', fx: { money: -40, a: 10, say: 'The trophy says "Legend". {a} cried a little. 🏆' } },
      { t: '👍 Say congrats', fx: { a: 3, say: '"Thanks boss!" 😊' } }
    ] });

  ev({ id: 'talent_show', cat: 'team', icon: '🎤', w: 1.5, need: 3, who: { a: 'funny' },
    title: 'Talent show?',
    text: 'The team wants to do a talent show after work! 🎤',
    choices: [
      { t: '🎭 Let\'s do it!', fx: { cash: -0.05, team: 6, chance: { p: 0.35, win: { viral: [0.5, 2], say: '{a} did an AMAZING magic trick. Someone posted it! 🪄' }, lose: { say: 'Everyone had fun! 🎉' } } } },
      { t: '🎟️ Sell tickets to customers', fx: { team: 4, extra: [0.08, 1, 'Talent show tickets'], fans: 6, say: 'Customers paid to watch! 🎟️' } },
      { t: '🕺 YOU perform too!', fx: { team: 10, chance: { p: 0.5, win: { fans: 12, say: 'Your dance moves were... unforgettable. 🕺🔥' }, lose: { team: -3, say: 'You fell off the stage. Everyone clapped anyway. 😅' } } } },
      { t: '🙅 Not at work', fx: { team: -3, say: 'Maybe next time.' } }
    ] });

  ev({ id: 'secret_skill', cat: 'team', icon: '🤹', w: 1.5, who: { a: 'any' },
    init: function (g, c) { c.skillx = U.pick(['can juggle 6 balls', 'speaks 5 languages', 'is a chess champion', 'was a child actor', 'can draw amazing portraits', 'can beatbox']); },
    title: '{a} has a secret talent!',
    text: 'Fun fact: {a} {skillx}! 🤩',
    choices: [
      { t: '🎪 Show it to customers', fx: { fans: 8, a: 5, say: 'Customers LOVE it! 👏' } },
      { t: '🎥 Film it for social media', fx: { chance: { p: 0.3, win: { viral: [0.5, 2], say: 'The video went viral! 🔥' }, lose: { fans: 5, say: 'A nice little video. 📱' } } } },
      { t: '🎩 Make it {a}\'s job title', fx: { a: 8, say: '{a} is now "Official Office Entertainer". 🎩' } },
      { t: '😄 Cool!', fx: { a: 2, say: 'Nice to know! 😄' } }
    ] });

  ev({ id: 'phone_addict', cat: 'team', icon: '📱', w: 2, who: { a: 'lazy' },
    title: '{a} is always on their phone',
    text: 'Every time you look, {a} is scrolling videos. 📱😴',
    choices: [
      { t: '📵 No phones at work!', fx: { team: -3, capacity: [1.05, 4, 'No phones rule'], say: 'Work gets faster. People miss their phones.' } },
      { t: '💬 Talk to {a}', fx: { chance: { p: 0.5, win: { reliable: { a: 10 }, say: '{a} puts the phone away. 👍' }, lose: { say: '{a} just hides it better now. 🙄' } } } },
      { t: '📱 Make {a} run your social media', fx: { fans: 10, a: 8, say: '{a} is GREAT at it! Finally, useful scrolling. 📱🔥' } },
      { t: '🤷 Ignore it', fx: { capacity: [0.97, 3, 'Phone scrolling'], say: 'A little slower... but whatever.' } }
    ] });

  ev({ id: 'mentor', cat: 'team', icon: '🧑‍🏫', w: 1.5, need: 3, who: { a: 'star', b: 'any' },
    title: '{a} wants to teach {b}',
    text: '{a} is really good at the job. They want to teach {b} their tricks. It will slow {a} down a bit.',
    choices: [
      { t: '👍 Great idea!', fx: { skill: { b: 10 }, rel: ['a', 'b', 25], capacity: [0.97, 2, 'Training time'], say: '{b} learned a lot! Skill +10 🎓' } },
      { t: '🏫 Start a mini school for everyone', fx: { cash: -0.2, run: function (g) { g.employees.forEach(function (e) { e.skill += 3; }); return 'The company school is open! Everyone +3 skill. 🏫'; } } },
      { t: '💰 Pay {a} extra to teach', fx: { raise: ['a', 0.05], skill: { b: 12 }, say: 'Best teacher ever! 🍎' } },
      { t: '🙅 {a} should just work', fx: { a: -5, say: 'Okay...' } }
    ] });

  ev({ id: 'poached', cat: 'rivals', icon: '🎣', w: 2, minWeek: 8, who: { a: 'star' }, init: rival,
    title: '{rival} wants to steal {a}!',
    text: '{rival} offered {a} 30% more money. {a} came to you first. 😬',
    choices: [
      { t: '💰 Match the offer', fx: { raise: ['a', 0.3], loyal: { a: 15 }, say: '{a} stays! 🙌' } },
      { t: '❤️ "We\'re a family!"', fx: { chance: { p: function (g, c) { var e = G.emp(g, c.a); return e && e.loyalty > 60 ? 0.8 : 0.3; }, win: { loyal: { a: 5 }, say: '{a} says no to {rival}! 🥹' }, lose: { quit: 'a', rival: 0.05, say: '{a} goes to {rival}. 😢' } } } },
      { t: '🎖️ Promote {a} instead', fx: { promote: 'a', loyal: { a: 10 }, say: 'A promotion beats more money! {a} stays. 🎖️' } },
      { t: '👋 Let {a} go', fx: { quit: 'a', rival: 0.05, say: '{a} leaves for {rival}.' } }
    ] });

  ev({ id: 'lottery_win', cat: 'team', icon: '🎰', w: 0.6, rarity: 'rare', who: { a: 'any' },
    title: '{a} won the lottery! 🎰',
    text: '{a} won $2 million! They are screaming and dancing on the tables. 💃',
    choices: [
      { t: '🥳 Throw a party for {a}', fx: { cash: -0.1, team: 8, chance: { p: 0.6, win: { quit: 'a', say: '{a} retires to a beach. They send a thank-you postcard. 🏖️' }, lose: { a: 20, say: '{a} decides to stay! "I love this job!" 🥹' } } } },
      { t: '💼 Ask {a} to invest in the company', fx: { chance: { p: 0.5, win: { cash: 3, say: '{a} invests! Cha-ching! 💰' }, lose: { quit: 'a', say: '{a} laughs and quits. 😂' } } } },
      { t: '🍕 "Buy everyone pizza?"', fx: { team: 12, say: '{a} bought pizza for the WHOLE street. Legend. 🍕🍕🍕' } },
      { t: '😐 "Back to work, please"', fx: { a: -5, chance: { p: 0.5, win: { say: '{a} shrugs and keeps working. Rich AND humble. 😎' }, lose: { quit: 'a', say: '{a} quit on the spot. 💸👋' } } } }
    ] });

  ev({ id: 'nap_pod', cat: 'team', icon: '😴', kind: 'chat', w: 1.5, who: { a: 'lazy' }, from: 'a',
    title: '{a} has a suggestion',
    msgs: ['boss hear me out 🙏', 'NAP PODS', 'we\'d work way better after a nap 😴'],
    choices: [
      { t: '😴 "Buy nap pods!"', fx: { cash: -0.4, team: 6, capacity: [1.04, 8, 'Well rested team'], say: 'Everyone is so rested! 😌' } },
      { t: '🛋️ "One beanbag chair."', fx: { money: -90, team: 3, say: 'There is now a line for the beanbag. 😂' } },
      { t: '☕ "Drink coffee instead"', fx: { a: -3, say: '{a} sighs and grabs a coffee.' } },
      { t: '😂 "Nice try"', fx: { team: 1, say: 'It was worth a shot. 😴' } }
    ] });

  ev({ id: 'new_worker_great', cat: 'team', icon: '🐣', w: 2, who: { a: 'new' },
    title: 'New worker {a} is amazing!',
    text: '{a} just started, and everyone already loves them. 🐣✨',
    choices: [
      { t: '🎉 Welcome party!', fx: { money: -50, a: 10, team: 3, say: 'Welcome to the family, {a}! 🎉' } },
      { t: '🧑‍🏫 Give extra training', fx: { cash: -0.05, skill: { a: 8 }, say: '{a} is learning fast! 📈' } },
      { t: '🏷️ Give a cool nickname', fx: { a: 6, say: 'Everyone calls {a} "The Rookie" now. 😎' } },
      { t: '👍 Great!', fx: { a: 3, say: 'Good hire! 👍' } }
    ] });

  ev({ id: 'secret_santa', cat: 'team', icon: '🎁', w: 3, need: 3, cd: 50, cond: season(48, 52),
    title: 'Holiday gift swap! 🎁',
    text: 'The team wants to do a holiday gift swap. Should the company add a gift for everyone?',
    choices: [
      { t: '🎁 Yes! Gifts for all', fx: { cash: -0.2, team: 10, say: 'Everyone loves their gift! 🎄' } },
      { t: '🎅 Dress up as Santa', fx: { cash: -0.05, team: 8, fans: 6, say: 'Ho ho ho! Customers took photos with Santa Boss. 🎅' } },
      { t: '🎄 Just the swap', fx: { team: 4, say: '{company} has the best holiday vibes. ✨' } },
      { t: '💸 Holiday bonus instead', fx: { teamBonus: true, say: 'Money! The best gift. 💸' } }
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
      { t: '🏄 Turn it into a pool party', fx: { cash: -0.3, fans: 15, team: 5, say: 'SPLASH DAY! Then you fixed it. 🏄💦' } },
      { t: '🔒 Close a week, fix it right', fx: { cash: -0.3, closed: [1, 'Closed for repairs'], say: 'You are closed next week.' } }
    ] });

  ev({ id: 'flood_again', cat: 'business', icon: '🌊', chainOnly: true, start: { cash: -0.5 },
    title: 'FLOOD, PART 2! 🌊🌊',
    text: 'The cheap fix broke! Even MORE water this time!',
    choices: [
      { t: '🚨 Call the BEST plumber', fx: { cash: -0.6, say: 'Fixed for real this time. 🔧✅' } },
      { t: '🦆 Rubber ducks for everyone', fx: { money: -50, fans: 10, demand: [0.85, 1, 'Flood'], say: 'Customers floated rubber ducks. It went a bit viral. 🦆' } },
      { t: '🔒 Close for a week', fx: { closed: [1, 'Flood repairs'], say: 'Closed while it dries.' } },
      { t: '🪣 Everyone grab a bucket!', fx: { team: -4, demand: [0.8, 1, 'Flood damage'], say: 'Bucket brigade! Tiring but it worked. 🪣' } }
    ] });

  ev({ id: 'power_outage', cat: 'business', icon: '🔌', w: 2,
    title: 'The power went out!',
    text: 'The whole street is dark. 🌑 No lights, no machines.',
    choices: [
      { t: '⚡ Rent a generator', fx: { cash: -0.12, say: 'You are the only shop with lights! 💡' } },
      { t: '🕯️ Candlelight special!', fx: { money: -40, fans: 8, happy: 3, say: 'Super cozy. Customers LOVED it. 🕯️' } },
      { t: '🔦 Flashlight party', fx: { team: 5, demand: [0.9, 1, 'Power outage'], say: 'Shadow puppets all afternoon! 🔦🐰' } },
      { t: '🏠 Send everyone home', fx: { demand: [0.85, 1, 'Power outage'], team: 3, say: 'Fewer sales. Staff enjoyed the free time!' } }
    ] });

  ev({ id: 'equipment_fail', cat: 'business', icon: '🛠️', w: 2.5,
    title: 'A machine broke!',
    text: 'Your most important machine stopped working. 😩',
    choices: [
      { t: '🔧 Repair it', fx: { cash: -0.2, say: 'Good as new!' } },
      { t: '✨ Buy a better one', d: 'Work faster forever', fx: { cash: -1.2, equip: 0.04, say: 'New machine! Everyone works faster! 🚀' } },
      { t: '👊 Give it a smack', fx: { chance: { p: 0.4, win: { say: 'BONK. It works again! 👊😎' }, lose: { cash: -0.3, say: 'BONK. Now it\'s REALLY broken. 😬' } } } },
      { t: '🐢 Work without it', fx: { capacity: [0.85, 2, 'Broken machine'], say: 'Slow weeks ahead...' } }
    ] });

  ev({ id: 'break_in', cat: 'business', icon: '🚨', w: 1.5, minWeek: 5, cond: noCams, init: amt(0.4), start: { cash: -0.4 },
    title: 'Someone broke in!',
    text: 'A thief broke in at night and took {amt} of stuff! 😱',
    choices: [
      { t: '🚨 Buy an alarm', fx: { cash: -0.3, say: 'Nobody will get in again! 🔒' } },
      { t: '📄 Ask insurance to pay', fx: { chance: { p: 0.6, win: { cash: 0.28, say: 'Insurance paid you back! 🙌' }, lose: { say: 'Insurance said no. Tiny print. 😑' } } } },
      { t: '🕵️ Play detective', fx: { chance: { p: 0.4, win: { cash: 0.3, rep: 3, fans: 8, say: 'You found the thief with a magnifying glass! 🔍 The news loved it.' }, lose: { say: 'You found... a sock. No thief. 🧦' } } } },
      { t: '🐕 Get a guard dog', fx: { cash: -0.1, pet: '🐕', say: 'Meet Rex! 🐕 Nobody will try that again.' } }
    ] });

  ev({ id: 'damaged_shipment', cat: 'business', icon: '📦', w: 2.5, init: amt(0.18),
    title: 'A delivery arrived smashed!',
    text: 'Half of this week\'s supplies are squished. 📦💥 They cost {amt}.',
    choices: [
      { t: '📞 Ask for a refund', fx: { chance: { p: 0.6, win: { say: 'The supplier said sorry and paid you back! 👍' }, lose: { cash: -0.18, say: 'They blamed the truck driver. You pay.' } } } },
      { t: '🎨 Sell it as "squished edition"', fx: { chance: { p: 0.5, win: { fans: 10, say: 'People LOVED the squished stuff! 😂' }, lose: { cash: -0.18, rep: -1, say: 'Nobody wanted squished stuff. 🥴' } } } },
      { t: '🔁 Switch delivery company', fx: { cash: -0.18, supply: [-0.01, 6, 'Better delivery'], say: 'The new company is careful AND cheaper. 🚚' } },
      { t: '🤷 Accept it', fx: { cash: -0.18, say: 'Oh well.' } }
    ] });

  ev({ id: 'supplier_prices', cat: 'business', icon: '🚚', kind: 'chat', w: 2, from: { name: 'Sam from Supplies', face: '🚚' },
    title: 'Your supplier has news',
    msgs: ['hello! 👋', 'bad news...', 'our prices go up 5% starting today 😬'],
    choices: [
      { t: '👌 "Okay, fine"', fx: { supply: [0.02, 12, 'Higher supply prices'], say: 'You make a bit less on each sale for a while.' } },
      { t: '🔄 Find a new supplier', fx: { chance: { p: 0.6, win: { supply: [-0.015, 12, 'Cheaper supplier'], say: 'The new one is CHEAPER! 🎉' }, lose: { supply: [0.01, 6, 'New supplier'], rep: -2, say: 'The new one is worse. Customers noticed. 😕' } } } },
      { t: '🤝 "Let\'s negotiate"', fx: { chance: { p: 0.5, win: { say: 'Sam agrees to keep the old price! 🤝' }, lose: { supply: [0.03, 8, 'Angry supplier'], say: 'Sam got annoyed and raised prices MORE. 😤' } } } },
      { t: '🍪 Send Sam cookies', fx: { money: -30, chance: { p: 0.6, win: { say: 'Sam loved the cookies. "Fine, old price." 🍪❤️' }, lose: { supply: [0.02, 12, 'Higher supply prices'], say: 'Sam ate the cookies AND raised prices. 😑' } } } }
    ] });

  ev({ id: 'inspection', cat: 'business', icon: '📋', w: 2, cd: 15,
    title: 'Surprise inspection!',
    text: 'A city inspector walks in with a clipboard. 📋 They want to check everything.',
    choices: [
      { t: '✅ Show them everything', fx: { chance: { p: function (g) { return g.reputation / 200 + (g.employees.some(function (e) { return e.role === 'mgr'; }) ? 0.3 : 0.15) + 0.15; }, win: { rep: 3, say: 'You passed! Perfect score! 💯' }, lose: { cash: -0.4, say: 'They found a few problems. You pay a fine. 😬' } } } },
      { t: '🧹 Clean super fast first', fx: { team: -3, chance: { p: 0.7, win: { rep: 4, say: 'Sparkling clean! The inspector is impressed. ✨' }, lose: { cash: -0.3, say: 'They saw you hiding a mop in the ceiling. Fine! 🧹😬' } } } },
      { t: '💰 Offer them a "gift"', d: 'Very risky!', fx: { cash: -0.2, next: ['bribe_scandal', 2, 6, 0.4], say: 'They took it and left... Was that a good idea? 😰' } },
      { t: '🙏 "Can you come back later?"', fx: { rep: -1, next: ['inspection', 2, 4], say: 'They will be back. And they will look harder.' } }
    ] });

  ev({ id: 'bribe_scandal', cat: 'trouble', icon: '📰', kind: 'news', chainOnly: true,
    title: 'SCANDAL: {company} bribed an inspector!',
    text: 'A reporter found out about the "gift". It\'s on the front page! 😱',
    choices: [
      { t: '🙇 Say sorry + pay the fine', fx: { cash: -2, rep: -12, say: 'It hurts. But people forgive you slowly.' } },
      { t: '🎁 Give lots to charity', fx: { cash: -1.5, rep: -5, fans: 5, say: 'People are starting to forgive you. 🙏' } },
      { t: '🙈 Hide for a week', fx: { rep: -15, closed: [1, 'Hiding from reporters'], say: 'You hid under your desk. It didn\'t help much. 🙈' } },
      { t: '🤥 Deny everything', fx: { chance: { p: 0.4, win: { rep: -5, say: 'No proof. The story fades.' }, lose: { rep: -25, cash: -3, demand: [0.75, 6, 'Boycott'], say: 'Then they showed the video. Customers are boycotting you! 😭' } } } }
    ] });

  ev({ id: 'repairs', cat: 'business', icon: '🏚️', w: 1.5, cd: 12,
    title: 'The building is falling apart',
    text: 'The roof leaks, the door squeaks, and two letters fell off your sign. 🏚️',
    choices: [
      { t: '✨ Fix everything', fx: { cash: -0.8, rep: 3, team: 4, say: 'It looks brand new! ✨' } },
      { t: '🩹 Fix the worst stuff', fx: { cash: -0.15, say: 'Good enough.' } },
      { t: '🌈 Paint it all bright colors', fx: { cash: -0.3, fans: 10, happy: 3, say: 'It looks like a rainbow exploded. People LOVE it. 🌈' } },
      { t: '⏳ Later', fx: { rep: -2, next: ['repairs', 4, 8], say: 'It won\'t fix itself...' } }
    ] });

  ev({ id: 'late_delivery', cat: 'business', icon: '🐢', w: 2.5,
    title: 'Your delivery is late',
    text: 'The supplies you need are stuck in traffic somewhere. 🚛🚗🚙',
    choices: [
      { t: '⚡ Pay for super-fast shipping', fx: { cash: -0.15, say: 'It arrives just in time! 😅' } },
      { t: '🛵 Send a worker on a scooter', fx: { money: -30, team: 2, say: 'Zoom zoom! They made it back just in time. 🛵💨' } },
      { t: '🎲 Sell a "surprise menu" today', fx: { chance: { p: 0.5, win: { fans: 8, say: 'Customers loved the surprise! 🎲' }, lose: { happy: -3, say: 'Customers were confused. 🤔' } } } },
      { t: '⏳ Wait for it', fx: { capacity: [0.8, 1, 'Missing supplies'], say: 'You run out of stuff for a few days.' } }
    ] });

  ev({ id: 'systems_down', cat: 'business', icon: '🖥️', w: 1.5,
    title: 'The computers crashed!',
    text: 'The card machine, the orders, the schedule... all DOWN! 💻💀',
    choices: [
      { t: '🧑‍💻 Call IT experts', fx: { cash: -0.25, say: 'Fixed in 2 hours! 🛠️' } },
      { t: '🔌 Turn it off and on again', fx: { chance: { p: 0.6, win: { say: 'It worked! The oldest trick in the book. 🔌😎' }, lose: { capacity: [0.85, 1, 'Computers down'], say: 'Nope. Still broken. 💀' } } } },
      { t: '💵 Cash only today!', fx: { demand: [0.9, 1, 'Cash only'], say: 'Some customers didn\'t have cash. 💵' } },
      { t: '📝 Use pen and paper', fx: { capacity: [0.85, 1, 'Computers down'], team: -2, say: 'Chaotic, but you survive the week.' } }
    ] });

  ev({ id: 'big_contract', cat: 'lucky', icon: '🤝', w: 1.5, cd: 14, minWeek: 5, init: function (g, c) { c.weeks = 6; c.amt = U.nice(G.scale(g) * 0.25); },
    title: 'A big client wants a deal!',
    text: 'A big company wants to buy from you for {weeks} weeks. They pay {amt} extra every week! It will keep your team busy.',
    choices: [
      { t: '✍️ Sign it!', fx: { extra: [0.25, 6, 'Big client deal'], team: -5, say: 'Deal signed! Money starts next week. 💰' } },
      { t: '💪 Ask for 30% more', fx: { chance: { p: 0.5, win: { extra: [0.33, 6, 'Big client deal'], team: -5, say: 'They said YES to more money! 🤑' }, lose: { say: 'They walked away. Too greedy! 😅' } } } },
      { t: '📅 Ask for a longer deal', fx: { chance: { p: 0.6, win: { extra: [0.2, 12, 'Long client deal'], team: -4, say: '12 weeks of extra money! 📅💰' }, lose: { extra: [0.25, 6, 'Big client deal'], say: 'They said no, but signed the normal deal. 👍' } } } },
      { t: '🙅 No thanks', fx: { say: 'You stay focused on your normal customers.' } }
    ] });

  ev({ id: 'tax_refund', cat: 'lucky', icon: '🧾', w: 1.5, cd: 26,
    title: 'Surprise money from taxes!',
    text: 'The tax office made a mistake. They are sending you money back! 💸',
    choices: [
      { t: '💰 Keep it in the bank', fx: { cash: 0.3, say: 'Nice, a little safety money. 💰' } },
      { t: '🎉 Share it with the team', fx: { cash: 0.1, team: 8, say: 'Everyone got a little bonus! 🎉' } },
      { t: '📢 Spend it on ads', fx: { fans: 15, say: 'More people know about you now! 📢' } },
      { t: '🛠️ Fix up the shop', fx: { happy: 5, rep: 2, say: 'The shop looks shiny now. ✨' } }
    ] });

  ev({ id: 'award', cat: 'lucky', icon: '🏆', w: function (g) { return g.reputation > 70 ? 2 : 0; }, cd: 26,
    title: 'You won an award! 🏆',
    text: 'You won "Best {industry} in {city}"! There is a fancy dinner tonight.',
    choices: [
      { t: '🎤 Give a funny speech', fx: { rep: 4, fans: 15, say: 'Everyone laughed. Best speech of the night! 🎤' } },
      { t: '🙏 Thank your whole team', fx: { rep: 4, team: 10, say: 'Your team cried happy tears. 🥹' } },
      { t: '🏆 Put the trophy in the window', fx: { rep: 5, demand: [1.1, 6, 'Award winner'], say: 'Customers come to see the trophy! 🏆' } },
      { t: '😎 Act cool', fx: { rep: 4, say: '"Yeah, we know." 😎' } }
    ] });

  ev({ id: 'heatwave', cat: 'business', icon: '🥵', w: 3, cd: 20, cond: season(24, 34),
    title: 'HEATWAVE! 🥵',
    text: 'It\'s super hot outside and your air conditioner just broke. Everyone is melting! 🫠',
    choices: [
      { t: '❄️ Buy a new AC', fx: { cash: -0.35, say: 'Ahhh, cool air! Customers come in to chill. 😎' } },
      { t: '🍦 Give out free ice pops', fx: { cash: -0.08, fans: 8, happy: 4, say: 'Everyone loves the free ice pops! 🍦' } },
      { t: '💦 Water gun fight!', fx: { team: 10, fans: 6, capacity: [0.95, 1, 'Water fight'], say: 'SPLASH! Best workday ever. 💦🔫' } },
      { t: '🫠 Just sweat it out', fx: { happy: -5, team: -5, say: 'Sweaty customers. Sweaty staff. Not great. 💦' } }
    ] });

  ev({ id: 'snowstorm', cat: 'business', icon: '❄️', w: 3, cd: 20, cond: function (g) { var w = ((g.week - 1) % 52) + 1; return w <= 8 || w >= 49; },
    title: 'Giant snowstorm!',
    text: 'There is SO much snow. ☃️ The roads are closed.',
    choices: [
      { t: '🔒 Close for a week', fx: { closed: [1, 'Snowstorm'], team: 4, say: 'Snow day for everyone! ⛄' } },
      { t: '💪 Stay open!', fx: { chance: { p: 0.5, win: { fans: 12, rep: 2, say: 'Brave customers loved that you were open! ❤️' }, lose: { capacity: [0.6, 1, 'Staff snowed in'], say: 'Half the staff couldn\'t get there. ❄️' } } } },
      { t: '☃️ Snowman contest outside', fx: { fans: 10, team: 5, demand: [0.9, 1, 'Snowstorm'], say: 'A giant snowman! People came to take photos. ☃️📸' } },
      { t: '☕ Free hot chocolate', fx: { cash: -0.08, happy: 6, rep: 2, say: 'Warm and happy customers! ☕❤️' } }
    ] });

  ev({ id: 'road_works', cat: 'business', icon: '🚧', w: 2, cd: 20,
    title: 'Road work outside!',
    text: 'The city is fixing the road in front of your shop for 3 weeks. It\'s loud and hard to get in. 🚧',
    choices: [
      { t: '😂 Put up a funny sign', fx: { demand: [0.95, 3, 'Road work'], fans: 8, say: '"We\'re still open! Bring earplugs 🎧" People love it.' } },
      { t: '📞 Complain to the city', fx: { chance: { p: 0.4, win: { say: 'They finish super fast! 🏎️' }, lose: { demand: [0.85, 3, 'Road work'], say: 'Nobody listened. 😑' } } } },
      { t: '🦺 Sell to the road workers!', fx: { extra: [0.1, 3, 'Road workers buying'], demand: [0.9, 3, 'Road work'], say: 'The workers are your best customers now! 🦺' } },
      { t: '🤷 Deal with it', fx: { demand: [0.85, 3, 'Road work'], say: 'Fewer customers for a while.' } }
    ] });

  ev({ id: 'mouse', cat: 'business', icon: '🐭', w: 2,
    title: 'A MOUSE! 🐭',
    text: 'A customer screamed. A little mouse ran across the floor!',
    choices: [
      { t: '🧑‍🔬 Call pest control', fx: { cash: -0.12, say: 'The mouse moved out. Bye mouse! 👋' } },
      { t: '🐈 Adopt a shop cat', fx: { cash: -0.05, fans: 12, happy: 3, pet: '🐈', say: 'Meet Whiskers, the new shop cat! Customers LOVE her. 🐈' } },
      { t: '🧀 Make it the mascot', fx: { chance: { p: 0.5, win: { fans: 18, say: '"Squeaky the Mouse" is a hit! 🐭⭐' }, lose: { rep: -5, say: 'Customers did NOT want a mouse mascot. 😬' } } } },
      { t: '🙈 Pretend it didn\'t happen', fx: { chance: { p: 0.5, win: { say: 'Nobody posted about it. Lucky!' }, lose: { rep: -8, say: 'Someone posted a video. "MOUSE AT {company}!" 😱' } } } }
    ] });

  ev({ id: 'rent_up', cat: 'business', icon: '🏠', kind: 'chat', w: 1, cd: 40, minWeek: 20, from: { name: 'Your Landlord', face: '🧓' },
    title: 'The landlord wants more rent',
    msgs: ['hello tenant 🧓', 'rent is going up 10%', 'starting next week'],
    choices: [
      { t: '😩 "Okay..."', fx: { rent: 0.1, say: 'Rent is higher now.' } },
      { t: '🤝 "Can we meet in the middle?"', fx: { chance: { p: 0.5, win: { rent: 0.05, say: 'Deal at +5%. 🤝' }, lose: { rent: 0.1, say: 'The landlord said no.' } } } },
      { t: '🍰 "Free cake every week?"', fx: { chance: { p: 0.45, win: { say: 'The landlord LOVES cake. Rent stays the same! 🍰' }, lose: { rent: 0.1, say: 'The landlord is on a diet. +10%. 😑' } } } },
      { t: '📦 "Then I\'ll move out!"', fx: { chance: { p: 0.4, win: { say: 'The landlord panics. Rent stays the same! 😎' }, lose: { rent: 0.15, say: 'The landlord called your bluff. +15%! 😱' } } } }
    ] });

  ev({ id: 'found_money', cat: 'lucky', icon: '💵', w: 1.5, cd: 20,
    title: 'Money behind the counter!',
    text: 'Someone found a bundle of cash stuck behind the counter. 💵 Where did it come from?',
    choices: [
      { t: '💰 Keep it', fx: { cash: 0.12, say: 'Finders keepers! 💵' } },
      { t: '🍩 Buy donuts for the team', fx: { team: 5, say: 'Donut day! 🍩' } },
      { t: '❤️ Give it to charity', fx: { rep: 3, say: 'Good karma! ✨' } },
      { t: '🔍 Find the owner', fx: { rep: 2, chance: { p: 0.5, win: { cash: 0.05, say: 'It was a customer\'s! They gave you a reward. 😇' }, lose: { cash: 0.12, say: 'Nobody claimed it. It\'s yours! 💵' } } } }
    ] });

  ev({ id: 'charity', cat: 'business', icon: '🏫', w: 2, cd: 12,
    title: 'A school needs help',
    text: 'The local school asks for money for new books. 📚',
    choices: [
      { t: '❤️ Donate', fx: { cash: -0.25, rep: 5, fans: 8, say: 'The kids made you a giant thank-you card! 💌' } },
      { t: '📦 Donate some {unit} instead', fx: { cash: -0.1, rep: 3, say: 'They loved it! 😊' } },
      { t: '🧑‍🏫 Teach a class about business', fx: { rep: 4, fans: 5, say: 'The kids asked 400 questions. You loved it. 🧑‍🏫' } },
      { t: '🙅 Not this time', fx: { rep: -1, say: 'Maybe next time.' } }
    ] });

  ev({ id: 'festival', cat: 'lucky', icon: '🎪', w: 2, cd: 15,
    title: 'City festival this weekend!',
    text: 'Thousands of people are coming to the {city} festival! 🎪🎡',
    choices: [
      { t: '⛺ Set up a stand', fx: { cash: -0.3, extra: [0.35, 1, 'Festival stand'], fans: 15, say: 'Your stand was packed! 🎉' } },
      { t: '🎈 Hand out balloons', fx: { cash: -0.05, fans: 8, say: 'Kids everywhere have your balloons! 🎈' } },
      { t: '🎭 Join the costume parade', fx: { cash: -0.08, fans: 12, team: 5, say: 'Your team marched in giant costumes. People cheered! 🎭' } },
      { t: '😴 Skip it', fx: { say: 'You rest this weekend.' } }
    ] });

  ev({ id: 'holiday_rush', cat: 'business', icon: '🎄', w: 5, cd: 40, cond: season(47, 52),
    title: 'HOLIDAY RUSH! 🎄',
    text: 'It\'s the holidays! Tons of shoppers are coming. Are you ready?',
    choices: [
      { t: '👷 Hire extra helpers', fx: { cash: -0.4, demand: [1.3, 2, 'Holiday rush'], capacity: [1.25, 2, 'Holiday helpers'], say: 'You\'re ready for the crowds! 🛍️' } },
      { t: '🎅 Just decorate', fx: { cash: -0.05, demand: [1.3, 2, 'Holiday rush'], happy: 3, say: 'It looks so cozy! 🎄' } },
      { t: '🎁 Free gift wrapping', fx: { cash: -0.1, demand: [1.35, 2, 'Holiday rush'], happy: 5, say: 'Everyone loves free wrapping! 🎁' } },
      { t: '😴 Business as usual', fx: { demand: [1.25, 2, 'Holiday rush'], say: 'Busy week! 🛍️' } }
    ] });

  ev({ id: 'back_to_school', cat: 'world', icon: '🎒', w: 3, cd: 40, cond: season(33, 36),
    title: 'Back to school week! 🎒',
    text: 'Kids and parents are out shopping everywhere.',
    choices: [
      { t: '✏️ Student discount', fx: { demand: [1.15, 2, 'Back to school'], happy: 3, say: 'Students LOVE you! 🎒' } },
      { t: '🎒 Free pencil with every sale', fx: { money: -60, demand: [1.12, 2, 'Back to school'], fans: 5, say: 'Your pencils are all over town. ✏️' } },
      { t: '📚 Donate school supplies', fx: { cash: -0.1, rep: 4, demand: [1.08, 2, 'Back to school'], say: 'Parents love you now! ❤️' } },
      { t: '😌 Just enjoy the rush', fx: { demand: [1.1, 2, 'Back to school'], say: 'Busy week! 📈' } }
    ] });

  ev({ id: 'tax_audit', cat: 'trouble', icon: '🧾', w: 0.8, minWeek: 15, cd: 40,
    title: 'Tax check!',
    text: 'The tax office wants to check all your money records. 🧾🔍',
    choices: [
      { t: '🧮 Pay an expert to help', fx: { cash: -0.4, say: 'Everything was perfect! ✅' } },
      { t: '💪 Do it yourself', fx: { chance: { p: function (g) { return g.employees.some(function (e) { return e.role === 'acct'; }) ? 0.85 : 0.5; }, win: { say: 'You passed! 📊' }, lose: { cash: -1, say: 'You made mistakes. Big fine! 😖' } } } },
      { t: '📦 Bring ALL the papers (500 boxes)', fx: { chance: { p: 0.6, win: { say: 'The tax officer gave up after box 12. You passed! 😂📦' }, lose: { cash: -0.6, say: 'They read ALL 500 boxes. Found a mistake. 😩' } } } },
      { t: '🍪 Bring cookies', fx: { money: -20, chance: { p: 0.55, win: { say: 'Happy tax officer = quick check. Passed! 🍪' }, lose: { cash: -0.5, say: 'Cookies don\'t work on taxes. Small fine. 🍪😅' } } } }
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
      { t: '🖼️ Frame it on the wall', fx: { rep: 2, happy: 2, say: 'Now every customer reads it. ⭐' } },
      { t: '👀 Just enjoy it', fx: { say: 'Nice. 😊' } }
    ] });

  ev({ id: 'review_1', cat: 'customers', icon: '😡', kind: 'review', w: function (g) { return g.satisfaction < 50 ? 4 : 1.2; }, stars: 1, init: reviewer,
    title: 'Ouch! 1-star review',
    text: 'I waited FOREVER and nobody said hi. Never coming back. 😡👎',
    choices: [
      { t: '🙏 Say sorry nicely', fx: { rep: 2, say: 'Other people see your kind reply. 👍' } },
      { t: '🎟️ Offer a free visit', fx: { cash: -0.02, rep: 3, chance: { p: 0.5, win: { say: 'They came back and changed it to 5 stars! ⭐⭐⭐⭐⭐' }, lose: { say: 'They never replied.' } } } },
      { t: '🎵 Reply with a sorry song', fx: { chance: { p: 0.5, win: { fans: 15, rep: 2, say: 'Your sorry song went viral! 🎵😂' }, lose: { rep: -2, say: 'The song was... not good. 🎵😬' } } } },
      { t: '😤 Argue with them', fx: { chance: { p: 0.3, win: { fans: 10, say: 'Your funny reply went a little viral! 😂' }, lose: { rep: -6, say: 'People think you\'re rude. 😬' } } } }
    ] });

  ev({ id: 'review_weird', cat: 'customers', icon: '🤔', kind: 'review', w: 2, stars: 3, init: reviewer,
    title: 'A strange review',
    text: 'Pretty good. But the chair I sat on made a fart noise every time I moved. 3 stars. 🪑💨',
    choices: [
      { t: '🪑 Fix the chair', fx: { cash: -0.02, happy: 2, say: 'No more fart chair. 😌' } },
      { t: '😂 Make it famous', fx: { fans: 14, say: 'People come JUST to sit in the fart chair! 😂🪑' } },
      { t: '💨 Buy 10 more fart chairs', fx: { money: -100, chance: { p: 0.5, win: { fans: 20, say: 'The Fart Chair Corner is TRENDING. 💨🔥' }, lose: { happy: -3, say: 'Too many farts. Customers left. 💨😷' } } } },
      { t: '🤐 Ignore it', fx: { say: 'The chair keeps farting. 🪑' } }
    ] });

  ev({ id: 'review_kid', cat: 'customers', icon: '🧒', kind: 'review', w: 1.5, stars: 5, init: function (g, c) { c.who2 = 'Timmy (age 8)'; },
    title: 'A review from a kid',
    text: 'I LOVE THIS PLACE. the lady gave me a sticker. 10/10 would come again. my mom says i have to stop typing now',
    choices: [
      { t: '🌟 Send Timmy a surprise', fx: { cash: -0.02, fans: 15, rep: 3, say: 'Timmy\'s mom posted his happy face online. Everyone melted! 🥹' } },
      { t: '🏅 "Customer of the Year!"', fx: { fans: 12, rep: 2, say: 'Timmy got a medal. The local news covered it! 🏅📺' } },
      { t: '💖 Reply with a heart', fx: { fans: 4, say: 'Timmy is very proud. 😊' } },
      { t: '🎨 Ask Timmy to draw your logo', fx: { fans: 8, say: 'Timmy\'s logo drawing is now on the menu. 🎨❤️' } }
    ] });

  ev({ id: 'vip', cat: 'customers', icon: '🕶️', w: 1.2, cd: 20, rarity: 'rare',
    init: function (g, c) { c.celeb = U.pick(['a famous singer', 'a pro soccer player', 'a movie star', 'a famous YouTuber', 'a TV chef']); },
    title: 'A celebrity walked in!',
    text: 'Wait... is that {celeb}?! 😱 Everyone is staring.',
    choices: [
      { t: '👑 Give them VIP treatment', fx: { cash: -0.1, chance: { p: 0.6, win: { viral: [1, 4], rep: 4, say: 'They posted about you! 🌟' }, lose: { rep: 1, say: 'They said thanks and left. Still cool! 😎' } } } },
      { t: '📸 Ask for a selfie', fx: { chance: { p: 0.5, win: { fans: 20, say: 'Selfie on the wall! 🤳' }, lose: { rep: -2, say: 'They didn\'t like that. Awkward. 😬' } } } },
      { t: '🎤 Ask them to show a trick', fx: { chance: { p: 0.4, win: { viral: [2, 5], say: 'THEY DID IT! The whole shop went crazy! 🎤🔥' }, lose: { rep: -3, say: 'They said "no thanks" and left fast. 😅' } } } },
      { t: '😌 Treat them like anyone else', fx: { rep: 2, say: 'They liked being treated normally. Classy! ✨' } }
    ] });

  ev({ id: 'kid_customer', cat: 'customers', icon: '🧸', w: 1.5, cd: 20,
    title: 'A little customer',
    text: 'A tiny kid wants to buy something. They only have $1.50 and a toy car. 🚗',
    choices: [
      { t: '🥰 "That\'s enough!"', fx: { rep: 4, chance: { p: 0.3, win: { viral: [0.5, 3], say: 'Their dad filmed it. The internet is crying happy tears! 🥹' }, lose: { say: 'The kid is SO happy! 😊' } } } },
      { t: '🚗 Trade for the toy car', fx: { rep: 3, say: 'The toy car is now your desk decoration. Vroom! 🚗' } },
      { t: '🎁 Give it free + a sticker', fx: { rep: 5, fans: 5, say: 'The kid told their WHOLE school. 🧒📣' } },
      { t: '🙅 "Sorry, not enough"', fx: { rep: -3, say: 'The kid walks away sadly. 😢' } }
    ] });

  ev({ id: 'regulars', cat: 'customers', icon: '🤗', w: 2,
    title: 'Your best customer is back!',
    text: 'Your favorite regular customer brought 5 friends! 👯👯',
    choices: [
      { t: '🎟️ Give them all a discount', fx: { demand: [1.08, 3, 'New friends'], happy: 3, say: 'Now they ALL come every week! 👯' } },
      { t: '🏷️ Name something after them', fx: { fans: 6, happy: 4, say: '"The Big Bob Special" is on the menu. Bob cried. 😭❤️' } },
      { t: '📸 Take a group photo', fx: { fans: 5, say: 'Photo on the wall of fame! 📸' } },
      { t: '👋 Say hi', fx: { demand: [1.04, 2, 'Friends of regulars'], say: 'Nice to see new faces! 👋' } }
    ] });

  ev({ id: 'special_order', cat: 'customers', icon: '🦖', w: 2,
    title: 'A super special order',
    text: 'A customer wants something very special. "Can you make it purple and shaped like a dinosaur?" 🦖💜',
    choices: [
      { t: '🦖 "Challenge accepted!"', fx: { cash: -0.04, happy: 4, fans: 6, say: 'They LOVED it! They told everyone. 💜' } },
      { t: '🦕 Make it GIANT', fx: { cash: -0.1, chance: { p: 0.5, win: { viral: [0.5, 2], say: 'A 2-meter purple dinosaur. The internet went WILD. 🦕🔥' }, lose: { say: 'It didn\'t fit through the door. 😂' } } } },
      { t: '💰 "It costs double"', fx: { cash: 0.05, say: 'They paid it! Weird but profitable. 💜' } },
      { t: '🙅 "Sorry, we can\'t"', fx: { say: 'They go somewhere else.' } }
    ] });

  ev({ id: 'lost_kid', cat: 'customers', icon: '😢', w: 1.2, cd: 30,
    title: 'A lost kid',
    text: 'A little kid is crying. They can\'t find their parents! 😢',
    choices: [
      { t: '🔍 Help find the parents', fx: { rep: 3, team: 3, say: 'Found them! Big happy hug. 🤗' } },
      { t: '📢 Announce it on the speaker', fx: { rep: 2, say: 'Mom came running in 30 seconds! 🏃‍♀️' } },
      { t: '🍭 Give a treat while waiting', fx: { rep: 3, happy: 2, say: 'The kid stopped crying and started smiling. 🍭' } },
      { t: '👮 Call the police', fx: { rep: 1, say: 'The police helped. All good.' } }
    ] });

  ev({ id: 'proposal', cat: 'customers', icon: '💍', w: 1, cd: 30, rarity: 'rare',
    title: 'A marriage proposal!',
    text: 'A customer wants to propose to their partner in YOUR shop. 💍 They need your help!',
    choices: [
      { t: '🌹 Go all out!', fx: { cash: -0.08, chance: { p: 0.8, win: { viral: [0.5, 3], rep: 3, say: 'They said YES! 💍 The video is everywhere!' }, lose: { say: 'They said... "let me think about it." Oof. 😬' } } } },
      { t: '💍 Hide the ring in their order', fx: { chance: { p: 0.7, win: { fans: 15, say: 'They found it! YES! 💍🎉' }, lose: { say: 'They almost ate the ring. Then said yes! 😂💍' } } } },
      { t: '🎶 Just play a love song', fx: { fans: 5, say: 'So romantic! 🎶' } },
      { t: '🙅 "Not here, sorry"', fx: { rep: -2, say: 'They proposed at the place next door. 😕' } }
    ] });

  ev({ id: 'influencer_freebie', cat: 'customers', icon: '🤳', w: 1.5, cd: 15,
    title: 'An influencer wants free stuff',
    text: '"I have 200K followers. Give me free stuff and I\'ll post about you!" 💅',
    choices: [
      { t: '🎁 Okay, here you go', fx: { cash: -0.1, chance: { p: 0.6, win: { fans: 30, say: 'They posted! New followers everywhere! 📈' }, lose: { say: 'They never posted. Hmm. 🤨' } } } },
      { t: '🤝 "Post first, then free stuff"', fx: { chance: { p: 0.5, win: { fans: 25, cash: -0.05, say: 'They posted first! Deal! 🤝' }, lose: { say: 'They walked away. 💅' } } } },
      { t: '🔍 Check if the followers are real', fx: { chance: { p: 0.5, win: { say: 'FAKE followers! You caught them. 😎' }, lose: { fans: 20, cash: -0.1, say: 'They were real! You gave them stuff. Nice post! 📈' } } } },
      { t: '🙅 "Please pay like everyone"', fx: { chance: { p: 0.5, win: { rep: 2, say: 'Other customers respect that! 💪' }, lose: { rep: -4, say: 'They posted a mean video about you. 🙄' } } } }
    ] });

  ev({ id: 'grumpy_grandpa', cat: 'customers', icon: '👴', kind: 'chat', w: 1.5, from: { name: 'Grandpa Joe', face: '👴' },
    title: 'Grandpa Joe has a complaint',
    msgs: ['HELLO', 'THE MUSIC IS TOO LOUD', 'IN MY DAY WE HAD QUIET SHOPS'],
    choices: [
      { t: '🔉 Turn it down', fx: { happy: 2, say: 'Grandpa Joe gives you a thumbs up. 👍' } },
      { t: '🎸 Play his favorite oldies', fx: { happy: 4, fans: 4, say: 'Grandpa Joe is DANCING. 🕺' } },
      { t: '🎧 Give him free headphones', fx: { money: -30, happy: 3, say: 'Grandpa Joe is now listening to heavy metal. 🤘👴' } },
      { t: '🔊 Keep it loud', fx: { happy: -2, say: 'Grandpa Joe leaves. Grumpy. 😤' } }
    ] });

  ev({ id: 'hair_in_food', cat: 'customers', icon: '🤢', w: 2, cond: FOOD,
    title: 'Hair in the food! 🤢',
    text: 'A customer found a hair in their food. They are VERY upset.',
    choices: [
      { t: '🙏 Free meal + big sorry', fx: { cash: -0.03, rep: 1, say: 'They forgive you. 😌' } },
      { t: '🧢 Hairnets for everyone!', fx: { cash: -0.05, team: -2, happy: 2, say: 'The team looks silly. But no more hair! 😂' } },
      { t: '👨‍🦲 Everyone wears a funny bald cap!', fx: { team: -4, fans: 15, say: 'The whole team in bald caps. It went viral. 👨‍🦲😂' } },
      { t: '🤷 "Not ours!"', fx: { rep: -5, say: 'They left a 1-star review. 😬' } }
    ] });

  ev({ id: 'food_critic', cat: 'customers', icon: '🧐', w: 1.2, cond: FOOD, cd: 30, rarity: 'rare',
    title: 'A food critic is here!',
    text: 'A famous food critic is secretly eating here. 🧐 Your staff noticed!',
    choices: [
      { t: '👨‍🍳 Make everything perfect', fx: { cash: -0.1, chance: { p: function (g) { return g.satisfaction / 100 + 0.1; }, win: { rep: 8, fans: 25, say: '"A hidden gem!" ⭐⭐⭐⭐⭐ Critics love you!' }, lose: { rep: -4, say: '"It was... fine." Ouch. 😐' } } } },
      { t: '🎩 Serve it with a magic trick', fx: { chance: { p: 0.5, win: { rep: 6, fans: 20, say: '"Food AND a show!" ⭐⭐⭐⭐⭐' }, lose: { rep: -2, say: 'The trick went wrong. Soup everywhere. 🎩🍲' } } } },
      { t: '😎 Act normal', fx: { chance: { p: function (g) { return g.satisfaction / 100; }, win: { rep: 6, say: 'They loved the normal you! ⭐⭐⭐⭐' }, lose: { rep: -3, say: 'Not their favorite. 😕' } } } },
      { t: '🙈 Hide in the kitchen', fx: { chance: { p: 0.5, win: { rep: 3, say: '"Nice food, strange boss." ⭐⭐⭐' }, lose: { rep: -3, say: '"Where was the boss?" ⭐⭐' } } } }
    ] });

  ev({ id: 'streamer', cat: 'customers', icon: '🎮', w: 2, cond: TECH, cd: 20, rarity: 'rare',
    title: 'A big streamer is using your stuff!',
    text: 'A famous streamer is using your product live in front of 50,000 people! 🎮',
    choices: [
      { t: '💬 Send them a message', fx: { chance: { p: 0.5, win: { viral: [1, 4], say: 'They shouted you out LIVE! 🎉' }, lose: { fans: 10, say: 'They didn\'t see it, but lots of viewers did.' } } } },
      { t: '🎁 Send free stuff for the fans', fx: { cash: -0.2, fans: 30, say: 'Viewers go crazy for the giveaway! 🎁' } },
      { t: '🎮 Challenge them to a game', fx: { chance: { p: 0.4, win: { viral: [2, 5], say: 'You WON on stream! Legendary! 🏆🎮' }, lose: { fans: 15, say: 'You lost badly, but it was hilarious. 😂' } } } },
      { t: '👀 Just watch', fx: { fans: 5, say: 'Cool! 😎' } }
    ] });

  ev({ id: 'bug_found', cat: 'business', icon: '🐛', w: 2, cond: TECH,
    title: 'A big bug was found!',
    text: 'Users found a bug. When you press a button, everything turns upside down. 🙃',
    choices: [
      { t: '🧑‍💻 Fix it now', fx: { cash: -0.15, say: 'Fixed! 🔧' } },
      { t: '😂 Call it a "feature"', fx: { chance: { p: 0.4, win: { fans: 20, say: 'People LOVE the upside-down mode! 🙃' }, lose: { rep: -5, say: 'People did not find it funny. 😑' } } } },
      { t: '🏆 Reward whoever finds bugs', fx: { cash: -0.1, rep: 3, fans: 8, say: 'Bug hunters everywhere! 🐛🏆' } },
      { t: '🙈 Hope nobody notices', fx: { chance: { p: 0.4, win: { say: 'Nobody noticed. Phew. 😅' }, lose: { rep: -8, say: 'EVERYONE noticed. 😬' } } } }
    ] });
})();
