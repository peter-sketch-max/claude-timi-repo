// Background music: 5 original songs played live with Web Audio, so there are no song files and no copyright issues.
// Every song has chords (electric piano and a soft pad), a bass line, a melody and drums, mixed with a little echo.
// The menu, the game and wars each have their own music, and the game moves between 3 songs.
var CS = globalThis.CS = globalThis.CS || {};

CS.Music = (function () {
  var NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function pc(name) { return NOTE[name[0]] + (name[1] === '#' ? 1 : name[1] === 'b' ? -1 : 0); }
  function midi(n) { var m = /^([A-G][#b]?)(\d)$/.exec(n); return pc(m[1]) + (+m[2] + 1) * 12; }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  // ---------- songs ----------
  // chords: one per bar (the list repeats). mel: one string per bar, "step note length" separated by |, '' = rest.
  // bass/comp: [step, semitones above the root, length] and [step, length, loudness]. Drums: one letter per 16th note.
  var SONGS = {
    morning: {
      mood: 'menu', bpm: 84, swing: 0, kit: 'soft', lead: 'piano', keys: 'piano', pad: 1, arp: true, arpSound: 'bell', bassType: 'round',
      chords: ['Cmaj7', 'Em7', 'Fmaj7', 'G6', 'Am7', 'Em7', 'Fmaj7', 'Gsus4'],
      bass: [[0, 0, 8], [8, 7, 6], [14, 12, 2]],
      comp: [[0, 14, 0.7]],
      drums: { k: 'x.......x.......', r: '............x...', sh: '..x...x...x...x.' },
      mel: ['0 G5 6|6 E5 2|8 C5 8', '0 B4 6|6 D5 2|8 E5 8', '0 A5 6|6 G5 2|8 F5 4|12 E5 4', '0 D5 12',
        '0 C5 6|6 E5 2|8 A5 8', '0 G5 6|6 B5 2|8 G5 4|12 E5 4', '0 F5 4|4 A5 4|8 C6 4|12 A5 4', '0 G5 12',
        '', '', '', '', '0 E5 4|4 G5 4|8 C6 8', '0 B5 8|8 G5 8', '0 A5 4|4 F5 4|8 C5 8', '0 D5 8|8 G4 8']
    },
    sunny: {
      mood: 'game', bpm: 100, swing: 0.14, kit: 'lofi', lead: 'flute', keys: 'piano', pad: 0.8, arp: true, arpSound: 'pluck', bassType: 'round',
      chords: ['Fmaj7', 'Am7', 'Dm7', 'C', 'Bbmaj7', 'Am7', 'Gm7', 'C9'],
      bass: [[0, 0, 5], [6, 0, 2], [8, 7, 3], [12, 12, 2], [14, 7, 2]],
      comp: [[0, 7, 1], [10, 5, 0.6]],
      drums: { k: 'x......x..x.....', s: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', o: '..............x.' },
      mel: ['0 A4 3|4 C5 2|6 E5 4|12 D5 2|14 C5 2', '0 C5 6|8 A4 2|10 G4 2|12 A4 4', '0 D5 3|4 F5 2|6 E5 2|8 D5 2|10 C5 2|12 A4 4', '0 G4 8|14 C5 2',
        '0 D5 4|4 F5 4|8 E5 2|10 D5 2|12 C5 2|14 D5 2', '0 E5 6|8 C5 2|10 A4 2|12 C5 4', '0 Bb4 3|4 D5 2|6 F5 4|12 E5 2|14 D5 2', '0 E5 4|4 C5 4|8 G4 4',
        '0 C5 2|2 F5 2|4 A5 4|8 G5 2|10 F5 2|12 E5 4', '0 E5 2|2 G5 2|4 E5 2|6 C5 2|8 A4 8', '0 A4 2|2 C5 2|4 D5 2|6 F5 2|8 A5 4|12 G5 2|14 F5 2', '0 E5 6|6 D5 2|8 C5 4',
        '0 F5 2|2 D5 2|4 F5 2|6 A5 4|10 G5 2|12 F5 4', '0 E5 2|2 C5 2|4 E5 2|6 G5 6|12 E5 4', '0 D5 2|2 F5 2|4 Bb5 4|8 A5 2|10 G5 2|12 F5 2|14 E5 2', '0 G5 4|4 E5 4|8 C5 8']
    },
    bigdeal: {
      mood: 'game', bpm: 110, swing: 0.06, kit: 'pop', lead: 'guitar', keys: 'guitar', pad: 0.6, bassType: 'funk',
      chords: ['Dmaj7', 'Bm7', 'Em7', 'A7', 'Dmaj7', 'F#m7', 'Gmaj7', 'A7'],
      bass: [[0, 0, 2], [3, 0, 1], [6, 12, 1], [8, 0, 2], [11, 7, 1], [14, 12, 1], [15, 7, 1]],
      comp: [[2, 2, 0.8], [6, 2, 0.6], [10, 3, 0.8]],
      drums: { k: 'x.....x.x.......', c: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', sh: '.x.x.x.x.x.x.x.x', o: '......x.......x.' },
      mel: ['0 F#5 2|3 A5 2|6 F#5 2|8 E5 2|10 D5 2|12 E5 3', '0 F#5 3|4 D5 2|6 B4 2|8 D5 4|14 A4 2', '0 B4 2|2 D5 2|4 E5 2|6 G5 3|10 F#5 2|12 E5 4', '0 C#5 4|4 E5 2|6 A5 4|12 G5 2|14 E5 2',
        '0 F#5 2|3 A5 2|6 D6 3|10 C#6 2|12 A5 4', '0 C#6 3|4 A5 2|6 F#5 2|8 E5 4|12 C#5 4', '0 D5 2|2 G5 2|4 B5 4|8 A5 2|10 G5 2|12 F#5 2|14 E5 2', '0 E5 4|4 C#5 4|8 A4 4|12 E5 2|14 F#5 2',
        '0 A5 6|8 F#5 2|10 A5 2|12 B5 4', '0 A5 6|8 F#5 4|12 D5 4', '0 G5 6|8 E5 2|10 G5 2|12 B5 4', '0 A5 8|8 C#6 4|12 E6 4',
        '0 D6 6|8 C#6 2|10 A5 2|12 F#5 4', '0 E5 6|8 C#5 2|10 E5 2|12 A5 4', '0 B5 4|4 A5 2|6 G5 2|8 F#5 2|10 G5 2|12 A5 4', '0 A5 4|4 G5 4|8 E5 4|12 C#5 4']
    },
    city: {
      mood: 'game', bpm: 92, swing: 0.16, kit: 'lofi', lead: 'bell', keys: 'piano', pad: 0.9, arp: true, arpSound: 'pluck', bassType: 'round',
      chords: ['Ebmaj7', 'Dm7', 'Cm7', 'F7', 'Bbmaj7', 'Gm7', 'Cm7', 'F7'],
      bass: [[0, 0, 6], [7, 0, 1], [8, 7, 4], [14, 10, 2]],
      comp: [[0, 6, 0.9], [7, 3, 0.5], [12, 4, 0.6]],
      drums: { k: 'x.........x.....', s: '....x.......x...', h: 'x.xxx.x.x.xxx.x.' },
      mel: ['0 G5 3|4 Bb5 3|8 D6 4|12 C6 2|14 Bb5 2', '0 A5 6|6 F5 2|8 D5 4|12 F5 4', '0 Eb5 3|4 G5 3|8 Bb5 2|10 C6 2|12 Bb5 4', '0 A5 8|8 C6 2|10 A5 2|12 F5 4',
        '0 D5 3|4 F5 3|8 A5 6|14 Bb5 2', '0 G5 6|6 F5 2|8 D5 8', '0 C5 3|4 Eb5 3|8 G5 3|12 Bb5 4', '0 A5 4|4 G5 2|6 F5 2|8 Eb5 4|12 C5 4',
        '0 D6 8|8 C6 2|10 Bb5 2|12 G5 4', '0 F5 8|8 A5 4|12 C6 4', '0 Bb5 6|6 G5 2|8 Eb5 8', '0 F5 4|4 A5 4|8 C6 8',
        '0 D6 4|4 C6 2|6 Bb5 2|8 A5 4|12 F5 4', '0 G5 8|8 Bb5 4|12 D6 4', '0 Eb6 4|4 D6 2|6 C6 2|8 Bb5 4|12 G5 4', '0 A5 8|8 F5 8']
    },
    battle: {
      mood: 'war', bpm: 138, swing: 0, kit: 'war', lead: 'saw', pad: 0.7, stabs: true, bassType: 'drive',
      chords: ['Am', 'F', 'C', 'G', 'Am', 'F', 'G', 'E'],
      bass: [[0, 0, 1], [2, 0, 1], [4, 12, 1], [6, 0, 1], [8, 0, 1], [10, 0, 1], [12, 12, 1], [14, 7, 1]],
      comp: [[0, 2, 1], [6, 1, 0.7], [10, 2, 0.9]],
      drums: { k: 'x...x...x...x...', s: '....x.......x...', c: '....x.......x...', h: '..x...x...x...x.' },
      mel: ['0 A4 2|2 C5 2|4 E5 4|8 D5 2|10 C5 2|12 B4 2|14 C5 2', '0 A4 6|6 F4 2|8 A4 2|10 C5 2|12 F5 4', '0 E5 2|2 G5 2|4 E5 2|6 C5 2|8 G5 4|12 E5 4', '0 D5 6|6 B4 2|8 D5 2|10 G5 2|12 B5 4',
        '0 A5 4|4 E5 2|6 A5 2|8 C6 4|12 B5 2|14 A5 2', '0 C6 4|4 A5 2|6 F5 2|8 A5 4|12 C6 4', '0 B5 4|4 G5 2|6 D5 2|8 G5 4|12 B5 2|14 D6 2', '0 E6 6|6 D6 2|8 B5 2|10 G#5 2|12 E5 4',
        '', '', '', '0 D5 4|4 E5 4|8 G5 4|12 B5 4',
        '0 A5 4|4 E5 2|6 A5 2|8 C6 4|12 B5 2|14 A5 2', '0 C6 4|4 A5 2|6 F5 2|8 A5 4|12 C6 4', '0 B5 4|4 G5 2|6 D5 2|8 G5 4|12 B5 2|14 D6 2', '0 E6 6|6 D6 2|8 B5 2|10 G#5 2|12 E5 4']
    }
  };
  var MOODS = { menu: ['morning'], game: ['sunny', 'bigdeal', 'city'], war: ['battle'] };
  var LOOPS = 2; // loops of a game song before the next one

  var QUAL = { '': [0, 4, 7], m: [0, 3, 7], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], '7': [0, 4, 7, 10], '9': [0, 4, 10, 14], '6': [0, 4, 7, 9], sus4: [0, 5, 7, 10] };
  function chord(sym) {
    var m = /^([A-G][#b]?)(.*)$/.exec(sym);
    return { root: pc(m[1]), pcs: QUAL[m[2]].map(function (i) { return (pc(m[1]) + i) % 12; }) };
  }
  // Voice leading: of all the ways to stack the chord around middle C, pick the one closest to the last chord.
  function voice(pcs, prev) {
    var best = null, bestScore = 1e9;
    for (var base = 52; base <= 63; base++) {
      var v = pcs.map(function (p) { var n = base + ((p - base) % 12 + 12) % 12; return n; }).sort(function (a, b) { return a - b; });
      if (v[v.length - 1] - v[0] > 14) continue;
      var score = prev ? v.reduce(function (s, n, i) { return s + Math.abs(n - (prev[i] != null ? prev[i] : prev[prev.length - 1])); }, 0) : Math.abs(v[0] - 55);
      if (score < bestScore) { bestScore = score; best = v; }
    }
    return best;
  }
  function prepare(s) {
    if (s.ready) return s;
    var prev = null;
    s.voiced = s.chords.map(function (sym) { var c = chord(sym); prev = voice(c.pcs, prev); return { notes: prev, bass: 40 + ((c.root - 4) % 12 + 12) % 12, pcs: c.pcs }; });
    s.bars = s.mel.map(function (bar) {
      return bar ? bar.split('|').map(function (t) { var p = t.trim().split(/\s+/); return [+p[0], midi(p[1]), +p[2]]; }) : [];
    });
    s.ready = true;
    if (ctx) warm(s);
    return s;
  }

  // ---------- sound ----------
  var ctx = null, out, comp, bus, mix, duck, verbIn, noise = null;
  function impulse(c, secs) {
    var len = Math.floor(c.sampleRate * secs), buf = c.createBuffer(2, len, c.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    return buf;
  }
  function graph(c, dest) {
    var o = {};
    o.out = c.createGain(); o.out.gain.value = 0.62;
    o.comp = c.createDynamicsCompressor();
    o.comp.threshold.value = -16; o.comp.ratio.value = 3; o.comp.attack.value = 0.01; o.comp.release.value = 0.2;
    o.bus = c.createGain(); o.bus.gain.value = 1;
    o.mix = c.createGain();
    o.duck = c.createGain(); o.duck.connect(o.mix);
    o.verbIn = c.createGain(); o.verbIn.gain.value = 1;
    var verb = c.createConvolver(); verb.buffer = impulse(c, 2.4);
    var verbOut = c.createGain(); verbOut.gain.value = 0.55;
    var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000;
    o.verbIn.connect(verb); verb.connect(verbOut); verbOut.connect(o.bus);
    o.mix.connect(o.bus); o.bus.connect(lp); lp.connect(o.comp); o.comp.connect(o.out); o.out.connect(dest);
    o.noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
    var d = o.noise.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return o;
  }
  function use(o, c) { ctx = c; out = o.out; comp = o.comp; bus = o.bus; mix = o.mix; duck = o.duck; verbIn = o.verbIn; noise = o.noise; }

  // An output with an echo send: sound -> gain -> (target) and a bit to the reverb.
  function voiceOut(t, target, send, pan) {
    var g = ctx.createGain();
    if (pan && ctx.createStereoPanner) { var pn = ctx.createStereoPanner(); pn.pan.value = pan; g.connect(pn); pn.connect(target || mix); }
    else g.connect(target || mix);
    if (send) { var s = ctx.createGain(); s.gain.value = send; g.connect(s); s.connect(verbIn); }
    return g;
  }
  function osc(type, f, t, end, dest, detune) {
    var o = ctx.createOscillator();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (detune) o.detune.setValueAtTime(detune, t);
    o.connect(dest); o.start(t); o.stop(end);
    return o;
  }
  function adsr(g, t, a, peak, d, sus, dur, rel) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setTargetAtTime(peak * sus, t + a, d);
    g.gain.setTargetAtTime(0.0001, t + Math.max(a, dur), rel);
    return t + Math.max(a, dur) + rel * 5;
  }

  // Sampled instruments, made once per note from math and kept: a piano built from its overtones,
  // and a plucked string (the Karplus-Strong method), which sound much more real than plain oscillators.
  var bufs = {};
  function pianoBuf(m) {
    var sr = ctx.sampleRate, key = sr + 'p' + m;
    if (bufs[key]) return bufs[key];
    var f = hz(m), len = Math.floor(sr * 2.4), buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
    var B = 0.0001 * Math.pow(2, (m - 60) / 12), base = Math.max(0.5, 2 - (m - 40) / 45);
    for (var n = 1; n <= 12; n++) {
      var fn = n * f * Math.sqrt(1 + B * n * n);
      if (fn > sr * 0.42) break;
      var amp = Math.pow(n, -1.15) * (0.75 + 0.25 * Math.cos(n * 2.1)), tau = base / (1 + (n - 1) * 0.5);
      var w = 2 * Math.PI * fn / sr, ph = Math.random() * 6.283, k = Math.exp(-1 / (tau * sr)), a = amp;
      // two strings per note, a hair out of tune, for a warm chorus
      var w2 = w * (n === 1 ? 1.0009 : 1.0004), a2 = amp * 0.45;
      // Sine waves by rotation (much faster than calling Math.sin for every sample).
      var c1 = Math.cos(w), s1 = Math.sin(w), x1 = Math.cos(ph), y1 = Math.sin(ph), c2 = Math.cos(w2), s2 = Math.sin(w2), x2 = 1, y2 = 0, t1;
      for (var i = 0; i < len; i++) {
        d[i] += a * y1 + a2 * y2; a *= k; a2 *= k;
        t1 = x1 * c1 - y1 * s1; y1 = x1 * s1 + y1 * c1; x1 = t1;
        t1 = x2 * c2 - y2 * s2; y2 = x2 * s2 + y2 * c2; x2 = t1;
      }
    }
    var att = Math.floor(sr * 0.003), peak = 0;
    for (i = 0; i < len; i++) { if (i < att) d[i] *= i / att; var v = Math.abs(d[i]); if (v > peak) peak = v; }
    for (i = 0; i < len; i++) d[i] *= 0.8 / peak;
    return (bufs[key] = buf);
  }
  function pluckBuf(m, soft) {
    var sr = ctx.sampleRate, key = sr + 'k' + m + (soft ? 's' : '');
    if (bufs[key]) return bufs[key];
    var f = hz(m), N = Math.max(2, Math.round(sr / f)), len = Math.floor(sr * 1.6), buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0);
    var ring = new Float32Array(N), prev = 0, i, idx = 0, rho = 0.9985, peak = 0;
    for (i = 0; i < N; i++) { prev += ((Math.random() * 2 - 1) - prev) * (soft ? 0.35 : 0.7); ring[i] = prev; }
    for (i = 0; i < len; i++) {
      var nx = idx + 1 === N ? 0 : idx + 1, v = ring[idx];
      d[i] = v; ring[idx] = rho * 0.5 * (v + ring[nx]); idx = nx;
      if (Math.abs(v) > peak) peak = Math.abs(v);
    }
    for (i = 0; i < len; i++) d[i] *= 0.8 / (peak || 1);
    return (bufs[key] = buf);
  }
  // Plays a sampled note, with a gentle release when it ends.
  function sample(buf, t, vol, dur, target, send, pan, rate) {
    var src = ctx.createBufferSource(), g = voiceOut(t, target, send, pan);
    src.buffer = buf; if (rate) src.playbackRate.value = rate;
    g.gain.setValueAtTime(vol, t);
    if (dur) g.gain.setTargetAtTime(0.0001, t + dur, 0.12);
    src.connect(g); src.start(t); src.stop(t + Math.min(buf.duration, (dur || buf.duration) + 0.8));
  }
  // Makes the notes a song needs in the background, a few at a time, so the first bars don't stutter.
  function warm(s) {
    var todo = [];
    s.voiced.forEach(function (c) {
      c.notes.forEach(function (n) {
        if (s.keys === 'piano') todo.push(['p', n]);
        if (s.keys === 'guitar') todo.push(['s', n]);
        if (s.arp && s.arpSound === 'pluck') todo.push(['s', n + 12], ['s', n + 24]);
      });
    });
    s.bars.forEach(function (b) { b.forEach(function (n) { if (s.lead === 'piano') todo.push(['p', n[1]]); if (s.lead === 'guitar') todo.push(['k', n[1]]); }); });
    (function next() {
      if (!ctx) return;
      for (var i = 0; i < 3 && todo.length; i++) { var x = todo.shift(); if (x[0] === 'p') pianoBuf(x[1]); else pluckBuf(x[1], x[0] === 's'); }
      if (todo.length) setTimeout(next, 30);
    })();
  }

  // Melody instruments.
  function lead(kind, m, t, dur, vel) {
    var f = hz(m), g, end, lp;
    if (kind === 'piano') return sample(pianoBuf(m), t, 0.16 * vel, dur + 0.4, mix, 0.35, 0.05);
    if (kind === 'guitar') return sample(pluckBuf(m), t, 0.26 * vel, dur + 0.2, mix, 0.3, 0.2);
    if (kind === 'flute') {
      g = voiceOut(t, mix, 0.35); lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600; lp.connect(g);
      end = adsr(g, t, 0.05, 0.1 * vel, 0.3, 0.75, dur, 0.09);
      var soft = ctx.createGain(); soft.gain.value = 0.25; soft.connect(lp);
      var o1 = osc('sine', f, t, end, lp), o2 = osc('triangle', f, t, end, soft);
      // A gentle vibrato that starts after the note begins, like a real flute.
      var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 5.2;
      lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.006, t + 0.25);
      lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency); lfo.start(t); lfo.stop(end);
    } else if (kind === 'bell') {
      g = voiceOut(t, mix, 0.45);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.1 * vel, t + 0.005); g.gain.setTargetAtTime(0.0001, t + 0.01, 0.35 + dur * 0.05);
      end = t + 2.2;
      var car = osc('sine', f, t, end, g), mod = ctx.createOscillator(), mg = ctx.createGain();
      mod.frequency.value = f * 4; mg.gain.setValueAtTime(f * 1.6, t); mg.gain.setTargetAtTime(0, t, 0.25);
      mod.connect(mg); mg.connect(car.frequency); mod.start(t); mod.stop(end);
    } else if (kind === 'pluck') {
      g = voiceOut(t, mix, 0.3); lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 3;
      lp.frequency.setValueAtTime(4200, t); lp.frequency.setTargetAtTime(900, t, 0.12); lp.connect(g);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.08 * vel, t + 0.004); g.gain.setTargetAtTime(0.0001, t + 0.02, 0.12 + dur * 0.03);
      end = t + 1.2;
      osc('sawtooth', f, t, end, lp, -5); osc('square', f, t, end, lp, 5);
    } else { // saw lead for wars
      g = voiceOut(t, mix, 0.3); lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2;
      lp.frequency.setValueAtTime(3200, t); lp.frequency.setTargetAtTime(1500, t, 0.1); lp.connect(g);
      end = adsr(g, t, 0.01, 0.06 * vel, 0.15, 0.7, dur, 0.06);
      osc('sawtooth', f, t, end, lp, -7); osc('sawtooth', f, t, end, lp, 7); osc('square', f / 2, t, end, lp);
    }
  }
  // Electric piano chords (FM), a warm pad, and short brass-like stabs for wars.
  function keys(notes, t, dur, vel, kind) {
    if (kind !== 'ep') {
      notes.forEach(function (m, i) { // a tiny strum, like a real hand
        var tt = t + i * (kind === 'guitar' ? 0.012 : 0.006);
        if (kind === 'guitar') sample(pluckBuf(m, true), tt, 0.11 * vel, dur, duck, 0.25, 0.3);
        else sample(pianoBuf(m), tt, 0.07 * vel, dur + 0.25, duck, 0.3, -0.12);
      });
      return;
    }
    notes.forEach(function (m) {
      var f = hz(m), g = voiceOut(t, duck, 0.3);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.045 * vel, t + 0.006); g.gain.setTargetAtTime(0.016 * vel, t + 0.01, 0.35);
      g.gain.setTargetAtTime(0.0001, t + dur, 0.12);
      var end = t + dur + 0.8, car = osc('sine', f, t, end, g), mod = ctx.createOscillator(), mg = ctx.createGain();
      mod.frequency.value = f; mg.gain.setValueAtTime(f * 1.3, t); mg.gain.setTargetAtTime(f * 0.15, t, 0.25);
      mod.connect(mg); mg.connect(car.frequency); mod.start(t); mod.stop(end);
    });
  }
  function pad(notes, t, dur, amt) {
    notes.forEach(function (m) {
      var g = voiceOut(t, duck, 0.6), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 850; lp.connect(g);
      var end = adsr(g, t, 0.5, 0.014 * amt, 1, 1, dur, 0.5);
      var l = ctx.createStereoPanner ? ctx.createStereoPanner() : null, r = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (l) { l.pan.value = -0.6; r.pan.value = 0.6; l.connect(lp); r.connect(lp); osc('sawtooth', hz(m), t, end, l, -9); osc('sawtooth', hz(m), t, end, r, 9); }
      else { osc('sawtooth', hz(m), t, end, lp, -9); osc('sawtooth', hz(m), t, end, lp, 9); }
    });
  }
  function stab(notes, t, dur, vel) {
    notes.forEach(function (m) {
      var g = voiceOut(t, duck, 0.35), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(2600, t); lp.frequency.setTargetAtTime(700, t, 0.08); lp.connect(g);
      var end = adsr(g, t, 0.008, 0.028 * vel, 0.1, 0.5, dur, 0.05);
      osc('sawtooth', hz(m), t, end, lp, -6); osc('sawtooth', hz(m), t, end, lp, 6);
    });
  }
  function bassNote(type, m, t, dur) {
    var f = hz(m), g = voiceOut(t, mix, 0), lp = ctx.createBiquadFilter(), end;
    lp.type = 'lowpass'; lp.connect(g);
    if (type === 'funk') { lp.Q.value = 6; lp.frequency.setValueAtTime(1400, t); lp.frequency.setTargetAtTime(380, t, 0.06); }
    else if (type === 'drive') { lp.Q.value = 3; lp.frequency.setValueAtTime(1100, t); lp.frequency.setTargetAtTime(500, t, 0.05); }
    else { lp.frequency.value = 700; }
    end = adsr(g, t, 0.006, type === 'funk' ? 0.09 : 0.11, 0.2, 0.75, dur * 0.95, 0.05);
    var sub = ctx.createGain(); sub.gain.value = 0.35; sub.connect(g);
    osc('sawtooth', f, t, end, lp); osc('sine', f, t, end, sub);
  }
  function arpNote(m, t, kind) {
    if (kind === 'pluck') return sample(pluckBuf(m, true), t, 0.07, 0, duck, 0.4, -0.35);
    var g = voiceOut(t, duck, 0.5, 0.3);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.028, t + 0.004); g.gain.setTargetAtTime(0.0001, t + 0.01, 0.22);
    var end = t + 1.2, car = osc('sine', hz(m), t, end, g), mod = ctx.createOscillator(), mg = ctx.createGain();
    mod.frequency.value = hz(m) * 3; mg.gain.setValueAtTime(hz(m) * 0.8, t); mg.gain.setTargetAtTime(0, t, 0.15);
    mod.connect(mg); mg.connect(car.frequency); mod.start(t); mod.stop(end);
  }

  // Drums.
  function noiseHit(t, vol, type, freq, q, decay, send, pan) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = voiceOut(t, mix, send || 0, pan);
    s.buffer = noise; f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
    g.gain.setValueAtTime(vol, t); g.gain.setTargetAtTime(0.0001, t + 0.003, decay);
    s.connect(f); f.connect(g); s.start(t, Math.random() * 0.5); s.stop(t + decay * 6 + 0.05);
  }
  function kick(t, vol, soft) {
    var g = voiceOut(t, mix, 0), o = ctx.createOscillator();
    o.frequency.setValueAtTime(soft ? 120 : 170, t); o.frequency.exponentialRampToValueAtTime(soft ? 60 : 52, t + 0.09);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * 0.6, t + 0.004); g.gain.setTargetAtTime(0.0001, t + 0.01, soft ? 0.06 : 0.08);
    o.connect(g); o.start(t); o.stop(t + 0.7);
    if (!soft) noiseHit(t, vol * 0.12, 'highpass', 2500, 0, 0.006);
    // Everything else ducks a little under the kick, so the beat breathes.
    duck.gain.setValueAtTime(1, t); duck.gain.linearRampToValueAtTime(0.62, t + 0.02); duck.gain.setTargetAtTime(1, t + 0.03, 0.09);
  }
  function snare(t, vol, kit) {
    noiseHit(t, vol, 'bandpass', kit === 'lofi' ? 1500 : 2000, 0.8, kit === 'lofi' ? 0.07 : 0.06, 0.25);
    var g = voiceOut(t, mix, 0), o = ctx.createOscillator();
    o.type = 'triangle'; o.frequency.setValueAtTime(210, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.08);
    g.gain.setValueAtTime(vol * 0.7, t); g.gain.setTargetAtTime(0.0001, t + 0.003, 0.04);
    o.connect(g); o.start(t); o.stop(t + 0.3);
  }
  function clap(t, vol) { for (var i = 0; i < 3; i++) noiseHit(t + i * 0.011, vol, 'bandpass', 1300, 1.2, i === 2 ? 0.06 : 0.012, 0.3); }
  function tom(t, m) {
    var g = voiceOut(t, mix, 0.2), o = ctx.createOscillator();
    o.frequency.setValueAtTime(hz(m), t); o.frequency.exponentialRampToValueAtTime(hz(m) * 0.7, t + 0.2);
    g.gain.setValueAtTime(0.3, t); g.gain.setTargetAtTime(0.0001, t + 0.005, 0.09);
    o.connect(g); o.start(t); o.stop(t + 0.6);
  }
  function rim(t) {
    var g = voiceOut(t, mix, 0.3), o = ctx.createOscillator();
    o.type = 'triangle'; o.frequency.value = 1700;
    g.gain.setValueAtTime(0.05, t); g.gain.setTargetAtTime(0.0001, t + 0.002, 0.015);
    o.connect(g); o.start(t); o.stop(t + 0.1);
  }

  // ---------- playing ----------
  var song = null, songId = null, step = 0, nextTime = 0, loops = 0, timer = null, playing = false, mood = 'menu', switchAt = 0, nextSong = null;
  function stepLen(s) { return 60 / s.bpm / 4; }
  function playStep(s, stp, t) {
    var barLen = 16, bar = Math.floor(stp / barLen), st = stp % barLen, nb = s.bars.length, bi = bar % nb, ch = s.voiced[bar % s.voiced.length];
    var loop = Math.floor(bar / nb), intro = bar < 2, sl = stepLen(s), kit = s.kit;
    var human = function () { return (Math.random() - 0.5) * 0.014; }, vel = function () { return 0.85 + Math.random() * 0.2; };
    var partB = bi >= nb / 2, drop = s.mood === 'game' && loop % 2 === 1 && (bi === nb / 2 || bi === nb / 2 + 1);
    // chords
    if (st === 0 && s.pad) pad(ch.notes, t, sl * 16, s.pad * (partB ? 1 : 0.8));
    s.comp.forEach(function (c) { if (c[0] === st) { if (s.stabs) stab(ch.notes, t, sl * c[1], c[2]); else keys(ch.notes, t + human(), sl * c[1], c[2] * vel(), s.keys); } });
    if (s.arp && !intro && st % 2 === 0) {
      var up = ch.notes.concat(ch.notes.map(function (n) { return n + 12; })), order = [0, 1, 2, 3, 4, 3, 2, 1];
      arpNote(up[order[(st / 2) % 8] % up.length] + 12, t + human(), s.arpSound);
    }
    // bass
    if (!intro || s.mood === 'war') s.bass.forEach(function (b) { if (b[0] === st) bassNote(s.bassType, ch.bass + b[1], t, sl * b[2]); });
    // melody (a second loop sometimes plays an octave up for variety)
    s.bars[bi].forEach(function (n) { if (n[0] === st) lead(s.lead, n[1] + (loop % 2 === 1 && s.lead === 'bell' ? 12 : 0), t + human(), sl * n[2], vel()); });
    // drums (a short breakdown now and then, so the song breathes)
    if (intro && s.mood !== 'war') return;
    if (drop) { if (d0(s, st)) noiseHit(t, 0.04, 'highpass', 7500, 0, 0.018, 0, 0.25); return; }
    var d = s.drums, fill = (bi === 7 || bi === nb - 1) && st >= 12;
    if (d.k && d.k[st] === 'x') kick(t, kit === 'soft' ? 0.35 : kit === 'lofi' ? 0.7 : kit === 'pop' ? 0.7 : 0.85, kit === 'soft');
    if (!fill) {
      if (d.s && d.s[st] === 'x') snare(t, kit === 'lofi' ? 0.22 : 0.3, kit);
      if (d.c && d.c[st] === 'x') clap(t, 0.25);
    } else if (kit === 'war') tom(t, [57, 53, 50, 45][st - 12]);
    else if (kit !== 'soft') snare(t, 0.1 + (st - 12) * 0.05, kit);
    if (d.h && d.h[st] === 'x') noiseHit(t, (st % 4 === 2 ? 0.075 : 0.05) * (kit === 'war' ? 1.3 : 1) * vel(), 'highpass', 7500, 0, 0.018, 0, 0.25);
    if (d.o && d.o[st] === 'x' && partB) noiseHit(t, 0.035, 'highpass', 7000, 0, 0.09, 0, 0.25);
    if (d.sh && d.sh[st] === 'x' && (partB || kit === 'soft')) noiseHit(t, 0.03 * vel(), 'bandpass', 6000, 1, 0.03, 0, -0.3);
    if (d.r && d.r[st] === 'x') rim(t);
    if (kit === 'war' && st === 0 && bi % 8 === 0) noiseHit(t, 0.07, 'highpass', 5000, 0, 0.45, 0.3);
  }
  function d0(s, st) { return s.drums.h ? s.drums.h[st] === 'x' : st % 2 === 0; }
  function pick(m) {
    var list = MOODS[m] || MOODS.game;
    if (list.length === 1) return list[0];
    var i = list.indexOf(songId);
    return list[(i + 1) % list.length];
  }
  function begin(id, t) {
    songId = id; song = prepare(SONGS[id]); step = 0; loops = 0; nextTime = t;
    bus.gain.cancelScheduledValues(t); bus.gain.setValueAtTime(0.0001, t); bus.gain.linearRampToValueAtTime(1, t + 0.8);
  }
  function schedule() {
    var ahead = ctx.currentTime + 0.18;
    while (nextTime < ahead) {
      if (switchAt && nextTime >= switchAt) { begin(nextSong, switchAt); switchAt = 0; }
      var sl = stepLen(song), swing = (step % 2 === 1) ? song.swing * sl : 0;
      playStep(song, step, nextTime + swing);
      nextTime += sl; step++;
      var barsDone = step / 16;
      if (step % 16 === 0 && barsDone % song.bars.length === 0) {
        loops++;
        if (song.mood === 'game' && loops >= LOOPS && !switchAt) fadeTo(pick('game'));
      }
    }
  }
  function fadeTo(id) {
    var t = Math.max(ctx.currentTime, nextTime);
    bus.gain.cancelScheduledValues(t); bus.gain.setValueAtTime(bus.gain.value || 1, t); bus.gain.linearRampToValueAtTime(0.0001, t + 0.7);
    nextSong = id; switchAt = t + 0.75;
  }

  function setup() {
    if (ctx) return true;
    var c;
    try { c = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return false; }
    use(graph(c, c.destination), c);
    return true;
  }
  function synthStart() {
    if (!setup()) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (timer) { if (song && song.mood !== mood) fadeTo(pick(mood)); return; }
    begin(songId && SONGS[songId].mood === mood ? songId : pick(mood), ctx.currentTime + 0.08);
    timer = setInterval(schedule, 25);
  }
  function synthStop() {
    if (timer) clearInterval(timer);
    timer = null; switchAt = 0;
    if (bus) { bus.gain.cancelScheduledValues(ctx.currentTime); bus.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08); }
  }

  // ---------- your own songs ----------
  // Songs put in src/music are copied into the app by the build, which lists them in CS.MUSIC_FILES
  // (see src/music/README.txt). A mood that has files plays them one after another; the others use the built-in songs.
  var FILE_VOL = 0.5, track = null, trackNo = {};
  function files(m) { var f = CS.MUSIC_FILES; return (f && f[m] && f[m].length && typeof Audio !== 'undefined') ? f[m] : null; }
  function fade(a, to, secs, done) {
    clearInterval(a.fader);
    var from = a.volume, n = Math.max(1, Math.round(secs * 20)), i = 0;
    a.fader = setInterval(function () {
      i++; a.volume = Math.max(0, Math.min(1, from + (to - from) * i / n));
      if (i >= n) { clearInterval(a.fader); if (done) done(); }
    }, 50);
  }
  function fileStop() {
    if (!track) return;
    var a = track; track = null;
    fade(a, 0, 0.7, function () { a.pause(); a.removeAttribute('src'); });
  }
  function filePlay(m) {
    var list = files(m), i = (trackNo[m] || 0) % list.length, name = list[i];
    trackNo[m] = i + 1;
    fileStop();
    var a = new Audio('music/' + name);
    a.volume = 0; a.loop = list.length === 1; a.mood = m;
    a.onended = function () { if (track === a && playing) filePlay(m); };
    // A file that won't play is dropped, and the music carries on without it.
    a.onerror = function () { if (track !== a) return; track = null; list.splice(list.indexOf(name), 1); if (playing) go(); };
    track = a;
    var p = a.play();
    if (p && p.catch) p.catch(function () {});
    fade(a, FILE_VOL, 1.2);
  }
  function go() {
    if (files(mood)) { synthStop(); if (!track || track.mood !== mood) filePlay(mood); }
    else { fileStop(); synthStart(); }
  }

  function start() {
    if (playing) return;
    playing = true;
    go();
  }
  function stop() {
    playing = false;
    synthStop(); fileStop();
  }
  // 'menu', 'game' or 'war'. The music fades into the right song.
  function setMood(m) {
    if (!MOODS[m] || m === mood) return;
    mood = m;
    if (playing) go();
  }

  // Pause when the app goes to the background.
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function () {
      if (!ctx && !track && !playing) return;
      if (document.hidden) { var a = track; stop(); if (a) { clearInterval(a.fader); a.pause(); } if (ctx) ctx.suspend(); }
      else if (CS.S && CS.S.settings && CS.S.settings.music && CS.S.started) { if (ctx) ctx.resume(); start(); }
    });
  }

  // For tests: renders a song into an OfflineAudioContext.
  function render(c, id, bars) {
    var saved = { ctx: ctx, out: out, comp: comp, bus: bus, mix: mix, duck: duck, verbIn: verbIn, noise: noise };
    use(graph(c, c.destination), c);
    var s = prepare(SONGS[id]), t = 0.05;
    for (var i = 0; i < bars * 16; i++) { playStep(s, i, t + (i % 2 ? s.swing * stepLen(s) : 0)); t += stepLen(s); }
    ctx = saved.ctx; out = saved.out; comp = saved.comp; bus = saved.bus; mix = saved.mix; duck = saved.duck; verbIn = saved.verbIn; noise = saved.noise;
    return c.startRendering();
  }

  return { start: start, stop: stop, setMood: setMood, playing: function () { return playing; }, song: function () { return track ? 'file:' + track.mood : songId; }, songs: SONGS, _render: render };
})();
