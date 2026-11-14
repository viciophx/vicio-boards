/* Vicio BOH: dough batches (Eric, Nov 14 2026). Loaded by sheetdb.js on the kitchen board.
   Dough is made whenever it is made. Tapping "Dough made now" (or "Made earlier" with the real day and time) starts a
   batch, and the board tracks that batch from its start time:
     Start     mix the dough, into the fridge
     Next day  portion into pans, leave out 1 to 2 hours, first stretch, cover, back in the fridge
     Day after 10 AM pull and let rise, 1 PM stretch again if it needs it, 3:30 PM ovens on, 4 PM bake
   A step that is missed carries to the next day. The dough holds 72 hours from its start and wants at least 18 hours in
   the pan; each batch shows its 72 hour deadline, and a bake that came sooner than 18 hours is noted. Any number of
   batches can be going at once. The goal is still a batch on Thursday, shown as a reminder only.
   Days before SWITCH keep the old two-batch week so its ticks still show.
   Batches live in caldough/batches as b.<id> = {at}. A step's tick saves in caldough/<date>.done as <step>_<id> on the
   day it was done, with the time in .at. Keyed jobs (chicken thaw and so on) save under their own key, and old
   two-batch jobs by position, as they always did.
   This file owns djobs, dKey and dDone on the board, including the ovens step and the by-time order the other add-ons
   used to add (their flags are set, so they leave it alone). */
