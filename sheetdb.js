/* Vicio shared store, for the boards when they are hosted outside claude.ai (GitHub Pages).
   It talks to the Apps Script web app on the Vicio Schedule sheet and offers the same small surface
   the trackers already use: db.doc(path).onSnapshot/get/update/set/delete and db.collection(col).onSnapshot.
   Every phone polls for changes every few seconds, so a box ticked on one phone shows on the others.

   window.VICIO_API   the web app's /exec URL (set in config.js)
   window.VICIO_BOARD 'kitchen' or 'foh' (set by each page)
   Collections in SHARED are common to every board; everything else is kept under the board's own prefix,
   the same split Colette's Board uses, so the Kitchen and FOH checklists never overwrite each other. */
(function () {
  /* Page add-ons (extras.js) load on every board, connected or not. */
  try { var xs = document.createElement('script'); xs.src = 'extras.js?v=1'; (document.head || document.documentElement).appendChild(xs); } catch (e) {}
  var API = window.VICIO_API || '';
  if (!API) return;
  var SHARED = ['events', 'sshifts', 'sstaff', 'schedule', 'caltasks', 'resv', 'e86'];
  var PREFIX = window.VICIO_BOARD === 'foh' ? 'foh_' : 'kit_';
  function mapPath(p) { p = String(p); return SHARED.indexOf(p.split('/')[0]) >= 0 ? p : PREFIX + p; }

  var cache = {};          // full path -> data object
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

  var asking = false;
  function askPin() {
    if (asking) return false; asking = true;
    var v = window.prompt('Enter the Vicio team PIN');
    asking = false;
    if (v == null) return false;
    setPin(String(v).trim()); return true;
  }
  async function getJson(qs) {
    var r = await fetch(API + (API.indexOf('?') < 0 ? '?' : '&') + qs + '&pin=' + encodeURIComponent(pin()) + '&t=' + Date.now());
    var j = await r.json();
    if (!j.ok && j.error === 'pin') { if (askPin()) return getJson(qs); }
    if (!j.ok) { var e = new Error(j.error || 'failed'); e.code = j.error === 'pin' ? 'not_granted' : 'unavailable'; throw e; }
    if (j.role) role = j.role;
    return j;
  }
  async function postJson(body) {
    body.pin = pin();
    var r = await fetch(API, { method: 'POST', body: JSON.stringify(body) });
    var j = await r.json();
    if (!j.ok && j.error === 'pin') { if (askPin()) return postJson(body); }
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
    try {
      var j = await postJson({ op: op, path: path, data: data });
      if (op !== 'delete' && j.data) { cache[path] = j.data; notify(ch); }
    } catch (e) {
      if (before === undefined) delete cache[path]; else cache[path] = before;
      notify(ch); throw e;
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
