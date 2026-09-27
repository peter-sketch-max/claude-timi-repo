// Events that only happen in one kind of business, part 2: the medium businesses.
// B(business, id, icon, title, text, [4 x [answer, effect]], extra fields) — defined in events-biz1.js.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var B = CS.biz, H = CS.EVH, rival = H.rival, FRONT = { who: { a: 'front' } };
  function inWeeks(ind, from, to) { return function (g) { var w = ((g.week - 1) % 52) + 1; return g.company.industry === ind && w >= from && w <= to; }; }

  // 🛒 SUPERMARKET
  B('supermarket', 'cart_escape', '🛒', 'The shopping carts escaped!', 'Strong wind blew 40 shopping carts down the hill. They\'re rolling toward the lake! 🛒🛒🛒💨', [
    ['🏃 Everyone chase the carts!', { team: 6, fans: 15, say: 'The Great Cart Chase! You saved 39. One is in the lake forever. 🏃' }],
    ['🔒 Buy cart locks', { cash: -0.3, say: 'Coin-lock carts. No more escapes. 🔒' }],
    ['📹 Film it', { chance: { p: 0.45, win: { viral: [1, 3], say: '"Carts go for a swim" went viral! 📹' }, lose: { fans: 10, say: 'Funny video. Wet carts. 📹' } } }],
    ['🦆 Let the lake keep them', { cash: -0.4, say: 'The ducks have carts now. 🦆' }]
  ]);
  B('supermarket', 'panic_buying', '🧻', 'PANIC BUYING!', 'A silly rumor says there will be no toilet paper next month. People are filling carts with 50 rolls each! 🧻😱', [
    ['🧻 Limit 2 per person', { rep: 4, say: 'Fair for everyone! 🧻' }],
    ['💰 Sell as much as they want', { extra: [0.35, 1, 'Panic buying'], rep: -3, say: 'Big sales... but people are angry at you. 💰' }],
    ['📢 Tell everyone the rumor is fake', { rep: 5, fans: 10, say: 'Calm returned. People trust you. 📢' }],
    ['😂 Make a toilet paper castle display', { fans: 20, say: 'The TP castle is on the news! 😂' }]
  ]);
  B('supermarket', 'sample_eater', '🧀', 'Someone ate ALL the free samples', 'A man walked around the store eating EVERY free sample. Twice. 200 cheese cubes. He hasn\'t bought anything. 🧀', [
    ['😂 Give him a "Sample King" crown', { fans: 15, say: 'He was so embarrassed he bought 10 kilos of cheese. 👑' }],
    ['📏 "One per person" sign', { say: 'Samples for everyone now. 📏' }],
    ['🍽️ Give him a job as taste tester', { hireSpecial: { role: 'front', skill: 40 }, fans: 10, say: 'Best taste tester ever! 🍽️' }],
    ['🚪 Ask him to leave', { rep: -1, say: 'He left. With a cheese cube in each pocket. 🚪' }]
  ]);
  B('supermarket', 'one_checkout', '🧍', 'Only ONE checkout open!', 'It\'s Saturday, everyone is shopping... and only one checkout is open. The line goes to the frozen food aisle.', [
    ['📢 "Everyone to the registers!"', { capacity: [1.15, 1, 'All registers'], team: -3, say: 'Lines gone in 10 minutes! 📢' }],
    ['🤖 Buy self-checkouts', { cash: -1, capacity: [1.1, 52, 'Self-checkout'], say: 'Fast lines forever! 🤖' }],
    ['👥 Hire weekend helpers', { hireSpecial: { role: 'front', skill: 45 }, say: 'More hands, faster lines. 👥' }],
    ['😬 Hope they wait', { happy: -5, say: 'Some left their carts and walked out. 😬' }]
  ]);
  B('supermarket', 'dollar_tvs', '📺', 'TVs for $1?!', '{a} made a mistake on the price tags. Big TVs are marked $1. There\'s a crowd grabbing them! 📺😱', [
    ['💸 Honor the price', { cash: -1.5, rep: 8, fans: 40, say: 'You lost money but the whole country is talking about you! 💸' }],
    ['🙏 Say sorry and give coupons', { cash: -0.2, rep: 2, say: 'Most people understood. 🙏' }],
    ['📺 Only the first 10 get it', { cash: -0.3, fans: 20, rep: 3, say: 'The lucky 10 went viral! 📺' }],
    ['🔒 Stop all sales', { rep: -5, happy: -5, say: 'People are mad. Very mad. 🔒' }]
  ], FRONT);
  B('supermarket', 'store_brand', '🏷️', 'Your own store brand?', 'You could make your own cheaper brand of cereal, milk and snacks with your logo on them.', [
    ['🏷️ Launch "{company} Basics"', { cash: -0.8, supply: [-0.04, 52, 'Store brand'], fans: 10, say: 'Cheaper for customers, better for you! 🏷️' }],
    ['🥇 A fancy premium brand', { cash: -1, extra: [0.2, 20, 'Premium brand'], say: 'Fancy jam in fancy jars! 🥇' }],
    ['🧪 Test with one product', { cash: -0.2, supply: [-0.01, 26, 'Store cereal'], say: '"{company} Cereal" is a hit! 🧪' }],
    ['🙅 Stick to big brands', { say: 'Safe choice. 🙅' }]
  ]);
  B('supermarket', 'black_friday', '🛍️', 'BLACK FRIDAY MADNESS', 'It\'s Black Friday! Hundreds of people are waiting outside at 5 AM. When the doors open, it will be chaos! 🛍️', [
    ['💥 Huge discounts!', { demand: [1.4, 1, 'Black Friday'], price: -1, say: 'Record day! The floor is a mess! 💥' }],
    ['🎟️ Ticket system to keep it safe', { demand: [1.25, 1, 'Black Friday'], rep: 4, say: 'Safe and busy. Nicely done! 🎟️' }],
    ['🌐 Move sales online', { cash: -0.3, extra: [0.5, 1, 'Online Black Friday'], say: 'Online orders exploded! 🌐' }],
    ['🛌 "Buy Nothing Day" instead', { rep: 5, fans: 15, say: 'A bold move. People respect it! 🛌' }]
  ], { cond: inWeeks('supermarket', 46, 48) });

  // 🏨 HOTEL
  B('hotel', 'rockstar_room', '🎸', 'A rock star trashed a room!', 'A famous rock star stayed in your best suite. The TV is in the pool. The bed is on the balcony. There\'s glitter everywhere. 🎸', [
    ['🧾 Send them a big bill', { cash: 1, say: 'They paid it all, plus a signed guitar! 🧾🎸' }],
    ['🖼️ Make it the "Rock Star Suite"', { cash: -0.3, fans: 25, extra: [0.12, 12, 'Rock Star Suite'], say: 'Fans pay extra to sleep in THE room! 🖼️' }],
    ['🚫 Ban them forever', { rep: 2, say: 'No more rock stars! 🚫' }],
    ['📰 Tell the newspapers', { fans: 20, rep: -2, say: 'Big story! The rock star is annoyed. 📰' }]
  ]);
  B('hotel', 'overbooked', '📋', 'Overbooked by 20 rooms!', 'A big conference is in town and your system booked 20 more guests than you have rooms. They\'re arriving NOW. 😱', [
    ['🏨 Pay for rooms at another hotel', { cash: -0.6, rep: 3, say: 'Everyone had a bed. Expensive, but classy. 🏨' }],
    ['🛋️ Turn the lobby into a "sleepover"', { fans: 10, happy: -4, say: 'Pillows and movies in the lobby. Some loved it. Some didn\'t. 🛋️' }],
    ['🎁 Free upgrades for early guests to share', { happy: 2, say: 'Some friends shared the big suites! 🎁' }],
    ['🔧 Fix the booking system', { cash: -0.4, equip: 0.03, say: 'Never again! 🔧' }]
  ]);
  B('hotel', 'bedbugs', '🐛', 'A guest says there are BEDBUGS', 'A guest is shouting in the lobby that room 12 has bedbugs. Other guests are listening... and scratching. 🐛', [
    ['🔍 Check the room right now', { chance: { p: 0.7, win: { rep: 3, say: 'No bugs! It was a crumb. Phew! 🔍' }, lose: { cash: -0.4, rep: -3, say: 'There WERE bugs. Pest control called. 🐛' } } }],
    ['🎁 Free night and a new room', { cash: -0.1, happy: 3, say: 'The guest calmed down. 🎁' }],
    ['🧪 Pest control for the whole hotel', { cash: -0.8, rep: 5, say: 'The cleanest hotel in {city}! 🧪' }],
    ['🤫 "We\'ve never had bugs!"', { rep: -6, say: 'They posted photos. Oh no. 😬' }]
  ]);
  B('hotel', 'forever_guest', '🧳', 'The guest who won\'t leave', 'A guest checked in for one night... 3 months ago. He pays every day, but now he gives tours of "HIS hotel" to other guests.', [
    ['🎩 Make him the official tour guide', { fans: 15, happy: 3, say: 'Guests LOVE his tours! 🎩' }],
    ['💲 Offer a monthly price', { extra: [0.08, 20, 'Long-stay guest'], say: 'He\'s basically family now. 💲' }],
    ['🧳 Politely ask him to leave', { say: 'He cried a little, then left. 🧳' }],
    ['📰 Local newspaper story', { fans: 20, say: '"The Man Who Lives in a Hotel" is a famous story now! 📰' }]
  ]);
  B('hotel', 'rooftop_pool', '🏊', 'Rooftop pool party?', 'Guests keep asking for a rooftop pool party. It could be amazing... or loud and messy.', [
    ['🎉 Weekly pool parties!', { cash: -0.4, extra: [0.25, 8, 'Pool parties'], fans: 20, say: 'The coolest parties in {city}! 🎉' }],
    ['🍹 Calm "sunset nights"', { extra: [0.15, 8, 'Sunset nights'], rep: 3, say: 'Classy and relaxing. 🍹' }],
    ['🏗️ Build a bigger pool first', { cash: -1.5, demand: [1.12, 26, 'Big rooftop pool'], say: 'The new infinity pool is stunning! 🏗️' }],
    ['🙅 Too noisy', { say: 'Quiet nights. 🙅' }]
  ]);
  B('hotel', 'wedding_booking', '💒', 'A wedding books the WHOLE hotel', 'A big family wants every room for a 3-day wedding. They want a band, fireworks and 400 cupcakes.', [
    ['💒 Yes to everything!', { cash: 2, team: -8, say: 'The wedding of the year! Everyone is tired. 💒' }],
    ['🎆 Yes, but no fireworks', { cash: 1.5, rep: 2, say: 'Safe and lovely. 🎆' }],
    ['💲 Charge a premium price', { cash: 2.4, happy: -2, say: 'They paid, but grumbled. 💲' }],
    ['🙅 Keep rooms for normal guests', { rep: 1, say: 'Regular guests are happy. 🙅' }]
  ]);
  B('hotel', 'lost_luggage', '🧳', 'A guest\'s luggage went missing', 'A famous businesswoman says her bag with a very important dress disappeared from the lobby. Her big speech is tonight!', [
    ['🔍 Search every room', { team: -3, chance: { p: 0.7, win: { rep: 5, say: 'Found it in the wrong room! She gave a great speech! 🔍' }, lose: { say: 'Not found. 😬' } } }],
    ['👗 Buy her a new dress fast', { cash: -0.3, rep: 6, say: 'She looked amazing and told everyone about your service! 👗' }],
    ['📹 Check the cameras', { chance: { p: 0.5, win: { rep: 4, say: 'A guest took it by mistake! Returned! 📹' }, lose: { say: 'The cameras were off. 📹' } } }],
    ['🤷 "Not our fault"', { rep: -5, say: 'She wrote a VERY bad review. 🤷' }]
  ]);

  // 🏋️ GYM
  B('gym', 'january_rush', '🎆', 'New Year, new gym members!', 'It\'s January! Everyone promised to "get fit this year". The gym is PACKED. (By February, half will stop coming.)', [
    ['💪 Sign up everyone!', { extra: [0.5, 2, 'New Year signups'], team: -4, say: 'So many new members! 💪' }],
    ['🎓 Free "first week" classes', { cash: -0.2, rep: 4, demand: [1.1, 8, 'New members stay'], say: 'More people keep coming after January! 🎓' }],
    ['📆 Yearly plans only', { extra: [0.7, 1, 'Yearly plans'], happy: -3, say: 'Big money now. Some grumbling. 📆' }],
    ['🧃 Motivation smoothies', { cash: -0.1, fans: 10, say: 'Everyone loves the free smoothies! 🧃' }]
  ], { cond: inWeeks('gym', 1, 4) });
  B('gym', 'grunter', '😤', 'The LOUDEST grunter', 'A huge guy yells "HUUURRGH!" every time he lifts. Every. Single. Time. Other members can\'t hear their music.', [
    ['🤫 A polite "quiet please" sign', { happy: 2, say: 'He grunts quieter. A bit. 🤫' }],
    ['🏆 Hold a grunting contest', { fans: 25, say: 'The grunting contest was on TV. What? 🏆' }],
    ['🎧 Free headphones for members', { cash: -0.2, happy: 4, say: 'Nobody hears him now! 🎧' }],
    ['🎤 Make him the gym mascot', { fans: 15, say: '"The Grunter" is famous now. 🎤' }]
  ]);
  B('gym', 'treadmill_launch', '🏃', 'The treadmill LAUNCHED someone', 'A treadmill went super fast by itself and launched a member into a pile of yoga balls. They\'re fine. Everyone saw it. 😂', [
    ['🔧 Fix all the treadmills', { cash: -0.5, rep: 3, say: 'Safe treadmills. No more flying. 🔧' }],
    ['🆕 Buy new treadmills', { cash: -1.2, equip: 0.04, rep: 4, say: 'Brand new, super smooth! 🆕' }],
    ['🎁 Free month for the member', { cash: -0.05, happy: 3, say: 'They laughed about it. 🎁' }],
    ['📹 "Ninja treadmill" video', { chance: { p: 0.5, win: { viral: [1, 3], say: 'It went viral! Membership signups went UP. 📹' }, lose: { rep: -3, say: 'People think your gym is dangerous. 😬' } } }]
  ]);
  B('gym', 'bodybuilding', '💪', 'Host a bodybuilding contest?', 'The {city} Muscle Championship needs a new place. They want YOUR gym!', [
    ['💪 Host it!', { cash: -0.3, fans: 30, demand: [1.12, 6, 'Muscle Championship'], say: 'Oiled muscles everywhere! Huge crowd! 💪' }],
    ['🏋️ Enter your best trainer', { chance: { p: 0.4, win: { fans: 40, rep: 5, say: 'Your trainer WON! 🏆' }, lose: { fans: 10, say: 'Third place. Not bad! 🥉' } } }],
    ['🧘 Host a yoga contest instead', { fans: 12, rep: 3, say: 'Calm, bendy and lovely. 🧘' }],
    ['🙅 Too much oil on the floor', { say: 'Fair. 🙅' }]
  ]);
  B('gym', 'smoothie_bar', '🥤', 'Open a smoothie bar?', 'Members are thirsty after workouts. {a} wants to open a smoothie bar at the front desk.', [
    ['🥤 Yes! Protein smoothies!', { cash: -0.4, extra: [0.15, 20, 'Smoothie bar'], say: 'The smoothie bar makes great money! 🥤' }],
    ['🥦 Only green veggie smoothies', { cash: -0.3, extra: [0.08, 20, 'Green smoothies'], rep: 2, say: 'Healthy but... green. 🥦' }],
    ['🍫 Chocolate milkshakes', { cash: -0.3, extra: [0.2, 20, 'Milkshakes'], rep: -1, say: 'Popular. Maybe not very healthy. 🍫' }],
    ['🙅 Water is free', { a: -4, say: 'Water fountain it is. 🙅' }]
  ], FRONT);
  B('gym', 'fitness_influencer', '📱', '{a} became a fitness influencer', '{a}\'s workout videos have 500,000 followers! People want to train with {a}.', [
    ['📱 "Train with {a}" classes', { extra: [0.2, 12, '{a} classes'], a: 10, fans: 20, say: 'Classes sold out instantly! 📱' }],
    ['🎥 Film videos AT the gym', { fans: 30, say: 'Free ads for your gym every day! 🎥' }],
    ['💵 Big raise so {a} doesn\'t leave', { raise: ['a', 0.25], loyal: { a: 25 }, say: '{a} stays! 💵' }],
    ['🙅 "Work, not videos"', { a: -10, chance: { p: 0.4, win: { say: '{a} stays... unhappy. 🙅' }, lose: { quit: 'a', say: '{a} left to be a full-time influencer. 😢' } } }]
  ], FRONT);
  B('gym', 'open_247', '🌙', 'Open 24 hours?', 'Night-shift workers and early birds want the gym open all night. It would need more staff and security.', [
    ['🌙 24/7 gym!', { cash: -0.4, demand: [1.15, 26, 'Open 24/7'], team: -5, say: 'Members work out at 3 AM! 🌙' }],
    ['🔑 Key cards, no staff at night', { cash: -0.6, demand: [1.1, 52, 'Key card access'], say: 'Smart and cheap! 🔑' }],
    ['⏰ Open at 5 AM instead', { demand: [1.05, 26, 'Early hours'], say: 'Early birds are happy. ⏰' }],
    ['🛌 Sleep is exercise too', { team: 3, say: 'Normal hours. Happy team. 🛌' }]
  ]);

  // 🏗️ CONSTRUCTION
  B('construction', 'crane_cat', '🐈', 'A cat is stuck on the crane!', 'A cat climbed to the top of your 50-meter crane and won\'t come down. Work has stopped. The whole street is watching. 🐈', [
    ['🏗️ Lower the crane super slowly', { fans: 25, say: 'The cat rode down like a queen. Everyone cheered! 🐈👑' }],
    ['🚒 Call the fire department', { rep: 3, say: 'The firefighters saved the cat. Heroes! 🚒' }],
    ['🐟 Tempt it with tuna', { chance: { p: 0.6, win: { fans: 15, say: 'The tuna worked! 🐟' }, lose: { demand: [0.95, 1, 'Cat on crane'], say: 'The cat stayed up there for 2 days. 🐈' } } }],
    ['🐈 Adopt the cat', { pet: '🐈', fans: 12, say: 'The site cat, "Crane", is your new mascot! 🐈' }]
  ]);
  B('construction', 'old_tunnel', '🕳️', 'An old tunnel under the site!', 'While digging, {a} found an old tunnel. It goes somewhere deep under the city. 🕳️', [
    ['🔦 Explore it', { chance: { p: 0.4, win: { cash: 2, fans: 20, say: 'An old secret wine cellar! Museums paid a lot! 🔦' }, lose: { closed: [1, 'Tunnel check'], say: 'Just an old sewer. Stinky. 🤢' } } }],
    ['🏛️ Call the historians', { rep: 6, closed: [1, 'History check'], say: 'It\'s a 200-year-old tunnel! You\'re in the history books! 🏛️' }],
    ['🧱 Fill it with concrete', { say: 'Gone forever. 🧱' }],
    ['🎟️ Tunnel tours!', { cash: -0.3, extra: [0.15, 8, 'Tunnel tours'], say: 'Tourists love the spooky tunnel! 🎟️' }]
  ], FRONT);
  B('construction', 'rain_delay', '🌧️', 'Rain is delaying the project', 'It has rained for 3 weeks. The building is late and the client is VERY angry.', [
    ['⛺ Build a giant tent over the site', { cash: -0.6, capacity: [1.1, 4, 'Rain tent'], say: 'Working in the rain! 🌧️⛺' }],
    ['🔥 Work weekends when it stops', { team: -8, say: 'Caught up! Everyone is exhausted. 🔥' }],
    ['📞 Explain and give a discount', { cash: -0.3, rep: 3, say: 'The client understood. 📞' }],
    ['🤷 "We can\'t control the weather"', { rep: -3, say: 'The client is not happy. 🤷' }]
  ]);
  B('construction', 'cheap_concrete', '🧱', 'Super cheap concrete?', 'A new supplier offers concrete for half price. {a} says it looks "a bit crumbly".', [
    ['💸 Buy it', { supply: [-0.05, 12, 'Cheap concrete'], chance: { p: 0.4, win: { say: 'It was fine! Big savings. 💸' }, lose: { rep: -12, cash: -2, say: 'A wall cracked! Everything had to be rebuilt! 😱' } } }],
    ['🔬 Test it in a lab', { cash: -0.1, chance: { p: 0.4, win: { supply: [-0.04, 12, 'Cheap concrete'], say: 'It passed the test! 🔬' }, lose: { say: 'Failed! Good thing you checked. 🔬' } } }],
    ['🏆 Only the best concrete', { rep: 3, say: 'Safe buildings. Happy clients. 🏆' }],
    ['👮 Report the supplier', { rep: 2, say: 'The supplier was selling fake stuff! 👮' }]
  ], FRONT);
  B('construction', 'tallest_tower', '🏙️', 'Build the tallest tower in {city}?', 'A rich investor wants you to build the tallest tower in {city}. It would take a year and it\'s VERY risky.', [
    ['🏙️ Let\'s build it!', { cash: -1, chance: { p: 0.6, win: { cash: 5, rep: 10, fans: 40, say: 'The tower is finished! Your name is on the skyline! 🏙️' }, lose: { cash: -1, rep: -4, say: 'The investor ran out of money halfway. 😩' } } }],
    ['📐 Only the design', { cash: 1, rep: 3, say: 'Easy money for drawings. 📐' }],
    ['🤝 Team up with a bigger builder', { cash: 2, rep: 5, say: 'Shared work, shared glory. 🤝' }],
    ['🙅 Too risky', { say: 'Safe and small. 🙅' }]
  ], { rarity: 'rare' });
  B('construction', 'treehouse', '🌳', 'A kid wants the BEST treehouse ever', 'A 9-year-old sends a drawing: a treehouse with a slide, a zip line and a secret door. "I saved $47. Is that enough?"', [
    ['🌳 Build it for $47!', { cash: -0.4, rep: 8, fans: 35, say: 'The best treehouse in the world! The video went everywhere! 🌳' }],
    ['🏠 Start a treehouse business', { cash: -0.5, extra: [0.2, 12, 'Treehouses'], fans: 15, say: 'Every kid wants one now! 🏠' }],
    ['✏️ Send a nice letter and a toy hammer', { rep: 2, say: 'The kid framed your letter. ✏️' }],
    ['🙅 "Sorry, too small a job"', { say: 'The kid will build it with their dad. 🙅' }]
  ]);
  B('construction', 'nap_mixer', '😴', 'A worker fell asleep in the cement mixer', '{a} took a nap in an empty cement mixer truck at lunch. Someone almost turned it on! 😱', [
    ['🛌 Build a real nap room', { cash: -0.2, team: 8, say: 'Safe naps for everyone! 🛌' }],
    ['🦺 Safety meeting for all', { team: 2, rep: 2, say: 'Nobody sleeps in machines now. 🦺' }],
    ['😂 Name the truck after {a}', { fans: 10, a: -3, say: 'The truck is called "{a}\'s Bed" now. 😂' }],
    ['⚠️ Warning for {a}', { a: -8, reliable: { a: 5 }, say: '{a} naps in the break room now. ⚠️' }]
  ], FRONT);

  // 🛋️ FURNITURE MAKER
  B('furniture', 'flatpack_giant', '📦', 'A giant flat-pack store opened!', 'A huge store with cheap build-it-yourself furniture opened nearby. They have meatballs. You don\'t have meatballs.', [
    ['🪵 "Real wood, made by hand" ads', { cash: -0.4, rep: 4, fans: 15, say: 'People want quality! 🪵' }],
    ['💸 Lower your prices', { price: -1, say: 'Cheaper, but less profit. 💸' }],
    ['🔧 Offer "we build it for you"', { extra: [0.15, 12, 'Building service'], say: 'People hate building flat-pack stuff. You build theirs! 🔧' }],
    ['🍖 Sell meatballs too', { cash: -0.2, fans: 20, extra: [0.08, 8, 'Meatballs'], say: 'Sofas AND meatballs. Why not? 🍖' }]
  ]);
  B('furniture', 'wobbly', '🪑', 'The tables WOBBLE', 'Customers are complaining: every table you made last month wobbles. Coffee everywhere! ☕💦', [
    ['🔧 Fix them all for free', { cash: -0.5, rep: 5, say: 'Solid as a rock now! 🔧' }],
    ['📏 New measuring machine', { cash: -0.6, equip: 0.03, say: 'Perfect legs every time! 📏' }],
    ['🎁 Free coasters', { cash: -0.05, fans: 5, say: 'Coasters under the short leg. Classic. 🎁' }],
    ['😬 "It\'s the floor"', { rep: -5, say: 'Nobody believed that. 😬' }]
  ]);
  B('furniture', 'giant_bed', '🛏️', 'A 2.3-meter basketball player needs a bed', 'A famous basketball player wants a custom bed. His feet hang off every bed in the world!', [
    ['🛏️ Make the biggest bed ever', { cash: 1, fans: 25, say: 'He slept perfectly for the first time in years! 🛏️' }],
    ['🏀 Ask him for a photo with the bed', { cash: 0.8, fans: 35, say: 'The photo was everywhere! 🏀' }],
    ['📏 Start a "tall people" line', { cash: -0.3, extra: [0.15, 12, 'Tall furniture'], say: 'Tall people finally have furniture! 📏' }],
    ['🙅 "Just sleep diagonally"', { say: 'He did not like that answer. 🙅' }]
  ], { rarity: 'rare' });
  B('furniture', 'recycled_wood', '♻️', 'Use recycled wood?', '{a} found a warehouse full of old wood from ships and barns. "It has STORIES!"', [
    ['♻️ Make a "Story Wood" line', { cash: -0.4, extra: [0.18, 16, 'Story wood'], rep: 5, say: 'Every table has a story. Customers love it! ♻️' }],
    ['🌳 Plant 2 trees for every sofa', { cash: -0.3, rep: 8, fans: 15, say: 'Good for the planet! 🌳' }],
    ['🪵 Only use it for small things', { cash: -0.1, fans: 8, say: 'Cute recycled shelves! 🪵' }],
    ['🙅 New wood is easier', { a: -4, say: 'Simple. 🙅' }]
  ], FRONT);
  B('furniture', 'confusing_instructions', '📄', 'Your instructions are TOO confusing', 'Customers keep building your chairs upside down. One built a chair into a small boat. 🪑⛵', [
    ['📹 Make video instructions', { cash: -0.2, happy: 5, say: 'Easy to follow now! 📹' }],
    ['😂 Share the funniest fails', { fans: 25, say: 'The "chair boat" is famous! 😂' }],
    ['🔧 Deliver it already built', { cash: -0.4, happy: 6, say: 'No more building! 🔧' }],
    ['🤷 "Read them again"', { happy: -4, say: 'More boats. 🤷' }]
  ]);
  B('furniture', 'cat_scratch', '🐈', 'Cats scratched every sofa!', 'A customer brought three cats to "test" sofas. Every sofa in the showroom is scratched. 🐈🐈🐈', [
    ['🐈 Make scratch-proof sofas', { cash: -0.5, extra: [0.15, 16, 'Cat-proof sofas'], fans: 15, say: 'Cat owners everywhere are buying them! 🐈' }],
    ['🧾 Make the customer pay', { cash: 0.3, rep: -2, say: 'They paid... angrily. 🧾' }],
    ['🏷️ "Cat-tested" discount sale', { cash: 0.1, fans: 10, say: 'Scratched sofas sold with a funny label! 🏷️' }],
    ['🚫 No pets in the showroom', { say: 'Rules are rules. 🚫' }]
  ]);
  B('furniture', 'tiny_house', '🏠', 'Build a tiny house?', 'People want tiny houses with smart furniture that folds and hides. It\'s a big trend!', [
    ['🏠 Build a tiny house model', { cash: -0.8, fans: 30, extra: [0.25, 12, 'Tiny houses'], say: 'Your tiny house is on TV! 🏠' }],
    ['🪑 Make folding furniture', { cash: -0.4, extra: [0.15, 12, 'Folding furniture'], say: 'A bed that becomes a table! Genius! 🪑' }],
    ['🎟️ Tiny house tours', { fans: 15, say: 'Hundreds came to look! 🎟️' }],
    ['🙅 Big furniture is better', { say: 'Big sofas it is. 🙅' }]
  ]);

  // 🔌 ELECTRONICS
  B('electronics', 'console_launch', '🎮', 'The new console launches tomorrow!', 'The new game console launches tomorrow. 200 people are camping outside your store tonight! ⛺🎮', [
    ['🍕 Bring them pizza', { cash: -0.1, rep: 4, fans: 15, say: 'The campers LOVE you! 🍕' }],
    ['🌙 Open at midnight!', { extra: [0.5, 1, 'Midnight launch'], team: -5, say: 'Midnight launch party! Sold out! 🌙' }],
    ['🎟️ Numbered tickets', { extra: [0.35, 1, 'Console launch'], rep: 3, say: 'Organized and fair! 🎟️' }],
    ['😴 Open at the normal time', { extra: [0.25, 1, 'Console launch'], happy: -3, say: 'Tired, grumpy campers. 😴' }]
  ]);
  B('electronics', 'puffy_battery', '🔋', 'A battery is PUFFING UP', 'A laptop battery in the storage room is swelling like a balloon. {a} says it\'s getting warm! 😱', [
    ['🧯 Get it outside safely, NOW', { rep: 3, say: 'Safe! The fire department said you did it right. 🧯' }],
    ['📞 Call the fire department', { closed: [1, 'Battery danger'], rep: 4, say: 'The experts took it away. 📞' }],
    ['🔍 Check all the batteries', { cash: -0.2, rep: 2, say: 'Found two more bad ones. Glad you checked! 🔍' }],
    ['👀 Poke it', { cash: -1, closed: [1, 'Small fire'], say: 'It popped! A small fire. Nobody hurt, but NEVER poke batteries! 🔥' }]
  ], FRONT);
  B('electronics', 'tv_wall', '📺', 'Show the big match on the TV wall?', 'The big football match is tonight. You have 50 TVs on the wall. People are looking through the window...', [
    ['📺 Match on ALL TVs!', { fans: 25, demand: [1.15, 2, 'Match night'], say: 'The whole street watched in your store! Sales went up! 📺⚽' }],
    ['🎟️ Watch party with a TV sale', { extra: [0.3, 1, 'Match night TV sale'], say: 'People bought TVs during halftime! 🎟️' }],
    ['🍿 Free popcorn', { cash: -0.1, fans: 15, say: 'Popcorn and football! 🍿' }],
    ['🔌 Keep the demo videos', { say: 'Waterfalls and fish on 50 TVs. 🐠' }]
  ]);
  B('electronics', 'scalpers', '🤖', 'Scalpers are buying everything!', 'People with bots are buying all the new graphics cards to sell them for triple the price online. Real gamers are angry! 😤', [
    ['🪪 One per person, ID required', { rep: 6, fans: 10, say: 'Real gamers got their cards! 🪪' }],
    ['🎟️ A fair lottery system', { rep: 5, say: 'Fair for everyone! 🎟️' }],
    ['💰 Sell to anyone', { extra: [0.2, 2, 'Scalper sales'], rep: -5, say: 'Money is money... but gamers are mad. 💰' }],
    ['🏪 In-store only, no online', { rep: 3, demand: [1.05, 4, 'In-store only'], say: 'Bots can\'t walk into stores! 🏪' }]
  ]);
  B('electronics', 'demo_thief', '📱', 'Demo phones keep disappearing', 'Three demo phones went missing this week. The security cables were cut. 🕵️', [
    ['📹 Better cameras', { cash: -0.3, flag: 'cameras', say: 'The thief was caught on camera! 📹' }],
    ['🔒 Strong steel cables', { cash: -0.2, say: 'No more missing phones! 🔒' }],
    ['🪤 Put a fake phone out as a trap', { chance: { p: 0.5, win: { fans: 20, say: 'The thief grabbed the fake phone. It played a loud siren! 🚨' }, lose: { say: 'They were too smart. 🪤' } } }],
    ['🤷 It happens', { cash: -0.3, say: 'Losses add up. 🤷' }]
  ]);
  B('electronics', 'smart_home', '🏠', 'Sell smart home installs?', 'Customers buy smart lights and speakers but can\'t set them up. {a} wants to offer home installation.', [
    ['🏠 Smart home service!', { cash: -0.3, extra: [0.2, 16, 'Smart home installs'], say: 'Everyone wants a talking house! 🏠' }],
    ['🎓 Free setup classes', { rep: 4, fans: 10, say: 'Customers love the classes! 🎓' }],
    ['🤖 A robot butler demo', { cash: -0.6, fans: 30, say: 'The robot butler brought coffee! Everyone filmed it! 🤖' }],
    ['🙅 "Read the manual"', { happy: -2, say: 'Returns went up. 🙅' }]
  ], FRONT);
  B('electronics', 'price_match', '💻', '"It\'s cheaper online!"', 'A customer shows you the same laptop online for $100 less. "Match the price or I\'m leaving!"', [
    ['🤝 Match it', { cash: -0.05, happy: 3, rep: 2, say: 'Happy customer, small loss. 🤝' }],
    ['🛡️ "We give 2 years of free help"', { chance: { p: 0.6, win: { say: 'They bought it from you for the help! 🛡️' }, lose: { say: 'They left to buy it online. 🛡️' } } }],
    ['🎁 Free headphones instead', { cash: -0.03, happy: 3, say: 'They took the deal! 🎁' }],
    ['🙅 "Then buy it online"', { happy: -2, say: 'They did. 🙅' }]
  ]);

  // 📦 DELIVERY COMPANY
  B('delivery', 'angry_dog', '🐕', 'The dog that hates delivery drivers', 'At one house, a tiny dog chases {a} EVERY day. {a} has started running from the van to the door.', [
    ['🦴 Bring the dog treats', { chance: { p: 0.7, win: { a: 10, fans: 10, say: 'Now the dog waits for {a} every day with a wagging tail! 🦴' }, lose: { a: -3, say: 'The dog ate the treat AND chased {a}. 😂' } } }],
    ['🔀 Let someone else take that route', { a: 5, say: 'New driver, same dog. 🔀' }],
    ['📹 Film the chase', { fans: 20, say: '"Tiny Dog vs Driver" is hilarious. 📹' }],
    ['🥾 Buy {a} running shoes', { money: -80, a: 6, say: '{a} is very fast now. 🥾' }]
  ], FRONT);
  B('delivery', 'wrong_house', '🎂', 'Delivered to the wrong house!', 'A birthday cake was delivered to the wrong house. The neighbors ate it. The real birthday party is in 1 hour!', [
    ['🎂 Buy a new cake and rush it', { cash: -0.1, rep: 4, say: 'Delivered with 5 minutes to spare! 🎂' }],
    ['🎉 Add balloons to say sorry', { cash: -0.12, rep: 5, fans: 10, say: 'The family loved the balloons! 🎉' }],
    ['📍 Better GPS for all drivers', { cash: -0.3, capacity: [1.05, 26, 'Better GPS'], say: 'No more wrong houses! 📍' }],
    ['🤷 "The neighbors ate it, not us"', { rep: -5, say: 'Very bad review. 🤷' }]
  ]);
  B('delivery', 'holiday_peak', '🎄', 'The holiday rush!', 'It\'s December. Everyone is ordering gifts. There are 5 TIMES more packages than normal! 📦📦📦', [
    ['👥 Hire holiday drivers', { hireSpecial: { role: 'front', skill: 45 }, extra: [0.4, 3, 'Holiday rush'], say: 'Every gift arrived on time! 👥' }],
    ['🔥 Everyone works double shifts', { extra: [0.5, 3, 'Holiday rush'], team: -12, say: 'Big money. Very tired team. 🔥' }],
    ['🎅 Drivers wear Santa hats', { fans: 20, extra: [0.3, 3, 'Holiday rush'], say: 'Santa drivers! Kids love it! 🎅' }],
    ['📅 "Might arrive after Christmas"', { rep: -6, say: 'Angry customers. 📅' }]
  ], { cond: inWeeks('delivery', 48, 52) });
  B('delivery', 'drones', '🚁', 'Try drone delivery?', 'A company offers delivery drones. "Packages fly right to the door!" What could go wrong?', [
    ['🚁 Buy 10 drones', { cash: -1.5, chance: { p: 0.6, win: { capacity: [1.2, 52, 'Drone delivery'], fans: 25, say: 'Flying packages! The future is here! 🚁' }, lose: { rep: -4, say: 'A drone dropped a package into a pool. And a seagull attacked another one. 🦅' } } }],
    ['🚁 Test with one drone', { cash: -0.2, fans: 12, say: 'Cool test! Everyone waved at the drone. 🚁' }],
    ['🚲 Try cargo bikes instead', { cash: -0.3, rep: 4, capacity: [1.05, 52, 'Cargo bikes'], say: 'Fast in traffic, good for the planet! 🚲' }],
    ['🙅 Vans work fine', { say: 'Old but gold. 🙅' }]
  ]);
  B('delivery', 'mud_stuck', '🚚', 'A van is stuck in the mud', 'A van went down a country road and is stuck in deep mud. 60 packages are waiting inside!', [
    ['🚜 Ask a farmer with a tractor', { money: -50, fans: 10, say: 'The farmer pulled it out! 🚜' }],
    ['🏃 Deliver the packages on foot', { team: -5, rep: 4, say: 'Everything delivered, with muddy shoes. 🏃' }],
    ['🔧 Call a tow truck', { cash: -0.2, say: 'Out! But very late. 🔧' }],
    ['🛻 Buy all-terrain vans', { cash: -1.5, capacity: [1.08, 52, 'Off-road vans'], say: 'Nothing stops you now! 🛻' }]
  ]);
  B('delivery', 'fragile', '🥂', 'The "FRAGILE" box went CRASH', 'A box marked "FRAGILE — GLASS" fell off the cart. It made a very sad sound. 🥂💥', [
    ['📞 Call the customer and pay for it', { cash: -0.2, rep: 4, say: 'Honest and fair. 📞' }],
    ['📦 Better packing rules', { cash: -0.2, equip: 0.02, say: 'Bubble wrap everywhere! 📦' }],
    ['🛡️ Buy delivery insurance', { cash: -0.3, rep: 2, say: 'Now accidents are covered. 🛡️' }],
    ['🙈 Deliver it anyway', { rep: -6, say: 'They opened a box of crumbs. VERY bad review. 🙈' }]
  ]);
  B('delivery', 'porch_pirates', '🏴‍☠️', 'Porch pirates are stealing packages!', 'Someone steals packages from doorsteps right after you deliver them. Customers blame YOU.', [
    ['📸 Photo of every delivery', { rep: 4, say: 'Proof you delivered! 📸' }],
    ['🔐 Package lockers around town', { cash: -1, rep: 6, capacity: [1.05, 52, 'Package lockers'], say: 'Safe lockers everywhere! 🔐' }],
    ['🪤 Fake glitter-bomb package', { fans: 30, say: 'The thief got covered in glitter! Viral video! ✨' }],
    ['🤷 "Not our problem"', { rep: -5, say: 'Customers went to other companies. 🤷' }]
  ]);

  // 📣 MARKETING AGENCY
  B('marketing', 'hates_logo', '🎨', 'The client HATES the new logo', 'You spent 3 weeks on a logo. The client says: "It looks like a potato." 🥔 They want changes by tomorrow.', [
    ['🔄 Start over, work all night', { team: -6, chance: { p: 0.6, win: { rep: 4, say: 'They LOVE the new one! 🎨' }, lose: { say: 'They picked... the first one. 😑' } } }],
    ['🥔 "It\'s a GOOD potato"', { chance: { p: 0.3, win: { fans: 20, say: 'They laughed and kept it! 🥔' }, lose: { rep: -3, say: 'They were not amused. 🥔' } } }],
    ['🎨 Show 5 new quick ideas', { team: -3, rep: 3, say: 'They picked number 3! 🎨' }],
    ['👋 Drop the client', { cash: -0.3, team: 5, say: 'Freedom! But less money. 👋' }]
  ]);
  B('marketing', 'bad_slogan', '💬', 'A slogan went viral... for the wrong reason', '{a} wrote a slogan for a juice company: "Taste the Squeeze!" People think it sounds weird and are making memes about it. 😬', [
    ['😂 Lean into it! Make more memes', { fans: 30, chance: { p: 0.5, win: { rep: 4, say: 'The client LOVES the attention! 😂' }, lose: { rep: -3, say: 'The client wanted fewer jokes. 😬' } } }],
    ['🔄 Quickly change the slogan', { rep: 1, say: 'New slogan, fewer memes. 🔄' }],
    ['🙏 Say sorry to the client', { rep: 2, a: -5, say: 'The client forgave you. 🙏' }],
    ['📊 Show the client how many views it got', { cash: 0.5, say: '10 million views! The client gave you a bonus! 📊' }]
  ], FRONT);
  B('marketing', 'soda_pitch', '🥤', 'A giant soda brand wants a pitch!', 'The biggest soda company in the world wants new ideas. If you win, it\'s the biggest deal ever. 5 other agencies are competing.', [
    ['🔥 All-in: work nonstop for a week', { team: -10, chance: { p: 0.4, win: { cash: 5, rep: 8, fans: 30, say: 'YOU WON THE DEAL! 🥤🏆' }, lose: { say: 'They picked another agency. So close. 😩' } } }],
    ['💡 One crazy, bold idea', { chance: { p: 0.3, win: { cash: 5, fans: 40, say: 'Your crazy idea WON! 💡' }, lose: { say: 'Too crazy for them. 💡' } } }],
    ['🤝 Team up with another agency', { chance: { p: 0.6, win: { cash: 2.5, rep: 4, say: 'You won together! 🤝' }, lose: { say: 'Lost together. 🤝' } } }],
    ['🙅 Too big for us', { say: 'Maybe next time. 🙅' }]
  ], { rarity: 'rare' });
  B('marketing', 'jingle', '🎵', 'The client wants a jingle', 'A pet food company wants a catchy song for their ads. {a} says they can sing. Can they?', [
    ['🎤 Let {a} sing it', { chance: { p: 0.5, win: { fans: 25, a: 10, say: 'The jingle is SO catchy! Everyone is humming it! 🎤' }, lose: { rep: -2, say: 'It sounded like a cat in a washing machine. 😬' } } }],
    ['🎹 Hire a real singer', { cash: -0.3, rep: 4, say: 'Perfect jingle! 🎹' }],
    ['🐶 Real barking dogs singing', { fans: 30, say: 'The barking jingle went viral! 🐶🎵' }],
    ['📼 Use free music', { say: 'Safe, boring jingle. 📼' }]
  ], FRONT);
  B('marketing', 'ad_awards', '🏆', 'Nominated for Best Ad of the Year!', 'Your funny ad about a talking sandwich is nominated at the big ad awards!', [
    ['🎩 Go in fancy clothes', { chance: { p: 0.4, win: { rep: 10, fans: 30, say: 'YOU WON! New clients are calling! 🏆' }, lose: { fans: 8, say: 'Didn\'t win. Nice party though. 🎩' } } }],
    ['🥪 Go in a sandwich costume', { fans: 25, chance: { p: 0.4, win: { rep: 8, say: 'You WON in a sandwich costume! Legendary! 🥪🏆' }, lose: { say: 'No award. Very good costume though. 🥪' } } }],
    ['🎉 Office watch party', { team: 8, say: 'The team screamed at the screen! 🎉' }],
    ['😴 Skip it', { say: 'You found out the next day. 😴' }]
  ]);
  B('marketing', 'influencer_cancelled', '📉', 'Your influencer got CANCELLED', 'The influencer you hired for a big campaign just posted something very rude. Everyone is angry at them... and the ad has your client\'s name on it!', [
    ['🗑️ Pull the ads immediately', { cash: -0.4, rep: 4, say: 'Fast move. The client is grateful. 🗑️' }],
    ['🔄 Find a new influencer tonight', { cash: -0.3, team: -4, rep: 3, say: 'New face, campaign saved! 🔄' }],
    ['🙊 Wait and see', { chance: { p: 0.3, win: { say: 'It blew over. 🙊' }, lose: { rep: -8, say: 'It got worse. The client left you. 😱', cash: -0.8 } } }],
    ['📜 Check influencers better from now on', { rep: 2, cash: -0.2, say: 'Smarter choices next time. 📜' }]
  ]);
  B('marketing', 'all_nighter', '🌙', 'The pitch is due TOMORROW', 'The client moved the deadline. The big presentation is tomorrow morning instead of next week! 😱', [
    ['🍕 Pizza and all-nighter!', { cash: -0.1, team: -6, chance: { p: 0.7, win: { cash: 1, say: 'Nailed it with no sleep! 🍕' }, lose: { say: 'The slides had typos. Sleepy typos. 😴' } } }],
    ['📞 Ask for 2 more days', { chance: { p: 0.5, win: { say: 'They agreed! Phew. 📞' }, lose: { rep: -3, say: '"No." 📞' } } }],
    ['✨ Keep it short and simple', { cash: 0.5, say: 'Short and sweet. They liked it! ✨' }],
    ['🎭 Present it as a play', { fans: 15, chance: { p: 0.5, win: { cash: 1.2, say: 'They LOVED the theater! 🎭' }, lose: { say: 'Confusing. 🎭' } } }]
  ]);

  // 💻 APP COMPANY
  B('software', 'server_crash', '🔥', 'The servers crashed on launch day!', 'Your new app launched and a million people tried to sign up at once. The servers are on fire (not really, but almost). 🔥', [
    ['☁️ Buy more servers NOW', { cash: -1, capacity: [1.2, 12, 'More servers'], say: 'Back online! A million new users! ☁️' }],
    ['😂 Post a funny "we broke" message', { fans: 25, say: 'People loved your honesty! 😂' }],
    ['🎟️ Waiting list with a number', { rep: 3, say: 'People waited. And got excited. 🎟️' }],
    ['😱 Panic', { rep: -4, say: 'The app was down for 2 days. 😱' }]
  ]);
  B('software', 'store_reject', '🚫', 'The app store REJECTED your app', 'Your update was rejected because "the button is 2 pixels too small". The update was supposed to come out today.', [
    ['🔧 Fix it and resubmit', { chance: { p: 0.8, win: { say: 'Approved! 🔧' }, lose: { rep: -2, say: 'Rejected AGAIN. Now the icon is "too blue". 😤' } } }],
    ['📞 Call them and complain', { chance: { p: 0.4, win: { say: 'They approved it! 📞' }, lose: { say: 'Nobody answered. 📞' } } }],
    ['🌐 Release a web version', { cash: -0.3, fans: 10, say: 'Users can use it in the browser! 🌐' }],
    ['😂 Tweet about the 2 pixels', { fans: 20, say: 'Developers everywhere laughed. 😂' }]
  ]);
  B('software', 'hackathon', '💡', 'Hackathon weekend!', 'The team wants a 48-hour hackathon: build anything new, with pizza and energy drinks!', [
    ['💡 Let\'s do it!', { cash: -0.2, team: 8, chance: { p: 0.4, win: { extra: [0.3, 12, 'Hackathon idea'], say: 'Someone built a GREAT new feature! 💡' }, lose: { say: 'Everyone built games. Fun, though! 🎮' } } }],
    ['🏆 Big prize for the best idea', { cash: -0.4, team: 10, chance: { p: 0.5, win: { extra: [0.35, 12, 'Hackathon idea'], say: 'The winning idea is a hit! 🏆' }, lose: { say: 'Good ideas, none finished. 🏆' } } }],
    ['🌍 Invite the public', { cash: -0.3, fans: 25, say: 'Hundreds came! You hired two of them! 🌍', hireSpecial: { role: 'front', skill: 60 } }],
    ['🙅 Too busy', { team: -3, say: 'Normal weekend. 🙅' }]
  ]);
  B('software', 'dark_mode', '🌙', 'Users DEMAND dark mode', 'Thousands of angry messages: "WHERE IS DARK MODE?! My eyes hurt!" 🌙', [
    ['🌙 Build dark mode', { cash: -0.3, fans: 20, rep: 3, say: 'Users are happy! 🌙' }],
    ['🌈 Build 10 color themes', { cash: -0.5, fans: 30, say: 'Rainbow mode is the favorite! 🌈' }],
    ['😎 Make EVERYTHING dark', { fans: 10, rep: -2, say: 'Some people can\'t find the buttons now. 😎' }],
    ['🤷 "Turn down your brightness"', { fans: -10, say: 'Users are annoyed. 🤷' }]
  ]);
  B('software', 'buyout', '💰', 'A tech giant wants to buy your app!', 'A huge tech company offers to buy your app for a LOT of money. But they might shut it down.', [
    ['💰 Sell it!', { cash: 5, fans: -20, say: 'You\'re rich! Users are sad. 💰' }],
    ['📈 Ask for double', { chance: { p: 0.35, win: { cash: 9, say: 'THEY SAID YES! 💰💰' }, lose: { say: 'They walked away. 📈' } } }],
    ['🤝 Partner instead of selling', { extra: [0.3, 20, 'Tech partnership'], rep: 4, say: 'Their users can use your app now! 🤝' }],
    ['🙅 Not for sale', { team: 8, fans: 15, say: 'The team cheered! 🙅' }]
  ], { rarity: 'rare' });
  B('software', 'security_hole', '🛡️', 'A hacker found a security hole', 'A friendly hacker emails: "Your app has a big security hole. I can show you, but I want a reward." 🛡️', [
    ['💵 Pay the reward', { cash: -0.3, equip: 0.02, rep: 4, say: 'Hole fixed! Users are safe! 💵' }],
    ['🏆 Start a bug bounty program', { cash: -0.5, rep: 6, say: 'Friendly hackers help you now! 🏆' }],
    ['🔍 Find it yourselves', { team: -4, chance: { p: 0.5, win: { say: 'Found and fixed! 🔍' }, lose: { rep: -8, say: 'Someone else found it first. Data leak. 😱' } } }],
    ['🙈 Ignore the email', { rep: -5, say: 'The hacker posted it online. 🙈' }]
  ]);
  B('software', 'add_ai', '🤖', 'Add AI to EVERYTHING?', 'Investors keep asking: "Does your app have AI?" Everyone is adding AI to everything, even toasters.', [
    ['🤖 Add a smart AI helper', { cash: -0.8, demand: [1.15, 20, 'AI features'], say: 'The helper is actually useful! 🤖' }],
    ['😂 Add "AI" to the name only', { fans: 15, rep: -2, say: 'Investors liked it. Users noticed nothing. 😂' }],
    ['🧪 Test a small AI feature', { cash: -0.3, demand: [1.06, 12, 'AI test'], say: 'Nice little upgrade! 🧪' }],
    ['🙅 Focus on what works', { rep: 2, say: 'Users like the simple app. 🙅' }]
  ]);

  // 🧸 TOY COMPANY
  B('toys', 'toy_craze', '🧸', 'Your toy is THE toy of the year!', 'Every kid wants your "Squishy Dino". Stores are sold out. Parents are fighting in the aisles! 🦖', [
    ['🏭 Make millions more!', { cash: -1, extra: [0.8, 4, 'Squishy Dino craze'], say: 'The factory runs day and night! 🏭' }],
    ['💲 Raise the price', { extra: [0.6, 3, 'Squishy Dino craze'], rep: -4, say: 'Rich... but parents are angry. 💲' }],
    ['🎁 Give some to hospitals', { extra: [0.5, 3, 'Squishy Dino craze'], rep: 8, say: 'Sick kids got dinos too! ❤️' }],
    ['🦖 Make a whole dino family', { cash: -0.5, extra: [0.7, 6, 'Dino family'], fans: 20, say: 'Kids want to collect them all! 🦖' }]
  ], { rarity: 'rare' });
  B('toys', 'safety_recall', '⚠️', 'A small part might be dangerous!', 'A parent found that a tiny part of your new toy can come off. Small kids could put it in their mouths. ⚠️', [
    ['⚠️ Recall all the toys right away', { cash: -1.2, rep: 6, say: 'Safe choice. Parents trust you more. ⚠️' }],
    ['🔧 Fix the design for new toys', { cash: -0.4, rep: 2, say: 'New ones are safe. 🔧' }],
    ['🏷️ Add a "3+ years" label', { rep: -2, say: 'Hmm. Some parents are still worried. 🏷️' }],
    ['🙈 Hope nothing happens', { rep: -10, say: 'The news found out. Very bad. 😱' }]
  ]);
  B('toys', 'cartoon_deal', '📺', 'A cartoon about YOUR toy?', 'A TV studio wants to make a cartoon show about your toy characters!', [
    ['📺 Yes!', { cash: 1, fans: 40, demand: [1.2, 20, 'Cartoon show'], say: 'Kids watch the show and want the toys! 📺' }],
    ['✍️ Yes, but you write the stories', { cash: 0.5, fans: 35, rep: 4, say: 'Your characters, your stories! ✍️' }],
    ['💰 Ask for more money', { chance: { p: 0.5, win: { cash: 2, fans: 35, say: 'Deal! 💰' }, lose: { say: 'They made a show about another toy. 💰' } } }],
    ['🙅 No, toys are enough', { say: 'Just toys. 🙅' }]
  ], { rarity: 'rare' });
  B('toys', 'kid_testers', '🧒', 'Hire kids as toy testers?', 'Who knows toys better than kids? You could invite kids to test new toys every month.', [
    ['🧒 Monthly toy testing day', { cash: -0.2, rep: 5, equip: 0.02, fans: 20, say: 'The kids are brutally honest. Toys got better! 🧒' }],
    ['🏆 "Chief Toy Officer" contest', { fans: 30, say: 'An 8-year-old is now your "Chief Toy Officer"! 🏆' }],
    ['🐶 Test with dogs too', { fans: 15, say: 'Dogs destroyed everything. Very useful data. 🐶' }],
    ['🙅 Adults can test toys', { say: 'Adults said "nice". 🙅' }]
  ]);
  B('toys', 'creepy_doll', '🪆', 'The new doll is CREEPY', 'The new talking doll says "I\'m watching you" instead of "I\'m your friend". A factory mistake. 😳', [
    ['🔧 Fix it and recall', { cash: -0.6, rep: 3, say: 'Fixed! Now it says "hi friend!" 🔧' }],
    ['🎃 Sell it as a Halloween doll!', { extra: [0.3, 4, 'Creepy doll'], fans: 30, say: 'The creepy doll is a Halloween HIT! 🎃' }],
    ['😂 Post about the mistake', { fans: 25, say: 'People loved the funny honesty! 😂' }],
    ['🙈 Hope nobody notices', { rep: -6, say: 'Everyone noticed. 😱' }]
  ]);
  B('toys', 'collectors', '🧐', 'Adult collectors are buying everything', 'Grown-ups are buying all your limited toys to keep in boxes. Kids can\'t find them!', [
    ['🧒 "Kids first" days', { rep: 6, fans: 10, say: 'Kids get the first chance! 🧒' }],
    ['📦 Special collector editions', { extra: [0.3, 8, 'Collector editions'], say: 'Fancy boxes for collectors, normal toys for kids! 📦' }],
    ['💰 Make everything "limited"', { extra: [0.3, 6, 'Limited toys'], rep: -3, say: 'Money! But kids are sad. 💰' }],
    ['🤷 A sale is a sale', { extra: [0.15, 4, 'Collector sales'], say: 'Collectors are happy. 🤷' }]
  ]);
  B('toys', 'toy_fair', '🎪', 'The big Toy Fair!', 'The world\'s biggest toy fair is next month. A big booth costs a lot, but every toy store will be there!', [
    ['🎪 The BIGGEST booth', { cash: -1.2, extra: [0.4, 6, 'Toy Fair orders'], fans: 25, say: 'Everyone stopped at your booth! Huge orders! 🎪' }],
    ['🧸 A small, cute booth', { cash: -0.4, extra: [0.2, 6, 'Toy Fair orders'], say: 'Good orders for a small price! 🧸' }],
    ['🤖 Show a giant robot toy', { cash: -0.8, chance: { p: 0.5, win: { fans: 40, extra: [0.5, 6, 'Robot hit'], say: 'The giant robot was the star of the fair! 🤖' }, lose: { say: 'The robot broke. It just said "error". 🤖' } } }],
    ['🙅 Skip it', { say: 'Stores ordered from others. 🙅' }]
  ]);

  // 🍌 BANANA FARM
  B('banana', 'hurricane', '🌀', 'A hurricane is coming!', 'The weather news says a big hurricane will hit the farm in 2 days. The bananas are almost ready!', [
    ['🍌 Pick everything early!', { team: -6, cash: 0.3, say: 'Green bananas saved! They\'ll ripen in the boxes. 🍌' }],
    ['🛡️ Tie up the trees', { cash: -0.3, chance: { p: 0.6, win: { say: 'The trees survived! 🛡️' }, lose: { cash: -1, say: 'Half the trees fell anyway. 🌀' } } }],
    ['🏠 Protect the workers first', { team: 10, cash: -0.8, say: 'Everyone was safe. You lost some trees. ❤️' }],
    ['🤞 Hope it misses', { chance: { p: 0.4, win: { say: 'It missed! Lucky! 🤞' }, lose: { cash: -1.8, closed: [2, 'Hurricane damage'], say: 'The farm was hit hard. 😱' } } }]
  ]);
  B('banana', 'too_ripe', '🟫', 'Tons of bananas are TOO ripe', 'A shipment got delayed and 5,000 bananas turned brown and spotty. Nobody wants to buy brown bananas!', [
    ['🍞 Make banana bread!', { cash: -0.2, extra: [0.25, 3, 'Banana bread'], fans: 10, say: 'Banana bread is a HIT! 🍞' }],
    ['🍦 Sell to ice cream makers', { cash: 0.3, say: 'Brown bananas = perfect for ice cream! 🍦' }],
    ['🐷 Give them to farm animals', { rep: 2, say: 'Very happy pigs. 🐷' }],
    ['🗑️ Throw them out', { cash: -0.3, rep: -1, say: 'What a waste. 🗑️' }]
  ]);
  B('banana', 'spider_box', '🕷️', 'A SPIDER in a banana box!', 'A supermarket found a huge spider in one of your banana boxes. A shopper screamed so loud the police came. 🕷️😱', [
    ['🔍 Check every box from now on', { cash: -0.3, equip: 0.02, rep: 4, say: 'No more stowaways! 🔍' }],
    ['🎁 Send the supermarket a sorry gift', { cash: -0.1, rep: 3, say: 'They forgave you. 🎁' }],
    ['🕷️ Give the spider to the zoo', { fans: 20, say: 'The spider, "Banana Bob", lives at the zoo now! 🕷️' }],
    ['🤷 "Spiders like bananas too"', { rep: -4, say: 'Not the right answer. 🤷' }]
  ]);
  B('banana', 'peel_video', '🎥', 'The banana peel slip video', 'Someone slipped on one of your banana peels, did a perfect backflip and landed on their feet. It\'s the most viral video this week!', [
    ['📱 Share it with your logo', { fans: 35, say: '"Backflip Bananas" — the name stuck! 📱' }],
    ['🏆 Hire the backflip person for an ad', { cash: -0.3, fans: 40, demand: [1.15, 6, 'Backflip ad'], say: 'The ad is amazing! 🏆' }],
    ['⚠️ "Please throw peels in the trash!"', { rep: 4, say: 'Safety first! ⚠️' }],
    ['🍌 Sell "Backflip Banana" shirts', { extra: [0.15, 6, 'Banana shirts'], say: 'Everyone wants the shirt! 🍌' }]
  ]);
  B('banana', 'go_organic', '🌱', 'Go organic?', 'Customers want organic bananas with no chemicals. It costs more to grow, but people pay more too.', [
    ['🌱 The whole farm goes organic', { cash: -1.2, extra: [0.3, 52, 'Organic bananas'], rep: 6, say: 'Organic bananas sell for more! 🌱' }],
    ['🌿 Half the farm', { cash: -0.6, extra: [0.15, 52, 'Some organic'], rep: 3, say: 'A good start! 🌿' }],
    ['🐞 Use ladybugs instead of spray', { cash: -0.2, rep: 4, fans: 10, say: 'Ladybugs eat the pests! Nature! 🐞' }],
    ['🙅 Too expensive', { say: 'Normal bananas it is. 🙅' }]
  ]);
  B('banana', 'export_deal', '🚢', 'A huge export deal!', 'A big supermarket chain in another country wants 1 million banana boxes a year. But you need a bigger farm!', [
    ['🚢 Accept and grow the farm', { cash: -1.5, extra: [0.6, 26, 'Export deal'], say: 'Your bananas go around the world! 🚢' }],
    ['🤝 Share it with other farms', { extra: [0.3, 26, 'Shared export'], rep: 4, say: 'The whole region benefits! 🤝' }],
    ['📈 Ask for a better price', { chance: { p: 0.5, win: { extra: [0.7, 26, 'Export deal'], say: 'Better price, same deal! 📈' }, lose: { say: 'They signed with another farm. 📈' } } }],
    ['🙅 Too big', { say: 'Maybe next year. 🙅' }]
  ], { rarity: 'rare' });
  B('banana', 'mascot_suit', '🍌', 'A giant banana mascot?', '{a} wants to wear a giant banana costume and dance at the market every weekend. They are VERY excited.', [
    ['🍌 Buy the costume!', { money: -150, fans: 25, demand: [1.08, 8, 'Banana mascot'], a: 12, say: 'The dancing banana is famous! 🍌💃' }],
    ['🍌🍌 Buy TWO costumes', { money: -300, fans: 35, team: 6, say: 'Banana dance battles every Saturday! 🍌🍌' }],
    ['🐒 A monkey costume instead', { money: -150, fans: 20, say: 'A monkey chasing bananas! Kids love it! 🐒' }],
    ['🙅 "Please, no"', { a: -8, say: '{a} is very sad. 🙅' }]
  ], FRONT);

  // 🍫 CHOCOLATE FACTORY
  B('chocolate', 'cocoa_price', '📈', 'Cocoa prices are CRAZY', 'Bad weather hit the cocoa farms. Cocoa is 3 times more expensive! Chocolate without cocoa is... sad.', [
    ['📈 Raise prices a bit', { price: 1, happy: -3, say: 'Customers grumble but buy anyway. 📈' }],
    ['🌰 Add more nuts and caramel', { supply: [-0.02, 12, 'Less cocoa'], fans: 10, say: 'Nutty bars are a hit! 🌰' }],
    ['🤝 Buy straight from the farmers', { cash: -0.5, supply: [-0.03, 26, 'Direct from farms'], rep: 5, say: 'Fair for farmers, cheaper for you! 🤝' }],
    ['😬 Smaller bars, same price', { happy: -6, rep: -3, say: 'Customers noticed. They are NOT happy. 😬' }]
  ]);
  B('chocolate', 'melted_truck', '🚚', 'The delivery truck MELTED', 'The truck\'s cooling broke on the hottest day. 10,000 chocolate bars became one giant chocolate puddle. 🍫💧', [
    ['🍫 Sell it as "Chocolate Soup"', { cash: 0.2, fans: 20, say: 'People bought melted chocolate in cups! 🍫' }],
    ['🔧 New trucks with better cooling', { cash: -1, equip: 0.03, say: 'Never again! 🔧' }],
    ['🍪 Make cookies with it', { extra: [0.2, 3, 'Chocolate cookies'], say: 'Chocolate cookies everywhere! 🍪' }],
    ['😭 Throw it away', { cash: -0.8, say: 'A sad day. 😭' }]
  ]);
  B('chocolate', 'factory_tours', '🎟️', 'Chocolate factory tours?', 'Families keep asking to see how chocolate is made. {a} wants to give tours!', [
    ['🎟️ Daily tours with free samples', { cash: -0.3, extra: [0.25, 20, 'Factory tours'], fans: 25, say: 'Every tour sells out! 🎟️' }],
    ['🎨 "Make your own bar" workshop', { cash: -0.4, extra: [0.3, 20, 'Chocolate workshops'], fans: 20, say: 'Kids make crazy bars with gummy bears! 🎨' }],
    ['🍫 Just a window to look through', { fans: 10, say: 'People press their faces to the glass. 🍫' }],
    ['🙅 Secret recipes!', { say: 'The factory stays secret. 🙅' }]
  ], FRONT);
  B('chocolate', 'dark_vs_milk', '🗳️', 'Dark vs Milk: the big vote', 'Your customers are arguing: which is better, dark or milk chocolate? You could let them vote!', [
    ['🗳️ Big public vote', { fans: 30, say: 'Milk won by 12 votes! The dark fans want a rematch! 🗳️' }],
    ['🥊 A chocolate tasting battle', { fans: 25, extra: [0.12, 2, 'Tasting battle'], say: 'Everyone tasted both. Everyone won. 🥊' }],
    ['🍫 Make a half-and-half bar', { extra: [0.15, 10, 'Half-and-half bar'], say: 'Peace bar! Best seller! 🍫' }],
    ['⚪ "White chocolate is best"', { fans: 10, rep: -1, say: 'Both sides are mad at you now. 😂' }]
  ]);
  B('chocolate', 'easter_rush', '🐰', 'Easter rush!', 'Easter is in 2 weeks! Everyone wants chocolate eggs and bunnies. The factory must work nonstop!', [
    ['🐰 Make 1 million chocolate bunnies', { extra: [0.6, 2, 'Easter rush'], team: -8, say: 'Bunnies everywhere! Record sales! 🐰' }],
    ['🥚 Giant eggs with surprises inside', { cash: -0.3, extra: [0.5, 2, 'Surprise eggs'], fans: 15, say: 'Kids LOVE the surprises! 🥚' }],
    ['👥 Hire Easter helpers', { hireSpecial: { role: 'front', skill: 45 }, extra: [0.4, 2, 'Easter rush'], say: 'Smooth and fast! 👥' }],
    ['🎨 Paint the world\'s biggest chocolate egg', { cash: -0.4, fans: 40, say: 'A 5-meter chocolate egg! On TV! 🎨' }]
  ], { cond: inWeeks('chocolate', 12, 15) });
  B('chocolate', 'recipe_stolen', '🕵️', 'Someone stole your recipe!', 'A new chocolate brand tastes EXACTLY like yours. {a} thinks a worker sold the secret recipe to {rival}! 😤', [
    ['⚖️ Sue them', { cash: -0.5, chance: { p: 0.5, win: { cash: 2, rival: -0.15, say: 'You won! They had to stop! ⚖️' }, lose: { say: 'You couldn\'t prove it. ⚖️' } } }],
    ['🧪 Invent an even better recipe', { cash: -0.4, demand: [1.12, 12, 'New recipe'], fans: 15, say: 'The new one is better! Ha! 🧪' }],
    ['🔐 Lock up all your secrets', { cash: -0.2, say: 'Recipes in a safe now. 🔐' }],
    ['😎 "Ours is the original"', { fans: 10, rep: 2, say: 'Loyal fans stick with you! 😎' }]
  ], { init: rival, who: { a: 'front' } });
  B('chocolate', 'choco_dress', '👗', 'A dress made of chocolate?', 'A fashion designer wants you to make a dress out of chocolate for a big fashion show!', [
    ['👗 Make it!', { cash: -0.3, fans: 40, rep: 4, say: 'The chocolate dress was the star of the show! 👗🍫' }],
    ['🍫 And chocolate shoes too', { cash: -0.5, fans: 50, say: 'Head-to-toe chocolate! The internet went crazy! 🍫' }],
    ['🌡️ Worry it will melt', { chance: { p: 0.5, win: { fans: 30, say: 'It didn\'t melt! Success! 🌡️' }, lose: { fans: 20, say: 'It melted on the runway. Still famous! 😂' } } }],
    ['🙅 Chocolate is for eating', { say: 'Fair. 🙅' }]
  ]);

  // ⚽ FOOTBALL ACADEMY
  B('football', 'mud_pitch', '🌧️', 'The pitch is a MUD BATH', 'Heavy rain turned the training pitch into a swamp. The kids are sliding everywhere and LOVE it. The parents don\'t. 🌧️', [
    ['⚽ Train anyway! Mud football!', { fans: 15, team: 6, happy: -3, say: 'Muddy kids, happy kids. Muddy parents. 😂' }],
    ['🏟️ Build an artificial pitch', { cash: -1.5, capacity: [1.1, 52, 'All-weather pitch'], rep: 5, say: 'Train in any weather! 🏟️' }],
    ['🏫 Train in a school gym', { money: -100, say: 'Indoor football for a week. 🏫' }],
    ['🛑 Cancel training', { demand: [0.9, 1, 'No training'], say: 'A week off. 🛑' }]
  ]);
  B('football', 'angry_parent', '😤', 'An angry parent on the sideline', 'A parent is yelling at {a}: "MY kid should be the captain! He\'s the next superstar!" His kid is... okay.', [
    ['🗣️ Talk calmly with the parent', { chance: { p: 0.6, win: { rep: 3, say: 'The parent calmed down. 🗣️' }, lose: { happy: -3, say: 'He\'s still yelling. 😤' } } }],
    ['🔇 "Silent sideline" rule', { rep: 4, happy: -1, say: 'No yelling parents! Kids play better! 🔇' }],
    ['👑 Make the kid captain for one game', { happy: 3, a: -4, say: 'The kid did okay. The parent was happy. 👑' }],
    ['🚪 Ban the parent from games', { rep: 2, happy: -2, say: 'Peace on the sideline. 🚪' }]
  ], FRONT);
  B('football', 'scout_visit', '🔭', 'A famous scout is visiting!', 'A scout from a giant football club is coming to watch your players this weekend! Everyone is nervous.', [
    ['💪 Extra training all week', { team: -4, chance: { p: 0.5, win: { cash: 2, fans: 30, rep: 5, say: 'The scout signed two of your players! Big transfer money! 🔭' }, lose: { rep: 2, say: 'No signings, but the scout was impressed. 🔭' } } }],
    ['🎉 Tell kids to just have fun', { chance: { p: 0.45, win: { cash: 1.5, fans: 25, say: 'Relaxed kids played their best! One got signed! 🎉' }, lose: { say: 'No signings this time. 🎉' } } }],
    ['🎥 Send the scout highlight videos', { cash: -0.1, rep: 3, fans: 10, say: 'The scout wants to come back! 🎥' }],
    ['🙈 Don\'t tell the kids', { rep: 2, say: 'The kids played normal. The scout liked that. 🙈' }]
  ]);
  B('football', 'bus_broke', '🚌', 'The team bus broke down before the final!', 'The bus to the youth cup final broke down on the highway. The game starts in 90 minutes! 🚌😱', [
    ['🚕 Pay for 10 taxis', { cash: -0.3, chance: { p: 0.8, win: { fans: 20, say: 'Made it just in time! And they WON! 🏆' }, lose: { say: 'Too late. The game was cancelled. 😭' } } }],
    ['📱 Ask parents to drive', { rep: 4, chance: { p: 0.7, win: { fans: 15, say: 'Parent power! Made it! ⚽' }, lose: { say: 'Not enough cars. 😩' } } }],
    ['🏃 Run the last 5 km', { team: 8, fans: 25, say: 'They arrived sweaty, played tired... and still got 2nd! 🏃' }],
    ['📞 Ask to delay the game', { chance: { p: 0.5, win: { say: 'The game was delayed an hour. Phew! 📞' }, lose: { rep: -2, say: 'Lost by forfeit. 😢' } } }]
  ]);
  B('football', 'new_kits', '👕', 'Design new team kits!', 'The team needs new shirts. {a} designed three options. The players want to vote.', [
    ['🌈 Neon rainbow kit', { cash: -0.2, fans: 20, say: 'You can see the team from space! 🌈' }],
    ['⚫ Cool all-black kit', { cash: -0.2, fans: 12, team: 5, say: 'The team looks SO cool! ⚫' }],
    ['🍌 Kit with a sponsor\'s logo', { cash: 0.5, say: 'A local bakery paid for the kits! 🍌' }],
    ['🗳️ Let the kids design it', { cash: -0.2, fans: 25, rep: 3, say: 'A dinosaur kit! Every kid loves it! 🦖' }]
  ], FRONT);
  B('football', 'star_injured', '🤕', 'Your star player got injured', 'Your best young player hurt their ankle in training. The big tournament is next month.', [
    ['🩺 The best doctor, whatever it costs', { cash: -0.5, rep: 4, say: 'Back in 3 weeks, fully healed! 🩺' }],
    ['🛌 Rest and no pressure', { rep: 3, say: 'Health first. Parents appreciate it. 🛌' }],
    ['⚽ Give another kid a chance', { team: 6, fans: 10, say: 'A new star is born! ⚽' }],
    ['😬 Play them anyway', { rep: -8, say: 'The injury got worse. Parents are furious. 😬' }]
  ]);
  B('football', 'girls_team', '⚽', 'Start a girls\' team?', 'Lots of girls want to join, but there\'s no girls\' team yet. {a} would love to coach it!', [
    ['⚽ Yes! Start it this week', { cash: -0.3, demand: [1.15, 52, 'Girls\' team'], rep: 6, fans: 20, say: 'The girls\' team is amazing! 🏆' }],
    ['🏆 Build a whole girls\' league', { cash: -0.8, demand: [1.2, 52, 'Girls\' league'], rep: 8, fans: 30, say: 'The first girls\' league in {city}! 🏆' }],
    ['👥 Mixed teams for everyone', { demand: [1.1, 52, 'Mixed teams'], rep: 5, say: 'Everyone plays together! 👥' }],
    ['🙅 Not enough coaches', { rep: -3, say: 'The girls went to another academy. 🙅' }]
  ], FRONT);

  // 🍔 BURGER CHAIN
  B('burger', 'mega_burger', '🍔', 'The 10-patty MEGA BURGER', '{a} built a burger with 10 patties. It\'s taller than a cat. A customer wants to try to eat it.', [
    ['🏆 "Eat it all and it\'s FREE"', { fans: 25, extra: [0.12, 10, 'Mega Burger challenge'], say: 'The Mega Burger challenge is famous! 🏆' }],
    ['📸 Just for photos', { fans: 15, say: 'Everyone takes a picture with it! 📸' }],
    ['🍔 Put it on the menu', { extra: [0.1, 10, 'Mega Burger'], say: 'People share it with 5 friends! 🍔' }],
    ['🙅 "That\'s too much"', { a: -5, say: '{a} eats it alone in the back. 🙅' }]
  ], FRONT);
  B('burger', 'veggie', '🌱', 'Add a plant burger?', 'More customers are asking for a burger without meat. A company offers a plant burger that "tastes just like beef".', [
    ['🌱 Add it to the menu', { cash: -0.2, demand: [1.1, 20, 'Plant burger'], rep: 4, say: 'New customers came for the plant burger! 🌱' }],
    ['🧪 Blind taste test', { fans: 20, chance: { p: 0.5, win: { rep: 5, say: 'Nobody could tell the difference! 🧪' }, lose: { say: 'Everyone could tell. It\'s still nice. 🧪' } } }],
    ['🥗 Salad bowls instead', { cash: -0.1, rep: 2, say: 'Healthy options! 🥗' }],
    ['🥩 "We\'re a MEAT place"', { rep: -2, say: 'Some customers went elsewhere. 🥩' }]
  ]);
  B('burger', 'drive_thru', '🚗', 'Build a drive-thru?', 'People want to order without leaving their cars. A drive-thru would cost a lot but could sell tons more burgers.', [
    ['🚗 Build it!', { cash: -1.5, capacity: [1.2, 104, 'Drive-thru'], demand: [1.1, 104, 'Drive-thru'], say: 'The line of cars never stops! 🚗' }],
    ['🛵 Delivery app instead', { cash: -0.4, extra: [0.2, 26, 'Delivery app'], say: 'Burgers to your door! 🛵' }],
    ['🐴 A "horse-thru" for fun', { fans: 25, say: 'Someone actually came on a horse. It went viral. 🐴' }],
    ['🙅 Sit down and enjoy', { say: 'Cozy restaurant. 🙅' }]
  ]);
  B('burger', 'secret_sauce', '🥫', 'The SECRET SAUCE', '{a} mixed ketchup, mayo, pickles and "one secret thing". Customers are going crazy for it!', [
    ['🥫 Sell the sauce in bottles', { cash: -0.3, extra: [0.2, 20, 'Secret sauce bottles'], fans: 15, say: 'The sauce is in every fridge in {city}! 🥫' }],
    ['🔐 Lock up the recipe', { cash: -0.1, raise: ['a', 0.1], loyal: { a: 20 }, say: 'Only you and {a} know the secret. 🔐' }],
    ['🎁 Free sauce with every burger', { cash: -0.1, happy: 5, say: 'Sauce on everything! 🎁' }],
    ['🤔 "What IS the secret thing?"', { team: 5, say: '{a} will never tell. 🤔' }]
  ], FRONT);
  B('burger', 'fries_broken', '🍟', 'The fries machine is BROKEN', 'The fryer broke. A burger place with no fries. Customers are looking at you like you betrayed them. 🍟😢', [
    ['🔧 Emergency repair', { cash: -0.3, say: 'Fries are back! Everyone cheered. 🔧' }],
    ['🥔 Baked potato wedges', { cash: -0.05, fans: 8, say: 'The wedges were so good people want them always! 🥔' }],
    ['🆕 Buy two new fryers', { cash: -0.8, capacity: [1.08, 52, 'Double fryers'], say: 'Double the fries! 🆕' }],
    ['😬 "No fries today, sorry"', { happy: -6, say: 'Sad customers. 😬' }]
  ]);
  B('burger', 'mascot', '🤡', 'A burger mascot?', 'Big burger chains have mascots. {a} wants to design one: a giant dancing burger named "Burgy".', [
    ['🍔 Burgy it is!', { cash: -0.3, fans: 25, demand: [1.08, 20, 'Burgy mascot'], say: 'Kids love Burgy! 🍔' }],
    ['🦖 A burger-eating dinosaur', { cash: -0.3, fans: 30, say: '"Chomp the Dino" is a hit! 🦖' }],
    ['🎨 Mascot design contest', { fans: 30, say: 'A kid designed a burger with sunglasses. Perfect! 🎨' }],
    ['🙅 Mascots are silly', { say: 'No mascot. 🙅' }]
  ], FRONT);
  B('burger', 'copycat_across', '🥊', '{rival} opened a burger place across the street', '{rival} opened a burger shop RIGHT across the street. Same menu. Lower prices. Bigger sign. 😤', [
    ['🍔 "Burger Battle" taste test', { chance: { p: 0.6, win: { fans: 30, rival: -0.1, say: 'Customers picked YOUR burger! 🍔🏆' }, lose: { rival: 0.05, say: 'They picked theirs. Ouch. 😖' } } }],
    ['💸 Lower your prices', { price: -1, rival: -0.05, say: 'Price war! 💸' }],
    ['⭐ Make everything better quality', { cash: -0.5, rep: 5, say: 'Quality wins in the end. ⭐' }],
    ['😎 Ignore them', { demand: [0.92, 6, 'Rival across the street'], say: 'Some customers switched. 😎' }]
  ], { init: rival });

  // 👗 FASHION BRAND
  B('fashion', 'red_carpet', '🌟', 'A pop star wore YOUR dress!', 'A huge pop star wore your dress on the red carpet at the music awards. Everyone is asking: "Who made that?!"', [
    ['📱 Post "That\'s OUR dress!"', { fans: 45, demand: [1.2, 6, 'Red carpet dress'], say: 'Orders are pouring in! 📱' }],
    ['👗 Make copies for everyone', { cash: -0.5, extra: [0.5, 4, 'The famous dress'], say: 'The dress sold out 5 times! 👗' }],
    ['🤝 Ask the star for a collab', { chance: { p: 0.35, win: { fans: 60, extra: [0.4, 8, 'Star collab'], say: 'They said YES! A whole collection together! 🤝' }, lose: { fans: 20, say: 'They were busy. Still famous! 🌟' } } }],
    ['🤫 Stay mysterious', { fans: 25, rep: 4, say: 'The mystery made people want it MORE. 🤫' }]
  ], { rarity: 'rare' });
  B('fashion', 'fakes', '🏷️', 'Fake copies of your brand!', 'People are selling fake versions of your clothes on the street for super cheap. The logo is spelled wrong.', [
    ['⚖️ Take legal action', { cash: -0.5, rep: 3, say: 'The fake sellers are gone. ⚖️' }],
    ['😂 Laugh about the misspelled logo', { fans: 25, say: 'Your funny post went viral! 😂' }],
    ['🏷️ Launch a cheaper line', { cash: -0.4, extra: [0.2, 20, 'Budget line'], say: 'Real clothes for less! No need for fakes! 🏷️' }],
    ['🔐 Add special hidden tags', { cash: -0.2, rep: 3, say: 'Now everyone can tell what\'s real. 🔐' }]
  ]);
  B('fashion', 'runway_trip', '👠', 'A model tripped on the runway!', 'At your big fashion show, a model tripped in giant heels and fell. The crowd gasped. Cameras are flashing!', [
    ['👏 Start clapping loudly', { rep: 5, fans: 15, say: 'The whole crowd clapped. The model got up and did a spin! 👏' }],
    ['👟 "Sneakers on the runway" from now on', { fans: 20, say: 'Comfy fashion is a hit! 👟' }],
    ['📸 Turn the photo into an ad', { fans: 25, rep: -2, say: 'Funny... but a bit mean. 📸' }],
    ['🙈 Pretend it didn\'t happen', { say: 'It happened. Everyone saw. 🙈' }]
  ]);
  B('fashion', 'eco_fabric', '🌿', 'Eco-friendly fabrics?', 'Customers want clothes that are good for the planet. Eco fabrics cost more.', [
    ['🌿 The whole brand goes green', { cash: -1, demand: [1.15, 52, 'Eco brand'], rep: 8, say: 'The planet (and your customers) thank you! 🌿' }],
    ['♻️ A recycled collection', { cash: -0.4, extra: [0.2, 20, 'Recycled collection'], rep: 5, say: 'Clothes made from old bottles! ♻️' }],
    ['🌱 Plant a tree for every sale', { cash: -0.3, rep: 6, fans: 10, say: 'A forest of trees! 🌱' }],
    ['🙅 Too expensive', { say: 'Normal fabric. 🙅' }]
  ]);
  B('fashion', 'rapper_collab', '🎤', 'A rapper wants a collab!', 'A popular rapper wants to design a hoodie collection with you. "Big, bold, and GOLD."', [
    ['🎤 Let\'s go!', { cash: -0.5, extra: [0.5, 8, 'Rapper collab'], fans: 40, say: 'Sold out in 10 minutes! 🎤' }],
    ['👑 Limited edition only', { cash: -0.3, extra: [0.4, 4, 'Limited collab'], fans: 30, say: 'People camped overnight! 👑' }],
    ['💰 Ask for a bigger share', { chance: { p: 0.5, win: { extra: [0.6, 8, 'Rapper collab'], say: 'Deal! 💰' }, lose: { say: 'They went to another brand. 💰' } } }],
    ['🙅 Not our style', { say: 'Maybe. 🙅' }]
  ]);
  B('fashion', 'ugly_sweater', '🧶', 'UGLY sweaters are trending?!', 'For some reason, super ugly sweaters are the hottest trend. The uglier, the better!', [
    ['🧶 Make the ugliest sweaters ever', { cash: -0.3, extra: [0.35, 4, 'Ugly sweaters'], fans: 25, say: 'A sweater with a screaming turkey on it. Sold out! 🧶' }],
    ['🏆 "Ugliest sweater" contest', { fans: 30, say: 'The winner had actual lights and bells! 🏆' }],
    ['😎 Make them ugly but COOL', { cash: -0.3, extra: [0.3, 4, 'Cool-ugly sweaters'], rep: 3, say: 'Stylish ugly. Very fashion. 😎' }],
    ['🙅 We only make nice clothes', { say: 'Other brands made the money. 🙅' }]
  ]);
  B('fashion', 'sample_sale', '🛍️', 'The sample sale madness', 'You\'re selling last season\'s clothes for cheap. 500 people are pushing at the door!', [
    ['🎟️ Timed entry tickets', { extra: [0.35, 1, 'Sample sale'], rep: 4, say: 'Organized and fair! 🎟️' }],
    ['💥 Open the doors!', { extra: [0.45, 1, 'Sample sale'], rep: -3, say: 'Chaos! Big money! Broken mannequins! 💥' }],
    ['🌐 Online sale instead', { extra: [0.3, 1, 'Online sample sale'], say: 'No crowds, good sales! 🌐' }],
    ['❤️ Donate the old clothes', { rep: 7, say: 'Shelters got beautiful clothes. ❤️' }]
  ]);

  // 👟 SNEAKER BRAND
  B('sneakers', 'limited_drop', '👟', 'Limited sneaker drop!', 'Only 500 pairs of your new "Cloud Runners" will be sold. People are camping outside the store for 3 days! ⛺👟', [
    ['🎟️ Raffle so it\'s fair', { extra: [0.35, 1, 'Sneaker drop'], rep: 5, fans: 20, say: 'Fair and exciting! 🎟️' }],
    ['🏃 First come, first served', { extra: [0.35, 1, 'Sneaker drop'], fans: 25, say: 'The campers got their shoes! 🏃' }],
    ['🍕 Bring food to the campers', { cash: -0.1, rep: 5, fans: 15, extra: [0.3, 1, 'Sneaker drop'], say: 'Happy campers! 🍕' }],
    ['🏭 Make 50,000 instead', { cash: -0.5, extra: [0.5, 3, 'Cloud Runners'], fans: -5, say: 'Not "limited" anymore. Still sold well. 🏭' }]
  ]);
  B('sneakers', 'bots', '🤖', 'Bots bought all the sneakers!', 'Your new sneakers sold out online in 3 seconds. All bought by bots. Now they\'re selling for 10 times the price!', [
    ['🛡️ Better anti-bot website', { cash: -0.5, rep: 5, say: 'Real fans can buy now! 🛡️' }],
    ['🔁 Restock for real fans', { cash: -0.3, extra: [0.3, 2, 'Restock'], rep: 4, say: 'The bots\' shoes are worth nothing now! 🔁' }],
    ['📱 App with fan points', { cash: -0.6, rep: 6, fans: 20, say: 'Loyal fans get first chance! 📱' }],
    ['🤷 A sale is a sale', { rep: -6, say: 'Fans are angry. 🤷' }]
  ]);
  B('sneakers', 'athlete', '🏀', 'Sign a young athlete?', 'A 17-year-old basketball star is about to become famous. You could sign them now, cheap, before anyone else!', [
    ['✍️ Sign them!', { cash: -0.6, chance: { p: 0.6, win: { fans: 50, demand: [1.2, 26, 'Star athlete'], say: 'They became a SUPERSTAR! Your shoes are everywhere! 🏀' }, lose: { say: 'They decided to be a dentist. 🦷' } } }],
    ['🤝 A small deal first', { cash: -0.2, fans: 15, say: 'A good start! 🤝' }],
    ['👟 Just send free shoes', { cash: -0.05, chance: { p: 0.3, win: { fans: 30, say: 'They wore them on TV! 👟' }, lose: { say: 'They wore another brand. 👟' } } }],
    ['🙅 Too risky', { say: 'A big brand signed them later. 😩' }]
  ]);
  B('sneakers', 'squeaky', '🔊', 'The new sneakers SQUEAK', 'Every step in the new sneakers makes a loud SQUEAK. Squeak. Squeak. Squeak. Customers are complaining.', [
    ['🔧 Fix the design', { cash: -0.5, rep: 3, say: 'Silent sneakers! 🔧' }],
    ['🎵 Sell them as "Music Sneakers"', { fans: 25, extra: [0.2, 4, 'Squeaky sneakers'], say: 'Kids LOVE squeaking everywhere! 🎵' }],
    ['🔁 Free replacement for everyone', { cash: -0.6, rep: 6, say: 'Everyone got new ones! 🔁' }],
    ['🙉 "They\'ll get quieter"', { rep: -4, say: 'They did not. 🙉' }]
  ]);
  B('sneakers', 'custom_station', '🎨', 'A sneaker customization station', 'Customers want to design their own sneakers: pick colors, add names, add stickers!', [
    ['🎨 Build it in every store', { cash: -0.8, extra: [0.3, 26, 'Custom sneakers'], fans: 20, say: 'Everyone has one-of-a-kind shoes! 🎨' }],
    ['🌐 Online designer', { cash: -0.5, extra: [0.25, 26, 'Online custom'], say: 'Design at home! 🌐' }],
    ['🏆 Design contest', { fans: 30, say: 'The winner\'s design became a real shoe! 🏆' }],
    ['🙅 Too complicated', { say: 'Standard colors. 🙅' }]
  ]);
  B('sneakers', 'light_up', '💡', 'Light-up soles?', '{a} built sneakers with lights in the soles that flash with every step. They look AMAZING at night.', [
    ['💡 Launch them!', { cash: -0.5, extra: [0.35, 8, 'Light-up sneakers'], fans: 30, say: 'Every kid (and some adults) wants them! 💡' }],
    ['🌈 Rainbow color mode', { cash: -0.6, extra: [0.4, 8, 'Rainbow sneakers'], fans: 35, say: 'Rainbow steps everywhere! 🌈' }],
    ['🔋 Test the batteries first', { cash: -0.1, rep: 3, say: 'Safe and long-lasting! 🔋' }],
    ['🙅 "They\'re for babies"', { a: -6, say: '{a} is sad. 🙅' }]
  ], FRONT);
  B('sneakers', 'factory_trouble', '🏭', 'Problems at the shoe factory', 'The factory that makes your shoes says the workers are paid very little and work too many hours.', [
    ['❤️ Pay for fair wages', { cash: -1, rep: 10, fans: 15, say: 'Fair shoes! Customers are proud to wear them! ❤️' }],
    ['🔍 Visit and check yourself', { cash: -0.2, rep: 5, say: 'You saw it and made changes. 🔍' }],
    ['🏭 Find a better factory', { cash: -0.6, rep: 7, say: 'A new factory with happy workers! 🏭' }],
    ['🙈 Not my problem', { rep: -10, say: 'The news found out. Big scandal. 😱' }]
  ]);

  // 🎂 CAKE FACTORY
  B('bakerychain', 'cake_collapse', '🎂', 'The tallest cake COLLAPSED', 'You were building a 3-meter birthday cake for a celebrity party. It fell over. Frosting everywhere. The party is in 4 hours!', [
    ['⚡ Rebuild it FAST', { team: -8, chance: { p: 0.6, win: { rep: 5, fans: 20, say: 'Rebuilt in 3 hours! Heroes! ⚡' }, lose: { rep: -4, say: 'Only 1.5 meters. Still a big cake. 😅' } } }],
    ['🧁 Make 1,000 cupcakes instead', { rep: 3, fans: 15, say: 'A cupcake mountain! They loved it! 🧁' }],
    ['📹 Film the rescue for social media', { fans: 25, say: 'The "cake disaster" video got millions of views! 📹' }],
    ['😭 Tell the truth', { rep: 1, say: 'They were sad, but understood. 😭' }]
  ]);
  B('bakerychain', 'baking_show', '📺', 'Invited to a TV baking show!', 'The biggest baking show on TV wants one of your cake artists as a contestant!', [
    ['🏆 Send your best artist', { chance: { p: 0.45, win: { fans: 50, rep: 8, say: 'YOUR ARTIST WON THE SHOW! 🏆' }, lose: { fans: 20, say: 'Out in round 3. Still great for business! 📺' } } }],
    ['🎤 Be a guest judge', { fans: 30, rep: 4, say: 'You were funny and strict. Viewers loved you! 🎤' }],
    ['🎂 Offer to make the final cake', { cash: -0.2, fans: 25, say: 'Your cake was on TV! 🎂' }],
    ['🙅 Too much drama', { say: 'No TV. 🙅' }]
  ], { rarity: 'rare' });
  B('bakerychain', 'fake_food', '🥾', 'A cake that looks like a SHOE', '{a} made a cake that looks exactly like a real sneaker. A customer tried to put it on. 😂', [
    ['📱 Post "Is it cake?"', { chance: { p: 0.5, win: { viral: [1, 4], say: '"Is it cake?!" went viral! 📱' }, lose: { fans: 15, say: 'People loved it! 📱' } } }],
    ['🎨 Start a "realistic cakes" line', { cash: -0.3, extra: [0.25, 12, 'Realistic cakes'], say: 'Cakes that look like anything! 🎨' }],
    ['🏆 Enter it in a cake contest', { chance: { p: 0.5, win: { fans: 30, rep: 5, say: 'First place! 🏆' }, lose: { fans: 8, say: 'Second place to a cake that looks like a cat. 🐈' } } }],
    ['🍰 Just sell normal cakes', { a: -5, say: 'Boring but safe. 🍰' }]
  ], FRONT);
  B('bakerychain', 'wrong_names', '✍️', 'Wrong names on the birthday cakes!', 'Three cakes went out with mixed-up names. "Happy Birthday GRANDMA" went to a 5-year-old\'s party. 😅', [
    ['🎁 Free cakes for all three', { cash: -0.2, rep: 4, happy: 4, say: 'Everyone forgave you! 🎁' }],
    ['📋 Double-check system', { cash: -0.1, equip: 0.02, say: 'No more mix-ups! 📋' }],
    ['😂 Post the funny mix-up', { fans: 20, say: 'Everyone laughed! 😂' }],
    ['🤷 "Close enough"', { rep: -4, say: 'Not close enough. 🤷' }]
  ]);
  B('bakerychain', 'vegan_cakes', '🌱', 'Vegan cakes?', 'Many customers want cakes with no eggs or milk. {a} says they can make them just as tasty.', [
    ['🌱 A full vegan line', { cash: -0.4, demand: [1.1, 26, 'Vegan cakes'], rep: 4, say: 'New customers everywhere! 🌱' }],
    ['🎂 One vegan cake of the week', { cash: -0.1, demand: [1.04, 12, 'Vegan cake'], say: 'It sells out every week! 🎂' }],
    ['🧪 Blind taste test', { fans: 15, chance: { p: 0.6, win: { rep: 4, say: 'Nobody could tell! 🧪' }, lose: { say: 'People could tell, but still liked it. 🧪' } } }],
    ['🙅 Classic recipes only', { say: 'Butter forever. 🙅' }]
  ], FRONT);
  B('bakerychain', 'cake_smash', '👶', 'Cake smash photos for babies!', 'Parents want mini cakes for "cake smash" photo shoots: babies smash the cake with their hands. Messy and SO cute.', [
    ['👶 Cake smash packages!', { cash: -0.2, extra: [0.2, 20, 'Cake smash'], fans: 25, say: 'The cutest (messiest) business idea ever! 👶' }],
    ['📸 Add a photo studio', { cash: -0.6, extra: [0.3, 26, 'Cake smash studio'], say: 'Cake and photos in one place! 📸' }],
    ['🐶 Dog cake smashes too', { cash: -0.2, extra: [0.15, 20, 'Dog cakes'], fans: 20, say: 'Dogs love it even more! 🐶' }],
    ['🙅 Too messy', { say: 'Clean cakes only. 🙅' }]
  ]);
  B('bakerychain', 'frosting_shortage', '🧈', 'No butter for the frosting!', 'A butter shortage! You need butter for frosting. The shelves are empty.', [
    ['💸 Buy butter at crazy prices', { cash: -0.5, say: 'Very expensive butter. 💸' }],
    ['🍫 Chocolate ganache instead', { fans: 10, say: 'Ganache is a hit! 🍫' }],
    ['🐄 Buy a cow', { cash: -0.4, supply: [-0.02, 52, 'Own cow'], fans: 25, pet: '🐄', say: 'Meet Buttercup, your new cow! 🐄' }],
    ['😬 Less frosting', { happy: -4, say: 'Customers noticed. 😬' }]
  ]);

  // 🕹️ ESPORTS TEAM
  B('esports', 'rage_quit', '😡', '{a} rage-quit on live stream', '{a} lost a match, screamed, and threw their keyboard. 200,000 people were watching live. 😬', [
    ['🧘 Mental coach for the team', { cash: -0.3, team: 6, a: 8, say: 'Calm gamers win more! 🧘' }],
    ['🙏 {a} says sorry on stream', { rep: 3, fans: 10, say: 'Fans respect the apology. 🙏' }],
    ['😂 Sell "Keyboard Throw" shirts', { fans: 20, rep: -2, say: 'Funny... but maybe not nice. 😂' }],
    ['🚪 Bench {a} for a month', { a: -12, rep: 2, say: '{a} is watching from the bench. 🚪' }]
  ], FRONT);
  B('esports', 'worlds', '🌍', 'Qualified for the World Championship!', 'Your team made it to the World Championship! The winner gets a HUGE prize.', [
    ['💪 Train 12 hours a day', { team: -8, chance: { p: 0.35, win: { cash: 5, fans: 60, rep: 10, say: 'WORLD CHAMPIONS!!! 🌍🏆' }, lose: { fans: 25, say: 'Top 8 in the world! Amazing! 🌍' } } }],
    ['😌 Rest and stay calm', { team: 5, chance: { p: 0.3, win: { cash: 5, fans: 60, say: 'Calm and CHAMPIONS! 🏆' }, lose: { fans: 20, say: 'Top 16! Great run! 🌍' } } }],
    ['🧑‍🏫 Hire a legendary coach', { cash: -0.6, chance: { p: 0.45, win: { cash: 5, fans: 60, say: 'The coach made the difference! CHAMPIONS! 🏆' }, lose: { fans: 25, say: 'Semifinals! 🌍' } } }],
    ['🎉 Just enjoy the trip', { team: 10, fans: 15, say: 'Great memories! 🎉' }]
  ], { rarity: 'rare' });
  B('esports', 'energy_sponsor', '⚡', 'An energy drink wants to sponsor you', 'A big energy drink brand wants their logo on your jerseys. They pay a lot. But their drink tastes like batteries.', [
    ['💰 Take the deal', { cash: 1.5, say: 'Big money! 💰' }],
    ['🧃 Ask for a juice brand instead', { chance: { p: 0.4, win: { cash: 1.2, rep: 4, say: 'A healthy juice brand signed you! 🧃' }, lose: { say: 'No juice deal. 🧃' } } }],
    ['📈 Ask for more money', { chance: { p: 0.5, win: { cash: 2.2, say: 'They paid more! 📈' }, lose: { say: 'They signed another team. 📈' } } }],
    ['🙅 No energy drinks for young players', { rep: 5, say: 'Parents of fans love this. 🙅' }]
  ]);
  B('esports', 'lag', '📶', 'LAG during the final!', 'In the most important match of the year, your internet started lagging. Your players are frozen on screen! 📶😱', [
    ['⏸️ Ask for a pause', { chance: { p: 0.7, win: { fans: 15, say: 'Fixed during the pause. You won! 🏆' }, lose: { say: 'The pause was denied. Lost. 😭' } } }],
    ['🌐 Buy super-fast backup internet', { cash: -0.5, equip: 0.03, say: 'Never again! 🌐' }],
    ['😂 Joke about it on stream', { fans: 20, say: 'Everyone laughed. You lost, but fans love you. 😂' }],
    ['😡 Blame the other team', { rep: -5, say: 'Bad sport. 😡' }]
  ]);
  B('esports', 'gaming_house', '🏠', 'Buy a gaming house?', 'Top teams live and train together in a big "gaming house". It\'s expensive but players get much better!', [
    ['🏠 Buy a big house', { cash: -2, capacity: [1.15, 104, 'Gaming house'], team: 10, say: 'Pizza, games and teamwork! 🏠' }],
    ['🏢 Rent an office instead', { cash: -0.5, capacity: [1.08, 52, 'Gaming office'], say: 'Train together, sleep at home. 🏢' }],
    ['📹 Make a reality show there', { cash: -1.8, fans: 50, team: 5, say: 'Fans watch your players cook and fight over the TV! 📹' }],
    ['🙅 Online training is fine', { say: 'Everyone stays home. 🙅' }]
  ]);
  B('esports', 'prodigy', '🧒', 'A 14-year-old gaming genius', 'A 14-year-old is beating pro players online. Other teams are trying to sign them!', [
    ['✍️ Sign them (with parents\' OK)', { cash: -0.4, hireSpecial: { role: 'front', skill: 85 }, fans: 25, say: 'The youngest pro in the country! ✍️' }],
    ['🎓 Academy team first', { cash: -0.2, rep: 5, say: 'School first, then games. Parents love it! 🎓' }],
    ['🎮 Invite them to a friendly match', { fans: 15, chance: { p: 0.5, win: { say: 'Your pros won! Barely. 🎮' }, lose: { fans: 10, say: 'The kid beat your whole team. 😳' } } }],
    ['🙅 Too young', { say: 'Another team signed them. 🙅' }]
  ]);
  B('esports', 'fan_meetup', '🤝', 'Fans want a meet-up!', 'Thousands of fans want to meet your players in real life, get autographs and play with them!', [
    ['🎪 Big fan festival', { cash: -0.5, fans: 40, extra: [0.3, 1, 'Fan festival'], say: 'The best day for fans ever! 🎪' }],
    ['✍️ Autograph signing at a mall', { fans: 25, say: 'The line went around the mall! ✍️' }],
    ['🎮 Fans play vs the pros', { fans: 35, team: 4, say: 'One fan beat a pro! The crowd went WILD! 🎮' }],
    ['🙅 Players need rest', { team: 5, say: 'Rested players. 🙅' }]
  ]);

  // 🎵 MUSIC LABEL
  B('music', 'blew_up', '🔥', 'A song BLEW UP online', 'A song from one of your small artists is suddenly everywhere. Everyone is dancing to it online!', [
    ['📀 Push it to radio stations', { cash: -0.3, extra: [0.5, 6, 'Hit song'], fans: 30, say: 'It\'s #1 on the radio! 📀' }],
    ['🎬 Make a music video fast', { cash: -0.5, extra: [0.6, 6, 'Hit song'], fans: 40, say: 'The music video has 100 million views! 🎬' }],
    ['🎤 Book a big tour', { cash: -0.4, extra: [0.4, 12, 'Tour'], say: 'Sold-out shows! 🎤' }],
    ['😎 Let it grow naturally', { extra: [0.3, 6, 'Hit song'], say: 'Nice and steady. 😎' }]
  ]);
  B('music', 'diva', '💅', 'A singer\'s crazy demands', 'Your biggest star says: "I need a room with 500 blue candies, a live flamingo and a golden microphone, or I won\'t sing."', [
    ['🦩 Give them everything', { cash: -0.8, extra: [0.4, 4, 'Happy star'], say: 'They sang like an angel. The flamingo stole the show. 🦩' }],
    ['🍬 Just the candy', { cash: -0.05, chance: { p: 0.6, win: { say: 'That was enough! They sang! 🍬' }, lose: { say: 'They cancelled the show. 😤' } } }],
    ['🗣️ "Be reasonable, please"', { chance: { p: 0.5, win: { rep: 3, say: 'They laughed and agreed. 🗣️' }, lose: { say: 'They\'re thinking about leaving your label. 😬' } } }],
    ['🚪 "Find another label"', { cash: -0.5, rep: 2, say: 'They left. 🚪' }]
  ]);
  B('music', 'album_leak', '💿', 'The new album LEAKED', 'Your star\'s new album leaked online two weeks before release!', [
    ['🚀 Release it NOW', { extra: [0.4, 4, 'Surprise release'], fans: 20, say: 'Surprise release! Fans loved it! 🚀' }],
    ['🎁 Add 3 bonus songs to the real one', { cash: -0.2, extra: [0.4, 4, 'Deluxe album'], fans: 15, say: 'Fans bought the real one for the bonus songs! 🎁' }],
    ['🕵️ Find the leaker', { chance: { p: 0.5, win: { rep: 3, say: 'Caught! 🕵️' }, lose: { say: 'Never found. 🕵️' } } }],
    ['😭 Cancel the release', { rep: -4, say: 'Fans are confused. 😭' }]
  ]);
  B('music', 'grandma_rapper', '👵', 'A 90-year-old rapper wants a record deal', 'Grandma Rose, 90 years old, walked in and rapped for 3 minutes. It was... actually SUPER good. 👵🎤', [
    ['✍️ Sign her!', { cash: -0.2, fans: 50, extra: [0.3, 8, 'Grandma Rose'], say: 'Grandma Rose is the most viral rapper of the year! 👵🔥' }],
    ['🎤 A duet with your biggest star', { fans: 40, rep: 4, say: 'The duet is a hit! 🎤' }],
    ['📹 Film her story', { fans: 30, say: 'Everyone cried and danced. 📹' }],
    ['🙅 "Too old for this"', { rep: -3, say: 'Another label signed her. She\'s #1 now. 😩' }]
  ]);
  B('music', 'tour', '🚌', 'A world tour?', 'Your top artist wants to go on a 50-city world tour. It\'s a huge risk and a huge reward.', [
    ['🌍 Book the whole world tour!', { cash: -1.5, chance: { p: 0.6, win: { cash: 5, fans: 50, say: 'Sold out everywhere! 🌍' }, lose: { cash: -1, say: 'Half the shows were empty. 😩' } } }],
    ['🚌 A smaller national tour', { cash: -0.5, extra: [0.3, 8, 'National tour'], fans: 20, say: 'Great shows all over the country! 🚌' }],
    ['📺 One giant livestream concert', { cash: -0.3, extra: [0.4, 2, 'Livestream concert'], fans: 30, say: 'Millions watched from home! 📺' }],
    ['🙅 Stay in the studio', { say: 'More songs, fewer shows. 🙅' }]
  ]);
  B('music', 'copied_song', '©️', 'Another label copied your song!', 'A big new hit sounds EXACTLY like your artist\'s song from last year. Same melody. Different words.', [
    ['⚖️ Sue them!', { cash: -0.5, chance: { p: 0.55, win: { cash: 3, say: 'You won! Big payment! ⚖️' }, lose: { say: 'The judge said "melodies are similar sometimes". ⚖️' } } }],
    ['🎶 Make a mashup of both songs', { fans: 30, say: 'The mashup is even bigger than both! 🎶' }],
    ['📱 Show both songs side by side online', { fans: 20, rep: 2, say: 'Everyone knows yours was first! 📱' }],
    ['🤷 Music is for everyone', { say: 'Very chill of you. 🤷' }]
  ]);
  B('music', 'vinyl', '💿', 'Vinyl records are back!', 'Young people are buying old-school vinyl records again. {a} wants to press your top albums on vinyl.', [
    ['💿 Press them all!', { cash: -0.5, extra: [0.25, 20, 'Vinyl sales'], fans: 15, say: 'Vinyl sold out! Retro is cool! 💿' }],
    ['🌈 Colorful limited vinyl', { cash: -0.4, extra: [0.3, 12, 'Colorful vinyl'], fans: 20, say: 'Glitter vinyl! Collectors went crazy! 🌈' }],
    ['📼 Cassette tapes too?!', { cash: -0.2, fans: 12, say: 'Some people love cassettes. Who knew? 📼' }],
    ['🙅 Streaming only', { a: -4, say: 'Modern and simple. 🙅' }]
  ], FRONT);

  // 🦁 ZOO
  B('zoo', 'panda_loan', '🐼', 'A panda is coming to visit!', 'Another country wants to lend your zoo two giant pandas for a year! It costs a lot, but pandas are SUPER popular.', [
    ['🐼 Yes! Build a bamboo home', { cash: -1.5, demand: [1.3, 52, 'Pandas!'], fans: 50, say: 'The panda line is 2 hours long! 🐼' }],
    ['🎋 Grow your own bamboo', { cash: -1.2, supply: [-0.01, 52, 'Own bamboo'], demand: [1.25, 52, 'Pandas!'], fans: 40, say: 'Pandas + your own bamboo! 🎋' }],
    ['📹 24/7 Panda Cam', { cash: -1.3, demand: [1.25, 52, 'Pandas'], fans: 60, say: 'Millions watch the pandas nap online! 📹' }],
    ['🙅 Too expensive', { say: 'No pandas. 🙅' }]
  ], { rarity: 'rare' });
  B('zoo', 'penguin_parade', '🐧', 'A daily penguin parade?', '{a} says the penguins love walking in a line. What if they walked through the zoo every day at noon?', [
    ['🐧 Daily penguin parade!', { fans: 30, demand: [1.12, 26, 'Penguin parade'], say: 'The cutest parade in the world! 🐧' }],
    ['🎵 Parade with music', { cash: -0.1, fans: 35, say: 'The penguins waddle to music. People cry happy tears. 🎵' }],
    ['🐧 Only on weekends', { fans: 15, demand: [1.05, 26, 'Weekend parade'], say: 'Weekend fun! 🐧' }],
    ['🙅 Let penguins be penguins', { rep: 3, say: 'Happy, relaxed penguins. 🙅' }]
  ], FRONT);
  B('zoo', 'giraffe_selfie', '🦒', 'The giraffe photobombs everyone', 'A giraffe keeps sticking its head into visitors\' selfies. Every photo has a surprised giraffe in it. 🦒📸', [
    ['📸 "Giraffe Selfie Spot"', { fans: 35, demand: [1.08, 12, 'Giraffe selfies'], say: 'People come just for giraffe selfies! 📸' }],
    ['🏆 Best giraffe photobomb contest', { fans: 30, say: 'Thousands of hilarious photos! 🏆' }],
    ['🥬 Giraffe feeding tickets', { extra: [0.15, 12, 'Giraffe feeding'], fans: 15, say: 'Feed a giraffe! Kids love it! 🥬' }],
    ['🦒 Move the giraffe back', { say: 'No more photobombs. The giraffe seems sad. 🦒' }]
  ]);
  B('zoo', 'sick_lion', '🦁', 'The old lion is sick', 'Leo, your oldest lion, is sick and not eating. He is the zoo\'s most famous animal.', [
    ['🩺 The best animal doctors', { cash: -0.5, chance: { p: 0.7, win: { rep: 5, fans: 15, say: 'Leo is roaring again! 🦁' }, lose: { rep: 3, say: 'Leo is resting now. The vets did everything they could. 🕊️' } } }],
    ['🌴 A quiet, peaceful area for Leo', { cash: -0.3, rep: 6, say: 'Leo is calm and comfortable. ❤️' }],
    ['💌 Fans send get-well cards', { fans: 25, rep: 4, say: 'Thousands of cards from kids! 💌' }],
    ['🙈 Keep him on show', { rep: -6, say: 'Visitors were sad to see him like that. 🙈' }]
  ]);
  B('zoo', 'night_zoo', '🌙', 'Night zoo tours?', 'Many animals are awake at night. You could do flashlight tours after dark!', [
    ['🔦 Night tours!', { cash: -0.3, extra: [0.25, 20, 'Night tours'], fans: 20, say: 'Glowing eyes everywhere! Spooky and fun! 🔦' }],
    ['⛺ Sleepovers at the zoo', { cash: -0.4, extra: [0.3, 20, 'Zoo sleepovers'], fans: 30, say: 'Kids sleep next to the aquarium! ⛺' }],
    ['🌟 Only on full moon nights', { extra: [0.1, 20, 'Full moon tours'], fans: 15, say: 'Magical full moon tours! 🌟' }],
    ['🙅 Animals need sleep', { rep: 3, say: 'Quiet nights. 🙅' }]
  ]);
  B('zoo', 'monkey_phone', '🐒', 'A monkey stole a tourist\'s phone!', 'A monkey grabbed a tourist\'s phone and is now taking selfies with it at the top of a tree. 🐒📱', [
    ['🍌 Trade a banana for the phone', { fans: 15, say: 'The monkey made the trade! Fair deal. 🍌' }],
    ['📸 Post the monkey\'s selfies', { fans: 40, say: 'The monkey selfies went viral! 📸🐒' }],
    ['🪜 Climb up and get it', { chance: { p: 0.5, win: { fans: 10, say: 'Got it! 🪜' }, lose: { rep: -2, say: 'The monkey threw the phone into the pond. 💦' } } }],
    ['🎁 Buy the tourist a new phone', { money: -800, rep: 5, say: 'The tourist loved you! 🎁' }]
  ]);
  B('zoo', 'elephant_art', '🐘', 'The elephant paints ART', 'Ellie the elephant holds a paintbrush with her trunk and paints colorful pictures. People want to buy them!', [
    ['🖼️ Sell Ellie\'s paintings', { extra: [0.2, 20, 'Elephant art'], fans: 25, say: 'Ellie\'s art sells for a lot! Money goes to animal care. 🖼️' }],
    ['🏛️ An art show at a museum', { fans: 35, rep: 5, say: 'Ellie is a famous artist now! 🏛️' }],
    ['🎨 Kids paint with Ellie', { cash: -0.1, fans: 30, extra: [0.12, 20, 'Paint with Ellie'], say: 'The happiest art class ever! 🎨' }],
    ['🐘 Let Ellie paint just for fun', { rep: 4, say: 'Ellie is happy. That\'s what matters. 🐘' }]
  ]);
})();
