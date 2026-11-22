/* Vicio FOH, more Nov 21 2026 changes (Eric). Loaded by config.js; FOH only; it waits for the board on its own.
   1. Floor, Inside: the map 10 wide by 3.3 tall (25% shorter again; runicons.js made it 4.4), tables keeping their shape.
   2. Floor, once: B6 just to the right of the bar, level with it, and the DJ right above B6. Worked out from the map as
      drawn, so it runs on the Reservations page with Inside showing. The layout from before is kept in
      seating/layout_before_1121d.
   3. Attic inventory count: the one "Folding to-go boxes" line is now the three boxes Vicio carries: pizza boxes, large
      to-go boxes and small to-go boxes. */
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
  (function start() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || !document.getElementById('view')) return setTimeout(start, 200);
    togoBoxes();
    var r0 = render;
    render = function () { var out = r0.apply(this, arguments); setTimeout(function () { try { shorter(); } catch (e) {} try { fixLayout1121d(); } catch (e) {} }, 30); return out; };
    render();
  })();
})();
