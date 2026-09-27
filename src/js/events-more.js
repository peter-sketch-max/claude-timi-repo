// All events, part 2: social media, boss stuff, funny, big trouble, world news, mini-games and legendary.
// See the top of events.js for the event format. Every question has exactly 4 responses.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var U = CS.U, G = CS.G, H = CS.EVH, ev = CS.ev;
  var rival = H.rival, amt = H.amt, noCams = H.noCams, hasRole = H.hasRole, season = H.season;
  var FOOD = H.tag('food'), TECH = H.tag('tech');

  // =====================================================================
  // 📱 SOCIAL MEDIA
  // =====================================================================

  ev({ id: 'video_posted', cat: 'social', icon: '🎥', w: 2.5,
    title: 'Someone filmed your shop!',
    text: 'A customer posted a video of your {fronts} at work. People are watching it! 👀',
    choices: [
      { t: '🔁 Share it on your page', fx: { chance: { p: function (g) { return g.satisfaction > 55 ? 0.8 : 0.4; }, win: { fans: 12, chance: { p: 0.2, win: { viral: [1, 4], say: 'IT WENT VIRAL! 🔥' }, lose: { say: 'Nice boost! 📈' } } }, lose: { rep: -3, say: 'The comments are full of complaints. 😬' } } } },
      { t: '🎬 Film a funny reply video', fx: { chance: { p: 0.5, win: { fans: 20, say: 'Your reply got MORE views than the first video! 🎬' }, lose: { fans: 4, say: 'A few people watched it. 🤷' } } } },
      { t: '🎁 Find the customer and thank them', fx: { money: -30, fans: 8, rep: 2, say: 'They made a second video about how nice you are! 💖' } },
      { t: '🤐 Leave it', fx: { fans: 4, say: 'It gets a few thousand views.' } }
    ] });

  ev({ id: 'employee_famous', cat: 'social', icon: '🤳', w: 1.5, cd: 20, who: { a: 'funny' }, rarity: 'rare',
    title: '{a} is famous online!',
    text: 'A video of {a} being hilarious has MILLIONS of views! People come just to meet {a}. 🤩',
    choices: [
      { t: '⭐ Make {a} your mascot', fx: { fans: 30, a: 15, viral: [1, 4], next: ['famous_raise', 3, 6], say: 'Everyone loves {a}! 🎉' } },
      { t: '📸 Photos with {a}: $5 each', fx: { extra: [0.1, 3, 'Photos with a star'], a: 5, say: 'People lined up for photos! 📸💰' } },
      { t: '🎥 Start a weekly show with {a}', fx: { fans: 20, capacity: [0.97, 4, 'Filming the show'], say: '"The {a} Show" is a hit! 📺' } },
      { t: '🤫 Keep it low-key', fx: { fans: 10, a: -10, say: '{a} is a little disappointed.' } }
    ] });

  ev({ id: 'famous_raise', cat: 'team', icon: '💅', kind: 'chat', chainOnly: true, from: 'a',
    title: 'Famous {a} wants more',
    msgs: ['so... I\'m kind of famous now 💅', 'another company offered me DOUBLE', 'what do you say?'],
    choices: [
      { t: '💰 "Double it is!"', fx: { raise: ['a', 1], a: 20, fans: 10, say: 'Your star stays! 🌟' } },
      { t: '🤏 "+25%?"', fx: { chance: { p: 0.5, win: { raise: ['a', 0.25], say: '{a} accepts. Phew! 😅' }, lose: { quit: 'a', fans: -10, say: '{a} left. Some fans followed them. 😢' } } } },
      { t: '👕 "Your own merch line!"', fx: { cash: -0.2, extra: [0.12, 6, 'Star merch'], a: 15, say: '{a} T-shirts are selling like crazy! 👕' } },
      { t: '❌ "No"', fx: { quit: 'a', fans: -15, say: '{a} left and made a video about it. Ouch. 🎥' } }
    ] });

  ev({ id: 'complaint_viral', cat: 'social', icon: '😡', w: function (g) { return g.satisfaction < 50 ? 3 : 0.8; }, cd: 10,
    title: 'A complaint is going viral!',
    text: 'An angry customer\'s post about you has been shared 10,000 times! 😱',
    choices: [
      { t: '🙇 Say sorry publicly', fx: { rep: -2, say: 'People respect it. Mostly. 🙂' } },
      { t: '🎁 Make it right for them', fx: { cash: -0.1, rep: 1, say: 'They updated the post: "They fixed it! ❤️"' } },
      { t: '🎥 Film a funny sorry video', fx: { chance: { p: 0.5, win: { fans: 15, rep: 1, say: 'Your sorry video was SO funny that people forgave you! 😂' }, lose: { rep: -5, say: 'People thought you didn\'t take it seriously. 😬' } } } },
      { t: '🤥 "They\'re lying!"', fx: { chance: { p: 0.4, win: { rep: 1, say: 'Their story fell apart! People are on your side.' }, lose: { rep: -10, viral: [0.5, 2], say: 'Big mistake. It got MUCH bigger. 😱' } } } }
    ] });

  ev({ id: 'meme', cat: 'social', icon: '🐸', w: 1.5, cd: 15,
    title: 'You became a meme! 🐸',
    text: 'Someone made a meme about {company}. It\'s actually really funny. 😂',
    choices: [
      { t: '😂 Join the joke', fx: { chance: { p: 0.7, win: { fans: 20, viral: [0.5, 3], say: 'Your reply got more likes than the meme! 🔥' }, lose: { rep: -3, say: 'Your reply was cringe. 😬' } } } },
      { t: '👕 Print it on T-shirts', fx: { cash: -0.1, extra: [0.08, 4, 'Meme T-shirts'], fans: 8, say: 'Everyone wants the meme shirt! 👕😂' } },
      { t: '🚫 Ask them to delete it', fx: { rep: -3, fans: 10, say: 'Now EVERYONE is sharing it. Oops. 🙈' } },
      { t: '🙈 Ignore it', fx: { fans: 5, say: 'It fades after a few days.' } }
    ] });

  ev({ id: 'influencer', cat: 'social', icon: '✨', w: 2,
    title: 'An influencer LOVES you!',
    text: 'An influencer with 800K followers posted: "{company} is my favorite place ever!" ✨',
    choices: [
      { t: '💖 Say thank you', fx: { fans: 15, rep: 2, say: 'They liked your comment! 💖' } },
      { t: '🤝 Ask for a collab', fx: { chance: { p: 0.6, win: { fans: 30, say: 'Collab video coming soon! 🎬' }, lose: { fans: 12, say: 'They were too busy. Still nice! ✨' } } } },
      { t: '🎁 Send them a thank-you box', fx: { money: -50, fans: 22, say: 'They filmed an unboxing video! 📦✨' } },
      { t: '😎 Play it cool', fx: { fans: 12, say: 'New fans are coming anyway. 😎' } }
    ] });

  ev({ id: 'embarrassing_post', cat: 'social', icon: '🙈', w: 1.5, cd: 15, who: { a: 'any' },
    title: 'Oops! Wrong account!',
    text: '{a} posted a silly selfie on the COMPANY account by mistake. 🤳😳',
    choices: [
      { t: '🗑️ Delete it fast', fx: { rep: -1, say: 'Only a few people saw it.' } },
      { t: '😂 Post another silly selfie', fx: { chance: { p: 0.55, win: { fans: 20, say: 'Everyone loved it! Selfie war! 🤳🤳' }, lose: { rep: -4, say: 'It didn\'t work. 😅' } } } },
      { t: '🤳 Make it "Selfie Friday"', fx: { fans: 10, team: 4, say: 'Every Friday, a new silly staff selfie. Fans love it! 🤳' } },
      { t: '🚪 Fire {a}', fx: { fire: 'a', say: 'Harsh... but the account is safe.' } }
    ] });

  ev({ id: 'rumor_company', cat: 'social', icon: '🧢', w: 1.5, cd: 15, init: rival,
    title: 'A fake rumor!',
    text: 'People online say {company} is closing forever. It\'s NOT true! 🧢',
    choices: [
      { t: '📢 Post the truth', fx: { rep: 1, say: 'Rumor busted! ✅' } },
      { t: '🔍 Find who started it', fx: { cash: -0.3, chance: { p: 0.5, win: { rep: 5, rival: -0.1, say: 'It was {rival}! Now everyone is on YOUR side. 😤' }, lose: { say: 'You couldn\'t find out. 🤷' } } } },
      { t: '🎉 "Not closing" party!', fx: { cash: -0.15, fans: 12, demand: [1.05, 2, 'Not-closing party'], say: 'Everyone came to celebrate that you\'re still open! 🎉' } },
      { t: '🙈 Ignore it', fx: { demand: [0.92, 3, 'Fake rumor'], say: 'Some people believe it. 😕' } }
    ] });

  ev({ id: 'celebrity_mention', cat: 'social', icon: '📺', w: 0.8, cd: 40, rarity: 'epic',
    title: 'A celebrity talked about you on TV!',
    text: 'A super famous star said "{company} is the BEST" on a talk show! The whole country heard it! 📺🌟',
    choices: [
      { t: '🌟 Post the clip everywhere', fx: { fans: 50, viral: [3, 10], say: 'EVERYONE knows you now! 🌟' } },
      { t: '💌 Send the star a gift', fx: { cash: -0.1, fans: 40, rep: 4, say: 'The star posted a thank-you selfie! 💌' } },
      { t: '🛍️ Make a "Star\'s Favorite" special', fx: { fans: 35, demand: [1.2, 4, 'Celebrity favorite'], say: 'Everyone wants the Star\'s Favorite! 🛍️' } },
      { t: '😎 "We knew we were the best"', fx: { fans: 35, rep: 2, say: '😎😎😎' } }
    ] });

  ev({ id: 'hacked', cat: 'social', icon: '🔓', w: 1, cd: 30,
    title: 'Your account got hacked!',
    text: 'Someone hacked your social media and is posting cat pictures. 🐱🐱🐱',
    choices: [
      { t: '🔐 Reset the password', fx: { fans: -5, say: 'Got it back! Some followers left.' } },
      { t: '🐱 Keep the cat pics', fx: { chance: { p: 0.5, win: { fans: 15, say: 'Honestly? The cats got more likes. 😹' }, lose: { rep: -3, say: 'People are confused. 🤔' } } } },
      { t: '🧑‍💻 Hire an expert', fx: { cash: -0.15, say: 'Account back AND super safe now. 🔐' } },
      { t: '😂 Post "We\'re a cat page now"', fx: { fans: 10, say: 'For one week, you were a cat page. Fans loved it. 🐈' } }
    ] });

  ev({ id: 'fan_art', cat: 'social', icon: '🎨', w: 1.5,
    title: 'A fan drew your logo!',
    text: 'A fan drew your logo as a superhero! 🦸 It\'s actually really good.',
    choices: [
      { t: '🖼️ Hang it in the shop', fx: { fans: 6, team: 3, say: 'It looks amazing on the wall! 🖼️' } },
      { t: '🏆 Start a fan art contest', fx: { money: -50, fans: 15, say: 'Hundreds of drawings came in! 🎨🎨🎨' } },
      { t: '👕 Put it on T-shirts (with credit)', fx: { cash: -0.05, extra: [0.05, 4, 'Fan art shirts'], fans: 8, say: 'The artist is SO proud! 👕' } },
      { t: '❤️ Like the post', fx: { fans: 3, say: 'The fan screamed with joy. ❤️' } }
    ] });

  ev({ id: 'livestream', cat: 'social', icon: '🔴', w: 1.5, cd: 15,
    title: 'Go live?',
    text: 'Your team wants to livestream a normal work day. 🔴',
    choices: [
      { t: '🔴 Go live!', fx: { chance: { p: 0.45, win: { viral: [0.5, 3], say: 'Something hilarious happened on stream! 😂' }, lose: { fans: 3, say: 'It was a bit boring. 12 viewers. 😅' } } } },
      { t: '🎲 Live Q&A with the boss', fx: { chance: { p: 0.5, win: { fans: 15, say: 'Great questions, funny answers! 🎤' }, lose: { rep: -2, say: 'Someone asked about your weird haircut. 💇😳' } } } },
      { t: '🎁 Live giveaway', fx: { cash: -0.1, fans: 20, say: 'Thousands joined to win! 🎁' } },
      { t: '🙅 Nah', fx: { say: 'Maybe another day.' } }
    ] });

  ev({ id: 'collab', cat: 'social', icon: '🤝', w: 1.2, cd: 20,
    init: function (g, c) { rival(g, c); c.brand = U.pick(['a sneaker brand', 'a famous candy company', 'a video game', 'a cartoon show', 'a popular band']); },
    title: 'Collab offer! 🤝',
    text: '{brand} wants to do a special collab with {company}!',
    choices: [
      { t: '✅ Let\'s do it!', fx: { cash: -0.4, fans: 25, demand: [1.12, 4, 'Collab hype'], say: 'The collab is a HIT! 🔥' } },
      { t: '🌈 Limited edition only!', fx: { cash: -0.2, fans: 15, extra: [0.15, 2, 'Limited edition'], say: 'Sold out in ONE day! 🌈' } },
      { t: '💰 "You pay us!"', fx: { chance: { p: 0.4, win: { cash: 1, fans: 15, say: 'They paid YOU! 💰' }, lose: { say: 'They went to {rival} instead. 😒' } } } },
      { t: '🙅 Not our style', fx: { say: 'You pass.' } }
    ] });

  ev({ id: 'hashtag', cat: 'social', icon: '#️⃣', w: 1, cd: 25, rarity: 'rare',
    title: '#{company}Challenge!',
    text: 'Someone started a dance challenge with your name! People are dancing outside your shop. 💃',
    choices: [
      { t: '💃 Join the challenge!', fx: { chance: { p: 0.6, win: { fans: 25, viral: [0.5, 2], say: 'Your dance is the most-watched one! 💃🔥' }, lose: { fans: 8, say: 'You tripped. It still got likes. 😂' } } } },
      { t: '🏆 Give a prize for the best dance', fx: { money: -80, fans: 20, say: 'So many entries! 🏆' } },
      { t: '🎵 Make an official song', fx: { cash: -0.2, fans: 15, say: 'The song is catchy! Everyone hums it. 🎵' } },
      { t: '👀 Just watch', fx: { fans: 6, say: 'It\'s fun to watch! 👀' } }
    ] });

  ev({ id: 'post_time', cat: 'social', icon: '📱', kind: 'post', w: 2.5, cd: 6,
    title: 'Your followers want a post!',
    text: 'Your fans are asking for new content! Pick what to post: 📱' });

  // =====================================================================
  // 👔 BOSS STUFF
  // =====================================================================

  ev({ id: 'manager_raise', cat: 'boss', icon: '👔', kind: 'chat', w: 1.5, who: { m: 'mgr' }, from: 'm',
    title: 'Manager {m} wants a raise',
    msgs: ['boss, I run this place 😤', 'I deserve to be paid like it', 'raise please?'],
    choices: [
      { t: '💵 "+12%, you earned it"', fx: { raise: ['m', 0.12], say: '{m} is fired up! 🔥' } },
      { t: '🎁 "Here\'s a bonus instead"', fx: { bonus: 'm', say: 'Not what they asked, but it helps.' } },
      { t: '🏆 "Hit your goals, then yes!"', fx: { m: 3, capacity: [1.06, 4, 'Manager on a mission'], say: '{m} is working super hard to earn it! 💪' } },
      { t: '❌ "No"', fx: { m: -20, say: '{m} is clearly unhappy. 😒' } }
    ] });

  ev({ id: 'fraud_found', cat: 'boss', icon: '🧮', w: 1, minWeek: 15, cd: 30, rarity: 'rare', cond: hasRole('acct'), who: { a: 'acct', b: 'greedy' }, init: amt(1.5),
    title: 'Your accountant found stealing!',
    text: '{a} found fake bills. {b} has been secretly taking money! Total: {amt}. 😱',
    choices: [
      { t: '👮 Fire {b} + call police', fx: { fire: 'b', chance: { p: 0.5, win: { cash: 0.9, say: 'The court made them pay you back! 💰' }, lose: { say: 'The money is gone forever. 😩' } } } },
      { t: '🚪 Just fire {b}', fx: { fire: 'b', say: 'No drama. No money back.' } },
      { t: '🏅 Reward {a} for finding it', fx: { bonus: 'a', fire: 'b', say: '{a} is the hero of the week! 🦸' } },
      { t: '💸 Make {b} pay it back', fx: { cash: 0.7, b: -20, next: ['theft_again', 6, 12, 0.5], say: '{b} pays back half. Can you trust them? 🤨' } }
    ] });

  ev({ id: 'bad_manager', cat: 'boss', icon: '😠', w: 1.5, need: 4, who: { m: 'mgr' },
    title: 'The team doesn\'t like {m}',
    text: 'Workers say manager {m} yells at them and has favorites. 😠',
    choices: [
      { t: '🧑‍🏫 Send {m} to a class', fx: { cash: -0.2, team: 5, say: '{m} came back much nicer. 😊' } },
      { t: '🔄 Swap jobs with {m} for a day', fx: { team: 6, m: -3, say: '{m} had to do the hard work for a day. Now they get it! 😅' } },
      { t: '🛡️ Side with {m}', fx: { team: -8, loyal: { m: 10 }, say: '{m} is happy. The team is not.' } },
      { t: '⬇️ Remove {m} as manager', fx: { demote: 'm', team: 6, say: 'The team quietly cheers. 🎉' } }
    ] });

  ev({ id: 'manager_disagree', cat: 'boss', icon: '⚔️', w: 1.5, cond: function (g) { return g.employees.filter(function (e) { return e.role === 'mgr'; }).length >= 2; }, who: { a: 'mgr', b: 'mgr' },
    title: 'Your managers disagree!',
    text: '{a} wants LOWER prices to get more customers. {b} wants HIGHER prices for more money. You decide!',
    choices: [
      { t: '⬇️ Side with {a}', fx: { price: -1, b: -12, say: 'Prices go down! More customers coming.' } },
      { t: '⬆️ Side with {b}', fx: { price: 1, a: -12, say: 'Prices go up! Each sale makes more money.' } },
      { t: '🪨 Rock paper scissors!', fx: { chance: { p: 0.5, win: { price: -1, a: 8, b: -4, say: '{a} threw paper. {b} threw rock. Prices go DOWN! ✋' }, lose: { price: 1, b: 8, a: -4, say: '{b} threw scissors. {a} threw paper. Prices go UP! ✌️' } } } },
      { t: '😐 Keep things the same', fx: { a: -5, b: -5, rel: ['a', 'b', -15], say: 'Neither is happy. 😑' } }
    ] });

  ev({ id: 'risky_idea', cat: 'boss', icon: '🎲', w: 1.2, minWeek: 12, cd: 25, who: { m: 'ambitious' }, init: amt(4),
    title: 'A BIG risky plan!',
    text: '{m} has a huge plan: spend {amt} on a brand new product line! "Trust me!" 🎲',
    choices: [
      { t: '🎲 Go all in!', fx: { cash: -4, chance: { p: 0.5, win: { demand: [1.25, 20, 'New product line'], fans: 15, m: 15, say: 'It\'s a HIT! 🚀' }, lose: { m: -10, say: 'It flopped. The money is gone. 😭' } } } },
      { t: '🧪 Try a small test', fx: { cash: -0.8, chance: { p: 0.5, win: { demand: [1.08, 10, 'Product test'], say: 'The test went well! 👍' }, lose: { say: 'The test says no. Good thing you checked!' } } } },
      { t: '🗳️ Let customers vote', fx: { fans: 8, chance: { p: 0.6, win: { cash: -1, demand: [1.12, 12, 'Customers\' choice'], say: 'Customers voted YES and they love it! 🗳️' }, lose: { say: 'Customers voted NO. Idea saved for later. 📦' } } } },
      { t: '🙅 No way', fx: { m: -8, say: '{m} sighs and closes the laptop.' } }
    ] });

  ev({ id: 'wants_manager', cat: 'boss', icon: '🙋', w: 1.5, minWeek: 8, need: 4, who: { a: 'notmgr' },
    title: '{a} wants to be a manager',
    text: '{a} really wants to lead the team. They are excited, but have never done it before.',
    choices: [
      { t: '👔 Give {a} a chance', fx: { mgr: 'a', next: ['out_of_depth', 2, 5, 0.45], say: '{a} is SO excited! Can they do it? 🤞' } },
      { t: '🧪 Manager for one week (test)', fx: { chance: { p: 0.5, win: { mgr: 'a', say: 'The test week went GREAT. {a} keeps the job! 👔' }, lose: { a: -4, say: 'Not ready yet. {a} learned a lot though.' } } } },
      { t: '📚 "Learn more first"', fx: { a: -4, skill: { a: 2 }, say: '{a} takes it well.' } },
      { t: '❌ "No"', fx: { a: -12, say: '{a} is hurt. 😢' } }
    ] });

  ev({ id: 'manager_stealing', cat: 'boss', icon: '💰', w: 0.8, minWeek: 15, cd: 30, who: { m: 'mgr' }, init: amt(1), start: { cash: -1 },
    title: 'Manager {m} was stealing!',
    text: '{m} was paying for fake "work trips" with company money. {amt} is gone! 😡',
    choices: [
      { t: '🚪 Fire {m}', fx: { fire: 'm', say: 'You need a new manager now.' } },
      { t: '⬇️ Demote + get the money back', fx: { demote: 'm', cash: 0.7, say: 'You got most of it back. 💰' } },
      { t: '🧹 Make {m} clean the toilets for a month', fx: { m: -20, cash: 0.3, team: 6, say: 'The team LOVES this. {m} does NOT. 🧹😂' } },
      { t: '👮 Call the police', fx: { fire: 'm', rep: 2, chance: { p: 0.5, win: { cash: 0.9, say: 'The court made them pay it ALL back! ⚖️' }, lose: { say: 'The money is gone. At least justice was done.' } } } }
    ] });

  ev({ id: 'investors_angry', cat: 'boss', icon: '📊', w: function (g) { return g.ownership < 80 ? 1.5 : 0; }, minWeek: 10, cd: 20,
    title: 'Your investors want more!',
    text: 'The people who own part of {company} want you to grow FASTER. 📈',
    choices: [
      { t: '⬆️ Raise prices', fx: { price: 1, say: 'Investors are happy. Customers... less so.' } },
      { t: '📢 Promise big growth', fx: { rep: -1, say: 'They will be watching! 👀' } },
      { t: '📊 Show them a cool slideshow', fx: { chance: { p: 0.6, win: { say: 'They loved the slideshow. Especially the dancing chart. 📊💃' }, lose: { run: function (g) { g.ownership = Math.max(10, g.ownership - 2); return 'They were not impressed. They took 2% more. 😬'; } } } } },
      { t: '😎 "Trust the plan"', fx: { chance: { p: 0.5, win: { say: 'They calm down. 😌' }, lose: { run: function (g) { g.ownership = Math.max(10, g.ownership - 3); return 'They made you give them 3% more of the company! 😤'; } } } } }
    ] });

  ev({ id: 'consultant', cat: 'boss', icon: '🧑‍💼', w: 1.2, cd: 25, init: amt(1),
    title: 'A fancy consultant',
    text: 'A consultant in a shiny suit says "I can make you 20% more money!" It costs {amt}. 🧑‍💼',
    choices: [
      { t: '✍️ Hire them', fx: { cash: -1, chance: { p: 0.55, win: { demand: [1.12, 12, 'Consultant tips'], equip: 0.03, say: 'Their ideas actually worked! 📈' }, lose: { say: 'They made a pretty slideshow. That\'s it. 🙄' } } } },
      { t: '🤝 "Pay only if it works"', fx: { chance: { p: 0.4, win: { cash: -0.5, demand: [1.1, 10, 'Consultant tips'], say: 'Deal! And it worked! 📈' }, lose: { say: 'They said no. Suspicious... 🤨' } } } },
      { t: '👀 Ask for one free tip', fx: { chance: { p: 0.5, win: { equip: 0.02, say: 'Their one tip was actually great! 💡' }, lose: { say: '"Work harder." Thanks. 🙄' } } } },
      { t: '🙅 No thanks', fx: { say: 'They leave you their card. ✨' } }
    ] });

  ev({ id: 'focus', cat: 'boss', icon: '🎯', w: 2, cd: 10,
    title: 'Pick this month\'s focus',
    text: 'Your team asks: what should we focus on this month? 🎯',
    choices: [
      { t: '⭐ Quality', fx: { happy: 6, rep: 2, say: 'Everything is a bit better! ⭐' } },
      { t: '⚡ Speed', fx: { capacity: [1.12, 4, 'Speed focus'], say: 'Everything is faster! ⚡' } },
      { t: '📣 Getting noticed', fx: { fans: 12, say: 'More people know about you! 📣' } },
      { t: '😊 Team happiness', fx: { team: 8, say: 'Happy team, happy life! 😊' } }
    ] });

  // =====================================================================
  // 😂 FUNNY
  // =====================================================================

  ev({ id: 'pet', cat: 'funny', icon: '🐶', w: 2, cd: 20, who: { a: 'any' },
    title: '{a} brought a dog to work!',
    text: 'The dog is very cute. 🐶 The dog is also eating a customer\'s sandwich.',
    choices: [
      { t: '🐾 Dogs are welcome here!', fx: { team: 6, chance: { p: 0.8, win: { fans: 6, say: 'Everyone loves the office dog! 🐕' }, lose: { rep: -2, say: 'Happy team! But one customer sneezed nonstop. 🤧' } } } },
      { t: '🐶 Make it the OFFICIAL office dog', fx: { pet: '🐶', team: 8, fans: 8, say: 'Meet Biscuit, your official office dog! 🐶👔' } },
      { t: '🥪 Buy the customer a new sandwich', fx: { money: -10, rep: 2, say: 'The customer laughed and petted the dog. 🥪🐶' } },
      { t: '🚫 No pets', fx: { a: -6, say: 'The dog goes home. Everyone is a little sad. 🥺' } }
    ] });

  ev({ id: 'prank_war', cat: 'funny', icon: '🎭', w: function (g) { return g.employees.some(function (e) { return G.has(e, 'funny'); }) ? 2.5 : 0.5; }, need: 3,
    title: 'PRANK WAR! 🎭',
    text: 'Someone wrapped a desk in tin foil. Then someone put a fake spider in a coffee. It\'s getting crazy!',
    choices: [
      { t: '🎈 Join in!', fx: { team: 8, capacity: [0.95, 1, 'Prank war'], say: 'You filled a car with balloons. LEGENDARY. 🎈🚗' } },
      { t: '🏆 Make it an official contest', fx: { team: 10, fans: 6, capacity: [0.93, 1, 'Prank contest'], say: 'The best prank won a golden rubber chicken. 🐔🏆' } },
      { t: '🕵️ Prank the pranksters', fx: { team: 6, say: 'You wrapped THEIR desks in tin foil. Respect. 😎' } },
      { t: '🛑 Stop it now', fx: { team: -4, say: 'Back to work. Boring. 😐' } }
    ] });

  ev({ id: 'microwave', cat: 'funny', icon: '🍿', w: 1.2, cd: 30,
    title: 'The microwave is GONE',
    text: 'Someone took the office microwave. Lunch is chaos. 🍿😱',
    choices: [
      { t: '🛒 Buy a new one', fx: { money: -150, say: 'Peace returns to the kitchen. 🕊️' } },
      { t: '🔍 Investigate!', fx: { team: 3, say: 'It was found in the closet with a note: "sorry" 📝' } },
      { t: '🍱 Buy a FANCY one', fx: { money: -400, team: 6, say: 'It has 47 buttons and plays music. Everyone loves it. 🎶' } },
      { t: '🥪 Cold lunch week!', fx: { team: -3, say: 'Everyone eats cold sandwiches. Brr. 🥶🥪' } }
    ] });

  ev({ id: 'asleep', cat: 'funny', icon: '😴', w: 2, who: { a: 'lazy' },
    title: '{a} fell asleep in a meeting',
    text: 'In the middle of the meeting... {a} started SNORING. 😴💤',
    choices: [
      { t: '🤫 Let them sleep', fx: { chance: { p: 0.3, win: { skill: { a: 5 }, say: '{a} woke up with a genius idea! Skill +5 💡' }, lose: { team: 2, say: 'Everyone giggled for the whole meeting. 😂' } } } },
      { t: '☕ Wake them with coffee', fx: { say: '{a} says sorry and drinks 3 coffees. ☕☕☕' } },
      { t: '📸 Take a funny photo', fx: { team: 4, a: -3, say: 'The photo is now the team\'s group chat picture. 😂📸' } },
      { t: '🏠 Send them home', fx: { a: -12, say: 'Point made.' } }
    ] });

  ev({ id: 'mega_order', cat: 'funny', icon: '📦', w: 1.2, cd: 30, who: { a: 'any' },
    title: 'Oops! 10,000 instead of 100!',
    text: '{a} typed too many zeros. A GIANT truck of supplies is outside. 🚛📦📦📦',
    choices: [
      { t: '↩️ Send it back (small fee)', fx: { cash: -0.12, say: 'Lesson learned: check the zeros! 🔢' } },
      { t: '🎉 Throw an "Oops Sale"!', fx: { cash: -0.6, fans: 12, demand: [1.15, 2, 'Oops Sale'], supply: [-0.1, 2, 'Extra stock'], say: 'The Oops Sale was a huge hit! 😂' } },
      { t: '🏰 Build a fort with the boxes', fx: { cash: -0.12, team: 10, fans: 8, say: 'Box fort! Then you sent it back. Worth it. 🏰📦' } },
      { t: '📦 Keep it all', fx: { cash: -0.6, supply: [-0.08, 6, 'Extra stock'], say: 'Your storage room is FULL. 📦📦📦' } }
    ] });

  ev({ id: 'internal_msg', cat: 'funny', icon: '💬', w: 1.2, cd: 25,
    title: 'Private message went public!',
    text: 'Someone posted "is the boss here yet? look busy!!" on the COMPANY page. 😳',
    choices: [
      { t: '😂 Reply "The boss is here."', fx: { chance: { p: 0.6, win: { fans: 18, viral: [0.3, 1.5], say: 'People loved it! 😂' }, lose: { say: 'A few laughs. That\'s it.' } } } },
      { t: '🤝 "Look busy" T-shirts', fx: { cash: -0.08, fans: 10, say: 'Staff wear "LOOK BUSY" shirts now. Customers love them. 👕' } },
      { t: '🕵️ Find out who did it', fx: { team: -2, say: 'It was... everyone. They all say "not me". 🙈' } },
      { t: '🗑️ Delete it', fx: { say: 'Only 40 people saw it. Probably. 👀' } }
    ] });

  ev({ id: 'parking', cat: 'funny', icon: '🅿️', w: 1.5, need: 2, who: { a: 'any', b: 'any' },
    title: 'The parking spot war',
    text: '{a} and {b} BOTH want the best parking spot. Now there are angry notes on the cars. 🚗📝',
    choices: [
      { t: '📋 Whoever came first gets it', fx: { b: -6, say: 'Rules are rules.' } },
      { t: '🏆 Worker of the month gets it', fx: { team: 3, say: 'Now everyone works harder for it! 😂' } },
      { t: '🏁 Race for it!', fx: { team: 5, rel: ['a', 'b', 10], say: '{a} and {b} raced on office chairs. {a} won! 🏁🪑' } },
      { t: '😈 Take it yourself', fx: { rel: ['a', 'b', 20], say: 'Now they\'re teaming up... against YOU. 😂' } }
    ] });

  ev({ id: 'lunch_thief', cat: 'funny', icon: '🥪', w: 1.5, cd: 25,
    title: 'The lunch thief strikes again',
    text: 'Someone keeps eating other people\'s lunch from the fridge. The fridge is covered in angry notes. 🥪😤',
    choices: [
      { t: '📷 Put a camera in the fridge', fx: { money: -90, run: function (g) { var e = U.pick(g.employees); return 'Caught! It was ' + (e ? G.first(e) : 'the manager') + '. They bring cake to say sorry. 🍰'; } } },
      { t: '🌶️ Make a SUPER spicy sandwich trap', fx: { team: 5, say: 'Someone screamed "WATER!" at lunch. Case closed. 🌶️😂' } },
      { t: '🍔 Free lunch for all on Friday', fx: { cash: -0.03, team: 4, say: 'Free lunch fixes EVERYTHING. 🍔' } },
      { t: '🔒 Buy lockable lunch boxes', fx: { money: -60, say: 'Lunch is safe now. 🔒🥪' } }
    ] });

  ev({ id: 'birthday', cat: 'funny', icon: '🎂', w: 1.5, need: 2, who: { a: 'any' },
    title: 'It\'s {a}\'s birthday!',
    text: 'Today is {a}\'s birthday! 🎂 What should you do?',
    choices: [
      { t: '🎂 Surprise party!', fx: { money: -60, team: 3, a: 10, say: 'SURPRISE! {a} screamed with joy. 🎉' } },
      { t: '🎤 Everyone sings loudly', fx: { team: 4, a: 5, happy: 1, say: 'Customers joined in singing! 🎤🎶' } },
      { t: '🎁 Day off + gift card', fx: { money: -50, a: 12, capacity: [0.98, 1, 'Birthday day off'], say: '{a} had the best birthday ever! 🎁' } },
      { t: '💌 Just a card', fx: { a: 3, say: 'Everyone signed it. Sweet! 💌' } }
    ] });

  ev({ id: 'goose', cat: 'funny', icon: '🪿', w: 1, cd: 30, rarity: 'rare',
    title: 'A GOOSE got inside!',
    text: 'A goose walked into the shop. It won\'t leave. It is honking at everyone. 🪿📢',
    choices: [
      { t: '🧹 Chase it out', fx: { chance: { p: 0.5, win: { say: 'The goose leaves. Everyone claps. 👏' }, lose: { fans: 15, say: 'The goose chased YOU. Someone filmed it. 😂' } } } },
      { t: '👑 Make it the mascot', fx: { fans: 20, happy: 3, pet: '🪿', say: 'Meet Sir Honksalot, your new mascot! 🪿👑' } },
      { t: '🍞 Bribe it with bread', fx: { money: -5, say: 'The goose took the bread and left. Deal. 🍞🪿' } },
      { t: '📞 Call the goose rescue team', fx: { rep: 2, say: 'The goose was taken to a happy pond. 🦢' } }
    ] });

  ev({ id: 'pajamas', cat: 'funny', icon: '🩳', w: 1.5, who: { a: 'any' },
    title: '{a} came in pajamas!',
    text: '{a} forgot to change and came to work in dinosaur pajamas. 🦖🩳',
    choices: [
      { t: '🦖 Pajama Day for everyone!', fx: { team: 6, fans: 6, say: 'Customers love Pajama Day! 😂' } },
      { t: '📸 Photo for the wall of fame', fx: { team: 3, a: -2, say: 'The dino photo will live forever. 🦖📸' } },
      { t: '🛌 Customers in PJs get a discount', fx: { fans: 10, demand: [1.05, 1, 'PJ discount'], say: 'Half the town came in pajamas! 🛌😂' } },
      { t: '🏠 "Go change, please"', fx: { a: -3, say: '{a} goes home, red-faced. 😳' } }
    ] });

  ev({ id: 'sign_typo', cat: 'funny', icon: '🪧', w: 1, cd: 40,
    init: function (g, c) { c.typo = g.company.name.split('').reverse().join(''); },
    title: 'Your new sign has a typo!',
    text: 'The sign company printed your name BACKWARDS: "{typo}" 🤦',
    choices: [
      { t: '🔧 Fix it', fx: { cash: -0.1, say: 'Fixed. 😌' } },
      { t: '😂 Keep it!', fx: { fans: 15, chance: { p: 0.3, win: { viral: [0.5, 2], say: 'People travel just to take a photo with it! 📸' }, lose: { say: 'Tourists take photos of it. 📸' } } } },
      { t: '🔄 Backwards Day special!', fx: { fans: 12, team: 4, say: 'Everyone walked in backwards. It was chaos. 🔄😂' } },
      { t: '📞 Make the sign company pay', fx: { cash: 0.05, say: 'They fixed it for free and gave you money back! 💰' } }
    ] });

  ev({ id: 'fire_alarm', cat: 'funny', icon: '🍿', w: 1.5, cd: 25, who: { a: 'any' },
    title: 'Burnt popcorn alarm!',
    text: '{a} burned popcorn and set off the fire alarm. Everyone had to go outside! 🚨🍿',
    choices: [
      { t: '🚫 Ban popcorn forever', fx: { team: -3, say: 'Popcorn is now illegal here. 😔🍿' } },
      { t: '😂 Laugh it off', fx: { team: 3, capacity: [0.95, 1, 'Popcorn alarm'], say: '{a} now has the nickname "Popcorn". 🍿' } },
      { t: '🧑‍🍳 Popcorn cooking class', fx: { money: -40, team: 5, say: 'Everyone can make perfect popcorn now. 🍿🎓' } },
      { t: '🍿 Free popcorn for customers outside', fx: { money: -20, fans: 8, happy: 2, say: 'People thought it was a party! 🍿🎉' } }
    ] });

  ev({ id: 'elevator', cat: 'funny', icon: '🛗', w: 1.2, need: 2, who: { a: 'any', b: 'any' },
    title: '{a} and {b} are stuck!',
    text: '{a} and {b} got stuck in the elevator for 2 hours! 🛗😱',
    choices: [
      { t: '🔧 Call the repair team', fx: { cash: -0.05, chance: { p: 0.6, win: { rel: ['a', 'b', 40], say: 'They came out as best friends! 🤝' }, lose: { rel: ['a', 'b', -30], say: 'They came out and never want to see each other again. 😤' } } } },
      { t: '🍕 Slide pizza under the door', fx: { money: -20, rel: ['a', 'b', 30], a: 5, b: 5, say: 'Elevator pizza party! 🍕🛗' } },
      { t: '🎶 Play elevator music', fx: { team: 3, rel: ['a', 'b', 10], say: 'They danced for 2 hours. 🎶🕺' } },
      { t: '🪜 Rescue them yourself!', fx: { chance: { p: 0.5, win: { team: 6, a: 8, b: 8, say: 'HERO BOSS! 🦸' }, lose: { team: 2, say: 'Now YOU are stuck too. 🤦' } } } }
    ] });

  ev({ id: 'same_outfit', cat: 'funny', icon: '👯', w: 1.2, need: 2, who: { a: 'any', b: 'any' },
    title: 'TWINS?!',
    text: '{a} and {b} wore the EXACT same outfit today. 👯',
    choices: [
      { t: '📸 Twin photo!', fx: { rel: ['a', 'b', 15], fans: 4, say: 'The twin photo got lots of likes! 📸' } },
      { t: '👕 Make it the new uniform', fx: { money: -80, team: 5, say: 'Now EVERYONE matches. 👕👕👕' } },
      { t: '🎭 Twin day for customers', fx: { fans: 8, say: 'Twins get a free treat today! 👯🎁' } },
      { t: '😂 Laugh', fx: { rel: ['a', 'b', 10], team: 2, say: 'Too funny! 😂' } }
    ] });

  ev({ id: 'robot_vacuum', cat: 'funny', icon: '🤖', w: 1,
    title: 'The robot vacuum escaped!',
    text: 'Your robot vacuum drove out the door and down the street. 🤖🏃 A kid is chasing it!',
    choices: [
      { t: '🏃 Chase it!', fx: { fans: 6, team: 4, say: 'You caught it at the traffic light. People cheered! 🤖🏁' } },
      { t: '🎥 Film the chase', fx: { chance: { p: 0.4, win: { viral: [0.5, 2], say: 'The chase video went viral! 🤖🔥' }, lose: { fans: 5, say: 'Fun video! 🎥' } } } },
      { t: '🎁 Reward the kid who catches it', fx: { money: -20, rep: 3, say: 'The kid got a reward and a big smile. 😊' } },
      { t: '🤷 Buy a new one', fx: { money: -250, say: 'Bye, little robot. Be free. 🤖👋' } }
    ] });

  ev({ id: 'mystery_smell', cat: 'funny', icon: '🤢', w: 1.2, cd: 30,
    title: 'What is that SMELL?!',
    text: 'Something smells terrible and nobody knows where it\'s coming from. 🤢',
    choices: [
      { t: '🔍 Search everywhere', fx: { team: 2, say: 'Found it: a 3-week-old tuna sandwich behind the fridge. 🐟🤮' } },
      { t: '🕯️ Buy 50 candles', fx: { money: -120, happy: -1, say: 'Now it smells like vanilla AND tuna. 🕯️🐟' } },
      { t: '🐶 Bring in a sniffer dog', fx: { money: -50, team: 3, say: 'The dog found it in 5 seconds. Good boy! 🐶👃' } },
      { t: '🪟 Open ALL the windows', fx: { happy: -2, say: 'Freezing, but fresh. 🥶' } }
    ] });

  ev({ id: 'karaoke', cat: 'funny', icon: '🎤', w: 1.2, need: 3,
    title: 'Karaoke at lunch!',
    text: 'Someone left the karaoke machine on. The whole team is singing. Badly. 🎤😂',
    choices: [
      { t: '🎤 Sing with them!', fx: { team: 8, say: 'Your high note broke a glass. Legend. 🎤🥂' } },
      { t: '🎟️ Karaoke night for customers', fx: { money: -50, fans: 10, extra: [0.05, 1, 'Karaoke night'], say: 'Customers LOVED it! 🎶' } },
      { t: '🎧 Give everyone headphones', fx: { money: -80, team: -2, say: 'Quiet again. 🎧' } },
      { t: '👂 Just listen', fx: { team: 4, say: 'It\'s... something. 😂' } }
    ] });

  ev({ id: 'costume_day', cat: 'funny', icon: '🎃', w: 4, cd: 40, cond: season(42, 44),
    title: 'Halloween! 🎃',
    text: 'The team wants to dress up in costumes at work!',
    choices: [
      { t: '👻 Costumes for everyone!', fx: { cash: -0.05, team: 8, fans: 10, say: 'A zombie served customers. They LOVED it. 🧟' } },
      { t: '🏚️ Turn the shop into a haunted house', fx: { cash: -0.2, fans: 18, extra: [0.1, 1, 'Haunted house'], say: 'Screams AND sales! 👻💰' } },
      { t: '🍬 Just give out candy', fx: { cash: -0.03, happy: 4, say: 'Sweet! 🍬' } },
      { t: '🙅 No costumes', fx: { team: -3, say: 'Boring. 😐' } }
    ] });

  // =====================================================================
  // 🚨 BIG TROUBLE
  // =====================================================================

  ev({ id: 'lawsuit', cat: 'trouble', icon: '⚖️', w: 0.7, minWeek: 20, cd: 40, init: amt(6),
    title: 'You\'re being sued!',
    text: 'A customer says they tripped in your shop. They want {amt}! ⚖️',
    choices: [
      { t: '🤝 Pay them to go away', fx: { cash: -2.5, say: 'Settled quietly. 🤐' } },
      { t: '⚖️ Fight it in court', fx: { cash: -1, chance: { p: 0.55, win: { rep: 3, say: 'You WON! They were faking it. 🎉' }, lose: { cash: -6, rep: -8, say: 'You lost. It\'s all over the news. 😭' } } } },
      { t: '📹 Check the cameras', fx: { chance: { p: function (g) { return G.upLevel(g, 'cameras') ? 0.85 : 0.3; }, win: { rep: 4, say: 'The video shows they tripped on PURPOSE. Case closed! 📹😎' }, lose: { cash: -2, say: 'No clear video. You settle. 😩' } } } },
      { t: '🙏 Say sorry + free stuff for life', fx: { cash: -0.5, rep: 2, chance: { p: 0.6, win: { say: 'They dropped the lawsuit! 🙏' }, lose: { cash: -2, say: 'They took the free stuff AND the money. 😑' } } } }
    ] });

  ev({ id: 'accident', cat: 'trouble', icon: '🚑', w: 0.6, minWeek: 15, cd: 40, who: { a: 'front' },
    title: 'Accident at work!',
    text: '{a} got hurt at work. They will be okay, but everyone is worried about safety. 🚑',
    choices: [
      { t: '🦺 Pay their bills + make it safer', fx: { cash: -1.5, team: 8, loyal: { a: 25 }, say: 'The team trusts you more now. ❤️' } },
      { t: '🎈 Visit {a} with balloons', fx: { money: -40, a: 15, team: 4, cash: -0.5, say: '{a} was so happy you came. 🎈' } },
      { t: '🧑‍🏫 Safety training for all', fx: { cash: -0.6, team: 3, reliable: { a: 5 }, say: 'Everyone knows the safety rules now. 🦺' } },
      { t: '🤏 Pay the minimum', fx: { cash: -0.4, team: -10, next: ['strike', 2, 5, 0.4], say: 'The team is angry at you. 😠' } }
    ] });

  ev({ id: 'bad_batch', cat: 'trouble', icon: '☣️', w: 0.7, minWeek: 12, cd: 40,
    title: 'Some products were bad!',
    text: 'A batch of your {unit} came out wrong. A few customers noticed. Most didn\'t... yet. 😬',
    choices: [
      { t: '📢 Tell everyone + give refunds', fx: { cash: -1.8, rep: 3, say: 'People love your honesty! 🙌' } },
      { t: '🎁 Refund + a free gift', fx: { cash: -2.2, rep: 6, fans: 10, say: 'Customers are even HAPPIER than before! 🎁' } },
      { t: '🔍 Check everything super carefully', fx: { cash: -0.6, capacity: [0.8, 1, 'Checking everything'], rep: 1, say: 'You found and fixed the problem. 🔍✅' } },
      { t: '🤫 Fix it quietly', fx: { chance: { p: 0.5, win: { say: 'Nobody ever found out. 😅' }, lose: { rep: -18, demand: [0.8, 6, 'Cover-up scandal'], say: 'A reporter found out you hid it! 😱' } } } }
    ] });

  ev({ id: 'strike', cat: 'trouble', icon: '🪧', w: function (g) { return G.avgMorale(g) < 38 ? 2 : 0; }, minWeek: 10, cd: 30, need: 4,
    title: 'STRIKE! 🪧',
    text: 'The whole team walked out! They are outside with signs. Nothing is getting done!',
    choices: [
      { t: '💵 Give everyone +10%', fx: { teamRaise: 0.1, say: 'Everyone is back at work! 🙌' } },
      { t: '🤝 Negotiate', fx: { chance: { p: 0.5, win: { teamRaise: 0.05, say: 'You agree on +5%. Deal! 🤝' }, lose: { closed: [1, 'Strike'], team: -5, say: 'Talks failed. Closed next week. 😩' } } } },
      { t: '🍩 Bring donuts to the picket line', fx: { money: -40, chance: { p: 0.5, win: { teamRaise: 0.04, team: 5, say: 'Donuts + a small raise = strike over! 🍩' }, lose: { closed: [1, 'Strike'], say: 'They ate the donuts and kept striking. 🍩🪧' } } } },
      { t: '😤 Wait them out', fx: { closed: [2, 'Strike'], team: -10, rep: -5, say: 'Closed for 2 weeks! 😱' } }
    ] });

  ev({ id: 'cyberattack', cat: 'trouble', icon: '🦠', w: 0.6, minWeek: 20, cd: 40, init: amt(1.2),
    title: 'HACKERS! 🦠',
    text: 'Hackers locked all your computers. They want {amt} to unlock them! 💻🔒',
    choices: [
      { t: '💸 Pay them', fx: { cash: -1.2, chance: { p: 0.8, win: { say: 'They unlocked everything. Phew.' }, lose: { capacity: [0.7, 2, 'Locked computers'], say: 'They took the money and ran! 😡' } } } },
      { t: '💾 Use your backups', fx: { cash: -0.4, capacity: [0.8, 1, 'Restoring computers'], say: 'Takes a week, but you\'re back! 💪' } },
      { t: '🧑‍💻 Hire a good hacker to fight back', fx: { cash: -0.8, chance: { p: 0.5, win: { rep: 4, fans: 10, say: 'Your hacker beat their hacker! 🧑‍💻⚔️' }, lose: { capacity: [0.8, 1, 'Locked computers'], say: 'They were too strong. Back to backups. 😩' } } } },
      { t: '📝 Go paper-only for a while', fx: { capacity: [0.75, 2, 'Paper only'], team: -3, say: 'Pens, paper and patience. 📝' } }
    ] });

  ev({ id: 'supplier_bankrupt', cat: 'trouble', icon: '🏚️', w: 0.5, minWeek: 20, cd: 50,
    title: 'Your supplier closed!',
    text: 'Your main supplier went out of business overnight! You need a new one NOW. 😰',
    choices: [
      { t: '⚡ Pay extra for a fast one', fx: { supply: [0.06, 8, 'Emergency supplier'], say: 'Supplies keep coming, but it costs more.' } },
      { t: '🔍 Take time to find a good one', fx: { capacity: [0.6, 2, 'No supplies'], say: 'Two slow weeks, then back to normal.' } },
      { t: '🏭 Make it yourself!', fx: { cash: -1.5, supply: [-0.03, 20, 'Making your own supplies'], say: 'Expensive to start, but now YOU make it cheaper! 🏭' } },
      { t: '💼 Buy the old supplier', fx: { cash: -2, supply: [-0.04, 26, 'Own supplier'], say: 'You bought them! Cheap supplies for months. 💼' } }
    ] });

  ev({ id: 'kitchen_fire', cat: 'trouble', icon: '🔥', w: 0.7, minWeek: 8, cd: 40, cond: FOOD,
    title: 'FIRE in the kitchen! 🔥',
    text: 'A pan caught fire! Smoke everywhere!',
    choices: [
      { t: '🧯 Use the fire extinguisher', fx: { chance: { p: 0.75, win: { cash: -0.2, team: 3, say: 'Fire out! Hero moment! 🦸' }, lose: { cash: -1, closed: [1, 'Fire damage'], say: 'It spread a bit. Closed for a week to fix it. 😩' } } } },
      { t: '🔲 Cover it with a lid', fx: { chance: { p: 0.8, win: { say: 'Smart! The fire went out instantly. 🔲✅' }, lose: { cash: -0.6, say: 'The lid was too small. Some damage. 😬' } } } },
      { t: '🚒 Everyone out, call for help', fx: { cash: -0.5, closed: [1, 'Fire damage'], say: 'Everyone is safe. That\'s what matters. ❤️' } },
      { t: '🦺 Fire safety training after', fx: { cash: -0.4, team: 3, say: 'It went out, and now everyone knows what to do. 🦺' } }
    ] });

  // =====================================================================
  // 🌍 WORLD NEWS
  // =====================================================================

  ev({ id: 'rival_opens', cat: 'rivals', icon: '🏪', w: 2.5, cd: 16, minWeek: 6, init: rival,
    title: '{rival} is opening next door!',
    text: 'A giant "OPENING SOON" sign just went up across the street. It\'s {rival}! They have super low prices. 😬',
    choices: [
      { t: '💳 Start a loyalty card', fx: { cash: -0.5, fans: 8, demand: [0.95, 4, 'New rival nearby'], say: 'Your regular customers stay with you! ❤️' } },
      { t: '🎉 Throw a bigger party the same day', fx: { cash: -0.8, fans: 15, rival: -0.08, say: 'Your party was WAY more fun than their opening! 🎉' } },
      { t: '💐 Send them a "welcome" cake', fx: { money: -40, rep: 3, chance: { p: 0.5, win: { rival: -0.05, say: 'They felt so bad about stealing your customers that they left town. 😂' }, lose: { demand: [0.9, 6, 'New rival nearby'], say: 'They ate the cake AND your customers. 🎂😤' } } } },
      { t: '🤷 Ignore them', fx: { demand: [0.85, 8, 'New rival nearby'], rival: 0.08, say: 'Some customers try the new place. 😕' } }
    ] });

  ev({ id: 'rival_scandal', cat: 'world', icon: '📰', kind: 'news', w: 1.5, cd: 20, init: rival,
    title: '{rival} caught selling fake stuff!',
    text: 'Big news: {rival} has been selling fakes! Their customers are angry. 😱',
    choices: [
      { t: '🤐 Stay quiet', fx: { demand: [1.05, 3, 'Rival scandal'], rival: -0.1, say: 'Some of their customers come to you anyway.' } },
      { t: '🎟️ "10% off for {rival} customers!"', fx: { cash: -0.2, demand: [1.15, 4, 'Rival scandal'], fans: 10, rival: -0.15, say: 'Smart move! New customers everywhere! 🧠' } },
      { t: '✅ "Our stuff is 100% real" campaign', fx: { cash: -0.3, rep: 5, rival: -0.1, say: 'Everyone trusts you more now! ✅' } },
      { t: '😈 Make fun of them online', fx: { chance: { p: 0.5, win: { fans: 20, rival: -0.12, say: 'Savage! People loved it. 🔥' }, lose: { rep: -5, say: 'People thought you were mean. 😬' } } } }
    ] });

  ev({ id: 'rival_closed', cat: 'world', icon: '📰', kind: 'news', w: 1.2, cd: 25, init: rival,
    title: '{rival} closed a shop!',
    text: '{rival} had to close one of their shops. Their customers need a new place to go! 🏃',
    choices: [
      { t: '👋 Welcome their customers', fx: { demand: [1.12, 6, 'Rival closed a shop'], rival: -0.1, say: 'New faces everywhere! 👋' } },
      { t: '🧑‍🍳 Hire their best workers', fx: { hireSpecial: { role: 'front', skill: 72 }, rival: -0.08, say: 'You hired their star worker! 🌟' } },
      { t: '🏪 Buy their empty shop', fx: { cash: -1.5, demand: [1.2, 12, 'Second shop spot'], say: 'Now it\'s YOUR shop! 🏪' } },
      { t: '💌 Send them a nice note', fx: { rep: 3, demand: [1.06, 4, 'Rival closed a shop'], say: 'Being nice is always cool. 💌' } }
    ] });

  ev({ id: 'trend_news', cat: 'world', icon: '📈', kind: 'news', w: 1.5, cd: 20,
    title: 'Your business is the NEW trend!',
    text: 'Everybody online is talking about {industry} places this month! More people want to buy from you.',
    choices: [
      { t: '🚀 Ride the wave!', fx: { cash: -0.3, demand: [1.25, 4, 'Hot trend'], say: 'You\'re part of the trend! 🌊' } },
      { t: '💰 Raise prices a bit', fx: { price: 1, demand: [1.1, 4, 'Hot trend'], say: 'People pay more because it\'s trendy! 💰' } },
      { t: '📱 Post trendy videos', fx: { fans: 20, demand: [1.12, 4, 'Hot trend'], say: 'Your videos ride the trend! 📱' } },
      { t: '😌 Enjoy the extra customers', fx: { demand: [1.12, 4, 'Hot trend'], say: 'Nice! 📈' } }
    ] });

  ev({ id: 'price_news', cat: 'world', icon: '📰', kind: 'news', w: 1, cd: 30,
    title: 'Supplies cost more everywhere!',
    text: 'The price of supplies is going up for every business in the country. 📈😬',
    choices: [
      { t: '📦 Buy a big stock now', fx: { cash: -0.6, say: 'Smart! You bought before prices went up. 📦' } },
      { t: '💸 Raise your prices too', fx: { price: 1, supply: [0.03, 6, 'Supply prices up'], say: 'Everyone else did too. 💸' } },
      { t: '🔍 Find a cheaper supplier', fx: { chance: { p: 0.5, win: { say: 'Found one! Prices stay the same. 🔍✅' }, lose: { supply: [0.03, 6, 'Supply prices up'], say: 'No luck. Costs are up. 😩' } } } },
      { t: '🤷 Accept it', fx: { supply: [0.03, 6, 'Supply prices up'], say: 'Costs are a bit higher for a while.' } }
    ] });

  ev({ id: 'healthy_trend', cat: 'world', icon: '🥗', kind: 'news', w: 1, cd: 30, cond: FOOD,
    title: 'Everyone is eating healthy now!',
    text: 'A new health trend is here! People want healthy food. 🥗',
    choices: [
      { t: '🥗 Add healthy options', fx: { cash: -0.3, demand: [1.1, 6, 'Healthy menu'], say: 'Health fans love your new menu! 💚' } },
      { t: '🥦 Make EVERYTHING green', fx: { cash: -0.2, chance: { p: 0.5, win: { fans: 15, say: 'The green menu went viral! 🥦🔥' }, lose: { happy: -4, say: 'Green pizza? Customers were confused. 🟩🍕' } } } },
      { t: '🏃 Run a fun run event', fx: { cash: -0.15, fans: 10, rep: 2, say: '200 people ran in your T-shirts! 🏃' } },
      { t: '🍔 "We\'re not changing!"', fx: { demand: [0.95, 3, 'Health trend'], fans: 4, say: 'Some people love that you stay the same!' } }
    ] });

  ev({ id: 'sponsor_team', cat: 'world', icon: '⚽', w: 1.2, cd: 30,
    title: 'Sponsor a kids\' team?',
    text: 'The local kids\' soccer team needs new shirts. They want YOUR logo on them! ⚽',
    choices: [
      { t: '👕 Yes!', fx: { cash: -0.3, rep: 4, fans: 10, say: 'Your logo is on 15 tiny shirts. They won their first game! 🏆' } },
      { t: '⚽ Yes + come to every game', fx: { cash: -0.35, rep: 6, fans: 12, team: 3, say: 'You\'re their biggest fan now! 📣' } },
      { t: '🍕 Pizza after games instead', fx: { money: -80, rep: 3, say: 'The kids love pizza more than shirts anyway. 🍕' } },
      { t: '🙅 Not now', fx: { say: 'Maybe next season.' } }
    ] });

  ev({ id: 'tv_show', cat: 'lucky', icon: '📺', w: 0.8, cd: 40, rarity: 'epic',
    title: 'A TV show wants YOU!',
    text: 'A TV show wants to film a whole episode at {company}! 📺🎬',
    choices: [
      { t: '🎬 Yes! Roll the cameras!', fx: { chance: { p: 0.75, win: { fans: 60, rep: 5, viral: [2, 6], say: 'The episode was a hit! You\'re famous! 🌟' }, lose: { fans: 25, rep: -4, say: 'They made you look a bit silly... but people know you now! 😅' } } } },
      { t: '🧹 Yes, but clean EVERYTHING first', fx: { cash: -0.2, fans: 45, rep: 6, say: 'Sparkly clean and famous! ✨📺' } },
      { t: '🎭 Let your {fronts} be the stars', fx: { fans: 40, team: 10, say: 'Your team were natural TV stars! 🎭' } },
      { t: '🙈 Too scary', fx: { say: 'Maybe it\'s better this way.' } }
    ] });

  ev({ id: 'grant', cat: 'lucky', icon: '🏛️', w: 1, cd: 40,
    title: 'You won a city prize!',
    text: 'The city picked {company} for its "Small Business Star" prize! 🏛️💰',
    choices: [
      { t: '💰 Take the money', fx: { cash: 0.8, say: 'Money in the bank! 💰' } },
      { t: '🛠️ Use it to upgrade the shop', fx: { cash: 0.3, equip: 0.03, say: 'Better machines = faster work! 🛠️' } },
      { t: '🎉 Big party with the city', fx: { cash: 0.5, fans: 15, rep: 3, say: 'The mayor danced! 🕺🏛️' } },
      { t: '❤️ Share it with a charity', fx: { cash: 0.4, rep: 6, say: 'Half to charity. Everyone loves you! ❤️' } }
    ] });

  ev({ id: 'old_painting', cat: 'lucky', icon: '🖼️', w: 0.8, cd: 50, rarity: 'rare',
    title: 'You found an old painting!',
    text: 'While cleaning the storage room, you found a dusty old painting. 🖼️ Is it worth anything?',
    choices: [
      { t: '💰 Sell it', fx: { chance: { p: 0.3, win: { cash: 6, say: 'It was by a FAMOUS painter! 🤑🤑' }, lose: { cash: 0.1, say: 'It was painted by someone\'s grandma. 😂' } } } },
      { t: '🔍 Ask an expert first', fx: { money: -100, chance: { p: 0.3, win: { cash: 7, say: 'The expert gasped. It\'s worth a FORTUNE! 🤑' }, lose: { say: '"It\'s nice... but not famous." 🖼️' } } } },
      { t: '🏛️ Give it to a museum', fx: { rep: 5, fans: 10, say: 'Your name is on a museum wall now! 🏛️' } },
      { t: '🖼️ Hang it on the wall', fx: { happy: 3, say: 'It makes the shop look fancy. 🎩' } }
    ] });

  // =====================================================================
  // 🍀 MINI-GAMES
  // =====================================================================

  ev({ id: 'mystery_boxes', cat: 'lucky', icon: '🎁', kind: 'boxes', w: 2.5, cd: 7,
    title: 'Mystery boxes!',
    text: 'A delivery driver dropped off 4 mystery boxes by mistake. "Keep one!" Pick a box! 🎁',
    prizes: [
      { label: 'A bag of cash', emoji: '💰', w: 3, fx: { cash: 1.2 } },
      { label: 'A viral video', emoji: '📱', w: 2, fx: { fans: 25 } },
      { label: 'A super worker', emoji: '🦸', w: 1, fx: { hireSpecial: { role: 'front', skill: 88, traits: ['hardworking', 'friendly'] } } },
      { label: 'Happy customers', emoji: '🥰', w: 2, fx: { happy: 8, rep: 3 } },
      { label: 'Old socks', emoji: '🧦', w: 2, fx: { say: 'Just old socks. Yuck! 🤢' } },
      { label: 'A toy snake', emoji: '🐍', w: 1.5, fx: { team: 4, say: 'It\'s a toy! Everyone laughed. 😂' } },
      { label: 'A puppy!', emoji: '🐶', w: 0.6, fx: { pet: '🐶', team: 8, say: 'A PUPPY! Everyone is in love. 🐶❤️' } },
      { label: 'Golden ticket', emoji: '🎫', w: 0.5, fx: { cash: 4, fans: 20 } }
    ] });

  ev({ id: 'lucky_wheel', cat: 'lucky', icon: '🎡', kind: 'wheel', w: 2.5, cd: 7,
    title: 'Spin the Lucky Wheel!',
    text: 'The Business Fair has a prize wheel. How do you want to play? 🎡',
    slices: [
      { label: 'Cash', emoji: '💰', color: '#FFB020', w: 3, fx: { cash: 0.7 } },
      { label: 'Followers', emoji: '📱', color: '#FF5FA2', w: 2.5, fx: { fans: 20 } },
      { label: 'Reputation', emoji: '⭐', color: '#7C4DFF', w: 2.5, fx: { rep: 5 } },
      { label: 'Oops', emoji: '💸', color: '#FF4D5E', w: 2, bad: true, fx: { cash: -0.4 } },
      { label: 'Party', emoji: '🎉', color: '#20C997', w: 2.5, fx: { team: 10 } },
      { label: 'JACKPOT', emoji: '💎', color: '#2EA8FF', w: 0.6, jackpot: true, fx: { cash: 5, fans: 30 } },
      { label: 'Lucky week', emoji: '🍀', color: '#12B886', w: 2, fx: { demand: [1.2, 2, 'Lucky week'] } },
      { label: 'Nothing', emoji: '🙃', color: '#ADB5BD', w: 2, bad: true, fx: { say: 'Better luck next time!' } }
    ] });

  ev({ id: 'rush_hour', cat: 'lucky', icon: '🏃', kind: 'tap', w: 2.5, cd: 8,
    title: 'RUSH HOUR!',
    text: 'A HUGE crowd just walked in! Tap the customers as fast as you can to serve them! 🏃‍♀️',
    target: '🙋', goal: 18, secs: 7,
    win: { cash: 0.8, happy: 5, say: 'Everyone got served! 🙌' }, lose: { happy: -3, say: 'Some customers left without buying. 😕' } });

  ev({ id: 'catch_thief', cat: 'lucky', icon: '🦹', kind: 'tap', w: 2, cd: 10, cond: noCams,
    title: 'STOP THAT THIEF!',
    text: 'A thief grabbed stuff and is running away! Tap them to catch them! 🦹',
    target: '🦹', goal: 14, secs: 6,
    win: { cash: 0.3, rep: 3, fans: 6, say: 'GOT THEM! 👮 You\'re a hero!' }, lose: { cash: -0.5, say: 'They got away... 😩' } });

  ev({ id: 'leak_tap', cat: 'lucky', icon: '💧', kind: 'tap', w: 1.5, cd: 12,
    title: 'LEAKS EVERYWHERE!',
    text: 'The pipes are leaking! Tap the drops to plug them before the shop floods! 💧',
    target: '💧', goal: 16, secs: 7,
    win: { cash: 0.2, say: 'All leaks plugged! 🔧' }, lose: { cash: -0.5, say: 'Too much water got in. Clean-up costs money. 💦' } });

  ev({ id: 'bug_squash', cat: 'lucky', icon: '🐛', kind: 'tap', w: 2, cd: 10, cond: TECH,
    title: 'BUG ATTACK!',
    text: 'Bugs are crawling through your code! Squash them before launch! 🐛',
    target: '🐛', goal: 18, secs: 7,
    win: { rep: 3, fans: 8, say: 'Bug-free launch! 🚀' }, lose: { rep: -3, say: 'Some bugs got through. Users are grumpy. 😤' } });

  ev({ id: 'balloon_party', cat: 'lucky', icon: '🎈', kind: 'tap', w: 1.5, cd: 12, need: 2,
    title: 'Balloon party!',
    text: 'It\'s the company birthday! Pop as many balloons as you can! 🎈',
    target: '🎈', goal: 20, secs: 7,
    win: { team: 10, say: 'Best party ever! 🥳' }, lose: { team: 4, say: 'Still a fun party! 🎉' } });

  ev({ id: 'coin_rain', cat: 'lucky', icon: '🪙', kind: 'tap', w: 1.5, cd: 12, rarity: 'rare',
    title: 'IT\'S RAINING COINS!',
    text: 'A money truck tipped over and the driver says "keep what you catch!" Tap the coins! 🪙',
    target: '🪙', goal: 22, secs: 7,
    win: { cash: 1.5, say: 'Your pockets are FULL! 🤑' }, lose: { cash: 0.4, say: 'You caught a few! 🪙' } });

  function quizGen() {
    var t = U.ri(0, 4), q, ans, opts, money = true;
    if (t === 0) {
      var price = U.ri(3, 15), paid = price <= 5 ? 10 : 20; ans = paid - price;
      q = 'A customer buys something for $' + price + '. They pay with $' + paid + '. How much change do you give back?';
      opts = [ans, ans + 1, ans + 2, ans - 1, ans + 3];
    } else if (t === 1) {
      var n = U.ri(2, 9), p = U.ri(2, 6); ans = n * p;
      q = 'You sell ' + n + ' things for $' + p + ' each. How much money did you make?';
      opts = [ans, ans + p, ans - p, n + p, ans + 2 * p];
    } else if (t === 2) {
      var sell = U.ri(8, 20), costx = U.ri(2, sell - 2); ans = sell - costx;
      q = 'You sell a toy for $' + sell + '. It cost you $' + costx + ' to make. How much PROFIT did you make?';
      opts = [ans, sell + costx, ans + 2, ans - 2, ans + 1];
    } else if (t === 3) {
      var full = U.pick([10, 20, 40, 50, 100]), pct = U.pick([10, 20, 50]); ans = full - full * pct / 100;
      q = 'Something costs $' + full + '. It\'s ' + pct + '% off today! What is the new price?';
      opts = [ans, full - pct, full * pct / 100, ans + 5, ans - 5];
    } else {
      var w = U.ri(2, 6), each = U.pick([5, 10, 20, 25]); ans = w * each; money = false;
      q = 'You have ' + w + ' workers. Each one helps ' + each + ' customers a day. How many customers get help in one day?';
      opts = [ans, w + each, ans + each, ans - each, ans + 2 * each];
    }
    var uniq = [];
    opts.forEach(function (o) { if (uniq.indexOf(o) < 0 && o > 0) uniq.push(o); });
    for (var k = 1; uniq.length < 4; k++) if (uniq.indexOf(ans + k * 4) < 0) uniq.push(ans + k * 4);
    uniq = U.shuffle(uniq.slice(0, 4));
    return { q: q, options: uniq.map(function (o) { return (money ? '$' : '') + o; }), answer: uniq.indexOf(ans) };
  }
  ev({ id: 'quiz', cat: 'lucky', icon: '🧠', kind: 'quiz', w: 2.5, cd: 6,
    init: function (g, c) { c.q = quizGen(); },
    title: 'Business Brain Quiz!',
    text: 'Answer right to win a prize! 🧠',
    win: { cash: 0.5, xp: 20, say: 'Big brain! 🧠✨' }, lose: { say: 'Nice try! You\'ll get the next one. 💪' } });

  ev({ id: 'investor_deal', cat: 'lucky', icon: '💼', kind: 'deal', w: 1.2, cd: 20, minWeek: 12,
    cond: function (g) { return g.ownership > 30; },
    init: function (g, c) { c.pct = U.pick([5, 10, 15]); c.offer = U.nice(G.stakeOffer(g, c.pct) * 0.8); c.round = 0; c.own = Math.round(g.ownership); },
    title: 'An investor wants in!',
    text: 'A rich investor wants to buy {pct}% of {company}. You own {own}% right now. Make a deal!',
    accept: function (g, c) { return { money: c.offer, run: function (gg) { gg.ownership -= c.pct; return 'You sold ' + c.pct + '% of the company.'; } }; },
    acceptSay: 'Deal! 🤝 {offerTxt} is in your account!' });

  ev({ id: 'buy_recipe', cat: 'lucky', icon: '📜', kind: 'deal', w: 1, cd: 25, minWeek: 8,
    init: function (g, c) { c.offer = U.nice(G.scale(g) * 0.6); c.round = 0; },
    title: 'Someone wants your secret!',
    text: 'A big company wants to buy your secret recipe. They will copy it, so you\'ll get a few fewer customers for a while.',
    accept: function (g, c) { return { money: c.offer, demand: [0.95, 8, 'Secret sold'] }; },
    acceptSay: 'Sold! 🤝 {offerTxt} for your secret.' });

  ev({ id: 'movie_filming', cat: 'lucky', icon: '🎬', kind: 'deal', w: 1, cd: 30, minWeek: 5, rarity: 'rare',
    init: function (g, c) { c.offer = U.nice(G.scale(g) * 0.9); c.round = 0; },
    title: 'A movie wants to film here!',
    text: 'A movie crew wants to film a scene in your shop! You\'d have to close for a week. How much will they pay?',
    accept: function (g, c) { return { money: c.offer, closed: [1, 'Movie filming'], fans: 20 }; },
    acceptSay: 'Lights, camera, action! 🎬 {offerTxt} for you!' });

  ev({ id: 'price_war', cat: 'rivals', icon: '🥊', kind: 'vs', w: 3, cd: 6, minWeek: 3, init: rival,
    title: '{rival} wants a BATTLE!',
    text: '{rival} is trying to steal your customers! Pick your move.',
    win: { fans: 15, demand: [1.15, 4, 'Won the battle'], rep: 2 }, lose: { demand: [0.9, 3, 'Lost the battle'] }, tie: { fans: 4 } });

  ev({ id: 'interview', cat: 'team', icon: '🧑‍💼', kind: 'interview', w: 2.5, cd: 6,
    init: function (g, c) {
      var role = U.weighted(['front', 'sales', 'acct', 'mgr'], function (r) { return { front: 60, sales: 20, acct: 10, mgr: 10 }[r]; });
      c.cand = G.makeEmployee(g, role, { skill: U.ri(35, 90) });
      c.cand.salary = Math.round(c.cand.salary * 0.95);
    },
    title: 'Someone wants a job!',
    text: 'A person walks in with a smile. "Hi! Are you hiring?" Ask ONE question, then decide!' });

  // =====================================================================
  // ✨ LEGENDARY (super rare and weird)
  // =====================================================================

  ev({ id: 'alien', cat: 'weird', icon: '👽', rarity: 'legendary', w: 1, minWeek: 10, cd: 200,
    title: 'An ALIEN walked in! 👽',
    text: 'A little green alien bought some {unit} and paid with a glowing space coin. 🪙✨',
    choices: [
      { t: '🪙 Keep the space coin', fx: { chance: { p: 0.5, win: { cash: 8, say: 'A museum paid a FORTUNE for it! 🤑' }, lose: { say: 'It stopped glowing. Now it\'s just a coin. 😐' } } } },
      { t: '📸 Take a selfie with the alien', fx: { viral: [5, 15], fans: 40, say: 'The selfie broke the internet! 👽🤳' } },
      { t: '🛸 Offer it a job', fx: { hireSpecial: { name: 'Zorp Blip', face: '👽', role: 'front', skill: 99, traits: ['hardworking', 'funny'], salaryMult: 0.5 }, fans: 20, say: 'Zorp joined the team! 👽 "Beep boop, happy to help."' } },
      { t: '🌍 Ask to open a shop on its planet', fx: { extra: [0.4, 12, 'Space shop'], fans: 25, say: '{company} is now the first business in SPACE! 🪐' } }
    ] });

  ev({ id: 'time_traveler', cat: 'weird', icon: '⏳', rarity: 'legendary', w: 1, minWeek: 10, cd: 200,
    title: 'A time traveler appears!',
    text: 'A person in shiny clothes says: "I\'m from the year 3000. {company} becomes HUGE in the future!" ⏳',
    choices: [
      { t: '🔮 "Give me tips!"', fx: { demand: [1.2, 12, 'Tips from the future'], say: 'The tips are... weirdly good. 🤯' } },
      { t: '📈 "Which products win?"', fx: { equip: 0.06, say: 'They drew a machine on a napkin. It WORKS. 🚀' } },
      { t: '🎟️ "Take me with you!"', fx: { fans: 30, say: 'They laughed and vanished. You only got a selfie. 📸⏳' } },
      { t: '🤨 "Sure you are."', fx: { team: 3, say: 'They vanish in a puff of smoke. Wait, WHAT? 💨' } }
    ] });

  ev({ id: 'cat_ceo', cat: 'weird', icon: '🐈', rarity: 'legendary', w: 1, cd: 200,
    title: 'A cat took your chair',
    text: 'A fluffy stray cat keeps sitting in YOUR boss chair. The team calls it "the CEO". 🐈👔',
    choices: [
      { t: '👔 Make the cat official CEO', fx: { fans: 50, team: 12, viral: [3, 10], pet: '🐈', say: 'Mr. Whiskers, CEO, is now world famous! 🐈👑' } },
      { t: '🐾 Adopt it as office cat', fx: { team: 8, fans: 15, pet: '🐈', say: 'Best office cat ever. 😻' } },
      { t: '🪑 Buy a second boss chair', fx: { money: -200, team: 5, pet: '🐈', say: 'Now you BOTH have a boss chair. 🪑🐈' } },
      { t: '🏡 Find its owner', fx: { rep: 4, say: 'The owner cried with joy. 🥹' } }
    ] });

  ev({ id: 'royal_visit', cat: 'weird', icon: '👑', rarity: 'legendary', w: 1, minWeek: 15, cd: 200,
    title: 'A real prince visits!',
    text: 'A REAL prince from a faraway kingdom is visiting your shop! 👑✨',
    choices: [
      { t: '🎺 Roll out the red carpet', fx: { cash: -0.5, fans: 60, rep: 10, say: 'The prince says it was the best visit of his trip! 👑' } },
      { t: '😎 Treat him like everyone', fx: { rep: 5, fans: 25, say: 'He loved being treated normally! 😄' } },
      { t: '🤝 Ask to sell in his kingdom', fx: { extra: [0.3, 12, 'Royal deal'], fans: 20, say: 'You are now the Royal Supplier! 👑📦' } },
      { t: '🙇 Bow SO low you fall over', fx: { fans: 35, viral: [1, 4], say: 'The prince laughed. The video went viral. 😂👑' } }
    ] });

  ev({ id: 'ghost', cat: 'weird', icon: '👻', rarity: 'legendary', w: 1, cd: 200,
    title: 'Is the shop HAUNTED? 👻',
    text: 'Staff say things move by themselves at night. Spooky whispers too! 👻',
    choices: [
      { t: '🔦 Start ghost tours!', fx: { extra: [0.3, 8, 'Ghost tours'], fans: 30, say: 'Ghost tours sell out every night! 👻🎟️' } },
      { t: '🧹 Call ghost hunters', fx: { cash: -0.3, team: 5, say: 'It was a raccoon. 🦝 A very dramatic raccoon.' } },
      { t: '👋 Say hi to the ghost', fx: { team: 4, fans: 10, say: 'The lights blinked twice. It said hi back?! 😱👻' } },
      { t: '💼 Hire the ghost', fx: { capacity: [1.1, 12, 'Ghost night shift'], fans: 20, say: 'The ghost works the night shift now. For free. 👻💼' } }
    ] });

  ev({ id: 'meteor', cat: 'weird', icon: '☄️', rarity: 'legendary', w: 1, cd: 200,
    title: 'A METEOR landed outside!',
    text: 'A tiny glowing space rock crashed in your parking lot! ☄️ Scientists are on the way.',
    choices: [
      { t: '💰 Sell it to scientists', fx: { cash: 6, say: 'Space rocks are worth a LOT! 🤑' } },
      { t: '🏛️ Put it on display', fx: { demand: [1.25, 10, 'Meteor display'], fans: 40, say: 'People come from everywhere to see it! ☄️📸' } },
      { t: '🧪 Let scientists study it', fx: { rep: 10, fans: 25, say: 'They named the meteor after {company}! 🔬☄️' } },
      { t: '🍭 Sell meteor-shaped treats', fx: { extra: [0.25, 8, 'Meteor treats'], fans: 20, say: 'Meteor treats are the hottest thing in town! ☄️🍭' } }
    ] });

  ev({ id: 'dino_bone', cat: 'weird', icon: '🦖', rarity: 'legendary', w: 1, cd: 200,
    title: 'Dinosaur bone found!',
    text: 'Workers fixing your floor found a DINOSAUR BONE underneath! 🦴🦖',
    choices: [
      { t: '🏛️ Give it to a museum', fx: { rep: 15, fans: 40, say: 'The museum named the dinosaur after {company}! 🦖' } },
      { t: '💰 Sell it', fx: { cash: 5, rep: -3, say: 'Rich! But some people think you should have given it away. 🤔' } },
      { t: '⛏️ Keep digging!', fx: { chance: { p: 0.5, win: { cash: 8, fans: 30, say: 'You found a WHOLE dinosaur! 🦖🤯' }, lose: { cash: -0.5, closed: [1, 'Big hole in the floor'], say: 'Just a big hole. Oops. 🕳️' } } } },
      { t: '🦖 Dino-themed week!', fx: { fans: 30, demand: [1.2, 6, 'Dino week'], say: 'Kids went CRAZY for Dino Week! 🦕🦖' } }
    ] });

  ev({ id: 'superhero', cat: 'weird', icon: '🦸', rarity: 'legendary', w: 1, cd: 200,
    title: 'A superhero saved the day!',
    text: 'Someone in a superhero costume stopped a robbery at {company}! The video is everywhere! 🦸‍♀️',
    choices: [
      { t: '🦸 Ask them to be your mascot', fx: { fans: 50, viral: [2, 6], say: 'Your shop has its own superhero now! 🦸‍♀️' } },
      { t: '🎁 Free stuff for life!', fx: { rep: 8, fans: 30, say: 'The hero salutes you and flies away. (Actually walks.) 🦸' } },
      { t: '🕵️ Find out who they are', fx: { chance: { p: 0.5, win: { team: 10, fans: 30, say: 'It was one of YOUR workers! 🤯🦸' }, lose: { fans: 25, say: 'Nobody knows. Mysterious! 🤫' } } } },
      { t: '📺 Tell the news', fx: { fans: 40, rep: 6, say: '{company} is on every news channel! 📺' } }
    ] });

  ev({ id: 'robot_applicant', cat: 'weird', icon: '🤖', rarity: 'legendary', w: 1, minWeek: 10, cd: 200,
    title: 'A robot wants a job!',
    text: 'A shiny robot rolls in. "HELLO. I AM ROBO-3000. I WANT TO WORK HERE." 🤖',
    choices: [
      { t: '🤖 "You\'re hired!"', fx: { hireSpecial: { name: 'Robo 3000', face: '🤖', role: 'front', skill: 95, traits: ['reliable', 'serious'], salaryMult: 0.4 }, fans: 25, say: 'Robo-3000 never gets tired! 🔋' } },
      { t: '🤖🤖 "Do you have friends?"', fx: { hireSpecial: { name: 'Robo 3001', face: '🤖', role: 'front', skill: 90, traits: ['reliable', 'funny'], salaryMult: 0.4 }, capacity: [1.1, 8, 'Robot helpers'], say: 'Two robots joined! Beep boop x2! 🤖🤖' } },
      { t: '🎤 Teach it to dance', fx: { fans: 35, viral: [1, 3], say: 'The robot dance went VIRAL. 🤖💃' } },
      { t: '🙅 "Humans only!"', fx: { team: 6, say: 'Your team is relieved. 😅' } }
    ] });

  ev({ id: 'rainbow', cat: 'weird', icon: '🌈', rarity: 'epic', w: 1, cd: 100,
    title: 'A DOUBLE rainbow! 🌈🌈',
    text: 'A double rainbow appeared right over {company}. Everyone is outside taking photos!',
    choices: [
      { t: '📸 Photo with the whole team', fx: { fans: 25, team: 6, say: 'Best team photo EVER! 🌈📸' } },
      { t: '🌈 Rainbow sale!', fx: { demand: [1.15, 2, 'Rainbow sale'], happy: 6, say: 'Everything rainbow-colored is half price! 🌈' } },
      { t: '🍀 Look for the pot of gold', fx: { chance: { p: 0.25, win: { cash: 3, say: 'THERE WAS GOLD! 🍀💰' }, lose: { say: 'No gold. Just mud. 🥾' } } } },
      { t: '😌 Just enjoy it', fx: { happy: 10, say: 'Beautiful. 🌈' } }
    ] });

  ev({ id: 'twins', cat: 'weird', icon: '👯', rarity: 'epic', w: 1, cd: 100, who: { a: 'any' },
    title: '{a} has a secret twin!',
    text: 'A person who looks EXACTLY like {a} walks in. "Hi! I\'m their twin. Can I work here too?" 👯',
    choices: [
      { t: '👯 Hire the twin!', fx: { fans: 10, run: function (g, c) { var a = G.emp(g, c.a); if (!a) return ''; var t = G.makeEmployee(g, a.role, { name: 'Twin ' + a.name, face: a.face, skill: a.skill, traits: a.traits.slice() }); G.addEmployee(g, t); return 'Now nobody knows who is who. 😂'; } } },
      { t: '🔍 Test: who is the real one?', fx: { team: 6, fans: 8, say: 'Nobody could tell. Not even their mom. 👯😂' } },
      { t: '📸 Twin photo day', fx: { fans: 12, say: 'Twin photos everywhere! 📸' } },
      { t: '🙅 One is enough', fx: { say: 'The twin waves goodbye. 👋' } }
    ] });
})();
