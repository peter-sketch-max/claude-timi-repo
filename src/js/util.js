// Shared helpers. Every game file hangs off the global CS namespace so the
// game runs from a plain file:// double-click as well as from a web server.
var CS = globalThis.CS = globalThis.CS || {};

(function () {
  // Seedable random numbers (mulberry32) so the Daily Challenge gives everyone the same start.
  var s = (Math.random() * 4294967296) >>> 0;
  function random() {
    s = (s + 0x6D2B79F5) >>> 0;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  CS.U = {
    random: random,
    seed: function (n) { s = n >>> 0; },
    state: function () { return s; },
    hash: function (str) {
      var h = 2166136261;
      for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
      return h >>> 0;
    },
    rand: function (a, b) { return a + random() * (b - a); },
    ri: function (a, b) { return Math.floor(a + random() * (b - a + 1)); },
    chance: function (p) { return random() < p; },
    pick: function (arr) { return arr[Math.floor(random() * arr.length)]; },
    clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); },
    shuffle: function (arr) {
      var a = arr.slice();
      for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(random() * (i + 1));
        var t = a[i]; a[i] = a[j]; a[j] = t;
      }
      return a;
    },
    // Pick one item using weightFn(item) >= 0. Returns null when all weights are 0.
    weighted: function (items, weightFn) {
      var total = 0, ws = items.map(function (it) { var w = Math.max(0, weightFn(it) || 0); total += w; return w; });
      if (total <= 0) return null;
      var r = random() * total;
      for (var i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0 && ws[i] > 0) return items[i]; }
      for (var j = items.length - 1; j >= 0; j--) if (ws[j] > 0) return items[j];
      return null;
    },
    // Round to two significant figures so prices read like real prices.
    nice: function (n) {
      if (!isFinite(n) || n <= 0) return 0;
      if (n < 100) return Math.round(n);
      var p = Math.pow(10, Math.floor(Math.log10(n)) - 1);
      return Math.round(n / p) * p;
    },
    money: function (n) {
      n = Math.round(n || 0);
      var sg = n < 0 ? '-' : '', a = Math.abs(n);
      if (a >= 1e12) return sg + '$' + (a / 1e12).toFixed(2) + 'T';
      if (a >= 1e9) return sg + '$' + (a / 1e9).toFixed(2) + 'B';
      if (a >= 1e7) return sg + '$' + (a / 1e6).toFixed(2) + 'M';
      return sg + '$' + a.toLocaleString('en-US');
    },
    short: function (n) {
      n = Math.round(n || 0);
      var sg = n < 0 ? '-' : '', a = Math.abs(n);
      if (a >= 1e12) return sg + '$' + (a / 1e12).toFixed(1) + 'T';
      if (a >= 1e9) return sg + '$' + (a / 1e9).toFixed(1) + 'B';
      if (a >= 1e6) return sg + '$' + (a / 1e6).toFixed(1) + 'M';
      if (a >= 1e4) return sg + '$' + Math.round(a / 1e3) + 'K';
      return sg + '$' + a.toLocaleString('en-US');
    },
    num: function (n) {
      n = Math.round(n || 0);
      var a = Math.abs(n);
      if (a >= 1e9) return (n / 1e9).toFixed(1) + 'B';
      if (a >= 1e6) return (n / 1e6).toFixed(1) + 'M';
      if (a >= 1e4) return (n / 1e3).toFixed(1) + 'K';
      return n.toLocaleString('en-US');
    },
    signed: function (n) { return (n >= 0 ? '+' : '') + CS.U.money(n); },
    // coach -> coaches, baker -> bakers
    plural: function (w) { return /(s|sh|ch|x|z)$/i.test(w) ? w + 'es' : w + 's'; },
    esc: function (str) {
      return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },
    today: function () {
      var d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
  };
})();
