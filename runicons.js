/* Vicio FOH (Eric, Nov 21 2026). Loaded by config.js; FOH only.
   1. Expo: "What runs with what" shown as icons with short labels, on the Expo view and on the Expo card on Today. The full
      wording stays on long press; Edit still shows the plain text.
   2. Host: a "Menus to print" card that opens the Active menus folder in Dropbox (Vicio/05 Menus/Active), so whatever is in
      that folder is what the host prints.
   3. Floor, once (after the Nov 21 floor fix): table 11 right next to table 10, and tables 12, 14, 15 and 16 on the same line
      as 10, in their left-to-right order, pushed apart only where they would overlap. The layout from before is kept in
      seating/layout_before_1121b.
   4. Floor, once: the host stand 50% smaller (half as wide and half as tall), keeping its right edge next to table 17, with a
      smaller label so HOST still fits.
   5. Floor, Inside: the map 20% shorter (10 wide by 4.4 tall, was 5.5), tables keeping their shape. Patio is unchanged.
   6. Bartender Today: big buttons at the top straight to the specs, by group (Cocktails first). One tap opens Drinks in
      bartender view on that group with its first drink showing. */
(function () {
  if (window.__vicioRunIcons || window.VICIO_BOARD !== 'foh') return;
  window.__vicioRunIcons = true;
  var A = Array.prototype;
  function es() { try { return ui.lang === 'es'; } catch (e) { return false; } }
  function tt(en, sp) { return es() ? sp : en; }
  function hx(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function style(css) { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
  var SV = function (d) { return '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var RUNI = [
    [/plate for bones|bone/i, 'Bone plate', 'Plato huesos', SV('<ellipse cx="12" cy="13" rx="9" ry="6"/><path d="M8.5 12.5h7"/><circle cx="8" cy="12.5" r="1.2"/><circle cx="16" cy="12.5" r="1.2"/>')],
    [/plate/i, 'Plate each', 'Plato c/u', SV('<ellipse cx="12" cy="13" rx="9" ry="6"/><ellipse cx="12" cy="13" rx="5" ry="3"/>')],
    [/spatula/i, 'Spatula', 'Esp\u00e1tula', SV('<path d="M5 4h9l-1 8H6z"/><path d="M9.5 12v8"/>')],
    [/wet nap/i, 'Wet naps', 'Toallitas', SV('<rect x="4" y="6" width="16" height="12" rx="2"/><path d="M8 10c1.5 1 3-1 4.5 0s3 1 3.5 0"/><path d="M8 14h8"/>')],
    [/napkin/i, 'Napkins', 'Servilletas', SV('<path d="M4 5h16v14H4z"/><path d="M4 5l16 14"/>')],
    [/shaker|parm|chile flake/i, 'Shakers', 'Saleros', SV('<path d="M8 9h8l-1 11H9z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/><path d="M11 5h.01M13 5h.01"/>')],
    [/ketchup/i, 'Ketchup', 'C\u00e1tsup', SV('<path d="M10 3h4v3l2 3v11H8V9l2-3z"/><path d="M9 13h6"/>')],
    [/red sauce/i, 'Red sauce', 'Salsa roja', SV('<path d="M5 13h14l-2 6H7z"/><path d="M7 13c1-2 3-3 5-3s4 1 5 3"/>')],
    [/ranch/i, 'Ranch', 'Ranch', SV('<path d="M5 13h14l-2 6H7z"/><path d="M8 13c.5-1.5 2-2.5 4-2.5s3.5 1 4 2.5"/><path d="M12 6v2"/>')],
    [/knife/i, 'Steak knife', 'Cuchillo', SV('<path d="M5 19L17 5c2 2 2 5 0 7l-4 3"/><path d="M5 19l3-1"/>')],
    [/fork|utensil/i, 'Forks', 'Tenedores', SV('<path d="M9 3v6a3 3 0 0 0 6 0V3"/><path d="M12 3v18"/>')],
    [/\bbag\b/i, 'Bag', 'Bolsa', SV('<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>')],
    [/sauces on the ticket|extra sauce/i, 'Ticket sauces', 'Salsas del ticket', SV('<path d="M7 3h10v18l-2-1.5L12 21l-3-1.5L7 21z"/><path d="M10 8h4M10 12h4"/>')],
    [/fries/i, 'Fries', 'Papas', SV('<path d="M6 10h12l-2 10H8z"/><path d="M8 10V4M11 10V3M14 10V4M17 10V6"/>')]];
  function runIcons(text) {
    var hits = [];
    RUNI.forEach(function (r) { var m = String(text).match(r[0]); if (m && !hits.some(function (h) { return h.i <= m.index && m.index < h.i + h.len; })) hits.push({ i: m.index, len: m[0].length, r: r }); });
    hits.sort(function (a, b) { return a.i - b.i; });
    var extra = /extra napkins/i.test(text), none = /if the table has none/i.test(text), onIt = /come on it/i.test(text), asked = /plates and forks if asked|if asked/i.test(text);
    var COL = { 'Ketchup': '#E5484D', 'Red sauce': '#E5484D', 'Ranch': '#F4F4F5' };
    return '<span class="x-ri">' + hits.map(function (h) {
      var lb = tt(h.r[1], h.r[2]);
      if (h.r[1] === 'Napkins' && extra) lb = tt('Extra napkins', 'Servilletas extra');
      if (h.r[1] === 'Shakers' && none) lb = tt('Shakers if none', 'Saleros si no hay');
      if ((h.r[1] === 'Fries' || h.r[1] === 'Ranch') && onIt) lb += tt(' (on it)', ' (incluido)');
      if (asked && (h.r[1] === 'Plate each' || h.r[1] === 'Forks')) lb = h.r[1] === 'Forks' ? tt('Forks if asked', 'Tenedores si piden') : tt('Plates if asked', 'Platos si piden');
      return '<span class="x-ric"' + (COL[h.r[1]] ? ' style="color:' + COL[h.r[1]] + '"' : '') + '>' + h.r[3] + '<small>' + hx(lb) + '</small></span>';
    }).join('') + (hits.length ? '' : '<small class="x-rtx">' + hx(text) + '</small>') + '</span>';
  }
  function runsIcons() {
    A.forEach.call(document.querySelectorAll('.x-runs li > span:not([data-ri]), #x-expo tbody td:nth-child(2):not([data-ri])'), function (el) {
      if (el.querySelector('input,textarea,select')) return;
      var txt = el.textContent.trim(); if (!txt) return;
      el.setAttribute('data-ri', '1'); el.title = txt; el.setAttribute('aria-label', txt); el.innerHTML = runIcons(txt);
    });
  }
  style('.x-ri{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}.x-ric{display:inline-flex;flex-direction:column;align-items:center;gap:2px;min-width:58px;padding:6px 6px 5px;border:1px solid var(--line,#2E2E34);border-radius:10px;background:var(--bg,#000);color:var(--ink,#EDEDF0)}' +
    '.x-ric small{font:600 11px/1.15 system-ui,-apple-system,sans-serif;color:var(--muted,#A1A1AA);text-align:center;max-width:76px}.x-rtx{color:var(--muted);font-size:14px}.x-runs li > span{color:inherit!important}');

  var MENU_DIR = 'https://www.dropbox.com/scl/fo/ztjnl9c8divgcq8flgtqa/AFhZraSHSiNcrV-biS-fLgQ?rlkey=4hmom6s22gt2g3toa1gkxdsf2&dl=0';
  var MENU_PRINT = 'https://www.dropbox.com/scl/fo/ztjnl9c8divgcq8flgtqa/AFhZraSHSiNcrV-biS-fLgQ?rlkey=4hmom6s22gt2g3toa1gkxdsf2&preview=' + encodeURIComponent('Vicio Menu - PRINT (food + bar).pdf') + '&dl=0';
  function menusCard() {
    if (ui.tab !== 'today' || ui.mode !== 'service' || document.getElementById('x-menus')) return;
    var v = document.getElementById('view'); if (!v) return;
    var html = '<section class="card x-menus" id="x-menus"><div class="cardhead"><h3>' + tt('Menus to print', 'Men\u00fas para imprimir') + '</h3></div>' +
      '<div class="nav"><a class="btn primary" href="' + hx(MENU_PRINT) + '" target="_blank" rel="noopener">' + SV('<path d="M7 9V3h10v6"/><rect x="4" y="9" width="16" height="8" rx="2"/><path d="M7 14h10v7H7z"/>') + ' ' + tt('Print menu (food + bar)', 'Imprimir men\u00fa (comida + barra)') + '</a>' +
      '<a class="btn" href="' + hx(MENU_DIR) + '" target="_blank" rel="noopener">' + tt('All menus', 'Todos los men\u00fas') + '</a></div>' +
      '<p class="status">' + tt('Opens in Dropbox. Tap the share or print button there, then Print.', 'Se abre en Dropbox. Toca compartir o imprimir ah\u00ed, luego Imprimir.') + '</p></section>';
    var bar = v.querySelector(':scope > .bar');
    if (bar) bar.insertAdjacentHTML('afterend', html); else v.insertAdjacentHTML('afterbegin', html);
  }
  style('.x-menus .nav{display:flex;flex-wrap:wrap;gap:8px}.x-menus .btn{display:inline-flex;align-items:center;gap:8px;text-decoration:none}.x-menus .btn svg{width:20px;height:20px}');

  function fixLayout1121b() {
    var L = (typeof S !== 'undefined' && S.layout) || {};
    if (!L.fix1121 || L.fix1121b || fixLayout1121b.done || !(L.tables || []).length) return;
    if (typeof drag !== 'undefined' && drag && drag.el) return;
    if (typeof save !== 'function' || typeof tblSize !== 'function' || typeof TK === 'undefined') return;
    fixLayout1121b.done = true;
    var ts = L.tables.map(function (t) { return Object.assign({}, t); });
    var byN = function (n) { return ts.find(function (t) { return String(t.n).trim() === n; }); };
    var ins = function (t) { return (t.area || 'Inside') === 'Inside'; };
    var gx = function (t) { return +(ins(t) ? t.x : t.ix); }, gy = function (t) { return +(ins(t) ? t.y : t.iy); };
    var sx = function (t, v) { if (ins(t)) t.x = v; else t.ix = v; }, sy = function (t, v) { if (ins(t)) t.y = v; else t.iy = v; };
    var w = function (t) { return tblSize(t)[0] * TK / 10; }, cl = function (v) { return Math.max(2, Math.min(98, +(+v).toFixed(1))); };
    var t10 = byN('10'); if (!t10 || isNaN(gx(t10))) return;
    var row = gy(t10), t11 = byN('11');
    if (t11) { sx(t11, cl(gx(t10) + w(t10) / 2 + w(t11) / 2 + 0.8)); sy(t11, row); }
    ['12', '14', '15', '16'].forEach(function (n) { var t = byN(n); if (t && !isNaN(gx(t))) sy(t, row); });
    var line = ts.filter(function (t) { return Math.abs(gy(t) - row) < 0.01 && !isNaN(gx(t)) && ['10', '11', '12', '14', '15', '16'].indexOf(String(t.n).trim()) >= 0; })
      .sort(function (a, b) { return gx(a) - gx(b); });
    for (var i = 1; i < line.length; i++) {
      var p = line[i - 1], q = line[i], min = gx(p) + w(p) / 2 + w(q) / 2 + 0.8;
      if (gx(q) < min) sx(q, cl(min));
    }
    var at = Date.now();
    save('seating/layout_before_1121b', { tables: L.tables, at: at });
    S.layout = Object.assign({}, L, { tables: ts, fix1121b: at });
    save('seating/layout', { tables: ts, fix1121b: at, updated: at });
    render();
  }

  function fixLayout1121c() {
    var L = (typeof S !== 'undefined' && S.layout) || {};
    if (!L.fix1121 || L.fix1121c || fixLayout1121c.done || !(L.fixtures || []).length || typeof save !== 'function') return;
    if (typeof drag !== 'undefined' && drag && drag.el) return;
    var fx = L.fixtures.map(function (f) { return JSON.parse(JSON.stringify(f)); });
    var hs = fx.find(function (f) { return (f.area || 'Inside') === 'Inside' && /host/i.test(f.label || '') && !f.pts && +f.w > 0; });
    fixLayout1121c.done = true;
    if (!hs) return;
    var right = +hs.x + hs.w / 2;
    hs.w = +(hs.w / 2).toFixed(1); hs.h = +(hs.h / 2).toFixed(1); hs.x = +(right - hs.w / 2).toFixed(1);
    var at = Date.now();
    save('seating/layout_before_1121c', { fixtures: L.fixtures, at: at });
    S.layout = Object.assign({}, L, { fixtures: fx, fix1121c: at });
    save('seating/layout', { fixtures: fx, fix1121c: at, updated: at });
    render();
  }
  function hostLabel() {
    A.forEach.call(document.querySelectorAll('#floor .fixture, .floor .fixture'), function (el) {
      if (/^\s*host/i.test(el.textContent || '')) { el.style.setProperty('font-size', '8px', 'important'); el.style.setProperty('letter-spacing', '0', 'important'); el.style.setProperty('padding', '0', 'important'); el.style.setProperty('overflow', 'visible', 'important'); }
    });
  }

  var IN_H = 4.4;
  function insideShort() {
    var f = document.getElementById('floor'); if (!f) return;
    var inside = (ui.area || 'Inside') === 'Inside';
    f.classList.toggle('x-in', inside);
    if (!inside) return;
    var base = window.FLOOR_H || 5.5;
    A.forEach.call(f.querySelectorAll('.tbl[data-h21]:not([data-h44])'), function (el) {
      el.dataset.h44 = '1';
      el.style.height = el.style.height.replace(/max\((\d+)px,\s*([\d.]+)%\)/, function (m, px, pc) { return 'max(' + px + 'px, ' + (pc * base / IN_H).toFixed(2) + '%)'; });
    });
  }
  style('#floor.x-in{aspect-ratio:10/4.4!important}');

  var BAR_GROUPS = [['Cocktails', 'C\u00f3cteles'], ['Margaritas', 'Margaritas'], ['Shots', 'Shots'], ['Mocktails', 'Sin alcohol'], ['Beer', 'Cerveza']];
  function barQuick() {
    if (ui.tab !== 'today' || ui.mode !== 'bar' || document.getElementById('x-barq')) return;
    var v = document.getElementById('view'); if (!v) return;
    var html = '<section class="card x-barq" id="x-barq"><div class="x-barqrow">' + BAR_GROUPS.map(function (g, i) {
      return '<button type="button" class="btn' + (i === 0 ? ' primary' : '') + '" data-barq="' + hx(g[0]) + '">' + (i === 0 ? SV('<path d="M5 4h14l-7 8z"/><path d="M12 12v7"/><path d="M8 20h8"/>') : '') + hx(tt(g[0], g[1])) + '</button>';
    }).join('') + '</div></section>';
    var bar = v.querySelector(':scope > .bar');
    if (bar) bar.insertAdjacentHTML('afterend', html); else v.insertAdjacentHTML('afterbegin', html);
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-barq]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var g = b.dataset.barq, key = 'pg:Drinks:' + g;
    ui.barView = true; try { localStorage.setItem('vicio_foh_barview', '1'); } catch (err) {}
    ui.fold = ui.fold || {}; ui.fold[key] = true; ui.tab = 'drinks'; render();
    setTimeout(function () {
      var d = document.querySelector('[data-fold="' + key + '"]'); if (!d) return;
      d.open = true; var first = d.querySelector('[data-act="dsel"]'); if (first) first.click();
      setTimeout(function () { var dd = document.querySelector('[data-fold="' + key + '"]'); if (dd) { dd.open = true; dd.scrollIntoView({ block: 'start' }); } }, 60);
    }, 30);
  }, true);
  style('.x-barq{padding:10px 12px}.x-barqrow{display:flex;flex-wrap:wrap;gap:8px}.x-barqrow .btn{flex:1 1 120px;min-height:56px;font-size:18px;display:inline-flex;align-items:center;justify-content:center;gap:8px}.x-barqrow .btn svg{width:24px;height:24px}');

  (function start() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || !document.getElementById('view')) return setTimeout(start, 200);
    var r0 = render;
    render = function () { var out = r0.apply(this, arguments); try { runsIcons(); } catch (e) {} try { menusCard(); } catch (e) {} try { barQuick(); } catch (e) {} try { fixLayout1121b(); } catch (e) {} try { fixLayout1121c(); } catch (e) {} try { hostLabel(); } catch (e) {} setTimeout(function () { try { insideShort(); } catch (e) {} }, 0); return out; };
    render();
  })();
})();
