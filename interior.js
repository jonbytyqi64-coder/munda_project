// AI Assistant — application logic
// Sends the user's question to OpenRouter and renders the answer.

(function () {
  "use strict";

  const API_URL = "https://openrouter.ai/api/v1/chat/completions";
  const API_KEY = ""; // no key bundled - set your own or use the free render fallback
  const MODEL = "openai/gpt-4o-mini";

  const form = document.getElementById("chat-form");
  window.__OR_API_KEY = API_KEY; // shared with the photoreal render feature (same key, same origin)
  const input = document.getElementById("question");
  const output = document.getElementById("output");
  const submitBtn = document.getElementById("submit");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const question = input.value.trim();
    if (!question) {
      return;
    }

    output.textContent = "thinking";
    submitBtn.disabled = true;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: question }],
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed with status " + response.status);
      }

      const data = await response.json();
      const answer = data.choices[0].message.content;

      output.textContent = answer;
      input.value = "";
    } catch (error) {
      output.textContent = "something went wrong, try again";
    } finally {
      submitBtn.disabled = false;
    }
  });
})();

// Audi Interior — cockpit experience
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var interior = document.querySelector(".interior");
  var cockpit = $("cockpit");
  if (!interior || !cockpit) {
    return;
  }

  var boot = $("boot");
  var clusterUI = $("cluster-ui");
  var speedNeedle = $("needle-speed");
  var rpmNeedle = $("needle-rpm");
  var speedReadout = $("speed-readout");
  var gearReadout = $("gear-readout");
  var slider = $("speed-slider");
  var speedValue = $("speed-value");
  var btnPower = $("btn-power");
  var powerLabel = $("power-label");
  var btnLights = $("btn-lights");
  var btnRev = $("btn-rev");

  var SPEED = { cx: 165, cy: 410, r: 64, min: -120, max: 120, vmax: 240 };
  var TACH = { cx: 340, cy: 410, r: 64, min: -120, max: 120, vmax: 8000 };

  var engineOn = false;
  var lightsOn = false;
  var bootTimer = null;
  var speed = 0;

  var NS = "http://www.w3.org/2000/svg";

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) {
        e.setAttribute(k, attrs[k]);
      }
    }
    return e;
  }

  function polar(cx, cy, r, deg) {
    var rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
  }

  function setNeedle(n, deg) {
    n.style.transform = "rotate(" + deg + "deg)";
  }

  function rpmDeg(rpm) {
    return TACH.min + (rpm / TACH.vmax) * (TACH.max - TACH.min);
  }

  function buildGauge(containerId, g, majorStep) {
    var container = $(containerId);
    if (!container) {
      return;
    }
    var frag = document.createDocumentFragment();
    var minorStep = majorStep / 4;
    var v;
    for (v = 0; v <= g.vmax; v += minorStep) {
      var deg = g.min + (v / g.vmax) * (g.max - g.min);
      var isMajor = v % majorStep === 0;
      var p1 = polar(g.cx, g.cy, g.r - (isMajor ? 15 : 9), deg);
      var p2 = polar(g.cx, g.cy, g.r - 3, deg);
      frag.appendChild(el("line", {
        x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
        stroke: isMajor ? "#cfd6e2" : "#4a5260",
        "stroke-width": isMajor ? 2.5 : 1.4
      }));
      if (isMajor) {
        var p = polar(g.cx, g.cy, g.r - 27, deg);
        var label = g.vmax > 1000 ? String(v / 1000) : String(v);
        var t = el("text", {
          x: p.x, y: p.y, fill: "#8a93a3", "font-size": 11,
          "text-anchor": "middle", "dominant-baseline": "central",
          "font-family": "Orbitron, sans-serif"
        });
        t.textContent = label;
        frag.appendChild(t);
      }
    }
    container.appendChild(frag);
  }

  function updateSpeed() {
    speed = Number(slider.value);
    speedValue.textContent = String(speed);
    speedReadout.textContent = String(speed);
    setNeedle(speedNeedle, speed - 120);
    gearReadout.textContent = speed === 0 ? "P" : "D";
    setNeedle(rpmNeedle, rpmDeg(850 + speed * 19.5));
  }

  function setEngine(on) {
    clearTimeout(bootTimer);
    engineOn = on;
    if (on) {
      interior.classList.remove("off");
      btnPower.classList.add("is-on");
      powerLabel.textContent = "Engine on";
      clusterUI.classList.add("hidden");
      boot.classList.remove("hidden");
      setNeedle(speedNeedle, SPEED.min);
      setNeedle(rpmNeedle, TACH.min);
      cockpit.classList.add("booting");
      bootTimer = setTimeout(function () {
        cockpit.classList.remove("booting");
        boot.classList.add("hidden");
        clusterUI.classList.remove("hidden");
        updateSpeed(); // sweeps the needles to idle
        slider.disabled = false;
        btnLights.disabled = false;
        btnRev.disabled = false;
        if (!lightsOn) {
          lightsOn = true;
          cockpit.classList.add("lights-on");
          btnLights.classList.add("is-on");
        }
      }, 2100);
    } else {
      interior.classList.add("off");
      btnPower.classList.remove("is-on");
      powerLabel.textContent = "Start engine";
      cockpit.classList.remove("booting", "lights-on");
      lightsOn = false;
      btnLights.classList.remove("is-on");
      boot.classList.remove("hidden");
      clusterUI.classList.add("hidden");
      setNeedle(speedNeedle, SPEED.min);
      setNeedle(rpmNeedle, TACH.min);
      slider.value = 0;
      slider.disabled = true;
      btnLights.disabled = true;
      btnRev.disabled = true;
      updateSpeed();
    }
  }

  btnPower.addEventListener("click", function () {
    setEngine(!engineOn);
  });

  // subtle 3D tilt on the cockpit as the mouse moves over it
  var stage = document.querySelector(".interior__stage");
  if (stage) {
    stage.addEventListener("mousemove", function (e) {
      var r = stage.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      cockpit.style.transform =
        "perspective(1100px) rotateY(" + (nx * 4).toFixed(2) + "deg) rotateX(" + (-ny * 3).toFixed(2) + "deg)";
    });
    stage.addEventListener("mouseleave", function () {
      cockpit.style.transform = "";
    });
  }

  slider.addEventListener("input", updateSpeed);

  btnLights.addEventListener("click", function () {
    if (!engineOn) {
      return;
    }
    lightsOn = !lightsOn;
    cockpit.classList.toggle("lights-on", lightsOn);
    btnLights.classList.toggle("is-on", lightsOn);
  });

  btnRev.addEventListener("click", function () {
    if (!engineOn) {
      return;
    }
    cockpit.classList.remove("revving");
    void cockpit.getBoundingClientRect();
    cockpit.classList.add("revving");
    setNeedle(rpmNeedle, rpmDeg(6200));
    setTimeout(function () {
      setNeedle(rpmNeedle, rpmDeg(850 + speed * 19.5));
    }, 700);
  });

  var swatches = document.querySelectorAll(".swatch");
  Array.prototype.forEach.call(swatches, function (s) {
    s.addEventListener("click", function () {
      interior.style.setProperty("--ambient", s.getAttribute("data-ambient"));
      Array.prototype.forEach.call(swatches, function (x) {
        x.classList.remove("is-active");
      });
      s.classList.add("is-active");
    });
  });

  buildGauge("ticks-speed", SPEED, 40);
  buildGauge("ticks-tach", TACH, 2000);

  // initial state: engine off, needles parked
  setNeedle(speedNeedle, SPEED.min);
  setNeedle(rpmNeedle, TACH.min);

  // auto-start for the wow moment
  setTimeout(function () {
    setEngine(true);
  }, 500);
})();

