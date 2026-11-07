/* Vicio online pickup orders on the BOH and FOH boards. Inlined into Colette's Board after the board add-ons;
   the GitHub boards can load it the same way (sheetdb.js), with ord and osettings added to their shared collections.
   Reads ord/<id> (written by the Apps Script when a guest sends an order from viciophx.com/order) and osettings/web.

   BOH (kitchen screen): every new order with a sound and a waiting timer; Accept with a ready time, or Decline with the problem.
     Also the wait estimate the guest page shows and a Pause switch for online orders.
   FOH (confirmation): orders the kitchen accepted, "accepted, awaiting payment", with how the guest wants to hear back.
     Text opens the phone's own messages with the ready time typed in, sent from the shop phone; Texted logs it.
     Call shows the number large with Called / No answer. No guest reply: the card stays open and turns yellow after about 10 minutes.
     An order the kitchen has not accepted after a few minutes escalates here, red, with a sound. */
(function () {
  if (window.__vicioOrders) return;
  window.__vicioOrders = true;
  var BOARD = window.VICIO_BOARD || (/foh/i.test(location.pathname) ? 'foh' : 'kitchen');
  var KITCHEN = BOARD !== 'foh';
  var SET = { wait: 25, paused: false, pausedMsg: '', escalate: 4, yellow: 10 };
  var orders = {}, open = false, soundOn = false, ctx = null, heard = {}, lastBeep = 0, sub = null, subSet = null, wake = null;
  var pend = {};   /* the Accept or Decline picker that is open on a card */

  function es() { try { if (typeof lang === 'function') return lang() === 'es'; } catch (e) {} try { return typeof ui !== 'undefined' && ui.lang === 'es'; } catch (e) { return false; } }
  function t(en, sp) { return es() && sp ? sp : en; }
  function h(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function store() { if (window.VicioStore && window.VicioStore.db) return window.VicioStore.db; try { if (typeof db !== 'undefined' && db) return db; } catch (e) {} return null; }
  function who() { try { if (typeof whoName === 'function') return whoName() || ''; } catch (e) {} return ''; }
  function hm(ms) { var d = new Date(ms - 7 * 3600e3), H = d.getUTCHours(), M = d.getUTCMinutes(); return ((H + 11) % 12 + 1) + ':' + (M < 10 ? '0' : '') + M + ' ' + (H < 12 ? 'AM' : 'PM'); }   /* Phoenix, no DST */
  function ago(ms) { var s = Math.max(0, Math.floor((Date.now() - ms) / 1000)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function mins(ms) { return (Date.now() - ms) / 60e3; }

  /* ---------- data ---------- */
  function list() {
    var cut = Date.now() - 14 * 3600e3;
    return Object.keys(orders).map(function (id) { return Object.assign({ id: id }, orders[id]); })
      .filter(function (o) { return o && o.created > cut; }).sort(function (a, b) { return a.created - b.created; });
  }
  function save(id, patch) {
    var d = store(); if (!d) return Promise.reject(new Error('no store'));
    orders[id] = Object.assign({}, orders[id], patch); draw();
    return d.doc('ord/' + id).update(patch).catch(function () { flash(t('Not saved. Check the connection and tap again.', 'No se guardó. Revisa la conexión y vuelve a tocar.')); });
  }
  function saveSet(patch) {
    var d = store(); if (!d) return;
    SET = Object.assign({}, SET, patch); draw();
    d.doc('osettings/web').update(patch).catch(function () { flash(t('Not saved.', 'No se guardó.')); });
  }
  function watch() {
    var d = store();
    if (!d) return setTimeout(watch, 500);
    sub = d.collection('ord').onSnapshot(function (snap) {
      var next = {}; (snap.docs || []).forEach(function (x) { next[x.id] = x.data(); });
      orders = next; draw(); alertCheck();
    }, function () {});
    subSet = d.doc('osettings/web').onSnapshot(function (s) { if (s && s.exists) SET = Object.assign(SET, s.data()); draw(); }, function () {});
  }

  /* ---------- sound ---------- */
  function beep(kind) {
    if (!soundOn || !ctx) return;
    var notes = kind === 'esc' ? [880, 660, 880, 660] : kind === 'foh' ? [740, 988] : [988, 1319, 988, 1319];
    notes.forEach(function (f, i) {
      var o = ctx.createOscillator(), g = ctx.createGain(), at = ctx.currentTime + i * 0.22;
      o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.25, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.2);
      o.connect(g); g.connect(ctx.destination); o.start(at); o.stop(at + 0.21);
    });
  }
  function enableSound() {
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); ctx.resume(); soundOn = true; beep('foh'); } catch (e) { soundOn = false; }
    try { localStorage.setItem('vicio_ord_sound', '1'); } catch (e) {}
    keepAwake(); draw();
  }
  function keepAwake() { try { if (navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then(function (w) { wake = w; w.addEventListener('release', function () { wake = null; }); }, function () {}); } catch (e) {} }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && soundOn) keepAwake(); });

  /* What needs someone on this screen: BOH, any order not accepted yet. FOH, an escalated order, or an accepted one nobody reached yet. */
  function needs(o) {
    if (KITCHEN) return o.st === 'new';
    if (o.st === 'new') return mins(o.created) >= SET.escalate;
    if (o.st === 'accepted' || o.st === 'ready') return !o.reach;
    if (o.st === 'declined') return !o.reach;
    return false;
  }
  function alertCheck() {
    var fresh = list().filter(function (o) { return needs(o) && !heard[o.id + o.st]; });
    fresh.forEach(function (o) { heard[o.id + o.st] = 1; });
    if (fresh.length) { beep(!KITCHEN && fresh.some(function (o) { return o.st === 'new'; }) ? 'esc' : KITCHEN ? 'new' : 'foh'); if (!open) setOpen(true); }
  }
  /* Keep ringing every 20 seconds while something waits, so a busy line still hears it. */
  setInterval(function () {
    var waiting = list().filter(needs);
    if (waiting.length && Date.now() - lastBeep > 20000) { lastBeep = Date.now(); beep(!KITCHEN && waiting.some(function (o) { return o.st === 'new'; }) ? 'esc' : KITCHEN ? 'new' : 'foh'); }
    alertCheck(); if (open) tick(); else fab();
  }, 1000);

  /* ---------- view ---------- */
  var CSS = '#vo-fab{position:fixed;right:max(14px,env(safe-area-inset-right,0px));bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:2147483000;appearance:none;border:0;border-radius:999px;padding:12px 18px;min-height:52px;font:700 15px var(--f-display,system-ui);letter-spacing:.06em;text-transform:uppercase;background:var(--surface,#1B1B1F);color:var(--ink,#EDEDF0);box-shadow:0 6px 24px rgba(0,0,0,.35);border:1px solid var(--line,#2E2E34);cursor:pointer;display:flex;gap:8px;align-items:center}' +
    '#vo-fab.hot{background:var(--cherry,#C4161C);color:#fff;border-color:transparent;animation:vo-p 1.2s infinite}#vo-fab b{background:rgba(0,0,0,.25);border-radius:999px;padding:1px 9px}' +
    '@keyframes vo-p{50%{transform:scale(1.06)}}@media (prefers-reduced-motion:reduce){#vo-fab.hot{animation:none}}' +
    '#vo{position:fixed;inset:0;z-index:2147483001;background:var(--bg,#111113);color:var(--ink,#EDEDF0);overflow:auto;font-family:var(--f-body,system-ui);-webkit-overflow-scrolling:touch}' +
    '#vo .vo-w{max-width:1100px;margin:0 auto;padding:calc(12px + env(safe-area-inset-top,0px)) max(14px,env(safe-area-inset-right,0px)) 90px max(14px,env(safe-area-inset-left,0px));display:grid;gap:14px}' +
    '#vo .vo-top{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--bg,#111113);padding:8px 0;z-index:2;border-bottom:1px solid var(--line,#2E2E34)}' +
    '#vo h2{font:700 24px var(--f-display,system-ui);text-transform:uppercase;letter-spacing:.03em;margin:0}' +
    '#vo h3{font:700 13px var(--f-mono,ui-monospace,monospace);letter-spacing:.1em;text-transform:uppercase;color:var(--muted,#A1A1AA);margin:6px 0 0}' +
    '#vo .vo-b{appearance:none;border:1px solid var(--line,#2E2E34);background:var(--surface,#1B1B1F);color:var(--ink,#EDEDF0);border-radius:999px;padding:9px 16px;min-height:46px;font:700 15px var(--f-body,system-ui);cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:6px}' +
    '#vo .vo-b.go{background:var(--good,#4CC38A);border-color:var(--good,#4CC38A);color:#000}#vo .vo-b.no{color:var(--bad,#FF6B6B);border-color:var(--bad,#FF6B6B)}#vo .vo-b.red{background:var(--cherry,#C4161C);border-color:var(--cherry,#C4161C);color:#fff}#vo .vo-b.on{background:var(--ink,#EDEDF0);color:var(--bg,#111)}#vo .vo-b.big{min-height:60px;font-size:18px;padding:12px 22px}' +
    '#vo .vo-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
    '#vo .vo-cards{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(min(100%,330px),1fr));align-items:start}' +
    '#vo .vo-c{background:var(--surface,#1B1B1F);border:2px solid var(--line,#2E2E34);border-radius:14px;padding:14px;display:grid;gap:10px}' +
    '#vo .vo-c.new{border-color:var(--cherry,#E0575A)}#vo .vo-c.esc{border-color:var(--bad,#FF6B6B);background:var(--bad-soft,#3C1B18)}#vo .vo-c.yel{border-color:var(--warn,#F0A43A);background:var(--warn-soft,#33240F)}#vo .vo-c.ok{border-color:var(--good,#4CC38A)}' +
    '#vo .vo-h{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}#vo .vo-h b{font:700 22px var(--f-display,system-ui);text-transform:uppercase;letter-spacing:.02em}' +
    '#vo .vo-tm{font:700 22px var(--f-mono,ui-monospace,monospace);font-variant-numeric:tabular-nums;white-space:nowrap}#vo .vo-tm.late{color:var(--bad,#FF6B6B)}' +
    '#vo .vo-st{font:700 12px var(--f-mono,ui-monospace,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--muted,#A1A1AA)}' +
    '#vo ul.vo-it{margin:0;padding:0;list-style:none;display:grid;gap:8px}#vo ul.vo-it>li{font-size:17px;line-height:1.35}#vo ul.vo-it>li b{font-size:19px}#vo ul.vo-it ul{margin:2px 0 0 22px;padding:0;color:var(--muted,#A1A1AA);font-size:15.5px}#vo ul.vo-it ul li.n{color:var(--warn,#F0A43A)}' +
    '#vo .vo-note{border-left:3px solid var(--warn,#F0A43A);padding:4px 10px;font-size:15.5px}' +
    '#vo .vo-ph{font:700 34px var(--f-mono,ui-monospace,monospace);letter-spacing:.02em;text-decoration:none;color:var(--ink,#EDEDF0);display:block}' +
    '#vo .vo-how{font:700 14px var(--f-body,system-ui);text-transform:uppercase;letter-spacing:.08em;border-radius:8px;padding:6px 10px;background:var(--bg,#111);display:inline-block}' +
    '#vo .vo-mute{color:var(--muted,#A1A1AA);font-size:14px;margin:0}#vo .vo-empty{color:var(--muted,#A1A1AA);border:1px dashed var(--line,#2E2E34);border-radius:12px;padding:14px;text-align:center}' +
    '#vo .vo-set{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;background:var(--surface,#1B1B1F);border:1px solid var(--line,#2E2E34);border-radius:14px;padding:12px 14px}' +
    '#vo .vo-set b{font:700 26px var(--f-mono,ui-monospace,monospace)}#vo input.vo-in{font:500 16px var(--f-body,system-ui);background:var(--bg,#111);color:var(--ink,#EDEDF0);border:1px solid var(--line,#2E2E34);border-radius:9px;padding:9px 11px;min-height:46px;flex:1 1 200px}' +
    '#vo .vo-flash{position:fixed;left:50%;transform:translateX(-50%);bottom:24px;background:var(--cherry,#C4161C);color:#fff;padding:10px 18px;border-radius:999px;font-weight:700;z-index:3}';
  function mount() {
    if (document.getElementById('vo-fab')) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var b = document.createElement('button'); b.id = 'vo-fab'; b.type = 'button'; document.body.appendChild(b);
    var p = document.createElement('div'); p.id = 'vo'; p.hidden = true; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Online orders'); document.body.appendChild(p);
    try { if (localStorage.getItem('vicio_ord_sound') === '1') { /* a tap anywhere turns the sound back on after a reload */ document.addEventListener('pointerdown', function once() { document.removeEventListener('pointerdown', once, true); if (!soundOn) enableSound(); }, true); } } catch (e) {}
    fab();
  }
  function fab() {
    var b = document.getElementById('vo-fab'); if (!b) return;
    var act = list().filter(function (o) { return KITCHEN ? o.st === 'new' || o.st === 'accepted' : !/done|canceled/.test(o.st) && !(o.st === 'declined' && o.reach); });
    var hot = list().some(needs);
    b.className = hot ? 'hot' : ''; b.hidden = open;
    b.innerHTML = t('Online orders', 'Pedidos en línea') + (act.length ? ' <b>' + act.length + '</b>' : '');
  }
  function setOpen(v) { open = v; var p = document.getElementById('vo'); if (p) p.hidden = !v; if (v) keepAwake(); draw(); }
  function flash(m) { var p = document.getElementById('vo'); if (!p) return; var f = document.createElement('div'); f.className = 'vo-flash'; f.textContent = m; p.appendChild(f); setTimeout(function () { f.remove(); }, 2600); }

  function items(o) {
    var out = (o.items || []).map(function (l) {
      var sub = [];
      if (l.size) sub.push(l.size + ' ' + t('pan', 'pan'));
      if (l.flavor) sub.push(l.flavor);
      (l.adds || []).forEach(function (a) { sub.push('+ ' + a); });
      (l.pack || []).forEach(function (c) { sub.push(c.label + ': ' + c.name); });
      var notes = l.note ? '<li class="n">' + t('Note', 'Nota') + ': ' + h(l.note) + '</li>' : '';
      return '<li><b>' + h(l.qty) + ' × ' + h(l.name) + '</b>' + (sub.length || notes ? '<ul>' + sub.map(function (s) { return '<li>' + h(s) + '</li>'; }).join('') + notes + '</ul>' : '') + '</li>';
    }).join('');
    return '<ul class="vo-it">' + out + '</ul>' + (o.note ? '<div class="vo-note">' + h(o.note) + '</div>' : '');
  }
  function smsBody(o) {
    var first = String(o.name || '').split(' ')[0];
    if (o.st === 'declined') return 'Hi ' + first + ', this is Vicio. Sorry, we can’t take your pickup order #' + o.code + ' right now' + (o.problem ? ' (' + o.problem + ')' : '') + '. Call or text us at this number with any questions.';
    return 'Hi ' + first + ', this is Vicio. Your pickup order #' + o.code + ' is accepted and will be ready at ' + (o.readyHM || 'soon') + '. Total $' + o.total + ' plus tax, pay at pickup. We are inside Hotel San Carlos, 202 N Central Ave. Reply here with any questions.';
  }
  /* iPhone wants sms:NUMBER&body=, Android wants sms:NUMBER?body=; "?&body=" works on both. */
  function smsHref(o) { return 'sms:+1' + o.digits + '?&body=' + encodeURIComponent(smsBody(o)); }

  function kitchenCard(o) {
    var late = mins(o.created) >= SET.escalate, p = pend[o.id];
    var head = '<div class="vo-h"><div><b>#' + h(o.code) + ' · ' + h(o.name) + '</b><div class="vo-st">' + t('Pickup', 'Para llevar') + ' · $' + h(o.total) + '</div></div>';
    if (o.st === 'new') {
      var acts;
      if (p === 'acc') {
        acts = '<h3>' + t('Ready in', 'Listo en') + '</h3><div class="vo-row">' + [10, 15, 20, 25, 30, 40, 50, 60].map(function (m) {
          return '<button type="button" class="vo-b' + (m === SET.wait ? ' go' : '') + '" data-vo="ready" data-id="' + o.id + '" data-m="' + m + '">' + m + ' min</button>'; }).join('') +
          '<button type="button" class="vo-b" data-vo="cancelpick" data-id="' + o.id + '">' + t('Back', 'Atrás') + '</button></div>';
      } else if (p === 'dec') {
        acts = '<h3>' + t('What is the problem?', '¿Cuál es el problema?') + '</h3><div class="vo-row">' +
          [['Too busy right now', 'Demasiado ocupados'], ['Out of an item', 'Se acabó algo'], ['Kitchen closing', 'Cocina cerrando']].map(function (r) {
            return '<button type="button" class="vo-b no" data-vo="decline" data-id="' + o.id + '" data-r="' + h(r[0]) + '">' + t(r[0], r[1]) + '</button>'; }).join('') + '</div>' +
          '<div class="vo-row"><input class="vo-in" id="vo-why-' + o.id + '" placeholder="' + t('Other problem', 'Otro problema') + '"><button type="button" class="vo-b no" data-vo="decline" data-id="' + o.id + '">' + t('Decline', 'Rechazar') + '</button>' +
          '<button type="button" class="vo-b" data-vo="cancelpick" data-id="' + o.id + '">' + t('Back', 'Atrás') + '</button></div>';
      } else {
        acts = '<div class="vo-row"><button type="button" class="vo-b go big" data-vo="acc" data-id="' + o.id + '">' + t('Accept', 'Aceptar') + '</button>' +
          '<button type="button" class="vo-b no big" data-vo="dec" data-id="' + o.id + '">' + t('Decline', 'Rechazar') + '</button></div>';
      }
      return '<div class="vo-c ' + (late ? 'esc' : 'new') + '">' + head + '<div class="vo-tm' + (late ? ' late' : '') + '" data-ago="' + o.created + '">' + ago(o.created) + '</div></div>' +
        (late ? '<p class="vo-mute">' + t('Waiting too long. FOH has been told.', 'Lleva mucho esperando. FOH ya fue avisado.') + '</p>' : '') + items(o) + acts + '</div>';
    }
    if (o.st === 'accepted') {
      var left = Math.round((o.readyAt - Date.now()) / 60e3);
      return '<div class="vo-c ok">' + head + '<div style="text-align:right"><div class="vo-tm' + (left < 0 ? ' late' : '') + '">' + h(o.readyHM) + '</div><div class="vo-st">' + (left >= 0 ? left + ' min' : t('late ', 'tarde ') + (-left) + ' min') + '</div></div></div>' +
        items(o) + '<div class="vo-row"><button type="button" class="vo-b go big" data-vo="isready" data-id="' + o.id + '">' + t('Ready', 'Listo') + '</button></div></div>';
    }
    return '<div class="vo-c">' + head + '<div class="vo-st">' + h(stName(o)) + '</div></div></div>';
  }
  function stName(o) {
    return { new: t('Waiting for the kitchen', 'Esperando a cocina'), accepted: t('Accepted, awaiting payment', 'Aceptado, falta pagar'), ready: t('Ready, awaiting payment', 'Listo, falta pagar'),
      declined: t('Declined', 'Rechazado'), done: t('Paid and picked up', 'Pagado y recogido'), canceled: t('Canceled', 'Cancelado') }[o.st] || o.st;
  }
  function fohCard(o) {
    var head = '<div class="vo-h"><div><b>#' + h(o.code) + ' · ' + h(o.name) + '</b><div class="vo-st">' + h(stName(o)) + (o.readyHM && o.st !== 'declined' ? ' · ' + t('ready ', 'listo ') + h(o.readyHM) : '') + ' · $' + h(o.total) + '</div></div>';
    if (o.st === 'new') {
      return '<div class="vo-c esc">' + head + '<div class="vo-tm late">' + ago(o.created) + '</div></div><p><b>' + t('The kitchen has not accepted this yet. Go tell them.', 'La cocina no lo ha aceptado. Avísales.') + '</b></p>' + items(o) + '</div>';
    }
    var call = o.contact === 'call', reached = o.reach, waitedMin = reached ? mins(reached.at) : 0;
    var yel = reached && !o.confirmed && waitedMin >= SET.yellow && o.st !== 'declined';
    var how = '<span class="vo-how">' + (call ? t('Wants a CALL', 'Quiere LLAMADA') + (o.callTime ? ' · ' + h(o.callTime) : '') : t('Wants a TEXT', 'Quiere MENSAJE')) + '</span>';
    var ph = '<a target="_blank" rel="noopener" class="vo-ph" href="tel:+1' + h(o.digits) + '">' + h(o.phone) + '</a>';
    var acts = '';
    if (!reached) {
      acts = call
        ? '<div class="vo-row"><a target="_blank" rel="noopener" class="vo-b red big" href="tel:+1' + h(o.digits) + '">' + t('Call', 'Llamar') + '</a><button type="button" class="vo-b go big" data-vo="reach" data-how="called" data-id="' + o.id + '">' + t('Called', 'Ya llamé') + '</button>' +
          '<button type="button" class="vo-b" data-vo="reach" data-how="no answer" data-id="' + o.id + '">' + t('No answer', 'No contestó') + '</button><a target="_blank" rel="noopener" class="vo-b" href="' + h(smsHref(o)) + '">' + t('Text instead', 'Mejor mensaje') + '</a></div>'
        : '<div class="vo-row"><a target="_blank" rel="noopener" class="vo-b red big" href="' + h(smsHref(o)) + '" data-vo="smsopen" data-id="' + o.id + '">' + t('Text', 'Mensaje') + '</a><button type="button" class="vo-b go big" data-vo="reach" data-how="texted" data-id="' + o.id + '">' + t('Texted', 'Ya envié') + '</button>' +
          '<a target="_blank" rel="noopener" class="vo-b" href="tel:+1' + h(o.digits) + '">' + t('Call instead', 'Mejor llamar') + '</a></div>' +
          '<p class="vo-mute">' + t('Text opens this phone’s messages with the ready time typed in. Send it, then tap Texted. Replies come back to this phone.', 'Mensaje abre los mensajes de este teléfono con la hora lista. Envíalo y toca Ya envié. Las respuestas llegan a este teléfono.') + '</p>';
    } else {
      acts = '<p class="vo-mute">' + h(reached.how) + ' ' + hm(reached.at) + (reached.by ? ' · ' + h(reached.by) : '') +
        (o.st !== 'declined' ? (o.confirmed ? ' · ' + t('guest confirmed', 'cliente confirmó') : ' · ' + t('no reply yet', 'sin respuesta aún') + ' (' + Math.floor(waitedMin) + ' min)') : '') + '</p>' +
        '<div class="vo-row">' + (o.st !== 'declined' && !o.confirmed ? '<button type="button" class="vo-b" data-vo="confirm" data-id="' + o.id + '">' + t('Guest replied', 'Cliente respondió') + '</button>' : '') +
        '<button type="button" class="vo-b" data-vo="unreach" data-id="' + o.id + '">' + t('Reach again', 'Contactar otra vez') + '</button></div>';
    }
    var close = o.st === 'declined' ? '' : '<div class="vo-row"><button type="button" class="vo-b go big" data-vo="done" data-id="' + o.id + '">' + t('Paid and picked up', 'Pagado y recogido') + '</button>' +
      (pend[o.id] === 'cancel' ? '<button type="button" class="vo-b no" data-vo="nosure" data-id="' + o.id + '">' + t('Yes, no show', 'Sí, no vino') + '</button><button type="button" class="vo-b" data-vo="keep" data-id="' + o.id + '">' + t('Keep it', 'Dejarlo') + '</button>'
        : '<button type="button" class="vo-b no" data-vo="cancel" data-id="' + o.id + '">' + t('No show', 'No vino') + '</button>') + '</div>';
    var decl = o.st === 'declined' ? '<p><b>' + t('Kitchen declined', 'Cocina rechazó') + ': ' + h(o.problem || '') + '.</b> ' + t('Let the guest know.', 'Avísale al cliente.') + '</p>' : '';
    return '<div class="vo-c ' + (o.st === 'declined' && !reached ? 'esc' : yel ? 'yel' : o.st === 'ready' ? 'ok' : '') + '">' + head + '</div>' + decl + how + ph + acts + items(o) + close + '</div>';
  }

  /* A redraw between a finger going down and the click landing would swallow the tap, so redraws wait for the finger. */
  var pressing = false, lastUp = 0, later = null;
  document.addEventListener('pointerdown', function (e) { if (e.target.closest && e.target.closest('#vo')) pressing = true; }, true);
  document.addEventListener('pointerup', function () { if (pressing) { pressing = false; lastUp = Date.now(); } }, true);
  document.addEventListener('pointercancel', function () { pressing = false; }, true);
  function draw() {
    fab();
    var p = document.getElementById('vo'); if (!p || !open) return;
    if (pressing || Date.now() - lastUp < 400) { clearTimeout(later); later = setTimeout(draw, 450); return; }
    var L = list(), y = p.scrollTop, inputs = {};
    p.querySelectorAll('input.vo-in').forEach(function (i) { if (i.id && i.value) inputs[i.id] = i.value; });
    var top = '<div class="vo-top"><h2>' + (KITCHEN ? t('Online orders · BOH', 'Pedidos en línea · Cocina') : t('Online orders · FOH', 'Pedidos en línea · FOH')) + '</h2><div class="vo-row">' +
      (soundOn ? '<span class="vo-st">' + t('Sound on', 'Sonido activado') + '</span>' : '<button type="button" class="vo-b red" data-vo="sound">' + t('Tap to turn on order sound', 'Toca para activar el sonido') + '</button>') +
      '<button type="button" class="vo-b" data-vo="close">' + t('Back to the board', 'Volver al tablero') + '</button></div></div>';
    var body = '';
    if (!store()) body = '<p class="vo-empty">' + t('Connecting to the shared board…', 'Conectando al tablero…') + '</p>';
    else if (KITCHEN) {
      var nw = L.filter(function (o) { return o.st === 'new'; }), acc = L.filter(function (o) { return o.st === 'accepted'; });
      var rest = L.filter(function (o) { return o.st !== 'new' && o.st !== 'accepted'; }).reverse().slice(0, 8);
      body = '<div class="vo-set"><span class="vo-st">' + t('Wait the guest sees', 'Espera que ve el cliente') + '</span><button type="button" class="vo-b" data-vo="wait" data-d="-5">−5</button><b>' + SET.wait + ' min</b><button type="button" class="vo-b" data-vo="wait" data-d="5">+5</button>' +
        (SET.paused ? '<button type="button" class="vo-b red" data-vo="resume">' + t('Online orders PAUSED · tap to resume', 'Pedidos en PAUSA · toca para reanudar') + '</button>'
          : pend.pause ? '<input class="vo-in" id="vo-pmsg" placeholder="' + t('Message guests see (optional)', 'Mensaje para clientes (opcional)') + '"><button type="button" class="vo-b red" data-vo="dopause">' + t('Pause now', 'Pausar ya') + '</button><button type="button" class="vo-b" data-vo="nopause">' + t('Back', 'Atrás') + '</button>'
          : '<button type="button" class="vo-b" data-vo="pause">' + t('Pause online orders', 'Pausar pedidos en línea') + '</button>') + '</div>' +
        '<h3>' + t('New', 'Nuevos') + ' (' + nw.length + ')</h3>' + (nw.length ? '<div class="vo-cards">' + nw.map(kitchenCard).join('') + '</div>' : '<p class="vo-empty">' + t('No new orders.', 'No hay pedidos nuevos.') + '</p>') +
        '<h3>' + t('Cooking', 'En preparación') + ' (' + acc.length + ')</h3>' + (acc.length ? '<div class="vo-cards">' + acc.map(kitchenCard).join('') + '</div>' : '<p class="vo-empty">' + t('Nothing cooking.', 'Nada en preparación.') + '</p>') +
        (rest.length ? '<h3>' + t('Earlier tonight', 'Más temprano') + '</h3><div class="vo-cards">' + rest.map(kitchenCard).join('') + '</div>' : '');
    } else {
      var esc = L.filter(function (o) { return o.st === 'new' && mins(o.created) >= SET.escalate; });
      var live = L.filter(function (o) { return o.st === 'accepted' || o.st === 'ready' || (o.st === 'declined' && !o.reach); });
      var waitK = L.filter(function (o) { return o.st === 'new' && mins(o.created) < SET.escalate; });
      var past = L.filter(function (o) { return /done|canceled/.test(o.st) || (o.st === 'declined' && o.reach); }).reverse().slice(0, 10);
      body = (esc.length ? '<h3>' + t('Kitchen has not accepted', 'Cocina no ha aceptado') + '</h3><div class="vo-cards">' + esc.map(fohCard).join('') + '</div>' : '') +
        '<h3>' + t('Accepted, awaiting payment', 'Aceptados, falta pagar') + ' (' + live.length + ')</h3>' + (live.length ? '<div class="vo-cards">' + live.map(fohCard).join('') + '</div>' : '<p class="vo-empty">' + t('Nothing to confirm.', 'Nada que confirmar.') + '</p>') +
        (waitK.length ? '<p class="vo-mute">' + waitK.length + ' ' + t('waiting for the kitchen to accept.', 'esperando que cocina acepte.') + '</p>' : '') +
        (past.length ? '<h3>' + t('Closed tonight', 'Cerrados esta noche') + '</h3><div class="vo-cards">' + past.map(function (o) { return '<div class="vo-c"><div class="vo-h"><div><b>#' + h(o.code) + ' · ' + h(o.name) + '</b><div class="vo-st">' + h(stName(o)) + ' · $' + h(o.total) + '</div></div></div></div>'; }).join('') + '</div>' : '');
    }
    p.innerHTML = '<div class="vo-w">' + top + body + '</div>';
    Object.keys(inputs).forEach(function (k) { var i = document.getElementById(k); if (i) i.value = inputs[k]; });
    p.scrollTop = y;
  }
  /* Timers tick in place; the cards redraw only when something on them changes (late, yellow, minutes left). */
  var lastSig = '';
  function tick() {
    document.querySelectorAll('#vo [data-ago]').forEach(function (e) { e.textContent = ago(+e.dataset.ago); });
    var sig = list().map(function (o) { return o.id + o.st + (mins(o.created) >= SET.escalate) + Math.floor(o.reach ? mins(o.reach.at) : 0) + (o.readyAt ? Math.round((o.readyAt - Date.now()) / 60e3) : ''); }).join('|');
    if (sig !== lastSig) { lastSig = sig; draw(); }
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('#vo-fab')) { if (!soundOn) enableSound(); setOpen(true); return; }
    var b = e.target.closest('#vo [data-vo]'); if (!b) return;
    var a = b.dataset.vo, id = b.dataset.id, o = id && orders[id], by = who();
    if (a === 'sound') return enableSound();
    if (a === 'close') return setOpen(false);
    if (a === 'acc' || a === 'dec') { pend[id] = a; return draw(); }
    if (a === 'cancelpick') { delete pend[id]; return draw(); }
    if (a === 'ready') { var m = +b.dataset.m, at = Date.now() + m * 60e3; delete pend[id]; return save(id, { st: 'accepted', acceptedAt: Date.now(), readyAt: at, readyHM: hm(at), acceptedBy: by }); }
    if (a === 'decline') { var inp = document.getElementById('vo-why-' + id), why = b.dataset.r || (inp && inp.value.trim()); if (!why) { if (inp) inp.focus(); return; } delete pend[id]; return save(id, { st: 'declined', problem: why, declinedAt: Date.now(), declinedBy: by }); }
    if (a === 'isready') return save(id, { st: 'ready', readyDone: Date.now() });
    if (a === 'wait') return saveSet({ wait: Math.max(5, Math.min(120, (SET.wait || 25) + Number(b.dataset.d))) });
    if (a === 'pause') { pend.pause = 1; return draw(); }
    if (a === 'nopause') { delete pend.pause; return draw(); }
    if (a === 'dopause') { var pm = document.getElementById('vo-pmsg'); delete pend.pause; return saveSet({ paused: true, pausedMsg: (pm && pm.value.trim() || 'The kitchen is slammed. Back soon.').slice(0, 200) }); }
    if (a === 'resume') return saveSet({ paused: false, pausedMsg: '' });
    if (a === 'reach') return save(id, { reach: { how: b.dataset.how, at: Date.now(), by: by } });
    if (a === 'unreach') return save(id, { reach: null, confirmed: false });
    if (a === 'confirm') return save(id, { confirmed: Date.now() });
    if (a === 'done') return save(id, { st: 'done', doneAt: Date.now(), doneBy: by });
    if (a === 'cancel') { pend[id] = 'cancel'; return draw(); }
    if (a === 'keep') { delete pend[id]; return draw(); }
    if (a === 'nosure') { delete pend[id]; return save(id, { st: 'canceled', canceledAt: Date.now(), canceledBy: by }); }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) setOpen(false); });

  function start() { if (!document.body) return setTimeout(start, 100); mount(); watch(); }
  start();
})();
