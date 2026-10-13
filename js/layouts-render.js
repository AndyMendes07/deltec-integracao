/* Figuras dos layouts do PPTX (logo, arte tracejada das capas/divisorias) em cada cena. Dados: js/layouts.js (gerado). Classico, sem fetch. */
(function () {
  var D = window.DELTEC_LAYOUTS;
  if (!D) return;
  function img(src, cls, it) {
    var e = document.createElement("img");
    e.className = "layout-img " + cls; e.src = src; e.alt = ""; e.decoding = "async"; e.draggable = false;
    e.setAttribute("aria-hidden", "true");
    if (it) e.style.cssText = "left:" + it.x + "%;top:" + it.y + "%;width:" + it.w + "%;height:" + it.h + "%";
    return e;
  }
  Array.prototype.forEach.call(document.querySelectorAll(".cena"), function (el) {
    var nome = D.porSlide[+el.dataset.slides.split(",")[0]], itens = D.layouts[nome] || [], luzes = el.querySelector(".luzes");
    el.dataset.layout = nome;
    if (luzes) { var f = document.createElement("i"); f.className = "luz-feixe"; luzes.appendChild(f); }
    var antes = [], logo = [];                         // arte: depois das luzes e antes do texto; logo: no inicio
    itens.forEach(function (it) {
      if (nome === "CAPA" || nome === "DIVISORIA") {
        if (it.tipo === "fundo") antes.push(img(it.src, "layout-fundo", it));
        else if (it.w > 30) antes.push(img(it.src, "layout-arte", it));
        else logo.push(img(it.src, "layout-logo layout-logo-capa", it));
      }
    });
    if (nome === "DIVISORIA") { var b = document.createElement("i"); b.className = "layout-barra"; b.setAttribute("aria-hidden", "true"); antes.push(b); }
    if (nome === "CONTEUDO" || nome === "MIDIA") {     // rodape do PPT -> canto superior direito (o rodape colide com o conteudo); claro/escuro conforme o tema
      logo.push(img(D.logos.claro, "layout-logo layout-logo-topo logo-claro"));
      if (nome === "CONTEUDO") logo.push(img(D.logos.escuro, "layout-logo layout-logo-topo logo-escuro"));
    }
    antes.forEach(function (n) { luzes ? el.insertBefore(n, luzes.nextSibling) : el.insertBefore(n, el.firstChild); });
    logo.forEach(function (n) { el.insertBefore(n, el.firstChild); });
  });
})();
