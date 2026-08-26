/* MUNDA Lightweave — a textile-light arcade game.
   Fan concept inspired by MUNDA Textile Lichtsysteme (AUNDE × MENTOR):
   LED light woven into technical textiles for automotive interiors. */
(function () {
  "use strict";

  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  var W = 420;
  var H = 740;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    var wrap = document.getElementById("game-wrap");
    var availW = wrap.clientWidth || window.innerWidth;
    var availH = wrap.clientHeight || window.innerHeight;
    var s = Math.min(availW / W, availH / H);
    canvas.style.width = Math.floor(W * s) + "px";
    canvas.style.height = Math.floor(H * s) + "px";
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  var $ = function (id) { return document.getElementById(id); };
  var scoreEl = $("score");
  var bestEl = $("best");
  var comboEl = $("combo");
  var comboWrap = $("combo-wrap");
  var overlayStart = $("overlay-start");
  var overlayOver = $("overlay-over");
  var finalScore = $("final-score");
  var newBest = $("new-best");
  var btnStart = $("btn-start");
  var btnRestart = $("btn-restart");
  var btnMute = $("btn-mute");

  var laneXs = [W * 0.25, W * 0.5, W * 0.75]; // 105 / 210 / 315

  var best = Math.floor(Number(localStorage.getItem("munda-best") || 0));
  bestEl.textContent = String(best);

  var muted = localStorage.getItem("munda-muted") === "1";
  btnMute.textContent = muted ? "🔇" : "🔊";

  /* ---------- tiny synth ---------- */

  var actx = null;
  function audio() {
    if (!actx) {
      try {
        actx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { /* no audio available */ }
    }
    return actx;
  }
  function beep(freq, dur, type, vol, slide) {
    if (muted) { return; }
    var a = audio();
    if (!a) { return; }
    try {
      var o = a.createOscillator();
      var g = a.createGain();
      o.type = type || "sine";
      o.frequency.setValueAtTime(freq, a.currentTime);
      if (slide) {
        o.frequency.exponentialRampToValueAtTime(slide, a.currentTime + dur);
      }
      g.gain.setValueAtTime(vol || 0.16, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0008, a.currentTime + dur);
      o.connect(g);
      g.connect(a.destination);
      o.start();
      o.stop(a.currentTime + dur + 0.02);
    } catch (e) { /* ignore */ }
  }

  /* ---------- state ---------- */

  var state = "start"; // start | playing | over
  var score = 0;
  var combo = 0;
  var comboT = 0;
  var dist = 0;
  var speed = 240;
  var player = { lane: 1, x: laneXs[1], y: H - 168, target: 1, moveT: 0 };
  var obstacles = [];
  var threads = [];
  var particles = [];
  var trail = [];
  var spawnT = 1.1;
  var threadT = 0.6;
  var pulse = 0;
  var shake = 0;
  var flash = 0;
  var lastLanes = [];
  var lastTime = 0;
  var raf = null;

  function reset() {
    score = 0;
    combo = 0;
    comboT = 0;
    dist = 0;
    speed = 240;
    player.lane = 1;
    player.x = laneXs[1];
    player.target = 1;
    player.moveT = 0;
    obstacles = [];
    threads = [];
    particles = [];
    trail = [];
    spawnT = 1.1;
    threadT = 0.6;
    pulse = 0;
    shake = 0;
    flash = 0;
    lastLanes = [];
    scoreEl.textContent = "0";
    comboWrap.hidden = true;
  }

  function setState(s) {
    state = s;
    overlayStart.hidden = s !== "start";
    overlayOver.hidden = s !== "over";
    if (s === "playing") {
      reset();
    }
  }

  function move(dir) {
    if (state !== "playing") { return; }
    var now = performance.now();
    if (now - player.moveT < 110) { return; }
    player.moveT = now;
    var nl = player.lane + dir;
    if (nl < 0 || nl > 2) { return; }
    player.lane = nl;
    player.target = nl;
  }

  function collectThread(t) {
    combo += 1;
    comboT = 3.5;
    var mult = Math.min(combo, 5);
    score += 10 * mult;
    scoreEl.textContent = String(score);
    comboWrap.hidden = false;
    comboEl.textContent = String(mult);
    if (mult >= 3) {
      pulse = 0.35;
    }
    burst(t.x, t.y, 10, "#bfe0ff");
    beep(520 + mult * 90, 0.12, "sine", 0.15, 900 + mult * 140);
    if (mult === 5) {
      beep(784, 0.18, "triangle", 0.12);
    }
  }

  function crash() {
    state = "over";
    overlayOver.hidden = false; // the game-over screen (setState("over") is never used)
    shake = 22;
    flash = 0.8;
    burst(player.x, player.y, 26, "#ff5d5d");
    beep(120, 0.5, "sawtooth", 0.22, 38);
    var final = Math.floor(score);
    var nb = false;
    if (final > best) {
      best = final;
      nb = true;
      try { localStorage.setItem("munda-best", String(best)); } catch (e) { /* ignore */ }
    }
    bestEl.textContent = String(best);
    finalScore.textContent = String(final);
    newBest.hidden = !nb;
  }

  function burst(x, y, n, color) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      var v = 60 + Math.random() * 180;
      particles.push({
        x: x, y: y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: 0.5 + Math.random() * 0.4, max: 0.9,
        color: color, r: 2 + Math.random() * 2.5
      });
    }
  }

  /* ---------- input ---------- */

  function onKey(e) {
    var k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") {
      move(-1);
      e.preventDefault();
    } else if (k === "ArrowRight" || k === "d" || k === "D") {
      move(1);
      e.preventDefault();
    } else if ((k === " " || k === "Enter") && state !== "playing") {
      e.preventDefault();
      setState("playing");
    }
  }
  window.addEventListener("keydown", onKey);

  var touchX = null;
  var touchY = null;
  canvas.addEventListener("touchstart", function (e) {
    e.preventDefault();
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: false });
  canvas.addEventListener("touchend", function (e) {
    e.preventDefault();
    if (touchX === null) { return; }
    var t = e.changedTouches[0];
    var dx = t.clientX - touchX;
    var dy = t.clientY - touchY;
    touchX = null;
    touchY = null;
    if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) {
      move(dx > 0 ? 1 : -1);
    } else if (Math.abs(dx) < 20 && Math.abs(dy) < 20) {
      move(t.clientX < window.innerWidth / 2 ? -1 : 1);
    }
  }, { passive: false });

  btnStart.addEventListener("click", function () { setState("playing"); });
  btnRestart.addEventListener("click", function () { setState("playing"); });
  btnMute.addEventListener("click", function () {
    muted = !muted;
    try { localStorage.setItem("munda-muted", muted ? "1" : "0"); } catch (e) { /* ignore */ }
    btnMute.textContent = muted ? "🔇" : "🔊";
    if (!muted) { beep(660, 0.1, "sine", 0.12); }
  });

  /* ---------- spawning ---------- */

  function spawnObstacle() {
    var candidates;
    if (lastLanes.length >= 2 && lastLanes[0] !== lastLanes[1]) {
      candidates = [3 - lastLanes[0] - lastLanes[1]]; // the third lane stays free
    } else {
      var avoid = lastLanes.length ? lastLanes[lastLanes.length - 1] : -1;
      candidates = [0, 1, 2].filter(function (l) { return l !== avoid; });
    }
    var lane = candidates[Math.floor(Math.random() * candidates.length)];
    lastLanes.push(lane);
    if (lastLanes.length > 3) { lastLanes.shift(); }
    var w = 52 + Math.random() * 34;
    var h = 56 + Math.random() * 34;
    obstacles.push({ x: laneXs[lane], y: -90, w: w, h: h, lane: lane, spin: Math.random() * 6.28 });
  }

  function spawnThread() {
    var lane = Math.floor(Math.random() * 3);
    var hues = [200, 265, 45];
    var hue = hues[Math.floor(Math.random() * 3)];
    threads.push({
      x: laneXs[lane], y: -60, lane: lane,
      phase: Math.random() * 6.28,
      color: "hsl(" + hue + ", 90%, 70%)"
    });
  }

  /* ---------- update ---------- */

  function update(dt) {
    dist += speed * dt;
    score += speed * dt * 0.02;
    scoreEl.textContent = String(Math.floor(score));
    speed = Math.min(670, 240 + dist / 130);

    player.x += (laneXs[player.target] - player.x) * Math.min(1, dt * 9);

    trail.push({ x: player.x, y: player.y });
    if (trail.length > 46) { trail.shift(); }

    if (comboT > 0) {
      comboT -= dt;
      if (comboT <= 0) {
        combo = 0;
        comboWrap.hidden = true;
      }
    }

    spawnT -= dt;
    if (spawnT <= 0 && obstacles.length < 4) {
      spawnObstacle();
      spawnT = Math.max(0.5, 1.3 - dist / 9000) * (0.75 + Math.random() * 0.5);
    }
    threadT -= dt;
    if (threadT <= 0) {
      spawnThread();
      threadT = 1.0 + Math.random() * 1.1;
    }

    var i;
    for (i = obstacles.length - 1; i >= 0; i--) {
      var o = obstacles[i];
      o.y += speed * dt;
      if (o.y - o.h > H + 60) {
        obstacles.splice(i, 1);
        continue;
      }
      var dx = player.x - o.x;
      var dy = player.y - o.y;
      var rr = 26 + Math.max(o.w, o.h) / 2 - 6;
      if (dx * dx + dy * dy < rr * rr) {
        crash();
        return;
      }
    }

    for (i = threads.length - 1; i >= 0; i--) {
      var t = threads[i];
      t.y += speed * dt;
      t.phase += dt * 3;
      if (t.y - 30 > H + 40) {
        threads.splice(i, 1);
        continue;
      }
      var ddx = player.x - t.x;
      var ddy = player.y - t.y;
      if (ddx * ddx + ddy * ddy < 46 * 46) {
        threads.splice(i, 1);
        collectThread(t);
      }
    }

    for (i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 140 * dt;
      p.life -= dt;
      if (p.life <= 0) { particles.splice(i, 1); }
    }

    pulse = Math.max(0, pulse - dt);
    shake = Math.max(0, shake - dt * 34);
    flash = Math.max(0, flash - dt * 1.4);
  }

  /* ---------- draw ---------- */

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function draw() {
    ctx.save();
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }

    // background
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#070b16");
    g.addColorStop(1, "#0c1120");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // woven textile backdrop
    ctx.strokeStyle = "rgba(110, 160, 255, 0.05)";
    ctx.lineWidth = 1;
    var off = dist * 0.5;
    for (var yy = -26 + (off % 26); yy < H + 26; yy += 26) {
      ctx.beginPath();
      ctx.moveTo(0, yy);
      ctx.lineTo(W, yy);
      ctx.stroke();
    }
    for (var xx = 0; xx < W; xx += 26) {
      ctx.beginPath();
      ctx.moveTo(xx, 0);
      ctx.lineTo(xx, H);
      ctx.stroke();
    }

    // lane separators — glowing threads
    ctx.setLineDash([14, 18]);
    ctx.lineDashOffset = -dist * 0.8;
    ctx.strokeStyle = "rgba(120, 170, 255, 0.28)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(120, 170, 255, 0.5)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(W * 0.375, 0);
    ctx.lineTo(W * 0.375, H);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W * 0.625, 0);
    ctx.lineTo(W * 0.625, H);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // collectible light threads
    var i;
    for (i = 0; i < threads.length; i++) {
      var t = threads[i];
      ctx.strokeStyle = t.color;
      ctx.shadowColor = t.color;
      ctx.shadowBlur = 16;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (var s = 0; s <= 22; s++) {
        var px = t.x - 42 + (84 * s / 22);
        var py = t.y + Math.sin(s / 22 * Math.PI * 2 + t.phase) * 8;
        if (s === 0) { ctx.moveTo(px, py); } else { ctx.lineTo(px, py); }
      }
      ctx.stroke();
      ctx.shadowBlur = 8;
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.arc(t.x - 42, t.y, 3.5, 0, 6.29);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(t.x + 42, t.y, 3.5, 0, 6.29);
      ctx.fill();
    }

    // obstacles — dark knots
    for (i = 0; i < obstacles.length; i++) {
      var o = obstacles[i];
      ctx.save();
      ctx.translate(o.x, o.y);
      ctx.rotate(Math.sin(o.spin) * 0.2);
      ctx.fillStyle = "#06080d";
      ctx.shadowColor = "rgba(255, 70, 90, 0.5)";
      ctx.shadowBlur = 18;
      roundRect(-o.w / 2, -o.h / 2, o.w, o.h, 12);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255, 80, 100, 0.35)";
      ctx.lineWidth = 1.5;
      roundRect(-o.w / 2, -o.h / 2, o.w, o.h, 12);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 90, 110, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-o.w * 0.3, -o.h * 0.25);
      ctx.quadraticCurveTo(0, o.h * 0.1, o.w * 0.28, -o.h * 0.2);
      ctx.stroke();
      ctx.restore();
    }

    // the woven light trail
    drawTrail();

    drawCar();

    for (i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.29);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    if (pulse > 0) {
      ctx.fillStyle = "rgba(160, 200, 255, " + (pulse * 0.5).toFixed(3) + ")";
      ctx.fillRect(0, 0, W, H);
    }
    if (flash > 0) {
      ctx.fillStyle = "rgba(255, 60, 80, " + (flash * 0.35).toFixed(3) + ")";
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();

    var v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
  }

  function drawTrail() {
    if (trail.length < 3) { return; }
    ctx.lineCap = "round";
    for (var i = 1; i < trail.length; i++) {
      var a = i / trail.length;
      ctx.strokeStyle = "hsla(210, 90%, 70%, " + (a * 0.55).toFixed(3) + ")";
      ctx.shadowColor = "hsla(210, 90%, 70%, " + (a * 0.8).toFixed(3) + ")";
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2 + a * 3;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  function drawCar() {
    var x = player.x;
    var y = player.y;
    ctx.shadowColor = "rgba(110, 190, 255, 0.95)";
    ctx.shadowBlur = 26;
    var body = ctx.createLinearGradient(x, y - 38, x, y + 38);
    body.addColorStop(0, "#223044");
    body.addColorStop(1, "#0d131d");
    ctx.fillStyle = body;
    roundRect(x - 24, y - 38, 48, 76, 14);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(140, 200, 255, 0.85)";
    ctx.lineWidth = 1.5;
    roundRect(x - 24, y - 38, 48, 76, 14);
    ctx.stroke();

    ctx.fillStyle = "#0a0f18";
    roundRect(x - 15, y - 14, 30, 40, 9);
    ctx.fill();

    // the four rings (a nod to the A3 that debuted MUNDA textile light)
    ctx.strokeStyle = "rgba(200, 230, 255, 0.9)";
    ctx.lineWidth = 2;
    for (var i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(x - 10.5 + i * 7, y + 6, 3.4, 0, 6.29);
      ctx.stroke();
    }

    ctx.fillStyle = "#bfe0ff";
    ctx.shadowColor = "rgba(190, 230, 255, 0.9)";
    ctx.shadowBlur = 8;
    roundRect(x - 18, y - 36, 12, 4, 2);
    ctx.fill();
    roundRect(x + 6, y - 36, 12, 4, 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  /* ---------- loop ---------- */

  function frame(ts) {
    if (!lastTime) { lastTime = ts; }
    var dt = Math.min(0.05, (ts - lastTime) / 1000);
    lastTime = ts;
    if (state === "playing") {
      update(dt);
    }
    draw();
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { lastTime = 0; }
  });

  setState("start");
})();
