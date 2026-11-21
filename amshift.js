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
      'Restock silverware at all stations (roll if needed)': 'Surtir cubiertos en todas las estaciones (enrollar si hace falta)', 'Roll silverware': 'Enrollar cubiertos', 'Bring in signs': 'Meter los letreros',
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
    /* New lists from the staff review (Kassandra and Mikayla, Eric's calls, Nov 20 2026). Approved by Eric and live Nov 20 2026. */
    var HL = function (x) { return x; }, WD = function (x) { return x; };   /* set to hostLayout and word once the board is up */
    var NEWL = !/[?&]oldlists\b/.test(location.search);   /* live for the crew since Nov 20 2026 (Eric); ?oldlists shows the lists as they were */
    /* Opening set-up goes to whoever opens first, by the schedule: the bartender when the busser starts later (or there is no
       busser), the busser when they start together or the busser is in first. */
    var FIRST_IN = ['host_open_0_6', 'host_open_0_1', 'host_open_9_0', 'host_open_0_5', 'host_open_0_8', 'host_open_0_3', 'host_open_0_12', 'host_open_0_13', 'host_open_0_2', 'host_open_2_4', 'host_open_1_3', 'bar_open_0_0'];
    var SHARE_MID = ['host_mid_0_0', 'host_mid_0_1', 'host_mid_0_2', 'host_mid_0_3', 'host_mid_1_2', 'host_mid_3_1'];
    var TO_BAR_CLOSE = ['host_close_0_15', 'host_close_0_18'], OFF_HOST_CLOSE = ['host_close_0_15', 'host_close_0_18', 'host_close_0_19', 'host_close_0_20'];
    var DISH = 'Clear dishes and place them on the cart (the kitchen washes them)';
    /* Silverware is only rolled, not washed, and the speaker stays inside (Eric, Nov 20 2026). */
    var RETXT = { host_mid_3_1: DISH, host_amoff_0_10: DISH, bar_close_4_1: 'Bar lights, TVs/A-V and music off', host_open_2_0: 'Restock silverware at all stations (roll if needed)', host_close_0_7: 'Roll silverware', host_close_0_4: 'Bring in signs' };
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
    /* Bar specs from the bartenders' handwritten tickets (Eric, Nov 20 2026). Only drinks with no spec yet, or not on the
       Drinks page at all; where a ticket disagrees with a spec already on the board, the board's spec stays until Eric says. */
    function barSpecs() {
      if (typeof DRINKS === 'undefined' || !Array.isArray(DRINKS) || DRINKS.__tickets) return;
      DRINKS.__tickets = true;
      var note = 'From the bar\u2019s handwritten spec tickets, Nov 2026.';
      DRINKS.forEach(function (d) {
        if (d.id === 'tequila_lemon_drop' && !d.spec) Object.assign(d, { build: [['1 oz', 'Tequila'], ['0.25 oz', 'Triple sec'], ['0.5 oz', 'Lemon juice'], ['0.5 oz', 'Simple syrup']], notes: [note], spec: true });
      });
      if (!DRINKS.some(function (d) { return d.id === 'la_culona'; }))
        DRINKS.push({ id: 'la_culona', name: 'La Culona', group: 'Cocktails', price: '', menu: 'Rum, limoncello, prickly pear, orange liqueur, coconut, habanero bitters', glass: '', ice: '',
          build: [['1 oz', 'Bacardi'], ['1 oz', 'Limoncello'], ['0.5 oz', 'Prickly pear'], ['0.5 oz', 'Triple sec'], ['0.25 oz', 'Coconut'], ['2 dashes', 'Habanero bitters']],
          method: '', rim: '', garnish: '', notes: [note, 'Price, glass and method not on the ticket yet.'], warn: 'Spicy: habanero bitters.', spec: true });
    }
    (function start() {
      if (!fready()) return setTimeout(start, 150);
      try { barSpecs(); } catch (err) {}
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
      /* Bartender view (Eric, Nov 20 2026): FOH views are Checklists · Host · Expo · Bartender. The Bartender screen shows who is
         on the bar, online orders, the bartender's lists for today (shift lists on Friday and Saturday), the 86 list and a way into
         the drink specs. Like Expo, each iPad remembers it is the bar iPad, so the evening switch lands on Bartender. */
      var BAR_KEY = 'vicio_foh_svcrole';
      function barWho() {
        var nm = (function () { try { var x = JSON.parse(localStorage.getItem('vicio_foh_names') || 'null'); if (x && x.date === svcDate() && Array.isArray(x.names)) return x.names; } catch (err) {} var w = whoName(); return w ? [w] : []; })();
        var ppl = (typeof stPeople === 'function' ? stPeople() : []).filter(function (p) { return nm.indexOf(p.name) < 0; });
        return '<section class="card x-signin x-compact x-expowho"><div class="x-row"><b class="x-lbl">' + tt('On the bar', 'En la barra') + '</b>' +
          nm.map(function (n) { return '<span class="x-tag">' + hx(n) + '<button type="button" class="btn x" data-fwho="rm" data-name="' + hx(n) + '" aria-label="' + tt('Remove', 'Quitar') + ' ' + hx(n) + '">\u00d7</button></span>'; }).join('') +
          '<select data-fwho-sel="1" aria-label="' + tt('Add someone on the bar', 'Agregar a alguien en la barra') + '"><option value="">' + (nm.length ? tt('Add someone\u2026', 'Agregar a alguien\u2026') : tt('Pick your name\u2026', 'Elige tu nombre\u2026')) + '</option>' +
          ppl.map(function (p) { return '<option value="' + hx(p.name) + '">' + hx(p.name) + '</option>'; }).join('') + '<option value="__other">' + tt('Someone else\u2026', 'Otra persona\u2026') + '</option></select>' +
          '<input type="text" id="fwho-txt" class="x-other" placeholder="' + tt('Name', 'Nombre') + '" autocomplete="off" hidden><button type="button" class="btn primary x-other" data-fwho="in" hidden>' + tt('Add', 'Agregar') + '</button></div></section>';
      }
      function barView() {
        var d = ui.date, done = (S.shift && S.shift.done) || {};
        var lists = ['bar_open', 'bar_mid', 'bar_close'].map(function (k) { return listCard(k, ROLES.bar + ' ' + ({ bar_open: tt('open', 'apertura'), bar_mid: tt('mid shift', 'medio turno'), bar_close: tt('close', 'cierre') })[k], d, done); }).join('');
        return (typeof dateBar === 'function' ? dateBar('') : '') + barWho() +
          '<div class="grid x-expotop"><section class="card svcorders" id="svc-orders"></section>' +
          '<section class="card"><div class="cardhead"><h3>' + tt('Drink specs', 'Recetas de bebidas') + '</h3></div><p class="status">' + tt('Pours, method and garnish for every drink.', 'Medidas, m\u00e9todo y garnish de cada bebida.') + '</p><button type="button" class="btn primary" data-barspecs="1">' + tt('Open drink specs', 'Abrir recetas') + '</button></section></div>' +
          lists + (typeof e86Card === 'function' ? e86Card() : '');
      }
      (function barMode() {
        if (typeof MODES === 'undefined' || !MODES.__split || !(VIEWS.today && /expoView/.test(String(VIEWS.today)))) return setTimeout(barMode, 200);
        if (MODES.__bar) return; MODES.__bar = true;
        MODES.push(['bar', tt('Bartender', 'Bartender')]);
        var sm1 = setMode; setMode = function (m) { var r = sm1(m); if (m === 'bar') { try { localStorage.setItem(BAR_KEY, 'bar'); } catch (err) {} ui.barView = true; } return r; };
        var cm1 = curMode; curMode = function () { var m = cm1(); var rl = ''; try { rl = localStorage.getItem(BAR_KEY) || ''; } catch (err) {} var ov = typeof modeOverride === 'function' ? modeOverride() : null; return m === 'service' && rl === 'bar' && ov !== 'service' ? 'bar' : m; };
        var t1 = VIEWS.today; VIEWS.today = function () { return ui.mode === 'bar' ? barView() : t1.apply(this, arguments); };
        document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-barspecs]'); if (!b) return; ui.barView = true; try { localStorage.setItem('vicio_foh_barview', '1'); } catch (err) {} ui.tab = 'drinks'; render(); });
        ui.mode = curMode(); if (ui.mode === 'bar') ui.barView = true;
        render();
      })();
      /* Reservations floor (Eric, Nov 20 2026): tap a table or stool to select it, tap it again to deselect. Several can be
         selected at once (B1, B2 and B3 for a party of 3 at the bar); the panel then sets status, party, guests, server and
         note on all of them together. The guest count is kept on the first one, so tonight's covers are not counted twice. */
      (function multiSeat() {
        if (typeof seatClick !== 'function' || typeof seatPanel !== 'function' || typeof tblHtml !== 'function' || typeof seatSet !== 'function') return setTimeout(multiSeat, 200);
        if (seatClick.__multi) return;
        ui.tMulti = ui.tMulti || [];
        var sc0 = seatClick, sp0 = seatPanel, th0 = tblHtml;
        var tbl = function (id) { return tables().find(function (x) { return x.id === id; }); };
        var sel = function () { return (ui.tMulti || []).filter(function (id) { return tbl(id); }); };
        seatClick = function (a, t) {
          if (a === 'tsel' && !ui.seatEdit && !ui.rvPick && !ui.wlPick) {
            if (Date.now() < ((typeof drag !== 'undefined' && drag.skipUntil) || 0)) return true;
            var id = t.dataset.id, cur = sel(), i = cur.indexOf(id);
            if (i >= 0) cur.splice(i, 1); else cur.push(id);
            ui.tMulti = cur; ui.tSel = cur.length ? cur[cur.length - 1] : null; ui.tDel = null; render(); return true;
          }
          if (a === 'tarea' || a === 'tedit') ui.tMulti = [];
          var ids = sel();
          if (/^tm/.test(a)) {
            var g = function (x) { return document.getElementById(x); };
            if (a === 'tmnone') { ui.tMulti = []; ui.tSel = null; render(); return true; }
            if (a === 'tmst') { var v = t.dataset.v; ids.forEach(function (id) { seatSet(id, v === 'open' ? { st: 'open', at: null } : { st: v, at: Date.now() }); }); render(); return true; }
            if (a === 'tmclear') { ids.forEach(function (id) { seatSet(id, { st: 'open', party: '', size: null, server: '', note: '', at: null }); }); render(); return true; }
            if (a === 'tmsave') {
              var sz = g('tm-size').value, names = ids.map(function (id) { return (tbl(id) || {}).n; }).join(', ');
              ids.forEach(function (id, k) {
                var p = { party: g('tm-party').value.trim(), size: k === 0 && sz !== '' ? Math.max(1, +sz) : null, server: g('tm-server').value, note: (g('tm-note').value.trim() + (ids.length > 1 ? ' (together: ' + names + ')' : '')).trim() };
                var st = tstate(id); if (!st.st || st.st === 'open') { p.st = 'seated'; p.at = Date.now(); }
                seatSet(id, p);
              });
              document.activeElement && document.activeElement.blur(); render(); return true;
            }
          }
          if (a === 'tsel') ui.tMulti = [t.dataset.id];
          return sc0(a, t);
        };
        seatClick.__multi = true;
        tblHtml = function (t) { var h = th0(t); return sel().indexOf(t.id) >= 0 && h.indexOf(' sel"') < 0 ? h.replace('class="tbl ', 'class="tbl sel ') : h; };
        seatPanel = function () {
          var ids = sel();
          if (ui.seatEdit || ids.length < 2) return sp0();
          var ts = ids.map(tbl), seats = ts.reduce(function (n, x) { return n + (+x.seats || 0); }, 0), st0 = tstate(ids[0]), servers = stPeople().filter(function (p) { return p.group !== 'Kitchen'; });
          var cur = ids.every(function (id) { return (tstate(id).st || 'open') === (st0.st || 'open'); }) ? (st0.st || 'open') : '';
          return '<section class="card edge"><div class="cardhead"><h3>' + hx(ts.map(function (x) { return x.n; }).join(' \u00b7 ')) + '</h3><span class="count">' + ids.length + tt(' selected \u00b7 ', ' seleccionadas \u00b7 ') + seats + tt(' seats', ' lugares') + '</span></div>' +
            '<p class="status">' + tt('Tap a table again to take it out of the group.', 'Toca una mesa otra vez para quitarla del grupo.') + '</p>' +
            '<div class="stbtns">' + TST.map(function (x) { return '<button class="btn ' + x[0] + (cur === x[0] ? ' on' : '') + '" data-act="tmst" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' +
            '<div class="fields"><label class="fld" for="tm-party">' + tt('Party name', 'Nombre') + '<input type="text" id="tm-party" value="' + hx(st0.party || '') + '" placeholder="' + tt('Name or reservation', 'Nombre o reservaci\u00f3n') + '" autocomplete="off" autocorrect="off"></label>' +
            '<label class="fld" for="tm-size">' + tt('Guests (whole party)', 'Personas (todo el grupo)') + '<input type="number" id="tm-size" min="1" max="60" value="' + hx(st0.size || '') + '" inputmode="numeric"></label>' +
            '<label class="fld" for="tm-server">' + tt('Server', 'Mesero') + '<select id="tm-server"><option value="">' + tt('None', 'Nadie') + '</option>' + servers.map(function (p) { return '<option' + (st0.server === p.name ? ' selected' : '') + '>' + hx(p.name) + '</option>'; }).join('') + '</select></label>' +
            '<label class="fld" for="tm-note">' + tt('Note', 'Nota') + '<input type="text" id="tm-note" value="' + hx(String(st0.note || '').replace(/\s*\(together: [^)]*\)$/, '')) + '" placeholder="' + tt('Birthday, high chair, allergy', 'Cumplea\u00f1os, silla alta, alergia') + '" autocomplete="off"></label></div>' +
            '<div class="nav"><button class="btn primary" data-act="tmsave">' + tt('Seat together', 'Sentar juntos') + '</button><button class="btn" data-act="tmclear">' + tt('Clear all', 'Limpiar todas') + '</button><button class="btn" data-act="tmnone">' + tt('Deselect all', 'Quitar selecci\u00f3n') + '</button></div></section>';
        };
        render();
      })();
      /* Training (Eric, Nov 20 2026): a Training button after Bartender opens the Training page, which now starts with two
         courses: our drinks and how to sell them, and our food and how to sell it. Item lists and quiz questions are built from
         the Drinks page and the Menu, so they stay current. The pizza story is Eric's own words. */
      (function training() {
        if (typeof TRACKS === 'undefined' || typeof TRACKQ === 'undefined' || typeof MENU === 'undefined' || typeof DRINKS === 'undefined' || typeof MODES === 'undefined' || !MODES.__bar) return setTimeout(training, 200);
        if (TRACKS.__sell) return; TRACKS.__sell = true;
        var mk = TRACKS.find(function (t) { return t.id === 'mustknow'; });
        if (mk) mk.material.forEach(function (m) { if (m[0] === 'Hours') { m[1] = 'Thursday 5 PM to midnight. Friday and Saturday noon to midnight. Sunday to Wednesday closed.'; m[3] = 'Jueves 5 PM a medianoche. Viernes y s\u00e1bado mediod\u00eda a medianoche. Domingo a mi\u00e9rcoles cerrado.'; } });
        var shuf = function (a) { return a.map(function (x) { return [Math.random(), x]; }).sort(function (x, y) { return x[0] - y[0]; }).map(function (x) { return x[1]; }); };
        function whatsIn(items, qEn, qEs) {
          return items.filter(function (x) { return x[1]; }).map(function (x) {
            var wrong = shuf(items.filter(function (y) { return y[1] && y[1] !== x[1]; })).slice(0, 3).map(function (y) { return y[1]; });
            return { en: [qEn.replace('{n}', x[0]), [x[1]].concat(wrong)], es: [qEs.replace('{n}', x[0]), [x[1]].concat(wrong)], key: 0 };
          });
        }
        /* Food */
        var food = MENU.filter(function (g) { return !/drink|beer|bar/i.test(g[0]); });
        var pies = food.filter(function (g) { return /pizza/i.test(g[0]); }).flatMap(function (g) { return g[2].map(function (i) { return [i[0], i[3]]; }); });
        var fMat = [
          ['Our pizza', 'Our pizza is built on a high quality Italian flour. We bake a focaccia: very light and airy. Because the dough is such high hydration, it doesn\u2019t feel heavy, even though it\u2019s thick. It is not like a Chicago style deep dish. We sell whole 8x10 pans, never slices.',
            'Nuestra pizza', 'Nuestra pizza est\u00e1 hecha con harina italiana de alta calidad. Horneamos una focaccia: muy ligera y aireada. Como la masa lleva mucha hidrataci\u00f3n, no se siente pesada aunque es gruesa. No es como una deep dish estilo Chicago. Vendemos charolas enteras de 8x10, nunca rebanadas.'],
          ['How to say it at the table', 'Lead with the crust: \u201cOur pizza is a focaccia made with Italian flour. It\u2019s thick, but it\u2019s light and airy, nothing like a Chicago deep dish.\u201d Then help them pick by what they like: a classic, something spicy, or one with no red sauce.',
            'C\u00f3mo decirlo en la mesa', 'Empieza con la masa: \u201cNuestra pizza es una focaccia hecha con harina italiana. Es gruesa, pero ligera y aireada, nada que ver con una deep dish de Chicago.\u201d Luego ay\u00fadales a escoger seg\u00fan lo que les gusta: una cl\u00e1sica, algo picante o una sin salsa roja.']
        ].concat(food.map(function (g) { return [g[0], g[2].map(function (i) { return i[0] + (i[1] ? ' (' + i[1] + ')' : '') + (i[3] ? ': ' + i[3] : ''); }).join('. ') + '.', g[0], g[2].map(function (i) { return i[0] + (i[1] ? ' (' + i[1] + ')' : '') + (i[3] ? ': ' + i[3] : ''); }).join('. ') + '.']; }));
        var fQuiz = [
          { en: ['What is our pizza crust?', ['A focaccia made with high quality Italian flour', 'A thin New York crust', 'A Chicago style deep dish', 'A Neapolitan crust']], es: ['\u00bfQu\u00e9 es la masa de nuestra pizza?', ['Una focaccia hecha con harina italiana de alta calidad', 'Una masa delgada estilo Nueva York', 'Una deep dish estilo Chicago', 'Una masa napolitana']], key: 0 },
          { en: ['Why doesn\u2019t our thick crust feel heavy?', ['The dough is high hydration, so it bakes light and airy', 'It is baked twice', 'It is made with whole wheat', 'It is fried']], es: ['\u00bfPor qu\u00e9 nuestra masa gruesa no se siente pesada?', ['La masa lleva mucha hidrataci\u00f3n, as\u00ed que sale ligera y aireada', 'Se hornea dos veces', 'Es de trigo integral', 'Es frita']], key: 0 },
          { en: ['A guest asks if it\u2019s like a Chicago deep dish. You say:', ['No. It\u2019s thick but light and airy: a focaccia, not a deep dish', 'Yes, it\u2019s the same thing', 'It\u2019s a thin crust', 'It\u2019s gluten free']], es: ['Un cliente pregunta si es como una deep dish de Chicago. T\u00fa dices:', ['No. Es gruesa pero ligera y aireada: una focaccia, no una deep dish', 'S\u00ed, es lo mismo', 'Es masa delgada', 'Es sin gluten']], key: 0 },
          { en: ['How do we sell pizza?', ['Whole 8x10 pans, never slices', 'By the slice', '12 inch rounds', 'Half pans only']], es: ['\u00bfC\u00f3mo vendemos la pizza?', ['Charolas enteras de 8x10, nunca rebanadas', 'Por rebanada', 'Redondas de 12 pulgadas', 'Solo medias charolas']], key: 0 }
        ].concat(whatsIn(pies, 'What is on the {n}?', '\u00bfQu\u00e9 lleva la {n}?'));
        /* Drinks */
        var DG = ['Margaritas', 'Cocktails', 'Shots', 'Mocktails'];
        var dk = DRINKS.filter(function (d) { return DG.indexOf(d.group) >= 0; });
        var dMat = [
          ['How to sell a drink', 'Offer a drink as soon as guests sit. Name one or two by what is in them, not just the name: \u201cOur Guava Goddess is tequila and mezcal with guava, Aperol, lime, grapefruit and muddled basil.\u201d For a guest who isn\u2019t drinking, offer a mocktail. If a drink is spicy, say so.',
            'C\u00f3mo vender una bebida', 'Ofrece una bebida en cuanto se sienten. Menciona una o dos por lo que llevan, no solo el nombre: \u201cNuestra Guava Goddess lleva tequila y mezcal con guayaba, Aperol, lim\u00f3n, toronja y albahaca machacada.\u201d Si el cliente no toma alcohol, ofrece un mocktail. Si una bebida es picante, d\u00edselo.']
        ].concat(DG.map(function (g) { var its = dk.filter(function (d) { return d.group === g; }); return [g, its.map(function (d) { return (d.name + (d.price ? ' (' + d.price + ')' : '') + (d.menu ? ': ' + d.menu : '') + (d.warn ? '. ' + d.warn : '')).replace(/\.+$/, ''); }).join('. ') + '.', g, its.map(function (d) { return (d.name + (d.price ? ' (' + d.price + ')' : '') + (d.menu ? ': ' + d.menu : '') + (d.warn ? '. ' + d.warn : '')).replace(/\.+$/, ''); }).join('. ') + '.']; }).filter(function (m) { return m[1] !== '.'; }));
        var spicy = dk.filter(function (d) { return /spicy/i.test(d.warn || ''); }), mild = dk.filter(function (d) { return !/spicy/i.test(d.warn || '') && d.group !== 'Mocktails'; });
        var dQuiz = [
          { en: ['What is our featured cocktail?', ['Guava Goddess', 'Mezcal Paloma', 'Vegas Bomb', 'Skinny Margarita']], es: ['\u00bfCu\u00e1l es nuestro c\u00f3ctel destacado?', ['Guava Goddess', 'Mezcal Paloma', 'Vegas Bomb', 'Skinny Margarita']], key: 0 },
          { en: ['A guest isn\u2019t drinking alcohol. What do you offer?', ['A mocktail, like Agua de Jamaica or the Prickly Pear', 'A Green Tea shot', 'A Skinny Margarita', 'Nothing']], es: ['Un cliente no toma alcohol. \u00bfQu\u00e9 le ofreces?', ['Un mocktail, como el Agua de Jamaica o el Prickly Pear', 'Un shot de Green Tea', 'Una Skinny Margarita', 'Nada']], key: 0 }
        ];
        if (spicy.length && mild.length >= 3) dQuiz.push({ en: ['Which of these drinks is spicy?', [spicy[0].name].concat(shuf(mild).slice(0, 3).map(function (d) { return d.name; }))], es: ['\u00bfCu\u00e1l de estas bebidas es picante?', [spicy[0].name].concat(shuf(mild).slice(0, 3).map(function (d) { return d.name; }))], key: 0 });
        dQuiz = dQuiz.concat(whatsIn(dk.map(function (d) { return [d.name, d.menu]; }), 'What is in the {n}?', '\u00bfQu\u00e9 lleva la {n}?'));
        var add = [
          { id: 'sell_drinks', name: ['Our drinks and how to sell them', 'Nuestras bebidas y c\u00f3mo venderlas'], who: 'Every FOH person', material: dMat, quiz: dQuiz, signoff: [] },
          { id: 'sell_food', name: ['Our food and how to sell it', 'Nuestra comida y c\u00f3mo venderla'], who: 'Every FOH person', material: fMat, quiz: fQuiz, signoff: [] }];
        add.reverse().forEach(function (t) {
          TRACKS.unshift(t);
          var conv = function (L) { return t.quiz.map(function (x) { var o = x[L][1]; return [x[L][0], o[x.key], o.filter(function (_, i) { return i !== x.key; })]; }); };
          TRACKQ['track_' + t.id] = { name: t.name[0], nameEs: t.name[1], q: conv('en'), qes: conv('es') };
        });
        MODES.push(['train', tt('Training', 'Entrenamiento')]);
        if (typeof SVC_TABS !== 'undefined' && SVC_TABS.indexOf('training') < 0) SVC_TABS.push('training');   /* so Training also opens during service */
        var sm2 = setMode; setMode = function (m) { if (m === 'train') { ui.tab = 'training'; ui.trk = null; return; } return sm2(m); };
        render();
      })();
      /* New cocktail menu, coming soon (Eric, Nov 20 2026): the next bar menu, from Eric's "Bar Menu and Cocktail Specs" (Nov 12),
         behind a button on the Drinks page. The current menu and its specs are not touched. Amounts the draft marked Check
         show a Check tag. Crossed-out drinks on the draft are left out. */
      var NM = [
        ['Clasicos', [
          ['Daiquiri', '$10', [['2 oz', 'Rum', 'Flor de Ca\u00f1a'], ['1 oz', 'Lime', 'Fresh lime juice'], ['0.75 oz', 'Simple syrup', 'House simple']]],
          ['Centricomarg', '$10', [['1.5 oz', 'Tequila', 'Real de Valle'], ['2 oz', 'House sour mix', 'House'], ['0.5 oz', 'Orange liqueur', 'House orange liqueur']]],
          ['Paloma', '$10', [['1.5 oz', 'Tequila', 'Real de Valle'], ['1 oz', 'Lime', 'Fresh lime juice'], ['1 bottle', 'Grapefruit soda', 'Grapefruit Jarritos']]],
          ['Old Fashioned', '$12', [['2 oz', 'Whiskey', 'Old Grand Dad Bonded'], ['0.25 oz', 'Simple syrup', 'House simple'], ['2 dashes', 'Bitters', 'Angostura'], ['2 dashes', 'Bitters', 'Orange bitters']]],
          ['Negroni', '$12', [['1 oz', 'Gin', 'Waterloo Gin'], ['CHECK', 'Bitter', 'Campari (amount not written, likely 1 oz)'], ['CHECK', 'Sweet vermouth', 'Cocchi Vermouth di Torino (amount not written, likely 1 oz)']]],
          ['Martini (Dirty, Classic, Bone Dry)', '$12', [['2 oz + 0.75 oz', 'Dirty', 'Spirit plus olive brine'], ['2.5 oz + 0.5 oz', 'Classic', 'Spirit plus Dolin Dry Vermouth'], ['3 oz', 'Bone Dry', 'Spirit only']], 'Guest\u2019s choice of gin or vodka: Waterloo Gin or Tito\u2019s.'],
          ['Espresso Martini', '$12', [['2 oz', 'Vodka', 'Tito\u2019s'], ['1 oz', 'Cold brew', 'Passport Cold Brew'], ['0.75 oz', 'Simple syrup', 'House simple']]]]],
        ['Mas Mexicano', [
          ['Funky Daiquiri', '$14', [['2 oz', 'Mexican agricole rum', 'Uruapan Blanco'], ['1 oz', 'Lime', 'Fresh lime juice'], ['0.75 oz', 'Piloncillo syrup', 'House']]],
          ['Mexican Old Fashioned', '$14', [['2 oz', 'Mexican whiskey', 'Sierra Norte Yellow'], ['0.25 oz', 'Piloncillo syrup', 'House'], ['2 dashes', 'Bitters', 'Orange bitters'], ['2 dashes', 'Bitters', 'Fee Brothers Aztec Chocolate']]],
          ['Mezcal Negroni', '$14', [['1 oz', 'Mezcal', 'Fidencio Espad\u00edn'], ['1 oz', 'Mexican bitter liqueur', 'Amargo Vallet'], ['1 oz', 'Sweet vermouth', 'Cocchi Vermouth di Torino'], ['3 drops', 'Saline', '20% saline solution']]],
          ['Carajillo', '$14', [['1.5 oz', 'Espresso cold brew', 'House'], ['1.5 oz', 'Licor 43', 'Licor 43']]]]],
        ['Specialties', [
          ['Guava Goddess', '$16', [], 'Served as is: the current spec on the Drinks page.'],
          ['Boilermaker', '$8', [['1', 'Miller High Life Pony', ''], ['1 shot', 'Tequila', '']]],
          ['House Shots', '$8', [], 'Mexican Candy and Green Tea, current specs on the Drinks page.']]],
        ['Beers', [
          ['Miller High Life (full)', '$6', []], ['Miller High Life Pony', '$4', []], ['Church Music', '$7', []], ['Michelob Ultra', '$7', []], ['Dos XX', '$7', []],
          ['Sana Clara', 'CHECK', [], 'Spelling and price to confirm.'], ['Sana Negra', 'CHECK', [], 'Spelling and price to confirm.']]]];
      function newMenuView() {
        var chk = '<span class="pill warn">' + tt('Check', 'Confirmar') + '</span>';
        var card = function (it) {
          var rows = it[2].map(function (b) { return '<li><b>' + (b[0] === 'CHECK' ? chk : hx(b[0])) + '</b> ' + hx(b[1]) + (b[2] ? ' <span class="muted">\u00b7 ' + hx(b[2]) + '</span>' : '') + '</li>'; }).join('');
          return '<section class="card"><div class="cardhead"><h3>' + hx(it[0]) + '</h3>' + (it[1] === 'CHECK' ? chk : '<span class="count">' + hx(it[1]) + '</span>') + '</div>' +
            (rows ? '<ul class="plain x-nmb">' + rows + '</ul>' : '') + (it[3] ? '<p class="status">' + hx(it[3]) + '</p>' : '') + '</section>';
        };
        return '<div class="dtop"><button type="button" class="btn primary" data-newmenu="off">\u2039 ' + tt('Current drinks', 'Bebidas actuales') + '</button></div>' +
          '<section class="card edge"><div class="cardhead"><h3>' + tt('New cocktail menu', 'Nueva carta de c\u00f3cteles') + '</h3><span class="pill warn">' + tt('Coming soon', 'Muy pronto') + '</span></div>' +
          '<p class="status">' + tt('Not live yet. Keep making and selling the current menu until we launch this one. Use this to learn the new specs.', 'Todav\u00eda no sale. Sigue preparando y vendiendo la carta actual hasta que lancemos esta. \u00dasala para aprender las recetas nuevas.') + '</p></section>' +
          NM.map(function (g) { return '<h2>' + hx(g[0]) + '</h2><div class="grid">' + g[1].map(card).join('') + '</div>'; }).join('');
      }
      (function newMenu() {
        if (typeof VIEWS === 'undefined' || typeof vDrinks !== 'function') return setTimeout(newMenu, 200);
        if (VIEWS.drinks && VIEWS.drinks.__nm) return;
        var d0 = VIEWS.drinks;
        VIEWS.drinks = function () {
          if (ui.newMenu) return newMenuView();
          var h = d0.apply(this, arguments), btn = '<button type="button" class="btn x-nmbtn" data-newmenu="on">' + tt('New cocktail menu \u00b7 coming soon', 'Nueva carta \u00b7 muy pronto') + '</button>';
          return h.indexOf('<div class="dtop">') >= 0 ? h.replace('<div class="dtop">', '<div class="dtop">' + btn) : '<div class="dtop">' + btn + '</div>' + h;
        };
        VIEWS.drinks.__nm = true;
        document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('[data-newmenu]'); if (!b) return; e.preventDefault(); ui.newMenu = b.dataset.newmenu === 'on'; render(); window.scrollTo(0, 0); });
        style('.x-nmbtn{border-color:#F0A43A!important;color:#F0A43A!important;font-weight:700}.x-nmb{margin:6px 0 0;padding:0;list-style:none;display:grid;gap:6px}.x-nmb li{line-height:1.35}.x-nmb b{display:inline-block;min-width:74px}');
        render();
      })();
      /* Drink photos on the Drinks page are 300 px wide, height to match (Eric, Nov 20 2026). */
      style('body.x-drinks #view img.pimg{width:300px!important;max-width:100%!important;height:auto!important;aspect-ratio:auto!important;object-fit:contain!important}');
      /* Bartender on the Vicio iPhone (Eric, Nov 20 2026): on a phone-sized screen in Bartender view the page is laid out for
         the phone (proper width, one column, big tap targets). iPads and the other views are left exactly as they are. */
      function barPhone() {
        var phone = Math.min(screen.width || 9999, screen.height || 9999) < 600, on = phone && ui.mode === 'bar';
        document.body.classList.toggle('x-barphone', on);
        var m = document.getElementById('x-barvp');
        if (on && !m) { m = document.createElement('meta'); m.id = 'x-barvp'; m.name = 'viewport'; m.content = 'width=device-width, initial-scale=1, viewport-fit=cover'; document.head.appendChild(m); }
        else if (!on && m) m.remove();
      }
      style('body.x-barphone{overflow-x:hidden}' +
        'body.x-barphone #view, body.x-barphone #head{min-width:0!important;max-width:100vw}' +
        'body.x-barphone #head .x-hrow{display:block!important}body.x-barphone #head h1{font-size:30px!important;margin:0 0 8px!important}' +
        'body.x-barphone #head .modesw{display:block;margin:0 0 8px}body.x-barphone #head .seg2{display:grid!important;grid-template-columns:repeat(3,1fr);gap:4px;border-radius:16px!important}body.x-barphone #head .seg2 button{flex:1 1 auto;min-height:44px;padding:6px 10px;font-size:13px}' +
        'body.x-barphone #head .x-hc2, body.x-barphone #head .x-hc3{display:block!important}body.x-barphone .shiftbar.x-mini, body.x-barphone .shiftbar.x-top{max-width:none;min-width:0}' +
        'body.x-barphone .grid, body.x-barphone .x-expotop{display:block!important}body.x-barphone .grid > *, body.x-barphone .x-expotop > *{margin-bottom:12px}' +
        'body.x-barphone .card{padding:12px!important}body.x-barphone .x-expowho .x-row{flex-wrap:wrap!important}body.x-barphone .x-expowho select{flex:1 1 100%!important;max-width:none!important;min-height:44px}' +
        'body.x-barphone ul.checks label{min-height:48px;align-items:center}body.x-barphone ul.checks input[type=checkbox]{width:28px;height:28px;flex:0 0 28px}' +
        'body.x-barphone .bar .nav{flex-wrap:wrap;gap:6px}body.x-barphone .bar .date{font-size:16px}' +
        'body.x-barphone .dtop{flex-wrap:wrap}body.x-barphone #drink-q{flex:1 1 100%;min-height:44px;font-size:16px}' +
        'body.x-barphone img.pimg{width:100%!important;max-width:300px!important}body.x-barphone .x-finote{font-size:15px}');
      var r2 = render; render = function () { r2.apply(this, arguments); try { barPhone(); } catch (err) {} try { if (ui.tab !== 'drinks') ui.newMenu = false; } catch (err) {} try { document.body.classList.toggle('x-drinks', ui.tab === 'drinks'); document.querySelectorAll('#head [data-act="mode"]').forEach(function (b) { var tr = b.dataset.v === 'train'; if (ui.tab === 'training') b.setAttribute('aria-pressed', tr ? 'true' : 'false'); else if (tr) b.setAttribute('aria-pressed', 'false'); }); } catch (err) {} try { if (ui.mode === 'bar' && ui.tab === 'today') { var h1 = document.querySelector('#head h1'); if (h1) h1.textContent = tt('Bartender', 'Bartender'); } } catch (err) {} };
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
  var KNEWL = !/[?&]oldlists\b/.test(location.search);
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
  /* Green Chile Mozz Sticks batch (Eric, Nov 20 2026): per 5 lb bag of mozzarella, 16 oz deli green chile, 2 oz seis especias,
     1 oz garlic powder, 4 eggs. Replaces the old "garlic parm butter, amount to be verified". */
  function mozzCard() {
    if (typeof BOOK === 'undefined' || !Array.isArray(BOOK) || BOOK.__mozz) return;
    var x = null; BOOK.forEach(function (g) { (g.items || []).forEach(function (i) { if (i.id === 'mozz') x = i; }); });
    if (!x) return; BOOK.__mozz = true;
    x.sum = 'Giant mozz sticks mixed with green chile, seis especias and garlic, wrapped in a spring roll wrapper. Order of 3.';
    x.ing = { cols: ['Ingredient', 'Per batch'], rows: [['Mozzarella, the pizza cheese', '1 bag, 5 lb'], ['Deli green chile', '16 oz'], ['Seis especias', '2 oz'], ['Garlic powder', '1 oz'], ['Eggs', '4'], ['Spring roll wrappers', '1 per stick']] };
    x.steps = ['Mix the 5 lb bag of mozzarella with the green chile, seis especias and garlic powder.', 'Portion 2.25 oz of the cheese mix per stick.', 'Roll each portion in a spring roll wrapper.', 'Seal the edge with egg wash.', 'Hold cold until fried to order.'];
    x.notes = ['Batch from Eric, Nov 20 2026.', 'To confirm: do the 4 eggs go in the cheese mix or in the egg wash?'];
    x.esx = Object.assign({}, x.esx, { sum: 'Palitos grandes de mozzarella mezclada con chile verde, seis especias y ajo, envueltos en hoja de rollo primavera. Orden de 3.', ing: { cols: ['Ingrediente', 'Por tanda'], rows: [['Queso mozzarella (el de pizza)', '1 bolsa, 5 lb'], ['Chile verde de deli', '16 oz'], ['Seis especias', '2 oz'], ['Ajo en polvo', '1 oz'], ['Huevos', '4'], ['Hojas de rollo primavera', '1 por palito']] },
      steps: ['Mezcle la bolsa de 5 lb de mozzarella con el chile verde, las seis especias y el ajo en polvo.', 'Porcione 2.25 oz de la mezcla por palito.', 'Enrolle cada porci\u00f3n en una hoja de rollo primavera.', 'Selle la orilla con huevo batido.', 'Mantenga en fr\u00edo hasta fre\u00edr a la orden.'],
      notes: ['Tanda de Eric, 20 de nov 2026.', 'Por confirmar: \u00bflos 4 huevos van en la mezcla de queso o en el huevo batido?'] });
  }
  (function kstart() {
    if (!kready()) return setTimeout(kstart, 150);
    try { mozzCard(); } catch (e) {}
    var r0 = render;
    render = function () { r0.apply(this, arguments); try { kdecorate(); } catch (e) {} try { svcRow(); } catch (e) {} };
    /* BOH Service header on one row (Eric, Nov 20 2026): the title, Prep · Service · Dough and the date side by side. */
    style('.x-srow{display:flex;flex-wrap:wrap;align-items:center;gap:10px 24px;margin:0 0 14px}.x-srow h1{margin:0!important;line-height:1}.x-srow .modesw{margin:0}' +
      '.x-srow .bar{margin:0}.x-srow .bar .nav{margin:0}.x-srow .bar .date{font-size:18px}');
    function svcRow() {
      if (ui.tab !== 'today' || ui.mode !== 'service') return;
      var hd = document.getElementById('head'); if (!hd || hd.querySelector('.x-srow')) return;
      var h1 = hd.querySelector('h1'), sw = hd.querySelector('.modesw'), bar = document.querySelector('#view > .bar');
      if (!(h1 && sw)) return;
      var row = document.createElement('div'); row.className = 'x-srow';
      var stt = sw.querySelector('.status'); if (stt) { var seg = sw.querySelector('.seg2'); if (seg) seg.title = stt.textContent; stt.remove(); }
      row.appendChild(h1); row.appendChild(sw); if (bar) row.appendChild(bar);
      hd.insertBefore(row, hd.firstChild);
    }
    window.VicioAM = { amDay: amDay };
    render();
  })();
})();
