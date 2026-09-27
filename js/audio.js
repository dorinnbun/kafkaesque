/* Generative score. No samples: every sound is synthesised so the dread can
   respond continuously to the state of the world.
   - drone:   detuned saws through a resonant low-pass; opens up as dread rises
   - shepard: an endlessly rising tone (the anxiety that never resolves)
   - heart:   a sub-bass pulse whose tempo follows dread
   - bed:     brown-noise wind, per scene
   - events:  braam, typewriter, knock, bell, chime (hope), whisper, step */
(function () {
  const A = (window.KAudio = {});
  let ctx = null, master, bus, reverbSend;
  let drone, shep, bed, layers = {};
  let heartTimer = 0, shepPhase = 0;
  A.muted = false;

  function impulse(seconds, decay) {
    const rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }
  function noise(seconds, brown) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w;
    }
    return buf;
  }
  function out(node, wet) {
    node.connect(bus);
    if (wet) { const g = ctx.createGain(); g.gain.value = wet; node.connect(g); g.connect(reverbSend); }
  }

  A.init = function () {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -16; comp.ratio.value = 5; comp.attack.value = 0.01; comp.release.value = 0.4;
    master.connect(comp); comp.connect(ctx.destination);
    bus = ctx.createGain(); bus.connect(master);
    const verb = ctx.createConvolver(); verb.buffer = impulse(5.5, 2.4);
    reverbSend = ctx.createGain(); reverbSend.gain.value = 0.9;
    reverbSend.connect(verb); verb.connect(master);
    A.white = noise(2, false);
    A.brown = noise(6, true);
    buildDrone(); buildShepard(); buildBed(); buildLayers();
    master.gain.setTargetAtTime(A.muted ? 0 : 0.85, ctx.currentTime, 1.2);
  };

  A.setMuted = function (m) {
    A.muted = m;
    if (ctx) master.gain.setTargetAtTime(m ? 0 : 0.85, ctx.currentTime, 0.3);
  };

  function buildDrone() {
    const g = ctx.createGain(); g.gain.value = 0;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 160; f.Q.value = 7;
    const oscs = [];
    [[1, 'sawtooth', 0.16], [1.004, 'sawtooth', 0.16], [1.498, 'sawtooth', 0.08], [0.5, 'sine', 0.5], [2.01, 'triangle', 0.03]]
      .forEach(([m, type, lv]) => {
        const o = ctx.createOscillator(); o.type = type; o.frequency.value = 55 * m;
        const og = ctx.createGain(); og.gain.value = lv;
        o.connect(og); og.connect(f); o.start();
        oscs.push({ o, m });
      });
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06;
    const lg = ctx.createGain(); lg.gain.value = 50;
    lfo.connect(lg); lg.connect(f.frequency); lfo.start();
    f.connect(g); out(g, 0.5);
    drone = { g, f, oscs, base: 55, level: 0.5 };
  }

  function buildShepard() {
    const g = ctx.createGain(); g.gain.value = 0;
    const voices = [];
    for (let k = 0; k < 7; k++) {
      const o = ctx.createOscillator(); o.type = 'sine';
      const vg = ctx.createGain(); vg.gain.value = 0;
      o.connect(vg); vg.connect(g); o.start();
      voices.push({ o, vg, k });
    }
    out(g, 0.7);
    shep = { g, voices };
  }

  function buildBed() {
    const src = ctx.createBufferSource(); src.buffer = A.brown; src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500;
    const g = ctx.createGain(); g.gain.value = 0;
    src.connect(f); f.connect(g); out(g, 0.3); src.start();
    bed = { g, f };
  }

  // Sustained scene-specific textures, faded in and out by name.
  function buildLayers() {
    // telephone: "the humming of countless childlike voices"
    const phone = ctx.createGain(); phone.gain.value = 0;
    for (let i = 0; i < 10; i++) {
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.value = 330 * Math.pow(2, (Math.random() * 7 - 1) / 12) * (i % 3 === 0 ? 2 : 1);
      const v = ctx.createOscillator(); v.frequency.value = 4 + Math.random() * 3;
      const vg = ctx.createGain(); vg.gain.value = 3 + Math.random() * 4;
      v.connect(vg); vg.connect(o.frequency); v.start();
      const og = ctx.createGain(); og.gain.value = 0.03;
      o.connect(og); og.connect(phone); o.start();
    }
    out(phone, 1.2);
    // mains: the electrical hum of screens
    const mains = ctx.createGain(); mains.gain.value = 0;
    const mo = ctx.createOscillator(); mo.type = 'square'; mo.frequency.value = 50;
    const mf = ctx.createBiquadFilter(); mf.type = 'bandpass'; mf.frequency.value = 150; mf.Q.value = 3;
    mo.connect(mf); mf.connect(mains); mo.start();
    out(mains, 0.3);
    // heat: a thin high whine, tinnitus in the July sun
    const heat = ctx.createGain(); heat.gain.value = 0;
    const ho = ctx.createOscillator(); ho.frequency.value = 5800;
    const hg = ctx.createGain(); hg.gain.value = 0.012;
    ho.connect(hg); hg.connect(heat); ho.start();
    out(heat, 0.2);
    // light: a warm chord for the door's radiance
    const light = ctx.createGain(); light.gain.value = 0;
    [130.81, 196, 261.63, 329.63, 392].forEach((fq) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = fq;
      const og = ctx.createGain(); og.gain.value = 0.05; o.connect(og); og.connect(light); o.start();
    });
    out(light, 1.5);
    layers = { phone, mains, heat, light };
  }

  A.layer = function (name, level, time) {
    if (!ctx || !layers[name]) return;
    layers[name].gain.setTargetAtTime(level, ctx.currentTime, time || 0.8);
  };

  A.setScene = function (cfg) {
    if (!ctx) return;
    const t = ctx.currentTime;
    drone.base = cfg.drone || 55;
    drone.level = cfg.droneLevel == null ? 0.5 : cfg.droneLevel;
    drone.oscs.forEach(({ o, m }) => o.frequency.setTargetAtTime(drone.base * m, t, 2));
    bed.g.gain.setTargetAtTime(cfg.wind == null ? 0.25 : cfg.wind, t, 1.5);
    bed.f.frequency.setTargetAtTime(cfg.windTone || 500, t, 1.5);
    Object.keys(layers).forEach((k) => A.layer(k, (cfg.layers && cfg.layers[k]) || 0, 1.5));
  };

  A.quiet = function (time) {
    if (!ctx) return;
    const t = ctx.currentTime;
    drone.g.gain.setTargetAtTime(0.0001, t, time || 1);
    shep.g.gain.setTargetAtTime(0, t, time || 1);
    bed.g.gain.setTargetAtTime(0.05, t, time || 1);
    Object.keys(layers).forEach((k) => A.layer(k, 0, time || 1));
    drone.level = 0;
  };

  // Called every frame with the current dread (0..1).
  A.update = function (dt, dread, active) {
    if (!ctx) return;
    const t = ctx.currentTime;
    const d = Math.max(0, Math.min(1, dread));
    drone.g.gain.setTargetAtTime(drone.level * (0.55 + d * 0.6), t, 0.3);
    drone.f.frequency.setTargetAtTime(110 + d * d * 1300, t, 0.4);
    // Shepard: rises forever, faster as the walls close
    shepPhase = (shepPhase + dt * (0.015 + d * 0.06)) % 1;
    const lv = active ? Math.pow(d, 1.6) * 0.14 : 0;
    shep.g.gain.setTargetAtTime(lv, t, 0.4);
    shep.voices.forEach((v) => {
      const pos = (v.k + shepPhase) / shep.voices.length;
      const fq = 55 * Math.pow(2, v.k + shepPhase);
      v.o.frequency.setTargetAtTime(fq, t, 0.05);
      const amp = Math.exp(-Math.pow((pos - 0.5) * 3.2, 2));
      v.vg.gain.setTargetAtTime(amp * 0.25, t, 0.05);
    });
    // heart
    if (active && d > 0.12) {
      heartTimer -= dt;
      if (heartTimer <= 0) {
        heartTimer = 1.5 - d * 1.05;
        beat(0.5 + d * 0.6);
      }
    }
  };

  function thump(when, freq, gain, len) {
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(freq, when);
    o.frequency.exponentialRampToValueAtTime(freq * 0.55, when + len);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + len);
    o.connect(g); out(g, 0.1);
    o.start(when); o.stop(when + len + 0.05);
  }
  function beat(v) {
    const t = ctx.currentTime;
    thump(t, 62, 0.55 * v, 0.22);
    thump(t + 0.2, 55, 0.38 * v, 0.25);
  }

  function burst(when, dur, type, freq, q, gain, wet) {
    const s = ctx.createBufferSource(); s.buffer = A.white;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    s.connect(f); f.connect(g); out(g, wet || 0);
    s.start(when, Math.random() * 1.5); s.stop(when + dur + 0.02);
  }

  // Hans Zimmer / Jóhann Jóhannsson brass: distorted low saws with a slow filter swell.
  A.braam = function (strength) {
    if (!ctx) return;
    const s = strength || 1, t = ctx.currentTime;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.Q.value = 4;
    f.frequency.setValueAtTime(80, t);
    f.frequency.exponentialRampToValueAtTime(900 * s, t + 0.6);
    f.frequency.exponentialRampToValueAtTime(90, t + 4);
    const ws = ctx.createWaveShaper();
    const curve = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; curve[i] = Math.tanh(x * 3); }
    ws.curve = curve;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.45 * s, t + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
    [36.7, 36.9, 55, 73.4].forEach((fq) => {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fq;
      o.connect(ws); o.start(t); o.stop(t + 4.6);
    });
    ws.connect(f); f.connect(g); out(g, 0.8);
  };

  A.type = function () {
    if (!ctx) return;
    const t = ctx.currentTime;
    burst(t, 0.03, 'bandpass', 1800 + Math.random() * 1600, 2, 0.08, 0.05);
    thump(t, 140 + Math.random() * 40, 0.04, 0.04);
  };

  A.knock = function () {
    if (!ctx) return;
    const t = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const w = t + i * 0.22 + Math.random() * 0.03;
      thump(w, 110, 0.6, 0.12);
      burst(w, 0.08, 'lowpass', 700, 1, 0.3, 0.4);
    }
  };

  A.step = function (soft) {
    if (!ctx) return;
    burst(ctx.currentTime, 0.07, 'lowpass', soft ? 380 : 650, 1, soft ? 0.06 : 0.1, 0.1);
  };

  A.bell = function () {
    if (!ctx) return;
    const t = ctx.currentTime;
    [1, 2.76, 5.4, 8.93].forEach((m, i) => {
      const o = ctx.createOscillator(); o.frequency.value = 1320 * m;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12 / (i + 1), t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8 / (i + 1));
      o.connect(g); out(g, 0.9); o.start(t); o.stop(t + 2);
    });
  };

  // Hope. The only consonant sound in the whole score.
  A.chime = function () {
    if (!ctx) return;
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((fq, i) => {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = fq;
      const g = ctx.createGain();
      const w = t + i * 0.11;
      g.gain.setValueAtTime(0.0001, w);
      g.gain.exponentialRampToValueAtTime(0.09, w + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, w + 4);
      o.connect(g); out(g, 1.4); o.start(w); o.stop(w + 4.2);
    });
  };

  A.whisper = function () {
    if (!ctx) return;
    const t = ctx.currentTime;
    const s = ctx.createBufferSource(); s.buffer = A.white;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 1.5;
    const trem = ctx.createGain(); trem.gain.value = 0;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 9;
    const lg = ctx.createGain(); lg.gain.value = 0.05;
    lfo.connect(lg); lg.connect(trem.gain);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(1, t + 0.3);
    g.gain.linearRampToValueAtTime(0.0001, t + 1.6);
    s.connect(f); f.connect(trem); trem.connect(g); out(g, 1);
    s.start(t); s.stop(t + 1.7); lfo.start(t); lfo.stop(t + 1.7);
  };

  A.slam = function () {
    if (!ctx) return;
    const t = ctx.currentTime;
    thump(t, 70, 0.9, 0.8);
    burst(t, 0.9, 'lowpass', 400, 1, 0.5, 1);
  };
})();
