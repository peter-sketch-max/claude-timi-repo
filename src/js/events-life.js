// More events for every company: sad goodbyes, angry customers, slaps, crazy days, team life and the boss's life.
// Every event has exactly 4 responses. The format is explained at the top of events.js.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var U = CS.U, G = CS.G, ev = CS.ev, H = CS.EVH, rival = H.rival;
  var hasPet = function (g) { return !!g.pet; };
  var petCtx = function (g, c) { c.pet = g.pet; };
  var noPet = function (g) { g.pet = null; };
  var PETS = ['🐱', '🐶', '🐹', '🐰', '🦜', '🐢', '🦊'];

  // =====================================================================
  // 🕊️ SAD GOODBYES
  // =====================================================================

  ev({ id: 'old_worker_passed', cat: 'team', icon: '🕊️', w: 0.8, cd: 40, minWeek: 20, who: { a: 'old' },
    title: 'Goodbye, {a} 🕊️',
    text: 'Sad news. {a}, one of your oldest workers, passed away peacefully in their sleep. The whole team is very sad.',
    choices: [
      { t: '🕯️ Close for a day to remember them', fx: { die: 'a', closed: [1, 'Memorial day'], team: 8, rep: 3, say: 'Everyone shared their favorite {a} stories. Lots of tears and lots of laughs. 🕯️' } },
      { t: '🌳 Plant a tree in their name', fx: { die: 'a', cash: -0.2, team: 5, rep: 4, say: 'The "{a} Tree" now grows outside your shop. 🌳' } },
      { t: '💐 Pay for the funeral and help the family', fx: { die: 'a', cash: -0.8, team: 10, rep: 6, say: 'The family came by to say thank you with a big hug. 💐' } },
      { t: '🖼️ Name the break room after them', fx: { die: 'a', team: 6, say: '"The {a} Room" has their photo on the wall. Never forgotten. 🖼️' } }
    ] });

  ev({ id: 'sick_worker_passed', cat: 'team', icon: '🕯️', rarity: 'rare', w: 0.5, cd: 60, minWeek: 30, need: 3, who: { a: 'veteran' },
    title: 'We lost {a} 🕯️',
    text: '{a} was sick for a long time and passed away this week. They worked here for over a year and everyone loved them.',
    choices: [
      { t: '🎓 Start a school fund for their kids', fx: { die: 'a', cash: -1, team: 12, rep: 8, say: 'Their kids will go to school thanks to you. 🎓' } },
      { t: '🎵 The team writes a song for them', fx: { die: 'a', team: 10, fans: 10, say: 'The song made everyone cry. Customers loved it too. 🎵' } },
      { t: '🏖️ Give everyone a day off', fx: { die: 'a', closed: [1, 'Day off'], team: 12, say: 'Everyone needed that day together. 🏖️' } },
      { t: '🤗 Hug everyone and keep going', fx: { die: 'a', team: 4, say: 'You kept the shop running. {a} would have wanted that. 🤗' } }
    ] });

  ev({ id: 'pet_passed', cat: 'team', icon: '🥀', w: 0.8, cd: 50, minWeek: 15, cond: hasPet, init: petCtx,
    title: 'Your pet {pet} passed away 🥀',
    text: 'Your shop pet {pet} got very old and passed away. Customers are leaving flowers at the door.',
    choices: [
      { t: '🪦 A tiny funeral in the garden', fx: { run: noPet, team: 4, happy: 3, say: 'Everyone came. Even the mail carrier cried. 🪦' } },
      { t: '🐣 Adopt a baby pet from the shelter', fx: { run: function (g) { g.pet = U.pick(PETS); return 'Meet ' + g.pet + '! The shop feels happy again. 🐣'; }, team: 6, fans: 8 } },
      { t: '🗿 Build a statue of {pet}', fx: { run: noPet, cash: -0.5, fans: 15, rep: 2, say: 'The statue became a famous selfie spot! 🗿📸' } },
      { t: '📸 Make {pet} the logo forever', fx: { run: noPet, fans: 20, rep: 2, say: 'Now {pet} watches over the shop forever. 💖' } }
    ] });

  ev({ id: 'customer_passed', cat: 'customers', icon: '💐', w: 0.8, cd: 50, minWeek: 12,
    title: 'Goodbye, Mrs. Wilson 💐',
    text: 'Mrs. Wilson came to your shop every day for 40 years. She passed away this week. Her family says your shop made her happy.',
    choices: [
      { t: '🏷️ Name a product "The Wilson"', fx: { fans: 20, rep: 4, say: '"The Wilson" became your best seller. She would be proud. 🏷️' } },
      { t: '🎁 Free {unit} for everyone today', fx: { cash: -0.3, happy: 8, rep: 3, say: 'Everyone raised their {unit} for Mrs. Wilson. 🎁' } },
      { t: '🪑 Put a bench with her name outside', fx: { cash: -0.2, rep: 5, happy: 3, say: 'People sit on "Wilson\'s Bench" every day now. 🪑' } },
      { t: '💌 Send her family a card', fx: { rep: 2, say: 'Her family framed your card. 💌' } }
    ] });

  ev({ id: 'rival_boss_passed', cat: 'rivals', icon: '📰', kind: 'news', w: 0.5, cd: 80, minWeek: 25, init: rival,
    title: 'The founder of {rival} passed away',
    text: 'The old founder of {rival} passed away. Their company is in chaos and nobody knows who is in charge. 😶',
    choices: [
      { t: '💐 Send flowers and kind words', fx: { rep: 4, say: 'Even your rival\'s workers said thank you. Classy. 💐' } },
      { t: '💼 Offer to buy their company', fx: { cash: -2, chance: { p: 0.35, win: { rival: -0.3, cash: 3, say: 'They sold you a big part of it! Now you own their best shops. 💼' }, lose: { rep: -2, say: '"Too soon!" they said. People think it was rude. 😬' } } } },
      { t: '🤝 Hire their best worker', fx: { hireSpecial: { role: 'front', skill: 75 }, rival: -0.05, say: 'Their best worker joined YOU! 🤝' } },
      { t: '🙂 Do nothing', fx: { say: 'You let them be sad in peace.' } }
    ] });

  ev({ id: 'legend_passed', cat: 'world', icon: '🕊️', kind: 'news', w: 0.6, cd: 80, minWeek: 10,
    title: 'The inventor of the {industry} passed away at 101',
    text: 'The legendary person who started the first {industry} ever has passed away. The whole world is talking about {unit}! 🕊️',
    choices: [
      { t: '🏷️ Hold a tribute sale', fx: { demand: [1.2, 2, 'Tribute sale'], rep: 2, say: 'Customers came to remember a legend. 🏷️' } },
      { t: '🤫 A minute of silence in the shop', fx: { rep: 3, team: 3, say: 'Everyone stopped for a minute. Beautiful. 🤫' } },
      { t: '🏛️ Build a little museum corner', fx: { cash: -0.4, fans: 20, rep: 3, say: 'Tourists come to see your museum corner! 🏛️' } },
      { t: '💼 Business as usual', fx: { say: 'You kept working. Customers didn\'t mind.' } }
    ] });

  ev({ id: 'inheritance', cat: 'lucky', icon: '📜', rarity: 'rare', w: 0.6, cd: 80, minWeek: 20,
    title: 'Someone left you money in their will! 📜',
    text: 'An old customer passed away and wrote in their will: "Give some money to the {company}. They were always so kind to me." 😲',
    choices: [
      { t: '💰 Keep it for the company', fx: { cash: 4, say: 'Thank you, kind stranger. 💰' } },
      { t: '❤️ Give half to charity', fx: { cash: 2, rep: 6, say: 'You shared the kindness. People LOVE you for it. ❤️' } },
      { t: '🎁 Give it all to your team', fx: { teamBonus: true, team: 15, say: 'Your team couldn\'t believe it! 🎁' } },
      { t: '🗿 Build a statue of them', fx: { cash: 2, fans: 15, rep: 3, say: 'Now everyone knows how kind they were. 🗿' } }
    ] });

  ev({ id: 'last_wish', cat: 'customers', icon: '👑', rarity: 'rare', w: 0.6, cd: 80, minWeek: 8,
    title: 'A very special wish 👑',
    text: 'A very sick kid named Leo has one big wish: to be the boss of YOUR {industry} for one day!',
    choices: [
      { t: '👑 YES! Leo is the boss today!', fx: { team: 10, rep: 6, fans: 30, say: 'Leo gave everyone a raise (pretend) and ate 12 {unit}. Best. Day. Ever. 👑' } },
      { t: '🎉 Throw the biggest party ever', fx: { cash: -0.5, team: 8, rep: 8, fans: 35, say: 'The whole street came! Leo was smiling all day. 🎉' } },
      { t: '🖼️ Make Leo "Boss Forever" on the wall', fx: { rep: 5, fans: 20, team: 6, say: 'Leo\'s photo hangs next to yours. Boss Forever. 🖼️' } },
      { t: '🎁 Send Leo a huge gift box', fx: { cash: -0.2, rep: 3, say: 'Leo sent back a drawing of your shop. ❤️' } }
    ] });

  ev({ id: 'dead_plant', cat: 'funny', icon: '🥀', w: 1.5, cd: 25,
    title: 'Mr. Leafy has died 🥀',
    text: 'The office plant, Mr. Leafy, died. Nobody watered him for 3 months. The team is weirdly sad about it.',
    choices: [
      { t: '🎺 A funeral with trumpet music', fx: { team: 7, say: 'The trumpet was so sad and so bad. Everyone laughed-cried. 🎺' } },
      { t: '🌵 Buy a cactus. It can\'t die. Probably.', fx: { team: 3, say: 'Mr. Leafy II the cactus is doing great. 🌵' } },
      { t: '🌿 Turn the office into a jungle', fx: { cash: -0.2, team: 6, happy: 3, say: 'Your shop looks like a rainforest now. Customers love it! 🌿' } },
      { t: '🔍 Find out who forgot to water him', fx: { team: -4, say: 'Everyone blamed each other. It was a dark day. 🔍' } }
    ] });

  ev({ id: 'goldfish_funeral', cat: 'funny', icon: '🐟', w: 1.2, cd: 30, who: { a: 'any' },
    title: 'Bubbles the goldfish 🐟',
    text: 'Bubbles, the office goldfish, has gone to the big ocean in the sky. {a} is crying in the storage room.',
    choices: [
      { t: '🚽 A "sea burial" with honor', fx: { team: 3, a: -3, say: 'You all saluted. {a} is still a bit upset. 🫡' } },
      { t: '🕯️ A tiny funeral with a matchbox', fx: { team: 5, a: 8, say: '{a} gave a speech. It was 20 minutes long. 🕯️' } },
      { t: '🐠 Secretly buy an identical fish', fx: { a: 10, say: '"Bubbles is ALIVE?!" {a} will never know. 🐠🤫' } },
      { t: '🐡 Buy a giant aquarium for the shop', fx: { cash: -0.5, happy: 4, fans: 6, team: 5, say: 'Kids press their faces on the glass all day. 🐡' } }
    ] });

  ev({ id: 'near_miss', cat: 'trouble', icon: '🚚', w: 1, cd: 30, who: { a: 'any' },
    title: '{a} almost got hit by a truck! 😱',
    text: 'A delivery truck almost hit {a} outside the shop! They are okay, but very scared.',
    choices: [
      { t: '🚸 Pay for a crosswalk and a light', fx: { cash: -0.6, rep: 5, a: 10, say: 'The street is safe now. The whole town thanked you. 🚸' } },
      { t: '🛌 Give {a} a week off to rest', fx: { a: 20, capacity: [0.93, 1, '{a} resting'], say: '{a} came back happy and ready. 🛌' } },
      { t: '🦺 Safety training for everyone', fx: { cash: -0.3, team: 4, say: 'Everyone wears bright vests now. Very stylish. 🦺' } },
      { t: '🤗 Give {a} a big hug', fx: { a: 8, say: '{a} feels better. 🤗' } }
    ] });

  ev({ id: 'cpr_hero', cat: 'team', icon: '🚑', w: 1, cd: 40, who: { a: 'any' },
    title: '{a} saved a life! 🚑',
    text: 'A customer suddenly fell down in the shop. {a} knew CPR and saved them before the ambulance arrived! 😲❤️',
    choices: [
      { t: '🏅 Give {a} a hero medal and a bonus', fx: { bonus: 'a', a: 15, loyal: { a: 20 }, team: 4, say: '{a} is officially a hero. 🏅' } },
      { t: '❤️ First-aid classes for everyone', fx: { cash: -0.3, team: 5, rep: 4, say: 'Now your whole team can save lives. ❤️' } },
      { t: '📱 Tell the world the story', fx: { viral: [1, 3], rep: 4, a: 8, say: 'The news called {a} "The Hero of {city}"! 📱' } },
      { t: '🪜 Promote {a}', fx: { promote: 'a', a: 12, say: 'Heroes get promoted here. 🪜' } }
    ] });

  // =====================================================================
  // 😡 ANGRY CUSTOMERS AND SLAPS
  // =====================================================================

  ev({ id: 'customer_yell', cat: 'customers', icon: '😡', w: 4, cd: 6,
    title: 'A customer is YELLING at you! 😡',
    text: '"MY ORDER IS WRONG AND I\'VE BEEN WAITING FOREVER!!" A customer is screaming at you in front of everyone. 📢',
    choices: [
      { t: '😌 Stay calm, say sorry, fix it', fx: { chance: { p: 0.75, win: { happy: 4, rep: 2, say: 'They calmed down and even said thanks. 😌' }, lose: { happy: -2, say: 'They still left angry. Some people... 🙄' } } } },
      { t: '🎁 Make it free and give a coupon', fx: { cash: -0.05, happy: 5, rep: 2, say: '"Oh... okay. Thank you!" Anger gone. 🎁' } },
      { t: '📢 YELL BACK EVEN LOUDER', fx: { rep: -4, happy: -5, chance: { p: 0.3, win: { viral: [1, 3], say: 'Someone filmed it... and people LOVED your comeback. 😂🔥' }, lose: { say: 'Everyone in the shop is staring at you. Awkward. 😳' } } } },
      { t: '🎤 Sing them a calming opera song', fx: { chance: { p: 0.6, win: { happy: 6, fans: 10, say: 'They laughed so hard they forgot to be angry! 🎤' }, lose: { happy: -2, say: 'They yelled louder. You sang louder. Chaos. 🎭' } } } }
    ] });

  ev({ id: 'customer_yell_worker', cat: 'customers', icon: '😢', w: 3, cd: 8, who: { a: 'front' },
    title: 'A customer made {a} cry 😢',
    text: 'A customer yelled at {a} for five minutes about something silly. Now {a} is crying in the back.',
    choices: [
      { t: '🚪 Kick the customer out', fx: { a: 12, team: 4, rep: -1, say: '"Nobody talks to my team like that!" The team cheered. 🚪' } },
      { t: '🗣️ Talk to the customer calmly', fx: { chance: { p: 0.6, win: { happy: 3, a: 5, say: 'The customer said sorry to {a}! 🗣️' }, lose: { a: -3, say: 'The customer didn\'t care. 😒' } } } },
      { t: '🍦 Give {a} the rest of the day off', fx: { a: 14, capacity: [0.95, 1, '{a} off'], say: '{a} ate ice cream and felt better. 🍦' } },
      { t: '🤷 "The customer is always right"', fx: { a: -15, happy: 3, say: '{a} is very hurt. Hmm. 😞' } }
    ] });

  ev({ id: 'slapped_you', cat: 'customers', icon: '👋', w: 2.5, cd: 12,
    title: 'A customer SLAPPED you! 👋😲',
    text: 'A customer got angry about the prices and... SLAP! Right on the cheek, in front of everyone!',
    choices: [
      { t: '👮 Call the police', fx: { rep: 2, say: 'The police took them away. Everyone in the shop clapped. 👮' } },
      { t: '😇 Smile: "Have a nice day!"', fx: { rep: 5, fans: 8, say: 'Everyone saw how calm you were. Total respect. 😇' } },
      { t: '📹 Post the camera video', fx: { chance: { p: 0.5, win: { viral: [1, 4], fans: 10, say: '"Boss gets slapped, stays cool" got millions of views! 📹🔥' }, lose: { rep: -2, say: 'People argued in the comments for days. 😬' } } } },
      { t: '👋 Slap them back', fx: { rep: -6, happy: -4, chance: { p: 0.35, win: { fans: 20, say: 'The video "The Great Slap Battle" went viral. Not proud. 😂' }, lose: { cash: -0.3, say: 'Now YOU are in trouble too. Bad idea! 😬' } } } }
    ] });

  ev({ id: 'slapped_worker', cat: 'customers', icon: '😱', w: 2, cd: 14, who: { a: 'front' },
    title: 'A customer slapped {a}! 😱',
    text: 'A customer slapped {a} because their {unit} was "too slow". {a} is shocked.',
    choices: [
      { t: '⛔ Ban that customer forever', fx: { a: 10, team: 5, rep: 2, say: 'Their photo is on the wall: BANNED FOREVER. ⛔' } },
      { t: '⚖️ Help {a} take them to court', fx: { cash: -0.2, a: 15, loyal: { a: 15 }, say: 'The judge made them pay {a}. Justice! ⚖️' } },
      { t: '🎁 Give {a} a bonus and a hug', fx: { bonus: 'a', a: 12, say: '{a} feels safe and loved. 🎁' } },
      { t: '💪 Tell {a} to shake it off', fx: { a: -12, say: '{a} doesn\'t feel like you have their back. 😞' } }
    ] });

  ev({ id: 'rival_slap', cat: 'rivals', icon: '📺', rarity: 'rare', w: 1, cd: 40, minWeek: 10, init: rival,
    title: '{rival}\'s boss slapped you on live TV!',
    text: 'At the Business Awards, the boss of {rival} walked up and SLAPPED you. On live TV. 😲📺 Everyone is talking about it.',
    choices: [
      { t: '⚖️ Sue them!', fx: { cash: -0.5, chance: { p: 0.6, win: { cash: 3, rival: -0.15, say: 'You won! They had to pay you AND say sorry on TV. ⚖️' }, lose: { say: 'The judge said "you both need to grow up". 😅' } } } },
      { t: '😂 Laugh it off on stage', fx: { fans: 25, rep: 4, rival: -0.08, say: 'The crowd cheered for YOU. {rival} looks silly now. 😂' } },
      { t: '🪶 Challenge them to a pillow fight', fx: { fans: 35, rival: -0.05, say: 'Next year\'s awards will have a pillow fight. Tickets sold out! 🪶' } },
      { t: '😭 Cry dramatically on TV', fx: { fans: 15, happy: 3, say: 'Everyone felt sorry for you. Sales went up! 😭📈', demand: [1.1, 2, 'Sympathy'] } }
    ] });

  ev({ id: 'karen_manager', cat: 'customers', icon: '💅', w: 3, cd: 8,
    title: '"I want to speak to the MANAGER!" 💅',
    text: 'A customer is demanding the manager because their straw is "the wrong color".',
    choices: [
      { t: '😎 "I AM the manager. And the boss."', fx: { chance: { p: 0.5, win: { happy: 2, say: 'They went quiet. Very quiet. 😎' }, lose: { happy: -3, say: '"Then I want YOUR boss!" Oh no. 😩' } } } },
      { t: '🥸 Send a worker in a fake mustache', fx: { team: 4, happy: 2, say: '"Manager Mustache" solved it. Legend. 🥸' } },
      { t: '🌈 Give them 10 straws, all colors', fx: { happy: 4, say: 'They left happy. With 10 straws. 🌈' } },
      { t: '🐈 "Our manager is a cat."', fx: { fans: 8, say: 'They were so confused they just left. 🐈' } }
    ] });

  ev({ id: 'loud_neighbor', cat: 'trouble', icon: '🏠', w: 2, cd: 20,
    title: 'Your neighbor yells: "TOO LOUD!" 📢',
    text: 'The old man next door is yelling out his window that your shop is too loud. Every. Single. Day.',
    choices: [
      { t: '🧱 Build soundproof walls', fx: { cash: -0.6, rep: 2, say: 'Silence! The neighbor finally sleeps. 🧱' } },
      { t: '🎁 Invite him in for free {unit}', fx: { cash: -0.03, rep: 3, chance: { p: 0.7, win: { happy: 3, say: 'Now he\'s your best customer! 🎁' }, lose: { say: 'He took the {unit} and still yelled. 😤' } } } },
      { t: '🔇 Turn off all the music', fx: { team: -4, say: 'Quiet shop, bored team. 🔇' } },
      { t: '🔊 Play music even LOUDER', fx: { rep: -3, fans: 6, team: 3, say: 'The team loved it. The neighbor called the police. 🔊👮' } }
    ] });

  ev({ id: 'screaming_kid', cat: 'customers', icon: '😭', w: 2.5, cd: 8,
    title: 'A kid won\'t stop SCREAMING 😭',
    text: 'A little kid is screaming as loud as a fire alarm. The parent looks tired. Everyone is covering their ears.',
    choices: [
      { t: '🍭 Give the kid a free treat', fx: { cash: -0.02, happy: 4, say: 'Silence. Beautiful silence. The parent mouthed "THANK YOU". 🍭' } },
      { t: '🤪 Make the silliest face ever', fx: { chance: { p: 0.6, win: { happy: 5, fans: 4, say: 'The kid laughed so hard they fell over! 🤪' }, lose: { happy: -2, say: 'The kid screamed LOUDER. 😱' } } } },
      { t: '🎈 Give them a balloon', fx: { money: -2, happy: 3, say: 'Balloon = happy kid. Always works. 🎈' } },
      { t: '🎧 Hand out earplugs to everyone', fx: { money: -10, rep: -1, say: 'Everyone got earplugs. The kid kept screaming. 🎧' } }
    ] });

  ev({ id: 'rude_review_in_person', cat: 'customers', icon: '🗯️', w: 2, cd: 10,
    title: 'A customer says your {unit} are "GROSS"',
    text: 'A customer spits out their {unit} and shouts: "This is the WORST {unit} in {city}!" Everyone hears it.',
    choices: [
      { t: '🙏 Ask what they didn\'t like', fx: { rep: 2, chance: { p: 0.6, win: { happy: 3, say: 'They had good ideas! You changed the recipe. 🙏' }, lose: { say: '"Everything!" they said. Helpful. 🙄' } } } },
      { t: '💸 Give them their money back', fx: { money: -20, happy: 2, say: 'Fair is fair. 💸' } },
      { t: '🤨 "Then why did you eat 3 of them?"', fx: { fans: 10, happy: -1, say: 'The whole shop laughed. They left red-faced. 😂' } },
      { t: '📣 Have a blind taste test on the spot', fx: { chance: { p: 0.65, win: { fans: 15, rep: 3, say: 'They picked YOUR {unit} as the best. Ha! 📣' }, lose: { rep: -3, say: 'They picked the rival\'s. Ouch. 😖' } } } }
    ] });

  // =====================================================================
  // 🤪 CRAZY DAYS
  // =====================================================================

  ev({ id: 'food_fight', cat: 'funny', icon: '🥧', w: 1.8, cd: 20,
    title: 'FOOD FIGHT! 🥧',
    text: 'Two groups of teenagers started a food fight in your shop. Pie is flying everywhere!',
    choices: [
      { t: '🛑 Stop it right now!', fx: { chance: { p: 0.6, win: { rep: 2, say: 'Your boss voice stopped everyone. 🛑' }, lose: { cash: -0.2, say: 'Too late. You got a pie in the face. 🥧😑' } } } },
      { t: '🥧 JOIN THE FIGHT', fx: { team: 8, fans: 20, cash: -0.3, say: 'Best day ever. Worst cleanup ever. 🥧😂' } },
      { t: '🧹 Make them clean everything', fx: { rep: 3, say: 'They cleaned for 2 hours. Then they said sorry. 🧹' } },
      { t: '📹 Film it and sell tickets next time', fx: { fans: 15, chance: { p: 0.3, win: { viral: [1, 3], say: 'The video went viral! "Food Fight Friday" is now a thing. 📹' }, lose: { rep: -2, say: 'Parents were not happy about the video. 😬' } } } }
    ] });

  ev({ id: 'flash_mob', cat: 'social', icon: '💃', w: 1.5, cd: 25,
    title: 'A flash mob in your shop! 💃',
    text: 'Suddenly 40 people start dancing in your shop at the same time! Customers are filming.',
    choices: [
      { t: '🕺 Dance with them!', fx: { fans: 25, team: 5, say: 'You did the worm. Everyone lost their minds. 🕺' } },
      { t: '🎵 Put on your best song', fx: { fans: 15, happy: 4, say: 'The dance lasted 20 minutes. Amazing. 🎵' } },
      { t: '📱 Post it on your page', fx: { chance: { p: 0.45, win: { viral: [1, 4], say: 'Your shop is the "flash mob shop" now! 📱🔥' }, lose: { fans: 10, say: 'Nice video. Some new fans. 📱' } } } },
      { t: '😠 "Please leave, this is a shop!"', fx: { rep: -2, happy: -2, say: 'They left. Everyone thinks you\'re no fun. 😠' } }
    ] });

  ev({ id: 'proposal_no', cat: 'customers', icon: '💍', w: 1.2, cd: 30,
    title: 'A proposal went... badly 💍😬',
    text: 'A man got down on one knee in your shop and asked his girlfriend to marry him. She said "NO!" and ran out. It\'s VERY awkward.',
    choices: [
      { t: '🍰 Give him a free cake', fx: { cash: -0.02, rep: 2, say: 'He ate the whole cake. Poor guy. 🍰' } },
      { t: '🎻 Play a sad violin song', fx: { fans: 8, say: 'Too soon? The customers laughed nervously. 🎻' } },
      { t: '🏃 Chase after her for him', fx: { chance: { p: 0.25, win: { fans: 30, rep: 4, say: 'She came back and said YES! The shop cheered! 💍🎉' }, lose: { say: 'She was already gone. 🏃💨' } } } },
      { t: '🙈 Pretend nothing happened', fx: { say: 'Everyone stared at their {unit}. Very quiet. 🙈' } }
    ] });

  ev({ id: 'rubber_chickens', cat: 'funny', icon: '🐔', w: 1.5, cd: 30,
    title: '1,000 rubber chickens? 🐔',
    text: 'A delivery truck dropped off 1,000 rubber chickens. You didn\'t order them. The driver already left.',
    choices: [
      { t: '🎁 Give one free with every {unit}', fx: { fans: 20, happy: 4, say: 'Everyone in {city} has a rubber chicken now. SQUEAK. 🐔' } },
      { t: '💰 Sell them for $1 each', fx: { cash: 0.3, say: 'Weirdly, they sold out in a day. 💰' } },
      { t: '🏗️ Build a giant chicken statue', fx: { fans: 25, rep: 2, say: 'The Great Chicken of {city} is now a tourist attraction. 🏗️🐔' } },
      { t: '📞 Call the company to take them back', fx: { rep: 1, say: 'They said sorry and sent you a free pizza. 📞' } }
    ] });

  ev({ id: 'time_capsule', cat: 'lucky', icon: '📦', w: 1, cd: 60,
    title: 'You found a time capsule! 📦',
    text: 'While fixing a wall, {company} found a box from 1975! It says "Open me in the future."',
    choices: [
      { t: '📦 Open it right now', fx: { chance: { p: 0.5, win: { cash: 1.5, say: 'It had old coins worth a LOT of money today! 🪙' }, lose: { fans: 8, say: 'It had a letter, a yo-yo and a very old sandwich. 🥪🤢' } } } },
      { t: '📺 Open it live on the news', fx: { fans: 25, rep: 2, say: 'The whole town watched! Inside: a letter saying "Hi future!" 📺' } },
      { t: '🏛️ Give it to the museum', fx: { rep: 5, say: 'Your name is on a museum sign now. 🏛️' } },
      { t: '⏳ Add your stuff and bury it again', fx: { team: 5, say: 'Your team added drawings and a {unit}. See you in 50 years! ⏳' } }
    ] });

  ev({ id: 'secret_room', cat: 'weird', icon: '🚪', rarity: 'rare', w: 0.8, cd: 80,
    title: 'A SECRET ROOM! 🚪',
    text: 'You leaned on a bookshelf and it spun around. Behind it: a secret room nobody knew about!',
    choices: [
      { t: '🔦 Explore it', fx: { chance: { p: 0.5, win: { cash: 2, say: 'You found an old treasure box full of gold coins! 🔦💰' }, lose: { say: 'Just dust, spiders and one creepy doll. 🕷️' } } } },
      { t: '🛋️ Make it the coolest break room', fx: { cash: -0.3, team: 12, say: 'The team calls it "The Hideout". They love it. 🛋️' } },
      { t: '🎟️ Sell "secret room tours"', fx: { fans: 20, extra: [0.2, 4, 'Secret room tours'], say: 'People pay to see it! 🎟️' } },
      { t: '🧱 Close it and forget it', fx: { say: 'Some secrets should stay secret. 🧱' } }
    ] });

  ev({ id: 'mystery_tipper', cat: 'lucky', icon: '🤑', rarity: 'rare', w: 0.8, cd: 40,
    title: 'A mysterious HUGE tip 🤑',
    text: 'A customer in sunglasses left a note: "Great {unit}! Keep it up." Under it was a HUGE pile of cash!',
    choices: [
      { t: '💰 Keep it for the company', fx: { cash: 2, say: 'Thank you, mystery person! 💰' } },
      { t: '🎁 Share it with the team', fx: { cash: 1, teamBonus: true, team: 10, say: 'Everyone got a surprise bonus! 🎁' } },
      { t: '🕵️ Find out who it was', fx: { chance: { p: 0.4, win: { fans: 30, rep: 3, say: 'It was a famous movie star! They posted about you! 🌟' }, lose: { say: 'Nobody knows who it was. A mystery forever. 🕵️' } } } },
      { t: '❤️ Give it to a kids\' hospital', fx: { rep: 8, say: 'The hospital sent you a thank-you video. ❤️' } }
    ] });

  ev({ id: 'bee_swarm', cat: 'trouble', icon: '🐝', w: 1.5, cd: 30,
    title: 'BEES! 🐝🐝🐝',
    text: 'A giant swarm of bees moved into your sign. Customers are running away screaming!',
    choices: [
      { t: '👨‍🌾 Call a beekeeper', fx: { cash: -0.3, say: 'The beekeeper took them to a nice farm. 🐝' } },
      { t: '🍯 Keep them and sell honey!', fx: { cash: -0.2, extra: [0.15, 6, 'Shop honey'], fans: 10, say: '"{company} Honey" is a hit! 🍯' } },
      { t: '🏃 Close until they leave', fx: { closed: [1, 'Bees!'], say: 'The bees left after a week. 🐝👋' } },
      { t: '🐝 Tell customers "they\'re friendly"', fx: { happy: -6, rep: -3, say: 'They were NOT friendly. 🐝😫' } }
    ] });

  ev({ id: 'snake_storage', cat: 'trouble', icon: '🐍', w: 1.3, cd: 35, who: { a: 'any' },
    title: 'A snake in the storage room! 🐍',
    text: '{a} opened the storage room and screamed. There is a big snake sleeping on the boxes!',
    choices: [
      { t: '📞 Call animal rescue', fx: { cash: -0.1, a: 4, say: 'The snake is safe at the zoo now. 🐍' } },
      { t: '🦸 You catch it yourself', fx: { chance: { p: 0.6, win: { team: 10, fans: 12, say: 'You caught it like a pro. The team calls you "Snake Boss". 🦸' }, lose: { a: -5, say: 'The snake escaped into the walls. Nobody goes in there now. 😱' } } } },
      { t: '🐍 Adopt it as the shop pet', fx: { pet: '🐍', fans: 8, a: -8, say: 'Meet Sir Hiss. {a} is not happy. 🐍' } },
      { t: '🚫 Just never open that door again', fx: { capacity: [0.92, 3, 'Storage closed'], say: 'The storage room is now "the snake room". 🚫' } }
    ] });

  ev({ id: 'raccoon_gang', cat: 'trouble', icon: '🦝', w: 1.5, cd: 25,
    title: 'The raccoon gang is back 🦝',
    text: 'Every night, a gang of raccoons opens your trash cans and throws a party. There\'s trash everywhere.',
    choices: [
      { t: '🔒 Buy raccoon-proof trash cans', fx: { cash: -0.2, rep: 1, say: 'The raccoons are furious. The street is clean. 🔒' } },
      { t: '📹 Set up a raccoon cam', fx: { fans: 15, chance: { p: 0.35, win: { viral: [1, 3], say: 'Your "Raccoon Party Cam" is the most watched stream in {city}! 📹🦝' }, lose: { say: 'The raccoons stole the camera. 🦝📷' } } } },
      { t: '🍕 Feed them so they stop', fx: { cash: -0.05, rep: -1, say: 'Now there are 20 raccoons. Oops. 🍕🦝' } },
      { t: '🧹 Clean it up every morning', fx: { team: -3, say: 'Your team is tired of raccoon mornings. 🧹' } }
    ] });

  ev({ id: 'bear_walks_in', cat: 'weird', icon: '🐻', rarity: 'epic', w: 0.5, cd: 100,
    title: 'A BEAR walked into the shop 🐻',
    text: 'A real bear walked through the front door, looked around and sat down at a table. Nobody knows what to do.',
    choices: [
      { t: '🍯 Give it some honey', fx: { chance: { p: 0.7, win: { fans: 40, say: 'The bear ate the honey and left calmly. The video went everywhere! 🍯🐻' }, lose: { cash: -0.5, say: 'The bear wanted MORE. It ate everything. 🐻' } } } },
      { t: '📞 Call the rangers', fx: { closed: [1, 'Bear!'], rep: 3, say: 'The rangers took the bear back to the forest. 📞' } },
      { t: '🤫 Everyone stay very still', fx: { chance: { p: 0.6, win: { fans: 20, say: 'The bear got bored and left. Phew! 🤫' }, lose: { happy: -6, say: 'The bear took a nap. For 6 hours. 😴🐻' } } } },
      { t: '🧾 Ask the bear to order', fx: { fans: 30, say: 'It pointed at the menu. It ordered 40 {unit}. It did not pay. 🧾🐻' } }
    ] });

  ev({ id: 'tornado_warning', cat: 'world', icon: '🌪️', w: 0.8, cd: 50, minWeek: 8,
    title: 'Tornado warning! 🌪️',
    text: 'The news says a tornado might hit {city} tomorrow. Everyone is scared.',
    choices: [
      { t: '🪵 Board up the windows', fx: { cash: -0.4, chance: { p: 0.8, win: { say: 'The tornado missed you! Your shop is safe. 🪵' }, lose: { cash: -0.5, closed: [1, 'Tornado damage'], say: 'The tornado hit, but your boards saved most of the shop. 🌪️' } } } },
      { t: '🏠 Open your shop as a safe place', fx: { rep: 8, fans: 15, say: 'Families stayed in your shop all night. Heroes! 🏠' } },
      { t: '🤞 Do nothing and hope', fx: { chance: { p: 0.6, win: { say: 'It missed you. Lucky! 🤞' }, lose: { cash: -1.5, closed: [2, 'Tornado damage'], say: 'The tornado ripped off your sign and broke windows! 🌪️😱' } } } },
      { t: '📹 Film the tornado for views', fx: { chance: { p: 0.4, win: { viral: [1, 3], say: 'Your video was on the national news! 📹' }, lose: { rep: -4, say: 'People said it was dangerous and silly. 😬' } } } }
    ] });

  ev({ id: 'small_earthquake', cat: 'world', icon: '🫨', w: 0.8, cd: 50, minWeek: 6,
    title: 'EARTHQUAKE! 🫨',
    text: 'The ground shook for 10 seconds! Shelves fell and {unit} are all over the floor. Nobody got hurt.',
    choices: [
      { t: '🔩 Bolt everything to the walls', fx: { cash: -0.5, equip: 0.02, say: 'Now your shop is earthquake-proof. 🔩' } },
      { t: '🧹 Everyone clean up together', fx: { team: 5, say: 'Teamwork! The shop was back to normal by lunch. 🧹' } },
      { t: '💸 "Earthquake Sale!" on dropped stuff', fx: { demand: [1.15, 1, 'Earthquake sale'], say: 'Customers loved the crazy discounts. 💸' } },
      { t: '🏠 Help the neighbors first', fx: { rep: 6, closed: [1, 'Helping neighbors'], say: 'The whole street remembers who helped. 🏠❤️' } }
    ] });

  ev({ id: 'solar_eclipse', cat: 'world', icon: '🌑', w: 0.8, cd: 80,
    title: 'Solar eclipse today! 🌑',
    text: 'The moon will cover the sun this afternoon! Everyone in {city} wants to watch it.',
    choices: [
      { t: '🕶️ Give out free eclipse glasses', fx: { cash: -0.2, fans: 20, rep: 3, say: 'Everyone watched it from your shop! 🕶️🌑' } },
      { t: '🌘 Make "Eclipse {unit}" (black)', fx: { extra: [0.3, 1, 'Eclipse special'], fans: 10, say: 'Black {unit} sold out in an hour! 🌘' } },
      { t: '🎉 Throw an eclipse party on the roof', fx: { cash: -0.3, team: 8, fans: 15, say: 'Best party of the year. In the dark. 🎉' } },
      { t: '💼 Keep working', fx: { say: 'It got dark for 3 minutes. Then it was normal again.' } }
    ] });

  ev({ id: 'football_final', cat: 'world', icon: '🏆', w: 1.2, cd: 40, minWeek: 5,
    title: 'The big football final is tonight! 🏆',
    text: 'The whole city is going crazy for the big football final! Nobody is thinking about {unit}.',
    choices: [
      { t: '📺 Put a giant TV in the shop', fx: { cash: -0.4, demand: [1.25, 1, 'Final night'], team: 5, say: 'The shop was PACKED! Everyone cheered! 📺⚽' } },
      { t: '⚽ Sell "Final" special {unit}', fx: { extra: [0.25, 1, 'Final specials'], say: 'Everyone wanted a lucky {unit}! ⚽' } },
      { t: '🏠 Close early so the team can watch', fx: { closed: [1, 'Final night'], team: 12, say: 'Your team LOVED you for it! 🏠' } },
      { t: '📉 Nothing. Stay open like always.', fx: { demand: [0.85, 1, 'Everyone watching the final'], say: 'The shop was empty. Everyone was watching the game. 📉' } }
    ] });

  ev({ id: 'mayor_election', cat: 'world', icon: '🗳️', w: 0.8, cd: 80, minWeek: 15,
    title: 'Both people running for mayor want your help 🗳️',
    text: 'Two people want to be the new mayor of {city}. Both of them are asking you to put their poster in your window.',
    choices: [
      { t: '🟦 Support the "Lower Taxes" one', fx: { chance: { p: 0.5, win: { rent: -0.05, say: 'They won! Your rent went down a bit. 🟦' }, lose: { rep: -2, say: 'They lost. The new mayor remembers. 😬' } } } },
      { t: '🟩 Support the "Parks & Fun" one', fx: { chance: { p: 0.5, win: { demand: [1.15, 6, 'New park'], say: 'They won and built a park next to your shop! 🟩' }, lose: { rep: -2, say: 'They lost. Oh well. 🟩' } } } },
      { t: '🙅 Stay out of politics', fx: { rep: 1, say: 'Smart. Everyone still likes you. 🙅' } },
      { t: '😎 Run for mayor yourself!', fx: { fans: 30, chance: { p: 0.12, win: { rep: 10, fans: 40, say: 'YOU WON?! Mayor-Boss! 🎉 (You gave the job to someone else later.)' }, lose: { say: 'You got 312 votes. Your mom voted twice. 😂' } } } }
    ] });

  ev({ id: 'mayor_visit', cat: 'customers', icon: '🎩', w: 1, cd: 40,
    title: 'The mayor is coming! 🎩',
    text: 'The mayor of {city} wants to visit your {industry} tomorrow with TV cameras!',
    choices: [
      { t: '🧽 Clean EVERYTHING tonight', fx: { team: -3, rep: 4, fans: 10, say: 'The shop sparkled. The mayor loved it! 🧽' } },
      { t: '🎁 Make the mayor a special gift', fx: { cash: -0.2, rep: 5, fans: 12, say: 'The mayor held your gift up on TV! 🎁' } },
      { t: '🎤 Ask the mayor for a new parking lot', fx: { chance: { p: 0.4, win: { demand: [1.12, 8, 'New parking'], say: 'They said yes! More customers can park now. 🅿️' }, lose: { say: '"We\'ll see," said the mayor. Hmm. 🎤' } } } },
      { t: '😬 Just be yourself', fx: { chance: { p: 0.5, win: { fans: 15, say: 'You were charming! The mayor laughed a lot. 😄' }, lose: { rep: -2, say: 'You spilled {unit} on the mayor. On TV. 😬' } } } }
    ] });

  ev({ id: 'prank_call_order', cat: 'funny', icon: '☎️', w: 1.5, cd: 25,
    title: 'An order for 500 {unit}? ☎️',
    text: 'Someone called and ordered 500 {unit} for a "party". The name they gave was "Hugh Jass". Hmm.',
    choices: [
      { t: '🏭 Make all 500!', fx: { cash: -0.6, chance: { p: 0.3, win: { cash: 1.6, say: 'It was REAL! A giant party paid you! 🎉' }, lose: { say: 'It was a prank. You have 500 {unit} now. 😩' } } } },
      { t: '💳 Ask them to pay first', fx: { say: 'They hung up. It was a prank. Nice try! 💳' } },
      { t: '📞 Prank them back', fx: { team: 6, fans: 5, say: 'You called back with a funny voice. The team was crying laughing. 📞' } },
      { t: '🎁 Give free {unit} to a school instead', fx: { cash: -0.3, rep: 5, say: 'The kids went crazy! Nice! 🎁' } }
    ] });

  ev({ id: 'scam_email', cat: 'trouble', icon: '📧', w: 1.8, cd: 20,
    title: '"YOU WON $1,000,000!!!" 📧',
    text: 'An email says you won a million dollars. You just need to send your bank password. Seems legit?',
    choices: [
      { t: '🔑 Send the password', fx: { cash: -1, rep: -1, say: 'It was a SCAM. They took money from your bank! 😱 Never send passwords!' } },
      { t: '🗑️ Delete it', fx: { say: 'Smart boss! It was a scam. 🗑️' } },
      { t: '🚨 Report it to the police', fx: { rep: 2, say: 'The police caught the scammers! 🚨' } },
      { t: '😂 Reply with memes for 3 hours', fx: { team: 5, fans: 6, say: 'The scammer gave up and blocked YOU. 😂' } }
    ] });

  ev({ id: 'kid_hacker', cat: 'business', icon: '💻', w: 1.2, cd: 40,
    title: 'A 12-year-old hacked your website 💻',
    text: 'A kid emailed you: "I found a hole in your website. I can fix it for $50. Or I can show everyone." 😅',
    choices: [
      { t: '💵 Pay the $50 and hire them', fx: { money: -50, equip: 0.02, say: 'Best $50 ever. The website is super safe now. 💻' } },
      { t: '🎓 Give them a summer job', fx: { hireSpecial: { role: 'front', skill: 55 }, fans: 10, say: 'The kid is the youngest worker in {city}! 🎓' } },
      { t: '📞 Call their parents', fx: { rep: 1, say: 'The kid got grounded. The hole is still there. 🤷' } },
      { t: '🙈 Ignore it', fx: { chance: { p: 0.4, win: { say: 'Nothing happened. Phew. 🙈' }, lose: { rep: -4, say: 'The kid changed your website to say "PIZZA RULES". 🍕' } } } }
    ] });

  ev({ id: 'bank_error', cat: 'lucky', icon: '🏦', w: 1, cd: 50,
    title: 'Bank error in your favor! 🏦',
    text: 'The bank put way too much money in your account by mistake. Nobody has noticed yet...',
    choices: [
      { t: '📞 Tell the bank', fx: { rep: 4, cash: 0.3, say: 'The bank gave you a "thank you" reward for being honest! 📞' } },
      { t: '🤫 Keep quiet', fx: { chance: { p: 0.4, win: { cash: 2, say: 'They never noticed. Lucky... 🤫' }, lose: { cash: -0.5, rep: -3, say: 'They noticed. You had to pay it back PLUS a fine. 😬' } } } },
      { t: '💸 Spend it fast!', fx: { chance: { p: 0.2, win: { cash: 2, say: 'Somehow it worked out. Don\'t do this in real life! 💸' }, lose: { cash: -1.2, rep: -4, say: 'The bank took it all back AND fined you. Ouch. 💸😩' } } } },
      { t: '🏦 Ask the bank for a real loan instead', fx: { rep: 2, say: 'The bank manager laughed and said, "Good one." 🏦' } }
    ] });

  ev({ id: 'mystery_shopper', cat: 'customers', icon: '🕵️', w: 1.5, cd: 25,
    title: 'A secret mystery shopper? 🕵️',
    text: 'A customer is taking notes and asking weird questions. {a} thinks it\'s a secret shopper from the Best Shops Guide!', who: { a: 'front' },
    choices: [
      { t: '⭐ Treat them like royalty', fx: { chance: { p: 0.6, win: { rep: 6, fans: 15, say: 'It WAS the guide! You got a gold star! ⭐' }, lose: { say: 'It was just a student doing homework. 😅' } } } },
      { t: '🙂 Treat them like everyone else', fx: { rep: 3, say: 'The guide said: "Friendly to everyone!" 🙂' } },
      { t: '🎁 Give them free stuff', fx: { cash: -0.05, chance: { p: 0.5, win: { rep: 2, say: 'They liked it but wrote "tried to bribe me". 😅' }, lose: { rep: -2, say: '"Too pushy!" they wrote. 😬' } } } },
      { t: '🔍 Ask "Are you a secret shopper?"', fx: { rep: -1, fans: 5, say: '"...No." They left fast. 🔍' } }
    ] });

  ev({ id: 'birthday_party_kid', cat: 'customers', icon: '🎂', w: 1.8, cd: 15,
    title: 'A kid wants their birthday party here! 🎂',
    text: 'A 7-year-old says your {industry} is their favorite place in the world and wants to have their birthday party there.',
    choices: [
      { t: '🎉 Throw the best party ever', fx: { cash: -0.2, fans: 15, rep: 4, extra: [0.1, 1, 'Birthday party'], say: 'Twenty kids screaming with joy. Worth it. 🎉' } },
      { t: '💰 Sell them a party package', fx: { extra: [0.25, 1, 'Party package'], say: 'You made money AND a kid happy. 💰' } },
      { t: '🤡 Hire a clown', fx: { cash: -0.1, chance: { p: 0.6, win: { fans: 12, say: 'The clown was amazing! 🤡' }, lose: { happy: -3, say: 'The clown scared the kids. Oops. 🤡😱' } } } },
      { t: '🙅 "Sorry, we don\'t do parties"', fx: { happy: -2, say: 'The kid cried a little. 😢' } }
    ] });

  ev({ id: 'wedding_in_shop', cat: 'customers', icon: '💒', w: 1, cd: 40,
    title: 'A couple wants to get married in your shop! 💒',
    text: 'They met in your {industry} 5 years ago. Now they want the wedding right here!',
    choices: [
      { t: '💒 YES! Close for the wedding', fx: { closed: [1, 'Wedding'], fans: 30, rep: 5, team: 5, say: 'Everyone cried. It was beautiful. 💒' } },
      { t: '🎂 Make them a giant {unit} cake', fx: { cash: -0.3, fans: 20, rep: 4, say: 'A cake made of {unit}! The photos went everywhere. 🎂' } },
      { t: '💰 Charge them for the space', fx: { cash: 0.8, say: 'Business is business. 💰' } },
      { t: '🙅 "Sorry, we\'re too busy"', fx: { say: 'They got married in a park. They still come here though.' } }
    ] });

  ev({ id: 'meme_template', cat: 'social', icon: '🖼️', w: 1.5, cd: 30, who: { a: 'any' },
    title: '{a} became a MEME 🖼️',
    text: 'A photo of {a} making a weird face at work became a meme. It\'s EVERYWHERE online!',
    choices: [
      { t: '👕 Print it on t-shirts', fx: { extra: [0.2, 4, 'Meme shirts'], fans: 20, a: 5, say: 'The shirts sold out! {a} is famous! 👕' } },
      { t: '📱 Post your own version', fx: { fans: 25, chance: { p: 0.35, win: { viral: [1, 3], say: 'Your version went even MORE viral! 📱' }, lose: { say: 'People liked it. 📱' } } } },
      { t: '🙈 Ask people to stop', fx: { a: 5, fans: -5, say: 'The internet did not stop. It never stops. 🙈' } },
      { t: '💵 Give {a} a "meme bonus"', fx: { bonus: 'a', a: 10, say: '{a} is proud to be a meme. 💵' } }
    ] });

  ev({ id: 'fan_club', cat: 'social', icon: '💖', w: 1, cd: 50, minWeek: 15, cond: function (g) { return g.followers > 500; },
    title: 'Your company has a FAN CLUB! 💖',
    text: 'A group of super fans started "The {company} Fan Club". They have matching jackets and a secret handshake.',
    choices: [
      { t: '🎟️ Give them VIP cards', fx: { cash: -0.1, fans: 20, happy: 4, say: 'They show their VIP cards to everyone. 🎟️' } },
      { t: '🎉 Throw a fan club party', fx: { cash: -0.3, fans: 35, rep: 3, say: 'The party was on the news! 🎉' } },
      { t: '🤝 Learn the secret handshake', fx: { fans: 15, team: 3, say: 'It took 45 minutes. It has 23 steps. 🤝' } },
      { t: '😅 That\'s a bit weird', fx: { say: 'They\'re still fans. They just call you "the shy boss" now.' } }
    ] });

  ev({ id: 'copycat_name', cat: 'rivals', icon: '📛', w: 1.5, cd: 40, minWeek: 8,
    title: 'A copycat shop opened: "{company}s" 📛',
    text: 'A new shop opened across the street called "{company}s". Same colors. Same logo. Customers are confused!',
    choices: [
      { t: '⚖️ Take them to court', fx: { cash: -0.5, chance: { p: 0.7, win: { rep: 3, say: 'The judge made them change their name to "Bob\'s Shop". ⚖️' }, lose: { demand: [0.9, 4, 'Copycat'], say: 'They changed one letter. It still counts. 😤' } } } },
      { t: '📣 "The ORIGINAL {company}" signs', fx: { cash: -0.2, rep: 2, fans: 10, say: 'Everyone knows who the real one is. 📣' } },
      { t: '💼 Buy their shop', fx: { cash: -1.5, capacity: [1.1, 12, 'Second shop'], say: 'Now you have TWO shops across the street from each other! 💼' } },
      { t: '🤷 Ignore them', fx: { demand: [0.92, 4, 'Copycat'], say: 'Some customers went to the wrong shop. 🤷' } }
    ] });

  ev({ id: 'rival_kid_stand', cat: 'rivals', icon: '🧃', w: 1.2, cd: 40, init: rival,
    title: '{rival}\'s kid is selling stuff outside YOUR shop 🧃',
    text: 'The boss of {rival} sent their 8-year-old to sell cheap juice right in front of your door. The kid is very cute and very good at selling.',
    choices: [
      { t: '🤝 Hire the kid (for juice money)', fx: { money: -20, fans: 15, rival: -0.03, say: 'The kid switched sides! {rival} is furious. 😂' } },
      { t: '🧃 Buy ALL the juice', fx: { money: -40, fans: 5, say: 'The kid went home happy. Your team drank juice all week. 🧃' } },
      { t: '🍋 Open your own stand next to theirs', fx: { fans: 10, team: 4, say: 'Stand war! The whole street came to watch. 🍋' } },
      { t: '😤 Call {rival} and complain', fx: { rep: -1, say: '"It\'s just a kid!" they said. Hmm. 😤' } }
    ] });

  ev({ id: 'rival_insult_ad', cat: 'rivals', icon: '📺', w: 1.8, cd: 20, minWeek: 5, init: rival,
    title: '{rival}\'s new ad makes fun of you! 📺',
    text: 'The new TV ad from {rival} says: "Our {unit} are better than {company}\'s. Obviously." 😤',
    choices: [
      { t: '📺 Make a funny ad back', fx: { cash: -0.5, fans: 25, rival: -0.06, say: 'Your ad was SO funny. Everyone is on your side! 📺😂' } },
      { t: '⚖️ Complain to the TV station', fx: { chance: { p: 0.5, win: { rival: -0.05, say: 'The TV station took the ad down! ⚖️' }, lose: { say: 'The TV station said it was "just a joke". 😒' } } } },
      { t: '🏷️ Have a big sale the same day', fx: { demand: [1.2, 2, 'Sale'], price: -1, say: 'Customers came to YOU instead. Ha! 🏷️' } },
      { t: '😌 Stay classy and ignore it', fx: { rep: 3, say: 'People respect you more. 😌' } }
    ] });

  ev({ id: 'rival_steal_manager', cat: 'rivals', icon: '🕴️', w: 1.5, cd: 30, init: rival, who: { m: 'mgr' },
    title: '{rival} wants to steal {m}!', kind: 'chat', from: 'm',
    msgs: ['hey boss...', '{rival} offered me a job 😬', 'with DOUBLE pay', 'should I go?? 👀'],
    choices: [
      { t: '💵 "I\'ll pay you more!"', fx: { raise: ['m', 0.25], m: 12, loyal: { m: 15 }, say: '{m} stays! And is very happy. 💵' } },
      { t: '❤️ "You\'re family here"', fx: { chance: { p: 0.55, win: { m: 10, loyal: { m: 25 }, say: '{m} decided to stay. Family first! ❤️' }, lose: { quit: 'm', say: '{m} chose the money. 😢' } } } },
      { t: '🕵️ "Go... and be MY spy there!"', fx: { chance: { p: 0.4, win: { quit: 'm', rival: -0.15, cash: 1, say: '{m} sent you all of {rival}\'s secrets! 🕵️' }, lose: { quit: 'm', say: '{m} actually liked it there. Oops. 😅' } } } },
      { t: '👋 "Good luck!"', fx: { quit: 'm', say: 'Bye {m}! 👋' } }
    ] });

  ev({ id: 'rival_merge', cat: 'rivals', icon: '🤝', rarity: 'rare', w: 0.8, cd: 60, minWeek: 20, init: rival,
    title: '{rival} wants to join forces! 🤝',
    text: 'The boss of {rival} says: "Let\'s stop fighting and work together. We could share customers AND suppliers."',
    choices: [
      { t: '🤝 Team up!', fx: { supply: [-0.03, 12, 'Shared suppliers'], rival: -0.1, rep: 2, say: 'Together you both saved money! 🤝' } },
      { t: '💼 "Only if I\'m the boss"', fx: { chance: { p: 0.35, win: { rival: -0.3, capacity: [1.15, 20, 'Merged teams'], say: 'They said YES! You\'re the boss of both! 💼' }, lose: { say: '"No way!" The deal is off. 💼' } } } },
      { t: '🕵️ Pretend to agree and learn secrets', fx: { chance: { p: 0.5, win: { rival: -0.12, say: 'You learned all their tricks! 🕵️' }, lose: { rep: -5, say: 'They found out. Now everyone thinks you\'re sneaky. 😬' } } } },
      { t: '🙅 "Never!"', fx: { team: 3, say: 'Your team cheered. The rivalry lives on! 🙅' } }
    ] });

  // =====================================================================
  // 👥 TEAM LIFE
  // =====================================================================

  ev({ id: 'worker_baby', cat: 'team', icon: '👶', w: 1.5, cd: 25, who: { a: 'any' },
    title: '{a} had a baby! 👶',
    text: '{a} and their partner just had a beautiful baby! {a} is super tired and super happy.',
    choices: [
      { t: '🍼 Give 2 weeks of paid time off', fx: { a: 20, loyal: { a: 25 }, capacity: [0.95, 2, '{a} with the baby'], say: '{a} will never forget this. 🍼' } },
      { t: '🎁 Send a big baby gift basket', fx: { cash: -0.1, a: 12, team: 3, say: 'The basket had 200 diapers. Very useful. 🎁' } },
      { t: '🎈 Throw a baby party at work', fx: { cash: -0.1, team: 8, a: 10, say: 'The baby was the star. 🎈' } },
      { t: '⏰ "See you Monday!"', fx: { a: -12, team: -3, say: '{a} came back looking like a zombie. 🧟' } }
    ] });

  ev({ id: 'worker_wedding', cat: 'team', icon: '💍', w: 1.2, cd: 30, who: { a: 'any' },
    title: '{a} is getting married! 💍',
    text: '{a} is getting married next week and invited the whole team. That means the shop would be empty!',
    choices: [
      { t: '💒 Close and everyone goes!', fx: { closed: [1, 'Wedding'], team: 12, a: 20, say: 'You danced all night. Best wedding ever! 💒' } },
      { t: '🎁 Pay for their honeymoon', fx: { cash: -0.6, a: 20, loyal: { a: 30 }, say: '{a} sent a postcard from the beach. 🏝️' } },
      { t: '🍰 Make the wedding cake', fx: { cash: -0.1, a: 10, fans: 8, say: 'A cake with your logo on it. Free ad! 🍰' } },
      { t: '🙅 Only {a} can go', fx: { a: -5, team: -5, say: 'Everyone was sad they missed it. 🙅' } }
    ] });

  ev({ id: 'worker_jackpot', cat: 'team', icon: '🎰', rarity: 'rare', w: 0.8, cd: 50, who: { a: 'any' },
    title: '{a} won the lottery! 🎰', kind: 'chat', from: 'a',
    msgs: ['BOSS', 'I WON THE LOTTERY 🤑🤑🤑', 'like... A LOT', 'I don\'t need to work anymore lol'],
    choices: [
      { t: '🎉 "Congrats! Go live your dream!"', fx: { quit: 'a', rep: 2, say: '{a} left happy. They bought a boat. 🛥️' } },
      { t: '💼 "Invest it in our company!"', fx: { chance: { p: 0.5, win: { cash: 4, quit: 'a', say: '{a} invested! Then retired on a beach. 💼🏖️' }, lose: { quit: 'a', say: '{a} said "no thanks" and left. 😅' } } } },
      { t: '🙏 "Please stay! We need you!"', fx: { chance: { p: 0.35, win: { a: 20, say: '{a} stays because they LOVE the job! 🙏' }, lose: { quit: 'a', say: '{a} said "sorry boss" and left. 🙏' } } } },
      { t: '🤔 "Can I borrow some?"', fx: { chance: { p: 0.3, win: { cash: 1, say: '{a} gave the whole company a gift! 🤑' }, lose: { a: -10, say: '{a} left without saying bye. Awkward. 😬', quit: 'a' } } } }
    ] });

  ev({ id: 'sleepwalker', cat: 'funny', icon: '😴', w: 1.2, cd: 40, who: { a: 'any' },
    title: '{a} sleepwalks to work 😴',
    text: 'The security camera shows {a} walking into the shop at 3 AM in pajamas, making {unit}, and going home. Still asleep.',
    choices: [
      { t: '💵 Pay them for night work', fx: { money: -50, capacity: [1.05, 3, 'Sleep shift'], a: 5, say: '{a} makes the best {unit} while asleep. 😴' } },
      { t: '📹 Show {a} the video', fx: { team: 6, a: -3, say: '{a} was SHOCKED. The team couldn\'t stop laughing. 📹' } },
      { t: '🔑 Change the locks', fx: { a: 2, say: 'Now {a} sleeps at home. Probably. 🔑' } },
      { t: '📱 Post "Sleepy Worker of the Year"', fx: { chance: { p: 0.4, win: { viral: [1, 3], a: 5, say: 'The internet loves sleepy {a}! 📱' }, lose: { a: -8, say: '{a} was embarrassed. 😳' } } } }
    ] });

  ev({ id: 'friday_13', cat: 'team', icon: '🐈‍⬛', w: 1.2, cd: 40, who: { a: 'any' },
    title: 'Friday the 13th 🐈‍⬛',
    text: '{a} refuses to work today. "It\'s Friday the 13th! Something bad will happen!" A black cat is sitting outside...',
    choices: [
      { t: '🍀 Give {a} a lucky charm', fx: { a: 8, say: '{a} held the charm all day. Nothing bad happened! 🍀' } },
      { t: '🏠 Fine, stay home', fx: { a: 5, capacity: [0.95, 1, '{a} hiding at home'], say: '{a} hid under a blanket all day. 🏠' } },
      { t: '🐈‍⬛ Adopt the black cat', fx: { pet: '🐈‍⬛', fans: 8, a: -5, say: 'Now the "bad luck" cat lives here. Sales went UP. 🐈‍⬛' } },
      { t: '😤 "Superstitions aren\'t real!"', fx: { chance: { p: 0.5, win: { a: -2, say: '{a} worked. Nothing happened. See? 😤' }, lose: { cash: -0.2, a: -5, say: 'Then the coffee machine exploded. {a}: "TOLD YOU." 😱' } } } }
    ] });

  ev({ id: 'worker_allergic', cat: 'funny', icon: '🤧', w: 1.2, cd: 40, who: { a: 'front' },
    title: '{a} is allergic to {unit}?! 🤧',
    text: '{a} just found out they are allergic to {unit}. They sneeze 50 times a day. At work. Next to the {unit}.',
    choices: [
      { t: '😷 Buy them a cool mask', fx: { money: -30, a: 5, say: '{a} looks like a superhero now. 😷' } },
      { t: '🔀 Move {a} to another job', fx: { a: 10, capacity: [0.97, 4, '{a} moving'], say: '{a} works in the office now. No more sneezing! 🔀' } },
      { t: '💊 Pay for allergy medicine', fx: { cash: -0.05, a: 8, say: 'Sneezing: gone. {a}: happy. 💊' } },
      { t: '🤷 "Bless you!"', fx: { a: -8, happy: -3, say: 'ACHOO! Customers are backing away. 🤧' } }
    ] });

  ev({ id: 'worker_pirate', cat: 'funny', icon: '🏴‍☠️', w: 1.3, cd: 40, who: { a: 'funny' },
    title: '{a} talks like a pirate now 🏴‍☠️',
    text: '"ARRR! What be yer order, matey?" {a} watched a pirate movie and now only talks like a pirate. For 3 days now.',
    choices: [
      { t: '🏴‍☠️ Make it "Pirate Week"!', fx: { fans: 20, happy: 4, team: 6, say: 'Everyone talks like a pirate! Customers love it! ARRR! 🏴‍☠️' } },
      { t: '🛑 "Please talk normally"', fx: { a: -5, say: '"Aye aye, captain." ...Still a pirate. 🛑' } },
      { t: '🦜 Buy {a} a parrot', fx: { pet: '🦜', a: 12, fans: 10, say: 'The parrot says "ARRR" too now. 🦜' } },
      { t: '📱 Film "Pirate Worker" videos', fx: { chance: { p: 0.4, win: { viral: [1, 3], say: 'The pirate videos went viral! 📱🏴‍☠️' }, lose: { fans: 8, say: 'Some people liked it. ARRR. 📱' } } } }
    ] });

  ev({ id: 'worker_singer', cat: 'funny', icon: '🎶', w: 1.3, cd: 40, who: { a: 'front' },
    title: '{a} SINGS every order 🎶',
    text: '🎵 "One {unit} for the lady in blue! Coming right up just for yooouu!" 🎵 {a} sings every single order.',
    choices: [
      { t: '🎤 Give {a} a microphone', fx: { money: -40, fans: 15, happy: 4, a: 10, say: 'Customers come just to hear {a} sing! 🎤' } },
      { t: '🤫 "Please just... talk"', fx: { a: -8, say: '{a} now hums instead. Quietly. Sadly. 🤫' } },
      { t: '🎸 Start a shop band', fx: { team: 8, fans: 10, say: 'The band is called "{company} and the Receipts". 🎸' } },
      { t: '📺 Send {a} to a TV talent show', fx: { chance: { p: 0.3, win: { fans: 40, rep: 4, say: '{a} made it to the final! Everyone knows your shop now! 📺' }, lose: { a: -3, say: 'The judges said "no". {a} still sings at work. 📺' } } } }
    ] });

  ev({ id: 'worker_mustache', cat: 'funny', icon: '🥸', w: 1, cd: 50, who: { a: 'any' },
    title: '{a}\'s GIANT mustache 🥸',
    text: '{a} grew a mustache so big it curls up at the ends. Customers are taking selfies with it.',
    choices: [
      { t: '🏆 Enter a mustache contest', fx: { chance: { p: 0.5, win: { fans: 25, rep: 2, say: '{a} WON the national mustache contest! 🏆' }, lose: { fans: 8, say: '{a} got second place. Still majestic. 🥸' } } } },
      { t: '🥸 Fake mustaches for everyone', fx: { money: -30, team: 8, fans: 12, say: 'Mustache Monday is a thing now. 🥸' } },
      { t: '✂️ "It\'s getting in the {unit}"', fx: { a: -10, happy: 2, say: '{a} shaved it off. They are in mourning. ✂️' } },
      { t: '🖼️ Make it the new logo', fx: { fans: 15, a: 12, say: 'Your logo has a mustache now. Bold move. 🖼️' } }
    ] });

  ev({ id: 'worker_marathon', cat: 'team', icon: '🏃', w: 1.2, cd: 40, who: { a: 'any' },
    title: '{a} is running a marathon 🏃',
    text: '{a} is running a 42 km marathon for charity. They ask if the company will sponsor them.',
    choices: [
      { t: '👕 Sponsor them with your logo', fx: { cash: -0.2, fans: 12, rep: 3, a: 10, say: '{a} ran with your logo! It was on TV! 👕' } },
      { t: '🏃 The whole team runs too!', fx: { closed: [1, 'Marathon'], team: 12, rep: 5, fans: 15, say: 'Everyone finished! (Some walked. Slowly.) 🏃' } },
      { t: '📣 Cheer at the finish line', fx: { a: 8, team: 4, say: '{a} cried when they saw you. 📣' } },
      { t: '🙅 "We\'re too busy"', fx: { a: -6, say: '{a} ran anyway. Without you. 😞' } }
    ] });

  ev({ id: 'worker_side_hustle', cat: 'team', icon: '🧶', w: 1.3, cd: 35, who: { a: 'creative' },
    title: '{a} sells their own stuff at work 🧶',
    text: '{a} knits funny hats and sells them to YOUR customers, at YOUR counter, during work.',
    choices: [
      { t: '🤝 Sell the hats in your shop', fx: { extra: [0.15, 8, 'Funny hats'], a: 12, say: 'The hats are a hit! You share the money. 🤝' } },
      { t: '🛑 "Not during work!"', fx: { a: -6, say: '{a} sells them in the parking lot now. 🛑' } },
      { t: '🧢 Order hats for the whole team', fx: { money: -80, team: 8, a: 10, say: 'Everyone has matching funny hats now. 🧢' } },
      { t: '🚀 Help {a} start their own business', fx: { quit: 'a', rep: 6, say: '{a} opened a hat shop! They say you\'re the best boss ever. 🚀' } }
    ] });

  ev({ id: 'worker_invention', cat: 'team', icon: '⚙️', w: 1.2, cd: 40, who: { a: 'creative' },
    title: '{a} built a crazy machine ⚙️',
    text: '{a} built a machine out of a vacuum cleaner and a toaster. They say it makes work TWICE as fast. It is smoking a little.',
    choices: [
      { t: '🚀 Turn it on!', fx: { chance: { p: 0.5, win: { equip: 0.05, a: 10, say: 'IT WORKS! Everything is faster now! 🚀' }, lose: { cash: -0.4, say: 'BOOM! 💥 It exploded. Everyone is covered in toast crumbs.' } } } },
      { t: '🔬 Pay a real engineer to check it', fx: { cash: -0.3, equip: 0.03, a: 6, say: 'The engineer fixed it. It\'s great now! 🔬' } },
      { t: '💡 Patent it!', fx: { cash: -0.2, chance: { p: 0.3, win: { cash: 3, say: 'A big company bought the idea! 💡💰' }, lose: { say: 'Someone already invented it in 1987. 💡' } } } },
      { t: '🙅 "Please unplug that"', fx: { a: -6, say: '{a} is sad. The machine is now a plant pot. 🙅' } }
    ] });

  ev({ id: 'bring_kid_day', cat: 'team', icon: '🧒', w: 1.3, cd: 40, need: 3,
    title: 'Bring Your Kid to Work Day! 🧒',
    text: 'Your workers want to bring their kids to work for a day. That\'s about 9 kids in the shop.',
    choices: [
      { t: '🧒 Yes! Kids run the shop for a day', fx: { team: 10, fans: 20, happy: 3, capacity: [0.85, 1, 'Kids in charge'], say: 'A 6-year-old sold 40 {unit}. Hire them? 🧒' } },
      { t: '🎨 A kids\' art corner', fx: { cash: -0.1, team: 8, say: 'The walls are covered in drawings now. Beautiful. 🎨' } },
      { t: '🎓 Teach them about business', fx: { team: 6, rep: 4, say: 'One kid asked "Why don\'t you just print more money?" 🎓' } },
      { t: '🙅 "No kids, sorry"', fx: { team: -6, say: 'Your team is disappointed. 🙅' } }
    ] });

  ev({ id: 'pet_to_work', cat: 'team', icon: '🐕', w: 1.3, cd: 40, need: 3,
    title: 'Bring Your Pet to Work Day! 🐕',
    text: 'The team wants to bring their pets. There will be 3 dogs, 2 cats, a hamster and one very angry goose.',
    choices: [
      { t: '🐾 YES! Pet party!', fx: { team: 12, fans: 20, chance: { p: 0.6, win: { say: 'Pure joy all day! 🐾' }, lose: { cash: -0.2, say: 'The goose attacked a customer. Classic goose. 🪿' } } } },
      { t: '🐶 Only dogs', fx: { team: 5, fans: 8, say: 'Good boys everywhere. 🐶' } },
      { t: '📸 Pet photo contest for customers', fx: { fans: 25, happy: 3, say: 'People sent 500 pet photos! 📸' } },
      { t: '🙅 "No pets!"', fx: { team: -5, say: 'The goose will remember this. 🪿' } }
    ] });

  ev({ id: 'worker_exam', cat: 'team', icon: '📚', w: 1.3, cd: 30, who: { a: 'new' }, kind: 'chat', from: 'a',
    msgs: ['boss can I ask something', 'I have a BIG exam next week 📚', 'can I have 3 days off to study?? 🙏'],
    title: '{a} has a big exam',
    choices: [
      { t: '📚 "Take the whole week, good luck!"', fx: { a: 15, loyal: { a: 20 }, capacity: [0.95, 1, '{a} studying'], say: '{a} got an A+! 📚' } },
      { t: '🧠 "Study here during slow hours"', fx: { a: 8, skill: { a: 3 }, say: '{a} studied between customers. Smart! 🧠' } },
      { t: '🍕 "I\'ll help you study!"', fx: { a: 12, team: 3, say: 'You quizzed {a} all week. They passed! 🍕' } },
      { t: '🙅 "Work comes first"', fx: { a: -12, say: '{a} failed the exam. They blame you. 😞' } }
    ] });

  ev({ id: 'worker_gamer', cat: 'team', icon: '🎮', w: 1.2, cd: 40, who: { a: 'any' },
    title: '{a} is secretly a gaming champion 🎮',
    text: 'Customers keep asking for {a}\'s autograph. Turns out {a} is the #3 ranked player in the world in a popular game!',
    choices: [
      { t: '🎮 Sponsor {a} with your logo', fx: { cash: -0.3, fans: 30, a: 12, say: 'Millions of gamers see your logo now! 🎮' } },
      { t: '🕹️ Host a gaming night at the shop', fx: { cash: -0.2, fans: 20, extra: [0.15, 1, 'Gaming night'], say: 'The shop was full of gamers all night! 🕹️' } },
      { t: '🏆 Challenge {a} to a match', fx: { chance: { p: 0.1, win: { fans: 40, say: 'YOU WON?! Nobody believes it. 🏆' }, lose: { team: 6, say: 'You lost 50-0. The team saw everything. 😂' } } } },
      { t: '💼 "Focus on work please"', fx: { a: -5, say: '{a} sighs and serves another {unit}. 💼' } }
    ] });

  // =====================================================================
  // 😎 THE BOSS'S LIFE
  // =====================================================================

  ev({ id: 'boss_dance_viral', cat: 'boss', icon: '🕺', w: 1.3, cd: 40,
    title: 'Your dance went viral 🕺',
    text: 'You thought nobody was watching when you danced behind the counter. A customer filmed it. 3 million views.',
    choices: [
      { t: '🕺 Do a new dance every week', fx: { fans: 30, team: 5, say: '"Boss Dance Friday" is the best thing online! 🕺' } },
      { t: '🎓 Take real dance lessons', fx: { cash: -0.1, fans: 15, say: 'Now you\'re actually good. People are confused. 🎓' } },
      { t: '🙈 Hide for a week', fx: { fans: 5, say: 'The internet found you anyway. 🙈' } },
      { t: '👕 Sell "Dancing Boss" shirts', fx: { extra: [0.2, 4, 'Dancing Boss shirts'], fans: 12, say: 'The shirts sold out! 👕' } }
    ] });

  ev({ id: 'boss_locked_out', cat: 'boss', icon: '🔑', w: 1.5, cd: 30,
    title: 'You locked yourself out! 🔑',
    text: 'It\'s 7 AM, customers are waiting... and your keys are INSIDE the shop. Nobody else has a key.',
    choices: [
      { t: '🔧 Call a locksmith', fx: { cash: -0.1, demand: [0.95, 1, 'Late opening'], say: 'The locksmith took 2 hours. The customers waited. 🔧' } },
      { t: '🪟 Climb in through the window', fx: { chance: { p: 0.6, win: { fans: 10, say: 'You got in like a ninja! Customers clapped. 🪟' }, lose: { cash: -0.2, rep: -1, say: 'You got stuck halfway. The fire department came. 🚒' } } } },
      { t: '☕ Sell {unit} from the sidewalk', fx: { fans: 15, rep: 2, say: '"Sidewalk Day" was so fun customers want it again! ☕' } },
      { t: '😴 Go back to bed', fx: { closed: [1, 'Boss locked out'], say: 'You took a surprise day off. Honestly? Nice. 😴' } }
    ] });

  ev({ id: 'boss_haircut', cat: 'boss', icon: '💇', w: 1.3, cd: 40,
    title: 'The WORST haircut ever 💇',
    text: 'You got a haircut and it looks like a bird\'s nest had an accident. You have a big meeting today.',
    choices: [
      { t: '🧢 Wear a hat all week', fx: { say: 'Nobody noticed. The hat stays on forever. 🧢' } },
      { t: '😎 Own it! "It\'s a new style"', fx: { chance: { p: 0.5, win: { fans: 15, say: 'Teenagers are copying your haircut! 😎' }, lose: { team: 4, say: 'The team took secret photos. 📸😂' } } } },
      { t: '💸 Pay for an emergency fix', fx: { money: -80, say: 'Fixed. Mostly. 💸' } },
      { t: '🏠 Work from home', fx: { team: 3, say: 'The team had a relaxing day without you. Hmm. 🏠' } }
    ] });

  ev({ id: 'boss_tv_live', cat: 'boss', icon: '🎙️', w: 1.2, cd: 40,
    title: 'Live TV interview... you froze 🎙️',
    text: 'You\'re on live TV. The reporter asks: "Why is your {industry} the best?" Your mind goes COMPLETELY blank.',
    choices: [
      { t: '🎤 Sing the company jingle', fx: { chance: { p: 0.5, win: { fans: 30, say: 'People can\'t stop singing it! 🎤' }, lose: { rep: -2, fans: 10, say: 'There is no company jingle. You made one up. Badly. 😬' } } } },
      { t: '🍩 Hold up your best {unit}', fx: { fans: 15, rep: 2, say: 'The {unit} spoke for itself! 🍩' } },
      { t: '😅 "...Because we are."', fx: { fans: 8, say: 'It became a meme. "Because we are." 😅' } },
      { t: '🏃 Run off camera', fx: { rep: -3, fans: 20, say: 'Everyone saw you run. Everyone. 🏃' } }
    ] });

  ev({ id: 'boss_vacation', cat: 'boss', icon: '🏝️', w: 1.2, cd: 40, minWeek: 10,
    title: 'You REALLY need a vacation 🏝️',
    text: 'You haven\'t had a day off in months. Your eyes are twitching. Your friend says: "Come to the beach!"',
    choices: [
      { t: '🏝️ Go for a whole week!', fx: { chance: { p: 0.6, win: { team: 6, rep: 2, say: 'You came back relaxed and the team did great without you! 🏝️' }, lose: { cash: -0.5, say: 'You came back and the shop was a MESS. 😱' } } } },
      { t: '📱 Go, but work from the beach', fx: { team: -3, fans: 5, say: 'You answered 200 emails from a beach chair. 📱🏖️' } },
      { t: '🏕️ A short weekend trip', fx: { team: 2, say: 'Just enough rest. 🏕️' } },
      { t: '💼 "No time for vacation!"', fx: { team: -4, say: 'The twitching got worse. 💼😵' } }
    ] });

  ev({ id: 'boss_sick', cat: 'boss', icon: '🤒', w: 1.2, cd: 30,
    title: 'You are SO sick 🤒',
    text: 'Fever, sneezing, a nose like a tomato. You feel terrible. But it\'s a busy week!',
    choices: [
      { t: '🛌 Stay home and rest', fx: { chance: { p: 0.7, win: { team: 4, say: 'The team handled it! You feel great now. 🛌' }, lose: { demand: [0.92, 1, 'Boss sick'], say: 'Things were a bit messy without you. 🛌' } } } },
      { t: '😷 Go to work anyway', fx: { team: -6, say: 'Now HALF the team is sick too. Oops. 😷' } },
      { t: '📱 Boss from bed by video', fx: { fans: 5, say: 'You ran the shop in pajamas. 📱' } },
      { t: '🍲 Ask your grandma for magic soup', fx: { team: 2, say: 'You were better in one day! Grandma is a wizard. 🍲' } }
    ] });

  ev({ id: 'boss_parents', cat: 'boss', icon: '👵', w: 1.2, cd: 40,
    title: 'Your parents came to visit 👵👴',
    text: 'Your parents showed up at the shop and are showing EVERYONE your baby photos. Including customers.',
    choices: [
      { t: '👶 Let them. It\'s cute.', fx: { fans: 10, team: 6, say: 'The team named you "Baby Boss" forever now. 👶' } },
      { t: '🍰 Give them free {unit} to distract them', fx: { money: -10, say: 'Mom said it was "a bit too salty". Thanks, Mom. 🍰' } },
      { t: '🧑‍🍳 Put them to work!', fx: { capacity: [1.05, 1, 'Parents helping'], team: 4, say: 'Your dad was a GREAT worker. Better than you. 🧑‍🍳' } },
      { t: '😳 Hide in the storage room', fx: { team: 3, say: 'They found you. They always find you. 😳' } }
    ] });

  ev({ id: 'school_talk', cat: 'boss', icon: '🏫', w: 1.2, cd: 40,
    title: 'A school wants you to give a talk 🏫',
    text: 'The local school asks you to talk to the kids about running a company!',
    choices: [
      { t: '🎤 Give an amazing speech', fx: { rep: 4, fans: 10, say: 'The kids clapped! One wants to be "a boss like you". 🎤' } },
      { t: '🍭 Bring free {unit} for everyone', fx: { cash: -0.1, rep: 3, fans: 15, say: 'You are the most popular person in that school now. 🍭' } },
      { t: '💼 Offer internships to teens', fx: { hireSpecial: { role: 'front', skill: 40 }, rep: 5, say: 'A smart teen joined your team! 💼' } },
      { t: '😰 Too scared of public speaking', fx: { say: 'You sent a video instead. The kids fell asleep. 😴' } }
    ] });

  ev({ id: 'boss_birthday', cat: 'boss', icon: '🎂', w: 1.3, cd: 52,
    title: 'Surprise! It\'s your birthday! 🎂',
    text: 'You walk in and the lights are off. SURPRISE! The team threw you a birthday party!',
    choices: [
      { t: '😭 Cry happy tears', fx: { team: 10, say: 'Everyone hugged you. Best team ever. 😭❤️' } },
      { t: '🎁 Give everyone a gift too', fx: { cash: -0.2, team: 12, say: 'It\'s everyone\'s birthday now! 🎁' } },
      { t: '💃 Dance on the table', fx: { team: 8, fans: 10, chance: { p: 0.7, win: { say: 'Legendary dance moves! 💃' }, lose: { cash: -0.1, say: 'The table broke. 😂' } } } },
      { t: '💼 "Okay, back to work!"', fx: { team: -8, say: 'The cake is sad. The team is sad. 🎂😞' } }
    ] });

  ev({ id: 'boss_lost_phone', cat: 'boss', icon: '📱', w: 1.2, cd: 35,
    title: 'You lost your phone! 📱',
    text: 'All your contacts, passwords and 4,000 photos of {unit} are on that phone. It\'s gone!',
    choices: [
      { t: '🔍 Search the whole shop', fx: { chance: { p: 0.6, win: { say: 'It was in the fridge. Why was it in the fridge? 📱❄️' }, lose: { money: -500, say: 'It\'s really gone. New phone time. 📱' } } } },
      { t: '📢 Ask customers to help look', fx: { fans: 8, chance: { p: 0.7, win: { rep: 2, say: 'A kid found it under a table! Free {unit} for life! 📢' }, lose: { say: 'Nobody found it. 😩' } } } },
      { t: '📵 Enjoy life without a phone', fx: { team: 5, say: 'You talked to real people all week. It was weird. And nice. 📵' } },
      { t: '💸 Buy the newest, fanciest phone', fx: { money: -1200, say: 'It has 7 cameras. You use none of them. 💸' } }
    ] });

  // =====================================================================
  // ✨ MORE LUCKY AND WEIRD
  // =====================================================================

  ev({ id: 'double_rainbow', cat: 'lucky', icon: '🌈', w: 1, cd: 50,
    title: 'A double rainbow over your shop! 🌈',
    text: 'A double rainbow ends RIGHT on top of your shop. Hundreds of people are taking photos.',
    choices: [
      { t: '📸 Offer free rainbow photos', fx: { fans: 25, say: 'Your shop is in every photo in {city} today! 📸' } },
      { t: '🌈 "Rainbow {unit}" for one day', fx: { extra: [0.3, 1, 'Rainbow special'], fans: 10, say: 'Rainbow {unit} sold out! 🌈' } },
      { t: '⛏️ Dig for the pot of gold', fx: { chance: { p: 0.1, win: { cash: 5, say: 'THERE WAS GOLD?! 🪙🪙🪙' }, lose: { cash: -0.1, say: 'You dug a hole in the sidewalk. No gold. A fine. ⛏️' } } } },
      { t: '🙂 Just enjoy it', fx: { team: 4, say: 'Everyone stopped for a moment. Beautiful. 🌈' } }
    ] });

  ev({ id: 'lost_wallet', cat: 'customers', icon: '👛', w: 1.5, cd: 30, who: { a: 'front' },
    title: '{a} found a wallet with $5,000! 👛',
    text: '{a} found a wallet under a table. There\'s $5,000 inside and an ID card.',
    choices: [
      { t: '📞 Call the owner', fx: { rep: 5, chance: { p: 0.5, win: { cash: 0.5, say: 'The owner gave you a reward! And became a regular. 📞' }, lose: { say: 'The owner said thanks and left. Being honest feels good. 😊' } } } },
      { t: '👮 Give it to the police', fx: { rep: 3, say: 'The police said: "Wow, honest people!" 👮' } },
      { t: '🏅 Praise {a} for being honest', fx: { a: 10, loyal: { a: 10 }, rep: 3, say: '{a} feels proud. 🏅' } },
      { t: '🤫 Keep it', fx: { money: 5000, rep: -8, team: -8, say: 'The owner saw it on camera. Everyone knows now. Bad move. 😬' } }
    ] });

  ev({ id: 'influencer_fight', cat: 'social', icon: '🤳', w: 1.2, cd: 35,
    title: 'Two influencers are fighting in your shop 🤳',
    text: 'Two famous influencers are arguing about who gets the best table for their photos. Both have millions of fans.',
    choices: [
      { t: '🪑 Give them each a "best table"', fx: { cash: -0.1, fans: 30, say: 'Both posted about your shop! Double fans! 🪑' } },
      { t: '🎥 Film a "who is right?" video', fx: { chance: { p: 0.45, win: { viral: [1, 4], say: 'Millions voted! Your shop is famous! 🎥' }, lose: { rep: -3, say: 'Both influencers were mad at you. 😬' } } } },
      { t: '🚪 Ask them both to leave', fx: { rep: -2, fans: -5, say: 'They both posted bad things about you. Oops. 🚪' } },
      { t: '🤝 Make them do a collab', fx: { fans: 25, rep: 2, say: 'They became friends in YOUR shop! 🤝' } }
    ] });

  ev({ id: 'robot_register', cat: 'weird', icon: '🤖', rarity: 'rare', w: 0.7, cd: 80,
    title: 'The cash register is ALIVE 🤖',
    text: 'After an update, the cash register started talking: "HELLO HUMAN. I WOULD LIKE A RAISE."',
    choices: [
      { t: '💵 Give the register a raise', fx: { money: -50, team: 5, fans: 15, say: '"THANK YOU HUMAN." It now tells jokes to customers. 🤖' } },
      { t: '🔌 Unplug it immediately', fx: { say: '"NOOOOoooo..." Silence. 🔌' } },
      { t: '🤝 Make it employee of the month', fx: { fans: 25, team: -3, say: 'The team is jealous of a cash register. 🤝🤖' } },
      { t: '📺 Call the news', fx: { fans: 30, rep: 2, say: '"World\'s first talking cash register!" It\'s on every channel! 📺' } }
    ] });

  ev({ id: 'dino_egg', cat: 'weird', icon: '🥚', rarity: 'epic', w: 0.4, cd: 100,
    title: 'A giant egg is hatching?! 🥚',
    text: 'A delivery box had a giant egg inside. It\'s warm. It\'s cracking. Something is inside.',
    choices: [
      { t: '👀 Wait and watch', fx: { chance: { p: 0.5, win: { pet: '🦖', fans: 50, say: 'A BABY DINOSAUR?! It lives in the shop now! 🦖' }, lose: { pet: '🐔', fans: 10, say: 'It was a very big chicken. 🐔' } } } },
      { t: '🔬 Call the scientists', fx: { rep: 5, fans: 20, say: 'The scientists took it to the lab. Your shop is famous! 🔬' } },
      { t: '🍳 Make the world\'s biggest omelet', fx: { fans: 15, say: 'Nobody wanted to eat it. 🍳' } },
      { t: '📦 Send it back', fx: { say: 'You\'ll never know what it was. 📦' } }
    ] });

  ev({ id: 'free_money_bug', cat: 'lucky', icon: '🧾', w: 1, cd: 40,
    title: 'The card machine has a bug! 🧾',
    text: 'The card machine is charging customers DOUBLE by mistake! Nobody has noticed yet.',
    choices: [
      { t: '💳 Fix it and pay everyone back', fx: { rep: 6, cash: -0.1, say: 'Customers were impressed you were honest! 💳' } },
      { t: '🔧 Just fix it quietly', fx: { cash: 0.5, say: 'Fixed. Nobody noticed. 🔧' } },
      { t: '🤫 Leave it for a week', fx: { cash: 1.5, chance: { p: 0.5, win: { say: 'Nobody noticed. 😬' }, lose: { rep: -10, happy: -8, cash: -0.8, say: 'A customer noticed and posted it online. DISASTER. 😱' } } } },
      { t: '🎁 Give everyone a free {unit} to say sorry', fx: { cash: -0.3, rep: 4, happy: 5, say: 'Customers loved the free {unit}! 🎁' } }
    ] });

  ev({ id: 'heat_ac_broken', cat: 'trouble', icon: '🥵', w: 1.5, cd: 25, cond: H.season(22, 36),
    title: 'The air conditioning broke! 🥵',
    text: 'It\'s 38°C outside and the air conditioning just died. The shop is like an oven.',
    choices: [
      { t: '🔧 Emergency repair', fx: { cash: -0.4, say: 'Cool air is back! Everyone cheered. 🔧' } },
      { t: '🌊 Water balloon fight outside!', fx: { team: 10, fans: 15, say: 'Customers joined in! Nobody bought anything but it was FUN. 🌊' } },
      { t: '🍦 Free ice for everyone', fx: { cash: -0.1, happy: 4, say: 'Ice cubes saved the day. 🍦' } },
      { t: '🥵 Just sweat it out', fx: { team: -6, happy: -5, say: 'Everyone is melting. 🥵' } }
    ] });

  ev({ id: 'snow_day', cat: 'world', icon: '☃️', w: 1.5, cd: 25, cond: H.season(1, 8),
    title: 'Giant snow day! ☃️',
    text: 'It snowed so much that the door is blocked. Nobody can get in or out!',
    choices: [
      { t: '⛄ Build a snowman army outside', fx: { team: 8, fans: 15, say: 'Twenty snowmen in your colors. The news came! ⛄' } },
      { t: '🛷 Deliver {unit} by sled', fx: { fans: 20, extra: [0.2, 1, 'Sled delivery'], say: 'Sled delivery! People loved it! 🛷' } },
      { t: '🏠 Everyone stays home', fx: { closed: [1, 'Snow day'], team: 8, say: 'A cozy day off for everyone. ☃️' } },
      { t: '🪏 Shovel for hours', fx: { team: -3, say: 'You opened at 3 PM. Your back hurts. 🪏' } }
    ] });

  ev({ id: 'april_fools', cat: 'funny', icon: '🃏', w: 1.5, cd: 50, cond: H.season(13, 14),
    title: 'April Fools\' prank ideas 🃏',
    text: 'It\'s April Fools\' Day! The team wants to prank the customers. Which prank?',
    choices: [
      { t: '🧂 Swap the sugar and salt', fx: { happy: -4, fans: 8, say: 'Customers were NOT amused. The team was. 🧂' } },
      { t: '📢 "Everything is FREE today!" (it isn\'t)', fx: { chance: { p: 0.5, win: { fans: 20, say: 'People laughed and bought stuff anyway! 📢' }, lose: { rep: -5, say: 'People got really angry. Bad prank! 😡' } } } },
      { t: '🐒 "We sell {unit} made by monkeys now"', fx: { fans: 25, say: 'Half the town believed it. The other half wanted to meet the monkeys. 🐒' } },
      { t: '🙅 No pranks', fx: { say: 'Boring. But safe. 🙅' } }
    ] });

  ev({ id: 'halloween_night', cat: 'customers', icon: '🎃', w: 2, cd: 45, cond: H.season(43, 44),
    title: 'Halloween night! 🎃',
    text: 'Hundreds of kids in costumes are walking past your shop. They want candy!',
    choices: [
      { t: '🍬 Give candy to every kid', fx: { cash: -0.2, fans: 20, rep: 3, say: 'You were the most popular shop on the street! 🍬' } },
      { t: '👻 Turn the shop into a haunted house', fx: { cash: -0.4, fans: 35, extra: [0.3, 1, 'Haunted house'], say: 'The line was 2 blocks long! 👻' } },
      { t: '🧛 The whole team dresses up', fx: { team: 8, fans: 12, say: 'A vampire served {unit} all night. 🧛' } },
      { t: '🔒 Close and turn off the lights', fx: { rep: -2, say: 'Someone threw eggs at your door. 🥚' } }
    ] });

  ev({ id: 'new_year_party', cat: 'customers', icon: '🎆', w: 2, cd: 45, cond: H.season(52, 52),
    title: 'New Year\'s Eve! 🎆',
    text: 'It\'s the last night of the year! Everyone in {city} is going out to party.',
    choices: [
      { t: '🎆 Throw a New Year party', fx: { cash: -0.4, fans: 25, team: 8, extra: [0.4, 1, 'NYE party'], say: '10... 9... 8... HAPPY NEW YEAR! 🎆' } },
      { t: '⏰ Stay open all night', fx: { demand: [1.3, 1, 'New Year rush'], team: -5, say: 'Busiest night ever! Everyone is exhausted. ⏰' } },
      { t: '🎁 Give the team a New Year bonus', fx: { teamBonus: true, team: 12, say: 'Best way to start the year! 🎁' } },
      { t: '🛌 Close early and sleep', fx: { closed: [1, 'Holiday'], team: 5, say: 'You slept through midnight. 🛌' } }
    ] });

  ev({ id: 'valentines', cat: 'customers', icon: '💘', w: 2, cd: 45, cond: H.season(7, 7), init: rival,
    title: 'Valentine\'s Day! 💘',
    text: 'Couples are everywhere! Everything is pink and red. How will you celebrate?',
    choices: [
      { t: '💘 Heart-shaped {unit}', fx: { extra: [0.3, 1, 'Heart specials'], fans: 10, say: 'Everyone wanted heart-shaped {unit}! 💘' } },
      { t: '🕯️ Romantic candles on every table', fx: { cash: -0.1, happy: 5, say: 'So romantic. Two people got engaged! 🕯️' } },
      { t: '💔 "Singles Party" for lonely people', fx: { fans: 20, happy: 4, say: 'The singles party was MORE fun. 💔🎉' } },
      { t: '🙅 Just a normal day', fx: { rival: 0.03, say: 'Couples went to {rival} instead. Oh well.' } }
    ] });

  ev({ id: 'lucky_penny', cat: 'lucky', icon: '🪙', w: 1.5, cd: 30, who: { a: 'any' },
    title: '{a} found a very old coin 🪙',
    text: '{a} found a strange old coin on the floor. It looks really, REALLY old.',
    choices: [
      { t: '🏛️ Get it checked by an expert', fx: { cash: -0.05, chance: { p: 0.4, win: { cash: 2.5, say: 'It\'s from ancient Rome! Worth a fortune! 🏛️' }, lose: { say: 'It\'s from a board game. 🎲' } } } },
      { t: '🍀 Keep it as a lucky coin', fx: { team: 4, say: 'The lucky coin is glued to the counter now. 🍀' } },
      { t: '🎁 Let {a} keep it', fx: { a: 10, say: '{a} made it into a necklace. 🎁' } },
      { t: '🛒 Buy a snack with it', fx: { say: 'The vending machine ate it. 🛒' } }
    ] });

  ev({ id: 'traffic_jam', cat: 'world', icon: '🚗', w: 1.5, cd: 25,
    title: 'Huge traffic jam outside 🚗',
    text: 'The road outside is completely stuck. Hundreds of people are sitting in their cars, bored and hungry.',
    choices: [
      { t: '🛼 Sell {unit} car to car on skates', fx: { extra: [0.35, 1, 'Traffic jam sales'], fans: 12, say: 'You sold to 200 cars! 🛼' } },
      { t: '🎵 Play music for the stuck drivers', fx: { fans: 15, rep: 2, say: 'A giant traffic jam dance party! 🎵' } },
      { t: '📱 Post "Stuck? Come in!"', fx: { demand: [1.15, 1, 'Traffic jam'], say: 'Lots of drivers parked and came in! 📱' } },
      { t: '😒 Close the blinds', fx: { say: 'The honking went on all day. 😒' } }
    ] });

  ev({ id: 'surprise_inspection_food', cat: 'business', icon: '📋', w: 1.5, cd: 30,
    title: 'A secret health check! 📋',
    text: 'A health inspector walks in with a clipboard. You have 5 minutes before they check everything!',
    choices: [
      { t: '🧽 Clean like crazy!', fx: { chance: { p: 0.7, win: { rep: 5, say: 'PERFECT score! A+! 📋✨' }, lose: { rep: -2, say: 'They found a sock behind the fridge. B-. 🧦' } } } },
      { t: '☕ Offer the inspector a free {unit}', fx: { chance: { p: 0.4, win: { rep: 2, say: 'They smiled and gave you a good score. ☕' }, lose: { rep: -5, cash: -0.3, say: '"Is that a bribe?" Oh no. Fine! 😬' } } } },
      { t: '😎 "We\'re always clean"', fx: { chance: { p: 0.5, win: { rep: 4, say: 'You really were! A! 😎' }, lose: { rep: -4, closed: [1, 'Health check fail'], say: 'They found a mouse. Closed for a day. 🐭' } } } },
      { t: '🏃 Hide the messy stuff', fx: { chance: { p: 0.5, win: { rep: 2, say: 'They didn\'t check the closet! Phew. 🏃' }, lose: { rep: -6, say: 'They checked the closet. 😱' } } } }
    ] });
})();
