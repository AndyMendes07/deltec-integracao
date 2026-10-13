/* Cenas: entrada, sub-etapas, contadores e titulos palavra a palavra. API: init, enter, step, reset, complete. */
window.Cenas = (function () {
  var MAX = 0.8, MAX_REDUZIDO = 0.25;
  var ativos = [];                                   // timelines em curso (complete() fecha todas)
  var ANIMA = ".anima";                              // itens que entram em sequencia (blur -> nitido)
  var LIMPA = "opacity,transform,filter,--desenho";

  function $(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function reduzido() { return !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }

  function init() {
    if (init.feito) return;
    init.feito = true;
    if (!window.SplitText) return;
    $(".t-capa, .t-cena, .cena-titulo").forEach(function (t) {
      if (t._split) return;
      t._split = SplitText.create(t, { type: "words", wordsClass: "palavra", aria: "auto" });
    });
  }

  // ---- contador: "R$ 250,00" / "+ de 1.000" / "40%" -> anima so o trecho numerico, termina no texto exato
  function alvoContador(el) {
    var f = el.dataset.final, m = /\d[\d.,]*/.exec(f);
    if (!m) return null;
    var s = m[0], vir = s.lastIndexOf(","), dec = vir >= 0 ? s.length - vir - 1 : 0;
    var milhar = s.indexOf(".") >= 0, valor = parseFloat((vir >= 0 ? s.slice(0, vir) : s).replace(/\./g, "") + (dec ? "." + s.slice(vir + 1) : ""));
    return {
      escreve: function (p) {
        var v = (valor * p).toFixed(dec).split("."), i = v[0];
        if (milhar) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        el.textContent = f.slice(0, m.index) + i + (dec ? "," + v[1] : "") + f.slice(m.index + s.length);
      }
    };
  }
  function fimContadores(el) { $(".contador[data-final]", el).forEach(function (c) { c.textContent = c.dataset.final; }); }

  // ---- sub-etapas
  function step(el, i) {
    $("[data-etapa]", el).forEach(function (e) {
      if (+e.dataset.etapa <= i) e.setAttribute("data-visivel", "1"); else e.removeAttribute("data-visivel");
    });
  }

  // ---- mascote: 2.5D por transform (so ha poses estaticas). A base fica plantada: nada de y, so rotacao/escala a partir da base.
  var EASE = "sine.inOut";
  var ACOES = {
    aponta: function (t, m) { t.to(m, { x: 10, rotation: 3, duration: 0.22, ease: "power2.out" }).to(m, { x: 0, rotation: 0, duration: 0.25 }).to(m, { x: 10, rotation: 3, duration: 0.22, ease: "power2.out" }).to(m, { x: 0, rotation: 0, duration: 0.35, ease: "back.out(2)" }); },
    mostra: function (t, m) { t.to(m, { rotation: 3.5, scale: 1.05, duration: 0.35, ease: "power2.out" }).to(m, { duration: 0.5 }).to(m, { rotation: 0, scale: 1, duration: 0.5, ease: "back.out(2)" }); },
    joia: function (t, m) { t.to(m, { scaleY: 1.07, scaleX: 0.97, duration: 0.22, ease: "power2.out" }).to(m, { scaleY: 1, scaleX: 1, duration: 0.6, ease: "bounce.out" }); },
    aceno: function (t, m) { t.to(m, { rotation: 5, duration: 0.15, ease: EASE }).to(m, { rotation: -4, duration: 0.25, ease: EASE }).to(m, { rotation: 4, duration: 0.25, ease: EASE }).to(m, { rotation: 0, duration: 0.2, ease: EASE }); }
  };
  function mascotes(el) { return $("img.mascote", el); }
  function entradaMascote(tl, el) {                  // entra de lado (soltos) ou de baixo (dentro de painel), mola + esmagar ao pousar; termina em <= 0.8 s
    mascotes(el).forEach(function (m) {
      var solto = m.classList.contains("mascote-base") || !!m.closest(".mascote-base");
      var de = solto ? { xPercent: 55 } : { yPercent: 35 };
      tl.fromTo(m, Object.assign({ opacity: 0, scale: 0.92, transformOrigin: "50% 100%" }, de),
        { xPercent: 0, yPercent: 0, opacity: 1, scale: 1, duration: 0.55, ease: "back.out(1.7)" }, 0.05)
        .to(m, { scaleX: 1.05, scaleY: 0.95, duration: 0.08, ease: "power1.out" }, 0.6)
        .to(m, { scaleX: 1, scaleY: 1, duration: 0.12, ease: "power2.out" }, 0.68);
    });
  }
  // ---- quadros extras (tools/mascote_layers.py): piscar e braco/objeto. So troca o src entre quadros ja carregados; nada por frame.
  var QUADROS = {
    aceno: [["a1", 0], ["a2", 0.18], ["a1", 0.36], ["a2", 0.54], ["a1", 0.72], ["base", 0.9]],
    aponta: [["a1", 0], ["a2", 0.22], ["a1", 0.5], ["a2", 0.72], ["base", 1.0]],
    mostra: [["a1", 0.05], ["a2", 0.3], ["a1", 1.0], ["base", 1.3]]
  };
  function quadrosDe(m) {
    var base = m.getAttribute("src"), id = /([0-9a-f]{10})\.webp$/.exec(base), d = window.DELTEC_MASCOTES && id && window.DELTEC_MASCOTES[id[1]];
    if (!d) return null;
    if (!m._q) {
      var q = { base: base }, dir = "assets/img/mascote/" + id[1];
      if (d.blink) q.blink = dir + "-blink.webp";
      for (var k = 1; k <= d.braco; k++) q["a" + k] = dir + "-a" + k + ".webp";
      m._q = q; m._pre = [];
      Object.keys(q).forEach(function (n) { var im = new Image(); im.src = q[n]; if (im.decode) im.decode().catch(function () {}); m._pre.push(im); });
    }
    return m._q;
  }
  function troca(m, src) { if (m.getAttribute("src") !== src) m.setAttribute("src", src); }
  function piscar(el, m, q) {                         // a cada 3-5 s, 130 ms de olhos fechados (nao pisca no meio de um gesto de braco)
    el._idle.push(gsap.delayedCall(3 + Math.random() * 2, function () {
      if (!m._gesto) troca(m, q.blink);
      el._idle.push(gsap.delayedCall(0.13, function () { if (!m._gesto) troca(m, q.base); piscar(el, m, q); }));
    }));
  }
  function gesto(el, m, q, pose) {
    var seq = QUADROS[pose];
    if (!seq || !q.a1) return;
    var t = gsap.timeline();
    seq.forEach(function (s) { t.call(function () { m._gesto = s[0] !== "base"; troca(m, q[s[0]]); }, null, s[1]); });
    el._idle.push(t);
  }

  function idle(el) {                                // respiracao + balanco + acao da pose; so enquanto a cena e a atual
    if (el._idle || reduzido()) return;
    el._idle = [];
    mascotes(el).forEach(function (m, i) {
      var q = quadrosDe(m);
      if (q && q.blink) piscar(el, m, q);
      el._idle.push(gsap.to(m, { scaleY: 1.015, duration: 2.4, ease: EASE, yoyo: true, repeat: -1, transformOrigin: "50% 100%" }));
      var mv = gsap.timeline({ repeat: -1, delay: 0.6 + i * 0.4 });
      mv.to(m, { rotation: 1.2, x: 3, duration: 1.8, ease: EASE }).to(m, { rotation: -1, x: -3, duration: 1.8, ease: EASE }).to(m, { rotation: 0, x: 0, duration: 0.6, ease: EASE });
      (ACOES[m.dataset.pose] || ACOES.joia)(mv, m);
      if (q && q.a1) mv.call(function () { gesto(el, m, q, m.dataset.pose); });
      mv.to({}, { duration: 1.4 });
      el._idle.push(mv);
    });
  }
  function paraIdle(el) {
    (el._idle || []).forEach(function (t) { t.kill(); });
    el._idle = null;
    mascotes(el).forEach(function (m) { m._gesto = false; if (m._q) troca(m, m._q.base); });
  }

  // onda de luz teal que cruza a tela na troca de cena; fora do enter() (nao conta nos 0.8 s) e morta por complete()
  var onda = null;
  function ondaLuz() {
    var o = document.querySelector(".fl-onda");
    if (!o || reduzido()) return;
    if (onda) onda.kill();
    onda = gsap.fromTo(o, { xPercent: -100, skewX: -18, opacity: 1 }, { xPercent: 230, duration: 1.1, ease: "power2.inOut", onComplete: function () { gsap.set(o, { opacity: 0 }); } });
  }
  function fimOnda() { if (onda) { onda.kill(); onda = null; gsap.set(".fl-onda", { opacity: 0 }); } }

  function enter(el) {
    ondaLuz();
    if (el._tl) el._tl.kill();
    paraIdle(el);
    gsap.killTweensOf(mascotes(el));
    init();
    fimContadores(el);
    step(el, 0);
    var tl = gsap.timeline({ onComplete: function () { limpa(el); idle(el); } });
    el._tl = tl;
    ativos.push({ tl: tl, el: el });
    var cab = $(".cena-cab, .capa-num, .capa-titulo, .capa-sub, .video-moldura, .cena-rotulo", el)
      ;
    var itens = $(ANIMA, el), contas = $(".contador[data-final]", el);

    if (reduzido()) {                                // so opacidade, <= 0.3 s
      tl.fromTo(cab.concat(itens), { opacity: 0 }, { opacity: 1, duration: MAX_REDUZIDO, ease: "none" }, 0);
      return tl;
    }

    var titulo = $(".t-capa, .t-cena, .cena-titulo", el), palavras = [];
    titulo.forEach(function (t) { palavras = palavras.concat(t._split ? t._split.words : []); });
    if (palavras.length) {
      var s = Math.min(0.05, 0.3 / Math.max(1, palavras.length - 1));
      tl.fromTo(palavras, { opacity: 0, yPercent: 40, filter: "blur(8px)" },
        { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 0.4, ease: "power3.out", stagger: s }, 0);
    }
    var semTitulo = cab.filter(function (e) { return !e.querySelector(".t-capa, .t-cena, .cena-titulo") && !e.matches(".t-capa, .t-cena, .cena-titulo"); });
    if (semTitulo.length) tl.fromTo(semTitulo, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", stagger: 0.04 }, 0);
    if (itens.length) {
      var d = 0.3, ini = 0.15, st = Math.min(0.06, (MAX - ini - d) / Math.max(1, itens.length - 1));   // 0,06 s; cai so se estourar 0,8 s
      tl.fromTo(itens, { opacity: 0, y: 18, filter: "blur(10px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: d, ease: "power2.out", stagger: st }, ini);
      tl.fromTo(itens, { "--desenho": 0 }, { "--desenho": 1, duration: 0.3, ease: "power1.inOut", stagger: st }, ini);   // borda se desenha
    }
    entradaMascote(tl, el);
    contas.forEach(function (c) {
      var a = alvoContador(c); if (!a) return;
      var o = { p: 0 };
      a.escreve(0);
      tl.to(o, { p: 1, duration: 0.7, ease: "power2.out", onUpdate: function () { a.escreve(o.p); }, onComplete: function () { c.textContent = c.dataset.final; } }, 0.1);
    });
    return tl;
  }

  function limpa(el) {
    gsap.set($(".palavra, " + ANIMA + ", .cena-cab, .capa-num, .capa-titulo, .capa-sub, .video-moldura, .cena-rotulo", el), { clearProps: LIMPA });
    fimContadores(el);
  }

  function complete() {
    fimOnda();
    var l = ativos; ativos = [];
    l.forEach(function (a) { a.tl.progress(1); limpa(a.el); });
  }

  function reset(el) {
    if (el._tl) { el._tl.kill(); el._tl = null; }
    paraIdle(el);
    gsap.killTweensOf(mascotes(el));
    gsap.set(mascotes(el), { clearProps: "transform,opacity" });
    limpa(el);
    $("[data-etapa]", el).forEach(function (e) { e.removeAttribute("data-visivel"); });
  }

  return { init: init, enter: enter, step: step, reset: reset, complete: complete };
})();
