/* Vicio FOH: count the bar by voice (Eric, Nov 22 2026). Loaded by config.js; FOH only.
   A "Count by voice" button at the top of the bar count opens a full-screen card. The board says each bottle's name out loud
   (and shows its photo), then listens. Say the count the way you'd say it: "one point five", "two and a half", "half",
   "three", "none" or "empty" (0). It repeats the number back, saves it like a tap would, and moves to the next bottle.
   Other things you can say: "skip" or "next" (leave it, move on), "back" (previous bottle), "repeat" (say the name again),
   "same" (last week's number), "stop" or "done" (close). Batches take "full", "three quarters", "half", "quarter" or "make".
   It starts at the first bottle that isn't counted yet and goes in shelf order. Big Back / Skip / Repeat buttons and a
   number pad sit on the card too, for when it's loud. Uses the iPad's or phone's own speech (Safari asks for the
   microphone the first time). English, with Spanish numbers understood too ("uno punto cinco", "medio").
   The other counts too (Eric, Nov 23): the same card runs the Beer Cooler Count (whole numbers), the Attic count ("two cases
   and three sleeves", "one case", "four boxes"), the Soda BIBs & CO2 section ("full", "three quarters", "half", "quarter",
   "order"; a number for CO2 tanks) and, on the kitchen board, the Prep count (a number on hand). Each has its own Count by
   voice button. For these it fills in the line's own box, pull-downs or level button, so the board saves it the usual way. */
