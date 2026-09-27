// Events that only happen in one kind of business, part 1: the small businesses.
// B(business, id, icon, title, text, [4 x [answer, effect]], extra fields). See events.js for effects and style rules.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var H = CS.EVH, rival = H.rival, FRONT = { who: { a: 'front' } };
  // Keeps rewards fair: extra income adds up to at most ~1.2 weeks of sales, and long customer boosts stay small.
  function tame(fx) {
    if (!fx || typeof fx !== 'object') return;
    if (fx.extra && fx.extra[0] * fx.extra[1] > 1.2) fx.extra[0] = Math.round(1.2 / fx.extra[1] * 100) / 100;
    if (fx.demand && fx.demand[0] > 1) fx.demand[0] = Math.min(fx.demand[0], fx.demand[1] > 8 ? 1.15 : 1.3);
    if (fx.chance) { tame(fx.chance.win); tame(fx.chance.lose); }
  }
  var B = CS.biz = CS.biz || function (ind, id, icon, title, text, choices, o) {
    if (!CS.IND[ind]) throw new Error('Unknown business: ' + ind);
    choices.forEach(function (c) { tame(c[1]); });
    var d = { id: ind + '_' + id, cat: 'business', icon: icon, w: 14, cd: 18, cond: H.isInd(ind), title: title, text: text,
      choices: choices.map(function (c) { return { t: c[0], fx: c[1] }; }) };
    if (o) for (var k in o) d[k] = o[k];
    if (o && o.cond) d.cond = function (g) { return g.company.industry === ind && o.cond(g); };
    CS.ev(d);
  };

  // ☕ CAFÉ
  B('cafe', 'bean_prices', '📈', 'Coffee bean prices doubled', 'A drought hit the coffee farms. Your costs just jumped overnight.', [
    ['📈 Raise your prices', { price: 1, happy: -3, say: 'Customers grumbled but kept coming.' }],
    ['🌎 Find a new farm', { cash: -0.3, chance: { p: 0.6, win: { supply: [-0.03, 12, 'New farm'], say: 'Cheaper beans, and better too.' }, lose: { happy: -3, say: 'The new beans taste bitter. Customers noticed.' } } }],
    ['😬 Absorb the cost', { supply: [0.05, 6, 'Expensive beans'], say: 'Your profits shrink for a while.' }],
    ['🍵 Push tea for a while', { fans: 6, supply: [0.02, 6, 'Expensive beans'], say: 'Tea sales surprised you.' }]
  ]);
  B('cafe', 'laptop_campers', '💻', 'Students take every table all day', 'They buy one coffee each and stay for eight hours. Paying customers can\'t sit.', [
    ['⏳ Two-hour limit', { happy: -2, capacity: [1.06, 6, 'Free tables'], say: 'Tables free up. Some students left angry.' }],
    ['💺 A paid work zone', { extra: [0.08, 8, 'Work zone'], say: 'They pay for the space now.' }],
    ['🔌 Turn off the power outlets', { capacity: [1.04, 6, 'Free tables'], fans: -3, say: 'Laptops died. Tables emptied.' }],
    ['🤷 Let them stay', { rep: 2, say: 'They love you. They just don\'t spend.' }]
  ]);
  B('cafe', 'machine_dies', '☕', 'The espresso machine died', 'Morning rush in 20 minutes. No espresso means no business.', [
    ['🔧 Emergency repair', { cash: -0.3, say: 'Fixed just in time.' }],
    ['✨ Buy a top machine', { cash: -1, equip: 0.04, say: 'Twice as fast as the old one.' }],
    ['🫖 Filter coffee only today', { capacity: [0.8, 1, 'No espresso'], say: 'A slow, grumpy morning.' }],
    ['🤝 Borrow one from a friend', { chance: { p: 0.6, win: { say: 'Your friend saved you.' }, lose: { capacity: [0.8, 1, 'No espresso'], say: 'It broke too.' } } }]
  ]);
  B('cafe', 'barista_champion', '🏆', '{a} wants to enter a barista contest', 'The entry fee is steep. Winning would put you on the map.', [
    ['🏆 Pay and train {a}', { cash: -0.3, chance: { p: 0.45, win: { rep: 6, fans: 30, a: 15, say: '{a} won. Your café is famous.' }, lose: { a: 5, skill: { a: 4 }, say: '{a} came third. Still great.' } } }],
    ['💵 Pay the fee only', { cash: -0.15, chance: { p: 0.3, win: { rep: 5, fans: 20, say: '{a} won anyway.' }, lose: { say: '{a} didn\'t place.' } } }],
    ['📅 Next year', { a: -5, say: '{a} is disappointed.' }],
    ['🙅 Focus on the shop', { a: -10, say: '{a} is looking at other cafés now.' }]
  ], FRONT);
  B('cafe', 'chain_nearby', '🏬', 'A giant coffee chain is opening nearby', 'Cheaper, faster, and famous. Your regulars are curious.', [
    ['⭐ Be the local favorite', { cash: -0.3, rep: 5, say: 'Real coffee, real people. Regulars stayed.' }],
    ['📉 Lower your prices', { price: -1, say: 'You kept your customers.' }],
    ['🎟️ Launch a loyalty card', { cash: -0.1, happy: 4, demand: [1.05, 8, 'Loyalty card'], say: 'Every tenth coffee free. Regulars love it.' }],
    ['🤷 Do nothing', { demand: [0.9, 6, 'Big chain nearby'], say: 'You lost some customers to them.' }]
  ]);
  B('cafe', 'writer_regular', '📚', 'A regular wrote a bestseller here', 'The book mentions your café by name. Readers want to see it.', [
    ['🪑 Put a sign on "the table"', { fans: 20, demand: [1.1, 6, 'Book fans'], say: 'Fans line up to sit there.' }],
    ['🎤 Host a book signing', { cash: -0.1, fans: 30, rep: 3, say: 'Packed all day.' }],
    ['☕ A drink named after the book', { extra: [0.08, 8, 'Book drink'], say: 'Everyone orders it.' }],
    ['🤐 Keep it low-key', { rep: 2, say: 'The writer appreciated it.' }]
  ]);
  B('cafe', 'milk_allergy', '🥛', 'Wrong milk in a customer\'s drink', '{a} used regular milk in an oat milk order. The customer is allergic.', [
    ['🚑 Get them help now', { rep: 2, a: -5, say: 'They\'re okay. It was close.' }],
    ['🏷️ New labels for every jug', { cash: -0.05, rep: 3, say: 'It won\'t happen again.' }],
    ['🎓 Retrain {a}', { skill: { a: 4 }, a: -4, say: '{a} is extra careful now.' }],
    ['🙅 Deny it was your fault', { rep: -6, say: 'They posted about it. Badly.' }]
  ], FRONT);

  // 🍝 RESTAURANT
  B('restaurant', 'chef_tantrum', '🔪', 'Your chef threatens to walk out', '{a} says the kitchen is a mess and refuses to cook until it\'s fixed.', [
    ['🛠️ Fix the kitchen', { cash: -0.5, a: 15, equip: 0.02, say: 'New kitchen. Happy chef.' }],
    ['💵 Pay {a} more to stay', { raise: ['a', 0.1], a: 10, say: 'The kitchen is still a mess.' }],
    ['🤝 Fix it together', { cash: -0.2, a: 8, team: 4, say: 'A weekend of work. A better kitchen.' }],
    ['🚪 "Then go."', { quit: 'a', capacity: [0.85, 2, 'No chef'], say: 'The kitchen is chaos without them.' }]
  ], FRONT);
  B('restaurant', 'no_show', '📅', 'A group of 30 never showed up', 'They booked the whole restaurant. You turned people away for them.', [
    ['💳 Charge their card', { chance: { p: 0.6, win: { cash: 0.4, say: 'You had their card. They paid.' }, lose: { cash: -0.3, say: 'The card was fake.' } } }],
    ['🍽️ Give the food to a shelter', { cash: -0.3, rep: 5, say: 'Nothing wasted. People noticed.' }],
    ['📜 Deposits for big groups', { cash: -0.3, say: 'Never again.' }],
    ['📱 Post about it', { cash: -0.3, fans: 12, say: 'People felt for you.' }]
  ]);
  B('restaurant', 'critic_star', '⭐', 'A top food guide is visiting', 'One star from them would change everything. Nobody knows when they\'ll come.', [
    ['👨‍🍳 Perfect every dish', { cash: -0.4, team: -5, chance: { p: 0.4, win: { rep: 10, demand: [1.15, 12, 'Food star'], fans: 40, say: 'You got a star.' }, lose: { rep: 2, say: 'No star. But the food got better.' } } }],
    ['🌿 A new tasting menu', { cash: -0.6, chance: { p: 0.45, win: { rep: 10, demand: [1.15, 12, 'Food star'], say: 'A star. Bookings exploded.' }, lose: { say: 'Not this year.' } } }],
    ['🙂 Stay yourself', { chance: { p: 0.25, win: { rep: 10, fans: 40, say: 'They loved it. A star.' }, lose: { say: 'No star.' } } }],
    ['🙅 Stars don\'t matter', { team: 4, say: 'The team is relaxed. Customers still come.' }]
  ]);
  B('restaurant', 'wedding_catering', '💒', 'Catering for 300 wedding guests', 'Three days\' notice. It pays very well.', [
    ['💪 Take it', { extra: [0.5, 1, 'Wedding catering'], team: -8, say: 'It went perfectly. The team is exhausted.' }],
    ['🧑‍🍳 Hire temp cooks and take it', { cash: -0.2, extra: [0.5, 1, 'Wedding catering'], say: 'Smooth. Great profit.' }],
    ['📈 Take it at double price', { chance: { p: 0.5, win: { extra: [0.8, 1, 'Wedding catering'], team: -8, say: 'They paid. Huge week.' }, lose: { say: 'They went elsewhere.' } } }],
    ['🙅 Too much', { say: 'You passed.' }]
  ]);
  B('restaurant', 'dine_dash', '🏃', 'A table of eight ran without paying', 'A huge bill. They slipped out while {a} was in the kitchen.', [
    ['📹 Post the camera footage', { chance: { p: 0.5, win: { cash: 0.1, fans: 10, say: 'Someone recognized them. They paid.' }, lose: { cash: -0.2, say: 'Nobody knew them.' } } }],
    ['👮 Call the police', { cash: -0.2, say: 'They took a report.' }],
    ['💸 Take it from {a}\'s pay', { cash: -0.1, a: -20, loyal: { a: -15 }, say: '{a} is furious. So is the team.' }],
    ['📜 Pay at the table from now on', { cash: -0.2, say: 'It won\'t happen again.' }]
  ], FRONT);
  B('restaurant', 'grandma_recipe', '👵', '{a}\'s family recipe', '{a} wants to add their grandmother\'s famous stew to the menu.', [
    ['🍲 Add it', { chance: { p: 0.6, win: { demand: [1.1, 8, 'Family recipe'], a: 12, say: 'It\'s your best seller.' }, lose: { a: 5, say: 'Nobody ordered it. {a} is sad.' } } }],
    ['🧪 Test it on regulars first', { chance: { p: 0.7, win: { demand: [1.08, 8, 'Family recipe'], a: 10, say: 'Regulars loved it.' }, lose: { say: 'It didn\'t catch on.' } } }],
    ['📛 Name it after grandma', { a: 15, loyal: { a: 15 }, fans: 8, say: '{a} called grandma crying.' }],
    ['🙅 Keep the menu the same', { a: -8, say: '{a} feels ignored.' }]
  ], FRONT);
  B('restaurant', 'health_score', '🧾', 'Your health grade dropped', 'The inspector gave you a C. It has to go on the window.', [
    ['🧹 Deep clean and get rechecked', { cash: -0.4, closed: [1, 'Deep clean'], rep: 2, say: 'Back to an A.' }],
    ['🎓 Hygiene training for everyone', { cash: -0.2, team: -2, rep: 3, say: 'The whole team is sharper.' }],
    ['🪴 Hide the sign behind a plant', { chance: { p: 0.4, win: { say: 'Nobody noticed.' }, lose: { cash: -0.5, rep: -5, say: 'That\'s illegal. A fine.' } } }],
    ['🤷 Leave it', { demand: [0.88, 6, 'C grade'], say: 'People walked past.' }]
  ]);

  // 🥐 BAKERY
  B('bakery', 'oven_4am', '🔥', 'The oven broke at 4 AM', 'You open in three hours. No oven means no bread.', [
    ['📞 Emergency repair', { cash: -0.4, say: 'Fixed at 6:45. Just in time.' }],
    ['🤝 Borrow a friend\'s oven', { team: 3, capacity: [0.8, 1, 'Borrowed oven'], say: 'A crazy morning, but you opened.' }],
    ['🆕 Buy a new oven today', { cash: -1, equip: 0.03, say: 'A better oven. A lighter wallet.' }],
    ['🔒 Stay closed today', { closed: [1, 'Broken oven'], say: 'A sign on the door. A lost day.' }]
  ]);
  B('bakery', 'wedding_cake', '🎂', 'A huge wedding cake order', 'Five tiers, sugar flowers, for Saturday. The family is very rich.', [
    ['🎂 Make it yourself', { chance: { p: 0.7, win: { cash: 1, fans: 15, say: 'Perfect. Photos everywhere.' }, lose: { cash: -0.3, rep: -4, say: 'It leaned. Everyone noticed.' } } }],
    ['🧑‍🍳 Let {a} lead it', { chance: { p: 0.6, win: { cash: 1, a: 15, say: '{a} made a masterpiece.' }, lose: { rep: -3, a: -8, say: 'A tier cracked. {a} is crushed.' } } }],
    ['📈 Charge a luxury price', { chance: { p: 0.5, win: { cash: 1.5, say: 'They paid.' }, lose: { say: 'They went elsewhere.' } } }],
    ['🙅 Too risky', { say: 'You passed.' }]
  ], FRONT);
  B('bakery', 'gluten_free', '🌾', 'Customers want gluten-free', 'More people ask every week. You have nothing for them.', [
    ['🍞 Add a gluten-free line', { cash: -0.3, demand: [1.08, 12, 'Gluten-free'], say: 'A whole new group of customers.' }],
    ['🥖 One gluten-free item', { cash: -0.1, demand: [1.04, 12, 'Gluten-free'], say: 'A small start.' }],
    ['🏭 A separate kitchen for it', { cash: -1, demand: [1.12, 16, 'Gluten-free'], rep: 3, say: 'Safe for everyone. People trust you.' }],
    ['🙅 Stick to classics', { say: 'They go elsewhere.' }]
  ]);
  B('bakery', 'leftover_bread', '🍞', 'So much bread is thrown away', 'Every night, crates of unsold bread go in the trash.', [
    ['❤️ Give it to a shelter', { rep: 5, say: 'The shelter sent a thank-you card.' }],
    ['🏷️ Half-price after 6 PM', { extra: [0.05, 8, 'Evening sale'], say: 'The evening rush is new money.' }],
    ['🥪 Turn it into sandwiches', { cash: -0.1, extra: [0.07, 8, 'Next-day sandwiches'], say: 'Nothing wasted.' }],
    ['📉 Bake less', { supply: [-0.02, 8, 'Less waste'], happy: -2, say: 'Less waste. Some days you sell out early.' }]
  ]);
  B('bakery', 'french_rival', '🥐', 'A French baker opened across the street', 'His sign says "Real croissants. Not like THEIRS." It points at you.', [
    ['🥐 Master the croissant', { cash: -0.2, rep: 4, say: 'Yours are better now. Customers agree.' }],
    ['🏆 Challenge him to a taste test', { chance: { p: 0.5, win: { fans: 25, rep: 4, say: 'You won. He took the sign down.' }, lose: { fans: 8, say: 'He won. Barely.' } } }],
    ['🤝 Say hello with a gift', { chance: { p: 0.6, win: { rep: 3, say: 'He laughed. You\'re friends now.' }, lose: { say: 'He threw it away.' } } }],
    ['📉 Lower your prices', { price: -1, say: 'Cheaper than him.' }]
  ]);
  B('bakery', 'flour_burn', '🩹', '{a} burned their arm on a tray', 'A bad burn. {a} is trying to keep working.', [
    ['🏥 Send {a} to the doctor', { a: 10, capacity: [0.9, 1, '{a} hurt'], say: 'It\'ll heal. {a} is grateful.' }],
    ['🧤 New safety gloves for all', { cash: -0.1, team: 5, say: 'Nobody else will get burned.' }],
    ['🩹 Bandage it and carry on', { a: -10, say: '{a} worked in pain all day.' }],
    ['🏠 Paid week off', { a: 15, loyal: { a: 10 }, capacity: [0.9, 1, '{a} resting'], say: '{a} will remember this.' }]
  ], FRONT);
  B('bakery', 'sourdough_trend', '🥖', 'Sourdough is the new trend', 'Everyone wants it. It takes two days to make.', [
    ['🥖 Go all in', { cash: -0.2, demand: [1.1, 8, 'Sourdough'], team: -3, say: 'Sold out every day.' }],
    ['🧪 A small batch', { demand: [1.05, 6, 'Sourdough'], say: 'Nice extra sales.' }],
    ['🎓 Sourdough classes', { extra: [0.06, 6, 'Classes'], fans: 10, say: 'Classes are fully booked.' }],
    ['🙅 It\'s just a trend', { say: 'You skipped it.' }]
  ]);

  // 🌮 FOOD TRUCK
  B('foodtruck', 'spot_taken', '🅿️', '{rival}\'s truck took your spot', 'Your best spot by the park. Their truck got there first.', [
    ['⏰ Arrive at 5 AM tomorrow', { team: -4, say: 'The spot is yours again.' }],
    ['🗺️ Find a better spot', { chance: { p: 0.5, win: { demand: [1.08, 6, 'New spot'], say: 'Even busier than before.' }, lose: { demand: [0.9, 3, 'Bad spot'], say: 'Nobody walks by here.' } } }],
    ['🗣️ Confront them', { chance: { p: 0.5, win: { say: 'They moved.' }, lose: { rep: -2, say: 'It turned into a shouting match.' } } }],
    ['🤝 Share the spot', { rival: 0.03, say: 'Both trucks, one spot.' }]
  ], { init: rival });
  B('foodtruck', 'festival_spot', '🎪', 'A big festival wants your truck', 'Thousands of hungry people. The spot fee is huge.', [
    ['🎪 Pay and go', { cash: -0.6, chance: { p: 0.7, win: { extra: [0.9, 1, 'Festival'], fans: 20, say: 'Sold out every day.' }, lose: { extra: [0.3, 1, 'Festival'], say: 'Rain. Half the crowd stayed home.' } } }],
    ['🤝 Split the spot with a friend', { cash: -0.3, extra: [0.4, 1, 'Festival'], say: 'Less risk, still good.' }],
    ['🍔 Special festival menu', { cash: -0.7, extra: [1, 1, 'Festival'], fans: 25, say: 'People lined up for your special.' }],
    ['🙅 Too expensive', { say: 'Another truck took the spot.' }]
  ]);
  B('foodtruck', 'breakdown', '🚚', 'The truck broke down on the highway', 'Smoke from the engine. A full load of food inside.', [
    ['🔧 Call a tow truck', { cash: -0.4, closed: [1, 'Truck broken'], say: 'Fixed. A lost week.' }],
    ['🍽️ Sell food on the roadside', { chance: { p: 0.5, win: { fans: 15, say: 'Drivers stopped to eat. A great story.' }, lose: { cash: -0.3, say: 'The police moved you along.' } } }],
    ['🆕 Buy a better truck', { cash: -1.5, equip: 0.04, say: 'A new truck. Fewer breakdowns.' }],
    ['🔧 Fix it yourself', { chance: { p: 0.4, win: { say: 'It runs. Barely.' }, lose: { cash: -0.6, closed: [1, 'Truck broken'], say: 'You made it worse.' } } }]
  ]);
  B('foodtruck', 'permit', '📋', 'Your street permit expired', 'The city says you can\'t park downtown until you renew. The fee went up.', [
    ['💵 Pay the new fee', { cash: -0.4, say: 'Back on the street.' }],
    ['🗺️ Work outside the city', { demand: [0.9, 4, 'Outside town'], say: 'Fewer customers.' }],
    ['🤝 Join a food truck park', { cash: -0.2, demand: [1.05, 8, 'Truck park'], say: 'Busy, and legal.' }],
    ['🙈 Park anyway', { chance: { p: 0.4, win: { say: 'Nobody checked.' }, lose: { cash: -0.6, say: 'A big fine.' } } }]
  ]);
  B('foodtruck', 'viral_taco', '🌮', 'Your special went viral', 'A food blogger called it "the best thing in {city}". The line is endless.', [
    ['🔥 Make only that', { extra: [0.2, 3, 'Viral special'], team: -5, say: 'Sold out every day.' }],
    ['📈 Raise the price', { extra: [0.15, 3, 'Viral special'], happy: -2, say: 'People paid it.' }],
    ['🚚 Open a second truck', { cash: -1.2, capacity: [1.2, 10, 'Second truck'], say: 'Two trucks now.' }],
    ['😌 Keep it normal', { fans: 10, say: 'A nice week.' }]
  ]);
  B('foodtruck', 'fire_inspect', '🧯', 'A fire inspector stops your truck', 'Your extinguisher is out of date.', [
    ['🧯 Buy a new one now', { cash: -0.05, say: 'Passed.' }],
    ['💸 Pay the fine', { cash: -0.3, say: 'Expensive.' }],
    ['🙏 Ask for a warning', { chance: { p: 0.5, win: { say: 'Just a warning.' }, lose: { cash: -0.3, say: 'No luck.' } } }],
    ['🔍 Full safety check', { cash: -0.2, rep: 2, say: 'Everything is safe now.' }]
  ]);
  B('foodtruck', 'catering_office', '🏢', 'A tech company wants daily lunches', 'Lunch for 200 workers every day. They want a big discount.', [
    ['✍️ Sign the deal', { extra: [0.1, 12, 'Office lunches'], say: 'Steady money every day.' }],
    ['🤝 Negotiate', { chance: { p: 0.5, win: { extra: [0.14, 12, 'Office lunches'], say: 'A better price.' }, lose: { say: 'They signed with another truck.' } } }],
    ['🧪 A one-week trial', { extra: [0.1, 1, 'Office trial'], say: 'They want to keep going.' }],
    ['🙅 Too cheap', { say: 'You passed.' }]
  ]);

  // 🚗 CAR WASH
  B('carwash', 'scratched_car', '🚗', 'A customer says you scratched their car', 'A very expensive car. The owner is shouting.', [
    ['💸 Pay for the repair', { cash: -0.5, say: 'Paid. They calmed down.' }],
    ['📹 Check the cameras', { chance: { p: 0.6, win: { rep: 2, say: 'The scratch was there before.' }, lose: { cash: -0.6, say: 'It was your brush.' } } }],
    ['🎟️ Free washes for a year', { rep: 2, capacity: [0.98, 12, 'Free washes'], say: 'They accepted.' }],
    ['🙅 Refuse to pay', { rep: -5, say: 'They reviewed you everywhere.' }]
  ]);
  B('carwash', 'drought', '🚱', 'Water limits in {city}', 'A drought. The city is limiting water for businesses.', [
    ['♻️ Buy a water recycler', { cash: -1.2, equip: 0.03, say: 'You use half the water now.' }],
    ['🧽 Hand wash only', { capacity: [0.8, 6, 'Water limits'], say: 'Slower, but open.' }],
    ['🚿 Break the rules', { chance: { p: 0.4, win: { say: 'Nobody noticed.' }, lose: { cash: -0.8, rep: -5, say: 'A big fine. And bad press.' } } }],
    ['💧 Waterless wash service', { cash: -0.3, extra: [0.05, 6, 'Waterless wash'], say: 'A smart new service.' }]
  ]);
  B('carwash', 'fleet_deal', '🚕', 'A taxi company wants a deal', 'They have 80 taxis. They want them washed every week, cheap.', [
    ['✍️ Take it', { extra: [0.1, 12, 'Taxi deal'], team: -3, say: 'Steady money.' }],
    ['🤝 Push for more', { chance: { p: 0.5, win: { extra: [0.14, 12, 'Taxi deal'], say: 'Signed at your price.' }, lose: { say: 'They went elsewhere.' } } }],
    ['🌙 Night shifts only', { extra: [0.08, 12, 'Taxi deal'], say: 'No effect on normal customers.' }],
    ['🙅 No', { say: 'You passed.' }]
  ]);
  B('carwash', 'broken_brush', '🔧', 'The big brush machine broke', 'It stopped in the middle of a car. The line is growing.', [
    ['🔧 Repair it today', { cash: -0.3, say: 'Running again.' }],
    ['🆕 Buy a new machine', { cash: -1, equip: 0.04, say: 'Faster and gentler.' }],
    ['🧽 Hand wash for now', { capacity: [0.85, 2, 'Hand wash'], team: -4, say: 'Tired arms.' }],
    ['🎁 Free coupons for the line', { cash: -0.1, happy: 3, capacity: [0.9, 1, 'Broken machine'], say: 'People left happy anyway.' }]
  ]);
  B('carwash', 'rain_week', '🌧️', 'Rain all week', 'Nobody washes a car in the rain.', [
    ['🎟️ Rain promise: free rewash', { demand: [1.1, 2, 'Rain promise'], say: 'People came anyway.' }],
    ['🧽 Offer inside cleaning', { extra: [0.06, 2, 'Inside cleaning'], say: 'Clean seats, rainy days.' }],
    ['🛠️ Do maintenance', { equip: 0.01, say: 'Machines are ready for sunny days.' }],
    ['🏖️ Give the team time off', { team: 8, closed: [1, 'Rain'], say: 'Everyone rested.' }]
  ]);
  B('carwash', 'wax_premium', '✨', 'Customers want premium wax', 'A new ceramic wax is popular. It\'s expensive but lasts months.', [
    ['✨ Offer it', { cash: -0.3, extra: [0.08, 10, 'Premium wax'], say: 'High price, happy customers.' }],
    ['🎓 Train the team first', { cash: -0.4, skill: { a: 5 }, extra: [0.08, 10, 'Premium wax'], say: '{a} is the wax expert now.' }],
    ['🧪 Try it on your own car', { chance: { p: 0.6, win: { extra: [0.08, 10, 'Premium wax'], say: 'It works great.' }, lose: { say: 'It left streaks. You passed.' } } }],
    ['🙅 Keep it simple', { say: 'No wax.' }]
  ], FRONT);
  B('carwash', 'lost_ring', '💍', 'A wedding ring was found in a car', '{a} found a diamond ring under a seat. The car already left.', [
    ['📞 Track down the owner', { rep: 5, fans: 10, say: 'The owner cried. They told everyone.' }],
    ['📱 Post it online', { fans: 15, rep: 3, say: 'Found in an hour.' }],
    ['🏅 Reward {a} for honesty', { a: 12, bonus: 'a', rep: 3, say: '{a} is proud.' }],
    ['🤐 Keep it in a drawer', { rep: -2, say: 'The owner came back upset it took so long.' }]
  ], FRONT);

  // 👗 CLOTHING STORE
  B('clothing', 'fitting_thief', '👗', 'Clothes vanish from the fitting rooms', 'People go in with five items and come out with three.', [
    ['🏷️ Security tags on everything', { cash: -0.4, say: 'Thefts stopped.' }],
    ['🧑‍💼 Staff at the fitting rooms', { capacity: [0.95, 8, 'Fitting room staff'], say: 'Nobody steals now.' }],
    ['🔢 Item limit per person', { happy: -2, say: 'Fewer thefts.' }],
    ['🤷 Accept some loss', { cash: -0.3, say: 'It keeps happening.' }]
  ]);
  B('clothing', 'influencer_outfit', '🤳', 'An influencer wore your jacket', 'Now everyone wants it. You have 20 left.', [
    ['📦 Order 500 more', { cash: -0.8, extra: [0.25, 4, 'Viral jacket'], say: 'They sold out again.' }],
    ['📈 Raise the price', { extra: [0.1, 2, 'Viral jacket'], say: 'The 20 sold in an hour.' }],
    ['📝 Take pre-orders', { extra: [0.18, 4, 'Pre-orders'], say: 'Money in before you even ordered.' }],
    ['🤝 Offer them a deal', { cash: -0.3, fans: 30, say: 'They\'re your brand face now.' }]
  ]);
  B('clothing', 'sweatshop', '🏭', 'Your supplier uses child workers', 'A news report shows the factory that makes your clothes.', [
    ['🚫 Drop them today', { cash: -0.6, rep: 6, say: 'You found an ethical factory. It costs more.' }],
    ['🔍 Investigate first', { chance: { p: 0.5, win: { rep: 2, say: 'The report was wrong.' }, lose: { rep: -5, say: 'It was true. You waited too long.' } } }],
    ['📢 Go fully ethical', { cash: -0.8, supply: [0.03, 16, 'Ethical factory'], rep: 10, fans: 20, say: 'Customers love your new promise.' }],
    ['🤐 Say nothing', { rep: -10, say: 'Protesters showed up at your door.' }]
  ]);
  B('clothing', 'season_leftover', '🧥', 'Racks full of unsold winter coats', 'Spring is here. Nobody wants coats.', [
    ['🏷️ 70% off sale', { cash: 0.2, demand: [1.1, 2, 'Coat sale'], say: 'Gone in a weekend.' }],
    ['📦 Store them for next year', { cash: -0.1, say: 'They take up space. But they\'ll sell later.' }],
    ['❤️ Donate them', { rep: 6, say: 'A shelter got 200 coats.' }],
    ['🛒 Sell to an outlet', { cash: 0.3, say: 'Cheap, but done.' }]
  ]);
  B('clothing', 'returns_abuse', '🔄', 'A customer "borrows" clothes', 'She buys a dress, wears it to a party, and returns it. Every weekend.', [
    ['🚫 Refuse the return', { rep: -1, say: 'She yelled. She stopped.' }],
    ['🏷️ No returns without tags', { happy: -2, say: 'The trick stopped.' }],
    ['👗 Offer a rental service', { extra: [0.06, 8, 'Rentals'], fans: 10, say: 'A new business.' }],
    ['🤷 Let it go', { cash: -0.1, say: 'She\'ll be back next weekend.' }]
  ]);
  B('clothing', 'fashion_week', '👠', 'A designer wants your store for an event', 'A fashion week pop-up. Big names, big press.', [
    ['✨ Say yes', { closed: [1, 'Fashion event'], fans: 40, rep: 5, say: 'Your store was in every magazine.' }],
    ['📈 Charge a big fee', { cash: 1, fans: 15, closed: [1, 'Fashion event'], say: 'Good money and good press.' }],
    ['🤝 Share the sales', { extra: [0.2, 1, 'Pop-up sales'], fans: 20, say: 'Everyone won.' }],
    ['🙅 No', { say: 'They went to another store.' }]
  ]);
  B('clothing', 'size_complaint', '📏', 'Customers say your sizes are wrong', 'Complaints every day. Returns are piling up.', [
    ['📏 Fix the size guide', { cash: -0.1, happy: 4, say: 'Fewer returns.' }],
    ['🔄 Switch supplier', { cash: -0.4, happy: 6, say: 'Sizes are right now.' }],
    ['👕 Add more sizes', { cash: -0.3, demand: [1.06, 10, 'More sizes'], say: 'More people fit your clothes.' }],
    ['🤷 Ignore it', { happy: -5, say: 'Returns keep coming.' }]
  ]);

  // 🏪 MINI MARKET
  B('convenience', 'robbery', '🔫', 'Your shop was robbed', 'A man with a mask. {a} handed over the cash. Nobody was hurt.', [
    ['❤️ Check on {a} first', { a: 15, loyal: { a: 15 }, cash: -0.3, say: '{a} is shaken, but okay.' }],
    ['📹 Cameras and a panic button', { cash: -0.8, team: 6, say: 'The team feels safer.' }],
    ['🌙 Close earlier at night', { capacity: [0.92, 10, 'Shorter nights'], team: 5, say: 'Safer. Less money.' }],
    ['💼 Business as usual', { cash: -0.3, a: -15, say: '{a} is scared to work nights now.' }]
  ], FRONT);
  B('convenience', 'expired_food', '📅', 'A customer found expired food', 'Three-week-old yogurt. They posted a photo.', [
    ['🙏 Apologize and refund', { rep: 2, say: 'They updated the post.' }],
    ['🔍 Check every shelf', { cash: -0.2, rep: 3, say: 'You threw out a lot. It\'s clean now.' }],
    ['📋 A daily check system', { capacity: [0.97, 8, 'Daily checks'], rep: 4, say: 'Never again.' }],
    ['🤷 It happens', { rep: -5, say: 'The photo spread.' }]
  ]);
  B('convenience', 'big_store', '🛒', 'A giant supermarket opened nearby', 'Lower prices on everything. Your customers are drifting away.', [
    ['🕐 Open 24 hours', { team: -6, demand: [1.08, 12, '24 hours'], say: 'The night crowd is yours.' }],
    ['🥖 Sell things they don\'t', { cash: -0.3, demand: [1.05, 12, 'Local products'], say: 'Local bread and eggs. People love it.' }],
    ['🛵 Fast home delivery', { cash: -0.4, demand: [1.06, 12, 'Delivery'], say: 'They can\'t match your speed.' }],
    ['📉 Match their prices', { price: -1, say: 'You kept customers. Thin margins.' }]
  ]);
  B('convenience', 'lottery_winner', '🎟️', 'You sold a winning lottery ticket', 'The biggest jackpot in years was bought at your counter.', [
    ['🪧 A huge banner', { fans: 20, demand: [1.1, 4, 'Lucky shop'], say: 'People came to buy tickets from the lucky shop.' }],
    ['📺 Invite the news', { fans: 30, say: 'You were on TV.' }],
    ['🎟️ Sell more tickets', { extra: [0.05, 8, 'Lottery tickets'], say: 'Lottery sales tripled.' }],
    ['😌 Stay humble', { rep: 2, say: 'The winner stopped by to say thanks.' }]
  ]);
  B('convenience', 'fridge_fail', '🧊', 'The fridges died overnight', 'Milk, meat, ice cream. All warm.', [
    ['🗑️ Throw it all out', { cash: -0.5, rep: 2, say: 'Painful, but safe.' }],
    ['🔧 Emergency repair', { cash: -0.4, say: 'Fixed. Stock saved only partly.' }],
    ['🆕 New energy-saving fridges', { cash: -1, supply: [-0.02, 20, 'New fridges'], say: 'Cheaper to run.' }],
    ['🤫 Sell it anyway', { chance: { p: 0.4, win: { say: 'Nobody got sick.' }, lose: { rep: -12, cash: -0.5, say: 'People got sick.' } } }]
  ]);
  B('convenience', 'kid_stealing', '🧒', 'A kid tried to steal food', '{a} caught a hungry kid hiding bread in his coat.', [
    ['🍞 Let him keep it', { rep: 3, a: 5, say: 'He said thank you. Quietly.' }],
    ['📞 Call his parents', { rep: 1, say: 'His mom came. She was crying.' }],
    ['🧹 Offer small jobs for food', { rep: 5, say: 'He sweeps the front now.' }],
    ['👮 Call the police', { rep: -3, say: 'People thought it was harsh.' }]
  ], FRONT);
  B('convenience', 'late_night', '🌙', 'The night shift is getting scary', 'Drunk people, fights outside. {a} doesn\'t want to work nights.', [
    ['🦺 Night security guard', { cash: -0.5, a: 10, team: 5, say: 'Nights are calm now.' }],
    ['🪟 Serve through a window', { capacity: [0.9, 10, 'Window service'], a: 8, say: 'Safer, slower.' }],
    ['💵 Pay night shift more', { raise: ['a', 0.1], a: 10, say: '{a} will do it for the money.' }],
    ['🌙 Close at midnight', { capacity: [0.9, 10, 'No night shift'], team: 4, say: 'No more nights.' }]
  ], FRONT);

  // 🎮 GAME STUDIO
  B('gamestudio', 'crunch', '🌙', 'Launch is in 3 weeks. The game isn\'t ready', 'Bugs everywhere. The team wants more time.', [
    ['📅 Delay the launch', { demand: [0.9, 3, 'Delayed'], team: 8, rep: 2, say: 'Fans were upset. The game was better.' }],
    ['🔥 Crunch: nights and weekends', { team: -15, capacity: [1.2, 3, 'Crunch'], say: 'It shipped. The team is broken.' }],
    ['✂️ Cut features', { rep: -2, say: 'Smaller game. On time.' }],
    ['🚀 Launch it anyway', { chance: { p: 0.3, win: { fans: 30, say: 'Somehow it worked.' }, lose: { rep: -10, say: 'Reviews called it broken.' } } }]
  ]);
  B('gamestudio', 'publisher', '💼', 'A big publisher wants your game', 'They\'ll pay for everything. They want 70% of the money.', [
    ['✍️ Sign', { cash: 2, supply: [0.05, 16, 'Publisher cut'], fans: 30, say: 'Big marketing, smaller share.' }],
    ['🤝 Negotiate for 50%', { chance: { p: 0.5, win: { cash: 2, supply: [0.03, 16, 'Publisher cut'], say: 'Better deal.' }, lose: { say: 'They walked away.' } } }],
    ['🎮 Stay independent', { rep: 3, say: 'Your game, your rules.' }],
    ['💻 Crowdfund instead', { chance: { p: 0.5, win: { cash: 1.5, fans: 40, say: 'Fans paid for it.' }, lose: { fans: 5, say: 'You didn\'t reach the goal.' } } }]
  ]);
  B('gamestudio', 'leaked', '🔓', 'Your game leaked before launch', 'Someone uploaded it online. Thousands are playing for free.', [
    ['⚖️ Take it down', { cash: -0.3, chance: { p: 0.5, win: { say: 'Removed fast.' }, lose: { demand: [0.9, 4, 'Leak'], say: 'Copies are everywhere.' } } }],
    ['🎁 Release early with a bonus', { fans: 20, demand: [1.05, 3, 'Early launch'], say: 'Fans bought it to get the bonus.' }],
    ['🕵️ Find the leaker', { chance: { p: 0.5, win: { rep: 2, say: 'It was a tester. Contract ended.' }, lose: { team: -5, say: 'Everyone felt accused.' } } }],
    ['🤷 Free marketing', { fans: 15, demand: [0.94, 4, 'Leak'], say: 'Lots of buzz. Fewer sales.' }]
  ]);
  B('gamestudio', 'streamer', '🎥', 'A huge streamer is playing your game', 'Live, to 80,000 people. And they\'re about to hit a bug.', [
    ['🐛 Hotfix it right now', { chance: { p: 0.6, win: { fans: 50, say: 'Fixed in minutes. Chat was impressed.' }, lose: { fans: 20, rep: -2, say: 'The bug hit live.' } } }],
    ['💬 Message the streamer', { fans: 30, say: 'They gave you a shout-out.' }],
    ['🎁 A code for viewers', { fans: 45, demand: [1.1, 3, 'Streamer'], say: 'Sales jumped.' }],
    ['🍿 Just watch', { fans: 25, say: 'Nervous, but it went fine.' }]
  ]);
  B('gamestudio', 'review_bomb', '💣', 'Players are review-bombing your game', 'Over a small change in the update. Thousands of angry reviews.', [
    ['🔄 Undo the change', { rep: 3, say: 'Players cheered.' }],
    ['📝 Explain the change', { chance: { p: 0.5, win: { rep: 2, say: 'Most people understood.' }, lose: { rep: -3, say: 'It got worse.' } } }],
    ['🎁 Free content to say sorry', { cash: -0.3, fans: 15, rep: 3, say: 'All is forgiven.' }],
    ['🤐 Wait it out', { demand: [0.88, 4, 'Review bomb'], say: 'Sales dipped for weeks.' }]
  ]);
  B('gamestudio', 'dev_poached', '🎣', 'A giant studio wants {a}', 'They offered {a} double pay. {a} is your best developer.', [
    ['💰 Match it', { raise: ['a', 0.3], loyal: { a: 20 }, say: '{a} stays.' }],
    ['🪙 Give {a} a profit share', { supply: [0.02, 20, 'Profit share'], a: 20, loyal: { a: 25 }, say: '{a} is a partner now.' }],
    ['🎮 Let {a} lead the next game', { promote: 'a', a: 15, say: '{a} is excited again.' }],
    ['👋 Let them go', { quit: 'a', say: '{a} left for the giant.' }]
  ], FRONT);
  B('gamestudio', 'award', '🏆', 'Your game is nominated for an award', 'Game of the Year, indie category. The show is live worldwide.', [
    ['✈️ Fly the whole team', { cash: -0.4, team: 12, chance: { p: 0.4, win: { fans: 60, rep: 8, say: 'You WON.' }, lose: { fans: 15, say: 'You lost. Great night anyway.' } } }],
    ['🎥 Make a campaign video', { cash: -0.2, chance: { p: 0.5, win: { fans: 60, rep: 8, say: 'You won.' }, lose: { fans: 15, say: 'Close. Not this year.' } } }],
    ['🏷️ Nominee sale', { demand: [1.15, 2, 'Nominee sale'], say: 'Sales jumped.' }],
    ['😌 Watch from home', { chance: { p: 0.3, win: { fans: 50, rep: 6, say: 'You won from your sofa.' }, lose: { say: 'Not this year.' } } }]
  ]);

  // 📱 PHONE REPAIR
  B('phonerepair', 'private_photos', '🔒', '{a} was looking at a customer\'s photos', 'A customer caught {a} scrolling through their phone.', [
    ['🚪 Fire {a}', { fire: 'a', rep: 2, say: 'The customer was grateful.' }],
    ['🙏 Apologize and refund', { rep: -2, a: -5, say: 'The customer left, still angry.' }],
    ['📜 New privacy rules', { cash: -0.1, rep: 3, say: 'Phones are locked during repair now.' }],
    ['🛡️ Defend {a}', { rep: -6, say: 'The customer posted about it.' }]
  ], FRONT);
  B('phonerepair', 'fake_parts', '🔋', 'Cheap parts at half the price', 'A supplier offers screens and batteries. No brand, no warranty.', [
    ['✅ Buy them', { supply: [-0.04, 10, 'Cheap parts'], chance: { p: 0.5, win: { say: 'They work fine.' }, lose: { rep: -6, say: 'Phones came back broken.' } } }],
    ['🔍 Test a few first', { chance: { p: 0.5, win: { supply: [-0.03, 10, 'Tested parts'], say: 'Tested. Good.' }, lose: { say: 'They failed. You passed.' } } }],
    ['🏷️ Offer cheap and original', { extra: [0.06, 8, 'Budget repairs'], say: 'Customers choose. Both sell.' }],
    ['🙅 Originals only', { rep: 2, say: 'Quality first.' }]
  ]);
  B('phonerepair', 'new_phone_launch', '📱', 'A new phone launched', 'Everyone is dropping and cracking their brand new phones.', [
    ['🛒 Stock the new parts', { cash: -0.4, demand: [1.12, 6, 'New phone'], say: 'You were the first to fix them.' }],
    ['🛡️ Sell cases and screen guards', { extra: [0.08, 6, 'Cases'], say: 'Cases sold like crazy.' }],
    ['🎓 Train the team', { cash: -0.2, skill: { a: 5 }, say: '{a} is the new-phone expert.' }],
    ['⏳ Wait for cheaper parts', { say: 'Other shops took the customers.' }]
  ], FRONT);
  B('phonerepair', 'water_damage', '💧', 'A phone with years of photos', 'It fell in a lake. The owner is crying. Her late father\'s photos are on it.', [
    ['🔧 Try everything', { chance: { p: 0.5, win: { rep: 8, fans: 20, say: 'You saved the photos. She hugged you.' }, lose: { rep: 2, say: 'You tried. It was too far gone.' } } }],
    ['🎓 Send it to a data lab', { cash: -0.1, rep: 5, say: 'The lab saved everything.' }],
    ['💸 Charge a premium', { chance: { p: 0.5, win: { cash: 0.3, say: 'Saved. She paid gladly.' }, lose: { rep: -3, say: 'It didn\'t work. She felt robbed.' } } }],
    ['🙅 Too risky', { say: 'She went somewhere else.' }]
  ]);
  B('phonerepair', 'warranty_rule', '📜', 'A law says anyone can fix phones now', 'Big phone makers must sell parts to small shops. Good news.', [
    ['📦 Stock up on parts', { cash: -0.4, supply: [-0.03, 20, 'Right to repair'], say: 'Cheaper parts forever.' }],
    ['📢 Advertise it', { fans: 15, demand: [1.08, 6, 'Right to repair'], say: 'More customers than ever.' }],
    ['🎓 Offer repair classes', { extra: [0.05, 8, 'Classes'], rep: 3, say: 'People love learning.' }],
    ['😌 Enjoy it', { supply: [-0.02, 20, 'Right to repair'], say: 'Nice.' }]
  ], { kind: 'news' });
  B('phonerepair', 'stolen_phone', '🚨', 'A customer brought in a stolen phone', 'It\'s locked and reported stolen. They want it unlocked.', [
    ['👮 Call the police', { rep: 4, say: 'They were arrested. It was stolen.' }],
    ['🙅 Refuse and send them away', { say: 'They left fast.' }],
    ['💵 Unlock it for cash', { cash: 0.1, chance: { p: 0.5, win: { say: 'Nobody found out.' }, lose: { cash: -0.8, rep: -10, say: 'Police traced it to you.' } } }],
    ['📞 Contact the real owner', { rep: 6, fans: 10, say: 'The real owner got their phone back.' }]
  ]);
  B('phonerepair', 'shop_franchise', '🏪', 'A phone repair chain wants to buy you', 'They\'ll pay well and put their logo on your door.', [
    ['💰 Sell and stay as manager', { cash: 2, team: -5, say: 'Rich, but not your shop anymore.' }],
    ['🤝 Join as a partner', { supply: [-0.02, 20, 'Chain prices'], say: 'Cheaper parts, your name.' }],
    ['📈 Ask for more', { chance: { p: 0.4, win: { cash: 2.5, say: 'They paid more. You still said no.' }, lose: { say: 'They opened across the street.' } } }],
    ['🙅 Stay independent', { team: 5, say: 'Your shop, your way.' }]
  ]);

  // 🧹 CLEANING COMPANY
  B('cleaning', 'broken_vase', '🏺', '{a} broke an expensive vase', 'In a rich client\'s house. It was an antique.', [
    ['💸 Pay for it', { cash: -0.8, rep: 3, say: 'The client respected it.' }],
    ['📄 Use your insurance', { chance: { p: function (g) { return g.flags.insured ? 0.9 : 0.3; }, win: { cash: -0.1, say: 'Insurance covered it.' }, lose: { cash: -0.8, say: 'Not covered.' } } }],
    ['🙏 Offer free cleaning', { chance: { p: 0.5, win: { say: 'They accepted.' }, lose: { cash: -0.8, say: 'They wanted money.' } } }],
    ['💸 Take it from {a}\'s pay', { cash: -0.3, a: -20, say: '{a} will be paying for months.' }]
  ], FRONT);
  B('cleaning', 'found_cash', '💵', '{a} found a pile of cash under a bed', 'A lot of money. The client is away on holiday.', [
    ['📞 Call the client', { rep: 5, say: 'They were amazed. They signed a long contract.', extra: [0.06, 8, 'Loyal client'] }],
    ['🏅 Reward {a}\'s honesty', { a: 10, bonus: 'a', say: '{a} is proud.' }],
    ['🤐 Leave it where it was', { say: 'Nothing happened.' }],
    ['🤫 Take some', { chance: { p: 0.3, win: { cash: 0.2, say: 'Nobody noticed.' }, lose: { rep: -15, say: 'Hidden camera. You\'re in the news.' } } }]
  ], FRONT);
  B('cleaning', 'office_contract', '🏢', 'A big office building wants you', 'Twenty floors every night. It would double your work.', [
    ['✍️ Sign and hire more', { extra: [0.15, 12, 'Office contract'], hireSpecial: { role: 'front', skill: 45 }, say: 'A big new client.' }],
    ['💪 Sign with your current team', { extra: [0.15, 12, 'Office contract'], team: -10, say: 'The team is exhausted.' }],
    ['🤝 Just half the floors', { extra: [0.07, 12, 'Office contract'], say: 'A good start.' }],
    ['🙅 Too big', { say: 'You passed.' }]
  ]);
  B('cleaning', 'chemical_spill', '☣️', '{a} mixed two cleaners', 'Toxic fumes. {a} is coughing. The client is panicking.', [
    ['🚑 Get {a} to a hospital', { a: 8, capacity: [0.9, 1, '{a} recovering'], say: 'They\'re okay. Scary day.' }],
    ['🎓 Safety training for all', { cash: -0.2, team: 5, rep: 2, say: 'Nobody will make that mistake again.' }],
    ['🌿 Switch to safe products', { supply: [0.02, 20, 'Safe products'], rep: 4, say: 'Safer and greener.' }],
    ['🤐 Keep it quiet', { a: -15, rep: -4, say: 'The client told everyone.' }]
  ], FRONT);
  B('cleaning', 'hoarder_house', '🏚️', 'A house packed to the ceiling', 'A family needs a hoarder\'s house cleared. It\'s a huge, hard job.', [
    ['💪 Take it', { extra: [0.35, 1, 'Big job'], team: -8, say: 'Three days. Unbelievable before and after.' }],
    ['📈 Charge a lot', { chance: { p: 0.6, win: { extra: [0.5, 1, 'Big job'], team: -8, say: 'They paid.' }, lose: { say: 'Too expensive for them.' } } }],
    ['🎥 Film it for social media', { extra: [0.35, 1, 'Big job'], fans: 30, team: -6, say: 'The video got huge views.' }],
    ['🙅 Too much', { say: 'You passed.' }]
  ]);
  B('cleaning', 'client_accuses', '😠', 'A client says {a} stole a watch', 'Expensive watch, missing after the cleaning.', [
    ['🛡️ Believe {a}', { chance: { p: 0.8, win: { a: 15, say: 'They found the watch in their car.' }, lose: { rep: -5, say: 'It was {a}. You were wrong.' } } }],
    ['👮 Let the police handle it', { a: -10, say: 'The watch was found. {a} is hurt you doubted them.' }],
    ['💸 Pay for it to end it', { cash: -0.5, a: -5, say: 'Done. It was in their car.' }],
    ['🚪 Fire {a}', { fire: 'a', team: -8, say: 'Later, they found the watch.' }]
  ], FRONT);
  B('cleaning', 'eco_trend', '🌿', 'Clients want eco-friendly cleaning', 'Green products are more expensive, but everyone asks for them.', [
    ['🌿 Switch everything', { supply: [0.03, 20, 'Eco products'], demand: [1.1, 16, 'Eco cleaning'], say: 'New clients love it.' }],
    ['🏷️ Offer it as premium', { extra: [0.06, 10, 'Eco premium'], say: 'Some pay extra.' }],
    ['🧪 Make your own products', { cash: -0.3, rep: 3, supply: [-0.01, 20, 'Homemade products'], say: 'Cheaper and green.' }],
    ['🙅 Stay the same', { say: 'Some clients left.' }]
  ]);

  // 🍋 LEMONADE STAND
  B('lemonade', 'heat_rush', '☀️', 'The hottest day of the year', 'The whole park wants cold lemonade. You\'re running low on ice.', [
    ['🧊 Buy all the ice in town', { cash: -0.1, extra: [0.4, 1, 'Hot day'], say: 'Sold out by 3 PM.' }],
    ['📈 Raise the price', { extra: [0.3, 1, 'Hot day'], happy: -2, say: 'People paid anyway.' }],
    ['🍋 Make it stronger, sell more', { extra: [0.25, 1, 'Hot day'], say: 'A long, good day.' }],
    ['😌 Normal day', { extra: [0.1, 1, 'Hot day'], say: 'Still busy.' }]
  ]);
  B('lemonade', 'bigger_kid', '🧢', 'An older kid set up a stand next to you', 'Bigger sign. Lower price. He\'s taking your customers.', [
    ['🍓 Add strawberry lemonade', { cash: -0.1, demand: [1.1, 4, 'New flavor'], say: 'Nobody else has it.' }],
    ['📉 Lower your price', { price: -1, say: 'You kept your customers.' }],
    ['🤝 Offer to team up', { chance: { p: 0.5, win: { capacity: [1.2, 6, 'Teamed up'], say: 'Two stands, one team.' }, lose: { demand: [0.9, 3, 'Rival stand'], say: 'He said no.' } } }],
    ['🪧 A better sign', { cash: -0.05, fans: 8, say: 'Your sign is way better.' }]
  ]);
  B('lemonade', 'health_permit', '📋', 'A city worker asks for your permit', '"You need a food permit to sell drinks." You don\'t have one.', [
    ['💵 Get the permit', { cash: -0.3, rep: 2, say: 'Official now.' }],
    ['🙏 Ask for a warning', { chance: { p: 0.6, win: { say: 'He smiled. "Get one soon."' }, lose: { closed: [1, 'No permit'], say: 'Shut down for a week.' } } }],
    ['📱 Post about it', { chance: { p: 0.5, win: { fans: 30, say: 'The whole town backed you. The mayor waived the fee.' }, lose: { closed: [1, 'No permit'], say: 'Closed anyway.' } } }],
    ['🚶 Move to a private yard', { demand: [0.85, 3, 'Private yard'], say: 'Legal, but quieter.' }]
  ]);
  B('lemonade', 'sour_batch', '🍋', 'A batch came out way too sour', 'Customers are making faces. Some want refunds.', [
    ['🔄 Remake it now', { cash: -0.05, say: 'Perfect again.' }],
    ['💸 Refund everyone', { cash: -0.05, rep: 2, say: 'Customers appreciated it.' }],
    ['🍯 Add honey and sell it', { chance: { p: 0.6, win: { say: 'It worked.' }, lose: { happy: -3, say: 'Now it\'s sour AND sweet.' } } }],
    ['🤷 Sell it anyway', { happy: -5, say: 'People noticed.' }]
  ]);
  B('lemonade', 'event_order', '🎉', 'A neighbor wants lemonade for a party', 'Fifty cups for a backyard party. They\'ll pay well.', [
    ['✅ Yes', { extra: [0.2, 1, 'Party order'], say: 'Easy money.' }],
    ['🍹 Offer three flavors', { cash: -0.05, extra: [0.3, 1, 'Party order'], fans: 8, say: 'The guests loved it.' }],
    ['📈 Charge extra', { chance: { p: 0.5, win: { extra: [0.3, 1, 'Party order'], say: 'They paid.' }, lose: { say: 'They made their own.' } } }],
    ['🙅 Too busy', { say: 'You passed.' }]
  ]);
  B('lemonade', 'lemon_shortage', '🍋', 'The store is out of lemons', 'All of them. The next delivery is in a week.', [
    ['🚗 Drive to another town', { cash: -0.1, say: 'Found them. Stand saved.' }],
    ['🍊 Sell orange juice instead', { demand: [0.9, 1, 'No lemons'], fans: 4, say: 'Not bad.' }],
    ['🔒 Close for a week', { closed: [1, 'No lemons'], say: 'A quiet week.' }],
    ['🌳 Buy from a neighbor\'s tree', { cash: -0.05, rep: 2, say: 'Local lemons. Even better.' }]
  ]);
  B('lemonade', 'newspaper', '📰', 'The local paper wants your story', '"The young boss of {company}." A photo and an interview.', [
    ['📸 Smile for the photo', { fans: 20, rep: 3, say: 'You\'re in the paper.' }],
    ['🍋 Give them free lemonade', { fans: 25, say: 'They wrote about how good it was.' }],
    ['💬 Talk about your big plans', { fans: 20, rep: 5, say: 'People love a big dreamer.' }],
    ['🙈 Too shy', { say: 'Maybe next time.' }]
  ]);

  // 🍬 CANDY SHOP
  B('candy', 'sugar_tax', '📜', 'A new sugar tax', 'The city wants to cut sugar. Candy prices must go up.', [
    ['📈 Pass it to customers', { price: 1, happy: -3, say: 'Customers grumbled.' }],
    ['🍬 Add sugar-free candy', { cash: -0.3, demand: [1.06, 12, 'Sugar-free'], say: 'A whole new group of customers.' }],
    ['😬 Pay it yourself', { supply: [0.04, 12, 'Sugar tax'], say: 'Thinner profits.' }],
    ['📢 Fight it publicly', { chance: { p: 0.3, win: { fans: 20, say: 'The city backed down.' }, lose: { rep: -2, say: 'The tax stayed.' } } }]
  ], { kind: 'news' });
  B('candy', 'viral_candy', '🍭', 'A candy you sell went viral', 'A video about it has millions of views. Everyone wants it.', [
    ['📦 Order a huge amount', { cash: -0.6, extra: [0.25, 4, 'Viral candy'], say: 'Sold out anyway.' }],
    ['🔢 One per customer', { extra: [0.1, 4, 'Viral candy'], fans: 10, say: 'Lines every day.' }],
    ['🍬 Make your own version', { cash: -0.3, extra: [0.15, 6, 'Own version'], say: 'Yours is better.' }],
    ['📈 Triple the price', { extra: [0.15, 2, 'Viral candy'], happy: -4, say: 'People paid. Then complained.' }]
  ]);
  B('candy', 'parents_complain', '👪', 'Parents say you\'re next to a school', 'They want you to stop selling sweets to kids before school.', [
    ['⏰ No sales before school', { demand: [0.94, 12, 'School rules'], rep: 4, say: 'Parents are happy.' }],
    ['🍎 Add healthy snacks', { cash: -0.2, rep: 3, demand: [1.03, 8, 'Healthy snacks'], say: 'Parents buy them.' }],
    ['🤝 Meet the parents', { chance: { p: 0.6, win: { rep: 3, say: 'You agreed on some rules.' }, lose: { rep: -3, say: 'It got heated.' } } }],
    ['🙅 Ignore them', { rep: -5, say: 'A petition started.' }]
  ]);
  B('candy', 'halloween', '🎃', 'Halloween is coming', 'The biggest candy week of the year.', [
    ['🎃 Stock up big', { cash: -0.5, extra: [0.4, 1, 'Halloween'], say: 'Sold out.' }],
    ['👻 Halloween party at the shop', { cash: -0.2, fans: 20, extra: [0.25, 1, 'Halloween'], say: 'The kids loved it.' }],
    ['🍬 Bulk bags for parents', { extra: [0.3, 1, 'Halloween'], say: 'Parents bought in bulk.' }],
    ['😌 Normal stock', { extra: [0.1, 1, 'Halloween'], say: 'Sold out early.' }]
  ], { cond: H.season(41, 44), w: 20 });
  B('candy', 'melted_stock', '🌡️', 'Your chocolate melted', 'The AC broke overnight. The chocolate shelf is a puddle.', [
    ['🗑️ Throw it out', { cash: -0.3, say: 'Painful.' }],
    ['🍫 Make hot chocolate', { extra: [0.05, 2, 'Hot chocolate'], say: 'Smart save.' }],
    ['❄️ New AC today', { cash: -0.6, equip: 0.01, say: 'Never again.' }],
    ['🧊 Refreeze and sell it', { chance: { p: 0.5, win: { say: 'It looks fine.' }, lose: { rep: -3, say: 'It tasted weird.' } } }]
  ]);
  B('candy', 'import_candy', '✈️', 'Foreign candy is the new trend', 'Kids want candy from other countries. You don\'t have any.', [
    ['✈️ Import a big selection', { cash: -0.5, demand: [1.12, 8, 'World candy'], say: 'Your world candy wall is famous.' }],
    ['📦 Order a few favorites', { cash: -0.2, demand: [1.06, 8, 'World candy'], say: 'They sold fast.' }],
    ['🎁 World candy mystery box', { extra: [0.08, 6, 'Mystery boxes'], fans: 15, say: 'Kids film themselves opening them.' }],
    ['🙅 Keep it local', { say: 'Kids went to another shop.' }]
  ]);
  B('candy', 'recipe_invent', '🧪', '{a} invented a new candy', 'Sour on the outside, soft in the middle. The team can\'t stop eating it.', [
    ['🚀 Launch it', { cash: -0.3, chance: { p: 0.6, win: { demand: [1.12, 8, 'New candy'], a: 12, say: 'Kids are obsessed.' }, lose: { say: 'It didn\'t catch on.' } } }],
    ['🏷️ Name it after {a}', { a: 15, loyal: { a: 15 }, fans: 10, say: '{a} is proud.' }],
    ['🧪 Test it at a school fair', { chance: { p: 0.7, win: { demand: [1.1, 6, 'New candy'], say: 'The kids voted it best.' }, lose: { say: 'The kids preferred chocolate.' } } }],
    ['🙅 Stick to what sells', { a: -8, say: '{a} is disappointed.' }]
  ], FRONT);

  // 🍦 ICE CREAM TRUCK
  B('icecream', 'truck_breakdown', '🚚', 'The truck\'s freezer broke', 'In the middle of summer. Everything is melting.', [
    ['🔧 Emergency fix', { cash: -0.4, say: 'Fixed. Half the stock lost.' }],
    ['🍦 Give it away before it melts', { cash: -0.2, fans: 20, rep: 3, say: 'Happy kids everywhere.' }],
    ['🆕 New freezer', { cash: -0.9, equip: 0.03, say: 'Colder and bigger.' }],
    ['🥤 Sell milkshakes', { extra: [0.05, 1, 'Milkshakes'], say: 'Smart save.' }]
  ]);
  B('icecream', 'winter_slow', '❄️', 'Winter is here', 'Nobody buys ice cream when it\'s freezing.', [
    ['☕ Sell hot chocolate', { cash: -0.2, extra: [0.1, 8, 'Hot drinks'], say: 'Hot drinks from an ice cream truck. People love it.' }],
    ['🎂 Ice cream cakes for parties', { extra: [0.08, 8, 'Party cakes'], say: 'Birthdays don\'t stop in winter.' }],
    ['🏖️ Take the winter off', { closed: [1, 'Winter break'], team: 10, say: 'Rested and ready for spring.' }],
    ['🚚 Drive somewhere warmer', { cash: -0.3, demand: [1.05, 8, 'Warmer city'], say: 'A road trip for business.' }]
  ], { cond: function (g) { var w = ((g.week - 1) % 52) + 1; return w < 10 || w > 45; } });
  B('icecream', 'music_complaint', '🎵', 'Neighbors hate your truck\'s music', 'They filed a complaint. The city might ban your music.', [
    ['🔉 Turn it down', { demand: [0.95, 6, 'Quiet truck'], rep: 2, say: 'Quieter. Kids still find you.' }],
    ['🎵 A new, nicer song', { cash: -0.05, fans: 8, say: 'People like the new song.' }],
    ['🍦 Free ice cream for neighbors', { cash: -0.05, rep: 3, say: 'Complaint dropped.' }],
    ['🔊 Keep it loud', { chance: { p: 0.5, win: { say: 'Nothing happened.' }, lose: { cash: -0.3, say: 'A fine.' } } }]
  ]);
  B('icecream', 'new_flavor', '🍨', 'Kids are asking for a crazy flavor', 'Bubblegum with popping candy. Every kid on the street wants it.', [
    ['🍨 Make it', { cash: -0.1, demand: [1.1, 6, 'New flavor'], say: 'Kids line up for it.' }],
    ['🗳️ Let kids vote on flavors', { fans: 20, demand: [1.06, 6, 'Kids\' vote'], say: 'The winner sold out.' }],
    ['🧪 Limited edition only', { extra: [0.1, 2, 'Limited flavor'], say: 'Sold out in days.' }],
    ['🙅 Classics only', { say: 'The kids were disappointed.' }]
  ]);
  B('icecream', 'park_contract', '🌳', 'The city park offers a summer spot', 'The only ice cream truck allowed in the park all summer. But the fee is big.', [
    ['✍️ Take it', { cash: -0.8, extra: [0.12, 10, 'Park spot'], say: 'The park is yours.' }],
    ['🤝 Negotiate', { chance: { p: 0.5, win: { cash: -0.5, extra: [0.12, 10, 'Park spot'], say: 'A better price.' }, lose: { say: 'Someone else got it.' } } }],
    ['⛱️ Weekends only', { cash: -0.3, extra: [0.06, 10, 'Weekend spot'], say: 'Busy weekends.' }],
    ['🙅 Too expensive', { say: 'You passed.' }]
  ], { cond: function (g) { var w = ((g.week - 1) % 52) + 1; return w >= 16 && w <= 24; } });
  B('icecream', 'kid_no_money', '🧒', 'A kid is short of money', 'He counts his coins. Not enough. His face drops.', [
    ['🍦 "It\'s on me."', { rep: 3, say: 'His smile made your day.' }],
    ['🍦 A smaller one for his coins', { rep: 1, say: 'He was happy.' }],
    ['🎟️ A free-ice-cream day', { cash: -0.1, fans: 20, rep: 4, say: 'Parents posted about it everywhere.' }],
    ['🙅 "Come back with more"', { rep: -2, say: 'He walked away sad.' }]
  ]);
  B('icecream', 'rival_truck', '🍦', 'Another ice cream truck is on your route', 'Same streets, same times. They got there first today.', [
    ['⏰ Change your route', { chance: { p: 0.6, win: { say: 'New streets, new kids.' }, lose: { demand: [0.9, 3, 'Rival truck'], say: 'Quieter streets.' } } }],
    ['📉 Cheaper cones', { price: -1, say: 'Kids chose you.' }],
    ['🎵 A louder, catchier song', { fans: 10, say: 'Kids come running.' }],
    ['🤝 Split the town', { say: 'North for you, south for them.' }]
  ]);

  // 🍕 PIZZA PLACE
  B('pizza', 'late_delivery', '🛵', 'A delivery was an hour late', 'The pizza arrived cold. The customer is furious and filming.', [
    ['🍕 Free pizza and a sorry', { cash: -0.02, rep: 2, say: 'They calmed down.' }],
    ['🔍 Find out what happened', { team: -2, say: 'The driver got lost. New map system.' }],
    ['🛵 Hire another driver', { hireSpecial: { role: 'front', skill: 50 }, say: 'Faster deliveries.' }],
    ['🙅 "Traffic isn\'t our fault"', { rep: -5, say: 'The video got lots of views.' }]
  ]);
  B('pizza', 'oven_upgrade', '🔥', 'A real wood-fired oven', 'It would make the best pizza in {city}. It costs a fortune.', [
    ['🔥 Buy it', { cash: -1.5, equip: 0.03, rep: 5, demand: [1.1, 12, 'Wood oven'], say: 'People taste the difference.' }],
    ['💳 Pay over time', { equip: 0.03, rep: 5, supply: [0.03, 16, 'Oven payments'], say: 'New oven, monthly payments.' }],
    ['🔍 Buy a used one', { cash: -0.6, chance: { p: 0.6, win: { equip: 0.02, rep: 3, say: 'Works great.' }, lose: { cash: -0.3, say: 'It cracked in a month.' } } }],
    ['🙅 Current oven is fine', { say: 'No change.' }]
  ]);
  B('pizza', 'prank_orders', '📞', 'Someone placed 20 fake orders', 'Twenty pizzas to fake addresses. All made, all wasted.', [
    ['📞 Call back every order now', { capacity: [0.97, 4, 'Call-back checks'], say: 'No more fake orders.' }],
    ['🍕 Give them to a shelter', { cash: -0.2, rep: 4, say: 'Nothing wasted.' }],
    ['👮 Report the number', { chance: { p: 0.5, win: { rep: 2, say: 'Caught. Some bored teens.' }, lose: { cash: -0.2, say: 'They used a fake number.' } } }],
    ['💳 Pay online only', { happy: -2, say: 'Fake orders stopped. Some customers grumbled.' }]
  ]);
  B('pizza', 'pizza_challenge', '🍕', 'A giant pizza challenge', '{a} wants a huge pizza. Eat it alone in 30 minutes and it\'s free.', [
    ['🏆 Launch it', { cash: -0.1, fans: 25, demand: [1.08, 6, 'Pizza challenge'], say: 'People film themselves trying.' }],
    ['📸 A wall of winners', { fans: 20, say: 'Everyone wants their photo up.' }],
    ['🎥 Invite food YouTubers', { cash: -0.2, fans: 40, say: 'Big videos, big crowds.' }],
    ['🙅 No gimmicks', { a: -5, say: '{a} is disappointed.' }]
  ], FRONT);
  B('pizza', 'cheese_prices', '🧀', 'Cheese prices went up 40%', 'The whole city\'s pizza places are panicking.', [
    ['📈 Raise prices', { price: 1, happy: -3, say: 'Everyone raised prices. Customers accepted.' }],
    ['🧀 Find a local farm', { cash: -0.2, supply: [-0.02, 12, 'Local cheese'], rep: 3, say: 'Better cheese, better price.' }],
    ['😬 Absorb it', { supply: [0.05, 8, 'Expensive cheese'], say: 'Thin profits.' }],
    ['🤏 Use less cheese', { happy: -5, say: 'Customers noticed.' }]
  ]);
  B('pizza', 'sports_night', '📺', 'Big game night', 'Everyone orders pizza on game night. You can\'t keep up.', [
    ['🧑‍🍳 Extra staff tonight', { cash: -0.1, extra: [0.3, 1, 'Game night'], say: 'Every order out on time.' }],
    ['📉 Limit the menu', { extra: [0.25, 1, 'Game night'], say: 'Fast and smooth.' }],
    ['⏰ Take orders in advance', { extra: [0.28, 1, 'Game night'], say: 'Perfectly planned.' }],
    ['💪 Wing it', { extra: [0.15, 1, 'Game night'], happy: -4, say: 'Chaos. Late pizzas.' }]
  ]);
  B('pizza', 'secret_sauce', '🍅', 'A rival wants your sauce recipe', '{rival} offered {a} money to share your secret sauce.', [
    ['💰 Reward {a} for telling you', { bonus: 'a', loyal: { a: 20 }, say: '{a} is loyal to the core.' }],
    ['🔐 Change the recipe', { cash: -0.1, say: 'The old recipe is useless now.' }],
    ['⚖️ Warn {rival}', { rival: -0.05, say: 'They backed off.' }],
    ['🍅 Give them a fake recipe', { rival: -0.08, a: 6, say: 'Their new sauce is terrible.' }]
  ], { who: { a: 'front' }, init: rival });

  // 🍩 DONUT SHOP
  B('donut', 'police_regulars', '👮', 'The police station moved next door', 'Forty officers, every morning, all wanting coffee and donuts.', [
    ['🍩 A morning special', { demand: [1.1, 12, 'Police regulars'], say: 'Busy mornings.' }],
    ['🎟️ Discount for officers', { demand: [1.12, 12, 'Police regulars'], supply: [0.01, 12, 'Discount'], rep: 2, say: 'They love you.' }],
    ['⏰ Open an hour earlier', { team: -4, demand: [1.1, 12, 'Early hours'], say: 'Night shift ends. They come to you.' }],
    ['😌 Business as usual', { demand: [1.05, 12, 'Police regulars'], say: 'Nice extra sales.' }]
  ], { kind: 'news' });
  B('donut', 'fryer_fire', '🔥', 'The fryer caught fire', 'Oil fire. Black smoke. Customers are running out.', [
    ['🧯 Use the fire blanket', { chance: { p: 0.7, win: { say: 'Out in seconds.' }, lose: { cash: -0.8, closed: [1, 'Fire damage'], say: 'It spread.' } } }],
    ['📞 Call the fire department', { cash: -0.5, closed: [1, 'Fire damage'], say: 'They saved the shop.' }],
    ['💧 Throw water on it', { cash: -1.2, closed: [1, 'Fire damage'], say: 'Never water on oil. It exploded.' }],
    ['🚪 Get everyone out', { cash: -0.6, closed: [1, 'Fire damage'], rep: 3, say: 'Everyone safe.' }]
  ]);
  B('donut', 'box_of_12', '📦', 'An office orders 50 dozen', 'For a big company breakfast. They need them by 7 AM.', [
    ['💪 Bake all night', { extra: [0.4, 1, 'Big order'], team: -8, say: 'Done. Exhausted.' }],
    ['🧑‍🍳 Hire night help', { cash: -0.1, extra: [0.4, 1, 'Big order'], say: 'Smooth.' }],
    ['📈 Charge a rush fee', { chance: { p: 0.6, win: { extra: [0.5, 1, 'Big order'], team: -8, say: 'They paid.' }, lose: { say: 'They went to a supermarket.' } } }],
    ['🙅 Too much', { say: 'You passed.' }]
  ]);
  B('donut', 'crazy_flavor', '🍩', '{a} wants to make wild flavors', 'Bacon maple. Cereal milk. Spicy mango. {a} is excited.', [
    ['🚀 Launch them', { cash: -0.2, chance: { p: 0.6, win: { fans: 30, demand: [1.1, 6, 'Wild flavors'], say: 'People come just to try them.' }, lose: { say: 'Too weird for most.' } } }],
    ['🧪 One per week', { fans: 15, demand: [1.05, 8, 'Flavor of the week'], say: 'People come back every week.' }],
    ['🗳️ Let customers vote', { fans: 20, say: 'Everyone loved choosing.' }],
    ['🙅 Classics sell', { a: -6, say: '{a} is bored.' }]
  ], FRONT);
  B('donut', 'health_trend', '🥗', 'Everyone is on a diet', 'January. Everyone promised to eat healthy. Sales are down.', [
    ['🥯 Add healthier options', { cash: -0.2, demand: [1.05, 6, 'Healthy options'], say: 'A few new customers.' }],
    ['🍩 Mini donuts', { demand: [1.06, 6, 'Mini donuts'], say: '"Just a small one." Everyone said that.' }],
    ['⏳ Wait for February', { demand: [0.9, 4, 'Diet season'], say: 'By February, they were back.' }],
    ['🎁 Buy one, get one free', { supply: [0.04, 4, 'BOGO'], demand: [1.1, 4, 'BOGO'], say: 'Diets were forgotten.' }]
  ], { cond: function (g) { var w = ((g.week - 1) % 52) + 1; return w <= 6; } });
  B('donut', 'sticky_floor', '🧽', 'Customers complain about sticky tables', 'Sugar and glaze everywhere. A review called the shop "gross".', [
    ['🧽 Clean every hour', { capacity: [0.97, 8, 'Hourly cleaning'], happy: 5, say: 'Sparkling.' }],
    ['🧑‍💼 Hire a cleaner', { hireSpecial: { role: 'front', skill: 40 }, happy: 5, say: 'Always clean now.' }],
    ['🪑 New easy-clean tables', { cash: -0.4, happy: 4, say: 'Easier to keep clean.' }],
    ['🤷 It\'s a donut shop', { rep: -3, say: 'More complaints.' }]
  ]);
  B('donut', 'national_donut_day', '🎉', 'National Donut Day', 'The biggest day of the year for donuts.', [
    ['🍩 Free donut for everyone', { cash: -0.3, fans: 40, rep: 4, say: 'The line went around the block.' }],
    ['🎉 Party with music', { cash: -0.2, extra: [0.3, 1, 'Donut Day'], fans: 20, say: 'Best day of the year.' }],
    ['📦 Dozen deal', { extra: [0.35, 1, 'Donut Day'], say: 'Sold out.' }],
    ['😌 Normal day', { extra: [0.15, 1, 'Donut Day'], say: 'Still busy.' }]
  ], { cond: function (g) { var w = ((g.week - 1) % 52) + 1; return w >= 22 && w <= 24; }, w: 20 });

  // 🧋 BUBBLE TEA
  B('bubbletea', 'pearl_shortage', '⚫', 'There\'s a tapioca pearl shortage', 'Your supplier has none for two weeks. No pearls, no bubble tea.', [
    ['✈️ Pay for express import', { cash: -0.5, say: 'Pearls arrived. Expensive.' }],
    ['🍓 Fruit jellies instead', { demand: [0.9, 2, 'No pearls'], fans: 5, say: 'Some customers liked it.' }],
    ['🧪 Make pearls yourself', { cash: -0.2, team: -5, chance: { p: 0.6, win: { rep: 4, say: 'Homemade pearls. Customers loved them.' }, lose: { demand: [0.85, 2, 'No pearls'], say: 'They fell apart.' } } }],
    ['🔒 Close two weeks', { closed: [2, 'No pearls'], say: 'A long, quiet break.' }]
  ]);
  B('bubbletea', 'viral_drink', '🧋', 'Your new drink is all over social media', 'It changes color when you stir it. Everyone wants one.', [
    ['🔥 Make it all day', { extra: [0.2, 3, 'Viral drink'], team: -6, say: 'Sold out daily.' }],
    ['📈 Charge more for it', { extra: [0.15, 3, 'Viral drink'], say: 'People paid.' }],
    ['📸 A photo wall for it', { cash: -0.1, fans: 30, say: 'Everyone posts from your wall.' }],
    ['🔢 Limit per day', { extra: [0.1, 4, 'Viral drink'], fans: 15, say: 'The hype grew.' }]
  ]);
  B('bubbletea', 'straw_ban', '🥤', 'The city banned plastic straws', 'Bubble tea needs thick straws. Paper ones fall apart.', [
    ['🌿 Buy bamboo straws', { supply: [0.02, 20, 'Bamboo straws'], rep: 3, say: 'Green and they work.' }],
    ['🥤 Sell reusable cups', { extra: [0.05, 12, 'Reusable cups'], fans: 10, say: 'Customers love their cups.' }],
    ['📄 Try paper straws', { happy: -4, say: 'Soggy straws. Angry customers.' }],
    ['🙈 Keep plastic', { chance: { p: 0.4, win: { say: 'Nobody checked.' }, lose: { cash: -0.5, say: 'A fine.' } } }]
  ], { kind: 'news' });
  B('bubbletea', 'sugar_level', '🍬', 'A doctor says bubble tea is unhealthy', 'On TV. Now parents are worried.', [
    ['🎚️ Choose your sugar level', { cash: -0.05, rep: 3, say: 'Customers love choosing.' }],
    ['🍵 A healthy menu', { cash: -0.2, demand: [1.05, 8, 'Healthy menu'], say: 'New customers.' }],
    ['📢 Share the real facts', { chance: { p: 0.5, win: { rep: 3, say: 'People calmed down.' }, lose: { rep: -2, say: 'It looked defensive.' } } }],
    ['🤷 Ignore it', { demand: [0.92, 4, 'Health worries'], say: 'A slow month.' }]
  ]);
  B('bubbletea', 'spilled_order', '💦', '{a} spilled tea on a customer', 'All over her white dress. Right before a job interview.', [
    ['💸 Pay for cleaning', { cash: -0.05, rep: 2, say: 'She calmed down.' }],
    ['👗 Buy her a new dress', { cash: -0.1, rep: 5, fans: 10, say: 'She told everyone how kind you were.' }],
    ['🧋 Free drinks for a month', { rep: 1, say: 'She accepted. Still annoyed.' }],
    ['😬 Blame the customer', { rep: -6, a: 3, say: 'She left a harsh review.' }]
  ], FRONT);
  B('bubbletea', 'franchise_offer', '🏪', 'A mall wants a {company} kiosk', 'The busiest mall in {city}. High rent, lots of people.', [
    ['🏪 Open it', { cash: -1.2, capacity: [1.15, 20, 'Mall kiosk'], demand: [1.1, 20, 'Mall kiosk'], say: 'A second location.' }],
    ['🤝 Share it with a partner', { cash: -0.6, capacity: [1.07, 20, 'Shared kiosk'], say: 'Half the risk.' }],
    ['🧪 Pop-up for a month', { cash: -0.2, extra: [0.1, 4, 'Pop-up'], fans: 15, say: 'A good test.' }],
    ['🙅 Not yet', { say: 'You passed.' }]
  ], { minWeek: 15 });
  B('bubbletea', 'student_rush', '🎓', 'Exam week at the university', 'Thousands of stressed students need sugar and caffeine.', [
    ['⏰ Stay open until midnight', { team: -5, extra: [0.25, 1, 'Exam week'], say: 'Students packed the shop.' }],
    ['🎟️ Student deal', { extra: [0.2, 1, 'Exam week'], fans: 10, say: 'Students love you.' }],
    ['🛵 Deliver to the library', { extra: [0.2, 1, 'Library delivery'], say: 'Orders poured in.' }],
    ['😌 Normal week', { extra: [0.08, 1, 'Exam week'], say: 'Busy.' }]
  ]);

  // 🐾 PET SHOP
  B('petshop', 'sick_puppies', '🐶', 'The puppies you bought are sick', 'Your supplier sold you sick animals.', [
    ['🏥 Pay for a vet', { cash: -0.5, rep: 4, say: 'The puppies got better.' }],
    ['🚫 Drop the supplier', { cash: -0.3, rep: 3, say: 'You\'ll only work with good breeders.' }],
    ['👮 Report the supplier', { rep: 5, say: 'They were shut down.' }],
    ['🤐 Sell them anyway', { chance: { p: 0.3, win: { say: 'Nobody noticed.' }, lose: { rep: -15, say: 'Families came back furious.' } } }]
  ]);
  B('petshop', 'adoption_day', '🐾', 'A shelter wants an adoption day here', 'Dogs and cats looking for homes. It would bring lots of families.', [
    ['❤️ Yes, every month', { rep: 6, demand: [1.08, 8, 'Adoption days'], say: 'Families come for pets and buy supplies.' }],
    ['🎁 Free starter kit per adoption', { cash: -0.2, rep: 8, fans: 20, say: 'The news covered it.' }],
    ['🐶 Just this once', { rep: 3, fans: 10, say: 'Twelve pets found homes.' }],
    ['🙅 Too messy', { say: 'They went to another shop.' }]
  ]);
  B('petshop', 'escaped_snake', '🐍', 'A snake escaped', 'The tank is empty. Customers are nervous.', [
    ['🔒 Close and search', { closed: [1, 'Snake hunt'], say: 'Found it in the storeroom.' }],
    ['🔍 Search quietly', { chance: { p: 0.5, win: { say: 'Found it. Nobody knew.' }, lose: { rep: -5, say: 'A customer found it first. Screaming.' } } }],
    ['📢 Tell customers', { rep: 2, say: 'Honest. Some left. It was found.' }],
    ['🐍 Call an expert', { cash: -0.1, say: 'Found in an hour.' }]
  ]);
  B('petshop', 'pet_food_recall', '⚠️', 'A pet food brand is recalled', 'Some pets got sick. You sold a lot of it.', [
    ['📢 Call every customer', { rep: 6, cash: -0.2, say: 'Customers were grateful.' }],
    ['💸 Refund everyone', { cash: -0.4, rep: 4, say: 'Trust kept.' }],
    ['🪧 A sign in the window', { rep: 2, say: 'Some people saw it.' }],
    ['🤐 Remove it quietly', { rep: -8, say: 'Customers found out.' }]
  ], { kind: 'news' });
  B('petshop', 'grooming', '✂️', 'Customers want dog grooming', 'A grooming corner would bring steady money.', [
    ['✂️ Hire a groomer', { hireSpecial: { role: 'front', skill: 65 }, extra: [0.08, 12, 'Grooming'], say: 'Booked solid.' }],
    ['🎓 Train {a}', { cash: -0.2, skill: { a: 6 }, extra: [0.06, 12, 'Grooming'], say: '{a} loves it.' }],
    ['🛁 Self-wash station', { cash: -0.4, extra: [0.05, 12, 'Dog wash'], say: 'Owners love it.' }],
    ['🙅 Too much work', { say: 'No grooming.' }]
  ], FRONT);
  B('petshop', 'animal_rights', '📢', 'Protesters say your breeders are cruel', 'They\'re outside with signs.', [
    ['🔍 Check your breeders', { cash: -0.2, rep: 4, say: 'Two were bad. You dropped them.' }],
    ['🐾 Adoption only', { demand: [0.9, 8, 'Adoption only'], rep: 10, fans: 20, say: 'Fewer sales. Much more love.' }],
    ['🗣️ Talk to them', { chance: { p: 0.6, win: { rep: 3, say: 'They left satisfied.' }, lose: { rep: -3, say: 'It got louder.' } } }],
    ['🙅 Ignore them', { rep: -5, say: 'The protest grew.' }]
  ]);
  B('petshop', 'parrot_talks', '🦜', 'Your parrot learned a customer\'s name', 'It greets one regular by name every time. She\'s delighted.', [
    ['📹 Film it', { fans: 25, say: 'The video went round town.' }],
    ['🦜 Make it the shop mascot', { fans: 15, demand: [1.05, 8, 'Parrot mascot'], say: 'Kids come to meet it.' }],
    ['🎁 Give her a discount card', { rep: 3, say: 'She\'s your biggest fan now.' }],
    ['😌 Enjoy it', { happy: 3, say: 'A nice moment.' }]
  ]);

  // 💈 BARBER SHOP
  B('barber', 'bad_cut', '✂️', '{a} gave a terrible haircut', 'The customer has a wedding tomorrow. He\'s furious.', [
    ['✂️ Fix it yourself', { chance: { p: 0.7, win: { rep: 3, say: 'Saved. He left happy.' }, lose: { rep: -4, say: 'Shorter. Still bad.' } } }],
    ['💸 Refund and apologize', { rep: 1, say: 'He left. Angry.' }],
    ['🎩 Free hat and next cut free', { cash: -0.02, rep: 2, say: 'He laughed. Barely.' }],
    ['🎓 Retrain {a}', { cash: -0.1, skill: { a: 5 }, a: -5, say: '{a} is embarrassed.' }]
  ], FRONT);
  B('barber', 'celebrity_client', '🌟', 'A famous footballer wants a cut', 'He\'s in town for one day. His style is copied by millions.', [
    ['✂️ Do it yourself', { chance: { p: 0.8, win: { fans: 40, say: 'He posted it. The phone won\'t stop ringing.' }, lose: { fans: 10, say: 'He didn\'t post it.' } } }],
    ['✂️ Let {a} do it', { chance: { p: 0.6, win: { fans: 40, a: 15, say: '{a} is famous now.' }, lose: { rep: -3, say: 'He didn\'t love it.' } } }],
    ['📸 Ask for a photo', { fans: 20, say: 'The photo is on the wall.' }],
    ['🤫 Keep it private', { rep: 3, say: 'He came back next time too.' }]
  ], FRONT);
  B('barber', 'walk_in_chaos', '⏳', 'Too many walk-ins', 'People wait an hour. Some leave. Bookings are a mess.', [
    ['📱 Booking app', { cash: -0.2, capacity: [1.08, 16, 'Booking app'], say: 'Smooth days now.' }],
    ['🪑 Add another chair', { hireSpecial: { role: 'front', skill: 55 }, say: 'Shorter waits.' }],
    ['☕ Free coffee while waiting', { cash: -0.05, happy: 4, say: 'People don\'t mind waiting now.' }],
    ['🤷 Leave it', { happy: -4, say: 'People keep leaving.' }]
  ]);
  B('barber', 'razor_cut', '🩸', 'A customer got a cut from a razor', 'A small cut. But he\'s angry and talking about lawyers.', [
    ['🩹 First aid and a free cut', { rep: 2, say: 'He calmed down.' }],
    ['💸 Offer money', { cash: -0.2, say: 'He took it and left.' }],
    ['🎓 Safety training', { cash: -0.1, rep: 3, team: 2, say: 'It won\'t happen again.' }],
    ['🙅 "Accidents happen"', { chance: { p: 0.6, win: { say: 'He let it go.' }, lose: { cash: -0.6, say: 'He sued.' } } }]
  ]);
  B('barber', 'trend_cut', '💇', 'A new haircut is trending', 'Every teenager wants it. Only a few barbers know how.', [
    ['🎓 Learn it this week', { cash: -0.1, demand: [1.1, 6, 'Trend cut'], say: 'Teens line up.' }],
    ['📹 Post videos of it', { fans: 25, demand: [1.06, 6, 'Trend cut'], say: 'Your videos went round.' }],
    ['🏷️ Trend cut special price', { demand: [1.12, 4, 'Trend cut'], say: 'Busy week.' }],
    ['🙅 Classic cuts only', { say: 'Teens went elsewhere.' }]
  ]);
  B('barber', 'chair_rent', '💺', '{a} wants to rent a chair instead', '"I\'ll pay rent and keep my own customers." {a} wants independence.', [
    ['✅ Agree', { extra: [0.05, 12, 'Chair rent'], a: 15, say: '{a} is happier and pays rent.' }],
    ['🙅 Say no', { a: -12, say: '{a} is unhappy.' }],
    ['🤝 Offer a bigger share', { raise: ['a', 0.1], a: 10, say: '{a} stays on salary, happier.' }],
    ['🚪 "Then open your own shop"', { quit: 'a', say: '{a} opened a shop down the street.' }]
  ], FRONT);
  B('barber', 'charity_cuts', '❤️', 'Free cuts for homeless people?', 'A shelter asks if you can help on Sundays.', [
    ['❤️ Every Sunday', { rep: 8, team: 4, say: 'The team loves it.' }],
    ['✂️ Once a month', { rep: 5, say: 'A good thing.' }],
    ['📹 Film it for social media', { rep: 4, fans: 25, say: 'Some said it was for show.' }],
    ['🙅 Too busy', { say: 'You passed.' }]
  ]);

  // 💐 FLOWER SHOP
  B('flowers', 'valentines', '💘', 'Valentine\'s Day is coming', 'Your biggest week of the year. Roses cost triple.', [
    ['🌹 Order huge amounts', { cash: -0.6, extra: [0.5, 1, 'Valentine\'s'], say: 'Sold out.' }],
    ['📝 Pre-orders only', { extra: [0.35, 1, 'Valentine\'s'], say: 'No waste. Good money.' }],
    ['🌷 Push tulips over roses', { extra: [0.3, 1, 'Valentine\'s'], fans: 10, say: 'Different and cheaper.' }],
    ['😌 Normal stock', { extra: [0.1, 1, 'Valentine\'s'], say: 'Sold out by noon.' }]
  ], { cond: function (g) { var w = ((g.week - 1) % 52) + 1; return w >= 5 && w <= 7; }, w: 20 });
  B('flowers', 'funeral_order', '🥀', 'A big funeral order', 'A family lost their grandmother. They want the flowers to be perfect.', [
    ['💐 Do it with care', { extra: [0.2, 1, 'Funeral order'], rep: 4, say: 'The family thanked you.' }],
    ['🎁 Add a free wreath', { extra: [0.18, 1, 'Funeral order'], rep: 6, say: 'They\'ll never forget it.' }],
    ['📈 Charge the full premium', { extra: [0.25, 1, 'Funeral order'], say: 'A lot of money.' }],
    ['🙅 Too busy', { say: 'They went elsewhere.' }]
  ]);
  B('flowers', 'wilted_delivery', '🥀', 'A delivery arrived wilted', 'Half the flowers are dead. The wedding is tomorrow.', [
    ['🚗 Drive to the market at 4 AM', { cash: -0.2, team: 3, say: 'You saved the wedding.' }],
    ['🌿 Get creative with greens', { chance: { p: 0.6, win: { rep: 4, say: 'The bride loved it more.' }, lose: { rep: -3, say: 'She wanted roses.' } } }],
    ['💸 Demand a refund', { cash: 0.1, say: 'Money back. Still no flowers.' }],
    ['📞 Tell the bride the truth', { rep: 2, say: 'She understood.' }]
  ]);
  B('flowers', 'wedding_contract', '💒', 'A wedding planner wants a deal', 'All their weddings for a year. A steady flow of work.', [
    ['✍️ Sign', { extra: [0.1, 12, 'Wedding deal'], say: 'Weekends are full.' }],
    ['🤝 Better price', { chance: { p: 0.5, win: { extra: [0.14, 12, 'Wedding deal'], say: 'Signed at your price.' }, lose: { say: 'They went elsewhere.' } } }],
    ['🧑‍💼 Hire a helper and sign', { hireSpecial: { role: 'front', skill: 50 }, extra: [0.1, 12, 'Wedding deal'], say: 'Ready for the busy season.' }],
    ['🙅 No', { say: 'You passed.' }]
  ]);
  B('flowers', 'mothers_day', '👩', 'Mother\'s Day week', 'Everyone needs flowers for mom.', [
    ['💐 Pre-made bouquets', { extra: [0.35, 1, 'Mother\'s Day'], say: 'Fast and sold out.' }],
    ['🛵 Free delivery', { cash: -0.1, extra: [0.35, 1, 'Mother\'s Day'], fans: 10, say: 'Orders poured in.' }],
    ['🎨 Kids\' bouquet workshop', { extra: [0.25, 1, 'Mother\'s Day'], fans: 20, say: 'The sweetest day of the year.' }],
    ['😌 Normal day', { extra: [0.12, 1, 'Mother\'s Day'], say: 'Busy.' }]
  ], { cond: function (g) { var w = ((g.week - 1) % 52) + 1; return w >= 18 && w <= 20; }, w: 20 });
  B('flowers', 'secret_admirer', '💌', 'A secret admirer orders flowers', 'Every week, roses for the same woman. No name. She wants to know who.', [
    ['🤐 Keep the secret', { rep: 3, say: 'The mystery continues.' }],
    ['💌 Give her a hint', { chance: { p: 0.6, win: { fans: 15, say: 'They met. They\'re dating.' }, lose: { rep: -2, say: 'The admirer is upset.' } } }],
    ['📰 Tell the local paper', { fans: 25, rep: -1, say: 'The whole town is guessing.' }],
    ['🎁 Sell "secret admirer" bouquets', { extra: [0.06, 6, 'Admirer bouquets'], say: 'Everyone wants one.' }]
  ]);
  B('flowers', 'plant_trend', '🪴', 'Indoor plants are the new trend', 'Young people want plants for their apartments.', [
    ['🪴 A big plant section', { cash: -0.4, demand: [1.1, 12, 'Plant trend'], say: 'Your shop is a jungle now.' }],
    ['🎓 Plant care classes', { extra: [0.05, 8, 'Classes'], fans: 15, say: 'Classes sell out.' }],
    ['📦 Plant subscription box', { extra: [0.07, 12, 'Plant box'], say: 'Monthly money.' }],
    ['🙅 Flowers only', { say: 'You stayed classic.' }]
  ]);

  // ▶️ YOUTUBE CHANNEL
  B('youtube', 'demonetized', '💸', 'Your channel was demonetized', 'A strike for a video. No ad money until it\'s fixed.', [
    ['📝 Appeal', { chance: { p: 0.6, win: { say: 'Appeal won. Money back.' }, lose: { demand: [0.8, 3, 'Demonetized'], say: 'Appeal lost.' } } }],
    ['🗑️ Delete the video', { demand: [0.9, 2, 'Demonetized'], say: 'Back in two weeks.' }],
    ['💼 Get sponsors instead', { extra: [0.1, 6, 'Sponsors'], say: 'Sponsors pay better anyway.' }],
    ['📢 Tell your fans', { fans: 20, demand: [0.9, 2, 'Demonetized'], say: 'Fans rallied behind you.' }]
  ]);
  B('youtube', 'collab', '🤝', 'A huge creator wants to collab', 'Ten million subscribers. They want to film with you next week.', [
    ['🎬 Yes, go big', { cash: -0.2, fans: 80, demand: [1.15, 4, 'Big collab'], say: 'Your subscribers doubled.' }],
    ['🎬 Yes, keep it simple', { fans: 50, say: 'A great video.' }],
    ['🤝 Swap videos', { fans: 60, say: 'Both channels grew.' }],
    ['🙅 Not your style', { say: 'You passed.' }]
  ]);
  B('youtube', 'hater_video', '😡', 'Another creator made a video attacking you', '"Why {company} is fake." It has a million views.', [
    ['🎬 Reply with a calm video', { chance: { p: 0.6, win: { fans: 40, rep: 4, say: 'People loved your answer.' }, lose: { rep: -3, say: 'It made it bigger.' } } }],
    ['🔥 Fire back', { chance: { p: 0.4, win: { fans: 60, say: 'You won the internet.' }, lose: { rep: -8, say: 'Now it\'s drama. Bad drama.' } } }],
    ['🤐 Ignore it', { rep: -2, say: 'It faded.' }],
    ['🤝 Invite them to talk', { chance: { p: 0.5, win: { fans: 50, rep: 5, say: 'You filmed a talk. Huge.' }, lose: { say: 'They said no.' } } }]
  ]);
  B('youtube', 'editor_quits', '🎞️', '{a} wants credit on the videos', '{a} edits everything. They want their name in every video.', [
    ['✅ Add their name', { a: 15, loyal: { a: 15 }, say: '{a} is proud.' }],
    ['💵 Pay more instead', { raise: ['a', 0.1], a: 5, say: '{a} took the money.' }],
    ['🎥 Put them on camera', { a: 12, fans: 15, say: 'Fans love {a}.' }],
    ['🙅 No', { a: -15, next: ['resign', 3, 8, 0.5], say: '{a} is upset.' }]
  ], FRONT);
  B('youtube', 'sponsor_bad', '🎰', 'A shady sponsor offers big money', 'A gambling app wants an ad. Many of your viewers are kids.', [
    ['🙅 Say no', { rep: 5, fans: 10, say: 'Fans respected it.' }],
    ['💰 Take it', { cash: 1.5, rep: -10, fans: -20, say: 'Parents were furious.' }],
    ['📢 Tell fans you said no', { fans: 25, rep: 6, say: 'Fans loved it.' }],
    ['🔍 Find a better sponsor', { extra: [0.08, 8, 'Good sponsor'], say: 'A clean sponsor.' }]
  ]);
  B('youtube', 'burnout_creator', '🥵', 'You\'re tired of making videos', 'Three videos a week for a year. You\'re running out of ideas.', [
    ['⏸️ Take a two-week break', { demand: [0.85, 2, 'Break'], team: 6, say: 'You came back with fresh ideas.' }],
    ['📉 One video a week', { demand: [0.95, 8, 'Fewer videos'], rep: 3, say: 'Better quality.' }],
    ['💬 Ask fans for ideas', { fans: 15, say: 'Hundreds of ideas.' }],
    ['💪 Keep going', { rep: -3, say: 'Your videos got worse. Fans noticed.' }]
  ]);
  B('youtube', 'million', '🏆', 'One million subscribers', 'You hit the big number. The gold button is coming.', [
    ['🎉 Live stream party', { fans: 50, say: 'Thousands joined.' }],
    ['🎁 A huge giveaway', { cash: -0.4, fans: 80, say: 'Everyone entered.' }],
    ['🎬 Thank-you video', { fans: 40, rep: 4, say: 'Fans cried.' }],
    ['🛍️ Launch merch', { extra: [0.15, 6, 'Merch'], fans: 20, say: 'Sold out.' }]
  ], { cond: function (g) { return g.followers > 5000; }, w: 20, cd: 200 });
})();
