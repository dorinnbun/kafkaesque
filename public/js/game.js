/* The process. State machine, input, narration, the archive, the ending. */
(function () {
  const R = window.KRender, A = window.KAudio, S = window.KStory, SC = window.KScenes;
  const $ = (id) => document.getElementById(id);
  const cvs = $('stage'), g = cvs.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touchy = 'ontouchstart' in window || window.matchMedia('(pointer: coarse)').matches;

  // ---------------------------------------------------------------- save
  const KEY = 'dossier-of-k-v1';
  function fresh() { return { prologue: false, filed: {}, embers: {}, stance: { obey: 0, defy: 0, love: 0 } }; }
  let save = fresh();
  try { const raw = localStorage.getItem(KEY); if (raw) save = Object.assign(fresh(), JSON.parse(raw)); } catch (e) { /* storage unavailable */ }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* ignore */ } }

  // ---------------------------------------------------------------- canvas
  let cssW = 0, cssH = 0, dpr = 1;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = window.innerWidth; cssH = window.innerHeight;
    cvs.width = Math.round(cssW * dpr); cvs.height = Math.round(cssH * dpr);
  }
  window.addEventListener('resize', resize);
  resize();
  R.initGrain();

  // ---------------------------------------------------------------- input
  const input = { left: false, right: false, act: false, actEdge: false, taps: [] };
  const LEFT = ['ArrowLeft', 'a', 'A'], RIGHT = ['ArrowRight', 'd', 'D'], ACT = ['e', 'E', ' ', 'ArrowUp', 'w', 'W'];

  window.addEventListener('keydown', (ev) => {
    const k = ev.key;
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(k) && ev.target === document.body) ev.preventDefault();
    if (k === 'm' || k === 'M') { toggleMute(); return; }
    if (choiceOpen) {
      const n = parseInt(k, 10);
      if (n >= 1 && n <= choiceOpen.length) choiceOpen.pick(n - 1);
      return;
    }
    if (interro.open && (k === 'Enter' || k === ' ')) { ev.preventDefault(); interro.skip(); return; }
    if (k === 'Enter') { skipNarration(); return; }
    if (LEFT.includes(k)) { if (!ev.repeat) input.taps.push(-1); input.left = true; }
    if (RIGHT.includes(k)) { if (!ev.repeat) input.taps.push(1); input.right = true; }
    if (ACT.includes(k)) { if (!input.act) input.actEdge = true; input.act = true; }
  });
  window.addEventListener('keyup', (ev) => {
    const k = ev.key;
    if (LEFT.includes(k)) input.left = false;
    if (RIGHT.includes(k)) input.right = false;
    if (ACT.includes(k)) input.act = false;
  });
  window.addEventListener('blur', () => { input.left = input.right = input.act = false; });

  function holdButton(el, down, up) {
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.classList.add('held'); down(); try { el.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } });
    const end = () => { el.classList.remove('held'); up(); };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }
  holdButton($('tLeft'), () => { input.taps.push(-1); input.left = true; }, () => { input.left = false; });
  holdButton($('tRight'), () => { input.taps.push(1); input.right = true; }, () => { input.right = false; });
  holdButton($('tAct'), () => { if (!input.act) input.actEdge = true; input.act = true; }, () => { input.act = false; });
  cvs.addEventListener('pointerdown', () => skipNarration());

  // ---------------------------------------------------------------- mute
  function toggleMute() {
    A.setMuted(!A.muted);
    $('mute').textContent = A.muted ? 'sound off' : 'sound on';
    $('mute').setAttribute('aria-pressed', String(A.muted));
  }
  $('mute').addEventListener('click', toggleMute);

  // ---------------------------------------------------------------- narration
  const narrEl = $('narrLine'), hintEl = $('narrHint');
  const narr = { queue: [], cur: null, shown: 0, hold: 0, busy: false, resolvers: [], ticks: 0 };
  function norm(l) { return typeof l === 'string' ? { t: l, kind: '' } : l; }
  function say(lines) {
    return new Promise((res) => {
      const old = narr.resolvers; narr.resolvers = [res];
      old.forEach((r) => r());
      narr.queue = lines.map(norm);
      narr.cur = null; narr.busy = true;
    });
  }
  function skipNarration() {
    if (!narr.cur) return;
    if (narr.shown < narr.cur.t.length) narr.shown = narr.cur.t.length;
    else narr.hold = 0;
  }
  function narrUpdate(dt) {
    if (!narr.cur) {
      if (narr.queue.length) {
        narr.cur = narr.queue.shift();
        narr.shown = 0; narr.ticks = 0;
        narr.hold = 1.8 + narr.cur.t.length * 0.034;
        narrEl.className = narr.cur.kind || '';
      } else {
        if (narr.busy) {
          narr.busy = false; narrEl.textContent = '';
          const rs = narr.resolvers; narr.resolvers = []; rs.forEach((r) => r());
        }
        return;
      }
    }
    const len = narr.cur.t.length;
    if (narr.shown < len) {
      narr.shown = Math.min(len, narr.shown + dt * 40);
      const n = Math.floor(narr.shown);
      if (n - narr.ticks >= 3) { narr.ticks = n; A.type(); }
      narrEl.textContent = narr.cur.t.slice(0, n);
    } else {
      narrEl.textContent = narr.cur.t;
      narr.hold -= dt;
      if (narr.hold <= 0) { narr.cur = null; narrEl.textContent = ''; }
    }
  }
  let hintTimer = 0;
  function setHint(t, secs) { hintEl.textContent = t || ''; hintTimer = secs || 14; }

  // ---------------------------------------------------------------- choice
  let choiceOpen = null;
  function choose(prompt, options) {
    return new Promise((res) => {
      const box = $('choice'), wrap = $('choiceOptions');
      $('choicePrompt').textContent = prompt;
      wrap.innerHTML = '';
      const pick = (i) => {
        if (!choiceOpen) return;
        choiceOpen = null; box.hidden = true;
        res(options[i]);
      };
      options.forEach((o, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'opt'; b.id = 'opt' + i;
        b.innerHTML = '<span class="n">' + (i + 1) + '</span><span></span>';
        b.lastChild.textContent = o.t;
        b.addEventListener('click', () => pick(i));
        wrap.appendChild(b);
      });
      box.hidden = false;
      choiceOpen = { length: options.length, pick };
      A.braam(0.5);
      setTimeout(() => { const f = $('opt0'); if (f) f.focus({ preventScroll: true }); }, 50);
    });
  }

  // ---------------------------------------------------------------- fades
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function fadeOut() { $('fade').classList.add('on'); await sleep(1300); }
  function fadeIn() { $('fade').classList.remove('on'); }

  // ---------------------------------------------------------------- the world
  const player = { x: 0, vx: 0, dir: 1, walking: false, dist: 0 };
  let scene = null, sceneId = null, dread = 0, relief = 0, locked = false, finished = false;
  let camX = 0, t = 0, sceneResolve = null, emberT = 0;

  const G = {
    player,
    say,
    narrating: () => narr.busy,
    addDread(x) { dread = R.clamp(dread + x, 0, 1); },
    floorDread(x) { const f = x - relief; if (dread < f) dread = R.clamp(f, 0, 1); },
    setCounter(txt) { const c = $('counter'); c.hidden = false; c.textContent = txt; },
    finish() {
      if (finished) return;
      finished = true; locked = true;
      if (sceneResolve) sceneResolve({ collapsed: false });
    },
    ember() {
      const idx = S.chrono.indexOf(sceneId);
      if (idx >= 0) { save.embers[sceneId] = true; persist(); }
      dread = Math.max(0, dread - 0.25); relief += 0.2;
      A.chime();
      const w = $('emberWord');
      w.textContent = idx >= 0 ? S.hope[idx] : '';
      w.classList.remove('show'); void w.offsetWidth; w.classList.add('show');
      emberT = 1;
    },
    async cut(fn, secs) {
      $('fade').classList.add('on');
      await sleep((secs || 0.8) * 700);
      fn();
      camX = player.x - viewW() * 0.42;
      fadeIn();
    }
  };

  function viewScale() { return cssH / R.H; }
  function viewW() { return cssW / viewScale(); }

  function startScene(sc, id, opts) {
    scene = sc; sceneId = id;
    player.x = sc.start; player.vx = 0; player.dir = 1; player.walking = false; player.dist = 0;
    dread = opts.dread || 0.05; relief = 0; locked = false; finished = false;
    camX = player.x - viewW() * 0.42;
    A.setScene(sc.audio);
    $('hud').hidden = false;
    $('caseLabel').textContent = opts.label || '';
    $('counter').hidden = true;
    $('touch').hidden = !touchy;
    return new Promise((res) => { sceneResolve = res; });
  }
  function endScene() {
    scene = null; sceneId = null;
    $('hud').hidden = true; $('prompt').hidden = true; $('touch').hidden = true;
    setHint('');
    A.quiet(1.5);
  }

  async function collapse() {
    if (finished) return;
    finished = true; locked = true;
    A.braam(1.3);
    const F = S.fragments[sceneId];
    if (F) await say([F.collapse]);
    if (sceneResolve) sceneResolve({ collapsed: true });
  }

  // ---------------------------------------------------------------- update
  let near = null;
  function update(dt) {
    const sc = scene;
    const vw = viewW();
    const v = { w: vw, camX, t, dread, dt };

    // movement
    let dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    if (locked) dir = 0;
    if (sc.mode === 'tap') {
      if (!locked) input.taps.forEach((d) => { player.vx = R.clamp(player.vx + d * sc.speed * 0.85, -sc.speed * 1.4, sc.speed * 1.4); player.dir = d; });
      player.vx *= Math.pow(0.04, dt);
    } else {
      player.vx = R.lerp(player.vx, dir * sc.speed, Math.min(1, dt * 7));
      if (dir) player.dir = dir;
    }
    input.taps.length = 0;
    const b = sc.bounds ? sc.bounds() : [20, sc.length - 20];
    const nx = R.clamp(player.x + player.vx * dt, b[0], b[1]);
    player.dist += Math.abs(nx - player.x);
    player.x = nx;
    player.walking = Math.abs(player.vx) > 14;
    if (player.dist > (sc.body === 'beetle' ? 30 : 58)) { player.dist = 0; A.step(true); }

    // camera
    if (sc.length <= vw) camX = (sc.length - vw) / 2;
    else camX = R.lerp(camX, R.clamp(player.x - vw * 0.42, 0, sc.length - vw), Math.min(1, dt * 2.2));
    v.camX = camX;

    // dread
    dread = R.clamp(dread + sc.dreadRate * dt, 0, sc.dreadCap || 1);
    if (sc.update) sc.update(dt, v);
    if (sc.dreadCap) dread = Math.min(dread, sc.dreadCap);
    if (dread >= 1 && !sc.noCollapse && !finished) collapse();

    // interaction
    near = null;
    if (!locked) {
      let best = 1e9;
      sc.entities.forEach((e) => {
        if (e.once && e.used) return;
        if (e.visible && !e.visible()) return;
        const d = Math.abs(player.x - e.x);
        if (d < e.r && d < best) { best = d; near = e; }
      });
    }
    sc.entities.forEach((e) => {
      if (e !== near && e.prog) { e.prog = 0; if (e.onHold) e.onHold(false); }
    });
    if (near) {
      if (near.hold) {
        if (input.act) {
          if (!near.prog) { near.prog = 0.0001; if (near.onHold) near.onHold(true); }
          near.prog += dt;
          if (near.holdDread) G.addDread(near.holdDread * dt);
          if (near.prog >= near.hold) { near.prog = 0; if (near.onHold) near.onHold(false); useEnt(near); }
        } else if (near.prog) { near.prog = 0; if (near.onHold) near.onHold(false); }
      } else if (input.actEdge) useEnt(near);
    }
    input.actEdge = false;
    showPrompt(near);
  }
  function useEnt(e) { if (e.once) e.used = true; e.use(); }

  function showPrompt(e) {
    const p = $('prompt');
    if (!e) { p.hidden = true; return; }
    p.hidden = false;
    $('promptText').textContent = e.label;
    p.querySelector('.prompt-key').textContent = touchy ? '•' : 'E';
    const s = viewScale();
    let x = (e.x - camX) * s;
    x = R.clamp(x, 120, cssW - 120);
    p.style.left = x + 'px';
    p.style.top = (R.GROUND - 150) * s + 'px';
    const ring = $('promptRing');
    ring.hidden = !e.hold;
    if (e.hold) ring.style.setProperty('--p', Math.round(((e.prog || 0) / e.hold) * 100) + '%');
  }

  // ---------------------------------------------------------------- draw
  function draw(dt) {
    const sc = scene;
    const s = viewScale() * dpr;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#000'; g.fillRect(0, 0, cvs.width, cvs.height);
    let shx = 0, shy = 0;
    if (!reduced && dread > 0.6) { const k = Math.pow((dread - 0.6) / 0.4, 3) * 4; shx = (Math.random() - 0.5) * k; shy = (Math.random() - 0.5) * k; }
    g.setTransform(s, 0, 0, s, shx * dpr, shy * dpr);
    const v = { w: viewW(), camX, t, dread, dt };
    sc.draw(g, v);
    sc.entities.forEach((e) => {
      if (e.ember && !e.used && (!e.visible || e.visible())) R.ember(g, e.x - camX, e.ey, t, 1);
    });
    const px = player.x - camX;
    R.glow(g, px, R.GROUND - 40, 140, 'rgba(200,195,180,1)', 0.08);
    if (sc.body === 'beetle') R.beetle(g, px, R.GROUND, 1.7, t, player.walking, player.dir);
    else R.figure(g, px, R.GROUND, 1.15, t, player.walking, player.dir, '#040505', { stoop: sc.stoop || 0 });
    if (sc.drawFront) sc.drawFront(g, v);
    sc.particles.draw(g, v, dt);
    if (emberT > 0) { R.glow(g, px, R.GROUND - 60, 400, 'rgba(230,140,60,1)', 0.35 * emberT); emberT = Math.max(0, emberT - dt * 0.5); }
    R.closing(g, cvs.width, cvs.height, dread, t);
    R.grain(g, cvs.width, cvs.height, reduced ? 0 : t, 0.07);
  }

  // ---------------------------------------------------------------- loop
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; t += dt;
    if (scene) { update(dt); draw(dt); }
    narrUpdate(dt);
    if (hintTimer > 0) { hintTimer -= dt; if (hintTimer <= 0) hintEl.textContent = ''; }
    A.update(dt, scene ? dread : 0, !!scene && !scene.noCollapse);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---------------------------------------------------------------- interrogation
  const interro = { open: false, skipping: false, done: null, skip() {
    if (!this.skipping) this.skipping = true; else if (this.done) this.done();
  } };
  async function interrogation(i) {
    const box = $('interrogation'), txt = $('interroText');
    const lines = S.interrogations[Math.min(i, S.interrogations.length - 1)];
    $('interroNo').textContent = 'Vernehmung ' + (i + 1) + ' of 6 · Interrogation';
    txt.innerHTML = '';
    box.hidden = false; interro.open = true; interro.skipping = false;
    fadeIn();
    await sleep(600);
    for (const [kind, line] of lines) {
      const p = document.createElement('p'); p.className = kind; txt.appendChild(p);
      for (let c = 1; c <= line.length; c++) {
        if (interro.skipping) { p.textContent = line; break; }
        p.textContent = line.slice(0, c);
        if (c % 2 === 0) A.type();
        await sleep(30);
      }
      if (!interro.skipping) await sleep(650);
    }
    interro.skipping = true;
    await new Promise((res) => { interro.done = res; setTimeout(res, 5000); });
    interro.done = null; interro.open = false;
    await fadeOut();
    box.hidden = true;
  }

  // ---------------------------------------------------------------- archive
  function filedCount() { return Object.keys(save.filed).length; }
  function renderArchive(order) {
    const ol = $('files');
    ol.innerHTML = '';
    order.forEach((id) => {
      const F = S.fragments[id], f = save.filed[id];
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'file'; b.id = 'file-' + id; b.dataset.id = id;
      b.disabled = !!f;
      const stamp = !f ? ['open', 'OFFEN', 'open'] : f.collapsed ? ['suspended', 'EINGESTELLT', 'proceedings suspended'] : ['filed', 'ABGELEGT', 'filed'];
      b.innerHTML =
        '<span class="year-flag">' + F.year + '</span>' +
        '<span class="az"><span>' + F.az + '</span><span>K.</span></span>' +
        '<span class="ttl"></span><span class="work"></span><span class="when"></span>' +
        '<span class="stamp ' + stamp[0] + '">' + stamp[1] + '<small>' + stamp[2] + '</small></span>';
      b.querySelector('.ttl').textContent = F.title;
      b.querySelector('.work').textContent = F.work;
      b.querySelector('.when').textContent = F.when;
      b.addEventListener('click', () => openFile(id));
      li.appendChild(b); ol.appendChild(li);
    });
    const strip = $('emberStrip');
    strip.innerHTML = '';
    S.chrono.forEach((id, i) => {
      const s = document.createElement('span');
      const got = save.embers[id];
      s.className = got ? 'w' : 'g';
      s.textContent = got ? S.hope[i] : '···';
      strip.appendChild(s);
    });
  }
  function showArchive() {
    $('archive').hidden = false;
    const all = filedCount() >= S.chrono.length;
    renderArchive(S.shown);
    $('files').classList.remove('chrono');
    const btn = $('btnDoor');
    btn.hidden = !all;
    btn.textContent = 'Put the files in order';
    btn.onclick = reassemble;
    $('archiveNote').textContent = all
      ? 'Every file is closed. None of them in order.'
      : 'The files are handed out in no particular order. That is the order. A file, once opened, must be seen through.';
    A.setScene({ drone: 41.2, droneLevel: 0.25, wind: 0.08, windTone: 300 });
    fadeIn();
  }

  function reassemble() {
    const ol = $('files');
    const items = Array.from(ol.children);
    const first = new Map(items.map((li) => [li, li.getBoundingClientRect()]));
    S.chrono.forEach((id) => ol.appendChild($('file-' + id).parentNode));
    ol.classList.add('chrono');
    if (!reduced) {
      items.forEach((li) => {
        const a = first.get(li), bb = li.getBoundingClientRect();
        const el = li.firstChild;
        el.style.transition = 'none';
        el.style.transform = 'translate(' + (a.left - bb.left) + 'px,' + (a.top - bb.top) + 'px)';
      });
      requestAnimationFrame(() => requestAnimationFrame(() => {
        ol.classList.add('reassembling');
        items.forEach((li) => { li.firstChild.style.transition = ''; li.firstChild.style.transform = ''; });
      }));
    }
    A.braam(0.7);
    $('archiveNote').textContent = S.reassembly;
    const btn = $('btnDoor');
    btn.textContent = 'Return to the door';
    btn.onclick = epilogue;
  }

  // ---------------------------------------------------------------- flows
  let busy = false;
  async function prologue() {
    const sc = SC.door(G, 'prologue');
    const done = startScene(sc, 'door', { dread: 0.05, label: 'Prologue\nBefore the Law' });
    fadeIn();
    say(S.prologue.intro);
    setHint(S.prologue.hint + (touchy ? ' On a phone, use the buttons below.' : ''), 20);
    await done;
    await say(S.prologue.gate);
    await fadeOut();
    endScene();
  }

  async function openFile(id) {
    if (busy || save.filed[id]) return;
    busy = true;
    await fadeOut();
    $('archive').hidden = true;
    await interrogation(filedCount());
    const F = S.fragments[id];
    const sc = SC[id](G);
    const done = startScene(sc, id, { dread: 0.06, label: F.az + '\n' + F.title.toUpperCase() + ' · ' + F.when });
    fadeIn();
    say(F.intro);
    setHint(F.hint, 16);
    const res = await done;
    setHint('');
    const pick = await choose(F.choicePrompt, F.options);
    save.filed[id] = { k: pick.k, collapsed: res.collapsed };
    save.stance[pick.k] = (save.stance[pick.k] || 0) + 1;
    persist();
    await say(pick.out);
    await fadeOut();
    endScene();
    busy = false;
    showArchive();
  }

  function dominant() {
    const s = save.stance;
    const best = Math.max(s.obey || 0, s.defy || 0, s.love || 0);
    if ((s.love || 0) === best) return 'love';
    if ((s.defy || 0) === best) return 'defy';
    return 'obey';
  }

  async function epilogue() {
    if (busy) return; busy = true;
    await fadeOut();
    $('archive').hidden = true;
    const sc = SC.door(G, 'epilogue');
    const done = startScene(sc, 'door', { dread: 0.1, label: 'Epilogue\nBefore the Law' });
    fadeIn();
    say(S.epilogue.intro);
    await done;
    await say(S.epilogue.ask);
    const k = dominant();
    const E = S.epilogue.endings[k];
    if (k === 'obey') { sc.targetLight = 0.15; setTimeout(() => A.slam(), 5200); setTimeout(() => { sc.targetLight = 1.4; }, 9000); }
    if (k === 'defy') { sc.targetOpen = 1; sc.targetLight = 0.35; }
    if (k === 'love') { setTimeout(() => { player.dir = -1; sc.companion = true; A.chime(); }, 1800); sc.targetLight = 0.6; }
    await say(E.lines);
    await finale(E.name);
  }

  async function finale(name) {
    A.layer('light', 0.5, 4);
    const f = $('finale');
    f.hidden = false;
    $('endingName').textContent = name;
    const line = $('hopeLine');
    line.innerHTML = '';
    const spans = S.hope.map((w, i) => {
      const s = document.createElement('span');
      s.textContent = w;
      line.appendChild(s);
      return { s, got: !!save.embers[S.chrono[i]] };
    });
    await sleep(1500);
    for (const x of spans) { x.s.classList.add(x.got ? 'on' : 'ghost'); if (x.got) A.chime(); await sleep(1300); }
    const missing = spans.some((x) => !x.got);
    if (missing) {
      await sleep(1500);
      for (const x of spans) if (!x.got) { x.s.classList.remove('ghost'); x.s.classList.add('on'); await sleep(700); }
    }
    await sleep(1200);
    $('hopeCoda').textContent = missing ? S.epilogue.codaPartial : S.epilogue.coda;
    await sleep(3500);
    $('credits').hidden = false;
    busy = false;
  }

  // door scene easing for the epilogue (added here to keep scenes declarative)
  const baseDoor = SC.door;
  SC.door = function (G2, variant) {
    const sc = baseDoor(G2, variant);
    sc.targetLight = sc.light; sc.targetOpen = 0;
    const drawBase = sc.draw;
    sc.update = function (dt) {
      this.light = R.lerp(this.light, this.targetLight, Math.min(1, dt * 0.6));
      this.doorOpen = R.lerp(this.doorOpen, this.targetOpen, Math.min(1, dt * 0.25));
    };
    sc.draw = function (g2, v) {
      drawBase.call(this, g2, v);
      if (this.companion) {
        const cx = 980 - v.camX;
        R.glow(g2, cx, R.GROUND - 40, 120, 'rgba(230,150,80,1)', 0.25);
        R.figure(g2, cx + 17, R.GROUND - 22, 1.05, v.t, false, 1, '#050606');
      }
    };
    return sc;
  };

  // ---------------------------------------------------------------- title
  function resetAll() {
    save = fresh(); persist();
  }
  if (save.prologue) {
    $('btnContinue').hidden = false;
    $('btnBegin').textContent = 'Begin anew';
  }
  $('btnBegin').addEventListener('click', async () => {
    A.init();
    resetAll();
    await fadeOut();
    $('title').hidden = true;
    await prologue();
    save.prologue = true; persist();
    showArchive();
  });
  $('btnContinue').addEventListener('click', async () => {
    A.init();
    await fadeOut();
    $('title').hidden = true;
    showArchive();
  });
  $('btnAgain').addEventListener('click', async () => {
    await fadeOut();
    $('finale').hidden = true; $('credits').hidden = true; $('hopeCoda').textContent = '';
    endScene();
    resetAll();
    $('btnContinue').hidden = true;
    $('btnBegin').textContent = 'Enter the process';
    $('title').hidden = false;
    fadeIn();
  });
})();
