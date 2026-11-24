/* Vicio boards: calmer navigation and a simpler Menu page (Eric, Nov 23 2026). Loaded by config.js; both boards.
   Eric: "the FOH and BOH menus feel chaotic". Three changes, all drawn on top of the board's own pages:
   1. Four or five big buttons by job instead of ten or eleven tabs. The pages inside each one show as a short row of pills
      at the top of the page, and each button remembers the page you last used in it.
        FOH   Tonight (Today, Checklists, Schedule) · Guests (Reservations, Catering & Events, Reviews) · Counts (Inventory)
              · Learn (Menu, Drinks, Media, Training)
        BOH   Tonight (Today, Logs, Cleaning) · Prep (Prep List, Dough Schedule, Calendar) · Counts (Inventory, Prices)
              · Recipes (Recipes, Training, FAQ) · More (Staff and anything else)
      Any tab not listed lands under the last button, so nothing can go missing.
   2. A quiet header: the mode buttons (Checklists / Host / Expo / Bartender / Training on FOH; Open / Prep / Service / Dough
      on BOH), the ice machine switch and the opening / mid shift / closing bars only show under Tonight, where they matter.
   3. FOH Menu page: food only (the drink sections live on the Drinks page, with a button to get there) and a search box
      that filters every dish as you type.
   Icons (Eric: "since this is iPads and phones can we go more icon based"): every big button and every page pill carries
   an icon. On the iPad the big buttons are a large icon with the word beside it; on a phone they become an icon with a small
   word under it, sized to fit four or five across. */
