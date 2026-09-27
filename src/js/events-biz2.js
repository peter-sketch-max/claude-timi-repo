// Events that only happen in one kind of business, part 2: the growing companies.
// B(business, id, icon, title, text, [4 x [answer, effect]], extra fields). Defined in events-biz1.js.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  var B = CS.biz, H = CS.EVH, rival = H.rival, FRONT = { who: { a: 'front' } };
  var week = function (g) { return ((g.week - 1) % 52) + 1; };

  // 🛒 SUPERMARKET
  B('supermarket', 'price_war', '🏷️', 'A discount chain is undercutting you', 'Everything 20% cheaper. Your parking lot is half empty.', [
    ['🏷️ Store brand at low prices', { cash: -0.4, demand: [1.1, 12, 'Store brand'], say: 'Cheap and good. Customers came back.' }],
    ['🥬 Best fresh food in town', { cash: -0.5, rep: 5, say: 'Quality won them back.' }],
    ['🎟️ Loyalty app with points', { cash: -0.3, happy: 5, demand: [1.06, 12, 'Loyalty app'], say: 'Regulars love the points.' }],
    ['📉 Cut prices across the board', { price: -1, say: 'Busy again. Tiny margins.' }]
  ]);
  B('supermarket', 'recall_meat', '🥩', 'Your meat supplier has a recall', 'Some meat you sold might be unsafe.', [
    ['📢 Pull it and tell everyone', { cash: -0.5, rep: 5, say: 'Customers trusted you more.' }],
    ['💸 Refund anyone who asks', { cash: -0.3, rep: 2, say: 'Handled.' }],
    ['🔄 Switch suppliers', { cash: -0.4, rep: 3, say: 'A safer supplier.' }],
    ['🤫 Remove it quietly', { chance: { p: 0.5, win: { say: 'Nobody got sick.' }, lose: { rep: -12, say: 'People got sick. The news found out.' } } }]
  ], { kind: 'news' });
  B('supermarket', 'self_checkout', '🤖', 'Self-checkout machines?', 'Faster lines, fewer cashiers. The team is worried about their jobs.', [
    ['🤖 Install them', { cash: -1.2, equip: 0.05, team: -12, say: 'Faster. The team feels threatened.' }],
    ['🤝 Install and retrain staff', { cash: -1.4, equip: 0.04, team: 2, say: 'Nobody lost their job.' }],
    ['🧪 Try two machines', { cash: -0.4, equip: 0.015, say: 'A test run.' }],
    ['🙅 Keep real cashiers', { team: 8, rep: 2, say: 'Older customers love it.' }]
  ]);
  B('supermarket', 'freezer_outage', '🧊', 'The freezers failed overnight', 'Frozen food everywhere is thawing.', [
    ['🗑️ Throw it all out', { cash: -0.8, rep: 2, say: 'Safe, but costly.' }],
    ['🏷️ Sell thawed food cheap today', { cash: -0.4, happy: 3, say: 'Customers loved the bargains.' }],
    ['🔧 Emergency repair', { cash: -0.5, say: 'Fixed. Half saved.' }],
    ['🤫 Refreeze and sell', { chance: { p: 0.4, win: { say: 'Nobody noticed.' }, lose: { rep: -15, say: 'Food poisoning cases. A scandal.' } } }]
  ]);
  B('supermarket', 'local_farmers', '🧑‍🌾', 'Local farmers want shelf space', 'They\'d sell fresh produce directly. Prices are a bit higher.', [
    ['✅ A local corner', { rep: 5, demand: [1.06, 12, 'Local produce'], say: 'Customers love it.' }],
    ['📉 Only at your prices', { chance: { p: 0.5, win: { demand: [1.05, 12, 'Local produce'], say: 'They agreed.' }, lose: { say: 'They went to a market instead.' } } }],
    ['🎪 Weekend farmers market', { cash: -0.2, fans: 20, demand: [1.08, 8, 'Farmers market'], say: 'Weekends are packed.' }],
    ['🙅 No space', { say: 'You passed.' }]
  ]);
  B('supermarket', 'shoplifting_ring', '🕵️', 'A shoplifting gang is hitting you', 'Organized. Fast. They took thousands in a week.', [
    ['🦺 Hire guards', { cash: -0.6, say: 'They moved on.' }],
    ['📹 Better cameras', { cash: -0.8, chance: { p: 0.6, win: { rep: 3, say: 'The police caught them on your footage.' }, lose: { say: 'They wore masks.' } } }],
    ['🔒 Lock up expensive items', { happy: -3, say: 'Annoying for customers, but it worked.' }],
    ['🤷 Accept the loss', { cash: -0.6, say: 'They came back.' }]
  ]);
  B('supermarket', 'holiday_turkeys', '🦃', 'Holiday season shopping', 'Everyone needs a big holiday dinner. Shelves empty fast.', [
    ['📦 Order double stock', { cash: -0.6, extra: [0.4, 1, 'Holiday shopping'], say: 'Full shelves, happy customers.' }],
    ['📝 Pre-order holiday boxes', { extra: [0.3, 1, 'Holiday boxes'], fans: 10, say: 'Organized and profitable.' }],
    ['❤️ Donate dinners to families', { cash: -0.2, rep: 8, extra: [0.2, 1, 'Holiday shopping'], say: 'The news covered it.' }],
    ['😌 Normal stock', { extra: [0.1, 1, 'Holiday shopping'], happy: -4, say: 'Empty shelves by noon.' }]
  ], { cond: function (g) { return week(g) >= 46 && week(g) <= 51; }, w: 20 });

  // 🏨 HOTEL
  B('hotel', 'bedbugs', '🛏️', 'A guest found bedbugs', 'They posted photos. Room 212.', [
    ['🔒 Close the floor and treat it', { cash: -0.6, capacity: [0.85, 2, 'Pest control'], rep: 2, say: 'Handled properly.' }],
    ['🎁 Refund and a free stay', { cash: -0.1, rep: 1, say: 'The guest calmed down.' }],
    ['🔍 Inspect every room', { cash: -0.8, rep: 4, say: 'Found two more. All clean now.' }],
    ['🤐 Deny it', { rep: -12, say: 'The photos went viral.' }]
  ]);
  B('hotel', 'overbooked', '📅', 'You\'re overbooked tonight', 'Twelve guests have rooms. You only have eight.', [
    ['🏨 Pay for rooms elsewhere', { cash: -0.4, rep: 3, say: 'Guests were impressed.' }],
    ['⬆️ Upgrade some to suites', { cash: -0.2, say: 'Lucky guests. Tight squeeze.' }],
    ['💸 Refund and apologize', { rep: -3, say: 'Four angry reviews.' }],
    ['🛋️ Offer sofa beds', { rep: -5, say: 'Terrible reviews.' }]
  ]);
  B('hotel', 'celebrity_stay', '🌟', 'A superstar booked your best suite', 'Fans found out. They\'re camping outside.', [
    ['🦺 Extra security', { cash: -0.3, rep: 5, say: 'The star was safe. They\'ll be back.' }],
    ['📸 Post about it', { fans: 40, rep: -4, say: 'Fans went wild. The star left early.' }],
    ['🤫 Protect their privacy', { rep: 8, say: 'Stars now call you the safest hotel in town.' }],
    ['🎁 A private dinner for them', { cash: -0.2, chance: { p: 0.6, win: { fans: 30, rep: 5, say: 'They posted about you.' }, lose: { say: 'Politely declined.' } } }]
  ]);
  B('hotel', 'conference', '🎤', 'A big conference wants your hotel', 'Five hundred guests for three days. They want a discount.', [
    ['✍️ Accept', { extra: [0.5, 1, 'Conference'], team: -6, say: 'Fully booked.' }],
    ['🤝 Push for a better price', { chance: { p: 0.5, win: { extra: [0.7, 1, 'Conference'], say: 'Signed at your price.' }, lose: { say: 'They went elsewhere.' } } }],
    ['🍽️ Include food and events', { cash: -0.2, extra: [0.7, 1, 'Conference'], say: 'A huge week.' }],
    ['🙅 Too much', { say: 'You passed.' }]
  ]);
  B('hotel', 'guest_died', '🕯️', 'A guest passed away in their room', 'An old man, peacefully in his sleep. His family is on the way.', [
    ['🕯️ Handle it with respect', { rep: 4, say: 'The family thanked you.' }],
    ['🔒 Close the room for a while', { capacity: [0.97, 4, 'Room closed'], rep: 2, say: 'Quietly respectful.' }],
    ['💐 Flowers and help for the family', { cash: -0.1, rep: 6, say: 'They wrote a kind letter.' }],
    ['🤐 Keep it from other guests', { say: 'Most never knew.' }]
  ]);
  B('hotel', 'review_site', '⭐', 'A travel site wants a big fee', '"Pay us, or you drop to page ten."', [
    ['💸 Pay it', { supply: [0.04, 12, 'Travel site fee'], demand: [1.1, 12, 'Top listing'], say: 'Bookings rolled in.' }],
    ['🌐 Build your own booking site', { cash: -0.6, demand: [1.04, 16, 'Own website'], say: 'No fees, slower growth.' }],
    ['🤝 Negotiate', { chance: { p: 0.4, win: { supply: [0.02, 12, 'Travel site fee'], demand: [1.1, 12, 'Top listing'], say: 'A better deal.' }, lose: { demand: [0.9, 6, 'Low listing'], say: 'Page ten.' } } }],
    ['🙅 Refuse', { demand: [0.9, 6, 'Low listing'], say: 'Fewer bookings.' }]
  ]);
  B('hotel', 'pool_accident', '🏊', 'A child almost drowned in the pool', 'A lifeguard pulled her out just in time. The parents are shaken.', [
    ['🏅 Reward the lifeguard', { team: 6, rep: 4, say: 'A hero on your staff.' }],
    ['🦺 Two lifeguards from now on', { cash: -0.3, rep: 6, say: 'The safest pool in town.' }],
    ['🔒 Close the pool for a review', { capacity: [0.95, 2, 'Pool closed'], rep: 3, say: 'Safety checked.' }],
    ['⚖️ Call your lawyer', { rep: -5, say: 'The parents felt ignored.' }]
  ]);

  // 🏋️ GYM
  B('gym', 'new_year', '🎆', 'New Year\'s resolution rush', 'Hundreds want to join. By March, most will stop coming.', [
    ['📜 Year-long contracts', { cash: 1, happy: -3, say: 'Money in the bank. Some complaints later.' }],
    ['🎟️ Monthly memberships', { extra: [0.2, 4, 'New Year rush'], say: 'Honest money.' }],
    ['🏋️ Free classes to keep them', { cash: -0.2, demand: [1.1, 8, 'Motivated members'], say: 'More of them stuck with it.' }],
    ['🙅 No special offer', { extra: [0.1, 4, 'New Year rush'], say: 'Still busy.' }]
  ], { cond: function (g) { return week(g) <= 4; }, w: 20 });
  B('gym', 'injury', '🩼', 'A member got hurt on a machine', 'The machine broke mid-lift. He\'s in the hospital.', [
    ['💸 Pay his bills', { cash: -0.6, rep: 3, say: 'No lawsuit.' }],
    ['🔧 Check every machine', { cash: -0.5, equip: 0.02, rep: 4, say: 'All safe now.' }],
    ['⚖️ Fight it', { chance: { p: 0.5, win: { say: 'He signed a waiver. You won.' }, lose: { cash: -1.5, rep: -5, say: 'You lost.' } } }],
    ['🙏 Visit him', { rep: 3, say: 'He appreciated it. No lawsuit.' }]
  ]);
  B('gym', 'trainer_influencer', '💪', '{a} is famous online', 'Their workout videos have a million fans. Members want sessions with {a}.', [
    ['💵 Premium sessions with {a}', { extra: [0.1, 8, 'Star trainer'], a: 10, say: 'Fully booked for weeks.' }],
    ['📱 Film classes at your gym', { fans: 40, demand: [1.08, 8, 'Famous trainer'], say: 'New members from everywhere.' }],
    ['💰 Raise to keep {a}', { raise: ['a', 0.2], loyal: { a: 20 }, say: '{a} isn\'t leaving.' }],
    ['🙅 "No filming at work"', { a: -12, say: '{a} is looking at other gyms.' }]
  ], FRONT);
  B('gym', 'cheap_gym', '🏋️', 'A cheap 24/7 gym opened nearby', 'Half your price. Members are leaving.', [
    ['⭐ Premium experience', { cash: -0.6, rep: 5, say: 'Better gym, better people.' }],
    ['🧘 Classes they don\'t have', { cash: -0.3, demand: [1.06, 12, 'Special classes'], say: 'Yoga and boxing brought them back.' }],
    ['📉 Lower your price', { price: -1, say: 'You kept members.' }],
    ['🤷 Wait', { demand: [0.88, 8, 'Cheap gym'], say: 'Members left.' }]
  ]);
  B('gym', 'steroids', '💉', 'Steroids are being sold in your gym', 'A member reported it. Others know too.', [
    ['🚪 Ban him', { rep: 4, say: 'He\'s gone.' }],
    ['👮 Call the police', { rep: 6, say: 'He was arrested.' }],
    ['📹 Cameras in the hallway', { cash: -0.3, rep: 3, say: 'It stopped.' }],
    ['🙈 Ignore it', { chance: { p: 0.5, win: { say: 'He stopped on his own.' }, lose: { rep: -12, say: 'The news ran a story on your gym.' } } }]
  ]);
  B('gym', 'marathon', '🏃', 'The city marathon needs a sponsor', 'Your logo on every runner\'s shirt.', [
    ['🏃 Sponsor it', { cash: -0.8, fans: 40, rep: 5, say: 'Your logo was everywhere.' }],
    ['🏋️ A training program for runners', { extra: [0.1, 6, 'Marathon training'], fans: 15, say: 'Runners signed up.' }],
    ['🥤 A water station', { cash: -0.2, fans: 20, say: 'Runners loved you.' }],
    ['🙅 Pass', { say: 'You passed.' }]
  ]);
  B('gym', 'broken_ac', '🥵', 'The AC broke in summer', 'The gym feels like a sauna. Members are complaining.', [
    ['❄️ New AC today', { cash: -0.8, happy: 5, say: 'Cool again.' }],
    ['🌀 Big fans for now', { cash: -0.1, happy: -2, say: 'Better than nothing.' }],
    ['🏖️ Outdoor classes', { fans: 10, say: 'Members loved it.' }],
    ['💸 Discount for the heat', { supply: [0.04, 2, 'Heat discount'], rep: 2, say: 'Members felt heard.' }]
  ], { cond: function (g) { return week(g) >= 24 && week(g) <= 36; } });

  // 🏗️ CONSTRUCTION
  B('construction', 'worker_fall', '🚑', '{a} fell from the scaffold', 'A serious fall. {a} is on the way to the hospital.', [
    ['🏥 Pay everything, full salary', { cash: -0.8, team: 10, loyal: { a: 25 }, capacity: [0.9, 4, '{a} injured'], say: 'The team respects you.' }],
    ['🦺 Stop work for a safety check', { closed: [1, 'Safety check'], rep: 5, say: 'You found three more dangers.' }],
    ['⚖️ Blame {a}', { team: -15, rep: -8, say: 'The team is disgusted.' }],
    ['💐 Visit {a} with the team', { team: 8, a: 15, say: '{a} was touched.' }]
  ], FRONT);
  B('construction', 'city_contract', '🏛️', 'The city is bidding a big project', 'A new school. Big money. Lots of builders want it.', [
    ['📉 Bid low to win', { chance: { p: 0.6, win: { extra: [0.12, 10, 'School project'], say: 'You won. Tight budget.' }, lose: { say: 'Someone went even lower.' } } }],
    ['⭐ Bid on quality', { chance: { p: 0.4, win: { extra: [0.15, 10, 'School project'], rep: 5, say: 'Quality won.' }, lose: { say: 'Price won.' } } }],
    ['🤝 Team up with {rival}', { chance: { p: 0.7, win: { extra: [0.08, 10, 'Shared project'], say: 'Won together.' }, lose: { say: 'Lost together.' } } }],
    ['🙅 Skip it', { say: 'You passed.' }]
  ], { init: rival });
  B('construction', 'steel_prices', '🏗️', 'Steel prices doubled', 'Every project is now over budget.', [
    ['📜 Pass it to clients', { happy: -4, say: 'Clients grumbled but paid.' }],
    ['😬 Absorb it', { supply: [0.06, 8, 'Steel prices'], say: 'Painful profits.' }],
    ['🪵 Use wood where possible', { cash: -0.2, rep: 2, supply: [0.02, 8, 'Mixed materials'], say: 'Clever and cheaper.' }],
    ['⏳ Pause projects', { capacity: [0.8, 3, 'Paused'], say: 'Waiting for prices to drop.' }]
  ], { kind: 'news' });
  B('construction', 'bad_foundation', '🧱', 'Cracks in a building you finished', 'A client says the foundation is failing. It\'s your work.', [
    ['🔧 Fix it for free', { cash: -1, rep: 6, say: 'The client was impressed.' }],
    ['🔍 Hire an expert to check', { cash: -0.2, chance: { p: 0.5, win: { say: 'It was the ground, not you.' }, lose: { cash: -1, say: 'It was your work. Fixed.' } } }],
    ['⚖️ Fight it', { chance: { p: 0.4, win: { say: 'You won.' }, lose: { cash: -2, rep: -10, say: 'You lost. Everyone heard.' } } }],
    ['🙈 Ignore it', { rep: -12, say: 'The client went to the news.' }]
  ]);
  B('construction', 'rain_delay', '🌧️', 'Three weeks of rain', 'Projects are behind. Clients are angry.', [
    ['⏰ Work weekends after', { team: -10, say: 'Back on schedule.' }],
    ['🧑‍🔧 Hire extra crews', { cash: -0.6, say: 'Back on time.' }],
    ['📞 Explain to clients', { chance: { p: 0.6, win: { say: 'They understood.' }, lose: { cash: -0.3, say: 'Late fees.' } } }],
    ['🏠 Work indoors meanwhile', { capacity: [0.9, 3, 'Rain'], say: 'Something is getting done.' }]
  ]);
  B('construction', 'historic_find', '🏺', 'Your crew dug up old ruins', 'On a building site. Ancient pottery. Work must stop.', [
    ['🏛️ Call the museum', { closed: [1, 'Dig site'], rep: 8, fans: 30, say: 'You were on the news. Heroes.' }],
    ['🤫 Keep digging', { chance: { p: 0.3, win: { say: 'Nobody found out.' }, lose: { cash: -2, rep: -15, say: 'Illegal. Huge fine.' } } }],
    ['🤝 Build around it', { cash: -0.5, rep: 5, say: 'The ruins are now part of the building.' }],
    ['📸 Post photos first', { fans: 20, closed: [1, 'Dig site'], say: 'The internet went crazy.' }]
  ], { rarity: 'rare' });
  B('construction', 'skyscraper', '🏙️', 'A developer wants a skyscraper', 'The tallest building in {city}. The biggest job you\'ve ever had.', [
    ['🏙️ Take it', { cash: -1, extra: [0.12, 10, 'Skyscraper'], team: -5, say: 'Your name on the city skyline.' }],
    ['🤝 Share it with other builders', { extra: [0.07, 10, 'Skyscraper share'], say: 'Safer. Still big.' }],
    ['📈 Ask for more money', { chance: { p: 0.4, win: { extra: [0.16, 10, 'Skyscraper'], say: 'They agreed.' }, lose: { say: 'They went elsewhere.' } } }],
    ['🙅 Too risky', { say: 'You passed.' }]
  ], { minWeek: 20 });

  // 🛋️ FURNITURE MAKER
  B('furniture', 'wood_shortage', '🪵', 'There\'s a wood shortage', 'A forest fire cut supply. Prices are up and orders are waiting.', [
    ['💸 Pay the high price', { supply: [0.05, 8, 'Wood shortage'], say: 'Orders delivered.' }],
    ['♻️ Use recycled wood', { cash: -0.1, rep: 5, fans: 15, say: 'Customers love the eco look.' }],
    ['⏳ Delay orders', { happy: -5, say: 'Unhappy customers.' }],
    ['🌍 Import wood', { cash: -0.4, say: 'Expensive, but on time.' }]
  ], { kind: 'news' });
  B('furniture', 'custom_order', '🪑', 'A famous chef wants custom tables', 'Twenty handmade tables for a new restaurant. Tight deadline.', [
    ['💪 Accept', { extra: [0.3, 1, 'Custom tables'], team: -6, fans: 10, say: 'Beautiful work.' }],
    ['🧑‍🔧 Hire help and accept', { cash: -0.2, extra: [0.3, 1, 'Custom tables'], say: 'Done on time.' }],
    ['📈 Charge a rush fee', { chance: { p: 0.6, win: { extra: [0.45, 1, 'Custom tables'], team: -6, say: 'They paid.' }, lose: { say: 'They went elsewhere.' } } }],
    ['🙅 Too tight', { say: 'You passed.' }]
  ]);
  B('furniture', 'cheap_import', '📦', 'Cheap flat-pack furniture everywhere', 'A giant store sells sofas at half your price.', [
    ['⭐ Handmade and lasting', { rep: 5, say: 'Quality buyers stay loyal.' }],
    ['📉 A cheaper line', { cash: -0.3, demand: [1.06, 12, 'Budget line'], say: 'New customers.' }],
    ['🔧 Repair service', { extra: [0.05, 12, 'Repairs'], say: 'People fix their old furniture with you.' }],
    ['🤷 Ignore it', { demand: [0.9, 8, 'Cheap imports'], say: 'Sales dropped.' }]
  ]);
  B('furniture', 'saw_accident', '🪚', '{a} cut their hand on a saw', 'Not too deep, but a lot of blood. The team is shaken.', [
    ['🏥 Hospital, paid leave', { cash: -0.2, a: 15, capacity: [0.9, 2, '{a} injured'], say: '{a} is grateful.' }],
    ['🦺 New safety guards on saws', { cash: -0.4, team: 8, say: 'Safer workshop.' }],
    ['🎓 Safety training', { cash: -0.1, team: 4, say: 'Everyone is careful now.' }],
    ['🩹 Bandage and back to work', { a: -15, team: -8, say: 'The team thinks you don\'t care.' }]
  ], FRONT);
  B('furniture', 'design_award', '🏆', 'Your chair is nominated for an award', 'A design prize. Winning would put you in magazines.', [
    ['🏆 Enter and show up', { cash: -0.2, chance: { p: 0.5, win: { rep: 8, fans: 30, say: 'You won.' }, lose: { rep: 2, say: 'Runner-up.' } } }],
    ['🎨 Make a special edition', { cash: -0.4, chance: { p: 0.6, win: { rep: 8, extra: [0.1, 6, 'Award chair'], say: 'Won. It sold out.' }, lose: { say: 'Didn\'t win.' } } }],
    ['📢 Promote the nomination', { fans: 15, say: 'Nice buzz.' }],
    ['🙅 Skip it', { say: 'You passed.' }]
  ]);
  B('furniture', 'returns', '🔄', 'A sofa came back broken', 'The customer says it broke in a week. The photos look bad.', [
    ['🛋️ Replace it', { cash: -0.3, rep: 3, say: 'Happy customer.' }],
    ['🔍 Check how it broke', { chance: { p: 0.5, win: { say: 'Their kids jumped on it. No refund.' }, lose: { cash: -0.3, say: 'A bad batch. Replaced.' } } }],
    ['🔧 Check the whole batch', { cash: -0.5, rep: 5, say: 'Found and fixed the problem.' }],
    ['🙅 Refuse', { rep: -6, say: 'Bad reviews.' }]
  ]);
  B('furniture', 'hotel_order', '🏨', 'A hotel chain wants 500 beds', 'The biggest order in your history.', [
    ['✍️ Sign', { extra: [0.15, 8, 'Hotel order'], team: -6, say: 'The workshop is working flat out.' }],
    ['🏭 Rent a bigger workshop', { cash: -0.8, extra: [0.15, 8, 'Hotel order'], capacity: [1.1, 8, 'Bigger workshop'], say: 'Room to grow.' }],
    ['🤝 Half the order', { extra: [0.08, 8, 'Hotel order'], say: 'Manageable.' }],
    ['🙅 Too big', { say: 'You passed.' }]
  ], { minWeek: 10 });

  // 📺 ELECTRONICS
  B('electronics', 'exploding_battery', '🔋', 'A gadget you sold caught fire', 'A battery overheated. Nobody was hurt, but the video is spreading.', [
    ['📢 Recall the model', { cash: -0.6, rep: 5, say: 'Safe and responsible.' }],
    ['🔍 Test the batch', { cash: -0.2, chance: { p: 0.6, win: { say: 'Just one bad unit.' }, lose: { cash: -0.6, say: 'A bad batch. Recalled.' } } }],
    ['⚖️ Blame the maker', { rep: -2, say: 'Customers didn\'t care whose fault it was.' }],
    ['🤐 Say nothing', { chance: { p: 0.3, win: { say: 'It blew over.' }, lose: { rep: -12, say: 'Another one caught fire.' } } }]
  ]);
  B('electronics', 'launch_day', '📱', 'A hot new console launches Friday', 'Everyone wants one. You got only fifty.', [
    ['🎟️ Raffle them', { fans: 20, rep: 3, say: 'Fair and exciting.' }],
    ['🏃 First come, first served', { extra: [0.1, 1, 'Launch day'], happy: -2, say: 'A line all night.' }],
    ['📈 Sell above price', { extra: [0.2, 1, 'Launch day'], rep: -5, say: 'People called you greedy.' }],
    ['🎁 Bundle with games', { extra: [0.18, 1, 'Launch day'], say: 'Bigger sales.' }]
  ]);
  B('electronics', 'online_giant', '📦', 'Customers try in-store, buy online', 'They test your products, then order cheaper on their phones.', [
    ['🏷️ Match online prices', { price: -1, say: 'You keep sales.' }],
    ['🔧 Free setup and support', { cash: -0.2, demand: [1.08, 12, 'Free setup'], say: 'Service they can\'t get online.' }],
    ['🌐 Open an online shop', { cash: -0.6, demand: [1.1, 12, 'Online shop'], say: 'Selling everywhere now.' }],
    ['🤷 Ignore it', { demand: [0.9, 8, 'Showrooming'], say: 'Sales dropped.' }]
  ]);
  B('electronics', 'warranty_scam', '🔄', 'Fake warranty claims', 'People bring broken gadgets, bought elsewhere, and claim a warranty.', [
    ['📜 Serial number checks', { cash: -0.1, say: 'Fake claims stopped.' }],
    ['🙏 Accept them all', { cash: -0.3, say: 'Customers love you. Your wallet doesn\'t.' }],
    ['👮 Report the worst one', { rep: 2, say: 'Word got around.' }],
    ['🔒 Stricter rules', { happy: -3, say: 'Honest customers grumbled.' }]
  ]);
  B('electronics', 'smart_home', '🏠', 'Smart home gadgets are booming', 'Smart lights, speakers, doorbells. Everyone wants them.', [
    ['📦 A smart home section', { cash: -0.5, demand: [1.1, 12, 'Smart home'], say: 'Selling fast.' }],
    ['🧑‍🔧 Installation service', { extra: [0.08, 12, 'Installs'], say: 'Customers love it.' }],
    ['🏠 A demo room', { cash: -0.3, fans: 15, demand: [1.08, 10, 'Demo room'], say: 'People come just to play.' }],
    ['🙅 Pass', { say: 'You passed.' }]
  ]);
  B('electronics', 'employee_theft', '📦', 'Phones are missing from storage', 'Only staff can get in. Twelve phones are gone.', [
    ['📹 Camera in storage', { cash: -0.3, say: 'It stopped.' }],
    ['🔍 Check everyone\'s bags', { team: -8, chance: { p: 0.5, win: { say: 'Found them.' }, lose: { say: 'Nothing found.' } } }],
    ['💬 Talk to the team', { chance: { p: 0.4, win: { say: 'Someone confessed.' }, lose: { cash: -0.3, say: 'Silence.' } } }],
    ['👮 Call the police', { team: -4, rep: 1, say: 'They found the thief.' }]
  ]);
  B('electronics', 'repair_shop', '🔧', 'Add a repair counter?', 'Customers keep asking if you fix things.', [
    ['🔧 Hire a technician', { hireSpecial: { role: 'front', skill: 65 }, extra: [0.07, 12, 'Repairs'], say: 'Steady repair money.' }],
    ['🎓 Train {a}', { cash: -0.2, skill: { a: 6 }, extra: [0.05, 12, 'Repairs'], say: '{a} fixes everything now.' }],
    ['🤝 Partner with a repair shop', { extra: [0.03, 12, 'Referrals'], say: 'Small but easy money.' }],
    ['🙅 No', { say: 'You passed.' }]
  ], FRONT);

  // 🚚 DELIVERY
  B('delivery', 'van_crash', '🚐', '{a} crashed a delivery van', 'Nobody hurt. The van is wrecked. Packages everywhere.', [
    ['🆕 Replace the van', { cash: -1, say: 'Back on the road.' }],
    ['🧑‍🏫 Driver training', { cash: -0.2, skill: { a: 5 }, say: 'Safer drivers.' }],
    ['📄 Insurance', { chance: { p: function (g) { return g.flags.insured ? 0.9 : 0.4; }, win: { cash: -0.1, say: 'Covered.' }, lose: { cash: -0.8, say: 'Not covered.' } } }],
    ['🚪 Fire {a}', { fire: 'a', team: -5, say: 'The drivers are nervous.' }]
  ], FRONT);
  B('delivery', 'holiday_peak', '🎁', 'Holiday season. Packages everywhere', 'Three times the normal volume.', [
    ['🧑‍💼 Hire temp drivers', { cash: -0.3, extra: [0.3, 1, 'Holiday peak'], say: 'Everything delivered on time.' }],
    ['⏰ Everyone works overtime', { extra: [0.3, 1, 'Holiday peak'], team: -12, say: 'Delivered. Exhausted team.' }],
    ['📈 Charge a holiday surcharge', { extra: [0.25, 1, 'Holiday peak'], happy: -3, say: 'More money, fewer friends.' }],
    ['🐢 Accept delays', { extra: [0.1, 1, 'Holiday peak'], rep: -5, say: 'Angry customers.' }]
  ], { cond: function (g) { return week(g) >= 47 && week(g) <= 51; }, w: 20 });
  B('delivery', 'lost_package', '📦', 'A very expensive package went missing', 'A client\'s diamond ring. Worth a fortune.', [
    ['🔍 Search everything', { chance: { p: 0.5, win: { rep: 4, say: 'Found under a seat.' }, lose: { cash: -0.8, say: 'Gone. You paid.' } } }],
    ['💸 Pay the client', { cash: -0.8, rep: 2, say: 'Paid in full.' }],
    ['📹 GPS trackers on all packages', { cash: -0.5, equip: 0.01, say: 'Never again.' }],
    ['🙅 "Not our fault"', { rep: -8, say: 'The client posted everywhere.' }]
  ]);
  B('delivery', 'drone', '🛸', 'Drone delivery trial', 'The city wants a company to test drone deliveries.', [
    ['🛸 Volunteer', { cash: -1, fans: 40, equip: 0.04, say: 'The future, and you\'re in it.' }],
    ['🤝 Partner with a drone company', { cash: -0.3, fans: 20, equip: 0.02, say: 'Low risk.' }],
    ['👀 Watch others try first', { say: 'You waited.' }],
    ['🙅 Too risky', { say: 'You passed.' }]
  ], { minWeek: 20 });
  B('delivery', 'online_store', '🛒', 'A huge online store wants you', 'They want you to deliver all their orders in {city}. Low price.', [
    ['✍️ Sign', { extra: [0.15, 12, 'Online store'], team: -5, say: 'Busy trucks.' }],
    ['🤝 Negotiate', { chance: { p: 0.5, win: { extra: [0.2, 12, 'Online store'], say: 'Better price.' }, lose: { say: 'They signed with someone else.' } } }],
    ['🚐 Buy more vans first', { cash: -1, capacity: [1.15, 20, 'More vans'], extra: [0.15, 12, 'Online store'], say: 'Ready for anything.' }],
    ['🙅 Too cheap', { say: 'You passed.' }]
  ]);
  B('delivery', 'dog_bite', '🐕', 'A dog bit {a} on a delivery', '{a} is okay, but scared to go back to that street.', [
    ['🏥 Doctor and a paid day', { a: 12, say: '{a} is grateful.' }],
    ['⚖️ Report the owner', { chance: { p: 0.6, win: { cash: 0.2, say: 'The owner paid.' }, lose: { say: 'Nothing happened.' } } }],
    ['🔀 Change {a}\'s route', { a: 8, say: '{a} feels safe.' }],
    ['😤 "Part of the job"', { a: -15, say: '{a} is upset.' }]
  ], FRONT);
  B('delivery', 'gas_prices', '⛽', 'Gas prices jumped', 'Your trucks cost twice as much to run.', [
    ['📈 Add a fuel fee', { happy: -4, say: 'Customers grumbled.' }],
    ['🔋 Buy electric vans', { cash: -1.5, supply: [-0.04, 30, 'Electric vans'], rep: 4, say: 'Cheaper to run. Greener.' }],
    ['🗺️ Smarter routes', { cash: -0.2, supply: [-0.02, 20, 'Smart routes'], say: 'Less driving.' }],
    ['😬 Absorb it', { supply: [0.05, 8, 'Fuel costs'], say: 'Thin profits.' }]
  ], { kind: 'news' });

  // 📢 MARKETING AGENCY
  B('marketing', 'client_scandal', '📉', 'Your biggest client is in a scandal', 'Their boss did something awful. Your ads are everywhere with their name.', [
    ['🚫 Drop them', { demand: [0.85, 6, 'Lost client'], rep: 5, say: 'You kept your name clean.' }],
    ['🛡️ Help them fix their image', { extra: [0.15, 6, 'Crisis work'], rep: -3, say: 'Good money. Some people judged you.' }],
    ['🤐 Pause the ads', { say: 'Waiting it out.' }],
    ['💸 Charge double to stay', { extra: [0.2, 6, 'Crisis work'], rep: -6, say: 'Rich, but people talk.' }]
  ]);
  B('marketing', 'viral_campaign', '🔥', 'Your campaign went viral', 'An ad you made is everywhere. Brands are calling.', [
    ['📞 Take every call', { extra: [0.2, 6, 'New clients'], team: -8, say: 'Busy. Maybe too busy.' }],
    ['📈 Raise your prices', { extra: [0.15, 8, 'Premium clients'], say: 'Only big clients now.' }],
    ['🏆 Enter it for awards', { cash: -0.2, rep: 6, fans: 20, say: 'It won gold.' }],
    ['🧑‍🤝‍🧑 Credit the team publicly', { team: 12, rep: 3, say: 'The team is proud.' }]
  ]);
  B('marketing', 'client_pays_late', '💸', 'A big client hasn\'t paid in 3 months', 'They owe you a fortune and keep saying "next week".', [
    ['⏸️ Stop all work', { chance: { p: 0.6, win: { cash: 1, say: 'They paid within days.' }, lose: { say: 'They went bankrupt.' } } }],
    ['⚖️ Lawyer\'s letter', { cash: -0.1, chance: { p: 0.7, win: { cash: 1, say: 'Paid.' }, lose: { say: 'They ignored it.' } } }],
    ['🤝 Payment plan', { cash: 0.5, say: 'Slowly, it comes.' }],
    ['🤐 Keep working', { cash: -0.3, say: 'They still haven\'t paid.' }]
  ]);
  B('marketing', 'idea_stolen_pitch', '💡', 'A client stole your pitch', 'You pitched an idea. They said no. Now they\'re using it without you.', [
    ['⚖️ Sue them', { cash: -0.5, chance: { p: 0.5, win: { cash: 1.5, rep: 4, say: 'You won.' }, lose: { say: 'Hard to prove.' } } }],
    ['📢 Tell the industry', { rep: 4, fans: 10, say: 'Other agencies won\'t work with them.' }],
    ['💸 Send them a bill', { chance: { p: 0.4, win: { cash: 0.8, say: 'They paid quietly.' }, lose: { say: 'They laughed.' } } }],
    ['🔒 NDAs before every pitch', { rep: 1, say: 'Never again.' }]
  ]);
  B('marketing', 'creative_block', '🧠', 'The team is out of ideas', 'Three pitches failed in a row. Everyone is stuck.', [
    ['🏖️ A creative retreat', { cash: -0.4, team: 12, say: 'They came back full of ideas.' }],
    ['🧑‍🎨 Hire a star creative', { hireSpecial: { role: 'front', skill: 85, traits: ['creative'] }, say: 'Fresh blood.' }],
    ['🎲 A crazy idea day', { team: 6, chance: { p: 0.5, win: { extra: [0.1, 4, 'Big idea'], say: 'One idea won a client.' }, lose: { say: 'Fun, but nothing.' } } }],
    ['😤 More pressure', { team: -10, say: 'Worse.' }]
  ]);
  B('marketing', 'ai_tools', '🤖', 'AI tools can do half your work', 'Clients ask why they should pay you when AI is cheaper.', [
    ['🤖 Use AI, keep the humans', { cash: -0.3, equip: 0.04, say: 'Faster and still creative.' }],
    ['⭐ Sell human creativity', { rep: 4, say: 'Premium clients love it.' }],
    ['📉 Lower your prices', { price: -1, say: 'You kept clients.' }],
    ['🤷 Ignore it', { demand: [0.9, 8, 'AI competition'], say: 'Some clients left.' }]
  ]);
  B('marketing', 'award_night', '🏆', 'The big advertising awards', 'Your team is nominated three times.', [
    ['🎉 Bring the whole team', { cash: -0.3, team: 12, chance: { p: 0.6, win: { rep: 8, fans: 20, say: 'You won two.' }, lose: { say: 'No wins. Great night.' } } }],
    ['🎤 Prepare a speech', { chance: { p: 0.5, win: { rep: 8, fans: 25, say: 'You won. Your speech went viral.' }, lose: { say: 'No speech needed.' } } }],
    ['📢 Promote the nominations', { fans: 15, extra: [0.05, 4, 'Buzz'], say: 'New clients called.' }],
    ['🙅 Stay home', { say: 'You won one. Nobody was there to accept.' }]
  ]);

  // 💾 APP COMPANY
  B('software', 'server_down', '🔥', 'Your servers crashed', 'The app has been down for three hours. Users are furious.', [
    ['🧑‍💻 All hands fix it', { team: -6, rep: -2, say: 'Back up. Everyone stayed late.' }],
    ['📢 Honest updates every hour', { rep: 3, say: 'Users appreciated the honesty.' }],
    ['☁️ Move to better servers', { cash: -1, equip: 0.03, say: 'It won\'t happen again.' }],
    ['🤐 Say nothing', { rep: -8, say: 'People were angrier.' }]
  ]);
  B('software', 'data_breach', '🔓', 'Hackers stole user passwords', 'A million accounts. It\'s on the news.', [
    ['📢 Tell users now', { rep: -3, say: 'Painful, but honest.' }],
    ['🧑‍💻 Hire security experts', { cash: -1, rep: 3, say: 'Stronger than ever.' }],
    ['🎁 Free premium for a year', { supply: [0.05, 12, 'Free premium'], rep: 4, say: 'Users forgave you.' }],
    ['🤐 Hide it', { chance: { p: 0.3, win: { say: 'Nobody found out.' }, lose: { cash: -2, rep: -15, say: 'Found out. Huge fine.' } } }]
  ]);
  B('software', 'big_client', '🏢', 'A giant company wants your app', 'For all 50,000 of their workers. They want custom features.', [
    ['✍️ Sign and build', { extra: [0.15, 12, 'Enterprise client'], team: -8, say: 'Big money, big work.' }],
    ['🤝 Sign, no custom work', { chance: { p: 0.5, win: { extra: [0.12, 12, 'Enterprise client'], say: 'They accepted.' }, lose: { say: 'They went elsewhere.' } } }],
    ['🧑‍💻 Hire more developers', { hireSpecial: { role: 'front', skill: 70 }, extra: [0.15, 12, 'Enterprise client'], say: 'Ready to deliver.' }],
    ['🙅 Too distracting', { say: 'You passed.' }]
  ], { minWeek: 10 });
  B('software', 'acquisition', '💼', 'A tech giant wants to buy your app', 'A huge offer. They\'d probably shut it down.', [
    ['💰 Sell a piece', { cash: 3, say: 'Rich. Still in charge.' }],
    ['🙅 Say no', { team: 8, rep: 3, say: 'The team cheered.' }],
    ['📈 Ask for double', { chance: { p: 0.3, win: { cash: 5, say: 'They paid for a small share.' }, lose: { say: 'They built a copy instead.' } } }],
    ['🤝 Partner instead', { demand: [1.1, 12, 'Big partner'], say: 'Their users are yours too.' }]
  ], { minWeek: 20 });
  B('software', 'app_store_ban', '🚫', 'The app store removed your app', 'They say you broke a rule. You don\'t know which one.', [
    ['📝 Appeal', { chance: { p: 0.6, win: { say: 'Back in a week.' }, lose: { demand: [0.8, 3, 'App removed'], say: 'Still gone.' } } }],
    ['🔧 Change anything risky', { cash: -0.3, demand: [0.9, 2, 'App removed'], say: 'Back. Slightly worse.' }],
    ['📢 Go public', { fans: 30, chance: { p: 0.5, win: { say: 'The pressure worked.' }, lose: { demand: [0.8, 3, 'App removed'], say: 'They didn\'t care.' } } }],
    ['🌐 Launch on the web', { cash: -0.4, demand: [0.9, 3, 'Web only'], say: 'Some users followed.' }]
  ]);
  B('software', 'feature_request', '🗳️', 'Users are begging for dark mode', 'Thousands of requests. Your team wants to build other things.', [
    ['🌙 Build it now', { fans: 20, rep: 3, say: 'Users are thrilled.' }],
    ['🗳️ Let users vote on features', { fans: 15, say: 'Users feel heard.' }],
    ['⏳ Next quarter', { rep: -2, say: 'Users are impatient.' }],
    ['💰 Make it a paid feature', { extra: [0.06, 8, 'Premium feature'], rep: -3, say: 'Some paid. Many complained.' }]
  ]);
  B('software', 'dev_burnout', '🥵', 'Your developers are burning out', 'Late nights for months. Two are talking about quitting.', [
    ['🏖️ A week off for everyone', { closed: [1, 'Team break'], team: 18, say: 'They came back refreshed.' }],
    ['🕐 Four-day week', { capacity: [0.92, 16, 'Four-day week'], team: 15, say: 'Happier, sharper.' }],
    ['💵 Bonuses', { teamBonus: true, team: 8, say: 'It helped. For now.' }],
    ['💪 "Just a bit longer"', { team: -12, next: ['resign', 2, 5, 0.5], say: 'Someone is updating their CV.' }]
  ], { who: { a: 'any' } });

  // 🧸 TOY COMPANY
  B('toys', 'safety_recall', '⚠️', 'A toy has a small part that breaks off', 'A parent says their toddler almost choked.', [
    ['📢 Recall it now', { cash: -0.8, rep: 6, say: 'Parents trust you more.' }],
    ['🔧 Fix new ones, keep the old', { cash: -0.3, rep: -4, say: 'Parents are not happy.' }],
    ['🔍 Test it first', { chance: { p: 0.5, win: { say: 'A one-off. Safe.' }, lose: { cash: -1, rep: -5, say: 'It was a real problem. Late recall.' } } }],
    ['🤐 Deny it', { rep: -15, say: 'A scandal.' }]
  ]);
  B('toys', 'holiday_hit', '🎁', 'Your toy is this year\'s must-have', 'Every kid wants it. Stores are sold out.', [
    ['🏭 Make as many as possible', { cash: -0.8, extra: [0.35, 3, 'Holiday hit'], team: -8, say: 'Record sales.' }],
    ['🔢 Limited supply, more hype', { extra: [0.2, 3, 'Holiday hit'], fans: 30, say: 'Everyone is talking about it.' }],
    ['📈 Raise the price', { extra: [0.3, 3, 'Holiday hit'], rep: -4, say: 'Parents were angry.' }],
    ['🎁 Donate some to hospitals', { rep: 8, extra: [0.25, 3, 'Holiday hit'], say: 'The news covered it.' }]
  ], { cond: function (g) { return week(g) >= 44 && week(g) <= 50; }, w: 20 });
  B('toys', 'movie_license', '🎬', 'A movie studio offers a toy license', 'Toys for their new big film. They want a big cut.', [
    ['✍️ Sign', { cash: -1, chance: { p: 0.6, win: { extra: [0.15, 10, 'Movie toys'], say: 'The movie was a hit. So were the toys.' }, lose: { say: 'The movie flopped.' } } }],
    ['🤝 Smaller deal', { cash: -0.4, extra: [0.07, 10, 'Movie toys'], say: 'Safe money.' }],
    ['🎨 Make your own characters', { cash: -0.3, rep: 4, fans: 15, say: 'Your own world.' }],
    ['🙅 No', { say: 'You passed.' }]
  ]);
  B('toys', 'factory_conditions', '🏭', 'Your factory treats workers badly', 'A report shows long hours and low pay at the factory that makes your toys.', [
    ['🔄 Change factories', { cash: -0.6, supply: [0.03, 16, 'Fair factory'], rep: 8, say: 'Fair and proud.' }],
    ['🤝 Demand better conditions', { chance: { p: 0.6, win: { rep: 5, say: 'They improved.' }, lose: { rep: -5, say: 'They didn\'t change.' } } }],
    ['🔍 Visit yourself', { cash: -0.2, rep: 3, say: 'You saw it. You fixed it.' }],
    ['🤐 Ignore it', { rep: -10, say: 'Parents boycotted you.' }]
  ]);
  B('toys', 'toy_fair', '🎪', 'The world toy fair', 'Buyers from everywhere. A booth costs a fortune.', [
    ['🎪 Big booth', { cash: -1, chance: { p: 0.6, win: { extra: [0.12, 8, 'Toy fair'], fans: 30, say: 'Stores ordered big.' }, lose: { fans: 15, say: 'Nice buzz. Few orders.' } } }],
    ['🧸 Small booth, one star toy', { cash: -0.4, extra: [0.07, 8, 'Toy fair'], say: 'Good contacts.' }],
    ['🚶 Just visit', { say: 'You learned a lot.' }],
    ['🙅 Skip it', { say: 'You passed.' }]
  ]);
  B('toys', 'kid_inventor', '💡', 'A kid sent you a toy idea', 'A drawing from an 8-year-old. It\'s actually brilliant.', [
    ['🚀 Make it, credit the kid', { cash: -0.4, fans: 40, rep: 6, demand: [1.1, 8, 'Kid\'s idea'], say: 'The kid is famous.' }],
    ['💵 Buy the idea from the family', { cash: -0.3, demand: [1.1, 8, 'Kid\'s idea'], say: 'A fair deal.' }],
    ['📩 A thank-you letter', { rep: 2, say: 'The kid framed it.' }],
    ['🙅 Ignore it', { say: 'The idea went to {rival}.' }]
  ], { init: rival });
  B('toys', 'screen_time', '📱', 'Kids only want screens now', 'Toy sales are falling. Tablets are winning.', [
    ['🧩 Toys with apps', { cash: -0.5, demand: [1.08, 12, 'App toys'], say: 'The best of both.' }],
    ['📢 "Play outside" campaign', { cash: -0.3, rep: 5, fans: 20, say: 'Parents love it.' }],
    ['🎮 A video game of your toys', { cash: -0.8, chance: { p: 0.5, win: { extra: [0.1, 10, 'Toy game'], say: 'Kids play and buy.' }, lose: { say: 'Nobody downloaded it.' } } }],
    ['🤷 Stay classic', { demand: [0.92, 8, 'Screen time'], say: 'Slow sales.' }]
  ]);

  // 🍌 BANANA FARM
  B('banana', 'fungus', '🍂', 'A plant disease is spreading', 'Banana plants are dying on the east side of the farm.', [
    ['🔥 Burn the sick plants', { capacity: [0.85, 6, 'Lost plants'], say: 'It stopped spreading.' }],
    ['🧪 Expensive treatment', { cash: -0.8, chance: { p: 0.6, win: { say: 'Saved.' }, lose: { capacity: [0.8, 6, 'Lost plants'], say: 'Too late.' } } }],
    ['🌱 Plant a resistant type', { cash: -1, capacity: [0.9, 4, 'Replanting'], equip: 0.03, say: 'Stronger plants for the future.' }],
    ['🙈 Hope it stops', { capacity: [0.7, 8, 'Disease'], say: 'It spread everywhere.' }]
  ]);
  B('banana', 'hurricane', '🌀', 'A hurricane is coming', 'It will hit the farm in two days.', [
    ['🌾 Harvest everything early', { extra: [0.2, 1, 'Early harvest'], team: -8, say: 'Most of the crop saved.' }],
    ['🧱 Protect the plants', { cash: -0.5, capacity: [0.9, 4, 'Storm damage'], say: 'Damage kept small.' }],
    ['🏠 Keep workers safe first', { team: 10, capacity: [0.75, 6, 'Storm damage'], say: 'Everyone safe. Big damage.' }],
    ['🤞 Hope it misses', { chance: { p: 0.4, win: { say: 'It missed.' }, lose: { capacity: [0.6, 8, 'Storm damage'], say: 'Direct hit.' } } }]
  ]);
  B('banana', 'fair_trade', '🤝', 'A fair trade label wants you', 'Better pay for workers, higher prices, happier buyers.', [
    ['✅ Join', { teamRaise: 0.08, rep: 8, demand: [1.1, 16, 'Fair trade'], say: 'Proud workers, premium bananas.' }],
    ['🤏 Only part of the farm', { rep: 3, demand: [1.04, 16, 'Fair trade'], say: 'A start.' }],
    ['🔍 Check the costs first', { say: 'You\'re thinking about it.' }],
    ['🙅 Too expensive', { say: 'You passed.' }]
  ]);
  B('banana', 'supermarket_deal', '🛒', 'A giant supermarket wants all your bananas', 'A big contract. But they set the price.', [
    ['✍️ Sign', { extra: [0.12, 12, 'Supermarket deal'], say: 'Everything sold. Every week.' }],
    ['🤝 Negotiate', { chance: { p: 0.5, win: { extra: [0.16, 12, 'Supermarket deal'], say: 'A better price.' }, lose: { say: 'They went to another farm.' } } }],
    ['📦 Half to them, half to markets', { extra: [0.07, 12, 'Supermarket deal'], say: 'Safer.' }],
    ['🙅 Too cheap', { say: 'You passed.' }]
  ]);
  B('banana', 'spider_crates', '🕷️', 'A spider was found in a shipment', 'A big one, in a crate at a supermarket. It\'s on the news.', [
    ['🔍 Better inspections', { cash: -0.3, rep: 3, say: 'Every crate checked.' }],
    ['🙏 Apologize', { rep: 1, say: 'The news moved on.' }],
    ['🧪 Safe pest treatment', { cash: -0.4, rep: 4, say: 'No more stowaways.' }],
    ['🤷 "It happens"', { rep: -5, say: 'Buyers were worried.' }]
  ]);
  B('banana', 'drought', '☀️', 'No rain for months', 'The plants are thirsty. The river is low.', [
    ['💧 Drip irrigation', { cash: -1, equip: 0.03, say: 'Every drop counts now.' }],
    ['🚚 Buy water', { cash: -0.4, say: 'Plants saved. Expensive.' }],
    ['🌱 Let some fields rest', { capacity: [0.85, 6, 'Drought'], say: 'Smaller harvest.' }],
    ['🤞 Wait for rain', { chance: { p: 0.4, win: { say: 'Rain came.' }, lose: { capacity: [0.7, 8, 'Drought'], say: 'The plants suffered.' } } }]
  ]);
  B('banana', 'banana_bread', '🍞', 'Too many ripe bananas', 'A whole shipment ripened too fast. Stores won\'t take them.', [
    ['🍞 Make banana bread', { cash: -0.1, extra: [0.08, 3, 'Banana bread'], fans: 10, say: 'People love it.' }],
    ['🥤 Sell to a smoothie company', { cash: 0.3, say: 'Nothing wasted.' }],
    ['❤️ Donate to schools', { rep: 6, say: 'Kids got bananas.' }],
    ['🗑️ Throw them away', { cash: -0.3, say: 'Painful.' }]
  ]);

  // 🍫 CHOCOLATE FACTORY
  B('chocolate', 'cocoa_crisis', '🌍', 'Cocoa prices tripled', 'A bad harvest in Africa. Chocolate makers are panicking.', [
    ['📈 Raise prices', { price: 1, happy: -3, say: 'Customers understood.' }],
    ['🤏 Smaller bars, same price', { rep: -4, say: 'People noticed.' }],
    ['🤝 Buy straight from farms', { cash: -0.8, supply: [-0.02, 16, 'Direct cocoa'], rep: 4, say: 'Better for farmers. Better for you.' }],
    ['😬 Absorb it', { supply: [0.06, 8, 'Cocoa prices'], say: 'Painful.' }]
  ], { kind: 'news' });
  B('chocolate', 'factory_tour', '🏭', 'Families want factory tours', 'Kids dream of seeing a real chocolate factory.', [
    ['🎟️ Paid tours', { cash: -0.4, extra: [0.08, 12, 'Tours'], fans: 20, say: 'Booked every weekend.' }],
    ['🍫 Free tours, gift shop at end', { cash: -0.3, extra: [0.1, 12, 'Gift shop'], say: 'Everyone leaves with a bag.' }],
    ['🏫 Free tours for schools', { rep: 6, fans: 25, say: 'Kids love you.' }],
    ['🙅 Too risky', { say: 'Factory stays private.' }]
  ]);
  B('chocolate', 'machine_jam', '⚙️', 'The main machine jammed', 'Chocolate is overflowing. The line has stopped.', [
    ['🔧 Emergency repair', { cash: -0.5, say: 'Running again.' }],
    ['🆕 A new machine', { cash: -1.5, equip: 0.05, say: 'Faster than ever.' }],
    ['🧑‍🔧 Let {a} fix it', { chance: { p: 0.5, win: { a: 12, say: '{a} fixed it.' }, lose: { cash: -0.6, closed: [1, 'Machine broken'], say: 'Worse.' } } }],
    ['🍫 Make bars by hand', { capacity: [0.7, 2, 'Hand-made'], fans: 10, say: 'Slow, but people love hand-made.' }]
  ], FRONT);
  B('chocolate', 'valentines', '💝', 'Valentine\'s Day is coming', 'The biggest chocolate week of the year.', [
    ['💝 Heart-shaped boxes', { cash: -0.3, extra: [0.4, 1, 'Valentine\'s'], say: 'Sold out.' }],
    ['✍️ Custom messages', { extra: [0.35, 1, 'Custom boxes'], fans: 15, say: 'People love it.' }],
    ['🌹 Partner with florists', { extra: [0.3, 1, 'Flower bundles'], say: 'Great combo.' }],
    ['😌 Normal stock', { extra: [0.12, 1, 'Valentine\'s'], say: 'Sold out early.' }]
  ], { cond: function (g) { return week(g) >= 4 && week(g) <= 7; }, w: 20 });
  B('chocolate', 'melted_shipment', '🌡️', 'A shipment melted in a hot truck', 'The AC failed. A huge order arrived as chocolate soup.', [
    ['💸 Replace the order', { cash: -0.6, rep: 3, say: 'The client was impressed.' }],
    ['⚖️ Make the delivery company pay', { chance: { p: 0.6, win: { cash: 0.1, say: 'They paid.' }, lose: { cash: -0.6, say: 'They refused.' } } }],
    ['🍫 Make it into hot chocolate', { extra: [0.05, 2, 'Hot chocolate'], say: 'Nothing wasted.' }],
    ['🚚 Buy your own cold trucks', { cash: -1.2, equip: 0.02, say: 'Never again.' }]
  ]);
  B('chocolate', 'secret_recipe', '📜', 'Someone tried to steal your recipe', 'A new worker was caught copying files.', [
    ['👮 Police', { rep: 3, say: 'Arrested. Recipe safe.' }],
    ['🔐 Lock down everything', { cash: -0.3, say: 'Secure.' }],
    ['🕵️ Find who sent them', { chance: { p: 0.5, win: { rival: -0.1, say: 'It was {rival}. They\'re in trouble.' }, lose: { say: 'No proof.' } } }],
    ['🎭 Let them steal a fake one', { rival: -0.08, say: '{rival} launched a terrible chocolate.' }]
  ], { init: rival });
  B('chocolate', 'vegan_trend', '🌱', 'Vegan chocolate is booming', 'Oat milk, no dairy. Young buyers want it.', [
    ['🌱 Launch a vegan line', { cash: -0.4, demand: [1.1, 12, 'Vegan line'], say: 'A hit.' }],
    ['🧪 One vegan bar', { cash: -0.1, demand: [1.04, 12, 'Vegan bar'], say: 'Good start.' }],
    ['🏷️ Go fully vegan', { cash: -1, rep: 5, fans: 30, demand: [1.05, 16, 'All vegan'], say: 'A bold move.' }],
    ['🙅 Classic only', { say: 'You stayed classic.' }]
  ]);

  // ⚽ FOOTBALL ACADEMY
  B('football', 'star_kid', '⭐', 'A 14-year-old is a future star', 'Big clubs are already watching. His family wants the best for him.', [
    ['📝 Sign him long-term', { cash: -0.3, rep: 5, fans: 20, say: 'Your academy has a future star.' }],
    ['🤝 Sell him to a big club', { cash: 2, rep: 2, say: 'A big fee.' }],
    ['🎓 Scholarship for his school', { cash: -0.2, rep: 8, say: 'His family will never forget.' }],
    ['🙅 Treat him like everyone else', { chance: { p: 0.5, win: { team: 4, say: 'He stayed and loves it.' }, lose: { say: 'A big club took him for free.' } } }]
  ]);
  B('football', 'coach_yelling', '📢', 'A parent says {a} yells at kids', 'A video shows {a} screaming at a 10-year-old after a mistake.', [
    ['🗣️ Talk to {a}', { a: -5, rep: 2, say: '{a} promised to change.' }],
    ['🎓 Coaching course', { cash: -0.2, skill: { a: 5 }, rep: 3, say: 'Calmer coach.' }],
    ['🚪 Fire {a}', { fire: 'a', rep: 4, say: 'Parents approve.' }],
    ['🛡️ Defend {a}', { rep: -8, say: 'Parents pulled kids out.' }]
  ], FRONT);
  B('football', 'tournament', '🏆', 'An international youth tournament', 'Teams from all over the world. It costs a lot to go.', [
    ['✈️ Take the team', { cash: -0.8, chance: { p: 0.4, win: { rep: 10, fans: 40, say: 'Your kids won.' }, lose: { rep: 3, fans: 10, say: 'Quarterfinals. Proud.' } } }],
    ['💰 Ask parents to pay half', { cash: -0.4, happy: -3, chance: { p: 0.4, win: { rep: 8, fans: 30, say: 'You won.' }, lose: { say: 'Out in the groups.' } } }],
    ['🤝 Find a sponsor', { chance: { p: 0.6, win: { rep: 6, fans: 20, say: 'Sponsor paid. Great trip.' }, lose: { say: 'No sponsor. No trip.' } } }],
    ['🙅 Too expensive', { say: 'Maybe next year.' }]
  ]);
  B('football', 'pitch_flooded', '🌧️', 'The pitch is flooded', 'Heavy rain. Training has to stop.', [
    ['🌱 New drainage', { cash: -1, equip: 0.03, say: 'Never flooded again.' }],
    ['🏟️ Rent an indoor hall', { cash: -0.3, say: 'Training continues.' }],
    ['🏠 Online fitness sessions', { capacity: [0.85, 2, 'Online training'], say: 'Better than nothing.' }],
    ['⏳ Wait it out', { closed: [1, 'Flooded pitch'], say: 'A lost week.' }]
  ]);
  B('football', 'scout_visit', '🔭', 'A top club scout is visiting', 'He\'ll watch one training session. Every kid is nervous.', [
    ['⚽ Normal training', { chance: { p: 0.5, win: { rep: 6, cash: 1, say: 'He signed two kids.' }, lose: { say: 'He left without a word.' } } }],
    ['🏆 A special match', { chance: { p: 0.6, win: { rep: 8, cash: 1.2, fans: 20, say: 'Three kids signed.' }, lose: { say: 'Nerves. Nobody played well.' } } }],
    ['🍽️ Dinner with the scout', { cash: -0.1, rep: 4, say: 'A new relationship.' }],
    ['😌 Tell the kids to have fun', { team: 5, chance: { p: 0.5, win: { rep: 6, say: 'Relaxed kids, great play.' }, lose: { say: 'No signings.' } } }]
  ]);
  B('football', 'parent_pressure', '😤', 'A parent demands his son start every game', 'He pays full fees and threatens to leave. His son isn\'t ready.', [
    ['🙅 Coach decides', { rep: 4, say: 'The other parents respect you.' }],
    ['🤝 More playing time', { team: -4, say: 'The team feels it\'s unfair.' }],
    ['💬 Show him the stats', { chance: { p: 0.5, win: { say: 'He understood.' }, lose: { say: 'He took his son away.' } } }],
    ['🎓 Extra training for the boy', { cash: -0.1, rep: 3, say: 'The boy improved fast.' }]
  ]);
  B('football', 'former_student', '🌟', 'A former student is now a pro', 'He scored in a big league. He says your academy made him.', [
    ['📢 Tell everyone', { fans: 40, demand: [1.12, 8, 'Pro alumni'], say: 'New signups poured in.' }],
    ['🎤 Invite him to visit', { fans: 50, rep: 6, team: 8, say: 'The kids were starstruck.' }],
    ['🖼️ His shirt on the wall', { fans: 20, rep: 3, say: 'Every kid looks at it.' }],
    ['💰 Ask him to invest', { chance: { p: 0.5, win: { cash: 2, say: 'He invested.' }, lose: { say: 'He said maybe later.' } } }]
  ], { rarity: 'rare' });

  // 🍔 BURGER CHAIN
  B('burger', 'e_coli', '🦠', 'E. coli linked to your burgers', 'Ten people are sick. The news says it came from your meat.', [
    ['🔒 Close all locations and check', { closed: [1, 'Safety check'], cash: -1, rep: 5, say: 'Found the bad supplier. Trust kept.' }],
    ['💸 Pay every victim', { cash: -1.5, rep: 3, say: 'Families were grateful.' }],
    ['🔄 Change suppliers now', { cash: -0.5, rep: 2, say: 'Safer meat.' }],
    ['🤐 Deny it', { chance: { p: 0.3, win: { say: 'It wasn\'t you after all.' }, lose: { rep: -18, demand: [0.75, 6, 'E. coli scandal'], say: 'It was you. Disaster.' } } }]
  ]);
  B('burger', 'plant_based', '🌱', 'A plant-based burger?', 'A company offers meat-free patties. Young people love them.', [
    ['🌱 Add it', { cash: -0.3, demand: [1.08, 12, 'Plant burger'], say: 'A hit.' }],
    ['🧪 Test in one location', { cash: -0.1, demand: [1.03, 8, 'Plant burger test'], say: 'Promising.' }],
    ['📢 Big launch', { cash: -0.6, fans: 30, demand: [1.1, 12, 'Plant burger'], say: 'Huge buzz.' }],
    ['🙅 Meat only', { say: 'Some young customers left.' }]
  ]);
  B('burger', 'drive_thru', '🚗', 'The drive-thru is too slow', 'Cars wait twenty minutes. Some drive away.', [
    ['🚗 Add a second lane', { cash: -1, capacity: [1.12, 20, 'Second lane'], say: 'Double speed.' }],
    ['📱 Order ahead app', { cash: -0.5, capacity: [1.08, 20, 'App orders'], say: 'Faster.' }],
    ['🧑‍🍳 More staff at peak', { hireSpecial: { role: 'front', skill: 50 }, say: 'Faster at rush hour.' }],
    ['📉 Smaller menu', { capacity: [1.06, 12, 'Small menu'], happy: -2, say: 'Faster, fewer choices.' }]
  ]);
  B('burger', 'secret_menu', '🤫', 'Customers found a "secret menu"', '{a} made a special burger for friends. Now everyone wants it.', [
    ['🍔 Add it to the menu', { demand: [1.08, 8, 'Secret burger'], a: 12, say: 'A new best seller.' }],
    ['🤫 Keep it secret, let people ask', { fans: 25, demand: [1.06, 8, 'Secret menu'], say: 'The mystery made it cool.' }],
    ['🏷️ Name it after {a}', { a: 18, loyal: { a: 15 }, fans: 10, say: '{a} is famous.' }],
    ['🙅 Stop it', { a: -8, say: 'Customers were disappointed.' }]
  ], FRONT);
  B('burger', 'franchise_bad', '🏪', 'One franchise is ruining your name', 'Dirty, slow, rude. Reviews say "worst burger ever".', [
    ['🚫 Take their license away', { demand: [0.97, 4, 'Closed location'], rep: 5, say: 'Your name is clean.' }],
    ['🎓 Send a training team', { cash: -0.4, rep: 3, say: 'They improved.' }],
    ['⚠️ Final warning', { chance: { p: 0.5, win: { rep: 2, say: 'They cleaned up.' }, lose: { rep: -5, say: 'They didn\'t.' } } }],
    ['🤷 Ignore it', { rep: -8, say: 'The bad reviews spread.' }]
  ], { minWeek: 10 });
  B('burger', 'kids_meal', '🧸', 'A famous toy company wants a kids\' meal deal', 'Their toys in your kids\' meals.', [
    ['✍️ Sign', { cash: -0.3, demand: [1.12, 8, 'Kids\' meal'], say: 'Kids beg their parents to come.' }],
    ['🥗 Healthy kids\' meal too', { cash: -0.4, demand: [1.1, 8, 'Kids\' meal'], rep: 4, say: 'Parents approve.' }],
    ['📈 Ask them to pay you', { chance: { p: 0.4, win: { cash: 1, demand: [1.1, 8, 'Kids\' meal'], say: 'They paid.' }, lose: { say: 'They went to {rival}.' } } }],
    ['🙅 No toys', { say: 'You passed.' }]
  ], { init: rival });
  B('burger', 'eating_champion', '🏆', 'A pro eater challenges your burger', 'He wants to eat ten in ten minutes, live online.', [
    ['🎥 Host it', { fans: 40, say: 'Millions watched.' }],
    ['🏆 A contest for everyone', { cash: -0.2, fans: 30, extra: [0.1, 1, 'Contest'], say: 'A huge crowd.' }],
    ['💰 Bet he can\'t', { chance: { p: 0.5, win: { cash: 0.5, fans: 20, say: 'He failed. You won.' }, lose: { cash: -0.5, fans: 25, say: 'He did it.' } } }],
    ['🙅 No', { say: 'He went to {rival}.' }]
  ], { init: rival });

  // 👔 FASHION BRAND
  B('fashion', 'copied', '👗', 'A fast-fashion giant copied your design', 'Your best dress, at a tenth of the price.', [
    ['⚖️ Sue', { cash: -0.6, chance: { p: 0.5, win: { cash: 2, rep: 5, say: 'You won.' }, lose: { say: 'Designs are hard to protect.' } } }],
    ['📢 Call them out', { fans: 40, rep: 4, say: 'The internet took your side.' }],
    ['✨ A new collection, fast', { cash: -0.5, fans: 20, say: 'Always one step ahead.' }],
    ['🤷 Copies mean you\'re good', { demand: [0.93, 4, 'Copied'], say: 'Sales dipped.' }]
  ]);
  B('fashion', 'runway', '💃', 'Fashion week wants your show', 'The biggest stage in fashion. A show costs a fortune.', [
    ['💃 Go all in', { cash: -2, chance: { p: 0.6, win: { fans: 80, rep: 10, demand: [1.15, 12, 'Fashion week'], say: 'The best show of the week.' }, lose: { fans: 20, rep: -3, say: 'Critics were harsh.' } } }],
    ['🤝 Share a show with others', { cash: -0.8, fans: 30, rep: 4, say: 'Good exposure.' }],
    ['📱 Online show only', { cash: -0.2, fans: 25, say: 'Smart and cheap.' }],
    ['🙅 Not yet', { say: 'Next year.' }]
  ], { minWeek: 15 });
  B('fashion', 'model_scandal', '📸', 'Your model posted something awful', 'The face of your campaign. Now everyone is angry at your brand.', [
    ['🚫 Drop the model', { cash: -0.4, rep: 4, say: 'Fast and clear.' }],
    ['🙏 Public statement', { rep: 1, say: 'Some accepted it.' }],
    ['🤐 Wait', { rep: -6, say: 'People said you didn\'t care.' }],
    ['🛡️ Defend them', { chance: { p: 0.2, win: { fans: 10, say: 'It blew over.' }, lose: { rep: -12, say: 'Boycott.' } } }]
  ]);
  B('fashion', 'celebrity_wear', '🌟', 'A pop star wore your outfit', 'At an awards show. Millions saw it.', [
    ['📦 Make more, fast', { cash: -0.6, extra: [0.25, 4, 'Star outfit'], say: 'Sold out anyway.' }],
    ['📢 Share it everywhere', { fans: 50, say: 'Your followers exploded.' }],
    ['🤝 Offer a collab', { chance: { p: 0.4, win: { fans: 80, extra: [0.2, 6, 'Star collab'], say: 'A collection with a star.' }, lose: { fans: 20, say: 'Politely declined.' } } }],
    ['🔢 Limited edition', { extra: [0.15, 3, 'Limited edition'], fans: 30, say: 'Resellers went crazy.' }]
  ], { rarity: 'rare' });
  B('fashion', 'sustainability', '♻️', 'Critics say fashion is wasteful', 'A documentary names your brand. Young buyers are upset.', [
    ['♻️ A recycled line', { cash: -0.6, rep: 8, fans: 20, say: 'Young buyers love it.' }],
    ['🔄 Take-back program', { cash: -0.3, rep: 6, say: 'Old clothes become new.' }],
    ['📢 Show your real efforts', { chance: { p: 0.5, win: { rep: 4, say: 'People appreciated it.' }, lose: { rep: -3, say: 'Called greenwashing.' } } }],
    ['🤷 Ignore it', { rep: -6, say: 'Young buyers left.' }]
  ]);
  B('fashion', 'influencer_army', '🤳', 'Pay 100 small influencers?', 'An agency says it\'s better than one big star.', [
    ['💰 Do it', { cash: -0.8, fans: 60, demand: [1.1, 6, 'Influencer army'], say: 'Your clothes are everywhere.' }],
    ['🎁 Pay in clothes only', { cash: -0.3, fans: 30, say: 'Half said yes.' }],
    ['🧪 Test with ten', { cash: -0.1, fans: 12, say: 'It works. Maybe more later.' }],
    ['🙅 No', { say: 'You passed.' }]
  ]);
  B('fashion', 'designer_leaves', '✂️', '{a} wants to start their own brand', '{a} wants to leave and take two assistants.', [
    ['💰 Big raise and a title', { raise: ['a', 0.25], promote: 'a', say: '{a} stayed.' }],
    ['🤝 Invest in their brand', { cash: -1, extra: [0.06, 16, 'Designer brand'], say: 'You own part of it.' }],
    ['👋 Let them go', { quit: 'a', say: 'A new rival is born.' }],
    ['⚖️ Enforce the contract', { a: -20, rep: -3, say: '{a} has to stay. Unhappy.' }]
  ], FRONT);

  // 👟 SNEAKER BRAND
  B('sneakers', 'drop_bots', '🤖', 'Bots bought your whole drop', 'Your limited sneakers sold out in 3 seconds. Resellers have them all.', [
    ['🎟️ Raffle system next time', { cash: -0.2, rep: 6, say: 'Fair for real fans.' }],
    ['🔄 Cancel bot orders', { cash: -0.3, rep: 5, say: 'Real fans got them.' }],
    ['🏭 Make more', { cash: -0.6, extra: [0.2, 3, 'Restock'], rep: 3, say: 'Resellers lost money.' }],
    ['🤷 Money is money', { rep: -8, say: 'Fans are furious.' }]
  ]);
  B('sneakers', 'athlete_deal', '🏀', 'A rising basketball star wants a deal', 'Nobody knows him yet. He could be huge. Or not.', [
    ['✍️ Sign him', { cash: -1, chance: { p: 0.5, win: { fans: 80, demand: [1.15, 12, 'Star athlete'], say: 'He became MVP. Your shoe is everywhere.' }, lose: { fans: 10, say: 'He got injured.' } } }],
    ['🤝 A small deal', { cash: -0.3, chance: { p: 0.5, win: { fans: 40, say: 'He blew up.' }, lose: { say: 'Not much happened.' } } }],
    ['🔍 Wait a season', { say: '{rival} signed him instead.' }],
    ['🙅 No', { say: 'You passed.' }]
  ], { init: rival });
  B('sneakers', 'fake_sneakers', '👟', 'Fakes of your shoes are everywhere', 'Online stores sell copies for a quarter of the price.', [
    ['⚖️ Legal team', { cash: -0.6, rep: 3, say: 'Hundreds of sites shut down.' }],
    ['📱 Authenticity app', { cash: -0.4, fans: 20, rep: 4, say: 'Scan the tag to check. Fans love it.' }],
    ['📉 A cheaper line', { cash: -0.3, demand: [1.06, 12, 'Budget line'], say: 'Fewer buy fakes.' }],
    ['🤷 Ignore it', { rep: -5, say: 'Quality complaints about fakes hurt you.' }]
  ]);
  B('sneakers', 'collab', '🎨', 'A famous artist wants a collab', 'Their art on your sneakers. Limited edition.', [
    ['🎨 Yes', { cash: -0.5, extra: [0.25, 3, 'Artist collab'], fans: 50, say: 'Sold out instantly.' }],
    ['📈 Bigger run', { cash: -0.8, extra: [0.35, 3, 'Artist collab'], fans: 30, say: 'More sales, less hype.' }],
    ['🎁 Charity edition', { cash: -0.3, rep: 10, fans: 40, say: 'Money for art schools.' }],
    ['🙅 No', { say: 'They worked with {rival}.' }]
  ], { init: rival });
  B('sneakers', 'sole_defect', '🔧', 'Soles are falling off', 'A batch has a glue problem. Customers are posting photos.', [
    ['📢 Recall and replace', { cash: -0.8, rep: 6, say: 'Fans respected it.' }],
    ['🔧 Free repair', { cash: -0.4, rep: 3, say: 'Fixed.' }],
    ['🏭 Fix the factory', { cash: -0.3, rep: 2, say: 'Better glue now.' }],
    ['🤐 Say nothing', { rep: -10, say: 'The photos spread.' }]
  ]);
  B('sneakers', 'sneaker_con', '🎪', 'The big sneaker convention', 'All the fans, all the brands, one weekend.', [
    ['🎪 Huge booth with a drop', { cash: -0.8, extra: [0.3, 1, 'Sneaker con'], fans: 50, say: 'The line went around the hall.' }],
    ['👟 Small booth', { cash: -0.2, fans: 20, say: 'Good buzz.' }],
    ['🎁 Surprise giveaway', { cash: -0.3, fans: 40, say: 'Everyone talked about it.' }],
    ['🙅 Skip it', { say: 'You passed.' }]
  ]);
  B('sneakers', 'worker_design', '✏️', '{a} designed a new sneaker', 'At home, on their own time. It\'s really good.', [
    ['🚀 Produce it, credit {a}', { cash: -0.4, demand: [1.1, 8, 'New design'], a: 18, say: 'A hit. {a} is proud.' }],
    ['💵 Buy the design', { cash: -0.2, demand: [1.1, 8, 'New design'], a: 8, say: 'Fair deal.' }],
    ['🗳️ Let fans vote', { fans: 30, a: 10, say: 'Fans loved it.' }],
    ['🙅 Not our style', { a: -10, say: '{a} feels ignored.' }]
  ], FRONT);

  // 🎂 CAKE FACTORY
  B('bakerychain', 'wrong_name', '🎂', 'A birthday cake had the wrong name', 'It said "Happy Birthday Steve". The kid\'s name is Stella. She cried.', [
    ['🎂 A new cake, free, now', { cash: -0.05, rep: 5, say: 'Stella got a bigger cake.' }],
    ['🎁 Free cake and a gift', { cash: -0.1, rep: 8, fans: 15, say: 'The mom posted a thank you.' }],
    ['📋 Double-check system', { capacity: [0.97, 8, 'Checks'], rep: 2, say: 'Never again.' }],
    ['🤷 Refund only', { rep: -4, say: 'The mom posted about it.' }]
  ]);
  B('bakerychain', 'supermarket_order', '🛒', 'A supermarket chain wants your cakes', 'In 200 stores. Mass production needed.', [
    ['🏭 Build a bigger line', { cash: -1.5, capacity: [1.2, 20, 'Big line'], extra: [0.12, 12, 'Supermarket'], say: 'Your cakes are everywhere.' }],
    ['🤝 Half the stores', { extra: [0.07, 12, 'Supermarket'], say: 'Manageable.' }],
    ['📈 Premium price', { chance: { p: 0.4, win: { extra: [0.14, 12, 'Supermarket'], say: 'They agreed.' }, lose: { say: 'They went elsewhere.' } } }],
    ['🙅 Stay special', { rep: 2, say: 'Your cakes stay rare.' }]
  ], { minWeek: 10 });
  B('bakerychain', 'mold', '🦠', 'Mold found in a batch', 'A customer found it. The batch went to 30 stores.', [
    ['📢 Recall the batch', { cash: -0.6, rep: 5, say: 'Handled.' }],
    ['🔍 Find the cause', { cash: -0.3, equip: 0.01, say: 'A broken cooler. Fixed.' }],
    ['🙏 Apologize to the customer', { rep: 1, say: 'Just one.' }],
    ['🤐 Hope it\'s only one', { chance: { p: 0.4, win: { say: 'It was.' }, lose: { rep: -12, say: 'Dozens more.' } } }]
  ]);
  B('bakerychain', 'tv_bake_off', '📺', 'A TV baking show wants you as a judge', 'Millions watch. You\'d miss weeks at the factory.', [
    ['📺 Yes', { fans: 80, rep: 6, capacity: [0.95, 6, 'Boss on TV'], say: 'You\'re a TV star now.' }],
    ['🧑‍🍳 Send {a} instead', { fans: 40, a: 15, say: '{a} is a natural.' }],
    ['🎂 Sponsor the show', { cash: -1, fans: 50, say: 'Your cakes on screen every week.' }],
    ['🙅 Too busy', { say: 'You passed.' }]
  ], FRONT);
  B('bakerychain', 'sugar_price', '🍬', 'Sugar prices doubled', 'Every cake costs more to make.', [
    ['📈 Raise prices', { price: 1, happy: -3, say: 'Customers accepted it.' }],
    ['🍯 Less sugar recipes', { cash: -0.2, rep: 3, say: 'Healthier. Some liked it.' }],
    ['😬 Absorb it', { supply: [0.05, 8, 'Sugar prices'], say: 'Thin profits.' }],
    ['📦 Buy a year of sugar now', { cash: -1, supply: [-0.02, 20, 'Stocked sugar'], say: 'Smart bet.' }]
  ], { kind: 'news' });
  B('bakerychain', 'giant_cake', '🏆', 'Try for a world record cake', 'The biggest cake ever. Everyone would watch.', [
    ['🎂 Go for it', { cash: -0.8, chance: { p: 0.6, win: { fans: 80, rep: 8, say: 'World record.' }, lose: { fans: 30, say: 'It collapsed. Live.' } } }],
    ['🤝 With a charity', { cash: -0.5, rep: 10, fans: 50, say: 'Record and cake for the homeless.' }],
    ['📺 Sell TV rights', { cash: 0.3, fans: 40, say: 'Paid to be famous.' }],
    ['🙅 No', { say: 'You passed.' }]
  ], { rarity: 'rare' });
  B('bakerychain', 'night_shift', '🌙', 'The night shift wants more pay', 'They bake from midnight to 6 AM. They say it\'s unfair.', [
    ['💵 Night bonus', { teamRaise: 0.05, team: 12, say: 'Fair.' }],
    ['🔄 Rotate shifts', { team: 6, say: 'Everyone shares it.' }],
    ['🤖 More machines at night', { cash: -1, equip: 0.03, say: 'Fewer night workers.' }],
    ['🙅 No', { team: -12, say: 'They\'re angry.' }]
  ], { who: { a: 'any' } });

  // 🎮 ESPORTS TEAM
  B('esports', 'cheating', '🕹️', '{a} was caught cheating', 'In a pro tournament. The whole team is disqualified.', [
    ['🚪 Drop {a}', { fire: 'a', rep: 4, say: 'Clean team.' }],
    ['🙏 Public apology', { rep: -2, a: -10, say: 'Fans are split.' }],
    ['🛡️ Defend {a}', { chance: { p: 0.2, win: { say: 'The evidence was wrong.' }, lose: { rep: -12, say: 'The evidence was clear.' } } }],
    ['⏸️ Suspend {a} for a season', { rep: 2, a: -15, say: 'A second chance.' }]
  ], FRONT);
  B('esports', 'sponsor_energy', '⚡', 'An energy drink wants to sponsor you', 'Big money. But your fans are young.', [
    ['✍️ Sign', { cash: 1.5, rep: -3, say: 'Money in. Parents grumbled.' }],
    ['🥤 Only their water brand', { cash: 0.8, rep: 2, say: 'Clever.' }],
    ['🔍 Find a tech sponsor', { chance: { p: 0.6, win: { cash: 1.2, say: 'A headset brand signed.' }, lose: { say: 'No luck yet.' } } }],
    ['🙅 No', { rep: 3, say: 'Fans respect it.' }]
  ]);
  B('esports', 'world_finals', '🏆', 'You made the world finals', 'One match for the world title. Millions watching.', [
    ['🧠 Study the enemy all week', { team: -4, chance: { p: 0.55, win: { fans: 150, cash: 3, say: 'WORLD CHAMPIONS.' }, lose: { fans: 40, say: 'Second in the world.' } } }],
    ['😌 Rest and stay calm', { team: 8, chance: { p: 0.5, win: { fans: 150, cash: 3, say: 'WORLD CHAMPIONS.' }, lose: { fans: 40, say: 'So close.' } } }],
    ['🧑‍🏫 Hire a legend coach', { cash: -0.5, chance: { p: 0.65, win: { fans: 150, cash: 3, say: 'WORLD CHAMPIONS.' }, lose: { fans: 40, say: 'Second.' } } }],
    ['📺 Focus on the show', { fans: 60, say: 'You lost, but fans loved the show.' }]
  ], { rarity: 'rare', minWeek: 20 });
  B('esports', 'toxic_player', '😡', '{a} is toxic online', 'Rude to fans, rude to other teams. Sponsors noticed.', [
    ['🎓 Media training', { cash: -0.2, rep: 3, say: 'Better.' }],
    ['⚠️ Final warning', { a: -8, say: '{a} calmed down.' }],
    ['🚪 Drop {a}', { fire: 'a', rep: 5, say: 'Sponsors happy.' }],
    ['🤷 He wins games', { rep: -6, say: 'A sponsor left.' }]
  ], FRONT);
  B('esports', 'game_patch', '🔧', 'A game update ruined your strategy', 'Everything you practiced is useless now.', [
    ['🧠 Learn the new meta fast', { team: -6, say: 'Adapted in a week.' }],
    ['🧑‍🏫 Hire an analyst', { cash: -0.3, say: 'Ahead of everyone.' }],
    ['🎲 Try something crazy', { chance: { p: 0.4, win: { fans: 40, say: 'Nobody saw it coming.' }, lose: { fans: 5, say: 'It didn\'t work.' } } }],
    ['😤 Complain online', { rep: -2, say: 'Fans called it whining.' }]
  ]);
  B('esports', 'streaming_deal', '🎥', 'A platform wants exclusive streams', 'Your players can only stream there. Good money.', [
    ['✍️ Sign', { extra: [0.12, 12, 'Streaming deal'], fans: -10, say: 'Money in. Some fans didn\'t follow.' }],
    ['🤝 Non-exclusive', { chance: { p: 0.5, win: { extra: [0.08, 12, 'Streaming deal'], say: 'Deal.' }, lose: { say: 'They walked.' } } }],
    ['🎥 Build your own channel', { fans: 30, say: 'Your fans, your rules.' }],
    ['🙅 No', { say: 'You passed.' }]
  ]);
  B('esports', 'gaming_house', '🏠', 'A team house?', 'All players live and train together. Expensive but powerful.', [
    ['🏠 Buy one', { cash: -2, team: 12, capacity: [1.1, 20, 'Team house'], say: 'The team is closer than ever.' }],
    ['🏢 Rent one', { rent: 0.1, team: 8, say: 'Good team vibes.' }],
    ['🧑‍💻 Just a training room', { cash: -0.5, team: 4, say: 'A good middle ground.' }],
    ['🙅 Everyone trains at home', { say: 'Same as before.' }]
  ]);

  // 🎵 MUSIC LABEL
  B('music', 'leaked_album', '🔓', 'An album leaked a month early', 'Your biggest artist. Fans are listening to it free.', [
    ['🚀 Release it now', { extra: [0.2, 3, 'Surprise release'], fans: 20, say: 'Fans bought it anyway.' }],
    ['⚖️ Chase the leaks', { cash: -0.3, chance: { p: 0.4, win: { say: 'Mostly removed.' }, lose: { demand: [0.85, 4, 'Leak'], say: 'Everywhere.' } } }],
    ['🎁 Bonus songs for buyers', { cash: -0.1, extra: [0.15, 3, 'Bonus tracks'], say: 'Fans paid for extras.' }],
    ['🕵️ Find the leaker', { chance: { p: 0.5, win: { rep: 2, say: 'A studio intern. Fired.' }, lose: { team: -6, say: 'Everyone felt accused.' } } }]
  ]);
  B('music', 'viral_song', '🎵', 'An unknown song you own went viral', 'An old song is suddenly the soundtrack to a dance trend.', [
    ['📢 Push it everywhere', { extra: [0.2, 4, 'Viral song'], fans: 40, say: 'Top of the charts.' }],
    ['🎤 Get the singer back', { cash: -0.3, fans: 50, say: 'A comeback nobody expected.' }],
    ['🔁 Remix it', { cash: -0.2, extra: [0.25, 4, 'Remix'], say: 'Even bigger.' }],
    ['😌 Enjoy it', { extra: [0.1, 4, 'Viral song'], say: 'Nice money.' }]
  ]);
  B('music', 'artist_leaving', '🎤', 'Your top artist wants to leave', 'A bigger label offered them triple.', [
    ['💰 Match the offer', { supply: [0.06, 16, 'Artist deal'], say: 'They stayed. Expensive.' }],
    ['❤️ Remind them who found them', { chance: { p: 0.5, win: { rep: 3, say: 'They stayed.' }, lose: { demand: [0.85, 8, 'Lost artist'], say: 'They left.' } } }],
    ['🎨 More creative freedom', { chance: { p: 0.6, win: { fans: 20, say: 'They stayed for the freedom.' }, lose: { demand: [0.85, 8, 'Lost artist'], say: 'Freedom wasn\'t enough.' } } }],
    ['👋 Wish them well', { demand: [0.85, 8, 'Lost artist'], rep: 2, say: 'Classy. Painful.' }]
  ]);
  B('music', 'new_talent', '🌟', 'A teenager sends you a demo', 'Recorded in a bedroom. It\'s incredible.', [
    ['✍️ Sign them now', { cash: -0.3, chance: { p: 0.5, win: { fans: 60, extra: [0.12, 10, 'New star'], say: 'A new star.' }, lose: { say: 'Slow start.' } } }],
    ['🎧 Studio time first', { cash: -0.1, fans: 15, say: 'Promising.' }],
    ['📢 Post the demo', { fans: 30, say: 'The internet loves them.' }],
    ['🙅 Too young', { say: '{rival} signed them.' }]
  ], { init: rival });
  B('music', 'tour_disaster', '🎪', 'Your artist\'s tour is losing money', 'Half-empty arenas. Big costs.', [
    ['✂️ Cancel some shows', { cash: -0.4, rep: -3, say: 'Stopped the bleeding.' }],
    ['🏟️ Move to smaller venues', { cash: -0.2, rep: 2, say: 'Sold out small shows.' }],
    ['📢 Big ad push', { cash: -0.6, chance: { p: 0.5, win: { extra: [0.2, 3, 'Tour'], say: 'Tickets sold.' }, lose: { say: 'Still empty.' } } }],
    ['🤞 Keep going', { cash: -0.8, say: 'Expensive lesson.' }]
  ]);
  B('music', 'streaming_pay', '💸', 'Streaming pays almost nothing', 'Your artists complain they earn less than a coffee per thousand plays.', [
    ['💿 Vinyl and merch', { cash: -0.3, extra: [0.1, 12, 'Vinyl'], say: 'Fans pay for real things.' }],
    ['🎤 More live shows', { extra: [0.12, 10, 'Live shows'], team: -4, say: 'Live money is real money.' }],
    ['🤝 Better artist share', { supply: [0.03, 16, 'Artist share'], rep: 6, say: 'Artists love you.' }],
    ['🤷 That\'s the business', { rep: -3, say: 'Artists are unhappy.' }]
  ]);
  B('music', 'sample_lawsuit', '⚖️', 'You\'re sued over a sample', 'A hit song used three seconds of an old track without permission.', [
    ['🤝 Settle', { cash: -0.8, say: 'Done.' }],
    ['⚖️ Fight', { cash: -0.4, chance: { p: 0.5, win: { say: 'Fair use. Won.' }, lose: { cash: -1.5, say: 'Lost big.' } } }],
    ['🎵 Give them credit and share', { supply: [0.03, 16, 'Shared royalties'], rep: 3, say: 'Fair solution.' }],
    ['🗑️ Pull the song', { demand: [0.85, 4, 'Song pulled'], say: 'Fans were upset.' }]
  ]);

  // 🦁 ZOO
  B('zoo', 'baby_panda', '🐼', 'A baby panda was born', 'The first one ever in {city}. The whole city is excited.', [
    ['📹 Live panda cam', { fans: 80, demand: [1.12, 12, 'Baby panda'], say: 'Millions watch it sleep.' }],
    ['🗳️ Let the city name it', { fans: 60, rep: 5, say: 'Everyone voted.' }],
    ['🎟️ Special panda tours', { extra: [0.15, 8, 'Panda tours'], say: 'Sold out every day.' }],
    ['🤫 Keep it quiet for its safety', { rep: 6, say: 'The vets thanked you.' }]
  ], { rarity: 'rare' });
  B('zoo', 'escape', '🦁', 'A lion got out of its enclosure', 'It\'s in a staff area. Visitors are inside the zoo.', [
    ['🚨 Lock down the zoo', { closed: [1, 'Lockdown'], rep: 4, say: 'Nobody hurt. Lion back safe.' }],
    ['🧑‍⚕️ Call the vet team', { chance: { p: 0.7, win: { rep: 3, say: 'Calmly caught.' }, lose: { rep: -5, closed: [1, 'Lockdown'], say: 'It took hours. Panic.' } } }],
    ['🔧 Fix every fence after', { cash: -1, rep: 5, say: 'Safer than ever.' }],
    ['🤫 Keep visitors calm, say nothing', { chance: { p: 0.5, win: { say: 'Nobody noticed.' }, lose: { rep: -15, say: 'A visitor filmed it. Scandal.' } } }]
  ]);
  B('zoo', 'animal_rights', '📢', 'Activists say your animals are unhappy', 'Protest at the gate. Videos of a sad elephant.', [
    ['🌳 Bigger enclosures', { cash: -1.5, rep: 10, say: 'Happier animals, happier visitors.' }],
    ['🔬 Invite experts to check', { chance: { p: 0.6, win: { rep: 5, say: 'Experts said the animals are fine.' }, lose: { rep: -4, say: 'They found problems.' } } }],
    ['🐘 Move her to a sanctuary', { rep: 8, fans: 20, say: 'A beautiful move.' }],
    ['🙅 Ignore them', { rep: -8, say: 'The protest grew.' }]
  ]);
  B('zoo', 'sick_animal', '🏥', 'Your oldest giraffe is very sick', 'The vet says there\'s a risky operation, or peaceful goodbye.', [
    ['🩺 Try the operation', { cash: -0.5, chance: { p: 0.5, win: { fans: 30, rep: 5, say: 'She survived. The city cheered.' }, lose: { rep: 2, say: 'She didn\'t make it.' } } }],
    ['🕊️ Let her go peacefully', { rep: 4, fans: 10, say: 'Visitors left flowers.' }],
    ['🔬 Call a world expert', { cash: -1, chance: { p: 0.7, win: { fans: 40, rep: 6, say: 'Saved.' }, lose: { rep: 3, say: 'Even the expert couldn\'t save her.' } } }],
    ['🤫 Keep it private', { say: 'Quietly handled.' }]
  ]);
  B('zoo', 'breeding_program', '🌍', 'A world breeding program wants you', 'Help save a rare tiger. Very expensive, very important.', [
    ['🐯 Join', { cash: -1.5, rep: 12, fans: 40, say: 'Your zoo saves species now.' }],
    ['🤝 Join with a sponsor', { chance: { p: 0.6, win: { cash: -0.5, rep: 12, fans: 40, say: 'A sponsor paid most.' }, lose: { cash: -1.5, rep: 12, say: 'No sponsor. You paid.' } } }],
    ['💰 Donate instead', { cash: -0.5, rep: 5, say: 'You helped from afar.' }],
    ['🙅 Too expensive', { say: 'You passed.' }]
  ]);
  B('zoo', 'visitor_fell', '😱', 'A kid climbed into the gorilla area', 'The gorilla is standing over him. Everyone is screaming.', [
    ['🧑‍⚕️ Keepers calm the gorilla', { chance: { p: 0.7, win: { rep: 6, say: 'The keepers got him out safely.' }, lose: { rep: -5, say: 'The kid was hurt. Everyone is shaken.' } } }],
    ['🍎 Distract with food', { chance: { p: 0.6, win: { rep: 5, say: 'It worked. Kid safe.' }, lose: { rep: -5, say: 'Too slow.' } } }],
    ['🚨 Clear the area', { rep: 2, say: 'Calm, and the kid was saved.' }],
    ['🔧 Higher fences everywhere', { cash: -1, rep: 5, say: 'Never again.' }]
  ]);
  B('zoo', 'night_zoo', '🌙', 'Open the zoo at night?', 'Night tours to see animals when they\'re most awake.', [
    ['🌙 Monthly night tours', { cash: -0.4, extra: [0.1, 12, 'Night tours'], fans: 20, say: 'A big hit.' }],
    ['🎉 A special night event', { cash: -0.2, extra: [0.15, 2, 'Night event'], say: 'Sold out.' }],
    ['🧪 Ask the vets first', { rep: 2, say: 'Only quiet animals. Smart.' }],
    ['🙅 Animals need rest', { rep: 3, say: 'Keepers appreciated it.' }]
  ]);
})();
