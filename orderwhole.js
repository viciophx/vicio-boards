/* Vicio FOH: bar orders in whole bottles (Eric, Nov 22 2026). Loaded by config.js; FOH only.
   You can't order half a bottle, so the Order column on the bar and N/A counts and the Tuesday order list round up to the
   next whole bottle or unit: par 2 with 1.3 on the shelf orders 1, par 1 with 0.2 left orders 1. House batches are made,
   not ordered, so they never go on the order. */
(function () {
  if (window.__vicioOrderWhole || window.VICIO_BOARD !== 'foh') return;
  window.__vicioOrderWhole = true;
  function whole(id, c) {
    if (typeof parOf !== 'function') return null;
    var p = parOf(id), v = c[id] == null || c[id] === '' || isNaN(+c[id]) ? null : +c[id];
    return p != null && v != null ? Math.max(0, Math.ceil(p - v - 1e-9)) : null;
  }
  function isBatch(id) { return (typeof INVITEMS !== 'undefined' ? INVITEMS : []).some(function (i) { return i[0] === id && /\(batch\)/i.test(i[1]); }); }
  (function start() {
    if (typeof needCell !== 'function' || typeof orderLines !== 'function' || typeof render !== 'function') return setTimeout(start, 200);
    needCell = function (id, c) {
      if (isBatch(id)) return '\u2013';
      var nd = whole(id, c); return nd == null ? '\u2013' : nd ? '<span class="pill warn">' + nd + '</span>' : '<span class="pill good">0</span>';
    };
    orderLines = function (c) {
      var out = [], beer = COUNTFORMS.find(function (f) { return f.id === 'inv_beer'; });
      if (beer) beer.groups.forEach(function (g) { g[1].forEach(function (it) { var p = it[4], v = c[it[0]] == null || c[it[0]] === '' ? null : +c[it[0]]; if (p != null && v != null && p - v > 0) out.push(['Beer cooler', it[1], Math.ceil(p - v - 1e-9), it[2]]); }); });
      BARINV.forEach(function (g) { g[1].forEach(function (n) { var id = slug(n); if (/\(batch\)/i.test(n)) return; var nd = whole(id, c); if (nd) out.push([g[0], n, nd, 'bottles']); }); });
      NABEV.forEach(function (g) { g[1].forEach(function (n) { var nd = whole(slug(n), c); if (nd) out.push([g[0], n, nd, 'units']); }); });
      return out;
    };
    render();
  })();
})();
