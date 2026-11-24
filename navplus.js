/* Vicio boards: navigation, round two (Eric, Nov 24 2026). Loaded by config.js after nav23.js; both boards.
   1. Land on your list (FOH): when someone taps their name, the board opens Checklists at their role's list for this point
      in the night (the earliest one not finished), and scrolls to it. The role comes from tonight's schedule (a role with
      "bar" is Bartender, "host" or "bus" is Host / Busser, "expo" is Expo), or the person's group on the roster.
   2. What's next: a slim bar at the top of every page with the next thing to do and how many are left. FOH: the next
      unticked item for the person signed in (or for everyone), its list, and whether it is due soon or late; tap it to go
      straight to that box. BOH: the kitchen's own "Next up" from the Today page, so it shows on every page.
   3. Phones: the big icon buttons sit in a bar at the bottom of the screen, where thumbs reach.
   4. One row under Tonight: the mode buttons that used to sit in the header (FOH Host, Expo, Bartender, Training; BOH
      Open, Prep, Service, Dough) join the page pills in a single row. FOH "Checklists" mode is called Today there.
   5. Red dots: FOH Tonight gets a dot when a list is late; Counts when Saturday's bar count is not submitted after 9 PM;
      Guests when a review is waiting for a reply. BOH Tonight gets a dot when the kitchen's next-up list is late in the night.
   6. Search: a magnifier button opens one search over everything: dishes, drinks, bottles, checklist items and pages on
      FOH; recipes, prep items, kitchen lists and pages on BOH. Tap a result to go there.
   7. The Vicio logo always goes back to Tonight. */