// Photoreal view — AI image generation: OpenRouter (Krea Turbo, cheap) with a free-service fallback
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var viewSvg = $("view-svg");
  var viewPhoto = $("view-photo");
  if (!viewSvg || !viewPhoto) {
    return;
  }

  var IMG_URL = "https://openrouter.ai/api/v1/chat/completions";
  var IMG_API = "https://openrouter.ai/api/v1/images";
  var CACHE_KEY = "audi-interior-photoreal-v1";

  var img = $("photo-img");
  var status = $("photo-status");
  var btnGen = $("btn-photo-gen");
  var btnSave = $("btn-photo-save");
  var viewBtns = document.querySelectorAll(".view-btn");

  var photoUrl = null;
  var busy = false;

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = "photo__status" + (kind ? " is-" + kind : "");
  }

  function cacheGet() {
    try { return localStorage.getItem(CACHE_KEY); } catch (e) { return null; }
  }

  function cacheSet(v) {
    try { localStorage.setItem(CACHE_KEY, v); } catch (e) { /* private mode — ignore */ }
  }

  function showPhoto(url, source) {
    photoUrl = url;
    img.classList.add("is-loading");
    img.onload = function () { img.classList.remove("is-loading"); };
    img.onerror = function () {
      img.classList.remove("is-loading");
      setStatus("The render service didn't respond — click \u201cGenerate render\u201d to try again.", "error");
    };
    img.src = url;
    btnSave.hidden = false;
    try { sessionStorage.removeItem("audi-photo-failed"); } catch (e) { /* ignore */ }
    if (source === "pollinations") {
      setStatus("Photoreal render ready — free render service (no credits needed). Add OpenRouter credits to unlock the premium model.", "done");
    } else {
      setStatus("Photoreal render ready — generated with your OpenRouter key (cached in this browser).", "done");
    }
  }

  function pollinationsUrl(prompt) {
    return "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt) +
      "?width=1280&height=720&nologo=true&model=flux";
  }

  function extractImageUrl(data) {
    // /api/v1/images shape
    if (data && Array.isArray(data.data) && data.data.length) {
      var d0 = data.data[0];
      if (d0 && d0.b64_json) {
        return "data:" + (d0.media_type || "image/png") + ";base64," + d0.b64_json;
      }
      if (d0 && d0.url) {
        return d0.url;
      }
    }
    // chat/completions shape
    var msg = data && data.choices && data.choices[0] && data.choices[0].message;
    if (!msg) {
      return null;
    }
    if (msg.images && msg.images.length && msg.images[0].imageUrl && msg.images[0].imageUrl.url) {
      return msg.images[0].imageUrl.url;
    }
    var c = msg.content;
    if (Array.isArray(c)) {
      for (var i = 0; i < c.length; i++) {
        var part = c[i];
        if (part && part.type === "image_url") {
          var u = part.image_url && (part.image_url.url || part.image_url);
          if (u) { return u; }
        }
      }
    }
    return null;
  }

  function generate() {
    if (busy) { return; }
    var key = window.__OR_API_KEY;
    busy = true;
    btnGen.disabled = true;
    img.classList.add("is-loading");
    setStatus("Generating photorealistic Audi interior… (one-time, budget-friendly model)", "busy");

    var prompt = [
      "Photorealistic interior of a modern Audi car, photographed from the driver's seat at night.",
      "Virtual Cockpit digital instrument cluster with glowing dials, flat-bottom leather steering wheel with the four-ring logo,",
      "large MMI touchscreen, elegant ambient LED light strips glowing soft ice-blue along the dashboard and doors,",
      "quilted leather sport seats, carbon-fiber and brushed-aluminum trim, soft reflections on glossy surfaces,",
      "shallow depth of field, cinematic automotive photography, ultra-detailed, 8k, no people"
    ].join(" ");

    if (!key) {
      // no OpenRouter key bundled — use the free render service directly
      var freeUrl = pollinationsUrl(prompt);
      cacheSet(freeUrl);
      showPhoto(freeUrl, "pollinations");
      busy = false;
      btnGen.disabled = false;
      img.classList.remove("is-loading");
      return;
    }

    // tier 1: cheap dedicated image API (Krea); tier 2: chat-completions image model as fallback
    var tiers = [
      { kind: "images", model: "krea/krea-2-medium-turbo" },
      { kind: "chat", model: "google/gemini-3.1-flash-lite-image", maxTokens: 4096, aspect: "16:9" }
    ];

    function attempt(cfg) {
      var req;
      if (cfg.kind === "images") {
        req = { url: IMG_API, body: { model: cfg.model, prompt: prompt } };
      } else {
        var b = {
          model: cfg.model,
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
          stream: false,
          max_tokens: cfg.maxTokens
        };
        if (cfg.aspect) { b.aspect_ratio = cfg.aspect; }
        req = { url: IMG_URL, body: b };
      }
      return fetch(req.url, {
        method: "POST",
        headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      }).then(function (r) {
        return r.json().catch(function () { return null; }).then(function (j) {
          return { ok: r.ok, status: r.status, json: j };
        });
      });
    }

    function retryable(res) {
      var t = res.json && res.json.error ? JSON.stringify(res.json.error) : "";
      // only fall through on request-shape problems — credit errors are terminal (no surprise spending)
      return !res.ok && /aspect|parameter|unsupported|modalities|endpoint/i.test(t);
    }

    function runTier(i) {
      return attempt(tiers[i]).then(function (res) {
        if (retryable(res) && i + 1 < tiers.length) {
          return runTier(i + 1);
        }
        return res;
      });
    }

    runTier(0).then(function (res) {
      var j = res.json;
      if (!res.ok || !j) {
        var msg = j && j.error ? (j.error.message || JSON.stringify(j.error)) : ("HTTP " + res.status);
        throw new Error(String(msg).slice(0, 220));
      }
      var url = extractImageUrl(j);
      if (!url) { throw new Error("The model answered without an image."); }
      // data URLs can be huge — only cache what fits in localStorage
      if (url.indexOf("data:") !== 0 || url.length < 2500000) {
        cacheSet(url);
      }
      showPhoto(url);
    }).catch(function () {
      // OpenRouter unavailable (no credits, quota, outage…) — fall back to the free render service
      var pu = pollinationsUrl(prompt);
      cacheSet(pu);
      showPhoto(pu, "pollinations");
    }).then(function () {
      busy = false;
      btnGen.disabled = false;
      img.classList.remove("is-loading");
    });
  }

  btnGen.addEventListener("click", generate);

  btnSave.addEventListener("click", function () {
    if (!photoUrl) { return; }
    var a = document.createElement("a");
    a.href = photoUrl;
    a.download = "audi-interior.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  function setView(v) {
    viewSvg.classList.toggle("active", v === "svg");
    viewPhoto.classList.toggle("active", v === "photo");
    Array.prototype.forEach.call(viewBtns, function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-view") === v);
    });
  }

  Array.prototype.forEach.call(viewBtns, function (b) {
    b.addEventListener("click", function () {
      setView(b.getAttribute("data-view"));
    });
  });

  // warm the cache once: use a stored render if we have one, otherwise generate it
  var cached = cacheGet();
  if (cached) {
    showPhoto(cached);
  } else {
    setTimeout(function () {
      if (!busy && !photoUrl) {
        generate();
      }
    }, 1500);
  }
})();
