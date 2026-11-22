/* Vicio FOH: the new bar count (Eric, Nov 21 2026), rebuilt from photos of the back bar. Loaded by config.js; FOH only.
   The bar count is now the top shelf, shelf 2 and the speed rail, each in the order the bottles sit (top shelf and shelf 2
   left to right; the speed rail starting with Chipotle at the top right). Bottles not on the shelves or the rail are off the
   count. Wine, bubbly and beer are unchanged. Names that match the old count keep the same item id, so last week's numbers
   and pars still line up (Verás and Amarás give the same ids as the old "Vera's" and "Amara's"). House batches on the rail are
   counted like bottles, in tenths.
   Tap to count (Eric): each liquor and wine line shows a bottle; tap where the liquid is, from .1 at the bottom to 1 at the
   top (10 points). Full backups are a + / - beside it, so the count is full backups plus the open bottle (2 backups and a
   bottle at .6 is 2.6). Tap the same point again to clear the open bottle. None left marks it 0. Beer stays a number box.
   Surfside is gone (Eric): off the bar count (the beer group is now just Beers), off the Drinks page, and out of the beer quiz.
   Layout (Eric): the par sits under each bottle's name, and the tap-the-level bottle (or the number box, for beer) is right
   next to the name. Last week and the order amount follow.
   Pars, once (Eric): every bar count line gets a par of 1, except the speed rail, which gets 2. Saved to the shared bar
   settings with a par1121 mark so it never runs twice; managers can still change any par after.
   Checks (Eric): a bottle counted higher than last week (by .2 or more), or 1.5 bottles or more lower, is flagged on its
   line and listed at the top of the bar count to recheck. One tap says a delivery came, or that the count is right, and the
   flag clears for that week (saved with the count as ok.<id>). Beer and house batches are not flagged this way.
   Batches (Eric): a house batch counted under half shows Make more, is listed at the top, and links to the drink's spec
   where there is one.
   Par is red and locked (Eric): on the iPads the par under each name is a red number with a small lock and nobody can
   change it there; managers change pars on Colette's Board, where the box stays editable.
   Managers can change pars on the iPad too (Eric): signed in as a manager, the par is a red box they can type in; everyone
   else sees the red number with the lock.
   Real del Valle (Eric): the speed rail line is spelled as on the bottle. Its old id (real_de_valle_blanco) carries over:
   last week's number and this week's count show on the new line, and its par of 2 is copied once (flag rdv1121).
   House batches are a level (Eric): 100%, 75%, 50%, 25% or Make, one tap, instead of the bottle.
   Managed from the admin page (Eric): when the shared sheet has a bar list (config/barlist, edited on Colette's Board),
   the count uses that list instead of the one built in here: its groups, order, names and renames (a renamed bottle's old
   ids are in was, so its numbers carry over). Deliveries logged on the admin page (barrecv) count toward the checks, so a
   bottle that went up by what was delivered is not flagged. Each tap also saves who counted and when.
   Double-tap to clear (Eric): two quick taps on a bottle or a batch's level buttons clear that line's entry completely, and
   the bar count says so at the top and in the column heading.
   Slide to set the level (Eric): picking a point with a tap was hard on the iPad and phone, so the open bottle now slides.
   Drag up or down on the bottle and the liquid follows your finger, or use the slider under it (0 to 1 in tenths); the
   number updates as you move and saves when you let go. A plain tap still sets that level, and a quick double tap still
   clears the line.
   Each bottle's own shape (Eric): where the shared sheet has an outline for the bottle (bottleart, loaded by bottlepics.js
   into window.__VICIO_ART), the level is drawn inside that bottle's real silhouette instead of the generic bottle, and the
   liquid rises from the bottom to the shoulder (the top 22% of the outline is the neck and cap, which a full bottle never
   reaches on the count). */
