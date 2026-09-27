// Events that only happen in one kind of business, part 3: the large businesses.
// B(business, id, icon, title, text, [4 x [answer, effect]], extra fields) — defined in events-biz1.js.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var B = CS.biz, H = CS.EVH, rival = H.rival, FRONT = { who: { a: 'front' } };

  // 🚗 CAR MAKER
  B('cars', 'brake_recall', '⚠️', 'A brake problem in 10,000 cars', 'Your engineers found a small problem with the brakes in last year\'s model. Nobody has been hurt... yet.', [
    ['⚠️ Recall every car now', { cash: -2, rep: 8, say: 'Expensive, but people trust you more than ever. ⚠️' }],
    ['🔧 Fix it at the next service', { cash: -0.8, rep: 2, say: 'Quietly fixed over time. 🔧' }],
    ['📢 Free fix + a thank-you gift', { cash: -2.5, rep: 12, fans: 20, say: 'Customers LOVE how you handled it! 📢' }],
    ['🙈 Say nothing', { chance: { p: 0.3, win: { say: 'Nobody noticed. (Very risky!) 🙈' }, lose: { rep: -20, cash: -3, say: 'The news found out. HUGE scandal. 😱' } } }]
  ]);
  B('cars', 'go_electric', '🔌', 'Go all-electric?', 'Electric cars are the future. Your engineers say you could stop making gas cars in 5 years. It will cost a fortune.', [
    ['🔌 All-in on electric!', { cash: -3, demand: [1.2, 104, 'Electric future'], rep: 8, say: 'Your electric cars are selling like crazy! 🔌' }],
    ['🔋 One electric model first', { cash: -1, demand: [1.08, 52, 'First electric car'], rep: 3, say: 'A good first step! 🔋' }],
    ['⚡ Hybrid cars', { cash: -0.8, demand: [1.06, 52, 'Hybrids'], say: 'Half electric, half gas. 🚗' }],
    ['⛽ Gas cars forever', { rep: -4, say: 'Some customers moved to other brands. ⛽' }]
  ]);
  B('cars', 'self_driving', '🤖', 'The self-driving car drove into a lake', 'Your self-driving test car followed a map that was wrong... and drove straight into a lake. Nobody was inside. It\'s floating. 🚗💦', [
    ['🔧 More testing before selling', { cash: -0.8, rep: 3, say: 'Safer software! 🔧' }],
    ['😂 "Now it\'s also a boat!"', { fans: 30, rep: -2, say: 'Funny ad. Investors didn\'t laugh. 😂' }],
    ['🗺️ Make your own better maps', { cash: -1, equip: 0.03, say: 'No more lakes! 🗺️' }],
    ['⏸️ Pause the whole project', { rep: 1, say: 'Maybe later. ⏸️' }]
  ]);
  B('cars', 'car_show', '🏁', 'The big car show!', 'At the world\'s biggest car show, you can reveal a new car. Everyone will be watching!', [
    ['🚀 Show a wild concept car', { cash: -1, fans: 40, demand: [1.1, 12, 'Concept car buzz'], say: 'A car shaped like a shark! Everyone went crazy! 🦈🚗' }],
    ['🚗 Show a normal, affordable car', { cash: -0.5, demand: [1.12, 20, 'Affordable car'], say: 'Lots of real orders! 🚗' }],
    ['🎤 A celebrity reveal', { cash: -1.2, fans: 50, say: 'A movie star drove it on stage! 🎤' }],
    ['🙅 Skip the show', { say: 'Other brands got the attention. 🙅' }]
  ]);
  B('cars', 'race_team', '🏎️', 'Start a racing team?', 'Having a racing team makes your brand look fast and cool. It is VERY expensive.', [
    ['🏎️ Full racing team!', { cash: -2, chance: { p: 0.4, win: { fans: 60, rep: 8, demand: [1.15, 26, 'Race winners'], say: 'You WON the championship! 🏆' }, lose: { fans: 25, say: 'Mid-table. Still exciting! 🏎️' } } }],
    ['🏁 Sponsor another team', { cash: -0.8, fans: 25, say: 'Your logo on a race car! 🏁' }],
    ['🧒 Kids\' go-kart league', { cash: -0.3, rep: 6, fans: 20, say: 'Future race stars! 🧒' }],
    ['🙅 Too expensive', { say: 'No racing. 🙅' }]
  ]);
  B('cars', 'flying_car', '🛸', 'Your engineers built a FLYING CAR', 'In a secret lab, {a} built a car that can fly 10 meters up for 5 minutes. It works. Mostly.', [
    ['🛸 Show it to the world!', { fans: 80, rep: 5, chance: { p: 0.7, win: { say: 'It flew perfectly on live TV! The future is here! 🛸' }, lose: { say: 'It flew... into a tree. Still amazing! 🌳' } } }],
    ['🔬 Keep working in secret', { cash: -1, equip: 0.04, say: 'Next year, it will be perfect. 🔬' }],
    ['💰 Sell the idea to the army', { cash: 6, rep: -3, say: 'Rich! But the fans wanted to fly. 💰' }],
    ['😱 Too dangerous', { a: -10, say: '{a} is heartbroken. 😱' }]
  ], { rarity: 'epic', who: { a: 'front' } });
  B('cars', 'horn_song', '🎺', 'The new horns play a SONG', 'By mistake, a whole batch of cars has horns that play "La Cucaracha" instead of beeping. 🎺', [
    ['🎺 Make it a feature!', { fans: 35, demand: [1.05, 12, 'Singing horns'], say: 'Everyone wants the song horn! 🎺' }],
    ['🔧 Fix them all', { cash: -0.5, rep: 2, say: 'Normal beeps again. 🔧' }],
    ['🎵 Let buyers choose a song', { cash: -0.3, fans: 40, say: 'Custom horn songs! Traffic is a concert now. 🎵' }],
    ['🙉 Nobody will notice', { rep: -2, fans: 15, say: 'Everyone noticed. 🙉' }]
  ]);

  // ✈️ AIRLINE
  B('airline', 'storm_delays', '⛈️', 'A storm delayed 50 flights', 'A giant storm closed the airport. Thousands of passengers are stuck and angry.', [
    ['🏨 Hotels and meals for everyone', { cash: -1.5, rep: 8, say: 'Stuck, but happy. They\'ll fly with you again. 🏨' }],
    ['🍕 Free pizza at the gates', { cash: -0.3, rep: 4, fans: 15, say: 'Pizza party at gate 12! 🍕' }],
    ['🎤 Pilots tell jokes on the speakers', { fans: 20, rep: 2, say: 'Laughing is better than crying! 🎤' }],
    ['🤷 "It\'s the weather"', { rep: -6, say: 'Angry passengers everywhere. 🤷' }]
  ]);
  B('airline', 'snake_plane', '🐍', 'A SNAKE on the plane!', 'Halfway through a flight, a passenger screams: there\'s a snake under the seats! 🐍✈️', [
    ['🧑‍✈️ The captain catches it calmly', { rep: 5, fans: 30, say: 'The captain is a hero! (It was a small, friendly snake.) 🐍' }],
    ['🛬 Land at the nearest airport', { cash: -0.5, rep: 3, say: 'Safe landing. Snake removed. 🛬' }],
    ['🎁 Free flights for all passengers', { cash: -1, rep: 6, fans: 20, say: 'Scared passengers, happy passengers. 🎁' }],
    ['📹 It\'s going viral anyway', { fans: 40, rep: -3, say: '"Snakes on a Plane" in real life! 📹' }]
  ], { rarity: 'rare' });
  B('airline', 'lost_bags', '🧳', '300 bags went to the wrong country', 'A computer error sent 300 suitcases to Australia instead of Canada. The passengers are in Canada. With no clothes.', [
    ['✈️ Fly the bags back fast', { cash: -0.8, rep: 3, say: 'Bags returned in 2 days! ✈️' }],
    ['💳 Pay for new clothes', { cash: -1, rep: 5, say: 'Everyone went shopping on you. 💳' }],
    ['📍 Bag tracking app', { cash: -0.8, rep: 4, equip: 0.02, say: 'Now passengers can track their bags! 📍' }],
    ['🦘 "Australia is nice!"', { rep: -5, fans: 10, say: 'Funny, but not helpful. 🦘' }]
  ]);
  B('airline', 'singing_pilot', '🎤', 'The pilot SINGS on every flight', 'Captain Mike sings a song over the speakers on every flight. Some passengers love it. Some want to jump out.', [
    ['🎤 Make it a thing!', { fans: 30, say: '"The Singing Captain" is famous! People book his flights! 🎤' }],
    ['🎶 Only on birthday flights', { fans: 15, happy: 3, say: 'Birthday songs at 10,000 meters! 🎶' }],
    ['🔇 "Please, just fly"', { say: 'Quiet flights. Captain Mike is sad. 🔇' }],
    ['🎸 Record an album', { cash: -0.2, fans: 25, say: '"Songs from the Sky" sold 5,000 copies! 🎸' }]
  ]);
  B('airline', 'dollar_sale', '💸', '$1 ticket sale?', 'Your marketing team wants to sell 1,000 tickets for $1 each. "It will be the biggest news in travel!"', [
    ['💸 Do it!', { cash: -0.8, fans: 60, demand: [1.15, 8, '$1 sale buzz'], say: 'The website crashed from all the visitors! 💸' }],
    ['🎟️ $1 for kids only', { cash: -0.3, rep: 6, fans: 30, say: 'Families love you! 🎟️' }],
    ['💰 A normal 20% sale', { demand: [1.1, 4, 'Sale'], say: 'Steady and smart. 💰' }],
    ['🙅 Too crazy', { say: 'No sale. 🙅' }]
  ]);
  B('airline', 'pet_class', '🐶', 'Pets in first class?', 'Customers are asking if their pets can sit next to them instead of in the cargo hold.', [
    ['🐶 "Pet Class" seats!', { cash: -0.5, extra: [0.2, 26, 'Pet Class'], fans: 35, say: 'Dogs in tiny seatbelts! Everyone loves it! 🐶' }],
    ['🐱 Small pets only', { extra: [0.1, 26, 'Small pets'], fans: 15, say: 'Cats in carriers, happy owners. 🐱' }],
    ['🐾 A pet-only airline', { cash: -1, extra: [0.3, 26, 'Pet airline'], fans: 50, say: 'The world\'s first airline for pets! 🐾' }],
    ['🤧 Too many allergies', { say: 'Pets stay in cargo. 🤧' }]
  ]);
  B('airline', 'overbooked', '🎫', 'The flight is overbooked!', 'There are 210 passengers and 200 seats. Someone has to stay behind. Nobody wants to.', [
    ['💰 Offer money to volunteers', { cash: -0.3, rep: 2, say: '10 people happily took the money! 💰' }],
    ['🎁 Offer free first-class later', { cash: -0.2, rep: 4, say: 'People fought to volunteer! 🎁' }],
    ['🎲 Pick randomly', { rep: -5, say: 'VERY unpopular. 🎲' }],
    ['🔧 Fix the booking system', { cash: -0.6, equip: 0.02, say: 'Never again. 🔧' }]
  ]);

  // 🏦 BANK
  B('bank', 'tunnel_robbers', '🕳️', 'Robbers dug into the WRONG room', 'Bank robbers dug a tunnel for 3 months... and came up in the bank\'s bathroom. They are stuck. 🚽😂', [
    ['👮 Call the police', { rep: 4, fans: 25, say: 'The dumbest robbers in history were arrested! 👮' }],
    ['😂 Post the story', { fans: 40, say: 'The whole world laughed! 😂' }],
    ['🔐 Upgrade the vault anyway', { cash: -0.8, rep: 3, say: 'Next time they won\'t even get to the bathroom. 🔐' }],
    ['🎁 Give them a "Worst Robbers" trophy', { fans: 30, say: 'The trophy is in the police museum now. 🎁' }]
  ]);
  B('bank', 'vault_stuck', '🔒', 'The vault door is STUCK', 'The giant vault door won\'t open. Nobody can get money out. Customers are lining up and getting nervous!', [
    ['🔧 Call the vault experts', { cash: -0.5, closed: [1, 'Vault stuck'], say: 'Opened after a day. 🔧' }],
    ['🍪 Cookies and coffee for waiting customers', { cash: -0.1, rep: 3, say: 'Nervous but well-fed customers. 🍪' }],
    ['💳 "Use your cards!"', { rep: -1, say: 'Most people were fine with cards. 💳' }],
    ['💪 Everyone pull!', { chance: { p: 0.3, win: { fans: 20, say: 'It opened! Team power! 💪' }, lose: { say: 'It did NOT open. 😩' } } }]
  ]);
  B('bank', 'crypto', '🪙', 'Start trading crypto coins?', 'Young customers want to buy crypto through your bank. It can go up a lot... or down a lot.', [
    ['🪙 Offer crypto to customers', { cash: -0.5, chance: { p: 0.5, win: { extra: [0.3, 12, 'Crypto boom'], fans: 20, say: 'Crypto boomed! New customers! 🪙' }, lose: { rep: -5, say: 'Crypto crashed. Customers are angry. 📉' } } }],
    ['🎓 Free "money safety" classes', { rep: 6, say: 'Customers learned about risks. 🎓' }],
    ['🔒 Only safe investments', { rep: 3, say: 'Boring but safe. 🔒' }],
    ['🎲 Bet the BANK\'S money on crypto', { chance: { p: 0.4, win: { cash: 4, say: 'You got lucky! Don\'t do that again. 🎲' }, lose: { cash: -4, rep: -6, say: 'You lost a LOT. 😱' } } }]
  ]);
  B('bank', 'kids_accounts', '🐷', 'Savings accounts for kids?', 'Parents want to teach kids about saving money. {a} designed a piggy bank app for kids!', [
    ['🐷 Launch it!', { cash: -0.5, demand: [1.1, 52, 'Kids accounts'], rep: 6, say: 'Kids are saving their pocket money! 🐷' }],
    ['🎁 Free piggy bank with every account', { cash: -0.3, demand: [1.08, 26, 'Piggy banks'], fans: 20, say: 'Every kid wants the piggy bank! 🎁' }],
    ['🏫 Money lessons at schools', { rep: 8, fans: 15, say: 'Smart kids, happy parents! 🏫' }],
    ['🙅 Kids don\'t need banks', { a: -5, say: 'Maybe later. 🙅' }]
  ], FRONT);
  B('bank', 'atm_glitch', '🏧', 'The ATM gives DOUBLE money!', 'One of your ATMs is giving out twice the money people ask for! A crowd is forming outside. 🏧😱', [
    ['🛑 Shut it down NOW', { cash: -0.3, rep: 2, say: 'Stopped quickly! 🛑' }],
    ['📞 Ask people to return the extra', { cash: -0.2, rep: 5, say: 'Most people were honest! 📞' }],
    ['🔧 Upgrade all ATMs', { cash: -0.8, equip: 0.02, say: 'No more glitches! 🔧' }],
    ['😬 Let it run for a bit', { cash: -2, fans: 20, say: 'Everyone in {city} came. VERY expensive. 😬' }]
  ]);
  B('bank', 'rate_change', '📊', 'Interest rates just changed!', 'The central bank raised interest rates. Loans are more expensive. Savings pay more.', [
    ['💰 Promote savings accounts', { demand: [1.12, 12, 'Savings boom'], say: 'People are saving with you! 💰' }],
    ['🏠 Cheaper home loans for young people', { cash: -0.5, rep: 6, demand: [1.08, 12, 'Young buyers'], say: 'Young families love you! 🏠' }],
    ['📈 Raise loan prices', { extra: [0.2, 12, 'Higher rates'], rep: -3, say: 'More money, fewer friends. 📈' }],
    ['😐 Change nothing', { say: 'Steady. 😐' }]
  ]);
  B('bank', 'mystery_billionaire', '💼', 'A mysterious billionaire wants an account', 'A man with sunglasses and 10 suitcases full of cash wants to open an account. He won\'t say where the money came from. 🕶️', [
    ['🔍 Check where the money came from', { rep: 5, chance: { p: 0.5, win: { cash: 2, say: 'Clean money! He won the lottery twice. Big new client! 🔍' }, lose: { say: 'It was stolen money! The police thanked you! 👮' } } }],
    ['💼 Open it, no questions', { cash: 2, chance: { p: 0.4, win: { say: 'Nothing bad happened... this time. 💼' }, lose: { rep: -15, cash: -3, say: 'It was criminal money! Huge fine and scandal! 😱' } } }],
    ['🙅 "Sorry, we can\'t"', { rep: 3, say: 'Safe choice. 🙅' }],
    ['📞 Call the police', { rep: 6, say: 'He was a wanted criminal! Hero bank! 👮' }]
  ]);

  // 🤖 TECH GIANT
  B('tech', 'hot_phones', '🔥', 'The new phones get REALLY hot', 'Customers say your new phone gets hot enough to fry an egg. Someone actually fried an egg on it. 🍳📱', [
    ['⚠️ Recall and fix', { cash: -2.5, rep: 8, say: 'Safe phones for everyone! ⚠️' }],
    ['🔧 Software update to cool it', { cash: -0.5, chance: { p: 0.6, win: { rep: 3, say: 'Fixed with an update! 🔧' }, lose: { rep: -8, say: 'Still hot. Very bad reviews. 🔥' } } }],
    ['🍳 Joke: "It\'s a feature"', { fans: 20, rep: -10, say: 'Nobody laughed. BIG mistake. 🍳' }],
    ['🧊 Free cooling cases', { cash: -1, rep: 4, say: 'Cool cases, cool phones. 🧊' }]
  ]);
  B('tech', 'demo_fail', '🎤', 'The live demo FAILED', 'At your big launch event, you showed the new tablet on stage. It crashed. 10 million people watched live. 😳', [
    ['😂 Laugh and try again', { fans: 30, rep: 2, say: 'The second try worked! People loved your calm! 😂' }],
    ['🎤 "That was a test!"', { rep: -3, say: 'Nobody believed you. 🎤' }],
    ['🔧 Delay the launch', { rep: 1, cash: -1, say: 'Better safe than sorry. 🔧' }],
    ['🚀 Launch anyway', { chance: { p: 0.5, win: { extra: [0.4, 6, 'New tablet'], say: 'It actually works fine! Sales are great! 🚀' }, lose: { rep: -8, say: 'More crashes. Angry customers. 😬' } } }]
  ]);
  B('tech', 'privacy', '🔏', 'A privacy scandal!', 'Newspapers say your smart speakers listen to people even when they\'re off. Your engineers say it was a bug.', [
    ['🔏 Fix it and say sorry', { cash: -1, rep: 4, say: 'Honest and fast. Trust is coming back. 🔏' }],
    ['🔌 A real on/off switch', { cash: -0.8, rep: 8, say: 'A switch you can see! Customers feel safe! 🔌' }],
    ['📜 A super-clear privacy page', { rep: 5, say: 'Simple words. No secrets. 📜' }],
    ['🙈 Deny everything', { rep: -15, say: 'The proof came out. Huge scandal. 😱' }]
  ]);
  B('tech', 'robot_dog', '🐕', 'Launch a robot dog?', 'Your engineers built a robot dog that fetches, rolls over and never needs a walk. It\'s adorable. And a bit creepy.', [
    ['🐕 Launch it!', { cash: -1, chance: { p: 0.6, win: { extra: [0.5, 12, 'Robot dogs'], fans: 50, say: 'Everyone wants a robot dog! 🐕' }, lose: { fans: 20, say: 'People prefer real dogs. 🐕' } } }],
    ['🏥 Give them to hospitals', { cash: -0.5, rep: 10, fans: 30, say: 'Sick kids love their robot dogs! 🏥' }],
    ['🐱 Make a robot cat too', { cash: -1.3, extra: [0.6, 12, 'Robot pets'], fans: 55, say: 'Robot cats that ignore you. Just like real ones! 🐱' }],
    ['🙅 Too creepy', { say: 'Back in the lab. 🙅' }]
  ]);
  B('tech', 'vr_glasses', '🥽', 'VR glasses for everyone?', 'Your VR glasses let people visit any place in the world from their sofa. But they cost a lot to make.', [
    ['🥽 Launch at a low price', { cash: -1.5, extra: [0.5, 12, 'VR glasses'], fans: 40, say: 'Everyone is "traveling" from their sofa! 🥽' }],
    ['💎 Launch as a luxury product', { cash: -1, extra: [0.4, 12, 'Luxury VR'], say: 'Rich people love them! 💎' }],
    ['🏫 VR school trips', { cash: -0.8, rep: 8, say: 'Kids visited the pyramids from class! 🏫' }],
    ['🙅 Not ready yet', { say: 'Maybe next year. 🙅' }]
  ]);
  B('tech', 'chip_shortage', '🔲', 'There are no computer chips!', 'A worldwide chip shortage means you can\'t make enough devices. Customers wait for months!', [
    ['🏭 Build your own chip factory', { cash: -4, supply: [-0.05, 104, 'Own chips'], capacity: [1.2, 104, 'Own chips'], say: 'You make your own chips now! Never again! 🏭' }],
    ['💰 Pay extra to get chips first', { cash: -1.5, say: 'Expensive, but you have chips! 💰' }],
    ['📦 Make fewer, fancier devices', { price: 1, say: 'Fewer devices, higher prices. 📦' }],
    ['⏳ Waiting list', { rep: -3, demand: [0.9, 8, 'Chip shortage'], say: 'Long waits. Grumpy customers. ⏳' }]
  ]);
  B('tech', 'intern_genius', '💡', 'The intern invented something amazing', 'A 19-year-old intern invented a battery that lasts 3 weeks. The senior engineers are... jealous.', [
    ['🏆 Big bonus and a real job', { cash: -0.3, hireSpecial: { role: 'front', skill: 90 }, demand: [1.15, 26, '3-week battery'], say: 'The intern is a star now! 🏆' }],
    ['📜 Patent it', { cash: -0.2, extra: [0.4, 26, 'Battery patent'], say: 'Other companies pay you to use it! 📜' }],
    ['📺 Put the intern on TV', { fans: 40, rep: 5, say: 'The whole world knows the genius intern! 📺' }],
    ['🤫 Say the team invented it', { rep: -8, team: -8, say: 'The intern quit and told everyone. 😬' }]
  ], { rarity: 'rare' });

  // 💊 MEDICINE MAKER
  B('pharma', 'flu_cure', '💉', 'A breakthrough flu medicine!', 'Your scientists made a medicine that stops the flu in ONE day! Tests look great.', [
    ['💊 Sell it at a fair price', { cash: -0.5, demand: [1.25, 26, 'Flu medicine'], rep: 10, say: 'Millions of people feel better! 💊' }],
    ['💰 Sell it at a high price', { extra: [0.8, 12, 'Flu medicine'], rep: -8, say: 'Huge money... but people are angry. 💰' }],
    ['🌍 Free for poor countries', { cash: -1, rep: 15, fans: 30, say: 'The world thanks you! 🌍' }],
    ['🔬 More tests first', { cash: -0.5, rep: 4, say: 'Safe and careful. 🔬' }]
  ], { rarity: 'rare' });
  B('pharma', 'blue_tongues', '👅', 'A weird side effect: BLUE tongues', 'Your new cough syrup works great... but it turns people\'s tongues bright blue for a day. 👅💙', [
    ['💙 "Blue means it\'s working!"', { fans: 30, rep: -1, say: 'Kids LOVE having blue tongues! 💙' }],
    ['🔬 Fix the color', { cash: -0.5, rep: 3, say: 'Normal tongues again. 🔬' }],
    ['🌈 Offer rainbow colors', { cash: -0.3, fans: 40, extra: [0.2, 8, 'Rainbow syrup'], say: 'Rainbow tongues everywhere! 🌈' }],
    ['⚠️ Put a warning on the box', { rep: 2, say: 'Now people know. ⚠️' }]
  ]);
  B('pharma', 'medicine_price', '💲', 'People can\'t afford an important medicine', 'Families say your heart medicine is too expensive. Newspapers are writing about it.', [
    ['💲 Lower the price', { cash: -1, rep: 12, say: 'Families can afford it now. Heroes! 💲' }],
    ['🎟️ Free for families who need it', { cash: -0.8, rep: 10, say: 'A program for everyone who needs help! 🎟️' }],
    ['📊 Explain why it costs a lot', { rep: -2, say: 'Nobody liked the explanation. 📊' }],
    ['🙅 Keep the price', { rep: -10, say: 'Protests outside your office. 🙅' }]
  ]);
  B('pharma', 'lab_rats', '🐀', 'The lab rats ESCAPED', 'Someone left a cage open. 50 lab rats are running around the building. One is in the CEO\'s office. 🐀🐀', [
    ['🏃 Catch them all!', { team: 5, fans: 10, say: 'All 50 caught! One was sleeping in a coffee cup. 🏃' }],
    ['🧀 Cheese traps (humane)', { say: 'Caught safely with cheese! 🧀' }],
    ['🐀 Retire them as pets', { rep: 4, fans: 20, say: 'Workers adopted all the rats! Happy retirement! 🐀' }],
    ['🔒 Better locks', { cash: -0.2, say: 'No more escapes. 🔒' }]
  ]);
  B('pharma', 'gummy_vitamins', '🍬', 'Gummy vitamins for kids?', 'Kids hate swallowing pills. {a} made tasty gummy vitamins. They taste like candy!', [
    ['🍬 Launch them!', { cash: -0.5, extra: [0.3, 26, 'Gummy vitamins'], fans: 20, say: 'Kids beg for their vitamins now! 🍬' }],
    ['🦖 Dinosaur shapes', { cash: -0.6, extra: [0.35, 26, 'Dino vitamins'], fans: 30, say: 'Dino vitamins are a HIT! 🦖' }],
    ['🔒 Child-proof bottles', { cash: -0.2, rep: 5, say: 'Safe! Kids can\'t eat the whole bottle. 🔒' }],
    ['🙅 Pills are fine', { a: -5, say: 'Pills it is. 🙅' }]
  ], FRONT);
  B('pharma', 'donate_medicine', '🌍', 'Help a country in need?', 'A country hit by a disaster needs medicine fast. They can\'t pay much.', [
    ['🌍 Send medicine for free', { cash: -1.5, rep: 15, fans: 30, say: 'You saved thousands of lives! 🌍❤️' }],
    ['💲 Send it at cost price', { cash: -0.5, rep: 8, say: 'No profit, lots of help. 💲' }],
    ['🤝 Team up with other companies', { cash: -0.6, rep: 10, say: 'Everyone helped together! 🤝' }],
    ['🙅 Business is business', { rep: -8, say: 'People are disappointed in you. 🙅' }]
  ]);
  B('pharma', 'volunteers', '🧪', 'Volunteers needed for testing', 'You need 500 volunteers to test a new allergy medicine. It\'s safe, but people are nervous.', [
    ['💵 Pay volunteers well', { cash: -0.5, equip: 0.03, rep: 3, say: 'Tests went great! 💵' }],
    ['📢 Explain everything clearly', { rep: 5, equip: 0.02, say: 'People trusted you and signed up! 📢' }],
    ['🧑‍🔬 Your own scientists go first', { team: 8, rep: 6, say: 'Brave scientists! 🧑‍🔬' }],
    ['⏳ Skip the tests', { rep: -15, say: 'NO! Never skip tests! Scandal! 😱' }]
  ]);

  // ⚡ ENERGY COMPANY
  B('energy', 'blackout', '🌑', 'The whole city is DARK', 'A problem at your power plant caused a blackout. The whole city has no electricity! 🌑', [
    ['⚡ All engineers fix it NOW', { team: -6, rep: 3, say: 'Power back in 3 hours! ⚡' }],
    ['🔦 Give out free flashlights', { cash: -0.3, rep: 5, fans: 15, say: 'People remember who helped! 🔦' }],
    ['🔋 Build backup systems', { cash: -2, rep: 6, equip: 0.03, say: 'Never again! 🔋' }],
    ['🙊 Blame the weather', { rep: -8, say: 'It was sunny. Nobody believed you. 🙊' }]
  ]);
  B('energy', 'wind_farm', '🌬️', 'Build a wind farm?', 'You could build 100 wind turbines near the coast. Clean energy! But some people think they\'re ugly.', [
    ['🌬️ Build it!', { cash: -3, supply: [-0.04, 104, 'Wind power'], rep: 10, say: 'Clean power for 100,000 homes! 🌬️' }],
    ['🌊 Build them out at sea', { cash: -4, supply: [-0.05, 104, 'Sea wind farm'], rep: 12, say: 'Nobody can see them and they\'re super strong! 🌊' }],
    ['🎨 Paint them with art', { cash: -3.2, supply: [-0.04, 104, 'Wind power'], fans: 30, rep: 10, say: 'The prettiest wind farm in the world! 🎨' }],
    ['🙅 Too expensive', { rep: -3, say: 'Maybe later. 🙅' }]
  ]);
  B('energy', 'solar_roofs', '☀️', 'Free solar panels for schools?', 'Schools want solar panels on their roofs. It would cost you money but make you look great.', [
    ['☀️ Every school in {city}!', { cash: -1.5, rep: 15, fans: 25, say: 'Every school runs on sunshine now! ☀️' }],
    ['🏫 10 schools to start', { cash: -0.5, rep: 6, say: 'A great start! 🏫' }],
    ['💲 Sell them at a discount', { extra: [0.2, 20, 'School solar'], rep: 4, say: 'Good deal for everyone! 💲' }],
    ['🙅 Not our job', { rep: -2, say: 'Schools found another company. 🙅' }]
  ]);
  B('energy', 'squirrel', '🐿️', 'A squirrel caused a blackout!', 'A single squirrel climbed into a power station and caused a blackout for 3 neighborhoods. The squirrel is fine. Somehow. 🐿️⚡', [
    ['🐿️ Squirrel-proof covers', { cash: -0.3, rep: 2, say: 'No more squirrel attacks! 🐿️' }],
    ['😂 Make the squirrel famous', { fans: 35, say: '"Sparky the Squirrel" has a fan page now! 😂' }],
    ['🥜 Put nuts somewhere else', { fans: 10, say: 'The squirrels have a new favorite tree. 🥜' }],
    ['🙊 Blame "technical problems"', { rep: -2, say: 'Someone posted a photo of the squirrel. 🙊' }]
  ]);
  B('energy', 'storm_lines', '⛈️', 'A storm knocked down power lines', 'A big storm knocked down power lines all over the region. Thousands of homes have no power.', [
    ['👷 Work day and night', { team: -10, rep: 8, say: 'Everyone had power in 2 days! Heroes! 👷' }],
    ['🔌 Put lines underground', { cash: -3, rep: 10, equip: 0.04, say: 'No more fallen lines, ever! 🔌' }],
    ['🍲 Warm food for families', { cash: -0.3, rep: 6, say: 'People will never forget it. 🍲' }],
    ['⏳ Fix it slowly', { rep: -8, say: 'A week without power. Angry people. ⏳' }]
  ]);
  B('energy', 'bill_complaints', '🧾', 'Everyone says bills are too high', 'Families are complaining that their electricity bills doubled this winter.', [
    ['💲 Lower prices for families', { cash: -1, rep: 10, say: 'Families can breathe again! 💲' }],
    ['💡 Free energy-saving tips and bulbs', { cash: -0.4, rep: 7, fans: 15, say: 'People saved energy AND money! 💡' }],
    ['📊 Show exactly where the money goes', { rep: 3, say: 'People understand more now. 📊' }],
    ['🤷 "Use less electricity"', { rep: -8, say: 'Not helpful. 🤷' }]
  ]);
  B('energy', 'fusion', '⚛️', 'A fusion power experiment!', 'Your scientists think they can make a tiny "star" in a lab to create almost free energy. It\'s a big, crazy bet.', [
    ['⚛️ Fund it fully!', { cash: -3, chance: { p: 0.25, win: { cash: 10, rep: 20, fans: 80, say: 'IT WORKED!!! Almost free energy! History made! ⚛️🌟' }, lose: { say: 'Not yet. Maybe in 10 years. ⚛️' } } }],
    ['🔬 A small test', { cash: -1, chance: { p: 0.2, win: { cash: 4, rep: 10, say: 'Promising results! ⚛️' }, lose: { say: 'The tiny star fizzled. ⚛️' } } }],
    ['🤝 Share it with universities', { cash: -0.5, rep: 8, say: 'Science together! 🤝' }],
    ['🙅 Too science-fiction', { say: 'Back to normal power. 🙅' }]
  ], { rarity: 'epic' });

  // 🏢 REAL ESTATE
  B('realestate', 'haunted_sale', '👻', 'Selling a "haunted" house', 'You need to sell an old house that everyone says is haunted. Doors creak. Lights flicker. Nobody wants it.', [
    ['👻 Sell it AS a haunted house!', { chance: { p: 0.6, win: { cash: 1.5, fans: 30, say: 'Ghost fans paid DOUBLE! 👻' }, lose: { fans: 10, say: 'Still no buyers. Spooky. 👻' } } }],
    ['🔧 Fix the creaks and lights', { cash: -0.3, chance: { p: 0.8, win: { cash: 1, say: 'Not haunted, just old! Sold! 🔧' }, lose: { say: 'The lights still flicker. Hmm. 👻' } } }],
    ['🎃 Halloween party inside', { cash: -0.1, fans: 25, say: 'Best Halloween party ever. A buyer came! 🎃', extra: [0.2, 1, 'House sold'] }],
    ['💸 Sell it super cheap', { cash: 0.3, say: 'Sold. The new owners say it\'s "fine". 💸' }]
  ]);
  B('realestate', 'housing_boom', '📈', 'House prices are EXPLODING', 'Everyone wants to buy a house right now. Prices went up 30% in a year!', [
    ['🏗️ Build more homes!', { cash: -2, extra: [0.6, 12, 'New homes'], say: 'Every new home sold before it was finished! 🏗️' }],
    ['🏠 Affordable homes for young families', { cash: -1.5, extra: [0.4, 12, 'Affordable homes'], rep: 10, say: 'Young families can finally buy! 🏠' }],
    ['💰 Sell everything you own now', { cash: 3, say: 'You sold at the top! 💰' }],
    ['⏳ Wait, prices might go higher', { chance: { p: 0.5, win: { cash: 4, say: 'Prices went higher! Lucky! ⏳' }, lose: { cash: -1, say: 'Prices crashed. Oops. 📉' } } }]
  ]);
  B('realestate', 'celebrity_mansion', '🏰', 'Sell a movie star\'s mansion!', 'A famous movie star wants you to sell their mansion: 20 bedrooms, a waterslide and a room just for shoes.', [
    ['🏰 Huge luxury ad campaign', { cash: -0.5, chance: { p: 0.6, win: { cash: 3, fans: 30, say: 'Sold to a tech billionaire! Huge commission! 🏰' }, lose: { say: 'Still for sale. 🏰' } } }],
    ['🎥 Video tour with the star', { cash: -0.2, fans: 50, chance: { p: 0.6, win: { cash: 3, say: 'The video got millions of views. SOLD! 🎥' }, lose: { say: 'Famous video, no buyer yet. 🎥' } } }],
    ['🤫 Private, secret sale', { cash: 2, rep: 5, say: 'Sold quietly to a sheikh. Classy! 🤫' }],
    ['🙅 Too fancy for us', { say: 'Another agency got it. 🙅' }]
  ], { rarity: 'rare' });
  B('realestate', 'bidding_war', '🔨', 'A BIDDING WAR!', 'Six families want the same house. They keep offering more and more money!', [
    ['🔨 Let them bid!', { cash: 1.2, happy: -3, say: 'Sold for WAY more than the price! 🔨' }],
    ['❤️ Sell to the family with kids', { cash: 0.6, rep: 6, say: 'The kids jumped for joy! ❤️' }],
    ['📜 Write-a-letter contest', { cash: 0.8, fans: 15, say: 'The best letter won the house. Beautiful! 📜' }],
    ['🎲 Draw names from a hat', { cash: 0.6, fans: 10, say: 'Fair and fun! 🎲' }]
  ]);
  B('realestate', 'cracked_foundation', '🧱', 'A crack in the foundation!', 'Just before a sale, {a} found a big crack in the house\'s foundation. The buyers don\'t know yet.', [
    ['📢 Tell the buyers', { cash: -0.3, rep: 8, say: 'The buyers were thankful for your honesty! 📢' }],
    ['🔧 Fix it before selling', { cash: -0.6, rep: 4, say: 'Fixed properly! 🔧' }],
    ['💸 Lower the price', { cash: -0.4, rep: 3, say: 'Fair deal for everyone. 💸' }],
    ['🤫 Hide it', { cash: 0.5, chance: { p: 0.2, win: { say: 'Nobody found out... 🤫' }, lose: { rep: -15, cash: -2, say: 'The crack got bigger. You were sued! 😱' } } }]
  ], FRONT);
  B('realestate', 'tiny_apartment', '📦', 'A TINY apartment for a HUGE price', 'You\'re selling an apartment so small that the shower is above the toilet and the bed is in the kitchen. The owner wants a million dollars.', [
    ['😂 Honest listing: "It\'s VERY cozy"', { fans: 40, say: 'The funniest house ad ever went viral! 😂' }],
    ['📐 Clever furniture to make it work', { cash: -0.2, chance: { p: 0.6, win: { cash: 1, say: 'Sold to a minimalist! 📐' }, lose: { say: 'Still too small. 📐' } } }],
    ['🙅 Refuse the listing', { rep: 3, say: 'Some houses aren\'t worth it. 🙅' }],
    ['📸 Use a fish-eye camera lens', { cash: 0.5, rep: -6, say: 'The buyers were VERY surprised in person. 😬' }]
  ]);
  B('realestate', 'open_house_party', '🎉', 'The open house became a PARTY', 'You held an open house to show a big home. 300 people came, someone brought a DJ, and now it\'s a party. 🎉', [
    ['🎉 Join the party!', { fans: 30, team: 8, say: 'Best open house ever. Two people want to buy! 🎉' }],
    ['📢 "Party\'s over, everyone out!"', { rep: 2, say: 'The house is safe. 📢' }],
    ['📋 Hand out forms to everyone', { cash: 0.5, say: 'Lots of new clients! 📋' }],
    ['📸 Post it: "The house is THAT good"', { fans: 25, say: 'People want to see the "party house"! 📸' }]
  ]);

  // 🎬 MOVIE STUDIO
  B('entertainment', 'flop', '🍅', 'The big movie FLOPPED', 'Your $200 million movie about a heroic toaster was a disaster. Theaters are empty. Critics gave it 2%. 🍅', [
    ['😂 Make fun of it yourself', { fans: 35, rep: 2, say: 'People watched it ironically. It\'s a cult classic now! 😂' }],
    ['📺 Sell it to a streaming service', { cash: 1, say: 'Some money back! 📺' }],
    ['🔁 Re-edit it as a comedy', { cash: -0.3, chance: { p: 0.4, win: { cash: 2, fans: 30, say: 'As a comedy, it\'s actually a hit! 🔁' }, lose: { say: 'Still bad. Now funny-bad. 🔁' } } }],
    ['🤐 Never speak of it again', { rep: -2, say: '"What toaster movie?" 🤐' }]
  ]);
  B('entertainment', 'star_demands', '🌟', 'Your lead actor has DEMANDS', 'The star of your next film wants: a private jet, 3 chefs, and their dog to play a main character.', [
    ['🐶 Give the dog a role!', { cash: -0.5, fans: 40, say: 'The dog stole the movie! Audiences LOVED it! 🐶' }],
    ['✈️ Everything they want', { cash: -1.5, say: 'Happy star, empty bank. ✈️' }],
    ['🗣️ Negotiate', { chance: { p: 0.6, win: { cash: -0.3, say: 'They settled for one chef. 🗣️' }, lose: { cash: -0.8, say: 'They got most of what they wanted. 🗣️' } } }],
    ['🔁 Hire a new unknown actor', { chance: { p: 0.4, win: { fans: 30, rep: 5, say: 'The new actor became a star! 🌟' }, lose: { say: 'The movie was okay. 🔁' } } }]
  ]);
  B('entertainment', 'superhero_sequel', '🦸', 'Superhero movie part 5?', 'Your superhero movies make tons of money. Fans want Part 5. Some critics say "enough superheroes!"', [
    ['🦸 Make Part 5!', { cash: -2, chance: { p: 0.7, win: { cash: 6, fans: 40, say: 'Biggest opening weekend of the year! 🦸' }, lose: { cash: 1, say: 'Did okay. People are a bit tired of it. 🦸' } } }],
    ['🆕 A brand-new hero', { cash: -2, chance: { p: 0.5, win: { cash: 7, fans: 50, say: 'A new hero is born! 🆕' }, lose: { say: 'Nobody knew who the new hero was. 🆕' } } }],
    ['👵 A superhero grandma movie', { cash: -1.5, fans: 35, chance: { p: 0.5, win: { cash: 5, say: '"Super Granny" is the surprise hit of the year! 👵' }, lose: { say: 'Cute, small hit. 👵' } } }],
    ['🎭 Make a serious drama instead', { cash: -1, rep: 8, say: 'Critics loved it. Awards are coming! 🎭' }]
  ]);
  B('entertainment', 'script_leak', '📄', 'The script leaked online!', 'The whole script for your secret movie is online. The big twist is ruined!', [
    ['🔄 Rewrite the ending', { cash: -0.8, fans: 20, say: 'New secret ending! Nobody saw it coming! 🔄' }],
    ['😂 "That\'s a fake script!"', { chance: { p: 0.5, win: { fans: 25, say: 'People believed you! 😂' }, lose: { rep: -3, say: 'They didn\'t believe you. 😂' } } }],
    ['🕵️ Find the leaker', { chance: { p: 0.5, win: { rep: 3, say: 'Caught! 🕵️' }, lose: { say: 'Never found. 🕵️' } } }],
    ['🤷 It doesn\'t matter', { demand: [0.9, 4, 'Spoiled movie'], say: 'Some people didn\'t come. 🤷' }]
  ]);
  B('entertainment', 'award_nom', '🏆', 'Nominated for Best Movie!', 'Your movie is nominated for Best Movie at the biggest film awards in the world!', [
    ['🎩 Big campaign to win', { cash: -1, chance: { p: 0.4, win: { rep: 15, fans: 50, demand: [1.2, 12, 'Award winner'], say: 'YOU WON BEST MOVIE! 🏆🏆🏆' }, lose: { fans: 15, say: 'Didn\'t win. Nominated is still huge! 🎩' } } }],
    ['😌 Let the movie speak for itself', { chance: { p: 0.3, win: { rep: 15, fans: 50, say: 'YOU WON! 🏆' }, lose: { fans: 10, say: 'No award this time. 😌' } } }],
    ['🎉 Party for the whole crew', { cash: -0.3, team: 12, say: 'The crew celebrated like winners! 🎉' }],
    ['🎤 Prepare a funny speech', { fans: 20, chance: { p: 0.35, win: { rep: 12, fans: 30, say: 'You won AND your speech went viral! 🎤' }, lose: { say: 'Didn\'t win. The speech is saved for next year. 🎤' } } }]
  ], { rarity: 'rare' });
  B('entertainment', 'stunt_wrong', '💥', 'A stunt went wrong!', 'A car jump stunt went a bit too far. The car landed in a swimming pool. The stunt driver is fine... and loves it.', [
    ['🎬 Keep it in the movie!', { fans: 35, say: 'The "pool jump" is the most famous scene of the year! 🎬' }],
    ['🦺 More safety for stunts', { cash: -0.5, rep: 5, say: 'Safe stunts from now on! 🦺' }],
    ['💻 Use computer effects instead', { cash: -0.8, rep: 2, say: 'No more real crashes. 💻' }],
    ['🏊 Pay for the pool', { cash: -0.3, say: 'The pool owner got a new pool AND a story. 🏊' }]
  ]);
  B('entertainment', 'banana_movie', '🍌', 'An animated movie about a talking banana?', '{a} pitched a cartoon about a banana who wants to be a superstar singer. The team is split.', [
    ['🍌 Make it!', { cash: -1.5, chance: { p: 0.6, win: { cash: 5, fans: 50, say: '"Banana Dreams" is the biggest kids\' movie of the year! 🍌' }, lose: { say: 'Kids liked it. Parents fell asleep. 🍌' } } }],
    ['🍎 Add a fruit gang', { cash: -1.7, chance: { p: 0.65, win: { cash: 6, fans: 55, say: 'The Fruit Gang movie is a MASSIVE hit! 🍎🍌🍇' }, lose: { say: 'Fun, but not a big hit. 🍎' } } }],
    ['📺 Make it a TV show', { cash: -0.6, extra: [0.3, 20, 'Banana show'], fans: 25, say: 'Kids watch it every Saturday! 📺' }],
    ['🙅 A banana? Really?', { a: -8, say: 'Another studio made it. It was a hit. 😩' }]
  ], FRONT);

  // 🛢️ OIL COMPANY
  B('oil', 'new_field', '🗺️', 'A new oil field... under a park', 'Your geologists found a huge oil field. The problem: it\'s under a famous city park that everyone loves. 🌳', [
    ['🛢️ Drill anyway', { cash: 4, rep: -15, say: 'Rich! But the whole city hates you now. 🛢️' }],
    ['↘️ Drill sideways from far away', { cash: 2, rep: -3, say: 'Clever! The park is still there. ↘️' }],
    ['🌳 Leave the park alone', { rep: 10, fans: 20, say: 'The city loves you for it! 🌳' }],
    ['🎁 Drill, and build a better park', { cash: 2, rep: 4, say: 'The new park is even bigger! 🎁' }]
  ]);
  B('oil', 'rig_storm', '🌊', 'A huge storm is hitting the oil rig', 'Giant waves are hitting your oil rig at sea. The workers are scared. The storm is getting worse!', [
    ['🚁 Helicopter out everyone NOW', { cash: -1, team: 12, rep: 6, say: 'Everyone safe! The rig survived too. 🚁' }],
    ['🔒 Shut down and wait', { closed: [1, 'Storm'], rep: 2, say: 'The storm passed. Everyone is okay. 🔒' }],
    ['⚙️ Keep drilling', { chance: { p: 0.4, win: { cash: 1, say: 'The rig held! 😬' }, lose: { cash: -3, team: -15, rep: -10, say: 'Damage! Workers were terrified! NEVER do that! 😱' } } }],
    ['🏗️ Build stronger rigs', { cash: -2, rep: 4, equip: 0.03, say: 'Storm-proof rigs! 🏗️' }]
  ]);
  B('oil', 'protesters', '🪧', 'Protesters want clean energy', 'Hundreds of young people are outside your office with signs: "Save the planet! Stop oil!" 🌍', [
    ['🗣️ Invite them in to talk', { rep: 6, say: 'You listened. They respected that. 🗣️' }],
    ['☀️ Promise to invest in solar', { cash: -1.5, rep: 12, fans: 20, say: 'Your first solar farm is being built! ☀️' }],
    ['🍕 Send them pizza', { cash: -0.05, rep: 1, say: 'They ate the pizza and kept protesting. 🍕' }],
    ['🚪 Ignore them', { rep: -8, say: 'The protest got bigger. On TV. 🚪' }]
  ]);
  B('oil', 'oil_prince', '👑', 'A rich prince wants to partner', 'A very rich prince wants to partner with your company. He has more oil than you and a golden helicopter.', [
    ['🤝 Partner up!', { cash: 3, capacity: [1.15, 52, 'Royal partner'], say: 'Bigger company, golden helicopter rides! 🤝' }],
    ['💰 Sell him part of the company', { cash: 5, say: 'Rich! But he owns part of you now. 💰' }],
    ['🔍 Check his business first', { chance: { p: 0.6, win: { cash: 3, rep: 3, say: 'All clean! Great partner! 🔍' }, lose: { rep: 3, say: 'Some bad deals found. You said no. 🔍' } } }],
    ['🙅 Stay independent', { say: 'Your company, your rules. 🙅' }]
  ], { rarity: 'rare' });
  B('oil', 'pipeline_leak', '🔧', 'A small pipeline leak', 'A pipe is leaking oil into a field. It\'s small, but a farmer spotted it.', [
    ['🔧 Fix it and clean it all up', { cash: -1, rep: 6, say: 'Fixed and cleaned! The farmer is happy. 🔧' }],
    ['💵 Pay the farmer too', { cash: -1.3, rep: 9, say: 'The farmer said you\'re the best oil company ever. 💵' }],
    ['📡 Leak sensors on every pipe', { cash: -2, rep: 8, equip: 0.03, say: 'Leaks are found in seconds now! 📡' }],
    ['🤫 Fix it quietly', { cash: -0.5, chance: { p: 0.4, win: { say: 'Fixed. Nobody talked. 🤫' }, lose: { rep: -12, say: 'The farmer told the news. 😱' } } }]
  ]);
  B('oil', 'rig_cook', '🍳', 'The rig cook QUIT!', 'The cook on your oil rig quit. 100 hungry workers in the middle of the ocean are eating dry cereal. Morale is sinking! 🥣', [
    ['👨‍🍳 Hire a top chef', { cash: -0.3, team: 15, say: 'Steak night on the rig! Best food at sea! 👨‍🍳' }],
    ['🚁 Helicopter pizza delivery', { cash: -0.4, team: 10, fans: 20, say: 'The most expensive pizza in history! 🚁🍕' }],
    ['🍳 Workers take turns cooking', { team: -3, fans: 10, say: 'Some meals were great. Some were... interesting. 🍳' }],
    ['🥣 Cereal is fine', { team: -12, say: 'VERY unhappy workers. 🥣' }]
  ]);
  B('oil', 'go_solar', '☀️', 'Invest in solar power too?', 'Your advisors say oil won\'t last forever. Big oil companies are starting to build solar farms.', [
    ['☀️ Big solar investment', { cash: -3, rep: 12, supply: [-0.02, 104, 'Solar power'], say: 'Oil AND sun! You\'re ready for the future! ☀️' }],
    ['🌬️ Wind AND solar', { cash: -4, rep: 15, supply: [-0.03, 104, 'Clean power'], say: 'A clean energy giant! 🌬️☀️' }],
    ['🔬 Small test project', { cash: -0.8, rep: 5, say: 'A good first step! 🔬' }],
    ['🛢️ Oil forever!', { rep: -6, say: 'Some investors are worried. 🛢️' }]
  ]);

  // 🥤 SODA COMPANY
  B('soda', 'weird_flavor', '🥓', 'BACON soda?!', 'Your flavor team made bacon-flavored soda. It\'s... strange. People are curious though.', [
    ['🥓 Limited edition release!', { cash: -0.3, fans: 40, extra: [0.25, 4, 'Bacon soda'], say: 'Everyone had to try it once! 🥓🥤' }],
    ['🎲 "Mystery flavor" cans', { cash: -0.3, fans: 30, extra: [0.2, 8, 'Mystery cans'], say: 'People buy them to dare friends! 🎲' }],
    ['🍓 Stick to fruit flavors', { rep: 2, say: 'Strawberry wins again. 🍓' }],
    ['🗳️ Let fans vote on the next flavor', { fans: 35, say: 'Fans chose "Cotton Candy". Big hit! 🗳️' }]
  ]);
  B('soda', 'sugar_tax', '🏛️', 'A new sugar tax!', 'The government put a tax on sugary drinks. Your soda will cost more in stores.', [
    ['🥤 Launch zero-sugar versions', { cash: -0.8, demand: [1.1, 52, 'Zero sugar'], rep: 6, say: 'Zero-sugar sodas are selling great! 🥤' }],
    ['📈 Raise prices', { price: 1, happy: -4, say: 'Customers aren\'t happy. 📈' }],
    ['🫧 Launch sparkling water', { cash: -0.6, extra: [0.25, 26, 'Sparkling water'], rep: 5, say: 'Healthy bubbles! 🫧' }],
    ['😤 Complain to the government', { rep: -2, say: 'The tax stays. 😤' }]
  ]);
  B('soda', 'can_design', '🎨', 'New can designs!', 'Your cans look old-fashioned. {a} designed new cans that change color when they\'re cold!', [
    ['❄️ Color-changing cans!', { cash: -0.5, fans: 35, demand: [1.1, 26, 'Cool cans'], say: 'People buy them just to watch the color change! ❄️' }],
    ['🏆 Collectible can series', { cash: -0.4, extra: [0.2, 20, 'Collectible cans'], fans: 25, say: 'People collect all 12 designs! 🏆' }],
    ['😎 Simple, modern design', { cash: -0.2, rep: 3, say: 'Clean and cool. 😎' }],
    ['🙅 The old cans are classic', { a: -5, say: 'Classic it is. 🙅' }]
  ], FRONT);
  B('soda', 'exploding_cans', '💥', 'Cans are EXPLODING in the heat', 'A heatwave made some cans in a warehouse explode! Soda is dripping from the ceiling. 🥤💥', [
    ['❄️ Cooled warehouses', { cash: -1, equip: 0.02, say: 'Cool and safe! ❄️' }],
    ['📢 Warn stores to keep them cool', { rep: 3, say: 'Stores moved them to the shade. 📢' }],
    ['📹 "Soda fountain" video', { fans: 30, rep: -2, say: 'A cool video, but not great for business. 📹' }],
    ['🥤 Make stronger cans', { cash: -0.6, rep: 3, say: 'Super strong cans! 🥤' }]
  ], { cond: function (g) { var w = ((g.week - 1) % 52) + 1; return g.company.industry === 'soda' && w >= 22 && w <= 36; } });
  B('soda', 'secret_formula', '🔐', 'The secret formula vault', 'Only 2 people know your secret soda formula. One of them wants to retire to a beach.', [
    ['🔐 Teach a trusted new person', { rep: 2, say: 'The formula is safe for the future. 🔐' }],
    ['🏦 Put it in a bank vault', { cash: -0.3, fans: 15, say: 'The formula has its own vault. Fans love the mystery! 🏦' }],
    ['🎟️ Vault tours (without the formula)', { cash: -0.2, extra: [0.12, 20, 'Vault tours'], fans: 20, say: 'Tourists stare at a locked door. They love it! 🎟️' }],
    ['📝 Just write it on a sticky note', { rep: -2, say: 'Risky... 📝' }]
  ]);
  B('soda', 'cup_sponsor', '⚽', 'Sponsor the big football tournament?', 'The world\'s biggest football tournament needs an official drink. It costs a fortune, but billions will see your logo.', [
    ['⚽ Official drink!', { cash: -3, fans: 80, demand: [1.25, 12, 'Tournament sponsor'], say: 'Your logo was everywhere! Sales exploded! ⚽' }],
    ['🏟️ Sponsor one stadium', { cash: -1, fans: 30, demand: [1.1, 8, 'Stadium sponsor'], say: 'Great spot, good price! 🏟️' }],
    ['📱 Fun ads during the games', { cash: -0.8, fans: 25, say: 'Your funny ads were the talk of the tournament! 📱' }],
    ['🙅 Too expensive', { say: 'Another drink got it. 🙅' }]
  ], { rarity: 'rare' });
  B('soda', 'plastic', '♻️', 'Plastic bottles on the beach', 'People found hundreds of your plastic bottles on a beach. Photos are everywhere online.', [
    ['♻️ 100% recycled bottles', { cash: -1.5, rep: 12, say: 'Every bottle is recycled now! ♻️' }],
    ['🏖️ Organize a beach cleanup', { cash: -0.3, rep: 8, fans: 25, say: 'Thousands came to clean beaches! 🏖️' }],
    ['🥫 Switch to cans', { cash: -1, rep: 8, say: 'Cans are easier to recycle! 🥫' }],
    ['🙈 "Not our fault"', { rep: -10, say: 'People are furious. 🙈' }]
  ]);

  // 🏟️ FOOTBALL CLUB
  B('footballclub', 'derby', '🔥', 'THE DERBY is this weekend', 'The biggest match of the year: your club vs {rival} FC. The whole city is split in two!', [
    ['⚽ Attack, attack, attack!', { chance: { p: 0.45, win: { fans: 40, rival: -0.1, demand: [1.15, 6, 'Derby win'], say: 'YOU WON 4-1! The city is YOURS! 🔥' }, lose: { fans: -5, rival: 0.05, say: 'Lost 3-0. Painful. 😭' } } }],
    ['🛡️ Play safe for a draw', { chance: { p: 0.7, win: { fans: 10, say: '1-1! A hard-fought draw. 🛡️' }, lose: { say: 'Lost 1-0 in the last minute. 😩' } } }],
    ['📣 Rally the fans all week', { cash: -0.2, fans: 25, chance: { p: 0.5, win: { demand: [1.12, 4, 'Derby win'], say: 'The crowd carried the team to victory! 📣' }, lose: { say: 'Lost, but the atmosphere was incredible. 📣' } } }],
    ['🤝 A friendly message to their fans', { rep: 6, say: 'Respect! Both sides cheered at the end. 🤝' }]
  ], { init: rival });
  B('footballclub', 'superstar_transfer', '💰', 'Buy a superstar player?', 'You can buy "Zlatko the Lightning", the fastest striker in the world. The price is ENORMOUS.', [
    ['💰 Buy him!', { cash: -4, fans: 60, demand: [1.25, 52, 'Superstar striker'], say: 'Shirts with his name sold out in an hour! 💰⚡' }],
    ['📉 Offer half', { chance: { p: 0.3, win: { cash: -2, fans: 50, demand: [1.2, 52, 'Superstar'], say: 'They accepted! Bargain! 📉' }, lose: { say: 'Another club bought him. 📉' } } }],
    ['🧒 Invest in young players', { cash: -1, rep: 6, capacity: [1.08, 104, 'Youth academy'], say: 'Future stars, homegrown! 🧒' }],
    ['🙅 Too expensive', { fans: -5, say: 'Fans wanted a star. 🙅' }]
  ], { rarity: 'rare' });
  B('footballclub', 'stadium', '🏟️', 'Make the stadium BIGGER?', 'Every match is sold out. Fans can\'t get tickets. Expanding the stadium is a giant project.', [
    ['🏟️ Add 20,000 seats!', { cash: -4, capacity: [1.3, 104, 'Bigger stadium'], fans: 30, say: 'The new stadium is incredible! 🏟️' }],
    ['📺 Big screens in the city park', { cash: -0.5, fans: 25, rep: 5, say: 'Thousands watch from the park! 📺' }],
    ['💲 Raise ticket prices', { extra: [0.3, 26, 'Higher prices'], rep: -6, say: 'More money. Angry fans. 💲' }],
    ['🙅 Keep it cozy', { say: 'Full every week. 🙅' }]
  ]);
  B('footballclub', 'losing_streak', '📉', 'The team lost 5 games in a row', 'Five losses. Fans are booing. Newspapers say the coach should be fired.', [
    ['🚪 Fire the coach', { cash: -0.5, chance: { p: 0.5, win: { fans: 20, say: 'The new coach won the next 3 games! 🚪' }, lose: { say: 'Still losing. Hmm. 🚪' } } }],
    ['🤝 Support the coach', { team: 8, chance: { p: 0.55, win: { rep: 5, fans: 15, say: 'The team fought back! 4 wins in a row! 🤝' }, lose: { fans: -10, say: 'Still losing. Fans are really angry. 😠' } } }],
    ['🏕️ Team-building camp', { cash: -0.3, team: 12, say: 'The team came back united! 🏕️' }],
    ['🍕 Free pizza for fans', { cash: -0.2, rep: 3, say: 'Fans are a bit less angry. 🍕' }]
  ]);
  B('footballclub', 'fan_chant', '🎶', 'The fans made a new chant', 'Your fans made a new chant about the team. It\'s SUPER catchy. Even rival fans are singing it.', [
    ['🎵 Make it the official song', { fans: 30, say: 'The whole stadium sings it every game! 🎵' }],
    ['🎤 Record it with a pop star', { cash: -0.3, fans: 45, say: 'It\'s on the radio! 🎤' }],
    ['👕 Put it on shirts', { extra: [0.15, 12, 'Chant shirts'], say: 'The shirts sold out! 👕' }],
    ['😊 Just enjoy it', { fans: 10, say: 'Goosebumps every match. 😊' }]
  ]);
  B('footballclub', 'penalty_final', '🥅', 'PENALTY SHOOTOUT in the cup final!', 'The cup final is tied after 120 minutes. It comes down to penalties. Who takes the last kick?', [
    ['⭐ Your star striker', { chance: { p: 0.6, win: { cash: 3, fans: 60, rep: 8, say: 'GOAL!!! CUP WINNERS!!! 🏆🥅' }, lose: { fans: 10, say: 'Saved! So close... 😭' } } }],
    ['🧤 Your GOALKEEPER', { chance: { p: 0.4, win: { cash: 3, fans: 80, rep: 8, say: 'THE GOALKEEPER SCORED!!! LEGENDARY!!! 🧤🏆' }, lose: { fans: 15, say: 'Over the bar. Brave try. 🧤' } } }],
    ['🧒 The 17-year-old rookie', { chance: { p: 0.5, win: { cash: 3, fans: 70, rep: 8, say: 'The rookie scored! A star is born! 🏆' }, lose: { fans: 15, say: 'The rookie missed. The team hugged them. ❤️' } } }],
    ['🎲 Let the captain decide', { chance: { p: 0.55, win: { cash: 3, fans: 55, say: 'GOAL! CHAMPIONS! 🏆' }, lose: { fans: 10, say: 'Missed. Next year! 😢' } } }]
  ], { rarity: 'rare' });
  B('footballclub', 'mascot_fight', '🐻', 'The mascots got into a FIGHT', 'At halftime, your mascot (a giant bear) and the other team\'s mascot (a giant chicken) started wrestling on the pitch. 🐻🐔', [
    ['😂 It\'s the best thing ever', { fans: 40, rep: -2, say: 'The video has 20 million views! 😂' }],
    ['🥊 Official mascot boxing at halftime', { fans: 50, say: 'Mascot boxing is the best part of every game now! 🥊' }],
    ['🚪 Fire the mascot', { rep: 2, fans: -5, say: 'Fans miss the bear. 🚪' }],
    ['🤝 Make them hug on camera', { fans: 25, rep: 4, say: 'The hug went viral too! 🤝' }]
  ]);

  // 🚢 SHIPPING COMPANY
  B('shipping', 'canal_stuck', '🚢', 'Your ship is STUCK in the canal', 'Your giant container ship got stuck sideways in the world\'s busiest canal. 300 ships are waiting behind it. The whole world is watching. 😱', [
    ['🚜 Dig it out with every machine', { cash: -1.5, rep: 3, say: 'Free after 6 days! The internet made a million memes. 🚜' }],
    ['🌊 Wait for high tide', { cash: -0.8, chance: { p: 0.6, win: { say: 'The tide lifted it free! 🌊' }, lose: { cash: -1, say: 'Not enough. More digging. 😩' } } }],
    ['😂 Post a meme about it yourself', { fans: 60, rep: -2, say: 'People loved that you laughed at yourself! 😂' }],
    ['💸 Pay all the other ships', { cash: -3, rep: 6, say: 'Very expensive "sorry". 💸' }]
  ], { rarity: 'rare' });
  B('shipping', 'pirates', '🏴‍☠️', 'Pirates near your ship route!', 'Warnings say pirates have been seen near one of your routes. Your ship leaves tomorrow.', [
    ['🗺️ Take a longer, safer route', { cash: -0.5, rep: 2, say: 'Safe and sound! 🗺️' }],
    ['🛡️ Hire security guards', { cash: -0.8, rep: 3, say: 'The pirates saw the guards and sailed away! 🛡️' }],
    ['🚢 Travel with other ships', { cash: -0.2, say: 'Safety in numbers! 🚢' }],
    ['🏴‍☠️ Risk it', { chance: { p: 0.6, win: { say: 'No pirates. Phew! 🏴‍☠️' }, lose: { cash: -3, team: -10, say: 'Pirates took the cargo! The crew is safe. 😱' } } }]
  ]);
  B('shipping', 'duck_spill', '🦆', '10,000 rubber ducks fell into the ocean', 'A storm knocked a container of rubber ducks off your ship. They\'re floating all over the ocean and washing up on beaches worldwide! 🦆🌊', [
    ['🦆 "Find a duck, win a prize!"', { cash: -0.3, fans: 60, say: 'People all over the world are hunting for your ducks! 🦆' }],
    ['🧹 Clean up the beaches', { cash: -0.8, rep: 8, say: 'Beaches cleaned! Scientists thanked you. 🧹' }],
    ['🌊 Scientists use them to study currents', { rep: 6, fans: 20, say: 'Your ducks helped ocean science! 🌊' }],
    ['🤷 Ducks gonna duck', { rep: -4, say: 'People think it\'s pollution. 🤷' }]
  ]);
  B('shipping', 'big_storm', '🌀', 'A monster storm on the route', 'A huge storm is right in the middle of your ship\'s route. The captain asks what to do.', [
    ['↩️ Go around it', { cash: -0.5, say: 'Late but safe. ↩️' }],
    ['⚓ Wait in port', { closed: [1, 'Storm wait'], rep: 2, say: 'Safe in the harbor. ⚓' }],
    ['🌊 Go through it!', { chance: { p: 0.5, win: { say: 'Made it through! Brave crew! 🌊' }, lose: { cash: -2, team: -10, say: 'Lost 50 containers! The crew is okay but scared. 😱' } } }],
    ['🛰️ Buy better weather radar', { cash: -0.8, equip: 0.03, say: 'You see storms coming now. 🛰️' }]
  ]);
  B('shipping', 'port_strike', '✊', 'The port workers are on strike', 'The workers at the big port stopped working. They want better pay. Your ships can\'t unload!', [
    ['🤝 Help them get a fair deal', { cash: -0.5, rep: 6, say: 'Deal done! The port is open again. 🤝' }],
    ['🔀 Use another port', { cash: -0.8, say: 'Longer trip, but moving. 🔀' }],
    ['⏳ Wait it out', { demand: [0.85, 3, 'Port strike'], say: 'Three slow weeks. ⏳' }],
    ['🍕 Bring the strikers food', { cash: -0.05, rep: 4, say: 'The workers liked you. They unloaded your ship first! 🍕' }]
  ]);
  B('shipping', 'mega_ship', '🛳️', 'Build the world\'s biggest ship?', 'Engineers designed a ship that can carry 30,000 containers. It would be the biggest ever built!', [
    ['🛳️ Build it!', { cash: -4, capacity: [1.3, 104, 'Mega ship'], fans: 30, say: 'The biggest ship in the world has YOUR name on it! 🛳️' }],
    ['🌱 Build a clean, wind-powered ship', { cash: -4, capacity: [1.2, 104, 'Clean ship'], rep: 12, say: 'Giant sails! Clean shipping! 🌱⛵' }],
    ['🚢 Two normal ships instead', { cash: -3, capacity: [1.2, 104, 'Two new ships'], say: 'More flexible! 🚢' }],
    ['🙅 Too big for the canal', { say: 'Remember the canal... 🙅' }]
  ]);
  B('shipping', 'whales', '🐋', 'Whales on your route!', 'Scientists say a family of rare whales swims right on your ship route this month. Ships can hurt them.', [
    ['🐢 Slow down near the whales', { cash: -0.3, rep: 8, say: 'The whales are safe! Scientists thank you! 🐋' }],
    ['🗺️ Change the route', { cash: -0.5, rep: 10, fans: 15, say: 'A whale-friendly route! 🗺️' }],
    ['📸 Whale-watching cruise', { cash: -0.3, extra: [0.2, 4, 'Whale cruises'], fans: 25, say: 'Tourists loved seeing the whales (from far away)! 📸' }],
    ['🚢 Full speed ahead', { rep: -10, say: 'People were angry. Very angry. 🚢' }]
  ]);

  // ⛏️ GOLD MINE
  B('goldmine', 'huge_nugget', '🪙', 'A GIANT gold nugget!', '{a} found a gold nugget as big as a football! It\'s worth a fortune! 🪙✨', [
    ['💰 Sell it', { cash: 4, a: 10, say: 'SOLD to a museum for a fortune! 💰' }],
    ['🏛️ Put it on display', { fans: 40, extra: [0.2, 26, 'Nugget museum'], say: 'People come from everywhere to see it! 🏛️' }],
    ['🎁 Bonus for {a}', { cash: 3, bonus: 'a', a: 20, team: 6, say: '{a} is the happiest miner in the world! 🎁' }],
    ['🔍 Dig deeper right there!', { chance: { p: 0.5, win: { cash: 6, say: 'MORE GOLD! A whole vein! 🔍' }, lose: { cash: 2, say: 'Just the one nugget. Still rich! 🔍' } } }]
  ], { rarity: 'rare', who: { a: 'front' } });
  B('goldmine', 'cave_in', '⛑️', 'A tunnel collapsed! Miners trapped!', 'Part of a tunnel collapsed. 6 miners are trapped behind the rocks, but they\'re talking on the radio. They\'re okay!', [
    ['⛑️ Everything for the rescue', { cash: -1.5, team: 15, rep: 10, say: 'ALL 6 MINERS RESCUED! The whole country cheered! ⛑️❤️' }],
    ['🛠️ Call the best rescue team', { cash: -1, rep: 8, team: 10, say: 'Rescued in 2 days! Everyone is safe! 🛠️' }],
    ['🍫 Send them food through a pipe', { cash: -0.3, team: 8, say: 'Food and hope while the rescue goes on. Everyone got out! 🍫' }],
    ['🧱 Stronger tunnels after this', { cash: -2, rep: 8, equip: 0.03, say: 'Everyone rescued AND the mine is safer now. 🧱' }]
  ]);
  B('goldmine', 'gold_price', '📉', 'The gold price is dropping', 'The price of gold dropped 20% this month. Your gold bars are worth less!', [
    ['📦 Keep the gold and wait', { chance: { p: 0.6, win: { cash: 2, say: 'The price came back up! Smart waiting! 📦' }, lose: { cash: -0.5, say: 'It went down more. 📉' } } }],
    ['💍 Make jewelry instead', { cash: -0.5, extra: [0.3, 12, 'Gold jewelry'], say: 'Jewelry sells for more than bars! 💍' }],
    ['💰 Sell now before it drops more', { cash: 0.5, say: 'Safe but small. 💰' }],
    ['⛏️ Mine less for a while', { team: 5, demand: [0.9, 4, 'Slower mining'], say: 'Rest time for miners. ⛏️' }]
  ]);
  B('goldmine', 'fools_gold', '✨', 'Is it gold... or FOOL\'S gold?', 'Your miners found a huge shiny vein. It could be gold. It could be "fool\'s gold", a shiny rock that\'s worth nothing.', [
    ['🔬 Test it in a lab', { cash: -0.1, chance: { p: 0.5, win: { cash: 3, say: 'REAL GOLD! 🔬✨' }, lose: { say: 'Fool\'s gold. Good thing you checked! 🔬' } } }],
    ['⛏️ Dig it all out right away', { cash: -0.5, chance: { p: 0.5, win: { cash: 4, say: 'Real gold! Big win! ⛏️' }, lose: { cash: -0.5, say: 'Fool\'s gold. You wasted a week. 😩' } } }],
    ['🎁 Sell fool\'s gold as souvenirs', { extra: [0.1, 12, 'Fool\'s gold souvenirs'], fans: 15, say: 'Tourists love shiny rocks! 🎁' }],
    ['😎 "Only real gold here"', { say: 'Ignored. Hmm, was it real? 😎' }]
  ]);
  B('goldmine', 'mine_tours', '🎟️', 'Gold mine tours?', 'Tourists want to see a real gold mine. You could take them underground with helmets and lamps!', [
    ['🎟️ Daily tours!', { cash: -0.5, extra: [0.25, 26, 'Mine tours'], fans: 25, say: 'Tourists LOVE going underground! 🎟️' }],
    ['🪙 "Pan for gold" for kids', { cash: -0.3, extra: [0.2, 26, 'Gold panning'], fans: 30, say: 'Kids find tiny gold flakes. SO excited! 🪙' }],
    ['🚂 Mine train ride', { cash: -1, extra: [0.35, 26, 'Mine train'], fans: 35, say: 'A real mine train! Kids scream with joy! 🚂' }],
    ['🙅 It\'s a mine, not a theme park', { say: 'No tourists. 🙅' }]
  ]);
  B('goldmine', 'dragon', '🐉', 'Miners say there\'s a DRAGON down there', 'Deep in the mine, miners hear roaring and see glowing eyes. They say it\'s a dragon guarding gold. Nobody will go down there. 🐉', [
    ['🔦 Go down yourself', { chance: { p: 0.8, win: { fans: 25, team: 8, say: 'It was a very loud owl in a pipe! 🦉 The team laughed for a week.' }, lose: { team: -5, say: 'You saw the eyes too. You came back up FAST. 😱' } } }],
    ['🐉 "Dragon Tunnel" tours', { fans: 40, extra: [0.15, 12, 'Dragon tours'], say: 'People pay to "meet the dragon"! 🐉' }],
    ['📹 Send a camera robot', { cash: -0.2, fans: 20, say: 'It was a family of raccoons with shiny eyes! 📹🦝' }],
    ['🧱 Close that tunnel', { capacity: [0.95, 12, 'Dragon tunnel closed'], say: 'The dragon stays a mystery forever. 🧱' }]
  ], { rarity: 'rare' });
  B('goldmine', 'safety_gear', '⛑️', 'New safety gear?', '{a} says the helmets and lamps are old. New gear is expensive but much safer.', [
    ['⛑️ Best gear for everyone', { cash: -0.8, team: 10, rep: 5, say: 'Safe and happy miners! ⛑️' }],
    ['📡 Smart helmets with radios', { cash: -1.2, team: 12, equip: 0.03, say: 'Miners can talk from anywhere! 📡' }],
    ['🔦 Just new lamps', { cash: -0.2, team: 3, say: 'Brighter tunnels. 🔦' }],
    ['🙅 The old ones work', { team: -8, rep: -3, say: 'Miners feel you don\'t care. 🙅' }]
  ], FRONT);

  // 🎢 THEME PARK
  B('themepark', 'fastest_coaster', '🎢', 'The world\'s fastest roller coaster?', 'Engineers can build a coaster that goes 250 km/h. It would be the fastest in the world!', [
    ['🎢 Build it!', { cash: -4, demand: [1.35, 52, 'World\'s fastest coaster'], fans: 60, say: 'People come from other countries to ride it! 🎢' }],
    ['🌀 Build the LOOPIEST coaster instead', { cash: -3, demand: [1.25, 52, 'Loop coaster'], fans: 45, say: '14 loops! People scream the whole time! 🌀' }],
    ['🧒 A fun coaster for little kids', { cash: -1, demand: [1.12, 52, 'Kids coaster'], rep: 5, say: 'Families love it! 🧒' }],
    ['🙅 Too expensive', { say: 'The old coasters are still fun. 🙅' }]
  ]);
  B('themepark', 'mascot_heat', '🥵', 'The mascot fainted from the heat!', 'It\'s 35°C and your mascot, in a big fluffy costume, fainted in front of kids. The mascot is okay, just hot. 🥵', [
    ['🧊 Cooling vests in all costumes', { cash: -0.3, team: 8, rep: 4, say: 'Cool mascots! 🧊' }],
    ['⏱️ 20-minute shifts only', { team: 6, capacity: [0.97, 12, 'Short shifts'], say: 'Happy, safe mascots! ⏱️' }],
    ['💦 Water spray zones everywhere', { cash: -0.5, happy: 6, fans: 15, say: 'Everyone stays cool! 💦' }],
    ['😬 "Just drink water"', { team: -8, say: 'The team is not happy. 😬' }]
  ]);
  B('themepark', 'lost_kids', '🧒', 'SO many lost kids!', 'On busy days, lots of kids get lost. Parents are panicking. You need a better system!', [
    ['📿 Wristbands with parents\' numbers', { cash: -0.3, rep: 8, say: 'Every lost kid is found in minutes! 📿' }],
    ['🏠 A fun "lost kids" room with games', { cash: -0.4, rep: 6, fans: 10, say: 'Some kids didn\'t want to be found. 😂' }],
    ['📱 Phone tracking app', { cash: -0.6, rep: 7, say: 'Parents can see where kids are! 📱' }],
    ['📢 Just announce names', { rep: -1, say: 'Very noisy announcements all day. 📢' }]
  ]);
  B('themepark', 'splash_vip', '💦', 'The water ride SOAKED a VIP', 'The log ride splashed a famous businessman in a very expensive suit. He is dripping and furious. His kids think it\'s hilarious.', [
    ['👔 Pay for a new suit', { cash: -0.3, rep: 3, say: 'He calmed down. 👔' }],
    ['📸 Give him the ride photo framed', { fans: 20, chance: { p: 0.6, win: { say: 'He laughed and hung it in his office! 📸' }, lose: { say: 'He was NOT amused. 📸' } } }],
    ['🎟️ Free VIP day for his family', { cash: -0.1, rep: 5, say: 'His kids had the best day ever! 🎟️' }],
    ['💦 "Water rides make you wet"', { rep: -3, say: 'True. Not helpful. 💦' }]
  ]);
  B('themepark', 'rainy_park', '🌧️', 'Rain all weekend', 'It\'s raining all weekend. The park is empty. The rides are wet.', [
    ['🧥 Free ponchos + half price', { cash: -0.2, demand: [1.1, 1, 'Rain deal'], fans: 15, say: 'People came in ponchos and had fun anyway! 🧥' }],
    ['🎭 Indoor shows and games', { cash: -0.4, extra: [0.2, 1, 'Indoor shows'], say: 'Indoor fun saved the weekend! 🎭' }],
    ['🏗️ Build an indoor area', { cash: -2, demand: [1.1, 104, 'Indoor park'], say: 'Rain or shine, always open! 🏗️' }],
    ['🔒 Close for the weekend', { closed: [1, 'Rain'], say: 'A quiet, wet weekend. 🔒' }]
  ]);
  B('themepark', 'fireworks', '🎆', 'A giant fireworks show?', 'A fireworks company offers the biggest show ever for the park\'s birthday. 10,000 fireworks!', [
    ['🎆 Yes! Biggest show ever!', { cash: -0.8, fans: 50, extra: [0.4, 1, 'Fireworks night'], say: 'The sky exploded with color! Best night ever! 🎆' }],
    ['🎶 Fireworks with music', { cash: -1, fans: 55, extra: [0.4, 1, 'Fireworks night'], say: 'The music and fireworks together made people cry! 🎶' }],
    ['🚁 A drone light show instead', { cash: -0.7, fans: 45, rep: 4, say: 'Drones made a giant roller coaster in the sky! 🚁' }],
    ['🙅 Too loud for the animals nearby', { rep: 3, say: 'Quiet birthday. 🙅' }]
  ]);
  B('themepark', 'haunted_ride', '👻', 'A haunted house ride?', 'Teens want something SCARY. {a} designed a haunted house ride with real actors jumping out.', [
    ['👻 Build it!', { cash: -1.5, demand: [1.15, 52, 'Haunted ride'], fans: 35, say: 'The screams can be heard from the parking lot! 👻' }],
    ['🎃 Only in October', { cash: -0.5, extra: [0.4, 4, 'Halloween ride'], fans: 20, say: 'The October special sells out! 🎃' }],
    ['😱 Make it the SCARIEST in the world', { cash: -2, chance: { p: 0.6, win: { demand: [1.2, 52, 'Scariest ride'], fans: 50, say: 'Record-breaking scares! 😱' }, lose: { rep: -4, say: 'Too scary. People complained. 😱' } } }],
    ['🙅 Keep the park happy, not scary', { a: -5, say: 'Happy park. 🙅' }]
  ], FRONT);

  // 🚀 SPACE COMPANY
  B('space', 'launch_delay', '⏳', 'The launch is delayed', 'The rocket is ready, but the weather is bad. Millions are watching the countdown live. Launch or wait?', [
    ['⏳ Wait for better weather', { rep: 3, chance: { p: 0.9, win: { fans: 20, say: 'Perfect launch 2 days later! 🚀' }, lose: { say: 'Another delay. 😩' } } }],
    ['🚀 LAUNCH!', { chance: { p: 0.6, win: { fans: 40, rep: 5, say: 'Perfect launch in the storm! Legendary! 🚀' }, lose: { cash: -3, rep: -8, say: 'The rocket had problems. Mission failed. 😱' } } }],
    ['🎤 Fun live show during the wait', { fans: 25, say: 'Viewers loved the astronaut Q&A! 🎤' }],
    ['🔬 Check everything again', { cash: -0.3, rep: 4, say: 'Safe and careful. 🔬' }]
  ]);
  B('space', 'test_boom', '💥', 'The test rocket EXPLODED', 'Your test rocket blew up 30 seconds after launch. Nobody was on board. The video is everywhere.', [
    ['😎 "We learned a LOT!"', { rep: 3, fans: 30, say: 'Engineers say the data is super useful! 😎' }],
    ['🔧 Fix everything and try again', { cash: -2, equip: 0.04, say: 'The next one flew perfectly! 🔧' }],
    ['📹 Share the slow-motion video', { fans: 40, say: 'The most beautiful explosion ever filmed! 📹' }],
    ['😢 Pause the program', { rep: -3, say: 'Fans are sad. 😢' }]
  ]);
  B('space', 'space_tourist', '🧑‍🚀', 'A billionaire wants to go to SPACE', 'A billionaire offers a HUGE amount of money for a 10-minute trip to space. They want to take their cat.', [
    ['🚀 Take them (and the cat)', { cash: 5, fans: 40, say: 'The first cat tourist in space! 🐱🚀' }],
    ['🚀 Take them (no cat)', { cash: 5, fans: 20, say: 'The billionaire loved it. The cat stayed home. 🚀' }],
    ['🎟️ Space trips for everyone', { cash: -2, extra: [0.5, 26, 'Space tourism'], fans: 50, say: 'Space tourism business is booming! 🎟️' }],
    ['🙅 Space is for science', { rep: 5, say: 'Scientists respect you. 🙅' }]
  ], { rarity: 'rare' });
  B('space', 'moon_base', '🌕', 'Build a Moon base?', 'Your scientists have a plan to build a small base on the Moon. It\'s the dream. It\'s super expensive.', [
    ['🌕 Build it!', { cash: -6, fans: 100, rep: 15, say: 'YOUR FLAG IS ON THE MOON! History made! 🌕🚩' }],
    ['🤝 Team up with other countries', { cash: -3, fans: 60, rep: 12, say: 'A shared Moon base! Humanity together! 🤝' }],
    ['🤖 Send robots first', { cash: -2, fans: 30, equip: 0.03, say: 'Robots are building the base! 🤖' }],
    ['🙅 Not yet', { say: 'Someday. 🙅' }]
  ], { rarity: 'epic' });
  B('space', 'astro_selfie', '🤳', 'The astronaut took the BEST selfie', 'Your astronaut took a selfie with Earth in the background. It\'s the most liked photo in history!', [
    ['📱 Share it everywhere', { fans: 60, say: 'Millions of likes! 📱🌍' }],
    ['🖼️ Sell posters of it', { extra: [0.2, 12, 'Space selfie posters'], fans: 30, say: 'On every kid\'s wall! 🖼️' }],
    ['🏫 Astronaut video call with schools', { rep: 10, fans: 40, say: 'Kids asked "how do you pee in space?" 😂' }],
    ['🤳 "Selfie contest from space"', { fans: 45, say: 'The funniest space selfies ever! 🤳' }]
  ]);
  B('space', 'alien_signal', '📡', 'A strange signal from space!', 'Your space telescope picked up a strange signal that repeats every 7 minutes. It doesn\'t look natural... 👽📡', [
    ['📢 Tell the whole world!', { fans: 80, rep: 5, say: 'Everyone on Earth is talking about it! 📢' }],
    ['🔬 Study it quietly first', { rep: 6, chance: { p: 0.3, win: { fans: 100, say: 'It\'s REAL. It\'s not from Earth. 👽🤯' }, lose: { say: 'It was a microwave in the break room. 😂' } } }],
    ['📡 Send a message back', { fans: 60, chance: { p: 0.1, win: { rep: 20, fans: 100, say: 'THEY ANSWERED. 👽' }, lose: { say: 'No answer. Yet. 📡' } } }],
    ['🍿 Make a movie about it', { cash: 1, fans: 30, say: 'A hit sci-fi movie! 🍿' }]
  ], { rarity: 'legendary' });
  B('space', 'space_junk', '🛰️', 'Space junk is everywhere', 'Old satellites and rocket pieces are floating around Earth. One almost hit your new satellite!', [
    ['🧹 Build a space junk cleaner', { cash: -2, rep: 12, fans: 30, say: 'Your space vacuum is cleaning up orbit! 🧹🛰️' }],
    ['🛡️ Shield your satellites', { cash: -1, equip: 0.03, say: 'Tough satellites! 🛡️' }],
    ['🤝 Rules for all space companies', { rep: 8, say: 'Everyone agreed to clean up! 🤝' }],
    ['🤞 Space is big', { chance: { p: 0.7, win: { say: 'Nothing hit. This time. 🤞' }, lose: { cash: -2, say: 'A piece hit your satellite. Expensive! 💥' } } }]
  ]);

  // 📲 SOCIAL MEDIA APP
  B('socialapp', 'viral_filter', '🐶', 'A filter went MEGA viral', 'Your new filter that turns people into talking potatoes is everywhere. 50 million people used it today! 🥔', [
    ['🥔 Make 10 more food filters', { cash: -0.3, fans: 50, demand: [1.15, 12, 'Filter craze'], say: 'Talking pizza, talking broccoli... the internet loves it! 🥔' }],
    ['💰 Let brands pay for filters', { extra: [0.4, 12, 'Brand filters'], say: 'Brands pay big for their own filters! 💰' }],
    ['🏆 Filter design contest', { fans: 40, say: 'Users made 10,000 new filters! 🏆' }],
    ['😎 Enjoy it', { fans: 25, say: 'Potatoes everywhere. 😎' }]
  ]);
  B('socialapp', 'data_leak', '🔓', 'A data leak!', 'A hacker got into your system and stole some users\' emails. The news is about to find out.', [
    ['📢 Tell users first, and say sorry', { cash: -1, rep: 5, say: 'Honest and fast. Users trust you more. 📢' }],
    ['🔐 Super strong security', { cash: -2, rep: 8, equip: 0.03, say: 'The safest app on the internet now! 🔐' }],
    ['🎁 Free premium for a year for everyone hit', { cash: -1.5, rep: 7, say: 'Users forgave you. 🎁' }],
    ['🤫 Hide it', { rep: -20, say: 'The news found out. HUGE scandal. 😱' }]
  ]);
  B('socialapp', 'bots', '🤖', 'Bots are EVERYWHERE', 'Millions of fake accounts are posting spam. Real users are getting annoyed.', [
    ['🧹 Delete all the bots', { cash: -1, rep: 8, fans: -20, say: 'Your user count dropped, but real users are happy! 🧹' }],
    ['✅ "I\'m not a robot" checks', { cash: -0.5, rep: 5, say: 'Fewer bots! ✅' }],
    ['🤖 Let bots label themselves', { rep: 3, fans: 10, say: 'Funny bot labels. Users can tell now! 🤖' }],
    ['🙈 More users = good', { rep: -8, say: 'Real users are leaving. 🙈' }]
  ]);
  B('socialapp', 'dance_trend', '💃', 'A dance trend EXPLODED on your app', 'A 30-second dance is everywhere on your app. Even grandparents are doing it!', [
    ['🎵 Pay the song\'s artist a bonus', { cash: -0.3, rep: 6, fans: 30, say: 'The artist became a star thanks to your app! 🎵' }],
    ['💃 Dance contest with prizes', { cash: -0.5, fans: 60, say: 'The contest broke records! 💃' }],
    ['👵 "Grandma dance" special', { fans: 50, say: 'Grandmas are the new stars! 👵' }],
    ['😎 Let it flow', { fans: 30, say: 'Dancing everywhere. 😎' }]
  ]);
  B('socialapp', 'app_down', '💥', 'THE APP IS DOWN', 'Your app crashed worldwide. 100 million people can\'t post. People are panicking on OTHER apps. 😱', [
    ['👩‍💻 All engineers on it!', { team: -6, chance: { p: 0.8, win: { rep: 2, say: 'Back in 2 hours! Phew! 👩‍💻' }, lose: { rep: -5, say: 'Down for a whole day. Painful. 😩' } } }],
    ['😂 Post "we\'re fixing it, go outside"', { fans: 30, rep: 3, say: 'People loved it! Some actually went outside! 🌳' }],
    ['🔧 Backup servers everywhere', { cash: -2, rep: 5, equip: 0.04, say: 'It will never go down like that again. 🔧' }],
    ['🤐 Say nothing', { rep: -6, say: 'Users are furious. 🤐' }]
  ]);
  B('socialapp', 'creators_leave', '📤', 'Top creators want to leave', 'Your biggest creators say another app pays them more. They\'re thinking of moving.', [
    ['💰 Creator fund', { cash: -1.5, rep: 6, fans: 20, say: 'Creators stay and make more videos! 💰' }],
    ['🎥 Better tools for creators', { cash: -0.8, rep: 4, say: 'Creators love the new editing tools! 🎥' }],
    ['🤝 Personal meetings with each one', { rep: 5, say: 'Most of them stayed! 🤝' }],
    ['👋 "New creators will come"', { fans: -30, say: 'They left. Users followed. 👋' }]
  ]);
  B('socialapp', 'kids_under13', '🧒', 'Young kids are using your app', 'Lots of kids under 13 are using your app, even though it\'s for teens and adults. Parents are worried.', [
    ['🧒 A safe "kids mode" with parent controls', { cash: -1, rep: 12, say: 'Parents love it! Kids are safe! 🧒' }],
    ['🪪 Better age checks', { cash: -0.5, rep: 8, fans: -10, say: 'Safer app. Fewer users, but that\'s okay. 🪪' }],
    ['📚 Safety guide for families', { rep: 6, fans: 10, say: 'Families feel better. 📚' }],
    ['🤷 "They lied about their age"', { rep: -12, say: 'Parents and newspapers are angry. 🤷' }]
  ]);
})();
