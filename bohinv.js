/* Vicio BOH: the kitchen Inventory page in two tabs, Prepped and Whole product (Eric, Nov 22 2026). Loaded by config.js;
   kitchen only.
   - Prepped: the prep count (the quick count by station of what we make and fill), with a photo of each item in a
     stainless ramekin next to its name. The photos are Eric's set of 34 (01 pizza sauce ... 34 bacon). They live in the
     shared sheet (prepics/<01-34> = { src }), put there by Colette's Board, which also carries them built in. Items Eric
     added himself get a photo when their name matches one.
   - Whole product: the Saturday count of unopened product by area (Basement, Storage, Restaurant, Centrico order count,
     Beer cooler) that was already on this page, unchanged.
   The page opens on Prepped. extras.js draws the Whole product view; this file wraps whatever view is in place, so it
   keeps working if that view changes. */
(function () {
  if (window.__vicioBohInv || window.VICIO_BOARD !== 'kitchen') return;
  window.__vicioBohInv = true;
  var MAP = { p_sauce: '01', p_cheese: '02', p_parm: '03', p_ricotta: '04', p_bleu: '05', p_queso: '06', p_pep: '07', p_sausage: '08', p_friedchx: '09', p_pineapple: '10',
    p_jalapeno: '11', p_jal_s: '11', p_onion: '12', p_redonion: '13', p_onions: '14', p_greenchile: '15', p_olives: '16', p_mushrooms: '17', p_cilantro: '18', p_basil: '19',
    p_oliveoil: '20', p_hothoney: '21', p_scorpion: '22', p_scorpion_s: '22', p_bmranch: '23', p_ranch: '23', p_buff: '24', p_buff_s: '24', p_gp: '25', p_gpbutter: '26',
    p_rub: '27', p_serrano: '28', p_matcha: '29', p_slaw: '30', p_pickles: '31', p_carnitas: '32', p_birria: '33', p_bacon: '34' };
  var NAMES = [[/pizza sauce/i, '01'], [/^(?!.*stick).*mozz/i, '02'], [/shaved parm/i, '03'], [/ricotta/i, '04'], [/bleu|blue cheese/i, '05'], [/queso/i, '06'], [/pepperoni/i, '07'], [/sausage/i, '08'],
    [/fried chicken/i, '09'], [/pineapple/i, '10'], [/^(?!.*popper).*jalape/i, '11'], [/pickled red onion/i, '12'], [/red onion/i, '13'], [/^onion/i, '14'], [/^(?!.*(stick|mozz)).*green chile/i, '15'], [/olive oil/i, '20'],
    [/olive/i, '16'], [/mushroom/i, '17'], [/cilantro/i, '18'], [/basil/i, '19'], [/scorpion/i, '22'], [/hot honey/i, '21'], [/ranch/i, '23'], [/buffalo/i, '24'],
    [/garlic parm.*butter/i, '26'], [/garlic parm/i, '25'], [/rub/i, '27'], [/serrano/i, '28'], [/macha/i, '29'], [/slaw/i, '30'], [/^(?!.*(spear|fried)).*pickle/i, '31'], [/carnitas/i, '32'], [/birria/i, '33'], [/bacon/i, '34']];
  var PICS = {}; if (window.__VICIO_PREPICS) Object.keys(window.__VICIO_PREPICS).forEach(function (k) { PICS[k] = window.__VICIO_PREPICS[k]; });
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function picFor(id, name) {
    var k = MAP[id]; if (!k) { var hit = NAMES.filter(function (x) { return x[0].test(name || ''); })[0]; k = hit && hit[1]; }
    return k && PICS[k] ? PICS[k] : null;
  }
  function tabs() {
    var t = ui.kinvTab === 'whole' ? 'whole' : 'prep';
    return '<div class="x-ktabs" role="tablist"><button type="button" role="tab" aria-selected="' + (t === 'prep') + '" class="' + (t === 'prep' ? 'on' : '') + '" data-ktab="prep">Prepped</button>' +
      '<button type="button" role="tab" aria-selected="' + (t === 'whole') + '" class="' + (t === 'whole' ? 'on' : '') + '" data-ktab="whole">Whole product</button></div>';
  }
  function photos() {
    Array.prototype.forEach.call(document.querySelectorAll('input[data-poh]'), function (inp) {
      var row = inp.closest('tr'), cell = row && row.cells[0]; if (!cell || cell.querySelector('.x-kpic')) return;
      var src = picFor(inp.dataset.poh, cell.textContent.trim()); if (!src) return;
      cell.classList.add('x-kcell'); cell.insertAdjacentHTML('afterbegin', '<img class="x-kpic" src="' + src + '" alt="">');
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-ktab]'); if (!b) return;
    e.preventDefault(); e.stopPropagation(); ui.kinvTab = b.dataset.ktab; window.scrollTo(0, 0); render();
  }, true);
  var st = document.createElement('style');
  st.textContent = '.x-ktabs{display:inline-flex;gap:4px;padding:4px;border-radius:14px;background:var(--bg,#000);border:1px solid var(--line,#2E2E34);margin:0 0 14px}' +
    '.x-ktabs button{min-height:48px;padding:0 22px;border-radius:10px;border:0;background:none;color:var(--muted,#A1A1AA);font:700 16px system-ui,-apple-system,sans-serif;cursor:pointer}.x-ktabs button.on{background:var(--cherry,#8B1E1E);color:#fff}' +
    'td.x-kcell{display:flex;align-items:center;gap:12px;min-height:64px}.x-kpic{flex:none;width:56px;height:56px;border-radius:50%;object-fit:cover;box-shadow:0 1px 3px rgba(0,0,0,.4)}' +
    '';
  document.head.appendChild(st);
  var BASE = null;
  function view() { return tabs() + (ui.kinvTab === 'whole' ? (BASE ? BASE() : '') : prepCount()); }
  function hook() { if (VIEWS.inventory !== view) { BASE = VIEWS.inventory; VIEWS.inventory = view; if (ui.tab === 'inventory') render(); } }
  (function start() {
    if (typeof render !== 'function' || typeof VIEWS === 'undefined' || !VIEWS.inventory || typeof prepCount !== 'function') return setTimeout(start, 200);
    hook(); var n = 0, t = setInterval(function () { hook(); if (++n > 60) clearInterval(t); }, 500);
    try { watchCol('prepics', function (o) { var k = 0; Object.keys(o || {}).forEach(function (id) { var src = o[id] && o[id].src; if (src && /^data:image\//.test(src) && PICS[id] !== src) { PICS[id] = src; k++; } }); if (k) render(); }); } catch (e) {}
    var r0 = render; render = function () { try { hook(); } catch (e) {} var out = r0.apply(this, arguments); try { photos(); } catch (e) {} return out; };
    render();
  })();
})();
