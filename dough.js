/* Vicio BOH: the dough week (Eric, Nov 13 2026; his three-day process, Nov 14). Loaded by sheetdb.js on the kitchen board.
   One 20 qt batch a week, three days:
     Day 1  make the dough, into the fridge                                   goal Thursday
     Day 2  portion into pans, leave out 1 to 2 hours, first stretch, fridge  goal Friday
     Day 3  10 AM pull and let rise, 1 PM stretch again if it needs it,
            3:30 PM ovens on, 4 PM bake                                        goal Saturday
   Only the start day moves: tick Mix the day the dough is made (or set the day under "Dough made on") and day 2 and
   day 3 follow it. A step that is missed carries to the next day. The dough holds 72 hours from the mix and wants at
   least 18 hours in the pan; the board shows the 72 hour deadline and notes a bake that came sooner than 18 hours.
   Days before DNEW keep the old two-batch week, so that weekend finishes as planned and its ticks still show.
   Ticks save in caldough/<date>.done: a batch step as <step>_<its Thursday> on the day it was done (with the time in
   .at), keyed jobs (chicken thaw and so on) under their own key, and old two-batch jobs by position, as they always did.
   This file owns djobs, dKey and dDone on the board, including the ovens step and the by-time order the other add-ons
   used to add (their flags are set, so they leave it alone). */
