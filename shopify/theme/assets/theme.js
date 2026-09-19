/* ============================================================
   HANAN — theme script

   Ported from the single-page original. The hash router, the
   hard-coded catalogue and the demo bag are gone: Shopify serves
   real URLs, real products and a real cart. What remains is the
   behaviour that made the page feel like itself — the drawers,
   the reveal-on-scroll, the announcement carousel and the story
   film player — plus the AJAX cart that replaces the demo one.
   ============================================================ */
(function () {
  "use strict";

  var cfg = window.HANAN || {};
  var routes = cfg.routes || {};
  var strings = cfg.strings || {};

  /* ---------- drawers ---------- */
  var scrim = document.getElementById("scrim");

  function openDrawer(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.classList.add("on");
    el.setAttribute("aria-hidden", "false");
    if (scrim) scrim.classList.add("on");
    document.body.style.overflow = "hidden";
    var opener = document.querySelector('[aria-controls="' + id + '"]');
    if (opener) opener.setAttribute("aria-expanded", "true");
    var focusable = el.querySelector("button, a, input");
    if (focusable) focusable.focus({ preventScroll: true });
  }

  function closeAll() {
    document.querySelectorAll(".drawer").forEach(function (d) {
      d.classList.remove("on");
      d.setAttribute("aria-hidden", "true");
    });
    document.querySelectorAll("[aria-controls]").forEach(function (b) {
      b.setAttribute("aria-expanded", "false");
    });
    if (scrim) scrim.classList.remove("on");
    document.body.style.overflow = "";
  }

  var burger = document.getElementById("burger");
  if (burger) burger.onclick = function () { openDrawer("menu"); };
  var bagBtn = document.getElementById("bagBtn");
  if (bagBtn) bagBtn.onclick = function () { openDrawer("bag"); };
  if (scrim) scrim.onclick = closeAll;

  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-close]")) closeAll();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll();
  });

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

  function watch() {
    document.querySelectorAll(".rv:not(.in)").forEach(function (el) { io.observe(el); });
  }
  watch();

  /* ============================================================
     Cart

     Every change goes through Shopify's cart API, then the bag
     drawer is re-rendered from the server with the Section
     Rendering API rather than rebuilt here — so the markup the
     visitor sees always matches what the cart actually holds.
     If any of it fails, the form falls back to a normal POST,
     which works without JavaScript at all.
     ============================================================ */

  function refreshCart() {
    var body = document.getElementById("bagBody");
    if (body) body.setAttribute("aria-busy", "true");

    return fetch("?sections=header", { headers: { Accept: "application/json" } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var html = data && data.header;
        if (!html) throw new Error("no header section returned");
        var doc = new DOMParser().parseFromString(html, "text/html");

        [["bagBody", true], ["bagTotal", false], ["bagCount", false]].forEach(function (pair) {
          var fresh = doc.getElementById(pair[0]);
          var live = document.getElementById(pair[0]);
          if (!fresh || !live) return;
          live.innerHTML = fresh.innerHTML;
          if (fresh.hasAttribute("hidden")) live.setAttribute("hidden", "");
          else live.removeAttribute("hidden");
        });

        var freshBtn = doc.getElementById("checkoutBtn");
        var liveBtn = document.getElementById("checkoutBtn");
        if (freshBtn && liveBtn) liveBtn.disabled = freshBtn.disabled;

        bindCartRemovals();
      })
      .catch(function () {
        /* Server-rendered truth is unavailable — reload rather than
           leave the drawer showing a stale bag. */
        window.location.reload();
      })
      .finally(function () {
        if (body) body.removeAttribute("aria-busy");
      });
  }

  function bindCartRemovals() {
    document.querySelectorAll("[data-cart-remove]").forEach(function (btn) {
      btn.onclick = function () {
        var line = btn.getAttribute("data-cart-remove");
        btn.disabled = true;
        fetch(routes.cart_change_url || "/cart/change.js", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ line: Number(line), quantity: 0 })
        })
          .then(function () { return refreshCart(); })
          .catch(function () { window.location.href = routes.cart_url || "/cart"; });
      };
    });
  }
  bindCartRemovals();

  /* ---------- add to bag ---------- */
  var addForm = document.getElementById("addForm");
  if (addForm) {
    var addBtn = document.getElementById("addBtn");
    var addMsg = document.getElementById("addMsg");
    var defaultMsg = addMsg ? addMsg.textContent : "";

    document.querySelectorAll("#sizeRow .size-radio").forEach(function (radio) {
      radio.addEventListener("change", function () {
        if (!addMsg) return;
        addMsg.textContent = strings.deliveryNote || defaultMsg;
        addMsg.style.color = "";
      });
    });

    addForm.addEventListener("submit", function (e) {
      var chosen = addForm.querySelector('input[name="id"]:checked');
      if (!chosen) {
        /* The radios carry `required`, so a browser normally blocks this
           itself. Catching it here too keeps the message in the page's
           own voice rather than a native bubble. */
        e.preventDefault();
        if (addMsg) {
          addMsg.textContent = strings.chooseSize || "Choose a size first.";
          addMsg.style.color = "var(--gold-dp)";
        }
        var firstSize = document.querySelector("#sizeRow .size-radio:not(:disabled)");
        if (firstSize) firstSize.focus();
        return;
      }

      if (!window.fetch) return;              /* let it post normally */
      e.preventDefault();

      if (addBtn) { addBtn.disabled = true; addBtn.textContent = strings.addingToBag || "Adding…"; }

      fetch(routes.cart_add_url || "/cart/add.js", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(addForm)
      })
        .then(function (r) {
          if (!r.ok) return r.json().then(function (err) { throw err; });
          return r.json();
        })
        .then(function () {
          return refreshCart().then(function () { openDrawer("bag"); });
        })
        .catch(function (err) {
          if (addMsg) {
            addMsg.textContent = (err && err.description) || strings.soldOut || "That size is unavailable.";
            addMsg.style.color = "var(--gold-dp)";
          }
        })
        .finally(function () {
          if (addBtn) {
            addBtn.disabled = false;
            addBtn.textContent = addBtn.getAttribute("data-label") || "Add to bag";
          }
        });
    });

    if (addBtn) addBtn.setAttribute("data-label", addBtn.textContent.trim());
  }

  /* ---------- announcement carousel: auto-rotate, arrows, swipe ---------- */
  (function () {
    var bar = document.getElementById("announce");
    var track = document.getElementById("annTrack");
    if (!bar || !track) return;
    var total = track.children.length;
    var at = 0, timer = null;
    var DWELL = 5200;

    var go = function (i) {
      at = (i + total) % total;
      track.style.transform = "translateX(-" + at * 100 + "%)";
    };
    var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
    var start = function () { stop(); if (total > 1) timer = setInterval(function () { go(at + 1); }, DWELL); };
    var nudge = function (i) { go(i); start(); };

    var prev = document.getElementById("annPrev");
    var next = document.getElementById("annNext");
    if (prev) prev.onclick = function () { nudge(at - 1); };
    if (next) next.onclick = function () { nudge(at + 1); };

    bar.addEventListener("mouseenter", stop);
    bar.addEventListener("mouseleave", start);
    bar.addEventListener("focusin", stop);
    bar.addEventListener("focusout", start);

    var x0 = null;
    bar.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    bar.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(dx < 0 ? at + 1 : at - 1);
      x0 = null; start();
    }, { passive: true });

    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });

    go(0); start();
  })();

  /* ---------- story film ----------
     Ported as-is from the original, minus the router hook. The
     Range-request fallback stays: Shopify's CDN answers 206 so it
     never fires there, but it costs nothing and keeps the player
     working if the film is ever served from somewhere else. */
  (function () {
    var wrap = document.getElementById("storyVid");
    var video = document.getElementById("storyPlayer");
    var btn = document.getElementById("storyPlayBtn");
    if (!wrap || !video || !btn) return;

    var label = btn.querySelector("span");
    var ctl = document.getElementById("storyCtl");
    var guard = null;

    function reset() {
      clearTimeout(guard);
      wrap.classList.remove("playing");
      if (ctl) ctl.hidden = true;
      video.controls = false;
    }
    function fail() {
      reset();
      if (label) label.textContent = "Video unavailable";
      btn.disabled = true;
    }

    /* A missing or undecodable file gives no error event and leaves play()
       pending forever (networkState 3, NO_SOURCE), so a timeout is the only
       reliable catch. video.paused flips to false the instant play() is
       called even when nothing loads, so it is useless as a health check.
       We wait for a real load signal instead. */
    var ok = function () { clearTimeout(guard); };
    video.addEventListener("loadeddata", ok);
    video.addEventListener("playing", ok);
    video.addEventListener("error", function () { if (video.error) fail(); });

    btn.addEventListener("click", function () {
      wrap.classList.add("playing");
      /* Our own bar replaces the native controls, which shrink the scrubber
         to nothing at this player size. Native is the fallback if it is gone. */
      if (ctl) { ctl.hidden = false; paint(); probe(); }
      else video.controls = true;
      clearTimeout(guard);
      guard = setTimeout(function () { if (video.readyState < 2) fail(); }, 8000);
      var p = video.play();
      if (p && p.catch) p.catch(function (err) {
        /* AbortError means play() was interrupted by pause(), e.g. the visitor
           left the page while it loaded. The file is fine, so restore the poster. */
        if (err && err.name === "AbortError") { reset(); return; }
        fail();
      });
    });

    video.addEventListener("ended", function () { reset(); video.currentTime = 0; });

    if (!ctl) return;

    var seek = document.getElementById("vcSeek");
    var time = document.getElementById("vcTime");
    var SKIP = 10;
    var scrubbing = false;

    var sourceEl = video.querySelector("source");
    var SRC = sourceEl ? sourceEl.getAttribute("src") : null;
    var ranged = null;   /* null = unknown, true = 206 host, false = must localise */
    var localCopy = null;
    var want = null;     /* seek target parked until the local copy is ready */
    var seekId = 0;

    var clock = function (s) {
      if (!isFinite(s)) s = 0;
      var m = Math.floor(s / 60);
      return m + ":" + String(Math.floor(s % 60)).padStart(2, "0");
    };

    function paint() {
      var d = video.duration;
      var at = want != null ? want : video.currentTime;
      var pct = isFinite(d) && d > 0 ? (at / d) * 100 : 0;
      var buf = 0;
      for (var i = 0; i < video.buffered.length; i++) {
        if (video.buffered.start(i) <= video.currentTime) buf = video.buffered.end(i);
      }
      seek.style.setProperty("--pct", pct + "%");
      seek.style.setProperty("--buf", (isFinite(d) && d > 0 ? (buf / d) * 100 : 0) + "%");
      if (!scrubbing) seek.value = String(pct);
      time.innerHTML = clock(at) + "&thinsp;/&thinsp;" + clock(d);
    }

    var buffered = function (t) {
      for (var i = 0; i < video.buffered.length; i++) {
        if (t >= video.buffered.start(i) && t <= video.buffered.end(i)) return true;
      }
      return false;
    };

    /* Seeking needs the host to answer Range requests with 206. Some static
       hosts return the whole 200 body instead; the browser then restarts the
       download and playback snaps back to 0 on every forward seek. Detect
       that and fall back to holding the file in memory. */
    function probe() {
      if (ranged !== null || !SRC) return;
      var stop = new AbortController();
      fetch(SRC, { headers: { Range: "bytes=0-1" }, signal: stop.signal })
        .then(function (r) { ranged = r.status === 206; stop.abort(); })
        .catch(function () { ranged = true; })   /* can't tell — assume the host is fine */
        .then(function () { if (ranged === false) localise(); });
    }

    function localise() {
      if (localCopy || !SRC) return localCopy;
      wrap.classList.add("preparing");
      seek.setAttribute("aria-busy", "true");
      localCopy = fetch(SRC).then(function (r) { return r.blob(); }).then(function (blob) {
        var at = want != null ? want : video.currentTime;
        var running = !video.paused;
        video.src = URL.createObjectURL(blob);
        video.addEventListener("loadedmetadata", function () {
          video.currentTime = at;
          want = null;
          if (running) video.play();
          paint();
        }, { once: true });
        video.load();
        ranged = true;                          /* a blob seeks like a local file */
      }).catch(function () { localCopy = null; })
        .finally(function () {
          wrap.classList.remove("preparing");
          seek.removeAttribute("aria-busy");
        });
      return localCopy;
    }

    function seekTo(t) {
      var d = video.duration;
      if (!isFinite(d) || d <= 0) return;
      t = Math.max(0, Math.min(t, d - 0.05));
      if (ranged === false && !buffered(t)) {
        want = t;                               /* park it rather than reset to 0 */
        paint();
        localise();
        return;
      }
      want = null;
      video.currentTime = t;
      verify(t, ++seekId);
    }

    /* If a seek silently lands back at the start, the host is not serving
       ranges however the probe read — localise and retry the same target. */
    function verify(target, id) {
      if (target < 2 || ranged === false) return;
      setTimeout(function () {
        if (id !== seekId) return;
        if (video.currentTime < 1 && target - video.currentTime > 1.5) {
          ranged = false;
          want = target;
          localise();
        }
      }, 900);
    }

    var skip = function (by) { seekTo((want != null ? want : video.currentTime) + by); };

    document.getElementById("vcBack").addEventListener("click", function () { skip(-SKIP); });
    document.getElementById("vcFwd").addEventListener("click", function () { skip(SKIP); });

    var toggle = document.getElementById("vcToggle");
    var playPause = function () { video.paused ? video.play() : video.pause(); };
    toggle.addEventListener("click", playPause);
    video.addEventListener("click", playPause);

    var setPlayState = function () {
      wrap.classList.toggle("paused", video.paused);
      toggle.setAttribute("aria-label", video.paused ? "Play" : "Pause");
    };
    video.addEventListener("play", setPlayState);
    video.addEventListener("pause", setPlayState);

    var mute = document.getElementById("vcMute");
    mute.addEventListener("click", function () { video.muted = !video.muted; });
    video.addEventListener("volumechange", function () {
      wrap.classList.toggle("muted", video.muted);
      mute.setAttribute("aria-label", video.muted ? "Unmute" : "Mute");
    });

    document.getElementById("vcFull").addEventListener("click", function () {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (wrap.requestFullscreen) wrap.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();  /* iPhone Safari */
    });

    seek.addEventListener("pointerdown", function () { scrubbing = true; });
    var release = function () { if (!scrubbing) return; scrubbing = false; paint(); };
    seek.addEventListener("pointerup", release);
    seek.addEventListener("pointercancel", release);
    seek.addEventListener("input", function () {
      var d = video.duration;
      if (!isFinite(d) || d <= 0) return;
      seekTo((Number(seek.value) / 100) * d);
      paint();
    });
    seek.addEventListener("change", release);

    wrap.addEventListener("keydown", function (e) {
      if (e.target === seek) return;
      if (e.key === "ArrowLeft") { skip(-SKIP); e.preventDefault(); }
      else if (e.key === "ArrowRight") { skip(SKIP); e.preventDefault(); }
    });

    ["loadedmetadata", "durationchange", "timeupdate", "progress", "seeked"].forEach(function (ev) {
      video.addEventListener(ev, paint);
    });
    setPlayState();
    paint();
  })();

  /* ---------- theme editor ----------
     Sections are re-rendered in place by the editor, so anything
     bound above has to be rebound when that happens. */
  document.addEventListener("shopify:section:load", function () {
    watch();
    bindCartRemovals();
  });
})();
