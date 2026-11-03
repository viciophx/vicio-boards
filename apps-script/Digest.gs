/**
 * Morning report: what was and was not ticked on the BOH and FOH boards last night, by list and by person.
 * Emails NOTIFY_TO at 9:30 AM every day (service nights are Thursday to Sunday; closed days say so in one line).
 * Run setupDigest() once from the editor to create the daily trigger; run dailyDigest() to send one now.
 *
 * The checklist items come from lists.json in the vicio-boards repo, exported from the boards themselves,
 * so a new item on a board shows up here without touching this script.
 */
var LISTS_URL = 'https://raw.githubusercontent.com/viciophx/vicio-boards/main/lists.json';
var DOUGH = {
  2: [['Evening', 'Mix Batch 1 (20 qt), into the fridge']],
  4: [['6 PM to 12 AM', 'Portion Batch 1 into pans, cover, fridge']],
  5: [['By 10 AM', 'Pull Batch 1 pans from the fridge'], ['12 to 2 PM', 'Stretch Batch 1'], ['5:30 PM', 'Turn on both pizza ovens', 'ovens'], ['6 to 8 PM', 'Bake Batch 1', 2], ['9 PM', 'Mix Batch 2 (20 qt), into the fridge', 3]],
  6: [['7 PM', 'Portion Batch 2 into pans, cover, fridge'], ['9 PM', 'Stage the dough kit']],
  0: [['By 10 AM', 'Pull Batch 2 pans from the fridge'], ['12 to 2 PM', 'Stretch Batch 2'], ['5:30 PM', 'Turn on both pizza ovens', 'ovens'], ['6 to 8 PM', 'Bake Batch 2, then shells to the freezer', 2]]
};

function setupDigest() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'dailyDigest') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('dailyDigest').timeBased().everyDays(1).atHour(9).nearMinute(30).create();
}

function dailyDigest() {
  var to = PropertiesService.getScriptProperties().getProperty('NOTIFY_TO') || '';
  if (!to) return;
  var d = new Date(); d.setDate(d.getDate() - 1);
  var day = Utilities.formatDate(d, 'America/Phoenix', 'yyyy-MM-dd');
  var dow = Number(Utilities.formatDate(d, 'America/Phoenix', 'u')) % 7;  /* 0 = Sunday */
  var nice = Utilities.formatDate(d, 'America/Phoenix', 'EEEE, MMMM d');
  if (dow >= 1 && dow <= 3) {
    MailApp.sendEmail({ to: to, subject: 'Vicio boards: ' + nice + ' (closed)', htmlBody: '<p>Vicio was closed ' + nice + '. Nothing to report from the boards.</p>' });
    return;
  }
  var r = nightReport(day, dow);
  var pct = r.total ? Math.round(100 * r.done / r.total) : 0;
  var html = '<div style="font:15px/1.5 -apple-system,Segoe UI,sans-serif;color:#18181B;max-width:680px">' +
    '<h2 style="margin:0 0 4px;color:#8B1E1E">Vicio boards: ' + nice + '</h2>' +
    '<p style="margin:0 0 14px"><b>' + r.done + ' of ' + r.total + ' items ticked (' + pct + '%).</b>' +
    (r.names.length ? ' Signed in: ' + r.names.join(', ') + '.' : ' Nobody signed in on either board.') + '</p>';
  var untouched = r.lists.filter(function (l) { return l.n && !l.done; });
  if (untouched.length) html += '<p style="margin:0 0 14px;color:#8B1E1E"><b>Untouched lists:</b> ' + untouched.map(function (l) { return l.board + ' ' + l.name; }).join(', ') + '.</p>';
  r.lists.forEach(function (l) {
    if (!l.n) return;
    var color = l.done === l.n ? '#1F6B3A' : l.done ? '#8A5A00' : '#8B1E1E';
    html += '<div style="border-top:1px solid #E4E2DF;padding:10px 0"><b>' + l.board + ' \u00b7 ' + l.name + '</b> <span style="color:' + color + ';font-weight:700;float:right">' + l.done + ' of ' + l.n + '</span>' +
      (l.who.length ? '<div style="color:#5E5E66;font-size:13px">Ticked by ' + l.who.join(', ') + '</div>' : (l.done ? '' : '<div style="color:#5E5E66;font-size:13px">Nobody ticked anything on this list</div>')) +
      (l.miss.length && l.done ? '<div style="color:#8B1E1E;font-size:13px;margin-top:4px">Missed: ' + l.miss.join(' \u00b7 ') + '</div>' : '') + '</div>';
  });
  html += '<p style="color:#5E5E66;font-size:13px;margin-top:14px">Full detail, including who did what, is on Colette\u2019s Board under Overview.</p></div>';
  MailApp.sendEmail({ to: to, subject: 'Vicio boards: ' + nice + ', ' + r.done + ' of ' + r.total + ' ticked (' + pct + '%)', htmlBody: html });
}

/* Reads the night's records from the Store tab and compares them with the boards' item lists. */
function nightReport(day, dow) {
  var lists = JSON.parse(UrlFetchApp.fetch(LISTS_URL + '?t=' + Date.now(), { muteHttpExceptions: true }).getContentText());
  var docs = {};
  readSince(0).forEach(function (x) { docs[x.path] = x.data || {}; });
  var out = { lists: [], names: [], total: 0, done: 0 }, seen = {};
  function read(board, path, name, items) {
    var doc = docs[path] || {}, dn = doc.done || {}, by = doc.by || {}, miss = [], who = {};
    items.forEach(function (it) { if (dn[it[0]]) { if (by[it[0]]) { who[by[it[0]]] = 1; seen[by[it[0]]] = 1; } } else miss.push(it[1]); });
    out.total += items.length; out.done += items.length - miss.length;
    out.lists.push({ board: board, name: name, n: items.length, done: items.length - miss.length, miss: miss, who: Object.keys(who) });
  }
  Object.keys(lists.boh).forEach(function (pre) { read('BOH', 'kit_shifts/' + day, lists.boh[pre].name, lists.boh[pre].items); });
  Object.keys(lists.foh).forEach(function (k) { var L = lists.foh[k]; read('FOH', 'foh_shifts/' + day, L.name, L.items.concat(dow === 6 ? L.satOnly : [])); });
  var jobs = DOUGH[dow] || [];
  if (jobs.length) {
    var cd = docs['kit_caldough/' + day] || {}, dnn = cd.done || {}, miss = [];
    jobs.forEach(function (j, i) { var key = j.length > 2 ? j[2] : i; if (!dnn[key]) miss.push(j[0] + ': ' + j[1]); });
    out.total += jobs.length; out.done += jobs.length - miss.length;
    out.lists.push({ board: 'BOH', name: 'Dough schedule', n: jobs.length, done: jobs.length - miss.length, miss: miss, who: [] });
  }
  var xp = docs['kit_prepextra/board'] || {}, onDay = (xp.days || {})[day] || {}, items = xp.items || {}, xi = [], xm = [], xw = {};
  Object.keys(items).forEach(function (id) { var x = items[id]; if (x && x.name && onDay[id]) { xi.push(x); if (x.done && x.done[day]) { if (x.doneBy && x.doneBy[day]) { xw[x.doneBy[day]] = 1; seen[x.doneBy[day]] = 1; } } else xm.push(x.name); } });
  if (xi.length) { out.total += xi.length; out.done += xi.length - xm.length; out.lists.push({ board: 'BOH', name: 'Extra prep', n: xi.length, done: xi.length - xm.length, miss: xm, who: Object.keys(xw) }); }
  out.names = Object.keys(seen);
  return out;
}
