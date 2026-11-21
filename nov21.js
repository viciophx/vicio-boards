/* Vicio board changes, Nov 21 2026 (Eric). Loaded by config.js on both boards; it waits for the board on its own.
   1. Every checklist: each area in a red outlined box, the area being worked on in red under the title, and a check-all on
      the list and on each area ("Are you sure? Eric is going to check." first). Both boards.
   2. FOH, two-shift days: the AM lists get a lighter grey card than the PM lists.
   3. Ice machine: every tap is logged under a name, and the switch says who flipped it last. Both boards.
   4. FOH: black main background; the floor 10 wide by 5.5 tall (was 10 by 7) with tables keeping their shape.
   5. FOH Reservations: a short date (Sat Nov 21) to the left of Inside / Patio; New reservation shows the 21+ birth date;
      Name and Guests on one line; the date label says Today or the day picked; a table suggestion from the guest count.
   6. FOH floor, once: the bar 25% wider, B1 to B5 spread evenly under it, the DJ next to TV 5, a host stand left of table 17.
      The layout from before is kept in seating/layout_before_1121.
   7. BOH: an Open mode to the left of Prep with only the opening checklist, in four areas. */
(function () {
  if (window.__vicioNov21) return;
  window.__vicioNov21 = true;
  var BOARD = window.VICIO_BOARD;
  if (BOARD !== 'foh' && BOARD !== 'kitchen') return;
  var A = Array.prototype;
  function es() { try { return BOARD === 'foh' ? ui.lang === 'es' : (typeof lang === 'function' && lang() === 'es'); } catch (e) { return false; } }
  function tt(en, sp) { return es() ? sp : en; }
  function hx(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function style(css) { var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); }
  function flash(msg) {
    var el = document.getElementById('x-amsg');
    if (!el) { el = document.createElement('div'); el.id = 'x-amsg'; el.setAttribute('role', 'alert'); el.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:16px;z-index:9500;max-width:92vw;background:#8B1E1E;color:#fff;font:600 15px/1.4 system-ui,sans-serif;padding:12px 16px;border-radius:12px'; document.body.appendChild(el); }
    el.textContent = msg; el.style.display = 'block'; clearTimeout(flash.t); flash.t = setTimeout(function () { el.style.display = 'none'; }, 6000);
  }
  function ready() { return typeof render === 'function' && typeof S !== 'undefined' && typeof ui !== 'undefined' && typeof save === 'function' && document.getElementById('view'); }
  function me() { try { return BOARD === 'foh' ? whoName() : (ui.by || ''); } catch (e) { return ''; } }
  function amDay(d) {
    try { return shiftsOn(d).some(function (w) { return ((w.org || w.location || 'Vicio') === 'Vicio' || /vicio/i.test(w.role || '')) && mins(w.start) < 15 * 60; }); } catch (e) { return false; }
  }
  /* Rewrites a board function from its own source, so the change follows whatever the board has today. */
  function patchFn(name, pairs) {
    try {
      var f = window[name]; if (typeof f !== 'function' || f.__n21) return false;
      var src = f.toString(), ok = pairs.every(function (p) { return src.indexOf(p[0]) >= 0; });
      if (!ok) return false;
      pairs.forEach(function (p) { src = src.split(p[0]).join(p[1]); });
      var old = f; (0, eval)(name + ' = ' + src); window[name].__n21 = true;
      try { if (typeof VIEWS !== 'undefined') Object.keys(VIEWS).forEach(function (k) { if (VIEWS[k] === old) VIEWS[k] = window[name]; }); } catch (e) {}
      return true;
    } catch (e) { return false; }
  }

  /* ---------- 1 and 2. Every checklist ---------- */
  var armed = null;
  function lbl(k) { return armed && armed.k === k ? hx(tt('Are you sure? Eric is going to check.', '\u00bfSeguro? Eric lo va a revisar.')) : '\u2713 ' + tt('All', 'Todo'); }
  function btn(k, aria) { return '<button type="button" class="x-all' + (armed && armed.k === k ? ' armed' : '') + '" data-xall="' + hx(k) + '" aria-label="' + hx(aria) + '">' + lbl(k) + '</button>'; }
  function open(el) { return A.filter.call(el.querySelectorAll('input[data-chk^="shifts/"]'), function (x) { return !x.checked && !x.disabled; }); }
  function title(card) { var h = card.querySelector('h3'); return h ? (h.firstChild && h.firstChild.nodeType === 3 ? h.firstChild.textContent : h.textContent).trim() : ''; }
  function decorate() {
    var day = ui.date || iso(new Date()), am = BOARD === 'foh' && amDay(day);
    A.forEach.call(document.querySelectorAll('#view .card'), function (card, ci) {
      if (card.dataset.xcard || card.querySelector('.card') || !card.querySelector('ul.checks input[data-chk^="shifts/"]')) return;
      var k = card.dataset.fold || (title(card) + '#' + ci); card.dataset.xcard = k;
      if (am && /^(bar|host)_(open|amchk|amoff)_/.test(k)) card.classList.add('x-am');
      if (card.querySelector('.x-hsec')) return;   /* Host / Busser open already has its boxes from amshift.js */
      var boxes = [];
      A.forEach.call(card.querySelectorAll('ul.checks'), function (ul) {
        if (!ul.querySelector('input[data-chk^="shifts/"]')) return;
        var g = ul.previousElementSibling && ul.previousElementSibling.classList.contains('grp') ? ul.previousElementSibling : null;
        var box = document.createElement('div'); box.className = 'x-hsec';
        ul.parentNode.insertBefore(box, g || ul); if (g) box.appendChild(g); box.appendChild(ul);
        boxes.push([box, g]);
      });
      boxes.forEach(function (b, i) {
        var left = open(b[0]).length; if (!left) b[0].classList.add('ok');
        if (b[1] && left && boxes.length > 1) b[1].insertAdjacentHTML('beforeend', btn(k + '|' + i, tt('Check all in ', 'Marcar todo en ') + b[1].textContent.replace(/\s*\d+\/\d+\s*$/, '')));
      });
      var h3 = card.querySelector('h3'), cur = boxes.filter(function (b) { return b[1] && open(b[0]).length; })[0];
      if (h3 && boxes.some(function (b) { return b[1]; }) && !card.querySelector('.x-hcur')) {
        var nm = cur ? ((cur[1].querySelector('span') || cur[1]).textContent || '').trim() : tt('All done', 'Todo listo');
        h3.insertAdjacentHTML('beforeend', '<span class="x-hcur">' + hx(nm) + '</span>');
      }
      if (open(card).length) { var head = card.querySelector('summary .cardhead') || card.querySelector('.cardhead'); if (head) head.insertAdjacentHTML('beforeend', btn(k + '|all', tt('Check all', 'Marcar todo'))); }
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button[data-xall]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var k = b.dataset.xall;
    if (!armed || armed.k !== k) { armed = { k: k, at: Date.now() }; b.innerHTML = lbl(k); b.classList.add('armed'); setTimeout(function () { if (armed && armed.k === k && Date.now() - armed.at >= 4900) { armed = null; render(); } }, 5000); return; }
    armed = null;
    var who = me(); if (!who) { flash(tt('Sign in with your name first.', 'Primero pon tu nombre.')); render(); return; }
    var card = b.closest('[data-xcard]') || b.closest('.card'); if (!card) { render(); return; }
    var part = k.slice(k.lastIndexOf('|') + 1), scope = part === 'all' ? card : card.querySelectorAll('.x-hsec')[+part];
    var ins = open(scope || card); if (!ins.length) { render(); return; }
    var byPath = {}; ins.forEach(function (x) { var p = x.dataset.chk.split('|'); (byPath[p[0]] = byPath[p[0]] || []).push(p[1]); });
    var label = (title(card) + (part === 'all' ? '' : ': ' + ((scope.querySelector('.grp span') || {}).textContent || part))).slice(0, 90);
    Object.keys(byPath).forEach(function (path) {
      var ids = byPath[path], patch = { done: {}, by: {}, bulk: {} };
      ids.forEach(function (id) { patch.done[id] = true; patch.by[id] = who; });
      patch.bulk[label] = { at: Date.now(), by: who, n: ids.length };
      if (S.shift) S.shift = Object.assign({}, S.shift, { done: Object.assign({}, S.shift.done, patch.done), by: Object.assign({}, S.shift.by, patch.by), bulk: Object.assign({}, S.shift.bulk, patch.bulk) });
      save(path, patch);
      ids.forEach(function (id) {
        try { if (BOARD === 'foh') { if (typeof markListDone === 'function') markListDone(path, id, true); } else if (typeof checkListDone === 'function') checkListDone(path, id, true); } catch (err) {}
      });
    });
    render();
  }, true);
  style('.x-hsec{border:2px solid var(--cherry,#8B1E1E);border-radius:12px;padding:6px 12px 10px;margin:10px 0}.x-hsec.ok{border-color:var(--line,#ccc);opacity:.85}.x-hsec .grp{margin-top:4px;display:flex;align-items:center;gap:10px}' +
    '.x-hcur{display:block;color:var(--cherry,#8B1E1E);font:700 15px/1.3 system-ui,-apple-system,sans-serif;margin-top:3px;text-transform:none;letter-spacing:0}' +
    '.x-all{margin-left:auto;min-height:36px;padding:4px 12px;border-radius:999px;border:1.5px solid var(--cherry,#8B1E1E);background:transparent;color:var(--cherry,#8B1E1E);font:700 13px system-ui,-apple-system,sans-serif;cursor:pointer;white-space:nowrap}' +
    '.x-all.armed,.x-all:active{background:var(--cherry,#8B1E1E);color:#fff}.cardhead{flex-wrap:wrap}.card.x-am{background:#2E2E35}');

  /* ---------- 3. Ice machine: always under a name ---------- */
  function iceNames() {
    if (BOARD === 'foh') {
      try { var x = JSON.parse(localStorage.getItem('vicio_foh_names') || 'null'); if (x && x.date === svcDate() && Array.isArray(x.names) && x.names.length) return x.names; } catch (e) {}
      var n = me(); return n ? [n] : [];
    }
    try { var y = JSON.parse(localStorage.getItem('vicio_by') || 'null'); if (Array.isArray(y)) return y.filter(Boolean); if (typeof y === 'string' && y) return [y]; } catch (e) {}
    var s = ''; try { s = localStorage.getItem('vicio_by') || ''; } catch (e) {} return s ? [s] : [];
  }
  function pick(list, ttl, cb) {
    var old = document.getElementById('x-askwho'); if (old) old.remove();
    var m = document.createElement('div'); m.id = 'x-askwho';
    m.innerHTML = '<div class="x-ask" role="dialog" aria-modal="true"><h3>' + hx(ttl) + '</h3><div class="chips">' +
      list.map(function (n) { return '<button type="button" class="btn" data-askwho="' + hx(n) + '">' + hx(n) + '</button>'; }).join('') +
      '</div><button type="button" class="btn x" data-askwho="">\u2715</button></div>';
    m.addEventListener('click', function (e) { var b = e.target.closest('[data-askwho]'); if (b) { e.stopPropagation(); m.remove(); if (b.dataset.askwho) cb(b.dataset.askwho); } else if (e.target === m) m.remove(); }, true);
    document.body.appendChild(m);
  }
  function iceWho(on, cb) {
    var ttl = on ? tt('Who turned it on?', '\u00bfQui\u00e9n la prendi\u00f3?') : tt('Who turned it off?', '\u00bfQui\u00e9n la apag\u00f3?'), list = iceNames();
    if (list.length > 1) return pick(list, ttl, cb);
    if (list.length === 1) return cb(list[0]);
    var sch = [];
    try { var d = BOARD === 'foh' ? svcDate() : (ui.date || iso(new Date())); sch = shiftsOn(d).map(function (w) { return w.name; }).filter(function (n, i, a) { return n && a.indexOf(n) === i; }); } catch (e) {}
    if (sch.length) return pick(sch, ttl, cb);
    var n = (window.prompt(ttl) || '').trim().slice(0, 30); if (n) cb(n);
  }
  window.addEventListener('click', function (e) {
    if (!ready()) return;
    var b = e.target.closest && e.target.closest('[data-ice]'); if (!b) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var on = b.dataset.ice === 'on';
    iceWho(on, function (n) {
      var at = Date.now(), rec = { on: on, by: n, at: at, log: {} }; rec.log[at] = { on: on, by: n };
      S.ice = Object.assign({}, S.ice, { on: on, by: n, at: at, log: Object.assign({}, (S.ice && S.ice.log) || {}, rec.log) });
      try { if (typeof db !== 'undefined' && db && db.doc) db.doc('e86/icemachine').update(rec); else save('e86/icemachine', rec); } catch (err) { save('e86/icemachine', rec); }
      render();
    });
  }, true);
  function iceLabel() {
    var x = S.ice; if (!x || !x.at) return;
    var when = new Date(x.at).toLocaleTimeString(es() ? 'es-MX' : 'en-US', { hour: 'numeric', minute: '2-digit' });
    var txt = (x.on ? tt('On', 'Prendida') : tt('Off', 'Apagada')) + (x.by ? ' ' + tt('by', 'por') + ' ' + String(x.by).split(' ')[0] : '') + ' \u00b7 ' + when;
    A.forEach.call(document.querySelectorAll('.x-iceswitch .x-isl small'), function (s) { if (s.textContent !== txt) s.textContent = txt; });
  }

  /* ---------- 4 to 6. FOH floor and reservations ---------- */
  window.FLOOR_H = 5.5;
  if (BOARD === 'foh') style(':root,html,body{--bg:#000000!important}.floor{aspect-ratio:10/5.5!important}html.big .floor{aspect-ratio:10/5.5!important}' +
    '.fixture{font-size:13px!important;letter-spacing:.06em!important;overflow:hidden;white-space:nowrap}' +
    '.rvline.rvtop{grid-template-columns:minmax(0,1fr) 96px}.rvline.rvdt{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.rvsug{margin:0 0 4px}#rv-sug:empty{display:none}' +
    '.sdate{font-size:16px;white-space:nowrap;display:inline-flex;align-items:center;gap:6px;padding:0 2px}.sdate .pill{font-size:10px;padding:2px 6px}.sdiv{width:1px;align-self:stretch;background:var(--line);margin:0 2px}' +
    '.seatmain{min-width:0}.seatmain>.bar>.nav:first-child{flex-wrap:nowrap;gap:5px;min-width:0}.seatmain>.bar>.nav:first-child>.btn{padding-left:9px;padding-right:9px;white-space:nowrap}.seatmain>.bar>.nav:first-child .pct{display:none}.seatmain>.bar>.nav:first-child>.btn[data-act=dprev],.seatmain>.bar>.nav:first-child>.btn[data-act=dnext]{padding-left:8px;padding-right:8px}');
  window.rvDateLbl = function (d) { return 'Date \u00b7 ' + (d === iso(new Date()) ? 'Today' : fmt(d, { weekday: 'short', month: 'short', day: 'numeric' })); };
  /* Smallest open table that fits with two seats or fewer to spare, or two or three tables close together in the same area.
     Open: no other reservation within 90 minutes and no event holding that space. Bar stools and standing spots are left out. */
  window.rvSuggest = function (n, d, time, skipId) {
    n = +n; if (!n || n < 1) return [];
    var m = resvTime(time), busy = function (id) { return resvOn(d).some(function (r) { return r.id !== skipId && activeResv(r) && r.table === id && Math.abs(resvTime(r.time) - m) < 90; }); };
    var ts = tables().filter(function (t) { return t.shape !== 'stool' && !t.standing && +t.seats > 0 && !busy(t.id) && !eventFor(t, d); });
    var seats = function (g) { return g.reduce(function (a, t) { return a + (+t.seats); }, 0); };
    var near = function (a, b) { return (a.area || 'Inside') === (b.area || 'Inside') && Math.hypot((+a.x) - (+b.x), ((+a.y) - (+b.y)) * .55) < 24; };
    var out = [], one = ts.filter(function (t) { return +t.seats >= n; }).sort(function (a, b) { return a.seats - b.seats; })[0];
    if (one && one.seats - n <= 2) out.push([one]);
    var best = null, bs = 1e9, score = function (g) { return (seats(g) - n) * 10 + g.length * 3; };
    for (var i = 0; i < ts.length; i++) for (var j = i + 1; j < ts.length; j++) {
      var g = [ts[i], ts[j]]; if (seats(g) >= n && near(g[0], g[1]) && score(g) < bs) { bs = score(g); best = g; }
      if (n > 8) for (var k = j + 1; k < ts.length; k++) { var h = [ts[i], ts[j], ts[k]]; if (seats(h) >= n && near(h[0], h[1]) && (near(h[1], h[2]) || near(h[0], h[2])) && score(h) < bs) { bs = score(h); best = h; } }
    }
    if (best && (!out.length || seats(best) < out[0][0].seats)) out.push(best);
    if (!out.length && one) out.push([one]);
    return out.slice(0, 2);
  };
  window.rvSugHtml = function (n, d, time, skipId) {
    if (!+n) return '';
    var o = rvSuggest(n, d, time, skipId);
    if (!o.length) return '<p class="status rvsug">No open table fits ' + hx(n) + ' at ' + hx(time) + '. Pick one below or assign later.</p>';
    return '<p class="status rvsug">Suggested for ' + hx(n) + ':</p><div class="chips">' + o.map(function (g) {
      var ns = g.map(function (t) { return t.n; }).join(' + '), s = g.reduce(function (a, t) { return a + (+t.seats); }, 0);
      return '<button type="button" class="btn x" data-rvsug="' + g.map(function (t) { return t.id; }).join(',') + '">' + (g.length > 1 ? 'Tables ' + hx(ns) + ' \u00b7 ' + s + ' seats, push together' : 'Table ' + hx(ns) + ' \u00b7 ' + s + ' top') + '</button>';
    }).join('') + '</div>';
  };
  var RESV_FORM = function resvForm(r) {
    var v = Object.assign({}, r || {}, ((ui.rvDraft || {})[rvKey(r)]) || {}), tl = tables().slice().sort(function (a, b) { return AREAS.indexOf(a.area) - AREAS.indexOf(b.area) || String(a.n).localeCompare(String(b.n), undefined, { numeric: true }); });
    var dd = v.date || ui.date, tm = v.time || '7:00 PM';
    return '<div class="fields">' +
      '<div class="rvline rvtop"><label class="fld" for="rv-name">Name<input type="text" id="rv-name" value="' + esc(v.name || '') + '" placeholder="Guest name" autocomplete="off" autocorrect="off"></label><label class="fld" for="rv-size">Guests<input type="number" id="rv-size" min="1" max="60" inputmode="numeric" value="' + esc(v.size || '') + '" data-rvskip="' + esc((r && r.id) || '') + '"></label></div>' +
      '<div class="fld-full" id="rv-sug">' + rvSugHtml(v.size, dd, tm, r && r.id) + '</div>' +
      '<div class="rvline rvdt"><label class="fld" for="rv-date"><span id="rv-dlbl">' + esc(rvDateLbl(dd)) + '</span><input type="date" id="rv-date" value="' + esc(dd) + '"></label><label class="fld" for="rv-time">Time<select id="rv-time">' + RTIMES.map(function (x) { return '<option' + (tm === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label></div>' +
      '<label class="fld" for="rv-phone">Phone *<input type="tel" id="rv-phone" value="' + esc(v.phone || '') + '" placeholder="Required" required autocomplete="off"></label>' +
      '<label class="fld" for="rv-table">Table<select id="rv-table"><option value="">Assign later</option>' + tl.map(function (t) { return '<option value="' + t.id + '"' + (v.table === t.id ? ' selected' : '') + '>' + esc(t.n) + ' \u00b7 ' + esc(t.area) + ' \u00b7 ' + (t.shape === 'stool' ? 'bar seat' : t.standing ? 'standing' : t.seats + ' top') + '</option>'; }).join('') + '</select></label></div>' +
      '<label class="fld" for="rv-note">Note<input type="text" id="rv-note" value="' + esc(v.note || '') + '" placeholder="Birthday, high chair, allergy, patio request" autocomplete="off"></label>';
  };
  if (BOARD === 'foh') {
    document.addEventListener('input', function (e) {
      var id = e.target && e.target.id; if (!/^rv-(size|date|time)$/.test(id || '')) return;
      var g = function (x) { return document.getElementById(x); }, sz = g('rv-size'), dt = g('rv-date'), tm = g('rv-time'), sug = g('rv-sug'), lb = g('rv-dlbl');
      if (lb && dt) lb.textContent = rvDateLbl(dt.value || ui.date);
      if (sug && sz) sug.innerHTML = rvSugHtml(sz.value, (dt && dt.value) || ui.date, (tm && tm.value) || '7:00 PM', sz.dataset.rvskip || null);
    }, true);
    document.addEventListener('change', function (e) { if (e.target && /^rv-(date|time)$/.test(e.target.id || '')) e.target.dispatchEvent(new Event('input', { bubbles: true })); }, true);
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-rvsug]'); if (!b) return; e.preventDefault(); e.stopPropagation();
      var ids = b.dataset.rvsug.split(','), sel = document.getElementById('rv-table'), note = document.getElementById('rv-note');
      if (sel) { sel.value = ids[0]; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); }
      if (ids.length > 1 && note) {
        var ns = ids.map(function (id) { return (tables().find(function (t) { return t.id === id; }) || {}).n; }).join(' + '), line = 'Push together: ' + ns;
        if (note.value.indexOf(line) < 0) { note.value = (note.value ? note.value + '. ' : '') + line; note.dispatchEvent(new Event('input', { bubbles: true })); }
      }
      A.forEach.call(b.parentNode.querySelectorAll('[data-rvsug]'), function (x) { x.classList.toggle('primary', x === b); });
    }, true);
  }
  function fohPatches() {
    /* Table heights follow the floor's 5.5; bar stools can be smaller on the Inside map so five fit under the bar. */
    patchFn('tvMiniMap', [["(h*k/7).toFixed(2)", "(h*k/FLOOR_H).toFixed(2)"]]);
    patchFn('resvSection', [["return fold('resv','New reservation',''", "const now=new Date(),b21=new Date(now.getFullYear()-21,now.getMonth(),now.getDate());return fold('resv','New reservation',`21+: born on or before ${b21.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`"]]);
    patchFn('vSeating', [
      ["return `${dateBar(cnt('seated')+' seated · '+covers+' guests')}\n  <div class=\"seatlayout\"><div class=\"seatmain\">\n  <div class=\"bar\"><div class=\"nav\">${AREAS",
       "const isT=d===iso(new Date()),sd=fmt(d,{weekday:'short',month:'short',day:'numeric'}).replace(/,/g,'');const dnav=`<button class=\"btn\" data-act=\"dprev\" aria-label=\"Previous day\">‹</button><span class=\"date sdate\">${esc(sd)}${isT?' <span class=\"pill good\">Today</span>':''}</span><button class=\"btn\" data-act=\"dnext\" aria-label=\"Next day\">›</button>${isT?'':'<button class=\"btn\" data-act=\"dtoday\">Today</button>'}<span class=\"sdiv\" aria-hidden=\"true\"></span>`;\n  return `<div class=\"seatlayout\"><div class=\"seatmain\">\n  <div class=\"bar\"><div class=\"nav\">${dnav}${AREAS"],
      ["eventFor(t)).length}</span>`:''}</div>`}", "eventFor(t)).length}</span>`:''}<span class=\"count\">${cnt('seated')} seated · ${covers} guests</span></div>`}"]]);
    if (typeof resvForm === 'function' && !resvForm.__n21) { resvForm = RESV_FORM; resvForm.__n21 = true; }
  }
  /* Table heights were worked out for a floor 7 tall; the floor is 5.5 now, so each table's height is scaled to keep its
     shape. Bar stools can be smaller on the Inside map so five fit under the bar. */
  function tableHeights() {
    A.forEach.call(document.querySelectorAll('#floor .tbl'), function (el) {
      if (el.dataset.h21) return; el.dataset.h21 = '1';
      var small = el.classList.contains('stool') && ui.area !== 'Bar';
      el.style.height = el.style.height.replace(/max\((\d+)px,\s*([\d.]+)%\)/, function (m, px, pc) { return 'max(' + (small ? 28 : px) + 'px, ' + (pc * 7 / FLOOR_H).toFixed(2) + '%)'; });
      if (small) el.style.width = el.style.width.replace(/max\((\d+)px,/, 'max(28px,');
    });
  }
  /* The floor fix, once, on the first iPad that has the layout loaded. */
  function fixLayout1121() {
    var L = S.layout || {}; if (L.fix1121 || !(L.tables || []).length || fixLayout1121.done) return;
    if (typeof drag !== 'undefined' && drag && drag.el) return;
    fixLayout1121.done = true;
    var fx = (L.fixtures || []).map(function (f) { return JSON.parse(JSON.stringify(f)); }), ts = (L.tables || []).map(function (t) { return Object.assign({}, t); });
    var inside = function (f) { return (f.area || 'Inside') === 'Inside'; }, cl = function (v) { return Math.max(1, Math.min(99, +(+v).toFixed(1))); };
    var bnd = function (f) { return f.pts ? { l: Math.min.apply(null, f.pts.map(function (p) { return +p[0]; })), r: Math.max.apply(null, f.pts.map(function (p) { return +p[0]; })), t: Math.min.apply(null, f.pts.map(function (p) { return +p[1]; })), b: Math.max.apply(null, f.pts.map(function (p) { return +p[1]; })) } : { l: f.x - f.w / 2, r: f.x + f.w / 2, t: f.y - f.h / 2, b: f.y + f.h / 2 }; };
    var bar = fx.find(function (f) { return inside(f) && !f.on && /\bbar\b/i.test(f.label || ''); });
    if (bar) {
      var b0 = bnd(bar), cx = (b0.l + b0.r) / 2;
      if (bar.pts) bar.pts = bar.pts.map(function (p) { return [cl(cx + (+p[0] - cx) * 1.25), +p[1]]; }); else bar.w = +Math.min(98, bar.w * 1.25).toFixed(1);
      var nb = bnd(bar), w = nb.r - nb.l, bs = ts.filter(function (t) { return /^B\s*[1-5]$/i.test(String(t.n).trim()); }).sort(function (a, c) { return String(a.n).localeCompare(String(c.n), undefined, { numeric: true }); });
      bs.forEach(function (t, i) { var x = cl(nb.l + w * (i + .5) / bs.length), y = cl(nb.b + 7); if ((t.area || 'Inside') === 'Inside') { t.x = x; t.y = y; } else { t.ix = x; t.iy = y; } });
    }
    var tv5 = (typeof TVS !== 'undefined' ? TVS : []).find(function (t) { return t.id === 'tv5'; }), dj = fx.find(function (f) { return inside(f) && /\bdj\b/i.test(f.label || ''); });
    if (tv5) {
      var dw = Math.max(9, dj && !dj.pts ? +dj.w : 9), dh = Math.max(9, dj && !dj.pts ? +dj.h : 9), dx = cl(tv5.x - 11 - dw / 2), dy = cl(1 + dh / 2 + 1);
      if (dj && !dj.pts) { dj.x = dx; dj.y = dy; dj.w = dw; dj.h = dh; dj.on = false; } else if (dj) { dj.lx = dx; dj.ly = dy; } else fx.push({ label: 'DJ', area: 'Inside', x: dx, y: dy, w: dw, h: dh });
    }
    var t17 = ts.find(function (t) { return String(t.n).trim() === '17'; });
    if (t17) {
      var tin = (t17.area || 'Inside') === 'Inside', px = tin ? +t17.x : +t17.ix, py = tin ? +t17.y : +t17.iy, tw = tblSize(t17)[0] * TK / 10;
      if (!isNaN(px)) {
        var hs = fx.find(function (f) { return inside(f) && /host/i.test(f.label || '') && !f.pts; }), hw = 12, hxp = cl(px - tw / 2 - 1.5 - hw / 2);
        if (hs) { hs.x = hxp; hs.y = cl(py); hs.w = Math.max(+hs.w || 0, hw); hs.h = Math.max(+hs.h || 0, 11); } else fx.push({ label: 'Host', area: 'Inside', x: hxp, y: cl(py), w: hw, h: 11 });
      }
    }
    var at = Date.now();
    save('seating/layout_before_1121', { tables: L.tables, fixtures: L.fixtures || [], at: at });
    S.layout = Object.assign({}, L, { tables: ts, fixtures: fx, fix1121: at });
    save('seating/layout', { tables: ts, fixtures: fx, fix1121: at, updated: at });
    render();
  }

  /* ---------- 7. BOH Open mode ---------- */
  var CATS = [
    ['Turn on equipment', 'Encender el equipo', function (t) { return /^turn on|warmer/i.test(t) && !/dish/i.test(t); }],
    ['Cleaning and sanitizing', 'Limpieza y sanitizante', function (t) { return /saniti|dish pit|dish machine|clean/i.test(t); }],
    ['Filling bottles', 'Llenar botellas', function (t) { return /^fill /i.test(t); }],
    ['Setup', 'Montaje', function () { return true; }]];
  function openView() {
    var d = ui.date || iso(new Date()), done = (S.shift && S.shift.done) || {}, all = LISTS.ol_[1]().map(function (t, i) { return ['ol_' + i, t]; });
    var groups = CATS.map(function (c) { return [c, []]; });
    all.forEach(function (it) { for (var g = 0; g < groups.length; g++) if (groups[g][0][2](it[1])) { groups[g][1].push(it); return; } });
    var c = all.filter(function (x) { return done[x[0]]; }).length, p = all.length ? Math.round(100 * c / all.length) : 0, path = 'shifts/' + d;
    return '<section class="card edge x-open"><div class="cardhead"><h3>' + tt('Opening checklist', 'Lista de apertura') + '</h3><span class="count">' + c + tt(' of ', ' de ') + all.length + '</span></div>' + progress(p) +
      groups.filter(function (g) { return g[1].length; }).map(function (g) {
        var n = g[1].filter(function (x) { return done[x[0]]; }).length;
        return '<p class="grp"><span>' + hx(tt(g[0][0], g[0][1])) + '</span><span>' + n + '/' + g[1].length + '</span></p>' + checklist(path, g[1], done);
      }).join('') +
      '<div class="nav"><button type="button" class="btn" data-tab="logs">' + tt('Log temps at open', 'Registrar temperaturas al abrir') + '</button></div></section>';
  }
  function openMode() {
    if (typeof MODES === 'undefined' || !MODES.__dough || typeof VIEWS === 'undefined' || typeof LISTS === 'undefined' || !LISTS.ol_) return setTimeout(openMode, 200);
    if (MODES.__open) return; MODES.__open = true;
    MODES.unshift(['open', tt('Open', 'Abrir')]);
    var t0 = VIEWS.today; VIEWS.today = function () { return ui.mode === 'open' ? openView() : t0.apply(this, arguments); };
    render();
  }

  (function start() {
    if (!ready()) return setTimeout(start, 200);
    if (BOARD === 'foh') fohPatches();
    var r0 = render;
    render = function () {
      if (BOARD === 'foh') fohPatches();
      var out = r0.apply(this, arguments);
      try { decorate(); } catch (e) {}
      setTimeout(function () { try { iceLabel(); } catch (e) {} }, 0);
      try { if (BOARD === 'foh') tableHeights(); } catch (e) {}
      try { if (BOARD === 'kitchen' && ui.mode === 'open' && ui.tab === 'today') { var h1 = document.querySelector('#head h1'); if (h1) h1.textContent = tt('Open', 'Abrir'); } } catch (e) {}
      try { if (BOARD === 'foh') fixLayout1121(); } catch (e) {}
      return out;
    };
    if (BOARD === 'kitchen') openMode();
    render();
  })();
})();
