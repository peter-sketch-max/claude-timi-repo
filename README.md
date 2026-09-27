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

**227 events, and every one has 4 answers**
- Funny ones: a pigeon moves in, a giant rubber duck, googly eyes on everything, a customer paying with a chicken, a treasure map.
- Company-specific ones: sugar rush, golden tickets, a chocolate river, monkeys stealing bananas, a wonderkid, an oil gusher, escaped zoo animals.
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
- 24 rival events: they copy your logo, start mascot dance battles, post fake reviews, try to buy you out, or go broke.
- Every 13 weeks the **Business Cup** crowns the top company, with 🥇🥈🥉 prizes.

**Fun mechanics**
- ⚡ **Boss Powers:** Flash Sale, Team Party, Crazy Stunt, Overtime. They're free and recharge over time.
- 🤑 **Golden customer:** a customer who sometimes walks by. Tap them for cash.
- 🐶 **Pets** for your shop.
- 💤 **Offline earnings** when you come back.
- 🎯 Missions, 🎖️ CEO levels, 🏪 9 company ranks, 🛠️ upgrades, 🔥 profit streaks and 🏆 41 achievements.
- 📅 **Daily Challenge** with a shareable result, 📖 **Event Book**, 🎁 **7-day daily gift**, and a 📤 share card.

**Feels alive**
- Loading screen and animations on everything: cards fly in, numbers count up, confetti, coin bursts, screen shake, and a page-flip between weeks.
- 🏙️ **Living scene:** customers queue at your shop, workers sit in the windows, your rival's shop is next door, the sky follows the real time of day, and the weather follows the season.
- 🎵 **Original background song and sound effects.** They're generated live in code, so there are no audio files and no copyright issues.

**VIP subscription** (Google Play Billing, product id `vip_monthly`)
- VIP companies, double daily gifts, faster powers, a 4th mission slot, 2x offline earnings and VIP logos.
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
| `npm run check` | Checks all events (4 answers each, valid effects and chains), then plays every company for 2 years to catch crashes and unfilled text. |
| `npm run android:sync` | Builds and copies the game into `android/`. |
| `npm run android:icons` | Regenerates the app icons and splash from `assets/`. |

The Android APK/AAB is built by GitHub Actions (`.github/workflows/android.yml`).
