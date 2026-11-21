/* Vicio: Friday and Saturday shift lists (Eric, Nov 14 and 16 2026). Loaded by sheetdb.js on the FOH board and by dough.js on the BOH board.
   Hours: Thursday 5 PM to midnight; Friday and Saturday noon to midnight. A day is a two-shift day when the schedule has a
   Vicio shift that starts before 3 PM. On those days the lists follow the shifts instead of open / mid / close:
     FOH, each role (Bartender, Host / Busser), with the name from the schedule in the title
       AM crew   AM open (the open list, without the evening lights)   AM lunch check   AM hand off (3 to 4 PM)
       PM crew   PM takeover   PM evening check (the mid shift list)   PM close
     The hand off is two-sided: the AM person ticks the hand off and the PM person ticks the takeover. Someone who ticked the
     hand off cannot tick the takeover, and a PM person on the schedule cannot tick the AM hand off.
     Expo has no separate list on those days: its open, service and close items go on the busser's open, evening check and
     close lists (same ids, so ticks already saved stay put).
     BOH: Arturo covers the whole day; an afternoon reset list sits between the mid shift and the closing list.
   Thursday and other one-crew days are untouched.
   New lists: bar_amoff, host_amoff, bar_pmon, host_pmon, bar_amchk, host_amchk on FOH; rl_ on BOH. Their ticks save in
   shifts/<date>.done like every other list, and they are empty on other days. */
