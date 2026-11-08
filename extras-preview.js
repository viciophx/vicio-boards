/* PREVIEW add-on (Eric, Nov 8 2026). Loaded only when a board link ends in ?preview (see sheetdb.js).
   It loads the live extras.js first, then layers the changes under review on top. Nothing here reaches the live boards
   until the changes are published into extras.js. */
(function () {
  var s = document.createElement('script'); s.src = 'extras.js?v=' + Date.now(); (document.head || document.documentElement).appendChild(s);
  if (window.VICIO_BOARD !== 'foh') return;
  var ft = function (a, b) { return (typeof ui !== 'undefined' && ui.lang === 'es') ? b : a; };
  var e = function (v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* 1. Every FOH page starts with just its title: no eyebrow label, no paragraph. */
  /* 2. Today, row 1: Checklists / Service with Opening, Mid shift and Closing at the right.
     3. Today, row 2: TONIGHT, the short date with Back / Next, and the ice machine ON / OFF switch at the end. */
  function tight() {
    if (ui.tab !== 'today' || ui.mode === 'service') return;
    var hd = document.getElementById('head'); if (!hd || hd.querySelector('.x-titlerow')) return;
    var sb = document.querySelector('#view .shiftbar'), sw = hd.querySelector('.modesw'), bar = document.querySelector('#view > .bar'), h1 = hd.querySelector('h1');
    if (sb && sw) { sb.classList.add('x-top'); hd.classList.add('x-tight'); sw.appendChild(sb); }
    if (!(bar && h1)) return;
    var tr = document.createElement('div'); tr.className = 'x-titlerow'; h1.parentNode.insertBefore(tr, h1); tr.appendChild(h1); bar.classList.add('x-hbar'); tr.appendChild(bar);
    var dt = bar.querySelector('.date'); if (dt && dt.firstChild && dt.firstChild.nodeType === 3 && typeof fmt === 'function') dt.firstChild.textContent = fmt(ui.date, { weekday: 'short', month: 'short', day: 'numeric' }) + ' ';
    var iceSec = document.querySelector('#view .x-ice');
    var x = (S.ice && typeof S.ice.on === 'boolean') ? S.ice : null, on = x && x.on;
    var when = x ? new Date(x.at).toLocaleTimeString(ui.lang === 'es' ? 'es-MX' : 'en-US', { hour: 'numeric', minute: '2-digit' }) : '';
    var chip = document.createElement('div'); chip.className = 'x-icechip ' + (x ? (on ? 'on' : 'off') : '');
    chip.innerHTML = '<span class="x-icel"><span class="x-icelong">' + ft('Ice machine', 'M\u00e1quina de hielo') + '</span><span class="x-iceshort">' + ft('Ice', 'Hielo') + '</span></span>' +
      '<button type="button" class="x-icebtn' + (on ? ' cur' : '') + '" data-ice="on" aria-pressed="' + !!on + '">' + ft('ON', 'PRENDIDA') + '</button>' +
      '<button type="button" class="x-icebtn' + (x && !on ? ' cur' : '') + '" data-ice="off" aria-pressed="' + !!(x && !on) + '">' + ft('OFF', 'APAGADA') + '</button>' +
      (x ? '<small>' + e(String(x.by || '?').split(' ')[0]) + ' \u00b7 ' + e(when) + '</small>' : '');
    tr.appendChild(chip); if (iceSec) iceSec.remove();
  }
  var CSS = '#head .lede,#head .eyebrow{display:none}#head h1{margin-bottom:10px}#head .modesw{margin-bottom:8px}' +
    '#head.x-tight .modesw{margin-bottom:6px;align-items:flex-start}#head.x-tight .modesw>.status{align-self:center}@media (max-width:1200px){#head.x-tight .modesw>.status{display:none}}.x-titlerow .x-hbar>.count{display:none}' +
    '.modesw .shiftbar.x-top{margin-left:auto;flex:1 1 330px;max-width:620px;gap:12px}.shiftbar.x-top .segbar{height:14px}.shiftbar.x-top .seghead{flex-wrap:wrap;gap:0 8px}.shiftbar.x-top .seghead b,.shiftbar.x-top .seghead span{white-space:nowrap}.shiftbar.x-top .segleft{font-size:12px;line-height:1.3;margin:0}' +
    '.x-iceshort{display:none}@media (max-width:1240px){.x-icelong{display:none}.x-iceshort{display:inline}}' +
    '.x-titlerow{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;margin:0 0 14px}.x-titlerow h1{margin:0;line-height:1}.x-titlerow .x-hbar{flex:0 1 auto;margin:0}' +
    '.x-icechip{margin-left:auto;display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding:4px 6px 4px 12px;border:1px solid var(--line,#2E2E34);border-radius:999px}.x-icechip .x-icel{font:700 12px var(--f-mono,monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}' +
    '.x-icechip small{color:var(--muted);font-size:12px;margin:0 6px 0 2px;white-space:nowrap}.x-icebtn{appearance:none;min-height:36px;min-width:52px;padding:4px 12px;border-radius:999px;border:1px solid var(--line,#2E2E34);background:transparent;color:var(--ink);font:700 13px var(--f-body,system-ui);cursor:pointer}' +
    '.x-icechip.on .x-icebtn.cur{background:var(--good,#4CC38A);border-color:var(--good,#4CC38A);color:#06210f}.x-icechip.off .x-icebtn.cur{background:var(--cherry,#C4161C);border-color:var(--cherry,#C4161C);color:#fff}';
  (function hook() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || typeof S === 'undefined' || !document.head) return setTimeout(hook, 150);
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var r1 = render; render = function () { r1.apply(this, arguments); try { tight(); } catch (err) {} };
    render();
  })();
})();
