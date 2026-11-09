/* Events near downtown, filled in automatically (Eric, Nov 9 2026).
   Every morning this pulls the next 14 days of events within 2 miles of Vicio (Footprint Center, Chase Field, the
   Convention Center, Arizona Financial Theatre, Orpheum, Symphony Hall and the rest) from Ticketmaster and writes them
   to the shared events list the FOH board shows. Nobody adds or finds events by hand.

   One-time setup:
   1. Get a free key at developer.ticketmaster.com (My Apps, Consumer Key).
   2. Project Settings, Script properties: add TM_KEY with that key.
   3. Run syncEvents once and allow access, then run installEventsTrigger once (daily at 5 AM). */

var EV_LAT = 33.4484, EV_LNG = -112.0740, EV_MILES = 2, EV_DAYS = 14;
var EV_BIG = /footprint|chase field|convention center|arizona financial|symphony hall|orpheum|state farm/i;

function syncEvents() {
  var key = PropertiesService.getScriptProperties().getProperty('TM_KEY');
  if (!key) throw new Error('Add TM_KEY (Ticketmaster key) under Project Settings, Script properties.');
  var tz = 'America/Phoenix', now = new Date(), end = new Date(now.getTime() + EV_DAYS * 864e5);
  var iso = function (d) { return Utilities.formatDate(d, 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'"); };
  var found = {}, page = 0, pages = 1;
  while (page < pages && page < 5) {
    var url = 'https://app.ticketmaster.com/discovery/v2/events.json?apikey=' + encodeURIComponent(key) +
      '&latlong=' + EV_LAT + ',' + EV_LNG + '&radius=' + EV_MILES + '&unit=miles&size=100&sort=date,asc' +
      '&startDateTime=' + iso(now) + '&endDateTime=' + iso(end) + '&page=' + page;
    var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) throw new Error('Ticketmaster said ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 200));
    var j = JSON.parse(res.getContentText());
    pages = (j.page && j.page.totalPages) || 1;
    ((j._embedded && j._embedded.events) || []).forEach(function (ev) {
      var st = ev.dates && ev.dates.start || {}; if (!st.localDate) return;
      var venue = ev._embedded && ev._embedded.venues && ev._embedded.venues[0] ? ev._embedded.venues[0].name : '';
      var time = '';
      if (st.localTime) { var hm = st.localTime.split(':'), h = +hm[0], m = +hm[1]; time = ((h + 11) % 12 + 1) + (m ? ':' + ('0' + m).slice(-2) : '') + (h < 12 ? ' AM' : ' PM'); }
      var seg = ev.classifications && ev.classifications[0] && ev.classifications[0].segment ? ev.classifications[0].segment.name : '';
      /* One entry per show: the same event can be listed more than once (VIP, parking). Keep the plain one. */
      if (/parking|vip|package|upgrade/i.test(ev.name)) return;
      var id = 'tm_' + st.localDate + '_' + String(ev.name + venue).toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 40);
      if (found[id]) return;
      found[id] = { date: st.localDate, time: time, title: ev.name, venue: venue, kind: seg, impact: EV_BIG.test(venue) ? 'Big crowd' : '', src: 'Ticketmaster', auto: true };
    });
    page++;
  }
  /* Write what came back, and clear automatic events that are past or were dropped. Hand-entered events stay. */
  var sh = store(), rows = sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues() : [], today = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  Object.keys(found).forEach(function (id) { write('set', 'events/' + id, found[id]); });
  rows.forEach(function (r) {
    var p = String(r[0] || ''), gone = r[2] === true || r[2] === 'TRUE';
    if (gone || p.indexOf('events/tm_') !== 0) return;
    var id = p.slice(7), d = id.slice(3, 13);
    if (d < today || !found[id]) write('delete', p, null);
  });
  CacheService.getScriptCache().remove('ver');
  return Object.keys(found).length + ' events';
}

function installEventsTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'syncEvents') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('syncEvents').timeBased().everyDays(1).atHour(5).inTimezone('America/Phoenix').create();
}
