/* FOH layout, Nov 8 2026 (Eric): tight headers, one-row Today header with the ice machine switch, and Service split into
   Checklists · Host · Expo with an Expo screen and checklist. Built in the preview, published together. */
(function () {
  if (window.VICIO_BOARD !== 'foh') return;
  var ft = function (a, b) { return (typeof ui !== 'undefined' && ui.lang === 'es') ? b : a; };
  var e = function (v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* 1. Every FOH page starts with just its title: no eyebrow label, no paragraph. */
  /* 2. Today, row 1: Checklists / Service with Opening, Mid shift and Closing at the right.
     3. Today, row 2: TONIGHT, the short date with Back / Next, and the ice machine ON / OFF switch at the end. */
  function iceSwitchHtml(x, ft, e, es) {
    /* Ice machine as a slider on a blue pill, in the spot where "Set by the clock" used to sit (Eric, Nov 8). One tap flips it;
       the tap goes through the same ice handler as before, so it is logged under whoever is signed in. */
    var on = !!(x && x.on), when = x ? new Date(x.at).toLocaleTimeString(es ? 'es-MX' : 'en-US', { hour: 'numeric', minute: '2-digit' }) : '';
    return '<button type="button" class="x-iceswitch' + (on ? ' on' : '') + '" role="switch" aria-checked="' + on + '" data-ice="' + (on ? 'off' : 'on') + '" aria-label="' + ft('Ice machine', 'M\u00e1quina de hielo') + '">' +
      '<span class="x-isl"><b>' + ft('Ice machine', 'M\u00e1quina de hielo') + '</b><small>' + (x ? (on ? ft('On', 'Prendida') : ft('Off', 'Apagada')) + ' \u00b7 ' + (x.by ? e(String(x.by).split(' ')[0]) + ' ' : '') + e(when) : ft('Not logged', 'Sin registro')) + '</small></span>' +
      '<span class="x-itrack"><span class="x-iknob"></span></span><span class="x-istate">' + (on ? ft('ON', 'ON') : ft('OFF', 'OFF')) + '</span></button>';
  }
  function tight() {
    if (ui.tab !== 'today' || ui.mode === 'service') return;
    var hd = document.getElementById('head'); if (!hd || hd.querySelector('.x-hrow')) return;
    /* One header row, like Eric's mock: [FRONT OF HOUSE / TONIGHT] [Checklists · Host · Expo, ice machine under it]
       [date with Back / Next and Whole night % on top, Opening · Mid shift · Closing under it]. */
    var sw = hd.querySelector('.modesw'), eb = hd.querySelector('.eyebrow'), h1 = hd.querySelector('h1');
    var bar = document.querySelector('#view > .bar'), sb = document.querySelector('#view .shiftbar');
    if (!(sw && h1)) return;
    var row = document.createElement('div'); row.className = 'x-hrow';
    var c1 = document.createElement('div'); c1.className = 'x-hc1'; if (eb) c1.appendChild(eb); c1.appendChild(h1);
    var c2 = document.createElement('div'); c2.className = 'x-hc2'; c2.appendChild(sw);
    var c3 = document.createElement('div'); c3.className = 'x-hc3';
    if (bar) { bar.classList.add('x-hbar'); c3.appendChild(bar); }
    if (sb) { sb.classList.add('x-top'); c3.appendChild(sb); }
    row.appendChild(c1); row.appendChild(c2); row.appendChild(c3); hd.insertBefore(row, hd.firstChild); hd.classList.add('x-tight');
    var iceSec = document.querySelector('#view .x-ice');
    var x = (S.ice && typeof S.ice.on === 'boolean') ? S.ice : null, stt = sw.querySelector('.status');
    if (stt) { var seg = sw.querySelector('.seg2'); if (seg) seg.title = stt.textContent; stt.remove(); }
    sw.classList.add('x-icein'); sw.insertAdjacentHTML('beforeend', iceSwitchHtml(x, ft, e, ui.lang === 'es'));
    if (iceSec) iceSec.remove();
  }


  /* 4. Service splits in two (Eric, Nov 8): Checklists · Host · Expo. Host is the old Service screen. Expo is its own screen
     for the window: who is on Expo, online orders, table numbers, the Expo checklist, what runs with what, and the 86 list.
     Each iPad remembers whether it is a Host or an Expo iPad, so the 6:30 PM switch lands on the right one. */
  var ROLE_KEY = 'vicio_foh_svcrole';
  function role() { try { return localStorage.getItem(ROLE_KEY) || 'host'; } catch (err) { return 'host'; } }
  var EXPO_LIST = [
    ['Before service', ['Heat lamps on and the window wiped clean', 'Plates stocked at the window: pizza plates and small plates', 'Pizza spatulas and pizza stands ready',
      'Sauce ramekins portioned: ranch, red sauce, ketchup', 'Napkins and wet naps stocked', 'Parm and chile flake shakers full',
      'To-go bags, boxes and utensil kits stocked for online orders', 'Ticket printer paper loaded, spare roll at the window']],
    ['During service', ['Every plate checked against the ticket before it leaves: right dish, mods, sauces', 'Table number on every ticket and the runner told where it goes',
      'Online orders bagged with napkins, sauces on the ticket, and utensils if asked', 'Window kept clear and wiped between rushes']],
    ['After service', ['Heat lamps off and the window wiped down', 'Leftover ramekins tossed, containers to the dish pit', 'Plates, napkins and to-go supplies restocked for tomorrow']]];
  var EXPO_DEF = [['Any pizza', '1 plate per guest, pizza spatula, napkins. Parm and chile flake shakers if the table has none'], ['Seasoned Waffle Fries', 'Ketchup'], ['Garlic Bread', 'Red sauce on the side'],
    ['Green Chile Mozz Sticks', 'Red sauce on the side'], ['Fried Pickles', 'Ranch'], ['Buffalo Baddies', 'Ranch, extra napkins'], ['Wings', 'Ranch, wet naps, empty plate for bones, extra napkins'],
    ['The Side Chicks', 'Fries and ranch come on it. Extra napkins'], ['Chicken sandwiches (Basic, La Toxica, Bad Chick)', 'Fries and ranch come on it. Steak knife, napkins'], ['Online pickup order', 'Bag, napkins, plates and forks if asked, sauces on the ticket']];
  function names() { try { var x = JSON.parse(localStorage.getItem('vicio_foh_names') || 'null'); if (x && x.date === svcDate() && Array.isArray(x.names)) return x.names; } catch (err) {} var n = typeof whoName === 'function' ? whoName() : ''; return n ? [n] : []; }
  function whoBox() {
    var nm = names(), ppl = (typeof stPeople === 'function' ? stPeople() : []).filter(function (p) { return nm.indexOf(p.name) < 0; });
    return '<section class="card x-signin x-compact x-expowho"><div class="x-row"><b class="x-lbl">' + ft('On Expo', 'En Expo') + '</b>' +
      nm.map(function (n) { return '<span class="x-tag">' + e(n) + '<button type="button" class="btn x" data-fwho="rm" data-name="' + e(n) + '" aria-label="' + ft('Remove', 'Quitar') + ' ' + e(n) + '">\u00d7</button></span>'; }).join('') +
      '<select data-fwho-sel="1" aria-label="' + ft('Add someone on Expo', 'Agregar a alguien en Expo') + '"><option value="">' + (nm.length ? ft('Add someone\u2026', 'Agregar a alguien\u2026') : ft('Pick your name\u2026', 'Elige tu nombre\u2026')) + '</option>' +
      ppl.map(function (p) { return '<option value="' + e(p.name) + '">' + e(p.name) + '</option>'; }).join('') + '<option value="__other">' + ft('Someone else\u2026', 'Otra persona\u2026') + '</option></select>' +
      '<input type="text" id="fwho-txt" class="x-other" placeholder="' + ft('Name', 'Nombre') + '" autocomplete="off" hidden><button type="button" class="btn primary x-other" data-fwho="in" hidden>' + ft('Add', 'Agregar') + '</button></div></section>';
  }
  function tablesBox() {
    var list = (S.layout && S.layout.tables) || [];
    var by = ['Inside', 'Bar', 'Patio'].map(function (a) { return [a, list.filter(function (t) { return t.area === a; }).sort(function (x, y) { return String(x.n).localeCompare(String(y.n), undefined, { numeric: true }); })]; }).filter(function (g) { return g[1].length; });
    return '<section class="card x-expotables"><div class="cardhead"><h3>' + ft('Table numbers', 'N\u00fameros de mesa') + '</h3><button type="button" class="btn x" data-tab="seating">' + ft('Floor map', 'Mapa') + '</button></div>' +
      (by.length ? by.map(function (g) { return '<div class="x-tgrp"><span>' + e(g[0]) + '</span><div>' + g[1].map(function (t) { return '<b>' + e(t.n) + '<small>' + (t.seats || '') + '</small></b>'; }).join('') + '</div></div>'; }).join('')
        : '<p class="status">' + ft('No tables set up yet.', 'A\u00fan no hay mesas.') + '</p>') + '</section>';
  }
  function runsBox() {
    var rows = (S.expo && Array.isArray(S.expo.rows) && S.expo.rows.length) ? S.expo.rows : EXPO_DEF;
    return '<section class="card x-exporuns"><div class="cardhead"><h3>' + ft('What runs with what', 'Qu\u00e9 se lleva con qu\u00e9') + '</h3></div><ul class="x-runs">' +
      rows.map(function (r) { return '<li><b>' + e(r[0]) + '</b><span>' + e(r[1]) + '</span></li>'; }).join('') + '</ul></section>';
  }
  function expoView() {
    var d = ui.date, done = (S.shift && S.shift.done) || {};
    return dateBar('') + whoBox() +
      '<div class="grid x-expotop"><section class="card svcorders" id="svc-orders"></section>' + tablesBox() + '</div>' +
      listCard('expo_svc', ft('Expo checklist', 'Lista de Expo'), d, done) + runsBox() + (typeof e86Card === 'function' ? e86Card() : '');
  }
  function setupModes() {
    if (typeof MODES === 'undefined' || MODES.__split) return;
    MODES.forEach(function (m) { if (m[0] === 'service') m[1] = 'Host'; });
    MODES.push(['expo', 'Expo']); MODES.__split = true;
    if (typeof HEAD === 'object' && HEAD.service) HEAD.service[1] = 'Host';
    if (typeof LISTS === 'object' && !LISTS.expo_svc) LISTS.expo_svc = EXPO_LIST;
    var sm0 = setMode; setMode = function (m) { if (m === 'service' || m === 'expo') { try { localStorage.setItem(ROLE_KEY, m === 'expo' ? 'expo' : 'host'); } catch (err) {} } return sm0(m); };
    var cm0 = curMode; curMode = function () { var m = cm0(); return m === 'service' && role() === 'expo' && !(typeof modeOverride === 'function' && modeOverride() === 'service') ? 'expo' : m; };
    ui.mode = curMode();
  }
  function expoHead() {
    if (ui.mode !== 'expo' || ui.tab !== 'today') return;
    var h1 = document.querySelector('#head h1'); if (h1) h1.textContent = ft('Expo', 'Expo');
  }
  var CSS = '#head .lede,#head .eyebrow{display:none}#head h1{margin-bottom:10px}#head .modesw{margin-bottom:8px}' +
    '.x-hrow{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px 28px;align-items:start;margin:0 0 14px}' +
    '.x-hc1 .eyebrow{display:block!important;margin:2px 0 2px}.x-hc1 h1{margin:0;line-height:.95}' +
    '.x-hc2{display:grid;gap:8px;justify-items:start}.x-hc2 .modesw{margin:0}' +
    '.x-hc3{display:grid;gap:8px;min-width:0}.x-hc3 .x-hbar{margin:0}.x-hc3 .shiftbar.x-top{margin:0;gap:10px}.shiftbar.x-top .segbar{height:12px}' +
    '.shiftbar.x-top .seghead{flex-wrap:wrap;gap:0 8px}.shiftbar.x-top .seghead b,.shiftbar.x-top .seghead span{white-space:nowrap}.shiftbar.x-top .segleft{font-size:12px;line-height:1.3;margin:0}' +
    '.x-hc3{grid-column:1/-1}' +
    '.x-icechip{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:4px 6px 4px 12px;border:1px solid var(--line,#2E2E34);border-radius:999px}.x-icechip .x-icel{font:700 12px var(--f-mono,monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}' +
    '.x-icechip small{color:var(--muted);font-size:12px;margin:0 6px 0 2px;white-space:nowrap}.x-icebtn{appearance:none;min-height:36px;min-width:52px;padding:4px 12px;border-radius:999px;border:1px solid var(--line,#2E2E34);background:transparent;color:var(--ink);font:700 13px var(--f-body,system-ui);cursor:pointer}' +
    '.x-icechip.on .x-icebtn.cur{background:var(--good,#4CC38A);border-color:var(--good,#4CC38A);color:#06210f}.x-icechip.off .x-icebtn.cur{background:var(--cherry,#C4161C);border-color:var(--cherry,#C4161C);color:#fff}' +
'.x-iceswitch{appearance:none;display:inline-flex;align-items:center;gap:12px;min-height:48px;padding:6px 14px 6px 16px;border:0;border-radius:999px;background:#1F5FBF;color:#fff;cursor:pointer;font-family:var(--f-body,system-ui);text-align:left}' +
    '.x-iceswitch .x-isl{display:grid;line-height:1.15}.x-iceswitch .x-isl b{font:700 13px var(--f-mono,monospace);letter-spacing:.06em;text-transform:uppercase}.x-iceswitch .x-isl small{font-size:12px;opacity:.85;white-space:nowrap}' +
    '.x-itrack{position:relative;width:52px;height:30px;border-radius:999px;background:rgba(255,255,255,.28);transition:background .2s;flex:0 0 auto}.x-iknob{position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.35);transition:left .2s}' +
    '.x-iceswitch.on .x-itrack{background:#4CC38A}.x-iceswitch.on .x-iknob{left:25px}.x-istate{font:800 14px var(--f-body,system-ui);min-width:30px}.modesw.x-icein{flex-wrap:wrap;align-items:center}' +
    '.x-expowho{margin-bottom:12px}.x-expowho .x-row{gap:8px}.x-expotop{align-items:start}.x-expotop .svcorders:empty{display:none}' +
    '.x-tgrp{display:flex;gap:10px;align-items:flex-start;margin:6px 0}.x-tgrp>span{flex:0 0 56px;font:700 11px var(--f-mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding-top:9px}' +
    '.x-tgrp>div{display:flex;flex-wrap:wrap;gap:6px}.x-tgrp b{display:inline-flex;align-items:baseline;gap:3px;min-width:44px;justify-content:center;padding:6px 10px;border:1px solid var(--line,#2E2E34);border-radius:10px;font:700 19px var(--f-display,system-ui)}.x-tgrp small{font:500 11px var(--f-body,system-ui);color:var(--muted)}' +
    '.x-runs{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px 18px}.x-runs li{display:grid;gap:2px;padding:8px 0;border-bottom:1px solid var(--line,#2E2E34)}.x-runs b{font-size:16px}.x-runs span{color:var(--muted);font-size:14.5px}' +
    '';
  (function hook() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || typeof S === 'undefined' || !document.head) return setTimeout(hook, 150);
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    setupModes();
    (function wrapToday() {
      /* Wait for the live add-ons to wrap Today first, so the Expo screen sits outside them. */
      if (!(VIEWS.today && /closeCard/.test(String(VIEWS.today)))) return setTimeout(wrapToday, 150);
      var t0 = VIEWS.today; VIEWS.today = function () { return ui.mode === 'expo' ? expoView() : t0.apply(this, arguments); };
      render();
    })();
    var r1 = render; render = function () { r1.apply(this, arguments); try { expoHead(); tight(); } catch (err) {} };
    render();
  })();
})();

