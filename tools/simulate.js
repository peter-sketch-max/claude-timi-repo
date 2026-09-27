// Headless balance check: plays every industry for N weeks with random choices.
// Usage: node tools/simulate.js [weeks] [runsPerIndustry]
// Env: NOEVENTS=1 tests the base economy only.
const fs = require('fs'), vm = require('vm'), path = require('path');
['util', 'data', 'game', 'events'].forEach(f => vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../src/js', f + '.js'), 'utf8'), { filename: f + '.js' }));
const CS = globalThis.CS, G = CS.G;
if (process.env.NOEVENTS) CS.EVENTS.length = 0;
const weeks = +process.argv[2] || 156, runs = +process.argv[3] || 6;
const seenKinds = {};
let errors = 0;

// Plays the current event the way a random player would, whatever its kind.
function playEvent(g) {
  const x = G.currentEvent(g), def = CS.EV[x.id];
  seenKinds[def.kind] = (seenKinds[def.kind] || 0) + 1;
  ['title', 'text'].forEach(k => { const t = G.fill(def[k], g, x.ctx); if (/\{\w+\}/.test(t)) throw new Error('Unfilled text in ' + x.id + ': ' + t); });
  const r = Math.random;
  switch (def.kind) {
    case 'boxes': return G.openBox(g, Math.floor(r() * 3));
    case 'wheel': return G.spin(g);
    case 'tap': return G.tapDone(g, Math.floor(r() * def.goal * 1.5));
    case 'quiz': return G.quizAnswer(g, Math.floor(r() * x.ctx.q.options.length));
    case 'deal': while (r() < 0.5 && G.dealPush(g)); return G.currentEvent(g).ctx.walked ? G.dealEnd(g) : G.dealAccept(g);
    case 'vs': return G.vsPlay(g, G.VS_MOVES[Math.floor(r() * 3)].id);
    case 'post': return G.postEvent(g, G.postOptions(g)[0].id);
    case 'interview': G.interviewAsk(g, 0); return G.resolve(g, r() < 0.5 ? { hire: 'cand' } : null);
    default: {
      def.choices.forEach(c => { const t = G.fill(c.t, g, x.ctx); if (/\{\w+\}/.test(t)) throw new Error('Unfilled choice in ' + x.id + ': ' + t); });
      const res = G.choose(g, process.env.LAST ? def.choices.length - 1 : Math.floor(r() * def.choices.length));
      if (/\{\w+\}/.test(res.text)) throw new Error('Unfilled result in ' + x.id + ': ' + res.text);
      return res;
    }
  }
}

for (const ind of CS.INDUSTRIES) {
  const out = [];
  for (let run = 0; run < runs; run++) {
    const g = G.newGame({ name: 'Test', logo: '⭐', color: '#000', industry: ind.id, city: Object.keys(CS.CITIES)[run % 8], funding: 'savings' });
    const start = g.cash;
    try {
      for (let w = 0; w < weeks && !g.over; w++) {
        const rep = G.nextWeek(g);
        rep.minor.forEach(m => { if (/\{\w+\}|undefined|NaN/.test(m)) throw new Error('Bad minor text: ' + m); });
        while (G.currentEvent(g)) playEvent(g);
        // A simple player: hire when busy, keep a manager, claim missions, post weekly, buy cheap upgrades.
        const h = g.history[g.history.length - 1];
        if (h && h.demand > h.capacity * 1.05 && h.net > 0) {
          const c = g.candidates.find(c => c.role === 'front');
          if (c) G.hire(g, c.id);
        }
        if (g.employees.length > 7 && !g.employees.some(e => e.role === 'mgr')) { const c = g.candidates.find(c => c.role === 'mgr'); if (c) G.hire(g, c.id); }
        g.missions.forEach((m, i) => { if (G.missionDone(g, m)) G.claimMission(g, i); });
        if (!g.posted) G.post(g, G.postOptions(g)[0].id);
        CS.UPGRADES.forEach(u => { const c = G.upCost(g, u.id); if (c && g.cash > c * 4 && g.level >= G.upNeedLevel(g, u.id)) G.buyUpgrade(g, u.id); });
        if (Number.isNaN(g.cash) || Number.isNaN(g.followers)) throw new Error('NaN at week ' + g.week);
      }
    } catch (e) { errors++; console.error(ind.id, e.stack); break; }
    out.push({ over: g.over && g.over.reason === 'bankrupt', mult: (g.cash / start).toFixed(1), staff: g.employees.length, lvl: g.level, fans: g.followers });
  }
  const bust = out.filter(o => o.over).length;
  console.log(ind.id.padEnd(14), 'bankrupt', bust + '/' + runs, ' cash x', out.map(o => o.mult).join(' '), ' lvl', out.map(o => o.lvl).join(','), ' fans', out.map(o => CS.U.num(o.fans)).join(','));
}
console.log('event kinds played:', JSON.stringify(seenKinds));
if (errors) { console.error(errors + ' errors'); process.exit(1); }
