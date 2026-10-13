// Preenche o DOM a partir de DELTEC_DATA (classico, sem modulos).
(function () {
  function get(d, path) { return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, d); }

  function resolver(s, d) {
    return String(s).replace(/\{([\w.]+)\}/g, function (m, p) { var v = get(d, p); return v == null ? m : v; });
  }

  var fmt = { m2: function (n) { return n.toLocaleString("pt-BR") + " m²"; } };

  // nome -> [linhas, colunas, grupos opcionais]
  var TABELAS = {
    "beneficios": [function (d) { return d.beneficios.resumo; }, ["beneficio", "valor", "quando", "quem"], function (d) { return d.beneficios.grupos; }],
    "samaritano": [function (d) { return d.planos.samaritano; }, ["procedimento", "valor"]],
    "bradesco-mensalidade": [function (d) { return d.planos.bradesco.mensalidade; }, ["faixa", "titular", "dependente"], function (d) { return d.planos.bradesco.grupos; }],
    "bradesco-coparticipacao": [function (d) { return d.planos.bradesco.coparticipacao; }, ["procedimento", "valor"]],
    "ferias-faltas": [function (d) { return d.ferias.faltas; }, ["faltas", "dias"]],
    "refeitorio": [function (d) { return d.refeitorio; }, ["turno", "horario", "refeicao"]]
  };

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
  }

  function render(d) {
    d = d || window.DELTEC_DATA;
    document.querySelectorAll("[data-bind]").forEach(function (n) {
      var v = get(d, n.dataset.bind);
      n.textContent = n.dataset.fmt ? fmt[n.dataset.fmt](v) : resolver(v, d);
    });
    document.querySelectorAll("[data-href]").forEach(function (n) { n.href = get(d, n.dataset.href); });
    document.querySelectorAll("[data-tabela]").forEach(function (t) {
      var c = TABELAS[t.dataset.tabela];
      if (!c) return;
      var grupos = c[2] ? c[2](d) : null;
      t.textContent = "";
      c[0](d).forEach(function (linha, i) {
        var tr = el("tr");
        c[1].forEach(function (k) { tr.appendChild(el("td", "", resolver(linha[k], d))); });
        if (grupos) tr.dataset.etapa = grupos.findIndex(function (g) { return i >= g[0] && i <= g[1]; });
        t.appendChild(tr);
      });
    });
    document.querySelectorAll("[data-fases]").forEach(function (ol) {
      ol.textContent = "";
      d.obra.fases.forEach(function (f) {
        var li = el("li", "fase fase--" + f.status);
        li.appendChild(el("span", "fase__nome", f.nome));
        if (f.detalhe) li.appendChild(el("span", "fase__detalhe", f.detalhe));
        if (f.prazo) li.appendChild(el("span", "fase__prazo", f.prazo));
        ol.appendChild(li);
      });
    });
    document.querySelectorAll("[data-cronograma]").forEach(function (ol) {
      ol.textContent = "";
      d.cronograma.itens.forEach(function (it) {
        var li = el("li", "cronograma__item");
        li.appendChild(el("span", "cronograma__horario", it.horario));
        li.appendChild(el("span", "cronograma__titulo", it.titulo));
        ol.appendChild(li);
      });
    });
  }

  window.Bind = { render: render, resolver: resolver, fmt: fmt };
})();