(function () {
  if (window.__vicioDough) return;
  window.__vicioDough = true;
  if (window.VICIO_BOARD !== 'kitchen') return;
  var SWITCH = '2026-11-14', HOLD_H = 72, PAN_MIN_H = 18;
  var STEP = ['portion', 'stretch1', 'pull', 'stretch', 'bake'];
  var JOB = {
    mix: { w: 'V', when: 'Made', job: 'Mix the dough (20 qt), into the fridge', min: '', s: 'Mix', st: 'mix', r: 11.9 },
    portion: { w: 'V', when: 'Pan day', job: 'Portion into pans, then leave them out 1 to 2 hours', min: '30 min', s: 'Portion', st: 'portion', r: 12.1 },
    stretch1: { w: 'V', when: '1 to 2 hours later', job: 'First stretch, then cover and back in the fridge', min: '20 min', s: 'First stretch', st: 'stretch1', r: 12.2 },
    pull: { w: 'C', when: '10 AM', job: 'Pull the pans from the fridge and let them rise', min: '10 min', s: 'Pull', st: 'pull' },
    stretch: { w: 'V', when: '1 PM', job: 'Stretch again if it needs it', min: '', s: 'Stretch', st: 'stretch' },
    bake: { w: 'V', when: '4 PM', job: 'Bake the pans', min: '1 hr', s: 'Bake', st: 'bake' }
  };
  var DAYN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var OLD = {}, cache = {};

  function ready() {
    return typeof DOUGH !== 'undefined' && typeof djobs === 'function' && typeof dDone === 'function' && typeof dKey === 'function' && typeof S !== 'undefined' && S.caldough &&
      typeof ui !== 'undefined' && typeof render === 'function' && typeof save === 'function' && typeof parse === 'function' && typeof iso === 'function' && typeof addDays === 'function';
  }
  function es() { try { return typeof lang === 'function' ? lang() === 'es' : false; } catch (e) { return false; } }
  function t(en, sp) { return es() ? sp : en; }
  function h(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function today() { return iso(new Date()); }
  function dayOf(ms) { return iso(new Date(ms)); }
  function dayName(k) { return es() ? ['domingo', 'lunes', 'martes', 'mi\u00e9rcoles', 'jueves', 'viernes', 's\u00e1bado'][parse(k).getDay()] : DAYN[parse(k).getDay()]; }
  function clock(ms) { return new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
  function stamp(ms) { return dayName(dayOf(ms)) + ' ' + clock(ms); }
  function who() { try { var x = JSON.parse(localStorage.getItem('vicio_by') || 'null'); return Array.isArray(x) ? (x[0] || '') : (typeof x === 'string' ? x : ''); } catch (e) { return ''; } }

  /* Every batch that has been started and not removed, oldest first. */
  function batches() {
    var b = (S.caldough.batches || {}).b || {};
    return Object.keys(b).filter(function (id) { return b[id] && b[id].at && !b[id].gone; }).map(function (id) { return { id: id, at: +b[id].at, by: b[id].by || '' }; }).sort(function (x, y) { return x.at - y.at; });
  }
  /* Which steps of a batch are ticked, on which day, and at what time. */
  function got(b) {
    var g = { at: {} }, start = dayOf(b.at);
    for (var i = 0; i < 6; i++) {
      var k = addDays(start, i), doc = S.caldough[k] || {}, dn = doc.done || {}, at = doc.at || {};
      STEP.forEach(function (s) { if (dn[s + '_' + b.id] && !g[s]) { g[s] = k; if (at[s + '_' + b.id]) g.at[s] = +at[s + '_' + b.id]; } });
    }
    return g;
  }
  /* Where each step of a batch lands. A ticked step stays on the day it was done. An open step sits on its planned day and,
     once that day has passed, rides along to today until the 72 hour day. Pan day is the day after the start; bake day is
     the day after the pans, never later than the 72 hour day. */
  function plan(b) {
    if (cache['p' + b.id]) return cache['p' + b.id];
    var td = today(), g = got(b), open = !g.bake, start = dayOf(b.at), limitAt = b.at + HOLD_H * 3600e3, limit = dayOf(limitAt);
    var ride = function (planned, done) { return done || (open && td > planned && td <= limit ? td : planned); };
    var portion = ride(addDays(start, 1), g.portion);
    var goal = addDays(portion, 1) > limit ? limit : addDays(portion, 1);
    var p = { b: b, got: g, start: start, portion: portion, limit: limit, limitAt: limitAt, open: open, over: open && Date.now() > limitAt };
    p.stretch1 = g.stretch1 || portion;                       /* the first stretch belongs to pan day; it does not carry to bake day */
    ['pull', 'stretch', 'bake'].forEach(function (s) { p[s] = ride(goal, g[s]); });
    return (cache['p' + b.id] = p);
  }
  function note(p, s, k) {
    var n = [], lead = s === 'portion' || s === 'bake';   /* one note per day: the pans carry it on pan day, the bake on bake day */
    if (!lead) return '';
    n.push(t('Dough from ' + stamp(p.b.at) + '.', 'Masa del ' + stamp(p.b.at) + '.'));
    var bakeDay = addDays(p.portion, 1) > p.limit ? p.limit : addDays(p.portion, 1), want = s === 'portion' ? addDays(p.start, 1) : bakeDay;
    if (!p.got[s] && k !== want) n.push(t('Carried over from ' + dayName(want) + '.', 'Pendiente desde el ' + dayName(want) + '.'));
    if (!p.got[s] && k === p.limit) n.push(s === 'portion' ? t('Last day: it reaches 72 hours at ' + clock(p.limitAt) + '. Pan it and bake it today.', '\u00daltimo d\u00eda: llega a 72 horas a las ' + clock(p.limitAt) + '. Ponla en moldes y hornea hoy.') : t('Last day: it reaches 72 hours at ' + clock(p.limitAt) + '.', '\u00daltimo d\u00eda: llega a 72 horas a las ' + clock(p.limitAt) + '.'));
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
    var dw = parse(k).getDay(), out = [], fresh = k >= SWITCH;
    var side = (DOUGH[dw] || []).filter(function (j) { return j && j.k && !j.st; });      /* chicken thaw and other keyed jobs */
    if (!fresh) {
      (OLD[dw] || []).forEach(function (j, i) {
        if (j.k) { var cur = side.filter(function (x) { return x.k === j.k; })[0] || j; out.push(Object.assign({}, cur, { _key: j.k })); }
        else out.push(Object.assign({}, j, { _key: i }));
      });
      side.forEach(function (j) { if (!out.some(function (x) { return x._key === j.k; })) out.push(Object.assign({}, j, { _key: j.k })); });
    } else {
      side.forEach(function (j) { out.push(Object.assign({}, j, { _key: j.k })); });
      batches().forEach(function (b) {
        var p = plan(b);
        if (p.start === k) out.push(Object.assign({}, JOB.mix, { when: clock(b.at), _key: 'mix_' + b.id, _bid: b.id }));
        STEP.forEach(function (s) {
          if (p[s] !== k || (p.got.bake && !p.got[s])) return;                    /* once it is baked, steps nobody ticked drop off */
          out.push(Object.assign({}, JOB[s], { _key: s + '_' + b.id, _bid: b.id, detail: note(p, s, k) }));
        });
      });
    }
    /* Ovens on 30 minutes before the bake: 3:30 PM for a 4 PM bake (this file's alert), 5:30 PM in the old week (key ovens,
       the older add-on's alert). One ovens line a day, tied to the first bake. */
    var bi = -1; out.forEach(function (j, i) { if (bi < 0 && /^Bake /.test(j.job)) bi = i; });
    if (bi >= 0) out.splice(bi, 0, { w: out[bi].w, when: fresh ? '3:30 PM' : '5:30 PM', job: 'Turn on both pizza ovens, 525 top and bottom, 30 minutes before the bake', min: '', s: 'Ovens on', _key: fresh ? 'ovens_' + out[bi]._bid : 'ovens' });
    out = out.map(function (j, i) { return [j, i]; }).sort(function (a, b) { return (rank(a[0]) - rank(b[0])) || (a[1] - b[1]); }).map(function (x) { return x[0]; });
    /* _i is what the older add-on's tick listener passes along: never a bare number, so it cannot be mistaken for a row. */
    out.forEach(function (j) { j._i = typeof j._key === 'number' ? 'p' + j._key : j._key; });
    return (cache[k] = out);
  }

  /* One line per batch that is going (or was baked in the last day and a half), then the buttons that start a batch. */
  function line(p) {
    var g = p.got, b = p.b, s, extra = '', td = today();
    if (g.bake) {
      var hrs = g.at.portion && g.at.bake ? Math.round((g.at.bake - g.at.portion) / 360000) / 10 : (g.portion && g.portion === g.bake ? 0 : null);
      s = t('Made ' + stamp(b.at) + (g.portion ? ', panned ' + (g.at.portion ? stamp(g.at.portion) : dayName(g.portion)) : '') + ', baked ' + (g.at.bake ? stamp(g.at.bake) : dayName(g.bake)) + '.', 'Hecha ' + stamp(b.at) + (g.portion ? ', en moldes ' + dayName(g.portion) : '') + ', horneada ' + dayName(g.bake) + '.');
      if (hrs != null && hrs < PAN_MIN_H) s += ' ' + t((hrs ? hrs + ' hours' : 'Same day') + ' in the pan, under the ' + PAN_MIN_H + ' hour minimum.', (hrs ? hrs + ' horas' : 'El mismo d\u00eda') + ' en el molde, menos del m\u00ednimo de ' + PAN_MIN_H + ' horas.');
    } else {
      var by = t(' Bake by ' + stamp(p.limitAt) + ' (72 hours).', ' Hornear antes del ' + stamp(p.limitAt) + ' (72 horas).');
      if (p.over) by = t(' It passed 72 hours at ' + stamp(p.limitAt) + '.', ' Pas\u00f3 las 72 horas el ' + stamp(p.limitAt) + '.');
      if (g.portion) {
        s = t('Made ' + stamp(b.at) + '. Panned ' + (g.at.portion ? stamp(g.at.portion) : dayName(g.portion)) + '. Bake ' + dayName(p.bake) + ' around 4 PM.', 'Hecha ' + stamp(b.at) + '. En moldes ' + dayName(g.portion) + '. Hornear el ' + dayName(p.bake) + ' como a las 4 PM.') + by;
        if (g.portion === td) extra += ' <button type="button" class="btn x-dbtn" data-dbake="' + b.id + '">' + t('Baked it today instead', 'Se horne\u00f3 hoy') + '</button>';
      } else s = t('Made ' + stamp(b.at) + '. Pan it ' + dayName(p.portion) + ', bake ' + dayName(p.bake) + ' around 4 PM.', 'Hecha ' + stamp(b.at) + '. Moldes el ' + dayName(p.portion) + ', hornear el ' + dayName(p.bake) + ' como a las 4 PM.') + by;
      extra += ' <button type="button" class="btn x x-dbtn" data-dgone="' + b.id + '">' + (ui.dGone === b.id ? t('Tap again to remove', 'Toca otra vez para quitar') : t('Remove', 'Quitar')) + '</button>';
    }
    return '<p class="status x-dline' + (p.over ? ' over' : '') + '"><b>' + (g.bake ? t('Baked.', 'Horneada.') : p.over ? t('Past 72 hours.', 'Pas\u00f3 72 horas.') : t('Dough going.', 'Masa en proceso.')) + '</b> ' + h(s) + extra + '</p>';
  }
  function status() {
    var now = Date.now(), list = batches().map(plan).filter(function (p) { return p.open ? now < p.limitAt + 36 * 3600e3 : (p.got.at.bake ? now - p.got.at.bake < 36 * 3600e3 : p.got.bake >= addDays(today(), -1)); });
    var going = list.some(function (p) { return p.open; });
    var html = list.map(line).join('');
    if (!going) html += '<p class="status x-dline"><b>' + t('No dough going.', 'No hay masa en proceso.') + '</b> ' + t('The goal is a batch every Thursday. Start one whenever you make dough.', 'La meta es una tanda cada jueves. Empieza una cuando hagas masa.') + '</p>';
    var days = [0, 1, 2, 3].map(function (i) { var k = addDays(today(), -i); return '<option value="' + k + '">' + (i === 0 ? t('Today', 'Hoy') : i === 1 ? t('Yesterday', 'Ayer') : h(dayName(k))) + '</option>'; }).join('');
    var nowHM = ('0' + new Date().getHours()).slice(-2) + ':' + ('0' + new Date().getMinutes()).slice(-2);
    html += '<div class="x-dstart"><button type="button" class="btn primary" data-dstart="now">' + t('Dough made now', 'Masa hecha ahora') + '</button>' +
      (ui.dForm ? '<span class="x-dform"><select id="x-dday" aria-label="' + t('Day', 'D\u00eda') + '">' + days + '</select><input type="time" id="x-dtime" value="' + nowHM + '" aria-label="' + t('Time', 'Hora') + '"><button type="button" class="btn primary" data-dstart="save">' + t('Save', 'Guardar') + '</button><button type="button" class="btn" data-dstart="cancel">' + t('Cancel', 'Cancelar') + '</button></span>'
        : '<button type="button" class="btn" data-dstart="form">' + t('Made earlier', 'Se hizo antes') + '</button>') + '</div>';
    return '<div class="x-dmade">' + html + '</div>';
  }
  /* After each draw: the batch lines and Start buttons on Today's dough card and above the Dough week, and each step's note on the week tiles. */
  function decorate() {
    var fold = document.querySelector('#view details[data-fold="dough"]');
    if (fold && !fold.querySelector('.x-dmade')) {
      var ul = fold.querySelector('ul.checks'), anchor = ul || fold.querySelector('p.status') || fold.querySelector('summary');
      anchor.insertAdjacentHTML(ul || anchor.tagName === 'SUMMARY' ? 'afterend' : 'beforebegin', status());
    }
    var week = document.querySelector('#view .x-dweek');
    if (week) {
      if (!week.parentNode.querySelector('.x-dmade')) week.insertAdjacentHTML('beforebegin', status());
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
  function startBatch(ms) {
    var id = 'b' + Date.now().toString(36), rec = { at: ms, by: who() }, patch = { b: {} }; patch.b[id] = rec;
    var cur = S.caldough.batches || {}, nb = Object.assign({}, cur.b); nb[id] = rec;
    S.caldough.batches = Object.assign({}, cur, { b: nb });
    save('caldough/batches', patch);
  }

  /* Alerts: the first stretch an hour after the pans come out, and ovens on at 3:30 PM on a bake day.
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
    cache = {};
    var js = jobs(td), dn = (S.caldough[td] || {}).done || {}, at = (S.caldough[td] || {}).at || {};
    js.forEach(function (j) {
      if (live || dn[j._key]) return;
      if (/^ovens_/.test(String(j._key)) && hm >= 15 * 60 + 30 && hm < 17 * 60)
        live = { key: j._key, late: hm >= 15 * 60 + 45, text: t('3:30 PM: turn on both pizza ovens, 525 top and bottom. Bake is at 4', '3:30 PM: prende los dos hornos de pizza, 525 arriba y abajo. Se hornea a las 4'), done: t('Ovens are on', 'Hornos prendidos') };
      if (j.st === 'stretch1') {
        var pk = 'portion_' + j._bid, t0 = at[pk];
        if (dn[pk] && t0 && Date.now() - t0 >= 3600e3 && Date.now() - t0 < 6 * 3600e3)
          live = { key: j._key, late: Date.now() - t0 >= 2 * 3600e3, time: true, text: t('First stretch: the pans have been out since ' + clock(t0) + '. Stretch, cover, back in the fridge', 'Primer estirado: los moldes est\u00e1n fuera desde las ' + clock(t0) + '. Estira, tapa y al refrigerador'), done: t('Stretched', 'Estirado') };
      }
    });
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
    /* Keep the two-batch week for the days before the switch. From the switch on, the fixed week is gone: only keyed
       jobs another add-on put on a day (chicken) stay on that day, and dough steps come from the batches. */
    [0, 1, 2, 3, 4, 5, 6].forEach(function (dw) {
      var cur = DOUGH[dw] || [];
      OLD[dw] = cur.filter(function (j) { return !(j.k && j.k !== 'thaw'); });
      DOUGH[dw] = cur.filter(function (j) { return j.k; });
    });
    if (typeof ES === 'object' && ES) {
      var more = { 'Mix the dough (20 qt), into the fridge': 'Mezcla la masa (20 qt), al refrigerador', 'Portion into pans, then leave them out 1 to 2 hours': 'Porciona en moldes y d\u00e9jalos fuera 1 a 2 horas', 'First stretch, then cover and back in the fridge': 'Primer estirado, luego tapa y al refrigerador',
        'Pull the pans from the fridge and let them rise': 'Saca los moldes del refrigerador y deja que suban', 'Stretch again if it needs it': 'Estira otra vez si hace falta', 'Bake the pans': 'Hornea los moldes', 'Pan day': 'D\u00eda de moldes', '1 to 2 hours later': '1 a 2 horas despu\u00e9s', 'Made': 'Hecha' };
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
    /* The mix line is the batch itself: it shows ticked for as long as the batch exists. */
    dDone = function (k, i) { var j = jobs(k)[i], d = S.caldough[k]; return !!(j && (j.st === 'mix' || (d && d.done && d.done[j._key]))); };
    var st = document.createElement('style');
    st.textContent = '.x-dmade{margin:10px 0;display:grid;gap:8px}.x-dline{margin:0}.x-dline.over{color:var(--cherry,#8B1E1E)}.x-dbtn{margin-left:8px;min-height:38px}' +
      '.x-dstart{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.x-dstart .btn{min-height:46px}.x-dform{display:inline-flex;flex-wrap:wrap;gap:8px;align-items:center}' +
      '.x-dform select,.x-dform input{min-height:46px;font-size:16px;padding:6px 10px;border-radius:10px;border:1px solid var(--line,#ccc);background:var(--surface,#fff);color:var(--ink,#18181B)}' +
      '.x-dj .x-dnote{color:var(--cherry,#8B1E1E)}' +
      '#x-dalert{position:fixed;left:0;right:0;top:0;z-index:9390;padding:calc(10px + env(safe-area-inset-top,0px)) 12px 10px;background:var(--cherry,#8B1E1E);color:#fff;box-shadow:0 6px 24px rgba(0,0,0,.35)}' +
      '#x-dalert.late{background:#5A0F0F;animation:x-dpulse 1.2s ease-in-out infinite}@keyframes x-dpulse{50%{background:#8B1E1E}}' +
      '.x-dal{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;max-width:1100px;margin:0 auto;font-size:17px}.x-dal b span{font-weight:400;opacity:.9}.x-dalb{display:flex;gap:8px}' +
      '#x-dalert .btn{min-height:44px}#x-dalert .btn.primary{background:#fff;color:var(--cherry,#8B1E1E)}#x-dalert .btn:not(.primary){background:transparent;color:#fff;border-color:rgba(255,255,255,.6)}';
    document.head.appendChild(st);
    var r0 = render;
    render = function () { cache = {}; r0.apply(this, arguments); try { decorate(); } catch (e) {} };
    /* A tick on a batch step also saves the time, for the first-stretch reminder and hours in the pan. */
    document.addEventListener('change', function (e) {
      var el = e.target; if (!el || !el.dataset || !el.dataset.dtoggle) return;
      var q = el.dataset.dtoggle.split('|'), key = dKey(q[0], q[1]);
      if (typeof key !== 'string') return;
      if (/^mix_/.test(key)) { e.stopImmediatePropagation(); el.checked = true; return; }
      if (/^(portion|stretch1|pull|stretch|bake)_b/.test(key)) {
        var at = {}; at[key] = el.checked ? Date.now() : null;
        var cur = S.caldough[q[0]] || {}; S.caldough[q[0]] = Object.assign({}, cur, { at: Object.assign({}, cur.at, at) });
        save('caldough/' + q[0], { at: at });
      }
    }, true);
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-dstart],[data-dbake],[data-dgone]'); if (!b) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (b.dataset.dbake) { setDone(today(), 'ovens_' + b.dataset.dbake, true, false); setDone(today(), 'bake_' + b.dataset.dbake, true, true); render(); return; }
      if (b.dataset.dgone) {
        var id = b.dataset.dgone;
        if (ui.dGone !== id) { ui.dGone = id; render(); setTimeout(function () { if (ui.dGone === id) { ui.dGone = null; render(); } }, 5000); return; }
        ui.dGone = null;
        var cur = S.caldough.batches || {}, nb = Object.assign({}, cur.b); nb[id] = Object.assign({}, nb[id], { gone: true });
        S.caldough.batches = Object.assign({}, cur, { b: nb });
        var patch = { b: {} }; patch.b[id] = { gone: true }; save('caldough/batches', patch); render(); return;
      }
      var a = b.dataset.dstart;
      if (a === 'now') { ui.dForm = false; startBatch(Date.now()); }
      else if (a === 'form') ui.dForm = true;
      else if (a === 'cancel') ui.dForm = false;
      else if (a === 'save') {
        var d = document.getElementById('x-dday'), tm = document.getElementById('x-dtime'), day = d ? d.value : today(), hmv = (tm && tm.value) || '12:00';
        var dt = parse(day); dt.setHours(+hmv.split(':')[0], +hmv.split(':')[1] || 0, 0, 0);
        if (dt.getTime() > Date.now()) dt = new Date();
        ui.dForm = false; startBatch(dt.getTime());
      }
      render();
    }, true);
    setInterval(function () { try { alerts(); } catch (e) {} }, 30000); setTimeout(function () { try { alerts(); } catch (e) {} }, 2500);
    window.VicioDough = { jobs: jobs, plan: plan, batches: batches, status: status };
    render();
  }
  start();
})();
