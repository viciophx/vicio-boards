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
    'Build, bottom layer first': 'Armado, de abajo hacia arriba', 'Ingredients': 'Ingredientes', 'Portions and spec': 'Porciones y especificación', 'Procedure': 'Procedimiento', 'Critical rules': 'Reglas críticas', 'Allergens': 'Alérgenos', 'Notes': 'Notas', 'Mods': 'Modificaciones', 'Food cost': 'Costo de alimentos', 'Extra prep': 'Prep extra', 'Recipe': 'Receta'
  };
  if (typeof ES === 'object' && ES) Object.keys(ES_MORE).forEach(function (k) { if (ES[k] == null) ES[k] = ES_MORE[k]; });
  /* Schedule: the Shifts tab also carries Céntrico shifts. These boards show only Vicio shifts (location Vicio, or Vicio in the role). */
  (function vicioOnly() {
    if (typeof sheetShifts !== 'function' || typeof mergeShifts !== 'function' || typeof S === 'undefined' || typeof render !== 'function') return setTimeout(vicioOnly, 200);
    if (sheetShifts.__vicio) return;
    var ss0 = sheetShifts;
    sheetShifts = function (csv) {
      var all = ss0(csv), out = {};
      Object.keys(all).forEach(function (id) { var x = all[id]; if (x && (x.org === 'Vicio' || /vicio/i.test(x.role || ''))) out[id] = x; });
      return out;
    };
    sheetShifts.__vicio = true;
    if (S.sheetCsv) { S.sheet = sheetShifts(S.sheetCsv); mergeShifts(); render(); }
  })();
  if (BOARD !== 'kitchen') return;
  document.title = 'Vicio BOH';

  function ready() { return typeof VIEWS !== 'undefined' && typeof render === 'function' && typeof save === 'function' && typeof S !== 'undefined' && typeof ui !== 'undefined'; }
  function es() { return typeof lang === 'function' ? lang() === 'es' : false; }
  function t(en, esx) { return es() ? esx : en; }
  function who() { return (ui.by || '').trim(); }
  /* Saves a tap straight to the store, without waiting behind earlier taps, so each one is protected on screen at once. */
  function quick(path, patch) {
    if (typeof db === 'undefined' || !db || !db.doc) return save(path, patch);
    if (typeof setStatus === 'function') setStatus('Saving');
    return db.doc(path).update(patch).then(function () { if (typeof setStatus === 'function') setStatus('Saved', 'ok'); },
      function () { if (typeof setStatus === 'function') setStatus('Not saved. Check your access and try again.', 'bad'); });
  }
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

  /* Extra prep. A menu of standard items sits at the bottom of the Prep list; tapping one puts it on today's list at the top.
     Stored at prepextra/board as {items:{id:{name, by, at, done:{date:true}}}, days:{date:{id:true}}}, shared by every BOH phone and Colette.
     Anyone can add from the menu or take an item off today; adding a brand new item to the menu, or removing one, is for managers. */
  function xpItems() {
    var it = (S.xprep && S.xprep.items) || {};
    return Object.keys(it).map(function (id) { var x = it[id]; return x && x.name ? Object.assign({ id: id }, x) : null; })
      .filter(Boolean).sort(function (a, b) { return (a.at || 0) - (b.at || 0); });
  }
  function xpDay() { return ui.prepDate || (typeof iso === 'function' ? iso(new Date()) : ''); }
  function xpToday() { var d = xpDay(); return ((S.xprep && S.xprep.days) || {})[d] || {}; }
  function xpEd() { return typeof isEditor === 'function' ? isEditor() : true; }
  function xpRecipe(name) {
    if (typeof BOOK === 'undefined') return null;
    return BOOK.flatMap(function (g) { return g.items; }).find(function (r) { return r.name.toLowerCase() === name.toLowerCase(); }) || null;
  }
  function xpCard() {
    var d = xpDay(), on = xpToday(), items = xpItems().filter(function (x) { return on[x.id]; });
    if (!items.length) return '';
    var nDone = items.filter(function (x) { return x.done && x.done[d]; }).length;
    var rows = items.map(function (x) {
      var rec = xpRecipe(x.name);
      return '<li><label><input type="checkbox" data-xprep="' + esc(x.id) + '"' + (x.done && x.done[d] ? ' checked' : '') + '><span><b>' + esc(x.name) + '</b></span></label>' +
        '<span class="pneed">' + t('Extra', 'Extra') + '</span>' +
        (rec ? '<button type="button" class="btn x" data-act="recipe" data-id="' + esc(rec.id) + '">' + t('Recipe', 'Receta') + '</button>' : '') +
        '<button type="button" class="btn x" data-xprep-off="' + esc(x.id) + '" aria-label="' + t('Take off today', 'Quitar de hoy') + '">\u00d7</button></li>';
    }).join('');
    return '<section class="card edge x-prep"><div class="cardhead"><h3>Extra prep</h3><span class="count">' + nDone + ' ' + t('of', 'de') + ' ' + items.length + '</span></div>' +
      '<ul class="checks plist">' + rows + '</ul></section>';
  }
  function xpMenu() {
    var on = xpToday(), ed = xpEd(), rest = xpItems().filter(function (x) { return !on[x.id]; });
    var chips = rest.map(function (x) {
      return '<span style="display:inline-flex;align-items:center;gap:2px"><button type="button" class="btn" data-xprep-on="' + esc(x.id) + '">' + esc(x.name) + '</button>' +
        (ed && ui.xpEdit ? '<button type="button" class="btn x" data-xprep-del="' + esc(x.id) + '" aria-label="' + t('Remove from menu', 'Quitar del men\u00fa') + '">\u00d7</button>' : '') + '</span>';
    }).join('');
    return '<section class="card x-prep-menu"><div class="cardhead"><h3>' + t('Add extra prep', 'Agregar prep extra') + '</h3><span class="count">' + (rest.length ? rest.length + ' ' + t('in the menu', 'en el men\u00fa') : t('All on the list', 'Todo en la lista')) + '</span></div>' +
      '<p class="status">' + t('Tap an item to put it on today\u2019s list.', 'Toca un art\u00edculo para ponerlo en la lista de hoy.') + '</p>' +
      (chips ? '<div class="chips">' + chips + '</div>' : '') +
      (ed ? '<div class="padd" style="margin-top:10px"><input type="text" id="xprep-name" placeholder="' + t('New menu item', 'Nuevo art\u00edculo del men\u00fa') + '" autocomplete="off" autocapitalize="sentences">' +
        '<button type="button" class="btn primary" data-xprep-add="1">' + t('Add to menu', 'Agregar al men\u00fa') + '</button>' +
        '<button type="button" class="btn" data-xprep-edit="1">' + (ui.xpEdit ? t('Done editing', 'Listo') : t('Edit menu', 'Editar men\u00fa')) + '</button></div>' : '') + '</section>';
  }
  function xpPatch(p) { S.xprep = S.xprep || {}; save('prepextra/board', p); render(); }
  function xpAdd() {
    var n = document.getElementById('xprep-name'), name = ((n && n.value) || '').trim(); if (!name) { if (n) n.focus(); return; }
    var id = typeof newId === 'function' ? newId() : 'k' + Date.now().toString(36), d = xpDay();
    var item = { name: name, by: who() || 'BOH', at: Date.now() };
    S.xprep.items = Object.assign({}, S.xprep.items); S.xprep.items[id] = item;
    S.xprep.days = Object.assign({}, S.xprep.days); S.xprep.days[d] = Object.assign({}, S.xprep.days[d]); S.xprep.days[d][id] = true;
    var p = { items: {}, days: {} }; p.items[id] = item; p.days[d] = {}; p.days[d][id] = true;
    if (n) n.value = ''; if (document.activeElement) document.activeElement.blur();
    xpPatch(p);
  }
  function xpSetDay(id, on) {
    var d = xpDay();
    S.xprep.days = Object.assign({}, S.xprep.days); S.xprep.days[d] = Object.assign({}, S.xprep.days[d]); S.xprep.days[d][id] = on;
    var p = { days: {} }; p.days[d] = {}; p.days[d][id] = on; xpPatch(p);
  }
  function xpDel(id) {
    S.xprep.items = Object.assign({}, S.xprep.items); delete S.xprep.items[id];
    var p = { items: {} }; p.items[id] = null; xpPatch(p);
  }
  function xpTick(id, on) {
    var d = xpDay(), items = Object.assign({}, S.xprep.items);
    if (items[id]) { items[id] = Object.assign({}, items[id], { done: Object.assign({}, items[id].done || {}) }); items[id].done[d] = on; }
    S.xprep.items = items;
    var nm = on ? (who() || null) : null;
    if (items[id]) { items[id].doneBy = Object.assign({}, items[id].doneBy || {}); items[id].doneBy[d] = nm; }
    var p = { items: {} }; p.items[id] = { done: {}, doneBy: {} }; p.items[id].done[d] = on; p.items[id].doneBy[d] = nm; quick('prepextra/board', p);
    setTimeout(annotate, 0);
  }
  function xpPlace() {
    if (ui.tab !== 'prep') return;
    var view = document.getElementById('view'); if (!view) return;
    if (!document.querySelector('.x-prep')) { var top = xpCard(); if (top) { var bar = view.querySelector('.bar'); if (bar) bar.insertAdjacentHTML('afterend', top); else view.insertAdjacentHTML('afterbegin', top); } }
    if (!document.querySelector('.x-prep-menu')) view.insertAdjacentHTML('beforeend', xpMenu());
    if (typeof translateDom === 'function') translateDom();
  }

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

  /* Bylines: initials of whoever ticked each item, on every list that has checkboxes: shift checklists, cleaning,
     week and month lists, the prep list and extra prep. Names are saved beside each tick (a by map on the same record). */
  function initials(n) {
    var w = String(n || '').trim().split(/\s+/).filter(Boolean);
    if (!w.length) return '';
    return (w.length === 1 ? w[0].slice(0, 2) : w[0][0] + w[w.length - 1][0]).toUpperCase();
  }
  var byDocs = {}, watched = {};
  function byFor(path) {
    if (S.shift && path === 'shifts/' + ui.date) return S.shift.by || {};
    if (!watched[path] && typeof watchDoc === 'function' && typeof db !== 'undefined' && db) {
      watched[path] = 1;
      watchDoc(path, function (d) { byDocs[path] = (d && d.by) || {}; annotate(); });
    }
    return byDocs[path] || {};
  }
  function pill(inp, name) {
    var lab = inp.closest('label'); if (!lab || !name || lab.querySelector('.x-by')) return;
    var sm = document.createElement('small'); sm.className = 'x-by'; sm.textContent = initials(name); sm.title = name;
    (lab.querySelector('span') || lab).appendChild(sm);
  }
  function annotate() {
    document.querySelectorAll('input[data-chk]:checked').forEach(function (inp) {
      var p = inp.dataset.chk.split('|'); pill(inp, byFor(p[0])[p[1]]);
    });
    document.querySelectorAll('input[data-pdone]:checked').forEach(function (inp) {
      var d = inp.dataset.pdate || ui.prepDate || iso(new Date()); pill(inp, (((S.prep || {})[d] || {}).by || {})[inp.dataset.pdone]);
    });
    document.querySelectorAll('input[data-xprep]:checked').forEach(function (inp) {
      var x = ((S.xprep && S.xprep.items) || {})[inp.dataset.xprep]; pill(inp, x && x.doneBy && x.doneBy[xpDay()]);
    });
  }

  function start() {
    if (!ready()) return setTimeout(start, 200);
    addRecipes();
    /* Price List lives with the Admin pages (managers only), not under Inventory. */
    if (typeof GROUPS !== 'undefined') {
      GROUPS.forEach(function (g) { var i = g[1].indexOf('prices'); if (i >= 0 && g[0] !== 'Admin') g[1].splice(i, 1); });
      var ag = GROUPS.find(function (g) { return g[0] === 'Admin'; });
      if (ag && ag[1].indexOf('prices') < 0) ag[1].push('prices');
      if (ui.tab === 'prices' && !xpEd()) ui.tab = 'today';
      /* To Do is not used on BOH: take it off the tabs (its saved items are left alone). */
      GROUPS.forEach(function (g) { var i = g[1].indexOf('todo'); if (i >= 0) g[1].splice(i, 1); });
      for (var gi = GROUPS.length - 1; gi >= 0; gi--) if (GROUPS[gi][0] !== 'Admin' && !GROUPS[gi][1].length) GROUPS.splice(gi, 1);
      if (ui.tab === 'todo') ui.tab = 'today';
    }
    var st = document.createElement('style');
    st.textContent = '.x-by{display:inline-block;margin-left:8px;padding:1px 7px;letter-spacing:.04em;border-radius:999px;background:var(--cherry-soft,rgba(139,30,30,.12));color:var(--cherry,#8B1E1E);font:600 11px var(--f-body,system-ui)}.x-signin .chips .btn{min-height:44px;font-size:16px}';
    document.head.appendChild(st);
    S.e86 = S.e86 || {}; S.xprep = S.xprep || {};
    var today = VIEWS.today;
    VIEWS.today = function () { return signin() + card() + today(); };
    var r0 = render;
    render = function () { r0.apply(this, arguments); try { xpPlace(); annotate(); } catch (e) {} };
    (function watch() {
      if (typeof db === 'undefined' || !db) return setTimeout(watch, 300);
      watchDoc('e86/board', function (d) { S.e86 = d || {}; render(); });
      watchDoc('prepextra/board', function (d) { S.xprep = d || {}; render(); });
    })();
    /* The name rides along with every shift check, next to the tracker's own done flag. */
    document.addEventListener('change', function (e) {
      var inp = e.target; if (!inp || !inp.dataset) return;
      if (inp.dataset.xprep) { e.stopImmediatePropagation(); xpTick(inp.dataset.xprep, inp.checked); return; }
      /* A tap and the initials are saved together, in one write, instead of the board's save plus a second one for the name. */
      var nm = who();
      if (inp.dataset.pdone) {
        e.stopImmediatePropagation();
        var pd = inp.dataset.pdate || ui.prepDate || iso(new Date()), pid = inp.dataset.pdone, pb = {}, pdn = {};
        pb[pid] = inp.checked ? (nm || null) : null; pdn[pid] = inp.checked;
        quick('prep/' + pd, { done: pdn, by: pb });
        S.prep = S.prep || {}; S.prep[pd] = Object.assign({}, S.prep[pd]); S.prep[pd].by = Object.assign({}, S.prep[pd].by || {}, pb);
        setTimeout(annotate, 0);
        return;
      }
      if (!inp.dataset.chk) return;
      e.stopImmediatePropagation();
      var parts = inp.dataset.chk.split('|'), path = parts[0], id = parts[1];
      var by = {}, dn = {}; by[id] = inp.checked ? (nm || null) : null; dn[id] = inp.checked;
      quick(path, { done: dn, by: by });
      if (typeof checkListDone === 'function') checkListDone(path, id, inp.checked);
      byDocs[path] = Object.assign({}, byDocs[path] || {}, by);
      if (S.shift && path === 'shifts/' + ui.date) { S.shift.by = Object.assign({}, S.shift.by || {}, by); }
      setTimeout(annotate, 0);
    }, true);
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-x86],[data-xwho],[data-xprep-add],[data-xprep-del],[data-xprep-on],[data-xprep-off],[data-xprep-edit]'); if (!b) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (b.dataset.xprepAdd) { xpAdd(); return; }
      if (b.dataset.xprepDel) { xpDel(b.dataset.xprepDel); return; }
      if (b.dataset.xprepOn) { xpSetDay(b.dataset.xprepOn, true); return; }
      if (b.dataset.xprepOff) { xpSetDay(b.dataset.xprepOff, false); return; }
      if (b.dataset.xprepEdit) { ui.xpEdit = !ui.xpEdit; render(); return; }
      if (b.dataset.x86 === 'add') add(); else if (b.dataset.x86 === 'back') back(b.dataset.id);
      else if (b.dataset.xwho === 'pick') setWho(b.dataset.name);
      else if (b.dataset.xwho === 'out') setWho('');
      else if (b.dataset.xwho === 'in') { var x = document.getElementById('xwho-txt'); if (!x || !x.value.trim()) { if (x) x.focus(); return; } setWho(x.value); }
    }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' || !e.target) return;
      if (e.target.id === 'x86-name' || e.target.id === 'x86-note') { e.preventDefault(); add(); }
      if (e.target.id === 'xwho-txt') { e.preventDefault(); setWho(e.target.value); }
      if (e.target.id === 'xprep-name') { e.preventDefault(); xpAdd(); }
    });
    render();
  }
  start();
})();
