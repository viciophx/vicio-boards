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
    'Build, bottom layer first': 'Armado, de abajo hacia arriba', 'Ingredients': 'Ingredientes', 'Portions and spec': 'Porciones y especificación', 'Procedure': 'Procedimiento', 'Critical rules': 'Reglas críticas', 'Allergens': 'Alérgenos', 'Notes': 'Notas', 'Mods': 'Modificaciones', 'Food cost': 'Costo de alimentos', 'Extra prep': 'Prep extra', 'Recipe': 'Receta', 'Scrub floor drains': 'Talla las coladeras',
    '4 pizzas ready to go before doors: 2 cheese, 2 pepperoni': '4 pizzas listas antes de abrir: 2 de queso, 2 de pepperoni',
    '4 backup pans in the fridge with dough and cheese, ready to top': '4 charolas de respaldo en el refri con masa y queso, listas para armar',
    'Turn on both pizza ovens, 525 top and bottom, 30 minutes before the bake': 'Prende los dos hornos de pizza, 525 arriba y abajo, 30 minutos antes de hornear'
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
  /* Once someone is signed in, the sign-in card goes away and their name sits in the header of every checklist card
     instead. Tapping the name signs them out so the next person can pick theirs. */
  function nameChips(name, attr, label) {
    document.querySelectorAll('section.card,details.card').forEach(function (sec) {
      if (sec.classList.contains('x-signin') || !sec.querySelector('input[data-chk],input[data-pdone],input[data-xprep]')) return;
      var old = sec.querySelector('.x-who');
      if (!name) { if (old) old.remove(); return; }
      if (old) { if (old.dataset.n === name) return; old.remove(); }
      var b = document.createElement('button'); b.type = 'button'; b.className = 'x-who'; b.setAttribute(attr, 'out'); b.dataset.n = name;
      b.title = label; b.setAttribute('aria-label', name + '. ' + label);
      b.textContent = name;
      var head = sec.querySelector('.cardhead');
      /* Inside a fold's header the name must not open or close the fold when tapped. */
      if (head) { head.insertBefore(b, head.querySelector('.count') || null); } else sec.insertBefore(b, sec.firstChild);
    });
  }
  /* Shared iPad: more than one person can be signed in. When two or more are, each tick asks who did it. */
  function askWho(names, title, cb) {
    var old = document.getElementById('x-askwho'); if (old) old.remove();
    var m = document.createElement('div'); m.id = 'x-askwho';
    m.innerHTML = '<div class="x-ask" role="dialog" aria-modal="true"><h3>' + title + '</h3><div class="chips">' +
      names.map(function (n) { return '<button type="button" class="btn" data-askwho="' + n.replace(/"/g, '&quot;') + '">' + n.replace(/</g, '&lt;') + '</button>'; }).join('') +
      '</div><button type="button" class="btn x" data-askwho="">' + '\u2715' + '</button></div>';
    m.addEventListener('click', function (e) {
      var b = e.target.closest('[data-askwho]');
      if (b) { e.stopPropagation(); m.remove(); cb(b.dataset.askwho || null); }
      else if (e.target === m) { m.remove(); cb(null); }
    }, true);
    document.body.appendChild(m);
  }
  /* A soft two-note chime. iPads only allow sound after the first touch, so the audio is unlocked then. */
  var audioCtx = null;
  function unlockAudio() { try { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); } catch (e) {} }
  document.addEventListener('touchstart', unlockAudio, { passive: true, once: true });
  document.addEventListener('click', unlockAudio, { once: true });
  function chime() {
    try {
      if (!audioCtx) return;
      [[880, 0], [1175, .18]].forEach(function (p) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain(), t0 = audioCtx.currentTime + p[1];
        o.type = 'sine'; o.frequency.value = p[0]; o.connect(g); g.connect(audioCtx.destination);
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.4, t0 + .02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + .5);
        o.start(t0); o.stop(t0 + .55);
      });
    } catch (e) {}
  }
  /* Timed alerts: a banner at the top of the screen at a set time, with a chime, until the item is ticked.
     defs: [{key, at:'HH:MM', until:'HH:MM', text, applies(d) -> bool, done(d) -> bool, mark(d, name)}] */
  var snooze = {}, rang = {};
  function runAlerts(defs, dateFn, nameFn) {
    function tick() {
      var now = new Date(), hm = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2), d = dateFn();
      var live = defs.filter(function (a) { return hm >= a.at && hm < a.until && a.applies(d) && !a.done(d) && !(snooze[a.key] > Date.now()); });
      var el = document.getElementById('x-alert');
      if (!live.length) { if (el) el.remove(); return; }
      var a = live[0], late = hm >= a.late;
      if (!el) { el = document.createElement('div'); el.id = 'x-alert'; document.body.appendChild(el); }
      el.className = late ? 'late' : '';
      el.innerHTML = '<div class="x-alert-in"><b>' + a.text + (late ? ' <span class="x-late">' + a.lateText + '</span>' : '') + '</b>' +
        '<span class="x-alert-btns"><button type="button" class="btn primary" data-alert="done">' + a.doneText + '</button><button type="button" class="btn" data-alert="later">' + a.laterText + '</button></span></div>';
      el.onclick = function (e) {
        var b = e.target.closest('[data-alert]'); if (!b) return;
        if (b.dataset.alert === 'later') { snooze[a.key] = Date.now() + 10 * 60000; el.remove(); return; }
        var names = nameFn();
        if (names.length > 1) askWho(names, a.whoText, function (n) { if (n) { a.mark(d, n); el.remove(); } });
        else { a.mark(d, names[0] || ''); el.remove(); }
      };
      var stage = a.key + (late ? ':late' : '');
      if (!rang[stage]) { rang[stage] = 1; chime(); }
    }
    setInterval(tick, 30000); setTimeout(tick, 1500);
  }
  var WHO2_CSS = '#x-askwho{position:fixed;inset:0;z-index:9500;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(24,24,27,.55)}' +
    '.x-ask{position:relative;width:min(100%,420px);background:var(--surface,#fff);color:var(--ink,#18181B);border-radius:14px;padding:18px 18px 16px;box-shadow:0 12px 40px rgba(0,0,0,.3)}' +
    '.x-ask h3{margin:0 0 12px;padding-right:40px;font-size:18px}.x-ask .chips .btn{min-height:48px;font-size:17px}.x-ask>.btn.x{position:absolute;top:10px;right:10px;min-height:36px}' +
    '#x-alert{position:fixed;left:0;right:0;top:0;z-index:9400;padding:calc(10px + env(safe-area-inset-top,0px)) 12px 10px;background:var(--cherry,#8B1E1E);color:#fff;box-shadow:0 6px 24px rgba(0,0,0,.35)}' +
    '#x-alert.late{background:#5A0F0F;animation:x-pulse 1.2s ease-in-out infinite}@keyframes x-pulse{50%{background:#8B1E1E}}' +
    '.x-alert-in{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;max-width:1100px;margin:0 auto;font-size:17px}.x-late{font-weight:400;opacity:.9}' +
    '.x-alert-btns{display:flex;gap:8px}#x-alert .btn{min-height:44px}#x-alert .btn.primary{background:#fff;color:var(--cherry,#8B1E1E)}#x-alert .btn:not(.primary){background:transparent;color:#fff;border-color:rgba(255,255,255,.6)}';
  var WHO_CSS = WHO2_CSS + '.x-who{margin-left:auto;font:600 12px var(--f-body,system-ui);color:var(--cherry,#8B1E1E);background:var(--cherry-soft,rgba(139,30,30,.1));border:1px solid currentColor;border-radius:999px;padding:4px 10px;min-height:28px;cursor:pointer;white-space:nowrap}.x-who::before{content:"\u25CF ";font-size:9px;vertical-align:1px}.cardhead{flex-wrap:wrap;gap:6px}';
  /* FOH: who is on this device, and their initials on everything they tick. The FOH board already saves the name with each
     tick and clears the sign-in at the next shift; this puts the sign-in on Today and Checklists and shows initials. */
  if (BOARD === 'foh') {
    (function fohStart() {
      if (typeof VIEWS === 'undefined' || typeof render !== 'function' || typeof save !== 'function' || typeof S === 'undefined' ||
          typeof ui === 'undefined' || typeof window.setWho !== 'function' || typeof whoName !== 'function') return setTimeout(fohStart, 200);
      var fes = function () { return ui.lang === 'es'; }, ft = function (a, b) { return fes() ? b : a; };
      /* Standards added after a rough weekend (Nov 1 2026). New sections go at the end of each list so the ids of the
         existing items, and the ticks already saved against them, stay put. */
      if (typeof LISTS !== 'undefined' && LISTS.bar_open && !LISTS.bar_open.some(function (s) { return s[0] === 'Before doors open'; })) {
        LISTS.bar_open.push(['Before doors open', [
          'Margaritas batched to par for the night, labeled and dated',
          'Ice wells full at open',
          'Phones away. No sitting or eating at the bar. Slow moment? Prep or restock']]);
        /* The rush starts around 10 PM, so the ice gets topped off at 9, before it hits. */
        LISTS.bar_open.push(['During service', [
          '9 PM: top off all the ice before the 10 PM rush']]);
        LISTS.bar_close.push(['Set up tomorrow', [
          'Margarita batch level noted so the opener knows how much to batch']]);
        LISTS.host_open.push(['Before doors open', [
          'Cold beer stocked in the storage fridge from the backups',
          'Napkins stocked in the expo window. Backups are in the attic',
          'Phones away. No sitting or eating on the floor or at the bar. Slow moment? Prep, restock, or detail']]);
        LISTS.host_close.push(['Set up tomorrow', [
          'Cold beer restocked in the storage fridge for tomorrow',
          'Expo window napkins restocked from the attic backups']]);
        LISTS.host_close.push(['Restrooms after close', [
          'Women\u2019s restroom checked: clean, trash out, toilet paper, paper towels and soap stocked',
          'Men\u2019s restroom checked: clean, trash out, toilet paper, paper towels and soap stocked']]);
      }
      /* Special event nights (a buyout or ticketed event booked on Catering & Events): security and a door person. */
      var EV_SEC = LISTS && LISTS.host_open ? LISTS.host_open.length : 99;
      function eventNight(d) {
        try { return Object.values(S.orders || {}).some(function (o) { return o && o.date === d && (o.type === 'buyout' || o.type === 'ticketed') && ['deposit', 'confirmed', 'done'].indexOf(o.status) >= 0; }); } catch (e) { return false; }
      }
      if (typeof sections === 'function' && !sections.__ev) {
        var sec0 = sections;
        sections = function (key, d) {
          var out = sec0(key, d);
          if (key === 'host_open' && eventNight(d)) out.push(['Special event tonight', [
            ['host_open_' + EV_SEC + '_0', 'Security guard on site and checked in before doors', false],
            ['host_open_' + EV_SEC + '_1', 'Door person at the door all night (IDs, guest list or tickets)', false]]]);
          return out;
        };
        sections.__ev = true;
      }
      function ini(n) { var w = String(n || '').trim().split(/\s+/).filter(Boolean); if (!w.length) return ''; return (w.length === 1 ? w[0].slice(0, 2) : w[0][0] + w[w.length - 1][0]).toUpperCase(); }
      function fquick(path, patch) {
        if (typeof db === 'undefined' || !db || !db.doc) return save(path, patch);
        if (typeof setStatus === 'function') setStatus('Saving');
        return db.doc(path).update(patch).then(function () { if (typeof setStatus === 'function') setStatus('Saved', 'ok'); },
          function () { if (typeof setStatus === 'function') setStatus('Not saved. Check your access and try again.', 'bad'); });
      }
      /* Everyone signed in on this device for the service day. The FOH board's own single sign-in is kept as the first name. */
      function fnames() {
        try { var x = JSON.parse(localStorage.getItem('vicio_foh_names') || 'null'); if (x && x.date === svcDate() && Array.isArray(x.names)) return x.names; } catch (e) {}
        var n = whoName(); return n ? [n] : [];
      }
      function setNames(arr) {
        arr = arr.filter(function (n, i) { return n && arr.indexOf(n) === i; });
        try { localStorage.setItem('vicio_foh_names', JSON.stringify({ names: arr, date: svcDate() })); } catch (e) {}
        ui.whoEdit = false;
        window.setWho(arr[0] || '');
      }
      function card() {
        var names = fnames();
        if (names.length && !ui.whoEdit) return '';
        var ppl = typeof stPeople === 'function' ? stPeople() : [];
        ppl = ppl.filter(function (p) { return p.group !== 'Kitchen'; }).concat(ppl.filter(function (p) { return p.group === 'Kitchen'; })).filter(function (p) { return names.indexOf(p.name) < 0; });
        return '<section class="card edge x-signin"><div class="cardhead"><h3>' + (names.length ? ft('On this device', 'En este aparato') : ft('Who is on tonight?', '\u00bfQui\u00e9n est\u00e1 esta noche?')) + '</h3></div>' +
          (names.length ? '<div class="chips">' + names.map(function (n) { return '<span class="x-tag">' + esc(n) + '<button type="button" class="btn x" data-fwho="rm" data-name="' + esc(n) + '" aria-label="' + ft('Remove', 'Quitar') + ' ' + esc(n) + '">\u00d7</button></span>'; }).join('') + '</div>' : '') +
          '<p class="status">' + (names.length ? ft('Working off the same iPad? Add the other person too; each tick will ask who did it.', '\u00bfTrabajan en el mismo iPad? Agrega a la otra persona; cada marca preguntar\u00e1 qui\u00e9n la hizo.') : ft('Tap your name so your checks carry it. It clears at the next shift.', 'Toca tu nombre para que tus marcas lo lleven. Se borra en el siguiente turno.')) + '</p>' +
          '<div class="chips">' + ppl.map(function (p) { return '<button type="button" class="btn" data-fwho="pick" data-name="' + esc(p.name) + '">' + esc(first(p.name)) + '</button>'; }).join('') + '</div>' +
          '<div class="padd"><input type="text" id="fwho-txt" placeholder="' + ft('Someone else', 'Otra persona') + '" autocomplete="off" autocapitalize="words">' +
          '<button type="button" class="btn primary" data-fwho="in">' + (names.length ? ft('Add', 'Agregar') : ft('Sign in', 'Entrar')) + '</button>' +
          (names.length ? '<button type="button" class="btn" data-fwho="done">' + ft('Done', 'Listo') + '</button>' : '') + '</div></section>';
      }
      var byDocs = {}, watched = {};
      function byFor(path) {
        if (S.shift && path === 'shifts/' + ui.date) return S.shift.by || {};
        if (!watched[path] && typeof watchDoc === 'function' && typeof db !== 'undefined' && db) {
          watched[path] = 1; watchDoc(path, function (d) { byDocs[path] = (d && d.by) || {}; annotate(); });
        }
        return byDocs[path] || {};
      }
      function annotate() {
        document.querySelectorAll('input[data-chk]:checked').forEach(function (inp) {
          var p = inp.dataset.chk.split('|'), name = byFor(p[0])[p[1]], lab = inp.closest('label');
          if (!lab || !name || lab.querySelector('.x-by')) return;
          var sm = document.createElement('small'); sm.className = 'x-by'; sm.textContent = ini(name); sm.title = name;
          (lab.querySelector('span') || lab).appendChild(sm);
        });
      }
      var st = document.createElement('style');
      st.textContent = '.x-by{display:inline-block;margin-left:8px;padding:1px 7px;letter-spacing:.04em;border-radius:999px;background:var(--cherry-soft,rgba(139,30,30,.12));color:var(--cherry,#8B1E1E);font:600 11px var(--f-body,system-ui)}.byline{display:none!important}.x-signin .chips .btn{min-height:44px;font-size:16px}.x-tag{display:inline-flex;align-items:center;gap:4px;padding:4px 6px 4px 12px;border-radius:999px;background:var(--cherry-soft,rgba(139,30,30,.12));color:var(--cherry,#8B1E1E);font-weight:600}.x-tag .btn.x{min-height:30px;padding:0 8px}' + WHO_CSS;
      document.head.appendChild(st);
      ['today', 'lists'].forEach(function (k) { var v = VIEWS[k]; if (typeof v === 'function') VIEWS[k] = function () { return card() + v.apply(this, arguments); }; });
      var r0 = render;
      render = function () { r0.apply(this, arguments); try { annotate(); nameChips(fnames().join(' + '), 'data-fwho', ft('Tap to add or switch people', 'Toca para agregar o cambiar personas')); } catch (e) {} };
      /* A tap and the name go out together, at once, so a box never flips back while it saves. */
      function saveTick(path, id, on, nm) {
        var patch = { done: {} }; patch.done[id] = on;
        if (nm || !on) { patch.by = {}; patch.by[id] = on ? nm : null; byDocs[path] = Object.assign({}, byDocs[path] || {}, patch.by); }
        fquick(path, patch);
        if (S.shift && path === 'shifts/' + ui.date && patch.by) S.shift.by = Object.assign({}, S.shift.by || {}, patch.by);
        if (typeof markListDone === 'function') markListDone(path, id, on);
        if (typeof maybeAutoReport === 'function') maybeAutoReport(path, id, on);
        setTimeout(annotate, 0);
      }
      document.addEventListener('change', function (e) {
        var inp = e.target; if (!inp || !inp.dataset || !inp.dataset.chk) return;
        e.stopImmediatePropagation();
        var parts = inp.dataset.chk.split('|'), path = parts[0], id = parts[1], names = fnames();
        if (inp.checked && names.length > 1) {
          askWho(names, ft('Who did this?', '\u00bfQui\u00e9n lo hizo?'), function (n) { if (!n) { inp.checked = false; return; } saveTick(path, id, true, n); });
          return;
        }
        saveTick(path, id, inp.checked, names[0] || '');
      }, true);
      document.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('[data-fwho]'); if (!b) return;
        e.preventDefault(); e.stopImmediatePropagation();
        var names = fnames();
        if (b.dataset.fwho === 'pick') { setNames(names.concat([b.dataset.name])); }
        else if (b.dataset.fwho === 'rm') { setNames(names.filter(function (n) { return n !== b.dataset.name; })); ui.whoEdit = true; render(); }
        else if (b.dataset.fwho === 'out') { ui.whoEdit = true; render(); }
        else if (b.dataset.fwho === 'done') { ui.whoEdit = false; render(); }
        else { var x = document.getElementById('fwho-txt'); if (!x || !x.value.trim()) { if (x) x.focus(); return; } setNames(names.concat([x.value.trim()])); }
      }, true);
      document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target && e.target.id === 'fwho-txt' && e.target.value.trim()) { e.preventDefault(); setNames(fnames().concat([e.target.value.trim()])); } });
      /* 9 PM ice alert for the bar: a banner and a chime until the 9 PM top-off is ticked; red and chiming again after 9:15. */
      var ICE_ID = 'bar_open_' + LISTS.bar_open.findIndex(function (s) { return s[0] === 'During service'; }) + '_0';
      runAlerts([{
        key: 'ice', at: '21:00', late: '21:15', until: '23:00',
        text: ft('9 PM: top off all the ice before the 10 PM rush', '9 PM: rellena todo el hielo antes de la hora pico de las 10'),
        lateText: ft('(running late)', '(ya va tarde)'), doneText: ft('Ice is topped off', 'Hielo listo'), laterText: ft('10 more minutes', '10 minutos m\u00e1s'), whoText: ft('Who topped off the ice?', '\u00bfQui\u00e9n rellen\u00f3 el hielo?'),
        applies: function (d) { return true; },
        done: function (d) { return !!(S.shift && S.shift.done && S.shift.done[ICE_ID] && ui.date === d); },
        mark: function (d, n) { saveTick('shifts/' + d, ICE_ID, true, n); if (S.shift && ui.date === d) { S.shift.done = Object.assign({}, S.shift.done, { [ICE_ID]: true }); } render(); }
      }], svcDate, fnames);
      render();
    })();
    return;
  }
  if (BOARD !== 'kitchen') return;
  document.title = 'Vicio BOH';

  function ready() { return typeof VIEWS !== 'undefined' && typeof render === 'function' && typeof save === 'function' && typeof S !== 'undefined' && typeof ui !== 'undefined'; }
  function es() { return typeof lang === 'function' ? lang() === 'es' : false; }
  function t(en, esx) { return es() ? esx : en; }
  /* Everyone signed in on this device. ui.by stays the first name for the board's own logs. */
  function names() { try { var x = JSON.parse(localStorage.getItem('vicio_by') || 'null'); if (Array.isArray(x)) return x.filter(Boolean); if (typeof x === 'string') return [x]; } catch (e) {} var s = ''; try { s = localStorage.getItem('vicio_by') || ''; } catch (e) {} return s ? [s] : []; }
  function who() { return names()[0] || ''; }
  /* Saves a tap straight to the store, without waiting behind earlier taps, so each one is protected on screen at once. */
  function quick(path, patch) {
    if (typeof db === 'undefined' || !db || !db.doc) return save(path, patch);
    if (typeof setStatus === 'function') setStatus('Saving');
    return db.doc(path).update(patch).then(function () { if (typeof setStatus === 'function') setStatus('Saved', 'ok'); },
      function () { if (typeof setStatus === 'function') setStatus('Not saved. Check your access and try again.', 'bad'); });
  }
  function setNames(arr) {
    arr = arr.map(function (n) { return String(n || '').trim(); }).filter(function (n, i) { return n && arr.indexOf(n) === i; });
    ui.by = arr[0] || '';
    try { if (arr.length) localStorage.setItem('vicio_by', JSON.stringify(arr)); else localStorage.removeItem('vicio_by'); } catch (e) {}
    ui.whoEdit = false; render();
  }
  function setWho(n) { setNames(n ? [n] : []); }


  /* Recipe cards from recipes.js go into their group on the Recipes page; esx holds the Spanish card. */
  var REMOVED_RECIPES = ['nm505', 'asadafries'];  /* Nuevo Mexico 505, Carne Asada Fries */
  function addRecipes() {
    if (typeof BOOK === 'undefined' || !Array.isArray(BOOK)) return;
    BOOK.forEach(function (g) { g.items = g.items.filter(function (i) { return REMOVED_RECIPES.indexOf(i.id) < 0; }); });
    if (typeof RECIPES !== 'undefined' && Array.isArray(RECIPES)) RECIPES.forEach(function (g) { g[1] = g[1].filter(function (x) { return REMOVED_RECIPES.indexOf(x[0]) < 0; }); });
    if (REMOVED_RECIPES.indexOf(ui.rSel) >= 0) ui.rSel = null;
    (window.VICIO_RECIPES || []).forEach(function (pair) {
      var g = BOOK.find(function (x) { return x.name === pair[0]; }) || BOOK[0];
      if (!BOOK.some(function (x) { return x.items.some(function (i) { return i.id === pair[1].id; }); })) g.items.push(pair[1]);
    });
    if (typeof recDetail === 'function' && !recDetail.__esx) {
      var rd0 = recDetail;
      recDetail = function (x) { return withPhoto(x, rd0(x && x.esx && es() ? Object.assign({}, x, x.esx) : x)); };
      recDetail.__esx = true;
    }
    if (typeof render === 'function' && ui.tab === 'recipes') render();
  }
  window.__vicioAddRecipes = addRecipes;
  /* Food photo on each recipe page, between Notes and Food cost. Stored per recipe at rphotos/<id> (the same record the
     training recipe cards use), shrunk to about 1000 px. Managers add, replace or remove it; everyone sees it. */
  var photoLoading = {}, photoChecked = {};
  function withPhoto(x, html) {
    if (!x || !x.id || typeof PHOTO === 'undefined') return html;
    var id = x.id, img = PHOTO[id], ed = typeof isEditor === 'function' ? isEditor() : false;
    /* Look again every 20 seconds while a recipe has no photo, so one saved from another device shows up without a reload. */
    if (!img && !photoLoading[id] && typeof getDoc === 'function' && Date.now() - (photoChecked[id] || 0) > 20000) {
      photoLoading[id] = 1; photoChecked[id] = Date.now();
      getDoc('rphotos/' + id).then(function (d) { var v = (d && d.img) || null, changed = v !== PHOTO[id]; PHOTO[id] = v; photoLoading[id] = 0; if (changed) render(); }, function () { photoLoading[id] = 0; });
    }
    if (!img && !ed) return html;
    var block = '<div class="rsec x-photo"><p class="grp">' + t('Photo', 'Foto') + '</p>' +
      (img ? '<img src="' + img + '" alt="' + esc(x.name) + '" loading="lazy" style="display:block;width:100%;max-width:640px;border-radius:12px">' : '') +
      (ed ? '<div class="chips" style="margin-top:10px"><label class="btn" style="cursor:pointer">' + (img ? t('Replace photo', 'Cambiar foto') : t('Add photo', 'Agregar foto')) +
        '<input type="file" accept="image/*" data-photo="' + esc(id) + '" style="position:absolute;width:1px;height:1px;opacity:0"></label>' +
        (img ? '<button type="button" class="btn x" data-act="phdel" data-id="' + esc(id) + '">' + t('Remove photo', 'Quitar foto') + '</button>' : '') + '</div>' : '') + '</div>';
    var mark = '<div class="rsec"><p class="grp">Food cost</p>', i = html.indexOf(mark);
    return i >= 0 ? html.slice(0, i) + block + html.slice(i) : html + block;
  }
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
  function xpTick(id, on, asName) {
    var d = xpDay(), items = Object.assign({}, S.xprep.items);
    if (items[id]) { items[id] = Object.assign({}, items[id], { done: Object.assign({}, items[id].done || {}) }); items[id].done[d] = on; }
    S.xprep.items = items;
    var nm = on ? (asName || who() || null) : null;
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
    var nm = names();
    if (nm.length && !ui.whoEdit) return '';
    var ppl = typeof stPeople === 'function' ? stPeople() : [];
    ppl = ppl.filter(function (p) { return p.group === 'Kitchen'; }).concat(ppl.filter(function (p) { return p.group !== 'Kitchen'; })).filter(function (p) { return nm.indexOf(p.name) < 0; });
    return '<section class="card edge x-signin"><div class="cardhead"><h3>' + (nm.length ? t('On this device', 'En este aparato') : 'Who is checking tonight?') + '</h3></div>' +
      (nm.length ? '<div class="chips">' + nm.map(function (n) { return '<span class="x-tag">' + esc(n) + '<button type="button" class="btn x" data-xwho="rm" data-name="' + esc(n) + '" aria-label="' + t('Remove', 'Quitar') + ' ' + esc(n) + '">\u00d7</button></span>'; }).join('') + '</div>' : '') +
      '<p class="status">' + (nm.length ? t('Working off the same iPad? Add the other person too; each tick will ask who did it.', '\u00bfTrabajan en el mismo iPad? Agrega a la otra persona; cada marca preguntar\u00e1 qui\u00e9n la hizo.') : 'Tap your name so your checks and logs carry it.') + '</p>' +
      '<div class="chips">' + ppl.map(function (p) { return '<button type="button" class="btn" data-xwho="pick" data-name="' + esc(p.name) + '">' + esc(first(p.name)) + '</button>'; }).join('') + '</div>' +
      '<div class="padd"><input type="text" id="xwho-txt" placeholder="' + t('Someone else', 'Otra persona') + '" autocomplete="off" autocapitalize="words">' +
      '<button type="button" class="btn primary" data-xwho="in">' + (nm.length ? t('Add', 'Agregar') : 'Sign in') + '</button>' +
      (nm.length ? '<button type="button" class="btn" data-xwho="done">' + t('Done', 'Listo') + '</button>' : '') + '</div></section>';
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
        '<button type="button" class="btn x" data-x86="back" data-id="' + esc(x.id) + '">' + t('Back in', 'Ya hay') + '</button></li>';
    }).join('');
    return '<section class="card' + (out.length ? ' edge' : '') + '"><div class="cardhead"><h3>' + t('86 board', 'Pizarra de 86') + '</h3><span class="count">' +
      (out.length ? out.length + ' ' + t('out', 'agotados') : t('Nothing out', 'Nada agotado')) + '</span></div>' +
      (out.length ? '<ul class="checks plist">' + rows + '</ul>' : '<p class="status">' + t('When the kitchen or the bar runs out of something, put it here. The FOH board and Colette see it right away.', 'Cuando a la cocina o a la barra se le acabe algo, an\u00f3talo aqu\u00ed. La pizarra de FOH y Colette lo ven al instante.') + '</p>') +
      '<div class="padd"><input type="text" id="x86-name" placeholder="' + t('What\u2019s out', 'Qué se acabó') + '" autocomplete="off" autocorrect="off">' +
      '<input type="text" id="x86-note" placeholder="' + t('Until when, or why', 'Hasta cuándo, o por qué') + '" autocomplete="off" style="flex:1 1 120px;width:auto">' +
      '<button type="button" class="btn primary" data-x86="add">' + t('86 it', 'Ponerlo en 86') + '</button></div></section>';
  }
  /* The 86 board lives behind a small button at the top right of Today; tapping it opens the list in a panel. */
  function x86Btn() {
    var n = list().length;
    return '<button type="button" class="x86-btn' + (n ? ' on' : '') + '" data-x86="open" aria-label="' + t('86 board', 'Pizarra de 86') + ', ' + n + ' ' + t('out', 'agotados') + '">86' + (n ? '<b>' + n + '</b>' : '') + '</button>';
  }
  function x86Place() {
    var head = document.getElementById('head'), old = document.querySelector('.x86-btn');
    if (ui.tab !== 'today') { if (old) old.remove(); }
    else if (head) { head.style.position = 'relative'; if (old) old.outerHTML = x86Btn(); else head.insertAdjacentHTML('beforeend', x86Btn()); }
    var m = document.getElementById('x86-modal'), a = document.activeElement;
    if (m && !(a && m.contains(a) && /^(INPUT|TEXTAREA)$/.test(a.tagName))) m.querySelector('.x86-body').innerHTML = card();
  }
  function x86Open() {
    if (document.getElementById('x86-modal')) return;
    var m = document.createElement('div'); m.id = 'x86-modal';
    m.innerHTML = '<div class="x86-panel" role="dialog" aria-modal="true" aria-label="' + t('86 board', 'Pizarra de 86') + '"><button type="button" class="x86-x" data-x86="close" aria-label="' + t('Close', 'Cerrar') + '">\u00d7</button><div class="x86-body">' + card() + '</div></div>';
    m.addEventListener('click', function (e) { if (e.target === m) x86Close(); });
    document.body.appendChild(m);
  }
  function x86Close() { var m = document.getElementById('x86-modal'); if (m) m.remove(); }
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
    /* Pizzas staged for the rush (Eric, Nov 1 2026). Added at the end of the opening list so earlier items keep their ids. */
    if (typeof OPENLIST !== 'undefined' && OPENLIST.indexOf('4 pizzas ready to go before doors: 2 cheese, 2 pepperoni') < 0) {
      OPENLIST.push('4 pizzas ready to go before doors: 2 cheese, 2 pepperoni', '4 backup pans in the fridge with dough and cheese, ready to top');
    }
    /* Dough schedule: ovens on at 5:30 PM, 30 minutes before each 6 PM bake (Eric, Nov 1 2026). Ticks are saved by
       position, so the new step carries its own key ('ovens') and the existing steps keep their original positions. */
    if (typeof djobs === 'function' && !djobs.__ovens) {
      var dj0 = djobs, dd0 = dDone;
      djobs = function (k) {
        var a = dj0(k).map(function (j, i) { return Object.assign({}, j, { _i: i }); });
        var bi = a.findIndex(function (j) { return /^Bake /.test(j.job); });
        if (bi >= 0) a.splice(bi, 0, { w: a[bi].w, when: '5:30 PM', job: 'Turn on both pizza ovens, 525 top and bottom, 30 minutes before the bake', min: '', s: 'Ovens on', _i: 'ovens' });
        return a;
      };
      djobs.__ovens = true;
      dDone = function (k, i) { var j = djobs(k)[i]; return dd0(k, j ? j._i : i); };
      document.addEventListener('change', function (e) {
        var t = e.target; if (!t || !t.dataset || !t.dataset.dtoggle) return;
        var p = t.dataset.dtoggle.split('|'), j = djobs(p[0])[+p[1]];
        if (j && String(j._i) !== p[1]) t.dataset.dtoggle = p[0] + '|' + j._i;
      }, true);
    }
    /* Task wording fixes. Ids stay the same, so past checks still count. No floor mats in the kitchen. */
    if (typeof CLEANING !== 'undefined') CLEANING.forEach(function (day) {
      (day[3] || []).forEach(function (it) { if (it[1] === 'c_drains') it[2] = 'Scrub floor drains'; });
      /* Tasks taken off the rotation: pizza pan buildup scrub. */
      if (day[3]) day[3] = day[3].filter(function (it) { return ['c_pans'].indexOf(it[1]) < 0; });
    });
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
    st.textContent = '.x-by{display:inline-block;margin-left:8px;padding:1px 7px;letter-spacing:.04em;border-radius:999px;background:var(--cherry-soft,rgba(139,30,30,.12));color:var(--cherry,#8B1E1E);font:600 11px var(--f-body,system-ui)}.x-signin .chips .btn{min-height:44px;font-size:16px}' + WHO_CSS +
      '.x-tag{display:inline-flex;align-items:center;gap:4px;padding:4px 6px 4px 12px;border-radius:999px;background:var(--cherry-soft,rgba(139,30,30,.12));color:var(--cherry,#8B1E1E);font-weight:600}.x-tag .btn.x{min-height:30px;padding:0 8px}' +
      '.x86-btn{position:absolute;top:0;right:0;display:inline-flex;align-items:center;gap:6px;font:700 15px var(--f-head,var(--f-body,system-ui));letter-spacing:.02em;min-height:40px;padding:6px 14px;border-radius:999px;border:1px solid var(--line,#ccc);background:var(--surface,#fff);color:var(--ink,#18181B);cursor:pointer}' +
      '.x86-btn b{display:inline-grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border-radius:999px;background:var(--cherry,#8B1E1E);color:var(--cherry-ink,#fff);font-size:12px}' +
      '.x86-btn.on{border-color:var(--cherry,#8B1E1E);color:var(--cherry,#8B1E1E)}#head h1{padding-right:84px}' +
      '#x86-modal{position:fixed;inset:0;z-index:9000;display:flex;align-items:flex-start;justify-content:center;padding:max(60px,env(safe-area-inset-top,0px)) 16px 16px;background:rgba(24,24,27,.55)}' +
      '.x86-panel{position:relative;width:min(100%,520px);max-height:calc(100vh - 90px);overflow:auto;border-radius:14px}.x86-panel .card{margin:0}' +
      '.x86-x{position:absolute;top:10px;right:10px;z-index:1;width:36px;height:36px;border-radius:999px;border:1px solid var(--line,#ccc);background:var(--surface,#fff);color:var(--ink,#18181B);font-size:20px;line-height:1;cursor:pointer}.x86-panel .cardhead{padding-right:44px}' +
      /* Side-by-side cards: a folded card shrinks to its title instead of stretching to its neighbour's height. */
      '.grid>details.fold{align-self:start}';
    document.head.appendChild(st);
    S.e86 = S.e86 || {}; S.xprep = S.xprep || {};
    var today = VIEWS.today;
    VIEWS.today = function () { return signin() + today(); };
    var r0 = render;
    render = function () { r0.apply(this, arguments); try { xpPlace(); x86Place(); annotate(); nameChips(names().join(' + '), 'data-xwho', t('Tap to add or switch people', 'Toca para agregar o cambiar personas')); } catch (e) {} };
    (function watch() {
      if (typeof db === 'undefined' || !db) return setTimeout(watch, 300);
      watchDoc('e86/board', function (d) { S.e86 = d || {}; render(); });
      watchDoc('prepextra/board', function (d) { S.xprep = d || {}; render(); });
    })();
    /* 5:30 PM ovens alert on bake days: a banner and a chime until the ovens step is ticked; red and chiming again after 5:45. */
    runAlerts([{
      key: 'ovens', at: '17:30', late: '17:45', until: '19:00',
      text: t('5:30 PM: turn on both pizza ovens, 525 top and bottom. Bake starts at 6', '5:30 PM: prende los dos hornos de pizza, 525 arriba y abajo. Se hornea a las 6'),
      lateText: t('(running late)', '(ya va tarde)'), doneText: t('Ovens are on', 'Hornos prendidos'), laterText: t('10 more minutes', '10 minutos m\u00e1s'), whoText: t('Who turned on the ovens?', '\u00bfQui\u00e9n prendi\u00f3 los hornos?'),
      applies: function (d) { return djobs(d).some(function (j) { return j._i === 'ovens'; }); },
      done: function (d) { var x = S.caldough && S.caldough[d]; return !!(x && x.done && x.done.ovens); },
      mark: function (d, n) { quick('caldough/' + d, { done: { ovens: true }, by: { ovens: n || null } }); S.caldough = S.caldough || {}; S.caldough[d] = Object.assign({}, S.caldough[d], { done: Object.assign({}, (S.caldough[d] || {}).done, { ovens: true }) }); render(); }
    }], function () { return iso(new Date()); }, names);
    /* The name rides along with every shift check, next to the tracker's own done flag. */
    document.addEventListener('change', function (e) {
      var inp = e.target; if (!inp || !inp.dataset) return;
      var nms = names();
      if (inp.dataset.xprep) {
        e.stopImmediatePropagation();
        if (inp.checked && nms.length > 1) { askWho(nms, t('Who did this?', '\u00bfQui\u00e9n lo hizo?'), function (n) { if (!n) { inp.checked = false; return; } xpTick(inp.dataset.xprep, true, n); }); return; }
        xpTick(inp.dataset.xprep, inp.checked); return;
      }
      /* A tap and the initials are saved together, in one write, instead of the board's save plus a second one for the name. */
      if (inp.checked && nms.length > 1 && (inp.dataset.pdone || inp.dataset.chk)) {
        e.stopImmediatePropagation();
        askWho(nms, t('Who did this?', '\u00bfQui\u00e9n lo hizo?'), function (n) {
          if (!n) { inp.checked = false; return; }
          if (inp.dataset.pdone) { var pd2 = inp.dataset.pdate || ui.prepDate || iso(new Date()), pb2 = {}, pdn2 = {}; pb2[inp.dataset.pdone] = n; pdn2[inp.dataset.pdone] = true; quick('prep/' + pd2, { done: pdn2, by: pb2 }); S.prep = S.prep || {}; S.prep[pd2] = Object.assign({}, S.prep[pd2]); S.prep[pd2].by = Object.assign({}, S.prep[pd2].by || {}, pb2); }
          else { var pt = inp.dataset.chk.split('|'), by2 = {}, dn2 = {}; by2[pt[1]] = n; dn2[pt[1]] = true; quick(pt[0], { done: dn2, by: by2 }); if (typeof checkListDone === 'function') checkListDone(pt[0], pt[1], true); byDocs[pt[0]] = Object.assign({}, byDocs[pt[0]] || {}, by2); if (S.shift && pt[0] === 'shifts/' + ui.date) S.shift.by = Object.assign({}, S.shift.by || {}, by2); }
          setTimeout(annotate, 0);
        });
        return;
      }
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
      if (b.dataset.x86 === 'open') { x86Open(); return; }
      if (b.dataset.x86 === 'close') { x86Close(); return; }
      if (b.dataset.x86 === 'add') add(); else if (b.dataset.x86 === 'back') back(b.dataset.id);
      else if (b.dataset.xwho === 'pick') setNames(names().concat([b.dataset.name]));
      else if (b.dataset.xwho === 'rm') { setNames(names().filter(function (n) { return n !== b.dataset.name; })); ui.whoEdit = true; render(); }
      else if (b.dataset.xwho === 'out') { ui.whoEdit = true; render(); }
      else if (b.dataset.xwho === 'done') { ui.whoEdit = false; render(); }
      else if (b.dataset.xwho === 'in') { var x = document.getElementById('xwho-txt'); if (!x || !x.value.trim()) { if (x) x.focus(); return; } setNames(names().concat([x.value])); }
    }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { x86Close(); return; }
      if (e.key !== 'Enter' || !e.target) return;
      if (e.target.id === 'x86-name' || e.target.id === 'x86-note') { e.preventDefault(); add(); }
      if (e.target.id === 'xwho-txt') { e.preventDefault(); if (e.target.value.trim()) setNames(names().concat([e.target.value])); }
      if (e.target.id === 'xprep-name') { e.preventDefault(); xpAdd(); }
    });
    render();
  }
  start();
})();
