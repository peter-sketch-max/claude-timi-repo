// All events, part 4: your life as the boss, shady deals, trouble and sad goodbyes.
// See the top of events.js for the event format and the style rules. Every question has exactly 4 responses.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var U = CS.U, G = CS.G, H = CS.EVH, E = CS.E;
  var rival = H.rival, amt = H.amt, hasRole = H.hasRole, person = H.person;
  var hasPet = function (g) { return !!g.pet; };
  var petCtx = function (g, c) { c.pet = g.pet; };
  var noPet = function (g) { g.pet = null; };
  var PETS = ['🐱', '🐶', '🐹', '🐰', '🦜', '🐢'];

  // =====================================================================
  // 👔 YOUR LIFE
  // =====================================================================

  E('boss_burnout', 'boss', '🥵', 'You haven\'t slept properly in weeks', 'Your hands are shaking. You forgot your own birthday.', [
    ['🏖️ Take a week off', { closed: [1, 'Boss on vacation'], team: 5, say: 'You came back a new person.' }],
    ['👔 Let the manager run things', { capacity: [0.95, 2, 'Boss resting'], say: 'You rested. The shop survived.' }],
    ['☕ More coffee', { chance: { p: 0.5, win: { say: 'You pushed through. Somehow.' }, lose: { rep: -3, then: 'burnout_breakdown', say: 'You snapped at a customer. Then you ran to the back.' } } }],
    ['🧘 Short breaks every day', { team: 3, say: 'Small breaks. Big difference.' }]
  ], { w: 1.5, cd: 30, minWeek: 10 });

  E('boss_health', 'boss', '🏥', 'Your doctor is worried about you', '"Your heart is not happy. You need to slow down."', [
    ['🏃 Start exercising', { cash: -0.1, team: 3, say: 'You feel stronger every week.' }],
    ['👔 Hire a manager to help', { hireSpecial: { role: 'mgr', skill: 60 }, say: 'Someone to share the load.' }],
    ['🏖️ Take a real vacation', { closed: [1, 'Boss on vacation'], team: 5, say: 'The doctor is happy. So are you.' }],
    ['🙉 Ignore the doctor', { chance: { p: 0.6, win: { say: 'Nothing happened. This time.' }, lose: { closed: [1, 'Boss in hospital'], say: 'You ended up in the hospital for a week.' } } }]
  ], { w: 1, cd: 40, minWeek: 20 });

  E('boss_family', 'boss', '👨‍👩‍👧', 'Your family says they never see you', 'You missed dinner every night this month.', [
    ['🏠 Leave early every Friday', { capacity: [0.97, 8, 'Family time'], team: 3, say: 'Fridays are for family now.' }],
    ['✈️ A family trip', { cash: -0.3, closed: [1, 'Family trip'], say: 'Best week of the year.' }],
    ['🧑‍🤝‍🧑 Bring them to work', { team: 4, fans: 5, say: 'They saw what you built. They\'re proud.' }],
    ['💼 "The business comes first"', { next: ['family_ultimatum', 3, 6, 0.7], say: 'The house is very quiet when you get home.' }]
  ], { w: 1.2, cd: 30, minWeek: 8 });

  E('cousin_job', 'boss', '🧑', 'Your cousin needs a job', 'Your aunt calls. "Please. He\'ll work hard." He has never worked before.', [
    ['✅ Hire him', { hireSpecial: { role: 'front', skill: 30, traits: ['lazy'] }, team: -4, say: 'The team is not impressed.' }],
    ['🎓 Hire him on trial', { chance: { p: 0.5, win: { hireSpecial: { role: 'front', skill: 50, traits: ['loyal'] }, say: 'He surprised everyone.' }, lose: { say: 'He lasted three days.' } } }],
    ['💵 Lend him money instead', { cash: -0.2, say: 'Your aunt is happy. For now.' }],
    ['🙅 Say no', { say: 'Family dinners are awkward now.' }]
  ], { w: 1.2, cd: 40 });

  E('old_friend_invest', 'boss', '🤝', 'Your best friend asks you to invest', 'In their new business. They need the money badly.', [
    ['💰 Invest big', { cash: -1, chance: { p: 0.4, win: { cash: 2.5, say: 'Their business took off. You got paid back double.' }, lose: { say: 'It failed. The money is gone.' } } }],
    ['💵 Invest a little', { cash: -0.3, chance: { p: 0.4, win: { cash: 0.8, say: 'A nice return.' }, lose: { say: 'Gone. But the friendship survived.' } } }],
    ['🧠 Give advice instead', { say: 'They listened. Mostly.' }],
    ['🙅 Say no', { say: 'They haven\'t called since.' }]
  ], { w: 1, cd: 40 });

  E('parents_money', 'boss', '👵', 'Your parents need money', 'Their roof is falling apart. They\'re too proud to ask, but you found out.', [
    ['🏠 Pay for all of it', { cash: -0.6, team: 3, say: 'They cried. You did too.' }],
    ['🔨 Send your team to fix it', { cash: -0.2, team: 6, capacity: [0.95, 1, 'Helping family'], say: 'Your team spent a Saturday on the roof.' }],
    ['💵 Pay half', { cash: -0.3, say: 'They were grateful.' }],
    ['📞 Help them find a loan', { say: 'They\'re paying it off slowly.' }]
  ], { w: 1, cd: 50 });

  E('boss_recognized', 'boss', '🌟', 'People recognize you on the street', 'Someone stopped you for a photo. Then another. Then ten more.', [
    ['📸 Take photos with everyone', { fans: 15, say: 'You were late for everything.' }],
    ['🛍️ Invite them to the shop', { demand: [1.05, 2, 'Fans visiting'], say: 'They came.' }],
    ['🕶️ Get sunglasses', { say: 'Nobody bothers you now.' }],
    ['📱 Post about it', { fans: 10, say: 'Humble? Not really. People liked it anyway.' }]
  ], { w: 1, cd: 30, minWeek: 15, cond: function (g) { return g.followers > 2000; } });

  E('fancy_car', 'boss', '🏎️', 'You could buy a sports car', 'The business is doing well. The car is beautiful. And very expensive.', [
    ['🏎️ Buy it', { cash: -1.5, fans: 10, team: -4, say: 'The team noticed. So did the bank.' }],
    ['🚗 Buy a normal car', { cash: -0.3, say: 'Sensible.' }],
    ['💼 Put the money in the business', { equip: 0.02, cash: -0.5, team: 3, say: 'Better tools instead.' }],
    ['🚲 Keep your bike', { rep: 2, say: 'The boss still rides a bike. People love it.' }]
  ], { w: 1, cd: 50, minWeek: 20, cond: function (g) { return g.cash > G.cost(g, 5); } });

  E('school_talk', 'boss', '🏫', 'A school invites you to speak', 'Kids want to hear how you started your company.', [
    ['🎤 Tell the real story', { rep: 4, fans: 10, say: 'The kids asked a hundred questions.' }],
    ['🎁 Bring free samples', { cash: -0.05, rep: 3, fans: 15, say: 'You\'re the most popular guest ever.' }],
    ['💼 Offer a summer job to one kid', { rep: 5, say: 'One kid will remember this forever.' }],
    ['🙅 Too busy', { say: 'They invited the boss of another company.' }]
  ], { w: 1, cd: 40 });

  E('charity_gala', 'boss', '🥂', 'You\'re invited to a charity gala', 'Rich people, fancy clothes, big donations. Tickets are not cheap.', [
    ['🥂 Go and network', { cash: -0.2, chance: { p: 0.5, win: { extra: [0.1, 6, 'Gala contact'], say: 'You met a big new client.' }, lose: { say: 'Great food. No deals.' } } }],
    ['💰 Make a big donation', { cash: -0.6, rep: 8, fans: 15, say: 'Your name was read out on stage.' }],
    ['🎤 Offer to host the auction', { rep: 4, fans: 20, say: 'You were a natural on stage.' }],
    ['🙅 Stay home', { say: 'Pajamas and a movie.' }]
  ], { w: 1, cd: 35, minWeek: 15 });

  E('lost_phone', 'boss', '📱', 'You lost your phone', 'All your contacts, passwords and photos. Gone.', [
    ['🔍 Retrace your steps', { chance: { p: 0.5, win: { say: 'Found it in the car.' }, lose: { cash: -0.1, say: 'Gone. New phone.' } } }],
    ['📱 Buy a new one now', { cash: -0.1, say: 'Back online by lunch.' }],
    ['🔒 Lock everything first', { cash: -0.1, say: 'Smart. Nothing was stolen.' }],
    ['🧘 Enjoy a week offline', { team: 4, capacity: [0.97, 1, 'Boss offline'], say: 'Weirdly relaxing.' }]
  ], { w: 1.2, cd: 30 });

  E('boss_birthday', 'boss', '🎂', 'It\'s your birthday', 'The team whispers every time you walk in.', [
    ['🎉 Act surprised', { team: 8, say: 'The cake was perfect.' }],
    ['🍕 Buy lunch for everyone', { cash: -0.1, team: 10, say: 'Everyone celebrated you.' }],
    ['🏠 Take the day off', { team: 3, say: 'A quiet day at home.' }],
    ['💼 Work like normal', { team: -2, say: 'The cake stayed in the fridge.' }]
  ], { w: 1, cd: 52 });

  E('mentor_offer', 'boss', '🧓', 'A retired tycoon offers to mentor you', 'He built a huge company. He sees himself in you.', [
    ['🙏 Accept', { demand: [1.06, 12, 'Mentor'], rep: 3, say: 'His advice is gold.' }],
    ['💼 Offer him a board seat', { demand: [1.08, 16, 'Mentor on board'], cash: -0.3, say: 'Expensive, but worth it.' }],
    ['🤔 Just one lunch', { rep: 1, say: 'One great lunch. Lots of notes.' }],
    ['🙅 You do it your way', { say: 'He wished you luck.' }]
  ], { w: 0.8, cd: 60, minWeek: 12 });

  E('boss_car_crash', 'boss', '🚗', 'You crashed the company van', 'Nobody is hurt. The van is not okay.', [
    ['🔧 Fix it', { cash: -0.4, say: 'Good as new.' }],
    ['🆕 Buy a new van', { cash: -0.8, equip: 0.01, say: 'Better and faster.' }],
    ['📄 Call insurance', { chance: { p: function (g) { return g.flags.insured ? 0.9 : 0.4; }, win: { cash: -0.1, say: 'Insurance covered it.' }, lose: { cash: -0.5, say: 'Not covered.' } } }],
    ['🚶 Go without a van', { capacity: [0.92, 4, 'No van'], say: 'Deliveries are slow now.' }]
  ], { w: 1, cd: 40 });

  E('dating_boss', 'boss', '💘', 'You met someone: {name}', '{name} came in for coffee and stayed three hours. You keep smiling at your phone.', [
    ['🍷 Ask {name} on a date', { team: 2, then: 'first_date', say: 'They said yes before you finished asking.' }],
    ['💼 Show them your shop', { team: 3, then: 'first_date', say: 'The team approves. Now ask them out!' }],
    ['📵 No time for love', { say: 'Maybe someday.' }],
    ['💐 Plan something big', { cash: -0.1, then: 'first_date', say: 'You booked the best table in {city}.' }]
  ], { w: 1.2, cd: 30, minWeek: 5, init: H.person, cond: function (g) { return !g.family || !g.family.stage; } });

  E('vacation_call', 'boss', '🏝️', 'The shop calls during your vacation', 'You finally took a break. Now {m} says something is wrong.', [
    ['✈️ Fly back now', { cash: -0.2, team: 4, say: 'You fixed it. Vacation over.' }],
    ['📞 Fix it by phone', { chance: { p: 0.6, win: { say: 'Sorted in ten minutes.' }, lose: { cash: -0.3, say: 'It got worse.' } } }],
    ['👔 "{m}, you handle it."', { chance: { p: 0.6, win: { m: 10, skill: { m: 3 }, say: '{m} handled it perfectly.' }, lose: { cash: -0.4, say: '{m} made a mess.' } } }],
    ['📵 Turn off your phone', { chance: { p: 0.4, win: { say: 'It fixed itself.' }, lose: { cash: -0.6, rep: -2, say: 'You came back to chaos.' } } }]
  ], { w: 1, cd: 40, who: { m: 'mgr' } });

  E('boss_hobby', 'boss', '🎸', 'You miss your old hobby', 'You used to play music every day. Now you never do.', [
    ['🎸 Play at the shop on Fridays', { fans: 10, happy: 3, say: 'Customers love Friday music.' }],
    ['🕐 One hour a day for you', { team: 2, say: 'You feel like yourself again.' }],
    ['🎁 Start a team club', { team: 6, say: 'The team joined in.' }],
    ['💼 Work first', { say: 'Maybe next year.' }]
  ], { w: 0.8, cd: 50 });

  E('ex_partner', 'boss', '💔', 'Your ex-partner wants half', 'You started the business together years ago. They want their share.', [
    ['⚖️ Fight it', { cash: -0.5, chance: { p: 0.6, win: { say: 'The judge sided with you.' }, lose: { cash: -2, say: 'They won a big payment.' } } }],
    ['🤝 Pay them fairly', { cash: -1.5, rep: 2, say: 'It\'s over. Clean.' }],
    ['💬 Talk it out', { chance: { p: 0.5, win: { cash: -0.5, say: 'You agreed on a small amount.' }, lose: { cash: -1.5, say: 'It got ugly. It cost more.' } } }],
    ['🙅 Ignore them', { cash: -0.3, next: ['lawsuit_court', 3, 6], say: 'They sent a lawyer.' }]
  ], { w: 0.6, cd: 80, minWeek: 20 });

  E('lawsuit_court', 'trouble', '⚖️', 'You\'re in court', 'Your ex-partner\'s lawyer is very good. The judge is waiting.', [
    ['⚖️ Hire the best lawyer', { cash: -1, chance: { p: 0.7, win: { say: 'You won.' }, lose: { cash: -1, say: 'You lost anyway.' } } }],
    ['🤝 Settle before the verdict', { cash: -1.2, say: 'Done.' }],
    ['🗣️ Defend yourself', { chance: { p: 0.35, win: { rep: 3, say: 'You won on your own.' }, lose: { cash: -2, say: 'You lost badly.' } } }],
    ['🙏 Ask for mercy', { cash: -1.5, say: 'The judge was fair. It still hurt.' }]
  ], { chainOnly: true });

  // =====================================================================
  // 🕶️ SHADY DEALS
  // =====================================================================

  E('shady_inspector', 'shady', '🕶️', 'The inspector hints at a bribe', 'He found problems. "Or... maybe I found nothing. For a price."', [
    ['💵 Pay him', { cash: -0.3, next: [['bribe_exposed', 4, 12, 0.35], ['inspector_greedy', 4, 8, 0.5]], say: 'He found nothing. Of course.' }],
    ['🛠️ Fix the problems', { cash: -0.6, rep: 2, say: 'All fixed. Legally.' }],
    ['📹 Record him and report it', { chance: { p: 0.6, win: { rep: 8, fans: 15, say: 'He was fired. You\'re a local hero.' }, lose: { cash: -0.6, say: 'He found more problems. Big fine.' } } }],
    ['🙅 Take the fine', { cash: -0.5, say: 'Painful, but clean.' }]
  ], { w: 1.2, cd: 35, minWeek: 8 });

  E('bribe_exposed', 'shady', '📰', 'Your bribe is in the news', 'The inspector got caught. He named everyone who paid him. You\'re on the list.', [
    ['🙏 Admit it and apologize', { cash: -0.8, rep: -5, say: 'A fine and bad press. It could be worse.' }],
    ['⚖️ Deny everything', { chance: { p: 0.3, win: { say: 'No proof. You got away with it.' }, lose: { cash: -1.5, rep: -12, say: 'They had proof. It\'s a disaster.' } } }],
    ['💼 Blame your manager', { chance: { p: 0.4, win: { rep: -3, say: 'People believed it. The team didn\'t.' }, lose: { rep: -10, team: -15, say: 'Nobody believed it. The team is disgusted.' } } }],
    ['🤐 Say nothing', { rep: -8, cash: -1, say: 'The story ran for a week.' }]
  ], { kind: 'news', chainOnly: true });

  E('shady_cash', 'shady', '💵', 'Your accountant has an idea', '"Lots of cash comes in. The tax office doesn\'t have to know all of it."', [
    ['🤫 Do it', { cash: 0.8, next: ['tax_raid', 6, 16, 0.4], say: 'More money. More risk.' }],
    ['🙅 No way', { rep: 1, say: 'You pay every cent.' }],
    ['🚪 Fire the accountant', { say: 'You don\'t want people like that.' }],
    ['🤏 Just a little', { cash: 0.3, next: ['tax_raid', 6, 16, 0.2], say: 'Just a little. It adds up.' }]
  ], { w: 1, cd: 40, minWeek: 12 });

  E('tax_raid', 'shady', '🚨', 'Tax officers are at your door', 'They know about the hidden cash. They want every record.', [
    ['🙏 Confess and pay', { cash: -2, rep: -4, say: 'A huge fine. But it\'s over.' }],
    ['⚖️ Get a top lawyer', { cash: -0.8, chance: { p: 0.5, win: { say: 'The lawyer found a way out.' }, lose: { cash: -2, rep: -6, say: 'You paid the lawyer and the fine.' } } }],
    ['🔥 Hide the records', { chance: { p: 0.2, win: { say: 'They found nothing.' }, lose: { cash: -3, rep: -15, closed: [1, 'Raid'], say: 'Caught hiding evidence. The worst outcome.' } } }],
    ['🧑‍💼 Blame the accountant', { cash: -1, rep: -3, say: 'Half believed. Still a fine.' }]
  ], { chainOnly: true });

  E('shady_reviews', 'shady', '⭐', 'A company sells 5-star reviews', '"500 perfect reviews. Nobody will ever know."', [
    ['💵 Buy 500', { cash: -0.3, rep: 6, next: ['fake_reviews_caught', 4, 10, 0.5], say: 'Five stars everywhere.' }],
    ['🤏 Buy just 50', { cash: -0.1, rep: 2, next: ['fake_reviews_caught', 4, 10, 0.2], say: 'A small boost.' }],
    ['🙅 Earn them honestly', { say: 'Slow, but real.' }],
    ['🚩 Report the company', { rep: 3, say: 'They were shut down.' }]
  ], { w: 1, cd: 40, minWeek: 5 });

  E('fake_reviews_caught', 'shady', '🔍', 'Your fake reviews were exposed', 'A reporter proved hundreds of your reviews are fake.', [
    ['🙏 Apologize', { rep: -6, say: 'People are slowly forgiving you.' }],
    ['🗑️ Delete them all', { rep: -8, say: 'Your rating crashed.' }],
    ['⚖️ Blame a hacker', { chance: { p: 0.3, win: { rep: -2, say: 'Some people believed it.' }, lose: { rep: -12, say: 'Nobody believed it.' } } }],
    ['🎁 Free week to win them back', { cash: -0.5, rep: -3, happy: 5, say: 'Generosity helped.' }]
  ], { kind: 'news', chainOnly: true });

  E('shady_dump', 'shady', '🛢️', 'A cheap way to get rid of waste', 'A man offers to take your waste for half the price. "I know a spot by the river."', [
    ['🤫 Do it', { supply: [-0.03, 12, 'Cheap waste'], next: ['investigation', 4, 12, 0.5], say: 'Cheaper. Don\'t ask where it goes.' }],
    ['♻️ Pay for proper recycling', { supply: [0.01, 12, 'Recycling'], rep: 3, say: 'Clean and legal.' }],
    ['👮 Report him', { rep: 4, say: 'He was arrested.' }],
    ['🙅 No thanks', { say: 'You kept things normal.' }]
  ], { w: 1, cd: 40, minWeek: 10 });

  E('investigation', 'shady', '🔎', 'The police are investigating you', 'They have questions. Lots of them. Reporters are waiting outside.', [
    ['⚖️ Hire a lawyer', { cash: -1, chance: { p: 0.6, win: { say: 'Case closed. You\'re clean on paper.' }, lose: { cash: -1.5, rep: -6, say: 'A big fine.' } } }],
    ['🙏 Cooperate fully', { cash: -1, rep: -2, say: 'Honesty helped. A small fine.' }],
    ['🤐 Say nothing', { rep: -5, chance: { p: 0.5, win: { say: 'They dropped it.' }, lose: { cash: -2, say: 'They found everything.' } } }],
    ['🔥 Destroy evidence', { chance: { p: 0.2, win: { say: 'They found nothing.' }, lose: { cash: -3, rep: -15, closed: [2, 'Shut down'], say: 'Caught. Shut down for two weeks.' } } }]
  ], { chainOnly: true });

  E('shady_books', 'shady', '📒', '{m} wants to "fix" the numbers', '"The bank will give us a bigger loan if the numbers look better."', [
    ['🤫 Let {m} do it', { cash: 1.5, next: ['manager_stealing', 5, 12, 0.5], say: 'Big loan. Fake numbers.' }],
    ['🙅 "Never do that again."', { m: -8, say: '{m} backed off.' }],
    ['🚪 Fire {m}', { fire: 'm', say: 'No liars here.' }],
    ['🔍 Check the books yourself', { cash: -0.2, say: 'You found nothing yet. You\'ll keep watching.' }]
  ], { w: 0.8, cd: 50, minWeek: 15, who: { m: 'mgr' } });

  E('manager_stealing', 'shady', '💸', '{m} has been stealing from you', 'Fixing the numbers made it easy. Money has been disappearing for weeks.', [
    ['👮 Call the police', { fire: 'm', cash: -0.5, rep: 2, say: '{m} was arrested.' }],
    ['🤫 Fire {m} quietly', { fire: 'm', cash: -1, say: 'The money is gone. So is {m}.' }],
    ['💸 Make {m} pay it back', { chance: { p: 0.5, win: { m: -20, say: '{m} is paying it back.' }, lose: { quit: 'm', cash: -1, say: '{m} ran off with it.' } } }],
    ['🙈 Ignore it', { cash: -1.5, say: 'It kept happening.' }]
  ], { chainOnly: true });

  E('shady_stolen', 'shady', '📦', 'Cheap stock that "fell off a truck"', 'A man offers you stock at a quarter of the price. No receipts.', [
    ['🤫 Buy it', { supply: [-0.05, 6, 'Stolen stock'], next: ['investigation', 3, 10, 0.4], say: 'Cheap. Very cheap.' }],
    ['🙅 No', { say: 'You walked away.' }],
    ['👮 Call the police', { rep: 4, say: 'He was a wanted thief.' }],
    ['🤔 Ask for receipts', { say: 'He disappeared.' }]
  ], { w: 1, cd: 40, minWeek: 6 });

  E('protection', 'shady', '🧥', 'Men in suits want "protection money"', '"Nice shop. Would be a shame if something happened to it."', [
    ['💵 Pay them', { cash: -0.4, next: ['protection_again', 4, 8, 0.7], say: 'They left. They\'ll be back.' }],
    ['👮 Go to the police', { chance: { p: 0.6, win: { rep: 5, say: 'They were arrested.' }, lose: { next: ['gang_revenge', 1, 2], say: 'The police did nothing. The men saw you go in.' } } }],
    ['🦺 Hire security', { cash: -0.6, say: 'They didn\'t come back.' }],
    ['🗣️ Tell them to get lost', { chance: { p: 0.4, win: { team: 8, say: 'They left. Your team is impressed.' }, lose: { cash: -0.3, next: ['gang_revenge', 1, 2], say: 'They smiled. "See you soon."' } } }]
  ], { w: 0.8, cd: 50, minWeek: 12 });

  E('protection_again', 'shady', '🧥', 'The men in suits are back', '"The price went up." They want double.', [
    ['💵 Pay again', { cash: -0.8, say: 'This won\'t stop.' }],
    ['👮 Go to the police now', { chance: { p: 0.7, win: { rep: 6, say: 'Arrested. Finally over.' }, lose: { cash: -0.8, say: 'The police did nothing.' } } }],
    ['🧑‍🤝‍🧑 Unite the street', { rep: 6, team: 5, say: 'All the shops stood together. They left.' }],
    ['🦺 Hire security', { cash: -0.6, say: 'They moved on.' }]
  ], { chainOnly: true });

  E('shady_data', 'shady', '📊', 'A company wants your customer list', 'They\'ll pay well for names, emails and what people buy.', [
    ['💰 Sell it', { cash: 1.5, next: ['data_scandal', 4, 12, 0.5], say: 'Easy money.' }],
    ['🙅 Never', { rep: 2, say: 'Your customers\' trust is worth more.' }],
    ['🔒 Improve your security', { cash: -0.2, rep: 3, say: 'Customer data is safer than ever.' }],
    ['📢 Tell customers you said no', { fans: 10, rep: 3, say: 'Customers love it.' }]
  ], { w: 0.8, cd: 50, minWeek: 10 });

  E('data_scandal', 'shady', '📰', 'Your customers found out', 'Everyone is getting spam, and it traces back to you.', [
    ['🙏 Apologize and pay them back', { cash: -1.5, rep: -4, say: 'Expensive, but people respect it.' }],
    ['⚖️ Blame the buyer', { chance: { p: 0.3, win: { rep: -2, say: 'Some believed you.' }, lose: { rep: -12, say: 'Nobody believed you.' } } }],
    ['🎁 Big discount for everyone', { cash: -0.5, rep: -5, say: 'Some came back.' }],
    ['🤐 Say nothing', { rep: -10, demand: [0.85, 6, 'Data scandal'], say: 'Customers left in droves.' }]
  ], { kind: 'news', chainOnly: true });

  E('shady_price_fix', 'shady', '🤝', '{rival} wants a secret deal', '"Let\'s both raise prices. Nobody wins a price war."', [
    ['🤫 Agree', { price: 1, rival: -0.02, next: ['investigation', 5, 12, 0.35], say: 'Prices up everywhere.' }],
    ['🙅 No', { say: 'You keep competing.' }],
    ['📹 Record it and report it', { rival: -0.15, rep: 5, say: '{rival} was fined.' }],
    ['🧊 Pretend to agree', { chance: { p: 0.5, win: { demand: [1.12, 4, 'Undercut rival'], rival: -0.05, say: 'They raised prices. You didn\'t.' }, lose: { rep: -2, say: 'They figured it out.' } } }]
  ], { w: 0.8, cd: 50, minWeek: 12, init: rival });

  E('shady_fake_sale', 'shady', '🏷️', 'A "trick" for a big sale', 'Double your prices on Monday. Then "50% off" on Friday.', [
    ['🤫 Do it', { chance: { p: 0.6, win: { extra: [0.15, 2, 'Fake sale'], say: 'Busy week. Nobody noticed.' }, lose: { rep: -8, say: 'A customer posted the proof.' } } }],
    ['🏷️ Run a real sale', { supply: [0.05, 2, 'Real sale'], demand: [1.15, 2, 'Real sale'], say: 'Honest and busy.' }],
    ['🙅 No sale', { say: 'Normal week.' }],
    ['🎁 A real giveaway', { cash: -0.2, fans: 15, say: 'People loved it.' }]
  ], { w: 1, cd: 40 });

  E('shady_skip_safety', 'shady', '⚠️', 'Skip the safety check?', 'It costs a lot and closes you for a day. "Nobody checks anyway."', [
    ['🤫 Skip it', { chance: { p: 0.7, win: { say: 'Nothing happened.' }, lose: { rep: -3, then: 'safety_victim', say: 'You heard a scream from the back.' } } }],
    ['✅ Do the check', { cash: -0.3, closed: [1, 'Safety check'], say: 'All safe.' }],
    ['⏳ Do it next month', { chance: { p: 0.85, win: { say: 'Nothing happened. You did it later.' }, lose: { cash: -1, rep: -4, say: 'Something broke before you did it.' } } }],
    ['🧰 Do it at night', { cash: -0.4, team: -4, say: 'Safe. The team worked late.' }]
  ], { w: 1, cd: 40 });

  E('shady_hitpiece', 'shady', '📰', 'A journalist can write about {rival}', '"For a fee, I can write a very bad story about them."', [
    ['💵 Pay for it', { cash: -0.5, chance: { p: 0.6, win: { rival: -0.15, say: 'The story hurt them.' }, lose: { rep: -10, say: 'The journalist sold you out.' } } }],
    ['🙅 No', { say: 'You win the right way.' }],
    ['📢 Expose the journalist', { rep: 4, say: 'The paper fired him.' }],
    ['📰 Pay for a true story about you', { cash: -0.3, fans: 15, say: 'A nice article about you.' }]
  ], { w: 0.8, cd: 45, minWeek: 10, init: rival });

  E('shady_launder', 'shady', '💼', 'A stranger wants to pay in cash', 'Bags of cash for a huge order. He doesn\'t care about the price.', [
    ['💰 Take the cash', { cash: 2, next: ['investigation', 4, 12, 0.5], say: 'The money is real. Where it came from isn\'t clear.' }],
    ['🧾 Only with bank transfer', { say: 'He walked away.' }],
    ['👮 Call the police', { rep: 5, say: 'He was a wanted criminal.' }],
    ['🙅 Say no', { say: 'You didn\'t like his smile.' }]
  ], { w: 0.6, cd: 60, minWeek: 15 });

  E('shady_recipe', 'shady', '📜', 'Someone offers {rival}\'s secrets', 'An ex-worker of {rival} will sell you their secret recipes.', [
    ['💵 Buy them', { cash: -0.4, demand: [1.1, 8, 'Rival secrets'], rival: -0.05, next: ['investigation', 4, 12, 0.3], say: 'Their secrets are yours.' }],
    ['🙅 No', { say: 'You walked away.' }],
    ['📞 Warn {rival}', { rep: 5, rival: 0.03, say: '{rival} was stunned. They owe you.' }],
    ['🧑‍🍳 Hire them instead', { hireSpecial: { role: 'front', skill: 70 }, say: 'Skilled worker. No secrets.' }]
  ], { w: 0.8, cd: 45, minWeek: 10, init: rival });

  E('shady_off_books', 'shady', '🤫', 'Hire workers without contracts?', 'Cheaper, no taxes, no paperwork. Very illegal.', [
    ['🤫 Do it', { capacity: [1.1, 8, 'Off-book workers'], next: ['investigation', 4, 12, 0.4], say: 'More hands. Big risk.' }],
    ['📝 Hire them properly', { hireSpecial: { role: 'front', skill: 50 }, say: 'Legal and fair.' }],
    ['🙅 No', { say: 'You kept it clean.' }],
    ['🕐 Pay overtime instead', { cash: -0.2, capacity: [1.05, 4, 'Overtime'], say: 'The team earns more.' }]
  ], { w: 0.8, cd: 45 });

  // =====================================================================
  // 🚨 TROUBLE
  // =====================================================================

  E('protest', 'trouble', '📢', 'People are protesting outside', 'They say you treat workers badly. Signs, chants, cameras.', [
    ['🗣️ Talk to them', { chance: { p: 0.6, win: { rep: 4, say: 'You listened. They left satisfied.' }, lose: { rep: -3, say: 'It turned into a shouting match.' } } }],
    ['💵 Raise pay for everyone', { teamRaise: 0.05, team: 10, rep: 5, say: 'The protest turned into a party.' }],
    ['👮 Call the police', { rep: -5, say: 'The photos looked bad.' }],
    ['🔒 Close for the day', { closed: [1, 'Protest'], say: 'They left. For now.' }]
  ], { w: 1, cd: 40, minWeek: 10, cond: function (g) { return g.employees.some(function (e) { return e.morale < 40; }); } });

  E('rats', 'trouble', '🐀', 'You saw a rat in the shop', 'Then another. A customer saw one too.', [
    ['🔒 Close and call pest control', { cash: -0.3, closed: [1, 'Pest control'], say: 'Gone. Clean.' }],
    ['🪤 Traps at night', { cash: -0.1, chance: { p: 0.6, win: { say: 'All caught.' }, lose: { rep: -5, say: 'A customer posted a video.' } } }],
    ['🐱 Get a shop cat', { pet: '🐱', team: 5, say: 'No more rats.' }],
    ['🤐 Hope nobody saw', { chance: { p: 0.3, win: { say: 'Lucky.' }, lose: { rep: -8, say: 'The health office got a complaint.' } } }]
  ], { w: 1.2, cd: 35 });

  E('gas_leak', 'trouble', '💨', 'You smell gas', 'Faint, but it\'s there. The shop is full of customers.', [
    ['🚪 Everyone out, now', { closed: [1, 'Gas leak'], rep: 4, say: 'It was a real leak. You did the right thing.' }],
    ['📞 Call the gas company', { chance: { p: 0.6, win: { say: 'Small leak. Fixed fast.' }, lose: { closed: [1, 'Gas leak'], cash: -0.3, say: 'They closed you down for a week.' } } }],
    ['🔍 Look for it yourself', { chance: { p: 0.5, win: { say: 'A loose pipe. Fixed.' }, lose: { closed: [1, 'Gas leak'], cash: -0.6, say: 'You made it worse.' } } }],
    ['🤷 Probably nothing', { chance: { p: 0.5, win: { say: 'It went away.' }, lose: { closed: [2, 'Gas leak'], rep: -10, cash: -1, say: 'People got sick. A disaster.' } } }]
  ], { w: 0.8, cd: 50 });

  E('worker_arrested', 'trouble', '🚓', '{a} was arrested', 'Last night, for a fight at a bar. {a} is calling from the station.', [
    ['💵 Pay the bail', { cash: -0.2, a: 20, loyal: { a: 20 }, say: '{a} will never forget it.' }],
    ['🚪 Fire {a}', { fire: 'a', say: 'You don\'t want trouble.' }],
    ['⚖️ Get {a} a lawyer', { cash: -0.4, a: 15, loyal: { a: 15 }, say: 'Charges dropped.' }],
    ['⏳ Wait and see', { capacity: [0.95, 1, '{a} missing'], a: -10, say: '{a} came back two days later. Upset.' }]
  ], { w: 1, cd: 40, who: { a: 'aggressive' } });

  E('noise_complaint', 'trouble', '🔊', 'Neighbors are complaining about noise', 'The city says you must fix it or pay a fine.', [
    ['🔇 Soundproof the walls', { cash: -0.6, say: 'Quiet as a library.' }],
    ['🕐 Close earlier', { capacity: [0.92, 8, 'Shorter hours'], say: 'Fewer hours, no complaints.' }],
    ['🎁 Gifts for the neighbors', { cash: -0.1, chance: { p: 0.6, win: { rep: 2, say: 'They withdrew the complaint.' }, lose: { cash: -0.3, say: 'They still complained.' } } }],
    ['💸 Pay the fine', { cash: -0.3, say: 'They\'ll complain again.' }]
  ], { w: 1, cd: 40 });

  E('bad_article', 'trouble', '📰', 'A newspaper wrote a nasty story about you', 'Half true, half made up. It\'s on the front page.', [
    ['📰 Demand a correction', { chance: { p: 0.5, win: { rep: 3, say: 'They printed a correction.' }, lose: { rep: -3, say: 'They refused.' } } }],
    ['⚖️ Sue the newspaper', { cash: -0.6, chance: { p: 0.4, win: { cash: 1.5, rep: 4, say: 'You won.' }, lose: { rep: -4, say: 'You lost. More bad press.' } } }],
    ['📱 Tell your side online', { fans: 10, rep: 1, say: 'Your fans believed you.' }],
    ['🤐 Ignore it', { rep: -4, say: 'It faded after a week.' }]
  ], { w: 1, cd: 40, minWeek: 10 });

  E('data_leak', 'trouble', '🔓', 'Customer data was leaked', 'Hackers got into your system. Customers\' emails are out.', [
    ['📢 Tell customers right away', { rep: -2, fans: 5, say: 'People respected the honesty.' }],
    ['🧑‍💻 Hire experts to fix it', { cash: -0.6, say: 'Fixed. Safer than ever.' }],
    ['🎁 Free credit checks for all', { cash: -0.4, rep: 3, say: 'Customers felt looked after.' }],
    ['🤐 Keep it quiet', { chance: { p: 0.4, win: { say: 'Nobody found out.' }, lose: { rep: -12, cash: -1, say: 'It came out. You hid it. Big fine.' } } }]
  ], { w: 0.8, cd: 50, minWeek: 12 });

  E('van_towed', 'trouble', '🚛', 'Your delivery van got towed', 'Full of orders. Customers are waiting.', [
    ['💸 Pay and get it back', { cash: -0.1, say: 'Late, but delivered.' }],
    ['🚕 Deliver by taxi', { cash: -0.2, rep: 2, say: 'Every order arrived.' }],
    ['🙏 Call customers and apologize', { happy: -2, say: 'Most were understanding.' }],
    ['😤 Fight the ticket', { chance: { p: 0.4, win: { say: 'You won. Free.' }, lose: { cash: -0.2, happy: -3, say: 'You lost the day and the fight.' } } }]
  ], { w: 1, cd: 35 });

  E('sinkhole', 'trouble', '🕳️', 'A hole opened in the road outside', 'Your front door is blocked. Nobody can get in.', [
    ['🚪 Open the back door', { demand: [0.85, 2, 'Blocked door'], say: 'Customers found the back door.' }],
    ['🛵 Delivery only', { demand: [0.8, 2, 'Blocked door'], say: 'Delivery saved the week.' }],
    ['🏛️ Push the city to fix it', { chance: { p: 0.5, win: { demand: [0.95, 1, 'Blocked door'], say: 'Fixed in days.' }, lose: { demand: [0.75, 3, 'Blocked door'], say: 'It took weeks.' } } }],
    ['🔒 Close until it\'s fixed', { closed: [1, 'Blocked door'], say: 'A lost week.' }]
  ], { w: 0.6, cd: 60 });

  E('extortion_call', 'trouble', '📞', 'A caller says they have your secrets', '"Pay me or I send your private emails to the news."', [
    ['💵 Pay', { cash: -0.5, chance: { p: 0.5, win: { say: 'They went away.' }, lose: { cash: -0.5, say: 'They asked for more.' } } }],
    ['👮 Call the police', { rep: 2, say: 'It was a scam. They had nothing.' }],
    ['🙅 Ignore them', { chance: { p: 0.8, win: { say: 'A bluff. Nothing happened.' }, lose: { rep: -5, say: 'They leaked something embarrassing.' } } }],
    ['📢 Go public first', { fans: 10, rep: 3, say: 'You beat them to it.' }]
  ], { w: 0.8, cd: 50, minWeek: 15 });

  E('lockout', 'trouble', '🔐', 'The landlord changed the locks', 'He says your rent was late. It wasn\'t. You can\'t get in.', [
    ['⚖️ Call a lawyer', { cash: -0.3, closed: [1, 'Locked out'], say: 'Back in. He paid your costs.' }],
    ['💵 Just pay him', { cash: -0.5, say: 'Back in by lunch.' }],
    ['🧑‍🔧 Call a locksmith', { chance: { p: 0.5, win: { say: 'You\'re in. It was legal.' }, lose: { cash: -0.5, say: 'That was not legal. A fine.' } } }],
    ['📢 Tell everyone online', { fans: 15, chance: { p: 0.6, win: { say: 'The pressure worked. He opened up.' }, lose: { closed: [1, 'Locked out'], say: 'He didn\'t care.' } } }]
  ], { w: 0.6, cd: 60, minWeek: 10 });

  E('injury_lawsuit', 'trouble', '⚖️', 'An ex-worker is suing you', '{name} says they were fired unfairly. They want {amt}.', [
    ['⚖️ Fight it', { cash: -0.3, chance: { p: 0.6, win: { say: 'You won. The firing was fair.' }, lose: { cash: -1, say: 'You lost.' } } }],
    ['🤝 Settle', { cash: -0.6, say: 'Done.' }],
    ['📂 Show your records', { chance: { p: 0.5, win: { say: 'Your records saved you.' }, lose: { cash: -0.8, say: 'The records weren\'t good enough.' } } }],
    ['💬 Talk to them directly', { chance: { p: 0.5, win: { cash: -0.2, say: 'They dropped it for a small payment.' }, lose: { cash: -0.8, say: 'It made things worse.' } } }]
  ], { w: 0.8, cd: 50, minWeek: 12, init: function (g, c) { person(g, c); amt(0.8)(g, c); } });

  // =====================================================================
  // 🕊️ SAD GOODBYES
  // =====================================================================

  E('old_worker_passed', 'team', '🕊️', 'Goodbye, {a}', '{a}, one of your oldest workers, passed away in their sleep. The team is heartbroken.', [
    ['🕯️ Close for a day for {a}', { die: 'a', closed: [1, 'Memorial day'], team: 8, rep: 3, say: 'Everyone shared their favorite stories about {a}.' }],
    ['🌳 Plant a tree in their name', { die: 'a', cash: -0.1, team: 5, rep: 4, say: 'The {a} tree grows outside now.' }],
    ['💐 Pay for the funeral', { die: 'a', cash: -0.6, team: 10, rep: 6, say: 'The family came by to thank you.' }],
    ['🖼️ Their photo on the wall', { die: 'a', team: 6, say: '{a} will never be forgotten here.' }]
  ], { w: 0.6, cd: 40, minWeek: 20, who: { a: 'old' } });

  E('sick_worker_passed', 'team', '🕯️', 'We lost {a}', '{a} was sick for a long time. They passed away this week.', [
    ['🎓 A school fund for their kids', { die: 'a', cash: -0.8, team: 12, rep: 8, say: 'Their kids will go to school thanks to you.' }],
    ['🕯️ A memorial with the team', { die: 'a', team: 10, say: 'Everyone said goodbye together.' }],
    ['🏖️ A day off for everyone', { die: 'a', closed: [1, 'Day off'], team: 12, say: 'Everyone needed that day together.' }],
    ['💪 Keep going, for {a}', { die: 'a', team: 4, say: '{a} would have wanted that.' }]
  ], { rarity: 'rare', w: 0.4, cd: 60, minWeek: 30, need: 3, who: { a: 'veteran' } });

  E('pet_passed', 'team', '🥀', 'Your shop pet {pet} passed away', '{pet} got very old. Customers are leaving flowers at the door.', [
    ['🪦 A small goodbye', { run: noPet, team: 4, happy: 3, say: 'Everyone came to say goodbye.' }],
    ['🐾 Adopt a shelter pet', { run: function (g) { g.pet = U.pick(PETS); return 'Meet ' + g.pet + '. The shop feels alive again.'; }, team: 6, fans: 8 }],
    ['🖼️ A painting by the door', { run: noPet, cash: -0.1, fans: 10, say: 'Customers stop to look at it.' }],
    ['🏷️ Make {pet} part of the logo', { run: noPet, fans: 15, rep: 2, say: '{pet} watches over the shop forever.' }]
  ], { w: 0.6, cd: 50, minWeek: 15, cond: hasPet, init: petCtx });

  E('customer_passed', 'customers', '💐', 'Goodbye, Mrs. Wilson', 'She came in every day for years. She passed away this week.', [
    ['🏷️ Name a product after her', { fans: 15, rep: 4, say: '"The Wilson" became a best seller.' }],
    ['🎁 Free treats in her memory', { cash: -0.2, happy: 6, rep: 3, say: 'Everyone raised a glass to her.' }],
    ['🪑 A bench with her name', { cash: -0.1, rep: 5, say: 'People sit on her bench every day.' }],
    ['💌 A card for her family', { rep: 2, say: 'They framed it.' }]
  ], { w: 0.6, cd: 50, minWeek: 12 });

  E('rival_boss_passed', 'rivals', '📰', 'The founder of {rival} passed away', 'Their company is in chaos. Nobody knows who\'s in charge.', [
    ['💐 Send flowers and kind words', { rep: 4, say: 'Even their workers said thank you.' }],
    ['💼 Offer to buy their company', { cash: -2, chance: { p: 0.35, win: { rival: -0.3, demand: [1.1, 12, 'Bought rival shops'], say: 'They sold you their best shops.' }, lose: { rep: -3, say: '"Too soon." People thought it was cold.' } } }],
    ['🤝 Hire their best worker', { hireSpecial: { role: 'front', skill: 75 }, rival: -0.05, say: 'Their best worker joined you.' }],
    ['🕊️ Give them space', { say: 'You let them grieve.' }]
  ], { kind: 'news', w: 0.4, cd: 80, minWeek: 25, init: rival });

  E('legend_passed', 'world', '🕊️', 'A business legend died at 101', 'The founder of the first {industry} chain in the world. Everyone is talking about it.', [
    ['🏷️ A tribute sale', { demand: [1.12, 2, 'Tribute sale'], rep: 2, say: 'Customers came to remember a legend.' }],
    ['🤫 A minute of silence', { rep: 3, team: 3, say: 'Everyone stopped. Beautiful.' }],
    ['📖 Share their story with the team', { team: 5, say: 'The team was inspired.' }],
    ['💼 Business as usual', { say: 'You kept working.' }]
  ], { kind: 'news', w: 0.5, cd: 80, minWeek: 10 });

  // More of your life and more trouble.
  E('sibling_rival', 'boss', '👫', 'Your sister opened a rival business', 'Same kind of shop. Three streets away. Your mom is upset.', [
    ['🤝 Offer to team up', { chance: { p: 0.6, win: { demand: [1.06, 12, 'Family team'], say: 'Two shops, one family.' }, lose: { say: 'She wants to beat you.' } } }],
    ['🏆 Compete fairly', { team: 4, say: 'May the best one win.' }],
    ['🎁 Send her customers', { rep: 4, demand: [0.97, 6, 'Shared customers'], say: 'Your mom is proud.' }],
    ['😤 Crush her', { demand: [1.05, 6, 'Family war'], rep: -3, say: 'Family dinners are cold now.' }]
  ], { w: 0.6, cd: 80, minWeek: 20 });

  E('book_deal', 'boss', '📚', 'A publisher wants your life story', '"How I built {company}." They\'ll pay an advance.', [
    ['✍️ Write it yourself', { cash: 0.5, fans: 30, capacity: [0.95, 6, 'Writing a book'], say: 'A bestseller.' }],
    ['🧑‍💼 Use a ghostwriter', { cash: 0.3, fans: 20, say: 'A good book. Not your words.' }],
    ['📖 Only the real, hard parts', { cash: 0.5, rep: 6, fans: 25, say: 'Honest and moving.' }],
    ['🙅 Not yet', { say: 'Maybe when you\'re bigger.' }]
  ], { w: 0.6, cd: 80, minWeek: 30 });

  E('old_teacher', 'boss', '🧑‍🏫', 'Your old teacher walked in', 'The one who said you\'d "never amount to anything".', [
    ['😊 Welcome them warmly', { rep: 3, say: 'They said sorry. You both laughed.' }],
    ['🎁 On the house', { rep: 2, say: '"I was wrong about you."' }],
    ['😏 Remind them what they said', { team: 3, say: 'Your team loved it. The teacher didn\'t.' }],
    ['💼 Treat them like anyone', { say: 'They left a big tip.' }]
  ], { w: 0.8, cd: 80, minWeek: 10 });

  E('boss_tv_interview', 'boss', '📺', 'A TV show wants to interview you', 'Live, on the morning show. Millions watching.', [
    ['🎤 Go, and be yourself', { chance: { p: 0.7, win: { fans: 40, rep: 4, say: 'People loved you.' }, lose: { fans: 10, rep: -3, say: 'You froze on a question.' } } }],
    ['📋 Prepare with a coach', { cash: -0.1, fans: 35, rep: 5, say: 'Smooth and sharp.' }],
    ['🧑‍🤝‍🧑 Bring your team', { fans: 30, team: 8, say: 'The team loved being on TV.' }],
    ['🙅 Too nervous', { say: 'They invited {rival} instead.' }]
  ], { w: 0.8, cd: 50, minWeek: 12, init: rival });

  E('friend_betrayal', 'boss', '🗡️', 'Your best friend on the team betrayed you', '{a} has been telling {rival} your plans.', [
    ['🚪 Fire {a}', { fire: 'a', rival: -0.03, say: 'It hurt. But it had to be done.' }],
    ['💬 Ask why', { chance: { p: 0.5, win: { a: 10, loyal: { a: 20 }, say: '{rival} threatened {a}\'s family. You helped.' }, lose: { quit: 'a', say: '{a} had no good answer.' } } }],
    ['🎭 Feed them fake plans', { rival: -0.1, say: '{rival} fell for your fake plans.' }],
    ['⚖️ Sue {a}', { fire: 'a', cash: -0.3, rep: -2, say: 'Messy.' }]
  ], { w: 0.6, cd: 60, minWeek: 15, who: { a: 'veteran' }, init: rival });

  E('car_crash_shop', 'trouble', '🚗', 'A car crashed into your shop', 'Through the front window. Nobody hurt, but the front is destroyed.', [
    ['🔧 Rebuild fast', { cash: -0.6, closed: [1, 'Crash repairs'], say: 'Open again in a week.' }],
    ['📄 The driver\'s insurance', { chance: { p: 0.7, win: { closed: [1, 'Crash repairs'], say: 'They paid for everything.' }, lose: { cash: -0.6, closed: [1, 'Crash repairs'], say: 'They fought it. You paid.' } } }],
    ['🏪 Stay open, round the back', { cash: -0.6, capacity: [0.8, 2, 'Crash damage'], fans: 10, say: 'Customers loved your spirit.' }],
    ['🛡️ Posts to stop cars', { cash: -0.8, closed: [1, 'Crash repairs'], rep: 2, say: 'Never again.' }]
  ], { w: 0.6, cd: 60 });

  E('identity_theft', 'trouble', '🪪', 'Someone opened loans in your company\'s name', 'The bank says you owe money you never borrowed.', [
    ['👮 Police and bank', { cash: -0.2, say: 'Sorted, after weeks.' }],
    ['🧑‍⚖️ A lawyer', { cash: -0.4, say: 'Fixed fast.' }],
    ['🔒 Lock everything down', { cash: -0.2, rep: 1, say: 'Safer now.' }],
    ['💸 Just pay it', { cash: -1, say: 'The thief got away with it.' }]
  ], { w: 0.6, cd: 60, minWeek: 10 });

  E('water_bad', 'trouble', '🚱', 'The water supply is contaminated', 'The city says don\'t use tap water for three days.', [
    ['💧 Buy bottled water', { cash: -0.3, say: 'You stayed open.' }],
    ['🔒 Close for three days', { closed: [1, 'No water'], say: 'Safe.' }],
    ['🍽️ Limited menu', { capacity: [0.8, 1, 'No water'], say: 'Open, but slow.' }],
    ['🤷 Use it anyway', { chance: { p: 0.3, win: { say: 'Nobody got sick.' }, lose: { rep: -12, closed: [1, 'Health order'], say: 'Customers got sick.' } } }]
  ], { w: 0.8, cd: 60, cond: H.tag('food') });

  E('fake_inspector', 'trouble', '🕵️', 'A fake inspector is demanding cash', 'He has a badge and a clipboard. Something feels off.', [
    ['📞 Call the city to check', { rep: 3, say: 'Fake. He ran.' }],
    ['👮 Call the police', { rep: 4, say: 'Arrested. He\'d scammed ten shops.' }],
    ['💸 Pay him', { cash: -0.3, say: 'You found out later he was fake.' }],
    ['🚪 Ask him to leave', { say: 'He left fast.' }]
  ], { w: 0.8, cd: 50 });

  E('graffiti', 'trouble', '🎨', 'Someone sprayed your shop with graffiti', 'Ugly tags all over the front. It happened overnight.', [
    ['🧽 Clean it today', { cash: -0.1, say: 'Clean again.' }],
    ['🎨 Hire an artist for a mural', { cash: -0.4, fans: 25, rep: 3, say: 'Your wall is a local landmark now.' }],
    ['📹 Put up a camera', { cash: -0.3, say: 'It never happened again.' }],
    ['🤷 Leave it', { rep: -3, happy: -2, say: 'The shop looks rough.' }]
  ], { w: 1, cd: 40 });

  E('charity_run', 'boss', '🏃', 'Run a marathon for charity?', 'A children\'s charity asks you to run. You haven\'t trained.', [
    ['🏃 Train and run it', { team: 5, chance: { p: 0.6, win: { rep: 6, fans: 25, say: 'You finished. The team cheered.' }, lose: { rep: 3, say: 'You didn\'t finish. People still donated.' } } }],
    ['🧑‍🤝‍🧑 Run it as a team', { team: 12, rep: 5, fans: 20, say: 'Everyone crossed the line together.' }],
    ['💰 Just donate', { cash: -0.3, rep: 4, say: 'Kind, and easy on the legs.' }],
    ['🙅 No time', { say: 'Maybe next year.' }]
  ], { w: 0.8, cd: 60 });

  // More of your life and more trouble (v6).
  E('graduation_speech', 'boss', '🎓', 'Your old school wants you to give a speech', 'At graduation. Hundreds of students and parents. You\'ve never spoken in public.', [
    ['🎤 Say yes and prepare', { chance: { p: 0.7, win: { rep: 6, fans: 25, say: 'A standing ovation. It went viral.' }, lose: { rep: 2, say: 'You were nervous. They clapped anyway.' } } }],
    ['😬 Say yes, improvise', { chance: { p: 0.4, win: { rep: 6, fans: 25, say: 'Your honest speech was the best one.' }, lose: { rep: -2, say: 'You forgot everything. Awkward.' } } }],
    ['🎁 Offer a scholarship instead', { cash: -0.5, rep: 8, say: 'Your name is on a scholarship now.' }],
    ['🙅 Politely say no', { say: 'Maybe next year.' }]
  ], { w: 0.7, cd: 80, minWeek: 20 });

  E('interview_mistake', 'boss', '🎙️', 'You said something wrong in an interview', 'You joked about your customers. The clip is everywhere, without the context.', [
    ['🙏 Apologize right away', { rep: 1, say: 'People accepted it.' }],
    ['🎥 Post the full interview', { chance: { p: 0.6, win: { rep: 2, say: 'With context, it was clearly a joke.' }, lose: { rep: -4, say: 'People didn\'t watch the full video.' } } }],
    ['🎁 A thank-you week for customers', { cash: -0.3, happy: 6, say: 'Actions spoke louder than words.' }],
    ['🤐 Say nothing', { rep: -5, say: 'It took weeks to go away.' }]
  ], { w: 0.8, cd: 60, minWeek: 10 });

  E('power_surge', 'trouble', '⚡', 'A power surge fried your machines', 'A lightning storm. Half your equipment won\'t turn on.', [
    ['🔧 Repair what you can', { cash: -0.5, capacity: [0.85, 2, 'Broken machines'], say: 'Back to normal in two weeks.' }],
    ['🆕 Replace everything', { cash: -1.2, equip: 0.03, say: 'New machines. Faster than before.' }],
    ['📄 Call insurance', { chance: { p: function (g) { return g.flags.insured ? 0.9 : 0.3; }, win: { cash: -0.1, say: 'Insurance paid for it all.' }, lose: { cash: -0.9, say: 'Not covered.' } } }],
    ['🛡️ Surge protectors for all', { cash: -0.8, say: 'Fixed, and it won\'t happen again.' }]
  ], { w: 0.7, cd: 60 });

  E('bees_in_sign', 'trouble', '🐝', 'Bees built a nest in your sign', 'Thousands of them. Customers are scared to walk in.', [
    ['🐝 Call a beekeeper', { cash: -0.1, rep: 3, say: 'He moved them safely. And gave you a jar of honey.' }],
    ['🧪 Call pest control', { cash: -0.1, rep: -2, say: 'Gone. Some people were sad about the bees.' }],
    ['🍯 Keep them and sell honey', { happy: -3, fans: 20, extra: [0.04, 8, 'Shop honey'], say: '"Shop honey" sells out every week.' }],
    ['🚪 Use the back door', { happy: -4, say: 'Confusing, but it works.' }]
  ], { w: 0.6, cd: 80 });

  E('shady_counterfeit', 'shady', '🏷️', 'A supplier offers fake brand-name stock', 'Looks exactly like the real thing. A quarter of the price.', [
    ['🤫 Buy it', { supply: [-0.05, 8, 'Fake stock'], next: ['investigation', 4, 10, 0.5], say: 'Cheap stock. Big risk.' }],
    ['🙅 No', { say: 'You sell the real thing.' }],
    ['👮 Report him', { rep: 4, say: 'He was shut down.' }],
    ['📸 Warn other shops', { rep: 3, say: 'Nobody bought from him.' }]
  ], { w: 0.7, cd: 60, minWeek: 8 });
})();
