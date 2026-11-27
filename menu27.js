/* Vicio FOH: the food menu as printed Nov 27 2026 (Eric's "Vicio Food Menu Front / Back nov 27th"). Loaded by config.js;
   FOH only. Replaces the food sections of the board's menu (the drink sections are left alone), so the Menu page, search and
   everything that reads the menu match the printed menu.
   New: Wings N Things (Lil Baddies, Wings, dry rubs and sauces), extra sauce prices, The Hot Honey and The Naked Chick
   sandwiches, Make it Tóxica +$1, Smash Burgers (Oklahoma, Mushroom, Green Chile Bacon) and Dulce Vicio (pizookie).
   Build your own: meats $3 each, ricotta $3, other toppings $2 each. Carne Asada Fries are off.
   Dishes that were renamed (Buffalo Baddies is now Lil Baddies, Fried Pickles is Fried Pickle Spears, and so on) keep their
   "How to sell it" and expo notes through ALIAS. */
(function () {
  if (window.__vicioMenu27 || window.VICIO_BOARD !== 'foh') return;
  window.__vicioMenu27 = true;
  var SAUCES = 'Dry rubs: spicy dry rub, lemon pepper. Sauces: buffalo, garlic parm, salsa macha, creamy serrano lime, red chile BBQ, hot honey.';
  var FOOD = [
    ['Starters', '', [
      ['Garlic Bread', '$7', '', 'Fresh baked garlic butter focaccia, served with red sauce'],
      ['Seasoned Waffle Fries', '$7', '', 'Served with ketchup'],
      ['Fried Pickle Spears', '$7', '', 'Hand breaded pickle spears, served with ranch. Order of 5'],
      ['Green Chile Mozz Sticks', '$11', 'House made', 'Giant mozz sticks stuffed with green chile, parm and garlic. Order of 3']]],
    ['Wings N Things', 'Pick a dry rub or sauce', [
      ['Lil Baddies', '$9', 'New', 'Crispy boneless chicken bites tossed in the guest\u2019s favorite sauce or dry rub, served with ranch. ' + SAUCES],
      ['Wings', '$13', '', '6 bone-in wings tossed in the guest\u2019s choice of sauce or dry rub, served with ranch. ' + SAUCES]]],
    ['Pizzas: classics', '8\u00d710 Detroit style', [
      ['Margherita', '$16', 'Classic', 'Red sauce, mozzarella, shaved parmesan, basil, olive oil'],
      ['Pepperoni', '$18', 'Classic', 'Red sauce, mozzarella, cupping pepperoni, parm'],
      ['The Mixtape', '$17', 'Classic', 'Red sauce, half Margherita, half Pepperoni'],
      ['Sausage & Pep', '$20', 'Classic', 'Red sauce, mozzarella, cupping pepperoni, spicy sausage'],
      ['Triple Pepperoni', '$25', 'Classic', 'Half pound of cupping pepperoni, red sauce, mozzarella, shaved parmesan']]],
    ['Pizzas: signature pies', '8\u00d710 Detroit style', [
      ['El Infierno', '$22', 'Very spicy', 'Red sauce, mozzarella, ricotta, cupping pepperoni, Scorpion hot honey'],
      ['La Pi\u00f1a Brava', '$22', 'Specialty', 'Red sauce, mozzarella, cupping pepperoni, roasted pineapple, roasted jalape\u00f1os, hot honey'],
      ['La G\u00fcera', '$23', 'No red sauce', 'Garlic parm butter, mozzarella, spicy sausage, ricotta, shaved parm, chile flake'],
      ['La Cochina', '$23', 'House favorite', 'Mozzarella, carnitas, pickled red onions, queso fresco, cilantro, onions, salsa macha'],
      ['Buffalo Chicken', '$23', 'No red sauce', 'Crispy fried chicken, mozzarella, buffalo sauce, gorgonzola, ranch']]],
    ['Build your own', '$16 base', [
      ['Build Your Own Pizza', '$16', '8\u00d710 Detroit style', 'Meats $3 each: pepperoni, spicy sausage, bacon, carnitas. Ricotta $3. Other toppings $2 each: red onions, onions and cilantro, black olives, mushrooms, green chile, roasted pineapple, roasted jalape\u00f1os, pickled red onions.']]],
    ['Extra sauce', '', [
      ['Ranch', '$1', '', ''], ['Lots of Ranch', '$5', '', ''], ['Red Sauce', '$1', '', ''], ['Creamy Serrano Lime', '$1', '', ''],
      ['Salsa Macha', '$2', '', ''], ['Buffalo Sauce', '$1', '', ''], ['Garlic Butter', '$2', '', '']]],
    ['The Bad Chick', 'Sandwiches on a sweet bun, served with fries and ranch', [
      ['The Bad Chick', '$19', 'Signature', 'Two crispy chicken thighs, coleslaw, pickles, buffalo sauce, sweet bun. Make it T\u00f3xica +$1'],
      ['The Basic Chick', '$17', '', 'Crispy chicken thigh, coleslaw, pickles, buffalo sauce, sweet bun'],
      ['The Hot Honey', '$17', 'New', 'Crispy chicken thigh, coleslaw, pickles, hot honey, sweet bun'],
      ['The Naked Chick', '$17', 'New', 'Flame-grilled marinated chicken thigh, tomato, lettuce, pickles, chipotle mayo, sweet bun'],
      ['La T\u00f3xica', '$18', 'Spicy', 'Extra spicy crispy chicken thigh, roasted jalape\u00f1os, coleslaw, pickles, buffalo sauce, a T\u00f3xica heart (crush it), sweet bun'],
      ['The Side Chicks', '$16', '', '3 crispy chicken tenders, spiced, with fries and ranch']]],
    ['Smash burgers', 'Served with fries', [
      ['Oklahoma Smash', '$17', 'New', 'Two smashed patties, cheddar, lots of onions, chipotle mayo'],
      ['Mushroom Smash', '$18', 'New', 'Two smashed patties, mushrooms saut\u00e9ed in garlic butter, grilled onions, gorgonzola, chipotle mayo, sweet bun'],
      ['Green Chile Bacon Smash', '$19', 'New', 'Two smashed patties, pepper jack, lots of onions, bacon, roasted green chile, chipotle mayo']]],
    ['Dessert', '', [
      ['Dulce Vicio (Pizookie)', '$11', 'New', 'Warm brown butter chocolate chip cookie baked in a cast-iron skillet, topped with shaved Abuelita Mexican chocolate and whipped cream']]]
  ];
  var ALIAS = { 'Lil Baddies': 'Buffalo Baddies', 'Fried Pickle Spears': 'Fried Pickles', 'Sausage & Pep': 'Sausage and Pep', 'Buffalo Chicken': 'Buffalo Chicken Pizza', 'The Basic Chick': 'The Basic Chick Sandwich', 'La T\u00f3xica': 'La Toxica' };
  /* Notes that changed with the dish. */
  var FIX = { 'Lil Baddies': [['Boneless buffalo bites with ranch. Easy to share, no mess.', 'Boneless bites in any sauce or dry rub, with ranch. Easy to share, no mess.']] };
  var OLD = /^(pizzas|build your own|appetizers|starters|wings|the bad chick|smash|dessert|extra sauce)/i;
  function apply() {
    if (typeof MENU === 'undefined' || !Array.isArray(MENU)) return false;
    var keep = MENU.filter(function (g) { return !OLD.test(g[0]); });
    MENU.length = 0; FOOD.concat(keep).forEach(function (g) { MENU.push(g); });
    try { if (typeof GUEST !== 'undefined') Object.keys(ALIAS).forEach(function (n) { if (!GUEST[n] && GUEST[ALIAS[n]]) GUEST[n] = GUEST[ALIAS[n]]; }); } catch (e) {}
    return true;
  }
  function wrapPreview() {
    if (typeof foodPreview !== 'function' || foodPreview.__m27) return;
    var f0 = foodPreview;
    foodPreview = function (name) {
      var old = ALIAS[name]; if (!old) return f0.apply(this, arguments);
      var row = null; MENU.forEach(function (g) { g[2].forEach(function (r) { if (r[0] === name) row = r; }); });
      if (!row) return f0.apply(this, arguments);
      row[0] = old; var out; try { out = f0.call(this, old); } finally { row[0] = name; }
      var e = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
      out = String(out).split(e(old)).join(e(name));
      try { var g = GUEST[old]; if (g && g.sum && row[3]) out = out.split(e(g.sum)).join(e(row[3])); } catch (x) {}
      (FIX[name] || []).forEach(function (f) { out = out.split(e(f[0])).join(e(f[1])); });
      return out;
    };
    foodPreview.__m27 = true; foodPreview.__simple = f0.__simple;
  }
  (function start() {
    if (!apply() || typeof render !== 'function') return setTimeout(start, 150);
    var n = 0, t = setInterval(function () { try { wrapPreview(); } catch (e) {} if (++n > 40) clearInterval(t); }, 250);
    try { if (ui && /^f:/.test(ui.mSel || '') && !MENU.some(function (g) { return g[2].some(function (r) { return 'f:' + r[0] === ui.mSel; }); })) ui.mSel = 'f:Margherita'; } catch (e) {}
    render();
  })();
})();
