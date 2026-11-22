/* Vicio FOH: the new bar count (Eric, Nov 21 2026), rebuilt from photos of the back bar. Loaded by config.js; FOH only.
   The bar count is now the top shelf, shelf 2 and the speed rail, each in the order the bottles sit (top shelf and shelf 2
   left to right; the speed rail starting with Chipotle at the top right). Bottles not on the shelves or the rail are off the
   count. Wine, bubbly and beer are unchanged. Names that match the old count keep the same item id, so last week's numbers
   and pars still line up (Verás and Amarás give the same ids as the old "Vera's" and "Amara's"). House batches on the rail are
   counted like bottles, in tenths. */
(function () {
  if (window.__vicioBarCount || window.VICIO_BOARD !== 'foh') return;
  window.__vicioBarCount = true;
  var NEW = [
    ['Top shelf', ['Jack Daniel\u2019s', 'Jameson', 'Crown Royal', 'Johnnie Walker Black', 'Campari', 'Aperol', 'Camazotz Oaxacan Rum', 'Belvedere', 'The Botanist Gin', 'G4 Blanco', 'G4 Reposado', 'Terralta Blanco', 'Tequila Ocho Plata', 'Ver\u00e1s', 'Amar\u00e1s', 'Sotol La Higuera']],
    ['Shelf 2', ['Bulleit 95 Rye', 'Bulleit Bourbon', 'Wild Turkey 101 Rye', 'Hennessy', 'Maker\u2019s Mark', 'Captain Morgan', 'Johnnie Walker Red', 'Fireball', 'Nikka', 'Uruapan Charanda Blanco', 'Tanqueray', 'Hibiki', 'Riablo Sotol Spiced Pineapple', 'Lost Lore Blanco', 'Suerte Reposado', 'Casamigos Reposado', '1800 Blanco', 'Jose Cuervo Gold', 'Jose Cuervo Silver']],
    ['Speed rail, top', ['Chipotle tequila (batch)', 'Green Tea (batch)', 'Vegas Bomb (batch)', 'Nolet\u2019s Silver', 'Evan Williams', 'Tito\u2019s', 'Rayu Joven', 'Real de Valle Blanco', 'La Vieja Taberna', 'Tequila mix (batch)']],
    ['Speed rail, bottom', ['De Kuyper Watermelon', 'De Kuyper Blue Cura\u00e7ao', 'De Kuyper Peachtree', 'Agavales Spicy Tamarindo', 'Potter\u2019s Triple Sec', 'Malibu', 'Bacardi', 'Guava Goddess (batch)', 'Mexican Candy (batch)']]];
  function apply() {
    if (typeof BARINV === 'undefined' || typeof INVITEMS === 'undefined' || typeof slug !== 'function') return false;
    if (apply.done) return true;
    var keep = BARINV.filter(function (g) { return !/^(liquor|liqueurs)$/i.test(g[0]) && !NEW.some(function (n) { return n[0] === g[0]; }); });
    BARINV.length = 0; NEW.concat(keep).forEach(function (g) { BARINV.push(g); });
    INVITEMS.length = 0;
    BARINV.forEach(function (g) { g[1].forEach(function (n) { INVITEMS.push([slug(n), n, g[0]]); }); });
    apply.done = true; return true;
  }
  (function start() {
    if (!apply() || typeof render !== 'function') return setTimeout(start, 200);
    render();
  })();
})();
