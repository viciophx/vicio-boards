/* Vicio shared store, for the boards when they are hosted outside claude.ai (GitHub Pages).
   It talks to the Apps Script web app on the Vicio Schedule sheet and offers the same small surface
   the trackers already use: db.doc(path).onSnapshot/get/update/set/delete and db.collection(col).onSnapshot.
   Every phone polls for changes every few seconds, so a box ticked on one phone shows on the others.

   window.VICIO_API   the web app's /exec URL (set in config.js)
   window.VICIO_BOARD 'kitchen' or 'foh' (set by each page)
   Collections in SHARED are common to every board; everything else is kept under the board's own prefix,
   the same split Colette's Board uses, so the Kitchen and FOH checklists never overwrite each other. */
(function () {
  /* Page add-ons (extras.js) load on every board, connected or not, always fresh. */
  try { var xs = document.createElement('script'); xs.src = 'extras.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(xs); } catch (e) {}
  /* Self-update: a board left open on an iPad never reloads its own code. version.txt changes with every update to the boards;
     when it does, the page reloads itself the next time nobody is typing, so new features reach the iPads without anyone touching them. */
  (function () {
    var build = null;
    function check() {
      fetch('version.txt?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (v) {
        v = String(v || '').trim(); if (!v) return;
        if (build === null) { build = v; return; }
        if (v === build) return;
        var a = document.activeElement;
        if (a && /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || document.getElementById('vicio-pin')) return;
        location.reload();
      }).catch(function () {});
    }
    check();
    setInterval(function () { if (!document.hidden) check(); }, 300000);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) check(); });
  })();
  var API = window.VICIO_API || '';
  if (!API) return;
  var SHARED = ['events', 'sshifts', 'sstaff', 'schedule', 'caltasks', 'resv', 'e86', 'tr'];
  var PREFIX = window.VICIO_BOARD === 'foh' ? 'foh_' : 'kit_';
  /* A path starting with ~ is read as written, with no board prefix: FOH reads the kitchen's recipe photos at ~kit_rphotos/<id>. */
  function mapPath(p) { p = String(p); if (p.charAt(0) === '~') return p.slice(1); return SHARED.indexOf(p.split('/')[0]) >= 0 ? p : PREFIX + p; }

  var cache = {};          // full path -> data object
  /* Taps still saving, per path, and the sheet's time on each path's last save from this device. While a path is saving,
     neither an older poll nor an earlier save's reply may overwrite what the screen shows. */
  var pending = {}, ackAt = {};
  var since = 0, timer = null, busy = false, started = false;
  var docSubs = [], colSubs = [], shiftSubs = [];
  var lastShifts = '';
  var role = 'staff';
  function pin() { try { return localStorage.getItem('vicio_pin') || ''; } catch (e) { return ''; } }
  function setPin(v) { try { localStorage.setItem('vicio_pin', v); } catch (e) {} }

  function clone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }
  function deep(a, b) {
    Object.keys(b || {}).forEach(function (k) {
      var v = b[k];
      if (v && typeof v === 'object' && !Array.isArray(v)) a[k] = deep(a[k] && typeof a[k] === 'object' && !Array.isArray(a[k]) ? a[k] : {}, v);
      else a[k] = v;
    });
    return a;
  }

  /* PIN screen drawn on the page. The browser's own prompt box is unreliable on iPads running the board from the Home Screen,
     and it never says when a PIN is wrong. Everyone waiting on the PIN shares one screen; it closes when a PIN is entered. */
  var asking = null;
  function askPin() {
    if (asking) return asking;
    asking = new Promise(function (resolve) {
      var tried = !!pin();
      var wrap = document.createElement('div');
      wrap.id = 'vicio-pin';
      wrap.setAttribute('style', 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(24,24,27,.72);font:16px/1.45 system-ui,-apple-system,sans-serif;color:#18181B');
      wrap.innerHTML = '<form style="width:min(100%,360px);background:#fff;border-top:8px solid #8B1E1E;border-radius:12px;padding:24px;box-shadow:0 12px 40px rgba(0,0,0,.3)">' +
        '<h2 style="margin:0 0 4px;font-size:22px">Team PIN</h2><p style="margin:0 0 14px;color:#5E5E66">Ask a manager for it. This device remembers it.<br>P\u00eddelo a un gerente. Este aparato lo recuerda.</p>' +
        '<input id="vicio-pin-in" type="tel" inputmode="numeric" autocomplete="one-time-code" placeholder="PIN" aria-label="Team PIN" style="width:100%;box-sizing:border-box;font-size:28px;letter-spacing:.2em;text-align:center;padding:12px;border:2px solid #E4E2DF;border-radius:10px;color:#18181B;background:#fff">' +
        '<p id="vicio-pin-err" style="min-height:1.4em;margin:8px 0 10px;color:#8B1E1E;font-weight:600">' + (tried ? 'That PIN didn\u2019t work. Try again. \u00b7 Ese PIN no funcion\u00f3. Int\u00e9ntalo de nuevo.' : '') + '</p>' +
        '<button type="submit" style="width:100%;font:600 17px system-ui,-apple-system,sans-serif;background:#8B1E1E;color:#fff;border:0;border-radius:10px;padding:14px;cursor:pointer">Enter \u00b7 Entrar</button></form>';
      (document.body || document.documentElement).appendChild(wrap);
      var inp = wrap.querySelector('#vicio-pin-in'), err = wrap.querySelector('#vicio-pin-err');
      setTimeout(function () { try { inp.focus(); } catch (e) {} }, 50);
      wrap.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        var v = String(inp.value || '').trim();
        if (!v) { err.textContent = 'Type the PIN first. \u00b7 Escribe el PIN primero.'; inp.focus(); return; }
        setPin(v); wrap.remove(); asking = null; resolve(true);
      });
    });
    return asking;
  }
  async function getJson(qs) {
    var r = await fetch(API + (API.indexOf('?') < 0 ? '?' : '&') + qs + '&pin=' + encodeURIComponent(pin()) + '&t=' + Date.now());
    var j = await r.json();
    if (!j.ok && j.error === 'pin') { if (await askPin()) return getJson(qs); }
    if (!j.ok) { var e = new Error(j.error || 'failed'); e.code = j.error === 'pin' ? 'not_granted' : 'unavailable'; throw e; }
    if (j.role) role = j.role;
    return j;
  }
  async function postJson(body) {
    body.pin = pin();
    var r = await fetch(API, { method: 'POST', body: JSON.stringify(body) });
    var j = await r.json();
    if (!j.ok && j.error === 'pin') { if (await askPin()) return postJson(body); }
    if (!j.ok) { var e = new Error(j.error || 'failed'); e.code = j.error === 'pin' ? 'not_granted' : 'unavailable'; throw e; }
    if (j.role) role = j.role;
    return j;
  }

  function notify(changed) {
    docSubs.forEach(function (s) { if (!changed || changed[s.path]) s.fire(); });
    colSubs.forEach(function (s) {
      if (!changed) return s.fire();
      for (var p in changed) if (p.indexOf(s.col + '/') === 0) return s.fire();
    });
  }
  async function poll() {
    if (busy) return; busy = true;
    try {
      var j = await getJson('since=' + since);
      var changed = {};
      (j.docs || []).forEach(function (d) {
        if (pending[d.path] || (ackAt[d.path] && d.updated < ackAt[d.path])) return;
        if (d.deleted) delete cache[d.path]; else cache[d.path] = d.data || {};
        changed[d.path] = 1;
      });
      if (j.now) since = Math.max(since, j.now - 1);
      var first = !started; started = true;
      if (first) notify(null); else if (Object.keys(changed).length) notify(changed);
    } catch (e) {}
    busy = false;
  }
  async function pollShifts() {
    if (!shiftSubs.length) return;
    try {
      var j = await getJson('shifts=1');
      var csv = (j.rows || []).map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); return /[",\n\r]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\n');
      if (csv !== lastShifts) { lastShifts = csv; shiftSubs.forEach(function (f) { f(csv); }); }
    } catch (e) {}
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(function () { if (!document.hidden) { poll(); pollShifts(); } schedule(); }, 5000);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) { poll(); pollShifts(); } });
  var booted = false;
  function boot() { if (booted) return; booted = true; poll(); pollShifts(); schedule(); }

  function docSnap(path) { var d = cache[path]; return { exists: d !== undefined, id: path.split('/').pop(), data: function () { return clone(d) || {}; } }; }
  function doc(p) {
    var path = mapPath(p);
    return {
      onSnapshot: function (cb) {
        var s = { path: path, fire: function () { cb(docSnap(path)); } };
        docSubs.push(s); boot(); if (started) setTimeout(s.fire, 0);
        return function () { docSubs = docSubs.filter(function (x) { return x !== s; }); };
      },
      get: async function () { if (!started) await poll(); return docSnap(path); },
      update: function (patch) { return write('update', path, patch); },
      set: function (data) { return write('set', path, data); },
      delete: function () { return write('delete', path, null); }
    };
  }
  function collection(c) {
    var col = mapPath(c);
    return {
      onSnapshot: function (cb) {
        var s = { col: col, fire: function () {
          var docs = [];
          for (var p in cache) {
            if (p.indexOf(col + '/') !== 0) continue;
            var id = p.slice(col.length + 1);
            if (id.indexOf('/') >= 0) continue;
            (function (pp, ii) { docs.push({ id: ii, data: function () { return clone(cache[pp]); } }); })(p, id);
          }
          cb({ docs: docs });
        } };
        colSubs.push(s); boot(); if (started) setTimeout(s.fire, 0);
        return function () { colSubs = colSubs.filter(function (x) { return x !== s; }); };
      },
      doc: function (id) { return doc(c + '/' + id); }
    };
  }
  async function write(op, path, data) {
    var before = cache[path];
    if (op === 'delete') delete cache[path];
    else cache[path] = op === 'set' ? clone(data || {}) : deep(clone(before) || {}, clone(data || {}));
    var ch = {}; ch[path] = 1; notify(ch);
    pending[path] = (pending[path] || 0) + 1;
    try {
      var j = await postJson({ op: op, path: path, data: data });
      pending[path]--;
      if (j.updated) ackAt[path] = Math.max(ackAt[path] || 0, j.updated);
      if (!pending[path] && op !== 'delete' && j.data) { cache[path] = j.data; notify(ch); }
    } catch (e) {
      pending[path]--;
      if (!pending[path]) { if (before === undefined) delete cache[path]; else cache[path] = before; notify(ch); }
      throw e;
    }
  }

  window.VicioStore = {
    db: { doc: doc, collection: collection },
    role: function () { return role; },
    ready: function () { return poll().then(function () { return role; }); },
    watchShifts: function (fn) { shiftSubs.push(fn); boot(); pollShifts(); },
    notify: function (subject, html) { return postJson({ op: 'notify', subject: subject, html: html }); },
    forgetPin: function () { setPin(''); }
  };
})();
