/* Vicio FOH: the night on the clock (Eric, Nov 23 2026). Loaded by config.js; FOH only. Built from how the board was
   actually used Oct 30 to Nov 21: lists ticked in bursts and late, many ticks with no name, one person often running host,
   bar and expo, and closing left unfinished.
   1. Who are you: a tick on tonight's lists needs a name. With nobody signed in, the first tick opens a grid of names from
      the roster; one tap signs in and makes the tick. A chip at the top shows who is on this iPad, with Switch.
   2. On the clock: every list has a due time for the day (open lists at doors: 5 PM Thursday, noon Friday and Saturday; AM
      lunch check 2 PM; hand off 4 PM; PM takeover 4:30 PM; mid shift / evening check 8:30 PM; close 1:30 AM). Each list shows
      "Due 12:00 PM", "Late 40 min" in red, or "Done on time" / "Done 1:44 PM, late". A banner at the top names what is late
      right now. A short summary (sum) is saved with the night so Colette's Board can show what was late or never finished.
   3. Solo night: one switch turns the separate lists into a single list in time order (what is due first comes first), for
      a night when one person runs everything. It uses the same ticks, so the regular lists and the report stay right.
   4. Closing handoff: three quick questions end the night (what ran out, what broke or needs fixing, what tomorrow needs),
      each with a Nothing button. Saved as handoff = { out, broke, need, by, at } and written into the night's notes, so the
      next shift sees it under "Since the last shift" and it goes in the report. Until it is answered, closing shows as not
      finished. */
