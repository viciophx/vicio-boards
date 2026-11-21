/* Vicio FOH Expo (Eric, Nov 21 2026): "What runs with what" shown as icons with short labels, on the Expo view and on the
   Expo card on Today. The full wording stays on long press; Edit still shows the plain text. Loaded by config.js; FOH only. */
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

  (function start() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || !document.getElementById('view')) return setTimeout(start, 200);
    var r0 = render;
    render = function () { var out = r0.apply(this, arguments); try { runsIcons(); } catch (e) {} return out; };
    render();
  })();
})();
