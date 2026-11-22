/* Vicio FOH: the Attic Inventory Count by case and by piece (Eric, Nov 22 2026). Loaded by config.js; FOH only.
   Every attic line gets two pull-downs instead of a number box: Cases (0 to 10) and the loose pieces, in that item's piece
   unit (0 to 24). Portion cups, portion cup lids and the large and small to-go boxes are counted in sleeves; gloves (small
   and XL) in boxes; everything else in its own unit (rolls, packs, bottles, bundles). Example: gloves, 1 case and 1 box.
   Saved with the week's count: cases in c.<id> (so the line shows as counted), loose pieces in c.<id>__pc. Last week shows
   the same way ("1 cs + 1 box"); counts from before this change, which were one number, still show as that number.
   Soap and cleaning (Eric): set apart in a red outline, with larger, bolder text. */
(function () {
  if (window.__vicioAttic || window.VICIO_BOARD !== 'foh') return;
  window.__vicioAttic = true;
  var PIECE = { a_pcups: 'sleeves', a_plids: 'sleeves', a_togolg: 'sleeves', a_togosm: 'sleeves', a_glovess: 'boxes', a_glovesxl: 'boxes' };
  var SHORT = { sleeves: 'sl', boxes: 'box', rolls: 'roll', packs: 'pk', bottles: 'btl', bundles: 'bdl', 'bottles/jugs': 'btl', 'boxes/rolls': 'box' };
  var UNITS = {};
  function units() {
    try {
      var f = COUNTFORMS.find(function (x) { return x.id === 'inv_attic'; }); if (!f) return;
      f.desc = 'Paper goods, to-go, gloves and cleaning. Pick the full cases, then the loose pieces (sleeves, boxes, rolls). Sodas and CO2 have their own count below.';
      f.groups.forEach(function (g) { g[1].forEach(function (it) {
        if (UNITS[it[0]]) return;
        var u = PIECE[it[0]] || (it[2] === 'cases' ? 'pieces' : it[2]) || 'pieces';
        UNITS[it[0]] = u; it[2] = 'cases + ' + u;
      }); });
    } catch (e) {}
  }
  function n(v) { return v == null || v === '' || isNaN(+v) ? null : +v; }
  function fmt(c, id) {
    var cs = n(c[id]), pc = n(c[id + '__pc']); if (cs == null && pc == null) return '\u2013';
    if (c[id + '__pc'] === undefined && cs != null && cs % 1) return String(cs);
    var u = UNITS[id] || 'pieces', s = SHORT[u] || u, out = [];
    if (cs) out.push(cs + ' cs'); if (pc) out.push(pc + ' ' + s); return out.length ? out.join(' + ') : '0';
  }
  function opts(max, v) {
    var o = '<option value=""' + (v == null ? ' selected' : '') + '>\u2013</option>';
    for (var i = 0; i <= max; i++) o += '<option value="' + i + '"' + (v === i ? ' selected' : '') + '>' + i + '</option>';
    return o;
  }
  function selects() {
    var sec = document.querySelector('[data-fold="sec_inv_attic"]'); if (!sec) return;
    var c = (S.inv && S.inv.c) || {}, pv = (S.prevInv && S.prevInv.c) || {};
    Array.prototype.forEach.call(sec.querySelectorAll('input[data-inv]'), function (inp) {
      var id = inp.dataset.inv, cell = inp.closest('td'), row = inp.closest('tr'); if (!cell) return;
      var u = UNITS[id] || 'pieces', cs = n(c[id]), pc = n(c[id + '__pc']);
      if (cs != null && cs % 1 && c[id + '__pc'] === undefined) cs = Math.floor(cs);
      cell.innerHTML = '<div class="x-cp"><label>Cases<select data-cpid="' + id + '" data-cpk="c" aria-label="Cases">' + opts(10, cs) + '</select></label>' +
        '<label>' + u.replace(/^./, function (x) { return x.toUpperCase(); }) + '<select data-cpid="' + id + '" data-cpk="p" aria-label="' + u + '">' + opts(24, pc) + '</select></label></div>';
      if (row && row.cells[2]) row.cells[2].textContent = fmt(pv, id);
    });
    Array.prototype.forEach.call(sec.querySelectorAll('thead th'), function (th) { if (th.textContent.trim() === 'Count') th.textContent = 'Cases + loose'; });
    Array.prototype.forEach.call(sec.querySelectorAll('p.grp'), function (p) {
      if (!/soap|clean/i.test(p.textContent) || p.parentNode.classList.contains('x-clean')) return;
      var tw = p.nextElementSibling, box = document.createElement('div'); box.className = 'x-clean';
      p.parentNode.insertBefore(box, p); box.appendChild(p); if (tw && tw.classList.contains('tablewrap')) box.appendChild(tw);
    });
  }
  document.addEventListener('change', function (e) {
    var s = e.target; if (!s || !s.dataset || !s.dataset.cpid) return;
    var id = s.dataset.cpid, k = s.dataset.cpk, v = s.value === '' ? null : +s.value, c = (S.inv && S.inv.c) || {}, patch = {};
    if (k === 'c') { patch[id] = v; if (v != null && n(c[id + '__pc']) == null) patch[id + '__pc'] = 0; if (v == null && n(c[id + '__pc']) == null) patch[id + '__pc'] = null; }
    else { patch[id + '__pc'] = v; if (v != null && n(c[id]) == null) patch[id] = 0; }
    S.inv = Object.assign({}, S.inv, { c: Object.assign({}, c, patch) });
    save('barinv/' + ui.week, { c: patch }); render();
  }, true);
  var st = document.createElement('style');
  st.textContent = '.x-cp{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}.x-cp label{display:flex;flex-direction:column;gap:3px;font:600 10px system-ui,-apple-system,sans-serif;text-transform:uppercase;letter-spacing:.04em;color:var(--muted,#A1A1AA)}' +
    '.x-cp select{min-width:72px;min-height:44px;font-size:17px;padding:4px 8px;border-radius:9px;border:1px solid var(--line,#2E2E34);background:var(--bg,#000);color:var(--ink,#EDEDF0)}' +
    '.x-clean{border:2px solid var(--cherry,#E5484D);border-radius:14px;padding:8px 10px 4px;margin:14px 0}.x-clean p.grp span{font-size:18px;font-weight:800;color:var(--cherry,#E5484D)}' +
    '.x-clean td:first-child{font-size:18px;font-weight:800;color:var(--ink,#EDEDF0)}.x-clean td.count,.x-clean td.num{font-size:15px;font-weight:700}.x-clean .x-cp{flex-wrap:nowrap}';
  document.head.appendChild(st);
  (function start() {
    if (typeof render !== 'function' || typeof COUNTFORMS === 'undefined' || !document.getElementById('view')) return setTimeout(start, 200);
    setTimeout(function () {
      units();
      var r0 = render; render = function () { try { units(); } catch (e) {} var out = r0.apply(this, arguments); try { selects(); } catch (e) {} return out; };
      render();
    }, 300);
  })();
})();
