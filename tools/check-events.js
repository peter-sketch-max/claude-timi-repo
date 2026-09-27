// Checks every event: exactly 4 responses, known category, valid effect keys, no duplicate ids.
const fs = require('fs'), vm = require('vm'), path = require('path');
require('./core-files').forEach(f => vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../src/js', f + '.js'), 'utf8'), { filename: f + '.js' }));
const CS = globalThis.CS;
const KEYS = new Set('cash money rep happy fans team a b m skill loyal reliable rel date breakup raise teamRaise teamBonus bonus promote mgr demote fire quit demand capacity supply extra closed price equip rent viral hire hireSpecial pet rival next chance say xp flag run die'.split(' '));
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
// Every piece of text must fill in: no leftover {placeholders}, and {a}/{b}/{m} only when the event picks those people.
(function () {
  const G = CS.G, g = G.newGame({ name: 'Test Co', industry: 'cafe', city: 'london', funding: 'savings' });
  G.resume(g); g.pet = '🐶';
  const texts = [];
  function walk(v) {
    if (!v) return;
    if (typeof v === 'string') { texts.push(v); return; }
    if (Array.isArray(v)) { v.forEach(walk); return; }
    if (typeof v === 'object') ['t', 'd', 'say', 'title', 'text', 'label', 'fx', 'win', 'lose', 'chance'].forEach(k => walk(v[k]));
  }
  CS.EVENTS.forEach(d => {
    texts.length = 0;
    walk(d.title); walk(d.text); walk(d.msgs); walk(d.choices); walk(d.win); walk(d.lose); walk(d.tie); walk(d.prizes); walk(d.slices);
    const ctx = {};
    try { if (d.init) d.init(g, ctx); } catch (e) { /* init may need more state; the simulator covers it */ }
    texts.forEach(t => {
      (t.match(/\{(\w+)\}/g) || []).forEach(m => {
        const k = m.slice(1, -1);
        if ('abm'.includes(k) && k.length === 1) {
          if (!d.chainOnly && !(d.who && d.who[k])) { console.log('Uses ' + m + ' but picks no ' + k + ':', d.id); bad++; }
          return;
        }
        if (/^(amt|amt2|company|front|fronts|unit|industry|city|rival)$/.test(k) || ctx[k] != null || d.chainOnly) return;
        console.log('Unfilled ' + m + ' in', d.id); bad++;
      });
    });
  });
})();

// Keep events short and clean: short titles and answers, and hardly any emoji in the story text.
(function () {
  // Count emoji as the player sees them: 🧑‍🍳 is one emoji even though it is built from several.
  const EMO = /\p{Extended_Pictographic}/u, SEG = new Intl.Segmenter('en', { granularity: 'grapheme' });
  const dummy = t => String(t).replace(/\{company\}|\{rival\}/g, 'Xxxxxxxxxxxx').replace(/\{\w+\}/g, 'Xxxxxxxx');
  const emo = t => [...SEG.segment(String(t))].filter(x => EMO.test(x.segment)).length;
  function lim(id, what, t, max, maxEmo) {
    if (typeof t !== 'string') return;
    const s = dummy(t);
    if (s.length > max) { console.log(id + ': ' + what + ' is too long (' + s.length + '/' + max + '): ' + t); bad++; }
    if (maxEmo != null && emo(t) > maxEmo) { console.log(id + ': too many emoji in ' + what + ': ' + t); bad++; }
  }
  function says(id, fx) {
    if (!fx || typeof fx !== 'object') return;
    lim(id, 'result', fx.say, 110, 1);
    if (fx.chance) { says(id, fx.chance.win); says(id, fx.chance.lose); }
  }
  CS.EVENTS.forEach(d => {
    if (d.cat === 'funny' || d.cat === 'weird') { console.log(d.id + ': the ' + d.cat + ' category was removed'); bad++; }
    lim(d.id, 'title', d.title, 44, 0);
    lim(d.id, 'text', d.text, 150, 1);
    (d.msgs || []).forEach(m => lim(d.id, 'message', m, 48, 1));
    if (d.msgs && d.msgs.length > 4) { console.log(d.id + ': more than 4 messages'); bad++; }
    (d.choices || []).forEach(c => {
      lim(d.id, 'answer', c.t, 34, 1);
      if (typeof c.t === 'string' && !/^\p{Extended_Pictographic}/u.test(c.t)) { console.log(d.id + ': answer should start with an emoji: ' + c.t); bad++; }
      says(d.id, c.fx);
    });
    ['win', 'lose', 'tie'].forEach(k => says(d.id, d[k]));
  });
})();

const kinds = {}; CS.EVENTS.forEach(d => kinds[d.kind] = (kinds[d.kind] || 0) + 1);
const cats = {}; CS.EVENTS.forEach(d => cats[d.cat] = (cats[d.cat] || 0) + 1);
console.log(CS.EVENTS.length + ' events', JSON.stringify(kinds));
console.log(JSON.stringify(cats));
if (bad) { console.log(bad + ' problems'); process.exit(1); } else console.log('All events OK');
