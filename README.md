# Company Simulator

A BitLife-style business simulator. Start a tiny company, hire people with real personalities, survive whatever the week throws at you, and press **NEXT WEEK** until you run an empire.

## Play it

- **Laptop:** download `dist/company-simulator.html` and double-click it. It works offline. Your game saves in the browser.
- **Phone:** host the `src/` folder (for example with GitHub Pages), open it in your phone's browser, and choose **Add to Home Screen**. It then opens full screen like an app and works offline.
- **Run locally:** `npx serve src` and open the address it prints.

## What's in Phase 1

- **Company creation:** name, logo, brand color, 28 industries across small, medium and large tiers, 8 cities with different demand, prices, wages and rent, and 4 ways to fund the company.
- **The NEXT WEEK loop:** revenue, supplies, wages, rent, loan payments, customer demand compared with staff capacity, reputation, customer happiness, brand awareness and the economy.
- **Unpredictable weeks:** anything from 0 events to 5 or more. You make up to 3 decisions a week. Extra events are handled by your staff and show up in the weekly report.
- **About 65 events** across employees, company, social media, management, funny moments and rare major crises. Each has choices with consequences.
- **Event chains:** a fight becomes a feud, the employee quits, joins a rival, and weeks later the rival launches their idea. Promises, cover-ups, bribes and breakups come back later too.
- **Employees as characters:** skill, morale, loyalty, reliability, salary compared with market rate, 12 personality traits (the second trait stays hidden for 4 weeks), friendships, feuds and dating.
- **Management actions:** hire, fire, raise, bonus, promote, demote, make manager. You need one manager for every 8 employees.
- **Money:** pricing strategy, advertising, bank loans, selling shares to investors, company valuation and history.
- **News feed, 22 achievements, bankruptcy,** and an experience bonus that carries over to your next company.

## Roadmap

- **Phase 2:** products, full marketing and commercials, social media posts, opening new locations, departments for big companies, and active competitors.
- **Phase 3:** automation, R&D, IPO and stock market, countries, partnerships and acquisitions.

## Development

Plain HTML, CSS and JavaScript with no dependencies.

```
src/js/util.js    helpers
src/js/data.js    industries, cities, traits, achievements
src/js/game.js    simulation engine and saves
src/js/events.js  every event and its choices
src/js/ui.js      screens and input
```

- `node tools/build.js` bundles `src/` into `dist/`.
- `node tools/simulate.js [weeks] [runs]` plays every industry headlessly with random choices. It reports crashes and balance. Set `NOEVENTS=1` to test the base economy alone.
