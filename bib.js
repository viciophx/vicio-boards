/* Vicio FOH: Soda BIBs & CO2 ordering (Eric, Nov 22 2026). Loaded by config.js; FOH only. Builds on nov21c.js, which
   draws the level buttons.
   - The next order day shows at the top of the section ("Next Swire order: Tuesday, Nov 24, in 2 days"; "Today" on the day).
   - Any bag-in-box at or below the reorder level (25% by default) goes on the order list automatically, with the boxes
     marked Order. The list sits at the top of the section with a Copy order button.
   - CO2: spare tanks under the CO2 par (2 by default) go on the list too, as their own Dicarbonics line. With no spare
     tank at all the section shows a red warning, because CO2 is the item that gets missed.
   - Expiration dates: each bag-in-box line has an Expires date. Within 14 days it turns amber ("Expires in 9 days"), past
     the date it turns red and the box is listed at the top as expired.
   Settings (order day, reorder level, CO2 par) are a small Settings fold for managers and on Colette's Board. Everything is
   saved in the shared settings doc config/bib: { orderDay: 0-6, level: 0.25 or 0.5, co2par, exp: { <id>: 'YYYY-MM-DD' } }.
   Dates and the countdown use the iPad's own clock. */
(function () {
  if (window.__vicioBib || window.VICIO_BOARD !== 'foh') return;
  window.__vicioBib = true;
  var CFG = {}, SRV = {}, LOCAL = { exp: {} }, DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var IN_COLETTE = false; try { IN_COLETTE = !!(window.parent && window.parent !== window); } catch (e) { IN_COLETTE = true; }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* What this iPad just changed wins until the sheet sends it back, so an edit never flickers away. */
  function merge() {
    var se = SRV.exp || {};
    Object.keys(LOCAL.exp).forEach(function (k) { if ((se[k] || null) === (LOCAL.exp[k] || null)) delete LOCAL.exp[k]; });
    ['orderDay', 'level', 'co2par'].forEach(function (k) { if (LOCAL[k] != null && +SRV[k] === +LOCAL[k]) delete LOCAL[k]; });
    CFG = Object.assign({}, SRV, { exp: Object.assign({}, se, LOCAL.exp) });
    ['orderDay', 'level', 'co2par'].forEach(function (k) { if (LOCAL[k] != null) CFG[k] = LOCAL[k]; });
  }
  function cfg() { return { orderDay: CFG.orderDay != null ? +CFG.orderDay : 2, level: CFG.level != null ? +CFG.level : 0.25, co2par: CFG.co2par != null ? +CFG.co2par : 2, exp: CFG.exp || {} }; }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function isoD(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function nextOrder() {
    var t = today(), n = (cfg().orderDay - t.getDay() + 7) % 7, d = new Date(t); d.setDate(t.getDate() + n);
    return { d: d, n: n, label: DAYS[d.getDay()] + ', ' + MON[d.getMonth()] + ' ' + d.getDate() + (n === 0 ? ' (today)' : n === 1 ? ' (tomorrow)' : ' (in ' + n + ' days)') };
  }
  function daysTo(s) { if (!s) return null; var p = s.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]); return Math.round((d - today()) / 864e5); }
  function canEdit() { var m = false; try { m = typeof MGR !== 'undefined' && !!MGR; } catch (e) {} return IN_COLETTE || m; }
  function lines() {
    var f = (typeof COUNTFORMS !== 'undefined' ? COUNTFORMS : []).find(function (x) { return x.id === 'inv_bib'; });
    return f ? f.groups.reduce(function (a, g) { return a.concat(g[1]); }, []) : [];
  }
  function nm(it) { return String(it[1]).replace(/^Bag-in-box:\s*/, '').replace(/\s*\(.*\)$/, ''); }
  function orderList() {
    var c = (S.inv && S.inv.c) || {}, k = cfg(), soda = [], co2 = null, expired = [];
    lines().forEach(function (it) {
      var id = it[0], v = c[id], n = v == null || v === '' ? null : +v;
      if (/^a_co2/.test(id)) { if (n != null && n < k.co2par) co2 = { have: n, need: k.co2par - n }; return; }
      if (n != null && n <= k.level + 1e-9) soda.push({ name: nm(it), lvl: n });
      var dt = daysTo(k.exp[id]); if (dt != null && dt < 0) expired.push(nm(it));
    });
    return { soda: soda, co2: co2, expired: expired };
  }
  function top(sec) {
    var o = orderList(), k = cfg(), nx = nextOrder(), c = (S.inv && S.inv.c) || {};
    var co2v = null; lines().forEach(function (it) { if (/^a_co2/.test(it[0])) co2v = c[it[0]] == null || c[it[0]] === '' ? null : +c[it[0]]; });
    var txt = 'Vicio soda order for ' + nx.label.replace(/ \(.*\)$/, '') + '\n' + (o.soda.length ? 'Swire:\n' + o.soda.map(function (s) { return '  ' + s.name + ' bag-in-box (at ' + (s.lvl ? Math.round(s.lvl * 100) + '%' : 'empty') + ')'; }).join('\n') : '') + (o.co2 ? '\nDicarbonics:\n  CO2 tanks x' + o.co2.need + ' (' + o.co2.have + ' spare)' : '');
    var html = '<div class="x-bibtop"><div class="x-bibnext"><span>Next Swire order</span><b>' + esc(nx.label) + '</b></div>' +
      (co2v === 0 ? '<div class="x-co2warn">No spare CO2 tank. Call Dicarbonics today.</div>' : '') +
      (o.expired.length ? '<div class="x-co2warn">Expired: ' + esc(o.expired.join(', ')) + '. Swap these boxes out.</div>' : '') +
      '<div class="x-bibord"><b>Order list</b>' + (o.soda.length || o.co2 ? '<ul>' + o.soda.map(function (s) { return '<li>' + esc(s.name) + ' <small>' + (s.lvl ? Math.round(s.lvl * 100) + '% left' : 'empty') + ' \u00b7 Swire</small></li>'; }).join('') + (o.co2 ? '<li>CO2 tanks \u00d7' + o.co2.need + ' <small>' + o.co2.have + ' spare \u00b7 Dicarbonics</small></li>' : '') + '</ul><button type="button" class="btn" data-bibcopy>Copy order</button><span class="x-bibmsg" aria-live="polite"></span><pre class="x-bibtxt" hidden>' + esc(txt) + '</pre>' : '<p>Nothing to order yet. Boxes at ' + Math.round(k.level * 100) + '% or less and CO2 under ' + k.co2par + ' spare tanks land here.</p>') + '</div>' +
      (canEdit() ? '<details class="x-bibset"><summary>Settings</summary><div class="x-bibrow"><label>Order day<select data-bibset="orderDay">' + DAYS.map(function (d, i) { return '<option value="' + i + '"' + (i === k.orderDay ? ' selected' : '') + '>' + d + '</option>'; }).join('') + '</select></label>' +
        '<label>Reorder at<select data-bibset="level"><option value="0.25"' + (k.level === 0.25 ? ' selected' : '') + '>25% or less</option><option value="0.5"' + (k.level === 0.5 ? ' selected' : '') + '>50% or less</option></select></label>' +
        '<label>CO2 spare tanks to keep<select data-bibset="co2par">' + [1, 2, 3, 4].map(function (n) { return '<option value="' + n + '"' + (n === k.co2par ? ' selected' : '') + '>' + n + '</option>'; }).join('') + '</select></label></div></details>' : '') +
      '</div>';
    var old = sec.querySelector('.x-bibtop'); if (old) old.remove();
    Array.prototype.forEach.call(sec.querySelectorAll('.x-need'), function (x) { x.remove(); });
    var anchor = sec.querySelector('p.muted') || sec.querySelector('.fields');
    if (anchor) anchor.insertAdjacentHTML('afterend', html);
  }
  function rows(sec) {
    var k = cfg(), c = (S.inv && S.inv.c) || {};
    lines().forEach(function (it) {
      var id = it[0]; if (/^a_co2/.test(id)) return;
      var el = sec.querySelector('[data-lvid="' + id + '"]'), row = el && el.closest('tr'); if (!row) return;
      var old = row.querySelector('.x-bibexp'); if (old && old.contains(document.activeElement)) return;
      Array.prototype.forEach.call(row.querySelectorAll('.x-bibexp,.x-bibon'), function (x) { x.remove(); });
      var dt = daysTo(k.exp[id]), cls = dt == null ? '' : dt < 0 ? ' bad' : dt <= 14 ? ' warn' : '', note = dt == null ? '' : dt < 0 ? 'Expired' : dt === 0 ? 'Expires today' : dt <= 14 ? 'Expires in ' + dt + ' day' + (dt > 1 ? 's' : '') : '';
      var v = c[id], n = v == null || v === '' ? null : +v;
      row.cells[0].insertAdjacentHTML('beforeend', '<label class="x-bibexp' + cls + '">Expires <input type="date" data-bibexp="' + id + '" value="' + esc(k.exp[id] || '') + '" min="' + isoD(today()).slice(0, 4) + '-01-01">' + (note ? '<em>' + note + '</em>' : '') + '</label>' + (n != null && n <= k.level + 1e-9 ? '<span class="pill warn x-bibon">On the order</span>' : ''));
    });
  }
  function draw() { var sec = document.querySelector('[data-fold="sec_inv_bib"]'); if (!sec) return; top(sec); rows(sec); }
  document.addEventListener('change', function (e) {
    var t = e.target; if (!t || !t.dataset) return;
    if (t.dataset.bibexp) { var ex = {}; ex[t.dataset.bibexp] = t.value || null; LOCAL.exp[t.dataset.bibexp] = t.value || null; merge(); save('config/bib', { exp: ex }); try { t.blur(); } catch (x) {} render(); return; }
    if (t.dataset.bibset) { var p = {}; p[t.dataset.bibset] = +t.value; LOCAL[t.dataset.bibset] = +t.value; merge(); save('config/bib', p); render(); }
  }, true);
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-bibcopy]'); if (!b) return;
    var box = b.parentNode, txt = (box.querySelector('.x-bibtxt') || {}).textContent || '', m = box.querySelector('.x-bibmsg');
    var fb = function () { if (m) m.textContent = ' Copy is blocked here. Select the list and copy it.'; };
    try { navigator.clipboard.writeText(txt).then(function () { if (m) m.textContent = ' Order copied.'; }, fb); } catch (x) { fb(); }
  }, true);
  var st = document.createElement('style');
  st.textContent = '.x-bibtop{display:grid;gap:10px;margin:8px 0 12px}.x-bibnext{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;padding:12px 14px;border-radius:12px;background:var(--bg,#000);border:1px solid var(--line,#2E2E34)}' +
    '.x-bibnext span{font:700 11px system-ui,-apple-system,sans-serif;text-transform:uppercase;letter-spacing:.06em;color:var(--muted,#A1A1AA)}.x-bibnext b{font-size:20px}' +
    '.x-co2warn{padding:10px 14px;border-radius:12px;background:rgba(229,72,77,.15);border:2px solid var(--cherry,#E5484D);color:var(--cherry,#E5484D);font-weight:800;font-size:16px}' +
    '.x-bibord{padding:12px 14px;border-radius:12px;border:1px solid var(--line,#2E2E34)}.x-bibord ul{margin:8px 0 10px;padding-left:20px}.x-bibord li{margin:4px 0;font-size:16px;font-weight:600}.x-bibord small{font-weight:500;color:var(--muted,#A1A1AA)}.x-bibord p{margin:6px 0 0;color:var(--muted,#A1A1AA)}.x-bibmsg{margin-left:8px;color:var(--muted,#A1A1AA)}' +
    '.x-bibset summary{cursor:pointer;color:var(--muted,#A1A1AA);font-size:13px}.x-bibrow{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px}.x-bibrow label{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--muted,#A1A1AA)}.x-bibrow select{min-height:40px}' +
    '.x-bibexp{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-top:6px;font-size:12px;color:var(--muted,#A1A1AA)}.x-bibexp input{min-height:36px;font-size:14px;padding:2px 6px}.x-bibexp em{font-style:normal;font-weight:700}' +
    '.x-bibexp.warn em{color:#F5A524}.x-bibexp.bad em,.x-bibexp.bad{color:var(--cherry,#E5484D)}.x-bibon{display:inline-block;margin-top:6px}';
  document.head.appendChild(st);
  (function start() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || !document.getElementById('view')) return setTimeout(start, 200);
    try { if (typeof watchDoc === 'function') watchDoc('config/bib', function (d) { SRV = d || {}; merge(); render(); }); } catch (e) {}
    var r0 = render; render = function () { var out = r0.apply(this, arguments); try { draw(); } catch (e) {} return out; };
    try { draw(); } catch (e) {}
  })();
})();
