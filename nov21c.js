/* Vicio FOH, more Nov 21 2026 changes (Eric). Loaded by config.js; FOH only; it waits for the board on its own.
   1. Floor, Inside: the map 10 wide by 3.3 tall (25% shorter again; runicons.js made it 4.4), tables keeping their shape.
   2. Floor, once: B6 just to the right of the bar, level with it, and the DJ right above B6. Worked out from the map as
      drawn, so it runs on the Reservations page with Inside showing. The layout from before is kept in
      seating/layout_before_1121d.
   3. Attic inventory count: the one "Folding to-go boxes" line is now the three boxes Vicio carries: pizza boxes, large
      to-go boxes and small to-go boxes.
   4. Beer cooler count: Negra Modelo removed (Eric). Counts already saved for it stay in the record.
   5. Mango Cart removed (Eric): from the bar inventory count, the beer list on the Drinks page, and the beer quiz.
   6. Red Bull removed (Eric): from the N/A inventory count; the one quiz answer that named it now says energy drink.
   7. Also removed from the N/A inventory count (Eric): Sprite (bottled; also off the No alcohol list on the Drinks page),
      Big Marble Ginger Beer, Canada Dry Ginger Ale, Canada Dry Soda Water, Chameleon Espresso, Zing Zang and Clamato.
      Fountain Sprite (bag-in-box) stays.
   8. Inventory: Soda BIBs & CO2 is its own section, right after the Attic count, instead of a group inside it (Eric).
      Counts are saved by item, so nothing already counted is lost; it has its own Submit. The bag-in-box sodas Vicio carries:
      Coke, Sprite, Dr Pepper, Energy drink, Lemonade, Coke Zero, Cranberry and Tonic (Eric).
   9. Soda BIBs & CO2 is rated, not counted (Eric): each line is 100%, 75%, 50%, 25% or Need to order, one tap. Saved as
      1, 0.75, 0.5, 0.25 or 0 in the same place a count goes, and anything on Need to order is listed at the top.
      The buttons are icons: a box filled to the level, and a cart for Need to order (Eric). The CO2 line stays a count of full
      spare tanks (Eric).
  10. Soda products come from Swire now (Eric): the BIB section says so, and the Coke line no longer says Pope Lime.
  11. N/A count: the Sodas and energy group is gone, since sodas have their own section (Eric). Dasani added to Water.
      Mexican Coke and Jarritos Grapefruit are still sold at $5 (Eric), so they are back on the N/A count under Bottled
      sodas, with the same item ids as before so past counts line up. */
