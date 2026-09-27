// All events, part 3: rival showdowns, extra-fun events and events for specific kinds of company.
// See the top of events.js for the event format. Every question has exactly 4 responses.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var U = CS.U, G = CS.G, H = CS.EVH, ev = CS.ev;
  var rival = H.rival, amt = H.amt, tag = H.tag;

  // =====================================================================
  // 🥊 RIVALS
  // =====================================================================

  ev({ id: 'rival_copy_logo', cat: 'rivals', icon: '🎨', w: 2.5, cd: 20, minWeek: 4, init: rival,
    title: '{rival} copied your logo!',
    text: '{rival}\'s new logo looks EXACTLY like yours. Just in a different color. 😤',
    choices: [
      { t: '⚖️ Sue them', fx: { cash: -0.8, chance: { p: 0.6, win: { cash: 1.5, rival: -0.12, say: 'You won! They must change it. ⚖️🎉' }, lose: { say: 'The judge said "it\'s a different color". 😑' } } } },
      { t: '😂 Post a "spot the difference" game', fx: { fans: 18, rival: -0.05, say: 'Everyone is laughing at {rival}! 😂' } },
      { t: '✨ Make your logo even cooler', fx: { cash: -0.3, fans: 12, rep: 2, say: 'Your new logo is SO cool. Copy THAT! ✨' } },
      { t: '🤷 Ignore it', fx: { rival: 0.05, demand: [0.95, 3, 'Confused customers'], say: 'Some customers went to the wrong shop. 😵' } }
    ] });

  ev({ id: 'rival_mascot_battle', cat: 'rivals', icon: '🐻', w: 2.5, cd: 16, minWeek: 5, init: rival,
    title: 'Mascot dance battle!',
    text: '{rival}\'s mascot showed up outside your shop and started a DANCE BATTLE. A crowd is watching! 🕺🐻',
    choices: [
      { t: '🕺 YOU dance back!', fx: { chance: { p: 0.5, win: { fans: 25, rival: -0.1, say: 'Your moonwalk won the crowd! 🕺👑' }, lose: { fans: 8, say: 'You slipped. The crowd still clapped. 😅' } } } },
      { t: '🎵 Bring a speaker + DJ', fx: { money: -80, fans: 20, rival: -0.08, say: 'The street became a dance party! 🎵🎉' } },
      { t: '🐔 Send your worker in a chicken suit', fx: { team: 5, fans: 15, say: 'The chicken won. Nobody knows how. 🐔🏆' } },
      { t: '🙈 Stay inside', fx: { rival: 0.06, say: '{rival} got all the attention today. 😒' } }
    ] });

  ev({ id: 'rival_buyout', cat: 'rivals', icon: '💼', w: 1.2, cd: 30, minWeek: 20, init: rival,
    title: '{rival} wants to BUY you!',
    text: '{rival}\'s boss offers to buy {company}. You would get lots of money, but you would lose your company! 😱',
    choices: [
      { t: '😂 "YOU want to buy ME?"', fx: { rep: 2, fans: 10, say: 'You laughed so hard they left. 😂' } },
      { t: '🔄 "No. I\'ll buy YOU!"', fx: { cash: -3, rival: -0.5, demand: [1.2, 16, 'Bought a rival\'s shops'], say: 'You bought half of {rival}\'s shops! 🏪🏪' } },
      { t: '🤝 "Let\'s work together instead"', fx: { rival: -0.05, extra: [0.15, 8, 'Partner deal'], say: 'A partnership! Money for both. 🤝' } },
      { t: '🙅 "Never!"', fx: { team: 5, say: 'Your team cheers! "We\'re not for sale!" 💪' } }
    ] });

  ev({ id: 'rival_roast', cat: 'rivals', icon: '🔥', w: 2.5, cd: 12, minWeek: 3, init: rival,
    title: '{rival} roasted you online!',
    text: '{rival} posted: "{company}? More like {company} Snooze. 😴" People are laughing!',
    choices: [
      { t: '🔥 Roast them back', fx: { chance: { p: 0.55, win: { fans: 25, rival: -0.1, say: 'Your roast was LEGENDARY. They deleted their post. 🔥😎' }, lose: { rep: -3, fans: 5, say: 'Your roast was weak. People roasted YOU. 🥶' } } } },
      { t: '💖 Reply with kindness', fx: { rep: 4, fans: 10, say: '"We love you too, {rival}! 💖" People think you\'re so classy.' } },
      { t: '🎥 Post a funny video reply', fx: { fans: 18, say: 'Your team acted out a sleepy skit. It was hilarious. 😴🎥' } },
      { t: '🙈 Ignore it', fx: { rival: 0.04, say: 'It fades away... slowly. 😐' } }
    ] });

  ev({ id: 'rival_cookoff', cat: 'rivals', icon: '📺', w: 2, cd: 16, minWeek: 6, init: rival,
    title: 'TV challenge vs {rival}!',
    text: 'A TV show wants {company} and {rival} to compete LIVE! Who makes the best {unit}? 📺🏆',
    choices: [
      { t: '🌟 Send your best worker', fx: { chance: { p: function (g) { var b = 0; g.employees.forEach(function (e) { b = Math.max(b, e.skill); }); return 0.2 + b / 130; }, win: { fans: 40, rep: 5, rival: -0.15, demand: [1.15, 4, 'TV champion'], say: 'YOU WON ON TV! 🏆📺' }, lose: { fans: 10, rival: 0.05, say: 'So close! {rival} won this time. 😖' } } } },
      { t: '👔 Do it yourself', fx: { chance: { p: 0.5, win: { fans: 45, rep: 6, rival: -0.15, say: 'The boss WON! Everyone chanted your name! 🏆' }, lose: { fans: 12, say: 'You dropped everything on live TV. Iconic. 😂📺' } } } },
      { t: '🤫 Bribe the judges', fx: { cash: -0.4, chance: { p: 0.4, win: { fans: 30, rival: -0.1, say: 'You won... but you feel weird about it. 😬🏆' }, lose: { rep: -15, fans: 20, say: 'CAUGHT ON CAMERA. Scandal! 😱📺' } } } },
      { t: '🙅 Say no', fx: { rival: 0.05, say: '{rival} won by default. 😒' } }
    ] });

  ev({ id: 'rival_freebies', cat: 'rivals', icon: '🎁', w: 2.5, cd: 12, minWeek: 5, init: rival,
    title: '{rival} gives free stuff to YOUR customers!',
    text: '{rival} is standing outside your door handing out free samples! 😡',
    choices: [
      { t: '🎁 Give out BETTER free stuff', fx: { cash: -0.3, fans: 10, rival: -0.06, say: 'Your free stuff was way better! 🎁😎' } },
      { t: '💳 Loyalty points for everyone', fx: { cash: -0.2, happy: 5, say: 'Your customers stay loyal! 💳❤️' } },
      { t: '📢 Talk to them nicely', fx: { chance: { p: 0.5, win: { say: 'They agreed to move across the street. 🤝' }, lose: { demand: [0.93, 2, 'Rival freebies'], say: 'They laughed and stayed. 😤' } } } },
      { t: '🤷 Let them', fx: { demand: [0.9, 3, 'Rival freebies'], rival: 0.06, say: 'Some customers left with their free stuff. 😒' } }
    ] });

  ev({ id: 'rival_van_crash', cat: 'rivals', icon: '🚐', w: 1.5, cd: 25, init: rival,
    title: 'Your van crashed into {rival}\'s!',
    text: 'Your delivery van and {rival}\'s van bumped into each other. Nobody is hurt, but both drivers are yelling! 🚐💥🚐',
    choices: [
      { t: '🤝 Split the repair costs', fx: { cash: -0.2, rep: 2, say: 'Fair and friendly. 🤝' } },
      { t: '😤 Blame them!', fx: { chance: { p: 0.5, win: { cash: 0.1, say: 'The camera showed it was THEIR fault! 📹' }, lose: { cash: -0.4, rep: -2, say: 'Oops. It was YOUR fault. 😬' } } } },
      { t: '🎥 Make a funny video together', fx: { fans: 20, rival: -0.02, say: '"Rivals crash, then dance" went viral. 🚐💃' } },
      { t: '🧾 Just pay for everything', fx: { cash: -0.4, rep: 4, say: 'Everyone says you\'re very nice. 😇' } }
    ] });

  ev({ id: 'rival_flooded', cat: 'rivals', icon: '🆘', w: 1.2, cd: 30, init: rival,
    title: '{rival} needs YOUR help!',
    text: '{rival}\'s shop flooded! Their boss is asking if they can use your storage room. 😮',
    choices: [
      { t: '❤️ Help them for free', fx: { rep: 8, fans: 15, rival: -0.05, say: 'Everyone says "{company} is SO kind!" ❤️' } },
      { t: '💰 Rent it to them', fx: { cash: 0.5, say: 'Business is business! 💰' } },
      { t: '🤝 Help, but they owe you a favor', fx: { rep: 4, rival: -0.08, say: 'They owe you BIG now. 😏' } },
      { t: '😈 Say no', fx: { rival: -0.1, rep: -4, say: 'Harsh! Some people think you\'re mean. 😬' } }
    ] });

  ev({ id: 'rival_lunch', cat: 'rivals', icon: '🍽️', kind: 'chat', w: 1.5, cd: 20, init: function (g, c) { rival(g, c); c.rboss = U.pick(['Victor', 'Belinda', 'Rex', 'Gloria', 'Duke', 'Vanessa']); },
    from: { name: 'Rival Boss', face: '😈' },
    title: '{rival}\'s boss wants lunch',
    msgs: ['hello, it\'s {rboss} from {rival} 😏', 'let\'s have lunch', 'I have an... idea 🍽️'],
    choices: [
      { t: '🕵️ Go and spy on them', fx: { chance: { p: 0.5, win: { rival: -0.1, fans: 5, say: 'You learned all their secret plans! 🕵️' }, lose: { say: 'They only talked about their cat. For 2 hours. 🐈😴' } } } },
      { t: '🤝 Go and make peace', fx: { rep: 3, say: 'You\'re friendly rivals now. 🤝' } },
      { t: '🍕 Go, but make THEM pay', fx: { chance: { p: 0.6, win: { say: 'They paid! Free lunch! 😎' }, lose: { money: -80, say: 'They "forgot" their wallet. Classic. 🙄' } } } },
      { t: '🙅 "No thanks"', fx: { say: 'You eat lunch alone. With a very good sandwich. 🥪' } }
    ] });

  ev({ id: 'rival_fake_reviews', cat: 'rivals', icon: '⭐', w: 2, cd: 15, minWeek: 6, init: rival,
    title: 'FAKE 1-star reviews!',
    text: 'Suddenly 50 new 1-star reviews appeared. They all say "go to {rival} instead"! 🤨',
    choices: [
      { t: '🚩 Report them', fx: { chance: { p: 0.7, win: { rival: -0.1, rep: 3, say: 'All deleted! And {rival} got in trouble. 🚩' }, lose: { rep: -3, say: 'Some fake reviews are still there. 😒' } } } },
      { t: '🙏 Ask real customers for reviews', fx: { rep: 4, happy: 2, say: '200 real 5-star reviews came in! ⭐⭐⭐⭐⭐' } },
      { t: '😈 Write fake reviews about them', fx: { chance: { p: 0.4, win: { rival: -0.1, say: 'It worked... but it doesn\'t feel great. 😬' }, lose: { rep: -12, say: 'You got caught! Now YOU are the bad guy. 😱' } } } },
      { t: '🤷 Ignore it', fx: { rep: -4, say: 'Your rating dropped a bit. 📉' } }
    ] });

  ev({ id: 'rival_celebrity', cat: 'rivals', icon: '🌟', w: 2, cd: 18, minWeek: 8, init: rival,
    title: '{rival} got a celebrity!',
    text: 'A famous singer is now in all of {rival}\'s ads. Their shop is PACKED! 🌟😤',
    choices: [
      { t: '🌟 Get an even BIGGER celebrity', fx: { cash: -2, fans: 50, rival: -0.1, say: 'Your celebrity is WAY more famous! 🌟🌟' } },
      { t: '👵 Hire a funny local grandma', fx: { cash: -0.2, fans: 30, say: 'Grandma Rosa is the new star of the internet! 👵🔥' } },
      { t: '🎥 Make a parody of their ad', fx: { chance: { p: 0.6, win: { fans: 30, rival: -0.08, say: 'Your parody got more views than their ad! 😂' }, lose: { fans: 8, say: 'It was okay. 😐' } } } },
      { t: '🤷 Do nothing', fx: { demand: [0.9, 4, 'Rival\'s celebrity ad'], rival: 0.1, say: 'Some customers went to see the celebrity. 😒' } }
    ] });

  ev({ id: 'rival_broke', cat: 'rivals', icon: '📉', w: 1, cd: 30, minWeek: 15, init: rival,
    title: '{rival} is almost broke!',
    text: '{rival} is running out of money! They are selling everything cheap. 📉',
    choices: [
      { t: '⚙️ Buy their machines', fx: { cash: -0.8, equip: 0.05, say: 'Great machines for cheap! Everyone works faster. ⚙️' } },
      { t: '🧑‍🍳 Hire their best worker', fx: { hireSpecial: { role: 'front', skill: 80, traits: ['hardworking', 'loyal'] }, say: 'Their best worker is now YOURS! 🌟' } },
      { t: '🏢 Buy the WHOLE company', fx: { cash: -4, rival: -0.6, demand: [1.3, 20, 'Bought a rival'], say: 'You own {rival} now! 🏢👑' } },
      { t: '🍪 Send them cookies', fx: { money: -20, rep: 3, say: 'Being kind is always cool. 🍪' } }
    ] });

  ev({ id: 'rival_ducks', cat: 'rivals', icon: '🦆', w: 1.5, cd: 25, init: rival,
    title: '1,000 rubber ducks!',
    text: '{rival} pranked you! There are 1,000 rubber ducks in front of your door. 🦆🦆🦆',
    choices: [
      { t: '🧒 Give them to kids', fx: { rep: 5, fans: 10, say: 'Every kid in town has a {company} duck now! 🦆❤️' } },
      { t: '💰 Sell them!', fx: { cash: 0.2, fans: 5, say: 'Rubber ducks: SOLD OUT! 🦆💰' } },
      { t: '🎀 Send them back with bows', fx: { fans: 12, rival: -0.03, say: '{rival} got 1,000 ducks with bows. LOL. 🎀🦆' } },
      { t: '🗿 Build a giant duck statue', fx: { money: -50, fans: 20, demand: [1.05, 4, 'Duck statue'], say: 'The duck statue is a town landmark now! 🦆🗿' } }
    ] });

  ev({ id: 'rival_billboard', cat: 'rivals', icon: '🪧', w: 2, cd: 15, minWeek: 5, init: rival,
    title: 'Billboard war!',
    text: '{rival} put up a HUGE billboard next to your shop: "We\'re better than {company}!" 🪧😤',
    choices: [
      { t: '🪧 Put up a bigger one', fx: { cash: -0.6, fans: 15, rival: -0.06, say: '"We\'re better than THEM." Your billboard is bigger. 😎' } },
      { t: '😂 Put up a funny one', fx: { cash: -0.3, fans: 22, say: '"No we\'re not. (Yes we are.)" Everyone loved it! 😂' } },
      { t: '🎨 Draw a mustache on theirs', fx: { chance: { p: 0.5, win: { fans: 25, say: 'EVERYONE took photos of the mustache. 🥸📸' }, lose: { cash: -0.3, rep: -3, say: 'You got a fine for drawing on their sign. 😬' } } } },
      { t: '🤷 Ignore it', fx: { rival: 0.05, say: 'People keep reading it... 😒' } }
    ] });

  ev({ id: 'rival_spy_plant', cat: 'rivals', icon: '🌿', w: 1.5, cd: 25, minWeek: 8, init: rival,
    title: 'The plant is a SPY!',
    text: 'You just noticed the new plant in the corner has... eyes. It\'s a {rival} spy in a plant costume! 🌿👀',
    choices: [
      { t: '🚪 Kick them out', fx: { say: 'The plant ran away. On legs. 🌿🏃' } },
      { t: '💼 Offer them a job', fx: { hireSpecial: { role: 'sales', skill: 70, traits: ['creative', 'funny'] }, rival: -0.05, say: 'The spy works for YOU now! 🕵️🌿' } },
      { t: '🎭 Tell it FAKE secrets', fx: { rival: -0.12, fans: 5, say: 'You told the plant your "secret plan": free pizza on Mars. 🍕🪐' } },
      { t: '💦 Water the plant', fx: { team: 8, fans: 10, say: 'SPLASH! The spy screamed. Everyone laughed for an hour. 💦😂' } }
    ] });

  ev({ id: 'rival_match', cat: 'rivals', icon: '⚽', w: 2, cd: 20, need: 3, init: rival,
    title: 'Football match vs {rival}!',
    text: '{rival}\'s team challenged your workers to a friendly football match this Saturday! ⚽',
    choices: [
      { t: '⚽ Play for fun!', fx: { team: 6, chance: { p: 0.5, win: { fans: 10, rival: -0.05, say: 'You WON 3-2! 🏆⚽' }, lose: { say: 'You lost 5-1. The pizza after was great though. 🍕' } } } },
      { t: '🏃 Train super hard first', fx: { cash: -0.1, team: 4, chance: { p: 0.7, win: { fans: 15, rival: -0.08, say: 'Training paid off! You won 4-0! 🏆' }, lose: { say: 'They trained harder. You lost. 😩' } } } },
      { t: '🧤 Hire a pro player "as a worker"', fx: { cash: -0.3, chance: { p: 0.6, win: { fans: 12, say: 'You won, but everyone knows you cheated. 😂🧤' }, lose: { rep: -3, say: '{rival} found out. Awkward! 😬' } } } },
      { t: '🙅 Say no', fx: { team: -3, say: 'Your team wanted to play. 😞' } }
    ] });

  ev({ id: 'rival_steal_idea_now', cat: 'rivals', icon: '💡', kind: 'news', w: 1.5, cd: 20, minWeek: 10, init: rival,
    title: '{rival} launched YOUR idea first!',
    text: 'You were about to launch something new... and {rival} launched the SAME thing one day before you! 😱',
    choices: [
      { t: '🚀 Launch yours anyway, but better', fx: { cash: -0.5, chance: { p: 0.6, win: { fans: 20, rival: -0.1, say: 'Yours is better! Customers switched. 🚀' }, lose: { say: 'It\'s a tie. Customers like both. 🤷' } } } },
      { t: '🔄 Change it into something new', fx: { cash: -0.3, demand: [1.08, 6, 'New twist'], say: 'Your new twist is even cooler! ✨' } },
      { t: '🕵️ Find the leak', fx: { chance: { p: 0.5, win: { team: 3, say: 'It was a hacker, not your team. Now it\'s fixed. 🔐' }, lose: { team: -4, say: 'You couldn\'t find it. Everyone feels suspected. 😕' } } } },
      { t: '😭 Cry a little', fx: { team: 2, say: 'Your team gave you a hug. 🫂' } }
    ] });

  // =====================================================================
  // 🤪 EXTRA FUN
  // =====================================================================

  ev({ id: 'youtuber_challenge', cat: 'funny', icon: '📹', w: 2, cd: 20,
    title: 'The 100 {unit} challenge!',
    text: 'A YouTuber wants to try "100 {unit} in one day" at YOUR shop, on camera! 📹',
    choices: [
      { t: '✅ Sure, film it!', fx: { chance: { p: 0.5, win: { viral: [1, 4], say: 'The video got MILLIONS of views! 📹🔥' }, lose: { fans: 12, say: 'They gave up at number 12. Still funny! 😂' } } } },
      { t: '🎁 Free, if they say our name 10 times', fx: { cash: -0.1, fans: 25, say: '"{company}! {company}! {company}!" 📣' } },
      { t: '🏆 Make it a contest for everyone', fx: { money: -80, fans: 18, extra: [0.05, 1, 'Challenge day'], say: 'Half the town joined the challenge! 🏆' } },
      { t: '🙅 Too weird', fx: { say: 'They went to {rival} instead. 🤷' } }
    ] });

  ev({ id: 'pink_uniforms', cat: 'funny', icon: '🩷', w: 2, who: { a: 'any' },
    title: 'Everything is PINK!',
    text: '{a} washed all the uniforms with one red sock. Now EVERYONE\'s uniform is pink. 🩷🧦',
    choices: [
      { t: '🩷 Pink is the new look!', fx: { fans: 12, team: 4, say: 'Pink Week! Customers LOVE it. 🩷' } },
      { t: '🛒 Buy new uniforms', fx: { money: -150, say: 'Back to normal. Boring, but normal. 👕' } },
      { t: '🏷️ Pink discount day', fx: { demand: [1.08, 1, 'Pink day'], fans: 8, say: 'Anyone wearing pink gets a discount! 🩷' } },
      { t: '🧦 Frame the red sock', fx: { team: 6, say: 'The Legendary Red Sock now hangs on the wall. 🖼️🧦' } }
    ] });

  ev({ id: 'pigeon', cat: 'funny', icon: '🐦', w: 2,
    title: 'A pigeon flew in!',
    text: 'A pigeon flew inside and it is stealing crumbs from customers. It refuses to leave. 🐦😤',
    choices: [
      { t: '🍞 Lead it out with bread', fx: { money: -2, say: 'The pigeon followed the bread out. Easy. 🍞🐦' } },
      { t: '🕵️ Name it "Agent Crumbs"', fx: { fans: 10, pet: '🐦', say: 'Agent Crumbs is now the shop\'s mascot. 🐦🕶️' } },
      { t: '🦅 Hire a fake plastic eagle', fx: { money: -40, say: 'The pigeon saw the eagle and FLEW. 🦅💨' } },
      { t: '🏃 Everyone chase it!', fx: { team: 5, happy: -2, say: 'Chaos! Trays flying! The pigeon won. 🐦🏆' } }
    ] });

  ev({ id: 'dance_battle', cat: 'funny', icon: '🕺', w: 2, who: { a: 'funny' },
    title: '{a} started a dance battle!',
    text: '{a} challenged a customer to a dance battle in the middle of the shop! 🕺💃',
    choices: [
      { t: '🎵 Turn up the music!', fx: { fans: 12, team: 5, say: 'The whole shop was dancing! 🎵🕺' } },
      { t: '🏆 Make it a weekly event', fx: { fans: 10, demand: [1.05, 6, 'Dance Fridays'], say: 'Dance Fridays are a HIT! 🕺📅' } },
      { t: '🎥 Film and post it', fx: { chance: { p: 0.4, win: { viral: [1, 3], say: 'The dance video blew up! 🔥' }, lose: { fans: 8, say: 'Cute video! 📱' } } } },
      { t: '🛑 "Back to work, please"', fx: { a: -5, say: 'The music stops. Sad faces. 😔' } }
    ] });

  ev({ id: 'prank_order', cat: 'funny', icon: '📞', w: 1.5, cd: 25,
    title: 'Order for 1,000,000 {unit}!',
    text: 'Someone ordered ONE MILLION {unit} to be delivered to... the moon. 🌙📞',
    choices: [
      { t: '😂 Post the order online', fx: { fans: 15, say: 'Everyone thinks it\'s hilarious! 😂🌙' } },
      { t: '🚀 Send them 1 with a rocket sticker', fx: { money: -5, fans: 10, say: 'The prankster laughed and became a real customer! 🚀' } },
      { t: '📞 Call them back', fx: { say: 'It was a kid. They said sorry. 😅' } },
      { t: '🗑️ Delete it', fx: { say: 'Nice try, prankster. 🙄' } }
    ] });

  ev({ id: 'rapper_song', cat: 'funny', icon: '🎤', w: 0.8, cd: 50, rarity: 'epic',
    title: 'A rapper sang about you!',
    text: 'A famous rapper put "{company}" in their new song! It\'s #1 on the charts! 🎤🔥',
    choices: [
      { t: '🎶 Play it in the shop all day', fx: { fans: 40, team: 5, say: 'Everyone is singing your name! 🎶' } },
      { t: '🎤 Invite the rapper over', fx: { chance: { p: 0.5, win: { viral: [3, 8], say: 'They CAME! Surprise concert in your shop! 🎤🤯' }, lose: { fans: 30, say: 'They were busy, but sent a shoutout! 📣' } } } },
      { t: '👕 Make song merch', fx: { cash: -0.3, extra: [0.2, 6, 'Song merch'], fans: 25, say: 'The shirts are selling out! 👕🔥' } },
      { t: '😎 Stay humble', fx: { fans: 35, rep: 3, say: '"We\'re just happy people like us." Classy. 😎' } }
    ] });

  ev({ id: 'grandma_visit', cat: 'funny', icon: '👵', w: 1.5, cd: 30,
    title: 'Your grandma is visiting!',
    text: 'Your grandma came to visit and started telling EVERYONE what to do. The staff are scared. 👵😱',
    choices: [
      { t: '👵 Let grandma run things', fx: { capacity: [1.15, 1, 'Grandma is in charge'], team: -3, say: 'Everything is SO organized. And a bit scary. 👵📋' } },
      { t: '🍪 Ask grandma to bake cookies', fx: { team: 8, happy: 4, say: 'Grandma\'s cookies are the best thing that ever happened here. 🍪❤️' } },
      { t: '📸 Make grandma the mascot', fx: { fans: 20, say: '"Grandma Approved ✅" stickers everywhere! 👵' } },
      { t: '☕ Take grandma for coffee', fx: { team: 4, say: 'The staff can breathe again. ☕😅' } }
    ] });

  ev({ id: 'boss_for_day', cat: 'funny', icon: '🧒', w: 1.5, cd: 30,
    title: 'A kid wants to be BOSS!',
    text: 'A little kid asks: "Can I be the boss for one day?" Their parents say it\'s their birthday. 🧒👔',
    choices: [
      { t: '👔 Yes! Kid boss day!', fx: { fans: 20, rep: 4, team: 5, say: 'Kid Boss gave everyone ice cream and a nap break. Best day ever. 🍦😴' } },
      { t: '🎖️ Give them a "Junior Boss" badge', fx: { money: -10, rep: 3, fans: 8, say: 'They wore the badge for a whole year. 🎖️🥹' } },
      { t: '🎂 Throw a mini birthday party', fx: { money: -40, rep: 3, fans: 10, say: 'Happy birthday, little boss! 🎂' } },
      { t: '🙅 "Sorry, not today"', fx: { rep: -1, say: 'The kid is a bit sad. 😢' } }
    ] });

  ev({ id: 'treasure_map', cat: 'funny', icon: '🗺️', w: 1, cd: 60, rarity: 'rare',
    title: 'A TREASURE MAP! 🗺️',
    text: 'Workers cleaning the basement found an old treasure map. The X is... under YOUR building! 😮',
    choices: [
      { t: '⛏️ DIG!', fx: { cash: -0.2, next: ['treasure_chest', 1, 1], say: 'Everyone grabs a shovel... ⛏️⛏️' } },
      { t: '💰 Sell the map', fx: { cash: 0.3, say: 'A collector paid for it. Now we\'ll never know... 🤔' } },
      { t: '🖼️ Frame it', fx: { fans: 8, say: 'Customers love the mystery map. 🗺️' } },
      { t: '🗑️ It\'s fake', fx: { say: 'Probably fake. Probably... 👀' } }
    ] });

  ev({ id: 'treasure_chest', cat: 'lucky', icon: '🪙', chainOnly: true,
    title: 'You found a CHEST!',
    text: 'After digging all night, you hit something hard. An old wooden chest! 📦✨',
    choices: [
      { t: '🔓 Open it carefully', fx: { chance: { p: 0.5, win: { cash: 5, say: 'GOLD COINS! 🪙🪙🪙 You\'re rich!' }, lose: { fans: 10, say: 'An old note: "Ha ha, made you dig." 😂📜' } } } },
      { t: '💥 Smash it open', fx: { chance: { p: 0.4, win: { cash: 4, say: 'Gold! A little bent, but gold! 🪙' }, lose: { say: 'You broke it... and everything inside. Oops. 💥' } } } },
      { t: '🏛️ Call a museum', fx: { rep: 10, fans: 30, cash: 1, say: 'It was pirate treasure! The museum paid you and put your name on it. 🏴‍☠️' } },
      { t: '📺 Open it LIVE online', fx: { fans: 30, chance: { p: 0.45, win: { cash: 4, viral: [2, 6], say: 'GOLD, live on stream! The internet lost its mind! 🤯' }, lose: { fans: 10, say: 'It was empty. Live. Awkward. 😅' } } } }
    ] });

  ev({ id: 'googly_eyes', cat: 'funny', icon: '👀', w: 1.5, cd: 25,
    title: 'Googly eyes on EVERYTHING',
    text: 'Someone put googly eyes on every single thing in the shop. The cash register is staring at you. 👀',
    choices: [
      { t: '😂 Leave them!', fx: { fans: 12, team: 5, say: 'Customers are taking photos with everything! 👀📸' } },
      { t: '🕵️ Find who did it', fx: { team: 3, say: 'It was the manager. Nobody expected that. 👀😂' } },
      { t: '👀 Googly eye contest!', fx: { money: -20, fans: 15, say: 'Best googly eye design wins! 👀🏆' } },
      { t: '🧹 Remove them all', fx: { team: -2, say: 'It took 3 hours. 😩' } }
    ] });

  ev({ id: 'ufo_roof', cat: 'funny', icon: '🛸', w: 1.2, cd: 40, who: { a: 'any' },
    title: '{a} saw a UFO!',
    text: '{a} swears a UFO landed on the roof last night. There are weird circles up there! 🛸',
    choices: [
      { t: '🔭 Check the roof', fx: { chance: { p: 0.2, win: { fans: 30, viral: [1, 4], say: 'There IS something up there! Nobody can explain it. 🛸🤯' }, lose: { team: 3, say: 'It was a frisbee. A really big frisbee. 🥏' } } } },
      { t: '👽 "UFO Special" menu', fx: { fans: 15, demand: [1.06, 4, 'UFO hype'], say: 'Alien-green treats are selling fast! 👽' } },
      { t: '📺 Call the news', fx: { chance: { p: 0.5, win: { fans: 25, say: 'You\'re on the news! 📺🛸' }, lose: { rep: -2, say: 'The news laughed at you. 😅' } } } },
      { t: '🙄 "Go back to work, {a}"', fx: { a: -3, say: '{a} keeps looking at the sky. 🛸' } }
    ] });

  ev({ id: 'giant_duck', cat: 'funny', icon: '🦆', w: 1, cd: 50, rarity: 'rare',
    title: 'A GIANT duck on your roof!',
    text: 'A giant inflatable duck from the city parade blew away... and landed on YOUR roof. 🦆🏠',
    choices: [
      { t: '🦆 Keep it! New mascot!', fx: { fans: 25, demand: [1.08, 6, 'Giant duck'], say: 'People come just to see the giant duck! 🦆📸' } },
      { t: '📞 Give it back to the city', fx: { rep: 5, say: 'The mayor said thank you! 🏛️' } },
      { t: '💰 Charge for duck photos', fx: { extra: [0.1, 3, 'Duck photos'], say: 'Duck selfies: $2 each. Line around the block! 🦆💰' } },
      { t: '🎈 Pop it', fx: { rep: -3, say: 'Everyone gasped. Why would you do that? 😱' } }
    ] });

  ev({ id: 'slang_word', cat: 'funny', icon: '🗣️', w: 0.6, cd: 80, rarity: 'epic',
    title: 'Your name is SLANG now!',
    text: 'Teenagers now say "that\'s so {company}" when something is awesome! 🗣️🔥',
    choices: [
      { t: '📣 Use it in your ads', fx: { fans: 40, demand: [1.12, 8, 'So {company}!'], say: '"That\'s so {company}!" is everywhere! 📣' } },
      { t: '👕 Print it on hoodies', fx: { cash: -0.3, extra: [0.2, 8, 'Slang hoodies'], say: 'The hoodies are sold out! 👕🔥' } },
      { t: '📖 Get it into the dictionary', fx: { chance: { p: 0.3, win: { fans: 50, rep: 8, say: 'It\'s OFFICIALLY a word now! 📖🤯' }, lose: { fans: 15, say: 'The dictionary said "not yet". 📖' } } } },
      { t: '😎 Stay cool about it', fx: { fans: 30, say: 'That\'s so {company}. 😎' } }
    ] });

  ev({ id: 'wifi_leak', cat: 'funny', icon: '📶', w: 1.5, cd: 30,
    title: 'Everyone uses your Wi-Fi!',
    text: 'The Wi-Fi password leaked. Now the WHOLE street is using it. It\'s super slow! 📶🐌',
    choices: [
      { t: '🔐 Change the password', fx: { say: 'New password: "NoMoreFreeWiFi123". Fast again! 📶' } },
      { t: '☕ "Free Wi-Fi if you buy something"', fx: { demand: [1.06, 4, 'Wi-Fi customers'], say: 'The Wi-Fi users became customers! ☕📶' } },
      { t: '😂 Rename it "BuyACoffeeFirst"', fx: { fans: 10, say: 'People laughed and bought stuff. 😂' } },
      { t: '🤷 Let them', fx: { rep: 2, capacity: [0.97, 2, 'Slow Wi-Fi'], say: 'The neighbors love you. Your computers hate you. 🐌' } }
    ] });

  ev({ id: 'chicken_payment', cat: 'funny', icon: '🐔', w: 1.5, cd: 30,
    title: 'Paying with CHICKENS?!',
    text: 'A farmer wants to buy your {unit}. He has no money... but he has 3 chickens. 🐔🐔🐔',
    choices: [
      { t: '🐔 Accept the chickens!', fx: { pet: '🐔', fans: 12, team: 4, say: 'You now own 3 chickens. They lay eggs for the team! 🥚' } },
      { t: '🥚 Just the eggs, please', fx: { team: 2, say: 'Fresh eggs for everyone\'s breakfast! 🥚🍳' } },
      { t: '🎁 Give it to him for free', fx: { rep: 4, say: 'He cried and brought you a pie the next week. 🥧' } },
      { t: '🙅 "Money only, sorry"', fx: { say: 'He and his chickens walk away sadly. 🐔😢' } }
    ] });

  ev({ id: 'staff_band', cat: 'funny', icon: '🎸', w: 1.2, need: 3, cd: 40,
    title: 'Your workers started a band!',
    text: 'Three of your workers started a band called "The {company} Rockers". They want to play in the shop! 🎸',
    choices: [
      { t: '🎸 Concert on Friday!', fx: { fans: 15, team: 8, say: 'They were... actually really good! 🎸🤘' } },
      { t: '💿 Record a song for your ads', fx: { cash: -0.2, fans: 20, say: 'The jingle is SO catchy! 🎶' } },
      { t: '🎤 Join the band', fx: { team: 10, fans: 10, say: 'You play the tambourine. Badly. They love you. 🪘' } },
      { t: '🙉 "Please practice at home"', fx: { team: -3, say: 'The band is sad. 🎸😢' } }
    ] });

  ev({ id: 'sheep', cat: 'funny', icon: '🐑', w: 1.2, cd: 40,
    title: 'A SHEEP walked in!',
    text: 'A fluffy sheep escaped from a farm and walked into your shop like a customer. 🐑',
    choices: [
      { t: '🐑 Serve it!', fx: { fans: 15, say: 'The sheep ate a lettuce and left. 5-star customer. 🐑⭐' } },
      { t: '📸 Sheep selfie!', fx: { chance: { p: 0.4, win: { viral: [0.5, 2], say: 'The sheep selfie went viral! 🐑🔥' }, lose: { fans: 8, say: 'Cute photo! 📸' } } } },
      { t: '🚜 Call the farmer', fx: { rep: 3, say: 'The farmer gave you free wool socks! 🧦' } },
      { t: '🏃 Chase it out', fx: { team: 3, happy: -1, say: 'The sheep was FAST. It won. 🐑💨' } }
    ] });

  ev({ id: 'chocolate_statue', cat: 'funny', icon: '🗿', w: 1, cd: 50,
    title: 'You won a weird prize!',
    text: 'You won a raffle! The prize is... a life-size chocolate statue of YOU. 🍫🗿',
    choices: [
      { t: '🖼️ Put it in the window', fx: { fans: 18, say: 'Everyone takes selfies with Chocolate You. 🍫📸' } },
      { t: '🍫 Share it with the team', fx: { team: 10, say: 'Everyone ate a piece of the boss. Weird but yummy. 🍫😂' } },
      { t: '💰 Sell it', fx: { cash: 0.3, say: 'A collector bought it. You don\'t want to know why. 🤔' } },
      { t: '🌞 Leave it in the sun', fx: { fans: 10, say: 'Chocolate You MELTED. The video is hilarious. 🫠🍫' } }
    ] });

  ev({ id: 'company_birthday', cat: 'funny', icon: '🎂', w: 4, cd: 52, cond: function (g) { return g.week >= 52 && g.week % 52 <= 3; },
    title: '{company} has a birthday! 🎂',
    text: 'Your company is one year older! Everyone wants to celebrate!',
    choices: [
      { t: '🎂 Giant cake for everyone', fx: { cash: -0.15, team: 10, fans: 10, say: 'The cake was as big as a car! 🎂🚗' } },
      { t: '🎟️ Birthday sale for customers', fx: { demand: [1.2, 2, 'Birthday sale'], fans: 12, say: 'Birthday sale = SUPER busy week! 🎉' } },
      { t: '🎁 Bonus for the team', fx: { teamBonus: true, team: 5, say: 'Happy birthday to everyone! 🎁' } },
      { t: '🎈 Balloon arch outside', fx: { money: -60, fans: 8, happy: 3, say: 'The balloon arch is on every Instagram. 🎈' } }
    ] });

  ev({ id: 'mystery_package', cat: 'funny', icon: '📦', w: 1.5, cd: 25, who: { a: 'any' },
    title: 'A mystery package!',
    text: 'A box arrived that just says "FOR THE BOSS". No name. It\'s... ticking? 📦⏰',
    choices: [
      { t: '🎁 Open it!', fx: { chance: { p: 0.6, win: { cash: 0.5, say: 'It\'s a cuckoo clock with money inside! From a happy customer! ⏰💰' }, lose: { team: 3, say: 'CONFETTI BOMB! 🎊 It was a prank. Everyone is covered.' } } } },
      { t: '🤔 Shake it', fx: { chance: { p: 0.5, win: { say: 'It went "ding!" It\'s a toaster. A very nice toaster. 🍞' }, lose: { say: 'It went "crunch." It WAS cookies. 🍪💔' } } } },
      { t: '👮 Call the police', fx: { rep: 1, say: 'The police opened it. It was a birthday cake from your mom. 🎂😂' } },
      { t: '🙋 Let {a} open it', fx: { a: 5, team: 3, say: '{a} opened it: a golden rubber chicken trophy! 🐔🏆' } }
    ] });

  ev({ id: 'hot_air_balloon', cat: 'funny', icon: '🎈', w: 1, cd: 50, rarity: 'rare',
    title: 'A hot air balloon landed!',
    text: 'A hot air balloon made an emergency landing in your parking lot! The pilot is fine. 🎈🧺',
    choices: [
      { t: '☕ Free drinks for the pilot', fx: { rep: 4, fans: 8, say: 'The pilot told EVERYONE how nice you were. ☕🎈' } },
      { t: '🎈 Ask for a free ride', fx: { chance: { p: 0.6, win: { fans: 20, team: 5, say: 'You flew over the city! The photos are amazing. 🎈📸' }, lose: { say: 'Too windy. Maybe next time. 🌬️' } } } },
      { t: '🪧 Put your logo on the balloon', fx: { money: -100, fans: 25, say: 'Your logo is flying all over the city! 🎈' } },
      { t: '📸 Balloon photo day', fx: { fans: 12, demand: [1.05, 1, 'Balloon visitors'], say: 'Everyone came to see the balloon! 📸' } }
    ] });

  ev({ id: 'world_record', cat: 'funny', icon: '🏅', w: 1.2, cd: 40, who: { a: 'hardworking' },
    title: '{a} wants a WORLD RECORD!',
    text: '{a} wants to break the world record for "most {unit} in one hour". 🏅⏱️',
    choices: [
      { t: '⏱️ Go for it!', fx: { chance: { p: 0.35, win: { fans: 40, rep: 5, viral: [1, 4], say: 'WORLD RECORD! {a} is a legend! 🏅🌍' }, lose: { fans: 12, a: 4, say: 'So close! Only 3 short. Everyone cheered anyway. 👏' } } } },
      { t: '👥 Whole team record!', fx: { team: 8, chance: { p: 0.45, win: { fans: 35, say: 'TEAM WORLD RECORD! 🏅👥' }, lose: { fans: 10, say: 'Not a record, but so much fun! 🎉' } } } },
      { t: '📺 Invite TV cameras', fx: { cash: -0.1, chance: { p: 0.35, win: { fans: 50, viral: [2, 5], say: 'Record broken LIVE on TV! 📺🏅' }, lose: { fans: 20, say: 'No record, but great TV! 📺' } } } },
      { t: '🙅 "Maybe later"', fx: { a: -4, say: '{a} will practice at home. 🏋️' } }
    ] });

  ev({ id: 'superfan_tattoo', cat: 'funny', icon: '💉', w: 1, cd: 50, rarity: 'rare',
    title: 'A superfan got a tattoo!',
    text: 'A customer got your logo tattooed on their arm! They are SO proud. 😳💪',
    choices: [
      { t: '🎁 Free {unit} for LIFE', fx: { rep: 5, fans: 25, say: 'The superfan cried. The internet cried. 😭❤️' } },
      { t: '📸 Photo for your wall', fx: { fans: 15, say: 'Wall of Superfans: 1 member so far. 📸' } },
      { t: '💬 "Please don\'t do that again"', fx: { fans: 8, say: '"Too late, I got another one." 😂' } },
      { t: '🤝 Make them your ambassador', fx: { fans: 30, demand: [1.05, 6, 'Superfan ambassador'], say: 'They tell EVERYONE about you. Every day. 📣' } }
    ] });

  // =====================================================================
  // 🏭 EVENTS FOR SPECIFIC COMPANIES
  // =====================================================================

  var SWEET = tag('sweet'), FARM = tag('farm'), SPORT = tag('sport'), OIL = tag('oil'), ANIMALS = tag('animals'),
    MEDIA = tag('media'), FASHION = tag('fashion'), FUN = tag('fun'), TECH = tag('tech');

  ev({ id: 'sugar_rush', cat: 'customers', icon: '🍭', w: 3, cd: 12, cond: SWEET,
    title: 'SUGAR RUSH! 🍭',
    text: 'A group of kids ate too many sweets. Now they are bouncing off the walls! 🤸🤸',
    choices: [
      { t: '🎵 Start a dance party', fx: { fans: 10, happy: 4, say: 'Best birthday party the kids ever had! 💃' } },
      { t: '🥛 Give them water and apples', fx: { rep: 4, say: 'The parents LOVE you now. 🍎' } },
      { t: '🎨 Coloring corner!', fx: { money: -30, happy: 5, rep: 2, say: 'The kids calmed down and drew 50 pictures of your shop. 🎨' } },
      { t: '😵 Hide in the back', fx: { happy: -3, say: 'Chaos. Total chaos. 😵' } }
    ] });

  ev({ id: 'golden_ticket', cat: 'lucky', icon: '🎫', w: 2, cd: 30, cond: SWEET,
    title: 'Golden ticket contest?',
    text: '{a} has an idea: hide 5 golden tickets in your {unit}. The winners get a tour of the factory! 🎫✨',
    who: { a: 'creative' },
    choices: [
      { t: '🎫 Do it!', fx: { cash: -0.4, demand: [1.3, 4, 'Golden ticket hunt'], fans: 25, say: 'EVERYONE is buying to find a ticket! 🎫🔥' } },
      { t: '🎫🎫 Hide 50 tickets!', fx: { cash: -1, demand: [1.4, 5, 'Golden ticket MADNESS'], fans: 35, say: 'Golden ticket MADNESS! 🤯🎫' } },
      { t: '🍫 Just 1 super ticket', fx: { cash: -0.2, fans: 20, demand: [1.15, 4, 'The one golden ticket'], say: 'Everyone is searching for THE ticket! 🔍' } },
      { t: '🙅 Too much work', fx: { a: -5, say: '{a} is disappointed. 😔' } }
    ] });

  ev({ id: 'chocolate_river', cat: 'business', icon: '🍫', w: 2.5, cd: 25, cond: tag('sweet'),
    title: 'The chocolate pipe BURST!',
    text: 'A big pipe broke. There is a RIVER of chocolate on the floor! 🍫🌊',
    choices: [
      { t: '🔧 Fix it fast', fx: { cash: -0.3, say: 'Fixed! But everything smells like chocolate for a week. 🍫' } },
      { t: '🛶 Chocolate river tours!', fx: { cash: -0.2, fans: 25, extra: [0.15, 2, 'Chocolate river tours'], say: 'People paid to ride a tiny boat on the chocolate river! 🛶🍫' } },
      { t: '🥄 Everyone grab a spoon!', fx: { team: 12, capacity: [0.9, 1, 'Chocolate cleanup'], say: 'The team ate it ALL. They regret nothing. 🥄😋' } },
      { t: '📸 Post it online', fx: { fans: 15, cash: -0.3, say: 'Chocolate river = internet gold. 📸' } }
    ] });

  ev({ id: 'monkeys', cat: 'business', icon: '🐒', w: 3, cd: 15, cond: FARM,
    title: 'MONKEYS are stealing bananas!',
    text: 'A group of monkeys is stealing your bananas! They are fast and VERY cheeky. 🐒🍌',
    choices: [
      { t: '🥅 Put up nets', fx: { cash: -0.2, say: 'The monkeys are angry, but the bananas are safe. 🥅' } },
      { t: '🍌 Give them their own banana tree', fx: { cash: -0.1, rep: 3, fans: 10, say: 'Happy monkeys, happy farm! 🐒❤️' } },
      { t: '🎥 Film the monkey heist', fx: { chance: { p: 0.5, win: { viral: [1, 4], cash: -0.1, say: 'The monkey heist video is EVERYWHERE! 🐒🔥' }, lose: { fans: 10, cash: -0.15, say: 'Funny video, but they took a lot of bananas. 🍌' } } } },
      { t: '🙈 Let them', fx: { cash: -0.3, demand: [0.92, 2, 'Monkey business'], say: 'The monkeys had a feast. 🐒🍌🍌🍌' } }
    ] });

  ev({ id: 'banana_sickness', cat: 'trouble', icon: '🦠', w: 1.5, cd: 30, cond: FARM,
    title: 'Banana sickness!',
    text: 'A plant disease is spreading on some banana trees! 🍌🦠',
    choices: [
      { t: '🧪 Buy plant medicine', fx: { cash: -0.5, say: 'The trees are healthy again! 🌴' } },
      { t: '✂️ Cut the sick trees', fx: { capacity: [0.85, 3, 'Fewer banana trees'], say: 'The sickness stopped spreading. 🌱' } },
      { t: '🔬 Ask scientists for help', fx: { cash: -0.3, rep: 3, chance: { p: 0.6, win: { equip: 0.04, say: 'They found a super-banana that never gets sick! 🍌💪' }, lose: { say: 'They fixed it, but no super-banana. 🔬' } } } },
      { t: '🙏 Hope it goes away', fx: { chance: { p: 0.4, win: { say: 'It went away! Lucky! 🍀' }, lose: { capacity: [0.7, 4, 'Banana sickness'], say: 'It spread! Many trees are sick. 😢' } } } }
    ] });

  ev({ id: 'giant_banana', cat: 'lucky', icon: '🍌', w: 1.2, cd: 50, cond: FARM, rarity: 'rare',
    title: 'The BIGGEST banana ever!',
    text: 'You grew a banana as big as a baseball bat! It might be a world record! 🍌📏',
    choices: [
      { t: '🏆 Enter it in a contest', fx: { fans: 25, rep: 5, say: 'WORLD RECORD BANANA! 🏆🍌' } },
      { t: '💰 Sell it to a collector', fx: { cash: 1, say: 'Someone paid a LOT for one banana. 🍌💰' } },
      { t: '🍨 Make the world\'s biggest banana split', fx: { fans: 30, happy: 5, say: 'The whole town shared it! 🍨🎉' } },
      { t: '🔬 Plant its seeds', fx: { equip: 0.05, say: 'Now ALL your bananas are growing bigger! 🍌🍌' } }
    ] });

  ev({ id: 'wonderkid', cat: 'team', icon: '⚽', w: 3, cd: 20, cond: SPORT,
    title: 'A wonderkid appears!',
    text: 'A 12-year-old kid is doing tricks you\'ve never seen. They want to join! ⚽✨',
    choices: [
      { t: '✍️ Sign them now!', fx: { hireSpecial: { name: 'Leo Little', face: '🧒', role: 'front', skill: 85, traits: ['ambitious', 'hardworking'], salaryMult: 0.6 }, fans: 15, say: 'Little Leo joined! The future star! ⭐' } },
      { t: '🎥 Film the tricks', fx: { chance: { p: 0.5, win: { viral: [1, 4], say: 'The wonderkid video went viral! ⚽🔥' }, lose: { fans: 12, say: 'Cool video! 📱' } } } },
      { t: '🧪 Tryout first', fx: { chance: { p: 0.7, win: { hireSpecial: { name: 'Mia Kick', face: '👧', role: 'front', skill: 80, traits: ['hardworking', 'friendly'], salaryMult: 0.6 }, say: 'They passed! Welcome! ⚽' }, lose: { say: 'They were nervous and didn\'t make it this time. 😢' } } } },
      { t: '🙅 Too young', fx: { rep: -1, say: 'The kid joined another academy. Hope they don\'t become a star... 😬' } }
    ] });

  ev({ id: 'big_club_offer', cat: 'lucky', icon: '🏟️', w: 2, cd: 20, cond: SPORT, who: { a: 'star' }, init: amt(3),
    title: 'A giant club wants {a}!',
    text: 'A famous club wants to buy {a} for {amt}! {a} is super excited. 🏟️💰',
    choices: [
      { t: '💰 Sell {a}!', fx: { cash: 3, fire: 'a', fans: 15, say: 'Big money! {a} waves goodbye from the big stadium. 👋🏟️' } },
      { t: '📈 Ask for MORE money', fx: { chance: { p: 0.5, win: { cash: 4.5, fire: 'a', say: 'They paid EVEN MORE! 🤑' }, lose: { a: -10, say: 'They walked away. {a} is sad. 😞' } } } },
      { t: '❤️ Keep {a}', fx: { a: -8, loyal: { a: 5 }, say: '{a} stays, but dreams of the big stadium. 🌙' } },
      { t: '🔄 Loan {a} for one season', fx: { cash: 1, a: 10, capacity: [0.9, 8, 'Star on loan'], say: '{a} comes back better AND you got money! 🔄' } }
    ] });

  ev({ id: 'big_match', cat: 'rivals', icon: '🏆', w: 2.5, cd: 12, cond: SPORT, init: rival,
    title: 'Big final vs {rival}!',
    text: 'Your team is in the FINAL against {rival}! The whole city is watching! 🏆⚽',
    choices: [
      { t: '💪 Attack, attack, attack!', fx: { chance: { p: 0.5, win: { fans: 30, demand: [1.2, 4, 'Champions!'], rival: -0.12, say: 'CHAMPIONS! 🏆🎉' }, lose: { fans: 5, say: 'They scored on the counter-attack. So close! 😩' } } } },
      { t: '🛡️ Play safe defense', fx: { chance: { p: 0.45, win: { fans: 25, demand: [1.15, 4, 'Champions!'], rival: -0.1, say: 'Won on penalties! 🏆😱' }, lose: { say: 'Lost on penalties. Heartbreaking. 💔' } } } },
      { t: '🎤 Give a HUGE team speech', fx: { team: 12, chance: { p: 0.55, win: { fans: 30, rival: -0.1, say: 'The speech worked! CHAMPIONS! 🏆' }, lose: { fans: 8, say: 'Great speech. Not enough. 😢' } } } },
      { t: '🎉 Just have fun!', fx: { team: 8, fans: 10, say: 'Win or lose, it was the best day ever! 🎉' } }
    ] });

  ev({ id: 'oil_gusher', cat: 'lucky', icon: '🛢️', w: 2, cd: 30, cond: OIL,
    title: 'You hit a GUSHER!',
    text: 'Your workers found a HUGE new spot! It\'s shooting up into the sky! 🛢️💦',
    choices: [
      { t: '💰 Dig it all, super fast', fx: { extra: [0.5, 6, 'Gusher'], rep: -3, say: 'Money is flowing! But nature is not happy. 💰😬' } },
      { t: '🌱 Dig it slowly and safely', fx: { extra: [0.25, 12, 'Safe gusher'], rep: 3, say: 'Steady money AND a happy planet. 🌱💰' } },
      { t: '🏷️ Sell the spot', fx: { cash: 3, say: 'Sold for a LOT! 🤑' } },
      { t: '☀️ Invest in solar power instead', fx: { cash: -1, rep: 8, fans: 20, say: 'The world loves your green plan! ☀️🌍' } }
    ] });

  ev({ id: 'oil_spill', cat: 'trouble', icon: '🐦', w: 1.2, cd: 40, cond: OIL,
    title: 'A small spill!',
    text: 'Some oil spilled near a lake. A few ducks got dirty. People are watching what you do! 🦆😟',
    choices: [
      { t: '🧽 Clean it up NOW', fx: { cash: -1.5, rep: 3, say: 'All clean! The ducks are fine. 🦆✨' } },
      { t: '🦆 Clean + wash every duck', fx: { cash: -2, rep: 8, fans: 20, say: 'The duck-washing video made everyone love you. 🦆🛁' } },
      { t: '🙈 Clean it slowly', fx: { cash: -0.5, rep: -8, say: 'People are angry it took so long. 😠' } },
      { t: '🤥 Say it wasn\'t you', fx: { chance: { p: 0.3, win: { say: 'Nobody could prove it. Hmm. 😬' }, lose: { rep: -20, cash: -2, say: 'It WAS you. Huge scandal! 📰😱' } } } }
    ] });

  ev({ id: 'oil_price_jump', cat: 'world', icon: '📈', kind: 'news', w: 2, cd: 20, cond: OIL,
    title: 'Prices JUMPED!',
    text: 'Big news: the price of what you sell just went way up around the world! 📈💰',
    choices: [
      { t: '💰 Sell as much as you can!', fx: { extra: [0.4, 3, 'High prices'], team: -4, say: 'Huge profits! Tired workers. 💰😴' } },
      { t: '📦 Save it for later', fx: { extra: [0.2, 6, 'Saved for later'], say: 'Smart! Money now AND later. 🧠' } },
      { t: '⬇️ Keep prices low for people', fx: { rep: 6, fans: 15, say: 'People love that you didn\'t get greedy! ❤️' } },
      { t: '🎉 Bonus for everyone!', fx: { extra: [0.3, 3, 'High prices'], teamBonus: true, say: 'Everyone shares the win! 🎉' } }
    ] });

  ev({ id: 'animal_escape', cat: 'business', icon: '🦒', w: 2.5, cd: 20, cond: ANIMALS,
    init: function (g, c) { c.animal = U.pick(['a giraffe', 'a llama', 'a penguin', 'a tiny pony', 'a parrot', 'a turtle']); },
    title: 'An animal escaped!',
    text: '{animal} escaped and is walking down Main Street! People are filming! 🦒📱',
    choices: [
      { t: '🏃 Catch it gently', fx: { rep: 3, say: 'Caught and safe! Good job team! 🤗' } },
      { t: '🥕 Lure it back with snacks', fx: { money: -10, fans: 10, say: 'It followed the snacks all the way home. 🥕' } },
      { t: '📺 Make it a news story', fx: { fans: 25, say: '"{animal} goes shopping" is on the news! 📺😂' } },
      { t: '😱 Panic!', fx: { rep: -3, fans: 12, say: 'Everyone saw you panic. The video is funny though. 😂' } }
    ] });

  ev({ id: 'baby_animal', cat: 'lucky', icon: '🐼', w: 1.5, cd: 40, cond: ANIMALS,
    title: 'A baby was born! 🐼',
    text: 'A super cute baby animal was just born! Everyone wants to see it!',
    choices: [
      { t: '🗳️ Let fans vote on its name', fx: { fans: 30, say: 'The name is "Sir Fluffington III". The fans have spoken. 👑' } },
      { t: '📹 24/7 baby camera', fx: { fans: 25, demand: [1.1, 8, 'Baby camera'], say: 'Millions watch it sleep. 📹😴' } },
      { t: '🎉 Baby party!', fx: { cash: -0.1, fans: 20, demand: [1.12, 3, 'Baby party'], say: 'The line goes around the block! 🎉' } },
      { t: '🤫 Keep it quiet, let it rest', fx: { rep: 4, say: 'The baby and mom are happy and calm. 🥰' } }
    ] });

  ev({ id: 'algorithm', cat: 'social', icon: '📲', w: 2.5, cd: 15, cond: MEDIA,
    title: 'The algorithm changed!',
    text: 'The big video app changed how it shows videos. Your views dropped overnight! 📉📲',
    choices: [
      { t: '🔄 Try short videos', fx: { chance: { p: 0.6, win: { fans: 20, say: 'Short videos are WORKING! 📈' }, lose: { demand: [0.9, 3, 'Algorithm change'], say: 'Still not working. Hmm. 😕' } } } },
      { t: '🎤 Go live every day', fx: { team: -3, fans: 15, say: 'Live every day is tiring, but fans love it! 🔴' } },
      { t: '🤝 Collab with bigger creators', fx: { cash: -0.3, fans: 25, say: 'The collab brought tons of new fans! 🤝' } },
      { t: '😤 Complain online', fx: { fans: 5, demand: [0.9, 3, 'Algorithm change'], say: 'Everyone is complaining too. 😒' } }
    ] });

  ev({ id: 'mega_star_collab', cat: 'lucky', icon: '🌟', w: 1.5, cd: 30, cond: MEDIA, rarity: 'rare',
    title: 'A MEGA star wants to work with you!',
    text: 'One of the most famous people online DMed you: "let\'s make something together!" 🌟📱',
    choices: [
      { t: '🤝 YES!!!', fx: { cash: -0.5, fans: 50, viral: [2, 6], say: 'The collab broke the internet! 🌟🔥' } },
      { t: '💰 "Pay us first"', fx: { chance: { p: 0.3, win: { cash: 2, fans: 30, say: 'They PAID you! 🤑' }, lose: { say: 'They went with someone else. 😬' } } } },
      { t: '🤔 "Let me think..."', fx: { chance: { p: 0.5, win: { fans: 35, say: 'They waited for you! Collab done! ✨' }, lose: { say: 'Too slow. They moved on. 😩' } } } },
      { t: '😳 Too nervous', fx: { say: 'You left them on "seen". 👀' } }
    ] });

  ev({ id: 'fashion_week', cat: 'lucky', icon: '👠', w: 2, cd: 30, cond: FASHION,
    title: 'Invited to Fashion Week!',
    text: 'Your company was invited to the BIG fashion show in the city! 👠✨',
    choices: [
      { t: '👗 Show your wildest designs', fx: { cash: -0.5, chance: { p: 0.5, win: { fans: 40, demand: [1.2, 6, 'Fashion Week hit'], say: 'The crowd went WILD! 👗🔥' }, lose: { fans: 10, rep: -2, say: 'Too wild. The critics were confused. 🤨' } } } },
      { t: '👕 Show simple, classic stuff', fx: { cash: -0.4, rep: 5, demand: [1.1, 6, 'Fashion Week'], say: 'Elegant! The critics loved it. ✨' } },
      { t: '🧑‍🤝‍🧑 Use your workers as models', fx: { cash: -0.2, team: 10, fans: 25, say: 'Your team strutted the runway! Iconic. 💃🕺' } },
      { t: '🙅 Skip it', fx: { say: 'Maybe next year.' } }
    ] });

  ev({ id: 'ride_stuck', cat: 'trouble', icon: '🎢', w: 1.5, cd: 30, cond: FUN,
    title: 'The ride got stuck!',
    text: 'A ride stopped at the very top! The people up there are okay, but a bit scared. 🎢😰',
    choices: [
      { t: '🔧 Fix it super fast', fx: { cash: -0.3, rep: 1, say: 'Moving again in 10 minutes! Phew. 🎢' } },
      { t: '🍕 Send up pizza while they wait', fx: { money: -40, fans: 15, say: '"Best ride ever. Free pizza at the top!" 🍕🎢' } },
      { t: '🎟️ Free tickets for life', fx: { rep: 5, fans: 10, say: 'Stuck riders are now your biggest fans! 🎟️' } },
      { t: '📸 Take a photo of them', fx: { rep: -4, say: 'They did NOT find it funny. 😬' } }
    ] });

  ev({ id: 'ai_jokes', cat: 'funny', icon: '🤖', w: 1.5, cd: 30, cond: TECH,
    title: 'Your AI tells jokes now!',
    text: 'Your team built a robot helper... and it only wants to tell jokes. Bad jokes. 🤖😂',
    choices: [
      { t: '😂 Put it in the shop', fx: { fans: 15, happy: 3, say: '"Why did the robot go on vacation? To recharge." 🤖🔋' } },
      { t: '🔧 Fix it to do real work', fx: { cash: -0.3, equip: 0.04, say: 'Now it works AND tells jokes. Perfect. 🤖✨' } },
      { t: '🎤 Enter it in a comedy contest', fx: { chance: { p: 0.5, win: { fans: 30, viral: [1, 3], say: 'The robot WON the comedy contest! 🤖🏆' }, lose: { fans: 10, say: 'The robot got booed. It\'s sad now. 🤖😢' } } } },
      { t: '🔌 Unplug it', fx: { team: -2, say: 'The team misses the jokes. 😔' } }
    ] });

  // Name shown in the Event Book, with people's names taken out.
  G.bookName = function (d) {
    var t = typeof d.title === 'string' ? d.title : (d.fx && d.fx.say) || (d.fx && d.fx.chance && d.fx.chance.win.say) || d.id;
    return t.replace(/\{[abm]\}/g, 'Someone').replace(/\{rival\}/g, 'A rival').replace(/\{company\}/g, 'Your company')
      .replace(/\{\w+\}/g, '...').split(/[.!?]/)[0].slice(0, 44);
  };
})();