(function () {
  var B = window.VICIO_BOARD;
  if (window.__vicioNavPlus || (B !== 'foh' && B !== 'kitchen')) return;
  window.__vicioNavPlus = true;
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function today() { try { return B === 'foh' ? svcDate() : (typeof svcDate === 'function' ? svcDate() : ui.date); } catch (e) { return ''; } }
  function go(tab) { ui.tab = tab; try { localStorage.setItem(B === 'foh' ? 'vicio_foh_tab' : 'vicio_tab', tab); } catch (e) {} render(); window.scrollTo(0, 0); }
  function reveal(el) { if (!el) return; var d = el.closest('details'); while (d) { d.open = true; d = d.parentElement && d.parentElement.closest('details'); } el.scrollIntoView({ block: 'center', behavior: 'smooth' }); var row = el.closest('li,tr,button,.pitem') || el; row.classList.add('x-flash'); setTimeout(function () { row.classList.remove('x-flash'); }, 2200); }
  /* ---- FOH lists on the clock (same due times as nightflow.js) ---- */
  function dayOf(d) { var p = d.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function openMin(d) { var w = dayOf(d).getDay(); return w === 4 ? 17 * 60 : (w === 5 || w === 6) ? 12 * 60 : null; }
  function due(key, d) {
    var o = openMin(d), m = null; if (o == null) return null;
    if (/_open$/.test(key)) m = o; else if (/_amchk$/.test(key)) m = 840; else if (/_amoff$/.test(key)) m = 960; else if (/_pmon$/.test(key)) m = Math.max(o, 990); else if (/_mid$|_svc$/.test(key)) m = 1230; else if (/_close$/.test(key)) m = 1530;
    if (m == null) return null; var t = dayOf(d); t.setMinutes(m); return t.getTime();
  }
  function fohLists(d, role) {
    var done = (S.shift && S.shift.done) || {}, out = [];
    Object.keys(typeof LISTS !== 'undefined' ? LISTS : {}).forEach(function (k) {
      if (role && k.indexOf(role + '_') !== 0) return;
      var it; try { it = flat(k, d); } catch (e) { return; } if (!it.length) return;
      var left = it.filter(function (i) { return !done[i[0]]; });
      out.push({ k: k, it: it, left: left, due: due(k, d) });
    });
    return out.sort(function (a, b) { return (a.due || 9e15) - (b.due || 9e15); });
  }
  function listTitle(k) { return k.replace(/^bar_/, 'Bartender ').replace(/^host_/, 'Host / Busser ').replace(/^expo_/, 'Expo ').replace(/amchk$/, 'lunch check').replace(/amoff$/, 'hand off').replace(/pmon$/, 'takeover').replace(/svc$/, 'service').replace(/_/g, ' '); }
  function roleOf(name) {
    if (!name) return null; var f = name.split(' ')[0].toLowerCase(), r = '';
    try { shiftsOn(today()).forEach(function (w) { if (String(w.name || '').toLowerCase().split(' ')[0] === f) r += ' ' + (w.role || ''); }); } catch (e) {}
    if (!r) try { stPeople().forEach(function (p) { if (String(p.name || '').toLowerCase().split(' ')[0] === f) r += ' ' + (p.group || '') + ' ' + (p.role || ''); }); } catch (e) {}
    return /bar/i.test(r) ? 'bar' : /host|bus/i.test(r) ? 'host' : /expo/i.test(r) ? 'expo' : null;
  }
  /* ---- 1. land on your list ---- */
  function land() {
    if (B !== 'foh') return; var d = today(), role = roleOf(whoName()); if (!role || ui.date !== d) return;
    var l = fohLists(d, role).filter(function (x) { return x.left.length; })[0]; if (!l) return;
    ui.fold = ui.fold || {}; ui.fold[l.k + '_r'] = true; ui.fold[l.k + '_t'] = true; if (role !== 'expo') { ui.role = role; try { localStorage.setItem('vicio_foh_role', role); } catch (e) {} }
    go('lists'); setTimeout(function () { var el = document.querySelector('details[data-fold^="' + l.k + '_"]'); if (el) { el.open = true; el.scrollIntoView({ block: 'start', behavior: 'smooth' }); } }, 250);
  }
  /* ---- 2. what's next ---- */
  var KNEXT = null;
  function mins(n) { n = Math.round(n); return n < 60 ? n + ' min' : Math.floor(n / 60) + ' hr' + (n % 60 ? ' ' + (n % 60) + ' min' : ''); }
  function nextBar() {
    var old = document.getElementById('x-next'); if (old) old.remove();
    var view = document.getElementById('view'); if (!view) return;
    var html = '';
    if (B === 'foh') {
      var d = today(); if (ui.date !== d || openMin(d) == null) return;
      var role = roleOf(whoName()), ls = fohLists(d, role).filter(function (x) { return x.left.length; });
      if (!ls.length && role) ls = fohLists(d, null).filter(function (x) { return x.left.length; });
      if (!ls.length) { html = '<div id="x-next" class="done"><span class="x-nk">Next</span><b>Every list is done.</b></div>'; }
      else {
        var l = ls[0], now = Date.now(), when = l.due ? (now > l.due ? '<em class="late">' + mins((now - l.due) / 6e4) + ' late</em>' : now > l.due - 3 * 36e5 ? '<em>due in ' + mins((l.due - now) / 6e4) + '</em>' : '') : '';
        var total = ls.reduce(function (n, x) { return n + x.left.length; }, 0);
        html = '<button type="button" id="x-next" class="' + (l.due && now > l.due ? 'late' : '') + '" data-xnext="' + esc(l.k) + '|' + esc(l.left[0][0]) + '"><span class="x-nk">Next</span><b>' + esc(l.left[0][1]) + '</b><small>' + esc(listTitle(l.k)) + ' ' + when + ' \u00b7 ' + total + ' left' + (role ? '' : ' tonight') + '</small></button>';
      }
    } else {
      if (ui.tab === 'today') { var n = document.querySelector('#view .nextup'); KNEXT = n ? { text: (n.querySelector('p') || n).textContent.trim(), left: (n.querySelector('small') || {}).textContent || '', done: n.classList.contains('done') } : null; return; }
      if (!KNEXT) return;
      html = KNEXT.done ? '<div id="x-next" class="done"><span class="x-nk">Next up</span><b>' + esc(KNEXT.text) + '</b></div>' : '<button type="button" id="x-next" data-xnext="k"><span class="x-nk">Next up</span><b>' + esc(KNEXT.text) + '</b><small>' + esc(KNEXT.left) + '</small></button>';
    }
    var sub = document.getElementById('x-subnav');
    if (sub) sub.insertAdjacentHTML('afterend', html); else view.insertAdjacentHTML('afterbegin', html);
  }
  var MI = {
    prep: '<path d="M4 20l9-9M13 11l6-6c1 3 0 6-2.5 8.500L13 11zM4 20l3 .5.5-3"/>',
    today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.500M12 19.500V22M2 12h2.500M19.5 12H22M5 5l1.8 1.800M17.2 17.200L19 19M5 19l1.8-1.800M17.2 6.800L19 5"/>',
    seating: '<path d="M5 11V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4M3 13a2 2 0 0 1 4 0v3h10v-3a2 2 0 0 1 4 0v5H3zM6 18v2.500M18 18v2.5"/>',
    menu: '<path d="M12 3l9 17H3zM10 12h.01M13.5 15.500h.01M11 17h.01"/>',
    drinks: '<path d="M5 4h14l-7 8zM12 12v7M8 20h8"/>',
    training: '<path d="M2 9l10-5 10 5-10 5zM6 11.500V16c1.5 1.5 3.5 2.2 6 2.200s4.5-.7 6-2.200v-4.500M22 9v6"/>',
    dough: '<circle cx="12" cy="12" r="8"/><path d="M8.5 10.500c1-2 3.5-3 5.5-2"/>'
  };
  function mico(k) { return MI[k] ? '<svg class="x-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + MI[k] + '</svg>' : ''; }
  /* ---- 4. one row under Tonight ---- */
  function mergeRow() {
    var sub = document.getElementById('x-subnav'), seg = document.querySelector('#head .modesw .seg2');
    if (!sub || !seg) { document.body.classList.remove('x-merged'); return; }
    var tonight = sub.querySelector('[data-tab="today"]'); if (!tonight) { document.body.classList.remove('x-merged'); return; }
    var modes = Array.prototype.map.call(seg.querySelectorAll('button[data-act="mode"]'), function (b) { return { v: b.dataset.v, n: b.textContent.trim(), on: b.getAttribute('aria-pressed') === 'true' }; });
    if (!modes.length) return;
    var IC = { lists: 'today', service: 'seating', expo: 'menu', bar: 'drinks', train: 'training', prep: 'prep', open: 'today', dough: 'dough' };
    var html = modes.map(function (m) {
      var label = B === 'foh' && m.v === 'lists' ? 'Today' : m.n, cur = ui.tab === 'today' && m.on;
      var ic = mico(IC[m.v] || 'today');
      return '<button type="button" data-act="mode" data-v="' + esc(m.v) + '" data-xmode="1"' + (cur ? ' aria-current="page"' : '') + '>' + ic + '<span>' + esc(label.charAt(0) + label.slice(1).toLowerCase()) + '</span></button>';
    }).join('');
    tonight.insertAdjacentHTML('beforebegin', html); tonight.remove();
    document.body.classList.add('x-merged');
    var hrow = document.querySelector('#head .x-hrow'); if (hrow && sub.parentNode !== hrow.parentNode) hrow.insertAdjacentElement('afterend', sub);
  }
  /* ---- 5. dots ---- */
  function dots() {
    var want = {};
    try {
      if (B === 'foh') {
        var d = today(), now = Date.now();
        if (openMin(d) != null && ui.date === d) want.tonight = fohLists(d, null).some(function (x) { return x.left.length && x.due && now > x.due; });
        var h = new Date().getHours(), sat = dayOf(d).getDay() === 6;
        if (sat && (h >= 21 || h < 5) && !(S.inv && S.inv.done && S.inv.done.at)) want.counts = true;
        if (typeof rwList === 'function') want.guests = rwList().some(function (x) { return !x.replied && x.src !== 'In person'; });
      } else {
        var hr = new Date().getHours();
        if (KNEXT && !KNEXT.done && (hr >= 23 || hr < 4)) want.tonight = true;
      }
    } catch (e) {}
    var map = B === 'foh' ? { today: 'tonight', lists: 'tonight', schedule: 'tonight', seating: 'guests', events: 'guests', reviews: 'guests', inventory: 'counts' } : { today: 'tonight', logs: 'tonight', cleaning: 'tonight' };
    Array.prototype.forEach.call(document.querySelectorAll('#tabs .x-gbtn'), function (b) {
      var g = map[b.dataset.tab]; var on = g && want[g], dot = b.querySelector('.x-dot');
      if (on && !dot) b.insertAdjacentHTML('beforeend', '<i class="x-dot" aria-label="Needs attention"></i>'); else if (!on && dot) dot.remove();
    });
  }
  /* ---- 6. search ---- */
  function index() {
    var out = [];
    function add(t, sub, kind, fn, extra) { out.push({ t: t, sub: sub, kind: kind, fn: fn, hay: (t + ' ' + (extra || '') + ' ' + sub).toLowerCase() }); }
    var tabs = typeof TABS !== 'undefined' ? TABS : [];
    tabs.forEach(function (t) { add(t[1], 'Page', 'page', function () { go(t[0]); }); });
    if (B === 'foh') {
      (typeof MENU !== 'undefined' ? MENU : []).forEach(function (g) { (g[2] || []).forEach(function (i) { add(i[0], 'Menu \u00b7 ' + g[0] + (i[1] ? ' \u00b7 ' + i[1] : ''), 'dish', function () { ui.tab = 'menu'; render(); setTimeout(function () { var b = document.querySelector('[data-act="msel"][data-k="f:' + i[0].replace(/"/g, '\\"') + '"]'); if (b) { b.click(); setTimeout(function () { reveal(document.querySelector('[data-act="msel"][data-k="f:' + i[0].replace(/"/g, '\\"') + '"]')); }, 60); } }, 60); }, i[3]); }); });
      (typeof DRINKS !== 'undefined' ? DRINKS : []).forEach(function (x) { add(x.name, 'Drinks \u00b7 ' + (x.group || '') + (x.price ? ' \u00b7 ' + x.price : ''), 'drink', function () { ui.tab = 'drinks'; render(); setTimeout(function () { var b = Array.prototype.filter.call(document.querySelectorAll('[data-act="dsel"]'), function (e) { return (e.textContent || '').trim().indexOf(x.name) === 0; })[0]; if (b) { b.click(); setTimeout(function () { window.scrollTo(0, 0); }, 60); } }, 60); }, (x.menu || '') + ' ' + (x.build || []).map(function (r) { return r[1]; }).join(' ')); });
      (typeof INVITEMS !== 'undefined' ? INVITEMS : []).forEach(function (i) { add(i[1], 'Bar count \u00b7 ' + (i[2] || ''), 'bottle', function () { ui.tab = 'inventory'; ui.fold = ui.fold || {}; ui.fold.sec_bar = true; render(); setTimeout(function () { reveal(document.querySelector('[data-tcid="' + i[0] + '"],[data-blid="' + i[0] + '"],input[data-inv="' + i[0] + '"]')); }, 120); }); });
      var d = today();
      Object.keys(typeof LISTS !== 'undefined' ? LISTS : {}).forEach(function (k) { var it; try { it = flat(k, d); } catch (e) { return; } it.forEach(function (i) { add(i[1], 'Checklist \u00b7 ' + listTitle(k), 'task', function () { var rr = k.split('_')[0]; if (rr === 'bar' || rr === 'host') ui.role = rr; ui.fold = ui.fold || {}; ui.fold[k + '_r'] = true; ui.tab = 'lists'; render(); setTimeout(function () { reveal(document.querySelector('input[data-chk$="|' + i[0] + '"]')); }, 120); }); }); });
    } else {
      (typeof RECIPES !== 'undefined' ? RECIPES : []).forEach(function (g) { g[1].forEach(function (r) { add(r[1], 'Recipe \u00b7 ' + g[0], 'recipe', function () { ui.tab = 'recipes'; render(); setTimeout(function () { if (typeof openRecipe === 'function') openRecipe(r[0]); }, 60); }); }); });
      (typeof PREP !== 'undefined' ? PREP : []).forEach(function (g) { g[1].forEach(function (p) { add(p[1], 'Prep count \u00b7 ' + g[0], 'prep', function () { ui.tab = 'inventory'; ui.kinvTab = 'prep'; render(); setTimeout(function () { reveal(document.querySelector('input[data-poh="' + p[0] + '"]')); }, 120); }); }); });
      [['Opening', typeof OPENLIST !== 'undefined' ? OPENLIST : []], ['Mid shift', typeof MIDLIST !== 'undefined' ? MIDLIST : []], ['Closing', typeof CLOSELIST !== 'undefined' ? CLOSELIST : []]].forEach(function (l) { l[1].forEach(function (t) { add(t, 'Kitchen list \u00b7 ' + l[0], 'task', function () { go('today'); }); }); });
    }
    return out;
  }
  var IDX = null, SQ = '';
  function results(q) {
    q = q.trim().toLowerCase(); if (!q) return [];
    var words = q.split(/\s+/);
    return IDX.filter(function (r) { return words.every(function (w) { return r.hay.indexOf(w) >= 0; }); })
      .sort(function (a, b) { return (a.t.toLowerCase().indexOf(q) === 0 ? 0 : 1) - (b.t.toLowerCase().indexOf(q) === 0 ? 0 : 1) || a.t.length - b.t.length; }).slice(0, 40);
  }
  var KLABEL = { page: 'Page', dish: 'Dish', drink: 'Drink', bottle: 'Bottle', task: 'Checklist', recipe: 'Recipe', prep: 'Prep' };
  function drawResults() {
    var box = document.getElementById('xs-res'); if (!box) return;
    var r = results(SQ); drawResults.r = r;
    box.innerHTML = !SQ.trim() ? '<p class="xs-hint">Search dishes, drinks, bottles, recipes, prep and checklist items.</p>' : r.length ? r.map(function (x, i) { return '<button type="button" data-xsr="' + i + '"><span class="xs-k xs-' + x.kind + '">' + KLABEL[x.kind] + '</span><b>' + esc(x.t) + '</b><small>' + esc(x.sub) + '</small></button>'; }).join('') : '<p class="xs-hint">Nothing matches \u201c' + esc(SQ) + '\u201d.</p>';
  }
  function openSearch() {
    IDX = index(); SQ = '';
    var el = document.getElementById('x-search'); if (el) el.remove();
    document.body.insertAdjacentHTML('beforeend', '<div id="x-search" role="dialog" aria-modal="true" aria-label="Search"><div class="xs-card"><div class="xs-top"><input type="search" id="xs-in" placeholder="Search everything" autocomplete="off" autocorrect="off" aria-label="Search everything"><button type="button" data-xsclose aria-label="Close search">\u00d7</button></div><div id="xs-res"></div></div></div>');
    drawResults(); setTimeout(function () { var i = document.getElementById('xs-in'); if (i) i.focus(); }, 30);
  }
  function closeSearch() { var el = document.getElementById('x-search'); if (el) el.remove(); }
  function searchBtn() {
    var tabs = document.getElementById('tabs'); if (!tabs || tabs.querySelector('.x-sbtn')) return;
    var ic = '<svg class="x-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>';
    var last = tabs.querySelectorAll('.x-gbtn'); last = last[last.length - 1]; if (!last) return;
    var html = '<button type="button" class="x-sbtn" data-xsearch>' + ic + '<span>Search</span><span class="pct"></span></button>';
    if (last) last.insertAdjacentHTML('afterend', html); else tabs.insertAdjacentHTML('beforeend', html);
  }
  /* ---- events ---- */
  document.addEventListener('input', function (e) { if (e.target && e.target.id === 'xs-in') { SQ = e.target.value; drawResults(); } }, true);
  document.addEventListener('keydown', function (e) { if (document.getElementById('x-search')) { if (e.key === 'Escape') closeSearch(); if (e.key === 'Enter' && e.target.id === 'xs-in' && drawResults.r && drawResults.r[0]) { var f = drawResults.r[0].fn; closeSearch(); f(); } } });
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest && t.closest('#rail .brand')) { e.preventDefault(); go('today'); return; }
    var s = t.closest && t.closest('[data-xsearch]'); if (s) { e.preventDefault(); e.stopPropagation(); openSearch(); return; }
    if (t.closest && t.closest('[data-xsclose]')) { e.preventDefault(); closeSearch(); return; }
    if (t.id === 'x-search') { closeSearch(); return; }
    var r = t.closest && t.closest('[data-xsr]'); if (r) { e.preventDefault(); e.stopPropagation(); var f = drawResults.r[+r.dataset.xsr]; closeSearch(); if (f) f.fn(); return; }
    var m = t.closest && t.closest('[data-xmode]'); if (m && ui.tab !== 'today') { ui.tab = 'today'; }
    var n = t.closest && t.closest('[data-xnext]');
    if (n) {
      e.preventDefault(); e.stopPropagation();
      if (B === 'kitchen') { go('today'); setTimeout(function () { var x = document.querySelector('#view .nextup'); if (x) x.click(); }, 80); return; }
      var p = n.dataset.xnext.split('|'), rr = p[0].split('_')[0]; if (rr === 'bar' || rr === 'host') ui.role = rr; ui.fold = ui.fold || {}; ui.fold[p[0] + '_r'] = true; ui.tab = 'lists'; render();
      setTimeout(function () { reveal(document.querySelector('input[data-chk$="|' + p[1] + '"]') || document.querySelector('details[data-fold^="' + p[0] + '_"]')); }, 120);
    }
  }, true);
  /* ---- styles ---- */
  var st = document.createElement('style');
  st.textContent = '#rail .brand{cursor:pointer}#tabs .x-sbtn{display:flex;align-items:center;justify-content:flex-start!important;gap:12px;background:none;border:0;border-radius:12px;padding:14px 12px;min-height:60px;font:600 16px var(--f-display,system-ui);letter-spacing:.06em;text-transform:uppercase;color:var(--ink,inherit);cursor:pointer;text-align:left}#tabs .x-sbtn .pct{display:none}' +
    '#head #x-subnav{margin-top:12px}#x-next{display:flex;align-items:center;flex-wrap:wrap;gap:6px 12px;width:100%;margin:0 0 14px;padding:12px 16px;border-radius:14px;border:1px solid var(--line,#2E2E34);background:var(--surface,#18181B);color:var(--ink,inherit);text-align:left;cursor:pointer;font:inherit}' +
    '#x-next .x-nk{font:700 11px system-ui,-apple-system,sans-serif;text-transform:uppercase;letter-spacing:.08em;color:#fff;background:var(--cherry,#8B1E1E);border-radius:999px;padding:4px 10px}#x-next b{font-size:17px;flex:1 1 220px}#x-next small{color:var(--muted,#A1A1AA);font-size:13px}#x-next em{font-style:normal;font-weight:700}#x-next em.late{color:var(--cherry,#E5484D)}' +
    '#x-next.late{border:2px solid var(--cherry,#E5484D)}#x-next.done{cursor:default}#x-next.done .x-nk{background:var(--good,#1F7A4D)}' +
    'body.x-merged #head .modesw .seg2,body.x-merged #head .modesw>.status{display:none!important}' +
    '#tabs .x-gbtn{position:relative}.x-dot{position:absolute;top:8px;left:30px;width:11px;height:11px;border-radius:50%;background:#E5484D;box-shadow:0 0 0 2px var(--surface,#18181B)}' +
    '.x-flash{animation:xfl 2s ease}@keyframes xfl{0%,40%{background:rgba(217,164,65,.35)}100%{background:transparent}}' +
    '#x-search{position:fixed;inset:0;z-index:1002;background:rgba(0,0,0,.7);display:flex;justify-content:center;align-items:flex-start;padding:calc(20px + env(safe-area-inset-top,0px)) 12px 12px}.xs-card{width:min(640px,100%);max-height:85vh;display:flex;flex-direction:column;background:var(--surface,#18181B);color:var(--ink,#EDEDF0);border:1px solid var(--line,#2E2E34);border-radius:18px;overflow:hidden}' +
    '.xs-top{display:flex;gap:8px;padding:12px;border-bottom:1px solid var(--line,#2E2E34)}.xs-top input{flex:1;min-height:52px;font-size:18px;padding:0 14px;border-radius:12px;border:1px solid var(--line,#2E2E34);background:var(--bg,#000);color:inherit;-webkit-appearance:none;appearance:none}.xs-top button{width:52px;border-radius:12px;border:1px solid var(--line,#2E2E34);background:var(--bg,#000);color:inherit;font-size:26px}' +
    '#xs-res{overflow:auto;padding:6px}#xs-res button{display:grid;grid-template-columns:auto 1fr;gap:0 10px;width:100%;text-align:left;padding:10px 10px;border:0;border-radius:10px;background:none;color:inherit;font:inherit;cursor:pointer}#xs-res button:hover{background:rgba(127,127,127,.12)}#xs-res b{font-size:16px}#xs-res small{grid-column:2;color:var(--muted,#A1A1AA);font-size:12.5px}' +
    '.xs-k{grid-row:span 2;align-self:center;font:700 10px system-ui,-apple-system,sans-serif;text-transform:uppercase;letter-spacing:.06em;padding:4px 8px;border-radius:6px;background:rgba(127,127,127,.18);min-width:62px;text-align:center}.xs-dish{background:rgba(229,72,77,.2)}.xs-drink{background:rgba(217,164,65,.25)}.xs-bottle{background:rgba(59,130,246,.22)}.xs-task{background:rgba(31,122,77,.25)}.xs-recipe{background:rgba(229,72,77,.2)}.xs-hint{color:var(--muted,#A1A1AA);padding:14px}' +
    '@media (max-width:640px){#tabs{position:fixed!important;left:0;right:0;bottom:0;z-index:950;display:flex!important;flex-direction:row!important;flex-wrap:nowrap!important;justify-content:space-around;background:var(--surface,#18181B);border-top:1px solid var(--line,#2E2E34);padding:6px 4px calc(6px + env(safe-area-inset-bottom,0px))!important;margin:0!important;box-shadow:0 -4px 16px rgba(0,0,0,.25)}' +
    '#tabs .x-gbtn,#tabs .x-sbtn{flex:1 1 0;min-width:0!important}#tabs .x-sbtn{flex-direction:column;gap:3px;font-size:10.5px;letter-spacing:.03em;padding:6px 8px;min-height:54px;justify-content:center}#tabs .x-sbtn .x-ic{width:26px;height:26px}#tabs>*:not(.x-gbtn):not(.x-sbtn){display:none!important}.x-dot{left:auto;right:calc(50% - 20px);top:4px}' +
    'main,.wrap{padding-bottom:calc(84px + env(safe-area-inset-bottom,0px))!important}#sync,#vo-fab,.x-online,[class*="orders-fab"]{bottom:calc(84px + env(safe-area-inset-bottom,0px))!important}' +
    '#x-subnav{overflow-x:auto;flex-wrap:nowrap!important;-webkit-overflow-scrolling:touch}#x-subnav button{flex:0 0 auto!important;min-width:68px!important}#x-next b{font-size:15px}}';
  document.head.appendChild(st);
  (function start() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || !document.getElementById('tabs') || !document.getElementById('view')) return setTimeout(start, 200);
    /* Wrap render after nav23.js has, so its buttons and page pills are drawn before these run. */
    if (!document.querySelector('#tabs .x-gbtn') && (start.n = (start.n || 0) + 1) < 50) return setTimeout(start, 200);
    if (B === 'foh' && typeof setWho === 'function') { var sw = setWho; setWho = function (name) { var had = whoName(); var out = sw.apply(this, arguments); if (name && name !== had) setTimeout(land, 60); return out; }; }
    var r0 = render; render = function () { var out = r0.apply(this, arguments); try { searchBtn(); } catch (e) {} try { mergeRow(); } catch (e) {} try { nextBar(); } catch (e) {} try { dots(); } catch (e) {} return out; };
    setInterval(function () { try { if (!document.getElementById('x-search') && !(document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) { nextBar(); dots(); } } catch (e) {} }, 60000);
    render();
    try { if (B === 'foh' && whoName() && !sessionStorage.getItem('vicio_landed')) { sessionStorage.setItem('vicio_landed', '1'); setTimeout(land, 300); } } catch (e) {}
  })();
})();
