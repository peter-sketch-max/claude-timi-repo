// Checks every event: exactly 4 responses, known category, valid effect keys, no duplicate ids.
const fs = require('fs'), vm = require('vm'), path = require('path');
['util', 'data', 'game', 'events', 'events-more', 'events-fun'].forEach(f => vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../src/js', f + '.js'), 'utf8'), { filename: f + '.js' }));
const CS = globalThis.CS;
const KEYS = new Set('cash money rep happy fans team a b m skill loyal reliable rel date breakup raise teamRaise teamBonus bonus promote mgr demote fire quit demand capacity supply extra closed price equip rent viral hire hireSpecial pet rival next chance say xp flag run'.split(' '));
let bad = 0; const ids = {};
function checkFx(fx, where) {
  if (!fx || typeof fx === 'function') return;
  Object.keys(fx).forEach(k => { if (!KEYS.has(k)) { console.log('Unknown fx key', k, 'in', where); bad++; } });
  if (fx.chance) { checkFx(fx.chance.win, where); checkFx(fx.chance.lose, where); }
  if (fx.next) (typeof fx.next[0] === 'string' ? [fx.next] : fx.next).forEach(n => { if (!CS.EV[n[0]]) { console.log('Missing chain event', n[0], 'in', where); bad++; } });
}
CS.EVENTS.forEach(d => {
  if (ids[d.id]) { console.log('Duplicate id', d.id); bad++; } ids[d.id] = 1;
  if (!CS.CATS[d.cat]) { console.log('Bad category', d.cat, d.id); bad++; }
  if (d.choices && d.choices.length !== 4) { console.log(d.id, 'has', d.choices.length, 'responses'); bad++; }
  if (d.kind === 'minor') { console.log(d.id, 'is minor (no responses)'); bad++; }
  (d.choices || []).forEach(c => checkFx(c.fx, d.id));
  ['win', 'lose', 'tie'].forEach(k => checkFx(d[k], d.id));
  (d.prizes || d.slices || []).forEach(p => checkFx(p.fx, d.id));
});
const kinds = {}; CS.EVENTS.forEach(d => kinds[d.kind] = (kinds[d.kind] || 0) + 1);
const cats = {}; CS.EVENTS.forEach(d => cats[d.cat] = (cats[d.cat] || 0) + 1);
console.log(CS.EVENTS.length + ' events', JSON.stringify(kinds));
console.log(JSON.stringify(cats));
if (bad) { console.log(bad + ' problems'); process.exit(1); } else console.log('All events OK');