(function () {
  if (window.__vicioDough) return;
  window.__vicioDough = true;
  if (window.VICIO_BOARD !== 'kitchen') return;
  var DNEW = '2026-11-16', DFIRST = '2026-11-19', HOLD = 3, HOLD_H = 72, PAN_MIN_H = 18;
  var STEP = ['mix', 'portion', 'stretch1', 'pull', 'stretch', 'bake'], DAY = { mix: 0, portion: 1, stretch1: 1, pull: 2, stretch: 2, bake: 2 };
  var JOB = {
    mix: { w: 'V', when: 'Dough day', job: 'Mix the dough (20 qt), into the fridge', min: '40 min', s: 'Mix', st: 'mix', r: 12 },
    portion: { w: 'V', when: 'Pan day', job: 'Portion into pans, then leave them out 1 to 2 hours', min: '30 min', s: 'Portion', st: 'portion', r: 12.1 },
    stretch1: { w: 'V', when: '1 to 2 hours later', job: 'First stretch, then cover and back in the fridge', min: '20 min', s: 'First stretch', st: 'stretch1', r: 12.2 },
    pull: { w: 'C', when: '10 AM', job: 'Pull the pans from the fridge and let them rise', min: '10 min', s: 'Pull', st: 'pull' },
    stretch: { w: 'V', when: '1 PM', job: 'Stretch again if it needs it', min: '', s: 'Stretch', st: 'stretch' },
    bake: { w: 'V', when: '4 PM', job: 'Bake the pans', min: '1 hr', s: 'Bake', st: 'bake' }
  };
  var GOAL = { 4: ['mix'], 5: ['portion', 'stretch1'], 6: ['pull', 'stretch', 'bake'] };
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
  function dayEs(k) { return ['domingo', 'lunes', 'martes', 'mi\u00e9rcoles', 'jueves', 'viernes', 's\u00e1bado'][parse(k).getDay()]; }
  function longDay(k) { var d = parse(k); return DAYN[d.getDay()] + ', ' + MON[d.getMonth()] + ' ' + d.getDate(); }
  function clock(ms) { return new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
  function stamp(ms) { return DAYN[new Date(ms).getDay()] + ' ' + clock(ms); }
  /* The Thursday a date's batch belongs to: that day if it is a Thursday, else the Thursday before. */
  function thuOf(k) { return addDays(k, -((parse(k).getDay() + 3) % 7)); }

  /* Which steps of a batch are ticked, on which day, and at what time when the tick carried one. */
  function got(thu) {
    var g = { at: {} };
    for (var i = 0; i < 10; i++) {
      var k = addDays(thu, i), doc = S.caldough[k] || {}, dn = doc.done || {}, at = doc.at || {};
      STEP.forEach(function (s) { if (dn[s + '_' + thu] && !g[s]) { g[s] = k; if (at[s + '_' + thu]) g.at[s] = +at[s + '_' + thu]; } });
    }
    return g;
  }
  /* Where each step of a batch lands. A ticked step stays on the day it was done. An open step sits on its planned day and,
     once that day has passed, rides along to today for as long as the dough can still be used: the mix until the next
     Wednesday, everything after it until the 72 hour day. Pan day is the day after the mix; bake day the day after the
     pans, never later than the 72 hour day. */
  function plan(thu) {
    if (cache['p' + thu]) return cache['p' + thu];
    var td = today(), g = got(thu), open = !g.bake;
    var ride = function (planned, done, last) { return done || (open && td > planned && td <= last ? td : planned); };
    var mix = ride(thu, g.mix, addDays(thu, 6)), limit = addDays(mix, HOLD);
    var portion = ride(addDays(mix, 1), g.portion, limit);
    var goal = addDays(portion, 1) > limit ? limit : addDays(portion, 1);
    var p = { thu: thu, got: g, mix: mix, portion: portion, limit: limit, limitAt: g.at.mix ? g.at.mix + HOLD_H * 3600e3 : null };
    p.stretch1 = g.stretch1 || portion;                       /* the first stretch belongs to pan day; it does not carry to bake day */
    ['pull', 'stretch', 'bake'].forEach(function (s) { p[s] = ride(goal, g[s], limit); });
    return (cache['p' + thu] = p);
  }
  function note(p, s, k) {
    var n = [];
    if (s === 'mix') {
      if (k !== p.thu) n.push(p.got.mix ? t('Planned for Thursday, made ' + dayName(k) + '. The pans and the bake moved with it.', 'Planeada para el jueves, hecha el ' + dayEs(k) + '. Los moldes y el horneado se movieron.')
        : t('Planned for Thursday, not made yet. Tick it the day you make it; the pans and the bake move with it.', 'Planeada para el jueves, a\u00fan no se hace. M\u00e1rcala el d\u00eda que la hagas; los moldes y el horneado se mueven.'));
      return n.join(' ');
    }
    var goal = addDays(p.thu, DAY[s]), bakeDay = addDays(p.portion, 1) > p.limit ? p.limit : addDays(p.portion, 1);
    var want = s === 'portion' ? addDays(p.mix, 1) : s === 'stretch1' ? p.portion : bakeDay;
    var lead = s === 'portion' || s === 'bake';   /* one note per day: the pans carry it on day 2, the bake on day 3 */
    if (!p.got.mix) { if (p.mix !== p.thu && lead) n.push(t('Waits on the mix.', 'Espera la mezcla.')); }
    else if (k !== want && !p.got[s]) n.push(t('Carried over from ' + dayName(want) + '.', 'Pendiente desde el ' + dayEs(want) + '.'));
    else if (k !== goal && lead) {
      if (p.mix !== p.thu) n.push(t('Dough was made ' + dayName(p.mix) + ', so this moved from ' + dayName(goal) + '.', 'La masa se hizo el ' + dayEs(p.mix) + ', as\u00ed que esto se movi\u00f3 del ' + dayEs(goal) + '.'));
      else if (s === 'bake') n.push(t('The pans were done ' + dayName(p.portion) + ', so this moved from ' + dayName(goal) + '.', 'Los moldes se hicieron el ' + dayEs(p.portion) + ', as\u00ed que esto se movi\u00f3 del ' + dayEs(goal) + '.'));
      else n.push(t('Planned for ' + dayName(goal) + '.', 'Planeado para el ' + dayEs(goal) + '.'));
    }
    if (p.got.mix && k === p.limit && !p.got[s] && lead) {
      var by = p.limitAt ? t(' at ' + clock(p.limitAt), ' a las ' + clock(p.limitAt)) : '';
      n.push(s === 'portion' ? t('Last day: the dough reaches 72 hours' + by + '. Pan it and bake it today.', '\u00daltimo d\u00eda: la masa llega a 72 horas' + by + '. Ponla en moldes y hornea hoy.') : t('Last day: the dough reaches 72 hours' + by + '.', '\u00daltimo d\u00eda: la masa llega a 72 horas' + by + '.'));
    }
    return n.join(' ');
  }

  /* By-time order within a day (the rule the layout add-on used); a step with its own place (r) keeps it. */
  function rank(j) {
    if (j.r != null) return j.r;
    var w = String(j.when || '').toLowerCase(); if (/arrive/.test(w)) return 9; if (/evening/.test(w)) return 18;
    var m = w.match(/(\d{1,2})(?::(\d\d))?\s*(am|pm)?/); if (!m) return 12;
    var hr = +m[1] + (+m[2] || 0) / 60, ap = m[3] || (w.match(/(am|pm)/) || [])[1]; if (ap === 'pm' && hr < 12) hr += 12; if (ap === 'am' && hr === 12) hr = 0;
    return /^by /.test(w) ? hr - 0.5 : hr;
  }
  /* Every dough job on a date, each with _key (where its tick is saved). */
  function jobs(k) {
    if (cache[k]) return cache[k];
    var dw = parse(k).getDay(), out = [], fresh = k >= DNEW;
    var side = (DOUGH[dw] || []).filter(function (j) { return j && j.k && !j.st; });      /* chicken thaw and other keyed jobs: the same in both weeks */
    if (!fresh) {
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
        STEP.forEach(function (s) {
          if (p[s] !== k || (p.got.bake && !p.got[s])) return;                    /* once it is baked, steps nobody ticked drop off */
          out.push(Object.assign({}, JOB[s], { _key: s + '_' + thu, detail: note(p, s, k) }));
        });
      });
    }
    /* Ovens on 30 minutes before the bake: 3:30 PM for the 4 PM bake (its own key, with this file's alert), 5:30 PM in the
       old week (key ovens, with the older add-on's alert). */
    var bi = -1; out.forEach(function (j, i) { if (bi < 0 && /^Bake /.test(j.job)) bi = i; });
    if (bi >= 0) out.splice(bi, 0, { w: out[bi].w, when: fresh ? '3:30 PM' : '5:30 PM', job: 'Turn on both pizza ovens, 525 top and bottom, 30 minutes before the bake', min: '', s: 'Ovens on', _key: fresh ? 'ovens_' + String(out[bi]._key).split('_')[1] : 'ovens' });
    out = out.map(function (j, i) { return [j, i]; }).sort(function (a, b) { return (rank(a[0]) - rank(b[0])) || (a[1] - b[1]); }).map(function (x) { return x[0]; });
    /* _i is what the older add-on's tick listener passes along: never a bare number, so it cannot be mistaken for a row. */
    out.forEach(function (j) { j._i = typeof j._key === 'number' ? 'p' + j._key : j._key; });
    return (cache[k] = out);
  }

  /* This week's dough in one line: when it was made, panned and baked, what is next, and the 72 hour deadline. */
  function status(d) {
    if (d < DNEW) return '';
    var td = today(), thu = thuOf(d) < DFIRST ? DFIRST : thuOf(d), p = plan(thu), g = p.got, line, extra = '';
    var made = function () { return g.at.mix ? stamp(g.at.mix) : longDay(p.mix); };
    var by = p.limitAt ? stamp(p.limitAt) : longDay(p.limit);
    if (g.bake) {
      var hrs = g.at.portion && g.at.bake ? Math.round((g.at.bake - g.at.portion) / 360000) / 10 : (g.portion && g.portion === g.bake ? 0 : null);
      line = t('Made ' + made() + (g.portion ? ', panned ' + (g.at.portion ? stamp(g.at.portion) : longDay(g.portion)) : '') + ', baked ' + (g.at.bake ? stamp(g.at.bake) : longDay(g.bake)) + '.', 'Hecha ' + made() + (g.portion ? ', en moldes ' + longDay(g.portion) : '') + ', horneada ' + longDay(g.bake) + '.');
      if (hrs != null && hrs < PAN_MIN_H) line += ' ' + t((hrs ? hrs + ' hours' : 'Same day') + ' in the pan, under the ' + PAN_MIN_H + ' hour minimum.', (hrs ? hrs + ' horas' : 'El mismo d\u00eda') + ' en el molde, menos del m\u00ednimo de ' + PAN_MIN_H + ' horas.');
    } else if (g.portion) {
      line = t('Made ' + made() + '. Panned ' + (g.at.portion ? stamp(g.at.portion) : longDay(g.portion)) + '. Bake ' + longDay(p.bake) + ' around 4 PM. Bake by ' + by + ' (72 hours).', 'Hecha ' + made() + '. En moldes ' + longDay(g.portion) + '. Hornear ' + longDay(p.bake) + ' como a las 4 PM. Hornear antes de ' + by + ' (72 horas).');
      if (g.portion === td && d >= td) extra = ' <button type="button" class="btn x-dbake" data-dbake="' + thu + '">' + t('Baked it today instead', 'Se horne\u00f3 hoy') + '</button>';
    } else if (g.mix) {
      line = t('Made ' + made() + '. Pan it ' + longDay(p.portion) + ', bake ' + longDay(p.bake) + ' around 4 PM. Bake by ' + by + ' (72 hours).', 'Hecha ' + made() + '. Moldes ' + longDay(p.portion) + ', hornear ' + longDay(p.bake) + ' como a las 4 PM. Hornear antes de ' + by + ' (72 horas).');
    } else {
      line = t('Goal: make it ' + longDay(thu) + (p.mix !== thu ? ' (not made yet, so now ' + longDay(p.mix) + ')' : '') + ', pan it ' + longDay(p.portion) + ', bake ' + longDay(p.bake) + ' around 4 PM.', 'Meta: hacerla ' + longDay(thu) + (p.mix !== thu ? ' (a\u00fan no se hace, ahora ' + longDay(p.mix) + ')' : '') + ', moldes ' + longDay(p.portion) + ', hornear ' + longDay(p.bake) + ' como a las 4 PM.');
    }
    var days = [0, 1, 2, 3, 4, 5, 6].map(function (i) { return addDays(thu, i); }).filter(function (k) { return k <= td; });
    var pick = days.length && !g.bake ? ' <label class="x-dmade-l">' + t('Dough made on', 'La masa se hizo el') + ' <select data-dmade="' + thu + '"><option value="">' + t('Not made yet', 'A\u00fan no se hace') + '</option>' +
      days.map(function (k) { return '<option value="' + k + '"' + (g.mix === k ? ' selected' : '') + '>' + h(longDay(k)) + '</option>'; }).join('') + '</select></label>' : '';
    return '<p class="status x-dmade"><b>' + t('This week\u2019s dough.', 'La masa de esta semana.') + '</b> ' + h(line) + pick + extra + '</p>';
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
  function setDone(k, key, on, withTime) {
    var patch = { done: {} }; patch.done[key] = on;
    if (withTime) { patch.at = {}; patch.at[key] = on ? Date.now() : null; }
    var cur = S.caldough[k] || {};
    S.caldough[k] = Object.assign({}, cur, { done: Object.assign({}, cur.done, patch.done), at: Object.assign({}, cur.at, patch.at || {}) });
    save('caldough/' + k, patch);
  }

  /* Alerts on the three-day week: the first stretch an hour after the pans come out, and ovens on at 3:30 PM on bake day.
     A banner with a chime until the step is ticked; darker and chiming again once it is late. */
  var actx = null, snooze = {}, rang = {};
  function unlock() { try { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) {} }
  document.addEventListener('touchstart', unlock, { passive: true, once: true });
  document.addEventListener('click', unlock, { once: true });
  function chime() {
    try {
      if (!actx) return;
      [[880, 0], [1175, .18]].forEach(function (n) {
        var o = actx.createOscillator(), g = actx.createGain(), t0 = actx.currentTime + n[1];
        o.type = 'sine'; o.frequency.value = n[0]; o.connect(g); g.connect(actx.destination);
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.4, t0 + .02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + .5);
        o.start(t0); o.stop(t0 + .55);
      });
    } catch (e) {}
  }
  function alerts() {
    var td = today(), now = new Date(), hm = now.getHours() * 60 + now.getMinutes(), live = null;
    if (td >= DNEW) {
      cache = {};
      var js = jobs(td), dn = (S.caldough[td] || {}).done || {}, at = (S.caldough[td] || {}).at || {};
      js.forEach(function (j) {
        if (live || dn[j._key]) return;
        if (/^ovens_/.test(String(j._key)) && hm >= 15 * 60 + 30 && hm < 17 * 60)
          live = { key: j._key, late: hm >= 15 * 60 + 45, text: t('3:30 PM: turn on both pizza ovens, 525 top and bottom. Bake is at 4', '3:30 PM: prende los dos hornos de pizza, 525 arriba y abajo. Se hornea a las 4'), done: t('Ovens are on', 'Hornos prendidos') };
        if (j.st === 'stretch1') {
          var pk = 'portion_' + String(j._key).split('_')[1], t0 = at[pk];
          if (dn[pk] && t0 && Date.now() - t0 >= 3600e3 && Date.now() - t0 < 6 * 3600e3)
            live = { key: j._key, late: Date.now() - t0 >= 2 * 3600e3, time: true, text: t('First stretch: the pans have been out since ' + clock(t0) + '. Stretch, cover, back in the fridge', 'Primer estirado: los moldes est\u00e1n fuera desde las ' + clock(t0) + '. Estira, tapa y al refrigerador'), done: t('Stretched', 'Estirado') };
        }
      });
    }
    var el = document.getElementById('x-dalert');
    if (!live || snooze[live.key] > Date.now()) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'x-dalert'; document.body.appendChild(el); }
    el.className = live.late ? 'late' : '';
    el.innerHTML = '<div class="x-dal"><b>' + h(live.text) + (live.late ? ' <span>' + t('(running late)', '(ya va tarde)') + '</span>' : '') + '</b><span class="x-dalb"><button type="button" class="btn primary" data-dal="done">' + h(live.done) + '</button><button type="button" class="btn" data-dal="later">' + t('10 more minutes', '10 minutos m\u00e1s') + '</button></span></div>';
    el.onclick = function (e) {
      var b = e.target.closest('[data-dal]'); if (!b) return;
      if (b.dataset.dal === 'later') snooze[live.key] = Date.now() + 10 * 60000; else setDone(td, live.key, true, !!live.time);
      el.remove(); render();
    };
    var stage = live.key + (live.late ? ':late' : '');
    if (!rang[stage]) { rang[stage] = 1; chime(); }
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
      var more = { 'Mix the dough (20 qt), into the fridge': 'Mezcla la masa (20 qt), al refrigerador', 'Portion into pans, then leave them out 1 to 2 hours': 'Porciona en moldes y d\u00e9jalos fuera 1 a 2 horas', 'First stretch, then cover and back in the fridge': 'Primer estirado, luego tapa y al refrigerador',
        'Pull the pans from the fridge and let them rise': 'Saca los moldes del refrigerador y deja que suban', 'Stretch again if it needs it': 'Estira otra vez si hace falta', 'Bake the pans': 'Hornea los moldes', 'Dough day': 'D\u00eda de masa', 'Pan day': 'D\u00eda de moldes', '1 to 2 hours later': '1 a 2 horas despu\u00e9s' };
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
      '.x-dbake{margin-left:8px;min-height:40px}.x-dj .x-dnote{color:var(--cherry,#8B1E1E)}' +
      '#x-dalert{position:fixed;left:0;right:0;top:0;z-index:9390;padding:calc(10px + env(safe-area-inset-top,0px)) 12px 10px;background:var(--cherry,#8B1E1E);color:#fff;box-shadow:0 6px 24px rgba(0,0,0,.35)}' +
      '#x-dalert.late{background:#5A0F0F;animation:x-dpulse 1.2s ease-in-out infinite}@keyframes x-dpulse{50%{background:#8B1E1E}}' +
      '.x-dal{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;max-width:1100px;margin:0 auto;font-size:17px}.x-dal b span{font-weight:400;opacity:.9}.x-dalb{display:flex;gap:8px}' +
      '#x-dalert .btn{min-height:44px}#x-dalert .btn.primary{background:#fff;color:var(--cherry,#8B1E1E)}#x-dalert .btn:not(.primary){background:transparent;color:#fff;border-color:rgba(255,255,255,.6)}';
    document.head.appendChild(st);
    var r0 = render;
    render = function () { cache = {}; r0.apply(this, arguments); try { decorate(); } catch (e) {} };
    document.addEventListener('change', function (e) {
      var el = e.target; if (!el || !el.dataset) return;
      /* A tick on a batch step also saves the time, for the 72 hour deadline, the first-stretch reminder and hours in the pan. */
      if (el.dataset.dtoggle) {
        var q = el.dataset.dtoggle.split('|'), key = dKey(q[0], q[1]);
        if (typeof key === 'string' && /^(mix|portion|stretch1|pull|stretch|bake)_\d{4}-/.test(key)) {
          var at = {}; at[key] = el.checked ? Date.now() : null;
          var cur = S.caldough[q[0]] || {}; S.caldough[q[0]] = Object.assign({}, cur, { at: Object.assign({}, cur.at, at) });
          save('caldough/' + q[0], { at: at });
        }
        return;
      }
      /* "Dough made on": the mix tick moves to the chosen day (or comes off every day for Not made yet). */
      if (!el.dataset.dmade) return;
      e.stopImmediatePropagation();
      var thu = el.dataset.dmade, mk = 'mix_' + thu;
      for (var i = 0; i < 7; i++) {
        var k = addDays(thu, i), on = k === el.value, had = !!((S.caldough[k] || {}).done || {})[mk];
        if (on !== had) setDone(k, mk, on, false);
      }
      render();
    }, true);
    /* "Baked it today instead": panned and baked on the same day. */
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-dbake]'); if (!b) return;
      e.preventDefault(); e.stopImmediatePropagation();
      setDone(today(), 'ovens_' + b.dataset.dbake, true, false); setDone(today(), 'bake_' + b.dataset.dbake, true, true); render();
    }, true);
    setInterval(function () { try { alerts(); } catch (e) {} }, 30000); setTimeout(function () { try { alerts(); } catch (e) {} }, 2500);
    window.VicioDough = { jobs: jobs, plan: plan, status: status };
    render();
  }
  start();
})();