(function () {
  if (window.__vicioBarCount || window.VICIO_BOARD !== 'foh') return;
  window.__vicioBarCount = true;
  var NEW = [
    ['Top shelf', ['Jack Daniel\u2019s', 'Jameson', 'Crown Royal', 'Johnnie Walker Black', 'Campari', 'Aperol', 'Camazotz Oaxacan Rum', 'Belvedere', 'The Botanist Gin', 'G4 Blanco', 'G4 Reposado', 'Terralta Blanco', 'Tequila Ocho Plata', 'Ver\u00e1s', 'Amar\u00e1s', 'Sotol La Higuera']],
    ['Shelf 2', ['Bulleit 95 Rye', 'Bulleit Bourbon', 'Wild Turkey 101 Rye', 'Hennessy', 'Maker\u2019s Mark', 'Captain Morgan', 'Johnnie Walker Red', 'Fireball', 'Nikka', 'Uruapan Charanda Blanco', 'Tanqueray', 'Hibiki', 'Riablo Sotol Spiced Pineapple', 'Lost Lore Blanco', 'Suerte Reposado', 'Casamigos Reposado', '1800 Blanco', 'Jose Cuervo Gold', 'Jose Cuervo Silver']],
    ['Speed rail, top', ['Chipotle tequila (batch)', 'Green Tea (batch)', 'Vegas Bomb (batch)', 'Nolet\u2019s Silver', 'Evan Williams', 'Tito\u2019s', 'Rayu Joven', 'Real del Valle Blanco', 'La Vieja Taberna', 'Tequila mix (batch)']],
    ['Speed rail, bottom', ['De Kuyper Watermelon', 'De Kuyper Blue Cura\u00e7ao', 'De Kuyper Peachtree', 'Agavales Spicy Tamarindo', 'Potter\u2019s Triple Sec', 'Malibu', 'Bacardi', 'Guava Goddess (batch)', 'Mexican Candy (batch)']]];
  function apply() {
    if (typeof BARINV === 'undefined' || typeof INVITEMS === 'undefined' || typeof slug !== 'function') return false;
    if (apply.done) return true;
    var keep = BARINV.filter(function (g) { return !/^(liquor|liqueurs)$/i.test(g[0]) && !NEW.some(function (n) { return n[0] === g[0]; }); });
    keep = keep.map(function (g) { return /beer/i.test(g[0]) ? ['Beers', g[1].filter(function (n) { return !/surfside/i.test(n); })] : g; });
    BARINV.length = 0; NEW.concat(keep).forEach(function (g) { BARINV.push(g); });
    try {
      if (typeof BARMENU !== 'undefined') for (var m = BARMENU.length - 1; m >= 0; m--) if (/seltzer/i.test(BARMENU[m][0]) || /surfside/i.test(BARMENU[m][1] || '')) BARMENU.splice(m, 1);
      if (typeof QUIZZES !== 'undefined' && QUIZZES.beer) {
        QUIZZES.beer.q = QUIZZES.beer.q.filter(function (q) { return !/surfside/i.test(JSON.stringify(q)); });
        QUIZZES.beer.name = 'Beer and N/A'; QUIZZES.beer.sub = 'Beer prices and every N/A drink.';
      }
    } catch (e) {}
    INVITEMS.length = 0;
    BARINV.forEach(function (g) { g[1].forEach(function (n) { INVITEMS.push([slug(n), n, g[0]]); }); });
    apply.done = true; return true;
  }
  var BH = 132, BT = 34, BB = 124; /* bottle drawing: height, top of the body (level 1), bottom (level 0) */
  function bottleSvg(frac) {
    var fillTop = BB - (BB - BT) * frac, ticks = '';
    for (var i = 1; i <= 10; i++) { var y = BB - (BB - BT) * i / 10; ticks += '<line x1="6" x2="' + (i % 5 ? 12 : 16) + '" y1="' + y + '" y2="' + y + '" stroke="currentColor" stroke-width="1" opacity=".55"/>'; }
    return '<svg class="x-btl" viewBox="0 0 56 ' + BH + '" width="56" height="' + BH + '" aria-hidden="true">' +
      '<defs><clipPath id="bclip"><path d="M22 4h12v16c0 6 10 8 10 18v84a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V38c0-10 10-12 10-18z"/></clipPath></defs>' +
      (frac > 0 ? '<rect x="0" y="' + fillTop + '" width="56" height="' + (BH - fillTop) + '" fill="#D9A441" clip-path="url(#bclip)"/>' : '') +
      '<path d="M22 4h12v16c0 6 10 8 10 18v84a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V38c0-10 10-12 10-18z" fill="none" stroke="currentColor" stroke-width="1.6"/>' + ticks +
      '<text x="50" y="' + (BB - (BB - BT) * 0.5 + 3) + '" font-size="8" fill="currentColor" opacity=".7" text-anchor="end">.5</text><text x="50" y="' + (BT + 3) + '" font-size="8" fill="currentColor" opacity=".7" text-anchor="end">1</text></svg>';
  }
  var NECK = 0.22;
  function art(id) { return (window.__VICIO_ART || {})[id] || {}; }
  function shape(id, frac) {
    var o = art(id).out; if (!o) return bottleSvg(frac);
    return '<div class="x-shp"><img class="x-shpo" src="' + o + '" alt=""><div class="x-shpl" style="-webkit-mask-image:url(' + o + ');mask-image:url(' + o + ')"><div class="x-shpf" style="height:' + (frac * (1 - NECK) * 100).toFixed(1) + '%"></div></div></div>';
  }
  function split(v) {
    if (v == null || v === '' || isNaN(+v)) return { full: 0, frac: 0, none: true };
    v = Math.round(+v * 10) / 10; var full = Math.floor(v + 1e-9), frac = Math.round((v - full) * 10) / 10;
    if (frac === 0 && full > 0) { full -= 1; frac = 1; }
    return { full: full, frac: frac, none: false };
  }
  function tapCount() {
    var sec = document.querySelector('[data-fold="sec_bar"]'); if (!sec) return;
    var c = (S.inv && S.inv.c) || {};
    Array.prototype.forEach.call(sec.querySelectorAll('input[data-inv]'), function (inp) {
      var grp = inp.closest('[data-fold^="inv_"]'); if (grp && /beer/i.test(grp.dataset.fold)) return;
      var id = inp.dataset.inv, sp = split(c[id]), cell = inp.closest('td'); if (!cell) return;
      var total = sp.none ? '\u2013' : (sp.full + sp.frac).toFixed(1).replace(/\.0$/, '');
      cell.innerHTML = '<div class="x-tc"><div class="x-tcb' + (art(id).out ? ' x-tcbs' : '') + '" data-tcid="' + id + '" role="slider" aria-label="Open bottle level" aria-valuemin="0" aria-valuemax="1" aria-valuenow="' + sp.frac + '">' + shape(id, sp.frac) + '</div>' +
        '<input type="range" class="x-tcr" min="0" max="10" step="1" value="' + Math.round(sp.frac * 10) + '" data-tcr="' + id + '" aria-label="Open bottle level, tenths">' +
        '<div class="x-tcs"><b class="x-tcv">' + total + '</b><span class="x-tcl">Full backups</span><span class="x-tcf"><button type="button" class="btn" data-tcfull="-1" data-tcid2="' + id + '" aria-label="One fewer full bottle">\u2212</button><b>' + sp.full + '</b><button type="button" class="btn" data-tcfull="1" data-tcid2="' + id + '" aria-label="One more full bottle">+</button></span><button type="button" class="btn x-tc0' + (c[id] === 0 ? ' on' : '') + '" data-tczero="' + id + '">None left</button></div></div>';
      var th = cell.closest('table') && cell.closest('table').querySelector('thead th:last-child'); if (th && /^Count/.test(th.textContent)) th.textContent = 'Tap the level';
    });
  }
  var IN_COLETTE = false; try { IN_COLETTE = !!(window.parent && window.parent !== window); } catch (e) { IN_COLETTE = true; }
  var ALIAS = { real_del_valle_blanco: ['real_de_valle_blanco'] }, RECV = {};
  function aliasRdv() {
    Object.keys(ALIAS).forEach(function (nw) { (ALIAS[nw] || []).forEach(function (old) {
      [S.prevInv, S.inv].forEach(function (o) { if (o && o.c && o.c[old] != null && o.c[nw] == null) o.c[nw] = o.c[old]; });
      var par = (S.barcfg || {}).par; if (par && par[old] != null && par[nw] == null) par[nw] = par[old];
    }); });
    var cfg = S.barcfg || {}, par = cfg.par || {}, NEW_RDV = 'real_del_valle_blanco';
    if (!cfg.rdv1121 && !aliasRdv.saved && cfg.par1121 && typeof save === 'function') {
      aliasRdv.saved = true; var at = Date.now(), p = {}; p[NEW_RDV] = par[NEW_RDV] != null ? par[NEW_RDV] : 2;
      S.barcfg = Object.assign({}, cfg, { par: Object.assign({}, par, p), rdv1121: at }); save('config/bar', { par: p, rdv1121: at });
    }
  }
  function applyDb(groups) {
    try {
      BARINV.length = 0; INVITEMS.length = 0; var al = {};
      groups.forEach(function (g) {
        var names = (g.items || []).map(function (i) { return i.name; }).filter(Boolean);
        BARINV.push([g.name, names]);
        (g.items || []).forEach(function (i) { if (!i.name) return; var id = slug(i.name); INVITEMS.push([id, i.name, g.name]); if (i.was && i.was.length) al[id] = i.was.slice(); });
      });
      ALIAS = al;
    } catch (e) {}
  }
  function recvFor(id) {
    var wk = ui.week, d = new Date(wk + 'T12:00:00'); d.setDate(d.getDate() + 6);
    var end = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'), n = 0;
    Object.keys(RECV || {}).forEach(function (k) { var r = RECV[k]; if (r && r.date >= wk && r.date <= end && r.lines && r.lines[id] != null) n += +r.lines[id] || 0; });
    return n;
  }
  var LV = [[1, '100%'], [0.75, '75%'], [0.5, '50%'], [0.25, '25%'], [0, 'Make']];
  function lvIcon(v) {
    if (v === 0) return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
    var h = 16 * v; return '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="6" y="3.5" width="12" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="7.6" y="' + (20 - h).toFixed(1) + '" width="8.8" height="' + h.toFixed(1) + '" rx="1" fill="currentColor"/></svg>';
  }
  function batchLevels() {
    var sec = document.querySelector('[data-fold="sec_bar"]'); if (!sec) return;
    var c = (S.inv && S.inv.c) || {};
    INVITEMS.forEach(function (it) {
      if (!/\(batch\)/i.test(it[1])) return;
      var b = sec.querySelector('[data-tcid="' + it[0] + '"]'); if (!b) return;
      var cell = b.closest('td'), v = c[it[0]];
      cell.innerHTML = '<div class="x-blv" role="group" aria-label="Batch level">' + LV.map(function (l) {
        return '<button type="button" class="x-blb' + (l[0] === 0 ? ' make' : '') + (v != null && v !== '' && +v === l[0] ? ' on' : '') + '" data-blv="' + l[0] + '" data-blid="' + it[0] + '" aria-label="' + l[1] + '">' + lvIcon(l[0]) + '<small>' + l[1] + '</small></button>';
      }).join('') + '</div>';
      var row = cell.closest('tr'), lc = row && row.cells[1]; if (lc && /^[\d.]+$/.test(lc.textContent.trim())) { var pv = +lc.textContent.trim(), x = LV.filter(function (l) { return l[0] === pv; })[0]; if (x) lc.textContent = x[1]; }
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-blid]'); if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var id = b.dataset.blid; if (dbl(id)) { setVal(id, null); return; }
    var v = +b.dataset.blv, cur = (S.inv && S.inv.c || {})[id];
    setVal(id, cur != null && +cur === v ? null : v);
  }, true);
  function relayout() {
    var sec = document.querySelector('[data-fold="sec_bar"]'); if (!sec) return;
    Array.prototype.forEach.call(sec.querySelectorAll('[data-fold^="inv_"] table'), function (t) {
      if (t.dataset.rl) return; t.dataset.rl = '1';
      var hr = t.tHead && t.tHead.rows[0];
      if (hr && hr.cells.length === 5) { var h = hr.cells; hr.insertBefore(h[4], h[1]); h[3].remove(); h[1].innerHTML = /beer/i.test((t.closest('[data-fold^="inv_"]') || {}).dataset.fold || '') ? 'Count' : 'Slide the level <span class="x-dbl">\u00b7 double-tap to clear</span>'; }
      Array.prototype.forEach.call(t.tBodies[0] ? t.tBodies[0].rows : [], function (r) {
        if (r.cells.length !== 5) return;
        var c = r.cells, name = c[0], last = c[1], par = c[2], need = c[3], cnt = c[4];
        var pw = document.createElement('div'); pw.className = 'x-par'; pw.innerHTML = '<span>Par</span>';
        while (par.firstChild) pw.appendChild(par.firstChild);
        var inp = pw.querySelector('input');
        var isMgr = false; try { isMgr = typeof MGR !== 'undefined' && !!MGR; } catch (e) {}
        if (inp && !IN_COLETTE && !isMgr) { var tx = document.createElement('b'); tx.textContent = inp.value === '' ? '\u2013' : inp.value; inp.replaceWith(tx); }
        pw.insertAdjacentHTML('beforeend', (IN_COLETTE || isMgr) && inp ? '' : '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>');
        name.appendChild(pw); par.remove();
        r.insertBefore(cnt, last); cnt.classList.add('x-cnt');
      });
    });
  }
  var SPEC = { 'Guava Goddess (batch)': 'Guava Goddess', 'Mexican Candy (batch)': 'Mexican Candy', 'Green Tea (batch)': 'Green Tea', 'Vegas Bomb (batch)': 'Vegas Bomb' };
  function fmtN(v) { return (+v).toFixed(1).replace(/\.0$/, ''); }
  function checks() {
    var sec = document.querySelector('[data-fold="sec_bar"]'); if (!sec || sec.dataset.chk) return; sec.dataset.chk = '1';
    var c = (S.inv && S.inv.c) || {}, pv = (S.prevInv && S.prevInv.c) || {}, ok = (S.inv && S.inv.ok) || {}, re = [], mk = [];
    INVITEMS.forEach(function (it) {
      var id = it[0], name = it[1], grp = it[2] || ''; if (/beer/i.test(grp)) return;
      var v = c[id], row = sec.querySelector('[data-tcid="' + id + '"],[data-blid="' + id + '"]'); row = row && row.closest('tr');
      if (v == null || v === '' || isNaN(+v)) return; v = +v;
      var cell = row && row.cells[0], html = '';
      if (/\(batch\)/i.test(name)) {
        if (v < 0.5) { mk.push(name.replace(/\s*\(batch\)/i, '')); html = '<span class="pill warn">Make more</span>' + (SPEC[name] ? ' <button type="button" class="btn x-fbtn" data-bspec="' + SPEC[name] + '">Spec</button>' : ' <span class="x-fnote">No batch recipe written yet</span>'); }
      } else if (pv[id] != null && !isNaN(+pv[id]) && !ok[id]) {
        var p = +pv[id] + recvFor(id);
        if (v - p >= 0.2 - 1e-9) { re.push(name); html = '<span class="pill warn">Up from ' + fmtN(p) + '</span> <button type="button" class="btn x-fbtn" data-fok="' + id + '">Delivery came</button>'; }
        else if (p - v >= 1.5 - 1e-9) { re.push(name); html = '<span class="pill warn">Down from ' + fmtN(p) + '</span> <button type="button" class="btn x-fbtn" data-fok="' + id + '">Count is right</button>'; }
      }
      if (html && cell) cell.insertAdjacentHTML('beforeend', '<div class="x-flag">' + html + '</div>');
    });
    var top = '<p class="x-dblnote">Tip: slide your finger up or down the bottle, or use the slider under it. Double-tap a bottle to clear its entry.</p>';
    if (re.length) top += '<p class="x-need"><span class="pill warn">Recheck ' + re.length + '</span> ' + re.map(function (n) { return String(n).replace(/</g, '&lt;'); }).join(', ') + '</p>';
    if (mk.length) top += '<p class="x-need"><span class="pill warn">Batches to make</span> ' + mk.join(', ') + '</p>';
    var st = sec.querySelector(':scope > p.status') || sec.querySelector('p.status');
    if (top && st) st.insertAdjacentHTML('afterend', top);
  }
  document.addEventListener('click', function (e) {
    var f = e.target.closest && e.target.closest('[data-fok]');
    if (f) {
      e.preventDefault(); e.stopPropagation();
      var id = f.dataset.fok, o = {}; o[id] = true;
      S.inv = Object.assign({}, S.inv, { ok: Object.assign({}, (S.inv || {}).ok, o) });
      save('barinv/' + ui.week, { ok: o }); render(); return;
    }
    var b = e.target.closest && e.target.closest('[data-bspec]');
    if (b) {
      e.preventDefault(); e.stopPropagation();
      var nm = b.dataset.bspec; ui.barView = true; ui.fold = ui.fold || {};
      ['Cocktails', 'Margaritas', 'Shots', 'Mocktails'].forEach(function (g) { ui.fold['pg:Drinks:' + g] = true; });
      ui.tab = 'drinks'; render();
      setTimeout(function () {
        var hit = Array.prototype.filter.call(document.querySelectorAll('[data-act="dsel"]'), function (x) { return (x.textContent || '').trim().indexOf(nm) === 0; })[0];
        if (hit) { hit.click(); setTimeout(function () { window.scrollTo(0, 0); }, 50); }
      }, 40);
    }
  }, true);
  function setPars() {
    if (setPars.done) return;
    var d0 = (typeof db !== 'undefined') ? db : null;
    function go(d) {
      if (setPars.done) return; setPars.done = true;
      if (d && d.par1121) return;
      var p = {}, at = Date.now();
      INVITEMS.forEach(function (i) { p[i[0]] = /speed rail/i.test(i[2] || '') ? 2 : 1; });
      S.barcfg = Object.assign({}, S.barcfg, { par: Object.assign({}, (S.barcfg || {}).par, p), par1121: at });
      save('config/bar', { par: p, par1121: at }); render();
    }
    if (d0 && d0.doc) {
      setPars.waiting = true;
      var un = d0.doc('config/bar').onSnapshot(function (s) { setTimeout(function () { try { un && un(); } catch (e) {} }, 0); go(s && s.exists ? s.data() : {}); }, function () {});
    } else if (S.barcfg && Object.keys(S.barcfg).length) go(S.barcfg);
  }
  var LAST = {};
  function dbl(id) { var t = Date.now(), hit = LAST[id] && t - LAST[id] < 400; LAST[id] = hit ? 0 : t; return hit; }
  function setVal(id, v) {
    if (v != null) v = Math.round(v * 100) / 100;
    S.inv = Object.assign({}, S.inv, { c: Object.assign({}, (S.inv || {}).c, (function () { var o = {}; o[id] = v; return o; })()) });
    var patch = { c: {}, at: Date.now() }; patch.c[id] = v; try { var wn = typeof whoName === 'function' ? whoName() : ''; if (wn) patch.who = wn; } catch (e) {}
    save('barinv/' + ui.week, patch); render();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-tcid]');
    if (b) { e.preventDefault(); e.stopPropagation(); return; }
    var f = e.target.closest && e.target.closest('[data-tcfull]');
    if (f) {
      e.preventDefault(); e.stopPropagation();
      var id2 = f.dataset.tcid2, s2 = split((S.inv && S.inv.c || {})[id2]), full = Math.max(0, s2.full + (+f.dataset.tcfull));
      setVal(id2, s2.none && full === 0 ? null : full + (s2.none ? 0 : s2.frac));
      return;
    }
    var z = e.target.closest && e.target.closest('[data-tczero]');
    if (z) {
      e.preventDefault(); e.stopPropagation();
      var cur = (S.inv && S.inv.c || {})[z.dataset.tczero]; setVal(z.dataset.tczero, cur === 0 ? null : 0);
    }
  }, true);
  function lvlAt(b, clientY) {
    var sh = b.querySelector('.x-shp');
    if (sh) { var q = sh.getBoundingClientRect(); return Math.max(1, Math.min(10, Math.ceil((q.bottom - clientY) / (q.height * (1 - NECK)) * 10 - 0.0001))) / 10; }
    var svg = b.querySelector('svg'), r = svg.getBoundingClientRect(), y = (clientY - r.top) * BH / r.height;
    return Math.max(1, Math.min(10, Math.ceil((BB - y) / (BB - BT) * 10 - 0.0001))) / 10;
  }
  function preview(id, frac) {
    var b = document.querySelector('[data-tcid="' + id + '"]'); if (!b) return;
    var sp = split((S.inv && S.inv.c || {})[id]), wrap = b.closest('.x-tc');
    var f = b.querySelector('.x-shpf'); if (f) f.style.height = (frac * (1 - NECK) * 100).toFixed(1) + '%'; else b.innerHTML = bottleSvg(frac);
    var v = wrap && wrap.querySelector('.x-tcv'); if (v) v.textContent = (sp.full + frac).toFixed(1).replace(/\.0$/, '');
    var r = wrap && wrap.querySelector('.x-tcr'); if (r && +r.value !== Math.round(frac * 10)) r.value = Math.round(frac * 10);
  }
  var DRAG = null;
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('[data-tcid]'); if (!b) return;
    e.preventDefault();
    DRAG = { id: b.dataset.tcid, b: b, y0: e.clientY, moved: false, lvl: lvlAt(b, e.clientY) };
    try { b.setPointerCapture(e.pointerId); } catch (x) {}
  }, true);
  document.addEventListener('pointermove', function (e) {
    if (!DRAG) return;
    if (Math.abs(e.clientY - DRAG.y0) > 6) DRAG.moved = true;
    if (!DRAG.moved) return;
    if (!DRAG.b.isConnected) { var nb = document.querySelector('[data-tcid="' + DRAG.id + '"]'); if (nb) DRAG.b = nb; }
    e.preventDefault(); DRAG.lvl = lvlAt(DRAG.b, e.clientY); preview(DRAG.id, DRAG.lvl);
  }, true);
  function endDrag(e) {
    if (!DRAG) return; var d = DRAG; DRAG = null;
    var sp = split((S.inv && S.inv.c || {})[d.id]);
    if (d.moved) { LAST[d.id] = 0; setVal(d.id, sp.full + d.lvl); return; }
    if (dbl(d.id)) { setVal(d.id, null); return; }
    if (!sp.none && Math.abs(sp.frac - d.lvl) < 0.01) setVal(d.id, sp.full ? sp.full : null); else setVal(d.id, sp.full + d.lvl);
  }
  document.addEventListener('pointerup', endDrag, true);
  document.addEventListener('pointercancel', function () { if (DRAG) { var id = DRAG.id; DRAG = null; render(); } }, true);
  document.addEventListener('input', function (e) {
    var r = e.target; if (!r || !r.dataset || !r.dataset.tcr) return; preview(r.dataset.tcr, (+r.value) / 10);
  }, true);
  document.addEventListener('change', function (e) {
    var r = e.target; if (!r || !r.dataset || !r.dataset.tcr) return;
    var id = r.dataset.tcr, sp = split((S.inv && S.inv.c || {})[id]), f = (+r.value) / 10;
    setVal(id, sp.full + f === 0 && sp.none ? 0 : sp.full + f);
  }, true);
  (function () { var st = document.createElement('style'); st.textContent =
    '.x-tc{display:flex;align-items:center;gap:10px;justify-content:flex-end}.x-tcb{cursor:ns-resize;color:var(--ink,#EDEDF0);touch-action:none;user-select:none;-webkit-user-select:none;border-radius:10px;padding:2px 4px;background:var(--bg,#000);border:1px solid var(--line,#2E2E34)}' +
    '.x-tcb.x-tcbs{border:0;background:none;padding:0}.x-shp{position:relative;height:132px;display:inline-block}.x-shpo{display:block;height:132px;width:auto}.x-shpl{position:absolute;inset:0;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;pointer-events:none}.x-shpf{position:absolute;left:0;right:0;bottom:0;background:#D9A441;opacity:.92}' +
    '.x-tc{flex-wrap:wrap}.x-tcr{order:3;flex:1 0 100%;width:100%;max-width:240px;height:40px;margin:2px 0 0;accent-color:#D9A441;touch-action:pan-y;-webkit-appearance:none;appearance:none;background:transparent}' +
    '.x-tcr::-webkit-slider-runnable-track{height:8px;border-radius:4px;background:var(--line,#3A3A40)}.x-tcr::-webkit-slider-thumb{-webkit-appearance:none;width:30px;height:30px;margin-top:-11px;border-radius:50%;background:#D9A441;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5)}' +
    '.x-tcr::-moz-range-track{height:8px;border-radius:4px;background:var(--line,#3A3A40)}.x-tcr::-moz-range-thumb{width:26px;height:26px;border-radius:50%;background:#D9A441;border:3px solid #fff}' +
    '.x-tcs{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:92px}.x-tcv{font:700 24px/1 system-ui,-apple-system,sans-serif}.x-tcl{font:600 10px system-ui,-apple-system,sans-serif;color:var(--muted,#A1A1AA);text-transform:uppercase;letter-spacing:.04em}' +
    '.x-tcf{display:flex;align-items:center;gap:6px}.x-tcf .btn{min-width:36px;min-height:36px;padding:0;font-size:18px}.x-tcf b{min-width:16px;text-align:center}.x-tc0{min-height:30px;padding:2px 8px;font-size:12px}.x-tc0.on{background:var(--cherry,#8B1E1E);border-color:var(--cherry,#8B1E1E);color:#fff}' +
    '.x-par{display:flex;align-items:center;gap:6px;margin-top:6px;font:600 11px system-ui,-apple-system,sans-serif;color:var(--muted,#A1A1AA);text-transform:uppercase;letter-spacing:.04em}.x-par input{width:64px;min-height:34px;color:var(--cherry,#E5484D)}.x-par,.x-par b{color:var(--cherry,#E5484D)}.x-par b{font-size:16px}.x-par svg{flex:none}' +
    '[data-fold="sec_bar"] td.x-cnt{text-align:left}[data-fold="sec_bar"] .x-tc{justify-content:flex-start}.x-flag{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:6px}.x-fbtn{min-height:30px;padding:2px 10px;font-size:12px}.x-fnote{font-size:12px;color:var(--muted,#A1A1AA)}.x-need{margin:4px 0 8px;font-weight:600}.x-dblnote{margin:4px 0 8px;font-size:13px;color:var(--muted,#A1A1AA)}.x-dbl{font-weight:500;text-transform:none;letter-spacing:0;opacity:.8}.x-blv{display:flex;flex-wrap:wrap;gap:5px}.x-blb{display:inline-flex;flex-direction:column;align-items:center;gap:1px;min-height:48px;min-width:50px;padding:4px 6px;border-radius:9px;border:1px solid var(--line,#2E2E34);background:var(--bg,#000);color:var(--ink,#EDEDF0);cursor:pointer}.x-blb small{font:600 10px/1 system-ui,-apple-system,sans-serif}.x-blb.on{background:var(--good,#1F7A4D);border-color:var(--good,#1F7A4D);color:#fff}.x-blb.make{color:var(--cherry,#E5484D)}.x-blb.make.on{background:var(--cherry,#8B1E1E);border-color:var(--cherry,#8B1E1E);color:#fff}'; document.head.appendChild(st); })();

  (function start() {
    if (!apply() || typeof render !== 'function') return setTimeout(start, 200);
    setTimeout(function () { try { setPars(); } catch (e) {} }, 4000);
    try { if (typeof watchDoc === 'function') watchDoc('config/barlist', function (d) { if (d && Array.isArray(d.groups) && d.groups.length) { applyDb(d.groups); render(); } }); } catch (e) {}
    try { if (typeof watchCol === 'function') watchCol('barrecv', function (o) { RECV = o || {}; render(); }); } catch (e) {}
    var r0 = render; render = function () { try { aliasRdv(); } catch (e) {} var out = r0.apply(this, arguments); try { tapCount(); } catch (e) {} try { batchLevels(); } catch (e) {} try { relayout(); } catch (e) {} try { checks(); } catch (e) {} return out; };
    render();
  })();
})();
