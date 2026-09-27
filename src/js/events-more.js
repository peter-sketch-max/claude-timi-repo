// All events, part 2: customers, running the business, money and social media.
// See the top of events.js for the event format and the style rules. Every question has exactly 4 responses.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var U = CS.U, G = CS.G, H = CS.EVH, E = CS.E;
  var rival = H.rival, amt = H.amt, noCams = H.noCams, hasRole = H.hasRole, busy = H.busy, person = H.person;
  var FOOD = H.tag('food');
  var REVIEWERS = ['Karen B.', 'Mike T.', 'Sofia L.', 'Joe R.', 'Jenny K.', 'Tom W.', 'Lily P.', 'Carlos M.', 'Anna S.', 'Dave H.'];
  var reviewer = function (g, c) { c.who2 = U.pick(REVIEWERS); };
  var satP = function (hi, lo) { return function (g) { return g.satisfaction > 60 ? hi : lo; }; };

  // =====================================================================
  // 🛍️ CUSTOMERS
  // =====================================================================

  E('customer_yell', 'customers', '😡', 'A customer is screaming at you', 'In front of everyone. "Worst {industry} in {city}!" Phones are out.', [
    ['🙏 Stay calm and apologize', { happy: 3, rep: 2, say: 'They ran out of steam. People respected how calm you were.' }],
    ['🎁 Give them a full refund', { cash: -0.05, chance: { p: 0.6, win: { happy: 2, say: 'They took the money and left quietly.' }, lose: { rep: -2, say: 'They took the money and still left a bad review.' } } }],
    ['😤 Yell back', { chance: { p: 0.3, win: { fans: 10, say: 'The crowd clapped. Somehow you won.' }, lose: { rep: -6, say: 'The video of you yelling is everywhere.' } } }],
    ['🚪 "Get out. You\'re banned."', { rep: -1, team: 4, say: 'Your team cheered when the door closed.' }]
  ], { w: 3, cd: 10 });

  E('customer_yell_worker', 'customers', '📢', 'A customer is screaming at {a}', '{a} is shaking. The customer says their order was wrong. It wasn\'t.', [
    ['🛡️ Step in and defend {a}', { a: 15, loyal: { a: 15 }, happy: -2, say: '{a} will never forget you had their back.' }],
    ['🙏 Apologize for {a}', { happy: 3, a: -12, say: 'The customer calmed down. {a} feels thrown under the bus.' }],
    ['🎁 Free order to end it', { cash: -0.05, a: 4, say: 'They grabbed the free food and left.' }],
    ['🚪 Ban the customer', { a: 10, team: 5, rep: -1, say: 'The team clapped as security walked them out.' }]
  ], { w: 2.5, cd: 10, who: { a: 'front' } });

  E('slapped_you', 'customers', '✋', 'A customer slapped you', 'Their order was late. They slapped you across the face in front of everyone.', [
    ['👮 Call the police', { rep: 3, say: 'They were arrested outside. Customers were shocked.' }],
    ['✋ Slap them back', { chance: { p: 0.25, win: { fans: 15, say: 'Somehow the video made you look like a hero.' }, lose: { rep: -8, cash: -0.5, say: 'They sued you. The video only showed your slap.' } } }],
    ['🧊 Stay calm and walk away', { rep: 4, team: 5, say: 'Your team saw how calm you were. Respect.' }],
    ['🚫 Ban them for life', { rep: 1, team: 3, say: 'Their photo is now behind the counter.' }]
  ], { w: 1.5, cd: 25 });

  E('slapped_worker', 'customers', '✋', 'A customer slapped {a}', 'Over a coupon that had expired. {a} is in shock.', [
    ['👮 Call the police', { a: 12, team: 6, say: 'The customer was arrested. {a} feels protected.' }],
    ['🏠 Send {a} home, paid', { a: 15, loyal: { a: 10 }, capacity: [0.95, 1, '{a} home'], say: '{a} needed the day. They\'re grateful.' }],
    ['🦺 Hire a security guard', { cash: -0.4, team: 10, rep: 2, say: 'Nobody will try that again.' }],
    ['🤐 Keep it quiet', { a: -20, team: -8, say: 'The team can\'t believe you did nothing.' }]
  ], { w: 1.5, cd: 25, who: { a: 'front' } });

  E('karen_manager', 'customers', '🗣️', '"I want to speak to the owner"', 'A customer wants 50% off because the music was "too loud". The line is growing.', [
    ['💸 Give them the discount', { cash: -0.03, happy: -2, say: 'They left smiling. The people in line saw everything.' }],
    ['🙂 Politely say no', { chance: { p: 0.6, win: { rep: 2, say: 'They grumbled and paid in full.' }, lose: { rep: -2, say: 'They left a 1-star review. "Rude owner."' } } }],
    ['🔉 Turn the music down', { happy: 1, say: 'They paid full price and left.' }],
    ['🚪 Ask them to leave', { team: 4, say: 'The line clapped. Your team loved it.' }]
  ], { w: 2.5, cd: 12 });

  E('shoplifter', 'customers', '🏃', 'A shoplifter just ran out', 'They grabbed an armful of stock and ran for the door.', [
    ['🏃 Chase them yourself', { chance: { p: 0.45, win: { rep: 4, fans: 10, say: 'You caught them two blocks away.' }, lose: { cash: -0.2, say: 'You lost them in the crowd.' } } }],
    ['👮 Call the police', { chance: { p: 0.5, win: { rep: 2, say: 'The police caught them. Stock returned.' }, lose: { cash: -0.2, say: 'The police never found them.' } } }],
    ['📹 Post the video online', { chance: { p: 0.6, win: { fans: 12, say: 'Someone recognized them. They returned it all.' }, lose: { cash: -0.2, say: 'Lots of views. No thief.' } } }],
    ['🤷 Let it go', { cash: -0.2, team: -2, say: 'Your team saw you do nothing.' }]
  ], { w: 2, cd: 12, cond: noCams });

  E('slip_lawsuit', 'customers', '⚖️', 'A customer slipped and is suing', 'They fell on a wet floor. Their lawyer wants {amt}.', [
    ['💸 Pay it', { cash: -1, say: 'Paid. The case is closed.' }],
    ['⚖️ Fight it in court', { chance: { p: 0.5, win: { rep: 2, say: 'The camera showed they faked the fall. You won.' }, lose: { cash: -1.8, rep: -3, say: 'You lost, and paid the lawyers too.' } } }],
    ['🤝 Offer half', { chance: { p: 0.6, win: { cash: -0.5, say: 'They took half. Done.' }, lose: { cash: -1.2, say: 'They said no. You ended up paying more.' } } }],
    ['🧯 Pay, and buy anti-slip mats', { cash: -1.2, rep: 3, equip: 0.01, say: 'Paid, and it won\'t happen again.' }]
  ], { w: 1.5, cd: 25, init: amt(1) });

  E('food_poisoning', 'customers', '🤢', 'Customers got sick after eating here', 'Five people are sick. The health office is asking questions.', [
    ['🔒 Close and deep-clean', { closed: [1, 'Deep clean'], rep: 3, say: 'You found the bad batch. It won\'t happen again.' }],
    ['💸 Pay their doctor bills', { cash: -0.6, rep: 2, say: 'The families were grateful. No lawsuits.' }],
    ['🔍 Blame the supplier', { chance: { p: 0.5, win: { rep: 1, say: 'Tests proved it was the supplier.' }, lose: { rep: -8, say: 'It was your kitchen. Now you look like a liar.' } } }],
    ['🙈 Stay open like nothing happened', { chance: { p: 0.4, win: { say: 'No one else got sick. Lucky.' }, lose: { rep: -12, closed: [2, 'Shut down'], say: 'More people got sick. The city shut you down.' } } }]
  ], { w: 1.2, cd: 30, cond: FOOD });

  E('refund_scam', 'customers', '🧾', 'Is this customer scamming you?', 'They want a refund for the fifth time this month. Always a new excuse.', [
    ['💸 Refund again', { cash: -0.05, say: 'They\'ll be back next week.' }],
    ['🔍 Check the receipts', { chance: { p: 0.7, win: { cash: 0.1, say: 'Fake receipts. They left fast.' }, lose: { rep: -2, say: 'The receipts were real. Awkward.' } } }],
    ['🚫 Ban them', { rep: -1, say: 'They told their friends you\'re rude.' }],
    ['📜 New refund rules for everyone', { happy: -2, cash: 0.1, say: 'Refund scams stopped. Honest customers grumbled.' }]
  ], { w: 1.5, cd: 20 });

  E('influencer_blackmail', 'customers', '📸', 'An influencer wants free stuff', '"Free stuff for a month, or I tell my 200,000 followers you\'re awful."', [
    ['🎁 Give it to them', { cash: -0.4, fans: 8, say: 'They posted nice things. It felt gross.' }],
    ['🚫 Say no', { chance: { p: 0.5, win: { fans: 12, say: 'Their fans took YOUR side.' }, lose: { rep: -5, say: 'Their video hurt. Customers stayed away.' } } }],
    ['🎥 Film them and post it', { chance: { p: 0.6, win: { fans: 30, rep: 3, say: 'The blackmail video went viral. They apologized.' }, lose: { rep: -3, say: 'People said you were petty.' } } }],
    ['🤝 Offer a real paid deal', { cash: -0.2, fans: 15, say: 'Fair deal. Good posts.' }]
  ], { w: 1.5, cd: 20 });

  E('lost_kid', 'customers', '🧒', 'A little kid lost their parents', 'A crying 5-year-old walks up to your counter. No parents in sight.', [
    ['📢 Announce it on the speakers', { rep: 3, say: 'The mom came running in two minutes.' }],
    ['👮 Call the police', { rep: 2, say: 'The police found the parents quickly.' }],
    ['🍪 Stay with them and wait', { rep: 4, happy: 3, say: 'The dad hugged you. He left a big tip.' }],
    ['📱 Post a photo online', { chance: { p: 0.6, win: { fans: 15, rep: 2, say: 'The post went round town. Parents found in 10 minutes.' }, lose: { rep: -3, say: 'People said you shouldn\'t post a kid\'s photo.' } } }]
  ], { w: 1.2, cd: 30 });

  E('proposal', 'customers', '💍', 'A customer wants to propose here', 'He wants to hide a ring in his girlfriend\'s order tonight. He needs your help.', [
    ['💍 Help him', { chance: { p: 0.8, win: { fans: 15, rep: 3, say: 'She said YES. The whole shop cheered.' }, lose: { happy: -2, say: 'She said no. Nobody knew where to look.' } } }],
    ['🎉 Go all out with decorations', { cash: -0.1, chance: { p: 0.8, win: { fans: 25, rep: 4, say: 'She said YES. The video went round town.' }, lose: { say: 'She said no. In front of everyone.' } } }],
    ['🎥 Film it for your page', { chance: { p: 0.7, win: { fans: 30, say: 'She said yes. Your video got thousands of likes.' }, lose: { rep: -3, say: 'She said no. Your post made it worse.' } } }],
    ['🙅 Too risky', { say: 'He proposed at a restaurant down the street.' }]
  ], { w: 1.2, cd: 30 });

  E('big_order', 'customers', '📦', 'A huge order just came in', 'A company wants 10x your normal order. By Friday.', [
    ['💪 Accept and work overtime', { extra: [0.6, 1, 'Big order'], team: -8, say: 'Done on time. The team is exhausted.' }],
    ['🤝 Accept half', { extra: [0.3, 1, 'Half order'], say: 'A solid week of extra money.' }],
    ['📈 Say yes, charge 30% more', { chance: { p: 0.5, win: { extra: [0.8, 1, 'Big order'], team: -8, say: 'They paid it. Huge week.' }, lose: { say: 'They went to {rival} instead.' } } }],
    ['🙅 Turn it down', { say: 'You kept things normal.' }]
  ], { w: 1.8, cd: 15, init: rival });

  E('viral_complaint', 'customers', '📉', 'A complaint about you went viral', 'A customer\'s angry post says your service is "a joke". 50,000 views.', [
    ['🙏 Apologize publicly', { rep: 2, fans: 5, say: 'People liked that you owned it.' }],
    ['📞 Call them and fix it', { cash: -0.1, chance: { p: 0.6, win: { rep: 4, say: 'They posted an update: "They made it right."' }, lose: { rep: -2, say: 'They didn\'t answer.' } } }],
    ['🧾 Post your side with proof', { chance: { p: 0.5, win: { fans: 12, rep: 3, say: 'Your proof changed everything.' }, lose: { rep: -5, say: 'People called you defensive.' } } }],
    ['🙈 Wait for it to go away', { rep: -3, demand: [0.93, 3, 'Bad buzz'], say: 'It took weeks to die down.' }]
  ], { w: 1.5, cd: 20 });

  E('mystery_shopper', 'customers', '🕶️', 'A mystery shopper is coming', 'A big guide is secretly rating shops in {city} this week.', [
    ['🧹 Clean up and train the team', { cash: -0.2, chance: { p: 0.75, win: { rep: 6, fans: 10, say: 'Top score in {city}.' }, lose: { rep: 2, say: 'A good score. Not the best.' } } }],
    ['🎯 Guess who it is and spoil them', { chance: { p: 0.4, win: { rep: 5, say: 'You guessed right. Perfect score.' }, lose: { rep: -3, say: 'You spoiled the wrong person.' } } }],
    ['🤷 Act normal', { chance: { p: satP(0.7, 0.35), win: { rep: 4, say: 'Your normal was good enough.' }, lose: { rep: -4, say: 'The report was not kind.' } } }],
    ['📢 Tell the team to be perfect', { team: -4, chance: { p: 0.6, win: { rep: 4, say: 'Stressful, but it worked.' }, lose: { rep: -2, say: 'Everyone was too nervous.' } } }]
  ], { w: 1.5, cd: 25 });

  E('elderly_scam', 'customers', '👵', 'Someone is scamming an old lady', 'A man outside is pressuring an old lady to hand over her bank card.', [
    ['🏃 Step in right now', { chance: { p: 0.7, win: { rep: 6, fans: 12, say: 'He ran off. She calls you her hero.' }, lose: { rep: 4, say: 'He shoved you and ran. She\'s safe.' } } }],
    ['👮 Call the police', { rep: 4, say: 'The police arrived in time.' }],
    ['📹 Film it as proof', { chance: { p: 0.6, win: { rep: 3, say: 'The video helped catch him.' }, lose: { rep: -2, say: 'People asked why you just filmed.' } } }],
    ['🙈 Not your business', { rep: -3, say: 'She lost her savings. You think about it a lot.' }]
  ], { w: 1, cd: 40 });

  E('famous_customer', 'customers', '🌟', 'A famous star just walked in', '{name}, the famous {celeb}, is in line. People are starting to notice.', [
    ['📸 Ask for a photo', { chance: { p: 0.6, win: { fans: 30, say: 'They said yes. The photo is everywhere.' }, lose: { rep: -1, say: '"No photos, please." Awkward.' } } }],
    ['🎁 Everything on the house', { cash: -0.05, chance: { p: 0.5, win: { fans: 40, rep: 3, say: 'They posted about you. Thank you!' }, lose: { fans: 5, say: 'They said thanks and left.' } } }],
    ['🙂 Treat them like anyone else', { rep: 2, say: 'They left a huge tip and a thank-you note.' }],
    ['📢 Tell the whole town', { fans: 20, happy: -3, say: 'A crowd came. The star left through the back.' }]
  ], { w: 1.2, cd: 25, rarity: 'rare', init: function (g, c) { person(g, c); c.celeb = U.pick(['singer', 'actor', 'football player', 'chef', 'streamer']); } });

  E('birthday_party', 'customers', '🎂', 'A family wants a birthday party here', 'Twenty kids. Saturday. They\'ll pay well, but it will be loud.', [
    ['🎉 Go all out', { cash: -0.1, extra: [0.25, 1, 'Birthday party'], fans: 10, say: 'The kids loved it. The parents booked again.' }],
    ['🎂 Yes, simple party', { extra: [0.15, 1, 'Birthday party'], say: 'Easy money.' }],
    ['📅 Only after closing time', { extra: [0.12, 1, 'Birthday party'], team: -3, say: 'The team stayed late.' }],
    ['🙅 Say no', { say: 'They went to {rival}.' }]
  ], { w: 1.5, cd: 20, init: rival });

  E('regular_moving', 'customers', '📦', 'Your best regular is moving away', 'She has come in every day for years. Today is her last visit.', [
    ['🎁 A goodbye gift', { cash: -0.02, rep: 3, say: 'She cried. So did your team.' }],
    ['📸 A photo for the wall', { rep: 2, happy: 2, say: 'Her photo hangs by the door now.' }],
    ['🎟️ Free visits for life', { rep: 3, fans: 5, say: 'She told her new town all about you.' }],
    ['👋 Just say goodbye', { say: 'She waved from the door.' }]
  ], { w: 1.2, cd: 30 });

  E('price_complaint', 'customers', '💲', 'Customers say you\'re too expensive', 'A lot of people are saying {rival} is cheaper. Sales are slipping.', [
    ['📉 Lower your prices', { price: -1, happy: 4, say: 'Customers are back. Margins are thinner.' }],
    ['⭐ Prove you\'re worth it', { cash: -0.3, rep: 4, say: 'Better quality. Fewer complaints.' }],
    ['🎟️ A loyalty card', { cash: -0.1, happy: 3, demand: [1.06, 6, 'Loyalty card'], say: 'Regulars love the free tenth visit.' }],
    ['🤷 Keep prices the same', { demand: [0.94, 4, 'Price complaints'], say: 'Some customers switched to {rival}.' }]
  ], { w: 1.8, cd: 18, init: rival });

  E('long_line', 'customers', '⏳', 'The line is out the door', 'People are waiting 40 minutes. Some are starting to leave.', [
    ['🏃 Jump in and help', { capacity: [1.08, 1, 'Boss helping'], team: 4, say: 'You worked the counter all day.' }],
    ['🎁 Free drinks for the line', { cash: -0.05, happy: 5, say: 'Nobody left. People were smiling.' }],
    ['🧑‍💼 Hire a temp today', { cash: -0.15, capacity: [1.1, 1, 'Temp worker'], say: 'The line moved twice as fast.' }],
    ['🤷 Let them leave', { happy: -5, say: 'Dozens walked out and went to {rival}.' }]
  ], { w: 2.5, cd: 8, cond: busy, init: rival });

  E('allergic_reaction', 'customers', '🚑', 'A customer can\'t breathe', 'An allergic reaction. They\'re on the floor. Everyone is panicking.', [
    ['📞 Call an ambulance now', { rep: 3, say: 'The ambulance came fast. They\'re okay.' }],
    ['💉 Ask the crowd for an EpiPen', { chance: { p: 0.6, win: { rep: 6, fans: 10, say: 'A nurse had one. You saved a life.' }, lose: { rep: 2, say: 'Nobody had one. The ambulance got there in time.' } } }],
    ['🏷️ Label every allergen after', { rep: 3, happy: 2, say: 'New labels on everything. Parents noticed.' }],
    ['⚖️ Call your lawyer first', { rep: -6, say: 'People saw you on the phone instead of helping.' }]
  ], { w: 1, cd: 40, cond: FOOD });

  E('rude_teens', 'customers', '🛹', 'A group of teens is scaring customers', 'They\'re loud, rude, and blocking the door every afternoon.', [
    ['🗣️ Tell them to leave', { chance: { p: 0.6, win: { happy: 3, say: 'They left. For now.' }, lose: { rep: -2, say: 'They wrote nasty things on your wall.' } } }],
    ['🤝 Offer them part-time jobs', { chance: { p: 0.5, win: { hireSpecial: { role: 'front', skill: 45 }, rep: 3, say: 'One of them took the job. The rest stopped coming.' }, lose: { say: 'They laughed at you.' } } }],
    ['🦺 Hire a guard', { cash: -0.3, happy: 4, say: 'Problem solved.' }],
    ['👮 Call the police', { happy: 2, rep: -1, say: 'The police came. Some parents called it too harsh.' }]
  ], { w: 1.5, cd: 20 });

  E('hungry_stranger', 'customers', '🥖', 'A hungry man asks for food', 'He has no money. He asks politely if you have anything left over.', [
    ['🍽️ Give him a full meal', { cash: -0.01, rep: 3, say: 'He thanked you with tears in his eyes.' }],
    ['🧺 Leftovers every night', { cash: -0.05, rep: 5, say: 'Your "free leftovers" box became famous.' }],
    ['💼 Offer him work for food', { chance: { p: 0.6, win: { hireSpecial: { role: 'front', skill: 55, traits: ['hardworking', 'loyal'] }, rep: 3, say: 'He became one of your best workers.' }, lose: { rep: 1, say: 'He ate, said thanks, and never came back.' } } }],
    ['🙅 Say no', { rep: -2, say: 'A customer saw and posted about it.' }]
  ], { w: 1.2, cd: 30, cond: FOOD });

  E('customer_idea', 'customers', '💡', 'A regular has an idea for you', '"You should sell this. I\'d buy it every day." Their idea is not bad.', [
    ['🚀 Try it for a month', { cash: -0.3, chance: { p: 0.55, win: { demand: [1.12, 6, 'Customer idea'], fans: 10, say: 'It\'s a hit. They tell everyone it was their idea.' }, lose: { say: 'Only they bought it.' } } }],
    ['🎁 Give them credit on the menu', { cash: -0.1, fans: 8, rep: 2, say: 'They show everyone their name on the menu.' }],
    ['📝 Write it down for later', { say: 'Maybe someday.' }],
    ['🙃 "We know what we\'re doing"', { happy: -3, say: 'They took their idea to {rival}.' }]
  ], { w: 1.2, cd: 25, init: rival });

  E('chargeback', 'customers', '💳', 'A customer is disputing a big payment', 'They say they never bought anything. You have the receipt.', [
    ['🧾 Send the bank your proof', { chance: { p: 0.7, win: { say: 'The bank sided with you.' }, lose: { cash: -0.3, say: 'The bank sided with them anyway.' } } }],
    ['📞 Call the customer', { chance: { p: 0.5, win: { say: 'They "forgot" they bought it. Dispute canceled.' }, lose: { cash: -0.3, say: 'They hung up. The money is gone.' } } }],
    ['💸 Let it go', { cash: -0.3, say: 'Not worth the fight.' }],
    ['🚫 Blacklist them', { cash: -0.3, rep: 1, say: 'Money gone, but they\'re never coming back.' }]
  ], { w: 1.2, cd: 25 });

  E('food_critic', 'customers', '🍽️', 'A famous food critic booked a table', 'One review from them can make or break a place.', [
    ['👨‍🍳 Cook it yourself', { chance: { p: 0.55, win: { rep: 8, fans: 25, say: '"A hidden gem." Bookings went crazy.' }, lose: { rep: -5, say: '"Forgettable." Ouch.' } } }],
    ['🎁 Send extra dishes to the table', { cash: -0.05, chance: { p: 0.5, win: { rep: 6, say: 'They loved the surprise.' }, lose: { rep: -3, say: '"They tried too hard."' } } }],
    ['🤷 Treat them like anyone else', { chance: { p: satP(0.65, 0.35), win: { rep: 6, say: '"Honest food, honest people."' }, lose: { rep: -4, say: '"Nothing special."' } } }],
    ['📢 Demand perfection', { team: -4, chance: { p: 0.55, win: { rep: 7, say: 'Perfect service. Glowing review.' }, lose: { rep: -3, say: 'Everyone was too nervous. Spilled soup.' } } }]
  ], { w: 1, cd: 30, rarity: 'rare', cond: FOOD });

  E('fight_in_shop', 'customers', '🥊', 'Two customers are fighting', 'A fight over the last table. Chairs are flying.', [
    ['🙅 Get between them', { chance: { p: 0.6, win: { rep: 4, say: 'You calmed them down. Everyone was impressed.' }, lose: { rep: 1, cash: -0.1, say: 'You took an elbow. But they stopped.' } } }],
    ['👮 Call the police', { rep: 2, say: 'Both were taken away.' }],
    ['🚪 Throw them both out', { happy: 2, say: 'Done. Back to work.' }],
    ['📹 Let it play out', { cash: -0.3, rep: -4, say: 'They broke two tables. You did nothing.' }]
  ], { w: 1.2, cd: 30 });

  E('vip_regular', 'customers', '💼', 'A rich regular wants special treatment', 'He spends a fortune here. Now he wants to skip the line, every time.', [
    ['✅ Let him skip', { extra: [0.1, 4, 'VIP regular'], happy: -3, say: 'He spends more. Others grumble.' }],
    ['🎟️ Sell VIP passes to everyone', { extra: [0.08, 6, 'VIP passes'], happy: -1, say: 'A few people buy them. Nobody feels cheated.' }],
    ['🙂 Politely say no', { chance: { p: 0.5, win: { rep: 2, say: 'He respected it. Still comes daily.' }, lose: { say: 'He moved to {rival}.' } } }],
    ['🕐 Offer him a private slot', { extra: [0.12, 4, 'Private slot'], team: -2, say: 'He loves the private hour.' }]
  ], { w: 1.2, cd: 25, init: rival });

  E('wedding_order', 'customers', '💒', 'A wedding needs you. Tomorrow.', 'Their supplier canceled. They\'re begging for help and will pay double.', [
    ['💪 Save their wedding', { extra: [0.4, 1, 'Wedding'], team: -6, fans: 10, say: 'The bride hugged every worker.' }],
    ['📈 Say yes, charge triple', { chance: { p: 0.6, win: { extra: [0.6, 1, 'Wedding'], team: -6, say: 'They paid. Big week.' }, lose: { rep: -2, say: 'They called you heartless and went elsewhere.' } } }],
    ['🤝 Do part of it', { extra: [0.2, 1, 'Wedding'], say: 'You did what you could.' }],
    ['🙅 Too short notice', { say: 'You wished them luck.' }]
  ], { w: 1.2, cd: 25 });

  E('review_5', 'customers', '⭐', 'New 5-star review', 'Best {industry} in {city}. The staff remembered my name. I come here every week.', [
    ['💬 Reply with a thank you', { fans: 5, rep: 1, say: 'They liked your reply.' }],
    ['🎁 Send them a gift', { cash: -0.03, rep: 2, fans: 8, say: 'They posted a photo of your gift.' }],
    ['🖼️ Frame it on the wall', { rep: 2, happy: 2, say: 'Every customer reads it now.' }],
    ['📢 Share it everywhere', { fans: 8, say: 'Proof you\'re good at what you do.' }]
  ], { kind: 'review', stars: 5, init: reviewer, w: function (g) { return g.satisfaction > 60 ? 3 : 1; } });

  E('review_1', 'customers', '👎', 'A 1-star review', 'Waited 30 minutes. Rude staff. Never again.', [
    ['🙏 Apologize publicly', { rep: 2, say: 'Other people saw how you handled it.' }],
    ['🎟️ Offer a free visit', { cash: -0.02, chance: { p: 0.5, win: { rep: 3, say: 'They came back and changed it to 5 stars.' }, lose: { say: 'They never replied.' } } }],
    ['🔍 Find out who served them', { team: -2, rep: 1, say: 'You had a hard talk with the team.' }],
    ['😤 Argue with them', { chance: { p: 0.3, win: { fans: 10, say: 'Your sharp reply got a lot of support.' }, lose: { rep: -6, say: 'People think you\'re rude.' } } }]
  ], { kind: 'review', stars: 1, init: reviewer, w: function (g) { return g.satisfaction < 50 ? 3 : 1; } });

  E('review_fake', 'customers', '🤖', 'Twenty 1-star reviews in one night', 'All new accounts. All the same words. Someone is attacking you.', [
    ['🚩 Report them all', { chance: { p: 0.7, win: { say: 'All removed within a day.' }, lose: { rep: -3, say: 'Only half got removed.' } } }],
    ['📢 Ask real customers for reviews', { fans: 8, rep: 2, say: 'Your regulars flooded in with 5 stars.' }],
    ['🕵️ Find out who did it', { chance: { p: 0.4, win: { rival: -0.1, rep: 4, say: 'It was {rival}. Everyone knows now.' }, lose: { say: 'The trail went cold.' } } }],
    ['🤷 Ignore them', { rep: -4, say: 'Your rating dropped.' }]
  ], { kind: 'review', stars: 1, w: 1, cd: 30, minWeek: 6, init: function (g, c) { rival(g, c); c.who2 = 'Anonymous'; } });

  E('review_mixed', 'customers', '📝', 'An honest 3-star review', 'Great product. But the place was dirty and nobody said hello.', [
    ['🧹 Fix both things', { cash: -0.1, happy: 4, say: 'Cleaner shop, warmer welcome.' }],
    ['💬 Thank them for being honest', { rep: 2, say: 'They changed it to 4 stars.' }],
    ['📋 Talk to the team', { team: -2, happy: 2, say: 'The team got the message.' }],
    ['🙃 Ignore it', { say: 'Nothing changed.' }]
  ], { kind: 'review', stars: 3, w: 1.5, cd: 12, init: reviewer });

  // =====================================================================
  // 🏢 BUSINESS
  // =====================================================================

  E('supplier_late', 'business', '🚚', 'Your supplier didn\'t deliver', 'No stock this week. They won\'t answer the phone.', [
    ['📞 Find a new supplier today', { cash: -0.2, say: 'More expensive, but you have stock.' }],
    ['🏃 Buy from a store at full price', { cash: -0.3, say: 'Painful, but you stayed open.' }],
    ['🔒 Close until it arrives', { closed: [1, 'No stock'], say: 'A quiet, empty week.' }],
    ['🤝 Borrow from {rival}', { chance: { p: 0.4, win: { rival: -0.03, say: '{rival} helped. You owe them one.' }, lose: { demand: [0.85, 1, 'Low stock'], say: 'They laughed and hung up.' } } }]
  ], { w: 2, cd: 15, init: rival });

  E('supplier_price', 'business', '📈', 'Your supplier raised prices by 30%', '"Take it or leave it." Your costs just went up.', [
    ['😬 Pay it', { supply: [0.06, 10, 'Expensive supplier'], say: 'Your profits shrink.' }],
    ['🤝 Negotiate', { chance: { p: 0.5, win: { supply: [0.02, 10, 'Price deal'], say: 'You got it down to 10%.' }, lose: { supply: [0.06, 10, 'Expensive supplier'], say: 'They wouldn\'t move.' } } }],
    ['🔄 Switch suppliers', { cash: -0.2, chance: { p: 0.6, win: { supply: [-0.02, 10, 'New supplier'], say: 'The new one is cheaper and better.' }, lose: { happy: -3, say: 'Cheaper, but customers noticed the quality drop.' } } }],
    ['📈 Raise your own prices', { price: 1, happy: -3, say: 'Customers noticed.' }]
  ], { w: 1.8, cd: 20 });

  E('big_contract', 'business', '📝', 'A big company wants a contract', 'A steady deal for six months. But they want a lower price.', [
    ['✍️ Sign it', { extra: [0.08, 12, 'Contract'], say: 'Steady money for months.' }],
    ['🤝 Push for a better price', { chance: { p: 0.5, win: { extra: [0.12, 12, 'Contract'], say: 'They agreed.' }, lose: { say: 'They walked away.' } } }],
    ['🔍 Check the fine print', { chance: { p: 0.7, win: { extra: [0.1, 12, 'Contract'], say: 'Clean deal. Signed.' }, lose: { say: 'You found a trap in it. You passed.' } } }],
    ['🙅 Too cheap', { say: 'They signed with {rival}.' }]
  ], { w: 1.5, cd: 25, minWeek: 5, init: rival });

  E('tax_audit', 'business', '🧾', 'The tax office is auditing you', 'They want every receipt from the last two years.', [
    ['🧮 Hire an expert', { cash: -0.4, say: 'Everything checked out.' }],
    ['📂 Do it yourself', { chance: { p: function (g) { return g.employees.some(function (e) { return e.role === 'acct'; }) ? 0.85 : 0.5; }, win: { say: 'You passed.' }, lose: { cash: -1, say: 'You made mistakes. Big fine.' } } }],
    ['⏳ Ask for more time', { chance: { p: 0.6, win: { cash: -0.2, say: 'More time helped. Small fine only.' }, lose: { cash: -0.6, say: 'They said no. You rushed it.' } } }],
    ['🔥 "Lose" some papers', { chance: { p: 0.3, win: { say: 'They didn\'t notice.' }, lose: { cash: -2, rep: -5, say: 'They noticed. Huge fine.' } } }]
  ], { w: 1, cd: 40, minWeek: 15 });

  E('tax_refund', 'business', '💰', 'You\'re owed a tax refund', 'Your accountant found you paid too much last year.', [
    ['💰 Keep it', { cash: 0.8, say: 'Money in the bank.' }],
    ['🛠️ Upgrade equipment', { cash: 0.3, equip: 0.02, say: 'Better tools, faster work.' }],
    ['🎁 Bonus for the team', { teamBonus: true, team: 8, say: 'The team didn\'t expect that.' }],
    ['📢 Spend it on ads', { fans: 20, demand: [1.08, 3, 'Ad push'], say: 'New faces all week.' }]
  ], { w: 1, cd: 40, minWeek: 10 });

  E('health_inspection', 'business', '📋', 'Surprise inspection', 'An inspector is at the door. Right now. With a clipboard.', [
    ['🙂 Show them everything', { chance: { p: satP(0.8, 0.5), win: { rep: 3, say: 'Passed with a top grade.' }, lose: { cash: -0.4, say: 'A few problems. A fine.' } } }],
    ['⏳ Stall while the team cleans', { chance: { p: 0.5, win: { rep: 2, say: 'It worked. Passed.' }, lose: { cash: -0.5, rep: -2, say: 'They saw the panic. Fine.' } } }],
    ['🍪 Offer free snacks', { chance: { p: 0.3, win: { say: 'They smiled. And passed you.' }, lose: { cash: -0.6, say: '"Is that a bribe?" Fined.' } } }],
    ['📋 Ask for a report to improve', { cash: -0.2, rep: 3, say: 'They were impressed you asked.' }]
  ], { w: 1.2, cd: 30, minWeek: 5 });

  E('rent_hike', 'business', '🏠', 'Your landlord is raising the rent', 'Up 20% next month. The lease is up soon.', [
    ['✍️ Sign anyway', { rent: 0.2, say: 'Higher rent, same place.' }],
    ['🤝 Negotiate', { chance: { p: 0.5, win: { rent: 0.08, say: 'You got it down to 8%.' }, lose: { rent: 0.2, say: 'The landlord didn\'t budge.' } } }],
    ['📦 Move somewhere cheaper', { cash: -0.6, closed: [1, 'Moving'], chance: { p: 0.6, win: { rent: -0.1, say: 'New place, lower rent.' }, lose: { demand: [0.9, 6, 'New location'], say: 'Cheaper, but fewer people walk by.' } } }],
    ['🏠 Offer to buy the building', { cash: -3, rent: -0.3, say: 'You own it now. No more landlord.' }]
  ], { w: 1.2, cd: 40, minWeek: 12 });

  E('power_outage', 'business', '🔌', 'The power went out', 'The whole street is dark. Nobody knows when it comes back.', [
    ['⚡ Rent a generator', { cash: -0.2, say: 'You were the only shop open. Customers came.' }],
    ['🕯️ Stay open by candlelight', { chance: { p: 0.5, win: { fans: 10, say: 'Customers loved the vibe.' }, lose: { happy: -3, say: 'Too dark. People left.' } } }],
    ['🔒 Close early', { capacity: [0.8, 1, 'Power out'], say: 'You went home early.' }],
    ['🔋 Buy a backup system', { cash: -0.8, equip: 0.01, say: 'Never again.' }]
  ], { w: 1.5, cd: 25 });

  E('flood', 'business', '🌊', 'Your shop flooded', 'A pipe burst overnight. Water everywhere.', [
    ['🧹 Clean it all up fast', { cash: -0.4, closed: [1, 'Flood'], say: 'Open again in a week.' }],
    ['📄 Call insurance', { chance: { p: function (g) { return g.flags.insured ? 0.95 : 0.4; }, win: { cash: -0.1, closed: [1, 'Flood'], say: 'Insurance paid most of it.' }, lose: { cash: -0.6, closed: [1, 'Flood'], say: 'They found a way not to pay.' } } }],
    ['🔧 Rebuild better', { cash: -1, closed: [1, 'Flood'], equip: 0.02, say: 'Better than before.' }],
    ['💪 Stay open, wet floors and all', { happy: -5, cash: -0.2, say: 'Customers didn\'t love the puddles.' }]
  ], { w: 1, cd: 40 });

  E('kitchen_fire', 'business', '🔥', 'A fire broke out', 'It started in the back. Smoke is filling the room.', [
    ['🧯 Grab the extinguisher', { chance: { p: 0.6, win: { rep: 3, say: 'You put it out. Minor damage.' }, lose: { cash: -1, closed: [1, 'Fire'], say: 'Too big. The firefighters took over.' } } }],
    ['🚪 Get everyone out first', { cash: -0.8, closed: [1, 'Fire'], rep: 4, say: 'Everyone got out safe. That\'s what matters.' }],
    ['📞 Call the fire department', { cash: -0.6, closed: [1, 'Fire'], say: 'They came fast.' }],
    ['📦 Save the cash register', { chance: { p: 0.5, win: { say: 'You saved it. And the fire went out.' }, lose: { cash: -1.2, rep: -3, say: 'You went back in. Everyone saw.' } } }]
  ], { w: 0.8, cd: 50, minWeek: 8 });

  E('break_in', 'business', '🚨', 'Someone broke in last night', 'The door is smashed. The register is empty.', [
    ['👮 Call the police', { cash: -0.3, say: 'They filed a report. Nothing else.' }],
    ['📹 Install cameras now', { cash: -0.7, say: 'Nobody will try that again.' }],
    ['🕵️ Check the street cameras', { chance: { p: 0.4, win: { rep: 3, say: 'Caught on video. Arrested.' }, lose: { cash: -0.3, say: 'Nothing useful.' } } }],
    ['🔒 Better locks', { cash: -0.4, say: 'Stronger doors.' }]
  ], { w: 1, cd: 35, cond: noCams });

  E('ransomware', 'business', '💻', 'Your computers got hacked', 'A message on screen: "Pay or lose everything." Your files are locked.', [
    ['💸 Pay them', { cash: -1, chance: { p: 0.6, win: { say: 'They unlocked it. You feel sick.' }, lose: { cash: -0.5, say: 'They took the money and vanished.' } } }],
    ['🧑‍💻 Hire an expert', { cash: -0.6, say: 'Files restored. Hackers get nothing.' }],
    ['💾 Restore from backup', { chance: { p: 0.5, win: { say: 'The backup worked.' }, lose: { cash: -0.8, closed: [1, 'Hacked'], say: 'The backup was two years old.' } } }],
    ['🆕 Wipe it all, start fresh', { closed: [1, 'Hacked'], say: 'A painful week.' }]
  ], { w: 0.8, cd: 40, minWeek: 10 });

  E('expansion_offer', 'business', '🏬', 'A great location opened up', 'A second spot in the busiest part of {city}. Someone else will grab it fast.', [
    ['🏬 Take it', { cash: -2, capacity: [1.15, 20, 'Second location'], demand: [1.1, 20, 'Second location'], say: 'Two locations now.' }],
    ['🤝 Share it with a partner', { cash: -1, capacity: [1.08, 20, 'Shared location'], say: 'Half the risk, half the reward.' }],
    ['📊 Study it first', { chance: { p: 0.5, win: { cash: -1.8, capacity: [1.15, 20, 'Second location'], demand: [1.1, 20, 'Second location'], say: 'Still there. And a better price.' }, lose: { say: 'Someone else took it.' } } }],
    ['🙅 Not yet', { say: 'You passed.' }]
  ], { w: 1, cd: 40, minWeek: 20 });

  E('franchise_request', 'business', '🤝', 'Someone wants to franchise you', 'They want to open a {company} in another city and pay you a cut.', [
    ['✍️ Sign the deal', { extra: [0.1, 12, 'Franchise'], fans: 10, say: 'A new {company} opened. Money comes in.' }],
    ['🔍 Check them out first', { chance: { p: 0.7, win: { extra: [0.1, 12, 'Franchise'], say: 'They checked out. Signed.' }, lose: { say: 'Shady past. You passed.' } } }],
    ['📈 Ask for a bigger cut', { chance: { p: 0.4, win: { extra: [0.15, 12, 'Franchise'], say: 'They agreed.' }, lose: { say: 'They walked.' } } }],
    ['🙅 Keep it yours', { say: 'Only one {company}.' }]
  ], { w: 0.8, cd: 50, minWeek: 25 });

  E('partnership', 'business', '🤝', 'A local business wants to team up', 'A joint deal: their customers get a discount at yours, and yours at theirs.', [
    ['🤝 Team up', { demand: [1.08, 8, 'Partnership'], say: 'New customers from their side.' }],
    ['📢 Make it a big launch', { cash: -0.2, demand: [1.12, 8, 'Partnership'], fans: 10, say: 'The launch was packed.' }],
    ['🔍 Test it for a month', { demand: [1.05, 4, 'Partnership'], say: 'Small, safe, steady.' }],
    ['🙅 Not interested', { say: 'They teamed up with {rival}.' }]
  ], { w: 1.2, cd: 30, init: rival });

  E('patent_troll', 'business', '⚖️', 'A company says you stole their idea', 'They claim they own the idea behind your best product. They want money.', [
    ['⚖️ Fight it in court', { cash: -0.5, chance: { p: 0.6, win: { rep: 3, say: 'The judge threw it out.' }, lose: { cash: -1.2, say: 'You lost.' } } }],
    ['💸 Pay to make it go away', { cash: -0.8, say: 'Gone.' }],
    ['🔄 Change your product', { cash: -0.3, demand: [0.95, 3, 'Product changed'], say: 'Different enough now.' }],
    ['📢 Expose them publicly', { chance: { p: 0.5, win: { fans: 15, rep: 3, say: 'Other businesses joined you. They backed off.' }, lose: { cash: -1, say: 'They sued for that too.' } } }]
  ], { w: 0.8, cd: 40, minWeek: 15 });

  E('delivery_app', 'business', '🛵', 'A delivery app wants you', 'More orders, but they take 30% of every sale.', [
    ['✅ Join', { demand: [1.15, 12, 'Delivery app'], supply: [0.04, 12, 'App fees'], say: 'More orders. Thinner profits.' }],
    ['🤝 Negotiate their fee', { chance: { p: 0.4, win: { demand: [1.15, 12, 'Delivery app'], supply: [0.02, 12, 'App fees'], say: 'You got a better deal.' }, lose: { say: 'They said no.' } } }],
    ['🛵 Start your own delivery', { cash: -0.8, demand: [1.1, 12, 'Own delivery'], say: 'Your own drivers. You keep it all.' }],
    ['🙅 No thanks', { say: 'You passed.' }]
  ], { w: 1, cd: 40, cond: FOOD });

  E('product_recall', 'business', '⚠️', 'Something you sold is faulty', 'A batch went out with a problem. Nobody is hurt yet.', [
    ['📢 Recall it all, publicly', { cash: -0.6, rep: 4, say: 'People trusted you more for it.' }],
    ['🤫 Recall it quietly', { cash: -0.4, chance: { p: 0.6, win: { say: 'Handled. Nobody noticed.' }, lose: { rep: -6, say: 'The news found out you hid it.' } } }],
    ['🎁 Replace it plus a gift', { cash: -0.8, rep: 5, happy: 3, say: 'Customers were impressed.' }],
    ['🙈 Hope nobody notices', { chance: { p: 0.3, win: { say: 'Nobody noticed.' }, lose: { rep: -12, cash: -1, say: 'People got hurt. Lawsuits followed.' } } }]
  ], { w: 0.8, cd: 40 });

  E('counterfeits', 'business', '🎭', 'Someone is selling fakes of your brand', 'Cheap copies with your name are sold online.', [
    ['⚖️ Sue them', { cash: -0.5, chance: { p: 0.6, win: { rep: 3, say: 'Shut down.' }, lose: { say: 'They moved to another site.' } } }],
    ['📢 Warn your customers', { fans: 8, rep: 2, say: 'Customers know how to spot fakes now.' }],
    ['🏷️ Add a special label', { cash: -0.2, rep: 3, say: 'Real ones are easy to spot now.' }],
    ['🤷 It\'s free publicity', { rep: -3, say: 'People blamed you for bad quality.' }]
  ], { w: 0.8, cd: 40, minWeek: 20 });

  E('trade_show', 'business', '🎪', 'A big trade show wants you', 'A booth costs a lot. Big buyers will be there.', [
    ['🎪 Get the biggest booth', { cash: -0.8, chance: { p: 0.6, win: { extra: [0.1, 8, 'Trade show deals'], fans: 20, say: 'You signed three new buyers.' }, lose: { fans: 10, say: 'Lots of visitors. No deals.' } } }],
    ['🪧 A small booth', { cash: -0.3, fans: 10, extra: [0.05, 6, 'Trade show deals'], say: 'A couple of small deals.' }],
    ['🚶 Just walk around', { chance: { p: 0.4, win: { extra: [0.05, 6, 'Trade show deals'], say: 'You made a good contact.' }, lose: { say: 'Tired feet, no deals.' } } }],
    ['🙅 Skip it', { say: '{rival} had the biggest booth.' }]
  ], { w: 1, cd: 30, minWeek: 10, init: rival });

  E('consultant', 'business', '👔', 'A consultant says they can double sales', 'They want {amt} up front. They have great references.', [
    ['💼 Hire them', { cash: -0.8, chance: { p: 0.5, win: { demand: [1.15, 10, 'Consultant plan'], say: 'Their plan worked.' }, lose: { say: 'A 90-page report nobody used.' } } }],
    ['🤝 Pay only if it works', { chance: { p: 0.5, win: { cash: -0.8, demand: [1.15, 10, 'Consultant plan'], say: 'It worked. You paid happily.' }, lose: { say: 'They refused. Fine.' } } }],
    ['📞 Call their references', { chance: { p: 0.5, win: { say: 'The references were fake. Dodged it.' }, lose: { say: 'All real. But the price was too high.' } } }],
    ['🙅 No', { say: 'You passed.' }]
  ], { w: 1, cd: 30, minWeek: 10, init: amt(0.8) });

  E('charity_request', 'business', '❤️', 'A children\'s hospital needs help', 'They\'re raising money for a new ward. Will you help?', [
    ['❤️ Donate a big amount', { cash: -0.8, rep: 8, fans: 15, say: 'Your name is on the new ward.' }],
    ['🎟️ A charity day', { cash: -0.3, rep: 5, fans: 10, say: 'Half of today\'s sales went to the kids.' }],
    ['🎁 A small donation', { cash: -0.1, rep: 2, say: 'Every bit helps.' }],
    ['🙅 Not this time', { say: '{rival} donated. The news covered it.' }]
  ], { w: 1, cd: 30, init: rival });

  E('landlord_selling', 'business', '🏢', 'Your building is for sale', 'The new owner might kick you out. Or you could buy it first.', [
    ['🏢 Buy the building', { cash: -3, rent: -0.3, say: 'You\'re your own landlord now.' }],
    ['🤞 Hope for a good new owner', { chance: { p: 0.5, win: { say: 'The new owner is fine.' }, lose: { rent: 0.25, say: 'The new owner raised the rent.' } } }],
    ['🤝 Team up with neighbors to buy', { cash: -1.2, rent: -0.1, say: 'You own a piece of it now.' }],
    ['📜 Lock in a long lease now', { cash: -0.3, say: 'Safe for five years.' }]
  ], { w: 0.8, cd: 60, minWeek: 20 });

  // =====================================================================
  // 💰 MONEY
  // =====================================================================

  E('bank_loan_offer', 'money', '🏦', 'The bank offers you a loan', 'Cheap money to grow. You\'d have to pay it back.', [
    ['🏦 Take it and grow', { cash: 1.5, supply: [0.03, 16, 'Loan payments'], say: 'Cash now. Payments for months.' }],
    ['🛠️ Take it for equipment', { equip: 0.03, supply: [0.03, 16, 'Loan payments'], say: 'Better tools, paid over time.' }],
    ['📉 Take half', { cash: 0.7, supply: [0.015, 16, 'Loan payments'], say: 'A little extra room.' }],
    ['🙅 No debt', { say: 'You keep it clean.' }]
  ], { w: 1, cd: 40, minWeek: 8 });

  E('cash_crunch', 'money', '💸', 'You can\'t pay everyone this week', 'Bills are due, and there isn\'t enough in the account.', [
    ['💳 Use your own savings', { cash: 0.5, say: 'You saved the business with your own money.' }],
    ['⏳ Pay suppliers late', { cash: 0.3, rep: -3, say: 'Suppliers are annoyed.' }],
    ['🎟️ Big weekend sale', { demand: [1.2, 1, 'Emergency sale'], supply: [0.05, 1, 'Deep discounts'], say: 'Crowds came. Cash flowed.' }],
    ['🙏 Ask the team to wait for pay', { team: -12, say: 'They agreed. But they\'re worried.' }]
  ], { w: 1.2, cd: 30, cond: function (g) { return g.cash < G.cost(g, 1); } });

  E('accountant_error', 'money', '🧮', 'Your accounts don\'t add up', 'There\'s a big hole in the books. Nobody knows where the money went.', [
    ['🔍 Hire an auditor', { cash: -0.3, chance: { p: 0.6, win: { cash: 0.6, say: 'Found it. A billing mistake. Money back.' }, lose: { say: 'Nothing found. Just gone.' } } }],
    ['🧮 Check it yourself', { chance: { p: 0.4, win: { cash: 0.5, say: 'You found the mistake.' }, lose: { cash: -0.3, say: 'You made it worse.' } } }],
    ['👀 Question the team', { team: -6, chance: { p: 0.3, win: { cash: 0.5, say: 'Someone confessed.' }, lose: { say: 'Everyone feels accused.' } } }],
    ['🤷 Write it off', { cash: -0.3, say: 'Lesson learned.' }]
  ], { w: 1, cd: 35, minWeek: 10 });

  E('investor_pitch', 'money', '🎤', 'You get 5 minutes with a rich investor', 'At a party, a famous investor asks: "What\'s your business?"', [
    ['🎤 Give your best pitch', { chance: { p: 0.35, win: { cash: 3, fans: 20, say: 'She wrote you a check on the spot.' }, lose: { say: '"Interesting. Good luck."' } } }],
    ['📱 Show her your numbers', { chance: { p: function (g) { return g.reputation > 60 ? 0.5 : 0.25; }, win: { cash: 2.5, say: 'The numbers spoke. She invested.' }, lose: { say: '"Come back when you\'re bigger."' } } }],
    ['🤝 Ask for advice, not money', { demand: [1.06, 6, 'Good advice'], say: 'Her advice was worth a lot.' }],
    ['😶 Freeze', { say: 'The moment passed.' }]
  ], { w: 0.8, cd: 50, minWeek: 12 });

  E('stock_tip', 'money', '📈', 'A friend has a "sure" stock tip', '"Put money in now. It will triple. Trust me."', [
    ['💰 Invest big', { cash: -1, chance: { p: 0.3, win: { cash: 3, say: 'It tripled. Your friend was right.' }, lose: { say: 'It crashed. The money is gone.' } } }],
    ['💵 Invest a little', { cash: -0.3, chance: { p: 0.3, win: { cash: 0.9, say: 'Nice profit.' }, lose: { say: 'Gone.' } } }],
    ['🔍 Research it first', { chance: { p: 0.5, win: { say: 'It was a scam. You dodged it.' }, lose: { say: 'By the time you looked, it had already jumped.' } } }],
    ['🙅 Stick to your business', { say: 'You kept your money.' }]
  ], { w: 1, cd: 30 });

  E('grant', 'money', '🏛️', 'You can apply for a city grant', 'The city gives money to the best small business. Lots of people applied.', [
    ['📝 Write a strong application', { chance: { p: 0.5, win: { cash: 1.5, rep: 3, say: 'You won the grant.' }, lose: { say: 'Someone else won.' } } }],
    ['🧑‍💼 Pay an expert to write it', { cash: -0.2, chance: { p: 0.7, win: { cash: 1.5, rep: 3, say: 'You won the grant.' }, lose: { say: 'Close, but no.' } } }],
    ['🤝 Apply with a charity', { chance: { p: 0.6, win: { cash: 1, rep: 6, say: 'You won, and the charity got half.' }, lose: { rep: 1, say: 'No win, but good press.' } } }],
    ['🙅 Too much paperwork', { say: 'You skipped it.' }]
  ], { w: 1, cd: 40, minWeek: 6 });

  E('lottery_ticket', 'money', '🎟️', 'A customer paid with a lottery ticket', 'They were short on cash. "Keep it. It might win."', [
    ['🎟️ Check the numbers', { chance: { p: 0.15, win: { cash: 3, say: 'It WON. The customer came back to congratulate you.' }, lose: { say: 'Not a winner.' } } }],
    ['🤝 Give it back to them', { rep: 2, say: 'They were touched.' }],
    ['🎁 Give it to {a}', { a: 6, say: '{a} was happy. It didn\'t win.' }],
    ['📌 Pin it to the wall', { say: 'You never checked it.' }]
  ], { w: 1, cd: 40, who: { a: 'any' } });

  E('insurance_offer', 'money', '📄', 'An insurance agent wants to talk', 'For a monthly fee, you\'d be covered if something goes wrong.', [
    ['✍️ Buy full insurance', { supply: [0.02, 26, 'Insurance'], flag: 'insured', say: 'You\'re covered.' }],
    ['📄 Basic plan', { supply: [0.01, 26, 'Insurance'], say: 'Some cover.' }],
    ['🔍 Compare prices first', { chance: { p: 0.6, win: { supply: [0.01, 26, 'Insurance'], say: 'Found a better deal.' }, lose: { say: 'All too expensive.' } } }],
    ['🙅 You\'ll take your chances', { say: 'Fingers crossed.' }]
  ], { w: 0.8, cd: 60 });

  E('bank_mistake', 'money', '🏦', 'The bank put extra money in your account', 'A big deposit you didn\'t earn. The bank hasn\'t noticed.', [
    ['📞 Report it', { rep: 3, say: 'The bank thanked you.' }],
    ['🤫 Keep quiet', { chance: { p: 0.3, win: { cash: 1.5, say: 'They never noticed.' }, lose: { cash: -0.3, rep: -3, say: 'They took it back, plus a fee.' } } }],
    ['💰 Move it somewhere else', { chance: { p: 0.1, win: { cash: 1.5, say: 'Nobody came looking.' }, lose: { cash: -1, rep: -8, say: 'That was a crime. Big fine.' } } }],
    ['⏳ Wait and see', { say: 'They took it back a week later.' }]
  ], { w: 0.8, cd: 50 });

  E('crypto_offer', 'money', '🪙', 'Someone wants to pay you in crypto', 'A big buyer only pays in a new coin. It\'s going up fast.', [
    ['🪙 Accept it', { chance: { p: 0.4, win: { cash: 2, say: 'The coin tripled.' }, lose: { cash: -0.5, say: 'The coin crashed. It was worthless.' } } }],
    ['💵 Cash only', { chance: { p: 0.5, win: { cash: 0.5, say: 'They paid in cash.' }, lose: { say: 'They walked.' } } }],
    ['🤝 Half and half', { chance: { p: 0.5, win: { cash: 1, say: 'The coin went up.' }, lose: { say: 'Half was worthless.' } } }],
    ['🙅 No thanks', { say: 'Too risky.' }]
  ], { w: 0.8, cd: 40, minWeek: 10 });

  E('old_debt', 'money', '📬', 'An old customer owes you money', 'They never paid a big bill from months ago.', [
    ['📞 Call them nicely', { chance: { p: 0.5, win: { cash: 0.5, say: 'They paid.' }, lose: { say: 'Voicemail. Again.' } } }],
    ['⚖️ Send a lawyer\'s letter', { cash: -0.1, chance: { p: 0.7, win: { cash: 0.6, say: 'They paid right away.' }, lose: { say: 'They closed their business.' } } }],
    ['🤝 Offer a payment plan', { cash: 0.3, say: 'Slowly, it\'s coming back.' }],
    ['🤷 Forget it', { say: 'Gone.' }]
  ], { w: 1, cd: 30 });

  // =====================================================================
  // 📱 SOCIAL MEDIA
  // =====================================================================

  E('video_posted', 'social', '🎥', 'A customer\'s video of you is blowing up', 'A clip of your {fronts} at work. It\'s spreading fast.', [
    ['🔁 Share it', { chance: { p: satP(0.8, 0.4), win: { fans: 12, chance: { p: 0.25, win: { viral: [1, 4], say: 'It went viral.' }, lose: { say: 'A nice boost.' } } }, lose: { rep: -3, say: 'The comments were full of complaints.' } } }],
    ['🎬 Film a reply', { chance: { p: 0.5, win: { fans: 20, say: 'Your reply got more views than the first one.' }, lose: { fans: 4, say: 'A few people watched it.' } } }],
    ['🎁 Find and thank the customer', { cash: -0.02, fans: 8, rep: 2, say: 'They made a second video about you.' }],
    ['🙈 Stay out of it', { say: 'It faded after a day.' }]
  ], { w: 2, cd: 10 });

  E('trend_offer', 'social', '📈', 'A big trend fits your business', 'Everyone is posting the same challenge. You could jump on it.', [
    ['🎬 Post today', { chance: { p: 0.5, win: { fans: 25, say: 'Perfect timing.' }, lose: { fans: 5, say: 'You were a day late.' } } }],
    ['🔥 Do it bigger and better', { cash: -0.2, chance: { p: 0.5, win: { fans: 35, viral: [0.5, 2], say: 'Yours was the best one.' }, lose: { fans: 10, say: 'Good try.' } } }],
    ['🧑‍🤝‍🧑 Let the team do it', { team: 5, fans: 12, say: 'The team had fun. People liked it.' }],
    ['🙅 Not your style', { say: 'You skipped it.' }]
  ], { w: 2, cd: 12 });

  E('hate_comments', 'social', '💬', 'Your posts are full of hate comments', 'Someone is posting mean comments under every post. Every day.', [
    ['🚫 Block them', { say: 'They came back with a new account.' }],
    ['💬 Reply kindly', { chance: { p: 0.5, win: { fans: 10, say: 'They stopped. Your fans loved your reply.' }, lose: { rep: -1, say: 'They got louder.' } } }],
    ['🔍 Find out who it is', { chance: { p: 0.4, win: { rival: -0.05, rep: 3, say: 'It was someone from {rival}.' }, lose: { say: 'No luck.' } } }],
    ['🤐 Turn off comments', { fans: -5, say: 'Quiet. But fans can\'t talk to you either.' }]
  ], { w: 1.5, cd: 20, init: rival });

  E('influencer_collab', 'social', '🤳', 'A big influencer wants to work with you', 'They have a million followers. They want to be paid, of course.', [
    ['💰 Pay for a big campaign', { cash: -0.6, fans: 50, demand: [1.1, 3, 'Influencer'], say: 'Their fans came in droves.' }],
    ['🎁 Pay in free products', { cash: -0.1, chance: { p: 0.5, win: { fans: 25, say: 'They agreed.' }, lose: { say: 'They wanted real money.' } } }],
    ['🤝 A small post', { cash: -0.2, fans: 20, say: 'A nice boost.' }],
    ['🙅 No', { say: 'They worked with {rival}.' }]
  ], { w: 1.2, cd: 25, minWeek: 5, init: rival });

  E('old_post', 'social', '📜', 'An old post of yours resurfaced', 'Something you posted years ago. People are angry about it.', [
    ['🙏 Apologize sincerely', { chance: { p: 0.7, win: { rep: 1, say: 'People accepted it.' }, lose: { rep: -3, say: 'Some didn\'t buy it.' } } }],
    ['🗑️ Delete it quietly', { chance: { p: 0.4, win: { say: 'It faded.' }, lose: { rep: -5, say: 'Screenshots were already out.' } } }],
    ['💪 Defend it', { chance: { p: 0.3, win: { fans: 10, say: 'Some people agreed.' }, lose: { rep: -8, say: 'It got much worse.' } } }],
    ['🤐 Say nothing', { rep: -3, say: 'It blew over in a week.' }]
  ], { w: 1, cd: 40, minWeek: 10 });

  E('page_hacked', 'social', '🔓', 'Your social media page got hacked', 'Someone is posting fake ads on it.', [
    ['🔒 Report it and lock it', { fans: -10, say: 'Back in a day. Some followers left.' }],
    ['🧑‍💻 Pay an expert', { cash: -0.2, say: 'Back in an hour.' }],
    ['📢 Warn fans from another account', { fans: 5, say: 'Fans rallied around you.' }],
    ['🆕 Start a new page', { fans: -30, say: 'Starting over.' }]
  ], { w: 1, cd: 40 });

  E('meme_about_you', 'social', '🖼️', 'You became a meme', 'A photo of you looking stressed is everywhere. Captions are brutal.', [
    ['😎 Post it yourself', { fans: 25, say: 'People loved that you could take it.' }],
    ['🛍️ Put it on T-shirts', { cash: -0.1, extra: [0.1, 3, 'Meme shirts'], fans: 15, say: 'The shirts sold out.' }],
    ['🙏 Ask people to stop', { rep: -1, say: 'That made it spread faster.' }],
    ['🤐 Ignore it', { fans: 8, say: 'It died out in a week.' }]
  ], { w: 1, cd: 40 });

  E('giveaway_scam', 'social', '🎁', 'A fake page is running a giveaway as you', 'They\'re asking people for card details in your name.', [
    ['📢 Warn everyone', { fans: 5, rep: 3, say: 'You stopped it fast.' }],
    ['🚩 Report the page', { chance: { p: 0.6, win: { say: 'Taken down.' }, lose: { rep: -3, say: 'It stayed up for days.' } } }],
    ['🎁 Run a real giveaway', { cash: -0.2, fans: 20, say: 'Your real one got more attention.' }],
    ['🤷 Not your problem', { rep: -5, say: 'People blamed you for being scammed.' }]
  ], { w: 0.8, cd: 40 });

  E('live_stream', 'social', '📹', 'Your fans want a live stream', 'Hundreds are asking. Live means no second takes.', [
    ['📹 Go live from the shop', { chance: { p: 0.6, win: { fans: 30, say: 'Thousands tuned in.' }, lose: { fans: 5, rep: -2, say: 'Something embarrassing happened live.' } } }],
    ['🙋 Answer questions live', { fans: 15, rep: 2, say: 'People liked meeting the real you.' }],
    ['🧑‍🤝‍🧑 Let {a} host it', { chance: { p: 0.6, win: { fans: 25, a: 10, say: '{a} was a natural.' }, lose: { fans: 5, say: '{a} froze.' } } }],
    ['🙅 Not today', { say: 'Maybe next time.' }]
  ], { w: 1.2, cd: 20, who: { a: 'front' } });

  E('hashtag', 'social', '#️⃣', 'People started a challenge with your name', 'The hashtag is trending in {city}.', [
    ['🎬 Join the challenge', { chance: { p: 0.6, win: { fans: 25, viral: [0.5, 2], say: 'Your video was the most-watched.' }, lose: { fans: 8, say: 'It got some likes.' } } }],
    ['🏆 Give a prize to the best one', { cash: -0.1, fans: 20, say: 'Hundreds of entries.' }],
    ['🛍️ Sell challenge merch', { extra: [0.08, 3, 'Challenge merch'], fans: 10, say: 'The merch flew off the shelves.' }],
    ['👀 Just watch', { fans: 6, say: 'It was fun while it lasted.' }]
  ], { w: 1, cd: 25, rarity: 'rare' });

  E('post_time', 'social', '📱', 'Time to post something', 'Your followers are waiting. What do you post?', null, { kind: 'post', w: 2.5, cd: 6 });

  // More customers, money and social media.
  E('drunk_customer', 'customers', '🍺', 'A drunk customer won\'t leave', 'Shouting, knocking things over. Other customers are leaving.', [
    ['🚕 Call him a taxi', { cash: -0.01, rep: 2, say: 'He went home safe.' }],
    ['👮 Call the police', { rep: 1, say: 'They took him away.' }],
    ['☕ Coffee and calm talk', { chance: { p: 0.6, win: { rep: 3, say: 'He calmed down and apologized.' }, lose: { cash: -0.1, say: 'He broke a table.' } } }],
    ['🦺 Security at night', { cash: -0.3, happy: 3, say: 'Nights are calm now.' }]
  ], { w: 1.5, cd: 20 });

  E('accused_theft', 'customers', '👛', 'A customer says {a} stole her wallet', 'She\'s shouting. {a} swears it isn\'t true.', [
    ['📹 Check the cameras', { chance: { p: 0.8, win: { a: 12, rep: 2, say: 'She left it in her car. {a} was innocent.' }, lose: { fire: 'a', say: 'It was {a}. Fired.' } } }],
    ['🛡️ Believe {a}', { a: 12, loyal: { a: 12 }, chance: { p: 0.8, win: { say: 'The wallet turned up. {a} was right.' }, lose: { rep: -5, say: 'It was {a}. You looked foolish.' } } }],
    ['💸 Pay her to calm down', { cash: -0.1, a: -10, say: '{a} feels you didn\'t trust them.' }],
    ['👮 Let the police decide', { a: -6, say: 'The police found the wallet in her bag.' }]
  ], { w: 1.2, cd: 30, who: { a: 'front' } });

  E('regular_broke', 'customers', '💔', 'A loyal regular lost her job', 'She comes in every day. Today she can\'t pay.', [
    ['🎁 "This one\'s on us."', { rep: 3, say: 'She had tears in her eyes.' }],
    ['📝 Put it on a tab', { rep: 2, say: 'She paid it all back months later.' }],
    ['💼 Offer her a job', { chance: { p: 0.7, win: { hireSpecial: { role: 'front', skill: 60, traits: ['loyal'] }, rep: 4, say: 'She joined your team.' }, lose: { rep: 2, say: 'She found work elsewhere.' } } }],
    ['🙂 Normal price', { say: 'She stopped coming.' }]
  ], { w: 1, cd: 40 });

  E('school_visit', 'customers', '🏫', 'A school wants a class trip here', 'Thirty kids want to see how a real business works.', [
    ['🎒 Give them a full tour', { capacity: [0.95, 1, 'School visit'], rep: 5, fans: 15, say: 'The kids loved it.' }],
    ['🎁 Tour and a free gift', { cash: -0.1, rep: 6, fans: 20, say: 'Parents posted everywhere.' }],
    ['🧑‍🏫 Let {a} host them', { a: 8, rep: 4, say: '{a} was great with the kids.' }],
    ['🙅 Too busy', { say: 'They visited {rival}.' }]
  ], { w: 1, cd: 40, who: { a: 'front' }, init: rival });

  E('tip_mistake', 'customers', '💵', 'A customer left a huge tip by mistake', 'He meant to leave $10. He left $1,000. {a} found it.', [
    ['📞 Find him and give it back', { rep: 6, fans: 10, say: 'He posted about your honesty.' }],
    ['🏅 Praise {a} for honesty', { a: 10, rep: 3, say: '{a} returned it proudly.' }],
    ['🤝 Split it with the team', { team: 6, rep: -4, say: 'He came back for it. Awkward.' }],
    ['💰 Keep it', { chance: { p: 0.4, win: { cash: 0.1, say: 'He never came back.' }, lose: { rep: -8, say: 'He came back. It went badly.' } } }]
  ], { w: 1, cd: 40, who: { a: 'front' } });

  E('prank_show', 'customers', '🎥', 'A TV prank show wants to film here', 'Hidden cameras. Fake customers. Your team won\'t know.', [
    ['🎬 Yes', { chance: { p: 0.6, win: { fans: 40, say: 'Your team looked great on TV.' }, lose: { fans: 15, rep: -3, say: 'Your team looked bad.' } } }],
    ['🤝 Only if the team agrees', { team: 5, fans: 25, say: 'Everyone played along. Great episode.' }],
    ['💰 Ask for a fee', { cash: 0.3, fans: 20, say: 'Paid and famous.' }],
    ['🙅 No', { say: 'They filmed at {rival}.' }]
  ], { w: 0.8, cd: 50, init: rival });

  E('supplier_discount', 'money', '📦', 'Your supplier offers a deal', '20% off if you pay a whole year up front.', [
    ['💰 Pay the year', { cash: -1, supply: [-0.05, 26, 'Prepaid supplies'], say: 'Cheaper stock all year.' }],
    ['🤝 Six months only', { cash: -0.5, supply: [-0.04, 13, 'Prepaid supplies'], say: 'A good middle.' }],
    ['🔍 Check if they\'re stable', { chance: { p: 0.7, win: { cash: -1, supply: [-0.05, 26, 'Prepaid supplies'], say: 'Solid. Deal done.' }, lose: { say: 'They\'re in trouble. You passed.' } } }],
    ['🙅 Pay as you go', { say: 'You kept your cash.' }]
  ], { w: 1, cd: 40 });

  E('loan_shark', 'money', '🦈', 'A man offers fast cash', 'No bank, no questions. Very high interest.', [
    ['💵 Take it', { cash: 1, supply: [0.08, 12, 'Loan shark'], say: 'Fast money. Painful payments.' }],
    ['🏦 Go to a bank instead', { cash: 0.6, supply: [0.02, 12, 'Bank loan'], say: 'Slower, fairer.' }],
    ['👮 Report him', { rep: 3, say: 'He was arrested.' }],
    ['🙅 No', { say: 'He left his card anyway.' }]
  ], { w: 0.8, cd: 50, cond: function (g) { return g.cash < G.cost(g, 2); } });

  E('big_bill', 'money', '🧾', 'A surprise bill', 'The water company says you owe for three years of mistakes.', [
    ['💸 Pay it', { cash: -0.6, say: 'Paid.' }],
    ['🔍 Check their math', { chance: { p: 0.6, win: { cash: -0.1, say: 'They were wrong. Much smaller bill.' }, lose: { cash: -0.6, say: 'They were right.' } } }],
    ['🤝 Payment plan', { supply: [0.02, 12, 'Payment plan'], say: 'Paying slowly.' }],
    ['⚖️ Fight it', { cash: -0.2, chance: { p: 0.5, win: { say: 'Canceled.' }, lose: { cash: -0.8, say: 'Lost, with fees.' } } }]
  ], { w: 1, cd: 40 });

  E('property_offer', 'money', '🏠', 'The shop next door is for sale', 'You could expand, or rent it out.', [
    ['🏬 Buy it and expand', { cash: -2.5, capacity: [1.15, 30, 'Bigger shop'], say: 'Twice the space.' }],
    ['🔑 Buy it and rent it out', { cash: -2.5, extra: [0.06, 30, 'Rent income'], say: 'Steady rent money.' }],
    ['🤝 Rent it first', { rent: 0.1, capacity: [1.1, 20, 'Rented space'], say: 'More space, less risk.' }],
    ['🙅 Not now', { say: '{rival} bought it.' }]
  ], { w: 0.8, cd: 50, minWeek: 15, init: rival });

  E('employee_video', 'social', '📱', '{a} posts videos from work', 'Behind-the-scenes clips. Some are great. Some show things they shouldn\'t.', [
    ['🎥 Make {a} your creator', { fans: 30, a: 12, say: 'Your page is growing fast.' }],
    ['📋 Rules for what to post', { fans: 10, say: 'Good videos, no secrets.' }],
    ['🚫 No filming at work', { a: -10, say: '{a} is disappointed.' }],
    ['🤷 Let them post anything', { chance: { p: 0.6, win: { fans: 25, say: 'Fans love the videos.' }, lose: { rep: -5, say: 'A clip showed a messy kitchen.' } } }]
  ], { w: 1.2, cd: 30, who: { a: 'any' } });

  E('photo_contest', 'social', '📸', 'Run a photo contest?', 'Customers post photos with your product. Best one wins a prize.', [
    ['🏆 Big prize', { cash: -0.3, fans: 40, say: 'Thousands of entries.' }],
    ['🎁 Small prize', { cash: -0.05, fans: 15, say: 'A nice little buzz.' }],
    ['🤝 Team up with a local artist', { cash: -0.1, fans: 25, rep: 3, say: 'Beautiful photos everywhere.' }],
    ['🙅 Skip it', { say: 'Maybe next time.' }]
  ], { w: 1, cd: 30 });

  E('reply_viral', 'social', '💬', 'Your reply to a complaint went viral', 'Someone screenshotted it. People are divided.', [
    ['📢 Stand by it', { chance: { p: 0.5, win: { fans: 30, say: 'Most people agreed with you.' }, lose: { rep: -5, say: 'The internet turned on you.' } } }],
    ['🙏 Apologize', { rep: 2, say: 'It calmed down.' }],
    ['🎁 Invite the customer back', { cash: -0.02, rep: 4, fans: 10, say: 'A happy ending.' }],
    ['🤐 Say nothing', { say: 'It faded in two days.' }]
  ], { w: 1, cd: 35 });

  E('reseller', 'customers', '🛍️', 'A man buys all your stock to resell', 'Every morning he clears the shelves and sells it online at double.', [
    ['🔢 Limit per customer', { happy: 3, say: 'Real customers get their share now.' }],
    ['🤝 Sell to him at a higher price', { extra: [0.08, 6, 'Bulk buyer'], happy: -3, say: 'More money. Some regulars miss out.' }],
    ['🌐 Sell online yourself', { cash: -0.3, demand: [1.08, 10, 'Online shop'], say: 'You cut out the middleman.' }],
    ['🤷 A sale is a sale', { happy: -5, say: 'Regulars are annoyed.' }]
  ], { w: 1, cd: 35 });

  E('price_mistake', 'money', '🏷️', 'Your prices were wrong all week', 'A computer error. Everything sold at half price.', [
    ['🙂 Honor the prices', { cash: -0.5, rep: 5, fans: 15, say: 'Customers loved you for it.' }],
    ['🔧 Fix it quietly', { cash: -0.4, say: 'Fixed. Lesson learned.' }],
    ['📢 Call it a "surprise sale"', { cash: -0.4, fans: 20, say: 'Smart save.' }],
    ['💸 Ask customers to pay more', { rep: -8, say: 'Nobody paid. Everyone laughed.' }]
  ], { w: 0.8, cd: 50 });

  E('first_day_photo', 'social', '🖼️', 'A photo of your first day went viral', 'You, alone, in an empty shop. Now look at you.', [
    ['📱 Share your story', { fans: 40, rep: 3, say: 'People found it inspiring.' }],
    ['🧑‍🤝‍🧑 A new photo with the team', { fans: 30, team: 8, say: 'Then and now. Beautiful.' }],
    ['🎁 A "since day one" sale', { demand: [1.1, 2, 'Anniversary sale'], fans: 15, say: 'A busy week.' }],
    ['😊 Just smile', { fans: 10, say: 'A nice moment.' }]
  ], { w: 0.8, cd: 80, minWeek: 30 });
})();
