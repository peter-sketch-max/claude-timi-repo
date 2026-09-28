// Story events: what happens next. Most of these only appear as a follow-up to another event, either right away
// (fx.then) or a few weeks later (fx.next). Forgive someone, and they might come back with the same trick.
// See the top of events.js for the event format and the style rules. Every question has exactly 4 responses.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var U = CS.U, G = CS.G, H = CS.EVH, E = CS.E, man = H.man;
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
  // =====================================================================
  // 💍 LOVE AND MARRIAGE (starts with dating_boss). Your family is saved in g.family.
  // =====================================================================

  var fam = function (g) { return g.family || {}; };
  var setFam = function (stage) {
    return function (g, c) {
      var f = g.family = g.family || { kids: [] };
      f.partner = c.name; f.stage = stage; f.since = g.week; f.kids = f.kids || [];
      if (stage === 'married') { f.married = g.week; G.news(g, '💍 You married ' + c.name + '!', 'good'); }
    };
  };
  var single = function () { return function (g, c) { var f = g.family; if (f) { f.stage = null; f.partner = null; } }; };
  var married = function (g) { return fam(g).stage === 'married'; };
  var partner = function (g, c) { c.name = fam(g).partner; if (!c.name) return false; };

  E('first_date', 'boss', '🌹', 'Your first date with {name}', 'Dinner by the river. You\'re nervous. They\'re funny and kind.', [
    ['🗣️ Talk about your dreams', { chance: { p: 0.75, win: { run: setFam('dating'), next: ['relationship_serious', 4, 8], say: 'You talked until midnight. A second date is already planned.' }, lose: { say: 'A nice night. They didn\'t call back.' } } }],
    ['😂 Just have fun', { chance: { p: 0.7, win: { run: setFam('dating'), next: ['relationship_serious', 4, 8], say: 'You laughed all night. They texted you first.' }, lose: { say: 'Fun, but no spark.' } } }],
    ['💼 Talk about work all night', { chance: { p: 0.3, win: { run: setFam('dating'), next: ['relationship_serious', 4, 8], say: 'Somehow they loved it.' }, lose: { say: 'They yawned. Twice.' } } }],
    ['📱 Answer a work call', { chance: { p: 0.15, win: { run: setFam('dating'), next: ['relationship_serious', 4, 8], say: 'They were patient. Lucky you.' }, lose: { say: 'They left before dessert.' } } }]
  ], CH);

  E('relationship_serious', 'boss', '💞', 'Things are serious with {name}', 'It\'s been months. {name} asks: "Where is this going?"', [
    ['🏠 Move in together', { team: 3, next: ['proposal_time', 4, 8], say: 'Their stuff is everywhere. You love it.' }],
    ['👪 Meet their family', { chance: { p: 0.7, win: { next: ['proposal_time', 4, 8], say: 'Their mom hugged you. You\'re in.' }, lose: { next: ['relationship_serious', 3, 6], say: 'Their dad asked about your money. Awkward.' } } }],
    ['🐢 "Let\'s take it slow."', { chance: { p: 0.5, win: { next: ['relationship_serious', 4, 8], say: 'They understood.' }, lose: { run: single(), say: 'They wanted more. It\'s over. It hurts.' } } }],
    ['💼 "I\'m too busy."', { run: single(), team: -2, say: 'They left. The shop feels quiet tonight.' }]
  ], { chainOnly: true, cond: function (g) { return fam(g).stage === 'dating'; } });

  E('proposal_time', 'boss', '💍', 'Time to propose to {name}?', 'You bought a ring months ago. It\'s been in your desk drawer ever since.', [
    ['🌅 Propose at sunset', { chance: { p: 0.85, win: { run: setFam('engaged'), then: 'wedding_plans', say: 'They said YES. Crying, laughing, yes.' }, lose: { next: ['proposal_time', 6, 10], say: '"Not yet." It hurt. But they stayed.' } } }],
    ['🏪 At your shop, with the team', { chance: { p: 0.8, win: { run: setFam('engaged'), team: 8, fans: 15, then: 'wedding_plans', say: 'YES! The whole team cheered.' }, lose: { next: ['proposal_time', 6, 10], say: 'They said "not yet", in front of everyone.' } } }],
    ['📱 A big proposal online', { chance: { p: 0.6, win: { run: setFam('engaged'), fans: 40, then: 'wedding_plans', say: 'YES! A million people watched.' }, lose: { fans: 10, rep: -2, next: ['proposal_time', 8, 12], say: 'They said no. On camera. They hate big shows.' } } }],
    ['⏳ Wait a little longer', { next: ['proposal_time', 6, 12], say: 'The ring stays in the drawer. For now.' }]
  ], { chainOnly: true, cond: function (g) { return fam(g).stage === 'dating'; } });

  E('wedding_plans', 'boss', '💒', 'Planning your wedding with {name}', 'They want something beautiful. Your accountant wants something cheap.', [
    ['🏰 A huge wedding', { cash: -2, fans: 30, rep: 3, then: 'wedding_day', say: 'Five hundred guests. A castle. A cake taller than you.' }],
    ['🌳 Small, with family', { cash: -0.4, team: 3, then: 'wedding_day', say: 'Just the people who matter.' }],
    ['🏪 At your own shop', { closed: [1, 'Your wedding'], fans: 25, team: 8, then: 'wedding_day', say: 'Your team decorated everything.' }],
    ['🏛️ Just the city hall', { then: 'wedding_day', say: 'Simple, quick, and still perfect.' }]
  ], CH);

  E('wedding_day', 'boss', '💐', 'Your wedding day', '{name} walks in. Your whole team is crying. Even the grumpy ones.', [
    ['💃 Dance all night', { run: setFam('married'), team: 10, say: 'You married {name}. Best night of your life.' }],
    ['🎤 A speech about how you met', { run: setFam('married'), rep: 3, fans: 10, say: 'Nobody had dry eyes. You married {name}.' }],
    ['✈️ Leave for the honeymoon', { run: setFam('married'), closed: [1, 'Honeymoon'], team: 5, say: 'Married, and off to the beach.' }],
    ['🎁 A bonus for the whole team', { run: setFam('married'), teamBonus: true, team: 12, say: 'Married, and your team got a gift too.' }]
  ], CH);

  E('spouse_helps', 'boss', '🤝', '{name} wants to work with you', 'Your partner has great ideas for the company. But working together is a big step.', [
    ['📣 Let them run marketing', { fans: 30, demand: [1.08, 10, 'Family marketing'], say: '{name} is a natural.' }],
    ['🕐 Part-time, to start', { fans: 10, demand: [1.04, 8, 'Family help'], say: 'A good balance.' }],
    ['🏠 Keep home and work apart', { team: 2, say: 'You both agreed. Home stays home.' }],
    ['💬 Just ask for their advice', { demand: [1.03, 6, 'Good advice'], say: 'Dinner talks became business plans.' }]
  ], { w: 0.8, cd: 80, cond: married, init: partner });

  E('wedding_anniversary', 'boss', '🥂', 'Your wedding anniversary with {name}', 'One more year together. {name} is waiting to see if you remember.', [
    ['🍽️ A fancy dinner', { cash: -0.05, say: 'They loved it. Another year.' }],
    ['✈️ A weekend away', { cash: -0.2, closed: [1, 'Anniversary trip'], team: 3, say: 'The best weekend of the year.' }],
    ['🎁 A handmade gift', { say: 'They cried. It was perfect.' }],
    ['😬 You forgot', { next: ['marriage_trouble', 1, 3, 0.7], say: 'They didn\'t say anything. That\'s worse.' }]
  ], { w: 1, cd: 52, cond: function (g) { return married(g) && g.week - (fam(g).married || 0) >= 40; }, init: partner });

  E('marriage_trouble', 'boss', '💔', '{name} says you\'re never home', '"I married you, not your company." They\'re serious. And they\'re right.', [
    ['🕔 Come home at 6, every day', { capacity: [0.95, 12, 'Home on time'], team: 4, say: 'Dinners together again. It\'s getting better.' }],
    ['🛋️ Go to couples counseling', { cash: -0.1, chance: { p: 0.8, win: { say: 'It helped. You\'re talking again.' }, lose: { next: ['marriage_trouble', 4, 8], say: 'Some sessions went badly. You keep trying.' } } }],
    ['✈️ A trip, just the two of you', { cash: -0.3, closed: [1, 'Family trip'], say: 'You remembered why you fell in love.' }],
    ['💼 "The business needs me."', { team: -3, next: ['marriage_trouble', 3, 6, 0.8], say: '{name} went quiet. Something broke tonight.' }]
  ], { w: 0.6, cd: 40, cond: married, init: partner });

  E('baby_news', 'boss', '🍼', 'You and {name} are having a baby', 'The test came back this morning. Your hands are shaking. In a good way.', [
    ['🎉 Tell the whole team', { team: 10, next: ['baby_born', 8, 14], say: 'Your team threw a surprise party.' }],
    ['🧸 Build a nursery at the shop', { cash: -0.3, team: 6, next: ['baby_born', 8, 14], say: 'A tiny room with a tiny bed. The team loves it.' }],
    ['📅 Plan time off', { team: 4, next: ['baby_born', 8, 14], say: 'Your manager will run things for a while.' }],
    ['🤫 Keep it secret for now', { next: ['baby_born', 8, 14], say: 'Just the two of you know. For now.' }]
  ], { w: 0.7, cd: 80, cond: function (g) { return married(g) && (fam(g).kids || []).length < 3 && g.week - (fam(g).married || 0) >= 20; },
    init: function (g, c) { c.kid = U.pick(CS.FIRST); return partner(g, c); } });

  E('baby_born', 'boss', '👶', 'Meet {kid}!', 'Your baby is here. Tiny, loud and perfect. {name} is smiling through the tears.', [
    ['🏠 Two weeks at home', { run: addKid, closed: [1, 'New baby'], team: 6, say: 'The best two weeks of your life.' }],
    ['🍼 Bring {kid} to the shop', { run: addKid, fans: 25, happy: 4, say: 'Customers line up to say hello.' }],
    ['🏷️ Name a product after {kid}', { run: addKid, fans: 15, demand: [1.05, 6, 'Baby special'], say: 'It became a best seller.' }],
    ['💼 Back to work tomorrow', { run: addKid, team: -3, say: 'You yawned all day. Worth it.' }]
  ], CH);
  function addKid(g, c) { var f = g.family; if (f) { f.kids = (f.kids || []).concat([c.kid]); G.news(g, '👶 Welcome to the world, ' + c.kid + '!', 'good'); } }
  // =====================================================================
  // 🔗 WHAT HAPPENS NEXT (follow-ups for everyday events)
  // =====================================================================

  E('fight_punch', 'team', '👊', '{b} threw a punch at {a}', 'In the back room. {a} has a bleeding lip. The whole team saw it.', [
    ['🚪 Fire {b}', { fire: 'b', a: 10, team: 4, say: 'Violence has no place here. The team agrees.' }],
    ['🏥 Get {a} to a doctor', { cash: -0.05, a: 12, loyal: { a: 10 }, say: 'Just a split lip. {a} is grateful you cared.' }],
    ['⏸️ Send both home for a week', { capacity: [0.9, 1, 'Two suspended'], a: -5, b: -10, say: 'A quiet week. Both came back calmer.' }],
    ['👮 Call the police', { fire: 'b', rep: 1, team: -2, say: '{b} was taken away. It was a hard day.' }]
  ], CH);

  E('late_truth', 'team', '🚗', '{a} has been sleeping in their car', 'Their landlord threw them out. They wash at the gym before every shift.', [
    ['🏠 Help find an apartment', { cash: -0.2, a: 25, loyal: { a: 30 }, say: 'A small place near the shop. {a} has never been on time more.' }],
    ['💵 An advance on their pay', { cash: -0.1, a: 15, loyal: { a: 15 }, say: 'Enough for a deposit. {a} cried.' }],
    ['🛋️ The back room, for now', { a: 12, team: 3, say: 'A sofa, a blanket, a key. It\'s a start.' }],
    ['🤐 "Sorry, not my problem."', { a: -20, loyal: { a: -20 }, say: '{a} nodded and went back to work.' }]
  ], CH);

  E('counter_offer', 'team', '📄', '{a} shows you {rival}\'s offer', 'It\'s real. 30% more pay and a better title. {a} is waiting for your answer.', [
    ['💰 Match it', { raise: ['a', 0.3], a: 15, loyal: { a: 15 }, say: '{a} tore up the letter.' }],
    ['🪜 Promote {a} instead', { promote: 'a', a: 18, say: 'A new title, and a reason to stay.' }],
    ['❤️ "Stay for the team."', { chance: { p: 0.4, win: { loyal: { a: 25 }, say: '{a} stayed. For the people, not the money.' }, lose: { quit: 'a', say: '{a} took the offer.' } } }],
    ['👋 Let {a} go', { quit: 'a', say: '{a} works for {rival} now.' }]
  ], CH);

  E('machine_sparks', 'team', '⚡', 'The machine is sparking', 'You tightened one bolt too many. Now there\'s smoke coming out.', [
    ['🔌 Pull the plug', { capacity: [0.85, 2, 'Broken machine'], say: 'The smoke stopped. The machine is dead for now.' }],
    ['🧯 Grab the extinguisher', { chance: { p: 0.7, win: { capacity: [0.9, 2, 'Broken machine'], say: 'Out. Nobody hurt.' }, lose: { cash: -0.8, closed: [1, 'Fire damage'], say: 'It caught fire anyway.' } } }],
    ['📞 Call an electrician', { cash: -0.5, say: 'Fixed properly this time.' }],
    ['🏃 Everyone out, now', { closed: [1, 'Machine fire'], rep: 2, say: 'Safe first. The firefighters handled it.' }]
  ], CH);

  E('beach_photos', 'team', '🏖️', '{a} was at the beach', '{a} posted beach photos on the day they were "sick". The whole team saw them.', [
    ['🚪 Fire {a}', { fire: 'a', team: 2, say: 'Lying has a price.' }],
    ['⚠️ Final warning', { a: -10, reliable: { a: 10 }, say: '{a} apologized to everyone.' }],
    ['💸 An unpaid day', { raise: ['a', -0.03], a: -8, say: '{a} got the message.' }],
    ['😂 Let it go, this once', { team: -3, a: 5, say: 'The team thinks you\'re too soft.' }]
  ], CH);

  E('idea_hit', 'team', '💡', '{a}\'s idea is a huge hit', 'A big chain wants to buy the idea. {a} is watching to see what you do.', [
    ['💰 Sell it', { cash: 2, a: -10, say: 'A lot of money. {a} expected a thank-you.' }],
    ['🤝 License it to them', { extra: [0.08, 12, 'Idea license'], say: 'They pay you every month to use it.' }],
    ['🎁 Sell it and share with {a}', { cash: 1.5, a: 25, loyal: { a: 25 }, say: '{a} will have ideas for you forever.' }],
    ['🚀 Keep it yours', { demand: [1.1, 10, 'Hit idea'], a: 8, say: 'Only {company} has it.' }]
  ], CH);

  E('injury_news', 'team', '📰', '{a}\'s story is in the newspaper', '"Boss refused to help injured worker." Your phone won\'t stop ringing.', [
    ['🙏 Pay everything and apologize', { cash: -0.8, rep: 3, a: 15, say: 'You made it right. People noticed.' }],
    ['📰 Give your side', { chance: { p: 0.3, win: { rep: 1, say: 'Some people understood.' }, lose: { rep: -5, say: 'It sounded like excuses.' } } }],
    ['🎁 A safety fund for all workers', { cash: -1, rep: 6, team: 8, say: 'Every worker is covered now.' }],
    ['🤐 No comment', { rep: -6, team: -6, say: 'The story ran for a week.' }]
  ], CH);

  E('family_update', 'team', '🕊️', '{a} is back from the hospital', '{a}\'s mother didn\'t make it. {a} came back to work, but they\'re not okay.', [
    ['🏠 More paid time off', { capacity: [0.95, 2, '{a} away'], a: 20, loyal: { a: 20 }, say: '"Take all the time you need."' }],
    ['💐 Flowers from the whole team', { team: 6, a: 15, say: 'Everyone signed the card.' }],
    ['🗣️ Someone to talk to', { cash: -0.1, a: 15, say: 'You paid for a grief counselor.' }],
    ['💼 Let them work if they want', { a: 5, say: 'Work helped {a} keep going.' }]
  ], CH);

  E('defend_video', 'team', '📱', 'The video of {a} is spreading', 'The customer\'s video has 200,000 views. It doesn\'t show what they said first.', [
    ['📹 Post your camera video', { chance: { p: 0.6, win: { fans: 20, rep: 3, say: 'The full video changed everything.' }, lose: { rep: -3, say: 'The internet had already decided.' } } }],
    ['🙏 Apologize, but back {a}', { rep: 1, a: 8, say: 'A careful balance. It calmed down.' }],
    ['📢 Stand by {a} publicly', { fans: 10, rep: -3, a: 15, loyal: { a: 20 }, say: 'Your team would walk through fire for you.' }],
    ['🤐 Wait it out', { rep: -4, say: 'It faded, slowly.' }]
  ], CH);

  E('slip_trial', 'customers', '⚖️', 'The trial: the slip case', 'The customer limps into court. Your lawyer has one question: "What do we have?"', [
    ['📹 Show the camera video', { chance: { p: 0.65, win: { rep: 3, say: 'They were faking. The judge was not happy with them.' }, lose: { cash: -1.5, say: 'The camera missed the moment. You lost.' } } }],
    ['🧑‍⚖️ Hire a better lawyer', { cash: -0.5, chance: { p: 0.75, win: { say: 'Your new lawyer won it.' }, lose: { cash: -1.2, say: 'You lost anyway.' } } }],
    ['🤝 Settle before the verdict', { cash: -0.8, say: 'Done. Not cheap, but done.' }],
    ['🗣️ Tell your story yourself', { chance: { p: 0.4, win: { rep: 4, say: 'The judge believed you.' }, lose: { cash: -1.5, say: 'You got nervous. You lost.' } } }]
  ], CH);

  E('health_shutdown', 'customers', '🚫', 'The city shut you down', 'A sign on your door. Reporters outside. The health office wants a plan.', [
    ['🧹 Full clean and new rules', { cash: -0.8, closed: [1, 'Shut down'], rep: 3, say: 'You passed the next inspection with top marks.' }],
    ['🎤 Talk to reporters honestly', { rep: 2, fans: 5, say: 'People respected that you owned it.' }],
    ['💸 Pay the sick customers', { cash: -0.6, rep: 4, say: 'The families dropped their complaints.' }],
    ['🚪 Hide until it blows over', { rep: -5, demand: [0.85, 6, 'Bad news'], say: 'It took months to win customers back.' }]
  ], CH);

  E('fight_hurt', 'customers', '🤕', 'You got hurt breaking up the fight', 'A broken nose. Blood on your shirt. The two men ran off.', [
    ['🏥 Go to the hospital', { capacity: [0.95, 1, 'Boss hurt'], team: 5, say: 'Two stitches. The team ran the shop.' }],
    ['👮 Report them', { chance: { p: 0.6, win: { cash: 0.3, say: 'Caught. They paid for everything.' }, lose: { say: 'They were never found.' } } }],
    ['💪 Keep working', { team: 6, rep: 2, say: 'Customers couldn\'t believe it. Tough boss.' }],
    ['🦺 Hire a guard', { cash: -0.4, happy: 3, say: 'No more fights.' }]
  ], CH);

  E('accused_truth', 'customers', '📹', '{a} did take the wallet', 'The camera shows it clearly. {a} can\'t look at you.', [
    ['🚪 Fire {a}', { fire: 'a', rep: 2, say: 'You gave her wallet back and apologized.' }],
    ['👮 Call the police', { fire: 'a', rep: 3, say: '{a} was arrested.' }],
    ['💬 Hear {a} out', { chance: { p: 0.4, win: { a: 10, loyal: { a: 20 }, say: '{a} was desperate. You gave one last chance.' }, lose: { fire: 'a', say: 'No good reason. {a} is gone.' } } }],
    ['🤝 Return it and apologize', { a: -10, rep: 1, say: 'The customer calmed down. {a} owes you.' }]
  ], CH);

  E('bribe_accused', 'business', '🍪', 'The inspector reported you for bribery', 'A plate of cookies. That\'s all it was. But now there\'s a letter from the city.', [
    ['⚖️ Get a lawyer', { cash: -0.4, say: 'Case dropped. Expensive cookies.' }],
    ['🙏 Explain and apologize', { chance: { p: 0.6, win: { say: 'They believed you.' }, lose: { cash: -0.6, say: 'A fine anyway.' } } }],
    ['💸 Pay the fine', { cash: -0.6, say: 'Done. No more cookies for inspectors.' }],
    ['📢 Post the cookie story', { chance: { p: 0.6, win: { fans: 25, say: 'The internet laughed. The city dropped it.' }, lose: { rep: -3, say: 'The city was not amused.' } } }]
  ], CH);

  E('boss_burned', 'business', '🩹', 'You got burned', 'Your arm is badly burned. The fire is out. Your team is scared.', [
    ['🏥 Hospital, and rest a week', { closed: [1, 'Boss injured'], team: 6, say: 'You healed. The team handled everything.' }],
    ['🩹 Bandage it and keep going', { team: -3, say: 'It hurt all week. The team worried.' }],
    ['🦺 Fire training for everyone', { cash: -0.3, team: 5, rep: 2, say: 'Next time, everyone knows what to do.' }],
    ['🤗 Thank the firefighters', { rep: 4, fans: 10, say: 'Free lunch for the fire station, forever.' }]
  ], CH);

  E('hackers_again', 'business', '💻', 'The hackers want more', 'They took your money and locked the files again. Now they want double.', [
    ['🧑‍💻 Hire experts now', { cash: -0.6, say: 'Files back. Hackers locked out.' }],
    ['👮 Call the police', { chance: { p: 0.4, win: { cash: 0.5, say: 'They traced them. Some money came back.' }, lose: { closed: [1, 'Hacked'], say: 'No luck. A lost week.' } } }],
    ['💸 Pay again', { cash: -1.5, chance: { p: 0.3, win: { say: 'They unlocked it this time.' }, lose: { closed: [1, 'Hacked'], say: 'They lied again.' } } }],
    ['🆕 Wipe everything', { closed: [1, 'Hacked'], say: 'Start from zero. Never pay hackers.' }]
  ], CH);

  E('recall_victims', 'business', '🚑', 'A child was hurt by your product', 'Not badly, but the parents are furious. The news is calling.', [
    ['🏥 Visit and pay for everything', { cash: -0.8, rep: 4, say: 'The parents saw you cared. They didn\'t sue.' }],
    ['📢 A full recall, now', { cash: -0.8, rep: 2, say: 'Late, but right.' }],
    ['🙏 A public apology', { rep: 2, say: 'People accepted it.' }],
    ['⚖️ Call your lawyer first', { rep: -6, cash: -1, say: 'The parents sued. The news ran it for days.' }]
  ], CH);

  E('friend_ruined', 'money', '😞', 'Your friend lost everything too', 'Their savings, their car. They gave you that stock tip. Now they need help.', [
    ['💵 Lend them money', { cash: -0.5, chance: { p: 0.6, win: { cash: 0.5, say: 'They paid it all back, months later.' }, lose: { say: 'They never could pay it back.' } } }],
    ['💼 Give them a job', { hireSpecial: { role: 'front', skill: 50, traits: ['loyal'] }, say: 'A fresh start, with you.' }],
    ['🤗 Just be there', { say: 'Dinner, every Friday. It helped.' }],
    ['😤 "This is your fault."', { say: 'You haven\'t spoken since.' }]
  ], CH);

  E('payday_missed', 'money', '💸', 'Payday came. The money didn\'t.', 'Your team is standing in your office. Some have rent due tomorrow.', [
    ['🏦 An emergency loan', { cash: 1.5, supply: [0.03, 12, 'Emergency loan'], team: 5, say: 'Everyone got paid. You\'ll pay it back.' }],
    ['🚗 Sell your own car', { cash: 1, team: 12, say: 'The team heard what you did. They\'ll never forget.' }],
    ['🧾 Pay half now', { cash: 0.3, team: -6, say: 'Nobody is happy.' }],
    ['🙏 "Next week, I promise."', { team: -15, next: ['resign', 1, 2, 0.6], say: 'Two people are looking for new jobs.' }]
  ], { chainOnly: true, who: { a: 'any' } });

  E('bank_fraud', 'money', '🚓', 'The police are at your door', 'Moving the bank\'s money was a crime. They want to talk.', [
    ['⚖️ Get a lawyer', { cash: -1, say: 'A fine and a lesson. No jail.' }],
    ['🙏 Confess and pay it back', { cash: -1.2, rep: -3, say: 'Honesty kept it small.' }],
    ['😬 Blame the bank', { rep: -6, cash: -1.5, say: 'The judge did not like that.' }],
    ['🤐 Say nothing', { chance: { p: 0.3, win: { cash: -0.5, say: 'Your lawyer found a mistake in their case.' }, lose: { cash: -2, rep: -8, say: 'The worst outcome.' } } }]
  ], CH);

  E('rival_collapse', 'rivals', '📉', '{rival} is running out of money', 'Their price war backfired. Their boss is on the phone for you.', [
    ['🏢 Buy their shop cheap', { cash: -2, rival: -0.4, capacity: [1.1, 16, 'Bought rival shop'], say: 'Their shop has your name on it now.' }],
    ['🧑‍🍳 Hire their best people', { hireSpecial: { role: 'front', skill: 78 }, rival: -0.1, say: 'Their best worker is yours.' }],
    ['🤝 Offer a fair truce', { rep: 3, say: 'You both stopped the price war.' }],
    ['😈 Let them sink', { rival: -0.2, say: 'You watched them struggle.' }]
  ], CH);

  E('debate_backlash', 'rivals', '📺', 'The internet turned on you', 'Clips of you shouting at {rival}\'s boss are everywhere.', [
    ['🙏 Apologize on air', { rep: 3, say: 'People respect a real apology.' }],
    ['😂 Laugh at yourself', { chance: { p: 0.6, win: { fans: 30, say: 'Your self-roast video was a hit.' }, lose: { rep: -2, say: 'It came off wrong.' } } }],
    ['🤝 Coffee with their boss', { rep: 4, rival: 0.02, say: 'A photo of you two laughing ended it.' }],
    ['🤐 Log off for a week', { rep: -2, say: 'It faded without you.' }]
  ], CH);

  E('countersuit_trial', 'rivals', '⚖️', 'Court day: you vs {rival}', 'Both lawyers are ready. The judge looks tired.', [
    ['🎨 Show your old designs', { chance: { p: 0.65, win: { cash: 1.5, rival: -0.1, say: 'Your designs came first. You won.' }, lose: { cash: -0.5, say: 'Not enough. You lost.' } } }],
    ['🧑‍⚖️ Let the lawyer do it', { cash: -0.3, chance: { p: 0.55, win: { cash: 1.5, say: 'Your lawyer was brilliant.' }, lose: { cash: -0.5, say: 'You lost.' } } }],
    ['🤝 Settle in the hallway', { cash: -0.2, say: 'Both sides dropped it.' }],
    ['🔥 Attack their reputation', { chance: { p: 0.4, win: { rival: -0.15, say: 'The judge sided with you.' }, lose: { rep: -5, say: 'The judge warned you. You lost.' } } }]
  ], CH);

  E('neighbor_rival_deal', 'rivals', '🤝', '{rival} wants to share costs', 'Your new neighbors suggest sharing deliveries and a street party.', [
    ['🚚 Share deliveries', { supply: [-0.02, 12, 'Shared deliveries'], say: 'Cheaper for both.' }],
    ['🎉 A street party together', { cash: -0.1, fans: 20, say: 'The whole street came.' }],
    ['🕵️ It\'s a trick', { chance: { p: 0.5, win: { say: 'It was real. You missed out.' }, lose: { rival: -0.05, say: 'You were right. They wanted your supplier.' } } }],
    ['🙅 Keep your distance', { say: 'Friendly, but not friends.' }]
  ], CH);

  E('family_ultimatum', 'boss', '🍽️', 'Your mom cooked dinner. You never came.', 'It was your birthday. She waited three hours. She called, crying.', [
    ['🏠 Change how you work', { capacity: [0.95, 12, 'Family time'], team: 3, say: 'Sunday dinners are sacred now.' }],
    ['🎁 Make it up to her', { cash: -0.1, say: 'A trip, just the two of you. She forgave you.' }],
    ['🧑‍💼 Hire someone to help you', { hireSpecial: { role: 'mgr', skill: 60 }, say: 'Now you can leave at six.' }],
    ['💼 "It\'s all for the family."', { next: ['family_ultimatum', 6, 10, 0.5], say: 'She stopped calling.' }]
  ], CH);

  E('burnout_breakdown', 'boss', '😣', 'You broke down at work', 'Your team found you crying in the storage room. You couldn\'t breathe.', [
    ['🏥 See a doctor today', { capacity: [0.95, 2, 'Boss resting'], team: 5, say: 'The doctor gave you a plan. You\'re following it.' }],
    ['🏖️ Two weeks off', { closed: [1, 'Boss resting'], team: 8, say: 'The team said: "Go. We\'ve got this."' }],
    ['🗣️ Talk to someone', { cash: -0.1, team: 3, say: 'Talking helped more than you expected.' }],
    ['💪 "I\'m fine."', { next: ['boss_collapse', 3, 8, 0.6], say: 'You weren\'t fine.' }]
  ], CH);

  E('safety_victim', 'shady', '🚑', 'A worker got hurt', 'The machine you didn\'t check broke. A worker\'s hand is badly hurt.', [
    ['🏥 Pay everything, full salary', { cash: -1, team: 8, say: 'They will heal. You will never skip a check again.' }],
    ['🙏 Tell the inspectors the truth', { cash: -0.8, rep: 2, say: 'A big fine. But you slept at night.' }],
    ['⚖️ Blame the machine maker', { rep: -4, say: 'Nobody believed it.' }],
    ['🤫 Cover it up', { chance: { p: 0.3, win: { say: 'Nobody found out. You feel terrible.' }, lose: { cash: -3, rep: -15, say: 'It came out. The worst week of your life.' } } }]
  ], CH);

  // =====================================================================
  // 🕯️ SERIOUS MOMENTS
  // =====================================================================

  E('worker_struggling', 'team', '🌧️', '{a} hasn\'t smiled in weeks', 'Today {a} tells you: "I\'m not okay. I can\'t sleep. Everything feels heavy."', [
    ['🗣️ Listen, really listen', { a: 10, loyal: { a: 15 }, say: 'You didn\'t fix it. But {a} felt heard.' }],
    ['🩺 Pay for a therapist', { cash: -0.2, a: 20, loyal: { a: 20 }, say: 'Weeks later, {a} laughed at a joke. Everyone noticed.' }],
    ['🏠 Paid time off', { capacity: [0.97, 2, '{a} resting'], a: 15, say: '{a} came back lighter.' }],
    ['💼 "Try to cheer up."', { a: -12, say: '{a} stopped talking about it.' }]
  ], { w: 1, cd: 40, who: { a: 'lowmood' } });

  E('layoffs', 'business', '📉', 'You may have to let people go', 'Sales are down. The numbers don\'t work. Something has to change.', [
    ['✂️ Let {a} go', { fire: 'a', supply: [-0.03, 8, 'Smaller team'], team: -6, say: 'The hardest conversation of your career.' }],
    ['💸 Everyone takes a pay cut', { teamRaise: -0.1, team: -8, say: 'Nobody lost their job. Nobody is happy.' }],
    ['🏦 Borrow to keep everyone', { cash: 1, supply: [0.03, 16, 'Rescue loan'], team: 8, say: 'Risky. But your team knows you fought for them.' }],
    ['💳 Stop paying yourself', { cash: 0.5, team: 12, say: 'Your team found out. They\'ll work twice as hard.' }]
  ], { w: 1, cd: 40, need: 5, who: { a: 'any' }, cond: function (g) { return g.cash < G.cost(g, 2); } });

  E('neighbor_fire', 'customers', '🔥', 'The family next door lost their home', 'A fire took everything last night. Three kids. They\'re standing in the street.', [
    ['🛋️ They can stay in the back', { team: 4, rep: 6, say: 'For two weeks, your shop was their home.' }],
    ['💰 Start a fundraiser', { cash: -0.2, rep: 8, fans: 20, say: 'Your customers raised enough for a new start.' }],
    ['🍽️ Free meals for a month', { cash: -0.2, rep: 5, say: 'The kids called your shop "the kitchen".' }],
    ['🙏 Send your sympathy', { rep: 1, say: 'They said thank you.' }]
  ], { w: 0.7, cd: 80 });

  E('refugee_family', 'customers', '🧳', 'A refugee family asks for work', 'They fled a war. The mother was a chef, the father an engineer. They\'ll do anything.', [
    ['💼 Hire the mother', { hireSpecial: { role: 'front', skill: 75, traits: ['hardworking', 'loyal'] }, rep: 3, say: 'The best hire you ever made.' }],
    ['📝 Help with their papers', { cash: -0.1, rep: 4, say: 'They got their work permits.' }],
    ['🍽️ A welcome dinner', { cash: -0.05, rep: 3, team: 3, say: 'They cooked for your whole team.' }],
    ['🙅 "We\'re not hiring."', { say: 'They thanked you anyway.' }]
  ], { w: 0.8, cd: 60 });

  E('unfair_manager', 'team', '⚖️', '{a} says {m} treats them unfairly', 'Because of where {a} is from. Two other workers say the same.', [
    ['🔍 Investigate properly', { cash: -0.2, chance: { p: 0.75, win: { demote: 'm', a: 15, team: 8, say: 'It was true. {m} is no longer a manager.' }, lose: { say: 'Not enough proof. You\'re watching closely.' } } }],
    ['⬇️ Demote {m} now', { demote: 'm', a: 12, team: 5, say: 'A clear message.' }],
    ['💬 Talk to {m}', { chance: { p: 0.5, win: { m: -5, a: 8, say: '{m} was shocked and apologized.' }, lose: { m: -10, say: '{m} denied everything.' } } }],
    ['🙈 "Probably a misunderstanding."', { a: -20, team: -8, rep: -3, say: 'Three people are looking for new jobs.' }]
  ], { w: 0.7, cd: 60, need: 4, who: { a: 'notmgr', m: 'mgr' } });

  E('kid_bullied', 'customers', '🎒', 'Kids are bullying a boy outside', 'Every day after school. Today they threw his bag in the street.', [
    ['🗣️ Step in', { rep: 4, say: 'The bullies ran. The boy said thanks, quietly.' }],
    ['📞 Call his school', { rep: 3, say: 'The school took it seriously.' }],
    ['🛡️ Let him wait inside', { rep: 5, fans: 5, say: 'He does his homework at your counter now.' }],
    ['🙈 "Kids will be kids."', { rep: -3, say: 'A customer saw you look away.' }]
  ], { w: 0.8, cd: 60 });

  E('worker_illness', 'team', '🎗️', '{a} has cancer', 'They found it early. {a} needs months of treatment and is scared about money.', [
    ['💵 Full pay during treatment', { cash: -1, a: 30, loyal: { a: 40 }, team: 10, capacity: [0.95, 8, '{a} in treatment'], next: ['worker_recovered_illness', 12, 20, 0.85], say: '"Just get better." {a} couldn\'t speak.' }],
    ['🗓️ Flexible hours', { a: 15, capacity: [0.97, 8, '{a} in treatment'], next: ['worker_recovered_illness', 12, 20, 0.8], say: '{a} works when they can.' }],
    ['🎗️ A fundraiser with customers', { rep: 6, fans: 15, a: 20, next: ['worker_recovered_illness', 12, 20, 0.85], say: 'Customers gave more than anyone expected.' }],
    ['📋 Unpaid leave only', { a: -10, next: ['worker_recovered_illness', 12, 20, 0.7], say: '{a} understood. It was hard.' }]
  ], { w: 0.5, cd: 80, minWeek: 20, who: { a: 'veteran' } });

  E('worker_recovered_illness', 'team', '🎉', '{a} is cancer-free', 'The doctors said the words today. {a} walked into the shop crying and laughing.', [
    ['🎉 Party for {a}', { cash: -0.1, team: 12, a: 20, say: 'Cake, balloons, and a lot of hugs.' }],
    ['🔔 Ring a bell in the shop', { fans: 15, rep: 3, say: 'Customers cheered with you.' }],
    ['🏖️ A paid week off to celebrate', { capacity: [0.97, 1, '{a} celebrating'], a: 25, say: '{a} went to the sea.' }],
    ['🤗 A quiet hug', { a: 12, say: 'Some moments don\'t need words.' }]
  ], CH);

  E('eviction', 'trouble', '📜', 'You have 60 days to leave', 'The building was sold. The new owner wants it empty.', [
    ['🏠 Find a new place now', { cash: -1, closed: [1, 'Moving'], demand: [0.95, 4, 'New address'], say: 'A new home for {company}.' }],
    ['⚖️ Fight it in court', { cash: -0.4, chance: { p: 0.5, win: { say: 'Your lease protected you. You stay.' }, lose: { cash: -1, closed: [1, 'Moving'], say: 'You lost. You moved in a hurry.' } } }],
    ['🤝 Talk to the new owner', { chance: { p: 0.5, win: { rent: 0.15, say: 'You can stay, for higher rent.' }, lose: { cash: -1, closed: [1, 'Moving'], say: 'They wouldn\'t listen.' } } }],
    ['🏢 Buy it from them', { cash: -3.5, rent: -0.3, say: 'Nobody can make you leave now.' }]
  ], { w: 0.5, cd: 100, minWeek: 25 });

  E('customer_hit', 'trouble', '🚑', 'A customer was hit by a car outside', 'Crossing the street to your shop. They\'re alive, but badly hurt.', [
    ['🏃 Run out and help', { rep: 6, say: 'You held their hand until the ambulance came.' }],
    ['📞 Call an ambulance', { rep: 3, say: 'It came in four minutes.' }],
    ['🚸 Push the city for a crossing', { cash: -0.3, rep: 5, say: 'A new crossing, with a light. Paid partly by you.' }],
    ['💐 Visit them in the hospital', { rep: 4, say: 'They cried when they saw you.' }]
  ], { w: 0.6, cd: 80 });
})();
