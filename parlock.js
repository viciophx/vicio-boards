/* Vicio kitchen board: pars are locked (Eric, Nov 21 2026). Loaded by config.js; kitchen only.
   On the kitchen iPads nobody can change a par: the Par box on Count the kitchen is read-only, and the Par box for a new
   inventory item is switched off. Pars are set by a manager on Colette's Board, where the same pages stay editable (this file
   does nothing when the board runs inside Colette's Board). On hand counts, units and everything else work as before.
   A locked par shows in red with a small lock (Eric). */
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
      if (el.matches('[data-ppar]') && el.parentNode && !el.parentNode.querySelector('.x-plk')) { el.parentNode.classList.add('x-ptd'); el.insertAdjacentHTML('beforebegin', '<span class="x-plk"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span>'); }
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
  st.textContent = '[data-ppar][readonly]{background:transparent!important;border-color:transparent!important;color:var(--cherry,#8B1E1E)!important;-webkit-text-fill-color:var(--cherry,#8B1E1E);opacity:1;pointer-events:none;text-align:right;font-weight:700;width:56px}.x-ptd{white-space:nowrap}.x-plk{color:var(--cherry,#8B1E1E);display:inline-flex;vertical-align:middle;margin-right:2px}[data-inv-new="par"][disabled]{opacity:.5}';
  document.head.appendChild(st);
  (function start() {
    if (typeof render !== 'function' || !document.getElementById('view')) return setTimeout(start, 200);
    var r0 = render; render = function () { var out = r0.apply(this, arguments); try { lock(); } catch (e) {} return out; };
    try { lock(); } catch (e) {}
    setInterval(function () { try { lock(); } catch (e) {} }, 1500);
  })();
})();
