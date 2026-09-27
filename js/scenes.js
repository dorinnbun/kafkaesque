/* Scenes. Each one is a single horizontal world (a long shot, a tiny figure)
   with its own way of closing in on you:
     door        — the prologue and the epilogue; the Law
     insect      — a body that will not obey (tap to crawl), family knocking
     trial       — a corridor that loops; the ceiling lowers; the exit is behind you
     castle      — the goal recedes as you approach; standing still buries you
     ministry    — a sweeping eye; move in its light and the walls rush in
     axe         — 730 counted steps; a whispering theory
     underground — the walls physically converge; reason is one of them */
(function () {
  const R = window.KRender, A = window.KAudio, S = window.KStory;
  const G0 = R.GROUND;
  const Sc = (window.KScenes = {});

  function ent(o) { return Object.assign({ r: 90, used: false, once: false, hold: 0, visible: null }, o); }

  // ------------------------------------------------------------------ door
  Sc.door = function (G, variant) {
    const epi = variant === 'epilogue';
    const DOOR = 1520, KEEPER = 1340;
    const sc = {
      length: 2000, start: 260, speed: epi ? 70 : 120, stoop: epi ? 3 : 0,
      dreadRate: epi ? 0.004 : 0.003, dreadCap: 0.55, noCollapse: true,
      particles: new R.Particles('ash', 90, 3),
      audio: { drone: 43.65, droneLevel: 0.5, wind: 0.3, windTone: 420, layers: { light: epi ? 0.15 : 0.04 } },
      light: epi ? 1 : 0.4,
      doorOpen: 0,
      entities: [
        ent({ x: KEEPER - 70, r: 120, label: epi ? 'Ask the gatekeeper' : 'Ask to enter', once: true,
          use: () => G.finish() })
      ],
      draw(g, v) {
        R.sky(g, v, [[0, '#0e0f0f'], [0.45, '#3b3d3a'], [0.78, '#6f716a'], [1, '#2a2b28']]);
        // distant monoliths in haze
        const r = R.rng(11);
        for (let i = 0; i < 9; i++) {
          const x = R.sx(v, i * 520 - 300, 0.15), w = 90 + r() * 160, h = 380 + r() * 420;
          R.rect(g, x, G0 - h, w, h, 'rgba(38,40,38,0.55)');
        }
        R.fogDrift(g, v, 5, 7, 560, 260, 'rgba(160,160,150,0.5)', 0.35, 8);
        // the wall of the Law
        const wx = R.sx(v, 1180);
        const wallG = g.createLinearGradient(wx, 0, wx + 1400, 0);
        wallG.addColorStop(0, '#1e201e'); wallG.addColorStop(0.3, '#2a2c29'); wallG.addColorStop(1, '#141514');
        g.fillStyle = wallG; g.fillRect(wx, -20, 3000, G0 + 20);
        // door recess
        const dx = R.sx(v, DOOR), dw = 280, dtop = 120;
        R.rect(g, dx - dw / 2 - 30, dtop - 30, dw + 60, G0 - dtop + 30, '#101110');
        const leaf = dw / 2;
        const open = this.doorOpen;
        const lightA = this.light * (0.55 + Math.sin(v.t * 0.7) * 0.08);
        // light spilling from the crack
        R.shaft(g, dx, 8 + open * 200, 160 + open * 600, dtop, G0 + 180, 'rgba(240,170,90,1)', 0.18 * lightA);
        R.glow(g, dx, G0 - 250, 320, 'rgba(230,140,60,1)', 0.25 * lightA);
        R.rect(g, dx - leaf, dtop, leaf - 2 - open * 90, G0 - dtop, '#1a1b1a');
        R.rect(g, dx + 2 + open * 90, dtop, leaf - 2 - open * 90, G0 - dtop, '#171817');
        g.fillStyle = 'rgba(255,205,140,' + (0.85 * lightA) + ')';
        g.fillRect(dx - 2 - open * 90, dtop, 4 + open * 180, G0 - dtop);
        R.ground(g, v, '#2b2c29', '#0d0e0d');
        // reflected light on the ground
        R.glow(g, dx, G0 + 20, 420, 'rgba(230,140,60,1)', 0.12 * lightA);
        // the gatekeeper: fur coat, stool beside the door
        const kx = R.sx(v, KEEPER);
        R.figure(g, kx, G0, 3.1, v.t, false, -1, '#070808');
        if (epi) { R.rect(g, R.sx(v, 980), G0 - 26, 34, 26, '#0a0b0a'); }
      },
      drawFront(g, v) {
        R.fog(g, v, G0 - 10, 160, 'rgba(120,120,112,1)', 0.25);
      }
    };
    return sc;
  };

  // ---------------------------------------------------------------- insect
  Sc.insect = function (G) {
    const T = S.fragments.insect;
    let knockT = 5, shake = 0, kIdx = 0;
    const sc = {
      length: 1420, start: 380, mode: 'tap', speed: 90,
      dreadRate: 0.0065,
      particles: new R.Particles('dust', 60, 9),
      audio: { drone: 49, droneLevel: 0.45, wind: 0.14, windTone: 260 },
      body: 'beetle',
      entities: [
        ent({ x: 200, label: 'Look at the window', use: () => G.say([T.window]) }),
        ent({ x: 580, label: 'Look at the picture', ember: true, ey: 380, once: true, use: () => { G.ember(); G.say([T.picture]); } }),
        ent({ x: 860, label: 'Smell the bowl', use: () => G.say([T.bowl]) }),
        ent({ x: 1240, r: 110, label: T.doorLabel, hold: 2.6, once: true, holdDread: 0.05, use: () => G.finish() })
      ],
      update(dt) {
        knockT -= dt;
        if (knockT <= 0) {
          knockT = 6 + Math.random() * 4;
          A.knock(); shake = 1; G.addDread(0.045);
          if (!G.narrating()) G.say([T.knocks[kIdx++ % T.knocks.length]]);
        }
        shake = Math.max(0, shake - dt * 2.2);
      },
      draw(g, v) {
        R.sky(g, v, [[0, '#101416'], [0.6, '#232b2e'], [1, '#141819']]);
        // wallpaper stripes
        g.save(); g.globalAlpha = 0.07; g.fillStyle = '#8fa0a3';
        for (let x = 0; x < 1420; x += 38) g.fillRect(R.sx(v, x), 0, 2, G0);
        g.restore();
        // window with rain
        const wx = R.sx(v, 200);
        R.rect(g, wx - 90, 250, 180, 300, '#0c0f10');
        const wg = g.createLinearGradient(0, 260, 0, 540);
        wg.addColorStop(0, '#6f7c80'); wg.addColorStop(1, '#465257');
        g.fillStyle = wg; g.fillRect(wx - 80, 260, 160, 280);
        g.save(); g.beginPath(); g.rect(wx - 80, 260, 160, 280); g.clip();
        g.strokeStyle = 'rgba(200,215,220,0.35)'; g.lineWidth = 1;
        for (let i = 0; i < 26; i++) {
          const rx = wx - 80 + ((i * 37 + v.t * 40) % 170), ry = 260 + ((i * 53 + v.t * 520) % 290);
          g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx - 3, ry + 16); g.stroke();
        }
        g.restore();
        R.rect(g, wx - 2, 260, 4, 280, '#0c0f10'); R.rect(g, wx - 80, 398, 160, 4, '#0c0f10');
        R.shaft(g, wx + 60, 160, 420, 260, G0 + 120, 'rgba(170,190,200,1)', 0.12);
        // picture of the lady in furs
        const px = R.sx(v, 580);
        R.rect(g, px - 34, 330, 68, 90, '#1b1a17');
        R.rect(g, px - 27, 337, 54, 76, '#3d3830');
        g.fillStyle = '#211d18'; g.beginPath(); g.ellipse(px, 392, 18, 22, 0, 0, Math.PI * 2); g.fill();
        // bed
        const bx = R.sx(v, 380);
        R.rect(g, bx - 170, G0 - 110, 340, 70, '#12161a');
        R.rect(g, bx - 180, G0 - 190, 16, 190, '#0e1113');
        R.rect(g, bx + 164, G0 - 140, 16, 140, '#0e1113');
        // bowl
        const bw = R.sx(v, 860);
        g.fillStyle = '#6f7472'; g.beginPath(); g.ellipse(bw, G0 - 6, 22, 7, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#d9d6c8'; g.beginPath(); g.ellipse(bw, G0 - 9, 17, 4, 0, 0, Math.PI * 2); g.fill();
        // the door
        const dx = R.sx(v, 1240) + (shake ? Math.sin(v.t * 90) * 3 * shake : 0);
        R.rect(g, dx - 80, G0 - 420, 160, 420, '#0d1012');
        R.rect(g, dx - 70, G0 - 410, 140, 410, '#1c2124');
        R.rect(g, dx + 44, G0 - 215, 8, 14, '#060707');
        // light under the door: the family, the flat, the world
        R.glow(g, dx, G0 - 2, 110, 'rgba(230,170,110,1)', 0.25);
        R.rect(g, dx - 70, G0 - 3, 140, 3, 'rgba(240,190,130,0.7)');
        // room walls
        R.rect(g, R.sx(v, -900), 0, 900, 1000, '#070909');
        R.rect(g, R.sx(v, 1420), 0, 900, 1000, '#070909');
        R.ground(g, v, '#1a1f21', '#070909');
        g.save(); g.globalAlpha = 0.25; g.fillStyle = '#000';
        for (let x = 0; x < 1420; x += 90) g.fillRect(R.sx(v, x), G0, 2, 210);
        g.restore();
      }
    };
    return sc;
  };

  // ----------------------------------------------------------------- trial
  Sc.trial = function (G) {
    const T = S.fragments.trial;
    let loops = 0;
    const ceil = () => 190 + loops * 115;
    const sc = {
      length: 2600, start: 320, speed: 130,
      dreadRate: 0.006,
      particles: new R.Particles('dust', 110, 21),
      audio: { drone: 46.25, droneLevel: 0.5, wind: 0.1, windTone: 350 },
      entities: [
        ent({ x: 110, r: 80, label: 'Look behind you', ember: true, ey: G0 - 40, once: true,
          visible: () => loops >= 1, use: () => { G.ember(); G.say([T.behind]); } }),
        ent({ x: 640, label: 'Pass the bench', use: () => G.say([T.bench1]) }),
        ent({ x: 1180, label: 'Speak to the man waiting', use: () => G.say(T.bench2) }),
        ent({ x: 1720, label: 'Knock on the painter’s door', use: () => G.say(T.painter) }),
        ent({ x: 2400, r: 100, label: T.doorLabel, use: () => {
          if (loops < 2) {
            loops++;
            A.slam(); G.addDread(0.1);
            G.cut(() => { G.player.x = 320; }, 0.9);
            G.say(T.loops[loops - 1]);
            sc.dreadRate = 0.006 + loops * 0.004;
          } else G.finish();
        } })
      ],
      draw(g, v) {
        R.sky(g, v, [[0, '#120e0a'], [0.5, '#3a2c1f'], [1, '#1c150f']]);
        // back wall planks
        g.save(); g.globalAlpha = 0.18; g.fillStyle = '#000';
        for (let x = -200; x < 2800; x += 64) g.fillRect(R.sx(v, x), 0, 3, G0);
        g.restore();
        // doors and benches
        for (let i = 0; i < 9; i++) {
          const x = 460 + i * 260;
          if (x > 2500) break;
          const sx = R.sx(v, x);
          R.rect(g, sx - 48, G0 - 300, 96, 300, '#140f0b');
          R.rect(g, sx - 42, G0 - 294, 84, 294, '#221910');
          g.fillStyle = 'rgba(210,190,150,0.45)';
          g.font = '14px "Courier Prime", monospace';
          g.fillText(String(40 + i * 7 + loops * 3), sx - 9, G0 - 312);
          if (i % 2 === 0) {
            const bx = sx + 130;
            R.rect(g, bx - 60, G0 - 44, 120, 8, '#0f0b08');
            R.rect(g, bx - 55, G0 - 36, 6, 36, '#0f0b08'); R.rect(g, bx + 49, G0 - 36, 6, 36, '#0f0b08');
            for (let k = 0; k < 2; k++) R.figure(g, bx - 25 + k * 45, G0 - 18, 1.05, v.t, false, k ? -1 : 1, '#0b0806');
          }
        }
        // the Magistrate's door, larger
        const mx = R.sx(v, 2400);
        R.rect(g, mx - 70, G0 - 360, 140, 360, '#0d0906');
        R.glow(g, mx, G0 - 4, 90, 'rgba(230,180,110,1)', 0.25);
        // the forgotten door behind you
        const fx = R.sx(v, 110);
        R.rect(g, fx - 40, G0 - 260, 80, 260, '#0d0a07');
        // ceiling slab with beams, lowering
        const cy = ceil();
        const cg = g.createLinearGradient(0, 0, 0, cy);
        cg.addColorStop(0, '#050403'); cg.addColorStop(1, '#1a130d');
        g.fillStyle = cg; g.fillRect(-10, -10, v.w + 20, cy + 10);
        for (let x = -400; x < 3000; x += 180) {
          const sx = R.sx(v, x);
          R.rect(g, sx, cy - 6, 40, 30, '#0b0806');
        }
        // light through the roof slats
        for (let x = 200; x < 2600; x += 360) {
          R.shaft(g, R.sx(v, x), 26, 190, cy, G0 + 60, 'rgba(255,215,150,1)', 0.14);
        }
        R.rect(g, R.sx(v, -900), 0, 880, 1000, '#050403');
        R.rect(g, R.sx(v, 2560), 0, 900, 1000, '#050403');
        R.ground(g, v, '#241a12', '#070504');
      },
      drawFront(g, v) {
        R.fog(g, v, G0 - 60, 220, 'rgba(120,90,60,1)', 0.18);
      }
    };
    return sc;
  };

  // ---------------------------------------------------------------- castle
  Sc.castle = function (G) {
    const T = S.fragments.castle;
    let listening = 0;
    const sc = {
      length: 3600, start: 160, speed: 125,
      dreadRate: 0.006,
      particles: new R.Particles('snow', 260, 33),
      audio: { drone: 41.2, droneLevel: 0.4, wind: 0.55, windTone: 900 },
      entities: [
        ent({ x: 660, label: 'Ask the villager', use: () => G.say(T.villager1) }),
        ent({ x: 1500, label: T.phoneLabel, ember: true, ey: G0 - 150, hold: 3, once: true,
          onHold: (on) => { listening = on ? 1 : 0; A.layer('phone', on ? 0.9 : 0, 0.5); },
          use: () => { A.layer('phone', 0.25, 3); G.ember(); G.say([T.phone]); } }),
        ent({ x: 2320, label: 'Ask the other villager', use: () => G.say(T.villager2) }),
        ent({ x: 2960, label: 'Look into the inn', use: () => G.say([T.inn]) }),
        ent({ x: 3480, r: 110, label: T.roadLabel, once: true, use: () => G.finish() })
      ],
      update(dt) {
        // Snow buries what waits.
        const still = !G.player.walking && !listening;
        G.addDread((still ? 0.04 : 0.002) * dt);
      },
      draw(g, v) {
        R.sky(g, v, [[0, '#8e969a'], [0.5, '#bfc4c5'], [0.8, '#d6d8d6'], [1, '#c9cccb']]);
        // the Castle: recedes as you approach
        const prog = R.clamp(G.player.x / 3600, 0, 1);
        const s = 1 - prog * 0.55;
        const cx = v.w * (0.66 + prog * 0.12), cy = G0 - 150 - prog * 30;
        g.save(); g.translate(cx, cy); g.scale(s, s);
        g.fillStyle = 'rgba(90,98,102,0.75)';
        g.beginPath(); g.ellipse(0, 150, 700, 160, 0, Math.PI, 0); g.fill();
        g.fillStyle = 'rgba(70,76,80,0.85)';
        const blocks = [[-180, 70, 360, 70], [-120, 20, 80, 120], [-20, -30, 60, 170], [60, 30, 110, 110], [-220, 90, 60, 50]];
        blocks.forEach(([x, y, w, h]) => g.fillRect(x, y, w, h));
        g.beginPath(); g.moveTo(-26, -30); g.lineTo(10, -90); g.lineTo(46, -30); g.fill();
        g.fillStyle = 'rgba(255,190,120,' + (0.6 + Math.sin(v.t * 1.3) * 0.2) + ')';
        [[-5, 10], [85, 60], [-100, 60], [30, 100]].forEach(([x, y]) => g.fillRect(x, y, 5, 7));
        g.restore();
        R.fog(g, v, cy + 40, 260, 'rgba(225,228,228,1)', 0.7);
        R.fogDrift(g, v, 44, 8, 640, 200, 'rgba(240,242,242,1)', 0.35, 14);
        R.ground(g, v, '#e4e6e5', '#aeb4b6', G0 - 6);
        // telephone poles and sagging wires
        g.strokeStyle = 'rgba(20,22,24,0.7)'; g.lineWidth = 1.2;
        for (let x = 0; x <= 3600; x += 500) {
          const sx = R.sx(v, x);
          R.rect(g, sx - 3, G0 - 300, 6, 300, '#1a1c1d');
          R.rect(g, sx - 22, G0 - 292, 44, 4, '#1a1c1d');
          g.beginPath(); g.moveTo(sx, G0 - 288);
          g.quadraticCurveTo(sx + 250, G0 - 240, sx + 500, G0 - 288); g.stroke();
        }
        const pb = R.sx(v, 1500);
        R.rect(g, pb - 14, G0 - 170, 28, 40, '#141617');
        // villagers
        R.figure(g, R.sx(v, 700), G0, 1.05, v.t, false, -1, '#1a1c1d');
        R.figure(g, R.sx(v, 2360), G0, 1.05, v.t, false, -1, '#1a1c1d');
        // the inn
        const ix = R.sx(v, 2960);
        R.rect(g, ix - 120, G0 - 170, 240, 170, '#2c2f30');
        g.fillStyle = '#2c2f30'; g.beginPath(); g.moveTo(ix - 140, G0 - 170); g.lineTo(ix, G0 - 260); g.lineTo(ix + 140, G0 - 170); g.fill();
        R.rect(g, ix - 20, G0 - 110, 40, 34, 'rgba(255,190,120,0.9)');
        R.glow(g, ix, G0 - 90, 160, 'rgba(255,170,90,1)', 0.35);
        // the signpost at the bend
        const rx = R.sx(v, 3500);
        R.rect(g, rx - 3, G0 - 140, 6, 140, '#1a1c1d');
        g.save(); g.translate(rx, G0 - 130); g.rotate(0.18); R.rect(g, 0, -10, 80, 20, '#1a1c1d'); g.restore();
      },
      drawFront(g, v) {
        R.fog(g, v, G0 + 30, 180, 'rgba(235,237,237,1)', 0.45);
      }
    };
    return sc;
  };

  // -------------------------------------------------------------- ministry
  Sc.ministry = function (G) {
    const T = S.fragments.ministry;
    const PILLARS = []; for (let x = 420; x < 3300; x += 430) PILLARS.push(x);
    const ALCOVE = 2050;
    let beamX = 0, onYou = 0;
    const sc = {
      length: 3400, start: 150, speed: 135,
      dreadRate: 0.004,
      particles: new R.Particles('ash', 70, 41),
      audio: { drone: 58.27, droneLevel: 0.45, wind: 0.08, windTone: 300, layers: { mains: 0.22 } },
      entities: [
        ent({ x: 720, label: 'Read the poster', use: () => G.say([T.poster]) }),
        ent({ x: 1300, label: 'Look into the slot', use: () => G.say([T.slot]) }),
        ent({ x: ALCOVE, label: T.alcoveLabel, ember: true, ey: G0 - 120, once: true, use: () => { G.ember(); G.say([T.alcove]); } }),
        ent({ x: 2640, label: 'Watch the canteen', use: () => G.say([T.canteen]) }),
        ent({ x: 3260, r: 110, label: T.deskLabel, once: true, use: () => G.finish() })
      ],
      update(dt, v) {
        const bx = v.w * (0.5 + 0.46 * Math.sin(v.t * 0.5 + Math.sin(v.t * 0.21) * 1.5));
        beamX = v.camX + bx;
        const px = G.player.x;
        const hidden = PILLARS.some((p) => Math.abs(px - p) < 42) || Math.abs(px - ALCOVE) < 60;
        const inBeam = Math.abs(px - beamX) < 85 && !hidden;
        onYou = R.lerp(onYou, inBeam ? 1 : 0, Math.min(1, dt * 8));
        if (inBeam) G.addDread((G.player.walking ? 0.3 : 0.015) * dt);
        A.layer('mains', 0.22 + onYou * 0.4, 0.15);
      },
      draw(g, v) {
        R.sky(g, v, [[0, '#07090a'], [0.5, '#161c1e'], [1, '#0d1112']]);
        // telescreens: the eye watches the player
        for (let i = 0; i < 6; i++) {
          const x = R.sx(v, i * 700 + 200, 0.55), y = 120, w = 340, h = 230;
          R.rect(g, x - 8, y - 8, w + 16, h + 16, '#050606');
          const sg = g.createLinearGradient(0, y, 0, y + h);
          sg.addColorStop(0, '#2a1512'); sg.addColorStop(1, '#170a09');
          g.fillStyle = sg; g.fillRect(x, y, w, h);
          const ex = x + w / 2, ey = y + h / 2;
          const look = R.clamp((R.sx(v, G.player.x) - ex) / 900, -1, 1);
          g.fillStyle = '#b9b3a8';
          g.beginPath(); g.ellipse(ex, ey, 110, 42, 0, 0, Math.PI * 2); g.fill();
          g.fillStyle = '#8c2a1e';
          g.beginPath(); g.arc(ex + look * 60, ey, 30, 0, Math.PI * 2); g.fill();
          g.fillStyle = '#050606';
          g.beginPath(); g.arc(ex + look * 60, ey, 13, 0, Math.PI * 2); g.fill();
          R.glow(g, ex, ey, 260, 'rgba(160,40,30,1)', 0.25);
          g.save(); g.globalAlpha = 0.12; g.fillStyle = '#000';
          for (let s = y; s < y + h; s += 4) g.fillRect(x, s, w, 1);
          g.restore();
        }
        R.fogDrift(g, v, 8, 6, 620, 220, 'rgba(60,70,72,1)', 0.35, 5);
        // alcove
        const ax = R.sx(v, ALCOVE);
        R.rect(g, ax - 70, G0 - 300, 140, 300, '#040505');
        // slot and poster
        const sx = R.sx(v, 1300); R.rect(g, sx - 50, G0 - 160, 100, 14, '#050505');
        R.glow(g, sx, G0 - 150, 60, 'rgba(255,120,60,1)', 0.25);
        const po = R.sx(v, 720); R.rect(g, po - 60, G0 - 330, 120, 170, '#2a2b28');
        g.fillStyle = '#8c2a1e'; g.fillRect(po - 50, G0 - 320, 100, 40);
        // desk
        const dx = R.sx(v, 3260);
        R.rect(g, dx - 90, G0 - 70, 180, 10, '#0a0c0c');
        R.rect(g, dx - 30, G0 - 150, 60, 50, '#0a0c0c');
        R.rect(g, dx - 24, G0 - 144, 48, 38, 'rgba(160,50,40,0.7)');
        R.ground(g, v, '#1a2022', '#050606');
        // floor reflections of the screens
        R.fog(g, v, G0 + 40, 90, 'rgba(120,30,25,1)', 0.15);
      },
      drawFront(g, v) {
        // the beam
        const bx = beamX - v.camX;
        g.save();
        g.globalCompositeOperation = 'screen';
        const bg = g.createLinearGradient(0, 0, 0, G0);
        bg.addColorStop(0, 'rgba(200,40,30,0.02)');
        bg.addColorStop(1, 'rgba(210,50,35,' + (0.22 + onYou * 0.2) + ')');
        g.fillStyle = bg;
        g.beginPath();
        g.moveTo(v.w / 2 - 20, 0); g.lineTo(v.w / 2 + 20, 0);
        g.lineTo(bx + 90, G0 + 10); g.lineTo(bx - 90, G0 + 10);
        g.closePath(); g.fill();
        g.fillStyle = 'rgba(230,60,40,' + (0.25 + onYou * 0.3) + ')';
        g.beginPath(); g.ellipse(bx, G0 + 4, 95, 10, 0, 0, Math.PI * 2); g.fill();
        g.restore();
        // pillars in the foreground
        PILLARS.forEach((x) => {
          const px = R.sx(v, x);
          const pg = g.createLinearGradient(px - 40, 0, px + 40, 0);
          pg.addColorStop(0, '#0b0e0f'); pg.addColorStop(0.4, '#232a2c'); pg.addColorStop(1, '#070909');
          g.fillStyle = pg; g.fillRect(px - 40, -10, 80, G0 + 60);
        });
      }
    };
    return sc;
  };

  // ------------------------------------------------------------------- axe
  Sc.axe = function (G) {
    const T = S.fragments.axe;
    let whisperT = 7, wIdx = 0;
    const UNIT = 5;
    const sc = {
      length: 3700, start: 0, speed: 110,
      dreadRate: 0.003,
      particles: new R.Particles('dust', 140, 51),
      audio: { drone: 51.91, droneLevel: 0.45, wind: 0.2, windTone: 650, layers: { heat: 0.5 } },
      entities: [
        ent({ x: 720, label: 'Enter the tavern', use: () => G.say(T.tavern) }),
        ent({ x: 1500, label: 'Listen in the Haymarket', use: () => G.say([T.haymarket]) }),
        ent({ x: 2300, label: T.crossLabel, ember: true, ey: G0 - 14, once: true, use: () => { G.ember(); G.say([T.cross]); } }),
        ent({ x: 3000, label: 'Look into the porter’s lodge', use: () => G.say([T.lodge]) }),
        ent({ x: 3650, r: 100, label: T.doorLabel, once: true, use: () => { A.bell(); G.finish(); } })
      ],
      update(dt) {
        const steps = Math.min(730, Math.floor(G.player.x / UNIT));
        G.setCounter('Step ' + String(steps).padStart(3, '0') + ' / 730');
        G.floorDread(0.05 + (steps / 730) * 0.6);
        whisperT -= dt;
        if (whisperT <= 0) {
          whisperT = 9 + Math.random() * 5;
          A.whisper(); G.addDread(0.02);
          if (!G.narrating()) G.say([T.whispers[wIdx++ % T.whispers.length]]);
        }
      },
      draw(g, v) {
        R.sky(g, v, [[0, '#1e170c'], [0.45, '#6e5428'], [0.75, '#b58e48'], [1, '#6a5125']]);
        R.glow(g, v.w * 0.3, 180, 420, 'rgba(255,230,160,1)', 0.35);
        // far tenements
        const r1 = R.rng(61);
        for (let i = 0; i < 16; i++) {
          const x = R.sx(v, i * 330 - 200, 0.3), w = 260 + r1() * 120, h = 260 + r1() * 260;
          R.rect(g, x, G0 - h, w, h, 'rgba(100,78,40,0.55)');
        }
        R.fogDrift(g, v, 62, 7, 560, 160, 'rgba(210,170,100,1)', 0.3, 10);
        // near tenements with window grids
        const r2 = R.rng(71);
        for (let i = 0; i < 13; i++) {
          const x = R.sx(v, i * 300 - 100), w = 250 + r2() * 40, h = 430 + r2() * 220;
          R.rect(g, x, G0 - h, w, h, '#2c2112');
          g.fillStyle = 'rgba(15,10,5,0.8)';
          for (let wy = G0 - h + 40; wy < G0 - 90; wy += 62)
            for (let wx = x + 26; wx < x + w - 30; wx += 48) g.fillRect(wx, wy, 18, 30);
          if (r2() > 0.6) { g.fillStyle = 'rgba(255,200,120,0.5)'; g.fillRect(x + 26 + 48, G0 - h + 40 + 62, 18, 30); }
        }
        // Sonya's door
        const so = R.sx(v, 2300);
        R.rect(g, so - 36, G0 - 150, 72, 150, '#140e06');
        // tavern sign
        const tv = R.sx(v, 720);
        R.rect(g, tv - 50, G0 - 180, 100, 26, '#1a1208');
        R.glow(g, tv, G0 - 60, 120, 'rgba(255,180,100,1)', 0.2);
        // the pawnbroker's building, darker
        const pb = R.sx(v, 3650);
        R.rect(g, pb - 260, -20, 520, G0 + 20, '#1c150b');
        R.rect(g, pb - 45, G0 - 200, 90, 200, '#0a0703');
        R.ground(g, v, '#3a2d18', '#120d06');
      },
      drawFront(g, v) {
        // heat shimmer
        g.save(); g.globalAlpha = 0.07; g.fillStyle = '#ffe0a0';
        for (let y = G0 - 60; y < G0 + 20; y += 6) g.fillRect(Math.sin(v.t * 3 + y) * 6, y, v.w, 2);
        g.restore();
      }
    };
    return sc;
  };

  // ----------------------------------------------------------- underground
  Sc.underground = function (G) {
    const T = S.fragments.underground;
    let L = 0, Rr = 1600, lizaGone = false;
    const sc = {
      length: 1600, start: 820, speed: 140,
      dreadRate: 0.002,
      particles: new R.Particles('dust', 40, 81),
      audio: { drone: 36.71, droneLevel: 0.55, wind: 0.06, windTone: 200 },
      bounds: () => [L + 30, Rr - 40],
      entities: [
        ent({ x: 180, label: T.stoveLabel, ember: true, ey: G0 - 60, once: true, visible: () => L < 150, use: () => { G.ember(); G.say([T.stove]); } }),
        ent({ x: 520, label: 'Listen at the door', visible: () => L < 490, use: () => G.say([T.liza]) }),
        ent({ x: 1040, label: 'Look in the mirror', visible: () => Rr > 1080, use: () => G.say([T.mirror]) }),
        ent({ x: 1500, r: 120, label: T.wallLabel, once: true, use: () => G.finish() })
      ],
      update(dt) {
        const sp = 9.6;
        L = Math.min(L + sp * dt, 790); Rr = Math.max(Rr - sp * dt, 810);
        this.entities[3].x = Rr - 60;
        const gap = Rr - L;
        G.floorDread(R.clamp(1 - gap / 1650, 0, 1));
        if (gap < 70) G.addDread(1);
        if (!lizaGone && L >= 490) { lizaGone = true; A.slam(); }
      },
      draw(g, v) {
        R.sky(g, v, [[0, '#050403'], [0.6, '#15100c'], [1, '#0c0907']]);
        // bricks
        g.save(); g.globalAlpha = 0.14; g.fillStyle = '#000';
        for (let y = 60; y < G0; y += 34) {
          const off = (y / 34) % 2 ? 0 : 36;
          g.fillRect(-10, y, v.w + 20, 2);
          for (let x = -200 + off; x < 1800; x += 72) g.fillRect(R.sx(v, x), y, 2, 34);
        }
        g.restore();
        // single bulb
        R.glow(g, R.sx(v, 800), 250, 520, 'rgba(200,150,90,1)', 0.22);
        R.rect(g, R.sx(v, 800) - 1, 0, 2, 240, '#050403');
        // stove
        const st = R.sx(v, 180);
        R.rect(g, st - 50, G0 - 160, 100, 160, '#0e0a08');
        R.glow(g, st, G0 - 50, 120, 'rgba(220,90,40,1)', 0.35);
        // Liza's door
        const lz = R.sx(v, 520);
        R.rect(g, lz - 55, G0 - 330, 110, 330, '#0a0806');
        R.rect(g, lz - 50, G0 - 3, 100, 3, lizaGone ? '#0a0806' : 'rgba(240,190,130,0.7)');
        // mirror
        const mr = R.sx(v, 1040);
        R.rect(g, mr - 40, G0 - 360, 80, 150, '#2a2622');
        R.rect(g, mr - 34, G0 - 354, 68, 138, '#4b4640');
        R.ground(g, v, '#1b140f', '#050403');
        // the other wall
        const lx = R.sx(v, L);
        R.rect(g, lx - 2000, -20, 2000, 1040, '#070605');
        R.rect(g, lx - 6, -20, 6, 1040, '#1b1612');
        // the wall of reason: pale, engraved, patient
        const rx = R.sx(v, Rr);
        const wg = g.createLinearGradient(rx, 0, rx + 600, 0);
        wg.addColorStop(0, '#5c5a55'); wg.addColorStop(1, '#2a2927');
        g.fillStyle = wg; g.fillRect(rx, -20, 2400, 1040);
        g.save();
        g.fillStyle = 'rgba(25,24,22,0.75)';
        g.font = '84px "Tenor Sans", "Gill Sans", sans-serif';
        g.fillText('2 × 2', rx + 26, 400);
        g.fillText('= 4', rx + 26, 490);
        g.font = '20px "Courier Prime", monospace';
        g.fillText('Q.E.D.', rx + 30, 530);
        g.restore();
      }
    };
    return sc;
  };
})();