(function () {
  if (window.__vicioAM) return;
  window.__vicioAM = true;
  var BOARD = window.VICIO_BOARD;
  if (BOARD !== 'foh' && BOARD !== 'kitchen') return;
  var AM_BEFORE = 15 * 60, PM_FROM = 16 * 60;
  function es() { try { return BOARD === 'foh' ? ui.lang === 'es' : (typeof lang === 'function' && lang() === 'es'); } catch (e) { return false; } }
  function tt(en, sp) { return es() ? sp : en; }
  function hx(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function isVicio(w) { return (w.org || w.location || 'Vicio') === 'Vicio' || /vicio/i.test(w.role || ''); }
  function vic(d) { try { return shiftsOn(d).filter(isVicio); } catch (e) { return []; } }
  /* A two-shift day: someone from Vicio starts before 3 PM. */
  function amDay(d) { return vic(d).some(function (w) { return mins(w.start) < AM_BEFORE; }); }
  function pmNow(d) { var now = new Date(), td = iso(now); return d < td || (d === td && now.getHours() * 60 + now.getMinutes() >= PM_FROM); }
  function flash(msg) {
    var el = document.getElementById('x-amsg');
    if (!el) { el = document.createElement('div'); el.id = 'x-amsg'; el.setAttribute('role', 'alert'); document.body.appendChild(el); }
    el.textContent = msg; el.style.display = 'block'; clearTimeout(flash.t); flash.t = setTimeout(function () { el.style.display = 'none'; }, 6000);
  }
  function style(css) { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
  style('#x-amsg{display:none;position:fixed;left:50%;transform:translateX(-50%);bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9500;max-width:min(92vw,560px);background:var(--cherry,#8B1E1E);color:#fff;font:600 15px/1.4 system-ui,-apple-system,sans-serif;padding:12px 16px;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.35)}');

  /* ---------- FOH ---------- */
  if (BOARD === 'foh') {
    var RR = { W: 'Women\u2019s restroom: quick look, no big mess left for the hotel. We don\u2019t clean or stock it', M: 'Men\u2019s restroom: quick look, no big mess left for the hotel. We don\u2019t clean or stock it' };
    var NEW = {
      bar_amchk: [['Lunch check, around 2 PM', [
        'Bar top, rails, and mats wiped down',
        'Garnishes checked and refilled',
        'Margarita batch checked. Batch more if it is under half',
        'Ice wells topped off',
        'Glassware washed and racked; nothing piling up']]],
      host_amchk: [['Lunch check, around 2 PM', [
        'Walk every table, inside and patio: clear empties, wipe, and reset',
        'Spills and debris swept, inside and patio',
        'Water pitchers full: 2 at Bar, 1 at Host Stand',
        'Trash checked; take it out if it is over half full',
        RR.W, RR.M]]],
      bar_amoff: [['AM hand off, 3 to 4 PM', [
        'All AM tabs closed out or handed to the PM bartender',
        'Speed rail and back bar restocked. Note shortages',
        'Beer and wine restocked',
        'Garnishes refilled and dated',
        'Glassware washed, polished, and racked',
        'Bar top, rails, and mats wiped down',
        'Sanitizer buckets changed',
        'Empty bottles cleared; trash taken out',
        'Ice topped off',
        'Cash drawer counted and handed to the PM bartender',
        'Note left for the PM team: what ran low, what is 86\u2019d, anything broken']]],
      host_amoff: [['AM hand off, 3 to 4 PM', [
        'Every table cleared, wiped, and reset, inside and patio',
        'Spills and debris swept, inside and patio',
        'Silverware rolled and restocked at all stations',
        'Plates restocked',
        'Napkins restocked in the expo window',
        'To go boxes and paper goods restocked',
        'Water pitchers refilled: 2 at Bar, 1 at Host Stand',
        'Beer and soda fridge restocked from the storage fridge',
        RR.W, RR.M,
        'Dirty dishes on the cart; the kitchen handles them from there',
        'Trash taken out and a new bag put in (code 0818)']]],
      bar_pmon: [['PM takeover, 4 PM', [
        'Read the note from the AM team',
        'Cash drawer counted and signed in',
        'Liquor, beer, and wine stock checked against par. Note any shortages',
        'Margarita batch checked. Batch more if it is under half',
        'Garnishes checked and refilled (citrus, salted glasses)',
        'Printer paper checked: Expo and Bar',
        'Lights set to red, TVs on the evening lineup, music playing',
        'Grab a handheld (put another on to charge)']]],
      host_pmon: [['PM takeover, 4 PM', [
        'Walk every table, inside and patio: fix anything that is not reset',
        'Evening lights on: candle, tower light, marble lamp, tall lights on the tables',
        'Ashtrays out and emptied',
        'Reservations and waitlist checked for tonight',
        'Both restrooms: quick look',
        'Water pitchers full: 2 at Bar, 1 at Host Stand']]]
    };
    var EVE_IDS = ['host_open_0_0', 'host_open_0_1', 'host_open_0_6', 'host_open_0_8'];   /* candle, tower light, marble lamps, tall lights: evening, so not on the AM open */
    var SPEAKER = 'Turn on the speaker and make sure it is plugged in, on top of the tower lamp';
    var TEXT = { host_open_0_6: 'Turn on both marble lamps next to the host stand, by the entrance' };
    var DROP = ['host_open_0_4', 'host_open_3_2'];
    var NOTE = 'Phones away. No sitting or eating on the floor or at the bar.';
    var HOST_SECS = [
      ['Host stand', ['host_open_0_0', 'host_open_0_6', 'host_open_2_1', 'host_open_0_11', 'host_open_2_3', 'host_open_2_4', 'host_open_1_3']],
      ['Main restaurant', ['host_open_0_1', 'host_open_9_0', 'host_open_0_5', 'host_open_0_8', 'host_open_0_3', 'host_open_0_7', 'host_open_0_9', 'host_open_1_0', 'host_open_2_0', 'host_open_2_2', 'host_open_3_1', 'host_open_1_2', 'host_open_3_0', 'host_open_0_10', 'host_open_1_1']],
      ['Outside', ['host_open_0_12', 'host_open_0_13', 'host_open_0_2']]];
    var SP = {
      'Lunch check, around 2 PM': 'Revisi\u00f3n del almuerzo, como a las 2 PM', 'AM hand off, 3 to 4 PM': 'Entrega del turno AM, 3 a 4 PM', 'PM takeover, 4 PM': 'Relevo del turno PM, 4 PM',
      'Opening set-up': 'Preparaci\u00f3n de apertura', 'Floor and restock, shared with the busser': 'Piso y surtido, compartido con el busser', 'Shared with the busser': 'Compartido con el busser', 'From the floor list': 'De la lista del piso', 'Before doors open': 'Antes de abrir',
      'Clear dishes and place them on the cart (the kitchen washes them)': 'Recoge los platos y ponlos en el carrito (la cocina los lava)', 'Bar lights, TVs/A-V and music off': 'Luces del bar, TVs/A-V y m\u00fasica apagadas',
      'Host stand': 'Puesto de anfitri\u00f3n', 'Main restaurant': 'Restaurante', 'Outside': 'Afuera',
      'Turn on both marble lamps next to the host stand, by the entrance': 'Prende las dos l\u00e1mparas de m\u00e1rmol junto al puesto de anfitri\u00f3n, en la entrada',
      'Turn on the speaker and make sure it is plugged in, on top of the tower lamp': 'Prende la bocina y revisa que est\u00e9 conectada, encima de la l\u00e1mpara de torre',
      'Phones away. No sitting or eating on the floor or at the bar.': 'Nada de tel\u00e9fonos. No sentarse ni comer en el piso ni en la barra.',
      'Expo window': 'Ventana de expo', 'Expo window during service': 'Ventana de expo durante el servicio', 'Expo window at close': 'Ventana de expo al cerrar',
      'Garnishes checked and refilled': 'Guarniciones revisadas y rellenadas', 'Ice wells topped off': 'Pozos de hielo rellenados', 'Glassware washed and racked; nothing piling up': 'Vasos lavados y en rejillas; que nada se acumule',
      'Trash checked; take it out if it is over half full': 'Basura revisada; s\u00e1cala si est\u00e1 a m\u00e1s de la mitad', 'Both restrooms: quick look': 'Los dos ba\u00f1os: un vistazo',
      'All AM tabs closed out or handed to the PM bartender': 'Todas las cuentas del AM cerradas o entregadas al bartender del PM', 'Speed rail and back bar restocked. Note shortages': 'Riel y barra trasera surtidos. Anota faltantes',
      'Beer and wine restocked': 'Cerveza y vino surtidos', 'Garnishes refilled and dated': 'Guarniciones rellenadas y con fecha', 'Sanitizer buckets changed': 'Cubetas de sanitizante cambiadas',
      'Empty bottles cleared; trash taken out': 'Botellas vac\u00edas retiradas; basura sacada', 'Ice topped off': 'Hielo rellenado', 'Cash drawer counted and handed to the PM bartender': 'Caja contada y entregada al bartender del PM',
      'Note left for the PM team: what ran low, what is 86\u2019d, anything broken': 'Nota para el equipo PM: qu\u00e9 se acab\u00f3, qu\u00e9 est\u00e1 86 y qu\u00e9 se rompi\u00f3',
      'Every table cleared, wiped, and reset, inside and patio': 'Todas las mesas despejadas, limpias y montadas, adentro y patio', 'Spills and debris swept, inside and patio': 'Derrames y basura barridos, adentro y patio',
      'Water pitchers refilled: 2 at Bar, 1 at Host Stand': 'Jarras de agua llenas: 2 en la barra, 1 en el puesto de anfitri\u00f3n', 'Trash taken out and a new bag put in (code 0818)': 'Basura sacada y bolsa nueva (c\u00f3digo 0818)',
      'Read the note from the AM team': 'Lee la nota del equipo AM', 'Cash drawer counted and signed in': 'Caja contada y firmada',
      'Lights set to red, TVs on the evening lineup, music playing': 'Luces en rojo, TVs con la programaci\u00f3n de la noche, m\u00fasica puesta',
      'Walk every table, inside and patio: fix anything that is not reset': 'Recorre todas las mesas, adentro y patio: arregla lo que no est\u00e9 montado',
      'Evening lights on: candle, tower light, marble lamp, tall lights on the tables': 'Luces de la noche: vela, luz de torre, l\u00e1mpara de m\u00e1rmol, luces altas en las mesas',
      'Ashtrays out and emptied': 'Ceniceros afuera y vac\u00edos', 'Reservations and waitlist checked for tonight': 'Reservaciones y lista de espera revisadas para esta noche',
      'Water pitchers full: 2 at Bar, 1 at Host Stand': 'Jarras de agua llenas: 2 en la barra, 1 en el puesto de anfitri\u00f3n'
    };
    var ROLE_RE = { bar: /bartend/i, host: /bus|host|runner|expo/i };
    /* New lists from the staff review (Kassandra and Mikayla, Eric's calls, Nov 20 2026). Shown only with ?newlists in the link
       until Eric approves them for the crew. */
    var HL = function (x) { return x; }, WD = function (x) { return x; };   /* set to hostLayout and word once the board is up */
    var NEWL = /[?&]newlists\b/.test(location.search);
    /* Opening set-up goes to whoever opens first, by the schedule: the bartender when the busser starts later (or there is no
       busser), the busser when they start together or the busser is in first. */
    var FIRST_IN = ['host_open_0_6', 'host_open_0_1', 'host_open_9_0', 'host_open_0_5', 'host_open_0_8', 'host_open_0_3', 'host_open_0_12', 'host_open_0_13', 'host_open_0_2', 'host_open_2_4', 'host_open_1_3', 'bar_open_0_0'];
    var SHARE_MID = ['host_mid_0_0', 'host_mid_0_1', 'host_mid_0_2', 'host_mid_0_3', 'host_mid_1_2', 'host_mid_3_1'];
    var TO_BAR_CLOSE = ['host_close_0_15', 'host_close_0_18'], OFF_HOST_CLOSE = ['host_close_0_15', 'host_close_0_18', 'host_close_0_19', 'host_close_0_20'];
    var DISH = 'Clear dishes and place them on the cart (the kitchen washes them)';
    var RETXT = { host_mid_3_1: DISH, host_amoff_0_10: DISH, bar_close_4_1: 'Bar lights, TVs/A-V and music off' };
    function opener(d) {
      var two = amDay(d), sh = vic(d).filter(function (w) { return !two || mins(w.start) < AM_BEFORE; });
      var first = function (re) { return sh.filter(function (w) { return re.test(w.role || ''); }).sort(function (a, b) { return mins(a.start) - mins(b.start); })[0] || null; };
      var b = first(ROLE_RE.bar), h = first(/bus|host|runner/i);
      if (!b && !h) return null;
      return { who: b && (!h || mins(b.start) < mins(h.start)) ? 'bar' : 'host', b: b, h: h };
    }
    function retext(i) { return RETXT[i[0]] ? [i[0], WD(RETXT[i[0]])].concat(i.slice(2)) : i; }
    function newLists(key, d, out, s0) {
      var two = amDay(d), pool = {};
      var grab = function (k) { (k === 'host_open' ? HL(s0(k, d)) : s0(k, d)).forEach(function (s) { s[1].forEach(function (i) { pool[i[0]] = i; }); }); };
      var pick = function (ids) { return ids.map(function (id) { return pool[id]; }).filter(Boolean).map(retext); };
      var strip = function (ids) { return out.map(function (s) { return [s[0], s[1].filter(function (i) { return ids.indexOf(i[0]) < 0; })].concat(s.slice(2)); }).filter(function (s) { return s[1].length; }); };
      out = out.map(function (s) { return [s[0], s[1].map(retext)].concat(s.slice(2)); });
      if (key === 'host_open' || key === 'bar_open') {
        grab('host_open'); grab('bar_open');
        var op = opener(d), mine = op && op.who === (key === 'bar_open' ? 'bar' : 'host');
        var ids = FIRST_IN.filter(function (id) { return !(two && EVE_IDS.indexOf(id) >= 0); });
        out = strip(FIRST_IN.concat(key === 'host_open' ? ['host_open_2_1'] : []));
        if (key === 'bar_open') { var bd = out.filter(function (s) { return s[1].some(function (i) { return /^bar_open_3_/.test(i[0]); }); })[0]; var w = pick(['host_open_2_1']); if (bd) bd[1] = bd[1].concat(w); else out.push([WD('Before doors open'), w]); }
        if (mine || !op && key === 'host_open') out.unshift([WD('Opening set-up'), pick(ids)]);
        return out;
      }
      if (key === 'bar_mid') { grab('host_mid'); out.push([WD('Floor and restock, shared with the busser'), pick(SHARE_MID)]); return out; }
      if (key === 'bar_amoff') { grab('host_amoff'); out.push([WD('Shared with the busser'), pick(['host_amoff_0_10'])]); return out; }
      if (key === 'host_close') return strip(OFF_HOST_CLOSE);
      if (key === 'bar_close') { grab('host_close'); var fw = out.filter(function (s) { return s[1].some(function (i) { return /^bar_close_4_/.test(i[0]); }); })[0]; var m = pick(TO_BAR_CLOSE); if (fw) fw[1] = fw[1].concat(m); else out.push([WD('From the floor list'), m]); return out; }
      return out;
    }
    /* The note under the open lists that says who has the opening set-up today and why. */
    function openerNote(key, d) {
      var op = opener(d); if (!op) return '';
      var fn = function (w) { return w ? first(w.name) : ''; }, at = function (w) { return w ? String(w.start).replace(':00', '') : ''; };
      var bar = key === 'bar_open';
      if (op.who === 'bar') {
        if (!op.h) return bar ? tt('No busser on the schedule, so the opening set-up is yours.', 'No hay busser en el horario; la preparaci\u00f3n de apertura es tuya.') : tt('No busser on the schedule; the bartender has the opening set-up.', 'No hay busser en el horario; el bartender hace la preparaci\u00f3n de apertura.');
        return bar ? tt('Opening set-up moved to you: ' + fn(op.h) + ' (busser) starts at ' + at(op.h) + ', after you (' + at(op.b) + ').', 'La preparaci\u00f3n de apertura pas\u00f3 a ti: ' + fn(op.h) + ' (busser) entra a las ' + at(op.h) + ', despu\u00e9s de ti (' + at(op.b) + ').')
          : tt('Opening set-up is on the bartender\u2019s list today: ' + fn(op.b) + ' starts at ' + at(op.b) + ', before you (' + at(op.h) + ').', 'La preparaci\u00f3n de apertura est\u00e1 en la lista del bartender hoy: ' + fn(op.b) + ' entra a las ' + at(op.b) + ', antes que t\u00fa (' + at(op.h) + ').');
      }
      if (!op.b) return bar ? '' : tt('Opening set-up is yours today.', 'La preparaci\u00f3n de apertura es tuya hoy.');
      var same = mins(op.b.start) === mins(op.h.start);
      return bar ? tt('Opening set-up is on the busser\u2019s list today: ' + fn(op.h) + (same ? ' starts with you at ' + at(op.h) + '.' : ' starts at ' + at(op.h) + ', before you.'), 'La preparaci\u00f3n de apertura est\u00e1 en la lista del busser hoy: ' + fn(op.h) + (same ? ' entra contigo a las ' + at(op.h) + '.' : ' entra a las ' + at(op.h) + ', antes que t\u00fa.'))
        : tt('Opening set-up is yours today: ' + (same ? 'you and ' + fn(op.b) + ' both start at ' + at(op.h) + '.' : 'you start at ' + at(op.h) + ', before ' + fn(op.b) + ' (' + at(op.b) + ').'), 'La preparaci\u00f3n de apertura es tuya hoy: ' + (same ? 't\u00fa y ' + fn(op.b) + ' entran a las ' + at(op.h) + '.' : 'entras a las ' + at(op.h) + ', antes que ' + fn(op.b) + ' (' + at(op.b) + ').'));
    }
    /* Who works each role, AM (starts before 3 PM) or PM, from the schedule. */
    function crew(d, r, am) { return vic(d).filter(function (w) { return ROLE_RE[r].test(w.role || '') && (mins(w.start) < AM_BEFORE) === am; }).map(function (w) { return w.name; }); }
    function names(d, r, am) { var n = crew(d, r, am).map(function (x) { return first(x); }); return n.length ? ' \u00b7 ' + n.join(', ') : ''; }
    function fready() {
      return typeof LISTS === 'object' && LISTS && LISTS.bar_open && LISTS.expo_svc && typeof sections === 'function' && typeof listCard === 'function' && typeof listRow === 'function' &&
        typeof shiftsOn === 'function' && typeof mins === 'function' && typeof ROLES === 'object' && typeof render === 'function' && typeof S !== 'undefined' && typeof iso === 'function' && typeof whoName === 'function' && typeof first === 'function';
    }
    (function start() {
      if (!fready()) return setTimeout(start, 150);
      Object.keys(NEW).forEach(function (k) { if (!LISTS[k]) LISTS[k] = NEW[k]; });
      if (typeof ES === 'object' && ES) Object.keys(SP).forEach(function (k) { if (ES[k] == null) ES[k] = SP[k]; });
      var s0 = sections;
      /* Host / Busser open, laid out by area (Eric, Nov 19 2026): Host stand first, then Main restaurant (trash last), then
         Outside. Items keep their ids, so ticks saved before stay with them. The A-frame is gone; "phones away" is a note under
         the list, not a box. Anything else on the list that night (a special event, Expo on two-shift days) follows as it was. */
      function hostLayout(secs) {
        var by = {}; secs.forEach(function (s) { s[1].forEach(function (i) { by[i[0]] = i; }); });
        var used = {};
        var pick = function (ids) { return ids.map(function (id) { if (id === 'host_open_9_0') { used[id] = 1; return [id, word(SPEAKER)]; } var i = by[id]; if (!i) return null; used[id] = 1; return TEXT[id] ? [id, word(TEXT[id])].concat(i.slice(2)) : i; }).filter(Boolean); };
        var out = HOST_SECS.map(function (s) { return [word(s[0]), pick(s[1])]; }).filter(function (s) { return s[1].length; });
        DROP.forEach(function (id) { used[id] = 1; });
        secs.forEach(function (s) { var rest = s[1].filter(function (i) { return !used[i[0]]; }); if (rest.length) out.push([s[0], rest].concat(s.slice(2))); });
        return out;
      }
      HL = hostLayout; WD = word;
      var expoSecs = function (d) { return s0('expo_svc', d); };
      sections = function (key, d) {
        if (NEW[key] && !amDay(d)) return [];
        var two = amDay(d);
        if (key === 'expo_svc' && two) return [];
        var out = s0(key, d);
        if (key === 'host_open') out = hostLayout(out);
        if (NEWL) out = newLists(key, d, out, s0);
        if (!two) return out;
        if (key === 'host_open') out = out.map(function (s) { return [s[0], s[1].filter(function (i) { return EVE_IDS.indexOf(i[0]) < 0; })].concat(s.slice(2)); }).filter(function (s) { return s[1].length; });
        /* Expo on a two-shift day: the window set-up goes on the AM busser's open, service on the PM evening check, the rest on the close. */
        var ex = expoSecs(d);
        if (key === 'host_open' && ex[0]) out = out.concat([['Expo window', ex[0][1]]]);
        if (key === 'host_mid' && ex[1]) out = out.concat([['Expo window during service', ex[1][1]]]);
        if (key === 'host_close' && ex[2]) out = out.concat([['Expo window at close', ex[2][1]]]);
        return out;
      };
      sections.__drop = sections.__ev = true;
      function wrap(fn) {
        return function (key, title, d, done) {
          if (key === 'expo_svc' && amDay(d)) return '';
          var m = /^(bar|host)_(open|mid|close)$/.exec(key);
          if (!m || !amDay(d)) return fn(key, title, d, done);
          var r = m[1], n = ROLES[r] || title;
          if (m[2] === 'mid') return fn(key, 'PM: ' + n + tt(' evening check', ' revisi\u00f3n de la noche') + names(d, r, false), d, done);
          if (m[2] === 'close') return fn(key, 'PM: ' + n + tt(' close', ' cierre') + names(d, r, false), d, done);
          var amN = names(d, r, true), pmN = names(d, r, false);
          var a = fn(key, 'AM: ' + n + tt(' open', ' apertura') + amN, d, done),
            l = fn(r + '_amchk', 'AM: ' + n + tt(' lunch check', ' revisi\u00f3n del almuerzo') + amN, d, done),
            b = fn(r + '_amoff', 'AM: ' + n + tt(' hand off', ' entrega') + amN, d, done),
            c = fn(r + '_pmon', 'PM: ' + n + tt(' takeover', ' relevo') + pmN, d, done);
          return pmNow(d) ? c + a + l + b : a + l + b + c;
        };
      }
      listCard = wrap(listCard); listRow = wrap(listRow);
      /* The hand off is two-sided. Checked on window, before the board and the sign-in add-on save the tick. Everyone signed
         in on this device could be the one ticking (the add-on asks when there are several), so a tick is stopped only when
         none of them is allowed to make it. */
      function devNames() {
        try { var x = JSON.parse(localStorage.getItem('vicio_foh_names') || 'null'); if (x && Array.isArray(x.names) && x.names.length) return x.names; } catch (err) {}
        var n = whoName(); return n ? [n] : [];
      }
      window.addEventListener('change', function (e) {
        var t = e.target; if (!t || !t.dataset || !t.dataset.chk || !t.checked) return;
        var p = t.dataset.chk.split('|'), path = p[0], id = p[1], m = /^(bar|host)_(amoff|pmon)_/.exec(id); if (!m || path.indexOf('shifts/') !== 0) return;
        var d = path.slice(7), r = m[1], ppl = devNames(), by = (S.shift && S.shift.by) || {};
        var block = function (msg) { e.stopImmediatePropagation(); e.preventDefault(); t.checked = false; flash(msg); };
        if (!ppl.length) return block(tt('Sign in with your name first. The hand off needs both names.', 'Primero pon tu nombre. La entrega necesita los dos nombres.'));
        if (m[2] === 'pmon') {
          var handers = Object.keys(by).filter(function (k) { return k.indexOf(r + '_amoff_') === 0 && by[k]; }).map(function (k) { return by[k]; });
          if (ppl.every(function (n) { return handers.indexOf(n) >= 0; })) return block(tt('You signed the AM hand off, so the PM person has to tick the takeover. Have them sign in on this iPad.', 'T\u00fa firmaste la entrega del AM; la persona del PM tiene que marcar el relevo. Que ponga su nombre en este iPad.'));
        } else {
          var pm = crew(d, r, false), am = crew(d, r, true);
          if (ppl.every(function (n) { return pm.indexOf(n) >= 0 && am.indexOf(n) < 0; })) return block(tt('The AM crew signs the hand off. Your part is the PM takeover.', 'El equipo AM firma la entrega. Lo tuyo es el relevo del PM.'));
        }
      }, true);
      /* Host / Busser open: each area in its own outlined box, the area being worked on in red under the title, and a check-all
         mark on the list and on each area. Check-all asks first ("Are you sure? Eric is going to check."); a second tap within 5
         seconds ticks everything still open there under the signed-in name, and records that it was done all at once. */
      var armed = null;
      function hostCards() { return document.querySelectorAll('#view details[data-fold^="host_open_"]'); }
      function word(x) { return es() && SP[x] ? SP[x] : x; }
      function decorate() {
        var d = ui.date || iso(new Date()), done = (S.shift && S.shift.done) || {}, secs = sections('host_open', d);
        if (NEWL) document.querySelectorAll('#view details[data-fold^="host_open_"], #view details[data-fold^="bar_open_"]').forEach(function (card) {
          if (card.querySelector('.x-finote')) return;
          var n = openerNote(/^bar_open_/.test(card.dataset.fold) ? 'bar_open' : 'host_open', d); if (!n) return;
          var sum = card.querySelector('summary'); if (sum) sum.insertAdjacentHTML('afterend', '<p class="x-finote">' + hx(n) + '</p>');
        });
        hostCards().forEach(function (card) {
          if (card.querySelector('.x-hsec')) return;
          var body = card, kids = Array.prototype.slice.call(card.children), si = -1, box = null;
          kids.forEach(function (el) {
            if (el.tagName === 'P' && el.classList.contains('grp')) {
              si++; box = document.createElement('div'); var s = secs[si] || ['', []], left = s[1].filter(function (i) { return !done[i[0]]; }).length;
              box.className = 'x-hsec' + (left ? '' : ' ok'); box.dataset.sec = si; el.parentNode.insertBefore(box, el); box.appendChild(el);
              if (left) el.insertAdjacentHTML('beforeend', '<button type="button" class="x-all" data-hall="sec:' + si + '" aria-label="' + hx(tt('Check all in ', 'Marcar todo en ') + s[0]) + '">' + allLbl('sec:' + si) + '</button>');
            } else if (box && el.tagName === 'UL') box.appendChild(el);
          });
          var cur = secs.filter(function (s) { return s[1].some(function (i) { return !done[i[0]]; }); })[0];
          var h3 = card.querySelector('summary h3');
          if (h3 && !card.querySelector('.x-hcur')) {
            h3.insertAdjacentHTML('beforeend', '<span class="x-hcur">' + hx(cur ? cur[0] : tt('All done', 'Todo listo')) + '</span>');
            if (cur) { var head = card.querySelector('summary .cardhead'); if (head) head.insertAdjacentHTML('beforeend', '<button type="button" class="x-all" data-hall="all" aria-label="' + tt('Check all', 'Marcar todo') + '">' + allLbl('all') + '</button>'); }
          }
          if (!card.querySelector('.x-hnote')) card.insertAdjacentHTML('beforeend', '<p class="x-hnote">' + hx(word(NOTE)) + '</p>');
        });
      }
      function allLbl(scope) { return armed && armed.scope === scope ? hx(tt('Are you sure? Eric is going to check.', '\u00bfSeguro? Eric lo va a revisar.')) : '\u2713 ' + tt('All', 'Todo'); }
      document.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('[data-hall]'); if (!b) return;
        e.preventDefault(); e.stopPropagation();
        var scope = b.dataset.hall, d = ui.date || iso(new Date());
        if (!armed || armed.scope !== scope) { armed = { scope: scope, at: Date.now() }; b.innerHTML = allLbl(scope); b.classList.add('armed'); setTimeout(function () { if (armed && armed.scope === scope && Date.now() - armed.at >= 4900) { armed = null; render(); } }, 5000); return; }
        armed = null;
        var me = whoName(); if (!me) { flash(tt('Sign in with your name first.', 'Primero pon tu nombre.')); render(); return; }
        var secs = sections('host_open', d), done = (S.shift && S.shift.done) || {};
        var its = scope === 'all' ? secs.flatMap(function (s) { return s[1]; }) : ((secs[+scope.slice(4)] || [])[1] || []);
        var ids = its.map(function (i) { return i[0]; }).filter(function (id) { return !done[id]; }); if (!ids.length) { render(); return; }
        var patch = { done: {}, by: {}, bulk: {} }; ids.forEach(function (id) { patch.done[id] = true; patch.by[id] = me; });
        patch.bulk['host_open:' + (scope === 'all' ? 'all' : (secs[+scope.slice(4)] || [''])[0])] = { at: Date.now(), by: me, n: ids.length };
        S.shift = Object.assign({}, S.shift, { done: Object.assign({}, S.shift.done, patch.done), by: Object.assign({}, S.shift.by, patch.by), bulk: Object.assign({}, S.shift.bulk, patch.bulk) });
        save('shifts/' + d, patch);
        try { markListDone('shifts/' + d, ids[ids.length - 1], true); } catch (err) {}
        render();
      }, true);
      style('.x-hsec{border:2px solid var(--cherry,#8B1E1E);border-radius:12px;padding:6px 12px 10px;margin:10px 0}.x-hsec.ok{border-color:var(--line,#ccc);opacity:.85}.x-hsec .grp{margin-top:4px;display:flex;align-items:center;gap:10px}' +
        '.x-hcur{display:block;color:var(--cherry,#8B1E1E);font:700 15px/1.3 system-ui,-apple-system,sans-serif;margin-top:3px;text-transform:none;letter-spacing:0}' +
        '.x-all{margin-left:auto;min-height:36px;padding:4px 12px;border-radius:999px;border:1.5px solid var(--cherry,#8B1E1E);background:transparent;color:var(--cherry,#8B1E1E);font:700 13px system-ui,-apple-system,sans-serif;cursor:pointer;white-space:nowrap}' +
        '.x-finote{margin:6px 2px 8px;padding:8px 12px;border-left:4px solid #1F6FEB;background:rgba(31,111,235,.08);border-radius:8px;font-size:14px;line-height:1.4;color:var(--ink,#18181B)}' +
        '.x-all.armed,.x-all:active{background:var(--cherry,#8B1E1E);color:#fff}summary .cardhead{flex-wrap:wrap}.x-hnote{margin:6px 2px 2px;color:var(--muted,#666);font-size:14px;font-style:italic}');
      var r0 = render;
      render = function () { r0.apply(this, arguments); try { decorate(); } catch (err) {} };
      window.VicioAM = { amDay: amDay, crew: crew, hostLayout: hostLayout };
      render();
      /* The order flips at 4 PM; redraw once a minute when nobody is typing. */
      setInterval(function () { var a = document.activeElement; if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return; if (amDay(iso(new Date()))) { try { render(); } catch (e) {} } }, 60000);
    })();
    return;
  }

  /* ---------- BOH ---------- */
  var RESET = [
    'Line wiped down and sanitized',
    'Line restocked from the walk-in for the evening',
    'Everything open covered, labeled, and dated',
    'Prep levels checked; anything low started or written down for 5 PM',
    'Fryer oil skimmed and checked',
    'Dishes run and the dish area clear',
    'Floor swept; trash out if it is over half full'];
  var RSP = { 'Line wiped down and sanitized': 'L\u00ednea limpia y sanitizada', 'Line restocked from the walk-in for the evening': 'L\u00ednea surtida del walk-in para la noche',
    'Everything open covered, labeled, and dated': 'Todo lo abierto tapado, etiquetado y con fecha', 'Prep levels checked; anything low started or written down for 5 PM': 'Niveles de prep revisados; lo que est\u00e9 bajo, empezarlo o anotarlo para las 5 PM',
    'Fryer oil skimmed and checked': 'Aceite de la freidora limpio y revisado', 'Dishes run and the dish area clear': 'Platos lavados y el \u00e1rea de lavado libre', 'Floor swept; trash out if it is over half full': 'Piso barrido; basura afuera si est\u00e1 a m\u00e1s de la mitad',
    'Afternoon reset, before the 4 PM break': 'Reinicio de la tarde, antes del descanso de las 4 PM', 'Dishes': 'Platos',
    'Wash the dishes from the cart (the floor and bar clear them onto it)': 'Lava los platos del carrito (el piso y la barra los ponen ah\u00ed)' };
  function kready() { return typeof render === 'function' && typeof S !== 'undefined' && typeof ui !== 'undefined' && typeof shiftsOn === 'function' && typeof mins === 'function' && typeof fold === 'function' && typeof checklist === 'function' && typeof progress === 'function' && typeof iso === 'function'; }
  function kword(x) { return es() && RSP[x] ? RSP[x] : x; }
  var KNEWL = /[?&]newlists\b/.test(location.search);
  function kdecorate() {
    var mid0 = document.querySelector('#view details[data-fold="midlist"]');
    if (KNEWL && mid0 && !document.querySelector('#view details[data-fold="dishlist"]')) {
      var dd = ui.date || iso(new Date()), dn = (S.shift && S.shift.done) || {}, it = [['kd_0', kword('Wash the dishes from the cart (the floor and bar clear them onto it)')]], cc = dn.kd_0 ? 1 : 0;
      mid0.insertAdjacentHTML('afterend', fold('dishlist', hx(kword('Dishes')), cc + ' of 1', checklist('shifts/' + dd, it, dn), cc ? ' done' : ' edge'));
    }
    var mid = document.querySelector('#view details[data-fold="midlist"]');
    if (!mid || document.querySelector('#view details[data-fold="resetlist"]')) return;
    var d = ui.date || iso(new Date());
    if (!amDay(d)) return;
    var done = (S.shift && S.shift.done) || {}, items = RESET.map(function (x, i) { return ['rl_' + i, kword(x)]; }), c = items.filter(function (x) { return done[x[0]]; }).length;
    var cook = vic(d).filter(function (w) { return /cook|chef|kitchen|prep/i.test(w.role || ''); }).map(function (w) { return first(w.name); });
    cook = cook.filter(function (n, i) { return cook.indexOf(n) === i; });
    mid.insertAdjacentHTML('afterend', fold('resetlist', hx(kword('Afternoon reset, before the 4 PM break')) + (cook.length ? ' \u00b7 ' + hx(cook.join(', ')) : ''), c + ' of ' + items.length, progress(Math.round(100 * c / items.length)) + checklist('shifts/' + d, items, done), c < items.length ? ' edge' : ' done'));
  }
  function first(n) { return String(n || '').trim().split(/\s+/)[0]; }
  (function kstart() {
    if (!kready()) return setTimeout(kstart, 150);
    var r0 = render;
    render = function () { r0.apply(this, arguments); try { kdecorate(); } catch (e) {} };
    window.VicioAM = { amDay: amDay };
    render();
  })();
})();
