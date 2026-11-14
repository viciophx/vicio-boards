/* Vicio BOH: the dough week (Eric, Nov 13 2026). Loaded by sheetdb.js on the kitchen board.
   One 20 qt batch a week. Goal: mix Thursday, portion Friday, bake Saturday. The dough holds up to 72 hours cold, so when
   Thursday gets busy the mix can happen later: tick Mix the day it is made (or set the day under "Dough made on") and
   portion, pull, stretch, bake and the 5:30 PM ovens alert all move with it.
   Days before DNEW keep the old two-batch week, so that weekend finishes as planned and its ticks still show.
   Ticks save in caldough/<date>.done: a batch step as <step>_<its Thursday> on the day it was done, the ovens as ovens,
   keyed jobs (chicken thaw and so on) under their own key, and old two-batch jobs by position, as they always did.
   This file owns djobs, dKey and dDone on the board, including the ovens step and the by-time order the other add-ons
   used to add (their flags are set, so they leave it alone). */
(function () {
  if (window.__vicioDough) return;
  window.__vicioDough = true;
  if (window.VICIO_BOARD !== 'kitchen') return;
  var DNEW = '2026-11-16', DFIRST = '2026-11-19', HOLD = 3;
  var STEP = ['mix', 'portion', 'pull', 'stretch', 'bake'], OFF = { mix: 0, portion: 1, pull: 2, stretch: 2, bake: 2 };
  var JOB = {
    mix: { w: 'V', when: '9 PM', job: 'Mix the dough (20 qt), into the fridge', min: '40 min', s: 'Mix', st: 'mix' },
    portion: { w: 'V', when: '7 PM', job: 'Portion into pans, cover, fridge', min: '30 min', s: 'Portion', st: 'portion' },
    pull: { w: 'C', when: 'By 10 AM', job: 'Pull the pans from the fridge', min: '10 min', s: 'Pull', st: 'pull' },
    stretch: { w: 'C', when: '12 to 2 PM', job: 'Stretch the dough', min: '20 min', s: 'Stretch', st: 'stretch' },
    bake: { w: 'V', when: '6 to 8 PM', job: 'Bake the pans', min: '1 hr', s: 'Bake', st: 'bake' }
  };
  var GOAL = { 4: ['mix'], 5: ['portion'], 6: ['pull', 'stretch', 'bake'] };
  var STAFF = { 3: 'C\u00e9ntrico staff (Vicio closed)', 4: 'Vicio staffed 6 PM to 12 AM', 5: 'Vicio staffed 6 PM to 12 AM', 6: 'C\u00e9ntrico before 5 PM. Vicio 6 PM to 12 AM.' };
  var DAYN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var OLD = {}, cache = {}, staffed = false;

  function ready() {
    return typeof DOUGH !== 'undefined' && typeof djobs === 'function' && typeof dDone === 'function' && typeof dKey === 'function' && typeof S !== 'undefined' && S.caldough &&
      typeof ui !== 'undefined' && typeof render === 'function' && typeof save === 'function' && typeof parse === 'function' && typeof iso === 'function' && typeof addDays === 'function';
  }
  function es() { try { return typeof lang === 'function' ? lang() === 'es' : false; } catch (e) { return false; } }
  function t(en, sp) { return es() ? sp : en; }
  function h(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function today() { return iso(new Date()); }
  function dayName(k) { return DAYN[parse(k).getDay()]; }
  function longDay(k) { var d = parse(k); return DAYN[d.getDay()] + ', ' + MON[d.getMonth()] + ' ' + d.getDate(); }
  /* The Thursday a date's batch belongs to: that day if it is a Thursday, else the Thursday before. */
  function thuOf(k) { return addDays(k, -((parse(k).getDay() + 3) % 7)); }

  /* Which steps of a batch are ticked, and on which day. */
  function got(thu) {
    var g = {};
    for (var i = 0; i < 10; i++) {
      var k = addDays(thu, i), dn = (S.caldough[k] || {}).done || {};
      STEP.forEach(function (s) { if (dn[s + '_' + thu] && !g[s]) g[s] = k; });
    }
    return g;
  }
  /* Where each step of a batch lands. A ticked step stays on the day it was done. An open step sits on its planned day and,
     once that day has passed, rides along to today for as long as the dough can still be used: the mix until the next
     Wednesday, everything after it until 72 hours from the mix. Portion is the day after the mix; pull, stretch and bake the
     day after portioning, never later than the 72 hour day. */
  function plan(thu) {
    if (cache['p' + thu]) return cache['p' + thu];
    var td = today(), g = got(thu), open = !g.bake;
    var ride = function (planned, done, last) { return done || (open && td > planned && td <= last ? td : planned); };
    var mix = ride(thu, g.mix, addDays(thu, 6)), limit = addDays(mix, HOLD);
    var portion = ride(addDays(mix, 1), g.portion, limit);
    var goal = addDays(portion, 1) > limit ? limit : addDays(portion, 1);
    var p = { thu: thu, got: g, mix: mix, portion: portion, limit: limit };
    ['pull', 'stretch', 'bake'].forEach(function (s) { p[s] = ride(goal, g[s], limit); });
    return (cache['p' + thu] = p);
  }
  function note(p, s, k) {
    var n = [];
    if (s === 'mix') {
      if (k !== p.thu) n.push(p.got.mix ? t('Planned for Thursday, made ' + dayName(k) + '. Portion and bake moved with it.', 'Planeada para el jueves, hecha el ' + dayEs(k) + '. Porcionar y hornear se movieron.')
        : t('Planned for Thursday, not made yet. Tick it the day you make it; portion and bake move with it.', 'Planeada para el jueves, a\u00fan no se hace. M\u00e1rcala el d\u00eda que la hagas; porcionar y hornear se mueven.'));
      return n.join(' ');
    }
    var goal = addDays(p.thu, OFF[s]), want = s === 'portion' ? addDays(p.mix, 1) : (addDays(p.portion, 1) > p.limit ? p.limit : addDays(p.portion, 1));
    var lead = s === 'portion' || s === 'bake';   /* pull and stretch share the bake's day, so the bake carries the note */
    if (!p.got.mix) { if (p.mix !== p.thu && lead) n.push(t('Waits on the mix.', 'Espera la mezcla.')); }
    else if (k !== want && !p.got[s]) n.push(t('Carried over from ' + dayName(want) + '.', 'Pendiente desde el ' + dayEs(want) + '.'));
    else if (k !== goal && lead) n.push(t('Dough was made ' + dayName(p.mix) + ', so this moved from ' + dayName(goal) + '.', 'La masa se hizo el ' + dayEs(p.mix) + ', as\u00ed que esto se movi\u00f3 del ' + dayEs(goal) + '.'));
    if (p.got.mix && k === p.limit && !p.got[s] && lead) n.push(s === 'portion' ? t('Portion and bake today: the dough reaches 72 hours.', 'Porciona y hornea hoy: la masa llega a 72 horas.') : t('Last day: the dough reaches 72 hours.', '\u00daltimo d\u00eda: la masa llega a 72 horas.'));
    return n.join(' ');
  }
  function dayEs(k) { return ['domingo', 'lunes', 'martes', 'mi\u00e9rcoles', 'jueves', 'viernes', 's\u00e1bado'][parse(k).getDay()]; }

  /* By-time order within a day, the same rule the layout add-on used. */
  function rank(w) {
    w = String(w || '').toLowerCase(); if (/arrive/.test(w)) return 9; if (/evening/.test(w)) return 18;
    var m = w.match(/(\d{1,2})(?::(\d\d))?\s*(am|pm)?/); if (!m) return 12;
    var hr = +m[1] + (+m[2] || 0) / 60, ap = m[3] || (w.match(/(am|pm)/) || [])[1]; if (ap === 'pm' && hr < 12) hr += 12; if (ap === 'am' && hr === 12) hr = 0;
    return /^by /.test(w) ? hr - 0.5 : hr;
  }
  /* Every dough job on a date, each with _key (where its tick is saved). */
  function jobs(k) {
    if (cache[k]) return cache[k];
    var dw = parse(k).getDay(), out = [];
    var side = (DOUGH[dw] || []).filter(function (j) { return j && j.k && !j.st; });      /* chicken thaw and other keyed jobs: the same in both weeks */
    if (k < DNEW) {
      (OLD[dw] || []).forEach(function (j, i) {
        if (j.k) { var cur = side.filter(function (x) { return x.k === j.k; })[0] || j; out.push(Object.assign({}, cur, { _key: j.k })); }
        else out.push(Object.assign({}, j, { _key: i }));
      });
      side.forEach(function (j) { if (!out.some(function (x) { return x._key === j.k; })) out.push(Object.assign({}, j, { _key: j.k })); });
    } else {
      side.forEach(function (j) { out.push(Object.assign({}, j, { _key: j.k })); });
      [addDays(thuOf(k), -7), thuOf(k)].forEach(function (thu) {
        if (thu < DFIRST) return;
        var p = plan(thu);
        STEP.forEach(function (s) { if (p[s] === k) out.push(Object.assign({}, JOB[s], { _key: s + '_' + thu, detail: note(p, s, k) })); });
      });
    }
    /* Ovens on at 5:30 PM, 30 minutes before the bake. */
    var bi = -1; out.forEach(function (j, i) { if (bi < 0 && /^Bake /.test(j.job)) bi = i; });
    if (bi >= 0) out.splice(bi, 0, { w: out[bi].w, when: '5:30 PM', job: 'Turn on both pizza ovens, 525 top and bottom, 30 minutes before the bake', min: '', s: 'Ovens on', _key: 'ovens' });
    out = out.map(function (j, i) { return [j, i]; }).sort(function (a, b) { return (rank(a[0].when) - rank(b[0].when)) || (a[1] - b[1]); }).map(function (x) { return x[0]; });
    /* _i is what the older add-on's tick listener passes along: never a bare number, so it cannot be mistaken for a row. */
    out.forEach(function (j) { j._i = typeof j._key === 'number' ? 'p' + j._key : j._key; });
    return (cache[k] = out);
  }

  /* This week's dough in one line, with the day it was made. Changing the day moves the mix tick to that day. */
  function status(d) {
    if (d < DNEW) return '';
    var td = today(), thu = thuOf(d) < DFIRST ? DFIRST : thuOf(d), p = plan(thu);
    var line = p.got.bake ? t('Made ' + longDay(p.mix) + ', baked ' + longDay(p.got.bake) + '.', 'Hecha el ' + longDay(p.mix) + ', horneada el ' + longDay(p.got.bake) + '.')
      : p.got.mix ? t('Made ' + longDay(p.mix) + '. Portion ' + longDay(p.portion) + ', bake ' + longDay(p.bake) + '. It holds until ' + longDay(p.limit) + ' (72 hours).', 'Hecha el ' + longDay(p.mix) + '. Porcionar ' + longDay(p.portion) + ', hornear ' + longDay(p.bake) + '. Aguanta hasta ' + longDay(p.limit) + ' (72 horas).')
      : t('Goal: make it ' + longDay(thu) + (p.mix !== thu ? ' (not made yet, so now ' + longDay(p.mix) + ')' : '') + ', portion ' + longDay(p.portion) + ', bake ' + longDay(p.bake) + '.', 'Meta: hacerla ' + longDay(thu) + (p.mix !== thu ? ' (a\u00fan no se hace, ahora ' + longDay(p.mix) + ')' : '') + ', porcionar ' + longDay(p.portion) + ', hornear ' + longDay(p.bake) + '.');
    var days = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return addDays(thu, i); }).filter(function (k) { return k <= td; });
    var pick = days.length && !p.got.bake ? ' <label class="x-dmade-l">' + t('Dough made on', 'La masa se hizo el') + ' <select data-dmade="' + thu + '"><option value="">' + t('Not made yet', 'A\u00fan no se hace') + '</option>' +
      days.map(function (k) { return '<option value="' + k + '"' + (p.got.mix === k ? ' selected' : '') + '>' + h(longDay(k)) + '</option>'; }).join('') + '</select></label>' : '';
    return '<p class="status x-dmade"><b>' + t('This week\u2019s dough.', 'La masa de esta semana.') + '</b> ' + h(line) + pick + '</p>';
  }
  /* After each draw: the status line on Today's dough card and above the Dough week, and each step's note on the week tiles. */
  function decorate() {
    var td = today();
    if (!staffed && td >= DNEW && typeof DSTAFF !== 'undefined') { [0, 1, 2, 3, 4, 5, 6].forEach(function (d) { if (STAFF[d]) DSTAFF[d] = STAFF[d]; else delete DSTAFF[d]; }); staffed = true; }
    var fold = document.querySelector('#view details[data-fold="dough"]');
    if (fold && !fold.querySelector('.x-dmade')) {
      var first = fold.querySelector('input[data-dtoggle]'), d = first ? first.dataset.dtoggle.split('|')[0] : (ui.date || td), html = status(d);
      if (html) { var ul = fold.querySelector('ul.checks'), anchor = ul || fold.querySelector('p.status') || fold.querySelector('summary'); anchor.insertAdjacentHTML(ul ? 'afterend' : (anchor.tagName === 'SUMMARY' ? 'afterend' : 'beforebegin'), html); }
    }
    var week = document.querySelector('#view .x-dweek');
    if (week) {
      if (!week.parentNode.querySelector('.x-dmade')) {
        var any = week.querySelectorAll('input[data-dtoggle]'), shown = [];
        /* The days on screen come from the week's own Back / Next state; the Thursday among them names the batch. */
        var ws = ui.dweek || (typeof monday === 'function' ? iso(monday(parse(ui.date || td))) : td);
        for (var i = 0; i < 7; i++) shown.push(addDays(ws, i));
        if (any.length) { var d0 = any[0].dataset.dtoggle.split('|')[0]; if (shown.indexOf(d0) < 0) { shown = []; for (var q = -6; q <= 6; q++) shown.push(addDays(d0, q)); } }
        var thu = shown.filter(function (k) { return parse(k).getDay() === 4; })[0] || td, sh = status(thu);
        if (sh) week.insertAdjacentHTML('beforebegin', sh);
      }
      week.querySelectorAll('label.x-dj input[data-dtoggle]').forEach(function (inp) {
        var p = inp.dataset.dtoggle.split('|'), j = jobs(p[0])[+p[1]], lab = inp.closest('label'), sp = lab && lab.querySelector('span');
        if (!j || !j.st || !j.detail || !sp || sp.querySelector('.x-dnote')) return;
        var sm = document.createElement('small'); sm.className = 'x-dnote'; sm.textContent = j.detail; sp.appendChild(sm);
      });
    }
  }

  function start() {
    if (!ready()) return setTimeout(start, 150);
    /* Keep the two-batch week for the days before the switch, then make DOUGH the goal week. Keyed jobs another add-on
       put on a day (chicken) stay on that day. */
    [0, 1, 2, 3, 4, 5, 6].forEach(function (dw) {
      var cur = DOUGH[dw] || [];
      OLD[dw] = cur.filter(function (j) { return !(j.k && j.k !== 'thaw'); });
      DOUGH[dw] = cur.filter(function (j) { return j.k; }).concat((GOAL[dw] || []).map(function (s) { return JOB[s]; }));
    });
    if (typeof ES === 'object' && ES) {
      var more = { 'Mix the dough (20 qt), into the fridge': 'Mezcla la masa (20 qt), al refrigerador', 'Portion into pans, cover, fridge': 'Porciona en moldes, tapa, refrigerador', 'Pull the pans from the fridge': 'Saca los moldes del refrigerador', 'Stretch the dough': 'Estira la masa', 'Bake the pans': 'Hornea los moldes' };
      Object.keys(more).forEach(function (k) { if (ES[k] == null) ES[k] = more[k]; });
    }
    djobs = function (k) { return jobs(k); };
    djobs.__ovens = djobs.__sorted = djobs.__dough = true;
    dKey = function (k, i) {
      i = String(i);
      if (/^p\d+$/.test(i)) return +i.slice(1);
      if (!/^\d+$/.test(i)) return i;
      var j = jobs(k)[+i]; return j ? j._key : +i;
    };
    dDone = function (k, i) { var j = jobs(k)[i], d = S.caldough[k]; return !!(j && d && d.done && d.done[j._key]); };
    var st = document.createElement('style');
    st.textContent = '.x-dmade{margin:10px 0}.x-dmade-l{display:inline-flex;align-items:center;gap:8px;margin-left:8px;font-weight:600}.x-dmade select{min-height:40px;font-size:15px;padding:6px 10px;border-radius:10px;border:1px solid var(--line,#ccc);background:var(--surface,#fff);color:var(--ink,#18181B)}' +
      '.x-dj .x-dnote{color:var(--cherry,#8B1E1E)}';
    document.head.appendChild(st);
    var r0 = render;
    render = function () { cache = {}; r0.apply(this, arguments); try { decorate(); } catch (e) {} };
    /* "Dough made on": the mix tick moves to the chosen day (or comes off every day for Not made yet). */
    document.addEventListener('change', function (e) {
      var sel = e.target; if (!sel || !sel.dataset || !sel.dataset.dmade) return;
      e.stopImmediatePropagation();
      var thu = sel.dataset.dmade, key = 'mix_' + thu;
      for (var i = 0; i < 7; i++) {
        var k = addDays(thu, i), on = k === sel.value, had = !!((S.caldough[k] || {}).done || {})[key];
        if (on === had) continue;
        var patch = { done: {} }; patch.done[key] = on;
        S.caldough[k] = Object.assign({}, S.caldough[k], { done: Object.assign({}, (S.caldough[k] || {}).done, patch.done) });
        save('caldough/' + k, patch);
      }
      render();
    }, true);
    window.VicioDough = { jobs: jobs, plan: plan, status: status };
    render();
  }
  start();
})();
