/* Vicio kitchen board: pars are locked (Eric, Nov 21 2026). Loaded by config.js; kitchen only.
   On the kitchen iPads nobody can change a par: the Par box on Count the kitchen is read-only, and the Par box for a new
   inventory item is switched off. Pars are set by a manager on Colette's Board, where the same pages stay editable (this file
   does nothing when the board runs inside Colette's Board). On hand counts, units and everything else work as before. */
(function () {
  if (window.__vicioParLock || window.VICIO_BOARD !== 'kitchen') return;
  window.__vicioParLock = true;
  var inColette = false; try { inColette = !!(window.parent && window.parent !== window); } catch (e) { inColette = true; }
  if (inColette) return;
  var SEL = '[data-ppar],[data-inv-new="par"]';
  function lock() {
    Array.prototype.forEach.call(document.querySelectorAll(SEL), function (el) {
      if (el.dataset.locked) return; el.dataset.locked = '1';
      el.readOnly = true; el.tabIndex = -1; el.setAttribute('aria-readonly', 'true');
      el.title = 'Pars are set by a manager on Colette\u2019s Board';
      if (el.matches('[data-inv-new="par"]')) { el.disabled = true; el.placeholder = 'Par: manager'; }
      el.dataset.v0 = el.value;
    });
  }
  ['input', 'change', 'keydown', 'paste', 'beforeinput'].forEach(function (ev) {
    window.addEventListener(ev, function (e) {
      var t = e.target; if (!t || !t.matches || !t.matches(SEL)) return;
      if (ev === 'keydown' && (e.key === 'Tab' || e.key === 'Escape')) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (t.dataset.v0 != null && t.value !== t.dataset.v0) t.value = t.dataset.v0;
    }, true);
  });
  var st = document.createElement('style');
  st.textContent = '[data-ppar][readonly]{background:transparent!important;border-color:transparent!important;color:inherit;pointer-events:none;text-align:right;font-weight:600}[data-inv-new="par"][disabled]{opacity:.5}';
  document.head.appendChild(st);
  (function start() {
    if (typeof render !== 'function' || !document.getElementById('view')) return setTimeout(start, 200);
    var r0 = render; render = function () { var out = r0.apply(this, arguments); try { lock(); } catch (e) {} return out; };
    try { lock(); } catch (e) {}
    setInterval(function () { try { lock(); } catch (e) {} }, 1500);
  })();
})();
