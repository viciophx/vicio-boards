/* Vicio FOH: count the bar by voice (Eric, Nov 22 2026). Loaded by config.js; FOH only.
   A "Count by voice" button at the top of the bar count opens a full-screen card. The board says each bottle's name out loud
   (and shows its photo), then listens. Say the count the way you'd say it: "one point five", "two and a half", "half",
   "three", "none" or "empty" (0). It repeats the number back, saves it like a tap would, and moves to the next bottle.
   Other things you can say: "skip" or "next" (leave it, move on), "back" (previous bottle), "repeat" (say the name again),
   "same" (last week's number), "stop" or "done" (close). Batches take "full", "three quarters", "half", "quarter" or "make".
   It starts at the first bottle that isn't counted yet and goes in shelf order. Big Back / Skip / Repeat buttons and a
   number pad sit on the card too, for when it's loud. Uses the iPad's or phone's own speech (Safari asks for the
   microphone the first time). English, with Spanish numbers understood too ("uno punto cinco", "medio"). */
(function () {
  if (window.__vicioVoice || window.VICIO_BOARD !== 'foh') return;
  window.__vicioVoice = true;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var ONES = { zero: 0, oh: 0, none: 0, empty: 0, nothing: 0, one: 1, won: 1, two: 2, to: 2, too: 2, three: 3, four: 4, for: 4, five: 5, six: 6, seven: 7, eight: 8, ate: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
    cero: 0, nada: 0, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, veinte: 20 };
  var ST = { open: false, i: 0, list: [], heard: '', msg: '', listening: false, rec: null, lastSaid: '' };
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function items() { return (typeof INVITEMS !== 'undefined' ? INVITEMS : []).map(function (i) { return { id: i[0], name: i[1], group: i[2] || '' }; }); }
  function isBatch(it) { return /\(batch\)/i.test(it.name); }
  function isBeer(it) { return /beer/i.test(it.group); }
  function cnt() { return (S.inv && S.inv.c) || {}; }
  function prev() { return (S.prevInv && S.prevInv.c) || {}; }
  function fmt(v) { return v == null ? '\u2013' : (+v).toFixed(2).replace(/0+$/, '').replace(/\.$/, ''); }
  function sayNum(v) { if (v === 0) return 'none'; var w = Math.floor(v + 1e-9), f = Math.round((v - w) * 10); return f ? (w ? w + ' point ' + f : 'point ' + f) : String(w); }
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
  function speak(text, then) {
    try {
      if (!window.speechSynthesis) { if (then) then(); return; }
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text); u.rate = 1.05; u.lang = 'en-US';
      var done = false, fin = function () { if (done) return; done = true; if (then) setTimeout(then, 150); };
      u.onend = fin; u.onerror = fin; setTimeout(fin, 600 + text.length * 90);
      window.speechSynthesis.speak(u);
    } catch (e) { if (then) then(); }
  }
  function listen() {
    if (!SR || !ST.open) return;
    try { if (ST.rec) ST.rec.abort(); } catch (e) {}
    var r = new SR(); ST.rec = r; r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 3; r.continuous = false;
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
    speak(it.name.replace(/\s*\(batch\)/i, ' batch').replace(/\u2019/g, "'"), listen);
  }
  function save1(it, v) {
    var o = {}; o[it.id] = v;
    S.inv = Object.assign({}, S.inv, { c: Object.assign({}, cnt(), o) });
    var patch = { c: o, at: Date.now() }; try { var wn = typeof whoName === 'function' ? whoName() : ''; if (wn) patch.who = wn; } catch (e) {}
    save('barinv/' + ui.week, patch);
  }
  function next(by) { ST.i = Math.max(0, Math.min(ST.list.length, ST.i + by)); if (ST.i >= ST.list.length) { finish(); return; } ask(); }
  function finish() { ST.msg = 'That\u2019s the whole bar.'; draw(); speak('That\u2019s the whole bar. Nice work.'); setTimeout(close, 2500); }
  function handle(alts) {
    var it = cur(); if (!it) return;
    var t = (alts[0] || '').toLowerCase(); ST.heard = alts[0] || '';
    if (/\b(stop|done|finish|quit|close|para|listo)\b/.test(t)) { close(); return; }
    if (/\b(skip|next|pass|siguiente)\b/.test(t)) { next(1); return; }
    if (/\b(back|previous|go back|atr[aá]s)\b/.test(t)) { next(-1); return; }
    if (/\b(repeat|again|what|otra vez|repite)\b/.test(t)) { ask(); return; }
    if (/\b(same|same as last week|igual)\b/.test(t)) { var p = prev()[it.id]; if (p != null && p !== '') { save1(it, +p); speak('same, ' + sayNum(+p), function () { next(1); }); } else { speak('No number last week. Say the count.', listen); } return; }
    var v = null; for (var a = 0; a < alts.length && v == null; a++) v = parse(alts[a], isBatch(it));
    if (v == null) { ST.msg = 'Didn\u2019t catch a number. Say it again.'; draw(); speak('Say that again?', listen); return; }
    if (isBeer(it)) v = Math.round(v);
    ST.msg = ''; save1(it, v); draw();
    speak(isBatch(it) ? (v === 0 ? 'make' : Math.round(v * 100) + ' percent') : sayNum(v), function () { next(1); });
  }
  function open() {
    var all = items(), c = cnt(); ST.list = all;
    var first = all.findIndex(function (it) { return c[it.id] == null || c[it.id] === ''; });
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
    var c = cnt(), v = c[it.id], p = prev()[it.id], src = pic(it.id);
    el.innerHTML = '<div class="xv-card"><div class="xv-top"><span>' + esc(it.group) + ' \u00b7 ' + (ST.i + 1) + ' of ' + ST.list.length + '</span><button type="button" class="xv-x" data-xv="close" aria-label="Stop counting">\u00d7</button></div>' +
      (src ? '<img class="xv-pic" src="' + src + '" alt="">' : '') + '<h2>' + esc(it.name) + '</h2>' +
      '<div class="xv-nums"><div><small>Now</small><b>' + (isBatch(it) && v != null && v !== '' ? (+v === 0 ? 'Make' : Math.round(v * 100) + '%') : fmt(v === '' ? null : v)) + '</b></div><div><small>Last week</small><b>' + fmt(p === '' ? null : p) + '</b></div></div>' +
      '<div class="xv-mic' + (ST.listening ? ' on' : '') + '" aria-live="polite">' + (ST.listening ? 'Listening\u2026' : 'Tap the mic to talk') + '</div>' +
      '<button type="button" class="xv-talk" data-xv="talk" aria-label="Talk">\ud83c\udfa4</button>' +
      (ST.heard ? '<p class="xv-heard">Heard: \u201c' + esc(ST.heard) + '\u201d</p>' : '') + (ST.msg ? '<p class="xv-msg">' + esc(ST.msg) + '</p>' : '') +
      '<div class="xv-pad">' + (isBatch(it) ? [['1', 'Full'], ['0.75', '75%'], ['0.5', 'Half'], ['0.25', '25%'], ['0', 'Make']].map(function (b) { return '<button type="button" data-xvv="' + b[0] + '">' + b[1] + '</button>'; }).join('')
        : '<input type="number" inputmode="decimal" step="0.1" min="0" id="xv-in" placeholder="Type a count" aria-label="Count"><button type="button" data-xv="enter">Save</button>') + '</div>' +
      '<div class="xv-row"><button type="button" data-xv="back">Back</button><button type="button" data-xv="repeat">Repeat</button><button type="button" data-xv="skip">Skip</button></div>' +
      '<p class="xv-help">Say a count like \u201cone point five\u201d or \u201ctwo and a half\u201d, or \u201cskip\u201d, \u201cback\u201d, \u201csame\u201d, \u201cnone\u201d, \u201cstop\u201d.</p></div>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-xvopen],[data-xv],[data-xvv]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    if (b.hasAttribute('data-xvopen')) { open(); return; }
    var a = b.dataset.xv, it = cur();
    if (b.dataset.xvv != null && it) { save1(it, +b.dataset.xvv); next(1); return; }
    if (a === 'close') close(); else if (a === 'skip') next(1); else if (a === 'back') next(-1); else if (a === 'repeat') ask(); else if (a === 'talk') { try { window.speechSynthesis.cancel(); } catch (x) {} listen(); }
    else if (a === 'enter' && it) { var inp = document.getElementById('xv-in'), v = inp && inp.value !== '' ? Math.round(+inp.value * 10) / 10 : null; if (v != null && !isNaN(v)) { save1(it, v); next(1); } }
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target && e.target.id === 'xv-in') { var b = document.querySelector('[data-xv="enter"]'); if (b) b.click(); } });
  function button() {
    var sec = document.querySelector('[data-fold="sec_bar"]'); if (!sec || sec.querySelector('.x-vbtn')) return;
    var st = sec.querySelector('p.status'); if (!st) return;
    st.insertAdjacentHTML('afterend', '<button type="button" class="btn x-vbtn" data-xvopen>\ud83c\udfa4 Count by voice</button>');
  }
  var css = document.createElement('style');
  css.textContent = '.x-vbtn{min-height:52px;padding:0 20px;font-size:17px;font-weight:700;margin:6px 0 10px;background:#D9A441;color:#111;border-color:#D9A441}' +
    '#x-voice{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;padding:calc(12px + env(safe-area-inset-top,0px)) 12px calc(12px + env(safe-area-inset-bottom,0px))}' +
    '.xv-card{width:min(560px,100%);max-height:100%;overflow:auto;background:var(--surface,#18181B);color:var(--ink,#EDEDF0);border:1px solid var(--line,#2E2E34);border-radius:20px;padding:18px 20px;text-align:center}' +
    '.xv-top{display:flex;justify-content:space-between;align-items:center;color:var(--muted,#A1A1AA);font-size:13px;text-transform:uppercase;letter-spacing:.06em}.xv-x{width:44px;height:44px;border-radius:50%;border:1px solid var(--line,#2E2E34);background:var(--bg,#000);color:inherit;font-size:24px}' +
    '.xv-pic{height:150px;width:auto;margin:6px auto 0;display:block;filter:drop-shadow(0 3px 6px rgba(0,0,0,.5))}.xv-card h2{font-size:30px;margin:8px 0 10px;line-height:1.15}' +
    '.xv-nums{display:flex;justify-content:center;gap:28px;margin:4px 0 12px}.xv-nums small{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted,#A1A1AA)}.xv-nums b{font-size:34px}' +
    '.xv-mic{font-weight:700;color:var(--muted,#A1A1AA);margin:4px 0}.xv-mic.on{color:#D9A441}.xv-talk{width:84px;height:84px;border-radius:50%;border:0;background:#D9A441;font-size:38px;margin:6px auto 8px;display:block;box-shadow:0 0 0 0 rgba(217,164,65,.6)}' +
    '#x-voice .xv-mic.on+.xv-talk{animation:xvp 1.2s infinite}@keyframes xvp{0%{box-shadow:0 0 0 0 rgba(217,164,65,.6)}100%{box-shadow:0 0 0 22px rgba(217,164,65,0)}}' +
    '.xv-heard{color:var(--muted,#A1A1AA);margin:4px 0}.xv-msg{color:#F5A524;font-weight:700;margin:4px 0}' +
    '.xv-pad{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:10px 0}.xv-pad input{width:150px;min-height:52px;font-size:22px;text-align:center}.xv-pad button,.xv-row button{min-height:52px;min-width:84px;padding:0 16px;border-radius:12px;border:1px solid var(--line,#2E2E34);background:var(--bg,#000);color:inherit;font-size:17px;font-weight:700}' +
    '.xv-row{display:flex;justify-content:center;gap:10px;margin:6px 0}.xv-help{font-size:13px;color:var(--muted,#A1A1AA);margin:10px 0 0}';
  document.head.appendChild(css);
  (function start() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || !document.getElementById('view')) return setTimeout(start, 200);
    var r0 = render; render = function () { var out = r0.apply(this, arguments); try { button(); } catch (e) {} if (ST.open) try { draw(); } catch (e) {} return out; };
    try { button(); } catch (e) {}
  })();
})();
