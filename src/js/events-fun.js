// All events, part 3: rivals, world news, lucky breaks, mini-games and legendary moments.
// See the top of events.js for the event format and the style rules. Every question has exactly 4 responses.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var U = CS.U, G = CS.G, H = CS.EVH, E = CS.E, ev = CS.ev;
  var rival = H.rival, amt = H.amt, noCams = H.noCams, season = H.season, person = H.person;
  var TECH = H.tag('tech');

  // =====================================================================
  // 🥊 RIVALS
  // =====================================================================

  E('rival_next_door', 'rivals', '🏪', '{rival} is opening right next door', 'Same street. Same customers. Their grand opening is Saturday.', [
    ['📉 Cut prices that weekend', { supply: [0.06, 2, 'Price cut'], demand: [1.15, 2, 'Beat the opening'], say: 'Their opening was half empty.' }],
    ['🎉 Throw a bigger party', { cash: -0.4, fans: 20, rival: -0.05, say: 'Everyone came to your party instead.' }],
    ['⭐ Focus on quality', { rep: 3, demand: [0.95, 3, 'New rival'], say: 'You lost a few, but kept the best customers.' }],
    ['🤝 Say hello with a gift', { rep: 2, say: 'They were surprised. Things are friendly for now.' }]
  ], { w: 1.5, cd: 30, minWeek: 6, init: rival });

  E('rival_price_cut', 'rivals', '🏷️', '{rival} slashed their prices', 'They\'re 30% cheaper than you. Your regulars are starting to leave.', [
    ['📉 Match their prices', { price: -1, say: 'You kept your customers. Your profits shrank.' }],
    ['⭐ Stay pricey but better', { cash: -0.3, rep: 4, say: 'Quality kept your best customers.' }],
    ['🎟️ A loyalty deal for regulars', { cash: -0.1, happy: 4, say: 'Your regulars stayed.' }],
    ['⏳ Wait for them to run out', { demand: [0.88, 4, 'Price war'], chance: { p: 0.5, win: { rival: -0.1, say: 'They couldn\'t afford it. Prices went back up.' }, lose: { say: 'They lasted longer than you hoped.' } } }]
  ], { w: 2, cd: 15, minWeek: 4, init: rival });

  E('rival_poach_manager', 'rivals', '🎣', '{rival} is trying to steal {m}', 'They offered your manager a huge salary. {m} hasn\'t answered yet.', [
    ['💰 Beat their offer', { raise: ['m', 0.25], m: 15, loyal: { m: 15 }, say: '{m} stays. {rival} is furious.' }],
    ['❤️ Remind {m} what you built', { chance: { p: 0.55, win: { loyal: { m: 20 }, say: '{m} said no to them.' }, lose: { quit: 'm', rival: 0.08, say: '{m} took the money.' } } }],
    ['🪙 Offer a share of the profits', { supply: [0.03, 12, 'Profit share'], m: 20, loyal: { m: 25 }, say: '{m} is a partner now.' }],
    ['👋 Let {m} go', { quit: 'm', rival: 0.08, say: '{m} works for {rival} now.' }]
  ], { w: 1.2, cd: 30, minWeek: 10, who: { m: 'mgr' }, init: rival });

  E('rival_fake_reviews', 'rivals', '⭐', '{rival} is posting fake reviews', 'Dozens of fake 1-star reviews. You traced them back to {rival}.', [
    ['⚖️ Take them to court', { cash: -0.6, chance: { p: 0.6, win: { cash: 1.2, rival: -0.12, rep: 3, say: 'You won. They paid you damages.' }, lose: { say: 'Not enough proof.' } } }],
    ['📢 Expose them online', { chance: { p: 0.6, win: { fans: 25, rival: -0.1, say: 'Their customers turned on them.' }, lose: { rep: -3, say: 'People thought you were the liar.' } } }],
    ['🙋 Ask real customers for reviews', { rep: 3, fans: 8, say: 'Real reviews buried the fake ones.' }],
    ['😈 Fake reviews back', { chance: { p: 0.4, win: { rival: -0.08, say: 'Nobody noticed.' }, lose: { rep: -10, say: 'You got caught. The news loved it.' } } }]
  ], { w: 1.5, cd: 25, minWeek: 6, init: rival });

  E('rival_buyout', 'rivals', '💼', '{rival} wants to buy your company', 'Their boss sends an offer. A lot of money. But {company} would be gone.', [
    ['🙅 "Not for sale."', { team: 6, say: 'Your team cheered.' }],
    ['🔄 "I\'ll buy YOU instead."', { chance: { p: 0.3, win: { cash: -3, rival: -0.5, demand: [1.2, 16, 'Bought rival shops'], say: 'You bought half their shops.' }, lose: { rep: -2, say: 'They laughed at your offer.' } } }],
    ['🤝 Offer a partnership', { rival: -0.05, extra: [0.1, 8, 'Partner deal'], say: 'Money for both sides. For now.' }],
    ['📈 Ask for triple', { chance: { p: 0.2, win: { cash: 4, say: 'They sent more money just to talk. You still said no.' }, lose: { say: 'They walked away.' } } }]
  ], { w: 1, cd: 40, minWeek: 20, init: rival });

  E('rival_steals_client', 'rivals', '📉', '{rival} stole your biggest client', 'They offered a deal you can\'t match. Your best client is leaving.', [
    ['📞 Call the client yourself', { chance: { p: 0.45, win: { rep: 3, say: 'You won them back.' }, lose: { demand: [0.9, 6, 'Lost client'], say: 'They\'re gone.' } } }],
    ['💸 Beat the deal', { supply: [0.04, 8, 'Client discount'], say: 'They stayed. Your margins took a hit.' }],
    ['🎯 Steal one of THEIR clients', { chance: { p: 0.5, win: { extra: [0.1, 8, 'New client'], rival: -0.05, say: 'You took their biggest client.' }, lose: { demand: [0.9, 6, 'Lost client'], say: 'You came back empty-handed.' } } }],
    ['🤷 Let them go', { demand: [0.9, 6, 'Lost client'], say: 'A hard week.' }]
  ], { w: 1.5, cd: 25, minWeek: 8, init: rival });

  E('rival_sabotage', 'rivals', '🧨', 'Someone sabotaged your delivery', 'Your stock arrived ruined. The driver saw someone in a {rival} jacket.', [
    ['👮 Report it to the police', { chance: { p: 0.5, win: { rival: -0.12, rep: 3, say: 'They caught them. {rival} is in the news.' }, lose: { cash: -0.3, say: 'No proof. Stock still ruined.' } } }],
    ['📹 Put cameras on deliveries', { cash: -0.5, say: 'It won\'t happen again.' }],
    ['🗣️ Confront {rival}', { chance: { p: 0.4, win: { cash: 0.3, rival: -0.05, say: 'They paid for the damage.' }, lose: { cash: -0.3, say: 'They laughed in your face.' } } }],
    ['😈 Get revenge', { chance: { p: 0.4, win: { rival: -0.1, say: 'They had a bad week too.' }, lose: { rep: -10, cash: -0.5, say: 'You got caught. Now you\'re the villain.' } } }]
  ], { w: 1, cd: 30, minWeek: 10, init: rival });

  E('rival_tv_debate', 'rivals', '📺', '{rival}\'s boss wants a TV debate', 'Live TV. Both bosses. The topic: who\'s the best {industry} in {city}.', [
    ['🎤 Accept and prepare', { chance: { p: 0.6, win: { fans: 40, rep: 5, rival: -0.08, say: 'You won the debate. Everyone is talking about you.' }, lose: { rep: -3, say: 'They were sharper.' } } }],
    ['🔥 Go on the attack', { chance: { p: 0.45, win: { fans: 50, rival: -0.12, say: 'You destroyed them on live TV.' }, lose: { rep: -6, say: 'You came off as mean.' } } }],
    ['🤝 Stay classy and kind', { rep: 5, fans: 15, say: 'People liked you more.' }],
    ['🙅 Don\'t show up', { rep: -3, rival: 0.05, say: 'They talked about you with an empty chair.' }]
  ], { w: 1, cd: 40, minWeek: 12, init: rival });

  E('rival_bankrupt', 'rivals', '📉', '{rival} is going bankrupt', 'They\'re selling everything. Machines, stock, even workers\' contracts.', [
    ['⚙️ Buy their equipment', { cash: -0.8, equip: 0.04, say: 'Great machines for half price.' }],
    ['🧑‍🍳 Hire their best worker', { hireSpecial: { role: 'front', skill: 80, traits: ['hardworking', 'loyal'] }, say: 'Their best worker is yours now.' }],
    ['🏢 Buy the whole company', { cash: -4, rival: -0.6, demand: [1.25, 20, 'Bought a rival'], say: 'You own {rival} now.' }],
    ['💐 Offer help', { rep: 4, say: 'They never forgot it.' }]
  ], { w: 0.8, cd: 50, minWeek: 15, init: rival });

  E('rival_truce', 'rivals', '🕊️', '{rival} wants to make peace', '"This war is hurting us both. Let\'s stop." Can you trust them?', [
    ['🤝 Shake hands', { chance: { p: 0.7, win: { cash: 0.5, say: 'Peace. Both of you saved money.' }, lose: { rival: 0.1, say: 'It was a trick. They struck first.' } } }],
    ['📜 Only with a signed deal', { cash: 0.3, say: 'Signed. Both sides saved money.' }],
    ['🙅 Never', { team: 4, say: 'The war goes on.' }],
    ['🤝 Accept, but watch them', { say: 'Friendly face. Eyes open.' }]
  ], { w: 1, cd: 40, minWeek: 12, init: rival });

  E('rival_billboard', 'rivals', '🪧', '{rival} put up a billboard about you', 'Right across the street: "Tired of waiting? Come to {rival}."', [
    ['🪧 Put up a better one', { cash: -0.4, fans: 20, rival: -0.05, say: 'Yours is bigger and smarter.' }],
    ['📸 Make it a meme', { fans: 25, rival: -0.05, say: 'People are laughing at them, not you.' }],
    ['⚡ Fix the waiting time', { cash: -0.3, happy: 5, say: 'Their billboard is a lie now.' }],
    ['🤷 Ignore it', { demand: [0.95, 4, 'Rival billboard'], say: 'Some people believed it.' }]
  ], { w: 1.5, cd: 25, minWeek: 5, init: rival });

  E('rival_spy', 'rivals', '🕵️', 'You caught a spy from {rival}', 'A "customer" was photographing your prices and your kitchen.', [
    ['🚪 Throw them out', { say: 'Gone. But they got photos.' }],
    ['📸 Take their phone', { chance: { p: 0.5, win: { rival: -0.05, say: 'You deleted everything.' }, lose: { rep: -3, cash: -0.2, say: 'They called the police on you.' } } }],
    ['🎭 Show them fake plans', { rival: -0.08, say: '{rival} copied your fake plans. They flopped.' }],
    ['📢 Post it online', { fans: 15, rival: -0.05, say: 'Everyone laughed at {rival}.' }]
  ], { w: 1.5, cd: 25, minWeek: 6, init: rival });

  E('rival_star_defects', 'rivals', '⭐', '{rival}\'s best worker wants to join you', '"I\'m done with them. Are you hiring?"', [
    ['✅ Hire them now', { hireSpecial: { role: 'front', skill: 80 }, rival: -0.08, say: 'A top worker. And a hit to {rival}.' }],
    ['🔍 Is it a trap?', { chance: { p: 0.7, win: { hireSpecial: { role: 'front', skill: 80 }, rival: -0.08, say: 'Real deal. Hired.' }, lose: { say: 'It was a spy. You sent them away.' } } }],
    ['💬 Get their secrets first', { chance: { p: 0.5, win: { rival: -0.1, demand: [1.08, 6, 'Rival secrets'], say: 'You learned a lot.' }, lose: { rep: -2, say: 'They refused. Awkward.' } } }],
    ['🙅 No thanks', { say: 'They went somewhere else.' }]
  ], { w: 1.2, cd: 30, minWeek: 8, init: rival });

  E('rival_lawsuit', 'rivals', '⚖️', '{rival} is suing you', 'They say your logo looks too much like theirs.', [
    ['⚖️ Fight it', { cash: -0.5, chance: { p: 0.6, win: { rep: 3, say: 'Case thrown out.' }, lose: { cash: -1, say: 'You lost. New logo needed.' } } }],
    ['🎨 Just change your logo', { cash: -0.3, fans: 5, say: 'New look. Fresh start.' }],
    ['⚖️ Sue them back', { cash: -0.7, chance: { p: 0.45, win: { cash: 1.5, rival: -0.1, say: 'You won. They paid.' }, lose: { cash: -0.5, say: 'Expensive loss.' } } }],
    ['🤝 Settle quietly', { cash: -0.5, say: 'Done.' }]
  ], { w: 1, cd: 35, minWeek: 10, init: rival });

  E('rival_scandal', 'rivals', '📰', '{rival} is in a big scandal', 'Their boss was caught lying to customers. It\'s all over the news.', [
    ['📢 Welcome their customers', { demand: [1.12, 4, 'Rival scandal'], rival: -0.1, say: 'Their customers came to you.' }],
    ['🤐 Stay quiet', { rep: 2, say: 'People noticed you didn\'t pile on.' }],
    ['🔥 Make fun of them', { chance: { p: 0.5, win: { fans: 20, say: 'People loved it.' }, lose: { rep: -3, say: 'People said it was low.' } } }],
    ['🔍 Check you\'re not doing it', { cash: -0.1, rep: 3, say: 'You\'re clean. Good to know.' }]
  ], { kind: 'news', w: 1, cd: 35, minWeek: 10, init: rival });

  E('rival_merge', 'rivals', '🤝', '{rival} wants to merge', '"Together we\'d be the biggest in {city}." You\'d share control.', [
    ['🤝 Merge', { cash: 2, rival: -0.4, team: -6, say: 'Bigger company. Less control.' }],
    ['📜 Only if you\'re in charge', { chance: { p: 0.3, win: { cash: 3, rival: -0.5, say: 'They agreed. You\'re the boss.' }, lose: { say: 'Deal off.' } } }],
    ['🤝 Just share deliveries', { supply: [-0.02, 12, 'Shared delivery'], say: 'Cheaper deliveries for both.' }],
    ['🙅 No way', { say: 'You stay independent.' }]
  ], { w: 0.6, cd: 60, minWeek: 25, init: rival });

  E('rival_steals_location', 'rivals', '🏢', '{rival} is bidding on your building', 'They want your spot. They offered the landlord double rent.', [
    ['💰 Outbid them', { rent: 0.15, say: 'You keep your spot. It costs more.' }],
    ['🤝 Talk to the landlord', { chance: { p: 0.6, win: { say: 'The landlord chose loyalty.' }, lose: { rent: 0.2, say: 'You had to pay more to stay.' } } }],
    ['🏢 Buy the building', { cash: -3, rent: -0.3, say: 'Now nobody can take it.' }],
    ['📦 Move to a better spot', { cash: -0.8, closed: [1, 'Moving'], demand: [1.05, 10, 'New spot'], say: 'New place. Fresh start.' }]
  ], { w: 0.8, cd: 50, minWeek: 15, init: rival });

  E('rival_supplier_lock', 'rivals', '🚚', '{rival} made your supplier drop you', 'They paid your supplier to sell only to them.', [
    ['🔍 Find a new supplier', { cash: -0.3, say: 'You found one. A bit pricier.' }],
    ['💸 Pay more to stay', { supply: [0.05, 8, 'Supplier fight'], say: 'You kept the supplier, at a price.' }],
    ['⚖️ Report it', { chance: { p: 0.4, win: { rival: -0.1, say: 'That was illegal. They got fined.' }, lose: { cash: -0.2, say: 'Nothing came of it.' } } }],
    ['🏭 Make it yourself', { cash: -1, supply: [-0.03, 20, 'Own production'], say: 'Now nobody can cut you off.' }]
  ], { w: 1, cd: 35, minWeek: 12, init: rival });

  E('rival_ad_attack', 'rivals', '📺', '{rival}\'s new ad attacks you', 'It doesn\'t say your name. But everyone knows it\'s about you.', [
    ['📺 Answer with a better ad', { cash: -0.5, fans: 25, say: 'Yours was funnier and smarter.' }],
    ['⚖️ Call a lawyer', { chance: { p: 0.5, win: { rival: -0.08, say: 'They had to pull the ad.' }, lose: { cash: -0.3, say: 'The ad stayed.' } } }],
    ['🙂 Stay above it', { rep: 3, say: 'Classy. Customers noticed.' }],
    ['🎁 Discount for "tired" customers', { demand: [1.08, 3, 'Counter offer'], say: 'Your clever reply won them over.' }]
  ], { w: 1.2, cd: 30, minWeek: 8, init: rival });

  E('rival_help', 'rivals', '🆘', '{rival}\'s shop was flooded', 'Their boss calls you. "We\'re in trouble. Can you help?"', [
    ['🤝 Help them for free', { rep: 6, rival: 0.05, say: 'They\'ll remember this.' }],
    ['💰 Help, but for a price', { cash: 0.5, say: 'Business is business.' }],
    ['📢 Take their customers', { demand: [1.1, 3, 'Rival closed'], rep: -2, say: 'Smart. But people noticed.' }],
    ['🙅 Say no', { say: 'You hung up.' }]
  ], { w: 0.8, cd: 50, init: rival });

  E('rival_insult', 'rivals', '🗣️', 'The boss of {rival} insulted you', 'In a newspaper interview: "{company}? A joke. They won\'t last a year."', [
    ['📰 Answer in the same paper', { chance: { p: 0.6, win: { fans: 20, say: 'Your answer was sharper.' }, lose: { rep: -2, say: 'It started a war of words.' } } }],
    ['📊 Let your numbers talk', { rep: 4, say: 'Your sales said everything.' }],
    ['🖼️ Frame the quote on your wall', { fans: 15, team: 5, say: 'The team works harder to prove them wrong.' }],
    ['🤷 Ignore it', { say: 'Words are just words.' }]
  ], { w: 1.2, cd: 30, minWeek: 4, init: rival });

  E('rival_opening_day', 'rivals', '🎉', '{rival} is opening on your big day', 'Same day as your anniversary sale. They\'re giving everything away.', [
    ['🎁 Give more away', { cash: -0.4, demand: [1.15, 1, 'Anniversary'], say: 'You won the day.' }],
    ['📅 Move your sale', { demand: [1.1, 1, 'Moved sale'], say: 'Smart. You avoided the fight.' }],
    ['🎸 Get a live band', { cash: -0.3, fans: 20, say: 'Your party was louder and better.' }],
    ['🤷 Go ahead as planned', { demand: [0.92, 1, 'Rival opening'], say: 'Half your crowd went to them.' }]
  ], { w: 1, cd: 40, minWeek: 20, init: rival });

  E('rival_hacked', 'rivals', '💻', '{rival} hacked your website', 'Your website now says you\'re closed forever. Customers are calling.', [
    ['🧑‍💻 Fix it fast', { cash: -0.2, say: 'Fixed in an hour.' }],
    ['👮 Report it to the police', { chance: { p: 0.5, win: { rival: -0.15, rep: 3, say: 'Proof found. {rival} is in big trouble.' }, lose: { cash: -0.2, say: 'Can\'t prove it was them.' } } }],
    ['📢 Tell customers what happened', { fans: 10, rep: 2, say: 'Everyone was on your side.' }],
    ['🔐 Upgrade your security', { cash: -0.5, say: 'Locked down tight.' }]
  ], { w: 0.8, cd: 40, minWeek: 12, init: rival });

  E('rival_cup_bet', 'rivals', '🏆', '{rival} wants a bet', '"Whoever sells more this month pays the other." Serious money on the line.', [
    ['💰 Bet big', { chance: { p: function (g) { return g.reputation > 55 ? 0.6 : 0.4; }, win: { cash: 1.5, rival: -0.05, say: 'You won the bet.' }, lose: { cash: -1.5, say: 'You lost the bet.' } } }],
    ['💵 Bet small', { chance: { p: 0.5, win: { cash: 0.4, say: 'You won.' }, lose: { cash: -0.4, say: 'You lost.' } } }],
    ['🎉 Loser throws a party', { chance: { p: 0.5, win: { fans: 15, team: 8, say: 'They threw your team a party.' }, lose: { cash: -0.2, team: 5, say: 'You threw the party. Still fun.' } } }],
    ['🙅 No bets', { say: 'You stay focused.' }]
  ], { w: 1, cd: 30, minWeek: 6, init: rival });

  ev({ id: 'price_war', cat: 'rivals', icon: '🥊', kind: 'vs', w: 2.5, cd: 8, minWeek: 3, init: rival,
    title: '{rival} started a showdown', text: 'They\'re going after your customers this week. Pick your move.',
    win: { fans: 15, demand: [1.12, 4, 'Won the showdown'], rep: 2 }, lose: { demand: [0.92, 3, 'Lost the showdown'] }, tie: { fans: 4 } });

  // =====================================================================
  // 🌍 WORLD
  // =====================================================================

  E('heatwave', 'world', '🌡️', 'A record heatwave hits {city}', 'It\'s the hottest week in 50 years. Nobody wants to go outside.', [
    ['❄️ Run the AC all day', { cash: -0.2, demand: [1.1, 2, 'Cool shop'], say: 'People came in just to cool down.' }],
    ['🧊 Sell cold drinks', { extra: [0.1, 2, 'Cold drinks'], say: 'Cold drinks flew off the shelves.' }],
    ['🕐 Close in the afternoon', { capacity: [0.85, 2, 'Short hours'], team: 6, say: 'The team was grateful.' }],
    ['😓 Push through', { team: -8, say: 'Everyone suffered.' }]
  ], { w: 2, cd: 30, cond: season(25, 35) });

  E('snowstorm', 'world', '❄️', 'A huge snowstorm hit {city}', 'Roads are closed. Half your team can\'t get in.', [
    ['🔒 Close for safety', { closed: [1, 'Snowstorm'], team: 6, say: 'Safe and warm at home.' }],
    ['💪 Open with who you have', { capacity: [0.6, 1, 'Snowstorm'], demand: [0.7, 1, 'Snowstorm'], say: 'A quiet, cold week.' }],
    ['🚗 Pick up workers yourself', { team: 10, capacity: [0.85, 1, 'Snowstorm'], say: 'You drove around town at 6 AM.' }],
    ['☕ Free hot drinks for the brave', { cash: -0.05, fans: 10, say: 'The few who came loved it.' }]
  ], { w: 2, cd: 30, cond: function (g) { var w = ((g.week - 1) % 52) + 1; return w < 8 || w > 48; } });

  E('holiday_rush', 'world', '🎄', 'Holiday season is here', 'The busiest weeks of the year. Everyone is shopping.', [
    ['🎄 Decorate everything', { cash: -0.2, demand: [1.2, 3, 'Holiday rush'], fans: 10, say: 'Your shop looked amazing.' }],
    ['🧑‍💼 Hire extra help', { hireSpecial: { role: 'front', skill: 50 }, demand: [1.15, 3, 'Holiday rush'], say: 'More hands, more sales.' }],
    ['🎁 Holiday bonus for the team', { teamBonus: true, team: 10, demand: [1.15, 3, 'Holiday rush'], say: 'Happy team, happy season.' }],
    ['😌 Just enjoy the rush', { demand: [1.15, 3, 'Holiday rush'], say: 'Busy weeks.' }]
  ], { w: 4, cd: 40, cond: season(47, 51) });

  E('back_to_school', 'world', '🎒', 'Back to school week', 'Families are out shopping everywhere.', [
    ['✏️ Student discount', { demand: [1.12, 2, 'Back to school'], happy: 3, say: 'Students love you.' }],
    ['📚 Donate school supplies', { cash: -0.1, rep: 4, say: 'Parents noticed.' }],
    ['🎒 A back-to-school deal', { demand: [1.1, 2, 'Back to school'], say: 'Busy week.' }],
    ['🤷 Business as usual', { say: 'A normal week.' }]
  ], { w: 3, cd: 40, cond: season(33, 36) });

  E('recession', 'world', '📉', 'The economy is crashing', 'People are losing jobs. Everyone is spending less.', [
    ['📉 Lower your prices', { price: -1, say: 'Customers stayed loyal.' }],
    ['✂️ Cut costs', { team: -8, supply: [-0.03, 8, 'Cost cuts'], say: 'Leaner. The team is nervous.' }],
    ['📢 Advertise while others don\'t', { cash: -0.5, fans: 25, say: 'You grabbed customers while others hid.' }],
    ['🤞 Ride it out', { demand: [0.85, 6, 'Recession'], say: 'Hard weeks.' }]
  ], { kind: 'news', w: 0.8, cd: 60, minWeek: 20 });

  E('boom', 'world', '📈', 'The economy is booming', 'People have money and they\'re spending it.', [
    ['📈 Raise prices', { price: 1, say: 'Nobody complained.' }],
    ['🏗️ Expand now', { cash: -1, capacity: [1.15, 12, 'Expansion'], say: 'Bigger, just in time.' }],
    ['💰 Save for bad times', { cash: 0.3, say: 'Smart.' }],
    ['🎉 Enjoy the ride', { demand: [1.1, 6, 'Boom'], say: 'Great weeks.' }]
  ], { kind: 'news', w: 0.8, cd: 60, minWeek: 15 });

  E('min_wage', 'world', '📜', 'A new law raises the minimum wage', 'Every worker must be paid more starting next month.', [
    ['💵 Pay it, and a bit more', { teamRaise: 0.08, team: 12, say: 'The team feels valued.' }],
    ['💵 Pay exactly the minimum', { teamRaise: 0.05, say: 'Done.' }],
    ['📈 Raise your prices', { teamRaise: 0.05, price: 1, say: 'Customers pay a bit more.' }],
    ['🤖 Buy machines instead', { cash: -1, equip: 0.04, teamRaise: 0.05, say: 'More machines, same team.' }]
  ], { kind: 'news', w: 0.6, cd: 80, minWeek: 20 });

  E('big_final', 'world', '⚽', 'The big football final is this weekend', 'The whole city will be watching.', [
    ['📺 Show it on a big screen', { cash: -0.2, demand: [1.2, 1, 'Final'], fans: 10, say: 'Packed. The whole street came.' }],
    ['⚽ Special deal for fans', { demand: [1.12, 1, 'Final'], say: 'Busy weekend.' }],
    ['🔒 Close and watch it', { closed: [1, 'Final'], team: 10, say: 'Your team loved it.' }],
    ['🤷 Business as usual', { demand: [0.9, 1, 'Final'], say: 'Everyone was watching the game.' }]
  ], { w: 1.5, cd: 40 });

  E('road_works', 'world', '🚧', 'The road outside is closed', 'Construction for a month. It\'s hard to reach your door.', [
    ['🪧 Put up big signs', { cash: -0.1, demand: [0.93, 4, 'Road works'], say: 'People found you.' }],
    ['🛵 Offer free delivery', { cash: -0.3, demand: [0.97, 4, 'Road works'], say: 'Delivery saved the month.' }],
    ['⚖️ Ask the city for help', { chance: { p: 0.5, win: { cash: 0.5, say: 'The city paid you for the trouble.' }, lose: { demand: [0.88, 4, 'Road works'], say: 'They said no.' } } }],
    ['😩 Wait it out', { demand: [0.88, 4, 'Road works'], say: 'A slow month.' }]
  ], { w: 1.2, cd: 40 });

  E('festival', 'world', '🎪', 'A festival is coming to {city}', 'Thousands of visitors next weekend. Booth spots are going fast.', [
    ['🎪 Get a booth', { cash: -0.4, extra: [0.3, 1, 'Festival'], fans: 15, say: 'Sold out by noon.' }],
    ['⏰ Stay open late', { demand: [1.15, 1, 'Festival'], team: -4, say: 'Long hours, big sales.' }],
    ['🤝 Sponsor it', { cash: -0.8, fans: 30, rep: 4, say: 'Your name was everywhere.' }],
    ['🤷 Skip it', { say: 'A normal weekend.' }]
  ], { w: 1.5, cd: 30 });

  E('new_station', 'world', '🚇', 'A new metro station opens nearby', 'Thousands of new people will walk past your door every day.', [
    ['🪧 Big sign facing the station', { cash: -0.2, demand: [1.1, 12, 'New station'], say: 'Commuters found you fast.' }],
    ['☕ Early morning hours', { team: -3, demand: [1.12, 12, 'New station'], say: 'The morning rush is yours.' }],
    ['🎟️ Commuter loyalty card', { demand: [1.08, 12, 'New station'], happy: 3, say: 'Regulars from day one.' }],
    ['😌 Just enjoy it', { demand: [1.05, 12, 'New station'], say: 'More people walking by.' }]
  ], { kind: 'news', w: 0.8, cd: 80, minWeek: 10 });

  E('flu_season', 'world', '🤧', 'A bad flu is going around', 'Half the city is sick. Some of your team too.', [
    ['🏠 Paid sick days', { cash: -0.2, team: 8, capacity: [0.85, 2, 'Flu season'], say: 'Sick people stayed home. It didn\'t spread.' }],
    ['🧴 Masks and cleaning', { cash: -0.1, rep: 3, capacity: [0.9, 2, 'Flu season'], say: 'Customers felt safe.' }],
    ['💉 Free flu shots for staff', { cash: -0.2, team: 6, say: 'Nobody else got sick.' }],
    ['💪 Everyone comes in', { team: -10, capacity: [0.8, 2, 'Flu spreading'], say: 'It spread to everyone.' }]
  ], { w: 1.5, cd: 40, cond: function (g) { var w = ((g.week - 1) % 52) + 1; return w < 12 || w > 44; } });

  E('tourist_boom', 'world', '✈️', 'Tourists discovered {city}', 'A travel show called {city} "the next big thing". Visitors are pouring in.', [
    ['🗺️ Signs in many languages', { cash: -0.1, demand: [1.12, 6, 'Tourists'], say: 'Tourists found you easily.' }],
    ['🛍️ Sell souvenirs', { extra: [0.1, 6, 'Souvenirs'], say: 'Souvenirs sold fast.' }],
    ['📈 Raise prices for everyone', { price: 1, happy: -3, say: 'Tourists paid. Locals grumbled.' }],
    ['😌 Enjoy the crowds', { demand: [1.08, 6, 'Tourists'], say: 'Busy weeks.' }]
  ], { kind: 'news', w: 0.8, cd: 60 });

  E('blackout_city', 'world', '🌃', 'The whole city lost power', 'No lights, no card machines. It could last days.', [
    ['💵 Cash only, stay open', { demand: [0.8, 1, 'Blackout'], rep: 3, say: 'You were one of the few open.' }],
    ['⚡ Rent a generator', { cash: -0.3, demand: [1.1, 1, 'Only shop open'], say: 'The only lights on the street.' }],
    ['🤝 Help the neighborhood', { cash: -0.2, rep: 6, closed: [1, 'Blackout'], say: 'You gave out food and water.' }],
    ['🔒 Close until it\'s back', { closed: [1, 'Blackout'], say: 'A dark week.' }]
  ], { w: 0.8, cd: 60 });

  E('election', 'world', '🗳️', 'The mayor election is next week', 'Both candidates want your support. Photos, speeches, the works.', [
    ['🗳️ Support the favorite', { chance: { p: 0.6, win: { rep: 3, say: 'They won. They remember their friends.' }, lose: { rep: -3, say: 'They lost. The new mayor remembers too.' } } }],
    ['🎲 Support the underdog', { chance: { p: 0.35, win: { rep: 6, fans: 15, say: 'Huge upset. You picked right.' }, lose: { rep: -2, say: 'They lost badly.' } } }],
    ['🤐 Stay neutral', { say: 'Smart. No enemies.' }],
    ['🎟️ Host a debate here', { cash: -0.2, fans: 20, rep: 2, say: 'Everyone came. Great press.' }]
  ], { w: 0.8, cd: 80, minWeek: 10 });

  // =====================================================================
  // 🍀 LUCKY BREAKS
  // =====================================================================

  E('tv_show', 'lucky', '📺', 'A TV show wants to film here', 'A popular show wants a full episode about {company}.', [
    ['🎬 Yes, film everything', { chance: { p: 0.7, win: { fans: 60, rep: 5, viral: [2, 5], say: 'The episode was a hit.' }, lose: { fans: 25, rep: -4, say: 'They edited it to look bad.' } } }],
    ['🧹 Yes, after a deep clean', { cash: -0.2, fans: 45, rep: 6, say: 'Spotless and famous.' }],
    ['🎭 Let the team be the stars', { fans: 40, team: 10, say: 'Your team were natural on TV.' }],
    ['🙅 Too risky', { say: 'Maybe better this way.' }]
  ], { w: 0.8, cd: 40, rarity: 'epic' });

  E('award_nomination', 'lucky', '🏅', 'You\'re nominated for an award', 'Best {industry} in {city}. The ceremony is Friday.', [
    ['🎤 Prepare a speech', { chance: { p: 0.5, win: { rep: 8, fans: 30, say: 'You WON. Your speech made people cry.' }, lose: { rep: 2, say: 'You lost. Still, nominated.' } } }],
    ['🧑‍🤝‍🧑 Bring the whole team', { cash: -0.2, team: 12, chance: { p: 0.5, win: { rep: 8, fans: 25, say: 'You won, together.' }, lose: { say: 'You lost. Great night anyway.' } } }],
    ['📢 Campaign for votes', { cash: -0.3, chance: { p: 0.7, win: { rep: 6, fans: 20, say: 'You won.' }, lose: { say: 'Not enough votes.' } } }],
    ['🙅 Skip it', { say: 'You didn\'t go. You won, but nobody saw.' }]
  ], { w: 1, cd: 40, minWeek: 10, rarity: 'rare' });

  E('old_painting', 'lucky', '🖼️', 'You found an old painting in storage', 'Dusty, signed, and very old. It could be worth something.', [
    ['💰 Sell it as is', { chance: { p: 0.3, win: { cash: 5, say: 'It was by a famous painter.' }, lose: { cash: 0.1, say: 'Worth almost nothing.' } } }],
    ['🔍 Get it checked first', { cash: -0.05, chance: { p: 0.3, win: { cash: 6, say: 'The expert gasped. A fortune.' }, lose: { say: '"It\'s nice. But not famous."' } } }],
    ['🏛️ Give it to a museum', { rep: 5, fans: 10, say: 'Your name is on a museum wall.' }],
    ['🖼️ Hang it in the shop', { happy: 3, say: 'The shop looks classier.' }]
  ], { w: 0.8, cd: 60, rarity: 'rare' });

  E('found_wallet', 'lucky', '👛', 'Someone left a wallet here', 'It\'s full of cash. The ID says it belongs to a famous businessman.', [
    ['📞 Call and return it', { rep: 3, chance: { p: 0.5, win: { cash: 1, say: 'He sent you a big reward.' }, lose: { say: 'He said thanks. That\'s it.' } } }],
    ['🚗 Deliver it in person', { chance: { p: 0.4, win: { extra: [0.1, 8, 'Business friend'], say: 'He became a big customer.' }, lose: { rep: 2, say: 'His assistant took it at the door.' } } }],
    ['👮 Give it to the police', { rep: 2, say: 'Safe.' }],
    ['💵 Keep the cash', { chance: { p: 0.3, win: { cash: 0.5, say: 'Nobody ever asked.' }, lose: { rep: -10, say: 'Cameras. The news. A disaster.' } } }]
  ], { w: 1, cd: 40 });

  E('inheritance', 'lucky', '📜', 'An old customer left you money', 'In her will: "To the kind people at {company}."', [
    ['💰 Keep it for the company', { cash: 3, say: 'Thank you, kind stranger.' }],
    ['❤️ Give half to charity', { cash: 1.5, rep: 6, say: 'You shared the kindness.' }],
    ['🎁 Give it to your team', { teamBonus: true, team: 15, say: 'Your team couldn\'t believe it.' }],
    ['🪑 A bench in her name', { cash: 2.5, rep: 3, say: 'People sit on her bench every day.' }]
  ], { w: 0.6, cd: 80, minWeek: 20, rarity: 'rare' });

  E('famous_mention', 'lucky', '🌟', 'A superstar mentioned you', 'In an interview, a famous star said your {industry} is their favorite.', [
    ['📢 Share it everywhere', { fans: 40, demand: [1.12, 4, 'Star mention'], say: 'Everyone wants to try you now.' }],
    ['🎁 Send them a thank-you gift', { cash: -0.1, chance: { p: 0.5, win: { fans: 60, say: 'They posted your gift.' }, lose: { fans: 20, say: 'No reply. Still great.' } } }],
    ['🏷️ Name a product after them', { chance: { p: 0.6, win: { extra: [0.1, 8, 'Star special'], say: 'It became your best seller.' }, lose: { cash: -0.3, say: 'Their lawyers asked you to stop.' } } }],
    ['😌 Keep calm', { fans: 15, say: 'Nice to hear.' }]
  ], { w: 0.8, cd: 50, rarity: 'rare' });

  E('free_billboard', 'lucky', '🪧', 'You won a free billboard', 'A radio contest prize. One month on the biggest road in {city}.', [
    ['🪧 Show your best product', { demand: [1.1, 4, 'Billboard'], say: 'People came in asking for it.' }],
    ['🧑‍🤝‍🧑 Put your team on it', { team: 10, fans: 15, say: 'Your team felt famous.' }],
    ['🎯 A jab at {rival}', { fans: 25, rival: -0.05, say: 'The whole city got the joke.' }],
    ['💵 Sell the spot', { cash: 0.8, say: 'Easy money.' }]
  ], { w: 1, cd: 40, init: rival });

  E('angel_investor', 'lucky', '👼', 'A stranger wants to invest', 'An old lady says she loves your shop. "No strings. I just want you to grow."', [
    ['🙏 Accept with thanks', { cash: 2, say: 'She just wanted to help.' }],
    ['📜 Accept with a contract', { cash: 1.8, say: 'All official.' }],
    ['🤝 Offer her a small share', { cash: 2, rep: 2, say: 'She\'s part of the family now.' }],
    ['🙅 Too good to be true', { say: 'Maybe it was.' }]
  ], { w: 0.6, cd: 80, minWeek: 10, rarity: 'rare' });

  E('viral_luck', 'lucky', '🔥', 'A stranger\'s video about you went viral', 'Two million views. You didn\'t even know they filmed it.', [
    ['🔁 Share it', { fans: 30, viral: [1, 3], say: 'New customers everywhere.' }],
    ['🎁 Find them and say thanks', { cash: -0.02, fans: 40, rep: 3, say: 'They made a part two.' }],
    ['🛍️ Launch a special deal', { fans: 20, demand: [1.15, 3, 'Viral deal'], say: 'Lines out the door.' }],
    ['😌 Enjoy it quietly', { fans: 15, say: 'Nice week.' }]
  ], { w: 0.8, cd: 40, rarity: 'rare' });

  E('city_contract', 'lucky', '🏛️', 'The city wants to hire you', 'A big order for a city event. They pay slowly, but they pay.', [
    ['✍️ Sign it', { extra: [0.3, 2, 'City order'], rep: 3, say: 'Your name is on the city event.' }],
    ['📈 Ask for more', { chance: { p: 0.4, win: { extra: [0.45, 2, 'City order'], say: 'They agreed.' }, lose: { say: 'They went to {rival}.' } } }],
    ['🎁 Do it at cost for good press', { rep: 6, fans: 15, say: 'The mayor thanked you on stage.' }],
    ['🙅 Too slow to pay', { say: 'You passed.' }]
  ], { w: 0.8, cd: 50, minWeek: 10, init: rival });

  // =====================================================================
  // 🎮 MINI-GAMES
  // =====================================================================

  ev({ id: 'mystery_boxes', cat: 'lucky', icon: '📦', kind: 'boxes', w: 2, cd: 8,
    title: 'Four sealed crates at an auction',
    text: 'Nobody knows what\'s inside. You can take one home.',
    prizes: [
      { label: 'Cash', emoji: '💰', w: 3, fx: { cash: 1 } },
      { label: 'New followers', emoji: '📱', w: 2, fx: { fans: 25 } },
      { label: 'A star worker', emoji: '🦸', w: 1, fx: { hireSpecial: { role: 'front', skill: 85, traits: ['hardworking', 'friendly'] } } },
      { label: 'Happy customers', emoji: '🥰', w: 2, fx: { happy: 8, rep: 3 } },
      { label: 'Junk', emoji: '🧦', w: 2, fx: { say: 'Old junk. Nothing useful.' } },
      { label: 'Old tools', emoji: '🔧', w: 1.5, fx: { equip: 0.02, say: 'Old, but they work well.' } },
      { label: 'A puppy', emoji: '🐶', w: 0.5, fx: { pet: '🐶', team: 8, say: 'A puppy. The team is in love.' } },
      { label: 'Gold coins', emoji: '🪙', w: 0.5, fx: { cash: 4, fans: 20 } }
    ] });

  ev({ id: 'lucky_wheel', cat: 'lucky', icon: '🎡', kind: 'wheel', w: 2, cd: 8,
    title: 'The prize wheel at the trade fair',
    text: 'One spin. Big prizes, and some bad ones.',
    slices: [
      { label: 'Cash', emoji: '💰', color: '#FFB020', w: 3, fx: { cash: 0.6 } },
      { label: 'Followers', emoji: '📱', color: '#FF5FA2', w: 2.5, fx: { fans: 20 } },
      { label: 'Reputation', emoji: '⭐', color: '#7C4DFF', w: 2.5, fx: { rep: 5 } },
      { label: 'Lose cash', emoji: '💸', color: '#FF4D5E', w: 2, bad: true, fx: { cash: -0.4 } },
      { label: 'Team trip', emoji: '🎉', color: '#20C997', w: 2.5, fx: { team: 10 } },
      { label: 'JACKPOT', emoji: '💎', color: '#2EA8FF', w: 0.6, jackpot: true, fx: { cash: 4, fans: 30 } },
      { label: 'Busy week', emoji: '🍀', color: '#12B886', w: 2, fx: { demand: [1.15, 2, 'Lucky week'] } },
      { label: 'Nothing', emoji: '🙃', color: '#ADB5BD', w: 2, bad: true, fx: { say: 'Nothing this time.' } }
    ] });

  ev({ id: 'rush_hour', cat: 'lucky', icon: '🏃', kind: 'tap', w: 2, cd: 8,
    title: 'Rush hour', text: 'A huge crowd just walked in. Tap customers to serve them before they leave.',
    target: '🙋', goal: 18, secs: 7,
    win: { cash: 0.7, happy: 5, say: 'Everyone got served.' }, lose: { happy: -3, say: 'Some customers left without buying.' } });

  ev({ id: 'catch_thief', cat: 'lucky', icon: '🦹', kind: 'tap', w: 1.8, cd: 10, cond: noCams,
    title: 'Stop that thief', text: 'Someone grabbed the cash box and ran. Tap to catch them.',
    target: '🦹', goal: 14, secs: 6,
    win: { cash: 0.3, rep: 3, fans: 6, say: 'Caught them. The street cheered.' }, lose: { cash: -0.5, say: 'They got away.' } });

  ev({ id: 'burst_pipe', cat: 'lucky', icon: '💧', kind: 'tap', w: 1.5, cd: 12,
    title: 'A pipe burst', text: 'Water is spraying everywhere. Tap the leaks before the shop floods.',
    target: '💧', goal: 16, secs: 7,
    win: { cash: 0.1, say: 'All leaks plugged.' }, lose: { cash: -0.5, say: 'The floor flooded. Clean-up costs money.' } });

  ev({ id: 'bug_squash', cat: 'lucky', icon: '🐛', kind: 'tap', w: 2, cd: 10, cond: TECH,
    title: 'Bugs before launch', text: 'Launch is in one hour and the code is full of bugs. Squash them.',
    target: '🐛', goal: 18, secs: 7,
    win: { rep: 3, fans: 8, say: 'Clean launch.' }, lose: { rep: -3, say: 'Bugs got through. Users are angry.' } });

  ev({ id: 'stock_shelves', cat: 'lucky', icon: '📦', kind: 'tap', w: 1.5, cd: 12,
    title: 'A big delivery just arrived', text: 'Get it all on the shelves before opening. Tap the boxes.',
    target: '📦', goal: 20, secs: 7,
    win: { capacity: [1.08, 2, 'Fully stocked'], say: 'Shelves full. Ready to open.' }, lose: { capacity: [0.95, 1, 'Half stocked'], say: 'Half the boxes are still in the back.' } });

  ev({ id: 'doorbusters', cat: 'lucky', icon: '🛒', kind: 'tap', w: 1.5, cd: 30, cond: season(46, 49),
    title: 'Black Friday', text: 'The doors open and the crowd rushes in. Serve as many as you can.',
    target: '🛒', goal: 22, secs: 7,
    win: { cash: 1.2, fans: 10, say: 'Your best day of the year.' }, lose: { cash: 0.3, happy: -3, say: 'The line was too long. Many left.' } });

  function quizGen() {
    var t = U.ri(0, 4), q, ans, opts, money = true;
    if (t === 0) {
      var price = U.ri(3, 15), paid = price <= 5 ? 10 : 20; ans = paid - price;
      q = 'Something costs $' + price + '. The customer pays with $' + paid + '. How much change?';
      opts = [ans, ans + 1, ans + 2, ans - 1, ans + 3];
    } else if (t === 1) {
      var n = U.ri(2, 9), p = U.ri(2, 6); ans = n * p;
      q = 'You sell ' + n + ' things for $' + p + ' each. How much did you make?';
      opts = [ans, ans + p, ans - p, n + p, ans + 2 * p];
    } else if (t === 2) {
      var sell = U.ri(8, 20), costx = U.ri(2, sell - 2); ans = sell - costx;
      q = 'You sell something for $' + sell + '. It cost you $' + costx + ' to make. What is your profit?';
      opts = [ans, sell + costx, ans + 2, ans - 2, ans + 1];
    } else if (t === 3) {
      var full = U.pick([10, 20, 40, 50, 100]), pct = U.pick([10, 20, 50]); ans = full - full * pct / 100;
      q = 'Something costs $' + full + '. It\'s ' + pct + '% off today. What is the new price?';
      opts = [ans, full - pct, full * pct / 100, ans + 5, ans - 5];
    } else {
      var w = U.ri(2, 6), each = U.pick([5, 10, 20, 25]); ans = w * each; money = false;
      q = 'You have ' + w + ' workers. Each serves ' + each + ' customers a day. How many customers a day?';
      opts = [ans, w + each, ans + each, ans - each, ans + 2 * each];
    }
    var uniq = [];
    opts.forEach(function (o) { if (uniq.indexOf(o) < 0 && o > 0) uniq.push(o); });
    for (var k = 1; uniq.length < 4; k++) if (uniq.indexOf(ans + k * 4) < 0) uniq.push(ans + k * 4);
    uniq = U.shuffle(uniq.slice(0, 4));
    return { q: q, options: uniq.map(function (o) { return (money ? '$' : '') + o; }), answer: uniq.indexOf(ans) };
  }
  ev({ id: 'quiz', cat: 'lucky', icon: '🧠', kind: 'quiz', w: 2, cd: 6,
    init: function (g, c) { c.q = quizGen(); },
    title: 'A buyer tests you', text: 'Get it right and they\'ll place an order.',
    win: { cash: 0.5, xp: 20, say: 'Right. They placed an order.' }, lose: { say: 'Wrong. They\'ll think about it.' } });

  ev({ id: 'investor_deal', cat: 'money', icon: '💼', kind: 'deal', w: 1.2, cd: 20, minWeek: 12,
    cond: function (g) { return g.ownership > 30; },
    init: function (g, c) { c.pct = U.pick([5, 10, 15]); c.offer = U.nice(G.stakeOffer(g, c.pct) * 0.8); c.round = 0; c.own = Math.round(g.ownership); },
    title: 'An investor wants a piece', text: 'She wants {pct}% of {company}. You own {own}% now. Make a deal.',
    accept: function (g, c) { return { money: c.offer, run: function (gg) { gg.ownership -= c.pct; return 'You sold ' + c.pct + '% of the company.'; } }; },
    acceptSay: 'Deal. {offerTxt} is in your account.' });

  ev({ id: 'buy_recipe', cat: 'money', icon: '📜', kind: 'deal', w: 1, cd: 25, minWeek: 8,
    init: function (g, c) { c.offer = U.nice(G.scale(g) * 0.6); c.round = 0; },
    title: 'A big company wants your secret', text: 'They want to buy your best recipe. They\'ll copy it, so you\'ll lose some customers.',
    accept: function (g, c) { return { money: c.offer, demand: [0.95, 8, 'Secret sold'] }; },
    acceptSay: 'Sold. {offerTxt} for your secret.' });

  ev({ id: 'movie_filming', cat: 'lucky', icon: '🎬', kind: 'deal', w: 1, cd: 30, minWeek: 5, rarity: 'rare',
    init: function (g, c) { c.offer = U.nice(G.scale(g) * 0.9); c.round = 0; },
    title: 'A movie wants to film here', text: 'You\'d have to close for a week. How much will they pay?',
    accept: function (g, c) { return { money: c.offer, closed: [1, 'Movie filming'], fans: 20 }; },
    acceptSay: 'Deal. {offerTxt}, and your shop is in a movie.' });

  ev({ id: 'interview', cat: 'team', icon: '🧑‍💼', kind: 'interview', w: 2.5, cd: 6,
    init: function (g, c) {
      var role = U.weighted(['front', 'sales', 'acct', 'mgr'], function (r) { return { front: 60, sales: 20, acct: 10, mgr: 10 }[r]; });
      c.cand = G.makeEmployee(g, role, { skill: U.ri(35, 90) });
      c.cand.salary = Math.round(c.cand.salary * 0.95);
    },
    title: 'Someone wants a job', text: 'Ask one question. Then decide.' });

  // =====================================================================
  // ✨ LEGENDARY
  // =====================================================================

  E('billionaire_offer', 'legendary', '🛥️', 'A billionaire wants your company', 'She flew in on a private jet. "Name your price."', [
    ['🙅 "It\'s not for sale."', { cash: 3, rep: 8, team: 12, fans: 30, say: 'She smiled. "Good answer." She invested anyway.' }],
    ['💰 Sell her a small piece', { cash: 6, say: 'A huge check for a tiny piece.' }],
    ['🤝 Ask her to be your mentor', { demand: [1.15, 12, 'Billionaire mentor'], rep: 5, say: 'Her advice changed everything.' }],
    ['📈 Name an insane price', { chance: { p: 0.2, win: { cash: 10, say: 'She paid it. For 10%. Wow.' }, lose: { rep: 2, say: 'She laughed and left. With respect.' } } }]
  ], { rarity: 'legendary', w: 1, cd: 200, minWeek: 30 });

  E('magazine_cover', 'legendary', '📰', 'You\'re on the cover of a big magazine', '"The boss everyone is talking about." Millions of copies.', [
    ['📸 Pose with the team', { team: 15, fans: 80, rep: 8, say: 'Your team framed the cover.' }],
    ['💼 Pose alone, looking serious', { fans: 70, rep: 10, say: 'You look like a legend.' }],
    ['🗣️ Give a bold interview', { chance: { p: 0.7, win: { fans: 100, rep: 8, say: 'Your quotes are everywhere.' }, lose: { fans: 40, rep: -4, say: 'One quote was taken the wrong way.' } } }],
    ['🎁 Put your product on it', { fans: 60, demand: [1.15, 6, 'Magazine cover'], say: 'Sales jumped overnight.' }]
  ], { rarity: 'legendary', w: 1, cd: 200, minWeek: 25 });

  E('royal_order', 'legendary', '👑', 'A royal family placed an order', 'A palace wants your products for a state dinner.', [
    ['👑 Say yes, make it perfect', { cash: -0.3, rep: 12, fans: 60, extra: [0.3, 2, 'Royal order'], say: '"By royal order." You can put that on your door now.' }],
    ['📢 Tell the world', { fans: 80, rep: 6, say: 'The whole world knows.' }],
    ['🤫 Keep it secret, as asked', { rep: 15, extra: [0.4, 2, 'Royal order'], say: 'They trusted you. More orders followed.' }],
    ['📈 Charge royal prices', { chance: { p: 0.6, win: { cash: 4, say: 'They paid without blinking.' }, lose: { rep: -3, say: 'They went elsewhere.' } } }]
  ], { rarity: 'legendary', w: 1, cd: 200, minWeek: 20 });

  E('president_visit', 'legendary', '🏛️', 'The president is visiting your shop', 'Security everywhere. Cameras from every news channel.', [
    ['🤝 Give a tour yourself', { fans: 90, rep: 10, say: 'Photos of you two were on every channel.' }],
    ['🎁 A gift from the team', { team: 15, fans: 60, rep: 8, say: 'The president shook every worker\'s hand.' }],
    ['🎤 Ask for help for small shops', { rep: 15, fans: 50, say: 'Your words made the news.' }],
    ['😬 Stay in the back', { fans: 30, say: 'The team handled it. Good job.' }]
  ], { rarity: 'legendary', w: 1, cd: 200, minWeek: 30 });

  E('ipo_offer', 'legendary', '🔔', 'Bankers want to take you public', 'Your company on the stock market. Ring the bell. Get very rich.', [
    ['🔔 Go public', { cash: 8, team: -5, say: 'You rang the bell. Rich, but with more bosses now.' }],
    ['⏳ Wait a year', { rep: 4, say: 'The offer will come again.' }],
    ['🤝 Sell only a little', { cash: 4, say: 'Rich and still in control.' }],
    ['🙅 Stay private', { team: 10, say: 'Your company, your rules.' }]
  ], { rarity: 'legendary', w: 1, cd: 200, minWeek: 40 });

  E('documentary', 'legendary', '🎥', 'A documentary about you', 'A famous director wants to film your whole year.', [
    ['🎥 Show everything', { chance: { p: 0.7, win: { fans: 120, rep: 8, say: 'The film won awards. You\'re famous.' }, lose: { fans: 60, rep: -6, say: 'They showed your worst moments.' } } }],
    ['✂️ Yes, with final say', { fans: 80, rep: 5, say: 'A good film. A little safe.' }],
    ['🧑‍🤝‍🧑 Make it about the team', { fans: 70, team: 15, say: 'Your team became stars.' }],
    ['🙅 Keep it private', { say: 'They filmed {rival} instead.' }]
  ], { rarity: 'legendary', w: 1, cd: 200, minWeek: 25, init: rival });

  E('record_order', 'legendary', '📦', 'The biggest order in your history', 'A global company wants a year\'s worth of stock. In one order.', [
    ['💪 Say yes', { extra: [1.5, 1, 'Record order'], team: -10, say: 'Everyone worked day and night. You did it.' }],
    ['🧑‍💼 Hire extra help and say yes', { hireSpecial: { role: 'front', skill: 60 }, extra: [1.3, 1, 'Record order'], say: 'Done, with the new hires.' }],
    ['📈 Ask for more money', { chance: { p: 0.5, win: { extra: [2, 1, 'Record order'], team: -10, say: 'They paid. Your biggest week ever.' }, lose: { say: 'They went elsewhere.' } } }],
    ['🙅 Too big for you', { say: 'You passed.' }]
  ], { rarity: 'legendary', w: 1, cd: 200, minWeek: 20 });

  E('boss_of_year', 'legendary', '🏆', 'You\'re named Boss of the Year', 'The biggest business award in the country. The ceremony is on TV.', [
    ['🎤 Thank your team on stage', { team: 20, rep: 10, fans: 60, say: 'Your team cried watching it.' }],
    ['🎤 Thank your family', { rep: 8, fans: 50, say: 'Your mom called you crying.' }],
    ['🎤 Call out {rival}', { chance: { p: 0.5, win: { fans: 100, rival: -0.1, say: 'The crowd went wild.' }, lose: { rep: -5, fans: 30, say: 'People thought it was petty.' } } }],
    ['🏆 Give it to your first worker', { team: 25, rep: 12, say: 'The most shared moment of the night.' }]
  ], { rarity: 'legendary', w: 1, cd: 200, minWeek: 30, init: rival });

  E('mystery_benefactor', 'legendary', '✉️', 'A letter with no name', 'Inside: a huge check and a note. "You helped me once. Now I help you."', [
    ['💰 Put it in the business', { cash: 6, say: 'You never found out who it was.' }],
    ['🔍 Find out who sent it', { chance: { p: 0.5, win: { cash: 6, rep: 5, say: 'It was a boy you gave free food to years ago. He\'s rich now.' }, lose: { cash: 6, say: 'No clue. But the money is real.' } } }],
    ['🎁 Share it with the team', { teamBonus: true, team: 20, cash: 3, say: 'Everyone got a gift.' }],
    ['❤️ Pay it forward', { cash: 2, rep: 12, fans: 40, say: 'You helped someone else. The story went viral.' }]
  ], { rarity: 'legendary', w: 1, cd: 200, minWeek: 20 });

  // More rivals, world news and lucky breaks.
  E('rival_copy_menu', 'rivals', '📋', '{rival} copied everything you sell', 'Same products, same names. Just a bit cheaper.', [
    ['🆕 Launch new products fast', { cash: -0.4, demand: [1.08, 6, 'New products'], say: 'Always one step ahead.' }],
    ['⚖️ Send a lawyer\'s letter', { cash: -0.2, chance: { p: 0.5, win: { rival: -0.08, say: 'They changed their names.' }, lose: { say: 'They ignored it.' } } }],
    ['📢 "The original is here"', { fans: 20, rep: 3, say: 'Customers know who came first.' }],
    ['🤷 Let them', { demand: [0.93, 4, 'Copycat'], say: 'Some customers switched.' }]
  ], { w: 1.2, cd: 30, minWeek: 6, init: rival });

  E('rival_new_boss', 'rivals', '😈', '{rival} has a ruthless new boss', 'Her first speech: "We will crush {company}."', [
    ['🛡️ Prepare for war', { cash: -0.3, team: 5, say: 'Your team is ready.' }],
    ['🤝 Invite her for coffee', { chance: { p: 0.5, win: { rival: -0.03, say: 'She\'s tough, but fair.' }, lose: { rival: 0.05, say: 'She used it to study you.' } } }],
    ['📢 Answer publicly', { fans: 20, say: 'The city loves a rivalry.' }],
    ['🤷 Ignore her', { rival: 0.05, say: 'She\'s coming for you.' }]
  ], { kind: 'news', w: 1, cd: 40, minWeek: 10, init: rival });

  E('rival_celebrity_ad', 'rivals', '🌟', '{rival} hired a famous star for ads', 'Their ads are everywhere. Your customers are curious.', [
    ['🎤 Get your own star', { cash: -1, fans: 40, say: 'Your ad is better.' }],
    ['🧑‍🤝‍🧑 Real customers as stars', { cash: -0.2, rep: 5, fans: 20, say: 'People trust real faces.' }],
    ['🏷️ A sale the same week', { supply: [0.04, 2, 'Sale'], demand: [1.1, 2, 'Sale'], say: 'You kept your customers.' }],
    ['🤷 Stars don\'t last', { demand: [0.93, 4, 'Rival star ad'], say: 'Some left, for now.' }]
  ], { w: 1, cd: 35, minWeek: 8, init: rival });

  E('rival_three_offers', 'rivals', '🎣', '{rival} is hiring away your team', 'Better pay. They have until Friday to answer.', [
    ['💵 Raise pay for everyone', { teamRaise: 0.06, team: 12, say: 'Nobody left.' }],
    ['❤️ A team meeting', { chance: { p: 0.6, win: { team: 10, say: 'Everyone stayed.' }, lose: { team: -4, next: ['resign', 1, 3], say: 'One is still thinking.' } } }],
    ['🎁 Bonuses to stay', { teamBonus: true, team: 8, say: 'They stayed.' }],
    ['🤷 Let them choose', { team: -6, next: ['resign', 1, 3, 0.8], say: 'At least one will leave.' }]
  ], { w: 1, cd: 40, need: 4, minWeek: 10, who: { a: 'any' }, init: rival });

  E('rival_award_win', 'rivals', '🏆', '{rival} won the award you wanted', 'Best in {city}. You were runner-up.', [
    ['👏 Congratulate them', { rep: 4, say: 'Classy. People noticed.' }],
    ['💪 "Next year is ours"', { team: 8, say: 'Your team is fired up.' }],
    ['🔍 Ask the judges why', { chance: { p: 0.5, win: { rep: 2, say: 'Useful advice.' }, lose: { rep: -2, say: 'You looked like a sore loser.' } } }],
    ['😤 Complain publicly', { rep: -6, say: 'Bad look.' }]
  ], { kind: 'news', w: 1, cd: 40, minWeek: 12, init: rival });

  E('rival_expands', 'rivals', '🏬', '{rival} is opening five new locations', 'They got big money from investors.', [
    ['🏬 Expand too', { cash: -2, capacity: [1.15, 20, 'Expansion'], say: 'You\'re keeping up.' }],
    ['⭐ Stay small and special', { rep: 5, say: 'Quality over size.' }],
    ['🤝 Offer to supply them', { chance: { p: 0.4, win: { extra: [0.1, 12, 'Supply deal'], say: 'They\'re your customer now.' }, lose: { say: 'They laughed.' } } }],
    ['🕵️ Wait for them to stumble', { chance: { p: 0.5, win: { rival: -0.1, say: 'They grew too fast.' }, lose: { rival: 0.1, say: 'They didn\'t stumble.' } } }]
  ], { kind: 'news', w: 0.8, cd: 50, minWeek: 20, init: rival });

  E('rival_poster_war', 'rivals', '🪧', 'Your posters were torn down', 'All over town. {rival}\'s posters are in their place.', [
    ['📹 Catch them on camera', { chance: { p: 0.5, win: { rival: -0.08, fans: 15, say: 'Caught. Posted. Busted.' }, lose: { say: 'No proof.' } } }],
    ['🪧 Put up even more', { cash: -0.2, fans: 10, say: 'Your posters are everywhere again.' }],
    ['🏛️ Complain to the city', { chance: { p: 0.6, win: { rival: -0.05, say: 'They got a fine.' }, lose: { say: 'Nothing happened.' } } }],
    ['📱 Go digital', { cash: -0.2, fans: 20, say: 'Nobody can tear that down.' }]
  ], { w: 1.2, cd: 30, minWeek: 5, init: rival });

  E('rival_underdog', 'rivals', '🐣', 'A tiny new shop is taking your customers', 'Two young owners. Clever ideas. People love them.', [
    ['🤝 Offer to buy them', { chance: { p: 0.5, win: { cash: -1, demand: [1.08, 12, 'Bought new shop'], say: 'Their ideas are yours now.' }, lose: { say: 'They said no.' } } }],
    ['💼 Hire one of them', { hireSpecial: { role: 'front', skill: 75, traits: ['creative'] }, say: 'Fresh ideas on your team.' }],
    ['🔍 Learn from them', { cash: -0.2, demand: [1.05, 8, 'New ideas'], say: 'You borrowed a few ideas.' }],
    ['🤷 They\'ll fade', { demand: [0.94, 6, 'New shop'], say: 'They didn\'t fade.' }]
  ], { w: 1, cd: 40, minWeek: 10 });

  E('transport_strike', 'world', '🚌', 'Buses and trains are on strike', 'Nobody can get around. Half your team can\'t come in.', [
    ['🚗 Pick up workers', { team: 8, capacity: [0.9, 1, 'Transport strike'], say: 'You drove all morning.' }],
    ['🏠 Work from home where possible', { capacity: [0.85, 1, 'Transport strike'], say: 'A slow week.' }],
    ['🚕 Pay for taxis', { cash: -0.2, say: 'Everyone got in.' }],
    ['🔒 Close for the strike', { closed: [1, 'Transport strike'], say: 'A lost week.' }]
  ], { w: 1, cd: 40 });

  E('tax_cut', 'world', '🏛️', 'The government cut business taxes', 'You\'ll keep more money this year.', [
    ['💰 Save it', { cash: 0.8, say: 'A nice cushion.' }],
    ['💵 Raise pay', { teamRaise: 0.04, team: 10, say: 'Shared the good news.' }],
    ['🛠️ Buy equipment', { equip: 0.03, say: 'Faster work.' }],
    ['📉 Lower prices', { price: -1, happy: 5, say: 'Customers love it.' }]
  ], { kind: 'news', w: 0.6, cd: 80, minWeek: 20 });

  E('inflation', 'world', '📈', 'Prices are rising everywhere', 'Everything costs more. Customers are spending less.', [
    ['📈 Raise your prices', { price: 1, happy: -3, say: 'Customers understood. Mostly.' }],
    ['🏷️ A budget option', { cash: -0.2, demand: [1.05, 8, 'Budget option'], say: 'Customers love the choice.' }],
    ['😬 Keep prices the same', { supply: [0.05, 8, 'Inflation'], happy: 3, say: 'Loyal customers. Thin profits.' }],
    ['💵 Help your team', { teamRaise: 0.05, team: 10, say: 'Your team is grateful.' }]
  ], { kind: 'news', w: 0.8, cd: 60, minWeek: 15 });

  E('industry_trend', 'world', '📈', 'Everyone is talking about {industry}s', 'A viral documentary made your kind of business the coolest thing in town.', [
    ['📢 Ride the wave', { cash: -0.2, fans: 30, demand: [1.12, 4, 'Trend'], say: 'New customers everywhere.' }],
    ['🎥 Invite the filmmakers', { fans: 40, say: 'They filmed a follow-up at your place.' }],
    ['📈 Raise prices a bit', { price: 1, demand: [1.08, 4, 'Trend'], say: 'People paid it.' }],
    ['😌 Enjoy it', { demand: [1.06, 4, 'Trend'], say: 'Busy weeks.' }]
  ], { kind: 'news', w: 0.8, cd: 60 });

  E('storm_warning', 'world', '⛈️', 'A big storm is coming tonight', 'Strong winds, heavy rain. Your windows face the street.', [
    ['🪵 Board up the windows', { cash: -0.1, say: 'No damage.' }],
    ['🏠 Send everyone home early', { capacity: [0.9, 1, 'Storm'], team: 5, say: 'Everyone safe.' }],
    ['📄 Check your insurance', { chance: { p: function (g) { return g.flags.insured ? 0.95 : 0.5; }, win: { say: 'The storm passed. All fine.' }, lose: { cash: -0.6, say: 'Broken windows. Not covered.' } } }],
    ['🤞 Hope for the best', { chance: { p: 0.5, win: { say: 'It missed you.' }, lose: { cash: -0.8, closed: [1, 'Storm damage'], say: 'Smashed windows.' } } }]
  ], { w: 1.2, cd: 35 });

  E('found_cash_box', 'lucky', '📦', 'An old cash box under the floor', 'Your team found it fixing the floor. It\'s full of old coins.', [
    ['🏛️ Take it to a museum', { chance: { p: 0.4, win: { cash: 2, rep: 5, say: 'Rare coins. A reward.' }, lose: { rep: 4, say: 'Not rare. Good press though.' } } }],
    ['💰 Sell the coins', { cash: 0.8, say: 'A nice surprise.' }],
    ['🎁 Share with the team', { team: 10, cash: 0.3, say: 'Everyone got a coin.' }],
    ['🔍 Find the owner\'s family', { rep: 6, fans: 15, say: 'The family cried. A great story.' }]
  ], { w: 0.8, cd: 60, rarity: 'rare' });

  E('free_equipment', 'lucky', '🛠️', 'A closing business offers free equipment', '"Take it. I\'d rather it goes to someone who\'ll use it."', [
    ['🚚 Take everything', { equip: 0.04, cash: -0.1, say: 'Great tools for free.' }],
    ['🛠️ Take the best pieces', { equip: 0.03, say: 'Useful stuff.' }],
    ['💵 Pay them something', { cash: -0.3, equip: 0.04, rep: 4, say: 'They were touched.' }],
    ['🙅 No space', { say: 'You passed.' }]
  ], { w: 0.8, cd: 50 });

  // The name of an event in the Event Book.
  G.bookName = function (d) {
    var t = typeof d.title === 'string' ? d.title : (d.fx && d.fx.say) || (d.fx && d.fx.chance && d.fx.chance.win.say) || d.id;
    return t.replace(/\{[abm]\}/g, 'Someone').replace(/\{rival\}/g, 'A rival').replace(/\{company\}/g, 'Your company')
      .replace(/\{\w+\}/g, '...').split(/[.!?]/)[0].slice(0, 44);
  };
})();
