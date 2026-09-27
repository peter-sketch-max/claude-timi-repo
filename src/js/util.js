// Shared helpers. Every game file hangs off the global CS namespace so the
// game runs from a plain file:// double-click as well as from a web server.
var CS = globalThis.CS = globalThis.CS || {};

CS.U = {
  rand: function (a, b) { return a + Math.random() * (b - a); },
  ri: function (a, b) { return Math.floor(a + Math.random() * (b - a + 1)); },
  chance: function (p) { return Math.random() < p; },
  pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); },
  shuffle: function (arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  },
  // Pick one item using weightFn(item) >= 0. Returns null when all weights are 0.
  weighted: function (items, weightFn) {
    var total = 0, ws = items.map(function (it) { var w = Math.max(0, weightFn(it) || 0); total += w; return w; });
    if (total <= 0) return null;
    var r = Math.random() * total;
    for (var i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; }
    return items[items.length - 1];
  },
  // Round to two significant figures so event costs read like real prices.
  nice: function (n) {
    if (!isFinite(n) || n <= 0) return 0;
    if (n < 100) return Math.round(n);
    var p = Math.pow(10, Math.floor(Math.log10(n)) - 1);
    return Math.round(n / p) * p;
  },
  money: function (n) {
    n = Math.round(n || 0);
    var s = n < 0 ? '-' : '', a = Math.abs(n);
    if (a >= 1e12) return s + '$' + (a / 1e12).toFixed(2) + 'T';
    if (a >= 1e9) return s + '$' + (a / 1e9).toFixed(2) + 'B';
    if (a >= 1e7) return s + '$' + (a / 1e6).toFixed(2) + 'M';
    return s + '$' + a.toLocaleString('en-US');
  },
  short: function (n) {
    n = Math.round(n || 0);
    var s = n < 0 ? '-' : '', a = Math.abs(n);
    if (a >= 1e12) return s + '$' + (a / 1e12).toFixed(1) + 'T';
    if (a >= 1e9) return s + '$' + (a / 1e9).toFixed(1) + 'B';
    if (a >= 1e6) return s + '$' + (a / 1e6).toFixed(1) + 'M';
    if (a >= 1e4) return s + '$' + Math.round(a / 1e3) + 'K';
    return s + '$' + a.toLocaleString('en-US');
  },
  num: function (n) {
    n = Math.round(n || 0);
    if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    return n.toLocaleString('en-US');
  },
  signed: function (n) { return (n >= 0 ? '+' : '') + CS.U.money(n); },
  esc: function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
};