(function () {
  if (window.__vicioNov21c || window.VICIO_BOARD !== 'foh') return;
  window.__vicioNov21c = true;
  var A = Array.prototype, IN_OLD = 4.4, IN_H = 3.3;
  function style(css) { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
  style('html body #floor.x-in{aspect-ratio:10/3.3!important}');
  function shorter() {
    var f = document.getElementById('floor'); if (!f || !f.classList.contains('x-in')) return;
    A.forEach.call(f.querySelectorAll('.tbl[data-h44]:not([data-h33])'), function (el) {
      el.dataset.h33 = '1';
      el.style.height = el.style.height.replace(/max\((\d+)px,\s*([\d.]+)%\)/, function (m, px, pc) { return 'max(' + px + 'px, ' + (pc * IN_OLD / IN_H).toFixed(2) + '%)'; });
    });
  }
  function fixLayout1121d() {
    var L = (typeof S !== 'undefined' && S.layout) || {};
    if (!L.fix1121 || L.fix1121d || fixLayout1121d.done || !(L.tables || []).length || typeof save !== 'function') return;
    if ((ui.area || 'Inside') !== 'Inside' || (typeof drag !== 'undefined' && drag && drag.el)) return;
    var fl = document.getElementById('floor'); if (!fl || !fl.classList.contains('x-in')) return;
    var R = fl.getBoundingClientRect(); if (!R.width || !R.height) return;
    fixLayout1121d.done = true;
    var ts = L.tables.map(function (t) { return Object.assign({}, t); }), fx = (L.fixtures || []).map(function (f) { return JSON.parse(JSON.stringify(f)); });
    var inside = function (f) { return (f.area || 'Inside') === 'Inside'; }, cl = function (v) { return Math.max(1, Math.min(99, +(+v).toFixed(1))); };
    var bnd = function (f) { return f.pts ? { l: Math.min.apply(null, f.pts.map(function (p) { return +p[0]; })), r: Math.max.apply(null, f.pts.map(function (p) { return +p[0]; })), t: Math.min.apply(null, f.pts.map(function (p) { return +p[1]; })), b: Math.max.apply(null, f.pts.map(function (p) { return +p[1]; })) } : { l: f.x - f.w / 2, r: f.x + f.w / 2, t: f.y - f.h / 2, b: f.y + f.h / 2 }; };
    var bar = fx.find(function (f) { return inside(f) && !f.on && /\bbar\b/i.test(f.label || ''); }); if (!bar) return;
    var bb = bnd(bar), cy = (bb.t + bb.b) / 2, sw = 28 / R.width * 100, sh = 28 / R.height * 100;
    var b6 = ts.find(function (t) { return /^B\s*6$/i.test(String(t.n).trim()); });
    var x6 = cl(bb.r + sw / 2 + 1), y6 = cl(cy);
    if (b6) { if (inside(b6)) { b6.x = x6; b6.y = y6; } else { b6.ix = x6; b6.iy = y6; } }
    var dj = fx.find(function (f) { return inside(f) && /\bdj\b/i.test(f.label || ''); });
    var dw = Math.max(9, 34 / R.width * 100), dh = Math.max(8, 22 / R.height * 100), dy = cl(Math.max(dh / 2 + 1, y6 - sh / 2 - dh / 2 - 1));
    if (dj && !dj.pts) { dj.x = x6; dj.y = dy; dj.w = +dw.toFixed(1); dj.h = +dh.toFixed(1); dj.on = false; }
    else if (dj) { dj.lx = x6; dj.ly = dy; }
    else fx.push({ label: 'DJ', area: 'Inside', x: x6, y: dy, w: +dw.toFixed(1), h: +dh.toFixed(1) });
    var at = Date.now();
    save('seating/layout_before_1121d', { tables: L.tables, fixtures: L.fixtures || [], at: at });
    S.layout = Object.assign({}, L, { tables: ts, fixtures: fx, fix1121d: at });
    save('seating/layout', { tables: ts, fixtures: fx, fix1121d: at, updated: at });
    render();
  }
  function togoBoxes() {
    try {
      if (typeof COUNTFORMS === 'undefined' || togoBoxes.done) return;
      var f = COUNTFORMS.find(function (x) { return x.id === 'inv_attic'; }); if (!f) return;
      f.groups.forEach(function (g) {
        var i = g[1].findIndex(function (it) { return it[0] === 'a_togo'; }); if (i < 0) return;
        g[1].splice(i, 1, ['a_togopizza', 'Pizza boxes', 'bundles', ''], ['a_togolg', 'To-go boxes, large', 'sleeves', ''], ['a_togosm', 'To-go boxes, small', 'sleeves', '']);
        togoBoxes.done = true;
      });
      if (typeof ES !== 'undefined') { ES['Pizza boxes'] = 'Cajas de pizza'; ES['To-go boxes, large'] = 'Cajas para llevar, grandes'; ES['To-go boxes, small'] = 'Cajas para llevar, chicas'; ES['bundles'] = ES['bundles'] || 'paquetes'; }
    } catch (e) {}
  }
  function bibForm() {
    try {
      if (typeof COUNTFORMS === 'undefined' || bibForm.done || COUNTFORMS.some(function (f) { return f.id === 'inv_bib'; })) return;
      var ai = COUNTFORMS.findIndex(function (f) { return f.id === 'inv_attic'; }); if (ai < 0) return;
      var at = COUNTFORMS[ai], gi = at.groups.findIndex(function (g) { return /co2|soda/i.test(g[0]) && g[1].some(function (it) { return /^a_bib|^a_co2/.test(it[0]); }); });
      if (gi < 0) return;
      var grp = at.groups.splice(gi, 1)[0];
      if (!grp[1].some(function (it) { return it[0] === 'a_bibtonic'; })) { var ci = grp[1].findIndex(function (it) { return /^a_co2/.test(it[0]); }); grp[1].splice(ci < 0 ? grp[1].length : ci, 0, ['a_bibtonic', 'Bag-in-box: Tonic', 'boxes', '']); }
      at.desc = 'Paper goods and cleaning. Soda BIBs and CO2 have their own count below. The freezer is the kitchen\'s count. Partials in tenths, 0.1 to 0.9.';
      grp[1] = grp[1].map(function (it) { return it[0] === 'a_bibcoke' ? ['a_bibcoke', 'Bag-in-box: Coke', it[2], ''] : it; });
      COUNTFORMS.splice(ai + 1, 0, { id: 'inv_bib', name: 'Soda BIBs & CO2', desc: 'Bag-in-box sodas (ordered from Swire) and the CO2.', groups: [['Bag-in-box and CO2', grp[1]]] });
      if (typeof FORMS !== 'undefined') { var fi = FORMS.findIndex(function (f) { return f[0] === 'inv_attic'; }); FORMS.splice(fi + 1, 0, ['inv_bib', 'Soda BIBs & CO2']); }
      if (typeof ES !== 'undefined') { ES['Soda BIBs & CO2'] = 'Bolsas de soda y CO2'; ES['Bag-in-box and CO2'] = 'Bolsas de soda y CO2'; ES['Bag-in-box: Tonic'] = ES['Bag-in-box: Tonic'] || 'Bolsa de soda: T\u00f3nica'; }
      bibForm.done = true;
    } catch (e) {}
  }
  function dropItems() {
    try {
      if (typeof COUNTFORMS === 'undefined' || dropItems.done) return;
      COUNTFORMS.forEach(function (f) { (f.groups || []).forEach(function (g) {
        var i = g[1].findIndex(function (it) { return it[0] === 'b_negramodelo'; }); if (i >= 0) { g[1].splice(i, 1); dropItems.done = true; }
      }); });
    } catch (e) {}
    try {
      if (dropItems.mango) return;
      var isM = function (n) { return /mango cart/i.test(String(n || '')); }, hit = false;
      if (typeof BARINV !== 'undefined') BARINV.forEach(function (g) { for (var i = g[1].length - 1; i >= 0; i--) if (isM(g[1][i])) { g[1].splice(i, 1); hit = true; } });
      if (typeof INVITEMS !== 'undefined') for (var j = INVITEMS.length - 1; j >= 0; j--) if (isM(INVITEMS[j][1])) { INVITEMS.splice(j, 1); hit = true; }
      if (typeof BARMENU !== 'undefined') BARMENU.forEach(function (g) { var l = g[2]; if (Array.isArray(l)) for (var k = l.length - 1; k >= 0; k--) if (isM(l[k][0])) { l.splice(k, 1); hit = true; } });
      if (typeof QUIZZES !== 'undefined' && QUIZZES.beer && Array.isArray(QUIZZES.beer.q)) {
        QUIZZES.beer.q = QUIZZES.beer.q.filter(function (q) { return !isM(q[0]) && !isM(q[1]); });
        QUIZZES.beer.q.forEach(function (q) { if (Array.isArray(q[2])) q[2] = q[2].map(function (w) { return isM(w) ? 'Corona' : w; }); });
        hit = true;
      }
      dropItems.mango = hit;
    } catch (e) {}
    try {
      if (dropItems.rb) return;
      var isR = function (n) { return /red bull/i.test(String(n || '')); };
      if (typeof NABEV !== 'undefined') NABEV.forEach(function (g) { for (var i = g[1].length - 1; i >= 0; i--) if (isR(g[1][i])) g[1].splice(i, 1); });
      if (typeof NAITEMS !== 'undefined') for (var j = NAITEMS.length - 1; j >= 0; j--) if (isR(NAITEMS[j][1])) NAITEMS.splice(j, 1);
      if (typeof QUIZZES !== 'undefined') Object.keys(QUIZZES).forEach(function (k) { var q = QUIZZES[k] && QUIZZES[k].q; if (Array.isArray(q)) q.forEach(function (x) { if (Array.isArray(x[2])) x[2] = x[2].map(function (w) { return String(w).replace(/Red Bull/gi, 'energy drink'); }); }); });
      dropItems.rb = true;
    } catch (e) {}
    try {
      if (dropItems.na2) return;
      var GONE = ['Sprite', 'Big Marble Ginger Beer', 'Canada Dry Ginger Ale', 'Canada Dry Soda Water', 'Chameleon Espresso', 'Zing Zang', 'Clamato'];
      var gone = function (n) { return GONE.indexOf(String(n || '').trim()) >= 0; };
      if (typeof NABEV !== 'undefined') NABEV.forEach(function (g) { for (var i = g[1].length - 1; i >= 0; i--) if (gone(g[1][i])) g[1].splice(i, 1); });
      if (typeof NAITEMS !== 'undefined') for (var j = NAITEMS.length - 1; j >= 0; j--) if (gone(NAITEMS[j][1])) NAITEMS.splice(j, 1);
      if (typeof BARMENU !== 'undefined') BARMENU.forEach(function (g) { var l = g[2]; if (Array.isArray(l) && /no alcohol/i.test(g[0])) for (var k = l.length - 1; k >= 0; k--) if (String(l[k][0]).trim() === 'Sprite') l.splice(k, 1); });
      dropItems.na2 = true;
    } catch (e) {}
    try {
      if (dropItems.na3) return;
      if (typeof NABEV !== 'undefined') {
        for (var g = NABEV.length - 1; g >= 0; g--) if (/^sodas/i.test(NABEV[g][0])) NABEV.splice(g, 1);
        var w = NABEV.find(function (x) { return /^water/i.test(x[0]); }); if (w && w[1].indexOf('Dasani') < 0) w[1].push('Dasani');
        var wi0 = NABEV.findIndex(function (x) { return /^water/i.test(x[0]); }); NABEV.splice(wi0 < 0 ? NABEV.length : wi0, 0, ['Bottled sodas', ['Mexican Coke', 'Jarritos Grapefruit']]);
      }
      if (typeof NAITEMS !== 'undefined') {
        for (var n = NAITEMS.length - 1; n >= 0; n--) if (/^sodas/i.test(NAITEMS[n][2] || '')) NAITEMS.splice(n, 1);
        var fw = NAITEMS.findIndex(function (i) { return /^water/i.test(i[2] || ''); }), sg = typeof slug === 'function' ? slug : function (x) { return x.toLowerCase().replace(/[^a-z0-9]+/g, '_'); };
        NAITEMS.splice(fw < 0 ? NAITEMS.length : fw, 0, [sg('Mexican Coke'), 'Mexican Coke', 'Bottled sodas'], [sg('Jarritos Grapefruit'), 'Jarritos Grapefruit', 'Bottled sodas']);
        if (!NAITEMS.some(function (i) { return i[1] === 'Dasani'; })) { var wi = -1; NAITEMS.forEach(function (i, k) { if (/^water/i.test(i[2] || '')) wi = k; }); var sl = typeof slug === 'function' ? slug('Dasani') : 'dasani'; NAITEMS.splice(wi < 0 ? NAITEMS.length : wi + 1, 0, [sl, 'Dasani', 'Water']); }
      }
      dropItems.na3 = true;
    } catch (e) {}
  }
  var LV = [[1, '100%'], [0.75, '75%'], [0.5, '50%'], [0.25, '25%'], [0, 'Need to order']];
  function lvIcon(v) {
    if (v === 0) return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.8L20 8H6"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/></svg>';
    var h = 16 * v, y = 20 - h;
    return '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="6" y="3.5" width="12" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/>' + (h ? '<rect x="7.6" y="' + y.toFixed(1) + '" width="8.8" height="' + h.toFixed(1) + '" rx="1" fill="currentColor"/>' : '') + '</svg>';
  }
  function lvLabel(v) { var x = LV.find(function (l) { return l[0] === +v; }); return x ? x[1] : (v == null || v === '' ? '' : String(v)); }
  function bibLevels() {
    var sec = document.querySelector('[data-fold="sec_inv_bib"]'); if (!sec || sec.dataset.lv) return;
    sec.dataset.lv = '1';
    var c = (S.inv && S.inv.c) || {}, need = [];
    A.forEach.call(sec.querySelectorAll('input[data-inv]'), function (inp) {
      var id = inp.dataset.inv, v = c[id], cell = inp.closest('td'), row = inp.closest('tr');
      if (/^a_co2/.test(id)) return;
      if (v === 0) need.push((row && row.cells[0] ? row.cells[0].textContent : id).replace(/^Bag-in-box:\s*/, '').replace(/Lift to judge partials/, '').trim());
      cell.innerHTML = '<div class="x-lv" role="group" aria-label="Level">' + LV.map(function (l) {
        return '<button type="button" class="x-lvb' + (l[0] === 0 ? ' need' : '') + (v != null && v !== '' && +v === l[0] ? ' on' : '') + '" data-lv="' + l[0] + '" data-lvid="' + id + '" aria-label="' + l[1] + '" title="' + l[1] + '">' + lvIcon(l[0]) + '<small>' + (l[0] === 0 ? 'Order' : l[1]) + '</small></button>';
      }).join('') + '</div>';
      if (row && row.cells[2] && /^[\d.]+$/.test(row.cells[2].textContent.trim())) row.cells[2].textContent = lvLabel(row.cells[2].textContent.trim());
    });
    A.forEach.call(sec.querySelectorAll('thead th'), function (th) { if (th.textContent.trim() === 'Count') th.textContent = 'Level or count'; });
    var p = sec.querySelector('p.muted'); if (p) p.textContent = 'Tap the level of each bag-in-box, and count the full spare CO2 tanks. Sodas are ordered from Swire.';
    if (need.length && p) p.insertAdjacentHTML('afterend', '<p class="x-need"><span class="pill warn">Need to order</span> ' + need.join(', ') + '</p>');
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-lvid]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var id = b.dataset.lvid, v = +b.dataset.lv, cur = S.inv && S.inv.c ? S.inv.c[id] : undefined;
    if (cur != null && +cur === v) v = null;   /* tap the lit one again to clear it */
    S.inv = Object.assign({}, S.inv, { c: Object.assign({}, (S.inv || {}).c, (function () { var o = {}; o[id] = v; return o; })()) });
    var patch = { c: {} }; patch.c[id] = v; save('barinv/' + ui.week, patch);
    render();
  }, true);
  style('[data-fold="sec_inv_bib"] th:nth-child(2),[data-fold="sec_inv_bib"] td:nth-child(2){display:none}' +
    '.x-lv{display:flex;flex-wrap:wrap;gap:5px;justify-content:flex-end}.x-lvb{display:inline-flex;flex-direction:column;align-items:center;gap:1px;min-height:48px;min-width:52px;padding:4px 7px;border-radius:9px;border:1px solid var(--line,#2E2E34);background:var(--bg,#000);color:var(--ink,#EDEDF0);font:600 14px system-ui,-apple-system,sans-serif;cursor:pointer}' +
    '.x-lvb.on{background:var(--good,#1F7A4D);border-color:var(--good,#1F7A4D);color:#fff}.x-lvb.need.on{background:var(--cherry,#8B1E1E);border-color:var(--cherry,#8B1E1E)}.x-lvb small{font:600 10px/1 system-ui,-apple-system,sans-serif}.x-lvb.need{color:var(--cherry,#E5484D)}.x-lvb.need.on{color:#fff}.x-need{margin:4px 0 8px;font-weight:600}');

  (function start() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || !document.getElementById('view')) return setTimeout(start, 200);
    togoBoxes(); dropItems(); bibForm();
    var r0 = render;
    render = function () { var out = r0.apply(this, arguments); setTimeout(function () { try { shorter(); } catch (e) {} try { fixLayout1121d(); } catch (e) {} }, 30); try { bibLevels(); } catch (e) {} return out; };
    render();
  })();
})();
