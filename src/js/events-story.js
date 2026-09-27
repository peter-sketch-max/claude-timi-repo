// Story events: what happens next. Most of these only appear as a follow-up to another event, either right away
// (fx.then) or a few weeks later (fx.next). Forgive someone, and they might come back with the same trick.
// See the top of events.js for the event format and the style rules. Every question has exactly 4 responses.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var H = CS.EVH, E = CS.E, man = H.man;
  var CH = { chainOnly: true };

  // =====================================================================
  // 🧾 THE REFUND SCAMMER  (starts with refund_scam)
  // =====================================================================

  E('scammer_caught', 'customers', '🕵️', '{name} is a scammer', 'The receipts are fake. He has been stealing from you for months. He\'s still standing at the counter.', [
    ['🗣️ Confront him', { chance: { p: 0.5, win: { cash: 0.3, say: 'He paid it all back and left red-faced.' }, lose: { rep: -2, next: ['scammer_revenge', 1, 3, 0.7], say: 'He stormed out, shouting that you\'ll regret it.' } } }],
    ['👮 Call the police', { rep: 3, cash: 0.2, say: 'He was arrested. He had scammed five other shops too.' }],
    ['🤝 Forgive him', { rep: 1, next: ['scammer_returns', 1, 3, 0.85], say: 'He thanked you and walked out smiling.' }],
    ['⚠️ "Last chance."', { next: ['scammer_returns', 2, 5, 0.5], say: 'He swore he would never do it again.' }]
  ], CH);

  E('scammer_returns', 'customers', '🧾', '{name} is back. Same trick.', 'Another fake receipt. Another sad story. He thinks you\'ll fall for it again.', [
    ['👮 Call the police now', { rep: 4, cash: 0.2, say: 'Arrested this time. The whole street heard about it.' }],
    ['🚫 Ban him for life', { rep: 2, say: 'His photo is behind the counter now.' }],
    ['🤝 Forgive him again', { cash: -0.1, next: ['scammer_returns', 1, 3, 0.9], say: 'He smiled all the way out. He\'ll be back.' }],
    ['📸 Post his photo online', { chance: { p: 0.6, win: { fans: 10, rep: 2, say: 'Other shops thanked you. He was banned everywhere.' }, lose: { rep: -4, say: 'People said you went too far.' } } }]
  ], CH);

  E('scammer_revenge', 'customers', '😈', '{name} wants revenge', 'Thirty fake 1-star reviews appeared overnight. All from new accounts. All about you.', [
    ['🚩 Report every review', { chance: { p: 0.7, win: { say: 'All removed in a day.' }, lose: { rep: -3, say: 'Half of them stayed up.' } } }],
    ['⚖️ Sue him', { cash: -0.3, chance: { p: 0.6, win: { cash: 0.8, rep: 3, say: 'The judge made him pay. He deleted everything.' }, lose: { say: 'Not enough proof. He got away with it.' } } }],
    ['📢 Tell the true story', { chance: { p: 0.6, win: { fans: 20, rep: 3, say: 'People believed you. His plan backfired.' }, lose: { rep: -2, say: 'Some people believed him.' } } }],
    ['🤐 Ignore it', { rep: -4, say: 'Your rating dropped for weeks.' }]
  ], CH);

  // =====================================================================
  // 🏃 THE SHOPLIFTER  (starts with shoplifter)
  // =====================================================================

  E('thief_caught', 'customers', '🧢', 'You caught the thief: {name}', 'A teenager, shaking. "Please don\'t call the police. My mom will kill me."', [
    ['👮 Call the police', { rep: 2, say: 'The police drove him home. His mom was waiting.' }],
    ['📞 Call his parents', { rep: 3, chance: { p: 0.7, win: { say: 'His mom came, furious. He said sorry to everyone.' }, lose: { next: ['thief_returns', 2, 4], say: 'His dad just shrugged. You have a bad feeling.' } } }],
    ['🧹 Make him work it off', { next: ['thief_reformed', 3, 6, 0.6], say: 'He swept floors all week. He worked hard.' }],
    ['🤝 Let him go', { next: ['thief_returns', 1, 3, 0.7], say: 'He ran off without a word.' }]
  ], CH);

  E('thief_returns', 'customers', '🏃', '{name} is stealing again', 'Same kid. Same jacket. This time he brought two friends.', [
    ['👮 Police this time', { rep: 3, say: 'All three were caught outside.' }],
    ['🗣️ Stop all three', { chance: { p: 0.5, win: { rep: 3, say: 'They dropped everything and ran.' }, lose: { cash: -0.3, say: 'They got away with a lot.' } } }],
    ['💼 Offer him a job instead', { chance: { p: 0.5, win: { hireSpecial: { role: 'front', skill: 40, traits: ['loyal'] }, say: 'He took it. His friends left without him.' }, lose: { say: 'He laughed and ran.' } } }],
    ['🔒 Lock up the good stuff', { cash: -0.1, happy: -2, say: 'Harder to steal. Harder to shop.' }]
  ], CH);

  E('thief_reformed', 'customers', '🌱', '{name} wants a real job', 'The kid who stole from you. He says working here changed him.', [
    ['✅ Hire him', { hireSpecial: { role: 'front', skill: 50, traits: ['hardworking', 'loyal'] }, rep: 3, say: 'He became one of your hardest workers.' }],
    ['📝 One trial week', { chance: { p: 0.7, win: { hireSpecial: { role: 'front', skill: 45, traits: ['loyal'] }, say: 'He passed. He was early every day.' }, lose: { say: 'It didn\'t work out. No hard feelings.' } } }],
    ['📚 Help him finish school', { cash: -0.1, rep: 5, say: 'He graduated. He sent you a photo.' }],
    ['🙅 "No thanks."', { say: 'He nodded and left quietly.' }]
  ], CH);

  // =====================================================================
  // 💸 THE THIEF ON YOUR TEAM  (starts with theft)
  // =====================================================================

  E('theft_confession', 'team', '😢', '{a} admits stealing', '{a} breaks down crying. "My mom is sick. I needed money for her medicine."', [
    ['👮 Call the police', { fire: 'a', rep: 1, team: -4, say: '{a} was arrested. The team is shaken.' }],
    ['🚪 Fire {a} quietly', { fire: 'a', say: '{a} left without looking back.' }],
    ['🤝 Forgive and help', { a: 25, loyal: { a: 30 }, cash: -0.2, next: ['theft_relapse', 4, 8, 0.25], say: 'You helped pay for the medicine. {a} cried.' }],
    ['💸 "Pay it all back."', { a: -5, cash: 0.2, next: ['theft_relapse', 3, 6, 0.4], say: '{a} will pay it back, week by week.' }]
  ], CH);

  E('theft_relapse', 'team', '💸', 'Money is missing again', 'The register is short again. {a} was working. Again.', [
    ['🚪 Fire {a}', { fire: 'a', say: 'This time there was no second chance.' }],
    ['💬 Ask {a} first', { chance: { p: 0.5, win: { a: 10, say: 'It wasn\'t {a}. A customer grabbed it.' }, lose: { fire: 'a', say: '{a} confessed. You had no choice.' } } }],
    ['👮 Call the police', { fire: 'a', rep: 1, say: '{a} was taken away.' }],
    ['🤝 One more chance', { cash: -0.3, next: ['theft_relapse', 2, 5, 0.6], say: '{a} promised. Again.' }]
  ], CH);

  // =====================================================================
  // 🕵️ THE SPY  (starts with spy)
  // =====================================================================

  E('spy_caught', 'team', '🕵️', '{a} spies for {rival}', '"They pay me to send them your plans. I\'m sorry."', [
    ['🚪 Fire {a}', { fire: 'a', rival: -0.03, say: 'Gone. {rival} lost their spy.' }],
    ['🎭 Make {a} a double agent', { a: -5, next: ['double_agent', 2, 4], say: '{a} will feed them lies from now on.' }],
    ['⚖️ Sue {rival}', { cash: -0.4, chance: { p: 0.5, win: { cash: 1.5, rival: -0.15, say: 'You won. {rival} paid a fortune.' }, lose: { say: '{rival}\'s lawyers were better.' } } }],
    ['🤝 Forgive {a}', { loyal: { a: 10 }, next: ['spy_again', 3, 6, 0.6], say: '{a} promised to stop.' }]
  ], CH);

  E('double_agent', 'rivals', '🎭', '{a} stole {rival}\'s plans', '{a} fed them fake plans and came back with theirs. {rival} launches a big sale on Friday.', [
    ['🏷️ Launch your sale first', { demand: [1.15, 3, 'Beat their sale'], rival: -0.1, say: 'Your sale started Thursday. Theirs flopped.' }],
    ['📢 Leak their plan', { fans: 15, rival: -0.08, say: 'Everyone knew their surprise before they did.' }],
    ['🎁 Reward {a}', { bonus: 'a', loyal: { a: 20 }, say: '{a} is loyal to you now.' }],
    ['🤔 It could be a trap', { chance: { p: 0.5, win: { rep: 2, say: 'It was a trap. You didn\'t fall for it.' }, lose: { rival: 0.05, say: 'It was real. You missed your chance.' } } }]
  ], CH);

  E('spy_again', 'team', '🕵️', '{a} is spying again', '{rival} copied your new product in two days. Only {a} knew about it.', [
    ['🚪 Fire {a}', { fire: 'a', rival: -0.03, say: 'Done. No more chances.' }],
    ['⚖️ Sue {a} and {rival}', { cash: -0.4, chance: { p: 0.5, win: { cash: 1, rival: -0.1, say: 'You won.' }, lose: { say: 'You lost the case.' } } }],
    ['💬 Confront {a}', { chance: { p: 0.4, win: { loyal: { a: 20 }, say: '{rival} was threatening {a}. You helped.' }, lose: { quit: 'a', say: '{a} quit and joined {rival}.' } } }],
    ['🙈 Let it go', { rival: 0.08, say: '{rival} got stronger.' }]
  ], CH);

  // =====================================================================
  // 🗣️ THE CUSTOMER WHO ALWAYS COMPLAINS  (starts with karen_manager)
  // =====================================================================

  E('karen_returns', 'customers', '🗣️', '{name} is back, and louder', 'Last time you gave in. Now she wants a free meal for her whole family.', [
    ['🙅 Firmly say no', { rep: 2, team: 5, say: 'She left. Your team clapped.' }],
    ['🎁 Give it to her', { cash: -0.1, team: -4, next: ['karen_returns', 1, 3, 0.9], say: 'She left happy. She\'ll be back.' }],
    ['🚪 Ban her', { rep: -1, team: 8, say: 'She posted about it. Nobody cared.' }],
    ['📜 "No more discounts."', { happy: -1, team: 4, say: 'A sign on the door. For everyone.' }]
  ], CH);

  // =====================================================================
  // 🧥 THE PROTECTION GANG  (starts with protection)
  // =====================================================================

  E('gang_revenge', 'shady', '🪟', 'The men in suits came back at night', 'Your windows are smashed. A note on the door: "Last warning."', [
    ['👮 Take the note to the police', { cash: -0.3, chance: { p: 0.6, win: { rep: 5, say: 'Arrested. The street is safe.' }, lose: { say: 'The police can\'t find them.' } } }],
    ['🧑‍🤝‍🧑 Unite all the shops', { cash: -0.3, rep: 6, team: 5, say: 'Every shop stood together. They never came back.' }],
    ['💵 Pay them', { cash: -0.8, next: ['protection_again', 3, 6], say: 'They took the money. They\'ll want more.' }],
    ['📹 Cameras and a guard', { cash: -0.9, say: 'Your shop is a fortress now.' }]
  ], CH);

  // =====================================================================
  // 🥖 THE HUNGRY MAN  (starts with hungry_stranger)
  // =====================================================================

  E('stranger_returns', 'lucky', '🤵', 'The hungry man came back', '{name}, the man you fed, now owns three restaurants. He wants to thank you.', [
    ['🎁 Accept his gift', { cash: 1.5, say: 'An envelope full of money. "You saved me."' }],
    ['🤝 Work together', { extra: [0.08, 12, 'Old friend'], say: 'His restaurants buy from you now.' }],
    ['❤️ Ask him to help others', { rep: 8, fans: 20, say: 'Together you feed fifty people every week.' }],
    ['🙂 "Seeing you is enough."', { rep: 5, say: 'He hugged you and cried.' }]
  ], CH);

  // =====================================================================
  // 🍺 THE DRUNK CUSTOMER  (starts with drunk_customer)
  // =====================================================================

  E('drunk_apology', 'customers', '🙏', '{name} came back to apologize', 'Sober and embarrassed. He wants to pay for the damage.', [
    ['🤝 Accept', { cash: 0.2, rep: 2, say: 'He paid, and shook everyone\'s hand.' }],
    ['🎁 "It\'s on the house."', { rep: 4, say: 'He became one of your best regulars.' }],
    ['💼 He offers a big order', { extra: [0.2, 1, 'His company order'], say: 'He runs a company. He ordered big.' }],
    ['🙅 "Don\'t come back."', { say: 'He nodded and left.' }]
  ], CH);

  // =====================================================================
  // 🧒 THE LOST KID  (starts with lost_kid)
  // =====================================================================

  E('kid_parents', 'lucky', '👪', 'The lost kid\'s parents came back', 'They own a big company. "You took care of our son. How can we thank you?"', [
    ['🤝 A business deal', { extra: [0.1, 10, 'Grateful parents'], say: 'Their company became your biggest client.' }],
    ['🎁 "Nothing needed."', { rep: 5, fans: 15, say: 'They told everyone how kind you were.' }],
    ['🏫 A donation to a school', { rep: 8, say: 'They paid for a new playground in {city}.' }],
    ['💵 Accept a reward', { cash: 0.8, say: 'A generous reward.' }]
  ], CH);

  // =====================================================================
  // 💍 THE PROPOSAL  (starts with proposal)
  // =====================================================================

  E('wedding_booking', 'customers', '💒', 'The couple wants their wedding here', 'The man who proposed in your shop is getting married. They want you to host.', [
    ['💒 Host the wedding', { closed: [1, 'Wedding'], extra: [0.5, 1, 'Wedding'], fans: 20, say: 'The most beautiful day. Photos everywhere.' }],
    ['🍰 Do the food only', { extra: [0.25, 1, 'Wedding food'], say: 'Every guest asked where the food was from.' }],
    ['🎁 A wedding gift', { cash: -0.1, rep: 4, say: 'They cried when they opened it.' }],
    ['🙅 Too busy', { say: 'They understood. They still sent a photo.' }]
  ], CH);

  // =====================================================================
  // 👵 THE OLD LADY  (starts with elderly_scam)
  // =====================================================================

  E('grandma_gift', 'lucky', '👵', 'The old lady you saved sent a letter', '"You saved my savings. I\'m old, and I have no family. I want to leave something to you."', [
    ['🙏 Accept kindly', { cash: 2, say: 'She passed away a year later. She remembered you.' }],
    ['❤️ Give it to charity', { cash: 0.5, rep: 8, say: 'Her money helped a hundred families.' }],
    ['☕ Visit her every week', { rep: 5, team: 4, say: 'She taught you how to bake her famous pie.' }],
    ['🙅 "I can\'t accept that."', { rep: 3, say: 'She laughed. "Stubborn. Like me."' }]
  ], CH);

  // =====================================================================
  // 😨 THE STALKER  (starts with stalker)
  // =====================================================================

  E('stalker_back', 'team', '😨', 'The man is back outside', 'He\'s waiting across the street again. {a} is terrified.', [
    ['👮 Get a restraining order', { cash: -0.2, a: 15, say: 'He must stay away now. {a} can breathe.' }],
    ['🚗 Drive {a} home every night', { a: 12, loyal: { a: 20 }, say: 'You never let {a} walk alone.' }],
    ['🧑‍🤝‍🧑 The team walks together', { team: 6, a: 10, say: 'Nobody walks alone anymore.' }],
    ['🗣️ Confront him yourself', { chance: { p: 0.5, win: { a: 12, say: 'He left and never came back.' }, lose: { a: -5, say: 'He laughed. It got worse.' } } }]
  ], CH);

  // =====================================================================
  // 📸 THE INFLUENCER  (starts with influencer_blackmail)
  // =====================================================================

  E('influencer_more', 'customers', '📸', 'The influencer wants more', '"Free stuff for my friends too. Or I post the video."', [
    ['🚫 Say no this time', { chance: { p: 0.5, win: { fans: 15, say: 'Nobody believed their video.' }, lose: { rep: -5, say: 'The video hurt.' } } }],
    ['🎁 Give in again', { cash: -0.4, next: ['influencer_more', 2, 4, 0.8], say: 'They\'ll be back again.' }],
    ['🎥 Expose them', { chance: { p: 0.6, win: { fans: 30, rep: 3, say: 'Everyone saw the blackmail. They apologized.' }, lose: { rep: -3, say: 'People said you were petty.' } } }],
    ['⚖️ Call a lawyer', { cash: -0.2, rep: 2, say: 'One letter. They stopped.' }]
  ], CH);

  E('influencer_war', 'social', '📉', 'The influencer posted about you', 'A video called "Worst place in {city}". It has 100,000 views.', [
    ['🎥 Post your side', { chance: { p: 0.6, win: { fans: 20, say: 'Your fans defended you.' }, lose: { rep: -3, say: 'Their fans attacked your page.' } } }],
    ['🎁 Free week to win people back', { cash: -0.3, happy: 5, say: 'People came to see for themselves.' }],
    ['⚖️ Sue for lies', { cash: -0.3, chance: { p: 0.5, win: { rep: 4, say: 'They deleted it and said sorry.' }, lose: { say: 'The video stayed up.' } } }],
    ['🤐 Ignore it', { demand: [0.93, 3, 'Bad video'], say: 'It faded after a few weeks.' }]
  ], CH);

  // =====================================================================
  // 🦈 THE LOAN SHARK  (starts with loan_shark)
  // =====================================================================

  E('loan_shark_collects', 'shady', '🦈', 'The loan shark wants double', '"Interest went up." He wants twice what you borrowed. By Friday.', [
    ['💸 Pay it', { cash: -1.5, say: 'Painful. But he\'s gone.' }],
    ['👮 Go to the police', { chance: { p: 0.6, win: { rep: 4, say: 'He was arrested. You owe nothing.' }, lose: { cash: -0.8, say: 'His friends paid you a visit.' } } }],
    ['🤝 Pay half, ask for time', { cash: -0.7, next: ['loan_shark_collects', 2, 4, 0.6], say: 'He took it. He\'ll be back for the rest.' }],
    ['🏦 Get a bank loan to pay him', { cash: -1, supply: [0.02, 12, 'Bank loan'], say: 'You\'re free of him.' }]
  ], CH);

  // =====================================================================
  // 🕶️ THE GREEDY INSPECTOR  (starts with shady_inspector)
  // =====================================================================

  E('inspector_greedy', 'shady', '🕶️', 'The inspector is back for more', '"Same deal as last time? Price went up."', [
    ['💵 Pay again', { cash: -0.5, next: [['inspector_greedy', 4, 8, 0.5], ['bribe_exposed', 4, 10, 0.4]], say: 'He smiled and left.' }],
    ['📹 Record him this time', { chance: { p: 0.6, win: { rep: 8, fans: 15, say: 'He was arrested. You\'re a hero.' }, lose: { cash: -0.8, say: 'He found problems everywhere. Big fine.' } } }],
    ['🛠️ Fix everything properly', { cash: -0.7, rep: 2, say: 'Nothing to find. He left angry.' }],
    ['📞 Call his boss', { chance: { p: 0.5, win: { rep: 5, say: 'He was fired.' }, lose: { cash: -0.6, say: 'His boss is in on it.' } } }]
  ], CH);

  // =====================================================================
  // 🍺 THE WORKER WHO DRINKS  (starts with worker_drunk)
  // =====================================================================

  E('worker_recovered', 'team', '🌅', '{a} is sober now', 'Three months without a drink. {a} wants to thank you for not giving up on them.', [
    ['🎉 Celebrate with the team', { cash: -0.05, team: 8, a: 15, say: 'The whole team cheered.' }],
    ['🪜 Give {a} a bigger job', { promote: 'a', a: 12, say: '{a} was ready for it.' }],
    ['🤗 A quiet thank you', { a: 10, loyal: { a: 15 }, say: '{a} will never forget.' }],
    ['📝 Help others the same way', { rep: 5, team: 5, say: 'You started a help program for workers.' }]
  ], CH);

  E('worker_drunk_again', 'team', '🍺', '{a} is drunk at work again', 'Worse than last time. {a} dropped a whole tray in front of customers.', [
    ['🏥 Pay for treatment', { cash: -0.4, a: 10, capacity: [0.95, 4, '{a} in treatment'], next: ['worker_recovered', 8, 14, 0.6], say: '{a} agreed to get help.' }],
    ['🚪 Fire {a}', { fire: 'a', team: -3, say: 'Hard, but you had to.' }],
    ['⚠️ Final warning', { a: -10, next: ['worker_drunk_again', 2, 5, 0.5], say: '{a} promised. Again.' }],
    ['🏠 Unpaid leave', { a: -5, capacity: [0.95, 2, '{a} away'], say: '{a} went home to think.' }]
  ], CH);

  // =====================================================================
  // 🗣️ THE BANNED CUSTOMER  (starts with customer_yell)
  // =====================================================================

  E('banned_lawyer', 'trouble', '⚖️', '{name} is suing you for the ban', 'The customer who screamed at you hired a lawyer. They say the ban was unfair.', [
    ['⚖️ Fight it', { cash: -0.3, chance: { p: 0.7, win: { rep: 3, say: 'The judge laughed them out of court.' }, lose: { cash: -0.4, say: 'You lost. You had to lift the ban.' } } }],
    ['📹 Show the video', { chance: { p: 0.8, win: { rep: 4, fans: 10, say: 'The video ended it in one minute.' }, lose: { cash: -0.2, say: 'The video had no sound.' } } }],
    ['🤝 Settle quietly', { cash: -0.3, say: 'Done. Annoying, but done.' }],
    ['🔓 Lift the ban', { team: -6, next: ['karen_returns', 1, 3, 0.7], say: 'Your team is not happy.' }]
  ], CH);

  // =====================================================================
  // ✋ THE SLAP  (starts with slapped_you)
  // =====================================================================

  E('slap_court', 'trouble', '⚖️', 'The slap case is in court', 'The customer who slapped you says you started it. The judge wants to hear you.', [
    ['🗣️ Tell the truth, calmly', { chance: { p: 0.75, win: { rep: 4, cash: 0.3, say: 'The judge believed you. They paid a fine to you.' }, lose: { say: 'The judge called it a draw.' } } }],
    ['📹 Bring the camera video', { chance: { p: 0.9, win: { rep: 5, cash: 0.3, say: 'Case closed in five minutes.' }, lose: { say: 'The camera missed it.' } } }],
    ['🧑‍⚖️ Hire a lawyer', { cash: -0.3, rep: 3, say: 'Your lawyer made it easy. You won.' }],
    ['🤝 Drop the case', { rep: 1, say: 'You let it go. Life is short.' }]
  ], CH);

  E('slapper_apology', 'customers', '🙏', 'The slapper came back to apologize', '{name} is embarrassed. "I was having the worst day of my life. I\'m so sorry."', [
    ['🤝 Accept the apology', { rep: 3, say: 'They shook your hand. They\'re a regular now.' }],
    ['☕ Listen to their story', { rep: 4, team: 3, say: 'Their mom had just died. You understood.' }],
    ['🚫 Still banned', { team: 3, say: 'Rules are rules.' }],
    ['📱 Film it for your page', { fans: 15, rep: -2, say: 'Lots of views. Some called it cringe.' }]
  ], CH);

  // =====================================================================
  // 🚨 THE BREAK-IN  (starts with break_in)
  // =====================================================================

  E('burglar_known', 'trouble', '📹', 'The burglar is {name}', 'Your neighbor\'s son. Nineteen years old. His parents are begging you not to press charges.', [
    ['⚖️ Press charges', { cash: 0.2, rep: 1, say: 'He went to court. The money came back.' }],
    ['🤝 Let him pay it back', { cash: 0.3, rep: 3, say: 'He paid every cent, working weekends.' }],
    ['💼 Offer him a job', { chance: { p: 0.5, win: { hireSpecial: { role: 'front', skill: 45, traits: ['loyal'] }, rep: 4, say: 'He never stole again. He works hard.' }, lose: { next: ['thief_returns', 3, 6], say: 'He took the job. Then he stopped showing up.' } } }],
    ['🙈 Forget it', { next: ['burglar_again', 3, 8, 0.5], say: 'His parents cried with relief.' }]
  ], CH);

  E('burglar_again', 'trouble', '🚨', 'Another break-in. Same way in.', 'The same window. The same shoes on the camera. It\'s {name} again.', [
    ['👮 Police, no discussion', { rep: 3, say: 'Arrested this time.' }],
    ['🗣️ Talk to his parents', { chance: { p: 0.5, win: { cash: 0.3, say: 'They paid it back and sent him away to his uncle.' }, lose: { cash: -0.3, say: 'They didn\'t believe you.' } } }],
    ['🔒 A proper alarm', { cash: -0.6, say: 'Nobody gets in now.' }],
    ['🤝 Forgive him again', { cash: -0.4, next: ['burglar_again', 3, 8, 0.6], say: 'Some people never learn.' }]
  ], CH);

  // =====================================================================
  // 🦹 SABOTAGE AND REVENGE  (starts with rival_sabotage)
  // =====================================================================

  E('rival_retaliates', 'rivals', '💥', '{rival} hit back', 'Your delivery truck has four flat tires. A note says: "Now we\'re even."', [
    ['🕊️ Call a truce', { chance: { p: 0.6, win: { say: 'Both bosses shook hands. It\'s over.' }, lose: { next: ['rival_retaliates', 2, 4, 0.5], say: 'They laughed at you.' } } }],
    ['👮 Report them', { cash: -0.2, chance: { p: 0.5, win: { rival: -0.12, rep: 3, say: 'Caught on camera. They paid a big fine.' }, lose: { say: 'No proof.' } } }],
    ['😈 Hit back harder', { chance: { p: 0.4, win: { rival: -0.12, next: ['rival_retaliates', 2, 4, 0.7], say: 'They had a terrible week.' }, lose: { rep: -10, cash: -0.5, say: 'You got caught. It\'s all over the news.' } } }],
    ['🔧 Fix it and move on', { cash: -0.2, say: 'You rose above it.' }]
  ], CH);

  E('fake_plan_flop', 'rivals', '🎭', '{rival} fell for your fake plan', 'They launched the fake product their spy photographed. Nobody wants it.', [
    ['📢 Laugh about it publicly', { fans: 25, rival: -0.05, say: 'The whole city is laughing at them.' }],
    ['🚀 Launch your real plan now', { demand: [1.12, 4, 'Real plan'], rival: -0.05, say: 'Perfect timing.' }],
    ['🤐 Stay quiet', { rep: 3, rival: -0.05, say: 'Classy. They know what you did.' }],
    ['🎁 Send them a thank-you card', { fans: 15, rival: -0.08, say: 'They were furious. Everyone else loved it.' }]
  ], CH);

  // =====================================================================
  // 💼 BIG CLIENTS AND INVESTORS
  // =====================================================================

  E('big_client_returns', 'business', '📦', 'The big client wants a yearly deal', 'They loved the last order. Now they want the same every month for a year.', [
    ['✍️ Sign it', { extra: [0.08, 16, 'Yearly deal'], say: 'Steady money all year.' }],
    ['📈 Raise the price', { chance: { p: 0.5, win: { extra: [0.11, 16, 'Yearly deal'], say: 'They agreed.' }, lose: { say: 'They went to {rival}.' } } }],
    ['🧑‍💼 Hire for it, then sign', { hireSpecial: { role: 'front', skill: 55 }, extra: [0.08, 16, 'Yearly deal'], say: 'A new worker just for this client.' }],
    ['🙅 Too much work', { say: 'You passed.' }]
  ], CH);

  E('investor_checkin', 'money', '📊', 'Your investor wants results', '"I gave you money. Show me it was worth it."', [
    ['📊 Show your numbers', { chance: { p: function (g) { return g.reputation > 55 ? 0.7 : 0.4; }, win: { cash: 1, say: 'She was impressed. She invested more.' }, lose: { rep: -2, say: 'She wasn\'t happy. She\'s watching you.' } } }],
    ['🎤 Share big plans', { chance: { p: 0.5, win: { cash: 1.2, say: 'She loved your plan.' }, lose: { say: '"Talk is cheap."' } } }],
    ['🍽️ Dinner with the team', { cash: -0.05, team: 4, rep: 2, say: 'She loved meeting everyone.' }],
    ['🙏 Ask for more time', { say: 'She gave you three more months.' }]
  ], CH);

  E('rival_favor', 'rivals', '🤝', '{rival} wants their favor back', 'They helped when your supplier failed. Now they need to borrow your best worker for a week.', [
    ['🤝 Keep your word', { capacity: [0.93, 1, 'Worker lent'], rep: 4, say: 'A deal is a deal. {rival} respects you now.' }],
    ['💵 Pay them instead', { cash: -0.3, say: 'Money settles it.' }],
    ['🙅 Refuse', { rep: -3, rival: 0.05, say: 'They told everyone you break promises.' }],
    ['📦 Lend them stock instead', { cash: -0.2, rep: 2, say: 'They accepted.' }]
  ], CH);

  // =====================================================================
  // 💵 THE MYSTERY TIPPER (a whole story)
  // =====================================================================

  E('mystery_tipper', 'customers', '💌', 'Someone leaves a huge tip every Friday', 'An envelope under a cup, always the same handwriting. Always a lot of money.', [
    ['🔍 Find out who it is', { then: 'tipper_revealed', say: 'You watched the cameras all night.' }],
    ['💌 Leave a thank-you note', { cash: 0.2, next: ['tipper_revealed', 1, 3], say: 'The next week there was a reply: "You\'ll see."' }],
    ['🎁 Share it with the team', { team: 8, cash: 0.1, say: 'Every Friday is payday now.' }],
    ['🤷 Just enjoy it', { cash: 0.3, next: ['tipper_revealed', 3, 6, 0.6], say: 'Some mysteries are nice.' }]
  ], { w: 0.8, cd: 80, minWeek: 10, init: man });

  E('tipper_revealed', 'customers', '💌', 'The mystery tipper is {name}', 'An old man who worked here 40 years ago, when it was a different shop. "This place was my whole life."', [
    ['🪑 A special seat for him', { rep: 5, say: 'He comes every day now. He tells the best stories.' }],
    ['🖼️ His photo on the wall', { rep: 4, fans: 10, say: 'Customers love hearing his story.' }],
    ['🤝 Hire him part-time', { hireSpecial: { role: 'front', skill: 60, traits: ['loyal', 'friendly'] }, say: 'He\'s the happiest worker you have.' }],
    ['🙏 Ask him to stop tipping', { rep: 3, say: 'He laughed. "Never."' }]
  ], CH);

  // =====================================================================
  // 🕶️ UNDERCOVER BOSS (a whole story)
  // =====================================================================

  E('undercover', 'boss', '🕶️', 'Go undercover in your own company?', 'A fake mustache, a new name, one week working with your team. Nobody would know.', [
    ['🕶️ Do it', { then: 'undercover_week', say: 'Day one. Nobody recognized you.' }],
    ['📋 Send a secret shopper', { cash: -0.1, then: 'undercover_week', say: 'Your secret shopper took notes all week.' }],
    ['🙅 Trust your team', { team: 4, say: 'You trust them. They feel it.' }],
    ['📢 Ask for honest feedback', { team: 2, rep: 1, say: 'Most people were too polite to be honest.' }]
  ], { w: 0.6, cd: 80, minWeek: 12, need: 3, who: { a: 'any', b: 'any' } });

  E('undercover_week', 'boss', '🕵️', 'What you saw undercover', '{a} was rude to customers all week. {b} secretly covered for everyone.', [
    ['🏅 Reward {b}', { bonus: 'b', b: 15, loyal: { b: 20 }, say: '{b} had no idea you were watching.' }],
    ['⚠️ Talk to {a}', { chance: { p: 0.6, win: { a: 5, skill: { a: 4 }, say: '{a} changed.' }, lose: { a: -10, say: '{a} blamed everyone else.' } } }],
    ['🪜 Promote {b}', { promote: 'b', b: 18, team: 3, say: 'The team agrees. {b} earned it.' }],
    ['🚪 Fire {a}', { fire: 'a', team: 4, say: 'Customers noticed the difference.' }]
  ], CH);

  // =====================================================================
  // 🐕 THE STRAY DOG (a whole story)
  // =====================================================================

  E('stray_dog', 'customers', '🐕', 'A stray dog sleeps by your door', 'Skinny, shy and very sweet. Customers stop to pet it.', [
    ['🍖 Feed it', { happy: 2, next: ['stray_dog_back', 1, 2], say: 'It ate everything and wagged its tail.' }],
    ['🏠 Adopt it', { pet: '🐕', team: 8, fans: 10, say: 'The shop has a dog now.' }],
    ['📞 Call the shelter', { rep: 2, say: 'They picked it up. You hope it finds a home.' }],
    ['🚪 Shoo it away', { happy: -2, say: 'A customer frowned at you.' }]
  ], { w: 0.8, cd: 60, cond: function (g) { return !g.pet; } });

  E('stray_dog_back', 'customers', '🐕', 'The stray dog is back', 'It waits for you every morning now. It even walks customers to the door.', [
    ['🏠 Adopt it', { pet: '🐕', team: 8, fans: 15, say: 'Everyone cheered. It has a name now.' }],
    ['🗳️ Let customers name it', { pet: '🐕', fans: 25, say: 'A thousand votes. The winner was "Boss".' }],
    ['🏥 Vet, then shelter', { cash: -0.05, rep: 3, say: 'A family adopted it a week later.' }],
    ['🍖 Keep feeding it', { happy: 2, say: 'It\'s part of the street now.' }]
  ], CH);

  // =====================================================================
  // 🤲 THE FAKE CHARITY (a whole story)
  // =====================================================================

  E('charity_collector', 'customers', '🤲', 'A charity collector asks for money', 'For sick children. She has a badge, a box and a sad story.', [
    ['💵 Donate a lot', { cash: -0.2, next: ['fake_charity', 1, 3, 0.5], say: 'She thanked you warmly.' }],
    ['🪙 A small donation', { cash: -0.05, say: 'She smiled and moved on.' }],
    ['🔍 Check the charity first', { chance: { p: 0.5, win: { rep: 4, say: 'Fake. You called the police. She ran.' }, lose: { cash: -0.1, rep: 2, say: 'It\'s real. You donated.' } } }],
    ['🙅 No thanks', { say: 'She left.' }]
  ], { w: 0.8, cd: 50 });

  E('fake_charity', 'customers', '📰', 'The charity was fake', 'The news says a woman is collecting money for a charity that doesn\'t exist. You gave her a lot.', [
    ['👮 Tell the police', { rep: 3, say: 'Your description helped catch her.' }],
    ['❤️ Give to a real charity', { cash: -0.2, rep: 5, say: 'The real kids got help anyway.' }],
    ['📢 Warn other shops', { rep: 4, fans: 10, say: 'Nobody else fell for it.' }],
    ['😤 Be more careful', { say: 'Lesson learned.' }]
  ], CH);

  // =====================================================================
  // 🛍️ THE WORKER'S SIDE BUSINESS (a whole story)
  // =====================================================================

  E('worker_side_hustle', 'team', '🛍️', '{a} is selling to your customers', '{a} gives customers a card for their own business. Cheaper than you.', [
    ['🗣️ Confront {a}', { then: 'side_hustle_talk', say: 'You called {a} into the office.' }],
    ['🚪 Fire {a}', { fire: 'a', say: 'No second chances.' }],
    ['🤝 Offer to partner', { chance: { p: 0.5, win: { extra: [0.05, 12, 'Side business'], a: 15, say: 'You own half of it now.' }, lose: { a: -5, say: '{a} said no.' } } }],
    ['🙈 Ignore it', { demand: [0.95, 6, 'Side business'], next: ['side_hustle_grows', 4, 8, 0.6], say: 'Some customers went to {a}.' }]
  ], { w: 0.8, cd: 60, minWeek: 10, who: { a: 'ambitious' } });

  E('side_hustle_talk', 'team', '💬', '{a} explains', '"I just want to build something of my own one day. Like you did."', [
    ['🤝 Help {a} do it right', { a: 20, loyal: { a: 20 }, rep: 3, say: '{a} will build it on weekends. Not with your customers.' }],
    ['⚠️ "Not with our customers."', { a: -5, say: '{a} agreed. Quietly.' }],
    ['🪜 A bigger role for {a}', { promote: 'a', a: 15, say: '{a} wants to build something here now.' }],
    ['🚪 "Then go build it."', { leave: 'a', say: '{a} left to start their business.' }]
  ], CH);

  E('side_hustle_grows', 'team', '📈', '{a}\'s side business is growing', 'It has a shop now. Two streets away. {a} still works for you.', [
    ['🤝 Invest in it', { cash: -0.5, extra: [0.06, 16, 'Invested shop'], say: 'You own a piece of the future.' }],
    ['🚪 Let {a} go', { leave: 'a', say: '{a} left to run it full time.' }],
    ['💰 Offer {a} a huge raise', { raise: ['a', 0.25], loyal: { a: 20 }, say: '{a} sold the shop and stayed.' }],
    ['👏 Wish {a} luck', { a: 10, rep: 2, say: '{a} will never forget your support.' }]
  ], CH);

  // =====================================================================
  // 🔥 THE ANGRY NEIGHBOR (a whole story)
  // =====================================================================

  E('angry_neighbor', 'trouble', '🏠', 'Your neighbor hates your business', '{name} says your customers block the street. He\'s collecting signatures to close you.', [
    ['☕ Invite him for coffee', { chance: { p: 0.6, win: { rep: 3, say: 'He\'s a lonely old man. You\'re friends now.' }, lose: { next: ['neighbor_petition', 2, 4], say: 'He threw the coffee away.' } } }],
    ['🅿️ Fix the parking problem', { cash: -0.3, rep: 2, say: 'No more blocked street. He calmed down.' }],
    ['📝 Collect your own signatures', { fans: 15, next: ['neighbor_petition', 2, 4, 0.5], say: 'Three hundred customers signed for you.' }],
    ['🤷 Ignore him', { next: ['neighbor_petition', 2, 4], say: 'He\'s knocking on every door.' }]
  ], { w: 0.8, cd: 60, init: man });

  E('neighbor_petition', 'trouble', '📜', '{name} took you to the city council', 'He has a petition and a speech ready. The council will vote tonight.', [
    ['🎤 Speak at the meeting', { chance: { p: 0.6, win: { rep: 5, fans: 15, say: 'The council voted for you. The room clapped.' }, lose: { capacity: [0.9, 6, 'New rules'], say: 'They gave you new rules and shorter hours.' } } }],
    ['🧑‍🤝‍🧑 Bring your customers', { chance: { p: 0.75, win: { rep: 6, say: 'Fifty customers showed up. You won easily.' }, lose: { capacity: [0.9, 6, 'New rules'], say: 'It didn\'t help.' } } }],
    ['🤝 Offer him a deal', { cash: -0.2, rep: 2, say: 'Free parking for his family. He dropped it.' }],
    ['🙈 Don\'t go', { capacity: [0.85, 8, 'Shorter hours'], say: 'You lost. Shorter hours now.' }]
  ], CH);
  // =====================================================================
  // 🔁 MORE THINGS THAT COME BACK
  // =====================================================================

  E('hush_money', 'shady', '🤫', '{a} wants more hush money', '"The city would love to hear about your safety problems. Unless..."', [
    ['💵 Pay again', { cash: -0.5, next: ['hush_money', 3, 6, 0.7], say: '{a} smiled. This won\'t stop.' }],
    ['🛠️ Fix the problems for real', { cash: -0.7, rep: 2, say: 'Nothing left to report. {a} has nothing on you.' }],
    ['🚪 Fire {a}', { fire: 'a', rep: -6, cash: -0.8, say: '{a} reported you anyway. Big fine.' }],
    ['📞 Report yourself first', { cash: -0.5, rep: 4, say: 'A small fine. People respected the honesty.' }]
  ], CH);

  E('bully_again', 'team', '😠', '{a} is bullying {b} again', 'The warning didn\'t work. {b} came to you in tears.', [
    ['🚪 Fire {a}', { fire: 'a', b: 15, team: 8, say: 'The whole team feels safer.' }],
    ['⬇️ Cut {a}\'s pay', { raise: ['a', -0.1], a: -15, b: 5, say: '{a} got the message.' }],
    ['🔀 Separate them for good', { capacity: [0.97, 8, 'Separate shifts'], b: 8, say: 'They never work together now.' }],
    ['🙈 Stay out of it', { b: -20, next: ['resign', 1, 3, 0.8], say: '{b} is writing a resignation letter.' }]
  ], CH);

  E('fake_cv_exposed', 'team', '📄', 'Customers found out about {a}\'s lie', 'A customer who worked at that famous place says {a} was never there.', [
    ['🙏 Apologize for {a}', { rep: -2, say: 'People accepted it.' }],
    ['🎓 Make {a} earn it for real', { cash: -0.2, skill: { a: 8 }, say: '{a} took real classes. Now it\'s true.' }],
    ['🚪 Fire {a}', { fire: 'a', rep: 2, say: 'Clean slate.' }],
    ['🛡️ Defend {a}', { rep: -5, a: 10, say: 'People think you lie too.' }]
  ], CH);

  E('rival_hostile', 'rivals', '🦈', '{rival} is buying your suppliers', 'You said no to their offer. Now they\'re buying the companies you depend on.', [
    ['🤝 Lock in long contracts', { cash: -0.5, supply: [-0.01, 20, 'Long contracts'], say: 'Your suppliers are safe.' }],
    ['🏭 Make things yourself', { cash: -1.2, supply: [-0.03, 30, 'Own supplies'], say: 'Nobody can cut you off.' }],
    ['⚖️ Report them for unfair play', { chance: { p: 0.5, win: { rival: -0.15, say: 'The city stopped them.' }, lose: { supply: [0.05, 8, 'Rival owns suppliers'], say: 'It was legal. Your costs went up.' } } }],
    ['😬 Pay their new prices', { supply: [0.06, 10, 'Rival owns suppliers'], say: 'They win this round.' }]
  ], CH);

  E('idea_royalty', 'customers', '💡', 'The customer wants a cut of your hit', 'Their idea became your best seller. Now they want 10% of the money.', [
    ['🤝 Give them 5%', { supply: [0.02, 16, 'Idea royalty'], rep: 3, say: 'Fair. They tell everyone you\'re honest.' }],
    ['🎁 A big thank-you gift', { cash: -0.3, rep: 2, say: 'They were happy with the gift.' }],
    ['🙅 "Ideas are free."', { chance: { p: 0.5, win: { say: 'They grumbled and left.' }, lose: { rep: -5, say: 'Their post about you went round town.' } } }],
    ['💼 Hire them as an ideas person', { hireSpecial: { role: 'front', skill: 55, traits: ['creative'] }, say: 'More ideas where that came from.' }]
  ], CH);

  E('celeb_returns', 'customers', '🌟', '{name} came back', 'The star you treated like anyone else loved it. They want to film their next music video here.', [
    ['🎬 Yes!', { closed: [1, 'Filming'], fans: 60, rep: 5, say: 'The video has millions of views. Your shop is in it.' }],
    ['💰 Yes, for a fee', { cash: 0.8, fans: 40, closed: [1, 'Filming'], say: 'Paid and famous.' }],
    ['🤫 Only after closing', { fans: 40, team: -3, say: 'Night shoots. Worth it.' }],
    ['🙅 Keep it quiet', { rep: 3, say: 'They respected that. They still come every week.' }]
  ], CH);
  // =====================================================================
  // 🦈 THE INVESTOR WHO WANTS CONTROL (a whole story)
  // =====================================================================

  E('shark_investor', 'money', '🦈', 'An investor offers a fortune', '{name} wants to put in a lot of money. In return, he wants a seat on your board.', [
    ['🤝 Take the money', { cash: 3, next: ['investor_demands', 4, 8], say: 'Rich. And now you have a partner.' }],
    ['📜 Money, but no board seat', { chance: { p: 0.4, win: { cash: 2, say: 'He agreed. Smart deal.' }, lose: { say: 'He walked away.' } } }],
    ['🔍 Look into his past first', { then: 'investor_past', say: 'You called a few people who know him.' }],
    ['🙅 Stay independent', { team: 4, say: 'Your company. Your rules.' }]
  ], { w: 0.7, cd: 80, minWeek: 15, init: man });

  E('investor_past', 'money', '🔍', 'The truth about {name}', 'He bought three companies last year. He fired every founder within a year.', [
    ['🙅 Say no', { rep: 2, say: 'You dodged a bullet.' }],
    ['📜 Take it with a strong contract', { cash: 2.5, supply: [0.02, 12, 'Lawyer fees'], say: 'Your lawyer made sure he can never fire you.' }],
    ['🤝 Take it anyway', { cash: 3, next: ['investor_demands', 3, 6], say: 'You think you can handle him.' }],
    ['📢 Warn other founders', { rep: 5, fans: 10, say: 'Other founders thanked you.' }]
  ], CH);

  E('investor_demands', 'money', '📊', '{name} wants to change everything', '"Cut the team by a third. Raise prices. Now." He\'s your biggest investor.', [
    ['✅ Do what he says', { team: -15, price: 1, cash: 1, say: 'Profits up. Your team is scared.' }],
    ['🤝 Meet him halfway', { team: -5, price: 1, say: 'He\'s not happy. But he\'s quiet. For now.', next: ['boardroom_coup', 6, 10, 0.4] }],
    ['🙅 Say no', { team: 8, next: ['boardroom_coup', 3, 6, 0.8], say: 'Your team cheered. {name} did not.' }],
    ['💰 Buy his share back', { cash: -4, team: 10, say: 'Expensive. But you\'re free.' }]
  ], CH);

  E('boardroom_coup', 'money', '🗡️', '{name} is trying to take over', 'He\'s asking the other investors to vote you out as boss of your own company.', [
    ['🧑‍🤝‍🧑 Rally your team', { chance: { p: 0.6, win: { team: 15, say: 'Your whole team threatened to quit. The vote failed.' }, lose: { cash: -2, say: 'You kept your job, but it cost you a lot.' } } }],
    ['⚖️ Fight him in court', { cash: -1, chance: { p: 0.6, win: { rep: 5, say: 'The judge sided with you. He\'s out.' }, lose: { cash: -2, say: 'You won, barely. The lawyers won more.' } } }],
    ['💰 Buy him out at any price', { cash: -5, team: 10, say: 'He left rich. You kept your company.' }],
    ['📢 Tell the whole story', { fans: 30, chance: { p: 0.5, win: { rep: 8, say: 'The public took your side. He backed off.' }, lose: { rep: -3, say: 'It got messy in the news.' } } }]
  ], CH);

  // =====================================================================
  // 🗡️ THE WORKER WHO WANTS TO TAKE YOUR TEAM (a whole story)
  // =====================================================================

  E('team_poach_plot', 'team', '🗡️', 'Rumor: {a} is starting a company', 'And they\'re asking your best people to come with them.', [
    ['🗣️ Confront {a}', { then: 'poach_confront', say: 'You called {a} into your office.' }],
    ['💵 Raises for everyone first', { teamRaise: 0.05, team: 10, next: ['poach_leaves', 3, 6, 0.6], say: 'Your team feels valued.' }],
    ['🕵️ Find out who\'s going', { chance: { p: 0.6, win: { then: 'poach_confront', say: 'Three people are going. {b} is one of them.' }, lose: { team: -5, say: 'People noticed you snooping.' } } }],
    ['🤷 Let them go', { next: ['poach_leaves', 2, 4], say: 'You\'ll deal with it when it happens.' }]
  ], { w: 0.7, cd: 80, minWeek: 20, need: 5, who: { a: 'ambitious', b: 'any' } });

  E('poach_confront', 'team', '💬', '{a} doesn\'t deny it', '"I want to build my own thing. And yes, I asked {b} to come."', [
    ['🤝 Offer to invest in it', { chance: { p: 0.6, win: { extra: [0.06, 16, 'Ex-worker\'s company'], leave: 'a', say: '{a} left with your blessing. You own part of it.' }, lose: { leave: 'a', say: '{a} said no to your money and left.' } } }],
    ['🪜 Make {a} a partner', { chance: { p: 0.5, win: { promote: 'a', a: 25, loyal: { a: 30 }, say: '{a} stayed. As a partner.' }, lose: { leave: 'a', say: '{a} wanted their own thing.' } } }],
    ['🚪 Fire {a} today', { fire: 'a', team: -5, say: 'Gone. But {b} is still thinking.' }],
    ['💵 Keep {b} with a raise', { raise: ['b', 0.15], b: 15, loyal: { b: 20 }, next: ['poach_leaves', 2, 4, 0.5], say: '{b} is staying.' }]
  ], CH);

  E('poach_leaves', 'team', '🚪', '{a} left and took people with them', '{a} opened a company across town. Two of your workers went with them.', [
    ['🧑‍💼 Hire fast', { hireSpecial: { role: 'front', skill: 55 }, capacity: [0.9, 3, 'Short-staffed'], say: 'You filled the gap.' }],
    ['🤝 Wish them well', { rep: 4, capacity: [0.9, 3, 'Short-staffed'], say: 'Classy. People noticed.' }],
    ['⚖️ Check their contracts', { cash: -0.3, chance: { p: 0.5, win: { cash: 1, say: 'They broke their contracts. They paid.' }, lose: { say: 'Everything was legal.' } } }],
    ['💪 The rest of the team steps up', { team: 6, capacity: [0.93, 3, 'Short-staffed'], say: 'The ones who stayed are closer than ever.' }]
  ], CH);

  // =====================================================================
  // 🫀 THE HEALTH SCARE (a whole story)
  // =====================================================================

  E('chest_pain', 'boss', '🫀', 'You feel a sharp pain in your chest', 'In the middle of a busy day. It goes away after a minute.', [
    ['🏥 Go to the doctor now', { closed: [1, 'Boss at doctor'], then: 'doctor_news', say: 'The doctor ran some tests.' }],
    ['📅 Book a check-up next week', { next: ['doctor_news', 1, 2], say: 'You\'ll get checked. Soon.' }],
    ['☕ Coffee and keep going', { next: ['boss_collapse', 3, 8, 0.5], say: 'It\'s probably nothing. Probably.' }],
    ['🧘 Take the afternoon off', { team: 2, next: ['doctor_news', 1, 3, 0.5], say: 'You went home and slept.' }]
  ], { w: 0.6, cd: 80, minWeek: 20 });

  E('doctor_news', 'boss', '🩺', 'The doctor has your results', '"Your heart is okay. But the stress is not. You have to slow down."', [
    ['👔 Hire a manager', { hireSpecial: { role: 'mgr', skill: 65 }, say: 'Someone to share the weight.' }],
    ['🏃 Exercise every morning', { cash: -0.1, team: 3, say: 'You feel ten years younger.' }],
    ['🏖️ A real vacation', { closed: [1, 'Boss on vacation'], team: 5, say: 'You came back a new person.' }],
    ['🙉 Ignore the doctor', { next: ['boss_collapse', 4, 10, 0.6], say: 'You went back to work the same day.' }]
  ], CH);

  E('boss_collapse', 'boss', '🚑', 'You collapsed at work', '{company} kept running while you were in the hospital. You\'re okay. This time.', [
    ['👔 Let others run things', { capacity: [0.95, 4, 'Boss resting'], team: 8, say: 'Your team proved they can do it.' }],
    ['❤️ Change your whole life', { closed: [1, 'Boss recovering'], team: 10, rep: 3, say: 'Healthier habits. A happier boss.' }],
    ['💪 Back to work tomorrow', { team: -6, say: 'Your team is worried about you.' }],
    ['🎁 Thank the team', { teamBonus: true, team: 12, say: 'They kept it all going for you.' }]
  ], CH);

  // =====================================================================
  // 🪞 THE COPYCAT SHOP (a whole story)
  // =====================================================================

  E('copycat_shop', 'rivals', '🪞', 'A copycat shop opened', 'Same colors, almost the same name, same products. Customers keep walking into the wrong shop.', [
    ['⚖️ Send a lawyer\'s letter', { cash: -0.2, next: ['copycat_reply', 1, 3], say: 'Your lawyer sent a strong letter.' }],
    ['🎨 Make your brand stand out', { cash: -0.4, fans: 15, rep: 2, say: 'New signs. Nobody confuses you now.' }],
    ['🗣️ Visit the owner', { then: 'copycat_owner', say: 'You walked over and asked for the owner.' }],
    ['🤷 Ignore it', { demand: [0.92, 6, 'Copycat'], say: 'You lost some customers to them.' }]
  ], { w: 0.8, cd: 60, minWeek: 8 });

  E('copycat_owner', 'rivals', '🧑', 'The copycat owner is a young man', '"I love your shop. I wanted to be just like you. I didn\'t think it was wrong."', [
    ['🤝 Help him find his own style', { rep: 5, fans: 10, say: 'He changed everything. You\'re friends now.' }],
    ['💼 Offer him a job instead', { hireSpecial: { role: 'front', skill: 60, traits: ['ambitious'] }, say: 'He closed his shop and joined you.' }],
    ['⚖️ "Change it, or I sue."', { chance: { p: 0.7, win: { say: 'He changed his name and colors.' }, lose: { next: ['copycat_reply', 1, 3], say: 'He refused.' } } }],
    ['🛒 Buy his shop', { cash: -1.5, capacity: [1.1, 16, 'Second shop'], say: 'Now it really is your shop.' }]
  ], CH);

  E('copycat_reply', 'rivals', '📨', 'The copycat is fighting back', 'His lawyer says the name is "totally different". Customers are still confused.', [
    ['⚖️ Go to court', { cash: -0.6, chance: { p: 0.65, win: { rep: 3, say: 'You won. He has to change everything.' }, lose: { demand: [0.94, 6, 'Copycat'], say: 'The judge said it\'s different enough.' } } }],
    ['🤝 Settle: he changes his colors', { cash: -0.1, say: 'A fair deal. Problem solved.' }],
    ['📢 Tell your customers', { fans: 20, rep: 2, say: '"The original." Your customers know now.' }],
    ['🤷 Let it go', { demand: [0.95, 6, 'Copycat'], say: 'It\'s not worth the fight.' }]
  ], CH);

  // =====================================================================
  // 🎤 THE TALENT SHOW (a whole story)
  // =====================================================================

  E('talent_show', 'team', '🎤', '{a} wants to enter the city talent show', '{a} sings amazingly. The show is on TV, and it\'s in a week.', [
    ['🎉 Support {a}', { a: 12, next: ['talent_final', 1, 2], say: '{a} practiced every night.' }],
    ['🏷️ Sponsor {a}', { cash: -0.2, a: 15, fans: 10, next: ['talent_final', 1, 2], say: '{a} will sing with your logo on their shirt.' }],
    ['🗓️ Only if it\'s after work', { a: 5, next: ['talent_final', 1, 2, 0.7], say: '{a} will make it work.' }],
    ['🙅 "Focus on work."', { a: -12, say: '{a} was crushed.' }]
  ], { w: 0.7, cd: 60, who: { a: 'any' } });

  E('talent_final', 'team', '🌟', '{a} made it to the talent show final', 'The whole city is watching. Your team wants to go and cheer.', [
    ['📺 Close early and go', { closed: [1, 'Talent show'], team: 10, chance: { p: 0.5, win: { fans: 60, a: 20, say: '{a} WON. The whole city knows your shop now.' }, lose: { fans: 25, a: 8, say: '{a} came second. Everyone cried anyway.' } } }],
    ['🍿 Watch it at the shop', { happy: 5, team: 6, chance: { p: 0.45, win: { fans: 50, a: 20, say: '{a} WON. Customers celebrated with you.' }, lose: { fans: 15, a: 5, say: 'Second place. Still amazing.' } } }],
    ['🎁 Buy {a} a great outfit', { cash: -0.1, a: 10, chance: { p: 0.55, win: { fans: 50, say: '{a} WON, and thanked you on stage.' }, lose: { fans: 15, say: 'Second place.' } } }],
    ['💼 Business as usual', { a: -5, chance: { p: 0.4, win: { fans: 30, say: '{a} won. You weren\'t there.' }, lose: { say: '{a} didn\'t win.' } } }]
  ], CH);

  // =====================================================================
  // 🧒 THE KID ENTREPRENEUR (a whole story)
  // =====================================================================

  E('kid_stand', 'customers', '🧒', 'A kid is selling outside your shop', '{name}, about 12, set up a table by your door. Cheaper than you. He\'s selling a lot.', [
    ['🤝 Offer to team up', { next: ['kid_grows', 8, 16, 0.6], fans: 10, say: 'He sells your stuff now. He gets a cut.' }],
    ['🚫 Ask him to move', { rep: -2, say: 'He packed up. People thought you were mean.' }],
    ['🎓 Teach him business', { rep: 4, next: ['kid_grows', 8, 16, 0.8], say: 'He asked a hundred questions. He\'s smart.' }],
    ['🤷 Let him be', { demand: [0.97, 3, 'Kid next door'], say: 'He\'s taking a few of your customers.' }]
  ], { w: 0.7, cd: 60, init: H.boy });

  E('kid_grows', 'lucky', '📈', '{name} is all grown up', 'The kid who sold outside your shop now runs his own company. He never forgot you.', [
    ['🤝 A partnership', { extra: [0.08, 16, 'Old friend'], say: 'His company buys from you now.' }],
    ['💰 Invest in him', { cash: -1, chance: { p: 0.7, win: { cash: 3, say: 'His company took off. So did your money.' }, lose: { say: 'It didn\'t work out. He paid you back later.' } } }],
    ['📸 Tell his story', { fans: 30, rep: 5, say: 'The story went round town. Both of you got famous.' }],
    ['😊 Just have lunch', { rep: 2, say: 'He picked up the bill.' }]
  ], CH);

  // =====================================================================
  // 📺 THE WORKER WHO WENT VIRAL GETS AN OFFER
  // =====================================================================

  E('viral_offer', 'team', '📺', 'A TV channel wants {a}', 'Since {a}\'s video went viral, a TV show wants {a} as a host.', [
    ['👏 Let {a} go with a party', { leave: 'a', fans: 20, rep: 4, say: '{a} left for TV. They mention you on air.' }],
    ['💰 Double {a}\'s pay', { raise: ['a', 0.5], loyal: { a: 25 }, say: '{a} stayed. Expensive.' }],
    ['🤝 Do both, part-time', { capacity: [0.97, 12, '{a} part-time'], fans: 30, a: 15, say: '{a} works mornings and does TV at night.' }],
    ['🎥 Film a show at your shop', { fans: 40, a: 20, say: 'The show is filmed at your place now.' }]
  ], CH);
})();