(function () {
  if (window.__vicioNight || window.VICIO_BOARD !== 'foh') return;
  window.__vicioNight = true;
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function today() { return typeof svcDate === 'function' ? svcDate() : ''; }
  function live() { return ui.date === today() && (ui.tab === 'today' || ui.tab === 'lists'); }
  function dayOf(d) { var p = d.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function openMin(d) { var w = dayOf(d).getDay(); return w === 4 ? 17 * 60 : (w === 5 || w === 6) ? 12 * 60 : null; }
  /* Minutes after midnight of the service date that a list is due; null when it has no clock. */
  function dueMin(key, d) {
    var o = openMin(d); if (o == null) return null;
    if (/_open$/.test(key)) return o;
    if (/_amchk$/.test(key)) return 14 * 60;
    if (/_amoff$/.test(key)) return 16 * 60;
    if (/_pmon$/.test(key)) return Math.max(o, 16 * 60 + 30);
    if (/_mid$/.test(key)) return 20 * 60 + 30;
    if (/_close$/.test(key)) return 25 * 60 + 30;
    return null;
  }
  function dueDate(key, d) { var m = dueMin(key, d); if (m == null) return null; var t = dayOf(d); t.setMinutes(m); return t; }
  function clock(t) { return new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
  function mins(n) { n = Math.round(n); return n < 60 ? n + ' min' : Math.floor(n / 60) + ' hr' + (n % 60 ? ' ' + (n % 60) + ' min' : ''); }
  function keys(d) { return Object.keys(typeof LISTS !== 'undefined' ? LISTS : {}).filter(function (k) { try { return flat(k, d).length > 0; } catch (e) { return false; } }); }
  var TITLES = {};
  function title(key) {
    var el = document.querySelector('details[data-fold^="' + key + '_"] h3'); if (el) { var k = el.cloneNode(true); Array.prototype.forEach.call(k.querySelectorAll('*'), function (x) { x.remove(); }); var t = k.textContent.trim(); if (t) return TITLES[key] = t; }
    if (TITLES[key]) return TITLES[key];
    return key.replace(/^bar_/, 'Bartender ').replace(/^host_/, 'Host / Busser ').replace(/^expo_/, 'Expo ').replace('amchk', 'lunch check').replace('amoff', 'hand off').replace('pmon', 'takeover').replace('svc', 'service');
  }
  function state(d) {
    var done = (S.shift && S.shift.done) || {}, at = (S.shift && S.shift.doneAt) || {}, now = Date.now(), out = [];
    keys(d).forEach(function (k) {
      var it = flat(k, d), a = it.filter(function (i) { return done[i[0]]; }).length, due = dueDate(k, d), full = a === it.length;
      var s = { k: k, a: a, b: it.length, due: due ? due.getTime() : null, at: at[k] || null, full: full };
      s.late = !full && due && now > due.getTime() ? (now - due.getTime()) / 6e4 : 0;
      s.doneLate = full && due && s.at && s.at > due.getTime() + 5 * 6e4;
      out.push(s);
    });
    return out.sort(function (x, y) { return (x.due || 9e15) - (y.due || 9e15); });
  }
  /* ---- 1. who are you ---- */
  var PENDING = null;
  function people() { try { return stPeople().filter(function (p) { return p.group !== 'Kitchen'; }).map(function (p) { return p.name; }); } catch (e) { return []; } }
  function askWho(then) {
    PENDING = then || null;
    var el = document.getElementById('x-who'); if (el) el.remove();
    var ppl = people();
    document.body.insertAdjacentHTML('beforeend', '<div id="x-who" role="dialog" aria-modal="true" aria-label="Who are you?"><div class="xw-card"><h2>Who are you?</h2><p>Tap your name. It goes on everything you tick tonight.</p><div class="xw-grid">' +
      ppl.map(function (n) { return '<button type="button" data-xwho="' + esc(n) + '">' + esc(n.split(' ')[0]) + '<small>' + esc(n.split(' ').slice(1).join(' ')) + '</small></button>'; }).join('') +
      '</div><div class="xw-row"><input type="text" id="xw-other" placeholder="Someone else: type a name" autocomplete="off"><button type="button" data-xwho="__other">Use this name</button><button type="button" data-xwho="__cancel">Cancel</button></div></div></div>');
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    var w = t.closest && t.closest('[data-xwho]');
    if (w) {
      e.preventDefault(); e.stopPropagation();
      var v = w.dataset.xwho, box = document.getElementById('x-who'), name = v === '__other' ? ((document.getElementById('xw-other') || {}).value || '').trim() : v === '__cancel' ? '' : v;
      if (v === '__other' && !name) return;
      if (box) box.remove();
      if (name) { var p = PENDING; PENDING = null; setWho(name); if (p) setTimeout(p, 60); } else PENDING = null;
      return;
    }
    if (t.closest && t.closest('[data-nfwho]')) { e.preventDefault(); askWho(null); return; }
    var c = t.matches && t.matches('input[type="checkbox"][data-chk^="shifts/"]') ? t : null;
    if (c && !whoName()) {
      e.preventDefault(); e.stopPropagation();
      var id = c.dataset.chk;
      askWho(function () { var b = document.querySelector('input[data-chk="' + id + '"]'); if (b && !b.checked) b.click(); });
    }
  }, true);
  /* ---- 3. solo night ---- */
  function solo() { try { return localStorage.getItem('vicio_solo') === today(); } catch (e) { return false; } }
  function setSolo(on) { try { if (on) localStorage.setItem('vicio_solo', today()); else localStorage.removeItem('vicio_solo'); } catch (e) {} save('shifts/' + today(), { solo: !!on }); render(); }
  function soloList(d, st) {
    var done = (S.shift && S.shift.done) || {}, html = '', left = 0, firstDue = null;
    st.forEach(function (s) { if (!s.full && firstDue == null) firstDue = s.due || 0; });
    st.forEach(function (s) {
      var it = flat(s.k, d).filter(function (i) { return !done[i[0]]; }); if (!it.length) return;
      left += it.length;
      var now = (s.due || 0) <= firstDue || s.late > 0;
      var list = '<ul class="checks">' + it.map(function (i) { return '<li><label><input type="checkbox" data-chk="shifts/' + d + '|' + i[0] + '"><span>' + esc(i[1]) + '</span></label></li>'; }).join('') + '</ul>';
      var head = esc(title(s.k)) + (s.due ? ' \u00b7 due ' + clock(s.due) : '') + (s.late > 0 ? ' \u00b7 <b class="x-sl">late</b>' : '');
      html += now ? '<p class="grp"><span>' + head + '</span><span>' + s.a + '/' + s.b + '</span></p>' + list
        : '<details class="x-later"><summary>Later: ' + head + ' <span>' + it.length + ' to do</span></summary>' + list + '</details>';
    });
    return '<section class="card edge x-solo"><div class="cardhead"><h3>Solo night: one list</h3><span class="count">' + (left ? left + ' left' : 'All done') + '</span></div>' + (html || '<p class="status">Every list is done.</p>') + '</section>';
  }
  /* ---- 4. closing handoff ---- */
  var HQ = [['out', 'What ran out or is running low?'], ['broke', 'What broke or needs fixing?'], ['need', 'What does tomorrow\u2019s crew need to know?']], DRAFT = {};
  function handoff() { return (S.shift && S.shift.handoff && S.shift.handoff.at) ? S.shift.handoff : null; }
  function closeStarted(d) { var done = (S.shift && S.shift.done) || {}; return keys(d).filter(function (k) { return /_close$/.test(k); }).some(function (k) { return flat(k, d).some(function (i) { return done[i[0]]; }); }); }
  function handoffCard(d) {
    var h = handoff(), hr = new Date().getHours();
    if (h) return '<section class="card done x-hand"><div class="cardhead"><h3>Closing handoff</h3><span class="count">Done ' + clock(h.at) + (h.by ? ' \u00b7 ' + esc(h.by.split(' ')[0]) : '') + '</span></div><ul class="plain tight">' + HQ.map(function (q) { return '<li><b>' + q[1] + '</b> ' + esc(h[q[0]] || 'Nothing') + '</li>'; }).join('') + '</ul><button type="button" class="btn x" data-nfhedit>Change answers</button></section>';
    if (!(closeStarted(d) || hr >= 22 || hr < 5)) return '';
    return '<section class="card edge x-hand"><div class="cardhead"><h3>Closing handoff</h3><span class="count">3 questions to end the night</span></div>' +
      HQ.map(function (q) { return '<label class="x-hq">' + q[1] + '<span><input type="text" data-nfh="' + q[0] + '" value="' + esc(DRAFT[q[0]] || '') + '" autocomplete="off"><button type="button" class="btn x" data-nfnone="' + q[0] + '">Nothing</button></span></label>'; }).join('') +
      '<div class="nav"><button type="button" class="btn primary" data-nfhsave>Finish the night</button><span class="x-hmsg" aria-live="polite">' + esc(handoffCard.msg || '') + '</span></div></section>';
  }
  document.addEventListener('input', function (e) { var t = e.target; if (t && t.dataset && t.dataset.nfh) DRAFT[t.dataset.nfh] = t.value; }, true);
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-nfnone],[data-nfhsave],[data-nfhedit],[data-nfsolo]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (b.dataset.nfsolo != null) { setSolo(b.dataset.nfsolo === '1'); return; }
    if (b.dataset.nfnone) { DRAFT[b.dataset.nfnone] = 'Nothing'; render(); return; }
    if (b.hasAttribute('data-nfhedit')) { var h0 = handoff() || {}; HQ.forEach(function (q) { DRAFT[q[0]] = h0[q[0]] || ''; }); S.shift = Object.assign({}, S.shift, { handoff: null }); save('shifts/' + today(), { handoff: null }); render(); return; }
    if (!whoName()) { askWho(function () { var s = document.querySelector('[data-nfhsave]'); if (s) s.click(); }); return; }
    var miss = HQ.filter(function (q) { return !(DRAFT[q[0]] || '').trim(); });
    if (miss.length) { handoffCard.msg = 'Answer all three, or tap Nothing.'; render(); return; }
    var h = { at: Date.now(), by: whoName() }; HQ.forEach(function (q) { h[q[0]] = DRAFT[q[0]].trim(); });
    var text = 'Ran out or low: ' + h.out + '\nBroke or needs fixing: ' + h.broke + '\nTomorrow needs: ' + h.need;
    var notes = String((S.shift && S.shift.notes) || '').replace(/\n?Ran out or low:[\s\S]*$/, '').trim(), all = (notes ? notes + '\n' : '') + text;
    S.shift = Object.assign({}, S.shift, { handoff: h, notes: all }); save('shifts/' + today(), { handoff: h, notes: all }); handoffCard.msg = ''; DRAFT = {}; render();
  }, true);
  /* ---- draw ---- */
  var lastSum = '';
  function draw() {
    var old = document.getElementById('x-night'); if (old) old.remove();
    if (!live()) return;
    var d = today(), view = document.getElementById('view'); if (!view || openMin(d) == null) return;
    var st = state(d), late = st.filter(function (s) { return s.late > 0; }), who = whoName();
    var html = '<div id="x-night"><div class="x-nfbar"><button type="button" class="x-chip' + (who ? '' : ' need') + '" data-nfwho>' + (who ? 'On this iPad: <b>' + esc(who.split(' ')[0]) + '</b> \u00b7 Switch' : 'Tap to say who you are') + '</button>' +
      '<button type="button" class="x-chip' + (solo() ? ' on' : '') + '" data-nfsolo="' + (solo() ? '0' : '1') + '">' + (solo() ? 'Solo night is on \u00b7 turn off' : 'Running it solo tonight? One list') + '</button></div>' +
      (late.length ? '<div class="x-late"><b>Late right now</b> ' + late.map(function (s) { return esc(title(s.k)) + ' (' + (s.b - s.a) + ' left, ' + mins(s.late) + ' late)'; }).join(' \u00b7 ') + '</div>' : '') +
      (solo() ? soloList(d, st) : '') + handoffCard(d) + '</div>';
    var anchor = view.querySelector('.grid.today') || view.querySelector('details.card') || view.firstElementChild;
    if (anchor) anchor.insertAdjacentHTML('beforebegin', html); else view.insertAdjacentHTML('afterbegin', html);
    /* due badges on each list card */
    st.forEach(function (s) {
      if (!s.due) return;
      Array.prototype.forEach.call(document.querySelectorAll('details[data-fold^="' + s.k + '_"] summary .count'), function (c) {
        if (c.querySelector('.x-due')) return;
        var txt = s.full ? (s.doneLate ? 'Done ' + clock(s.at) + ', late' : 'On time') : s.late > 0 ? 'Late ' + mins(s.late) : 'Due ' + clock(s.due);
        c.insertAdjacentHTML('beforeend', ' <span class="pill x-due ' + (s.full ? (s.doneLate ? 'warn' : 'good') : s.late > 0 ? 'bad' : '') + '">' + txt + '</span>');
      });
    });
    /* closing is not finished until the handoff is in */
    if (!handoff()) Array.prototype.forEach.call(document.querySelectorAll('details[data-fold^="bar_close_"] summary .count,details[data-fold^="host_close_"] summary .count'), function (c) { if (/Done/.test(c.textContent) && !c.querySelector('.x-needh')) c.insertAdjacentHTML('beforeend', ' <span class="pill warn x-needh">Handoff still needed</span>'); });
    /* summary for Colette's Board */
    var sum = {}; st.forEach(function (s) { sum[s.k] = { a: s.a, b: s.b, due: s.due, at: s.at, t: title(s.k) }; });
    var js = JSON.stringify(sum);
    if (js !== lastSum && js !== JSON.stringify((S.shift && S.shift.sum) || {})) { lastSum = js; clearTimeout(draw.t); draw.t = setTimeout(function () { save('shifts/' + d, { sum: sum }); }, 4000); }
  }
  var st0 = document.createElement('style');
  st0.textContent = '#x-night{display:grid;gap:10px;margin:0 0 12px}.x-nfbar{display:flex;flex-wrap:wrap;gap:8px}.x-chip{min-height:44px;padding:0 16px;border-radius:999px;border:1px solid var(--line,#2E2E34);background:var(--bg,#000);color:var(--ink,#EDEDF0);font:600 15px system-ui,-apple-system,sans-serif;cursor:pointer}.x-chip.need{background:#D9A441;color:#111;border-color:#D9A441}.x-chip.on{border-color:var(--cherry,#E5484D);color:var(--cherry,#E5484D)}' +
    '.x-late{padding:12px 14px;border-radius:12px;border:2px solid var(--cherry,#E5484D);background:rgba(229,72,77,.14);color:var(--ink,#EDEDF0);font-size:15px}.x-late b{color:var(--cherry,#E5484D);margin-right:6px}.pill.bad{background:var(--cherry,#8B1E1E);color:#fff}' +
    '.x-later{margin:8px 0;padding:8px 10px;border:1px solid var(--line,#2E2E34);border-radius:10px}.x-later summary{cursor:pointer;font-weight:600;color:var(--muted,#A1A1AA)}.x-later summary span{float:right}.x-sl{color:var(--cherry,#E5484D)}' +
    '.x-hq{display:block;font-weight:600;margin:10px 0}.x-hq span{display:flex;gap:8px;margin-top:6px}.x-hq input{flex:1;min-height:46px;font-size:16px}.x-hq .btn{min-height:46px}.x-hmsg{color:#F5A524;font-weight:700;margin-left:10px}' +
    '#x-who{position:fixed;inset:0;z-index:1001;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;padding:14px}.xw-card{width:min(620px,100%);max-height:100%;overflow:auto;background:var(--surface,#18181B);color:var(--ink,#EDEDF0);border:1px solid var(--line,#2E2E34);border-radius:18px;padding:18px 20px}.xw-card h2{margin:0 0 4px}.xw-card p{margin:0 0 12px;color:var(--muted,#A1A1AA)}' +
    '.xw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px}.xw-grid button{min-height:68px;border-radius:14px;border:1px solid var(--line,#2E2E34);background:var(--bg,#000);color:inherit;font:700 19px system-ui,-apple-system,sans-serif;cursor:pointer}.xw-grid small{display:block;font-weight:500;font-size:12px;color:var(--muted,#A1A1AA)}' +
    '.xw-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}.xw-row input{flex:1 1 180px;min-height:46px;font-size:16px}.xw-row button{min-height:46px;padding:0 14px;border-radius:12px;border:1px solid var(--line,#2E2E34);background:var(--bg,#000);color:inherit;font-weight:700}';
  document.head.appendChild(st0);
  (function start() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || typeof LISTS === 'undefined' || !document.getElementById('view')) return setTimeout(start, 200);
    var r0 = render; render = function () { var out = r0.apply(this, arguments); try { draw(); } catch (e) {} return out; };
    setInterval(function () { try { if (live() && !document.querySelector('#x-who') && !(document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) draw(); } catch (e) {} }, 60000);
    try { draw(); } catch (e) {}
  })();
})();
