/* Vicio board add-ons, loaded by sheetdb.js on the GitHub boards and inlined into Colette's Board.
   Kitchen: sign in by name at the top of Today (the name goes on every check and log), bylines on checked items,
   and an 86 card on the same shared 86 list as the FOH board (e86/board). Both boards: Spanish for the new text. */
(function () {
  if (window.__vicioExtras) return;
  window.__vicioExtras = true;
  var BOARD = window.VICIO_BOARD;

  /* Spanish for text added outside the boards' own dictionaries. Each board's translateDom swaps exact text nodes. */
  var ES_MORE = {
    '86 board': 'Pizarra de 86', 'Nothing out': 'Nada agotado', 'out': 'agotados', '86 it': 'Ponerlo en 86', 'Back in': 'Ya hay',
    'When the kitchen or the bar runs out of something, put it here. The FOH board and Colette see it right away.': 'Cuando a la cocina o a la barra se le acabe algo, anótalo aquí. La pizarra de FOH y Colette lo ven al instante.',
    'On this phone': 'En este teléfono', 'Not me': 'No soy yo', 'Who is checking tonight?': '¿Quién está marcando esta noche?',
    'Tap your name so your checks and logs carry it.': 'Toca tu nombre para que tus marcas y registros lo lleven.', 'Sign in': 'Entrar',
    'Shared live with the team': 'Compartido en vivo con el equipo', 'Shared across devices': 'Compartido entre dispositivos',
    'Shifts come from': 'Los turnos vienen de', 'the Vicio Schedule sheet': 'la hoja Vicio Schedule',
    'Open this page in claude.ai with Google Drive connected to read the schedule sheet.': 'Abre esta página en claude.ai con Google Drive conectado para leer la hoja de turnos.',
    'Allow Google Drive for this page to read the schedule sheet.': 'Permite Google Drive en esta página para leer la hoja de turnos.',
    'Connect Google Drive in Settings, Connectors, to read the schedule sheet.': 'Conecta Google Drive en Ajustes, Conectores, para leer la hoja de turnos.',
    'Could not read the schedule sheet.': 'No se pudo leer la hoja de turnos.', 'The sheet came back empty.': 'La hoja llegó vacía.',
    'Shift mode': 'Modo turno', 'Exit shift mode': 'Salir del modo turno', 'Meatballs': 'Albóndigas',
    'Build, bottom layer first': 'Armado, de abajo hacia arriba', 'Ingredients': 'Ingredientes', 'Portions and spec': 'Porciones y especificación', 'Procedure': 'Procedimiento', 'Critical rules': 'Reglas críticas', 'Allergens': 'Alérgenos', 'Notes': 'Notas', 'Mods': 'Modificaciones', 'Food cost': 'Costo de alimentos'
  };
  if (typeof ES === 'object' && ES) Object.keys(ES_MORE).forEach(function (k) { if (ES[k] == null) ES[k] = ES_MORE[k]; });
  if (BOARD !== 'kitchen') return;
  document.title = 'Vicio BOH';

  function ready() { return typeof VIEWS !== 'undefined' && typeof render === 'function' && typeof save === 'function' && typeof S !== 'undefined' && typeof ui !== 'undefined'; }
  function es() { return typeof lang === 'function' ? lang() === 'es' : false; }
  function t(en, esx) { return es() ? esx : en; }
  function who() { return (ui.by || '').trim(); }
  function setWho(n) { ui.by = (n || '').trim(); try { if (ui.by) localStorage.setItem('vicio_by', ui.by); else localStorage.removeItem('vicio_by'); } catch (e) {} render(); }


  /* Recipe cards from recipes.js go into their group on the Recipes page; esx holds the Spanish card. */
  function addRecipes() {
    if (typeof BOOK === 'undefined' || !Array.isArray(BOOK)) return;
    (window.VICIO_RECIPES || []).forEach(function (pair) {
      var g = BOOK.find(function (x) { return x.name === pair[0]; }) || BOOK[0];
      if (!BOOK.some(function (x) { return x.items.some(function (i) { return i.id === pair[1].id; }); })) g.items.push(pair[1]);
    });
    if (typeof recDetail === 'function' && !recDetail.__esx) {
      var rd0 = recDetail;
      recDetail = function (x) { return rd0(x && x.esx && es() ? Object.assign({}, x, x.esx) : x); };
      recDetail.__esx = true;
    }
    if (typeof render === 'function' && ui.tab === 'recipes') render();
  }
  window.__vicioAddRecipes = addRecipes;
  /* recipes.js lives beside this file on GitHub; on Colette's Board it is inlined, so the load is skipped there. */
  if (!window.VICIO_RECIPES && !window.__vicioInline) { try { var rs = document.createElement('script'); rs.src = 'recipes.js?v=1'; document.head.appendChild(rs); } catch (e) {} }

  /* Sign in: pick a name from the roster, kitchen first, or type one. Kept on this device until "Not me". */
  function signin() {
    if (who()) return '<section class="card x-signin"><div class="cardhead"><h3>On this phone</h3><span class="count"><b>' + esc(who()) + '</b></span></div>' +
      '<div class="padd"><button type="button" class="btn x" data-xwho="out">Not me</button></div></section>';
    var ppl = typeof stPeople === 'function' ? stPeople() : [];
    ppl = ppl.filter(function (p) { return p.group === 'Kitchen'; }).concat(ppl.filter(function (p) { return p.group !== 'Kitchen'; }));
    return '<section class="card edge x-signin"><div class="cardhead"><h3>Who is checking tonight?</h3></div>' +
      '<p class="status">Tap your name so your checks and logs carry it.</p>' +
      '<div class="chips">' + ppl.map(function (p) { return '<button type="button" class="btn" data-xwho="pick" data-name="' + esc(p.name) + '">' + esc(first(p.name)) + '</button>'; }).join('') + '</div>' +
      '<div class="padd"><input type="text" id="xwho-txt" placeholder="' + t('Someone else', 'Otra persona') + '" autocomplete="off" autocapitalize="words">' +
      '<button type="button" class="btn primary" data-xwho="in">Sign in</button></div></section>';
  }

  /* 86 board, shared with FOH. */
  function list() {
    var items = (S.e86 && S.e86.items) || {};
    return Object.keys(items).map(function (id) { var x = items[id]; return x && x.name ? Object.assign({ id: id }, x) : null; })
      .filter(Boolean).sort(function (a, b) { return (a.at || 0) - (b.at || 0); });
  }
  function card() {
    var out = list();
    var rows = out.map(function (x) {
      var when = x.at ? new Date(x.at).toLocaleTimeString(es() ? 'es-MX' : 'en-US', { hour: 'numeric', minute: '2-digit' }) : '';
      return '<li style="display:flex;align-items:center;gap:10px;padding:8px 0"><span style="flex:1;min-width:0"><b>' + esc(x.name) + '</b>' +
        (x.note ? ' <span class="muted">' + esc(x.note) + '</span>' : '') +
        '<small style="display:block;color:var(--muted)">' + esc([x.by, when].filter(Boolean).join(', ')) + '</small></span>' +
        '<button type="button" class="btn x" data-x86="back" data-id="' + esc(x.id) + '">Back in</button></li>';
    }).join('');
    return '<section class="card' + (out.length ? ' edge' : '') + '"><div class="cardhead"><h3>86 board</h3><span class="count">' +
      (out.length ? out.length + ' ' + t('out', 'agotados') : t('Nothing out', 'Nada agotado')) + '</span></div>' +
      (out.length ? '<ul class="checks plist">' + rows + '</ul>' : '<p class="status">When the kitchen or the bar runs out of something, put it here. The FOH board and Colette see it right away.</p>') +
      '<div class="padd"><input type="text" id="x86-name" placeholder="' + t('What\u2019s out', 'Qué se acabó') + '" autocomplete="off" autocorrect="off">' +
      '<input type="text" id="x86-note" placeholder="' + t('Until when, or why', 'Hasta cuándo, o por qué') + '" autocomplete="off" style="flex:1 1 120px;width:auto">' +
      '<button type="button" class="btn primary" data-x86="add">86 it</button></div></section>';
  }
  function add() {
    var n = document.getElementById('x86-name'), tn = document.getElementById('x86-note');
    var name = ((n && n.value) || '').trim(); if (!name) { if (n) n.focus(); return; }
    var id = typeof newId === 'function' ? newId() : 'k' + Date.now().toString(36);
    var item = { name: name, note: ((tn && tn.value) || '').trim(), by: who() || 'BOH', at: Date.now() };
    var items = Object.assign({}, (S.e86 && S.e86.items) || {}); items[id] = item;
    S.e86 = Object.assign({}, S.e86, { items: items });
    var p = {}; p[id] = item; save('e86/board', { items: p });
    if (n) n.value = ''; if (tn) tn.value = '';
    if (document.activeElement) document.activeElement.blur();
    render();
  }
  function back(id) {
    var items = Object.assign({}, (S.e86 && S.e86.items) || {}); delete items[id];
    S.e86 = Object.assign({}, S.e86, { items: items });
    var p = {}; p[id] = null; save('e86/board', { items: p });
    render();
  }

  /* Bylines: after each render, show who ticked each shift item, from the shift's by map. */
  function annotate() {
    var by = (S.shift && S.shift.by) || {};
    document.querySelectorAll('input[data-chk^="shifts/"]:checked').forEach(function (inp) {
      var id = inp.dataset.chk.split('|')[1], lab = inp.closest('label'); if (!lab || !by[id] || lab.querySelector('.x-by')) return;
      var sm = document.createElement('small'); sm.className = 'x-by'; sm.textContent = first(by[id]);
      (lab.querySelector('span') || lab).appendChild(sm);
    });
  }

  function start() {
    if (!ready()) return setTimeout(start, 200);
    addRecipes();
    var st = document.createElement('style');
    st.textContent = '.x-by{display:inline-block;margin-left:8px;padding:1px 7px;border-radius:999px;background:var(--cherry-soft,rgba(139,30,30,.12));color:var(--cherry,#8B1E1E);font:600 11px var(--f-body,system-ui)}.x-signin .chips .btn{min-height:44px;font-size:16px}';
    document.head.appendChild(st);
    S.e86 = S.e86 || {};
    var today = VIEWS.today;
    VIEWS.today = function () { return signin() + card() + today(); };
    var r0 = render;
    render = function () { r0.apply(this, arguments); try { annotate(); } catch (e) {} };
    (function watch() {
      if (typeof db === 'undefined' || !db) return setTimeout(watch, 300);
      watchDoc('e86/board', function (d) { S.e86 = d || {}; render(); });
    })();
    /* The name rides along with every shift check, next to the tracker's own done flag. */
    document.addEventListener('change', function (e) {
      var inp = e.target; if (!inp || !inp.dataset || !inp.dataset.chk) return;
      var parts = inp.dataset.chk.split('|'), path = parts[0], id = parts[1];
      if (path.indexOf('shifts/') !== 0) return;
      var nm = who(); if (!nm && inp.checked) return;
      var by = {}; by[id] = inp.checked ? nm : null; save(path, { by: by });
      if (S.shift) { S.shift.by = Object.assign({}, S.shift.by || {}, by); }
    }, true);
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-x86],[data-xwho]'); if (!b) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (b.dataset.x86 === 'add') add(); else if (b.dataset.x86 === 'back') back(b.dataset.id);
      else if (b.dataset.xwho === 'pick') setWho(b.dataset.name);
      else if (b.dataset.xwho === 'out') setWho('');
      else if (b.dataset.xwho === 'in') { var x = document.getElementById('xwho-txt'); if (!x || !x.value.trim()) { if (x) x.focus(); return; } setWho(x.value); }
    }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || !e.target) return;
      if (e.target.id === 'x86-name' || e.target.id === 'x86-note') { e.preventDefault(); add(); }
      if (e.target.id === 'xwho-txt') { e.preventDefault(); setWho(e.target.value); }
    });
    render();
  }
  start();
})();