(function () {
  if (window.__vicioVoice || (window.VICIO_BOARD !== 'foh' && window.VICIO_BOARD !== 'kitchen')) return;
  window.__vicioVoice = true;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var ONES = { zero: 0, oh: 0, none: 0, empty: 0, nothing: 0, one: 1, won: 1, two: 2, to: 2, too: 2, three: 3, four: 4, for: 4, five: 5, six: 6, seven: 7, eight: 8, ate: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
    cero: 0, nada: 0, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, veinte: 20 };
  var ST = { open: false, i: 0, list: [], heard: '', msg: '', listening: false, rec: null, lastSaid: '' };
  function es() { try { return ui.lang === 'es'; } catch (e) { return false; } }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function items() { return (typeof INVITEMS !== 'undefined' ? INVITEMS : []).map(function (i) { return { id: i[0], name: i[1], group: i[2] || '' }; }); }
  function isBatch(it) { return /\(batch\)/i.test(it.name); }
  function isBeer(it) { return /beer/i.test(it.group); }
  function cnt() { return (S.inv && S.inv.c) || {}; }
  function prev() { return (S.prevInv && S.prevInv.c) || {}; }
  function fmt(v) { return v == null ? '\u2013' : (+v).toFixed(2).replace(/0+$/, '').replace(/\.$/, ''); }
  function sayNum(v) { if (v === 0) return es() ? 'nada' : 'none'; var w = Math.floor(v + 1e-9), f = Math.round((v - w) * 10), pt = es() ? ' punto ' : ' point '; return f ? (w ? w + pt + f : pt.trim() + ' ' + f) : String(w); }
  /* Words to a number. Returns null when it hears no count. */
  function parse(t, batch) {
    t = ' ' + t.toLowerCase().replace(/[,]/g, ' ').replace(/\s+/g, ' ') + ' ';
    if (batch) {
      if (/\b(make|made|out|gone|empty|none)\b/.test(t)) return 0;
      if (/three ?quarters?|75/.test(t)) return 0.75;
      if (/\bquarter|25\b/.test(t)) return 0.25;
      if (/\bhalf\b|\bmedio\b|\b50\b/.test(t)) return 0.5;
      if (/\bfull\b|\blleno\b|100/.test(t)) return 1;
      return null;
    }
    var m = t.match(/(\d+(?:\.\d+)?)/); var base = null;
    if (m) base = parseFloat(m[1]);
    var words = t.trim().split(' '), n = null, dec = null, after = false;
    for (var k = 0; k < words.length; k++) {
      var w = words[k];
      if (w === 'point' || w === 'punto' || w === 'dot') { after = true; continue; }
      if (ONES[w] != null) { if (after) { if (dec == null) dec = ONES[w]; } else n = (n || 0) + ONES[w]; }
    }
    var v = base != null ? base : n;
    if (dec != null && base == null) v = (v || 0) + Math.min(9, dec) / 10;
    if (/\b(and a )?half\b|\by medio\b|\bmedia\b/.test(t)) v = (v || 0) + 0.5;
    else if (/\b(and a )?quarter\b/.test(t)) v = (v || 0) + 0.3;
    if (v == null) return null;
    return Math.round(v * 10) / 10;
  }
  /* ---- the other counts: read the lines from the page, and fill in each line's own control ---- */
  function fire(el) { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
  function rowName(row) {
    var c = row && row.cells[0]; if (!c) return '';
    var k = c.cloneNode(true); Array.prototype.forEach.call(k.querySelectorAll('img,label,.pill,small,.x-bibexp,.x-par,button:not(.x-bname)'), function (x) { x.remove(); });
    return k.textContent.replace(/\s+/g, ' ').replace(/^Bag-in-box:\s*/i, '').trim();
  }
  function grpName(el) { var g = el.closest('[data-fold]'), h = g && g.querySelector('summary'); return h ? h.textContent.replace(/\s+/g, ' ').replace(/\d+ of \d+.*$/, '').replace(/^[\u2013\-+\s]+/, '').trim() : ''; }
  function generic(mode) {
    var out = [], seen = {};
    function add(id, el, kind, unit) { if (seen[id]) return; seen[id] = 1; out.push({ id: id, name: rowName(el.closest('tr')), group: MODES[mode].title, kind: kind, unit: unit || '', gen: true }); }
    if (mode === 'beer') Array.prototype.forEach.call(document.querySelectorAll('[data-fold="sec_inv_beer"] input[data-inv]'), function (el) { add(el.dataset.inv, el, 'int'); });
    if (mode === 'attic') Array.prototype.forEach.call(document.querySelectorAll('[data-fold="sec_inv_attic"] select[data-cpk="c"]'), function (el) { var p = document.querySelector('select[data-cpid="' + el.dataset.cpid + '"][data-cpk="p"]'); add(el.dataset.cpid, el, 'cp', p ? (p.getAttribute('aria-label') || 'pieces') : 'pieces'); });
    if (mode === 'bib') { Array.prototype.forEach.call(document.querySelectorAll('[data-fold="sec_inv_bib"] [data-lvid]'), function (el) { add(el.dataset.lvid, el, 'level'); }); Array.prototype.forEach.call(document.querySelectorAll('[data-fold="sec_inv_bib"] input[data-inv]'), function (el) { add(el.dataset.inv, el, 'int'); }); }
    if (mode === 'prep') Array.prototype.forEach.call(document.querySelectorAll('#view input[data-poh]'), function (el) { add(el.dataset.poh, el, 'num'); });
    return out;
  }
  var MODES = { bar: { title: 'Bar count' }, beer: { title: 'Beer cooler' }, attic: { title: 'Attic' }, bib: { title: 'Soda and CO2' }, prep: { title: 'Prep count' } };
  function gGet(it) {
    if (it.kind === 'int' || it.kind === 'num') { var el = document.querySelector('input[data-inv="' + it.id + '"],input[data-poh="' + it.id + '"]'); return el && el.value !== '' ? el.value : null; }
    if (it.kind === 'cp') { var c = document.querySelector('select[data-cpid="' + it.id + '"][data-cpk="c"]'), p = document.querySelector('select[data-cpid="' + it.id + '"][data-cpk="p"]'); if (!c || (c.value === '' && (!p || p.value === ''))) return null; return (c.value || 0) + ' cs + ' + ((p && p.value) || 0) + ' ' + it.unit; }
    if (it.kind === 'level') { var on = document.querySelector('[data-lvid="' + it.id + '"].on'); return on ? (+on.dataset.lv === 0 ? 'Order' : Math.round(on.dataset.lv * 100) + '%') : null; }
    return null;
  }
  function gSet(it, v) {
    if (it.kind === 'int' || it.kind === 'num') { var el = document.querySelector('input[data-inv="' + it.id + '"],input[data-poh="' + it.id + '"]'); if (el) { el.value = v; fire(el); } return; }
    if (it.kind === 'cp') { var c = document.querySelector('select[data-cpid="' + it.id + '"][data-cpk="c"]'); if (c) { c.value = String(Math.min(10, v.c)); fire(c); } setTimeout(function () { var p = document.querySelector('select[data-cpid="' + it.id + '"][data-cpk="p"]'); if (p) { p.value = String(Math.min(24, v.p)); fire(p); } }, 60); return; }
    if (it.kind === 'level') { var b = document.querySelector('[data-lvid="' + it.id + '"][data-lv="' + v + '"]'); if (b && !b.classList.contains('on')) b.click(); }
  }
  function nums(t) {
    var out = [], words = t.toLowerCase().replace(/[,]/g, ' ').split(/\s+/);
    words.forEach(function (w, i) { var n = /^\d+(\.\d+)?$/.test(w) ? parseFloat(w) : (ONES[w] != null && w !== 'to' && w !== 'for' && w !== 'too' ? ONES[w] : null); if (n != null) out.push({ n: n, i: i }); });
    return { list: out, words: words };
  }
  function parseCP(t) {
    if (/\b(none|nothing|empty|zero|nada|cero)\b/i.test(t) && !/\d/.test(t)) return { c: 0, p: 0 };
    var x = nums(t), ci = -1; x.words.forEach(function (w, i) { if (/^(case|cases|caja|cajas)$/.test(w)) ci = i; });
    if (!x.list.length) return null;
    if (ci >= 0) { var before = x.list.filter(function (n) { return n.i < ci; }).pop(), after = x.list.filter(function (n) { return n.i > ci; })[0]; return { c: before ? before.n : 0, p: after ? after.n : (/\b(a|an|un|una)\s+(sleeve|box|roll|pack|bottle|bundle|piece)/i.test(t) ? 1 : 0) }; }
    if (x.list.length >= 2) return { c: x.list[0].n, p: x.list[1].n };
    return /\b(sleeve|sleeves|box|boxes|roll|rolls|pack|packs|bottle|bottles|bundle|bundles|piece|pieces|loose)\b/i.test(t) ? { c: 0, p: x.list[0].n } : { c: x.list[0].n, p: 0 };
  }
  function parseLevel(t) {
    t = t.toLowerCase();
    if (/\b(order|empty|none|out|gone|zero|pedir|pide|vac[ií]o|nada)\b/.test(t)) return 0;
    if (/three ?quarters?|tres cuartos|75/.test(t)) return 0.75;
    if (/\bquarter|\bcuarto|25\b/.test(t)) return 0.25;
    if (/\bhalf\b|\bmedio\b|\bmitad\b|\b50\b/.test(t)) return 0.5;
    if (/\bfull\b|\bllen[oa]\b|100/.test(t)) return 1;
    return null;
  }
  function speak(text, then) {
    try {
      if (!window.speechSynthesis) { if (then) then(); return; }
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text); u.rate = 1.05; u.lang = es() ? 'es-MX' : 'en-US';
      var done = false, fin = function () { if (done) return; done = true; if (then) setTimeout(then, 150); };
      u.onend = fin; u.onerror = fin; setTimeout(fin, 600 + text.length * 90);
      window.speechSynthesis.speak(u);
    } catch (e) { if (then) then(); }
  }
  function listen() {
    if (!SR || !ST.open) return;
    try { if (ST.rec) ST.rec.abort(); } catch (e) {}
    var r = new SR(); ST.rec = r; r.lang = es() ? 'es-MX' : 'en-US'; r.interimResults = false; r.maxAlternatives = 3; r.continuous = false;
    r.onresult = function (e) {
      var alts = []; for (var a = 0; a < e.results[0].length; a++) alts.push(e.results[0][a].transcript);
      handle(alts);
    };
    r.onerror = function (e) { ST.listening = false; if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { ST.msg = 'The microphone is blocked. Allow it for this site in Settings, or use the number pad.'; draw(); } };
    r.onend = function () { ST.listening = false; draw(); };
    try { r.start(); ST.listening = true; draw(); } catch (e) { ST.listening = false; draw(); }
  }
  function cur() { return ST.list[ST.i]; }
  function ask() {
    var it = cur(); if (!it) { finish(); return; }
    ST.heard = ''; draw();
    speak(it.name.replace(/\s*\(batch\)/i, ' batch').replace(/\([^)]*\)/g, '').replace(/\u2019/g, "'"), listen);
  }
  function save1(it, v) {
    var o = {}; o[it.id] = v;
    S.inv = Object.assign({}, S.inv, { c: Object.assign({}, cnt(), o) });
    var patch = { c: o, at: Date.now() }; try { var wn = typeof whoName === 'function' ? whoName() : ''; if (wn) patch.who = wn; } catch (e) {}
    save('barinv/' + ui.week, patch);
  }
  function next(by) { ST.i = Math.max(0, Math.min(ST.list.length, ST.i + by)); if (ST.i >= ST.list.length) { finish(); return; } ask(); }
  function finish() { var w = ST.mode === 'bar' || !ST.mode ? 'the whole bar' : 'the whole list'; ST.msg = 'That\u2019s ' + w + '.'; draw(); speak('That\u2019s ' + w + '. Nice work.'); setTimeout(close, 2500); }
  function handle(alts) {
    var it = cur(); if (!it) return;
    var t = (alts[0] || '').toLowerCase(); ST.heard = alts[0] || '';
    if (/\b(stop|done|finish|quit|close|para|listo)\b/.test(t)) { close(); return; }
    if (/\b(skip|next|pass|siguiente)\b/.test(t)) { next(1); return; }
    if (/\b(back|previous|go back|atr[aá]s)\b/.test(t)) { next(-1); return; }
    if (/\b(repeat|again|what|otra vez|repite)\b/.test(t)) { ask(); return; }
    if (!it.gen && /\b(same|same as last week|igual)\b/.test(t)) { var p = prev()[it.id]; if (p != null && p !== '') { save1(it, +p); speak('same, ' + sayNum(+p), function () { next(1); }); } else { speak('No number last week. Say the count.', listen); } return; }
    if (it.gen) {
      var g = null, k;
      for (k = 0; k < alts.length && g == null; k++) g = it.kind === 'cp' ? parseCP(alts[k]) : it.kind === 'level' ? parseLevel(alts[k]) : parse(alts[k], false);
      if (g == null) { ST.msg = 'Didn\u2019t catch that. Say it again.'; draw(); speak('Say that again?', listen); return; }
      if (it.kind === 'int') g = Math.round(g);
      ST.msg = ''; gSet(it, g); setTimeout(draw, 150);
      speak(it.kind === 'cp' ? g.c + (g.c === 1 ? ' case, ' : ' cases, ') + g.p + ' ' + it.unit : it.kind === 'level' ? (g === 0 ? 'order' : Math.round(g * 100) + ' percent') : sayNum(g), function () { next(1); });
      return;
    }
    var v = null; for (var a = 0; a < alts.length && v == null; a++) v = parse(alts[a], isBatch(it));
    if (v == null) { ST.msg = 'Didn\u2019t catch a number. Say it again.'; draw(); speak('Say that again?', listen); return; }
    if (isBeer(it)) v = Math.round(v);
    ST.msg = ''; save1(it, v); draw();
    speak(isBatch(it) ? (v === 0 ? 'make' : Math.round(v * 100) + ' percent') : sayNum(v), function () { next(1); });
  }
  function open(mode) {
    mode = MODES[mode] ? mode : 'bar'; ST.mode = mode;
    var all = mode === 'bar' ? items() : generic(mode), c = cnt(); ST.list = all;
    if (!all.length) return;
    var first = all.findIndex(function (it) { return it.gen ? gGet(it) == null : (c[it.id] == null || c[it.id] === ''); });
    ST.i = first < 0 ? 0 : first; ST.open = true; ST.msg = SR ? '' : 'This browser can\u2019t listen. Use the number pad, or open the board in Safari on the iPad.';
    draw(); ask();
  }
  function close() { ST.open = false; try { if (ST.rec) ST.rec.abort(); } catch (e) {} try { window.speechSynthesis.cancel(); } catch (e) {} var el = document.getElementById('x-voice'); if (el) el.remove(); render(); }
  function pic(id) { var a = (window.__VICIO_ART || {})[id]; return a && a.cut ? a.cut : ''; }
  function draw() {
    if (!ST.open) return;
    var it = cur(), el = document.getElementById('x-voice');
    if (!el) { el = document.createElement('div'); el.id = 'x-voice'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Count by voice'); document.body.appendChild(el); }
    if (!it) { el.innerHTML = '<div class="xv-card"><h2>' + esc(ST.msg) + '</h2></div>'; return; }
    var c = cnt(), v = c[it.id], p = prev()[it.id], src = pic(it.id), gv = it.gen ? gGet(it) : null;
    el.innerHTML = '<div class="xv-card"><div class="xv-top"><span>' + esc(it.group) + ' \u00b7 ' + (ST.i + 1) + ' of ' + ST.list.length + '</span><button type="button" class="xv-x" data-xv="close" aria-label="Stop counting">\u00d7</button></div>' +
      (src ? '<img class="xv-pic" src="' + src + '" alt="">' : '') + '<h2>' + esc(it.name) + '</h2>' +
      (it.gen ? '<div class="xv-nums"><div><small>Now</small><b>' + esc(gv == null ? '\u2013' : gv) + '</b></div></div>' : '<div class="xv-nums"><div><small>Now</small><b>' + (isBatch(it) && v != null && v !== '' ? (+v === 0 ? 'Make' : Math.round(v * 100) + '%') : fmt(v === '' ? null : v)) + '</b></div><div><small>Last week</small><b>' + fmt(p === '' ? null : p) + '</b></div></div>') +
      '<div class="xv-mic' + (ST.listening ? ' on' : '') + '" aria-live="polite">' + (ST.listening ? 'Listening\u2026' : 'Tap the mic to talk') + '</div>' +
      '<button type="button" class="xv-talk" data-xv="talk" aria-label="Talk">\ud83c\udfa4</button>' +
      (ST.heard ? '<p class="xv-heard">Heard: \u201c' + esc(ST.heard) + '\u201d</p>' : '') + (ST.msg ? '<p class="xv-msg">' + esc(ST.msg) + '</p>' : '') +
      '<div class="xv-pad">' + (it.kind === 'level' ? [['1', 'Full'], ['0.75', '75%'], ['0.5', 'Half'], ['0.25', '25%'], ['0', 'Order']].map(function (b) { return '<button type="button" data-xvv="' + b[0] + '">' + b[1] + '</button>'; }).join('') : it.kind === 'cp' ? '<input type="number" inputmode="numeric" min="0" id="xv-in" placeholder="Cases" aria-label="Cases"><input type="number" inputmode="numeric" min="0" id="xv-in2" placeholder="' + esc(it.unit) + '" aria-label="' + esc(it.unit) + '"><button type="button" data-xv="enter">Save</button>' : isBatch(it) ? [['1', 'Full'], ['0.75', '75%'], ['0.5', 'Half'], ['0.25', '25%'], ['0', 'Make']].map(function (b) { return '<button type="button" data-xvv="' + b[0] + '">' + b[1] + '</button>'; }).join('')
        : '<input type="number" inputmode="decimal" step="0.1" min="0" id="xv-in" placeholder="Type a count" aria-label="Count"><button type="button" data-xv="enter">Save</button>') + '</div>' +
      '<div class="xv-row"><button type="button" data-xv="back">Back</button><button type="button" data-xv="repeat">Repeat</button><button type="button" data-xv="skip">Skip</button></div>' +
      '<p class="xv-help">' + (it.kind === 'cp' ? 'Say \u201ctwo cases and three ' + esc(it.unit) + '\u201d, \u201cone case\u201d or \u201cnone\u201d. Or \u201cskip\u201d, \u201cback\u201d, \u201cstop\u201d.' : it.kind === 'level' ? 'Say \u201cfull\u201d, \u201cthree quarters\u201d, \u201chalf\u201d, \u201cquarter\u201d or \u201corder\u201d. Or \u201cskip\u201d, \u201cback\u201d, \u201cstop\u201d.' : it.gen ? 'Say the number. Or \u201cskip\u201d, \u201cback\u201d, \u201cnone\u201d, \u201cstop\u201d.' : 'Say a count like \u201cone point five\u201d or \u201ctwo and a half\u201d, or \u201cskip\u201d, \u201cback\u201d, \u201csame\u201d, \u201cnone\u201d, \u201cstop\u201d.') + '</p></div>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-xvopen],[data-xv],[data-xvv]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (b.hasAttribute('data-xvopen')) { open(b.dataset.xvopen); return; }
    var a = b.dataset.xv, it = cur();
    if (b.dataset.xvv != null && it) { if (it.gen) gSet(it, +b.dataset.xvv); else save1(it, +b.dataset.xvv); next(1); return; }
    if (a === 'close') close(); else if (a === 'skip') next(1); else if (a === 'back') next(-1); else if (a === 'repeat') ask(); else if (a === 'talk') { try { window.speechSynthesis.cancel(); } catch (x) {} listen(); }
    else if (a === 'enter' && it) { var inp = document.getElementById('xv-in'), v = inp && inp.value !== '' ? Math.round(+inp.value * 10) / 10 : null;
      if (it.kind === 'cp') { var i2 = document.getElementById('xv-in2'), pv = i2 && i2.value !== '' ? Math.round(+i2.value) : 0; if (v != null || (i2 && i2.value !== '')) { gSet(it, { c: Math.round(v || 0), p: pv }); next(1); } return; }
      if (v != null && !isNaN(v)) { if (it.gen) gSet(it, it.kind === 'int' ? Math.round(v) : v); else save1(it, v); next(1); } }
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target && e.target.id === 'xv-in') { var b = document.querySelector('[data-xv="enter"]'); if (b) b.click(); } });
  function button() {
    [['sec_bar', 'bar'], ['sec_inv_beer', 'beer'], ['sec_inv_attic', 'attic'], ['sec_inv_bib', 'bib']].forEach(function (m) {
      var sec = document.querySelector('[data-fold="' + m[0] + '"]'); if (!sec || sec.querySelector('.x-vbtn')) return;
      var st = sec.querySelector('p.status') || sec.querySelector('p.muted') || sec.querySelector('p'); if (!st) return;
      st.insertAdjacentHTML('afterend', '<button type="button" class="btn x-vbtn" data-xvopen="' + m[1] + '">\ud83c\udfa4 Count by voice</button>');
    });
    if (window.VICIO_BOARD === 'kitchen' && !document.querySelector('.x-vbtn') && document.querySelector('#view input[data-poh]')) {
      var h = Array.prototype.filter.call(document.querySelectorAll('#view h2'), function (x) { return /prep count/i.test(x.textContent); })[0];
      if (h) h.insertAdjacentHTML('afterend', '<button type="button" class="btn x-vbtn" data-xvopen="prep">\ud83c\udfa4 Count by voice</button>');
    }
  }
  var css = document.createElement('style');
  css.textContent = '.x-vbtn,.btn.x-vbtn{display:inline-flex;align-items:center;min-height:52px;padding:0 20px;font-size:17px;font-weight:700;margin:6px 0 10px;background:#D9A441!important;color:#111!important;border:1px solid #D9A441;border-radius:12px;cursor:pointer}' +
    '#x-voice{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;padding:calc(12px + env(safe-area-inset-top,0px)) 12px calc(12px + env(safe-area-inset-bottom,0px))}' +
    '.xv-card{width:min(560px,100%);max-height:100%;overflow:auto;background:var(--surface,#18181B);color:var(--ink,#EDEDF0);border:1px solid var(--line,#2E2E34);border-radius:20px;padding:18px 20px;text-align:center}' +
    '.xv-top{display:flex;justify-content:space-between;align-items:center;color:var(--muted,#A1A1AA);font-size:13px;text-transform:uppercase;letter-spacing:.06em}.xv-x{width:44px;height:44px;border-radius:50%;border:1px solid var(--line,#2E2E34);background:var(--bg,#000);color:inherit;font-size:24px}' +
    '.xv-pic{height:150px;width:auto;margin:6px auto 0;display:block;filter:drop-shadow(0 3px 6px rgba(0,0,0,.5))}.xv-card h2{font-size:30px;margin:8px 0 10px;line-height:1.15}' +
    '.xv-nums{display:flex;justify-content:center;gap:28px;margin:4px 0 12px}.xv-nums small{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted,#A1A1AA)}.xv-nums b{font-size:34px}' +
    '.xv-mic{font-weight:700;color:var(--muted,#A1A1AA);margin:4px 0}.xv-mic.on{color:#D9A441}.xv-talk{width:84px;height:84px;border-radius:50%;border:0;background:#D9A441;font-size:38px;margin:6px auto 8px;display:block;box-shadow:0 0 0 0 rgba(217,164,65,.6)}' +
    '#x-voice .xv-mic.on+.xv-talk{animation:xvp 1.2s infinite}@keyframes xvp{0%{box-shadow:0 0 0 0 rgba(217,164,65,.6)}100%{box-shadow:0 0 0 22px rgba(217,164,65,0)}}' +
    '.xv-heard{color:var(--muted,#A1A1AA);margin:4px 0}.xv-msg{color:#F5A524;font-weight:700;margin:4px 0}' +
    '.xv-pad{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:10px 0}.xv-pad input{width:130px;min-height:52px;font-size:22px;text-align:center}.xv-pad button,.xv-row button{min-height:52px;min-width:84px;padding:0 16px;border-radius:12px;border:1px solid var(--line,#2E2E34);background:var(--bg,#000);color:inherit;font-size:17px;font-weight:700}' +
    '.xv-row{display:flex;justify-content:center;gap:10px;margin:6px 0}.xv-help{font-size:13px;color:var(--muted,#A1A1AA);margin:10px 0 0}';
  document.head.appendChild(css);
  (function start() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || !document.getElementById('view')) return setTimeout(start, 200);
    var r0 = render; render = function () { var out = r0.apply(this, arguments); try { button(); } catch (e) {} if (ST.open) try { draw(); } catch (e) {} return out; };
    try { button(); } catch (e) {}
  })();
})();
