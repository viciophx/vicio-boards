/* Vicio board add-ons, loaded by sheetdb.js on the GitHub boards and inlined into Colette's Board.
   Kitchen: an 86 card at the top of Today, on the same shared 86 list as the FOH board (e86/board). */
(function () {
  if (window.VICIO_BOARD !== 'kitchen' || window.__vicioExtras) return;
  window.__vicioExtras = true;
  function ready() { return typeof VIEWS !== 'undefined' && typeof render === 'function' && typeof save === 'function' && typeof S !== 'undefined'; }
  function list() {
    var items = (S.e86 && S.e86.items) || {};
    return Object.keys(items).map(function (id) { var x = items[id]; return x && x.name ? Object.assign({ id: id }, x) : null; })
      .filter(Boolean).sort(function (a, b) { return (a.at || 0) - (b.at || 0); });
  }
  function card() {
    var out = list();
    var rows = out.map(function (x) {
      var when = x.at ? new Date(x.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
      return '<li style="display:flex;align-items:center;gap:10px;padding:8px 0"><span style="flex:1;min-width:0"><b>' + esc(x.name) + '</b>' +
        (x.note ? ' <span class="muted">' + esc(x.note) + '</span>' : '') +
        '<small style="display:block;color:var(--muted)">' + esc([x.by, when].filter(Boolean).join(', ')) + '</small></span>' +
        '<button type="button" class="btn x" data-x86="back" data-id="' + esc(x.id) + '">Back in</button></li>';
    }).join('');
    return '<section class="card' + (out.length ? ' edge' : '') + '"><div class="cardhead"><h3>86 board</h3><span class="count">' +
      (out.length ? out.length + ' out' : 'Nothing out') + '</span></div>' +
      (out.length ? '<ul class="checks plist">' + rows + '</ul>' : '<p class="status">When the kitchen or the bar runs out of something, put it here. The FOH board and Colette see it right away.</p>') +
      '<div class="padd"><input type="text" id="x86-name" placeholder="What\u2019s out" autocomplete="off" autocorrect="off">' +
      '<input type="text" id="x86-note" placeholder="Until when, or why" autocomplete="off" style="flex:1 1 120px;width:auto">' +
      '<button type="button" class="btn primary" data-x86="add">86 it</button></div></section>';
  }
  function add() {
    var n = document.getElementById('x86-name'), t = document.getElementById('x86-note');
    var name = ((n && n.value) || '').trim(); if (!name) { if (n) n.focus(); return; }
    var id = typeof newId === 'function' ? newId() : 'k' + Date.now().toString(36);
    var item = { name: name, note: ((t && t.value) || '').trim(), by: (typeof ui !== 'undefined' && ui.by) || 'Kitchen', at: Date.now() };
    var items = Object.assign({}, (S.e86 && S.e86.items) || {}); items[id] = item;
    S.e86 = Object.assign({}, S.e86, { items: items });
    var p = {}; p[id] = item; save('e86/board', { items: p });
    if (n) n.value = ''; if (t) t.value = '';
    if (document.activeElement) document.activeElement.blur();
    render();
  }
  function back(id) {
    var items = Object.assign({}, (S.e86 && S.e86.items) || {}); delete items[id];
    S.e86 = Object.assign({}, S.e86, { items: items });
    var p = {}; p[id] = null; save('e86/board', { items: p });
    render();
  }
  function start() {
    if (!ready()) return setTimeout(start, 200);
    S.e86 = S.e86 || {};
    var today = VIEWS.today;
    VIEWS.today = function () { return card() + today(); };
    (function watch() {
      if (typeof db === 'undefined' || !db) return setTimeout(watch, 300);
      watchDoc('e86/board', function (d) { S.e86 = d || {}; render(); });
    })();
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-x86]'); if (!b) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (b.dataset.x86 === 'add') add(); else if (b.dataset.x86 === 'back') back(b.dataset.id);
    }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target && (e.target.id === 'x86-name' || e.target.id === 'x86-note')) { e.preventDefault(); add(); }
    });
    render();
  }
  start();
})();