(function () {
  var B = window.VICIO_BOARD;
  if (window.__vicioNav23 || (B !== 'foh' && B !== 'kitchen')) return;
  window.__vicioNav23 = true;
  var GROUPS = B === 'foh'
    ? [['tonight', 'Tonight', ['today', 'lists', 'schedule']], ['guests', 'Guests', ['seating', 'events', 'reviews']], ['counts', 'Counts', ['inventory']], ['learn', 'Learn', ['menu', 'drinks', 'sop', 'training']]]
    : [['tonight', 'Tonight', ['today', 'logs', 'cleaning']], ['prep', 'Prep', ['prep', 'dough', 'calendar']], ['counts', 'Counts', ['inventory', 'prices']], ['recipes', 'Recipes', ['recipes', 'test', 'faq']], ['more', 'More', ['staff', 'todo']]];
  var ES = { Tonight: 'Esta noche', Guests: 'Clientes', Counts: 'Conteos', Learn: 'Aprender', Prep: 'Prep', Recipes: 'Recetas', More: 'M\u00e1s' };
  var P = {
    tonight: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    guests: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><circle cx="17" cy="9" r="2.4"/><path d="M16.5 14.6c2.6.2 4.5 2 4.5 4.9"/>',
    counts: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
    learn: '<path d="M12 6c-2-1.3-4.5-2-8-2v14c3.5 0 6 .7 8 2 2-1.3 4.5-2 8-2V4c-3.5 0-6 .7-8 2zM12 6v14"/>',
    prep: '<path d="M4 20l9-9M13 11l6-6c1 3 0 6-2.5 8.500L13 11zM4 20l3 .5.5-3"/>',
    recipes: '<path d="M6 3h11a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1zM5 18a2 2 0 0 1 2-2h12M9 7h6M9 11h4"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.500M12 19.500V22M2 12h2.500M19.5 12H22M5 5l1.8 1.800M17.2 17.200L19 19M5 19l1.8-1.800M17.2 6.800L19 5"/>',
    lists: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12.500l2.8 2.800L16 9.5"/>',
    schedule: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>',
    seating: '<path d="M5 11V7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4M3 13a2 2 0 0 1 4 0v3h10v-3a2 2 0 0 1 4 0v5H3zM6 18v2.500M18 18v2.5"/>',
    events: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.500l1.2-6L3.3 9.300l6.1-.700z"/>',
    reviews: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8.5 9.500h7M8.5 12.500h4"/>',
    inventory: '<path d="M3 8l9-4 9 4-9 4zM3 8v8l9 4 9-4V8M12 12v8"/>',
    menu: '<path d="M12 3l9 17H3zM10 12h.01M13.5 15.500h.01M11 17h.01"/>',
    drinks: '<path d="M5 4h14l-7 8zM12 12v7M8 20h8"/>',
    sop: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/>',
    training: '<path d="M2 9l10-5 10 5-10 5zM6 11.500V16c1.5 1.5 3.5 2.2 6 2.200s4.5-.7 6-2.200v-4.500M22 9v6"/>',
    test: '<path d="M2 9l10-5 10 5-10 5zM6 11.500V16c1.5 1.5 3.5 2.2 6 2.200s4.5-.7 6-2.200v-4.500M22 9v6"/>',
    logs: '<path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0zM12 9v7"/>',
    cleaning: '<path d="M9 3l1.5 4.500L15 9l-4.5 1.500L9 15l-1.5-4.500L3 9l4.5-1.500zM17.5 13l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.900z"/>',
    dough: '<circle cx="12" cy="12" r="8"/><path d="M8.5 10.500c1-2 3.5-3 5.5-2"/>',
    calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>',
    prices: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.4"/>',
    faq: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.500a2.5 2.5 0 1 1 3.5 2.300c-.7.4-1 .9-1 1.700M12 17h.01"/>',
    staff: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>',
    todo: '<path d="M4 6h10M4 12h10M4 18h6M17 16l2 2 3-4"/>'
  };
  function ico(k) { return P[k] ? '<svg class="x-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[k] + '</svg>' : ''; }
  var LAST = {}; try { LAST = JSON.parse(localStorage.getItem('vicio_nav_' + B) || '{}') || {}; } catch (e) {}
  var DRINKS = /^(featured cocktail|cocktails|margaritas|shots|mocktails|beer|no alcohol|wine|seltzers?)$/i, Q = '';
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function es() { try { return (B === 'foh' ? ui.lang : (typeof lang === 'function' ? lang() : ui.lang)) === 'es'; } catch (e) { return false; } }
  function nav() {
    var tabs = document.getElementById('tabs'); if (!tabs || tabs.querySelector('.x-gbtn')) return;
    var have = {}, order = [];
    Array.prototype.forEach.call(tabs.querySelectorAll('button[data-tab]'), function (b) { var s = b.querySelectorAll('span'); have[b.dataset.tab] = { label: (s[0] || b).textContent.trim(), pct: s[1] ? s[1].textContent.trim() : '' }; order.push(b.dataset.tab); });
    if (!order.length) return;
    var used = {}, groups = GROUPS.map(function (g) { var t = g[2].filter(function (id) { return have[id]; }); t.forEach(function (id) { used[id] = 1; }); return { id: g[0], name: g[1], tabs: t }; });
    var rest = order.filter(function (id) { return !used[id]; }); if (rest.length) groups[groups.length - 1].tabs = groups[groups.length - 1].tabs.concat(rest);
    groups = groups.filter(function (g) { return g.tabs.length; });
    var cur = groups.filter(function (g) { return g.tabs.indexOf(ui.tab) >= 0; })[0] || groups[0];
    if (cur.tabs.indexOf(ui.tab) >= 0 && LAST[cur.id] !== ui.tab) { LAST[cur.id] = ui.tab; try { localStorage.setItem('vicio_nav_' + B, JSON.stringify(LAST)); } catch (e) {} }
    var keep = Array.prototype.filter.call(tabs.children, function (c) { return !(c.matches && c.matches('button[data-tab]')); });
    tabs.innerHTML = groups.map(function (g) {
      var target = g.tabs.indexOf(LAST[g.id]) >= 0 ? LAST[g.id] : g.tabs[0], pct = g.tabs.map(function (id) { return have[id].pct; }).filter(Boolean)[0] || '';
      return '<button type="button" class="x-gbtn" data-tab="' + target + '"' + (g === cur ? ' aria-current="page"' : '') + '>' + ico(g.id) + '<span>' + esc(es() ? ES[g.name] || g.name : g.name) + '</span><span class="pct">' + esc(pct) + '</span></button>';
    }).join('');
    keep.forEach(function (c) { tabs.appendChild(c); });
    document.body.classList.toggle('x-quiet', cur.id !== 'tonight');
    var view = document.getElementById('view'), old = document.getElementById('x-subnav'); if (old) old.remove();
    if (view && cur.tabs.length > 1) view.insertAdjacentHTML('afterbegin', '<nav id="x-subnav" aria-label="' + esc(cur.name) + '">' + cur.tabs.map(function (id) { return '<button type="button" data-tab="' + id + '"' + (id === ui.tab ? ' aria-current="page"' : '') + '>' + ico(id) + '<span>' + esc(have[id].label) + '</span>' + (have[id].pct ? ' <small>' + esc(have[id].pct) + '</small>' : '') + '</button>'; }).join('') + '</nav>');
  }
  function menu() {
    if (B !== 'foh' || ui.tab !== 'menu') return;
    var book = document.querySelector('#view .pbook'); if (!book) return;
    var hid = 0;
    Array.prototype.forEach.call(book.querySelectorAll('details[data-fold^="pg:Menu:"]'), function (d) {
      var n = (d.querySelector('.cn') || {}).textContent || '';
      if (DRINKS.test(n.trim())) { d.style.display = 'none'; hid++; return; }
      var q = Q.trim().toLowerCase(), any = false;
      Array.prototype.forEach.call(d.querySelectorAll('.pitem'), function (b) { var hit = !q || b.textContent.toLowerCase().indexOf(q) >= 0; b.style.display = hit ? '' : 'none'; if (hit) any = true; });
      d.style.display = any ? '' : 'none'; if (q && any) d.open = true;
    });
    if (!document.getElementById('x-msearch')) {
      book.insertAdjacentHTML('beforebegin', '<div class="x-mbar"><input type="search" id="x-msearch" placeholder="Search the menu: a dish or an ingredient" autocomplete="off" aria-label="Search the menu" value="' + esc(Q) + '">' + (hid ? '<button type="button" class="btn" data-tab="drinks">Drinks are on the Drinks page</button>' : '') + '</div>');
    }
  }
  document.addEventListener('input', function (e) { if (e.target && e.target.id === 'x-msearch') { Q = e.target.value; menu(); } }, true);
  var st = document.createElement('style');
  st.textContent = '.x-ic{width:28px;height:28px;flex:none}#tabs .x-gbtn{justify-content:flex-start;gap:12px}#tabs .x-gbtn .pct{margin-left:auto}#x-subnav button{display:inline-flex;align-items:center;gap:8px}#x-subnav .x-ic{width:22px;height:22px}' +
    '#tabs .x-gbtn{font-size:16px;padding:14px 12px;border-radius:12px;min-height:60px}#tabs .x-gbtn[aria-current="page"]{background:var(--cherry,#8B1E1E);color:#fff}#tabs .x-gbtn[aria-current="page"] .pct{color:#fff;opacity:.85}' +
    '#x-subnav{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px;padding:5px;border-radius:14px;border:1px solid var(--line,#2E2E34);background:var(--bg,transparent);width:fit-content;max-width:100%}' +
    '#x-subnav button{min-height:44px;padding:0 16px;border-radius:10px;border:0;background:none;color:var(--muted,#71717A);font:700 15px system-ui,-apple-system,sans-serif;cursor:pointer}#x-subnav button[aria-current="page"]{background:var(--surface-2,rgba(127,127,127,.18));color:var(--ink,inherit)}#x-subnav small{font-weight:500;opacity:.7}' +
    'body.x-quiet #head .modesw,body.x-quiet #head .shiftbar,body.x-quiet #head .x-iceswitch{display:none!important}' +
    '.x-mbar{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px}.x-mbar input{flex:1 1 260px;min-height:48px;font-size:16px;padding:0 14px;border-radius:10px;border:1px solid var(--line,#2E2E34);background:var(--bg,#000);color:var(--ink,#EDEDF0);-webkit-appearance:none;appearance:none}.x-mbar .btn{min-height:48px}' +
    '@media (max-width:640px){#tabs{flex:1 1 auto;justify-content:space-around}#tabs .x-gbtn{flex-direction:column;gap:3px;font-size:10.5px;letter-spacing:.03em;padding:6px 8px;min-height:54px;min-width:58px;justify-content:center}#tabs .x-gbtn .x-ic{width:26px;height:26px}#tabs .x-gbtn .pct{display:none}#x-subnav .x-ic{width:20px;height:20px}#head .x-hrow{display:block}#head .x-hc2{margin-top:8px;max-width:100%;overflow-x:auto}#x-subnav{width:100%;flex-wrap:nowrap}#x-subnav button{flex:1 1 0;min-width:0;flex-direction:column;gap:2px;font-size:11.5px;min-height:54px;padding:6px 2px}#x-subnav small{display:none}}' +
    (B === 'kitchen' ? '.app{align-content:start}#rail{align-self:start}' : '');
  document.head.appendChild(st);
  (function start() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || !document.getElementById('tabs') || !document.getElementById('view')) return setTimeout(start, 200);
    var r0 = render; render = function () { var out = r0.apply(this, arguments); try { nav(); } catch (e) {} try { menu(); } catch (e) {} return out; };
    try { nav(); menu(); } catch (e) {}
  })();
})();
