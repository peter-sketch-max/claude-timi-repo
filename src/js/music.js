// Background music: a cheerful chiptune loop made live with Web Audio, so there are no song files
// and no copyright problems. Melody, bass and drums are scheduled a little ahead of time.
var CS = globalThis.CS = globalThis.CS || {};

CS.Music = (function () {
  var ctx = null, master = null, noise = null, timer = null, playing = false;
  var step = 0, nextTime = 0;
  var BPM = 118, STEP = 60 / BPM / 4; // sixteenth notes

  // 8 bars x 16 steps. Numbers are MIDI notes, 0 = rest.
  var MELODY = [
    [72, 0, 76, 0, 79, 0, 76, 0, 77, 0, 76, 0, 74, 0, 0, 0],
    [72, 0, 69, 0, 72, 0, 76, 0, 74, 0, 72, 0, 69, 0, 0, 0],
    [69, 0, 72, 0, 77, 0, 76, 0, 74, 0, 72, 0, 74, 0, 76, 0],
    [74, 0, 0, 0, 71, 0, 74, 0, 79, 0, 0, 0, 77, 76, 74, 0],
    [77, 0, 76, 0, 74, 0, 72, 0, 74, 0, 76, 0, 77, 0, 79, 0],
    [79, 0, 77, 0, 76, 0, 74, 0, 71, 0, 74, 0, 79, 0, 0, 0],
    [76, 0, 79, 0, 84, 0, 79, 0, 76, 0, 74, 0, 71, 0, 0, 0],
    [72, 0, 74, 0, 76, 0, 74, 0, 72, 0, 0, 0, 79, 77, 76, 74]
  ];
  var ROOTS = [48, 45, 41, 43, 41, 43, 40, 45]; // C Am F G F G Em Am

  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  function setup() {
    if (ctx) return true;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return false; }
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    var d = noise.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return true;
  }

  function tone(freq, t, dur, type, vol) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function hit(t, vol, hp, dur) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; f.type = 'highpass'; f.frequency.value = hp;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t); s.stop(t + dur + 0.02);
  }
  function kick(t) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.2);
  }

  function schedule() {
    while (nextTime < ctx.currentTime + 0.12) {
      var bar = Math.floor(step / 16) % 8, s = step % 16, n = MELODY[bar][s];
      if (n) {
        var len = 1; while (s + len < 16 && !MELODY[bar][s + len] && len < 4) len++;
        tone(hz(n), nextTime, STEP * len * 0.9, 'square', 0.028);
        tone(hz(n + 12), nextTime, STEP * 0.6, 'triangle', 0.012);
      }
      var root = ROOTS[bar];
      if (s % 4 === 0) tone(hz(s % 8 === 0 ? root : root + 7), nextTime, STEP * 3, 'triangle', 0.07);
      if (s === 0 || s === 8) kick(nextTime);
      if (s === 4 || s === 12) hit(nextTime, 0.05, 1500, 0.12);
      if (s % 2 === 0) hit(nextTime, 0.015, 7000, 0.04);
      nextTime += STEP;
      step++;
    }
  }

  function start() {
    if (playing || !setup()) return;
    if (ctx.state === 'suspended') ctx.resume();
    playing = true;
    nextTime = ctx.currentTime + 0.05;
    timer = setInterval(schedule, 30);
  }
  function stop() {
    playing = false;
    if (timer) clearInterval(timer);
    timer = null;
  }

  // Pause when the app goes to the background.
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function () {
      if (!ctx) return;
      if (document.hidden) { stop(); ctx.suspend(); }
      else if (CS.S && CS.S.settings && CS.S.settings.music && CS.S.started) { ctx.resume(); start(); }
    });
  }

  return { start: start, stop: stop, playing: function () { return playing; } };
})();
