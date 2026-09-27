/* Drawing toolkit. The world is drawn in a virtual space 1000 units high;
   width depends on the screen. Villeneuve grammar: vast monoliths, fog,
   one dominant colour per place, a tiny human figure, hard light. */
(function () {
  const R = (window.KRender = {});
  R.H = 1000;
  R.GROUND = 790;

  R.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  R.lerp = (a, b, t) => a + (b - a) * t;
  R.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // --- film grain: a few pre-rendered frames cycled ---
  const grain = [];
  R.initGrain = function () {
    for (let f = 0; f < 4; f++) {
      const c = document.createElement('canvas');
      c.width = c.height = 192;
      const x = c.getContext('2d');
      const img = x.createImageData(192, 192);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      x.putImageData(img, 0, 0);
      grain.push(c);
    }
  };
  R.grain = function (g, w, h, t, amount) {
    if (!grain.length) return;
    const tile = grain[Math.floor(t * 24) % grain.length];
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = amount;
    g.globalCompositeOperation = 'overlay';
    const pat = g.createPattern(tile, 'repeat');
    g.translate((Math.random() * 192) | 0, (Math.random() * 192) | 0);
    g.fillStyle = pat;
    g.fillRect(-192, -192, w + 384, h + 384);
    g.restore();
  };

  // --- primitives in virtual space ---
  R.sky = function (g, v, stops) {
    const gr = g.createLinearGradient(0, 0, 0, R.H);
    stops.forEach(([o, c]) => gr.addColorStop(o, c));
    g.fillStyle = gr;
    g.fillRect(-10, -10, v.w + 20, R.H + 20);
  };

  R.ground = function (g, v, top, bottom, y) {
    const gy = y == null ? R.GROUND : y;
    const gr = g.createLinearGradient(0, gy, 0, R.H);
    gr.addColorStop(0, top); gr.addColorStop(1, bottom);
    g.fillStyle = gr;
    g.fillRect(-10, gy, v.w + 20, R.H - gy + 10);
  };

  // horizontal fog band
  R.fog = function (g, v, y, h, color, alpha) {
    g.save();
    g.globalAlpha = alpha;
    const gr = g.createLinearGradient(0, y - h / 2, 0, y + h / 2);
    gr.addColorStop(0, 'rgba(0,0,0,0)');
    gr.addColorStop(0.5, color);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(-10, y - h / 2, v.w + 20, h);
    g.restore();
  };

  // drifting soft fog masses
  R.fogDrift = function (g, v, seed, count, y, spread, color, alpha, speed) {
    const r = R.rng(seed);
    g.save();
    for (let i = 0; i < count; i++) {
      const baseX = r() * (v.w + 1200) - 600;
      const x = ((baseX + v.t * speed * (0.5 + r()) - v.camX * 0.3) % (v.w + 1200) + v.w + 1200) % (v.w + 1200) - 600;
      const yy = y + (r() - 0.5) * spread;
      const rad = 260 + r() * 420;
      const gr = g.createRadialGradient(x, yy, 0, x, yy, rad);
      gr.addColorStop(0, color);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = alpha * (0.5 + r() * 0.5);
      g.fillStyle = gr;
      g.fillRect(x - rad, yy - rad, rad * 2, rad * 2);
    }
    g.restore();
  };

  // light shaft from above
  R.shaft = function (g, x, topW, botW, y0, y1, color, alpha) {
    g.save();
    g.globalCompositeOperation = 'screen';
    g.globalAlpha = alpha;
    const gr = g.createLinearGradient(0, y0, 0, y1);
    gr.addColorStop(0, color);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(x - topW / 2, y0); g.lineTo(x + topW / 2, y0);
    g.lineTo(x + botW / 2, y1); g.lineTo(x - botW / 2, y1);
    g.closePath(); g.fill();
    g.restore();
  };

  R.glow = function (g, x, y, rad, color, alpha) {
    g.save();
    g.globalCompositeOperation = 'screen';
    g.globalAlpha = alpha;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, color);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    g.restore();
  };

  R.rect = function (g, x, y, w, h, color) { g.fillStyle = color; g.fillRect(x, y, w, h); };

  // screen x for a world x at parallax p
  R.sx = (v, x, p) => x - v.camX * (p == null ? 1 : p);

  // --- figures ---
  // K.: long coat, bowler hat. Tiny against everything.
  R.figure = function (g, x, y, s, t, walking, dir, color, opts) {
    opts = opts || {};
    const c = color || '#050606';
    const ph = walking ? t * 7.5 : 0;
    const stoop = opts.stoop || 0;
    g.save();
    g.translate(x, y);
    g.scale(dir < 0 ? -1 : 1, 1);
    g.fillStyle = c; g.strokeStyle = c;
    g.lineCap = 'round';
    // legs
    g.lineWidth = 3.2 * s;
    const sw = walking ? Math.sin(ph) * 6 * s : 0;
    g.beginPath();
    g.moveTo(-1 * s, -16 * s); g.lineTo(-1 * s + sw, 0);
    g.moveTo(1 * s, -16 * s); g.lineTo(1 * s - sw, 0);
    g.stroke();
    // coat
    const bob = walking ? Math.abs(Math.sin(ph)) * 1.2 * s : 0;
    g.beginPath();
    g.moveTo(-5 * s + stoop * s, -40 * s - bob);
    g.lineTo(5 * s + stoop * s, -40 * s - bob);
    g.lineTo(7 * s, -13 * s);
    g.lineTo(-7 * s, -13 * s);
    g.closePath(); g.fill();
    // head
    g.beginPath();
    g.arc(0.5 * s + stoop * 1.6 * s, -44.5 * s - bob, 3.6 * s, 0, Math.PI * 2);
    g.fill();
    // bowler hat
    g.beginPath();
    g.ellipse(0.5 * s + stoop * 1.6 * s, -47 * s - bob, 5.4 * s, 1.1 * s, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.arc(0.5 * s + stoop * 1.6 * s, -47.5 * s - bob, 3.4 * s, Math.PI, 0);
    g.fill();
    g.restore();
  };

  // A body that is no longer yours.
  R.beetle = function (g, x, y, s, t, moving, dir, color) {
    const c = color || '#050606';
    g.save();
    g.translate(x, y);
    g.scale(dir < 0 ? -1 : 1, 1);
    g.strokeStyle = c; g.fillStyle = c;
    g.lineWidth = 1.6 * s;
    for (let i = 0; i < 6; i++) {
      const lx = -14 * s + i * 5.5 * s;
      const k = moving ? Math.sin(t * 22 + i * 1.7) * 3 * s : Math.sin(t * 2 + i) * 0.6 * s;
      g.beginPath();
      g.moveTo(lx, -6 * s);
      g.lineTo(lx + k - 2 * s, -2 * s);
      g.lineTo(lx + k + 1 * s, 0);
      g.stroke();
    }
    g.beginPath();
    g.ellipse(0, -9 * s, 19 * s, 8.5 * s, 0, Math.PI, 0);
    g.lineTo(19 * s, -6 * s);
    g.lineTo(-19 * s, -6 * s);
    g.fill();
    // segments
    g.strokeStyle = 'rgba(80,90,90,0.35)';
    g.lineWidth = 0.8 * s;
    for (let i = -2; i <= 2; i++) {
      g.beginPath();
      g.moveTo(i * 6 * s, -16.5 * s + Math.abs(i) * 1.2 * s);
      g.lineTo(i * 6.5 * s, -6.5 * s);
      g.stroke();
    }
    // head + antennae
    g.fillStyle = c; g.strokeStyle = c;
    g.beginPath(); g.arc(20 * s, -8 * s, 3.5 * s, 0, Math.PI * 2); g.fill();
    g.lineWidth = 0.9 * s;
    const aw = Math.sin(t * 3) * 2 * s;
    g.beginPath();
    g.moveTo(22 * s, -10 * s); g.quadraticCurveTo(28 * s, -18 * s, 32 * s + aw, -15 * s);
    g.moveTo(21 * s, -10 * s); g.quadraticCurveTo(25 * s, -20 * s, 29 * s - aw, -20 * s);
    g.stroke();
    g.restore();
  };

  // hope: a tiny sodium ember, the smallest bright thing in any frame
  R.ember = function (g, x, y, t, strength) {
    const s = strength == null ? 1 : strength;
    const p = 0.75 + Math.sin(t * 2.3) * 0.15 + Math.sin(t * 7.1) * 0.05;
    R.glow(g, x, y, 70 * s, 'rgba(230,140,60,0.9)', 0.35 * p * s);
    R.glow(g, x, y, 16 * s, 'rgba(255,200,130,1)', 0.9 * p * s);
    g.save();
    g.fillStyle = 'rgba(255,230,190,' + (0.95 * s) + ')';
    g.beginPath(); g.arc(x, y, 2.2, 0, Math.PI * 2); g.fill();
    g.restore();
  };

  // --- particles ---
  R.Particles = function (kind, count, seed) {
    const r = R.rng(seed || 7);
    this.kind = kind;
    this.p = [];
    for (let i = 0; i < count; i++) {
      this.p.push({ x: r(), y: r(), z: 0.3 + r() * 0.9, s: r(), o: r() * Math.PI * 2 });
    }
  };
  R.Particles.prototype.draw = function (g, v, dt) {
    const k = this.kind;
    if (k === 'none') return;
    const W = v.w + 80;
    g.save();
    for (const q of this.p) {
      let vx = 0, vy = 0, size = 1.4, col = 'rgba(200,200,195,0.5)';
      if (k === 'snow') { vx = -18 + Math.sin(v.t * 0.7 + q.o) * 20; vy = 55; size = 1.2 + q.z * 2.4; col = 'rgba(235,236,238,' + (0.35 + q.z * 0.5) + ')'; }
      else if (k === 'ash') { vx = 8; vy = 14; size = 1 + q.z * 1.6; col = 'rgba(160,156,148,' + (0.2 + q.z * 0.35) + ')'; }
      else if (k === 'dust') { vx = 5 + Math.sin(v.t * 0.3 + q.o) * 6; vy = -3 + Math.cos(v.t * 0.4 + q.o) * 5; size = 0.8 + q.z * 1.4; col = 'rgba(240,210,160,' + (0.15 + q.z * 0.35) + ')'; }
      else if (k === 'rain') { vx = -30; vy = 700; size = 1; col = 'rgba(170,185,195,' + (0.12 + q.z * 0.2) + ')'; }
      q.x += (vx * q.z * dt) / W;
      q.y += (vy * q.z * dt) / R.H;
      if (q.y > 1.02) q.y -= 1.04;
      if (q.y < -0.02) q.y += 1.04;
      const px = ((((q.x - (v.camX * q.z * 0.6) / W) % 1) + 1) % 1) * W - 40;
      const py = q.y * R.H;
      g.fillStyle = col;
      if (k === 'rain') { g.fillRect(px, py, 1, 16 * q.z); }
      else { g.beginPath(); g.arc(px, py, size, 0, Math.PI * 2); g.fill(); }
    }
    g.restore();
  };

  // --- the closing: letterbox + converging walls, driven by dread ---
  R.closing = function (g, W, H, dread, t) {
    const d = R.clamp(dread, 0, 1);
    // Cinemascope on landscape screens; on a portrait phone, thin bars only.
    const scopeH = W / H < 1.3 ? H * 0.84 : Math.min(H, W / 2.39);
    const base = Math.max(0, (H - scopeH) / 2);
    const bar = base + d * d * (H / 2 - base) * 0.9;
    const side = d * d * W * 0.42;
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#000';
    g.fillRect(0, 0, W, bar);
    g.fillRect(0, H - bar, W, bar);
    if (side > 1) {
      const gl = g.createLinearGradient(0, 0, side, 0);
      gl.addColorStop(0, 'rgba(0,0,0,1)'); gl.addColorStop(0.75, 'rgba(0,0,0,0.92)'); gl.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gl; g.fillRect(0, 0, side, H);
      const gr = g.createLinearGradient(W, 0, W - side, 0);
      gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.75, 'rgba(0,0,0,0.92)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(W - side, 0, side, H);
    }
    // vignette
    const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,' + (0.55 + d * 0.3) + ')');
    g.fillStyle = vg; g.fillRect(0, 0, W, H);
    g.restore();
    return bar;
  };
})();
