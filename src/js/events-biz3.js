// Events that only happen in one kind of business, part 3: the giant companies.
// B(business, id, icon, title, text, [4 x [answer, effect]], extra fields). Defined in events-biz1.js.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var B = CS.biz, H = CS.EVH, rival = H.rival, FRONT = { who: { a: 'front' } };

  // ✈️ AIRLINE
  B('airline', 'engine_fire', '🔥', 'An engine caught fire after takeoff', 'Pilot {a} landed safely. Every passenger is okay. The news is already there.', [
    ['🏅 Honor {a} as a hero', { a: 20, rep: 6, fans: 30, say: '{a} is a national hero.' }],
    ['🔧 Ground the fleet for checks', { closed: [1, 'Safety checks'], rep: 8, say: 'Found two more problems. Safer now.' }],
    ['🎁 Free flights for passengers', { cash: -0.5, rep: 5, say: 'Passengers were grateful.' }],
    ['🤐 Say as little as possible', { rep: -6, say: 'People thought you were hiding something.' }]
  ], FRONT);
  B('airline', 'pilot_strike', '✊', 'Pilots are going on strike', 'They want better pay and rest. Thousands of flights at risk.', [
    ['💵 Give them the raise', { teamRaise: 0.1, team: 15, say: 'Flights keep flying.' }],
    ['🤝 Meet in the middle', { chance: { p: 0.6, win: { teamRaise: 0.05, team: 8, say: 'A deal.' }, lose: { closed: [1, 'Pilot strike'], say: 'Talks failed.' } } }],
    ['😴 More rest, less pay rise', { teamRaise: 0.03, team: 10, capacity: [0.95, 8, 'Longer rests'], say: 'Safer, happier pilots.' }],
    ['🚫 Refuse', { closed: [1, 'Pilot strike'], rep: -8, team: -15, say: 'Chaos at every airport.' }]
  ]);
  B('airline', 'overbooked_flight', '💺', 'A flight is overbooked', 'A passenger refuses to give up his seat. Cameras are out.', [
    ['💵 Offer more money', { cash: -0.05, say: 'Someone took the offer.' }],
    ['🎟️ Free first class next time', { rep: 2, say: 'Problem solved.' }],
    ['👮 Remove him', { rep: -15, say: 'The video went around the world.' }],
    ['📋 Stop overbooking', { capacity: [0.97, 20, 'No overbooking'], rep: 5, say: 'Fewer seats sold. More trust.' }]
  ]);
  B('airline', 'fuel_crisis', '⛽', 'Jet fuel prices doubled', 'Every flight now costs a fortune.', [
    ['📈 Raise ticket prices', { price: 1, happy: -4, say: 'Fewer passengers, but profitable.' }],
    ['✂️ Cut empty routes', { capacity: [0.9, 12, 'Fewer routes'], supply: [-0.03, 12, 'Fewer routes'], say: 'Leaner.' }],
    ['✈️ Buy fuel-saving planes', { cash: -3, supply: [-0.05, 30, 'New planes'], say: 'A big bet on the future.' }],
    ['😬 Absorb it', { supply: [0.08, 8, 'Fuel crisis'], say: 'Painful months.' }]
  ], { kind: 'news' });
  B('airline', 'lost_luggage', '🧳', 'A thousand bags went missing', 'A computer failure sent bags to the wrong countries.', [
    ['🚚 Deliver every bag to homes', { cash: -0.6, rep: 4, say: 'Every bag found its owner.' }],
    ['💸 Pay every passenger', { cash: -0.8, rep: 5, say: 'Generous. People noticed.' }],
    ['🔧 Fix the system', { cash: -0.5, equip: 0.02, say: 'Never again.' }],
    ['🙏 Apologize', { rep: -4, say: 'Not enough.' }]
  ]);
  B('airline', 'new_route', '🗺️', 'A new route to a tropical island', 'No other airline flies there. It could be a gold mine.', [
    ['✈️ Launch it', { cash: -1, demand: [1.1, 16, 'Island route'], say: 'Packed flights.' }],
    ['🧪 Seasonal only', { cash: -0.4, demand: [1.05, 12, 'Island route'], say: 'Safe start.' }],
    ['🤝 Partner with a hotel', { extra: [0.1, 12, 'Holiday packages'], say: 'Full holiday packages.' }],
    ['🙅 Too risky', { say: '{rival} launched it.' }]
  ], { init: rival });
  B('airline', 'unruly_passenger', '😡', 'A passenger attacked a flight attendant', 'The plane had to land early. {a} is hurt.', [
    ['🚫 Ban him for life', { rep: 5, team: 8, a: 10, say: 'The crew feels protected.' }],
    ['⚖️ Press charges', { rep: 6, team: 10, say: 'He\'s in court.' }],
    ['🏥 Care for {a} first', { a: 18, loyal: { a: 20 }, say: '{a} is grateful.' }],
    ['🤐 Keep it quiet', { team: -12, say: 'The crew feels betrayed.' }]
  ], FRONT);

  // 🏦 BANK
  B('bank', 'bank_run', '🏃', 'People are pulling out their money', 'A rumor says your bank is in trouble. Lines at every branch.', [
    ['📢 Show your real numbers', { chance: { p: 0.6, win: { rep: 6, say: 'The panic stopped.' }, lose: { cash: -1, say: 'Nobody believed it.' } } }],
    ['💰 Borrow from the central bank', { cash: -0.5, rep: 3, say: 'Every customer got paid.' }],
    ['⏸️ Limit withdrawals', { rep: -10, say: 'The panic got worse.' }],
    ['🎤 Go on TV', { chance: { p: 0.5, win: { rep: 8, fans: 20, say: 'You calmed the nation.' }, lose: { rep: -5, say: 'You looked nervous.' } } }]
  ]);
  B('bank', 'robbery', '🔫', 'Your bank was robbed', 'Masked men. Everyone is safe. The vault is lighter.', [
    ['❤️ Care for your staff first', { team: 12, cash: -0.5, say: 'Your staff felt cared for.' }],
    ['🦺 Much better security', { cash: -1, team: 6, say: 'Safer than ever.' }],
    ['📹 Help the police', { chance: { p: 0.5, win: { cash: 0.3, rep: 4, say: 'Caught. Money back.' }, lose: { cash: -0.5, say: 'They got away.' } } }],
    ['📄 Insurance', { chance: { p: function (g) { return g.flags.insured ? 0.95 : 0.6; }, win: { say: 'Covered.' }, lose: { cash: -0.8, say: 'Not covered.' } } }]
  ]);
  B('bank', 'risky_loan', '💼', 'A billionaire wants a huge loan', 'For a risky project. He offers a high interest rate.', [
    ['✅ Give the loan', { chance: { p: 0.6, win: { cash: 3, say: 'He paid it back with interest.' }, lose: { cash: -2, say: 'His project failed.' } } }],
    ['🤝 Half the loan', { chance: { p: 0.6, win: { cash: 1.5, say: 'Solid profit.' }, lose: { cash: -1, say: 'Lost half.' } } }],
    ['📋 Demand collateral', { chance: { p: 0.5, win: { cash: 2, say: 'Safe and profitable.' }, lose: { say: 'He went to {rival}.' } } }],
    ['🙅 Too risky', { say: 'You passed.' }]
  ], { init: rival });
  B('bank', 'app_crash', '📱', 'Your banking app crashed on payday', 'Millions can\'t see their money. Social media is on fire.', [
    ['🧑‍💻 All engineers on it', { team: -5, say: 'Back in two hours.' }],
    ['📢 Honest updates', { rep: 3, say: 'People appreciated honesty.' }],
    ['💸 Pay any late fees for customers', { cash: -0.6, rep: 6, say: 'Customers were impressed.' }],
    ['☁️ New systems', { cash: -1.5, equip: 0.03, say: 'Never again.' }]
  ]);
  B('bank', 'fraud_ring', '🕵️', 'A fraud gang is stealing from customers', 'They trick old people into sending money.', [
    ['🛡️ Better fraud checks', { cash: -0.6, rep: 6, say: 'Fraud dropped fast.' }],
    ['💸 Pay back victims', { cash: -0.8, rep: 8, say: 'Families thanked you.' }],
    ['📢 Warn every customer', { rep: 4, say: 'Fewer fell for it.' }],
    ['🤷 "Customers\' fault"', { rep: -10, say: 'The news disagreed.' }]
  ]);
  B('bank', 'interest_rates', '📈', 'Interest rates just jumped', 'Loans pay more. But fewer people want to borrow.', [
    ['💰 Push savings accounts', { demand: [1.08, 12, 'Savings'], say: 'Savers poured in.' }],
    ['📉 Keep loan rates low', { demand: [1.06, 12, 'Cheap loans'], supply: [0.03, 12, 'Low rates'], say: 'You grabbed borrowers.' }],
    ['📈 Raise loan rates', { cash: 0.5, demand: [0.94, 8, 'High rates'], say: 'More per loan, fewer loans.' }],
    ['😌 Wait and see', { say: 'Steady.' }]
  ], { kind: 'news' });
  B('bank', 'insider', '🤫', '{a} leaked secret client info', 'A rich client\'s details ended up in a newspaper.', [
    ['🚪 Fire {a}', { fire: 'a', rep: 4, say: 'Clear message.' }],
    ['🙏 Apologize to the client', { cash: -0.3, rep: 2, say: 'The client stayed.' }],
    ['🔒 Lock down all data', { cash: -0.5, rep: 3, say: 'Safer.' }],
    ['🛡️ Protect {a}', { rep: -8, say: 'Clients left.' }]
  ], FRONT);

  // 🚗 CAR MAKER
  B('cars', 'brake_recall', '🚨', 'A brake problem in your best car', 'Engineers found it. No accidents yet. A recall costs a fortune.', [
    ['📢 Recall every car', { cash: -2, rep: 10, say: 'Expensive. People trust you.' }],
    ['🔧 Fix it quietly at service', { cash: -0.8, chance: { p: 0.5, win: { say: 'Handled.' }, lose: { rep: -12, say: 'The news found out.' } } }],
    ['🔍 More tests first', { chance: { p: 0.4, win: { say: 'Not as bad as feared.' }, lose: { cash: -2.5, rep: -8, say: 'An accident happened while you waited.' } } }],
    ['🤐 Say nothing', { rep: -20, cash: -3, say: 'The worst scandal in your history.' }]
  ]);
  B('cars', 'electric', '🔋', 'Go fully electric?', 'The future is electric. Switching costs billions.', [
    ['🔋 All in', { cash: -3, demand: [1.15, 20, 'Electric'], rep: 6, say: 'You\'re the future.' }],
    ['🔌 One electric model', { cash: -1, demand: [1.07, 20, 'Electric model'], say: 'A good start.' }],
    ['🤝 Partner with a battery maker', { cash: -0.5, equip: 0.03, say: 'Smart partnership.' }],
    ['⛽ Stick to gas', { demand: [0.92, 20, 'Old tech'], say: 'Young buyers went elsewhere.' }]
  ], { minWeek: 10 });
  B('cars', 'chip_shortage', '💾', 'A chip shortage stopped your factory', 'No chips, no cars. Waiting lists grow.', [
    ['💰 Pay triple for chips', { cash: -1, say: 'Factory running.' }],
    ['🚗 Make simpler cars', { capacity: [0.85, 8, 'Simple cars'], say: 'Fewer features, still selling.' }],
    ['🏭 Make your own chips', { cash: -2.5, equip: 0.04, say: 'Never dependent again.' }],
    ['⏸️ Pause production', { closed: [1, 'No chips'], say: 'A lost week.' }]
  ], { kind: 'news' });
  B('cars', 'crash_test', '💥', 'Your new car failed a crash test', 'On live TV. It was a disaster.', [
    ['🔧 Redesign it', { cash: -1.5, rep: 4, say: 'Top marks second time.' }],
    ['📢 Explain the fix', { chance: { p: 0.5, win: { rep: 2, say: 'People believed you.' }, lose: { rep: -6, say: 'People laughed.' } } }],
    ['🚫 Cancel the model', { cash: -1, rep: 2, say: 'Painful but smart.' }],
    ['⚖️ Blame the test', { rep: -10, say: 'Nobody bought it.' }]
  ]);
  B('cars', 'race_team', '🏁', 'Start a racing team?', 'Racing sells cars. It also costs a fortune.', [
    ['🏁 Go for it', { cash: -2, chance: { p: 0.4, win: { fans: 100, demand: [1.12, 16, 'Racing wins'], say: 'You won the championship.' }, lose: { fans: 40, say: 'Mid-table. Still fun.' } } }],
    ['🤝 Sponsor a team', { cash: -0.8, fans: 40, say: 'Your logo on the winners\' car.' }],
    ['🏎️ One special race', { cash: -0.3, fans: 20, say: 'Great show.' }],
    ['🙅 No', { say: 'You passed.' }]
  ]);
  B('cars', 'factory_robots', '🤖', 'Robots could replace half the line', 'Faster, cheaper. The union is ready to fight.', [
    ['🤖 Buy robots, retrain workers', { cash: -2, equip: 0.06, team: 2, say: 'Nobody lost their job.' }],
    ['🤖 Buy robots, cut jobs', { cash: -1.5, equip: 0.06, team: -20, rep: -6, say: 'Protests outside.' }],
    ['🧪 Test a few robots', { cash: -0.5, equip: 0.02, say: 'A careful start.' }],
    ['🙅 Keep people', { team: 12, rep: 4, say: 'The union loves you.' }]
  ]);
  B('cars', 'self_driving', '🚘', 'Your self-driving car hit a pole', 'In a test. Nobody hurt. The video is everywhere.', [
    ['⏸️ Pause the program', { rep: 4, say: 'Responsible.' }],
    ['🔧 Fix and keep testing', { cash: -0.5, say: 'Back on the road.' }],
    ['📢 Share all the data', { rep: 6, say: 'Experts praised your honesty.' }],
    ['🤐 Say nothing', { rep: -8, say: 'People are scared of your cars.' }]
  ]);

  // ⚡ ENERGY COMPANY
  B('energy', 'blackout', '🌃', 'Your grid failed. Half the city is dark', 'Hospitals are on backup. Everyone is angry.', [
    ['🧑‍🔧 Every worker on it', { team: -8, say: 'Power back in six hours.' }],
    ['🏥 Hospitals first', { rep: 6, say: 'People respected that.' }],
    ['💸 Refund everyone', { cash: -1, rep: 5, say: 'Generous.' }],
    ['🔧 Upgrade the whole grid', { cash: -3, equip: 0.05, rep: 4, say: 'Never again.' }]
  ]);
  B('energy', 'solar_farm', '☀️', 'Build a giant solar farm?', 'Clean energy. Big cost. The government offers help.', [
    ['☀️ Build it', { cash: -2, supply: [-0.05, 30, 'Solar farm'], rep: 8, say: 'Cheap, clean power.' }],
    ['🤝 With government money', { cash: -0.8, supply: [-0.03, 30, 'Solar farm'], rep: 6, say: 'A great deal.' }],
    ['🌬️ Wind instead', { cash: -1.5, supply: [-0.04, 30, 'Wind farm'], rep: 6, say: 'Windy and profitable.' }],
    ['🙅 Not yet', { say: 'You passed.' }]
  ]);
  B('energy', 'price_anger', '😡', 'People are angry about power bills', 'Bills doubled this winter. Protests outside your office.', [
    ['📉 Cut prices', { price: -1, rep: 6, say: 'People calmed down.' }],
    ['❤️ Help for poor families', { cash: -0.8, rep: 8, say: 'The news loved it.' }],
    ['📢 Explain the costs', { chance: { p: 0.4, win: { rep: 2, say: 'Some understood.' }, lose: { rep: -5, say: 'Nobody cared.' } } }],
    ['🤷 Do nothing', { rep: -10, say: 'The government is watching you.' }]
  ], { cond: function (g) { var w = ((g.week - 1) % 52) + 1; return w < 10 || w > 44; } });
  B('energy', 'plant_leak', '☢️', 'A small leak at your power plant', 'No danger yet. Inspectors are on the way.', [
    ['📢 Report it yourself', { rep: 6, closed: [1, 'Plant check'], say: 'Handled right.' }],
    ['🔧 Fix it fast', { cash: -0.8, say: 'Fixed before the inspectors arrived.' }],
    ['🤐 Hide it', { chance: { p: 0.3, win: { say: 'They didn\'t find it.' }, lose: { cash: -3, rep: -20, say: 'Found. A national scandal.' } } }],
    ['🔒 Shut the plant for a full check', { cash: -1.5, rep: 8, say: 'Safer than ever.' }]
  ]);
  B('energy', 'storm_lines', '⛈️', 'A storm knocked down power lines', 'Thousands of homes without power.', [
    ['🧑‍🔧 Crews out all night', { team: -10, rep: 5, say: 'Power back by morning.' }],
    ['🏠 Old and sick people first', { rep: 8, say: 'Kind and smart.' }],
    ['🔌 Bury lines underground', { cash: -2, equip: 0.04, say: 'Storm-proof now.' }],
    ['⏳ Normal speed', { rep: -5, say: 'Three days in the dark.' }]
  ]);
  B('energy', 'government_contract', '🏛️', 'The government wants a big contract', 'Power for every public building. Low price, long time.', [
    ['✍️ Sign', { extra: [0.1, 16, 'Government contract'], rep: 3, say: 'Steady money for years.' }],
    ['🤝 Negotiate', { chance: { p: 0.5, win: { extra: [0.14, 16, 'Government contract'], say: 'Better price.' }, lose: { say: '{rival} got it.' } } }],
    ['🌱 Offer green power only', { extra: [0.08, 16, 'Government contract'], rep: 8, say: 'A clean contract.' }],
    ['🙅 Too cheap', { say: 'You passed.' }]
  ], { init: rival });
  B('energy', 'battery_tech', '🔋', 'A startup has a new battery', 'It could store power for a whole city. They need money.', [
    ['💰 Buy the startup', { cash: -2.5, equip: 0.06, say: 'The future is yours.' }],
    ['🤝 Invest a little', { cash: -0.8, chance: { p: 0.5, win: { cash: 2, say: 'It worked.' }, lose: { say: 'It didn\'t scale.' } } }],
    ['🔍 Test it first', { say: 'Promising. You\'re watching.' }],
    ['🙅 Pass', { say: '{rival} bought it.' }]
  ], { init: rival });

  // 🎬 MOVIE STUDIO
  B('entertainment', 'flop', '📉', 'Your big movie flopped', 'It cost a fortune. Opening weekend was a disaster.', [
    ['📺 Sell it to streaming', { cash: 0.8, say: 'Some money back.' }],
    ['📢 Market it harder', { cash: -0.5, chance: { p: 0.3, win: { extra: [0.2, 3, 'Late hit'], say: 'Word of mouth saved it.' }, lose: { say: 'Still a flop.' } } }],
    ['🧑‍🤝‍🧑 Keep the team together', { team: 8, say: 'Next one will be better.' }],
    ['🔍 Blame the director', { team: -8, rep: -3, say: 'Hollywood noticed.' }]
  ]);
  B('entertainment', 'star_demand', '🌟', 'Your lead star wants more money', 'Filming starts Monday. She wants double or she walks.', [
    ['💰 Pay it', { cash: -1, say: 'Filming starts.' }],
    ['🤝 Share of the profits', { supply: [0.03, 16, 'Star deal'], say: 'She agreed.' }],
    ['🔄 Recast', { chance: { p: 0.5, win: { fans: 20, say: 'The new star is even better.' }, lose: { demand: [0.9, 8, 'Recast'], say: 'Fans wanted her.' } } }],
    ['🙅 Refuse', { closed: [1, 'Filming delayed'], say: 'She walked. Delays.' }]
  ]);
  B('entertainment', 'sequel', '🎬', 'Fans demand a sequel', 'Your last hit made millions. Everyone wants part two.', [
    ['🎬 Make it, big budget', { cash: -2, chance: { p: 0.7, win: { extra: [0.4, 3, 'Sequel'], fans: 60, say: 'A bigger hit.' }, lose: { say: 'Sequels are hard.' } } }],
    ['📺 A TV series instead', { cash: -1, extra: [0.1, 12, 'TV series'], fans: 40, say: 'Fans loved it.' }],
    ['🆕 Something new', { cash: -1, chance: { p: 0.5, win: { rep: 8, fans: 40, say: 'Original and brilliant.' }, lose: { say: 'Fans wanted the sequel.' } } }],
    ['⏳ Wait', { say: 'Fans are impatient.' }]
  ]);
  B('entertainment', 'script_leak', '📜', 'The script leaked', 'The big twist is all over the internet.', [
    ['✍️ Rewrite the ending', { cash: -0.5, fans: 20, say: 'Nobody saw the new twist coming.' }],
    ['😏 Say it was fake', { chance: { p: 0.5, win: { fans: 15, say: 'People believed you.' }, lose: { rep: -3, say: 'Nobody bought it.' } } }],
    ['🕵️ Find the leaker', { chance: { p: 0.5, win: { rep: 2, say: 'A crew member. Fired.' }, lose: { team: -6, say: 'Paranoia on set.' } } }],
    ['🤷 Ignore it', { demand: [0.9, 4, 'Spoiled'], say: 'Some didn\'t bother watching.' }]
  ]);
  B('entertainment', 'awards', '🏆', 'Your film is nominated for Best Picture', 'The biggest night in movies.', [
    ['📢 Huge award campaign', { cash: -1, chance: { p: 0.5, win: { fans: 120, rep: 12, say: 'BEST PICTURE.' }, lose: { fans: 30, say: 'Nominated. Not won.' } } }],
    ['😌 Let the film speak', { chance: { p: 0.3, win: { fans: 120, rep: 12, say: 'Best Picture.' }, lose: { say: 'Not this year.' } } }],
    ['🎉 A big party for the crew', { cash: -0.3, team: 15, say: 'The crew celebrated.' }],
    ['📺 Re-release in cinemas', { extra: [0.2, 3, 'Re-release'], say: 'Ticket sales jumped.' }]
  ], { rarity: 'rare' });
  B('entertainment', 'stunt_injury', '🚑', 'A stunt went wrong', 'A stunt person is hurt. Filming stopped.', [
    ['🏥 Full support for them', { cash: -0.5, rep: 5, team: 8, say: 'The crew respects you.' }],
    ['🦺 New safety rules', { cash: -0.3, rep: 4, say: 'Safer sets.' }],
    ['💻 Use CGI for stunts', { cash: -0.8, equip: 0.02, say: 'Safer, pricier.' }],
    ['⏩ Keep filming', { team: -12, rep: -6, say: 'The crew is angry.' }]
  ]);
  B('entertainment', 'streaming_war', '📺', 'A streaming service wants all your movies', 'A huge offer. Cinemas would lose them.', [
    ['✍️ Sign', { cash: 3, demand: [0.9, 16, 'Streaming only'], say: 'Rich. Cinemas are upset.' }],
    ['🤝 Old movies only', { cash: 1.5, say: 'The best of both.' }],
    ['📺 Start your own service', { cash: -2, demand: [1.1, 20, 'Own streaming'], say: 'A big bet.' }],
    ['🙅 Cinemas first', { rep: 4, say: 'Cinemas love you.' }]
  ], { minWeek: 15 });

  // 🏟️ FOOTBALL CLUB
  B('footballclub', 'star_transfer', '⚽', 'A giant club wants your best player', 'A record offer for {a}. The fans will be furious if you sell.', [
    ['💰 Sell', { cash: 4, fire: 'a', fans: -30, say: 'A record fee. Angry fans.' }],
    ['❤️ Refuse', { fans: 30, a: 10, say: 'The fans chant your name.' }],
    ['📈 Ask for more', { chance: { p: 0.4, win: { cash: 5, fire: 'a', say: 'They paid even more.' }, lose: { a: -10, say: 'They walked. {a} is upset.' } } }],
    ['🖊️ New contract for {a}', { raise: ['a', 0.3], loyal: { a: 25 }, fans: 20, say: '{a} signed for five years.' }]
  ], FRONT);
  B('footballclub', 'derby', '🔥', 'Derby day against the city rivals', 'The biggest game of the year. The whole city is watching.', [
    ['🏋️ Extra training all week', { team: -5, chance: { p: 0.55, win: { fans: 60, extra: [0.3, 1, 'Derby win'], say: 'You WON the derby.' }, lose: { fans: -10, say: 'Lost. The city is theirs this year.' } } }],
    ['🎤 A big speech before the game', { chance: { p: 0.5, win: { fans: 60, team: 10, say: 'Fired up. You won.' }, lose: { say: 'A draw.' } } }],
    ['🎟️ Cheap tickets for fans', { cash: -0.2, fans: 30, chance: { p: 0.55, win: { extra: [0.2, 1, 'Derby win'], say: 'The crowd carried you to a win.' }, lose: { say: 'Lost, but the stadium was full.' } } }],
    ['😌 Normal week', { chance: { p: 0.45, win: { fans: 40, say: 'Won.' }, lose: { say: 'Lost.' } } }]
  ]);
  B('footballclub', 'racism', '🚫', 'Fans shouted racist abuse at a player', 'Some of your fans. On camera. The world is watching.', [
    ['🚫 Ban them for life', { rep: 10, fans: 20, say: 'A clear message. Praised worldwide.' }],
    ['📢 Anti-racism campaign', { cash: -0.3, rep: 8, say: 'The whole club stood together.' }],
    ['❤️ Support the player', { team: 10, rep: 5, say: 'The team feels united.' }],
    ['🤐 Say nothing', { rep: -15, say: 'Sponsors left.' }]
  ]);
  B('footballclub', 'new_stadium', '🏟️', 'Build a new stadium?', 'Bigger, modern. It costs a fortune.', [
    ['🏟️ Build it', { cash: -4, capacity: [1.25, 30, 'New stadium'], say: 'A home for the future.' }],
    ['🔧 Renovate the old one', { cash: -1.5, capacity: [1.1, 30, 'Renovated'], fans: 20, say: 'History kept, modern seats.' }],
    ['🤝 Share with the city', { cash: -2, capacity: [1.2, 30, 'Shared stadium'], say: 'Cheaper.' }],
    ['🙅 Not now', { say: 'You passed.' }]
  ], { minWeek: 20 });
  B('footballclub', 'coach_fired', '📉', 'Five losses in a row', 'Fans want the coach gone. The board is nervous.', [
    ['🚪 Fire the coach', { chance: { p: 0.5, win: { fans: 20, say: 'The new coach won three straight.' }, lose: { say: 'Still losing.' } } }],
    ['🤝 Back the coach', { chance: { p: 0.5, win: { fans: 30, rep: 3, say: 'Trust paid off.' }, lose: { fans: -20, say: 'More losses.' } } }],
    ['💰 Buy new players', { cash: -2, fans: 20, say: 'Fresh legs.' }],
    ['🎤 Talk to the fans', { rep: 4, say: 'They gave you time.' }]
  ]);
  B('footballclub', 'youth_star', '🌟', 'A 17-year-old from your academy scored twice', 'On debut. Everyone is talking about him.', [
    ['🖊️ Long contract now', { cash: -0.3, fans: 40, say: 'He\'s yours for years.' }],
    ['🛡️ Protect him from media', { rep: 4, fans: 20, say: 'Calm and focused.' }],
    ['📢 Make him the face of the club', { fans: 60, say: 'Shirts sold out.' }],
    ['💰 Sell while he\'s hot', { cash: 3, fans: -30, say: 'Fans are furious.' }]
  ], { rarity: 'rare' });
  B('footballclub', 'shirt_sponsor', '👕', 'A betting company wants your shirt', 'The biggest offer ever. Many fans are kids.', [
    ['✍️ Sign', { cash: 3, rep: -6, say: 'Rich. Parents are upset.' }],
    ['🔍 Find a family brand', { chance: { p: 0.5, win: { cash: 2.5, rep: 3, say: 'A clean sponsor.' }, lose: { cash: 1, say: 'Smaller deal.' } } }],
    ['❤️ Charity logo for free', { rep: 12, fans: 40, say: 'Fans love it.' }],
    ['🤝 Shorter deal', { cash: 1.5, rep: -3, say: 'A compromise.' }]
  ]);

  // ⛏️ GOLD MINE
  B('goldmine', 'cave_in', '⛑️', 'A tunnel collapsed', 'Six miners are trapped underground. Rescue teams are ready.', [
    ['🚨 Everything into the rescue', { cash: -1.5, closed: [1, 'Rescue'], rep: 10, team: 15, say: 'All six came out alive.' }],
    ['🧑‍🚒 Call national rescue', { cash: -0.5, closed: [1, 'Rescue'], chance: { p: 0.8, win: { rep: 6, say: 'Rescued.' }, lose: { rep: -8, team: -15, say: 'Two didn\'t make it.' } } }],
    ['⛑️ Go down yourself', { chance: { p: 0.7, win: { rep: 15, team: 20, fans: 50, say: 'You led them out. A legend.' }, lose: { rep: 5, team: 10, say: 'You helped. It took days.' } } }],
    ['🤐 Keep the news out', { rep: -15, team: -20, say: 'The families went to the press.' }]
  ]);
  B('goldmine', 'big_vein', '💰', 'You hit a huge gold vein', 'The richest find in years. Word will spread fast.', [
    ['⛏️ Mine it fast', { extra: [0.4, 3, 'Gold vein'], team: -8, say: 'Gold everywhere.' }],
    ['🤫 Keep it secret', { extra: [0.3, 4, 'Gold vein'], say: 'Nobody knows. Yet.' }],
    ['🎉 Bonus for every miner', { teamBonus: true, team: 15, extra: [0.3, 3, 'Gold vein'], say: 'The miners are cheering.' }],
    ['📢 Announce it', { fans: 40, rep: 5, extra: [0.3, 3, 'Gold vein'], say: 'The news went wild.' }]
  ], { rarity: 'rare' });
  B('goldmine', 'river_pollution', '🏞️', 'The river near the mine is polluted', 'Fish are dying. Villagers blame you.', [
    ['🧪 Test it honestly', { cash: -0.2, chance: { p: 0.5, win: { rep: 5, say: 'It wasn\'t you.' }, lose: { cash: -1, rep: 2, say: 'It was you. You cleaned it up.' } } }],
    ['🧹 Clean it up', { cash: -1.2, rep: 8, say: 'The river is clean again.' }],
    ['💸 Pay the villagers', { cash: -0.5, rep: -3, say: 'People called it a bribe.' }],
    ['🙅 Deny it', { rep: -12, say: 'The government is investigating.' }]
  ]);
  B('goldmine', 'gold_price_crash', '📉', 'Gold prices crashed', 'The price dropped 30% in a week.', [
    ['📦 Store the gold, sell later', { cash: -0.5, say: 'Waiting for better prices.' }],
    ['⛏️ Mine less', { capacity: [0.8, 6, 'Low prices'], say: 'Saving money.' }],
    ['💍 Make jewelry instead', { cash: -0.4, extra: [0.1, 8, 'Jewelry'], say: 'Jewelry sells higher.' }],
    ['⛏️ Keep going', { demand: [0.8, 6, 'Gold crash'], say: 'Hard weeks.' }]
  ], { kind: 'news' });
  B('goldmine', 'miners_strike', '✊', 'Miners want safer tunnels', 'They say the deep tunnels are dangerous. They won\'t go down.', [
    ['🦺 Fix the tunnels', { cash: -1.2, team: 15, rep: 5, say: 'Safe tunnels. Back to work.' }],
    ['💵 Danger pay', { teamRaise: 0.08, team: 8, say: 'Back to work. Still worried.' }],
    ['🔍 Independent inspection', { cash: -0.2, chance: { p: 0.5, win: { team: 6, say: 'Safe after all.' }, lose: { cash: -1, team: 10, say: 'They were right. Fixed.' } } }],
    ['🚫 Order them down', { team: -20, rep: -8, closed: [1, 'Strike'], say: 'They walked out.' }]
  ]);
  B('goldmine', 'land_claim', '📜', 'A tribe says the land is theirs', 'Old papers show the mine is on their ancestral land.', [
    ['🤝 Share the profits', { supply: [0.05, 30, 'Land deal'], rep: 10, say: 'A fair partnership.' }],
    ['⚖️ Fight in court', { cash: -0.8, chance: { p: 0.5, win: { say: 'You won.' }, lose: { cash: -2, rep: -6, say: 'You lost.' } } }],
    ['🏫 Build them a school', { cash: -1, rep: 8, say: 'A new relationship.' }],
    ['🙅 Ignore it', { rep: -10, say: 'Protests at the gate.' }]
  ]);
  B('goldmine', 'gold_thief', '🕵️', 'Gold is going missing', 'Small amounts every week. Someone inside is stealing.', [
    ['📹 Cameras everywhere', { cash: -0.5, say: 'It stopped.' }],
    ['🕵️ Hire an investigator', { cash: -0.3, chance: { p: 0.7, win: { cash: 0.6, say: 'Caught. Gold returned.' }, lose: { say: 'No luck.' } } }],
    ['🔍 Search everyone', { team: -10, chance: { p: 0.5, win: { say: 'Found it.' }, lose: { say: 'Nothing. Angry miners.' } } }],
    ['🤷 Accept it', { cash: -0.4, say: 'It kept happening.' }]
  ]);

  // 🛢️ OIL COMPANY
  B('oil', 'spill', '🛢️', 'An oil spill in the ocean', 'A pipe broke. Oil is spreading toward a beach.', [
    ['🧹 All-out cleanup', { cash: -2, rep: 5, say: 'The beach was saved.' }],
    ['📢 Take full blame', { cash: -1.5, rep: 8, say: 'People respected it.' }],
    ['⚖️ Blame the pipe maker', { cash: -1, rep: -8, say: 'Nobody cared whose pipe it was.' }],
    ['🤐 Minimize it', { rep: -18, cash: -2, say: 'Photos of oily birds everywhere.' }]
  ]);
  B('oil', 'new_field', '📍', 'Geologists found a new oil field', 'Huge. But it\'s under a nature reserve.', [
    ['⛏️ Drill', { cash: 2, extra: [0.15, 16, 'New field'], rep: -12, say: 'Rich. Hated.' }],
    ['🌳 Leave it alone', { rep: 10, fans: 30, say: 'Nature lovers cheered.' }],
    ['🤝 Drill carefully with rules', { cash: -0.5, extra: [0.1, 16, 'New field'], rep: -4, say: 'A compromise.' }],
    ['💰 Sell the rights', { cash: 2, rep: -3, say: 'Someone else\'s problem.' }]
  ]);
  B('oil', 'price_crash', '📉', 'Oil prices crashed', 'A price war between countries. Oil is cheaper than water.', [
    ['⏸️ Pause drilling', { capacity: [0.7, 6, 'Paused wells'], say: 'Waiting it out.' }],
    ['🛢️ Store oil for later', { cash: -0.8, say: 'Full tanks. Waiting.' }],
    ['☀️ Invest in solar', { cash: -1.5, rep: 8, supply: [-0.02, 30, 'Solar'], say: 'The future.' }],
    ['⛏️ Keep drilling', { demand: [0.75, 6, 'Oil crash'], say: 'Losing money on every barrel.' }]
  ], { kind: 'news' });
  B('oil', 'rig_storm', '🌊', 'A storm is heading to your oil rig', 'Waves ten meters high. Two hundred workers are on it.', [
    ['🚁 Evacuate everyone', { cash: -0.8, closed: [1, 'Storm'], team: 10, say: 'Everyone safe.' }],
    ['⏸️ Stop drilling, stay', { chance: { p: 0.7, win: { say: 'The storm passed.' }, lose: { cash: -2, team: -15, say: 'Damage and injuries.' } } }],
    ['🔧 Secure the rig', { cash: -0.5, say: 'Damage kept small.' }],
    ['⛏️ Keep working', { chance: { p: 0.4, win: { say: 'It passed.' }, lose: { cash: -3, rep: -15, team: -20, say: 'A disaster.' } } }]
  ]);
  B('oil', 'climate_protest', '🌍', 'Climate activists blocked your office', 'Hundreds more outside. Cameras everywhere.', [
    ['🗣️ Invite them in to talk', { rep: 6, say: 'An honest talk. People noticed.' }],
    ['☀️ Promise a green plan', { cash: -1, rep: 8, say: 'Real change.' }],
    ['👮 Call the police', { rep: -8, say: 'Bad photos.' }],
    ['🏠 Work from home today', { say: 'They left by night.' }]
  ]);
  B('oil', 'rig_accident', '🚑', 'An explosion on a rig', 'Three workers hurt. Investigators are coming.', [
    ['🏥 Everything for the injured', { cash: -1, team: 10, rep: 5, say: 'Families were grateful.' }],
    ['🔍 Full independent review', { cash: -0.6, rep: 6, say: 'Found and fixed the cause.' }],
    ['⏸️ Stop all rigs for checks', { closed: [1, 'Safety checks'], rep: 8, say: 'Responsible.' }],
    ['⚖️ Protect the company first', { rep: -12, team: -15, say: 'Workers are furious.' }]
  ]);
  B('oil', 'gas_station_chain', '⛽', 'Buy a gas station chain?', 'A thousand stations for sale. Sell your own oil directly.', [
    ['⛽ Buy it', { cash: -3, extra: [0.12, 20, 'Gas stations'], say: 'Oil to car, all yours.' }],
    ['⚡ Add EV chargers too', { cash: -3.5, extra: [0.12, 20, 'Gas stations'], rep: 5, say: 'Ready for the future.' }],
    ['🤝 A partnership', { extra: [0.05, 20, 'Partner stations'], say: 'Lower risk.' }],
    ['🙅 No', { say: 'You passed.' }]
  ], { minWeek: 20 });

  // 💊 MEDICINE MAKER
  B('pharma', 'trial_fail', '🧪', 'Your big medicine failed its trial', 'Years of work. It didn\'t work well enough.', [
    ['🔬 Try again, improved', { cash: -2, chance: { p: 0.4, win: { extra: [0.3, 8, 'New medicine'], rep: 8, say: 'Second try worked.' }, lose: { say: 'Failed again.' } } }],
    ['🔄 Test it for another illness', { cash: -1, chance: { p: 0.3, win: { extra: [0.3, 8, 'New use'], say: 'It works for something else.' }, lose: { say: 'No luck.' } } }],
    ['📢 Share the data with science', { rep: 8, say: 'Other scientists thanked you.' }],
    ['🚫 Stop the project', { team: -6, say: 'The team is sad.' }]
  ]);
  B('pharma', 'price_scandal', '💊', 'People are angry about your prices', 'A life-saving medicine costs too much. It\'s on the news.', [
    ['📉 Lower the price', { price: -1, rep: 10, say: 'Praised everywhere.' }],
    ['❤️ Free for poor patients', { cash: -0.8, rep: 8, say: 'Families thanked you.' }],
    ['📢 Explain the research costs', { chance: { p: 0.4, win: { rep: 2, say: 'Some understood.' }, lose: { rep: -8, say: 'Nobody cared.' } } }],
    ['🤷 Keep the price', { rep: -12, say: 'The government is watching you.' }]
  ]);
  B('pharma', 'breakthrough', '🎉', 'Your scientists found a cure', 'For a rare disease. Families have waited decades.', [
    ['🌍 Make it affordable', { rep: 15, fans: 60, demand: [1.1, 16, 'The cure'], say: 'Heroes.' }],
    ['💰 Premium price', { extra: [0.3, 8, 'The cure'], rep: -5, say: 'Profitable. Criticized.' }],
    ['🏆 Credit {a}', { a: 20, rep: 8, say: '{a} is a science star.' }],
    ['🤝 Share it with the world', { rep: 20, fans: 80, say: 'History books will remember you.' }]
  ], { rarity: 'rare', who: { a: 'front' } });
  B('pharma', 'side_effects', '⚠️', 'Patients report side effects', 'A popular medicine. Some people are getting headaches.', [
    ['🔬 Investigate now', { cash: -0.5, rep: 5, say: 'Found and fixed.' }],
    ['⚠️ New warning label', { cash: -0.2, rep: 3, say: 'Honest.' }],
    ['📢 Recall it', { cash: -1.5, rep: 8, say: 'Safe and responsible.' }],
    ['🤐 Say it\'s rare', { chance: { p: 0.5, win: { say: 'It was rare.' }, lose: { rep: -15, say: 'It wasn\'t. Lawsuits.' } } }]
  ]);
  B('pharma', 'lab_fire', '🔥', 'A fire in the lab', 'Samples destroyed. Months of research gone.', [
    ['🏗️ Rebuild better', { cash: -1.5, equip: 0.03, say: 'Safer lab.' }],
    ['💾 Backup data saved some', { cash: -0.5, say: 'Not everything was lost.' }],
    ['❤️ Support the team', { team: 12, say: 'The team started again, together.' }],
    ['📄 Insurance', { chance: { p: function (g) { return g.flags.insured ? 0.9 : 0.4; }, win: { cash: -0.2, say: 'Covered.' }, lose: { cash: -1.2, say: 'Not covered.' } } }]
  ]);
  B('pharma', 'generic', '💊', 'Your patent expires', 'Cheap copies of your best medicine can now be made by anyone.', [
    ['📉 Lower the price', { price: -1, say: 'You kept your buyers.' }],
    ['🆕 Launch an improved version', { cash: -1, demand: [1.08, 16, 'New version'], say: 'A new patent.' }],
    ['🏭 Make your own cheap copy', { cash: -0.3, demand: [1.05, 16, 'Own generic'], say: 'Smart.' }],
    ['🤷 Accept it', { demand: [0.85, 12, 'Generics'], say: 'Sales dropped.' }]
  ]);
  B('pharma', 'pandemic', '🦠', 'A new virus is spreading', 'The world needs a vaccine fast.', [
    ['💉 Race to make a vaccine', { cash: -2, chance: { p: 0.5, win: { rep: 20, fans: 100, extra: [0.4, 6, 'Vaccine'], say: 'You saved millions.' }, lose: { rep: 3, say: 'Another company got there first.' } } }],
    ['🤝 Team up with others', { cash: -1, rep: 12, extra: [0.2, 6, 'Shared vaccine'], say: 'Together, faster.' }],
    ['🏭 Make masks and tests', { extra: [0.2, 6, 'Masks and tests'], rep: 5, say: 'You helped.' }],
    ['💼 Business as usual', { rep: -8, say: 'People noticed you didn\'t help.' }]
  ], { rarity: 'rare', minWeek: 20 });

  // 🏘️ REAL ESTATE
  B('realestate', 'housing_crash', '📉', 'House prices are crashing', 'Nobody is buying. Your listings sit empty.', [
    ['🏷️ Cut prices', { price: -1, say: 'Some sold.' }],
    ['🏠 Buy cheap houses now', { cash: -2, chance: { p: 0.6, win: { cash: 4, say: 'Prices bounced back. Huge profit.' }, lose: { cash: -0.5, say: 'Prices kept falling.' } } }],
    ['🔑 Switch to rentals', { extra: [0.08, 16, 'Rentals'], say: 'Steady rent money.' }],
    ['⏳ Wait', { demand: [0.8, 8, 'Crash'], say: 'Slow months.' }]
  ], { kind: 'news' });
  B('realestate', 'mansion', '🏰', 'Sell a famous mansion', 'A movie star\'s old mansion. The commission would be huge.', [
    ['📸 Big luxury campaign', { cash: -0.3, chance: { p: 0.6, win: { cash: 3, fans: 30, say: 'Sold to a billionaire.' }, lose: { say: 'No buyer yet.' } } }],
    ['🎉 Exclusive party viewing', { cash: -0.5, chance: { p: 0.7, win: { cash: 3, fans: 40, say: 'Sold at the party.' }, lose: { fans: 20, say: 'Great party. No sale.' } } }],
    ['🤝 Share with another agent', { cash: 1.5, say: 'Half the commission.' }],
    ['🙅 Too much work', { say: 'Another agent sold it.' }]
  ], { rarity: 'rare' });
  B('realestate', 'bad_landlord', '🏚️', 'Tenants say a building you manage is unsafe', 'Mold, broken heaters, no hot water.', [
    ['🔧 Fix everything now', { cash: -1, rep: 8, say: 'Tenants are grateful.' }],
    ['📞 Force the owner to fix it', { chance: { p: 0.6, win: { rep: 5, say: 'The owner paid.' }, lose: { rep: -3, say: 'He refused.' } } }],
    ['🚫 Drop the building', { demand: [0.95, 8, 'Lost building'], rep: 4, say: 'Your name is clean.' }],
    ['🤷 Not your problem', { rep: -10, say: 'The news called you a slumlord.' }]
  ]);
  B('realestate', 'new_district', '🏗️', 'The city is building a new district', 'Offices, parks, metro. Land is cheap now.', [
    ['💰 Buy lots of land', { cash: -3, chance: { p: 0.7, win: { cash: 6, say: 'Land prices tripled.' }, lose: { cash: 1, say: 'Slower than hoped.' } } }],
    ['🏠 Build homes there', { cash: -2, extra: [0.12, 16, 'New district'], say: 'Selling fast.' }],
    ['🤝 Partner with the city', { cash: -1, rep: 5, extra: [0.06, 16, 'City partner'], say: 'Safe and respected.' }],
    ['🙅 Wait', { say: '{rival} bought it all.' }]
  ], { init: rival });
  B('realestate', 'fake_listing', '🕵️', '{a} posted fake listings', 'To get more calls. Customers are angry.', [
    ['🚪 Fire {a}', { fire: 'a', rep: 4, say: 'Clean agency.' }],
    ['🙏 Apologize publicly', { rep: 1, a: -8, say: 'Customers accepted it.' }],
    ['📋 Check every listing', { cash: -0.2, rep: 3, say: 'All real now.' }],
    ['🤐 Delete them quietly', { rep: -5, say: 'Screenshots were out.' }]
  ], FRONT);
  B('realestate', 'bidding_war', '🔥', 'A bidding war on a house', 'Twelve buyers. Prices are going crazy.', [
    ['📈 Let it run', { cash: 1.5, say: 'Sold way over price.' }],
    ['🤝 Pick the family, not the money', { cash: 0.8, rep: 6, say: 'A young family got their dream home.' }],
    ['⏰ Final bids by tonight', { cash: 1.2, say: 'Clean and fast.' }],
    ['🏠 Show them other houses', { extra: [0.1, 4, 'More sales'], say: 'Three more sales.' }]
  ]);
  B('realestate', 'office_empty', '🏢', 'Offices are empty', 'Everyone works from home now. Your office buildings are half empty.', [
    ['🏠 Turn them into apartments', { cash: -2, extra: [0.12, 20, 'Apartments'], say: 'Full again.' }],
    ['☕ Shared workspaces', { cash: -0.8, extra: [0.07, 16, 'Coworking'], say: 'Freelancers love it.' }],
    ['📉 Lower office rents', { price: -1, say: 'Some filled up.' }],
    ['⏳ Wait', { demand: [0.85, 12, 'Empty offices'], say: 'Still empty.' }]
  ]);

  // 🚢 SHIPPING
  B('shipping', 'stuck_canal', '🚢', 'Your ship is stuck in a canal', 'Sideways. Blocking hundreds of ships. The world is watching.', [
    ['🚜 Hire every digger', { cash: -1, rep: -3, say: 'Free in six days.' }],
    ['🌊 Wait for high tide', { chance: { p: 0.5, win: { say: 'Floated free.' }, lose: { cash: -1.5, rep: -6, say: 'Still stuck. Fines pile up.' } } }],
    ['📢 Apologize to the world', { rep: 2, fans: 30, say: 'People made memes. And forgave you.' }],
    ['⚖️ Blame the wind', { rep: -5, say: 'The world laughed at you.' }]
  ], { rarity: 'rare' });
  B('shipping', 'pirates', '🏴‍☠️', 'Pirates took one of your ships', 'The crew is being held for ransom.', [
    ['💰 Pay the ransom', { cash: -2, team: 10, say: 'The crew came home safe.' }],
    ['🪖 Ask the navy for help', { chance: { p: 0.6, win: { rep: 8, team: 12, say: 'Rescued. No ransom.' }, lose: { cash: -2.5, say: 'It failed. You paid more.' } } }],
    ['🤝 Negotiate', { chance: { p: 0.6, win: { cash: -1, team: 8, say: 'Half the price.' }, lose: { cash: -2, say: 'They didn\'t move.' } } }],
    ['🛡️ Armed guards on all ships', { cash: -1.5, team: 5, say: 'Never again.' }]
  ]);
  B('shipping', 'container_lost', '🌊', 'Containers fell into the ocean', 'A storm knocked forty containers overboard.', [
    ['💸 Pay the clients', { cash: -1.5, rep: 5, say: 'Clients stayed.' }],
    ['📄 Insurance', { chance: { p: function (g) { return g.flags.insured ? 0.9 : 0.4; }, win: { cash: -0.3, say: 'Covered.' }, lose: { cash: -1.5, say: 'Not covered.' } } }],
    ['🧹 Clean up the ocean', { cash: -0.8, rep: 8, say: 'The right thing.' }],
    ['🔒 Better lashing systems', { cash: -0.5, equip: 0.02, say: 'Safer ships.' }]
  ]);
  B('shipping', 'port_strike', '✊', 'Port workers are on strike', 'Your ships can\'t unload. Clients are waiting.', [
    ['🗺️ Use another port', { cash: -0.6, say: 'Longer route, but moving.' }],
    ['⏳ Wait', { capacity: [0.7, 3, 'Port strike'], say: 'Everything stuck.' }],
    ['🤝 Help both sides talk', { chance: { p: 0.4, win: { rep: 6, say: 'The strike ended.' }, lose: { capacity: [0.7, 3, 'Port strike'], say: 'Talks failed.' } } }],
    ['✈️ Fly urgent cargo', { cash: -1, rep: 4, say: 'Clients were impressed.' }]
  ]);
  B('shipping', 'mega_ship', '🛳️', 'Buy the world\'s biggest ship?', 'Twice the containers. A fortune to buy.', [
    ['🛳️ Buy it', { cash: -4, capacity: [1.25, 30, 'Mega ship'], say: 'The biggest ship on the sea.' }],
    ['🤝 Share it with a partner', { cash: -2, capacity: [1.12, 30, 'Shared ship'], say: 'Half the cost.' }],
    ['🚢 Two normal ships', { cash: -2.5, capacity: [1.15, 30, 'New ships'], say: 'Flexible.' }],
    ['🙅 Not now', { say: 'You passed.' }]
  ], { minWeek: 20 });
  B('shipping', 'green_fuel', '🌱', 'New rules on ship pollution', 'Ships must use cleaner fuel by next year.', [
    ['🌱 Switch now', { cash: -1.5, supply: [0.02, 30, 'Clean fuel'], rep: 8, say: 'Ahead of everyone.' }],
    ['⏳ Switch at the deadline', { say: 'Just in time.' }],
    ['⛵ Test wind sails', { cash: -0.8, supply: [-0.03, 30, 'Wind sails'], rep: 6, fans: 20, say: 'Sails on cargo ships. People love it.' }],
    ['🙈 Ignore it', { chance: { p: 0.3, win: { say: 'Nobody checked.' }, lose: { cash: -2, rep: -8, say: 'Huge fines.' } } }]
  ], { kind: 'news' });
  B('shipping', 'captain_drunk', '🍺', 'Captain {a} was drunk on duty', 'A crew member reported it. The ship is in port.', [
    ['🚪 Fire {a}', { fire: 'a', rep: 4, say: 'Safety first.' }],
    ['🏥 Get {a} help', { a: 10, capacity: [0.95, 4, '{a} in treatment'], rep: 3, say: '{a} is getting better.' }],
    ['⚠️ Final warning', { a: -10, say: '{a} promised to stop.' }],
    ['🤐 Hush it up', { chance: { p: 0.5, win: { say: 'It stayed quiet.' }, lose: { rep: -12, say: 'The crew went to the press.' } } }]
  ], FRONT);

  // 📲 SOCIAL MEDIA APP
  B('socialapp', 'fake_news', '📰', 'Fake news is spreading on your app', 'A false story is going viral. The government wants action.', [
    ['🚩 Label it false', { rep: 5, fans: -10, say: 'Some users were angry.' }],
    ['🗑️ Remove it', { rep: 3, fans: -15, say: 'Some called it censorship.' }],
    ['🧑‍⚖️ Hire fact-checkers', { cash: -0.8, rep: 8, say: 'A trusted app.' }],
    ['🤷 Free speech', { fans: 10, rep: -10, say: 'Advertisers left.' }]
  ]);
  B('socialapp', 'teen_safety', '🧒', 'Parents say your app is bad for kids', 'A big report. Teens are addicted and unhappy.', [
    ['⏰ Time limits for teens', { fans: -10, rep: 10, say: 'Parents praised you.' }],
    ['👪 Parent controls', { cash: -0.5, rep: 8, say: 'Parents feel safer.' }],
    ['📢 Defend your app', { chance: { p: 0.3, win: { say: 'People accepted it.' }, lose: { rep: -8, say: 'Parents are furious.' } } }],
    ['🤐 Ignore it', { rep: -12, say: 'A government hearing.' }]
  ]);
  B('socialapp', 'viral_feature', '✨', 'A new feature went viral', 'A filter everyone is using. Millions of new users.', [
    ['🖥️ More servers now', { cash: -1, fans: 100, say: 'It held.' }],
    ['📢 Push it everywhere', { fans: 80, chance: { p: 0.6, win: { say: 'Smooth.' }, lose: { rep: -5, say: 'The app crashed.' } } }],
    ['💰 Paid version of the filter', { extra: [0.1, 8, 'Premium filter'], fans: 50, say: 'Some paid.' }],
    ['😌 Enjoy it', { fans: 60, say: 'Nice.' }]
  ]);
  B('socialapp', 'data_hearing', '🏛️', 'You must testify to the government', 'About how you use people\'s data. Live on TV.', [
    ['🗣️ Be totally honest', { rep: 8, say: 'People respected it.' }],
    ['📜 Promise big changes', { cash: -0.8, rep: 6, say: 'Real changes.' }],
    ['🧑‍⚖️ Let lawyers answer', { rep: -6, say: 'You looked like you were hiding.' }],
    ['😬 Wing it', { chance: { p: 0.4, win: { rep: 4, say: 'You did great.' }, lose: { rep: -8, fans: -20, say: 'A disaster. Memes everywhere.' } } }]
  ], { minWeek: 20 });
  B('socialapp', 'influencer_leaves', '📱', 'The top creator is leaving for {rival}', 'Fifty million followers. They\'ll take fans with them.', [
    ['💰 Pay them to stay', { cash: -1.5, say: 'They stayed.' }],
    ['🎁 Special creator tools', { cash: -0.5, chance: { p: 0.6, win: { rep: 4, say: 'They stayed for the tools.' }, lose: { fans: -40, say: 'They left.' } } }],
    ['🌟 Promote new creators', { fans: 20, rep: 3, say: 'New stars rose.' }],
    ['👋 Let them go', { fans: -30, rival: 0.05, say: '{rival} got stronger.' }]
  ], { init: rival });
  B('socialapp', 'bots', '🤖', 'Your app is full of bots', 'A report says 20% of users are fake.', [
    ['🧹 Delete them all', { fans: -40, rep: 10, say: 'Smaller, but real.' }],
    ['🔍 Better checks for new users', { cash: -0.4, rep: 5, say: 'Fewer bots.' }],
    ['📢 Deny it', { rep: -8, say: 'Advertisers didn\'t believe you.' }],
    ['🤷 More users is more users', { rep: -10, say: 'Advertisers pulled out.' }]
  ]);
  B('socialapp', 'outage', '🔌', 'The app is down worldwide', 'Hours. Everyone is talking about it on other apps.', [
    ['🧑‍💻 Everyone on it', { team: -8, say: 'Back in four hours.' }],
    ['📢 Honest updates', { rep: 4, say: 'Users appreciated it.' }],
    ['🎁 A free week of premium', { cash: -0.5, fans: 20, say: 'Users forgave you.' }],
    ['🔧 New systems', { cash: -1.5, equip: 0.03, say: 'Never again.' }]
  ]);

  // 🥤 SODA COMPANY
  B('soda', 'sugar_tax', '📜', 'A new sugar tax on soda', 'Every can will cost more.', [
    ['🍋 Zero-sugar recipes', { cash: -0.6, rep: 5, demand: [1.05, 16, 'Zero sugar'], say: 'Healthier and tax-free.' }],
    ['📈 Pass on the price', { price: 1, say: 'Fewer sales.' }],
    ['📢 Fight the tax', { chance: { p: 0.3, win: { rep: 2, say: 'It was delayed.' }, lose: { rep: -5, say: 'People saw you as greedy.' } } }],
    ['😬 Absorb it', { supply: [0.05, 12, 'Sugar tax'], say: 'Thinner profits.' }]
  ], { kind: 'news' });
  B('soda', 'new_flavor', '🧪', 'A crazy new flavor idea', '{a} made a mango chili soda. The team is split.', [
    ['🚀 Launch it', { cash: -0.5, chance: { p: 0.5, win: { demand: [1.12, 8, 'New flavor'], fans: 40, say: 'A cult hit.' }, lose: { say: 'Too weird.' } } }],
    ['🔢 Limited edition', { cash: -0.2, extra: [0.1, 4, 'Limited flavor'], fans: 20, say: 'Sold out.' }],
    ['🗳️ Let fans vote', { fans: 30, say: 'Fans loved being asked.' }],
    ['🙅 No', { a: -8, say: '{a} is disappointed.' }]
  ], FRONT);
  B('soda', 'contaminated', '⚠️', 'Something was found in a can', 'A customer found a piece of plastic. The photo is everywhere.', [
    ['📢 Recall the batch', { cash: -1, rep: 6, say: 'Responsible.' }],
    ['🔍 Investigate', { chance: { p: 0.5, win: { rep: 3, say: 'It was a fake claim.' }, lose: { cash: -1, rep: -3, say: 'It was real. Late recall.' } } }],
    ['🎁 Gift to the customer', { cash: -0.05, say: 'They deleted the photo.' }],
    ['🤐 Ignore it', { rep: -10, say: 'More photos appeared.' }]
  ]);
  B('soda', 'world_cup', '⚽', 'Sponsor the world cup?', 'Billions of viewers. The price is huge.', [
    ['⚽ Sponsor', { cash: -3, fans: 150, demand: [1.12, 12, 'World cup'], say: 'Your logo in every home.' }],
    ['📺 TV ads only', { cash: -1, fans: 60, say: 'Good reach.' }],
    ['🥤 Special edition cans', { extra: [0.15, 4, 'World cup cans'], fans: 30, say: 'Collectors went crazy.' }],
    ['🙅 Too expensive', { say: '{rival} took it.' }]
  ], { rarity: 'rare', minWeek: 20, init: rival });
  B('soda', 'plastic', '♻️', 'Your bottles are found on beaches', 'An environmental group put your logo on a beach trash photo.', [
    ['♻️ 100% recycled bottles', { cash: -1, rep: 10, say: 'Praised.' }],
    ['🧹 Beach cleanups', { cash: -0.3, rep: 6, fans: 20, say: 'Great photos.' }],
    ['🥫 Switch to cans', { cash: -0.8, rep: 8, say: 'Cans recycle better.' }],
    ['🤷 Not our fault', { rep: -8, say: 'People disagree.' }]
  ]);
  B('soda', 'secret_formula', '🔐', 'Someone is selling your secret formula', 'An ex-worker is offering it online.', [
    ['⚖️ Sue', { cash: -0.5, chance: { p: 0.7, win: { say: 'Stopped.' }, lose: { say: 'It leaked.' } } }],
    ['👮 Police', { rep: 3, say: 'Arrested.' }],
    ['😏 "It\'s fake"', { fans: 15, say: 'Nobody knows the truth.' }],
    ['🧪 Change the formula', { cash: -0.3, chance: { p: 0.5, win: { say: 'Nobody noticed.' }, lose: { happy: -8, say: 'Fans hate the new taste.' } } }]
  ]);
  B('soda', 'energy_drink', '⚡', 'Launch an energy drink?', 'Energy drinks sell like crazy. But doctors warn about kids.', [
    ['⚡ Launch for adults only', { cash: -0.6, demand: [1.1, 16, 'Energy drink'], say: 'Selling fast.' }],
    ['🍵 A natural energy drink', { cash: -0.8, demand: [1.06, 16, 'Natural energy'], rep: 4, say: 'Healthy and popular.' }],
    ['🎮 Target gamers', { cash: -0.5, demand: [1.12, 16, 'Gamer drink'], rep: -4, say: 'Parents are unhappy.' }],
    ['🙅 No', { say: 'You passed.' }]
  ]);

  // 🚀 SPACE COMPANY
  B('space', 'launch_fail', '💥', 'Your rocket exploded on launch', 'No crew on board. Millions watched live.', [
    ['🔍 Find what went wrong', { cash: -1, rep: 4, say: 'Fixed. Next one will fly.' }],
    ['📢 "We learn from every failure"', { rep: 6, fans: 20, say: 'People respected it.' }],
    ['🚀 Launch again next month', { cash: -2, chance: { p: 0.7, win: { fans: 80, rep: 8, say: 'Perfect launch.' }, lose: { rep: -10, say: 'Another failure.' } } }],
    ['🤐 Say nothing', { rep: -8, say: 'Investors are worried.' }]
  ]);
  B('space', 'moon_contract', '🌕', 'The space agency wants you on the moon', 'The biggest contract in your history.', [
    ['✍️ Sign', { extra: [0.2, 12, 'Moon mission'], team: -8, fans: 80, say: 'Going to the moon.' }],
    ['🤝 Share with another company', { extra: [0.1, 12, 'Moon mission'], fans: 40, say: 'Safer.' }],
    ['📈 Ask for more money', { chance: { p: 0.4, win: { extra: [0.28, 12, 'Moon mission'], say: 'They agreed.' }, lose: { say: '{rival} got it.' } } }],
    ['🙅 Not ready', { say: 'You passed.' }]
  ], { minWeek: 15, init: rival });
  B('space', 'space_tourist', '👩‍🚀', 'A billionaire wants to fly to space', 'She\'ll pay a fortune for a seat.', [
    ['🚀 Fly her', { chance: { p: 0.85, win: { cash: 4, fans: 60, say: 'A perfect flight.' }, lose: { cash: -1, rep: -12, say: 'An emergency landing.' } } }],
    ['🎟️ Sell more seats', { extra: [0.3, 4, 'Space tourism'], fans: 40, say: 'A waiting list.' }],
    ['🔬 Science only', { rep: 6, say: 'Scientists love you.' }],
    ['📺 Film it for TV', { cash: 2, fans: 100, say: 'Millions watched.' }]
  ]);
  B('space', 'satellite_debris', '🛰️', 'Your old satellite is falling', 'It could land anywhere. People are scared.', [
    ['🎯 Steer it into the ocean', { cash: -1, rep: 6, say: 'Safe landing.' }],
    ['📢 Explain the risk is tiny', { chance: { p: 0.6, win: { say: 'It burned up.' }, lose: { rep: -5, say: 'A piece hit a farm.' } } }],
    ['🧹 Space cleanup program', { cash: -2, rep: 10, say: 'Leaders in clean space.' }],
    ['🤞 Hope for the best', { chance: { p: 0.7, win: { say: 'It burned up.' }, lose: { rep: -12, say: 'It hit a town.' } } }]
  ]);
  B('space', 'astronaut_sick', '🩺', 'An astronaut is sick in space', 'On your space station. A doctor says bring them home.', [
    ['🚀 Emergency return', { cash: -1.5, rep: 10, say: 'Home safe.' }],
    ['🩺 Treat them up there', { chance: { p: 0.6, win: { rep: 5, say: 'They recovered.' }, lose: { cash: -2, rep: -8, say: 'Rushed home, too late to be easy.' } } }],
    ['📞 Call the best doctors', { cash: -0.3, chance: { p: 0.7, win: { rep: 6, say: 'Recovered.' }, lose: { cash: -1.5, say: 'Had to come home.' } } }],
    ['⏳ Finish the mission first', { rep: -10, say: 'People think you care more about money.' }]
  ]);
  B('space', 'mars_plan', '🔴', 'Announce a mission to Mars?', 'It would take ten years and a fortune.', [
    ['🔴 Announce it', { fans: 200, rep: 8, cash: -2, say: 'The world is watching you.' }],
    ['🤫 Start quietly', { cash: -1, equip: 0.04, say: 'Real work, no hype.' }],
    ['🤝 Partner with countries', { cash: -0.5, rep: 12, say: 'A global mission.' }],
    ['🙅 Too early', { say: 'Maybe someday.' }]
  ], { rarity: 'rare', minWeek: 30 });
  B('space', 'engineer_genius', '🧠', '{a} designed a reusable rocket', 'It could cut launch costs in half.', [
    ['🚀 Build it', { cash: -2, equip: 0.08, a: 20, say: 'Launch costs halved.' }],
    ['🏆 Promote {a}', { promote: 'a', a: 20, say: '{a} leads the rocket team.' }],
    ['🔒 Patent it', { cash: -0.2, say: 'It\'s yours.' }],
    ['💰 Sell the design', { cash: 3, a: -15, say: '{a} feels betrayed.' }]
  ], FRONT);

  // 💻 TECH GIANT
  B('tech', 'phone_launch', '📱', 'Launch day for your new phone', 'The world is watching. Is it ready?', [
    ['🎤 A huge live show', { cash: -0.8, chance: { p: 0.7, win: { fans: 100, extra: [0.3, 4, 'Launch'], say: 'Record sales.' }, lose: { fans: 20, rep: -5, say: 'The demo crashed on stage.' } } }],
    ['📦 Quiet online launch', { extra: [0.15, 4, 'Launch'], say: 'Solid sales.' }],
    ['⏳ Delay for polish', { rep: 3, say: 'Better phone, later.' }],
    ['🎁 Free upgrade for old buyers', { cash: -1, rep: 8, fans: 50, say: 'Loyal fans for life.' }]
  ]);
  B('tech', 'antitrust', '⚖️', 'The government says you\'re too big', 'They want to break up your company.', [
    ['⚖️ Fight it', { cash: -1.5, chance: { p: 0.5, win: { say: 'You won.' }, lose: { cash: -2, demand: [0.9, 12, 'Split up'], say: 'Part of your company was split off.' } } }],
    ['🤝 Offer changes', { cash: -0.5, rep: 4, say: 'A deal.' }],
    ['📢 Go to the public', { chance: { p: 0.5, win: { fans: 40, say: 'People took your side.' }, lose: { rep: -5, say: 'People took their side.' } } }],
    ['✂️ Sell a division', { cash: 2, say: 'Smaller, safer.' }]
  ], { minWeek: 25 });
  B('tech', 'battery_fire', '🔥', 'Your laptops are catching fire', 'Three fires reported. Airlines are banning your laptop.', [
    ['📢 Recall every laptop', { cash: -3, rep: 10, say: 'Expensive. Trusted.' }],
    ['🔧 Software fix', { cash: -0.3, chance: { p: 0.5, win: { say: 'It worked.' }, lose: { cash: -3, rep: -10, say: 'More fires.' } } }],
    ['🔍 Investigate', { cash: -0.5, rep: 3, say: 'Found the bad part.' }],
    ['🤐 Deny it', { rep: -20, say: 'The biggest scandal of your career.' }]
  ]);
  B('tech', 'ai_race', '🤖', 'Everyone is racing to build AI', 'Your rivals are spending billions. You\'re falling behind.', [
    ['💰 Spend big', { cash: -3, equip: 0.08, fans: 60, say: 'You\'re in the race.' }],
    ['🛒 Buy an AI startup', { cash: -2, equip: 0.06, say: 'A shortcut.' }],
    ['🛡️ Focus on safe AI', { cash: -1, rep: 10, equip: 0.03, say: 'Trusted AI.' }],
    ['🙅 Stay out', { demand: [0.9, 16, 'Behind in AI'], say: 'Investors are worried.' }]
  ]);
  B('tech', 'whistleblower', '📣', '{a} says you spy on users', 'An engineer went to the press.', [
    ['🔍 Investigate honestly', { cash: -0.5, rep: 6, say: 'You found a problem. Fixed.' }],
    ['🙏 Thank {a}', { a: 20, rep: 10, say: 'Rare honesty. Praised.' }],
    ['⚖️ Sue {a}', { rep: -15, say: 'Everyone sided with {a}.' }],
    ['📢 Deny everything', { chance: { p: 0.3, win: { say: 'It blew over.' }, lose: { rep: -12, say: 'Documents leaked.' } } }]
  ], FRONT);
  B('tech', 'chip_factory', '🏭', 'Build your own chip factory?', 'Never depend on others again. It costs billions.', [
    ['🏭 Build it', { cash: -4, supply: [-0.06, 30, 'Own chips'], equip: 0.04, say: 'Independent.' }],
    ['🤝 Share with a partner', { cash: -2, supply: [-0.03, 30, 'Shared chips'], say: 'Half the cost.' }],
    ['📜 Long contract with a supplier', { supply: [-0.02, 20, 'Chip contract'], say: 'Safe supply.' }],
    ['🙅 No', { say: 'You passed.' }]
  ], { minWeek: 20 });
  B('tech', 'hacker_bounty', '🔓', 'A hacker found a huge bug', 'She could have stolen data. Instead, she told you.', [
    ['💰 Big reward', { cash: -0.3, rep: 8, say: 'Hackers now report to you first.' }],
    ['💼 Hire her', { hireSpecial: { role: 'front', skill: 90 }, rep: 6, say: 'A security star.' }],
    ['🔧 Fix it quietly', { rep: 1, say: 'Fixed.' }],
    ['⚖️ Report her to police', { rep: -12, say: 'The hacking world hates you now.' }]
  ]);

  // 🎢 THEME PARK
  B('themepark', 'ride_stuck', '🎢', 'A roller coaster stopped at the top', 'Twenty people stuck upside down. Cameras everywhere.', [
    ['🧑‍🚒 Rescue team now', { cash: -0.3, rep: 3, say: 'Everyone down safe.' }],
    ['🎟️ Free VIP passes for them', { cash: -0.2, rep: 6, fans: 20, say: 'They laughed about it after.' }],
    ['🔒 Close the ride for checks', { capacity: [0.9, 4, 'Ride closed'], rep: 4, say: 'Safe.' }],
    ['🔧 Restart it', { chance: { p: 0.6, win: { say: 'It worked.' }, lose: { rep: -12, say: 'It stopped again. Worse.' } } }]
  ]);
  B('themepark', 'new_ride', '🆕', 'Build the tallest ride in the world?', 'A record-breaking coaster. Huge cost, huge crowds.', [
    ['🎢 Build it', { cash: -3, demand: [1.15, 20, 'Record ride'], fans: 100, say: 'Lines for hours.' }],
    ['🎠 A family ride instead', { cash: -1, demand: [1.08, 20, 'Family ride'], say: 'Families love it.' }],
    ['🥽 VR ride', { cash: -0.8, demand: [1.06, 16, 'VR ride'], say: 'Cheap and cool.' }],
    ['🙅 Not now', { say: 'You passed.' }]
  ], { minWeek: 15 });
  B('themepark', 'heatwave', '🥵', 'A heatwave hits the park', 'Visitors are fainting in the lines.', [
    ['💧 Free water and shade', { cash: -0.3, rep: 6, say: 'Everyone felt cared for.' }],
    ['🌊 Open the water park', { extra: [0.2, 2, 'Water park'], say: 'Packed.' }],
    ['🌙 Open at night', { team: -5, extra: [0.15, 2, 'Night hours'], say: 'Cooler and fun.' }],
    ['🤷 Normal hours', { rep: -6, say: 'Ambulances came.' }]
  ], { cond: function (g) { var w = ((g.week - 1) % 52) + 1; return w >= 24 && w <= 36; } });
  B('themepark', 'mascot_scandal', '🐭', 'Your mascot was filmed being rude', 'Someone in the costume pushed a kid. It\'s viral.', [
    ['🚪 Fire the worker', { rep: 4, say: 'Quick action.' }],
    ['🙏 Apologize to the family', { cash: -0.1, rep: 5, say: 'The family forgave you.' }],
    ['🎓 New mascot training', { cash: -0.2, rep: 3, say: 'Better mascots.' }],
    ['🤐 Say nothing', { rep: -10, say: 'Parents are angry.' }]
  ]);
  B('themepark', 'movie_license', '🎬', 'A movie studio offers a themed land', 'Rides from the biggest film series in the world.', [
    ['✍️ Sign', { cash: -3, demand: [1.15, 20, 'Movie land'], fans: 120, say: 'Fans travel from everywhere.' }],
    ['🤝 A smaller deal', { cash: -1, demand: [1.07, 16, 'Movie ride'], say: 'One ride. Popular.' }],
    ['🎨 Your own characters', { cash: -1.5, rep: 6, fans: 40, say: 'Your own world.' }],
    ['🙅 No', { say: '{rival} signed it.' }]
  ], { minWeek: 20, init: rival });
  B('themepark', 'lost_child', '🧒', 'A child is lost in the park', 'Her parents are panicking. The park is packed.', [
    ['🚨 Close the gates and search', { capacity: [0.9, 1, 'Search'], rep: 8, say: 'Found in ten minutes.' }],
    ['📢 Announce it everywhere', { rep: 5, say: 'Found fast.' }],
    ['📹 Check the cameras', { rep: 4, say: 'Found at the ice cream stand.' }],
    ['🤷 Normal procedure', { rep: 1, say: 'Found after an hour.' }]
  ]);
  B('themepark', 'season_pass', '🎟️', 'Launch a season pass?', 'Cheap, unlimited visits. Could bring loyal fans or kill ticket sales.', [
    ['🎟️ Launch it', { cash: 1.5, demand: [1.1, 16, 'Season pass'], say: 'Families bought them everywhere.' }],
    ['👑 Premium pass', { cash: 1, fans: 30, say: 'Fans love the perks.' }],
    ['🧪 Test in winter', { cash: 0.5, say: 'A good start.' }],
    ['🙅 No', { say: 'Tickets only.' }]
  ]);
})();
