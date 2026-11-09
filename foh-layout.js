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
    /* The header stays the same on every FOH page and in every mode (Checklists, Host, Expo): title, the switch, the ice
       machine, the three progress bars and, on Expo, who is on Expo (Eric, Nov 8). */
    var hd = document.getElementById('head'); if (!hd || hd.querySelector('.x-hrow')) return;
    /* One header row, like Eric's mock: [FRONT OF HOUSE / TONIGHT] [Checklists · Host · Expo, ice machine under it]
       [date with Back / Next and Whole night % on top, Opening · Mid shift · Closing under it]. */
    var sw = hd.querySelector('.modesw'), eb = hd.querySelector('.eyebrow'), h1 = hd.querySelector('h1');
    var bar = ui.tab === 'today' ? document.querySelector('#view > .bar') : null, sb = document.querySelector('#view .shiftbar');
    if (!sb && typeof shiftBar === 'function') { var tmp = document.createElement('div'); tmp.innerHTML = shiftBar(ui.date, (S.shift && S.shift.done) || {}); sb = tmp.firstElementChild; }
    if (!(sw && h1)) return;
    var row = document.createElement('div'); row.className = 'x-hrow';
    var c1 = document.createElement('div'); c1.className = 'x-hc1'; if (eb) c1.appendChild(eb); c1.appendChild(h1);
    var c2 = document.createElement('div'); c2.className = 'x-hc2'; c2.appendChild(sw);
    var c3 = document.createElement('div'); c3.className = 'x-hc3';
    if (bar) { bar.classList.add('x-hbar'); c3.appendChild(bar); }
    if (sb) { sb.classList.add('x-top', 'x-mini'); c2.appendChild(sb); }
    row.appendChild(c1); row.appendChild(c2); row.appendChild(c3); hd.insertBefore(row, hd.firstChild); hd.classList.add('x-tight');
    var iceSec = document.querySelector('#view .x-ice');
    var x = (S.ice && typeof S.ice.on === 'boolean') ? S.ice : null, stt = sw.querySelector('.status');
    if (stt) { var seg = sw.querySelector('.seg2'); if (seg) seg.title = stt.textContent; stt.remove(); }
    sw.classList.add('x-icein'); sw.insertAdjacentHTML('beforeend', iceSwitchHtml(x, ft, e, ui.lang === 'es'));
    if (iceSec) iceSec.remove();
    /* Expo: who is on Expo sits in the top row too, right after the ice machine (Eric, Nov 8). */
    var ew = document.querySelector('#view .x-expowho'); if (ew) { ew.classList.add('x-intop'); c2.appendChild(ew); }
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
    ['The Side Chicks', 'Fries and ranch come on it. Extra napkins'], ['Chicken sandwiches', 'Fries and ranch come on it. Steak knife, napkins'], ['Online pickup order', 'Bag, napkins, plates and forks if asked, sauces on the ticket']];
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
    /* A small copy of the Reservations floor plan, Inside or Patio, for runners to check where a table is (Eric, Nov 8).
       Same card as before; bar seats show on the Inside map where they sit at the bar. */
    var L = S.layout || {}, list = L.tables || [], fx = L.fixtures || [], area = ui.expoArea || 'Inside';
    var box = function (t) {
      var sh = t.shape || 'square', seats = +t.seats || 4, w, h;
      if (sh === 'stool') { w = 5.2; h = 8; } else if (sh === 'tall') { w = 6.6; h = seats > 2 ? 17 : 12; } else if (sh === 'long') { w = 12; h = 11; } else if (sh === 'round') { w = 8; h = 12.3; } else { w = seats > 2 ? 8.4 : 7; h = seats > 2 ? 12.5 : 10.5; }
      return [w, h];
    };
    var items = [];
    list.forEach(function (t) {
      var x = t.x, y = t.y;
      if (area === 'Inside' && t.area === 'Bar') { if (t.ix == null) return; x = t.ix; y = t.iy; }
      else if (t.area !== area) return;
      var wh = box(t);
      items.push('<span class="x-mt ' + e(t.shape || 'square') + '" style="left:' + x + '%;top:' + y + '%;width:' + wh[0] + '%;height:' + wh[1] + '%">' + e(t.n) + '</span>');
    });
    fx.filter(function (f) { return f.area === area; }).forEach(function (f) {
      items.unshift('<span class="x-mf" style="left:' + f.x + '%;top:' + f.y + '%;width:' + f.w + '%;height:' + f.h + '%">' + e(f.label) + '</span>');
    });
    var n = list.filter(function (t) { return area === 'Inside' ? (t.area === 'Inside' || (t.area === 'Bar' && t.ix != null)) : t.area === area; }).length;
    return '<section class="card x-expotables"><div class="cardhead"><h3>' + ft('Floor map', 'Mapa del piso') + '</h3>' +
      '<span class="x-mtabs">' + ['Inside', 'Patio'].map(function (a) { return '<button type="button" class="chip' + (area === a ? ' on' : '') + '" data-xmap="' + a + '">' + (a === 'Inside' ? ft('Inside', 'Adentro') : ft('Patio', 'Patio')) + '</button>'; }).join('') + '</span>' +
      '<button type="button" class="btn x" data-tab="seating">' + ft('Full map', 'Mapa completo') + '</button></div>' +
      (n ? '<div class="x-mini-map">' + items.join('') + '</div>' : '<p class="status">' + ft('No tables set up yet.', 'A\u00fan no hay mesas.') + '</p>') + '</section>';
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-xmap]'); if (!b) return; ev.preventDefault(); ev.stopImmediatePropagation();
    ui.expoArea = b.dataset.xmap; render();
  }, true);
  function runsBox() {
    var rows = (S.expo && Array.isArray(S.expo.rows) && S.expo.rows.length) ? S.expo.rows : EXPO_DEF;
    return '<section class="card x-exporuns"><div class="cardhead"><h3>' + ft('What runs with what', 'Qu\u00e9 se lleva con qu\u00e9') + '</h3></div><ul class="x-runs">' +
      rows.map(function (r) { return '<li><b>' + e(r[0]) + '</b><span>' + e(r[1]) + '</span></li>'; }).join('') + '</ul></section>';
  }
  function expoView() {
    var d = ui.date, done = (S.shift && S.shift.done) || {};
    return dateBar('') + whoBox() +
      '<div class="grid x-expotop"><section class="card svcorders" id="svc-orders"></section>' + tablesBox() + '</div>' +
      runsBox() + listCard('expo_svc', ft('Expo checklist', 'Lista de Expo'), d, done) + (typeof e86Card === 'function' ? e86Card() : '');
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
'.x-hc2{display:flex!important;flex-wrap:wrap;align-items:center;gap:8px 14px;justify-items:initial}.x-hc2 .modesw{margin:0}' +
    '.shiftbar.x-mini{display:flex;gap:8px;flex:1 1 300px;min-width:280px;max-width:520px;margin:0}.shiftbar.x-mini .seg{display:grid;gap:3px;flex:1;min-width:0}' +
    '.shiftbar.x-mini .segbar{height:7px;border-radius:4px}.shiftbar.x-mini .segbar i{border-radius:4px}.shiftbar.x-mini .segleft{display:none}' +
    '.shiftbar.x-mini .seghead{display:flex;justify-content:space-between;align-items:baseline;gap:4px;flex-wrap:nowrap}.shiftbar.x-mini .seghead b{font-size:12px!important;letter-spacing:.05em;white-space:nowrap}.shiftbar.x-mini .seghead span{font-size:11px!important;white-space:nowrap}' +
    '.x-iceswitch{min-height:42px!important;padding:4px 12px 4px 14px!important;gap:10px!important}.x-itrack{width:46px!important;height:26px!important}.x-iknob{width:20px!important;height:20px!important}.x-iceswitch.on .x-iknob{left:23px!important}' +
    '.x-expowho.x-intop{margin:0;padding:0;border:0;background:none;box-shadow:none}.x-expowho.x-intop .x-row{gap:6px}.x-expowho.x-intop .x-row{flex-wrap:nowrap}.x-expowho.x-intop select{min-height:42px;flex:0 1 190px;min-width:150px;max-width:220px}.x-expowho.x-intop .x-tag{white-space:nowrap}.x-expowho.x-intop .x-lbl{font-size:13px;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;margin-right:2px}' +
    '.x-expowho{margin-bottom:12px}.x-expowho .x-row{gap:8px}.x-expotop{align-items:start}.x-expotop .svcorders:empty{display:none}' +
    '.x-mtabs{display:inline-flex;gap:2px;margin-left:auto;padding:3px;border:1px solid var(--line,#2E2E34);border-radius:999px}.x-mtabs .chip{appearance:none;min-height:32px;padding:3px 14px;border:0;border-radius:999px;background:transparent;color:var(--muted);font:700 13px var(--f-body,system-ui);cursor:pointer}.x-mtabs .chip.on{background:var(--cherry,#E0575A);color:#fff}.x-mt.stool{font-size:clamp(9px,1.1vw,12px)}.x-expotables .cardhead{gap:8px;flex-wrap:wrap}' +
    '.x-mini-map{position:relative;width:100%;aspect-ratio:10/6.5;border:1px solid var(--line,#2E2E34);border-radius:10px;background-image:radial-gradient(var(--line,#2E2E34) 1px,transparent 1px);background-size:14px 14px;overflow:hidden}' +
    '.x-mt{position:absolute;transform:translate(-50%,-50%);display:grid;place-items:center;border:2px solid var(--good,#4CC38A);border-radius:6px;background:var(--surface,#1B1B1F);color:var(--ink);font:700 clamp(11px,1.6vw,15px)/1 var(--f-display,system-ui)}.x-mt.stool,.x-mt.round{border-radius:50%}' +
    '.x-mf{position:absolute;transform:translate(-50%,-50%);display:grid;place-items:center;border:1px solid var(--line,#2E2E34);border-radius:6px;background:rgba(255,255,255,.05);color:var(--muted);font:700 11px var(--f-mono,monospace);letter-spacing:.08em;text-transform:uppercase}' +
    '.x-tgrp{display:flex;gap:10px;align-items:flex-start;margin:6px 0}.x-tgrp>span{flex:0 0 56px;font:700 11px var(--f-mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding-top:9px}' +
    '.x-tgrp>div{display:flex;flex-wrap:wrap;gap:6px}.x-tgrp b{display:inline-flex;align-items:baseline;gap:3px;min-width:44px;justify-content:center;padding:6px 10px;border:1px solid var(--line,#2E2E34);border-radius:10px;font:700 19px var(--f-display,system-ui)}.x-tgrp small{font:500 11px var(--f-body,system-ui);color:var(--muted)}' +
    '.x-runs{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:8px 18px}.x-runs li{display:grid;gap:2px;padding:8px 0;border-bottom:1px solid var(--line,#2E2E34)}.x-runs b{font-size:16px}.x-runs span{color:var(--muted);font-size:14.5px}' +
    '';
  (function hook() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || typeof S === 'undefined' || !document.head) return setTimeout(hook, 150);
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    setupModes();
    /* Colette's Board can ask the FOH board to open on a page (its reservation count opens Reservations). */
    try { var go = localStorage.getItem('vicio_foh_goto'); if (go && VIEWS[go]) { localStorage.removeItem('vicio_foh_goto'); ui.tab = go; } } catch (err) {}
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
    /* BOH Service: no ice machine there at all (Eric, Nov 9). */
    if (ui.tab === 'today' && ui.mode === 'service') { var ic = document.querySelector('#view .x-ice'); if (ic) ic.remove(); }
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
    if (ui.mode !== 'dough') c2.insertAdjacentHTML('beforeend', strip(ui.date).replace('shiftbar x-top', 'shiftbar x-top x-mini'));
    row.appendChild(c1); row.appendChild(c2); row.appendChild(c3); hd.insertBefore(row, hd.firstChild); hd.classList.add('x-tight');
    var ice = document.querySelector('#view .x-ice'); if (ice) ice.remove();
  }
  function doughView() {
    /* Dough is the whole week at a glance (Eric, Nov 8): Sunday to Saturday side by side, every job with its time and who
       does it, a box to tick it done (same ticks as the Today card), today outlined, and Back / Next by week. */
    var md = function (x, o) { return parse(x).toLocaleDateString(es() ? 'es-MX' : 'en-US', o); };
    var td = iso(new Date()), ws = ui.dweek || iso(monday(parse(ui.date))), days = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return addDays(ws, i); });
    var all = 0, done = 0;
    var cols = days.map(function (d) {
      var jobs = djobs(d), dw = parse(d).getDay(), n = jobs.filter(function (j, i) { return dDone(d, i); }).length; all += jobs.length; done += n;
      return '<div class="x-dday' + (d === td ? ' today' : '') + (jobs.length ? '' : ' empty') + (d < td ? ' past' : '') + '">' +
        '<div class="x-ddh"><b>' + e(md(d, { weekday: 'short' })) + '</b><span>' + e(md(d, { month: 'short', day: 'numeric' })) + '</span>' + (jobs.length ? '<i class="' + (n === jobs.length ? 'ok' : '') + '">' + n + '/' + jobs.length + '</i>' : '') + '</div>' +
        '<p class="x-dds">' + e((typeof DSTAFF !== 'undefined' && DSTAFF[dw]) || ft('No dough tasks', 'Sin tareas de masa')) + '</p>' +
        (jobs.length ? jobs.map(function (j, i) { var ok = dDone(d, i); return '<label class="x-dj' + (j.w === 'C' ? ' c' : '') + (ok ? ' ok' : '') + '"><input type="checkbox" data-dtoggle="' + d + '|' + i + '"' + (ok ? ' checked' : '') + '><span><em>' + e(j.when) + '</em><b>' + e(j.job) + '</b>' + (j.min ? '<small>' + e(j.min) + '</small>' : '') + '</span></label>'; }).join('')
          : '<p class="x-dnone">' + ft('Nothing', 'Nada') + '</p>') + '</div>';
    }).join('');
    var thisWeek = ws === iso(monday(new Date()));
    var bar = '<div class="bar"><div class="nav"><button class="btn" data-xdw="-7">' + ft('Last week', 'Semana pasada') + '</button><div class="date">' + ft('Week of ', 'Semana del ') + e(md(ws, { month: 'short', day: 'numeric' })) + ' \u2013 ' + e(md(days[6], { month: 'short', day: 'numeric' })) + (thisWeek ? ' <span class="pill good">' + ft('This week', 'Esta semana') + '</span>' : '') + '</div><button class="btn" data-xdw="7">' + ft('Next week', 'Siguiente') + '</button>' + (thisWeek ? '' : '<button class="btn" data-xdw="0">' + ft('This week', 'Esta semana') + '</button>') + '</div><span class="count">' + done + ft(' of ', ' de ') + all + ft(' done', ' hechos') + '</span></div>';
    return bar + '<div class="x-dweek">' + cols + '</div>' + (typeof LEGEND !== 'undefined' ? LEGEND : '') +
      '<p class="status">' + ft('325 g in every pan. Ovens 525\u00b0F top and bottom, on 30 minutes before the bake.', '325 g en cada charola. Hornos a 525\u00b0F arriba y abajo, prendidos 30 minutos antes de hornear.') + '</p>';
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-xdw]'); if (!b) return; ev.preventDefault(); ev.stopImmediatePropagation();
    var n = +b.dataset.xdw; ui.dweek = n === 0 ? null : addDays(ui.dweek || iso(monday(parse(ui.date))), n); render();
  }, true);
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
'.x-hc2{display:flex!important;flex-wrap:wrap;align-items:center;gap:8px 14px;justify-items:initial}.x-hc2 .modesw{margin:0}' +
    '.shiftbar.x-mini{display:flex;gap:8px;flex:1 1 300px;min-width:280px;max-width:520px;margin:0}.shiftbar.x-mini .seg{display:grid;gap:3px;flex:1;min-width:0}' +
    '.shiftbar.x-mini .segbar{height:7px;border-radius:4px}.shiftbar.x-mini .segbar i{border-radius:4px}.shiftbar.x-mini .segleft{display:none}' +
    '.shiftbar.x-mini .seghead{display:flex;justify-content:space-between;align-items:baseline;gap:4px;flex-wrap:nowrap}.shiftbar.x-mini .seghead b{font-size:12px!important;letter-spacing:.05em;white-space:nowrap}.shiftbar.x-mini .seghead span{font-size:11px!important;white-space:nowrap}' +
    '.x-iceswitch{min-height:42px!important;padding:4px 12px 4px 14px!important;gap:10px!important}.x-itrack{width:46px!important;height:26px!important}.x-iknob{width:20px!important;height:20px!important}.x-iceswitch.on .x-iknob{left:23px!important}' +
    '#head .x-hc2{padding-right:72px}' +
    '.x-invfix{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.x-invfix input,.x-invfix select{min-height:40px;padding:6px 8px;border-radius:8px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:500 15px var(--f-body,system-ui)}.x-invfix input[type=text]{flex:2 1 140px}.x-invfix input[data-inv-fix$="|unit"]{flex:1 1 80px}.x-invfix input[type=number]{flex:0 1 80px;width:80px}.x-invfix select{flex:1 1 110px}' +
    '.x-dweek{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:8px;margin:0 0 12px}@media (max-width:900px){.x-dweek{grid-template-columns:repeat(2,minmax(0,1fr))}}' +
    '.x-dday{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 8px;display:flex;flex-direction:column;gap:6px;min-width:0}.x-dday.today{border:2px solid var(--cherry);box-shadow:0 0 0 3px rgba(139,30,30,.08)}.x-dday.past{opacity:.72}.x-dday.empty{background:transparent}' +
    '.x-ddh{display:flex;align-items:baseline;gap:6px}.x-ddh b{font:700 16px var(--f-display,system-ui);text-transform:uppercase;letter-spacing:.03em}.x-ddh span{color:var(--muted);font-size:13px}.x-ddh i{margin-left:auto;font:600 11px var(--f-mono,monospace);font-style:normal;color:var(--muted)}.x-ddh i.ok{color:var(--good)}' +
    '.x-dds{margin:0;font-size:11.5px;line-height:1.3;color:var(--muted)}.x-dnone{margin:6px 0 0;color:var(--muted);font-size:13px}' +
    '.x-dj{display:flex;gap:6px;align-items:flex-start;border-left:4px solid var(--cherry);background:var(--bg);border-radius:0 8px 8px 0;padding:6px 6px;cursor:pointer}.x-dj.c{border-left-color:var(--good)}.x-dj input{width:20px;height:20px;margin:1px 0 0;flex:0 0 auto;accent-color:var(--good)}' +
    '.x-dj span{display:grid;gap:1px;min-width:0;font-size:13px;line-height:1.3}.x-dj em{font:600 11px var(--f-mono,monospace);font-style:normal;color:var(--muted)}.x-dj b{font-weight:600;overflow-wrap:anywhere}.x-dj small{color:var(--muted);font-size:11.5px}.x-dj.ok b{text-decoration:line-through;color:var(--muted)}';
  (function hook() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || typeof S === 'undefined' || typeof MODES === 'undefined' || !document.head) return setTimeout(hook, 150);
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    if (!MODES.__dough) { MODES.push(['dough', 'Dough']); MODES.__dough = true; }
    /* The BOH Schedule page is gone; the Dough schedule page takes its place and shows the same week calendar as Dough. */
    if (typeof GROUPS !== 'undefined' && !GROUPS.__nocal) { GROUPS.forEach(function (g) { var i = g[1].indexOf('calendar'); if (i >= 0) g[1].splice(i, 1); }); GROUPS.__nocal = true; }
    if (ui.tab === 'calendar') ui.tab = 'dough';
    if (VIEWS.dough && !VIEWS.dough.__week) { VIEWS.dough = function () { return doughView(); }; VIEWS.dough.__week = true; }
    /* Inventory: the kitchen can edit the count lists themselves, no manager needed (Eric, Nov 8). Edit items is open to
       everyone on this page, and in edit mode each item's name, unit, par and vendor can be changed in place. */
    (function wrapInv() {
      if (!VIEWS.inventory || VIEWS.inventory.__open) return;
      if (!/invEdit|data-inv-edit/.test(String(VIEWS.inventory))) return setTimeout(wrapInv, 200);
      var inv0 = VIEWS.inventory;
      /* The page keeps the board's own prep on-hand count (Make / Fill) on top, then the Saturday counts. */
      VIEWS.inventory = function () { var ie = window.isEditor; window.isEditor = function () { return true; }; try { return (typeof prepCount === 'function' ? prepCount() : '') + inv0.apply(this, arguments); } finally { window.isEditor = ie; } };
      VIEWS.inventory.__open = true; render();
    })();
    (function wrapToday() {
      if (!(VIEWS.today && /closeCard/.test(String(VIEWS.today)))) return setTimeout(wrapToday, 150);
      var t0 = VIEWS.today; VIEWS.today = function () { return ui.mode === 'dough' ? doughView() : t0.apply(this, arguments); };
      render();
    })();
    var r1 = render; render = function () { r1.apply(this, arguments); try { tight(); invFix(); } catch (err) {} };
    render();
  })();
  var VEND = ['Shamrock', 'Costco', 'Centrico', 'Other'];
  function invItem(area, id) { var a = (S.invitems && S.invitems.areas && S.invitems.areas[area]) || {}; return (a.items || []).find(function (x) { return x.id === id; }); }
  function invFix() {
    if (ui.tab !== 'inventory') return;
    document.querySelectorAll('#view p.status').forEach(function (p) { if (/A manager adds them/.test(p.textContent)) p.textContent = ft('No items yet. Tap Edit items to add them.', 'A\u00fan no hay art\u00edculos. Toca Editar art\u00edculos para agregarlos.'); });
    /* The kitchen counts whole cases, bags or portions, never tenths (Eric, Nov 9). Tenths are a bar thing. */
    document.querySelectorAll('#view .standard p, #view p.status, #view p').forEach(function (p) {
      var t = p.textContent;
      if (/Partials in tenths/.test(t)) p.textContent = 'Count everything in whole cases, bags or portions, type the number next to each item, then tap Count done on each area. Colette builds the Sunday order from these.';
      else if (/Parciales en d\u00e9cimas/.test(t)) p.textContent = 'Cuenta todo en cajas, bolsas o porciones completas, escribe el n\u00famero junto a cada art\u00edculo y toca Conteo listo en cada \u00e1rea. Colette arma el pedido del domingo con esto.';
      else if (/Count in tenths of a pan/.test(t)) p.textContent = t.replace(/Count in tenths of a pan \(0\.5 is half a pan\)\./, 'Count whole cases, bags or portions.');
    });
    document.querySelectorAll('#view input[type=number]').forEach(function (i) { if (i.step !== '1') { i.step = '1'; i.setAttribute('inputmode', 'numeric'); } });
    /* No beer cooler count on BOH (Eric, Nov 9): that card is dropped and the counted total covers the other areas. */
    var cards = Array.prototype.slice.call(document.querySelectorAll('#view .grid > section.card, #view .grid > details.card')).filter(function (c) { return c.querySelector('[data-inv-done],[data-inv-add],input[data-inv]') || /Counted|Contado|No items yet|A\u00fan no hay/.test(c.textContent); });
    cards.forEach(function (c) { var h = c.querySelector('h3'); if (h && /^Beer cooler/i.test(h.textContent.trim())) c.remove(); });
    var left = Array.prototype.slice.call(document.querySelectorAll('#view .grid > section.card, #view .grid > details.card')).filter(function (c) { return cards.indexOf(c) >= 0 && c.isConnected; });
    var cnt = document.querySelector('#view > .bar .count');
    if (cnt && left.length) { var dn = left.filter(function (c) { var p = c.querySelector('.pill.good'); return p && /Counted|Contado/.test(p.textContent); }).length; cnt.textContent = dn + ft(' of ', ' de ') + left.length + ft(' counted', ' contados'); }
    if (!ui.invEdit) return;
    document.querySelectorAll('#view [data-inv-del]').forEach(function (b) {
      var li = b.closest('li'); if (!li || li.querySelector('.x-invfix')) return;
      var p = b.dataset.invDel.split('|'), it = invItem(p[0], p[1]); if (!it) return;
      var k = p[0] + '|' + p[1];
      var row = document.createElement('div'); row.className = 'x-invfix';
      row.innerHTML = '<input type="text" data-inv-fix="' + k + '|name" value="' + e(it.name || '') + '" aria-label="' + ft('Item', 'Art\u00edculo') + '">' +
        '<input type="text" data-inv-fix="' + k + '|unit" value="' + e(it.unit || '') + '" placeholder="' + ft('Unit', 'Unidad') + '" aria-label="' + ft('Unit', 'Unidad') + '">' +
        '<input type="number" inputmode="decimal" data-inv-fix="' + k + '|par" value="' + (it.par == null ? '' : e(it.par)) + '" placeholder="Par" aria-label="Par">' +
        '<select data-inv-fix="' + k + '|vendor" aria-label="' + ft('Vendor', 'Proveedor') + '">' + VEND.map(function (v) { return '<option' + (it.vendor === v ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select>';
      var span = li.querySelector('span'); (span || li).appendChild(row);
    });
  }
  /* Add item works inside the fold-open cards too (the old handler looked for a plain card and failed). Runs first, on window. */
  window.addEventListener('click', function (ev) {
    var b = ev.target.closest && ev.target.closest('[data-inv-add]'); if (!b) return; ev.preventDefault(); ev.stopImmediatePropagation();
    var card = b.closest('section, details'); if (!card) return;
    var g = function (f) { var el = card.querySelector('[data-inv-new="' + f + '"]'); return el ? el.value.trim() : ''; }, name = g('name');
    if (!name) { var nf = card.querySelector('[data-inv-new="name"]'); if (nf) nf.focus(); return; }
    var area = b.dataset.invAdd, item = { id: 'i' + Date.now().toString(36), name: name, unit: g('unit'), par: g('par') === '' ? null : +g('par'), vendor: g('vendor') || 'Other' };
    S.invitems = S.invitems || {}; S.invitems.areas = Object.assign({}, S.invitems.areas);
    var a = Object.assign({ name: area }, S.invitems.areas[area]); a.items = (a.items || []).concat([item]); S.invitems.areas[area] = a;
    var patch = { areas: {} }; patch.areas[area] = { name: area, items: a.items }; save('invitems/board', patch); render();
  }, true);
  document.addEventListener('change', function (ev) {
    var el = ev.target; if (!el || !el.dataset || !el.dataset.invFix) return; ev.stopImmediatePropagation();
    var p = el.dataset.invFix.split('|'), area = p[0], id = p[1], f = p[2], a = S.invitems && S.invitems.areas && S.invitems.areas[area]; if (!a) return;
    var v = f === 'par' ? (el.value === '' ? null : +el.value) : el.value.trim(); if (f === 'name' && !v) { render(); return; }
    a.items = (a.items || []).map(function (x) { if (x.id !== id) return x; var y = Object.assign({}, x); y[f] = v; return y; });
    var patch = { areas: {} }; patch.areas[area] = { items: a.items }; save('invitems/board', patch);
  }, true);
})();
