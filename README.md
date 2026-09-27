# Company Simulator 🏢

A colorful business life game for phones. Start a lemonade stand, a banana farm or an oil company, hire workers with real personalities, survive crazy weeks, beat your rivals, and press **NEXT WEEK** until you run a giant empire.

## Play it

- **Android app:** see [PLAYSTORE.md](PLAYSTORE.md). GitHub builds an installable APK on every push (**Actions** tab → latest run → **Artifacts**).
- **Laptop:** download `dist/company-simulator.html` and double-click it. It works offline and saves in your browser.
- **Phone browser:** host the `src/` folder (for example with GitHub Pages), open it, and choose **Add to Home Screen**.
- **Run locally:** `npx serve src`.

## What's in the game

**56 companies** in 3 sizes, including 7 VIP ones
- **Small:** lemonade stand, candy shop, ice cream truck, pizza place, donut shop, bubble tea, pet shop, barber, flower shop, café, bakery and more.
- **Medium:** banana farm, chocolate factory, football academy, burger chain, fashion brand, sneaker brand, cake factory, toy company and more.
- **Large:** oil company, soda company, football club, shipping, gold mine, airline, bank, movie studio and more.
- **VIP:** YouTube channel, esports team, music label, zoo, theme park, space company, social media app.

**712 events, and every one has 4 answers**
- **Every business has its own events** (7 or more each), so a football academy, a banana farm and an oil company feel completely different: angry sideline parents, hurricanes on the farm, storms on the oil rig, a cat stuck on your crane.
- Angry customers: someone yells at you, someone SLAPS you, "I want to speak to the manager!"
- Gentle sad moments: an old worker or the shop pet passes away, and you choose how to remember them (shown in the Team tab).
- Funny ones: a pigeon moves in, a bear walks in, 1,000 rubber chickens, a robbery with a banana.
- Legendary ones: aliens, time travelers, a cat CEO.
- Chains, where a choice comes back weeks later with a twist.

**12 event styles**
- 💬 Text chats
- ⭐ Reviews
- 📰 Breaking news
- 🎁 Mystery boxes (pick 1 of 4)
- 🎡 Lucky wheel
- 👆 Tap-fast mini-games with 3 difficulty levels
- 🧠 Money quizzes
- 🤝 Deals
- 🥊 VS battles
- 🧑‍💼 Job interviews
- 📱 Social posts
- Choice cards

**Rivals everywhere**
- 3 rival companies with their own power.
- 30+ rival events: they copy your logo, start mascot dance battles, post fake reviews, steal your manager, or slap you on live TV.
- Every 13 weeks the **Business Cup** crowns the top company, with 🥇🥈🥉 prizes.

**⚔️ Company Wars (no server needed)**
- Attack your rivals using war energy (+1 every week). Each war is 3 rounds of 💸 Price Attack, 🕵️ Spy Mission, 🛡️ Iron Defense and 📣 Ad Blitz, where each move beats one other move.
- **Friend Wars:** pick a secret 3-round defense plan and send your war code in any chat app. Your friend pastes it into their game and attacks you. There's no server, so it's free forever. Codes have a checksum so they can't be edited, and each friend can be fought once a day.
- Trophies and war ranks, from 🪖 Recruit to 👑 Emperor.

**📺 Free Ads tab**
- 15 ads with made-up celebrities, from a radio shout-out to a football superstar, a movie star and a worldwide icon.
- Trying is free, but they can say no. More fans and reputation mean a better chance, and an ad that fits your business adds +15%.
- 3 tries per week (4 with VIP). Paid ads are here too.

**Fun mechanics**
- ⚙️ **Settings tab:** music, sound effects, vibration, save & quit, and **share the game for +10% cash** once a day.
- ⚡ **Boss Powers:** Flash Sale, Team Party, Crazy Stunt, Overtime. They're free and recharge over time.
- 🤑 **Golden customer:** a customer who sometimes walks by. Tap them for cash.
- 🐶 **Pets** for your shop.
- 💤 **Offline earnings** when you come back.
- 🎯 Missions, 🎖️ CEO levels, 🏪 9 company ranks, 🛠️ upgrades, 🔥 profit streaks and 🏆 48 achievements.
- 📅 **Daily Challenge** with a shareable result, 📖 **Event Book**, 🎁 **7-day daily gift**, and a 📤 share card.

**Feels alive**
- Loading screen and animations on everything: cards fly in, numbers count up, confetti, coin bursts, screen shake, and a page-flip between weeks.
- 🏙️ **Living town:** hand-drawn cartoon people walk by, go into your shop and come out with a bag. Cars drive past, trees sway, there's a city skyline, and workers wave from the windows. The building grows with your rank and has props that match your business: an oil pump, banana trees, a football goal, a rocket or a gold mine cart. The sky follows the real time of day and the weather follows the season.
- 🎵 **Original background song and sound effects.** They're generated live in code, so there are no audio files and no copyright issues.

**VIP subscription** (Google Play Billing, product id `vip_monthly`)
- VIP companies, double daily gifts, faster powers, a 4th mission slot, 2x offline earnings, an extra ad try, more war energy and VIP logos.
- On the web there is no payment, so VIP can be switched on for free as a demo.

## Development

The game is plain HTML, CSS and JavaScript. The Android app wraps it with [Capacitor](https://capacitorjs.com).

```
src/js/util.js         helpers and seeded random numbers
src/js/data.js         companies, cities, traits, upgrades, missions, achievements, powers, VIP perks
src/js/game.js         simulation engine, effects, mini-games, rivals, powers, saves
src/js/events.js       events, part 1 (the format is explained at the top)
src/js/events-more.js  events, part 2
src/js/events-fun.js   events, part 3: rivals, funny and company-specific events
src/js/events-life.js  events, part 4: sad goodbyes, angry customers, slaps, crazy days, team and boss life
src/js/events-biz*.js  events for one kind of business (small, medium and large businesses)
src/js/store.js        VIP subscription (Google Play Billing via cordova-plugin-purchase)
src/js/music.js        background song
src/js/scene.js        the living town scene
src/js/ui.js           screens, event cards, mini-games, sounds and animations
android/               the Android project (Capacitor)
store/                 Play Store icon, feature graphic, screenshots and listing text
```

Commands:

| Command | What it does |
|---|---|
| `npm install` | Installs Capacitor and the fonts. |
| `npm run build` | Builds `dist/` (web) and `www/` (the Android app's files, with the fonts bundled). |
| `npm run check` | Checks all events (4 answers each, valid effects and chains, every piece of text fills in), then plays every company for 2 years, using ads and wars too, to catch crashes. |
| `npm run android:sync` | Builds and copies the game into `android/`. |
| `npm run android:icons` | Regenerates the app icons and splash from `assets/`. |

The Android APK/AAB is built by GitHub Actions (`.github/workflows/android.yml`).
