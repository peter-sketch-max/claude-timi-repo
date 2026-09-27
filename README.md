# Company Simulator 🏢

A colorful business life simulator for phones. Start a tiny company, hire people with real personalities, survive crazy weeks, and press **NEXT WEEK** until you run a giant empire.

## Play it

- **Laptop:** download `dist/company-simulator.html` and double-click it. It works offline and saves in your browser.
- **Phone:** host the `src/` folder (for example with GitHub Pages), open it on your phone, and choose **Add to Home Screen**. It then opens full screen like an app and works offline.
- **Run locally:** `npx serve src` and open the address it prints.

## What's in the game

**Your company**
- 28 businesses in 3 difficulty levels, 8 cities, 4 ways to fund your start, a logo and brand color, and a 🎲 random-name button.

**Every week is different**
- Anywhere from 0 to 5+ things happen each week. You decide up to 3 of them, and your team handles the rest.

**About 170 events in 13 formats**
- 💬 **Text messages** from your workers, your supplier or your landlord, with reply bubbles.
- ⭐ **Customer reviews** that you can answer.
- 📰 **Breaking news.**
- 🎁 **Mystery boxes:** pick 1 of 3.
- 🎡 **Lucky wheel.**
- 👆 **Tap-fast mini-games:** rush hour, catch the thief, plug the leaks, squash bugs, pop balloons.
- 🧠 **Money quizzes** with simple, real business math.
- 🤝 **Deals:** accept an offer or push for more (risky!).
- 🥊 **Rival battles:** a rock-paper-scissors style showdown.
- 🧑‍💼 **Job interviews:** ask one question to reveal a hidden trait.
- 📱 **Social media posts** that can go viral.
- **Classic choice cards.**
- ✨ **Legendary** events: aliens, time travelers, a cat CEO, a meteor landing, and more.

**Event chains**
- A fight becomes a feud. The worker quits and joins a rival, and weeks later the rival launches their idea. Promises, bribes, breakups and cover-ups come back later too.

**Easy to understand**
- Short, simple text. After each choice, colored chips show exactly what changed: 💰 ⭐ 😊 📱 💪 👥.
- Ollie the owl 🦉 gives tips when you need them, and tapping any stat explains it.

**Workers with personality**
- Emoji faces, 12 traits (one stays hidden at first), moods, friendships, feuds and dating.
- Hire, fire, give raises, promote, and rename workers after your friends.

**Progress**
- 🎯 Missions with rewards.
- 🎖️ CEO levels that unlock bigger ads and upgrades.
- 🏪 Company ranks from Tiny Startup to Galactic Corp.
- 🛠️ 8 upgrades.
- 🔥 Profit streaks.
- 🏆 37 achievements.

**Money**
- Prices, ads, bank loans, selling shares, and a company value.
- A changing economy: booms, recessions and inflation.
- Seasons: summer heatwaves, snowstorms, Halloween and the holiday rush.

**Made to be shared**
- 📅 **Daily Challenge:** everyone gets the same company each day. Play 52 weeks and share a Wordle-style result (🟩🟨🟥).
- 📤 **Share card:** an image of your company, plus text for friends.
- 📖 **Event Book:** collect all ~170 events. Your collection is kept across companies.
- 🎁 **Daily gift:** a 7-day login streak with bigger gifts each day.
- 🔊 Sounds, 📳 vibration and 🎉 confetti.

## Roadmap

- **Phase 2:** designing your own products, full marketing and commercials, opening new locations, departments for big companies, and active competitors.
- **Phase 3:** automation, R&D, IPO and the stock market, countries, partnerships and acquisitions.
- **Play Store:** wrap the web app with Capacitor or a Trusted Web Activity (Bubblewrap), and bundle the fonts.

## Development

Plain HTML, CSS and JavaScript with no dependencies.

```
src/js/util.js    helpers and seeded random numbers
src/js/data.js    industries, cities, traits, upgrades, missions, achievements
src/js/game.js    simulation engine, effects, mini-game logic, saves
src/js/events.js  every event (see the comment at the top for the format)
src/js/ui.js      screens, event cards, mini-games, sound and effects
```

- `node tools/build.js` bundles `src/` into `dist/`.
- `node tools/simulate.js [weeks] [runs]` plays every industry headlessly, covering every event type. It checks for crashes, text that wasn't filled in, and balance. Set `NOEVENTS=1` to test the base economy alone.
