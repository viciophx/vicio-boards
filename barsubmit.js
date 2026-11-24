/* Vicio FOH: finish, lock and send the bar count (Eric, Nov 23 2026). Loaded by config.js; FOH only.
   1. Submit: a card at the bottom of the bar count shows how many lines are counted and names the ones still missing, takes
      the counter's first name, and has a Submit bar count button. Submitting saves done = { at, by, missing } with the week's
      count (barinv/<week>), locks the lines so nothing changes by accident, and shows "Submitted by Ana, Sat 11:42 PM" at
      the top. A manager (or Colette's Board) can Reopen it.
   2. Email the order: an "Email order to Edson" button on the same card, on the Tuesday order card and on the soda order
      list opens the device's Mail app with the order already written, addressed to donedson@centricophx.com. Nothing is
      sent until the person taps Send in Mail.
   3. Phones: on a narrow screen each bar line becomes its own card (name and par, then the picture, bottle and slider, then
      last week and the order amount), instead of a table that runs off the side. */
(function () {
  if (window.__vicioBarSubmit || window.VICIO_BOARD !== 'foh') return;
  window.__vicioBarSubmit = true;
  var TO = 'donedson@centricophx.com';
  var IN_COLETTE = false; try { IN_COLETTE = !!(window.parent && window.parent !== window); } catch (e) { IN_COLETTE = true; }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function mgr() { var m = false; try { m = typeof MGR !== 'undefined' && !!MGR; } catch (e) {} return IN_COLETTE || m; }
  function items() { return (typeof INVITEMS !== 'undefined' ? INVITEMS : []); }
  function cnt() { return (S.inv && S.inv.c) || {}; }
  function done() { return S.inv && S.inv.done && S.inv.done.at ? S.inv.done : null; }
  function when(at) { try { return new Date(at).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; } }
  function mailto(subject, body) { return 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body); }
  function barOrderText() {
    var lines = typeof orderLines === 'function' ? orderLines(cnt()) : [], by = {}, order = [];
    lines.forEach(function (l) { if (!by[l[0]]) { by[l[0]] = []; order.push(l[0]); } by[l[0]].push(l[2] + ' x ' + l[1]); });
    return { n: lines.length, text: 'Vicio bar order, week of ' + (ui.week || '') + '\n\n' + order.map(function (g) { return g + ':\n' + by[g].map(function (x) { return '  ' + x; }).join('\n'); }).join('\n\n') + '\n\nSent from the Vicio FOH board.' };
  }
  function card() {
    var sec = document.querySelector('[data-fold="sec_bar"]'); if (!sec) return;
    var old = sec.querySelector('.x-sub'); if (old) old.remove(); var ob = sec.querySelector('.x-subtop'); if (ob) ob.remove();
    var all = items(), c = cnt(), miss = all.filter(function (i) { return c[i[0]] == null || c[i[0]] === ''; }), d = done(), o = barOrderText();
    sec.classList.toggle('x-done', !!d);
    /* A submitted count is locked: the lines take no taps, drags or typing (the bottle names still open their profile). */
    if (d) Array.prototype.forEach.call(sec.querySelectorAll('.tablewrap input, .tablewrap select, .tablewrap button:not(.x-bname)'), function (el) { el.disabled = true; });
    var email = o.n ? '<a class="btn x-mail" href="' + esc(mailto('Vicio bar order, week of ' + (ui.week || ''), o.text)) + '">Email order to Edson (' + o.n + ')</a>' : '';
    var html;
    if (d) {
      html = '<div class="x-sub done"><b>Bar count submitted</b><p>By ' + esc(d.by || 'someone') + ', ' + esc(when(d.at)) + '. ' + (all.length - miss.length) + ' of ' + all.length + ' lines counted.' + (miss.length ? ' Not counted: ' + esc(miss.map(function (i) { return i[1]; }).join(', ')) + '.' : '') + '</p><div class="x-subrow">' + email + (mgr() ? '<button type="button" class="btn" data-bsreopen>Reopen the count</button>' : '<span class="x-subnote">A manager can reopen it.</span>') + '</div></div>';
      var st = sec.querySelector('p.status'); if (st) st.insertAdjacentHTML('afterend', '<p class="x-subtop"><span class="pill good">Submitted</span> by ' + esc(d.by || 'someone') + ', ' + esc(when(d.at)) + '. The count is locked.</p>');
    } else {
      var who = ''; try { who = typeof whoName === 'function' ? whoName() : ''; } catch (e) {}
      html = '<div class="x-sub"><b>' + (all.length - miss.length) + ' of ' + all.length + ' counted</b>' +
        (miss.length ? '<p class="x-submiss">Still missing: ' + esc(miss.slice(0, 12).map(function (i) { return i[1]; }).join(', ')) + (miss.length > 12 ? ' and ' + (miss.length - 12) + ' more' : '') + '.</p>' : '<p>Every line is counted.</p>') +
        '<div class="x-subrow"><input type="text" id="x-subwho" placeholder="Your first name" autocomplete="off" aria-label="Your first name" value="' + esc(card.who != null ? card.who : who) + '"><button type="button" class="btn primary" data-bssubmit>Submit bar count</button>' + email + '</div><p class="x-submsg" aria-live="polite">' + esc(card.msg || '') + '</p></div>';
    }
    (sec.querySelector('.fbody') || sec).insertAdjacentHTML('beforeend', html);
  }
  function extraMail() {
    /* Tuesday order card */
    var ot = document.getElementById('order-text');
    if (ot && !ot.parentNode.querySelector('.x-mail')) { var b = ot.parentNode.querySelector('[data-act="ordercopy"]'); if (b) b.insertAdjacentHTML('afterend', ' <a class="btn x-mail" href="' + esc(mailto('Vicio order, week of ' + (ui.week || ''), ot.textContent + '\n\nSent from the Vicio FOH board.')) + '">Email order to Edson</a>'); }
    /* Soda order list */
    var sb = document.querySelector('.x-bibord');
    if (sb && !sb.querySelector('.x-mail')) { var t = sb.querySelector('.x-bibtxt'), cb = sb.querySelector('[data-bibcopy]'); if (t && cb) cb.insertAdjacentHTML('afterend', ' <a class="btn x-mail" href="' + esc(mailto('Vicio soda and CO2 order', t.textContent + '\n\nSent from the Vicio FOH board.')) + '">Email order to Edson</a>'); }
  }
  document.addEventListener('input', function (e) { if (e.target && e.target.id === 'x-subwho') card.who = e.target.value; }, true);
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-bssubmit],[data-bsreopen]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (b.hasAttribute('data-bsreopen')) { if (!mgr()) return; S.inv = Object.assign({}, S.inv, { done: null }); save('barinv/' + ui.week, { done: null }); card.msg = ''; render(); return; }
    var inp = document.getElementById('x-subwho'), name = (inp && inp.value || '').trim();
    if (!name) { card.msg = 'Type your first name, then submit.'; render(); var i2 = document.getElementById('x-subwho'); if (i2) i2.focus(); return; }
    var c = cnt(), miss = items().filter(function (i) { return c[i[0]] == null || c[i[0]] === ''; });
    if (miss.length && !confirm(miss.length + ' line' + (miss.length > 1 ? 's are' : ' is') + ' not counted yet. Submit anyway?')) return;
    var d = { at: Date.now(), by: name, missing: miss.length };
    S.inv = Object.assign({}, S.inv, { done: d }); save('barinv/' + ui.week, { done: d }); card.msg = ''; render();
  }, true);
  var st = document.createElement('style');
  st.textContent = '.x-sub{margin:14px 0 4px;padding:14px 16px;border-radius:14px;border:2px solid var(--line,#2E2E34);background:var(--bg,#000)}.x-sub.done{border-color:var(--good,#1F7A4D)}.x-sub b{font-size:18px}.x-sub p{margin:6px 0 10px}.x-submiss{color:#F5A524}' +
    '.x-subrow{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.x-subrow input{min-height:48px;font-size:17px;flex:1 1 160px;max-width:240px}.x-subrow .btn{min-height:48px;font-size:16px;font-weight:700}.x-submsg{color:#F5A524;font-weight:700;margin:6px 0 0;min-height:1em}.x-subnote{color:var(--muted,#A1A1AA);font-size:13px}' +
    '.x-mail{display:inline-flex;align-items:center;text-decoration:none}.x-subtop{margin:4px 0 8px;font-weight:600}' +
    '[data-fold="sec_bar"].x-done .tablewrap{opacity:.55;pointer-events:none}[data-fold="sec_bar"].x-done .x-bname,[data-fold="sec_bar"].x-done .x-bpic{pointer-events:auto}[data-fold="sec_bar"].x-done .x-vbtn{display:none}' +
    '@media (max-width:640px){[data-fold="sec_bar"] [data-fold^="inv_"] table,[data-fold="sec_bar"] [data-fold^="inv_"] tbody{display:block;width:100%}[data-fold="sec_bar"] [data-fold^="inv_"] thead{display:none}' +
    '[data-fold="sec_bar"] [data-fold^="inv_"] tr{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;padding:12px 4px;border-bottom:1px solid var(--line,#2E2E34)}' +
    '[data-fold="sec_bar"] [data-fold^="inv_"] td{display:block;border:0;padding:0;text-align:left}[data-fold="sec_bar"] [data-fold^="inv_"] td:first-child{grid-column:1/-1;font-size:18px;font-weight:700}[data-fold="sec_bar"] [data-fold^="inv_"] td:first-child .x-par{display:inline-flex;margin:0 0 0 10px;vertical-align:middle}' +
    '[data-fold="sec_bar"] [data-fold^="inv_"] td.x-cnt{grid-column:1/-1}[data-fold="sec_bar"] [data-fold^="inv_"] td.x-cnt .x-tc{justify-content:center}[data-fold="sec_bar"] [data-fold^="inv_"] td.x-cnt .x-tcr{max-width:none}' +
    '[data-fold="sec_bar"] [data-fold^="inv_"] td:nth-child(3)::before{content:"Last week  ";color:var(--muted,#A1A1AA);font-size:12px;text-transform:uppercase;letter-spacing:.05em}[data-fold="sec_bar"] [data-fold^="inv_"] td:nth-child(4){text-align:right}[data-fold="sec_bar"] [data-fold^="inv_"] td:nth-child(4)::before{content:"Order  ";color:var(--muted,#A1A1AA);font-size:12px;text-transform:uppercase;letter-spacing:.05em}' +
    '[data-fold="sec_bar"] .tablewrap{overflow:visible}}';
  document.head.appendChild(st);
  (function start() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || !document.getElementById('view')) return setTimeout(start, 200);
    var r0 = render; render = function () { var out = r0.apply(this, arguments); try { card(); } catch (e) {} setTimeout(function () { try { extraMail(); } catch (e) {} }, 0); return out; };
    try { card(); extraMail(); } catch (e) {}
  })();
})();
