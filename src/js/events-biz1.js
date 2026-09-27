// Events that only happen in one kind of business, part 1: the small businesses.
// B(business, id, icon, title, text, [4 x [answer, effect]], extra fields) — see events.js for effects.
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
    CS.ev(d);
  };

  // ☕ CAFÉ
  B('cafe', 'latte_art', '🎨', '{a}\'s latte art is a masterpiece', '{a} made latte art that looks exactly like the Mona Lisa. Customers are taking photos instead of drinking!', [
    ['📱 Post it everywhere', { chance: { p: 0.45, win: { viral: [1, 3], a: 10, say: 'The "Mona Latte" went viral! 🎨🔥' }, lose: { fans: 12, say: 'Lots of likes! ☕' } } }],
    ['🏆 Hold a latte art contest', { cash: -0.1, fans: 18, team: 5, say: 'People came from all over the city to compete! 🏆' }],
    ['💰 Charge extra for "art lattes"', { extra: [0.15, 6, 'Art lattes'], a: 6, say: 'People happily pay more for art! 💰' }],
    ['⏱️ "Faster please, just a heart"', { a: -8, capacity: [1.05, 2, 'Fast lattes'], say: '{a} makes hearts now. Sad hearts. 💔' }]
  ], FRONT);
  B('cafe', 'bean_storm', '🌧️', 'Coffee beans cost DOUBLE!', 'A big storm hit the coffee farms. Coffee bean prices doubled overnight! ☕📈', [
    ['📈 Raise your prices', { price: 1, happy: -3, say: 'Customers grumbled but kept coming. ☕' }],
    ['🌎 Find a new farm far away', { cash: -0.3, chance: { p: 0.6, win: { supply: [-0.03, 12, 'New farm'], say: 'The new beans are cheaper AND tastier! 🌎' }, lose: { say: 'The new beans taste like socks. Back to the old ones. 🧦' } } }],
    ['🍵 Make it "Tea Week"', { fans: 8, say: 'Tea Week was surprisingly popular! 🍵' }],
    ['😬 Pay more and say nothing', { supply: [0.05, 5, 'Expensive beans'], say: 'Your profits shrink for a while. 😬' }]
  ]);
  B('cafe', 'laptop_campers', '💻', 'The laptop campers', 'A group of students sits in your café ALL DAY with laptops. They buy one coffee. Each. Per day.', [
    ['🔐 Change the Wi-Fi password every hour', { happy: -3, capacity: [1.05, 3, 'Free tables'], say: 'They left, grumbling. Tables are free! 🔐' }],
    ['💺 Make a "work zone" with a fee', { extra: [0.1, 8, 'Work zone'], say: 'They pay for the work zone now. Win-win! 💺' }],
    ['🍪 Bring them free cookies', { cash: -0.05, chance: { p: 0.6, win: { extra: [0.08, 4, 'Snacking students'], say: 'The cookies made them hungry. They buy lunch now! 🍪' }, lose: { say: 'They ate the cookies and bought nothing. 😑' } } }],
    ['🤷 Let them stay', { rep: 2, say: 'They love you. They\'ll be rich one day. 🤷' }]
  ]);
  B('cafe', 'decaf_mixup', '😴', 'Oops, all DECAF!', '{a} used decaf beans all morning by mistake. Customers are sleepy and grumpy. Someone fell asleep in the bathroom. 😴', [
    ['☕ Free real coffee for everyone', { cash: -0.15, happy: 4, say: 'The café woke up again! ☕⚡' }],
    ['😴 Call it "Nap Café Day"', { fans: 15, say: 'People loved napping! "Nap Café" is now a monthly event. 😴' }],
    ['📛 Label the bags better', { equip: 0.01, say: 'Big labels: DECAF and REAL. 📛' }],
    ['😤 Scold {a}', { a: -10, say: '{a} feels terrible. 😤' }]
  ], FRONT);
  B('cafe', 'cat_cafe', '🐱', 'Cat café idea!', 'A regular says: "You know what this place needs? CATS. Lots of cats." Cat cafés are very popular right now...', [
    ['🐱 Adopt 6 shelter cats!', { cash: -0.5, fans: 30, demand: [1.15, 10, 'Cat café'], pet: '🐱', say: 'People LOVE the cats! Some come just to pet them. 🐱' }],
    ['🐈 Just one cat', { pet: '🐈', fans: 12, say: 'The café cat, Mr. Beans, is a star. 🐈' }],
    ['🤧 Some customers are allergic', { rep: 1, say: 'Safe choice. No cats. 🤧' }],
    ['🐶 Make it a DOG café instead', { cash: -0.4, fans: 25, chance: { p: 0.6, win: { demand: [1.12, 8, 'Dog café'], say: 'Dog café! Tails wagging everywhere! 🐶' }, lose: { happy: -4, say: 'The dogs ate a cake. Loudly. 🐶🎂' } } }]
  ]);
  B('cafe', 'espresso_noise', '☕', 'The espresso machine is SCREAMING', 'Your big espresso machine is making noises like a dragon. Steam is coming out of places it shouldn\'t. 🐉', [
    ['🔧 Call the repair person', { cash: -0.3, say: 'Fixed! It purrs like a kitten now. 🔧' }],
    ['✨ Buy a shiny new machine', { cash: -1, equip: 0.04, say: 'The new machine makes coffee 2x faster! ✨' }],
    ['👊 Give it a good kick', { chance: { p: 0.4, win: { say: 'It WORKED! Don\'t tell anyone. 👊' }, lose: { cash: -0.5, closed: [1, 'Machine broken'], say: 'Now it\'s really broken. 😩' } } }],
    ['🐉 Name it "Dragon" and keep going', { fans: 8, capacity: [0.95, 3, 'Grumpy machine'], say: 'Customers love hearing "the Dragon" roar. 🐉' }]
  ]);
  B('cafe', 'bestseller_book', '📚', 'A bestseller was written in your café!', 'A regular wrote a book at table 4 every day. The book is now a bestseller, and your café is in it!', [
    ['🪑 Put a sign: "The Famous Table"', { fans: 20, demand: [1.12, 6, 'Book fans'], say: 'Fans line up to sit at table 4! 🪑' }],
    ['📖 Host a book signing', { cash: -0.1, fans: 25, rep: 3, say: 'Hundreds of readers came! 📖' }],
    ['☕ Name a drink after the book', { extra: [0.12, 8, 'Book latte'], say: 'The "Chapter One Latte" is a hit! ☕' }],
    ['🤷 Business as usual', { fans: 5, say: 'A few book fans came by anyway. 📚' }]
  ]);

  // 🍝 RESTAURANT
  B('restaurant', 'ketchup_pasta', '🍝', '{a} threw a pan! 🍳', 'A customer asked for ketchup on the pasta. {a} threw a pan across the kitchen and yelled "NEVER!" 😤', [
    ['🧘 Send {a} to anger class', { cash: -0.1, a: 5, say: '{a} now breathes deeply when angry. Mostly. 🧘' }],
    ['🍅 Give the customer ketchup anyway', { happy: 3, a: -8, say: 'The customer was happy. {a} is NOT. 🍅' }],
    ['😂 Put "NO KETCHUP" on the menu', { fans: 15, a: 8, say: 'People come just to see the famous sign! 😂' }],
    ['🚪 "One more pan and you\'re out"', { a: -5, reliable: { a: 5 }, say: '{a} is calmer now. 🚪' }]
  ], FRONT);
  B('restaurant', 'secret_menu', '🤫', 'Customers want a SECRET menu', 'Everyone is whispering about a "secret menu" at your restaurant. There isn\'t one... yet.', [
    ['🤫 Make a real secret menu', { fans: 20, extra: [0.12, 8, 'Secret menu'], say: 'You have to say the password to order. Everyone loves it! 🤫' }],
    ['😏 Say "What secret menu?" with a wink', { fans: 12, say: 'The mystery grows. 😏' }],
    ['📜 Put it on the normal menu', { say: 'Not very secret now. 📜' }],
    ['🎲 Make "Chef\'s Surprise" dishes', { chance: { p: 0.6, win: { fans: 18, happy: 4, say: 'Surprise dishes are a hit! 🎲' }, lose: { happy: -3, say: 'Someone got fish ice cream. 🐟🍦' } } }]
  ]);
  B('restaurant', 'wedding_catering', '💒', 'Catering for 300 wedding guests!', 'A couple wants you to cook for their wedding. 300 guests. In 3 days. 😱', [
    ['👨‍🍳 Yes! Everyone works overtime', { cash: 1.5, team: -8, say: 'You did it! Everyone is exhausted but rich. 💒' }],
    ['👥 Hire extra cooks for the job', { cash: 1, hireSpecial: { role: 'front', skill: 50 }, say: 'Smooth wedding! You even kept one of the cooks. 👥' }],
    ['🍝 Only do the pasta', { cash: 0.4, say: 'A LOT of pasta. 🍝' }],
    ['🙅 Too much work', { say: 'They hired {rival} instead.', rival: 0.03 }]
  ], { init: rival });
  B('restaurant', 'spicy_challenge', '🌶️', 'The World\'s Spiciest Dish challenge', '{a} wants to make the spiciest dish in the world. Anyone who finishes it gets their photo on the wall. 🌶️🔥', [
    ['🌶️ Do it!', { fans: 25, extra: [0.1, 6, 'Spicy challenge'], say: 'People are crying, sweating and posting videos. Huge hit! 🌶️' }],
    ['🥛 Do it, with free milk', { cash: -0.1, fans: 20, rep: 2, say: 'Safe spicy fun. The milk goes fast. 🥛' }],
    ['😰 You try it first', { team: 10, fans: 10, say: 'You cried for 20 minutes. The team filmed everything. 😭🌶️' }],
    ['🙅 Too dangerous', { say: 'No fire dishes today. 🙅' }]
  ], FRONT);
  B('restaurant', 'grandma_recipe', '👵', '{a}\'s grandma\'s secret recipe', '{a} wants to add their grandma\'s secret family recipe to the menu. Grandma says it\'s "the best food in the world".', [
    ['👵 Add it to the menu', { chance: { p: 0.7, win: { demand: [1.12, 8, 'Grandma\'s dish'], fans: 10, a: 10, say: 'Grandma was right. Best dish ever! 👵' }, lose: { happy: -3, say: 'Nobody liked it. Don\'t tell grandma. 🤫' } } }],
    ['🎉 Invite grandma to cook it herself', { fans: 18, rep: 3, a: 12, say: 'Grandma became a local celebrity! 🎉' }],
    ['🔐 Buy the recipe from the family', { cash: -0.3, demand: [1.1, 12, 'Secret recipe'], say: 'It\'s yours now! 🔐' }],
    ['🙅 "Our menu is fine"', { a: -8, say: '{a} will tell grandma. Grandma will be sad. 🙅' }]
  ], FRONT);
  B('restaurant', 'no_show', '📅', 'The big group never came', 'A group of 30 people booked the whole restaurant tonight. They never showed up. You made 30 dinners for nobody. 😩', [
    ['🎁 Give the food to a shelter', { rep: 6, say: 'Hundreds of people ate well tonight. ❤️' }],
    ['💳 Charge a no-show fee from now on', { rep: -1, equip: 0.01, say: 'No more no-shows! 💳' }],
    ['🍽️ Staff dinner party!', { team: 10, say: 'The team feasted like kings. 🍽️' }],
    ['📱 Post a "free dinner" invite', { fans: 20, cash: -0.05, say: 'Strangers came and loved it. New regulars! 📱' }]
  ]);
  B('restaurant', 'golden_fork', '🍴', 'The Golden Fork inspector is coming!', 'Rumor says the famous Golden Fork food guide is visiting restaurants in {city} this month. A star would change everything!', [
    ['⭐ Make everything PERFECT', { cash: -0.5, team: -5, chance: { p: 0.45, win: { rep: 10, fans: 40, demand: [1.2, 12, 'Golden Fork star'], say: 'YOU GOT A GOLDEN FORK STAR! ⭐⭐⭐' }, lose: { rep: 3, say: 'No star this time, but the food got better. 🍴' } } }],
    ['🕵️ Try to figure out who they are', { chance: { p: 0.3, win: { rep: 6, fans: 20, say: 'You guessed right and they LOVED you! 🕵️' }, lose: { rep: -2, say: 'You treated a random man like a king. The real inspector got cold soup. 😅' } } }],
    ['😌 Just cook like always', { chance: { p: 0.25, win: { rep: 8, fans: 30, say: 'They loved the real you! STAR! ⭐' }, lose: { say: 'No star. Maybe next year. 😌' } } }],
    ['🤷 "Who cares about stars?"', { team: 3, say: 'Your team is relaxed. 🤷' }]
  ], { rarity: 'rare' });

  // 🥐 BAKERY
  B('bakery', 'oven_4am', '🔥', 'The oven broke at 4 AM!', 'You come in at 4 AM to bake and... the oven won\'t turn on. The shop opens in 3 hours!', [
    ['📞 Emergency repair (expensive!)', { cash: -0.5, say: 'Fixed by 6:30! Bread was ready just in time. 📞' }],
    ['🏃 Borrow the pizza place\'s oven', { rep: 2, chance: { p: 0.7, win: { say: 'Your croissants taste a bit like pizza. People loved it? 🍕🥐' }, lose: { demand: [0.8, 1, 'No bread'], say: 'They said no. No bread today. 😩' } } }],
    ['🥪 Sell sandwiches from yesterday\'s bread', { cash: -0.1, say: 'Not fresh, but everyone got something! 🥪' }],
    ['🔒 Close for the day', { closed: [1, 'Oven broken'], say: 'A quiet, sad day without bread. 🔒' }]
  ]);
  B('bakery', 'giant_cake', '🎂', 'A 5-floor wedding cake!', 'A rich family ordered a wedding cake with 5 floors, a chocolate fountain and sugar swans. It pays a LOT.', [
    ['🎂 Yes! Build it!', { cash: 2, team: -6, chance: { p: 0.75, win: { rep: 5, say: 'The cake was PERFECT. The bride cried! 🎂' }, lose: { rep: -3, cash: -0.8, say: 'Floor 4 fell over on the way. 😱🎂' } } }],
    ['👥 Hire an expert cake artist', { cash: 1.2, rep: 4, say: 'Safe and beautiful. Everyone was happy! 👥' }],
    ['🧁 Offer 500 cupcakes instead', { cash: 0.6, say: 'They loved the cupcake tower idea! 🧁' }],
    ['🙅 Too risky', { say: 'Maybe next time. 🙅' }]
  ]);
  B('bakery', 'gluten_free', '🌾', 'Customers want gluten-free!', 'More and more customers ask: "Do you have anything without gluten?" You don\'t... yet.', [
    ['🌾 Make a gluten-free line', { cash: -0.4, demand: [1.1, 12, 'Gluten-free'], rep: 3, say: 'A whole new group of customers found you! 🌾' }],
    ['🍪 Just one gluten-free cookie', { fans: 5, happy: 2, say: 'People were thankful for the option. 🍪' }],
    ['📝 Put ingredients on every label', { rep: 3, say: 'People trust you more now. 📝' }],
    ['🙅 "This is a BREAD shop"', { happy: -2, say: 'Some customers went elsewhere. 🙅' }]
  ]);
  B('bakery', 'bread_statue', '🗿', '{a} made a bread statue of the mayor', '{a} baked a life-size statue of the mayor out of bread. It is... very good. And very big.', [
    ['🪟 Put it in the window', { fans: 25, say: 'Crowds come to see "Bread Mayor"! 🗿' }],
    ['🎁 Give it to the mayor', { rep: 6, say: 'The mayor LOVED it and ate the ear. 🎁' }],
    ['🍞 Cut it up and sell it', { cash: 0.3, say: '"Mayor bread" sold out. Weird but okay. 🍞' }],
    ['🏆 Enter it in the art fair', { chance: { p: 0.5, win: { fans: 30, a: 12, say: 'It WON the art fair! 🏆' }, lose: { say: 'A pigeon ate the head. 🐦' } } }]
  ], FRONT);
  B('bakery', 'croissant_war', '🥐', 'The French baker says yours are FAKE', 'The French baker across the street put up a sign: "REAL croissants here. Not like THOSE ones." It points at your shop. 😤', [
    ['⚔️ Challenge them to a bake-off!', { chance: { p: 0.5, win: { fans: 35, rep: 5, say: 'YOU WON! The judges picked your croissant! 🥐🏆' }, lose: { fans: 10, say: 'You lost, but the bake-off was so fun. 🥐' } } }],
    ['🪧 Put up your own funny sign', { fans: 15, say: '"Our croissants: less talking, more tasting." Everyone laughed! 🪧' }],
    ['🎓 Take a real French baking class', { cash: -0.3, equip: 0.02, rep: 3, say: 'Oh là là! Your croissants are amazing now. 🎓' }],
    ['🤝 Bring them a gift and make peace', { rep: 3, say: 'They gave you their secret butter tip! 🤝' }]
  ]);
  B('bakery', 'flour_cloud', '👻', 'FLOUR EXPLOSION!', '{a} opened a giant bag of flour too fast. POOF! The whole bakery is white and {a} looks like a ghost. 👻', [
    ['📸 Take a photo first!', { fans: 15, a: 3, say: 'The "Flour Ghost" photo is everywhere! 📸' }],
    ['🧹 Everyone clean up', { team: 3, closed: [1, 'Flour cleanup'], say: 'It took all day. Flour is still in your ears. 🧹' }],
    ['❄️ Call it "Winter Wonderland Day"', { fans: 12, happy: 3, say: 'Kids loved the "snowy" bakery! ❄️' }],
    ['😤 Take it out of {a}\'s pay', { a: -12, say: '{a} is not happy. 😤' }]
  ], FRONT);
  B('bakery', 'leftover_bread', '🍞', 'So much bread left over', 'Every night, a big pile of bread doesn\'t get sold. It\'s a waste!', [
    ['❤️ Give it to people who need it', { rep: 6, say: 'The shelter calls you "The Bread Angel". ❤️' }],
    ['🏷️ "Happy Hour" half price at 6 PM', { extra: [0.08, 10, 'Happy hour bread'], say: 'People wait for Happy Hour now! 🏷️' }],
    ['🍞 Make croutons and bread pudding', { supply: [-0.02, 10, 'No waste'], say: 'Nothing gets thrown away now! 🍞' }],
    ['🦆 Feed the ducks', { fans: 5, say: 'The ducks love you. Very fat ducks. 🦆' }]
  ]);

  // 🌮 FOOD TRUCK
  B('foodtruck', 'parking_spot', '🅿️', 'Someone stole your parking spot!', 'Your best spot, the one next to the park, has a new truck in it. It\'s {rival}\'s hot dog truck! 🌭', [
    ['⏰ Come at 5 AM tomorrow', { team: -4, say: 'You got the spot back! The early bird gets the tacos. ⏰' }],
    ['🌮 Park right next to them', { fans: 12, rival: -0.04, say: 'Taco vs hot dog war! Customers pick YOU. 🌮' }],
    ['🗺️ Find a new, better spot', { chance: { p: 0.5, win: { demand: [1.15, 8, 'New spot'], say: 'The new spot is even better! 🗺️' }, lose: { demand: [0.9, 3, 'Bad spot'], say: 'Not many people here. Hmm. 🗺️' } } }],
    ['📞 Complain to the city', { rep: -1, say: 'The city says "first come, first served". 📞' }]
  ], { init: rival });
  B('foodtruck', 'festival', '🎪', 'A music festival wants your truck!', 'The biggest music festival of the summer wants your food truck! 50,000 hungry people. But the spot costs a lot.', [
    ['🎪 Pay and go!', { cash: -0.6, extra: [0.8, 1, 'Festival sales'], fans: 20, say: 'You sold out THREE times! 🎪🎸' }],
    ['👥 Go and hire festival helpers', { cash: -0.8, extra: [1, 1, 'Festival sales'], fans: 25, say: 'Record sales! Everyone knows your tacos now. 👥' }],
    ['💸 Ask for a cheaper deal', { chance: { p: 0.4, win: { extra: [0.7, 1, 'Festival sales'], say: 'They said yes! Big sales, small cost! 💸' }, lose: { say: 'They gave the spot to another truck. 😩' } } }],
    ['🙅 Too far away', { say: 'You stayed home. Quiet weekend.' }]
  ]);
  B('foodtruck', 'breakdown', '🚚', 'The truck broke down on the highway!', 'Smoke is coming out of the engine. You\'re stuck on the highway with 200 tacos inside.', [
    ['🔧 Call a tow truck', { cash: -0.4, closed: [1, 'Truck repair'], say: 'Fixed after a day. The tacos did not survive. 🔧' }],
    ['🌮 Sell tacos to stuck drivers!', { cash: 0.3, fans: 15, say: 'A traffic jam formed... and everyone bought tacos! 🌮' }],
    ['🛠️ Try to fix it yourself', { chance: { p: 0.4, win: { team: 6, say: 'You fixed it with a spoon and tape! 🛠️' }, lose: { cash: -0.6, closed: [1, 'Truck repair'], say: 'Now it\'s MORE broken. 😩' } } }],
    ['🚚 Buy a newer truck', { cash: -2, equip: 0.05, say: 'The new truck is shiny and fast! 🚚✨' }]
  ]);
  B('foodtruck', 'taco_tuesday', '🌮', 'TACO TUESDAY RUSH!', 'It\'s Taco Tuesday and there are 100 people in line! You can\'t make tacos fast enough!', [
    ['⚡ Everyone cook FASTER!', { capacity: [1.2, 1, 'Taco rush'], team: -4, say: 'You made 1,000 tacos! Your arms hurt. ⚡' }],
    ['🎵 Play music to keep them happy', { happy: 5, fans: 8, say: 'The line became a dance party! 🎵' }],
    ['🎟️ Give out numbers', { happy: 3, say: 'Organized and calm. 🎟️' }],
    ['🌮 "Taco Tuesday" every week!', { demand: [1.1, 10, 'Taco Tuesdays'], fans: 10, say: 'It\'s official! Every Tuesday! 🌮' }]
  ]);
  B('foodtruck', 'rainy_week', '🌧️', 'It\'s raining all week', 'Rain, rain, rain. Nobody walks outside when it rains. Nobody buys from food trucks. 🌧️', [
    ['📦 Start deliveries', { cash: -0.2, extra: [0.2, 3, 'Rain deliveries'], say: 'Tacos delivered to your door! 📦' }],
    ['☂️ Give away free umbrellas', { cash: -0.1, fans: 12, say: 'Everyone in town has a taco umbrella now. ☂️' }],
    ['🏢 Park at the big office buildings', { demand: [1.08, 1, 'Office lunch'], say: 'Office workers LOVE hot tacos on rainy days! 🏢' }],
    ['🛌 Take a rain break', { team: 6, demand: [0.8, 1, 'Rain'], say: 'Cozy week off. 🛌' }]
  ]);
  B('foodtruck', 'cookoff', '🔥', 'A food truck cook-off!', 'The city is holding a food truck battle. The winner gets a trophy and a front-page article!', [
    ['🌮 Enter with your classic taco', { chance: { p: 0.5, win: { fans: 30, rep: 5, say: 'YOU WON! Best Truck in {city}! 🏆' }, lose: { fans: 8, say: 'Second place! Not bad! 🥈' } } }],
    ['🌶️ Enter with a crazy new recipe', { chance: { p: 0.35, win: { fans: 45, rep: 6, say: 'The crazy recipe WON! 🌶️🏆' }, lose: { rep: -2, say: 'The judges did NOT like the gummy bear taco. 🐻🌮' } } }],
    ['🎤 Be a judge instead', { fans: 10, say: 'You ate 30 tacos. Worth it. 🎤' }],
    ['🙅 Skip it', { say: 'Maybe next year.' }]
  ]);
  B('foodtruck', 'rapper_tweet', '🎤', 'A famous rapper posted your tacos!', 'A super famous rapper bought tacos from your truck and posted: "BEST TACOS ON EARTH 🔥🌮". Your phone won\'t stop buzzing!', [
    ['📱 Repost it with a thank you', { fans: 40, demand: [1.2, 4, 'Rapper fans'], say: 'The whole internet wants your tacos! 📱' }],
    ['🎵 Make a "rapper taco" special', { extra: [0.2, 6, 'Rapper special'], fans: 20, say: 'The "Fire Taco" sells like crazy! 🎵' }],
    ['🤝 Ask them for a real collab', { chance: { p: 0.3, win: { fans: 60, rep: 5, say: 'They put your truck in a music video! 🤝' }, lose: { fans: 15, say: 'They didn\'t answer. Still famous! 😎' } } }],
    ['😎 Stay chill', { fans: 15, say: 'Cool as a cucumber. 😎' }]
  ], { rarity: 'rare' });

  // 🚿 CAR WASH
  B('carwash', 'monster_mud', '🛻', 'A monster truck covered in MUD', 'A giant monster truck drove in. It is covered in so much mud you can\'t see the windows. The driver says: "Make it shine!"', [
    ['💪 Everyone scrub!', { cash: 0.3, team: -3, say: 'It took 4 hours. It SHINES. 💪' }],
    ['💲 Charge triple', { cash: 0.5, happy: -1, say: 'The driver paid. Big truck, big price. 💲' }],
    ['📹 Film it for a satisfying video', { chance: { p: 0.4, win: { viral: [1, 3], say: 'Mud-to-shine videos are SO satisfying. Viral! 📹' }, lose: { fans: 10, say: 'Nice video! 📹' } } }],
    ['🙅 "Too big, sorry"', { say: 'The truck rolled away. 🛻' }]
  ]);
  B('carwash', 'rain_week', '🌧️', 'Rain all week = no customers', 'Nobody washes their car when it\'s raining. The forecast says rain for 7 days. 🌧️', [
    ['🧽 Offer inside cleaning', { extra: [0.15, 2, 'Interior cleaning'], say: 'People want clean seats even when it rains! 🧽' }],
    ['🎟️ Sell "wash after the rain" coupons', { cash: 0.2, demand: [1.1, 2, 'Coupon rush'], say: 'Everyone came after the rain! 🎟️' }],
    ['🛠️ Fix and clean the machines', { equip: 0.03, say: 'Everything is ready for sunny days. 🛠️' }],
    ['🛌 Close for the week', { closed: [1, 'Rainy week'], team: 6, say: 'A cozy week off. 🛌' }]
  ]);
  B('carwash', 'foam_party', '🫧', 'FOAM PARTY!', '{a} put 10 times too much soap in the machine. The whole car wash is full of foam. Kids are jumping in it! 🫧', [
    ['🎉 Make it a real foam party!', { fans: 25, extra: [0.1, 1, 'Foam party'], say: 'The best party in {city} was at a car wash! 🎉' }],
    ['🧹 Clean it up fast', { closed: [1, 'Foam cleanup'], say: 'Foam everywhere. For days. 🧹' }],
    ['📸 Post photos', { fans: 15, say: 'Everyone loved the bubble photos! 📸' }],
    ['😤 Scold {a}', { a: -10, say: '{a} feels bad. 😤' }]
  ], FRONT);
  B('carwash', 'race_car', '🏎️', 'A famous race car driver comes in!', 'A famous race car driver pulled in with their race car. They want it super clean for tomorrow\'s big race.', [
    ['✨ Your best wash ever!', { rep: 4, fans: 20, say: 'The driver WON the race and thanked your car wash on TV! 🏎️🏆' }],
    ['📸 Ask for a photo', { fans: 25, say: 'The photo is on your wall now. 📸' }],
    ['💲 Ask them to sponsor you', { chance: { p: 0.3, win: { cash: 2, fans: 20, say: 'They put your logo on the car! 💲' }, lose: { say: '"Maybe next season." 💲' } } }],
    ['🏎️ Ask for a ride', { team: 8, fans: 10, say: 'You went 300 km/h. You screamed. 🏎️' }]
  ]);
  B('carwash', 'crazy_brush', '🌀', 'The giant brush went CRAZY', 'The spinning brush is going super fast and won\'t stop. It just ripped a mirror off a car! 😱', [
    ['🛑 Hit the emergency button', { cash: -0.3, say: 'It stopped! You paid for the mirror. 🛑' }],
    ['🔧 Buy brand-new brushes', { cash: -0.8, equip: 0.04, rep: 2, say: 'New soft brushes! Cars are happy. 🔧' }],
    ['📹 It\'s kinda cool though', { fans: 12, rep: -3, say: 'The video is funny. The car owner isn\'t laughing. 📹' }],
    ['🙈 Put a "broken" sign on it', { capacity: [0.8, 3, 'One brush broken'], say: 'Half speed for a few weeks. 🙈' }]
  ]);
  B('carwash', 'dog_wash', '🐕', '"Can you wash my DOG?"', 'A muddy dog and its owner are at the car wash. "He\'s dirtier than my car! Please!"', [
    ['🐕 Start a Dog Wash corner!', { cash: -0.3, extra: [0.12, 10, 'Dog wash'], fans: 15, say: '"Car & Dog Wash" is a huge hit! 🐕' }],
    ['🧽 Wash him by hand just this once', { fans: 8, say: 'Happiest dog ever. Wettest worker ever. 🧽' }],
    ['🚿 Put him through the machine', { rep: -8, say: 'NO. Terrible idea. The dog is fine but everyone is mad. 😱' }],
    ['🙅 "Only cars, sorry"', { say: 'The dog looked sad. 🐕' }]
  ]);
  B('carwash', 'school_charity', '🏫', 'Kids want a charity car wash', 'The local school asks to use your car wash for a charity day. Kids will wash cars to raise money for their school trip.', [
    ['❤️ Yes! And give them free soap', { cash: -0.1, rep: 7, fans: 15, say: 'The kids raised enough for the trip! ❤️' }],
    ['🧽 Your team helps too', { team: 6, rep: 8, closed: [1, 'Charity day'], say: 'The whole town came! ❤️' }],
    ['💲 Take half the money', { cash: 0.2, rep: -4, say: 'People think that was a bit greedy. 💲' }],
    ['🙅 Too busy', { rep: -2, say: 'The kids went to another car wash. 🙅' }]
  ]);

  // 👕 CLOTHING STORE
  B('clothing', 'fitting_line', '🚪', 'The fitting room line is HUGE', 'There are 25 people waiting for the fitting rooms. Someone has been in there for 45 minutes.', [
    ['🚪 Build more fitting rooms', { cash: -0.6, capacity: [1.08, 20, 'More fitting rooms'], say: 'No more lines! 🚪' }],
    ['⏱️ 10-minute limit', { happy: -1, capacity: [1.05, 4, 'Faster fitting'], say: 'Faster! A bit strict though. ⏱️' }],
    ['🪞 Put mirrors in the store', { cash: -0.1, happy: 3, say: 'People try on jackets in the aisles now. 🪞' }],
    ['🎵 Play fun music for the line', { happy: 2, fans: 5, say: 'The line is a party now! 🎵' }]
  ]);
  B('clothing', 'three_jackets', '🧥', 'Someone left wearing 3 jackets', 'A customer walked out wearing THREE jackets on a hot day. {a} thinks they didn\'t pay. 🤨', [
    ['🏃 Chase them!', { chance: { p: 0.6, win: { rep: 2, say: 'Caught! They were too hot to run fast. 😂' }, lose: { cash: -0.2, say: 'They got away. Sweaty but free. 🧥' } } }],
    ['📹 Install cameras', { cash: -0.4, flag: 'cameras', rep: 1, say: 'Cameras everywhere now. 📹' }],
    ['🏷️ Add security tags to clothes', { cash: -0.2, say: 'Beep beep! No more free jackets. 🏷️' }],
    ['🤷 Let it go', { cash: -0.2, say: 'Three jackets gone. 🤷' }]
  ], FRONT);
  B('clothing', 'neon_trend', '🟢', 'NEON is back!', 'Suddenly every teenager wants neon colors. Neon green, neon pink, neon EVERYTHING. 🟢💗', [
    ['🟢 Fill the store with neon!', { cash: -0.5, demand: [1.2, 6, 'Neon trend'], say: 'The store glows! Teens are everywhere! 🟢' }],
    ['🧢 Just some neon hats', { cash: -0.1, demand: [1.08, 4, 'Neon hats'], say: 'The hats sold out fast! 🧢' }],
    ['🔮 Guess the NEXT trend', { chance: { p: 0.35, win: { demand: [1.3, 8, 'You predicted the trend'], fans: 20, say: 'You guessed right! Everyone copies YOU now! 🔮' }, lose: { cash: -0.3, say: 'Nobody wants velvet ponchos. 😅' } } }],
    ['🙅 Neon is ugly', { say: 'Teens shopped somewhere else. 🙅' }]
  ]);
  B('clothing', 'haul_video', '🛍️', 'An influencer wants free clothes', '"Hi! I have 2 million followers. Give me free clothes for my haul video?" 💅', [
    ['🛍️ Give them a bag of clothes', { cash: -0.3, chance: { p: 0.6, win: { fans: 35, demand: [1.12, 4, 'Haul video'], say: 'The video was great! Tons of new customers! 🛍️' }, lose: { fans: 5, say: 'They said your clothes were "just okay". Ouch. 😐' } } }],
    ['💰 Offer a discount code instead', { fans: 15, extra: [0.1, 4, 'Influencer code'], say: 'Their fans used the code! 💰' }],
    ['🔍 Check if the followers are real', { chance: { p: 0.5, win: { rep: 1, say: 'The followers were FAKE! Good catch! 🔍' }, lose: { fans: -5, say: 'They were real. And now they\'re annoyed. 😬' } } }],
    ['🙅 "We don\'t do free"', { say: 'They posted about {rival} instead.', rival: 0.02 }]
  ], { init: rival });
  B('clothing', 'tiny_sizes', '📦', 'Everything is size XXXS', 'The new delivery arrived. Every single piece of clothing is size XXXS. Even the coats. Tiny coats. 🧥', [
    ['📞 Send it all back', { closed: [1, 'Nothing to sell'], say: 'The right clothes came a week later. 📞' }],
    ['🧸 Sell them as doll clothes!', { cash: 0.2, fans: 15, say: 'Kids bought them for their teddy bears! 🧸' }],
    ['🐶 Sell them as dog clothes!', { cash: 0.3, fans: 20, say: 'Every dog in {city} is fashionable now. 🐶' }],
    ['💸 Ask for a big discount', { supply: [-0.03, 6, 'Supplier discount'], say: 'The supplier felt bad and gave you a deal! 💸' }]
  ]);
  B('clothing', 'street_show', '💃', 'A street fashion show?', 'Your team wants to put on a fashion show right on the sidewalk outside the store!', [
    ['💃 Let\'s do it!', { cash: -0.2, fans: 25, demand: [1.12, 2, 'Fashion show'], say: 'People stopped traffic to watch! 💃' }],
    ['👗 Let customers be the models', { fans: 30, happy: 5, say: 'Regular people on the runway! Everyone cheered! 👗' }],
    ['🐕 A DOG fashion show', { fans: 35, say: 'Tiny dogs in tiny jackets. The internet cried. 🐕' }],
    ['🙅 Too much work', { team: -3, say: 'The team was excited. Now they\'re not. 🙅' }]
  ]);
  B('clothing', 'cake_return', '🎂', 'A "return" with cake on it', 'A customer wants to return a fancy dress. It still has the tags on... but also cake, glitter and a party hat stuck to it.', [
    ['🧐 "This was worn to a party"', { happy: -2, say: 'They admitted it. And left angry. 🧐' }],
    ['😂 Laugh and give store credit', { happy: 3, fans: 5, say: 'They promised never to do it again. Probably. 😂' }],
    ['💸 Full refund, no questions', { money: -120, happy: 2, say: 'Easy... but you lost money. 💸' }],
    ['📜 New rule: no tags, no return', { rep: -1, say: 'Stricter rules. Fewer cake dresses. 📜' }]
  ]);

  // 🏪 MINI MARKET
  B('convenience', 'open_247', '🌙', 'Stay open 24/7?', 'People keep knocking on the door at night asking for snacks. Should you stay open all night?', [
    ['🌙 Yes! Open 24/7', { demand: [1.12, 12, 'Open all night'], team: -8, say: 'Night owls love you! Your team is tired. 🌙' }],
    ['👥 Hire a night worker', { hireSpecial: { role: 'front', skill: 45 }, demand: [1.1, 12, 'Night shift'], say: 'A night owl joined the team! 🦉' }],
    ['🕛 Until midnight only', { demand: [1.05, 8, 'Later hours'], team: -2, say: 'A good middle ground. 🕛' }],
    ['🛌 No, sleep is important', { team: 4, say: 'Everyone sleeps well. 🛌' }]
  ]);
  B('convenience', 'lottery_ticket', '🎟️', 'A winning ticket came from YOUR shop!', 'Someone won the big lottery with a ticket bought at your mini market! News vans are outside. 📺', [
    ['🎉 Put up a giant "LUCKY SHOP" sign', { demand: [1.2, 6, 'Lucky shop'], fans: 20, say: 'Everyone wants to buy tickets from the lucky shop! 🎉' }],
    ['🎤 Talk to the news', { fans: 25, rep: 2, say: 'You were on every channel! 🎤' }],
    ['🎁 Ask the winner for a thank-you gift', { chance: { p: 0.4, win: { cash: 2, say: 'The winner gave you a big thank you! 🎁' }, lose: { rep: -2, say: '"You want MY money?!" Awkward. 😬' } } }],
    ['🤷 Lucky them', { say: 'Good for them! 🤷' }]
  ]);
  B('convenience', 'expired_milk', '🥛', 'Expired milk on the shelf!', 'A customer found milk that expired 3 weeks ago. It smells like cheese. Very bad cheese. 🤢', [
    ['🙏 Say sorry and check everything', { team: -2, rep: 2, say: 'Every date is checked now. 🙏' }],
    ['🎁 Give them free milk for a month', { cash: -0.05, happy: 4, say: 'They became a loyal customer! 🎁' }],
    ['📋 New checklist for {a}', { reliable: { a: 10 }, say: '{a} checks dates every morning now. 📋' }],
    ['🤐 "That\'s not from our shop"', { rep: -6, say: 'They had the receipt. Very bad. 😬' }]
  ], FRONT);
  B('convenience', 'weird_snack', '🍿', 'A weird snack is trending!', 'A strange snack from Japan is trending online. Kids are looking for it everywhere. You could order a big box...', [
    ['📦 Order 1,000 bags!', { cash: -0.5, chance: { p: 0.6, win: { extra: [0.4, 3, 'Trendy snack'], fans: 15, say: 'SOLD OUT in 2 days! 🍿' }, lose: { say: 'The trend ended the day they arrived. 😩' } } }],
    ['📦 Order a small box', { cash: -0.1, extra: [0.12, 2, 'Trendy snack'], say: 'Sold out fast! 🍿' }],
    ['📱 Post "WE HAVE IT!"', { fans: 20, demand: [1.1, 2, 'Snack hunters'], say: 'Kids came from all over! 📱' }],
    ['🙅 Skip it', { say: 'Trends come and go. 🙅' }]
  ]);
  B('convenience', 'banana_robber', '🍌', 'A robbery with a BANANA?', 'A man in a ski mask walked in and yelled "Give me the money!" He is pointing a banana at {a}. 🍌😐', [
    ['😂 Laugh so hard he runs away', { fans: 20, say: 'He ran. The banana stayed. 🍌' }],
    ['👮 Call the police', { rep: 3, say: 'The police caught him down the street. Eating the banana. 👮' }],
    ['🍌 "That\'s $0.50 for the banana"', { fans: 25, say: 'He paid for the banana and left. What? 🍌' }],
    ['📹 Send the video to the news', { chance: { p: 0.5, win: { viral: [1, 3], say: '"Banana Bandit" went viral! 📹🍌' }, lose: { fans: 10, say: 'Funny video! 📹' } } }]
  ], FRONT);
  B('convenience', 'self_checkout', '🤖', 'Self-checkout machines?', 'A salesperson offers self-checkout machines. "Customers scan their own stuff! Super fast!"', [
    ['🤖 Buy 4 machines', { cash: -1.2, capacity: [1.15, 52, 'Self-checkout'], say: 'Lines are shorter! 🤖' }],
    ['🤖 Just one to try', { cash: -0.3, capacity: [1.04, 26, 'Self-checkout'], say: 'People like it! 🤖' }],
    ['🧓 "People like talking to people"', { rep: 3, say: 'Your older customers are happy. 🧓' }],
    ['🙅 "Unexpected item in bagging area"', { say: 'You hate that voice. No machines. 🙅' }]
  ]);
  B('convenience', 'freezer_melt', '🧊', 'Power cut! Freezers are melting!', 'The power went out and the freezers are dripping. Ice cream is turning into soup! 🍦💧', [
    ['⚡ Rent a generator fast', { cash: -0.4, say: 'Saved most of it! ⚡' }],
    ['🍦 FREE ICE CREAM FOR EVERYONE!', { cash: -0.3, fans: 30, happy: 6, say: 'The best power cut ever! Kids went crazy! 🍦' }],
    ['🧊 Buy bags of ice from the gas station', { cash: -0.1, say: 'Saved some of it. 🧊' }],
    ['😭 Watch it all melt', { cash: -0.5, say: 'Sticky, sad floors. 😭' }]
  ]);

  // 🎮 GAME STUDIO
  B('gamestudio', 'flying_bug', '🐛', 'A bug makes everyone FLY', 'A bug in your game makes characters fly into space if they jump twice. Players LOVE it. {a} wants to fix it.', [
    ['🚀 Keep it! Call it a feature', { fans: 30, demand: [1.12, 6, 'Flying bug'], say: '"Space jump" is the most famous thing in the game now! 🚀' }],
    ['🔧 Fix it', { a: 3, rep: 1, say: 'Fixed. Some players are sad. 🔧' }],
    ['🎮 Make a whole space level', { cash: -0.5, fans: 35, a: 8, say: 'The space level update was a huge hit! 🎮' }],
    ['🏆 Hold a "how far can you fly" contest', { fans: 25, say: 'Someone flew for 3 hours! 🏆' }]
  ], FRONT);
  B('gamestudio', 'crunch', '⏰', 'The deadline is next week!', 'The game is supposed to come out next week. It is NOT done. Half the levels are gray boxes. 😬', [
    ['🔥 Work nights to finish it', { team: -12, chance: { p: 0.6, win: { extra: [0.5, 3, 'Game launch'], say: 'It came out on time and it\'s good! 🔥' }, lose: { rep: -4, say: 'It came out full of bugs. Oof. 🐛' } } }],
    ['📅 Delay it one month', { rep: -1, team: 5, chance: { p: 0.7, win: { extra: [0.6, 3, 'Great launch'], say: 'Worth the wait! Players love it! 📅' }, lose: { fans: -5, say: 'Fans are angry about the delay. 😤' } } }],
    ['✂️ Cut some levels', { extra: [0.3, 3, 'Short game launch'], say: 'Shorter game. Still fun! ✂️' }],
    ['🎟️ Launch as "Early Access"', { extra: [0.35, 4, 'Early Access'], fans: 10, say: 'Players help you test it! 🎟️' }]
  ]);
  B('gamestudio', 'streamer_plays', '📺', 'A mega streamer is playing your game!', 'The biggest streamer in the world is playing YOUR game live right now. 500,000 people are watching! 😱', [
    ['💬 Say hi in the chat!', { fans: 30, say: 'They read your message out loud! Chat went crazy! 💬' }],
    ['🎁 Give their viewers a free code', { extra: [0.3, 2, 'Streamer boost'], fans: 40, say: 'Downloads exploded! 🎁' }],
    ['🙈 Pray they don\'t find the bugs', { chance: { p: 0.5, win: { fans: 35, say: 'No bugs found! They LOVED it! 🙈' }, lose: { fans: 15, rep: -2, say: 'They fell through the floor. Live. 😬' } } }],
    ['🤝 Offer them a character in the game', { fans: 45, rep: 3, say: 'They\'re in the next update! Fans are hyped! 🤝' }]
  ], { rarity: 'rare' });
  B('gamestudio', 'sequel', '2️⃣', 'Fans want a SEQUEL', 'Thousands of fans are posting "#Part2" every day. They want a sequel to your game!', [
    ['2️⃣ Start making Part 2', { cash: -1, chance: { p: 0.7, win: { extra: [0.5, 6, 'Sequel sales'], fans: 20, say: 'Part 2 is even better! 2️⃣' }, lose: { rep: -3, say: 'Fans say "the first one was better". 😐' } } }],
    ['🆕 Make something totally new', { cash: -0.8, chance: { p: 0.5, win: { fans: 40, extra: [0.4, 6, 'New game'], say: 'A brand-new hit! 🆕' }, lose: { say: 'Fans still want Part 2. 😅' } } }],
    ['📦 Release a big free update', { cash: -0.3, fans: 25, rep: 3, say: 'Fans love free stuff! 📦' }],
    ['🤐 Say nothing', { fans: -5, say: 'Fans are getting impatient. 🤐' }]
  ]);
  B('gamestudio', 'leak', '💧', 'Your game LEAKED!', 'Someone put your unfinished game online before the launch. Everyone is playing the broken version! 😱', [
    ['🚀 Launch early!', { extra: [0.3, 3, 'Early launch'], rep: -1, say: 'You launched early and fixed things live. Chaos, but okay! 🚀' }],
    ['😂 Joke about it online', { fans: 25, say: '"At least you know it\'s fun!" Players loved the joke. 😂' }],
    ['🕵️ Find who leaked it', { chance: { p: 0.5, win: { rep: 3, say: 'Caught! It was a tester who broke the rules. 🕵️' }, lose: { team: -5, say: 'Everyone feels suspected. Bad vibes. 😒' } } }],
    ['😭 Cry a little', { team: -2, say: 'It\'s okay. It happens to big studios too. 😭' }]
  ]);
  B('gamestudio', 'goty', '🏆', 'Nominated for Game of the Year!', 'Your game is nominated for GAME OF THE YEAR at the big awards show! The ceremony is on TV.', [
    ['🎩 Go in your fanciest clothes', { chance: { p: 0.35, win: { fans: 60, rep: 8, demand: [1.25, 8, 'Game of the Year'], say: 'YOU WON!!! 🏆🏆🏆' }, lose: { fans: 15, say: 'You didn\'t win. But nominated is amazing! 🎩' } } }],
    ['🎤 Prepare a funny speech', { fans: 20, chance: { p: 0.35, win: { fans: 30, rep: 6, say: 'You WON and your speech went viral! 🎤' }, lose: { say: 'You didn\'t win. The speech stays in your pocket. 🎤' } } }],
    ['🎮 Stay home and make more games', { team: 5, equip: 0.02, say: 'Humble. Productive. 🎮' }],
    ['🎉 Watch party at the studio', { team: 10, fans: 10, say: 'The team screamed at the TV all night! 🎉' }]
  ], { rarity: 'rare' });
  B('gamestudio', 'speedrun', '⏱️', 'Someone beat your game in 3 minutes', 'A speedrunner found a secret shortcut and beat your 20-hour game in 3 minutes and 12 seconds. 😳', [
    ['🏆 Give them a trophy!', { fans: 25, rep: 2, say: 'Speedrunners LOVE you now! 🏆' }],
    ['🔧 Fix the shortcut', { fans: -5, say: 'The speedrun community is sad. 🔧' }],
    ['🏁 Start an official speedrun contest', { fans: 30, say: 'Thousands are racing through your game! 🏁' }],
    ['😱 "HOW?!"', { team: 4, fans: 10, say: 'The whole team watched the video 20 times. 😱' }]
  ]);

  // 📱 PHONE REPAIR
  B('phonerepair', 'pool_party', '🏊', 'Everyone jumped in the pool with phones!', 'There was a huge pool party last night. This morning, 40 people are outside with wet phones. 📱💦', [
    ['⚡ Fix them all, fast!', { extra: [0.35, 1, 'Wet phones'], team: -5, say: 'Rice bags everywhere. 40 phones saved! ⚡' }],
    ['💲 Charge an "emergency fee"', { extra: [0.45, 1, 'Emergency repairs'], happy: -2, say: 'Big money. Some grumbling. 💲' }],
    ['🎁 Sell waterproof cases too', { extra: [0.4, 1, 'Wet phones + cases'], say: 'Everyone bought a case! 🎁' }],
    ['🍚 Tell them to try rice first', { rep: 2, say: 'Half of them came back anyway. 🍚' }]
  ]);
  B('phonerepair', 'private_photos', '🔒', '{a} is looking at a customer\'s photos', 'You see {a} scrolling through a customer\'s phone photos while fixing it. That\'s VERY not okay.', [
    ['🚪 Fire {a} right now', { fire: 'a', rep: 3, say: 'Privacy matters. Customers trust you. 🚪' }],
    ['📜 A strict privacy rule for everyone', { rep: 2, a: -5, say: 'New rule: never look at phones. 📜' }],
    ['⚠️ Last warning', { a: -10, reliable: { a: 8 }, say: '{a} promises it won\'t happen again. ⚠️' }],
    ['🙈 Pretend you didn\'t see', { rep: -2, chance: { p: 0.3, win: { say: 'Nobody found out... 🙈' }, lose: { rep: -8, say: 'The customer found out. They told EVERYONE. 😱' } } }]
  ], FRONT);
  B('phonerepair', 'toilet_phone', '🚽', 'The phone fell in the TOILET', 'A customer hands you a phone in a plastic bag. "It fell in the toilet." They say it like it\'s no big deal. 🤢', [
    ['🧤 Gloves on. Fix it.', { cash: 0.1, happy: 3, say: 'Clean, fixed and back to the (lucky) owner. 🧤' }],
    ['💲 Charge a "toilet fee"', { cash: 0.2, fans: 5, say: 'The "toilet fee" is now on your price list. 😂' }],
    ['📱 Sell them a new phone', { cash: 0.4, say: 'They were happy to start fresh. 📱' }],
    ['🙅 "Nope. Not today."', { happy: -2, say: 'They took their toilet phone elsewhere. 🙅' }]
  ]);
  B('phonerepair', 'new_launch', '📲', 'The new phone just came out!', 'A giant new phone model launched today. Everyone wants cases, screen protectors and help moving their photos.', [
    ['📦 Stock up on cases', { cash: -0.3, extra: [0.3, 3, 'New phone accessories'], say: 'Cases sold out! 📦' }],
    ['📸 Offer "photo moving" service', { extra: [0.2, 3, 'Photo moving'], say: 'People are happy to pay for help! 📸' }],
    ['🔧 Learn to fix the new model first', { cash: -0.2, equip: 0.03, say: 'You\'re the first in town who can fix it! 🔧' }],
    ['😴 It\'s just another phone', { say: 'Other shops got the new customers. 😴' }]
  ]);
  B('phonerepair', 'brick_phone', '🧱', 'A phone from 1995!', 'An old man brings in a HUGE phone from 1995. "It stopped working. Can you fix it? It was my wife\'s."', [
    ['🔧 Spend all day fixing it', { rep: 6, fans: 15, say: 'It turned on! He cried happy tears. 🔧❤️' }],
    ['🎁 Fix it for free', { rep: 8, fans: 20, say: 'The story went viral: "Kind repair shop fixes grandpa\'s old phone". ❤️' }],
    ['🏛️ Say it belongs in a museum', { rep: -1, say: 'He left a bit sad. 🏛️' }],
    ['📱 Sell him a new phone', { cash: 0.1, say: 'He took the new phone but kept the old one too. 📱' }]
  ]);
  B('phonerepair', 'fake_parts', '📦', 'Super cheap phone parts?', 'A new supplier offers parts for half price. {a} thinks they might be fake.', [
    ['💸 Buy them!', { supply: [-0.05, 8, 'Cheap parts'], chance: { p: 0.5, win: { say: 'They were real! Big savings! 💸' }, lose: { rep: -8, happy: -6, say: 'Fake! Screens are breaking again. Customers are furious! 😡' } } }],
    ['🔍 Test a few first', { cash: -0.05, chance: { p: 0.5, win: { supply: [-0.04, 8, 'Cheap parts'], say: 'Tested and good! 🔍' }, lose: { say: 'Fake! Good thing you checked. 🔍' } } }],
    ['🙅 Stick with your old supplier', { rep: 1, say: 'Safe and trusted. 🙅' }],
    ['👮 Report them', { rep: 2, say: 'The police shut down the fake parts gang! 👮' }]
  ], FRONT);
  B('phonerepair', 'phone_in_cake', '🎂', 'A phone was baked into a cake', 'A customer brings a birthday cake. "My phone is IN there. My grandma baked it by accident." 🎂📱', [
    ['🔪 Carefully dig it out', { cash: 0.1, fans: 12, say: 'Found it! A bit crumby, but it works! 🔪' }],
    ['🍰 Eat your way to the phone', { team: 8, fans: 20, say: 'The whole team helped. Delicious rescue. 🍰' }],
    ['📹 Film the rescue', { chance: { p: 0.4, win: { viral: [1, 3], say: '"Phone in cake" got millions of views! 📹' }, lose: { fans: 10, say: 'Funny video! 📹' } } }],
    ['🙅 "We fix phones, not cakes"', { say: 'Fair. 🙅' }]
  ]);

  // 🧽 CLEANING COMPANY
  B('cleaning', 'messiest_house', '🗑️', 'The messiest house EVER', 'The team opens the door of today\'s house and... pizza boxes to the ceiling. Socks everywhere. Something is moving under the laundry. 😱', [
    ['💪 Clean it all', { cash: 0.4, team: -6, say: 'It took 3 days. It\'s spotless. Legends. 💪' }],
    ['💲 Charge the "disaster price"', { cash: 0.7, happy: -1, say: 'Big mess, big price. 💲' }],
    ['📹 Make a before/after video', { chance: { p: 0.5, win: { viral: [1, 3], say: 'Satisfying cleaning videos go viral! 📹✨' }, lose: { fans: 12, say: 'Nice video! 📹' } } }],
    ['🚪 Close the door and leave', { rep: -2, say: 'Nope. Nope. Nope. 🚪' }]
  ]);
  B('cleaning', 'haunted_mansion', '👻', 'Cleaning a "haunted" mansion', 'A rich family wants their old mansion cleaned. The team says doors open by themselves and there\'s whispering. 👻', [
    ['👻 Do it! Ghosts don\'t scare us', { cash: 0.8, chance: { p: 0.7, win: { team: 5, say: 'It was just the wind. Big payment! 👻' }, lose: { team: -8, say: 'Something whispered "leave". The team RAN. 😱' } } }],
    ['🕯️ Bring a ghost hunter', { cash: 0.5, fans: 15, say: 'The ghost hunter found... a raccoon. 🦝' }],
    ['📹 Livestream it', { fans: 25, cash: 0.6, say: 'Thousands watched you clean a haunted house! 📹' }],
    ['🙅 "No haunted houses"', { team: 3, say: 'The team is relieved. 🙅' }]
  ]);
  B('cleaning', 'famous_client', '🎤', 'A famous pop star hired you!', 'A super famous pop star wants you to clean their mansion. But you must sign a paper promising to tell NOBODY.', [
    ['🤐 Sign it and keep the secret', { cash: 1, rep: 3, say: 'Big money. Your lips are sealed. 🤐' }],
    ['📸 Secretly take a selfie', { chance: { p: 0.3, win: { fans: 30, say: 'Nobody noticed! (Don\'t do this.) 📸' }, lose: { rep: -10, cash: -1, say: 'They found out. You got sued. 😱' } } }],
    ['🎁 Leave a thank-you note', { cash: 1, rep: 2, chance: { p: 0.4, win: { fans: 30, say: 'The star posted your note online! 🎁' }, lose: { say: 'The note was never mentioned. 🎁' } } }],
    ['🙅 Too much pressure', { say: 'You passed. 🙅' }]
  ]);
  B('cleaning', 'couch_money', '🛋️', '{a} found money in a couch', 'While cleaning, {a} found $500 hidden in a customer\'s couch.', [
    ['🤝 Give it to the owner', { rep: 6, chance: { p: 0.5, win: { cash: 0.3, say: 'The owner gave you a tip! 🤝' }, lose: { say: 'They said "thanks!" Being honest feels good. 😊' } } }],
    ['🏅 Praise {a} for being honest', { a: 10, rep: 3, say: '{a} is employee of the month! 🏅' }],
    ['🤫 Keep it', { money: 500, rep: -8, say: 'The owner had a camera. Oh no. 😱' }],
    ['📜 Make a "lost and found" rule', { rep: 3, say: 'Customers trust you with everything now. 📜' }]
  ], FRONT);
  B('cleaning', 'stink_cloud', '☁️', '{a} mixed two cleaners', '{a} mixed two cleaning sprays. A green, stinky cloud filled the whole room! Everyone ran outside. 🤢', [
    ['🎓 Safety training for everyone', { cash: -0.2, team: 3, rep: 2, say: 'Now everyone knows: NEVER mix cleaners! 🎓' }],
    ['🏷️ Color labels on every bottle', { equip: 0.02, say: 'Red means danger. Simple! 🏷️' }],
    ['🌿 Switch to natural cleaners', { cash: -0.3, rep: 4, fans: 10, say: '"Green cleaning" is a big hit with customers! 🌿' }],
    ['😤 Blame {a}', { a: -12, say: '{a} feels awful. 😤' }]
  ], FRONT);
  B('cleaning', 'rubber_ducks', '🦆', 'A house full of 10,000 rubber ducks', 'The customer collects rubber ducks. There are ducks EVERYWHERE. They want every duck cleaned. One. By. One.', [
    ['🦆 Clean every duck!', { cash: 0.6, team: -5, say: '10,000 clean ducks. You dream about ducks now. 🦆' }],
    ['🛁 Put them all in a giant bath', { cash: 0.5, fans: 15, say: 'A bathtub of ducks! The photo went around the internet. 🛁' }],
    ['💲 Charge per duck', { cash: 1, happy: -2, say: 'Very expensive ducks. 💲' }],
    ['🙅 Clean the house, not the ducks', { cash: 0.2, say: 'The ducks stay dusty. 🦆' }]
  ]);
  B('cleaning', 'robot_vacuums', '🤖', 'Robot vacuums everywhere?', 'A company offers robot vacuums that clean by themselves. "Your cleaners will be twice as fast!"', [
    ['🤖 Buy robots for everyone', { cash: -1, capacity: [1.15, 52, 'Robot helpers'], say: 'The robots vacuum while the team cleans windows! 🤖' }],
    ['🐱 Try one... it gets stuck on cats', { cash: -0.1, fans: 12, say: 'A cat rode the robot for an hour. Video of the year. 🐱' }],
    ['👥 Hire a real person instead', { hireSpecial: { role: 'front', skill: 55 }, say: 'Humans are better at corners! 👥' }],
    ['🙅 "Robots can\'t do stairs"', { say: 'True. 🙅' }]
  ]);

  // 🍋 LEMONADE STAND
  B('lemonade', 'no_lemons', '🍋', 'No lemons in the store!', 'The store is out of lemons. ALL the stores in {city} are out of lemons. A lemonade stand... with no lemons. 😱', [
    ['🍊 Make orange-ade', { fans: 10, chance: { p: 0.6, win: { say: 'Orange-ade is a hit! 🍊' }, lose: { happy: -3, say: 'People wanted lemonade. Not this. 😐' } } }],
    ['🚗 Drive to the next city', { cash: -0.2, say: 'Lemons! Expensive lemons. 🚗' }],
    ['🍋 Buy lemons from a neighbor\'s tree', { money: -20, rep: 2, say: 'The neighbor\'s lemons are the best ever! 🍋' }],
    ['🔒 Close until lemons come back', { closed: [1, 'No lemons'], say: 'A sad, lemonless week. 🔒' }]
  ]);
  B('lemonade', 'hottest_day', '☀️', 'The hottest day of the year!', 'It\'s 40°C! Everyone is dying for something cold. There\'s a line already! ☀️🥵', [
    ['⚡ Make lemonade SUPER fast', { capacity: [1.25, 1, 'Heatwave rush'], team: -4, say: 'You sold a record amount! ⚡' }],
    ['💲 Raise the price today only', { extra: [0.3, 1, 'Heatwave prices'], happy: -2, say: 'Hot day, hot prices. 💲' }],
    ['🧊 Add ice pops too', { extra: [0.25, 1, 'Ice pops'], fans: 8, say: 'Ice pops + lemonade = perfect! 🧊' }],
    ['💦 Spray people with water for free', { fans: 20, happy: 6, say: 'The most loved stand in {city}! 💦' }]
  ]);
  B('lemonade', 'pink_lemonade', '🩷', 'Try PINK lemonade?', '{a} wants to make pink lemonade with strawberries. "It will look SO cute in photos!"', [
    ['🩷 Yes! Pink everything!', { cash: -0.1, demand: [1.12, 6, 'Pink lemonade'], fans: 15, say: 'Pink lemonade photos are everywhere! 🩷' }],
    ['🌈 Make a rainbow of flavors', { cash: -0.2, fans: 20, chance: { p: 0.7, win: { demand: [1.15, 6, 'Rainbow lemonade'], say: 'Seven flavors! Kids love it! 🌈' }, lose: { say: 'The blue one tastes like soap. 🤢' } } }],
    ['🍋 Classic is best', { a: -5, say: 'Classic yellow. {a} is disappointed. 🍋' }],
    ['🗳️ Let customers vote', { fans: 12, happy: 3, say: 'Pink won by a landslide! 🗳️' }]
  ], FRONT);
  B('lemonade', 'kid_stand', '🧒', 'A kid opened a stand across the street', 'A 7-year-old opened a lemonade stand right across the street. Her prices are half of yours. She is VERY cute.', [
    ['🤝 Hire her as a partner!', { money: -10, fans: 25, say: 'Best business partner ever. Customers love her! 🤝' }],
    ['🍋 Buy her lemonade to be nice', { money: -2, rep: 3, say: 'It was terrible. You smiled anyway. 🍋' }],
    ['💸 Lower your prices too', { price: -1, say: 'Price war with a 7-year-old. Hmm. 💸' }],
    ['🎓 Give her business tips', { rep: 6, fans: 15, say: 'She calls you "Boss Mentor". Adorable. 🎓' }]
  ]);
  B('lemonade', 'sour_batch', '😖', 'SUPER SOUR batch!', '{a} forgot to add sugar. A customer took a sip and their face turned inside out. 😖', [
    ['🍬 Add sugar and say sorry', { happy: 2, say: 'Fixed! Sweet again. 🍬' }],
    ['🔥 Sell it as a "Sour Challenge"', { fans: 25, extra: [0.1, 3, 'Sour challenge'], say: 'Everyone wants to try the sour challenge! 😖🔥' }],
    ['🎁 Free cookie for the customer', { money: -2, happy: 3, say: 'The cookie saved the day. 🎁' }],
    ['😤 Blame {a}', { a: -10, say: '{a} feels bad. 😤' }]
  ], FRONT);
  B('lemonade', 'wasps', '🐝', 'The wasps want lemonade too', 'Wasps LOVE your sweet lemonade. There are 50 of them buzzing around the stand. Customers are scared!', [
    ['🪤 Put out a wasp trap far away', { money: -15, say: 'The wasps went to the trap! 🪤' }],
    ['🍯 Give the wasps their own bowl', { fans: 8, say: 'The wasps have their own "lemonade bar" now. It works?! 🍯' }],
    ['🏃 Move the stand', { demand: [0.95, 2, 'New spot'], say: 'New spot, no wasps. Fewer people though. 🏃' }],
    ['🙈 Ignore them', { happy: -5, say: 'Someone got stung. 🐝😫' }]
  ]);
  B('lemonade', 'lemon_tree', '🌳', 'Grow your own lemon tree?', 'A gardener offers you a big lemon tree for your stand. "Free lemons forever! Well, after 2 years."', [
    ['🌳 Buy the tree', { cash: -0.3, supply: [-0.03, 52, 'Own lemons'], fans: 10, say: 'Your own lemons! Customers love picking one. 🌳' }],
    ['🌳🌳 Buy a whole lemon farm', { cash: -1.5, supply: [-0.06, 104, 'Lemon farm'], say: 'You\'re a lemon farmer now! 🍋🍋🍋' }],
    ['🪴 Just a small pot', { money: -15, fans: 5, say: 'Tiny lemons. Very cute. 🪴' }],
    ['🙅 Too slow', { say: 'Maybe next year. 🙅' }]
  ]);

  // 🍬 CANDY SHOP
  B('candy', 'gumball_boom', '💥', 'The gumball machine EXPLODED', 'The big gumball machine cracked and 5,000 gumballs rolled all over the shop! Kids are diving in! 💥', [
    ['🎉 Free gumballs for everyone!', { cash: -0.1, fans: 25, happy: 6, say: 'The happiest kids in {city}! 🎉' }],
    ['🧹 Clean it up fast', { team: -4, say: 'Gumballs under every shelf for months. 🧹' }],
    ['✨ Buy a giant new machine', { cash: -0.6, extra: [0.1, 12, 'Giant gumball machine'], say: 'The new machine is 2 meters tall! ✨' }],
    ['📹 Film the gumball wave', { chance: { p: 0.45, win: { viral: [1, 3], say: 'The gumball wave video went viral! 📹' }, lose: { fans: 10, say: 'Cute video! 📹' } } }]
  ]);
  B('candy', 'parents_complain', '🦷', 'Parents say candy is unhealthy', 'A group of parents says your candy shop makes their kids "crazy and hyper". They want you to sell healthy stuff.', [
    ['🍎 Add a healthy snack corner', { cash: -0.2, rep: 5, demand: [1.05, 12, 'Healthy corner'], say: 'Parents buy fruit snacks. Kids buy candy. Everyone wins! 🍎' }],
    ['🍬 Make sugar-free candy', { cash: -0.3, rep: 4, say: 'Sugar-free candy is surprisingly good! 🍬' }],
    ['😂 "It\'s a CANDY shop"', { rep: -3, fans: 10, say: 'Kids cheered. Parents didn\'t. 😂' }],
    ['🦷 Give free toothbrushes', { money: -40, rep: 4, fans: 8, say: 'Candy + toothbrush = perfect! 🦷' }]
  ]);
  B('candy', 'giant_lollipop', '🍭', 'The WORLD\'S BIGGEST lollipop?', '{a} wants to make a lollipop as big as a car to break the world record!', [
    ['🍭 Let\'s do it!', { cash: -0.5, chance: { p: 0.6, win: { fans: 50, rep: 5, say: 'WORLD RECORD! It\'s 3 meters wide! 🍭🏆' }, lose: { fans: 15, say: 'It broke in half. Still delicious. 🍭' } } }],
    ['🍭 A smaller one for the window', { cash: -0.1, fans: 15, say: 'A giant lollipop in the window! Kids stop and stare. 🍭' }],
    ['🎉 Let the whole town lick it', { fans: 20, rep: -2, say: 'Kind of gross? But fun! 😂' }],
    ['🙅 Too sticky', { a: -5, say: '{a} is sad. 🙅' }]
  ], FRONT);
  B('candy', 'pickle_candy', '🥒', '{a} invented PICKLE candy', '{a} made a new candy flavor: pickle! It\'s green, sour and... weirdly addictive? 🥒🍬', [
    ['🥒 Sell it!', { chance: { p: 0.55, win: { fans: 30, demand: [1.1, 6, 'Pickle candy craze'], say: 'Everyone is obsessed with pickle candy! 🥒' }, lose: { fans: 8, say: 'Only 3 people liked it. They LOVE it though. 🥒' } } }],
    ['🎲 "Mystery flavor" bags', { fans: 15, extra: [0.08, 6, 'Mystery bags'], say: 'Kids dare each other to eat the mystery candy! 🎲' }],
    ['🤢 No. Just no.', { a: -6, say: 'Pickle candy is banned. 🤢' }],
    ['🏆 Enter a weird candy contest', { chance: { p: 0.5, win: { rep: 5, fans: 25, say: 'It WON "Weirdest Candy of the Year"! 🏆' }, lose: { say: 'It lost to bacon chocolate. 🥓' } } }]
  ], FRONT);
  B('candy', 'fishing_heist', '🎣', 'The great candy heist', 'Kids tried to steal candy from the top shelf using a FISHING ROD through the window. 🎣🍬', [
    ['😂 Give them a free bag for being creative', { fans: 20, money: -5, say: 'The kids became your biggest fans! 😂' }],
    ['📞 Call their parents', { rep: 1, say: 'The kids got in BIG trouble. 📞' }],
    ['🎣 Make a "candy fishing" game', { cash: -0.1, extra: [0.1, 8, 'Candy fishing'], say: 'Pay $1 and fish for candy! Kids love it! 🎣' }],
    ['🔒 Lock the window', { say: 'No more fishing. 🔒' }]
  ]);
  B('candy', 'halloween_school', '🎃', 'A school orders Halloween candy!', 'Every school in {city} wants candy for Halloween. That\'s a HUGE order. Can you make that much in time?', [
    ['🎃 Yes! Work day and night', { cash: 1.5, team: -8, say: 'You made it! Every kid in {city} has your candy! 🎃' }],
    ['👥 Hire helpers for October', { cash: 1.1, hireSpecial: { role: 'front', skill: 45 }, say: 'Done, and you have a new candy maker! 👥' }],
    ['🍬 Take only half the order', { cash: 0.6, say: 'Half the schools are happy. 🍬' }],
    ['🙅 Too big', { say: '{rival} took the order. 😤', rival: 0.04 }]
  ], { init: rival, cond: function (g) { return g.company.industry === 'candy' && ((g.week - 1) % 52) + 1 >= 36 && ((g.week - 1) % 52) + 1 <= 43; } });
  B('candy', 'sugar_supplier', '🍚', 'Sugar prices are going crazy', 'The price of sugar went up 50%! Candy without sugar is... not candy.', [
    ['📈 Raise prices a little', { price: 1, happy: -2, say: 'Customers noticed but still bought. 📈' }],
    ['🍯 Try honey instead', { cash: -0.2, chance: { p: 0.6, win: { rep: 3, say: 'Honey candy is delicious! 🍯' }, lose: { say: 'Sticky disaster. 🍯' } } }],
    ['📦 Buy a year of sugar now', { cash: -0.8, supply: [-0.04, 26, 'Sugar stockpile'], say: 'Your storage room is full of sugar. Smart! 📦' }],
    ['🍬 Make smaller candies', { happy: -4, say: 'Customers noticed. They are not happy. 🍬' }]
  ]);

  // 🍦 ICE CREAM TRUCK
  B('icecream', 'song_stuck', '🎶', 'The truck song is stuck on LOUD', 'The ice cream truck\'s music box is stuck. It plays the same song, super loud, all day and all night. 🎶😵', [
    ['🔧 Fix it', { cash: -0.1, say: 'Silence. Beautiful silence. 🔧' }],
    ['🎵 Record a new catchy song', { cash: -0.2, fans: 20, say: 'Kids sing your new song everywhere! 🎵' }],
    ['🔇 Cut the wires', { demand: [0.9, 3, 'No music'], say: 'Quiet truck. Kids don\'t know you\'re there. 🔇' }],
    ['🎤 Sing along all day', { team: 5, fans: 10, say: 'You are the singing ice cream boss now. 🎤' }]
  ]);
  B('icecream', 'freezer_dies', '🥵', 'The freezer died on the hottest day!', 'It\'s 38°C and the truck freezer just stopped. The ice cream is starting to drip! 🍦💧', [
    ['🏃 Sell everything half price, FAST', { extra: [0.2, 1, 'Melting sale'], say: 'Sold before it melted! 🏃' }],
    ['🥤 Make milkshakes!', { extra: [0.3, 1, 'Emergency milkshakes'], fans: 12, say: 'Melted ice cream = milkshakes! Genius! 🥤' }],
    ['🔧 Emergency repair', { cash: -0.4, say: 'Fixed, but half the ice cream melted. 🔧' }],
    ['😭 Watch it melt', { cash: -0.4, say: 'A sad, sticky day. 😭' }]
  ]);
  B('icecream', 'winter', '❄️', 'Nobody buys ice cream in winter', 'It\'s freezing cold. People walk past your truck wearing 3 scarves. Sales are frozen too. ❄️', [
    ['☕ Sell hot chocolate too!', { extra: [0.2, 6, 'Hot chocolate'], say: 'Hot chocolate saved the winter! ☕' }],
    ['🎄 Park at the winter market', { demand: [1.1, 4, 'Winter market'], say: 'People buy ice cream even in the snow at the market! 🎄' }],
    ['🏖️ Take a winter holiday', { closed: [2, 'Winter break'], team: 12, say: 'Everyone came back rested! 🏖️' }],
    ['🥶 Keep going anyway', { team: -5, say: 'Cold hands, few customers. 🥶' }]
  ], { cond: function (g) { var w = ((g.week - 1) % 52) + 1; return g.company.industry === 'icecream' && (w <= 8 || w >= 47); } });
  B('icecream', 'flavor_vote', '🗳️', 'Kids vote for a new flavor!', 'You asked kids to suggest a new flavor. The winner, with 500 votes: "PIZZA CHOCOLATE". 🍕🍫', [
    ['🍕 Make it! Democracy!', { fans: 25, chance: { p: 0.5, win: { demand: [1.1, 4, 'Pizza chocolate'], say: 'Weirdly amazing! Kids love it! 🍕🍫' }, lose: { say: 'Kids voted for it. Kids did not eat it. 😂' } } }],
    ['🥈 Make the 2nd place flavor', { fans: 8, say: 'Cookie dough rainbow! Much safer. 🥈' }],
    ['🎲 Make all top 5 flavors', { cash: -0.3, fans: 20, demand: [1.08, 6, 'New flavors'], say: 'Five new flavors! 🎲' }],
    ['🙅 Cancel the vote', { fans: -8, say: 'The kids are furious. 🙅' }]
  ]);
  B('icecream', 'brain_freeze', '🧠', 'The Brain Freeze Challenge', 'Teens are daring each other to eat a whole ice cream in 10 seconds. It\'s called the "Brain Freeze Challenge". 🧠❄️', [
    ['🏆 Make it an official contest', { fans: 25, extra: [0.1, 2, 'Brain freeze contest'], say: 'Screaming, laughing and lots of sales! 🏆' }],
    ['⚠️ Put up a "careful!" sign', { rep: 2, say: 'Safety first! ⚠️' }],
    ['🧠 Do it yourself', { team: 8, fans: 12, say: 'You held your head for 5 minutes. The team filmed it. 😂' }],
    ['📱 Post the best videos', { chance: { p: 0.4, win: { viral: [1, 3], say: 'The challenge went viral! 📱' }, lose: { fans: 10, say: 'Nice videos! 📱' } } }]
  ]);
  B('icecream', 'kid_chase', '🏃', 'Kids chase the truck for 10 blocks', 'Every day, a crowd of kids runs after the truck for 10 blocks. They\'re exhausted when they catch you. 🏃🍦', [
    ['🛑 Stop more often', { demand: [1.1, 8, 'More stops'], say: 'More stops, more happy kids! 🛑' }],
    ['📍 Post your route online', { fans: 15, demand: [1.08, 8, 'Route online'], say: 'Parents know when you\'re coming now! 📍' }],
    ['🏃 Drive faster (it\'s fun)', { rep: -3, say: 'Not cool. 🏃' }],
    ['🎁 Free sprinkles for the fastest kid', { fans: 12, happy: 3, say: 'Every day is a race now! 🎁' }]
  ]);
  B('icecream', 'ten_scoops', '🍨', '{a} can stack 10 scoops', '{a} practiced for months and can now stack 10 scoops on one cone without dropping any! 🍨', [
    ['🏆 Try for a world record', { chance: { p: 0.5, win: { fans: 40, rep: 4, say: '{a} stacked 125 scoops! WORLD RECORD! 🏆' }, lose: { fans: 12, say: 'Scoop 42 fell. So close! 🍨' } } }],
    ['🍨 Sell "Tower Cones"', { extra: [0.12, 8, 'Tower cones'], a: 8, say: 'Everyone wants a tower! 🍨' }],
    ['📹 Film a tutorial', { fans: 15, a: 5, say: 'Millions of people tried it at home. Messy. 📹' }],
    ['💼 "Just one scoop please"', { a: -8, say: '{a} is sad. 💼' }]
  ], FRONT);

  // 🍕 PIZZA PLACE
  B('pizza', 'pineapple_war', '🍍', 'The Pineapple Pizza War', 'Two groups of customers are arguing LOUDLY: does pineapple belong on pizza? It\'s getting serious. 🍍🍕', [
    ['🍍 "Pineapple forever!"', { fans: 20, happy: -2, say: 'Half the town loves you. Half is angry. 🍍' }],
    ['🚫 "No pineapple here!"', { fans: 20, happy: -2, say: 'Half the town loves you. The other half is angry. 🚫' }],
    ['🗳️ Hold an official vote', { fans: 30, say: 'The vote was on the local news! Pineapple won by 3 votes. 🗳️' }],
    ['🍕 Half-and-half pizza for peace', { happy: 4, rep: 3, say: 'Peace in {city}! 🍕' }]
  ]);
  B('pizza', 'late_delivery', '🛵', 'The delivery was 2 hours late', 'A pizza got delivered 2 hours late and cold. The customer is angry. The driver says they "got lost". For 2 hours.', [
    ['🎁 Free pizza next time', { cash: -0.02, happy: 3, say: 'The customer forgave you. 🎁' }],
    ['🗺️ Buy GPS for every driver', { cash: -0.3, capacity: [1.05, 26, 'GPS'], say: 'No more lost drivers! 🗺️' }],
    ['⏱️ "30 minutes or it\'s free!"', { demand: [1.12, 12, '30-minute promise'], team: -5, say: 'Customers love it. Drivers are nervous. ⏱️' }],
    ['🤷 "It happens"', { happy: -3, rep: -2, say: 'They left a bad review. 🤷' }]
  ]);
  B('pizza', 'dough_toss', '🌀', '{a} tosses dough SUPER high', '{a} throws pizza dough so high it almost touches the ceiling. Customers cheer every time!', [
    ['🎪 Make it a show every hour', { fans: 20, demand: [1.08, 6, 'Dough show'], say: 'People come just for the show! 🎪' }],
    ['🏆 Enter a pizza-tossing contest', { chance: { p: 0.5, win: { fans: 30, a: 12, rep: 3, say: '{a} WON the national pizza toss! 🏆' }, lose: { fans: 8, say: 'The dough landed on a judge. 😂' } } }],
    ['🪟 Move the station to the window', { fans: 15, say: 'People on the street stop and watch! 🪟' }],
    ['😬 "Please, not so high"', { a: -6, say: 'The dough touched a lamp. Fair enough. 😬' }]
  ], FRONT);
  B('pizza', 'giant_pizza', '🍕', 'The GIANT pizza', 'A company wants a pizza 2 meters wide for their office party. Your oven is 60 cm. 🤔', [
    ['🧩 Make it in pieces, like a puzzle', { cash: 0.8, fans: 15, say: 'A pizza puzzle! They loved it! 🧩' }],
    ['🔥 Build a giant oven', { cash: -1, equip: 0.03, extra: [0.3, 4, 'Giant pizza orders'], say: 'The giant oven is famous now! 🔥' }],
    ['🍕 20 normal pizzas in a circle', { cash: 0.5, say: 'Close enough! 🍕' }],
    ['🙅 "Impossible"', { say: 'They ordered sushi instead. 🙅' }]
  ]);
  B('pizza', 'police_order', '🚓', 'Pizza delivered to the POLICE station', 'Your driver delivered a pizza to the police station by mistake. The police ate it. The real customer is waiting. 😅', [
    ['📞 Send a new pizza fast', { cash: -0.02, happy: 2, say: 'Fixed! 📞' }],
    ['🧾 Send the police the bill', { fans: 15, say: 'They paid! AND ordered 10 more. 🚓🍕' }],
    ['🍕 Weekly free pizza for the police', { cash: -0.1, rep: 5, say: 'Your shop is the safest in {city} now. 🚓' }],
    ['😂 Post the story', { fans: 20, say: 'Everyone laughed! 😂' }]
  ]);
  B('pizza', 'wood_out', '🪵', 'The wood oven is out of wood', 'It\'s Friday night, the busiest night. The wood for the oven is gone and the wood seller is closed. 🪵', [
    ['🏃 Borrow wood from the neighbors', { rep: 1, say: 'The whole street helped! 🏃' }],
    ['🔌 Buy an electric oven', { cash: -0.8, equip: 0.02, say: 'Faster, easier, less smoky. 🔌' }],
    ['🥗 Salad night!', { happy: -4, say: 'Nobody wanted salad at a pizza place. 🥗' }],
    ['🔒 Close early', { demand: [0.7, 1, 'No wood'], say: 'Friday night, closed. Ouch. 🔒' }]
  ]);
  B('pizza', 'heart_pizza', '💍', 'A proposal pizza!', 'A customer wants a heart-shaped pizza with "WILL YOU MARRY ME?" written in pepperoni. It\'s for tonight!', [
    ['💍 Make the perfect proposal pizza', { money: -5, fans: 15, chance: { p: 0.8, win: { rep: 4, fans: 15, say: 'She said YES! They\'ll have the wedding party here! 💍' }, lose: { say: 'She said "let me think about it". Oof. 🍕' } } }],
    ['🎻 Add a violin player', { cash: -0.1, fans: 25, rep: 3, say: 'The most romantic pizza ever! 🎻' }],
    ['🍕 Sell "proposal pizzas" from now on', { extra: [0.08, 12, 'Proposal pizzas'], say: 'Three proposals a week now! 🍕' }],
    ['🙅 "Too complicated"', { say: 'He proposed with a regular pizza. She still said yes. 🙅' }]
  ]);

  // 🍩 DONUT SHOP
  B('donut', 'police_morning', '🚓', 'The police want 200 donuts EVERY morning', 'The police station wants to order 200 donuts every single morning. That\'s a big, steady deal!', [
    ['🤝 Deal!', { extra: [0.25, 20, 'Police order'], team: -5, say: 'Early mornings, steady money. 🤝' }],
    ['💸 Deal, with a discount', { extra: [0.18, 20, 'Police order'], rep: 3, say: 'The police love you. 💸' }],
    ['🍩 Only 100 donuts', { extra: [0.12, 20, 'Police order'], say: 'A smaller, easier deal. 🍩' }],
    ['🙅 Too early', { say: 'The police went to another shop. 🙅' }]
  ]);
  B('donut', 'donut_wall', '🧱', 'A donut WALL?', '{a} wants to hang donuts on pegs on a big wall. "People will take photos with it!"', [
    ['🧱 Build the donut wall', { cash: -0.3, fans: 25, demand: [1.08, 10, 'Donut wall'], say: 'The donut wall is the most famous wall in {city}! 🧱' }],
    ['🍩 A small donut tree', { cash: -0.1, fans: 10, say: 'Cute! 🍩' }],
    ['💒 Rent it for weddings', { cash: -0.3, extra: [0.12, 12, 'Wedding donut walls'], say: 'Every wedding wants one now! 💒' }],
    ['🙅 "Donuts on a wall? Gross."', { a: -5, say: 'No wall. 🙅' }]
  ], FRONT);
  B('donut', 'holes', '⭕', 'What to do with donut holes?', 'You have buckets of the little round donut holes left over. Thousands of them!', [
    ['🎁 Sell them in cups', { extra: [0.1, 8, 'Donut hole cups'], say: 'Donut holes sell like crazy! 🎁' }],
    ['🍢 Donut hole skewers', { extra: [0.12, 8, 'Donut skewers'], fans: 10, say: 'Donut kebabs! 🍢' }],
    ['🎈 Free one with every coffee', { happy: 4, say: 'Tiny free treat = big smile. 🎈' }],
    ['🦆 Feed the ducks', { fans: 5, say: 'Very round, very happy ducks. 🦆' }]
  ]);
  B('donut', 'old_oil', '🛢️', 'The fryer oil is really old', 'The donuts taste a little... weird. {a} says the fryer oil hasn\'t been changed in "a while". How long is a while?', [
    ['✨ Change it now, every week', { cash: -0.2, rep: 3, happy: 3, say: 'The donuts taste amazing again! ✨' }],
    ['🔧 Buy a self-cleaning fryer', { cash: -0.8, equip: 0.03, rep: 2, say: 'New fryer, perfect donuts! 🔧' }],
    ['🤫 Just one more week', { happy: -4, rep: -2, say: 'Customers notice. 🤫' }],
    ['😤 Scold {a}', { a: -8, say: 'It was your job to check too. 😤' }]
  ], FRONT);
  B('donut', 'salty_glaze', '🧂', 'SALT instead of sugar!', '{a} put salt in the glaze instead of sugar. 200 donuts. A customer just spat one out. 🧂🤢', [
    ['🗑️ Throw them all out', { cash: -0.2, say: 'A sad trash can full of donuts. 🗑️' }],
    ['🥨 Sell them as "Salty Donuts"', { chance: { p: 0.5, win: { fans: 20, say: 'Salty donuts are a HIT?! 🥨' }, lose: { happy: -3, say: 'Nope. Just gross. 🥨' } } }],
    ['🏷️ Label the jars clearly', { equip: 0.01, say: 'SALT. SUGAR. In huge letters. 🏷️' }],
    ['😤 Scold {a}', { a: -10, say: '{a} feels awful. 😤' }]
  ], FRONT);
  B('donut', 'donut_burger', '🍔', '"Can I get a DONUT BURGER?"', 'A customer wants a burger with donuts instead of buns. It sounds crazy. It sounds amazing.', [
    ['🍔 Add it to the menu!', { fans: 25, demand: [1.12, 8, 'Donut burger'], say: 'The donut burger went viral! 🍔🍩' }],
    ['🍔 Make one, just for them', { fans: 10, say: 'They posted it. People are asking for it! 🍔' }],
    ['🤝 Team up with a burger shop', { fans: 20, extra: [0.12, 8, 'Donut burger collab'], say: 'Donut burger collab! 🤝' }],
    ['🤢 "We\'re a DONUT shop"', { say: 'They ate a donut and a burger separately. 🤢' }]
  ]);
  B('donut', 'dozen_challenge', '🏆', 'The 12-donut challenge', 'A big guy says: "I can eat 12 donuts in 5 minutes." A crowd is gathering. 🍩🍩🍩', [
    ['🏆 "If you do it, they\'re free!"', { fans: 20, chance: { p: 0.5, win: { money: -15, fans: 10, say: 'He DID it! Crowd went wild! 🏆' }, lose: { money: 15, say: 'He stopped at 9. He paid. 😂' } } }],
    ['📸 Put the winners on a wall', { fans: 25, say: 'The "Donut Champions" wall is famous now! 📸' }],
    ['🍩 Make it a weekly contest', { extra: [0.08, 10, 'Donut challenge'], fans: 15, say: 'Every Friday: donut challenge night! 🍩' }],
    ['⚠️ "Please don\'t"', { rep: 1, say: 'Safe, but boring. ⚠️' }]
  ]);

  // 🧋 BUBBLE TEA
  B('bubbletea', 'no_pearls', '⚫', 'NO TAPIOCA PEARLS!', 'There\'s a worldwide tapioca pearl shortage. Bubble tea without bubbles is just... tea. 😱', [
    ['🌈 Use jelly and popping balls', { fans: 12, chance: { p: 0.7, win: { say: 'Popping balls are a hit! 🌈' }, lose: { happy: -3, say: 'Customers want PEARLS. 😤' } } }],
    ['💸 Buy pearls at crazy prices', { cash: -0.6, say: 'Expensive, but you have pearls! 💸' }],
    ['🏠 Make pearls yourself', { cash: -0.2, team: -4, equip: 0.02, say: 'Homemade pearls! They\'re even better! 🏠' }],
    ['😬 Close until pearls come back', { closed: [1, 'No pearls'], say: 'A pearl-less week. 😬' }]
  ]);
  B('bubbletea', 'straw_fail', '🥤', 'The straws won\'t poke through!', 'The new cup lids are too strong. Customers stab them with the straw... and the straw bends. Every time. 😤', [
    ['🔪 Buy pointy straws', { money: -40, happy: 3, say: 'POP! Perfect. 🔪' }],
    ['📦 Go back to the old lids', { cash: -0.1, say: 'Old lids, happy customers. 📦' }],
    ['💪 "Stab Challenge"', { fans: 15, say: 'People love the "can you stab it?" game! 💪' }],
    ['🤷 "Just try harder"', { happy: -5, say: 'Tea everywhere. Angry customers. 🤷' }]
  ]);
  B('bubbletea', 'cheese_foam', '🧀', 'Cheese foam tea is trending!', 'Everyone online is drinking tea with salty cheese foam on top. It sounds weird. Everyone says it\'s delicious.', [
    ['🧀 Add it to the menu', { cash: -0.2, demand: [1.15, 6, 'Cheese foam trend'], say: 'Trend caught! Big line! 🧀' }],
    ['🎲 Invent a crazier trend', { chance: { p: 0.3, win: { fans: 40, demand: [1.2, 8, 'Your new trend'], say: 'Your "Cloud Candy Tea" is the NEW trend! 🎲' }, lose: { say: 'Nobody wanted "Garlic Foam Tea". 🧄' } } }],
    ['🍵 Stick to classics', { say: 'Loyal customers are happy. 🍵' }],
    ['🎟️ Free taste tests', { cash: -0.05, fans: 10, say: 'Everyone tried it! 🎟️' }]
  ]);
  B('bubbletea', 'pearl_spill', '💥', '10,000 pearls on the floor!', '{a} dropped a giant bucket of pearls. The floor is a slippery ball pit now. A customer is sliding across the room. 😂', [
    ['🧹 Clean it up carefully', { team: -2, say: 'Clean and safe. 🧹' }],
    ['⛸️ "Pearl skating!" (for 5 minutes)', { fans: 15, rep: -2, say: 'So fun. So dangerous. 😂' }],
    ['📹 Post the slide video', { chance: { p: 0.45, win: { viral: [1, 3], say: 'The pearl slide went viral! 📹' }, lose: { fans: 8, say: 'Funny video! 📹' } } }],
    ['😤 Scold {a}', { a: -8, say: '{a} feels clumsy. 😤' }]
  ], FRONT);
  B('bubbletea', 'line_block', '🧍', 'The line goes around the block!', 'Your bubble tea is so popular that the line goes around the whole block. Neighbors are complaining!', [
    ['📱 Order ahead app', { cash: -0.5, capacity: [1.12, 26, 'Order app'], say: 'No more long lines! 📱' }],
    ['👥 Hire more tea makers', { hireSpecial: { role: 'front', skill: 50 }, say: 'Faster! 👥' }],
    ['🎵 Entertain the line', { fans: 12, happy: 3, say: 'A juggler for the line! 🎵' }],
    ['😎 Long lines = famous', { fans: 10, rep: -1, say: 'The line is part of the fun. Neighbors disagree. 😎' }]
  ]);
  B('bubbletea', 'pizza_tea', '🍕', 'Customers want PIZZA bubble tea', 'A group of teens keeps asking for "pizza-flavored bubble tea". They say they\'ll post it if you make it.', [
    ['🍕 Make it for one day only', { fans: 25, chance: { p: 0.5, win: { viral: [1, 3], say: 'Everyone had to try it once! Viral! 🍕🧋' }, lose: { say: 'It was... pizza soup with pearls. 😂' } } }],
    ['🎲 "Crazy Flavor Friday"', { extra: [0.08, 10, 'Crazy flavors'], fans: 15, say: 'Every Friday: a crazy new flavor! 🎲' }],
    ['🤢 "Absolutely not"', { say: 'The teens are disappointed. 🤢' }],
    ['🍓 Offer strawberry cheesecake instead', { happy: 3, say: 'Close enough. They loved it! 🍓' }]
  ]);
  B('bubbletea', 'cup_design', '🎨', 'Design new cups?', 'Your cups are plain white. {a} designed new cups with cute animals on them. They cost a bit more.', [
    ['🐼 Print the animal cups', { cash: -0.3, fans: 20, demand: [1.06, 12, 'Cute cups'], say: 'People collect all the animals! 🐼' }],
    ['🏆 Cup design contest for customers', { fans: 25, say: 'The winning design was a cat eating bubble tea! 🏆' }],
    ['♻️ Reusable cups with a discount', { cash: -0.2, rep: 5, say: 'Good for the planet! ♻️' }],
    ['⚪ Keep them plain', { a: -5, say: 'Boring but cheap. ⚪' }]
  ], FRONT);

  // 🐶 PET SHOP
  B('petshop', 'hamster_escape', '🐹', 'ALL the hamsters escaped!', 'Someone left the hamster cage open. 20 hamsters are running around the shop. One is in the cash register. 🐹🐹🐹', [
    ['🏃 Everyone catch hamsters!', { team: 6, fans: 10, say: 'All 20 caught! (Plus one that wasn\'t yours.) 🏃' }],
    ['🥕 Make a trail of carrots', { say: 'Smart! They followed the carrots right home. 🥕' }],
    ['📹 Livestream the hunt', { fans: 25, say: 'Thousands watched "The Great Hamster Hunt"! 📹' }],
    ['🔒 Buy locking cages', { cash: -0.2, say: 'No more escapes! 🔒' }]
  ]);
  B('petshop', 'parrot_words', '🦜', 'The parrot learned BAD words', 'The shop parrot learned some very bad words from a customer. It yells them at everyone. Including kids. 😳', [
    ['🎓 Teach it nice words', { team: -2, chance: { p: 0.6, win: { fans: 10, say: 'Now it says "WELCOME, FRIEND!" 🦜' }, lose: { say: 'It learned "WELCOME, [bad word]". 😬' } } }],
    ['🎵 Teach it to sing', { fans: 18, say: 'The parrot sings your jingle now! 🎵' }],
    ['🏠 Move it to the back room', { say: 'Quiet shop. Bored parrot. 🏠' }],
    ['😂 Leave it. It\'s funny.', { rep: -4, fans: 12, say: 'Teens love it. Parents don\'t. 😂' }]
  ]);
  B('petshop', 'adoption_day', '🏠', 'Host a Pet Adoption Day?', 'The animal shelter asks if they can bring 30 dogs and cats to your shop so people can adopt them!', [
    ['❤️ Yes! Big adoption party!', { rep: 8, fans: 25, demand: [1.1, 2, 'Adoption day'], say: '28 pets found homes! And everyone bought pet food! ❤️' }],
    ['🎁 Give adopters a free starter kit', { cash: -0.3, rep: 10, fans: 20, say: 'Every new pet owner left with a gift! 🎁' }],
    ['🐶 Adopt one for the shop', { pet: '🐕', fans: 10, say: 'Meet the new shop dog! 🐕' }],
    ['🙅 Too messy', { rep: -2, say: 'The shelter went to another shop. 🙅' }]
  ]);
  B('petshop', 'treat_taster', '🦴', '{a} ate a dog treat... and LOVES it', '{a} ate a dog treat by accident. Now they eat one every lunch break. "They\'re actually good!" 🦴', [
    ['😂 Film a taste test video', { fans: 20, a: 5, say: '"Human tries dog treats" got so many views! 😂' }],
    ['🍪 Make human-safe treats too', { cash: -0.2, extra: [0.08, 10, 'Treats for humans'], say: 'Owners and dogs can snack together now! 🍪' }],
    ['🙅 "Please stop"', { a: -3, say: '{a} eats them in secret now. 🙅' }],
    ['🏷️ "Tested by {a}!" labels', { fans: 12, a: 8, say: 'Customers trust the treats even more! 🏷️' }]
  ], FRONT);
  B('petshop', 'diamond_collar', '💎', 'A rich lady wants a DIAMOND collar', 'A very rich lady walks in with a tiny dog in her purse. "Do you have a diamond collar? Fifi deserves the best."', [
    ['💎 Order a custom diamond collar', { cash: 1, say: 'Fifi is the fanciest dog in {city}. 💎' }],
    ['👑 Start a luxury pet line', { cash: -0.5, extra: [0.2, 12, 'Luxury pets'], say: 'Rich pets everywhere! 👑' }],
    ['😂 Offer a very shiny plastic one', { chance: { p: 0.4, win: { cash: 0.3, say: 'She loved it. Fifi can\'t tell the difference. 😂' }, lose: { rep: -3, say: '"Plastic?! How DARE you!" 😂' } } }],
    ['🐶 "Fifi deserves love, not diamonds"', { rep: 2, say: 'She thought about it. Then left. 🐶' }]
  ]);
  B('petshop', 'tank_leak', '🐠', 'The big fish tank is leaking!', 'Water is dripping from the giant fish tank. The fish look worried. You look worried.', [
    ['🔧 Emergency repair', { cash: -0.3, say: 'Fixed! The fish are safe. 🔧' }],
    ['🐠 Move the fish to buckets', { team: -3, say: 'Every fish saved! 🐠' }],
    ['✨ Buy an even bigger tank', { cash: -0.8, fans: 15, demand: [1.05, 12, 'Giant aquarium'], say: 'The new giant aquarium is amazing! ✨' }],
    ['🩹 Tape it', { chance: { p: 0.4, win: { say: 'The tape held! 🩹' }, lose: { cash: -0.4, say: 'SPLASH! Wet floor, flopping fish. 😱' } } }]
  ]);
  B('petshop', 'puppy_nap', '🐶', 'Customers stay for HOURS with the puppies', 'The puppies are so cute that customers sit on the floor and play with them for hours. They don\'t buy anything.', [
    ['🎟️ "Puppy playtime" for a small fee', { extra: [0.12, 10, 'Puppy playtime'], say: 'People happily pay to cuddle puppies! 🎟️' }],
    ['🐶 Let them. Puppies need love.', { rep: 4, fans: 10, say: 'The happiest shop in {city}. 🐶' }],
    ['⏱️ 10 minutes limit', { happy: -2, say: 'Fair, but sad. ⏱️' }],
    ['🛍️ "Buy something to play"', { extra: [0.08, 6, 'Puppy rule'], rep: -1, say: 'More sales, less cuddles. 🛍️' }]
  ]);

  // 💈 BARBER SHOP
  B('barber', 'wrong_cut', '✂️', '{a} gave the WRONG haircut', 'The customer asked for "a little off the top". {a} shaved their head completely bald. 😱', [
    ['🎁 Free haircuts for a year', { cash: -0.1, happy: 3, say: 'They forgave you. Their hair will too. Eventually. 🎁' }],
    ['😎 "Bald is the new trend!"', { chance: { p: 0.4, win: { fans: 20, say: 'They LOVE it! And posted it! 😎' }, lose: { rep: -4, say: 'They did NOT love it. 😡' } } }],
    ['🧢 Give them a fancy hat', { money: -30, happy: 2, say: 'It\'s a very nice hat. 🧢' }],
    ['😤 Scold {a}', { a: -10, say: '{a} is so embarrassed. 😤' }]
  ], FRONT);
  B('barber', 'footballer_hair', '⚽', 'A football star wants a crazy haircut', 'A famous young football player walks in. "Give me the craziest haircut ever. I want to be on TV!"', [
    ['🌈 Rainbow lightning bolt design!', { chance: { p: 0.6, win: { fans: 45, say: 'The whole country saw it on TV! Kids want the same cut! 🌈⚡' }, lose: { fans: 15, say: 'It looked... interesting. Still famous! 🌈' } } }],
    ['⚽ Shave a football into the hair', { fans: 30, say: 'Iconic! ⚽' }],
    ['😎 A classic, perfect cut', { rep: 4, say: 'Classy. The player loved it. 😎' }],
    ['📸 Ask for a selfie', { fans: 20, say: 'The selfie is framed on your wall. 📸' }]
  ], { rarity: 'rare' });
  B('barber', 'first_cut', '👶', 'A kid\'s first haircut', 'A 3-year-old is getting their first haircut. They are screaming like a siren. The parents are filming. 😭', [
    ['🍭 Lollipop and a cartoon', { money: -2, fans: 8, say: 'Silent, happy kid. Perfect cut! 🍭' }],
    ['🦸 A superhero cape', { money: -10, fans: 12, say: 'The kid thinks they\'re a superhero now! 🦸' }],
    ['🎖️ "First Haircut" certificate', { fans: 15, rep: 3, say: 'Parents LOVED the certificate! 🎖️' }],
    ['⚡ Just be super fast', { chance: { p: 0.5, win: { say: 'Done in 3 minutes! ⚡' }, lose: { happy: -2, say: 'Crooked bangs. Oops. ⚡' } } }]
  ]);
  B('barber', 'beard_contest', '🧔', 'The Great Beard Contest', 'The barber shop across town challenged you: who can make the best beard design? The winner gets bragging rights!', [
    ['🧔 Enter your best barber', { chance: { p: 0.5, win: { fans: 30, rep: 4, say: 'YOU WON! Best beards in {city}! 🧔🏆' }, lose: { fans: 8, say: 'Second place. Grr. 🧔' } } }],
    ['🎨 Do something totally crazy', { chance: { p: 0.35, win: { fans: 45, say: 'A beard shaped like a dragon! You won! 🐉' }, lose: { rep: -2, say: 'The judges were confused. 😅' } } }],
    ['🎤 Host the contest yourself', { cash: -0.2, fans: 25, say: 'Everyone came to YOUR shop! 🎤' }],
    ['🙅 Skip it', { say: 'Maybe next year. 🙅' }]
  ]);
  B('barber', 'rainbow_hair', '🌈', 'Everyone wants RAINBOW hair', 'Rainbow hair is the new trend. Every teen in {city} wants it. You don\'t have hair dye.', [
    ['🌈 Buy all the colors!', { cash: -0.3, demand: [1.15, 6, 'Rainbow hair trend'], say: 'Your shop is a rainbow factory! 🌈' }],
    ['🎓 Learn coloring at a course', { cash: -0.4, equip: 0.03, extra: [0.12, 10, 'Hair coloring'], say: 'Now you\'re experts! 🎓' }],
    ['🙅 "Only cuts here"', { say: 'Teens went elsewhere. 🙅' }],
    ['😎 You get rainbow hair first', { fans: 20, team: 6, say: 'The boss has rainbow hair. Everyone wants it now! 😎' }]
  ]);
  B('barber', 'gossip', '🗣️', 'The barber shop is gossip central', 'Everyone tells the barbers their secrets. {a} knows EVERYTHING about everyone in {city}. And talks a lot. 🗣️', [
    ['🤐 "What\'s said here, stays here"', { rep: 4, a: -3, say: 'Customers trust you with their secrets. 🤐' }],
    ['🎙️ Start a "barber shop podcast"', { fans: 25, say: 'The podcast is a hit! (No secrets, just jokes.) 🎙️' }],
    ['👂 Listen for business tips', { cash: 0.3, say: 'A customer told you a great tip! 👂' }],
    ['😂 Let {a} keep talking', { rep: -3, fans: 5, say: 'Someone\'s secret got out. Oops. 😬' }]
  ], FRONT);
  B('barber', 'clippers_die', '🔋', 'Clippers died mid-haircut!', 'The clippers stopped working when the haircut was HALF done. The customer has half a head of hair. 😳', [
    ['🔌 Borrow clippers next door', { rep: 1, say: 'Saved! The neighbor helped. 🔌' }],
    ['✂️ Finish with scissors', { chance: { p: 0.6, win: { rep: 3, say: 'The scissors cut was even better! ✂️' }, lose: { happy: -3, say: 'It took an hour and looks uneven. ✂️' } } }],
    ['🆕 Buy the best clippers', { cash: -0.3, equip: 0.03, say: 'Pro clippers! Never again! 🆕' }],
    ['😂 "Half-cut is a style now"', { fans: 15, rep: -2, say: 'They did NOT believe you. 😂' }]
  ]);

  // 💐 FLOWER SHOP
  B('flowers', 'mothers_day', '💐', 'Mother\'s Day RUSH!', 'It\'s Mother\'s Day! Everyone in {city} forgot to buy flowers until today. The line is out the door!', [
    ['⚡ Everyone make bouquets FAST', { capacity: [1.25, 1, 'Mother\'s Day rush'], team: -5, say: 'Record sales! Hands are covered in thorns. ⚡' }],
    ['💲 Special Mother\'s Day prices', { extra: [0.4, 1, 'Mother\'s Day'], happy: -2, say: 'Big day, big money. 💲' }],
    ['🎁 Free card with every bouquet', { money: -30, happy: 5, fans: 10, say: 'Moms everywhere loved the cards! 🎁' }],
    ['🌷 Pre-made bouquets ready to grab', { capacity: [1.15, 1, 'Pre-made bouquets'], say: 'Grab and go! Smart! 🌷' }]
  ], { cond: function (g) { var w = ((g.week - 1) % 52) + 1; return g.company.industry === 'flowers' && w >= 18 && w <= 20; } });
  B('flowers', 'wedding_order', '💒', 'A GIANT wedding order', 'A couple wants 10,000 roses for their wedding. White ones. And an arch. And a flower dress for the dog.', [
    ['💒 Take the whole order!', { cash: 1.8, team: -8, say: 'The wedding was stunning! 💒' }],
    ['👥 Hire helpers for the week', { cash: 1.2, hireSpecial: { role: 'front', skill: 50 }, say: 'Done! And you kept a great florist! 👥' }],
    ['🌹 Only the roses', { cash: 0.7, say: 'Just 10,000 roses. Easy? 🌹' }],
    ['🙅 Too big', { say: 'Another shop took it. 🙅' }]
  ]);
  B('flowers', 'sneezy_customer', '🤧', 'A customer who is allergic to flowers', 'A man walks into your flower shop sneezing like crazy. "I need flowers for my wife. ACHOO! I\'m allergic. ACHOO!"', [
    ['🌸 Make a bouquet FAST', { fans: 8, happy: 3, say: 'Done in 30 seconds! Hero florist! 🌸' }],
    ['🧸 Suggest paper flowers', { cash: 0.05, fans: 10, say: 'Beautiful paper flowers! No sneezing! 🧸' }],
    ['📦 Deliver the flowers to his wife', { cash: 0.08, rep: 3, say: 'Smart! He didn\'t have to touch them. 📦' }],
    ['😷 Give him a mask', { money: -1, say: 'He sneezed less. A little less. 😷' }]
  ]);
  B('flowers', 'wilted_delivery', '🥀', 'All the flowers arrived WILTED', 'The truck from the flower farm broke down. All the flowers arrived dry and droopy. 🥀', [
    ['📞 Demand a refund', { chance: { p: 0.7, win: { say: 'Refund! And a bonus box! 📞' }, lose: { cash: -0.3, say: 'The farm said "not our fault". 😤' } } }],
    ['🌾 Make dried flower art', { fans: 15, extra: [0.12, 4, 'Dried flower art'], say: 'Dried flowers are trendy! Sold out! 🌾' }],
    ['💧 Try to save them', { cash: -0.1, say: 'Half of them came back to life! 💧' }],
    ['🔄 Find a new farm', { cash: -0.2, supply: [-0.02, 26, 'New farm'], say: 'Better flowers, better price! 🔄' }]
  ]);
  B('flowers', 'secret_admirer', '💌', 'A secret admirer for {a}', 'Every day, someone orders roses for {a}. No name. Just "From your secret admirer 💌". The whole team is going crazy.', [
    ['🕵️ Find out who it is!', { chance: { p: 0.5, win: { a: 15, fans: 15, say: 'It was a regular customer! They\'re going on a date! 💕' }, lose: { say: 'Still a mystery! 🕵️' } } }],
    ['🤐 Keep the secret', { rep: 2, say: 'Professional! 🤐' }],
    ['📱 Post "Who is the admirer?"', { fans: 25, say: 'The whole city wants to know! 📱' }],
    ['💐 Keep selling the roses', { cash: 0.3, say: 'Good business. 💐' }]
  ], FRONT);
  B('flowers', 'giant_sunflower', '🌻', 'Grow the WORLD\'S BIGGEST sunflower?', '{a} planted a sunflower outside. It\'s already 3 meters tall and still growing! The record is 9 meters.', [
    ['📏 Go for the record!', { cash: -0.1, chance: { p: 0.4, win: { fans: 40, rep: 5, say: '9.2 meters! WORLD RECORD! 🌻🏆' }, lose: { fans: 12, say: 'It fell over in a storm at 7 meters. 🌻' } } }],
    ['🎟️ Charge for sunflower selfies', { extra: [0.08, 8, 'Sunflower selfies'], say: 'Everyone wants a photo! 🎟️' }],
    ['🌻 Plant sunflowers everywhere', { cash: -0.2, rep: 4, fans: 10, say: 'The whole street is yellow now! 🌻' }],
    ['✂️ Cut it and sell it', { money: 50, a: -5, say: 'One very expensive sunflower. 😢' }]
  ], FRONT);
  B('flowers', 'flower_crowns', '👑', 'Flower crown workshop?', 'Teenagers keep asking how to make flower crowns for festivals. You could teach a class!', [
    ['👑 Weekly workshops', { extra: [0.1, 10, 'Flower crown classes'], fans: 15, say: 'The classes are always full! 👑' }],
    ['🎪 Sell them at the festival', { cash: -0.2, extra: [0.3, 1, 'Festival crowns'], say: 'Everyone at the festival wore YOUR crowns! 🎪' }],
    ['📹 Make a tutorial video', { fans: 20, say: 'A million people made crowns thanks to you! 📹' }],
    ['🙅 No time', { say: 'Maybe later. 🙅' }]
  ]);

  // 🎥 YOUTUBE CHANNEL
  B('youtube', 'demonetized', '💸', 'Your video got demonetized!', 'Your best video of the month can\'t make money anymore. The website says it\'s "not advertiser-friendly". It was about cats. 😿', [
    ['📩 Appeal it', { chance: { p: 0.6, win: { cash: 0.4, say: 'Appeal won! Money is back! 📩' }, lose: { say: 'Appeal lost. Cats are dangerous, apparently. 😿' } } }],
    ['🛒 Sell merch instead', { cash: -0.2, extra: [0.2, 8, 'Merch'], say: 'Your hoodies are selling great! 🛒' }],
    ['💖 Start a fan membership', { extra: [0.15, 12, 'Memberships'], say: 'Your fans support you directly! 💖' }],
    ['😤 Make an angry video about it', { fans: 20, rep: -1, say: 'The angry video got more views than the cat one. 😤' }]
  ]);
  B('youtube', 'mega_collab', '🤝', 'A HUGE YouTuber wants to collab!', 'A creator with 30 million subscribers wants to make a video with you! They want to do something "extreme".', [
    ['🌶️ The world\'s spiciest food challenge', { fans: 50, chance: { p: 0.6, win: { viral: [2, 5], say: 'You survived! The video exploded! 🌶️🔥' }, lose: { fans: 10, say: 'You cried on camera. Still a hit! 😭' } } }],
    ['🏠 24 hours in a box', { fans: 45, team: -3, say: '24 hours. Tiny box. Big views. 🏠' }],
    ['🎮 A gaming battle', { fans: 35, say: 'Fun and easy! Great views! 🎮' }],
    ['🙅 "Too extreme for me"', { say: 'They collabed with someone else. 🙅' }]
  ], { rarity: 'rare' });
  B('youtube', 'clickbait', '😱', 'Clickbait thumbnail?', '{a} made a thumbnail with a shocked face and "YOU WON\'T BELIEVE THIS!!! (NOT CLICKBAIT)". The video is about a sandwich.', [
    ['😱 Use it', { chance: { p: 0.6, win: { fans: 25, say: 'Millions of clicks! 😱' }, lose: { rep: -4, fans: -5, say: 'Viewers felt tricked. Angry comments everywhere. 😬' } } }],
    ['😎 Honest title: "I Made a Sandwich"', { rep: 4, fans: 8, say: 'Viewers love the honesty! 😎' }],
    ['🎨 Make a funny, clever thumbnail', { fans: 18, a: 5, say: 'Funny AND honest. Perfect! 🎨' }],
    ['🥪 Make the sandwich unbelievable', { cash: -0.2, fans: 30, say: 'A 2-meter sandwich. You DID believe it. 🥪' }]
  ], FRONT);
  B('youtube', 'copyright', '©️', 'Copyright strike!', 'A music company says you used their song in your video for 4 seconds. They put a strike on your channel! ©️', [
    ['🎵 Use only free music from now on', { rep: 2, say: 'Safe and legal. 🎵' }],
    ['🎹 Make your own music', { cash: -0.2, fans: 12, say: 'Your own jingle is now famous! 🎹' }],
    ['⚖️ Fight the strike', { chance: { p: 0.4, win: { rep: 3, say: 'Strike removed! 4 seconds is fair use! ⚖️' }, lose: { fans: -10, say: 'You lost. Channel is on thin ice. 😬' } } }],
    ['🎤 Sing the song yourself (badly)', { fans: 20, say: 'Your terrible singing became a meme. 🎤' }]
  ]);
  B('youtube', 'million_subs', '🏆', 'Almost 1 MILLION subscribers!', 'You\'re only 1,000 subscribers away from ONE MILLION! The Gold Play Button is so close!', [
    ['🎉 Plan a HUGE celebration video', { cash: -0.3, fans: 40, say: 'ONE MILLION! The Gold Button arrived! 🏆' }],
    ['🎁 Giveaway to reach it faster', { cash: -0.4, fans: 50, say: 'The giveaway worked! A MILLION! 🎁' }],
    ['📺 Livestream the countdown', { fans: 35, say: 'Thousands watched the number hit 1,000,000! 📺' }],
    ['😌 Just keep making videos', { fans: 15, say: 'It happened quietly on a Tuesday. 😌' }]
  ], { rarity: 'rare' });
  B('youtube', 'mean_comments', '💬', 'So many mean comments', 'A group of trolls is posting mean comments on every video. "Boring!" "Bad!" "My cat makes better videos!"', [
    ['😂 Make a video reading them', { fans: 30, say: 'Reading mean comments was hilarious! Trolls lost! 😂' }],
    ['🚫 Block and delete', { rep: 1, say: 'Clean comments again! 🚫' }],
    ['❤️ Reply with kindness', { rep: 4, fans: 10, say: 'One troll said sorry! ❤️' }],
    ['😢 Take a break from the internet', { team: 5, say: 'A calm week. You feel better. 😢' }]
  ]);
  B('youtube', 'weird_sponsor', '🧴', 'A sponsor for... toe cream?', 'A company offers to pay a LOT if you talk about their toe cream for 60 seconds in your next video. 🦶', [
    ['💰 Take the money', { cash: 1.2, rep: -2, say: 'Easy money. Viewers made fun of you a little. 💰' }],
    ['😂 Make it the funniest ad ever', { cash: 1, fans: 20, say: 'Your toe cream ad was a comedy hit! 😂' }],
    ['🔍 Try the product first', { chance: { p: 0.5, win: { cash: 1, rep: 2, say: 'It actually works?! Honest ad! 🔍' }, lose: { say: 'It smelled terrible. You said no. 🔍' } } }],
    ['🙅 "Not my style"', { rep: 2, say: 'Fans respect it. 🙅' }]
  ]);
})();
