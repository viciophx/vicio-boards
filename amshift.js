/* Vicio FOH: AM shift checklists (Eric, Nov 14 2026). Loaded by sheetdb.js on the FOH board.
   Any day the schedule has a Vicio shift that starts before 3 PM is an AM day. On an AM day:
     AM crew (11 AM to 4 PM)  the normal open lists, titled AM, without the evening lights; then an AM hand off list
     PM crew                   a short PM takeover list in place of the full open; mid shift and close as always
   The three lists show together, the current crew's first: AM open, AM hand off, PM takeover before 4 PM, and PM
   takeover on top from 4 PM. Days with no AM shift are untouched.
   The four new lists are bar_amoff, host_amoff, bar_pmon and host_pmon in LISTS; their ticks save in shifts/<date>.done
   like every other list. They are empty on days that are not AM days, so they never count against those days. */
(function () {
  if (window.__vicioAM) return;
  window.__vicioAM = true;
  if (window.VICIO_BOARD !== 'foh') return;
  var AM_BEFORE = 15 * 60, PM_FROM = 16 * 60;
  var NEW = {
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
      'Women\u2019s restroom checked: clean, toilet paper, paper towels and soap stocked',
      'Men\u2019s restroom checked: clean, toilet paper, paper towels and soap stocked',
      'Bus tubs emptied and dishes run to the kitchen',
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
      'Both restrooms checked',
      'Water pitchers full: 2 at Bar, 1 at Host Stand']]]
  };
  /* The evening lights wait for the PM crew, so they come off the AM open list on an AM day (ids keep their places). */
  var EVENING = /^(Turn on candle|Plug in tower light|Plug in marble lamp|Table settings complete \(tall lights\))$/;
  var SP = {
    'AM hand off, 3 to 4 PM': 'Entrega del turno AM, 3 a 4 PM', 'PM takeover, 4 PM': 'Relevo del turno PM, 4 PM',
    'All AM tabs closed out or handed to the PM bartender': 'Todas las cuentas del AM cerradas o entregadas al bartender del PM',
    'Speed rail and back bar restocked. Note shortages': 'Riel y barra trasera surtidos. Anota faltantes',
    'Beer and wine restocked': 'Cerveza y vino surtidos', 'Garnishes refilled and dated': 'Guarniciones rellenadas y con fecha',
    'Sanitizer buckets changed': 'Cubetas de sanitizante cambiadas', 'Empty bottles cleared; trash taken out': 'Botellas vac\u00edas retiradas; basura sacada',
    'Ice topped off': 'Hielo rellenado', 'Cash drawer counted and handed to the PM bartender': 'Caja contada y entregada al bartender del PM',
    'Note left for the PM team: what ran low, what is 86\u2019d, anything broken': 'Nota para el equipo PM: qu\u00e9 se acab\u00f3, qu\u00e9 est\u00e1 86 y qu\u00e9 se rompi\u00f3',
    'Every table cleared, wiped, and reset, inside and patio': 'Todas las mesas despejadas, limpias y montadas, adentro y patio',
    'Spills and debris swept, inside and patio': 'Derrames y basura barridos, adentro y patio',
    'Water pitchers refilled: 2 at Bar, 1 at Host Stand': 'Jarras de agua llenas: 2 en la barra, 1 en el puesto de anfitri\u00f3n',
    'Trash taken out and a new bag put in (code 0818)': 'Basura sacada y bolsa nueva (c\u00f3digo 0818)',
    'Read the note from the AM team': 'Lee la nota del equipo AM', 'Cash drawer counted and signed in': 'Caja contada y firmada',
    'Lights set to red, TVs on the evening lineup, music playing': 'Luces en rojo, TVs con la programaci\u00f3n de la noche, m\u00fasica puesta',
    'Walk every table, inside and patio: fix anything that is not reset': 'Recorre todas las mesas, adentro y patio: arregla lo que no est\u00e9 montado',
    'Evening lights on: candle, tower light, marble lamp, tall lights on the tables': 'Luces de la noche: vela, luz de torre, l\u00e1mpara de m\u00e1rmol, luces altas en las mesas',
    'Ashtrays out and emptied': 'Ceniceros afuera y vac\u00edos', 'Reservations and waitlist checked for tonight': 'Reservaciones y lista de espera revisadas para esta noche',
    'Both restrooms checked': 'Los dos ba\u00f1os revisados', 'Water pitchers full: 2 at Bar, 1 at Host Stand': 'Jarras de agua llenas: 2 en la barra, 1 en el puesto de anfitri\u00f3n'
  };
  function ready() {
    return typeof LISTS === 'object' && LISTS && LISTS.bar_open && typeof sections === 'function' && typeof listCard === 'function' && typeof listRow === 'function' &&
      typeof shiftsOn === 'function' && typeof mins === 'function' && typeof ROLES === 'object' && typeof render === 'function' && typeof S !== 'undefined' && typeof iso === 'function';
  }
  function es() { try { return typeof lang === 'function' ? lang() === 'es' : false; } catch (e) { return false; } }
  /* An AM day: someone is scheduled at Vicio with a start before 3 PM. */
  function amDay(d) {
    try { return shiftsOn(d).some(function (w) { return (w.org || 'Vicio') === 'Vicio' && mins(w.start) < AM_BEFORE; }); } catch (e) { return false; }
  }
  /* From 4 PM (and on any earlier day) the PM takeover goes first. */
  function pmNow(d) {
    var now = new Date(), td = iso(now);
    return d < td || (d === td && now.getHours() * 60 + now.getMinutes() >= PM_FROM);
  }
  function start() {
    if (!ready()) return setTimeout(start, 150);
    Object.keys(NEW).forEach(function (k) { if (!LISTS[k]) LISTS[k] = NEW[k]; });
    if (typeof ES === 'object' && ES) Object.keys(SP).forEach(function (k) { if (ES[k] == null) ES[k] = SP[k]; });
    var s0 = sections;
    sections = function (key, d) {
      if (NEW[key] && !amDay(d)) return [];
      var out = s0(key, d);
      if (key === 'host_open' && amDay(d)) out = out.map(function (s) { return [s[0], s[1].filter(function (i) { return !EVENING.test(i[1]); })]; }).filter(function (s) { return s[1].length; });
      return out;
    };
    function three(fn, key, title, d, done) {
      var m = /^(bar|host)_open$/.exec(key);
      if (!m || !amDay(d)) return fn(key, title, d, done);
      var r = m[1], n = ROLES[r] || title;
      var a = fn(key, 'AM: ' + n + (es() ? ' apertura' : ' open'), d, done),
        b = fn(r + '_amoff', 'AM: ' + n + (es() ? ' entrega' : ' hand off'), d, done),
        c = fn(r + '_pmon', 'PM: ' + n + (es() ? ' relevo' : ' takeover'), d, done);
      return pmNow(d) ? c + a + b : a + b + c;
    }
    var c0 = listCard, r0 = listRow;
    listCard = function (key, title, d, done) { return three(c0, key, title, d, done); };
    listRow = function (key, title, d, done) { return three(r0, key, title, d, done); };
    window.VicioAM = { amDay: amDay };
    render();
    /* The order flips at 4 PM; redraw once a minute when nobody is typing. */
    setInterval(function () { var a = document.activeElement; if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)) return; if (amDay(iso(new Date()))) { try { render(); } catch (e) {} } }, 60000);
  }
  start();
})();
