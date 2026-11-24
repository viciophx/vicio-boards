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
      that filters every dish as you type. */
(function () {
  var B = window.VICIO_BOARD;
  if (window.__vicioNav23 || (B !== 'foh' && B !== 'kitchen')) return;
  window.__vicioNav23 = true;
  var GROUPS = B === 'foh'
    ? [['tonight', 'Tonight', ['today', 'lists', 'schedule']], ['guests', 'Guests', ['seating', 'events', 'reviews']], ['counts', 'Counts', ['inventory']], ['learn', 'Learn', ['menu', 'drinks', 'sop', 'training']]]
    : [['tonight', 'Tonight', ['today', 'logs', 'cleaning']], ['prep', 'Prep', ['prep', 'dough', 'calendar']], ['counts', 'Counts', ['inventory', 'prices']], ['recipes', 'Recipes', ['recipes', 'test', 'faq']], ['more', 'More', ['staff', 'todo']]];
  var ES = { Tonight: 'Esta noche', Guests: 'Clientes', Counts: 'Conteos', Learn: 'Aprender', Prep: 'Prep', Recipes: 'Recetas', More: 'M\u00e1s' };
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
      return '<button type="button" class="x-gbtn" data-tab="' + target + '"' + (g === cur ? ' aria-current="page"' : '') + '><span>' + esc(es() ? ES[g.name] || g.name : g.name) + '</span><span class="pct">' + esc(pct) + '</span></button>';
    }).join('');
    keep.forEach(function (c) { tabs.appendChild(c); });
    document.body.classList.toggle('x-quiet', cur.id !== 'tonight');
    var view = document.getElementById('view'), old = document.getElementById('x-subnav'); if (old) old.remove();
    if (view && cur.tabs.length > 1) view.insertAdjacentHTML('afterbegin', '<nav id="x-subnav" aria-label="' + esc(cur.name) + '">' + cur.tabs.map(function (id) { return '<button type="button" data-tab="' + id + '"' + (id === ui.tab ? ' aria-current="page"' : '') + '>' + esc(have[id].label) + (have[id].pct ? ' <small>' + esc(have[id].pct) + '</small>' : '') + '</button>'; }).join('') + '</nav>');
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
  st.textContent = '#tabs .x-gbtn{font-size:16px;padding:14px 12px;border-radius:12px;min-height:52px}#tabs .x-gbtn[aria-current="page"]{background:var(--cherry,#8B1E1E);color:#fff}#tabs .x-gbtn[aria-current="page"] .pct{color:#fff;opacity:.85}' +
    '#x-subnav{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px;padding:5px;border-radius:14px;border:1px solid var(--line,#2E2E34);background:var(--bg,transparent);width:fit-content;max-width:100%}' +
    '#x-subnav button{min-height:44px;padding:0 16px;border-radius:10px;border:0;background:none;color:var(--muted,#71717A);font:700 15px system-ui,-apple-system,sans-serif;cursor:pointer}#x-subnav button[aria-current="page"]{background:var(--surface-2,rgba(127,127,127,.18));color:var(--ink,inherit)}#x-subnav small{font-weight:500;opacity:.7}' +
    'body.x-quiet #head .modesw,body.x-quiet #head .shiftbar,body.x-quiet #head .x-iceswitch{display:none!important}' +
    '.x-mbar{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px}.x-mbar input{flex:1 1 260px;min-height:48px;font-size:16px;padding:0 14px;border-radius:10px;border:1px solid var(--line,#2E2E34);background:var(--bg,#000);color:var(--ink,#EDEDF0);-webkit-appearance:none;appearance:none}.x-mbar .btn{min-height:48px}' +
    '@media (max-width:640px){#tabs .x-gbtn{font-size:13px;padding:10px 9px;min-height:44px}#tabs .x-gbtn .pct{display:none}#head .x-hrow{display:block}#head .x-hc2{margin-top:8px;max-width:100%;overflow-x:auto}#x-subnav{width:100%}#x-subnav button{flex:1 1 auto;padding:0 10px}}' +
    (B === 'kitchen' ? '.app{align-content:start}#rail{align-self:start}' : '');
  document.head.appendChild(st);
  (function start() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || !document.getElementById('tabs') || !document.getElementById('view')) return setTimeout(start, 200);
    var r0 = render; render = function () { var out = r0.apply(this, arguments); try { nav(); } catch (e) {} try { menu(); } catch (e) {} return out; };
    try { nav(); menu(); } catch (e) {}
  })();
})();
