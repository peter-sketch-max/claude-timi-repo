// Headless balance check: plays every industry for N weeks with random choices.
// Usage: node tools/simulate.js [weeks] [runsPerIndustry]
const fs = require('fs'), vm = require('vm'), path = require('path');
['util', 'data', 'game', 'events'].forEach(f => vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../src/js', f + '.js'), 'utf8'), { filename: f + '.js' }));
const CS = globalThis.CS;
if (process.env.NOEVENTS) CS.EVENTS.length = 0;
const weeks = +process.argv[2] || 156, runs = +process.argv[3] || 6;
let errors = 0;
for (const ind of CS.INDUSTRIES) {
  const out = [];
  for (let r = 0; r < runs; r++) {
    const g = CS.G.newGame({ name: 'Test', logo: '⭐', color: '#000', industry: ind.id, city: Object.keys(CS.CITIES)[r % 8], funding: 'savings' });
    const start = g.cash;
    try {
      for (let w = 0; w < weeks && !g.over; w++) {
        CS.G.nextWeek(g);
        let x;
        while ((x = CS.G.currentEvent(g))) {
          const def = CS.EV[x.id];
          ['title', 'text'].forEach(k => CS.G.render(def[k], g, x.ctx));
          def.choices.forEach(c => CS.G.choiceLabel(g, x, c));
          CS.G.choose(g, process.env.LAST ? def.choices.length - 1 : Math.floor(Math.random() * def.choices.length));
        }
        // simple player: hire when capacity-limited and profitable
        const h = g.history[g.history.length - 1];
        if (h && h.demand > h.capacity * 1.05 && h.net > 0 && g.candidates.length) {
          const c = g.candidates.find(c => c.role === 'front');
          if (c) CS.G.hire(g, c.id);
        }
        if (g.employees.length > 7 && !g.employees.some(e => e.role === 'mgr')) { const c = g.candidates.find(c => c.role === 'mgr'); if (c) CS.G.hire(g, c.id); }
        if (Number.isNaN(g.cash)) throw new Error('NaN cash week ' + g.week);
      }
    } catch (e) { errors++; console.error(ind.id, e.stack); break; }
    out.push({ over: !!g.over, wk: g.week, mult: (g.cash / start).toFixed(1), staff: g.employees.length, rep: Math.round(g.reputation) });
  }
  const bust = out.filter(o => o.over).length;
  console.log(ind.id.padEnd(14), 'bankrupt', bust + '/' + runs, ' cash x', out.map(o => o.mult).join(' '), ' staff', out.map(o => o.staff).join(','));
}
if (errors) { console.error(errors + ' errors'); process.exit(1); }