/* BOH layout (Eric, Nov 8 2026): Prep · Service · Dough, and the same one-row Today header as FOH:
   [title] [switch with the ice machine under it] [date with Back / Next, then Opening · Mid shift · Closing]. */
(function () {
  if (window.VICIO_BOARD !== 'kitchen') return;
  var es = function () { try { return typeof lang === 'function' && lang() === 'es'; } catch (err) { return false; } };
  var ft = function (a, b) { return es() ? b : a; };
  var e = function (v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  function strip(d) {
    var done = (S.shift && S.shift.done) || {};
    var seg = function (pre, list, label) {
      var n = list.filter(function (x, i) { return done[pre + i]; }).length, tt = list.length, p = tt ? Math.round(100 * n / tt) : 0;
      var col = p >= 90 ? 'var(--good,#4CC38A)' : p >= 50 ? 'var(--warn,#F0A43A)' : 'var(--bad,#E5484D)';
      return '<div class="seg' + (p === 100 ? ' done' : '') + '"><div class="segbar"><i style="width:' + p + '%;background:' + col + '"></i></div><div class="seghead"><b>' + label + '</b><span>' + (p === 100 ? ft('Done', 'Listo') : n + ft(' of ', ' de ') + tt) + '</span></div></div>';
    };
    return '<div class="shiftbar x-top">' + seg('ol_', OPENLIST, ft('Opening', 'Apertura')) + seg('ml_', MIDLIST, ft('Mid shift', 'Medio turno')) + seg('cl_', CLOSELIST, ft('Closing', 'Cierre')) + '</div>';
  }
  function iceChip() {
    var x = (S.ice && typeof S.ice.on === 'boolean') ? S.ice : null, on = x && x.on;
    var when = x ? new Date(x.at).toLocaleTimeString(es() ? 'es-MX' : 'en-US', { hour: 'numeric', minute: '2-digit' }) : '';
    return '<div class="x-icechip ' + (x ? (on ? 'on' : 'off') : '') + '"><span class="x-icel">' + ft('Ice machine', 'M\u00e1quina de hielo') + '</span>' +
      '<button type="button" class="x-icebtn' + (on ? ' cur' : '') + '" data-ice="on">' + ft('ON', 'PRENDIDA') + '</button>' +
      '<button type="button" class="x-icebtn' + (x && !on ? ' cur' : '') + '" data-ice="off">' + ft('OFF', 'APAGADA') + '</button>' +
      (x ? '<small>' + e(String(x.by || '?').split(' ')[0]) + ' \u00b7 ' + e(when) + '</small>' : '') + '</div>';
  }
  function iceSwitchHtml(x, ft, e, es) {
    /* Ice machine as a slider on a blue pill, in the spot where "Set by the clock" used to sit (Eric, Nov 8). One tap flips it;
       the tap goes through the same ice handler as before, so it is logged under whoever is signed in. */
    var on = !!(x && x.on), when = x ? new Date(x.at).toLocaleTimeString(es ? 'es-MX' : 'en-US', { hour: 'numeric', minute: '2-digit' }) : '';
    return '<button type="button" class="x-iceswitch' + (on ? ' on' : '') + '" role="switch" aria-checked="' + on + '" data-ice="' + (on ? 'off' : 'on') + '" aria-label="' + ft('Ice machine', 'M\u00e1quina de hielo') + '">' +
      '<span class="x-isl"><b>' + ft('Ice machine', 'M\u00e1quina de hielo') + '</b><small>' + (x ? (on ? ft('On', 'Prendida') : ft('Off', 'Apagada')) + ' \u00b7 ' + (x.by ? e(String(x.by).split(' ')[0]) + ' ' : '') + e(when) : ft('Not logged', 'Sin registro')) + '</small></span>' +
      '<span class="x-itrack"><span class="x-iknob"></span></span><span class="x-istate">' + (on ? ft('ON', 'ON') : ft('OFF', 'OFF')) + '</span></button>';
  }
  function tight() {
    if (ui.tab !== 'today' || ui.mode === 'service') return;
    var hd = document.getElementById('head'); if (!hd || hd.querySelector('.x-hrow')) return;
    var sw = hd.querySelector('.modesw'), eb = hd.querySelector('.eyebrow'), h1 = hd.querySelector('h1'), bar = document.querySelector('#view > .bar');
    if (!(sw && h1)) return;
    if (ui.mode === 'dough') h1.textContent = ft('Dough', 'Masa');
    var row = document.createElement('div'); row.className = 'x-hrow';
    var c1 = document.createElement('div'); c1.className = 'x-hc1'; if (eb) c1.appendChild(eb); c1.appendChild(h1);
    var c2 = document.createElement('div'); c2.className = 'x-hc2'; c2.appendChild(sw); var stt = sw.querySelector('.status'); if (stt) { var seg = sw.querySelector('.seg2'); if (seg) seg.title = stt.textContent; stt.remove(); } sw.classList.add('x-icein'); sw.insertAdjacentHTML('beforeend', iceSwitchHtml((S.ice && typeof S.ice.on === 'boolean') ? S.ice : null, ft, e, es()));
    var c3 = document.createElement('div'); c3.className = 'x-hc3';
    if (bar) { bar.classList.add('x-hbar'); c3.appendChild(bar); }
    c3.insertAdjacentHTML('beforeend', strip(ui.date));
    row.appendChild(c1); row.appendChild(c2); row.appendChild(c3); hd.insertBefore(row, hd.firstChild); hd.classList.add('x-tight');
    var ice = document.querySelector('#view .x-ice'); if (ice) ice.remove();
  }
  function doughView() {
    var d = ui.date, isToday = d === iso(new Date()), jobs = djobs(d), jd = jobs.filter(function (j, i) { return dDone(d, i); }).length;
    var bar = '<div class="bar"><div class="nav"><button class="btn" data-act="dprev">' + ft('Back', 'Atr\u00e1s') + '</button><div class="date">' + e(fmt(d, { weekday: 'long', month: 'long', day: 'numeric' })) + (isToday ? ' <span class="pill good">' + ft('Today', 'Hoy') + '</span>' : '') + '</div><button class="btn" data-act="dnext">' + ft('Next', 'Siguiente') + '</button>' + (isToday ? '' : '<button class="btn" data-act="dtoday">' + ft('Today', 'Hoy') + '</button>') + '</div></div>';
    var today = '<section class="card' + (jobs.length && jd < jobs.length ? ' edge' : '') + ' x-dtoday"><div class="cardhead"><h3>' + ft('Dough jobs', 'Trabajos de masa') + '</h3><span class="count">' + (jobs.length ? jd + ft(' of ', ' de ') + jobs.length : '') + '</span></div>' +
      (jobs.length ? '<ul class="checks plist x-djobs">' + jobs.map(function (j, i) { return '<li><label><input type="checkbox" data-dtoggle="' + d + '|' + i + '"' + (dDone(d, i) ? ' checked' : '') + '><span><b>' + e(j.when) + '</b> \u00b7 ' + e(j.job) + (j.min ? ' (' + e(j.min) + ')' : '') + (j.detail ? '<small>' + e(j.detail) + '</small>' : '') + '</span></label><span class="ptag ' + (j.w === 'C' ? 'c' : 'v') + '">' + (j.w === 'C' ? 'C\u00e9ntrico' : 'Vicio') + '</span></li>'; }).join('') + '</ul>'
        : '<p class="status">' + ft('No dough job on this day.', 'No hay trabajo de masa este d\u00eda.') + '</p>') +
      '<p class="status">' + ft('325 g in every pan. Ovens 525\u00b0F top and bottom.', '325 g en cada charola. Hornos a 525\u00b0F arriba y abajo.') + '</p></section>';
    var ahead = [];
    for (var k = 1; k <= 6; k++) { var dd = addDays(d, k), js = djobs(dd); if (js.length) ahead.push([dd, js]); }
    var next = '<section class="card x-dnext"><div class="cardhead"><h3>' + ft('Coming up', 'Lo que viene') + '</h3><button type="button" class="btn x" data-tab="dough">' + ft('Full schedule', 'Calendario completo') + '</button></div>' +
      (ahead.length ? '<ul class="plain tight">' + ahead.map(function (a) { return '<li><b>' + e(fmt(a[0], { weekday: 'short', month: 'short', day: 'numeric' })) + '</b> <span class="muted">' + a[1].map(function (j) { return e(j.when) + ' ' + e(j.s || j.job); }).join(' \u00b7 ') + '</span></li>'; }).join('') + '</ul>'
        : '<p class="status">' + ft('Nothing in the next six days.', 'Nada en los pr\u00f3ximos seis d\u00edas.') + '</p>') + '</section>';
    return bar + today + next;
  }
  var CSS = '#head .lede,#head .eyebrow{display:none}#head h1{margin-bottom:10px}' +
    '.x-hrow{display:grid;grid-template-columns:auto minmax(0,1fr);gap:10px 28px;align-items:start;margin:0 0 14px}.x-hc1 .eyebrow{display:block!important;margin:2px 0}.x-hc1 h1{margin:0;line-height:.95}' +
    '.x-hc2{display:grid;gap:8px;justify-items:start}.x-hc2 .modesw{margin:0}.x-hc3{display:grid;gap:8px;min-width:0}.x-hc3 .x-hbar{margin:0}' +
    '.shiftbar.x-top{display:flex;gap:10px;margin:0}.shiftbar.x-top .seg{display:grid;gap:4px;flex:1;min-width:0}.shiftbar.x-top .segbar{height:12px;background:var(--line);border-radius:6px;overflow:hidden}.shiftbar.x-top .segbar i{display:block;height:100%;border-radius:6px}' +
    '.shiftbar.x-top .seghead{display:flex;justify-content:space-between;align-items:baseline;gap:0 8px;flex-wrap:wrap}.shiftbar.x-top .seghead b{font-family:var(--f-display);text-transform:uppercase;letter-spacing:.04em;font-size:15px;font-weight:600;white-space:nowrap}.shiftbar.x-top .seghead span{font:500 12px var(--f-mono,monospace);color:var(--muted);white-space:nowrap}' +
    '.x-hc3{grid-column:1/-1}' +
    '.x-icechip{display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:4px 6px 4px 12px;border:1px solid var(--line);border-radius:999px}.x-icechip .x-icel{font:700 12px var(--f-mono,monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}' +
    '.x-icechip small{color:var(--muted);font-size:12px;margin:0 6px 0 2px;white-space:nowrap}.x-icebtn{appearance:none;min-height:36px;min-width:52px;padding:4px 12px;border-radius:999px;border:1px solid var(--line);background:transparent;color:var(--ink);font:700 13px var(--f-body,system-ui);cursor:pointer}' +
    '.x-icechip.on .x-icebtn.cur{background:var(--good);border-color:var(--good);color:#06210f}.x-icechip.off .x-icebtn.cur{background:var(--cherry);border-color:var(--cherry);color:#fff}' +
'.x-iceswitch{appearance:none;display:inline-flex;align-items:center;gap:12px;min-height:48px;padding:6px 14px 6px 16px;border:0;border-radius:999px;background:#1F5FBF;color:#fff;cursor:pointer;font-family:var(--f-body,system-ui);text-align:left}' +
    '.x-iceswitch .x-isl{display:grid;line-height:1.15}.x-iceswitch .x-isl b{font:700 13px var(--f-mono,monospace);letter-spacing:.06em;text-transform:uppercase}.x-iceswitch .x-isl small{font-size:12px;opacity:.85;white-space:nowrap}' +
    '.x-itrack{position:relative;width:52px;height:30px;border-radius:999px;background:rgba(255,255,255,.28);transition:background .2s;flex:0 0 auto}.x-iknob{position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.35);transition:left .2s}' +
    '.x-iceswitch.on .x-itrack{background:#4CC38A}.x-iceswitch.on .x-iknob{left:25px}.x-istate{font:800 14px var(--f-body,system-ui);min-width:30px}.modesw.x-icein{flex-wrap:wrap;align-items:center}' +
    '.x-djobs li label span{font-size:17px}.x-djobs small{display:block;color:var(--muted);font-size:14px}';
  (function hook() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || typeof S === 'undefined' || typeof MODES === 'undefined' || !document.head) return setTimeout(hook, 150);
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    if (!MODES.__dough) { MODES.push(['dough', 'Dough']); MODES.__dough = true; }
    (function wrapToday() {
      if (!(VIEWS.today && /closeCard/.test(String(VIEWS.today)))) return setTimeout(wrapToday, 150);
      var t0 = VIEWS.today; VIEWS.today = function () { return ui.mode === 'dough' ? doughView() : t0.apply(this, arguments); };
      render();
    })();
    var r1 = render; render = function () { r1.apply(this, arguments); try { tight(); } catch (err) {} };
    render();
  })();
})();
