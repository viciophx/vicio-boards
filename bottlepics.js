/* Vicio FOH: a photo of each bottle beside the tap-the-level bottle on the bar count (Eric, Nov 22 2026). Loaded by config.js;
   FOH only. The photos are cut from Eric's shelf photos (black and white, because the back bar is lit red). They live in the
   shared sheet (bottlepics/<line id> = { src }), put there by Colette's Board, so this file stays small; inside Colette's
   Board they come built in. Tapping a photo opens the bottle's profile, and the photo shows at the top of the profile too.
   Bottles without a photo yet: Nolet's, Evan Williams, Tito's, the three De Kuyper liqueurs, Potter's Triple Sec, Malibu and
   Bacardi, plus wine, beer and the house batches. */
(function () {
  if (window.__vicioBottlePics || window.VICIO_BOARD !== 'foh') return;
  window.__vicioBottlePics = true;
  var PICS = {};
  if (window.__VICIO_PICS) Object.keys(window.__VICIO_PICS).forEach(function (k) { PICS[k] = window.__VICIO_PICS[k]; });
  function pics() {
    var sec = document.querySelector('[data-fold="sec_bar"]'); if (!sec) return;
    Array.prototype.forEach.call(sec.querySelectorAll('.x-tcb[data-tcid]'), function (b) {
      var id = b.dataset.tcid, wrap = b.parentNode; if (!PICS[id] || !wrap || wrap.querySelector('.x-bpic')) return;
      var img = document.createElement('img'); img.className = 'x-bpic'; img.src = PICS[id]; img.alt = ''; img.dataset.binfo = id;
      img.title = 'About this bottle'; wrap.insertBefore(img, b);
    });
  }
  document.addEventListener('click', function (e) {
    var n = e.target.closest && e.target.closest('[data-binfo]'); if (!n) return;
    var id = n.dataset.binfo; if (!PICS[id]) return;
    setTimeout(function () {
      var h = document.querySelector('#x-bpop h3'); if (!h || h.parentNode.querySelector('.x-bp-pic')) return;
      if (n.tagName === 'IMG') { var nm = document.querySelector('[data-binfo="' + id + '"].x-bname'); if (nm) h.textContent = nm.textContent.trim(); }
      h.insertAdjacentHTML('beforebegin', '<img class="x-bp-pic" src="' + PICS[id] + '" alt="">');
    }, 0);
  }, true);
  var st = document.createElement('style');
  st.textContent = '.x-bpic{height:112px;width:76px;object-fit:contain;border-radius:8px;cursor:pointer;flex:none;background:#000}' +
    '.x-bp-pic{float:right;height:140px;width:auto;max-width:110px;object-fit:contain;margin:28px 0 8px 12px;border-radius:10px;background:#000}';
  document.head.appendChild(st);
  (function start() {
    if (typeof render !== 'function' || typeof ui === 'undefined' || !document.getElementById('view')) return setTimeout(start, 200);
    try { if (typeof watchCol === 'function') watchCol('bottlepics', function (o) { var n = 0; Object.keys(o || {}).forEach(function (k) { var s = o[k] && o[k].src; if (s && /^data:image\//.test(s) && PICS[k] !== s) { PICS[k] = s; n++; } }); if (n) render(); }); } catch (e) {}
    var r0 = render; render = function () { var out = r0.apply(this, arguments); setTimeout(function () { try { pics(); } catch (e) {} }, 0); return out; };
    setTimeout(function () { try { pics(); } catch (e) {} }, 0);
  })();
})();
