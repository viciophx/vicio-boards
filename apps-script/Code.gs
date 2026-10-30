/**
 * Vicio boards: shared store on the Vicio Schedule Google Sheet.
 *
 * Paste this into the sheet's Apps Script (Extensions > Apps Script), then
 * Deploy > New deployment > Web app, Execute as: Me, Who has access: Anyone.
 * The pages call the /exec URL; staff never sign in to Google.
 *
 * Script properties (Project Settings > Script properties), all optional:
 *   STAFF_PIN    PIN staff type once on their phone. Empty = no PIN.
 *   MANAGER_PIN  PIN that unlocks manager pages and settings.
 *   NOTIFY_TO    Comma-separated emails for checklist notices. Empty = no email.
 *
 * Tabs:
 *   Store   One row per saved record (checklist, log, to-do, roster entry...).
 *           Columns: Path | Updated | Deleted | Data (split across columns D onward
 *           when a record is longer than one cell can hold). Managed by the pages;
 *           read it, but edit it only if you know what you are changing.
 *   Shifts  The schedule, one row per shift. Edit freely; every board reads it.
 */

var STORE = 'Store';
var SHIFTS = 'Shifts';
var CHUNK = 45000;

function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    var role = checkPin(p.pin);
    if (p.shifts) return out({ ok: true, role: role, rows: shiftRows() });
    var since = Number(p.since || 0);
    var ver = Number(CacheService.getScriptCache().get('ver') || 0);
    if (since && ver && since >= ver) return out({ ok: true, role: role, now: since, docs: [] });
    return out({ ok: true, role: role, now: Date.now(), docs: readSince(since) });
  } catch (err) {
    return out({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  var body = {};
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (x) {}
  try {
    var role = checkPin(body.pin);
    if (body.op === 'notify') return out(notify(body));
    if (!body.path || typeof body.path !== 'string' || body.path.length > 300) throw new Error('bad path');
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var res = write(body.op, body.path, body.data);
      /* Kept for 30 seconds only: Colette's Board writes to the sheet directly, so a full re-read happens at least that often. */
      CacheService.getScriptCache().put('ver', String(res.updated), 30);
      return out({ ok: true, role: role, updated: res.updated, data: res.data });
    } finally { lock.releaseLock(); }
  } catch (err) {
    return out({ ok: false, error: String(err.message || err) });
  }
}

/* ---------- PIN ---------- */
function checkPin(pin) {
  var props = PropertiesService.getScriptProperties();
  var staff = props.getProperty('STAFF_PIN') || '';
  var mgr = props.getProperty('MANAGER_PIN') || '';
  pin = String(pin || '');
  if (mgr && pin === mgr) return 'manager';
  if (!staff) return mgr ? 'staff' : 'manager';
  if (pin === staff) return 'staff';
  throw new Error('pin');
}

/* ---------- Store ---------- */
function store() {
  var ss = SpreadsheetApp.getActive();
  var sh = ss.getSheetByName(STORE);
  if (!sh) {
    sh = ss.insertSheet(STORE);
    sh.getRange(1, 1, 1, 4).setValues([['Path', 'Updated', 'Deleted', 'Data']]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function rowJson(r) {
  var s = '';
  for (var i = 3; i < r.length; i++) s += r[i] === '' || r[i] == null ? '' : String(r[i]);
  return s;
}

function readSince(since) {
  var sh = store();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var vals = sh.getRange(2, 1, last - 1, sh.getLastColumn()).getValues();
  var docs = [];
  vals.forEach(function (r) {
    var upd = Number(r[1] || 0);
    if (!r[0] || upd <= since) return;
    var del = r[2] === true || r[2] === 'TRUE';
    var data = null;
    if (!del) { try { data = JSON.parse(rowJson(r) || '{}'); } catch (x) { data = {}; } }
    docs.push({ path: String(r[0]), updated: upd, deleted: del, data: data });
  });
  return docs;
}

function findRow(sh, path) {
  var last = sh.getLastRow();
  if (last < 2) return 0;
  var hit = sh.getRange(2, 1, last - 1, 1).createTextFinder(path).matchEntireCell(true).findNext();
  return hit ? hit.getRow() : 0;
}

function deep(a, b) {
  Object.keys(b || {}).forEach(function (k) {
    var v = b[k];
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      a[k] = deep(a[k] && typeof a[k] === 'object' && !Array.isArray(a[k]) ? a[k] : {}, v);
    } else a[k] = v;
  });
  return a;
}

function write(op, path, data) {
  var sh = store();
  var row = findRow(sh, path);
  var now = Date.now();
  var cur = {};
  if (row) {
    var r = sh.getRange(row, 1, 1, Math.max(4, sh.getLastColumn())).getValues()[0];
    var gone = r[2] === true || r[2] === 'TRUE';
    if (!gone) { try { cur = JSON.parse(rowJson(r) || '{}'); } catch (x) { cur = {}; } }
  }
  if (op === 'delete') {
    if (row) {
      var w = Math.max(4, sh.getLastColumn());
      sh.getRange(row, 2, 1, w - 1).clearContent();
      sh.getRange(row, 2, 1, 2).setValues([[now, true]]);
    }
    return { updated: now, data: null };
  }
  var next = op === 'set' ? (data || {}) : deep(cur, data || {});
  var json = JSON.stringify(next);
  var parts = [];
  for (var i = 0; i < json.length; i += CHUNK) parts.push(json.slice(i, i + CHUNK));
  if (!parts.length) parts.push('{}');
  if (!row) row = sh.getLastRow() + 1;
  var width = Math.max(sh.getLastColumn(), 3 + parts.length);
  var line = [path, now, false].concat(parts);
  while (line.length < width) line.push('');
  if (sh.getMaxColumns() < width) sh.insertColumnsAfter(sh.getMaxColumns(), width - sh.getMaxColumns());
  sh.getRange(row, 1, 1, width).setNumberFormat('@').setValues([line.map(String)]);
  sh.getRange(row, 2, 1, 2).setNumberFormat('General').setValues([[now, false]]);
  return { updated: now, data: next };
}

/* ---------- Shifts tab ---------- */
function shiftRows() {
  var sh = SpreadsheetApp.getActive().getSheetByName(SHIFTS);
  if (!sh || sh.getLastRow() < 1) return [];
  return sh.getRange(1, 1, sh.getLastRow(), sh.getLastColumn()).getDisplayValues();
}

/* ---------- Notices ---------- */
function notify(body) {
  var to = (PropertiesService.getScriptProperties().getProperty('NOTIFY_TO') || '').trim();
  if (!to) return { ok: true, sent: false };
  var subject = String(body.subject || 'Vicio notice').slice(0, 200);
  var html = String(body.html || '').slice(0, 20000);
  MailApp.sendEmail({ to: to, subject: subject, htmlBody: html });
  return { ok: true, sent: true };
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
