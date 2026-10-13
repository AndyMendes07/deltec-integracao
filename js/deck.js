/* Motor de navegacao: paradas, teclado/clicker, roda, hash, videos, blackout, tema. */
(function () {
  var scenes = [], stops = [], cur = -1;
  var tw = null, finish = null;                     // tween de rolagem em curso
  var snapT = 0, lastWheel = 0, buf = "", bufT = 0, cursorT = 0, resizeT = 0;
  var NEXT = { PageDown: 1, ArrowRight: 1, ArrowDown: 1 }, PREV = { PageUp: 1, ArrowLeft: 1, ArrowUp: 1 };

  function $(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function cenas() { return window.Cenas || {}; }
  function inObra() { return !!(window.Obra && Obra.isActive && Obra.isActive()); }
  function sceneOf(id) { return scenes.filter(function (s) { return s.id === id; })[0]; }
  function maxScroll() { return Math.max(0, document.documentElement.scrollHeight - innerHeight); }
  function instante() { return !!(window.MODO && MODO.instante); }

  function build() {
    var prev = stops[cur];
    scenes = $("[data-scene]").map(function (el) {
      var sl = String(el.dataset.slides || el.dataset.scene.replace(/\D+/g, "")).split(",").map(Number).filter(Boolean);
      return { el: el, id: el.dataset.scene, type: el.dataset.type, slides: sl };
    });
    // contrato: Obra.stops()[k].long descreve o trecho que TERMINA na parada k; ao voltar, vale o flag da parada deixada
    stops = [];
    scenes.forEach(function (s) {
      var top = Math.round(s.el.getBoundingClientRect().top + scrollY);
      if (s.type === "obra" && window.Obra && Obra.sceneId === s.id) {
        Obra.stops().forEach(function (p, k) {
          stops.push({ sceneId: s.id, step: k, scroll: Math.min(p.scroll, maxScroll()), kind: "obra", long: !!p.long });
        });
      } else {
        for (var k = 0, n = +s.el.dataset.steps || 1; k < n; k++)
          stops.push({ sceneId: s.id, step: k, scroll: Math.min(top, maxScroll()), kind: k ? "etapa" : "cena" });
      }
    });
    stops.forEach(function (p, i) { p.index = i; });
    Deck.stops = stops;
    if (prev) {
      var i = stops.findIndex(function (p) { return p.sceneId === prev.sceneId && p.step === prev.step; });
      cur = i >= 0 ? i : Math.min(cur, stops.length - 1);
    }
  }

  function settle(kill) {                           // conclui (ou mata) o tween de rolagem
    var t = tw; tw = null;
    if (t) { if (!kill) t.progress(1); t.kill(); }
    if (finish) { var f = finish; finish = null; f(); }
  }

  function videos(id, acao) {
    var s = sceneOf(id);
    if (!s) return;
    $("video", s.el).forEach(function (v) {
      if (acao === "play") { var r = v.play(); if (r && r.catch) r.catch(function () {}); }
      else { v.pause(); v.currentTime = 0; }
    });
  }

  function go(i, o) {
    o = o || {};
    if (!stops.length) return Promise.resolve();
    i = Math.max(0, Math.min(stops.length - 1, i));
    settle();                                       // o clique nunca espera
    if (cenas().complete) Cenas.complete();
    clearTimeout(snapT);
    var from = stops[cur], to = stops[i], muda = i !== cur, prevCur = cur;
    if (muda) {
      var troca = !from || from.sceneId !== to.sceneId, s = sceneOf(to.sceneId);
      cur = i;
      if (troca && from) {
        videos(from.sceneId, "stop");
        if (cenas().reset) Cenas.reset(sceneOf(from.sceneId).el);
      }
      if (troca && cenas().enter) Cenas.enter(s.el);
      if (to.kind !== "obra" && (!troca || to.step) && cenas().step) Cenas.step(s.el, to.step);
      if (s.type === "video") videos(to.sceneId, to.step >= 1 ? "play" : "stop");
      try { history.replaceState(null, "", "#cena-" + s.slides[0] + (to.kind === "obra" ? "-p" + (to.step + 1) : to.step ? "-p" + to.step : "")); } catch (e) {}
      document.dispatchEvent(new CustomEvent("deck:stop", { detail: { index: i, sceneId: to.sceneId, step: to.step, kind: to.kind } }));
    }
    var y = to.scroll;
    if ((o.instant != null ? o.instant : instante()) || Math.abs(scrollY - y) < 1) { scrollTo(0, y); return Promise.resolve(); }
    return new Promise(function (res) {
      finish = res;
      tw = gsap.to(window, { scrollTo: { y: y, autoKill: false }, duration: o.duration || ((i > prevCur ? to : from).long ? 2 : 1.2), ease: "power2.inOut", onComplete: function () { settle(); } });
    });
  }

  function goSlide(n) {
    var s = scenes.filter(function (s) { return s.slides.indexOf(n) >= 0; })[0];
    if (!s) return Promise.resolve();
    return go(stops.findIndex(function (p) { return p.sceneId === s.id && p.step === 0; }));
  }

  function agendaSnap() {                           // dentro do capitulo: encaixa na parada mais proxima
    clearTimeout(snapT);
    snapT = setTimeout(function () {
      if (tw) return;
      var b = cur;
      stops.forEach(function (p, i) { if (Math.abs(p.scroll - scrollY) < Math.abs(stops[b].scroll - scrollY)) b = i; });
      if (b !== cur || Math.abs(stops[b].scroll - scrollY) > 2) go(b, { duration: 0.6 });
    }, 150);
  }

  function aplicaHash() {
    var m = /^#cena-(\d+)(?:-p(\d+))?$/.exec(location.hash), i = 0;
    if (m) {
      var s = scenes.filter(function (s) { return s.slides[0] === +m[1]; })[0];
      var obra = s && s.type === "obra", n = +(m[2] || (obra ? 1 : 0));   // no capitulo da obra o hash e 1-based (paradas 1-12)
      var k = stops.findIndex(function (p) { return s && p.sceneId === s.id && p.step === (obra ? n - 1 : n); });
      if (k < 0 && obra) k = stops.findIndex(function (p) { return p.sceneId === s.id && p.step === 0; });   // invalido: inicio do capitulo
      if (k >= 0) i = k;
    }
    go(i, { instant: true });
  }

  function blackout(on) {
    var b = document.getElementById("blackout");
    if (!b) { b = document.createElement("div"); b.id = "blackout"; document.body.appendChild(b); }
    b.classList.toggle("on", on == null ? !b.classList.contains("on") : on);
  }
  function blackoutOn() { var b = document.getElementById("blackout"); return !!b && b.classList.contains("on"); }

  function tema(t) {
    var h = document.documentElement;
    t = t || (h.dataset.theme === "light" ? "dark" : "light");
    h.dataset.theme = t;
    try { localStorage.setItem("deltec-tema", t); } catch (e) {}
  }

  function onKey(e) {
    if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
    var k = e.key, dir = 0;
    if (NEXT[k] || (k === " " && !e.shiftKey)) dir = 1;
    else if (PREV[k] || (k === " " && e.shiftKey)) dir = -1;
    var nav = dir || k === "Home" || k === "End";
    if (nav) e.preventDefault();
    if (nav && blackoutOn()) { blackout(false); return; }
    if (dir) go(cur + dir);
    else if (k === "Home") go(0);
    else if (k === "End") go(stops.length - 1);
    else if (/^\d$/.test(k)) { buf += k; clearTimeout(bufT); bufT = setTimeout(function () { buf = ""; }, 2000); }
    else if (k === "Enter" && buf) { var n = +buf; buf = ""; goSlide(n); }
    else if (k === "b" || k === "B" || k === ".") blackout();
    else if (k === "f" || k === "F") {
      try { var r = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); if (r && r.catch) r.catch(function () {}); } catch (x) {}
    } else if (k === "l" || k === "L") tema();
  }

  function onWheel(e) {
    if (e.ctrlKey || !e.deltaY) return;
    if (inObra()) { settle(true); agendaSnap(); return; }   // rolagem nativa; encaixa ao soltar
    e.preventDefault();
    var t = Date.now(), travado = t - lastWheel < 600;      // a trava se renova a cada evento (inercia)
    lastWheel = t;
    if (!travado) go(cur + (e.deltaY > 0 ? 1 : -1));
  }

  function onMove() {
    document.body.classList.remove("sem-cursor");
    clearTimeout(cursorT);
    cursorT = setTimeout(function () { document.body.classList.add("sem-cursor"); }, 2000);
  }

  function rebuild() {
    build();
    if (cur >= 0 && !tw && Math.abs(scrollY - stops[cur].scroll) > 1) scrollTo(0, stops[cur].scroll);
  }

  var Deck = window.Deck = {
    stops: stops,
    current: function () { return cur; },
    go: go, goSlide: goSlide,
    next: function () { return go(cur + 1); },
    prev: function () { return go(cur - 1); },
    init: function () {
      try { history.scrollRestoration = "manual"; } catch (e) {}
      try { var t = localStorage.getItem("deltec-tema"); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
      build();
      document.addEventListener("keydown", onKey);
      addEventListener("wheel", onWheel, { passive: false });
      addEventListener("scroll", function () { if (!tw && inObra()) agendaSnap(); }, { passive: true });
      addEventListener("resize", function () { clearTimeout(resizeT); resizeT = setTimeout(rebuild, 100); });
      addEventListener("mousemove", onMove);
      if (window.ScrollTrigger) ScrollTrigger.addEventListener("refresh", rebuild);
      onMove();
      aplicaHash();
    }
  };
})();
