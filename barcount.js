/* Vicio FOH: the new bar count (Eric, Nov 21 2026), rebuilt from photos of the back bar. Loaded by config.js; FOH only.
   The bar count is now the top shelf, shelf 2 and the speed rail, each in the order the bottles sit (top shelf and shelf 2
   left to right; the speed rail starting with Chipotle at the top right). Bottles not on the shelves or the rail are off the
   count. Wine, bubbly and beer are unchanged. Names that match the old count keep the same item id, so last week's numbers
   and pars still line up (Verás and Amarás give the same ids as the old "Vera's" and "Amara's"). House batches on the rail are
   counted like bottles, in tenths.
   Tap to count (Eric): each liquor and wine line shows a bottle; tap where the liquid is, from .1 at the bottom to 1 at the
   top (10 points). Full backups are a + / - beside it, so the count is full backups plus the open bottle (2 backups and a
   bottle at .6 is 2.6). Tap the same point again to clear the open bottle. None left marks it 0. Beer stays a number box. */
(function () {
  if (window.__vicioBarCount || window.VICIO_BOARD !== 'foh') return;
  window.__vicioBarCount = true;
  var NEW = [
    ['Top shelf', ['Jack Daniel\u2019s', 'Jameson', 'Crown Royal', 'Johnnie Walker Black', 'Campari', 'Aperol', 'Camazotz Oaxacan Rum', 'Belvedere', 'The Botanist Gin', 'G4 Blanco', 'G4 Reposado', 'Terralta Blanco', 'Tequila Ocho Plata', 'Ver\u00e1s', 'Amar\u00e1s', 'Sotol La Higuera']],
    ['Shelf 2', ['Bulleit 95 Rye', 'Bulleit Bourbon', 'Wild Turkey 101 Rye', 'Hennessy', 'Maker\u2019s Mark', 'Captain Morgan', 'Johnnie Walker Red', 'Fireball', 'Nikka', 'Uruapan Charanda Blanco', 'Tanqueray', 'Hibiki', 'Riablo Sotol Spiced Pineapple', 'Lost Lore Blanco', 'Suerte Reposado', 'Casamigos Reposado', '1800 Blanco', 'Jose Cuervo Gold', 'Jose Cuervo Silver']],
    ['Speed rail, top', ['Chipotle tequila (batch)', 'Green Tea (batch)', 'Vegas Bomb (batch)', 'Nolet\u2019s Silver', 'Evan Williams', 'Tito\u2019s', 'Rayu Joven', 'Real de Valle Blanco', 'La Vieja Taberna', 'Tequila mix (batch)']],
    ['Speed rail, bottom', ['De Kuyper Watermelon', 'De Kuyper Blue Cura\u00e7ao', 'De Kuyper Peachtree', 'Agavales Spicy Tamarindo', 'Potter\u2019s Triple Sec', 'Malibu', 'Bacardi', 'Guava Goddess (batch)', 'Mexican Candy (batch)']]];
  function apply() {
    if (typeof BARINV === 'undefined' || typeof INVITEMS === 'undefined' || typeof slug !== 'function') return false;
    if (apply.done) return true;
    var keep = BARINV.filter(function (g) { return !/^(liquor|liqueurs)$/i.test(g[0]) && !NEW.some(function (n) { return n[0] === g[0]; }); });
    BARINV.length = 0; NEW.concat(keep).forEach(function (g) { BARINV.push(g); });
    INVITEMS.length = 0;
    BARINV.forEach(function (g) { g[1].forEach(function (n) { INVITEMS.push([slug(n), n, g[0]]); }); });
    apply.done = true; return true;
  }
  var BH = 132, BT = 34, BB = 124; /* bottle drawing: height, top of the body (level 1), bottom (level 0) */
  function bottleSvg(frac) {
    var fillTop = BB - (BB - BT) * frac, ticks = '';
    for (var i = 1; i <= 10; i++) { var y = BB - (BB - BT) * i / 10; ticks += '<line x1="6" x2="' + (i % 5 ? 12 : 16) + '" y1="' + y + '" y2="' + y + '" stroke="currentColor" stroke-width="1" opacity=".55"/>'; }
    return '<svg class="x-btl" viewBox="0 0 56 ' + BH + '" width="56" height="' + BH + '" aria-hidden="true">' +
      '<defs><clipPath id="bclip"><path d="M22 4h12v16c0 6 10 8 10 18v84a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V38c0-10 10-12 10-18z"/></clipPath></defs>' +
      (frac > 0 ? '<rect x="0" y="' + fillTop + '" width="56" height="' + (BH - fillTop) + '" fill="#D9A441" clip-path="url(#bclip)"/>' : '') +
      '<path d="M22 4h12v16c0 6 10 8 10 18v84a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V38c0-10 10-12 10-18z" fill="none" stroke="currentColor" stroke-width="1.6"/>' + ticks +
      '<text x="50" y="' + (BB - (BB - BT) * 0.5 + 3) + '" font-size="8" fill="currentColor" opacity=".7" text-anchor="end">.5</text><text x="50" y="' + (BT + 3) + '" font-size="8" fill="currentColor" opacity=".7" text-anchor="end">1</text></svg>';
  }
  function split(v) {
    if (v == null || v === '' || isNaN(+v)) return { full: 0, frac: 0, none: true };
    v = Math.round(+v * 10) / 10; var full = Math.floor(v + 1e-9), frac = Math.round((v - full) * 10) / 10;
    if (frac === 0 && full > 0) { full -= 1; frac = 1; }
    return { full: full, frac: frac, none: false };
  }
  function tapCount() {
    var sec = document.querySelector('[data-fold="sec_bar"]'); if (!sec) return;
    var c = (S.inv && S.inv.c) || {};
    Array.prototype.forEach.call(sec.querySelectorAll('input[data-inv]'), function (inp) {
      var grp = inp.closest('[data-fold^="inv_"]'); if (grp && /beer/i.test(grp.dataset.fold)) return;
      var id = inp.dataset.inv, sp = split(c[id]), cell = inp.closest('td'); if (!cell) return;
      var total = sp.none ? '\u2013' : (sp.full + sp.frac).toFixed(1).replace(/\.0$/, '');
      cell.innerHTML = '<div class="x-tc"><div class="x-tcb" data-tcid="' + id + '" role="slider" aria-label="Open bottle level" aria-valuemin="0" aria-valuemax="1" aria-valuenow="' + sp.frac + '">' + bottleSvg(sp.frac) + '</div>' +
        '<div class="x-tcs"><b class="x-tcv">' + total + '</b><span class="x-tcl">Full backups</span><span class="x-tcf"><button type="button" class="btn" data-tcfull="-1" data-tcid2="' + id + '" aria-label="One fewer full bottle">\u2212</button><b>' + sp.full + '</b><button type="button" class="btn" data-tcfull="1" data-tcid2="' + id + '" aria-label="One more full bottle">+</button></span><button type="button" class="btn x-tc0' + (c[id] === 0 ? ' on' : '') + '" data-tczero="' + id + '">None left</button></div></div>';
      var th = cell.closest('table') && cell.closest('table').querySelector('thead th:last-child'); if (th && /^Count/.test(th.textContent)) th.textContent = 'Tap the level';
    });
  }
  function setVal(id, v) {
    if (v != null) v = Math.round(v * 10) / 10;
    S.inv = Object.assign({}, S.inv, { c: Object.assign({}, (S.inv || {}).c, (function () { var o = {}; o[id] = v; return o; })()) });
    var patch = { c: {} }; patch.c[id] = v; save('barinv/' + ui.week, patch); render();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-tcid]');
    if (b) {
      e.preventDefault(); e.stopPropagation();
      var svg = b.querySelector('svg'), r = svg.getBoundingClientRect(), y = (e.clientY - r.top) * BH / r.height;
      var k = Math.max(1, Math.min(10, Math.ceil((BB - y) / (BB - BT) * 10 - 0.0001)));
      var id = b.dataset.tcid, sp = split((S.inv && S.inv.c || {})[id]), lvl = k / 10;
      if (!sp.none && Math.abs(sp.frac - lvl) < 0.01) setVal(id, sp.full ? sp.full : null); else setVal(id, sp.full + lvl);
      return;
    }
    var f = e.target.closest && e.target.closest('[data-tcfull]');
    if (f) {
      e.preventDefault(); e.stopPropagation();
      var id2 = f.dataset.tcid2, s2 = split((S.inv && S.inv.c || {})[id2]), full = Math.max(0, s2.full + (+f.dataset.tcfull));
      setVal(id2, s2.none && full === 0 ? null : full + (s2.none ? 0 : s2.frac));
      return;
    }
    var z = e.target.closest && e.target.closest('[data-tczero]');
    if (z) {
      e.preventDefault(); e.stopPropagation();
      var cur = (S.inv && S.inv.c || {})[z.dataset.tczero]; setVal(z.dataset.tczero, cur === 0 ? null : 0);
    }
  }, true);
  (function () { var st = document.createElement('style'); st.textContent =
    '.x-tc{display:flex;align-items:center;gap:10px;justify-content:flex-end}.x-tcb{cursor:pointer;color:var(--ink,#EDEDF0);touch-action:manipulation;border-radius:10px;padding:2px 4px;background:var(--bg,#000);border:1px solid var(--line,#2E2E34)}' +
    '.x-tcs{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:92px}.x-tcv{font:700 24px/1 system-ui,-apple-system,sans-serif}.x-tcl{font:600 10px system-ui,-apple-system,sans-serif;color:var(--muted,#A1A1AA);text-transform:uppercase;letter-spacing:.04em}' +
    '.x-tcf{display:flex;align-items:center;gap:6px}.x-tcf .btn{min-width:36px;min-height:36px;padding:0;font-size:18px}.x-tcf b{min-width:16px;text-align:center}.x-tc0{min-height:30px;padding:2px 8px;font-size:12px}.x-tc0.on{background:var(--cherry,#8B1E1E);border-color:var(--cherry,#8B1E1E);color:#fff}'; document.head.appendChild(st); })();

  (function start() {
    if (!apply() || typeof render !== 'function') return setTimeout(start, 200);
    var r0 = render; render = function () { var out = r0.apply(this, arguments); try { tapCount(); } catch (e) {} return out; };
    render();
  })();
})();
